import type { VorlageSchema } from './engine';

// ── 3 · WAHLANNAHME VR (fertig; ZH verbatim) ────────────────────────────────

export const WAHLANNAHME_SCHEMA: VorlageSchema = {
  id: 'ag-wahlannahme',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Wahlannahmeerklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); ' +
    'entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die gewählte Person ' +
    'die Handelsregister-Anmeldung selbst unterzeichnet (Praxis ZH/LU/BE).',
  bausteine: [
    { id: 'AW01_absender', rolle: 'absender', text: '{{personName}}\n{{personAdresse}}', begruendung: 'Absenderin/Absender ist die gewählte Person.' },
    { id: 'AW02_adressat', rolle: 'adressat', text: '{{firma}}\n{{zuHandenZeile}}\n{{sitz}}', begruendung: 'Adressatin ist die Gesellschaft (in Gründung); z.-H.-Zeile im passenden Numerus (D1).' },
    { id: 'AW03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AW04_betreff', rolle: 'betreff', text: 'Wahlannahmeerklärung', begruendung: 'Betreff nach amtlicher ZH-Vorlage.' },
    { id: 'AW05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach amtlicher ZH-Vorlage.' },
    {
      id: 'AW06_text',
      text: 'Gerne bestätige ich Ihnen, dass ich die Wahl als Mitglied des Verwaltungsrates der {{firma}}, in {{sitz}}, annehme.',
      norm: 'Art. 43 Abs. 1 lit. c HRegV',
      begruendung: 'Annahme-Kernsatz – verbatim nach der amtlichen ZH-Vorlage (ag_vorlage_wahlannahme_vr).',
    },
    { id: 'AW07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlage.' },
    { id: 'AW08_unterschrift', rolle: 'unterschrift', text: '_________________________________\n{{personName}}', begruendung: 'Original-Unterschrift der gewählten Person.' },
  ],
};

// ── 3b · WAHLANNAHME REVISIONSSTELLE (fertig; Beleg lit. d) ─────────────────

export const WAHLANNAHME_RS_SCHEMA: VorlageSchema = {
  id: 'ag-wahlannahme-rs',
  version: '1.0.0 (Haus-Fassung analog ZH-VR-Vorlage; Original-Suite 7.6.2026)',
  titel: 'Wahlannahmeerklärung der Revisionsstelle',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); ' +
    'entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die Revisionsstelle ' +
    'die Handelsregister-Anmeldung mitunterzeichnet (Merkblatt HRegA ZH).',
  bausteine: [
    { id: 'AR01_absender', rolle: 'absender', text: '{{revisionsstelleName}}\n{{revisionsstelleSitz}}', begruendung: 'Absenderin ist die gewählte Revisionsstelle.' },
    { id: 'AR02_adressat', rolle: 'adressat', text: '{{firma}}\n{{zuHandenZeile}}\n{{sitz}}', begruendung: 'Adressatin ist die Gesellschaft (in Gründung).' },
    { id: 'AR03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AR04_betreff', rolle: 'betreff', text: 'Wahlannahmeerklärung', begruendung: 'Betreff analog der amtlichen ZH-Vorlage für VR-Mitglieder.' },
    { id: 'AR05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach ZH-Vorlagen-Anatomie.' },
    {
      id: 'AR06_text',
      text: 'Gerne bestätigen wir Ihnen, dass wir die Wahl als Revisionsstelle der {{firma}}, in {{sitz}}, annehmen.',
      norm: 'Art. 43 Abs. 1 lit. d HRegV',
      begruendung: 'Annahme-Kernsatz analog der amtlichen ZH-VR-Vorlage (0.6/D15); wir-Form, da die Revisionsstelle regelmässig eine juristische Person ist (Haus-Fassung, offengelegt).',
    },
    { id: 'AR07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlagen-Anatomie.' },
    { id: 'AR08_unterschrift', rolle: 'unterschrift', text: '_________________________________\n{{revisionsstelleName}}', begruendung: 'Unterschrift der Revisionsstelle (zeichnungsberechtigte Person).' },
  ],
};

// ── 4 · DOMIZILANNAHME (fertig) ─────────────────────────────────────────────

export const DOMIZILANNAHME_SCHEMA: VorlageSchema = {
  id: 'ag-domizilannahme',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Domizilannahmeerklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Erklärung der Domizilhalterin / des Domizilhalters ' +
    'nach Art. 117 Abs. 3 HRegV; im Original mit der Anmeldung einzureichen (Art. 43 Abs. 1 lit. g HRegV).',
  bausteine: [
    { id: 'AD01_absender', rolle: 'absender', text: '{{domizilhalterName}}\n{{domizilhalterAdresse}}', begruendung: 'Absender ist die Domizilhalterin / der Domizilhalter.' },
    { id: 'AD02_adressat', rolle: 'adressat', text: '{{firma}}\nc/o {{domizilhalterName}}\n{{domizilhalterAdresse}}', begruendung: 'Adressatin ist die Gesellschaft an der c/o-Adresse.' },
    { id: 'AD03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AD04_betreff', rolle: 'betreff', text: 'Domizilannahmeerklärung', begruendung: 'Betreff nach amtlicher ZH-Vorlage.' },
    { id: 'AD05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach amtlicher ZH-Vorlage.' },
    {
      id: 'AD06_text',
      text: 'Gerne bestätigen wir Ihnen, dass wir der {{firma}}, mit Sitz in {{sitz}}, an unserer Adresse ({{domizilhalterAdresse}}) Domizil gewähren.',
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'Kernsatz nach den amtlichen ZH-Vorlagen (AG-Fassung sagt «Sitz gewähren» – Haus-Fassung einheitlich «Domizil», deckt Art. 117 Abs. 3 HRegV; Abweichung offengelegt).',
    },
    { id: 'AD07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlage.' },
    { id: 'AD08_unterschrift', rolle: 'unterschrift', text: '_________________________________\n{{domizilhalterName}}', begruendung: 'Unterschrift der Domizilhalterin / des Domizilhalters.' },
  ],
};

