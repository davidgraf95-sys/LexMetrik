# FAHRPLAN — Plan-Steuerung «ein Etikett pro Schritt» (Detailquelle)

> **Stand 1.7.2026.** Detailquelle zum Querschnitt **`QS-PH`** (Plan-Hygiene-Wächter) in
> `ROADMAP.md`. Verlinkt aus dem `QS-PH`-Eintrag des Querschnitt-Bands (Pflicht §14.1; das Tor
> `check:plan` setzt die Verlinkung selbst durch — s. u.). *Das Wie steht hier; gesteuert wird über
> `ROADMAP.md`.*
>
> **Doppelt verifiziert:** dieser Spec wurde gegen das reale Repo geprüft (Struktur von `ROADMAP.md`,
> `package.json`-Scripts, `scripts/gate.sh`, `CLAUDE.md` §-Regeln) **und** durch einen unabhängigen
> adversarialen Opus-Agenten auf Lücken durchgesehen (16 Befunde, alle hier eingearbeitet).

---

## Anlass (gemessen in dieser Session, 30.6.2026)

Der Bauplan kodiert den Schritt-Zustand in **Prosa**, die gelesen und interpretiert werden muss. Reale
Defekte:

1. **Widerspruch (§5-Verletzung).** Die `- [ ]`-Checkboxen und der Prosa-Block «Fortschritt 28.6.»
   widersprechen sich: Schritt 1 ist `[ ]`, im Fortschritt «✅ LIVE»; Schritt 4 ist `[ ]`, real aber an
   Recherche `wbqdyap3x` gebunden.
2. **Autonomie-Versprechen gebrochen.** Das Ausführungs-Protokoll verspricht autonomes Abarbeiten — ein
   Lauf würde Schritt 1 nachbauen oder in den blockierten Schritt 4 rennen (beides kostet eine Session).

**Ziel:** den Schritt-Zustand **maschinell auflösbar und widerspruchsfrei** machen, ohne die
menschenlesbare Prosa zu verändern. Eine Wahrheit, eine Datei (§5 + §14).

---

## Leitentscheid: eingebettet als HTML-Kommentar, nicht separate Datei

Der maschinenlesbare Zustand lebt als **HTML-Kommentar `<!-- @meta … -->`-Zeile** unmittelbar **bei**
jeder etikettierbaren Einheit in `ROADMAP.md` — nicht in einer zweiten Datei.

- **Warum eingebettet:** §5/§14-treu — `ROADMAP.md` bleibt der **eine** Einstieg und die **eine**
  Wahrheit; kein zweiter autoritativer Artefakt, kein Sync-Zwang. Die ROADMAP ist zu ~90 % nuancierte
  Prosa, die sich nicht in JSON pressen lässt; eine separate `plan.json` als SSoT hätte Prosa *und* JSON
  → genau die Drift, die das Problem ist.
- **Warum HTML-Kommentar statt sichtbarer Code-Span:** verschwindet im Markdown-Render und stört das
  Lesen der Prosa nicht (Daueranweisung Lesbarkeit) — der Mensch liest Prosa + Checkbox, die Maschine
  liest `@meta`. Das trennt sauber **Maschinen-Zustand** von **narrativer Prosa** (s. «Eine Wahrheit»
  unten). Eindeutiger Anker (kein Verwechseln mit Referenz-Bullets).
- Die einzige Schwäche (von Hand fehleranfällig) wird durch das Tor `check:plan` neutralisiert: ein
  unsinniges/fehlendes `@meta` scheitert **laut rot**, nie still. Der `plan:set`-Helfer schreibt das
  `@meta` ohnehin maschinell.

---

## Geltungsbereich — welche Einheiten ein `@meta` tragen (Befund #1, #10, #15)

Nicht jeder Bullet ist ein Schritt. Erfasst werden **ausschliesslich** Einheiten in diesen Sektionen:

**ETIKETTIERT (Inventar):**
- `## ⚡ S0 …` (Überschrift, checkbox-los)
- Sektion **«Die geordnete Abarbeitung»**: jeder Schritt-Bullet `- [ /x/~] **<N> · <Titel>**`
  (Schritte 1–14 über Welle 1–3) **und** jedes eigenständig schedulebare **Unter-Bündel** mit eigener
  Checkbox (`- [ ] **+ Auftrags-Eingang …: Bündel B/S**`, Responsive-Audit, a11y-Restpunkte).
