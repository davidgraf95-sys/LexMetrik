# LexMetrik — Projektbeschrieb

**Stand:** 5. Juni 2026 · **Produktion:** https://lexmetrik.vercel.app ·
**Repo:** github.com/davidgraf95-sys/LegalCalc · Marke: **LexMetrik** (grosses M)

Dieses Dokument beschreibt das Projekt als Ganzes: Idee, Prinzipien,
Architektur, Inventar, Qualitätssicherung und Roadmap. Es ergänzt
`CLAUDE.md` (verbindliche Arbeitsprinzipien), `STRUKTUR.md` (laufend
gepflegter technischer Stand) und `KATALOG-ROADMAP.md` (Soll-Inventar).

---

## 1. Was ist LexMetrik?

LexMetrik ist eine Schweizer Web-Anwendung für **regelbasierte
Rechtsberechnungen und Rechtsdokumente**. Sie beantwortet zwei Arten von
Fragen:

1. **Rechner** — «Wann läuft meine Frist ab? Wie hoch ist der Verzugszins?
   Wie viel Pflichtteil bleibt frei verfügbar?» Deterministische Engines
   berechnen Fristen, Beträge, Quoten und Zuständigkeiten nach festen,
   offengelegten Rechenregeln — jeder Schritt mit Norm-Verweis, exportierbar
   als PDF-Rechenbericht.
2. **Vorlagen** — «Erstelle mir ein Testament, einen Arbeitsvertrag, ein
   Schlichtungsgesuch.» Geführte Wizards setzen Dokumente aus **festen,
   juristisch vorformulierten Bausteinen** zusammen — mit harten Schranken
   für zwingendes Recht und einem Bausteinprotokoll, das jede Aufnahme
   begründet.

**Das zentrale Produktversprechen: Berechnung statt KI.** LexMetrik nutzt
kein Sprachmodell und keine Wahrscheinlichkeiten. Gleiche Eingaben ergeben
immer dasselbe Ergebnis; jede angewandte Norm ist direkt mit dem amtlichen
Gesetzestext (Fedlex) verlinkt. Was sich nicht regelbasiert abbilden lässt
(Ermessen, Würdigung, Schätzung), wird bewusst **nicht** angeboten oder nur
als gekennzeichnetes «strukturiertes Gerüst» geführt.

**Zielgruppen (zwei Stufen):**
- **Free** (`/`): Privatpersonen mit den häufigsten Anliegen — Verzugszins,
  Fristen-/Tagerechner, Teuerungsrechner, eigenhändiges Testament,
  Patientenverfügung, Vorsorgeauftrag, Vollmachten, Mahnung, Kündigung
  Arbeitnehmer.
- **Pro** (`/pro`): Anwältinnen, Treuhänder und weitere Fachpersonen — der
  vollständige Katalog mit Verfahrens- und Rechtsmittelfristen, SchKG,
  Verjährung, Gesellschaftsrecht, Eingaben-Vorlagen usw. Ein PayPal-Gate an
  der Pro-Bereichsgrenze ist vorbereitet (`PAYWALL_ACTIVE = false`), aber
  bewusst noch nicht aktiv.

**Zielgrösse:** über 50 Rechner und über 50 Vorlagen (Soll-Inventar in
`KATALOG-ROADMAP.md`); viele davon Fristen-Rechner, die auf der gemeinsamen
Fristen-Engine aufsetzen.

---

## 2. Grundprinzipien (Kurzfassung von CLAUDE.md)

1. **Logik vor allem.** Fachliche Korrektheit schlägt jede andere
   Zielgrösse (weniger Code, schönere Abstraktion, Tempo). Im Zweifel
   lieber Duplikat als eine Abstraktion, die zwei rechtlich verschiedene
   Fälle gleich behandelt.
2. **Determinismus ohne Ausnahme.** Reine Funktionen, kein LLM, kein
   `Date.now()` in Rechenlogik. Nicht Regelbasiertes bleibt im Backlog.
