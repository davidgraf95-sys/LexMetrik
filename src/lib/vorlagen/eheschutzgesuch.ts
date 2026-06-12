// Dossier: bibliothek/recherche/familienrecht-klagen-vorlagen.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtDatum } from './datum';
import { parteiZeilen, parteiVollstaendig, parteiKurz, SG_PERSON_NATUERLICH, type SgPartei } from './schlichtungsgesuchBs';
import { behoerdeManuellVollstaendig, type BehoerdeManuell } from './behoerden';
import { KV_GERICHTE_BS } from './klageVereinfacht';
import { istGueltigesISO } from '../datumsUtils';
import type { Kanton } from '../../types/legal';
import type { SkKind } from './scheidungsklage';

// ─── Eheschutzgesuch (Art. 175 ff. ZGB; summarisch, Art. 271 lit. a ZPO) ────
//
// Dritte Musterklagen-Maske Familienrecht (Auftrag David 12.6.2026;
// Bauspez. familienrecht-klagen-vorlagen.md §3.1: Begehren-Katalog mit
// deterministischen FORMELN — Beträge und Begründungen bleiben Sache der
// Parteien, §2). NUR Struktur aus der Quelle, Texte eigenformuliert.
//
// Wortlaute am Fedlex-Cache verifiziert (12.6.2026, ZGB/ZPO 20260101):
// Art. 175 ZGB: Berechtigung zur Aufhebung des gemeinsamen Haushalts bei
//   ernstlicher Gefährdung. Art. 176 Abs. 1 ZGB: auf Begehren MUSS das
//   Gericht Ziff. 1 Unterhalt Kinder + Ehegatte festlegen · Ziff. 2
//   Wohnung/Hausrat regeln · Ziff. 3 Gütertrennung anordnen, wenn die
//   Umstände es rechtfertigen; Abs. 2: auch wenn das Zusammenleben
//   unmöglich ist; Abs. 3: Kindesmassnahmen nach Kindesrecht.
// Art. 173 Abs. 3 ZGB: Unterhalts-Leistungen für die Zukunft UND für das
//   Jahr vor Einreichung des Begehrens.
// Art. 177 ZGB: Schuldneranweisung bei Nichterfüllung der Unterhaltspflicht.
// Art. 178 ZGB: Verfügungsbeschränkung über BESTIMMTE Vermögenswerte.
// Art. 271 lit. a ZPO: summarisches Verfahren für Art. 172–179 ZGB.
// Art. 198 lit. a ZPO: kein Schlichtungsverfahren im summarischen Verfahren.
// Art. 273 Abs. 1 ZPO: mündliche Verhandlung (Verzicht nur bei klarem/
//   unbestrittenem Sachverhalt).

export type EgAntworten = {
  gerichtsKanton: Kanton;
  gerichtAufgeloest?: { zeilen: string[]; url?: string };
  gerichtManuellAktiv?: boolean;
  gerichtManuell?: BehoerdeManuell;
  gesuchsteller: SgPartei;
  gesuchsgegner: SgPartei;
  vertretung?: string;
  getrenntSeit: string;            // ISO, optional — bereits getrennt lebend
  // Wohnung & Hausrat (Art. 176 Abs. 1 Ziff. 2 ZGB)
  wohnung: 'gesuchsteller' | 'gesuchsgegner' | 'gericht' | 'keine';
  auszugsfristTage: number;        // D-Raster, nur bei Zuweisung an eine Partei
  hausratRegeln: boolean;
  // Kinder (Art. 176 Abs. 3 ZGB)
  kinderErfassen: boolean;
  kinder: SkKind[];
  obhut: 'gesuchsteller' | 'gesuchsgegner' | 'alternierend' | 'gericht';
  verkehrGerichtsueblich: boolean; // gerichtsübliches Raster vs. gerichtlich zu regeln
  kindesunterhalt: 'gericht' | 'beziffert';
  barunterhaltBetrag: string;      // CHF/Monat je Kind, nur 'beziffert'
  betreuungsunterhaltBetrag: string; // CHF/Monat, optional (getrenntes Begehren)
  // Ehegattenunterhalt (Art. 176 Abs. 1 Ziff. 1 / 173 ZGB)
  ehegattenunterhalt: 'keiner' | 'gericht' | 'beziffert';
  ehegattenBetrag: string;
  rueckwirkung: boolean;           // Art. 173 Abs. 3 ZGB (Jahr vor Einreichung)
  // Weitere Massnahmen
  gueterTrennung: boolean;         // Art. 176 Abs. 1 Ziff. 3 ZGB
  schuldneranweisung: boolean;     // Art. 177 ZGB
  arbeitgeberName: string;
  verfuegungsbeschraenkung: boolean; // Art. 178 ZGB
  vermoegenswert: string;          // INDIVIDUELL zu bezeichnen (Bauspez: keine Gesamtsperre)
  weitereBegehren: string[];
  vollmachtBeilage: boolean;
  weitereBeilagen: { bezeichnung: string }[];
  ort: string;
  datum: string;
};

