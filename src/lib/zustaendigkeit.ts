import type { Berechnungsergebnis, Normverweis, Rechenschritt } from '../types/legal';

// ─── Zuständigkeits-Engine (ZPO) — Bundesrechtsschicht ──────────────────────
//
// Reine, deterministische Engine: Streitsache + Streitwert + Konstellation →
// Verfahrensart, Schlichtungspflicht/-behörde, Entscheidkompetenz, örtlicher
// Gerichtsstand. KEIN Date.now(), keine Heuristik (CLAUDE.md §1/§2).
//
// NORMBASIS — empirisch gegen das Fedlex-Filestore-HTML SR 272 ZPO verifiziert
// (Konsolidierung 20250101, in Kraft; Revision «Verbesserung der Praxis-
// tauglichkeit und der Rechtsdurchsetzung» per 1.1.2025; abgerufen 5.6.2026).
// Vollständige Herleitung: ZUSTAENDIGKEIT-AUFTRAG.md §3/§4.
//   · Verfahrensart        Art. 243 (vereinfacht bis 30'000 / streitwertunab-
//                          hängig bei Miete-Schutzmaterie & GlG), 248 (summ.)
//   · Schlichtung          Art. 197 (Grundsatz), 198 (Ausnahmen),
//                          199 (Verzicht ab 100'000 / einseitig / Abs. 3 neu),
//                          200 (paritätische Behörde Miete & GlG)
//   · Entscheidkompetenz   Art. 212 (Entscheid bis 2'000), 210 (Entscheid-
//                          vorschlag: GlG, Miete-Schutz, übrige bis 10'000 —
//                          Revision 2025: vorher 5'000)
//   · örtlich              Art. 10 (Grundsatz Wohnsitz/Sitz), 32 (Konsum),
//                          33 (Miete unbewegl. Sache), 34 (Arbeit),
//                          35 (Verzichtsverbot teilzwingend), 9 (zwingend)
//   · sachlich/funktionell Art. 4 (kant. Recht!), 6 (Handelsgericht),
//                          8 (direkte Klage oberes Gericht) — als WEICHE
//
// PHASE 1 = nur Bundesrecht. Welches KONKRETE kantonale Gericht zuständig ist
// (Art. 4), löst die Kantonsschicht (Phase 2, zustaendigkeitKantone.ts) auf;
// hier wird sie als offene Stelle + Warnung ausgewiesen. Ermessensfragen
// (Handelsgericht, GSV) sind offengelegte WEICHEN, nie stille Subsumtion (§8).
// Alle Norm-Pills verified:false bis zur fachlichen Abnahme (§13).
//
// AUSBAU (Anordnung David 5.6.2026, «komplett überarbeiten» auf Basis
// bibliothek/normen/zpo-zustaendigkeit-regelwerk.md — Wortlaute am Cache
// verifiziert): neue Streitsachen delikt (Art. 36–38) · persoenlichkeit
// (Art. 20; Gewaltschutz-Unterfall: Art. 28b/28c ZGB → 198 lit. abis,
// 243 Abs. 2 lit. b, 114 lit. f) · gesellschaft (Art. 40 Abs. 1) ·
// ip_wettbewerb (Art. 5 — einzige kantonale Instanz, 199 Abs. 3, 243
// Abs. 3); Vertrags-Forum Art. 31 (charakteristische Leistung ≠ Erfüllungs-
// ort OR 74); AVG-Verleiher-Forum Art. 34 Abs. 2; Prorogations-/Einlassungs-
// Weiche (Art. 17/18) je Bindungsgrad; IPRG/LugÜ-Weiche (Art. 2);
// perpetuatio fori (Art. 64 Abs. 1 lit. b) und Art.-63-Rettung als Hinweise.
// Alle BESTEHENDEN Eingabe-Kombinationen liefern unverändert dieselben
// Ergebnisse (Erweiterung über neue Felder/Streitsachen; Tests unberührt).

export const ZPO_SCHWELLEN = {
  VEREINFACHT: 30_000,        // Art. 243 Abs. 1 ZPO (bis und mit)
  ENTSCHEIDVORSCHLAG: 10_000, // Art. 210 Abs. 1 lit. c ZPO (Revision 2025: vorher 5'000)
  ENTSCHEID_AUF_ANTRAG: 2_000,// Art. 212 Abs. 1 ZPO
  VERZICHT_GEMEINSAM: 100_000,// Art. 199 Abs. 1 ZPO
  HANDELSGERICHT_MIN: 30_000, // Art. 6 Abs. 2 lit. b ZPO
  DIREKTKLAGE_MIN: 100_000,   // Art. 8 Abs. 1 ZPO
} as const;

// Rechtsweg-Rubriken (oberste Ebene der UI, Entscheid David 5.6.2026):
// Zivil ist implementiert; SchKG/Straf/Verwaltung sind eigene künftige
// Engines (§4 — KEINE Fusion in diese ZPO-Engine).
export type Rechtsweg = 'zivil' | 'schkg' | 'straf' | 'verwaltung';

export type Streitsache =
  | 'geldforderung' | 'miete_wohn_geschaeft' | 'arbeit' | 'scheidung' | 'erbrecht'
  // Ausbau 5.6.2026 (Regelwerk):
  | 'delikt'           // unerlaubte Handlung, Art. 36–38 ZPO
  | 'persoenlichkeit'  // Persönlichkeit/Datenschutz/Gegendarstellung, Art. 20 ZPO
  | 'gesellschaft'     // gesellschaftsrechtliche Verantwortlichkeit, Art. 40 Abs. 1 ZPO
  | 'ip_wettbewerb';   // Art. 5 ZPO: IP/Kartell/Firma/UWG — einzige kantonale Instanz
export type Verfahrensart = 'vereinfacht' | 'ordentlich' | 'scheidungsverfahren';
export type SchlichtungsbehoerdeTyp = 'ordentlich' | 'paritaetisch_miete' | 'paritaetisch_glg';
/** Art der einleitenden Eingabe — steuert den Vorlagen-Verweis (Auftrag §8). */
export type EingabeArt = 'schlichtungsgesuch' | 'klage_direkt' | 'scheidungsbegehren_oder_klage';

// Miete-Unterfall steuert die «Schutzmaterie» (Hinterlegung, Missbrauchs-/
// Kündigungsschutz, Erstreckung) → vereinfachtes Verfahren & Entscheidvorschlag
// STREITWERTUNABHÄNGIG (Art. 243 Abs. 2 lit. c, Art. 210 Abs. 1 lit. b ZPO).
export type MieteUnterfall =
  | 'kuendigungsschutz' | 'erstreckung' | 'mietzins_anfechtung' | 'hinterlegung' | 'sonstige';

const MIETE_SCHUTZ: ReadonlySet<MieteUnterfall> = new Set([
  'kuendigungsschutz', 'erstreckung', 'mietzins_anfechtung', 'hinterlegung',
]);

/** Delikts-Unterfall (Art. 36–38 ZPO): steuert Spezialforen. */
export type DeliktUnterfall = 'allgemein' | 'verkehrsunfall' | 'ungerechtfertigte_massnahme';

/** Persönlichkeits-Unterfall (Art. 20 ZPO; Gewaltschutz = Art. 28b/28c ZGB). */
export type PersoenlichkeitUnterfall = 'verletzung' | 'gegendarstellung' | 'datenschutz' | 'gewaltschutz';