// ── 5 · VR-KONSTITUIERUNGSPROTOKOLL (fertig; Pflichtbeleg lit. e) ───────────

export const VR_PROTOKOLL_SCHEMA: VorlageSchema = {
  id: 'ag-vr-protokoll',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Protokoll des Verwaltungsrates (Konstituierung)',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Pflichtbeleg der AG-Gründung (Art. 43 Abs. 1 ' +
    'lit. e HRegV): Konstituierung, Vorsitz und Zeichnungsbefugnisse. Unterschriften von Vorsitz und ' +
    'Protokollführung (Art. 23 Abs. 2 HRegV); entbehrlich, wenn sämtliche VR-Mitglieder die Anmeldung ' +
    'unterzeichnen (Art. 23 Abs. 3 HRegV).',
  bausteine: [
    {
      id: 'VP01_ingress',
      text: 'der {{firma}}, mit Sitz in {{sitz}}\n\nDatum: {{datumZeile}}\nBeginn der Sitzung: {{sitzungBeginnZeile}}\nOrt: {{ort}}\nAnwesend: sämtliche Mitglieder des Verwaltungsrates\nAbwesend: keine\nVorsitz: {{praesidentName}}\nProtokoll: {{protokollName}}',
      begruendung: 'Protokoll-Kopf nach der amtlichen ZH-Vorlage (ag_vorlage_protokoll_vr; Zeilen-Reihenfolge Datum→Beginn→Ort wie das Original — Bug-Check-Befund 3); Mindestelemente der Praxis zu Art. 23 HRegV (Beginn der Sitzung, Anwesenheits-/Abwesenheits-Feststellung — Merkblatt «Formelle Anforderungen an Handelsregisterbelege», 7.1.2025; D13).',
      norm: 'Art. 43 Abs. 1 lit. e HRegV',
    },
    {
      id: 'VP02_eroeffnung',
      ueberschrift: 'Eröffnung der Sitzung und Feststellung der Beschlussfähigkeit',
      text:
        '{{praesidentName}} eröffnet die Sitzung und übernimmt den Vorsitz. {{protokollName}} amtet als ' +
        'Protokollführer/in. Der Vorsitzende stellt fest, dass der Verwaltungsrat in beschlussfähiger ' +
        'Anzahl anwesend ist. Gegen diese Feststellungen wird kein Widerspruch erhoben. Der ' +
        'Verwaltungsrat beschliesst:',
      begruendung: 'Eröffnungs-Passus nach der amtlichen ZH-Vorlage. Haus-Abweichung (offengelegt): Der ZH-Einladungs-Feststellungssatz («Einladung gemäss den statutarischen Vorschriften fristgerecht») entfällt — bei der Konstituierungs-Sitzung unmittelbar nach der Gründung sind sämtliche Mitglieder anwesend (Kopf-Feststellung), womit Einberufungsmängel nach herrschender Auffassung unbeachtlich sind.',
      norm: 'Art. 713 OR',
    },
    {
      id: 'VP03_konstituierung',
      ueberschrift: 'Konstituierung und Zeichnungsberechtigung',
      text: 'Der Verwaltungsrat konstituiert sich und erteilt seinen Mitgliedern Zeichnungsberechtigungen wie folgt:',
      nummeriert: true,
      norm: 'Art. 712 OR',
      begruendung: 'Selbstkonstituierung des VR (Präsidentenwahl bei mehrgliedrigem VR zwingend, Art. 712 Abs. 2 OR); Zeichnungsbefugnisse als Eintragungsinhalt.',
    },
    {
      id: 'VP03b_vrliste',
      text: '– {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}: {{item.funktion}}, {{item.zeichnung}}',
      wiederholeUeber: 'vrListe',
      begruendung: 'Je VR-Mitglied eine Zeile (Funktion + Zeichnungsart, ZH-Vorlagen-Struktur).',
      norm: 'Art. 718 OR',
    },
    {
      id: 'VP04_weitere',
      ueberschrift: 'Erteilung von weiteren Zeichnungsberechtigungen',
      text: 'Weitere Zeichnungsberechtigungen werden erteilt:',
      includeIf: { feld: 'hatWeitereVertretungen', eq: true },
      nummeriert: true,
      norm: 'Art. 716a Abs. 1 Ziff. 4 OR',
      begruendung: 'Aufgenommen, weil weitere Vertretungsberechtigte (Direktion/Prokura) ernannt werden.',
    },
    {
      id: 'VP04b_liste',
      text: '– {{item.name}}, als {{item.funktion}}, mit {{item.zeichnung}}',
      includeIf: { feld: 'hatWeitereVertretungen', eq: true },
      wiederholeUeber: 'vertretungsListe',
      begruendung: 'Je ernannte Person eine Zeile.',
      norm: 'Art. 718 Abs. 2 OR',
    },
    {
      id: 'VP04c_ende',
      text: 'Ende der Sitzung: {{sitzungEndeZeile}}',
      begruendung: 'Schluss-Zeile nach der amtlichen ZH-Vorlage; Mindestelement «Datum, Beginn und Ende der Sitzung» (Merkblatt 7.1.2025; D13).',
    },
    {
      id: 'VP05_unterschriften', rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\n_________________________________\n{{praesidentName}} (Vorsitz)\n\n_________________________________\n{{protokollName}} (Protokoll)',
      begruendung: 'Unterschriften von Vorsitz und Protokollführung (Art. 23 Abs. 2 HRegV); für die HR-Einreichung Unterschriften der Vertretungsberechtigten amtlich beglaubigt (Praxis ZH).',
      norm: 'Art. 23 Abs. 2 HRegV',
    },
  ],
};

