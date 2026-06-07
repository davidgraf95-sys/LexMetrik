# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Voll-Audit 5.6.2026** (4 parallele Agenten: Engines, Vorlagen, UI, Daten/Infra):
Fixes `21446ac`…`b8c9312` — PDF-Freitext-Datumsverdrehung (H1), Block-
Seitenüberlauf (H2), Testament-Quoten, PV-R6-Normalisierung, Mietvertrag-G3,
sperrfristen-Union bei Nichtigkeit, tsconfig strict, fedlex-Kombi-Anker.
Offen (UX-Politur, kein Output-Fehler): stabile Keys in 7 Listen-Editoren.

**Stand:** 5. Juni 2026 — deployed bis `1a69a93` (… + Katalog-Ausbau
Free/Pro 111 Karten, Vorlagen 5+6 Arbeits-/Mietvertrag, Formatvorlagen-
Renderer, Tagerechner; Bug-Check: 2 Review-Agents, 1 HOCH-Befund
Toggle-Kopplung gefixt).
**Produktion:** https://lexmetrik.vercel.app (Vercel-Projekt `lexmetrik`;
`legal-calc.vercel.app` = 308-Redirect). Marke: **LexMetrik** (grosses M).

## Session 7.6.2026 abends — Betreibungsamt-Finder (Auftrag David, ungepusht)

Auf Davids Frage zum EasyGov-Finder («kann ich das?») + «bau»: **Recherche-
Dossier** `behoerden/betreibungskreise-kantone.md` (52 Agents, je Kanton
adversarial: 10 Einheitsamt · 10 Bezirks-/Regional · 2 Gemeinde · 4 gemischt;
Negativbefund: kein offenes Bundes-Verzeichnis, EasyGov-Detail-API geschützt) ·
**Datenschicht** `data/betreibungsaemter.ts` (einheitsamt/kreise/verzeichnis,
§8) + `data/betreibung/` (Resolver + Gemeinde-Karten 8 Kt./981 Gemeinden,
gegen swisstopo-Register normalisiert; ZH-Städte → Stadtkreis-Listen 12/3) ·
**UI** SchKG-Rechner Sektion 3b (PLZ→Kanton+Gemeinde) + Amts-Anzeige in der
Forum-Karte (EasyGov bleibt Zweitweg). Extraktion per Workflow (20 Agents,
49/49 Adress-Stichproben zeichengenau). 24 Akzeptanztests; Suite 1088.
PFLEGE: ZH-Kreis-Reorganisation in Vernehmlassung (Verfallsregister,
halbjährlich); BE «Avenir Berne romande». OFFEN: Etappe 3 (LU/UR/SZ/ZG/AG/SG
nur Verzeichnis-Link) · Davids fachliche Abnahme.

## Session 7.6.2026 nachts — Plan 9b VOLLDOKUMENTE Gründung (Aufträge David, ungepusht)

**Wortlaut-Dossier** `recherche/gruendungsdokumente-wortlaute.md` (4 Muster-
Sweeps: EHRA/ZH/SG/GL + Zeichnungs-/Erklärungs-/Anmeldemuster, alles lokal
geparst; Norm-Kerne am OR-Cache 1.1.2026 — Anweisung David: NEUSTES Recht;
§7-Korrektur: Art. 806b OR gilt weiter, gmbh-gruendung.md berichtigt). ·
**GmbH-Dokumentmappe** (`lib/vorlagen/gruendungGmbhDokumente.ts` + Komponente):
Statuten + Errichtungsakt als ENTWURF-Gate (§8), Wahlannahme/Domizil/
Beschlüsse/HR-Anmeldung druckfertig; Dokument-Auslöser aus
gruendungsunterlagen.ts (§5); Gates 773/774/777 II/795 II; Erstausbau nur
Bargründung CHF (ehrlich gesperrt sonst). · **AG-Dokumentmappe** analog
(`gruendungAgDokumente.ts`): VR-Protokoll als Pflichtbeleg, Teilliberierung
632 (≥ 20 %/≥ 50k-Gates), Vinkulierungs-/701d-Klauseln. **PERFEKTIONS-
PROGRAMM 7.6.2026 ABGESCHLOSSEN** (Auftrag David; Detail
FAHRPLAN-AG-GRUENDUNG.md, alle Normen am OR-/HRegV-Cache): Stufe-2-
Kombinationen frei (qualifiziert+FW in Kapitalwährung · Agio voll bei
Teilliberierung · Wert-Gates auf Ausgabebetrag · gemischte
Teilliberierung) · Inhaberaktien-Weiche (622 1bis/2bis, Gates 683/685a) ·
Statuten-Zusatzklauseln (Schiedsklausel 697n, Kapitalband 653s ff.,
bedingtes Kapital 653 ff., Stichentscheid-Abwahl, erstes GJ) ·
Unterschriftenblatt (Art. 21 HRegV) in jeder Mappe · ZIP-Sammeldownload
(PDF+DOCX, fflate) · localStorage-Persistenz mit Hydration-Guards ·
Vorschau-Wahl/Musterdaten/Schritt-Feldmarkierung · Notariatsgebühren
kantonsabhängig (lib/notariatsgebuehrenGruendung.ts, ZH/BE/LU/SG/BS
deterministisch, AG nach Aufwand; Dossier kosten/) · Abnahme-Dossier
ABNAHME-AG-BAUSTEINE.md (scripts/abnahme-ag.ts, 194 Bausteine, 13
Schemas — Davids Wort-für-Wort-Abnahme) · Kantonsvergleich SG/GL
(kantonsneutral bestätigt) · HR-Ämter-Adressdossier 26 Kt. Sweep-Stufe-
2-Strang (3264 AG-Komb., Exit-Fix) + Golden 87. Sammel-Bug-Check §9:
2 MITTEL gefixt, 0 HOCH. OFFEN: Stimmrechts-/Vorzugsaktien/PS
(Zwei-Kategorien-Kapitalmodell, Davids Entscheid) · arithmetische
Sweep-Geld-Invariante · Erstrecherche-Verifikationen Notariatstarife. · **Notariate je Kanton** (Auftrag David): Dossier
`behoerden/notariate-kantone.md` + Stammdaten `lib/notariate.ts` + Link-Box
in beiden Masken (SH-Sonderregel: HRegA beurkundet; UR/AI/BL «ohne Gewähr»).
· **Bug-Check §9 bestanden:** Code-Agent (2304 Kombinationen empirisch,
0 HOCH) + Jurist-Agent (1 HOCH: 805-V-Ziff.-2bis-Anker → 701d, gefixt;
M-Befunde eingearbeitet: Wahlannahme-Index-IDs, 626-Ziff.-3-Einlagebetrag,
Begründungs-Klarstellungen, CHF-Placeholder). Tests 975 grün (+22 neu),
tsc/Lint/Build sauber. Katalog: beide Gründungs-Karten neu mit
output pdf+docx. · **Kapitalerhöhung 9c GEBAUT** (gleiche Nacht): Dossier
`recherche/kapitalerhoehung-wortlaute.md` + Maske
`/vorlagen/kapitalerhoehung` (AG/GmbH-Schalter; Beschluss-/Feststellungs-
Urkunden ENTWURF, Zeichnungsscheine/Bericht/Anmeldung fertig;
6-Monats-Verfalls-Gates; 781-Verweisketten; Katalog 35). Bug-Check §9:
2 Agents, 0 HOCH, M/N-Befunde eingearbeitet; 985 Tests grün.

