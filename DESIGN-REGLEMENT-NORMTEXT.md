# Design-Reglement Normtext — die Gesetzesdarstellung von LexMetrik

Stand: 28.6.2026 (Auftrag David: «baue ein fundiertes Regelwerk für die
Darstellung von Bundesgesetzen und Verordnungen; es soll mindestens die
Qualitätserfordernisse von Fedlex haben»). Geltungsbereich: **die Anzeige von
Gesetzes-/Normtext** im Gesetzleser (`src/pages/gesetz-leser/*`,
`src/components/normtext/*`, `src/lib/normtext/*`) und die Extraktion, die ihn
speist (`scripts/normtext*`).

Dieses Reglement hängt unter `DESIGN-REGLEMENT.md` (Dach) und konkretisiert es
für den Normtext — parallel zu `-RECHNER`, `-RECHTSPRECHUNG`, `-VORLAGEN`. Bei
Konflikt gewinnt dieses Reglement *innerhalb der Gesetzesdarstellung*; alles
andere folgt dem Dach. **Das Verbindliche ist der Code/die Daten** — dieses
Reglement erfindet keine Magic-Numbers, es bindet an bestehende Tokens und hält
das *Warum* + die Soll-Werte fest.

Evidenz: das Fedlex-Datenmodell selbst (gecachte amtliche Konsolidierungs-HTMLs
unter `/tmp/*.html`, Struktur `div#preface` / `div#preamble` / `article` /
`div.dispositions` / `div.annex` / `div.footnotes`) sowie das
Vollständigkeits-Audit `AUDIT-FEDLEX-DARSTELLUNG-2026-06-28.md` (33 Lücken
bestätigt). Umbau-Plan: `FAHRPLAN-NORMTEXT-DARSTELLUNG.md`.

---

## L0 · Leitsatz (steht über allem)

> **LexMetrik bietet eine Gesetzesdarstellung, die *gleich fundiert* ist wie
> Fedlex — kein Informationsverlust, amtstreu — aber *nützlicher und
> praxistauglicher* als Fedlex und andere Konkurrenten.**

Daraus folgt die Tiefen-Steuerung jeder Entscheidung:

1. **Fedlex ist die Untergrenze der Fundiertheit, nicht das Ziel.** Was Fedlex
   für einen Erlass zeigt, *muss* bei uns abbildbar sein (oder ehrlich als
   «nicht abgebildet» markiert — nie still weggelassen).
2. **Bei der Darstellung dürfen/sollen wir Fedlex übertreffen** — ruhigeres
   Schriftbild, lückenloser Sprung-Index, interne Verzahnung (Norm→Norm), aber
   nie auf Kosten der Amtstreue.
3. **Reihenfolge der Tiefe:** zuerst was die Norm *fundierter/korrekter/
   vollständiger* macht, dann *Nutzen-Vorsprung*, zuletzt Kosmetik.

---

## §1 · Wortlaut ist unantastbar (oberste Invariante)

- Der **amtliche Wortlaut wird nie verändert** — wir normalisieren nur die
  *Darstellung* (Einzug, Marker-Position, Strich-Logik, Abstände).
- Eine Darstellungs-/Extraktions-Änderung, die den Sinn verschiebt, ist ein
  Bug, kein Feature. **Falsche Zitate sind schlimmer als gar keine.** Beispiel:
  verlorene Verschachtelungstiefe einer Aufzählung (Ziff. oben / lit. unten)
  erzeugt falsche Fundstellen → §1-Verletzung, höchste Priorität.
- **Plausibel-falsche interne Links sind schlimmer als tote.** Ein Verweis, der
  auf den falschen Artikel zeigt (z. B. VO-Selbstverweis statt Trägergesetz),
  wird unterdrückt, bevor er falsch verlinkt wird.

## §2 · Vollständigkeit gegen Fedlex (Fundiertheits-Floor)

Ein Bundeserlass besteht aus mehr als seinen Artikeln. Folgende Fedlex-Regionen
**gehören zur Norm** und dürfen nicht still fehlen:

| Region | Fedlex-Element | Status-Soll |
|---|---|---|
| Erlass-Kopf | `div#preface` (SR-Nr, Titel, **Erlassdatum «vom …»**, Stand, Kopf-Fussnoten) | abbilden |
| Ingress/Präambel | `div#preamble` (Erlassformel «… beschliesst:/verordnet:», bei BV materielle Präambel) + deren Fussnoten | abbilden |
| Artikel | `article` (Absätze, Aufzählungen mit **korrekter Verschachtelung**, Tabellen, Bilder/Formeln) | abbilden |
| Schluss-/Übergangsbest. | `div.dispositions` (datierte UeB-Blöcke; ZGB-Schlusstitel = 178 Art.) | abbilden *(B2)* |
| Anhänge | `div.annex` (Anhang 1, 2 … mit Tabellen/Verzeichnissen) | abbilden *(B2)* |
| Fussnoten-Apparat | `div.footnotes` (Quell-/Änderungsvermerke, AS/BBl-Zitate, **Hervorhebungen**) | abbilden |

**Markier-Pflicht (§8):** Was wir (noch) nicht abbilden, wird sichtbar als
solches markiert — nie als Vollständigkeit ausgegeben.

## §3 · EINE Quelle (Snapshot + Sidecar)

- Der **Normtext-Index** (`golden/normtext-snapshot.json` / `public/normtext/
  bund/*.json`) ist die *eine* Quelle des Wortlauts. Keine zweite Wortlaut-Quelle.
- **Anreicherungen, die den Wortlaut nicht verändern** (Erlass-Kopf/Ingress,
  Fussnoten-Hervorhebung, Wort-Offsets der Marker), liegen als **Sidecar** neben
  dem Index → der Index bleibt byte-gleich. Nur echter Normtext-Zuwachs
  (Verschachtelungstiefe, Tabellen-Köpfe, Bilder, doppelte-ID, neue
  Schluss-/Anhang-Einträge) verändert den Index **bewusst**.

## §4 · Darstellungsregeln (wo wir Fedlex erreichen + übertreffen)

- **Gliederung/Sprung-Index lückenlos.** Der TOC zeigt **alle** Randtitel einer
  Ebene — auch Blatt-Knoten ohne Unterknoten (Fedlex-Übertreffer: keine
  löchrige Buchstabenfolge wie «B, C, E»; ZGB-Einleitung muss A–E zeigen). Die
  Wurzel (`randtitelKnoten`) speist TOC **und** Fliesstext-Überschrift — Blatt-
  Randtitel im TOC nie mit der Artikel-eigenen Sachüberschrift doppeln.
- **Zusammengehörigkeit einheitlich.** Die Gruppierungs-Striche (zeigen, dass
  Artikel zusammengehören) folgen *einer* Logik — gleicher Strich überall, kein
  Mal-ja-mal-nein zwischen Knoten- und Blatt-Randtiteln.
- **Einheitliche linke Textkante.** Der Einzug ist gleich, ob ein Artikel
  nummerierte Absätze hat oder nur einen Block (`absatz=null`) — keine
  springende Textkante zwischen Artikeln.
- **Aufgehobene Artikel: schlicht statt verspielt.** Ein voll aufgehobener
  Artikel zeigt als **dezente Einzeile** seine amtliche Aufhebungsnotiz
  («Aufgehoben durch … [AS …]») — das ist amtlicher Inhalt (§2), kein «…».
  Kein Accordion/Toggle-Apparat. Ruhig, aber vollständig.
- **Fussnoten wie Fedlex.** Platzierung + Abstand folgen dem Fedlex-Ist
  (einheitlich, kein Mal-Abstand-mal-keiner); Hervorhebungen (fett/kursiv) im
  Fussnotentext bleiben erhalten.