// ── 6 · HR-ANMELDUNG (fertig) ───────────────────────────────────────────────

export const ANMELDUNG_SCHEMA: VorlageSchema = {
  id: 'ag-hr-anmeldung',
  version: '1.0.0 (ZH-Formular-Struktur; Wortlaut-Dossier 7.6.2026)',
  titel: 'Anmeldung an das Handelsregisteramt',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Unterschriften beim Handelsregisteramt zeichnen ' +
    'oder beglaubigt einreichen (Art. 18 Abs. 2, Art. 21 HRegV); Gebühr CHF 420 (GebV-HReg, Anhang ' +
    'Ziff. 1.3). Belege im Original oder in beglaubigter Kopie (Art. 20 HRegV); per E-Mail eingereichte ' +
    'Unterlagen gelten als Kopien. Die Anmeldung ist auf Deutsch abzufassen (Praxis HRegA ZH); ' +
    'Ausweiskopien der einzutragenden Personen als separate, lose Beilage (Art. 24a HRegV – nicht ' +
    'öffentlich). Unterzeichnet eine bevollmächtigte Drittperson, Vollmachts-Kopie beilegen (Art. 17 HRegV).',
  bausteine: [
    { id: 'AA01_absender', rolle: 'absender', text: '{{firma}} (in Gründung)\n{{anmeldeAdresseZeile}}', begruendung: 'Absenderin ist die Gesellschaft in Gründung.' },
    { id: 'AA02_adressat', rolle: 'adressat', text: 'Handelsregisteramt des Kantons {{kanton}}', begruendung: 'Zuständig ist das Handelsregisteramt am Sitz (Art. 16 HRegV).', norm: 'Art. 16 HRegV' },
    { id: 'AA03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AA04_betreff', rolle: 'betreff', text: 'Anmeldung zur Eintragung der Gründung der {{firma}}', begruendung: 'Betreff mit Identifikation der Rechtseinheit (Art. 16 Abs. 1 HRegV).', norm: 'Art. 16 Abs. 1 HRegV' },
    {
      id: 'AA05_text',
      text:
        'Zur Eintragung in das Handelsregister wird angemeldet: die Gründung der {{firma}} mit Sitz in ' +
        '{{sitz}}. Die einzutragenden Tatsachen ergeben sich aus den beigelegten Belegen.',
      norm: 'Art. 16 Abs. 1 HRegV',
      begruendung: 'Anmeldungs-Kern: Identifikation und Beleg-Verweis (ZH-Formular-Struktur).',
    },
    {
      id: 'AA05b_inhaber_bucheffekten',
      text:
        'Die Gesellschaft hat Inhaberaktien; diese sind als Bucheffekten im Sinne des ' +
        'Bucheffektengesetzes vom 3. Oktober 2008 (BEG) ausgestaltet. Wir beantragen die ' +
        'entsprechende Eintragung.',
      includeIf: { feld: 'inhaberBucheffekten', eq: true },
      norm: 'Art. 622 Abs. 2bis OR',
      begruendung: 'Stufe 2 P2: Eine Gesellschaft mit Inhaberaktien muss im Handelsregister eintragen lassen, ob sie Beteiligungspapiere kotiert hat oder ihre Inhaberaktien als Bucheffekten ausgestaltet sind (Art. 622 Abs. 2bis OR am Cache verifiziert) — Bucheffekten-Variante.',
    },
    {
      id: 'AA05b_inhaber_kotiert',
      text:
        'Die Gesellschaft hat Inhaberaktien und Beteiligungspapiere an einer Börse kotiert. ' +
        'Wir beantragen die entsprechende Eintragung.',
      includeIf: { feld: 'inhaberKotiertAktiv', eq: true },
      norm: 'Art. 622 Abs. 2bis OR',
      begruendung: 'Stufe 2 P2: Eintragungs-Erklärung nach Art. 622 Abs. 2bis OR — Kotierungs-Variante.',
    },
    {
      id: 'AA05c_schiedsklausel',
      text: 'Die Statuten enthalten eine Schiedsklausel; wir beantragen die Eintragung des entsprechenden Verweises.',
      includeIf: { feld: 'hatSchiedsklausel', eq: true },
      norm: 'Art. 45 Abs. 1 lit. u HRegV',
      begruendung: 'Stufe 2 P3: Der Handelsregister-Eintrag der AG enthält bei statutarischer Schiedsklausel einen Verweis darauf (Art. 45 Abs. 1 lit. u HRegV).',
    },
    {
      id: 'AA06_beilagen',
      ueberschrift: 'Beilagen',
      text: '– {{item.titel}} ({{item.norm}})',
      wiederholeUeber: 'belegeAnmeldung',
      begruendung: 'Beilagen-Liste aus der Gründungs-Konstellation – identisch mit der Checklisten-Engine (eine Quelle, §5).',
      norm: 'Art. 43 HRegV',
    },
    { id: 'AA07_unterschriften', rolle: 'unterschrift', text: 'Die Mitglieder des Verwaltungsrates:', begruendung: 'Anmeldende Personen (Art. 17 HRegV); Unterschriften nach Art. 18 Abs. 2 HRegV.', norm: 'Art. 18 HRegV' },
    { id: 'AA07b_liste', rolle: 'unterschrift', text: '_________________________________\n{{item.name}}', wiederholeUeber: 'vrListe', begruendung: 'Je anmeldende Person eine Unterschriftslinie.' },
  ],
};


