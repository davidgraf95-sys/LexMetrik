# FAHRPLAN-GESAMTAUFBAU - Chronologischer Zukunfts-Ausbau der LexMetrik-Website

**Stand:** 2.7.2026 · **Erarbeitet:** Council + Fable (Kritik-Runde eingearbeitet) · **Status:** ORDNET die bestehenden FAHRPLÄNE und die `ROADMAP.md` (§14) chronologisch — **ersetzt die ROADMAP nicht**; sie bleibt die eine Steuerungsquelle.
**Nordstern:** Übersichtliches Zuhause für JEGLICHE amtlichen Materialien von Bund + 26 Kantonen — DB = die EINE Wahrheit, selbst gehostet, immer geltender Stand, transparent mit Fundstelle, Historie.

---

## Kritik-Einarbeitung (Council-Runde 2.7.2026)

| # | Kritikpunkt | Verdikt | Umsetzung |
|---|---|---|---|
| 1a | 26×-Kette Leitgedanke (E5 vor Tarif) ≠ Phasentabelle (Tarif vor E5) | **Berechtigt** | Kette korrigiert auf **E3 → W3·12 → Tarif → E5 → Gerichtsferien**; sachlich richtig ist Tarif zuerst, weil E5 an der Anonymisierungs-Stichprobe (T3) hängt und Tarif Fachzeit-frei in Dez–Jan läuft |
| 1b | UX-Batch D (Ph4) „koordiniert" mit Fedlex Paket 4 (Ph6) = Inversion | **Berechtigt** | Batch D nach **Phase 6** verschoben, dort echt koordiniert mit Paket 4 |
| 1c | Vendor-Ausbau ohne Verifikations-Tor trotz unbestätigtem R3-CORS | **Berechtigt** | Hartes **Vendor-Sondierungs-Tor** in Phase 4 (empirische CORS-Probe + Lizenz-Doku, Go/No-Go); Bau in Phase 6 nur bei Grün, Fallback benannt |
| 2 | „per Konstruktion kollisionsfrei" von Risiko 5 selbst widerlegt | **Berechtigt** | Anspruch gestrichen; Bahnen sind **kollisionsarm**, bekannte Knoten (`ArtikelBody.tsx` u.a.) laufen über die **Datei-Eigentümer-Regel** (ein Eigentümer pro Knoten pro Phase) |
| 3 | Abnahme-Welle 1 im Dez 2026 verletzt Ordnungsregel 2 („ab Feb 2027") | **Berechtigt** | Default-Start Welle 1 = **Feb 2027** (Phase 6, regelkonform). Die Zeitsperre endet zwar am 1.12.2026, aber der Plan präjudiziert Davids Kalender nicht: ein **Dez-Vorziehen ist reine Opt-in-Option in T0b** — ohne explizites Ja bleibt Feb 2027 |
| 4a | Gerichtsferien/Feiertags-Matrix in Kette, aber in keiner Phase | **Berechtigt** | Explizit als **26×-Slot Nr. 5** am Ende von Phase 6 eingeplant (Bau nach E5-Abschluss, Abnahme in Welle 2) |
| 4b | Vollständigkeits-Audit `annex_*` (99) + `<img>` (29) fehlt | **Berechtigt** | In **Phase 1** vor dem Normtext-Freeze eingereiht (laut Memory das ausdrückliche NÄCHSTE nach M13); `<img>`-Rest darf notfalls ins AKN-Fenster Phase 3 rutschen |
| 5a | `check:materialien`/`check:entscheide` „evtl. erfunden" | **Widerlegt** | Beide Tore **existieren** in `package.json` (`check:entscheide` = `scripts/normtext/check-entscheide.ts`, `check:materialien` = `scripts/materialien/check-materialien.ts`) und laufen im Sammel-`npm run check`; `check:plan`/`check:tabellen` ebenso. `check:paritaet` ist als geplantes Dauer-Tor in ROADMAP W2·6-DATA verankert (dort DoD = „Tor existiert + grün") |
| 5b | Phase 7 Long-Tail ohne Pro-Doktyp-Tor | **Berechtigt** | Regel ergänzt: **kein Doktyp ohne eigenes benanntes Tor**; erster Schritt jedes Doktyps = Tor bauen |
| 5c | BS-Differenzierer „gegated" ohne Tor-Namen | **Berechtigt** | Tore benannt: `check:struktur-konsistenz` + Golden + Playwright-Regressionsfälle je Welle |
| 6a | Phase 6 führt E5 + E6a + Pakete 3/4 im selben Fenster (Rule 3 schwelt) | **Teils widerlegt, teils übernommen** | E6a (Kreisschreiben ESTV/BSV/FINMA/SEM) und Pakete 3/4 sind **Bund-Stränge**, keine 26×-Kandidaten — nur E5 hält den Slot, Rule 3 ist gewahrt. Übernommen wird der Mechanik-Fix: **Slot-Inhaber als @meta-Etikett** in der ROADMAP, Übergabe nur per explizitem Etikett-Commit |
| 6b | Turso doppelt (T0b Grund / T1 Betrag) | **Berechtigt** | Zusammengelegt: T0b entscheidet **Grund UND Betragsrahmen (Cap)**; T1 entfällt, Rückfrage nur bei Cap-Überschreitung |

---

## Leitgedanke der Chronologie

Die Wertkette (Ordnungsregel 4) gibt das Rückgrat vor: **Quelle → Senke (DB) → Darstellung → Verzahnung**. Der QS-DATA-Strang E0–E6 ist das tragende Fundament und wird in Phase 1 verortet; alles andere ordnet sich in **vier dauerhafte Parallel-Bahnen** um ihn herum. Die Bahnen sind **kollisionsarm** (eigene Worktrees, weitgehend disjunkte Dateiflächen), aber nicht kollisionsfrei: die bekannten geteilten Knoten (`ArtikelBody.tsx`, `App.tsx`/`prerender.ts`/`startseiteConfig.ts`, `lib/tabs.ts`) werden über die **Datei-Eigentümer-Regel** entschärft — pro Knoten und Phase genau ein schreibender Strang, alle anderen warten oder rebasen dahinter (Detail: Risiko 5).

