// Dossier: bibliothek/recherche/familienrecht-klagen-vorlagen.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtDatum } from './datum';
import { parteiZeilen, parteiVollstaendig, parteiKurz, SG_PERSON_NATUERLICH, type SgPartei } from './schlichtungsgesuchBs';
import { behoerdeManuellVollstaendig, type BehoerdeManuell } from './behoerden';
import { KV_GERICHTE_BS } from './klageVereinfacht';
import { istGueltigesISO } from '../datumsUtils';
import type { Kanton } from '../../types/legal';

// ─── Scheidungsklage — unbegründete Eingabe (Art. 290 ZPO) ──────────────────
//
// Erste Musterklagen-Maske des Familienrecht-Blocks (Auftrag David
// 12.6.2026; Bauspez. familienrecht-klagen-vorlagen.md §3.3: «290 ZPO ist
// fast reines Formular»). NUR Struktur aus der Quelle — alle Texte
// eigenformuliert (Urheberrechts-Regel des Dossiers).
//
// Wortlaute am Fedlex-Cache verifiziert (12.6.2026, ZPO/ZGB 20260101):
// Art. 290 ZPO: Klage OHNE schriftliche Begründung zulässig; Mindestinhalt
//   lit. a Parteien/Vertretung · b Begehren «die Ehe sei zu scheiden» +
//   Bezeichnung des Scheidungsgrunds (Art. 114 ODER 115 ZGB) · c Begehren
//   vermögensrechtliche Folgen · d Begehren Kinder · e Belege · f Datum/
//   Unterschriften.
// Art. 291 ZPO: Einigungsverhandlung; Abs. 3 revZPO: bei fehlender Einigung
//   Frist zur Klagebegründung (RICHTERLICH — kein Gesetzeswert, Dossier-
//   Korrektur 10.6.2026), Fortsetzung im VEREINFACHTEN Verfahren.
// Art. 114 ZGB: 2 Jahre Getrenntleben BEI EINTRITT DER RECHTSHÄNGIGKEIT.
// Art. 115 ZGB: vorher nur bei Unzumutbarkeit aus schwerwiegenden, dem
//   klagenden Ehegatten nicht zuzurechnenden Gründen.
// Art. 23 Abs. 1 ZPO: zwingend Gericht am Wohnsitz einer Partei.
// Art. 198 lit. c ZPO: KEIN Schlichtungsverfahren im Scheidungsverfahren.
// Art. 122 ZGB: Ausgleich der während der Ehe bis zur Einleitung des
//   Verfahrens erworbenen Ansprüche aus beruflicher Vorsorge.

export type SkKind = { vorname: string; geburtsdatum: string };

export type SkAntworten = {
  gerichtsKanton: Kanton;
  gerichtAufgeloest?: { zeilen: string[]; url?: string };
  gerichtManuellAktiv?: boolean;
  gerichtManuell?: BehoerdeManuell;
  klaeger: SgPartei;
  beklagte: SgPartei;
  vertretung?: string;
  // lit. b — Scheidungsgrund
  grund: '114' | '115';
  trennungSeit: string;            // ISO, nur Grund 114
  // lit. d — Kinderbelange (nur mit gemeinsamen minderjährigen Kindern)
  kinderErfassen: boolean;
  kinder: SkKind[];
  obhut: 'klaeger' | 'beklagte' | 'alternierend' | 'gericht';
  // lit. c — vermögensrechtliche Folgen
  unterhaltEhegatte: 'keiner' | 'gericht' | 'beziffert';
  unterhaltBetrag: string;         // CHF/Monat, nur 'beziffert'
  gueterrecht: boolean;            // Durchführung der Auseinandersetzung beantragen
  vorsorgeausgleich: boolean;      // Art. 122 ff. ZGB
  weitereRechtsbegehren: string[];
  // lit. e/f
  vollmachtBeilage: boolean;
  weitereBeilagen: { bezeichnung: string }[];
  ort: string;
  datum: string;
};

export const SK_DEFAULTS: SkAntworten = {
  gerichtsKanton: 'ZH',
  klaeger: { ...SG_PERSON_NATUERLICH },
  beklagte: { ...SG_PERSON_NATUERLICH },
  grund: '114',
  trennungSeit: '',
  kinderErfassen: false,
  kinder: [],
  obhut: 'gericht',
  unterhaltEhegatte: 'gericht',
  unterhaltBetrag: '',
  gueterrecht: true,
  vorsorgeausgleich: true,
  weitereRechtsbegehren: [],
  vollmachtBeilage: false,
  weitereBeilagen: [],
  ort: '',
  datum: '',
};

// ── Gates/Hinweise (deterministisch) ────────────────────────────────────────