export const EG_DEFAULTS: EgAntworten = {
  gerichtsKanton: 'ZH',
  gesuchsteller: { ...SG_PERSON_NATUERLICH },
  gesuchsgegner: { ...SG_PERSON_NATUERLICH },
  getrenntSeit: '',
  wohnung: 'gesuchsteller',
  auszugsfristTage: 30,
  hausratRegeln: true,
  kinderErfassen: false,
  kinder: [],
  obhut: 'gericht',
  verkehrGerichtsueblich: true,
  kindesunterhalt: 'gericht',
  barunterhaltBetrag: '',
  betreuungsunterhaltBetrag: '',
  ehegattenunterhalt: 'gericht',
  ehegattenBetrag: '',
  rueckwirkung: false,
  gueterTrennung: false,
  schuldneranweisung: false,
  arbeitgeberName: '',
  verfuegungsbeschraenkung: false,
  vermoegenswert: '',
  weitereBegehren: [],
  vollmachtBeilage: false,
  weitereBeilagen: [],
  ort: '',
  datum: '',
};

// ── Mängel/Hinweise ─────────────────────────────────────────────────────────

export type EgMangel = { schritt: number; text: string };

export function egMaengel(a: EgAntworten): EgMangel[] {
  const m: EgMangel[] = [];
  if (a.gerichtsKanton !== 'BS'
      && !(a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell))
      && (a.gerichtAufgeloest?.zeilen.length ?? 0) < 3) {
    m.push({ schritt: 0, text: `Zuständiges Gericht für den Kanton ${a.gerichtsKanton} bestimmen — oder die Adresse von Hand erfassen (Art. 23 Abs. 1 ZPO).` });
  }
  if (!parteiVollstaendig(a.gesuchsteller)) m.push({ schritt: 1, text: 'Gesuchstellende Partei vollständig bezeichnen.' });
  if (!parteiVollstaendig(a.gesuchsgegner)) m.push({ schritt: 1, text: 'Gesuchsgegnerische Partei vollständig bezeichnen.' });
  if (a.kinderErfassen && a.kinder.filter((k) => k.vorname.trim()).length === 0) {
    m.push({ schritt: 1, text: 'Mindestens ein Kind erfassen — oder die Kinder-Erfassung deaktivieren.' });
  }
  if (a.kinderErfassen && a.kindesunterhalt === 'beziffert' && !a.barunterhaltBetrag.trim()) {
    m.push({ schritt: 2, text: 'Barunterhalt je Kind beziffern (CHF/Monat) — oder «gerichtlich festzusetzen» wählen.' });
  }
  if (a.ehegattenunterhalt === 'beziffert' && !a.ehegattenBetrag.trim()) {
    m.push({ schritt: 2, text: 'Ehegattenunterhalt beziffern (CHF/Monat) — oder «gerichtlich festzusetzen» wählen.' });
  }
  if (a.schuldneranweisung && !a.arbeitgeberName.trim()) {
    m.push({ schritt: 2, text: 'Schuldneranweisung (Art. 177 ZGB): Arbeitgeberin/Schuldner der Gegenpartei bezeichnen.' });
  }
  if (a.verfuegungsbeschraenkung && !a.vermoegenswert.trim()) {
    m.push({ schritt: 2, text: 'Verfügungsbeschränkung (Art. 178 ZGB): den Vermögenswert INDIVIDUELL bezeichnen (z. B. Grundstück mit Grundbuchblatt-Nr., Konto mit IBAN) — eine Gesamtsperre ist nicht zulässig.' });
  }
  if (!a.datum) m.push({ schritt: 3, text: 'Datum angeben.' });
  return m;
}

