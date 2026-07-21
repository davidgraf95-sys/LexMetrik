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
>
> **Konventions-Erweiterung (Entscheid David 22.7.2026):** Auch **datierte ✅-Teilerfolgs-Prosa
> aus noch OFFENEN (`[ ]`) Schritten** wandert hierher (wörtlich, nie zusammengefasst); im Plan
> bleibt je Teilerfolg ein ✅-Einzeiler + Pointer. **Im Plan bleiben vollständig:** Status-
> Korrekturen, Bau-Warnungen («vor Bau-Start nachmessen»), offene Restposten und alles, was
> künftige Bau-Entscheide steuert. Beweis der Steuerungs-Neutralität je Umschichtung:
> `npm run plan:next` byte-identisch vorher/nachher + `check:plan` grün.

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

## W2·5d — Gesetzes-UX: Teilerfolge G0–G6 + Anmerkungs-Welle A1–A18 *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  **Stand 4.7.2026:** **G0** (Grundart-Register/`check:grundart`) **und G1**
  (Linien-Kanon 3 Rollen-Tokens + `max-w-reading` + Einzug-Skala/Mobil-Kollaps +
  `hyphens:manual` + Randtitel-Hänge-Einzug; Tore R1 `check:linien-kanon` /
  R2 eslint / R4·R5 e2e; Reglement-Falt in `DESIGN-REGLEMENT-NORMTEXT.md §4b`;
  Wortlaut + Engine-Golden byte-gleich) **gebaut**. **G2a** (Leser-Options-Leiste
  Linien/Fussnoten/Verweise als reine `data-*`/CSS-Toggles am `<html>`,
  localStorage + Pre-Paint via `main.tsx` CSP-konform ohne Inline-Script;
  `leserOptionen.ts` + `LeserOptionenLeiste.tsx`; R6 golden byte-gleich bewiesen
  [`golden:vergleich` IDENTISCH 201], R9 Fussnoten-«AUS» dämpft/versteckt nie
  [e2e]; global = beide Reader-Instanzen synchron ohne Re-Render §15) **gebaut**.
  Bewusste G2a-Grenze: Linien-Default global AN (grundart-abhängiger Default =
  G2b, `grundart` nicht auf `BrowseErlass`); Fussnoten-Options-Toggle koexistiert
  mit dem bestehenden Apparat-Schalter (Unifizierung = G2b Kopf-Zusammenführung).
  Nächste Etappe **G2b** (Kopf-Merge/Fussnoten-Render-Fix/Sticky-Kontextkopf).
  R5-Mobil offengelegt auf ~30ch statt aspirativ 40ch (physikalisch gedeckelt
  @390, s. FAHRPLAN + Spec-Kommentar). **G4** (Einstieg /gesetze + Cmd/Ctrl-K,
  eigener Worktree, kollisionsarm) **gebaut**: (a) Landeplatz löst die Dreifach-
  Redundanz auf — drei gleichwertige Einstiegskacheln mit Live-Statistik statt
  stillem Bund-Default, neutrale Overline, Segment/Tab-Panel erst NACH Säulen-Wahl
  (`?ebene=`); alte Deep-Links (`?ebene=`/`?kt=`/`#sys-`/`?q=`) bleiben erreichbar.
  (b) Globale **Befehls-/Sprung-Palette** (`Cmd/Ctrl-K` + Mobil-Knopf in der Topbar)
  mit deterministischem **Norm-Query-Parser** (`src/lib/suche/normQuery.ts`):
  «OR 257d»/«Art. 5 AIG»/«ZGB 684 II»/«VMWG»/Kanton mit Code «StG AI 5» →
  `#art-<token>`-Deep-Link in ≤2 Interaktionen; Token-Ableitung kongruent
  passus.ts (257d→257_d, 49abis→49_a_bis), KEIN neuer Index (sitzt auf dem
  Browse-Manifest), Freitext → normale Suche (kein Fehl-Sprung). Lazy (§15, kein
  Eager-Load im Erst-Paint), a11y role="dialog"/Fokus-Falle/Esc via `useDialogFokus`.
  29 Unit-Akzeptanztests (`normQuery.test.ts`), 6 e2e (`befehlspalette.e2e.ts`);
  golden byte-gleich (kein Normtext/Engine); `gegenpruefung: n/a — reine UI`.
  **G5** (Kantons-Seite entrümpelt, eigener Worktree, kollisionsarm) **gebaut**:
  Kontext-Zeile Mengen-Asymmetrie (§8) · Sicht-Umschalter **Karte | Liste**
  (Karte default sichtbar statt zugeklapptem `<details>`) · Sortierung
  **Alphabet/Erlass-Zahl/Region** (Region = BFS-Grossregionen `grossregionen.ts`) ·
  Ordnung vereinheitlicht (Sidebar-Kantone alphabetisch nach Vollname statt föderal,
  `navigation.ts`) · Roh-Code→Klartext (Sammlungs-Kürzel-Buckets «LS»/«bGS» → ein
  ehrlicher «Nicht systematisiert»-Block statt «Bereich LS», Roh-Code bleibt je
  Erlass an der Nummer) · Mobil-Vollnamen (kein `truncate`, wrap). Reine Darstellung
  (§3), kein Risiko-Pfad im Diff → `gegenpruefung: n/a`; golden `golden:vergleich`
  IDENTISCH; 8 Unit (`grossregionen`/`navigation`) + 6 e2e (`gesetze-kanton-g5`),
  volle Suite 139 grün.
  **G2b** (Kopf-Merge `ErlassLeserKopf` + Fussnoten-Unifizierung + Sticky-Section-
  Kontextkopf + «Zitat kopieren», eigener Worktree) **gebaut** (s. STRUKTUR-Karte).
  **G3a** (Per-Grundart-Darstellung, Worktree `feat/gesetzes-ux-g3a`) **gebaut
  (5.7.2026):** Laufzeit-Grundart aus `GRUNDART_SEED` via `grundartMeta()` in der
  Darstellungsschicht (`helpers.tsx`, §5 — kantonale Erlasse stehen nicht im
  `ERLASS_REGISTER`, darum Seed als SSoT; **kein Risiko-Pfad im Diff**). **erlassTyp-
  Kopf-Label** (`kopfOverline`): 103 Verordnungen heissen jetzt «Verordnung» statt
  «Bundesgesetz», BV «Bundesverfassung», 18 Staatsverträge «Staatsvertrag», Kanton
  «Kanton XX · Gesetz|Verordnung». **⑥ KANTON §-Label:** «§ N» steht schon im
  Snapshot-`artikelLabel` → `bestimmungsEtikett` steuert nur das Kopf-Zähl-Substantiv
  «N Paragraphen» (775 §-Kantone); Anker bleibt **überall** `art-<token>` (R8, e2e).
  **⑤ Staatsvertrag** Präambel (bereits `ErlassKopfBlock`) + Label; **⑦ PDF-Rahmen**
  `border-rule-struktur`; **⑧ LIVE_VERWEIS** ehrliche Verweiskarte statt Fehlerseite
  (amtlicher Live-Link + Stand + §8-Hinweis) für die 9 `nur-live-link`-Erlasse; **④**
  Kurzerlass-Lesespalte lag durch G1 schon auf `max-w-reading`. **K11 umgesetzt**
  (grundart-abhängiger Linien-Default): Tri-State `data-linien:auto` + `data-grundart`
  am `.lc-leser` — nur KODIFIKATION zeigt den Guide im Default, expliziter Klick
  übersteuert; CLS 0. **Nebenfix:** Options-Switch OFF-Zustand `text-ink-500`→
  `text-ink-600` (WCAG 4.47→~6.7:1, latenter G2a-a11y-Bug, durch K11-Default-OFF
  aufgedeckt). Reine Darstellung (§3) → **`gegenpruefung: n/a`**; `golden:vergleich`
  IDENTISCH (201) + Prosa-Byte-Beweis ZGB/OR/VMWG/BV/AG-Kanton gegen `origin/main`;
  `check:grundart`/`check:linien-kanon`/`check:normtext`/`check:struktur-konsistenz`
  grün; neuer e2e `gesetze-ux-g3a` (6) + a11y/leser-Specs grün.
  **G6** (Rechtsgebiets-Sicht «Gerüst», Worktree `feat/gesetzes-ux-g6`,
  kollisionsarm) **gebaut (5.7.2026):** zweite, achsen-orthogonale Gliederung über
  eine vierte Landeplatz-Tür (`?ansicht=rechtsgebiet`) in `src/pages/Gesetze.tsx` —
  (a) **Auto-Grundgerüst** aus der vorhandenen `rechtsgebiet`-Achse (7 GEBIETE,
  aufklappbar, deckt JEDEN Bund-Erlass) + (b) **Querschnitts-Delta**: 8 kuratierte
  Praxisfelder (Arbeit / Miete & Pacht / Vertrag & Haftung / Gesellschaft & Handel /
  Familie & Erbrecht / Sachenrecht & Grundeigentum / Zwangsvollstreckung / Steuern &
  Abgaben) in `src/lib/normtext/rechtsgebiet-thema.ts` (SSoT — **kein** dupliziertes
  Register-Feld `rechtsgebietThema`, Abweichung von Spec §5.1 offengelegt, §5), enge
  Norm-Verankerung mit funktionierendem Deep-Link (OR Art. 319–362 → `#art-319`,
  Anker bleibt `art-<token>`, K2/R8) + je Thema **Verzahnung** (Rechner-Slug +
  `/rechtsprechung?rg=`) + `status: entwurf` (§8, K8). **Tolerantes Tor**
  `src/tests/rechtsgebiet-thema.test.ts`: Mitglieder-/Werkzeug-Slugs müssen
  existieren, 6–8 Themen, §7-Beleg je Zeile; Abdeckung wird beziffert (40/229
  Bund-Erlasse thematisiert), «unzugeordnet» ist zulässig (nie rot). Reine
  Darstellung/Klassifikation (§3); `golden:vergleich` IDENTISCH (201); neuer e2e
  `gesetze-rechtsgebiet-g6` (2) + Landeplatz-/Kanton-Regressionen grün; Visual-Review
  Desktop 1440 + Mobil 390 (0 Overflow). **Vollkuration bleibt späterer Strang**
  (nach Abnahme-Zeitsperre). **G3b Schritt 1 · Kanton-Tarif-Tabellen Stufe 2, Klasse A+D
  (Risiko-Pfad, 5.7.2026) gebaut:** die bereits extrahierten ·/—-Kanton-Tabellen
  (NW-265.51, BS-154.810, BS-291.400, SO-614.11, VS-173.8-de+fr; 32 Blöcke) vom
  Legacy-`{kopf,zeilen}` aufs kanonische typisierte `{spalten:[{typ,titel}],zeilen}`-
  Modell (T-B1/T-B4) nachgezogen → typgesteuerte Ausrichtung + Klasse-D-Tausender-
  gruppierung NUR in betrag/zahl/bereich (T-C5). Behebt einen §7-Faithfulness-Bug
  des Legacy-Renderers (globales `gruppiereTausender` verunstaltete Zitat-Jahre:
  «1937»→«1'937» in BS-154.810 Verfahrens-Spalten). Deterministischer Spalten-Typer
  `typisiereSpalten` (Prosa/Position→text, Staffel→bereich, Betrag→betrag, Satz/%→zahl,
  ziffernloses Einzelwort «gebührenfrei»→betrags-kompatibel); Werte (`zeilen`)
  byte-gleich (nur Typ-Metadaten+`sha` neu). Offline-Re-Projektion über den
  generator-eigenen Typer+`sha256Bloecke` (kein LexWork-Refetch → 0 Fremd-Drift).
  `check:gegenpruefung` **bestanden** (unabhängiger Opus-Pass gegen LexWork-APIs
  NW/BS/SO/VS, alle Stichproben byte-exakt, 0 Zeile verloren). Tore
  golden/tsc/vitest/lint/check:tabellen/paritaet/normtext grün, e2e 12/12; Visual
  Desktop+Mobil (0 Overflow @390). Zusatz: e2e-Flake `gesetze.e2e.ts` (OR
  fill-Timeout) gehärtet (Scroll-Spy/Suche-Kontrakt auf VGKE seitengrössen-
  unabhängig, App-Ready-Wait; 6× CPU-Throttle-Probe 5/5). **G3b Schritt 2 ·
  Anhang-Block-Rendering ③/⑤ (reine Darstellung, 5.7.2026) gebaut:** Anhänge
  (`annex_*`) + Staatsvertrags-Protokolle (`lvl_*`, LugÜ) rendern jetzt als
  eigenständig erkennbare, klar abgesetzte Blöcke (Struktur-Trenner + «Anhang N»/
  «Protokoll N» als Struktur-Überschrift, `data-anhang`; Anker bleibt `#art-`/R8;
  Ziffer-Zwischentitel via bestehendem `titel`-Block/M13). **LugÜ-Mobil-Overflow
  (scrollW 790 @390) gefixt** — Ursache war empirisch NICHT die Tabelle (die
  scrollt im `overflow-x-auto`-Container), sondern der `shrink-0`-Bereich-Badge der
  Anhang-Sektion (Lang-Labels 770px) → für Anhang-Sektionen unterdrückt + generisch
  umbruchfähig. Mehrspalten-Tabellen: `lc-scroll-x` + `min-w-full w-max` → breite
  Tabellen scrollen seitlich statt Zellen zu zerquetschen. **`gegenpruefung: n/a`
  literal** (nur `src/pages/gesetz-leser/**` + `ArtikelBody.tsx` + e2e — keine
  Risiko-Datei). Wortlaut-Byte-Beweis GSchV/ChemRRV/LugÜ/ZGB byte-identisch gegen
  `origin/main`; voller `gate` grün; e2e 1 Worker grün + neuer Spec
  `gesetze-ux-g3b-anhang` (5); Visual Desktop 1440 + Mobil 390 (0 Overflow @390).
  Trailer `Roadmap: W2·5d`.
  **G3b Schritt 2 (Tarif-Strang) · Klasse B (verklebte Zahlen, 5.7.2026,
  parallel zur Anhang-Einheit) fertig:** die x-koordinaten-rekonstruierten
  Streitwert-Staffeln ZH-215.3 §4, ZH-211.11 §3+§4 (zhlex-PDF) sowie ZG-163.4 §3,
  TG-176.31 §5 (LexWork-·/—) aufs kanonische `spalten`-Modell nachgezogen (5
  Tabellen / 44 Zeilen; `zeilen` byte-gleich). **Befund (§7, wie Schritt 1):** die
  x-Spaltenrekonstruktion war für ZH bereits committet (Commits e17793e8/559b1d9a),
  ZG/TG kommen vor-gespalten aus den LexWork-Zellen — kein NEUer Extraktions-Code
  nötig; der ZH-Adapter emittiert die Staffel jetzt kanonisch (kein Legacy-Regress).
  Verkleben-Befunde `100001250`=`10 000`|`1'250` und `5000250`=`5 000`|`250`
  x-getrennt verifiziert. `check:gegenpruefung` **bestanden** (unabhängiger Opus,
  44 Zeilen gegen zhlex-PDF via pdfplumber + LexWork-xhtml; Konkatenation==Roh,
  0 verloren/erfunden/geändert). Tore golden/tsc/vitest/lint/check:tabellen/
  paritaet grün, e2e 158; Visual ZH-215.3 §4 + ZH-211.11 §4 Desktop+Mobil (Tabelle
  scrollt im Container, 0 Page-Overflow @390, Tausender-Apostroph korrekt).
  **G3b Schritt 3 (Tarif-Strang) · Klasse C (SG-Füllpunkt-Rest, 5.7.2026) fertig —
  G3b KOMPLETT (A+B+C+D):** Diagnose der 159 nicht erfassten SG-Blöcke (SG-3849 135/
  SG-2935 20/SG-2808 4) = **kein** Block-Grenzen-Problem, sondern der **DEFECT-1-Guard**
  (Block als Plaintext gedroppt, sobald das letzte Leader-Segment nach dem Betrag noch
  angeklebten Folge-Inhalt trug — nächste Position/Überschrift/Folge-Artikel/Seitenzahl).
  Fix §1-konservativ: DEFECT-1 → **`nachtext`** (saubere Leader-Zeilen tableisiert, trailing
  Rest verlustfrei als Folge-Textblock; **Konkatenations-Invariante** als Unit-Test).
  Mehrdeutiges bleibt Text (mittleres Segment ohne Betrag, eingebetteter No-Leader-Betrag,
  No-Dash). **127 Einträge → +127 Tabellen** (SG-3849 110/SG-2935 15/SG-2808 2), **32 §1-
  konservativ Plaintext** (14 eingebettete Beträge + 18 Nicht-Tarif-Füllpunkte, unverändert
  zu HEAD). **Blast-Radius bewiesen SG-only** (0 Fremd-Kanton neu tableisiert; AUSSCHLUSS
  BL/FR unberührt). Klasse D für SG-`tabelle` durch bestehenden `TarifTabelle`-Renderer
  gedeckt (`gruppiereTausender` → `4'000`/`15'000`). Offline-Nachzug `kanton-fuellpunkt-
  nachzug.ts` (exakte produktive `reichereTabellen`, kein PDF-Refetch → 0 Drift); leader-
  freier Inhalt aller 728 SG-Einträge byte-identisch HEAD↔regeneriert. `check:gegenpruefung`
  **bestanden** (unabhängiger Opus, neue Tabellen zeichenweise gegen SG-PDFs via pdfplumber).
  Tore golden `IDENTISCH`/tsc/vitest/lint/check:tabellen/paritaet/normtext/struktur-konsistenz
  grün, e2e 163/163; Visual SG Desktop 1200 + Mobil 390 (0 Overflow @390, Apostroph korrekt).
  `ArtikelBody`/Reader unberührt (TABU). Detail: `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`.
  **Stand 5.7.: G0–G6 ✅ gemergt** (#132/#135/#136/#141/#143/#145/#147/#148/#149,
  golden byte-gleich). **Anmerkungs-Welle A1–A18 (David 5.7., Go erteilt im Chat
  «run till dry»; Wortlaut-Quelle `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-05.md`,
  Bau-Spec `FAHRPLAN-GESETZES-UX.md` §10):** revidiert die GEMERGTEN Etappen —
  **U-LINIEN ✅ gebaut** (PR `feat/u-linien-a8`: Linien-Default aufbau-basiert statt
  grundart-Kategorie — SSoT `linienAufbau.ts`, Schwellen empirisch aus 1135 Sidecars,
  Reglement §4b-A, Tor `check:linien-kanon` = R1/R4-Nachfolger; ZGB ruhig, ArG
  sichtbar; Wortlaut/Golden byte-gleich) → **U-KOPF ✅ gebaut** (PR
  `feat/u-kopf-a1-a3-a4`, Auto-Merge armiert; Ausführungsvermerk §10.7): A1
  Fussnoten-AUS = VERSCHWINDEN (display:none, überstimmt R9 — David-Entscheid;
  Normtext bleibt durchsuchbar, Print folgt Toggle, CLS 0) · A3 Positions-Leiste =
  echte klickbare Breadcrumbs (nav/ol/li, aria-current, springeZuSektion) · A4
  «Ansicht»-Dropdown im Kopf (`LeserAnsichtMenu`, ehrliche Disclosure + useDialog-
  Fokus; Chip-Leiste entfällt); P1 golden-ändernd (Kopf-Markup), Artikel-Prosa
  byte-gleich; Gate + e2e (inkl. neuer A9-Throttle `leser-kopf-a9`) grün →
  **U-VERWEIS ✅ gebaut (10.7., PR `feat/u-verweis-a7-a10-a11-a13`;
  Ausführungsvermerk §10.7):** A10 Plural-Linker `artikelnPluralVerweise`
  (MWSTG Art. 5 = GENAU 5 Links art_31/35/37/38/45; bounded, §1-Unterdrückungs-
  Regeln BGSA/Code-civil/42octies; Korpus 2091 Regionen/5187 Glieder) · A11
  Präambel-Verweise (kuratierte Genitiv-Map «der Bundesverfassung»→BV, 26 belegte
  Einträge + **aBV-Schutz**: Ingress-Linkung nur Erlassdatum ≥ 2000) · A7
  Verweis-Popover strukturiert (Wortlaut → Provenienz → Massgebliche Entscheide →
  abgetrennt Amtliche Materialien; `VerweisKontext`, geteilte Shards, Top-3+Zähler,
  CLS 0 by construction) · A13 Materialien-Kanten klarer (artikelscharf prominent,
  Erlass-Ebene hinter `<details>`-Zähler). Reglement §5a; Gate voll grün, Engine-
  Golden byte-gleich, e2e 188/188 inkl. `verweis-u` (A9-Throttle) →**
  **U-POSITION ✅ gebaut (11.7., PR `feat/u-position-a2-a16-a17`;
  Ausführungsvermerk §10.7):** A2 inhalts-proportionale content-visibility-
  Platzhalterhöhe (`schaetzeArtikelHoehe`, überschreibt den Flach-320px →
  proportionaler Scrollbalken, content-visibility bleibt = kein Logikverlust) ·
  A16 anker-basierte Scroll-Restoration (`scrollAnker.ts`, oberster Artikel +
  Offset, element-basiert robust gegen die Höhenschätzung; interne Verweise
  navigieren über den Router = echter History-Eintrag; NormPopover «Im Gesetz
  öffnen» SPA-`<Link>` → Cross-Erlass-Zurück landet am Ausgangs-Artikel) · A17
  Split-View liest den Pane-lokalen Hash/`?norm` ⇒ Norm-⧉ öffnet an Art.+Passus,
  Entscheid-⧉ an der Erwägung (nie stumm falsch). Golden byte-gleich (Client-
  Reader; kein `public/normtext`), Gate voll grün, e2e `leser-position-u` (P4 +
  A9-Throttle CLS 0). Parallel kollisionsarm:
  **U-SUCHE ✅ AUSGEFÜHRT (5.7., PR feat/u-suche-a5-a6, Auto-Merge armiert;
  Ausführungsvermerk `FAHRPLAN-GESETZES-UX.md` §10.7):** normQuery aus der
  gelöschten `BefehlsPalette` in die NORMALE Suchleiste (Sprung = oberster
  Treffer, Enter springt), Palette entfällt, ⌘K/«/» fokussieren die HeaderSuche;
  A6-Relevanz-Gruppierung (Rechtsinhalte vor Werkzeugen); KEIN Zweit-Index; Gate
  + e2e grün, `Gegenpruefung: n/a` · U-UEBERSICHT (A14/A15: Titel umbrechen statt kappen,
  Relevanz-Sortierung dokumentiert-deterministisch, Gliederungs-Umschalter
  Relevanz/Systematisch/Rechtsgebiet auf allen 3 Säulen; G6 = Modus statt vierte
  Tür) · **U-PDF ✅ AUSGEFÜHRT (11.7., PR `feat/u-pdf-a12`, Auto-Merge armiert;
  Ausführungsvermerk `FAHRPLAN-GESETZES-UX.md` §10.7):** Download = amtliches PDF
  der gepinnten Fassung (Bund Fedlex-`isExemplifiedBy` build-time — Suffix-Falle `-2`
  durch exakte URL statt Konstruktion gelöst, 227/227; Kanton LexWork bei Versions-
  Gleichstand, 1184/1231; Staatsvertrag self-hosted; render-eigenes `.txt` entfernt,
  §10.5); neues Tor `check:pdf-quellen` bindet die PDF-URL an die `fedlex-cache.sh`-
  Pins; `Gegenpruefung: bestanden` (P5-Stichprobe 12, Fassungsdatum-im-PDF-Beweis
  inkl. `-2`). **Damit ist die kollisionsarme A1–A18-Welle gebaut; offen nur das in
  CI laufende U-POSITION (A2/A16/A17).** A18 (BGE-Regeste nach Sprachen) → W2·6-B B2.
  A9 = DoD-Querschnitt (CPU-Throttle-Beweis) in jedem Bau-Prompt. **Kollisions-
  Precheck gegen laufende Worktrees (lm-qsperf/lm-l0) vor jeder Einheit; W2·7-Klingen
  #154 und W2·6a-MAT sind gemergt — nicht mehr live.** Trailer `Roadmap: W2·5d`.
  **U-UEBERSICHT ✅ (5.7., Opus, Worktree `feat/u-uebersicht-a14-a15`):** A14
  (Kanton-Titel umbrechen statt kappen + Relevanz-Sortierung = dokumentierte
  Kern-Erlass-Kategorie, dann Systematik) + A15 (Gliederungs-Umschalter
  Relevanz/Systematisch/Rechtsgebiet auf allen 3 Säulen, G6 = Modus + Tür bleibt;
  Wahl persistent `?gliederung=`/localStorage, alle bestehenden Deep-Links
  erreichbar). SR-0.*-Labels per Gegenprüfung korrigiert (0.5 → «Krieg und
  Neutralität»). Gate 25/25 grün, golden identisch, e2e 173/173 (inkl. A9
  6×-Throttle). Detail: `FAHRPLAN-GESETZES-UX.md` §10.7. Rest der Welle offen
  (U-LINIEN/U-KOPF/U-VERWEIS/U-POSITION Reader-Kette nach QS-PERF; U-SUCHE; U-PDF).

## W2·5b — Reader-Darstellung Bund: Bündel R/N + Phase-1-Batch + Restblock *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  - **+ Auftrags-Eingang 30.6.:** **[x] Bündel R ✅ FERTIG + LIVE** (PR #59 `0560fd87`, prod-verifiziert 30.6.
    via Perf-Deploy): R1 Scroll-Spy Kopf+Gliederung · R2 Gliederung links ab 1024 px · R3 A−/A+ Schriftgrösse
    statt Kompakt/Breit. **[x] Bündel N ✅ FERTIG (1.7., Worktree, gegated — deployt 2.7.2026):**
    **N1** zerrissene Artikelnummer «329 g»→«329g» am Extraktor (`entferneTags` strippt Inline-Tags
    leerzeichenlos, Ziffern-sup/sub behalten Abstand; 194 Bund-Snapshots regeneriert, golden byte-gleich,
    Opus-Gegenprüfung BESTANDEN). **N2** falscher Self-Link auf benanntes Fremdgesetz unterdrückt
    (`fremdgesetzNachArtikel`, ~1195 Fälle, render-only; §7-Abweichung: ELI-Ziel steht NICHT im HTML-Body
    → erlass-genaue Chips = Phase-1-Folge; Gegenprüfung fand+fixte FinfraV-FINMA-Kürzel-Regression).
    **+ Verifikations-Tor** `check:invarianten` (Markup-/Entity-/Suffix-Leak). **+ Status-Marker:
    empirisch schon erfüllt** (aufgehoben = «· aufgehoben»-Statuszeile + Einklappen; noch-nicht-in-Kraft
    kommt bei current-consolidation-Pinning nicht vor) → §7-dokumentiert, kein Neubau. Details Eingangsblock.
  - **+ 2.7.: Verlässliche-Umwandlung-Spec (Fable-Ultracode) + Phase-1-Fundament-Batch.** Spec
    `docs/superpowers/specs/2026-07-02-verlaessliche-normtext-umwandlung-bund.md` (Verdikt Hybrid «XML-Träger,
    HTML-Arbiter»; verlinkt aus `FAHRPLAN-NORMTEXT-DARSTELLUNG.md §Quell-Architektur`). **[x]** erster Bau-Schritt
    rein HTML gebaut+gegated+gegenprüft: **P2** Split-sup-Merge (6 Blöcke: GEBV/HMG×2/KLV/CO2/VRV), **P4**
    SSV-Kachel-379-Leak, **P1** sha deckt `mehrspaltig.spalten`, **P5** `[tab]`-Negativ-Lexikon (Expected-Fail-Register).
    **[x] P3** Drop-Klasse laut ✅ 5.7.2026 (W2·5b-Restblock, s.u.). Detail STRUKTUR-Karte 2.7. + Spec §7.
  - [x] **+ Audit-Andockung 3.7.2026 (Audit 1, `BACKLOG-AUDIT-WERKZEUGE-2026-07.md`):** **N3 · `he` statt
    Handtabelle ✅ 3.7.2026** (Branch `feat/nulltarif-werkzeuge`: Ergebnis BESSER als erwartet — Bund-Regen aus
    gepinnten Caches **0-Byte-Diff** (golden-neutral; die `&ge;`/`&le;`-Klasse sitzt in Kanton-Quellen und
    greift bei deren nächstem Regen); einzige Divergenzen der Alt-Tabelle: `&nbsp;`/`&mu;` als dokumentierte
    Sonderfälle BEHALTEN, `&ldquo;`/`&rdquo;`-ASCII-Abflachung als deklarierte Korrektur auf WHATWG (Korpus-Impact
    heute null); Beleg `bibliothek/register/he-entity-korrekturen-2026-07-03.md`, QS-GP-Quittung).
    **✅ W2·5b-Restblock KOMPLETT 5.7.2026 (Worktree `feat/w25b-l0-haertung`, alle vier Posten):**
    **P3 Drop-Klasse laut ✅** — korpusweite `<p>`-Klassen-Inventur (218 Erlasse/24 602 Artikel,
    `p3-drop-inventar.ts`): Verdikt je Klasse in `bibliothek/register/p3-drop-klassen-inventar-2026-07-05.md`;
    EXTRAHIERT: standalone `man-template-tab-krpr` (OR art_361/362 = 28+61 Vorschriften-Zeilen inkl.
    aufgehobener «…»-Platzhalter, VRV 8
    Verweis-Noten; neue Block-Alternative 7) + bare `class="referenz"`→`grundlage` (347 Trägernorm-Verweise
    in ATSV/FZV/BankV/FINIV/FinfraV/ArGV5; Regex `\breferenz\b` deckt beide Formen); BEWUSST IGNORIERT
    (belegt): inkrafttreten/abstand1seite/tab-utit-Titel/tab-kpf/italic-Note; DEFERIERT (dokumentiert):
    absatz-pt-Varianten (ParlG-Eid, UVPV 13 III/IV) + GBV-34i-Textformel. **Stille Drops sind LAUT:** neues
    Tor **`check:p-klassen`** (Manifest entschiedener Klassen; jede neue Fedlex-Drop-Klasse bricht das Tor).
    **N3-B1 `he`-Entities ✅** — war schon 3.7. gelandet (Commit `50fd4e15`, main): Bund-Regen 0-Byte-Diff,
    Sonderfälle `&nbsp;`/`&mu;` dokumentiert BEHALTEN; hier verifiziert, kein Rest offen.
    **linkedom-POC ✅ GEMESSEN, Verdikt: KEINE Migration** — 9 562 `<dl>`- + 35 178 `<dd>`-Grenzen über den
    ganzen Korpus: **0 Abweichungen** Regex-Tiefenzähler vs. DOM (linkedom devDep nur für den POC;
    `poc-linkedom-tiefenzaehler.ts`, Beleg `bibliothek/register/poc-linkedom-tiefenzaehler-2026-07-05.md`) —
    Regex ist DOM-äquivalent, Umbau wäre verhaltensneutral = nur Risiko/Laufzeit ohne Gewinn (§7-Messpflicht
    erfüllt; E0/E1 bauen bewusst auf dem BEWIESENEN Parser). **SVG-style-Leak ✅** — `<style>/<script>`-
    Element-INHALT wird vor dem Tag-Strip entfernt (`NICHT_TEXT_ELEMENTE`); SSV-Signalkatalog-Kacheln von
    «.cls-1 { fill: #010101; }»-CSS bereinigt (5 Stellen, Signal-Nr/Name/Artikel vollständig erhalten;
    einziger `<style>`-Träger im Korpus). Daten-Regen 9 Erlasse (OR +4 713 Z., VRV +409 Z., 6 VO +348
    grundlage, SSV −CSS), golden klassifiziert-additiv, Engine-Golden byte-gleich, QS-GP-Quittung.