// ── 6b · UNTERSCHRIFTENBOGEN (Stufe 2 P4; fertig) ───────────────────────────
// ZH führt ein amtliches «Unterschriftenblatt» (DOCX) — das Original liegt
// nicht in den Extrakten vor, darum HAUS-FASSUNG (offengelegt): je
// zeichnungsberechtigte Person Name · Funktion · Zeichnungsart ·
// Unterschriftslinie, mit den Hinterlegungs-Modalitäten nach Art. 21 HRegV
// (am Cache verifiziert: beim HRegA zeichnen ODER beglaubigt auf Papier /
// elektronisch beglaubigt / elektronisch selbst bestätigt einreichen).

export const UNTERSCHRIFTENBOGEN_SCHEMA: VorlageSchema = {
  id: 'ag-unterschriftenbogen',
  version: '1.0.0 (Haus-Fassung am Rechtsstand HRegV 1.1.2025; P4 7.6.2026)',
  titel: 'Unterschriftenblatt',
  format: 'verfuegung',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Haus-Fassung nach dem Vorbild des amtlichen ' +
    'ZH-Unterschriftenblatts: Die Unterschriften sind beim Handelsregisteramt zu zeichnen oder ' +
    'beglaubigt einzureichen (Art. 21 HRegV); massgeblich sind die Vorgaben des zuständigen ' +
    'Handelsregisteramts.',
  bausteine: [
    {
      id: 'UB01_ingress',
      text: 'der {{firma}} mit Sitz in {{sitz}}',
      begruendung: 'Identifikations-Ingress unter dem Dokumenttitel (Usanz der amtlichen Muster).',
    },
    {
      id: 'UB02_hinweis',
      text:
        'Die nachfolgend aufgeführten Personen hinterlegen ihre eigenhändige Unterschrift zur Eintragung ' +
        'in das Handelsregister. Die Unterschrift ist beim Handelsregisteramt zu zeichnen (mit gültigem ' +
        'Pass, gültiger Identitätskarte oder gültigem schweizerischem Ausländerausweis) oder dem ' +
        'Handelsregisteramt als Beleg einzureichen: auf Papier von einer Urkundsperson beglaubigt, ' +
        'elektronisch eingelesen und von einer Urkundsperson beglaubigt oder elektronisch eingelesen ' +
        'und von der Person selbst bestätigt.',
      norm: 'Art. 21 HRegV',
      begruendung: 'Hinterlegungs-Modalitäten nach Art. 21 Abs. 1–3 HRegV (am Cache verifiziert) — Haus-Fassung, das amtliche ZH-Blatt liegt nicht im Wortlaut vor (offengelegt).',
    },
    {
      id: 'UB03_personen',
      rolle: 'unterschrift',
      text:
        '_________________________________\n' +
        '{{item.name}}\n{{item.funktion}} · {{item.zeichnung}}',
      wiederholeUeber: 'unterschriftenListe',
      norm: 'Art. 21 Abs. 1 HRegV',
      begruendung: 'Je zeichnungsberechtigte Person (VR-Mitglieder mit Zeichnungsberechtigung und weitere Zeichnungsberechtigte) eine Unterschriftszeile mit Funktion und Zeichnungsart.',
    },
    {
      id: 'UB04_ortdatum',
      text: '{{ortDatumZeile}}',
      begruendung: 'Ort und Datum.',
    },
  ],
};

// ── 7 · SACHEINLAGEVERTRAG (Etappe 2; fertig — mit Grundstück ENTWURF, §8) ──
// EIN Bausteinsatz (§5); zwei Schema-Hüllen, weil ausgabeArt formgebunden
// ist: Schriftform (Art. 634 Abs. 2 Satz 1 OR) → druckfertig; Grundstück →
// öffentliche Beurkundung (Art. 634 Abs. 2 Satz 2 OR i. V. m. Art. 657 ZGB)
// → nur ENTWURF. Wortlaute: ZH-Vorlagen vertrag_se_einfach / _geschaeft.