/** Art.-5-Materie (Wortlaut-genau, Stufe-2-Doppelcheck 6.6.2026):
 *  lit. a–c u. a. UNBEDINGT einzige Instanz; lit. d (UWG) über 30 000 ODER
 *  wenn der BUND sein Klagerecht ausübt (streitwertunabhängig!); lit. f
 *  (Klagen gegen den Bund) NUR über 30 000 — keine Klagerecht-Alternative. */
export type IpUnterfall = 'ip_kartell_firma' | 'uwg' | 'klage_gegen_bund';

export interface ZustaendigkeitInput {
  streitsache: Streitsache;
  vermoegensrechtlich: boolean;          // false = nicht vermögensrechtlich (Streitwert irrelevant)
  streitwertCHF: number | null;          // Pflicht, wenn vermoegensrechtlich
  mieteUnterfall?: MieteUnterfall;       // nur bei miete_wohn_geschaeft
  glgBetroffen?: boolean;                // Gleichstellungsgesetz (Art. 200/210/243)
  konsumentenvertrag?: boolean;          // nur bei geldforderung (Art. 32)
  klaegeristGeschuetzt?: boolean;        // geschützte Partei (Konsument/Mieter/AN) ist Klägerin
  geschaeftlicheTaetigkeit?: boolean;    // Art. 6 Abs. 2 lit. a (Handelsgericht-Weiche)
  beklagteImHR?: boolean;                // Art. 6 Abs. 2 lit. c
  klaegerImHR?: boolean;                 // Art. 6 Abs. 2 lit. c
  beklagteAuslandOderUnbekannt?: boolean;// Art. 199 Abs. 2 lit. a/b; löst zudem die IPRG-Weiche aus (Art. 2)
  widerklageOderGerichtlicheFrist?: boolean; // Art. 198 lit. g/h (Schlichtung entfällt)
  // Ausbau 5.6.2026 (alle optional — Default erhält das bisherige Verhalten):
  ausVertrag?: boolean;                  // geldforderung: Forderung aus Vertrag → Art. 31 (charakteristische Leistung)
  deliktUnterfall?: DeliktUnterfall;     // nur bei delikt
  persoenlichkeitUnterfall?: PersoenlichkeitUnterfall;
  ipUnterfall?: IpUnterfall;            // nur bei ip_wettbewerb (Default: unbedingte lit.)
  /** Art. 5 Abs. 1 lit. d Alt. 2: der Bund übt sein UWG-Klagerecht aus —
   *  dann einzige Instanz UNABHÄNGIG vom Streitwert (nur bei 'uwg'). */
  bundKlagerecht?: boolean; // nur bei persoenlichkeit
  avgVerleih?: boolean;                  // arbeit: Personalverleih/-vermittlung → Zusatzforum Art. 34 Abs. 2
  gerichtsstandsvereinbarung?: boolean;  // Parteien haben eine GSV (Art. 17) — Wirksamkeit je Bindungsgrad
}

export interface ZustaendigkeitErgebnis {
  verfahrensart: Verfahrensart;
  schlichtung: {
    obligatorisch: boolean;
    entfaelltGrund: string | null;
    verzichtGemeinsam: boolean;
    verzichtEinseitig: boolean;
    behoerdeTyp: SchlichtungsbehoerdeTyp;
    /** Bundesrechtliche Kostenfreiheit des SCHLICHTUNGSverfahrens
     *  (Art. 113 Abs. 2 ZPO — am Wortlaut verifiziert, 5.6.2026):
     *  GlG · Miete/Pacht Wohn-/Geschäftsräume · Arbeit bis CHF 30 000.
     *  (BehiG/MitwG/KVG-Zusatz sind als Streitsachen nicht abgebildet.) */
    kostenlos: boolean;
    kostenlosGrund: string | null;
  };
  entscheidkompetenz: { entscheidAufAntrag: boolean; entscheidvorschlag: boolean };
  oertlich: { gerichtsstand: string; bindung: 'dispositiv' | 'teilzwingend' | 'zwingend'; teilzwingend: boolean; normen: Normverweis[] };
  eingabeArt: EingabeArt;
  rechenweg: Rechenschritt[];
  warnungen: string[];
  weichen: string[];
  normverweise: Normverweis[];
}

// ── Normverweis-Bausteine ───────────────────────────────────────────────────
const N_243: Normverweis = { artikel: 'Art. 243 ZPO', bemerkung: 'Geltungsbereich vereinfachtes Verfahren' };
const N_197: Normverweis = { artikel: 'Art. 197 ZPO', bemerkung: 'Grundsatz: Schlichtung vorangestellt' };
const N_198: Normverweis = { artikel: 'Art. 198 ZPO', bemerkung: 'Ausnahmen vom Schlichtungsverfahren' };
const N_199: Normverweis = { artikel: 'Art. 199 ZPO', bemerkung: 'Verzicht auf das Schlichtungsverfahren' };
const N_200: Normverweis = { artikel: 'Art. 200 ZPO', bemerkung: 'Paritätische Schlichtungsbehörden' };
const N_210: Normverweis = { artikel: 'Art. 210 ZPO', bemerkung: 'Entscheidvorschlag' };
const N_212: Normverweis = { artikel: 'Art. 212 ZPO', bemerkung: 'Entscheid der Schlichtungsbehörde' };
const N_10: Normverweis = { artikel: 'Art. 10 ZPO', bemerkung: 'Grundsatz: Wohnsitz/Sitz der beklagten Partei' };
const N_32: Normverweis = { artikel: 'Art. 32 ZPO', bemerkung: 'Konsumentenvertrag' };
const N_33: Normverweis = { artikel: 'Art. 33 ZPO', bemerkung: 'Miete/Pacht unbeweglicher Sachen — Ort der Sache' };
const N_34: Normverweis = { artikel: 'Art. 34 ZPO', bemerkung: 'Arbeitsrecht — Beklagtensitz oder Arbeitsort' };
const N_35: Normverweis = { artikel: 'Art. 35 ZPO', bemerkung: 'Teilzwingend: kein Verzicht der geschützten Partei' };
const N_4: Normverweis = { artikel: 'Art. 4 ZPO', bemerkung: 'Sachliche/funktionelle Zuständigkeit nach kantonalem Recht' };
const N_23: Normverweis = { artikel: 'Art. 23 ZPO', bemerkung: 'Eherechtliche Gesuche/Klagen — Wohnsitz einer Partei, zwingend' };
const N_28: Normverweis = { artikel: 'Art. 28 ZPO', bemerkung: 'Erbrechtliche Klagen — letzter Wohnsitz der Erblasserin/des Erblassers' };
const N_274: Normverweis = { artikel: 'Art. 274 ZPO', bemerkung: 'Einleitung: gemeinsames Scheidungsbegehren oder Scheidungsklage' };
// Ausbau 5.6.2026 (Regelwerk):
const N_31: Normverweis = { artikel: 'Art. 31 ZPO', bemerkung: 'Vertrag — Beklagtensitz oder Ort der charakteristischen Leistung' };
const N_36: Normverweis = { artikel: 'Art. 36 ZPO', bemerkung: 'Unerlaubte Handlung — Geschädigten-/Beklagtensitz, Handlungs- oder Erfolgsort' };
const N_37: Normverweis = { artikel: 'Art. 37 ZPO', bemerkung: 'Schadenersatz bei ungerechtfertigten vorsorglichen Massnahmen' };
const N_38: Normverweis = { artikel: 'Art. 38 ZPO', bemerkung: 'Motorfahrzeug-/Fahrradunfälle — Beklagtensitz oder Unfallort' };
const N_20: Normverweis = { artikel: 'Art. 20 ZPO', bemerkung: 'Persönlichkeits-/Datenschutz — Wohnsitz/Sitz einer der Parteien' };
const N_40: Normverweis = { artikel: 'Art. 40 ZPO', bemerkung: 'Gesellschaftsrechtliche Verantwortlichkeit — Beklagtensitz oder Sitz der Gesellschaft' };
const N_5: Normverweis = { artikel: 'Art. 5 ZPO', bemerkung: 'Einzige kantonale Instanz (IP, Kartell, Firma, UWG > 30 000, …)' };
const N_17: Normverweis = { artikel: 'Art. 17 ZPO', bemerkung: 'Gerichtsstandsvereinbarung (Schrift-/Textform; im Zweifel ausschliesslich)' };
const N_18: Normverweis = { artikel: 'Art. 18 ZPO', bemerkung: 'Einlassung begründet die Zuständigkeit des angerufenen Gerichts' };
const N_2: Normverweis = { artikel: 'Art. 2 ZPO', bemerkung: 'Vorbehalt Staatsverträge (LugÜ) und IPRG bei internationalen Verhältnissen' };
const N_64: Normverweis = { artikel: 'Art. 64 ZPO', bemerkung: 'Perpetuatio fori — örtliche Zuständigkeit bleibt ab Rechtshängigkeit erhalten' };

