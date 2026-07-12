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
Verweis-Abschnitt. Neue Karten werden am Anker `<!-- KARTEN -->

## Session 12.7.2026 — DESIGN D-2 «Rollen-Alias-Schicht» (Worktree `lm-design-d2`, Branch `feat/design-d2-rollen`)

**Auftrag (David «direkt umsetzen»; FAHRPLAN-DESIGN-WAERME.md D-2, ROADMAP W2·11-DESIGN; Vorbedingung D-1/#215 gemergt abgewartet).** Reine Token-/Rollen-Schicht nach Radix-Muster — **wertidentische Aliase, kein Werte-Tausch**. Vier Pathspec-Commits: **(A)** Rollen-Alias-Schicht additiv in `src/index.css` + `tailwind.config.js` — Akzent `--accent-bg/-bg-hover/-line-decor/-line/-solid/-text-strong/-hover` (`--accent-text` existierte), Status `--{sage,slate,warn,danger}-solid/-text`, Zustand `--ok-*`; alle in Tailwind exportiert (`accent-*`/`ok-*`/`…-solid`/`…-text`). **Löst Befund 9 OHNE Werte-Tausch:** die absichtliche Dark-Brass-Inversion (brass-800 = hellster Messing-Textton im Dunkel, a:hover heller = stärker) trägt die Rolle `--accent-hover`; die Aliase erben den korrekten Flip aus den Familien-Token, kein Dark-Override je Rolle nötig. **(B)** F1 aufgelöst: die drei sage-Doppelbelegungs-Sites `lc-badge-ok`/`lc-live`/`lc-termin-ring` auf `--ok-*` migriert (grep-vollständig; sage bleibt Materialien-Kennfarbe + Currency `lc-punkt-material`/`lc-chip-geltend`). **(C)** Reinweiss-Invariante (§13-Nachtrag d/Befund 41) ins Gate `check:design-tokens` (bg-white/text-white/…-white + `#fff` Inline; negativ-kontrolliert Exit 1, Baum 0 Treffer). **(D)** §13-Nachträge a–j als neuer **Block G** in `DESIGN-REGLEMENT.md` (Rollen vor Stufen; e Zwei-Stimmen grep-auditiert: 15 font-serif-Sites, alle Quelltext, null Produkt-UI). **Beweis (Aliase = wertidentisch):** `check:farbwelt` **vorher==nachher BYTE-IDENTISCH** (46 Pflichtpaare/6 Referenz/2 Fixpunkte/9 Warnungen unverändert — Assertion-Tabellen name-basiert, Aliase inert); golden 209 byte-gleich; dist-CSS-Kette `--ok-bg→var(--sage-bg)`/`--accent-hover→var(--brass-800)`; `npm run gate` GRÜN; `build` 63 Routen; axe-e2e **26/26** hell+dunkel; 8 Visual-Belege (4 Kernseiten × hell/dunkel) + README in `abnahme/design-waerme/d2/`. Gegenprüfung n/a (reine Token-Schicht). Trailer `Roadmap: W2·11-DESIGN`. PR mit armiertem Auto-Merge. **Nächster Schritt:** D-3 (color-mix srgb→oklab, eigener Mess-Commit).

## Session 12.7.2026 — DESIGN D-1 «Sofort-Fixes» (9 Posten, Worktree `lm-design-d1`, Branch `feat/design-d1-sofort`)

**Auftrag (David «direkt umsetzen»; FAHRPLAN-DESIGN-WAERME.md D-1, ROADMAP W2·11-DESIGN; Vorbedingung D-0/#209 gemergt abgewartet).** Neun messbare Verstösse/Bugs, je eigener Pathspec-Commit mit Messwert vorher→nachher: **(1)** FS-Null-Guard EntscheidLeser (`Number(null)===0` → Erstbesucher las 1.0 statt 1.08rem; live verifiziert `--rsp-fs:1.08rem`; Einstellungen-Bridge string-basiert nicht betroffen) · **(2)** Overline-AA: 55 `text-ink-(500|400|300)`-Overrides neben `lc-overline` gestrippt (ink-500/well 4.48→ink-600 6.65; brass-Pairings stehen) + **Regex-Schranke in `check:design-tokens`** (einziger Wächter — axe war trotz Verstoss grün; Negativ-Beweis Exit 1) · **(3)** Dark-1.4.11: `--sage-line`/`--slate-line`-Aliasse (dunkel -700) + Tailwind-`.line`-Stufen + 7 Call-Site-Swaps (danger dunkel 2.72→7.54; -500-Mitten unangetastet = -bg-Speiser); farbwelt +3 Pflichtpaare (40→46), danger-RISS bleibt Token-Paar-Baseline bis D-4/D-5 · **(4)** Regeste in `max-w-reading` (Pfad 1; ~115–120→~66 CPL gemessen; Prerender = reine SEO-Shell, nicht betroffen) · **(5)** Verdikt-/Warn-/Disclaimer-`<p>` des geteilten ErgebnisAnzeige-Rahmens auf Lesespalte (18 Formulare; ~135→≤91 CPL; Kacheln/Tabellen frei) · **(6)** Chevron-Hex #8A6A2F→#826225 (4.37→4.91 auf well) · **(7)** Motion-Dedup `transitionDuration`→`var(--dur-*)` (dist-CSS-Beweis) · **(8)** `--ink-fixed-dark`-Solitär speist helles ink-900 + `--auf-gold` (VOR D-4; Nicht-Flip bleibt) + `--placeholder` als dokumentierte Rampen-Stufe · **(9)** Status-Zwischentöne als DREI Rollen-Tokens `--status-outline/-border-soft/-hatch` (45/30/26 %, endwertgleich §6). **Lektion:** `check:linien-kanon` sliced `:root` bis zum ersten «html.dark»-LITERAL — auch in Kommentaren! (Kommentar-Wortlaut → «Dunkel-Block», eigener Nachfass-Commit.) **Tore:** voller `npm run gate` GRÜN (inkl. farbwelt 46 Paare, p-klassen/vollstaendigkeit grün — keine Fremd-Röten), golden 209 byte-gleich, axe-e2e 26/26 hell+dunkel, Visual-Belege 14 Screens Desktop+390 hell+dunkel in `abnahme/design-waerme/d1/`. Gegenprüfung n/a (reines UI/Token). Trailer `Roadmap: W2·11-DESIGN`. PR mit armiertem Auto-Merge.
` (unten) oben
angehängt. Die Rotation ist jetzt **mechanisiert** (`.claude/hooks/struktur-rotieren.py`,
SessionStart nur im sauberen Haupt-Checkout; manuell `npm run struktur:rotieren -- --write`)
— **verschieben, nie zusammenfassen**; ein Re-Akkumulations-Wächter warnt, wenn die
Steuer-Doks ihr Budget wieder überschreiten. Offene Abnahmen sind davon unberührt
(Spiegel: `ROADMAP.md` → «Abnahme-Warteschlange»; das frühere `HANDLUNGSPLAN.md` ist
in `ROADMAP.md` eingefaltet und nach `archiv/` verschoben).

## Session 12.7.2026 — V2·FN-3 (A20): Präambel-Fussnoten inline — F1-Familie damit KOMPLETT (W2·5d, reines UI, Worktree `lm-v2-fn3`, Branch `feat/v2-fn3`)

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F1 FN-3 · Z.32 / UX §10.8 A20; Davids Befund 10.7. «präambeln haben auch keine verlinkten fussnoten»).** Letzter Baustein der F1-Familie — nach FN-1/FN-2 (Extraktor, A19) und dem U-VERWEIS-A11-Merge (#170).

**Befund vor Bau (Korpus-Scan über alle Sidecars):** Die Marker-Daten liegen bereits VOLLSTÄNDIG aus FN-1/FN-2 vor — **215 Erlasse mit Präambel-Markern, 555 Marker, 0 Orphans** (jede von einer Ingress-Zeile referenzierte `fnNrs`-Nummer hat ein passendes Kopf-Apparat-Ziel; VRK/OR/VZG stichprobenverifiziert). ⇒ FN-3 ist REIN Render (KEIN Extraktor-Eingriff, KEINE Regeneration, kein Datei unter `scripts/normtext`/`public/normtext`/`src/lib/normtext` berührt).

**Gebaut (pathspec, `src/pages/gesetz-leser/parts/ErlassKopfBlock.tsx`):**
- **Marker je Präambel-Zeile:** trägt `z.fnNrs` (aus FN-2) ⇒ `<FnRef artikel="kopf" nr={nr}>` HINTER dem A11-NormText-Element, gewickelt in `data-fn-marker` — dieselbe Glyphe/Mechanik wie der Artikel-Fliesstext (G2b). `artikel="kopf"` ⇒ FnRef-Popover speist sich aus `#fn-kopf-${nr}`.
- **Kopf-Apparat-Anker:** die Apparat-Zeilen tragen jetzt `id="fn-kopf-${nr}"` + `nt-anker … target:bg-brass-100` (Sprungziel, wie der Artikel-Apparat).
- **R9/§8-Sichtbarkeit (aus U-KOPF):** Marker + Apparat liegen IMMER im DOM (`data-fn-marker`/`data-fn-apparat`); die Prominenz steuert allein der `data-fussnoten`-CSS-Toggle (nie `display:none` am Substanz-Träger — Ctrl+F/Print/Screenreader vollständig). Additiv (Marker nur, wenn die Zeile amtliche `fnNrs` trägt).
- **e2e** `verweis-u` FN-3-Block: OR (Kronjuwel, Note 1) · VZG (Alt-Form, Note 2) · VRK (Staatsvertrags-Kurz-Ingress, Note 2) — Marker→`#fn-kopf-nr`→Popover-Text; plus R9-Beweis (Marker+Anker immer im DOM). Nachbarn A7/A9/A10/A11/kopf-v2/kopf-g2b regressionsfrei (23/23).

**Tore:** voller `npm run gate` **GRÜN** (tsc · vitest 3776 · **golden IDENTISCH 209 byte-gleich** — Reader ist Client-SPA, nicht im golden · lint · check). **A9-DoD:** CLS 0 by construction (synchroner Kopf-Render, kein async Mount; Popover fixed+Portal wie die bereits A9-gegatete FnRef). **Gegenprüfung n/a** (reines UI, kein Risiko-Pfad). Trailer `Roadmap: W2·5d`. **F1-Familie damit KOMPLETT** (FN-4/FN-5 bleiben deferiert, David-Go).

## Session 11.7.2026 — V2·L-3 (A24·L-3): Linien-Auto-Default-Umkehr — tiefe Kodifikationen ZGB/OR zeigen wieder ihren EINEN Guide (W2·5d, reines UI, Worktree `lm-v2-l3`, Branch `feat/v2-l3`)

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F4 L-3 · Z.56, David 10.7. FREIGEGEBEN).** **Gate-Aufhebung:** David 11.7. im Chat «du hast bei allem was ich entscheiden muss selbst die wahl» → Orchestrator-Entscheid: bauen mit hartem Visual-Beweis (Council/Rückfrage entfällt). **Der eigentliche Hebel für Davids Befund** «Liniengliederung funktioniert praktisch nicht»: bis #161 deckelte die Tiefe den Auto-Guide (`strukturTiefe ≥ 3` ⇒ GANZ AUS) — das nahm genau ZGB/OR ihre Gliederungslinie. Denkfehler von #161: es gibt keinen Strich je Ebene, der Reader emittiert höchstens EINEN Guide auf `guideEbene` (kein Barcode).

**Gebaut (pathspec, reines UI):**
- **Regelwerk-Umkehr** `linienAufbau.ts`: `autoGuide = dichteAmGuide >= DICHTE_MIN` — die alte Tiefe-Obergrenze `strukturTiefe <= TIEF_AB−1` ENTFÄLLT; der Dichte-Boden (Median ≥ 2 Artikel/Sektion) bleibt der einzige Schwellwert (hält den Per-Artikel-Barcode fern). `TIEF_AB` nur noch Klassifikation. **K11-Tri-State/Nutzer-Override unangetastet** (nur der Auto-Default kehrt um).
- **`check:linien-kanon` deklariert nachgezogen** (Regelwerk-Änderung): B1-Invariante Tiefe-Obergrenze → Biconditional `autoGuide ⟺ tiefe≥1 && dichte≥2`; B2-Referenz-Verdikte **ZGB/OR `autoGuide:false`→`true`** + Kopf-Rationale. Tor GRÜN: 1144 Sidecars invariant, **Auto-Guide AN 158→230, +72 tiefe Kodifikationen** (alle strukturTiefe≥3 ∧ dichte≥2: Tiefe 3:57·4:12·5:3).
- **Doku:** DESIGN-REGLEMENT-NORMTEXT §4b-A (Tabelle ≥3-Zeile AUS→AN + Umkehr-Rationale + Referenz-Verdikte), `index.css`-Kommentar, `linien-korpus-verteilung.mjs`-Diagnose.
- **e2e deklariert nachgezogen:** `gesetze-ux-g3a` + `leser-linien-kanon` (ZGB-Verdikt RUHIG→sichtbar) + `leser-optionen` (BV-Toggle: Auto-Default jetzt an, Klick-Zyklus startet bei AUS).
- **#210-Kollision aufgelöst (Rebase):** Der parallel gemergte e2e-CI-Härtungs-PR #210 zog das g3a-Ruhig-Fixture von ZGB auf **BUEG** um — gewählt, WEIL BUEG (strukturTiefe 3, **dichteAmGuide 4**) unter der ALTEN Regel autoGuide=false hatte. Unter der L-3-Regel ist BUEG **autoGuide=TRUE** (dichte 4 ≥ 2, empirisch belegt) ⇒ kein Ruhig-Fall mehr. Auflösung (i): Mains Fixture-Version als Basis, Ruhig-Fixture deklariert auf **STG** gewechselt (~104 KB, strukturTiefe 3, **dichteAmGuide 1** — ECHTER Ruhig-Fall der neuen Regel: tief UND dichte-arm, aus der Korpus-Verteilungs-Diagnose; 12 Kandidaten mit tiefe≥1 ∧ dichte<2, STG der einzige tiefe). `leser-linien-kanon` analog: ZGB-Auto-Default-Verdikt 0→1 sichtbare Guide-Linie (deklariert) + neuer STG-Ruhig-Fall; R4-Invariante (≤1 Guide-Stapel) unverändert gegated.

