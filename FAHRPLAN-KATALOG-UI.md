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

## Status

- [ ] 0.1 Suchbegriff-Goldliste + passt()-Extraktion
- [ ] 0.2 Metadaten-Inventur (keywords/related/szenarien)
- [ ] 1.1 Keyword-Ausbau (nach Inventur, Abnahme David)
- [ ] 1.2 Gerankte Treffer-Liste
- [ ] 1.3 Suche in URL (`?q=`)
- [ ] 1.4 Tastatur-Komfort (+ E1)
- [ ] 2.1 Anliegen-Zeile Pro (E2)
- [ ] 2.2 Szenarien-Deep-Links (nach Vorauswahl-Inventur)
- [ ] 2.3 related-Graph komplettieren
- [ ] 3.1 Listen-Ansicht (E3)
- [ ] 3.2 «Zuletzt verwendet»-Platzierung
- [ ] 3.3 Header-Einstieg `/pro?q=`
- [ ] 4.1 Free-Anliegen-Konzept (E4)
- [ ] 4.2 Pro-Teaser-Chips