| Bahn | Inhalt | Kern-Dateifläche (+ bekannte geteilte Knoten) |
|---|---|---|
| **A — Daten/Korpus** | QS-DATA E0–E6, Fedlex-Pakete, Kanton-Import; **hält den einen 26×-Slot** | `normtext-snapshot.ts`, `public/normtext/**`, `daten/lexmetrik.db`, Adapter |
| **B — Rechtsprechung** | OCL-Abbau, Entscheidsuche, kantonale Entscheide | `adapter-entscheide.ts`, `norm-index.ts`, `EntscheidLeser.tsx` |
| **C — Werkzeuge/Vorlagen** | Vertragsvarianten, Musterklagen, Beurkundung/Notariat, Rechner | `startseiteConfig.ts` (geteilt mit D!), `registry.ts`, `src/lib/vorlagen/**` |
| **D — Querschnitt** | QS-PERF, SEO/A11y, UX-Batches, Split-View-Rest, QS-PH, Lernphase A/B | `App.tsx`, `seo.ts`, `prerender.ts`, Reader-Shell; **`ArtikelBody.tsx` geteilt mit Bahn A (BS-Reader)** |

**Der eine 26×-Slot** wird als serielle Kette vergeben (Ordnungsregel 3), Slot-Inhaber steht als **@meta-Etikett in der ROADMAP**, Übergabe nur per explizitem Etikett-Commit:

`E3 BGer-Masse (Ph2) → W3·12 Kanton-Gesetze-Bündel (Ph4) → Tarif-26×-Bündel I2/I4 + Tarif-Tabellen-Stufe2 + I9 (Ph5) → E5 Kanton-Rechtsprechung (Ph6) → Gerichtsferien/Feiertags-Matrix (Ph6-Ende)`

Das fertig gebaute 26×-Asset **Beurkundung** wird in Phase 0 per Batch-Deploy aus dem Slot entlassen (Abnahme bleibt in der Abnahme-Welle).

**Autonomie-Prinzip (Ordnungsregel 2):** Bis 1.12.2026 laufen ausschliesslich Fachzeit-freie, tor-verifizierte Schritte. Alles Abnahme-Pflichtige wird gebaut, gegated, mit Status-Marker (`entwurf`) versehen und in **eine** Abnahme-Warteschlange gestellt. **Abnahme-Welle 1 startet regelkonform ab Feb 2027** (mit G1); ein Vorziehen auf Dez 2026 geschieht nur, wenn David es in T0b ausdrücklich wählt. Welle 2 folgt im G1-Fenster danach.

---

## Phase 0 — Ordnung, Deploy-Fenster, Freigabe-Paket *(jetzt, Juli 2026, ~1–2 Wochen)*

**(a) Eingangs-Voraussetzung:** keine — Ist-Stand 2.7.2026.

**(b) Inhalt (Herkunfts-FAHRPLAN):**
1. **Plan-Konsolidierung (§14-Bündelungen)** — die vier dokumentierten Duplikate zu je EINEM Schritt zusammenführen:
   - `livesuche.ts`-Doppel: BGE-DARSTELLUNG Teil B ↔ ENTSCHEIDSUCHE-AUSBAU P1–P6 → ein Strang.
   - Bürgschaft/Ehevertrag/ABV: VERTRAGS-VARIANTEN F/H/I ↔ VORLAGEN-AUSBAU V5/V6 → ein Strang.
   - Kanton-Adapter-Trio: BS-VORBILDKANTON S1–S13 + Popup-Kanton-Rest + GESETZE-IMPORT-3TIER/Rechtssammlung P6 → **ein** «Kanton-Gesetze-Bündel» (Bau in Phase 4).
   - `FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md`: P3/P4-Reste in ROADMAP nachverlinken, Rest archivieren.
2. **QS-PH @meta-System ausbauen** (`plan:next`/`check:plan`, FAHRPLAN-PLAN-STEUERUNG) + **Thema D Doku-Hygiene** (FUNDAMENT-UMBAU) — inkl. neuem **Slot-Inhaber-Etikett** für den 26×-Slot; macht diesen Phasenplan maschinell steuerbar.
3. **§9-Batch-Deploy-Fenster** [DAVID]: alle fertig gebauten, gegateten, ungepushten Stände in EINEM Ritual (`deploy-check`) vorlegen: M1–M3/M9/M10, M13, AKN Phase 0, Bündel N, S0, Begründungs-Absatz, Vertrags-Varianten P0–P2, Vorlagen V1–V3, **Beurkundungs-Ausbau** (entlastet den 26×-Slot; Status bleibt `entwurf` bis Abnahme).
4. **EIN Freigabe-Paket** [DAVID, ~30 Min, reine Ja/Nein-Entscheide, keine Fachprüfung]: (i) E0-Start (Prozess-Freigabe 5), (ii) Fedlex Paket 1 Currency, (iii) Bestätigung 26×-Kette inkl. Slot-Etikett (E3 zuerst, §10.1), (iv) FUNDAMENT-UMBAU Thema B+C Go/No-Go, (v) GmbH-G2-Go (optional, kann warten), (vi) **Turso-Billing dem Grunde nach + Betragsrahmen/Cap** (einziger Turso-Touchpoint; Rückfrage nur bei Cap-Überschreitung), (vii) **Optional-Frage Abnahme-Welle 1: Feb 2027 (Default) oder Vorziehen auf Dez 2026?**
5. **Konfliktfreie Sofort-Arbeit parallel:** Rechtsprechung #1 SG-P0-Reparatur (Treue vor Menge), Entscheidsuche P6 Korpus-Cross-Check-Tor, OCL W8 Verifikations-Rails (QS-GP), Lighthouse-CI-Schranken (PERFORMANCE), UX-Batch A Quick-Wins, Lernphase Strang A Status-Marker beginnen (LERNPHASE-2026).

