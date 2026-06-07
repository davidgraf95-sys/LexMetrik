# FAHRPLAN — Startseite deutlich übersichtlicher (Auftrag David 7.6.2026)

**Auftrag (wörtlich):** «erstelle handlungsplan zum startseite viel
übersichtlicher zu machen» — mit Design-Skill (frontend-design) als
Leitplanke. Reine Darstellungsschicht (§3): keine Engine, kein Golden,
keine Katalog-Daten betroffen.

## Befund (empirisch, Headless-Chrome 1440px, Stand `795a17e`)

Die Seite ist ~3'200 px hoch und stapelt **6 parallele Einstiegssysteme**,
die alle dasselbe leisten (ein Werkzeug finden):

| # | System | Problem |
|---|---|---|
| 1 | Hero (Headline + 4-Zeilen-Absatz + Kennzahlen + 3 Methodik-Anker) | drei Informationsschichten VOR dem ersten Werkzeug |
| 2 | Chip-Zeile «Häufig gebraucht» (9 Chips) | optisch IDENTISCH mit #4 — zwei gleich aussehende Zeilen, zwei Logiken |
| 3 | Seitenleiste: Suchfeld + Gebietsliste (17) + Filtergruppen | die Gebietsliste DUPLIZIERT das Kachel-Raster 1:1 auf demselben Bildschirm |
| 4 | Anliegen-Zeile (8 Chips) + Schnellzugriff-Hinweis | s. #2; Hinweistext («erscheinen hier automatisch») füllt Leerzustand mit Prosa |
| 5 | Tabs Verfügbar/Gesamt + 5 Obergruppen-Titel + 17 Kacheln | Kacheln ungleich hoch, je Titel + Zähler + mehrzeilige Inhaltsangabe = Textwand |
| 6 | Fuss: 4 Methodik-Karten mit Langtexten | dupliziert /methodik; verlängert die Seite um einen Bildschirm |

Dazu: Entwurf-Legende schwebt kontextlos zwischen Chips und Katalog;
Mobil-Overflow 390px vorbestehend (FAHRPLAN-DESIGN E4, anderer Strang).

## Leitidee (Designsprache, Skill-gestützt)

**«Kanzlei-Register»** — Übersichtlichkeit durch SUBTRAKTION und klare
Zonen, nicht durch neue Module. Drei Zonen, je EIN Zweck:

1. **Kopf** (ein Blick): Wer wir sind + EIN Satz Nutzen + Kennzahlen.
2. **Einstieg** (eine Handlung): EIN Suchfeld in voller Breite + EINE
   Chip-Zeile.
3. **Register** (eine Ordnung): das Kachel-Raster in voller Breite,
   typografisch beruhigt — das Raster IST die Seite.

Signature-Element bleibt die Messing-Ablesekante (scale-rule); keine
neuen Farben/Effekte. Konform mit Davids Richtung «nüchtern &
juristisch» (bestätigt 5.6.2026): Eleganz durch Präzision in Abstand,
Typo-Hierarchie und Wegnahme — nicht durch Dekoration.

## Etappen (je Etappe Tore + Commit; Vorher/Nachher-Screenshots Pflicht)

### U1 — Hero halbieren
- Untertitel auf EINEN Satz kürzen (heute 4 Zeilen Aufzählungs-Prosa —
  die Aufzählung leistet das Register besser).
- Die 3 Methodik-Anker-Zeilen RAUS (leben auf /methodik und in der
  Fuss-Sektion); Kennzahlen-Messzeile bleibt (einzige Zahlenangabe).
- Ergebnis: Kopf ≈ 40 % flacher, Suche ohne Scrollen sichtbar.

### U2 — EIN Einstieg statt drei (D-A)
- Suchfeld aus der Seitenleiste in eine **prominente Suchleiste in
  voller Breite** direkt unter dem Hero (grösstes interaktives Element
  der Seite; «/»-Fokus und `?q=`-Permalink unverändert).
- «Häufig gebraucht» und «Anliegen» zu **EINER Chip-Zeile** vereinen
  (Default D-A: Anliegen-Chips zuerst [situativ, laienfreundlich],
  dahinter die Werkzeug-Chips; ein Stil, eine Zeile, max. ~10 sichtbar,
  Rest hinter «mehr …»-Aufklapper). lib/anliegen.ts +
  haeufigGebraucht.ts bleiben getrennte SSoT (§5) — nur die DARSTELLUNG
  vereint.
