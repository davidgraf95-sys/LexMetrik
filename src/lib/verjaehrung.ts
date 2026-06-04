import { parseISO, format, addDays, addYears, differenceInCalendarDays, isAfter, isBefore } from 'date-fns';
import type { Berechnungsergebnis, Rechenschritt, Normverweis, Kanton } from '../types/legal';
import { istArbeitsfreierTag } from '../data/zpoFeiertage';
import { rechtsprechung } from '../data/verifikation';

// ─── Verjährung (Art. 60, 67, 127–142 OR, Stand Revision 1.1.2020) ─────────
//
// Vier Hauptregime mit je definiertem Fristbeginn und Dauer; einheitliche
// Berechnungs- (Art. 132 i.V.m. 77/78) und Modifikationsregeln:
// Stillstand (Art. 134) hängt gehemmte Tage hinten an, Unterbrechung
// (Art. 135/137/138) setzt die Frist neu. Zwei-Fristen-Logik: relative und
// absolute Frist laufen parallel; massgeblich ist das frühere Ende.
//
// Bewusst NICHT modelliert (Warnung/Annahme im Ergebnis): strafrechtliche
// Längerfrist (Art. 60 Abs. 2, StGB-abhängig), Spezialgesetze (SVG, VG, PrHG),
// Übergangsrecht für Altfälle vor 1.1.2020 (Art. 49 SchlT ZGB).

export type VerjaehrungRegime =
  | 'ordentlich'      // Art. 127: 10 Jahre ab Fälligkeit
  | 'kurz'            // Art. 128: 5 Jahre ab Fälligkeit (Katalogforderungen)
  | 'delikt'          // Art. 60 Abs. 1: 3 Jahre ab Kenntnis / 10 Jahre ab Verhalten
  | 'delikt_person'   // Art. 60 Abs. 1bis: 3 Jahre / 20 Jahre (Tötung/Körperverletzung)
  | 'vertrag_person'  // Art. 128a: 3 Jahre ab Kenntnis / 20 Jahre ab Pflichtverletzung
  | 'bereicherung';   // Art. 67 Abs. 1: 3 Jahre ab Kenntnis / 10 Jahre ab Entstehung

export type UnterbrechungsTyp =
  | 'anerkennung'        // Art. 135 Ziff. 1 (formlos; z. B. Abschlagszahlung) → Ursprungsdauer
  | 'urkunde_urteil'     // Art. 137 Abs. 2: Anerkennung durch Urkunde / Urteil → stets 10 Jahre
  | 'betreibungsakt'     // Art. 135 Ziff. 2 / 138 Abs. 2: jeder Betreibungsakt → Ursprungsdauer
  | 'klage_schlichtung'; // Art. 135 Ziff. 2 / 138 Abs. 1: Hemmung bis Abschluss der Instanz

export type Unterbrechung = {
  typ: UnterbrechungsTyp;
  datum: string;        // yyyy-MM-dd
  prozessEnde?: string;  // nur klage_schlichtung: Abschluss vor der befassten Instanz (BGE 147 III 419)
  mitUrteil?: boolean;   // Abschluss durch Urteil → Art. 137 Abs. 2 (10 Jahre)
};

export type Stillstand = { von: string; bis: string; grund?: string }; // Art. 134 Abs. 1

export type VerjaehrungInput = {
  regime: VerjaehrungRegime;
  beginnRelativ: string;   // dies a quo der (relativen) Frist: Fälligkeit bzw. Kenntnis
  beginnAbsolut?: string;  // Delikt: schädigendes Verhalten (Ende); Bereicherung: Entstehung
  stichtag: string;        // Prüfdatum
  kanton: Kanton;          // Feiertagsverschiebung am Erfüllungsort (Art. 78)
  strafbareHandlung?: boolean;       // Art. 60 Abs. 2 → Hinweis (externe StGB-Frist)
  stillstaende?: Stillstand[];
  unterbrechungen?: Unterbrechung[];
  verzicht?: { datum: string; jahre?: number }; // Art. 141 (Overlay, max. 10 Jahre)
};

