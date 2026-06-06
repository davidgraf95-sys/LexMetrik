# LexMetrik — Projektbeschrieb

**Stand:** 5. Juni 2026 (abends) · **Produktion:** https://lexmetrik.vercel.app ·
**Repo:** github.com/davidgraf95-sys/LegalCalc · Marke: **LexMetrik** (grosses M)

Dieses Dokument beschreibt das Projekt als Ganzes: Idee, Prinzipien,
Architektur, Inventar, Qualitätssicherung und Pflege. Es ergänzt
`CLAUDE.md` (verbindliche Arbeitsprinzipien), `STRUKTUR.md` (laufend
gepflegter technischer Stand) und `KATALOG-ROADMAP.md` (Soll-Inventar).

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

**Das zentrale Produktversprechen: Berechnung statt KI.** LexMetrik nutzt
kein Sprachmodell und keine Wahrscheinlichkeiten. Gleiche Eingaben ergeben
immer dasselbe Ergebnis; jeder Rechenschritt und jeder Baustein ist
offengelegt und jede fest verdrahtete Norm artikelgenau auf den
konsolidierten Gesetzestext (Fedlex) verlinkt. Was sich nicht regelbasiert
abbilden lässt (Ermessen, Würdigung, Schätzung), wird bewusst **nicht**
angeboten.

**Zielgruppen und Arbeitsteilung der Seiten:**
- **Free (`/`)** — kuratierte, **flache Kachel-Startseite** für
  Privatpersonen: zwei Blöcke (Rechner/Vorlagen) in Alltagsnutzen-
  Reihenfolge (`freeReihenfolge.ts`), ohne Filter-/Katalog-Apparat. Kern:
  der kombinierte **Fristenrechner für die meisten Verfahren** (Allgemein
  OR/ZGB · Zivilprozess ZPO · Betreibung SchKG — drei getrennte Engines,
  ein Einstieg), Verzugszins, LIK-Teuerung sowie die Vorsorge-Vorlagen
  (Testament, Vorsorgeauftrag, Patientenverfügung).
- **Pro (`/pro`)** — vollständiger Katalog für die anwaltliche Praxis:
  111 Einträge (17 sofort verfügbar) in 17 Rechtsgebieten, gruppiert nach
  juristischen Obergruppen (Zivilprozess & Vollstreckung zuerst; Sektionen
  starten eingeklappt mit «X verfügbar · Y in Vorbereitung»-Zählern), Tabs
  «Verfügbar/Gesamter Katalog» (URL-synchron), gruppierte Scrollspy-
  Navigation, Volltext-/Norm-Suche, Filter und Schnellzugriff (★ Favoriten
  + Zuletzt verwendet, rein lokal). Pro-Sitzung überlebt das Neuladen;
  Zahlungs-Gate vorbereitet (`PAYWALL_ACTIVE = false`), bewusst inaktiv; das Zahlungssystem ist noch nicht definiert (Entscheid 6.6.2026 — PayPal aus der Planung genommen).

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
Vitest (451 Tests in 24 Dateien) · jsPDF (PDF), docx (DOCX) ·
Vercel (statisches SPA-Hosting) — **vollständig clientseitig**, kein
Backend, keine Datenübertragung (Berufsgeheimnis-Prinzip: alle Eingaben
bleiben im Browser; Favoriten/Sitzungen nur in localStorage).