- «Zuletzt verwendet» bleibt, erscheint aber NUR wenn nicht leer
  (Hinweis-Prosa «erscheinen hier automatisch» entfällt — Leerzustand
  braucht keine Erklärung).

### U3 — Seitenleiste auflösen (D-B)
- Gebietsliste raus (Duplikat des Rasters); Status-/Typ-Filter als
  kompakte Zeile in den Katalog-Kopf (neben die Tabs).
- Kachel-Raster erhält die volle Inhaltsbreite → 17 Kacheln in
  ruhigerem, breiterem Raster; weniger Umbrüche.
- Nebeneffekt prüfen: ob der 390px-Overflow damit bereits entschärft
  ist (Sidebar-Grid war Breitentreiber-Verdacht).

### U4 — Register beruhigen
- Kachel-Anatomie vereinheitlichen: Titel · Zähler rechtsbündig ·
  Inhaltsangabe auf EINE Zeile geklemmt (line-clamp-1; Volltext steht
  im Panel) → einheitliche Kachelhöhe, scanbare Spalten.
- Obergruppen-Titel als stille Overline-Zeilen (heute h2-Gewicht mit
  Ablesekante je Gruppe — 5 konkurrierende Schwergewichte).
- Entwurf-Legende aus dem Seitenfluss in den Katalog-Kopf (eine stille
  Zeile bei den Tabs, wo der Status auch entsteht).

### U5 — Fuss entschlacken (D-C)
- 4 Methodik-Langtext-Karten → EINE kompakte Zeile («Berechnung statt
  KI · verifizierte Normverweise · offengelegter Rechenweg») mit Link
  auf /methodik (SSoT der Texte dort; heute Duplikat).
- Rechtlicher Hinweis bleibt unverändert (Pflicht, §8).

### U6 — Abschluss
- katalog.test.tsx anpassen (deklariert §6.3: Anliegen-Zeile-Assertions
  auf neue Struktur, Hinweis-Prosa-Assertion raus); Suchbegriff-
  GOLDLISTE unverändert (Suche selbst unberührt).
- Tore komplett (tsc · Suite · Lint voll · Build · Smoke · Golden
  84/84 als Unberührtheits-Beweis) + Headless-Chrome Vorher/Nachher
  1440/768/390 + Bug-Check light (1 Agent: Klickwege, Tastatur «/»,
  Permalinks ?q=/?gebiet= nach Umbau).
- STRUKTUR.md (IA-Kapitel) + dieser Fahrplan nachführen.

## Entscheide David (mit Default — Umsetzung läuft ohne Rückfrage durch)

- **D-A Chip-Zeilen:** (Default) EINE Zeile, Anliegen zuerst + Werkzeuge
  dahinter, «mehr …»-Aufklapper · Alternativen: nur Anliegen behalten /
  nur Häufig-gebraucht behalten. (Anliegen-Liste bleibt ENTWURF bis zu
  deiner Abnahme — unverändert.)
- **D-B Seitenleiste:** (Default) ganz auflösen, Filter in den
  Katalog-Kopf · Alternative: schmale Leiste nur mit Filtern behalten.
- **D-C Methodik-Fuss:** (Default) auf eine Zeile + /methodik-Link
  kürzen · Alternative: Karten behalten, Texte auf je 1 Satz klemmen.
- **D-D Hero-Untertitel:** (Default) ein Satz: «Fristen, Beträge und
  Dokumente nach festen Regeln – ohne Sprachmodell, jede Norm mit dem
  Gesetzestext verlinkt.» · Alternative: dein Wortlaut.

## Risiken / Hinweise

- Reine §3-Darstellungsänderung; Suche/Ranking/Panels/Permalinks
  funktional unverändert — die Akzeptanztests sichern das.
- Parallel-Session aktiv (AG-Perfektion): Katalog.tsx/Startseite.tsx
  vor Beginn auf fremdes WIP prüfen; LEKTION GETEILTER INDEX beachten
  (eigene Umbauten in EINEM Zug add+commit).
- Aufwand: 1 Session. Reihenfolge U1→U5 beliebig parallelisierbar,
  U3 vor U4 (Rasterbreite zuerst).
