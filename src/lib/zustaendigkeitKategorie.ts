// ─── Zuständigkeits-Register (S-3 FAHRPLAN-STRUKTUR-UMBAU) ──────────────────
//
// Auftrag David 10.6.2026 abends: «Zuständigkeitsengine soll unterteilt
// werden in Zivilprozess, Vollstreckung, Strafverfahren, Verwaltungs-
// verfahren, die jeweils unter Zuständigkeit ein eigenes Feld erhalten.»
// Die Kategorie-Ansicht «Zuständigkeiten» zeigt die vier Rechtswege als
// feste Felder in dieser Reihenfolge (statt der Alltag/Weitere-Automatik);
// weitere zuordnung-Karten (IPRG, Rechtsmittelprüfung …) erscheinen
// darunter wie gehabt. Vollständigkeit erzwingt
// src/tests/zustaendigkeitKategorie.test.ts.

export interface ZustaendigkeitFeld {
  id: string;
  /** Ein-Satz-Untertitel des Feldes (Anzeige in der Registerzeile). */
  untertitel: string;
}

export const ZUSTAENDIGKEIT_FELDER: ZustaendigkeitFeld[] = [
  { id: 'zustaendigkeit',
    untertitel: 'Verfahrensart · Schlichtung · Gerichtsstand · Rechtsmittel (ZPO)' },
  { id: 'schkg-zustaendigkeit',
    untertitel: 'Betreibungsort · zuständige Stelle · Beschwerdeweg (Art. 46 ff. SchKG)' },
  { id: 'straf-zustaendigkeit',
    untertitel: 'Tatort-Gerichtsstand · Strafbehörde · Rechtsmittel (Art. 31 ff. StPO)' },
  { id: 'verwaltung-zustaendigkeit',
    untertitel: 'Behörde · Einsprache · Beschwerdeinstanz (VwVG/kantonal)' },
];

export const ZUSTAENDIGKEIT_FELD_IDS = new Set(ZUSTAENDIGKEIT_FELDER.map((f) => f.id));