3. **Schichtentrennung.** Rechtslogik lebt ausschliesslich in `src/lib/`
   (eine Engine pro Rechtsgebiet, nie zur Code-Ersparnis fusioniert);
   die UI enthält keine Rechtsregeln.
4. **Single Source of Truth.** Katalog = `startseiteConfig.ts`;
   Vorlagen-Inhalt = Schemas; PDF, DOCX und Live-Vorschau rendern aus
   **demselben** Assemble-Ergebnis.
5. **Normen verifizieren, nicht vertrauen.** Jeder Fedlex-Anker wird
   empirisch gegen das konsolidierte amtliche HTML geprüft; Aufträge und
   Gutachten können Fehler enthalten — Abweichungen werden umgesetzt und
   **offengelegt**.
6. **Ehrlichkeit gegenüber Nutzern.** Drei Status (`entwurf`/`geprüft`/
   `geplant`) zeigen den echten Prüfstand; offene Verifikationen und
   methodische Annahmen stehen sichtbar in der UI. `geprüft` und
   `verified: true` setzen die fachliche Abnahme durch David (Jurist,
   Anwaltsprüfung BS) voraus — **aktuell trägt nichts diesen Status**.
7. **Refactorings beweisen ihre Neutralität** (Tests vorher/nachher grün,
   Golden-Outputs, unabhängige Review-Agents); Push/Deploy nur nach
   explizitem Ja.

---

## 3. Architektur

### 3.1 Stack

| Ebene | Technologie |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite 8 |
| Styling | Tailwind CSS 3 mit eigenem Token-System (`index.css` + `tailwind.config.js`) |
| Dokumente | jsPDF (PDF), docx (Word) — beide clientseitig, lazy geladen |
| Tests | Vitest (378 Tests in 20 Dateien) + SSR-Smoke-Test aller Seiten |
| Hosting | Vercel (Projekt `lexmetrik`), Deploy via `npx vercel --prod` |

Kein Backend, keine Datenbank, kein Tracking: Sämtliche Berechnungen und
Dokumente entstehen im Browser; Wizard-Eingaben bleiben in `localStorage`
(Ausnahme Schlichtungsgesuch: bewusst ohne Speicherung).

### 3.2 Informationsarchitektur

- **`/` = Free, `/pro` = Pro** (Alt-Routen `/fachpersonen`, `/rechner`
  leiten weiter). Header trägt einen gerichteten «Pro →»/«← Free»-Button.
- **Katalog primär nach Rechtsgebiet** (17 kanonische Sektionen in fester
  Reihenfolge), darunter je die Untergruppen **Rechner** und **Vorlagen**.
  Sektionen starten zugeklappt; Suche/Filter und Sprungmarken klappen auf.
- Steuerung sitzt komplett in der **Seitenleiste**: kompakte Suche,
  Übersicht mit Scrollspy, Filter (Status, Rechtsbereich, Output-/
  Dokument-Typ). Auf der Free-Seite stehen die «Übergreifenden Werkzeuge»
  zuerst.
- Alle Routen sind **lazy** (eigene Chunks); Hauptbundle ~255 kB statt
  ursprünglich 1.19 MB.

### 3.3 Rechner-Engines (`src/lib/`)

Eine Engine pro Rechtsgebiet, alle rein/deterministisch: `zpoFristen`,
`schkgFristen`, `kuendigungsfrist`/`sperrfristen` (inkl. Sperrtage-Zähler),
`mietrecht`, `verjaehrung`, `gewaehrleistung`, `verzugszins`,
`lohnfortzahlung` (kantonale Skalen), `erbteilung` (Bruchrechnung).
Geteilt wird nur fachneutrale Infrastruktur: Datums-Arithmetik,
algorithmische Feiertage (Computus — keine Jahres-Klippe), Fristen-
Grundmuster, zentrale Kantonsliste.