const ungueltig = (sw: number | null) => sw !== null && (!Number.isFinite(sw) || sw < 0);

/** Reine Engine: Bundesrechtliche Zuständigkeitsbestimmung. */
export function bestimmeZustaendigkeit(input: ZustaendigkeitInput): ZustaendigkeitErgebnis {
  if (input.vermoegensrechtlich && input.streitwertCHF == null) {
    throw new Error('Bei vermögensrechtlichen Streitigkeiten ist der Streitwert erforderlich.');
  }
  if (ungueltig(input.streitwertCHF)) {
    throw new Error('Streitwert muss eine Zahl ≥ 0 sein.');
  }
  // Massgeblicher Streitwert: nur bei vermögensrechtlichen Streitigkeiten.
  const sw = input.vermoegensrechtlich ? input.streitwertCHF : null;
  const istMiete = input.streitsache === 'miete_wohn_geschaeft';
  const istScheidung = input.streitsache === 'scheidung';
  const mieteSchutz = istMiete && MIETE_SCHUTZ.has(input.mieteUnterfall ?? 'sonstige');
  const streitwertunabhaengigVereinfacht = mieteSchutz || !!input.glgBetroffen;

  const istGewaltschutz = input.streitsache === 'persoenlichkeit' && input.persoenlichkeitUnterfall === 'gewaltschutz';
  // Art. 5 ZPO: lit. a–c unbedingt; lit. d (UWG)/f (Bund) NUR über 30 000
  // (H1-Fix 6.6.2026). Bei uwg_oder_bund ≤30k läuft der ordentliche Weg.
  const ipU = input.ipUnterfall ?? 'ip_kartell_firma';
  const istEinzigeInstanz = input.streitsache === 'ip_wettbewerb'
    && (ipU === 'ip_kartell_firma'
      || (sw !== null && sw > ZPO_SCHWELLEN.VEREINFACHT)
      || (ipU === 'uwg' && input.bundKlagerecht === true));

  const rechenweg: Rechenschritt[] = [];
  const warnungen: string[] = [];
  const weichen: string[] = [];

  // Prüfreihenfolge (Entscheid David 5.6.2026, klassische Methodik):
  // 1 · ÖRTLICH → 2 · SACHLICH → 3 · FUNKTIONELL (Schlichtung/Behörde/
  // Kompetenz) → 4 · Verfahrensart → 5 · einleitende Eingabe.

  // ── 1 · Örtliche Zuständigkeit (Art. 10/23/32/33/34/35 ZPO) ───────────────
  let gerichtsstand: string;
  let bindung: 'dispositiv' | 'teilzwingend' | 'zwingend' = 'dispositiv';
  let oertlichNormen: Normverweis[];
  if (istScheidung) {
    gerichtsstand = 'Gericht am Wohnsitz einer der Parteien';
    bindung = 'zwingend'; // Art. 23 Abs. 1 ZPO: «zwingend zuständig»
    oertlichNormen = [N_23];
  } else if (input.streitsache === 'erbrecht') {
    // Art. 28 Abs. 1: nicht als zwingend bezeichnet → dispositiv (Art. 9 ZPO)
    gerichtsstand = 'Gericht am letzten Wohnsitz der Erblasserin/des Erblassers';
    oertlichNormen = [N_28];
  } else if (istMiete) {
    gerichtsstand = 'Gericht am Ort der gelegenen Sache';
    bindung = 'teilzwingend'; // Art. 35 Abs. 1 lit. b (Wohn-/Geschäftsräume)
    oertlichNormen = [N_33, N_35];
  } else if (input.streitsache === 'arbeit') {
    gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei oder am gewöhnlichen Arbeitsort (Wahl der klagenden Partei)';
    bindung = 'teilzwingend'; // Art. 35 Abs. 1 lit. d
    oertlichNormen = [N_34, N_35];
  } else if (input.konsumentenvertrag && input.streitsache === 'geldforderung') {
    gerichtsstand = input.klaegeristGeschuetzt
      ? 'Gericht am Wohnsitz/Sitz einer der Parteien (Wahl der klagenden Konsumentin/des Konsumenten)'
      : 'Gericht am Wohnsitz der beklagten Konsumentin/des Konsumenten';
    bindung = 'teilzwingend'; // Art. 35 Abs. 1 lit. a
    oertlichNormen = [N_32, N_35];
  } else if (input.streitsache === 'delikt') {
    // Art. 36: vier alternative Anknüpfungen (inkl. forum actoris); Spezialforen 37/38.
    const u = input.deliktUnterfall ?? 'allgemein';
    if (u === 'verkehrsunfall') {
      gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei oder am Unfallort (Wahl der klagenden Partei)';
      oertlichNormen = [N_38];
    } else if (u === 'ungerechtfertigte_massnahme') {
      gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei oder am Ort, an dem die vorsorgliche Massnahme angeordnet wurde';
      oertlichNormen = [N_37];
    } else {
      gerichtsstand = 'Gericht am Wohnsitz/Sitz der geschädigten oder der beklagten Partei, am Handlungs- oder am Erfolgsort (Wahl der klagenden Partei)';
      oertlichNormen = [N_36];
    }
  } else if (input.streitsache === 'persoenlichkeit') {
    // Art. 20: Wahlgerichtsstand am Wohnsitz/Sitz EINER der Parteien.
    gerichtsstand = 'Gericht am Wohnsitz/Sitz einer der Parteien (Wahl der klagenden Partei)';
    oertlichNormen = [N_20];
  } else if (input.streitsache === 'gesellschaft') {
    // Art. 40 Abs. 1: Verantwortlichkeitsklagen.
    gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei oder am Sitz der Gesellschaft (Wahl der klagenden Partei)';
    oertlichNormen = [N_40];
  } else if (input.streitsache === 'ip_wettbewerb') {
    // Art. 5: örtlich gelten die allgemeinen Regeln (10/36); SACHLICH einzige
    // kantonale Instanz — die Weiche folgt in Schritt 2.
    gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei; bei Verletzungsklagen zusätzlich Handlungs-/Erfolgsort (Art. 36)';
    oertlichNormen = [N_10, N_36];
  } else if (input.ausVertrag) {
    // Art. 31: Beklagtensitz ODER Ort der charakteristischen Leistung. Die
    // charakteristische Leistung ist die vertragstypprägende (i. d. R. NICHT
    // die Geld-)Leistung — kein Klägerforum am eigenen Sitz für Geldschulden.
    gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei oder am Ort, an dem die charakteristische Leistung zu erbringen ist (Wahl der klagenden Partei)';
    oertlichNormen = [N_31];
  } else {
    // dispositiv: Gerichtsstandsvereinbarung möglich
    gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei';
    oertlichNormen = [N_10];
  }
  // Arbeit mit Personalverleih/-vermittlung: Zusatzforum Art. 34 Abs. 2.
  if (input.streitsache === 'arbeit' && input.avgVerleih) {
    gerichtsstand += '; bei Personalverleih/-vermittlung zusätzlich am Ort der Geschäftsniederlassung der verleihenden/vermittelnden Person (Art. 34 Abs. 2 ZPO)';
  }
  const bindungText = bindung === 'zwingend'
    ? ' (zwingend — weder Vereinbarung noch Einlassung möglich, Art. 9 ZPO)'
    : bindung === 'teilzwingend'
      ? ' (teilzwingend — Verzicht der geschützten Partei zum Voraus unzulässig)'
      : ' (dispositiv)';
  rechenweg.push({ beschreibung: `1 · Örtliche Zuständigkeit: ${gerichtsstand}${bindungText}`, zwischenergebnis: gerichtsstand, normen: oertlichNormen });
  if (bindung === 'teilzwingend' && !input.gerichtsstandsvereinbarung) {
    // Mit GSV folgt unten die spezifische Warnung — keine Doppelmeldung (N2).
    weichen.push('Gerichtsstandsvereinbarung nur NACH Entstehung der Streitigkeit gültig — die geschützte Partei kann zum Voraus nicht verzichten (Art. 35 ZPO).');
  }
  // Prorogation/Einlassung (Art. 17/18) — Wirkung hängt am Bindungsgrad.
  if (input.gerichtsstandsvereinbarung) {
    if (bindung === 'zwingend') {
      warnungen.push('Die Gerichtsstandsvereinbarung ist UNWIRKSAM: Vom zwingenden Gerichtsstand können die Parteien nicht abweichen (Art. 9 Abs. 2 ZPO); auch Einlassung heilt nicht.');
    } else if (bindung === 'teilzwingend') {
      warnungen.push('Gerichtsstandsvereinbarung nur wirksam, wenn sie NACH Entstehung der Streitigkeit geschlossen wurde (Art. 35 Abs. 2 ZPO) — ein Vorausverzicht der geschützten Partei ist unwirksam.');
    } else {
      weichen.push('Gerichtsstandsvereinbarung (Art. 17 ZPO): schriftlich oder in Textform; im Zweifel AUSSCHLIESSLICH — dann ist nur das vereinbarte Gericht zuständig.');
    }
  } else if (bindung === 'dispositiv') {
    weichen.push('Dispositiver Gerichtsstand: Abweichung durch Gerichtsstandsvereinbarung (Art. 17 ZPO, Schrift-/Textform) oder durch vorbehaltlose Einlassung der beklagten Partei (Art. 18 ZPO) möglich.');
  }

  // ── 2 · Sachliche Zuständigkeit (Art. 4/5/6/8 ZPO — Kantonsschicht) ────────
  // Handelsgericht: nur Geldforderung (Miete & Arbeit sind nach Art. 6 Abs. 2
  // lit. d ausgeschlossen); nur in Kantonen mit Handelsgericht.
  let hgWeiche = false;
  let direktklageWeiche = false;
  // HG-Weiche: Geldforderung wie bisher; gesellschaftsrechtliche Verantwort-
  // lichkeit zusätzlich (Art. 6 Abs. 4 lit. b — kantonale Erweiterung möglich).
  const hgFaehig = input.streitsache === 'geldforderung' || input.streitsache === 'gesellschaft';
  if (hgFaehig && input.geschaeftlicheTaetigkeit && input.beklagteImHR) {
    const swOk = sw === null || sw > ZPO_SCHWELLEN.HANDELSGERICHT_MIN;
    if (swOk && input.klaegerImHR) {
      hgWeiche = true;
      weichen.push('Handelsgericht prüfen: handelsrechtliche Streitigkeit nach Art. 6 ZPO (nur in Kantonen mit Handelsgericht, real ZH/BE/AG/SG). Dann Klage direkt beim Gericht, Schlichtung entfällt (Art. 199 Abs. 3 ZPO).');
    } else if (swOk) {
      hgWeiche = true;
      weichen.push('Nur die beklagte Partei ist im Handelsregister eingetragen: Die klagende Partei kann zwischen Handelsgericht und ordentlichem Gericht wählen (Art. 6 Abs. 3 ZPO; nur HG-Kantone).');
    }
  }
  if (!istEinzigeInstanz && sw !== null && sw >= ZPO_SCHWELLEN.DIREKTKLAGE_MIN) {
    direktklageWeiche = true;
    weichen.push(`Direkte Klage ans obere Gericht möglich (Streitwert ≥ CHF ${ZPO_SCHWELLEN.DIREKTKLAGE_MIN.toLocaleString('de-CH')}, Zustimmung der beklagten Partei, Art. 8 ZPO). Dann Schlichtung entfällt (Art. 199 Abs. 3 ZPO).`);
  }
  if (istEinzigeInstanz) {
    rechenweg.push({
      beschreibung: '2 · Sachliche Zuständigkeit: EINZIGE kantonale Instanz — das kantonale Recht bezeichnet das zuständige Gericht (in HG-Kantonen oft das Handelsgericht, Art. 6 Abs. 4 lit. a ZPO); kein zweiter kantonaler Instanzenzug',
      zwischenergebnis: 'einzige kantonale Instanz (Art. 5 ZPO)',
      normen: [N_5, N_4],
    });
    weichen.push('Einordnung unter den Katalog von Art. 5 Abs. 1 lit. a–i ZPO prüfen (IP/Kartell/Firma unbedingt; UWG über CHF 30 000 ODER bei Klagerecht des Bundes; Klagen gegen den Bund nur über CHF 30 000).');
  } else {
    if (input.streitsache === 'ip_wettbewerb') {
      if (sw !== null) {
        warnungen.push(`${ipU === 'uwg' ? 'UWG-Klage' : 'Klage gegen den Bund'} mit Streitwert bis CHF ${ZPO_SCHWELLEN.VEREINFACHT.toLocaleString('de-CH')}${ipU === 'uwg' ? ' (und ohne Klagerecht des Bundes)' : ''}: KEINE einzige kantonale Instanz (Art. 5 Abs. 1 lit. ${ipU === 'uwg' ? 'd' : 'f'} ZPO) — es gilt der ordentliche Weg inklusive Schlichtung und kantonalem Rechtsmittelzug.`);
      } else {
        weichen.push('Art.-5-Schwelle offen: Ohne bezifferten Streitwert ist nicht bestimmbar, ob die einzige kantonale Instanz greift (über CHF 30 000) — Streitwert beziffern.');
      }
    }
    rechenweg.push({
      beschreibung: `2 · Sachliche Zuständigkeit: ordentliches erstinstanzliches Zivilgericht; Organisation und Streitwertgrenzen regelt das kantonale Recht${hgWeiche ? ' — Handelsgerichts-Weiche offen (Art. 6 ZPO)' : ''}${direktklageWeiche ? ' — Direktklage-Weiche offen (Art. 8 ZPO)' : ''}`,
      zwischenergebnis: hgWeiche || direktklageWeiche ? 'ordentliches Gericht (Weichen offen)' : 'ordentliches Gericht',
      normen: [N_4],
    });
  }

  // ── 3 · Funktionell: Schlichtungspflicht (Art. 197–199 ZPO) ────────────────
  let entfaelltGrund: string | null = null;
  if (istScheidung) {
    entfaelltGrund = 'Scheidungsverfahren (Art. 198 lit. c ZPO)';
  } else if (istGewaltschutz) {
    entfaelltGrund = 'Klagen wegen Gewalt, Drohungen oder Nachstellungen bzw. elektronischer Überwachung (Art. 198 lit. abis ZPO)';
  } else if (istEinzigeInstanz) {
    entfaelltGrund = 'Einzige kantonale Instanz nach Art. 5 ZPO — Klage direkt beim Gericht (Art. 199 Abs. 3 ZPO)';
  } else if (input.widerklageOderGerichtlicheFrist) {
    entfaelltGrund = 'Widerklage/Hauptintervention bzw. gerichtlich gesetzte Klagefrist (Art. 198 lit. g/h ZPO)';
  }
  const obligatorisch = entfaelltGrund === null;
  // Verzichts-Flags nur, wo überhaupt geschlichtet würde (Präzisierung 5.6.2026).
  const verzichtGemeinsam = obligatorisch && sw !== null && sw >= ZPO_SCHWELLEN.VERZICHT_GEMEINSAM;
  const verzichtEinseitig = obligatorisch && (!!input.beklagteAuslandOderUnbekannt || !!input.glgBetroffen);
  rechenweg.push({
    beschreibung: obligatorisch
      ? '3 · Funktionell: Schlichtungsversuch geht dem Entscheidverfahren grundsätzlich voraus'
      : `3 · Funktionell: Schlichtung entfällt — ${entfaelltGrund}`,
    zwischenergebnis: obligatorisch ? 'Schlichtung obligatorisch' : 'keine Schlichtung',
    normen: obligatorisch ? [N_197] : [N_198],
  });
  if (verzichtGemeinsam) {
    weichen.push(`Streitwert ≥ CHF ${ZPO_SCHWELLEN.VERZICHT_GEMEINSAM.toLocaleString('de-CH')}: Die Parteien können gemeinsam auf das Schlichtungsverfahren verzichten (Art. 199 Abs. 1 ZPO).`);
  }
  if (verzichtEinseitig) {
    weichen.push('Einseitiger Verzicht der klagenden Partei möglich (beklagte Partei im Ausland/unbekannt oder Streit nach Gleichstellungsgesetz, Art. 199 Abs. 2 ZPO).');
  }

  // Schlichtungsbehörde-Typ (Art. 200 ZPO)
  const behoerdeTyp: SchlichtungsbehoerdeTyp = istMiete
    ? 'paritaetisch_miete'
    : input.glgBetroffen ? 'paritaetisch_glg' : 'ordentlich';

  // Kostenfreiheit der SCHLICHTUNG (Art. 113 Abs. 2 ZPO; Praxis-Ausbau
  // 5.6.2026). Nur die hier abgebildeten Katalog-Fälle; lit. abis (Gewalt)
  // ist gegenstandslos, weil dort die Schlichtung entfällt (198 lit. abis).
  let kostenlosGrund: string | null = null;
  if (obligatorisch) {
    if (input.glgBetroffen) kostenlosGrund = 'Streitigkeit nach dem Gleichstellungsgesetz (Art. 113 Abs. 2 lit. a ZPO)';
    else if (istMiete) kostenlosGrund = 'Miete/Pacht von Wohn- und Geschäftsräumen (Art. 113 Abs. 2 lit. c ZPO)';
    else if (input.streitsache === 'arbeit' && sw !== null && sw <= ZPO_SCHWELLEN.VEREINFACHT) {
      // Ohne bezifferten Streitwert ist «bis 30 000» nicht subsumierbar →
      // dann KEINE Kostenfreiheits-Behauptung (ehrlich, §8).
      kostenlosGrund = `Arbeitsverhältnis bis CHF ${ZPO_SCHWELLEN.VEREINFACHT.toLocaleString('de-CH')} (Art. 113 Abs. 2 lit. d ZPO)`;
    }
  }
  const schlichtungKostenlos = kostenlosGrund !== null;
  if (obligatorisch) {
    rechenweg.push({
      beschreibung: behoerdeTyp === 'paritaetisch_miete'
        ? 'Miete/Pacht von Wohn-/Geschäftsräumen → paritätische Schlichtungsbehörde'
        : behoerdeTyp === 'paritaetisch_glg'
          ? 'Streit nach Gleichstellungsgesetz → paritätische Schlichtungsbehörde'
          : 'Ordentliche Schlichtungsbehörde (Friedensrichteramt/Vermittleramt — kantonale Bezeichnung)',
      zwischenergebnis: behoerdeTyp === 'ordentlich' ? 'ordentliche Schlichtungsbehörde' : 'paritätische Schlichtungsbehörde',
      normen: behoerdeTyp === 'ordentlich' ? [N_4] : [N_200],
    });
  }

  // Entscheidkompetenz der Schlichtungsbehörde (Art. 210/212 ZPO) — nur
  // sinnvoll, wenn überhaupt geschlichtet wird (Präzisierung 5.6.2026).
  const entscheidAufAntrag = obligatorisch && sw !== null && sw <= ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG;
  const entscheidvorschlag = obligatorisch && (!!input.glgBetroffen || mieteSchutz || (sw !== null && sw <= ZPO_SCHWELLEN.ENTSCHEIDVORSCHLAG));
  if (entscheidAufAntrag || entscheidvorschlag) {
    const teile: string[] = [];
    if (entscheidAufAntrag) teile.push(`Entscheid auf Antrag der klagenden Partei (bis CHF ${ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG.toLocaleString('de-CH')}, Art. 212 ZPO)`);
    if (entscheidvorschlag) teile.push(`Entscheidvorschlag der Behörde möglich (Art. 210 ZPO)`);
    rechenweg.push({
      beschreibung: `Kompetenz der Schlichtungsbehörde: ${teile.join('; ')}`,
      zwischenergebnis: entscheidAufAntrag ? 'Entscheid möglich' : 'Entscheidvorschlag möglich',
      normen: [entscheidAufAntrag ? N_212 : N_210],
    });
  }

  // ── 4 · Verfahrensart (Art. 243 ZPO; Scheidung: Art. 274 ff. ZPO) ──────────
  let verfahrensart: Verfahrensart;
  let vGrund: string;
  if (istScheidung) {
    verfahrensart = 'scheidungsverfahren';
    vGrund = 'Scheidung → eigenes Scheidungsverfahren (Einleitung durch gemeinsames Begehren oder Klage, Art. 274 ff. ZPO)';
  } else if (istEinzigeInstanz) {
    // Art. 243 Abs. 3: vor der einzigen kantonalen Instanz (Art. 5) findet
    // das vereinfachte Verfahren keine Anwendung.
    verfahrensart = 'ordentlich';
    vGrund = 'Einzige kantonale Instanz (Art. 5 ZPO) → ordentliches Verfahren; das vereinfachte Verfahren findet dort keine Anwendung (Art. 243 Abs. 3 ZPO)';
  } else if (istGewaltschutz) {
    verfahrensart = 'vereinfacht';
    vGrund = 'Gewalt/Drohungen/Nachstellungen bzw. elektronische Überwachung (Art. 28b/28c ZGB) → vereinfacht ohne Rücksicht auf den Streitwert (Art. 243 Abs. 2 lit. b ZPO)';
  } else if (streitwertunabhaengigVereinfacht) {
    verfahrensart = 'vereinfacht';
    vGrund = mieteSchutz
      ? 'Miete-Schutzmaterie (Hinterlegung/Missbrauch/Kündigungsschutz/Erstreckung) → vereinfacht ohne Rücksicht auf den Streitwert (Art. 243 Abs. 2 lit. c ZPO)'
      : 'Streitigkeit nach dem Gleichstellungsgesetz → vereinfacht ohne Rücksicht auf den Streitwert (Art. 243 Abs. 2 lit. a ZPO)';
  } else if (sw !== null && sw <= ZPO_SCHWELLEN.VEREINFACHT) {
    verfahrensart = 'vereinfacht';
    vGrund = `Vermögensrechtlich bis CHF ${ZPO_SCHWELLEN.VEREINFACHT.toLocaleString('de-CH')} → vereinfachtes Verfahren (Art. 243 Abs. 1 ZPO)`;
  } else {
    verfahrensart = 'ordentlich';
    vGrund = sw === null
      ? 'Nicht vermögensrechtlich und keine Sondermaterie → ordentliches Verfahren'
      : `Vermögensrechtlich über CHF ${ZPO_SCHWELLEN.VEREINFACHT.toLocaleString('de-CH')} → ordentliches Verfahren`;
  }
  rechenweg.push({
    beschreibung: `4 · Verfahrensart: ${vGrund}`,
    zwischenergebnis: verfahrensart === 'vereinfacht' ? 'vereinfachtes Verfahren'
      : verfahrensart === 'scheidungsverfahren' ? 'Scheidungsverfahren (Art. 274 ff. ZPO)' : 'ordentliches Verfahren',
    normen: istScheidung ? [N_274] : [N_243],
  });
  // Art. 243 Abs. 3: Das vereinfachte Verfahren findet KEINE Anwendung vor der
  // einzigen kantonalen Instanz (Art. 5/8) und vor dem Handelsgericht (Art. 6).
  if (verfahrensart === 'vereinfacht' && (hgWeiche || direktklageWeiche)) {
    warnungen.push('Wird das Handelsgericht bzw. die direkte Klage an das obere Gericht gewählt, findet das vereinfachte Verfahren dort KEINE Anwendung (Art. 243 Abs. 3 ZPO) — es gilt das ordentliche Verfahren.');
  }

  // ── Warnungen (Ehrlichkeit, §13) ──────────────────────────────────────────
  warnungen.push('Welches konkrete kantonale Gericht erst- und zweitinstanzlich zuständig ist (Streitwertgrenze Einzelgericht/Kollegium, Bezirks-/Kreiseinteilung), richtet sich nach kantonalem Recht (Art. 4 ZPO) und wird in dieser Phase noch nicht kantonsspezifisch aufgelöst.');
  // Kantonale SPEZIALBEHÖRDEN ausserhalb der Bundes-Systematik offenlegen:
  if (input.streitsache === 'arbeit') {
    warnungen.push('Einige Kantone kennen für arbeitsrechtliche Streitigkeiten besondere Spruchkörper (z. B. Arbeitsgerichte) oder eigene Schlichtungsbehörden — kantonales Recht (Art. 4 ZPO); die konkrete Stelle folgt mit der Kantonsschicht.');
  }
  if (input.streitsache === 'erbrecht') {
    warnungen.push('Für MASSNAHMEN im Zusammenhang mit dem Erbgang (z. B. Testamentseröffnung, Sicherungsmassregeln, Entgegennahme der Ausschlagung) ist die BEHÖRDE am letzten Wohnsitz der Erblasserin/des Erblassers zwingend zuständig (Art. 28 Abs. 2 ZPO) — kantonal organisiert (z. B. Erbschaftsbehörde/Erbschaftsamt), NICHT der Klageweg dieses Rechners.');
  }
  if (!input.vermoegensrechtlich) {
    warnungen.push('Nicht vermögensrechtliche Streitigkeit: streitwertabhängige Schwellen (vereinfachtes Verfahren, Entscheid/Entscheidvorschlag, Verzicht) sind nicht anwendbar.');
  }
  // IPRG/LugÜ-Weiche (Art. 2 ZPO): bei Auslandsbezug gelten die ZPO-Gerichts-
  // stände NICHT — Staatsverträge (insb. LugÜ) und das IPRG gehen vor.
  if (input.beklagteAuslandOderUnbekannt) {
    warnungen.push('AUSLANDSBEZUG: Die örtlichen ZPO-Gerichtsstände gelten nur im Binnenverhältnis — bei internationalen Sachverhalten bestimmen Staatsverträge (insb. LugÜ) und das IPRG die Zuständigkeit (Art. 2 ZPO). Dieses Ergebnis ist dann NICHT massgeblich.');
  }
  if (istGewaltschutz) {
    warnungen.push('Im Entscheidverfahren werden keine Gerichtskosten gesprochen (Art. 114 lit. f ZPO); die Parteientschädigung bleibt vorbehalten.');
  }
  if (input.streitsache === 'delikt' && (input.deliktUnterfall ?? 'allgemein') === 'allgemein') {
    warnungen.push('Spezialforen gehen vor: Motorfahrzeug-/Fahrradunfälle (Art. 38), ungerechtfertigte vorsorgliche Massnahmen (Art. 37), Nuklearschäden (Art. 38a — zwingend am Ereigniskanton); Adhäsionsklagen im Strafverfahren bleiben dem Strafgericht vorbehalten (Art. 39 ZPO).');
  }
  // Verfahrensrechtliche Sicherungs-Hinweise (Regelwerk Teil 3):
  weichen.push('Ab Rechtshängigkeit (Einreichung Schlichtungsgesuch bzw. Klage, Art. 62 ZPO) bleibt die örtliche Zuständigkeit erhalten, auch wenn sich die Anknüpfung später ändert (perpetuatio fori, Art. 64 Abs. 1 lit. b ZPO).');
  if (hgWeiche || direktklageWeiche || istEinzigeInstanz) {
    weichen.push('Bei Nichteintreten wegen Unzuständigkeit oder falscher Verfahrensart: Neueinreichung innert eines Monats wahrt das ursprüngliche Rechtshängigkeitsdatum (Art. 63 ZPO; seit 1.1.2025 auch bei amtlicher Weiterleitung nach Art. 143 Abs. 1bis ZPO).');
  }

  // ── 5 · Art der einleitenden Eingabe (→ Vorlagen-Verweis, Auftrag §8) ──────
  const eingabeArt: EingabeArt = istScheidung
    ? 'scheidungsbegehren_oder_klage'
    : obligatorisch ? 'schlichtungsgesuch' : 'klage_direkt';
  rechenweg.push({
    beschreibung: eingabeArt === 'scheidungsbegehren_oder_klage'
      ? '5 · Einleitende Eingabe: gemeinsames Scheidungsbegehren (bei Einigung) oder Scheidungsklage'
      : eingabeArt === 'schlichtungsgesuch'
        ? '5 · Einleitende Eingabe: Schlichtungsgesuch an die Schlichtungsbehörde (Art. 202 ZPO)'
        : '5 · Einleitende Eingabe: Klage direkt beim Gericht (keine Schlichtung)',
    zwischenergebnis: eingabeArt === 'scheidungsbegehren_oder_klage' ? 'Scheidungsbegehren / Scheidungsklage'
      : eingabeArt === 'schlichtungsgesuch' ? 'Schlichtungsgesuch' : 'Klage',
    normen: eingabeArt === 'scheidungsbegehren_oder_klage' ? [N_274] : eingabeArt === 'schlichtungsgesuch' ? [N_197] : [N_198],
  });

  const normverweise: Normverweis[] = [
    ...(istScheidung ? [N_274] : [N_243]), obligatorisch ? N_197 : N_198,
    ...(obligatorisch && (verzichtGemeinsam || verzichtEinseitig) ? [N_199] : []),
    ...(obligatorisch && behoerdeTyp !== 'ordentlich' ? [N_200] : []),
    ...oertlichNormen,
    ...(istEinzigeInstanz ? [N_5] : []),
    ...(input.gerichtsstandsvereinbarung ? [N_17, N_18] : []),
    ...(input.beklagteAuslandOderUnbekannt ? [N_2] : []),
    N_64, N_4,
  ];

  return {
    verfahrensart,
    schlichtung: { obligatorisch, entfaelltGrund, verzichtGemeinsam, verzichtEinseitig, behoerdeTyp, kostenlos: schlichtungKostenlos, kostenlosGrund },
    entscheidkompetenz: { entscheidAufAntrag, entscheidvorschlag },
    oertlich: { gerichtsstand, bindung, teilzwingend: bindung === 'teilzwingend', normen: oertlichNormen },
    eingabeArt,
    rechenweg, warnungen, weichen, normverweise,
  };
}

