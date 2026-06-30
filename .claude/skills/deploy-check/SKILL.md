---
name: deploy-check
description: Komplettes §9-Ritual vor Push/Deploy von LexMetrik — Tore mit voller Ausgabe, Bug-Check-Agents, sauberer /tmp-Worktree-Deploy, Nachkontrolle. Verwenden, wenn David Push/Deploy verlangt oder ein Release-Stand geprüft werden soll.
---

# Deploy-Check LexMetrik (§9 CLAUDE.md)

Reihenfolge strikt einhalten. Jedes Tor-Kommando NACKT laufen lassen
(keine Pipes — der PreToolUse-Hook blockiert sie ohnehin), volle Ausgabe
lesen, Exit-Code prüfen.

## 0 · Vorbedingungen

1. `git status` — fremden WIP einer Parallel-Session identifizieren.
   Eigene Commits IMMER mit explizitem Pathspec:
   `git commit -m "…" -- <dateien>`. NIE `git stash`, NIE `--amend`.
2. Review-Schrott räumen: `find src -name '__*'` muss leer sein
   (Repro-Dateien von Review-Agents brechen Suite/Lint).
3. Untracked Ballast im Root prüfen (PDFs, Bücher) — darf nie zu Vercel
   hochgeladen werden (Worktree-Muster in Schritt 3 schützt davor).

## 1 · Tore (alle grün, volle Ausgabe)

```
npx tsc -b
npm test
npm run lint        # nie tail/Pipe — hat schon 8 Fehler verschluckt
npm run build
npm run golden:vergleich   # byte-gleich; Exit-Code prüfen!
npm run check       # Sweep, Smoke, Register; check:caches VOR check:zitate
npm run test:e2e    # Playwright (a11y/axe beide Theme-Modi + Funktions-Smokes);
                    # braucht dist (nach build), startet vite preview selbst.
npm run check:perf-budget  # QS-PERF: Bundle-Topologie/-Budget + Single-React;
                    # liest das gebaute dist (nach build), Chrome-frei.
```

- **Perf-Budget ins Deploy-Tor (30.6.2026, QS-PERF/§15):** `check:perf-budget`
  sichert die vendor-react-Topologie (ein stabiler Chunk, kein react-dom-Rückfall
  in den Entry → kein Doppel-React) und die gzip-Budgets. Deterministisch/Chrome-
  frei, braucht aber das gebaute `dist` → wie e2e nur vor dem Deploy, nicht im
  schnellen `gate`. Die Lighthouse-Metrik-Schranken (CLS/LCP/TBT auf
  `/gesetze/bund/OR` unter 4× CPU) bleiben der manuelle Mess-Schritt in Schritt 4
  (Nachkontrolle), bis ein CI-Chrome verdrahtet ist — Soll-Werte in
  `FAHRPLAN-PERFORMANCE.md`.

- **E2E ins Deploy-Tor (26.6.2026):** `test:e2e` ist NICHT im schnellen `gate`
  (build+Browser, zu langsam pro Iteration), gehört aber zwingend vor jeden
  Deploy — sonst rottet die Suite (axe-Befunde + veraltete Locator blieben lange
  unentdeckt, weil nur `check` lief). Die a11y-Prüfpunkte pinnen das Theme
  (hell + Reader zusätzlich dunkel), sind also uhrzeitunabhängig deterministisch.

- Golden-Abweichungen ERST den interleaved Commits der Parallel-Session
  zuordnen, dann erst über Neu-Schreiben entscheiden (nur deklariert).
- Workflow-/Review-Agents überschreiben /tmp-Fedlex-Caches — vor
  Zitate-Prüfung Anker-Count der Caches verifizieren.

## 2 · Bug-Check §9

Unabhängige Review-Agents über das Deploy-Delta (`git log <letzter
Deploy>..HEAD`): mindestens 2 Agents (Code-Lupe + empirische
vite-node-Repros); bei grossen Deltas das bewährte Workflow-Muster
«6 Strang-Finder × 2 adversariale Lupen». Bestätigte Befunde fixen,
Regressionstests dazu, danach Tore aus Schritt 1 erneut.

## 3 · Push + Deploy — NUR auf Davids frisches, explizites Ja

Ein überholtes oder implizites Ja zählt NICHT. Push und Deploy einzeln
bestätigen lassen, wenn David nicht beides ausdrücklich verlangt hat.

```
git push                                  # danach CI-Lauf auf GitHub prüfen
git worktree add /tmp/lexmetrik-deploy HEAD
cp -R .vercel /tmp/lexmetrik-deploy/      # Projekt-Link mitnehmen
cd /tmp/lexmetrik-deploy && npm ci && npx vercel --prod
```

NIE aus dem Arbeitsverzeichnis deployen — `vercel` lädt den Tree hoch,
inklusive WIP und untracked Dateien.

## 4 · Nachkontrolle

1. Asset-Hash live = lokal (index.html der Prod-URL gegen dist/).
2. Kernrouten auf HTTP 200: `/`, `/rechner/tagerechner`,
   `/rechner/zustaendigkeit`, `/rechner/verjaehrung`,
   `/rechner/mietrecht`, `/vorlagen`, eine Vorlagen-Detailroute.
3. Worktree aufräumen: `git worktree remove /tmp/lexmetrik-deploy`.
4. STRUKTUR.md / HANDLUNGSPLAN.md spiegeln (deployter Stand, Commit-Hash).