## W2·5 — Auffindbarkeits-Schicht: Zweiachsiger Einstieg + Artikel-Volltextsuche *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  (Rechtsgebiet × Aufgabe)** ✅ **28.6.2026 (gegated, deployt 2.7.2026):** `einstiegMatrix()`
  (`src/lib/einstieg.ts`) projiziert den Katalog (§5) auf Rechtsgebiet × Aufgabe; Komponente
  `ZweiachsigerEinstieg` als zweite Achse auf `/rechner` (aufklappbare Gebiets-Kacheln, Werkzeuge
  nach Aufgabe gruppiert, nur verfügbar §8). Konsistenz-Tor `einstieg.test.ts`. Visuell bestätigt.
  **Globale Artikel-Volltextsuche** ✅ **28.6.2026 (David: «FlexSearch ja»; gegated, deployt 2.7.2026):**
  FlexSearch über alle **24 183 Bund-Artikel** (`bloecke`-Text), in DIE bestehende Suche integriert
  (neue Gruppe «Gesetzestext», `universalSuche`/`useUniversalSuche`, §5 ein Such-Workstream). Index
  build-time generiert (`gen:suchindex` → `public/such-index/`, gitignored, im `build`), lazy + eigener
  Chunk (FlexSearch 17 kB gz, NICHT im Haupt-Bundle — Task 4.4); Lib+Index ~4 MB gz erst auf erste
  Suche. Zitat-/Term-Suche stark («243 ZPO» → Art. 243 ZPO; Notwehr→Art. 16 StGB), Deklinations-
  Phrasen unscharf (§8-ehrlich). Snippet + Sprung `#art-`. Visuell bestätigt.