**Visual-Beweis (Playwright, computed border-left-color + 28 Screenshots — 7 Referenzfälle × Desktop/Mobil@390 × Hell/Dunkel):** ZGB(tief5)/OR(tief4) NEU `guide-auto=an`, EIN calmer Guide sichtbar (nested Titel tragen Typo+Einzug, kein Barcode); ArG/BVV3-Kurzerlass/HKUE-Staatsvertrag unverändert sichtbar; **VMWG(flach0)/Kanton-§ weiter `guide-auto=aus`, 0 Guide-Elemente — kein neues Linien-Rauschen auf flachen Erlassen** (konservativ, Dichte-Boden + Tiefe-0-FLACH-Zweig). CLS 0 (nur border-Farbe).

**Verifikation:** golden `IDENTISCH` (209 byte-gleich — data-guide-auto ist client-runtime, nicht prerendert); `check:linien-kanon` GRÜN; tsc/lint (0 Errors) grün; e2e `gesetze-ux-g3a`+`leser-optionen` grün (isoliert). Gegenprüfung **n/a** (reine Darstellung). **⚠ Fremd-Reds (NICHT dieser PR):** `check:p-klassen` + `check:vollstaendigkeit` byte-gleich zu main (nicht CI-gated, s. Kopf-PR-Karte); lokale e2e-Voll-Parallel-Röten = CPU-Contention (isoliert 11/11 grün, CI läuft mit 1 Worker). Trailer `Roadmap: W2·5d`. PR mit armiertem Auto-Merge.

## Session 11.7.2026 — Gesetzesdarstellung V2: koordinierter Kopf-PR (A22·K-2 + A23·B-1/B-2 + U-PDF-Slot, Worktree `lm-v2-kopf`, Branch `feat/v2-kopf-pr`)

**Auftrag (David-Go 10.7. «go zu allem», nach U-VERWEIS-Merge):** die drei nach U-VERWEIS freigegebenen Kopf-Einheiten aus `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` in EINEM Schnitt — **K-2** Fussnoten-Chip im Kopf, **B-1/B-2** BGE-Steuerung im «Ansicht»-Dropdown, **U-PDF-Slot-Layout**. Reines UI. L-3/Restposten NICHT (David-Gate).

**Gebaut:**
- **K-2** `LeserFussnotenChip` (aktionen-Slot): echter Toggle (aria-pressed) auf `fussnoten` + Zähler N (Summe Sidecar-Fussnoten via `useMemo`); Einschalten → `scrollIntoView` erster `[data-fn-marker]` (erst einschalten, dann scrollen); kein Chip bei N=0/vor Sidecar-Laden (CLS 0 e2e-gemessen).
- **B-1** 4. Toggle «Entscheide» (`leserOptionen.ts`-Feld `leitfaelle`, Default an) — CSS `html[data-leitfaelle="aus"] .lc-leser [data-leitfall-zeile]{display:none}`, kein Re-Render (§15).
- **B-2** Zeitraum «alle·20·10·5 J.» (Default alle): reine Filter-Fn `leitfallFilter.ts` (jahr-genau/Q1-sicher) + Unit-Test; `LEITFAELLE_SICHTBAR` 5→**10**; **Primitiv-Selektor `useLeitfallZeitraum()`** (Zeilen rendern nur bei echter Zeitraum-Änderung); §8-Härtung: voll weggefilterte Zeile → «n ältere ausgeblendet · alle zeigen» (klickbar); aktiver Zeitraum als Micro-Label.
- **U-PDF-Slot** EINMALIG neu geordnet: **Ansicht · Fussnoten · In neuem Reiter · Amtliches PDF**; Ansicht-Dropdown mobil-sicher (`right-0 sm:left-0` — Nebenbefund: neuer Zeitraum-Block deckte vorbestehenden @390-Rechts-Overflow auf, behoben).

**Verifikation:** golden `IDENTISCH` (209 byte-gleich — alle Änderungen client-only/CSS); tsc/vitest (3697+6 neu)/lint grün; e2e `leser-optionen` (4 switches) + `leser-kopf-a9` (Throttle, CLS 0) + `leser-kopf-v2` (K-2/B-1/B-2) + `leitfaelle-chips` **11/11 grün**; Visual Desktop+Mobil@390. Gegenprüfung **n/a** (reines UI). Trailer `Roadmap: W2·5d`.

**⚠ Vorbestehende Daten-Reds auf main (NICHT von diesem PR):** `check:p-klassen` (`entg`: `man-space-before-0`) + `check:vollstaendigkeit` (ARG/VWVG/GBV/VSTG/KG/… je 1–5 Artikel «in HTML, nicht im Snapshot») schon auf sauberem `origin/main` (bb0e334a) rot — Daten-/Extraktor-Sache (Fedlex-P1-a/b / FN-Regeneration), TABU für diesen UI-PR. Für den paralleln Daten-Agenten.

## Session 11.7.2026 — Fedlex-P1-a/b Pin-Kanonik (Querschnitts-Wurzel, Risiko-Pfad, Worktree `lm-p1ab`, Branch `fix/fedlex-p1ab-pin-kanonik`, `Roadmap: W2·6`)

**Auftrag:** die lange offene Fedlex-P1-a/b-Wurzel schliessen — `fedlex-cache.sh` dockte bei den n=0-Pins an die nicht-kanonische **Alias-URL** (`…-de-html.html`) an → Alt-Generations-Dumps + Soft-404-Casemates-Shells; html-N auf die kanonische `isExemplifiedBy`-Manifestation heben, Sonden härten, betroffene Snapshots regenerieren.

**Befund (empirisch, SPARQL live):** nicht 198, sondern **166/227** Pins dockten an der Alias-URL statt an der registrierten Manifestation (Audit `fedlex-manifest-audit.ts`: 166 MISMATCH, 0 UNRESOLVED, 61 OK). Die 1–5-Fallback-Heuristik konnte die echten kanonischen N (kov/ssv/kkv_finma=14, chemrrv=26, finma_gebv=17, mwstv=11) nie erreichen.

**Gebaut:** (a) `scripts/fedlex-manifest.ts` (`loeseHtmlManifeste`/`nAusUrl` — html-N via `isRealizedBy(DEU)→isEmbodiedBy(html)→isExemplifiedBy`, deterministisch, 1 Datei/Datum COUNT-verifiziert) + `fedlex-repin-kanonik.ts` (166 Pins byte-genau re-gepinnt) + `fedlex-manifest-audit.ts`; `lesePinsVoll()` in `fedlex-pins.ts` (Signatur `lesePins` unverändert). (b) **Kanonik-Arbiter** in `check:fedlex-versionen` (html-N ≠ isExemplifiedBy ⇒ Exit 1, negativ-getestet); `struktur-run` **«0 übersprungen»-Pflichtkontrolle** + Cache-Sicherstellung (stiller Skip war der Kern des «54 Sidecars ohne Erlassdatum»-Symptoms); cache.sh **Casemates-Shell- + Anker-Count-Sonde**.

**Datenlauf (kein Parser-Eingriff → alle Diffs AMTLICH, Quelle alias→kanonisch):** 104 Snapshots + 130 Struktur-Sidecars kanonisch regeneriert (Datum-Churn zurückgesetzt); register.artikelAnzahl + artikel-revisionen-Shards + Bilder (4 verwaiste entfernt, GBV-Dangling-Ref geheilt) nachgezogen. Klassifikation: 10 Erlasse +Artikel (Soft-404-Heilung), 85 nur FN/Text-Drift, 9 nur −`lvl_`-Struktur — **kein `art_`-Verlust**. Musterheilung **OR** (Kronjuwel html-4→html-12): Alias trug «Mietzinse die künftig fällig werden» ohne Kommata + «2 e 3»-Leak, kanonisch korrekt. 23 neue `[tab]`-Marker-Artefakte (Anhang-Inhalt, Text je erhalten) ins Expected-Fail-Register triagiert; `<p>`-Klasse `man-space-before-0` (leerer Spacer) entschieden.

**Tore:** voller `npm run gate` grün, engine golden byte-gleich, `check:struktur-konsistenz` 227 konsistent. **Gegenprüfung bestanden** (unabh. Opus-Zweitdurchgang, 5 Stichproben live gegen Fedlex OR/UNO_PAKT_II/GFK/LUGUE/DBG — kein Norm-Verlust, DBG-Beträge 14100/25800/26800 exakt; NBSP-Fold als vorbestehend/out-of-scope notiert). Beleg `bibliothek/register/fedlex-pin-kanonik-2026-07-11.md`.

## Session 11.7.2026 — QS-TOK/T19 Warn-Injektions-Entfernung (Prompt-Cache-Hygiene, Worktree `lm-qstok-t19`, Branch `feat/qstok-t19`)