Der **PDF-Rechenbericht** (`src/lib/pdf/`) rendert ein reines Blockmodell
(Hero-Kennzahl, Eingaben-Tabelle, unzerreissbare Rechenschritte mit
klickbaren Norm-Pills) mit eingebetteten Markenschriften.

### 3.4 Vorlagen-Plattform (`src/lib/vorlagen/` + `components/vorlagen/`)

**Generische Engine:** `assemble(schema, antworten)` — Bedingungs-Algebra
(`eq`/`in`/`nichtLeer`/`and`/`or`/`not`), Wiederholungen über Listen,
fortlaufende Nummerierung, Interpolation mit Platzhalter-Konvention
(leere Pflichtfelder zeigen `________`; optionale Fragmente auf
`…Satz`/`…Zeile` verschwinden ersatzlos) und **Bausteinprotokoll**
(jede Aufnahme/Nichtaufnahme begründet, mit Norm und Hinweis).

**Eine neue Vorlage liefert nur noch:**
1. ein Schema (Bausteine + Gates) in `lib/vorlagen/`,
2. `SCHRITTE` + Pflichtfeld-Prüfungen,
3. die Schritt-Formulare,
4. ~15 Zeilen Props für den **generischen Wizard-Rahmen**
   (`VorlagenWizardRahmen`, `VorschauPanel`, `ExportLeiste`) — Stepper,
   localStorage, Live-Vorschau, Fehlerboxen, Form-Gate und Exporte kommen
   automatisch.

**Gates-Systematik** (aus den Gutachten übernommen): *absolut zwingend* →
Blocker; *relativ zwingend* → nur Abweichung zugunsten der geschützten
Partei; *Validitätsschriftform* → im Vertragstext deklariert (die
beidseitige Unterschrift erfüllt sie); *heikle Klauseln* → Disclosure-
Hinweise mit BGE-Verweisen («zu verifizieren», wo nicht geprüft).

**Drei Formatvorlagen der Ausgabe** (PDF, DOCX und Live-Vorschau aus einer
Quelle; nach Referenz-Layouts):
- `verfuegung` — feierliche Urkunde (Testament, PV, VA): zentrierter Titel
  mit Haarlinie, ruhige Absätze;
- `vertrag` — Vertragslayout: zentrierter Parteien-Ingress, fette
  Ziffern-Überschriften, hängende Einzüge, geschützter Unterschriftenblock;
- `eingabe` — Rechtsschreiben: Absender-/Adressatenblock, Ort/Datum rechts,
  fetter Betreff mit Haarlinie, Rubrum mit zentrierten Parteirollen.
Gemeinsam: Helvetica/Arial 11, gezeichnete Unterschriftslinien, zentrierte
Seitenfusszeile, Disclaimer (8 pt) einmal am Dokumentende, Entwurfs-Banner.

### 3.5 Design-System

Geschlossene Typo-Skala (micro 11 · xs 12 · body-s 14 · base 16 · body-l 18
· h3 20 · h2 25.6 · h1 32 · display 36/44; `text-sm`/`text-lg` verboten),
alle Radien/Schatten/Motion als Tokens, Status-Hintergründe nach einem
`color-mix`-Rezept (AA geprüft), benannte Komponenten-Anatomie (`lc-card`,
`lc-tile`, `lc-notice[-warn|-danger]`, `lc-btn[-sm]`, `lc-chip`,
`lc-overline`). Ein Aktions-Akzent (`lc-btn-primary`); Messing bleibt der
Marken-Akzent für Linien, Chips und Links.

---

## 4. Inventar (Stand 5.6.2026)

**Katalog: 111 Einträge** (64 Rechner + 47 Vorlagen) über 17 Rechtsgebiete —
vollständig gegen `KATALOG-ROADMAP.md` abgeglichen; Konsolidierungen (z. B.
Fristwiederherstellung in ZPO-Fristen) sind auf den Karten als Szenarien
ausgewiesen.

**Gebaut und nutzbar (Status `entwurf` — fachliche Abnahme ausstehend):**

