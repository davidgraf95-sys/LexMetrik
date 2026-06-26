# FAHRPLAN — Echte Leitentscheide (BGE) + harmonisierte Darstellung + Volltext

> Stand 26.6.2026. Zweistufig: **Schritt 1** = «Leitentscheid» ⟺ amtlicher BGE (echte
> Regeste) + eigene, an die Routine-Entscheide HARMONISIERTE Darstellung; **Schritt 2** =
> von jedem Leitentscheid den vollen Urteils-Volltext erreichbar machen, in dieselbe Seite
> integriert. Quelle: ultracode-Workflow (5 Leser + 3 Designer + Synthese + Kritik) +
> empirischer OCL-Spike 26.6. Respektiert: 20-MB-Budget, Abnahme-Zeitsperre bis 1.12.2026,
> §7 Generator-only, §8 Ehrlichkeit, golden-schonend, §2/§3/§5/§9/§12/§13.

## 0 · Empirisch verifiziert (OCL-Spike 26.6., NICHT aus Docs)

- **`court=bge` existiert** und liefert die amtliche Sammlung: `/atom/bge.xml` +
  `/decisions?court=bge&language=de&sort=date_desc&fields=compact`. IDs `bge_152 IV 14`.
- **Amtliche Regeste ist echt** (z.B. `"Regeste a\nArt. 259 StGB; …"`) — echter Leitsatz,
  nicht Gegenstand. → Schritt 1 fundiert.
- **KORREKTUR ggü. Doku/Planentwurf:** Bei `court=bge` ist `bge_reference` **undefined**;
  die Fundstelle steht in `docket_number`/`citation_string_de` (`"152 IV 14"`/`"BGE 152 IV 14"`).
  → `holeBgeLeitentscheid` muss `bgeReferenz` aus dem docket **forcieren** (der Court *ist*
  die amtliche Sammlung). Klassifizierung daher: `leit = det.court==='bge' || !!det.bge_reference`.
- **Schritt-2-Brücke bewiesen:** aza-Az. ist im BGE-`full_text` parsebar (`6B_924/2023`);
  `holeEntscheidOCL("bger_6B_924_2023")` liefert vollen Body (106k Z., Sachverhalt+65 Erw.+
  Dispositiv). Echtes aza-Datum `2025-08-26` vs. BGE-Bandjahr `2026-01-01`.

## 1 · Befund (Workflow, am Code verifiziert)

- **B1:** `--bge-von`/Court-`bge`-Pfad existiert NIRGENDS (`git log --all -S enumeriereBge`
  = nur Doku-Commit; keine Branch/Stash). → aus `bge-leitentscheide-import.md` als Spec NEU bauen.
- **B2:** Deployter Korpus = 610 Einträge, 586 `leitentscheid`, **0 mit bgeReferenz** →
  ~96 % §8-falsch, getrieben vom `!!regeste`-ODER-Glied in `adapter-entscheide.ts:327`.
- **B3:** Datenmodell trennt die Klassen schon sauber; UI-Ehrlichkeit grösstenteils verdrahtet
  (`regesteAmtlich`-Label, `nurBge`-Filter, «↗ massgebliche Fassung»). Bug = nur die Formel.
- **B5/Currency:** `kopf.ts`/`baueKopfModell` IST auf main (verifiziert) → P1c darf bauen.

## 2 · Adoptierte Entscheidungen (Defaults, da David Autonomie delegiert; §8-konform)

D1 P1a+P1b+P1c+P2 **gebündelt** in diesem Worktree (kein leerer Leitentscheid-Deploy) ·
D2 **streng** `leit = court==='bge' || !!bge_reference` · D2c Leitansicht-Kriterium
`bgeReferenz!=null && regesteAmtlich===true` (strikt §8) · D3 Re-Gen (Live-Crawl bge, kein
Handedit) · D4 «Zusammenfassung» beibehalten, Badge «Leitentscheid (BGE)» · D5 bger-`--limit`
senken statt Budget anheben · D6 entfällt (gebündelt) · D7 A2 Merge-Anreicherung ·
D8 36 %-Fallback ehrlich (Auszug+Live-Link) · D9 RegesteBox/EntscheidKopf extrahieren ·
D10 Provenienz «Vollständiges Urteil {Az.} · amtliche Sammlung BGE {Ref.}».

## 3 · Kritik-Resolutionen (Material Concerns → geschlossen)

