// Dossier: bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md
import type { VorlageSchema, Antworten, Baustein } from './engine';
import { assemble } from './engine';
import { fmtDatum } from './datum';
import { istGueltigesISO } from '../datumsUtils';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgDatumzeile, kdgUnterschrift,
} from './kuendigungGemeinsam';

// ─── Fristerstreckungsgesuch (Art. 144 ZPO) ─────────────────────────────────
//
// P1-Vorlage der Wettbewerbsanalyse 12.6.2026 (FAHRPLAN-VORLAGEN-AUSBAU V2).
// Wortlaute am Filestore-Cache verifiziert (13.6.2026, ZPO-Konsolidierung
// 20250101): Art. 144 Abs. 1 («Gesetzliche Fristen können nicht erstreckt
// werden»), Abs. 2 («Gerichtliche Fristen können aus zureichenden Gründen
// erstreckt werden, wenn das Gericht vor Fristablauf darum ersucht wird»),
// Art. 143 Abs. 1 (Einhaltung: Einreichung/Übergabe an die Schweizerische
// Post spätestens am letzten Tag), Art. 148 Abs. 1/2 (Wiederherstellung
// bei Säumnis: Gesuch innert zehn Tagen seit Wegfall des Säumnisgrundes).
//
// Fachliche Festlegungen:
// - NUR GERICHTLICHE Fristen sind erstreckbar (Art. 144 Abs. 1 ZPO) — die
//   Frist-Art ist darum PFLICHT-Weiche: «gesetzlich» blockiert den Export
//   und verweist auf die Wiederherstellung (Art. 148 ZPO) als Ausweg bei
//   bereits eingetretener Säumnis.
// - Das Gesuch muss VOR Fristablauf gestellt werden (Abs. 2): Gesuchsdatum
//   nach dem Fristende → Blocker; am letzten Tag → Warnung mit dem
//   Einhaltungs-Hinweis nach Art. 143 Abs. 1 ZPO.
// - Ob die Gründe «zureichend» sind, ist RECHTSFRAGE des Gerichts — die
//   Vorlage strukturiert nur (Begründung als Maske ODER Platzhalter,
//   Daueranweisung David 11.6.2026).

export type FeFristTyp = 'gerichtlich' | 'gesetzlich' | 'unsicher';

export type FeAntworten = KdgBasisAntworten & {
  // absender* = gesuchstellende Partei/Vertretung, adressat* = Gericht
  verfahrenBeschrieb: string;     // z. B. «Muster AG gegen Beispiel GmbH betreffend Forderung»
  verfahrenNr: string;            // optional (Geschäfts-Nr.)
  fristTyp: FeFristTyp;
  fristBeschrieb: string;         // z. B. «Frist zur Erstattung der Klageantwort»
  verfuegungVomErfassen: boolean;
  verfuegungVom: string;          // ISO, optional
  fristEnde: string;              // ISO – laufendes Fristende
  erstreckungBis: string;         // ISO – beantragtes neues Fristende
  ersteErstreckung: boolean;      // erstes Gesuch in dieser Frist
  begruendung: string;
  /** Daueranweisung David 11.6.2026: Begründung als PLATZHALTER-Block
   *  («wird später ausgefüllt») statt Masken-Text. */
  begruendungPlatzhalter: boolean;
};

export const FE_DEFAULTS: FeAntworten = {
  ...KDG_BASIS_DEFAULTS,
  verfahrenBeschrieb: '', verfahrenNr: '',
  fristTyp: 'gerichtlich',
  fristBeschrieb: '',
  verfuegungVomErfassen: false, verfuegungVom: '',
  fristEnde: '', erstreckungBis: '',
  ersteErstreckung: true,
  begruendung: '',
  begruendungPlatzhalter: false,
};

// ── Gates (deterministisch, normverifiziert) ────────────────────────────────

