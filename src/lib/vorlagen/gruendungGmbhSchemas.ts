// Dossier: bibliothek/recherche/gruendungsdokumente-wortlaute.md
// §6-Split (Token-Disziplin, 19.6.2026): statische GmbH-Gründungs-Dokument-
// Schemas aus gruendungGmbhDokumente.ts ausgelagert. Reine Daten – keine Logik,
// kein Byte am Dokumentinhalt geändert. Das Barrel gruendungGmbhDokumente.ts
// re-exportiert diese Konstanten weiterhin (öffentliches Modul unverändert).
import type { VorlageSchema } from './engine';

// ── 1 · STATUTEN (ENTWURF – Beglaubigung Art. 22 Abs. 4 HRegV) ──────────────

export const STATUTEN_SCHEMA: VorlageSchema = {
  id: 'gmbh-statuten',
  version: '1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026)',
  titel: 'Statuten',
  format: 'vertrag',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung der Gründung: ' +
    'Die Statuten der GmbH werden von der Urkundsperson geprüft und beglaubigt (Art. 22 Abs. 4 HRegV); ' +
    'massgeblich ist die beurkundete Fassung. Wortlaute nach den amtlichen Mustern ZH/SG/GL, ' +
    'verifiziert am OR-Stand 1.1.2026.',
  bausteine: [
    {
      id: 'ST00_ingress',
      text: 'der {{firma}} mit Sitz in {{sitz}}',
      begruendung: 'Identifikations-Ingress unter dem Dokumenttitel (Usanz aller amtlichen Muster).',
    },
    {
      id: 'ST01_firma_sitz',
      ueberschrift: 'Firma und Sitz',
      text: 'Unter der Firma {{firma}} besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Gesellschaft mit beschränkter Haftung gemäss Art. 772 ff. OR.',
      norm: 'Art. 776 Ziff. 1 OR',
      begruendung: 'Pflichtinhalt Firma/Sitz (SG-Kurzfassung in einem Artikel; ZH/GL/EHRA trennen in zwei – inhaltsgleich).',
    },
    {
      id: 'ST02_zweck',
      ueberschrift: 'Zweck',
      text: 'Die Gesellschaft bezweckt {{zweck}}.',
      norm: 'Art. 776 Ziff. 2 OR',
      begruendung: 'Pflichtinhalt Zweck.',
    },
    {
      id: 'ST02b_zweck_erweiterung',
      text: 'Die Gesellschaft kann Zweigniederlassungen errichten, sich an anderen Unternehmen beteiligen, Grundstücke erwerben, halten und veräussern, Finanzierungen für eigene oder fremde Rechnung vornehmen sowie Sicherheiten für Verbindlichkeiten verbundener Gesellschaften leisten.',
      includeIf: { feld: 'zweckErweiterung', eq: true },
      norm: 'Art. 776 Ziff. 2 OR',
      begruendung: 'Aufgenommen, weil die übliche Zweck-Erweiterungsklausel gewählt wurde (ZH-/GL-Muster-Wortlaut).',
    },
    {
      id: 'ST03_stammkapital',
      ueberschrift: 'Stammkapital und Stammanteile',
      text: 'Das Stammkapital beträgt CHF {{stammkapitalFmt}}. Es ist eingeteilt in {{anzahlAnteile}} Stammanteile zu CHF {{nennwertFmt}}.',
      norm: 'Art. 776 Ziff. 3 OR',
      begruendung: 'Pflichtinhalt Stammkapital mit Anzahl und Nennwert der Stammanteile (Nennwert grösser als null, Art. 774 Abs. 1 OR rev. 2023 – kein 100-Franken-Minimum mehr).',
    },
    // ── bedingt notwendiger Inhalt (nur wirksam mit Statutenklausel) ──
    {
      id: 'ST10_nachschuss',
      ueberschrift: 'Nachschusspflicht',
      text:
        'Die Gesellschafter sind zur Leistung von Nachschüssen verpflichtet. Der Betrag der mit einem ' +
        'Stammanteil verbundenen Nachschusspflicht beträgt CHF {{nachschussFmt}}. Die Gesellschafter ' +
        'haften nur für die mit den eigenen Stammanteilen verbundenen Nachschüsse.',
      includeIf: { feld: 'klausel_nachschuss', eq: true },
      norm: 'Art. 795 OR',
      begruendung: 'Aufgenommen, weil die Nachschusspflicht gewählt wurde; Betrag je Stammanteil zwingend, höchstens das Doppelte des Nennwerts (Abs. 2).',
    },
    {
      id: 'ST11_nebenleistung',
      ueberschrift: 'Nebenleistungspflichten',
      text: 'Mit sämtlichen Stammanteilen ist folgende Nebenleistungspflicht verbunden: {{nebenleistungText}}',
      includeIf: { feld: 'klausel_nebenleistung', eq: true },
      norm: 'Art. 796 OR',
      begruendung: 'Aufgenommen, weil eine Nebenleistungspflicht gewählt wurde; Gegenstand und Umfang müssen in den Statuten bestimmt sein (Abs. 3).',
      hinweis: 'Zulässig nur, wenn die Pflicht dem Zweck, der Selbstständigkeit der Gesellschaft oder der Wahrung des Gesellschafterkreises dient (Art. 796 Abs. 2 OR).',
    },
    {
      id: 'ST12_konkurrenzverbot',
      ueberschrift: 'Konkurrenzverbot',
      text:
        'Die Gesellschafter dürfen keine die Gesellschaft konkurrenzierenden Tätigkeiten ausüben. ' +
        'Solche Tätigkeiten sind zulässig, sofern {{konkurrenzBefreiungSatz}}.',
      includeIf: { feld: 'klausel_konkurrenzverbot', eq: true },
      norm: 'Art. 803 Abs. 2 und 3 OR',
      begruendung: 'Aufgenommen, weil das Gesellschafter-Konkurrenzverbot gewählt wurde (Wortlaut ZH/SG/GL/EHRA konvergent); Befreiungsweg nach Abs. 3 wählbar.',
    },
    {
      id: 'ST13_vorkauf_verfahren',
      ueberschrift: 'Vorkaufsrecht: Verfahren',
      text:
        'Jedem Gesellschafter steht an den Stammanteilen der anderen Gesellschafter ein Vorkaufsrecht zu den folgenden Bedingungen zu.\n' +
        'Verkauft ein Gesellschafter Stammanteile und wird dadurch ein Vorkaufsfall ausgelöst, so meldet er dies innerhalb von 30 Tagen seit dessen Eintritt den anderen Gesellschaftern und der Geschäftsführung durch eingeschriebenen Brief.\n' +
        'Die Vorkaufsberechtigten können ihr Vorkaufsrecht innerhalb einer Frist von 60 Tagen seit Empfang der Mitteilung des Vorkaufsfalls durch eingeschriebenen Brief an die Geschäftsführung ausüben. Die Ausübung muss stets sämtliche Stammanteile umfassen, die Gegenstand des Vorkaufsfalls bilden. Üben mehrere Vorkaufsberechtigte ihr Vorkaufsrecht aus, so werden die Stammanteile entsprechend ihrer bisherigen Beteiligung an der Gesellschaft zugewiesen.\n' +
        'Nach Ablauf der Ausübungsfrist setzt die Geschäftsführung die Gesellschafter innerhalb von 10 Tagen mit eingeschriebenem Brief über die Ausübung in Kenntnis. Ausgeübte Vorkaufsrechte sind innerhalb von 60 Tagen seit Ablauf der Ausübungsfrist gegen Vergütung des gesamten Kaufpreises zu vollziehen.',
      includeIf: { feld: 'klausel_vorkaufsrecht', eq: true },
      norm: 'Art. 786 Abs. 2 OR',
      begruendung: 'Aufgenommen, weil das Vorkaufsrecht gewählt wurde; Fristen 30/60/10/60 Tage nach den wortgleichen amtlichen Mustern ZH, SG, GL und EHRA.',
    },
    {
      id: 'ST14_vorkauf_preis',
      ueberschrift: 'Vorkaufsrecht: Preis',
      text:
        'Das Vorkaufsrecht ist zum wirklichen Wert der Stammanteile im Zeitpunkt des Eintritts des Vorkaufsfalls auszuüben.\n' +
        'Einigen sich die Beteiligten nicht innerhalb von 30 Tagen über den wirklichen Wert, so wird dieser endgültig und für alle Beteiligten verbindlich durch eine zugelassene Revisionsexpertin oder einen zugelassenen Revisionsexperten als Schiedsgutachter festgestellt. Einigen sich die Beteiligten nicht auf die Person des Schiedsgutachters, so wird diese durch die Präsidentin oder den Präsidenten des am Sitz der Gesellschaft zuständigen oberen kantonalen Gerichts bezeichnet.',
      includeIf: { feld: 'klausel_vorkaufsrecht', eq: true },
      norm: 'Art. 786 Abs. 2 OR',
      begruendung: 'Preisbestimmung zum wirklichen Wert mit Schiedsgutachter-Mechanik (amtliche Muster).',
      hinweis: 'Ersatzbestimmung des Schiedsgutachters bewusst kantonsneutral («oberes kantonales Gericht») – die Muster nennen ZH/GL den Obergerichts-, SG den Handelsgerichtspräsidenten.',
    },
    {
      id: 'ST15_stimmrecht',
      ueberschrift: 'Stimmrecht',
      text: 'Das Stimmrecht der Gesellschafter bemisst sich nach der Zahl ihrer Stammanteile; auf jeden Stammanteil entfällt eine Stimme.',
      includeIf: { feld: 'klausel_stimmrecht', eq: true },
      norm: 'Art. 806 Abs. 2 OR',
      begruendung: 'Aufgenommen, weil das Stimmrecht nach Anteilszahl gewählt wurde (Abweichung vom Nennwert-Default des Art. 806 Abs. 1 OR).',
      hinweis: 'Voraussetzung: Die Stammanteile mit dem tiefsten Nennwert weisen mindestens einen Zehntel des Nennwerts der übrigen auf; für RS-Wahl, Sachverständige und Verantwortlichkeitsklage gilt die Anteilszahl-Bemessung nicht (Art. 806 Abs. 2 und 3 OR).',
    },
    {
      id: 'ST16_vetorecht',
      ueberschrift: 'Vetorecht',
      text: 'Jedem Gesellschafter steht ein Vetorecht gegen folgende Beschlüsse der Gesellschafterversammlung zu: {{vetoBeschluesse}}',
      includeIf: { feld: 'klausel_vetorecht', eq: true },
      norm: 'Art. 807 OR',
      begruendung: 'Aufgenommen, weil ein Vetorecht gewählt wurde; die Statuten müssen die erfassten Beschlüsse umschreiben (Abs. 1).',
      hinweis: 'Das Vetorecht ist unübertragbar; die nachträgliche Einführung bedürfte der Zustimmung aller Gesellschafter (Art. 807 Abs. 2 und 3 OR).',
    },
    {
      id: 'ST19_virtuelle_gv',
      ueberschrift: 'Gesellschafterversammlung',
      text:
        'Die Gesellschafterversammlung kann vor Ort, hybrid oder mit elektronischen Mitteln ohne Tagungsort (virtuell) durchgeführt werden. ' +
        'Bei einer virtuellen Gesellschafterversammlung kann die Geschäftsführung im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.',
      includeIf: { feld: 'virtuelleGv', eq: true },
      // Review-Befund H-1 (7.6.2026): 805 V Ziff. 2bis ist reine Verweisungs-
      // norm — materielle Grundlage ist Art. 701d OR (entsprechend anwendbar).
      norm: 'Art. 701d OR',
      begruendung: 'Aufgenommen, weil die virtuelle Gesellschafterversammlung ermöglicht werden soll (statutarische Grundlage nötig; Art. 701d OR, auf die GmbH anwendbar über die Verweisung in Art. 805 Abs. 5 Ziff. 2bis OR).',
      hinweis: 'Ein genereller statutarischer Verzicht auf die unabhängige Stimmrechtsvertretung ist unzulässig – zulässig ist nur die Einzelfall-Ermächtigung (EHRA-Praxismitteilung 1/23).',
    },
    {
      id: 'ST20_mitteilungen',
      ueberschrift: 'Mitteilungen',
      text: 'Die Mitteilungen der Gesellschaft an die Gesellschafter erfolgen per Brief oder E-Mail an die im Anteilbuch verzeichneten Adressen.',
      norm: 'Art. 776 Ziff. 4 OR',
      begruendung: 'Pflichtinhalt Form der Mitteilungen (rev. 2023 – ersetzt die frühere SHAB-Bekanntmachungs-Ziffer; Wortlaut ZH/SG).',
    },
  ],
};