**(c) Warum hier:** Ohne §14-Bündelung droht Doppel-Bau auf denselben Dateien (Ordnungsregel 3); ohne Deploy-Fenster wächst der ungepushte Berg und blockiert den 26×-Slot; beide P0-Stränge (E0 + Paket 1) stehen an derselben Freigabe-Schwelle — ein einziges Freigabe-Paket minimiert Davids Touchpoints. Die Sofort-Arbeit hat keine Kollisionsfläche mit Phase 1.

**(d) Parallel erlaubt:** Punkte 1/2/5 vollständig parallel (disjunkte Flächen); 3/4 sind Davids Kalender.

**(e) Tore/DoD:** `check:plan` grün auf konsolidierter ROADMAP inkl. Slot-Etikett; Deploy-Fenster mit vollem `deploy-check`-Ritual; jede Bündelung hinterlässt genau einen führenden FAHRPLAN + Verweis-Stubs; Sofort-Fixes je `gate.sh` + Gegenprüfung bei Risikopfaden.

**(f) David-Touchpoints:** **T0a** Batch-Deploy-Ja (§9), **T0b** Freigabe-Paket. Sonst nichts.

---

## Phase 1 — Fundament: Currency → Vollständigkeit → E0 → E1 Generator-Flip *(Juli–Aug 2026)*

**(a) Voraussetzung:** T0b (Freigaben E0 + Paket 1).

**(b) Inhalt:**
- **Bahn A (seriell, Normtext-Freeze):**
  1. **Fedlex Paket 1 — Gesetze-Currency** (FEDLEX-PORTFOLIO): 20 veraltete Erlasse, 11 Pins, 56 Wiedervorlagen. *Zuerst*, damit E0 die DB mit geltendem Recht befüllt statt mit Drift.
  2. **Vollständigkeits-Audit nach M13** (NORMTEXT-DARSTELLUNG, dortiges explizites NÄCHSTES): **Anhänge `annex_*` (99 Gesetze) → Bilder/Formeln `<img>` (29 Gesetze) → LugÜ-Protokolle/Marken-Garbling** — letzte Parser-Eingriffe vor dem Freeze. Falls der `<img>`-Teil das Fenster sprengt: Rest reitet im AKN-Fenster Phase 3 auf DB-Substrat mit, `annex_*` und LugÜ sind nicht verschiebbar.
  3. **E0 Fundament + Reverse-Befüllung** (DATENHALTUNG): Schema/Ingest/Projektion, `check:paritaet` (DoD: Tor existiert + grün), golden-neutral.
  4. **E1 Generator-Flip**: Generatoren schreiben in DB, `public/*.json` = byte-gleiche Projektion; 3 Doppelläufe byte-gleich vor Altpfad-Entfernung; Risiko-Pfad ⇒ `check:gegenpruefung` Pflicht.
  - **Normtext-Freeze:** Während E0/E1 fasst KEIN anderer Strang `normtext-snapshot.ts`/`public/normtext/**`/`register.json` an (AKN Phase 1, Reader-Batches am Datenpfad, UX-C5 Ingress warten).
- **Bahn B parallel:** OCL W5 Struktur-Splitter → W6 Instanzenzug → #10 FR/IT-Mapping (R2-neu, 3 Wächter + Pflicht-Gegenprüfung) — seriell innerhalb der Bahn (`adapter-entscheide.ts`), aber unabhängig von Bahn A. Dazu #11 norm-index-Split.
- **Bahn C parallel:** V8 Musterklagen, gebündeltes Bürgschaft/Ehevertrag/ABV, V7a Verzugszins, V2b-Rest, NG-4 Zweitpass (`[OF]`-fähig).
- **Bahn D parallel:** SEO-A11y **W1.0 + W1.1** Detail-Prerender + Sitemap — Reihenfolge-Entscheid aus T0b umsetzen: falls Thema B (Routen-SSoT) Go hat, Thema B *zuerst*, dann W1.1 auf der neuen Topologie (identische Dateien `App.tsx`/`prerender.ts`/`startseiteConfig.ts` — nie parallel, Datei-Eigentümer = Thema B). Dazu A11y-Restpunkte W1, Lernphase Strang B (Verifikations-Infrastruktur).

**(c) Warum hier:** Ordnungsregel 1 (Fundament vor Fläche) — E0/E1 sind der Flaschenhals des gesamten QS-DATA-Asts; jeder später gebaute XL-Strang (M16, AKN 1, Suche, Massen-Import) setzt sonst auf dem falschen Substrat auf. Paket 1 + Vollständigkeits-Audit davor heilen aktive Treue-/Vollständigkeitsdefekte (Ordnungsregel 5) und verhindern, dass veraltete oder amputierte Fassungen in die DB einwandern.

**(d) Parallel:** Bahnen B/C/D vollumfänglich (je eigener Worktree §12); innerhalb Bahn A strikt seriell.

**(e) Tore/DoD:** `check:fedlex-versionen` grün (Paket 1); `check:vollstaendigkeit` + `check:bilder` auf dem Audit; `check:paritaet` byte-gleich über 3 Doppelläufe (E1); volles `gate.sh` + `check:gegenpruefung` auf allen Risiko-Pfaden; `check:struktur-konsistenz`; Golden unverändert.

**(f) David-Touchpoints:** keine (T0b deckt alles; Deploys folgen der Auto-Merge-/Batch-Regel).

---

## Phase 2 — Senke füllen: Edge-Suche + BGer-Masse + Materialien *(Aug–Sep 2026)*