## Session 6.6.2026 abends (`8652e6b`…`4781ca7`, Aufträge David — ungepusht)

**Art.-63-SchKG-Doppelfix** (fristenEngine.ts): (1) Fristende Sa/So unmittelbar
vor Betreibungsferien — Werktagsverschiebung führte IN die Ferien (Repro
13.7.2024 → 15.7. statt 6.8.); (2) Review-Befund M-1: 3. Werktag nach
Ferienende kann in separaten Rechtsstillstand fallen → Normalisierung jetzt
Schleife bis stabil. 5 Regressionstests, Wortlaut am Cache. ·
**Feiertage-Doppelcheck 26/26** gegen die BJ-Liste (eigenständig am PDF):
7 Korrekturen (LU-Berchtold, GL-Allerheiligen, GL/VS-Stephanstag,
JU-Pfingstmontag, FR-Empfängnis, AI-Mauritius), **bedingte Feiertage** als
`giltImJahr` (NE-Fn.-10, UR/AR/AI-Fn.-1/7/9), **Näfelser-Fahrt-Karwoche-
Regel** (2026: 9.4.!); 2 Alttests trugen die falsche Matrix (deklariert
korrigiert); Regelwerk `bibliothek/normen/feiertage-kantone-bj.md`. ·
**Katalog-Split Zuständigkeit:** eigene Gebiets-Einstiege schkg-/straf-
zustaendigkeit (Hash-Vorauswahl #schkg/#straf, Muster Kuendigung;
istVerfuegbar 21→23). · **Rechtsmittel-Fahrplan (Zivil):** bestimmeRechtsmittel
mit Objekt-/Verfahrens-/Vorinstanz-Weichen (308/319/314 Abs. 2 Rev. 2025!/
321/145 Abs. 2 lit. b ZPO · 74/75 Abs. 2/46 Abs. 2 lit. a/92 f./98/100 BGG),
strukturierte Fristen je Ebene (Tage + Stillstand), Weichen/Kognition
offengelegt; UI als 4-Schritte-Fahrplan; Grundlage Dossier
bgg-beschwerde-engine.md. · **CLAUDE.md §11** (Wissens-Ablage, Anweisung
David) + Bibliothek komplettiert (45 Dossiers/5 Ordner, BGG-Cache in
fedlex-cache.sh reproduzierbar gepinnt, Register nachgeführt). ·
**Neue Dossiers:** eheschutz-glg-zustaendigkeit (Art. 198 lit. a! 314 Abs. 2
30 T.!), bgg-beschwerde-engine (Decision-Tree A–F), feiertage-kantone-bj. ·
**Gesamt-Check:** 2 unabhängige Review-Agents (Code + juristische Hand-
rechnung am Wortlaut) — alle Punkte bestätigt, M-1 gefixt, N-1 im Backlog. ·
**HANDLUNGSPLAN.md** neu (priorisiertes Vorgehen A–D). Offen: Davids
Push-Ja (10 Commits), Abnahmen, Hosting/Zahlung.

## Session 6.6.2026 nachmittags (Audit-Fixes + Ausbau, `021c05a`…`3e08ef1`)

Auf Davids laufende Aufträge: **Backlog B1–B10 komplett gefixt** (336c-
Tatbestände cbis/cter/cquinquies + Niederkunfts-Berechnung; Wechselbetreibung
`modus:'kein'` Art. 56 Ziff. 2; JStPO-Checkbox; ErrorBoundary+Export-Catches;
KTG-Risiken; Fraunces self-host+CSP+Cache-Header; Adress-SSoT BS golden-
bewiesen; tageTotal; 137-II-Variante) · **PLZ-Fixes** (21 tote Lookup-Pfade
via namensKandidaten(); Hauptgemeinde per amtlichem Adressenanteil — 4052
zeigt Basel 97.7 %) · **NEU Erb-Fristen-Rechner** (/rechner/erb-fristen, 15
Tatbestände 521/533/567 ff., Karte entwurf, Zählung 21) · **NEU Straf-
Rechtsmittel** (lib/strafRechtsmittel.ts, dritte Eingangs-Gabelung im Straf-
Rechtsweg; 222 rev. 2024!) · **Strafgerichts-Adressen** (data/strafgerichte.ts
26/26, Berufung §5-projiziert aus obereInstanzen; BL amtlich Grenzacher-
strasse 8 Muttenz) · **Hero je Rechtsweg** · **Schlichtungsstellen-Direktlinks**
(48/85 WebFetch-verifiziert + UI) · **Behörden-Voll-Audit: 0 Adressfehler**,
7 tote URLs ersetzt, Betreibungsämter-Verzeichnis → EasyGov (alte BJ-URL 404) ·
**Tiefencheck Engine** (8'442 Fälle: Scheidung×Art.-8-Naht + behoerdeTyp-Gate
gefixt, alles übrige entwarnt) · **Art. 5 Abs. 2 ergänzt**, lit. e/g–i
vollständig · **Art.-114-Spiegelung** Entscheidverfahren (lit. a/c/g) ·
**Kosten nicht-vermögensrechtlich** 26/26 + Familie (14 Kantone) in Daten+UI ·
**NEU Untermietvertrag-Weiche** (Art. 262 GELTENDE Fassung — Revision in der
Volksabstimmung 24.11.2024 abgelehnt!; Hauptmiete golden byte-identisch) ·
**Zahlungssystem-Entscheid:** PayPal aus der Planung entfernt (System offen).
**Recherche:** 17 Dossiers in `bibliothek/recherche/` (12 Engine-Cluster +
StPO-Rechtsmittel, Strafbefehlsverfahren, Gebühren-nv, Kündigungs-Masken,
Untermietvertrag) + `strafgerichte-kantone.md`/`schlichtungsstellen-urls.md` —
alle Erstrecherche/einfach belegt, fachliche Abnahme ausstehend.
Konsolidierter Befund-Stand: `fundamentalanalyse-2026-06-06.md`. Offen für
David: Dienstjahr-Stichtag-Grundsatzfrage · TI-Agno-Adresse · Abnahmen.

