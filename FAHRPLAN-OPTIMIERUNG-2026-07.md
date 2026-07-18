# FAHRPLAN — Optimierungs-Research Juli 2026 (Ablage, Stand 12.7.2026)

> **Nur Plan, kein Bau.** Ergebnis des allgemeinen Ultracode-Optimierungs-Research
> (Auftrag David 12.7.2026) nach adversarialer Kritik-Filterung (10 Stichproben
> repo+live verifiziert, 0 Befunde widerlegt, 2 Prämissen veraltet). Detailquelle
> zum ROADMAP-Querschnitt **`QS-OPT`** (§14.1). Bereits abgedeckte Flächen werden
> **nur referenziert, nie dupliziert**: UI-Navigation (W2·10), Design/Wärme (W2·11),
> Code-Hygiene (W2·12), Token-Ökonomie (QS-TOK ✅), Performance (QS-PERF a+b ✅),
> SEO/A11y (FAHRPLAN-SEO-A11Y-GOVERNANCE), Prozesskosten (FAHRPLAN-PROZESSKOSTEN-COCKPIT),
> Currency (QS-CURRENCY/FAHRPLAN-FEDLEX-PORTFOLIO), Katalog-Triage (KATALOG-ROADMAP.md).

**Leitplanken-Bilanz der Kritik:** Alle Werkzeug-/Vorlagen-Befunde stehen unter der
**§0a-Sperre** (`FAHRPLAN-GRUNDLAGEN.md`, «keine neuen Engines») und sind in
`KATALOG-ROADMAP.md` bereits Fall-für-Fall triagiert (Entscheid-Spalte «offen», David
entscheidet einzeln) → O-6. Die SEO-Befunde liegen in der von David geparkten Zone
(«Reines SEO geparkt», ROADMAP-Querschnitt SEO-A11Y) → O-5, mit zwei Betriebs-Ausnahmen
(Soft-404, Case-Redirect → O-1). Unbeaufsichtigte Auto-Merge-Loops und Prod-DB-Secrets
in CI sind eine **neue §9-Qualität** → einmaliges Rahmen-Gate David in O-2.