export type FeGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeFeGates(a: FeAntworten): FeGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  if (a.fristTyp === 'gesetzlich') {
    blocker.push(
      'GESETZLICHE Fristen können nicht erstreckt werden (Art. 144 Abs. 1 ZPO) – ein '
      + 'Erstreckungsgesuch ist aussichtslos. Bei bereits versäumter Frist kommt die '
      + 'WIEDERHERSTELLUNG in Betracht (Art. 148 ZPO: kein oder nur leichtes Verschulden '
      + 'glaubhaft machen; Gesuch innert zehn Tagen seit Wegfall des Säumnisgrundes).',
    );
  }
  if (a.fristTyp === 'unsicher') {
    warnungen.push(
      'Frist-Art prüfen: Erstreckbar sind nur GERICHTLICHE (vom Gericht angesetzte) Fristen; '
      + 'die von der ZPO selbst bestimmten gesetzlichen Fristen (z. B. Rechtsmittelfristen) '
      + 'können nicht erstreckt werden (Art. 144 ZPO).',
    );
  }
  // ISO-String-Vergleiche genügen (Datums-Konvention, keine Date-Objekte).
  if (istGueltigesISO(a.datum) && istGueltigesISO(a.fristEnde)) {
    if (a.datum > a.fristEnde) {
      blocker.push(
        'Das Gesuchsdatum liegt NACH dem Fristende – die Erstreckung setzt voraus, dass das '
        + 'Gericht VOR Fristablauf ersucht wird (Art. 144 Abs. 2 ZPO). Bei bereits versäumter '
        + 'Frist bleibt nur die Wiederherstellung (Art. 148 ZPO).',
      );
    } else if (a.datum === a.fristEnde) {
      warnungen.push(
        'Letzter Tag der Frist: Das Gesuch muss spätestens heute beim Gericht eingereicht oder '
        + 'zu dessen Handen der Schweizerischen Post übergeben werden (Art. 143 Abs. 1 ZPO).',
      );
    }
  }
  if (istGueltigesISO(a.fristEnde) && istGueltigesISO(a.erstreckungBis) && a.erstreckungBis <= a.fristEnde) {
    blocker.push('Das beantragte neue Fristende muss nach dem laufenden Fristende liegen.');
  }
  hinweise.push(
    'Die Erstreckung setzt ZUREICHENDE GRÜNDE voraus (Art. 144 Abs. 2 ZPO) – ob sie genügen, '
    + 'entscheidet das Gericht. Konkret begründen (z. B. Aktenumfang, Ferienabwesenheit der '
    + 'Klientschaft, laufende Vergleichsgespräche) statt formelhaft.',
  );
  if (!a.ersteErstreckung) {
    hinweise.push(
      'Weitere Erstreckungen derselben Frist werden in der Praxis restriktiver gewährt – '
      + 'das Gesuch legt offen, dass die Frist bereits erstreckt wurde.',
    );
  }
  return { blocker, warnungen, hinweise };
}

// ── Brief-Anatomie ──────────────────────────────────────────────────────────

const feAbsender: Baustein = {
  id: 'FE_absender', rolle: 'absender', text: '{{absenderBlock}}',
  begruendung: 'Gesuchstellende Partei bzw. Vertretung.',
};
const feAdressat: Baustein = {
  id: 'FE_adressat', rolle: 'adressat', text: '{{adressatBlock}}',
  begruendung: 'Das Gericht, das die Frist angesetzt hat – nur dieses kann sie erstrecken (Art. 144 Abs. 2 ZPO).',
};

// ── Schema ──────────────────────────────────────────────────────────────────

