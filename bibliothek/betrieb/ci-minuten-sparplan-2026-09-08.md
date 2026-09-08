# CI-Minuten — Messung 30 Tage + Sparplan (read-only, 8.9.2026)

**Erstellt:** 8.9.2026 — Auftrag David («Repo privat? … Prüfstrasse ohne
Qualitätsverlust senken?»), Recherche/Messung durch einen Opus-Unteragenten
(read-only, kein Code). **Status:** ERSTRECHERCHE (einfach belegt, keine
Gegenprüfung — reine Zahlen-Erhebung ohne fachliche Rechtslogik-Berührung).

**Methode.** Vollerhebung, keine Hochrechnung: alle 1998 Läufe 8.8.–8.9.2026
(`actions/runs` in 5 Datumsfenstern, weil die API bei 1000 kappt; `total_count`
=1998 = erfasste Zahl), dazu alle 15'647 Jobs (`/actions/runs/<id>/jobs`),
`started_at`→`completed_at` **je Job aufgerundet** = GitHubs Abrechnungsmodell.
`skipped` = 0 min (kein Runner), `cancelled` zählt voll.

## 1 Minuten heute

**61'381 abgerechnete Minuten / 30 Tage** = 1023 Runner-Stunden = 34 h pro
Kalendertag. Free-Kontingent 2000, Pro 3000.

| Workflow | min | % | Läufe | Jobs |
|---|---:|---:|---:|---:|
| **CI** (`.github/workflows/ci.yml`) | **59'839** | **97.5** | 1143 | 14'477 |
| Plan-Buchung (`plan-buchung.yml`) | 342 | 0.6 | 299 | 299 |
| Turso-Serving-Sync (`turso-sync.yml`) | 301 | 0.5 | 58 | 116 |
| Wächter (`waechter.yml`) | 298 | 0.5 | 266 | 523 |
| Prod-Smoke (`prod-smoke.yml`) | 189 | 0.3 | 117 | 117 |
| Normen-Monitor · Fedlex-Frische | 171 · 59 | 0.4 | 13 · 9 | 22 |
| Autopilot / Korpus-Raw / Dependabot-Eigenläufe | 182 | 0.3 | 93 | 93 |

**Alles ausser CI = 1542 min = 2,5 %.** Cron-Frequenzen sind damit
Rundungsrauschen; der Hebel liegt zu 97,5 % in `ci.yml`.

### CI je Auslöser

| Auslöser | min | % gesamt | Läufe | Ø/Lauf |
|---|---:|---:|---:|---:|
| `pull_request`, echter Push | 26'611 | 43.4 | 532 | 50.0 |
| `pull_request`, **Rebase-/`update-branch`-Nachzug** | 14'588 | 23.8 | 255 | 57.2 |
| `push` main (Nachlauf nach dem Merge) | 17'951 | 29.2 | 348 | 51.6 |
| `workflow_dispatch` | 689 | 1.1 | 9 | 76.6 |

Klassierung über `head_commit.message` (`Merge branch 'main' …` = Nachzug).
Nach Diff-Klasse: 925 `code`-Läufe à **Ø 61.1 min**, 218 `doku`/`code-fern` à
**Ø 15.1 min**.

### CI je Job (30 Tage)

| Job | min | n | Ø |
|---|---:|---:|---:|
| Shard 1/8 · 8/8 · 4/8 · 5/8 | 6728 · 6482 · 6163 · 5654 | je 1017 | 6.62 · 6.37 · 6.06 · 5.56 |
| Shard 6/8 · 3/8 · 2/8 · 7/8 | 5643 · 5628 · 5576 · 5335 | je 1017 | 5.55 · 5.53 · 5.48 · 5.25 |
| **8 Shards zusammen** | **47'209** | | **76,9 % aller Minuten** |
| Tore (Tests · Lint · Checks) | 5583 | 1109 | 5.03 |
| Bau (dist-Artefakt) | 2851 | 1109 | 2.57 |
| Merge-Schutz (Required-Kontext) | 1462 | 1109 | 1.32 |
| Diff-Klassierung · Perf-Budget · Deploy | 1114 · 862 · 758 | 1109 · 1104 · 710 | 1.00 · 0.78 · 1.07 |