**(a) Voraussetzung:** E1 grün (DB = Wahrheit), Normtext-Freeze aufgehoben.

**(b) Inhalt:**
- **Bahn A:** **E2 POC-Scheibe + Edge-Suche** (alle BGE + 218 Bund-Gesetze in DB, Turso-Replika im T0b-Cap, `universalSuche` read-only) → danach **E3 BGer-Massen-Import** (~191k, voilaj-Parquet, DB-only, Long-Tail-Route) — **26×-Slot Nr. 1**, inkl. OCL W12/Entscheidsuche P5 (dieselbe Senke, Council-Entscheid 2.7.).
- **Bahn A-Nebengleis (kollisionsarm, neue Fläche):** **Fedlex Paket 2 Botschaften** → **Paket 5 AS-Änderungshistorie** (erbt Pipeline; = E6b-Vorbau). UI-Andockung in `gesetz-leser/inhalt.tsx` mit Bahn-D-Arbeit koordinieren (ein Worktree-Fahrplan, Datei-Eigentümer-Regel).
- **Bahn B:** gebündelter **Entscheidsuche-Ausbau P1+P2** (Facetten/Pagination/Sprache, Geschäftsnummer-Direktzugriff, Zitat-Verifikation) — nach Phase-0-Bündelung genau einmal gebaut.
- **Bahn C:** **P3 neue Vertragsgrundtypen** (Kauf/Schenkung/Tausch) beginnen; Prozesskosten-Reste OHNE 26×-Charakter.
- **Bahn D:** **Reader-Batch C (M4/M5/M7/M8)** + danach **M6/M11 Fremdgesetz-Popup** (GESETZESDARSTELLUNG-BUND) — seriell auf `ArtikelBody.tsx` (Datei-Eigentümer diese Phase: Batch C), koordiniert mit Split-View-B-3-Rest. SEO **W1.2–1.5 Meta/JSON-LD** (mechanischer Teil; kuratierte Descriptions in die Abnahme-Warteschlange).

**(c) Warum hier:** Wertkette — erst jetzt (DB steht) lohnt Massen-Import; E3 vor E5 ist entschieden (§10.1); Bund vor Kantonen (Ordnungsregel 5, Traffic). Materialien-Pakete 2/5 sind die günstigsten Nordstern-Doktyp-Erweiterungen (neue Fläche, Pipeline-Erbe) und speisen E6b ohne eigenen Bau.

**(d) Parallel:** E2/E3 seriell in Bahn A; Pakete 2/5 parallel dazu (keine geteilten Dateien mit E3); B/C/D frei parallel. **E3 hält den 26×-Slot exklusiv** (Etikett) — kein Kanton-Bulk, kein Tarif-26× gleichzeitig.

**(e) Tore/DoD:** `check:perf-budget` als E2-Abnahmekriterium; Dedup-/Plausibilitäts-Invarianten als DB-Tore + `check:entscheide` (E3); **`check:materialien`** (existiert, `scripts/materialien/check-materialien.ts`) + Netz-Tor + Pflicht-Gegenprüfung (Pakete 2/5); Playwright-verifizierte Reader-Fixes; Opus-Stichprobe auf E3-Kuratierung (maschinell, keine David-Zeit).

**(f) David-Touchpoints:** keine (Turso-Betrag ist durch den T0b-Cap gedeckt; Rückfrage nur bei Überschreitung).

---

## Phase 3 — Darstellung + Verzahnung Bund: Zitat-Graph, Versionierung, XML *(Sep–Okt 2026)*

**(a) Voraussetzung:** E3-Datenbasis in DB; E2-Suche live.

**(b) Inhalt:**
- **Bahn A:** **E4 Zitat-Graph** (`zitat_kanten`/`norm_kanten`, in-degree-Ranking). Danach **M16 Geltungsstände/Versionierung** + **AKN-XML Phase 1** (inkl. allfälligem `<img>`-Rest aus Phase 1) — beide XL, beide **erst jetzt**, weil sie auf DB-Artefakt statt JSON-Generator aufsetzen; inkrementell, reitet auf Drift-Zyklen, `check:akn-containment`.
- **Bahn B:** **OCL W7 Zitationsgraph-UI** (auf E4-Kanten) + **Entscheidsuche P3/B4 Norm↔Entscheid live im GesetzLeser** — Panel-Fläche `EntscheidLeser`/`parts.tsx` seriell vergeben. **W13 Suchindex-Härtung** (auf E2-Basis).
- **Rechtssammlung P4 Volltextsuche:** als **E2-Consumer** realisiert (Edge-Suche statt FlexSearch-Doppelbau — der QS-DATA-Vorbehalt des Fahrplans löst sich damit auf); P5 Gliederung nur nach Redundanz-Check gegen M3/`struktur-extrahiere.ts`.
- **Bahn C:** P4–P5 Vertragsgrundtypen; **GmbH G2–G7** falls T0b-Go (AG-Fahrplan 1:1).
- **Bahn D:** SEO **Welle 2**, UX **Batch B Tab-System** (koordiniert mit Split-View-Rest — geteiltes `lib/tabs.ts`, ein Eigentümer), danach **Batch E Einstellungen**; QS-PERF **OR-LCP-Architektur-Entscheid** — jetzt entscheidbar, weil E2 klärt, ob Rank 7 (Worker-Suche) entfällt; M15 Sprachverfügbarkeit.

**(c) Warum hier:** Wertkette Stufe 3/4 — Verzahnung Norm↔Entscheid ist der Burggraben, braucht aber E3/E4-Daten; M16 (Historie = Nordstern-Kernanforderung) und AKN brauchen die DB als Träger. Der Cluster-Hinweis «M16/AKN/P4 vor Baubeginn gegen QS-DATA prüfen» ist konstruktiv erledigt: sie stehen NACH E1–E3.

