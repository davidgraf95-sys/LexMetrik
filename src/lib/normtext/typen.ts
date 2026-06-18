// Ein Snapshot-Eintrag = genau EIN Artikel eines Erlasses, mit Provenienz.
// §7-Zitat-Ausnahme: stand + quelleUrl + abgerufen sind PFLICHT (kein Default).
export interface NormSnapshot {
  /** Stabiler Schlüssel, z.B. 'bund/OR/art_335_c' oder 'kanton/BE/161.12/art_4'. */
  id: string;
  ebene: 'bund' | 'kanton';
  /** Bund: FedlexGesetz-Key ('OR'). Kanton: Kantonskürzel ('BE'). */
  quelle: string;
  /** Erlass-Bezeichnung wie zitiert ('OR', 'GebV OG / LS 211.11'). */
  erlass: string;
  /** Artikel-Token wie im Anker ('335_c', '4'); Paragraf-Erlasse: '4'. */
  artikel: string;
  /** Menschliche Artikel-Bezeichnung ('Art. 335c', '§ 4'). */
  artikelLabel: string;
  /**
   * Absatz-/Marginalie-Blöcke in Reihenfolge; absatz: '1','2','a','bis' …
   * - text: Einleitungstext des Absatzes OHNE die Listenpunkte.
   * - items (optional): lit./Ziff.-Aufzählungspunkte des Absatzes. marke ist
   *   die nackte Marke ('a','b','17','5a','20a') ohne Punkt/Klammer; text der
   *   Punkttext. Fehlt items, hat der Absatz keine Aufzählung (rückwärtskompat.).
   */
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
  }>;
  /** Konsolidierungs-/Fassungsdatum der Quelle (ISO 'YYYY-MM-DD'). */
  stand: string;
  /** Amtliche Live-URL (mit Anker, wenn vorhanden). */
  quelleUrl: string;
  /** Abrufdatum des Snapshots (ISO). */
  abgerufen: string;
  /**
   * Drift-Token (§7 d): Bund=Konsolidierung 'YYYYMMDD'; LexWork=version_uid
   * (MD5); HTM/ZH=quelleHash (sha256 des extrahierten Volltexts).
   */
  fassungsToken: string;
  /** sha256 des extrahierten Volltexts — Regressions-/Drift-Anker. */
  sha: string;
}

/** Eine Snapshot-Datei pro Erlass/Kanton. */
export interface NormSnapshotDatei {
  erzeugt: string;
  eintraege: NormSnapshot[];
}
