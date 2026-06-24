# Fahrplan — BGE-Detailansicht einheitlich darstellen (Rubrum/Kopf-Regelwerk)

**Auftrag David (24.6.2026, ultracode):** Detailseiten der Bundesgerichtsentscheide
(`/rechtsprechung/:key`) endlich **einheitlich, übersichtlich und schön** darstellen,
über **Regeln, die auch für künftige Entscheide gelten** — nicht ad-hoc je Entscheid.
Zusätzlich durchdenken, wie `entscheidsuche-mcp` (https://mcp.entscheidsuche.ch/) in
LexMetrik nutzbar gemacht werden kann.

Grundlagen: E-Mail-Befund (4 sichtbare Rubrum-Formen), Spec
`bger-darstellung-datenmodell-spezifikation.md`, Daten-CSV (265 BGE).

> **Ergebnis 24.6.2026 (umgesetzt, NICHT deployt).** Teil A geliefert als
> **Display-Vereinheitlichung + Datenreparatur**: einheitlicher Kopf (`kopf.ts`)
> + `rubrumFeldPlausibel` (`rubrum.ts`); der Cross-Check zeigte, dass **alle 178
> gespeicherten Rubrum-Felder Falsch-Positive** waren → genullt (`rubrum-bereinigen.ts`,
> 140 Snapshots). **Abweichung (§7, offengelegt):** die in §2 gewählte „Extraktion
> härten/Korpus neu ableiten"-Anreicherung der **Vorinstanz** wurde §1-bedingt
> VERWORFEN (narrative Extraktion greift oft ein zitiertes Präjudiz statt der
> Vorinstanz). Details: Session-Karte in `STRUKTUR.md` + `bibliothek/rechtsprechung/
> rubrum-darstellung-regelwerk.md`. Teil B (entscheidsuche-Nutzbarmachung) bleibt
> Plan.

## 1. Befund (verifiziert, §7/§8)

- Der Kopf (`<header>`: Gericht · Abteilung · Sachgebiet · Zitierung · Datum · Badges)
  rendert **immer**. Der **Rubrum-Block** ist ein *separater* Block danach, rein
  datengetrieben (`feld && …`) → er ist mal da, mal weg. **Das** erzeugt den
  „mal Loch, mal nicht"-Eindruck.
- Heutiger Code rendert bereits alle 4 Rubrum-Felder → real **9** Erscheinungsformen
  (nicht 4). Verteilung über 265 BGE:
  | Kopfblock | n | % |
  |---|---:|---:|
  | kein Block (nur Regeste) | 125 | 47,2 |
  | gegenstand | 44 | 16,6 |
  | parteien | 43 | 16,2 |
  | gegenstand+parteien | 27 | 10,2 |
  | vorinstanz | 13 | 4,9 |
  | gegenstand+vorinstanz | 6 | 2,3 |
  | parteien+vorinstanz | 4 | 1,5 |
  | besetzung | 2 | 0,8 |
  | parteien+besetzung | 1 | 0,4 |
- `rubrum` wird best-effort per Regex aus dem OCL-`full_text` extrahiert
  (`scripts/normtext/adapter-entscheide.ts::extrahiereRubrum`, nur Bund/CH). Trifft
  keine Regex → `rubrum: null`. **Hypothese: Die 47 % sind weit überwiegend eine
  Parser-Lücke** — bei publizierten BGE *steht* Sachverhalt/Parteien im Volltext.
  (Recon-Phase verifiziert das am Cache.)
- Spec-Achsen `publikationsstatus`/`entscheidart`/`begründungsdichte`/`verfahrensart`
  existieren im Datenmodell **nicht**; Korpus heute 100 % `de` + publizierter
  BGE-Leitentscheid. `regesteAmtlich`/`bgeReferenz` sind die faktischen Proxys für
  „BGE publiziert".
- **entscheidsuche-mcp liefert KEINE strukturierten Rubrum-Felder** — nur `abstract`
  (= Regeste, sauber), `text` (Volltext, mit `<em>`-Highlights + „S. 93"-Kolumnentiteln)
  und `document_url` (sauberes HTML). „Extraktion härten" bleibt Parser-Arbeit am
  Volltext; ein Quellenwechsel löst das Rubrum-Problem **nicht**.

## 2. Entscheidungen David (24.6.)

- **Kopf-Schema:** *Einheitliches Gerüst + ehrlicher Fallback.* Rubrum-Felder wandern
  in EINEN stets vorhandenen Identitäts-Kopf (kein separater Block, der mal auftaucht).
  Fehlt der Gegenstand, tritt eine **als abgeleitet markierte** Sachgebiets-/Verfahrens-
  zeile an seine Stelle. Jeder Entscheid hat denselben Aufbau, nie ein Loch — **nichts
  wird erfunden** (§8: leere Felder werden weggelassen, nicht mit „—" fabriziert).
- **Umfang:** auch die **Extraktion härten + Korpus neu ableiten** (mehr echte
  Rubrum-Daten; gilt auch für künftige Importe).

## 3. Regelwerk (deterministisch, gilt auch für künftige Entscheide)

Reine Regeln in `src/lib/` (§2/§3), Darstellung in Components. Ein **konditionales
Layout mit graceful degradation** (Spec §6/§7.4), kein Sprachmodell.

**R1 — Identitäts-Kopf (immer):** Gericht · Abteilung · Sachgebiet · Zitierung ·
Datum · Badges (Leitentscheid/Sprache/Kuratierung). Diese Felder sind selbsttragend
(§7) und immer vorhanden.

**R2 — Rubrum-Zeilen in EINEM Kopf:** `gegenstand`, `parteien`, `vorinstanz`,
`besetzung` werden — wenn befüllt — als Zeilen **innerhalb** des Identitäts-Kopfs
gerendert (feste Reihenfolge Gegenstand → Parteien → Vorinstanz → Besetzung), nicht
als separater Block. Feste Beschriftungen, einheitliches `dl`-Raster.

**R3 — Ehrlicher Fallback (Leit-/Identitätszeile):** Fehlt `gegenstand`, wird eine
**abgeleitete** Leitzeile gezeigt: Sachgebiet (+ ggf. zitierte Leitnormen), klar als
abgeleitet markiert (Sprache wie Übersicht: `synthThema`). So hat jeder Entscheid eine
„Worum geht es"-Zeile. Niemals erfundener Inhalt; Markierung obligatorisch (§8).

**R4 — Regeste/Zusammenfassung am Publikationsstatus:** Regeste-Zone nur wenn
`regeste` vorhanden; Überschrift „Regeste" bei `regesteAmtlich`, sonst
„Zusammenfassung" (bestehende Logik, beibehalten). Für künftige BGer-nur-online-
Entscheide ohne Regeste greift automatisch der zonenlose Fall.

**R5 — Sprache (zukunftsfest):** Überschriften-Mapping vorbereitet für `de/fr/it`
(Spec §7.1). Heute nur `de` im Korpus; das Mapping liegt zentral, damit fr/it-Entscheide
ohne Code-Änderung korrekt rubriziert werden.

**R6 — Graceful degradation der Body-Zonen:** Sachverhalt/Erwägungen/Dispositiv wie
bisher nur wenn vorhanden; fehlende Struktur ehrlich gelabelt (bestehende
`EntscheidBody`-Hinweise). Reihenfolge ist Invariante (Art. 112 BGG).

## 4. Teil A — Umsetzung jetzt

- **A1 Reine Kopf-Regel-Lib** `src/lib/rechtsprechung/kopf.ts` (neu, rein/deterministisch):
  `baueKopfModell(snap): KopfModell` → Identitätsfelder + geordnete Rubrum-Zeilen +
  abgeleitete Leitzeile (mit `abgeleitet: true`-Flag). Sprach-Label-Tabelle (R5).
  Keine UI. Unit-getestet über alle 9 Feld-Kombinationen + Fallback.
- **A2 Display** `src/pages/EntscheidLeser.tsx`: separaten Rubrum-`<section>` auflösen,
  Identitäts-Kopf aus `kopf.ts` rendern (Rubrum-Zeilen integriert, Fallback-Leitzeile).
  Reine Darstellung (§3). Lesbarkeit/Mobil/Dark als Schlusscheck (Daueranweisung).
- **A3 Extraktion härten** `scripts/normtext/adapter-entscheide.ts::extrahiereRubrum`:
  Regex/Heuristik für mehr BGE-Kopf-Formate (Sachverhalt-`A.`/`B.`-Einstieg, Parteien-
  Muster, Gegenstand aus Regeste-Kontext), Anonymisierungs-Tokens als Einheit
  (Spec §7.2). Ziel: deutlich mehr Entscheide mit echtem `gegenstand`/`parteien`.
  **Gilt automatisch für künftige Importe.**
- **A4 Korpus neu ableiten:** `npm run renormalisiere:entscheide` aus dem Cache
  (offline, kein Voll-Re-Fetch wenn `full_text` gecacht — Recon klärt). **Wort-Invariante
  je Entscheid als Tor** (0 Drift am Urteilstext); nur `rubrum` darf sich ändern.
  `check:entscheide` grün.
- **A5 Tests:** `kopf.test.ts` (Regelwerk), Adapter-Rubrum-Extraktion (neue Fälle),
  bestehende `rechtsprechung-browse`/`erwaegung-normalisieren` unverändert grün.

## 5. Teil B — entscheidsuche-mcp in LexMetrik nutzbar machen (dokumentiert, separat)

`https://mcp.entscheidsuche.ch/mcp` · stateless JSON-RPC · keine Auth · Bund + 26 Kantone ·
de/fr/it · Tools `search`/`search_by_case_number`/`fetch_document`/`list_hierarchy`/
`list_facets`/`server_info`. ES-Backend `entscheidsuche.pansoft.de:9200`.

- **B1 (jetzt, nur Verifikation, nicht gespeichert):** unabhängiger Cross-Check der
  extrahierten `rubrum`/`regeste` gegen entscheidsuche `abstract`/`document_url` für die
  4 Repro-Entscheide + Stichprobe (Bug-Check-Phase).
- **B2 Live-Volltextsuche** über den ganzen CH-Korpus als Discovery in `/rechtsprechung`
  (weit über die 265 kuratierten hinaus). Display-Layer, **§2 unberührt** (keine
  Engine-Logik), §7/§8: Treffer als externe Verweise mit Provenienz + Live-Link, klar
  „nicht kuratiert". (CORS-offen, im Rechtsprechungs-Fahrplan bereits als machbar belegt.)
- **B3 Breiten-Ingestion künftiger Entscheide** (Spec §4): entscheidsuche als
  Breiten-/Aktualitätsquelle neben OCL (BGer-nur-online, kantonal), in den bestehenden
  Adapter mit Provenienz-Achse `quelle:'entscheidsuche'`.
- **B4 Norm↔Entscheid-Verzahnung breiter:** `search` nach Norm-Zitaten → „Rechtsprechung
  zu Art. X" über den Live-Korpus statt nur lokal.
- **B5 Neueste-BGer-News live** (Startseite `NewsHeader`, Live-Augmentierung war bewusst
  offen) via `sort=date`.

B2–B5 brauchen je einen verifizierten API-Vertrag (§7) und Davids Fach-/Deploy-Freigabe;
sie werden hier **nur dokumentiert**, nicht gebaut.

## 6. Tore & Disziplin

- §3 (Regeln in lib, Display in Components) · §6 (Gate grün: tsc/lint/test/build;
  **golden byte-gleich** als Beweis, dass keine Gesetzes-/Rechtslogik berührt wurde —
  Rechtsprechung liegt ausserhalb golden, der Lauf belegt 0 Leck) · §11 (Regelwerk +
  entscheidsuche-Recherche in `bibliothek/` ablegen) · §12 (isolierter Worktree).
- **Bug-Check (ultracode, adversarial, mehrere Lupen)** vor Abschluss + Playwright
  hell/dunkel/desktop/mobil über die 4 Repro-Entscheide (152 V 52 nur-Regeste · 152 III
  137 gegenstand · 152 II 19 parteien · 152 III 92 beides) + 0 Konsolenfehler.
- **§9: KEIN Push/Deploy ohne Davids explizites Ja.** Liefer-Zustand = lokal verifiziert.

## 7. ultracode-Ausführung

1. **Entwurf + Recon** (read-only Fan-out): Cache/Invarianten/Parser-Lücke verifizieren;
   2–3 diverse Kopf-Layout-Entwürfe → adversariale Juroren → Synthese der finalen Regeln;
   entscheidsuche-Dokumentstruktur für Repro bestätigen.
2. **Umsetzung** (sequenziell im Worktree, golden/gate-gated): A1–A5.
3. **Bug-Check** (adversarial Fan-out) + Gate + Playwright-Sweep + entscheidsuche-Cross-Check.
