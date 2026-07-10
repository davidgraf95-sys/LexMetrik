# ROADMAP — Erledigt-Chronik (Detail-Archiv erledigter Schritte)

> **Angelegt 10.7.2026 (QS-TOK / T7 «ROADMAP-Chronik-Split», Detailquelle `FAHRPLAN-TOKEN-OEKONOMIE.md` §3).**
> Diese Datei nimmt die **Erledigt-Prosa abgeschlossener (`[x]`) Schritte** aus `ROADMAP.md` auf —
> **verschoben, nie zusammengefasst** (kein Retrieval-Verlust; voller Wortlaut erhalten). In
> `ROADMAP.md` bleibt je Schritt: Checkbox + `@meta`-Etikett + Einzeiler + Pointer hierher.
> `ROADMAP.md` ist damit wieder der schlanke Session-Einstieg; hier steht das «Wie es gebaut wurde»
> zum Nachschlagen.
>
> **Nachhalte-Konvention (T7-K, Spec-Pflicht):** Wird ein Schritt künftig erledigt, wandert seine
> Abschluss-Prosa **direkt hierher** (Protokoll-Konvention in `ROADMAP.md` ▶ Ausführungs-Protokoll);
> in `ROADMAP.md` verbleibt sofort nur Einzeiler + Pointer. Der mechanische Re-Akkumulations-Wächter
> gehört in das QS-TOK-T1-Rotations-Skript (noch offen — kein Doku-Umschichtungs-Gegenstand).
>
> Reihenfolge = wie in `ROADMAP.md` (Wellen-Ordnung). Kein Steuerungs-Dokument: es **steuert nicht**,
> es archiviert nur. Der eine Plan bleibt `ROADMAP.md`.

---

<!-- CHRONIK-EINTRAEGE (neue Einträge in ROADMAP-Wellen-Ordnung anhängen) -->

## S0 — Verfallsregister mechanisch *(fristgetrieben, done)*

**Erledigt 28.6.2026 (gebaut + gegated, deployt 2.7.2026):** Parse-Grammatik in eine geteilte
Quelle gezogen (`scripts/verfall-parse.ts`, §5) — `check:verfall` (Tor) und neuer Generator
`gen:verfall` teilen sie. Generator schreibt `src/data/verfallTermine.generated.ts` aus dem
Register; Drift-Tor `check:verfall-ui` in der `check`-Kette. Benannte UI-Fläche: Abschnitt
**«Aktualität & Pflege der Parameter»** auf `/methodik` (`src/components/VerfallUebersicht.tsx`)
listet die 15 datierten Parameter mit nächstem Prüftermin; Tagesbezug (verfallen / bald fällig /
aktuell) client-seitig (prerender-/hydration-sicher). SG-GKV 30.6. erscheint als «bald fällig»,
ab 1.7. «verfallen». `npm run gate` grün, Golden byte-gleich. Deployt 2.7.2026 (a3769d72).

## W1·1 — Begründungs-Absatz *(BEGRUENDUNGS-ABSATZ, done)*

Aus dem Rechen-Ergebnis ein **kopierfertiger, normgestützter Absatz** (UI **und** PDF), jeder Wert
mit Norm+Link+Stand (schliesst die Rückrichtung *Werkzeug→Norm*). **Erst EIN Flaggschiff-
Vertikalschnitt komplett** (Prozesskosten): Ergebnis → Absatz → PDF-Block → Kopier-Hook; dann
Rollout. *Nächster Schritt:* PDF-Block (`pdfModel.ts`) + Kopier-Hook am Prozesskosten-Rechner; die 4
David-Entscheide als **Default-und-Flag** setzen. §8-Rahmung «keine Rechtsberatung».

## W1·2 — Norm↔Werkzeug-Brücke *(RECHTSSAMMLUNG P4/D1, done)*