Abgebrochene Läufe: 186, **3119 min** — die zahlt GitHub trotzdem;
`cancel-in-progress` ist bereits scharf (ci.yml:117-122, auf main bewusst aus).
Doppelläufe auf demselben `head_sha`+Event: **1 von 1142** — kein Retry-Problem;
die Ø 2.94 Läufe je PR-Zweig (267 Zweige) sind Rebases, keine Wiederholungen.

### Innenleben eines Shards (15 grüne PR-Läufe, 120 Shard-Jobs)

Median je Shard-Job **5.47 min** = **4.16 min Playwright** + **1.28 min Rüstzeit**
(checkout 16 s · `npm ci` 21 s · setup-node 3 s · Browser-Cache 4 s · Chromium
13 s · Union-Wächter 5 s · dist-Download 6 s), dazu **0.37 min Aufrundung**.
**Caches greifen** — Chromium 13 s statt ~90 s (ci.yml:737 `actions/cache@v4`),
`npm ci` 21 s (`cache: npm`, ci.yml:718/362/321/844/881/963), `dist` als
Artefakt aus `bau` (ci.yml:331 hoch, :731/:847 runter, kein Neubau je Shard).

### Was NICHT das Problem ist

- **Doku-PRs lösen schon heute nicht die volle Strasse aus.** ci.yml:141-299
  klassiert `doku`/`code-fern`/`code`; bei `doku` quittieren Bau (ci.yml:311) und
  alle 8 Shards (ci.yml:712-717), Perf entfällt (ci.yml:833). Fünf Plan-PRs =
  5 × ~15 min, nicht 5 × 61 min — der Rest ist reine Runner-Anlaufzeit.
- **Cron-Jobs** (prod-smoke.yml:12 alle 6 h = 189 min · turso-sync.yml:54
  täglich = 51 min · normen-monitor.yml:40 + fedlex-frische.yml:24 wöchentlich
  = 117 min) sind zusammen 0,6 %. **Nicht anfassen** — Nutzen > Betrag.
- **`paths`-Filter fehlen bewusst** (ci.yml:102, K3/K12 im Kopf ci.yml:27-56):
  sie liessen Required-Kontexte ewig «expected» hängen; die Diff-Klassierung
  ist der Ersatz.

## 2 Sparplan (Reihenfolge = Ersparnis × Einfachheit)

| # | Massnahme | min/Monat | Aufwand | Prüftiefe |
|---|---|---:|---|---|
| M1 | main-Push-Lauf auf Bau/Perf/Deploy kürzen | 15'050 | Bauschritt | unverändert |
| M2 | Dependabot `rebase-strategy: disabled` + monatlich | 3'800 | sofort, Konfig | unverändert |
| M3 | e2e-Shards 8 → 4 | 3'800 | Bauschritt + Branch-Regel | unverändert |
| M4 | Doku-Läufe: 8 Shard-Kontexte → 1 Sammel-Kontext | 1'500 | Bauschritt + Branch-Regel | unverändert |
| M5 | Plan-Buchung: `npm ci` erst nach Trailer-Fund | 150 | sofort, Konfig | unverändert |
| | **Summe** | **24'300** | | |