// ── Abbildung in das einheitliche Anzeige-/Berichtsformat ───────────────────
export function zustaendigkeitErgebnis(
  input: ZustaendigkeitInput,
): Berechnungsergebnis & { resultat: ZustaendigkeitErgebnis } {
  const r = bestimmeZustaendigkeit(input);
  const verfahren = r.verfahrensart === 'vereinfacht' ? 'Vereinfachtes Verfahren'
    : r.verfahrensart === 'scheidungsverfahren' ? 'Scheidungsverfahren' : 'Ordentliches Verfahren';
  const schlicht = r.schlichtung.obligatorisch
    ? (r.schlichtung.behoerdeTyp === 'paritaetisch_miete' ? 'Schlichtung: paritätische Behörde (Miete)'
      : r.schlichtung.behoerdeTyp === 'paritaetisch_glg' ? 'Schlichtung: paritätische Behörde (GlG)'
      : 'Schlichtung: ordentliche Behörde')
    : 'Schlichtung entfällt';
  return {
    ergebnis: `${verfahren} · ${schlicht} · ${r.oertlich.gerichtsstand}`,
    status: 'ok',
    rechenweg: r.rechenweg,
    annahmen: [
      'Binnenverhältnis Schweiz (kein internationaler Sachverhalt; IPRG/LugÜ ausgeklammert).',
      'Streitwert wird vom Nutzer eingegeben; keine Streitwertberechnung durch die Engine.',
      'Summarische Verfahren (Art. 248 ff. ZPO – klare Fälle, vorsorgliche Massnahmen, freiwillige Gerichtsbarkeit) sind nicht abgebildet; dort entfiele die Schlichtung (Art. 198 lit. a ZPO).',
    ],
    warnungen: r.warnungen,
    normverweise: r.normverweise,
    resultat: r,
  };
}