| Typ | Einträge |
|---|---|
| 9 Rechner | ZPO-Fristen · SchKG-Fristen · Kündigung & Sperrfristen (inkl. Sperrtage-Zähler) · Mietrecht-Fristen · Verjährung · Gewährleistung (Zwei-Regime 2026) · Verzugszins · Lohnfortzahlung · Pflichtteil/Erbteilung |
| 6 Vorlagen | Eigenhändiges Testament · Patientenverfügung · Vorsorgeauftrag (Form-Weiche eigenhändig/beurkundet) · Schlichtungsgesuch Basel-Stadt (Pilot, Tier Pro) · **Einzelarbeitsvertrag** · **Mietvertrag Wohn-/Geschäftsräume** |

Alle übrigen Karten sind ehrlich als «In Vorbereitung» (gedämpft, ohne
Norm-Pills) sichtbar — der Katalog zeigt den Fahrplan.

**Arbeitsweise für neue Inhalte:** Grundlage ist je ein **normverifiziertes
Rechtsgutachten** (Markdown aus ~/Downloads) mit Klassifikationsmatrix.
Vor der Umsetzung werden alle zitierten Anker empirisch gegen Fedlex
geprüft (bei Unklarheiten der Gesetzes-**Wortlaut** selbst, z. B.
Mindestdauern der Index-/Staffelmiete); fachliche Abweichungen vom
Gutachten werden umgesetzt und im Code/Commit offengelegt.

---

## 5. Wartbare, datierte Parameter ⚠️

Diese Werte ändern sich von Gesetzes wegen bzw. behördlich und sind als
**versionierte, datierte Felder** im Code hinterlegt — sie brauchen einen
Pflege-Rhythmus:

| Parameter | Wert (Stand) | Rhythmus | Fundort |
|---|---|---|---|
| Hypothekarischer Referenzzinssatz | 1.25 % (1.6.2026) | quartalsweise (BWO) | `lib/vorlagen/mietvertrag.ts` |
| Formularpflicht-Kantone Anfangsmietzins | BS, BE*, FR, GE, LU, NE*, VD*, ZG, ZH (BWO 4.2.2026; *BE Quellendiskrepanz, NE/VD teilweise) | jährlich per 1.11. | ebd. |
| MWST-Normalsatz | 8.1 % (seit 1.1.2024) | bei Satzänderung | ebd. |
| Kantonale Mindestlöhne | GE 24.48 · BS 22.00 · NE 21.31 · JU ~20.60 · TI 19.75 (2025; 2026-Werte teils bekannt) | jährlich indexiert | `lib/vorlagen/arbeitsvertrag.ts` |
| SG-Schwellen (Art. 210/212 ZPO etc.) | Revision 2025 berücksichtigt | bei Gesetzesrevision | `lib/vorlagen/schlichtungsgesuchBs.ts` |
| Behörden-Stammdaten BS | Stand 2025/2026 | bei Änderung | ebd. |

Jede Vorlage führt zusätzlich ihre **«Offenen Verifikationen»** sichtbar in
der UI (z. B. kantonale §§-Anker, PLZ-Vorbehalt, BGE-Zitate «zu
verifizieren»).

---

## 6. Qualitätssicherung

- **Beweis-Workflow** vor jedem Abschluss: `npx tsc -b` · `npm test` ·
  `npm run lint` (volle Ausgabe!) · `npm run build` ·
  `npx vite-node scripts/smoke-render.tsx` (SSR-Render aller 16 Seiten).
- **378 Vitest-Tests**, darunter: Engine-Regressionstests je Rechner,
  Akzeptanztests je Vorlage (alle Gates, inkl. Grenzfällen wie Schaltjahr-
  Staffeln oder Stale-State-Deadlocks), Katalog-Invarianten (eindeutige
  IDs, gültige Rechtsgebiete, auflösbare `related`-Verweise, geplant ⇒
  keine Norm-Pills/href), Fedlex-Linkformat.