export const SACHEINLAGEVERTRAG_BAUSTEINE: VorlageSchema['bausteine'] = [
  {
    id: 'SV01_parteien',
    text:
      'zwischen\n{{einlegerName}},\nals Veräusserer/in und Sacheinleger/in,\nund\n' +
      '{{firma}} in Gründung, {{sitz}}, vertreten durch die Gründerinnen und Gründer,\n' +
      'als übernehmende Gesellschaft.',
    begruendung: 'Parteien-Ingress nach den ZH-Vertragsvorlagen (Vertretung durch die Gründer; Haus-Fassung sammelt sie statt Einzelaufzählung — Unterschriftsblock nennt alle).',
  },
  {
    id: 'SV02_gegenstand_einfach',
    ueberschrift: 'Sacheinlage',
    text:
      'Der/die Sacheinleger/in bringt in die zu gründende {{firma}} ein: {{bezeichnung}} gemäss ' +
      'beiliegender Inventarliste vom {{belegDatumFmt}} im Wert und zum Preis von {{waehrungCode}} {{wertFmt}}.\n' +
      'Die beiliegende Inventarliste bildet einen integrierenden Bestandteil des vorliegenden Vertrages ' +
      'und wird demselben, von den Vertragsparteien unterzeichnet, beigeheftet.',
    includeIf: { feld: 'typGeschaeft', eq: false },
    norm: 'Art. 634 OR',
    begruendung: 'ZH-Vorlage «Sacheinlagevertrag einfach» verbatim (Sachgesamtheit mit unterzeichneter, datierter Inventarliste — Beleg-Anforderung des ZH-Merkblatts: Gegenstände einzeln aufgeführt und bewertet).',
  },
  {
    id: 'SV02_gegenstand_geschaeft',
    ueberschrift: 'Gegenstand der Sacheinlage',
    text:
      'Die {{firma}} übernimmt alle Aktiven und Passiven {{hrZusatz}} Einzelunternehmens ' +
      '{{bezeichnung}}{{cheSatz}} gemäss Übernahmebilanz per {{belegDatumFmt}}. Danach betragen die ' +
      'Aktiven {{waehrungCode}} {{aktivenFmt}} und die Passiven {{waehrungCode}} {{passivenFmt}}. Der Kaufpreis beträgt ' +
      '{{waehrungCode}} {{wertFmt}}. Die Bilanz bildet einen Bestandteil dieses Vertrages und wird von den ' +
      'Vertragsparteien anerkannt.',
    includeIf: { feld: 'typGeschaeft', eq: true },
    norm: 'Art. 634 OR',
    begruendung: 'ZH-Vorlage «Sacheinlagevertrag Geschäft» verbatim (Übernahme aller Aktiven und Passiven eines Einzelunternehmens mit Übernahmebilanz).',
  },
  {
    id: 'SV03_gegenleistung',
    ueberschrift: 'Gegenleistung',
    text:
      'Als Gegenleistung erhält {{einlegerName}} {{aktien}} als voll liberiert geltende {{aktienArt}} ' +
      'der Gesellschaft zu nominal {{waehrungCode}} {{nennwertFmt}}{{ausgabeKlammerSatz}}.{{gutschriftSatz}}',
    norm: 'Art. 634 Abs. 4 OR',
    begruendung: 'Gegenleistung nach den ZH-Vorlagen («als voll liberiert geltende Aktien … zu nominal»); Gutschrift-Satz = weitere Gegenleistung (Art. 634 Abs. 4 OR), nur wenn erfasst. Stufe 2: Währungscode = Kapitalwährung; bei Agio wird der Ausgabebetrag offengelegt (die Bewertung deckt Aktien × Ausgabebetrag, Art. 629 Abs. 2 Ziff. 2 OR). MODELL-EINSCHRÄNKUNG (Musterabgleich 10.6.2026, B7): eine Sacheinlage = EIN Aktien-Empfänger – die ZH-Vertragsvorlagen verteilen die Aktien auf mehrere benannte Empfänger; bei mehreren Einlegern je ein eigener Vertrag.',
  },
  {
    id: 'SV04_zeitpunkt',
    ueberschrift: 'Zeitpunkt',
    text:
      'Der/die Sacheinleger/in erteilt mit der Unterzeichnung dieses Vertrages der {{firma}} die ' +
      'unwiderrufliche Befugnis, sofort nach ihrer Eintragung im Handelsregister über sämtliche ' +
      'übertragenen Vermögenswerte tatsächlich und rechtlich zu verfügen. Mit der Eintragung der ' +
      '{{firma}} im Handelsregister kann sie frei und bedingungslos über die Sacheinlage verfügen.',
    norm: 'Art. 634 Abs. 1 Ziff. 3 OR',
    begruendung: 'ZH-Vorlagen verbatim — setzt die Deckungs-Voraussetzung der sofortigen freien Verfügbarkeit um.',
  },
  {
    id: 'SV05_zusicherungen',
    ueberschrift: 'Zusicherungen',
    text: 'Die übernommenen Vermögenswerte sind frei von Rechten Dritter.',
    begruendung: 'ZH-Vorlagen verbatim.',
  },
  {
    id: 'SV06_rechtsgeschaefte',
    ueberschrift: 'Rechtsgeschäfte',
    text:
      'Die seit dem {{rueckwirkungFmt}} abgeschlossenen Rechtsgeschäfte des Einzelunternehmens ' +
      '{{bezeichnung}} gelten als für Rechnung der in Gründung begriffenen {{firma}} getätigt.',
    includeIf: { feld: 'typGeschaeft', eq: true },
    begruendung: 'Rückwirkungsklausel der ZH-Vorlage «Geschäft» (nur Geschäftsübernahme).',
  },
  {
    id: 'SV07_nutzen_gefahr',
    ueberschrift: 'Nutzen und Gefahr',
    text: 'Nutzen und Gefahr hinsichtlich aller übertragenen Vermögenswerte gelten als per {{belegDatumFmt}} auf die {{firma}} übergegangen.',
    begruendung: 'ZH-Vorlagen verbatim; Stichtag = Inventarlisten- bzw. Übernahmebilanz-Datum.',
  },
  {
    id: 'SV08_gewaehrleistung',
    ueberschrift: 'Gewährleistung',
    text: 'Der vorliegende Vertrag wird unter Aufhebung jeder Gewährleistung abgeschlossen.',
    begruendung: 'ZH-Vorlagen verbatim.',
  },
  {
    id: 'SV09_unterschriften',
    rolle: 'unterschrift',
    text: '{{ortDatumZeile}}\n\n_________________________________\n{{einlegerName}} (Sacheinleger/in)\n\n{{firma}} in Gründung – die Gründerinnen und Gründer:',
    begruendung: 'Unterschriften der Sacheinlegerin / des Sacheinlegers und aller Gründerinnen und Gründer (ZH-Vorlagen).',
  },
  {
    id: 'SV09b_gruenderliste',
    rolle: 'unterschrift',
    text: '_________________________________\n{{item.name}}',
    wiederholeUeber: 'gruenderListe',
    begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
  },
];