**Auftrag:** T19 (nach T1/#176) — die git-zustandsabhängige, byte-instabile SessionStart-Warn-Injektion aus `struktur-aktuell.py` aus der SessionStart-Kette (`.claude/settings.json`) entfernen, damit der Sitzungs-Präfix byte-stabil bleibt (Prompt-Cache-Treffer). **Empirie:** bei realem STRUKTUR-Lag injizierte der Hook 1101 Byte/937 Zeichen variablen `additionalContext`; dieselbe Lag-Lage nach T19 = 0 Byte. Schutzfunktion nicht ersatzlos gestrichen: trägt mechanisch `struktur-rotieren.py` (T1-Rotation + size-basierter Re-Akkumulations-Wächter); Lag-Audit bleibt On-Demand als `npm run struktur:aktuell` (verhaltensgleich, stdin-tty-sicher). CLAUDE.md-Kopf + FAHRPLAN §Stand + `dispatch-template.md §7` nachgezogen. Gegenprüfung n/a (Prozess-Hook).

## Session 11.7.2026 — GL «Soft-404»-Follow-up: Prämisse WIDERLEGT + Fehlerklasse gate-geschützt (W2·6, Risiko-Pfad, Worktree `lm-gl-fix`, Branch `fix/gl-json-content`)

**Auftrag:** GL driftet (POC-Befund: `gesetze.gl.ch` `xhtml_tol` = Soft-404-Shell, nur `/show_as_json`/`json_content` lebt) → GL-spezifische `json_content`-Andockung bauen, Snapshots refreshen.

**Kernbefund (§7 «per Messung, nicht per Annahme»): Prämisse WIDERLEGT.** Live-Nachmessung `GET /api/de/texts_of_law/{lawId}` liefert für **alle 5** GL-Erlasse HTTP 200 + `application/json` mit **populiertem `xhtml_tol`** (44 KB), 3/3 reproduzierbar; committeter `fassungsToken`/`version_uid` **zeichengleich zum Live** (3211018a/4a9384f7/6f484b8a/b2009f94) → **GL nie gedriftet**. Die «Angular-/Casemates-Shell» (2.3 KB, 200, text/html) serviert nur der **`/app/`-SPA-Pfad** (menschliche `quelleUrl`), NICHT der Adapter-`/api/`-Endpunkt — POC hatte die Pfade verwechselt. **Kein `json_content`-Umbau, David-SCHEMA-ENTSCHEID (a/b/c) bleibt unberührt/offen.**

**Stattdessen gebaut — Klasse dauerhaft entschärft (der echte Mehrwert):** `adapter-lexwork.ts` `LexWorkShellError` + Soft-404-Erkennung in `holeLexWork` (Content-Type ≠ JSON **oder** HTML-Body); `check-drift.ts` Prüfung 3 (`check:normtext-netz`) wertet Shell als **HARTEN Fehler (Exit 1)** statt Netz-Warnung → die Klasse driftet **nie wieder still**, host-agnostisch für alle 19 LexWork-Kt. E2E gegen die reale `/app/`-Shell verifiziert (wirft). +2 Unit-Tests. GL-Snapshots refresht (`--nur=kanton --kanton=GL`): **amtlich 0 Änderung**, reiner Extraktions-Diff (+5 S1-Leerplatzhalter III-C.1 art_3/4/8–11/12–14/19 = aufgehoben, Nummerierung reisst nicht mehr; N1-Randtitel; S9-Volltitel); golden **rein additiv** (5 Leer-Shas).

**Gegenprüfung bestanden** (amtl. gesetze.gl.ch live in Prüfsession): III-A.5 Art3 Streitwertstaffel a–e zeichengenau; III-B/7/1 Art13 Grundbuch (3,5‰/2‰/1‰, Fussnoten-Anker `[8]` korrekt gestrippt, Dezimalkomma+‰+– verbatim); III-C.1 Art1/19a aktiv + abrogated-Negativfall (5 Leerplatzhalter, kein fabrizierter Text); future-Negativfall n/a (GL future_versions=0). Token quittiert (Hash `848c6508`). Gates: schnell grün, `check:gegenpruefung`/`paritaet`/`datenhaltung`/`zaehler` grün; `check:revisionen` **fremd-vorbestehend rot** (9 Staatsvertrags-Sidecars, auf origin/main identisch rot, GL-fremd).

**Artefakte:** POC-Nachtrag §GL-NACHTRAG + Verfallsregister-Eintrag AUFGELÖST. Trailer `Roadmap: W2·6` + Gegenpruefung. PR mit armiertem Auto-Merge.

## Session 11.7.2026 — OpenCaseLaw Baustein ① LexWork-Kantons-API: POC/Mess-Verifikation (W2·6, Worktree `lm-ocl-lexwork`, Branch `feat/ocl-lexwork-kantone`, doc-only)

**Auftrag:** OCL-Baustein 1 (LexWork-Kantons-API für 19 Kt.) bauen, Go David 10.7. **Kernbefund: bereits gebaut+live — kein Neubau** (Neubau = §1/§6-Verstoss, Golden-Churn auf 1 232 Snapshots). Adapter `scripts/normtext/adapter-lexwork.ts` (fetch→`xhtml_tol`, Drift `version_uid`), Discovery `lexfind-discovery.ts` (host-agnostisch, folgt Redirects), 1 232 Snapshots (alle 26 Kt.), Drift-Tor `check:normtext-netz` existieren produktiv — alle drei Auftrags-Bau-Items sind da.

**Geliefert (POC/Mess-Phase §7):** 19 LexWork-Kantone **live** gegen die amtlichen Portale verifiziert (read-only). **18/19 voll nutzbar** (Index-Liveness, `version_uid`, `xhtml_tol`/`class='article'`). 7 Hosts 301→neuer amtlicher Host (FR/GL/NW/OW/SH/VS/ZG); «nie hardcoden» bestätigt. **GL = Currency-Befund:** `gesetze.gl.ch` serviert `texts_of_law/{id}` (`xhtml_tol`) nicht mehr (Soft-404-Shell), nur `/show_as_json` lebt → GL-Snapshots driften; erstes Argument für den `json_content`-Upgrade. Verfallsregister-Eintrag gesetzt.

**Gegenprüfung bestanden** (unabhängig, amtliche Quelle in Prüfsession geöffnet): SO 111.1 Art. 1 zeichengleich; AR-future (geltende≠künftige Fassung); BS 153.100 art_53 abrogated (leerer Block, kein fabrizierter Text). Doc-only → kein Risiko-Diff, kein `gegenpruefung:ok`-Token nötig.

**Artefakte:** Verdikt-Tabelle+§11 `bibliothek/normen/lexwork-kantone-poc-19-verdikt.md` (+INDEX); Verfall-Eintrag GL; FAHRPLAN-OPENCASELAW §Stand; ROADMAP-OCL-Notiz. **Offen (Follow-ups):** GL-`json_content`-Andockung + David-SCHEMA-ENTSCHEID `json_content` vs. `xhtml_tol`. Trailer `Roadmap: W2·6`. PR mit armiertem Auto-Merge.

## Session 11.7.2026 — U-POSITION (A2+A16+A17): Scrollbalken-Proportionalität · exakte Zurück-Restoration · Split-View-Fundstelle (W2·5d, reines UI, Worktree `lm-u-position`, Branch `feat/u-position-a2-a16-a17`)

**Reader-Kette W2·5d nach U-VERWEIS.** Drei Anmerkungen an der Höhen-/Anker-Mechanik, reine Darstellung/Interaktion (`Gegenpruefung: n/a`). **Golden byte-gleich** (alle Änderungen Client-Reader; kein `public/normtext`/`erlassVolltextHtml`; `golden:vergleich` IDENTISCH).

**A2 Scrollbalken-Proportionalität.** Wurzel empirisch: `.nt-art-cv` gab jedem Artikel denselben `contain-intrinsic-size: auto 320px` → Platzhaltersumme ≠ Realität, Daumen-ans-Ende in der Mitte. **Fix:** `schaetzeArtikelHoehe` (berechnungen.ts, deterministisch aus dem Snapshot) inline je `<article>` (überschreibt 320px). **Logikverlust-Bewertung: keiner** — `content-visibility:auto` bleibt (Ctrl+F/Anker/Druck/SEO unberührt), nur der Schätzwert wird proportional. `check:perf-budget` grün.

**A16 anker-basierte Zurück-Restoration.** `scrollAnker.ts` (neu): {Token, Offset} je Reiter; passiver rAF-Scroll-Listener erfasst den obersten Artikel + Offset. `App.tsx:ScrollWiederherstellung` löst für Leser-Reiter den Anker gegen das AKTUELLE DOM auf (`getElementById`, element-basiert robust gegen die content-visibility-Höhenschätzung), scrollY bleibt Fallback (Nicht-Leser byte-gleich). Interne Verweise navigieren über den **Router** (echter History-Eintrag; manuelles pushState war der debug-widerlegte Irrweg — desynct react-router). NormPopover «Im Gesetz öffnen» → SPA-`<Link>` (deklarierte Änderung, Test in MemoryRouter) ⇒ Cross-Erlass-Zurück (AIG→StGB) landet am Ausgangs-Artikel. Pane-eigene History unangetastet.

**A17 Split-View an der Fundstelle.** Reader lasen die Fundstelle aus `window.location.hash` (Haupt-URL) und brachen für Panes ab ⇒ Pane öffnete oben. Fix: Gesetz-Leser + EntscheidLeser lesen Hash/`?norm` **pane-lokal** (`useLocation`/`<Routes location>`). Nie stumm falsch: ohne `ersteFundstelle` ehrlicher Dokumentanfang; Materialien (nur-live-link) ohne Ziffer-Sprung (n/a).

**Tore:** voller `gate` grün; der VORBESTEHENDE `check:plan`-Orphan `W3·14-Responsive-Defekte` (10.7.-Session: @meta ohne Inventar-Eintrag) mit-reconciliert (`scripts/plan/inventar.ts`). e2e neu `leser-position-u` (P4 A2/A16/A17 + A9-Throttle CLS 0); Voll-Sweep 192/192 (norm-sprung-A9-Parallel-Flake standalone grün); hardened-Specs 10× stabil. Trailer `Roadmap: W2·5d`. PR mit armiertem Auto-Merge.

## Session 10.7.2026 — CLS-/e2e-Härtung: 0,49-CLS-Race + TOC-Mikro-Shift + Norm-Sprung-Reaktivität (QS-PERF, Worktree `lm-cls-fix`, Branch `fix/cls-race-haertung`)

**Befund (Orchestrator, CI-Queue-Destabilisierung).** Drei byte-identische, nur unter CI-Parallel-Last (6 Tore-Jobs · 4× CPU-Drossel) reproduzierbare e2e-Rotfälle. **Nicht geraten — jeder Befund mit LayoutShift-Attribution (`PerformanceObserver` `sources`) belegt, dann Wurzel-Fix nach §15.2.**

**① `verweis-u.e2e.ts` «Plural-Sprung-Seite» CLS = 0,49066975.** Attribution: `div.grid.grid-cols-[16rem_minmax(0,1fr)]` — der 2-Spalten-Grid-Container. **Wurzel:** `inhalt.tsx` `const [istXlVp] = useState(false)` + matchMedia-`useEffect` NACH Mount → der Client (frisch via createRoot, kein hydrateRoot, §15.5) rendert zuerst 1-spaltig, flippt danach auf 2-Spalten = voller Lesespalten-Reflow. Unter Last verliert der Effekt das Rennen gegen den Snapshot-Fetch → deterministischer 0,49-Shift (Repro: erzwungener Spät-Flip an art-31 reproduziert 0,4835). **Fix (§15.2 «Client-Initialstate auf Server-Zustand pinnen»):** lazy `useState`-Initializer liest matchMedia synchron im ersten Client-Render (`typeof window`-Guard → SSR/`renderToString` byte-gleich `false`; Erlass-Detailseiten kommen ohnehin aus dem String-Builder `erlassVolltextHtml`, nicht aus der Komponente → golden byte-gleich verifiziert).

**② `leser-kopf-a9.e2e.ts` CLS = 0,00010835 (`.toBe(0)`).** Attribution: `li` im `aside.sticky` Gliederungs-Baum, +19 px. **Wurzel (zwei Quellen):** (a) TOC-Akkordeon animierte `transition-[grid-template-rows] duration-300` — eine Höhen-ANIMATION reflowt Frame für Frame; läuft der Auf-/Zuklapp durch Scroll-Spy (kein Input) oder unter Last übers 500-ms-Input-Fenster hinaus, zählt jeder Frame als unerwarteter CLS. (b) `springeZuSektion` öffnet den TOC-Zweig, committet aber unter Last spät (React deferiert) = ausserhalb des Input-Fensters. **Fix (3-teilig):** Akkordeon SOFORT statt animiert (`parts.tsx`, kein `transition`); `springeZuSektion` öffnet den Zweig via **`flushSync`** synchron im Klick-Task (input-zugerechnet); jumpLock 48 ms→**500 ms** verlängert (wie `springeZuArtikel`), damit der Scroll-Spy den Zweig nach dem programmatischen Sprung nicht spät auf-/zuklappt. Beweis: TOC-Höhe pre/post-Breadcrumb 311→311 (vorher 311→330).

**③ `norm-sprung.e2e.ts` A9 `getByText('Sprung')` >12 s unter Drossel.** **Wurzel:** der billige, deterministische Norm-Sprung (A5) lag in DERSELBEN `gruppen`-Memo wie die TEURE Artikel-Volltextsuche (~4 MB-Index, synchron) → der 4-MB-Scan blockierte den gesamten Trefferaufbau inkl. Sprung. **Fix an der Sache (§15.3, KEINE Timeout-Erhöhung):** Artikelsuche via **`useDeferredValue`** vom reaktiven Pfad entkoppelt — Sprung + günstige Gruppen rendern sofort am Live-Query, Artikelgruppe holt mit niedriger Priorität auf. `artikelGruppe` nimmt Treffer nur entgegen (kein Re-Ranking über q) → nur WANN, nicht WAS (§6.4). 12-s-Budget UNVERÄNDERT.

**Stabilitäts-Beweis:** alle drei e2e **10× lokal grün unter 6× CPU-Drossel** (throttle-6, standalone + `--workers=1` = CI-Worker-Modell 8/8). Parallel-Worker-Flake (norm-sprung) ist lokal-only — CI läuft `workers:1` sequenziell + retries:2. **Golden-Klasse:** byte-gleich (nur React-Reader/Such-Hook, kein String-Builder/kein `public/normtext`; `golden:vergleich` IDENTISCH). **Gegenprüfung n/a** (reine UI-/Test-Infrastruktur — kein Rechnen/Extraktion/Norm-Tarif-Risikopfad §3; `check:gegenpruefung` grün). **Tore:** voller `gate` grün ausser **check:plan** (pre-existing rot: QS-TOK-@meta verwaist, auf clean base IDENTISCH — nicht dieser Diff; nicht CI-Required). **A9-DoD** erhalten (Interaktion nachweislich reaktiv, keine Test-Schwelle aufgeweicht). Trailer `Roadmap: QS-PERF`. PR mit armiertem Auto-Merge.

## Session 10.7.2026 — Fedlex-Portfolio Paket 5: Änderungshistorie / Amtliche Sammlung (W2·6-REV, Risiko-Pfad Extraktion), Worktree `lm-fedlex-p5`

**Auftrag (Go David 10.7. «go zu allem»; Detailquelle `FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 5`, erbt Paket-2-Pipeline):** je Bund-Volltext-Erlass eine **«Änderungen / Revisionen»-Timeline** — welche AS/RO-Änderungserlasse (`eli/oc`) haben das Gesetz wann geändert. Schwester zu Paket 2 (Botschaft=Absicht, AS-Erlass=tatsächliche Änderung). **Füllraten-POC zuerst (Finding 6, korpusweit VOR Bau):** SPARQL Pfad (b) über die SR-Taxonomie live an DSG + 218 Erlassen → **3108 Änderungs-Erlasse**, Erlasse mit ≥1 Änderung 218/218, dateDocument/Titel DE·FR·IT/roFundstelle je 100 %. **POC-Korrektur (Skill scraping-swiss-official-sources):** die Spec-OPTIONALs `jolux:historicalId`/`botschaftDate` liefern am oc-Knoten NICHTS (0/7 DSG) → RO/AS-Fundstelle deterministisch aus der oc-URI abgeleitet («AS <jahr> <num>», gegen `sequenceInTheYearOfPublication`+`publicationDate` gegengeprüft; Gegenprüfung bestätigte == `jolux:historicalId`), Botschafts-Join über die von Paket 2 persistierten `ocUris` (477). **Determinismus (§2):** 2 Live-Läufe byte-identisch; `check:revisionen` baut aus store-raw neu == committet. **Sammelerlass-Cross-Check (§8):** Pfad-(a)-Geltungsstände des gepinnten cc-Abstracts ohne (b)-Erlass ab 2000 → 1942 «sammelerlass-marker» (nie stille Lücke, `<details>`-eingeklappt). **nichtKonsolidiert-Marker (Finding 4):** 93 Einträge `dateEntryInForce > Korpus-Stand`. **DSG-Referenzfall:** Timeline spannt die Totalrevision (Alt-DSG oc/1993 + Neu-DSG oc/2022/491), Tor-Anker. **Speicher:** File-Sidecar `public/normtext/revisionen/<KEY>.json` (218, lazy) — **Übergangslösung**, Zielsenke ab E1 `erlass_fassungen` (Schema-Rückkopplung FAHRPLAN-DATENHALTUNG §3); Ingest erweitert (`normtext-revisionen`) → `check:paritaet` deckt 218 byte-genau, `daten-manifest.json` nachgezogen. **Bridge B1 (Moat-Hebel 1):** «Änderungen / Revisionen»-Gruppe IM bestehenden `KontextPanel` neben der «Entstehungsgeschichte» (Norm-Kontext-Bus, KEIN Silo, ohne `gesetz-leser`-Änderung — TABU respektiert). **Neu:** `revisionen-generieren(.ts/-run.ts)`, `check-revisionen.ts`, `src/lib/normtext/revisionen.ts`, `normtext-revisionen.test.ts` (11), `bibliothek/normtext/revisionen-2026-07-10.md`; **erweitert:** `datenhaltung/ingest.ts`, `KontextPanel.tsx`, `package.json`. **Tore grün:** GATE VOLL GRÜN (tsc · vitest 225/3661 · golden byte-gleich · lint 0 F · check inkl. `check:revisionen`+`check:paritaet`+`check:datenhaltung`) · `check:revisionen-netz` live. **Gegenprüfung (Risiko-Pfad) BESTANDEN** (unabh. Opus, frischer Kontext, live gegen Fedlex-SPARQL: Drop-Check DSG7/MWSTG29/StGB58/BGBM2 deckungsgleich, DSG-Totalrevision, Marker 2025-04-01 belegt, Joins bidirektional, Q1 Bandjahr + Titel verbatim; 0 Befunde). Beleg `bibliothek/normtext/revisionen-2026-07-10.md`. Trailer `Roadmap: W2·6`.

## Session 11.7.2026 — V2·C-2 (A25/C-2): Farb-Wörterbuch Teil 2 — Overline-Farbpunkte Leitfälle/Verweise + Currency-Chip-Tonung (sage «geltend geprüft (maschinell)» / warn «nächste Fassung ab») (W2·5d, reines UI), Worktree `lm-v2-c2`

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F5 C-2 · Z.62; Bau-Go David «go zu allem», §3 Ziff. 3: sage «geltend geprüft» + «(maschinell)»-Wording gilt mangels Einwand).** Zweite Farb-Einheit, gleiche Doktrin wie C-1 (Farbe nur Referenzschicht, Normtext-Körper farbfrei, §4b-B) — reine Tick-/Punkt-Farbe, Anatomie unverändert ⇒ **CLS 0, golden byte-gleich**. **Precheck:** U-VERWEIS (#170), C-1 (#174), Kopf-PR (#194) auf main; #198 (Ansicht-sticky) berührt **ErlassLeserKopf.tsx NICHT** (verifiziert via `gh pr view 198 --json files`) ⇒ die zwei Currency-Tick-Klassen dort sind konfliktfrei. **Änderungen (pathspec):** (1) **Overline-Farbpunkte** — neue `index.css`-Utilities `lc-punkt` (brass-**600**) / `lc-punkt-entscheid` (slate-500); «Leitfälle»-Overline (`ArtikelLeser.tsx` `LeitfallZeile`, deckt beide Zeilen-Zustände über die geteilte `ueberschrift`) trägt den slate-Punkt, «Verweise»-Overline den brass-Punkt. Redundant zum Wortlabel (`aria-hidden`, Farbe nie allein tragend §13/F2); auf `--paper` ⇒ brass-600 statt -500 (Chip-Tick sitzt auf `--well`), damit ≥3:1. (2) **Currency-Chip-Tonung** — `lc-chip-geltend` (sage-500-Tick) für «geltend geprüft am … (maschinell)» = neutraler maschineller Freshness-Beweis, KEIN Rechtsstatus (§7/§8: kein «gegengeprüft/verifiziert»-Wortfeld); `lc-chip-vorbehalt` (warn-500-Tick) für «nächste Fassung ab …» = echter Fassungsvorbehalt (`ErlassLeserKopf.tsx`, nur zwei Klassen ergänzt). `--sage-500`/`--warn-500`/`--slate-500` in `html.dark` bewusst NICHT überschrieben. **Kontrast als Gate gemessen** (Playwright, Light+Dark, Desktop 1280 + Mobil 390): slate-Leitfälle-Punkt **5.21/3.31**, brass-600-Verweise-Punkt **3.71/11.74**, sage-geltend-Tick **4.14/4.03**, warn-vorbehalt-Tick **3.02/5.52** — alle ≥3:1. **Visual-Review** je 4 Achsen: slate-Punkt vor «LEITFÄLLE» (OR Art.41), brass-Punkt vor «VERWEISE» (DBG), sage-/warn-Tick an den AHVG-Currency-Chips — kein Layout-Shift. **Tore:** voller `npm run gate` grün ausser den **zwei fremd-vorbestehenden main-Röten** `check:p-klassen` + `check:vollstaendigkeit` (Daten-Strang, nicht C-2-Scope, auf clean base identisch rot) — tsc·vitest·golden:vergleich **IDENTISCH**·lint 0 F grün, `check` 26/28 grün. **Gegenprüfung n/a** (reines UI, kein Risiko-Pfad). Neuer Test `v2-c2-farbwoerterbuch.test` (Leitfälle-slate-Punkt · geltend-sage + «(maschinell)» + kein «gegengeprüft/verifiziert» · vorbehalt-warn · leer ⇒ kein toter Marker). §4b-B additiv nachgezogen (sage/warn/brass/slate-Bearer + Mess-Werte). C-3 bleibt deferiert. Trailer `Roadmap: W2·5d`. PR mit armiertem Auto-Merge.

## Session 10.7.2026 — V2·C-1 (A25/C-1): Farb-Wörterbuch Referenzschicht — KantenChip `kategorie` (Norm brass / Entscheid slate) + Revisions-↻ warn (W2·5d, reines UI), Worktree `lm-v2-c1`

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F5 · Farb-Wörterbuch Z.66; Bau-Go David 10.7. «go zu allem»).** Erste Einheit des Farbkonzepts: Farbe NUR auf der Referenz-/Verzahnungsschicht, Normtext-Körper farbfrei (§4b-B). **Precheck (V2 §4 Pflicht):** `git worktree list` + `git diff main…` + `git diff HEAD` → **U-VERWEIS (#170) bereits auf main gemergt** ⇒ harte §4-Regel «nichts auf parts.tsx vor U-VERWEIS-Merge» erfüllt, LeitfallZeile-Call-Site sauber in-Scope; kein paralleler Worktree berührt parts.tsx (lm-v2-fn = scripts/normtext+Sidecars). **Änderungen (pathspec):** (1) **KantenChip** neue `kategorie`-Prop `'norm'|'entscheid'` (Default 'norm'); 'norm' emittiert die **unveränderte** brass-Klassenzeile → golden byte-gleich, KontextPanel-Normchips bleiben brass (NICHT wholesale umgefärbt); 'entscheid' = `.lc-chip-entscheid` slate-Tick + slate-Hover-Utilities (kein brass-Hover auf slate-Tick). (2) Call-Sites → 'entscheid': **LeitfallZeile** (parts.tsx), **EntscheidVerzahnung**. (3) **StatusBadge** per-Prädikat `glyphTon`: Revisions-**↻ → text-warn-700** (echter Fassungsvorbehalt), **★ bleibt brass** — löst die Doppelnutzung der Glyph-Zeile :91 auf, ohne das geschlossene Vokabular zu ändern. (4) **slate-Doppelbelegung** («ungeprüft»-Status) aufgelöst: slate = neutraler Referenzton ohne Wertung; Revision wandert nach warn → dokumentiert in **DESIGN-REGLEMENT-NORMTEXT §4b-B** (Farb-Wörterbuch, EIN Entscheid je Farbe). Anatomie/Token/Grösse unverändert ⇒ **CLS 0**. **Kontrast als Gate gemessen** (Playwright, Light+Dark, Desktop 1280 + Mobil 390): slate-500-Tick **4.81** hell / **3.47** dunkel (WCAG 1.4.11 ≥3:1); warn-700-↻ **5.24/9.43**; brass-700-★ **4.91/10.48** — alle über Schwelle; Hover-Swap auf slate-700 verifiziert (light rgb(70,83,90) / dark rgb(169,184,191), kein brass); `--slate-500` in `html.dark` bewusst nicht überschrieben. **Visual-Review:** Norm-Chips brass, Entscheid-Chips slate, ★ brass, kein Layout-Shift (OR Art.18 5 Leitfälle; BGE 152 II 1 13 zitierte Entscheide). **Tore:** `npm run gate:schnell` grün (tsc·vitest·golden:vergleich IDENTISCH); voller `gate` grün ausser **check:plan** (pre-existing rot: QS-TOK-@meta verwaist, auf clean base ebenso — nicht C-1; nicht in CI-Required); lint 0 Errors, build 61 Routen. **Gegenprüfung n/a** (reines UI, kein Rechnen/Extraktion/Norm-Tarif-Risikopfad §3 — nur Chip-Tick-Farbe + Hover, Wortlaut/Daten unberührt). Tests erweitert (`verzahnung.test`: Default byte-identisch, Entscheid-Slate, ↻-warn, ★-brass). C-2/C-3 bleiben deferiert (nach U-VERWEIS/Kopf-PR). Trailer `Roadmap: W2·5d`. PR mit armiertem Auto-Merge.

<!-- KARTEN -->

## Session 12.7.2026 — W2·10-UI-NAV: Such-Dropdown-Race an der Wurzel geschlossen (stabiler Treffer-Key statt Positions-Index; Worktree `lm-suche-race`, Branch `fix/suche-aktivindex-race`)

**Auftrag (W2·10-UI-NAV, §1-naher UX-Korrektheitsfehler; Befund aus der e2e-Härtung #210).** Die Pfeil-Auswahl im Such-Dropdown (HeaderSuche **und** Hero UniversalSuche) lief als **Positions-Index** (`aktivIndex`) in die per `flatMap` gebaute Trefferliste. Die per `useDeferredValue` entkoppelte Artikel-Volltextgruppe (§15.3/#183 — GEWOLLT, nicht rückgebaut) landet «einen Tick später» und wächst ein → der pfeil-gesetzte Index zeigte danach auf einen ANDEREN Treffer, Enter sprang ins falsche Ziel (empirisch unter CPU-Drossel: SCHKG#art-257 statt OR#art-257_d). #210 hatte den e2e nur deterministisch gemacht (Query-Reset), die Race für ECHTE Nutzer bestand weiter.

**Wurzel-Fix (reines UI, §2/§3 Navigations-Arithmetik):**
- **Neu `src/components/suche/trefferAuswahl.ts`** — geteilte, reine Auswahl-Logik über den **stabilen Options-Key** (die `oid`, suchOptionId) statt der Position: `aktivePosition`/`naechsterKey`/`vorigerKey`/`gewaehlterHref`/`aktiveOptionId`. Wächst die deferred Gruppe ein, relokalisiert `findIndex` den SEMANTISCH gleichen Treffer an seine neue Stelle → die Auswahl folgt ihm, das Ziel bleibt unverändert. Verschwindet der gewählte Treffer ganz, fällt die Auswahl sauber auf «nichts» zurück (Enter → oberster Treffer/Norm-Sprung, A5/P3-Kontrakt) statt auf einen Nachbarn zu springen; `aria-activedescendant` nur gesetzt, wenn der Treffer wirklich in der Liste steht (kein hängender ARIA-Verweis).
- **HeaderSuche.tsx + UniversalSuche.tsx** auf `aktivKey: string|null` umgestellt (EIN Suchweg, §5 — beide teilen jetzt dieselbe Auswahl-Logik). Wrap-Verhalten (ArrowDown/Up), Enter-Puffer, Reset-bei-neuer-Query unverändert.
- **A9-Test (#210) NICHT geändert** — der Query-Reset bleibt als belt-and-suspenders bestehen und grün; die Race ist jetzt auch ohne Reset geschlossen.

**Beweis:** Neuer deterministischer Repro/Regression-Test `src/tests/suche/trefferAuswahl.test.ts` (bildet «Pfeil runter → Gruppe wächst ein → Enter ⇒ Ziel UNVERÄNDERT» ab; eingebauter Positions-Resolver zeigt rot, Key-Resolver grün). Volle vitest-Suite **3792 grün**; `norm-sprung`+`suche-seite`+`tastatur` **10×/10 grün** unter CI-Drossel (rate 4, retries 2 — #210-Methode); A9 unter CI-Drossel 3/3 (lokal rate 6 pre-existing host-contention-flaky, unberührt von diesem Fix). **golden:vergleich IDENTISCH** (209 byte-gleich), SSR-Smoke grün, lint 0 Errors (2 pre-existing warnings fremde Datei), build 63 Routen. **Gegenprüfung n/a** (reines UI/Navigation, kein Rechnen/Extraktion/Norm-Tarif-Risikopfad). Trailer `Roadmap: W2·10-UI-NAV`. PR mit armiertem Auto-Merge.

## Session 12.7.2026 — V2·K-1 (A22·K-1): «in Kraft seit» im Gesetzes-Kopf (Ur-Inkrafttreten, Datenteil F2, Worktree `lm-v2-k1`, Branch `feat/v2-k1`)

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F2 K-1 · UX §10.8 A22).** Bau-Go = Davids General-Delegation 11.7. «du hast bei allem was ich entscheiden muss selbst die wahl» → Orchestrator-Entscheid: bauen. **Skills:** `scraping-swiss-official-sources` + `gegenpruefung` (Datenteil = Risiko-Pfad-nah).

**Kern-Befund (§7 empirisch geprobt):** Das Ur-Inkrafttreten steht als **`jolux:dateEntryInForce` am ABSTRACT-ELI (cc)** des Erlasses — EIN kanonischer Wert (OR/ZGB 1912-01-01, BV 2000-01-01, nDSG 2023-09-01, AHVG 1948-01-01, SchKG 1892-01-01, alle famos-amtlich). **Falle vermieden:** die früheste `dateEntryInForce` der Paket-5-Revisionen ist NICHT das Ur-Inkrafttreten (listet über die SR-Taxonomie auch Vorgänger-Erlasse; ADOV → 1973er Vorläufer-Verordnung) — Auftrags-Warnung empirisch bestätigt.

**Gebaut (pathspec, Muster U-PDF #189 build-time, KEINE Client-SPARQL):**
- **Generator** `scripts/normtext/inkrafttreten-generieren.ts` (`gen:inkrafttreten`) → Sidecar `public/normtext/inkrafttreten.json` ({key:{datum,quelle:'fedlex'}}). Konservativ (§7/§8): nur bei GENAU EINEM Datum je Abstract; null/mehrdeutig ⇒ weggelassen. **227/227 Bund** (0 mehrdeutig, 0 fehlend).
- **Projektion** `browse-manifest.ts`: `inkrafttreten.json` → `BrowseErlass.inkraftSeit` (synchron am Erlass ⇒ CLS 0). Typ in `browse-typen.ts`.
- **Render** `ErlassLeserKopf.tsx`: «in Kraft seit …» nach «Stand» in der Meta-Zeile; «vom …» (Ingress) NICHT gedoppelt.
- **Kanton bewusst weggelassen (§8):** LexWork trägt kein strukturelles Ur-Inkrafttreten (`enactment`=Beschluss, `version_dates_str`=Stand) — abgeleitet wäre es falsch oder Stand-Dublette.
- **Gegated:** `inkrafttreten.test.ts` (9 Tests: Erhebe-Logik/Konservatismus/Sidecar+Projektions-Integrität/Coverage-Boden) · e2e `leser-kopf-v2` K-1 (BGBM «in Kraft seit 01.07.1996»).
- **Golden-Klasse: Engine-Golden byte-gleich** (`golden:vergleich` IDENTISCH 209); register.json + daten-manifest additiv (`inkraftSeit`), `check:paritaet` grün (Feld überlebt DB-Projektion).

**Gegenprüfung (unabhängiger Opus-Sub-Agent, frischer Kontext, gegen Fedlex-SPARQL+HTML):** Stichprobe 9 inkl. SchKG (Alt <1900) + FZA/LugÜ (Staatsverträge) — Verdikt siehe Commit-Trailer. **TABU eingehalten:** kein Eingriff in InhaltsKopf/LeserAnsichtMenu (#198), keine Such-/Design-Token-/Fussnoten-Extraktions-Dateien (FN-3 parallel). Trailer `Roadmap: W2·5d`.

## Session 11.7.2026 — QS-PERF: zwei CI-instabile e2e-Specs gehärtet (Worktree `lm-e2e-haertung`, Branch `fix/e2e-ci-haertung`)

**Auftrag (QS-PERF):** `e2e/norm-sprung.e2e.ts` + `e2e/gesetze-ux-g3a.e2e.ts` scheiterten seit dem V2-Merge auf fast jedem PR im 2-Kern-CI-Runner (Symptome `getByText('Sprung')`-12s-Timeout, `toBeVisible`-Timeouts, vereinzelt CLS), lokal grün. Nur Test-Dateien anfassen (useUniversalSuche-Fläche = Parallel-Agent), keine Schwelle aufweichen (A9-SINN).

**Fail LOKAL reproduziert:** dist gebaut, 40 CPU-Busy-Loops als Ballast (loadavg ~45–50 auf 10 Kernen) + `nice -19` + `CI=1 --workers=1 --retries=0 --repeat-each=3`. Bei repeat-2 fiel **norm-sprung A9** (`toHaveURL` 15s) — Enter landete 8×/8 auf **`SCHKG#art-257` statt `OR#art-257_d`**. Kein reiner Timeout, sondern eine RACE.

**Wurzeln:**
- **norm-sprung A9** (Produkt-Race, aber test-only geheilt): `HeaderSuche.tsx` führt `aktivIndex` als POSITIONS-Index in die per `flatMap` gebaute Trefferliste. Die per `useDeferredValue` (#183/§15.3) entkoppelte ~4-MB-Artikelgruppe landet «einen Tick später» → unter Drossel zeigt der pfeil-gesetzte Index auf einen nachträglich eingeschobenen Artikel-Treffer. **Fix (Test):** nach dem Reaktivitäts-Beweis (aria-activedescendant) die Query zurücksetzen (leeren→neu) ⇒ `aktivIndex`=-1 ⇒ Enter nimmt deterministisch den Norm-Sprung (exakt der A5/P3-Kontrakt). Alle drei scharfen Throttle-Beweise (tippen · navigieren · springen + CLS<0.05) bleiben. Keine Timeout-/Schwellen-Aufweichung. Die eigentliche Reorder-Korrektheit gehört der useUniversalSuche-Fläche (Parallel-Agent) — hier nur test-seitig entschärft.
- **gesetze-ux-g3a** (§194-Muster, Fixture): «Kopf-Label OR» lud das 935-KB-OR, «U-LINIEN ZGB» das 606-KB-ZGB → beide 16–19s nahe der 20-s-`warteReader`-Latte, starvten den Runner. **Fix:** Umzug auf semantik-gleiche Klein-Fixtures — Kopf-Label «Bundesgesetz» auf **ELG** (~50 KB), tiefe-Kodifikation-ruhig auf **BUEG** (~34 KB, `strukturTiefe` 3 = dieselbe `autoGuide=false`-Klasse). ZGB/OR bleiben als Referenz-Verdikte im `check:linien-kanon`-Tor über den vollen Korpus gegated.

**Stabilitäts-Beweis:** beide Specs **10×** (170/170) unter Ballast + `--workers=1 --retries=0 --repeat-each=10` GRÜN (7 min); zuvor unter identischen Bedingungen roter SCHKG-Fail. gesetze-ux-g3a 46s→5s (Giant-Load weg). Voller `npm run gate` grün bis auf fremd-vorbestehendes `check:p-klassen`/`check:vollstaendigkeit` (Normtext-Daten, nicht CI-gated, auch auf pristine main rot) — nur Test-Dateien berührt, golden 209 byte-gleich. Gegenprüfung n/a (Test-Infrastruktur). Trailer `Roadmap: QS-PERF`.

## Session 11.7.2026 — DESIGN D-0 «Mess-Fundament `check:farbwelt`» (Worktree `lm-design-d0`, Branch `feat/design-d0-farbwelt`)

**Auftrag (David «direkt umsetzen wenn plan vorliegt»):** Einheit D-0 aus `FAHRPLAN-DESIGN-WAERME.md` (ROADMAP W2·11-DESIGN) — das harte Farbwelt-Mess-Tor VOR jeder Wert-Änderung (E5 «Messung vor Geschmack»). Reine Prüf-Infrastruktur (golden-neutral, kein Runtime).

**Gebaut:** `scripts/check-farbwelt.ts` (deterministisch §2, culori + apca-w3 als devDep). Parst `:root`+`html.dark`-Token aus `src/index.css` (eigener var()/`color-mix(in srgb|oklab)`/transparent-Resolver mit premultiplizierter Alpha) gegen `tailwind.config.js` (No-op-Wächter F7). Misst:
- **40 WCAG-Pflichtpaare hell+dunkel** (harter FAIL): Text ≥4.5, Nicht-Text/Zustände ≥3 — aus den dokumentierten CSS-Kommentar-Paaren (ink-600/500, placeholder, brass-700/800, Status-Badge-Text, --focus-Ring, lc-akzent-*).
- **6 Referenzwerte C-1/C-2/C-3 (§4b-B)** + 2 --paper-Fixpunkte (harter FAIL bei Drift, D3/F6): slate 4.81/3.47 · warn 5.24/9.43 · brass 4.91/10.48 (auf --well).
- **Flächen-L-Leiter** well<paper<surface<raised je Modus (harter FAIL, OKLCH). Hue-Drift/L-Monotonie/Chroma-Dämpfung = **Erstlauf-WARNUNG** (D-4/D-5-Sollwerte offen). **APCA nur beratend** (Lc), nie Fail.
- **Bekannte Risse als Baseline-Guard** (WARNUNG + FAIL nur bei Verschlechterung): `ink-500/well` hell 4.48 (D-4) · `danger-500/paper` dunkel 2.72 (D-1.3). → **D-1-Input**.

**Verdrahtung:** `check:farbwelt` in `check:seriell` (nach check:design-tokens) → automatisch in `check-parallel`+`gate`. **NICHT** in `.github/workflows` (TABU; CI-Aufnahme prüft Orchestrator).

**Verifikation:** Tor auf IST-Stand GRÜN (0 harte Verstösse, 9 beratende Warnungen). Negativ-Test: `--ink-600` transient auf zu hell → 3 harte WCAG-Fails, Exit 1; revert byte-gleich → grün. tsc/vitest/golden/lint grün. `gate voll` rote Glieder `check:p-klassen`+`check:vollstaendigkeit` sind **pre-existing auf origin/main** (Normtext-Daten, verifiziert ohne meine Änderung) — orthogonal zu D-0.

**Offen:** FAHRPLAN-DESIGN-WAERME.md liegt noch auf PR #208 (nicht auf main) → D-0-✅-Markierung durch Orchestrator nach #208-Merge (kein Copy in diesen Branch, sonst Konflikt).

## Session 12.7.2026 — UI-NAV S4+S5 «Ranking + /suche» (Worktree `lm-uinav-s45`, Branch `feat/uinav-s4-s5`)

**Fahrplan:** `FAHRPLAN-UI-NAVIGATION.md` §2 (ROADMAP W2·10-UI-NAV), Einheiten S4+S5. **David-Gate (S5) AUFGEHOBEN** (David 11.7. im Chat: «du hast bei allem was ich entscheiden muss selbst die wahl» → Orchestrator-Entscheid bauen). **S4 (Artikel-Ranking, #40):** FlexSearch liefert nur noch den Recall; die Reihenfolge bestimmt eine reine, deterministische Relevanz-Schicht `src/lib/suche/artikelRanking.ts` (§2). Der Such-Index (`scripts/such-index-generieren.ts`) bekommt drei Felder aus dem bestehenden `public/normtext/struktur/bund`-Sidecar (K10, KEIN Zweit-Index): m=primäre Marginalie (Hauptthema), n=nachrangige Marginalie, g=Gliederungs-Titel. **Drei topische Stufen** (Hauptthema = primäre Marginalie ODER Titel → Nebenerwähnung = nur tiefere Marginalie → reiner Texttreffer), innerhalb Kernerlass ↑ + Artikelnummer ↑ (definitorischer Eröffnungsartikel zuerst → «253 ff.»). Synonyme (`such-vokabular.json`) tragen Recall+Textfrequenz, NICHT die topische Ordnung (sonst hübe «Mietzins» OR 257 über OR 253). **Query-Testset = GATE** (`src/tests/suche/rankingTestset.test.ts`, gegen echten Bund-Korpus via `baueBundIndex`+FlexSearch, Vorher/Nachher-Metrik geloggt + «nie schlechter als roh»): «Miete»→OR 253 (— → 1), «Verjährung»→OR 60/127 (— → 1/3), «Kündigung»→OR 271 (26 → 1), «Werkvertrag»→OR 363 (2 → 1), «Bürgschaft»→OR 492 (1, kein Regress). **S5 (/suche-Seite):** neue Route `/suche?q=` (prerenderte Shell `src/pages/Suche.tsx` via `seo.ts` STATISCHE_SEITEN, ERWARTETE_ROUTEN 62→63; client-gefüllte Treffer) zeigt alle Gruppen **ungekappt** — bes. die Gesetzestext-Gruppe (34/40 Treffer waren im Dropdown strukturell unerreichbar, §8). Additiv, **A5-Enter-Semantik unberührt** (kein Palette-Revival). `artikelGruppe` bekommt endlich `mehrHref` (/suche?q=); `useUniversalSuche(q, {artikelLimit, kappung})` — Default = Dropdown unverändert. Inhaltstyp-Facette (Etappe 2, ehrlich+lokal; Masse-Counts folgen mit E3, §8), role=group-Landmarken (`sektionsRollen` an `SuchResultate`), Deep-Link `?q=` stabil, CLS über festen Kopf/Feld. **O1-«Suchanfragen-Verlauf» hängt laut Plan an O1** (eigene Einheit), NICHT S5 → nicht mitgebaut; Landeplatz existiert nun. **Tore:** `gate:schnell` (tsc·vitest 3777·golden byte-gleich) GRÜN; voller `gate` grün bis auf 2 **Fremd-Röten** (`check:p-klassen` P3-Drop `man-space-before-0` + `check:vollstaendigkeit` — beide normtext/scripts/normtext, vorbestehend, von diesem Diff nicht berührt); Build alle 63 Routen prerendert inkl. /suche. **e2e:** `suche-seite.e2e.ts` 5/5 + `norm-sprung.e2e` (A9-DoD) + `a11y.e2e` inkl. neuem /suche-Prüfpunkt — alle isoliert grün (Sammel-Läufe zeigten nur Maschinen-Last-Flakes). Gegenprüfung n/a (keine Risiko-/Daten-Pfade; nur `struktur/bund` gelesen, nicht geschrieben). PRs siehe unten. Trailer `Roadmap: W2·10-UI-NAV`.

## Session 11.7.2026 — UI-NAV O1 «Verlauf-Initiative» (Worktree `lm-uinav-o1`, Branch `feat/uinav-o1-verlauf`)

**Auftrag (David-Go «run till dry»):** Einheit O1 aus `FAHRPLAN-UI-NAVIGATION.md` §5 — den lokalen Verlauf ausweiten und global zugänglich machen. Reines UI, EINE Verlauf-Quelle (§5).

**Vintage-Re-Audit (§0.1):** Tracking von Gesetz/Entscheid war schon gebaut (`INHALT_ITEM` deckte sie bereits) — Spec-Engpass «trackt nur Rechner/Vorlagen» überholt. Delta gebaut:
- **Store (`zuletztVerwendet.ts`):** `typ`-Diskriminator je Eintrag (Typ-Icon) + `typVonRoute` + Alt-Eintrags-Migration; `ZULETZT_EVENT` (reaktiv) + `leereZuletzt`; Kappung 6→**12** (Topbar-Verlauf; deklarierte Änderung §6.3, Test nachgezogen).
- **Tracking Materialien** ergänzt (`ZuletztTracker`-Regex + `verlaufLabel`/`zuletztTitel` Material-Auflösung).
- **⌘K-Leerzustand** (`SucheLeerzustand`): bei Fokus/leerem Feld Zuletzt-Liste (5) + 5 kuratierte Rubrik-Einstiege; nur auf Fokus → keine Prerender-Divergenz, CLS-frei. `HeaderSuche` öffnet jetzt auch leer.
- **Topbar-«Verlauf»** (`VerlaufUebersicht` + `VerlaufIcon` + `verlaufGruppen.ts`): Uhr-Trigger + Dialog-Flyout (Muster ReiterUebersicht), heute/gestern/früher, Typ-Icons, §8 «Nur auf diesem Gerät» + «Verlauf leeren». Reaktiver `useZuletzt` (§15.2: Initial [leer] gepinnt, Sync nach Mount).

**Verifikation:** tsc · vitest **3764** (+ neue verlaufGruppen/typ/material-Tests) · golden **209 byte-gleich** · lint (0 err; 2 Warns fremd in inhalt.tsx) · **gegenpruefung n/a** (keine Risiko-Datei). Neue e2e `verlauf-o1` (Leerzustand-Recents + Topbar-Verlauf) grün; **norm-sprung/a11y/smoke 58/58 grün** (A9-DoD). **Fremd-vorbestehend rot, unberührt:** `check:p-klassen` + `check:vollstaendigkeit` (Normtext-Daten). **Ausgelassen (deklariert):** Suchanfragen-Verlauf — Route-keyed Store (§5) ≠ Query-Historie, Landeplatz `/suche` ist David-gegatet (S5). Trailer `Roadmap: W2·10-UI-NAV`.

## Session 11.7.2026 — UI-NAV S2+S3 «Suche-Kern» (Worktree `lm-uinav-s23`, Branch `feat/uinav-s2-s3`)

**Fahrplan:** `FAHRPLAN-UI-NAVIGATION.md` §2 (ROADMAP W2·10-UI-NAV), Einheiten S2+S3. **S2 (BGE-Direktsprung + Kompaktform + FR/IT-Aliasse):** neuer deterministischer BGE-Parser `src/lib/suche/bgeQuery.ts` (§2 rein, Unit-Tests inkl. Negativ) als sprungGruppe-Analogon vor allen Gruppen: «BGE 152 I 65»/«152 II 19»/ATF/DTF → interner Direkt-Sprung wenn im Bestand (`bgeReferenz`-Lookup, KEIN Zweit-Index/K10); **§8-Kern:** nicht im Bestand → ehrliche Zeile + amtlicher `search.bger.ch`-CLIR-Permalink (identisch zum Snapshot-`quelleUrl`) statt stillem Rauschen. `normQuery.ts`: Kompaktform «or257d» (Fallback-Auftrennung nach gescheiterter Ganz-Auflösung — «ArGV1» bleibt Kürzel, Ambiguität gewahrt) + FR/IT-Aliasse (CO→OR/CC→ZGB/CP→StGB/CPC→ZPO/LP→SchKG). **S3 (Dropdown-Ehrlichkeit):** Enter-Puffer (#52, Header+Hero, deferred set-state), «Meinten Sie …?» (#44, Levenshtein `vorschlag.ts` §2 gegen Katalog+Kürzel+Vokabular), §8-Zähler «mindestens N … wird noch durchsucht» (#5) + Mindesthöhen-Platzhalter (#48), Snippet zweizeilig+`<mark>`-Highlight & redundanter Typ-Chip mobil aus (#56), **E1 Korpus-Offenlegung** (Fusszeile «Durchsucht: N Bund-Erlasse Volltext · N BGE · kantonal nur Titel» + neue Seite `/abdeckung` «Was ist drin», aus Registern; +1 Route → ERWARTETE_ROUTEN 61→62). E2 Online-Degradieren per Code verifiziert. **Tore:** `gate` grün bis auf 2 **Fremd-Röten** (`check:p-klassen` P3-Drop-Klasse `man-space-before-0` + `check:vollstaendigkeit` Bund-Snapshots — beide normtext, vorbestehend, von diesem Diff nicht berührt); tsc/vitest/golden/lint grün, golden byte-gleich; **norm-sprung.e2e 10/10 (A9-DoD grün)** + BGE/Disclosure-Fälle ergänzt. Gegenprüfung n/a (keine Risiko-/Daten-Pfade). PRs siehe unten. Trailer `Roadmap: W2·10-UI-NAV`.

## Session 11.7.2026 — V1 «Artikel↔Werkzeug-Map» (W2·10-UI-NAV, beide Richtungen, EINE Datenstruktur), Worktree `lm-uinav-v1`, Branch `feat/uinav-v1`

**Auftrag (Spec `FAHRPLAN-UI-NAVIGATION.md` §3 V1; Go David «run till dry»).** Die Erlass-granulare `ERLASS_WERKZEUGE`-Brücke erzeugte beide Symptome des Befunds #28+#38: ZGB→Erbrecht-Rauschen unter BGE 152 I 65 UND kein Rechner-Hinweis an Art. 127 OR. **Gebaut (pathspec, 5 Dateien):** (1) **`ARTIKEL_WERKZEUGE`** in `src/lib/normtext/werkzeuge.ts` — EINE artikel-scharfe Map (§5) mit **60 Kanten über 10 Erlasse** (OR/ZGB/ZPO/SchKG/StGB/StPO/BGG/DBG/AHVG/DSG), je Kante Artikel-Bereich `von`/`bis` (Sub-Artikel 335c ⊂ 335 via Hauptnummer) + **fachlicher Norm-Beleg** (§7); **Zweifelsfälle bewusst ausgelassen + im Code ausgewiesen** (§8: 13. Monatslohn kein OR-Artikel, Schadenszins-Anker umstritten, Werkvertrags-Mängelrecht ≠ Kauf-Gewährleistungsrechner, AIG-Fristen verstreut). Resolver `werkzeugeFuerArtikel` / `werkzeugeFuerZitate` (via `bundSnapshotRef`, §5-Wiederverwendung) / `artikelWerkzeugGruppen`; geteilter `aufloeseWerkzeuge` (istVerfuegbar+href, §8 kein toter Link) — `werkzeugeFuerNorm`-Verhalten unverändert. (2) **Richtung Entscheid** — `kontextSync` neue optionale `artikelZitate`; `EntscheidLeser` übergibt `snap.zitierteNormen` ⇒ «Passende Werkzeuge» artikelscharf: **BGE 152 I 65 von 7 groben Werkzeugen (inkl. Erbrecht/Testament/Vorsorge) auf 0** (Art. 448 ZGB=Erwachsenenschutz, Art. 321 StGB=Berufsgeheimnis — nichts passt, Gruppe entfällt ehrlich). (3) **Richtung Artikel** — neue KontextPanel-Gruppe «Werkzeuge zu einzelnen Artikeln» im Gesetz-Reader (ersetzt dort die grobe Erlass-Liste): OR zeigt 15 Zeilen, u. a. **Art. 127–142 → Verjährungsrechner**; Beleg als `title`. **Verifikation:** golden `IDENTISCH` (209 byte-gleich, alles runtime); tsc·lint·**3638 Unit-Tests** grün (+8 neue Map-Tests: Karten-IDs existieren, Erlass-Keys im Register, Bereiche gültig, keine Werkzeug-Doppel-Überlappung, Prüfpunkte Art. 127 OR/335_c/BGE-152-I-65-Zitatsatz); Visual-Beweis Playwright beide Richtungen (OR-Reader Gruppe + BGE-Fuss ohne Rauschen). Voller `gate` grün ausser den **zwei fremd-vorbestehenden Röten** `check:p-klassen` (`man-space-before-0`/entg) + `check:vollstaendigkeit` (Kanton-Snapshots) — Daten-Strang, von diesem Diff unberührt. **Gegenprüfung Opus BESTANDEN** (unabhängiger Sub-Agent, 30 Kanten inkl. 6 Schlüssel-Kanten gegen geltende Fedlex-Konsolidierungen via SPARQL `dateApplicability` ≤ 11.7.2026; beide KEIN-Werkzeug-Annahmen bestätigt; 2 Beleg-Präzisierungen eingearbeitet: OR 324a/b benannt, DSG-30-Tage-Frist=Art. 18 DSV) + Quittung `gegenpruefung:ok`. FAHRPLAN V1 ✅. Trailer `Roadmap: W2·10-UI-NAV`. PR mit armiertem Auto-Merge.

## Session 11.7.2026 — V2·C-3 (A25/C-3): Farb-Wörterbuch ABSCHLUSS — Materialien-Familie sage + NormChip-Verweisfarbe (W2·5d, reines UI), Worktree `lm-v2-c3`

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F5 C-3 · Z.66; Bau-Go David «go zu allem», §3 Ziff. 3 «Materialien=sage (erst mit C-3)» gilt mangels Einwand).** Letzte Farb-Einheit, gleiche Doktrin wie C-1/C-2 (Farbe nur Referenzschicht, Normtext-Körper farbfrei, §4b-B) — **das Farb-Wörterbuch ist damit KOMPLETT** (brass=Norm/Verweis · slate=Entscheid · warn=Vorbehalt · sage=Materialien+Currency-geltend). **Precheck:** Deferral-Grund weg (U-VERWEIS #170 gemergt; C-1 #174 / C-2 #201 live); Basis c0a288f5 = aktueller main; TABU-Flächen (InhaltsKopf/LeserAnsichtMenu #198, Linien-Dateien #199, scripts/**, workflows) unberührt. **Änderungen (pathspec):** (1) **Materialien-Familie = sage** — neue Utility `lc-punkt-material` (index.css, sage-500, in `html.dark` bewusst nicht überschrieben) + `punkt`-Prop (`'norm'|'entscheid'|'material'`) an `KontextGruppe`: Familien-Punkt vor dem Gruppentitel, `aria-hidden` (Farbe nie allein tragend §13/F2), ohne Prop KEIN Punkt (Werkzeuge/Revisionen neutral). Call-Sites: `KontextPanel` (Botschaften/Vernehmlassungen/Amtliche Materialien=material · Erlasse=norm · Entscheide=entscheid), `VerweisKontext` (Entscheide/Materialien), `EntscheidVerzahnung` (Zitierte Normen=norm / Zitierte Entscheide=entscheid). (2) **NormChip-Verweisfarbe** — `CHIP_LINK_CLASS` + `hover:border-brass-400`: der NormChip war der EINZIGE Norm-Chip ohne den brass-Hover-Border (KantenChip 'norm', rechtsprechung/NormChip, MassgebendeGesetze tragen ihn alle) → EINE brass-Hover-Anatomie; `normLinkSsr.test`-Assertions deklariert nachgezogen (§6.3). **Kontrast als Gate gemessen** (Playwright, Light+Dark, Desktop 1440 + Mobil 390, auf `--paper`): sage-Punkt **4.48/3.84** · slate-Punkt **5.21/3.31** · brass-600-Punkt **3.71/11.74** — alle ≥3:1 (WCAG 1.4.11). **Visual** DSG Art. 24 / DBG Art. 65 / MWSTG je 4 Achsen (12 Kombos): Punkte korrekt je Familie, kein Overflow @390, kein Layout-Shift; **CLS 0** (Punkt inline im Gruppen-h3, mountet MIT der Gruppe — kein separater async-Mount; Chip-Änderung hover-only). **Tore:** voller `npm run gate` grün ausser den **zwei fremd-vorbestehenden main-Röten** `check:p-klassen` + `check:vollstaendigkeit` (per `git stash` auf clean base identisch rot verifiziert — Daten-Strang, nicht C-3); tsc·vitest·golden:vergleich **IDENTISCH** (209 Fälle)·lint 0 Errors (1 fremd-vorbestehende Warning inhalt.tsx:716, Datei nicht berührt). **Gegenprüfung n/a** (reines UI, kein Risiko-Pfad). Neuer Test `v2-c3-farbwoerterbuch.test` (Familien-Punkt je Kategorie · Fremdfamilien-Ausschluss · neutral ohne Prop · NormChip-brass-Hover). **§7-Befund offengelegt:** die Fahrplan-Annahme «0 lc-chip im prerenderten HTML» stimmt für Rechner-/Vorlagen-Routen NICHT (NormChip prerendert, z. B. 5× betreibungskosten.html) — unschädlich (Prerender je Deploy neu, Hydration konsistent), als falsche Prognose im Fahrplan ausgewiesen. §4b-B als Abschluss nachgezogen (sage-Zeile + C-3-Block + Einordnungs-Regel für künftige Farbträger); ROADMAP A25 komplett (C-1/C-2/C-3 ✅). Trailer `Roadmap: W2·5d`. PR mit armiertem Auto-Merge.

## Session 11.7.2026 — UI-Navigation N0 Quick-Win-Paket (Worktree `lm-uinav-n0`, Branch `feat/uinav-n0-quickwins`, Roadmap W2·10-UI-NAV)

**Auftrag (David-Go «run till dry», Quelle Ultracode-Recherche 11.7.):** Einheit **N0** aus `FAHRPLAN-UI-NAVIGATION.md` — NUR N0, je Quick-Win ein Pathspec-Commit mit empirischem Vorher/Nachher-Beweis (Playwright Desktop+Mobil@390). TABU: InhaltsKopf/LeserAnsichtMenu (#198), NormChip/Materialien-Chips (C-3 aktiv), scripts/normtext, workflows.

**Gebaut (je eigener Commit):**
- **N0a Tote Rückwege:** Footer «Rechner & Vorlagen»→«/» zu zwei ehrlichen Zielen (/rechner·/vorlagen); RechnerKopf «Übersicht»/«Katalog»→«/» auf /rechner + Label angeglichen («Alle Rechner»/«Rechner»), Crumb-Tap ≥24px; Wizard-«Zurück zum Katalog»-Default→/vorlagen (+4 Aufrufer).
- **N0b Erlass-Key case-insensitiv + Fehlseite:** Redirect `/gesetze/bund/or`→`/OR` (eindeutiger Case-Treffer); neue `FehlSeite.tsx` (angefragter Key + Fuzzy-Vorschläge via `norm()`+Levenshtein «Meinten Sie OR?» + eingebettetes Erlass-Suchfeld); `norm()` aus `normQuery` exportiert.
- **N0c Anker-Landung:** `.nt-anker scroll-margin-top` von 80px auf reale Sticky-Höhe via `--nt-stick` (Muster `--rsp-stick`); Reader setzt inline (Einzel `calc(4rem+2.25rem+3rem)` / Pane 3.5rem). Ziel-Artikel vorher 58px hinter Leiste, nachher voll sichtbar.
- **N0d Kleinposten:** W5 Ergebnis-FAB per IntersectionObserver ausblenden · W4 lokaler Rechner-Filter (kartePasst, Accordions offen, Leerkopf-Guards) · W1 Streitwert-Leerzustand-Platzhalter (min-h-40, C2) · W3 touch-Popover-Legende «Entwurf» am Katalog-Kopf (Begriff.tsx-Muster; **Abweichung deklariert:** am Kopf statt Inline-Badge wegen `<button>`-in-`<Link>`) · J5 Entscheid-Tab spiegelt `?ansicht=` (replaceState) + scrollt hoch · O3 «In neuem Reiter»-Toast (überlebt ?r-Soft-Nav) + ☰-Tooltip «Reiter & Split-View».

**Verifikation:** je Quick-Win Playwright-Beweis (Desktop+Mobil@390). Tore: **tsc · vitest 3701 · golden `IDENTISCH` byte-gleich · lint** grün; `check` 26/28 Sub-Checks grün; **fremd-vorbestehend rot: `check:p-klassen` + `check:vollstaendigkeit`** (Normtext-Daten, vom reinen UI-Diff unberührt — ausgewiesen, nicht gefixt). Build: alle 61 Routen prerendert. **W4-Test** (`/rechner` «kein Suchfeld») auf das neue Filterfeld gezogen (§6.3 deklariert). Gegenprüfung **n/a** (reines UI/Routing). Trailer `Roadmap: W2·10-UI-NAV`.

## Session 11.7.2026 — A26: «Ansicht»-Dropdown in die immer sichtbare Positionsleiste + Fussnoten-Auswahl ins Menü (Worktree `lm-sticky-ansicht`, Branch `feat/ansicht-sticky-leiste`)

**Auftrag (David 11.7., Chat, reines UI):** «ansichtsdropdown menu in … diese leiste integrieren `Gesetze › Bund › ZPO … Stand … ✕` … immer sichtbar wenn man im gesetz ist» + «fussnotenauswahl ebenfalls in dropdownmenu einfügen». Wortlaut persistiert `docs/ux-audit-2026-07/ANMERKUNGEN-DAVID-2026-07-11.md`, eingeordnet als **A26** in `FAHRPLAN-GESETZES-UX.md §10.8`.

**Präzisierung (im Bau bestätigt):** Davids «Leiste» = der **Inhalts-Kopf** (`InhaltsKopf.tsx`, sticky `top-16`), NICHT der 2-Spalten-`SektionKontextKopf` (den die Orchestrator-Erstlesart nannte) — nur der Inhalts-Kopf ist in JEDER Layout-Variante (Desktop 1-/2-spaltig, Mobil, flache Liste) immer sichtbar; der `SektionKontextKopf` rendert nur im ≥1024px-2-Spalten-Lesemodus.

**Gebaut:**
- (1) «Ansicht»-Dropdown aus dem weggescrollenden `ErlassLeserKopf` in den Inhalts-Kopf verlegt — Kanal: `KopfDaten.ansichtSlot` (ReactNode) über den vorhandenen `meldeInhaltsKopf`-Kontext; der Reader baut `<LeserAnsichtMenu>`, der Layout-Kopf rendert es opak (keine Reader-Interna in `components/layout`). Der globale `leserOptionen`-Store bleibt EINE Quelle (§5). Meld-Effekt unter `linien`/`fussnotenAnzahl` verschoben (TDZ).
- (2) Fussnoten-Chip (V2·K-2) als **Eintrag** ins Dropdown gefaltet: `Fussnoten`-Schalter trägt Zähler N (Badge + Accessible-Name «Fussnoten (N)»); Chip-Sprung-zum-Apparat bewusst entfernt (Menü jetzt dauerhaft erreichbar → Klick von überall, Sprung wäre desorientierend). `LeserFussnotenChip` gelöscht (aufgeräumt).
- **Platzierung:** Einzelansicht NUR Inhalts-Kopf (aus `ErlassLeserKopf` entfernt); Split-View (`imPane`) bleibt im `ErlassLeserKopf` (kein `PaneKopf`-Umbau/Stacking-Risiko), nie zwei Menüs gleichzeitig. **Mobil @390:** Icon-only-Trigger (◧, `aria-label="Ansicht"`, Wort erst ≥sm); Panel `absolute` (CLS 0), Inhalts-Kopf `z-10→z-30` (Panel über Inhalts-Sticky-Leisten Suche z-16 / Kontextkopf z-15).

**Verifikation:** tsc + lint grün; **golden IDENTISCH** (Reader-Chrome ausserhalb Golden-Scope; 209 byte-gleich); e2e `leser-kopf-g2b`/`-v2`(K-2 neu)/`-a9`(Throttle, CLS 0)/`leser-optionen`/`a11y`(axe)/`tastatur`/`smoke`@390 **alle grün** (Dropdown-Ort + Fussnoten-Eintrag deklariert nachgezogen); Visual Desktop+Mobil@390 Light+Dark. **Gegenprüfung n/a** (reines UI). **Vorbestand:** `check:p-klassen`/`check:vollstaendigkeit` sind auf origin/main (Commit `38e1300c`) ROT (normtext-Corpus-Drop-Klasse `man-space-before-0` — P3-Kalibrierung/Fedlex-Pin), unabhängig von diesem UI-Diff (6 Dateien: 4 TSX/TS + 2 e2e). Trailer `Roadmap: W2·5d`.

## Session 11.7.2026 — Revisionen-Reconciliation Staatsverträge (Paket 5 Nachzug, Worktree `lm-rev-recon`, Branch `fix/revisionen-staatsvertraege`)

**Anlass:** Der Staatsverträge-Merge #186 fügte 9 Bund-Snapshots (SR 0.*) hinzu, ohne die Paket-5-Revisions-Sidecars nachzuziehen → `check:revisionen` auf main ROT (227 Bund-Erlasse vs. 218 Sidecars; Coverage-Drift Grundmenge↔Dateien). **Reconciliation:** Generator `normtext:revisionen` für die 9 (HKsÜ, HUVÜ, EAUe, CMR, Montrealer Übk., RBÜ, UNO-BRK, Istanbul-Konv., Apostille-Übk.) → 9 Sidecars + store-raw. **Befund 1:** SR-0.*-Verträge tragen im Fedlex-Graphen sehr wohl `eli/oc`-Änderungserlasse (Ratifikations-/Geltungsbereichs-Änderungen unter der SR-Taxonomie) — **82 Änderungs-Einträge** (alle 9 mit ≥1; keine Ausnahme/Leerzustand nötig, §8), 2 Sammelerlass-Marker (EAUe), 0 Botschafts-Joins (Staatsverträge tragen keine Paket-2-Botschaft).

**Befund 2 (Gegenprüfung deckte einen KORPUSWEITEN Treue-Defekt auf → Scope erweitert):** Der Generator fabrizierte `roFundstelle` naiv aus der ELI-Nummer («AS <jahr> <ELI-num>»). Für **Einzel-Segment-ELI VOR der AS-Reform 2019** ist die ELI-Nummer die laufende `sequenceInTheYearOfPublication`, NICHT die AS-Seite → **falsche Fundstelle** (belegt live: `oc/2005/566` ⇒ real AS 2005 4395, nicht «AS 2005 566»). Ursache: der Paket-5-POC prüfte `jolux:historicalId` (leer) und schloss «keine historicalId» — die echte Fundstelle steht unter dem FEDLEX-INTERNEN Prädikat `<http://cogni.internal.system/model#historicalId>`. **Fix:** `fundstelle()` liest jetzt `historicalId` (Einzel-Segment → «AS <jahr> <echte-Seite>»); Multi-Segment-Alt-AS behält die DE-Ableitung (erstes Segment = DE-Seite, historicalId ist dort FR-paginiert); Einzel-Segment seit 2019 behält die Ableitung (Sequenz == Seite). **Da das Netz-Tor die Stichprobe live rebuildet, ist der Fix zwangsläufig korpusweit** → alle 227 Sidecars neu (Diff nur `roFundstelle`/`sha`/`abgerufen`; 0 Einträge hinzu/weg, 0 Datums-Drift). +4 Unit-Tests (`fundstelle`).

**Determinismus:** 2 Läufe byte-identisch; Tor baut aus store-raw neu == committet. **Tore:** `check:revisionen(-netz)` grün (227 Sidecars, 5134 Einträge), `check:paritaet` (227 Revisionen byte-genau aus DB), `check:datenhaltung` (Manifest nachgezogen), voller `npm run gate` grün. **Gegenprüfung BESTANDEN** (unabh. Opus, frischer Kontext, live Fedlex-SPARQL + gerenderte AS-Seiten: Timeline MONTREAL/APOSTILLE/UNO_BRK deckungsgleich; roFundstelle-Fix gegen die amtlichen Werte belegt). Nur Daten/Sidecars, keine UI (KontextPanel #185 rendert sie bereits). Trailer `Roadmap: W2·6`.

## Session 10.7.2026 — Fedlex-Portfolio Paket 4 (Staatsverträge, letztes Paket), Worktree `feat/fedlex-p4-staatsvertraege`

**W2·6 · Trailer `Roadmap: W2·6`.** 9 kuratierte SR-0.*-Staatsverträge neu als Volltext
über die **bestehende konsolidierte `eli/cc`-Pipeline** (kein `eli/treaty`-Extraktor, kein
neues Format/Skript): HKsÜ 96, HUVÜ 1973, EAUe, CMR, Montreal, RBÜ, UNO-BRK, Istanbul,
Apostille (rang 110–118). International-Volltext 18→**27**, Bund 226→**227**.
**POC-Kern:** SPARQL-Graph trägt **keine** strukturierte Vertragsparteien-/Ratifikations-Kante
→ «Geltungsbereich am …»-Anhang verbatim als `annex_*` (deterministisch, §8); **html-0 bei
5/9 stale** (P1-a-Falle) → kanonische html-N via `isExemplifiedBy` gepinnt (HUVÜ=3/EAUe=5/CMR=3/
RBÜ=2/Istanbul=1/Apostille=4); **Apostille geltend 2024-09-04** (Arbiter, nicht 2016er-Shell)
→ Snapshot statt pdf-embed. **5 Kandidaten bewusst verworfen** (ESÜ/WÜD/WÜK/DBA-DE/EPÜ, dokumentiert).
Testimonium «Zu Urkund dessen» (`schlussint`) bewusst als nicht-normative Boilerplate in
`check:p-klassen` verankert. **Betroffen:** `src/lib/fedlex.ts`, `src/lib/normtext/register.ts`,
`scripts/fedlex-cache.sh`, `scripts/normtext/check-p-klassen.ts`, 9 `public/normtext/bund/*.json` +
Sidecars + `register.json`/`currency.json`/grundart-Seed/Klassifikations-JSON, `daten-manifest.json`.
**Tore:** `npm run check` grün ausser vorbestehend-rot `check:plan` (W3·14 verwaist, aus PR #182) +
`check:normtext-netz`-Rest (5 kant. PDFs AR/VD/FR/VS = vorbestehend, nicht dieser Diff); tsc/build grün.
Adversariale **Gegenprüfung (Opus)**: Artikel + `annex_*`-Anhänge/Protokolle vollständig & wortlaut-treu;
**Befund** = Extraktor lässt `<div id="scope">` (Geltungsbereich `scope_*` + Schweizer Vorbehalte `decl_*`)
aus — **pre-existing korpusweit** (18 deployte Verträge droppen byte-identisch, an KRK verifiziert),
kein P4-Regress; Fix = Kern-Extraktor-Ausbau über alle 27 (TABU diese Session) → **backlogged** in
`FAHRPLAN-INTERNATIONAL-VOLLTEXT.md`, volle Fassung über amtlichen Live-Link erreichbar (L0/§8, nicht stumm).
§11: `bibliothek/register/fedlex-staatsvertraege-2026-07-10.md`.
Damit **alle 5 Fedlex-Portfolio-Pakete gebaut**. Push/Deploy = Davids §9-Ja.
## Session 11.7.2026 — W2·5d U-PDF (A12): Download = amtliches PDF der gepinnten Fassung, Worktree `feat/u-pdf-a12`

**FAHRPLAN-GESETZES-UX.md §10 (U-PDF, letzte kollisionsarme A1–A18-Einheit).** Der Reader-Download lädt jetzt das **amtliche PDF der gepinnten Fassung** statt eines render-eigenen `.txt` (§10.5-Verbot behoben; `baueErlassText`/`herunterladen()` entfernt). **Ermittlung build-time** (kein Client-SPARQL): neuer Netz-Generator `scripts/normtext/pdf-quellen-generieren.ts` → Sidecar `public/normtext/pdf-quellen.json`, offline projiziert von `browse-manifest.ts` nach `register.json` (`BrowseErlass.pdfUrl/pdfStand`, synchron ⇒ **CLS 0**). **Bund:** Fedlex-`jolux:isExemplifiedBy` der pdf-a-Manifestation der gepinnten Konsolidierung — **exakte** Filestore-URL gelesen, nicht konstruiert; **Suffix-Falle `-2` gegenstandslos** (Suffix variiert (none)/-1..-5/-12; suffixlos hätte 118/227 die ältere Datei geladen). **227/227 Bund**, **1184/1231 Kanton** (LexWork `pdf_link_tol` nur bei Versions-Gleichstand, 47 ehrlich ohne Aktion, §8), Staatsverträge self-hosted. Ehrliche Beschriftung «Amtliches PDF (Fassung vom …)» (`parts/AmtlichesPdf.tsx`, aria + 24px-Tap-Ziel). **Neues Tor `check:pdf-quellen`** (offline, in `check`/`gate`) bindet jede Bund-URL an den `fedlex-cache.sh`-Pin (kons==Pin==stand) + Projektions-Integrität + Coverage-Floor; **`check:pdf-quellen-netz`** (in `check:netz`) HEAD-prüft auf `application/pdf`. **Gegenprüfung `bestanden`** (unabhängiger Opus-Pass, P5-Stichprobe 12 inkl. Suffix-`-2` AIG/BBG/EMRK, Fassungsdatum-im-PDF gegen `stand`). **Tore:** alle CI-gated Stufen grün (tsc·vitest·lint·build·golden IDENTISCH·smoke·e2e `gesetze-pdf-download`·perf); `check:pdf-quellen`/`check:gegenpruefung` grün. Einziges lokales Rot = VORBESTEHENDES `check:revisionen` (P4 #186: 9 Staatsverträge ohne Paket-5-Sidecar, auf origin/main rot, nicht dieser Diff, nicht CI-gated). register.json + daten-manifest additiv um `pdfUrl/pdfStand`; `check:fedlex-versionen` grün. Trailer `Roadmap: W2·5d`. **Damit A1–A18-Welle gebaut ausser U-POSITION (in CI).**

## Session 10.7.2026 — Fedlex-Portfolio Paket 3 «Vernehmlassungen» (W3·11), Worktree `feat/fedlex-p3-vernehmlassungen`

**POC (RISIKOPFAD, Phase 1 VOR Bau) → MACHBAR.** §7-Quell-Wahl empirisch: der Fedlex-SPARQL-Graph trägt Vernehmlassungen strukturiert über die **direkte** Kante `?cons jolux:foreseenImpactToLegalResource ?cc` (kein oc-Umweg, einfacher als Paket 2). Voll-Lauf 218 SR = **822 Consultations**, 173/218 Erlasse, **1,6 s**. Füllraten status/Titel DE·FR·IT 100 % · Frist 96,6 % · projEli 100 %. Reichweite **2000–2026**. Referenz OR→33·DSG→3·MWSTG→**14** (Plan nannte 4 = überholt; live 2× reproduziert). Rest-POC a–d: (c) `institutionInChargeOfTheEvent` korpusweit LEER → eröffnende-Stelle-Hinweis fallen gelassen, Behörde generisch `BUND`. Beleg `bibliothek/materialien/vernehmlassungen-2026-07-10.md`.

**Bau (POC positiv).** Generator `scripts/materialien/vernehmlassungen-generieren(.ts/-run.ts)` (idempotent fetch→raw→parse→load, --datum, byte-determ.); Daten `src/lib/materialien/vernehmlassungen.generated.ts` (822); Typen `vernehmlassung`-Doktyp/`BUND`-Behörde/`VernehmlassungStatus` (Enum 0–6 amtlich); Merge via bestehendem `ALLE_MATERIALIEN`-Pfad (kein eigener Ingest — Paket 2 hatte ihn schon) → `register.json` (1549 Materialien). UI: «Gesetzgebung in Arbeit» im Norm-Kontext-Bus (`KontextPanel.tsx`, laufend zuerst, «läuft bis {Frist}», DE/FR/IT, §8-Marker, Fehler≠Leer). Currency: Netz-Tor `check:vernehmlassungen-netz` (in `check:netz`) + **Offline-Assertion** `laufend && fristEnde<heute ⇒ rot` in `check:materialien` (gegen echten heutigen Tag). `daten-manifest.json`/`startseiteZaehler` nachgezogen.

**BEWUSST OFFEN:** Laufend-Badge im Reader-Kopf (`src/pages/gesetz-leser/parts.tsx`) — Datei in dieser Einheit TABU (§12 Parallel-Kollision); nachzuziehen wenn frei. Kein Text-Snapshot (P1-Nicht-Ziel).

**Tore:** voller `npm run gate` GRÜN (tsc · vitest 3659 · golden byte-gleich · lint · check inkl. materialien/paritaet/gegenpruefung) + `check:vernehmlassungen-netz` grün. **Gegenprüfung BESTANDEN** (unabhängiger Opus-Adversarial gegen Fedlex-SPARQL: Counts + Einzel-Treue Status/Frist/Titel + Norm-Join-Grobheit VDSG@235.1 + Finding-7-Konsistenz + Enum-Mapping; quittiert, 5 Risiko-Dateien). Trailer `Roadmap: W2·6`.

## Session 10.7.2026 — QS-TOK P1-Rest: check:plan geheilt · T1 STRUKTUR-Rotation mechanisiert · T3 FAHRPLAN-§-Slice-CLI, Worktree `feat/qstok-p1-rest`

**FAHRPLAN-TOKEN-OEKONOMIE.md §3 (T7 ✅ #173, T2 ✅ #172 vorab).** **check:plan-Fix:** `QS-TOK` fehlte in `scripts/plan/inventar.ts` (seit #171) → rötete die gate-Kette für alle Parallel-Agenten; registriert, grün (erster Commit, heilt main). **T1:** `.claude/hooks/struktur-rotieren.py` verschiebt `## Session`-Karten älter ~2 Arbeitstage byte-genau ins Archiv (Anker `<!-- KARTEN -->`; SessionStart nur im sauberen Haupt-Checkout, auto-Commit, sonst No-op — K §3 T1) inkl. **T7-K Teil 2 Re-Akkumulations-Wächter** (weiche SessionStart-Warnung + `--check`-Riegel, NICHT im Required-Gate). Dogfood: 34 Karten ≤6.7. rotiert, STRUKTUR.md 139.4→35.6 KB, Byte-Bilanz belegt (0 Verlust), idempotent; `npm run struktur:rotieren`. **T3:** `npm run fahrplan -- <Datei> <§>` druckt Kopf+§0+Ziel-§ + immer volles ##/###-ToC (9 Unit-Tests, Fixtures beider Stile); GESETZES-UX §10-Slice 60.6 vs. 119.5 KB. **Offen/deklariert:** T16 (CLAUDE.md, separates David-Go, §8.4) liegt bewusst; ROADMAP.md 93.6 KB > T7-DoD ≤~65 KB (Rest-Chronik-Split kollidiert mit Parallel-Schreibern). **Tore:** voller `npm run gate` GRÜN (tsc · vitest · golden · lint · check inkl. geheiltem check:plan). Gegenprüfung n/a (Prüf-/Doku-Infrastruktur). Trailer `Roadmap: QS-TOK`.

## Session 10.7.2026 — Fedlex-Portfolio Paket 2: Botschaften / «Entstehungsgeschichte» (W2·6, Risiko-Pfad Extraktion), Worktree `lm-fedlex-p2`

**Auftrag (Go David 10.7. «go zu allem»; Detailquelle `FAHRPLAN-FEDLEX-PORTFOLIO.md §Paket 2`, Reihenfolge 1→2→5→3→4):** Vorzeige-Paket des Portfolios. **POC zuerst (Finding 5):** SPARQL-Reverse-Kette (SR→Taxonomie→oc→proj→event→Botschaft `resource-type/23`) live verifiziert, DSG→2 reproduziert; korpusweite Füllraten VOR dem Bau gemessen. Ergebnis **401 Botschaften des Bundesrates** über die 218 Bund-Volltext-Erlasse — Datum 100 % · Titel DE/FR/IT je 100 % · Curia 99,8 % · 27 Mantelerlasse · 97/218 Erlasse mit ≥1 Botschaft (Rest = Verordnungen ohne Botschaft, ehrlicher Leerzustand §8). **Perf-Härtung:** die Spec-Kette nutzte `FILTER(STRSTARTS(?event,?proj))` (~1,5 s/SR, 60er-Batch 117 s) — durch die direkte Graph-Kante `?proj jolux:draftHasLegislativeTask ?event` ersetzt = **260× schneller** (Korpus 2,6 s), Menge byte-gleich. **Determinismus-Fix (§2):** eine Botschaft kann mehreren proj-Knoten zugeordnet sein (`fga/2016/467`→2) → projEli/Curia deterministisch aus kleinstem proj (2 Läufe byte-identisch). **Join-Felder (Finding 1, P0):** `projEli/ocUris/botschaftDate` persistiert (Paket 5 kann joinen). **Speicher (§15):** Botschaften NICHT im in-Bundle `MATERIAL_REGISTER`, sondern build-zeitlich via `ALLE_MATERIALIEN` in die lazy `register.json`-Projektion gemerged (727 Materialien); `check:paritaet` deckt register.json (byte-Roundtrip), `daten-manifest.json` nachgezogen. **Bridge B1 (Moat-Hebel 1):** «Entstehungsgeschichte»-Gruppe IM bestehenden `KontextPanel` (Norm-Kontext-Bus, alle 3 Instanzen ohne inhalt.tsx-Änderung), kein Silo; locale-Titel, fedlexLokalisiert-Link, Curia→parlament.ch (AffairId live verifiziert), Fetch-Fehler≠leer (Finding 15). **Neu:** `botschaften-generieren(.ts/-run.ts)`, `check-botschaften-netz.ts`, `botschaften.generated.ts`, `botschaften.ts`; **erweitert:** `typen/register` (BehoerdeId `BR`, Doktyp `botschaft`), `material-manifest`/`check-materialien` (kuratiert-äquiv. + Join-Integrität), `KontextPanel.tsx`, 2 Tests. **Tore grün:** tsc · lint (0 F) · vitest 223/3636+14 · build (727 Seiten) · check:materialien · check:botschaften-netz (DSG→2) · check:paritaet · check:datenhaltung. **Gegenprüfung (Risiko-Pfad Extraktion) BESTANDEN** (unabhängiger Opus, frischer Kontext, unabhängige SPARQL-Quer-Queries gegen Fedlex/fedlex/parlament): 0 Fehler; DSG→2, **AVIG=10 korrekt (Bauplan-«11» = Overcount, kein Drop)**, 18-Erlass-Stichprobe deckungsgleich (7× exakte fga-Mengengleichheit), 3 Mantelerlasse real, 5 Null-Treffer-Gesetze = echte Graph-Lücken (kein Drop), Join-Felder 401/401, Titel zeichengenau. Beleg `bibliothek/materialien/botschaften-2026-07-10.md`. *(Vorbestehender `check:plan`-Rot «QS-TOK verwaist» stammt aus #173, wird von #176 geheilt — nicht aus diesem Paket.)* Trailer `Roadmap: W2·6`.

## Session 10.7.2026 — QS-TOK P2 «Daten-Guards + Sonde» (T5+T6), Worktree `feat/qstok-p2-guards`

**Auftrag (`FAHRPLAN-TOKEN-OEKONOMIE.md §4`, Token-Ökonomie oberste Priorität, Go David 10.7.).** Prüf-/Guard-Infrastruktur, kein Inhalts-/Rechenpfad → `Gegenpruefung: n/a`. **T5 Guards:** neuer PreToolUse-Hook `.claude/hooks/lese-schutz.py` (Read+Bash) — Soft-Block bei Read >200 KB ohne offset/limit (Override: offset/limit ODER Sonde `npm run zeige`) und bei §6-Nie-direkt-lesen-Dateien (`golden/*.json`, `package-lock.json`, `dist/**`, `fontData.ts`) mit Werkzeug-Verweis (golden:diff/zeige); `head -c`/`wc`/`jq`/`grep` (gebunden) bleiben erlaubt. Feuert NUR auf Agenten-Tool-Aufrufe — Generatoren/Tore/CI lesen per fs im Subprozess und sind unberührt (Leitplanke). `.gitattributes` (T5c/K): `public/normtext/**/*.json` + `golden/*.json` = `linguist-generated` OHNE `-diff` (textueller git-Diff MUSS bleiben — Extraktions-PRs/Gegenprüfung jagen Drop/Leak darüber), `fontData.ts` + `grundart.generated.ts` = `-diff` (Massendaten); `fontData.ts` trägt jetzt Nicht-lesen-Banner (T5b; übrige `.generated.ts` hatten Banner bereits). **T6 Sonde `npm run zeige`** (`scripts/zeige.ts`, TABU-konform ausserhalb `scripts/normtext/**`): findet EINEN Eintrag via typen.ts-Deserialisierung, gibt den ROHEN Byte-Slice aus (nie re-serialisiert; string-/escape-bewusster Extraktor + Selbst-Sicherung `JSON.parse(roh)`==geparster Eintrag). Varianten Bund · `--kanton` · `--struktur` (Kopf/Knoten) · `--register` · `--sql` (node:sqlite read-only, nur SELECT/WITH/PRAGMA/EXPLAIN). Ersatz für Voll-Reads (OR ≈ 475k Token) → ~200 Token/Nachschlag. **Wirkbeweis:** Guard blockt OR.json-Voll-Read (exit 2), lässt offset/limit-Read + `npm run gate` durch (Payload-Tests); `git check-attr` bestätigt normtext/golden diff=textuell; `zeige -- OR 1` byte-identisch zum OR.json-Eintrag (Substring @byte 50, 743 B), kanton/register/struktur ebenfalls verbatim; `gen:zaehler`-Generator liest guarded `register.json` + schreibt byte-unverändert. **Tore:** voller `npm run gate` grün (tsc · vitest · golden:vergleich IDENTISCH · lint · 25/26 check) — einziges Rot `check:plan` (verwaistes `@meta QS-TOK` im Plan-Inventar, P1b-Fix noch nicht gemergt, NICHT P2-verursacht; nach P1b-Merge rebasen). **Offen (David/Folge):** CLAUDE.md-Verankerung der Sonde (T6-DoD) + T4-Dispatch-Template = P3. Trailer `Roadmap: QS-TOK`.

## Session 10.7.2026 — Responsive-Audit-Defekte D1–D10 (reines UI, W3·14), Worktree `fix/responsive-audit-defekte`

**Auftrag (Go David 10.7.2026 «go zu allem»):** die im `abnahme/responsive-audit/BERICHT.md` offenen Defekte abarbeiten, je Defekt ein Pathspec-Commit, golden byte-gleich, empirische Vorher/Nachher-Messung (Playwright-bash @390/@2560, Hell+Dunkel). TABU `gesetz-leser/**`. **Gefixt (6):** **D1** «Vorschau ↓»-FAB — BERICHT-Wurzel «grid-Kind» empirisch widerlegt (seit Audit unverändert `position:fixed`; die Verwechslung mit einer Vertragstyp-Kachel war rein optisch durch die `lc-btn-outline`-Rahmen-Optik) → solides `lc-btn-primary`-Pill (rounded-full). **D2** Shell-Kopf/Fuss-Bedienelemente 36→44 px (min-h-11/h-11 in Topbar/Thema/Reiter/Footer/Sprache/HeaderSuche). **D3** Methodik: Prosa bleibt Lesespalte, 69-Zeilen-Pflegeliste `sm:grid-cols-2 xl:grid-cols-3` → Höhe @2560 10 470→5 977 px (−43 %). **D5** «A− A+»-Steller `shrink-0`+`flex-wrap` (scrollW 62 == clientW 62, war 62>38); Header-Such-«Suc»-Enge über `pr-3 lg:pr-14` mitbehoben (⌘K-Reserve galt fälschlich mobil). **D9** Gesetze-Placeholder gekürzt (Kontext ins aria-label). **D10** Scroll-Affordance (`from-paper`-Verlauf) am mobilen Sachgebiet-Chip-Band. **Bereits geheilt (empirisch belegt, kein Fix):** D7 (Container-Breiten konsistent 1120 px, via A15-Refactor #908bf143) · D8 (Ingress jetzt `max-w-reading` 640 px). **Caveat/kein Code-Defekt + TABU-Pfad:** D4 (Headless-PDF-Artefakt, Fallbacks vorhanden) · D6 (Sticky-Sidebar-Screenshot-Artefakt). **Tore:** `gate` grün bis auf **pre-existing** `check:plan` ROT (`QS-TOK`-Inventar-Drift aus dem parallelen Token-Ökonomie-Strang #172, ROADMAP.md von mir unberührt) — `golden:vergleich` IDENTISCH, tsc/vitest/lint + 25/26 Sub-Checks grün. Trailer `Roadmap: W3·14`, Gegenpruefung n/a (reines UI). Status je Defekt im BERICHT.

## Session 10.7.2026 — QS-TOK P4 «Werkzeuge+Output» (Token-Ökonomie), Worktree `lm-qstok-p4`

Umgesetzt **T8** `npm run map` (deterministische Repo-/Symbol-Map Modul→Pfad→Exporte→Tor, 864 Module; stdout/`--out` gitignored, kein Gate), **T12 Stufe 1** `npm run ci:log` (ent-präfixt `gh --log-failed`: −61 % Bytes am roten Run 29107143646, Fails vollständig), **T17** `test:kurz`/`test:e2e:kurz` (dot-Reporter; CI/Vollläufe unverändert), **T9** ast-grep-Muster-Query-Satz (`docs/token-oekonomie/ast-grep-queries.md`, im Template §1), **T10** Fixkosten-Notiz (kein projektseitiger Konnektor-Hebel — Account-Ebene). **Job-Split (T12 St.2) begründet weggelassen** (T2: Output nur 0,54 %, cacheRead 95,8 % → Spec-Bedingung nicht erfüllt; offen für David-Go). Offen/nicht-selbst-gefixt: `check:plan` rot (vorbestehend, #176) · T9-`allow`-Permission = David-Freigabe. Gate sonst GRÜN. Gegenprüfung n/a (Werkzeug-Infra). Trailer `Roadmap: QS-TOK`.

## Session 10.7.2026 — Gesetzesdarstellung-V2 A19 (FN-1 + Drop-Fix + FN-2): Fussnoten-Extraktor-Härtung (W2·5d, Risiko-Pfad Extraktion), Worktree `feat/v2-fn1-fn2`

**Auftrag (Spec `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §2 F1, Davids Wortlaut A19; Bau-Go 10.7. «go zu allem»):** Sofort-startbare, kollisionsfreie Extraktor-Einheit (kein `parts.tsx`/`inhalt.tsx`). **FN-1:** `fnDefinitionen()` liest die Fussnoten-nr jetzt als Fallback aus führendem `<sup>N</sup>`, wenn kein `#fnbck`-Back-Link existiert (22 ältere Aspose-Dumps: VZG/FZA/ENTG/KOV/BGBB/KKV_FINMA/LUGUE/VRK …; `clean()` strippt den Marker ohnehin → kein Text-Leak). **Drop-Fix:** Artikel-Regex in `extrahiereFussnoten()` matcht auch `disp_uN/art_*`/`disp_N/art_*`, Token via `ankerZuToken` identisch zum Struktur-Extraktor. **FN-2:** `kopf-extrahiere.ts` erfasst `KopfZeile.fnNrs` (Marker je Präambel-/Ingress-Zeile), Reader-Typ `browse.ts` nachgezogen. Voll-Regeneration nach `fedlex-cache.sh` (218/218 OK, «0 übersprungen»): **873 nr='' → echte nr, 227 amtliche Fussnoten recovert, 0 nr='' korpusweit, 218 Präambel-`fnNrs`; 211 Sidecars geändert** (7 reine Datums-Churn revertiert). DB/Manifest nachgezogen (`datenhaltung:build` + `:manifest`; `check:datenhaltung`/`check:paritaet` grün). **⚠ Abweichung (§7): Drop-Fix BREITER als Plan** — recovert Schlusstitel-Fussnoten korpusweit inkl. OR (nr ~875–941)/ZGB (~769 ff.); «OR/ZGB byte-gleich» galt NICHT (das Verschlucken war der §1-Bug, das Recovern die Korrektur), stattdessen **strukturell nicht-regressions-bewiesen** (Alt⊆Neu, 0 Verlust/Mutation, keine bestehende nr geändert, rein additiv). **Gegenprüfung (Risiko-Pfad, Opus frischer Kontext, Fedlex-Filestore-HTML VZG/FZA + OR/ZGB-Schlusstitel):** BESTANDEN. Tore: tsc · lint · `check:struktur-konsistenz`/`:normtext`/`:vollstaendigkeit`/`:invarianten`/`:tabellen`/`:paritaet`/`:datenhaltung` grün. Trailer `Roadmap: W2·5d`.

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