**Index-Teil erledigt 28.6.2026 (gegated, deployt 2.7.2026).** `werkzeugeFuerNorm` (erlass-granular,
17 Erlasse) benannt + Map `ERLASS_WERKZEUGE` exportiert + Konsistenz-Tor `werkzeuge.test.ts` (kein
stiller Tippfehler → heimlich fehlendes Werkzeug, §8). Anzeige im Reader (KontextPanel «Passende
Werkzeuge») bestand schon; **neu** dezenter «N passende Werkzeuge»-Hinweis auf der Erlass-Karte
(`/gesetze`, Task 4.3). SSoT = Katalog (§5). **Der zweiachsige Startseiten-Einstieg (Rechtsgebiet ×
Aufgabe) ist Schritt 5** (Welle 2) und nutzt denselben Index — kein zweiter Pfad.

## W1·3 — Alltags-Rechner als Cockpits *(neu-Verpackung vorhandener Engines, done)*

**abgearbeitet 28.6.2026:** #2 neu gebaut (Grenzwert-Abgleich); #3 + #4 bestanden bereits
(kein §5-Duplikat gebaut); #1 zurückgestellt (S-5c-Konflikt, Davids Entscheid offen):
- **Fristen-Cockpit** (Vorwärts/Rückwärts/Stillstand) über `fristenspiegel/` + `icsExport`.
  ⚠️ **Zurückgestellt:** kollidiert mit S-5c (10.6.: eigenständiger Fristenspiegel bewusst
  aufgelöst, Ereignisse in Fach-Rechnern). David möchte den eigenständigen Einstieg NICHT
  wieder einführen → nicht gebaut.
- **Streitwert + Grenzwert-Abgleich** ✅ 28.6.2026 (gegated, deployt 2.7.2026): `streitwertGrenzwerte()`
  in `streitwert.ts` ordnet den Verfahrens-Streitwert STRIKT getrennt der ZPO-Verfahrensart
  (Art. 243 I, 30k) und der BGG-Beschwerde-Schwelle (Art. 74 I, 30k/15k Miete-Arbeit) zu; nicht-
  rechenbare Tore (243 II / 74 II / kant. Zuständigkeit / Art. 51–53 BGG) als «selbst prüfen» (§8).
  Schwellen am Snapshot verifiziert (§7). In `StreitwertForm` mit Gebiets-Toggle; Test + visuell.
- **Zuständigkeits-/Verfahrensnavigator** (`zustaendigkeit/straf/schkg`) — ✅ bestand bereits
  vollständig: Rechtsweg-Switcher Zivil/SchKG/Straf, je Weg voller Flow + Hero + Permalink + PDF,
  6 Test-Dateien (inkl. `*Bericht`-Adapter), e2e. Verwaltung bewusst `aktiv:false` (nicht im Scope,
  bräuchte Verifikation). Adress-Ausbau = Schritt 6.
- **Rechtsmittel-/Eintretensprüfung** — ✅ Logik bestand bereits: kantonal `bestimmeRechtsmittel()`
  (Berufung/Beschwerde, Fristen, Art. 314 Familienrecht, Stillstand) + BGG `berechneBgerRechtsweg()`,
  integriert in der Rechtsmittel-Gabelung des Navigators. Eine separate `rechtsmittel.ts` wäre
  §5-Duplikat → bewusst NICHT gebaut.

## W2·5c — Startseite V3 + Branding I2 *(STARTSEITE-V3, done)*

