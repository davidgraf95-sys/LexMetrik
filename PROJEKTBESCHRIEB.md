# LexMetrik — Projektbeschrieb

**Stand:** 6. Juni 2026 (nachts) · **Produktion:** https://lexmetrik.vercel.app ·
**Repo:** github.com/davidgraf95-sys/LegalCalc · Marke: **LexMetrik** (grosses M)

Dieses Dokument beschreibt das Projekt als Ganzes: Idee, Prinzipien,
Architektur, Inventar, Qualitätssicherung und Pflege. Es ergänzt
`CLAUDE.md` (verbindliche Arbeitsprinzipien), `STRUKTUR.md` (laufend
gepflegter technischer Stand), `KATALOG-ROADMAP.md` (Soll-Inventar),
`HANDLUNGSPLAN.md` (priorisiertes Vorgehen), die Fahrpläne
`FAHRPLAN-PRAXIS.md`/`FAHRPLAN-KATALOG-UI.md` (Praxistauglichkeit der
Engines bzw. der Auswahl-Schicht) und die `bibliothek/` (recherchierte
Grundlagen mit Quellen-Registern, 46 Dossiers).

---

## 1. Was ist LexMetrik?

LexMetrik ist eine Schweizer Web-Anwendung für **regelbasierte
Rechtsberechnungen und Rechtsdokumente** (Deutschschweiz, Bundesrecht;
kantonale Stammdaten wo nötig). Sie beantwortet zwei Arten von Fragen:

1. **Rechner** — «Wann läuft meine Frist ab? Wie hoch ist der Verzugszins?
   Was ergibt die LIK-Indexierung? Wie viel Pflichtteil bleibt frei
   verfügbar?» Deterministische Engines berechnen Fristen, Beträge, Quoten
   und Zuständigkeiten nach festen, offengelegten Rechenregeln — jeder
   Schritt mit Norm-Verweis, exportierbar als PDF-Rechenbericht, teils mit
   Kalender-/Zeitstrahl-Visualisierung, .ics-Export und Permalink.
2. **Vorlagen** — «Erstelle mir ein Testament, einen Arbeitsvertrag, ein
   Schlichtungsgesuch.» Geführte Wizards setzen Dokumente aus **festen,
   juristisch vorformulierten Bausteinen** zusammen — mit harten Schranken
   für zwingendes Recht (Gates), einem Bausteinprotokoll, das jede Aufnahme
   begründet, einer werkgetreuen Live-Vorschau und Export als PDF/DOCX
   (soweit die Formvorschrift es erlaubt).

**Das zentrale Produktversprechen: deterministisch gerechnet statt KI-geschätzt.** LexMetrik nutzt
kein Sprachmodell und keine Wahrscheinlichkeiten. Gleiche Eingaben ergeben
immer dasselbe Ergebnis; jeder Rechenschritt und jeder Baustein ist
offengelegt und jede fest verdrahtete Norm artikelgenau auf den
konsolidierten Gesetzestext (Fedlex) verlinkt. Was sich nicht regelbasiert
abbilden lässt (Ermessen, Würdigung, Schätzung), wird bewusst **nicht**
angeboten.

**EINE Hauptseite (`/`) für alle Zielgruppen** (Aufhebung der Free/Pro-
Zweiteilung, Auftrag David 7.6.2026, FAHRPLAN-EINE-HAUPTSEITE.md):
der vollständige Katalog in 17 Rechtsgebieten als **Kachel-Katalog**
(Umbau 6.6.2026): kompakte Gebiets-Kacheln mit Inhaltsangabe unter
5 juristischen Obergruppen (Übergreifend zuerst); Klick ersetzt die
Kachel an Ort und Stelle durch das Gebiets-Panel, die übrigen rutschen
animiert nach (`?gebiet=` in der URL, teilbar). Suche als Hauptzugang:
«/» fokussiert, `?q=` teilbar, aktive Suche/Filter zeigen eine flache,
deterministisch **gerankte Trefferliste** (Titel > Keyword > Norm >
Gebiet; Goldlisten-getestet); dazu **Anliegen-Zeile** (situative
Einstiege «Urteil erhalten», «Betreibung einleiten» …, Liste in
fachlicher Abnahme) und «Zuletzt verwendet» (rein lokal — Favoriten auf
Davids Anweisung entfernt). Tabs «Verfügbar/Gesamter Katalog»
URL-synchron. Über dem Katalog eine kuratierte Chip-Zeile **«Häufig
gebraucht»** (`haeufigGebraucht.ts`, Alltagsnutzen-Reihenfolge der
früheren Free-Wand — Kern: kombinierter Fristenrechner, Verzugszins,
LIK-Teuerung, Vorsorge-Vorlagen). Pseudo-Login und Zahlungs-Gate-
Andockpunkt sind ENTFERNT; eine spätere Monetarisierung bekäme einen
neuen, funktionsbezogenen Zuschnitt (STRATEGIE-PLATTFORM, Gate G1;
Zahlungssystem unverändert undefiniert, PayPal verworfen). `/pro` und
`/fachpersonen` sind dauerhafte Redirects auf `/` (Link-Erbe).