export function egHinweise(a: EgAntworten): string[] {
  const h: string[] = [
    'Eheschutzbegehren laufen im SUMMARISCHEN Verfahren (Art. 271 lit. a ZPO) — das Schlichtungs'
    + 'verfahren entfällt (Art. 198 lit. a ZPO); Tatsachen sind GLAUBHAFT zu machen, Belege beilegen.',
    'Das Gericht führt eine mündliche Verhandlung durch; darauf verzichten kann es nur bei klarem '
    + 'oder unbestrittenem Sachverhalt (Art. 273 Abs. 1 ZPO).',
    'Unterhaltsbeträge berechnet LexMetrik nicht (Ermessens-/Bedarfsfrage) — die Begehren tragen die '
    + 'deterministische FORMEL («monatlich im Voraus auf den Ersten»), die Höhe ist Ihre Eingabe oder '
    + 'bleibt dem Gericht überlassen.',
  ];
  if (a.rueckwirkung) {
    h.push('Rückwirkung: Unterhalt kann für die Zukunft UND für das Jahr vor Einreichung des Begehrens '
      + 'gefordert werden (Art. 173 Abs. 3 ZGB) — weiter zurück nicht.');
  }
  if (a.gueterTrennung) {
    h.push('Die Gütertrennung ordnet das Gericht nur an, «wenn es die Umstände rechtfertigen» '
      + '(Art. 176 Abs. 1 Ziff. 3 ZGB) — eine Wertungsfrage; die Begründung liegt bei Ihnen.');
  }
  if (a.kinderErfassen) {
    h.push('Für Kinderbelange gelten Offizial- und Untersuchungsmaxime (Art. 296 ZPO) — das Gericht '
      + 'ist an die Anträge nicht gebunden.');
  }
  return h;
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const EG_SCHEMA: VorlageSchema = {
  id: 'eheschutzgesuch',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Bauspez. familienrecht-klagen-vorlagen.md §3.1; ZGB/ZPO verifiziert 20260101)',
  titel: 'Eheschutzgesuch',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Eheschutzgesuch (Art. 175 ff. ZGB) im '
    + 'summarischen Verfahren (Art. 271 lit. a ZPO); einzureichen unterschrieben im Doppel beim '
    + 'Gericht am Wohnsitz einer Partei. Tatsachen sind glaubhaft zu machen; Unterhaltshöhen '
    + 'bestimmt das Gericht nach den konkreten Verhältnissen.',
  bausteine: [
    { id: 'EG01_adressat', rolle: 'adressat', text: '{{gerichtBlock}}',
      begruendung: 'Gericht am Wohnsitz einer Partei — zwingender Gerichtsstand für eherechtliche Gesuche.', norm: 'Art. 23 Abs. 1 ZPO' },
    { id: 'EG02_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}',
      begruendung: 'Ort und Datum der Eingabe.' },
    { id: 'EG03_betreff', rolle: 'betreff', text: 'Eheschutzgesuch (Art. 175 ff. ZGB; summarisches Verfahren, Art. 271 lit. a ZPO)',
      begruendung: 'Betreff mit Verfahrensbezeichnung.', norm: 'Art. 271 ZPO' },
    { id: 'EG04_rubrum', rolle: 'rubrum',
      text: 'in Sachen\n{{gesuchstellerRubrum}}\n(gesuchstellende Partei){{vertretungZeile}}\n\ngegen\n\n{{gesuchsgegnerRubrum}}\n(gesuchsgegnerische Partei)\n\nbetreffend Eheschutz',
      begruendung: 'Parteien und allfällige Vertretung.' },
    { id: 'EG05_begehren', ueberschrift: 'Rechtsbegehren', text: '{{item.text}}',
      wiederholeUeber: 'begehrenListe', nummeriert: true,
      begruendung: 'Begehren-Katalog des Eheschutzes: Getrenntleben, Wohnung/Hausrat, Kinderbelange, Unterhalt (Formel deterministisch, Höhe Eingabe), weitere Massnahmen, Kosten.', norm: 'Art. 176 ZGB' },
    { id: 'EG06_formelles', ueberschrift: 'Formelles', text: '{{formellesText}}',
      begruendung: 'Zuständigkeit, summarisches Verfahren, kein Schlichtungsverfahren, mündliche Verhandlung.', norm: 'Art. 271/198 lit. a/273 ZPO' },
    { id: 'EG07_beilagen', ueberschrift: 'Beilagen', text: '– {{item.text}}',
      includeIf: { feld: 'beilagenListe', nichtLeer: true }, wiederholeUeber: 'beilagenListe',
      begruendung: 'Belege zur Glaubhaftmachung (Lohn, Wohnkosten, Krankenkassen, Kinderbelege).' },
    { id: 'EG08_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen',
      begruendung: 'Schlussformel der Eingabe.' },
    { id: 'EG09_unterschrift', rolle: 'unterschrift',
      text: '_________________________________\n{{unterschriftName}}',
      begruendung: 'Unterschrift der gesuchstellenden Partei bzw. der Vertretung.' },
    { id: 'EG10_doppel',
      text: 'Einreichung im Doppel: ein Exemplar für das Gericht und ein Exemplar für die gesuchsgegnerische Partei (Art. 131 ZPO).',
      begruendung: 'Exemplare-Hinweis.', norm: 'Art. 131 ZPO' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

const OBHUT_TEXT: Record<EgAntworten['obhut'], string | null> = {
  gesuchsteller: 'Die Kinder seien für die Dauer des Getrenntlebens unter die Obhut der gesuchstellenden Partei zu stellen.',
  gesuchsgegner: 'Die Kinder seien für die Dauer des Getrenntlebens unter die Obhut der gesuchsgegnerischen Partei zu stellen.',
  alternierend: 'Die Kinder seien für die Dauer des Getrenntlebens unter die alternierende Obhut beider Parteien zu stellen.',
  gericht: null,
};

export function egZusammenstellen(a: EgAntworten) {
  const gerichtBlock = a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell)
    ? [a.gerichtManuell!.name, a.gerichtManuell!.strasse, a.gerichtManuell!.plzOrt].join('\n')
    : a.gerichtsKanton === 'BS'
      ? [KV_GERICHTE_BS.zivilgericht.name, KV_GERICHTE_BS.zivilgericht.strasse, KV_GERICHTE_BS.zivilgericht.plzOrt].join('\n')
      : (a.gerichtAufgeloest?.zeilen.length ?? 0) >= 3
        ? a.gerichtAufgeloest!.zeilen.join('\n')
        : '________\n________\n________';

  const begehren: { text: string }[] = [];
  begehren.push({
    text: 'Es sei festzustellen, dass die Parteien berechtigt sind, getrennt zu leben'
      + (istGueltigesISO(a.getrenntSeit) ? ` (faktisch getrennt seit ${fmtDatum(a.getrenntSeit)})` : '')
      + ', und das Getrenntleben sei zu regeln (Art. 175 f. ZGB).',
  });
  if (a.wohnung === 'gesuchsteller' || a.wohnung === 'gesuchsgegner') {
    const wer = a.wohnung === 'gesuchsteller' ? 'der gesuchstellenden Partei' : 'der gesuchsgegnerischen Partei';
    const andere = a.wohnung === 'gesuchsteller' ? 'die gesuchsgegnerische Partei' : 'die gesuchstellende Partei';
    begehren.push({
      text: `Die eheliche Wohnung samt Hausrat sei für die Dauer des Getrenntlebens ${wer} zur alleinigen Benützung zuzuweisen; ${andere} sei zu verpflichten, die Wohnung innert ${a.auszugsfristTage} Tagen seit Rechtskraft des Entscheids zu verlassen (Art. 176 Abs. 1 Ziff. 2 ZGB).`,
    });
  } else if (a.wohnung === 'gericht') {
    begehren.push({ text: 'Die Benützung der ehelichen Wohnung und des Hausrats sei gerichtlich zu regeln (Art. 176 Abs. 1 Ziff. 2 ZGB).' });
  }
  if (a.hausratRegeln && a.wohnung === 'keine') {
    begehren.push({ text: 'Die Benützung des Hausrats sei gerichtlich zu regeln (Art. 176 Abs. 1 Ziff. 2 ZGB).' });
  }
  if (a.kinderErfassen) {
    const obhut = OBHUT_TEXT[a.obhut];
    if (obhut) begehren.push({ text: obhut });
    else begehren.push({ text: 'Die Obhut über die Kinder sei für die Dauer des Getrenntlebens gerichtlich zu regeln (Art. 176 Abs. 3 ZGB).' });
    begehren.push({
      text: a.verkehrGerichtsueblich
        ? 'Der persönliche Verkehr zwischen den Kindern und dem nicht obhutsberechtigten Elternteil sei nach dem gerichtsüblichen Besuchs- und Ferienrecht zu regeln (Art. 273 ZGB).'
        : 'Der persönliche Verkehr zwischen den Kindern und dem nicht obhutsberechtigten Elternteil sei gerichtlich zu regeln (Art. 273 ZGB).',
    });
    if (a.kindesunterhalt === 'beziffert') {
      begehren.push({ text: `Die unterhaltspflichtige Partei sei zu verpflichten, an den Unterhalt der Kinder monatlich im Voraus auf den Ersten je Kind CHF ${a.barunterhaltBetrag.trim() || '________'} (Barunterhalt) zu bezahlen (Art. 276/285 ZGB).` });
      if (a.betreuungsunterhaltBetrag.trim()) {
        begehren.push({ text: `Zusätzlich sei Betreuungsunterhalt von monatlich im Voraus CHF ${a.betreuungsunterhaltBetrag.trim()} zu bezahlen (Art. 285 Abs. 2 ZGB).` });
      }
    } else {
      begehren.push({ text: 'Die Unterhaltsbeiträge für die Kinder (Bar- und Betreuungsunterhalt) seien gerichtlich festzusetzen, zahlbar monatlich im Voraus auf den Ersten (Art. 276/285 ZGB).' });
    }
  }
  if (a.ehegattenunterhalt === 'beziffert') {
    begehren.push({
      text: `Die gesuchsgegnerische Partei sei zu verpflichten, der gesuchstellenden Partei Unterhalt von monatlich im Voraus CHF ${a.ehegattenBetrag.trim() || '________'} zu bezahlen${a.rueckwirkung ? ', rückwirkend auch für das Jahr vor Einreichung dieses Gesuchs (Art. 173 Abs. 3 ZGB)' : ''} (Art. 176 Abs. 1 Ziff. 1 ZGB).`,
    });
  } else if (a.ehegattenunterhalt === 'gericht') {
    begehren.push({
      text: `Der Unterhaltsbeitrag an die gesuchstellende Partei sei gerichtlich festzusetzen, zahlbar monatlich im Voraus${a.rueckwirkung ? ', rückwirkend auch für das Jahr vor Einreichung dieses Gesuchs (Art. 173 Abs. 3 ZGB)' : ''} (Art. 176 Abs. 1 Ziff. 1 ZGB).`,
    });
  }
  if (a.gueterTrennung) {
    begehren.push({ text: 'Es sei die Gütertrennung anzuordnen (Art. 176 Abs. 1 Ziff. 3 ZGB).' });
  }
  if (a.schuldneranweisung) {
    begehren.push({ text: `${a.arbeitgeberName.trim() || '________'} sei anzuweisen, die Lohnzahlungen an die gesuchsgegnerische Partei im Umfang der festgesetzten Unterhaltsbeiträge direkt der gesuchstellenden Partei zu leisten (Art. 177 ZGB).` });
  }
  if (a.verfuegungsbeschraenkung) {
    begehren.push({ text: `Die Verfügung über den folgenden Vermögenswert sei von der Zustimmung der gesuchstellenden Partei abhängig zu machen: ${a.vermoegenswert.trim() || '________'} (Art. 178 ZGB).` });
  }
  for (const w of a.weitereBegehren) if (w.trim()) begehren.push({ text: w.trim() });
  begehren.push({ text: 'Unter Kosten- und Entschädigungsfolge zulasten der gesuchsgegnerischen Partei.' });

  const formellesTeile = [
    'Örtlich zuständig ist das Gericht am Wohnsitz einer Partei (Art. 23 Abs. 1 ZPO, zwingend).',
    'Massnahmen zum Schutz der ehelichen Gemeinschaft laufen im summarischen Verfahren (Art. 271 lit. a ZPO); das Schlichtungsverfahren entfällt (Art. 198 lit. a ZPO).',
    'Um Ansetzung der mündlichen Verhandlung (Art. 273 Abs. 1 ZPO) wird ersucht.',
  ];

  const kinderZeilen = a.kinderErfassen
    ? a.kinder.filter((k) => k.vorname.trim())
      .map((k) => `${k.vorname.trim()}${istGueltigesISO(k.geburtsdatum) ? `, geb. ${fmtDatum(k.geburtsdatum)}` : ''}`)
      .join('; ')
    : '';

  const beilagen: { text: string }[] = [];
  beilagen.push({ text: 'Beilage 1: Familienausweis bzw. Eheurkunde' });
  beilagen.push({ text: 'Beilage 2: Lohnabrechnungen / Einkommensbelege beider Parteien (soweit verfügbar)' });
  beilagen.push({ text: 'Beilage 3: Mietvertrag bzw. Wohnkostenbelege' });
  if (a.kinderErfassen) beilagen.push({ text: `Beilage ${beilagen.length + 1}: Geburtsurkunden der Kinder; Krankenkassen-Policen` });
  if (a.vollmachtBeilage) beilagen.push({ text: `Beilage ${beilagen.length + 1}: Vollmacht` });
  for (const b of a.weitereBeilagen) {
    if (b.bezeichnung.trim()) beilagen.push({ text: `Beilage ${beilagen.length + 1}: ${b.bezeichnung.trim()}` });
  }

  const antworten: Antworten = {
    ...a,
    gerichtBlock,
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}${a.datum ? fmtDatum(a.datum) : '________'}`,
    gesuchstellerRubrum: parteiZeilen(a.gesuchsteller).join(', '),
    gesuchsgegnerRubrum: parteiZeilen(a.gesuchsgegner).join(', ')
      + (kinderZeilen ? `\n\ngemeinsame Kinder: ${kinderZeilen}` : ''),
    vertretungZeile: a.vertretung?.trim() ? `\nvertreten durch ${a.vertretung.trim()}` : '',
    begehrenListe: begehren,
    formellesText: formellesTeile.join(' '),
    beilagenListe: beilagen,
    unterschriftName: a.vertretung?.trim() ? a.vertretung.trim() : parteiKurz(a.gesuchsteller),
  };
  return assemble(EG_SCHEMA, antworten);
}