## Verifikationsstand (eine Zeile)

Build ✓ · Lint 0/0 ✓ · 757 Tests (755 grün + 2 skipped) ✓ · tsc STRICT · Logik-Sweep 11'184 Kombinationen ✓ · Norm-Zitate 261/261 ✓ · Fedlex-Caches 9 Gesetze/56 Pflicht-Anker ✓ — Workflow:
`npx tsc -b` · `npm test` · `npm run lint` (volle Ausgabe lesen, nicht
`tail -1`!) · `npm run build`; vor Deploys unabhängige Review-Agents.
SSR-Smoke-Test aller Seiten: `npx vite-node scripts/smoke-render.tsx`.
Fedlex-Caches + Anker-Inventar: `bash scripts/fedlex-cache.sh`.

**Informationsbibliothek: `bibliothek/INDEX.md`** — Quellen-Register
(verifizierte Fedlex-Stände inkl. ZPO-Revision 2025), Parameter-
Verfallsregister, Recherche-Dossiers (Schlichtungsbehörden 26 Kantone),
ZPO-Normtexte für die Zuständigkeitsengine.

**Zuständigkeitsengine (`src/lib/zustaendigkeit.ts`, Phase 1 — entwurf):**
Bundesrechtsschicht nach ZUSTAENDIGKEIT-AUFTRAG.md (Spezifikation im
Repo-Root): Verfahrensart (Art. 243 inkl. Abs.-3-Vorbehalt), Schlichtung
(197–200), Entscheidkompetenz (210/212, Revision 2025: 10'000),
Gerichtsstände (10/32–35), HG-/Direktklage-Weichen (6/8). 30 Tests mit
beidseitigen Schwellen-Grenzwerten. **Phase 2 erledigt:** Kantonsschicht
`data/zustaendigkeitKantone.ts` (BS-Pilot, Stellen-Auflösung über
behoerden.ts, GOG-Schwelle bewusst null/offen) + SG_SCHWELLEN beziehen
die Zuständigkeits-Schwellen aus ZPO_SCHWELLEN (SSoT §5, golden-bewiesen
byte-gleich). **Phase 3 erledigt:** /rechner/zustaendigkeit (Form §3-rein,
Eckdaten-Tiles, Stelle mit Adresse/Quelle, Weichen offen, PDF-Bericht);
Katalogkarte `zustaendigkeit` (pro/entwurf) ersetzt die drei geplanten
Karten gerichtsstand/verfahrensart/schlichtung. **Phase 4 erledigt:**
Prefill-CTA → Schlichtungsgesuch BS (sgPrefillKodieren/Lesen; nur bei
ordentlicher Behörde + erfasster Stelle; Golden byte-gleich) — MVP
end-to-end. OFFEN: weitere Kantone (nach Dossier-Abnahme), weitere
Ziel-Vorlagen. Davids fachliche Abnahme steht aus.

## Verschlankung 5.6.2026 (verhaltensneutral, Review ohne Befunde)

**Code-Splitting:** Alle Routen `React.lazy` (App.tsx, Suspense in der
Shell); jsPDF wird erst beim PDF-Klick geladen (dynamic import, Muster wie
DOCX). Hauptbundle **1'187 → 230 kB** (gzip 349 → 71); jede Seite eigener
Chunk. Banner-Texte/-Typ dafür nach `lib/vorlagen/banner.ts` gelöst
(vorlagenPdf re-exportiert).

**Geteilte Wizard-Infrastruktur** (für die Skalierung auf 50+ Vorlagen):
`components/vorlagen/useWizardState.ts` (Antworten + optionale
localStorage-Sicherung mit `normalisieren`-Callback, Schritt, Gate-,
Kopier-State; ohne `speicherKey` garantiert storage-frei → Schlichtung BS)
· `lib/vorlagen/vorlagenText.ts` (`dokumentAlsText` — dritter Renderer
neben PDF/DOCX aus derselben Quelle) · `Field`/`Stepper`/`inputCls` überall
aus `components/vorlagen/ui.tsx` (10 lokale Kopien entfernt; Typografie auf
body-s-Label/xs-Hint vereinheitlicht) · `lib/kantone.ts` (zentrale
KANTONE-Liste, amtliche Reihenfolge; bewusst abweichende Listen blieben
lokal).

**Generischer Wizard-Rahmen** (`components/vorlagen/wizard.tsx`):
`VorlagenWizardRahmen` (Kopf mit Rückweg/Normen/Badge/Speicher-Fussnote,
Stepper, zweispaltiges Layout, Fehlerbox, Zurück/Weiter; `weiterDeaktiviert`
überschreibbar für Stopp-Karten) · `VorschauPanel` (Live-«Papier» +
Bausteinprotokoll; `kompakt`, `extra`-Slot z. B. Pflichtteile,
`nichtAufgenommen`-Liste) · `ExportLeiste` (PDF/DOCX lazy + Kopieren;
DOCX nur wo Formvorschrift es zulässt). **Eine neue Vorlage liefert nur
noch: Schema (lib/vorlagen/), SCHRITTE, fehlerImSchritt, Schritt-Inhalte,
Gates-Anzeige im Prüfen-Schritt und die Rahmen-Props.** Die 4 Seiten sind
323–479 LOC (vorher 451–587). Session-Bilanz: −585 LOC netto, Hauptbundle
−80 %; alles verhaltensneutral (2 unabhängige Reviews ohne Befunde,
SSR-Smoke aller Seiten, Tests/Lint unverändert grün).

## Informationsarchitektur (Stand EINE Hauptseite 7.6.2026)

**EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE.md, Auftrag David 7.6.2026 —
hebt die Free/Pro-Zweiteilung vom 5.6. wieder auf):** `/` trägt den
VOLLSTÄNDIGEN Katalog (Gebiets-Kacheln, Suche `?q=`, Panel `?gebiet=`,
Anliegen-Zeile, «Zuletzt verwendet») hinter einem kompakten Hero
(Free-Nutzen-Headline in h2-Höhe; Kennzahlen OHNE Preisaussage bis
Monetarisierungs-Entscheid G1). Davor eine kuratierte Chip-Zeile
**«Häufig gebraucht»** (`lib/haeufigGebraucht.ts`, Nachfolger der
Free-Kachelwand-Kuratierung; nur Verfügbare erscheinen). `tier`-Feld,
`PAYWALL_ACTIVE`, `lib/proSession.ts` (Pseudo-Login) und der
Header-Pro-Button sind ENTFERNT (D-3; Stand vor dem Rückbau: Git-Historie
bis `2e80daf`). `/pro`, `/fachpersonen`, `/rechner` → DAUERHAFTE Redirects
auf `/` mit erhaltenem Suchstring (Permalink-/.ics-Link-Erbe). Mobil erbt
die Hauptseite den vorbestehenden 390px-Overflow des Katalogs
(FAHRPLAN-DESIGN Etappe 4, offener Strang).