**Zielgrösse:** über 50 Rechner und über 50 Vorlagen (Soll in
`KATALOG-ROADMAP.md`).

---

## 2. Prinzipien (Kurzfassung — verbindlich in CLAUDE.md)

1. **Fachliche Korrektheit vor allem** — lieber Duplikat als eine
   Abstraktion, die zwei rechtlich verschiedene Fälle gleich behandelt.
2. **Determinismus ohne Ausnahme** — kein LLM, kein `Date.now()` in der
   Rechenlogik; nicht Regelbasiertes bleibt im Backlog.
3. **Schichtentrennung** — Rechtslogik nur in `src/lib/`, Darstellung nur
   in `src/pages/`/`src/components/`.
4. **Eine Engine pro Rechtsgebiet** — nie zur Code-Ersparnis fusionieren;
   geteilt wird nur fachneutrale Infrastruktur.
5. **Single Source of Truth** — Katalog, Vorlagen-Schemas, Formatvorlagen,
   Behörden-Stammdaten, Formulierungskonventionen: je genau einmal; PDF,
   DOCX und Live-Vorschau rendern aus demselben Assemble-Ergebnis.
6. **Refactorings beweisen ihre Neutralität** — Golden-Output-Protokoll
   (53 Fälle, byte-Vergleich) + volle Test-/Lint-/Build-Läufe; Tests
   werden bei Refactorings nicht angepasst.
7. **Normen verifizieren, nicht vertrauen** — jeder Anker empirisch gegen
   das Fedlex-Filestore-HTML geprüft; Aufträge können irren → abweichend
   umsetzen und offenlegen.
8. **Ehrlichkeit** — Status entwurf/geprüft/geplant zeigt den echten
   Prüfstand; «geprüft» und `verified: true` setzen Davids fachliche
   Abnahme voraus (Jurist, Anwaltsprüfung BS) — **aktuell trägt nichts
   diesen Status**. Formvorschriften bestimmen die Exportformate.
9. **Deploy-Disziplin** — Bug-Check mit unabhängigen Review-Agenten und
   empirischen Repros vor jedem Deploy; Push/Deploy nur nach explizitem Ja.

---

## 3. Architektur

**Stack:** React 19 + TypeScript (strict) + Vite 8 + Tailwind 3 ·
Vitest (862 Tests in 45 Dateien) · jsPDF (PDF), docx (DOCX) ·
Vercel (statisches SPA-Hosting) — **vollständig clientseitig**, kein
Backend, keine Datenübertragung (Berufsgeheimnis-Prinzip: alle Eingaben
bleiben im Browser; «Zuletzt verwendet»/Sitzungen nur in localStorage).

