# Design: Gegenprüfungs-Gate (QS-GP, Bausteine a+b+c)

Stand: 2026-07-01 · Strang: Querschnitt-Band **QS-GP** (ROADMAP.md) · Grundlage: G2/G4
(FAHRPLAN-GRUNDLAGEN.md) · Detailquelle künftig: dieser Spec + ROADMAP-QS-GP-Block.

## Zweck (in einfachen Worten)

Die Regel „alles doppelt verifizieren" (unabhängige adversariale Gegenprüfung) hängt heute nur
an **Session-Disziplin** — man kann sie vergessen, und genau das ist an den teuersten Bugs schon
passiert (Tabellen-Drop, Footnote-Leak, `bis`/`ter`-Verlust). Dieses Design macht daraus eine
**mechanische Sperre**: Wer eine heikle Datei (Rechnen/Extraktion/Norm-Tarif) anfasst, kommt
durch das lokale Gate nur mit einem **gültigen, an genau diesen Diff gebundenen** Prüf-Nachweis.

**Umfang dieser Runde:** Bausteine **a** (Tor), **b** (Skill), **c** (Register). Baustein **d**
(rückwirkende Korpus-Kampagne) ist bewusst ausgeklammert (grosser Datenlauf, teils 26×-Slot).

## Leitplanken

- `[OF]` — keine Fachzeit Davids nötig; zeitsperre-konform (macht Dez-Abnahme billiger).
- **Golden byte-gleich (§6):** reine Prüflogik, kein Engine-Output berührt.
- **CI unverändert:** Tor läuft nur lokal über `npm run gate`; Skript hat CI-Selbstschutz.
- **Kein Git-Hook:** `git config core.hooksPath` zeigt auf einen Fremd-Pfad
  (`/Users/david/Desktop/LegalCalc/.git/hooks`) → klassische Hooks sind hier tot. Enforcement-Punkt
  ist ausschliesslich `npm run gate`.
- **Nachweis-Bindung = streng:** diff-gebundener sha256, kein Recyceln alter Token.

---

## Baustein a — Tor `check:gegenpruefung`

Skript `scripts/check-gegenpruefung.ts`, eingehängt in die `npm run check`-Composite
(die nur `npm run gate` lokal fährt — CI ruft Checks namentlich auf und lässt diesen aus).

**Ablauf:**
1. Geänderte Dateien im Working-Tree ermitteln (`git status --porcelain` vs. HEAD; inkl.
   neu/gelöscht/umbenannt).
2. Gegen die **Risiko-Globs** (siehe unten) filtern → Risiko-Menge.
3. **Auto-Ausnahme** (löst die Über-Triggerung): reine Prüflogik wird aus der Risiko-Menge
   entfernt — `**/*.test.ts`, `**/*.spec.ts`, `scripts/**/*check*`, `scripts/gate.sh`,
   `scripts/check-gegenpruefung.ts`, `scripts/gegenpruefung-ok.ts`.
4. Risiko-Menge leer → **grün** (nichts zu beweisen).
5. Sonst: **sha256** über die kanonisch sortierten, aktuell geänderten Risiko-Inhalte berechnen
   (Pfad + Inhalt je Datei; gelöschte Datei = Marker) und mit `bibliothek/.gegenpruefung-pending`
   vergleichen:
   - Pending fehlt / Hash weicht ab / `verdikt` ≠ `bestanden` → **rot** mit klarer Meldung
     (welche Dateien, Verweis auf den Gegenprüfungs-Skill).
   - Hash passt + Verdikt `bestanden` → **grün**.
6. **CI-Selbstschutz:** Env `CI` gesetzt **oder** kein HEAD/kein Git → **grün** (no-op).
7. **WARN (nicht rot):** Register-Einträge, deren `Quelle-Pin` laut `check:fedlex-versionen`
   überholt ist, als „neu fällig" melden (Burn-down-Signal; blockiert nicht).

**Selbstauflösung:** Nach dem Commit sind die Dateien in HEAD → Working-Tree-Diff für sie leer →
Tor grün, Pending automatisch bedeutungslos. Erneute Bearbeitung derselben Datei ⇒ neuer Hash ⇒
altes Pending passt nicht mehr ⇒ wieder rot. Kein manuelles Aufräumen.

