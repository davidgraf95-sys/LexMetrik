# Handlungsplan — Korpus-weiter Gesetzes-Review (Bund + Kantone)

**Auftrag David (22.6.2026):** Von ALLEN bestehenden Gesetzen (Bund + Kantone)
einzeln einen Review machen — **ein eigener Agent pro Gesetz** — mit **Ultra-Aufwand**,
**keine neuen Downloads**, und alles stimmig kriegen: nichts abgeschnitten, nichts
falsch benannt, generell nichts visuell Problematisches. «Dieses Mal soll es klappen.»

**Umfang:** 229 Erlasse = **114 Bund + 115 Kanton** (Quelle: register.json).

**Harte Regel:** KEIN Netz-Refetch / keine Snapshot-Regeneration mit Download.
Fixes ausschließlich (a) **Display-Layer** (`ArtikelBody.tsx`, `darstellung.ts`) und
(b) **reine, netzlose Snapshot-Post-Transforms** (deterministisch, §1: nur
Extraktions-Artefakte korrigieren, nie Inhalt erfinden/ändern). Artefakte, die NUR
per Re-Fetch lösbar wären → Backlog (dokumentiert, nicht erzwungen).

---

## Phase 0 — Laufendes abschließen (Voraussetzung)
- ZH-Fliesstext-Fixes (StPO zusammen, Beträge mit `'`) — läuft.
- «aufgehoben»-Bug Z.342 ArtikelBody (leerer Text + items → fälschlich «aufgehoben»; **232 Blöcke** betroffen) — Fix + Verifikation.
- VD-vd-105539 (frais judiciaires, neuer Extraktor) + §4-Erstzeile (Formel in col1) — soweit ohne Download möglich, sonst Backlog.
- Merge Follow-ups + Deploy.

## Phase 1 — Detektion: 1 Agent pro Gesetz (read-only, Workflow-Fan-out)
Je Erlass ein Agent (cheap model, strukturierter Output). Prüf-Checkliste je Gesetz
(an Davids Kriterien + bekannten Bug-Klassen):
1. **Abgeschnitten/Clipping** — Tabellen/Texte, die links/rechts/vertikal beschnitten wirken (Render + Daten-Indizien: überlange/verschmolzene Tokens, Tabellen-Breite).
2. **Falsch nummerierte Absätze** — Sequenz 1,2,3 wie Bund? Erster Absatz = «1»? Streu-Hochzahlen?
3. **Falsch benannt / komische Randziffern** — geleakte Fussnoten-Defs, verstümmelte Abk. (z.B. «St PO», «B vom»), falsche Labels/Artikel-Marken/Stand.
4. **Verschmolzene Tabellen/Spalten** — merged digits («100001250»), Füllpunkt-/·–-Tabellen unbehandelt, mehrspaltig nötig.
5. **Verklebte/zerrissene Wörter** — Buchstabe+Ziffer geklebt, Wort durch Leerzeichen/Trennung zerrissen.
6. **«aufgehoben»-Fehlanzeige** — leerer Text + items.
7. **Beträge ohne Tausendertrenner** im Fliesstext; Bereichs-Strich-Artefakte.
8. **Items/Hierarchie** — lit./Ziff. korrekt, Verschachtelung plausibel.
**Output je Agent:** strukturierte Issue-Liste {klasse, schwere, beispiel-id, beispiel-text}. KEINE Fixes in Phase 1.

## Phase 2 — Aggregation
Issues korpus-weit nach **Klasse** gruppieren; **systemisch** (viele Gesetze, ein Render-Fix) vs. **Einzelfall** trennen; nach Häufigkeit/Sichtbarkeit priorisieren.

## Phase 3 — Fixes (display-first, netzlos)
- **Systemische Render-Fixes** zuerst (decken N Gesetze auf einmal): aufgehoben-Bug, Beträge-im-Text, Split-Abk., Spalten/Clipping, Label-Glättung.
- **Einzelfall-Snapshot-Post-Transforms** (netzlos, §1, getestet) wo nötig + sicher.
- Jeder Fix: TDD + golden byte-identisch (Display) bzw. deklarierter Snapshot-Schritt; iterativer Logik+Bug-Check.

## Phase 4 — Re-Verifikation: erneut 1 Agent pro Gesetz
Zweiter Fan-out (read-only) bestätigt je Gesetz: Issue-Klassen aus Phase 1 behoben, keine Regression. Plus voller Gate (tsc/vitest/golden/lint/check) + UI-Stichproben (Desktop+mobil).

## Phase 5 — Deploy
Erst nach Davids ausdrücklichem Ja (§9), aus sauberem Worktree; Prod-Nachkontrolle.

---

## Mechanik (Workflow)
- Phase 1 + 4 als **Workflow** (`pipeline`/`parallel`, Concurrency-Cap ~16, 229 Items < 4096-Limit), je Item ein Agent mit Snapshot-Pfad + Checkliste + strukturiertem Schema.
- Aggregation + Fixes treibt der Controller (ich), zwischen den Fan-outs.
- §12: Fixes mit explizitem Pathspec; kein `git add -A`; kein voller `npm run normtext`.

*Stand 22.6.2026 — erstellt vor Ausführung; Phase 0 läuft.*