// ── 2 · ERRICHTUNGSAKT (ENTWURF – öffentliche Beurkundung Art. 777 OR) ──────

export const ERRICHTUNGSAKT_SCHEMA: VorlageSchema = {
  id: 'gmbh-errichtungsakt',
  version: '1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026)',
  titel: 'Öffentliche Urkunde über den Errichtungsakt',
  format: 'verfuegung',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung des Beurkundungstermins: ' +
    'Der Errichtungsakt der GmbH bedarf der öffentlichen Beurkundung (Art. 777 Abs. 1 OR); die Urkunde ' +
    'entsteht bei der Urkundsperson. Gliederung und Wortlaute nach den amtlichen Vorlagen ZH/SG (2023/2024).',
  bausteine: [
    {
      id: 'EA01_ingress',
      text: 'Gründung der {{firma}} mit Sitz in {{sitz}}\n\nVor der unterzeichnenden Urkundsperson sind heute erschienen:',
      begruendung: 'Urkunden-Ingress mit Personalien-Block (Art. 72 lit. a HRegV).',
      norm: 'Art. 72 lit. a HRegV',
    },
    {
      id: 'EA02_gruenderliste',
      text: '– {{item.name}}{{item.angabenZeile}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Personenangaben zu allen Gründerinnen und Gründern.',
      norm: 'Art. 72 lit. a HRegV',
    },
    {
      id: 'EA03_erklaerung',
      ueberschrift: 'I. Gründungserklärung und Statuten',
      text:
        'Die erschienenen Personen erklären, eine Gesellschaft mit beschränkter Haftung unter der Firma ' +
        '{{firma}} mit Sitz in {{sitz}} zu gründen, und legen hiermit die beiliegenden Statuten fest, ' +
        'die Bestandteil dieser Urkunde bilden.',
      norm: 'Art. 777 Abs. 1 OR',
      begruendung: 'Gründungserklärung und Statutenfestlegung in der öffentlichen Urkunde (Art. 72 lit. b und c HRegV).',
    },
    {
      id: 'EA04_zeichnung',
      ueberschrift: 'II. Stammkapital und Zeichnung',
      text:
        'Das Stammkapital der Gesellschaft beträgt CHF {{stammkapitalFmt}} und ist eingeteilt in ' +
        '{{anzahlAnteile}} Stammanteile zu je CHF {{nennwertFmt}} (Nennwert), welche zum Ausgabebetrag ' +
        'von CHF {{nennwertFmt}} je Stammanteil wie folgt gezeichnet werden:',
      norm: 'Art. 777a Abs. 1 OR',
      begruendung: 'Zeichnung der Stammanteile mit Anzahl, Nennwert und Ausgabebetrag – bei der Gründung erfolgt die Zeichnung in der Urkunde selbst (Art. 72 lit. d HRegV); Ausgabe zum Nennwert (Erstausbau ohne Agio). Nennwert und Ausgabebetrag gelten aus diesem Vorspann für jede einzelne Zeichnungszeile (Lösung des ZH-Musters).',
    },
    {
      id: 'EA05_zeichnungsliste',
      text: '– {{item.name}}: {{item.anzahl}} Stammanteile',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Zeichnungserklärung jeder Gründerin / jedes Gründers (Anzahl je Person; Nennwert, Ausgabebetrag und Kategorie aus dem Vorspann-Baustein – zusammen decken beide Art. 72 lit. d HRegV ab).',
      norm: 'Art. 72 lit. d HRegV',
    },
    {
      id: 'EA06_hinweis_777a',
      text: 'Gemäss Statuten bestehen folgende Bestimmungen, auf die hiermit im Sinne von Art. 777a Abs. 2 OR hingewiesen wird:',
      includeIf: { feld: 'klauselHinweisListe', nichtLeer: true },
      norm: 'Art. 777a Abs. 2 OR',
      begruendung: 'Aufgenommen, weil statutarische Gestaltungen mit Hinweispflicht in der Zeichnungs-Urkunde gewählt wurden (Ziff. 1–5).',
    },
    {
      id: 'EA06b_hinweisliste',
      text: '– {{item.label}}',
      includeIf: { feld: 'klauselHinweisListe', nichtLeer: true },
      wiederholeUeber: 'klauselHinweisListe',
      begruendung: 'Je hinweispflichtige statutarische Bestimmung eine Zeile.',
      norm: 'Art. 777a Abs. 2 OR',
    },
    {
      id: 'EA07_einlagen_bank_genannt',
      ueberschrift: 'III. Einlagen',
      text:
        'Sämtliche Einlagen von gesamthaft CHF {{stammkapitalFmt}} wurden in Geld geleistet und sind bei ' +
        'der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und ' +
        'Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Damit ist für jeden ' +
        'Stammanteil eine dem Ausgabebetrag entsprechende Einlage vollständig geleistet.',
      includeIf: { feld: 'bankInUrkundeGenannt', eq: true },
      norm: 'Art. 777c OR',
      begruendung: 'Bareinlage mit Banknennung in der Urkunde – die separate Bankbescheinigung als HR-Beleg entfällt (Art. 71 Abs. 1 lit. g HRegV).',
    },
    {
      id: 'EA07_einlagen_bescheinigung',
      ueberschrift: 'III. Einlagen',
      text:
        'Sämtliche Einlagen von gesamthaft CHF {{stammkapitalFmt}} wurden in Geld geleistet und gemäss ' +
        'separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und ' +
        'Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Damit ist für jeden ' +
        'Stammanteil eine dem Ausgabebetrag entsprechende Einlage vollständig geleistet.',
      includeIf: { feld: 'bankInUrkundeGenannt', eq: false },
      norm: 'Art. 777c OR',
      begruendung: 'Bareinlage mit separater Bankbescheinigung (Beleg nach Art. 71 Abs. 1 lit. g HRegV).',
    },
    {
      id: 'EA08_feststellungen_mit_pflichten',
      ueberschrift: 'IV. Feststellungen',
      text:
        'Die Gründerinnen und Gründer stellen fest, dass:\n' +
        '– sämtliche Stammanteile gültig gezeichnet sind;\n' +
        '– die Einlagen dem gesamten Ausgabebetrag entsprechen;\n' +
        '– die gesetzlichen und statutarischen Anforderungen an die Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;\n' +
        '– sie die statutarischen Nachschuss- oder Nebenleistungspflichten übernehmen;\n' +
        '– keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.',
      includeIf: { feld: 'hatNachschussOderNebenleistung', eq: true },
      norm: 'Art. 777 Abs. 2 OR',
      begruendung: 'Gesetzliche Feststellungen Ziff. 1–5 einschliesslich Übernahme der statutarischen Nachschuss-/Nebenleistungspflichten (Ziff. 4) – Wortlaut der Norm folgend (ZH-Vorlage identisch).',
    },
    {
      id: 'EA08_feststellungen_ohne_pflichten',
      ueberschrift: 'IV. Feststellungen',
      text:
        'Die Gründerinnen und Gründer stellen fest, dass:\n' +
        '– sämtliche Stammanteile gültig gezeichnet sind;\n' +
        '– die Einlagen dem gesamten Ausgabebetrag entsprechen;\n' +
        '– die gesetzlichen und statutarischen Anforderungen an die Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;\n' +
        '– keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.',
      includeIf: { feld: 'hatNachschussOderNebenleistung', eq: false },
      norm: 'Art. 777 Abs. 2 OR',
      begruendung: 'Gesetzliche Feststellungen Ziff. 1–3 und 5; Ziff. 4 entfällt, weil die Statuten keine Nachschuss- oder Nebenleistungspflichten vorsehen (ZH-Vorlage: Klammer-Variante).',
    },
    {
      id: 'EA09_organbestellung',
      ueberschrift: 'V. Organe',
      text: 'Als Geschäftsführerinnen und Geschäftsführer werden bestellt:',
      norm: 'Art. 777 Abs. 1 OR',
      begruendung: 'Organbestellung in der Urkunde; Personenangaben nach Art. 72 lit. f HRegV.',
    },
    {
      id: 'EA09b_gfliste',
      text: '– {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}{{item.vorsitzZeile}}, mit {{item.zeichnung}}',
      wiederholeUeber: 'gfListe',
      begruendung: 'Je Geschäftsführerin/Geschäftsführer eine Zeile mit Heimatort/Staatsangehörigkeit, Wohnort und Zeichnungsart (Usanz ZH-Protokolle).',
      norm: 'Art. 72 lit. f HRegV',
    },
    {
      id: 'EA10_revisionsstelle',
      text: 'Als Revisionsstelle wird gewählt: {{revisionsstelleName}}, {{revisionsstelleSitz}}.',
      includeIf: { feld: 'optingOut', eq: false },
      norm: 'Art. 72 lit. g HRegV',
      begruendung: 'Aufgenommen, weil eine Revisionsstelle bestellt wird.',
    },
    {
      id: 'EA11_opting_out',
      text:
        'Auf eine Revision wird verzichtet. Die Gründerinnen und Gründer stellen fest, dass:\n' +
        '– die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;\n' +
        '– die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;\n' +
        '– sämtliche Gründerinnen und Gründer auf eine eingeschränkte Revision verzichten.',
      includeIf: { feld: 'optingOut', eq: true },
      norm: 'Art. 727a Abs. 2 OR',
      begruendung: 'Opting-out bei der Gründung: dreigliedrige Feststellung direkt in der Urkunde (Art. 72 lit. g HRegV; ZH-KMU-Merkblatt und SG-Formular wortgleich).',
    },
    {
      id: 'EA12_domizil_eigen',
      ueberschrift: 'VI. Rechtsdomizil',
      text: 'Das Rechtsdomizil der Gesellschaft befindet sich an folgender Adresse: {{rechtsdomizilAdresse}}.',
      includeIf: { feld: 'eigeneBueros', eq: true },
      norm: 'Art. 117 Abs. 2 HRegV',
      begruendung: 'Eigene Adresse am Sitz.',
    },
    {
      id: 'EA12_domizil_co',
      ueberschrift: 'VI. Rechtsdomizil',
      text:
        'Die Gesellschaft hat ihr Rechtsdomizil als c/o-Adresse bei {{domizilhalterName}}, ' +
        '{{domizilhalterAdresse}}. Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.',
      includeIf: { feld: 'eigeneBueros', eq: false },
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'c/o-Domizil mit Domizilannahmeerklärung als Beleg (Art. 71 Abs. 1 lit. h HRegV).',
    },
    {
      id: 'EA13_nachtragsvollmacht',
      ueberschrift: 'VII. Vollmacht',
      text:
        'Die Gründerinnen und Gründer bevollmächtigen jede Gründerin und jeden Gründer sowie jede ' +
        'Geschäftsführerin und jeden Geschäftsführer einzeln, allfällige von der Handelsregisterbehörde ' +
        'beanstandete Punkte dieser Urkunde oder der Statuten durch einen öffentlich zu beurkundenden ' +
        'Nachtrag namens aller Gründerinnen und Gründer zu bereinigen.',
      norm: 'Art. 72 HRegV',
      begruendung: 'Vorsorgliche Nachtragsvollmacht für Beanstandungen (ZH-Vorlagen-Klausel) – vermeidet einen zweiten Termin aller Gründer.',
    },
    {
      id: 'EA14_gruendungserklaerung',
      ueberschrift: 'VIII. Gründungserklärung',
      text: 'Abschliessend erklären die erschienenen Personen die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet.',
      norm: 'Art. 777 Abs. 1 OR',
      begruendung: 'Abschliessende Gründungserklärung (ZH-Vorlage wortgleich, Singular/Plural vereinheitlicht).',
    },
    {
      id: 'EA15_belege',
      ueberschrift: 'Bestätigung der Urkundsperson',
      text:
        'Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und ' +
        'den Gründerinnen und Gründern vorgelegen haben (Art. 777b Abs. 1 OR):',
      norm: 'Art. 777b OR',
      begruendung: 'Beleg-Nennung und Vorlage-Bestätigung durch die Urkundsperson; die Liste folgt aus der Gründungs-Konstellation.',
    },
    {
      id: 'EA15b_belegliste',
      text: '– {{item.titel}}',
      wiederholeUeber: 'belegeListe',
      begruendung: 'Je Beleg eine Zeile (Art. 777b Abs. 2 OR; bei der Bargründung: Statuten und – sofern die Bank nicht in der Urkunde genannt ist – die Hinterlegungs-Bestätigung).',
      norm: 'Art. 777b Abs. 2 OR',
    },
    {
      id: 'EA16_unterschriften',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer:',
      begruendung: 'Unterschriften der Gründerinnen und Gründer (Art. 72 lit. i HRegV).',
      norm: 'Art. 72 lit. i HRegV',
    },
    {
      id: 'EA16b_unterschriftenliste',
      rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
      norm: 'Art. 72 lit. i HRegV',
    },
    {
      id: 'EA17_urkundsperson',
      rolle: 'unterschrift',
      text: 'Die Urkundsperson:\n\n_________________________________',
      begruendung: 'Beurkundungsvermerk – wird von der Urkundsperson nach kantonalem Beurkundungsrecht ergänzt.',
    },
  ],
};

