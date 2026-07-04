// scripts/materialien/adapter-estv-mwst.ts
// E6a Stufe 1 · Etappe M1 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §3 Q1): Adapter ESTV-MWST-
// Webpublikationen (MWST-Infos + MWST-Branchen-Infos, gate.estv.admin.ch). Browserlos
// (§7 Build-Regel 5/6), GET-only, cookieless (live bestätigt 4.7.2026). Netz-Hülle
// (crawleEstvMwst) GETRENNT von den PUR-testbaren Extraktionsfunktionen (Muster M2–M4).
//
// robots-GOVERNANCE (§8): www.gate.estv.admin.ch hat robots.txt `Disallow: /`. Betrieb NUR mit
// Davids expliziter Freigabe (erteilt 4.7.2026 im Chat): Concurrency 1 (sequentiell), Delay
// zwischen ALLEN Requests, identifizierender User-Agent, minimaler Crawl (1 GET/Menü,
// 1 GET/Publikations-ToC, 1 GET/Ziffer, 1 Redirect-Check/Kurz-URL).
//
// PRIMÄRQUELLE (live-verifiziert 4.7.2026, JSF/PrimeFaces serverseitig gerendert):
//   Inventar:  pages/taxInfos/tableOfContent.xhtml?label=true    (Menü: 22 MWST-Infos «NN Titel»)
//              pages/sectorInfos/tableOfContent.xhtml?label=true (Menü: 27 Branchen-Infos)
//              Die nummernlose Publikation «Abkürzungen und Akronyme» (je Bereich 1) wird bewusst
//              ÜBERSPRUNGEN: Glossar ohne Nummern-Systematik-ID und ohne MWST-Praxis-Kanten.
//   je Publikation: pages/{bereich}/tableOfContent.xhtml?publicationId=P → PrimeFaces-Baum mit
//              relativen `cipherDisplay.xhtml?publicationId=P&componentId=C`-Ankern (Ziffern-Baum;
//              erster Knoten = coverType mit dem amtlichen Volltitel «MWST-Info 02 Steuerpflicht»).
//   je Ziffer: pages/{bereich}/cipherDisplay.xhtml?publicationId=P&componentId=C → HTML-Volltext
//              mit «Publiziert am: DD.MM.YYYY» + serverseitigen Fedlex-Ankern
//              (https://www.fedlex.admin.ch/eli/cc/2009/615/de#art_10) → Anker-Invertierung
//              via fedlex-anker.ts (artikelscharf, quelle='amtlich').
//   Kurz-URLs (stabil, §7c-Live-Link): /public/MI/{NN} bzw. /public/MBI/{NN} → 302 auf das ToC
//              mit der AKTUELLEN publicationId (live bestätigt: MI/02 → publicationId=1010164,
//              MBI/08 → 1014334). Die publicationId ist VOLATIL → nur quell_ids/url_basis, NIE ID.
//
// DRIFT-ARBITER (§3 Q1 / §0-A6): drift_token = sha256/16 über das komplette, NORMALISIERTE
// ToC-XHTML je Publikation (1 GET/Publikation). Normalisierung = JSF-ViewState-Werte genullt
// (volatil je Request — live bewiesen: zwei Fetches nach Normalisierung byte-gleich; ein Roh-Hash
// wäre Dauer-Drift). ABWEICHUNG von der Fahrplan-Formulierung, offengelegt: das Live-ToC trägt
// KEINE cipherKeyDates (empirisch 4.7.2026, 0 Treffer) — die Drift-Deckung läuft über die
// componentId-Wechsel im Baum (Neuversionen erhalten neue componentIds, live an MI 02 belegt:
// alte Ziffern ~1010xxx, spätere Revision 1268985). Die «Publiziert am»-Stichprobe je Ziffer
// bleibt Zweitsignal im Netz-Tor (fängt hypothetische In-place-Änderungen ohne ToC-Wechsel).
//
// SOFT-404 (Skill scraping-swiss-official-sources): Erfolg NIE am Status allein — Content-Type
// + Mindestlänge + Fehlerseiten-Marker; ungültige componentId liefert live echtes 404,
// Kurz-URL-Fehlgriffe 404 (live: BI/08), aber die JSF-App kann auch per 302 auf
// search.xhtml?messageKey=…error (HTTP 200) landen → url_effective-/Location-Prüfung.
//
// IDs (§2.6): stabile Nummern-Systematik via estv-mwst-ids.ts (ESTV-MWST-INFO-NN /
// ESTV-MWST-BRANCHEN-INFO-NN). BESTEHENDER KEY GEWINNT: ESTV-MWST-INFO-09 ist kuratiert im
// MATERIAL_REGISTER → der Adapter ÜBERSPRINGT ihn (Migration + Kanten = M5-Folge-Posten, gleiche
// Begründung wie M3/M4: die Norm-Kontext-Brücke liest bis M5 nur das in-Bundle-Register, §15).

