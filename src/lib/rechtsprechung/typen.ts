// ─── Rechtsprechungs-Snapshot — Pendant zu normtext/typen.ts ────────────────
//
// Ein Entscheid ist narrativer als ein Gesetzesartikel → eigener, schlanker Typ
// (NormSnapshot wird NICHT überladen). Eigener Baum public/rechtsprechung/ — die
// Gesetzes-Snapshots/-Typen bleiben dadurch byte-gleich (golden-neutral, §5/§6).
// §7-Provenienz: stand/quelleUrl/abgerufen/fassungsToken sind Pflicht.

import type { Rechtsgebiet } from '../normtext/register';

export type EntscheidSprache = 'de' | 'fr' | 'it' | 'rm';
export type Entscheidquelle = 'opencaselaw' | 'entscheidsuche';

/** Zwei orthogonale Status-Achsen (Fahrplan Strang-0). */
export type Bestandstatus = 'snapshot' | 'nur-live-link';     // technisch: gespiegelt vs. nur Verweis
export type Kuratierungsstatus = 'maschinell' | 'geprueft';   // fachlich; 'geprueft' NUR via Abnahme (§7)

export type Leitcharakter = 'leitentscheid' | 'routine';
export type Gerichtstyp =
  | 'bundesgericht' | 'bundesverwaltungsgericht' | 'bundesstrafgericht'
  | 'bundespatentgericht' | 'kantonal';

/** Abschnitts-Achse folgt der amtlichen Gliederung (OCL /structure). */
export type Abschnittstyp = 'regeste' | 'sachverhalt' | 'erwaegung' | 'dispositiv';

/** Block formähnlich zu NormSnapshot.bloecke (text), aber 'marke' = Erwägungsziffer. */
export interface EntscheidBlock {
  /** 'E. 1', 'E. 3.2.1'; null bei Sachverhalt/Dispositiv-Fliesstext. */
  marke: string | null;
  /** Einrückungstiefe der Erwägung (OCL depth), für die Darstellung. */
  tiefe?: number;
  text: string;
}

export interface EntscheidAbschnitt {
  typ: Abschnittstyp;
  /** false ⇒ Inhalt ist nur ein Auszug (z.B. Sachverhalt-Kappung); UI labelt „Auszug". */
  vollstaendig?: boolean;
  bloecke: EntscheidBlock[];
}

/** Regeste/Leitsatz — redaktioneller Teil (Lizenz-Graustufe Art. 5 URG), getrennt. */
export interface EntscheidRegeste {
  text: string;
  quelle: Entscheidquelle;
}

/**
 * Rubrum/Kopf eines Entscheids (Art. 112 Abs. 1 BGG): Spruchkörper, Parteien,
 * Gegenstand, Vorinstanz. Aus dem full_text extrahiert; Felder optional (best-effort).
 */
export interface EntscheidRubrum {
  besetzung?: string | null;   // „Bundesrichter Bovey, Präsident, Gerichtsschreiber Zingg"
  parteien?: string | null;    // „A. … (Beschwerdeführer) gegen B. … (Beschwerdegegner)"
  gegenstand?: string | null;  // „Konkurseröffnung"
  vorinstanz?: string | null;  // „Obergericht Appenzell Ausserrhoden, Urteil vom 7. Mai 2026"
}

// Ein Snapshot = genau EIN Entscheid, mit Provenienz.
export interface EntscheidSnapshot {
  /** Stabiler, dateisicherer Key, z.B. 'bund/bger/5A_1100_2025'. */
  id: string;

  // ── Identität (selbsttragend; §7-Provenienz) ──
  gericht: string;          // OCL court ('bger')
  gerichtName: string;      // OCL court_name ('Bundesgericht')
  gerichtstyp: Gerichtstyp;
  kanton: string;           // OCL canton ('CH' für Bund — NICHT leer)
  abteilung: string | null; // OCL chamber
  nummer: string;           // OCL docket_number ('5A_1100/2025')
  bgeReferenz: string | null;
  zitierung: string;        // OCL citation_string_de
  datum: string;            // OCL decision_date ('YYYY-MM-DD')
  sprache: EntscheidSprache;
  leitcharakter: Leitcharakter;
  /** Kuratierte Sach-Achse (deklariert, nie geraten — Verzahnung mit den Gesetzen). */
  sachgebiet: Rechtsgebiet;
  /**
   * Rohes OCL-Feld `legal_area` (Provenienz, NICHT verifiziert). Persistiert,
   * damit die Sachgebiet-Klassierung der mehrdeutigen II. öff.-rechtl. Abteilung
   * (2A/2C/2D) OFFLINE reproduzierbar bleibt (§2) — sie fällt ohne Norm-Signal
   * auf diese legal_area zurück. null, wenn OCL keine liefert (z.B. kantonal).
   */
  legalArea: string | null;

  // ── Inhalt ──
  rubrum: EntscheidRubrum | null;    // Spruchkörper/Parteien/Gegenstand/Vorinstanz (Art. 112 BGG)
  regeste: EntscheidRegeste | null;  // null bei Urteilen ohne (amtliche) Regeste
  /** true nur beim amtlich publizierten BGE; sonst maschinelle Zusammenfassung. */
  regesteAmtlich: boolean;
  abschnitte: EntscheidAbschnitt[];  // sachverhalt / erwaegung / dispositiv
  dispositivOrders: string[];

  // ── Verzahnung ──
  zitierteNormen: string[];   // OCL statutes[] (Roh-Drittextraktion, NICHT verifiziert)
  normKeys: string[];         // normalisiert auf Register-key (build-time)
  zitierteEntscheide: string[];

  // ── Status (zwei Achsen) ──
  bestand: Bestandstatus;
  kuratierung: Kuratierungsstatus;  // Default 'maschinell' bis Abnahme

  // ── Provenienz / Drift ──
  quelle: Entscheidquelle;
  quelleUrl: string;          // amtliche Live-URL (bger.ch)
  abgerufen: string;          // ISO
  fassungsToken: string;      // OCL content_hash (Inhalts-/Verfügbarkeits-Fingerabdruck)
  sha: string;                // sha256EntscheidBloecke(abschnitte) — Regressions-/Drift-Anker
}

/** Eine Snapshot-Datei pro Entscheid (eintraege[0]). */
export interface EntscheidSnapshotDatei {
  erzeugt: string;
  eintraege: EntscheidSnapshot[];
}