// ── 3 · WAHLANNAHMEERKLÄRUNG (fertig; ZH-Wortlaut verbatim) ─────────────────

export const WAHLANNAHME_SCHEMA: VorlageSchema = {
  id: 'gmbh-wahlannahme',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Wahlannahmeerklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); ' +
    'entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die gewählte Person ' +
    'die Handelsregister-Anmeldung selbst unterzeichnet (Praxis ZH/SG/LU).',
  bausteine: [
    {
      id: 'WA01_absender', rolle: 'absender',
      text: '{{personName}}\n{{personAdresse}}',
      begruendung: 'Absenderin/Absender ist die gewählte Person.',
    },
    {
      id: 'WA02_adressat', rolle: 'adressat',
      text: '{{firma}}\nz. H. der Gründerinnen und Gründer\n{{sitz}}',
      begruendung: 'Adressatin ist die Gesellschaft (in Gründung).',
    },
    { id: 'WA03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'WA04_betreff', rolle: 'betreff', text: 'Wahlannahmeerklärung', begruendung: 'Betreff nach amtlicher ZH-Vorlage.' },
    { id: 'WA05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach amtlicher ZH-Vorlage.' },
    {
      id: 'WA06_text',
      text: 'Gerne bestätige ich Ihnen, dass ich die Wahl als Mitglied der Geschäftsführung der {{firma}}, in {{sitz}}, annehme.',
      norm: 'Art. 71 Abs. 1 lit. c HRegV',
      begruendung: 'Annahme-Kernsatz – verbatim nach der amtlichen ZH-Vorlage (gmbh_vorlage_wahlannahme_gf).',
    },
    { id: 'WA07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlage.' },
    {
      id: 'WA08_unterschrift', rolle: 'unterschrift',
      text: '_________________________________\n{{personName}}',
      begruendung: 'Original-Unterschrift der gewählten Person (Praxis ZH: original handschriftlich).',
    },
  ],
};

