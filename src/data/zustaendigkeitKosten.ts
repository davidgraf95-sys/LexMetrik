import type { Kanton } from '../types/legal';

// ─── Kantonale Kosten-Rahmen für den Zuständigkeits-Fahrplan ────────────────
//
// Praxis-Ausbau (Anordnung David 5.6.2026, «maximal praxistauglich»):
// Der Fahrplan zeigt dem Nutzer die GEBÜHRENRAHMEN seines Kantons.
// Quellen: ZWEIFACH GEPRÜFTE Dossiers (alle Beträge wörtlich aus den
// geltenden Erlassen, Abruf 5.6.2026):
//   bibliothek/kosten/schlichtungsgebuehren-kantone.md
//   bibliothek/behoerden/gog-gerichtsorganisation-kantone.md (Zivil-Staffeln)
// Es sind RAHMEN (keine Berechnung!): die konkrete Festsetzung liegt bei
// der Behörde. Bundesrechtliche Kostenfreiheit (Art. 113 Abs. 2 ZPO)
// entscheidet die Engine — diese Schicht liefert nur die kantonalen Zahlen.
// Pflege: jeder Eintrag trägt den Erlass; Verfalls-Punkte (z. B. SG GKV
// endet 30.6.2026!) stehen im Parameter-Verfallsregister.

export interface KostenRahmen {
  /** Kurzrahmen in CHF, z. B. «100–1'000» oder beschreibend. */
  text: string;
  erlass: string;
  hinweis?: string;
}

export interface KantonKosten {
  stand: string;
  /** Schlichtungsgebühr (nicht-kostenlose Streitigkeiten, ordentliche Stelle). */
  schlichtung: KostenRahmen;
  /** Entscheidgebühr 1. Instanz (Zivil) — Rahmen/Verweis. */
  gericht: KostenRahmen;
}