**✅ GEBAUT 3.7.2026 — Bausequenz S1–S5 komplett** (PRs #106 Messaging-SSoT ·
#107 Plumbing · #108 Bugfixes · #111 Neukomposition · S5 Brass-Hero; je Schritt Tore grün,
golden 201 byte-gleich, S4 e2e VOLL 89 passed, S5 Kontrast GEMESSEN hell+dunkel mit 2×
ink-500→ink-600-Ausweich [axe fing den zweiten] + dokumentierter Input-Ruhe-Grenze
[nicht-regressiv]; **Abnahme-Mappe `abnahme/startseite-v3/`** für Davids spätere Sichtung —
kein Druck, Zeitsperre). **Gesetz-/Entscheid-Titel im Zuletzt-Tracker ✅ 3.7.2026**
(Schreibzeit-Auflösung via lazy Manifest-Lader in `lib/zuletztTitel.ts` — dynamic import
erst beim Track-Event per requestIdleCallback+setTimeout-Fallback; Startseiten-/Shell-Chunk
ohne Register-Import [browse-Chunk hash-identisch, +1,1 KB reiner Tracker-Code], Kurzform
Kürzel/Zitierung mit Wortgrenzen-Kappung, Alt-Einträge ohne Titel crash-frei gefiltert;
Playwright-Nachweis OR→«OR», Entscheid→Zitierung, Rechner unverändert). **Rest offen (kein
Blocker):** Doks-Wording «deterministisch statt KI-geschätzt» ✅ nachgezogen (5.7.2026) · Wash-Ton-Veto =
Ein-Klassen-Fallback `bg-surface` in `Hero.tsx`. *Ursprünglicher Auftrag:* Neubau der Einstiegsseite: **modular** (Modul-Registry als FUNDAMENT-Vorleistung),
einfacher Einstieg in alle Funktionen, willkommend + modern OHNE Startup-Look. **Design-Richtung
durch DMAD-Council BINDEND entschieden** (Delegation David): Hybrid «A-Basis + Brass-Hero» als
Schalter-Liste — `bg-brass-100`-Hero mit integrierter Suche als einzige Wärme-Dosis (Fallback
`bg-surface`), KEINE Deko-SVG/Badges/XL-Typo/Gruss-Wort; Schnellrechner VOR den Kacheln;
Favoriten → «Zuletzt verwendet»; Zeiterfassung als Sektion auf `/rechner` (keine neue Route,
`ERWARTETE_ROUTEN` bleibt 57); H1 wird Value Proposition, I2-Messaging-SSoT in `seo.ts` +
neues Tor `check:seo-index`. **Bündelt:** geparkten Startseiten-Merker (30.6.) + I1
Sidebar-Reihenfolge + I2 Branding + W2·5-Startseiten-Modul-Rahmen + Redesign-zurückgestellt
(16.6., Kernideen im Council verwertet). **Bau-Spec (bau-fertig für autonome Opus-Session,
10 verbindliche Auflagen + erzwungene Bausequenz Plumbing→Hero-zuletzt):**
`FAHRPLAN-STARTSEITE-V3.md`; Herleitung + volles Council-Verdikt:
`bibliothek/recherche/startseite-v3-design.md`. **Auflagen-Kern:** Status-Wording §8-ehrlich
(kein «jede Angabe»-Absolutum, kein «geprüfte Bausteine»), Kontrast-MESSUNG vor Merge,
golden byte-gleich, e2e-Anker erhalten, §12-Koordination (tailwind↔W3·14, seo/prerender↔SEO-A11Y,
Topbar/UniversalSuche↔E2-Suche), Pflicht-Screenshot-Serie + Abnahme-Mappe. Trailer `Roadmap: W2·5c`.

## W2·6 / Verweis-Präzision im Entscheid-Leser (Referenz BGE 151 III 377) *(W2·6, QS-GP, done)*

**Teil 1 (Bug, §1-nah):** i.V.m.-Ketten-Verlinkung. Nur das letzte Glied trägt das Kürzel
(«Art. 684 i.V.m. Art. 679 ZGB»); das Kürzel wird jetzt auf die vorangehenden bare Glieder
**propagiert** und jedes einzeln verlinkt — EINE Wahrheit `normVerweiseImText` (`fedlex.ts`),
konsumiert von `NormText` (Inline-Linker) UND der Fundstellensuche. §1-Vorsicht: Propagation
NUR über echte Konnektoren (i.V.m./in Verbindung mit/und/sowie/Komma) auf bare Glieder; bricht
an Semikolon/BGE-Zitat/Satzgrenze/fremdem Kürzel; «f./ff.»+Abs./lit. brechen nicht; Anzeige
zeichenidentisch (Auflösungsziel synthetisiert). Doppelt verifiziert: 342 Snapshots, **890
propagierte Glieder / 686 Blöcke** (19870→20760 Links), 8 Handproben §1-korrekt.
**Teil 2 (Feature):** (a) Erwägungs-Anker (`e-2-4`, marke-basiert, schon vorhanden) +
Deep-Link-Scroll nach on-demand-Laden; (b) **Zitierte-Normen-Chips im Kopf → Sprung zur ersten
Erwägung mit Fundstelle** (`ersteFundstelle`, gleiche Ketten-Logik → «Art. 679 ZGB»-Chip trifft
die «Art. 684 i.V.m. Art. 679 ZGB»-Stelle in **E. 2.3.1**), lc-ziel-blink-Highlight, Regeste-
Fallback. Tore grün (golden 201, tsc/lint/3127 Tests inkl. neuer Units, `check:entscheide`/
`check:struktur-konsistenz`, Playwright), Snapshots unberührt (additiv).

