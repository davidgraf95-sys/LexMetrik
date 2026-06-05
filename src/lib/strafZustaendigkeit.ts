// ─── StPO-Zuständigkeits-Engine (Rechtsweg «Straf») ─────────────────────────
//
// Eigene Engine analog Zivil/SchKG (§4: keine Fusion). Quelle:
// bibliothek/normen/stpo-zustaendigkeit-regelwerk.md (Wortlaute verbatim am
// Cache /tmp/stpo.html, Stand 1.1.2024) — Decision Tree Stufen 0–8 +
// 22-Zeilen-Konstellationstabelle. Anzeige-Fahrplan: Art. 301 StPO und
// Art. 31 StGB (3-Monats-Antragsfrist) am 6.6.2026 verbatim verifiziert.
// Rein und deterministisch (§2). Die konkrete Behörde liefert die
// Datenschicht (src/data/staatsanwaltschaften.ts), hier nur Bundesrecht.

export type StrafSpezialforum = 'kein' | 'medien' | 'schkg_delikt' | 'unternehmen' | 'einziehung';
export type StrafTatortLage = 'bekannt' | 'nur_erfolgsort' | 'mehrere_orte' | 'ausland_oder_ungewiss';
export type StrafKaskade32 = 'wohnsitz' | 'aufenthalt' | 'heimatort' | 'ergreifungsort' | 'auslieferung';
export type StrafBeteiligung = 'allein' | 'teilnehmer' | 'mittaeter';

export interface StrafInput {
  anliegen: 'anzeige' | 'gerichtsstand';
  /** Weiche, keine Subsumtion: Katalog-Delikte Art. 23/24 StPO (z. B.
   *  Sprengstoff, organisiertes Verbrechen, qualifizierte Wirtschaftsfälle). */
  moeglichesBundesdelikt?: boolean;
  spezialforum?: StrafSpezialforum;
  tatort: StrafTatortLage;
  kaskade32?: StrafKaskade32;
  beteiligung?: StrafBeteiligung;
  mehrereTatenVerschOrte?: boolean;
  antragsdelikt?: boolean;
  uebertretung?: boolean;
}

export interface StrafNorm { artikel: string; bemerkung?: string }
export interface StrafSchritt { titel: string; text: string }
export interface StrafFrist { label: string; frist: string; norm: string; kritisch: boolean }

export interface StrafErgebnis {
  forum: { text: string; normen: StrafNorm[] };
  behoerdeTyp: string;
  fahrplan: StrafSchritt[];
  fristen: StrafFrist[];
  warnungen: string[];
  weichen: string[];
  normverweise: StrafNorm[];
}

// Kaskade exakt nach Art. 32: Abs. 1 = Wohnsitz ODER gewöhnlicher Aufenthalt
// (gleichrangig!), Abs. 2 = Heimatort → Ergreifungsort, Abs. 3 = Auslieferungs-
// kanton. (Abschluss-Review 6.6.2026: der gewöhnliche Aufenthalt fehlte.)
const KASKADE_TEXT: Record<StrafKaskade32, { text: string; stufe: string }> = {
  wohnsitz: { text: 'am WOHNSITZ der beschuldigten Person', stufe: 'Abs. 1' },
  aufenthalt: { text: 'am Ort des GEWÖHNLICHEN AUFENTHALTS der beschuldigten Person (gleichrangig zum Wohnsitz)', stufe: 'Abs. 1' },
  heimatort: { text: 'am HEIMATORT der beschuldigten Person (weder Wohnsitz noch gewöhnlicher Aufenthalt in der Schweiz)', stufe: 'Abs. 2' },
  ergreifungsort: { text: 'am ORT DER ERGREIFUNG (auch kein Heimatort in der Schweiz)', stufe: 'Abs. 2' },
  auslieferung: { text: 'im AUSLIEFERUNGSKANTON (Ergreifung im Ausland)', stufe: 'Abs. 3' },
};

