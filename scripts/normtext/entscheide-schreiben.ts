// ─── Korpus schreiben (geteilt: Live-Generator, Offline-Seed, Tests) ─────────
//
// Schreibt aus einer Auswahl EntscheidSnapshots die public/rechtsprechung-Dateien:
// je Entscheid eine Datei + register.json (Manifest) + norm-index.json +
// erfasste-keys.generated.ts (interne Verlinkung). Eine Stelle, kein Duplikat (§5).

import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kuerzeRegeste, normalisiereRegeste } from '../../src/lib/rechtsprechung/register';
import type { EntscheidSnapshot, EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';
import type { BrowseEntscheid, EntscheidManifest, RichterRef, RichterRegister } from '../../src/lib/rechtsprechung/register';
import { parseBesetzung, kanonisiere, bereinigeBesetzungsFreitext, type KanonEintrag } from '../../src/lib/rechtsprechung/besetzung';
import type { EntscheidRef, LeitfallRef, LeitfallShard } from '../../src/lib/rechtsprechung/norm-index';
import { extrahiereStatutRefs } from '../../src/lib/rechtsprechung/zitat-extraktion';
import { minteEcliFuerSnapshot } from '../../src/lib/rechtsprechung/ecli';
import { normKeyFuerAbk } from './entscheide-mapping';

export function keyVon(snap: EntscheidSnapshot): { key: string; datei: string } {
  const docketSafe = snap.id.split('/').pop()!;
  return { key: `${snap.gericht}_${docketSafe}`, datei: `${snap.id}.json` };
}

/** Gekürzte Regeste aus dem geglätteten Text (Single Source für proNorm + Artikel-Index, §5). */
function regesteKurzVon(snap: EntscheidSnapshot): string | null {
  return snap.regeste ? kuerzeRegeste(normalisiereRegeste(snap.regeste.text)) : null;
}

/** EntscheidRef aus einem Snapshot (identischer Inhalt wie im proNorm-Build). */
function refVon(snap: EntscheidSnapshot): EntscheidRef {
  const { key } = keyVon(snap);
  return {
    key, zitierung: snap.zitierung, regesteKurz: regesteKurzVon(snap), datum: snap.datum,
    leitcharakter: snap.leitcharakter, gericht: snap.gericht, kanton: snap.kanton,
  };
}

// Deckel je Artikel: «Leitfälle», keine Vollliste — bremst die Artikel-Fan-out des
// norm-index.json (Budget-Tor in check-entscheide.ts). Bewusst kleiner als der
// Erlass-Deckel (12), weil eine Artikel-Ansicht die wenigen zentralen Fälle zeigt.
const LEITFAELLE_PRO_ARTIKEL = 8;

/**
 * Totale Ordnung der Leitfälle je Artikel (§2-deterministisch): gewicht ↓, dann
 * Leitentscheid vor Routine, dann Datum ↓, dann key (totaler Tiebreaker) — build-
 * pfad-unabhängig stabil. EINE Quelle (§5): sowohl baueArtikelIndex als auch die
 * V1b-Shard-Regeneration (backe-rangliste-shards.ts) sortieren damit, sonst driftete
 * die E4-Neusortierung von der Ur-Ordnung ab.
 */
export function vergleicheLeitfaelle(a: LeitfallRef, b: LeitfallRef): number {
  return b.gewicht - a.gewicht
    || (a.leitcharakter === 'leitentscheid' ? 0 : 1) - (b.leitcharakter === 'leitentscheid' ? 0 : 1)
    || (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0)
    || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
}

/**
 * Kanonisches Zitat-Token für den Zitier-Abgleich (Entscheid ↔ Entscheid), §2.
 * Vereinheitlicht BEIDE Seiten (Selbst-Identität eines Snapshots UND ein rohes
 * `zitierteEntscheide`-Element) auf dieselbe Normalform, damit «BGE 150 I 17»,
 * «150 I 17» und die aza-Nennung «1C_641/2022» sicher zusammenfinden:
 *   • BGE  → 'BGE:<band>:<abt>:<seite>'   (Präfix BGE/ATF/DTF optional)
 *   • aza  → 'AZA:<abt>:<nr>:<jahr>'      ('1C_641/2022', '1P.179/1994', '5A 33/2004')
 * Kein Treffer → null (nicht abgleichbar).
 */
export function kanonZitat(roh: string): string | null {
  const t = String(roh).trim().toUpperCase();
  // Abteilung inkl. optionalem Suffix der historischen Abteilungen «Ia»/«Va»
  // ([AB]?, weil t bereits gross ist) — konsistent zu zitat-extraktion.ts; beide
  // Abgleich-Seiten laufen durch kanonZitat, also intern eindeutig (Bug-Check W3).
  const bge = /(?:BGE|ATF|DTF)?\s*(\d{1,3})\s+([IVX]{1,4}[AB]?)\s+(\d{1,4})\b/.exec(t);
  if (bge) return `BGE:${bge[1]}:${bge[2]}:${bge[3]}`;
  const aza = /\b(\d[A-Z])[._ ](\d{1,6})[/_](\d{4})\b/.exec(t);
  if (aza) return `AZA:${aza[1]}:${aza[2]}:${aza[3]}`;
  return null;
}

/** Zitat-Token, unter denen ein Snapshot von ANDEREN Entscheiden genannt werden kann. */
function selbstTokens(snap: EntscheidSnapshot): string[] {
  const out = new Set<string>();
  for (const roh of [snap.bgeReferenz, snap.nummer, snap.azaUrteil?.aktenzeichen]) {
    if (!roh) continue;
    const t = kanonZitat(roh);
    if (t) out.add(t);
  }
  return [...out];
}

/**
 * Kürzel, die föderal UND kantonal existieren und pro Zitat NICHT sicher
 * unterscheidbar sind → aus dem föderalen Bund-Artikel-Index ausgeschlossen
 * (§1 Korrektheit vor Abdeckung, §8 keine falsche Bundesrechts-Zuordnung).
 *
 * «StG» = eidg. Stempelsteuergesetz (SR 641.10) ODER kantonales Steuergesetz
 * (StG/BE, StG/ZH, StG/SG …). Der Kantons-Suffix steht nur in der Regeste-
 * Erstnennung, nicht bei jeder Fliesstext-Nennung; kantonale Grundstückgewinn-/
 * Einkommenssteuer-Fälle (z.B. BGE 152 II 116, StHG-Kontext) tragen GAR keinen
 * Suffix — eine Suffix-Heuristik greift also zu kurz. Daher konservativ ganz
 * weglassen. Preis: die wenigen echten eidg. Stempelsteuer-Leitfälle (z.B.
 * BGE 151 II 884) fehlen bewusst, bis ein positiver Bund-Signal-Diskriminator
 * gebaut ist. Befund: Gegenprüfung W3 (Opus, 2.7.2026) — 5 kant. Falsch-Positive.
 *
 * Deckt sich mit OCLs Design: deren kuratierte Bund-Whitelist `_SR_NUMBER_MAP`
 * (mcp_server.py:3810, Abkürzung→SR-Nummer) listet die unzweideutigen Bundes-
 * gesetze (BV/OR/ZGB/StGB/… bis DBG) und lässt «StG»/StHG bewusst WEG.
 */
const AMBIGE_BUND_KANTON_KUERZEL: ReadonlySet<string> = new Set(['STG']);

/** (Register-key, Artikel-Token)-Paare, die ein Snapshot zitiert — 'OR/41'-Form, deduppt. */
function artikelSchluesselVon(snap: EntscheidSnapshot): Set<string> {
  const out = new Set<string>();
  // Roh-statutes (OCL statutes[]) tragen das Artikel-Token; zusammenfügen und einmal
  // extrahieren (extrahiereStatutRefs dedupliziert über die Normalform).
  for (const ref of extrahiereStatutRefs((snap.zitierteNormen ?? []).join('\n'))) {
    const rk = normKeyFuerAbk(ref.gesetz);
    if (!rk || AMBIGE_BUND_KANTON_KUERZEL.has(rk)) continue;
    out.add(`${rk}/${ref.artikel}`);
  }
  return out;
}

/**
 * Artikel-Ebene des Norm-Index (W3), deterministisch (§2). Nur Bundesgerichts-
 * Entscheide (wie proNorm — die Panel-Überschrift lautet «Bundesgerichtsentscheide
 * zu Art. X»; eidg./kantonale Gerichte gehören nicht darunter, §8). Für jeden
 * Artikel A ist die «topische Menge» S_A = {Bundesgerichtsentscheide, die A zitieren};
 * `gewicht` eines Falls d = Anzahl ANDERER Fälle aus S_A, die d nennen (In-degree
 * INNERHALB von S_A). Rang: gewicht ↓, dann Leitentscheid vor Routine, dann Datum ↓,
 * dann key (totaler Tiebreaker) — build-pfad-unabhängig stabil.
 */
export function baueArtikelIndex(auswahl: EntscheidSnapshot[]): Record<string, LeitfallRef[]> {
  const bg = auswahl.filter((s) => s.gerichtstyp === 'bundesgericht');

  // Token → corpus-key (erste Nennung gewinnt; §2-deterministisch bei Eingabefolge).
  const tokenZuKey = new Map<string, string>();
  for (const s of bg) {
    const { key } = keyVon(s);
    for (const tok of selbstTokens(s)) if (!tokenZuKey.has(tok)) tokenZuKey.set(tok, key);
  }

  const refByKey = new Map<string, EntscheidRef>();
  const artikelVon = new Map<string, Set<string>>();   // key → {'OR/41', …}
  const zitiertKeys = new Map<string, Set<string>>();   // key → {zitierte corpus-keys}
  for (const s of bg) {
    const { key } = keyVon(s);
    refByKey.set(key, refVon(s));
    artikelVon.set(key, artikelSchluesselVon(s));
    const cited = new Set<string>();
    for (const z of s.zitierteEntscheide ?? []) {
      const tok = kanonZitat(z);
      if (!tok) continue;
      const ck = tokenZuKey.get(tok);
      if (ck && ck !== key) cited.add(ck);   // Selbstzitat nie zählen
    }
    zitiertKeys.set(key, cited);
  }

  // Entscheide je Artikel gruppieren (jeder Fall genau einmal je Artikel).
  const proArtikel = new Map<string, string[]>();
  for (const [key, arts] of artikelVon) {
    for (const a of arts) {
      const liste = proArtikel.get(a) ?? (proArtikel.set(a, []), proArtikel.get(a)!);
      liste.push(key);
    }
  }

  const out: Record<string, LeitfallRef[]> = {};
  for (const artikel of [...proArtikel.keys()].sort()) {   // stabile Schlüsselfolge
    const keys = proArtikel.get(artikel)!;
    const inSet = new Set(keys);
    const gewicht = new Map<string, number>(keys.map((k) => [k, 0]));
    // Topische In-degree: nur Zitierungen von d' ∈ S_A auf d ∈ S_A zählen.
    for (const d2 of keys) {
      for (const c of zitiertKeys.get(d2) ?? []) {
        if (inSet.has(c)) gewicht.set(c, (gewicht.get(c) ?? 0) + 1);
      }
    }
    const refs: LeitfallRef[] = keys.map((k) => ({ ...refByKey.get(k)!, gewicht: gewicht.get(k) ?? 0 }));
    refs.sort(vergleicheLeitfaelle);
    out[artikel] = refs.slice(0, LEITFAELLE_PRO_ARTIKEL);
  }
  return out;
}

/**
 * Schaufenster-Shards (Weiche B, §10(6)/§11.2): proNormArtikel je Erlass in eine
 * eigene Projektion splitten. EINE Quelle (proNormArtikel), Shards = zusätzliche
 * Projektion — das grosse norm-index.json bleibt unverändert (kein Bruch bestehender
 * Konsumenten). Nur Erlasse MIT Artikel-Treffern bekommen einen Shard. Der Schlüssel
 * im Shard ist das blosse Artikel-Token (der 'REGISTERKEY/'-Präfix steckt im Dateinamen).
 * Deterministisch (§2): Token-Schlüssel sortiert, refs unverändert aus baueArtikelIndex.
 */
export function baueShards(proNormArtikel: Record<string, LeitfallRef[]>, datum: string): Map<string, LeitfallShard> {
  const proErlass = new Map<string, Record<string, LeitfallRef[]>>();
  for (const [ak, refs] of Object.entries(proNormArtikel)) {
    const schraeg = ak.indexOf('/');           // 'OR/41' → erlass 'OR', token '41'
    const erlass = ak.slice(0, schraeg);
    const token = ak.slice(schraeg + 1);
    (proErlass.get(erlass) ?? (proErlass.set(erlass, {}), proErlass.get(erlass)!))[token] = refs;
  }
  const out = new Map<string, LeitfallShard>();
  for (const erlass of [...proErlass.keys()].sort()) {
    const roh = proErlass.get(erlass)!;
    const proArtikel: Record<string, LeitfallRef[]> = {};
    for (const t of Object.keys(roh).sort()) proArtikel[t] = roh[t];   // stabile Token-Folge
    // gewichtQuelle:'alt' = un-gebackene, kuratierte In-degree. Die V1b-Regeneration
    // (backe-rangliste-shards.ts, braucht masse.db) hebt qualifizierende Erlasse auf
    // 'e4' — nach einem norm-index-Vollbau daher erneut fahren (wie V1c-Revisionen).
    out.set(erlass, { erzeugt: datum, erlass, gewichtQuelle: 'alt', proArtikel });
  }
  return out;
}

export function schreibeKorpus(auswahl: EntscheidSnapshot[], datum: string, root = process.cwd()): { anzahl: number; normBuckets: number; artikelBuckets: number; shards: number } {
  const PUB = join(root, 'public', 'rechtsprechung');
  const GENKEYS = join(root, 'src', 'lib', 'rechtsprechung', 'erfasste-keys.generated.ts');

  if (existsSync(PUB)) rmSync(PUB, { recursive: true, force: true });
  mkdirSync(PUB, { recursive: true });

  const manifest: BrowseEntscheid[] = [];
  const proNorm: Record<string, EntscheidRef[]> = {};

  // ── Richter-Projektion, Durchgang 1: Besetzungs-Freitexte korpusweit parsen ──
  // Die Kanonisierung («P. Schmid» → Patrizia oder Patrick?) ist nur mit Blick auf
  // den GANZEN Korpus entscheidbar, darum zwei Durchgänge (§2: deterministisch,
  // kein Raten). Der Snapshot bleibt unberührt — `rubrum.besetzung` ist und bleibt
  // der amtliche Freitext (SSoT); `richter[]` ist eine reine Projektion daraus.
  // Rubrum-Grenze säubern, BEVOR irgendetwas den Freitext liest oder schreibt.
  // Der Crawl hat in Einzelfällen über die Rubrum-Grenze hinaus eingesammelt —
  // BGE 151 IV 175 trug ein Aktenzeichen im Besetzungs-Feld («… Greffière: Mme
  // Kropf. 7B_950/2024et»). Folge war nicht bloss Rauschen: das ziffernhaltige
  // Segment fiel in den «kein sicherer Name»-Zweig, und die amtlich genannte
  // Gerichtsschreiberin fehlte vollständig. Das Aktenzeichen ist nie Teil der
  // Besetzung, der Schnitt also kein Informationsverlust (§5). Idempotent (§2) —
  // ein erneuter Lauf über bereits gesäuberte Snapshots ändert nichts.
  for (const snap of auswahl) {
    const ft = snap.rubrum?.besetzung;
    if (!ft) continue;
    const sauber = bereinigeBesetzungsFreitext(ft);
    if (sauber !== ft) snap.rubrum!.besetzung = sauber;
  }

  const besetzungRoh = new Map<string, ReturnType<typeof parseBesetzung>['richter']>();
  const kanonInput: KanonEintrag[] = [];
  for (const snap of auswahl) {
    const freitext = snap.rubrum?.besetzung ?? null;
    if (!freitext) continue;
    const res = parseBesetzung(freitext, { gericht: snap.gericht });
    if (!res.richter.length) continue;
    besetzungRoh.set(keyVon(snap).key, res.richter);
    for (const r of res.richter) {
      kanonInput.push({ slug: r.slug, nachSlug: r.nachSlug, givenSlug: r.givenSlug, givenAbk: r.givenAbk, name: r.name, raum: snap.kanton });
    }
  }
  const kanon = kanonisiere(kanonInput);
  const raumVon = new Map<string, string>(auswahl.map((s2) => [keyVon(s2).key, s2.kanton]));
  const richterCount = new Map<string, number>();

  for (const snap of auswahl) {
    const { key, datei } = keyVon(snap);
    const ziel = join(PUB, datei);
    mkdirSync(join(ziel, '..'), { recursive: true });
    // §7-Provenienz / additiver Build (Batch 3): jede Datei trägt das Abrufdatum
    // IHRES Inhalts (snap.abgerufen), nicht das globale Build-Datum. So bleibt ein
    // additiver Lauf (neue Gerichte ergänzen) für unveränderte Bestands-Snapshots
    // byte-gleich (kein Drift der 272 BGE, §6), während neue Einträge ihr echtes
    // Abrufdatum behalten. Für einen Vollbau (alle abgerufen==datum) verhaltensneutral.
    // ECLI deterministisch aus Gericht/Nummer/Datum minten (W0/R1 — schliesst die
    // Interop-Lücke; additives Identitätsfeld, lässt die abschnitte-`sha` unberührt).
    snap.ecli = minteEcliFuerSnapshot(snap);
    const wrap: EntscheidSnapshotDatei = { erzeugt: snap.abgerufen || datum, eintraege: [snap] };
    writeFileSync(ziel, JSON.stringify(wrap, null, 2) + '\n', 'utf8');

    // regesteKurz aus dem GEGLÄTTETEN Text (normalisiereRegeste strippt u.a. die
    // führende „Regeste"-Überschrift) — sonst stünde „Regeste" doppelt bzw. als Präfix.
    // BS-Tranche (Bauplan §4): das Portal publiziert keine Regeste, aber einen
    // amtlichen Betreff-Titel (rubrum.gegenstand) → als Karten-Kurzzeile ≤120 Z.
    // (regesteVorhanden bleibt false — der Titel ist Betreff, keine Regeste, §8).
    const regesteKurz = regesteKurzVon(snap)
      ?? (snap.quelle === 'gerichte-bs' && snap.rubrum?.gegenstand
        ? kuerzeRegeste(snap.rubrum.gegenstand, 120) : null);
    manifest.push({
      key, gericht: snap.gericht, gerichtName: snap.gerichtName, gerichtstyp: snap.gerichtstyp,
      kanton: snap.kanton, nummer: snap.nummer, bgeReferenz: snap.bgeReferenz, datum: snap.datum,
      // datumUnbekannt nur projizieren, wenn gesetzt (Bestand bleibt byte-gleich, §6).
      ...(snap.datumUnbekannt ? { datumUnbekannt: true as const } : {}),
      zitierung: snap.zitierung, leitcharakter: snap.leitcharakter,
      regesteVorhanden: !!snap.regeste, regesteKurz, sachgebiet: snap.sachgebiet, sprache: snap.sprache,
      normKeys: snap.normKeys, bestand: snap.bestand, kuratierung: snap.kuratierung,
      datei, quelle: snap.quelle, quelleUrl: snap.quelleUrl, fassungsToken: snap.fassungsToken,
      ...(() => {
        const roh = besetzungRoh.get(key);
        if (!roh?.length) return {};
        const raum = raumVon.get(key) ?? snap.kanton;
        const richter: RichterRef[] = roh.map((r) => ({
          s: kanon.map.get(`${raum}|${r.slug}`) ?? r.slug,
          r: r.rolle,
        }));
        // Jeder Slug kommt ins Register (damit Block B IMMER einen Anzeigenamen
        // auflösen kann — auch für reine Gerichtsschreiber:innen). Gezählt wird
        // aber nur die RICHTER-Mitwirkung: die Facette in Block B führt
        // Gerichtsschreiber:innen nicht als Richter (eigene Achse, später).
        for (const x of richter) {
          if (!richterCount.has(x.s)) richterCount.set(x.s, 0);
          if (x.r === 'gerichtsschreiber') continue;
          richterCount.set(x.s, richterCount.get(x.s)! + 1);
        }
        return { richter };
      })(),
    });

    // Getrennter Übersichts-Eintrag (Auftrag David 26.6.): das vollständige Urteil zu
    // einem BGE als EIGENE Karte, per Deep-Link auf die BGE-Detailseite mit Voll-Ansicht
    // — KEIN Daten-/Datei-Duplikat (datei:null), keine BGE-/Norm-Doppelzählung.
    if (snap.gericht === 'bge' && snap.azaUrteil && snap.auszugAbschnitte?.length) {
      manifest.push({
        key: `${key}__voll`, gericht: 'bger', gerichtName: snap.gerichtName, gerichtstyp: 'bundesgericht',
        kanton: 'CH', nummer: snap.azaUrteil.aktenzeichen, bgeReferenz: null, datum: snap.datum,
        zitierung: `BGer ${snap.azaUrteil.aktenzeichen}`, leitcharakter: 'routine',
        regesteVorhanden: false, regesteKurz: null, sachgebiet: snap.sachgebiet, sprache: snap.sprache,
        normKeys: [], bestand: snap.bestand, kuratierung: snap.kuratierung,
        datei: null, quelle: snap.quelle, quelleUrl: snap.azaUrteil.quelleUrl ?? snap.quelleUrl,
        fassungsToken: snap.fassungsToken,
        verweis: { zielKey: key, ansicht: 'voll', bgeReferenz: snap.bgeReferenz! },
      });
    }

    // C2-4 (präzisiert Batch 3): Der Norm→Entscheid-Index speist im UI die Liste
    // «Bundesgerichtsentscheide zu diesem Erlass» (norm-index.ts → GesetzLeser).
    // Darum NUR echte Bundesgerichts-Entscheide (gerichtstyp 'bundesgericht' =
    // bge/bger). Die neuen eidg. Gerichte (BVGer/BStGer/BPatGer) sind zwar canton
    // 'CH', aber NICHT das Bundesgericht → sie würden sonst fälschlich unter dieser
    // Überschrift erscheinen (§8). Für den Bestand identisch (alle CH-Einträge sind
    // bundesgericht). Kantonale/eidg. Entscheide bleiben über die Rubrik auffindbar.
    if (snap.gerichtstyp === 'bundesgericht') {
      for (const nk of snap.normKeys) {
        // Föderal/kantonal mehrdeutige Kürzel (StG) auch erlass-eben ausschliessen
        // (gleiche OCL-orientierte Entscheidung wie Artikel-Ebene; Gegenprüfung W3 #12).
        if (AMBIGE_BUND_KANTON_KUERZEL.has(nk)) continue;
        (proNorm[nk] ??= []).push({
          key, zitierung: snap.zitierung, regesteKurz, datum: snap.datum,
          leitcharakter: snap.leitcharakter, gericht: snap.gericht, kanton: snap.kanton,
        });
      }
    }
  }

  for (const nk of Object.keys(proNorm)) {
    // §2-Determinismus: `key` als TOTALER Tiebreaker — sonst hängt die Reihenfolge bei
    // Gleichstand (gleicher leitcharakter + gleiches Datum) von der Build-Eingabe-
    // reihenfolge ab (Vollbau [bge,bund,kanton] vs. additiver Lauf [Register-Reihen-
    // folge] erzeugten sonst denselben Inhalt in anderer Folge). So ist die norm-index
    // build-pfad-unabhängig stabil.
    proNorm[nk].sort((a, b) =>
      (a.leitcharakter === 'leitentscheid' ? 0 : 1) - (b.leitcharakter === 'leitentscheid' ? 0 : 1)
      || (a.datum < b.datum ? 1 : -1)
      || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    proNorm[nk] = proNorm[nk].slice(0, 12);
  }

  // Stabil (V8 TimSort): bei Datums-Gleichstand bleibt die Eingangsreihenfolge —
  // im additiven Lauf die committete Register-Folge, also kein Reorder des Bestands.
  manifest.sort((a, b) => (a.datum < b.datum ? 1 : a.datum > b.datum ? -1 : 0));
  const manifestObj: EntscheidManifest = { erzeugt: datum, entscheide: manifest };
  writeFileSync(join(PUB, 'register.json'), JSON.stringify(manifestObj, null, 2) + '\n', 'utf8');
  // ── Richter-Register (Slug → Anzeigename + Trefferzahl) ──
  // Eigene, schlanke Projektion: die Facette in Block B lädt sie lazy für Labels
  // und Zähler, damit das grosse register.json slug-schlank bleibt (§15).
  // Enthält ALLE Spruchkörper-Slugs (Namensauflösung ist total); `count` zählt nur
  // die Mitwirkung als RICHTER — ein Slug mit count 0 ist reine:r Gerichtsschreiber:in
  // und gehört nicht in die Richter-Facette (§8: keine falsche Rollen-Zuschreibung).
  // Deterministisch sortiert (Slug alphabetisch), damit Re-Läufe byte-gleich sind.
  const richterEintraege: RichterRegister['richter'] = {};
  for (const slug of [...richterCount.keys()].sort()) {
    richterEintraege[slug] = {
      name: kanon.anzeige.get(slug) ?? slug,
      count: richterCount.get(slug)!,
    };
  }
  const richterObj: RichterRegister = { erzeugt: datum, richter: richterEintraege };
  writeFileSync(join(PUB, 'richter.json'), JSON.stringify(richterObj, null, 2) + '\n', 'utf8');

  // Artikel-Ebene (W3) zusätzlich zur Erlass-Ebene — proNorm bleibt unverändert.
  const proNormArtikel = baueArtikelIndex(auswahl);
  writeFileSync(join(PUB, 'norm-index.json'), JSON.stringify({ erzeugt: datum, proNorm, proNormArtikel }, null, 2) + '\n', 'utf8');
  // Schaufenster-Shards je Erlass (Weiche B): zusätzliche Projektion, damit der
  // ArtikelLeser nur den Shard seines Erlasses lädt (§15.3). Trailing-Newline +
  // 2-Space wie norm-index.json/register.json (Rechtsprechungs-Serialisierung).
  const shards = baueShards(proNormArtikel, datum);
  const shardDir = join(PUB, 'norm-index');
  mkdirSync(shardDir, { recursive: true });
  for (const [erlass, shard] of shards) {
    writeFileSync(join(shardDir, `${erlass}.json`), JSON.stringify(shard, null, 2) + '\n', 'utf8');
  }

  const keys = manifest.map((m) => m.key).sort();
  writeFileSync(
    GENKEYS,
    `// AUTO-GENERIERT von scripts/normtext-entscheide.ts — nicht von Hand editieren.\n`
    + `// Erfasste Rechtsprechungs-Keys (interne Verlinkung, synchron konsultiert, Fahrplan 8.5).\n`
    + `export const ERFASST: ReadonlySet<string> = new Set([\n`
    + keys.map((k) => `  ${JSON.stringify(k)},`).join('\n')
    + (keys.length ? '\n' : '')
    + `]);\n`,
    'utf8',
  );

  return { anzahl: manifest.length, normBuckets: Object.keys(proNorm).length, artikelBuckets: Object.keys(proNormArtikel).length, shards: shards.size };
}

/**
 * Bestehenden Korpus von der Platte laden (additiver Build, Batch 3): liest das
 * committete register.json + jede zugehörige Snapshot-Datei (nicht-Verweis) IN
 * REGISTER-REIHENFOLGE. Damit kann ein Lauf neue Gerichte ergänzen, ohne den
 * Bestand über die Live-API neu zu ziehen — die 272 BGE + 4 FR bleiben byte-gleich
 * (§2/§6, kein Drift). Verweis-Einträge werden NICHT geladen (kein File; sie werden
 * in schreibeKorpus aus azaUrteil rekonstruiert). Die Reihenfolge wird bewahrt, damit
 * schreibeKorpus den stabil sortierten Manifest unverändert reproduziert.
 */
export function ladeBestandSnapshots(root = process.cwd()): EntscheidSnapshot[] {
  const PUB = join(root, 'public', 'rechtsprechung');
  const regPfad = join(PUB, 'register.json');
  if (!existsSync(regPfad)) return [];
  const manifest = JSON.parse(readFileSync(regPfad, 'utf8')) as EntscheidManifest;
  const out: EntscheidSnapshot[] = [];
  const gesehen = new Set<string>();
  for (const e of manifest.entscheide) {
    if (e.verweis || !e.datei) continue;
    const fp = join(PUB, e.datei);
    if (!existsSync(fp)) continue;
    const d = JSON.parse(readFileSync(fp, 'utf8')) as EntscheidSnapshotDatei;
    const snap = d.eintraege?.[0];
    if (snap && !gesehen.has(snap.id)) { gesehen.add(snap.id); out.push(snap); }
  }
  return out;
}