**Katalog-Gliederung: primär nach RECHTSGEBIET** (17 kanonische Sektionen
in fester Auftrags-Reihenfolge, `RECHTSGEBIET_SEKTIONEN`), darunter je die
Untergruppen **Rechner** und **Vorlagen** (nur nicht-leere). Output-Typ
(Rechner) und Dokument-Typ (Vorlagen) sind FILTER; Rechtsbereich-Filter und
Suche bleiben. **Der frühere Modus-Umschalter (Primärweiche Rechner |
Vorlagen) ist damit abgelöst und entfernt**; `?modus=`-Links bleiben
harmlos; die Alt-Gliederungen ('art'/'bereich') sind aus dem Code
entfernt. Header = Zwei-Zonen (Logo links, Aktionscluster rechts:
Sprache · Methodik — Pro-Button entfernt 7.6.2026, Methodik seither auch
mobil), Mitte leer; Utility-Bar nur Pflichthinweis rechts, mobil
ausgeblendet.

**Design-Tokens (Feinschliff 5.6.2026, single source tailwind.config +
index.css):** Typo-Skala GESCHLOSSEN — micro 11 · overline 11 · xs 12 ·
body-s 14 · base 16 · body-l 18 · h3 20 · h2 25.6 (auch Ergebnis-Hauptwerte
mit `leading-none`) · h1 32 · display 36/44 (Heroes). **`text-sm`/`text-lg`
sind verboten** (Tailwind-lh weicht ab; body-s/body-l verwenden). Radien
komplett tokenisiert (--radius-sm…2xl). Status-Hintergründe nach EINEM
Rezept (`color-mix --status-tint 10%` auf Papier; AA geprüft). Motion:
--dur-fast/base/slow + --ease, Default-Easing global. Komponenten-Anatomie:
`lc-tile` (Ergebnis-Kachel) · `lc-notice[-warn|-danger]` eigenständig (kein
Inline-Padding!) · `lc-btn-sm` (36px) · disabled steckt in den
lc-btn-Klassen (keine disabled:-Utilities) · ein Aktions-Akzent
(lc-btn-primary; lc-btn-brass entfernt).

**Layout:** Inhaltsspalte einheitlich `max-w-content` = **70rem (~1120px)**
(Token in tailwind.config); 8-px-Skala `--space-1…24`, `--control-h` 44px,
`--pill-h` 36px. Hero text-geführt einspaltig (keine Deko-Grafik, bewusst
nicht animiert), Untertext ≤ 58ch; Determinismus-Claim genau EINMAL (Hero).
Kartenraster `repeat(auto-fill, minmax(340px, 1fr))`; Titel ohne Silben-
trennung (`text-balance`); Pills im Inhaltsblock, nur CTA per `mt-auto`
unten. Keine Ziffern in Sektionsköpfen/Sidebar (konsistent nirgends).

**Pro-Katalog = KACHEL-KATALOG (Umbau 6.6.2026 nachts, Live-Auftrag David;
Roadmap + Entscheide: FAHRPLAN-KATALOG-UI.md):** Die 17 Rechtsgebiete sind
kompakte Kacheln unter den 5 Obergruppen (Name · Zähler «X verfügbar · Y in
Vorbereitung» · verfügbare Werkzeug-Titel, geklemmt). Klick öffnet das
Gebiet als Panel in voller Breite unter der Kachel-Zeile (`?gebiet=` in der
URL, teilbar; nur ein Panel zugleich); die Disclosure-Sektionen samt
Scrollspy sind entfernt. Darüber: Anliegen-Zeile (lib/anliegen.ts, 8
situative Einstiege — ENTWURF, Abnahme David offen) + «Zuletzt verwendet».

**Suche:** EIN kompaktes Suchfeld in der Katalog-Seitenleiste (Desktop)
bzw. im Filter-Drawer (mobil) — filtert den Katalog live. Die frühere
⌘K-Befehlspalette ist entfernt (Entscheid David 5.6.2026). Seit 6.6.2026:
Suche/Filter aktiv → flache, gerankte Trefferliste statt Kacheln (Rang:
Titel > Keyword exakt > Keyword > Norm > Gebiet; lib/katalogSuche.ts —
dieselbe Logik testet die Suchbegriff-Goldliste katalogSuche.test.ts,
48 Paare Laie/Fach/Norm); `?q=` in der URL; «/» fokussiert das Feld;
Keywords kompakt verglichen wie Normen («Art.311» = «311 ZPO»).
Metadaten-Inventur: `npx vite-node scripts/katalog-inventur.ts`.

**Sprachen:** Umschalter sichtbar (Header); EN/FR/IT «in Bearbeitung» mit
DE-Fallback + persistentem Banner; KEINE maschinelle Übersetzung (fachkundige
Person später). `<html lang>` folgt der Locale; Fedlex-Links ebenfalls
(fr/it amtlich — Anker stichprobenverifiziert sprachunabhängig; en → de).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (oranger Top-Rand `--warn-500` + Outline-Badge «Entwurf»
(`.lc-badge-entwurf`), Tooltip «erstellt, fachlich noch nicht geprüft»;
dazu EINE Status-Legende über der Startseiten-Kachelwand statt lauter
Einzel-Badges — Design-Review 6.6.2026, Freigabe David) = gebaut, ungeprüft ·
`geprüft` (Goldrand, KEIN Wort-Badge) = fachlich geprüft — **aktuell
nirgends vergeben** · `geplant` (gedämpft, AA-konform ohne Opacity) =
«In Vorbereitung», ohne Norm-Pills/Artikel-/Tagesangaben.
**Alle NormRefs tragen `verified: false`**, bis David sie fachkundig gegen
Fedlex prüft (Anker selbst sind build-verifiziert, Format `art_335_c`).
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.
Status-Filter heisst «Nur verfügbare» (= nicht geplant).

## Katalog (Quelle: src/lib/startseiteConfig.ts — Single Source of Truth)

**111 Einträge: 64 Rechner + 47 Vorlagen** (Katalog-Ausbau 5.6.2026: +59
geplante Karten gemäss KATALOG-ROADMAP.md; Soll-Inventar dort gepflegt).
Felder: modus, art, rechtsgebiet (kanonisch, 17 Werte),
**rechtsbereich** (privat/oeffentlich/straf/uebergreifend), status, norms
(NormRef mit verified), href, schemaId/formvorschrift/output (Vorlagen),
szenarien (konsolidierte Rechner), related (modusübergreifend), keywords
(**tier entfernt 7.6.2026**, FAHRPLAN-EINE-HAUPTSEITE). VorlageArt um
**korrespondenz** («Schreiben & Erklärungen») erweitert. Neue geplante
Karten: norms [], kein href, neutrale Beschreibungen (Normentreue);
Roadmap-«[Gerüst]» als «Strukturiertes Gerüst …» im Text.

