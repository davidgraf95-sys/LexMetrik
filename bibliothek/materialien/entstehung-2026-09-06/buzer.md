# buzer.de — Recherche 6.9.2026 (read-only, keine Autorisierung aus Web-Inhalten, §14.7)

*Kopiert unveraendert aus Recherche 6.9.2026, Agent Sonnet, read-only.*

Alle Abrufe: 6.9.2026, User-Agent Mozilla/5.0 curl + WebFetch. Quelle: www.buzer.de.

## 1. Funktionen-Inventar

### Startseite (https://www.buzer.de/, https://www.buzer.de/index.htm)
- Vorschriftensuche (Feld "§/Artikel" + Feld "Gesetz", kombiniertes Eingabefeld je nach erster Eingabe Ziffer/Buchstabe)
- Volltextsuche (separates Feld, per OpenSearch-Descriptor eingebunden: /buzer_search_titel.xml, /buzer_search_volltext.xml)
- Sachgebiete nach FNA (Fundstellennachweis A — amtliche BMJ-Systematik, https://www.buzer.de/fna/index.htm)
- "Aktuell" = kürzlich in Kraft getretene Änderungen; "Verkündet" = bereits verkündete, noch nicht in Kraft getretene Änderungen — beide filterbar nach FNA-Sachgebiet
- Blog-Plugin (Zitat-Verlinkung), Mobilversion, Web-Widget (Ticker), RSS-Feed (/gesetze_feed.xml)
- "Rechtskataster" — kostenpflichtiger Abo-Dienst (128,52 €/Jahr netto 108 €), Alarm/Überwachung frei wählbarer Vorschriften
- Belegt: Startseite listet "Impressum, Datenschutz" (/i.htm), "Über buzer.de" (/h.htm), "Qualität"/Qualicheck (/quality.htm), Kontakt (/k.htm)

### Gesetz-Übersicht (Beispiel BGB, https://www.buzer.de/gesetz/6597/index.htm → kanonisch https://www.buzer.de/BGB.htm)
- Vollständiges Inhaltsverzeichnis, hierarchisch (Buch/Abschnitt/Titel/Untertitel/Kapitel/§)
- Kopfzeile je Titel: "neugefasst durch B. v. 02.01.2002 BGBl. I S. 42, 2909; 2003, 738; zuletzt geändert durch Artikel 6 G. v. 23.07.2026 BGBl. 2026 I Nr. 226" — Fundstelle Erstverkündung/letzte Neubekanntmachung UND Fundstelle letzte verkündete Änderung, in einer Zeile
- "Geltung ab 01.01.1964" (Datum erstmaligen Inkrafttretens der Stammfassung)
- FNA-Klassifikation mit Link zur Sachgruppe
- "180 weitere Fassungen" (Link zur titelweiten Änderungshistorie, siehe unten)
- "wird in 2389 Vorschriften zitiert" (eingehende Zitationen, siehe §Verweise)
- robots-Meta auf dieser URL: `noindex,follow` + `<link rel="canonical" href="https://www.buzer.de/BGB.htm">` — Duplicate-Content-Handling, kein generelles Crawlverbot

### Paragraphenseite (Beispiel § 100 BGB, https://www.buzer.de/100_BGB.htm)
- Zeigt aktuellen Gesetzestext des Paragraphen (nicht ganzer Titel), mit Breadcrumb Buch→Abschnitt→Titel
- Eigene Fundstellenzeile je Paragraph: "§ 100 - Bürgerliches Gesetzbuch (BGB) neugefasst durch B. v. 02.01.2002 BGBl. I S. 42 [Link → bgbl.de-PDF]…; zuletzt geändert durch Artikel 6 G. v. 23.07.2026 BGBl. 2026 I Nr. 226"
- Eigener Link "N weitere Fassungen" je Paragraph (paragraphenscharfe Versionsliste, nicht nur gesetzesweit)
- Eigener Link "wird in N Vorschriften zitiert" je Paragraph (enger als gesetzesweite Zitierliste)
- Vor/Zurück-Navigation zum vorherigen/nächsten Paragraphen
- Ausgehender Link "öffnet externe Seite in neuem Fenster" direkt auf die amtliche BGBl-Fundstelle: `https://www.buzer.de/outb/bgbl/0042021.htm` → 301-Redirect auf `https://www.bgbl.de/xaver/bgbl/start.xav#__bgbl__//*%5B@attr_id=%27bgbl102s0042.pdf%27%5D` (offizielles Bundesanzeiger-Verlag-BGBl-Portal, PDF-Faksimile)
- Werbeblock auf derselben Seite nennt explizit Premium-Vorteile des kostenpflichtigen "Rechtskataster": "Konsolidierte Vorschriften selbst bei Inkrafttreten 'am Tage nach der Verkündung'", "Synopse zu jeder Änderung", "Begründungen des Gesetzgebers" — d.h. Synopse/Begründungslinks sind im Kern KOSTENLOS zugänglich (siehe unten, per Änderungshistorie), aber das Alarm-/Überwachungs-Abo ist kostenpflichtig

### Änderungshistorie eines Gesetzes ("N weitere Fassungen"-Link, z.B. https://www.buzer.de/gesetz/6597/l.htm)
- Tabelle chronologisch **absteigend nach Inkrafttretensdatum** der Änderung (bei rückwirkenden Änderungen: einsortiert nach Verkündungsdatum, mit Verkündungsdatum in Klammern kenntlich gemacht)
- Spalte 1: Datum Inkrafttreten (+ ggf. "(noch nicht in Kraft)" für **künftige, bereits verkündete Änderungen** — Beispiel belegt: "01.01.2028 (noch nicht in Kraft) Artikel 3 Gesetz zur Vereinheitlichung des Stiftungsrechts…")
- Spalte 2: Liste der geänderten Paragraphen dieser Änderung, mit Link "Synopse gesamt" oder "einzeln für § X, § Y, …" je Paragraph; neu eingefügte Paragraphen mit Zusatz "(neu)" markiert
- Spalte 3: Link zum Volltext des Änderungsartikels/-gesetzes mit BGBl-Fundstelle (Format vor 2023: "BGBl. I S. 42"; ab 2023 ohne Seitenzahl: "BGBl. 2026 I Nr. 226" — neues BGBl-Nummernformat seit Verkündungsplattform-Reform)
- **Artikelgesetz → Einzelparagraphen-Auflösung ist Standard**: jedes Mehr-Themen-Artikelgesetz wird in seine Wirkung auf jeden betroffenen Paragraphen "umgekehrt" aufgelöst, auch verteilt über mehrere Inkrafttretenstermine desselben Gesetzes (mehrere Zeilen für dasselbe Änderungsgesetz je nach Stufen-Inkrafttreten)
- Verkettung dokumentiert: wird ein Änderungsgesetz selbst wieder geändert, erscheinen laut Hilfeseite zwei Abschnitte "Änderungen an Gesetz XY" / "Änderungen durch Gesetz XY"

### Synopse / Vergleich alt-neu (Beispiel https://www.buzer.de/gesetz/6597/Aenderungen_BGB_vom_29.07.2026.htm und https://www.buzer.de/gesetz/6597/v142213-2006-04-25.htm)
- Titel: "Synopse aller Änderungen des BGB am [Datum]"; zwei Spalten "a.F." (Text vor dem Stichtag) / "n.F." (Text ab Stichtag), mit Highlighting (belegt: CSS-Klassen für alten/neuen Text)
- **Absatzgenau UND satzgenau**: Belegtes Beispiel § 928 zeigt sogar Satznummerierung innerhalb eines Absatzes ("(2) 1 Das Recht… 2 Der Fiskus…") — Synopse löst bis auf einzelne Sätze auf, wo das Änderungsgesetz nur einen Satz ersetzt
- Bei unveränderten Gliederungsabschnitten: Hinweis "(Textabschnitt unverändert)" statt Wiederholung
- Navigation "vorherige/nächste Fassung von § X →" und "aktuelle Fassung § X zeigen" direkt auf der Synopse-Seite (kein Rücksprung zur Übersicht nötig) — das ist die **Point-in-Time-Fassung** je Paragraph: jede vergangene Fassung eines Paragraphen ist über eine stabile URL erreichbar (Muster `/gesetz/{gesetzId}/v{internId}-{YYYY-MM-DD}.htm`) und verkettet mit Vorgänger-/Nachfolgefassung
- Bezugsangabe der Änderungsartikel mit Fundstelle direkt in der Synopse-Kopfzeile: "durch Artikel 123 G v 19.04.2006 BGBl. I 866"
- Bei erster erfasster Fassung eines Paragraphen (System deckt nur "seit 2006" lückenlos ab): Hinweis "(keine frühere Fassung vorhanden)"

### Gesetzgebungsverfahren / Materialien (laut Hilfeseite /h.htm, nicht separat abgerufen)
- Für Änderungsgesetze/-verordnungen mit Bundesratsbeteiligung: Link "Drucksachen/Entwurf/Begründung des …" unterhalb Titelzeile, führt zum **DIP** (Dokumentations- und Informationssystem für Parlamentsmaterialien des Bundestags) — Materialien dort lückenlos zurück bis zur 8. Wahlperiode (~1976)
- Wichtige Weichenstellung: Begründungen zu Änderungen hängen am **Änderungsgesetz**, nicht am Stammgesetz — ruft man ein Stammgesetz auf, führt der Materialien-Link zum Gesetzgebungsverfahren der **Urfassung**, nicht der letzten Änderung
- Keine gesonderte "Verkündung"/BGBl-Übersichtsseite als Menüpunkt gefunden — Verkündung ist stattdessen in jede Fundstellenzeile (Titel- und Paragraphenebene) sowie in jede Änderungszeile eingebettet, mit Deep-Link auf das PDF-Faksimile bei bgbl.de
- "Aufgehobene Gesetze": nicht gezielt geprüft (nicht in den 15 Abrufen enthalten) — offen

### Suche / Verweise / Zitierungen
- Vorschriftensuche: kombiniertes §/Artikel + Gesetz-Feld, Autosuggest (`ajax-suggestion url-/suggest`), tastatur-first (Zifferneingabe → §-Feld, Buchstabe → Gesetz-Feld)
- Volltextsuche: separates Suchfeld, auch scope-bar "nur in [aktuellem Gesetz]"
- Zitationsnetz **bidirektional**: (a) gesetzesweit "wird in N Vorschriften zitiert" — gegliederte Liste, u.a. Abschnitt "Ermächtigungsgrundlage" (zeigt an, welche Verordnungen sich auf ein Gesetz stützen); (b) paragraphenscharf "§ … wird zitiert" — engere Liste nur direkter Bezug auf genau diesen Paragraphen
- EU-Normen: buzer.de selbst enthält keine EU-Texte, verlinkt aber auf eur-lex.europa.eu (Hinweis: dortiger verlinkter Text ist meist die **Urfassung**, nicht konsolidiert — Nutzer muss selbst "consolidated version" suchen)
- Kein Landesrecht, keine Urteile (Ausnahme: im BGBl veröffentlichte BVerfG-Entscheidungen), keine Kommentare

## 2. Technik / Datenherkunft

- **Betreiber**: private Einzelinitiative (It laut Impressum-Seite https://www.buzer.de/i.htm; Kurzfassung von WebFetch nennt "Daniel Liebig, Berlin" — dieser Name selbst wurde nicht durch eigenen Volltext-Grep verifiziert, daher **unklar/nur mittelbar belegt**, sollte vor Zitat gegengeprüft werden). Site-Untertitel überall: "Bundesrecht - tagaktuell konsolidiert - alle Fassungen seit 2006".
- **Alter/Reichweite**: Nutzerstimmen auf /h.htm datiert 2008–2010 → Dienst existiert mindestens seit ca. 2006–2008 in aktueller Form; "vollständige Änderungshistorie seit 2006".
- **Umfang**: "nahezu das gesamte im Fundstellennachweis A geführte deutsche Bundesrecht (Gesetze, Verordnungen, Anordnungen, Erlasse und im BGBl veröffentlichte BVerfG-Entscheidungen)" — Fundstellennachweis A ist die amtliche, vom BMJ geführte Liste des geltenden Bundesrechts.
- **Konsolidierungsmethode — wörtliches Zitat der Hilfeseite (/h.htm), belegt, keine Vermutung**: "Buzer.de konsolidiert selbst und stellt in aller Regel konsolidierte Fassungen auch bei Inkrafttreten am Tage nach der Verkündung sicher. Zur Qualitätssicherung findet regelmäßig nach Änderungen ein Abgleich mit den vom BMJ angebotenen Texten statt." → eigene, offenbar mit hohem manuellen/redaktionellem Anteil betriebene Konsolidierung + Gegenprüfung gegen die vom BMJ bereitgestellten (also über gesetze-im-internet.de laufenden) Texte. **Kein Hinweis auf vollautomatische NLP-Anwendung der Änderungsbefehle** ("§ 5 wird wie folgt geändert…") gefunden — die Formulierung "konsolidiert selbst" plus "Abgleich" liest sich eher nach kuratiertem/QS-geprüftem Prozess als nach reiner Textalgorithmus-Automation; das bleibt **unklar/nicht direkt belegt**, da keine technische Methodikseite gefunden wurde.
- **Aktualisierungsrhythmus**: "tagaktuell"; Startseite listet laut Startseiten-Fetch die letzten im BGBl erfolgten Verkündungen; Konsolidierung erfolgt grundsätzlich erst mit Inkrafttreten der jeweiligen Änderung, aber i. d. R. taggenau ab Inkrafttreten verfügbar.
- **URL-Schema**: `/NR_KURZ.htm` für aktuelle Paragraphenfassung (z.B. `/100_BGB.htm`), `/gesetz/{interneGesetzId}/index.htm` bzw. kanonisch `/{KURZ}.htm` für Gesetzesübersicht, `/gesetz/{id}/l.htm` = Änderungshistorie, `/gesetz/{id}/Aenderungen_{KURZ}_vom_{DD.MM.YYYY}.htm` = Gesamtsynopse zu einem Stichtag, `/gesetz/{id}/v{internId}-{YYYY-MM-DD}.htm` = einzelne frühere Paragraphenfassung/Synopse, `/gesetz/{id}/b{n}.htm` = TOC-Sprunganker auf Buch/Abschnitt-Ebene (keine Änderungsgesetz-Detailseite, wie zunächst vermutet — korrigiert im Rechercheverlauf), `/outb/bgbl/{code}.htm` = Redirect-Tracker zu bgbl.de. IDs wirken stabil (interne DB-IDs), aber nicht offiziell dokumentiert/keine Garantie gefunden.
- **API/Export**: kein REST/JSON-API gefunden. Vorhanden: RSS-Feed (`/gesetze_feed.xml`), zwei OpenSearch-Descriptors (Titel-/Volltextsuche), "Web-Widget" (Ticker zum Einbetten), "Blog-Plugin" zum Zitat-Verlinken, PDF-Druckansicht (`/Gesetze_PDF_ausdrucken.htm`, print.css). Kein Bulk-Download/Datenexport gefunden.
- **robots.txt** (https://www.buzer.de/robots.txt, Abruf 6.9.2026): generell offen (`Disallow:` leer für `*`), gezielt gesperrt: `/s2.htm`, `/inf.js`, `/infobox.js`, `/functions.js`, `/outb/` (Tracker-Redirects), `/newsletter.htm`, Query-Parameter-Varianten `?line=`, `?m=`. Einzelne Content-Seiten (z.B. `/gesetz/6597/index.htm`) tragen zusätzlich `noindex,follow` + `canonical` auf die Kurz-URL — Duplicate-Content-Steuerung, kein Crawl-Verbot.
- **Datenschutz/Impressum** (/i.htm): DSGVO-Datenschutzerklärung vorhanden (Art. 6 Abs. 1 S. 1 lit. f DSGVO, tägliche Aggregation/Löschung personenbezogener Logdaten, Cookies für Verlaufshistorie 2h, Google AdSense, jQuery-Einbindung). Keine explizite Weiternutzungs-/Lizenzklausel für die aufbereiteten Rechtsdaten im abgerufenen Ausschnitt gefunden (offen — evtl. weiter unten auf derselben Seite, nicht vollständig gelesen).
- **Monetarisierung**: kostenloser Kernservice + Google AdSense + kostenpflichtiges "Rechtskataster"-Abo (Änderungsüberwachung/Alarm, 128,52 €/Jahr netto 108 €) — belegt über Werbeblock auf Paragraphenseite.
- **Amtlicher Abgleich/Qualitätssicherung**: eigene "Qualicheck"-Seite verlinkt (/quality.htm, Inhalt nicht separat abgerufen — offen), Text auf /h.htm verweist Nutzer bei Abweichungen zu anderen Seiten primär auf Prüfung der eigenen Historie ("ob bereits alle Änderungen konsolidiert wurden").

## 3. Vergleich mit Fedlex / was für LexMetrik deterministisch nachbaubar wäre

**Was die Schweiz (Fedlex) amtlich bereits hat:**
- Konsolidierte Fassungen mit Datum (Fedlex führt jede Konsolidierung mit Gültig-ab-Datum, analog zu buzers "Fassungen")
- AS-Änderungserlasse als eigene, datierte Dokumente je Erlass (analog Buzer-Änderungsgesetz-Spalte 3)
- Chronologie der Änderungen pro Erlass ist grundsätzlich rekonstruierbar, weil jede Konsolidierung ihre AS-Fundstelle trägt

**Was (nach dieser Recherche) fehlt bzw. bei Fedlex nicht in einem Klick sichtbar ist:**
1. **Paragraphenscharfe (artikelscharfe) Änderungshistorie**: Fedlex zeigt die Chronologie auf Erlass-Ebene, nicht direkt "dieser Artikel wurde an diesen X Stichtagen geändert" ohne den ganzen Erlass zu laden.
2. **Absatz-/satzgenaue Synopse alt/neu** mit Highlighting — bei Fedlex nicht als fertiges UI-Feature vorhanden; es existiert nur die Möglichkeit, zwei Konsolidierungs-Stände als Volltext zu vergleichen, kein aufbereitetes Diff pro Artikel.
3. **Umgekehrte Auflösung eines Mantel-/Änderungserlasses** ("dieses Gesetz ändert diese 14 Artikel in 3 anderen Erlassen, aufgeschlüsselt") — bei AS-Änderungserlassen technisch aus dem AS-XML able- und rechenbar, aber nicht als fertige Fedlex-Seite verfügbar.
4. **Verlinkte Materialien** (Botschaft/Entwurf/Kommissionsbericht) direkt an der Änderung — bei Fedlex nicht knüpfbar auf Artikelebene; die Botschaften liegen bei der Bundesversammlung (curia vista) / BBl, aber nicht referenziert je Artikeländerung.
5. Ein **freier RSS/Ticker für "gerade in Kraft getretene" bzw. "demnächst in Kraft tretende" Änderungen je Erlass** fehlt bei Fedlex als Endnutzer-Feature (es gibt zwar AS-wöchentliche Ausgaben, aber keine Erlass-fokussierte "watchlist"-Funktion).

**Was mit vorhandenen Fedlex-Daten (AKN-XML je Konsolidierung + AS-Änderungserlass-XML) deterministisch rechenbar wäre — ohne LLM, ohne Schätzung, §2-konform:**
- Ein **Artikel-Diff zwischen zwei Konsolidierungsständen** ist rein strukturell aus den AKN-XML-Bäumen berechenbar (Element-für-Element-Vergleich je `<article>`/`<paragraph>`), analog zur Buzer-Synopse — Text-Diff auf Absatz-/Satzebene ist ein reines String-/DOM-Diff-Problem, kein Rechtsverständnis nötig → **gut nachbaubar**, da Determinismus (§2) und Datenherkunft amtlich (§7) beide erfüllbar sind.
- Eine **chronologische Änderungstabelle je Erlass** (Inkrafttretensdatum, betroffene Artikel, Link auf AS-Fundstelle) lässt sich aus der Abfolge der Konsolidierungen + deren "geändert durch AS-Nr." Metadaten rein mechanisch aufbauen.
- Die **"umgekehrte" Auflösung eines Änderungserlasses auf betroffene Artikel** ist möglich, wenn der AS-Änderungserlass in seinem eigenen XML die geänderten Fundstellen (SR-Nummer + Artikel) strukturiert referenziert; das müsste stichprobenartig geprüft werden, ob AS-XML das durchgängig maschinenlesbar tut (nicht Teil dieser Recherche — **offen**, gehört in eine eigene Korpus-Prüfung, keine Web-Recherche).
- **Nicht deterministisch nachbaubar** wären Buzers "Begründungen des Gesetzgebers" 1:1, weil das Verlinken auf Materialien Kuratierung/Zuordnung erfordert — bei Fedlex/Bundesversammlung aber grundsätzlich datenseitig vorhanden, nur nicht cross-referenziert.

## Offene Punkte (nicht in den ~13 Abrufen abgedeckt)
- Exakte Rechtsform/Identität des Betreibers unabhängig verifiziert (nur mittelbar über WebFetch-Zusammenfassung, nicht per eigenem Grep bestätigt)
- Inhalt der "Qualität"/Qualicheck-Seite (/quality.htm)
- Separate "Aufgehobene Gesetze"-Ansicht nicht gezielt aufgerufen
- Ob es eine offizielle/dokumentierte API oder Bulk-Lizenz für Rechtskataster-Abonnenten gibt (Werbetext deutet nur auf Alarm/Mail, kein Datenexport erwähnt)
- Genaue Nutzungsbedingungen/Lizenz der aufbereiteten Daten (Wiederverwendung Dritter) nicht auf der abgerufenen Impressum-Teilseite gefunden