import { createHash } from 'node:crypto';
import { fetchMitWiederholung } from '../normtext/netz-retry.ts';
import { dekodiereEntities } from '../normtext/html-entities.ts';
import { normalisiereZitat } from '../datenhaltung/normalisiere-zitat.ts';
import { extrahiereFedlexAnker, type FedlexKante } from './fedlex-anker.ts';
import {
  mwstDokId, mwstDoktyp, mwstAnzeigeNummer, istKuriertBekannt, type MwstPubArt,
} from './estv-mwst-ids.ts';
import type { SoftLawDok, NormRefKante, AdapterErgebnis } from './adapter-typen.ts';

export const ESTV_MWST_USER_AGENT = 'LexMetrik-Materialien/1.0 (+https://lexmetrik.vercel.app)';
export const ESTV_MWST_BASE = 'https://www.gate.estv.admin.ch/mwst-webpublikationen/public';

export interface MwstBereichDef {
  /** Pfad-Segment der JSF-Seiten. */
  tag: 'taxInfos' | 'sectorInfos';
  art: MwstPubArt;
  /** Kurz-URL-Code (/public/MI/NN bzw. /public/MBI/NN — live bestätigt). */
  kurzCode: 'MI' | 'MBI';
  /** untere Count-Gate-Schwelle nummerierter Publikationen (§2.5; live 22 bzw. 27). */
  min: number;
}

export const ESTV_MWST_BEREICHE: readonly MwstBereichDef[] = [
  { tag: 'taxInfos', art: 'MI', kurzCode: 'MI', min: 20 },
  { tag: 'sectorInfos', art: 'BI', kurzCode: 'MBI', min: 25 },
];

/** Menü-URL eines Bereichs (Inventar-GET). */
export function menuUrl(b: MwstBereichDef): string {
  return `${ESTV_MWST_BASE}/pages/${b.tag}/tableOfContent.xhtml?label=true`;
}
/** ToC-URL einer Publikation (Drift-Arbiter-GET). */
export function tocUrl(b: MwstBereichDef, publicationId: string): string {
  return `${ESTV_MWST_BASE}/pages/${b.tag}/tableOfContent.xhtml?publicationId=${publicationId}`;
}
/** Stabile Kurz-URL (quelle_url, §7c). */
export function kurzUrl(b: MwstBereichDef, nummer: string): string {
  return `${ESTV_MWST_BASE}/${b.kurzCode}/${nummer}`;
}
/** url_basis einer Publikation (Kante trägt nur das componentId-Suffix, §0/A11). */
export function urlBasis(b: MwstBereichDef, publicationId: string): string {
  return `${ESTV_MWST_BASE}/pages/${b.tag}/cipherDisplay.xhtml?publicationId=${publicationId}`;
}

// ══ Reine Extraktionsfunktionen ══════════════════════════════════════════════

export interface MenuEintrag {
  publicationId: string;
  /** amtliche Menü-Nummer verbatim («01» … «27»). */
  nummer: string;
  /** Menü-Label ohne Nummer («Steuerpflicht»). */
  navTitel: string;
}