export type VerjaehrungErgebnis = Berechnungsergebnis & {
  relativEndeISO?: string;   // Ende der relativen/einheitlichen Frist (nach Modifikatoren)
  absolutEndeISO?: string;   // Ende der absoluten Frist (falls Regime eine kennt)
  verjaehrungISO?: string;   // massgebliches Ende (frühere der beiden, werktagsverschoben)
  massgeblicheFrist?: 'relativ' | 'absolut'; // welche Frist das Ende bestimmt
  verjaehrtAmStichtag?: boolean;
  verzichtBisISO?: string;   // Einredeverzicht wirkt bis (Art. 141)
  gehemmtTage?: number;
};

// ─── Regime-Tabelle ─────────────────────────────────────────────────────────

const REGIME: Record<VerjaehrungRegime, {
  label: string; relativJahre: number; absolutJahre: number | null;
  beginnLabel: string; absolutLabel?: string; normen: Normverweis[];
}> = {
  ordentlich: {
    label: 'Ordentliche Frist — 10 Jahre (Art. 127 OR)', relativJahre: 10, absolutJahre: null,
    beginnLabel: 'Fälligkeit der Forderung',
    normen: [{ artikel: 'Art. 127 OR', bemerkung: 'Auffangnorm: 10 Jahre' }, { artikel: 'Art. 130 Abs. 1 OR', bemerkung: 'Beginn mit Fälligkeit' }],
  },
  kurz: {
    label: 'Kurze Frist — 5 Jahre (Art. 128 OR)', relativJahre: 5, absolutJahre: null,
    beginnLabel: 'Fälligkeit der Forderung',
    normen: [{ artikel: 'Art. 128 OR', bemerkung: 'Katalogforderungen: 5 Jahre' }, { artikel: 'Art. 130 Abs. 1 OR', bemerkung: 'Beginn mit Fälligkeit' }],
  },
  delikt: {
    label: 'Unerlaubte Handlung — 3 / 10 Jahre (Art. 60 Abs. 1 OR)', relativJahre: 3, absolutJahre: 10,
    beginnLabel: 'Kenntnis von Schaden und Person des Ersatzpflichtigen',
    absolutLabel: 'schädigendes Verhalten (bzw. dessen Ende)',
    normen: [{ artikel: 'Art. 60 Abs. 1 OR', bemerkung: 'relativ 3 Jahre / absolut 10 Jahre' }],
  },
  delikt_person: {
    label: 'Unerlaubte Handlung, Personenschaden — 3 / 20 Jahre (Art. 60 Abs. 1bis OR)', relativJahre: 3, absolutJahre: 20,
    beginnLabel: 'Kenntnis von Schaden und Person des Ersatzpflichtigen',
    absolutLabel: 'schädigendes Verhalten (bzw. dessen Ende)',
    normen: [{ artikel: 'Art. 60 Abs. 1bis OR', bemerkung: 'Tötung/Körperverletzung: absolut 20 Jahre' }],
  },
  vertrag_person: {
    label: 'Vertraglicher Personenschaden — 3 / 20 Jahre (Art. 128a OR)', relativJahre: 3, absolutJahre: 20,
    beginnLabel: 'Kenntnis des Schadens',
    absolutLabel: 'Pflichtverletzung (bzw. deren Ende)',
    normen: [{ artikel: 'Art. 128a OR', bemerkung: 'Körperverletzung/Tötung aus Vertrag: 3 / 20 Jahre' }],
  },
  bereicherung: {
    label: 'Ungerechtfertigte Bereicherung — 3 / 10 Jahre (Art. 67 Abs. 1 OR)', relativJahre: 3, absolutJahre: 10,
    beginnLabel: 'Kenntnis des Bereicherungsanspruchs',
    absolutLabel: 'Entstehung des Anspruchs',
    normen: [{ artikel: 'Art. 67 Abs. 1 OR', bemerkung: 'relativ 3 Jahre / absolut 10 Jahre' }],
  },
};

