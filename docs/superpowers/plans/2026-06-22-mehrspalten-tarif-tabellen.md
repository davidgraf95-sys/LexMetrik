# Mehrspalten-Tarif-Tabellen — Implementation Plan (Stufe 2)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use `- [ ]`.

**Goal:** Kantonale Tarif-Tabellen, die heute als verschmolzener Fliesstext erscheinen (ZH-215.3 § 4 «über 5000 bis 100001250 zuzügl. 23% …»; die `·`/`—`-Schlüssel-Wert-Tabellen NW/BS/SO/VS), werden echte Mehrspalten-Tabellen — Streitwert | Grundgebühr | Zuschlag bzw. Tarif-Nr. | Bezeichnung | Betrag (· Gemeinde · Kanton).

**Architecture:** Additives Block-Feld `mehrspaltig?: { kopf?: string[]; zeilen: string[][] }` neben Stufe-1-`tabelle`. Gemeinsame Render-Komponente `MehrspaltigeTabelle` (early-return wie `TarifTabelle`, numerische Zellen rechtsbündig + `gruppiereTausender`). Zwei getrennte deterministische Producer: (B) ZH § 4 x-koordinatenbasiert (Vorlage `extrahiereZhAnhangSpalten`), (A) NW/BS/SO/VS `·`/`—`-Text-Parser. Drift-SHA (`sha256Bloecke`, `berechneZhQuelleHash`) erweitert.

## Global Constraints
- **§1:** Zell-Inhalte exakt wie Quelle — nie Ziffern raten/umrechnen/verschlucken. Mehrdeutig → ganzen Block als Text belassen (`null`). ZH-`100001250`-Trennung NUR aus PDF-x-Geometrie (echte Spaltengrenze), nie aus dem Fliesstext.
- **§2** deterministisch. **§3** Extraktion in `scripts/`, Render nur darstellt; `gruppiereTausender` bleibt im Render (nicht im Snapshot). **§6** Tore NACKT + volle Ausgabe; Golden/Snapshot-Änderung deklariert. **§7** Snapshots nur via Generator; Drift deckt `mehrspaltig`. Regeneration braucht Netz. **§9** kein Deploy ohne Davids Ja. **§12** Branch `feat/mehrspalten-tarif-tabellen`, Pathspec-Commits.
- **Daueranweisung David:** jeder Task endet mit Gate-grün + Realdaten-Validierung + Logik-+Bug-Check; adversarialer Schluss (T8).
- **Reihenfolge:** Modell+Render → ZH § 4 (Davids Beispiel) → Klasse A.
- **AUSGESCHLOSSEN (kein Tarif!):** `BL-211.71`, `FR-635.1.1`, `FR-214.5.16` (Gesetzes-Änderungsplatzhalter «… wird wie folgt geändert: …»). Geschwister ZH-211.11/ZG-163.4/TG-176.31/BS-291.400 NICHT in diesem Plan (nur ZH-215.3 § 4 als x-aware Pilot).
- **Entscheid (David):** Klasse A via entkoppeltem Re-Parser des `·`/`—`-Texts (kein Eingriff in den golden-stabilen LexWork-`tabelleZuText`-Pfad).

---

