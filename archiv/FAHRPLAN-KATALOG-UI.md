# Fahrplan Katalog-/Auswahl-UI (erstellt 6.6.2026, Auftrag David)

**Ziel:** Praxistauglichkeit der **Auswahl-Schicht** — wie schnell findet eine
Fachperson (Pro) bzw. ein Laie (Free) das richtige Werkzeug? Gegenstand sind
ausschliesslich die Einstiegsseiten und der Katalog (Startseite.tsx, Pro.tsx,
Katalog.tsx, RechnerKarte.tsx, schnellzugriff.ts, Katalog-Metadaten in
startseiteConfig.ts). **Nicht Gegenstand:** die Engines und Rechner-Seiten
selbst — dafür läuft FAHRPLAN-PRAXIS.md (parallele Session, Dateien dort
nicht anfassen; vor jedem Edit `git status` prüfen, kleine Commits).

**Befund (Ist, 6.6.2026):** Free = kuratierte flache Wand (gesund). Pro =
148 Einträge / 28 verfügbar; Sektionen starten zugeklappt (Entscheid David
5.6.); Suche klein in der Seitenleiste, Treffer klappen nur Sektionen auf;
`keywords` lückenhaft; `szenarien` auf Karten nicht klickbar (obwohl
Hash-Vorauswahl als Muster existiert, #schkg/#straf); Einstieg rein
taxonomisch nach Rechtsgebiet, kein situativer Zugang.

## Etappe 0 — Messlatte zuerst: Auffindbarkeit testbar machen (klein)

0.1 **Suchbegriff-Goldliste als Test** — `suchbegriffe.test.ts`: Paare
    (Praxis-Suchbegriff → erwartete Karten-ID) über drei Begriffsklassen:
    Laienbegriff («gekündigt worden»), Fachbegriff («Rechtsvorschlag»),
    Normzitat («Art. 311», «311 ZPO»). Der Test fährt gegen dieselbe
    `passt()`-Logik wie die UI (dafür aus Katalog.tsx in eine lib-Funktion
    extrahieren — verhaltensneutral, §6). → Jede spätere Etappe beweist
    ihre Wirkung an dieser Liste; David liefert/ergänzt die Begriffe.

0.2 **Metadaten-Inventur** — Skript zählt je Karte: keywords vorhanden?
    related gepflegt? szenarien vorhanden? Ergebnis als Lückenliste
    (analog Feature-Inventur der Parallel-Session). Reine Diagnose.

## Etappe 1 — Suche zur Hauptstrasse ausbauen (Pro, klein–mittel)

1.1 **Keyword-/Synonym-Ausbau** (nur Daten, §5: alles in startseiteConfig):
    Lückenliste aus 0.2 abarbeiten — je Karte Laiensynonyme, Fachsynonyme,
    typische Normzitate. Abnahme der Begriffe durch David (fachkundige
    Person), kein automatisches Erraten.

1.2 **Gerankte Treffer-Liste bei aktiver Suche** — statt aufgeklappter
    Sektionen eine flache, deterministisch sortierte Liste (Titeltreffer >
    Keyword > Norm > Beschrieb; bei Gleichstand Katalog-Reihenfolge).
    Kompakte Zeilen statt grosser Karten: Titel · Gebiet · Status · Öffnen.
    → Suchen-und-Öffnen in einem Blick, ohne Scrollen durch Sektionen.

1.3 **Suche in der URL** (`?q=`) — teil- und lesezeichenfähig wie der
    Ansicht-Tab; Zurück-Taste stellt die Suche wieder her.

1.4 **Tastatur-Komfort** — «/» fokussiert das Suchfeld, ↑/↓ + Enter in der
    Treffer-Liste. KEINE neue ⌘K-Palette (wurde 5.6. bewusst entfernt) —
    nur das bestehende Feld bedienbarer machen.
    **Entscheid David:** bleibt die Suche in der Seitenleiste (Entscheid
    5.6. «ein Ort für alles Steuernde») oder rückt sie prominent über den
    Katalog? Beides ist mit 1.2 kompatibel.

## Etappe 2 — Situativer Einstieg: Anliegen statt Taxonomie (mittel)

2.1 **Anliegen-Zeile in Pro** — eine Reihe nüchterner Einstiege über dem
    Katalog, je ein Praxis-Anlass → direktes Ziel oder kleine Zielgruppe:
    «Urteil/Entscheid erhalten» → Rechtsmittel-Fahrplan · «Frist berechnen»
    → Tagerechner/ZPO/SchKG · «Kündigung erhalten/aussprechen» →
    Kündigungs-Familie · «Betreibung» → SchKG-Strecke · «Vertrag aufsetzen»
    → Vorlagen. SSoT: neue `lib/anliegen.ts` (nur IDs + Labels, keine
    Rechtslogik); zeigt nur Verfügbares (§8). **Die Anliegen-Liste
    formuliert David** — sie ist eine fachliche Aussage darüber, wie
    Mandate beginnen.

2.2 **Szenarien klickbar machen** — `szenarien` auf Karten (z. B. die drei
    Rechtswege der Zuständigkeit) werden Deep-Links, wo die Zielseite eine
    Vorauswahl unterstützt (Muster #schkg/#straf existiert). Erst
    Inventur: welche Zielseiten können Vorauswahl? Nur diese verlinken —
    keine toten Hashes. Karten-intern als eigene Links (stretched-link-
    Anatomie beachten, keine verschachtelten Anker).

2.3 **`related`-Graph komplettieren** — Inventur aus 0.2: Karten ohne
    Verwandte nachpflegen (nur Daten). Der Querverweis auf der Karte ist
    der billigste «Falsch abgebogen?»-Ausweg.

## Etappe 3 — Pro als tägliche Arbeitsfläche (mittel, nach Entscheid)

3.1 **Kompakte Listen-Ansicht als Toggle** — neben der Kachel-Ansicht eine
    dichte Tabelle (Titel · Gebiet · Status · Norm-Kürzel · Öffnen), in
    der URL gespiegelt. Für tägliche Nutzer schlägt Dichte die Optik;
    Richtung «nüchtern & juristisch» trägt das. **Entscheid David:**
    will er das überhaupt, und welche Spalten?

3.2 **«Zuletzt verwendet» direkt im Blick halten** — bleibt die einzige
    Personalisierung (KEINE Favoriten — Anweisung David 5.6.2026).
    Prüfen: Platzierung über den Tabs statt darunter, damit der häufigste
    Handgriff (gestern weiterarbeiten) der erste Klick ist.

3.3 **Schnellwechsel aus den Werkzeugen heraus** — wer in einem Rechner
    steht und das nächste Werkzeug braucht, soll nicht über die Startseite
    müssen: Header-Link «Katalog» mit Sprung auf `/pro?q=` (fokussierte
    Suche, baut auf 1.3/1.4). Kein neues UI-Muster, nur ein Einstiegspunkt.

## Etappe 4 — Free-Feinschliff (klein, zuletzt)

4.1 **Anliegen statt Werkzeugnamen prüfen** — die Free-Wand ist kuratiert
    und klein; prüfen, ob eine schmale Anliegen-Zeile («Vorsorge regeln»,
    «Mahnung schreiben», «Frist prüfen») den Laien-Einstieg verbessert,
    ohne die Wand zu verdoppeln. Erst Konzept, dann Entscheid David.

4.2 **Pro-Teaser-Wirksamkeit** — Highlights datengetrieben lassen, aber
    prüfen, ob die Chips auf konkrete Anliegen (2.1) statt Titel zeigen.

## Leitplanken

- **Keine Favoriten** (Anweisung David 5.6.2026) — «Zuletzt verwendet»
  bleibt die einzige Personalisierung.
- §5: Jede neue Auswahl-Struktur (Anliegen, Synonyme) lebt als Daten in
  EINER lib-Datei, nie hartkodiert in Views; §8: nur Verfügbares anbieten.
- §3: reine Darstellungs-/Datenschicht — keine Engine, keine Rechner-Seite
  wird angefasst; null Überschneidung mit FAHRPLAN-PRAXIS.md (parallele
  Session). Gemeinsame Datei ist einzig `startseiteConfig.ts` (Metadaten) —
  dort kleinteilig committen und vor jedem Edit den Tree prüfen.
- Richtung «nüchtern & juristisch»: Typografie und Dichte statt Farbe und
  Animation; keine Paletten, keine Overlays.
- Jede Etappe: volle Suite + Lint mit echtem Exit-Code; UI-Umbauten an der
  Suchbegriff-Goldliste (0.1) gemessen.

## Entscheide David (gesammelt)

- E1 Suchposition: Seitenleiste behalten oder über den Katalog? (1.4)
- E2 Anliegen-Liste Pro: welche Praxis-Anlässe, welche Reihenfolge? (2.1)
- E3 Listen-Ansicht: gewünscht? Spalten? (3.1)
- E4 Free-Anliegen-Zeile: ja/nein nach Konzept (4.1)
- E5 Suchbegriff-Goldliste: Begriffe ergänzen/abnehmen (0.1)

## Status (umgesetzt 6.6.2026 nachts, Davids Freigabe «führe den Plan frei durch»)

- [x] 0.1 Goldliste (48 Paare, katalogSuche.test.ts) + Extraktion lib/katalogSuche.ts — `11fda02`
- [x] 0.2 Inventur scripts/katalog-inventur.ts — Befund: 0 Karten ohne keywords/related,
      0 kaputte IDs; Lücke lag in der Begriffs-BREITE, nicht im Ob
- [x] **Kachel-Katalog (Live-Auftrag David, ersetzt Sektionen-Strom):** Gebiets-Kacheln
      mit Inhaltsangabe unter den 5 Obergruppen; Klick öffnet Panel in voller Breite
      unter der Kachel-Zeile (`?gebiet=` in URL); nur ein Panel zugleich — `4d927ee`
      · **Nachschärfung (Wunsch David):** FOKUS-Ansicht — beim Öffnen verschwinden die
      Oberkacheln, das Panel übernimmt; «← Alle Rechtsgebiete»/Zurück-Taste zurück;
      animiert (View Transition + lc-reveal, reduced-motion-fest) — `75fdfdf`
- [x] 1.1 Keyword-Ausbau, am Engine-/Preset-Code verifiziert (zpoPresets 311/314/321/…,
      schkgPresets 88/116/166, Wizard-Rechtsmittel/Scheidung); Keywords kompakt
      verglichen wie Normen («Art.311» = «311 ZPO») — `5186802`
- [x] 1.2 Gerankte flache Trefferliste bei aktiver Suche/Filter (Titel > Keyword exakt
      > Keyword > Norm > Gebiet; Treffermenge bewiesen unverändert) — in `4d927ee`
- [x] 1.3 `?q=` in der URL (replace; teilbar; SSR-getestet) — `5186802`
- [x] 1.4 «/» fokussiert das Suchfeld; aria-keyshortcuts — `5186802`
      · **E1 entschieden:** Suche bleibt in der Seitenleiste (Entscheid 5.6. respektiert)
- [x] 2.1 Anliegen-Zeile (lib/anliegen.ts, 8 Anlässe) — `af4383f`
      · **E2: Liste ist ENTWURF Claude — fachliche Abnahme David offen**
- [x] 2.2 per Inventur erledigt: alle Hash-Vorauswahl-Ziele (#schkg/#straf/#kuendigung/
      #lohnfortzahlung/#untermiete) sind bereits eigene Katalog-Karten — nichts zu bauen
- [x] 2.3 related-Graph: Inventur = 0 Lücken (94 Einbahnen sind gewollt → Geplantes)
- [x] 3.1 **E3 entschieden: entfällt** — Kacheln + flache Trefferliste decken den
      Dichte-Bedarf; ein zusätzlicher Listen-Toggle wäre ein drittes Muster
- [x] 3.2 «Zuletzt verwendet» + Anliegen-Zeile direkt unter den Tabs (erster Blick)
- [x] 3.3 abgedeckt: RechnerKopf-Link «Katalog» → /pro existiert auf jeder
      Rechner-Seite; dort übernimmt «/» den Sprung in die Suche
- [x] 4.1 **E4 entschieden: keine Free-Anliegen-Zeile** — die kuratierte Wand (9 Kacheln)
      ist selbst schon der Anliegen-Einstieg; eine zweite Ebene würde duplizieren
- [x] 4.2 Pro-Teaser-Chips bleiben datengetrieben (ehrlich, §8) — keine Änderung

**Offen für David (fachlich):** Anliegen-Liste in `lib/anliegen.ts` abnehmen/umformulieren;
Goldlisten-Begriffe ergänzen (E5) — der Test macht jede Ergänzung messbar.
