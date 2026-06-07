// ─── Notariatsgebühren der Gründungs-Beurkundung je Kanton (P11) ─────────────
//
// Quelle: bibliothek/kosten/notariatstarife-gruendung-kantone.md (7.6.2026;
// amtliche Erlasssammlungs-APIs, abrogated/future_versions geprüft —
// Daueranweisung David). Status ERSTRECHERCHE — fachliche Abnahme ausstehend;
// die UI legt das offen (§8). Tarifwerte NETTO (MWST 8,1 % und Auslagen
// kommen hinzu); Bemessungsgrundlage = Kapital in CHF (Agio zählt nur in BE
// ausdrücklich zur Basis — dort als Hinweis; übrige Kantone konservativ ohne
// Agio, Verifikation offen). Fremdwährungs-Kapital: Bemessung am
// CHF-Gegenwert ist nicht verifiziert → ehrlich «offen».
//
// §4/§5: reine Datenschicht + deterministische Rechnung, KEINE UI; die
// Gründungs-Masken (AG, später GmbH — die Tarife gelten je Erlass auch der
// GmbH) konsumieren das Ergebnis.

export type NotariatsGebuehr =
  | { typ: 'betrag'; chf: number }
  | { typ: 'rahmen'; vonChf: number; bisChf: number; mittelChf?: number }
  | { typ: 'aufwand' }
  | { typ: 'offen' };

export type NotariatsTarifAuskunft = {
  kanton: string;
  ergebnis: NotariatsGebuehr;
  /** Massgeblicher Erlass (amtliche konsolidierte Fassung). */
  erlassLabel: string;
  erlassUrl: string;
  stand: string;
  /** Offenzulegende Besonderheiten (§8). */
  hinweise: string[];
};

const clamp = (x: number, lo: number, hi: number) => Math.min(Math.max(x, lo), hi);

/** BE Anhang 4 zu Art. 21 GebVN (Stand 1.7.2006): Kapital-Obergrenze der
 *  Stufe → [Minimum, Mittel, Maximum]. */
const BE_ANHANG_4: [number, number, number, number][] = [
  [200_000, 1_000, 1_300, 1_600],
  [300_000, 1_150, 1_500, 1_850],
  [400_000, 1_300, 1_700, 2_100],
  [500_000, 1_450, 1_900, 2_350],
  [600_000, 1_600, 2_100, 2_600],
  [700_000, 1_750, 2_300, 2_850],
  [800_000, 1_900, 2_500, 3_100],
  [900_000, 2_050, 2_700, 3_350],
  [1_000_000, 2_200, 2_900, 3_600],
  [2_000_000, 2_950, 3_900, 4_850],
  [3_000_000, 3_700, 4_900, 6_100],
  [4_000_000, 4_450, 5_900, 7_350],
  [5_000_000, 5_200, 6_900, 8_600],
  [10_000_000, 8_950, 11_900, 14_850],
  [15_000_000, 12_700, 16_900, 21_100],
  [20_000_000, 16_450, 21_900, 27_350],
];

/** Gebühr der Gründungs-Beurkundung für das CHF-Kapital; null = Kanton ohne
 *  Dossier-Eintrag (ehrliche Lücke — UI zeigt den generischen Hinweis). */
