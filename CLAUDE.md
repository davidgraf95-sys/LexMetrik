# LexMetrik — Grundprinzipien (verbindlich für jede Änderung)

**Erster Anlaufpunkt für den aktuellen Stand: `STRUKTUR.md`.** Dieses Dokument
hier ändert sich selten; es hält fest, *wie* gearbeitet wird — nicht *was*
gerade gebaut ist.

## §1 Oberstes Ziel: fachliche Korrektheit (Logik vor allem)

Jede andere Zielgrösse — weniger Code, kleinere Bundles, elegantere
Abstraktionen, schnellere Umsetzung — ist der **Korrektheit der Rechtslogik
untergeordnet**. Im Zweifel gilt: lieber 50 Zeilen Duplikat behalten als eine
Abstraktion, die zwei rechtlich verschiedene Fälle stillschweigend gleich
behandelt. Ein Refactoring, das auch nur eine Frist, Quote oder Warnung
verändert, ist kein Refactoring, sondern ein Bug.

## §2 Determinismus ohne Ausnahme

Alle Engines sind **rein und deterministisch**: gleiche Eingabe → gleiche
Ausgabe. Kein LLM, keine Heuristik, keine Schätzung, kein `Date.now()` in der
Rechenlogik. Neue Rechner/Vorlagen werden nur aufgenommen, wenn der Umfang
klar regelbasiert ist (sonst Backlog, siehe STRUKTUR.md) — «feste
Rechenregeln, keine Schätzung» ist das Produktversprechen.

## §3 Schichtentrennung: Logik ≠ Darstellung

- **`src/lib/` (Engines, Schemas):** enthält die gesamte Rechtslogik und
  KEINE UI. Jede Rechtsregel lebt an genau **einer** Stelle.
- **`src/pages/`, `src/components/`:** Darstellung, Navigation, Speicherung —
  und KEINE Rechtslogik (keine Fristberechnung, keine Schwellenwerte, keine
  Normtexte, die nicht aus einem Schema/einer Engine kommen).
- **Folge für Verkleinerungen:** Entdoppelung, Hooks, generische Rahmen
  (Wizard, Vorschau, Gates-Anzeige) finden in der Darstellungsschicht statt.
  Die Logikschicht wird dadurch nie berührt.

## §4 Eine Engine pro Rechtsgebiet — keine Fusion zur Code-Ersparnis

Die Trennung der Engines (verjaehrung, sperrfristen, mietrecht, …) ist kein
Ballast, sondern ein Sicherheitsmerkmal: einzeln testbar, keine Querwirkungen
zwischen Rechtsgebieten. Geteilt wird nur fachneutrale Infrastruktur
(Datums-Arithmetik, Feiertage/Computus, Bruchrechnung, Fristen-Grundmuster) —
nie materielle Rechtsregeln.

## §5 Single Source of Truth

Katalog = `startseiteConfig.ts` · Vorlagen-Inhalt = die Schemas in
`src/lib/vorlagen/` · PDF und DOCX rendern aus **demselben**
Assemble-Ergebnis · Behörden-/Schwellen-Stammdaten genau einmal definiert.
Niemals denselben Fachinhalt an zwei Stellen pflegen.

## §6 Refactorings sind verhaltensneutral — und beweisen das

Vor jedem Struktur-Umbau gilt das Protokoll:

1. Tests vorher grün (`npx tsc -b` · `npm test` · `npm run lint` mit
   **voller Ausgabe**, nie `tail -1` · `npm run build`).
2. Wo Texte/Dokumente entstehen (assemble, PDF-Modell, Warnungen): vorher
   **Golden-Outputs** festhalten (Snapshot/Vergleichslauf) — nachher müssen
   sie identisch sein.
3. Tests werden bei Refactorings **nicht angepasst**. Muss ein Test geändert
   werden, ist es eine fachliche Änderung → gehört in einen eigenen,
   deklarierten Schritt mit Begründung.
4. Performance-Massnahmen (Lazy Loading, Code-Splitting) ändern nur den
   **Ladezeitpunkt**, nie Inhalt oder Reihenfolge der Logik.

## §7 Normen: verifizieren, nicht vertrauen

Jeder Norm-Anker wird empirisch gegen Fedlex geprüft (Filestore-HTML,
Anker-Format `art_335_c`, sprachunabhängig). Aufträge — auch sorgfältig
formulierte — können faktische Fehler enthalten oder neueren Entscheiden
widersprechen: dann **abweichend umsetzen und die Abweichung offenlegen**.
`verified: true` und der Status «geprüft» setzen die fachliche Abnahme durch
David (fachkundige Person) voraus — nie automatisch setzen.

## §8 Ehrlichkeit gegenüber Nutzern

Das Status-Modell (entwurf / geprüft / geplant) zeigt den echten
Prüfungsstand. Unsicherheiten, offene kantonale Verifikationen und
methodische Annahmen werden in der UI offengelegt, nicht weggeglättet.
Keine Rechtsberatung; Formvorschriften (Eigenhändigkeit, Beurkundung)
bestimmen, welche Exportformate überhaupt angeboten werden.

## §9 Deploy-Disziplin

Vor jedem Deploy: Bug-Check (unabhängige Review-Agents + empirische Repros +
Regressionstests). **Push und Deploy nur nach explizitem Ja von David.**
Prod: `npx vercel --prod` (Projekt `lexmetrik`, lexmetrik.vercel.app).

## §10 Wachstum folgt dem Rahmen

Neue Vorlagen/Rechner nutzen die bestehenden geteilten Bausteine (Engine-
Muster, Wizard-Rahmen, `ui.tsx`, Renderer) statt Kopien anzulegen. Wenn ein
Rahmen fehlt, wird **erst der Rahmen** gebaut (als verhaltensneutraler
Schritt nach §6), dann das neue Feature darauf.

## §11 Erforschtes Wissen wird geordnet abgelegt (Anweisung David 6.6.2026)

Jede Recherche (Normen, kantonale Erlasse, Behördendaten, Parameter,
Rechtsprechung) mündet in eine **geordnete Übersichtsliste** in der
`bibliothek/` mit Eintrag in deren `INDEX.md` — nie nur in Chat-Antworten
oder Commit-Messages. Struktur engine-orientiert, damit beim Bau direkt
daraus gearbeitet werden kann:

1. **Quelle + Stand** (amtliche URL, Konsolidierungs-/Abrufdatum),
2. **Regel deterministisch formuliert** (decision-tree-fähig: Eingabe →
   Ausgabe, keine Prosa-Reste),
3. **Geltungsbereich und Ausnahmen** (Kantone, Fussnoten, Bedingungen,
   Teilgebiete),
4. **Pflegebedarf** (datierte Parameter → Verfallsregister-Kandidat),
5. **Abnahme-Status** (Erstrecherche / zweifach geprüft / durch David
   abgenommen).

Erkenntnisse, die bestehenden Code korrigieren, werden zusätzlich am
Fundort als Kommentar mit Quellenverweis verankert (§7).