const N_132: Normverweis = { artikel: 'Art. 132 OR', bemerkung: 'Beginntag zählt nicht; Ende am zahlengleichen Tag' };
const N_78: Normverweis = { artikel: 'Art. 78 OR', bemerkung: 'Sonn-/Feiertag → nächster Werktag; Samstag gleichgestellt' };
const N_134: Normverweis = { artikel: 'Art. 134 OR', bemerkung: 'Stillstand: gehemmte Tage werden angehängt' };
const N_135: Normverweis = { artikel: 'Art. 135 OR', bemerkung: 'Unterbrechung: Frist beginnt neu' };
const N_137_1: Normverweis = { artikel: 'Art. 137 Abs. 1 OR', bemerkung: 'neue Frist mit Ursprungsdauer' };
const N_137_2: Normverweis = { artikel: 'Art. 137 Abs. 2 OR', bemerkung: 'Urkunde/Urteil: neue Frist stets 10 Jahre' };
const N_138_1: Normverweis = { artikel: 'Art. 138 Abs. 1 OR', bemerkung: 'Hemmung bis Abschluss vor der befassten Instanz' };
const N_138_2: Normverweis = { artikel: 'Art. 138 Abs. 2 OR', bemerkung: 'jeder Betreibungsakt unterbricht neu' };
const N_141: Normverweis = { artikel: 'Art. 141 OR', bemerkung: 'Einredeverzicht: schriftlich, max. 10 Jahre' };
const N_142: Normverweis = { artikel: 'Art. 142 OR', bemerkung: 'Verjährung nur auf Einrede zu beachten' };
const N_60_2: Normverweis = { artikel: 'Art. 60 Abs. 2 OR', bemerkung: 'strafrechtliche Längerfrist vorbehalten' };

const fmt = (d: Date) => format(d, 'dd.MM.yyyy');
const iso = (d: Date) => format(d, 'yyyy-MM-dd');

const TYP_LABEL: Record<UnterbrechungsTyp, string> = {
  anerkennung: 'Anerkennung (Art. 135 Ziff. 1 OR)',
  urkunde_urteil: 'Anerkennung durch Urkunde / gerichtliche Feststellung (Art. 137 Abs. 2 OR)',
  betreibungsakt: 'Betreibungsakt (Art. 135 Ziff. 2 / 138 Abs. 2 OR)',
  klage_schlichtung: 'Schlichtungsgesuch / Klage / Einrede (Art. 135 Ziff. 2 / 138 Abs. 1 OR)',
};

// ─── Berechnungskern ────────────────────────────────────────────────────────

// Art. 132: Beginntag nicht mitrechnen; Jahresfrist endet am zahlengleichen Tag
// (fehlt der Tag, am Monatsletzten — addYears bildet 29.02. → 28.02. ab).
function rohesEnde(start: Date, jahre: number): Date {
  return addYears(start, jahre);
}

// Stillstandsperioden normalisieren: ungültige/invertierte Einträge verwerfen,
// überlappende oder anstossende Perioden zur Union verschmelzen — sonst würden
// sich überschneidende Eingaben doppelt gezählt und die Frist zu lang.
type HemmIntervall = { von: Date; bis: Date };
function normalisiereStillstaende(stillstaende: Stillstand[]): { intervalle: HemmIntervall[]; verworfen: number } {
  const gueltig = stillstaende
    .map((s) => ({ von: parseISO(s.von), bis: parseISO(s.bis) }))
    .filter((s) => !isNaN(s.von.getTime()) && !isNaN(s.bis.getTime()) && !isAfter(s.von, s.bis))
    .sort((a, b) => a.von.getTime() - b.von.getTime());
  const intervalle: HemmIntervall[] = [];
  for (const s of gueltig) {
    const letzte = intervalle[intervalle.length - 1];
    if (letzte && !isAfter(s.von, addDays(letzte.bis, 1))) {
      if (isAfter(s.bis, letzte.bis)) letzte.bis = s.bis; // überlappend/anstossend → verschmelzen
    } else {
      intervalle.push({ ...s });
    }
  }
  return { intervalle, verworfen: stillstaende.length - gueltig.length };
}