// ─── Rechtsmittel: obere Instanzen (Ausbau, Anordnung David 5.6.2026) ────────
//
// Bundesrechtliche Rechtsmittel-Weiche für erstinstanzliche Zivilentscheide.
// Wortlaut-verifiziert am Fedlex-Cache (5.6.2026):
//   Art. 308 Abs. 2 ZPO — Berufung in vermögensrechtlichen Angelegenheiten
//   nur ab Streitwert 10 000 (zuletzt aufrechterhaltene Rechtsbegehren).
//   Art. 319 lit. a ZPO — Beschwerde gegen nicht berufungsfähige Endentscheide.
//   Art. 74 BGG (SR 173.110, Stand 1.1.2025) — Beschwerde in Zivilsachen:
//   15 000 in arbeits- und mietrechtlichen Fällen, 30 000 übrige; Abs. 2
//   lit. a Rechtsfrage grundsätzlicher Bedeutung, lit. b einzige kantonale
//   Instanz (dann streitwertUNabhängig zulässig).
// Die konkrete obere Instanz je Kanton liefert die Datenschicht
// (src/data/obereInstanzen.ts) — hier nur Bundesrecht (§3).

export const RECHTSMITTEL_SCHWELLEN = {
  /** Art. 308 Abs. 2 ZPO */
  BERUFUNG_MIN: 10_000,
  /** Art. 74 Abs. 1 lit. a BGG (arbeits- und mietrechtliche Fälle) */
  BGER_MIETE_ARBEIT: 15_000,
  /** Art. 74 Abs. 1 lit. b BGG (übrige vermögensrechtliche Fälle) */
  BGER_UEBRIGE: 30_000,
} as const;