**Risiko-Globs** (erste Bau-Aktion: **gegen den realen Baum verifizieren** — Verzeichnis vs.
`*.ts`, sonst läuft das Tor leer):
- **Extraktion:** `scripts/normtext/**` · `src/lib/normtext/**` · `public/normtext/*.json`
- **Rechnen:** `src/lib/*(tarif|kosten|gebuehr|zustaendigkeit|frist|verjaehr|streitwert|`
  `beurkund|gruendung|schkg|straf|bger)*.ts` · `src/lib/tarif/**` · `src/lib/fristenspiegel/**`
- **Norm/Tarif:** `src/data/tarif/**` · `src/lib/vorlagen/**`

---

## Baustein b — Adversariales Protokoll als Skill

Persönlicher Skill `~/.claude/skills/gegenpruefung/SKILL.md` (wie `scraping-swiss-official-sources`).

- **Rolle:** unabhängiger Agent, **frischer Kontext**, Modell **Opus** (Daueranweisung David).
- **Auftrag:** den Output **widerlegen**, nicht bestätigen; vor sich Output **und** amtliche Quelle.
- **Modus Extraktion/Darstellung:** Output zeichenweise gegen die amtliche Fedlex-/Quellfassung —
  Drop, Leak, zerrissene Abkürzungen, `bis`/`ter`-Verlust suchen.
- **Modus Rechnen:** **unabhängig aus der Norm nachrechnen** (nicht den Code lesen), Artikel für
  Artikel, mit dem Ausgabewert vergleichen.
- **Ergebnis:** Verdikt `bestanden`/`widerlegt` + Belege (Norm/Artikel + Link + Stand).
- **Bei `bestanden`:** ruft `npm run gegenpruefung:ok` (Baustein c) → schreibt Pending + Register.

Die rote Tor-Meldung verweist auf diesen Skill, damit rot→grün immer denselben Weg hat.

---

## Baustein c — Register mit „Stand" + Quittier-Helfer

**Quittier-Helfer** `npm run gegenpruefung:ok` (`scripts/gegenpruefung-ok.ts`) — kein Hand-Hashing:
- berechnet den aktuellen Risiko-Diff-Hash (dieselbe Kern-Logik wie das Tor — gemeinsame Funktion),
- übernimmt Verdikt + `Quelle-Pin` (z. B. `fedlex ZGB 20260701`) + Datum,
- schreibt `bibliothek/.gegenpruefung-pending` (gitignored),
- hängt einen Eintrag an das Register an.

**Register** `bibliothek/register/gegenpruefung-register.md` (dauerhaft, committet). Spalten:
`Datum | Snapshot/Engine | Diff-Hash | Verdikt | Quelle-Pin | Beleg/Notiz`.

**Kopplung an `check:fedlex-versionen`:** Tor liest `Quelle-Pin`, markiert überholte Pins als
„neu fällig" (WARN) → Register wird zum Burn-down.

**Durabler Nachweis:** Commit-Trailer `Gegenpruefung: bestanden · Register <datum>/<engine>`
bzw. `Gegenpruefung: n/a — reine Prüflogik`. Der Trailer ist der permanente Historien-Vermerk;
das Pending-File nur der Vor-Commit-Türsteher.

---

## Tests (das Tor muss dicht sein)

`scripts/__tests__/check-gegenpruefung.test.ts` (oder vorhandene Test-Konvention):
1. Diff berührt Risiko-Pfad, kein Pending → **rot**.
2. Pending mit passendem Hash + `bestanden` → **grün**.
3. Datei nach Quittung geändert (Hash-Mismatch) → **rot**.
4. Nur `*.test.ts`/Prüfskript geändert → **grün** (Auto-Ausnahme).
5. Nichts Riskantes geändert → **grün**.
6. `CI`-Env → **grün** (no-op).

Die gemeinsame Diff-Hash-Kernfunktion wird von Tor und Helfer geteilt (eine Quelle der Wahrheit).

---

## Deliverables & Verdrahtung

- `scripts/check-gegenpruefung.ts` (Tor) + `scripts/gegenpruefung-ok.ts` (Helfer) + geteilte
  Kernfunktion (z. B. `scripts/gegenpruefung/kern.ts`).
- Skill `~/.claude/skills/gegenpruefung/SKILL.md`.
- `bibliothek/register/gegenpruefung-register.md` (leeres Register mit Kopf).
- Tests.
- `package.json`: `"check:gegenpruefung"` + `"gegenpruefung:ok"`; `check`-Composite ergänzt.
- `.gitignore`: `bibliothek/.gegenpruefung-pending`.
- `ROADMAP.md` QS-GP-Block: auf diesen Spec/Register verweisen (Plan-Hygiene, `check:plan`).

## Grenzen (YAGNI)

