import type { Skala, Kanton } from '../types/legal';

// ─── Lohnfortzahlungsskalen ───────────────────────────────────────────────
//
// WICHTIG: Diese Werte sind GERICHTSPRAXIS zur Konkretisierung von Art. 324a
// Abs. 2 OR («angemessen längere Zeit»), KEINE Gesetzesnormen und für die
// Gerichte nicht verbindlich (SHK Art. 324a N 50).
// Vor Produktiveinsatz gegen aktuelle kantonale Praxis abzugleichen.
// Stand der Tabellen: Gerichtspraxis, mehrheitlich anerkannte Werte.
// Alle Einträge sind als «zu verifizieren» zu behandeln.
//
// §2.5: Aus der vorliegenden SECO-/SHK-Tabelle (Seite 232, bis 11. DJ abgedruckt)
// belegt ist die ZUORDNUNG nur für: Basel BS/BL, Zürich ZH/GR, Bern BE/AG/OW/SG +
// Westschweiz. Weitere Kantone (SH, TG, ZG sowie übrige Berner-Skala-Kantone) sind
// eine ANNAHME des Tools (verifiziert: false) und werden mit Warnhinweis versehen.
// Fortschreibungen über das 11. Dienstjahr hinaus sind aus der Quelle nicht belegt.

export const SKALA_BASEL: Skala = {
  name: 'Basler Skala',
  kantone: ['BS', 'BL'],
  quellenhinweis:
    'Gerichtspraxis Basel-Stadt/Basel-Landschaft. ' +
    'Werte vor Produktiveinsatz gegen aktuelle kantonale Praxis abzugleichen.',
  eintraege: [
    { dienstjahrVon: 1, dienstjahrBis: 1,  dauer: { typ: 'wochen', anzahl: 3 } },
    { dienstjahrVon: 2, dienstjahrBis: 3,  dauer: { typ: 'monate', anzahl: 2 } },
    { dienstjahrVon: 4, dienstjahrBis: 10, dauer: { typ: 'monate', anzahl: 3 } },
    { dienstjahrVon: 11, dienstjahrBis: 15, dauer: { typ: 'monate', anzahl: 4 } },
    { dienstjahrVon: 16, dienstjahrBis: 20, dauer: { typ: 'monate', anzahl: 5 } },
    { dienstjahrVon: 21, dienstjahrBis: null, dauer: { typ: 'monate', anzahl: 6 } },
  ],
};

export const SKALA_BERN: Skala = {
  name: 'Berner Skala',
  kantone: [
    'BE', 'AG', 'AI', 'AR', 'FR', 'GE', 'GL', 'JU', 'LU', 'NE',
    'NW', 'OW', 'SG', 'SO', 'SZ', 'TI', 'UR', 'VD', 'VS',
  ],
  quellenhinweis:
    'Berner Skala (für Restkantone ohne spezifische Kantonspraxis). ' +
    'Werte vor Produktiveinsatz gegen aktuelle kantonale Praxis abzugleichen.',
  eintraege: [
    { dienstjahrVon: 1,  dienstjahrBis: 1,  dauer: { typ: 'wochen', anzahl: 3 } },
    { dienstjahrVon: 2,  dienstjahrBis: 2,  dauer: { typ: 'monate', anzahl: 1 } },
    { dienstjahrVon: 3,  dienstjahrBis: 4,  dauer: { typ: 'monate', anzahl: 2 } },
    { dienstjahrVon: 5,  dienstjahrBis: 9,  dauer: { typ: 'monate', anzahl: 3 } },
    { dienstjahrVon: 10, dienstjahrBis: 11, dauer: { typ: 'monate', anzahl: 4 } },
    { dienstjahrVon: 12, dienstjahrBis: 16, dauer: { typ: 'monate', anzahl: 5 } },
    { dienstjahrVon: 17, dienstjahrBis: null, dauer: { typ: 'monate', anzahl: 6 } },
  ],
};

export const SKALA_ZUERICH: Skala = {
  name: 'Zürcher Skala',
  // ZG/GR: Zuordnung unsicher, separater Warnhinweis wird generiert
  kantone: ['ZH', 'SH', 'TG', 'ZG', 'GR'],
  quellenhinweis:
    'Zürcher Skala. ZG/GR: Zuordnung zu verifizieren. ' +
    'Werte vor Produktiveinsatz gegen aktuelle kantonale Praxis abzugleichen.',
  eintraege: [
    { dienstjahrVon: 1,  dienstjahrBis: 1,  dauer: { typ: 'wochen', anzahl: 3 } },
    { dienstjahrVon: 2,  dienstjahrBis: 2,  dauer: { typ: 'wochen', anzahl: 8 } },
    // Ab 3. DJ: +1 Woche je weiteres Dienstjahr (9, 10, 11 …)
    // Gespeichert als Einträge bis DJ 52 (praktische Obergrenze)
    ...Array.from({ length: 50 }, (_, i) => ({
      dienstjahrVon: i + 3,
      dienstjahrBis: i + 3,
      dauer: { typ: 'wochen' as const, anzahl: 9 + i },
    })),
  ],
};

export const ALLE_SKALEN: Skala[] = [SKALA_BASEL, SKALA_ZUERICH, SKALA_BERN];

export function skaleFuerKanton(kanton: Kanton): { skala: Skala; warnung?: string } {
  const skala = ALLE_SKALEN.find((s) => (s.kantone as string[]).includes(kanton));
  if (!skala) {
    return { skala: SKALA_BERN, warnung: `Für Kanton ${kanton} keine spezifische Skala hinterlegt; Berner Skala als Näherung verwendet. Zuordnung zu verifizieren.` };
  }
  const warnung =
    kanton === 'ZG' || kanton === 'GR'
      ? `Kanton ${kanton}: Zuordnung zur Zürcher Skala in der Praxis uneinheitlich. Bitte aktuelle kantonale Praxis prüfen.`
      : undefined;
  return { skala, warnung };
}

export function dauerAusSkala(skala: Skala, dienstjahr: number): import('../types/legal').SkalaEintrag | null {
  return (
    skala.eintraege.find(
      (e) => e.dienstjahrVon <= dienstjahr && (e.dienstjahrBis === null || e.dienstjahrBis >= dienstjahr),
    ) ?? null
  );
}