/**
 * Parst das Publikations-Menü eines Bereichs (linke Navigation). Nummernlose Einträge
 * («Abkürzungen und Akronyme») werden bewusst übersprungen (Kopf-Kommentar). Rein.
 */
export function parseMenu(html: string, bereich: MwstBereichDef): MenuEintrag[] {
  const out: MenuEintrag[] = [];
  const re = new RegExp(
    `<a[^>]*href="/mwst-webpublikationen/public/pages/${bereich.tag}/tableOfContent\\.xhtml\\?publicationId=(\\d+)"[^>]*>([^<]*)</a>`,
    'g',
  );
  for (const m of html.matchAll(re)) {
    const label = dekodiereEntities(m[2]).replace(/\s+/g, ' ').trim();
    const nm = /^(\d{2})\s+(.+)$/.exec(label);
    if (!nm) continue; // nummernlos (Glossar) → bewusst übersprungen
    out.push({ publicationId: m[1], nummer: nm[1], navTitel: nm[2] });
  }
  return out;
}

export interface TocKnoten {
  componentId: string;
  /** Ziffer-/Knoten-Label verbatim («1.2 Steuersubjekt», «Vorbemerkungen»). */
  label: string;
  /** Teil-Kontext im Dokumentfluss («Teil II Lieferungen») oder null. Publikationen mit
   *  Teil-Gliederung (live: MI 06) starten die Ziffern-Zählung JE TEIL neu — ohne den Kontext
   *  kollidierten «Ziff. 1» aus Teil I und Teil II auf dieselbe Fundstelle (Gegenprüfungs-Befund
   *  4.7.2026: Anker-Drop durch Tupel-Merge). */
  teil: string | null;
}

export interface TocBaum {
  /** amtlicher Volltitel = Label des ersten (cover-)Knotens. */
  volltitel: string;
  publicationId: string;
  knoten: TocKnoten[];
}

/**
 * Parst den PrimeFaces-ToC-Baum einer Publikation (relative cipherDisplay-Anker in
 * Dokument-Reihenfolge). Wirft bei leerem Baum (Struktur-Bruch, §8). Rein.
 */
export function parseTocBaum(html: string): TocBaum {
  const knoten: TocKnoten[] = [];
  let publicationId = '';
  let aktuellerTeil: string | null = null;
  for (const m of html.matchAll(
    /<a[^>]*href="cipherDisplay\.xhtml\?publicationId=(\d+)&(?:amp;)?componentId=(\d+)"[^>]*>([^<]*)<\/a>/g,
  )) {
    publicationId = m[1];
    const label = dekodiereEntities(m[3]).replace(/\s+/g, ' ').trim();
    // Teil-Abschnitte sind im Dokumentfluss zusammenhängend: ein «Teil …»-Knoten öffnet den
    // Kontext für alle folgenden Knoten bis zum nächsten Teil (Ziffern-Zählung startet je Teil neu).
    const istTeil = /^Teil\s+(?:[IVX]+|[A-Z])\b/.test(label);
    if (istTeil) aktuellerTeil = label;
    knoten.push({ componentId: m[2], label, teil: istTeil ? null : aktuellerTeil });
  }
  if (knoten.length === 0) {
    throw new Error('adapter-estv-mwst: ToC-Baum leer (kein cipherDisplay-Anker) — JSF-Redesign? Snapshot NICHT schreiben.');
  }
  return { volltitel: knoten[0].label, publicationId, knoten };
}

/**
 * Normalisiert das ToC-XHTML für den Drift-Hash: JSF-ViewState-Werte genullt (volatil je
 * Request — zwei normalisierte Fetches sind live byte-gleich, 4.7.2026). Rein.
 */