**(d) Parallel:** E4 ∥ W13 ∥ Bahn C ∥ Bahn D; M16 und AKN Phase 1 NICHT gleichzeitig mit Fedlex-Paketen an denselben Extraktor-Dateien — innerhalb Bahn A seriell takten.

**(e) Tore/DoD:** OCL-Plausibilitäts-Checks als DB-Invarianten (E4); `check:akn-containment` + `check:invarianten` (AKN); Drift-Tor-Ausbau für M16 (datierte Fassungen); Golden/`check:perf-budget` durchgehend.

**(f) David-Touchpoints:** keine.

---

## Phase 4 — Kantone (Gesetze): Treue-Fixes → Breitenimport + Vendor-Sondierungs-Tor *(Okt–Nov 2026)*

**(a) Voraussetzung:** 26×-Slot frei (E3 abgeschlossen, Etikett übergeben); Phase-0-Bündelung des Kanton-Adapter-Trios liegt vor.

**(b) Inhalt:**
- **Bahn A, seriell (das Kanton-Gesetze-Bündel = W3·12), 26×-Slot Nr. 2:**
  1. **BS-Sofortfixes S1–S13** (BS-VORBILDKANTON): Aufgehobene-Artikel-/Randtitel-/`paragraph_post`-Verlust, Fehlsortierung, 51 unsichtbare Erlasse — korpusweiter Adapter-Hebel **vor** jedem Bulk.
  2. **Kanton-Vollständigkeits-Ausbau** (3-TIER Phase 1-Rest/2/3 + Rechtssammlung P6 + Popup-Kanton-Rest): alle clex/LexWork-Kantone discovery-basiert, Confidence-Quarantäne, render_mode/Tier-Badge; Auto-Akzept-Teil autonom, Quarantäne-Fälle (25–40%) in die Abnahme-Warteschlange (Ordnungsregel 2).
  3. **BS-Differenzierer-Wellen** (TOC-Re-Run, Status-Ehrlichkeit, Tarif-Tabellen-Anzeige) gestuft; **Tore je Welle: `check:struktur-konsistenz` + Golden + Playwright-Regressionsfälle** (S1–S13 als Dauertests).
