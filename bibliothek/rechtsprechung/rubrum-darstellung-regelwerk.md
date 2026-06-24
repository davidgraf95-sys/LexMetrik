# BGE-Rubrum: Darstellungs-Regelwerk + Daten-Befund (Detailansicht)

**Erstellt:** 24.6.2026, Auftrag David (ultracode): BGE-Detailansicht
(`/rechtsprechung/:key`) einheitlich/übersichtlich darstellen, mit Regeln, die
auch für künftige Entscheide gelten. Begleitend `FAHRPLAN-BGE-DARSTELLUNG-EINHEITLICH.md`.
**Status:** zweifach geprüft (Recherche + adversarialer Cross-Check gegen
entscheidsuche.ch); Code in `main`-Worktree, noch nicht deployt, fachliche Abnahme
durch David offen.

## 1. Quelle + Stand

- Korpus: 265 BGE-Leitentscheide (Stand-Import 23.6.2026, OpenCaseLaw), Reader
  `src/pages/EntscheidLeser.tsx`. Cross-Check-Quelle: **entscheidsuche-mcp**
  (`https://mcp.entscheidsuche.ch/mcp`, stateless JSON-RPC, keine Auth; Tools
  `search`/`search_by_case_number`/`fetch_document`/…; ES-Backend
  `entscheidsuche.pansoft.de:9200`), Abruf 24.6.2026.
- entscheidsuche liefert **keine strukturierten Rubrum-Felder** — nur `abstract`
  (= Regeste, sauber), `text` (Volltext mit `<em>`-Highlights + Kolumnentiteln)
  und `document_url`. Für Rubrum-Struktur unbrauchbar; taugt als Cross-Check +
  Breiten-/Aktualitätsquelle (Spec §4) für künftige Integration (B2–B5 im Fahrplan).

## 2. Befund (verifiziert, §7/§8)

- **Rubrum** (`gegenstand`/`parteien`/`vorinstanz`/`besetzung`) wird best-effort
  per Regex aus dem OCL-`full_text` extrahiert (`adapter-entscheide.ts`
  `extrahiereRubrum`). Auf den **narrativen** BGE (Sachverhalt in `A.`/`B.`/`C.`
  statt mit Labels „Gegenstand:"/„Parteien:") trifft der Regex die Labels im
  Body-Fliesstext → **Falsch-Positive**: gespeichert wurden Erwägungs-/Satzmitten-
  Fragmente.
- **Quantifiziert (24.6.2026):** von 294 Snapshots trugen 140 ≥1 Rubrum-Feld;
  **alle 178 gespeicherten Felder (77 gegenstand / 75 parteien / 23 vorinstanz /
  3 besetzung) waren implausibel** (0 echte). Belege z.B. `bge_152_III_92`
  gegenstand = „d.h. die Frage, ob der Schuldner zu neuem Vermögen gekommen ist
  (BGE 131 I 24 E. 2.2)"; `bge_152_II_19` parteien = „die Dauer des
  Arbeitsverhältnisses, das Alter der gekündigten Person …".
- **Narrative Vorinstanz-Anreicherung verworfen (§1):** Ein Regex „Urteil des
  <Gericht> vom <Datum>" greift im Sachverhalt das **erste** Gericht+Datum — das
  ist nicht garantiert die Vorinstanz, sondern oft ein zitiertes Präjudiz/früheres
  Verfahren (Gegenbeispiel `bge_152_III_92` → „Obergericht ZH vom 2000" für einen
  2025er Entscheid). Lieber kein Feld als ein falsches.

## 3. Regel deterministisch (gilt auch für künftige Entscheide)

- **Plausibilitäts-Tor** `rubrumFeldPlausibel(label, wert)` (rein,
  `src/lib/rechtsprechung/rubrum.ts`, SSoT). Verwirft (→ Feld null, fail-safe):
  1. leer / nur Whitespace;
  2. länger als feldspezifisches Max (gegenstand 160 / parteien 400 / vorinstanz
     200 / besetzung 220 Zeichen);
  3. **mit Kleinbuchstabe beginnend** (Satzmitten-Fragment — saubere Einträge
     beginnen mit Grossbuchstabe/Ziffer/Parteimarke „A.");
  4. mit Erwägungs-/Zitat-Marker (`BGE \d`, `E. \d`, `i.V.m.`, `BBl`, `Ziff. \d`).
- Eingesetzt an **drei** Stellen (eine Regel): Anzeige (`kopf.ts` filtert die
  Kopf-Rubrum-Zeilen), Live-Extraktion (`extrahiereRubrum` nullt am Quell-Punkt),
  Bestands-Reinigung (`rubrum-bereinigen.ts`).
- **Einheitlicher Kopf** (`kopf.ts` `kopfModell`): Identität (Gericht · Abteilung
  · Sachgebiet · Zitierung · Datum · Badges) **immer**; plausible Rubrum-Zeilen in
  fester Reihenfolge Gegenstand→Parteien→Vorinstanz→Besetzung; **eine** Thema-
  Aussage genau einmal — Gegenstand ODER (Reader-)Regeste-Box ODER, wenn beides
  fehlt, abgeleitete Sachgebiets-Leitzeile (`synthThema`, ehrlich markiert, §8).
  Keine Dopplung, kein Loch.
- **Vorinstanz-Floskel** „das Urteil/den Entscheid des …" wird beim Extrahieren
  abgestreift → der Wert beginnt mit dem Gericht.

## 4. Geltungsbereich und Ausnahmen

- Heutiger Korpus: 100 % `de` + publizierter BGE-Leitentscheid (alle mit amtlicher
  Regeste). Folge: nach der Reinigung trägt **die Regeste** das Thema; Rubrum-
  Zeilen + abgeleitete Leitzeile bleiben für den Bestand leer, greifen aber
  automatisch für künftige Importe (BGer-nur-online, kantonal, fr/it — Labels
  de/fr/it bereits hinterlegt).
- Rubrum-Anzeige nur Bund/CH-tauglich verifiziert; kantonale Entscheide tragen das
  entscheidende Gericht selbst → narrative Vorinstanz-Extraktion dort zusätzlich
  unsicher (nicht angewandt).

## 5. Pflegebedarf / Abnahme-Status

- **Pflegebedarf:** Sobald die Rubrum-Extraktion strukturell verbessert wird
  (z.B. echte Label-Sektionen künftiger Quellen), greift das Plausibilitäts-Tor
  weiter; Schwellen/Marker in `rubrum.ts` sind die einzige Stellschraube.
- **Verfallsregister:** kein datierter Parameter (keine Kandidaten).
- **Abnahme-Status:** Darstellung + Reinigung zweifach geprüft (Gate grün, golden
  byte-gleich, 30 Unit-Tests, Playwright hell/dunkel/desktop/mobil 0 Fehler,
  entscheidsuche-Cross-Check). Fachliche Abnahme durch David offen; kein Deploy
  ohne sein Ja (§9).
