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

export const ZPO_SCHWELLEN = {
  VEREINFACHT: 30_000,        // Art. 243 Abs. 1 ZPO (bis und mit)
  ENTSCHEIDVORSCHLAG: 10_000, // Art. 210 Abs. 1 lit. c ZPO (Revision 2025: vorher 5'000)
  ENTSCHEID_AUF_ANTRAG: 2_000,// Art. 212 Abs. 1 ZPO
  VERZICHT_GEMEINSAM: 100_000,// Art. 199 Abs. 1 ZPO
  HANDELSGERICHT_MIN: 30_000, // Art. 6 Abs. 2 lit. b ZPO
  DIREKTKLAGE_MIN: 100_000,   // Art. 8 Abs. 1 ZPO
} as const;

export type Streitsache = 'geldforderung' | 'miete_wohn_geschaeft' | 'arbeit';
export type Verfahrensart = 'vereinfacht' | 'ordentlich';
export type SchlichtungsbehoerdeTyp = 'ordentlich' | 'paritaetisch_miete' | 'paritaetisch_glg';

// Miete-Unterfall steuert die «Schutzmaterie» (Hinterlegung, Missbrauchs-/
// Kündigungsschutz, Erstreckung) → vereinfachtes Verfahren & Entscheidvorschlag
// STREITWERTUNABHÄNGIG (Art. 243 Abs. 2 lit. c, Art. 210 Abs. 1 lit. b ZPO).
export type MieteUnterfall =
  | 'kuendigungsschutz' | 'erstreckung' | 'mietzins_anfechtung' | 'hinterlegung' | 'sonstige';

const MIETE_SCHUTZ: ReadonlySet<MieteUnterfall> = new Set([
  'kuendigungsschutz', 'erstreckung', 'mietzins_anfechtung', 'hinterlegung',
]);

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
  beklagteAuslandOderUnbekannt?: boolean;// Art. 199 Abs. 2 lit. a/b
  widerklageOderGerichtlicheFrist?: boolean; // Art. 198 lit. g/h (Schlichtung entfällt)
}

export interface ZustaendigkeitErgebnis {
  verfahrensart: Verfahrensart;
  schlichtung: {
    obligatorisch: boolean;
    entfaelltGrund: string | null;
    verzichtGemeinsam: boolean;
    verzichtEinseitig: boolean;
    behoerdeTyp: SchlichtungsbehoerdeTyp;
  };
  entscheidkompetenz: { entscheidAufAntrag: boolean; entscheidvorschlag: boolean };
  oertlich: { gerichtsstand: string; teilzwingend: boolean; normen: Normverweis[] };
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
  const mieteSchutz = istMiete && MIETE_SCHUTZ.has(input.mieteUnterfall ?? 'sonstige');
  const streitwertunabhaengigVereinfacht = mieteSchutz || !!input.glgBetroffen;

  const rechenweg: Rechenschritt[] = [];
  const warnungen: string[] = [];
  const weichen: string[] = [];