export interface RechtsmittelErgebnis {
  /** Kantonales Rechtsmittel gegen den erstinstanzlichen Endentscheid. */
  kantonal: 'berufung' | 'beschwerde' | 'offen' | 'entfaellt_einzige_instanz';
  kantonalText: string;
  /** Beschwerde in Zivilsachen ans Bundesgericht. */
  bger: 'zulaessig' | 'schwelle_verfehlt' | 'offen';
  bgerText: string;
  fristHinweis: string;
  normverweise: Normverweis[];
}

export function bestimmeRechtsmittel(input: ZustaendigkeitInput): RechtsmittelErgebnis {
  // Gleiche Eingabe-Validierung wie bestimmeZustaendigkeit (Stufe-2-Check
  // 6.6.2026: jetzt wirklich symmetrisch — auch fehlender Streitwert wirft).
  if (input.vermoegensrechtlich && input.streitwertCHF == null) {
    throw new Error('Bei vermögensrechtlichen Streitigkeiten ist der Streitwert erforderlich.');
  }
  if (ungueltig(input.streitwertCHF)) {
    throw new Error('Streitwert muss eine Zahl ≥ 0 sein.');
  }
  const sw = input.vermoegensrechtlich ? input.streitwertCHF : null;
  // Art. 5 ZPO: lit. a–c unbedingt; lit. d (UWG)/f (Bund) NUR über 30 000
  // (H1-Fix 6.6.2026). Bei uwg_oder_bund ≤30k läuft der ordentliche Weg.
  const ipU = input.ipUnterfall ?? 'ip_kartell_firma';
  const istEinzigeInstanz = input.streitsache === 'ip_wettbewerb'
    && (ipU === 'ip_kartell_firma'
      || (sw !== null && sw > ZPO_SCHWELLEN.VEREINFACHT)
      || (ipU === 'uwg' && input.bundKlagerecht === true));
  const mietArbeit = input.streitsache === 'arbeit' || input.streitsache === 'miete_wohn_geschaeft';
  const normverweise: Normverweis[] = [];

  // Kantonale Ebene (Art. 308/319 ZPO)
  let kantonal: RechtsmittelErgebnis['kantonal'];
  let kantonalText: string;
  if (istEinzigeInstanz) {
    kantonal = 'entfaellt_einzige_instanz';
    kantonalText = 'Die einzige kantonale Instanz (Art. 5 ZPO) entscheidet erst- und letztinstanzlich im Kanton — es gibt KEINE kantonale Berufung; nächste Stufe ist direkt das Bundesgericht (Art. 75 Abs. 2 lit. a BGG).';
    normverweise.push({ artikel: 'Art. 5 ZPO' }, { artikel: 'Art. 75 Abs. 2 BGG' });
  } else if (!input.vermoegensrechtlich) {
    kantonal = 'berufung';
    kantonalText = 'Nicht vermögensrechtliche Streitigkeit → BERUFUNG an die obere kantonale Instanz (Art. 308 Abs. 1 ZPO; die 10 000er-Grenze von Abs. 2 gilt nur für vermögensrechtliche Fälle).';
    normverweise.push({ artikel: 'Art. 308 ZPO' });
  } else if (sw === null) {
    kantonal = 'offen';
    kantonalText = `Ohne bezifferten Streitwert nicht bestimmbar: BERUFUNG ab Streitwert CHF ${RECHTSMITTEL_SCHWELLEN.BERUFUNG_MIN.toLocaleString('de-CH')} (zuletzt aufrechterhaltene Rechtsbegehren, Art. 308 Abs. 2 ZPO), darunter BESCHWERDE (Art. 319 lit. a ZPO).`;
    normverweise.push({ artikel: 'Art. 308 Abs. 2 ZPO' }, { artikel: 'Art. 319 ZPO' });
  } else if (sw >= RECHTSMITTEL_SCHWELLEN.BERUFUNG_MIN) {
    kantonal = 'berufung';
    kantonalText = `Streitwert CHF ${sw.toLocaleString('de-CH')} ≥ ${RECHTSMITTEL_SCHWELLEN.BERUFUNG_MIN.toLocaleString('de-CH')} → BERUFUNG an die obere kantonale Instanz (Art. 308 Abs. 2 ZPO). Massgeblich sind die zuletzt aufrechterhaltenen Rechtsbegehren.`;
    normverweise.push({ artikel: 'Art. 308 Abs. 2 ZPO' });
  } else {
    kantonal = 'beschwerde';
    kantonalText = `Streitwert CHF ${sw.toLocaleString('de-CH')} unter ${RECHTSMITTEL_SCHWELLEN.BERUFUNG_MIN.toLocaleString('de-CH')} → keine Berufung; BESCHWERDE an die obere kantonale Instanz (Art. 319 lit. a ZPO; nur Rechtsverletzung und offensichtlich unrichtige Sachverhaltsfeststellung, Art. 320 ZPO).`;
    normverweise.push({ artikel: 'Art. 319 ZPO' }, { artikel: 'Art. 320 ZPO' });
  }

  // Bundesgericht (Art. 74 BGG)
  let bger: RechtsmittelErgebnis['bger'];
  let bgerText: string;
  const bgerSchwelle = mietArbeit ? RECHTSMITTEL_SCHWELLEN.BGER_MIETE_ARBEIT : RECHTSMITTEL_SCHWELLEN.BGER_UEBRIGE;
  if (istEinzigeInstanz) {
    bger = 'zulaessig';
    bgerText = 'Beschwerde in Zivilsachen ans Bundesgericht streitwertUNABHÄNGIG zulässig, weil ein Bundesgesetz eine einzige kantonale Instanz vorsieht (Art. 74 Abs. 2 lit. b BGG).';
    normverweise.push({ artikel: 'Art. 74 Abs. 2 BGG' });
  } else if (!input.vermoegensrechtlich) {
    bger = 'zulaessig';
    bgerText = 'Nicht vermögensrechtliche Angelegenheit: Die Streitwertgrenze von Art. 74 Abs. 1 BGG gilt nicht — Beschwerde in Zivilsachen grundsätzlich zulässig.';
    normverweise.push({ artikel: 'Art. 74 BGG' });
  } else if (sw === null) {
    bger = 'offen';
    bgerText = `Ohne bezifferten Streitwert nicht bestimmbar: Beschwerde in Zivilsachen ab CHF ${bgerSchwelle.toLocaleString('de-CH')} (${mietArbeit ? 'arbeits-/mietrechtlicher Fall, Art. 74 Abs. 1 lit. a' : 'Art. 74 Abs. 1 lit. b'} BGG).`;
    normverweise.push({ artikel: 'Art. 74 Abs. 1 BGG' });
  } else if (sw >= bgerSchwelle) {
    bger = 'zulaessig';
    bgerText = `Streitwert CHF ${sw.toLocaleString('de-CH')} ≥ ${bgerSchwelle.toLocaleString('de-CH')} (${mietArbeit ? 'arbeits-/mietrechtlicher Fall' : 'übrige Fälle'}) → Beschwerde in Zivilsachen ans Bundesgericht zulässig (Art. 74 Abs. 1 BGG).`;
    normverweise.push({ artikel: 'Art. 74 Abs. 1 BGG' });
  } else {
    bger = 'schwelle_verfehlt';
    bgerText = `Streitwert CHF ${sw.toLocaleString('de-CH')} unter der BGer-Grenze von CHF ${bgerSchwelle.toLocaleString('de-CH')} (${mietArbeit ? 'Art. 74 Abs. 1 lit. a' : 'Art. 74 Abs. 1 lit. b'} BGG). Ausnahmen: Rechtsfrage von grundsätzlicher Bedeutung (Abs. 2 lit. a) — sonst bleibt die subsidiäre Verfassungsbeschwerde (Art. 113 ff. BGG).`;
    normverweise.push({ artikel: 'Art. 74 BGG' }, { artikel: 'Art. 113 BGG' });
  }

  return {
    kantonal, kantonalText, bger, bgerText,
    fristHinweis: 'Rechtsmittelfristen: Berufung/Beschwerde 30 Tage ab Zustellung des begründeten Entscheids (Art. 311 Abs. 1/321 Abs. 1 ZPO); im summarischen Verfahren 10 Tage (Art. 314 Abs. 1/321 Abs. 2 ZPO). Kantonal gilt der Gerichtsferien-Stillstand (Art. 145 Abs. 1 ZPO) — NICHT im summarischen Verfahren (Abs. 2 lit. b). Beschwerde ans Bundesgericht: 30 Tage (Art. 100 Abs. 1 BGG) mit eigenem Stillstand nach Art. 46 BGG.',
    normverweise,
  };
}
