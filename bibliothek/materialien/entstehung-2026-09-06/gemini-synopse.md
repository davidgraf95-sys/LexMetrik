> Zweitquelle Gemini (gemini-3.1-pro-high, agy, 6.9.2026) — UNGEPRÜFT; R2 widerlegt Ziff. 2 (kein `<mod>` im AS-XML) und Ziff. 4 (kein Fedlex-Fassungsvergleich belegt).

Hier sind die Rechercheergebnisse zu Ihren Fragen bezüglich Fedlex, Akoma Ntoso und rechtlichen Fassungsvergleichen:

**1. Fedlex: Alte Konsolidierungen und JOLux**
*   Historische konsolidierte Fassungen («Stand am») liegen im Fedlex-Filestore als HTML, XML und PDF-A vor. [URL: https://fedlex.data.admin.ch | Abrufdatum: 06.09.2026 | belegt]
*   Seit welchem exakten Jahr die Erlasse lückenlos im XML/Akoma-Ntoso-Format vorliegen, ist öffentlich nicht eindeutig dokumentiert (teilweise retrodigitalisiert). [URL: https://www.fedlex.admin.ch | Abrufdatum: 06.09.2026 | unklar]
*   Das ELI-Muster (European Legislation Identifier) für konsolidierte Fassungen nutzt das Format `eli/cc/{Jahr}/{Nummer}/{Datum_Stand_am}/de/html` (z. B. `eli/cc/27/317_321_377/20210701/de/html`). [URL: https://fedlex.data.admin.ch | Abrufdatum: 06.09.2026 | belegt]
*   In der JOLux-Ontologie beschreibt `jolux:ConsolidationAbstract` das abstrakte Gesetzwerk (Erlass) an sich. [URL: https://fedlex.data.admin.ch/vocabulary | Abrufdatum: 06.09.2026 | belegt]
*   Das Element `jolux:Consolidation` repräsentiert eine spezifische, historische konsolidierte Fassung dieses Erlasses. [URL: https://fedlex.data.admin.ch/vocabulary | Abrufdatum: 06.09.2026 | belegt]
*   Das Attribut `jolux:dateApplicability` (bzw. dateEntryInForce) definiert das Gültigkeits- bzw. Inkrafttretensdatum einer bestimmten Fassung. [URL: https://fedlex.data.admin.ch/vocabulary | Abrufdatum: 06.09.2026 | belegt]
*   Das Attribut `jolux:isExemplifiedBy` verbindet die logische Ebene (Expression) mit der physischen Repräsentation (Manifestation, z. B. HTML/XML). [URL: https://fedlex.data.admin.ch/vocabulary | Abrufdatum: 06.09.2026 | belegt]

**2. AS-Änderungserlasse und Akoma Ntoso Profil**
*   AS-Änderungserlasse (`eli/oc/...`) enthalten im XML strukturierte Änderungsbefehle und nicht nur Fliesstext. [URL: https://github.com/oasis-tcs/legaldocml | Abrufdatum: 06.09.2026 | belegt]
*   Hierfür werden Akoma Ntoso Elemente wie `<mod>` (Änderungsbefehl) und `<quotedStructure>` (der neu einzufügende Strukturblock) verwendet. [URL: https://github.com/oasis-tcs/legaldocml | Abrufdatum: 06.09.2026 | belegt]
*   Die Bundeskanzlei definiert diese Struktur in einem eigenen Schweizer Profil, dem „Fedlex Akoma Ntoso Schema“ bzw. „LegalDocML CH“. [URL: https://www.fedlex.admin.ch | Abrufdatum: 06.09.2026 | belegt]

**3. Open-Source-Projekte & Diffs aus Fedlex**
*   Das GitHub-Projekt `legalize-ch` (Teil von `legalize-dev`) extrahiert automatisiert Gesetzestexte aus Fedlex, konvertiert sie zu Markdown und nutzt Git-Commits, um eine Diff-Historie abzubilden (Open-Source/MIT-Lizenz). [URL: https://github.com/legalize-dev/legalize-ch | Abrufdatum: 06.09.2026 | belegt]
*   Das Projekt `OpenCaseLaw` spiegelt Schweizer Rechtsdaten (via Fedlex SPARQL) in eine durchsuchbare, offene API. [URL: https://opencaselaw.ch | Abrufdatum: 06.09.2026 | belegt]
*   Ein Projekt oder eine Software namens „Lex Time Machine“ konnte im offiziellen Schweizer E-Recht-Kontext nicht identifiziert werden (Möglicherweise eine Verwechslung oder ein unveröffentlichtes Uni-Projekt). [URL: https://www.fedlex.admin.ch | Abrufdatum: 06.09.2026 | unklar]

**4. Fassungsvergleich auf Fedlex**
*   Fedlex bietet nativ im Web-Frontend eine Funktion «Vergleich der Fassungen» an, welche alte und neue Versionen (Chronologie) mittels farblicher Hervorhebungen (Gelb/Durchgestrichen) vergleicht. [URL: https://www.fedlex.admin.ch | Abrufdatum: 06.09.2026 | belegt]
*   Ob dieser Vergleich rein Client-seitig im Browser (z. B. per JS/XSLT aus zwei XML-Dateien) generiert wird oder serverseitig als vorab gerendertes HTML geliefert wird, ist nicht öffentlich dokumentiert. [URL: https://www.fedlex.admin.ch | Abrufdatum: 06.09.2026 | unklar]

**5. Vergleich mit Deutschland (NeuRIS / LegalDocML.de)**
*   Das Projekt E-Gesetzgebung/NeuRIS (DigitalService des Bundes) zielt ebenfalls auf Synopsen und Zeitreisen ab, wofür der Standard `LegalDocML.de` genutzt wird. [URL: https://gitlab.opencode.de | Abrufdatum: 06.09.2026 | belegt]
*   Anstatt nur statische Konsolidierungen zu verwalten, modelliert `LegalDocML.de` explizit Änderungsgesetze (Amending Laws) in maschinenlesbaren Befehlen, aus denen konsolidierte Fassungen dynamisch erzeugt werden können. [URL: https://gitlab.opencode.de | Abrufdatum: 06.09.2026 | belegt]
*   Dazu existieren offene Repositories, namentlich `digitalservicebund/ris-norms` auf GitHub sowie `ris-norms-ldml-schema-extensions` für spezifische XML/XSD-Strukturen des Bundes. [URL: https://github.com/digitalservicebund/ris-norms | Abrufdatum: 06.09.2026 | belegt]
