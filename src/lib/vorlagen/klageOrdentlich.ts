import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtDatum, fmtCHF } from './datum';
import { parteiZeilen, parteiVollstaendig, parteiKurz, SG_PERSON_NATUERLICH, type SgPartei } from './schlichtungsgesuchBs';
import { behoerdeManuellVollstaendig, type BehoerdeManuell } from './behoerden';
import { KV_GERICHTE_BS, kvKlagefrist, type KvAusnahme } from './klageVereinfacht';
import { ZPO_SCHWELLEN } from '../zustaendigkeit';
import { KANTONE } from '../kantone';
import type { Kanton } from '../../types/legal';

// ─── Klage im ordentlichen Verfahren (Art. 219 ff. ZPO) · alle Kantone ───────
//
// Auftrag David 10.6.2026 («baue die vorlage für die ordentliche klage»;
// §0a am selben Tag gestrichen). Dritte Eingabe der Klage-Familie nach
// Schlichtungsgesuch und vereinfachter Klage — gleiche Engine-Familie
// (format 'eingabe', feste Bausteine, kein LLM), maximale Wiederverwendung
// (§10): Partei-/Gerichts-/Beilagen-Muster aus den Schwester-Schemata,
// Gerichts-Adressat über data/zivilgerichteErstinstanz.ts (KvGerichtWahl).
//
// Inhalt nach Art. 221 ZPO (Wortlaut am Fedlex-Cache verifiziert 10.6.2026):
// Abs. 1: a Parteien/Vertretung · b Rechtsbegehren · c STREITWERTANGABE ·
// d TATSACHENBEHAUPTUNGEN · e Beweismittel ZU DEN EINZELNEN Tatsachen ·
// f Datum/Unterschrift. Abs. 2: Beilagen (a Vollmacht · b Klagebewilligung
// bzw. Verzichtserklärung · c verfügbare Beweisurkunden · d BEWEISMITTEL-
// VERZEICHNIS). Abs. 3: rechtliche Begründung fakultativ.
// Anders als im vereinfachten Verfahren ist die BEGRÜNDUNG (Tatsachen +
// Beweise je Tatsache) PFLICHTINHALT — das Mängel-Gate erzwingt sie.
//
// Spruchkörper-Aussagen macht diese Vorlage bewusst NICHT (auch für BS
// nicht — das abgenommene GOG-BS-Routing der KV-Vorlage betrifft das
// vereinfachte Verfahren); der Adressat ist das erstinstanzliche
// Zivilgericht des gewählten Kantons. Status entwurf bis Davids Abnahme.

export type KoTatsache = { text: string; beweise: { bezeichnung: string }[] };

export type KoAnswers = {
  vermoegensrechtlich: boolean;
  /** Miete/Pacht Wohn-/Geschäftsräume oder landwirtschaftliche Pacht:
   *  Klagefrist 30 Tage statt 3 Monate (Art. 209 Abs. 4 ZPO — gilt auch im
   *  ordentlichen Verfahren, Bug-Check B1 10.6.2026). */
  mietePacht: boolean;
  /** Einzige kantonale Instanz (Art. 5/6/8 ZPO): ordentliches Verfahren
   *  auch bis CHF 30'000 (Art. 243 Abs. 3 ZPO) — hebt die Verfahrens-Weiche auf. */
  einzigeInstanz: boolean;
  streitwert: string;             // BetragsFeld-Rohwert (Pflicht, Art. 221 Abs. 1 lit. c, wenn vermögensrechtlich)
  gerichtsKanton: Kanton;
  gerichtAufgeloest?: { zeilen: string[]; url?: string };
  gerichtManuellAktiv?: boolean;
  gerichtManuell?: BehoerdeManuell;
  klaeger: SgPartei;
  beklagte: SgPartei;
  vertretung?: string;
  // Rechtsbegehren
  begehrenTyp: 'beziffert' | 'unbeziffert' | 'frei';
  zins?: { satz: string; abDatum: string };
  unbeziffertMindest?: string;
  unbeziffertGrund?: string;
  rechtsoeffnung: boolean;
  betreibungNr?: string;
  freieRechtsbegehren: string[];
  weitereRechtsbegehren: string[];
  streitgegenstand: string;       // Rubrum-Kurzbezeichnung
  // Begründung (PFLICHT, Art. 221 Abs. 1 lit. d/e)
  tatsachen: KoTatsache[];
  rechtlicheBegruendung: { text: string }[];  // fakultativ (Abs. 3)
  /** Auftrag David 11.6.2026: Begründung wahlweise in der Maske ('maske',
   *  Default — alte Speicherstände ohne Feld bleiben gültig) oder als
   *  PLATZHALTER im Dokument zum späteren Ausfüllen ('platzhalter').
   *  Tatsachen + Beweismittel bleiben Pflichtinhalt (Art. 221 Abs. 1
   *  lit. d/e ZPO) — der Modus verschiebt nur das Ausfüllen; Hinweis
   *  legt das offen (§8). */
  begruendungModus?: 'maske' | 'platzhalter';
  // Klagebewilligung / Ausnahme (Art. 221 Abs. 2 lit. b)
  klagebewilligungVorhanden: boolean;
  klagebewilligungDatum: string;
  ausnahme: KvAusnahme;
  ausnahmeText?: string;
  vollmachtBeilage: boolean;
  weitereBeilagen: { bezeichnung: string }[];
  ort: string;
  datum: string;
};