### Task 1: Datenmodell `mehrspaltig` + Drift-SHA
**Files:** `src/lib/normtext/typen.ts` (Block-Typ), `scripts/normtext/adapter-zh-pdf.ts` (`ZhBlock`, `berechneZhQuelleHash`), `scripts/normtext/adapter-pdf.ts` (`PdfBlock`), `scripts/normtext-snapshot.ts` (`sha256Bloecke`); Test `src/tests/mehrspaltig-sha.test.ts`.
**Produces:** `mehrspaltig?: { kopf?: string[]; zeilen: string[][] }` in allen drei Block-Typen; beide Drift-Hashes beziehen es ein.
- [ ] Failing test: `berechneZhQuelleHash(mit) !== berechneZhQuelleHash(ohne)` für gesetztes `mehrspaltig`.
- [ ] FAIL bestätigen (`npx vitest run src/tests/mehrspaltig-sha.test.ts`).
- [ ] Feld additiv in `NormSnapshot`-Block, `ZhBlock`, `PdfBlock`.
- [ ] In `sha256Bloecke` `.map`: `const mTeil = b.mehrspaltig ? [(b.mehrspaltig.kopf??[]).join('\t'), ...b.mehrspaltig.zeilen.map(z=>z.join('\t'))].join('\n') : ''; return [b.text, itemTeil, tabTeil, mTeil].filter(Boolean).join('\n');` + Typ-Param ergänzen. In `berechneZhQuelleHash` analog `mTeil` anhängen.
- [ ] PASS. `npx tsc -b` + `npm run gate:schnell` grün.
- [ ] Logik+Bug-Check: rein additiv — `mehrspaltig: undefined` ⇒ byte-identischer Hash wie Weglassen; Snapshots auf Platte unverändert (`git status` nur Quellcode).
- [ ] Commit (Pathspec).

### Task 2: Render `MehrspaltigeTabelle`
**Files:** `src/components/normtext/ArtikelBody.tsx` (Komponente nach `TarifTabelle` + Verzweigung im Absatz-IIFE); Test `src/tests/mehrspaltige-tabelle-render.test.tsx`.
**Produces:** `MehrspaltigeTabelle({kopf, zeilen})`; lokale `istNumerischeZelle(s)` (true wenn `/\d/` und kein `[A-Za-zÀ-ÿ]{4,}` → rechtsbündig + `gruppiereTausender`).
- [ ] Failing test: rendert Kopf + Zeilen; Zahl-Zelle `bis 10000`→`bis 10'000`, `1250`→`1'250`; Block ohne `mehrspaltig` unverändert (kein `[data-mehrspaltig]`).
- [ ] FAIL bestätigen.
- [ ] Komponente: `data-mehrspaltig`-span, optionaler Kopf (`bg-paper-sunken/40 font-medium`), Zeilen als `flex`; je Zelle `flex-1`, Spalte >0 `pl-3`, numerisch `text-right font-medium text-ink-800` + `gruppiereTausender`, sonst `text-ink-700`. `spalten = max(kopf.length, ...zeilen.map(z=>z.length))`.
- [ ] Im IIFE VOR `const tab = b.tabelle…`: `if (b.mehrspaltig && b.mehrspaltig.zeilen.length>0) return <MehrspaltigeTabelle kopf={b.mehrspaltig.kopf} zeilen={b.mehrspaltig.zeilen} />;` (mehrspaltig vor tabelle vor Text).
- [ ] PASS. `npm run gate:schnell` + `npm run golden:vergleich` byte-gleich (kein Block hat heute `mehrspaltig`).
- [ ] Logik+Bug-Check: Block ohne `mehrspaltig` byte-gleich; `gruppiereTausender` NUR numerische Zellen (Test Zelle `'über 1 Mio.'` unverändert); Dash-Beträge `1'250.–` korrekt.
- [ ] Commit.

