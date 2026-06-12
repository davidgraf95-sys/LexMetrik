# Amtliches Gebäudeadressverzeichnis — Adress-Auflösung (Stufen 1–3)

**Erstellt:** 12.6.2026 · **Abrufdaten: 12.6.2026** · Entscheid David
12.6.2026: «alle drei Varianten, mit Hinweis, dass API vom Bund verwendet
wird; grundsätzlich immer auch Adresse beklagte Partei eingeben können
(API), alternativ die Offline-Variante.»

## 1. Quellen + Stand

| Quelle | Inhalt | Abruf | Aktualisierung |
|---|---|---|---|
| swisstopo «Amtliches Verzeichnis der Gebäudeadressen» (data.geo.admin.ch, `ch.swisstopo.amtliches-gebaeudeadressverzeichnis`, CSV LV95) | ALLE Gebäudeadressen der Schweiz: Strasse, Nr., PLZ, **BFS-Gemeindenummer**, Gemeindename, Kanton, EGID, Status | 12.6.2026 (Zip 146 MB, Last-Modified 04:48; 3'291'160 Zeilen, davon 3'239'870 «real») | täglich |
| Geodaten-API des Bundes: `api3.geo.admin.ch` SearchServer (`type=locations&origins=address`) + GWR-Detail `…/ech/MapServer/ch.bfs.gebaeude_wohnungs_register/<featureId>` | Volltext-Adresssuche; Detail liefert `ggdename`/`gdekt`/`dplz4` | 12.6.2026 (empirisch: «Limmatstrasse 152 Zürich» → BFS 261 ZH; «Bundesplatz 3 Bern» → 3011 Bern BE) | live |
| Stadt Zürich «Adressen Stadt Zürich» (geo_adressen_stadt_zuerich, WFS) | Gebäudeadressen mit **Stadtkreis** (im Bundesverzeichnis nicht enthalten) | 12.6.2026 (56'666 real) | laufend |

Lizenz: Open Data des Bundes bzw. der Stadt Zürich, freie Nutzung mit
Quellenangabe. Wichtig: Die BFS-Gemeindenummer/amtliche Schreibweise
macht den Gemeinde-Join exakt (keine Schreibweisen-Heuristik nötig;
`namensKandidaten()` überbrückt nur unsere Register-Seite).

## 2. Regeln deterministisch (Eingabe → Ausgabe)

**Stufe 1 — Stadt Zürich, Strasse (+ Nr.) → Kreis-Amt (offline):**
`zhStrassen.json` (Generator `zh-strassen-generieren.ts`): 1'984
Strassen; Strasse mit Kreisen genau EINES Amts → Amt; eine der 58
amts-übergreifenden Strassen → Hausnummer entscheidet (amtliche
Einzeladresse; 0 Nummern-Konflikte); sonst `nummer_noetig` → Amts-Wahl.
Davor Stufe-0 (gleiche Quelle): `zuerichPlzKreise` — amts-eindeutige PLZ
→ Auto; mehrdeutige → eingegrenzte Wahl mit Adressenanteil. Befund:
Stadt-PLZ sind NICHT kreisscharf (16/30 mehrkreisig, 19 amts-eindeutig).

**Stufe 2 — mehrdeutige PLZ, Strasse (+ Nr.) → Gemeinde (offline, CH):**
`strassenVerzeichnis.json` + `strassenNummern.json` (Generator
`ch-strassen-generieren.ts`): nur die 1'213 gemeinde-mehrdeutigen PLZ
(47.4 % aller Adressen liegen darin). Strasse gemeinde-eindeutig
(98.5 % = 91'218) → Gemeinde+Kanton (auch kantonsübergreifend, z. B.
4052 Birswaldweg → Münchenstein BL); eine der 1'425 Grenzstrassen →
Hausnummer entscheidet (1'388 Doppel-Nummern ausgelassen → ehrlich
`nummer_noetig`); unbekannt → null → Kachel-Wahl bleibt. Wirkt über
PlzGemeindeWahl in ALLEN Eltern-UIs (Zuständigkeit, Schlichtungsgesuch,
Betreibungs-Finder …). Eingabe-Normalisierung nur fest:
exakt · case-insensitiv · «…str.»→«…strasse» (geteilt:
`strassenKandidaten.ts`).

**Stufe 3 — Bundes-API on-click (überall):** `AdresseBundSuche` (§10):
Freitext-Adresse → SearchServer (max. 6 Treffer) → GWR-Detail →
Gemeinde/Kanton/PLZ in die Maske. NUR auf expliziten Klick (Zefix-
Muster, zweiter externer Request des Produkts); Hinweis auf die
Übermittlung an geo.admin.ch steht PERMANENT neben dem Knopf; bei
fixer Kantons-Maske wird eine kantonsfremde Adresse offengelegt statt
übernommen. CSP `connect-src` + `api3.geo.admin.ch`; /datenschutz
Abschnitt 2 ergänzt (Wortlaut-Abnahme David offen).

**Vorrang-Ordnung in den UIs:** Strasse (offline, exakt) → PLZ-Automatik
→ Wahl (Kacheln/Dropdown); die Bundes-Suche ist ein paralleles Angebot
und füllt nur die Felder — die Auflösung läuft danach denselben
Offline-Weg.

## 3. Geltungsbereich und Ausnahmen

- Postfach-/Sonder-PLZ stehen NICHT im Gebäudeverzeichnis → Fallback
  PLZ/Gemeinde-Pfad bzw. volle Wahl (Stadt ZH).
- Identische (PLZ, Strasse, Nr.) in zwei Gemeinden existieren (1'388)
  → bewusst ausgelassen, Wahl bleibt beim Nutzer.
- TI: weder Circolo noch Miete-Ufficio im Bundesverzeichnis — der
  Adress-Ausbau löst TI NICHT; Ortsteil-Wahl bleibt.
- Tippfehler führen deterministisch zu «nicht gefunden» (kein Fuzzy,
  §2), nie zu einem stillen Falschtreffer.
- 4052-Lehrstück: PLZ 8044 ist sogar gemeinde-mehrdeutig (Gockhausen →
  Dübendorf) — die Stadt-Zürich-Kreislogik greift erst NACH der
  Gemeinde-Wahl «Zürich»; empirisch verifiziert.

## 4. Pflegebedarf

Quelle täglich aktualisiert; die gebündelten Indizes altern (Neubauten,
Umbenennungen, Fusionen). Degradation ist SANFT (fehlende neue Strasse
→ Wahl, nie falsch). Empfohlener Regen quartalsweise bzw. nach
BFS-Gemeindefusionen: curl-Befehle in den Generator-Köpfen, dann
`npx vite-node scripts/ch-strassen-generieren.ts` (und für ZH
`zh-kreise-generieren.ts` + `zh-strassen-generieren.ts`);
Plausibilitäts-Tore in den Generatoren (>3 Mio bzw. >50k reale
Adressen). Kandidat fürs Verfallsregister: Re-Generierung 1.10.2026.

## 5. Abnahme-Status

Erstrecherche + empirische Verifikation (Unit-Tests mit amtlichen
Referenzwerten; Playwright-Durchlauf beider UIs inkl. Live-API 12.6.2026).
Fachliche Abnahme David offen: Hinweis-/Datenschutz-Wortlaute (geo.admin-
Absatz /datenschutz, Knopf-Beschriftung «Beim Bund nachschlagen»).