**Konsolidierung (43→34):** 9 Einzelkarten absorbiert — Klagebewilligung +
Fristwiederherstellung → ZPO-Fristen; Rechtsöffnung/Aberkennung/Kollokation
+ Arrest → SchKG-Phasen; missbräuchl. Kündigung + Massenentlassung →
«Arbeitsrecht — Fristen»; Miet-Anfechtung → «Mietrecht — Fristen»;
Verzugszins-vertieft → Verzugszins; SV-Leistungsverwirkung → ATSG-Karte.
`RechnerCard.szenarien` zeigt abgedeckte/geplante Szenarien auf der Karte.

**Spät-Session 7.6.2026 (Kurzspiegel; Details HANDLUNGSPLAN.md A.0):**
Daueranweisungen §0 Mehrwert-Test + §0a Perfektion-vor-Neubau · Roadmap
−7 geplante Karten (verifiziert) · AG-Programm fertig inkl. Notariats-
tarif-Korrekturen (ZH-Rahmen 123! SG floor!) · Startseite: leere Gebiete
als «In Vorbereitung»-Zeile, Rubrik einzeilig · Vereinheitlichung Runde 1
(Tagerechner-Hash/geteilter Teilen-Button, 7 Titel-Paare + Invariante) ·
Dossiers neu: gmbh-deltas-g0, gmbh-qualifizierte-gruendung,
ag-kapitalkategorien (Bau gesperrt), BGerR-Verifikation (35/35a-Split).

**Konsolidierung Runde 2 (7.6.2026, FAHRPLAN-KATALOG-KONSOLIDIERUNG,
Auftrag David «simplifizieren — ein Einstieg pro Rechtsfrage»):** Katalog
gesamt 115→112, verfügbar 35→32 gebaut, davon **28 sichtbar**. (a) GELÖSCHT
die 3 reinen Hash-Deep-Link-Karten: untermietvertrag → Karte «Mietvertrag
(Wohnen · Geschäft · Untermiete)»; schkg-/straf-zustaendigkeit → EINE Karte
«Zuständigkeit (Zivilprozess · Betreibung · Strafverfahren)» mit szenarien
(kehrt den Katalog-Split vom 6.6. um — Davids Delegation 7.6.). (b) NEU
`imKatalog:false` (BaseItem) + `KATALOG_KARTEN`: die 4 Kündigungs-Masken
(AN/AG/Mieter/Vermieter-Checkliste) behalten ihre Karten als SSoT der
Masken-Seiten (`karte(id)`!), erscheinen aber nicht mehr im Register/Suche —
ihre Auffindbarkeit tragen die Themen-Einstiege «Kündigung & Fristen im
Arbeitsverhältnis» (ex «Arbeitsrecht – Fristen») und «… im Mietverhältnis»
(ex «Mietrecht – Fristen»), deren Rechner-Seiten die Masken direkt verlinken.
(c) Kachel-Overline zeigt jetzt `Gebiet · Rechner/Vorlage` (Funktions-
Kennzeichen, EIN Template-Literal wegen SSR-Marker). Ausdrücklich NICHT
gemergt: GmbH-/AG-Gründung (zwei Werkzeuge, echte Rechtsform-Entscheidung),
Tagerechner↔ZPO/SchKG (gewollter Laien-/Fach-Doppeleinstieg), Rechner↔
Vorlage-Paare (§5: eine Engine, zwei Ausgabeformen). Goldliste deklariert
nachgezogen (misst jetzt KATALOG_KARTEN); Davids Abnahme der neuen
Titel-Wortlaute offen.

**Gliederung (seit Katalog-Ausbau):** beide Seiten = Rechtsgebiet-Sektionen
(GebietSektion, feste §4-Reihenfolge OHNE Relevanz-Sortierung) mit
Untergruppen Rechner/Vorlagen; innerhalb der Gruppen verfügbare vor
geplanten (sortiereKarten). Filter: Status («Nur verfügbare») · auf /pro
zusätzlich Rechtsbereich · Output-Typ (Rechner) · Dokument-Typ (Vorlagen);
Suche in der Seitenleiste. Grenzfall Vorlage «Einsprache»: straf
(Strafbefehl häufiger), Verwaltungsbefehl via Keywords.

## Rechner (Engines in src/lib/, alle rein/deterministisch, kein LLM)

Gebaut (entwurf): zpo-fristen, schkg-fristen, kuendigung-sperrfristen
(inkl. **Sperrtage-Zähler**: Kontingent 30/90/180 je DJ, beansprucht nach
Art.-77-Zählung, verbleibend, Rückfall-Zeilen — Komponente
SperrtageZaehler, auch in der kombinierten Ansicht), mietrecht,
verjaehrung (Zwei-Fristen, Stillstand-Union), gewaehrleistung (Zwei-Regime
1.1.2026), verzugszins (Segmente, Art. 85-Anrechnung), lohnfortzahlung
(Skalen; Engine-Guard AUF 1–100 %), erbteilung, **allgemeineFrist**
(Free-Tagerechner, Auftrag 5.6.2026: dünne Engine auf fristenEngine/
zpoFeiertage — dies a quo IDENTISCH zu zpoFristen, Systemtest AF-14;
getrennte Wochenend-/Feiertags-Toggles, Tage-zwischen-Hilfsmittel;
SR 173.110.3 als Gesetzes-Seiten-Pill, ELI SPARQL-verifiziert).
Feiertage algorithmisch (Computus) — keine Jahres-Klippe.

## Vorlagen-Plattform (src/lib/vorlagen/)

Generische Engine: `assemble(schema, antworten)` rein/deterministisch
(Bedingungs-Algebra eq/in/nichtLeer/and/or/not; wiederholeUeber; nummeriert
mit Leerlisten-Guard; Interpolation; Bausteinprotokoll). Renderer aus EINER
Quelle: vorlagenPdf (jsPDF, Banner-API, WinAnsi-Sicherung) + vorlagenDocx
(docx-Lib, lazy geladen, Word-Formatvorlagen; XLSX architektonisch
vorbereitet, nirgends ausgeliefert). Geteilte Wizard-UI:
components/vorlagen/ui.tsx (Field, NormLink locale-bewusst, Stepper).

**8 gebaute Vorlagen (alle entwurf):**
1. **Testament** (/vorlagen/testament) — eigenhändig: Abschreib-Mustertext,
   Pflichtteils-Panel, Gates 467/505/481/472. KEIN DOCX (Eigenhändigkeit).
