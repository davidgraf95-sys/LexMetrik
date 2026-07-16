// ── SSoT: Erfassungsgrad kantonaler Gesetzessammlungen (§11.2, K-2c) ──────────
//
// Dokumentiert-deterministisch nach A14-Vorbild («Sortierungen DOKUMENTIERT-
// DETERMINISTISCH, §8, KEINE geratene Wichtigkeit»): Eingabe = die in LexMetrik
// ERFASSTE Erlass-Zahl n eines Kantons (aus dem Browse-Manifest gezählt), Ausgabe
// = ein konservatives Zustands-Wort. NIE ein Prozentsatz, NIE eine Wort-Ampel mit
// Werturteil (§8 «nie raten», §11.2 Ziff. 4). Eine Stelle (§5) — so wie G6 die
// Themen-Mitgliedschaft an einer Stelle hält; konsumiert von der IA-2/IA-7-UI.
//
// Skalierungs-Invariante (§11.0): kein Code-Pfad «if kanton === 'BS'», keine
// hartkodierten Mengen ausser der DOKUMENTIERTEN Schwelle unten. Füllt E3 morgen
// alle 26 Kantone, kippen nur die abgeleiteten Werte, nie diese Struktur.
//
// Gate-Folge (§11.2/E.6/KC2): diese Datei liegt unter src/lib/normtext/ ⇒
// `check:gegenpruefung` ist Pflicht — IA-2 ist NICHT «reine UI».

export type ErfassungsStufe = 'vollstaendig' | 'auswahl' | 'duenn';

// Dokumentierte, deterministische Roh-Schwelle (§11.2 Ziff. 2/3): n ≥ 20 → «Auswahl»,
// n < 20 → «dünn». Änderung NUR per Spec-Änderung an FAHRPLAN-GESETZES-UX §11.2,
// nie ad hoc im Code (§11.2 Ziff. 5).
export const AUSWAHL_SCHWELLE = 20;

/** Empirisch belegter Enumerations-Fakt einer kantonalen Sammlung (§11.2 Ziff. 1). */
export interface EnumerationsBeleg {
  /** Amtlich belegte GESAMTZAHL N der Erlasse der kantonalen Sammlung. */
  N: number;
  /** Abruf-/Belegdatum des Enumerations-Fakts (ISO YYYY-MM-DD). */
  stand: string;
  /** Amtliche Quelle des N (URL der kantonalen Systematischen Sammlung). */
  quelle: string;
}

// K-2c (bindend): «N nur ausweisen, wo empirisch belegt (Enumerations-Fakt mit
// Datum), sonst weglassen.» HEUTE LEER — für keinen Kanton ist das amtliche Total
// N erhoben, also ist HEUTE kein Kanton «vollständig» (auch BS 859 bleibt bis zur
// Beleg-Erhebung «Auswahl», §11.2 Ziff. 1 / §8 «nie raten»). Ein Eintrag wird NUR
// mit belegtem N + amtlicher Quelle + Datum ergänzt, NIE geschätzt — sonst wäre die
// «vollständig»-Aussage geraten.
export const ENUMERATIONS_BELEGE: Readonly<Record<string, EnumerationsBeleg>> =
  Object.freeze({});

export interface Erfassungsgrad {
  /** Kantonskürzel (SSoT-Schlüssel). */
  kanton: string;
  /** Erfasste Erlass-Zahl n (die belegte, angezeigte Zahl — nie geschätzt). */
  n: number;
  stufe: ErfassungsStufe;
  /** Belegtes amtliches Total N — NUR gesetzt, wenn ein Enumerations-Beleg vorliegt (§8). */
  belegtN?: number;
  belegStand?: string;
  belegQuelle?: string;
}

/**
 * Leitet den Erfassungsgrad eines Kantons rein deterministisch ab (§2/§11.2).
 * `n` = die in LexMetrik erfasste Erlass-Zahl (aus dem Browse-Manifest gezählt).
 * «vollständig» NUR bei hinterlegtem Enumerations-Beleg UND n ≥ N (§11.2 Ziff. 1);
 * sonst «Auswahl» ab der dokumentierten Schwelle, darunter «dünn». Gleiche Eingabe
 * → gleiche Ausgabe, kein Date.now()/keine Heuristik (§2).
 */
export function erfassungsgrad(kanton: string, n: number): Erfassungsgrad {
  const beleg = ENUMERATIONS_BELEGE[kanton];
  if (beleg && n >= beleg.N) {
    return { kanton, n, stufe: 'vollstaendig', belegtN: beleg.N, belegStand: beleg.stand, belegQuelle: beleg.quelle };
  }
  if (n >= AUSWAHL_SCHWELLE) return { kanton, n, stufe: 'auswahl' };
  return { kanton, n, stufe: 'duenn' };
}

/** Konservatives Zustands-Wort je Stufe (§11.2 Ziff. 4 — kein Werturteil, kein %). */
export const STUFE_WORT: Readonly<Record<ErfassungsStufe, string>> = Object.freeze({
  vollstaendig: 'vollständig',
  auswahl: 'Auswahl',
  duenn: 'dünn',
});

// Sortier-Rang (§11.1 Stufe A, Option «Erfassungsgrad»): dokumentiert-deterministisch
// dicht → dünn (vollständig vor Auswahl vor dünn), Gleichstand über n (siehe UI).
export const STUFE_RANG: Readonly<Record<ErfassungsStufe, number>> = Object.freeze({
  vollstaendig: 0,
  auswahl: 1,
  duenn: 2,
});