**M1 (15'050 min).** Branch-Schutz hat `strict: true` (gemessen via
`branches/main/protection`) — ein PR muss vor dem Merge aktuell sein; ein
`pull_request`-Lauf testet ohnehin den *Merge-Commit* (head in main gemerged).
Der Baum, der auf main landet, ist damit **byte-identisch** zu dem, den der
PR-Lauf grün gefahren hat — Tore und 8 Shards ein zweites Mal darauf laufen zu
lassen liefert keine neue Information (§6: Golden bleibt byte-gleich, es ist
derselbe Baum). Auf main bleiben `diff`, `bau`, `perf` (ci.yml:822-833,
§15-Messung je Deploy-Stand) und `deploy` (ci.yml:912) — ~2'900 min. **Auflage
§6.7:** ein Tor muss `strict==true` und «Head-Commit ist Squash-Merge eines
grünen PR» hart prüfen, jede Unsicherheit fällt auf den Volllauf; die
Live-Basis-Logik von 30.8.2026 (ci.yml:200-230, Vorfall #579) bleibt unberührt.
*Alternative:* Merge Queue scharfstellen (`merge_group` liegt in ci.yml:108
bereit, David-Gate G7) — spart zusätzlich die Nachzüge, kostet aber einen
Queue-Lauf je Landung; netto etwa gleich viel, deutlich mehr Umbau. **Dieselbe
Wurzel wie `QS-ORG-UMZUG`/`david-entscheid-org-umzug`** (ROADMAP.md, native
Merge Queue braucht eine Organisation) — kein zweiter Entscheid, ein Verweis.

**M2 (3'800 min).** 13 Dependabot-Zweige erzeugten **113 CI-Läufe = 4'487 min**
(Ø 8.7 je Zweig, Spitze 15): Dependabot rebasiert bei jeder main-Bewegung
(~9 Landungen/Tag), und jeder Rebase startet die volle Strasse auf einem Stand,
der nie gemergt wird. `.github/dependabot.yml` hat kein `rebase-strategy`
(Default `auto`). Fix: `rebase-strategy: disabled`, `interval: monthly`;
`dev-minor`/`browser-tests`-Gruppen bleiben (dependabot.yml:14-27, mit PR #510
belegt). **Kein Tiefenverlust:** jeder Dependabot-PR fährt vor dem Merge die
volle Strasse, `strict:true` erzwingt davor ohnehin ein `update-branch`.

**M3 (3'800 min).** Je Shard-Job fallen 1.28 min Rüstzeit + 0.37 min Aufrundung
an, unabhängig von der Testmenge: 8 Shards = 46.7 abgerechnete min bei nur
33.3 min echter Testzeit — **13.4 min/Lauf reiner Job-Overhead**. 4 Shards:
4 × (8.3 Test + 1.3 Rüst) → 40 min, −6.7 min je Code-Lauf (nach M1/M2 noch
~563). Preis: Wanduhr je PR 5.5 → 9.6 min. **Kein Tiefenverlust:** identische
Spec-Menge, der Union-Wächter `check:e2e-shards` (ci.yml:728) beweist Gruppen ==
`playwright --list`. Neu mit `npm run gen:e2e-shards`, Branch-Regel 8 → 4.

**M4 (1'500 min).** 218 Doku-/code-fern-Läufe à 15.1 min sind fast nur
Runner-Anlauf: 8 Shard-Jobs starten allein für ihre Kurzquittung (ci.yml:787)
= 8 × 1 min Mindestabrechnung, weil die Branch-Regel 8 einzelne Kontexte
verlangt. Ein Sammel-Job «Browser-Smoke (8 Shards)» (`needs: [e2e]`,
`if: always()`) meldet einen Kontext für alle, `skipped`-Shards kosten 0 min.
**Kein Tiefenverlust:** bei `art=doku` laufen schon heute keine Browser-Tests.
**Fallstrick:** der Required-Check-Name ändert sich damit — Branch-Schutz UND
`check:merge-schutz`/Required-Kontext-Liste müssen im selben Schritt
nachgezogen werden, sonst hängt ein PR auf einem nie mehr gemeldeten Kontext
(vgl. das belegte Muster bei QS-AUTOMATIK, ROADMAP.md: «Plan-Buchung-Fallback
akzeptiert den Roadmap-Block nur als letzten PR-Body-Absatz»).

**M5 (150 min).** `plan-buchung.yml:81` fährt `npx -y npm@11 ci` bei **jedem**
main-Push, obwohl der Trailer erst danach gelesen wird (:88) und «kein Trailer»
laut Kommentar der Normalfall ist. Reihenfolge tauschen (Trailer aus `git log`,
`npm ci` nur bei `vorhanden == true`): 299 Läufe à 1.14 → ~0.6 min.

**Nicht empfohlen:** `cancel-in-progress` ist schon aktiv (3119 cancelled-min
sind sein Preis, kein ungehobener Rest), `paths-ignore` wäre ein Rückschritt
hinter K3/K12. Prüftiefe auf Rechtslogik/Rechtsdaten (`check:seriell`, 51 Tore)
wird nirgends angetastet.

## 3 Verdikt

| | min/Monat | Free 2000 | Pro 3000 | Überzug $0.008/min |
|---|---:|---|---|---:|
| heute | 61'381 | 31× drüber | 20× drüber | **467 $/Mt** |
| nach Sparplan | 37'081 | 19× drüber | 12× drüber | **273 $/Mt** |

**Der Sparplan reicht nicht — nicht annähernd.** 3000 min/Monat sind 100 min/Tag;
**ein einziger** Code-CI-Lauf kostet 61 min, das Repo fährt ~31 davon pro Tag.
Für Pro müssten 95 % weg — das ginge nur durch Abschalten der Browser-Tests auf
PRs, und das ist Prüftiefen-Verlust (§6.7), kein Sparen.

**Drei ehrliche Wege:** (1) **öffentlich bleiben** — öffentliche Repos haben
unbegrenzt freie Actions-Minuten, faktisch 467 $/Monat geschenkte Rechenzeit;
(2) **privat + Self-hosted Runner** (Davids Mac, `runs-on: self-hosted`):
GitHub rechnet Self-hosted-Minuten **nicht** ab, auch im privaten Repo — volle
Prüftiefe, 0 $ Minutenkosten; die Sicherheitsbedenken gegen Self-hosted
betreffen *öffentliche* Repos mit Fork-PRs, im privaten entfällt das. Preis:
der Mac muss laufen, `ubuntu-latest`-Annahmen (apt, Chromium, `TZ`) einmal
portieren. **Der einzige Weg, der «privat» und «volle Prüfstrasse» zugleich
erfüllt.** (3) **privat + zahlen**, mit Sparplan ~273 $/Monat.

**Zur «öffentlich, aber unauffindbar»-Idee: das funktioniert nicht.** GitHub
kennt kein `noindex`. Ein öffentliches Repo steht in der GitHub-Codesuche, ist
über die REST-API listbar, landet stündlich in den GH-Archive-Volldumps und wird
von Mirror-Diensten binnen Stunden geklont; Topic und Beschreibung wegzulassen
senkt die Bequemlichkeit, nicht die Auffindbarkeit. Halbe Wege gibt es hier
keine — wer das Repo nicht öffentlich will, muss es privat schalten.

**Offen:** Davids GitHub-Tarif (Free/Pro) konnte ich nicht messen —
`/users/.../settings/billing/actions` verlangt den `user`-Scope, den das lokale
`gh` nicht hat (HTTP 404 + Scope-Hinweis). Beide Fälle sind oben gerechnet.

**Nachtrag 8.9.2026 (Steuer-Doku-Ablage, kein neuer Befund — §2b: nichts an
diesem Bericht wurde nachgeführt, nur eingeordnet):** Dieser Bericht ist die
Grundlage für den Roadmap-Schritt `QS-CI-MINUTEN` (ROADMAP.md, Abschnitt
«Betrieb & Prüfstrasse») und die David-Frage im `@david-fragen`-Block
(«Repo privat schalten?»). Der Text oben bleibt unverändert der Opus-Messung
vom 8.9.2026 entnommen.
