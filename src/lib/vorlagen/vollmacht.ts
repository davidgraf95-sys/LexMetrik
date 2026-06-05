import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';

// ─── Vollmacht (Art. 32 ff. OR) – EINE Maske mit Typ-Schalter ────────────────
//
// Gemäss Grundlagen-Bericht «Rechtsgrundlagen und Gestaltungspraxis von
// Vollmachten» (5.6.2026): rechtsgeschäftliche Vollmacht zu Lebzeiten bei
// Urteilsfähigkeit, grundsätzlich FORMFREI (Art. 11 OR) → einfache
// Schriftform genügt, Ausgabe als druckfertiges Dokument (ausgabeArt
// 'fertig'). Der Vorsorgeauftrag (Art. 360 ff. ZGB) ist bewusst
// AUSGEKLAMMERT (eigene Vorlage, eigene Formvorschriften) – hier nur als
// Abgrenzungs-Weiche.
//
// Statt zweier Vorlagen (Bericht-Empfehlung 1) EINE Maske mit Typ-Schalter
// (Entscheid David 5.6.2026): gemeinsamer OR-AT-Kern (Parteien, Substitution,
// Widerruf, Dauer, Art.-35-Klausel) lebt genau einmal; typ-spezifisch sind
// nur die Umfangs-/Spezialklauseln. «Bank» ist kein eigener Typ, sondern ein
// Vertretungsbereich mit Warnung (Banken verlangen eigene Formulare).
//
// Deterministische Form-Gates (Bericht Ziff. 6):
//   1. Bürgschaft (Art. 493 Abs. 6 OR)  → SPERRE (qualifizierte Form).
//   2. Grundstücksgeschäfte (Art. 216 OR, Art. 86 GBV, Formfrage offen:
//      BGE 112 II 330 vs. Formfreiheits-Praxis) → WARNUNG + Notar-Empfehlung.
//   3. Grundbuch-/Handelsregister-/Bankgebrauch → Beglaubigungs-HINWEIS.
//   4. Bankgeschäfte → HINWEIS bankeigene Formulare.
//   5. Gesundheit/Personensorge bzw. Wirkung erst ab Urteilsunfähigkeit →
//      WEICHE zum Vorsorgeauftrag (wird hier gar nicht angeboten).

export type VollmachtTyp = 'anwalt' | 'general' | 'spezial';
export type VmGeberTyp = 'natuerlich' | 'juristisch';
export type VmSubstitution = 'verboten' | 'erlaubt';
export type VmVertretung = 'einzeln' | 'gemeinsam';

export const VOLLMACHT_TYPEN: { id: VollmachtTyp; label: string; sub: string }[] = [
  { id: 'anwalt', label: 'Anwaltsvollmacht', sub: 'Prozess- und Interessenvertretung durch eine Anwältin / einen Anwalt (Art. 68 ZPO)' },
  { id: 'general', label: 'Generalvollmacht', sub: 'Umfassende Vertretung in allen vertretungsfähigen Angelegenheiten' },
  { id: 'spezial', label: 'Spezialvollmacht', sub: 'Beschränkt auf ein bestimmtes Geschäft oder einzelne Bereiche' },
];

// Konfigurierbare Vertretungsbereiche der Spezialvollmacht (Bericht Ziff. 4) –
// Gesundheits-/Personensorge wird BEWUSST nicht angeboten (Vorsorgeauftrag).
export type VmBereich = 'behoerden' | 'vertraege' | 'post' | 'bank' | 'versicherungen' | 'immobilien' | 'prozess';

export const VM_BEREICHE: { id: VmBereich; label: string }[] = [
  { id: 'behoerden', label: 'Vertretung gegenüber Behörden und Ämtern (insbesondere Gemeinde, Steuerverwaltung, Sozialversicherungen, Migrationsamt)' },
  { id: 'vertraege', label: 'Abschluss, Änderung und Kündigung von Verträgen (z. B. Kauf, Miete)' },
  { id: 'post', label: 'Entgegennahme und Abholung von Postsendungen' },
  { id: 'bank', label: 'Vertretung gegenüber Banken und Finanzinstituten' },
  { id: 'versicherungen', label: 'Vertretung gegenüber Versicherungen und Vorsorgeeinrichtungen' },
  { id: 'immobilien', label: 'Verwaltung von Liegenschaften (Vermietung, Unterhalt, Nebenkosten)' },
  { id: 'prozess', label: 'Vertretung in Verfahren vor Behörden und Gerichten, soweit zulässig' },
];