  // ── A · Verfahrensart (Art. 243 ZPO) ──────────────────────────────────────
  let verfahrensart: Verfahrensart;
  let vGrund: string;
  if (streitwertunabhaengigVereinfacht) {
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
  rechenweg.push({ beschreibung: `Verfahrensart: ${vGrund}`, zwischenergebnis: verfahrensart === 'vereinfacht' ? 'vereinfachtes Verfahren' : 'ordentliches Verfahren', normen: [N_243] });

  // ── B · Schlichtungspflicht (Art. 197–199 ZPO) ────────────────────────────
  let entfaelltGrund: string | null = null;
  if (input.widerklageOderGerichtlicheFrist) {
    entfaelltGrund = 'Widerklage/Hauptintervention bzw. gerichtlich gesetzte Klagefrist (Art. 198 lit. g/h ZPO)';
  }
  const obligatorisch = entfaelltGrund === null;
  const verzichtGemeinsam = sw !== null && sw >= ZPO_SCHWELLEN.VERZICHT_GEMEINSAM;
  const verzichtEinseitig = !!input.beklagteAuslandOderUnbekannt || !!input.glgBetroffen;
  rechenweg.push({
    beschreibung: obligatorisch
      ? 'Schlichtungsversuch geht dem Entscheidverfahren grundsätzlich voraus'
      : `Schlichtung entfällt: ${entfaelltGrund}`,
    zwischenergebnis: obligatorisch ? 'Schlichtung obligatorisch' : 'keine Schlichtung',
    normen: obligatorisch ? [N_197] : [N_198],
  });
  if (obligatorisch && verzichtGemeinsam) {
    weichen.push(`Streitwert ≥ CHF ${ZPO_SCHWELLEN.VERZICHT_GEMEINSAM.toLocaleString('de-CH')}: Die Parteien können gemeinsam auf das Schlichtungsverfahren verzichten (Art. 199 Abs. 1 ZPO).`);
  }
  if (obligatorisch && verzichtEinseitig) {
    weichen.push('Einseitiger Verzicht der klagenden Partei möglich (beklagte Partei im Ausland/unbekannt oder Streit nach Gleichstellungsgesetz, Art. 199 Abs. 2 ZPO).');
  }

  // ── C · Schlichtungsbehörde-Typ (Art. 200 ZPO) ────────────────────────────
  const behoerdeTyp: SchlichtungsbehoerdeTyp = istMiete
    ? 'paritaetisch_miete'
    : input.glgBetroffen ? 'paritaetisch_glg' : 'ordentlich';
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

  // ── D · Entscheidkompetenz der Schlichtungsbehörde (Art. 210/212 ZPO) ──────
  const entscheidAufAntrag = sw !== null && sw <= ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG;
  const entscheidvorschlag = !!input.glgBetroffen || mieteSchutz || (sw !== null && sw <= ZPO_SCHWELLEN.ENTSCHEIDVORSCHLAG);
  if (obligatorisch && (entscheidAufAntrag || entscheidvorschlag)) {
    const teile: string[] = [];
    if (entscheidAufAntrag) teile.push(`Entscheid auf Antrag der klagenden Partei (bis CHF ${ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG.toLocaleString('de-CH')}, Art. 212 ZPO)`);
    if (entscheidvorschlag) teile.push(`Entscheidvorschlag der Behörde möglich (Art. 210 ZPO)`);
    rechenweg.push({
      beschreibung: `Kompetenz der Schlichtungsbehörde: ${teile.join('; ')}`,
      zwischenergebnis: entscheidAufAntrag ? 'Entscheid möglich' : 'Entscheidvorschlag möglich',
      normen: [entscheidAufAntrag ? N_212 : N_210],
    });
  }

  // ── E · Örtliche Zuständigkeit (Art. 10/32/33/34/35 ZPO) ──────────────────
  let gerichtsstand: string;
  let teilzwingend = false;
  let oertlichNormen: Normverweis[];
  if (istMiete) {
    gerichtsstand = 'Gericht am Ort der gelegenen Sache';
    teilzwingend = true; // Art. 35 Abs. 1 lit. b (Wohn-/Geschäftsräume)
    oertlichNormen = [N_33, N_35];
  } else if (input.streitsache === 'arbeit') {
    gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei oder am gewöhnlichen Arbeitsort (Wahl der klagenden Partei)';
    teilzwingend = true; // Art. 35 Abs. 1 lit. d
    oertlichNormen = [N_34, N_35];
  } else if (input.konsumentenvertrag) {
    gerichtsstand = input.klaegeristGeschuetzt
      ? 'Gericht am Wohnsitz/Sitz einer der Parteien (Wahl der klagenden Konsumentin/des Konsumenten)'
      : 'Gericht am Wohnsitz der beklagten Konsumentin/des Konsumenten';
    teilzwingend = true; // Art. 35 Abs. 1 lit. a
    oertlichNormen = [N_32, N_35];
  } else {
    // dispositiv (teilzwingend bleibt false): Gerichtsstandsvereinbarung möglich
    gerichtsstand = 'Gericht am Wohnsitz/Sitz der beklagten Partei';
    oertlichNormen = [N_10];
  }
  rechenweg.push({ beschreibung: `Örtliche Zuständigkeit: ${gerichtsstand}${teilzwingend ? ' (teilzwingend — Verzicht der geschützten Partei zum Voraus unzulässig)' : ' (dispositiv)'}`, zwischenergebnis: gerichtsstand, normen: oertlichNormen });
  if (teilzwingend) {
    weichen.push('Gerichtsstandsvereinbarung nur NACH Entstehung der Streitigkeit gültig — die geschützte Partei kann zum Voraus nicht verzichten (Art. 35 ZPO).');
  }

  // ── F · Sachlich/funktionell (Weichen — Kantonsschicht/ZPO Art. 4/6/8) ─────
  // Handelsgericht: nur Geldforderung (Miete & Arbeit sind nach Art. 6 Abs. 2
  // lit. d ausgeschlossen); nur in Kantonen mit Handelsgericht.
  let hgWeiche = false;
  let direktklageWeiche = false;
  if (input.streitsache === 'geldforderung' && input.geschaeftlicheTaetigkeit && input.beklagteImHR) {
    const swOk = sw === null || sw > ZPO_SCHWELLEN.HANDELSGERICHT_MIN;
    if (swOk && input.klaegerImHR) {
      hgWeiche = true;
      weichen.push('Handelsgericht prüfen: handelsrechtliche Streitigkeit nach Art. 6 ZPO (nur in Kantonen mit Handelsgericht, real ZH/BE/AG/SG). Dann Klage direkt beim Gericht, Schlichtung entfällt (Art. 199 Abs. 3 ZPO).');
    } else if (swOk) {
      hgWeiche = true;
      weichen.push('Nur die beklagte Partei ist im Handelsregister eingetragen: Die klagende Partei kann zwischen Handelsgericht und ordentlichem Gericht wählen (Art. 6 Abs. 3 ZPO; nur HG-Kantone).');
    }
  }
  if (sw !== null && sw >= ZPO_SCHWELLEN.DIREKTKLAGE_MIN) {
    direktklageWeiche = true;
    weichen.push(`Direkte Klage ans obere Gericht möglich (Streitwert ≥ CHF ${ZPO_SCHWELLEN.DIREKTKLAGE_MIN.toLocaleString('de-CH')}, Zustimmung der beklagten Partei, Art. 8 ZPO). Dann Schlichtung entfällt (Art. 199 Abs. 3 ZPO).`);
  }
  // Art. 243 Abs. 3: Das vereinfachte Verfahren findet KEINE Anwendung vor der
  // einzigen kantonalen Instanz (Art. 5/8) und vor dem Handelsgericht (Art. 6).
  // Trifft eine dieser Weichen mit «vereinfacht» zusammen, gilt bei deren Wahl
  // das ordentliche Verfahren — offenlegen statt verschweigen (§8).
  if (verfahrensart === 'vereinfacht' && (hgWeiche || direktklageWeiche)) {
    warnungen.push('Wird das Handelsgericht bzw. die direkte Klage an das obere Gericht gewählt, findet das vereinfachte Verfahren dort KEINE Anwendung (Art. 243 Abs. 3 ZPO) — es gilt das ordentliche Verfahren.');
  }

  // ── Warnungen (Ehrlichkeit, §13) ──────────────────────────────────────────
  warnungen.push('Welches konkrete kantonale Gericht erst- und zweitinstanzlich zuständig ist (Streitwertgrenze Einzelgericht/Kollegium, Bezirks-/Kreiseinteilung), richtet sich nach kantonalem Recht (Art. 4 ZPO) und wird in dieser Phase noch nicht kantonsspezifisch aufgelöst.');
  if (!input.vermoegensrechtlich) {
    warnungen.push('Nicht vermögensrechtliche Streitigkeit: streitwertabhängige Schwellen (vereinfachtes Verfahren, Entscheid/Entscheidvorschlag, Verzicht) sind nicht anwendbar.');
  }

  const normverweise: Normverweis[] = [
    N_243, obligatorisch ? N_197 : N_198,
    ...(obligatorisch && (verzichtGemeinsam || verzichtEinseitig) ? [N_199] : []),
    ...(obligatorisch && behoerdeTyp !== 'ordentlich' ? [N_200] : []),
    ...oertlichNormen, N_4,
  ];

  return {
    verfahrensart,
    schlichtung: { obligatorisch, entfaelltGrund, verzichtGemeinsam, verzichtEinseitig, behoerdeTyp },
    entscheidkompetenz: { entscheidAufAntrag, entscheidvorschlag },
    oertlich: { gerichtsstand, teilzwingend, normen: oertlichNormen },
    rechenweg, warnungen, weichen, normverweise,
  };
}

// ── Abbildung in das einheitliche Anzeige-/Berichtsformat ───────────────────
export function zustaendigkeitErgebnis(
  input: ZustaendigkeitInput,
): Berechnungsergebnis & { resultat: ZustaendigkeitErgebnis } {
  const r = bestimmeZustaendigkeit(input);
  const verfahren = r.verfahrensart === 'vereinfacht' ? 'Vereinfachtes Verfahren' : 'Ordentliches Verfahren';
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