export const FE_SCHEMA: VorlageSchema = {
  id: 'fristerstreckungsgesuch',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Wettbewerbsanalyse V2; Art. 143/144/148 ZPO verifiziert 20250101)',
  titel: 'Fristerstreckungsgesuch',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Ob die Gründe zureichend sind (Art. 144 '
    + 'Abs. 2 ZPO), entscheidet das Gericht; massgebend sind Gesetz und konkreter Sachverhalt.',
  bausteine: [
    feAbsender,
    feAdressat,
    kdgDatumzeile('FE_datumzeile'),
    { id: 'FE_betreff', rolle: 'betreff',
      text: 'Gesuch um Fristerstreckung – {{verfahrenBeschrieb}}{{verfahrenNrSatz}}',
      begruendung: 'Betreff mit Verfahrensbezeichnung und Geschäftsnummer zur Zuordnung.' },
    { id: 'FE_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
      begruendung: 'Anrede – immer enthalten (Haus-Standard; die konkrete Besetzung des Gerichts ist dem Gesuch nicht bekannt).' },
    { id: 'FE_einleitung',
      text: 'Im genannten Verfahren läuft mir die{{verfuegungSatz}} angesetzte {{fristBeschrieb}} '
        + 'bis zum {{fristEndeFmt}}.',
      begruendung: 'Bestimmte Bezeichnung der laufenden gerichtlichen Frist (Anlass des Gesuchs).' },
    { id: 'FE_antrag',
      text: 'Ich ersuche Sie, diese Frist bis zum {{erstreckungBisFmt}} zu erstrecken.',
      norm: 'Art. 144 Abs. 2 ZPO',
      begruendung: 'Kern des Gesuchs: bestimmter Erstreckungs-Antrag vor Fristablauf (Art. 144 Abs. 2 ZPO).' },
    { id: 'FE_begruendung', ueberschrift: 'Begründung',
      text: '{{begruendungText}}',
      begruendung: 'Zureichende Gründe (Art. 144 Abs. 2 ZPO) – als Masken-Text oder Platzhalter zum späteren Ausfüllen (ob sie genügen, ist Rechtsfrage des Gerichts).' },
    { id: 'FE_erste',
      text: 'Es handelt sich um das erste Erstreckungsgesuch in dieser Frist.',
      includeIf: { feld: 'ersteErstreckung', eq: true },
      begruendung: 'Praxis-Standard: Das erste Gesuch wird regelmässig grosszügiger behandelt – die Offenlegung schafft Vertrauen.' },
    { id: 'FE_dank',
      text: 'Ich danke Ihnen für die Prüfung dieses Gesuchs und stehe für Rückfragen zur Verfügung.',
      begruendung: 'Schlusssatz – immer enthalten.' },
    { id: 'FE_schluss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen',
      begruendung: 'Schlussformel – immer enthalten.' },
    kdgUnterschrift('FE_unterschrift', 'absenderName', 'Unterschrift der gesuchstellenden Partei.'),
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────
//
// Blanko-Grundsatz (Daueranweisung David 12.6.2026): leere Pflicht-Platzhalter
// füllt die ENGINE als «________»; optionale Fragmente enden auf «…Satz» und
// verschwinden leer (Konvention engine.ts formatiere()).

export function feZusammenstellen(a: FeAntworten) {
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    verfahrenNrSatz: a.verfahrenNr.trim() ? ` (Geschäfts-Nr. ${a.verfahrenNr.trim()})` : '',
    verfuegungSatz: a.verfuegungVomErfassen && istGueltigesISO(a.verfuegungVom)
      ? ` mit Verfügung vom ${fmtDatum(a.verfuegungVom)}`
      : '',
    fristEndeFmt: istGueltigesISO(a.fristEnde) ? fmtDatum(a.fristEnde) : '',
    erstreckungBisFmt: istGueltigesISO(a.erstreckungBis) ? fmtDatum(a.erstreckungBis) : '',
    // Platzhalter-Modus: Leer-Block zum Handausfüllen (Muster Schlichtungsgesuch).
    begruendungText: a.begruendungPlatzhalter ? '________\n\n________' : a.begruendung,
  };
  return { ergebnis: assemble(FE_SCHEMA, antworten) };
}
