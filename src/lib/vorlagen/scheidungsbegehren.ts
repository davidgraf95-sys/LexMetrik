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

// ─── Gemeinsames Scheidungsbegehren (Art. 285/286 ZPO) ──────────────────────
//
// Zweite Musterklagen-Maske Familienrecht (Auftrag David 12.6.2026;
// Bauspez. familienrecht-klagen-vorlagen.md §3.2). NUR Struktur aus der
// Quelle — Texte eigenformuliert.
//
// Wortlaute am Fedlex-Cache verifiziert (12.6.2026, ZPO/ZGB 20260101):
// Art. 111 ZGB: umfassende Einigung — vollständige Vereinbarung + Belege +
//   gemeinsame Kinder-Anträge; getrennte und gemeinsame Anhörung.
// Art. 112 ZGB: Teileinigung — gemeinsames Begehren MIT ERKLÄRUNG, dass
//   das Gericht die streitigen Folgen beurteilen soll.
// Art. 285 ZPO: Mindestinhalt bei umfassender Einigung (lit. a–f:
//   Parteien/Vertretung · gemeinsames Begehren · VOLLSTÄNDIGE Vereinbarung ·
//   gemeinsame Kinder-Anträge · Belege · Datum/Unterschriften).
// Art. 286 ZPO: Teileinigung — Abs. 1 ANTRAG auf gerichtliche Beurteilung
//   der streitigen Folgen (Pflicht!); Abs. 2 begründete Einzel-Anträge
//   möglich; Abs. 3 im Übrigen Art. 285 sinngemäss.
// Art. 287 ZPO: Anhörung nach den Bestimmungen des ZGB.
// Art. 23 Abs. 1 ZPO: zwingend Gericht am Wohnsitz einer Partei.
// Art. 198 lit. c ZPO: kein Schlichtungsverfahren im Scheidungsverfahren.

export type SbAntworten = {
  gerichtsKanton: Kanton;
  gerichtAufgeloest?: { zeilen: string[]; url?: string };
  gerichtManuellAktiv?: boolean;
  gerichtManuell?: BehoerdeManuell;
  ehegatte1: SgPartei;
  ehegatte2: SgPartei;
  vertretung1?: string;
  vertretung2?: string;
  einigung: 'voll' | 'teil';
  vereinbarungDatum: string;       // ISO — Datum der (Teil-)Vereinbarung
  /** Nur 'teil': die streitigen Scheidungsfolgen (Art. 286 Abs. 1 ZPO — Pflicht). */
  streitigePunkte: string[];
  /** Nur 'teil', optional: begründete Einzel-Anträge (Art. 286 Abs. 2 ZPO). */
  antraegeEhegatte1: string[];
  antraegeEhegatte2: string[];
  kinderErfassen: boolean;
  kinder: SkKind[];
  kostenHaelftig: boolean;         // Standard beim gemeinsamen Begehren
  weitereBeilagen: { bezeichnung: string }[];
  ort: string;
  datum: string;
};

export const SB_DEFAULTS: SbAntworten = {
  gerichtsKanton: 'ZH',
  ehegatte1: { ...SG_PERSON_NATUERLICH },
  ehegatte2: { ...SG_PERSON_NATUERLICH },
  einigung: 'voll',
  vereinbarungDatum: '',
  streitigePunkte: [],
  antraegeEhegatte1: [],
  antraegeEhegatte2: [],
  kinderErfassen: false,
  kinder: [],
  kostenHaelftig: true,
  weitereBeilagen: [],
  ort: '',
  datum: '',
};

// ── Mängel/Hinweise ─────────────────────────────────────────────────────────

export type SbMangel = { schritt: number; text: string };