- **Kein** Baustein d (rückwirkende Kampagne) — spätere Runde, 26×-Slot-Frage.
- **Kein** Git-Hook, **kein** CI-Eingriff, **kein** Aufweichen bestehender Tore.
- Kein Deploy nötig — reines Repo-Fundament.

## Abnahme

`npm run gate` grün; die sechs Tor-Tests grün; golden byte-gleich; `check:plan` grün nach
ROADMAP-Verdrahtung. Verhaltensändernd an Engines: **nein** → keine Davids-Fachzeit.

## Verifikations-Befunde (ultracode-Bau + adversariale Prüfung, 2026-07-01)

Gebaut per ultracode-Workflow (8 Agenten): 3-Linsen-Härtung → sequenzieller Bau → 3 Skeptiker +
Schluss-Tor. Ergebnis: **GATE GRÜN, golden 201 Fälle byte-gleich, 21 Tests grün.** Zusätzlich
unabhängig gegengeprüft (Live-E2E: ROT ohne Nachweis → quittieren → GRÜN → Byte-Änderung → ROT).

Die Härtung fing 4 **Blocker** vor dem Bau (alle im Kern behoben, s. `scripts/gegenpruefung/kern.ts`):
1. `git status` ohne `-uall` kollabiert neue Verzeichnisse zu `?? public/` → ein neu generierter
   Extraktions-Teilbaum entkäme dem Tor. **Fix:** `--porcelain=v1 -z -uall --no-renames`.
2. Glob `public/normtext/*.json` trifft nur 4 Top-Level-Index-Dateien, nicht die verschachtelten
   Volltexte (OR.json etc.). **Fix:** `public/normtext/**` (Präfix-Prädikat `startsWith`).
3. Die Rechnen-„Alternation" `src/lib/*(a|b|…)*.ts` ist **keine** gültige Glob-Syntax (matcht 75/75
   top-level `.ts`). **Fix:** hand-gerolltes Prädikat `^src/lib/[^/]+\.ts$` + Basename-Regex auf die
   Stichwörter (nur die ~28 gewollten Engine-Dateien).
4. Extraktions-Snapshots liegen verschachtelt (2589 JSON) → einstufiges `*.json` unter-matcht.
   Mit Fix 2 erledigt.

**Bewusste Design-Grenze (kein Fix — dokumentiert):** Der Kern bindet an die **Working-Tree-Bytes
von Platte**, nicht an den Git-Index. Ein Angreifer könnte `git add` (böse v2) → Platte auf (gut v1)
zurücksetzen → blank `git commit` und so einen nie geprüften Index-Inhalt mit grünem Tor committen.
**Nicht geschlossen, weil:** (a) das Bedrohungsmodell ist Vergessens-Disziplin, kein Angreifer
(kein Git-Hook, keine CI-Durchsetzung — ein Angreifer überspringt `npm run gate` ohnehin); (b) ein
„Index==Working-Tree"-Wächter würde die **nach CLAUDE.md §12.2 vorgeschriebenen Teil-Commits per
Pathspec** (`git commit -- <dateien>`, Index ≠ WT legitim) ständig fälschlich rot machen. Der übliche
Weg `git add -A && git commit` schliesst die Lücke ohnehin. **Auflage:** quittieren unmittelbar vor
dem Commit; das Tor bindet an den Working-Tree.

**Zwei Nice-Beobachtungen (kein Bypass, akzeptiert):** (1) Die Auto-Ausnahme `scripts/**` +
Basename-„check" nimmt bewusst die Extraktions-**Check-Skripte** (`scripts/normtext/check-*.ts`) aus —
korrekt, da diese reine Prüflogik sind; ein hypothetisches Extraktions-Skript mit „check" im Namen
wäre eine Namens-Kollision (per Namenswahl vermeidbar). (2) `check-gegenpruefung.ts` führt seine CLI
bei jedem Nicht-vitest-Import aus (nur `VITEST`-Guard) — fragil, aber benigne (kein `src/` importiert
`scripts/`; Aufruf nur als CLI). Beide nicht änderungswürdig.

## Offen nach dem Bau

- **Nicht committet** (§9 — Davids Ja abwarten); Branch `feat/gegenpruefung-gate`.
- **STRUKTUR.md**-Session-Karte + **CLAUDE.md §14.4**-Wortlaut („Tor derzeit im Aufbau" →
  „Tor steht") beim committenden/mergenden Schritt nachziehen.
- Baustein **d** (rückwirkende Korpus-Kampagne) — spätere Runde.