### Task 3: ZH § 4 x-aware Spaltenextraktion (Davids Beispiel, priorisiert)
**Files:** Fixture `src/tests/fixtures/zh-215.3-par4-stuecke.json` (echte PDF-Stücke `{x,y,h,s,p}` der § 4-Seite), `scripts/normtext/adapter-zh-pdf.ts` (neue exportierte `extrahiereZhStreitwertStaffel`), Test `src/tests/zh-streitwert-staffel.test.ts`.
**Produces:** `extrahiereZhStreitwertStaffel(stuecke): { kopf: string[]; zeilen: string[][] } | null` → `kopf:['Streitwert','Grundgebühr','Zuschlag']`, oder `null` bei nicht eindeutiger Geometrie (§1).
**Grounding:** `extrahiereZhAnhangSpalten` sammelt Stücke, gruppiert nach `(p, round(y))`, sortiert je Zeile nach x, trennt Spalten über x-Schwelle RELATIV zu `descX=min x`. Das verschmolzene `100001250` = zwei Stücke (`10000` Streitwert-x, `1250` Grundgebühr-x) am gleichen y → an x-Clustern trennen.
- [ ] **Step 0 (Netz, einmalig):** Wegwerf-Spike: `holeZhPdf`-Bytes der ZH-215.3-PDF, Stücke der § 4-Region («§ 4.»…«§ 5.») als JSON dumpen = Fixture. Ohne Netz → BLOCKED melden.
- [ ] Failing tests: 3 Spalten erkannt; `100001250`-Zeile → `['über 5000 bis 10000','1250','zuzügl. 23% …']` (load-bearing); erste Zeile `['bis 5000','25% des Streitwertes…',…]`; `extrahiereZhStreitwertStaffel([])` → `null`.
- [ ] FAIL bestätigen.
- [ ] Implementieren: Region «Streitwert»…nächster «§»/Abs.; 3 x-Cluster (Streitwert «bis/über», Grundgebühr Zahl, Zuschlag «zuzügl.%»); Schwellen relativ zu `descX`; nach `(p,round(y))` gruppieren; Spalten-Stücke joinen+trimmen; Kopf kanonisieren; Guard ≥3 Zeilen + klar 3 Cluster, sonst `null`. KEIN Ziffern-Raten.
- [ ] PASS.
- [ ] In `holeZhPdf` nach `extrahiereAlleZhParagraphen`: § 4-Region x-aware lesen, `extrahiereZhStreitwertStaffel`; bei Erfolg `artikel['4'].bloecke[0] = {...block, text:'', mehrspaltig}`; bei `null` unverändert (Fallback). Nur ZH-215.3 § 4.
- [ ] `npx tsc -b` + `npm run gate:schnell` grün.
- [ ] **Realdaten (Netz):** `npm run normtext -- --datum=$(date +%F) --nur=ZH` (Filter-Syntax verifizieren; ZH = PDF-Pfad); ZH-215.3 § 4 `mehrspaltig` inspizieren (kein `100001250`); `npm run check:normtext` grün.
- [ ] Logik+Bug-Check: jede Zeile gegen amtliche ZH-Quelle (Obergrenze/Grundgebühr/Prozent), bes. «über 600000 bis 1 Mio.» (Buchstaben-Grenze) und «über 10 Mio. … 106400» (offen); Abs.2/Abs.3 byte-gleich.
- [ ] Commit (inkl. Fixture + ZH-215.3.json).

### Task 4: Klasse-A-Parser `·`/`—` → mehrspaltig (reine Funktion)
**Files:** `scripts/normtext/mehrspaltige-tabelle.ts`; Test `src/tests/mehrspaltige-tabelle.test.ts`.
**Produces:** `extrahiereMehrspaltig(text): { kopf: string[]; zeilen: string[][] } | null` (≥2 ` — `-Zeilen mit ` · `-`Label: Wert`-Zellen, sonst `null`).
- [ ] Failing tests (echte Strings): NW Tarif-Nr.·Bezeichnung·Betrag (fehlendes Betrag→`''`); NW +Gemeinde·Kanton; SO Steuer·Einkommen; BS führende bare Nr.→«Tarif-Nr.»-Spalte; `null` bei Nicht-Tabelle.
- [ ] FAIL bestätigen.
- [ ] Implementieren: Guard ` — ` + ` · ` + ≥2 Zeilen; je Zeile an ` · `, je Zelle erstes `: ` als Label/Wert; führende `/^\d+(\.\d+)*\.?$/`-Zelle ohne `:` → Label «Tarif-Nr.»; Spaltenreihenfolge = erste-Auftritt-Vereinigung, «Tarif-Nr.» zuerst; fehlende→`''`; Zelle ohne `:` und keine Tarif-Nr. → `null` (§1). Hierarchie als String in der Nummer.
- [ ] PASS.
- [ ] Logik+Bug-Check: interner `: ` im Wert nur am ersten `: ` getrennt; Unicode-Apostroph `‘` unverändert; `null`-Pfad sicher; Promille/Sonderzeichen unangetastet.
- [ ] Commit.

