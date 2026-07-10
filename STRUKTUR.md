# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/HANDLUNGSPLAN,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP, ABNAHME-AG-BAUSTEINE) und die
laufenden Fahrpläne (GRUNDLAGEN, AG-/GMBH-GRUENDUNG, BGER-RECHTSWEG,
VORLAGEN-AUSBAU, VERTRAGS-VARIANTEN, FUNDAMENT-UMBAU). Abgeschlossene
Fahrpläne (DESIGN, RECHNER-DESIGN, VEREINHEITLICHUNG, TOKEN-DISZIPLIN — ins
Archiv 13.6.2026) und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026; mechanisiert 10.7.2026,
QS-TOK/T1):** Dieses Dokument wird in jeder Session und jedem Subagenten gelesen —
Karten abgeschlossener Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU
nach `archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt der
Verweis-Abschnitt. Neue Karten werden am Anker `<!-- KARTEN -->` (unten) oben
angehängt. Die Rotation ist jetzt **mechanisiert** (`.claude/hooks/struktur-rotieren.py`,
SessionStart nur im sauberen Haupt-Checkout; manuell `npm run struktur:rotieren -- --write`)
— **verschieben, nie zusammenfassen**; ein Re-Akkumulations-Wächter warnt, wenn die
Steuer-Doks ihr Budget wieder überschreiten. Offene Abnahmen sind davon unberührt
(Spiegel: `ROADMAP.md` → «Abnahme-Warteschlange»; das frühere `HANDLUNGSPLAN.md` ist
in `ROADMAP.md` eingefaltet und nach `archiv/` verschoben).

## Session 10.7.2026 — V2·C-1 (A25/C-1): Farb-Wörterbuch Referenzschicht — KantenChip `kategorie` (Norm brass / Entscheid slate) + Revisions-↻ warn (W2·5d, reines UI), Worktree `lm-v2-c1`

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F5 · Farb-Wörterbuch Z.66; Bau-Go David 10.7. «go zu allem»).** Erste Einheit des Farbkonzepts: Farbe NUR auf der Referenz-/Verzahnungsschicht, Normtext-Körper farbfrei (§4b-B). **Precheck (V2 §4 Pflicht):** `git worktree list` + `git diff main…` + `git diff HEAD` → **U-VERWEIS (#170) bereits auf main gemergt** ⇒ harte §4-Regel «nichts auf parts.tsx vor U-VERWEIS-Merge» erfüllt, LeitfallZeile-Call-Site sauber in-Scope; kein paralleler Worktree berührt parts.tsx (lm-v2-fn = scripts/normtext+Sidecars). **Änderungen (pathspec):** (1) **KantenChip** neue `kategorie`-Prop `'norm'|'entscheid'` (Default 'norm'); 'norm' emittiert die **unveränderte** brass-Klassenzeile → golden byte-gleich, KontextPanel-Normchips bleiben brass (NICHT wholesale umgefärbt); 'entscheid' = `.lc-chip-entscheid` slate-Tick + slate-Hover-Utilities (kein brass-Hover auf slate-Tick). (2) Call-Sites → 'entscheid': **LeitfallZeile** (parts.tsx), **EntscheidVerzahnung**. (3) **StatusBadge** per-Prädikat `glyphTon`: Revisions-**↻ → text-warn-700** (echter Fassungsvorbehalt), **★ bleibt brass** — löst die Doppelnutzung der Glyph-Zeile :91 auf, ohne das geschlossene Vokabular zu ändern. (4) **slate-Doppelbelegung** («ungeprüft»-Status) aufgelöst: slate = neutraler Referenzton ohne Wertung; Revision wandert nach warn → dokumentiert in **DESIGN-REGLEMENT-NORMTEXT §4b-B** (Farb-Wörterbuch, EIN Entscheid je Farbe). Anatomie/Token/Grösse unverändert ⇒ **CLS 0**. **Kontrast als Gate gemessen** (Playwright, Light+Dark, Desktop 1280 + Mobil 390): slate-500-Tick **4.81** hell / **3.47** dunkel (WCAG 1.4.11 ≥3:1); warn-700-↻ **5.24/9.43**; brass-700-★ **4.91/10.48** — alle über Schwelle; Hover-Swap auf slate-700 verifiziert (light rgb(70,83,90) / dark rgb(169,184,191), kein brass); `--slate-500` in `html.dark` bewusst nicht überschrieben. **Visual-Review:** Norm-Chips brass, Entscheid-Chips slate, ★ brass, kein Layout-Shift (OR Art.18 5 Leitfälle; BGE 152 II 1 13 zitierte Entscheide). **Tore:** `npm run gate:schnell` grün (tsc·vitest·golden:vergleich IDENTISCH); voller `gate` grün ausser **check:plan** (pre-existing rot: QS-TOK-@meta verwaist, auf clean base ebenso — nicht C-1; nicht in CI-Required); lint 0 Errors, build 61 Routen. **Gegenprüfung n/a** (reines UI, kein Rechnen/Extraktion/Norm-Tarif-Risikopfad §3 — nur Chip-Tick-Farbe + Hover, Wortlaut/Daten unberührt). Tests erweitert (`verzahnung.test`: Default byte-identisch, Entscheid-Slate, ↻-warn, ★-brass). C-2/C-3 bleiben deferiert (nach U-VERWEIS/Kopf-PR). Trailer `Roadmap: W2·5d`. PR mit armiertem Auto-Merge.

<!-- KARTEN -->

## Session 10.7.2026 — QS-TOK P1-Rest: check:plan geheilt · T1 STRUKTUR-Rotation mechanisiert · T3 FAHRPLAN-§-Slice-CLI, Worktree `feat/qstok-p1-rest`

**FAHRPLAN-TOKEN-OEKONOMIE.md §3 (T7 ✅ #173, T2 ✅ #172 vorab).** **check:plan-Fix:** `QS-TOK` fehlte in `scripts/plan/inventar.ts` (seit #171) → rötete die gate-Kette für alle Parallel-Agenten; registriert, grün (erster Commit, heilt main). **T1:** `.claude/hooks/struktur-rotieren.py` verschiebt `## Session`-Karten älter ~2 Arbeitstage byte-genau ins Archiv (Anker `<!-- KARTEN -->`; SessionStart nur im sauberen Haupt-Checkout, auto-Commit, sonst No-op — K §3 T1) inkl. **T7-K Teil 2 Re-Akkumulations-Wächter** (weiche SessionStart-Warnung + `--check`-Riegel, NICHT im Required-Gate). Dogfood: 34 Karten ≤6.7. rotiert, STRUKTUR.md 139.4→35.6 KB, Byte-Bilanz belegt (0 Verlust), idempotent; `npm run struktur:rotieren`. **T3:** `npm run fahrplan -- <Datei> <§>` druckt Kopf+§0+Ziel-§ + immer volles ##/###-ToC (9 Unit-Tests, Fixtures beider Stile); GESETZES-UX §10-Slice 60.6 vs. 119.5 KB. **Offen/deklariert:** T16 (CLAUDE.md, separates David-Go, §8.4) liegt bewusst; ROADMAP.md 93.6 KB > T7-DoD ≤~65 KB (Rest-Chronik-Split kollidiert mit Parallel-Schreibern). **Tore:** voller `npm run gate` GRÜN (tsc · vitest · golden · lint · check inkl. geheiltem check:plan). Gegenprüfung n/a (Prüf-/Doku-Infrastruktur). Trailer `Roadmap: QS-TOK`.