// Art. 134: Stillstands-Tage im Fenster (start, ende] zählen und hinten
// anhängen; iterativ, weil das verlängerte Fenster weitere Hemmung erfassen kann.
function mitStillstand(start: Date, ende0: Date, intervalle: HemmIntervall[]): { ende: Date; tage: number } {
  let ende = ende0;
  let gezaehlt = 0;
  for (let i = 0; i < 24; i++) {
    let tage = 0;
    for (const s of intervalle) {
      const a = isAfter(s.von, start) ? s.von : addDays(start, 1);
      const b = isBefore(s.bis, ende) ? s.bis : ende;
      const d = differenceInCalendarDays(b, a) + 1;
      if (d > 0) tage += d;
    }
    if (tage <= gezaehlt) break;
    ende = addDays(ende0, tage);
    gezaehlt = tage;
  }
  return { ende, tage: gezaehlt };
}

// Art. 78 (über Art. 132 Abs. 2): Sonntag/Feiertag am Erfüllungsort → nächster
// Werktag; der Samstag ist nach dem BG über den Fristenlauf an Samstagen gleichgestellt.
// Exportiert für Module mit derselben Fristend-Mechanik (z. B. Gewährleistung).
export function werktagsEnde(d: Date, kanton: Kanton): Date {
  let e = d;
  while (istArbeitsfreierTag(e, kanton)) e = addDays(e, 1);
  return e;
}

// ─── Hauptfunktion ──────────────────────────────────────────────────────────