## W2·6 / BGE-Auszug abgeschnitten — vollständig gefixt (34/34) *(W2·6-BGE, Inhaltsverlust, done)*

29.6.2026 GEFIXT + verifiziert (gate/golden byte-gleich, zwei adversariale Gegenprüfungen
gegen amtliche Quelle; die 1. fand einen Schutz-Tor-Blindfleck — Regex verlangte einen
Buchstaben vor U+2026 und übersah 5 auf Space/Punkt/Ziffer endende Kappungen → Regex auf
`(?<!\()…\s*$` geweitet, 5 nachgezogen, 2. Pass bestätigt). Die Default-«Auszug»-Ansicht der BGE-Leitentscheide schnitt Erwägungen
>5000 Z. **still mitten im Wort** ab (U+2026): `holeBgeLeitentscheid` lud — anders als der
Urteils-Body — den OCL-`/structure`-Auszug nicht voll nach (Datenfehler, nicht CSS).
**Fix** (`scripts/normtext/adapter-entscheide.ts`): geteilter Helfer `fuelleGekappteErwaegungen`
lädt gekappte Erwägungen (`holeErwaegung`) in BEIDEN Pfaden voll nach (Trigger: `text_chars
≥4900` ODER Ellipsis-Ende); **Id-Disambiguierung** gegen die präfixunscharfe OCL-Keyed-Lookup:
mehrere Id-Formen probieren (`151_V_1` · `151 V 1` · `bge_BGE_151_V_1`), nur die EXAKT passende
Entscheidung nehmen, Struktur über die kanonische `decision_id` holen.
**Regenerierung** ohne Vollbau via neuem Flag `npm run entscheide -- --additiv --bge-refresh`
(zieht nur die aktuell gekappten BGE neu, by-id-Überschreib; Bund/Kanton/eidg unberührt,
§7 kein Hand-Edit). **Schutz-Tor** in `check:entscheide`: Block, der auf U+2026 endet
(`(?<!\()…\s*$` — ausser amtl. «(…)»), ist ein gekapptes Excerpt → FEHLER/exit 1; deckt
`abschnitte` + `auszugAbschnitte`. **Ergebnis:** ALLE 34 BGE regeneriert + voll, gate/golden
byte-gleich, `check:entscheide` 0 Kappungen. **Öffnet keinen 26×-Slot.**

**Rest 30.6.2026 geschlossen** — `bge_151_V_1`/`bge_151_V_30` (kurze Seiten-Ids, deren
`/decisions/151_V_1` präfixunscharf auf `151_V_194` matchte) jetzt über die Id-Disambiguierung
(`151 V 1` bzw. `bge_BGE_151_V_1` lösen eindeutig auf, ref=`BGE 151 V 1`) sauber re-gefetcht —
kein Hand-Edit (§7). WARN-Quarantäne wieder entfernt, Tor ist reines FEHLER.

## W2·6a-MAT — Materialien-Verzahnung Stufe 1 *(DATA+UI, done)*