2. **Patientenverfügung** (/vorlagen/patientenverfuegung) — Schriftform;
   Konsistenz-Engine R1/R2, harter Sterbehilfe-Block R6 (Art. 114/115 StGB);
   PDF + DOCX (Pilot Mehrformat).
3. **Vorsorgeauftrag** (/vorlagen/vorsorgeauftrag) — formMode-Weiche
   eigenhändig (Mustertext) / beurkundet (Entwurf, DOCX nur hier);
   Eligibility-Gate Art. 13; Grundstück-Sondervollmacht erzwungen.
4. **Schlichtungsgesuch Basel-Stadt** (/vorlagen/schlichtungsgesuch-bs,
   tier experte) — Routing mit Stopp-Karten (Miete/GlG → eigene Stellen,
   Art. 198), Mängelliste mit Schritt-Sprung, SG_SCHWELLEN hart codiert,
   Behörden-Stammdaten BS, Form-Gate (Exemplare = 1+Beklagte), PDF+DOCX,
   BEWUSST ohne localStorage (Anweisung); 12 Akzeptanztests.
5. **Einzelarbeitsvertrag** (/vorlagen/arbeitsvertrag) — ERSTE Vorlage auf
   dem generischen Wizard-Rahmen. Grundlage: normverifiziertes Gutachten
   Art. 319 ff. OR (5.6.2026); Validierungskern = Matrix absolut/relativ
   zwingend (Art. 361/362) + Schriftform-Klauseln (durch beidseitige
   Unterschrift erfüllt) + Disclosure (BGE 145 III 365, 149 III 202,
   129 III 276). Harte Gates: Probezeit ≤ 3 Mte, Frist ≥ 1 Mt (bei
   Befristung neutralisiert), Ferien ≥ 4/5 Wochen, Ferienabgeltung bei
   Vollzeit gesperrt, KV nur mit Ort/Zeit/Gegenstand + Einblicks-
   Bestätigung. Kantonale Mindestlöhne als DATIERTE Parameter
   (AV_MINDESTLOEHNE, jährlich verifikationspflichtig!). ArG in fedlex.ts
   ergänzt (Anker art_9/12/13/46 empirisch verifiziert). PDF+DOCX;
   16 Akzeptanztests. Deklarierte Gutachten-Abweichung: einheitliche
   Frist < Staffel zulässig per Art. 335c Abs. 2 (Hinweis statt Verbot).
6. **Mietvertrag Wohn-/Geschäftsräume** (/vorlagen/mietvertrag, Karte
   mietvertrag-wohnen) — Gutachten Art. 253 ff. OR/VMWG (5.6.2026).
   Zentrale Weiche objektTyp + Kanton. Gates: Kaution ≤ 3 Monatszinse
   (nur Wohnraum), Fristen 3/6 Mte, Index ≥ 5 J/LIK + Staffel ≥ 3 J
   (beide am Fedlex-WORTLAUT verifiziert), NK-Einzelausweis, MWST nur
   Geschäftsraum. DATIERTE Parameter: Referenzzins 1.25 % (1.6.2026,
   quartalsweise!), MWST 8.1 %, Formularpflicht-Kantone (BWO 4.2.2026,
   BE-Diskrepanz offengelegt, dynamisch per 1.11.). PDF+DOCX; 14 Tests.
7. **Vollmacht** (/vorlagen/vollmacht, Karte `vollmacht`) — EINE Maske mit
   Typ-Schalter Anwalts-/General-/Spezialvollmacht (Entscheid David
   5.6.2026 statt zweier Vorlagen; Grundlagen-Bericht «Vollmachten»,
   Downloads). Formfrei (Art. 11 OR) → ausgabeArt `fertig`, PDF+DOCX.
   Gemeinsamer OR-AT-Kern (Parteien natürlich/juristisch, mehrere
   Bevollmächtigte einzeln/gemeinsam, Substitution, Widerruf Art. 34,
   Befristung, transmortale Klausel Art. 35); besondere Ermächtigungen
   als Katalog wortlautnah zu Art. 396 Abs. 3 OR. Deterministische
   Form-Gates: Bürgschaft = SPERRE (Art. 493 Abs. 6 OR), Grundstück =
   Warnung (Art. 216 OR / Art. 86 GBV / Formfrage offen BGE 112 II 330),
   Bank = bankeigene Formulare, Prozess-Bereich = Art. 68 ZPO-Warnung,
   Vorsorgefall = Weiche zu Vorsorgeauftrag/PV (Gesundheits-Bereich
   bewusst NICHT wählbar). Ersetzt die geplanten Karten generalvollmacht/
   bankvollmacht. StPO/VwVG in fedlex.ts ergänzt (Anker art_129/art_11
   empirisch verifiziert). 20 Akzeptanztests.
8. **Klage im vereinfachten Verfahren – BS** (/vorlagen/klage-vereinfacht,
   Karte `klage-vereinfacht`) — zweite BS-Eingabe der SG-Familie
   (normverifizierter Auftrag 5.6.2026). Deterministisches BS-Routing:
   Arbeit ≤30k → Arbeitsgericht (§§ 73 f. GOG), GlG/Mitwirkung →
   Dreiergericht, Gewaltschutz/DSG/Miete-Kern → Einzelgericht (§ 71 GOG);
   ehrliche Stopps (>30k ohne Abs.-2-Materie → ordentlich; Arbeit >30k →
   § 73 Abs. 2-Hinweis; KVG-Zusatz → Sozialversicherungsgericht).
   Schwellen aus ZPO_SCHWELLEN (SSoT); Klagefrist Art. 209 Abs. 3/4 über
   die zpoFristen-Engine ('klagefrist_klagebewilligung', Gerichtsferien).
   ABWEICHUNG vom Auftrag offengelegt: Art. 114 ZPO kennt KEINE Miete-
   Position (lit. d = Mitwirkungsgesetz) → Miete im Entscheidverfahren
   nicht kostenfrei. Begründung = freiwilliger strukturierter Platzhalter
   (Behauptungs-Liste + Beweismittel) mit Verzichts-Baustein (Art. 245
   Abs. 1); Begehren beziffert/unbeziffert (Art. 84/85), Rechtsöffnungs-
   Antrag, Beilagen-Automatik (KB/Ausnahme/Vollmacht/Urkunden), Doppel-
   Hinweis Art. 131. SG-Parteitypen wiederverwendet (parteiZeilen & Co.
   exportiert). PDF+DOCX, ohne localStorage (wie SG). 20 Akzeptanztests.

Wizards 1–3 und 7 mit localStorage (`lexmetrik.vorlage.*.v1`, Hydration
array-gesichert); Vorschau als Funktionsaufruf (kein Remount). Eingaben
(4, 8) bewusst OHNE localStorage.

## PDF-Rechenbericht (src/lib/pdf/)