export function berechneVerjaehrung(input: VerjaehrungInput): VerjaehrungErgebnis {
  const R = REGIME[input.regime];
  const rechenweg: Rechenschritt[] = [];
  const annahmen: string[] = [];
  const warnungen: string[] = [];
  const { intervalle: hemmungen, verworfen } = normalisiereStillstaende(input.stillstaende ?? []);
  if (verworfen > 0) {
    warnungen.push(
      `${verworfen} Stillstandsperiode${verworfen > 1 ? 'n' : ''} mit ungültigen Daten (z. B. Ende vor Beginn) bleibt unberücksichtigt.`,
    );
  }

  const beginn = parseISO(input.beginnRelativ);
  const stichtag = parseISO(input.stichtag);

  const basis = (): VerjaehrungErgebnis => ({
    ergebnis: '', status: 'ok', rechenweg, annahmen, warnungen, normverweise: [],
  });

  if (isNaN(beginn.getTime()) || isNaN(stichtag.getTime())) {
    return { ...basis(), ergebnis: 'Ungültige Eingabe: Beginn- und Stichtag prüfen.', status: 'unzulaessig' };
  }
  if (R.absolutJahre != null && !input.beginnAbsolut) {
    return {
      ...basis(),
      ergebnis: `Für dieses Regime ist zusätzlich der Beginn der absoluten Frist anzugeben (${R.absolutLabel}).`,
      status: 'unzulaessig',
    };
  }

  // Schritt 1 — Regime & Fristen
  rechenweg.push({
    beschreibung: 'Schritt 1 – Anspruchstyp und Fristdauer',
    zwischenergebnis: `${R.label}. ${R.absolutJahre != null
      ? `Relative Frist ${R.relativJahre} Jahre, absolute Frist ${R.absolutJahre} Jahre; massgeblich ist das frühere Ende.`
      : `Einheitliche Frist von ${R.relativJahre} Jahren.`}`,
    normen: R.normen,
  });

  // Schritt 2 — Fristbeginn
  const kenntnisRegime = ['delikt', 'delikt_person', 'vertrag_person', 'bereicherung'].includes(input.regime);
  rechenweg.push({
    beschreibung: 'Schritt 2 – Fristbeginn (dies a quo)',
    zwischenergebnis: `${R.beginnLabel}: ${fmt(beginn)}. Der Beginntag wird nicht mitgerechnet (Art. 132 Abs. 1 OR).${
      input.beginnAbsolut ? ` Absolute Frist ab ${R.absolutLabel}: ${fmt(parseISO(input.beginnAbsolut))}.` : ''}`,
    normen: kenntnisRegime ? [N_132] : [{ artikel: 'Art. 130 Abs. 1 OR' }, N_132],
    rechtsprechung: input.regime === 'bereicherung'
      ? [rechtsprechung('BGE_135_III_289')]
      : input.regime === 'delikt' || input.regime === 'delikt_person'
        ? [rechtsprechung('BGE_131_III_61'), rechtsprechung('BGE_111_II_55')]
        : input.regime === 'ordentlich'
          ? [rechtsprechung('BGE_137_III_16')]
          : undefined,
  });
  if (kenntnisRegime) {
    annahmen.push(
      'Der Kenntniszeitpunkt (tatsächliche Kenntnis, kein Kennenmüssen) ist eine Tatfrage und wird als Eingabe übernommen — das Ergebnis ist insoweit annahmegestützt.',
    );
  }

  // ── Relative / einheitliche Frist mit Unterbrechungs-Kette ──
  const unterbrechungen = [...(input.unterbrechungen ?? [])]
    .filter((u) => !isNaN(parseISO(u.datum).getTime()))
    .sort((a, b) => parseISO(a.datum).getTime() - parseISO(b.datum).getTime());

  let segStart = beginn;
  let segJahre = R.relativJahre;
  let offeneHemmungSeit: Date | null = null;

  for (const u of unterbrechungen) {
    const d = parseISO(u.datum);
    const aktuellesEnde = mitStillstand(segStart, rohesEnde(segStart, segJahre), hemmungen).ende;
    if (isAfter(d, aktuellesEnde)) {
      warnungen.push(
        `${TYP_LABEL[u.typ]} vom ${fmt(d)} liegt nach dem Verjährungseintritt (${fmt(aktuellesEnde)}) und bleibt wirkungslos — eine verjährte Forderung wird nicht wiederbelebt.`,
      );
      continue;
    }
    if (u.typ === 'klage_schlichtung') {
      // Plausibilität: Abschluss kann nicht vor der Unterbrechung liegen
      if (u.prozessEnde) {
        const pe = parseISO(u.prozessEnde);
        if (isNaN(pe.getTime()) || isBefore(pe, d)) {
          warnungen.push(
            `Abschlussdatum ${isNaN(pe.getTime()) ? '(ungültig)' : fmt(pe)} der Unterbrechung vom ${fmt(d)} liegt vor der Unterbrechung oder ist ungültig — der Eintrag bleibt unberücksichtigt.`,
          );
          continue;
        }
      }
      if (!u.prozessEnde) {
        offeneHemmungSeit = d;
        rechenweg.push({
          beschreibung: `Unterbrechung – ${TYP_LABEL.klage_schlichtung}`,
          zwischenergebnis: `Am ${fmt(d)} unterbrochen; der Rechtsstreit ist noch nicht abgeschlossen — die Verjährung beginnt erst mit dem Abschluss vor der befassten Instanz neu zu laufen (Ausschöpfung des Instanzenzugs).`,
          normen: [N_135, N_138_1],
          rechtsprechung: [rechtsprechung('BGE_147_III_419')],
        });
        break;
      }
      const ende = parseISO(u.prozessEnde);
      segStart = ende;
      segJahre = u.mitUrteil ? 10 : R.relativJahre;
      rechenweg.push({
        beschreibung: `Unterbrechung – ${TYP_LABEL.klage_schlichtung}`,
        zwischenergebnis: `Am ${fmt(d)} unterbrochen (Postaufgabe genügt); während des Verfahrens stand die Verjährung still. Mit Abschluss vor der befassten Instanz am ${fmt(ende)} beginnt eine neue Frist von ${segJahre} Jahren${u.mitUrteil ? ' (gerichtliche Feststellung, Art. 137 Abs. 2 OR)' : ''}.`,
        normen: u.mitUrteil ? [N_135, N_138_1, N_137_2] : [N_135, N_138_1, N_137_1],
        rechtsprechung: [rechtsprechung('BGE_147_III_419'), rechtsprechung('BGE_114_II_335')],
      });
    } else {
      segStart = d;
      segJahre = u.typ === 'urkunde_urteil' ? 10 : R.relativJahre;
      rechenweg.push({
        beschreibung: `Unterbrechung – ${TYP_LABEL[u.typ]}`,
        zwischenergebnis: `Am ${fmt(d)} unterbrochen; die Verjährung beginnt neu mit einer Frist von ${segJahre} Jahren${u.typ === 'urkunde_urteil' ? ' (stets 10 Jahre, Art. 137 Abs. 2 OR)' : ''}.`,
        normen: u.typ === 'urkunde_urteil' ? [N_135, N_137_2] : u.typ === 'betreibungsakt' ? [N_135, N_138_2, N_137_1] : [N_135, N_137_1],
      });
    }
  }

  // ── Fristende der laufenden (letzten) Frist inkl. Stillstand ──
  let relativEnde: Date | null = null;
  let gehemmtTage = 0;
  if (!offeneHemmungSeit) {
    const roh = rohesEnde(segStart, segJahre);
    const st = mitStillstand(segStart, roh, hemmungen);
    relativEnde = st.ende;
    gehemmtTage = st.tage;
    rechenweg.push({
      beschreibung: 'Fristende der laufenden Frist (Art. 132 OR)',
      zwischenergebnis: `${segJahre} Jahre ab ${fmt(segStart)} → Ende am zahlengleichen Tag: ${fmt(roh)}${
        st.tage > 0 ? `; zuzüglich ${st.tage} stillgestandene Tage (Art. 134 OR) → ${fmt(st.ende)}` : ''}.`,
      normen: st.tage > 0 ? [N_132, N_134] : [N_132],
    });
  }

  // ── Absolute Frist (parallel) ──
  let absolutEnde: Date | null = null;
  if (R.absolutJahre != null && input.beginnAbsolut) {
    const aStart = parseISO(input.beginnAbsolut);
    const roh = rohesEnde(aStart, R.absolutJahre);
    const st = mitStillstand(aStart, roh, hemmungen);
    absolutEnde = st.ende;
    rechenweg.push({
      beschreibung: 'Absolute Frist',
      zwischenergebnis: `${R.absolutJahre} Jahre ab ${R.absolutLabel} (${fmt(aStart)}) → ${fmt(st.ende)}${
        st.tage > 0 ? ` (inkl. ${st.tage} stillgestandene Tage)` : ''}. Sie läuft unabhängig von Kenntnis und Schadenseintritt.`,
      normen: R.normen,
      rechtsprechung: input.regime === 'delikt' || input.regime === 'delikt_person'
        ? [rechtsprechung('BGE_146_III_25')] : undefined,
    });
    if (unterbrechungen.length > 0 && relativEnde && isAfter(relativEnde, absolutEnde)) {
      annahmen.push(
        'Konservative Regel: Die durch Unterbrechung neu angesetzte Frist wird durch die absolute Frist begrenzt (für Art. 67 OR gesichert; nach gerichtlicher Feststellung ist die selbständige 10-Jahres-Frist nach Art. 137 Abs. 2 OR h.M. — das frühere Datum wird ausgewiesen).',
      );
    }
  }

  // ── Massgebliches Ende: frühere der beiden Fristen, werktagsverschoben ──
  let verjaehrung: Date | null = null;
  let massgeblicheFrist: 'relativ' | 'absolut' | undefined;
  if (offeneHemmungSeit) {
    verjaehrung = absolutEnde; // nur die absolute Frist kann noch ablaufen
    massgeblicheFrist = absolutEnde ? 'absolut' : undefined;
  } else if (relativEnde) {
    if (absolutEnde && isBefore(absolutEnde, relativEnde)) {
      verjaehrung = absolutEnde;
      massgeblicheFrist = 'absolut';
    } else {
      verjaehrung = relativEnde;
      massgeblicheFrist = 'relativ';
    }
  }

  // Expliziter Vergleichsschritt, sobald beide Fristen parallel laufen
  if (relativEnde && absolutEnde) {
    rechenweg.push({
      beschreibung: 'Massgebliches Fristende – relative vs. absolute Frist',
      zwischenergebnis: `Relative Frist endet am ${fmt(relativEnde)}, absolute Frist am ${fmt(absolutEnde)}. ` +
        `Massgeblich ist das frühere Ende — hier die ${massgeblicheFrist === 'absolut' ? 'absolute' : 'relative'} Frist (${fmt(verjaehrung!)}). ` +
        'Die relative Frist kann nie über die absolute hinauslaufen.',
      normen: R.normen,
    });
  } else if (offeneHemmungSeit && absolutEnde) {
    rechenweg.push({
      beschreibung: 'Massgebliches Fristende – nur absolute Frist bestimmbar',
      zwischenergebnis: `Die relative Frist steht prozessbedingt still (Art. 138 Abs. 1 OR); ` +
        `unabhängig davon läuft die absolute Frist und endet am ${fmt(absolutEnde)} — sie bleibt einstweilen massgeblich.`,
      normen: [...R.normen, N_138_1],
    });
  }

  let verschoben: Date | null = null;
  if (verjaehrung) {
    verschoben = werktagsEnde(verjaehrung, input.kanton);
    if (verschoben.getTime() !== verjaehrung.getTime()) {
      rechenweg.push({
        beschreibung: 'Werktagsregel (Art. 78 OR i.V.m. Art. 132 Abs. 2 OR)',
        zwischenergebnis: `Der letzte Tag (${fmt(verjaehrung)}) fällt auf einen Samstag, Sonntag oder anerkannten Feiertag (${input.kanton}) — die Frist läuft erst am nächsten Werktag ab: ${fmt(verschoben)}.`,
        normen: [N_78],
      });
    }
    annahmen.push(`Feiertagsverschiebung nach den im Kanton ${input.kanton} staatlich anerkannten Feiertagen (Erfüllungsort als Eingabe).`);
  }

  // ── Ergebnis am Stichtag ──
  const verjaehrt = verschoben ? isAfter(stichtag, verschoben) : false;
  rechenweg.push({
    beschreibung: 'Ergebnis am Stichtag (Art. 142 OR)',
    zwischenergebnis: verschoben
      ? verjaehrt
        ? `Am Stichtag ${fmt(stichtag)} ist die Forderung verjährt (letzter Tag: ${fmt(verschoben)}). Die Verjährung wird nur auf Einrede hin beachtet; die Forderung besteht als Naturalobligation weiter.`
        : `Am Stichtag ${fmt(stichtag)} ist die Forderung nicht verjährt; die Verjährung tritt mit unbenütztem Ablauf des ${fmt(verschoben)} ein.`
      : `Die Verjährung steht seit ${fmt(offeneHemmungSeit!)} prozessbedingt still (Art. 138 Abs. 1 OR); ein Fristende lässt sich erst nach Abschluss des Verfahrens bestimmen${absolutEnde ? '' : '.'}`,
    normen: [N_142],
  });

  // ── Verzicht (Art. 141) als Overlay ──
  let verzichtBis: Date | null = null;
  if (input.verzicht && verschoben) {
    const vd = parseISO(input.verzicht.datum);
    // NaN/negative Dauer → Default 10 Jahre; > 10 wird gekürzt (Art. 141 Abs. 1)
    const roh = input.verzicht.jahre;
    const jahre = Number.isFinite(roh) && roh! > 0 ? Math.min(roh!, 10) : 10;
    if (Number.isFinite(roh) && roh! > 10) {
      warnungen.push('Ein Einredeverzicht von mehr als 10 Jahren wird auf die Höchstdauer von 10 Jahren gekürzt (Art. 141 Abs. 1 OR).');
    }
    if (isBefore(vd, beginn)) {
      warnungen.push(`Verzicht vom ${fmt(vd)} liegt vor Beginn der Verjährung — ein Vorausverzicht ist nicht zulässig (Art. 141 Abs. 1 OR); der Verzicht bleibt unberücksichtigt.`);
    } else {
      verzichtBis = addYears(verschoben, jahre);
      rechenweg.push({
        beschreibung: 'Einredeverzicht (Art. 141 OR)',
        zwischenergebnis: `Schriftlicher Verzicht vom ${fmt(vd)}: Die Einrede kann bis ${fmt(verzichtBis)} nicht erhoben werden (höchstens 10 Jahre ab Verjährungseintritt; Kettenverzichte bleiben möglich).`,
        normen: [N_141],
        rechtsprechung: [rechtsprechung('BGE_132_III_226')],
      });
      annahmen.push('Schriftform des Verzichts (Art. 141 Abs. 1bis OR) wird als erfüllt unterstellt; in AGB kann nur der Verwender verzichten.');
    }
  }

  if (input.strafbareHandlung) {
    warnungen.push(
      'Strafbare Handlung (Art. 60 Abs. 2 OR): Der Anspruch verjährt frühestens mit Eintritt der strafrechtlichen Verfolgungsverjährung (Art. 97 StGB) — diese Längerfrist ist StGB-abhängig und hier nicht berechnet; das ausgewiesene Datum kann sich nach hinten verschieben.',
    );
  }
  if (isBefore(beginn, parseISO('2020-01-01'))) {
    warnungen.push(
      'Fristbeginn vor dem 1.1.2020: Für Altfälle gilt das Übergangsrecht (Art. 49 SchlT ZGB) — die Revision 2020 (u.a. relative Fristen 1 → 3 Jahre) ist hier nicht übergangsrechtlich abgebildet; Ergebnis prüfen.',
    );
  }

  const normverweise: Normverweis[] = [
    ...R.normen, N_132, N_78,
    ...(hemmungen.length ? [N_134] : []),
    ...(unterbrechungen.length ? [N_135, N_137_1] : []),
    ...(unterbrechungen.some((u) => u.typ === 'urkunde_urteil' || (u.typ === 'klage_schlichtung' && u.mitUrteil)) ? [N_137_2] : []),
    ...(unterbrechungen.some((u) => u.typ === 'klage_schlichtung') ? [N_138_1] : []),
    ...(unterbrechungen.some((u) => u.typ === 'betreibungsakt') ? [N_138_2] : []),
    ...(input.verzicht ? [N_141] : []),
    ...(input.strafbareHandlung ? [N_60_2] : []),
    N_142,
  ];

  // Bei Zwei-Fristen-Regimes die massgebliche Frist im Ergebnis benennen
  const fristZusatz = R.absolutJahre != null && massgeblicheFrist
    ? ` Massgeblich ist die ${massgeblicheFrist === 'absolut' ? `absolute Frist (${R.absolutJahre} Jahre ab ${R.absolutLabel})` : `relative Frist (${R.relativJahre} Jahre ab ${R.beginnLabel})`}.`
    : '';
  const ergebnisText = verschoben
    ? verjaehrt
      ? `Verjährt: Die Verjährung ist mit Ablauf des ${fmt(verschoben)} eingetreten (Stichtag ${fmt(stichtag)}).${fristZusatz} Sie ist als Einrede geltend zu machen (Art. 142 OR).`
      : `Nicht verjährt: Die Verjährung tritt mit unbenütztem Ablauf des ${fmt(verschoben)} ein.${fristZusatz}${verzichtBis ? ` Zufolge Einredeverzichts ist die Einrede bis ${fmt(verzichtBis)} ausgeschlossen.` : ''}`
    : `Die Verjährung steht prozessbedingt still (Art. 138 Abs. 1 OR)${absolutEnde ? `; spätestens massgeblich bleibt die absolute Frist per ${fmt(werktagsEnde(absolutEnde, input.kanton))}` : ''}.`;

  return {
    ergebnis: ergebnisText,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise,
    relativEndeISO: relativEnde ? iso(werktagsEnde(relativEnde, input.kanton)) : undefined,
    absolutEndeISO: absolutEnde ? iso(werktagsEnde(absolutEnde, input.kanton)) : undefined,
    verjaehrungISO: verschoben ? iso(verschoben) : undefined,
    massgeblicheFrist,
    verjaehrtAmStichtag: verjaehrt,
    verzichtBisISO: verzichtBis ? iso(verzichtBis) : undefined,
    gehemmtTage: gehemmtTage || undefined,
  };
}