Verwaltungsverordnungen/Wegleitungen als Kanten am Norm-Artikel (David 3.7.: «SECO für ArG, EDÖB für DSG, ESTV für MWSTG»),
E6a Stufe 1 = NUR Verweis-/Register-Ebene (Index-Karte + Norm-Mapping + amtlicher Link, §7 a–d
korrekt gemappt inkl. sichtbarem Live-Link-Beweis, KEIN Volltext). **4 POC-bewiesene Quellen:**
ESTV-MWST (artikelscharf via Fedlex-#art_N-Anker, ToC-Hash-Drift-Arbiter) · SECO ArG/ArGV 1
(artikelscharf via Payload/Dateiname) · EDÖB Leitfäden (Erlass-Ebene ehrlich; VBGÖ gestrichen —
nicht im Korpus) · ESTV KS/RS (Suffix-Kaskade; Seiten-Fallback ehrlich `quelle='maschinell'`).
**Revisions-Invariante:** Cutoff-Tabelle je Erlass (revDSG/MWSTG-Teilrev) — artikelscharfe Kante
nur bei Dokument-Stand ≥ Cutoff, sonst Downgrade Erlass-Ebene; UI sagt «verweist auf … (Stand des
Dokuments)». SSoT `daten/soft-law.db` (gitignored) + **committeter Zustandsträger**
`bibliothek/register/soft-law-zustand.jsonl` (append-only; Entlistetes nie löschen, aus Projektionen
raus) → deterministische Projektion `public/materialien/kanten/<ERLASS>[/<bucket>].json`
(Kanten je (Dokument, Artikel) aggregiert, Bucket-Split ab M0, Weiche C = Rebuild aus
Manifest+Snapshot). Kanten im §3.2-Schema (zitat_key/roh_zitat/konfidenz; quelle-Enum +'amtlich').
Etappen M0 Fundament (check:materialien-NEUBAU) → M1–M4 Adapter (je PR = Prod-sichtbarer
Content-Release in Suche+Browse; browserlos, Drift in normen-monitor.yml) → **M5 UI-Delta GATED
auf V1a-Merge** (dep W2·7-VZUI, nur Etappe M5; BESTEHENDE Materialien-Gruppe, `VerzahnungsKante`
ziel.typ 'verwaltungsverordnung', StatusBadge 'nur-verweis' als bewusster V3-Vorzug; kein
Registry-Refactor). **M1 (ESTV-MWST) gated auf Davids robots-Freigabe Q1 (Fahrplan §8)**; M0/M2–M4
ohne Blocker sofort baubar. Tore: `check:materialien` (Neubau, +Wortfeld+Cutoff+Entlistungs-Quote) ·
`check:materialien-netz` (+normen-monitor.yml-Step) · gegenpruefung-Globs NEU `scripts/materialien/**`
· `gen:zaehler`. Stufe 2 benannt (BSV nach POC, FINMA/SEM nein, PDF-Volltext-Kanten nein). Kein
26×-Bezug — parallel zu E3/VPS fahrbar. Aufwand ehrlich ~7–10 Tage.
**Detailquelle:** `FAHRPLAN-MATERIALIEN-VERZAHNUNG.md` (§0 = Kritik-Einarbeitung, §8 = der eine
offene David-Punkt robots Q1). **Stand 4.7.2026: M0 ✅ (#126) · M2 SECO ✅ (#127) · M3 EDÖB ✅
(#128, 10 Dok DSG/BGÖ) · M4 ESTV-KS ✅ (90 Dok, 121 Kanten DBG/VSTG/STG) · M1 ESTV-MWST ✅
(robots-Freigabe David 4.7.2026 im Chat; 48 Dok MI+MBI, 3375 Roh-/1739 aggregierte Kanten
MWSTG/MWSTV, 1417 artikelscharf, 1186 Cutoff-Downgrades, MWSTG-Bucket-Split real,
§2.4-Revisions-Listen doppelt erhoben; Gegenprüfung 2 Durchgänge — D1 fand Anker-Drop
durch Fundstellen-Merge, gefixt via Teil-Kontext + Disambiguierung) · **M5 UI-Delta ✅ 4.7.2026**
(async `kontextSoftLaw`-Loader Shard/Buckets, «Amtliche Materialien»-Gruppe sync+async gemerged
mit Fundstellen-Sublabel «via Art. N u. a.»/Stand + Staleness §2.4 + «maschinell»-Badge; `StatusBadge
'nur-verweis'` als V3-Vorzug auf der MaterialLeser-Karte; `gen:zaehler` +Materialien-Zähler [326] +
Startseiten-Kachel; kuratierter Nachtrag als in-Bundle-Artikel-Anker STATT DB-Migration [DATABREACH→
Art. 24 DSG, KS 6a→Art. 65 DBG, DSFA §2.4-Downgrade — 3/3 gegen Live-Fedlex CONFIRMED]; 10 Unit + 3
e2e grün, CLS 0 auf OR/Startseite). **6a-MAT komplett (M0–M5).**

## W2·7 — Verzahnungs-Klingen *(done)*

**GEBAUT 5.7.2026** (Worktree `feat/w27-verzahnungs-klingen`, Dossier
`bibliothek/recherche/verzahnungs-klingen-w27.md`, STRUKTUR-Karte 5.7.). **(a) Verjährungs-/
Gewährleistungs-Board** (`/rechner/verjaehrung-board`): `verjaehrung.ts`-Regime-Matrix +
Gewährleistungs-Sonderfall + AT-Brücke; CISG nur Link. **(b) Verzugszins-/Forderungs-/Inkasso-
Strecke** (`/rechner/inkasso-strecke`): stateless Reverse-Reader Verzug→Verzugszins→Mahnung→
Betreibung→Fristen. **(c) Gerichts-Baustein-Set**: amtlicher Zitierer BGE/BGer
(`/rechner/gerichtszitat`, `gerichtszitat.ts`) + Rubrum-Vorlage (`/vorlagen/rubrum`, Art. 238
ZPO/112 BGG live verifiziert + gegengeprüft bestanden). Reine Darstellung auf bestehenden Engines
(§3); Golden 201 unverändert (+8 additiv), Gate grün, e2e 163, Gegenprüfung bestanden.

## W3·14-Responsive-Audit — Bildschirm-/Responsive-Audit *(SPLIT-VIEW, done)*

**ein** `ultracode`-Workflow — **AUDIT GEFAHREN 5.7.2026 (rein lesend, PR `chore/responsive-audit`):
30 Motive × 5 Breiten (390/768/1280/1536/2560) = 150 Aufnahmen; 0 Seiten-Overflow, 0 Konsolenfehler;
12 Defekte geflaggt (1 hoch: Vorschau-Knopf im Vertragstyp-Raster @390 · 2 mittel: Header-Tap-Ziele
<44px @390, methodik-Einzelspalte @2560 · 9 niedrig, 2 davon «manuell verifizieren»). Befund +
Anleitung `abnahme/responsive-audit/BERICHT.md`; Fixes = spätere Schritt-14-Einheiten.**

*Ursprüngliche Bau-Anweisung (Plan):* fotografiert **Seiten × Breakpoints** (Handy hoch ~390 ·
Tablet ~768 · Laptop ~1280 · Desktop ~1536 · Ultrawide ~2560) und flaggt Layout/Umbruch/**Tabellen-
Overflow** (maschinell je `<table>`/Pane über `scrollWidth>clientWidth`, deterministisch §2).
**Werkzeug zuerst prüfen (§5/§10): auf dem bestehenden Playwright-bash-Harness `scripts/screenshots.ts`
aufsetzen** — Playwright-Start, Motiv→Route, Arg-Parsing und ehrliches FEHLT-Logging (§8) sind dort
schon da; nur die Breitenliste (heute 360/768/1280) auf die fünf erweitern und die Seitenmenge
ergänzen, **nicht** neu erfinden. **NICHT** der Playwright-MCP (Bash-Lektion 22.6.); Playwright ist
bereits Dependency. **Aufruf** (kontextlos lauffähig): `npm run preview -- --port 4321 --strictPort`,
dann `npx vite-node scripts/screenshots.ts -- --base-url http://localhost:4321 --out
abnahme/responsive-audit/ist-<sha7>` — neuer Ausgabe-Pfad ⇒ eine `.gitignore`-Zeile
`abnahme/responsive-audit/` ergänzen, Binär-PNGs nie committen (§6). **Rein lesend:** berührt selbst
keine §12-Kollisionsdatei und kein Golden-/Logik-Tor (§6), Status-Modell unberührt (§8), kein Deploy
ohne Davids Ja (§9); Befund = Screenshot-Mappe + Defektliste, **rein visuell verifizierbar, keine
Davids-Fachzeit**. **Kein eigener Strang — gehört in Schritt 14** (dasselbe Breakpoint-/Container-
Query-Subsystem), denn die aus dem Audit folgenden Fixes treffen **dieselben §12-Kollisionsdateien wie
Schritt 14** → **im selben Worktree wie Strang B, nie als paralleler Strang** (kein 26×-Bezug).