1. **Schritt-2-Machbarkeit** → durch Spike (§0) EMPIRISCH belegt; A2 bleibt.
2. **Reuse** → `git log --all -S` = kein Code → Neubau gerechtfertigt.
3. **kopf.ts-Currency** → auf main, abgehakt.
4. **Golden-Rebaseline** → P1a/P1b/P2 enthalten bewussten Schritt «Golden (rsp/) neu
   baselinen, NUR Metadaten/Klassen-Felder, Urteilstext-Wort-Invariante grün», Diff sichten.
5. **Budget-Mathematik** → konkrete Rechnung pro Phase; `check:entscheide` als Arbiter;
   Dedup-vs-Limit-Spannung: bger-`--limit` so wählen, dass die aza-Records der Leitentscheide
   möglichst enthalten sind (max. Dedup).
6. **Confidence-Quarantäne aza** (§8) → harter Determinismus-Score: aza-Volltext NUR wenn
   (Jahr-Fenster-Sanity UND Docket/Zitierung-Gegenprüfung UND Az.-Position eindeutig); sonst
   ZWINGEND 36 %-Fallback, nie vermuteter Body.
7. **Court-Matrix gepinnt:** `gr_gerichte,be_verwaltungsgericht,zh_obergericht,sg_gerichte,ag_gerichte` je 6.
8. **Fehlende D-Entscheide** (Spike-Schwelle, Golden-Freigabe, Budget-Tor) → als Defaults oben adoptiert.

## 4 · Phasen (Ausführung)

### P1a — Klassifizierung ehrlich (deploybar solo, hier gebündelt)
- `adapter-entscheide.ts:327`: `leit = det.court==='bge' || !!det.bge_reference` (§8-Kommentar).
- `renormalisiere-bestand.ts` + Manifest-Neubau (`entscheide-schreiben.ts`-Builder OHNE rmSync):
  `leitcharakter = snap.bgeReferenz ? 'leitentscheid' : 'routine'`, register/norm-index/erfasste-keys neu.
- `check-entscheide.ts`: Gate `leitentscheid ⟹ bgeReferenz` (sonst exit 1).
- Erwartung: Ist-Korpus 586→~0 Leitentscheid; P1b füllt echte BGE nach.

### P1b — bge-Pfad neu bauen + Koexistenz-Lauf
- `adapter-entscheide.ts`: `enumeriereBge(dateFrom)` (`/decisions?court=bge…`), `holeBgeLeitentscheid(id)`
  (forciert bgeReferenz=docket, regesteAmtlich=true, leitcharakter=leitentscheid, Slug `bge_*`,
  Sachgebiet aza-Abteilung→römischer Band). Datum: aza-Cross-Fetch + Sanity, sonst Bandjahr `YYYY-01-01`.
- `normtext-entscheide.ts`: Flags `--bge-von`,`--bge-limit`; dritter Zweig; Vereinigung mit
  BGE-Vorrang bei id-Kollision; EIN Lauf = bge + bger(reduziert) + Kantons-Matrix.
- Budget: 265 BGE ≈6 MB + bger `--limit≈250` ≈8 MB + kantonal ≈1 MB ≈ 15 MB (<20).

### P1c — harmonisierte Leitansicht (verhaltensneutral §6)
- Extrahiere `<RegesteBox>` + `<EntscheidKopf variante>` (heute 2× inline) — Routine byte-identisch.
- `istLeitansicht(s)=s.bgeReferenz!=null && s.regesteAmtlich===true` in `src/lib/rechtsprechung/`.
- `EntscheidLeserInhalt`: Leitansicht = Kopf(BGE-Ref h1) → RegesteBox(Verdikt zuerst) → Body;
  Routine unverändert. Browse-Sektion «Amtliche Leitentscheide (BGE)» + Badge-Token (tailwind+css).

### P2 — Volltext-Verlinkung (A2 Merge)
- P2a: aza-Az aus BGE full_text parsen (Regex + Confidence-Quarantäne #6) → `citedRefZuId` →
  `holeEntscheidOCL(bger_…)` → Body. Feld `azaUrteil:{aktenzeichen,key}|null`. Dedup gegen bger-Graph.
- P2b: Leitansicht rendert vollen aza-Body unter der Regeste (gleiche `EntscheidBody`), inkl.
  NormText-Links; Fallback (kein/uneindeutiges aza): Auszug + «↗ vollständiges Urteil bei der Quelle».

## 5 · Bewusst NICHT Teil
Keine fachliche Abnahme (Zeitsperre; alles `kuratierung:'maschinell'`). Keine 36 %-BGE-Auflösung
über Fremdindizes. Kein ECLI, keine De-Anonymisierung. Keine eigene Route/zweiter Snapshot.
Kein eigenmächtiges BUDGET_MB-Anheben.

*Detail-Spec + Risiken R1–R14: ultracode-Workflow-Output (Run wf_a37be224-df9).*