### Task 5: Klasse-A-Enrichment + Regeneration (NW/BS/SO/VS)
**Files:** `scripts/normtext/adapter-pdf.ts` (`reichereMehrspaltig`, vor `reichereTabellen`), `scripts/normtext/adapter-lexwork.ts` (Aufrufpunkt — NW/BS/SO/VS sind LexWork-Quellen); Test `src/tests/klasse-a-enrichment.test.ts`.
**Produces:** `reichereMehrspaltig(bloecke)` setzt `b.mehrspaltig` + behält Einleitungssatz im `text` (NW art 3 «… wie folgt zu berechnen:»).
- [ ] Failing test: Einleitung bleibt, `mehrspaltig.kopf=['Leistungslohnband','Stundenansatz']`, Zeile `['1','Fr. 50.00']`.
- [ ] FAIL bestätigen.
- [ ] Implementieren analog `reichereTabellen`: Text am Übergang Einleitung→erster ` · `-Block trennen; nur wenn `extrahiereMehrspaltig` ≥2 Zeilen liefert; sonst unverändert. Exportieren, in beiden Aufrufpunkten VOR `reichereTabellen`.
- [ ] PASS. `npx tsc -b` + `npm run gate:schnell`.
- [ ] **Regeneration (Netz):** `npm run normtext -- --datum=$(date +%F) --nur=NW,BS,SO,VS` (Filter verifizieren); je Erlass ≥1 `mehrspaltig`-Block; `npm run check:normtext` grün.
- [ ] Logik+Bug-Check: je Erlass 3 Stichproben gegen amtliche Quelle (NW Hierarchie+Beträge, BS art 5 Staffel, SO art 44 Sätze, VS art 16); Einleitungen erhalten; AUSSCHLUSS BL-211.71/FR-635.1.1/FR-214.5.16 → KEIN `mehrspaltig`.
- [ ] Commit (inkl. die regenerierten Snapshots).

### Task 6: UI-Sicht-Verifikation
- [ ] `npm run dev`; ZH-215.3 § 4 + NW-265.51 in Lesesicht + Popover.
- [ ] Prüfpunkte: ZH 3 Spalten, `10'000`/`1'250` rechtsbündig, «über 1 Mio.» nicht gruppiert; NW Tarif-Nr. links/lesbar, Gemeinde/Kanton nur wo vorhanden; Blöcke ohne Tabelle unverändert.
- [ ] Logik+Bug-Check + Befund; bei Defekt minimaler Render-Fix (Golden byte-gleich).

### Task 7: STRUKTUR-Karte + bibliothek (§11)
- [ ] `STRUKTUR.md`-Karte (gebaut/Erlasse/Ausschlüsse/offen) + `bibliothek/INDEX.md` + Normen-Eintrag (Quelle/Stand, Regel deterministisch, Geltung+Ausschlüsse, Abnahme «Erstrecherche, Davids Abnahme offen»).
- [ ] `npm run gate` voll grün. Commit.

### Task 8: Adversarialer Schluss-Doppel-Check
- [ ] Diff aller `public/normtext/kanton/*.json` gegen main; jede neue `mehrspaltig`-Tabelle ≥5 Zeilen/Erlass gegen `quelleUrl` gegenprüfen (inkl. Randzeilen).
- [ ] Kein bisher dargestellter Block stillschweigend verschwunden (text geleert ohne mehrspaltig/tabelle).
- [ ] AUSSCHLUSS-Erlasse unverändert.
- [ ] `npm run gate` + `npm run check:normtext-netz` (Netz) grün.
- [ ] Befund dokumentieren → David zur Abnahme + Deploy-Freigabe (§9). Plan endet VOR Deploy.

## Self-Review
Modell(T1)+Render/Tausender(T2)+ZH§4 x-aware(T3)+Klasse A(T4/T5)+UI(T6)+Doku(T7)+Doppel-Check(T8). Ausschlüsse explizit. Typ `mehrspaltig:{kopf?:string[];zeilen:string[][]}` konsistent. Tausendertrenner zentral im Render (deckt auch SG).