## Session 10.7.2026 — Fedlex-Portfolio Paket 2: Botschaften / «Entstehungsgeschichte» (W2·6, Risiko-Pfad Extraktion), Worktree `lm-fedlex-p2`

**Auftrag (Go David 10.7. «go zu allem»; Detailquelle `FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 2`, Reihenfolge 1→2→5→3→4):** Vorzeige-Paket des Portfolios. **POC zuerst (Finding 5):** SPARQL-Reverse-Kette (SR→Taxonomie→oc→proj→event→Botschaft `resource-type/23`) live verifiziert, DSG→2 reproduziert; korpusweite Füllraten VOR dem Bau gemessen. Ergebnis **401 Botschaften des Bundesrates** über die 218 Bund-Volltext-Erlasse — Datum 100 % · Titel DE/FR/IT je 100 % · Curia 99,8 % · 27 Mantelerlasse · 97/218 Erlasse mit ≥1 Botschaft (Rest = Verordnungen ohne Botschaft, ehrlicher Leerzustand §8). **Perf-Härtung:** die Spec-Kette nutzte `FILTER(STRSTARTS(?event,?proj))` (~1,5 s/SR, 60er-Batch 117 s) — durch die direkte Graph-Kante `?proj jolux:draftHasLegislativeTask ?event` ersetzt = **260× schneller** (Korpus 2,6 s), Menge byte-gleich. **Determinismus-Fix (§2):** eine Botschaft kann mehreren proj-Knoten zugeordnet sein (`fga/2016/467`→2) → projEli/Curia deterministisch aus kleinstem proj (2 Läufe byte-identisch). **Join-Felder (Finding 1, P0):** `projEli/ocUris/botschaftDate` persistiert (Paket 5 kann joinen). **Speicher (§15):** Botschaften NICHT im in-Bundle `MATERIAL_REGISTER`, sondern build-zeitlich via `ALLE_MATERIALIEN` in die lazy `register.json`-Projektion gemerged (727 Materialien); `check:paritaet` deckt register.json (byte-Roundtrip), `daten-manifest.json` nachgezogen. **Bridge B1 (Moat-Hebel 1):** «Entstehungsgeschichte»-Gruppe IM bestehenden `KontextPanel` (Norm-Kontext-Bus, alle 3 Instanzen ohne inhalt.tsx-Änderung), kein Silo; locale-Titel, fedlexLokalisiert-Link, Curia→parlament.ch (AffairId live verifiziert), Fetch-Fehler≠leer (Finding 15). **Neu:** `botschaften-generieren(.ts/-run.ts)`, `check-botschaften-netz.ts`, `botschaften.generated.ts`, `botschaften.ts`; **erweitert:** `typen/register` (BehoerdeId `BR`, Doktyp `botschaft`), `material-manifest`/`check-materialien` (kuratiert-äquiv. + Join-Integrität), `KontextPanel.tsx`, 2 Tests. **Tore grün:** tsc · lint (0 F) · vitest 223/3636+14 · build (727 Seiten) · check:materialien · check:botschaften-netz (DSG→2) · check:paritaet · check:datenhaltung. **Gegenprüfung (Risiko-Pfad Extraktion) BESTANDEN** (unabhängiger Opus, frischer Kontext, unabhängige SPARQL-Quer-Queries gegen Fedlex/fedlex/parlament): 0 Fehler; DSG→2, **AVIG=10 korrekt (Bauplan-«11» = Overcount, kein Drop)**, 18-Erlass-Stichprobe deckungsgleich (7× exakte fga-Mengengleichheit), 3 Mantelerlasse real, 5 Null-Treffer-Gesetze = echte Graph-Lücken (kein Drop), Join-Felder 401/401, Titel zeichengenau. Beleg `bibliothek/materialien/botschaften-2026-07-10.md`. *(Vorbestehender `check:plan`-Rot «QS-TOK verwaist» stammt aus #173, wird von #176 geheilt — nicht aus diesem Paket.)* Trailer `Roadmap: W2·6`.

## Session 10.7.2026 — U-VERWEIS (A7+A10+A11+A13): Plural-Linker · Präambel-Verweise · strukturiertes Verweis-Popover · klarere Materialien-Kanten (W2·5d, Risiko-Pfad Linker), Worktree `lm-u-verweis`

**Auftrag (Spec `FAHRPLAN-GESETZES-UX.md` §10, Davids Wortlaut A7/A10/A11/A13):** Verweis-Einheit der Anmerkungs-Welle. **A10 Plural-Linker:** neuer reiner Resolver `artikelnPluralVerweise` (fedlex.ts) — Öffner «Artikeln N»/«die|der Artikel N, M …», Glieder EINZELN verlinkt (Anzeige = Quelltext, §1); bounded über typ-treue Passus-Ketten (Singular-Keyword = genau EIN Wert, Plural + Abkürzungen = Wertliste mit Glied-Kopf-Guard, Wort-Ende-Anker gegen Backtracking «38»→«3»/«42octies»→«42o»); Auflösung fremd (Signal: Klammer-Kürzel > Genitiv-Map > bare Kürzel) / self (nur existierende Token) / §1-unterdrückt (unbekanntes Klammer-Kürzel «Code civil», unauflösbarer Fremdname, unbekanntes bare Kürzel «BGSA», unparsebares Glied). **P2-Beweis: MWSTG Art. 5 verbatim = GENAU 5 Links art_31/35/37/38/45** (Unit+SSR+e2e-DOM+Screenshot); Korpus 2091 Regionen / 5183 Glieder (self 1304 · fremd 443 · unterdrückt 344). **A11 Präambel:** kuratierte, belegte `GENITIV_GESETZ`-Map (26 Einträge, «der Bundesverfassung»→BV; Soft-Hyphen-tolerant), `fremdRoutingFormB` + Plural akzeptieren sie; `ErlassKopfBlock` läuft durch NormText — mit **aBV-Schutz** (§1): Ingress-Verlinkung NUR bei Erlassdatum ≥ 2000 (Ingresse sind historisch; ArG 1964 zitiert die BV von 1874 — SR-101-Links wären plausibel-falsch; Fliesstext ungegated, amtlich nachgeführt). **A7 Popover:** `VerweisKontext.tsx` unter Wortlaut+Provenienz — «Wird zitiert von · Massgebliche Entscheide» + abgetrennt «Legt aus · Amtliche Materialien» (Behörde · Doktyp — Titel · Ziff. · Stand), wiederverwendete Verzahnungs-Grammatik, Top-3+Zähler, DIESELBEN erlass-lokalen Shards (neu `kontextFuerArtikel`/`materialienFuerArtikel` in kontext.ts, geteilte Promise-Caches); ans Popover-ENDE gehängt ⇒ CLS 0 by construction. **A13:** Kontext-Panel-Materialien artikelscharf prominent zuerst, reine Erlass-Ebene hinter `<details>`-Zähler («n Dokumente auf Erlass-Ebene»); e2e-m5 nachgezogen (deklariert, Davids Wortlaut). **`check:gegenpruefung` (Risiko-Pfad Linker): 2 unabhängige Runden (Opus, frischer Kontext, amtliche Fedlex-Filestore-HTMLs + SPARQL).** Runde 1 **WIDERLEGT** → **B1-Fix**: unterbrochene Plural-Wertliste («Artikeln 8 Absätze 1 Buchstabe d **und 5**, 11» — BETMG 8a/FAV 44a/FinfraV 129, 4 amtlich belegte Falsch-Glieder) leckt nicht mehr (Plural-Kontext über Buchstabe-Gruppe gehalten; «und|oder N» ohne Passus-Wort ⇒ Wertliste; −4 Glieder = exakt die Leaks); Runde 2 über den korrigierten Diff **BESTANDEN (voller Re-Lauf, 8 adversariale Angriffe gescheitert, Voll-Korpus-Diff −4 Glieder = exakt die Leaks)**. Notizen: B2 Anaphern-Self (dokumentierte Grenze) · B3 FUSG-Ingress Under-Link (Sidecar-erlassdatum fehlt) · B5 Sidecar-bis/ter-Verlust im ArG-Ingress (Extraktor-Backlog). **Tore:** voller `gate` GRÜN (tsc · vitest 3622 · golden:vergleich IDENTISCH · lint · check-25er) · e2e-Vollsuite 187/188 grün (leser-kopf-a9 einmal Parallel-Last-Flake, standalone grün) · Visual-Review Desktop 1440 + Mobil 390 (MWSTG 5, MWSTG/DSG-Ingress, DBG-65-Kontext, Popover Materialien+Entscheide, 0 Overflow) · Reglement §5a + §10.7-Vermerk + ROADMAP nachgezogen. Golden-Klasse: Engine byte-gleich; Reader-Markup deklariert-ändernd (reine <a>-Hüllen, Wortlaut zeichenidentisch, kein public/normtext-Eingriff). Trailer `Roadmap: W2·5d`.

## Session 10.7.2026 — Intake Gesetzesdarstellung-V2 (Nachzug-Welle A19–A25, §10.8 Bau-Spec + ROADMAP-Einbau), Worktree `docs/gesetzesdarstellung-v2-intake`

**Doku-only** (`Gegenpruefung: n/a — reine Planungsdoku`, kein Risiko-Pfad; Fläche: `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` [neu committet, Spec-Heimat], `FAHRPLAN-GESETZES-UX.md` §10.8, `ROADMAP.md` W2·5d, `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-10.md`, diese Karte). **NUR PLAN — Bau-Go David ausstehend** (anders als A1–A18: dort Go am 5.7. erteilt). Davids Auftrag 10.7. (Ultracode-Recherche, 17 Agenten read-only + Fable-Verifikation): Gesetzesdarstellung «nützlicher/fehlerfreier», Beispiel-Probleme VZG-Fussnoten nicht verklinkt · Kopf nützlicher + Fussnoten-Anwahl · BGE-Ab-/Anwahl + «wie lange zurück»-Filter in Rubrik-Ansicht · Liniengliederung «praktisch nicht» · Präambel-Fussnoten unverlinkt · mehr Farben. Wortlaut wortgetreu persistiert (Muster der 05er-Datei) + 4 Nachtrag-Entscheide (Linien-Default-Umkehr JA · Farbe nur Referenzschicht/Normtext-Körper farbfrei · BGE-Kappung 5→10 · wortgenaue Marker später). **Einordnung als A19–A25** in §10.8 (Muster A1–A18-Tabelle, Spec-Heimat V2 statt Duplikat): **A19** FN-1+FN-2+Drop-Fix `disp_*` (Fussnoten-Extraktor, Wurzel = Alt-Definition-Form ohne `#fnbck` ⇒ ~922 Fussnoten `nr=''`; Risiko-Pfad, sofort/kollisionsfrei) · **A20** FN-3 Präambel-Marker (nach U-VERWEIS) · **A21** FN-4 Absatz-Zuordnung · **A22** K-1/K-2 Kopf (koordinierter Kopf-PR mit U-PDF) · **A23** B-1/B-2 BGE-Steuerung inkl. Kappung 5→10 · **A24** L-1/L-2/L-3 Linien (L-4 entfällt) · **A25** C-1/C-2/C-3 Farben Referenzschicht · **defer** FN-5/M14 wortgenaue Marker (hinter QS-PERF/U-POSITION). **Deklariert:** §3.1/§10.5 «genau 3 Toggles» durch Auftrag 10.7. überstimmt (A23 = 4. Toggle, e2e `toHaveCount(3)`→4); U-LINIEN-Vermerk nachgeführt (#161 «geheilt» vs. Re-Meldung 10.7. — Delta = Auto-Default schaltet Guide bei `strukturTiefe ≥3` ganz aus + ~1.2:1-Kontrast, KEIN U-LINIEN-Regress; A24/L-3 kehrt Default um, L-2 hebt Kontrast). Reihenfolge/Kollisionen aus V2 §4 als Kurzblock (nichts auf `parts.tsx`/`inhalt.tsx` vor U-VERWEIS-Merge; A19+C-1 sofort parallel; Regenerationsläufe FN-1+K-1 bündeln nach Fedlex-P1-a/b-Pin-Refresh, OR/ZGB/StGB/BV byte-gleich als Nicht-Regressions-Beweis). **Tabu respektiert:** kein `src/`/`scripts/`/`public/`/`e2e/`/`DESIGN-REGLEMENT-NORMTEXT.md` (in-flight `lm-u-verweis`); Edits strikt additiv. **Tore:** `gate:schnell` grün (Doku-only). Trailer `Roadmap: W2·5d`. PR mit armiertem Auto-Merge.

## Session 10.7.2026 — W2·6-B B3 «Sticky-Kopf überdeckt Body» (Entscheid-Leser), Worktree `fix/w26b-b3-sticky-kopf`

**Befund: bereits behoben — 0 Code-Diff.** Empirische Reproduktion an BGE 152 I 65 (Playwright: Desktop 1280 + Mobil 390, Light+Dark, 3 Scroll-Stände, alle 3 Sprung-Chips, Auszug+Voll-Tab) zeigt den `EntscheidLeser.tsx`-Sticky-Block heute korrekt: opaker `bg-paper` (light `#FAF8F2`/dark `#16150F`), `z-[15]` (< Topbar `z-20`, > Breadcrumb `z-10`), `scroll-margin-top: var(--rsp-stick)` = 12.75rem — **Grid-Scan 0 Overpaint**, Sprung-Ziele landen sichtbar unter dem 185/193px-Kopf. Alle drei Roadmap-Kandidaten (Deckung/z-index/scroll-margin) schon geschlossen durch den U-KOPF/Split-View-Refactor `60988318`: Konsolidierung zu EINEM sticky-Element + `top`-Offset `top-16`→`calc(4rem + 2.25rem)` (Block sitzt jetzt UNTER dem InhaltsKopf statt ihn zu überdecken). Beweis-Gegenprobe: die alte `top-16`-Fassung (Laufzeit-Injektion) reproduziert den Defekt (Breadcrumb verschwindet hinter den Tabs). ROADMAP-B3 ✅ markiert. Golden byte-gleich (Doku-only). Trailer `Roadmap: W2·6-B`.

## Ältere Session-Karten und Chroniken — rotiert ins Archiv

Verbatim verschoben nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(FAHRPLAN-TOKEN-DISZIPLIN.md T-4): **13.6.2026** alle sieben 11.6.-Karten
(früher Abend · später Nachmittag · abends · nachmittags · vormittags ·
über Nacht · Tag «Schlichtung fertig + Vollerhebungen») · **11.6.2026**
Sessions 10.6. abends (STRUKTUR-UMBAU S-1–S-6) und nachmittags
(Fristen-Einheit FE-1–FE-6) · 7.6. abends (Betreibungsamt-Finder) und
nachts (Plan 9b Volldokumente) · 6.6. abends und nachmittags ·
Verschlankung 5.6.2026 · Session-Abschluss 6.6.2026 · **10.7.2026** alle
139 Session-Karten datiert 12.6.2026–3.7.2026 (Rotations-Auftrag «Karten
≤3.7.2026 ins Archiv»; neuester Block liegt jetzt zuoberst im Archiv,
Reihenfolge unverändert). · **10.7.2026 (QS-TOK/T1, mechanisiert):** 34 Karten
≤6.7.2026 byte-genau ins Archiv rotiert (nur die drei 10.7.-Karten bleiben);
Byte-Bilanz bestätigt (kein Inhaltsverlust), Rotation läuft künftig automatisch.

## Verifikationsstand (eine Zeile)

Stand 11.6.2026: Build + 38 Prerender-Routen ✓ · Lint 0/0 ✓ · Suite 1404
grün + 2 skipped (78 Dateien) ✓ · tsc STRICT · Golden 104/104 byte-gleich ✓
· Logik-Sweep 14'448 Kombinationen ✓ — Workflow: **`npm run gate`** (bzw.
`gate:schnell` pro Iteration; leise bei Grün, volle Ausgabe nur für rote
Tore, CLAUDE.md §6 Ziff. 1/5); `npm run check` für die Offline-Checks,
`npm run check:netz` für Fedlex; vor Deploys unabhängige Review-Agents
(Skill `deploy-check`).

**Informationsbibliothek: `bibliothek/INDEX.md`** — Quellen-Register
(verifizierte Fedlex-Stände inkl. ZPO-Revision 2025), Parameter-
Verfallsregister, Recherche-Dossiers (Schlichtungsbehörden 26 Kantone),
ZPO-Normtexte für die Zuständigkeitsengine.

**Zuständigkeitsengine (`src/lib/zustaendigkeit.ts`, Phase 1 — entwurf):**
Bundesrechtsschicht nach ZUSTAENDIGKEIT-AUFTRAG.md (Spezifikation im
Repo-Root): Verfahrensart (Art. 243 inkl. Abs.-3-Vorbehalt), Schlichtung
(197–200), Entscheidkompetenz (210/212, Revision 2025: 10'000),
Gerichtsstände (10/32–35), HG-/Direktklage-Weichen (6/8). 30 Tests mit
beidseitigen Schwellen-Grenzwerten. **Phase 2 erledigt:** Kantonsschicht
`data/zustaendigkeitKantone.ts` (BS-Pilot, Stellen-Auflösung über
behoerden.ts, GOG-Schwelle bewusst null/offen) + SG_SCHWELLEN beziehen
die Zuständigkeits-Schwellen aus ZPO_SCHWELLEN (SSoT §5, golden-bewiesen
byte-gleich). **Phase 3 erledigt:** /rechner/zustaendigkeit (Form §3-rein,
Eckdaten-Tiles, Stelle mit Adresse/Quelle, Weichen offen, PDF-Bericht);
Katalogkarte `zustaendigkeit` (pro/entwurf) ersetzt die drei geplanten
Karten gerichtsstand/verfahrensart/schlichtung. **Phase 4 erledigt:**
Prefill-CTA → Schlichtungsgesuch BS (sgPrefillKodieren/Lesen; nur bei
ordentlicher Behörde + erfasster Stelle; Golden byte-gleich) — MVP
end-to-end. OFFEN: weitere Kantone (nach Dossier-Abnahme), weitere
Ziel-Vorlagen. Davids fachliche Abnahme steht aus.

## Informationsarchitektur (Stand EINE Hauptseite 7.6.2026)

**EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE.md, Auftrag David 7.6.2026 —
hebt die Free/Pro-Zweiteilung vom 5.6. wieder auf):** `/` trägt den
VOLLSTÄNDIGEN Katalog (Gebiets-Kacheln, Suche `?q=`, Panel `?gebiet=`,
Anliegen-Zeile, «Zuletzt verwendet») hinter einem kompakten Hero
(Free-Nutzen-Headline in h2-Höhe; Kennzahlen OHNE Preisaussage bis
Monetarisierungs-Entscheid G1). Davor eine kuratierte Chip-Zeile
**«Häufig gebraucht»** (`lib/haeufigGebraucht.ts`, Nachfolger der
Free-Kachelwand-Kuratierung; nur Verfügbare erscheinen). `tier`-Feld,
`PAYWALL_ACTIVE`, `lib/proSession.ts` (Pseudo-Login) und der
Header-Pro-Button sind ENTFERNT (D-3; Stand vor dem Rückbau: Git-Historie
bis `2e80daf`). `/pro`, `/fachpersonen`, `/rechner` → DAUERHAFTE Redirects
auf `/` mit erhaltenem Suchstring (Permalink-/.ics-Link-Erbe). Mobil erbt
die Hauptseite den vorbestehenden 390px-Overflow des Katalogs
(FAHRPLAN-DESIGN Etappe 4, offener Strang).

**Katalog-Gliederung: primär nach RECHTSGEBIET** (17 kanonische Sektionen
in fester Auftrags-Reihenfolge, `RECHTSGEBIET_SEKTIONEN`), darunter je die
Untergruppen **Rechner** und **Vorlagen** (nur nicht-leere). Output-Typ
(Rechner) und Dokument-Typ (Vorlagen) sind FILTER; Rechtsbereich-Filter und
Suche bleiben. **Der frühere Modus-Umschalter (Primärweiche Rechner |
Vorlagen) ist damit abgelöst und entfernt**; `?modus=`-Links bleiben
harmlos; die Alt-Gliederungen ('art'/'bereich') sind aus dem Code
entfernt. Header = Zwei-Zonen (Logo links, Aktionscluster rechts:
Sprache · Methodik — Pro-Button entfernt 7.6.2026, Methodik seither auch
mobil), Mitte leer; Utility-Bar nur Pflichthinweis rechts, mobil
ausgeblendet.

**Design-Tokens (Feinschliff 5.6.2026, single source tailwind.config +
index.css):** Typo-Skala GESCHLOSSEN — micro 11 · overline 11 · xs 12 ·
body-s 14 · base 16 · body-l 18 · h3 20 · h2 25.6 (auch Ergebnis-Hauptwerte
mit `leading-none`) · h1 32 · display 36/44 (Heroes). **`text-sm`/`text-lg`
sind verboten** (Tailwind-lh weicht ab; body-s/body-l verwenden). Radien
komplett tokenisiert (--radius-sm…2xl). Status-Hintergründe nach EINEM
Rezept (`color-mix --status-tint 10%` auf Papier; AA geprüft). Motion:
--dur-fast/base/slow + --ease, Default-Easing global. Komponenten-Anatomie:
`lc-tile` (Ergebnis-Kachel) · `lc-notice[-warn|-danger]` eigenständig (kein
Inline-Padding!) · `lc-btn-sm` (36px) · disabled steckt in den
lc-btn-Klassen (keine disabled:-Utilities) · ein Aktions-Akzent
(lc-btn-primary; lc-btn-brass entfernt).

**Layout:** Inhaltsspalte einheitlich `max-w-content` = **70rem (~1120px)**
(Token in tailwind.config); 8-px-Skala `--space-1…24`, `--control-h` 44px,
`--pill-h` 36px. Hero text-geführt einspaltig (keine Deko-Grafik, bewusst
nicht animiert), Untertext ≤ 58ch; Determinismus-Claim genau EINMAL (Hero).
Kartenraster `repeat(auto-fill, minmax(340px, 1fr))`; Titel ohne Silben-
trennung (`text-balance`); Pills im Inhaltsblock, nur CTA per `mt-auto`
unten. Keine Ziffern in Sektionsköpfen/Sidebar (konsistent nirgends).

**Pro-Katalog = KACHEL-KATALOG (Umbau 6.6.2026 nachts, Live-Auftrag David;
Roadmap + Entscheide: FAHRPLAN-KATALOG-UI.md):** Die 17 Rechtsgebiete sind
kompakte Kacheln unter den 5 Obergruppen (Name · Zähler «X verfügbar · Y in
Vorbereitung» · verfügbare Werkzeug-Titel, geklemmt). Klick öffnet das
Gebiet als Panel in voller Breite unter der Kachel-Zeile (`?gebiet=` in der
URL, teilbar; nur ein Panel zugleich); die Disclosure-Sektionen samt
Scrollspy sind entfernt. Darüber: Anliegen-Zeile (lib/anliegen.ts, 8
situative Einstiege — ENTWURF, Abnahme David offen) + «Zuletzt verwendet».

**Suche:** EIN kompaktes Suchfeld in der Katalog-Seitenleiste (Desktop)
bzw. im Filter-Drawer (mobil) — filtert den Katalog live. Die frühere
⌘K-Befehlspalette ist entfernt (Entscheid David 5.6.2026). Seit 6.6.2026:
Suche/Filter aktiv → flache, gerankte Trefferliste statt Kacheln (Rang:
Titel > Keyword exakt > Keyword > Norm > Gebiet; lib/katalogSuche.ts —
dieselbe Logik testet die Suchbegriff-Goldliste katalogSuche.test.ts,
48 Paare Laie/Fach/Norm); `?q=` in der URL; «/» fokussiert das Feld;
Keywords kompakt verglichen wie Normen («Art.311» = «311 ZPO»).
Metadaten-Inventur: `npx vite-node scripts/katalog-inventur.ts`.

**Sprachen:** Umschalter sichtbar (Header); EN/FR/IT «in Bearbeitung» mit
DE-Fallback + persistentem Banner; KEINE maschinelle Übersetzung (fachkundige
Person später). `<html lang>` folgt der Locale; Fedlex-Links ebenfalls
(fr/it amtlich — Anker stichprobenverifiziert sprachunabhängig; en → de).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (oranger Top-Rand `--warn-500` + Outline-Badge «Entwurf»
(`.lc-badge-entwurf`), Tooltip «erstellt, fachlich noch nicht geprüft»;
dazu EINE Status-Legende über der Startseiten-Kachelwand statt lauter
Einzel-Badges — Design-Review 6.6.2026, Freigabe David) = gebaut, ungeprüft ·
`geprüft` (Goldrand, KEIN Wort-Badge) = fachlich geprüft — **aktuell
nirgends vergeben** · `geplant` (gedämpft, AA-konform ohne Opacity) =
«In Vorbereitung», ohne Norm-Pills/Artikel-/Tagesangaben.
**Alle NormRefs tragen `verified: false`**, bis David sie fachkundig gegen
Fedlex prüft (Anker selbst sind build-verifiziert, Format `art_335_c`).
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.
Status-Filter heisst «Nur verfügbare» (= nicht geplant).

## Katalog (Quelle: src/lib/startseiteConfig.ts — Single Source of Truth)

**111 Einträge: 64 Rechner + 47 Vorlagen** (Katalog-Ausbau 5.6.2026: +59
geplante Karten gemäss KATALOG-ROADMAP.md; Soll-Inventar dort gepflegt).
Felder: modus, art, rechtsgebiet (kanonisch, 17 Werte),
**rechtsbereich** (privat/oeffentlich/straf/uebergreifend), status, norms
(NormRef mit verified), href, schemaId/formvorschrift/output (Vorlagen),
szenarien (konsolidierte Rechner), related (modusübergreifend), keywords
(**tier entfernt 7.6.2026**, FAHRPLAN-EINE-HAUPTSEITE). VorlageArt um
**korrespondenz** («Schreiben & Erklärungen») erweitert. Neue geplante
Karten: norms [], kein href, neutrale Beschreibungen (Normentreue);
Roadmap-«[Gerüst]» als «Strukturiertes Gerüst …» im Text.

**Konsolidierung (43→34):** 9 Einzelkarten absorbiert — Klagebewilligung +
Fristwiederherstellung → ZPO-Fristen; Rechtsöffnung/Aberkennung/Kollokation
+ Arrest → SchKG-Phasen; missbräuchl. Kündigung + Massenentlassung →
«Arbeitsrecht — Fristen»; Miet-Anfechtung → «Mietrecht — Fristen»;
Verzugszins-vertieft → Verzugszins; SV-Leistungsverwirkung → ATSG-Karte.
`RechnerCard.szenarien` zeigt abgedeckte/geplante Szenarien auf der Karte.

**Spät-Session 7.6.2026 (Kurzspiegel; Details HANDLUNGSPLAN.md A.0):**
Daueranweisungen §0 Mehrwert-Test + §0a Perfektion-vor-Neubau · Roadmap
−7 geplante Karten (verifiziert) · AG-Programm fertig inkl. Notariats-
tarif-Korrekturen (ZH-Rahmen 123! SG floor!) · Startseite: leere Gebiete
als «In Vorbereitung»-Zeile, Rubrik einzeilig · Vereinheitlichung Runde 1
(Tagerechner-Hash/geteilter Teilen-Button, 7 Titel-Paare + Invariante) ·
Dossiers neu: gmbh-deltas-g0, gmbh-qualifizierte-gruendung,
ag-kapitalkategorien (Bau gesperrt), BGerR-Verifikation (35/35a-Split).

**Konsolidierung Runde 2 (7.6.2026, FAHRPLAN-KATALOG-KONSOLIDIERUNG,
Auftrag David «simplifizieren — ein Einstieg pro Rechtsfrage»):** Katalog
gesamt 115→112, verfügbar 35→32 gebaut, davon **28 sichtbar**. (a) GELÖSCHT
die 3 reinen Hash-Deep-Link-Karten: untermietvertrag → Karte «Mietvertrag
(Wohnen · Geschäft · Untermiete)»; schkg-/straf-zustaendigkeit → EINE Karte
«Zuständigkeit (Zivilprozess · Betreibung · Strafverfahren)» mit szenarien
(kehrt den Katalog-Split vom 6.6. um — Davids Delegation 7.6.). (b) NEU
`imKatalog:false` (BaseItem) + `KATALOG_KARTEN`: die 4 Kündigungs-Masken
(AN/AG/Mieter/Vermieter-Checkliste) behalten ihre Karten als SSoT der
Masken-Seiten (`karte(id)`!), erscheinen aber nicht mehr im Register/Suche —
ihre Auffindbarkeit tragen die Themen-Einstiege «Kündigung & Fristen im
Arbeitsverhältnis» (ex «Arbeitsrecht – Fristen») und «… im Mietverhältnis»
(ex «Mietrecht – Fristen»), deren Rechner-Seiten die Masken direkt verlinken.
(c) Kachel-Overline zeigt jetzt `Gebiet · Rechner/Vorlage` (Funktions-
Kennzeichen, EIN Template-Literal wegen SSR-Marker). Ausdrücklich NICHT
gemergt: GmbH-/AG-Gründung (zwei Werkzeuge, echte Rechtsform-Entscheidung),
Tagerechner↔ZPO/SchKG (gewollter Laien-/Fach-Doppeleinstieg), Rechner↔
Vorlage-Paare (§5: eine Engine, zwei Ausgabeformen). Goldliste deklariert
nachgezogen (misst jetzt KATALOG_KARTEN); Davids Abnahme der neuen
Titel-Wortlaute offen.

**Gliederung (seit Katalog-Ausbau):** beide Seiten = Rechtsgebiet-Sektionen
(GebietSektion, feste §4-Reihenfolge OHNE Relevanz-Sortierung) mit
Untergruppen Rechner/Vorlagen; innerhalb der Gruppen verfügbare vor
geplanten (sortiereKarten). Filter: Status («Nur verfügbare») · auf /pro
zusätzlich Rechtsbereich · Output-Typ (Rechner) · Dokument-Typ (Vorlagen);
Suche in der Seitenleiste. Grenzfall Vorlage «Einsprache»: straf
(Strafbefehl häufiger), Verwaltungsbefehl via Keywords.

## Rechner (Engines in src/lib/, alle rein/deterministisch, kein LLM)

Gebaut (entwurf): zpo-fristen, schkg-fristen, kuendigung-sperrfristen
(inkl. **Sperrtage-Zähler**: Kontingent 30/90/180 je DJ, beansprucht nach
Art.-77-Zählung, verbleibend, Rückfall-Zeilen — Komponente
SperrtageZaehler, auch in der kombinierten Ansicht), mietrecht,
verjaehrung (Zwei-Fristen, Stillstand-Union), gewaehrleistung (Zwei-Regime
1.1.2026), verzugszins (Segmente, Art. 85-Anrechnung), lohnfortzahlung
(Skalen; Engine-Guard AUF 1–100 %), erbteilung, **allgemeineFrist**
(Free-Tagerechner, Auftrag 5.6.2026: dünne Engine auf fristenEngine/
zpoFeiertage — dies a quo IDENTISCH zu zpoFristen, Systemtest AF-14;
getrennte Wochenend-/Feiertags-Toggles, Tage-zwischen-Hilfsmittel;
SR 173.110.3 als Gesetzes-Seiten-Pill, ELI SPARQL-verifiziert).
Feiertage algorithmisch (Computus) — keine Jahres-Klippe.

## Vorlagen-Plattform (src/lib/vorlagen/)

Generische Engine: `assemble(schema, antworten)` rein/deterministisch
(Bedingungs-Algebra eq/in/nichtLeer/and/or/not; wiederholeUeber; nummeriert
mit Leerlisten-Guard; Interpolation; Bausteinprotokoll). Renderer aus EINER
Quelle: vorlagenPdf (jsPDF, Banner-API, WinAnsi-Sicherung) + vorlagenDocx
(docx-Lib, lazy geladen, Word-Formatvorlagen; XLSX architektonisch
vorbereitet, nirgends ausgeliefert). Geteilte Wizard-UI:
components/vorlagen/ui.tsx (Field, NormLink locale-bewusst, Stepper).

**8 gebaute Vorlagen (alle entwurf):**
1. **Testament** (/vorlagen/testament) — eigenhändig: Abschreib-Mustertext,
   Pflichtteils-Panel, Gates 467/505/481/472. KEIN DOCX (Eigenhändigkeit).
2. **Patientenverfügung** (/vorlagen/patientenverfuegung) — Schriftform;
   Konsistenz-Engine R1/R2, harter Sterbehilfe-Block R6 (Art. 114/115 StGB);
   PDF + DOCX (Pilot Mehrformat).
3. **Vorsorgeauftrag** (/vorlagen/vorsorgeauftrag) — formMode-Weiche
   eigenhändig (Mustertext) / beurkundet (Entwurf, DOCX nur hier);
   Eligibility-Gate Art. 13; Grundstück-Sondervollmacht erzwungen.
4. **Schlichtungsgesuch Basel-Stadt** (/vorlagen/schlichtungsgesuch-bs,
   tier experte) — Routing mit Stopp-Karten (Miete/GlG → eigene Stellen,
   Art. 198), Mängelliste mit Schritt-Sprung, SG_SCHWELLEN hart codiert,
   Behörden-Stammdaten BS, Form-Gate (Exemplare = 1+Beklagte), PDF+DOCX,
   BEWUSST ohne localStorage (Anweisung); 12 Akzeptanztests.
5. **Einzelarbeitsvertrag** (/vorlagen/arbeitsvertrag) — ERSTE Vorlage auf
   dem generischen Wizard-Rahmen. Grundlage: normverifiziertes Gutachten
   Art. 319 ff. OR (5.6.2026); Validierungskern = Matrix absolut/relativ
   zwingend (Art. 361/362) + Schriftform-Klauseln (durch beidseitige
   Unterschrift erfüllt) + Disclosure (BGE 145 III 365, 149 III 202,
   129 III 276). Harte Gates: Probezeit ≤ 3 Mte, Frist ≥ 1 Mt (bei
   Befristung neutralisiert), Ferien ≥ 4/5 Wochen, Ferienabgeltung bei
   Vollzeit gesperrt, KV nur mit Ort/Zeit/Gegenstand + Einblicks-
   Bestätigung. Kantonale Mindestlöhne als DATIERTE Parameter
   (AV_MINDESTLOEHNE, jährlich verifikationspflichtig!). ArG in fedlex.ts
   ergänzt (Anker art_9/12/13/46 empirisch verifiziert). PDF+DOCX;
   16 Akzeptanztests. Deklarierte Gutachten-Abweichung: einheitliche
   Frist < Staffel zulässig per Art. 335c Abs. 2 (Hinweis statt Verbot).
6. **Mietvertrag Wohn-/Geschäftsräume** (/vorlagen/mietvertrag, Karte
   mietvertrag-wohnen) — Gutachten Art. 253 ff. OR/VMWG (5.6.2026).
   Zentrale Weiche objektTyp + Kanton. Gates: Kaution ≤ 3 Monatszinse
   (nur Wohnraum), Fristen 3/6 Mte, Index ≥ 5 J/LIK + Staffel ≥ 3 J
   (beide am Fedlex-WORTLAUT verifiziert), NK-Einzelausweis, MWST nur
   Geschäftsraum. DATIERTE Parameter: Referenzzins 1.25 % (1.6.2026,
   quartalsweise!), MWST 8.1 %, Formularpflicht-Kantone (BWO 4.2.2026,
   BE-Diskrepanz offengelegt, dynamisch per 1.11.). PDF+DOCX; 14 Tests.
7. **Vollmacht** (/vorlagen/vollmacht, Karte `vollmacht`) — EINE Maske mit
   Typ-Schalter Anwalts-/General-/Spezialvollmacht (Entscheid David
   5.6.2026 statt zweier Vorlagen; Grundlagen-Bericht «Vollmachten»,
   Downloads). Formfrei (Art. 11 OR) → ausgabeArt `fertig`, PDF+DOCX.
   Gemeinsamer OR-AT-Kern (Parteien natürlich/juristisch, mehrere
   Bevollmächtigte einzeln/gemeinsam, Substitution, Widerruf Art. 34,
   Befristung, transmortale Klausel Art. 35); besondere Ermächtigungen
   als Katalog wortlautnah zu Art. 396 Abs. 3 OR. Deterministische
   Form-Gates: Bürgschaft = SPERRE (Art. 493 Abs. 6 OR), Grundstück =
   Warnung (Art. 216 OR / Art. 86 GBV / Formfrage offen BGE 112 II 330),
   Bank = bankeigene Formulare, Prozess-Bereich = Art. 68 ZPO-Warnung,
   Vorsorgefall = Weiche zu Vorsorgeauftrag/PV (Gesundheits-Bereich
   bewusst NICHT wählbar). Ersetzt die geplanten Karten generalvollmacht/
   bankvollmacht. StPO/VwVG in fedlex.ts ergänzt (Anker art_129/art_11
   empirisch verifiziert). 20 Akzeptanztests.
8. **Klage im vereinfachten Verfahren – BS** (/vorlagen/klage-vereinfacht,
   Karte `klage-vereinfacht`) — zweite BS-Eingabe der SG-Familie
   (normverifizierter Auftrag 5.6.2026). Deterministisches BS-Routing:
   Arbeit ≤30k → Arbeitsgericht (§§ 73 f. GOG), GlG/Mitwirkung →
   Dreiergericht, Gewaltschutz/DSG/Miete-Kern → Einzelgericht (§ 71 GOG);
   ehrliche Stopps (>30k ohne Abs.-2-Materie → ordentlich; Arbeit >30k →
   § 73 Abs. 2-Hinweis; KVG-Zusatz → Sozialversicherungsgericht).
   Schwellen aus ZPO_SCHWELLEN (SSoT); Klagefrist Art. 209 Abs. 3/4 über
   die zpoFristen-Engine ('klagefrist_klagebewilligung', Gerichtsferien).
   ABWEICHUNG vom Auftrag offengelegt: Art. 114 ZPO kennt KEINE Miete-
   Position (lit. d = Mitwirkungsgesetz) → Miete im Entscheidverfahren
   nicht kostenfrei. Begründung = freiwilliger strukturierter Platzhalter
   (Behauptungs-Liste + Beweismittel) mit Verzichts-Baustein (Art. 245
   Abs. 1); Begehren beziffert/unbeziffert (Art. 84/85), Rechtsöffnungs-
   Antrag, Beilagen-Automatik (KB/Ausnahme/Vollmacht/Urkunden), Doppel-
   Hinweis Art. 131. SG-Parteitypen wiederverwendet (parteiZeilen & Co.
   exportiert). PDF+DOCX, ohne localStorage (wie SG). 20 Akzeptanztests.

Wizards 1–3 und 7 mit localStorage (`lexmetrik.vorlage.*.v1`, Hydration
array-gesichert); Vorschau als Funktionsaufruf (kein Remount). Eingaben
(4, 8) bewusst OHNE localStorage.

## PDF-Rechenbericht (src/lib/pdf/)

**Abend-Paket (5.6.2026):** Formulierungskonventionen (lib/konventionen.ts
SSoT + Linter-Test über echte Textausgabe; — → – plattformweit, «5 %»,
SG-Floskeln, Golden-Diff programmatisch als rein konventionell bewiesen).
Free-KACHELWAND (flach, FREE_REIHENFOLGE, Hero neu «Schweizer Recht,
berechenbar.»; Katalog.tsx pro-only). Versimplung: ui/Tabs + ui/
SelectionGrid (14+3 Stellen entdoppelt, SSR-byte-identisch), chf()
kanonisch, tote Katalog-Props raus (netto −175 Z.). Pro: Sektionen
starten EINGEKLAPPT, Zivilprozess & Vollstreckung zuerst. KOMBINIERTER
FRISTENRECHNER free (/rechner/tagerechner: Verfahrens-Tabs Allgemein/
ZPO/SchKG → bestehende Forms; §4 unangetastet; Trennungs-Querschnitt-
Test). Mobile-Check: Tabs-Overflow gefixt (overflow-x-auto), Grids
mobil-Basis. PROJEKTBESCHRIEB.md neu geschrieben.

**Pro-Katalog-Umbau (5.6.2026, Auftrag):** Tabs Verfügbar(17)/Gesamt(111)
(?ansicht=, Default Verfügbar), juristische Obergruppen als Super-Trenner
(lib/rechtsbereichGruppen.ts, 5er-Modell, 4er-Fallback per GRUPPEN_MODELL),
gruppierte Scrollspy-Seitenleiste (Rechtsbereich-Filter+Direkteinstieg
entfernt), Schnellzugriff ★Favoriten+Zuletzt (lib/schnellzugriff.ts,
localStorage, Stern nie auf geplant), istVerfuegbar()-Prädikat, Hero «17
sofort verfügbar». Free unverändert. BetragsFeld: Tausender-Apostroph in
22 CHF-Feldern. Visual-Checks (2 Agenten) GRÜN; P1–P3 gefixt.

**Teuerungsrechner (5.6.2026, /rechner/teuerung, Free):** LIK-Indexierung
mit amtlicher BFS-Reihe (src/data/likReihe.ts, generiert via scripts/
lik-reihe-generieren.py aus cc-d-05.02.08; 10 Originalbasen 1966–Mai 2026;
OPEN-BY). Basis-AUTO wie BFS-Rechner; Modi Indexmiete (Art. 17 VMWG
wortlaut-verifiziert, Senkungspflicht)/Unterhalt (286/128 ZGB)/generisch.
VMWG neu in fedlex.ts. MONATLICHE PFLEGE: Reihe nach BFS-Publikation
regenerieren. Eingaben: Behörden-Registry +Miete/Diskriminierung BS
(Staatskalender 5.6.2026); SG-Forum-Häkchen entfernt (Kantonswahl).

**Logik-Nachrechnung + Versimplung (5.6.2026):** 4 Cluster unabhängig vom
Code aus dem Gesetz nachgerechnet (100+ Handfälle, 6912er-Erbrecht-Gitter,
576er-ZPO≡Allgemein-Gitter): KEINE Berechnungsfehler. Offen für Davids
Entscheid: Sperrtage-ANZEIGE-Konvention (beansprucht Art.-77 vs.
Kalendertage; Endtermine identisch). Versimplung golden-bewiesen
(scripts/golden-outputs.ts, 53 Fälle byte-gleich): naechsterWerktag/
dauerTageInklusiv kanonisch, fmt/iso ×7 dedupliziert, Vorlagen-Helfer
zentral, Rückwärts-Spiegelung direkt.

**Tagerechner-P1 (5.6.2026, Auftrag «Verbesserung Fristenrechner»):**
Rückwärtsmodus (spätester Handlungstag; Verschiebung defensiv «keine»,
Vorverlegung nur mit Ungeklärt-Vorbehalt), Zustell-Helfer (rein informativ:
7-Tage-Fiktion, A-Post Plus Art. 142 Abs. 1bis ZPO), .ics-Export (RFC-5545
inkl. Folding, deterministisch) + Permalink (validiert), Validierung/A11y;
BGE 150 III 367 nachgeführt. AV/MV-Schemas: v1.1.0 (Vertiefungs-Gutachten).
Golden-Output-Protokoll: scripts/golden-outputs.ts (53 Fälle, vergleich-Modus).

**Formatvorlagen-SSoT (5.6.2026, `formatvorlagen.ts` — drei Grundlagen-
Berichte):** Typografie je Format + AUSGABE_REGELN je AusgabeArt
(abschrift = DOCX hart gesperrt · entwurf = PDF-Wasserzeichen «ENTWURF»
[VA beurkundet] · fertig). Eingaben mit Korrekturrand 3.5 cm rechts,
Anrede/Schlussformel/«im Doppel» (Rollen anrede/schlussformel);
Verträge mit Ausfertigungs-Vermerk + QES-Hinweis (Art. 14 Abs. 2bis OR).
Pro-SITZUNG (lib/proSession.ts): Pro betreten = eingeloggt (localStorage,
Reload-fest, «/»→/pro), Header «Ausloggen»; Andockpunkt Zahlungs-Gate (System offen).
Einzeilen-Heros Free+Pro; Gebiets-Titel in Sans.

**Formatvorlagen der Vorlagen-Renderer (5.6.2026, Referenz-Layouts):**
Schemas deklarieren `format` (verfuegung·vertrag·eingabe) + Absatz-`rolle`n
(absender/adressat/datumzeile/betreff/rubrum/parteien/unterschrift); PDF,
DOCX UND Live-Vorschau interpretieren beide aus EINER Quelle. Arial/
Helvetica 11, Haarlinien unter Titel/Betreff, hängende Einzüge (1./–),
gezeichnete Unterschriftslinien, Fusszeile je Seite, Disclaimer 8pt am
Ende; Eingaben OHNE Dokumenttitel (Betreff trägt ihn), langes Datum.
Engine-Konvention: Platzhalter auf …Satz/…Zeile verschwinden leer
ersatzlos (sonst «________»-Vorschau-Strich). Visuell verifiziert via
`.scratch/pdf-beispiele.ts` + qlmanage-Thumbnails.

pdfModel (reines Block-Modell: kopf/hero/tabelle/schritt/hinweisbox/norm)
+ pdfRender mit **eingebetteten Markenschriften** (Fraunces/Geist/GeistMono
als Base64-TTF, ~0.4 MB NUR im lazy Klick-Chunk). Hero-Hauptkennzahl,
Eingaben-Tabelle (Mono rechtsbündig), unzerreissbare Schritte mit
klickbaren Norm-Pills (Vormessung inkl. Pill-Umbrüchen), sichtbare URLs,
Status «Berechnung vollständig». Verzugszins + Kündigung liefern hero.
Visuelle Prüfung: qlmanage-Thumbnails + Swift-PDFKit-Split.

## Oberste Ebene: vier Output-Typen

| Sektion (`art`) | Inhalt |
|---|---|
| Fristen (`frist`) | Prozessuale und materielle Fristen |
| Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

## Grossausbau 5./6.6.2026 — Zuständigkeits-Plattform (Kurzkarte)

**Drei Rechtswege live** im Zuständigkeitsrechner (je EIGENE Engine, §4):
- **Zivil** (`lib/zustaendigkeit.ts`): 9 Streitsachen · Fahrplan + kantonale
  Kosten-Rahmen (alle 26, `data/zustaendigkeitKosten.ts`) · Art.-113-Kosten-
  freiheit · konkrete Schlichtungsstelle aller 26 Kantone
  (`data/schlichtungsstellen.ts`) mit **PLZ→Gemeinde→Amt** gemeindescharf in
  ZH/AG/SG/TG/FR/ZG/AI (`data/schlichtung/*`, amtliches swisstopo/BFS-Register,
  Generator `scripts/plz-generieren.ts`) · **Handelsgerichte** ZH/BE/AG/SG ·
  **Rechtsmittel-Modus**: Berufung/Beschwerde-Weiche (308/319 ZPO) + obere
  Instanz aller 26 Kantone (`data/obereInstanzen.ts`) + BGer-Schwellen
  (Art. 74 BGG, BGG-Cache verifiziert).
- **SchKG** (`lib/schkgZustaendigkeit.ts`): Betreibungsort-Kaskade 46–55,
  11 Anliegen (Rechtsöffnung/Aberkennung/Widerspruch/Kollokation/Arrest/
  Konkurs/Aufsichtsbeschwerde) mit Verwirkungsfristen-Badges; Gebühr
  Zahlungsbefehl nach Art. 16 GebV SchKG (Stand 1.1.2022, 2026-Vorbehalt
  im Verfallsregister); BJ-Betreibungsämter-Verzeichnis verlinkt.
- **Straf** (`lib/strafZustaendigkeit.ts`): StPO-Decision-Tree (Spezialforen
  35–37 → Tatort 31 → Kaskade 32; Weichen 33/34/38/40/41/42); Anzeige-
  Fahrplan (301; Strafantrag 3 Mt., Art. 31 StGB); zentrale StA aller
  26 Kantone + Bundesanwaltschaft (`data/staatsanwaltschaften.ts`).

**Vorlage Schlichtungsgesuch kantonsübergreifend:** Behörden-Auflösung für
alle 26 Kantone (`components/vorlagen/SgBehoerdenWahl.tsx`; Adressat-Kette
Hand > BS-Registry > Recherche > Platzhalter). **UX-Programm** (9 Etappen-
Commits) + Design-Konsistenz-Sweep abgeschlossen. **Bibliothek:** 21 Dossiers
(4 Regelwerke ZPO/SchKG/StPO/Erbrecht; Behörden Zivil/Straf/Erbgang; Kosten)
— Status je Dossier in bibliothek/INDEX.md (SSoT-Karte dort).

## Offene Punkte (nächste Session)

1. **Fachliche Abnahme durch David** (er ist die «fachkundige Person»):
   **Erste Sichtung aller 4 Vorlagen am 5.6.2026 erfolgt** (Bausteine,
   Gates, Schwellen vorläufig für gut befunden). SEIN ENTSCHEID: **alles
   bleibt `entwurf` / `verified: false`** bis zur Wort-für-Wort-
   Detailüberarbeitung («wir überarbeiten alles später»). Erst danach
   NormRefs auf verified:true und Einträge einzeln auf «geprüft» (Goldrand).
2. **Seine Antworten ausstehend:** redundante Tageszählungs-Hinweise im
   Verzugszins-Bericht kürzen? · DOCX-Standardannahmen ok (Testament ohne,
   VA nur beurkundet)? · Bausteinprotokoll in PDF/DOCX-Exporte aufnehmen?
3. ~~Phase 4: Experten-Gating als Wrapper um /fachpersonen~~ → **entfällt
   ersatzlos** (Aufhebung der Free/Pro-Zweiteilung, Auftrag David
   7.6.2026); eine spätere Monetarisierung bekäme einen neuen,
   funktionsbezogenen Zuschnitt (STRATEGIE-PLATTFORM, Gate G1).
4. **Schlichtungsgesuch:** offene Verifikationen (kantonale §§ GOG/EG ZPO/
   GGR, PLZ 4001/4051, Art.-135-Randtitel) — in der UI offengelegt.
5. Kleineres: Detailseiten-Titel (calculators.ts) an neue Katalog-Titel
   angleichen? · Datepicker-Pfeiltasten (A11y-Kür) · Markenschriften auch
   für Vorlagen-PDFs · ggf. sichtbare Rechtsgebiet-Zwischentitel in den
   Untergruppen.
6. ~~Verschlankung Stufe 2~~ → **erledigt 5.6.2026** (generischer Rahmen
   in components/vorlagen/wizard.tsx, s. oben). Optional verbleibend:
   Form-Gate-Sektion (brass-Box mit Checkliste) als vierte geteilte
   Komponente — Texte sind je Vorlage fachlich verschieden, daher bewusst
   zurückgestellt.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur bei klar regelbasiertem, deterministischem Umfang — sonst
Widerspruch zu «feste Rechenregeln, keine Schätzung»: Konsumkredit-Widerruf
(Anwendungsbereich klären) · Schadenersatz/Genugtuung · Unterhalt ·
Tagessatz · Mietzinsherabsetzung · Konkurrenzverbot (alle wertend/Ermessen).
