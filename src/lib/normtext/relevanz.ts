// ─── Relevanz-Ordnung der Gesetzes-Übersichten (A14 + A15, W2·5d) ─────────────
//
// REINE DARSTELLUNG (§3): diese Datei sortiert Übersichts-Listen um, sie ändert
// KEINE Rechtslogik, keinen Normtext, keinen Wert. Kein `Date.now()`, kein LLM,
// keine geratene Wichtigkeit (§2/§8) — jede Ordnung ist ein DOKUMENTIERTES,
// DETERMINISTISCHES Kriterium auf schon vorhandenen, committeten Daten.
//
// Davids Auftrag (A14/A15, 5.7.2026): «auch die relevantesten zuerst … KEINE
// geratene Wichtigkeit: Kriterium dokumentieren und einheitlich anwenden.» Die
// «Relevanz»-Gliederung tritt NEBEN die bestehenden Ordnungen (Systematisch =
// amtliche Systematik; Rechtsgebiet = G6-Grundgerüst) — sie ersetzt keine.
//
// ── Das Kriterium, je Säule (wörtlich dokumentiert) ──────────────────────────
//
//  BUND & INTERNATIONAL — «kuratierter Leitgesetz-Rang»:
//    Primär der committete `rang` aus dem ERLASS_REGISTER (register.ts). Dieses
//    Feld ist eine editorielle, mit §7-Disziplin gepflegte Reihung INNERHALB
//    (ebene, rechtsgebiet): Leitgesetze tragen den tiefsten Rang (BV = 0,
//    ZGB/StGB/ZPO/SchKG = 1, …), Ausführungs-/Spezialerlasse höhere. Es ist ein
//    DEKLARIERTES Datum (register.ts), nicht eine Laufzeit-Schätzung — darum als
//    Relevanz-Signal zulässig (§8: dokumentiert, nicht geraten). Sekundär:
//    Volltext-Verfügbarkeit (`istLesbar` — in-App lesbar vor reinem Live-Link),
//    dann die Sach-Achse (GEBIET_RANG), dann das Kürzel (stabiler Tiebreak).
//
//  KANTON — «Kern-Erlass-Kategorie, dann Systematik» (A14):
//    Der `rang` ist für kantonale Erlasse NICHT brauchbar: der Manifest-Generator
//    setzt ihn einheitlich auf 0 (scripts/normtext/browse-manifest.ts). An seine
//    Stelle tritt eine DOKUMENTIERTE Kern-Kategorie-Klassifikation, die exakt die
//    von David genannten Kern-Erlasse zuerst zieht («Verfassung / EG ZGB /
//    GOG / Steuergesetz / Gebührentarife zuerst, dann nach Systematik»). Die
//    Kategorie wird deterministisch aus dem AMTLICHEN Titel/Kürzel erkannt
//    (anker-feste Muster, unten belegt) — eine Klassifikation mit fester Regel,
//    KEINE geratene Wichtigkeit. Innerhalb derselben Kategorie ordnet die
//    amtliche Systematik (Sachgebiets-Rang · SR-Vergleich), genau wie David es
//    verlangt («dann nach Systematik»).
//
// Die bestehenden G5-Umschalter (Alphabet / Erlass-Zahl / Region) auf dem
// 26er-Kanton-Raster bleiben unberührt — sie ordnen die KANTONE, nicht die
// Erlasse eines Kantons (A14 ausdrücklich: «bleiben als Alternativen»).

import { GEBIET_RANG } from './register';
import { istLesbar, type BrowseErlass } from './browse-typen';
import { sachgruppe, sachgebietRang, srVergleich, type KantonSystematik } from './systematik';

// ── BUND & INTERNATIONAL ─────────────────────────────────────────────────────

const lesbar0 = (e: BrowseErlass): number => (istLesbar(e) ? 0 : 1);

/** Relevanz-Vergleich für Bund- und International-Erlasse (Leitgesetz-Rang).
 *  Deterministisch, stabil: rang → Volltext → Sach-Achse → Kürzel. */