## QS-PERF — Teilerfolge Tor/Härtung/Kalibrierung *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  - **a · Tor `check:perf-budget`** — **`[✓]` KOMPLETT (5.7.2026, PR feat/qs-perf-a-b).** Bundle-Teil
    (Chrome-frei, `scripts/check-perf-budget.ts`) war seit 30.6. da; jetzt ergänzt: **`check:perf-lighthouse`**
    (`scripts/perf/lighthouse-budget.ts`) misst CLS/LCP/TBT/TTI/Score auf `/gesetze/bund/OR` + Startseite im
    Lighthouse-**Mobil-Preset (4× CPU + langsames 4G)** und ist als **letzte CI-Stufe** nach Build + allen
    Treue-Toren (golden/smoke/struktur-konsistenz/e2e) verdrahtet → §15-**Gegenkopplung** über die
    Schritt-Reihenfolge (Treue rot ⇒ Job bricht vor der Messung; nicht im schnellen `gate`, der nicht baut).
    **Median aus 3 Läufen** (CI; lokal 1) gegen Ausreisser-Flake. Schwellen an der **CI-Baseline**
    kalibriert (dort läuft das Tor — der 2-Kern-Runner legt unter 4×-CPU echten Spät-Shift/Blocking offen,
    stärker als lokal): CLS OR ≤ **0,15** / Start ≤ 0,10 (Regressions-Fänger, kappt die alte 0,64/0,57 mit
    Marge; FAHRPLAN-Eintritt war 0,25 → Ziel 0,10); LCP/TBT/TTI/Score grosszügige Deckel. **Ist Mobil-Preset:**
    OR CLS lokal 0,005 / CI ~0,10, Score CI ~38–56; Startseite CLS **0,000**. CI-Impact ~2 Min. Verschärfung =
    dokumentierter Folgeschritt nach breiterer CI-Baseline.

  - **e · CLS-Race-Härtung Reader-e2e** — **`[✓]` KOMPLETT (10.7.2026, `fix/cls-race-haertung`).**
    Drei byte-identische, nur unter CI-Parallel-Last reproduzierbare e2e-Rotfälle mit LayoutShift-
    Attribution auf die Wurzel gefixt (§15.2/§15.3), 12-s/CLS-Schwellen UNVERÄNDERT: (1) `verweis-u`
    0,49-CLS = `istXlVp`-Post-Mount-Flip 1→2-Spalten (`inhalt.tsx`, jetzt lazy-`useState` = Client-
    Initialstate gepinnt); (2) `leser-kopf-a9` 0,0001-Mikro-Shift = TOC-Akkordeon-Höhen-ANIMATION +
    spät committende `springeZuSektion`-Zweigöffnung (`parts.tsx` Akkordeon sofort statt animiert;
    `flushSync` + jumpLock 500 ms in `inhalt.tsx`); (3) `norm-sprung` Sprung >12 s = teure 4-MB-
    Artikelsuche blockierte den Sprung-Aufbau (`useUniversalSuche` `useDeferredValue` entkoppelt).
    Golden byte-gleich (nur React-Reader/Such-Hook); 10× lokal grün unter 6× Drossel. Detail:
    STRUKTUR-Karte 10.7.

  - [~] **TBT-Deckel je Job normieren statt absolut prüfen** *(gebaut, gemessen, VERWORFEN 20.7.2026)*.
    Umgesetzt und empirisch geprüft: eine synthetische, deterministische CPU-Last
    (`dist/_perf-kalibrier.html`) wird über dieselbe Lighthouse-Kette gemessen und als Divisor
    genutzt. **Ergebnis: funktioniert nicht zuverlässig.** Zwei Reihen zu je 8 unabhängigen Runnern
    (identischer App-Code) widersprechen sich: Reihe 1 senkt die OR-TBT-Streuung von CV 31.2 % auf
    16.5 % und räumt die Runner-Korrelation ab (r +0.83 → −0.21); Reihe 2 kehrt das Vorzeichen um
    (roh r −0.43) und das Normieren VERSCHLECHTERT auf CV 29.9 %. Gepoolt (n=16) bleibt eine
    Scheinverbesserung 26.8 % → 23.3 %. Auch eine abgeschwächte Korrektur `roh·(BASIS/kalib)^α`
    rettet es nicht: das gepoolt beste α=0.70 wirkt in den beiden Reihen in ENTGEGENGESETZTE
    Richtungen. Die Regressions-Steigung log(TBT)~log(kalib) ist 0.65 statt 1 — die unterstellte
    Proportionalität besteht nicht (eine Integer-Schleife misst die Kernfrequenz, die OR-TBT hängt
    daneben an Speicherbandbreite/Cache/Nachbarlast). **Assertiert wird darum weiter der Rohwert.**
    Die Kalibrierung bleibt als Diagnose-Ausgabe stehen (~15 s je Job) — Rohmaterial für einen
    späteren, besseren Normierer und im Log sofort sichtbar, ob ein Job langsam lief.
    **Damit ist «TBT auf OR wieder scharf» NICHT erreicht** und bleibt offen (§8, kein
    stillschweigend abgehaktes Ziel).

  - [x] **Chrome-Isolation je Lighthouse-Lauf + Neukalibrierung** *(erledigt 20.7.2026)*.
    `einLauf()` startet je Messung eine frische Chrome-Instanz und killt sie danach (~1–2 s/Lauf,
    ~15 s je CI-Job). Die kumulative Instanz-Drift ist weg (belegt: Startseite sprang zuvor von
    143–237 auf 1543 ms TBT ohne App-Code-Änderung), jeder Lauf ist definierte Kalt-Last.
    Schwellen im SELBEN Schritt neu erhoben über **16 Messpunkte auf 16 unabhängigen Runnern**;
    die Historie des alten Regimes wurde verworfen, nicht übernommen. **Verschärft** (echte
    Schärfe, runner-unabhängige Metriken): Start-TBT 1500 → **400** (Deckel lag 571 % über dem Ist),
    Start-LCP 11000 → **10000** (sd nur 37 ms über alle 16 Runner!), OR-TTI 15000 → **13000**,
    Start-Score 40 → **55**. **Unverändert** OR-TBT 6500 (siehe Schritt oben) und CLS 0.05.

