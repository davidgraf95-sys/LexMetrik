# BGE-Leitentscheide-Import (amtliche Sammlung, ab 2024)

**Stufe 1 des Rechtsprechungs-Ausbaus** (Auftrag David 23.6.2026: «viele
Bundesgerichtsentscheide, vor allem die neusten, importieren und darstellen» →
eingegrenzt auf **Leitentscheide**, weil curated statt Routine).

## 1. Quelle + Stand

- **OpenCaseLaw** (`https://mcp.opencaselaw.ch/api`), Court **`bge`** = amtliche
  Sammlung (Leitentscheide). Abruf 23.6.2026. Recht: Urteilstext gemeinfrei
  (Art. 5 URG); amtliche Regeste der Sammlung mitgeführt (Quelle ausgewiesen).
- **Mengen (empirisch gemessen 23.6.2026):** `court=bge&language=de&date_from=2024-01-01`
  → **265** deutsche Leitentscheide (2024: 117, 2025: 122, 2026 bis 23.6.: 26).
  Gesamt `bge` (alle Sprachen/Jahre): 25 643. Frische: OCL ~6 Tage hinter
  bger.ch, **frischer als entscheidsuche.ch** (Preflight).

## 2. Regel deterministisch (Pipeline)

- **Enumeration** `enumeriereBge(dateFrom)` — paginiert `court=bge`,
  `language=de`, `date_from`, `sort=date_desc` (`adapter-entscheide.ts`).
- **Detail** `holeBgeLeitentscheid(id)` → `mappeEntscheidOCL(…, {istBge:true})`:
  - `zitierung` = `citation_string_de` («BGE 152 V 52»); `bgeReferenz`/`nummer` =
    Fundstelle ohne doppelten «BGE »-Präfix («152 V 52»); Slug `bge_152_V_52`.
  - `leitcharakter` = **leitentscheid** (forciert); `regesteAmtlich` = true.
  - **Sachgebiet** deterministisch: aza-Abteilung des unterliegenden Urteils
    (präzis, z.B. 9C→sozial-abgaben) ⟶ Fallback römischer BGE-Band
    (`bgeRoemischSachgebiet`: I/II→öffentlich, III→privat, IV→straf,
    V→sozial-abgaben).
  - **Datum** (§1, heikel): BGE-Records tragen ein **Band-Platzhalterdatum**
    `YYYY-01-01`. Echtes Urteilsdatum NUR über das verlinkte aza-Urteil
    (autoritativer Cross-Fetch des `decision_date`), mit Sanity-Schranke
    (Jahr im Fenster `[Bandjahr-3 … Bandjahr]`, sonst zitiertes Präjudiz
    erwischt → verwerfen). **KEINE** Textdatum-Heuristik: BGE-Sammlungstexte
    beginnen oft direkt mit dem Sachverhalt, dessen Ereignisdaten NICHT das
    Urteilsdatum sind (führte zu 2 falschen Daten → entfernt).
  - Fehlt das aza-Az. (~Hälfte) → **Bandjahr** `YYYY-01-01` = «unscharf».

## 3. Geltungsbereich + Ausnahmen

- **Abdeckung Datum:** 170/265 (64 %) echtes Urteilsdatum; 95 (36 %) Bandjahr-
  unscharf. Die UI zeigt unscharfe (Sentinel `gericht==='bge'` + `…-01-01`,
  da ein echtes Urteil nie auf den 1.1. datiert — Feiertag) ehrlich als
  **«BGE-Jahrgang YYYY»** statt eines vorgetäuschten «1.1.».
- **Sprache:** nur Deutsch (Stufe 1). FR/IT bleiben offen.
- **Restrisiko:** der aza-Cross-Fetch nimmt das ERSTE aza-Az. im Kopf (= eigener
  Fall, an Stichproben bestätigt) — selten könnte ein zitiertes Az. zuerst
  stehen; die Sanity-Schranke fängt grobe Ausreisser. Das Datum ist sekundär
  (die Zitierung trägt die BGE-Fundstelle, kein Datum).

## 4. Pflegebedarf

- **Korpus-Rebuild** (deterministisch, §7): `npm run entscheide --
  --bge-von=2024-01-01 --courts=ag_gerichte,be_verwaltungsgericht,gr_gerichte,sg_gerichte,zh_obergericht
  --kanton-pro=6`. Ein Lauf erzeugt **alles** (265 BGE + 30 kantonale Seeds),
  weil `schreibeKorpus` den Ordner wipe-und-neuschreibt.
- Aktuell **manuell** (kein CI-Cron). Für Dauerfrische → geplanter Rebuild.
- Tor `check:entscheide` (Budget 8→**20 MB** angehoben; Ist ~9,7 MB).

## 5. Abnahme-Status

**Maschinell** (`kuratierung: 'maschinell'`, in der UI als «maschinell erfasst»
ausgewiesen, §8). Inhaltliche/fachliche Abnahme der einzelnen Entscheide:
David, **offen** (Zeitsperre bis 1.12.2026). Verifiziert ist die **Mechanik**
(Pipeline, Datum-Korrektheit: 0 falsche/0 Zukunftsdaten, Render hell/dunkel/
mobil, Gate grün, golden byte-gleich), nicht die juristische Einzelfall-Auswahl.