export function notariatsGebuehrGruendung(kanton: string, kapitalChf: number): NotariatsTarifAuskunft | null {
  const k = kapitalChf;
  switch (kanton) {
    case 'ZH':
      return {
        kanton,
        // Ziff. 4.4.3.1 NotGebV: 1‰ vom Kapital, Rahmen 500–5'000 für die
        // «übrigen Gesellschaften» (Normalfall der Neugründung ohne
        // ordentliche Revisionspflicht); Publikums-/grössere Gesellschaften
        // (Art. 727 Abs. 1 OR) bis 15'000/10'000 — als Hinweis offengelegt.
        ergebnis: { typ: 'betrag', chf: clamp(k * 0.001, 500, 5_000) },
        erlassLabel: 'NotGebV ZH (LS 243), Ziff. 4.4.3.1',
        erlassUrl: 'https://www.zhlex.zh.ch/Erlass.html?Open&Ordnr=243',
        stand: 'Nachtrag-Verifikation 123 offen (Dossier)',
        hinweise: [
          '1‰ vom Kapital im Rahmen CHF 500–5’000 (übrige Gesellschaften); bei ordentlicher Revisionspflicht nach Art. 727 Abs. 1 OR gelten Rahmen bis CHF 10’000 bzw. 15’000.',
        ],
      };
    case 'BE': {
      const stufe = BE_ANHANG_4.find(([bis]) => k <= bis);
      if (!stufe) return {
        kanton,
        ergebnis: { typ: 'offen' },
        erlassLabel: 'GebVN BE (BSG 169.81), Art. 21 + Anhang 4',
        erlassUrl: 'https://www.belex.sites.be.ch/app/de/texts_of_law/169.81',
        stand: '1.3.2022',
        hinweise: ['Anhang 4 endet bei Kapital CHF 20 Mio. — darüber nicht abgebildet.'],
      };
      return {
        kanton,
        ergebnis: { typ: 'rahmen', vonChf: stufe[1], bisChf: stufe[3], mittelChf: stufe[2] },
        erlassLabel: 'GebVN BE (BSG 169.81), Art. 21 + Anhang 4',
        erlassUrl: 'https://www.belex.sites.be.ch/app/de/texts_of_law/169.81',
        stand: '1.3.2022',
        hinweise: [
          'Bemessung nach Kapital UND allfälligem Agio (Art. 21 Abs. 1 GebVN). Bei ausschliesslicher Barliberierung darf das Minimum um bis zu 50 % unterschritten werden (Abs. 5); Online-Gründung über das Portal nach Zeitaufwand, mindestens CHF 150 (Abs. 6).',
        ],
      };
    }
    case 'LU': {
      const kk = Math.min(k, 10_000_000);
      let g = Math.min(kk, 500_000) * 0.003;
      g += clamp(kk - 500_000, 0, 500_000) * 0.0025;
      g += clamp(kk - 1_000_000, 0, 1_000_000) * 0.002;
      g += clamp(kk - 2_000_000, 0, 3_000_000) * 0.0015;
      g += clamp(kk - 5_000_000, 0, 5_000_000) * 0.0005;
      return {
        kanton,
        ergebnis: { typ: 'betrag', chf: clamp(g, 1_000, 11_750) },
        erlassLabel: 'BeurkGebV LU (SRL 258), § 37',
        erlassUrl: 'https://srl.lu.ch/app/de/texts_of_law/258',
        stand: '1.1.2022',
        hinweise: ['Progressive Promille-Staffel (3‰ bis CHF 500’000, degressiv darüber), mindestens CHF 1’000, höchstens CHF 11’750; gilt nach § 42 auch der GmbH-Gründung.'],
      };
    }
    case 'SG': {
      const stufen = Math.max(1, Math.ceil(k / 100_000));
      return {
        kanton,
        ergebnis: { typ: 'betrag', chf: Math.min(385 + (stufen - 1) * 80, 15_000) },
        erlassLabel: 'GebT SG (sGS 821.5), Nr. 60.13',
        erlassUrl: 'https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/821.5',
        stand: '1.1.2026',
        hinweise: [
          'CHF 385 für die ersten CHF 100’000, je weitere CHF 100’000 zusätzlich CHF 80, höchstens CHF 15’000 (Taxe der Amtsnotariate; Lesart «volle» weitere Stufen als angebrochene gezählt — Verifikation offen).',
        ],
      };
    }
    case 'BS': {
      if (k < 100_000) {
        return {
          kanton,
          ergebnis: { typ: 'rahmen', vonChf: 750, bisChf: 2_000 },
          erlassLabel: 'Notariatstarif BS (SG 292.400), Ziff. 33 lit. a',
          erlassUrl: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/292.400',
          stand: '1.7.2016',
          hinweise: ['Kapital unter CHF 100’000: Rahmen nach Interesse und Aufwand (§ 5).'],
        };
      }
      let g = 2_000;
      g += clamp(k - 100_000, 0, 100_000) * 0.0024;
      g += clamp(k - 200_000, 0, 800_000) * 0.0022;
      g += clamp(k - 1_000_000, 0, 2_000_000) * 0.002;
      g += clamp(k - 3_000_000, 0, 2_000_000) * 0.0015;
      g += clamp(k - 5_000_000, 0, 5_000_000) * 0.001;
      g += Math.max(0, k - 10_000_000) * 0.00075;
      return {
        kanton,
        ergebnis: { typ: 'betrag', chf: Math.min(g, 50_000) },
        erlassLabel: 'Notariatstarif BS (SG 292.400), Ziff. 33 lit. a',
        erlassUrl: 'https://www.gesetzessammlung.bs.ch/app/de/texts_of_law/292.400',
        stand: '1.7.2016',
        hinweise: ['Sockel CHF 2’000 bei Kapital CHF 100’000; vom Mehrbetrag degressive Prozent-Staffel (0,24 %–0,075 %), höchstens CHF 50’000; vollständige Gründung einschliesslich Statutenentwurf.'],
      };
    }
    case 'AG':
      return {
        kanton,
        ergebnis: { typ: 'aufwand' },
        erlassLabel: 'Dekret Notariatstarif AG (SAR 295.250), § 1',
        erlassUrl: 'https://gesetzessammlungen.ag.ch/app/de/texts_of_law/295.250',
        stand: '1.1.2025',
        hinweise: [
          'Gesellschaftsgründungen sind nicht tarifiert — Gebühr nach Aufwand, Stundenansatz höchstens CHF 300 (§ 1); der Promilletarif (§ 2) gilt nur Grundstücken/Baurechten. Amtlich nicht bezifferbar.',
        ],
      };
    default:
      return null;
  }
}