export function sbMaengel(a: SbAntworten): SbMangel[] {
  const m: SbMangel[] = [];
  if (a.gerichtsKanton !== 'BS'
      && !(a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell))
      && (a.gerichtAufgeloest?.zeilen.length ?? 0) < 3) {
    m.push({ schritt: 0, text: `Zuständiges Gericht für den Kanton ${a.gerichtsKanton} bestimmen — oder die Adresse von Hand erfassen (Art. 23 Abs. 1 ZPO).` });
  }
  if (!parteiVollstaendig(a.ehegatte1)) m.push({ schritt: 1, text: 'Ehegatte/Ehegattin 1 vollständig bezeichnen (Art. 285 lit. a ZPO).' });
  if (!parteiVollstaendig(a.ehegatte2)) m.push({ schritt: 1, text: 'Ehegatte/Ehegattin 2 vollständig bezeichnen (Art. 285 lit. a ZPO).' });
  if (a.kinderErfassen && a.kinder.filter((k) => k.vorname.trim()).length === 0) {
    m.push({ schritt: 1, text: 'Mindestens ein Kind erfassen — oder die Kinder-Erfassung deaktivieren.' });
  }
  if (!istGueltigesISO(a.vereinbarungDatum)) {
    m.push({ schritt: 2, text: a.einigung === 'voll'
      ? 'Datum der vollständigen Vereinbarung angeben — sie ist Pflichtbeilage (Art. 285 lit. c ZPO).'
      : 'Datum der Teilvereinbarung angeben (Art. 286 Abs. 3 i. V. m. Art. 285 lit. c ZPO).' });
  }
  if (a.einigung === 'teil' && a.streitigePunkte.filter((p) => p.trim()).length === 0) {
    m.push({ schritt: 2, text: 'Die STREITIGEN Scheidungsfolgen bezeichnen — der Antrag auf gerichtliche Beurteilung ist Pflichtinhalt (Art. 286 Abs. 1 ZPO / Art. 112 Abs. 1 ZGB).' });
  }
  if (!a.datum) m.push({ schritt: 3, text: 'Datum angeben (Art. 285 lit. f ZPO).' });
  return m;
}

