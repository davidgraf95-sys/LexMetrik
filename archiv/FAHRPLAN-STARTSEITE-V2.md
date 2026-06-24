# Handlungsplan — Startseite V2 («Rechner-zuerst»-Cockpit)

Grundlage: interaktiver Prototyp `~/Downloads/LexMetrik-Startseite-V2-Prototyp.html`
(Richtung «Rechner-zuerst»). Umsetzung in das **gesperrte** Designsystem und in
die bestehende App-Shell.

## Leitplanken (verbindlich)

1. **Designsystem ist gesperrt.** Der Prototyp nähert Schriften/Farben nur an
   (Fraunces, eigene Hex). Wir übernehmen **Layout, Struktur, Idee**, rendern aber
   ausschliesslich mit dem Tokensystem (Geist; `--paper/--ink/--brass/--surface`;
   `lc-*`). KEIN Fraunces (6.6.2026 entfernt), keine neuen Hardcode-Farben →
   funktioniert hell + dunkel automatisch.
2. **Keine Illustrations-Mathematik (§1/§2).** Der Schnellrechner ruft die
   **echten, deterministischen Engines** auf (keine Platzhalter-Formel wie im
   Prototyp). Logik bleibt in `src/lib/` (§3), die Seite ist reine Darstellung.
3. **Ehrlichkeit (§8).** Jedes Ergebnis nennt seinen Status/Geltungsbereich; der
   Schnellrechner verlinkt für den vollen Rechenweg/Tarif in den jeweiligen
   Voll-Rechner. Keine Aussage über das hinaus, was die Engine liefert.
4. **Determinismus.** Zeitabhängige Begrüssung und die Stoppuhr sind Darstellung/
   Werkzeug, KEINE Rechtslogik — `Date.now()` dort zulässig, nie in einer Engine.
5. **Vollständig clientseitig.** Stoppuhr-Einträge lokal (localStorage), kein
   Server (Berufsgeheimnis).
6. Beweis pro Schritt: `npm run gate` (+ `npm run build` für SEO/Prerender);
   Golden byte-identisch (keine Engine berührt).

## Engines (kartiert, werden unverändert konsumiert)

- Fristen: `berechneAllgemeineFrist` (`lib/allgemeineFrist.ts`), `berechneFrist`
  (`lib/zpoFristen.ts`), `berechneSchkgFrist` (`lib/schkgFristen.ts`).
- Gebühren: `berechneProzesskosten` (`lib/prozesskosten.ts`) — kantonsabhängig.
- Zuständigkeit: `bestimmeZustaendigkeit` (`lib/zustaendigkeit.ts`) — Bundesrecht.
- Bausteine: `DatumsFeld`, `BetragsFeld`, `ErgebnisBlock`, `Field` (vorlagen/ui),
  `lib/datumsUtils.ts`.

## Phasen

### P0 — Shell-Angleichung ✅ (erledigt)
Marke in den Seitenleisten-Kopf; Top-Streifen Logo nur < lg.

### P1 — Start-Gerüst (Cockpit-Rahmen)
- `Startseite.tsx`: Hero/Katalog-Deckblatt ablösen durch das Cockpit.
  Begrüssung zeitabhängig (Morgen/Tag/Abend) + Ein-Satz-Erklärung +
  «Berechnung statt KI»-Badge. Sektions-Labels (Haarlinie) wie Prototyp.
- Der bisherige Katalog (4 Kategorien) bleibt über `/recherche` + Seitenleiste
  erreichbar (dort schon gerendert) — Start ist neu das Cockpit.

### P2 — Schnellrechner (`components/start/Schnellrechner.tsx`)
- Tabs Fristen · Gebühren · Zuständigkeit. Reine Darstellung, ruft die Engines.
- **Fristen** live inline (Ergebnisdatum + Wochentag + Kurz-Rechenweg) → Link
  «Voller Fristenrechner».
- **Gebühren** (`berechneProzesskosten`) und **Zuständigkeit**
  (`bestimmeZustaendigkeit`) live inline mit konservativ extrahiertem Kopfwert +
  Link in den Voll-Rechner für den vollständigen Rechenweg.
- Eingaben validiert vor Engine-Aufruf; try/catch; leeres Formular = kein Fehler.

### P3 — Zeiterfassung (`components/start/Zeiterfassung.tsx`)
- Stoppuhr (Start/Stopp & buchen/Zurücksetzen), Aufgaben-Label, Einträge-Liste +
  «Heute erfasst»-Summe. Persistenz lokal (localStorage), tagesbezogen.

### P4 — Favoriten / Schnellzugriff
- Kuratiierte Direktlinks zu den meistgebrauchten Werkzeugen (aus `praxisRang`/
  Katalog abgeleitet) als Chips → Klicktiefe 1.

### P5 — Beweis + Deploy
- `npm run gate` + `npm run build` grün; hell+dunkel, Desktop+mobil sichten;
  Landung via PR; Deploy aus sauberem /tmp-Worktree (stehendes Deploy-Ja).

## Offen / bewusst später
- Favoriten-Persistenz (anpinnen) — v1 kuratiert.
- Schnellrechner-Ausbau weiterer Materien/Kantone — folgt den Voll-Rechnern.