export const KO_DEFAULTS: KoAnswers = {
  vermoegensrechtlich: true,
  mietePacht: false,
  einzigeInstanz: false,
  streitwert: '',
  gerichtsKanton: 'ZH',
  klaeger: { ...SG_PERSON_NATUERLICH },
  beklagte: { ...SG_PERSON_NATUERLICH },
  begehrenTyp: 'beziffert',
  rechtsoeffnung: false,
  freieRechtsbegehren: [],
  weitereRechtsbegehren: [],
  streitgegenstand: '',
  tatsachen: [{ text: '', beweise: [] }],
  rechtlicheBegruendung: [],
  klagebewilligungVorhanden: true,
  klagebewilligungDatum: '',
  ausnahme: '',
  vollmachtBeilage: false,
  weitereBeilagen: [],
  ort: '',
  datum: '',
};

// ── Prefill-Brücke (Zuständigkeits-Wizard → ordentliche Klage) ──────────────

export function koPrefillKodieren(p: { streitwertCHF?: number | null; kanton?: Kanton; ohneKlagebewilligung?: boolean }): string {
  const q = new URLSearchParams();
  if (p.streitwertCHF != null && Number.isFinite(p.streitwertCHF) && p.streitwertCHF >= 0) {
    q.set('streitwert', String(p.streitwertCHF));
  }
  if (p.kanton) q.set('kanton', p.kanton);
  if (p.ohneKlagebewilligung) q.set('kb', '0');
  return q.toString();
}

export function koPrefillLesen(search: string): Partial<KoAnswers> | null {
  const q = new URLSearchParams(search);
  const aus: Partial<KoAnswers> = {};
  const sw = q.get('streitwert');
  if (sw && /^\d+(\.\d{1,2})?$/.test(sw)) aus.streitwert = sw;
  const kt = q.get('kanton');
  if (kt && (KANTONE as readonly string[]).includes(kt)) aus.gerichtsKanton = kt as Kanton;
  if (q.get('kb') === '0') aus.klagebewilligungVorhanden = false;
  return Object.keys(aus).length > 0 ? aus : null;
}

// ── Streitwert / Mängel / Hinweise ──────────────────────────────────────────

