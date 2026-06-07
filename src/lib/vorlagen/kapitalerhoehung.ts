import type { VorlageSchema, Antworten, AssembleErgebnis } from './engine';
import { assemble } from './engine';
import { fmtCHF, fmtDatumLang, zahl } from './datum';
import type { GmbhStatutKlausel } from '../gruendungsunterlagen';

// ─── Kapitalerhöhung AG + GmbH (Plan 9c, Auftrag David 7.6.2026) ─────────────
//
// Wortlaut-Dossier: bibliothek/recherche/kapitalerhoehung-wortlaute.md
// (Norm-Extrakt OR 650–653v/781 @ 1.1.2026; ZH/SG-Mustersuiten verbatim).
//
// RECHTSSTAND (rev. 2023): Art. 651 (genehmigte Erhöhung), 652 Abs. 3
// (Zeichnungsschein-Befristung), 652a (Prospekt) und 653h sind AUFGEHOBEN.
// 6-Monats-VERFALL der Anmeldung: Art. 650 Abs. 3 bzw. Art. 781 Abs. 4 OR.
// Prüfungsbestätigung nur bei qualifizierter Erhöhung/Bezugsrechts-Entzug
// (Art. 652f Abs. 2 OR); der Kapitalerhöhungsbericht ist IMMER Beleg
// (Art. 46 Abs. 2 lit. d / Art. 74 Abs. 2 lit. d HRegV, EINE Unterschrift).
//
// §4: AG- und GmbH-Bausteine sind GETRENNT erfasst (eigene Norm-Ketten via
// Art. 781 Abs. 5 OR); geteilt sind nur Gates-Arithmetik und Aufbereitung.
// §8-Form-Gates: GV-/GsV-Beschluss und VR-/GF-Feststellungen mit Statuten-
// änderung sind öffentlich zu beurkunden (650 II / 652g II OR) → 'entwurf';
// Zeichnungsschein, Bericht und HR-Anmeldung → 'fertig'.
//
// ERSTAUSBAU (Dossier Teil 3): nur BAREINLAGE in CHF, Ausgabebetrag ≥
// Nennwert (Agio zulässig), Bezugsrecht weder eingeschränkt noch aufgehoben.
// Sacheinlage/Verrechnung/EK-Umwandlung/Bezugsrechts-Entzug/Fremdwährung
// sperren ehrlich (Stufe 2); Kapitalband/bedingtes Kapital = Backlog.

export type KeRechtsform = 'ag' | 'gmbh';
export type KeEinlageArt = 'bar' | 'sacheinlage' | 'verrechnung' | 'eigenkapital';
/** Hinweispflichtige Statuten-Kategorien (Art. 777a Abs. 2 Ziff. 1–5 OR):
 *  die Gründungs-Klauseln plus Konventionalstrafen (Ziff. 5 — in der
 *  Gründungs-Maske keine eigene Klausel-Weiche, hier aber wählbar). */
export type KeKlausel = GmbhStatutKlausel | 'konventionalstrafe';

export type KeZeichnerZeile = {
  name: string;
  angaben: string;            // «von …, in …» bzw. Sitz
  anzahl: string;             // gezeichnete neue Aktien/Stammanteile
  /** GmbH: bereits Gesellschafter/in → kein 777a-II-Hinweis nötig (781 III). */
  bereitsBeteiligt: boolean;
};

export type KeAntworten = {
  rechtsform: KeRechtsform;
  firma: string;
  sitz: string;
  kanton: string;
  einlageArt: KeEinlageArt;
  fremdwaehrung: boolean;
  bisherigesKapitalChf: string;
  bisherigeAnzahl: string;
  nennwertChf: string;
  anzahlNeue: string;
  ausgabebetragChf: string;   // je Stück, ≥ Nennwert (Agio zulässig)
  statutenArtikelNr: string;  // Artikel der Kapitalbestimmung in den Statuten
  gvDatum: string;            // ISO – Beschlussdatum (6-Monats-Verfall!)
  zeichner: KeZeichnerZeile[];
  /** Pflicht-Bestätigung: Bezugsrecht weder eingeschränkt noch aufgehoben
   *  (sonst Prüfungsbestätigungs-Pfad Art. 652f Abs. 1 OR – Stufe 2). */
  bezugsrechtGewahrt: boolean;
  bankInUrkundeGenannt: boolean;
  bankName: string;
  bankOrt: string;
  /** Usanz-Klausel der SG-Muster («Verbindlichkeit endet nach 3 Monaten») –
   *  Art. 652 Abs. 3 OR ist aufgehoben, daher rein vertraglich, optional. */
  befristungsKlausel: boolean;
  berichtUnterzeichner: string;  // 1 VR-/GF-Unterschrift (46/74 II lit. d HRegV)
  vorsitzName: string;           // VR-/GF-Urkunde
  /** GmbH: statutarische Klauseln für den 777a-II-Hinweis an NEUE Zeichner
   *  (inkl. Konventionalstrafen, Art. 777a Abs. 2 Ziff. 5 OR — Review N-2). */
  statutKlauseln: KeKlausel[];
  ort: string;
  datum: string;                 // ISO – Unterschriften der fertigen Dokumente
};