- **Änderungsstatus ruhig.** Der Änderungsvermerk je Bestimmung («Eingefügt
  durch / Fassung gemäss / in Kraft seit / AS …») bleibt **hinter dem Fussnoten-
  Schalter** (David-Entscheid 28.6.: ruhiges Schriftbild > Oberflächen-
  Fundiertheit; der Inhalt ist da, auf Klick). Die *aufgehoben*-Notiz dagegen
  ist immer sichtbar (sie *ist* der Artikelzustand).

## §5 · Verzahnung (der Burggraben, Fedlex-Übertreffer)

- **Norm → Norm intern.** Ein SR-Verweis in Fussnote/Fliesstext, dessen
  Zielerlass wir im Volltext haben, verlinkt **intern** auf den LexMetrik-Leser
  (`/gesetze/bund/<KEY>#art_<N>`) — man bleibt im Werkzeug. Nur wo wir den
  Erlass nicht haben, bleibt der **Fedlex-Link als ehrlicher Fallback**.
- **Quelle für «haben wir den Erlass?»** ist das Register (§3, eine Quelle) —
  kein zweiter Pfad.
- **Stand-Transparenz (§8).** Solange nur ein Geltungsstand existiert (bis
  Versionierung, B3), kann der intern gezeigte Stand vom zitierten abweichen →
  der Stand wird transparent markiert, nicht stillschweigend gleichgesetzt.

## §6 · Verweis-Ziele werden nicht geraten

Linkziele kommen aus dem, was Fedlex tatsächlich kodiert / aus dem Register —
**nie aus einer Render-Zeit-Heuristik**, die «Artikel N» reflexhaft auf den
gerade gelesenen Erlass auflöst. In einer Verordnung verweist «Artikel N» fast
immer aufs **Trägergesetz** (BGerR → BGG), nicht auf sich selbst. Bis das
positive Trägergesetz-Routing als verifizierte Datenaufgabe steht, werden
falsche Selbstverweise **unterdrückt** (§1: lieber kein Link als ein falscher).

## §7 · Golden-Regel (zwei Welten strikt trennen)

- **`golden/lexmetrik-golden.json` (Engine/Rechtslogik) ist TABU** und muss über
  den *ganzen* Batch **byte-gleich** bleiben (`golden:vergleich` = IDENTISCH =
  Beweis, dass die Rechtslogik unberührt ist). **Bricht er, ist man versehentlich
  in eine Engine gelaufen → sofort STOPP, nie das Tor aufweichen.**
- **`golden/normtext-snapshot.json` (Daten-Index)** wird bei bewusstem Normtext-
  Zuwachs **regeneriert und neu gesegnet** (self-consistent sha, kein externer
  Erwartungswert) — **mit adversarialer Gegenprüfung** und **genau einer**
  Re-Segnung pro Batch (alle golden-brechenden Änderungen zuerst landen, dann ein
  Regen-Block, dann ein Pathspec-Commit; `--stat`-Dateizahl gegen die add-Liste).
- **Sidecar-Anreicherungen (§3) brechen den Index nicht** → bleiben byte-gleich.

## §8 · Keine stillen Lücken

Jede nicht abgebildete Information ist **sichtbar markiert** (z. B. «maschinell»,
«nicht abgebildet», «Stand abweichend»). Kein `verified`/«vollständig» ohne
Deckung. Bilder, die wir als Bild zeigen (math. Formeln liefert Fedlex als
Bild), bleiben Bild — kein erfundenes OCR/LaTeX, ehrlich dokumentiert.

---

## Was bewusst NICHT gilt (Audit-widerlegt)

Diese im Audit geprüften Punkte sind **kein** Defizit und werden **nicht**
gebaut: Titel-`<br>`-Plättung, Absatz-`<p>`-in-`<table>`-Verschlucken, «Fussnoten-
Apparat per Default aus» (ist korrekt), volle `colspan/rowspan`-Logik (nur
minimales `colspan`→Kopf-Padding für verschobene Köpfe), «N.—»-Spacing,
`art-`-vs-`art_`-Anker, «Deeplink vom Renderer verworfen» (wird genutzt). Details:
`AUDIT-FEDLEX-DARSTELLUNG-2026-06-28.md`, Abschnitt «Widerlegt».