export function koStreitwert(a: KoAnswers): number | null {
  const roh = String(a.streitwert ?? '').replace(/['\s]/g, '').replace(',', '.');
  if (roh === '') return null;
  const n = Number(roh);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export type KoMangel = { schritt: number; text: string };

export function koMaengel(a: KoAnswers): KoMangel[] {
  const m: KoMangel[] = [];
  const sw = koStreitwert(a);
  // Verfahrens-Weiche (Art. 243 Abs. 1 ZPO): bis CHF 30'000 gilt das
  // VEREINFACHTE Verfahren — dafür existiert die eigene Vorlage.
  if (a.vermoegensrechtlich && !a.einzigeInstanz && sw !== null && sw <= ZPO_SCHWELLEN.VEREINFACHT) {
    m.push({ schritt: 0, text: `Streitwert bis CHF ${fmtCHF(String(ZPO_SCHWELLEN.VEREINFACHT))}: Es gilt das VEREINFACHTE Verfahren (Art. 243 Abs. 1 ZPO) — bitte die Vorlage «Klage (vereinfachtes Verfahren)» verwenden. Ausnahme: vor der einzigen kantonalen Instanz gilt das ordentliche Verfahren (Art. 243 Abs. 3 ZPO) — dann oben ankreuzen.` });
  }
  if (a.vermoegensrechtlich && sw === null) {
    m.push({ schritt: 0, text: 'Streitwert angeben (Pflichtinhalt, Art. 221 Abs. 1 lit. c ZPO; Berechnung nach Art. 91 ZPO – ohne Zinsen und Kosten).' });
  }
  // Gerichts-Gate (alle Kantone; BS löst über die abgenommene Adresse auf)
  if (a.gerichtsKanton !== 'BS'
      && !(a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell))
      && (a.gerichtAufgeloest?.zeilen.length ?? 0) < 3) {
    m.push({ schritt: 0, text: `Zuständiges Gericht für den Kanton ${a.gerichtsKanton} bestimmen (Gericht wählen) — oder die Adresse von Hand erfassen.` });
  }
  if (a.gerichtManuellAktiv && !behoerdeManuellVollstaendig(a.gerichtManuell)) {
    m.push({ schritt: 0, text: 'Gerichtsadresse von Hand: Name, Strasse mit Hausnummer und PLZ/Ort vollständig erfassen.' });
  }
  if (!parteiVollstaendig(a.klaeger)) m.push({ schritt: 1, text: 'Klagende Partei vollständig bezeichnen (Art. 221 Abs. 1 lit. a ZPO).' });
  if (!parteiVollstaendig(a.beklagte)) m.push({ schritt: 1, text: 'Beklagte Partei vollständig bezeichnen (Art. 221 Abs. 1 lit. a ZPO).' });
  if (a.begehrenTyp === 'beziffert' && (a.streitwert ?? '') === '') {
    m.push({ schritt: 2, text: 'Forderungsbetrag beziffern (Art. 84 Abs. 2 ZPO) — oder Begehren-Typ wechseln.' });
  }
  if (a.begehrenTyp === 'unbeziffert' && !(a.unbeziffertMindest ?? '').trim()) {
    m.push({ schritt: 2, text: 'Unbezifferte Forderungsklage: Mindestwert angeben (Art. 85 Abs. 1 ZPO).' });
  }
  if (a.begehrenTyp === 'frei' && a.freieRechtsbegehren.filter((r) => r.trim()).length === 0) {
    m.push({ schritt: 2, text: 'Mindestens ein Rechtsbegehren formulieren (Art. 221 Abs. 1 lit. b ZPO).' });
  }
  if (!a.streitgegenstand.trim()) m.push({ schritt: 2, text: 'Streitgegenstand kurz bezeichnen (Rubrum).' });
  // PFLICHT-Begründung (Art. 221 Abs. 1 lit. d/e) — im Platzhalter-Modus
  // (Auftrag David 11.6.2026) hält das Gate nicht an: das Dokument trägt
  // die Lücken sichtbar, der Hinweis legt die Ergänzungspflicht offen (§8).
  if (a.begruendungModus !== 'platzhalter') {
    if (a.tatsachen.filter((t) => t.text.trim()).length === 0) {
      m.push({ schritt: 3, text: 'Mindestens eine Tatsachenbehauptung ausführen (Pflichtinhalt, Art. 221 Abs. 1 lit. d ZPO) — oder im Begründungs-Schritt «später ausfüllen» wählen (Platzhalter im Dokument).' });
    }
    if (a.tatsachen.some((t) => t.text.trim() && t.beweise.filter((b) => b.bezeichnung.trim()).length === 0)) {
      m.push({ schritt: 3, text: 'Zu jeder behaupteten Tatsache die Beweismittel bezeichnen (Art. 221 Abs. 1 lit. e ZPO) — notfalls «Parteibefragung».' });
    }
  }
  if (a.ausnahme === 'verzicht_gemeinsam' && a.vermoegensrechtlich && sw !== null && sw < ZPO_SCHWELLEN.VERZICHT_GEMEINSAM) {
    m.push({ schritt: 4, text: `Gemeinsamer Verzicht setzt einen Streitwert von mindestens CHF ${fmtCHF(String(ZPO_SCHWELLEN.VERZICHT_GEMEINSAM))} voraus (Art. 199 Abs. 1 ZPO) — der angegebene Streitwert liegt darunter.` });
  }
  if (!a.klagebewilligungVorhanden && !a.ausnahme) {
    m.push({ schritt: 4, text: 'Klagebewilligung beilegen (Art. 221 Abs. 2 lit. b ZPO) ODER Verzicht/Ausnahme nach Art. 198/199 ZPO angeben.' });
  }
  if (a.klagebewilligungVorhanden && !a.klagebewilligungDatum) {
    m.push({ schritt: 4, text: 'Datum der Klagebewilligung angeben (Klagefrist, Art. 209 Abs. 3 ZPO).' });
  }
  if (!a.datum) m.push({ schritt: 5, text: 'Datum angeben (Art. 221 Abs. 1 lit. f ZPO).' });
  return m;
}

// Handelsgerichts-Kantone (Art. 6 ZPO) — Hinweis, kein Routing.
const HG_KANTONE: readonly Kanton[] = ['ZH', 'BE', 'AG', 'SG'] as const;

export function koHinweise(a: KoAnswers): string[] {
  const h: string[] = [];
  if (a.begruendungModus === 'platzhalter') {
    h.push('Begründung als Platzhalter: Tatsachenbehauptungen mit Beweismitteln je Behauptung sind PFLICHTINHALT der Klage (Art. 221 Abs. 1 lit. d/e ZPO) — die Lücken im Dokument vor der Einreichung vollständig ausfüllen; das Beweismittelverzeichnis entsprechend ergänzen.');
  }
  if (a.klagebewilligungVorhanden && a.klagebewilligungDatum) {
    // Art. 209 Abs. 4 ZPO gilt für ALLE Miete-/Pachtstreitigkeiten
    // Wohn-/Geschäftsräume (auch ordentlich, Bug-Check B1 10.6.2026).
    const f = kvKlagefrist(a.klagebewilligungDatum, a.mietePacht ? 'miete_kernbereich' : 'vermoegensrechtlich', a.gerichtsKanton);
    if (f) h.push(`Klagefrist: Einreichung innert ${a.mietePacht ? '30 Tagen (Art. 209 Abs. 4 ZPO — Miete/Pacht)' : '3 Monaten (Art. 209 Abs. 3 ZPO)'} seit Eröffnung der Klagebewilligung — Ablauf ${f.ablauf}${f.stillstandAktiv ? ' (Gerichtsferien berücksichtigt, Art. 145 ZPO)' : ''}.`);
  }
  if (a.vermoegensrechtlich) {
    h.push('Materien nach Art. 243 Abs. 2 ZPO (z. B. Kernbereich Miete, GlG) laufen streitwertUNabhängig im vereinfachten Verfahren — dafür die Vorlage «Klage (vereinfachtes Verfahren)» verwenden.');
  }
  if (a.vermoegensrechtlich && HG_KANTONE.includes(a.gerichtsKanton)) {
    h.push(`Der Kanton ${a.gerichtsKanton} führt ein Handelsgericht — bei handelsrechtlichen Streitigkeiten kann es zuständig sein (Voraussetzungen Art. 6 Abs. 2 lit. a–d ZPO prüfen; teils Wahlrecht nach Abs. 3); diese Vorlage adressiert das ordentliche Zivilgericht.`);
  }
  h.push('Das Gericht kann von der klagenden Partei einen Vorschuss bis zur Hälfte der mutmasslichen Gerichtskosten verlangen (Art. 98 ZPO).');
  h.push('Das Beweismittelverzeichnis (Art. 221 Abs. 2 lit. d ZPO) wird aus den bezeichneten Beweismitteln automatisch erstellt; verfügbare Urkunden sind beizulegen (lit. c).');
  return h;
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const KO_SCHEMA: VorlageSchema = {
  id: 'klage-ordentlich',
  format: 'eingabe',
  version: '1.0.0 (ZPO-Fassung seit 1.1.2025)',
  titel: 'Klage im ordentlichen Verfahren',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Klage im ordentlichen Verfahren nach ' +
    'Art. 219 ff. ZPO; einzureichen unterschrieben im Doppel (Art. 131 ZPO), mit Klagebewilligung ' +
    'bzw. Verzichts-/Ausnahme-Nachweis und den verfügbaren Beweisurkunden als Beilagen ' +
    '(Art. 221 Abs. 2 ZPO). Die örtliche und sachliche Zuständigkeit des angeschriebenen ' +
    'Gerichts ist selbst zu prüfen; Fristen (Art. 209 Abs. 3 ZPO) eigenverantwortlich wahren.',
  bausteine: [
    { id: 'O01_absender', rolle: 'absender', text: '{{klaegerBlock}}{{vertretungZeile}}',
      begruendung: 'Absenderin = klagende Partei (bzw. Vertretung).', norm: 'Art. 221 Abs. 1 lit. a ZPO' },
    { id: 'O02_adressat', rolle: 'adressat', text: '{{gerichtBlock}}',
      begruendung: 'Erstinstanzliches Zivilgericht des gewählten Kantons (kantonale Gerichtsschicht; Handeingabe möglich).', norm: 'Art. 4 ZPO' },
    { id: 'O03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}',
      begruendung: 'Ort und Datum der Eingabe.', norm: 'Art. 221 Abs. 1 lit. f ZPO' },
    { id: 'O04_betreff', rolle: 'betreff', text: 'Klage (ordentliches Verfahren, Art. 219 ff. ZPO){{streitwertBetreffZeile}}',
      begruendung: 'Betreff mit Verfahrensart und Streitwertangabe.', norm: 'Art. 221 Abs. 1 lit. c ZPO' },
    { id: 'O05_rubrum', rolle: 'rubrum',
      text: 'in Sachen\n{{klaegerRubrum}}\n(klagende Partei)\n\ngegen\n\n{{beklagteRubrum}}\n(beklagte Partei)\n\nbetreffend {{streitgegenstandKurz}}',
      begruendung: 'Rubrum mit Parteien und Streitgegenstand.', norm: 'Art. 221 Abs. 1 lit. a ZPO' },
    { id: 'O06_begehren', ueberschrift: 'Rechtsbegehren', text: '{{item.text}}',
      wiederholeUeber: 'rechtsbegehrenListe', nummeriert: true,
      begruendung: 'Bezifferte (Art. 84 Abs. 2), unbezifferte (Art. 85) oder frei formulierte Begehren; Kostenfolge.', norm: 'Art. 221 Abs. 1 lit. b ZPO' },
    { id: 'O07_formelles', ueberschrift: 'Formelles', text: '{{formellesText}}',
      begruendung: 'Zuständigkeit, Verfahrensart, Klagebewilligung/Verzicht/Ausnahme.', norm: 'Art. 219/209 ZPO' },
    { id: 'O08_tatsachen_intro', ueberschrift: 'Begründung',
      text: 'I. Tatsächliches',
      includeIf: { feld: 'tatsachenListe', nichtLeer: true },
      begruendung: 'Pflicht-Begründung: Tatsachenbehauptungen mit Beweismitteln je Behauptung.', norm: 'Art. 221 Abs. 1 lit. d/e ZPO' },
    { id: 'O08b_tatsachen', text: '{{item.text}}',
      wiederholeUeber: 'tatsachenListe',
      begruendung: 'Je Ziffer eine Behauptung; darunter die Beweisofferte («Beweis: …»).', norm: 'Art. 221 Abs. 1 lit. d/e ZPO' },
    { id: 'O09_recht_intro', text: 'II. Rechtliches',
      includeIf: { feld: 'rechtListe', nichtLeer: true },
      begruendung: 'Fakultative rechtliche Begründung.', norm: 'Art. 221 Abs. 3 ZPO' },
    { id: 'O09b_recht', text: '{{item.text}}',
      includeIf: { feld: 'rechtListe', nichtLeer: true }, wiederholeUeber: 'rechtListe',
      begruendung: 'Rechtliche Erwägungen, je Ziffer.', norm: 'Art. 221 Abs. 3 ZPO' },
    { id: 'O10_beweisverzeichnis', ueberschrift: 'Beweismittelverzeichnis', text: '– {{item.text}}',
      includeIf: { feld: 'beweisverzeichnisListe', nichtLeer: true }, wiederholeUeber: 'beweisverzeichnisListe',
      begruendung: 'Verzeichnis aller bezeichneten Beweismittel — Pflichtbeilage.', norm: 'Art. 221 Abs. 2 lit. d ZPO' },
    { id: 'O11_beilagen', ueberschrift: 'Beilagen', text: '– {{item.text}}',
      includeIf: { feld: 'beilagenListe', nichtLeer: true }, wiederholeUeber: 'beilagenListe',
      begruendung: 'Vollmacht, Klagebewilligung/Verzicht, verfügbare Beweisurkunden.', norm: 'Art. 221 Abs. 2 ZPO' },
    { id: 'O12_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen',
      begruendung: 'Schlussformel der Eingabe.' },
    { id: 'O13_unterschrift', rolle: 'unterschrift',
      text: '_________________________________\n{{unterschriftName}}',
      begruendung: 'Eigenhändige Unterschrift (Gültigkeitserfordernis).', norm: 'Art. 221 Abs. 1 lit. f ZPO' },
    { id: 'O14_doppel',
      text: 'Einreichung im Doppel: ein Exemplar für das Gericht und je ein Exemplar für jede beklagte Partei (Art. 131 ZPO).',
      begruendung: 'Exemplare-Hinweis nach Art. 131 ZPO.', norm: 'Art. 131 ZPO' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

export function koZusammenstellen(a: KoAnswers) {
  const sw = koStreitwert(a);
  // Adressat-Kaskade (Muster KV/SG §5): Handeingabe → BS-Stammdaten →
  // kantonal aufgelöst → Striche (Mängel-Gate hält den Export an).
  const gerichtBlock = a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell)
    ? [a.gerichtManuell!.name, a.gerichtManuell!.strasse, a.gerichtManuell!.plzOrt].join('\n')
    : a.gerichtsKanton === 'BS'
      ? [KV_GERICHTE_BS.zivilgericht.name, KV_GERICHTE_BS.zivilgericht.strasse, KV_GERICHTE_BS.zivilgericht.plzOrt].join('\n')
      : (a.gerichtAufgeloest?.zeilen.length ?? 0) >= 3
        ? a.gerichtAufgeloest!.zeilen.join('\n')
        : '________\n________\n________';

  // Rechtsbegehren
  const begehren: { text: string }[] = [];
  if (a.begehrenTyp === 'beziffert') {
    const zins = a.zins?.satz?.trim() && a.zins?.abDatum
      ? `, nebst Zins zu ${a.zins.satz} % seit ${fmtDatum(a.zins.abDatum)}` : '';
    begehren.push({ text: `Die beklagte Partei sei zu verpflichten, der klagenden Partei CHF ${a.streitwert ? fmtCHF(a.streitwert) : '________'}${zins} zu bezahlen.` });
  } else if (a.begehrenTyp === 'unbeziffert') {
    begehren.push({ text: `Die beklagte Partei sei zu verpflichten, der klagenden Partei einen nach dem Beweisergebnis zu beziffernden Betrag, mindestens jedoch CHF ${a.unbeziffertMindest ? fmtCHF(a.unbeziffertMindest) : '________'}, zu bezahlen (Art. 85 ZPO${a.unbeziffertGrund?.trim() ? `; ${a.unbeziffertGrund.trim()}` : ''}).` });
  } else {
    a.freieRechtsbegehren.filter((r) => r.trim()).forEach((r) => begehren.push({ text: r.trim() }));
    if (begehren.length === 0) begehren.push({ text: '________' });
  }
  if (a.rechtsoeffnung) {
    begehren.push({ text: `Der Rechtsvorschlag in der Betreibung${a.betreibungNr?.trim() ? ` Nr. ${a.betreibungNr.trim()}` : ' ________'} sei zu beseitigen.` });
  }
  for (const w of a.weitereRechtsbegehren) if (w.trim()) begehren.push({ text: w.trim() });
  begehren.push({ text: 'Unter Kosten- und Entschädigungsfolge zulasten der beklagten Partei.' });

  // Formelles
  const formellesTeile: string[] = [
    `Sachlich zuständig ist das erstinstanzliche Zivilgericht (Kanton ${a.gerichtsKanton}); es gilt das ordentliche Verfahren (Art. 219 ff. ZPO).`,
  ];
  if (a.klagebewilligungVorhanden) {
    formellesTeile.push(`Die Klagebewilligung der Schlichtungsbehörde vom ${a.klagebewilligungDatum ? fmtDatum(a.klagebewilligungDatum) : '________'} liegt als Beilage 1 bei (Art. 209 ZPO).`);
  } else if (a.ausnahme) {
    const txt = a.ausnahme === 'verzicht_gemeinsam'
      ? `Die Parteien haben gemeinsam auf das Schlichtungsverfahren verzichtet (Art. 199 Abs. 1 ZPO; Streitwert mindestens CHF ${fmtCHF(String(ZPO_SCHWELLEN.VERZICHT_GEMEINSAM))}); die Verzichtserklärung liegt als Beilage 1 bei.`
      : a.ausnahme === 'verzicht_einseitig'
        ? 'Die klagende Partei verzichtet einseitig auf das Schlichtungsverfahren (Art. 199 Abs. 2 ZPO).'
        : `Das Schlichtungsverfahren entfällt (Art. 198 ZPO${a.ausnahmeText?.trim() ? `: ${a.ausnahmeText.trim()}` : ''}).`;
    formellesTeile.push(txt);
  }

  // Tatsachen mit Beweisofferte je Ziffer (Art. 221 Abs. 1 lit. d/e)
  // Manuelle Nummerierung (die Engine-Ziffern laufen baustein-übergreifend
  // fort — Bug-Fund 10.6.2026); Beweisofferte je Ziffer (lit. e).
  // Platzhalter-Modus (Auftrag David 11.6.2026): drei Leer-Ziffern mit
  // Beweis-Zeile zum Handausfüllen statt der Masken-Eingaben.
  const platzhalter = a.begruendungModus === 'platzhalter';
  const tatsachenListe = platzhalter
    ? [1, 2, 3].map((i) => ({ text: `${i}. ________\nBeweis: ________` }))
    : a.tatsachen
      .filter((t) => t.text.trim())
      .map((t, i) => {
        const beweise = t.beweise.map((b) => b.bezeichnung.trim()).filter(Boolean);
        return { text: `${i + 1}. ${t.text.trim()}${beweise.length > 0 ? `\nBeweis: ${beweise.join('; ')}` : ''}` };
      });

  // Beweismittelverzeichnis (Abs. 2 lit. d): dedupliziert über alle Tatsachen
  const verzeichnis: string[] = [];
  if (platzhalter) verzeichnis.push('________');
  else for (const t of a.tatsachen) for (const b of t.beweise) {
    const bez = b.bezeichnung.trim();
    if (bez && !verzeichnis.includes(bez)) verzeichnis.push(bez);
  }

  // Beilagen (Abs. 2): Klagebewilligung/Verzicht · Vollmacht · Urkunden
  const beilagen: { text: string }[] = [];
  if (a.klagebewilligungVorhanden) beilagen.push({ text: `Beilage 1: Klagebewilligung vom ${a.klagebewilligungDatum ? fmtDatum(a.klagebewilligungDatum) : '________'}` });
  else if (a.ausnahme === 'verzicht_gemeinsam') beilagen.push({ text: 'Beilage 1: Verzichtserklärung (Art. 199 Abs. 1 ZPO)' });
  if (a.vollmachtBeilage) beilagen.push({ text: `Beilage ${beilagen.length + 1}: Vollmacht` });
  for (const bez of verzeichnis) beilagen.push({ text: `Beilage ${beilagen.length + 1}: ${bez}` });
  for (const b of a.weitereBeilagen) {
    if (b.bezeichnung.trim()) beilagen.push({ text: `Beilage ${beilagen.length + 1}: ${b.bezeichnung.trim()}` });
  }

  const unterschriftName = a.vertretung?.trim() ? a.vertretung.trim() : parteiKurz(a.klaeger);

  const antworten: Antworten = {
    ...a,
    klaegerBlock: parteiZeilen(a.klaeger).join('\n'),
    vertretungZeile: a.vertretung?.trim() ? `\nvertreten durch ${a.vertretung.trim()}` : '',
    gerichtBlock,
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}${a.datum ? fmtDatum(a.datum) : '________'}`,
    streitwertBetreffZeile: a.vermoegensrechtlich
      ? `\nStreitwert: CHF ${sw !== null ? fmtCHF(String(sw)) : '________'} (Art. 221 Abs. 1 lit. c / Art. 91 ZPO)` : '',
    klaegerRubrum: parteiZeilen(a.klaeger).join(', '),
    beklagteRubrum: parteiZeilen(a.beklagte).join(', '),
    streitgegenstandKurz: a.streitgegenstand.trim() || '________',
    rechtsbegehrenListe: begehren,
    formellesText: formellesTeile.join(' '),
    tatsachenListe,
    rechtListe: platzhalter
      ? [{ text: '1. ________' }]
      : a.rechtlicheBegruendung.map((r) => r.text.trim()).filter(Boolean).map((text, i) => ({ text: `${i + 1}. ${text}` })),
    beweisverzeichnisListe: verzeichnis.map((text) => ({ text })),
    beilagenListe: beilagen,
    unterschriftName,
  };
  return assemble(KO_SCHEMA, antworten);
}