**Veraltete Prämissen (vor Bau beachten):**
- Der P1-a/b-Rückstand («18 Pins überholt, Regex-Loch») ist **erledigt** (QS-CURRENCY
  Paket 1 ✅, PR #195, `main@21603bf0`, 0 stale). Das Frische-SLA verliert damit den
  akuten Aufhänger (Idee bleibt, Dringlichkeit runter).
- BGE-Bestandeszahlen driften zwischen Befunden (342 Suche / 562 BGer-Korpus / 594+11+2
  nach Sprache) — vor jedem Bau einmal aus `public/rechtsprechung/register.json` festnageln.
- Listeninternes Duplikat aufgelöst: das Vernehmlassungs-Netz-Tor ist Teilmenge des
  Monitor-Tore-Postens (O-1.3).

---

## O-1 · Betrieb & Wachhund — SOFORT BAUBAR

**Kern:** Prod ist heute strukturell blind — ein seit Wochen totes Feature (CSP frisst
LiveSuche) blieb unbemerkt, fehlende Ressourcen liefern 200+HTML-Shell, der Wochen-Monitor
prüft Quellen, aber nie die Site selbst. Eine Bau-Einheit «Härten» (§0a-konform, kein
Rechtsinhalt), alles empirisch belegt (Live-Messungen 12.7.2026).

| # | Posten | Beleg (verifiziert) | Aufwand |
|---|---|---|---|
| 1 | **CSP-Fix LiveSuche**: `entscheidsuche.ch` in `connect-src` (1 Zeile `vercel.json`) ODER datenschutzfreundlicher Edge-Proxy neben `api/suche.ts`; plus e2e-Smoke, der den Erfolgsfall gegen die Prod-CSP testet (Klasse «CSP frisst Feature» dauerhaft gefangen) | `src/lib/rechtsprechung/livesuche.ts:18` POSTet auf `entscheidsuche.ch/_search.php`; Prod-CSP erlaubt nur self+zefix+geo — Playwright-Beweis «Refused to connect» | S |
| 2 | **Prod-Smoke im Normen-Monitor**: curl-Steps in `.github/workflows/normen-monitor.yml` (Startseite 200+HTML, `/api/suche` 200+JSON-Schema, je 1 Stichproben-JSON pro Korpus mit Content-Type-Assertion) — nutzt die bestehende Issue-bei-Rot-Meldekette | Monitor prüft heute ausschliesslich amtliche Quellen/Pins, nie lexmetrik.vercel.app; `/api/suche` degradiert ehrlich auf 503, aber unbemerkt | S |
| 3 | **Monitor auf `npm run check:netz` umstellen** (statt Einzelliste): heute fahren nur 6 von 10 Netz-Toren; es fehlen `check:pdf-quellen-netz`, `check:botschaften-netz`, `check:revisionen-netz`, `check:vernehmlassungen-netz` — Letzteres deckt die mutabelste, nutzer-sichtbare Datenklasse (laufende Vernehmlassungs-Fristen, z.B. VERN-2026-73 bis 29.10.2026). Danach gilt Monitor-Abdeckung = `check:netz` per Konstruktion | `package.json:27` (10 Tore) vs. `normen-monitor.yml` (6) | S |
| 4 | **Soft-404 beenden**: negatives Rewrite-Muster in `vercel.json` (Daten-/Asset-Pfade `/normtext/`, `/rechtsprechung/`, `/materialien/`, `/such-index/`, `/assets/` vom Catch-all ausnehmen) → fehlende Dateien geben echte 404; Loader unterscheiden sauber, Prod-Smoke (#2) kann 404 als Signal nutzen. Nicht «reines SEO» — maskiert heute **Datenfehler** | Live: `/normtext/gibt-es-nicht.json` → HTTP 200, text/html (SPA-Shell mit falscher CSP) | S |
| 5 | **Case-Redirect**: case-insensitiver 301 auf die kanonische Schreibweise (`/gesetze/bund/or` → `/OR`), via `vercel.json` oder Prerender-Kanonisierung — 1-Zeilen-Robustheit, sichert eingehende Links | Live: `/gesetze/bund/or` = noindex-Shell ohne Canonical/Redirect | S |
| 6 | **LIK-Freshness-Mini-Tor**: `LIK_LETZTER_MONAT` gegen (heute − 2 Monate) prüfen (BFS publiziert im Folgemonat), als Step im Monitor oder in `check:verfall`; Fix = bestehender Generator `scripts/lik-reihe-generieren.py`. Generell: Register-Zeilen mit fester Kadenz («monatlich»/«jährlich») brauchen ein maschinenlesbares Datum, sonst ist das Verfallsregister dort zahnlos | `likReihe.ts:8='2026-05'` bei heute 2026-07; `parameter-verfall.md` Z.18 «bei Nutzerbedarf» → check:verfall klassiert «manuell», prüft nie | S |
| 7 | **`laden.ts`-Fehler-Cache-Fix**: nur echte 404 als `null` cachen; Netz-/Parse-Fehler aus dem Promise-Cache löschen (`dateiCache.delete` im catch) → nächster Zugriff versucht neu. Gleiches Muster in `browse.ts`/`norm-index.ts`. Verhaltensneutral für den Erfolgsfall | `src/lib/normtext/laden.ts:8–10` cached bewusst auch Fehlschläge für Modul-Lebensdauer — ein Netz-Blip degradiert Artikel-Popups bis zum Reload | S |
| 8 | **Zefix/geo-Vertragstests**: je Runtime-API 1 fixe Beispielabfrage im Wochen-Monitor, Assertion auf die konsumierten Felder (~30 Zeilen/API) — deckt Ausfall UND Schema-Drift (stille Feld-Umbenennung ginge heute als «keine Treffer» durch) | `ZefixSuche.tsx`/`AdresseBundSuche.tsx` hängen an www.zefix.ch/api3.geo.admin.ch, kein Tor prüft die Schemata | S |
| 9 | **`/api/fehler` Minimal-Fehlerkanal** (eigener Schritt): Edge-Function analog `api/suche.ts` ('self'-kompatibel), nimmt von ErrorBoundary/`window.onerror` nur Fehlermeldung+Route+Build-Hash (gesampelt, keine Eingaben, kein Fingerprinting) → Vercel-Runtime-Logs. §8-konform in der Datenschutzerklärung offenlegen | `ErrorBoundary.tsx` loggt nur Konsole; einziger Rückkanal = freiwilliges mailto; der CSP-Ausfall (#1) ist der Beleg der Unsichtbarkeit | M |

**Gate-Status:** #1–8 sofort baubar (autonom, `[OF]`, keine Fachzeit). #9 = Mini-Gate
(Datenschutzerklärungs-Text → kurzer David-Blick, kein Fachrecht). Fläche: `vercel.json`,
`.github/workflows/normen-monitor.yml`, `src/lib/normtext/laden.ts`, `e2e/`, `api/`.
Kollisionshinweis: `vercel.json` auch in SEO-A11Y-Kollisionsliste → Worktree (§12).

## O-2 · Frische-Automatik — SOFORT BAUBAR, ein einmaliges David-Rahmen-Gate

**Kern:** Der Frische-Kreislauf ist heute Detektion ohne Reparatur — Rot verhallt in
einem GitHub-Issue (real unbemerkt 15.6./29.6.), jede Reparatur ist Session-Handarbeit.
Verortung: **QS-CURRENCY / `FAHRPLAN-FEDLEX-PORTFOLIO.md`** + **`FAHRPLAN-DATENHALTUNG.md`**
(kein neuer Fahrplan — hier nur gebündelt).

| # | Posten | Beleg / Termin | Aufwand |
|---|---|---|---|
| 1 | **Batch-Re-Pin-Skript** (`scripts/fedlex-repin-batch.ts`): liest fällige AUTO-Zeilen aus `parameter-verfall.md`, holt via SPARQL die neue geltende Filestore-URL, ersetzt Pin, regeneriert Snapshot+Register+currency, fährt alle Normtext-Tore. **TERMINKRITISCHSTER POSTEN:** per 1.8.2026 sind 10 Erlasse fällig (BüV, ZEMIS-V, USG, LRV, VVEA, FZV, BVV 2, KVV, KLV, AVIV), per 1.10. elf weitere (OR, HRegV, StGB, …); `check:verfall` (VORLAUF 45 Tage) macht den 1.8.-Berg **bereits jetzt** rot-nah → Deploy-Hindernis. Fedlex konsolidiert typisch quartalsweise → jeder Stichtag wird EIN Agent-Lauf statt 10 Sessions | AUTO-Block `bibliothek/register/parameter-verfall.md`; §7-Verifikation bleibt je Erlass Teil des Laufs | M |
| 2 | **`gen:fedlex-wiedervorlage` in den Wochen-Monitor**: Lauf mit `--datum`, Diff von `currency.json` + AUTO-Block als automatischer PR — Reader-Chips «geltend geprüft am …» bleiben ≤7 Tage alt statt kollektiv zu altern | `public/normtext/currency.json`: alle 227 Erlasse geprueftAm=2026-07-10 (ein manueller Lauf); Generator explizit «Netz, manuell», nicht im Monitor | S |
| 3 | **BGE-Currency-Sonde + Nachführ-Lauf**: (a) S — Sonde im Monitor: höchste publizierte BGE-Nummer je Abteilung (amtlicher bger.ch-Index) vs. eigener Bestand, Drift → Issue; (b) M — monatlicher Nachführ-Lauf der bestehenden `entscheide`-Pipeline als scheduled Agent mit PR (Quirks-Quarantäne existiert). Aussage «Leitentscheide aktuell» wird §8-fest | Korpus wird heute nur sessionweise erweitert, veraltet still ohne je rot zu werden (BGer publiziert laufend Band 152) | S+M |
| 4 | **`check:entscheide-netz`** (Link-Rot-Wache): Stichproben-HEAD/GET gegen gespeicherte `quelleUrl`-Permalinks (rotierend ~20/Lauf, rate-limitiert) im Wochen-Monitor — einzige Korpus-Datenart ohne Netz-Drift-Tor; BGE-Texte sind final, aber Permalink-Rot bliebe still | `scripts/normtext/check-entscheide.ts` ist rein offline | M |
| 5 | **Kantons-Repair-Pfad**: bei `version_uid`-Drift im Monitor automatisch `normtext:struktur-kanton` für betroffene Erlasse + PR mit Toren (Kantone bleiben reaktiv — Quellenlage, keine Zukunftstermine); ergänzend Reader-Kantons-Chip auf «Stand geprüft am [letzter grüner Monitor-Lauf]» heben (ehrliche Frische-Aussage ohne Zusatzlauf) | Asymmetrie Bund proaktiv terminiert / Kantone rein reaktiv+manuell | M |
| 6 | **Turso-Sync an Daten-Diff koppeln**: CI-Job auf main, der bei Änderungen unter `public/normtext/**`/`daten-manifest.json` `datenhaltung:turso-sync` fährt + Live-Paritäts-Stichprobe (api/suche-Smoke gegen 3 bekannte Artikel) — sonst servieren Reader und Prod-Suche zwei Frische-Wahrheiten | Sync ist rein manueller npm-Lauf; `check:paritaet` prüft nur Repo-Stand, nie die Live-Replika. Verortung: `FAHRPLAN-DATENHALTUNG.md` | M |
| 7 | **Frische-SLA + Alters-Report** (nachrangig — Prämisse veraltet, s. Kopf): Budget «Pin max. N Tage hinter geltender Konsolidierung» (Vorschlag Bund 30 d → Deploy-Hindernis, Kanton 60 d) + Median-/Max-Alter-Report in `check:datenhaltung` oder Verfall-UI. Macht Rückstand messbar/triagierbar statt binär-rot | Fassungsstände koexistieren kommentarlos (BüV 2019 … StGB 12.6.2026) | M |

**Gate-Status:** Skripte/Sonden (#1–5) sofort baubar. **Einmaliges Rahmen-Gate David
(§9, neue Qualität — VOR erstem unbeaufsichtigtem Lauf):** (a) Auto-Merge-Rahmen für
scheduled Repair-PRs (main deployt auf Prod; die Auto-Merge-Daueranweisung deckt
Session-PRs, nicht nächtliche Daten-Auto-Deploys) und (b) Turso-Schreib-Token als
CI-Secret (#6). Bis dahin: alles läuft, aber PRs bleiben zur Session-Abnahme offen.
Fachentscheide (Wortlaut-Änderungen an Engine-Normen) eskalieren als Issue — zeitsperren-kompatibel.

### O-2 · Zweitprüfungs-Nachtrag (17.7.2026, Ökosystem-Linse)

> **Herkunft:** Recherche «Informations-Nutzung der Gesetze», Zweitprüfung David
> 17.7.2026 (Ökosystem/Triplestore-Linse, live SPARQL). **Detailquelle (§11):**
> `bibliothek/normen/informations-nutzung-gesetze-2026-07-17.md`. Hierher verortet,
> weil **Frische-/Detektions-Fläche** (O-2) — beide Kandidaten ergänzen den
> Frische-Kreislauf.

#### G-AUFH · `dateNoLongerInForce` wird nirgends geprüft — **NÄCHSTE BAU-EINHEIT (David-GO liegt vor)**

- **Quelle + Stand:** Fedlex-Triplestore, `jolux:dateNoLongerInForce` am Erlass
  (live SPARQL 17.7.2026).
- **Befund (deterministisch):** die Wiedervorlage-/Frische-Prüfung
  (`scripts/fedlex-versionen-pruefen.ts:107-119`) filtert nur geltende vs. künftige
  **Konsolidierungen** und meldet die neueste geltende als «OK» — sie prüft
  **`dateNoLongerInForce` nicht**. Folge: ein **ganz aufgehobener** Erlass bliebe
  still «geltend geprüft» (**§7/§8-Verstoss**; das Skill-Recipe
  `scraping-swiss-official-sources` fordert den Check explizit).
- **Geltungsbereich + Ausnahmen:** Bund, alle gepinnten Erlasse.
- **Pflegebedarf:** Check an den Drift-Zyklus koppeln (`check:fedlex-versionen`);
  Aufhebungs-Datum = datierter Parameter.
- **Umfang:** **klein** (ein zusätzlicher Query-Filter + Alarm-Zweig).
- **Abnahme-Status:** Zweitprüfung (17.7.2026). **🟢 David-GO liegt vor** («setze
  befunde um») → **als NÄCHSTE Bau-Einheit markiert** (Korrektheits-Bug, hoher
  Hebel, kleiner Fix).

#### G-RSS · STALE-PENDING-Fenster + amtlicher RSS-OC-Feed ungenutzt

- **Quelle + Stand:** amtlicher RSS-Feed `api/rss-oc-de.xml` (Amtliche Sammlung,
  live verifiziert 17.7.2026, **50 Items**).
- **Befund (deterministisch):** die Konsolidierung hinkt der AS um **Tage–Wochen**
  nach (STALE-PENDING-Fenster). O-2 pollt heute nur **gepinnte** Erlasse (Stärke:
  Zukunfts-Signal künftiger `dateApplicability`), **abonniert aber den RSS-OC-Feed
  nicht** — der auch **brandneue** Erlasse ohne Pin deckt.
- **Geltungsbereich + Ausnahmen:** Bund.
- **Pflegebedarf:** Feed-Abo im Wochen-Monitor; neue OC-Einträge → Issue/PR.
- **Umfang:** S–M. **Abnahme-Status:** Zweitprüfung (17.7.2026), Bau-GO ausstehend
  (ergänzt O-2, kein eigenes Rahmen-Gate nötig).

## O-3 · Prüf-Tore nachziehen — SOFORT BAUBAR (harte Reihenfolge)

**Kern:** Die teuersten Prüf-Blindspots im Rechen-Kern und die Flake-Wurzel der
CI-e2e. Verortung QS-GP/LERNPHASE-AB (Verifikations-Infrastruktur). **Reihenfolge
verbindlich** (K5/QS-TOK: erst CI-Pfad entlasten, dann e2e-Masse zubauen):

1. **Golden-Matrix Rechen-Blindspot** (S, zuerst — höchster Schutz/Zeile):
   `golden/lexmetrik-golden.json` (209 Keys) enthält **0** Keys für prozesskosten,
   beurkundung, grundbuch(gebuehren), notariatGrundbuch — diese Tarif-Engines sind nur
   strukturell gedeckt (`tarifInvarianten.test.ts`); ein fachlich falscher, aber monotoner
   Betrag passiert heute alle Tore. Eingabe-Matrix (~5 Werte × Kanton-Stichprobe ×
   Geschäftsart) in `scripts/golden-outputs.ts`. Risiko-Pfad → Gegenprüfung (§14.4).
2. **Flake-Wurzel** (S): 24 harte `waitForTimeout` in 9 Reader-e2e-Specs (exakt die
   CPU-Starvation-Klasse) durch web-first-Assertions/`expect.poll` ersetzen + Grep-Tor
   gegen neues `waitForTimeout` in `e2e/` + **Flake-Telemetrie** (JSON-Reporter,
   Mini-Skript meldet `status='flaky'` als Step-Summary — `retries: 2` maskiert heute
   jede Flake unsichtbar).
3. **e2e-Sharding** (M): Playwright `--shard` als GitHub-Matrix (je eigener
   vite-preview, `E2E_PORT` schon env-konfigurierbar) statt `workers: 1`-Serialisierung —
   halbiert die e2e-Wand ohne die Contention zurückzuholen; macht Schritt 4 CI-verträglich.
4. **Erst danach — e2e-/Test-Masse** (je S/M): (a) generischer Vorlagen-Download-Smoke
   (Routen aus `vorlagenRegistry`, `waitForEvent('download')`, Bytes>0 — 35 Seiten,
   1 getestet, jsPDF-/Chunk-Fehler heute blind); (b) parametrische Rechner-Fluss-e2e
   (Route + 1 Referenzfall + erwarteter Anzeige-Betrag aus Golden — Eingabe→Ergebnis ist
   heute fast ungedeckt); (c) Property-Tests Fristen-Engines (fast-check-Muster aus
   `tarifStaffel.property.test.ts` 1:1: Fristende ≥ Beginn, nie Sa/So/Feiertag,
   Verschiebung idempotent, Rückwärts∘Vorwärts ≈ id — historisch teuerste Bug-Klasse);
   (d) Browser-Smoke-Routen registry-generiert mit Opt-out statt 11 handgepflegter Routen.

**Gate-Status:** komplett autonom, `[OF]`, keine Fachzeit. Golden-Matrix ist
verhaltensneutral (friert Ist ein); Korrekturen, die sie später aufdeckt, sind eigene
gegate­te Einheiten.

## O-4 · FR/IT-Zugang — teilbar (sofort / klein-Gate / geparkt)

**Kern:** Die grösste FR/IT-Lücke ist kein Übersetzungsproblem, sondern ein
Pipeline-Filter und fehlende Alias-/lang-Mechanik. Kein LLM, keine Übersetzung, rein amtlich.

- **Sofort baubar:**
  - **Alias-Tabelle FR/IT-Zitierweisen** (S): `normQuery.ts` löst nur deutsche Kürzel;
    «CO 97», «CC 684», «LP 80», «Cst. 29» laufen ins Leere. Deterministische
    DE↔FR/IT-Tabelle je Bundeserlass (amtliche Abkürzungen bei Fedlex je Sprachfassung,
    ~60–80 Einträge, Kollisionsprüfung wie beim «StG»-Mechanismus). Hoher Nutzwert/Zeile.
  - **«FR | IT (amtlich)»-Chips im Gesetzes-Leser** (S): `fedlexLokalisiert` existiert
    (verifizierte sprachunabhängige Anker), wird aber nur in Vorlagen/Kontext-Panel
    genutzt — Chips im Leser-Kopf/Artikel-Popup = echter Mehrwert ohne eigenen Content.
  - **lang-Fixes → in SEO-A11Y W2.4 falten (kein neuer Posten):** (a) Sprachumschalter
    erzeugt lang-Mismatch (WCAG 3.1.1 — `locale.tsx` koppelt `<html lang>` an die Locale,
    Inhalt bleibt deutsch); (b) FR/IT-Entscheide ohne `lang`-Attribut (WCAG 3.1.2 —
    empirisch: it-Entscheid `bvger_F_4218_2026` prerendert mit `lang="de-CH"`;
    `sprache`-Feld liegt im Register, reine Projektion). Die zwei Befunde sind der
    empirische Beweis zu W2.4.
- **David-Gate (klein, Produktentscheid — Sekunden, keine Fachabnahme):** **DE-Filter
  der BGer-Pipeline heben** (`scripts/normtext-entscheide.ts:111/133` filtert hart auf
  `de`; 554 von 562 BGer-Entscheiden deutsch, real ergeht ~⅓ der BGE französisch).
  Entscheide sind einsprachige amtliche Originale → hunderte FR/IT-Volltexte ohne einen
  übersetzten Satz + Sprach-Badge/-Filter. Ändert Korpus-Zusammensetzung → mit den
  bestehenden Korpus-Re-Lauf-Schritten (QS-GP d / W2·6) bündeln; lang-Fix zuerst.
- **Geparkt:** FR-Snapshots der Top-Bundeserlasse (CO/CC/CP/LP) als eigene Routen +
  hreflang (L) = exakt der Inhaltsentscheid, auf den **SEO-A11Y W3.7** wartet — dort, nicht hier.

## O-5 · SEO-Nachträge — GEPARKT (Verortung FAHRPLAN-SEO-A11Y-GOVERNANCE)

Die Zone «Reines SEO» ist von David geparkt (ROADMAP-Querschnitt SEO-A11Y) — hier
**kein Bau**, nur Einsortierung. Vier **echt neue** Posten wurden als Nachtrags-Block
§10 in `FAHRPLAN-SEO-A11Y-GOVERNANCE.md` eingetragen (12.7.2026):

1. **Hub→Detail-Registerseiten** (M): ~3400 Detail-URLs sind Sitemap-only-Waisen —
   prerenderte Hubs enthalten 0 Links auf Detailseiten (live geprüft). Geht über
   W1.1/W2.1 hinaus (W2.1 = Rechner→Norm, nicht Hub→Detail). Grösster ungehobener
   On-Page-Hebel, Prerender-Infrastruktur steht.
2. **Materialien-Thin-Content-Schutz** (S): 1549 indexierbare Mini-Stubs (Sample: 227
   Zeichen Body, Article-Schema, grösste Teil-Sitemap) — W1.5-Erweiterung (existiert für
   Gesetze, fehlt für Materialien): noindex/Sitemap-Ausschluss unter Substanz-Schwelle
   oder mechanische Anreicherung aus Registerfeldern.
3. **JSON-LD-Anreicherung** (S): Legislation ohne sameAs→Fedlex-ELI (quelleUrl liegt im
   Register!), ohne Datum/Jurisdiktion; Entscheide ganz ohne Fach-Typ — W1.3-Erweiterung,
   rein mechanisch aus Registerfeldern (kein Geltungs-Claim, W1.3-Trennstrich gilt).
4. **OG-Bilder per Typ/Dokument** (M, niedrigste Priorität, erst nach Index-Aufbau):
   eine statische Site-Card für alle 3400 Detailseiten; `scripts/og-bild.ts` existiert
   als Generator.

**Nur Referenz (Duplikate, NICHT neu):** GSC-Einrichtung = W1.12 (Index praktisch leer,
kein Verifikations-Tag — weiterhin der Freischalt-Posten der Messbarkeit) · lastmod =
W1.4 (Entscheid-`datum` tragfähig, 0 lastmod live) · Domain = W3.4 (David-Markenentscheid;
empirischer Zusatz: je früher vor Erstindex, desto billiger) · 923-KB-OR-HTML =
W1.11/W2.8 + QS-PERF (Prioritätsvermerk: betrifft live indexierbare Haupt-Keyword-Seiten)
· Link-Unterstreichung B-2 = W3.5 (einziger verbleibender serious-axe-Befund site-weit,
leert die ganze Whitelist — Design-Ja/Nein David) · Screenreader-Baseline = W2.5
(VoiceOver-Durchgang über ARIA-Span-Tabellen/1099-Artikel-Reader — axe misst das nicht)
· Tastatur-Restlücken = W2.3 (Sidebar-Drilldown, EntscheidFilter, Reiter-Dialog-Fokusfalle,
◂▸-Pane-Buttons) · hreflang = W3.7 (wartet auf O-4-Inhaltsentscheid).

## O-6 · Werkzeuge/Vorlagen-Empirie — DAVID-GATE (Verortung KATALOG-ROADMAP.md)

**Kern:** Die §0a-Sperre («keine neuen Engines») gilt; `KATALOG-ROADMAP.md` führt für
genau diese Karten Fall-für-Fall-Triagen mit Entscheid «offen» — teils im **Widerspruch**
zu den Research-Empfehlungen. **Keine neue Bau-Einheit** vor §0a-Öffnung bzw.
Einzel-Entscheid David (Sekunden-Entscheide, keine Fachabnahme — zeitsperren-kompatibel).
Der bleibende Wert des Research ist die **Empirie «Baustein liegt fertig»** — als
Notiz-Block in `KATALOG-ROADMAP.md` §B eingetragen (12.7.2026):

| Karte (Katalog-Triage) | Research-Empirie |
|---|---|
| Kostenvorschuss — Katalog: «in `prozesskosten` falten» | Berechnung existiert komplett: Interface `Kostenvorschuss` `prozesskosten.ts:398–402` (Art. 98 ZPO, Stand 1.1.2025) + BGG-Variante Z.217; Deep-Link/Permalink genügt (= faktisch die Falten-Umsetzung) |
| Bundesgerichtsgebühren — Katalog: «Datenschicht in `prozesskosten`» | Doppelt verifizierter BGer-Tarif liegt (`src/data/tarif/bundesgericht.ts`, SR 173.110.210.1); Engine kennt `instanz='bundesgericht'` (`prozesskosten.ts:63/194`) — nur Verdrahtung fehlt |
| Schadenszins — Katalog: «Verzugszins-Preset» | Gesamte Mechanik inkl. Kumulationsverbot-Warnung (BGE 122 III 53 / 131 III 12) liegt in `verzugszins.ts:301–302`; §8-Anker-Vorbehalt dokumentiert `werkzeuge.ts:233` |
| 13. Monatslohn — Katalog: «✗ raus (Dreisatz, Treuhand)» | **Widerspruch zum Research** (empfahl Bau) — Katalog-Triage hat Vorrang, David entscheidet |
| Überstunden-/Überzeitzuschlag — Katalog: ✅ [E], offen | Rein Art. 321c Abs. 3 OR / Art. 13 ArG; Arbeit-Cluster-Nachbarn (lohnfortzahlung, kuendigungsfrist) existieren |
| Ferienanspruch/-kürzung — Katalog: «EIN Rechner (falten)» | Art. 329a/b/d OR deterministisch; Verhinderungs-Eingaben überschneiden mit `lohnfortzahlung.ts` (Formular-Synergie). Research plante 2 Karten — Katalog-Faltung gilt |
| Mietzinsanpassung — Katalog-C-Rangliste #6 (HRD 12) | LIK-Reihe + Teuerungs-Engine liegen; fehlt nur BWO-Referenzzins-Reihe (quartalsweise, bwo.admin.ch) + VMWG-Formel (Art. 13/16); Verfallsregister-Kandidat (Quartals-Pflege) |
| Straf-Verjährung — im Katalog gerankt | Rein bundesrechtlich (Art. 97–101/109 StGB), fristenEngine-Muster erprobt, Strafrecht-Nachbarn existieren, StGB-Volltext im Korpus |
| Vorlagen Schuldanerkennung / Rechtsöffnungsbegehren / Rechtsvorschlag | Höchster Kanzlei-Takt, Framework voll ausgebaut (nur Schema+Seite); verzahnt betreibungskosten+schkg-fristen. Arbeitszeugnis: Katalog «◐→✗» — Vorrang Katalog |

**Referenzen (nicht duplizieren):** Modifikatoren-Zweitpass (0× `verifiziert:'R'`,
BE-Rechtsmittel-Topf bekannt unsauber) = **FAHRPLAN-PROZESSKOSTEN-COCKPIT I2/I3** — dort
Priorität heben, `[OF]`-fähig (unabhängige Doppel-Verifikation ≠ Abnahme). ·
Zuständigkeits-Behördenadressen über BS hinaus (L, Pflegelast → Verfallsregister-Folgekosten)
= **geparkt hinter `FAHRPLAN-BS-VORBILDKANTON.md`**; Erstlisten liegen in `bibliothek/behoerden/`.

---

## Verworfen / bewusst NICHT übernommen

- **Frische-SLA als Akut-Posten** — Aufhänger (P1-a/b-Rückstand) war zum Research-Zeitpunkt
  bereits behoben (PR #195); bleibt als nachrangiger O-2.7.
- **Unbeaufsichtigter Auto-Merge-Loop ohne Rahmen-Freigabe** — §9-Kollision (K4); nur mit
  einmaligem David-Rahmen (O-2 Gate).
- **e2e-Masse vor Sharding/Flake-Abbau** — QS-TOK/CI-Ökonomie (K5); Reihenfolge in O-3 hart.
- **Neue Rechner-/Vorlagen-Bau-Einheiten** — §0a-Sperre + Katalog-Triage-Vorrang (K1);
  nur Empirie-Notizen (O-6).
- **Eigene lang-/SEO-/A11y-Posten** — Duplikate zu W2.4/W1.x/W2.x/W3.x (K2/K3); gefaltet
  bzw. nur referenziert (O-4/O-5).
- **Sofortiger SEO-Bau** — Zone von David geparkt; Entparken ist Davids Wort (O-5).

## Empfohlene Reihenfolge (wenn David/Session Kapazität zieht)

1. **O-2.1 Batch-Re-Pin** (Termin 1.8.-Berg, VORLAUF-45-Rot) → 2. **O-1** (eine
Härtungs-Einheit) → 3. **O-3.1–3.3** (Golden-Matrix + Flake-Wurzel + Sharding) →
4. **O-4 sofort-Teil** → 5. O-2-Rest / O-3.4 → Gates: O-2-Rahmen (einmalig), O-4-Filter,
O-6-Einzelentscheide, O-5 entparken.

## Bau-Status QS-OPT (additiv — nur Fakten, keine Freigaben)

Bau-Agent-Kette 16.7.2026 (Opus), sequenziell, je Einheit eigener PR + armierter Auto-Merge:

- **O-1 Betrieb & Wachhund** — **gebaut, PR #244.** Posten #1 CSP-Fix (entscheidsuche.ch
  in connect-src + Invariant-Tor), #2/#3 Monitor (Prod-Smoke + `check:netz` 6→10 Tore),
  #4 Soft-404 (extensions-basiertes Rewrite, SPA-Deep-Routes unangetastet), #6 LIK-Frische
  (Monitor-Tor), #7 Loader-Fehler-Cache (laden.ts/browse.ts), #8 Zefix/geo-Vertragstests.
  Übersprungen: **#5 Case-Redirect** (fragil in vercel.json — Enumeration/Prerender nötig),
  **#9 /api/fehler** (Mini-Gate: Datenschutz-Wortlaut David).
- **O-3.1 Golden-Matrix Rechen-Blindspot** — **gebaut, PR #247.** 40 Fälle für
  prozesskosten/beurkundung/grundbuchgebuehren/notariatGrundbuch (209→249), verhaltensneutral
  (strikt additiv, 0 Deletions), throw-frei; per-Zelle-Kantonstaffel-Korrektur deferiert
  (Gate-Note). O-3.2 Flake-Wurzel / O-3.3 Sharding / O-3.4 e2e-Masse: **offen** (nächste Kette;
  e2e-Validierungs-lastig, O-3.2 Kollision mit Splitview-e2e-Worktree beachten).
- **O-2 Frische-Automatik** — **NICHT gebaut (O-2-Rahmen-Gate David ausstehend).**
- **O-4 FR/IT** — sofort-Teil (Alias-Tabelle/Chips) **offen** (Alias = Risikopfad-Verifikation
  ~60–80 amtl. Abk.; Chips kollidieren mit Reader-PRs); **DE-Filter-Heben NICHT gebaut
  (O-4-klein-Gate David ausstehend).**
- **O-5 SEO** — geparkt (kein Bau). **O-6 Werkzeuge/Vorlagen** — §0a/Katalog-Gate (kein Bau).

Bau-Agent-Kette 16.7.2026 (Opus, abends — Fortsetzung nach den David-Gate-Freigaben):

**David-Freigaben 16.7.2026 (Auswahl-Dialog, wörtlich protokolliert):**
- **O-2-Rahmen-Gate:** «Ja, voll freigeben» — scheduled Daten-Reparatur-PRs dürfen bei
  grünen Toren unbeaufsichtigt auto-mergen (Prod-Auto-Deploy inkl.); Turso-Schreib-Token
  als CI-Secret freigegeben. Schaltet O-2.1 Batch-Re-Pin für den 1.8.-Berg scharf.
- **O-4-klein-Gate:** «Ja, FR/IT aufnehmen» — der harte de-Filter
  (`scripts/normtext-entscheide.ts:111/133`) fällt; FR/IT-BGer-Originale mit Sprach-Badge.
- **O-1.9:** «Bauen, Wortlaut schlägt Agent vor» — /api/fehler bauen, Datenschutz-Absatz
  als Entwurf (Status entwurf §8, David passt bei Abnahme an).

- **Turso-Schreib-Token** als CI-Secret `TURSO_AUTH_TOKEN` **gesetzt** (`gh secret set`),
  Rahmen freigegeben — schaltet O-2.6 turso-sync + O-2-Reparatur-Auto-Merge scharf.
- **O-2 Frische-Automatik** — **gebaut, PR #259 (Auto-Merge, Gegenprüfung bestanden).**
  `scripts/fedlex-repin-batch.ts` (O-2.1): hebt überholte Bund-Pins in EINEM Lauf auf die
  geltende Konsolidierung (neues kons-Datum + kanonisches html-N via isExemplifiedBy,
  byte-präzise cache.sh-Feld-3/4-Ersetzung); **§7-treu: künftige Fassungen (der 1.8.-Berg)
  werden NIE re-pinnt.** Zwei eigene Workflows (`fedlex-frische.yml` Reparatur-Arm mit
  Auto-Merge-PR + Handschritt-Zettel; `turso-sync.yml` an Daten-Diff + Live-Parität) —
  bewusst getrennt von `normen-monitor.yml`, um die Kollision mit dem O-1-Umbau (#244) zu
  vermeiden. **Live-Befund:** asylv2 fällig (2026-06-12→2026-07-14/html-1, adversarial
  gegen Fedlex bestätigt), chemrrv überholt aber html-N noch nicht publiziert (Handschritt);
  beide behandelt der scheduled Lauf — der PR selbst mutiert den Korpus NICHT (§14.2).
  Gegenprüfung bestanden (unabh. Opus, Fedlex-SPARQL/Filestore). **Offen O-2:** #2.3 BGE-
  Currency-Sonde, #2.4 check:entscheide-netz, #2.5 Kantons-Repair-Pfad, #2.7 Frische-SLA.
- **O-1.9 /api/fehler** — **gebaut, PR #257 (Auto-Merge).** Edge-Fehlerkanal ('self',
  POST-only, ratenbegrenzt, sanitisiert, 3 längenbegrenzte Felder, keine PII/Fingerprinting)
  + Client (`fehlermeldung.ts`, gesampelt 0.25, fire-and-forget, nur pathname) + ErrorBoundary/
  window.onerror-Verdrahtung + VITE_BUILD_ID + Datenschutz-§8-**Entwurf** (David-Wortlaut bei
  Abnahme). Kein Risikopfad → Gegenprüfung n/a. (Löst O-1 #9, in #244 übersprungen.)
- **O-4 Alias-Tabelle FR/IT** — **Bau-Agent (Fork) dispatcht** (normQuery.ts DE↔FR/IT,
  ~60–80 amtl. Abk., Risikopfad-Verifikation + Gegenprüfung); PR folgt. **O-4 DE-Filter-Heben
  + Sprach-Badge + Korpus-Re-Lauf: OFFEN** (heavy: hunderte FR/IT-Fetches über Netz,
  deterministischer Generator-Lauf, Budget aus check:entscheide ggf. Band-Tranchen,
  Gegenprüfung ×3 Sprachen gegen bger.ch) → eigene schwere Bau-Einheit. **FR|IT-Chips im
  Leser: ans Ketten-Ende** (Kollision mit laufenden Reader-PRs).
- **O-3.2 Flake-Wurzel** — separat fortgesetzt (eigener Agent). **O-3.3 Sharding** — OFFEN,
  Vorbedingung Hotfix #248 (ci.yml). **O-3.4 e2e-Masse** — OFFEN.
- **CI-Abhängigkeit:** grünes CI der PRs #257/#259 setzt Hotfix **#248** (bibliothek-check
  S7.3, Auto-Merge offen) auf main voraus — bis dahin `check:bibliothek` vorbestehend rot;
  Auto-Merge greift, sobald #248 landet und die Branches nachgezogen sind.
