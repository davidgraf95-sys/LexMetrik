// ─── Varianten-Inventar (FAHRPLAN-VERTRAGS-VARIANTEN P1f) ───────────────────
//
// Ehrlicher Fortschrittszähler Richtung «1000 Vertragsvorlagen» (§8: keine
// Schaufenster-Zahl). Gezählt werden die regelbasiert ERZEUGBAREN Dokumente
// je Karte als konservative Schätzung nach der Zähl-Methodik des Fahrplans:
//
//   Dokumente je Untertyp = Detailgrade × kohärente Modulprofile
//
// «Modulprofile» = die Zahl der rechtlich KOHÄRENTEN Bündel der übrigen
// benutzerwählbaren Optionen (ohne Detailgrad), bewusst konservativ und NICHT
// die rohe Kombinatorik aller Felder (die wäre vielfach grösser, aber teils
// rechtlich unsinnig — §1/§8). Die Zahlen sind als Test fixiert
// (variantenInventar.test.ts), damit der Fortschritt nicht still driftet.
//
// Quelle der Profil-Zahlen: die tatsächlich im jeweiligen Schema angelegten
// Weichen (z. B. Arbeitsvertrag: Lohnmodell, Probezeit, Überstunden, Spesen,
// Lohnfortzahlung, GAV-Typ, Konkurrenzverbot, Befristung — daraus konservativ
// gebündelt). Beim Ausbau eines Schemas hier UND im Test nachführen.

export type UntertypInventar = {
  id: string;
  label: string;
  detailgrade: number;     // i. d. R. 3 (einfach/standard/experte)
  modulprofile: number;    // kohärente Optionsbündel ohne Detailgrad
};

export type KartenInventar = {
  karte: string;           // Katalog-ID (startseiteConfig)
  titel: string;
  untertypen: UntertypInventar[];
};

// Detailgrad-fähige Vertrags-Karten (Stand P1e, 14.6.2026).
export const VERTRAGS_INVENTAR: KartenInventar[] = [
  {
    karte: 'arbeitsvertrag', titel: 'Arbeitsvertrag',
    untertypen: [
      { id: 'einzel', label: 'Einzelarbeitsvertrag', detailgrade: 3, modulprofile: 6 },
      { id: 'kader', label: 'Kader / Manager', detailgrade: 3, modulprofile: 6 },
      { id: 'lehrvertrag', label: 'Lehrvertrag', detailgrade: 3, modulprofile: 4 },
      { id: 'handelsreisendenvertrag', label: 'Handelsreisendenvertrag', detailgrade: 3, modulprofile: 6 },
      { id: 'heimarbeitsvertrag', label: 'Heimarbeitsvertrag', detailgrade: 3, modulprofile: 4 },
    ],
  },
  {
    karte: 'mietvertrag', titel: 'Mietvertrag',
    untertypen: [
      { id: 'wohnung', label: 'Wohnraum', detailgrade: 3, modulprofile: 6 },
      { id: 'geschaeftsraum', label: 'Geschäftsraum', detailgrade: 3, modulprofile: 6 },
      { id: 'untermiete', label: 'Untermiete', detailgrade: 3, modulprofile: 4 },
    ],
  },
  {
    karte: 'auftrag', titel: 'Auftrag / Dienstleistung',
    untertypen: [{ id: 'standard', label: 'Auftrag', detailgrade: 3, modulprofile: 4 }],
  },
  {
    karte: 'werkvertrag', titel: 'Werkvertrag',
    untertypen: [{ id: 'standard', label: 'Werkvertrag', detailgrade: 3, modulprofile: 4 }],
  },
  {
    karte: 'nda', titel: 'Geheimhaltungsvereinbarung (NDA)',
    untertypen: [{ id: 'standard', label: 'NDA', detailgrade: 3, modulprofile: 3 }],
  },
  {
    karte: 'konkubinat', titel: 'Konkubinatsvertrag',
    untertypen: [{ id: 'standard', label: 'Konkubinat', detailgrade: 3, modulprofile: 3 }],
  },
];

export const ZIEL_DOKUMENTE = 1000;

export function dokumenteJeUntertyp(u: UntertypInventar): number {
  return u.detailgrade * u.modulprofile;
}

export function dokumenteJeKarte(k: KartenInventar): number {
  return k.untertypen.reduce((s, u) => s + dokumenteJeUntertyp(u), 0);
}

export function dokumenteGesamt(inv: KartenInventar[] = VERTRAGS_INVENTAR): number {
  return inv.reduce((s, k) => s + dokumenteJeKarte(k), 0);
}

/** Ehrlicher Fortschritt gegen das 1000-Ziel (gerundetes Prozent). */
export function fortschrittProzent(inv: KartenInventar[] = VERTRAGS_INVENTAR): number {
  return Math.round((dokumenteGesamt(inv) / ZIEL_DOKUMENTE) * 100);
}