export function normalisiereToc(html: string): string {
  return html.replace(
    /(name="javax\.faces\.ViewState"[^>]*value=")[^"]*(")/g,
    '$1$2',
  );
}

/** Drift-Token einer Publikation = sha256/16 über das normalisierte komplette ToC-XHTML (§3 Q1). */
export function tocDriftToken(html: string): string {
  return createHash('sha256').update(normalisiereToc(html), 'utf8').digest('hex').slice(0, 16);
}

export interface ZifferBefund {
  /** «Publiziert am» als ISO oder null (Seite ohne Datum = Parser-/Strukturfehler beim Aufrufer). */
  publiziertAm: string | null;
  fedlex: FedlexKante[];
}

/** Extrahiert «Publiziert am: DD.MM.YYYY» + Fedlex-Anker aus einer Ziffer-Seite. Rein. */
export function parseZifferSeite(html: string): ZifferBefund {
  const m = /Publiziert am:[\s\S]{0,300}?(\d{2})\.(\d{2})\.(\d{4})/.exec(html);
  const publiziertAm = m ? `${m[3]}-${m[2]}-${m[1]}` : null;
  return { publiziertAm, fedlex: extrahiereFedlexAnker(html) };
}

/**
 * Fundstelle aus dem ToC-Label: «1.2 Steuersubjekt» → «Ziff. 1.2», «Teil A …»/«Teil II …» →
 * «Teil A»/«Teil II» (Buchstaben- UND Roman-Numeral-Zählung, live: MI 06 «Teil II Lieferungen»),
 * sonst Label verbatim (auf 80 Zeichen gekappt — Anzeige-Feld, kein Zitat-Verlust: das volle
 * Label bleibt über componentId/URL auflösbar). Rein.
 */
export function fundstelleVonLabel(label: string): string {
  const z = /^(\d+(?:\.\d+)*)\s/.exec(label);
  if (z) return `Ziff. ${z[1]}`;
  const t = /^(Teil\s+(?:[IVX]+|[A-Z]))\b/.exec(label);
  if (t) return t[1].replace(/\s+/, ' ');
  return label.length > 80 ? `${label.slice(0, 79)}…` : label;
}

/**
 * Fundstelle eines ToC-Knotens INKL. Teil-Kontext («Teil II · Ziff. 1») — Publikationen mit
 * Teil-Gliederung zählen die Ziffern je Teil neu; ohne Präfix kollidieren die Fundstellen
 * (Gegenprüfungs-Befund 4.7.2026: Merge frass gültige 2025er-Anker). Rein.
 */
export function fundstelleVonKnoten(k: TocKnoten): string {
  const basis = fundstelleVonLabel(k.label);
  if (!k.teil) return basis;
  const teilKurz = fundstelleVonLabel(k.teil);
  return `${teilKurz} · ${basis}`;
}

const HINWEIS_MWST =
  'Amtliche ESTV-MWST-Webpublikation (Verwaltungsverordnung), kein Gesetzesrang; Inhalt laufend versioniert.';

export interface ZifferMitBefund {
  knoten: TocKnoten;
  befund: ZifferBefund;
}

/**
 * Baut aus (Menü-Eintrag + ToC-Baum + Ziffer-Befunden) Dokument + Kanten (rein).
 * Kanten: je Ziffer die invertierten Fedlex-MWST-Anker (quelle='amtlich', artikelscharf mit
 * Ziffer-Stand → Revisions-Cutoff §2.4 greift in der Projektion); dedupe je Ziffer auf
 * (erlass, artikel). Publikation ganz ohne Fedlex-Kante → EINE Erlass-Ebene-Kante MWSTG
 * (quelle='kuratiert': die Zuordnung MWST-Portal→MWSTG ist Kuratierung, kein Server-Anker).
 * dok.stand = jüngstes «Publiziert am» der Publikation. Wirft, wenn KEINE Ziffer ein Datum
 * trägt (Struktur-Bruch, §8 — kein stilles Falsch-Datum).
 */
export function baueDokUndKanten(
  eintrag: MenuEintrag,
  bereich: MwstBereichDef,
  volltitel: string,
  tocHtml: string,
  ziffern: ZifferMitBefund[],
  abgerufen: string,
): { dok: SoftLawDok; kanten: NormRefKante[]; disambiguiert: number } {
  const id = mwstDokId(bereich.art, eintrag.nummer);
  const daten = ziffern.map((z) => z.befund.publiziertAm).filter((d): d is string => d !== null);
  if (daten.length === 0) {
    throw new Error(`adapter-estv-mwst: ${id} — keine Ziffer trägt «Publiziert am» (Struktur-Bruch?). Snapshot NICHT schreiben.`);
  }
  const stand = daten.reduce((a, b) => (a > b ? a : b));
  const drift = tocDriftToken(tocHtml);
  const doktyp = mwstDoktyp(bereich.art);
  const nummer = mwstAnzeigeNummer(bereich.art, eintrag.nummer);
  const quelleUrl = kurzUrl(bereich, eintrag.nummer);
  const shaId = createHash('sha256')
    .update([id, volltitel, quelleUrl, stand, drift].join(' '), 'utf8')
    .digest('hex');

  const roh: NormRefKante[] = [];
  for (const z of ziffern) {
    const fundstelle = fundstelleVonKnoten(z.knoten);
    const gesehen = new Set<string>();
    for (const f of z.befund.fedlex) {
      const dk = `${f.erlass}|${f.artikel}`;
      if (gesehen.has(dk)) continue;
      gesehen.add(dk);
      roh.push({
        quelldok_id: id,
        erlass_key: f.erlass,
        artikel: f.artikel,
        zitat_key: f.artikel === ''
          ? normalisiereZitat(f.erlass)
          : normalisiereZitat(`${f.erlass} Art. ${f.artikel.replace('_', '')}`),
        roh_zitat: f.href,
        konfidenz: 'regex-hoch',
        quelle: 'amtlich', // serverseitiger Fedlex-Anker (§1 Q1)
        fundstelle,
        fundstelle_url: `&componentId=${z.knoten.componentId}`, // Suffix zur url_basis (§0/A11)
        stand: z.befund.publiziertAm ?? stand,
        abgerufen,
      });
    }
  }
  // DB-UNIQUE-Tupel-Sicherung (§2.1: quelldok_id, erlass_key, artikel, zitat_key, fundstelle) —
  // Entscheid (dokumentiert, 2. Fassung nach Gegenprüfungs-Befund 4.7.2026): Rest-Kollisionen
  // werden DISAMBIGUIERT, NIE verschmolzen. Die 1. Fassung (Merge «ältester Stand gewinnt»)
  // zog live gültige artikelscharfe Anker einer 2025er-Ziffer in die gleichnamige 2018er-Ziffer,
  // wo der Revisions-Cutoff sie wegdowngradete = Anker-Drop (Gegenprüfung: widerlegt). Der
  // Teil-Kontext-Präfix (fundstelleVonKnoten) löst die beobachtete Klasse strukturell; für alles
  // Unvorhergesehene bekommt die spätere Ziffer (Baum-Reihenfolge) ein deterministisches
  // « (n)»-Suffix — jede Kante überlebt mit IHREM Stand und IHRER Deep-Link-URL (kein Verlust,
  // §2.4-Semantik intakt). Zähler wird geloggt.
  const proTupel = new Map<string, number>();
  let disambiguiert = 0;
  const kanten: NormRefKante[] = [];
  for (const k of roh) {
    const basisKey = [k.erlass_key, k.artikel, k.zitat_key, k.fundstelle].join(' ');
    const n = (proTupel.get(basisKey) ?? 0) + 1;
    proTupel.set(basisKey, n);
    if (n === 1) {
      kanten.push(k);
    } else {
      disambiguiert++;
      kanten.push({ ...k, fundstelle: `${k.fundstelle} (${n})` });
    }
  }
  const erlasse = [...new Set(kanten.map((k) => k.erlass_key))].sort();
  if (kanten.length === 0) {
    // Publikation ohne einzigen Fedlex-Anker: Portal-Kontext-Zuordnung MWSTG (kuratiert, ehrlich).
    kanten.push({
      quelldok_id: id,
      erlass_key: 'MWSTG',
      artikel: '',
      zitat_key: normalisiereZitat('MWSTG'),
      roh_zitat: 'MWST-Webpublikation (Portal-Kontext, ohne Fedlex-Anker)',
      konfidenz: 'regex-niedrig',
      quelle: 'kuratiert',
      fundstelle: '',
      fundstelle_url: null,
      stand,
      abgerufen,
    });
    erlasse.push('MWSTG');
  }

  const dok: SoftLawDok = {
    id,
    behoerde: 'ESTV',
    doktyp,
    titel: volltitel,
    nummer,
    rechtsgebiet: 'sozial-abgaben',
    sprache: 'de',
    rang: (bereich.art === 'MI' ? 100 : 200) + Number(eintrag.nummer),
    normKeys: erlasse,
    hinweis: HINWEIS_MWST,
    quelle_url: quelleUrl,
    stand,
    stand_quelle: 'ziffer-datum',
    abgerufen,
    drift_token: drift,
    quell_ids: {
      publication_id: eintrag.publicationId,
      url_basis: urlBasis(bereich, eintrag.publicationId),
      bereich: bereich.tag,
      kurz_url: quelleUrl,
    },
    sha: shaId,
  };
  return { dok, kanten, disambiguiert };
}

// ══ Netz-Hülle ═══════════════════════════════════════════════════════════════

/** Fehlerseiten-/Shell-Marker (Soft-404 trotz 200/302, §Skill + POC). */
export function istFehlerSeite(urlEffective: string, html: string): boolean {
  if (/messageKey=[^&]*error/i.test(urlEffective)) return true;
  return /<title>\s*Error\s*<\/title>|Seite nicht gefunden/i.test(html) && !/cipherDisplay|tableOfContent/i.test(urlEffective);
}

/** Höflicher GET; Content-Type-Arbiter + Mindestlänge (Soft-404, §Skill). */
export async function ladeSeite(url: string, fetchImpl?: typeof fetch): Promise<string> {
  const res = await fetchMitWiederholung(
    url,
    { headers: { 'User-Agent': ESTV_MWST_USER_AGENT, Accept: 'text/html' } },
    { fetchImpl },
  );
  const ct = res.headers.get('content-type') ?? '';
  if (!res.ok) {
    await res.body?.cancel().catch(() => {}); // Body freigeben (undici-Pool, sonst Hänger)
    throw new Error(`adapter-estv-mwst: ${url} HTTP ${res.status}.`);
  }
  if (!/text\/html/i.test(ct)) {
    await res.body?.cancel().catch(() => {});
    throw new Error(`adapter-estv-mwst: ${url} kein text/html (Content-Type «${ct}») — Soft-404-Verdacht.`);
  }
  const html = await res.text();
  if (html.length < 5000) throw new Error(`adapter-estv-mwst: ${url} verdächtig kurz (${html.length} B) — Shell?`);
  if (istFehlerSeite(res.url || url, html)) throw new Error(`adapter-estv-mwst: ${url} landet auf Fehlerseite (${res.url}).`);
  return html;
}

/**
 * Prüft das 302-Ziel einer Kurz-URL (Zweitsignal §3 Q1): erwartet Redirect auf ein ToC mit
 * GENAU der publicationId des Inventars. Wirft bei Abweichung (Inventar↔Kurz-URL-Drift).
 */
export async function pruefeKurzUrl(
  url: string,
  erwartetePublicationId: string,
  fetchImpl?: typeof fetch,
): Promise<void> {
  const res = await fetchMitWiederholung(
    url,
    { headers: { 'User-Agent': ESTV_MWST_USER_AGENT }, redirect: 'manual' },
    { fetchImpl },
  );
  // 302-Body IMMER freigeben — ein unkonsumierter Body blockiert den undici-Connection-Pool
  // (live diagnostiziert 4.7.2026: Crawl hing deterministisch an der 3. Kurz-URL).
  await res.body?.cancel().catch(() => {});
  const loc = res.headers.get('location') ?? '';
  if (res.status < 300 || res.status >= 400) {
    throw new Error(`adapter-estv-mwst: Kurz-URL ${url} liefert HTTP ${res.status} statt 302 — Systematik-Bruch.`);
  }
  if (/messageKey=[^&]*error/i.test(loc)) {
    throw new Error(`adapter-estv-mwst: Kurz-URL ${url} 302 auf Fehlerseite (${loc}).`);
  }
  if (!loc.includes(`publicationId=${erwartetePublicationId}`)) {
    throw new Error(`adapter-estv-mwst: Kurz-URL ${url} zeigt auf «${loc}», erwartet publicationId=${erwartetePublicationId} (Inventar-Drift — Snapshot neu ziehen).`);
  }
}

export interface CrawlOptionen {
  abgerufen: string; // ISO (kein Date.now, §2)
  fetchImpl?: typeof fetch;
  warte?: (ms: number) => Promise<void>;
  /** Delay zwischen ALLEN Requests in ms (robots-Höflichkeit; Default 300). */
  delayMs?: number;
  substrat?: (tag: string, html: string) => void;
  /** Fortschritts-Log (Voll-Crawl dauert lange). */
  log?: (zeile: string) => void;
}

/**
 * Voll-Crawl beider Bereiche (höflich, STRIKT sequentiell = Concurrency 1, Delay zwischen allen
 * Requests). Je Publikation: Kurz-URL-302-Check + ToC (Drift-Arbiter + Substrat) + ALLE Ziffern.
 * Count-Gates je Menü; wirft bei ROT (§8: kein stiller Teil-Snapshot). Ergebnisvertrag §3.
 */
export async function crawleEstvMwst(opt: CrawlOptionen): Promise<AdapterErgebnis> {
  const warte = opt.warte ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const delay = opt.delayMs ?? 300;
  const log = opt.log ?? (() => {});
  let erste = true;
  const pause = async (): Promise<void> => {
    if (!erste) await warte(delay);
    erste = false;
  };

  const dokumente: SoftLawDok[] = [];
  const kanten: NormRefKante[] = [];
  let requests = 0;

  for (const bereich of ESTV_MWST_BEREICHE) {
    await pause();
    const menuHtml = await ladeSeite(menuUrl(bereich), opt.fetchImpl);
    requests++;
    const eintraege = parseMenu(menuHtml, bereich);
    if (eintraege.length < bereich.min) {
      throw new Error(`adapter-estv-mwst: ${bereich.tag} nur ${eintraege.length} nummerierte Publikationen (< ${bereich.min}) — Quell-Bruch/Redesign? Snapshot NICHT schreiben.`);
    }
    log(`estv-mwst ${bereich.tag}: ${eintraege.length} Publikationen.`);

    for (const eintrag of eintraege) {
      if (istKuriertBekannt(bereich.art, eintrag.nummer)) {
        log(`  ${bereich.kurzCode}/${eintrag.nummer} kuratiert-bekannt → übersprungen (§2.6).`);
        continue;
      }
      // Kurz-URL-302 (Zweitsignal): Inventar-publicationId muss dem 302-Ziel entsprechen.
      await pause();
      await pruefeKurzUrl(kurzUrl(bereich, eintrag.nummer), eintrag.publicationId, opt.fetchImpl);
      requests++;
      // ToC (Drift-Arbiter + Ziffern-Baum + Substrat §2.2).
      await pause();
      const tocHtml = await ladeSeite(tocUrl(bereich, eintrag.publicationId), opt.fetchImpl);
      requests++;
      const baum = parseTocBaum(tocHtml);
      opt.substrat?.(`${bereich.tag}:${eintrag.nummer}`, tocHtml);
      // Alle Ziffern (Fedlex-Anker + Publiziert-am) — Concurrency 2 (Fahrplan §8: 1–2 + Delay;
      // jeder Worker wartet delayMs zwischen SEINEN Requests). Ergebnis-Reihenfolge = Baum-
      // Reihenfolge (Index-Zuordnung), damit der Output deterministisch bleibt.
      const ziffern: ZifferMitBefund[] = new Array<ZifferMitBefund>(baum.knoten.length);
      let next = 0;
      const worker = async (): Promise<void> => {
        for (;;) {
          const i = next++;
          if (i >= baum.knoten.length) return;
          const knoten = baum.knoten[i];
          await warte(delay);
          const zifferHtml = await ladeSeite(
            `${urlBasis(bereich, eintrag.publicationId)}&componentId=${knoten.componentId}`,
            opt.fetchImpl,
          );
          requests++;
          ziffern[i] = { knoten, befund: parseZifferSeite(zifferHtml) };
        }
      };
      await Promise.all([worker(), worker()]);
      erste = false; // Delays liefen in den Workern
      const { dok, kanten: ks, disambiguiert } = baueDokUndKanten(eintrag, bereich, baum.volltitel, tocHtml, ziffern, opt.abgerufen);
      dokumente.push(dok);
      kanten.push(...ks);
      log(`  ${dok.id}: ${baum.knoten.length} Ziffern · ${ks.length} Kanten · Stand ${dok.stand} · drift ${dok.drift_token}${disambiguiert > 0 ? ` · ${disambiguiert} Fundstelle(n) disambiguiert (§2.1)` : ''}.`);
    }
  }

  log(`estv-mwst gesamt: ${dokumente.length} Dokumente · ${kanten.length} Kanten · ${requests} Requests.`);
  const idx = [...dokumente].map((d) => `${d.id}=${d.drift_token}`).sort().join('\n');
  const indexSha = createHash('sha256').update(idx, 'utf8').digest('hex').slice(0, 16);
  return { dokumente, kanten, indexSha, abgerufen: opt.abgerufen };
}

// ── Leichtes Inventar (Netz-Arbiter, §3 Q1: 1 GET/Publikation, KEINE Ziffer-Crawls) ───────────

export interface InventarEintrag {
  drift_token: string;
  publicationId: string;
  bereich: MwstBereichDef;
  nummer: string;
}

/**
 * Drift-Inventar für check:materialien-netz: 2 Menü-GETs + je Publikation 1 ToC-GET →
 * (id → ToC-Drift-Token). Kuratiert-bekannte übersprungen (wie der Voll-Crawl). Sequentiell,
 * Delay — robots-höflich (~51 GETs). Count-Gates wie der Voll-Crawl (werfen bei ROT).
 */
export async function inventarEstvMwst(opt: CrawlOptionen): Promise<Map<string, InventarEintrag>> {
  const warte = opt.warte ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const delay = opt.delayMs ?? 300;
  let erste = true;
  const pause = async (): Promise<void> => {
    if (!erste) await warte(delay);
    erste = false;
  };
  const out = new Map<string, InventarEintrag>();
  for (const bereich of ESTV_MWST_BEREICHE) {
    await pause();
    const menuHtml = await ladeSeite(menuUrl(bereich), opt.fetchImpl);
    const eintraege = parseMenu(menuHtml, bereich);
    if (eintraege.length < bereich.min) {
      throw new Error(`adapter-estv-mwst: ${bereich.tag} nur ${eintraege.length} nummerierte Publikationen (< ${bereich.min}) — Quell-Bruch/Redesign?`);
    }
    for (const eintrag of eintraege) {
      if (istKuriertBekannt(bereich.art, eintrag.nummer)) continue;
      await pause();
      const tocHtml = await ladeSeite(tocUrl(bereich, eintrag.publicationId), opt.fetchImpl);
      parseTocBaum(tocHtml); // Struktur-Probe (wirft bei leerem Baum)
      out.set(mwstDokId(bereich.art, eintrag.nummer), {
        drift_token: tocDriftToken(tocHtml),
        publicationId: eintrag.publicationId,
        bereich,
        nummer: eintrag.nummer,
      });
    }
  }
  return out;
}