**Abend-Paket (5.6.2026):** Formulierungskonventionen (lib/konventionen.ts
SSoT + Linter-Test über echte Textausgabe; — → – plattformweit, «5 %»,
SG-Floskeln, Golden-Diff programmatisch als rein konventionell bewiesen).
Free-KACHELWAND (flach, FREE_REIHENFOLGE, Hero neu «Schweizer Recht,
berechenbar.»; Katalog.tsx pro-only). Versimplung: ui/Tabs + ui/
SelectionGrid (14+3 Stellen entdoppelt, SSR-byte-identisch), chf()
kanonisch, tote Katalog-Props raus (netto −175 Z.). Pro: Sektionen
starten EINGEKLAPPT, Zivilprozess & Vollstreckung zuerst. KOMBINIERTER
FRISTENRECHNER free (/rechner/tagerechner: Verfahrens-Tabs Allgemein/
ZPO/SchKG → bestehende Forms; §4 unangetastet; Trennungs-Querschnitt-
Test). Mobile-Check: Tabs-Overflow gefixt (overflow-x-auto), Grids
mobil-Basis. PROJEKTBESCHRIEB.md neu geschrieben.

**Pro-Katalog-Umbau (5.6.2026, Auftrag):** Tabs Verfügbar(17)/Gesamt(111)
(?ansicht=, Default Verfügbar), juristische Obergruppen als Super-Trenner
(lib/rechtsbereichGruppen.ts, 5er-Modell, 4er-Fallback per GRUPPEN_MODELL),
gruppierte Scrollspy-Seitenleiste (Rechtsbereich-Filter+Direkteinstieg
entfernt), Schnellzugriff ★Favoriten+Zuletzt (lib/schnellzugriff.ts,
localStorage, Stern nie auf geplant), istVerfuegbar()-Prädikat, Hero «17
sofort verfügbar». Free unverändert. BetragsFeld: Tausender-Apostroph in
22 CHF-Feldern. Visual-Checks (2 Agenten) GRÜN; P1–P3 gefixt.

**Teuerungsrechner (5.6.2026, /rechner/teuerung, Free):** LIK-Indexierung
mit amtlicher BFS-Reihe (src/data/likReihe.ts, generiert via scripts/
lik-reihe-generieren.py aus cc-d-05.02.08; 10 Originalbasen 1966–Mai 2026;
OPEN-BY). Basis-AUTO wie BFS-Rechner; Modi Indexmiete (Art. 17 VMWG
wortlaut-verifiziert, Senkungspflicht)/Unterhalt (286/128 ZGB)/generisch.
VMWG neu in fedlex.ts. MONATLICHE PFLEGE: Reihe nach BFS-Publikation
regenerieren. Eingaben: Behörden-Registry +Miete/Diskriminierung BS
(Staatskalender 5.6.2026); SG-Forum-Häkchen entfernt (Kantonswahl).

**Logik-Nachrechnung + Versimplung (5.6.2026):** 4 Cluster unabhängig vom
Code aus dem Gesetz nachgerechnet (100+ Handfälle, 6912er-Erbrecht-Gitter,
576er-ZPO≡Allgemein-Gitter): KEINE Berechnungsfehler. Offen für Davids
Entscheid: Sperrtage-ANZEIGE-Konvention (beansprucht Art.-77 vs.
Kalendertage; Endtermine identisch). Versimplung golden-bewiesen
(scripts/golden-outputs.ts, 53 Fälle byte-gleich): naechsterWerktag/
dauerTageInklusiv kanonisch, fmt/iso ×7 dedupliziert, Vorlagen-Helfer
zentral, Rückwärts-Spiegelung direkt.

**Tagerechner-P1 (5.6.2026, Auftrag «Verbesserung Fristenrechner»):**
Rückwärtsmodus (spätester Handlungstag; Verschiebung defensiv «keine»,
Vorverlegung nur mit Ungeklärt-Vorbehalt), Zustell-Helfer (rein informativ:
7-Tage-Fiktion, A-Post Plus Art. 142 Abs. 1bis ZPO), .ics-Export (RFC-5545
inkl. Folding, deterministisch) + Permalink (validiert), Validierung/A11y;
BGE 150 III 367 nachgeführt. AV/MV-Schemas: v1.1.0 (Vertiefungs-Gutachten).
Golden-Output-Protokoll: scripts/golden-outputs.ts (53 Fälle, vergleich-Modus).

**Formatvorlagen-SSoT (5.6.2026, `formatvorlagen.ts` — drei Grundlagen-
Berichte):** Typografie je Format + AUSGABE_REGELN je AusgabeArt
(abschrift = DOCX hart gesperrt · entwurf = PDF-Wasserzeichen «ENTWURF»
[VA beurkundet] · fertig). Eingaben mit Korrekturrand 3.5 cm rechts,
Anrede/Schlussformel/«im Doppel» (Rollen anrede/schlussformel);
Verträge mit Ausfertigungs-Vermerk + QES-Hinweis (Art. 14 Abs. 2bis OR).
Pro-SITZUNG (lib/proSession.ts): Pro betreten = eingeloggt (localStorage,
Reload-fest, «/»→/pro), Header «Ausloggen»; Andockpunkt Zahlungs-Gate (System offen).
Einzeilen-Heros Free+Pro; Gebiets-Titel in Sans.

**Formatvorlagen der Vorlagen-Renderer (5.6.2026, Referenz-Layouts):**
Schemas deklarieren `format` (verfuegung·vertrag·eingabe) + Absatz-`rolle`n
(absender/adressat/datumzeile/betreff/rubrum/parteien/unterschrift); PDF,
DOCX UND Live-Vorschau interpretieren beide aus EINER Quelle. Arial/
Helvetica 11, Haarlinien unter Titel/Betreff, hängende Einzüge (1./–),
gezeichnete Unterschriftslinien, Fusszeile je Seite, Disclaimer 8pt am
Ende; Eingaben OHNE Dokumenttitel (Betreff trägt ihn), langes Datum.
Engine-Konvention: Platzhalter auf …Satz/…Zeile verschwinden leer
ersatzlos (sonst «________»-Vorschau-Strich). Visuell verifiziert via
`.scratch/pdf-beispiele.ts` + qlmanage-Thumbnails.

pdfModel (reines Block-Modell: kopf/hero/tabelle/schritt/hinweisbox/norm)
+ pdfRender mit **eingebetteten Markenschriften** (Fraunces/Geist/GeistMono
als Base64-TTF, ~0.4 MB NUR im lazy Klick-Chunk). Hero-Hauptkennzahl,
Eingaben-Tabelle (Mono rechtsbündig), unzerreissbare Schritte mit
klickbaren Norm-Pills (Vormessung inkl. Pill-Umbrüchen), sichtbare URLs,
Status «Berechnung vollständig». Verzugszins + Kündigung liefern hero.
Visuelle Prüfung: qlmanage-Thumbnails + Swift-PDFKit-Split.