/** Zwei-Jahres-Vergleich als reine ISO-String-Arithmetik (Datums-Konvention). */
export function skZweiJahreErreicht(trennungISO: string, einreichungISO: string): boolean | null {
  if (!istGueltigesISO(trennungISO) || !istGueltigesISO(einreichungISO)) return null;
  const schwelle = `${Number(trennungISO.slice(0, 4)) + 2}${trennungISO.slice(4)}`;
  return einreichungISO >= schwelle;
}

export type SkMangel = { schritt: number; text: string };

export function skMaengel(a: SkAntworten): SkMangel[] {
  const m: SkMangel[] = [];
  if (a.gerichtsKanton !== 'BS'
      && !(a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell))
      && (a.gerichtAufgeloest?.zeilen.length ?? 0) < 3) {
    m.push({ schritt: 0, text: `Zuständiges Gericht für den Kanton ${a.gerichtsKanton} bestimmen — oder die Adresse von Hand erfassen (zwingender Gerichtsstand: Wohnsitz einer Partei, Art. 23 Abs. 1 ZPO).` });
  }
  if (a.grund === '114' && !istGueltigesISO(a.trennungSeit)) {
    m.push({ schritt: 0, text: 'Beginn des Getrenntlebens angeben (Art. 114 ZGB: zwei Jahre bei Eintritt der Rechtshängigkeit).' });
  }
  if (!parteiVollstaendig(a.klaeger)) m.push({ schritt: 1, text: 'Klagende Partei vollständig bezeichnen (Art. 290 lit. a ZPO).' });
  if (!parteiVollstaendig(a.beklagte)) m.push({ schritt: 1, text: 'Beklagte Partei vollständig bezeichnen (Art. 290 lit. a ZPO).' });
  if (a.kinderErfassen && a.kinder.filter((k) => k.vorname.trim()).length === 0) {
    m.push({ schritt: 1, text: 'Mindestens ein Kind erfassen — oder die Kinder-Erfassung deaktivieren.' });
  }
  if (a.unterhaltEhegatte === 'beziffert' && !a.unterhaltBetrag.trim()) {
    m.push({ schritt: 2, text: 'Nachehelichen Unterhalt beziffern (CHF/Monat) — oder «gerichtlich festzusetzen» wählen.' });
  }
  if (!a.datum) m.push({ schritt: 3, text: 'Datum angeben (Art. 290 lit. f ZPO).' });
  return m;
}

export function skWarnungen(a: SkAntworten): string[] {
  const w: string[] = [];
  if (a.grund === '114') {
    const erreicht = skZweiJahreErreicht(a.trennungSeit, a.datum);
    if (erreicht === false) {
      w.push(
        'Die zwei Jahre Getrenntleben (Art. 114 ZGB) sind am gewählten Einreichungsdatum noch '
        + 'NICHT erreicht — massgebend ist der Eintritt der Rechtshängigkeit. Vor Ablauf ist die '
        + 'Scheidung nur nach Art. 115 ZGB (Unzumutbarkeit) möglich; sonst Einreichung aufschieben.',
      );
    }
  }
  if (a.grund === '115') {
    w.push(
      'Art. 115 ZGB verlangt schwerwiegende Gründe, die der klagenden Partei NICHT zuzurechnen '
      + 'sind — eine Wertungsfrage, die LexMetrik nicht prüft. Die unbegründete Eingabe bezeichnet '
      + 'nur den Grund; die Darlegung folgt in der Einigungsverhandlung bzw. der späteren Begründung.',
    );
  }
  return w;
}

