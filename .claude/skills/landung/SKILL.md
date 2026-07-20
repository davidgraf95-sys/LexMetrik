---
name: landung
description: Verwenden, wenn ein fertiger Feature-PR nach main gelandet werden soll — Trigger «landen», «Landung», «PR mergen», «einsammeln», «rebasen auf main», «Merge-Kette abarbeiten» — oder wenn mehrere offene PRs seriell nach main gebracht werden. Kodifiziert die serielle Landung + Merge-Treiber-Politik (§12) gegen wiederkehrende Konflikte.
---

# Serielle Landung eines PR nach main

Ziel: Konflikte paralleler PRs entschärfen, indem **EINE** PR aufs Mal
gelandet wird und generierte Dateien nie von Hand gemischt werden. Arbiter
bleibt §9/§12 CLAUDE.md und der Skill `deploy-check` (die §9-Sorgfalt gilt
weiterhin **vor** dem Merge). Dieser Skill ist die Merge-Mechanik davor.

Voraussetzung einmal pro Clone/Worktree: `npm install` lief (setzt via
`prepare` → `scripts/git-setup.sh` den `regen`-Treiber + rerere). Sonst
`bash scripts/git-setup.sh` von Hand.

Strikt der Reihe nach, EIN Kommando aufs Mal, volle Ausgabe lesen:

1. **Kollisionen sichten.** `gh pr list --state open` — prüfen, ob ein
   anderer offener PR dieselben Dateien/dasselbe Subsystem berührt
   (Doppelarbeit/Kollision). Bei Überschneidung: erst den anderen landen,
   dann diesen rebasen (Schritt 7). Nie zwei kollidierende PRs gleichzeitig.

2. **origin/main einziehen.** `git fetch origin` → dann in den Feature-Branch
   `git merge origin/main` (oder `git rebase origin/main`). Hier greifen die
   lokalen Merge-Treiber aus `.gitattributes`.

3. **Konflikte auflösen — nie von Hand mischen.**
   - **Generierte Datei** (`daten-manifest.json`, `*.generated.ts`,
     `public/rechtsprechung/*index*`): der `regen`-Treiber hat schon die
     eigene Seite behalten (kein Marker). **Generator neu laufen**, damit der
     Inhalt zum gemergten Stand passt:
       - `daten-manifest.json` → `npm run datenhaltung:manifest`
       - `*.generated.ts` → das im Datei-Banner genannte `npm run gen:*`
       - `public/rechtsprechung/*index*` → entscheide-Pipeline (`npm run entscheide …`)
   - **Append-Register** (`bibliothek/register/gegenpruefung-register.md`):
     der `union`-Treiber hat beide Seiten behalten — nur prüfen, keine Aktion.
   - **golden/*.json**: KEIN Treiber. Von Hand auflösen, dann `npm run golden`,
     den Byte-Diff bewusst als beabsichtigt bestätigen (§6-Oracle).
   - **public/normtext/**/*.json**: KEIN Treiber. Konflikt SOLL anhalten →
     Gegenprüfung (Drop/Leak), nie blind eine Seite nehmen.
   - **STRUKTUR.md / ROADMAP.md / FAHRPLAN-* / INDEX.md**: in-place, von Hand
     auflösen (beide Beiträge behalten). rerere merkt sich die Auflösung.

4. **Gate.** `npm run gate` (grün Pflicht). Das erzwingt die Regeneration aus
   Schritt 3: ein vergessener Generator-Neulauf fällt als rotes `check:*` auf.

5. **CI-Grün verifizieren.** Push (`git push`), dann `gh pr checks <nr> --watch`
   bis grün. Billing-rot bei lokal-grün = OK (§9).
   **`cancelled` und `skipped` zählen als ROT**, nicht als «nicht rot» — ein
   abgebrochener Lauf hat nichts bewiesen. (Realfall 20.7.2026: 5 stumm
   abgebrochene `turso-sync`-Läufe, der Suchindex veraltete unbemerkt.)

5b. **Bei Daten-/Extraktions-PRs: Identitätsbeleg.** Bevor neue Entitäten
   (Personen, Erlasse, Entscheide) live gehen, eine Stichprobe **n ≥ 10** gegen
   die **amtliche Quelle** prüfen und die Trefferquote im PR dokumentieren.
   Belege sind **Identitäts-Treffer mit Wortgrenze**, nie Substring-Präsenz.
   *Warum als eigener Schritt und nicht als Verweis: PR #309 hat genau hier
   versagt — 11 erfundene Amtsträger:innen gingen ~1 h auf prod, weil der
   Verweis auf den Gegenprüfungs-Skill beim Abarbeiten der Liste übersprungen
   wurde. Maschinelle Rückendeckung: `check:merge-schutz` blockiert den Merge
   auf Risiko-Pfaden ohne Verdikt.*

6. **Manuell mergen.** `gh pr merge <nr> --squash`. **KEIN `--auto`**, solange
   die Required Checks nicht neu gesetzt sind (David-Handschritt offen).
   Danach Worktree/Branch aufräumen (`git worktree remove …`, Branch löschen).

7. **Nächste PR erst danach.** Erst wenn diese PR auf main ist, die nächste
   auf das neue main rebasen (zurück zu Schritt 1). So kollidiert nie eine
   zweite Landung mit einer schwebenden.