- **Unabhängige Review-Agents** vor Commits grösserer Pakete (adversarial,
  fachlich gegen das jeweilige Gutachten + technisch); Befunde werden
  behoben und als Regressionstests festgeschrieben.
- **Visuelle Prüfung** der Dokument-Ausgaben: `.scratch/pdf-beispiele.ts`
  erzeugt Beispiel-PDFs aller Formatvorlagen, Sichtung via
  qlmanage-Thumbnails gegen die Referenz-Layouts.
- **Normentreue-Prüfung**: Fedlex-Anker empirisch gegen das konsolidierte
  Filestore-HTML (Caches in `/tmp`); `verified: false` bis zur fachlichen
  Abnahme.

---

## 7. Betrieb & Releases

- **Deploy:** `git push` + `npx vercel --prod` (Projekt `lexmetrik`) — nur
  nach explizitem Ja und vollem Bug-Check. `legal-calc.vercel.app` leitet
  per 308 um.
- **Druck/Export:** Nutzer drucken — Print-CSS blendet UI-Chrome aus;
  präziser sind die PDF/DOCX-Exporte.
- **Sprachen:** DE produktiv; EN/FR/IT «in Bearbeitung» mit DE-Fallback und
  Banner. Keine maschinelle Übersetzung — Fachübersetzung folgt später.
  Fedlex-Links sind locale-bewusst (fr/it amtlich).

---

## 8. Roadmap & offene Punkte

**Nächste fachliche Schritte:**
1. **Fachliche Abnahme** aller 6 Vorlagen-Baustein-Texte durch David
   (Wort-für-Wort) → danach `verified: true` und Status «geprüft»
   (Goldrand) je Eintrag. Dabei zu entscheiden: die offengelegten
   Gutachten-Abweichungen (z. B. Kündigungsfrist unter der Staffel beim
   Arbeitsvertrag, Art. 335c Abs. 2).
2. Offene Antworten: DOCX-Standardannahmen (Testament ohne, VA nur
   beurkundet) · Bausteinprotokoll in die Exporte? · Verzugszins-Hinweise
   kürzen?
3. Kantonale Verifikationen Schlichtungsgesuch BS (GOG/EG ZPO/GGR-§§,
   PLZ, Art.-135-Randtitel) und Formularpflicht-Status Bern.

**Ausbau (gemäss KATALOG-ROADMAP.md):** weitere Fristen-Rechner auf der
gemeinsamen Engine, Eingaben-Vorlagen (Rechtsvorschlag, Strafanzeige,
Rekurs …), Korrespondenz-Vorlagen (Kündigungen, Mahnung als Free-Einstieg),
Gesellschaftsrechts-Rechner.

**Phase Pro-Monetarisierung:** PayPal-Gate an der Pro-Bereichsgrenze
aktivieren (`PAYWALL_ACTIVE`), ein Gate für den Bereich — nicht je Karte.

**Bewusst NICHT geplant** (Widerspruch zum Determinismus-Versprechen):
Unterhalt, Schadenersatz/Genugtuung, Tagessatz, Bonus-Qualifikation,
Mietzinsherabsetzung bei Mängeln, Konkurrenzverbots-Zulässigkeit — alles
wertend/Ermessen; siehe Backlog in `KATALOG-ROADMAP.md`.

---

## 9. Dokumenten-Landkarte

| Dokument | Zweck |
|---|---|
| `PROJEKTBESCHRIEB.md` | dieses Dokument — Gesamtbild für Menschen |
| `CLAUDE.md` | verbindliche Arbeitsprinzipien (§1 Logik vor allem, §6 Beweisprotokoll …) |
| `STRUKTUR.md` | laufend gepflegter technischer Stand (IA, Inventar, Tokens, offene Punkte) |
| `KATALOG-ROADMAP.md` | Soll-Inventar aller Rechner/Vorlagen nach Rechtsgebiet |
| `README.md` | Kurzeinstieg/Setup |
| Rechtsgutachten (~/Downloads, je Vorlage) | normverifizierte Grundlagen der Masken |