export function skHinweise(a: SkAntworten): string[] {
  const h: string[] = [
    'Die Scheidungsklage kann OHNE schriftliche Begründung eingereicht werden (Art. 290 ZPO) — '
    + 'diese Vorlage erstellt die unbegründete Eingabe mit dem gesetzlichen Mindestinhalt (lit. a–f).',
    'Kein Schlichtungsverfahren: Im Scheidungsverfahren entfällt es von Gesetzes wegen (Art. 198 lit. c ZPO).',
    'Ablauf nach Einreichung: Das Gericht lädt zur Einigungsverhandlung vor (Art. 291 ZPO). Kommt '
    + 'keine Einigung zustande, setzt es eine Frist zur Klagebegründung (die Fristlänge bestimmt das '
    + 'Gericht); das Verfahren wird kontradiktorisch im VEREINFACHTEN Verfahren fortgesetzt (Art. 291 Abs. 3 ZPO).',
  ];
  if (a.kinderErfassen) {
    h.push('Für Kinderbelange gelten Offizial- und Untersuchungsmaxime — das Gericht ist an die '
      + 'Anträge nicht gebunden (Art. 296 ZPO); die Begehren orientieren über den Standpunkt.');
  }
  return h;
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const SK_SCHEMA: VorlageSchema = {
  id: 'scheidungsklage',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Bauspez. familienrecht-klagen-vorlagen.md §3.3; ZPO/ZGB verifiziert 20260101)',
  titel: 'Scheidungsklage (unbegründete Eingabe)',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Unbegründete Scheidungsklage nach Art. 290 ZPO; '
    + 'einzureichen unterschrieben im Doppel beim Gericht am Wohnsitz einer Partei (Art. 23 Abs. 1 ZPO). '
    + 'Das Gericht lädt zur Einigungsverhandlung vor (Art. 291 ZPO); Kinderbelange unterliegen der '
    + 'Offizialmaxime.',
  bausteine: [
    { id: 'SK01_adressat', rolle: 'adressat', text: '{{gerichtBlock}}',
      begruendung: 'Gericht am Wohnsitz einer Partei — zwingender Gerichtsstand.', norm: 'Art. 23 Abs. 1 ZPO' },
    { id: 'SK02_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}',
      begruendung: 'Ort und Datum der Eingabe.', norm: 'Art. 290 lit. f ZPO' },
    { id: 'SK03_betreff', rolle: 'betreff', text: 'Scheidungsklage (Art. 290 ZPO) — unbegründete Eingabe',
      begruendung: 'Betreff mit Verfahrensbezeichnung; die Klage darf ohne schriftliche Begründung eingereicht werden.', norm: 'Art. 290 ZPO' },
    { id: 'SK04_rubrum', rolle: 'rubrum',
      text: 'in Sachen\n{{klaegerRubrum}}\n(klagende Partei){{vertretungZeile}}\n\ngegen\n\n{{beklagteRubrum}}\n(beklagte Partei)\n\nbetreffend Scheidung',
      begruendung: 'Parteien und allfällige Vertretung.', norm: 'Art. 290 lit. a ZPO' },
    { id: 'SK05_begehren', ueberschrift: 'Rechtsbegehren', text: '{{item.text}}',
      wiederholeUeber: 'rechtsbegehrenListe', nummeriert: true,
      begruendung: 'Scheidungsbegehren mit Grund-Bezeichnung (lit. b), vermögensrechtliche Folgen (lit. c), Kinderbelange (lit. d), Kosten.', norm: 'Art. 290 lit. b–d ZPO' },
    { id: 'SK06_formelles', ueberschrift: 'Formelles', text: '{{formellesText}}',
      begruendung: 'Zwingende örtliche Zuständigkeit; kein Schlichtungsverfahren; Hinweis auf die Einigungsverhandlung.', norm: 'Art. 23 Abs. 1 / 198 lit. c / 291 ZPO' },
    { id: 'SK07_beilagen', ueberschrift: 'Beilagen', text: '– {{item.text}}',
      includeIf: { feld: 'beilagenListe', nichtLeer: true }, wiederholeUeber: 'beilagenListe',
      begruendung: 'Erforderliche Belege.', norm: 'Art. 290 lit. e ZPO' },
    { id: 'SK08_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen',
      begruendung: 'Schlussformel der Eingabe.' },
    { id: 'SK09_unterschrift', rolle: 'unterschrift',
      text: '_________________________________\n{{unterschriftName}}',
      begruendung: 'Unterschrift der klagenden Partei bzw. der Vertretung.', norm: 'Art. 290 lit. f ZPO' },
    { id: 'SK10_doppel',
      text: 'Einreichung im Doppel: ein Exemplar für das Gericht und ein Exemplar für die beklagte Partei (Art. 131 ZPO).',
      begruendung: 'Exemplare-Hinweis.', norm: 'Art. 131 ZPO' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

const OBHUT_TEXT: Record<SkAntworten['obhut'], string | null> = {
  klaeger: 'Die Kinder seien unter die Obhut der klagenden Partei zu stellen.',
  beklagte: 'Die Kinder seien unter die Obhut der beklagten Partei zu stellen.',
  alternierend: 'Die Kinder seien unter die alternierende Obhut beider Parteien zu stellen.',
  gericht: null, // Regelung dem Gericht überlassen (Offizialmaxime)
};

export function skZusammenstellen(a: SkAntworten) {
  const gerichtBlock = a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell)
    ? [a.gerichtManuell!.name, a.gerichtManuell!.strasse, a.gerichtManuell!.plzOrt].join('\n')
    : a.gerichtsKanton === 'BS'
      ? [KV_GERICHTE_BS.zivilgericht.name, KV_GERICHTE_BS.zivilgericht.strasse, KV_GERICHTE_BS.zivilgericht.plzOrt].join('\n')
      : (a.gerichtAufgeloest?.zeilen.length ?? 0) >= 3
        ? a.gerichtAufgeloest!.zeilen.join('\n')
        : '________\n________\n________';

  // Rechtsbegehren-Raster (lit. b → d → c → Kosten)
  const begehren: { text: string }[] = [];
  begehren.push({
    text: a.grund === '114'
      ? `Die Ehe der Parteien sei zu scheiden (Art. 114 ZGB; Getrenntleben seit ${istGueltigesISO(a.trennungSeit) ? fmtDatum(a.trennungSeit) : '________'}).`
      : 'Die Ehe der Parteien sei zu scheiden (Art. 115 ZGB).',
  });
  if (a.kinderErfassen) {
    begehren.push({ text: 'Die gemeinsamen Kinder seien unter der gemeinsamen elterlichen Sorge der Parteien zu belassen.' });
    const obhut = OBHUT_TEXT[a.obhut];
    if (obhut) begehren.push({ text: obhut });
    begehren.push({ text: 'Der persönliche Verkehr zwischen den Kindern und dem nicht obhutsberechtigten Elternteil sei gerichtlich zu regeln.' });
    begehren.push({ text: 'Die Unterhaltsbeiträge für die Kinder seien gerichtlich festzusetzen.' });
  }
  if (a.unterhaltEhegatte === 'keiner') {
    begehren.push({ text: 'Es seien keine nachehelichen Unterhaltsbeiträge zuzusprechen.' });
  } else if (a.unterhaltEhegatte === 'beziffert') {
    begehren.push({ text: `Die beklagte Partei sei zu verpflichten, der klagenden Partei nachehelichen Unterhalt von monatlich CHF ${a.unterhaltBetrag.trim() || '________'}, zahlbar monatlich im Voraus, zu leisten.` });
  } else {
    begehren.push({ text: 'Der nacheheliche Unterhalt sei gerichtlich festzusetzen.' });
  }
  if (a.gueterrecht) {
    begehren.push({ text: 'Die güterrechtliche Auseinandersetzung sei durchzuführen; die Bezifferung bleibt vorbehalten.' });
  }
  if (a.vorsorgeausgleich) {
    begehren.push({ text: 'Die während der Ehe bis zur Einleitung des Verfahrens erworbenen Ansprüche aus beruflicher Vorsorge seien auszugleichen (Art. 122 ff. ZGB).' });
  }
  for (const w of a.weitereRechtsbegehren) if (w.trim()) begehren.push({ text: w.trim() });
  begehren.push({ text: 'Unter Kosten- und Entschädigungsfolge zulasten der beklagten Partei.' });

  const formellesTeile = [
    `Örtlich zuständig ist das Gericht am Wohnsitz einer Partei (Art. 23 Abs. 1 ZPO, zwingend).`,
    'Das Schlichtungsverfahren entfällt im Scheidungsverfahren (Art. 198 lit. c ZPO).',
    'Die Klage wird als unbegründete Eingabe nach Art. 290 ZPO eingereicht; um Vorladung zur Einigungsverhandlung (Art. 291 ZPO) wird ersucht.',
  ];

  // Beilagen (lit. e)
  const beilagen: { text: string }[] = [];
  beilagen.push({ text: `Beilage 1: Familienausweis bzw. Eheurkunde` });
  if (a.kinderErfassen) beilagen.push({ text: `Beilage ${beilagen.length + 1}: Geburtsurkunden der Kinder` });
  if (a.vollmachtBeilage) beilagen.push({ text: `Beilage ${beilagen.length + 1}: Vollmacht` });
  for (const b of a.weitereBeilagen) {
    if (b.bezeichnung.trim()) beilagen.push({ text: `Beilage ${beilagen.length + 1}: ${b.bezeichnung.trim()}` });
  }

  const kinderZeilen = a.kinderErfassen
    ? a.kinder.filter((k) => k.vorname.trim())
      .map((k) => `${k.vorname.trim()}${istGueltigesISO(k.geburtsdatum) ? `, geb. ${fmtDatum(k.geburtsdatum)}` : ''}`)
      .join('; ')
    : '';

  const antworten: Antworten = {
    ...a,
    gerichtBlock,
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}${a.datum ? fmtDatum(a.datum) : '________'}`,
    klaegerRubrum: parteiZeilen(a.klaeger).join(', '),
    beklagteRubrum: parteiZeilen(a.beklagte).join(', ')
      + (kinderZeilen ? `\n\ngemeinsame Kinder: ${kinderZeilen}` : ''),
    vertretungZeile: a.vertretung?.trim() ? `\nvertreten durch ${a.vertretung.trim()}` : '',
    rechtsbegehrenListe: begehren,
    formellesText: formellesTeile.join(' '),
    beilagenListe: beilagen,
    unterschriftName: a.vertretung?.trim() ? a.vertretung.trim() : parteiKurz(a.klaeger),
  };
  return assemble(SK_SCHEMA, antworten);
}