export function sbHinweise(a: SbAntworten): string[] {
  const h: string[] = [
    'Kein Schlichtungsverfahren: Im Scheidungsverfahren entfällt es von Gesetzes wegen (Art. 198 lit. c ZPO).',
    'Ablauf: Ist die Eingabe vollständig, lädt das Gericht zur ANHÖRUNG vor (Art. 287 ZPO) — getrennt '
    + 'und zusammen, allenfalls in mehreren Sitzungen (Art. 111 Abs. 1 ZGB). Die Scheidung wird erst '
    + 'ausgesprochen, wenn sich das Gericht von freiem Willen und reiflicher Überlegung überzeugt hat '
    + '(Art. 111 Abs. 2 ZGB).',
    'Die Vereinbarung über die Scheidungsfolgen wird gerichtlich auf Genehmigungsfähigkeit geprüft — '
    + 'BEIDE Ehegatten unterzeichnen die Eingabe.',
  ];
  if (a.einigung === 'teil') {
    h.push('Teileinigung: Jeder Ehegatte kann zu den streitigen Folgen eigene begründete Anträge stellen '
      + '(Art. 286 Abs. 2 ZPO) — diese Eingabe führt sie als orientierende Anträge auf; die Begründung '
      + 'folgt im Verfahren.');
  }
  if (a.kinderErfassen) {
    h.push('Kinderbelange prüft das Gericht von Amtes wegen (Offizial-/Untersuchungsmaxime) — es ist an '
      + 'die gemeinsamen Anträge nicht gebunden.');
  }
  return h;
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const SB_SCHEMA: VorlageSchema = {
  id: 'scheidungsbegehren-gemeinsam',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Bauspez. familienrecht-klagen-vorlagen.md §3.2; ZPO/ZGB verifiziert 20260101)',
  titel: 'Gemeinsames Scheidungsbegehren',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Gemeinsames Scheidungsbegehren nach '
    + 'Art. 285/286 ZPO; von BEIDEN Ehegatten zu unterzeichnen und mit der Vereinbarung über die '
    + 'Scheidungsfolgen samt Belegen beim Gericht am Wohnsitz einer Partei einzureichen. Das Gericht '
    + 'hört die Parteien an (Art. 287 ZPO) und prüft die Vereinbarung.',
  bausteine: [
    { id: 'SB01_adressat', rolle: 'adressat', text: '{{gerichtBlock}}',
      begruendung: 'Gericht am Wohnsitz einer Partei — zwingender Gerichtsstand.', norm: 'Art. 23 Abs. 1 ZPO' },
    { id: 'SB02_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}',
      begruendung: 'Ort und Datum der Eingabe.', norm: 'Art. 285 lit. f ZPO' },
    { id: 'SB03_betreff', rolle: 'betreff', text: 'Gemeinsames Scheidungsbegehren ({{einigungNorm}})',
      begruendung: 'Betreff mit der Einigungs-Variante (umfassende Einigung Art. 285 ZPO bzw. Teileinigung Art. 286 ZPO).', norm: 'Art. 285/286 ZPO' },
    { id: 'SB04_rubrum', rolle: 'rubrum',
      text: 'in Sachen\n{{ehegatte1Rubrum}}{{vertretung1Zeile}}\n\nund\n\n{{ehegatte2Rubrum}}{{vertretung2Zeile}}\n\n(gesuchstellende Parteien)\n\nbetreffend Scheidung auf gemeinsames Begehren',
      begruendung: 'Beide Ehegatten als gemeinsam gesuchstellende Parteien — kein Gegner-Rubrum.', norm: 'Art. 285 lit. a ZPO' },
    { id: 'SB05_begehren', ueberschrift: 'Begehren und Anträge', text: '{{item.text}}',
      wiederholeUeber: 'begehrenListe', nummeriert: true,
      begruendung: 'Gemeinsames Scheidungsbegehren, Genehmigungsantrag zur Vereinbarung, Kinder-Anträge; bei Teileinigung der Pflicht-Antrag auf gerichtliche Beurteilung der streitigen Folgen.', norm: 'Art. 285 lit. b–d / 286 Abs. 1 ZPO' },
    { id: 'SB06_formelles', ueberschrift: 'Formelles', text: '{{formellesText}}',
      begruendung: 'Zuständigkeit; kein Schlichtungsverfahren; Hinweis auf die Anhörung.', norm: 'Art. 23 Abs. 1 / 198 lit. c / 287 ZPO' },
    { id: 'SB07_beilagen', ueberschrift: 'Beilagen', text: '– {{item.text}}',
      includeIf: { feld: 'beilagenListe', nichtLeer: true }, wiederholeUeber: 'beilagenListe',
      begruendung: 'Vereinbarung und erforderliche Belege.', norm: 'Art. 285 lit. c/e ZPO' },
    { id: 'SB08_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen',
      begruendung: 'Schlussformel der Eingabe.' },
    { id: 'SB09_unterschriften', rolle: 'unterschrift',
      text: '_________________________________\n{{ehegatte1Name}}\n\n_________________________________\n{{ehegatte2Name}}',
      begruendung: 'Unterschriften BEIDER Ehegatten — Gültigkeitserfordernis der gemeinsamen Eingabe.', norm: 'Art. 285 lit. f ZPO' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

export function sbZusammenstellen(a: SbAntworten) {
  const gerichtBlock = a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell)
    ? [a.gerichtManuell!.name, a.gerichtManuell!.strasse, a.gerichtManuell!.plzOrt].join('\n')
    : a.gerichtsKanton === 'BS'
      ? [KV_GERICHTE_BS.zivilgericht.name, KV_GERICHTE_BS.zivilgericht.strasse, KV_GERICHTE_BS.zivilgericht.plzOrt].join('\n')
      : (a.gerichtAufgeloest?.zeilen.length ?? 0) >= 3
        ? a.gerichtAufgeloest!.zeilen.join('\n')
        : '________\n________\n________';

  const vereinbarungFmt = istGueltigesISO(a.vereinbarungDatum) ? fmtDatum(a.vereinbarungDatum) : '________';

  const begehren: { text: string }[] = [];
  begehren.push({
    text: a.einigung === 'voll'
      ? 'Die Ehe der Parteien sei auf ihr gemeinsames Begehren hin zu scheiden (Art. 111 ZGB).'
      : 'Die Ehe der Parteien sei auf ihr gemeinsames Begehren hin zu scheiden (Art. 112 ZGB).',
  });
  begehren.push({
    text: a.einigung === 'voll'
      ? `Die vollständige Vereinbarung über die Scheidungsfolgen vom ${vereinbarungFmt} (Beilage 1) sei zu genehmigen.`
      : `Die Teilvereinbarung über die Scheidungsfolgen vom ${vereinbarungFmt} (Beilage 1) sei zu genehmigen.`,
  });
  if (a.einigung === 'teil') {
    const punkte = a.streitigePunkte.map((p) => p.trim()).filter(Boolean);
    begehren.push({
      text: `Das Gericht habe die Scheidungsfolgen zu beurteilen, über die sich die Parteien nicht einig sind, nämlich: ${punkte.length > 0 ? punkte.join('; ') : '________'} (Art. 112 Abs. 1 ZGB / Art. 286 Abs. 1 ZPO).`,
    });
    for (const an of a.antraegeEhegatte1) if (an.trim()) {
      begehren.push({ text: `Antrag der gesuchstellenden Partei 1: ${an.trim()} (Art. 286 Abs. 2 ZPO).` });
    }
    for (const an of a.antraegeEhegatte2) if (an.trim()) {
      begehren.push({ text: `Antrag der gesuchstellenden Partei 2: ${an.trim()} (Art. 286 Abs. 2 ZPO).` });
    }
  }
  if (a.kinderErfassen) {
    begehren.push({ text: 'Die gemeinsamen Anträge hinsichtlich der Kinder ergeben sich aus der beiliegenden Vereinbarung; die Kinder seien unter der gemeinsamen elterlichen Sorge der Parteien zu belassen.' });
  }
  if (a.kostenHaelftig) {
    begehren.push({ text: 'Die Gerichtskosten seien den Parteien je zur Hälfte aufzuerlegen; auf die Zusprechung von Parteientschädigungen sei zu verzichten.' });
  }

  const formellesTeile = [
    'Örtlich zuständig ist das Gericht am Wohnsitz einer Partei (Art. 23 Abs. 1 ZPO, zwingend).',
    'Das Schlichtungsverfahren entfällt im Scheidungsverfahren (Art. 198 lit. c ZPO).',
    'Um Vorladung zur Anhörung (Art. 287 ZPO) wird ersucht.',
  ];

  const kinderZeilen = a.kinderErfassen
    ? a.kinder.filter((k) => k.vorname.trim())
      .map((k) => `${k.vorname.trim()}${istGueltigesISO(k.geburtsdatum) ? `, geb. ${fmtDatum(k.geburtsdatum)}` : ''}`)
      .join('; ')
    : '';

  const beilagen: { text: string }[] = [];
  beilagen.push({ text: `Beilage 1: ${a.einigung === 'voll' ? 'Vollständige Vereinbarung' : 'Teilvereinbarung'} über die Scheidungsfolgen vom ${vereinbarungFmt}` });
  beilagen.push({ text: 'Beilage 2: Familienausweis bzw. Eheurkunde' });
  if (a.kinderErfassen) beilagen.push({ text: `Beilage ${beilagen.length + 1}: Geburtsurkunden der Kinder` });
  for (const b of a.weitereBeilagen) {
    if (b.bezeichnung.trim()) beilagen.push({ text: `Beilage ${beilagen.length + 1}: ${b.bezeichnung.trim()}` });
  }

  const antworten: Antworten = {
    ...a,
    gerichtBlock,
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}${a.datum ? fmtDatum(a.datum) : '________'}`,
    einigungNorm: a.einigung === 'voll' ? 'umfassende Einigung, Art. 285 ZPO' : 'Teileinigung, Art. 286 ZPO',
    ehegatte1Rubrum: parteiZeilen(a.ehegatte1).join(', '),
    ehegatte2Rubrum: parteiZeilen(a.ehegatte2).join(', ')
      + (kinderZeilen ? `\n\ngemeinsame Kinder: ${kinderZeilen}` : ''),
    vertretung1Zeile: a.vertretung1?.trim() ? `\nvertreten durch ${a.vertretung1.trim()}` : '',
    vertretung2Zeile: a.vertretung2?.trim() ? `\nvertreten durch ${a.vertretung2.trim()}` : '',
    begehrenListe: begehren,
    formellesText: formellesTeile.join(' '),
    beilagenListe: beilagen,
    ehegatte1Name: parteiKurz(a.ehegatte1),
    ehegatte2Name: parteiKurz(a.ehegatte2),
  };
  return assemble(SB_SCHEMA, antworten);
}
