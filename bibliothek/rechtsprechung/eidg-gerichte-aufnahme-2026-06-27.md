# Eidg. Gerichte BVGer · BStGer · BPatGer — Aufnahme/Bau (Lane R Batch 3)

**Erstellt:** 27.6.2026 (Auftrag 9 / Lane R Batch 3, isolierter Worktree, §12).
**Status:** maschinell erfasst, `verifiziert:false`, Abnahme David offen (Zeitsperre bis 1.12.).
**Baut auf:** `neue-gerichte-dossier-2026-06-27.md` (Spezifikation/Recherche).

## 1. Quelle + Stand

- **Kanal:** OpenCaseLaw-API (`mcp.opencaselaw.ch/api`) — dieselbe browserlose
  keyed-Lookup-Schicht wie Bund/Kanton. **Befund:** OCL führt alle drei Gerichte als
  eigene `court`-Codes (NICHT die entscheidsuche-Codes `CH_BVGer`/`CH_BSTG` aus dem
  Dossier): **`bvger`** (92 883 Entscheide), **`bstger`** (11 524), **`bpatger`** (191).
  → kein eigener entscheidsuche-Scraper nötig; der bestehende OCL-Adapter trägt sie.
- **Stand:** Abruf 27.6.2026. Provenienz je Snapshot: `quelleUrl` = OCL `source_url`
  (Portal `bvger.weblaw.ch` / `bstger.weblaw.ch` / `bundespatentgericht.ch`),
  `fassungsToken` = OCL `content_hash`, `abgerufen` = 2026-06-27.

## 2. Regel deterministisch (Aufnahme → Manifest → Darstellung)

```
Enumeration:  enumeriereNeuesteAlle(court, N)  — OHNE Sprachfilter (de-Default hätte
              die wahren neuesten IT/FR-Urteile verworfen) → N=5 neueste je Gericht
Detail:       holeEntscheidOCL(id, datum, {sprache:null, sachgebietHint})  — der
              bestehende Adapter; court_name/citation_string_de/source_url stimmen
              direkt (BVGer/BStGer/BPatGer; «BVGer F-… vom …»).
id-Pfad:      bund/<court>/<docketSafe>     Manifest-key: <court>_<docketSafe>
Sprache:      spracheAusBody() (A2) — Body-basiert, nicht aus dem OCL-Record
Leitcharakter: 'routine' IMMER (keine amtliche Sammlung BVGE/TPF aufgelöst) →
              bgeReferenz=null; Invariante leitcharakter⟺bgeReferenz GEWAHRT, kein
              «Leitentscheid»-Badge (neutrale Gericht/Abteilung/Datum-Kennung).
Regeste:      OCL-Feld vorhanden → regesteAmtlich=false → im Reader «Zusammenfassung»
              (kein Regeste-Kasten; §8 ehrlich, identisch zur kantonalen Behandlung).
Sachgebiet:   bvger→legal_area (public→oeffentlich) · bstger→legal_area (criminal→straf;
              RR/CR teils oeffentlich) · bpatger→Hint 'privat' (Immaterialgüterrecht;
              OCL legal_area dort oft nur Kosten-Notiz).
```

**Additiver Build (kein Bestand-Drift, §6):**
```
npm run entscheide -- --additiv --eidg=bvger,bstger,bpatger --eidg-pro=5 --datum=2026-06-27
```
`--additiv` lädt den committeten Korpus byte-treu von der Platte (`ladeBestandSnapshots`)
und ergänzt nur die neuen Gerichte — die 272 BGE/Bund/Kanton werden NICHT über die
Live-API neu gezogen. Verifiziert: 0 Bestands-Snapshot-Dateien geändert; je-Datei
`erzeugt` aus `snap.abgerufen` (statt globalem Build-Datum) hält den Bestand byte-gleich.

## 3. Geltungsbereich / Aufgenommen (15 Urteile, je 5)

| Gericht | Urteile (Nr. · Datum · Sprache) |
|---|---|
| BVGer | F-4218/2026 (19.6. it) · F-4158/2026 (17.6. de) · E-165/2026 (16.6. fr) · F-3740/2026 (16.6. de) · F-4109/2026 (16.6. de) |
| BStGer | CR.2026.5 (11.6. de) · CR.2026.4 (9.6. de) · SK.2025.57 (20.5. de) · RR.2026.46 (19.5. it) · BB.2026.50 (18.5. fr) |
| BPatGer | O2024_007 (23.4. fr) · O2025_005 (15.1. de) · S2023_011 (4.12.25 de) · O2024_002 (12.8.25 de) · S2024_005–007 (8.7.25 de, koord. Verf.) |

Sprachen gesamt: de 10 · fr 3 · it 2 → erste IT-Einträge im Korpus überhaupt.

## 4. Pflegebedarf / Grenzen / TODO(David)

- **Leitentscheid-Status nicht gesetzt:** Die amtlichen Sammlungen (BVGE Art. 7,
  TPF, BPatGer-Leitentscheid-Rubrik) sind NICHT aufgelöst — alle 15 sind `routine`.
  Die «4–5 neuesten» sind bewusst Routine-Urteile (kein Sampling der Sammlung). Eine
  echte Leitentscheid-Klassifikation je Gericht ist Folge-Arbeit (Dossier §A–C).
- **Sachgebiet maschinell:** BStGer RR/CR → 'oeffentlich' (Rechtshilfe/Revision; aus
  legal_area). Patent → 'privat' (deklarierter Court-Hint). Status maschinell.
- **«Sachverhalt nur Auszug»** bei einigen BVGer (full_text ohne sauberen
  `Sachverhalt:`-Marker → §8-Auszug-Fallback, ehrlich gelabelt). Nicht-blockierend.
- BVGE/TPF-Präfix-Semantik (`CH_BVGE_001_`) und entscheidsuche-Bulk bleiben für eine
  spätere Leitentscheid-Welle offen (Dossier §4 je Gericht).

## 5. Verzahnung / Darstellung

- **Instanz-Achse** (`gerichtstyp`) als eigene Facette aktiviert (BGer/BVGer/BStGer/
  BPatGer/Kantone), cross-gefiltert, Null-Prune (R15). Übersicht gruppiert die neuen
  Urteile via `gruppiereNachInstanz` unter ihrer Instanz.
- **Norm→Entscheid-Index** bewusst auf `gerichtstyp==='bundesgericht'` geschärft —
  die neuen Gerichte erscheinen NICHT unter «Bundesgerichtsentscheide zu diesem
  Erlass» (sie sind canton CH, aber nicht das Bundesgericht). Für den Bestand identisch.
- **B2-Golden:** +8 (Gericht×Sprache)-Zellen frieren die mehrsprachige Darstellung ein.
- **Prerender/Suche/SEO:** automatisch über das Register — 342 Detailseiten (+15),
  Sitemap +15, Universal-Suche lädt das Manifest.

## 6. Abnahme-Status

Erstrecherche + maschinelle Aufnahme; doppelt verifiziert (byte-Gleichheit Bestand,
Gate grün, visuelle Prüfung hell/dunkel/mobil ohne Console-Fehler). **Fachliche
Abnahme David offen** (`verifiziert:false`, `kuratierung:'maschinell'`).