- **Bahn B:** **UX-Batch F** (Kanton-Entscheide-Recherche, reines Plandokument) + **Vendor-Sondierungs-Tor** (RECHTSPRECHUNG #2): **empirische CORS-Probe je Vendor-Cluster (Tribuna/Findinfo) + Lizenz-Klärung, schriftlich dokumentiert als Go/No-Go-Protokoll** — R3 ist unbestätigt, darum ist dies ein *Verifikations-Tor vor dem Bau*, nicht blosse „Vorbereitung"; bei No-Go steht der Fallback fest (serverseitiger Fetch in die eigene DB / entscheidsuche-Spiegel), bevor Phase 6 startet. Dazu **PDF-Fallback** (Kantonale-Entscheide P3, EMRK-Muster).
- **Bahn C:** P6 Vertragsgrundtypen; **G3.4 kantonale Passung** (Notariate/HR-Ämter verdrahten — mechanisch); ZH-243-NotGebV-Spec vorbereiten (Bau im Tarif-26×-Fenster Phase 5).
- **Bahn D:** UX **Batch C** Gesetzesleser (C1–C4; C5 Ingress jetzt möglich, Datenpfad frei; `ArtikelBody.tsx`-Eigentümer diese Phase: Bahn A/BS-Reader — Batch-C-Restpunkte daran seriell); Lernphase Strang C (Fristen-Engines abnahmefertig aufreihen) — bereitet die Abnahme-Welle vor. *(UX-Batch D Internationale Verträge ist bewusst NICHT hier: er gehört zu Fedlex Paket 4 und wandert nach Phase 6.)*

**(c) Warum hier:** Ordnungsregel 5 (Treue vor Breite): S1–S13 zuerst, sonst repliziert der Bulk defektes Verhalten in 18+ Kantone. Der Nordstern fordert alle 26 Kantone — dies ist das 26×-Asset schlechthin, und es ist erst jetzt dran, weil (i) der Slot frei ist, (ii) die DB als Senke steht (Kanton-Erlasse landen direkt in der EINEN Wahrheit statt in einer weiteren JSON-Generation).

**(d) Parallel:** Bahnen B/C/D frei; innerhalb Bahn A strikt seriell (identische Adapter-Dateien).

**(e) Tore/DoD:** Kreuzdiff-Netz-Gate, Confidence-Quarantäne dokumentiert je Kanton, `check:paritaet` (DB-Weg), Regressionsfälle S1–S13 als Dauertests, §1-Stichproben protokolliert; **Vendor-Go/No-Go-Protokoll liegt vor** (harte Eingangsbedingung für Phase 6).

**(f) David-Touchpoints:** keine (Quarantäne-Review wird NUR aufgestaut, nicht angefragt).

---

## Phase 5 — Autonome Fortsetzung + Abnahme-Bereitstellung *(Dez 2026–Jan 2027)*

**(a) Voraussetzung:** 26×-Slot frei nach W3·12; Lernphase-Stränge A/B/C haben Material vorbereitet.

**(b) Inhalt:**
- **Bahn A: Tarif-26×-Bündel — 26×-Slot Nr. 3, seriell:** Prozesskosten I2-Rest+I4 (gleiche Datenschicht), Tarif-Tabellen-Stufe2 (D→A→C→B; `spalten`-Schema-Abstimmung mit Fedlex-Extraktor ist nach Phase 3 konfliktfrei), I9, ZH-243. Jeder Tarif-Wert mit Norm + Link + Stand + Gegenprüfung (Daueranweisung).
- **Bahn B:** OCL W10 Materialien-/Rechtsetzungs-Tracking + W3·11 «was kommt» (auf Paket-2/5-Pipeline).
- **Bahn D:** QS-PERF-Reste, SEO **Welle 3-Gerüst** (Content-Teil in die Abnahme), QS-GP Baustein d (rückwirkende Gegenprüfungs-Kampagne, risiko-priorisiert).
- **Abnahme-Bereitstellung (kein David-Termin):** sämtliche Warteschlangen-Einträge werden per `abnahme`-Skill zu fertigen Abnahme-Paketen geschnürt und priorisiert (Fristen-Engines zuerst, dann grosse Kantone der Quarantäne), sodass die Welle ab Feb 2027 mit maximalem Durchsatz starten kann.
- **Nur falls David in T0b das Vorziehen gewählt hat:** Abnahme-Welle 1 beginnt bereits hier (Inhalt wie Phase 6/T3 beschrieben); Default ist das NICHT.

**(c) Warum hier:** Ordnungsregel 2 nennt Feb 2027 für die Abnahme-Welle — dieses Fenster bleibt darum standardmässig vollständig autonom und nutzt die Zeit für das letzte grosse Fachzeit-freie 26×-Asset (Tarif) plus die Paket-Schnürung, damit Davids Stunde ab Feb maximalen Durchsatz hat.

**(d) Parallel:** Tarif-26× (Bahn A) ∥ W10/W11 (Bahn B) ∥ QS-GP d/PERF (Bahn D) ∥ Paket-Schnürung — vollständig disjunkt.

**(e) Tore/DoD:** `check:tabellen` (Stufe 2); `check:gegenpruefung` auf jedem Tarif-Pfad; Abnahme-Pakete vollständig nach `abnahme/SCHEMA.md`-Vorlage vorbereitet (Status bleibt `entwurf`).

**(f) David-Touchpoints:** keine (ausser er hat das Vorziehen in T0b selbst gewählt).

---

## Phase 6 — Abnahme-Welle 1 + Kanton-Rechtsprechung + VerwVO + Materialien-Vollausbau *(Feb–Mai 2027)*

**(a) Voraussetzung:** Feb 2027 (Ordnungsregel-2-Fenster, G1 beginnt); 26×-Slot frei nach Tarif-Bündel; **Vendor-Go/No-Go-Protokoll aus Phase 4 liegt vor**.

**(b) Inhalt:**
- **[DAVID] T3a — Abnahme-Welle 1 (gebündelt, Pakete aus Phase 5 fertig):** BGer-Rechtsweg, Beurkundungs-Ausbau, Notariat/NG-4-`geprüft`, Popup, Vorlagen-Ausbau/Vertrags-Varianten, G2/B-Start (Fristen-Engines zuerst), Kanton-Quarantäne-Fälle (grosse Kantone priorisiert), kuratierte SEO-Descriptions, Tarif-Bündel-Werte.
- **[DAVID] T3b — Entscheid-Paket 2 (eine Sitzung):** Teil-D-Neuzugänge, Fall-Rückgrat 5 Entscheide, Fristerstreckung (b), Doktrin Art. 142 ZPO, Themen E/F (FUNDAMENT-UMBAU), Live-Rechtsprechung-Lizenzfrage, **Anonymisierungs-Stichprobe kantonale Entscheide (entsperrt E5)**.
- **Bahn A (nach T3b-Stichprobe grün): E5 Kantone-Vollkorpus Rechtsprechung** + **Vendor-Ausbau** (Tribuna/Findinfo-Cluster statt 26 Einzelscraper — **nur bei grünem Sondierungs-Tor**, sonst Fallback-Pfad) — **26×-Slot Nr. 4**, in Kantons-Wellen (grosse Kantone zuerst). Danach **E6a Verwaltungsverordnungen** (Kreisschreiben ESTV/BSV/FINMA/SEM — **Bund-Strang, belegt den 26×-Slot NICHT**; Quell-Inventar-Probe nach §7 zuerst). Zum Abschluss **Gerichtsferien/Feiertags-Matrix** — **26×-Slot Nr. 5** (Etikett-Übergabe nach E5-Abschluss; Bau autonom, Fristen-Abnahme in Welle 2).
- **Bahn A-Nebengleis (Bund, kein Slot):** **Fedlex Paket 3 Vernehmlassungen** (POC zwingend zuerst) + **Paket 4 Staatsverträge** kuratiert + International P2-Rest — komplettiert E6b.
- **Bahn B:** **Kantonaler Norm-Resolver** (#5; Linkziele existieren seit Phase 4) + **NormText Phase 2** kantonale §-Verweise + NormText Phase 3 Prosa-Literale — die Verzahnung Norm↔Entscheid↔Material über alle Ebenen.
- **Bahn C/D:** **UX-Batch D Internationale Verträge** — jetzt echt koordiniert mit Paket 4 (gleiche Phase, ein Fahrplan-Slot); Fall-Rückgrat Phase 0–3 (falls T3b-Entscheide gefallen), Rest-Musterklagen, hreflang/i18n gemäss Thema-F-Entscheid.
- **[DAVID, klein] T4 — G1-Kanzleigespräche + Kuratierung kantonale Leitentscheide (#4) + GebV-Grundsatzfragen + Abnahme-Welle 2** (Rest-Warteschlange inkl. Gerichtsferien-Matrix) — ins G1-Fenster eingebettet.

**(c) Warum hier:** Abnahme-Welle regelkonform ab Feb 2027; Nordstern-Doktypen-Vollständigkeit (VerwVO + Materialien) setzt E3/E4-Infrastruktur und die Kanton-Gesetzes-Basis (Linkziele!) voraus; kantonale Rechtsprechung erst nach P0-Fix (Phase 0), Vendor-Tor (Phase 4) und Stichproben-Freigabe (T3b) — Treue vor Breite, kein Big-Bang.

**(d) Parallel:** Abnahme (David) ∥ E5-Wellen ∥ Pakete 3/4 ∥ Bahn B ∥ Bahn C/D; E6a erst nach E5-Kern (gleiche DB, neue Adapter — Serialisierung per Dateifläche, kein Slot-Konflikt, da Bund).

**(e) Tore/DoD:** Abnahme-Protokolle nach `abnahme/SCHEMA.md`, Status-Hebung `entwurf→geprüft` nur durch David; `check:entscheide` + Budget-/Dedupe-Tor je Kantons-Welle; POC-Gate vor Paket 3; Quell-Wahl-Probe dokumentiert je Amt (E6a); `check:materialien` für E6b; Provenienz + Fundstelle an jedem Dokument (Nordstern-Kernanforderung).

**(f) David-Touchpoints:** **T3a** Abnahme-Welle 1, **T3b** Entscheid-Paket 2, **T4** G1 + Kuratierung + Welle 2.

---

## Phase 7 — Nordstern-Vollzug: Selbst-Hosting, Historie, Long-Tail *(ab Mitte 2027)*

**(a) Voraussetzung:** Vollkorpus Bund + grosse Kantone in DB; Abnahme-Wellen 1+2 durch; 26×-Kette abgearbeitet.

**(b) Inhalt:** **Selbst-Hosting-Migration** (eigene Infra statt Vercel/Turso-Vendor-Zwang — bewusst spät, wenn Last- und Kostenprofil real bekannt sind) [DAVID: Hosting-/Domain-/Kosten-Entscheid]; Historie-Vollausbau (M16-Ausdehnung auf Kantone, Point-in-Time überall); **Long-Tail-Kantone Doktyp-für-Doktyp — Regel: kein Doktyp ohne eigenes benanntes Tor; erster Schritt jedes Doktyps ist der Bau seines Validators (Muster `check:entscheide`/`check:materialien`), erst dann Import**; kantonale Materialien (Analogie E6b, sofern Quellen es hergeben); kontinuierlicher Betrieb: Drift-Tore, Verfallsregister, monatlicher Self-Audit, QS-GP-Kampagnen.

**(c) Warum hier:** «Selbst gehostet» ist Nordstern-Anforderung, aber ohne Datenbestand kein sinnvolles Dimensionieren; alle Ordnungsregeln (Fundament, Treue, Staffelung) sind bis hier erfüllt — Phase 7 ist Ernte + Betrieb.

**(d) Parallel:** Long-Tail-Wellen seriell im 26×-Slot (Etikett läuft weiter); Betrieb (Drift/Verfall) daueraktiv.

**(e) Tore/DoD:** Migrations-Paritätstest (byte-gleiche Projektion auf neuer Infra); alle Drift-Tore auf neuer Infra grün; Pro-Doktyp-Tor grün vor jedem Import; Nordstern-Checkliste (DB=Wahrheit ✓ selbst gehostet ✓ geltender Stand ✓ Fundstelle ✓ Historie ✓).

**(f) David-Touchpoints:** **T5** Hosting-/Kosten-Entscheid.

---

## Übersichtstabelle

| Phase | Zeitraum | Kern-Inhalt (Bahn A) | Parallel (B/C/D) | Zentrales Tor | Fachzeit David | 26×-Slot |
|---|---|---|---|---|---|---|
| **0** | Juli 26 | §14-Bündelungen, QS-PH+Slot-Etikett, Batch-Deploy, Freigabe-Paket | SG-P0-Fix, W8-Rails, UX-A, Status-Marker | `check:plan`, deploy-check | **T0: 2 kurze Blöcke** | — (Beurkundung entlassen) |
| **1** | Juli–Aug 26 | Paket 1 Currency → `annex_*`/`<img>`-Audit → E0 → **E1 Flip** (Normtext-Freeze) | OCL W5/W6/#10 · V8/Bündel-V5 · SEO W1.1(+Thema B) | `check:paritaet` byte-gleich ×3 | nein | — |
| **2** | Aug–Sep 26 | **E2 Edge-Suche → E3 BGer-Masse** · Pakete 2/5 Materialien | Entscheidsuche P1+P2 · P3-Typen · Reader-Batch C+M6/M11 | E2-Perf-Budget, `check:entscheide`/`check:materialien` | nein (Turso via T0b-Cap) | **E3** |
| **3** | Sep–Okt 26 | **E4 Zitat-Graph → M16 Versionierung + AKN Phase 1** | W7-Graph-UI, P3/B4, W13, RS-P4-via-E2 · GmbH G2+ · SEO W2, UX B/E, OR-LCP | `check:akn-containment`, Drift-Tor-Ausbau | nein | — |
| **4** | Okt–Nov 26 | **BS-S1–S13 → Kanton-Gesetze-Bulk → BS-Differenzierer** | UX-F-Recherche, **Vendor-CORS/Lizenz-Tor**, PDF-Fallback · G3.4 · UX C, Strang C | Kreuzdiff-Netz, Confidence-Quarantäne, Vendor-Go/No-Go | nein (Review gestaut) | **W3·12-Bündel** |
| **5** | Dez 26–Jan 27 | **Tarif-26× (I2/I4, Stufe 2, I9, ZH-243)** + Abnahme-Pakete schnüren | W10/W11-Tracking · QS-GP d, SEO-W3-Gerüst | `check:tabellen`, Gegenprüfung je Wert | nein (Opt-in-Vorziehen möglich) | **Tarif-Bündel** |
| **6** | Feb–Mai 27 | **T3 → E5 Kanton-Rechtsprechung + Vendor → E6a VerwVO → Gerichtsferien-Matrix** · Pakete 3/4 | Kant. Norm-Resolver, NormText Ph. 2/3 · UX-Batch D (mit Paket 4), Fall-Rückgrat | `check:entscheide` je Welle, POC-Gates | **T3a/T3b Welle 1 + Entscheid-Paket · T4 G1 + Welle 2** | **E5 → Gerichtsferien** |
| **7** | ab Mitte 27 | Selbst-Hosting, Historie-Vollausbau, Long-Tail (Pro-Doktyp-Tor) | Betrieb: Drift/Verfall/Self-Audit | Migrations-Paritätstest, Tor je Doktyp | **T5: Hosting-Entscheid** | Long-Tail seriell |

---

## Die 5 grössten Reihenfolge-Risiken

1. **E1-Flip kollidiert mit lebenden Normtext-Strängen.** `normtext-snapshot.ts`/`public/normtext/**` werden von Paket 1, Vollständigkeits-Audit, AKN, Reader-Batches und UX-C5 gleichzeitig begehrt. *Gegenmittel:* hartes Normtext-Freeze-Fenster in Phase 1; Currency + `annex_*`-Audit VOR dem Flip; alles andere danach auf DB-Basis. Wird der Freeze aufgeweicht, bricht `check:paritaet` chronisch und der Flip verzögert alles Nachgelagerte.
2. **26×-Slot-Überbuchung.** Fünf Kandidaten (E3, W3·12, Tarif-Bündel, E5, Gerichtsferien-Matrix) + ein fertiges Asset (Beurkundung) + widersprüchliche ROADMAP-Marker. *Gegenmittel:* Slot-Kette in T0b von David bestätigen; **Slot-Inhaber als @meta-Etikett in der ROADMAP, Übergabe nur per explizitem Etikett-Commit** (in Phase 0 gebaut, von `check:plan` geprüft); Beurkundung per Batch-Deploy sofort entlassen. Bund-Stränge (E6a, Fedlex-Pakete) belegen den Slot definitionsgemäss nie.
3. **XL-Stränge auf falscher Basis.** M16, AKN Phase 1 und Rechtssammlung-P4 wären auf dem heutigen JSON-Generator Doppelarbeit (E1/E2 ändern das Substrat). *Gegenmittel:* harte Phasen-Voraussetzung «nach E1/E2», P4 explizit als E2-Consumer; vor jedem XL-Start QS-DATA-Standprüfung als Checklisten-Punkt.
4. **Defekt-Replikation beim Kanton-Bulk + ungatetes Vendor-Feld.** Läuft der Breitenimport vor BS-S1–S13 (bzw. kantonale Rechtsprechung vor SG-P0-Fix und ohne CORS/Lizenz-Klärung), werden bekannte Adapter-Fehler in 18+/26 Kantone multipliziert oder ein ganzer Strang auf unbestätigter Erreichbarkeit (R3) gebaut. *Gegenmittel:* Bündelung in Phase 0, Serialität in Phase 4/6 als DoD, **Vendor-Go/No-Go-Protokoll als harte Phase-6-Eingangsbedingung mit benanntem Fallback**.
5. **Datei-Kollisionsknoten der Bahnen.** `ArtikelBody.tsx` (Batch C, M6/M11, BS-Reader, Split-View, QS-PERF), `App.tsx`/`startseiteConfig.ts`/`prerender.ts` (SEO-W1.1 ↔ Thema B ↔ Bahn C), `lib/tabs.ts` (UX-B ↔ Split-View). Der Bahnen-Schnitt reduziert Kollisionen, beseitigt sie aber nicht. *Gegenmittel:* **Datei-Eigentümer-Regel** — pro Knoten und Phase genau ein schreibender Strang (in den Phasentexten je benannt), Serialisierung statt Parallel-Worktrees ohne Abgleich; sonst Rebase-Verlust und stille Feature-Rollbacks (Deploy-Topologie-Lektion).

*(Dahinter, beobachten: Abnahme-Stau — die Warteschlange wächst bis Feb 2027 planmässig; Risiko ist nur, dass Welle 1 ohne fertig geschnürte Pakete anläuft → Lernphase-Stränge A/B/C und die Phase-5-Paket-Schnürung sind deshalb nicht optional.)*

---

## Andockung an die bestehende ROADMAP (§14)

`ROADMAP.md` bleibt **die eine Steuerungsquelle**; dieser Plan ist eine **Ordnungs-Schicht**, kein Ersatz. Konkret:

- **Mapping:** Phase 1–3 ≙ W2·6-DATA (E0–E4) + W2·5b/W2·6-Reste + NORMTEXT-Vollständigkeits-Audit; Phase 2 deckt zusätzlich Fedlex-Portfolio-Pakete 1/2/5 ([D]-Schritt) und OCL-W12; Phase 4 ≙ W3·12 (+BS/3-Tier-Bündel) + Vendor-Sondierungs-Tor; Phase 5 ≙ Tarif-Stränge + Abnahme-Paket-Schnürung; Phase 6 ≙ Abnahme-Warteschlange (Wellen 1+2) + E5/E6 + W3·11 + RECHTSPRECHUNG-P-Kette + Pakete 3/4 + Gerichtsferien-Matrix; das Querschnitt-Band (QS-PERF/QS-GP/QS-PH, SEO-A11y, UX, Lernphase) läuft als Bahn D **durch alle Phasen** und wird — gemäss Daueranweisung «beide Zonen» — bei jedem Überblick gleichwertig mitgeführt.
- **Einpflege:** Je Phase werden die Etappen als ROADMAP-Schritte mit Link auf ihren Herkunfts-FAHRPLAN geführt (kein FAHRPLAN ohne ROADMAP-Anker — QS-PH-Regel); der Phasen-Takt selbst wird als @meta-Etikett (`plan:next`) abgebildet, das **Slot-Inhaber-Etikett** kommt als zweites Etikett dazu — beide prüft `check:plan`, sobald das Phase-0-Etikettensystem steht.
- **Konfliktauflösung:** Wo dieser Plan und ROADMAP-Fliesstext divergieren (z. B. 26×-Slot-Status, Abnahme-Welle-Startdatum), gilt ROADMAP nach Davids T0b-Entscheid — dieser Plan liefert nur den Entscheidungsvorschlag und die Begründungsordnung.
