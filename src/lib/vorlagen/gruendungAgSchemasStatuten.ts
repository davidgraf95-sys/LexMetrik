import type { VorlageSchema } from './engine';

// ── 1 · STATUTEN (ENTWURF) ──────────────────────────────────────────────────

export const STATUTEN_SCHEMA: VorlageSchema = {
  id: 'ag-statuten',
  version: '1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026)',
  titel: 'Statuten',
  format: 'vertrag',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung der Gründung: ' +
    'Die Statuten der AG werden von der Urkundsperson geprüft und beglaubigt (Art. 22 Abs. 4 HRegV); ' +
    'massgeblich ist die beurkundete Fassung. Wortlaute nach den amtlichen Mustern ZH/SG/GL, ' +
    'verifiziert am OR-Stand 1.1.2026.',
  bausteine: [
    {
      id: 'AS00_ingress',
      text: 'der {{firma}} mit Sitz in {{sitz}}',
      begruendung: 'Identifikations-Ingress unter dem Dokumenttitel (Usanz aller amtlichen Muster).',
    },
    {
      id: 'AS01_firma_sitz',
      ueberschrift: 'Firma und Sitz',
      text: 'Unter der Firma {{firma}} besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Aktiengesellschaft gemäss Art. 620 ff. OR.',
      norm: 'Art. 626 Abs. 1 Ziff. 1 OR',
      begruendung: 'Pflichtinhalt Firma/Sitz (Wortlaut ZH/SG/GL wortgleich).',
    },
    {
      id: 'AS02_zweck',
      ueberschrift: 'Zweck',
      text: 'Die Gesellschaft bezweckt {{zweck}}.',
      norm: 'Art. 626 Abs. 1 Ziff. 2 OR',
      begruendung: 'Pflichtinhalt Zweck.',
    },
    {
      id: 'AS02b_zweck_erweiterung',
      text: 'Die Gesellschaft kann Zweigniederlassungen errichten, sich an anderen Unternehmen beteiligen, Grundstücke erwerben, halten und veräussern, Finanzierungen für eigene oder fremde Rechnung vornehmen sowie Sicherheiten für Verbindlichkeiten verbundener Gesellschaften leisten.',
      includeIf: { feld: 'zweckErweiterung', eq: true },
      norm: 'Art. 626 Abs. 1 Ziff. 2 OR',
      // Musterabgleich-Fix B1 10.6.2026 (recherche/ag-gruendung-musterabgleich.md):
      // Die frühere Begründung behauptete «ZH-/GL-Muster-Wortlaut» — falsch.
      begruendung: 'Aufgenommen, weil die übliche Zweck-Erweiterungsklausel gewählt wurde. HAUS-KURZFASSUNG: Die amtlichen Muster (ZH kurz+lang, GL, SG lang) führen einen einheitlichen, umfassenderen Wortlaut (Tochtergesellschaften im In- und Ausland · alle direkt oder indirekt zweckbezogenen Geschäfte · Grundeigentum auch belasten und verwalten · Garantien und Bürgschaften für Tochtergesellschaften und Dritte) – Wortlaut-Entscheid bei der Abnahme (Musterabgleich 10.6.2026, B1).',
    },
    {
      id: 'AS03_kapital',
      ueberschrift: 'Aktienkapital und Aktien',
      text:
        'Das Aktienkapital beträgt {{waehrungCode}} {{akFmt}} und ist eingeteilt in {{anzahlAktien}} {{aktienArt}} ' +
        'zu {{waehrungCode}} {{nennwertFmt}}. Die Aktien sind {{liberierungSatz}}.',
      norm: 'Art. 626 Abs. 1 Ziff. 3 und 4 OR',
      begruendung: 'Pflichtinhalt: Höhe des Kapitals, geleistete Einlagen (Liberierungsgrad) sowie Anzahl, Nennwert und Art der Aktien (rev. 2023; Wortlaut ZH/SG/GL).',
    },
    {
      id: 'AS03b_inhaber_bucheffekten',
      text:
        'Die Aktien lauten auf den Inhaber. Sie sind als Bucheffekten im Sinne des Bucheffektengesetzes ' +
        'vom 3. Oktober 2008 (BEG) ausgestaltet und bei {{verwahrungsstelleZeile}}, einer von der ' +
        'Gesellschaft bezeichneten Verwahrungsstelle in der Schweiz, hinterlegt.',
      includeIf: { feld: 'inhaberBucheffekten', eq: true },
      norm: 'Art. 622 Abs. 1bis OR',
      begruendung: 'Stufe 2 P2 (Haus-Fassung am Normtext, offengelegt): Inhaberaktien sind nur zulässig, wenn Beteiligungspapiere kotiert sind ODER die Inhaberaktien als Bucheffekten ausgestaltet und bei einer bezeichneten Verwahrungsstelle in der Schweiz hinterlegt bzw. im Hauptregister eingetragen sind (Art. 622 Abs. 1bis OR am Cache verifiziert) — die Statuten erklären die gewählte Voraussetzung.',
      hinweis: 'Der Nachweis ist der Handelsregister-Anmeldung beizulegen (Art. 43 Abs. 1 lit. i HRegV; Checklisten-Eintrag «inhaberaktien-nachweis»). Die Variante «im Hauptregister eingetragen» deckt dieser Text nicht ab — bei Bedarf anpassen.',
    },
    {
      id: 'AS03b_inhaber_kotiert',
      text:
        'Die Aktien lauten auf den Inhaber. Die Gesellschaft hat Beteiligungspapiere an einer Börse kotiert.',
      includeIf: { feld: 'inhaberKotiertAktiv', eq: true },
      norm: 'Art. 622 Abs. 1bis OR',
      begruendung: 'Stufe 2 P2: Kotierungs-Variante der Zulässigkeits-Erklärung (Art. 622 Abs. 1bis OR); bei einer Neugründung praxisfern, aber gesetzlich vorgesehen.',
    },
    // ── Etappe 2: Pflichtklauseln der qualifizierten Gründung ───────────────
    // ── Stufe 2 P3: Kapitalband + bedingtes Kapital (Module der GV — bei
    // der Gründung von den Gründern in den Statuten festgelegt) ──
    {
      id: 'AS03c_kapitalband_beide',
      ueberschrift: 'Kapitalband',
      text:
        'Der Verwaltungsrat ist ermächtigt, das Aktienkapital bis zum {{kbEndeFmt}} innerhalb des ' +
        'Kapitalbands mit einer unteren Grenze von {{waehrungCode}} {{kbUntergrenzeFmt}} und einer oberen ' +
        'Grenze von {{waehrungCode}} {{kbObergrenzeFmt}} zu erhöhen oder herabzusetzen. Eine Erhöhung ' +
        'erfolgt durch Ausgabe von höchstens {{kbMaxNeuTxt}} neuen, vollständig zu liberierenden ' +
        '{{aktienArt}} zu je {{waehrungCode}} {{nennwertFmt}}; eine Herabsetzung erfolgt durch Vernichtung ' +
        'von höchstens {{kbMaxWegTxt}} {{aktienArt}} oder durch Herabsetzung des Nennwerts. Das ' +
        'Bezugsrecht der Aktionäre ist weder eingeschränkt noch aufgehoben. Die Ermächtigung ist an ' +
        'keine weiteren Einschränkungen, Auflagen oder Bedingungen geknüpft. Nach Ablauf der ' +
        'Ermächtigung streicht der Verwaltungsrat die Bestimmungen über das Kapitalband aus den Statuten.',
      includeIf: { feld: 'kapitalbandBeide', eq: true },
      norm: 'Art. 653s OR',
      begruendung: 'Stufe 2 P3 (Haus-Fassung am 653t-Katalog, offengelegt — die amtlichen Gründungs-Muster enthalten kein Kapitalband-Modul): Ziff. 1 Grenzen, Ziff. 2 Ende der Ermächtigung, Ziff. 3 «keine weiteren Einschränkungen», Ziff. 4 Anzahl/Nennwert/Art, Ziff. 6/7 ohne Beschränkungen, Streichungspflicht nach Ablauf (Art. 653t Abs. 2 OR). Grenzen ±½ und Dauer ≤ 5 Jahre erzwingen die Gates (Art. 653s Abs. 1 und 2 OR, am Cache verifiziert).',
      hinweis: 'Die Herabsetzungs-Ermächtigung setzt voraus, dass die Gesellschaft NICHT auf die eingeschränkte Revision verzichtet hat (Art. 653s Abs. 4 OR) — bei Opting-out sperrt das Gate. Vorrechte einzelner Kategorien, besondere Vorteile und Bezugsrechts-Beschränkungen innerhalb des Bands (Art. 653t Abs. 1 Ziff. 5/7/8/9/10 OR) deckt diese Klausel nicht ab.',
    },
    {
      id: 'AS03c_kapitalband_erhoehen',
      ueberschrift: 'Kapitalband',
      text:
        'Der Verwaltungsrat ist ermächtigt, das Aktienkapital bis zum {{kbEndeFmt}} innerhalb des ' +
        'Kapitalbands mit einer unteren Grenze von {{waehrungCode}} {{kbUntergrenzeFmt}} (entspricht dem ' +
        'Aktienkapital) und einer oberen Grenze von {{waehrungCode}} {{kbObergrenzeFmt}} zu erhöhen; eine ' +
        'Herabsetzung des Aktienkapitals innerhalb des Kapitalbands ist ausgeschlossen. Die Erhöhung ' +
        'erfolgt durch Ausgabe von höchstens {{kbMaxNeuTxt}} neuen, vollständig zu liberierenden ' +
        '{{aktienArt}} zu je {{waehrungCode}} {{nennwertFmt}}. Das Bezugsrecht der Aktionäre ist weder ' +
        'eingeschränkt noch aufgehoben. Die Ermächtigung ist an keine weiteren Einschränkungen, Auflagen ' +
        'oder Bedingungen geknüpft. Nach Ablauf der Ermächtigung streicht der Verwaltungsrat die ' +
        'Bestimmungen über das Kapitalband aus den Statuten.',
      includeIf: { feld: 'kapitalbandErhoehen', eq: true },
      norm: 'Art. 653s OR',
      begruendung: 'Stufe 2 P3: Nur-Erhöhungs-Variante (Art. 653s Abs. 3 OR: «Sie können insbesondere vorsehen, dass der Verwaltungsrat das Aktienkapital nur erhöhen … kann») — die einzige bei Opting-out zulässige Variante (Art. 653s Abs. 4 OR). Untergrenze = eingetragenes Aktienkapital (die Gates erzwingen das).',
    },
    {
      id: 'AS03d_bedingtes_kapital',
      ueberschrift: 'Bedingtes Kapital',
      text:
        'Das Aktienkapital erhöht sich um höchstens {{waehrungCode}} {{bkBetragFmt}} durch Ausgabe von ' +
        'höchstens {{bkAnzahlTxt}} vollständig zu liberierenden {{aktienArt}} zu je {{waehrungCode}} ' +
        '{{nennwertFmt}}, soweit Wandel- oder Optionsrechte ausgeübt werden, die {{bkKreisTxt}} ' +
        'eingeräumt werden (bedingtes Kapital). Das Bezugsrecht der bisherigen Aktionäre ist ' +
        'ausgeschlossen, soweit die Wandel- oder Optionsrechte nicht ihnen zugeteilt werden. Die ' +
        'Ausübung der Wandel- oder Optionsrechte und der Verzicht auf diese Rechte erfolgen schriftlich.',
      includeIf: { feld: 'hatBedingtesKapital', eq: true },
      norm: 'Art. 653b OR',
      begruendung: 'Stufe 2 P3 (Haus-Fassung am 653b-Katalog, offengelegt): Ziff. 1 Nennbetrag, Ziff. 2 Anzahl/Nennwert/Art, Ziff. 3 Kreis der Berechtigten, Ziff. 4 Bezugsrechts-Folge, Ziff. 7 Form der Ausübung/des Verzichts (Haus-Default: schriftlich). Erhöhung «ohne Weiteres» bei Ausübung (Art. 653 Abs. 2 OR); Einlage mindestens zum Nennwert (Art. 653a Abs. 2 OR); Höchstbetrag ½ des eingetragenen Kapitals erzwingt das Gate (Art. 653a Abs. 1 OR, alle am Cache verifiziert).',
      hinweis: 'Werden Anleihens- oder ähnliche Obligationen mit Wandel-/Optionsrechten nicht den Aktionären vorweg angeboten, verlangen die Statuten ZUSÄTZLICHE Angaben (Art. 653b Abs. 2 OR) — nicht abgebildet. Vor dem Handelsregister-Eintrag eingeräumte Wandel-/Optionsrechte sind nichtig (Art. 653b Abs. 3 OR). Vorrechte einzelner Kategorien und Übertragungsbeschränkungen neuer Namenaktien (Ziff. 5/6) deckt die Klausel nicht ab.',
    },
    {
      id: 'AS06_sacheinlagen',
      ueberschrift: 'Sacheinlagen',
      text:
        'Die Gesellschaft übernimmt bei der Gründung von {{item.einleger}} als Sacheinlage: ' +
        '{{item.objektLabel}} ({{item.belegSatz}}), bewertet mit {{waehrungCode}} {{item.wertFmt}}. Dafür werden ' +
        '{{item.aktien}} {{aktienArt}} zu {{waehrungCode}} {{nennwertFmt}}{{ausgabeKlammerSatz}} ausgegeben{{item.gutschriftKlauselSatz}}.',
      wiederholeUeber: 'sachListe',
      includeIf: { feld: 'hatSacheinlagen', eq: true },
      norm: 'Art. 634 Abs. 4 OR',
      begruendung: 'Pflichtinhalt bei Sacheinlage: Gegenstand, Bewertung, Name des Einlegers, ausgegebene Aktien und allfällige weitere Gegenleistungen (Art. 634 Abs. 4 OR; Elemente-Katalog am Cache verifiziert, Dossier ag-qualifizierte-gruendung.md Teil 1). Haus-Formulierung — die amtlichen Muster enthalten keinen Standard-Klauseltext. Stufe 2: Beträge in der Kapitalwährung (Art. 621 Abs. 2 OR); bei Agio wird der Ausgabebetrag offengelegt (Bewertung deckt Aktien × Ausgabebetrag + Gutschrift, Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634 Abs. 4 Satz 2 OR — Nachfolgeregel des aufgehobenen Art. 628 aOR).',
    },
    {
      id: 'AS07_verrechnung',
      ueberschrift: 'Verrechnungsliberierung',
      text:
        'Bei der Gründung werden {{item.aktien}} {{aktienArt}} zu {{waehrungCode}} {{nennwertFmt}}{{ausgabeKlammerSatz}} durch Verrechnung ' +
        'mit einer Forderung von {{item.glaeubiger}} im Betrag von {{waehrungCode}} {{item.forderungFmt}} liberiert.',
      wiederholeUeber: 'verrListe',
      includeIf: { feld: 'hatVerrechnungen', eq: true },
      norm: 'Art. 634a Abs. 3 OR',
      begruendung: 'Pflichtinhalt bei Verrechnungsliberierung: Betrag der Forderung, Name des Aktionärs, zukommende Aktien (Art. 634a Abs. 3 OR am Cache verifiziert). Eigenständige qualifizierte Liberierungsart — KEINE Sacheinlage; Werthaltigkeit der Forderung ist keine Voraussetzung (Art. 634a Abs. 2 OR). Stufe 2: Forderungsbetrag in der Kapitalwährung; bei Agio deckt die Forderung Aktien × Ausgabebetrag (Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634a Abs. 3 Satz 2 OR).',
    },
    {
      id: 'AS08_vorteile',
      ueberschrift: 'Besondere Vorteile',
      text:
        'Bei der Gründung wird {{item.beguenstigter}} folgender besonderer Vorteil gewährt: ' +
        '{{item.inhalt}} (Wert: {{waehrungCode}} {{item.wertFmt}}).',
      wiederholeUeber: 'vorteilListe',
      includeIf: { feld: 'hatVorteile', eq: true },
      norm: 'Art. 636 OR',
      begruendung: 'Pflichtinhalt bei besonderen Vorteilen: begünstigte Personen mit Namen sowie Inhalt und Wert des gewährten Vorteils (Art. 636 OR am Cache verifiziert).',
    },
    // ── LANG-Stufe (Etappe 1/D18): amtliche ZH-Langvorlage, Block «Kapital» ──
    {
      id: 'ASL20_zertifikate',
      ueberschrift: 'Aktienzertifikate',
      text: 'Anstelle von einzelnen Aktien kann die Gesellschaft Zertifikate über mehrere Aktien ausstellen.',
      includeIf: { feld: 'istLang', eq: true },
      begruendung: 'ZH-Langvorlage verbatim; gesetzlich nicht besonders geregelt — zulässige Ausgestaltung der Aktien als Wertpapiere (vgl. Art. 622 Abs. 1 OR), darum ohne Norm-Chip.',
    },
    {
      id: 'ASL21_zerlegung',
      ueberschrift: 'Zerlegung und Zusammenlegung von Aktien',
      text:
        'Die Generalversammlung kann bei unverändert bleibendem Aktienkapital durch Statutenänderung Aktien in solche von kleinerem Nennwert zerlegen oder zu solchen von grösserem Nennwert zusammenlegen; die Zusammenlegung bedarf der Zustimmung aller betroffenen Aktionäre.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 623 OR',
      begruendung: 'ZH-Langvorlage; Haus-Präzisierung (offengelegt): ZH sagt «der Zustimmung des Aktionärs» — Art. 623 Abs. 2 OR verlangt bei nicht kotierten Aktien die Zustimmung ALLER betroffenen Aktionäre.',
    },
    {
      id: 'ASL22_aktienbuch',
      ueberschrift: 'Aktienbuch',
      text:
        'Der Verwaltungsrat führt über alle Namenaktien ein Aktienbuch, in welches die Eigentümer und Nutzniesser mit Namen und Adresse eingetragen werden.\n' +
        'Im Verhältnis zur Gesellschaft gilt als Aktionär oder als Nutzniesser, wer im Aktienbuch eingetragen ist.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 686 OR',
      begruendung: 'ZH-Langvorlage verbatim (Aktienbuch-Führung und Legitimationswirkung, Art. 686 Abs. 1 und 4 OR).',
    },
    {
      id: 'AS10_vinkulierung',
      ueberschrift: 'Übertragung der Aktien',
      text:
        'Die Übertragung der Namenaktien oder die Begründung einer Nutzniessung an Namenaktien bedarf der Genehmigung durch den Verwaltungsrat.\n' +
        'Der Verwaltungsrat kann das Gesuch um Zustimmung ablehnen, wenn er im Namen der Gesellschaft dem Veräusserer anbietet, die Aktien für deren Rechnung, für Rechnung anderer Aktionäre oder für Rechnung Dritter zum wirklichen Wert im Zeitpunkt des Gesuches zu übernehmen, oder wenn der Erwerber nicht ausdrücklich erklärt, dass er die Aktien im eigenen Namen und auf eigene Rechnung erworben hat.\n' +
        'Werden Aktien durch Erbgang, Erbteilung, eheliches Güterrecht oder Zwangsvollstreckung erworben, so kann die Gesellschaft das Gesuch um Zustimmung nur ablehnen, wenn sie dem Erwerber die Übernahme der Aktien zum wirklichen Wert anbietet. Der Erwerber kann verlangen, dass das Gericht am Sitz der Gesellschaft den wirklichen Wert bestimmt; die Kosten der Bewertung trägt die Gesellschaft.',
      includeIf: { feld: 'vinkulierung', eq: true },
      norm: 'Art. 685a und 685b OR',
      begruendung: 'Aufgenommen, weil die Vinkulierung gewählt wurde – Muster ZH/SG/GL; P5-Schärfung B4 (7.6.2026): Drei-Rechnungs-Formel nach Art. 685b Abs. 1 OR («für deren Rechnung, für Rechnung anderer Aktionäre oder für Rechnung Dritter» — SG/GL ausführlicher als die frühere Haus-Kürzung) und Bewertungs-/Kostensatz nach Art. 685b Abs. 5 OR (Gesetzeswortlaut «das Gericht», am Cache verifiziert; SG-Muster sagt «Richter»).',
    },
    // ── LANG-Stufe: Block «Generalversammlung» (ZH-Langvorlage) ─────────────
    {
      id: 'ASL30_gv_befugnisse',
      ueberschrift: 'Befugnisse der Generalversammlung',
      text:
        'Oberstes Organ der Gesellschaft ist die Generalversammlung der Aktionäre. Ihr stehen folgende unübertragbare Befugnisse zu:\n' +
        '– die Festsetzung und Änderung der Statuten;\n' +
        '– die Wahl der Mitglieder des Verwaltungsrates und der Revisionsstelle;\n' +
        '– die Genehmigung des Lageberichts und der Konzernrechnung;\n' +
        '– die Genehmigung der Jahresrechnung sowie die Beschlussfassung über die Verwendung des Bilanzgewinnes, insbesondere die Festsetzung der Dividende und der Tantieme;\n' +
        '– die Festsetzung der Zwischendividende und die Genehmigung des dafür erforderlichen Zwischenabschlusses;\n' +
        '– die Beschlussfassung über die Rückzahlung der gesetzlichen Kapitalreserve;\n' +
        '– die Entlastung der Mitglieder des Verwaltungsrates;\n' +
        '– die Beschlussfassung über die Gegenstände, die der Generalversammlung durch das Gesetz oder die Statuten vorbehalten sind.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 698 OR',
      begruendung: 'ZH-Langvorlage verbatim — Befugnis-Katalog nach revidiertem Recht (inkl. Zwischendividende und Rückzahlung der gesetzlichen Kapitalreserve, Art. 698 Abs. 2 OR).',
    },
    {
      id: 'ASL31_einberufung',
      ueberschrift: 'Einberufung und Traktandierung',
      text:
        'Die ordentliche Versammlung findet jährlich innerhalb von sechs Monaten nach Abschluss des Geschäftsjahres statt, ausserordentliche Versammlungen werden je nach Bedürfnis einberufen.\n' +
        'Der Verwaltungsrat teilt den Aktionären die Einberufung der Generalversammlung mindestens 20 Tage vor dem Versammlungstag mit. Die Einberufung erfolgt durch den Verwaltungsrat, nötigenfalls durch die Revisionsstelle. Das Einberufungsrecht steht auch den Liquidatoren und den Vertretern der Anleihensgläubiger zu.\n' +
        'Die Einberufung einer Generalversammlung kann auch von einem oder mehreren Aktionären, die zusammen über mindestens 10 Prozent des Aktienkapitals oder der Stimmen verfügen, verlangt werden. Sie müssen die Einberufung schriftlich verlangen. Die Verhandlungsgegenstände und Anträge müssen im Begehren enthalten sein.\n' +
        'In der Einberufung sind das Datum, der Beginn, die Art und der Ort der Generalversammlung, die Verhandlungsgegenstände, die Anträge des Verwaltungsrates, gegebenenfalls die Anträge der Aktionäre samt kurzer Begründung sowie gegebenenfalls der Name und die Adresse des unabhängigen Stimmrechtsvertreters bekanntzugeben.\n' +
        'Mindestens 20 Tage vor der ordentlichen Generalversammlung sind der Geschäftsbericht und die Revisionsberichte den Aktionären zugänglich zu machen. Sofern die Unterlagen nicht elektronisch zugänglich sind, kann jeder Aktionär verlangen, dass ihm diese rechtzeitig zugestellt werden. Jeder Aktionär kann während eines Jahres nach der Generalversammlung verlangen, dass ihm der Geschäftsbericht in der von der Generalversammlung genehmigten Form sowie die Revisionsberichte zugestellt werden, sofern die Unterlagen nicht elektronisch zugänglich sind.\n' +
        'Aktionäre, die zusammen über mindestens 5 Prozent des Aktienkapitals oder der Stimmen verfügen, können die Traktandierung von Verhandlungsgegenständen oder die Aufnahme eines Antrages zu einem Verhandlungsgegenstand in die Einberufung der Generalversammlung verlangen.\n' +
        'Über Anträge zu nicht gehörig angekündigten Verhandlungsgegenständen können keine Beschlüsse gefasst werden; ausgenommen sind Anträge auf Einberufung einer ausserordentlichen Generalversammlung, auf Durchführung einer Sonderuntersuchung und auf Wahl einer Revisionsstelle.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 700 OR',
      begruendung: 'ZH-Langvorlage verbatim (inkl. Original-Interpunktion — Bug-Check B1, 7.6.2026). Norm-Kette: 6-Monats-Frist und Einberufungsrecht Art. 699 OR (10 % Abs. 3), Unterlagen-Zugänglichkeit Art. 699a OR, Traktandierungsrecht 5 % Art. 699b OR, Inhalt und Ankündigungs-Schranke Art. 700 OR.',
    },
    {
      id: 'AS13_beschlussfassung_virtuell',
      ueberschrift: 'Beschlussfassungsarten der Aktionäre',
      text:
        'Aktionäre können unter Beachtung der Einberufungs- und Traktandierungsvorschriften die Generalversammlungen vor Ort oder hybrid (vor Ort und virtuell) oder virtuell abhalten. ' +
        'Bei einer virtuellen Generalversammlung kann der Verwaltungsrat im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.\n' +
        'Sofern kein Aktionär oder dessen Vertretung eine mündliche Beratung an einer Generalversammlung verlangt, können die Aktionäre ihre Beschlüsse gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen.',
      includeIf: { feld: 'virtuelleGv', eq: true },
      norm: 'Art. 701d OR',
      begruendung: 'Beschlussfassungsarten-Artikel der amtlichen ZH-Kurzvorlage (Satz 1 verbatim); virtuelle GV braucht die statutarische Grundlage (Art. 701d OR), der Schriftweg-Satz gibt Art. 701 Abs. 3 OR wieder.',
      hinweis: 'Ein genereller statutarischer Verzicht auf die unabhängige Stimmrechtsvertretung ist unzulässig – zulässig ist nur die Einzelfall-Ermächtigung (EHRA-Praxismitteilung 1/23).',
    },
    {
      id: 'AS13_beschlussfassung',
      ueberschrift: 'Beschlussfassungsarten der Aktionäre',
      text:
        'Sofern kein Aktionär oder dessen Vertretung eine mündliche Beratung an einer Generalversammlung verlangt, können die Aktionäre ihre Beschlüsse gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen.',
      includeIf: { feld: 'virtuelleGv', eq: false },
      norm: 'Art. 701 Abs. 3 OR',
      begruendung: 'Beschlussfassungsarten-Artikel der amtlichen ZH-Kurzvorlage ohne den Virtuell-Satz (keine 701d-Grundlage gewählt); der Schriftweg-Satz gibt geltendes Recht deklaratorisch wieder.',
    },
    {
      id: 'ASL32_tagungsort',
      ueberschrift: 'Generalversammlung mit Tagungsort',
      text:
        'Der Verwaltungsrat bestimmt den Tagungsort der Generalversammlung. Durch die Festlegung des Tagungsortes darf für keinen Aktionär die Ausübung seiner Rechte im Zusammenhang mit der Generalversammlung in unsachlicher Weise erschwert werden.\n' +
        'Die Generalversammlung kann an verschiedenen Orten gleichzeitig durchgeführt werden. Die Voten der Teilnehmer müssen in diesem Fall unmittelbar in Bild und Ton an sämtliche Tagungsorte übertragen werden.\n' +
        'Die Generalversammlung kann im Ausland durchgeführt werden, wenn der Verwaltungsrat in der Einberufung einen unabhängigen Stimmrechtsvertreter bezeichnet. Der Verwaltungsrat kann auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters verzichten, sofern alle Aktionäre damit einverstanden sind.\n' +
        'Der Verwaltungsrat kann vorsehen, dass Aktionäre, die nicht am Ort der Generalversammlung anwesend sind, ihre Rechte auf elektronischem Weg ausüben können.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 701a OR',
      begruendung: 'ZH-Langvorlage verbatim (Tagungsort und mehrere Orte Art. 701a OR; Ausland mit Stimmrechtsvertreter-Statutengrundlage Art. 701b OR; elektronische Rechtsausübung Art. 701c OR).',
    },
    {
      id: 'ASL33_virtuell',
      ueberschrift: 'Generalversammlung ohne Tagungsort (virtuell)',
      text:
        'Eine Generalversammlung kann mit elektronischen Mitteln ohne Tagungsort durchgeführt werden. Der Verwaltungsrat kann im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.\n' +
        'Der Verwaltungsrat regelt die Verwendung elektronischer Mittel. Er stellt sicher, dass die Identität der Teilnehmer feststeht, die Voten in der Generalversammlung unmittelbar übertragen werden, jeder Teilnehmer Anträge stellen und sich an der Diskussion beteiligen kann und das Abstimmungsergebnis nicht verfälscht werden kann.\n' +
        'Treten während der Generalversammlung technische Probleme auf, sodass die Generalversammlung nicht ordnungsgemäss durchgeführt werden kann, so muss sie wiederholt werden. Beschlüsse, welche die Generalversammlung vor dem Auftreten der technischen Probleme gefasst hat, bleiben gültig.',
      includeIf: { and: [{ feld: 'istLang', eq: true }, { feld: 'virtuelleGv', eq: true }] },
      norm: 'Art. 701d OR',
      begruendung: 'ZH-Langvorlage; Haus-Abweichung (offengelegt): Der ZH-Satz «Auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters kann verzichtet werden» ist als EINZELFALL-Ermächtigung des VR gefasst — ein genereller statutarischer Verzicht ist unzulässig (EHRA-Praxismitteilung 1/23). Technik-Pannen-Klausel = Art. 701f OR sinngemäss.',
      hinweis: 'Nur mit der Weiche «virtuelle GV» — der Artikel selbst ist die statutarische Grundlage nach Art. 701d Abs. 1 OR.',
    },
    {
      id: 'ASL34_vorsitz',
      ueberschrift: 'Vorsitz und Protokoll',
      text:
        'Den Vorsitz in der Generalversammlung führt der Präsident, in dessen Verhinderungsfalle ein anderes vom Verwaltungsrat bestimmtes Mitglied desselben. Nimmt kein Mitglied des Verwaltungsrates teil, wählt die Generalversammlung einen Tagesvorsitzenden.\n' +
        'Der Vorsitzende bezeichnet den Protokollführer und die Stimmenzähler, die nicht Aktionäre zu sein brauchen. Das Protokoll ist vom Vorsitzenden und vom Protokollführer zu unterzeichnen. Jeder Aktionär kann verlangen, dass ihm das Protokoll innerhalb von 30 Tagen nach der Generalversammlung zugänglich gemacht wird.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 702 OR',
      begruendung: 'ZH-Langvorlage verbatim (Protokollführung und 30-Tage-Zugänglichkeit, Art. 702 Abs. 2 und 4 OR).',
    },
    {
      id: 'ASL35_zirkular',
      ueberschrift: 'Protokollierung von schriftlichen Beschlüssen der Aktionäre',
      text:
        'Aktionäre können schriftliche Beschlüsse auf dem Zirkularweg oder mittels schriftlicher Abstimmung fassen. Diese Beschlüsse können auf schriftlichem Weg auf Papier, mittels einer vom Verwaltungsrat bezeichneten elektronischen Plattform oder in elektronischer Form, welche den Nachweis in Textform vorsieht, gefasst werden.\n' +
        'Ein Zirkularbeschluss ist von sämtlichen Aktionären zu unterzeichnen und mit der ausdrücklichen Feststellung eines Mitglieds des Verwaltungsrates zu ergänzen, dass die Beschlussfassung damit gültig zustande gekommen ist. Das Mitglied des Verwaltungsrates muss den Zirkularbeschluss mitunterzeichnen.\n' +
        'Sofern die Aktionäre mittels schriftlicher Abstimmung einen Beschluss fassen, muss in einem Erwahrungsprotokoll des Verwaltungsrates der Ablauf der schriftlichen Beschlussfassung sowie das Abstimmungsergebnis festgehalten werden. Das Erwahrungsprotokoll ist vom Vorsitzenden und Protokollführer zu unterzeichnen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 701 Abs. 3 OR',
      begruendung: 'ZH-Langvorlage verbatim (schriftliche Beschlussfassung Art. 701 Abs. 3 OR; Erwahrungsprotokoll-Praxis nach EHRA-Praxismitteilung 1/24).',
    },
    {
      id: 'ASL36_stimmrecht',
      ueberschrift: 'Stimmrecht und Vertretung',
      text:
        'Die Aktionäre üben ihr Stimmrecht in der Generalversammlung nach Verhältnis des gesamten Nennwerts der ihnen gehörenden Aktien aus.\n' +
        'Die Mitgliedschaftsrechte aus Namenaktien kann ausüben, wer durch den Eintrag im Aktienbuch ausgewiesen oder vom Aktionär dazu schriftlich bevollmächtigt ist.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 692 OR',
      begruendung: 'ZH-Langvorlage verbatim (Stimmkraft nach Nennwert Art. 692 Abs. 1 OR; Legitimation/Vertretung Art. 689a Abs. 1 OR).',
    },
    {
      id: 'ASL37_beschlussfassung',
      ueberschrift: 'Beschlussfassung',
      text:
        'Die Generalversammlung fasst ihre Beschlüsse und vollzieht ihre Wahlen, soweit das Gesetz oder die Statuten es nicht anders bestimmen, mit der Mehrheit der vertretenen Aktienstimmen.{{stichentscheidSatz}}\n' +
        'Ein Beschluss der Generalversammlung, der mindestens zwei Drittel der vertretenen Stimmen und die Mehrheit der vertretenen Aktiennennwerte auf sich vereinigt, ist erforderlich für:\n' +
        '– die Änderung des Gesellschaftszweckes;\n' +
        '– die Zusammenlegung von Aktien, soweit dafür nicht die Zustimmung aller betroffenen Aktionäre erforderlich ist;\n' +
        '– die Kapitalerhöhung aus Eigenkapital, gegen Sacheinlagen oder durch Verrechnung mit einer Forderung und die Gewährung von besonderen Vorteilen;\n' +
        '– die Einschränkung oder Aufhebung des Bezugsrechts;\n' +
        '– die Einführung eines bedingten Kapitals oder die Einführung eines Kapitalbands;\n' +
        '– die Umwandlung von Partizipationsscheinen in Aktien;\n' +
        '– die Beschränkung der Übertragbarkeit von Namenaktien;\n' +
        '– die Einführung von Stimmrechtsaktien;\n' +
        '– den Wechsel der Währung des Aktienkapitals;\n' +
        '– die Einführung des Stichentscheids des Vorsitzenden in der Generalversammlung;\n' +
        '– eine Statutenbestimmung zur Durchführung der Generalversammlung im Ausland;\n' +
        '– die Verlegung des Sitzes der Gesellschaft;\n' +
        '– die Einführung einer statutarischen Schiedsklausel;\n' +
        '– den Verzicht auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters für die Durchführung einer virtuellen Generalversammlung bei Gesellschaften, deren Aktien nicht an einer Börse kotiert sind;\n' +
        '– die Auflösung der Gesellschaft.\n' +
        'Statutenbestimmungen, die für die Fassung bestimmter Beschlüsse grössere Mehrheiten als die vom Gesetz vorgeschriebenen festlegen, können nur mit dem vorgesehenen Mehr eingeführt, geändert oder aufgehoben werden.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 703 und 704 OR',
      begruendung: 'ZH-Langvorlage verbatim — Mehrheitserfordernis (Art. 703 OR), statutarischer Stichentscheid des Vorsitzenden (P3: als Weiche abwählbar — der SG-Lang-Default kennt KEINEN Stichentscheid, Kantonsvergleich B8; ohne Klausel gilt: Stimmengleichheit = Antrag abgelehnt) sowie der qualifizierte Katalog nach revidiertem Recht (Art. 704 Abs. 1 OR, inkl. Währungswechsel, Kapitalband, Schiedsklausel, GV im Ausland, Sitzverlegung, Stimmrechtsvertreter-Verzicht) und die Verschärfungs-Schranke (Art. 704 Abs. 2 OR). Haus-Anmerkung (Bug-Check B2, 7.6.2026): Ziff. 12 des Gesetzeskatalogs (Dekotierung der Beteiligungspapiere) ist wie in der ZH-Vorlage bewusst weggelassen — sie betrifft nur Gesellschaften mit börsenkotierten Papieren.',
    },
    // ── LANG-Stufe: Block «Verwaltungsrat» (ZH-Langvorlage) ─────────────────
    {
      id: 'ASL40_vr_wahl',
      ueberschrift: 'Wahl und Zusammensetzung des Verwaltungsrates',
      text:
        'Der Verwaltungsrat der Gesellschaft besteht aus einem oder mehreren Mitgliedern.\n' +
        'Die Mitglieder des Verwaltungsrates werden auf drei Jahre gewählt. Neugewählte treten in die Amtsdauer derjenigen Mitglieder ein, die sie ersetzen.\n' +
        'Der Verwaltungsrat konstituiert sich selbst. Er bezeichnet seinen Präsidenten und den Sekretär. Dieser muss dem Verwaltungsrat nicht angehören.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 710 OR',
      begruendung: 'ZH-Langvorlage verbatim (ein oder mehrere Mitglieder Art. 707 Abs. 1 OR; Amtsdauer drei Jahre Art. 710 Abs. 2 OR; Selbstkonstituierung Art. 712 Abs. 2 OR).',
    },
    {
      id: 'ASL41_vr_sitzungen',
      ueberschrift: 'Sitzungen und Beschlussfassung des Verwaltungsrates',
      text:
        'Beschlussfähigkeit, Beschlussfassung und Geschäftsordnung werden im Organisationsreglement geregelt. Jedes Mitglied des Verwaltungsrates kann unter Angabe der Gründe vom Präsidenten die unverzügliche Einberufung einer Sitzung verlangen.\n' +
        'Bei der Beschlussfassung in Sitzungen des Verwaltungsrates hat der Vorsitzende den Stichentscheid. Beschlüsse können auch auf dem Wege der schriftlichen Zustimmung oder in elektronischer Form zu einem gestellten Antrag gefasst werden, sofern nicht ein Mitglied die mündliche Beratung verlangt.\n' +
        'Über die Verhandlungen und Beschlüsse ist ein Protokoll zu führen, das vom Vorsitzenden und vom Sekretär unterzeichnet wird.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 713 OR',
      begruendung: 'ZH-Langvorlage verbatim (Einberufungsrecht Art. 715 OR; Beschlussformen und Protokoll Art. 713 OR).',
    },
    {
      id: 'ASL42_vr_zirkular',
      ueberschrift: 'Protokollierung von Beschlüssen des Verwaltungsrates',
      text:
        'Der Verwaltungsrat kann auf dem Zirkularweg oder mittels schriftlicher Abstimmung Beschluss fassen. Diese Beschlüsse können auf schriftlichem Weg auf Papier, mittels einer vom Verwaltungsrat bezeichneten elektronischen Plattform oder in elektronischer Form, welche den Nachweis in Textform vorsieht, gefasst werden.\n' +
        'Ein Zirkularbeschluss ist von sämtlichen Mitgliedern des Verwaltungsrates zu unterzeichnen.\n' +
        'Sofern die Mitglieder des Verwaltungsrates mittels schriftlicher Abstimmung einen Beschluss fassen, muss in einem Erwahrungsprotokoll des Verwaltungsrates der Ablauf der schriftlichen Beschlussfassung sowie das Abstimmungsergebnis festgehalten werden. Das Erwahrungsprotokoll ist vom Vorsitzenden und Protokollführer zu unterzeichnen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 713 Abs. 2 OR',
      begruendung: 'ZH-Langvorlage verbatim (Beschlussformen Art. 713 Abs. 2 OR; Erwahrungsprotokoll-Praxis nach EHRA-Praxismitteilung 1/24).',
    },
    {
      id: 'ASL43_vr_auskunft',
      ueberschrift: 'Recht auf Auskunft und Einsicht',
      text:
        'Jedes Mitglied des Verwaltungsrates kann Auskunft über alle Angelegenheiten der Gesellschaft verlangen.\n' +
        'In den Sitzungen sind alle Mitglieder des Verwaltungsrates sowie die mit der Geschäftsführung betrauten Personen zur Auskunft verpflichtet.\n' +
        'Ausserhalb der Sitzungen kann jedes Mitglied von den mit der Geschäftsführung betrauten Personen Auskunft über den Geschäftsgang und, mit Ermächtigung des Präsidenten, auch über einzelne Geschäfte verlangen.\n' +
        'Soweit es für die Erfüllung einer Aufgabe erforderlich ist, kann jedes Mitglied dem Präsidenten beantragen, dass ihm Bücher und Akten vorgelegt werden.\n' +
        'Weist der Präsident ein Gesuch auf Auskunft, Anhörung oder Einsicht ab, so entscheidet der Verwaltungsrat.\n' +
        'Regelungen oder Beschlüsse des Verwaltungsrates, die das Recht auf Auskunft und Einsichtnahme der Verwaltungsräte erweitern, bleiben vorbehalten.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 715a OR',
      begruendung: 'ZH-Langvorlage verbatim (Wiedergabe von Art. 715a Abs. 1–6 OR).',
    },
    {
      id: 'ASL44_vr_aufgaben',
      ueberschrift: 'Aufgaben des Verwaltungsrates',
      text:
        'Der Verwaltungsrat kann in allen Angelegenheiten Beschluss fassen, die nicht nach Gesetz oder Statuten der Generalversammlung zugeteilt sind. Er führt die Geschäfte der Gesellschaft, soweit er die Geschäftsführung nicht übertragen hat.\n' +
        'Der Verwaltungsrat hat folgende unübertragbare und unentziehbare Aufgaben:\n' +
        '– die Oberleitung der Gesellschaft und die Erteilung der nötigen Weisungen;\n' +
        '– die Festlegung der Organisation;\n' +
        '– die Ausgestaltung des Rechnungswesens, der Finanzkontrolle sowie der Finanzplanung, sofern diese für die Führung der Gesellschaft notwendig ist;\n' +
        '– die Ernennung und Abberufung der mit der Geschäftsführung und der Vertretung betrauten Personen;\n' +
        '– die Oberaufsicht über die mit der Geschäftsführung betrauten Personen, namentlich im Hinblick auf die Befolgung der Gesetze, Statuten, Reglemente und Weisungen;\n' +
        '– die Erstellung des Geschäftsberichtes sowie die Vorbereitung der Generalversammlung und die Ausführung ihrer Beschlüsse;\n' +
        '– die Einreichung eines Gesuchs um Nachlassstundung und die Benachrichtigung des Gerichts im Falle der Überschuldung.\n' +
        'Der Verwaltungsrat kann die Vorbereitung und die Ausführung seiner Beschlüsse oder die Überwachung von Geschäften Ausschüssen oder einzelnen Mitgliedern zuweisen. Er hat für eine angemessene Berichterstattung an seine Mitglieder zu sorgen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 716a OR',
      begruendung: 'ZH-Langvorlage verbatim (Vermutungskompetenz Art. 716 OR; unübertragbare Aufgaben Art. 716a Abs. 1 OR; Ausschüsse Art. 716a Abs. 2 OR).',
    },
    {
      id: 'ASL45_vr_delegation',
      ueberschrift: 'Übertragung der Geschäftsführung und der Vertretung',
      text:
        'Der Verwaltungsrat kann die Geschäftsführung nach Massgabe eines Organisationsreglementes ganz oder zum Teil an einzelne Mitglieder oder an Dritte übertragen (Geschäftsleitung).\n' +
        'Das Organisationsreglement ordnet die Geschäftsführung, bestimmt die hierfür erforderlichen Stellen, umschreibt deren Aufgaben und regelt insbesondere die Berichterstattung.\n' +
        'Soweit die Geschäftsführung nicht übertragen worden ist, steht sie allen Mitgliedern des Verwaltungsrates gesamthaft zu.\n' +
        'Der Verwaltungsrat kann die Vertretung einem oder mehreren Mitgliedern (Delegierte) oder Dritten (Direktoren) übertragen. Mindestens ein Mitglied des Verwaltungsrates muss zur Vertretung befugt sein. Die Gesellschaft muss durch eine Person vertreten werden können, die Wohnsitz in der Schweiz hat.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 716b OR',
      begruendung: 'ZH-Langvorlage (Delegation Art. 716b OR; Vertretung Art. 718 Abs. 2–4 OR). Haus-Korrektur (offengelegt): ZH schreibt «an einzelnen Mitgliedern oder an Dritten» — grammatisch richtig ist der Akkusativ «an einzelne Mitglieder oder an Dritte».',
    },
    // ── LANG-Stufe: Block «Revisionsstelle» (ZH-Langvorlage) ────────────────
    {
      id: 'ASL50_revision',
      ueberschrift: 'Revision',
      text:
        'Die Generalversammlung wählt eine Revisionsstelle. Sie kann auf die Wahl einer Revisionsstelle verzichten, wenn:\n' +
        '– die Gesellschaft nicht zur ordentlichen Revision verpflichtet ist;\n' +
        '– sämtliche Aktionäre zustimmen; und\n' +
        '– die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat.\n' +
        'Der Verzicht gilt auch für die nachfolgenden Jahre. Jeder Aktionär hat jedoch das Recht, spätestens zehn Tage vor der Generalversammlung die Durchführung einer eingeschränkten Revision und die Wahl einer entsprechenden Revisionsstelle zu verlangen. Die Generalversammlung darf diesfalls die Beschlüsse über die Genehmigung der Jahresrechnung und die Verwendung des Bilanzgewinnes erst fassen, wenn der Revisionsbericht vorliegt.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 727a OR',
      begruendung: 'ZH-Langvorlage; Haus-Abweichung (offengelegt): Der ZH-Binnenverweis «die Beschlüsse nach Art. 8 Ziff. 3 bis 6» ist durch die inhaltliche Umschreibung ersetzt (Genehmigung der Jahresrechnung, Verwendung des Bilanzgewinnes — Art. 731 Abs. 1 OR), weil die Artikelnummerierung der Haus-Statuten dynamisch ist.',
    },
    {
      id: 'ASL51_rs_anforderungen',
      ueberschrift: 'Anforderungen an die Revisionsstelle',
      text:
        'Als Revisionsstelle können eine oder mehrere natürliche oder juristische Personen oder Personengesellschaften gewählt werden.\n' +
        'Die Revisionsstelle muss ihren Wohnsitz, ihren Sitz oder eine eingetragene Zweigniederlassung in der Schweiz haben. Hat die Gesellschaft mehrere Revisionsstellen, so muss zumindest eine diese Voraussetzungen erfüllen.\n' +
        'Ist die Gesellschaft zur ordentlichen Revision verpflichtet, so muss die Generalversammlung als Revisionsstelle einen zugelassenen Revisionsexperten bzw. ein staatlich beaufsichtigtes Revisionsunternehmen nach den Vorschriften des Revisionsaufsichtsgesetzes vom 16. Dezember 2005 wählen.\n' +
        'Ist die Gesellschaft zur eingeschränkten Revision verpflichtet, so muss die Generalversammlung als Revisionsstelle einen zugelassenen Revisor nach den Vorschriften des Revisionsaufsichtsgesetzes vom 16. Dezember 2005 wählen. Vorbehalten bleibt der Verzicht auf die Wahl einer Revisionsstelle gemäss dem vorstehenden Artikel.\n' +
        'Die Revisionsstelle muss nach Art. 728 bzw. 729 OR unabhängig sein.\n' +
        'Die Revisionsstelle wird für ein Geschäftsjahr gewählt. Ihr Amt endet mit der Abnahme der letzten Jahresrechnung. Eine Wiederwahl ist möglich. Die Generalversammlung kann die Revisionsstelle nur aus wichtigen Gründen abberufen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 727b OR',
      begruendung: 'ZH-Langvorlage (Wählbarkeit Art. 730 OR; ordentliche/eingeschränkte Revision Art. 727b/727c OR; Unabhängigkeit Art. 728/729 OR; Abberufung Art. 730a OR). Haus-Abweichungen (offengelegt): ZH-Binnenverweis «nach Artikel 23» durch «gemäss dem vorstehenden Artikel» ersetzt (dynamische Nummerierung); die Amtsdauer «für ein Geschäftsjahr» ist eine statutarische Festlegung INNERHALB der gesetzlichen Bandbreite von Art. 730a Abs. 1 OR (ein bis drei Geschäftsjahre — Bug-Check B3, 7.6.2026).',
    },
    {
      id: 'AS15_geschaeftsjahr',
      ueberschrift: 'Geschäftsjahr und Buchführung',
      text:
        'Das Geschäftsjahr beginnt am {{gjBeginnTxt}} und endet am {{gjEndeTxt}}.{{gjErstesSatz}}\n' +
        'Die Jahresrechnung, bestehend aus Erfolgsrechnung, Bilanz und Anhang, ist gemäss den Vorschriften des Schweizerischen Obligationenrechts, insbesondere der Art. 957 ff., zu erstellen.',
      norm: 'Art. 958 Abs. 2 OR',
      begruendung: 'Geschäftsjahr-Artikel der amtlichen ZH-Kurzvorlage (verbatim; kein Pflichtinhalt nach Art. 626 OR, aber Standard aller amtlichen Muster). Der Norm-Anker deckt die Jahresrechnungs-Bestandteile des zweiten Satzes (Bilanz, Erfolgsrechnung, Anhang — Art. 958 Abs. 2 OR); das Geschäftsjahr selbst ist gesetzlich nicht fixiert (Bug-Check-Befund 5, 7.6.2026).',
    },
    {
      id: 'ASL60_reserven',
      ueberschrift: 'Reserven und Gewinnverwendung',
      text:
        'Aus dem Jahresgewinn ist zuerst die Zuweisung an die gesetzliche Gewinnreserve entsprechend den Vorschriften des Gesetzes vorzunehmen. Der Bilanzgewinn steht zur Verfügung der Generalversammlung, die ihn im Rahmen der gesetzlichen Auflagen (insbesondere Art. 671 ff. OR) nach freiem Ermessen verwenden kann.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 672 OR',
      begruendung: 'ZH-Langvorlage verbatim (gesetzliche Gewinnreserve Art. 672 OR; der Sammelverweis «Art. 671 ff. OR» umfasst den ganzen Reserven-Abschnitt inkl. der gesetzlichen Kapitalreserve Art. 671 OR).',
    },
    {
      id: 'ASL61_aufloesung',
      ueberschrift: 'Auflösung und Liquidation',
      text:
        'Die Auflösung der Gesellschaft kann durch einen Beschluss der Generalversammlung, über den eine öffentliche Urkunde zu errichten ist, erfolgen.\n' +
        'Die Liquidation wird durch den Verwaltungsrat besorgt, falls sie nicht durch einen Beschluss der Generalversammlung anderen Personen übertragen wird. Die Liquidation erfolgt gemäss Art. 742 ff. OR.\n' +
        'Das Vermögen der aufgelösten Gesellschaft wird nach Tilgung ihrer Schulden nach Massgabe der einbezahlten Beträge unter die Aktionäre verteilt.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 736 OR',
      begruendung: 'ZH-Langvorlage verbatim (Auflösungsbeschluss mit öffentlicher Urkunde Art. 736 Abs. 1 Ziff. 2 OR; Liquidatoren Art. 740 OR; Verteilung nach einbezahlten Beträgen Art. 745 Abs. 1 OR).',
    },
    // ── Stufe 2 P3: Schiedsklausel (Art. 697n OR) ───────────────────────────
    {
      id: 'AS16_schiedsklausel',
      ueberschrift: 'Schiedsklausel',
      text:
        'Gesellschaftsrechtliche Streitigkeiten beurteilt unter Ausschluss der staatlichen Gerichte ein ' +
        'Schiedsgericht mit Sitz in {{schiedsOrtTxt}} (Schweiz). Die Schiedsklausel bindet die ' +
        'Gesellschaft, die Organe der Gesellschaft, die Mitglieder der Organe und die Aktionäre. Für das ' +
        'Verfahren vor dem Schiedsgericht gelten die Bestimmungen des 3. Teils der Schweizerischen ' +
        'Zivilprozessordnung. Personen, die von den Rechtswirkungen des Schiedsspruchs direkt betroffen ' +
        'sein können, sind über die Einleitung und die Beendigung des Verfahrens zu informieren; sie ' +
        'können sich bei der Bestellung des Schiedsgerichts beteiligen und dem Verfahren als ' +
        'Intervenienten beitreten.',
      includeIf: { feld: 'hatSchiedsklausel', eq: true },
      norm: 'Art. 697n OR',
      begruendung: 'Stufe 2 P3 (Haus-Fassung am Normtext, offengelegt — kein amtlicher Mustertext): Abs. 1 Sitz in der Schweiz + Bindungswirkung verbatim-nah; Abs. 2 ZPO Teil 3 (das 12. Kapitel des IPRG ist nicht anwendbar); Abs. 3 Pflicht-Sicherstellung von Information und Mitwirkung der direkt Betroffenen (am Cache verifiziert). Der Handelsregister-Eintrag enthält einen Verweis auf die Schiedsklausel (Art. 45 Abs. 1 lit. u HRegV).',
      hinweis: 'Einzelheiten (z. B. Verweisung auf eine Schiedsordnung) können die Statuten zusätzlich regeln (Art. 697n Abs. 3 OR) — hier bewusst nicht vorbelegt; die Einführung bedarf bei bestehenden Gesellschaften des qualifizierten Mehrs (Art. 704 Abs. 1 Ziff. 14 OR).',
    },
    {
      id: 'AS04_mitteilungen',
      ueberschrift: 'Mitteilungen',
      text: 'Mitteilungen der Gesellschaft an die Aktionärinnen und Aktionäre erfolgen per Brief oder E-Mail an die im Aktienbuch verzeichneten Adressen.',
      norm: 'Art. 626 Abs. 1 Ziff. 7 OR',
      begruendung: 'Pflichtinhalt Form der Mitteilungen (rev. 2023; Wortlaut ZH/SG).',
    },
  ],
};
