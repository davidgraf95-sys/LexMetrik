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
  /**
   * Entscheidgebühr bei NICHT VERMÖGENSRECHTLICHEN Streitigkeiten
   * (Persönlichkeit, Kindesbelange, Statusfragen u. a.). Separater
   * kantonaler Rahmen ODER — bei den 7 Auffang-Kantonen (SZ, FR, SH, AR,
   * AI, SG, GR) — Klausel-/Bemessungstext statt eines erfundenen Zahlen-
   * rahmens. Bundesrechtliche Kostenfreiheit (Art. 114 ZPO bei
   * Gewaltschutz/GlG/BehiG) prüft die Engine VOR dieser Schicht.
   * Quelle: bibliothek/recherche/gebuehren-nichtvermoegensrechtlich.md
   * (6.6.2026, einfach belegt; adversarialer Doppelcheck ausstehend).
   */
  nichtVermoegensrechtlich?: KostenRahmen;
  /**
   * Eigener Familien-/Scheidungsrahmen, nur wo der Erlass ihn ausdrücklich
   * ausweist (sonst läuft Familie über `nichtVermoegensrechtlich`). Bei NE
   * eine einkommens-/vermögensabhängige FORMEL (kein Rahmen — nicht als
   * rechenbar darstellen).
   */
  familie?: KostenRahmen;
}