```
src/
├── lib/                  Rechtslogik (Engines, rein & deterministisch)
│   ├── zpoFristen · schkgFristen · allgemeineFrist (Tagerechner)
│   ├── verzugszins · verjaehrung · gewaehrleistung · teuerung (LIK)
│   ├── sperrfristen (Art. 336c OR) · lohnfortzahlung · mietrecht
│   ├── erbteilung · zustaendigkeit
│   ├── fedlex.ts         Norm-Anker-Registry (OR/ZGB/ZPO/SchKG/ArG/VMWG)
│   ├── konventionen.ts   Zitier-/Formulierungsstandard (SSoT + Linter)
│   ├── startseiteConfig.ts  Katalog-SSoT (111 Karten, istVerfuegbar)
│   ├── rechtsbereichGruppen.ts  juristische Obergruppen (5er/4er-Modell)
│   ├── freeReihenfolge.ts   kuratierte Free-Reihenfolge
│   ├── schnellzugriff.ts    Favoriten/Zuletzt (localStorage)
│   ├── pdf/              PDF-Rechenbericht (Modell + Renderer)
│   └── vorlagen/         Vorlagen-System
│       ├── engine.ts     assemble(): Schema + Antworten → Dokument
│       ├── formatvorlagen.ts  Typografie-SSoT (PDF-mm/DOCX-Twips/MUSTER)
│       ├── behoerden.ts  Behörden-Registry (vollständige Adressen)
│       ├── testament · patientenverfuegung · vorsorgeauftrag
│       ├── schlichtungsgesuchBs · arbeitsvertrag · mietvertrag
│       └── vorlagenPdf · vorlagenDocx (rendern dasselbe Ergebnis)
├── data/                 Stammdaten (Feiertage/Computus, LIK-Reihe BFS)
├── components/           Darstellung (Forms, Visuals, Wizard, ui/)
└── pages/                Routen (Free-Wand, Pro-Katalog, Rechner, Wizards)
scripts/                  golden-outputs (53 Fälle) · smoke-render (18 S.)
                          · lik-reihe-generieren.py (BFS-Pflege)
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

## 4. Inventar (Stand 5.6.2026)

**17 verfügbare Einträge** (Status entwurf, orange = fachliche Prüfung
durch David ausstehend), 94 geplant:

| Bereich | Verfügbar |
|---|---|
| Fristen | Kombinierter Fristenrechner free (Allgemein/ZPO/SchKG, inkl. Rückwärtsrechnung, Zustell-Helfer, .ics, Permalink) · ZPO-Fristen · SchKG-Fristen (je auch Pro-Direkteinstieg) |
| Geld | Verzugszins (Teilzahlungen, Satzwechsel) · LIK-Teuerung (Indexmiete Art. 17 VMWG, Unterhalt Art. 286/128 ZGB, Wertsicherung; amtliche BFS-Reihe ab 1966, AUTO-Basis wie der BFS-Rechner) |
| Arbeit | Sperrfristen Art. 336c OR · Lohnfortzahlung (Skalen BE/ZH/BS) · Einzelarbeitsvertrag (Vorlage v1.1, KV-/KTG-Gates) |
| Miete | Mietkündigungs-Termine · Mietvertrag (Vorlage v1.1, Indexmiete-/Staffel-/Kautions-Gates) |
| Verjährung/Kauf | Verjährungsrechner · Gewährleistungsfristen |
| Erbrecht | Erbteilung/Pflichtteile (inkl. Güterrecht) · eigenhändiges Testament (Vorlage) |
| Vorsorge | Vorsorgeauftrag · Patientenverfügung (Vorlagen) |
| Prozess | Schlichtungsgesuch (Kantonswahl + Handadressen-Override, Behörden-Registry amtlich verifiziert; BS produktiv) · Zuständigkeitsrechner |

**Datenquellen** (statisch gebündelt, je mit Stand/Quelle/Pflegehinweis):
Fedlex-Filestore (Norm-Anker), EJPD-Feiertagsverzeichnis + Computus,
BFS-Indexierungstabelle cc-d-05.02.08 (LIK, Lizenz OPEN-BY, monatliche
Regeneration per Skript), Staatskalender BS (Behördenadressen).

---

## 5. Qualitätssicherung

- **451 Vitest-Tests**: Akzeptanztests je Engine/Vorlage, Registry-
  Invarianten (Hausnummern-Pflicht, Gruppen-Vollständigkeit beider
  Modelle, FREE_REIHENFOLGE), Konventions-Linter über die echte
  Textausgabe, SSR-Akzeptanz der Seiten (Free-Flachheit, Pro-Schutz),
  Trennungs-Querschnitt der drei Fristen-Engines.
- **Golden-Output-Protokoll**: 53 eingefrorene Fälle über alle Engines,
  Vorlagen und Gates; `vergleich`-Modus beweist Verhaltensneutralität vor
  jedem Refactoring (CLAUDE.md §6 — Pflicht).
- **Smoke-Render**: alle 18 Seiten SSR-fehlerfrei.
- **Review-Agenten vor jedem Deploy**: unabhängige Bug-Checks mit
  empirischen Repros (Logik-Nachrechnung aller Engines, Visual-Geometrie
  <0.001 % Toleranz, Quer-Konsistenz, Mobile-Forensik, PDF-Sichtprüfung).
- **Empirische Norm-Verifikation**: Anker gegen das konsolidierte
  Filestore-HTML (auch Wortlaut, z. B. Art. 17 VMWG byte-genau);
  Rechtsprechung trägt «zu verifizieren»-Vorbehalte.

**Bewusst offene Punkte** (Davids Entscheid): Sperrtage-
Anzeigekonvention (Art.-77-Zählung vs. Kalendertage — Endtermine
identisch); Wort-für-Wort-Abnahme aller Vorlagen («geprüft»-Hebung);
AVE-GAV-Beobachtung (19.6.2026); kantonale Verifikationen ausserhalb BS;
Touch-Ziele < 44 px (Polish-Liste).

---

## 6. Betrieb & Pflege

- **Deploy**: `npx vercel --prod` (Projekt lexmetrik) — nur nach Davids
  explizitem Ja; danach Live-Verifikation (Asset-Hash).
- **Monatlich**: LIK-Reihe nach BFS-Publikation regenerieren
  (`scripts/lik-reihe-generieren.py`, Anleitung im Skript-Kopf).
- **Periodisch**: Referenzzinssatz (Mietrecht), Feiertagsverzeichnis,
  Behördenadressen (Stand-Vermerke in den Registries), Fedlex-
  Konsolidierungsstände.
- **Arbeitsweise**: Aufträge kommen als Markdown-Berichte (Downloads),
  werden gegen den Ist-Stand abgeglichen (Berichte können veraltet sein
  oder irren), empirisch verifiziert umgesetzt und lokal in kleinen,
  einzeln bewiesenen Schritten committet.