- Sektion **«Querschnitt-Band»**: jeder Top-Level-Strang-Bullet `- **<Titel>** *(<ID>, …)*`
  (checkbox-los; ID aus dem Klammerteil: `QS-GP`, `QS-PH`, `QS-PERF`, sowie `LERNPHASE-AB` für
  «Status-Marker…» und `SEO-A11Y` für «SEO/A11y»).

**NICHT etikettiert (Referenz, explizit ausgeschlossen):** «So sieht das Taschenmesser aus»,
«Leitprinzipien», «Geparkt», «Pflege & Termine», «Funktions-Katalog», «Strang-Detailpunkte & Hygiene»,
«Studierende-Layer», «Batch-Deploy-Fenster», der `> ■ Auftrags-Eingang`-Blockquote (= narrative
Historie, s. u.).

**Erwartungs-Regel von `check:plan`:** Genau die Einheiten im Inventar **müssen** ein `@meta` tragen;
ausserhalb des Inventars wird kein `@meta` erwartet. Die kanonische Inventar-Liste (nur die IDs, kein
Status) liegt **einmal** in `scripts/plan/inventar.ts` (§5); `check:plan` prüft beidseitig: jede
Inventar-ID existiert als Einheit in `ROADMAP.md` **und** trägt ein `@meta`; kein verwaistes `@meta`.
Toleranz: harmlose Prosa-Edits ausserhalb des Inventars machen das Tor **nie** rot (Befund #15).

---

## Das Etikett `@meta` — 9 Felder

Eine Kommentar-Zeile direkt **unter** der ersten Zeile der Einheit (Schritt-Bullet bzw. Überschrift),
Felder durch ` · ` getrennt:

```
- [ ] **6 · Konsultieren-Klingen** *(`[OF]`, amtlich)*:
  <!-- @meta id: W2·6 · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/lib/norm-index.ts] · worktree: ja · 26x: nein -->
  - Mehrsprachiger Normvergleich DE/FR/IT …   ← gewohnte Prosa + Unter-Bullets, unverändert
```

Checkbox-lose Einheiten tragen es analog direkt unter Überschrift/Bullet (S0, Querschnitt).

| Feld | Bedeutung | Werte |
|---|---|---|
| `id` | Stabile Schritt-ID (explizit) | `S0` · `W1·1` · `W2·6` · `W3·14` · `QS-PERF` · Bündel `W2·6-B1` |
| `status` | Die Ampel | `ready` · `wip` · `blocked` · `done` · `parked` (Grammatik s. u.) |
| `of` | Ohne Davids Fachzeit baubar (Zeitsperre)? | `ja` / `nein` |
| `blocker` | Token, falls `blocked`/`parked` | Token aus dem Blocker-Register oder `null` |
| `dep` | Einheiten, die erst `done` sein müssen | Liste von IDs, z. B. `[W1·4]` oder `[]` |
| `kollision` | repo-relative Dateien/Globs, die sie anfasst | Liste, z. B. `[src/lib/norm-index.ts]` |
| `worktree` | Braucht eigenen Worktree (§12)? | `ja` / `nein` |
| `26x` | Eines der 5 grossen Datenassets? | `ja` / `nein` |
| `fahrplan` | Detail-Datei (optional) | Dateiname oder leer |

**Status-Grammatik (Befund #11):** `status := <wert> ('(' <agent/worktree> ')')?`. Der Schema-Check
prüft nur den `<wert>` vor der Klammer gegen die erlaubte Menge; die optionale Klammer-Annotation hält
bei `wip` den Bauenden fest: `status: wip(reader-wt)` → Selbst-Koordination paralleler Agenten (heute
manuell: «an Bündel R sitzt ein anderer Agent»).

**IDs** folgen §14.5 (`W2·6` = «Welle 2 · Schritt 6»). `S0` und `W3·14` sind feste IDs. Bündel erben den
Eltern-Präfix (`W2·6-B1`). Vorbestehende CLAUDE.md-Drift «S0 + Wellen 1–13» (Schritt 14 existiert)
wird **nicht** in diesem Schritt gefixt (fremde Datei), nur notiert.

---

## Eine Wahrheit: `@meta` zählt, Prosa ist Historie (Befund #4)

`check:plan` und der Resolver lesen **ausschliesslich** das `@meta` (und, wo vorhanden, die Checkbox als
gekoppelte Zweitanzeige). **Nicht** als Wahrheit gelesen werden: die Status-Sätze in der Schritt-Prosa
(«✅ FERTIG + LIVE», «erledigt 28.6.»), der `> ■ Auftrags-Eingang 30.6.`-Blockquote und der frühere
Fortschritts-Block. Diese sind **narrative Historie**. Die Erst-Befüllung löst den **Fortschritts-Block**
in `@meta`+Checkboxen auf und entfernt ihn; Blockquote und Schritt-Prosa bleiben als Geschichte stehen,
sind aber per dieser Regel ausdrücklich nicht-autoritativ.

### Checkbox ↔ Status (Befund #2, #5)

Wo eine Einheit eine Checkbox hat, gilt die Kopplung — und **nur dort**:

| Checkbox | erlaubter `status` |
|---|---|
| `[x]` | `done` |
| `[~]` | `wip` |
| `[ ]` | `ready` · `blocked` · `parked` |

Checkbox-lose Einheiten (S0-Überschrift, Querschnitt-Stränge) haben **keine** Kopplungs-Prüfung; ihr
`status` ist die alleinige Wahrheit (kein Häkchen-Konflikt möglich). `[~]` wird als gültiger
Checkbox-Zustand anerkannt (real bei Schritt 5).

---

## Blocker-Register (Befund #9 — keine Zeilennummern, keine Prosa)

Blocker-Tokens werden gegen ein **explizites Register** validiert, nie gegen Fliesstext/Zeilennummern.
Das Register ist ein benannter HTML-Kommentar-Block in `ROADMAP.md` (bei den «Verifikations-Blockaden»):

```
<!-- @blockers
wbqdyap3x: Prozesskosten I2 — Schlichtungs-/Reduktionsfaktoren (Recherche offen)
§4-lizenz: Live-Rechtsprechung — CC-BY-SA vs. Art. 5 URG, CORS/Rate-Limits unbestätigt
-->
```

`check:plan`: jede `blocker`-Token eines `blocked`/`parked`-Schritts muss im Register stehen; jede
`dep`-ID muss als Inventar-ID existieren. Keine Logik hängt an Zeilennummern (die die Erst-Befüllung
ohnehin verschiebt).

---

## Der `next`-Resolver — Regeln + vollständige Ausgabe (Befund #6, #7, #12, #13, #16)

**`ready-now` (grün, jetzt baubar)** wenn **alle**: `status==ready` · `of==ja` · `blocker==null` · alle
`dep` sind `done` · falls `26x==ja`: kein **anderer** `26x==ja` auf `wip`.

**`26x`/`parked`-Semantik (Befund #12):** `parked` und `blocked` belegen den 26×-Slot **nicht** (nur
`wip` tut es). Das Parken eines 26×-Schritts gibt also den Slot frei (ROADMAP-Leitprinzip 4 →
Voraussetzung für Schritt 11/12). `blocked` ≠ `parked`: blocked = technisch gehindert (Blocker
auflösbar), parked = bewusst zurückgestellt (Steuer-Entscheid).

**`npm run plan:next` druckt ALLE Buckets** (nichts verschwindet lautlos — der Fehlermodus, den der
Spec heilt):
1. **`ready-now`** + welche **parallel** gehen — Lanes über **paarweise disjunkte, kanonisierte,
   real existierende** `kollision`-Pfade; bei mehreren maximalen Mengen **greedy in lexikografischer
   ID-Reihenfolge** (deterministisch, §2).
2. **wartet auf dep** (mit der offenen dep-ID)
3. **wartet auf Davids Fachzeit** (`of==nein`)
4. **blockiert** (mit Blocker-Token + Klartext aus dem Register)
5. **geparkt**
6. **26×-Slot belegt von …** (falls zutreffend)

Determinismus (§2): gleiche ROADMAP → gleiche Ausgabe. Tagesbezug nie in der Auswahllogik.

---

## Bausteine (alle unter `scripts/plan/`, Runner `vite-node`)

| Baustein | Datei / Script | Aufgabe |
|---|---|---|
| **Grammatik** | `scripts/plan/etikett.ts` | `@meta`-Parse/Serialize + Feld-Schema + Inventar-Bezug. Einmal (§5). |
| **Inventar** | `scripts/plan/inventar.ts` | Kanonische ID-Liste der etikettierbaren Einheiten. |
| **Leser** | `scripts/plan/parse.ts` | `ROADMAP.md` → Einheiten-Objekte (Sektion-bewusst, s. Geltungsbereich). |
| **Resolver** | `scripts/plan/next.ts` → `npm run plan:next` | Regeln + alle Buckets + Lanes. |
| **Setzer** | `scripts/plan/set.ts` → `npm run plan:set -- <id> <feld>=<wert>` | Mutiert Feld **und** toggelt die gekoppelte Checkbox (Befund #3). |
| **Wächter** | `scripts/plan/check.ts` → `npm run check:plan` | Schema + Logik + FAHRPLAN-Link (s. u.). |

**`plan:set` toggelt die Checkbox mit (Befund #3):** ändert es `status`, setzt es die Checkbox der
Einheit konsistent (`done→[x]` · `wip→[~]` · sonst `[ ]`); checkbox-lose Einheiten unverändert. So kann
der unmittelbar danach laufende `check:plan` nie an der eigenen Setzer-Aktion rotschlagen.

### `check:plan` — die Prüfungen (das ist die `QS-PH`-Schärfe)

- **Schema:** jede Inventar-Einheit hat genau ein `@meta`; alle Felder vorhanden; Werte gültig
  (Status-Wert vor optionaler Klammer); kein verwaistes `@meta`.
- **Checkbox-Kopplung:** nur für Einheiten **mit** Checkbox, gemäss Tabelle oben.
- **Blocker/dep:** Tokens im `@blockers`-Register; dep-IDs im Inventar; **dep-Graph azyklisch**
  (Zyklus → rot, Befund #13).
- **26×:** nicht zwei `26x==ja` gleichzeitig auf `wip`.
- **`kollision`:** jeder Pfad/Glob ist repo-relativ **und** expandiert auf ≥1 real existierende Datei
  (sonst läuft die Lane-Disjunktheit leer → §12-Falle; Lehre aus ROADMAP-`QS-GP`).
- **FAHRPLAN-Link-Check (eingegliedertes Ur-`QS-PH`, Befund #8):** jede `FAHRPLAN-*.md` im Repo-Wurzel
  ist aus `ROADMAP.md` verlinkt (inkl. **dieser** Datei aus dem `QS-PH`-Eintrag), sonst rot. Damit ist
  `check:plan` ⊇ dem ursprünglich für `QS-PH` geplanten Verlinkungs-Wächter — kein zweites Tool, nichts
  fällt unter den Tisch.
- **Nur Prüflogik** → golden byte-gleich (§6).

**Einhängung (verifiziert):** `check:plan` wird der **`check`-`&&`-Kette in `package.json`** hinzugefügt;
`gate.sh` ruft im `voll`-Modus `npm run check`, damit läuft es in `npm run gate` mit. **Lokal**, CI
unverändert. Muster = reale `check:*`-Skripte (`check:perf-budget`, `check:design-tokens`);
`check:gegenpruefung` ist **noch nicht gebaut**, dient nicht als Vorlage. Neue `.ts` müssen `npm run
lint` (eslint, in `gate voll`) bestehen.

---

## Einmalige Erst-Befüllung (die eigentliche Heilung)

Konkretes Inventar (Befund #10 — abschliessend, prüfbar gegen `inventar.ts`):
**S0 · Schritte W1·1, W1·2, W1·3, W1·4 · W2·5, W2·5b, W2·6, W2·7, W2·8, W2·9 · W3·10…W3·14 ·
Querschnitt LERNPHASE-AB, QS-GP, QS-PH, SEO-A11Y, QS-PERF · nested Bündel W2·6-B (B1/B2/B3),
W3·14-Responsive-Audit, W3·14-S (S1/S2), W3·14-a11y.** (Nomenklatur: es sind **Schritte 1–14 über
Welle 1–3**, nicht «Wellen 1–14».)

Schritte:
1. Jede Inventar-Einheit mit `@meta` versehen — Werte aus Prosa + Fortschritts-Block + Memory abgeleitet.
2. Veraltete Checkboxen korrigieren: **W1·1 → done** (`[x]`, LIVE; PDF-Block bewusst aus) ·
   **W1·4 → status nach Steuer-Entscheid** (s. Punkt 6) · **W2·5 bleibt `[~]`→wip**.
3. **`@blockers`-Register** anlegen (`wbqdyap3x`, `§4-lizenz`).
4. **Fortschritts-Block** (die zweite Wahrheit) in `@meta`+Checkboxen auflösen und **entfernen**;
   Blockquote + Schritt-Prosa bleiben als Historie (per «Eine Wahrheit»-Regel nicht-autoritativ).
5. Header-Datum aktualisieren; `QS-PH`-Eintrag im Querschnitt-Band um Link auf **diese** Datei +
   `check:plan`-Beschreibung ergänzen (sonst schlägt der eigene FAHRPLAN-Link-Check an).
6. **Schritt 4 = Steuer-Entscheid, nicht raten (§7/§1):** `blocked` (Blocker auflösbar, 26×-Slot bleibt)
   vs. `parked` (bewusst zurückgestellt, **gibt 26×-Slot frei** für Schritt 11/12). Die ROADMAP
   dokumentiert den **Park-Entscheid** als Absicht — beim Befüllen mit dieser dokumentierten Absicht
   abgleichen; im Zweifel David bestätigen lassen, nicht eigenmächtig den Slot-Status setzen.

Nach der Erst-Befüllung gilt: **Plan == Realität**, und der Wächter hält es so.

---

## Risiko, Tore, Hygiene

- **Berührt keinen Produkt-Code** — nur `ROADMAP.md`, `scripts/plan/**`, `package.json`. Keine
  Rechtslogik, kein `public/normtext`, kein Rechner/Schema. ⇒ **golden byte-gleich trivial** (§6),
  **kein Deploy** (§9), **`[OF]`** (keine Fachzeit), **kein 26×-Slot**.
- **Determinismus (§2):** rein, keine Heuristik, kein `Date.now()` in der Logik (Tagesbezug nur Anzeige).
- **Tests** nach Projektmuster: Leser gegen Beispiel-Einheiten (Schritt-Bullet, Querschnitt-Bullet,
  S0-Überschrift, `[~]`-Fall) · Resolver gegen Regel-Tabelle (jede Regel + jeder Bucket je ein Fall,
  inkl. Zyklus + 26×-Slot-Belegung) · Wächter **negativ→rot→grün** (wie `check:perf-budget`), inkl.
  Setzer↔Wächter-Konsistenz (Befund #3) und FAHRPLAN-Link-Check.
- **Parallel-Isolation (§12):** Die Erst-Befüllung schreibt `ROADMAP.md` stark um. Da gerade ein zweiter
  Agent läuft, geschieht sie in einem **eigenen Worktree**, Rückgabe als **ein** Commit (Pathspec-
  explizit). `scripts/plan/**` + `package.json` sind additiv und kollidieren nicht.
- **Trailer (§14.5):** `Roadmap: QS-PH` · `Gegenpruefung: n/a — reine Prüflogik`.

---

## Definition of Done

- `scripts/plan/{etikett,inventar,parse,next,set,check}.ts` vorhanden; `plan:next`/`plan:set`/
  `check:plan` in `package.json`; `check:plan` in der `check`-Kette.
- `plan:set` toggelt die gekoppelte Checkbox mit (verifiziert per Test).
- Tests grün: Leser (alle Einheitstypen + `[~]`), Resolver (alle Regeln + alle Buckets + Zyklus),
  Wächter (Schema, Checkbox-Kopplung nur-bei-Checkbox, Blocker/dep/Azyklie, 26×, kollision-Existenz,
  FAHRPLAN-Link), Setzer↔Wächter-Konsistenz.
- `ROADMAP.md`: alle **Inventar**-Einheiten etikettiert; Checkboxen == Status; `@blockers`-Register
  vorhanden; Fortschritts-Block aufgelöst; `QS-PH`-Eintrag verlinkt diese Datei.
- `npm run plan:next` liefert auf dem realen Plan plausible Buckets (W1·1 done, W1·4 nach Steuer-
  Entscheid, mind. die bekannten freien [OF]-Reste als ready-now; Querschnitt sichtbar).
- `npm run gate` grün; golden byte-gleich. Session-Karte in `STRUKTUR.md` nachgezogen.

---

## Bewusst NICHT im Scope (YAGNI)

- Keine separate `plan.json`/DB (s. Leitentscheid).
- Kein Web-UI/Dashboard — `plan:next` druckt Text.
- Keine automatische ROADMAP-Generierung aus den Etiketten (Prosa bleibt handgeschrieben).
- Keine CI-Verdrahtung (`check:plan` bleibt **lokal**, wie die Geschwister-Tore).
- Kein Fix der CLAUDE.md-«Wellen 1–13»-Drift (fremde Datei) — nur notiert.