export const SACHEINLAGEVERTRAG_SCHEMA: VorlageSchema = {
  id: 'ag-sacheinlagevertrag',
  version: '1.0.0 (ZH-Vorlagen vertrag_se_einfach/_geschaeft 26.7.2024; Dossier 7.6.2026)',
  titel: 'Sacheinlagevertrag',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Schriftform (Art. 634 Abs. 2 OR); im Original oder ' +
    'als beglaubigte Kopie einzureichen (Art. 20 HRegV). Inventarliste bzw. Übernahmebilanz unterzeichnet ' +
    'und datiert beiheften (Merkblatt HRegA ZH).',
  bausteine: SACHEINLAGEVERTRAG_BAUSTEINE,
};

export const SACHEINLAGEVERTRAG_ENTWURF_SCHEMA: VorlageSchema = {
  ...SACHEINLAGEVERTRAG_SCHEMA,
  id: 'ag-sacheinlagevertrag-grundstueck',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF: Dieser Sacheinlagevertrag enthält ein ' +
    'Grundstück und bedarf der öffentlichen Beurkundung (Art. 634 Abs. 2 OR i. V. m. Art. 657 ZGB); ' +
    'eine einzige Urkunde genügt auch für Grundstücke in verschiedenen Kantonen und ist durch eine ' +
    'Urkundsperson am Sitz der Gesellschaft zu errichten (Art. 634 Abs. 3 OR).',
};

// ── 7b · LEX-KOLLER-ERKLÄRUNG (Etappe 4.3/D16; fertig) ──────────────────────
// Inhalt nach dem amtlichen ZH-Formular (Stand 1.1.2025); nur bei
// Immobilien-Haupttätigkeit einzureichen, unterzeichnet von EINEM Mitglied
// des obersten Leitungs- oder Verwaltungsorgans.