## W2·6-B — Bündel B: B1 aza-Resolver + B2/A18 Regeste dreisprachig + B3 *(done; Prosa wörtlich verschoben 22.7.2026)*

    - [x] **+ Auftrags-Eingang 30.6.: Bündel B** — **B1+B2+A18 ✅ GEBAUT 5.7.2026** (Branch
      `feat/w26b-regeste-a18`). **Korrektur 20.7.2026:** die frühere Klammer «B3 offen = reine UI» war stale —
      **B3 ist erledigt und empirisch verifiziert** (10.7.2026, s. Zeile «Bündel B» oben: der Sticky-Kopf-Defekt
      wurde durch den U-KOPF/Split-View-Refactor `60988318` geschlossen, Playwright-Beweis an BGE 152 I 65).
      Damit sind alle drei Posten des Bündels erledigt ⇒ Status `wip` → **`done`**. **B1** BGE ohne «vollständiges Urteil»:
      aza-Resolver gehärtet (2. OCL-Kopfformat «BGE … (aza)» + Bandjahr statt fehlerhaftem
      `decision_date` als Plausibilitäts-Referenz) — **5/12 voll aufgelöst** (150 I 183/151 V 30/
      151 I 41/150 II 334/151 IV 316), **2 Kollisions-quarantäniert** (152 V 2/20 = OCL-Konflation,
      korrekt Auszug-only §8), **5 weiter Auszug** (151 I 73/151 II 710 kein aza im Kopf;
      151 III 336/151 II 475/151 V 100 Inversions-/Fetch-Grenze — ehrlicher Auszug §8).
      **B2+A18** (EIN Regeste-Pass, Quell-Wahl §7): die amtliche BGE-Regeste ist als flacher
      OCL-String weder dreisprachig noch strukturiert → aus **bger.ch clir** (`atf://<band>:de|fr|it`)
      nachextrahiert: Regestenkopf (massgebliche Artikel **fett**) + Absätze, je Sprachfassung,
      **strukturbasiert getrennt** (`<div id="regeste" lang>`) und **sortiert DE→FR→IT** — **272/272
      BGE, 0 Lücken**, additiv (`regeste.sprachfassungen`; `regeste.text` byte-stabil, Engine-Golden
      unberührt). `RegesteBlock.tsx`: DE prominent, FR/IT dezent einklappbar. Tor
      `check:entscheide` erzwingt Sortierung+Kopf+clir-Quelle; Gegenprüfung **bestanden** (Opus-
      Zweitpass 6 BGE × 3 Sprachen byte-genau vs. bger.ch). Detail `FAHRPLAN-GESETZES-UX.md`
      §10/U-REGESTE. · **B3** Sticky-Kopf überdeckt Body in `EntscheidLeser.tsx`
      (*reine UI, eigener Commit — NICHT in dieser Einheit*). Details im Eingangsblock oben.

