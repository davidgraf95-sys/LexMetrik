# Handlungsplan — Review-Durchgang David, 24.6.2026

Aus einem Live-Durchgang über `lexmetrik.vercel.app` gemeldete Punkte,
konsolidiert und in Umsetzung. Branch: `review-durchgang-2026-06-24`.
Deploy erst nach ausdrücklichem Ja (§9). Alles golden-byte-gleich, wo
Rechtslogik berührt würde (§3/§6).

## Diagnosen (vom Nutzer als Frage gestellt)

### F1 — „Urteil aus der Zukunft" (`gr_gerichte_ZR12024196`, datum 2026-06-26)
Befund: Import übernimmt `decision_date` **wortwörtlich aus der Quelle**
(`adapter-entscheide.ts:329`). Das Datum liegt 3 Tage **nach** dem Crawl
(`erzeugt: 2026-06-23`) → unmögliches Quelldatum. Einziger Fall unter 295.

### F2 — BGE „sehen oft anders aus"
Befund: reine Extraktions-Qualität. Nur **34 %** aller Erwägungs-Blöcke
tragen eine `marke` (Erwägungs-Nr). Dadurch rendern **168/265** BGE flach
als Fliesstext (Renderer-Zweig „markenlose Erwägung"), **97/265**
strukturiert. Zusätzlich schwankt das Absatz-Chunking der Quelle (1–38
Blöcke/Entscheid). → siehe A2 (Priorität des Nutzers).

## Arbeitspakete

### A — Rechtsprechung: Datenqualität & Darstellung
- **A1** Zukunfts-Datum-Wächter im Import (`datum > Abrufdatum` →
  ablehnen + Log); Eintrag `gr_gerichte_ZR12024196` bereinigen.
- **A2 (PRIORITÄT)** BGE-Darstellung **vereinheitlichen**: führende
  Erwägungs-Ziffern deterministisch in `marke` parsen, damit alle
  Entscheide konsistent die strukturierte Lese­ansicht (nummeriert,
  eingerückt, zitierbar) treffen. Block-Chunking angleichen.
- **A3** Sortier-Dropdown in Rechtsprechung abgeschnitten → Overflow/
  z-index/Portal beheben.

### B — Seitenleiste
- **B1** Klick auf „Kantone (Gesetze/Rechtsprechung)" markiert ALLE
  Kantone aktiv → Präfix-/Parent-Match in der Aktiv-Logik korrigieren.

### C — Startseite
- **C1** Reihenfolge neu: **Suche → Schnell rechnen → Gesetze-Rubrik
  (NEU) → BGer-News**. Gesetze-Rubrik kombiniert: Suchfeld in die
  Gesetzes-Volltextsuche + Chips zu Top-Erlassen (OR/ZGB/BV …).
- **C2** Fristen-Schnellrechner: Kalender visualisiert das **Resultat
  des Eingabeformulars** (heute laufen Form + Kalender unabhängig) +
  Eingabeseite auf gleiche Ebene wie Kalender ausrichten.
- **C3** BGer-News: per Klick durchblättern (Navigation/Carousel).
- **C4** „Weiter wo du warst"-Verlauf von der Startseite entfernen
  (redundant zur Tableiste).

### D — Gesetze-Detailseite
- **D1** Block „Passende Werkzeuge" + „Bundesgerichtsentscheide zu
  diesem Erlass" standardmässig eingeklappt, nur auf Klick aufklappen.

### E — Tableiste
- **E1** Tabs per Drag-and-Drop umsortieren.

### F — Rubrik-Beschriftung (römische Marker weg)
- **F1** Römische Rubrik-Marker entfernen: `SeitenKopf`-Overlines
  „Rubrik V · Gesetze" (`Gesetze.tsx:338`) und „Rubrik VI ·
  Rechtsprechung" (`Rechtsprechung.tsx:130`) sowie das `numeral`-Feld
  („IV" + „N verfügbar"-Kopf) auf der Vorlagen-/Rubrik-Übersicht
  (`oberkategorien.ts`, gerendert in `KategorieSektion`). Erscheinen
  ohne Mehrwert.

## Tore (§6/§9)
`npm run gate` (tsc/lint/Tests/build/golden byte-gleich) nach jedem
Paket; Playwright hell+dunkel+mobil für UI-Pakete; adversarialer
Bug-Check vor Abnahme. Kein Deploy ohne Davids Ja.
