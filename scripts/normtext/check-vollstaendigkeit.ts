/**
 * Fundierter Vollständigkeitstest für das Norm-Vorschau-System.
 *
 * Vier Prüfungen (alle OFFLINE, deterministisch):
 *   1. Bund-Extraktions-Vollständigkeit: jedes art_*-Token aus dem Fedlex-Cache-HTML
 *      muss einen Snapshot-Eintrag haben (Ausnahme: dokumentierte leere Artikel).
 *   2. Kanton-Zitat-Abdeckung: jede (kanton, lawId, artikel)-Stelle aus dem
 *      kantonalen Inventar muss einen Snapshot haben oder in der bekannteLuecken-
 *      Liste stehen (mit Grund). Unerwartete Lücken → FEHLER.
 *   3. Inhalts-Sanity: kein Snapshot-Eintrag hat leere bloecke[], kein Block ist
 *      ohne text und ohne items.
 *   4. Manifest-Konsistenz (Kanton): jeder Manifest-Eintrag → Datei existiert;
 *      jede Kanton-Datei → mind. eine quelleUrl im Manifest.
 *
 * §2: kein Date.now/Math.random. §8: kein stilles Versagen.
 *
 * Aufruf:
 *   vite-node scripts/normtext/check-vollstaendigkeit.ts
 *
 * Reine Vergleichslogik: scripts/normtext/vollstaendigkeit-logik.ts
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parseFedlexCacheEintraege } from './inventar-bund.ts';
import {
  sammleKantonInventar,
  sammleHtmInventar,
  sammleZhPdfInventar,
  sammlePdfInventar,
} from './inventar-kanton.ts';
import { alleArtikelTokens } from './extrahiere-fedlex.ts';
import {
  fehlendeBundArtikel,
  unerwarteteKantonLueckenMitQuelleUrl,
  pruefeInhaltsSanity,
  pruefeManifestKonsistenz,
} from './vollstaendigkeit-logik.ts';
import type {
  BekannteLuecke,
  SnapshotEintrag,
} from './vollstaendigkeit-logik.ts';

// ─── Bekannte Kanton-Lücken (dokumentiert mit Grund) ─────────────────────────
//
// Jede Lücke muss hier mit Grund eingetragen sein. Lücken, die NICHT hier stehen,
// führen zu einem FEHLER (unerwartete Lücke = §8-Verletzung).
//
// Gründe:
//   'token-nicht-im-Erlass' — LexWork-Snapshot wurde erzeugt, aber dieser spezifische
//     Artikel-Token existiert nicht im Erlass (LexWork lieferte ihn nicht zurück).
//     Typisch: bisacodes-freie «a»-Paragraphen (1_a, 8_a), Übergangs-/Schlussartikel.
//   'nicht-LexWork' — Die Law-ID taucht im Inventar auf, ist aber nicht über LexWork
//     als Snapshot verfügbar (z.B. GL/III%20B/7/1 vs. encodierter Pfad, SH/273.100
//     nicht gesnapshottet, OW/210.32 nicht gesnapshottet).
//
// Verifikation: Stand 16.6.2026 — alle Einträge empirisch geprüft.
// Entfernt (16.6.2026): LU/228/art_29 — §29 existiert in SRL 258, nicht 228; quelleUrl in
//   notariat-grundbuch.ts (GRUNDPFAND LU) auf 258 korrigiert; Snapshot via 258 abgedeckt.
// Entfernt (16.6.2026): OW/134.15/art_7 — Art. 7 GebOR aufgehoben; Gerichtskosten OW zitieren
//   jetzt Art. 12 (Kantonsgericht; bis 30 000 Art. 9). Snapshot deckt art_12 (und art_9) ab.
//
const BEKANNTE_LUECKEN: BekannteLuecke[] = [
  // ── SG/941.12: kein Snapshot (nurPdf-Erlass)
  {
    snapshotId: 'kanton/SG/941.12/art_8',
    grund: 'nurPdf',
    notiz: 'SG-941.12 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/941.12/art_10',
    grund: 'nurPdf',
    notiz: 'SG-941.12 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },

  // ── SG/914.5: kein Snapshot (nurPdf-Erlass)
  {
    snapshotId: 'kanton/SG/914.5/art_8',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_10',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_11',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_13',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_15',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_16',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_17',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_22',
    grund: 'nurPdf',
    notiz: 'SG-914.5 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },

  // (SH/273.100 entfernt 16.6.2026: ZPO 1951 am 1.1.2011 aufgehoben; SH-Schlichtung
  //  zitiert neu Art. 82 JG SHR 173.200, das via LexWork sauber snapshottet — kein 404 mehr.)

  // ── OW/210.32: nurPdf
  {
    snapshotId: 'kanton/OW/210.32/art_10',
    grund: 'nurPdf',
    notiz: 'OW-210.32 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },

  // ── AR/153.2: nurPdf
  {
    snapshotId: 'kanton/AR/153.2/art_12',
    grund: 'nurPdf',
    notiz: 'AR-153.2 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },

  // ── NW/265.51: keine LexWork-Quelle verfügbar
  {
    snapshotId: 'kanton/NW/265.51/art_28',
    grund: 'nicht-LexWork',
    notiz: 'NW-265.51 nicht über LexWork verfügbar (Stand 16.6.2026).',
  },
];
// Entfernt (16.6.2026): FR/130.11 (art_18/20/64), VS/173.8 (art_15/16/17/32/34),
// GL/III%20B/7/1 (art_13) — diese Snapshots existieren unter ihren quelleUrls und
// werden via Laufzeit-Auflösung (unerwarteteKantonLueckenMitQuelleUrl) korrekt
// als ABGEDECKT erkannt. ID-Suffixe (-de/-fr/III%20B_7_1) in Snapshot-Dateien
// sind kein Loch, sondern ein Auflösungsartefakt (BUG A3).

// ─── Bekannte HTM/ZH-Lücken (dokumentiert mit Grund) ─────────────────────────
//
// Wie BEKANNTE_LUECKEN, aber für die HTM- (NE/GE) und ZH-Tiers. snapshotId ist
// die kanonische Form `kanton/${kanton}/${safeLawId}/art_${token}` (safeLawId =
// htmLawIdSafe bzw. zhLawIdSafe der quelleUrl). Lücken, die NICHT hier stehen,
// führen zu einem FEHLER (§8).
//
// Verifikation: Stand 16.6.2026 — alle Einträge empirisch geprüft.
const BEKANNTE_LUECKEN_HTMZH: BekannteLuecke[] = [
  // ── NE/2154116 (LERF, htm): Arrêté-Artikel liegen NICHT im LERF-htm ───────
  // Die festen Emolument-Tarife stehen im Arrêté RSN 215.411.60 (eigener Erlass,
  // nicht als htm erschlossen). Das LERF-htm (2154116.htm) enthält nur die
  // LERF-Artikel selbst (Art. 9–13 werden sauber gesnapshottet). Die «Arrêté
  // Art. …»-Zitate teilen sich die LERF-quelleUrl (gemeinsamer Tarif-Eintrag)
  // → im LERF-htm nicht auffindbar. Bekannt (Stand 16.6.2026): 14, 18, 20, 21,
  // 27 (Arrêté) sowie 44 (Tarif notaires RSN 166.31, mitzitiert).
  { snapshotId: 'kanton/NE/2154116/art_14', grund: 'token-nicht-im-Erlass', notiz: 'Arrêté RSN 215.411.60 Art. 14 — im LERF-htm nicht enthalten (anderer Erlass).' },
  { snapshotId: 'kanton/NE/2154116/art_18', grund: 'token-nicht-im-Erlass', notiz: 'Arrêté RSN 215.411.60 Art. 18 — im LERF-htm nicht enthalten (anderer Erlass).' },
  { snapshotId: 'kanton/NE/2154116/art_20', grund: 'token-nicht-im-Erlass', notiz: 'Arrêté RSN 215.411.60 Art. 20 — im LERF-htm nicht enthalten (anderer Erlass).' },
  { snapshotId: 'kanton/NE/2154116/art_21', grund: 'token-nicht-im-Erlass', notiz: 'Arrêté RSN 215.411.60 Art. 21 — im LERF-htm nicht enthalten (anderer Erlass).' },
  { snapshotId: 'kanton/NE/2154116/art_27', grund: 'token-nicht-im-Erlass', notiz: 'Arrêté RSN 215.411.60 Art. 27 — im LERF-htm nicht enthalten (anderer Erlass).' },
  // Entfernt (17.6.2026): kanton/NE/2154116/art_44 — die GRUNDPFAND-NE-Zitatkorrektur
  // (notariat-grundbuch.ts) führt das LERF-Zitat jetzt auf den existierenden Art. 10
  // (Eintrag 2‰); die Beurkundung (RSN 166.31 Art. 14 ch. 44 «gage immobilier») steht
  // im Hinweis, nicht mehr als toter Art.-44-Token gegen die LERF-quelleUrl.

  // ── NE/16631 (Tarif notaires RSN 166.31, htm): vormals tote Verweis-Zitate ─
  // Entfernt (17.6.2026): art_54 (war «Art. 54» → korrigiert zu «Art. 14 ch. 54»,
  //   Vente immobilière) und art_81 (war «Art. 81 lit. B/C» → «Art. 14 ch. 81 lit. B/C»,
  //   Société anonyme). Beide lösen jetzt auf Art. 14 auf (live an rsn.ne.ch/16631.htm
  //   verifiziert: RSN 166.31 endet bei Art. 17; die Gebühren-Chiffres 1–82 stehen in
  //   Art. 14). Snapshot NE-16631.json deckt art_14 ab.

  // ── GE/rsg_e1_50p06: vormals tote Fremdartikel-Tokens ─────────────────────
  // Entfernt (17.6.2026): art_16 (war REmNot-Beurkundung «Art. 16» → gehört zu RSG
  //   E 6 05.03, nicht E 1 50.06) und art_84 (war LDE-Steuer «Art. 84» → gehört zu RSG
  //   D 3 30). Das verkettete GRUNDPFAND-GE-Zitat führt jetzt auf den existierenden
  //   Art. 4 (REmORFDIT, Eintrag 0,085 %) der quelleUrl; die Beurkundung (E 6 05.03
  //   Art. 16) und Registrierungssteuer (D 3 30 Art. 84) stehen im Hinweis. Live
  //   verifiziert (17.6.2026): rsg_e1_50p06 endet bei Art. 13, Art. 16/84 dort nie
  //   vorhanden. (Der Bug-Check-Verdacht «RTFMC rsg_e1_05p10» war falsch: RTFMC Art. 16
  //   = Schlichtungspauschale, Art. 84 = Parteientschädigung — beide kein Grundpfand.)

  // ── SZ/280.411 (Gebührentarif Rechtsanwälte): tote PDF-URL (assets/4837) ───
  // Das nicht-vermögensrechtliche Zitat «§ 9» trägt die quelleUrl
  // …/assets/4837/280_411.pdf, die jetzt 404 liefert (der Tarif-Eintrag in
  // notariat/grundbuch nutzt die funktionierende …/assets/5862/-Variante; nur
  // die 4837-Variante in nicht-vermoegensrechtlich.ts ist veraltet). Kein
  // Volltext-Snapshot über die 4837-URL → bekannte Lücke (§8); Korrektur der
  // Daten-URL ist eine eigene fachliche Änderung. Stand 16.6.2026.
  { snapshotId: 'kanton/SZ/280.411/art_9', grund: 'nicht-LexWork', notiz: 'SZ-280.411 PDF-URL assets/4837 liefert 404 (funktionierende 5862-Variante in anderem Tarif-Eintrag). Stand 16.6.2026.' },

  // ── JU/37773 (Décret tarifaire): Art. 13 existiert nicht im Erlass ─────────
  // Das Décret (idn=20021&id=37773) umfasst Art. 1–12 (letzter Artikel: «Le
  // Gouvernement fixe l'entrée en vigueur»). Das Zitat «Art. 13» verweist auf
  // einen nicht vorhandenen Artikel (Mis-/Fremdzitat) → token-nicht-im-Erlass.
  { snapshotId: 'kanton/JU/ju-20021-37773-dl/art_13', grund: 'token-nicht-im-Erlass', notiz: 'JU Décret 37773 hat nur Art. 1–12; Art. 13 nicht vorhanden. Stand 16.6.2026.' },
];

// ─── HTM/ZH-lawIdSafe (kongruent zum Orchestrator) ───────────────────────────
function htmLawIdSafe(url: string): string {
  const letzter = url.split('/').pop() ?? url;
  return letzter.replace(/\.html?$/i, '');
}
function zhLawIdSafe(url: string): string {
  const m = url.match(/\/erlass-([^-]+)-/);
  return m ? m[1].replace(/_/g, '.') : url.replace(/[^a-z0-9.]+/gi, '_');
}
function pdfLawIdSafe(profil: 'sz' | 'ti' | 'vd' | 'ju', url: string): string {
  if (profil === 'sz') {
    const m = url.match(/\/(\d+_\d+)\.pdf$/i);
    if (m) return m[1].replace(/_/g, '.');
  }
  if (profil === 'ti') {
    const m = url.match(/\/pdfatto\/atto\/(\d+)/i);
    if (m) return `ti-${m[1]}`;
  }
  if (profil === 'vd') {
    const m = url.match(/\/tolv\/(\d+)\//i);
    if (m) return `vd-${m[1]}`;
  }
  if (profil === 'ju') {
    const idn = url.match(/[?&]idn=(\d+)/i);
    const id = url.match(/[?&]id=(\d+)/i);
    const dl = /[?&]download=1/i.test(url) ? '-dl' : '';
    if (idn && id) return `ju-${idn[1]}-${id[1]}${dl}`;
  }
  return url.replace(/[^a-z0-9.]+/gi, '_');
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

interface SnapshotDatei {
  erzeugt: string;
  eintraege: SnapshotEintrag[];
}

function ladeBundSnapshots(): {
  snapshots: SnapshotEintrag[];
  snapshotIds: Set<string>;
} {
  const bundDir = 'public/normtext/bund';
  if (!existsSync(bundDir)) return { snapshots: [], snapshotIds: new Set() };

  const snapshots: SnapshotEintrag[] = [];
  const snapshotIds = new Set<string>();

  for (const datei of readdirSync(bundDir)) {
    if (!datei.endsWith('.json')) continue;
    const pfad = `${bundDir}/${datei}`;
    const inhalt = JSON.parse(readFileSync(pfad, 'utf8')) as SnapshotDatei;
    for (const e of inhalt.eintraege ?? []) {
      snapshots.push(e);
      snapshotIds.add(e.id);
    }
  }

  return { snapshots, snapshotIds };
}

function ladeKantonSnapshots(): {
  snapshots: SnapshotEintrag[];
  snapshotIds: Set<string>;
  vorhandeneD: Set<string>;
} {
  const kantonDir = 'public/normtext/kanton';
  if (!existsSync(kantonDir)) {
    return { snapshots: [], snapshotIds: new Set(), vorhandeneD: new Set() };
  }

  const snapshots: SnapshotEintrag[] = [];
  const snapshotIds = new Set<string>();
  const vorhandeneD = new Set<string>();

  for (const datei of readdirSync(kantonDir)) {
    if (!datei.endsWith('.json') || datei === 'index.json') continue;
    vorhandeneD.add(datei);
    const pfad = `${kantonDir}/${datei}`;
    const inhalt = JSON.parse(readFileSync(pfad, 'utf8')) as SnapshotDatei;
    for (const e of inhalt.eintraege ?? []) {
      snapshots.push(e);
      snapshotIds.add(e.id);
    }
  }

  return { snapshots, snapshotIds, vorhandeneD };
}

function ladeKantonManifest(): Map<string, string> {
  const pfad = 'public/normtext/kanton/index.json';
  if (!existsSync(pfad)) return new Map();
  const manifest = JSON.parse(readFileSync(pfad, 'utf8')) as Record<string, string>;
  return new Map(Object.entries(manifest));
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const shellQuelle = readFileSync('scripts/fedlex-cache.sh', 'utf8');
  const cacheEintraege = parseFedlexCacheEintraege(shellQuelle);

  const { snapshots: bundSnapshots, snapshotIds: bundSnapshotIds } = ladeBundSnapshots();
  const {
    snapshots: kantonSnapshots,
    snapshotIds: kantonSnapshotIds,
    vorhandeneD,
  } = ladeKantonSnapshots();
  const manifestMap = ladeKantonManifest();

  let exitCode = 0;

  // ─── Prüfung 1: Bund-Extraktions-Vollständigkeit ────────────────────────────
  console.log('\n── Prüfung 1: Bund-Extraktions-Vollständigkeit ──────────────────────────');

  let bundHtmlGeprüft = 0;
  let bundFehlendTotal = 0;
  let bundSkipTotal = 0;

  for (const eintrag of cacheEintraege) {
    const htmlPfad = `/tmp/${eintrag.name}.html`;
    if (!existsSync(htmlPfad)) {
      console.warn(
        `  HINWEIS: ${eintrag.name}: HTML-Cache /tmp/${eintrag.name}.html fehlt — überspringen (bash scripts/fedlex-cache.sh ausführen).`,
      );
      continue;
    }

    const html = readFileSync(htmlPfad, 'utf8');
    const htmlTokens = alleArtikelTokens(html);
    bundHtmlGeprüft++;

    const gesetz = eintrag.name.toUpperCase();
    // Es gibt keine bekannte Skip-Liste für leere Artikel (extrahiereArtikel liefert nie leer
    // bei gültigen Tokens in der aktuellen Implementierung).
    const leereArtikel = new Set<string>();
    const fehlend = fehlendeBundArtikel(gesetz, htmlTokens, bundSnapshotIds, leereArtikel);

    const echteFehlend = fehlend.filter((f) => !f.warLeererArtikel);
    const skippe = fehlend.filter((f) => f.warLeererArtikel);

    if (echteFehlend.length > 0) {
      console.error(
        `  FEHLER ${gesetz}: ${echteFehlend.length} Artikel in HTML, nicht im Snapshot:`,
      );
      for (const f of echteFehlend) {
        console.error(`    ${f.snapshotId}`);
      }
      exitCode = 1;
    }

    if (skippe.length > 0) {
      console.log(
        `  HINWEIS ${gesetz}: ${skippe.length} leere Artikel (dokumentierter Skip):`,
        skippe.map((f) => f.token).join(', '),
      );
    }

    bundFehlendTotal += echteFehlend.length;
    bundSkipTotal += skippe.length;

    const statusText =
      echteFehlend.length === 0
        ? `ok (${htmlTokens.length} Tokens)`
        : `FEHLER ${echteFehlend.length} fehlend`;
    console.log(`  ${gesetz}: ${statusText}`);
  }

  const bundStatus = bundFehlendTotal === 0 ? 'ok' : `${bundFehlendTotal} fehlend`;
  console.log(
    `\nBund: ${bundHtmlGeprüft} Gesetze geprüft, ${bundSnapshots.length} Snapshots, fehlend: ${bundStatus}${bundSkipTotal > 0 ? `, ${bundSkipTotal} leere-Artikel-Skips` : ''}`,
  );

  // ─── Prüfung 2: Kanton-Zitat-Abdeckung (via Laufzeit-Auflösung) ─────────────
  // Auflösung: quelleUrl (aus dem Inventar) → Manifest → Snapshot-Datei → Eintrag
  // mit artikel === token. So werden Suffixe (-de/-fr) und URL-Encoding-Varianten
  // (III%20B_7_1) transparent, da der Eintrag explizit seine quelleUrl trägt.
  // Ein echtes Loch liegt nur vor, wenn die Auflösung fehlschlägt (BUG A3 Fix).
  console.log('\n── Prüfung 2: Kanton-Zitat-Abdeckung (via Laufzeit-Auflösung) ────────────');

  const gruppen = sammleKantonInventar();

  // Bilde Map quelleUrl → Set<artikel-String> aus den geladenen Snapshot-Einträgen.
  // Der `artikel`-Feld im Snapshot (z.B. '18', '20', '64') entspricht dem Token
  // aus parsePassus, der im Inventar als artikelToken steht.
  const artikelNachUrl = new Map<string, Set<string>>();
  for (const eintrag of kantonSnapshots) {
    const url = (eintrag as { quelleUrl?: string }).quelleUrl;
    const art = (eintrag as { artikel?: string }).artikel;
    if (url && art) {
      let s = artikelNachUrl.get(url);
      if (!s) {
        s = new Set<string>();
        artikelNachUrl.set(url, s);
      }
      s.add(art);
    }
  }

  const unerwartet = unerwarteteKantonLueckenMitQuelleUrl(
    gruppen,
    manifestMap,
    artikelNachUrl,
    BEKANNTE_LUECKEN,
  );

  if (unerwartet.length > 0) {
    console.error(`  FEHLER: ${unerwartet.length} unerwartete Kanton-Zitat-Lücken (LexWork, nicht in bekannteLuecken):`);
    for (const l of unerwartet) {
      console.error(`    ${l.snapshotId}`);
    }
    exitCode = 1;
  }

  // ── HTM (NE/GE) + ZH-Tier: gleiche quelleUrl-Auflösung, eigene Lücken-Liste ──
  // Diese Tiers liefen bisher NICHT durch das Tor (BUG3) — eine künftige HTM/ZH-
  // Lücke lief still durch. Jetzt: jede HTM/ZH-Inventar-Gruppe wird gegen ihre
  // Snapshots via quelleUrl-Auflösung geprüft (kanton/${kanton}/${safeLawId}/…).
  const htmGruppen = sammleHtmInventar().map((g) => ({
    kanton: g.kanton,
    lawId: htmLawIdSafe(g.quelleUrl),
    quelleUrl: g.quelleUrl,
    artikel: g.artikel,
  }));
  const zhGruppen = sammleZhPdfInventar().map((g) => ({
    kanton: g.kanton,
    lawId: zhLawIdSafe(g.quelleUrl),
    quelleUrl: g.quelleUrl,
    artikel: g.artikel,
  }));
  const pdfGruppen = sammlePdfInventar().map((g) => ({
    kanton: g.kanton,
    lawId: pdfLawIdSafe(g.profil, g.quelleUrl),
    quelleUrl: g.quelleUrl,
    artikel: g.artikel,
  }));
  const unerwartetHtmZh = unerwarteteKantonLueckenMitQuelleUrl(
    [...htmGruppen, ...zhGruppen, ...pdfGruppen],
    manifestMap,
    artikelNachUrl,
    BEKANNTE_LUECKEN_HTMZH,
  );

  if (unerwartetHtmZh.length > 0) {
    console.error(`  FEHLER: ${unerwartetHtmZh.length} unerwartete Kanton-Zitat-Lücken (HTM/ZH, nicht in bekannteLuecken):`);
    for (const l of unerwartetHtmZh) {
      console.error(`    ${l.snapshotId}`);
    }
    exitCode = 1;
  }

  const htmZhZitate = [...htmGruppen, ...zhGruppen, ...pdfGruppen].reduce((s, g) => s + g.artikel.length, 0);
  console.log(
    `  HTM/ZH/PDF: ${htmZhZitate} Zitat-Tripel geprüft (via quelleUrl-Auflösung), bekannte Lücken: ${BEKANNTE_LUECKEN_HTMZH.length}, unerwartet: ${unerwartetHtmZh.length === 0 ? 'ok' : unerwartetHtmZh.length}`,
  );

  // Bekannte Lücken: zeige nur jene, die tatsächlich in einem Inventar-Zitat auftauchen
  // (kanonische snapshotId-Form: kanton/${kanton}/${lawId}/art_${token}).
  const zitierteIds = new Set<string>();
  for (const g of gruppen) {
    for (const a of g.artikel) {
      zitierteIds.add(`kanton/${g.kanton}/${g.lawId}/art_${a.token}`);
    }
  }
  const abgedeckt = BEKANNTE_LUECKEN.filter((l) => zitierteIds.has(l.snapshotId));
  if (abgedeckt.length > 0) {
    console.log(`  Bekannte Lücken (${abgedeckt.length}, akzeptiert mit Grund):`);
    for (const l of abgedeckt) {
      console.log(`    [${l.grund}] ${l.snapshotId}${l.notiz ? ' — ' + l.notiz : ''}`);
    }
  }

  const zitierteAnzahl = [...gruppen].reduce((s, g) => s + g.artikel.length, 0);
  const kantonStatus = unerwartet.length === 0 ? 'ok' : `${unerwartet.length} unerwartet`;
  console.log(
    `\nKanton: ${zitierteAnzahl} Zitat-Tripel geprüft (via quelleUrl-Auflösung), ${kantonSnapshotIds.size} Snapshot-IDs, bekannte Lücken: ${abgedeckt.length}, unerwartet: ${kantonStatus}`,
  );

  // ─── Prüfung 3: Inhalts-Sanity ───────────────────────────────────────────────
  console.log('\n── Prüfung 3: Inhalts-Sanity ─────────────────────────────────────────────');

  const alleSnapshots = [...bundSnapshots, ...kantonSnapshots];
  const sanityFehler = pruefeInhaltsSanity(alleSnapshots);

  if (sanityFehler.length > 0) {
    console.error(`  FEHLER: ${sanityFehler.length} Sanity-Probleme:`);
    for (const f of sanityFehler) {
      const detail =
        f.problem === 'leerer-block' ? ` (Block ${f.blockIndex})` : '';
      console.error(`    [${f.problem}${detail}] ${f.snapshotId}`);
    }
    exitCode = 1;
  }

  const sanityStatus = sanityFehler.length === 0 ? 'ok' : `${sanityFehler.length} Fehler`;
  console.log(
    `Sanity: ${alleSnapshots.length} Einträge (${bundSnapshots.length} Bund + ${kantonSnapshots.length} Kanton) geprüft — ${sanityStatus}`,
  );

  // ─── Prüfung 4: Manifest-Konsistenz (Kanton) ────────────────────────────────
  console.log('\n── Prüfung 4: Manifest-Konsistenz (Kanton) ──────────────────────────────');

  const manifestFehler = pruefeManifestKonsistenz(manifestMap, vorhandeneD);

  if (manifestFehler.length > 0) {
    console.error(`  FEHLER: ${manifestFehler.length} Manifest-Inkonsistenzen:`);
    for (const f of manifestFehler) {
      const detail = f.quelleUrl ? ` (quelleUrl: ${f.quelleUrl})` : '';
      console.error(`    [${f.problem}] ${f.datei}${detail}`);
    }
    exitCode = 1;
  }

  const manifestStatus = manifestFehler.length === 0 ? 'ok' : `${manifestFehler.length} Fehler`;
  console.log(
    `Manifest: ${manifestMap.size} Einträge, ${vorhandeneD.size} Dateien — ${manifestStatus}`,
  );

  // ─── Gesamtstatus ─────────────────────────────────────────────────────────────
  console.log('\n── Gesamtstatus ─────────────────────────────────────────────────────────');
  if (exitCode === 0) {
    console.log('check:vollstaendigkeit: GRÜN — alle 4 Prüfungen bestanden.');
  } else {
    console.error('check:vollstaendigkeit: ROT — Fehler oben beheben!');
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('check-vollstaendigkeit: unerwarteter Fehler:', err);
  process.exit(1);
});