export const LEXKOLLER_SCHEMA: VorlageSchema = {
  id: 'ag-lex-koller',
  version: '1.0.0 (ZH-Formular allg_formular_lex_koller_erklaerung 1.1.2025)',
  titel: 'Lex-Koller-Erklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Nur einzureichen, wenn die Gesellschaft eine ' +
    'Immobilien-Haupttätigkeit verfolgt; persönliche Unterschrift EINES Mitglieds des obersten ' +
    'Leitungs- oder Verwaltungsorgans (Merkblatt HRegA ZH). Fehlende Angaben können die Verweisung ' +
    'an die kantonale Bewilligungsbehörde zur Folge haben (Art. 18 Abs. 1 und 2 BewG).',
  bausteine: [
    { id: 'LK01_absender', rolle: 'absender', text: '{{firma}} (in Gründung)\n{{anmeldeAdresseZeile}}', begruendung: 'Absenderin ist die Gesellschaft in Gründung.' },
    { id: 'LK02_adressat', rolle: 'adressat', text: 'Handelsregisteramt des Kantons {{kanton}}', begruendung: 'Beleg zur HR-Anmeldung (Art. 43 HRegV; ZH-Checkliste «Lex-Koller-Erklärung»).' },
    { id: 'LK03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'LK04_betreff', rolle: 'betreff', text: 'Lex-Koller-Erklärung', begruendung: 'Titel des amtlichen ZH-Formulars.' },
    {
      id: 'LK05_ingress',
      text:
        'Im Hinblick auf die Bestimmungen des Bundesgesetzes und der Verordnung über den Erwerb von ' +
        'Grundstücken durch Personen im Ausland erklärt das unterzeichnende Mitglied des Verwaltungsrates ' +
        'bezüglich der Gesellschaft {{firma}}, mit Sitz in {{sitz}}, Folgendes zum angemeldeten ' +
        'Eintragungsgeschäft (Neueintragung/Gründung):',
      begruendung: 'Ingress nach dem ZH-Formular («Im Hinblick auf die Bestimmungen … erklären die Unterzeichnenden bezüglich der Gesellschaft … Folgendes zum angemeldeten Eintragungsgeschäft» — Haus-Fassung im Singular, da ein VR-Mitglied unterzeichnet).',
    },
    {
      id: 'LK06_fragen',
      text:
        '1. Personen im Ausland bzw. Personen, die für Rechnung von Personen im Ausland handeln, sind an ' +
        'der Gesellschaft beteiligt: {{lkFrage1}}.\n' +
        '2. Personen im Ausland bzw. Personen, die für Rechnung von Personen im Ausland handeln, erwerben ' +
        'im Zusammenhang mit dem angemeldeten Eintragungsgeschäft an der Gesellschaft neu eine ' +
        'Beteiligung: {{lkFrage2}}.\n' +
        '3. Bei Sacheinlage, Fusion, Umwandlung oder Spaltung: Die Gesellschaft erwirbt ' +
        'Nicht-Betriebsstätte-Grundstücke in der Schweiz: {{lkFrage3}}.\n' +
        '4. Bei Kapitalherabsetzung: nicht anwendbar (Gründung).',
      begruendung: 'Die vier Erklärungen des ZH-Formulars verbatim-nah; Frage 4 betrifft nur Kapitalherabsetzungen und ist bei der Gründung als «nicht anwendbar» ausgewiesen (§8 — ehrlicher als eine leere Ankreuzzeile).',
    },
    {
      id: 'LK07_definitionen',
      text:
        'Personen im Ausland (Art. 5 BewG) sind insbesondere: Ausländerinnen und Ausländer mit Wohnsitz im ' +
        'Ausland; Ausländerinnen und Ausländer mit Wohnsitz in der Schweiz, die weder Staatsangehörige eines ' +
        'EU-/EFTA-Mitgliedstaates sind noch eine gültige Niederlassungsbewilligung (Ausweis C) besitzen; ' +
        'juristische Personen mit Sitz im Ausland oder mit Sitz in der Schweiz, die von Personen im Ausland ' +
        'beherrscht werden; sowie Personen, die ein Grundstück auf Rechnung einer Person im Ausland erwerben. ' +
        'Betriebsstätte-Grundstück (Art. 2 Abs. 2 lit. a und Abs. 3 BewG) ist ein Grundstück, das als ständige ' +
        'Betriebsstätte eines nach kaufmännischer Art geführten Gewerbes, eines Handwerksbetriebes oder eines ' +
        'freien Berufes dient.',
      begruendung: 'Definitions-Fussnoten des ZH-Formulars (gekürzt um den GB-Staatsvertrags-Sonderfall SR 0.142.113.672 — als Detail dem Formular-Original vorbehalten; Abweichung offengelegt).',
    },
    {
      id: 'LK08_folge',
      text:
        'Kann die Handelsregisterbehörde die Bewilligungspflicht nicht ohne Weiteres ausschliessen, so setzt ' +
        'sie das Eintragungsverfahren aus und verweist die Anmeldenden an die zuständige kantonale ' +
        'Bewilligungsbehörde (Art. 18 Abs. 1 und 2 BewG).',
      begruendung: 'Folgen-Hinweis des ZH-Formulars, kantonsneutral gefasst (ZH nennt die Bezirksräte — die Bewilligungsbehörde ist kantonal verschieden; Abweichung offengelegt).',
    },
    {
      id: 'LK09_unterschrift',
      rolle: 'unterschrift',
      text: 'Persönliche Unterschrift eines Mitglieds des Verwaltungsrates:\n\n_________________________________\n{{praesidentName}}',
      begruendung: 'ZH-Formular: «Persönliche Unterschrift von einem Mitglied des obersten Leitungs- oder Verwaltungsorgans»; vorbelegt mit der Präsidentin / dem Präsidenten.',
    },
  ],
};

// ── 7c · GRÜNDUNGS-NACHTRAG (Etappe 4.4/D11; ENTWURF §8) ────────────────────
// Nach ZH-Vorlage 3.4: Korrektur von Urkunde/Statuten nach Beanstandung
// durch die Handelsregisterbehörde — öffentliche Beurkundung nötig.

export const NACHTRAG_SCHEMA: VorlageSchema = {
  id: 'ag-gruendungs-nachtrag',
  version: '1.0.0 (ZH-Vorlage 3.4 «AG Gründungs-Nachtrag»)',
  titel: 'Nachtrag zur Gründungsurkunde',
  format: 'verfuegung',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF für die Urkundsperson: Der Nachtrag zur ' +
    'Gründungsurkunde bedarf der öffentlichen Beurkundung (ZH-Vorlage 3.4; Art. 629 Abs. 1 OR). ' +
    'Wer den Nachtrag namens aller Gründerinnen und Gründer vornimmt, ergibt sich aus der ' +
    'Nachtragsvollmacht der Gründungsurkunde oder dem persönlichen Erscheinen.',
  bausteine: [
    {
      id: 'NT01_ingress',
      text: 'Nachtrag zur Gründungsurkunde vom {{nachtragGruendungsdatumFmt}} der {{firma}} mit Sitz in {{sitz}}',
      begruendung: 'Ingress nach ZH 3.4 («Nachtrag zur Gründungsurkunde vom … der … mit Sitz in …»).',
    },
    {
      id: 'NT02_erklaerung',
      text: 'Die Gründerinnen und Gründer erklären infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'ZH 3.4 verbatim-nah («Die Gründer erklären infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag»).',
    },
    {
      id: 'NT02_erklaerung_singular',
      text: 'Die Gründerin bzw. der Gründer erklärt infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Nachtrags-Erklärung im Singular (D1; ZH 3.4 führt beide Numeri).',
    },
    {
      id: 'NT03_urkunde',
      text: 'Ziff. {{nachtragUrkundeZiffer}} der Gründungsurkunde lautet neu wie folgt:\n«{{nachtragUrkundeText}}»',
      includeIf: { feld: 'hatNachtragUrkunde', eq: true },
      begruendung: 'Urkunden-Änderung nach ZH 3.4 («Ziff. … der Gründungsurkunde lautet neu wie folgt: „…“» — Haus-Anführung mit Guillemets statt deutscher Anführungszeichen, Konventions-Standard).',
    },
    {
      id: 'NT04_statuten',
      text: 'Art. {{nachtragStatutenArtikel}}{{nachtragAbsatzSatz}} der Statuten der Gesellschaft lautet neu wie folgt:\n«{{nachtragStatutenText}}»',
      includeIf: { feld: 'hatNachtragStatuten', eq: true },
      begruendung: 'Statuten-Änderung nach ZH 3.4.',
    },
    {
      id: 'NT05_statuten_feststellung',
      text:
        'Es liegt ein Exemplar der Gesellschaftsstatuten vor; es handelt sich um die vollständigen, unter ' +
        'Berücksichtigung der vorstehenden Änderungen gültigen Statuten. Diese Statuten sind Bestandteil ' +
        'dieser Urkunde.',
      begruendung: 'Vollständigkeits-Feststellung nach ZH 3.4 (Haus-Fassung in der dritten Person; ZH: «Der bzw. Die Gründer legt bzw. legen ein Exemplar … vor und erklärt bzw. erklären …»).',
    },
    {
      id: 'NT06_fortgeltung',
      text: 'Im Übrigen gilt der ursprüngliche Errichtungsakt (mit Statuten) unverändert weiter.',
      begruendung: 'ZH 3.4 verbatim.',
    },
    {
      id: 'NT07_unterschriften',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer (bzw. die bevollmächtigte Person):',
      begruendung: 'Unterschriften; die Urkundsperson ergänzt Bestätigung und Beurkundungsvermerk (ZH 3.4: Belegbestätigung Art. 631 Abs. 1 OR).',
    },
    {
      id: 'NT07b_gruenderliste',
      rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
    },
  ],
};

// ── 8 · GRÜNDUNGSBERICHT (Etappe 2; fertig — Art. 635 OR) ───────────────────

export const GRUENDUNGSBERICHT_SCHEMA: VorlageSchema = {
  id: 'ag-gruendungsbericht',
  version: '1.0.0 (ZH-Vorlagen gruendungsbericht_se_einfach/_geschaeft 26.7.2024; Dossier 7.6.2026)',
  titel: 'Gründungsbericht',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Von allen Gründerinnen und Gründern (oder ihren ' +
    'Vertretern) ORIGINAL HANDSCHRIFTLICH zu unterzeichnen (Praxis HRegA ZH); ein zugelassener Revisor ' +
    'prüft den Bericht und bestätigt schriftlich, dass er vollständig und richtig ist (Art. 635a OR).',
  bausteine: [
    {
      id: 'GB01_ingress',
      text: 'Die Gründerinnen und Gründer der {{firma}}, in {{sitz}}, erstatten hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR:',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 635 OR',
      begruendung: 'Ingress nach der ZH-Vorlage («Die Gründer der … AG erstatten hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR»).',
    },
    {
      id: 'GB01_ingress_singular',
      text: 'Die Gründerin bzw. der Gründer der {{firma}}, in {{sitz}}, erstattet hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR:',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 635 OR',
      begruendung: 'Ingress im Singular (D1).',
    },
    {
      id: 'GB02_sach',
      ueberschrift: 'Art und Zustand der Sacheinlage',
      text:
        'Die Sacheinlage von {{item.einleger}} umfasst {{item.objektLabel}}. Der entsprechende ' +
        'Sacheinlagevertrag vom {{item.vertragDatumFmt}} mit {{item.belegSatz}} liegt diesem Bericht als ' +
        'integrierender Bestandteil bei. Zum Zustand der Sacheinlage wird Folgendes erklärt: {{item.zustandTxt}}\n' +
        'Auf Grund obiger Feststellungen kann die Bewertung der Sacheinlage mit {{waehrungCode}} {{item.wertFmt}} als angemessen bezeichnet werden.',
      wiederholeUeber: 'sachListe',
      includeIf: { feld: 'hatSacheinlagen', eq: true },
      norm: 'Art. 635 Ziff. 1 OR',
      begruendung: 'Je Sacheinlage ein Abschnitt nach den ZH-Vorlagen (Art/Zustand + Angemessenheit der Bewertung); beim Geschäft tritt die Übernahmebilanz an die Stelle der Inventarliste, die Posten-Würdigung steht im Zustands-Text (ZH-Vorlage «Geschäft»: je Bilanzposten Bestand und Bewertung).',
    },
    {
      id: 'GB03_verrechnung',
      ueberschrift: 'Bestand und Verrechenbarkeit',
      text:
        'Die zur Verrechnung gebrachte Forderung von {{item.glaeubiger}} im Betrag von ' +
        '{{waehrungCode}} {{item.forderungFmt}} besteht und ist verrechenbar. Begründung: {{item.begruendungTxt}}',
      wiederholeUeber: 'verrListe',
      includeIf: { feld: 'hatVerrechnungen', eq: true },
      norm: 'Art. 635 Ziff. 2 OR',
      begruendung: 'Rechenschaft über Bestand und Verrechenbarkeit der Schuld (Art. 635 Ziff. 2 OR; BE-Merkblatt) — Haus-Fassung, die ZH-Vorlagen decken nur den Sacheinlage-Fall.',
    },
    {
      id: 'GB04_vorteile',
      ueberschrift: 'Besondere Vorteile',
      text:
        '{{item.beguenstigter}} wird folgender besonderer Vorteil gewährt: {{item.inhalt}} ' +
        '(Wert: {{waehrungCode}} {{item.wertFmt}}). Begründung und Angemessenheit: {{item.begruendungTxt}}',
      wiederholeUeber: 'vorteilListe',
      includeIf: { feld: 'hatVorteile', eq: true },
      norm: 'Art. 635 Ziff. 3 OR',
      begruendung: 'Rechenschaft über Begründung und Angemessenheit besonderer Vorteile (Art. 635 Ziff. 3 OR) — Haus-Fassung.',
    },
    {
      id: 'GB05_unterschriften',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'Unterschriften ALLER Gründerinnen und Gründer (ZH-Praxis: original handschriftlich).',
    },
    {
      id: 'GB05_unterschriften_singular',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerin bzw. der Gründer:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Unterschrift im Singular (D1).',
    },
    {
      id: 'GB05b_gruenderliste',
      rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
    },
  ],
};
