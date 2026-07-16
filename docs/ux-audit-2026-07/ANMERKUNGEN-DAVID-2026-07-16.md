# Anmerkungen David — 16.7.2026 (WÖRTLICH, massgebliche Quelle)

> Aufgenommen aus dem Chat 16.7.2026 (Fable-Orchestrator-Session). Einordnung als
> A29–A38 in `FAHRPLAN-GESETZES-UX.md` §10.10 bzw. Design-Direktive in der
> D-Kette (`FAHRPLAN-DESIGN-WAERME.md`). Dieses File ist der Wortlaut-Anker
> (KA5-Muster wie ANMERKUNGEN-DAVID-2026-07-10/-11/-12.md).

## Vorab-Aufträge (Chat, gleiche Session)

- «run till dry» — die offene Handoff-Baustrecke (PR-B BGE 148/149 · D-5–D-8 ·
  H-11–H-14) autonom abarbeiten, bis nichts Offenes mehr da ist.
- «das mit ultracode einbauen in fahrplan» — Ultracode-/Workflow-Orchestrierung
  als Massnahme in `FAHRPLAN-TOKEN-OEKONOMIE.md` verankern (→ T20).
- «und dann wie immer alles mit opus bauen» — Rollen-Bestätigung: Fable
  orchestriert nur, jede Bau-Einheit = Opus-Agent.

## Anmerkungen Lexmetrik (wörtlich)

1.
https://lexmetrik.vercel.app/rechtsprechung/bge_147_III_121?norm=Art.+298+ZGB&ansicht=auszug
Original hat Regeste a und Regeste b vgl. https://www.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?highlight_docid=atf%3A%2F%2F147-III-121%3Ade&lang=de&type=show_document
Lexmetrik hat nur Regeste a.

2.
Marginale von Gesetzen sind mit buchstaben nummeriert. Bei 1bis etc. ist bis
Hochgestellt. Weisst du was ich meine?

3.
Art. 798a ZGB, SR 210 (Stand 01.07.2026),
https://lexmetrik.vercel.app/gesetze/bund/ZGB#art-798_a
Fusszeilen falsch. Sollten im Fliesstext sein

Zwischen Artikel und Fussnote ist immer ein Abstand. Ist auf Fedlex nicht so.
das gleiche bei fussnote an marginalie

Fusszeile bei https://lexmetrik.vercel.app/gesetze/bund/ZGB#art-276 abs. 1
führt zu grossem abstand zum nächsten absatz

4.
Kontextfenster am Ende vom Gesetz ist gut aber nur schwer sichtbar. Also erst
wenn man ans ende des Gesetzes scrolled. Soll attraktiver postioniert werden.
Evtl. unterhalb der gliederung.

5.
Gliederung springt umher. Wenn man sich darin bewegt. Mit ultracode überprüfen
und nützlichkeit verbessern.

6.
Wenn man in gesetz in split view geht zum beispiel auf bundesgerichtsentscheid
der verlinked ist, dann springt man durch das gesetz auf den früheren artikel
der angeklickt wurde.
Ausserdem keine möglichkeit mehr ansicht zu ändern in split view.

7.
Suchfenster von Gesetzen ist aktuell oberhalb der gliederung. Verschiebe das in
die kopfzeile wo sich auch ansicht usw. befindet. Ausserdem sollen
suchresultate markiert werden. Also bspw. Wenn man im OR Vertrag sucht soll
Vertrag gehighlighted werden.

8.
Bei ZGB in Gliederung Wortlaut der früheren Bestimmungen des sechsten Titels.
Das braucht es nicht.

9.
Ingesamt gib dem Gesetz mehr platz. Zitat Links ist auch sehr weit rechts.
Nutze den Platz der zur Verfügung steht. Beachte aber verschiedene
Bildschirmbreiten. Soll optimal angepasst sein.

## Nachtrag (gleiche Session, später)

«ausserdem mache die ganze lexmetrik webseite heller uns weisser.»

10.
«wieso ist hier https://lexmetrik.vercel.app/gesetze/bund/BGFA#art-20 dieser
entscheid nicht verlinked» — BGE 150 II 308 (relevancy.bger.ch-Link auf
atf://150-II-308).
*Befund Orchestrator:* Korpus-Lücke, kein Verzahnungs-Bug — der BGE-Korpus
reicht Stand 16.7.2026 bis Band 147 (146/147 gemergt 13.7., PR #232); Band 150
ist schlicht noch nicht importiert. Massnahme: BGE-Nachzug fortsetzen —
PR-B (148/149, geplant) und zusätzlich **PR-C (150 + 151, soweit publiziert)**,
gleiche Mechanik/Gegenprüfung wie #232.

11.
«BGE 150 III 38 beim Bundesgericht öffnen ↗ wenn ich das in suchfenster
eingebe und darauf klicke führt es mich zu diesem falschen entscheid
https://search.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?highlight_docid=atf%3A%2F%2F150-III-38%3Ade&lang=de&zoom=&type=show_document»
*Einordnung:* Deep-Link-Builder-Bug im Suchfenster («beim Bundesgericht
öffnen»-Fallback für BGE ausserhalb des Korpus) — der erzeugte
`highlight_docid`-Link landet beim falschen Entscheid. Empirisch verifizieren
(welchen Entscheid zeigt bger.ch dort wirklich? existiert atf://150-III-38?),
Link-Format korrigieren oder ehrlicher Such-Query-Fallback.

## Nachtrag 2 (gleiche Session, abends)

12. (→ **A41**, UI-Bug, bündelt mit E5/A35)
«kopfzeile bei gesetzen verdeckt suchresultate aus dem header»
*Einordnung:* Das Suchresultate-Dropdown der Header-Suche liegt unter der
sticky Gesetzes-Kopfzeile (Stacking/z-index) — Overlay-Bug.

13. (→ **A42**, kantonale Extraktions-Treue, Heimat W2·13/K-1, Risiko-Pfad)
«https://lexmetrik.vercel.app/gesetze/kanton/BS-154.100
enhält keine marginalen und auch keinen ingress»
«und keine gliederung»
«enthält auch keine fussnoten»
«ingress soll analog zu pdf ingress verlinked sein
file:///Users/david/Downloads/154.100-9-1.de.pdf»
*Einordnung:* Referenzfall für die kantonale Reader-/Extraktions-Treue
(BS 154.100): Marginalien, Ingress (mit Rechtsgrundlagen-VERLINKUNG wie im
amtlichen PDF), Gliederung und Fussnoten fehlen im Kanton-Snapshot komplett.
Lokale PDF-Referenz: ~/Downloads/154.100-9-1.de.pdf (amtliche BS-Publikation).

## Nachtrag 3 (gleiche Session — Auftrag Gesetze-Aufteilung V2)

«verbessere mit ultracode und fable die aufteilung der gesetze kantonal und
bund … sinnvoller und praxistauglicher aufbau und man schnell relevantes
findet.»

*Einordnung Orchestrator:* Ultracode-Panel gefahren (5 Empirie-Miner + 3
Entwürfe + 3-Linsen-Judge-Panel + Synthese). Sieger-Entwurf
«Erfassungsgrad-Staffel». Verbindliche Bau-Spec eingeordnet in
`FAHRPLAN-GESETZES-UX.md` §11 (Bau-Einheiten IA-1…IA-7, David-Fragen
Y-A/Y-B/Y-C); ROADMAP-Anker im W2·5d-Block.