export const ZUSTAENDIGKEIT_KOSTEN: Record<Kanton, KantonKosten> = {
  ZH: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 65–1'240 (streitwertgestuft)", erlass: 'GebV OG § 3, LS 211.11' },
    gericht: { text: 'Formel-Tarif nach Streitwert', erlass: 'GebV OG § 4, LS 211.11', hinweis: "z. B. Sockel CHF 3'150 + 8 % des CHF 20'000 übersteigenden Betrags im Band 20'000–80'000" },
    nichtVermoegensrechtlich: { text: "CHF 300–13'000", erlass: 'GebV OG § 5, LS 211.11', hinweis: 'nach tatsächlichem Streitinteresse / Zeitaufwand / Schwierigkeit' },
    familie: { text: 'Scheidung auf gemeinsames Begehren / Eheschutz: Reduktion bis zur Hälfte des Grundtarifs', erlass: 'GebV OG § 6, LS 211.11' },
  },
  BE: {
    stand: '5.6.2026',
    schlichtung: { text: "100–1'000 (Taxpunkte à CHF 1)", erlass: 'VKD Art. 35, BSG 161.12' },
    gericht: { text: "Streitwert 30'000–100'000: 1'000–20'000 Taxpunkte (à CHF 1)", erlass: 'VKD Art. 36, BSG 161.12' },
    nichtVermoegensrechtlich: { text: "200–10'000 Taxpunkte (à CHF 1)", erlass: 'VKD Art. 37, BSG 161.12', hinweis: "vereinfacht (Art. 39) 200–7'500 TP; Berufung nicht vermögensr. (Art. 45) 200–12'000 TP" },
    familie: { text: "600–12'000 Taxpunkte (à CHF 1)", erlass: 'VKD Art. 41, BSG 161.12', hinweis: "summarisches Verfahren (Art. 40) 100–20'000 TP" },
  },
  LU: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 200–2'000 (streitwertgestuft)", erlass: 'JusKV § 4, SRL 265' },
    gericht: { text: "Streitwert bis 100'000: CHF 1'500–8'000", erlass: 'JusKV § 5, SRL 265' },
    nichtVermoegensrechtlich: { text: "CHF 1'000–12'000", erlass: 'JusKV § 5 Abs. 1, SRL 265', hinweis: "vereinfacht (§ 6) CHF 500–5'000; summarisch (§ 7) CHF 300–4'000" },
    familie: { text: 'eigener Familienrecht-Abschnitt (§ 8); Detailbeträge am Volltext nachzuziehen', erlass: 'JusKV § 8, SRL 265', hinweis: 'Familien-Detailbeträge § 8 noch nicht erfasst (offener Punkt Dossier)' },
  },
  UR: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 200–2'000", erlass: 'GGebR Art. 4, RB 2.3232' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 2'000–12'000", erlass: 'GGebR Art. 5, RB 2.3232' },
    nichtVermoegensrechtlich: { text: "CHF 200–10'000", erlass: 'GGebR Art. 5 Abs. 1, RB 2.3232', hinweis: "vereinfacht (Art. 6) CHF 200–5'000" },
    familie: { text: "CHF 500–10'000 (familienrechtliche Verfahren inkl. Summarverfahren)", erlass: 'GGebR Art. 8, RB 2.3232' },
  },
  SZ: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 100–1'000 (Pauschale)", erlass: 'GebO § 31, SRSZ 173.111' },
    gericht: { text: "Rahmen ohne Staffel: Einzelrichter bis 50'000, Bezirksgericht bis 100'000", erlass: 'GebO § 33, SRSZ 173.111' },
    nichtVermoegensrechtlich: { text: "kein eigener Rahmen — Bemessung nach Bedeutung/Zeitaufwand innerhalb der Instanz-Rahmen (Einzelrichter 100–50'000, Bezirksgericht 100–100'000)", erlass: 'GebO §§ 3/33, SRSZ 173.111', hinweis: 'rein bemessungsabhängig (§ 3, max. CHF 180/Std.); kein tariflicher Sonderrahmen' },
  },
  OW: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 100–1'000", erlass: 'GebOR Art. 8, GDB 134.15' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 1'500–6'000 (Kantonsgericht)", erlass: 'GebOR Art. 12, GDB 134.15' },
    nichtVermoegensrechtlich: { text: "CHF 100–5'000 (Einzelrichter) · CHF 800–10'000 (Kantonsgericht Kollegial)", erlass: 'GebOR Art. 9/12, GDB 134.15', hinweis: "Obergericht Beschwerde (Art. 14) 200–5'000; Güterrecht > 50'000 → Streitwert-Ansätze hinzu" },
    familie: { text: "= nicht-vermögensrechtliche Zeile «ohne Vermögensinteressen / familienrechtlich» (CHF 100–5'000 EinzelR · CHF 800–10'000 KG)", erlass: 'GebOR Art. 9/12, GDB 134.15' },
  },
  NW: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–700 (streitwertgestuft)', erlass: 'PKoG Art. 6, NG 261.2' },
    gericht: { text: "Streitwert 30'000–150'000: CHF 1'500–6'000", erlass: 'PKoG Art. 7, NG 261.2' },
    nichtVermoegensrechtlich: { text: "CHF 300–10'000", erlass: 'PKoG Art. 7 Abs. 2, NG 261.2', hinweis: 'ohne bestimmbaren Streitwert' },
    familie: { text: "Scheidung CHF 800–4'000 u. a. (eigener familienrechtlicher Abschnitt)", erlass: 'PKoG Art. 7 Abs. 3, NG 261.2' },
  },
  GL: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–800 (Pauschale)', erlass: 'Kosten-VO Art. 2, GS III A/5' },
    gericht: { text: "Streitwert bis 100'000: CHF 500–10'000", erlass: 'Kosten-VO Art. 3, GS III A/5' },
    nichtVermoegensrechtlich: { text: "höchstens CHF 20'000 (keine Untergrenze normiert)", erlass: 'Kosten-VO Art. 3 Abs. 2, GS III A/5', hinweis: 'Untergrenze nur via Bemessung Art. 1; summarisch höchstens die Hälfte' },
  },
  ZG: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–1'200 (streitwertgestuft)", erlass: 'KoV OG § 10, BGS 161.7' },
    gericht: { text: "Streitwert 20'000–100'000: CHF 2'400–6'000", erlass: 'KoV OG § 11, BGS 161.7' },
    nichtVermoegensrechtlich: { text: "CHF 150–12'000", erlass: 'KoV OG § 11 Abs. 2, BGS 161.7', hinweis: 'periodische Leistungen bis auf die Hälfte ermässigbar' },
    familie: { text: "CHF 1'600–12'000", erlass: 'KoV OG § 13, BGS 161.7', hinweis: 'summarisch bis halbiert' },
  },
  FR: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–10'000 (weiter Rahmen)", erlass: 'JR Art. 18, SGF 130.11' },
    gericht: { text: "Rahmen CHF 100–500'000 (Zivilgericht)", erlass: 'JR Art. 20, SGF 130.11' },
    nichtVermoegensrechtlich: { text: "kein separater publizierter Rahmen — es gelten die weiten Gericht-Rahmen (Zivilgericht CHF 100–500'000, verdoppelbar; Kantonsgericht 100–200'000)", erlass: 'JR Art. 19/20, SGF 130.11', hinweis: 'Streitwert-Abstufung erstellt das Kantonsgericht intern (Art. 21 JR) — nicht als BDLF-Erlass publiziert' },
  },
  SO: {
    stand: '5.6.2026',
    schlichtung: { text: 'Friedensrichter CHF 50–200 · übrige Stellen CHF 200–1\'500', erlass: 'GT §§ 152bis/144, BGS 615.11' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 600–8'000", erlass: 'GT § 145, BGS 615.11' },
    nichtVermoegensrechtlich: { text: "CHF 200–20'000 (nicht bezifferbarer Streitwert)", erlass: 'GT § 145 Abs. 3, BGS 615.11', hinweis: 'eine § 145-Staffel gilt für alle Instanzen' },
  },
  BS: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 100 bis 30 % der Entscheidgebühr, max. CHF 10'000", erlass: 'GGR § 3, SG 154.810' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 3'000–6'000", erlass: 'GGR § 5, SG 154.810' },
    nichtVermoegensrechtlich: { text: "CHF 200–250'000", erlass: 'GGR § 5 Abs. 3, SG 154.810', hinweis: 'weitester kantonaler Rahmen' },
    familie: { text: "Eheschutz CHF 300–2'000 (aufwendig bis 10'000)", erlass: 'GGR § 10, SG 154.810' },
  },
  BL: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 50–300 ohne / CHF 100–500 mit Verhandlung', erlass: 'GebT § 7, SGS 170.31' },
    gericht: { text: "Streitwert bis 100'000: CHF 1'500–10'000", erlass: 'GebT § 8, SGS 170.31' },
    nichtVermoegensrechtlich: { text: "CHF 200–30'000 (unbestimmter Streitwert)", erlass: 'GebT § 8 Abs. 1 lit. g, SGS 170.31' },
    familie: { text: "Eheschutz/Partnerschaftsschutz (lit. h) CHF 200–3'000 · Ehescheidung/-ungültigkeit/-trennung/Partnerschaftsauflösung (lit. i) CHF 200–15'000", erlass: 'GebT § 8 Abs. 1 lit. h/i, SGS 170.31' },
  },
  SH: {
    stand: '5.6.2026',
    schlichtung: { text: 'Vorstand CHF 50–100 (+ Nebengebühren)', erlass: 'ZPO SH Art. 109, SHR 273.100' },
    gericht: { text: "Streitwert bis 100'000: CHF 500–25'000 (Pauschale in jeder Instanz)", erlass: 'Art. 83 JG, SHR 173.200', hinweis: 'Tiefenerfassung 6.6.2026: Gebühren stehen im Justizgesetz (Fassung 1.5.2026) — die früher zitierte «Kostenverordnung 2003» war eine Fehlzuordnung (Luzern)' },
    nichtVermoegensrechtlich: { text: "kein eigener Bandrahmen — es wird vom tatsächlichen Streitinteresse ausgegangen, nach Ermessen bestimmt; die Vorschriften über den Streitwert gelten sinngemäss (Tarif Art. 83 sinngemäss)", erlass: 'Art. 81 Abs. 2 JG, SHR 173.200', hinweis: 'Fassung ab 1.5.2026; kein tariflicher Sonderrahmen' },
  },
  AR: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–200 (+100/Std.; Verdoppelung ab Streitwert 100'000)", erlass: 'GebO Art. 13, bGS 233.3' },
    gericht: { text: "Urteil CHF 100–5'000 (Erhöhung ×2 ab Streitwert 50'000, ×3 ab 100'000)", erlass: 'GebO Art. 17/20, bGS 233.3' },
    nichtVermoegensrechtlich: { text: "kein eigener Rahmen — Bemessung nach Bedeutung/Zeitaufwand innerhalb der Behörden-Rahmen (Einzelrichter KG Art. 14: 30–1'500; Kantonsgericht Kollegial Art. 17: 100–5'000)", erlass: 'GebO Art. 4/14/17, bGS 233.3', hinweis: 'kein tariflicher Sonderrahmen für nicht-vermögensrechtliche Streitigkeiten' },
    familie: { text: "Scheidung CHF 500–6'000 (Einzelrichter KG Art. 14; Obergericht Art. 16 ebenfalls 500–6'000)", erlass: 'GebO Art. 14/16, bGS 233.3' },
  },
  AI: {
    stand: '5.6.2026',
    schlichtung: { text: 'Vorstand CHF 50–300', erlass: 'GGV Art. 7, GS 173.810' },
    gericht: { text: "CHF 500–6'000 (Bezirksgericht; Erhöhung bis 300 % ab Streitwert 100'000)", erlass: 'GGV Art. 11/15, GS 173.810' },
    nichtVermoegensrechtlich: { text: "kein eigener Rahmen — Bemessung nach Bedeutung/Aufwand im Behörden-Rahmen (Einzelrichter Art. 10: 300–5'000; Bezirksgericht Kollegial Art. 11: 500–6'000; Rechtsmittel Art. 13: 800–8'000)", erlass: 'GGV Art. 2/10/11, GS 173.810', hinweis: 'Fassung ab 1.1.2024; kein tariflicher Sonderrahmen' },
  },
  SG: {
    stand: '5.6.2026',
    schlichtung: { text: "Klagebewilligung CHF 200–1'000", erlass: 'GKV Art. 8, sGS 941.12', hinweis: 'GKV in Vollzug nur bis 30.6.2026 — ab 1.7.2026 Nachfolgefassung prüfen!' },
    gericht: { text: "CHF 500–6'000 (Kreisgericht; Erhöhung bis 300 % ab Streitwert 100'000)", erlass: 'GKV Art. 10/11, sGS 941.12', hinweis: 'GKV endet 30.6.2026' },
    nichtVermoegensrechtlich: { text: "kein eigener Rahmen — Bemessung im Rahmen (Kreisgericht End-/Zwischenentscheide 500–6'000, Einzelrichter 500–5'000; Kantonsgericht Kammer Art. 10 Ziff. 2: 800–8'000)", erlass: 'GKV Art. 4/10, sGS 941.12', hinweis: 'GKV in Vollzug nur bis 30.6.2026 — ab 1.7.2026 Nachfolgefassung prüfen!' },
  },
  GR: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–500', erlass: 'VGZ Art. 2, BR 320.210' },
    gericht: { text: "ordentliches Verfahren: CHF 3'000–30'000", erlass: 'VGZ Art. 3, BR 320.210' },
    nichtVermoegensrechtlich: { text: "kein eigener Rahmen — Zuordnung über Verfahrenstyp (ordentlich Art. 3: 3'000–30'000; vereinfacht Art. 4: 1'000–8'000)", erlass: 'VGZ Art. 3/4, BR 320.210', hinweis: 'VO vom 2.1.2025; kein tariflicher Sonderrahmen für nicht-vermögensrechtliche Streitigkeiten' },
    familie: { text: "ehe-/kindesrechtliche Verfahren: Einzelrichter CHF 1'000–5'000 · Kollegialgericht CHF 3'000–8'000", erlass: 'VGZ Art. 6, BR 320.210' },
  },
  AG: {
    stand: '5.6.2026',
    schlichtung: { text: 'Erledigung/Klagebewilligung CHF 50–300 · Urteil(svorschlag) ab CHF 100', erlass: 'GebührD § 6, SAR 662.110' },
    gericht: { text: 'Formel-Tarif nach Streitwert', erlass: 'GebührD § 7, SAR 662.110', hinweis: "z. B. 52'001–100'000: 770 + 7 % des Streitwerts" },
    nichtVermoegensrechtlich: { text: "CHF 500–10'000", erlass: 'GebührD § 7 Abs. 2, SAR 662.110', hinweis: 'Stand 1.7.2024 (GebührD, nicht das aufgehobene VKD)' },
  },
  TG: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–500 (streitwertgestuft)', erlass: 'VGG § 7, RB 638.1' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 1'000–4'000", erlass: 'VGG § 11, RB 638.1' },
    nichtVermoegensrechtlich: { text: "CHF 300–5'000", erlass: 'VGG § 11 Ziff. 2, RB 638.1', hinweis: 'soweit nicht Ziff. 1 nach vermögensrechtlichen Ansprüchen anwendbar' },
  },
  TI: {
    stand: '5.6.2026',
    schlichtung: { text: "CHF 50–150 bis 3'000–0,5 % (streitwertgestuft); Verzicht bei Einigung möglich", erlass: 'LTG Art. 5, RL 178.200' },
    gericht: { text: "Streitwert 30'000–100'000: CHF 1'500–8'000", erlass: 'LTG Art. 7, RL 178.200' },
    nichtVermoegensrechtlich: { text: "CHF 250–20'000 (unbestimmter Streitwert / Scheidung)", erlass: 'LTG Art. 7 cpv. 2, RL 178.200', hinweis: 'summarisch (Art. 9) bzw. vereinfacht (Art. 8) je die Hälfte' },
    familie: { text: "Scheidung ist ausdrücklich in Art. 7 cpv. 2 erfasst (CHF 250–20'000)", erlass: 'LTG Art. 7 cpv. 2, RL 178.200' },
  },
  VD: {
    stand: '5.6.2026',
    schlichtung: { text: "Pauschale CHF 150–1'200 (+0,25 % über 500'000, max. CHF 5'000)", erlass: 'TFJC Art. 15, BLV 270.11.5' },
    gericht: { text: "Streitwert 30'001–100'000: Pauschale CHF 7'000", erlass: 'TFJC Art. 18, BLV 270.11.5' },
    nichtVermoegensrechtlich: { text: "ordentlich CHF 3'750–300'000 (Art. 21) · vereinfacht CHF 360–200'000 (Art. 26)", erlass: 'TFJC Art. 21/26, BLV 270.11.5', hinweis: "Berufung nicht vermögensr. (Art. 64) 800–6'000 (bis SW 30'000)" },
  },
  VS: {
    stand: '5.6.2026',
    schlichtung: { text: 'Vorladung CHF 50 · Verhandlung CHF 60–120', erlass: 'LTar Art. 15, RS 173.8' },
    gericht: { text: "Streitwert 20'000–100'000: CHF 1'800–9'600", erlass: 'LTar Art. 16, RS 173.8' },
    nichtVermoegensrechtlich: { text: "CHF 280–9'600 (ordentlich/vereinfacht)", erlass: 'LTar Art. 17, RS 173.8', hinweis: 'spätere Teilrevisionen nicht abgeglichen' },
    familie: { text: "Abänderung Scheidung/Trennung/Unterhalt: CHF 280–9'600 (bei Scheidung mit Güterrecht zusätzlich Streitwert-Tarif Art. 16)", erlass: 'LTar Art. 17, RS 173.8' },
  },
  NE: {
    stand: '5.6.2026',
    schlichtung: { text: "Pauschale CHF 300–2'500 (streitwertgestuft); auch bei Einigung geschuldet", erlass: 'LTFrais Art. 11, RSN 164.1' },
    gericht: { text: "Streitwert 30'001–100'000: CHF 4'000 + 3 % des 30'000 übersteigenden Betrags", erlass: 'LTFrais Art. 12, RSN 164.1' },
    nichtVermoegensrechtlich: { text: "CHF 500–50'000 (non patrimonial)", erlass: 'LTFrais Art. 12 al. 2bis, RSN 164.1', hinweis: 'état 1.4.2023' },
    familie: { text: "Scheidung: Formel 2,5–4 % des Einkommens + 2,5–4 ‰ des Vermögens, min. 600; gemeinsames Begehren mit vollständiger Einigung (Art. 18) 1,3 % / 1,3 ‰, min. 400 / max. 2'000", erlass: 'LTFrais Art. 16/17, RSN 164.1', hinweis: 'einkommens-/vermögensabhängige Formel — KEIN fixer Rahmen, nicht als rechenbar darstellen; %/‰-Sätze sind datierte Parameter (état 1.4.2023)' },
  },
  GE: {
    stand: '5.6.2026',
    schlichtung: { text: 'CHF 100–200 (Pauschale)', erlass: 'RTFMC Art. 15, rsGE E 1 05.10' },
    gericht: { text: "Streitwert 30'001–100'000: CHF 2'000–8'000", erlass: 'RTFMC Art. 17, rsGE E 1 05.10' },
    nichtVermoegensrechtlich: { text: "CHF 200–50'000 (causes non pécuniaires)", erlass: 'RTFMC Art. 18, rsGE E 1 05.10', hinweis: 'Stand 1.7.2025' },
  },
  JU: {
    stand: '5.6.2026',
    schlichtung: { text: "200–1'000 Punkte (Punktwert 1.05 ab 1.1.2025 ≈ CHF 210–1'050)", erlass: 'Décret Art. 21, RSJU 176.511', hinweis: 'Punktwert jährlich indexiert' },
    gericht: { text: "Streitwert 30'001–100'000: 3'000–30'000 Punkte (à CHF 1.05)", erlass: 'Décret Art. 19, RSJU 176.511' },
    nichtVermoegensrechtlich: { text: "juge civil 300–6'000 Punkte (≈ CHF 315–6'300; Tribunal des baux/prud'hommes 120–2'200; Cour civile 1'500–36'000)", erlass: 'Décret Art. 20, RSJU 176.511', hinweis: 'Punktwert 1.05 ab 1.1.2025 zwingend einrechnen' },
  },
};

export function kostenFuer(kanton: Kanton): KantonKosten | null {
  return ZUSTAENDIGKEIT_KOSTEN[kanton] ?? null;
}