export const ZUSTAENDIGKEIT_KOSTEN: Record<Kanton, KantonKosten> = {
  ZH: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 65–1'240 (streitwertgestuft)", erlass: 'GebV OG § 3, LS 211.11' },
    gericht: { text: 'Formel-Tarif nach Streitwert', erlass: 'GebV OG § 4, LS 211.11', hinweis: "z. B. Sockel CHF 3'150 + 8 % des CHF 20'000 übersteigenden Betrags im Band 20'000–80'000" },
  },
  BE: {
    stand: '5.6.2026',
    schlichtung: { text: "100–1'000 (Taxpunkte à CHF 1)", erlass: 'VKD Art. 35, BSG 161.12' },
    gericht: { text: "Streitwert 30'000–100'000: 1'000–20'000 Taxpunkte (à CHF 1)", erlass: 'VKD Art. 36, BSG 161.12' },
  },
  LU: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 200–2'000 (streitwertgestuft)", erlass: 'JusKV § 4, SRL 265' },
    gericht: { text: "Streitwert bis 100'000: CHF 1'500–8'000", erlass: 'JusKV § 5, SRL 265' },
  },
  UR: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 200–2'000", erlass: 'GGebR Art. 4, RB 2.3232' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 2'000–12'000", erlass: 'GGebR Art. 5, RB 2.3232' },
  },
  SZ: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 100–1'000 (Pauschale)", erlass: 'GebO § 31, SRSZ 173.111' },
    gericht: { text: "Rahmen ohne Staffel: Einzelrichter bis 50'000, Bezirksgericht bis 100'000", erlass: 'GebO § 33, SRSZ 173.111' },
  },
  OW: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 100–1'000", erlass: 'GebOR Art. 8, GDB 134.15' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 1'500–6'000 (Kantonsgericht)", erlass: 'GebOR Art. 12, GDB 134.15' },
  },
  NW: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–700 (streitwertgestuft)', erlass: 'PKoG Art. 6, NG 261.2' },
    gericht: { text: "Streitwert 30'000–150'000: CHF 1'500–6'000", erlass: 'PKoG Art. 7, NG 261.2' },
  },
  GL: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–800 (Pauschale)', erlass: 'Kosten-VO Art. 2, GS III A/5' },
    gericht: { text: "Streitwert bis 100'000: CHF 500–10'000", erlass: 'Kosten-VO Art. 3, GS III A/5' },
  },
  ZG: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–1'200 (streitwertgestuft)", erlass: 'KoV OG § 10, BGS 161.7' },
    gericht: { text: "Streitwert 20'000–100'000: CHF 2'400–6'000", erlass: 'KoV OG § 11, BGS 161.7' },
  },
  FR: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–10'000 (weiter Rahmen)", erlass: 'JR Art. 18, SGF 130.11' },
    gericht: { text: "Rahmen CHF 100–500'000 (Zivilgericht)", erlass: 'JR Art. 20, SGF 130.11' },
  },
  SO: {
    stand: '5.6.2026',
    schlichtung: { text: 'Friedensrichter CHF 50–200 · übrige Stellen CHF 200–1\'500', erlass: 'GT §§ 152bis/144, BGS 615.11' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 600–8'000", erlass: 'GT § 145, BGS 615.11' },
  },
  BS: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 100 bis 30 % der Entscheidgebühr, max. CHF 10'000", erlass: 'GGR § 3, SG 154.810' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 3'000–6'000", erlass: 'GGR § 5, SG 154.810' },
  },
  BL: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 50–300 ohne / CHF 100–500 mit Verhandlung', erlass: 'GebT § 7, SGS 170.31' },
    gericht: { text: "Streitwert bis 100'000: CHF 1'500–10'000", erlass: 'GebT § 8, SGS 170.31' },
  },
  SH: {
    stand: '5.6.2026',
    schlichtung: { text: 'Vorstand CHF 50–100 (+ Nebengebühren)', erlass: 'ZPO SH Art. 109, SHR 273.100' },
    gericht: { text: "Streitwert bis 100'000: CHF 500–25'000 (Pauschale in jeder Instanz)", erlass: 'Art. 83 JG, SHR 173.200', hinweis: 'Tiefenerfassung 6.6.2026: Gebühren stehen im Justizgesetz (Fassung 1.5.2026) — die früher zitierte «Kostenverordnung 2003» war eine Fehlzuordnung (Luzern)' },
  },
  AR: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–200 (+100/Std.; Verdoppelung ab Streitwert 100'000)", erlass: 'GebO Art. 13, bGS 233.3' },
    gericht: { text: "Urteil CHF 100–5'000 (Erhöhung ×2 ab Streitwert 50'000, ×3 ab 100'000)", erlass: 'GebO Art. 17/20, bGS 233.3' },
  },
  AI: {
    stand: '5.6.2026',
    schlichtung: { text: 'Vorstand CHF 50–300', erlass: 'GGV Art. 7, GS 173.810' },
    gericht: { text: "CHF 500–6'000 (Bezirksgericht; Erhöhung bis 300 % ab Streitwert 100'000)", erlass: 'GGV Art. 11/15, GS 173.810' },
  },
  SG: {
    stand: '5.6.2026',
    schlichtung: { text: "Klagebewilligung CHF 200–1'000", erlass: 'GKV Art. 8, sGS 941.12', hinweis: 'GKV in Vollzug nur bis 30.6.2026 — ab 1.7.2026 Nachfolgefassung prüfen!' },
    gericht: { text: "CHF 500–6'000 (Kreisgericht; Erhöhung bis 300 % ab Streitwert 100'000)", erlass: 'GKV Art. 10/11, sGS 941.12', hinweis: 'GKV endet 30.6.2026' },
  },
  GR: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–500', erlass: 'VGZ Art. 2, BR 320.210' },
    gericht: { text: "ordentliches Verfahren: CHF 3'000–30'000", erlass: 'VGZ Art. 3, BR 320.210' },
  },
  AG: {
    stand: '5.6.2026',
    schlichtung: { text: 'Erledigung/Klagebewilligung CHF 50–300 · Urteil(svorschlag) ab CHF 100', erlass: 'GebührD § 6, SAR 662.110' },
    gericht: { text: 'Formel-Tarif nach Streitwert', erlass: 'GebührD § 7, SAR 662.110', hinweis: "z. B. 52'001–100'000: 770 + 7 % des Streitwerts" },
  },
  TG: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–500 (streitwertgestuft)', erlass: 'VGG § 7, RB 638.1' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 1'000–4'000", erlass: 'VGG § 11, RB 638.1' },
  },
  TI: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–150 bis 3'000–0,5 % (streitwertgestuft); Verzicht bei Einigung möglich", erlass: 'LTG Art. 5, RL 178.200' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 1'500–8'000", erlass: 'LTG Art. 7, RL 178.200' },
  },
  VD: {
    stand: '5.6.2026',
    schlichtung: { text: "Pauschale CHF 150–1'200 (+0,25 % über 500'000, max. CHF 5'000)", erlass: 'TFJC Art. 15, BLV 270.11.5' },
    gericht: { text: "Streitwert 30'001–100'000: Pauschale CHF 7'000", erlass: 'TFJC Art. 18, BLV 270.11.5' },
  },
  VS: {
    stand: '5.6.2026',
    schlichtung: { text: 'Vorladung CHF 50 · Verhandlung CHF 60–120', erlass: 'LTar Art. 15, RS 173.8' },
    gericht: { text: "Streitwert 20'000–100'000: CHF 1'800–9'600", erlass: 'LTar Art. 16, RS 173.8' },
  },
  NE: {
    stand: '5.6.2026',
    schlichtung: { text: "Pauschale CHF 300–2'500 (streitwertgestuft); auch bei Einigung geschuldet", erlass: 'LTFrais Art. 11, RSN 164.1' },
    gericht: { text: "Streitwert 30'001–100'000: CHF 4'000 + 3 % des 30'000 übersteigenden Betrags", erlass: 'LTFrais Art. 12, RSN 164.1' },
  },
  GE: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–200 (Pauschale)', erlass: 'RTFMC Art. 15, rsGE E 1 05.10' },
    gericht: { text: "Streitwert 30'001–100'000: CHF 2'000–8'000", erlass: 'RTFMC Art. 17, rsGE E 1 05.10' },
  },
  JU: {
    stand: '5.6.2026',
    schlichtung: { text: "200–1'000 Punkte (Punktwert 1.05 ab 1.1.2025 ≈ CHF 210–1'050)", erlass: 'Décret Art. 21, RSJU 176.511', hinweis: 'Punktwert jährlich indexiert' },
    gericht: { text: "Streitwert 30'001–100'000: 3'000–30'000 Punkte (à CHF 1.05)", erlass: 'Décret Art. 19, RSJU 176.511' },
  },
};

export function kostenFuer(kanton: Kanton): KantonKosten | null {
  return ZUSTAENDIGKEIT_KOSTEN[kanton] ?? null;
}
