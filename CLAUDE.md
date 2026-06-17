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

## §4 Eine Engine pro Rechtsgebiet — Verschmelzung nur Golden-gegated

Die Trennung der Engines (verjaehrung, sperrfristen, mietrecht, …) ist kein
Ballast, sondern ein Sicherheitsmerkmal: einzeln testbar, keine Querwirkungen
zwischen Rechtsgebieten. Geteilt wird fachneutrale Infrastruktur
(Datums-Arithmetik, Feiertage/Computus, Bruchrechnung, Fristen-Grundmuster) —
nie materielle Rechtsregeln.

**Code-Verschmelzung ist erlaubt (Entscheid David 8.6.2026), aber nur unter
zwei Bedingungen:** (1) strikt nach dem §6-Golden-Protokoll — committete
Basis vorher aktuell, nachher `npm run golden:vergleich` byte-gleich; (2)
**regime-treu**: verschiedene Rechtsregimes bleiben im verschmolzenen Code
als **interne Verzweigung** erkennbar, sie werden nie zu einer gemeinsamen
Regel kollabiert (§1: lieber Duplikat als eine Abstraktion, die zwei
rechtlich verschiedene Fälle gleich behandelt). §1 und §3 bleiben
unangetastet. Risikoärmste Merges zuerst (geteilte Infrastruktur hinter den
Regime-Engines).

## §5 Single Source of Truth

Katalog = `startseiteConfig.ts` · Vorlagen-Inhalt = die Schemas in
`src/lib/vorlagen/` · PDF und DOCX rendern aus **demselben**
Assemble-Ergebnis · Behörden-/Schwellen-Stammdaten genau einmal definiert.
Niemals denselben Fachinhalt an zwei Stellen pflegen.

## §6 Refactorings sind verhaltensneutral — und beweisen das

Vor jedem Struktur-Umbau gilt das Protokoll:

1. Tests vorher grün (`npx tsc -b` · `npm test` · `npm run lint` mit
   **voller Ausgabe**, nie `tail -1` · `npm run build`).
   Für den grünen Routine-Check `npm run gate` (bzw. `gate:schnell` pro
   Iteration); die fünf Einzelbefehle mit voller Ausgabe nur zur Diagnose
   eines roten Gates. Der Wrapper kürzt nur die grüne Ausgabe — ein Fehler
   erhält weiterhin die volle Ausgabe (§6-Sinn: kein verstecktes Versagen).
2. Wo Texte/Dokumente entstehen (assemble, PDF-Modell, Warnungen): vorher
   **Golden-Outputs** festhalten (Snapshot/Vergleichslauf) — nachher müssen
   sie identisch sein.
3. Tests werden bei Refactorings **nicht angepasst**. Muss ein Test geändert
   werden, ist es eine fachliche Änderung → gehört in einen eigenen,
   deklarierten Schritt mit Begründung.
4. Performance-Massnahmen (Lazy Loading, Code-Splitting) ändern nur den
   **Ladezeitpunkt**, nie Inhalt oder Reihenfolge der Logik.
5. Diagnose sparsam (Token-Disziplin, 11.6.2026): Bei rotem vitest zuerst
   nur die rote Datei nachfahren (`npx vitest run src/tests/<datei>`), nicht
   die Suite. Golden-Abweichungen je Fall über `npm run golden:diff -- <id>`
   ansehen — `golden/lexmetrik-golden.json`, `dist/` und `package-lock.json`
   werden nie direkt gelesen (auch nicht von Review-Agents). Das kürzt nur
   den Diagnoseweg, nie ein Tor.

## §7 Normen: verifizieren, nicht vertrauen

Jeder Norm-Anker wird empirisch gegen Fedlex geprüft (Filestore-HTML,
Anker-Format `art_335_c`, sprachunabhängig). Aufträge — auch sorgfältig
formulierte — können faktische Fehler enthalten oder neueren Entscheiden
widersprechen: dann **abweichend umsetzen und die Abweichung offenlegen**.
`verified: true` und der Status «geprüft» setzen die fachliche Abnahme durch
David (fachkundige Person) voraus — nie automatisch setzen.