export function vergleicheRelevanz(a: BrowseErlass, b: BrowseErlass): number {
  return (
    a.rang - b.rang ||
    lesbar0(a) - lesbar0(b) ||
    (GEBIET_RANG[a.rechtsgebiet] ?? 99) - (GEBIET_RANG[b.rechtsgebiet] ?? 99) ||
    a.kuerzel.localeCompare(b.kuerzel, 'de')
  );
}

/** Nach Relevanz sortierte Kopie (reine Anzeige — mutiert die Eingabe nicht). */
export function nachRelevanz(erlasse: readonly BrowseErlass[]): BrowseErlass[] {
  return [...erlasse].sort(vergleicheRelevanz);
}

// ── KANTON: Kern-Erlass-Kategorien (A14, dokumentiert-deterministisch) ────────
//
// Reihenfolge = Davids genannte Kern-Erlasse. Jede Kategorie nennt ihr anker-
// festes Erkennungsmuster (Titel/Kürzel des AMTLICHEN Erlasses). Muster sind
// bewusst eng verankert (Wortanfang / Kürzel-Präfix), um Fehlgriffe zu vermeiden
// («Verordnung über das Verfassungsgericht» ist KEINE Verfassung). Ein Fehlgriff
// wäre ohnehin nur eine Anzeige-Umsortierung (§3), nie ein Rechtsfehler.

/** Kern-Kategorien in Relevanz-Reihenfolge (Index = Rang; kleiner = wichtiger). */
export const KANTON_KERN_KATEGORIEN: ReadonlyArray<{
  id: string;
  label: string;
  /** §7/§8-Beleg: welche Kern-Erlasse diese Kategorie zieht (David A14). */
  beleg: string;
  /** Deterministisches Erkennungsmuster auf Titel bzw. Kürzel. */
  trifft: (titel: string, kuerzel: string) => boolean;
}> = [
  {
    id: 'verfassung',
    label: 'Kantonsverfassung',
    beleg: 'Die Kantons-/Staatsverfassung — höchste kantonale Rechtsquelle (David A14: «Verfassung … zuerst»).',
    trifft: (t, k) =>
      /^(kantons|staats)?verfassung\b/i.test(t.trim()) || /^KV\b/.test(k),
  },
  {
    id: 'einfuehrung',
    label: 'Einführungsgesetze zum Bundesrecht',
    beleg: 'Einführungsgesetze zu ZGB/OR/StGB/StPO/ZPO — kantonale Anschlussgesetzgebung (David A14: «EG ZGB … zuerst»).',
    trifft: (t, k) =>
      /einf[üu]hrungsgesetz/i.test(t) || /^EG[\s-]?(ZGB|OR|StGB|StPO|ZPO|SchKG)/i.test(k),
  },
  {
    id: 'organisation',
    label: 'Gerichts- & Behördenorganisation, Verwaltungsrechtspflege',
    beleg: 'Gerichtsorganisation/GOG, Justiz-, Gemeinde- und Verwaltungsverfahrensrecht — der institutionelle Rahmen (David A14: «GOG … zuerst»).',
    trifft: (t) =>
      /(gerichts(organisation|verfassung|gesetz)|justizgesetz|verwaltungsrechtspflege|verwaltungsverfahren|gemeindegesetz|kantonsratsgesetz|organisationsgesetz)/i.test(t),
  },
  {
    id: 'steuern-gebuehren',
    label: 'Steuer- & Gebührenrecht',
    beleg: 'Steuergesetz/-verordnung und Gebührentarife/-verordnungen — die fiskalische Kern-Ordnung (David A14: «Steuergesetz / Gebührentarife zuerst»).',
    trifft: (t) =>
      /(steuergesetz|steuerverordnung|geb[üu]hrentarif|geb[üu]hrenverordnung|geb[üu]hrengesetz|geb[üu]hrenordnung)/i.test(t),
  },
];

/** Kern-Kategorie-Rang eines kantonalen Erlasses (0..N; N = keine Kern-Kategorie).
 *  Reine Titel-/Kürzel-Klassifikation, deterministisch (§2). */
