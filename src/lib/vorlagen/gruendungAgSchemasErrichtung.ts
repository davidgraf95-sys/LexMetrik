import type { VorlageSchema } from './engine';

// ── 2 · ERRICHTUNGSAKT (ENTWURF – Art. 629 OR) ──────────────────────────────

export const ERRICHTUNGSAKT_SCHEMA: VorlageSchema = {
  id: 'ag-errichtungsakt',
  version: '1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026)',
  titel: 'Öffentliche Urkunde über den Errichtungsakt',
  format: 'verfuegung',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung des Beurkundungstermins: ' +
    'Der Errichtungsakt der AG bedarf der öffentlichen Beurkundung (Art. 629 Abs. 1 OR); die Urkunde ' +
    'entsteht bei der Urkundsperson. Gliederung und Wortlaute nach den amtlichen Vorlagen ZH/SG (2023/2024).',
  bausteine: [
    {
      id: 'AE01_ingress',
      text: 'Gründung der {{firma}} mit Sitz in {{sitz}}\n\nVor der unterzeichnenden Urkundsperson sind heute erschienen:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'Urkunden-Ingress mit Personalien-Block (Art. 44 lit. a HRegV).',
      norm: 'Art. 44 lit. a HRegV',
    },
    {
      id: 'AE01_ingress_singular',
      text: 'Gründung der {{firma}} mit Sitz in {{sitz}}\n\nVor der unterzeichnenden Urkundsperson ist heute erschienen:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Urkunden-Ingress im Singular (D1: Einpersonen-Gründung ist in der Einzahl abzufassen — Erläuterung der ZH-Vorlagen; eigenständige Singular-Vorlage 3.5).',
      norm: 'Art. 44 lit. a HRegV',
    },
    {
      id: 'AE02_gruenderliste',
      text: '– {{item.name}}{{item.angabenZeile}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Personenangaben zu allen Gründerinnen und Gründern.',
      norm: 'Art. 44 lit. a HRegV',
    },
    {
      id: 'AE03_erklaerung',
      ueberschrift: 'Gründungserklärung und Statuten',
      text:
        'Die erschienenen Personen erklären, eine Aktiengesellschaft unter der Firma {{firma}} mit ' +
        'Sitz in {{sitz}} zu gründen, und legen hiermit die beiliegenden Statuten fest, die Bestandteil ' +
        'dieser Urkunde bilden.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Gründungserklärung und Statutenfestlegung in der öffentlichen Urkunde (Art. 44 lit. b und c HRegV).',
    },
    {
      id: 'AE03_erklaerung_singular',
      ueberschrift: 'Gründungserklärung und Statuten',
      text:
        'Die erschienene Person erklärt, eine Aktiengesellschaft unter der Firma {{firma}} mit ' +
        'Sitz in {{sitz}} zu gründen, und legt hiermit die beiliegenden Statuten fest, die Bestandteil ' +
        'dieser Urkunde bilden.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Gründungserklärung im Singular (D1; ZH-Vorlage 3.5: «gründe ich» — Haus-Fassung in der dritten Person wie die Plural-Fassung).',
    },
    {
      id: 'AE04_zeichnung',
      ueberschrift: 'Aktienkapital und Zeichnung',
      text:
        'Das Aktienkapital der Gesellschaft beträgt {{waehrungCode}} {{akFmt}} und ist eingeteilt in {{anzahlAktien}} ' +
        '{{aktienArt}} zu je {{waehrungCode}} {{nennwertFmt}} (Nennwert), welche zum Ausgabebetrag von {{waehrungCode}} {{ausgabeFmt}} ' +
        'je Aktie wie folgt gezeichnet werden:',
      norm: 'Art. 630 Ziff. 1 OR',
      begruendung: 'Zeichnung mit Anzahl, Nennwert, Art und Ausgabebetrag – bei der Gründung in der Urkunde selbst (Art. 44 lit. d HRegV); Ausgabebetrag = Nennwert plus allfälliges Agio (Etappe 3.2/D7; Checkliste Errichtungsakt zu Art. 630 OR).',
    },
    {
      id: 'AE05_zeichnungsliste',
      text: '– {{item.name}}: {{item.anzahl}} {{aktienArt}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Zeichnungserklärung jeder Gründerin / jedes Gründers.',
      norm: 'Art. 44 lit. d HRegV',
    },
    {
      // Musterabgleich-Fix B6 10.6.2026: ZH 3.1/3.3 Ziff. III führen unter der
      // Zeichnungsliste eine Summenzeile («…-Aktien total»); die Deckung prüft
      // zusätzlich das Gate rechnerisch (Art. 629 Abs. 2 Ziff. 1 OR).
      id: 'AE05c_summe',
      text: '– Total: {{anzahlAktien}} {{aktienArt}}',
      norm: 'Art. 629 Abs. 2 Ziff. 1 OR',
      begruendung: 'Summenzeile der Zeichnungsliste nach den ZH-Urkunden 3.1/3.3 («…-Aktien total»); bestätigt, dass sämtliche Aktien gezeichnet sind.',
    },
    {
      id: 'AE05b_verpflichtung',
      text: 'Jede Gründerin und jeder Gründer verpflichtet sich hiermit bedingungslos, die dem Ausgabebetrag der gezeichneten Aktien entsprechende Einlage zu leisten.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 630 Ziff. 2 OR',
      begruendung: 'Bedingungslose Einlage-Verpflichtung als Gültigkeitserfordernis der Zeichnung (ZH-Urkunde wortgleich).',
    },
    {
      id: 'AE05b_verpflichtung_singular',
      text: 'Die Gründerin bzw. der Gründer verpflichtet sich hiermit bedingungslos, die dem Ausgabebetrag der gezeichneten Aktien entsprechende Einlage zu leisten.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 630 Ziff. 2 OR',
      begruendung: 'Einlage-Verpflichtung im Singular (D1; ZH-Vorlage 3.5: «Der Gründer verpflichtet sich hiermit bedingungslos …»).',
    },
    {
      id: 'AE07_einlagen_voll_bank',
      ueberschrift: 'Einlagen',
      text:
        'Sämtliche Einlagen von gesamthaft {{waehrungCode}} {{einlagenTotalFmt}} wurden in Geld geleistet und sind bei der ' +
        '{{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und ' +
        'Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'nurBar', eq: true }, { feld: 'vollLiberiert', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 633 OR',
      begruendung: 'Volliberierung in Geld mit Banknennung in der Urkunde (separate Bescheinigung entfällt als HR-BELEG, Art. 43 Abs. 1 lit. f HRegV); nur bei der reinen Bargründung («Sämtliche Einlagen»). ABWEICHUNG vom Notariatsmuster (Musterabgleich 10.6.2026, B4): ZH 3.1/3.2 Ziff. IV nennen auch bei Banknennung die Bescheinigung («gemäss deren vorliegender schriftlicher Bescheinigung vom …») – die Haus-Fassung lässt die Nennung weg; gilt für alle Bank-Varianten.',
    },
    {
      id: 'AE07_einlagen_voll_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Sämtliche Einlagen von gesamthaft {{waehrungCode}} {{einlagenTotalFmt}} wurden in Geld geleistet und gemäss separater ' +
        'Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ' +
        'ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'nurBar', eq: true }, { feld: 'vollLiberiert', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 633 OR',
      begruendung: 'Volliberierung in Geld mit separater Bankbescheinigung als Beleg; nur bei der reinen Bargründung.',
    },
    {
      id: 'AE07_einlagen_teil_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} ({{liberierungProzent}} % ' +
        'des Nennwerts jeder Aktie) in Geld geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach ' +
        'Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der ' +
        'Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'teilGleich', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung mit EINHEITLICHEM Grad (mind. 20 % je Aktie, gesamthaft mind. CHF 50\'000); individuelle Grade je Gründer in der eigenen Variante (Etappe 3.3).',
    },
    {
      id: 'AE07_einlagen_teil_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} ({{liberierungProzent}} % ' +
        'des Nennwerts jeder Aktie) in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach ' +
        'Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der ' +
        'Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'teilGleich', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung (einheitlich) mit separater Bankbescheinigung.',
    },
    // ── Etappe 3.3/D6: Teilliberierung mit INDIVIDUELLEN Graden je Gründer ──
    {
      id: 'AE07i_einlagen_individuell_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} in Geld ' +
        'geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. ' +
        'Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich:',
      includeIf: { and: [{ feld: 'teilIndividuell', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung mit individuellen Graden nach ZH-Urkunde 3.1 («Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich a) … Aktien des Gründers … zu … %»).',
    },
    {
      id: 'AE07i_einlagen_individuell_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} in Geld ' +
        'geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. ' +
        'Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich:',
      includeIf: { and: [{ feld: 'teilIndividuell', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 632 OR',
      begruendung: 'Individuelle Teilliberierung mit separater Bankbescheinigung.',
    },
    {
      id: 'AE07i_liste',
      text: '– {{item.anzahl}} Aktien von {{item.name}} zu {{item.prozentTxt}} %',
      wiederholeUeber: 'gruenderTeilListe',
      includeIf: { feld: 'teilIndividuell', eq: true },
      norm: 'Art. 632 Abs. 1 OR',
      begruendung: 'Je Gründerin/Gründer eine Liberierungs-Zeile (ZH-Urkunde 3.1 Teilliberierungs-Variante; Haus-Fassung geschlechtsneutral «Aktien von» statt «Aktien des Gründers»).',
    },
    // ── Stufe 2 P1b: Agio bei Teilliberierung (reine Bargründung) ───────────
    {
      id: 'AE07x_agio_teilbar',
      text:
        'Zusätzlich wurde das Ausgabeagio von gesamthaft {{waehrungCode}} {{agioTotalFmt}} ' +
        '({{waehrungCode}} {{agioJeAktieFmt}} je Aktie) vollständig in Geld geleistet und gleichermassen ' +
        'zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { feld: 'hatAgioTeilBar', eq: true },
      norm: 'Art. 632 Abs. 1 OR',
      begruendung: 'Haus-Fassung (offengelegt): Die ZH-Muster decken Agio mit Teilliberierung nicht. Das Agio ist bei der Ausgabe VOLL zu leisten — teilliberierbar ist nur der Nennwert-Teil (Art. 632 Abs. 1 OR bezieht die 20 % auf den Nennwert jeder Aktie); die vorstehende Einlagen-Ziffer nennt darum nur den Nennwert-Teil, dieser Absatz weist das voll geleistete Agio aus.',
      hinweis: 'Der über Nennwert und Ausgabekosten hinaus erzielte Erlös (Agio) ist der gesetzlichen Kapitalreserve zuzuweisen (Art. 671 Abs. 1 Ziff. 1 OR, am Cache verifiziert).',
    },
    {
      id: 'AE07w_kurs',
      text:
        'Die geleisteten Einlagen entsprechen, aufgrund des Umrechnungskurses per {{waehrungCode}} 1.00 = ' +
        'CHF {{kursTxt}}, dem Betrag von CHF {{einbezahltChfFmt}}. Dieser Umrechnungskurs entspricht dem ' +
        'Devisenmittelkurs der {{kursQuelleTxt}}.',
      includeIf: { feld: 'fremdwaehrungAktiv', eq: true },
      norm: 'Art. 629 Abs. 3 OR',
      begruendung: 'Pflicht-Kurs-Satz der Fremdwährungs-Gründung nach ZH-Urkundenvorlage 3.2 verbatim — inkl. «per» (Bug-Check 3.1 Befund 1; Art. 629 Abs. 3 OR: angewandte Umrechnungskurse sind in der Urkunde anzugeben). Basis des CHF-Gegenwerts: geleistete Einlagen GESAMT (Nennwert-Teil + voll geleistetes Agio). Einlage-/Bewertungswährung = Kapitalwährung — gilt auch für Sacheinlagen, Verrechnungen und Vorteile (Stufe 2 P1a); Einlagen in einer DRITTEN Währung bleiben ausgeklammert.',
    },
    // ── Etappe 2: Einlagen bei gemischter und qualifizierter Gründung ───────
    {
      id: 'AE07g_geld_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} in Geld ' +
        'geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: false }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 633 OR',
      begruendung: 'Bar-Anteil der gemischten Gründung, voll liberiert (ZH-Bemerkung 3.3: Varianten «mit Ziff. IV der Textvorlage 3.1 kombinierbar»); Banknennung in der Urkunde. Stufe 2: Währungscode = Kapitalwährung.',
    },
    {
      id: 'AE07g_geld_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} in Geld ' +
        'geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: false }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 633 OR',
      begruendung: 'Bar-Anteil der gemischten Gründung (voll liberiert) mit separater Bankbescheinigung.',
    },
    // ── Stufe 2 P1d: gemischte TEILLIBERIERUNG — Bar-Teil zum globalen Grad,
    // Sach-/Verrechnungsaktien gelten als voll liberiert ──
    {
      id: 'AE07g_geld_teil_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} ' +
        '({{liberierungProzent}} % des Nennwerts jeder dieser Aktien) in Geld geleistet und bei der ' +
        '{{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und ' +
        'Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Die Aktien aus ' +
        'Sacheinlage und Verrechnung gelten als voll liberiert.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 632 OR',
      begruendung: 'Haus-Fassung (offengelegt): Die ZH-Muster kombinieren Teilliberierung und qualifizierte Einlagen nicht in einem Text. Teilliberierbar ist nur der Bar-Anteil (globaler Grad, mind. 20 % je Aktie, Art. 632 Abs. 1 OR); Aktien aus Sacheinlage/Verrechnung gelten als voll liberiert (ZH-Vertragsvorlage «als voll liberiert geltende Aktien») — der Urkunden-Text trennt beides ausdrücklich.',
    },
    {
      id: 'AE07g_geld_teil_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} ' +
        '({{liberierungProzent}} % des Nennwerts jeder dieser Aktien) in Geld geleistet und gemäss separater ' +
        'Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ' +
        'ausschliesslichen Verfügung der Gesellschaft hinterlegt. Die Aktien aus Sacheinlage und ' +
        'Verrechnung gelten als voll liberiert.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 632 OR',
      begruendung: 'Gemischte Teilliberierung mit separater Bankbescheinigung (Haus-Fassung wie die Bank-Variante).',
    },
    // ── Stufe 2 P1b/P1c: Agio bei gemischter/qualifizierter Gründung ────────
    {
      id: 'AE07gx_agio_gemischt',
      text:
        'Zusätzlich wurde auf den in Geld liberierten Aktien das Ausgabeagio von gesamthaft ' +
        '{{waehrungCode}} {{barAgioFmt}} ({{waehrungCode}} {{agioJeAktieFmt}} je Aktie) vollständig in Geld ' +
        'geleistet und gleichermassen hinterlegt; das Ausgabeagio der übrigen Aktien ist durch die ' +
        'angerechneten Sacheinlagen bzw. Verrechnungsforderungen gedeckt.',
      includeIf: { feld: 'hatAgioGemischt', eq: true },
      norm: 'Art. 629 Abs. 2 Ziff. 2 OR',
      begruendung: 'Haus-Fassung (offengelegt): Bei gemischter Gründung mit Agio wird das Agio der Bar-Aktien voll in Geld geleistet; bei den Sach-/Verrechnungsaktien deckt die Bewertung bzw. Forderung den GESAMTEN Ausgabebetrag (Wert-Gates rechnen Aktien × Ausgabebetrag, Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Der über Nennwert und Ausgabekosten hinaus erzielte Erlös (Agio) ist der gesetzlichen Kapitalreserve zuzuweisen (Art. 671 Abs. 1 Ziff. 1 OR, am Cache verifiziert).',
    },
    {
      id: 'AE07qx_agio_qualifiziert',
      text:
        'Das Ausgabeagio ist durch die angerechneten Sacheinlagen bzw. Verrechnungsforderungen gedeckt: ' +
        'Die Bewertung bzw. die zur Verrechnung gebrachte Forderung deckt den gesamten Ausgabebetrag der ' +
        'dafür ausgegebenen Aktien.',
      includeIf: { feld: 'hatAgioQualifiziertRein', eq: true },
      norm: 'Art. 629 Abs. 2 Ziff. 2 OR',
      begruendung: 'Haus-Fassung (offengelegt): Bei reiner Sach-/Verrechnungsgründung mit Agio fliesst kein Geld — die versprochenen Einlagen entsprechen dem gesamten Ausgabebetrag, weil die Wert-Gates je Position Aktien × Ausgabebetrag (+ Gutschrift) verlangen (Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Der über Nennwert und Ausgabekosten hinaus erzielte Erlös (Agio) ist der gesetzlichen Kapitalreserve zuzuweisen (Art. 671 Abs. 1 Ziff. 1 OR, am Cache verifiziert).',
    },
    {
      id: 'AE07q_intro_mit_titel',
      ueberschrift: 'Einlagen',
      text: '{{qualifiziertIntro}}',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'hatBarEinlage', eq: false }] },
      norm: 'Art. 629 Abs. 2 Ziff. 4 OR',
      begruendung: 'Einleitung des qualifizierten Einlagen-Blocks nach ZH-Urkunde 3.3 («Die in den Statuten angegebenen Sacheinlagen gemäss folgenden, uns vorliegenden Unterlagen» — Haus-Fassung ohne «uns», dritte Person); trägt die Abschnitts-Überschrift, wenn kein Bar-Absatz vorangeht.',
    },
    {
      id: 'AE07q_intro',
      text: '{{qualifiziertIntro}}',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'hatBarEinlage', eq: true }] },
      norm: 'Art. 629 Abs. 2 Ziff. 4 OR',
      begruendung: 'Einleitung des qualifizierten Einlagen-Blocks (gemischte Gründung — folgt dem Bar-Absatz unter derselben Ziffer).',
    },
    {
      id: 'AE07q_sachliste',
      text:
        '– Sacheinlagevertrag vom {{item.vertragDatumFmt}} mit {{item.einleger}} über {{item.objektLabel}} ' +
        '({{item.belegSatz}}; Bewertung {{waehrungCode}} {{item.wertFmt}} für {{item.aktien}} {{aktienArt}}{{item.gutschriftKlauselSatz}}), ' +
        'welcher genehmigt wird, mit der Bestätigung, dass die Gesellschaft nach ihrer Eintragung in das ' +
        'Handelsregister {{item.verfuegungsSatz}}.',
      wiederholeUeber: 'sachListe',
      includeIf: { feld: 'hatSacheinlagen', eq: true },
      norm: 'Art. 634 OR',
      begruendung: 'Je Sacheinlage eine Beleg-Zeile nach ZH-Urkunde 3.3 inkl. Grundstücks-Weiche (Art. 634 Abs. 1 Ziff. 3 OR: «sofort als Eigentümerin verfügen» vs. «bedingungsloser Anspruch auf Eintragung in das Grundbuch»).',
    },
    {
      id: 'AE07q_verrliste',
      text:
        '– Verrechnungsliberierung: {{item.aktien}} {{aktienArt}} werden durch Verrechnung mit einer ' +
        'Forderung von {{item.glaeubiger}} im Betrag von {{waehrungCode}} {{item.forderungFmt}} liberiert (Art. 634a OR).',
      wiederholeUeber: 'verrListe',
      includeIf: { feld: 'hatVerrechnungen', eq: true },
      norm: 'Art. 634a OR',
      begruendung: 'Je Verrechnungsliberierung eine Zeile — Haus-Fassung (die ZH-Vorlage kennt die Verrechnung nur in der Geschäftsübernahme-Variante; die generische Fassung deckt Art. 634a Abs. 1 OR, Bestand/Verrechenbarkeit belegt der Gründungsbericht, Art. 635 Ziff. 2 OR).',
    },
    {
      id: 'AE07q_vorteile',
      text: 'Ferner werden bei der Gründung die in den Statuten umschriebenen besonderen Vorteile gewährt.',
      includeIf: { feld: 'hatVorteile', eq: true },
      norm: 'Art. 636 OR',
      begruendung: 'Zusatz-Variante besondere Vorteile nach ZH-Urkunde 3.3.',
    },
    {
      id: 'AE07q_bericht',
      text:
        '– Gründungsbericht gemäss Art. 635 OR vom ________, von allen Gründerinnen und Gründern unterzeichnet.\n' +
        '– Prüfungsbestätigung gemäss Art. 635a OR vom ________ der zugelassenen Revisorin bzw. des zugelassenen ' +
        'Revisors {{revisorZeile}}, wonach der Gründungsbericht vollständig und richtig ist.',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 635a OR',
      begruendung: 'EINE Bericht- und Prüfungs-Zeile für alle Tatbestände (ZH-Bemerkung 3.3 erlaubt die Zusammenfassung ausdrücklich: «Werden mehrere Sachverhalte im gleichen Gründungsbericht … dargestellt, so ist der Varianten-Text entsprechend anzupassen»). Zugelassener REVISOR genügt (Art. 635a OR — Dossier: ZH-Checklisten-«Revisionsunternehmen» ist enger als das Gesetz).',
    },
    {
      id: 'AE07q_bericht_singular',
      text:
        '– Gründungsbericht gemäss Art. 635 OR vom ________, von der Gründerin bzw. dem Gründer unterzeichnet.\n' +
        '– Prüfungsbestätigung gemäss Art. 635a OR vom ________ der zugelassenen Revisorin bzw. des zugelassenen ' +
        'Revisors {{revisorZeile}}, wonach der Gründungsbericht vollständig und richtig ist.',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 635a OR',
      begruendung: 'Bericht-/Prüfungs-Zeile im Singular (D1).',
    },
    {
      id: 'AE07c_resteinlage',
      text:
        'Jede Gründerin und jeder Gründer verpflichtet sich, auf erstes Verlangen des Verwaltungsrates ' +
        'die restliche und vollständige Leistung der eigenen Einlage im Sinne von Art. 634b OR sofort zu erbringen.',
      includeIf: { and: [{ feld: 'vollLiberiert', eq: false }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 634b OR',
      begruendung: 'Resteinlage-Verpflichtungssatz der ZH-Urkunde verbatim (D6/0.3 — ersetzt die frühere Haus-Formulierung «sobald er es für nötig erachtet»). Norm-Gehalt: Art. 634b Abs. 1 OR lässt den VR die NACHTRÄGLICHE LEISTUNG BESCHLIESSEN; das «erste Verlangen» ist die vertragliche Verpflichtungsseite des Musters (Bug-Check-Befund 2, 7.6.2026).',
    },
    {
      id: 'AE07c_resteinlage_singular',
      text:
        'Die Gründerin bzw. der Gründer verpflichtet sich, auf erstes Verlangen des Verwaltungsrates ' +
        'die restliche und vollständige Leistung der Einlage im Sinne von Art. 634b OR sofort zu erbringen.',
      includeIf: { and: [{ feld: 'vollLiberiert', eq: false }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 634b OR',
      begruendung: 'Resteinlage-Verpflichtungssatz im Singular (D1/D6; ZH-Vorlage 3.5).',
    },
    {
      id: 'AE08_feststellungen',
      ueberschrift: 'Feststellungen',
      text:
        'Die Gründerinnen und Gründer stellen fest, dass:\n' +
        '– sämtliche Aktien gültig gezeichnet sind;\n' +
        '– die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen;\n' +
        '– die gesetzlichen und statutarischen Anforderungen an die geleisteten Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;\n' +
        '– keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 629 Abs. 2 OR',
      begruendung: 'Gesetzliche Feststellungen Ziff. 1–4 – Wortlaut der Norm folgend (ZH-Urkunde identisch).',
    },
    {
      id: 'AE08_feststellungen_singular',
      ueberschrift: 'Feststellungen',
      text:
        'Die Gründerin bzw. der Gründer stellt fest, dass:\n' +
        '– sämtliche Aktien gültig gezeichnet sind;\n' +
        '– die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen;\n' +
        '– die gesetzlichen und statutarischen Anforderungen an die geleisteten Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;\n' +
        '– keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 629 Abs. 2 OR',
      begruendung: 'Feststellungen im Singular (D1; ZH-Vorlage 3.5: «Ich stelle fest, dass …» — Haus-Fassung in der dritten Person).',
    },
    {
      id: 'AE09_organbestellung',
      ueberschrift: 'Organe',
      text: 'Als Mitglieder des Verwaltungsrates werden gewählt:',
      includeIf: { feld: 'einVr', eq: false },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Organbestellung in der Urkunde; Personenangaben nach Art. 44 lit. e HRegV.',
    },
    {
      id: 'AE09_organbestellung_singular',
      ueberschrift: 'Organe',
      text: 'Als Mitglied des Verwaltungsrates wird gewählt:',
      includeIf: { feld: 'einVr', eq: true },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Organbestellung im Singular bei eingliedrigem Verwaltungsrat (Numerus-Korrektur analog D1).',
    },
    {
      id: 'AE09b_vrliste',
      text: '– {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}{{item.praesidentZeile}}{{item.wahlannahmeSatz}}',
      wiederholeUeber: 'vrListe',
      begruendung: 'Je VR-Mitglied eine Zeile; Wahl-Zusatz «welche bzw. welcher hiermit die Annahme erklärt» nach der ZH-Erläuterung zu Ziff. VI, wenn die Annahme in der Urkunde erfolgt (Etappe 4.1/D8 — die separate Wahlannahmeerklärung ist dann entbehrlich, Art. 43 Abs. 1 lit. c HRegV).',
      norm: 'Art. 44 lit. e HRegV',
    },
    {
      id: 'AE10_revisionsstelle',
      text: 'Als Revisionsstelle wird gewählt: {{revisionsstelleName}}, {{revisionsstelleSitz}}.',
      includeIf: { feld: 'optingOut', eq: false },
      norm: 'Art. 44 lit. f HRegV',
      begruendung: 'Aufgenommen, weil eine Revisionsstelle bestellt wird.',
    },
    {
      id: 'AE11_opting_out',
      text:
        'Auf eine Revision wird verzichtet. Die Gründerinnen und Gründer stellen fest, dass:\n' +
        '– die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;\n' +
        '– die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;\n' +
        '– sämtliche Gründerinnen und Gründer auf eine eingeschränkte Revision verzichten.',
      includeIf: { and: [{ feld: 'optingOut', eq: true }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 727a Abs. 2 OR',
      begruendung: 'Opting-out bei der Gründung: dreigliedrige Feststellung direkt in der Urkunde (Art. 44 lit. f HRegV; ZH-KMU-Merkblatt und SG-Formular wortgleich).',
    },
    {
      id: 'AE11_opting_out_singular',
      text:
        'Auf eine Revision wird verzichtet. Die Gründerin bzw. der Gründer stellt fest, dass:\n' +
        '– die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;\n' +
        '– die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;\n' +
        '– die Gründerin bzw. der Gründer als einzige Aktionärin bzw. einziger Aktionär auf eine eingeschränkte Revision verzichtet.',
      includeIf: { and: [{ feld: 'optingOut', eq: true }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 727a Abs. 2 OR',
      begruendung: 'Opting-out im Singular (D1; ZH-Vorlage 3.5). Bug-Check-Befund 1 (7.6.2026): Art. 62 Abs. 1 lit. c HRegV verlangt die Erklärung, dass SÄMTLICHE Aktionärinnen und Aktionäre verzichtet haben — der Verzichtsträger bleibt darum auch im Singular ausdrücklich benannt («als einzige Aktionärin bzw. einziger Aktionär»), kein subjektloses Passiv.',
    },
    {
      id: 'AE12_domizil_eigen',
      ueberschrift: 'Rechtsdomizil',
      text: 'Das Rechtsdomizil der Gesellschaft befindet sich an folgender Adresse: {{rechtsdomizilAdresse}}.',
      includeIf: { and: [{ feld: 'domizilImDomizilArtikel', eq: true }, { feld: 'eigeneBueros', eq: true }] },
      norm: 'Art. 117 Abs. 2 HRegV',
      begruendung: 'Eigene Adresse am Sitz; die Ziffer entfällt, wenn das Domizil in der Konstituierungs-Ziffer steht oder weggelassen wird (ZH-Erläuterung zu Ziff. VII: Domizil kann in der Urkunde weggelassen werden, muss aber in der Anmeldung stehen — Etappe 4.2/D9).',
    },
    {
      id: 'AE12_domizil_co',
      ueberschrift: 'Rechtsdomizil',
      text:
        'Die Gesellschaft hat ihr Rechtsdomizil als c/o-Adresse bei {{domizilhalterName}}, ' +
        '{{domizilhalterAdresse}}. Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.',
      includeIf: { and: [{ feld: 'domizilImDomizilArtikel', eq: true }, { feld: 'eigeneBueros', eq: false }] },
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'c/o-Domizil mit Domizilannahmeerklärung als Beleg (Art. 43 Abs. 1 lit. g HRegV); Ziffer entfällt analog AE12_domizil_eigen (Etappe 4.2/D9).',
    },
    // ── Etappe 4.2/D9: Konstituierung + Domizil in der Urkunde (ZH Ziff. VII) ──
    {
      id: 'AE12k_konstituierung',
      ueberschrift: 'Konstituierung und Zeichnungsberechtigung',
      text:
        'Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist, erklären die soeben ' +
        'ernannten Mitglieder des Verwaltungsrates:',
      includeIf: { and: [{ feld: 'konstituierungInUrkunde', eq: true }, { feld: 'einVr', eq: false }] },
      norm: 'Art. 712 OR',
      begruendung: 'ZH-Urkunde Ziff. VII mit der Vollzähligkeits-Bedingung («[Variante: Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist]»). Haus-Abweichung (offengelegt): «die soeben ernannten Mitglieder des Verwaltungsrates» statt ZH «die soeben als Verwaltungsräte ernannten Gründer» — sprachliche Vereinfachung; in der Sache erzwingt das Gate, dass bei Konstituierung in der Urkunde ALLE VR-Mitglieder zugleich Gründer (Anwesende) sind (Sammel-Bug-Check 7.6.2026). Das separate VR-Protokoll ist damit entbehrlich (Art. 43 Abs. 1 lit. e HRegV — die Konstituierung ist aus der Urkunde ersichtlich).',
    },
    {
      id: 'AE12k_konstituierung_singular',
      ueberschrift: 'Konstituierung und Zeichnungsberechtigung',
      text: 'Das soeben ernannte einzige Mitglied des Verwaltungsrates erklärt:',
      includeIf: { and: [{ feld: 'konstituierungInUrkunde', eq: true }, { feld: 'einVr', eq: true }] },
      norm: 'Art. 712 OR',
      begruendung: 'Konstituierungs-Ziffer im Singular (eingliedriger VR — die Vollzähligkeits-Bedingung ist trivial erfüllt; D1-Numerus).',
    },
    {
      id: 'AE12k_liste',
      text: '– {{item.konstituierungZeile}}',
      wiederholeUeber: 'vrListe',
      includeIf: { feld: 'konstituierungInUrkunde', eq: true },
      norm: 'Art. 718 OR',
      begruendung: 'Je VR-Mitglied eine Zeile nach ZH Ziff. VII lit. a («… ist … mit … [Art der Zeichnungsberechtigung]»).',
    },
    {
      id: 'AE12k_domizil_eigen',
      text: 'Das Rechtsdomizil befindet sich an folgender Adresse: {{rechtsdomizilAdresse}} (eigene Geschäftsräume).',
      includeIf: { and: [{ feld: 'domizilInKonstituierung', eq: true }, { feld: 'eigeneBueros', eq: true }] },
      norm: 'Art. 117 Abs. 2 HRegV',
      begruendung: 'ZH Ziff. VII lit. b («Das Domizil befindet sich … mit Hinweis auf eigene Geschäftsräume oder auf die Erklärung des Domizilhalters»).',
    },
    {
      id: 'AE12k_domizil_co',
      text:
        'Das Rechtsdomizil befindet sich als c/o-Adresse bei {{domizilhalterName}}, {{domizilhalterAdresse}}. ' +
        'Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.',
      includeIf: { and: [{ feld: 'domizilInKonstituierung', eq: true }, { feld: 'eigeneBueros', eq: false }] },
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'ZH Ziff. VII lit. b, c/o-Fall («Eine allenfalls vorliegende Domizilhaltererklärung ist in der Urkunde zu nennen»).',
    },
    {
      id: 'AE13_nachtragsvollmacht',
      ueberschrift: 'Vollmacht',
      text:
        'Die Gründerinnen und Gründer bevollmächtigen {{nachtragsbevollmaechtigter}}, allfällige wegen ' +
        'Beanstandung durch die Handelsregisterbehörde erforderliche Änderungen an den Statuten oder am ' +
        'Errichtungsakt durch einen öffentlich zu beurkundenden Nachtrag namens aller Gründerinnen und ' +
        'Gründer vorzunehmen.',
      includeIf: { and: [{ feld: 'hatNachtragsvollmacht', eq: true }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 44 HRegV',
      begruendung: 'Aufgenommen, weil eine Nachtrags-Bevollmächtigung gewünscht ist (D10: ZH-Klausel «Auf Verlangen der Gründer» — eine benannte Person mit vollen Personalien: Vorname, Name, Geburtsdatum, Bürgerort bzw. Staatsangehörigkeit, Wohnadresse).',
    },
    {
      id: 'AE13_nachtragsvollmacht_singular',
      ueberschrift: 'Vollmacht',
      text:
        'Die Gründerin bzw. der Gründer bevollmächtigt {{nachtragsbevollmaechtigter}}, allfällige wegen ' +
        'Beanstandung durch die Handelsregisterbehörde erforderliche Änderungen an den Statuten oder am ' +
        'Errichtungsakt durch einen öffentlich zu beurkundenden Nachtrag in ihrem bzw. seinem Namen ' +
        'vorzunehmen.',
      includeIf: { and: [{ feld: 'hatNachtragsvollmacht', eq: true }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 44 HRegV',
      begruendung: 'Nachtragsvollmacht im Singular (D1/D10).',
    },
    {
      id: 'AE14_gruendungserklaerung',
      ueberschrift: 'Gründungserklärung',
      text: 'Abschliessend erklären die erschienenen Personen die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet. Die Gesellschaft ist zur Eintragung ins Handelsregister anzumelden.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Abschliessende Gründungserklärung mit Anmelde-Satz (ZH-Vorlage 3.1 Ziff. VIII wortgleich; Anmelde-Satz ergänzt per Musterabgleich 10.6.2026, B5 — deklaratorisch).',
    },
    {
      id: 'AE14_gruendungserklaerung_singular',
      ueberschrift: 'Gründungserklärung',
      text: 'Abschliessend erklärt die erschienene Person die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet. Die Gesellschaft ist zur Eintragung ins Handelsregister anzumelden.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Abschliessende Gründungserklärung im Singular (D1; ZH-Vorlage 3.5: «erkläre ich» — Haus-Fassung dritte Person). Anmelde-Satz ergänzt per Musterabgleich 10.6.2026 (B5).',
    },
    {
      id: 'AE15_belege',
      ueberschrift: 'Bestätigung der Urkundsperson',
      text:
        'Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und ' +
        'den Gründerinnen und Gründern vorgelegen haben (Art. 631 Abs. 1 OR):',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 631 OR',
      begruendung: 'Beleg-Nennung und Vorlage-Bestätigung durch die Urkundsperson.',
    },
    {
      id: 'AE15_belege_singular',
      ueberschrift: 'Bestätigung der Urkundsperson',
      text:
        'Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und ' +
        'der Gründerin bzw. dem Gründer vorgelegen haben (Art. 631 Abs. 1 OR):',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 631 OR',
      begruendung: 'Vorlage-Bestätigung im Singular (D1; ZH-Vorlage 3.5: «… dass ihr und dem Gründer bzw. dessen Vertreter … vorgelegen haben»).',
    },
    {
      id: 'AE15b_belegliste',
      text: '– {{item.titel}}',
      wiederholeUeber: 'belegeListe',
      begruendung: 'Je Beleg eine Zeile (Art. 631 Abs. 2 OR; bei der Bargründung: Statuten und – sofern die Bank nicht in der Urkunde genannt ist – die Hinterlegungs-Bestätigung).',
      norm: 'Art. 631 Abs. 2 OR',
    },
    {
      id: 'AE16_unterschriften',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'Unterschriften der Gründerinnen und Gründer (Art. 44 lit. i HRegV).',
      norm: 'Art. 44 lit. i HRegV',
    },
    {
      id: 'AE16_unterschriften_singular',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerin bzw. der Gründer:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Unterschrift im Singular (D1).',
      norm: 'Art. 44 lit. i HRegV',
    },
    {
      id: 'AE16b_unterschriftenliste',
      rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
      norm: 'Art. 44 lit. i HRegV',
    },
    {
      id: 'AE17_urkundsperson',
      rolle: 'unterschrift',
      text: 'Die Urkundsperson:\n\n_________________________________',
      begruendung: 'Beurkundungsvermerk – wird von der Urkundsperson nach kantonalem Beurkundungsrecht ergänzt.',
    },
  ],
};