## Oberste Ebene: vier Output-Typen

| Sektion (`art`) | Inhalt |
|---|---|
| Fristen (`frist`) | Prozessuale und materielle Fristen |
| Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

## Grossausbau 5./6.6.2026 — Zuständigkeits-Plattform (Kurzkarte)

**Drei Rechtswege live** im Zuständigkeitsrechner (je EIGENE Engine, §4):
- **Zivil** (`lib/zustaendigkeit.ts`): 9 Streitsachen · Fahrplan + kantonale
  Kosten-Rahmen (alle 26, `data/zustaendigkeitKosten.ts`) · Art.-113-Kosten-
  freiheit · konkrete Schlichtungsstelle aller 26 Kantone
  (`data/schlichtungsstellen.ts`) mit **PLZ→Gemeinde→Amt** gemeindescharf in
  ZH/AG/SG/TG/FR/ZG/AI (`data/schlichtung/*`, amtliches swisstopo/BFS-Register,
  Generator `scripts/plz-generieren.ts`) · **Handelsgerichte** ZH/BE/AG/SG ·
  **Rechtsmittel-Modus**: Berufung/Beschwerde-Weiche (308/319 ZPO) + obere
  Instanz aller 26 Kantone (`data/obereInstanzen.ts`) + BGer-Schwellen
  (Art. 74 BGG, BGG-Cache verifiziert).
- **SchKG** (`lib/schkgZustaendigkeit.ts`): Betreibungsort-Kaskade 46–55,
  11 Anliegen (Rechtsöffnung/Aberkennung/Widerspruch/Kollokation/Arrest/
  Konkurs/Aufsichtsbeschwerde) mit Verwirkungsfristen-Badges; Gebühr
  Zahlungsbefehl nach Art. 16 GebV SchKG (Stand 1.1.2022, 2026-Vorbehalt
  im Verfallsregister); BJ-Betreibungsämter-Verzeichnis verlinkt.
- **Straf** (`lib/strafZustaendigkeit.ts`): StPO-Decision-Tree (Spezialforen
  35–37 → Tatort 31 → Kaskade 32; Weichen 33/34/38/40/41/42); Anzeige-
  Fahrplan (301; Strafantrag 3 Mt., Art. 31 StGB); zentrale StA aller
  26 Kantone + Bundesanwaltschaft (`data/staatsanwaltschaften.ts`).

**Vorlage Schlichtungsgesuch kantonsübergreifend:** Behörden-Auflösung für
alle 26 Kantone (`components/vorlagen/SgBehoerdenWahl.tsx`; Adressat-Kette
Hand > BS-Registry > Recherche > Platzhalter). **UX-Programm** (9 Etappen-
Commits) + Design-Konsistenz-Sweep abgeschlossen. **Bibliothek:** 21 Dossiers
(4 Regelwerke ZPO/SchKG/StPO/Erbrecht; Behörden Zivil/Straf/Erbgang; Kosten)
— Status je Dossier in bibliothek/INDEX.md (SSoT-Karte dort).

## Session-Abschluss 6.6.2026 (deployed bis e97f63b)

PLZ→Stelle: 8 Kantone gemeindescharf + BE/NE/JU zentral; SO/VS/TI/AR
ehrlich Verzeichnis (Gemeinde-/Circolo-Organe). Eingangs-Gabelung
Einleitung/Rechtsmittel. Gerichtsgebühren-Tiefenerfassung 26/26
(bibliothek/kosten/gerichtskosten-kantone.md; SH→JG 173.200 korrigiert).
Erlass-Links 52/52 in der UI. Verwaltungsbehörden-Dossier 26/26
zweifach geprüft. Adress-Gesamtprüfung (4 Pakete, ~450 Adressen):
7 Korrekturen eingearbeitet (u. a. AG-HG Vorstadt 40, BE-GenStA
Nordring 8, GR-VGer Grabenstrasse 30). Norm-Doppelcheck Stufe 1+2
abgeschlossen (Art.-5-lit.-d-Alternative, 112 IV Kann). Werkzeuge neu:
scripts/logik-sweep.ts · scripts/norm-zitate-pruefen.ts.

## Offene Punkte (nächste Session)

1. **Fachliche Abnahme durch David** (er ist die «fachkundige Person»):
   **Erste Sichtung aller 4 Vorlagen am 5.6.2026 erfolgt** (Bausteine,
   Gates, Schwellen vorläufig für gut befunden). SEIN ENTSCHEID: **alles
   bleibt `entwurf` / `verified: false`** bis zur Wort-für-Wort-
   Detailüberarbeitung («wir überarbeiten alles später»). Erst danach
   NormRefs auf verified:true und Einträge einzeln auf «geprüft» (Goldrand).
2. **Seine Antworten ausstehend:** redundante Tageszählungs-Hinweise im
   Verzugszins-Bericht kürzen? · DOCX-Standardannahmen ok (Testament ohne,
   VA nur beurkundet)? · Bausteinprotokoll in PDF/DOCX-Exporte aufnehmen?
3. ~~Phase 4: Experten-Gating als Wrapper um /fachpersonen~~ → **entfällt
   ersatzlos** (Aufhebung der Free/Pro-Zweiteilung, Auftrag David
   7.6.2026); eine spätere Monetarisierung bekäme einen neuen,
   funktionsbezogenen Zuschnitt (STRATEGIE-PLATTFORM, Gate G1).
4. **Schlichtungsgesuch:** offene Verifikationen (kantonale §§ GOG/EG ZPO/
   GGR, PLZ 4001/4051, Art.-135-Randtitel) — in der UI offengelegt.
5. Kleineres: Detailseiten-Titel (calculators.ts) an neue Katalog-Titel
   angleichen? · Datepicker-Pfeiltasten (A11y-Kür) · Markenschriften auch
   für Vorlagen-PDFs · ggf. sichtbare Rechtsgebiet-Zwischentitel in den
   Untergruppen.
6. ~~Verschlankung Stufe 2~~ → **erledigt 5.6.2026** (generischer Rahmen
   in components/vorlagen/wizard.tsx, s. oben). Optional verbleibend:
   Form-Gate-Sektion (brass-Box mit Checkliste) als vierte geteilte
   Komponente — Texte sind je Vorlage fachlich verschieden, daher bewusst
   zurückgestellt.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur bei klar regelbasiertem, deterministischem Umfang — sonst
Widerspruch zu «feste Rechenregeln, keine Schätzung»: Konsumkredit-Widerruf
(Anwendungsbereich klären) · Schadenersatz/Genugtuung · Unterhalt ·
Tagessatz · Mietzinsherabsetzung · Konkurrenzverbot (alle wertend/Ermessen).