export function kantonKernRang(e: Pick<BrowseErlass, 'titel' | 'kuerzel'>): number {
  const i = KANTON_KERN_KATEGORIEN.findIndex((kat) => kat.trifft(e.titel, e.kuerzel));
  return i === -1 ? KANTON_KERN_KATEGORIEN.length : i;
}

/** Relevanz-Vergleich für die Erlasse EINES Kantons (A14). Kern-Kategorie →
 *  Volltext → amtliche Systematik (Sachgebiets-Rang · SR-Vergleich) → Titel.
 *  `sys` = amtlicher Systematik-Baum des Kantons (für den Systematik-Tiebreak). */
export function kantonRelevanzVergleich(
  sys: KantonSystematik | undefined,
): (a: BrowseErlass, b: BrowseErlass) => number {
  const rangTop = sachgebietRang(sys);
  const topVon = (e: BrowseErlass) => sachgruppe(sys, e.sr).top;
  return (a, b) =>
    kantonKernRang(a) - kantonKernRang(b) ||
    lesbar0(a) - lesbar0(b) ||
    rangTop(topVon(a)) - rangTop(topVon(b)) ||
    srVergleich(a.sr, b.sr) ||
    a.titel.localeCompare(b.titel, 'de');
}

/** Nach Kanton-Relevanz sortierte Kopie (A14). */
export function nachKantonRelevanz(
  erlasse: readonly BrowseErlass[],
  sys: KantonSystematik | undefined,
): BrowseErlass[] {
  return [...erlasse].sort(kantonRelevanzVergleich(sys));
}

// ── INTERNATIONAL: SR-0.*-Sachklassen (A15 «Rechtsgebiet»-Modus) ──────────────
//
// International-Erlasse teilen alle das Register-Gebiet 'international' — die
// `rechtsgebiet`-Achse gruppiert sie also NICHT. Die echte, amtliche Sach-Achse
// des Völkerrechts ist die erste Ziffer der SR-Nummer (0.1 … 0.9) der
// Systematischen Rechtssammlung (Fedlex SR-Klassifikation, dokumentiert). EU-
// Verordnungen (EUR-Lex, ohne SR-Nummer) bilden ehrlich eine eigene Gruppe (§8).

// Wortlaut wörtlich aus der amtlichen SR-Systematik (Fedlex SPARQL,
// legal-taxonomy `id-systematique`, DE, abgerufen 2026-07-05; gegengeprüft).
// ACHTUNG (Gegenprüfung 5.7.2026): 0.5 ist im VÖLKERRECHT «Krieg und Neutralität»
// — NICHT «Landesverteidigung» (das ist die nationalrechtliche SR-Hauptklasse 5).
// Belegt über die 0.5x-Unterklassen (0.51 Militärische Verteidigung, 0.52
// Bevölkerungs-/Zivilschutz). Trennzeichen als En-Dash (Haus-Typografie; die
// Sachbezeichnung ist load-bearing, das Trenn-Glyph nicht, §3).
export const SR0_KLASSEN: ReadonlyArray<{ ziffer: string; label: string }> = [
  { ziffer: '1', label: 'Internationales Recht im Allgemeinen' },
  { ziffer: '2', label: 'Privatrecht – Zivilrechtspflege – Vollstreckung' },
  { ziffer: '3', label: 'Strafrecht – Rechtshilfe' },
  { ziffer: '4', label: 'Schule – Wissenschaft – Kultur' },
  { ziffer: '5', label: 'Krieg und Neutralität' },
  { ziffer: '6', label: 'Finanzen' },
  { ziffer: '7', label: 'Öffentliche Werke – Energie – Verkehr' },
  { ziffer: '8', label: 'Gesundheit – Arbeit – Soziale Sicherheit' },
  { ziffer: '9', label: 'Wirtschaft – Technische Zusammenarbeit' },
];

/** Erste SR-0.*-Sachziffer eines International-Erlasses ('1'..'9') oder null
 *  (kein SR-Anschluss = EU-Recht/EUR-Lex). Deterministisch aus `sr`. */
export function intlSachziffer(sr: string | null): string | null {
  const m = sr?.match(/^0\.(\d)/);
  return m ? m[1] : null;
}