// ── 4 · DOMIZILANNAHMEERKLÄRUNG (fertig; ZH-Wortlaut verbatim) ──────────────

export const DOMIZILANNAHME_SCHEMA: VorlageSchema = {
  id: 'gmbh-domizilannahme',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Domizilannahmeerklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Erklärung der Domizilhalterin / des Domizilhalters ' +
    'nach Art. 117 Abs. 3 HRegV; im Original mit der Anmeldung einzureichen (Art. 71 Abs. 1 lit. h HRegV).',
  bausteine: [
    {
      id: 'DA01_absender', rolle: 'absender',
      text: '{{domizilhalterName}}\n{{domizilhalterAdresse}}',
      begruendung: 'Absender ist die Domizilhalterin / der Domizilhalter.',
    },
    {
      id: 'DA02_adressat', rolle: 'adressat',
      text: '{{firma}}\nc/o {{domizilhalterName}}\n{{domizilhalterAdresse}}',
      begruendung: 'Adressatin ist die Gesellschaft an der c/o-Adresse.',
    },
    { id: 'DA03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'DA04_betreff', rolle: 'betreff', text: 'Domizilannahmeerklärung', begruendung: 'Betreff nach amtlicher ZH-Vorlage.' },
    { id: 'DA05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach amtlicher ZH-Vorlage.' },
    {
      id: 'DA06_text',
      text: 'Gerne bestätigen wir Ihnen, dass wir der {{firma}}, mit Sitz in {{sitz}}, an unserer Adresse ({{domizilhalterAdresse}}) Domizil gewähren.',
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'Kernsatz verbatim nach der amtlichen ZH-Vorlage (gmbh_vorlage_domizilannahmeerklaerung).',
    },
    { id: 'DA07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlage.' },
    {
      id: 'DA08_unterschrift', rolle: 'unterschrift',
      text: '_________________________________\n{{domizilhalterName}}',
      begruendung: 'Unterschrift der Domizilhalterin / des Domizilhalters.',
    },
  ],
};

// ── 5 · VORSITZ-BESCHLUSS (fertig; Art. 71 Abs. 1 lit. e HRegV) ─────────────

export const VORSITZ_SCHEMA: VorlageSchema = {
  id: 'gmbh-vorsitz-beschluss',
  version: '1.0.0 (Wortlaut-Dossier 7.6.2026)',
  titel: 'Beschluss über den Vorsitz der Geschäftsführung',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Beschluss der Gründerinnen und Gründer als Beleg ' +
    'nach Art. 71 Abs. 1 lit. e HRegV; entbehrlich, wenn der Vorsitz bereits im Errichtungsakt geregelt ist ' +
    '(Art. 71 Abs. 2 HRegV).',
  bausteine: [
    {
      id: 'VB01_ingress',
      text: 'Die unterzeichnenden Gründerinnen und Gründer der {{firma}}, mit Sitz in {{sitz}}, beschliessen hiermit:',
      begruendung: 'Beschluss-Ingress (Protokoll-Form nach Art. 23 HRegV).',
      norm: 'Art. 71 Abs. 1 lit. e HRegV',
    },
    {
      id: 'VB02_beschluss',
      text: 'Der Vorsitz der Geschäftsführung wird {{vorsitzName}} übertragen.',
      nummeriert: true,
      norm: 'Art. 809 Abs. 3 OR',
      begruendung: 'Vorsitz-Regelung bei mehreren Geschäftsführern (zwingend, Art. 809 Abs. 3 OR).',
    },
    {
      id: 'VB03_unterschriften', rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer:',
      begruendung: 'Unterschriften aller Gründerinnen und Gründer (Zirkularbeschluss: alle Mitglieder, Art. 23 Abs. 2 HRegV).',
      norm: 'Art. 23 Abs. 2 HRegV',
    },
    {
      id: 'VB03b_liste', rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
    },
  ],
};

// ── 6 · ERNENNUNGS-BESCHLUSS weitere Vertretungsberechtigte (lit. f) ────────

export const ERNENNUNG_SCHEMA: VorlageSchema = {
  id: 'gmbh-ernennungs-beschluss',
  version: '1.0.0 (Wortlaut-Dossier 7.6.2026)',
  titel: 'Beschluss über die Ernennung weiterer Vertretungsberechtigter',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Beschluss der Gründerinnen und Gründer als Beleg ' +
    'nach Art. 71 Abs. 1 lit. f HRegV (Direktorinnen/Direktoren, Prokuristinnen/Prokuristen – ' +
    'Ernennungskompetenz Art. 804 Abs. 3 OR).',
  bausteine: [
    {
      id: 'EB01_ingress',
      text: 'Die unterzeichnenden Gründerinnen und Gründer der {{firma}}, mit Sitz in {{sitz}}, beschliessen hiermit die Ernennung der folgenden weiteren zur Vertretung berechtigten Personen:',
      begruendung: 'Beschluss-Ingress.',
      norm: 'Art. 71 Abs. 1 lit. f HRegV',
    },
    {
      id: 'EB02_liste',
      text: '– {{item.name}}, als {{item.funktion}}, mit {{item.zeichnung}}',
      wiederholeUeber: 'vertretungsListe',
      begruendung: 'Je ernannte Person eine Zeile mit Funktion und Zeichnungsart.',
      norm: 'Art. 804 Abs. 3 OR',
    },
    {
      id: 'EB03_unterschriften', rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer:',
      begruendung: 'Unterschriften aller Gründerinnen und Gründer (Art. 23 Abs. 2 HRegV).',
      norm: 'Art. 23 Abs. 2 HRegV',
    },
    {
      id: 'EB03b_liste', rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
    },
  ],
};

// ── 7 · HR-ANMELDUNG (fertig; Eingabe-Format) ───────────────────────────────

export const ANMELDUNG_SCHEMA: VorlageSchema = {
  id: 'gmbh-hr-anmeldung',
  version: '1.0.0 (ZH-Formular-Struktur; Wortlaut-Dossier 7.6.2026)',
  titel: 'Anmeldung an das Handelsregisteramt',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Unterschriften beim Handelsregisteramt zeichnen ' +
    'oder beglaubigt einreichen (Art. 18 Abs. 2, Art. 21 HRegV); Gebühr CHF 420 (GebV-HReg, Anhang ' +
    'Ziff. 1.3). Belege im Original oder in beglaubigter Kopie (Art. 20 HRegV).',
  bausteine: [
    {
      id: 'AN01_absender', rolle: 'absender',
      text: '{{firma}} (in Gründung)\n{{anmeldeAdresseZeile}}',
      begruendung: 'Absenderin ist die Gesellschaft in Gründung.',
    },
    {
      id: 'AN02_adressat', rolle: 'adressat',
      text: 'Handelsregisteramt des Kantons {{kanton}}',
      begruendung: 'Zuständig ist das Handelsregisteramt am Sitz (Art. 16 HRegV).',
      norm: 'Art. 16 HRegV',
    },
    { id: 'AN03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    {
      id: 'AN04_betreff', rolle: 'betreff',
      text: 'Anmeldung zur Eintragung der Gründung der {{firma}}',
      begruendung: 'Betreff mit Identifikation der Rechtseinheit (Art. 16 Abs. 1 HRegV).',
      norm: 'Art. 16 Abs. 1 HRegV',
    },
    {
      id: 'AN05_text',
      text:
        'Zur Eintragung in das Handelsregister wird angemeldet: die Gründung der {{firma}} mit Sitz in ' +
        '{{sitz}}. Die einzutragenden Tatsachen ergeben sich aus den beigelegten Belegen.',
      norm: 'Art. 16 Abs. 1 HRegV',
      begruendung: 'Anmeldungs-Kern: Identifikation und Verweis auf die Belege (zulässig nach Art. 16 Abs. 1 HRegV; ZH-Formular-Struktur).',
    },
    {
      id: 'AN06_beilagen',
      ueberschrift: 'Beilagen',
      text: '– {{item.titel}} ({{item.norm}})',
      wiederholeUeber: 'belegeAnmeldung',
      begruendung: 'Beilagen-Liste aus der Gründungs-Konstellation – identisch mit der Checklisten-Engine (eine Quelle, §5).',
      norm: 'Art. 71 HRegV',
    },
    {
      id: 'AN07_unterschriften', rolle: 'unterschrift',
      text: 'Die Geschäftsführerinnen und Geschäftsführer:',
      begruendung: 'Anmeldende Personen (Art. 17 HRegV); Unterschriften nach Art. 18 Abs. 2 HRegV.',
      norm: 'Art. 18 HRegV',
    },
    {
      id: 'AN07b_liste', rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gfListe',
      begruendung: 'Je anmeldende Person eine Unterschriftslinie.',
    },
  ],
};