// Besondere Ermächtigungen – Katalog wortlautnah zu Art. 396 Abs. 3 OR.
export type VmErmaechtigung = 'vergleich' | 'schiedsgericht' | 'wechsel' | 'grundstuecke' | 'schenkungen';

export const VM_ERMAECHTIGUNGEN: { id: VmErmaechtigung; label: string }[] = [
  { id: 'vergleich', label: 'einen Vergleich abzuschliessen' },
  { id: 'schiedsgericht', label: 'ein Schiedsgericht anzunehmen' },
  { id: 'wechsel', label: 'wechselrechtliche Verbindlichkeiten einzugehen' },
  { id: 'grundstuecke', label: 'Grundstücke zu veräussern oder zu belasten' },
  { id: 'schenkungen', label: 'Schenkungen zu machen' },
];

export type VmBevollmaechtigte = { name: string; angaben: string };

export type VollmachtAntworten = {
  typ: VollmachtTyp;
  // Vollmachtgeber/in
  geberTyp: VmGeberTyp;
  vorname: string;
  nachname: string;
  geburtsdatum: string;       // ISO; optional (Usanz, erleichtert Identifikation)
  adresse: string;
  firma: string;              // juristische Person
  sitz: string;
  vertretenDurch: string;     // zeichnungsberechtigtes Organ
  // Bevollmächtigte
  bevollmaechtigte: VmBevollmaechtigte[];
  vertretung: VmVertretung;   // nur relevant bei mehreren
  substitution: VmSubstitution;
  // Umfang (typ-spezifisch)
  mandatsgegenstand: string;  // anwalt: «in Sachen …»
  prozessbefugnisse: boolean; // anwalt: Vergleich/Anerkennung/Rückzug (Art. 396 Abs. 3 OR, Art. 241 ZPO)
  geheimnisentbindung: boolean; // anwalt
  geschaeft: string;          // spezial: genaue Geschäftsbezeichnung
  bereiche: VmBereich[];      // spezial: zuschaltbare Bereiche
  // Besondere Ermächtigungen (alle Typen)
  ermaechtigungen: VmErmaechtigung[];
  buergschaft: boolean;       // Form-Gate-Trigger → Sperre (Art. 493 Abs. 6 OR)
  // Dauer & Abschluss
  befristetBis: string;       // ISO; leer = unbefristet
  fortgeltungTod: boolean;    // transmortale Klausel (Art. 35 Abs. 1 OR, dispositiv)
  ort: string;
  datum: string;              // ISO; leer = von Hand zu datieren
};

export const VOLLMACHT_DEFAULTS: VollmachtAntworten = {
  typ: 'general',
  geberTyp: 'natuerlich',
  vorname: '', nachname: '', geburtsdatum: '', adresse: '',
  firma: '', sitz: '', vertretenDurch: '',
  bevollmaechtigte: [],
  vertretung: 'einzeln',
  substitution: 'verboten',
  mandatsgegenstand: '',
  prozessbefugnisse: false,
  geheimnisentbindung: false,
  geschaeft: '',
  bereiche: [],
  ermaechtigungen: [],
  buergschaft: false,
  befristetBis: '',
  fortgeltungTod: false,
  ort: '', datum: '',
};

export const VOLLMACHT_TITEL: Record<VollmachtTyp, string> = {
  anwalt: 'Anwaltsvollmacht',
  general: 'Generalvollmacht',
  spezial: 'Spezialvollmacht',
};

// ── Gates (deterministisch, Bericht Ziff. 6) ────────────────────────────────