**Zitat-Ausnahme (Norm-Snapshot, Entscheid David 16.6.2026):** Gespeicherter
Gesetzestext (Norm-Snapshot für die Volltext-Vorschau) ist zulässig, wenn er
trägt: (a) **Stand** (Konsolidierungs-/Abrufdatum), (b) **amtliche Quelle-URL**,
(c) im UI **sichtbaren Live-Link** zur geltenden Fassung, (d) **automatische
Drift-Erkennung** gegen die Quelle (kein stilles Veralten). Fehlt eines davon,
ist der Snapshot kein Zitat, sondern eine zweite Wahrheit (§5) — dann nicht
speichern. Der Snapshot ist nie die massgebliche Fassung; das ist die amtliche
Quelle (in der UI offengelegt, §8).

**Build-Regel Norm-Snapshots (verbindlich, Auftrag David 16.6.2026):** Die
Volltext-Snapshots (`public/normtext/`) werden AUSSCHLIESSLICH vom Generator
`npm run normtext -- --datum=$(date +%F)` erzeugt, nie von Hand editiert. Jeder
künftige Build/jede neue Norm-Quelle folgt zwingend diesem Muster:
1. **Vollabdeckung** — ALLE Artikel je Erlass extrahieren (Bund: jedes
   `<article id="art_*">` der gepinnten Fedlex-Konsolidierung; Kanton: jeder
   Artikel des LexWork-Erlasses), nicht nur die zitierten.
2. **Aufzählungen vollständig** — lit./Ziff. als `items` je Absatz; nichts
   abschneiden (sonst wirkt die Bestimmung unvollständig).
3. **Immer die GELTENDE Fassung** — Bund über die gepinnte, als aktuell
   verifizierte Konsolidierung (`scripts/fedlex-cache.sh` +
   `check:fedlex-versionen`); Kanton über `current_version` der LexWork-API
   (`version_uid` als Drift-Token). Künftige, noch nicht in Kraft stehende
   Fassungen werden NICHT verlinkt.
4. **Provenienz je Eintrag** — `stand` = In-Kraft-Datum, `quelleUrl`,
   `fassungsToken`, `sha` (über Text + items); §7-Zitat-Ausnahme (a)–(d).
5. **Drift-Tor** — `check:normtext` (offline) + `check:normtext-netz` (live
   version_uid/Konsolidierung) müssen grün sein; im `gate`/`check:netz`
   verdrahtet. Neue Quellen ergänzen einen browserlosen Adapter (Fetch +
   strukturierte Extraktion + Drift-Token), kein Headless-Browser, kein
   Scraping pro Kanton. Detail-Referenz: `FAHRPLAN-GESETZESTEXT-POPUP.md`.
   **Kantonales Gesetz nur als PDF** (Quellen-Priorität LexWork → HTM → HTML →
   PDF → Live-Link-Fallback): verbindliche Extraktions-/Speicher-Regel (Profil
   im `adapter-pdf.ts`, pdfjs Build-Zeit, Body-Spalten-x, Stand/Drift-Token,
   Qualitäts-Tor → sonst ehrlicher Fallback) in
   `bibliothek/normen/norm-vorschau-snapshot-system.md` (§11).

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

## §12 Parallel-Sessions nur isoliert (Anweisung David 10.6.2026)

Gleichzeitige Sessions im selben Arbeitsverzeichnis haben wiederholt
Arbeit zerstört (Dateien stumm überschrieben, gestagte Inhalte über den
geteilten Index in fremde Commits gewandert, ein fremder Commit per
`--amend` umgeschrieben). Darum:

1. **Zweite und jede weitere Session arbeitet in einem eigenen
   git-Worktree** (`git worktree add …` bzw. die native
   Worktree-Isolation von Claude Code) und bringt Ergebnisse als Commits
   zurück. Wer beim Start fremden WIP in `git status` sieht, der nicht
   zum eigenen Auftrag gehört, wechselt vor Struktur-Arbeiten in einen
   Worktree.
2. Im geteilten Verzeichnis gelten zwingend: Commits nur mit explizitem
   Pathspec (`git commit -m … -- <dateien>`) · kein `git stash` bei
   fremdem WIP · kein `git commit --amend` (Hook blockiert) · nach jedem
   Commit die `--stat`-Dateizahl gegen die eigene add-Liste prüfen.
3. Deploys nie aus dem Arbeitsverzeichnis, immer aus einem sauberen
   HEAD-Worktree (Details: Skill `deploy-check`).