export const KE_DEFAULTS: KeAntworten = {
  rechtsform: 'ag', firma: '', sitz: '', kanton: 'ZH',
  einlageArt: 'bar', fremdwaehrung: false,
  bisherigesKapitalChf: "100'000", bisherigeAnzahl: '100',
  nennwertChf: "1'000", anzahlNeue: '50', ausgabebetragChf: "1'000",
  statutenArtikelNr: '3', gvDatum: '', zeichner: [],
  bezugsrechtGewahrt: true,
  bankInUrkundeGenannt: true, bankName: '', bankOrt: '',
  befristungsKlausel: true,
  berichtUnterzeichner: '', vorsitzName: '',
  statutKlauseln: [],
  ort: '', datum: '',
};

// ── Gates (geteilte Arithmetik, §2) ─────────────────────────────────────────

export type KeGates = { blocker: string[]; warnungen: string[] };

export function pruefeKeGates(a: KeAntworten): KeGates {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const ag = a.rechtsform === 'ag';
  const kapNorm = ag ? 'Art. 650 OR' : 'Art. 781 OR';

  if (a.einlageArt !== 'bar') {
    blocker.push(
      'Volldokumente sind zurzeit nur für die Erhöhung gegen BAREINLAGE verfügbar. Sacheinlage, ' +
      'Verrechnung und die Umwandlung von frei verwendbarem Eigenkapital verlangen zusätzliche ' +
      'Beschluss-Ziffern (Art. 650 Abs. 2 Ziff. 4–6 OR), Statutenangaben und die Prüfungsbestätigung ' +
      '(Art. 652f Abs. 1 OR; Art. 46 Abs. 3 HRegV) – bitte notariell begleiten lassen.',
    );
  }
  if (a.fremdwaehrung) {
    blocker.push('Volldokumente sind zurzeit nur für Kapital in CHF verfügbar.');
  }
  if (!a.bezugsrechtGewahrt) {
    blocker.push(
      'Einschränkung oder Aufhebung des Bezugsrechts: nur aus wichtigen Gründen zulässig (Art. 652b ' +
      'Abs. 2 OR), Beschluss-Ziffer nach Art. 650 Abs. 2 Ziff. 9 OR und Prüfungsbestätigung nötig ' +
      `(Art. 652f Abs. 1 OR; ${ag ? 'Art. 46 Abs. 4' : 'Art. 74 Abs. 4'} HRegV) – nicht im Erstausbau.`,
    );
  }

  const bisher = zahl(a.bisherigesKapitalChf);
  const bisherAnzahl = zahl(a.bisherigeAnzahl);
  const nennwert = zahl(a.nennwertChf);
  const neue = zahl(a.anzahlNeue);
  const ab = zahl(a.ausgabebetragChf);
  if (bisher === null || bisherAnzahl === null || nennwert === null || neue === null || ab === null) {
    blocker.push(`Bisheriges Kapital, Stückzahlen, Nennwert und Ausgabebetrag beziffern (${kapNorm}).`);
  } else {
    if (nennwert <= 0) blocker.push(`Der Nennwert muss grösser als null sein (${ag ? 'Art. 622 Abs. 4' : 'Art. 774 Abs. 1'} OR).`);
    if (neue <= 0 || !Number.isInteger(neue)) blocker.push('Anzahl neuer Stücke als ganze Zahl angeben.');
    if (bisherAnzahl <= 0 || !Number.isInteger(bisherAnzahl)) blocker.push('Bisherige Stückzahl als ganze Zahl angeben.');
    if (nennwert > 0 && bisherAnzahl > 0 && Math.abs(bisherAnzahl * nennwert - bisher) > 0.005) {
      blocker.push(
        `Rechnerische Unstimmigkeit: ${a.bisherigeAnzahl} × CHF ${fmtCHF(a.nennwertChf)} ergeben nicht das bisherige Kapital von CHF ${fmtCHF(a.bisherigesKapitalChf)}.`,
      );
    }
    if (ab < nennwert) {
      blocker.push(`Der Ausgabebetrag darf den Nennwert nicht unterschreiten (Unter-pari-Ausgabe unzulässig, ${ag ? 'Art. 624 Abs. 1 OR' : 'Art. 774 Abs. 2 OR'}).`);
    }
    // Review-Befund M-1 (7.6.2026): jede Einzel-Zeichnung als positive ganze
    // Zahl prüfen — sonst stünde im fertigen Schein «3.5 Namenaktien».
    for (const z of a.zeichner) {
      const za = zahl(z.anzahl);
      if (z.name.trim() && (za === null || za <= 0 || !Number.isInteger(za))) {
        blocker.push(`Gezeichnete Stückzahl von ${z.name.trim()} als positive ganze Zahl angeben (keine Bruchteile von ${ag ? 'Aktien' : 'Stammanteilen'}).`);
      }
    }
    const gezeichnet = a.zeichner.reduce((s, z) => s + (zahl(z.anzahl) ?? 0), 0);
    if (a.zeichner.length > 0 && neue > 0 && gezeichnet !== neue) {
      blocker.push(
        `Die Zeichnungen (${gezeichnet} Stück) müssen sämtliche ${a.anzahlNeue} neuen ${ag ? 'Aktien' : 'Stammanteile'} abdecken (Art. 652g Abs. 1 Ziff. 1 OR${ag ? '' : ' i. V. m. Art. 781 Abs. 5 Ziff. 5 OR'}).`,
      );
    }
  }

  if (a.zeichner.filter((z) => z.name.trim()).length === 0) {
    blocker.push('Mindestens eine Zeichnerin / einen Zeichner erfassen (Zeichnungsschein, Art. 652 OR).');
  }
  if (!a.gvDatum) {
    blocker.push(`Datum des Erhöhungsbeschlusses angeben – die Anmeldung muss innert SECHS MONATEN erfolgen, sonst fällt der Beschluss dahin (${ag ? 'Art. 650 Abs. 3' : 'Art. 781 Abs. 4'} OR).`);
  }
  if (a.bankInUrkundeGenannt && (!a.bankName.trim() || !a.bankOrt.trim())) {
    blocker.push(`Bank in der Urkunde nennen: Name und Ort angeben (sonst separate Bescheinigung, ${ag ? 'Art. 46 Abs. 2 lit. e' : 'Art. 74 Abs. 2 lit. e'} HRegV).`);
  }
  if (!a.berichtUnterzeichner.trim()) {
    blocker.push(`Unterzeichnende Person des Kapitalerhöhungsberichts angeben (${ag ? 'ein Mitglied des Verwaltungsrates, Art. 46 Abs. 2 lit. d' : 'eine Geschäftsführerin / ein Geschäftsführer, Art. 74 Abs. 2 lit. d'} HRegV).`);
  }
  if (!a.vorsitzName.trim()) {
    blocker.push(`${ag ? 'Vorsitz des Verwaltungsrates' : 'Vorsitz der Geschäftsführung'} für die Feststellungs-Urkunde angeben.`);
  }
  if (!a.statutenArtikelNr.trim()) {
    blocker.push('Artikel-Nummer der Kapitalbestimmung in den Statuten angeben (Statutenänderungs-Formel).');
  }
  if (!a.firma.trim()) blocker.push('Firma angeben.');
  if (!a.sitz.trim()) blocker.push('Sitz angeben.');

  if (!ag && a.zeichner.some((z) => z.name.trim() && !z.bereitsBeteiligt) && a.statutKlauseln.length === 0) {
    warnungen.push(
      'Neue Zeichner/innen, die noch nicht Gesellschafter sind: Prüfen Sie, ob die Statuten Nachschuss-/' +
      'Nebenleistungspflichten, Konkurrenzverbote, Vorhand-/Vorkaufs-/Kaufsrechte oder Konventionalstrafen ' +
      'enthalten – der Zeichnungsschein muss darauf hinweisen (Art. 777a Abs. 2 i. V. m. Art. 781 Abs. 3 OR).',
    );
  }

  return { blocker, warnungen };
}