export function bestimmeStrafZustaendigkeit(input: StrafInput): StrafErgebnis {
  const warnungen: string[] = [];
  const weichen: string[] = [];
  const normverweise: StrafNorm[] = [];
  const fristen: StrafFrist[] = [];
  const fahrplan: StrafSchritt[] = [];
  const spezial = input.spezialforum ?? 'kein';

  // ── Stufe 0 · Bundesgerichtsbarkeit (Weiche, keine Subsumtion) ─────────────
  if (input.moeglichesBundesdelikt) {
    warnungen.push('Möglicher Fall von BUNDESGERICHTSBARKEIT (Kataloge Art. 23/24 StPO — u. a. Sprengstoff, organisiertes Verbrechen/Terrorismus, qualifizierte Wirtschaftskriminalität): Dann ermittelt die BUNDESANWALTSCHAFT und die örtlichen Regeln der Art. 31 ff. StPO gelten nicht. Die Katalog-Subsumtion ist fachlich zu prüfen; im Zweifel nimmt jede Strafverfolgungsbehörde die Anzeige entgegen und leitet weiter (Art. 39 StPO).');
    normverweise.push({ artikel: 'Art. 23 StPO' }, { artikel: 'Art. 24 StPO' });
  }

  // ── Stufen 1–4 · Forum ─────────────────────────────────────────────────────
  let forumText: string;
  const forumNormen: StrafNorm[] = [];
  if (spezial === 'medien') {
    forumText = 'Bei Medienstraftaten (Art. 28 StGB): Behörden am SITZ DES MEDIENUNTERNEHMENS; alternativ am Wohnsitz der Autorin/des Autors, subsidiär am Verbreitungsort';
    forumNormen.push({ artikel: 'Art. 35 StPO' });
  } else if (spezial === 'schkg_delikt') {
    forumText = 'Bei Konkurs- und Betreibungsdelikten (Art. 163–171 StGB): Behörden am WOHNSITZ, AUFENTHALTSORT oder SITZ DES SCHULDNERS';
    forumNormen.push({ artikel: 'Art. 36 Abs. 1 StPO' });
  } else if (spezial === 'unternehmen') {
    forumText = 'Bei Unternehmensstrafbarkeit (Art. 102 StGB): Behörden am SITZ DES UNTERNEHMENS — das Forum zieht auch das Verfahren gegen natürliche Personen aus demselben Sachverhalt an';
    forumNormen.push({ artikel: 'Art. 36 Abs. 2 StPO' });
  } else if (spezial === 'einziehung') {
    forumText = 'Bei selbstständiger Einziehung: Behörden am ORT, WO SICH DIE EINZUZIEHENDEN GEGENSTÄNDE/VERMÖGENSWERTE BEFINDEN; bei mehreren Kantonen entscheidet die zuerst eröffnete Untersuchung';
    forumNormen.push({ artikel: 'Art. 37 StPO' });
  } else if (input.tatort === 'bekannt') {
    forumText = 'GRUNDSATZ TATORT: zuständig sind die Behörden des Ortes, an dem die Tat VERÜBT worden ist (Begehungsort)';
    forumNormen.push({ artikel: 'Art. 31 Abs. 1 StPO' });
  } else if (input.tatort === 'nur_erfolgsort') {
    forumText = 'Liegt nur der ERFOLG der Tat in der Schweiz, sind die Behörden des ERFOLGSORTES zuständig';
    forumNormen.push({ artikel: 'Art. 31 Abs. 1 StPO', bemerkung: 'Satz 2' });
  } else if (input.tatort === 'mehrere_orte') {
    forumText = 'Tat an MEHREREN Orten verübt (oder Erfolg an mehreren Orten eingetreten): zuständig sind die Behörden des Ortes, an dem die ERSTEN VERFOLGUNGSHANDLUNGEN vorgenommen wurden (Prioritätsprinzip / forum praeventionis)';
    forumNormen.push({ artikel: 'Art. 31 Abs. 2 StPO' });
  } else {
    const k = KASKADE_TEXT[input.kaskade32 ?? 'wohnsitz'];
    forumText = `Tat im AUSLAND oder Tatort NICHT feststellbar — Kaskade des Art. 32 StPO (${k.stufe}): ${k.text}`;
    forumNormen.push({ artikel: 'Art. 32 StPO' });
  }

  // ── Stufe 3 · Beteiligung ──────────────────────────────────────────────────
  if ((input.beteiligung ?? 'allein') === 'teilnehmer') {
    weichen.push('Teilnehmende (Anstiftung/Gehilfenschaft) werden von DENSELBEN Behörden verfolgt wie die Täterschaft — das Forum der Haupttat zieht (Art. 33 Abs. 1 StPO).');
    normverweise.push({ artikel: 'Art. 33 StPO' });
  } else if (input.beteiligung === 'mittaeter') {
    weichen.push('Bei Mittäterschaft: zuständig sind die Behörden des Ortes, an dem die ERSTEN Verfolgungshandlungen vorgenommen wurden (Art. 33 Abs. 2 StPO).');
    normverweise.push({ artikel: 'Art. 33 StPO' });
  }

  // ── Stufe 4 · Mehrere Taten ────────────────────────────────────────────────
  if (input.mehrereTatenVerschOrte) {
    weichen.push('Mehrere Taten an verschiedenen Orten: zuständig sind die Behörden des Ortes der mit der SCHWERSTEN STRAFE bedrohten Tat (abstrakte Strafdrohung); bei gleicher Strafdrohung gilt das Prioritätsprinzip (Art. 34 Abs. 1 StPO). Ist in einem Kanton bereits Anklage erhoben, werden die Verfahren GETRENNT geführt (Abs. 2).');
    normverweise.push({ artikel: 'Art. 34 StPO' });
  }

  // ── Stufen 5–8 · Verfahrens-Weichen (immer offenlegen) ─────────────────────
  weichen.push('Die Staatsanwaltschaften können einvernehmlich ein ABWEICHENDES Forum vereinbaren, wenn der Schwerpunkt der Tat, die persönlichen Verhältnisse oder andere triftige Gründe es nahelegen (Art. 38 Abs. 1 StPO).');
  weichen.push('Parteien können die Verletzung der Gerichtsstandsregeln rügen: zuerst Antrag auf Überweisung, dann BESCHWERDE innert 10 Tagen an die Behörde nach Art. 40 StPO (Art. 41 StPO). Interkantonale Konflikte entscheidet die Beschwerdekammer des Bundesstrafgerichts (Art. 40 Abs. 2 StPO).');
  weichen.push('Ist der Gerichtsstand nach Art. 38–41 festgelegt, wird daran festgehalten (perpetuatio fori); eine Änderung braucht NEUE wichtige Gründe und ist nur VOR der Anklageerhebung möglich (Art. 42 Abs. 3 StPO).');
  normverweise.push(...forumNormen, { artikel: 'Art. 38 StPO' }, { artikel: 'Art. 41 StPO' }, { artikel: 'Art. 42 StPO' });

  // ── Behördentyp ────────────────────────────────────────────────────────────
  const behoerdeTyp = input.uebertretung
    ? 'Staatsanwaltschaft bzw. ÜBERTRETUNGSSTRAFBEHÖRDE (in Kantonen mit Verwaltungsbehörden nach Art. 17 StPO — diese haben die Befugnisse der Staatsanwaltschaft, Art. 357 StPO)'
    : 'Staatsanwaltschaft des Forum-Kantons (Untersuchung und Anklage, Art. 16 StPO)';
  if (input.uebertretung) normverweise.push({ artikel: 'Art. 17 StPO' }, { artikel: 'Art. 357 StPO' });

  // ── Fahrplan + Fristen ─────────────────────────────────────────────────────
  if (input.anliegen === 'anzeige') {
    fahrplan.push(
      { titel: 'Strafanzeige erstatten — formfrei', text: 'Jede Person kann Straftaten bei einer STRAFVERFOLGUNGSBEHÖRDE schriftlich oder mündlich anzeigen (Art. 301 Abs. 1 StPO) — bei der Polizei oder direkt bei der Staatsanwaltschaft; für die mündliche Anzeige kann eine Protokoll-Bestätigung verlangt werden (Abs. 1bis).' },
      { titel: 'Örtlich: an die Behörden des Forums', text: 'Massgeblich ist das oben bestimmte Forum — die Anzeige kann aber bei JEDER Strafverfolgungsbehörde eingereicht werden; sie leitet an die zuständige Stelle weiter (Art. 39 StPO).' },
      { titel: 'Bei Antragsdelikten: Strafantrag stellen', text: 'Der Strafantrag ist ausdrücklich zu stellen (Art. 304 StPO); ohne gültigen Antrag wird bei Antragsdelikten nicht verfolgt (Art. 30 StGB).' },
    );
    if (input.antragsdelikt) {
      fristen.push({ label: 'Strafantragsfrist', frist: '3 Monate ab dem Tag, an dem die antragsberechtigte Person den Täter kennt', norm: 'Art. 31 StGB', kritisch: true });
    }
    fahrplan.push({ titel: 'Parteistellung prüfen', text: 'Wer durch die Tat unmittelbar verletzt ist, kann sich bis zum Abschluss des Vorverfahrens als PRIVATKLÄGERSCHAFT konstituieren (Straf- und/oder Zivilklage, Art. 118 f. StPO) — sonst nur Anzeigeperson ohne Verfahrensrechte (Art. 301 Abs. 3 StPO).' });
  } else {
    fahrplan.push(
      { titel: 'Forum nach der Kaskade bestimmen', text: 'Spezialforen (Art. 35–37) vor Grundsatz Tatort (Art. 31), dann Kaskade (Art. 32) — Beteiligung (Art. 33) und Tatmehrheit (Art. 34) verschieben das Forum.' },
      { titel: 'Bei Streit: Einigung → Entscheid', text: 'Die beteiligten Staatsanwaltschaften klären die Zuständigkeit untereinander (Art. 39 Abs. 2); scheitert die Einigung, entscheidet innerkantonal die Ober-/Generalstaatsanwaltschaft, interkantonal die Beschwerdekammer des Bundesstrafgerichts (Art. 40).' },
    );
  }

  return { forum: { text: forumText, normen: forumNormen }, behoerdeTyp, fahrplan, fristen, warnungen, weichen, normverweise };
}