```
src/
├── lib/                  Rechtslogik (Engines, rein & deterministisch)
│   ├── zpoFristen · schkgFristen · allgemeineFrist (Tagerechner)
│   ├── verzugszins · verjaehrung · gewaehrleistung · teuerung (LIK)
│   ├── sperrfristen (336c) · kuendigungsfrist · lohnfortzahlung · mietrecht
│   ├── erbteilung · erbFristen · strafRechtsmittel
│   ├── zustaendigkeit · schkgZustaendigkeit · strafZustaendigkeit
│   │                     (3 Rechtswege inkl. Rechtsmittel-Fahrplan/Kosten)
│   ├── fedlex.ts         Norm-Anker-Registry (OR/ZGB/ZPO/SchKG/ArG/VMWG/VVG…)
│   ├── bge.ts            Rechtsprechungs-Links (BGE→ATF-Permalink, Urteile→AZA)
│   ├── konventionen.ts   Zitier-/Formulierungsstandard (SSoT + Linter)
│   ├── startseiteConfig.ts  Katalog-SSoT (113 Karten, istVerfuegbar)
│   ├── katalogSuche.ts   Such-/Filter-/Rang-Logik (Goldlisten-getestet)
│   ├── anliegen.ts       situative Einstiege (Daten-SSoT)
│   ├── rechtsbereichGruppen.ts  juristische Obergruppen (5er/4er-Modell)
│   ├── haeufigGebraucht.ts  kuratierte «Häufig gebraucht»-Zeile
│   ├── schnellzugriff.ts    Zuletzt verwendet (localStorage)
│   ├── rechnerPermalinks · icsExport   Praxis-Querschnitte (teilen/Kalender)
│   ├── pdf/              PDF-Rechenbericht (Modell + Renderer, Aktenzeichen)
│   └── vorlagen/         Vorlagen-System
│       ├── engine.ts     assemble(): Schema + Antworten → Dokument
│       ├── formatvorlagen.ts  Typografie-SSoT (PDF-mm/DOCX-Twips/MUSTER)
│       ├── behoerden.ts  Behörden-Registry (vollständige Adressen)
│       ├── testament · patientenverfuegung · vorsorgeauftrag · vollmacht
│       ├── schlichtungsgesuchBs · klageVereinfacht · arbeitsvertrag
│       ├── mietvertrag (inkl. Untermiete-Weiche) · kuendigungs-Familie
│       │   (AN/AG/Mieter/Vertrag; Vermieter als Checkliste ohne Export)
│       └── vorlagenPdf · vorlagenDocx (rendern dasselbe Ergebnis)
├── data/                 Stammdaten (Feiertage/Computus 26 Kt., LIK-Reihe BFS,
│                         Schlichtungsstellen/Gerichte/StA je 26 Kt.,
│                         verifikation.ts = Rechtsprechungs-Register, 90 AZ)
├── components/           Darstellung (Forms, Visuals, Wizard, ui/)
└── pages/                Routen (Hauptseite mit Kachel-Katalog, Rechner, Wizards)
scripts/                  golden-outputs (65 Fälle) · smoke-render (23 S.)
                          · logik-sweep (11'184 Komb.) · norm-zitate-pruefen
                          · katalog-inventur · bge-register-generieren
                          · fedlex-cache.sh · lik-reihe-generieren.py
```

**Visualisierungen** (reine Ableitungen der Engine-Ergebnisse; Geometrie
nachgerechnet und quer-konsistent geprüft): FristenKalender,
Kündigungs-Zeitstrahl, Sperrtage-Zähler, Verzugszins-Zeitstrahl mit
Satz-Legende; Vorlagen-Live-Vorschau **werkgetreu** zum PDF/DOCX-Output
(geteilte MUSTER-Regexes aus der Formatvorlagen-SSoT).

**Formatvorlagen & Form-Gates:** Drei Dokumenttypen (verfügung/vertrag/
eingabe) mit fixer Typografie; `AusgabeArt` steuert hart, was exportiert
werden darf (eigenhändiges Testament → nur Abschreibe-Mustertext, kein
DOCX; Vorsorgeauftrag eigenhändig/notariell → Mustertext bzw.
Wasserzeichen-Entwurf «ENTWURF»).

**Formulierungsstandard** (`konventionen.ts` + Linter-Test über die echte
Textausgabe): ausgeschriebene Normzitate mit «lit.», BGE/BGer-Formate,
CHF-Apostroph (auch live in allen Betragsfeldern), «5 %», ausgeschriebenes
Datum im Fliesstext, Guillemets, ss statt ß, Halbgeviert als
Gedankenstrich, «zulasten».

---

## 4. Inventar (Stand 6.6.2026)

**29 verfügbare Einträge** (Status entwurf, orange = fachliche Prüfung
durch David ausstehend), 84 geplant:

| Bereich | Verfügbar |
|---|---|
| Fristen | Kombinierter Fristenrechner free (Allgemein/ZPO/SchKG, inkl. Rückwärtsrechnung, Zustell-Helfer) · ZPO-Fristen (Presets Rechtsmittel/Schlichtung/Erstinstanz, Art. 311–329) · SchKG-Fristen (Einleitung bis Konkurs, Art. 88/116/166) · Erbrechts-Fristen (Ausschlagung, Inventar, Herabsetzung) |
| Geld | Verzugszins (Teilzahlungen, Satzwechsel) · LIK-Teuerung (Indexmiete Art. 17 VMWG, Unterhalt Art. 286/128 ZGB, Wertsicherung; amtliche BFS-Reihe ab 1966, AUTO-Basis wie der BFS-Rechner) |
| Zuständigkeit | **Drei Rechtswege** (je eigene Engine + amtliche Datenschichten 26 Kantone): Zivil (Gericht·Verfahren·Schlichtung, Eingangs-Gabelung Einleitung/**Rechtsmittel-Fahrplan** inkl. Spruchkörper, Kosten je Kanton mit 52 verlinkten Erlassen) · Betreibung (Ort·Stelle·Anliegen, PLZ→Amt) · Strafverfahren (Gerichtsstand·Behörde·Rechtsmittel inkl. Straf-Rechtsmittel-Rechner) |
| Arbeit | Sperrfristen/Kündigungsfristen Art. 335c/336c OR · Lohnfortzahlung (kantonale Skalen) · Einzelarbeitsvertrag (Vorlage, KV-/KTG-Gates) · **Kündigungs-Familie**: Kündigung Arbeitnehmer:in (free) · Arbeitgeber:in (harter Sperrfristen-Blocker) |
| Miete | Mietrecht-Fristen (Kündigung, Termine, Zahlungsverzug 257d) · Mietvertrag Wohn-/Geschäftsräume (Indexmiete-/Staffel-/Kautions-Gates) · **Untermietvertrag** (Art. 262, Gewinnverbot-Warnung) · Kündigung Mieter:in (Familienwohnung-Blocker 266m) · Kündigung Vermieter:in (Checkliste ohne Export — amtliches Formular, §8-Grenze) |
| Verträge | Vertrag kündigen (Versicherung 35a VVG · Darlehen · Auftrag · Abo) · Vollmacht (Anwalt/General/Spezial, Form-Warnstufen) |
| Verjährung/Kauf | Verjährungsrechner · Gewährleistungsfristen (Kauf/Werk, SIA-Hinweise) |
| Erbrecht | Erbteilung/Pflichtteile (inkl. Güterrecht) · eigenhändiges Testament (Vorlage) |
| Vorsorge | Vorsorgeauftrag · Patientenverfügung (Vorlagen) |
| Prozess | Schlichtungsgesuch (alle Kantone, Behörden-Registry amtlich verifiziert) · Klage im vereinfachten Verfahren (BS) |

**Praxis-Querschnitte auf allen Rechnern** (FAHRPLAN-PRAXIS, 6.6.2026):
.ics-Kalender-Export mit Vorfrist-Alarm · Aktenzeichen-/Referenzfeld in
den PDF-Rechenbericht · Permalink/Teilen (Fall als URL) · kopierfertiger
**Begründungs-Absatz «Für die Rechtsschrift»** aus dem Rechenweg ·
Prefill-Brücken (Rechtsmittel-Fahrplan → ZPO-Rechner vorbefüllt,
Kündigungs-Maske ↔ Sperrfristen-Rechner, Wizard → Klage).

**Datenquellen** (statisch gebündelt, je mit Stand/Quelle/Pflegehinweis):
Fedlex-Filestore (Norm-Anker; Caches gepinnt), Feiertage 26 Kantone
(BJ-Liste + kantonale Verifikation, Computus, bedingte Feiertage),
BFS-Indexierungstabelle cc-d-05.02.08 (LIK, Lizenz OPEN-BY, monatliche
Regeneration per Skript), Behörden-Registries 26 Kantone (Schlichtung,
Gerichte, Staatsanwaltschaften, Betreibungsämter via EasyGov; amtlich
verifiziert), Rechtsprechungs-Register (90 BGE/BGer mit amtlichen
bger.ch-Links — Schema empirisch verifiziert; Web-Anzeige verlinkt
Zitate in Rechenweg/Warnungen/Annahmen).

---

## 5. Qualitätssicherung

- **863 Vitest-Tests in 45 Dateien**: Akzeptanztests je Engine/Vorlage,
  Registry-Invarianten, Konventions-Linter über die echte Textausgabe,
  SSR-Akzeptanz der Seiten (Hauptseiten-/Kachel-Anatomie),
  Trennungs-Querschnitt der Fristen-Engines, **Suchbegriff-Goldliste**
  (Laie/Fach/Normzitat → erwartete Karte, inkl. Rang-Ordnung) und
  Rechtsprechungs-Link-Schema.
- **Golden-Output-Protokoll**: 65 eingefrorene Fälle über alle Engines,
  Vorlagen und Gates; `vergleich`-Modus beweist Verhaltensneutralität vor
  jedem Refactoring (CLAUDE.md §6 — Pflicht).
- **Dauerwerkzeuge** (bei Engine-Änderungen mitlaufen lassen):
  `logik-sweep` (Invarianten über 11'184 Eingabe-Kombinationen der drei
  Zuständigkeits-Engines) · `norm-zitate-pruefen` (261 Art.-Zitate gegen
  die gepinnten Fedlex-Caches) · `katalog-inventur` (Metadaten-Lücken) ·
  `bge-register-generieren` (Rechtsprechungs-Register + Lückenmeldung).
- **Smoke-Render**: alle 23 Seiten SSR-fehlerfrei.
- **Review-Agenten vor jedem Deploy**: unabhängige Bug-Checks mit
  empirischen Repros (Logik-Nachrechnung aller Engines, Visual-Geometrie
  <0.001 % Toleranz, Quer-Konsistenz, Mobile-Forensik, PDF-Sichtprüfung).
- **Empirische Norm-Verifikation**: Anker gegen das konsolidierte
  Filestore-HTML (auch Wortlaut, z. B. Art. 17 VMWG byte-genau);
  Rechtsprechung trägt «zu verifizieren»-Vorbehalte und verlinkt auf die
  amtliche Entscheiddatenbank (bger.ch; Schema WebFetch-verifiziert).
- **Bibliothek** (`bibliothek/`, 46 Dossiers in 6 Ordnern, CLAUDE.md §11):
  jede Recherche mündet in eine geordnete, engine-orientierte
  Übersichtsliste mit amtlichen Quellen, Abrufdatum und ehrlichem
  Abnahme-Status; dazu Quellen-/Parameter-Verfalls- und
  Rechtsprechungs-Register.

**Bewusst offene Punkte** (Davids Entscheid): Sperrtage-
Anzeigekonvention (Art.-77-Zählung vs. Kalendertage — Endtermine
identisch); Wort-für-Wort-Abnahme aller Vorlagen («geprüft»-Hebung);
AVE-GAV-Beobachtung (19.6.2026); kantonale Verifikationen ausserhalb BS;
Touch-Ziele < 44 px (Polish-Liste).

---

## 6. Betrieb & Pflege

- **Deploy** (Weg 1, David 3.7.2026): Merge nach `main` = Auto-Prod-Deploy
  via Vercel (Projekt lexmetrik); Push/PR/Auto-Merge stehend freigegeben,
  §9-Sorgfalt vor dem Merge; danach Live-Verifikation (Asset-Hash).
- **Monatlich**: LIK-Reihe nach BFS-Publikation regenerieren
  (`scripts/lik-reihe-generieren.py`, Anleitung im Skript-Kopf).
- **Periodisch**: Referenzzinssatz (Mietrecht), Feiertagsverzeichnis,
  Behördenadressen (Stand-Vermerke in den Registries), Fedlex-
  Konsolidierungsstände.
- **Arbeitsweise**: Aufträge kommen als Markdown-Berichte (Downloads),
  werden gegen den Ist-Stand abgeglichen (Berichte können veraltet sein
  oder irren), empirisch verifiziert umgesetzt und lokal in kleinen,
  einzeln bewiesenen Schritten committet.