## W2·6-DATA — Etappen-Erzählung E0/E0+/E1/E2/E3 *(offener Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

      Änderung golden byte-gleich (§6) + `QS-GP`. OCL-Pakete W12 (Bulk-Parquet) + F2 gehen hier auf. **E0 ✅ 2.7.2026** (PR #80/81, `ad065c03`: 218 Bund-Normtext byte-gleich DB↔JSON, `check:paritaet` in der Gate-Kette, doppelt verifiziert). **E0+ ✅ 3.7.2026** (Branch `feat/qs-data-e0-plus`, expliziter Sub-Schritt, KEIN neuer ROADMAP-Schritt — §14): Ziel-Schema §3 angelegt (erlasse/erlass_fassungen/artikel/entscheide inkl. `ecli_key`/`bge_key`+Indizes/soft_law + leere norm_referenzen/zitat_kanten/norm_rangliste) · Partitionierung je Doktyp (`daten/normtext.db`·`rechtsprechung.db`·`soft-law.db`; Monolith `lexmetrik.db` entfällt ersatzlos) · `normalisiere-zitat.ts` + DB-freie Unit-Tests · Reverse-Ingest ausgedehnt (Kanton-Normtext 1231 · Rechtsprechung 342 · 4 Manifeste inkl. Trailing-Newline · Materialien 1) — **`check:paritaet` byte-gleich über 1796 Dateien**, golden-neutral, doppelt verifiziert. **Nächstes: E1** (Generator-Flip). **Klarstellung Leitprinzip 4:** der Reverse-Ingest bereits committeter Kantons-JSONs öffnet **KEINEN** 26×-Slot (Leitprinzip 4 meint neuen Massenimport, nicht Reverse-Befüllung committeter Daten). **Weichen entschieden 3.7.:** Kontext-Auslieferung = Hybrid (Shards+Edge, `FAHRPLAN-DATENHALTUNG.md` §10(6)/§11.5) · Massen-Rebuild = Voll-Rebuild (§10(7)). **E1 ✅ 3.7.2026** (Branch `feat/qs-data-e1-flip`): Generator-Flip Bund-Normtext auf das Spalten-Zielschema (`erlasse`/`erlass_fassungen`/`artikel`), `public/*.json` = Projektion (Wächter alt≠neu → hart ab); neues Tor **`check:datenhaltung`** (Dump-Manifest-Determinismus + Drift gegen committetes `daten-manifest.json` + Invarianten Orphans/§7-Spalten/ATTACH); Risiko-Globs um `scripts/datenhaltung/**`+`daten/**`+`normtext-snapshot.ts` erweitert; Stabilitäts-Report. Byte-Beweis 3 Doppelläufe alt==neu==committet (218 Erlasse/24858 Artikel), `check:paritaet` unverändert 1796, golden byte-gleich, `QS-GP` bestanden. **VORBEHALT:** alter Direktpfad bleibt Wächter (Entfernen = eigener §6-Schritt); Kanton/Rechtsprechung/Materialien noch Blob-Weg. **E2 ✅ 3.7.2026** (Edge-Suche live: `api/suche.ts` + Turso-Hot-Replika; Sync-Timeout-Wurzel behoben 20.7., PR #313). **E3 ✅** (`rechtsprechung.db`, 488 MB).

## Fedlex-Datenarten-Portfolio — Pakete 1/2/5/4 Erledigt-Erzählung *(✅-Prosa wörtlich verschoben 22.7.2026)*

      **Paket 1 (Gesetze-Currency, `QS-CURRENCY`) ✅.** **Paket 2 (Botschaften/«Entstehungsgeschichte», W2·6) ✅ 10.7.2026** —
      401 Botschaften des Bundesrates über die 218 Volltext-Erlasse (Projekt-Graph, `nur-live-link`), im Norm-Kontext-Bus
      (Bridge B1); Join-Felder `projEli/ocUris/botschaftDate` für Paket 5 persistiert. **Paket 5 (Änderungshistorie/AS, W2·6-REV) ✅ 10.7.2026** —
      3108 AS/RO-Änderungs-Erlasse über die 218 Volltext-Erlasse (SPARQL Pfad (b) SR-Taxonomie), RO-Fundstelle aus oc-URI (100 %),
      Botschafts-Join über `ocUris` (477), `nichtKonsolidiert`-Marker (93) + Sammelerlass-Cross-Check gegen Pfad (a) ab 2000 (1942);
      Sidecar `public/normtext/revisionen/` (Übergangslösung bis E1→`erlass_fassungen`), im Norm-Kontext-Bus «Änderungen / Revisionen»
      neben der Entstehungsgeschichte (Bridge B1); Tore `check:revisionen`(-netz), Gegenprüfung bestanden. **Alle 5 Pakete (1/2/5/3/4) ✅ AUSGEFÜHRT** — Detail `FAHRPLAN-FEDLEX-PORTFOLIO.md`.

      (Bridge B1); Join-Felder `projEli/ocUris/botschaftDate` für Paket 5 persistiert. Paket 5/3 (Änderungshistorie/AS,
      Vernehmlassungen) via eigene PRs. **Paket 4 (Staatsverträge, `W2·6`) ✅ 10.7.2026** — 9 kuratierte SR-0.*-Verträge
      (HKsÜ 96/HUVÜ/EAUe/CMR/Montreal/RBÜ/UNO-BRK/Istanbul/Apostille) als Volltext über die bestehende `eli/cc`-Pipeline
      (kein `eli/treaty`-Extraktor); International-Volltext 18→27; POC: keine strukturierte Parteien-Kante → «Geltungsbereich»-Anhang
      verbatim, html-0 bei 5/9 stale → kanonische html-N gepinnt; Gegenprüfung bestanden. Detailquelle
      `bibliothek/register/fedlex-staatsvertraege-2026-07-10.md`. **Damit sind alle 5 Portfolio-Pakete gebaut.**

## W1·4 — Prozesskosten-Cockpit: I4 Bemessungskriterien + I9-Rest *(geparkter Schritt; ✅-Prosa wörtlich verschoben 22.7.2026)*

  **I4 ✅** (1.7.2026): `kriterien`/`kriterienNorm` auf `KantonalerTarif` — Bemessungskriterien je
  Tarif (25 GK + 26 PE, Kanton × GK/PE frisch am amtlichen Erlass extrahiert, §7-belegt in
  `bibliothek/register/bemessungskriterien-tarife-kantone.md`), Anzeige im Ermessensrahmen-Block bei
  Spanne (§8); GR gk ohne Kriteriennorm → generischer Fallback. Adversariale Gegenprüfung (QS-GP,
  2 Opus-Agenten): 1 Fund korrigiert (OW pe Art. 4a→Art. 32), 4 Titel-Korrekturen bestätigt. Golden
  byte-gleich (Engine liest kriterien nicht). **I9-Rest ✅**: Notariats-/Grundbuch-Querverweis im
  Cockpit.

## Auftrags-Eingang 30.6.2026 — erledigte Bündel/Einzelposten (R · N · B3 · I1/I2) *(✅-Prosa wörtlich verschoben 22.7.2026)*

> **Bündel R · Gesetz-Reader-Lesesteuerung → Schritt 5b** *(reine UI, eigener Worktree, golden-neutral):*
> - **R1 Scroll-Spy:** mitscrollender **Kopf UND Gliederung** markieren den **zuoberst im Viewport
>   angeschnittenen** Artikel, nicht einen mittigen (`gesetz-leser/`, eine „aktiver-Artikel"-Bestimmung).
> - **R2 Gliederung links auch auf kleineren Laptops:** Schwelle `istXl` (~1280px) in
>   `gesetz-leser/inhalt.tsx` ~Z.754 senken → linke TOC grundsätzlich, nur bei echt-zu-klein in den
>   Drawer. Wechselwirkung `PANE_BREIT_PX` + `max-w-reading` prüfen. (Quer zu Schritt 14 Responsive-Audit.)
> - **R3 Schriftgrösse +/− statt «Kompakt/Breit»:** Breiten-Umschalter (`Topbar.tsx` Z.54–62 +
>   `useInhaltsbreite.ts`, localStorage) durch **+/−-Schriftgrössen-Steller** ersetzen (persistent,
>   §13-Tokens/rem-Faktor, keine `text-[..px]`). Global (Topbar) → trifft alle Seiten.
>
> **Bündel N · Normtext-Fidelity/Verweise → Schritt 5b (Extraktor-Härtung, L0) bzw. Schritt 6:**
> - **N1 Zerrissene Artikelnummer** «Artikel 7 b»→«7b» (auch «43 a», «28–28 b», «14 a», «1 bis»):
>   Muster `Art. <zahl> <buchstabe>` in **111/218 Bund-Erlassen** (steht im Block-/items-`text`).
>   Fix am **Generator/Extraktor** (§7 kein Hand-Edit), Quelle-vs-Extraktion bestätigen
>   (`scripts/fedlex-cache.sh`). **§1/§2:** keine blinde Zahl-Leer-Buchstabe-Regex (echte «1 a)»-Listen).
>   *Daten/Pipeline → golden + `QS-GP`.* Bsp. David: Art. 7e ATSV; Art. 16/14a BetmKV.
>   **Ursache (Probe 30.6.):** Quelle hat `7<i>b</i>` (kein Leerzeichen, b kursiv) — unser Extraktor
>   fügt das Leerzeichen beim Strippen der Inline-Tags `<i>`/`<sup>` selbst ein. Fix = **kein Whitespace
>   zwischen Ziffer und Inline-getaggtem Buchstaben/`bis`/`ter`** (gilt für HTML *und* XML, kein Quell-Wechsel).
> - **N2 Falsche Verweis-Auflösung** *(§1-NAH, heikler):* interner Artikel-Link zeigt auf den
>   **aktuellen** Erlass, obwohl ein anderer genannt ist (Bsp.: «Artikel 14a … BetmG» in BetmKV Art. 16
>   → Klick landet bei Art. 14a der BetmKV statt im BetmG). Resolver ignoriert die nachgestellte
>   Erlass-Abkürzung. Nähe `norm-link`/`fntext-links`/`NormChip`. *Erst Häufigkeit messen, dann fixen;
>   golden/Tests + `QS-GP`.*
>   **Befund (Probe 30.6.):** das ELI-Verweisziel steht **schon im HTML** (`<a href="…/eli/…">`, 19 in
>   BetmKV, identisch im XML, z.B. StGB) — der Resolver liest es nur nicht. Fix = **Ziel lesen statt raten**
>   (erlass-genau; `#art` selbst auflösen). **Geschwister von M12** → Verweis-Chips als Feature.

>   ✅ **10.7.2026 — bereits behoben, empirisch verifiziert** (kein neuer Code nötig): Der U-KOPF/Split-
>   View-Refactor (Commit `60988318`) hat alle drei Kandidaten geschlossen — Block zu **EINEM** sticky-
>   Element konsolidiert, `top`-Offset von `top-16`→`calc(4rem + 2.25rem)` (sitzt jetzt UNTER dem
>   InhaltsKopf-Breadcrumb statt ihn zu überdecken), opaker `bg-paper`, `z-[15]` (< Topbar `z-20`,
>   > Breadcrumb `z-10`), `scroll-margin-top:var(--rsp-stick)` = 12.75rem. Playwright-Beweis 152 I 65
>   (Desktop 1280 + Mobil 390, Light+Dark, 3 Scroll-Stände, alle 3 Sprung-Chips, beide Tab-Fassungen):
>   **0 Overpaint**, Sprung-Ziele landen sichtbar unter dem 185/193px-Kopf; die alte `top-16`-Fassung
>   reproduziert den Überdeckungs-Defekt (Breadcrumb verschwindet). Golden byte-gleich (Doku-only).

> - **I1 Seitenleisten-/Rubriken-Reihenfolge** → **✅ gebündelt in W2·5c (3.7.2026):** `navigation.ts`-
>   SSoT-Array auf **Gesetze → Rechtsprechung → Materialien → Rechner → Vorlagen** — Bau im
>   Plumbing-Schritt von `FAHRPLAN-STARTSEITE-V3.md` §10 (treibt Sidebar UND Startseiten-Kacheln).
> - **I2 Branding-Neuausrichtung** → **✅ gebündelt in W2·5c (3.7.2026):** das geforderte
>   **Messaging-Konzept ist erledigt** (Ultracode-Recherche + DMAD-Council, gegen «nicht nach KI
>   klingen» geprüft; Wortlaut + SSoT-Architektur `seo.ts`→Projektionen + Tor `check:seo-index` in
>   `FAHRPLAN-STARTSEITE-V3.md` §6, Herleitung `bibliothek/recherche/startseite-v3-design.md`);
>   Ausrollen = Bausequenz-Schritt 1 des W2·5c. *(Ursprünglicher Auftragstext:)* weg von
>   «Berechnen statt KI» → **KI-freies Übersichtstool über amtliche Quellen, inkl. Rechner + Vorlagen**;
>   «KI-frei» als Vertrauensmerkmal (positiv), nicht als Headline. Surfaces ohne SSoT (§5-Geruch,
>   mitkonsolidieren): `index.html` (title/meta/og/twitter), `seo.ts` (`SITE_TITEL`/`SITE_DESCRIPTION`/
>   Route-Beschreibungen/`/methodik`), `Startseite.tsx` Hero, `KatalogHinweis.tsx`. **Deliverable:
>   Messaging-Konzept zuerst** (brainstorming/council, gegen «nicht nach KI klingen» geprüft), DANN
>   ausrollen + auf EINE SSoT ziehen (`seo.ts` Quelle, `index.html` daraus). Doks-Wording
>   (ROADMAP/PROJEKTBESCHRIEB «deterministisch statt KI-geschätzt») **✅ nachgezogen (5.7.2026,
>   W2·5c-Rest):** `Methodik.tsx`-Abschnittstitel umgestellt, Erinnerungs-Marker aufgelöst.
