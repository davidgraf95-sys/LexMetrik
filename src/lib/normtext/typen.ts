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
   * N1 (BS-Audit 23.6.2026) — amtlicher Randtitel (Sachtitel) des Artikels, falls
   * die Quelle einen trägt (LexWork article_title). Fehlt er oder ist er nur der
   * Aufhebungs-Platzhalter «…», bleibt das Feld weg (§7: nichts fabrizieren). Wird
   * in der Lesesicht als Randtitel angezeigt.
   */
  titel?: string;
  /**
   * G23 (M8) — Delegationsnorm-Verweis «(Art. N ArG)» aus Fedlex
   * (<p class="man-template-referenz">): das Trägergesetz-Fundament einer
   * Verordnungsbestimmung. Artikel-level Metadatum wie titel (NICHT im Block-sha,
   * golden-neutral); fehlt, wenn die Quelle keinen Verweis trägt (§7: nichts
   * fabrizieren). Wird in der Lesesicht als dezente Grundlagen-Zeile angezeigt.
   */
  grundlage?: string;
  /**
   * Absatz-/Marginalie-Blöcke in Reihenfolge; absatz: '1','2','a','bis' …
   * - text: Einleitungstext des Absatzes OHNE die Listenpunkte.
   * - items (optional): lit./Ziff.-Aufzählungspunkte des Absatzes. marke ist
   *   die nackte Marke ('a','b','17','5a','20a') ohne Punkt/Klammer; text der
   *   Punkttext. Fehlt items, hat der Absatz keine Aufzählung (rückwärtskompat.).
   *   tiefe (optional): explizite Verschachtelungsstufe (0 = direkte Liste des
   *   Absatzes, weggelassen; 1+ = in eine Eltern-lit/Ziff. verschachtelt). Die
   *   Lesesicht zitiert damit korrekt, ohne die Stufe aus dem Markentyp zu raten
   *   (§1, M6). Fehlt tiefe, ist das Item auf Stufe 0 (oder Kanton-Daten ohne
   *   Stufeninfo → Lesesicht-Heuristik).
   */
  bloecke: Array<{
    absatz: string | null;
    text: string;
    /** M13-Annex: Unter-Überschrift innerhalb eines Anhangs (Ziffer-Titel, h2–h6).
     *  Wert = Heading-Tiefe (2–6). Nur Anhang-Einträge tragen das Feld; der
     *  Renderer (ArtikelBody) zeigt den `text` dann als Zwischenüberschrift. */
    titel?: number;
    items?: Array<{ marke: string; text: string; tiefe?: number }>;
    /** Stufe 1: Füllpunkt-Tarifzeilen (Beschreibung | Betrag). */
    tabelle?: Array<{ beschreibung: string; betrag: string }>;
    /**
     * Stufe 2: Mehrspalten-Tabelle (Streitwert/Grundgebühr/Zuschlag u.ä.).
     *
     * KANONISCHES MODELL (T-B1, M10): `spalten` ist der explizite Spalten-Vektor
     * und die EINZIGE Quelle der Spaltenzahl N. Harte Invariante (T-B2): für jeden
     * emittierten Block gilt `spalten.length === N` und `∀i: zeilen[i].length === N`.
     * `typ` steuert Ausrichtung + Format (T-B4): `bereich`/`text` links; `zahl`/
     * `betrag` rechts mit Tausender; `bereich` trägt die generatorseitig verdichtete
     * Staffel-Spanne (T-A6, verlustfreie Konkatenation amtlicher Token, T-E2).
     *
     * ABWÄRTSKOMPAT (L0/§7): `kopf?` ist das Alt-Schema — noch nicht migrierte
     * KANTON-Snapshots tragen `{kopf,zeilen}` ohne `spalten`. Der Renderer rendert
     * beide; neue Bund-Snapshots tragen IMMER `spalten`. Genau EINES von beiden ist
     * massgeblich: `spalten` hat Vorrang, `kopf` ist Legacy-Fallback.
     */
    mehrspaltig?: {
      spalten?: Array<{ typ: 'bereich' | 'zahl' | 'text' | 'betrag'; titel: string }>;
      /** Legacy (Kanton/Alt-Bund): Spaltenköpfe ohne Typ. Vom Renderer als Fallback gerendert. */
      kopf?: string[];
      zeilen: string[][];
    };
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