export type VollmachtGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeVollmachtGates(a: VollmachtAntworten): VollmachtGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  if (a.bevollmaechtigte.filter((b) => b.name.trim()).length === 0) {
    blocker.push('Mindestens eine bevollmächtigte Person bezeichnen (Art. 32 Abs. 1 OR).');
  }

  if (a.typ === 'spezial' && !a.geschaeft.trim() && a.bereiche.length === 0) {
    blocker.push('Spezialvollmacht: das Geschäft genau bezeichnen oder mindestens einen Vertretungsbereich wählen – der Umfang der Vollmacht bestimmt sich nach ihrem Inhalt (Art. 33 Abs. 2 OR).');
  }

  // Trigger 1 – Bürgschaft: gesetzliche Formerstreckung auf die Vollmacht → Sperre.
  if (a.buergschaft) {
    blocker.push(
      'Bürgschaftsvollmacht: Die Vollmacht zur Eingehung einer Bürgschaft bedarf DERSELBEN Form wie die Bürgschaft (Art. 493 Abs. 6 OR) – bei natürlichen Personen über CHF 2000 öffentliche Beurkundung (Art. 493 Abs. 2 OR). ' +
      'Eine einfach-schriftliche Vollmacht genügt nicht; bitte an ein Notariat wenden. Der Export ist gesperrt, solange diese Befugnis gewählt ist.',
    );
  }

  // Trigger 2 – Grundstücksgeschäfte: Warnung + Notar-Empfehlung (Formfrage offen).
  if (a.ermaechtigungen.includes('grundstuecke')) {
    warnungen.push(
      'Grundstücke veräussern/belasten: Das Hauptgeschäft bedarf der öffentlichen Beurkundung (Art. 216 Abs. 1 OR); für den Grundbuchvollzug ist die Beglaubigung der Unterschriften erforderlich (Art. 86 GBV). ' +
      'Ob die VOLLMACHT selbst der Beurkundungsform bedarf, ist nicht eindeutig konsolidiert (ältere Linie BGE 112 II 330 vs. Formfreiheits-Praxis) – notarielle Beglaubigung/Beratung wird empfohlen.',
    );
  }

  // Trigger 4 – Bank: bankeigene Formulare.
  if (a.bereiche.includes('bank')) {
    warnungen.push(
      'Bankgeschäfte: Banken akzeptieren in der Regel nur BANKEIGENE Vollmachtsformulare. Diese Vollmacht ersetzt die beim Institut hinterlegte Bankvollmacht nicht – Formular direkt bei der Bank verlangen.',
    );
  }

  // Laienvertretung im Zivilprozess ist beschränkt (Art. 68 Abs. 2 ZPO).
  if (a.typ !== 'anwalt' && a.bereiche.includes('prozess')) {
    warnungen.push(
      'Prozessvertretung: Die BERUFSMÄSSIGE Vertretung im Zivilprozess ist Anwältinnen und Anwälten vorbehalten (Art. 68 Abs. 2 ZPO; BGE 140 III 555); nicht-berufsmässige Vertrauenspersonen sind nur beschränkt zulässig.',
    );
  }

  // Trigger 3 – Beglaubigungs-Usanz (Grundbuch/Handelsregister/Bank).
  if (a.bereiche.includes('bank') || a.bereiche.includes('immobilien') || a.ermaechtigungen.includes('grundstuecke')) {
    hinweise.push(
      'Für den Gebrauch gegenüber Grundbuch, Handelsregister oder Banken ist die Beglaubigung der Unterschrift Usanz (kantonal organisiert: Notariat, teilweise Gemeinde; Gebühren variieren stark).',
    );
  }

  if (a.bereiche.includes('post')) {
    hinweise.push(
      'Post: Für die Abholung avisierter Sendungen verwendet die Schweizerische Post ein eigenes Vollmachtsformular; Sendungen mit Zusatzleistung «eigenhändig» sind ausgenommen.',
    );
  }

  // Trigger 5 – Weiche zum Vorsorgeauftrag bei transmortaler/Dauer-Klausel.
  if (a.fortgeltungTod) {
    hinweise.push(
      'Fortgeltung über Tod/Urteilsunfähigkeit hinaus ist zulässig (Art. 35 Abs. 1 OR, dispositiv), deckt die Vorsorge aber nur unvollkommen: Banken und Behörden akzeptieren blosse Dauervollmachten bei eingetretener Urteilsunfähigkeit nicht zuverlässig. ' +
      'Für diesen Fall ist der VORSORGEAUFTRAG (Art. 360 ff. ZGB, eigene Vorlage) das gesetzlich vorgesehene Instrument.',
    );
  }

  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const VOLLMACHT_SCHEMA: VorlageSchema = {
  id: 'vollmacht',
  version: '1.0.0 (Rechtsstand Art. 32–40 OR; Bericht 5.6.2026)',
  titel: 'Vollmacht', // wird je Typ überschrieben (vollmachtZusammenstellen)
  format: 'vertrag',
  ausgabeArt: 'fertig', // einfache Schriftform genügt (Art. 11 OR) → druckfertig
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Die Vollmacht ist grundsätzlich formfrei ' +
    '(Art. 11 OR); die unterzeichnete schriftliche Fassung dient dem Ausweis gegenüber Dritten ' +
    '(Art. 33 Abs. 3 OR). Formbedürftige Geschäfte (z. B. Bürgschaft, Grundstückkauf) und der ' +
    'Vorsorgefall (Vorsorgeauftrag, Art. 360 ff. ZGB) sind gesondert zu regeln.',
  bausteine: [
    {
      id: 'VM01_geber_natuerlich',
      text:
        'Ich, {{vorname}} {{nachname}},{{geburtsdatumSatz}} wohnhaft {{adresse}} ' +
        '(Vollmachtgeber/in), erteile hiermit die folgende Vollmacht:',
      includeIf: { feld: 'geberTyp', eq: 'natuerlich' },
      begruendung: 'Identifikation der vollmachtgebenden natürlichen Person – immer enthalten.',
      norm: 'Art. 32 Abs. 1 OR',
    },
    {
      id: 'VM01_geber_juristisch',
      text:
        '{{firma}}, mit Sitz in {{sitz}}, vertreten durch {{vertretenDurch}} ' +
        '(Vollmachtgeberin), erteilt hiermit die folgende Vollmacht:',
      includeIf: { feld: 'geberTyp', eq: 'juristisch' },
      begruendung: 'Identifikation der vollmachtgebenden juristischen Person samt Vertretungsorgan – immer enthalten.',
      norm: 'Art. 32 Abs. 1 OR',
    },
    {
      id: 'VM02_bevollmaechtigte',
      ueberschrift: 'Bevollmächtigte Person(en)',
      text: 'Bevollmächtigt wird/werden:',
      includeIf: { feld: 'bevollmaechtigteListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mindestens eine bevollmächtigte Person bezeichnet wurde.',
      norm: 'Art. 32 Abs. 1 OR',
    },
    {
      id: 'VM02b_bevollmaechtigteliste',
      text: '– {{item.name}}{{item.angabenZeile}}',
      includeIf: { feld: 'bevollmaechtigteListe', nichtLeer: true },
      wiederholeUeber: 'bevollmaechtigteListe',
      begruendung: 'Je bevollmächtigte Person eine Zeile (Identifikation für die Kundgabe an Dritte).',
      norm: 'Art. 33 Abs. 3 OR',
    },
    {
      id: 'VM03_einzeln',
      text: 'Mehrere Bevollmächtigte sind je einzeln zur Vertretung berechtigt.',
      includeIf: { and: [{ feld: 'mehrere', eq: true }, { feld: 'vertretung', eq: 'einzeln' }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mehrere Bevollmächtigte mit Einzelvertretung gewählt wurden (Usanz «je einzeln»).',
      norm: 'Art. 33 Abs. 2 OR',
    },
    {
      id: 'VM03_gemeinsam',
      text: 'Mehrere Bevollmächtigte sind nur gemeinsam zur Vertretung berechtigt (Kollektivvollmacht).',
      includeIf: { and: [{ feld: 'mehrere', eq: true }, { feld: 'vertretung', eq: 'gemeinsam' }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil mehrere Bevollmächtigte mit gemeinsamer Vertretung gewählt wurden.',
      norm: 'Art. 33 Abs. 2 OR',
    },
    // ── Umfang: Anwaltsvollmacht ────────────────────────────────────────────
    {
      id: 'VM10_umfang_anwalt',
      ueberschrift: 'Umfang der Vollmacht',
      text:
        'Die bevollmächtigte Person wird ermächtigt, die vollmachtgebende Person in Sachen ' +
        '{{mandatsgegenstand}} vor allen Gerichten und Behörden sowie gegenüber Privaten zu ' +
        'vertreten und alles zu tun oder zu unterlassen, was sie zur Wahrung der übertragenen ' +
        'Interessen für notwendig oder angemessen hält. Eingeschlossen sind insbesondere die ' +
        'Einreichung von Klagen und Rechtsmitteln, der Vollzug von Urteilen, die Empfangnahme ' +
        'und Herausgabe von Zahlungen sowie die Anhebung und Durchführung von Schuldbetreibungen ' +
        'und die Stellung von Konkursbegehren.',
      includeIf: { feld: 'typ', eq: 'anwalt' },
      nummeriert: true,
      begruendung: 'Umfangsklausel der Anwaltsvollmacht (Usanz SAV-Kanzleien); die Prozessvollmacht deckt alle Prozesshandlungen, die das Verfahren mit sich bringt.',
      norm: 'Art. 33 Abs. 2 OR',
      hinweis: 'Der Ausweis gegenüber Gericht/Behörde erfolgt durch diese schriftliche Vollmacht (Art. 68 Abs. 3 ZPO; Art. 129 Abs. 2 StPO; Art. 11 Abs. 2 VwVG).',
    },
    {
      id: 'VM11_prozessbefugnisse',
      text:
        'Die bevollmächtigte Person ist ausdrücklich ermächtigt, Vergleiche abzuschliessen sowie ' +
        'Klagen anzuerkennen und zurückzuziehen.',
      includeIf: { and: [{ feld: 'typ', eq: 'anwalt' }, { feld: 'prozessbefugnisse', eq: true }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil die Vergleichs-/Anerkennungs-/Rückzugsbefugnis ausdrücklich erteilt wurde – materielle Verfügungshandlungen brauchen die besondere Ermächtigung.',
      norm: 'Art. 396 Abs. 3 OR',
      hinweis: 'Vergleich, Klageanerkennung und Klagerückzug beenden das Verfahren mit Entscheidwirkung (Art. 241 ZPO); die Lehre stellt strenge Anforderungen an die Spezifizierung.',
    },
    {
      id: 'VM12_geheimnisentbindung',
      text:
        'Dritte – namentlich Anwältinnen und Anwälte, Ärztinnen und Ärzte, Spitäler, ' +
        'Versicherungen, Banken und Behörden – werden gegenüber der bevollmächtigten Person von ' +
        'ihrer Schweige- und Geheimhaltungspflicht entbunden. Diese Entbindung kann jederzeit ' +
        'schriftlich widerrufen werden.',
      includeIf: { and: [{ feld: 'typ', eq: 'anwalt' }, { feld: 'geheimnisentbindung', eq: true }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil die Geheimnisentbindung zur Aktenbeschaffung gewählt wurde (Usanz in Anwaltsvollmachten).',
    },
    // ── Umfang: Generalvollmacht ────────────────────────────────────────────
    {
      id: 'VM20_umfang_general',
      ueberschrift: 'Umfang der Vollmacht',
      text:
        'Die bevollmächtigte Person wird ermächtigt, die vollmachtgebende Person in allen ' +
        'Rechtshandlungen und Geschäften zu vertreten, für die eine Stellvertretung gesetzlich ' +
        'zulässig ist (Generalvollmacht).',
      includeIf: { feld: 'typ', eq: 'general' },
      nummeriert: true,
      begruendung: 'Umfangsklausel der Generalvollmacht (Mustertext Bericht Ziff. 5).',
      norm: 'Art. 33 Abs. 2 OR',
    },
    {
      id: 'VM21_grenze_hoechstpersoenlich',
      text:
        'Ausgenommen bleiben höchstpersönliche Rechte, die keiner Vertretung zugänglich sind – ' +
        'insbesondere die Errichtung einer letztwilligen Verfügung, die Eheschliessung und die ' +
        'Anerkennung eines Kindes.',
      includeIf: { feld: 'typ', eq: 'general' },
      nummeriert: true,
      begruendung: 'Feste Grenze jeder Generalvollmacht: absolut höchstpersönliche Rechte sind vertretungsfeindlich.',
      norm: 'Art. 19c ZGB',
    },
    // ── Umfang: Spezialvollmacht ────────────────────────────────────────────
    {
      id: 'VM30_spezial_geschaeft',
      ueberschrift: 'Umfang der Vollmacht',
      text:
        'Die bevollmächtigte Person wird ermächtigt, die vollmachtgebende Person in folgender ' +
        'Angelegenheit zu vertreten: {{geschaeft}}',
      includeIf: { and: [{ feld: 'typ', eq: 'spezial' }, { feld: 'geschaeft', nichtLeer: true }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil ein bestimmtes Geschäft bezeichnet wurde (Spezialvollmacht).',
      norm: 'Art. 33 Abs. 2 OR',
    },
    {
      id: 'VM31a_bereiche_zusatz',
      text: 'Die Vollmacht umfasst zudem die folgenden Vertretungsbereiche:',
      includeIf: { and: [{ feld: 'typ', eq: 'spezial' }, { feld: 'bereicheListe', nichtLeer: true }, { feld: 'geschaeft', nichtLeer: true }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil zusätzlich zum bezeichneten Geschäft Vertretungsbereiche gewählt wurden.',
      norm: 'Art. 33 Abs. 2 OR',
    },
    {
      id: 'VM31b_bereiche',
      ueberschrift: 'Umfang der Vollmacht',
      text: 'Die Vollmacht umfasst die folgenden Vertretungsbereiche:',
      includeIf: { and: [{ feld: 'typ', eq: 'spezial' }, { feld: 'bereicheListe', nichtLeer: true }, { not: { feld: 'geschaeft', nichtLeer: true } }] },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Vertretungsbereiche (ohne einzelnes Geschäft) gewählt wurden.',
      norm: 'Art. 33 Abs. 2 OR',
    },
    {
      id: 'VM31c_bereicheliste',
      text: '– {{item.label}};',
      includeIf: { and: [{ feld: 'typ', eq: 'spezial' }, { feld: 'bereicheListe', nichtLeer: true }] },
      wiederholeUeber: 'bereicheListe',
      begruendung: 'Je gewählter Vertretungsbereich eine Zeile (sachliche Beschränkung).',
      norm: 'Art. 33 Abs. 2 OR',
    },
    {
      id: 'VM32_beschraenkung',
      text: 'Die Vollmacht ist auf die vorstehend bezeichneten Angelegenheiten und Bereiche beschränkt.',
      includeIf: { feld: 'typ', eq: 'spezial' },
      nummeriert: true,
      begruendung: 'Klarstellung der sachlichen Beschränkung – Überschreitung führt zum Handeln ohne Vertretungsmacht (Art. 38 f. OR).',
      norm: 'Art. 33 Abs. 2 OR',
    },
    // ── Besondere Ermächtigungen (alle Typen, Art. 396 Abs. 3 OR) ───────────
    {
      id: 'VM40_ermaechtigungen',
      ueberschrift: 'Besondere Ermächtigungen',
      text: 'Die bevollmächtigte Person ist ausdrücklich ermächtigt:',
      includeIf: { feld: 'ermaechtigungenListe', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Geschäfte gewählt wurden, die eine besondere Ermächtigung verlangen – sie gelten ohne ausdrückliche Nennung als NICHT erteilt.',
      norm: 'Art. 396 Abs. 3 OR',
    },
    {
      id: 'VM40b_ermaechtigungenliste',
      text: '– {{item.label}};',
      includeIf: { feld: 'ermaechtigungenListe', nichtLeer: true },
      wiederholeUeber: 'ermaechtigungenListe',
      begruendung: 'Je besondere Ermächtigung eine Zeile (Katalog wortlautnah zu Art. 396 Abs. 3 OR).',
      norm: 'Art. 396 Abs. 3 OR',
    },
    // ── Substitution ────────────────────────────────────────────────────────
    {
      id: 'VM50_substitution_erlaubt',
      ueberschrift: 'Substitution',
      text: 'Die bevollmächtigte Person ist berechtigt, eine Untervollmacht zu erteilen (Substitution).',
      includeIf: { feld: 'substitution', eq: 'erlaubt' },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Substitution erlaubt wurde – bei befugter Substitution haftet die beauftragte Person nur für gehörige Auswahl und Instruktion.',
      norm: 'Art. 399 Abs. 2 OR',
    },
    {
      id: 'VM51_substitution_verboten',
      ueberschrift: 'Substitution',
      text: 'Die Erteilung einer Untervollmacht ist ausgeschlossen.',
      includeIf: { feld: 'substitution', eq: 'verboten' },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil Substitution ausgeschlossen wurde (persönliche Besorgungspflicht).',
      norm: 'Art. 398 Abs. 3 OR',
    },
    // ── Dauer, Widerruf, Erlöschen ──────────────────────────────────────────
    {
      id: 'VM60_befristung',
      text: 'Diese Vollmacht ist befristet und gilt bis zum {{befristetBis}}.',
      includeIf: { feld: 'befristetBis', nichtLeer: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil eine Befristung gewählt wurde (zeitliche Beschränkung der Ermächtigung).',
      norm: 'Art. 33 Abs. 2 OR',
    },
    {
      id: 'VM61_widerruf',
      text:
        'Diese Vollmacht kann jederzeit beschränkt oder widerrufen werden. Gegenüber ' +
        'gutgläubigen Dritten, denen die Vollmacht kundgegeben wurde, wird der Widerruf erst ' +
        'mit dessen Mitteilung wirksam.',
      nummeriert: true,
      begruendung: 'Deklaratorische Widerrufsklausel – das Widerrufsrecht ist zwingend, ein Vorausverzicht ungültig (Art. 34 Abs. 2 OR).',
      norm: 'Art. 34 OR',
    },
    {
      id: 'VM62_fortgeltung',
      text:
        'Diese Vollmacht erlischt nicht mit dem Tod, der Verschollenerklärung oder dem Verlust ' +
        'der Handlungsfähigkeit der vollmachtgebenden Person.',
      includeIf: { feld: 'fortgeltungTod', eq: true },
      nummeriert: true,
      begruendung: 'Aufgenommen, weil die Fortgeltung über Tod/Handlungsunfähigkeit hinaus gewählt wurde – Art. 35 Abs. 1 OR ist dispositiv.',
      norm: 'Art. 35 Abs. 1 OR',
      hinweis: 'Für die Vorsorge bei Urteilsunfähigkeit ist der Vorsorgeauftrag (Art. 360 ff. ZGB) das massgebliche Instrument; Banken/Behörden akzeptieren blosse Dauervollmachten dann nicht zuverlässig.',
    },
    // ── Unterschrift ────────────────────────────────────────────────────────
    {
      id: 'VM70_unterschrift', rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\n\n_________________________________\n{{unterschriftZeile}}',
      begruendung: 'Unterschriftsblock der vollmachtgebenden Person – die unterzeichnete Urkunde dient als Ausweis gegenüber Dritten.',
      norm: 'Art. 33 Abs. 3 OR',
    },
  ],
};

// ── Antworten aufbereiten und zusammenstellen ───────────────────────────────

export function vollmachtZusammenstellen(a: VollmachtAntworten) {
  const datum = a.datum ? a.datum.split('-').reverse().join('.') : '________';
  const geburtsdatum = a.geburtsdatum ? a.geburtsdatum.split('-').reverse().join('.') : '';

  const bevollmaechtigteListe = a.bevollmaechtigte
    .filter((b) => b.name.trim())
    .map((b) => ({
      name: b.name.trim(),
      angabenZeile: b.angaben.trim() ? ` (${b.angaben.trim()});` : ';',
    }));

  const antworten: Antworten = {
    ...a,
    geburtsdatumSatz: geburtsdatum ? ` geboren am ${geburtsdatum},` : '',
    bevollmaechtigteListe,
    mehrere: bevollmaechtigteListe.length > 1,
    bereicheListe: VM_BEREICHE.filter((b) => a.bereiche.includes(b.id)).map((b) => ({ label: b.label })),
    ermaechtigungenListe: VM_ERMAECHTIGUNGEN.filter((e) => a.ermaechtigungen.includes(e.id)).map((e) => ({ label: e.label })),
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}den ${datum}`,
    unterschriftZeile: a.geberTyp === 'juristisch'
      ? `Für ${a.firma.trim() || '________'}: ${a.vertretenDurch.trim() || '________'}`
      : `${a.vorname.trim() || '________'} ${a.nachname.trim() || '________'} (Vollmachtgeber/in)`,
  };

  const erg = assemble(VOLLMACHT_SCHEMA, antworten);
  erg.dokument.titel = VOLLMACHT_TITEL[a.typ];
  return erg;
}