// ── Aufbereitung ────────────────────────────────────────────────────────────

const KLAUSEL_HINWEIS_777A: Record<KeKlausel, string | null> = {
  nachschuss: 'Nachschusspflichten',
  nebenleistung: 'Nebenleistungspflichten',
  konkurrenzverbot: 'Konkurrenzverbote für die Gesellschafter',
  vorkaufsrecht: 'Vorhand-, Vorkaufs- und Kaufsrechte',
  konventionalstrafe: 'Konventionalstrafen',
  stimmrechtNachAnteilen: null,
  vetorecht: null,
};

function basisAntworten(a: KeAntworten): Antworten {
  const nennwert = zahl(a.nennwertChf) ?? 0;
  const neue = zahl(a.anzahlNeue) ?? 0;
  const ab = zahl(a.ausgabebetragChf) ?? 0;
  const bisher = zahl(a.bisherigesKapitalChf) ?? 0;
  const bisherAnzahl = zahl(a.bisherigeAnzahl) ?? 0;
  const erhoehung = neue * nennwert;
  const datum = a.datum ? a.datum.split('-').reverse().join('.') : '________';
  const neuZeichner = a.zeichner.some((z) => z.name.trim() && !z.bereitsBeteiligt);
  return {
    ...a,
    bisherFmt: fmtCHF(a.bisherigesKapitalChf),
    nennwertFmt: fmtCHF(a.nennwertChf),
    abFmt: fmtCHF(a.ausgabebetragChf),
    erhoehungFmt: fmtCHF(String(erhoehung)),
    neuFmt: fmtCHF(String(bisher + erhoehung)),
    einzahlungFmt: fmtCHF(String(neue * ab)),
    neueGesamtAnzahl: String(bisherAnzahl + neue),
    gvDatumLang: a.gvDatum ? fmtDatumLang(a.gvDatum) : '________',
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}den ${datum}`,
    klauselHinweisListe: a.statutKlauseln
      .map((k) => KLAUSEL_HINWEIS_777A[k])
      .filter((x): x is string => x !== null)
      .map((label) => ({ label })),
    // Review-Befund N-1 (7.6.2026): an die GEFILTERTE Liste koppeln — sonst
    // erschiene der Hinweis-Header ohne Zeilen, wenn nur Klauseln ohne
    // 777a-II-Hinweispflicht gewählt sind.
    zeigeHinweis777a: a.rechtsform === 'gmbh' && neuZeichner
      && a.statutKlauseln.some((k) => KLAUSEL_HINWEIS_777A[k] !== null),
  };
}

// ── Schema-Fabrik (fachneutral; materielle Texte/Normen je Rechtsform) ──────

type KeTexte = {
  organGv: string;          // Generalversammlung | Gesellschafterversammlung
  organLeitung: string;     // Verwaltungsrat | Geschäftsführung
  stueckPlural: string;     // Namenaktien | Stammanteile
  stueckEinzeln: string;    // Aktie | Stammanteil
  kapital: string;          // Aktienkapital | Stammkapital
  normBeschluss: string;
  normVerfall: string;
  normZeichnung: string;
  normBericht: string;
  normFeststellung: string;
  normBelege: string;       // HRegV-Belegliste
};

const TEXTE: Record<KeRechtsform, KeTexte> = {
  ag: {
    organGv: 'Generalversammlung', organLeitung: 'Verwaltungsrat',
    stueckPlural: 'Namenaktien', stueckEinzeln: 'Aktie', kapital: 'Aktienkapital',
    normBeschluss: 'Art. 650 Abs. 2 OR',
    normVerfall: 'Art. 650 Abs. 3 OR',
    normZeichnung: 'Art. 652 OR',
    normBericht: 'Art. 652e OR',
    normFeststellung: 'Art. 652g OR',
    normBelege: 'Art. 46 HRegV',
  },
  gmbh: {
    organGv: 'Gesellschafterversammlung', organLeitung: 'Geschäftsführung',
    stueckPlural: 'Stammanteile', stueckEinzeln: 'Stammanteil', kapital: 'Stammkapital',
    normBeschluss: 'Art. 781 Abs. 5 Ziff. 1 OR',
    normVerfall: 'Art. 781 Abs. 4 OR',
    normZeichnung: 'Art. 781 Abs. 3 OR',
    normBericht: 'Art. 781 Abs. 5 Ziff. 4 OR',
    normFeststellung: 'Art. 781 Abs. 5 Ziff. 5 OR',
    normBelege: 'Art. 74 HRegV',
  },
};

const ENTWURF_DISCLAIMER = (was: string, norm: string) =>
  `Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung: ${was} bedarf der ` +
  `öffentlichen Beurkundung (${norm}); die Urkunde entsteht bei der Urkundsperson. Gliederung und ` +
  'Wortlaute nach den amtlichen Vorlagen ZH/SG (Stand 2023/2024), verifiziert am OR-Stand 1.1.2026.';

function gvSchema(r: KeRechtsform): VorlageSchema {
  const t = TEXTE[r];
  return {
    id: `ke-${r}-gv-beschluss`,
    version: '1.0.0 (Rechtsstand OR 1.1.2026; KE-Dossier 7.6.2026)',
    titel: `Beschluss der ${t.organGv} über die Kapitalerhöhung`,
    format: 'verfuegung',
    ausgabeArt: 'entwurf',
    disclaimer: ENTWURF_DISCLAIMER(`Der Erhöhungsbeschluss der ${t.organGv}`, r === 'ag' ? 'Art. 650 Abs. 2 OR' : 'Art. 650 Abs. 2 i. V. m. Art. 781 Abs. 5 Ziff. 1 OR'),
    bausteine: [
      {
        id: 'KG01_ingress',
        text:
          `der {{firma}} mit Sitz in {{sitz}}\n\nSämtliche ${r === 'ag' ? 'Aktionärinnen und Aktionäre' : 'Gesellschafterinnen und Gesellschafter'} ` +
          `sind anwesend oder vertreten (Universalversammlung${r === 'ag' ? ', Art. 701 OR' : ', Art. 805 Abs. 3 und Abs. 5 Ziff. 5 i. V. m. Art. 701 OR'}). ` +
          `Die Versammlung beschliesst:`,
        // Review-Befund M-3 (7.6.2026): Abs. 3 mitzitieren (Vorbehalt der
        // Universalversammlung) — wie das ZH-Muster.
        begruendung: 'Universalversammlungs-Ingress (ZH-/SG-Vorlagen; Erstausbau ohne Einberufungs-Variante).',
        norm: r === 'ag' ? 'Art. 701 OR' : 'Art. 805 OR',
      },
      {
        id: 'KG02_beschluss',
        ueberschrift: 'Erhöhungsbeschluss',
        text:
          `Das ${t.kapital} der Gesellschaft von bisher CHF {{bisherFmt}} wird um CHF {{erhoehungFmt}} ` +
          `auf neu CHF {{neuFmt}} erhöht, durch Ausgabe von {{anzahlNeue}} ${t.stueckPlural} zu je ` +
          `CHF {{nennwertFmt}} (Nennwert). Der Ausgabebetrag beträgt CHF {{abFmt}} je ${t.stueckEinzeln}; ` +
          `die Einlagen sind vollständig in Geld zu leisten. Die neuen ${t.stueckPlural} sind ab der ` +
          `Eintragung der Kapitalerhöhung in das Handelsregister dividendenberechtigt.`,
        norm: t.normBeschluss,
        begruendung: `Pflichtinhalt des Erhöhungsbeschlusses (Nennbetrag · Anzahl/Nennwert/Art · Ausgabebetrag · Dividendenberechtigung, Art. 650 Abs. 2 Ziff. 1–3 OR${r === 'gmbh' ? ' i. V. m. Art. 781 Abs. 5 Ziff. 1 OR' : ''}).`,
      },
      {
        id: 'KG03_bezugsrecht',
        text:
          `Das Bezugsrecht der bisherigen ${r === 'ag' ? 'Aktionärinnen und Aktionäre' : 'Gesellschafterinnen und Gesellschafter'} ` +
          'wird weder eingeschränkt noch aufgehoben.',
        norm: r === 'ag' ? 'Art. 652b OR' : 'Art. 652b i. V. m. Art. 781 Abs. 5 Ziff. 2 OR',
        begruendung: 'Bezugsrechts-Klarstellung – Erstausbau nur mit gewahrtem Bezugsrecht (sonst Prüfungspflicht, Art. 652f Abs. 1 OR).',
      },
      {
        id: 'KG04_verfall',
        text:
          `Diese Erhöhung des ${t.kapital}s ist ${r === 'ag' ? 'vom Verwaltungsrat' : 'von der Geschäftsführung'} ` +
          'innerhalb von sechs Monaten durchzuführen. Wird die Kapitalerhöhung nicht innerhalb dieser ' +
          'Frist beim Handelsregisteramt zur Eintragung angemeldet, so fällt der heutige Beschluss dahin.',
        norm: t.normVerfall,
        begruendung: 'Sechs-Monats-Verfall – wörtlich nach der ZH-Vorlage.',
      },
      {
        id: 'KG05_beurkundung',
        rolle: 'unterschrift',
        text: '{{ortDatumZeile}}\n\nDie Urkundsperson:\n\n_________________________________',
        begruendung: 'Beurkundungsvermerk – wird von der Urkundsperson nach kantonalem Beurkundungsrecht ergänzt.',
      },
    ],
  };
}

function zeichnungsscheinSchema(r: KeRechtsform): VorlageSchema {
  const t = TEXTE[r];
  return {
    id: `ke-${r}-zeichnungsschein`,
    version: '1.0.0 (ZH-Vorlage verbatim; KE-Dossier 7.6.2026)',
    titel: 'Zeichnungsschein',
    format: 'vertrag',
    ausgabeArt: 'fertig',
    disclaimer:
      'Erstellt mit LexMetrik – keine Rechtsberatung. Zeichnung in besonderer Urkunde nach den für die ' +
      `Gründung geltenden Regeln (${t.normZeichnung}); im Original als Beleg der Feststellungs-Urkunde.`,
    bausteine: [
      {
        id: 'KZ01_text',
        text:
          `Unter Bezugnahme auf den Beschluss der ${t.organGv} der {{firma}}, mit Sitz in {{sitz}}, vom ` +
          `{{gvDatumLang}} über die Erhöhung des ${t.kapital}s von CHF {{bisherFmt}} auf CHF {{neuFmt}} ` +
          `durch Ausgabe von {{anzahlNeue}} ${t.stueckPlural} mit einem Nennwert von je CHF {{nennwertFmt}} ` +
          `sowie auf den entsprechenden Beschluss ${r === 'ag' ? 'des Verwaltungsrates' : 'der Geschäftsführung'} ` +
          `zeichne ich hiermit\n\n{{persAnzahl}} ${t.stueckPlural} zu CHF {{nennwertFmt}}\n\n` +
          `zum Ausgabebetrag von CHF {{abFmt}} je ${t.stueckEinzeln} und verpflichte mich bedingungslos ` +
          `zur Leistung von insgesamt CHF {{persEinzahlung}}. Diese Zeichnung erfolgt unter Bezugnahme ` +
          'auf die mir bekannten Statuten der Gesellschaft.',
        norm: t.normZeichnung,
        // Review-Befunde M-1/M-2 (7.6.2026): Quellen präzis — ZH/SG-Synthese.
        begruendung: 'Zeichnungs-Kern nach der amtlichen ZH-Vorlage; die Bezugnahme auf den Leitungs-Beschluss nach dem SG-Muster (Art. 652 Abs. 2 OR verlangt die Bezugnahme auf beide Beschlüsse; gemeint ist der Durchführungs-Beschluss des Leitungsorgans — im Erstausbau setzt das beschliessende Organ den Ausgabebetrag selbst fest).',
      },
      {
        id: 'KZ02_hinweis_777a',
        text: 'Gemäss Statuten bestehen folgende Bestimmungen, auf die hiermit im Sinne von Art. 777a Abs. 2 OR hingewiesen wird:',
        includeIf: { feld: 'zeigeHinweis777a', eq: true },
        norm: 'Art. 777a Abs. 2 OR',
        begruendung: 'Hinweispflicht für Zeichner, die noch nicht Gesellschafter sind (Art. 781 Abs. 3 OR – für bisherige Gesellschafter entbehrlich).',
      },
      {
        id: 'KZ02b_hinweisliste',
        text: '– {{item.label}}',
        includeIf: { feld: 'zeigeHinweis777a', eq: true },
        wiederholeUeber: 'klauselHinweisListe',
        begruendung: 'Je hinweispflichtige statutarische Bestimmung eine Zeile.',
        norm: 'Art. 777a Abs. 2 OR',
      },
      {
        id: 'KZ03_befristung',
        text: 'Die Verbindlichkeit dieser Zeichnung endet nach Ablauf von drei Monaten seit ihrer Ausstellung.',
        includeIf: { feld: 'befristungsKlausel', eq: true },
        begruendung: 'Optionale Befristungs-Klausel nach dem SG-Muster – vertragliche USANZ; Art. 652 Abs. 3 OR ist seit 1.1.2023 aufgehoben (kein Gesetzesinhalt).',
        hinweis: 'Rein vertragliche Schutzklausel der zeichnenden Person; ohne sie gilt die Zeichnung unbefristet.',
      },
      {
        id: 'KZ04_unterschrift',
        rolle: 'unterschrift',
        text: '{{ortDatumZeile}}\n\n_________________________________\n{{persName}}',
        begruendung: 'Unterschrift der zeichnenden Person.',
      },
    ],
  };
}

function berichtSchema(r: KeRechtsform): VorlageSchema {
  const t = TEXTE[r];
  return {
    id: `ke-${r}-bericht`,
    version: '1.0.0 (ZH-/SG-Vorlagen; KE-Dossier 7.6.2026)',
    titel: 'Kapitalerhöhungsbericht',
    format: 'vertrag',
    ausgabeArt: 'fertig',
    disclaimer:
      'Erstellt mit LexMetrik – keine Rechtsberatung. Pflichtbeleg der Anmeldung, von ' +
      `${r === 'ag' ? 'einem Mitglied des Verwaltungsrates' : 'einer Geschäftsführerin / einem Geschäftsführer'} ` +
      `unterzeichnet (${r === 'ag' ? 'Art. 46 Abs. 2 lit. d' : 'Art. 74 Abs. 2 lit. d'} HRegV). Bei reiner ` +
      'Bareinlage ohne Bezugsrechts-Eingriff ist KEINE Prüfungsbestätigung erforderlich (Art. 652f Abs. 2 OR).',
    bausteine: [
      {
        id: 'KB01_ingress',
        text:
          `${r === 'ag' ? 'Der Verwaltungsrat' : 'Die Geschäftsführung'} der {{firma}}, mit Sitz in {{sitz}}, ` +
          `erstattet im Sinne von ${r === 'ag' ? 'Art. 652e OR' : 'Art. 781 Abs. 5 Ziff. 4 OR i. V. m. Art. 652e OR'} ` +
          `zur Erhöhung des ${t.kapital}s von CHF {{bisherFmt}} auf neu CHF {{neuFmt}} folgenden Bericht:`,
        norm: t.normBericht,
        begruendung: 'Berichts-Ingress nach den ZH-/SG-Vorlagen (GmbH-Normkette verbatim nach SG).',
      },
      {
        id: 'KB02_beschluss',
        text: `Der Beschluss der ${t.organGv} vom {{gvDatumLang}} wurde eingehalten.`,
        nummeriert: true,
        norm: 'Art. 652e Ziff. 4 OR',
        begruendung: 'Rechenschaft über die Einhaltung des Erhöhungsbeschlusses.',
      },
      {
        id: 'KB03_einlagen',
        text:
          `Die neuen ${t.stueckPlural} wurden vollständig durch Bareinzahlung liberiert. Der gesamte ` +
          'Ausgabebetrag von CHF {{einzahlungFmt}} wurde bei einer Bank nach Art. 1 Abs. 1 des ' +
          'Bundesgesetzes über die Banken und Sparkassen vom 8. November 1934 zur ausschliesslichen ' +
          'Verfügung der Gesellschaft hinterlegt.',
        nummeriert: true,
        norm: 'Art. 652c OR',
        begruendung: 'Bareinlage-Rechenschaft – wörtlich nach dem SG-Bericht (Ziff. 2).',
      },
      {
        id: 'KB04_bezugsrecht',
        text:
          'Das Bezugsrecht wurde weder eingeschränkt noch aufgehoben; sämtliche Bezugsrechte wurden ' +
          'ausgeübt oder die nicht ausgeübten Bezugsrechte wurden im Einverständnis der Berechtigten zugewiesen.',
        nummeriert: true,
        norm: 'Art. 652e Ziff. 4 OR',
        begruendung: 'Bezugsrechts-Rechenschaft (ZH-Vorlage).',
      },
      {
        id: 'KB05_keine_qualifizierten',
        text:
          'Es bestehen keine Sacheinlagen, keine Verrechnungstatbestände, keine Umwandlung von frei ' +
          'verwendbarem Eigenkapital und keine besonderen Vorteile.',
        nummeriert: true,
        norm: 'Art. 652e Ziff. 1–3 und 5 OR',
        begruendung: 'Negativ-Rechenschaft zu den qualifizierten Tatbeständen (Erstausbau: reine Bareinlage).',
      },
      {
        id: 'KB06_unterschrift',
        rolle: 'unterschrift',
        text: `{{ortDatumZeile}}\n\nFür ${r === 'ag' ? 'den Verwaltungsrat' : 'die Geschäftsführung'}:\n\n_________________________________\n{{berichtUnterzeichner}}`,
        norm: r === 'ag' ? 'Art. 46 Abs. 2 lit. d HRegV' : 'Art. 74 Abs. 2 lit. d HRegV',
        begruendung: 'Eine Unterschrift genügt (HRegV-Belegliste).',
      },
    ],
  };
}

function feststellungSchema(r: KeRechtsform): VorlageSchema {
  const t = TEXTE[r];
  return {
    id: `ke-${r}-feststellungen`,
    version: '1.0.0 (Rechtsstand OR 1.1.2026; KE-Dossier 7.6.2026)',
    titel: `Beschluss ${r === 'ag' ? 'des Verwaltungsrates' : 'der Geschäftsführung'}: Statutenänderung und Feststellungen`,
    format: 'verfuegung',
    ausgabeArt: 'entwurf',
    disclaimer: ENTWURF_DISCLAIMER('Der Beschluss über die Statutenänderung samt Feststellungen', r === 'ag' ? 'Art. 652g Abs. 2 OR' : 'Art. 652g Abs. 2 i. V. m. Art. 781 Abs. 5 Ziff. 5 OR'),
    bausteine: [
      {
        id: 'KF01_ingress',
        text:
          `der {{firma}} mit Sitz in {{sitz}}\n\n${r === 'ag' ? 'Der Verwaltungsrat' : 'Die Geschäftsführung'}, ` +
          'unter dem Vorsitz von {{vorsitzName}}, nimmt Bezug auf den Erhöhungsbeschluss der ' +
          `${t.organGv} vom {{gvDatumLang}} und beschliesst:`,
        begruendung: 'Urkunden-Ingress (ZH-/SG-Vorlagen).',
        norm: t.normFeststellung,
      },
      {
        id: 'KF02_belege',
        ueberschrift: 'I. Belege',
        text: `${r === 'ag' ? 'Dem Verwaltungsrat' : 'Der Geschäftsführung'} liegen vor:`,
        norm: 'Art. 652g Abs. 1 Ziff. 5 OR',
        begruendung: 'Beleg-Nennung – die Liste folgt aus der Erhöhungs-Konstellation.',
      },
      {
        id: 'KF02b_belegliste',
        text: '– {{item.titel}}',
        wiederholeUeber: 'belegeListe',
        begruendung: 'Je Beleg eine Zeile (Urkundsperson nennt sie einzeln, Art. 652g Abs. 2 OR).',
        norm: 'Art. 652g Abs. 2 OR',
      },
      {
        id: 'KF03_feststellungen',
        ueberschrift: 'II. Feststellungen',
        text:
          `${r === 'ag' ? 'Der Verwaltungsrat' : 'Die Geschäftsführung'} stellt fest, dass:\n` +
          `– sämtliche neu ausgegebenen ${t.stueckPlural} gültig gezeichnet sind;\n` +
          '– die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen;\n' +
          `– die Anforderungen des Gesetzes, der Statuten und des Beschlusses der ${t.organGv} an die Leistung der Einlagen im Zeitpunkt der Feststellungen erfüllt sind;\n` +
          '– keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten;\n' +
          '– die Belege, die der Kapitalerhöhung zugrunde liegen, vorgelegen haben.',
        norm: r === 'ag' ? 'Art. 652g Abs. 1 OR' : 'Art. 652g Abs. 1 i. V. m. Art. 781 Abs. 5 Ziff. 5 OR',
        begruendung: 'Die fünf gesetzlichen Feststellungen – Wortlaut der Norm folgend (ZH-Urkunde identisch).',
      },
      {
        id: 'KF04_statutenaenderung',
        ueberschrift: 'III. Statutenänderung',
        text:
          'Art. {{statutenArtikelNr}} der Statuten erhält folgende Fassung:\n' +
          `«Das ${t.kapital} beträgt CHF {{neuFmt}}. Es ist eingeteilt in {{neueGesamtAnzahl}} ` +
          `${t.stueckPlural} zu CHF {{nennwertFmt}}.${r === 'ag' ? ' Die Aktien sind vollständig liberiert.' : ''}»\n` +
          'Im Übrigen gelten die bisherigen Statutenbestimmungen unverändert weiter.',
        norm: r === 'ag' ? 'Art. 652g Abs. 1 OR' : 'Art. 652g Abs. 1 i. V. m. Art. 781 Abs. 5 Ziff. 5 OR',
        begruendung: 'Statutenänderungs-Formel – wörtlich nach den ZH-/SG-Vorlagen («Im Übrigen gelten …»).',
      },
      {
        id: 'KF05_urkundsperson',
        rolle: 'unterschrift',
        text:
          '{{ortDatumZeile}}\n\nDie Urkundsperson bestätigt im Sinne von Art. 652g Abs. 2 OR, dass ihr die in dieser ' +
          'Urkunde einzeln genannten Belege vorgelegen haben.\n\n_________________________________',
        norm: 'Art. 652g Abs. 2 OR',
        begruendung: 'Urkundsperson-Bestätigung – verbatim nach der ZH-VR-Urkunde (Ziff. VI).',
      },
    ],
  };
}

function anmeldungSchema(r: KeRechtsform): VorlageSchema {
  const t = TEXTE[r];
  return {
    id: `ke-${r}-hr-anmeldung`,
    version: '1.0.0 (KE-Dossier 7.6.2026)',
    titel: 'Anmeldung an das Handelsregisteramt',
    format: 'eingabe',
    ausgabeArt: 'fertig',
    disclaimer:
      'Erstellt mit LexMetrik – keine Rechtsberatung. Anmeldung innert SECHS MONATEN nach dem ' +
      `Erhöhungsbeschluss, sonst fällt er dahin (${t.normVerfall}). Unterschriften nach Art. 18 HRegV; ` +
      'Belege im Original oder in beglaubigter Kopie (Art. 20 HRegV). Es besteht kein amtliches ' +
      'Spezialformular für die Kapitalerhöhung (ZH: allgemeines Änderungs-Formular).',
    bausteine: [
      { id: 'KA01_absender', rolle: 'absender', text: '{{firma}}\n{{sitz}}', begruendung: 'Absenderin ist die Gesellschaft.' },
      { id: 'KA02_adressat', rolle: 'adressat', text: 'Handelsregisteramt des Kantons {{kanton}}', begruendung: 'Zuständig ist das Handelsregisteramt am Sitz.', norm: 'Art. 16 HRegV' },
      { id: 'KA03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
      {
        id: 'KA04_betreff', rolle: 'betreff',
        text: `Anmeldung: ordentliche Erhöhung des ${t.kapital}s der {{firma}}`,
        begruendung: 'Betreff mit Identifikation der Rechtseinheit (Art. 16 Abs. 1 HRegV).',
        norm: 'Art. 16 Abs. 1 HRegV',
      },
      {
        id: 'KA05_text',
        text:
          `Zur Eintragung in das Handelsregister wird angemeldet: die Erhöhung des ${t.kapital}s der ` +
          '{{firma}}, mit Sitz in {{sitz}}, von CHF {{bisherFmt}} um CHF {{erhoehungFmt}} auf neu ' +
          `CHF {{neuFmt}} (Beschluss der ${t.organGv} vom {{gvDatumLang}}). Die einzutragenden ` +
          'Tatsachen ergeben sich aus den beigelegten Belegen.',
        norm: t.normBelege,
        begruendung: 'Anmeldungs-Kern mit Beleg-Verweis (Art. 16 Abs. 1 HRegV).',
      },
      {
        id: 'KA06_beilagen',
        ueberschrift: 'Beilagen',
        text: '– {{item.titel}}',
        wiederholeUeber: 'belegeAnmeldung',
        begruendung: `Belegliste nach ${t.normBelege} (Bar-Normalfall: ohne Prüfungsbestätigung, Art. 652f Abs. 2 OR).`,
        norm: t.normBelege,
      },
      {
        id: 'KA07_unterschrift', rolle: 'unterschrift',
        text: '_________________________________\n{{vorsitzName}}',
        begruendung: 'Unterschrift nach Art. 18 Abs. 2 HRegV (beglaubigt, sofern nicht hinterlegt, Art. 21 HRegV).',
        norm: 'Art. 18 HRegV',
      },
    ],
  };
}

// ── Dokumentmappe ───────────────────────────────────────────────────────────

export type KeDokument = {
  id: string;
  titel: string;
  dateiName: string;
  ergebnis: AssembleErgebnis;
};

export function keDokumentmappe(a: KeAntworten): { dokumente: KeDokument[]; gates: KeGates } {
  const gates = pruefeKeGates(a);
  if (gates.blocker.length > 0) return { dokumente: [], gates };

  const t = TEXTE[a.rechtsform];
  const basis = basisAntworten(a);

  // Belege der Feststellungs-Urkunde (Art. 652g Abs. 2 OR, Bar-Normalfall)
  const belegeListe: { titel: string }[] = [
    { titel: `die öffentliche Urkunde über den Erhöhungsbeschluss der ${t.organGv} vom ${basis.gvDatumLang as string}` },
    { titel: 'die Zeichnungsscheine' },
    { titel: 'der Kapitalerhöhungsbericht' },
  ];
  if (a.bankInUrkundeGenannt) {
    belegeListe.push({ titel: `die Hinterlegung der Einlagen bei der ${a.bankName.trim()}, ${a.bankOrt.trim()} (in dieser Urkunde genannt)` });
  } else {
    belegeListe.push({ titel: 'die Bescheinigung der Bank über die Hinterlegung der Einlagen' });
  }

  // Beilagen der HR-Anmeldung (46 II / 74 II HRegV lit. a–e)
  const belegeAnmeldung: { titel: string }[] = [
    { titel: `Öffentliche Urkunde über den Beschluss der ${t.organGv} (lit. a)` },
    { titel: `Öffentliche Urkunde über den Beschluss ${a.rechtsform === 'ag' ? 'des Verwaltungsrates' : 'der Geschäftsführung'} (lit. b)` },
    { titel: 'Angepasste Statuten, vollständige Fassung (lit. c; Art. 22 Abs. 3 HRegV)' },
    { titel: 'Kapitalerhöhungsbericht, unterzeichnet (lit. d)' },
  ];
  if (!a.bankInUrkundeGenannt) {
    belegeAnmeldung.push({ titel: 'Bankbescheinigung über die Hinterlegung der Einlagen (lit. e)' });
  }

  const dokumente: KeDokument[] = [];

  dokumente.push({
    id: 'gv-beschluss',
    titel: `${t.organGv}s-Beschluss (Entwurf)`,
    dateiName: `kapitalerhoehung-${a.rechtsform}-gv-beschluss-entwurf`,
    ergebnis: assemble(gvSchema(a.rechtsform), basis),
  });

  a.zeichner.filter((z) => z.name.trim()).forEach((z, i) => {
    dokumente.push({
      id: `zeichnungsschein-${i}`,
      titel: `Zeichnungsschein – ${z.name.trim()}`,
      dateiName: `kapitalerhoehung-${a.rechtsform}-zeichnungsschein`,
      ergebnis: assemble(zeichnungsscheinSchema(a.rechtsform), {
        ...basis,
        persName: z.name.trim(),
        persAnzahl: z.anzahl,
        persEinzahlung: fmtCHF(String((zahl(z.anzahl) ?? 0) * (zahl(a.ausgabebetragChf) ?? 0))),
        // 777a-Hinweis nur für Zeichner, die noch nicht Gesellschafter sind
        zeigeHinweis777a: (basis.zeigeHinweis777a as boolean) && !z.bereitsBeteiligt,
      }),
    });
  });

  dokumente.push({
    id: 'bericht',
    titel: 'Kapitalerhöhungsbericht',
    dateiName: `kapitalerhoehung-${a.rechtsform}-bericht`,
    ergebnis: assemble(berichtSchema(a.rechtsform), basis),
  });

  dokumente.push({
    id: 'feststellungen',
    titel: `${a.rechtsform === 'ag' ? 'VR' : 'GF'}-Urkunde: Statutenänderung + Feststellungen (Entwurf)`,
    dateiName: `kapitalerhoehung-${a.rechtsform}-feststellungen-entwurf`,
    ergebnis: assemble(feststellungSchema(a.rechtsform), { ...basis, belegeListe }),
  });

  dokumente.push({
    id: 'hr-anmeldung',
    titel: 'Handelsregister-Anmeldung',
    dateiName: `kapitalerhoehung-${a.rechtsform}-hr-anmeldung`,
    ergebnis: assemble(anmeldungSchema(a.rechtsform), { ...basis, belegeAnmeldung }),
  });

  return { dokumente, gates };
}
