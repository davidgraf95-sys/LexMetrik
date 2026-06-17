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

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026):** Dieses Dokument
wird in jeder Session und jedem Subagenten gelesen — Karten abgeschlossener
Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU nach
`archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt
der Verweis-Abschnitt. Offene Abnahmen sind davon unberührt (Spiegel:
`HANDLUNGSPLAN.md`).

## Session 18.6.2026 — OUTPUT-DESIGN-REGLEMENT + VORLAGEN-SCHRIFTBILD (Variante A) + STIL-UMSCHALTER (Branch feat/vorlagen-design, Worktree /tmp/lexmetrik-vorlagen-design, UNGEPUSHT)

Auftrag David: «schön, nutzerfreundlich, state of the art» für die Dokument-
Outputs der Vorlagen — Regeln **in Code erzwungen**; Schlichtungsgesuch als
erste Umsetzung. Optik-Entscheid: Variante A «Dokument-Handwerk» (nüchtern-
seriös), per Design-Skizze in claude.ai/design abgenommen. Nachschub David:
«nüchtern UND modern als Stil bei der Ausgabe» → Umschalter gebaut.

**Geliefert (3 Commits, Worktree, ungepusht):**
- **Etappe 1** `b67a6c8`: Rollen-Abstände der Renderer als Tokens an EINER
  Stelle (`ROLLEN_PDF` mm / `ROLLEN_DOCX` twips, `formatvorlagen.ts`). KEINE
  mm→twips-Ableitung (Word-Masse eigenständig getunt). Byte-gleich bewiesen
  (datums-/ID-bereinigter Render-Vergleich: PDF-Operatoren + DOCX document.xml
  identisch, je Fall pro Format).
- **Etappe 2** `c4d6886`: Live-Vorschau liest neu aus der SSoT
  (`components/vorlagen/vorschauStil.ts`, dritte rem-Sicht — keine Projektion,
  weil das «Papier» container-relativ ist). Schriftbild = Variante A:
  tabellarische Ziffern (NICHT `.num`-Monospace), Parteirollen-Overlines,
  scanbarer Begehrensblock. Format-agnostisch → jede Vorlage profitiert.
- **Etappe 3** `ca825fd`: Ausgabe-Stil-Umschalter **nüchtern ⇄ modern**,
  kohärent über Vorschau + PDF + DOCX. Differenzierer = Rubrum-Parteirolle
  (`— klagende Partei —` ⇄ Versal-Label, `rolleLabel`). Geteilter Modul-Store
  `ausgabeStil.ts` (localStorage, Default modern); `stil` als reiner Renderer-
  Parameter (§3). UI: `StilUmschalter` im Vorschaukopf.
- **Reglement-Notiz** `DESIGN-REGLEMENT-VORLAGEN.md` (Spiegel von …-RECHNER.md).

Jede Etappe: `assemble` unberührt → golden byte-gleich; gate voll + build grün;
Struktur-Test `vorlagen.test.ts` deklariert auf neues Schriftbild angepasst
(§6 Ziff. 3). Design-Karten in claude.ai/design-Projekt (Gruppe «Dokument-
Vorschau»): Vorher / Nachher A / Nachher B / IMPLEMENTIERT.

**OFFEN für Davids Rückkehr:** (1) fachliche Abnahme der Optik durch
Ausprobieren (Vorschau + PDF + DOCX, beide Stile) — PDF/DOCX-Modern-Label noch
nicht visuell gegengeprüft; (2) Default-Stil bestätigen (aktuell `modern`);
(3) Push/Deploy (§9, nur nach ausdrücklichem Ja).

## Session 17.6.2026 (abend) — KANTONALER VOLLTEXT-AUSBAU + POPOVER-POLITUR + RECHEN-AUDIT — GEPUSHT + PROD-DEPLOY (feat/normtext-popup @ 4b54f67, lexmetrik.vercel.app)

**Volltext-Ausbau (echte Fallback-Quellen 23 → 3):** `parsePassus` löst jetzt
Anhang-/Tarif-Ziffern auf (`anhang-segmenter`); generisches **OrdoLex-PDF-Profil**
(`olexAt`/`olexPar`, Stand aus «(Stand …)»/«(état …)»/SRSZ via neuem rohText-Fallback
in `adapter-pdf`). NEU mit Volltext: GR/AR/LU/SG/FR/VS/SZ/TI (PDF) + TG/AG/SH (über
`/app/`-LexWork, Tarif-quelleUrl von `/api/` umgestellt) + ZH AnwGebV, GE RTFMC, VD
TNo (tolv/210344) / TDC (tolv/135783 — Falschquelle 105540 korrigiert), TI ripetibili
(m3/atto/141), SZ HSt (lexfind/82040 via sz-Profil), VS OcRF (lex.vs.ch/211.611).
**ZH-NotGebV-Anhang spaltenbewusst** extrahiert (`extrahiereZhAnhangSpalten` in
adapter-zh-pdf: Verweis-Spalte getrennt, Silbentrennung gefügt) — vorher unleserlich
verschränkt («Begrün-2.2.1, 2.2.2, dung» → «Begründung … (vgl. Ziff. …)»). 118 Ziffern.
Verbleibende 3 Fallback: UR-urilaw (privater Tarif), UR-Grundbuch-PDF (verstümmelt),
SG GebT 821.5 / SG 941.12 / OW 210.32 (nurPdf-Onboarding offen, s. Audit-Doc).

**Popover-Vereinheitlichung** (Darstellung, Wortlaut unverändert — Freigabe David):
Datum IMMER `DD.MM.YYYY`; Bund «Fassung vom:» / Kanton «In Kraft seit:»; Tarif-Text-
Normalisierung (verschluckte Trenn-Leerzeichen); Staffel zeilenweise. **Regeln
dokumentiert:** `bibliothek/normen/norm-vorschau-snapshot-system.md` (§ Darstellungs-Regeln).
«Erstrecherche» aus allen nutzerseitigen Strings entfernt.

**Rechen-Audit** (4-Agenten-Fan-out, ~250 Tarif-Einträge, Regel↔Gesetzesartikel):
Mehrheit OK. **A (Wert-/Norm-Abweichungen) mit PRÜFEN-Hinweis geflaggt — Fix später
(Entscheid David)**: NW Testament/Erbvertrag §18-Rahmen vs §20-Staffel, UR PE Art.30
(Strafnorm), VS/GE/AI Schlichtung, GE/VD PE, TG GK §11 (5000 vs 20'000). **B-Anker
korrigiert:** VS Art.96→32/33, VD GK 17→18, JU PE 7→13, ZG PE. **C-Coverage gefixt:**
VS-94116 / SZ-280.411 (4837→5862) / VD-105540-Falschquelle. **Vollständige Befundliste:
`bibliothek/AUDIT-TARIF-2026-06-17.md`** (offen: A-Wertfragen, systematische AR-Anker-
Verfeinerung, SG/OW-nurPdf-Onboarding).

**Tor + Deploy:** gate voll grün · check:netz Drift 0 / 0 Warnungen · Bug-Check
(Gate+Netz+ZH-No-Pollution+Stand-Fallback+Faithfulness+Browser-Render). Commit 4b54f67
(50 Dateien, Pathspec; Fremd-WIP `FAHRPLAN-RECHTSSAMMLUNG.md` einer Parallel-Session
unberührt). Deploy aus sauberem /tmp-Worktree → **lexmetrik.vercel.app READY**; Live-
Nachkontrolle: Kernroute + neue Snapshots HTTP 200, ZH-2.2.1 lesbar.

## Session 17.6.2026 — INLINE-NORM-AUTO-LINKER «NormText» + SNAPSHOT-AUSBAU (27 Bundesgesetze) + PHASE 2 (kantonal §) — GEPUSHT + PROD-DEPLOY (Branch feat/normtext-popup @ b9d35e6)

**➡️ NÄCHSTER AGENT — offene Hauptaufgabe:** «Volltext bei ALLEN Kantonen im
Popup» (pro Ziffer genau, alles bauen → EIN Deploy). Es ist ein **atomarer Build**
(parsePassus-Anhang + alle Quell-Adapter + Voll-Regenerierung Kanton + Verifikation
GEMEINSAM, sonst Tor rot). Validierte Engine liegt bereit (Commit `800f577`, inert):
generischer Ziffer-Segmentierer + ZH-PDF-Integration (ZH NotGebV 118 Ziffern
bewiesen); lexfind `/tolv/<id>` = uniformer PDF-Zugang. **Vollständige
Schritt-für-Schritt-Anweisung + Fallstricke: `FAHRPLAN-GESETZESTEXT-POPUP.md`,
Abschnitt «HANDOVER (17.6.2026) — ATOMARER ANHANG-/PDF-VOLLTEXT-BUILD».** Prod ist
stabil @ `b9d35e6`; Engine ungepusht/nicht-deployt — keine Regression.

**PROD-DEPLOY 17.6.2026 (David-Ja), 3 Stände:**
- @ 474b10a: Linker (Phase 1/3) + Snapshot-Ausbau 27 Bundesgesetze.
- @ f19ef9a: + Phase 2 (kantonale «§ N» inline) NACH fundiertem Bug-Check.
- @ b9d35e6: + 3 Polish-Fixes (s. u.) NACH fundiertem Bug-Check.
Prod via sauberem /tmp-Worktree → **lexmetrik.vercel.app**. Nachkontrolle live:
Kernrouten HTTP 200, Bund- (BBG) + Kanton-Snapshot (LU-265) 200, ZH §4-Popover
als 9 Zeilen, 0 tote Links, 0 Console-Fehler.
**Bug-Check Phase 2 (2 Review-Agents + empirisch):** HIGH-Bug gefunden+behoben —
KantonNormText verlinkte bare «Art. N» eines FÖDERALEN Posten (BGer, fedlex-URL)
kantonal → toter Popover; Fix: nur «§» + nur Nicht-fedlex-Quelle (Commit f19ef9a).
**3 Polish-Fixes (b9d35e6, Befunde David):** (1) föderaler Posten → KantonArtikel-
Trigger routet fedlex-Quellen über NormText→NormChip (BGG-Volltext statt Fallback)
— behebt zugleich den oben genannten pre-existing Punkt; (2) «Anhang Ziff. 1.1.1»
& andere nicht parsbare Artikel sind jetzt klickbar (Link zur amtlichen Quelle);
(3) Tarif-Staffel-Tabellen (ZH GebV OG §4, ZH AnwGebV §4, BS GGR §5) im Popover
zeilenweise statt als Blob (Korpus-Scan: nur diese 3, 0 Fehlauslösungen).
**Fachliche Abnahme durch David.**

**Auftrag David:** «kannst du an der Gesetzesverlinkung weiterarbeiten» → «jede Norm die
genannt wird soll verlinkt sein» → «weiterarbeiten bis Ziel erreicht» → «verifizieren und
Bug-Check» → «alles doppelt verifizieren von Anfang an». Detail: `FAHRPLAN-GESETZESTEXT-POPUP.md`
(ERLEDIGT-Abschnitt 17.6.).

- **Was:** Im FLIESSTEXT genannte Bundes-Normen («Art. N … GESETZ») werden zum Popover-
  Trigger (bisher nur an strukturierten Chip-Stellen). Neue Komponente `NormText` (universell:
  Normen via `NormChip`-Popover UND Rechtsprechung via `RechtsprechungText`); `NORM_IM_TEXT`-
  Regex in `fedlex.ts` (Gesetz-Namen aus FEDLEX-Keys + «GebV SchKG»-Alias, single source;
  KEIN blinder `§`-Regex). `NormChip` um `linkClass` erweitert (Default = heutige Pillen-Klasse,
  SSR byte-gleich). Nicht-auflösbare Nennungen bleiben Text (kein toter Link, §8).
- **Eingebaut (~90 Stellen, screen-only):** `ErgebnisAnzeige` (Warnungen+Annahmen ALLER
  Rechner — ersetzt das frühere `RechtsprechungText`), Wizard-Bausteinprotokoll,
  `VorlagenSeite`-Gates, 11 Formulare, 18 Vorlagen-Seiten (warnungen/hinweise/blocker),
  `Dokumentmappe`, `KvGerichtWahl`. Logikschicht unberührt (§3); Hinweis-Texte selbst
  unverändert, nur Inline-Rendering.
- **Verifikation (doppelt):** `npm run gate` voll grün (tsc/vitest/**golden byte-gleich**/lint/
  check), 13 neue Tests; 2 unabhängige adversariale Reviews (Regex/Komponente + Integration)
  ohne echten Bug (kein ReDoS, keine nested `<a>`, keine Key-Kollision, SSR effect-only);
  Browser-Smoke (prozesskosten 9 Inline-Links + Popover «Art. 95 ZPO» öffnet, arbeitsvertrag 8,
  vollmacht 2; 0 nested `<a>`, 0 Console-Fehler über 9 Seiten). Stale-`dist`-Fehlmessung
  (alter preview-Prozess :4173) erkannt + nach Neubau widerlegt.
- **Phase 3 (Bund-Prosa) ERLEDIGT 17.6.:** (3a) Field-hint + FehlerBox zentral durch NormText
  (deckt alle Hinweise/Eingabefehler an EINER Stelle); (3b) 156 statische «Art. N GESETZ»-
  Nennungen in JSX-Fliesstext (Vorlagen-/Rechner-Prosa) inline verlinkt — nur reine einzeilige
  Text-Knoten; Entity-Knoten/mehrzeilig/Choice-Labels/Placeholder bewusst aus. Gate grün
  (golden byte-gleich), Browser-Smoke 0 nested `<a>`/0 Console-Fehler. Commits a5a00a4
  (Phase 1), ff71685 (3a), 385bbf6 (3b).
- **Snapshot-Ausbau «jedes verwendete Gesetz in seiner Gesamtheit» + «§≡Art» (Auftrag David):**
  9 weitere Bundesgesetze als Volltext-Snapshot → **Bund 27 Gesetze / 6664 Artikel**
  (MWSTG·URG·BewG·EOG·SVG·DSG·BBG·GBV·JStPO). ELI+Konsolidierung via Fedlex-SPARQL ermittelt,
  SR-Nr.+Anker am Filestore empirisch verifiziert (§7); Linker (NORM_IM_TEXT/FEDLEX) erkennt
  sie automatisch, Popover lädt den Volltext (Kette end-to-end verifiziert). Generator: neuer
  `--nur=bund`-Modus (Bund nachführen ohne kantonale Quellen neu zu ziehen, Golden gemischt);
  Extractor: leerer Artikel-Körper (z. B. SVG art_107 aufgehoben) faithful als «aufgehoben».
  ATSG/IPRG bewusst NICHT (nur Kommentar/Test). Commits 5294edd, a00fdcb.
- **Regel «kantonales Gesetz nur als PDF» (Auftrag David 17.6.):** Quellen-Priorität
  LexWork→HTM→HTML→PDF→Live-Link; PDF browserlos via `adapter-pdf.ts`-Profil (pdfjs Build-Zeit,
  Body-Spalten-x, Stand/Drift-Token, Qualitäts-Tor → sonst ehrlicher Fallback §8); Speicherung
  wie Bund/LexWork inkl. Provenienz (§7). Dokumentiert: CLAUDE.md §7 +
  `bibliothek/normen/norm-vorschau-snapshot-system.md` (§11).
- **OFFEN:** Phase 2 (kantonale «§ N ERLASS» inline über Quelle-Kontext); Rest-Prosa (Entity-
  Knoten &gt;/&amp;, mehrzeilige Text-Knoten, prop-geroutete Choice-Labels); GBV: neuere
  Konsolidierung (2026) ist Fedlex-SPA-only, daher 20240101 gepinnt (Live-Link massgeblich).
  **Push/Deploy + fachliche Abnahme offen (§9 / David selbst).**

## Session 16./17.6.2026 — NORM-VORSCHAU-POPOVER (Volltext Bund+Kantone) GEBAUT (Branch feat/normtext-popup, ungepusht)

**Auftrag David:** «Popup mit Gesetzestext statt Weiterleitung, insbesondere
kantonal, relevante Stelle markiert» → iterativ stark ausgebaut («weiter»,
«mach was du für richtig hältst», «du kennst das Endziel», «so wie Basel-Stadt
ist super»). Fahrplan `FAHRPLAN-GESETZESTEXT-POPUP.md`; Build-Regel in **CLAUDE.md
§7** (Zitat-Ausnahme + Snapshot-Build-Muster); Dossiers `bibliothek/normen/
norm-vorschau-snapshot-system.md` + `kantonale-tarif-zitat-befunde.md`.

- **Was:** Klick auf einen Norm-Verweis öffnet ein Popover mit dem Artikel-
  **Volltext** (statt sofort extern); zitierte Stelle (Abs./lit./Ziff.) markiert
  + eingescrollt; Fuss «In Kraft seit» + Live-Link; aufgehobene Stellen als
  «aufgehoben». Progressive Enhancement: ohne Snapshot ehrlicher Link-Fallback,
  PDF/Golden/Prerender unverändert. A11y (Fokus-Falle, Scroll-Lock, Esc).
- **Architektur:** Build-time-Snapshots `public/normtext/{bund,kanton}/` (Generator
  `npm run normtext`, NIE von Hand), Client-Loader lazy je Datei (Manifest
  quelleUrl→Datei), ein `NormPopover` für alle Tiers. **Ganze Gesetze gespeichert**
  (alle Artikel je Erlass, kantonal wie Bund; einheitliches Label § N / Art. N).
- **Abdeckung:** Bund **5760 Art./18 Gesetze** (Fedlex-Cache, inkl. StGB/StG +
  Zuständigkeits-Verweise klickbar). Kanton **~5700 Art./103 Erlasse** über
  **vier Adapter-Tiers, beste Quelle je Kanton:** LexWork-JSON (19 Kt.) · Word-HTM
  (NE/GE/**TI**) · ZH-PDF (zhlex→notes.zh.ch via JS-Redirect, pdfjs build-time) ·
  generisches PDF (SZ/VD/JU). Aufzählungen vollständig, Tarif-Tabellen als gepaarte
  Items, präzise lit/Ziff-Markierung. Ehrlicher Fallback nur wo nichts
  Strukturiertes existiert (VD-HTML ist SPA/API-gated → begründet PDF).
- **Korrektheit/Pflege:** «aktuell in Kraft»-Garantie über alle Tiers (Bund
  Konsolidierung; LexWork version_uid; HTM/ZH/PDF quelleHash) — Drift-Tore
  `check:normtext`(-netz) + Vollständigkeitstest `check:vollstaendigkeit`. Bei
  Rechtsänderung: Drift rot → `npm run normtext` neu.
- **Fachliche Tarif-Korrekturen (durch den Vollständigkeitstest ans Licht):**
  **SH** Schlichtung totes ZPO-273.100 → JG 173.200 Art. 82 (Werte 50–300→100–1000,
  David-Ja); **OW** GK Art. 7 aufgehoben → Art. 12 GebOR (selbst bestimmt am GOG);
  **LU** quelleUrl 228→258; 5 NE/GE-Zitate (Art. 14 ch., LERF Art. 10, GE-Erlasse)
  — alle live-verifiziert, Status `recherche` (Abnahme David offen).
- **Verifikation:** 2 unabhängige Bug-Check-Runden + Einheitlichkeitscheck, alle
  Befunde behoben (ZH-Stand=Inkraft, einheitl. Label, Tabellen-Kopplung, FR-
  Markierung, Lückentor). Gate **voll grün**, golden byte-gleich, Drift 0, ~70
  Commits. **Browser-Smoke aller 26 Kantone** durchgeführt (0 Console-Fehler).
  **Push/Deploy + fachliche Abnahme offen (§9 / David selbst).**
- **OFFEN nächste Session (David 17.6.):** «viele genannte Artikel im FLIESSTEXT
  noch nicht verlinkt» (Hinweise/Begründungen/Tarif-`hinweis`) — Inline-Auto-Linker
  `NormText` (~2093 Nennungen, ~40 % federal sofort auflösbar). Plan + Einbaupunkte
  am Ende von `FAHRPLAN-GESETZESTEXT-POPUP.md`.

## Session 16.6.2026 — BEURKUNDUNGS-AUSBAU: 3-fach-Verifikation + Gesamtkosten + UI-Fix

**Auftrag David:** «verifiziere das alles / führe nochmals Recherche durch» + «sind
wirklich alle Kosten abgedeckt?» + «Handänderungssteuer-Anzeige verbessern».
- **3-fache Verifikation der Tarif-Daten:** find → unabhängiger Doppelcheck →
  **adversariale Zweitprüfung** (alle 624 kodierten Werte gegen die Erlasse) →
  **struktureller Korrektur-Reencode**. Die Zweitprüfung deckte **286 Befunde**
  auf (meine erste Recherche war zu nachlässig): veraltete Fassungen (ZH v95 →
  1.1.2024: Testament/Ehevertrag 200–4000, Erbvertrag 300–6000), degressive
  Staffeln als Flachsatz kodiert (OW/NW/GL/LU/VD … → jetzt echte Marginalbänder
  `staffel_sockel_prozent`), Aufwand-Tarife als Fix (ZG-Grundbuch = CHF 180/Std ×
  Faktor; Vorsorgeauftrag ZH = CHF 180/Std → formel_extern), falsche Artikel
  (Schuldbrief Ziff. 1.2.1, GL-Grundbuch Art. 41 Nr. X). Engine-Ausgaben gegen
  Zweitprüfungs-Stützstellen geprüft (OW Grundpfand 1'750, NW Erbvertrag 2'100,
  LU Schenkung 2'750, GL Schenkung 1'700 …). Dossiers + Tests nachgeführt.
- **Gesamtkosten (David: «alle Kosten?»):** neues Modul `lib/beurkundungZusatzkosten.ts`
  — **MwSt 8,1 %** (nur freies Notariat, 14 Kt), **Handelsregistergebühr Bund**
  (GebV-HReg SR 221.411.1, Anhang: AG/GmbH 420 · Genossenschaft 280 · Stiftung 210 ·
  Statutenänderung/Kapital 200 · Fusion 420), **Emissionsabgabe** (StG SR 641.10,
  1 % über **Freigrenze** 1 Mio — ganzer Betrag steuerbar). UI «Weitere
  Transaktionskosten» + «Total (Schätzung)», auch im PDF. Bundeswerte gegen Fedlex
  doppelt verifiziert (GebV-HReg 2021-Fassung, nicht die aufgehobene 2007er).
- **UI-Fix:** Position «Entfällt» klar ausweisen, wo ein Kanton die Steuer/Gebühr
  gar nicht kennt (z. B. ZH Handänderungssteuer) — statt irreführend «nach
  Vereinbarung/Aufwand».
- Gate **voll grün**, golden byte-gleich, 51 Routen prerendered, Playwright-Smoke
  ok (GE AG-Gründung 2M → Total 24'798 inkl. Zusatzkosten; ZH Testament 200–4000;
  OW Grundpfand 1'750; ZH Handänderung «Entfällt»; 0 Console-Fehler). Status
  durchgehend `recherche`/`entwurf` (§7).
- **VIERTER Pass (David «bist du absolut sicher?» → «lauf den 4. Pass»):** alle 621
  kodierten Werte an Stützpunkten (100k/500k/1M/3M) gegen die Erlasse adversarial
  geprüft → **529 ok, 91 Korrekturen** (Konvergenz von 286). Merge 3rd+4th-Pass.
  Zusätzlich **automatische Kontrollen** (in meiner Macht, ohne KI): (1) **Monotonie-
  Invariante** über 619 Tarife → fand 1 latenten Sockel-Bug (VD Schuldanerkennung,
  `minChf` nur auf 1. Band) → Generator setzt min jetzt auf JEDES Band; (2)
  **Stützpunkt-Abgleich** Engine vs. Sollwerte → fand 25 Mismatches (UR/TI/SZ
  **Gesamtwert-/Schwellensatz-Tarife**, die das marginale Schema nicht abbilden
  konnte). Fix outside the box: **Tarif-Primitiv erweitert** (`staffel_voll_prozent`
  jetzt mit Min/Max je Band — additiv, golden byte-gleich) + Overrides (UR Tarif A/B,
  TI LTORF-Schwellensatz, SZ 70%-Basis). Endstand: Stützpunkt-Mismatches **0** (bis
  auf 1 offengelegte Ceil-Step-Näherung SZ Stockwerkeigentum @<500k), Monotonie **0**.

## Session 15.6.2026 (Abend) — BEURKUNDUNGS-AUSBAU: Notariatsrechner auf alle Geschäfts-/Eintragungsarten (ungepusht)

**Auftrag David:** «baue den Notariatsrechner aus» + «achte darauf dass alle Arten
von Beurkundung abgebildet sind» + «und alle Arten von Grundbuchgebühren; von mir
aus kannst du die Engines auch aufteilen». FAHRPLAN-BEURKUNDUNGS-AUSBAU.md.
- **Zwei getrennte Engines (§4, David-freigegeben):** `src/lib/beurkundung.ts`
  (Notariats-/Beurkundungsgebühr je **Geschäftsart**, 22 Arten) + `src/lib/grundbuchgebuehren.ts`
  (Grundbuchgebühr je **Eintragungsart**, 10 Arten). Beide dünne Lader über
  `tarif/staffel`; Grundstückkauf/Eigentum-Kauf nutzen die verifizierte
  NOTARIAT/GRUNDBUCH-Schicht weiter (Parität getestet, **keine Regression**).
- **Taxonomien:** `beurkundung-typen.ts` (Immobilien · Familie & Nachlass ·
  Gesellschaft · Sicherung · Übriges) + `grundbuch-typen.ts`.
- **Deep Research (2 Workflows, je 26 Kt × find→Doppelcheck, 52 Agenten/4,1 M Token):**
  Beurkundungstarife + Grundbuchgebühren je amtlicher Erlass + Artikel + Regel +
  Stand → Dossiers `bibliothek/kosten/{beurkundungstarife,grundbuchgebuehren}-kantone.md`
  (+ INDEX). **Doppelt verifiziert** (find + unabhängiger Doppelcheck); GB-Gegenprobe
  reproduziert die GRUNDBUCH-Schicht. Korrekturen übernommen: GE Bürgschaft 1‰;
  BS § 51 Abs. 2/4/5/6; ZH § 11; AI Löschung. **Fachlicher Drittcheck** fand
  Überhöhungs-Risiko: Wert-Geschäfte (Schenkung/Gründung/Stiftung) in Staffel-
  Kantonen sind **degressiv** → in der Engine als ehrliche Spanne statt Flach-
  Promille kodiert (§8); Flach-Kantone (ZH/SZ/SG/GR/TG) behalten den Satz; TG
  Schenkung = 1‰ (§ 14 GGG); AG Anmerkung = fix 40.
- **UI** `/rechner/notariat-grundbuch`: drei Bereiche (Grundstückkauf · Beurkundung
  je Geschäftsart · Grundbuch je Eintragungsart); Wertfeld dynamisch nach
  aufgelöstem Tarif (`istWertbasiert`), interkant. Vergleich, PDF, Permalink. §8:
  fehlende Tarife «in Recherche», nie ein Schätzwert. Rechtsgebiet umbenannt
  «Immobilien & Beurkundung».
- **Verifikation:** Stützstellen-Tests beider Engines, Gate **voll grün**, golden
  byte-gleich, 51 Routen prerendered, Playwright-Smoke (OW Testament 1‰→1000,
  GB Grundpfand ZH→800, Vergleich 26 Zeilen, 0 Console-Fehler).
- Status durchgehend `entwurf`/`recherche`; nichts `geprüft` (§7). **Push/Deploy
  auf Davids frisches Ja (§9).**

## Session 15.6.2026 — NEUE DOMÄNE: Notariats- & Grundbuchkosten-Rechner GEBAUT (ungepusht)

**Auftrag David: «Notariat/Grundbuch von Anfang an richtig, ausführlicher
Handlungsplan (ultra effort), Deep Research, überprüfen und nochmals überprüfen,
amtliche Quelle hinterlegt.»** Plan: `FAHRPLAN-NOTARIAT-GRUNDBUCH.md`.
- **Deep Research** (5-Cluster-Fan-out, alle 26 Kantone): Beurkundung (Notariat) +
  Grundbuch + Grundpfand + Handänderungssteuer beim Grundstückkauf, je Wert mit
  amtlichem Erlass + Artikel + Link + Stand → Dossier `bibliothek/kosten/notariat-grundbuch-kantone.md` (+ INDEX).
- **Engine** `src/lib/notariatGrundbuch.ts` (dünner Lader über `tarif/staffel`) +
  **Datenschicht** `src/data/tarif/notariat-grundbuch.ts` (NOTARIAT/GRUNDBUCH/
  GRUNDPFAND/HANDAENDERUNGSSTEUER, 26 Kt). Determinismus: Promille/Staffel (marginal)
  wo klare Bänder; ehrlich `rahmen`/`formel_extern` wo aufwand-/bandbreitenbasiert
  (ZG/SO/BL freies Notariat) oder Bänder unscharf (BE/FR/VD/VS/NE/GE/JU-Notariat,
  Stützstelle im Hinweis). Handänderungssteuer als getrennter Steuerblock
  (1–3,3 %; ZH/UR/GL/ZG/SH/AG/TI keine separate).
- **UI** `/rechner/notariat-grundbuch` (Form + Page + Route + Katalog + neues
  Rechtsgebiet «Immobilien / Grundstückkauf»); interkant. Vergleich (günstigste
  zuoberst), Permalink, Aktenzeichen, PDF. 8 Stützstellen-Tests, Gate voll grün,
  golden byte-gleich, 51 Routen prerendered. Zähler 49 gebaut / 45 sichtbar.
- **Verifikation läuft:** Daten-Doppelcheck (Restunsicherheiten GE ‰/% · JU Punktwert ·
  VS Stufenmodus · BS § 51 · ZG ESTV · BE Anhang-1) + adversarialer Engine-Review.
- Status durchgehend `entwurf`/`recherche`; nichts `geprüft` (§7). Push/Deploy auf
  Davids frisches Ja (§9).
- **PDF-Quellen (15.6.2026, gilt für ALLE Rechner):** `Normverweis.url` durchgereicht
  → kantonale Erlasse/Verordnungen werden im PDF verlinkt (nicht nur Bundesquellen).
- **DIREKTIVE FÜR NEUE SESSION (David 15.6.2026): `FAHRPLAN-BEURKUNDUNGS-AUSBAU.md`** —
  Notariatsrechner extrem ausbauen auf Testament, Dienstbarkeiten, Gründungen (AG/GmbH),
  Stiftungsurkunde, Bürgschaften, Erbvertrag/Ehevertrag/Schenkung u. a. (Geschäftsart-
  Dimension; Deep Research je Geschäftsart × 26 Kt mit amtlicher Quelle; doppelt
  verifizieren). David will, dass das eine NEUE Session macht.

## Session 15.6.2026 — Prozesskosten-Cockpit I7/I8 + Schlichtungstarif GEBAUT (ungepusht)

**Auftrag David (Fortsetzung): «weiter mit nächsten Etappen» + «Schlichtungstarif
recherchieren und implementieren».** Recherche war bereits da (zweifach geprüftes
Dossier `bibliothek/kosten/schlichtungsgebuehren-kantone.md`, 5.6.2026) — implementiert.
- **Schlichtungstarif:** neue Datenschicht `src/data/tarif/schlichtung.ts` (26 Kt);
  Engine beziffert die Schlichtungsphase jetzt (regime-treu getrennt vom
  Entscheidgebühr-Tarif, §4). Betroffene Tests deklariert angepasst (§6.3).
- **I7 Instanz-Akkumulation:** `berechneInstanzenzug` (Stufen-Summe, Untergrenze
  bei unbezifferten Stufen) + UI-Tabelle.
- **I8 PDF-Bericht:** `prozesskostenBericht` → `Berechnungsergebnis` → zentraler
  `PdfExportButton` + `AktenzeichenFeld`.
- **Verifikation:** unabhängiger adversarialer Review der I6/I7/I8-Engine = **0 Befunde**
  (15+ Konstellationen handnachgerechnet). Erschöpfender Konstellations-Sweep als
  bleibender Test (>5000 Kombinationen, kein Crash, Invarianten halten). Gate voll
  grün (golden byte-gleich, lint, check:zitate). 45 Tests.
- **NV-Modus (nicht vermögensrechtliche Streitigkeiten) GEBAUT:** neue Datenschicht
  `src/data/tarif/nicht-vermoegensrechtlich.ts` (GERICHTSKOSTEN_NV/PARTEIENTSCHAEDIGUNG_NV/
  SCHLICHTUNG_NV, alle 26 Kt aus den Dossiers); Engine-Schalter `nichtVermoegensrechtlich`
  → eigener Gebührenrahmen ohne Streitwert, BGer Art. 65 III lit. a (200–5000), Arbeit
  nicht mehr auto-kostenlos (streitwertbedingt, Hinweis); Zeitsystem-Kantone bei der
  Parteientschädigung ehrlich `formel_extern` («nach Aufwand»). UI: Schalter blendet
  Streitwertfeld aus. GK-NV durchgängig `recherche` (Quelldossier einfach belegt →
  **Doppelcheck-Agent läuft**).
- **Art. 99 Sicherheitsleistung (Kaution) GEBAUT:** `berechneSicherheitsleistung`
  (Höhe = mutmassliche Parteientschädigung; Ausschlüsse Art. 99 III a–d: vereinfacht/
  Scheidung/summarisch/DSG; Kautionsgründe Abs. 1 a–d als Hinweis). **Wortlaut Art. 99
  am Fedlex-Filestore 1.1.2025 verifiziert** (Abs. 3 lit. d = DSG bestätigt). UI-Schalter + PDF.
- **Handelsgericht GEBAUT:** Instanz `handelsgericht` (Art. 6 ZPO am Fedlex verifiziert;
  nur ZH/BE/AG/SG), ordentlicher erstinstanzlicher Tarif ohne Modifikator, Hinweis
  einzige Instanz/keine Schlichtung (Art. 198 lit. f)/Weiterzug BGer (Art. 75 II lit. b BGG);
  Nicht-HG-Kantone mit ehrlichem Hinweis. UI: Phase/Verfahrensart/Vergleich/Instanzenzug ausgeblendet.
- **GK-NV-Doppelcheck EINGESPIELT:** 23/26 bestätigt, 3 korrigiert (TG 300–20 000
  statt 300–5 000 [Zahlenfehler], FR Art. 20 Zivilgericht 100–500 000, OW Art. 12 II
  800–10 000); GERICHTSKOSTEN_NV jetzt durchgehend `doppelt` (zwei unabhängige Pässe).
- **Art. 106–109 Verteilung GEBAUT:** `verfahrensausgang` (Anerkennung→Quote 1 /
  Rückzug→0 deterministisch; Vergleich Art. 109 / Billigkeit Art. 107 → Ermessen,
  kein Wert) + `KOSTENVERTEILUNG_SONDERFAELLE` (Art. 106 III/107/108/109). UI:
  Verfahrensausgang-Vorschalter im Kostenrisiko + Sonderfall-Liste.
- **FINALE GESAMT-VERIFIKATION (15.6.2026, «alles von vorne»):** unabhängiger
  adversarialer Review über Engine + alle 6 Datenschichten + UI (20+ Konstellationen
  handnachgerechnet). 3 Befunde behoben: (HOCH) **TG-NV zurück auf 300–5'000** — die
  vorige Doppelcheck-«Korrektur» auf 20'000 war ein Agent-Irrtum, am amtlichen VGG
  § 11 Ziff. 2 (RB 638.1) selbst verifiziert; (MITTEL) **MwSt-Doppelzählung behoben** —
  Flag `mwstInbegriffen` (BGer-PE + VS-PE inkl. MwSt → kein Aufschlag); (NIEDRIG)
  VS-PE oberstes Band Untergrenze 41'200 ergänzt. Gate voll grün, golden byte-gleich.
- **Unentgeltliche Rechtspflege (Art. 117 ff.) GEBAUT:** UR-Schalter im
  Kostenrisiko → eigene Gerichtskosten befreit (Art. 118 I lit. b), nur die
  gegnerische Parteientschädigung bleibt (Art. 118 III), Nachzahlung Art. 123;
  Art. 118/123 am Fedlex verifiziert.
- **I9 SchKG-Verknüpfung (Teil) GEBAUT:** Querverweis im Cockpit auf
  `/rechner/betreibungskosten` (GebV SchKG, Art. 16 SchKG / Art. 96 ZPO-Vorbehalt).
- **OFFEN:** Notariats-/Grundbuchgebühren (I9-Rest) · Push/Deploy auf Davids Ja.
  Nichts `geprüft`.

## Session 15.6.2026 — Prozesskosten-Cockpit I6 (Vollständigkeit der Kostenposten) GEBAUT (ungepusht)

**Auftrag David: «mach weiter mit prozesskosten, deep research wenn nötig».**
Etappe I6 aus `FAHRPLAN-PROZESSKOSTEN-COCKPIT.md`. **Keine neue Deep Research
nötig** — die Norm-Basis (Art. 95/98/117 ff. ZPO) lag bereits doppelt verifiziert
in `prozesskosten-zpo-95-96.md` §A (Art. 98 Rev. 1.1.2025) und
`prozesskosten-sonderkonstellationen.md` §6.4/§6.7/§3; MwSt-Satz im Verfallsregister.

**Gebaut (rein additiv, §6 verhaltensneutral — golden byte-gleich):**
- `lib/prozesskosten.ts` +3 Exporte: **`berechneKostenvorschuss`** (Art. 98: ½ GK
  als Regel; voller Vorschuss in Schlichtung/summarisch/Rechtsmittel nach Abs. 2,
  summarisch-Ausnahmen offengelegt; BGer = Art. 62 BGG voll; kostenlos → 0) ·
  **`berechneMwstParteientschaedigung`** (8,1 % Normalsatz, fallabhängig, nur auf
  Schalter; kantonale Behandlung inkl./zzgl./ohne offengelegt) · **`WEITERE_KOSTENPOSTEN`**
  (Art. 95 II c–e / III a + UR Art. 117–118/123 als ehrlicher Hinweis).
- `data/tarif/typen.ts`: **`MWST_NORMALSATZ_PROZENT = 8.1`** als §5-SSOT der
  Tarif-Domäne (Mietvertrags-Kopie bleibt; beide im Verfallsregister).
- UI `ProzesskostenForm.tsx`: Vorschuss-Kachel · MwSt-Schalter (Permalink `mw`) ·
  aufklappbare «Weitere Kostenposten».
- 11 neue handgerechnete Tests (36/36 grün). Gate voll grün, Build ok.

**OFFEN:** §9-Bug-Check noch nicht über unabhängige Lupen gefahren · Push/Deploy
auf Davids frisches Ja (§9). Nichts trägt `geprüft`. Nächste Etappen: I7
(Instanz-Akkumulation) → I8 (PDF) → I9 (Notariat/GebV-SchKG).

## Session 15.6.2026 — UI-REDESIGN «frischer Blick» GEBAUT + DEPLOYED (Auftrag David, parallel zum Cockpit)

**Auftrag `~/Downloads/AUFTRAG-UI-Redesign.md`:** ganze Darstellungsschicht frei,
Rechtslogik (`src/lib`/`src/data`) + Export-Inhalte unangetastet (Golden
byte-identisch verifiziert). Vorgehen: 10-Agent-Audit (97 Befunde) + empirische
Playwright/DOM-Prüfung; Plan/Stand in **`REDESIGN-PLAN.md`** (Root).

**Umgesetzt + DEPLOYED (15.6., lexmetrik.vercel.app):** Fundament-Primitive
(`<Card>`/`<SeitenKopf>`/`<Checkbox>`/`<GruppenTitel>`/`.lc-select`/`.lc-akzent-*`,
`--ring`-Fokus); Skip-Link + `<main>`-Landmark; **persistente Kategorie-Nav +
Mobile-Off-Canvas-Menü**; **Katalog-Rechtsgebiet-Filter** (tote kartePasst-Logik
verdrahtet, `?rg=`/`?status=`); Prozesskosten-Dialekt an Haus-Anatomie angeglichen;
Wizard: Mobile-Stepper-Fortschritt + Vorschau-Sprung + «Weiter»-Erklärung +
Tablet-`md`-Zweispalter + **Haarlinien-Sektionen** (`<GruppenTitel>`, Entscheid
David) + **kombinierte Schalter-Karte** (Vertragstyp+Detailgrad); Live-Wert-Puls +
Schritt-/Routen-Fade; A11y (Tabs-Tastatur, FristenKalender sr-only, Kontrast,
SprachUmschalter-Disclosure); Mobile-Touch (Checkbox/Radio/Tabs/Tabellen);
Sekundärseiten (`<SeitenKopf>`, ErrorBoundary, 404-Wegweiser, seo.ts Title/Meta).
Bewusst NICHT: reich-JSX-Checkboxen aufs Primitiv restrukturiert (0 sichtbarer
Gewinn, Sweep-Risiko bei verschachtelten Handlern — bleiben inline, aber
tap-/marken-konsistent). Tore + `build` grün vor jedem Commit; §9-Review
«deploy-tauglich»; Deploy aus sauberem /tmp-Worktree.

## Session 15.6.2026 — Prozesskosten-Cockpit GEBAUT + DEPLOYED (Hauptmoat P1)

**Auftrag David (vielstufig): Prozesskostenrechner zum vollen Cockpit vertiefen,
fundiert recherchieren, alle Sonderkonstellationen, doppelt verifizieren +
normhinterlegen, Logik-/Bug-Check, deployen.** Erledigt + LIVE auf
lexmetrik.vercel.app (`dpl_9YUEU1tckdLYK4wyJ7besDZsjnn9`, origin/main `0896d6c`,
22 Commits inkl. paralleler UI-Redesign-Session E1–E10).

**Cockpit `/rechner/prozesskosten`** (Engine `lib/prozesskosten.ts` + Datenschicht
`src/data/tarif/*` + Primitiv `lib/tarif/staffel.ts`): Matrix **Kanton ×
Verfahrensphase (Schlichtung/Entscheid) × Verfahrensart (ordentlich/vereinfacht/
summarisch) × Instanz (erst/Rechtsmittel/Bundesgericht) × Materie** →
Gerichtskosten + Parteientschädigung getrennt (Art. 95/96), Art. 113/114-
Kostenlos-Vorschalter (Miete nur Schlichtung), **Kostenrisiko nach Obsiegensquote
(Art. 106/111)**, Ermessenskriterien bei Spannen, **interkantonale
Vergleichstabelle**, jeder Wert mit amtlichem Link/Erlass/Stand/Verifikationsstand.
Bundesgericht: BGG Art. 65/68 + Reglemente (`data/tarif/bundesgericht.ts`).

**Recherche (alle doppelt verifiziert, normhinterlegt) — bibliothek/:** Dossiers
prozesskosten-zpo-95-96 · -bundesgericht · -sonderkonstellationen (104/132) ·
-wettbewerbsanalyse; Register gerichtskosten- · parteientschaedigung- ·
kosten-modifikatoren- · sonderkonstellationen-tarife-kantone (877 Sonderregeln).

**§9-Logik-/Bug-Check** (Workflows wk6eknug5 + w04tm2mr9, je 4 Lupen + adversarial)
abgearbeitet. **OFFEN für David:** Modifikatoren sind ERSTRECHERCHE
(`verifiziert: 'recherche'`, Caveat sichtbar) — vor `geprüft` Abnahme +
GR-Modifikatoren/LU-PE/BE-RM-GK am Wortlaut bestätigen; Fahrplan-Restposten
I6 (Vorschuss/MwSt/Auslagen) · I7 (Instanz-Akkumulation) · I8 (PDF) · I9
(Notariat etc.) in `FAHRPLAN-PROZESSKOSTEN-COCKPIT.md`. Nichts trägt `geprüft`.

## Session 14.6.2026 — Ausbau-Direktive + Ultra-Fahrplan PRODUKTAUSBAU & BURGGRABEN

**Neue aktive Direktive David (14.6.2026):** Bis zu den ersten Kanzleigesprächen
(Monate weg) ist das Ziel maximaler Produktausbau zu einem *imposanten Produkt
mit Burggraben* — Maßstäbe Praxistauglichkeit · Skalierbarkeit · fachliche Tiefe.
**Abnahme-Welle/Validierung bewusst zurückgestellt** (nicht mehr proaktiv
treiben). Verankert: `STRATEGIE-PLATTFORM.md` (Kopf-Block) + Memory
`lexmetrik-ausbau-direktive`.

**Neuer Fahrplan `FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md`** (Ultra-Workflow, 16
Agenten: 5 Bestandsleser → 4 Säulen-Designs inkl. 3-Wege-Panel für die
Fall-Kontext-Säule → 3 adversariale Kritiker [Solo-Machbarkeit · CLAUDE.md-Treue
§1–§6 · Moat/Imposanz] → Synthese). Kern: **P0** Schema-Registry + Drift-Guards
(Bau-Hygiene, §6-verhaltensneutral) · **P1 Hauptmoat** Prozesskostenrechner
26/26 (deterministische Tarif-Staffeln statt Prosa; Verfallsregister VOR
30.6.2026 wegen SG GKV-Ablauf) · **P2** schlankes Fall-Kontext-Rückgrat
(URL-Transport, kein Cockpit) · **P3** fachliche Spitze (Zustellfiktion +
kant. Gerichtsferien + Feiertags-Verifikation) · **P4** opportunistisch.

**Umsetzung begonnen (14.6.2026): P0/C1 GEBAUT (ungepusht).**
`src/lib/vorlagen/registry.ts` = SSOT über die Menge aller 28 gebauten Vorlagen
(25 Einzel-Schemas + 3 Dokumentmappen AG/GmbH/KE); referenziert die echten
Modul-Exporte (Schema-Objekt, `zusammenstellen`/Mappe-Builder, `DEFAULTS`,
optionale Gate-Prüfung), deklariert nichts neu (§5/§1). Drift-Guard
`src/tests/vorlagenRegistry.test.ts`: Bijektion Registry↔Katalog-`schemaId`,
`schema.id === schemaId`, Karte+Route je schemaId, Identitäts-Guard gegen die
`kv`-Namenskollision (klageVereinfacht vs. kuendigungAllgemein). §6: Gate voll
grün, golden byte-gleich (verhaltensneutral; Registry wird von Golden/Engines
nicht importiert). Test-/Skript-Modul (nicht aus UI importieren — Bundle).
C1b (golden-outputs aus Registry) bewusst zurückgestellt (niedriger Wert,
hohe Byte-Fragilität) · C4 offen.

**P1 Hauptmoat begonnen — B-P0a GEBAUT (ungepusht):** `src/lib/tarif/staffel.ts`
= fachneutrales, deterministisches Tarif-Staffel-Primitiv (§2/§4 Infrastruktur,
kein Recht). Diskriminierte Regel-Union `fix · sockel_prozent · promille ·
staffel_inklusiv · staffel_exklusiv · rahmen · formel_extern`; Bandgrenzen
explizit typisiert (inklusiv/exklusiv, §1); `rahmen`/`formel_extern` tragen
KEINEN Betrag (Ergebnis-Union zwingt ehrlichen Rahmen, §2/§8). Test
`tarifStaffel.test.ts` (11) inkl. **Charakterisierung gegen die gebvKosten-
Pfändungsstaffel** (Art. 20 GebV SchKG) → spätere byte-gleiche Ablösung möglich.
Gate voll grün.

**B-P0a/Primitiv erweitert + RECHERCHE KOMPLETT (14.6.2026, Aufträge David
«beide Tranchen · Honorar dazu · doppelt prüfen · praxistauglich · kostenlose
Verfahren · amtliche Links»):** `tarif/staffel.ts` deckt jetzt 7 Tarifformen
(fix · sockel_prozent · promille · staffel_inklusiv/exklusiv · **staffel_rahmen**
· **staffel_sockel_prozent** · **staffel_voll_prozent** · rahmen · formel_extern),
§2/§8-ehrlich, Charakterisierungs-Tests ZH/AG/BS. §7-Grundlage:
`bibliothek/recherche/prozesskosten-zpo-95-96.md` (Art. 95/96/98/113/114 ZPO,
Fedlex 1.1.2025 verbatim — Engine teilt Gerichtskosten↔Parteientschädigung;
Schlichtung↔Entscheid-Kostenlos-Unterscheidung). **Alle 26 Kantone × 2 Tarife
amtlich (doppelt) verifiziert** und durabel als Register persistiert (je mit
amtlichem Link/Erlass/Stand/Artikel/TarifRegel/kostenlos-Hinweis):
`bibliothek/register/gerichtskosten-tarife-kantone.md` +
`…/parteientschaedigung-tarife-kantone.md`. Befund: ZH/AG/VD/ZG/GE/SG/AI/AR
deterministisch, Mehrheit Ermessensrahmen je Streitwert-Band, FR/SO/GR/GL/SH/SZ
aufwandbasiert. Re-Verif offen: AG (GK), SZ/GL/SH/GR (PE). Workflow-Runs
wf_47cbdc5e (GK T1) · wf_3afb439f (GK T2) · wf_17e78208 (PE).

**P1 HAUPTMOAT GEBAUT (14.6.2026, ungepusht):** Datenschicht
`src/data/tarif/{typen,gerichtskosten,parteientschaedigung}.ts` (alle 26 Kantone
× 2 Tarife, je amtlicher Link/Erlass/Stand/Artikel/verifiziert) · Engine
`lib/prozesskosten.ts` nach Art. 95 (Gerichtskosten + Parteientschädigung
getrennt; Art. 113/114-Kostenlos-Vorschalter inkl. Miete/Pacht nur Schlichtung;
Art. 95 II lit. a Schlichtungspauschale ≠ Entscheidgebühr ehrlich; Art. 98-
Vorschuss; `vergleichAlleKantone`) · Rechner `/rechner/prozesskosten`
(Karte entwurf, Klarnamen-Kantone, **interkantonale Vergleichstabelle**) ·
Tarif-Primitiv um %-vom-Streitwert-/Deckel-/Voll-/Sockel-Prozent-Typen erweitert.
**§9-Bug-Check** (4 Lupen + adversarial, Run `wk6eknug5`): 2 HOCH + 4 MITTEL +
NIEDRIG behoben (Schlichtungspauschale, verifiziert-Stand, BS/SZ-Register,
INF=Infinity, ganze Franken, Monotonie). Re-Verif unsicherer Tarife abgeschlossen
(`wibiq1gbs`). Gate grün, Build 50 Routen prerendered, empirisch (Playwright)
verifiziert. §11-Dossier `prozesskosten-zpo-95-96.md` + 2 Register.
OFFEN: Push+Deploy (Davids frisches Ja) · später B-P0b Verfallsregister-CI
(VOR 30.6.2026 SG GKV) · Parteientschädigung-Detailband-Abnahme David.

## Session 13.6.2026 (Abend) — FUNDAMENT-UMBAU Phasen 0/1a/4 + Bug-Check (Auftrag David «mache fertig … nochmals bug check»)

**Architektur-Umbau nach `FAHRPLAN-FUNDAMENT-UMBAU.md` (abgenommen), je Gate
voll grün, golden/prerender byte-bewiesen, ungepusht (6 Commits `223fcae`..
`fc5ec96`):**
(1) **Phase 0 — Doku-Hygiene/Tooling (`4bcb5b7`):** sieben 11.6.-Session-Karten
byte-genau rotiert (STRUKTUR 803→619 Z.); DESIGN/RECHNER-DESIGN/
VEREINHEITLICHUNG/TOKEN-DISZIPLIN ins `archiv/` (alle 0 offene Etappen);
`requirements.txt` für den einzigen Python-Lauf. GRUNDLAGEN (8 offene Posten,
Nordstern) + AG-/GMBH-GRUENDUNG + BGER-RECHTSWEG bewusst im Root.
(2) **Phase 1a — Routen-SSOT (`f33ec88`/`11155bb`, Thema B):** neues
`src/routesManifest.ts` (44 Karten-Routen, Pfad→Lazy), App.tsx rendert
`ROUTEN_MANIFEST.map` (−89 Z.), `seo.ts katalogRouten()` als Single Source,
Gating-Test `routenManifest.test.ts` (Manifest === Katalog beide Richtungen).
§5-Verstoß (doppelte Pfad-Existenz App.tsx↔Katalog) geheilt. Beweis: build →
49 Routen, sitemap byte-gleich (Hash `67e8bed3`), Code-Splitting unverändert.
(3) **Phase 4 — §7-Abnahme-Dossiers (`ddac5dd`, Thema C):** generischer
`scripts/abnahmeDossier.ts`; AG-Dossier byte-identisch; additive
`GMBH_ALLE_SCHEMAS`; `scripts/abnahme-dossiers.ts` erzeugt 26 Dossiers (GmbH +
25 Vorlagen, 432 Bausteine) nach `abnahme/dossiers/` → Wortlaut-Abnahme aller
Gebiete ohne TS-Lesen (bisher nur AG).
(4) **Bug-Check (§9, `fc5ec96`):** 4-Dimensionen-Multi-Agent + adversariale
Verifikation über das Delta; 3 bestätigt (alle niedrig/mittel, KEINE
Rechtslogik): AG-Konsolenzahl wiederhergestellt + `KV_SCHEMA`→`KLAGE_V_SCHEMA`
(klageVereinfacht, §5-Namensfalle) gefixt; Verifikationsstand-Drift (vor-
bestehend) offen. Deploy-Urteil: keine Blocker.

(5) **Thema A — generische `VorlagenSeite` + Pilot (`325ccc1`):**
`src/components/vorlagen/VorlagenSeite.tsx` übernimmt die fehleranfällige
Orchestrierung (useWizardState, useMemo, pruefen-Scaffold, DOCX-Gate,
VorschauPanel); `seiteHelfer.ts` (istIsoDatum/docxAktiv, Schritt-2-Dedup).
Pilot **Forderungsabtretung** umgestellt — §6-Beweis: golden 166 byte-gleich +
**Playwright-DOM byte-identisch über alle 3 Schritte + bedingtes Feld**; Logik-
Check: src/lib unberührt, Sweep 14448 ohne Widerspruch. Opt-in; seiten-
spezifisches JSX bleibt in der Config (§1).

(6) **Thema A — Rollout (`6a2c538`, `c175d4c`):** Verjährungsverzicht,
Nichtbekanntgabe + Mahnung auf `VorlagenSeite` umgestellt — **4 lineare Seiten
gesamt: FA/VV/NB/Mahnung**. VorlagenSeite opt-in erweitert: `zeigeWarnungen`
(gates.warnungen) · `fehlerEingabe(a,schritt,gates)` · `blockerImLetztenSchritt`
(Mahnung false). §6 je Seite: gate grün, golden byte-gleich, Playwright-DOM
byte-identisch (alle Schritte/bedingte Felder/Mahnung beide Varianten) v/n.

(7) **Grundsatz David «kein Eingabefehler im leeren Zustand» (`05c1899`,
`2d69e8a`):** Fehlerbox erst nach erster Eingabe («berührt»). Wizards zentral im
`VorlagenWizardRahmen`; Rechner-Forms via internem `BeruehrtContext` +
layout-transparentem `BeruehrtRahmen` (display:contents) in `ui.tsx`, 11 Forms
umschlossen. «Weiter» bleibt bei leeren Pflichtfeldern gesperrt. golden byte-
gleich (Rechtslogik unberührt), Playwright-verifiziert. Memory:
[[formulare-kein-fehler-vor-eingabe]]. Die meisten Rechner haben ohnehin
Beispiel-Defaults (keine sichtbare Änderung) — betraf v.a. die Wizards.

**NICHT umgesetzt (bewusst, §1/Konflikt-Register):** Rollout `VorlagenSeite`
auf weitere Seiten — VariantenKopf-/Mehrschritt-/eigenes-Gate-Seiten bleiben
handgeschrieben); Phase 5 Verbatim-Hebung (Gefahrenzone), Persistenz-/i18n-
Features; David-Entscheide (Server-Sync, fr/it-Inhalt, LIK Python→TS). TODO:
Drift-Guard `check:abnahme` (Dossiers regenerieren + git diff). Push/Deploy nur
auf frisches Ja (§9).

## Session 13.6.2026 — V3 Vertrags-Grundtypen KOMPLETT + Verwaltungs-/BGG-Stillstand (GO David «weitermachen mit bau» + eingeschobener Auftrag)

**FAHRPLAN-VORLAGEN-AUSBAU V3 ist mit 4/4 Grundtypen FERTIG** (je eigener
Commit, je Gate GRÜN + Build prerendered):
(1) **Auftrag/Dienstleistungsvertrag** `41dccc3` — Art. 394 ff. OR;
Gegenstands-Module allgemein/Beratung/Treuhand/Inkasso, Vergütungsweiche;
Kern-Offenlegung zwingendes Auflösungsrecht Art. 404. (2) **Werkvertrag**
`704aa85` — Art. 363 ff. OR; Weiche beweglich/unbeweglich → Rügefrist
(60 Tage zwingend, Art. 367 Abs. 1bis) und Verjährung (2/5 J, Art. 371);
Festpreis/Aufwand; Brücke zum Gewährleistungs-Rechner; Rücktritt Art. 377.
(3) **Geheimhaltungsvereinbarung/NDA** `5aa4b62` — Innominat (Art. 19 OR);
einseitig/gegenseitig + Konventionalstrafe (Art. 160/161/163, richterliche
Herabsetzung offengelegt). (4) **Konkubinatsvertrag** `d081391` — Art. 19
OR / Art. 646/650/651 ZGB / Art. 530/548/549 OR; Module Wohnen/Kosten/
Inventar/einfache Gesellschaft/Auflösung; kein gesetzliches Konkubinats-
recht + Kindesbelange nach Gesetz offengelegt. Endstand: Zähler 47 gebaut/
43 sichtbar, Golden 159, Routen 49.

**EINGESCHOBENER AUFTRAG David («baue parallel den Verwaltungs-Stillstand
Art. 22a VwVG und den BGG-Stillstand Art. 46 BGG im fristenrechner»):**
neue Engine `lib/bggVwvgFristen.ts` (reine Kompositions-Schicht über
fristenEngine) + zwei Ferien-Optionen im EinfacheFristForm. Beide Regimes
teilen die drei Stillstandsperioden (Ostern ±7 · 15.7.–15.8. · 18.12.–2.1.)
und den Ruhen-Mechanismus mit der ZPO (golden-bewiesen periodengleich);
regime-treu erhalten (kein Kollaps, §4): Geltung NUR für nach Tagen
bestimmte Fristen (Wochen/Monate/Jahre ruhen NICHT — anders als ZPO 145),
Abs.-2-Ausnahmen je Regime verschieden (VwVG 2 / BGG 5), Werktag-
verschiebung Art. 20 III VwVG / 45 I BGG. Empirie handgerechnet
(10.9./11.1.2027/11.5.). Dossier `bibliothek/recherche/stillstand-vwvg-
bgg.md` (§11). Alle V0-Anker am Filestore-Cache verifiziert (OR/ZGB
20260101, VwVG 20220701, BGG 20260401; check:zitate 0 Befunde).

OFFENE FOLGEPOSTEN: fachliche Abnahme der V3-Vorlagen + des Stillstand-
Wortlauts durch David · V4 (Detailgrad-Schalter) · V5 ff. Ungepusht;
Push/Deploy nur auf frisches Ja (§9).

## Session 13.6.2026 (Nacht) — V2-Rest KOMPLETT: Zession · Fristerstreckung · Nichtbekanntgabe (GO David «arbeite einfach»)

**FAHRPLAN-VORLAGEN-AUSBAU V2 ist mit 4/4 Vorlagen FERTIG** (je eigener
Commit, je Gate GRÜN + Build prerendered + Playwright-Sichtcheck):
(1) **Abtretungserklärung (Zession)** `5d4ccf8` — Art. 164/165/167/170 OR
verbatim am 20260101-Cache; Schriftform-Unterschrift Zedentin, optionale
Gegenzeichnung, Zinsen-Klarstellung (170 III nur Vermutung), Hinweise
Abtretungsverbot/Anzeige/Verpflichtungsgeschäft. (2) **Fristerstreckungs-
gesuch** `fd10ff1` — Art. 143/144/148 ZPO; Frist-Art-Weiche (gesetzlich =
Blocker mit 148-Hinweis), Gesuch nach Fristende = Blocker, letzter Tag =
143-I-Warnung; Begründung Maske/Platzhalter; ThemenEinstieg am
ZPO-Fristen-Rechner. (3) **Nichtbekanntgabe Betreibung** `3d1fc99` —
Art. 8a III lit. d SchKG in der NEUEN Fassung seit 1.1.2026 (AS 2025 522)
verifiziert ([VF] der Analyse aufgelöst); Rechtsvorschlag-Pflicht,
3-Monats-Schwelle mit konkretem frühestem Gesuchstag (Klemmfall 30.11.
handgerechnet), ehrliche Wieder-Bekanntgabe-Offenlegung; ThemenEinstieg
am SchKG-Fristen-Rechner. Endstand: Zähler 43 gebaut/39 sichtbar,
Golden 134, Routen 45. OFFENE FOLGEPOSTEN: Prefill-Brücke zpo-fristen→
Fristerstreckung · SchKG-Anliegen «Nichtbekanntgabe» für den
VorlagenSprung (Entscheid David). Ungepusht; Push/Deploy nur auf
frisches Ja (§9).

## Session 12.6.2026 (spät) — Pauschal-Abnahme Wortlaute (David) + V2-Fortsetzung

**Pauschal-Abnahme David («alles abgenommen»), Protokoll
`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`:** Wortlaute
geo.admin-Datenschutz-Absatz + «Beim Bund nachschlagen» · Zefix-Absatz ·
KVG-Preset Maske 3 · TI-Miete-Texte · FE-1-WARUM/FE-2-Weiche ·
Mahnung-Bausteine · BGer-Hinweise inkl. Eheschutz-V-1 — sowie die
**P1-Priorisierung der Wettbewerbsanalyse** (V2-Rest/V3 ff. freigegeben).
NICHT umfasst (bleibt offen): Karten-«geprüft»-Hebungen (brauchen
Karten-Verdikt + Referenzfall-Protokoll; Paket Tagerechner liegt in
`.scratch/`), Teil D, Praxis-Rang-Kuratierung, Anliegen-Liste, übrige
Dossiers. Status-Stellen nachgeführt (Datenschutz.tsx-Kommentare,
Dossier-/INDEX-Zeilen, FAHRPLAN-VORLAGEN-AUSBAU, HANDLUNGSPLAN A.3/A.4);
Datenschutz-Seite als GANZE bleibt Entwurf (Platzhalter Ziff. 1/4).

## Session 12.6.2026 (abends) — StGB-Re-Pin vollzogen (Verfallsregister-Termin)

Der am 12.6.2026 fällige, terminierte **StGB-Re-Pin (AS 2026 231) ist
VOLLZOGEN:** `fedlex-cache.sh` neu `20260612|0` (No-Suffix wie im
Voraus-Check vorausgesagt). Empirie am Stichtag: Anker-Inventar 477/477
identisch; alle 7 engine-zitierten Pflicht-Anker normtext-identisch zu
20260101 (Diffs nur Fussnoten-IDs); materiell geändert NUR Art. 354/357
(Eurodac/Schengen-Datenaustausch, nicht verdrahtet). Nachgeführt:
Quellen-Register, Verfallsregister (nächster Stichtag 1.7.2026 ZGB/ZPO),
Dossier-Nachtrag `fedlex-pin-nachverifikation-2026-06.md`. Tore:
`check:caches` → `check:zitate` (616 Zitate, 0 Befunde) → `check:verfall`
(StGB-Meldung weg) grün. Kein Engine-Code berührt. Ungepusht; Push/Deploy
nur auf frisches Ja (§9). In 45-Tage-Vorschau weiter: ZGB/ZPO-Re-Pin +
Streitwert-Formeln 1.7. · SG GKV 30.6.

## Session 12.6.2026 (Fortsetzung) — TI-Miete gemeindescharf + vertiefter §9-Bug-Check (Auftrag David: «tessin vertiefung, bug check, push, deploy»)

**(1) TI-Miete VERDRAHTET** (`6cf5802`) — der LETZTE Kanton ohne
Miete-Auto-Auflösung ist geschlossen (12/12 Register + 13 zentral +
NE-Wahl): Zuordnung amtlich doppelt belegt (Art. 5 LALoc RL/TI 3.3.2.1.4
+ amtliche Località-Suche locazione, **168/168 einzeln abgefragt**);
Praxis-Quelle geht dem 2005er-Wortlaut vor (Ex-Sonvico → n. 4, Claro →
n. 11). 97 Gemeinden eindeutig (TI_MIETE, Dossier §51 + Patch-Generator)
+ 3 Mehr-Uffici-Gemeinden via Ortsteil-Wahl (Lugano n. 3/4 · Bellinzona
n. 9/10/11 · Val Mara n. 5/2). Stammdaten-KORREKTUR Agno: Contrada
Nuova 3. 8 Selektor-Optionen = kantonale CMS-Lücken, über Mutter-
gemeinden geschlossen; Giudicature-Lücken (Ambrì/Pianezzo/S. Antonio/
Torre) am 12.6. nachgefasst: beim Kanton unverändert offen.
**(2) VERTIEFTER §9-BUG-CHECK (Auftrag David), 6 unabhängige Lupen**
(Code · fachlich mit ~45 amtlichen Gegen-Abfragen · Empirie/E2E ·
Daten-Integrität über ALLE Indizes · Integration/SSG · Edge-Cases mit
echten Aufruf-Batteries): **1 HOCH + 5 MITTEL + 7 NIEDRIG, alle
relevanten GEFIXT** (`4bc80e8`): HOCH TI-Miete-Ortsteil-Meldung sass im
unerreichbaren verzeichnis-Zweig (3 Lupen übereinstimmend; jetzt im
liste-Zweig, empirisch verifiziert) · kreisIdx jetzt geschlüsselt
(stale Wahl reiste in neue Liste: 8044→8050 meldete 0.2-%-Amt) ·
kantonFest-Guard in PlzGemeindeWahl (kantonsfremde Strassen-Auflösung
wird offengelegt) · Bund-Übernahme leert ZH-Strasse · Apostroph
U+2019↔ASCII + ALL-CAPS-«STR.» in strassenKandidaten (~1'300
Romandie-Strassen) · Versatz-PLZ ohne Index blenden das Strassenfeld
aus · FL-404-Meldung · KVG-64a-Warnung um Kinder-Ausnahme präzisiert
(deklariert, Fedlex wörtlich). Bestanden u. a.: SSG-Tore/Chunks sauber
(Daten nur lazy), PDF-Kette §5, CSP, alle Daten-Invarianten exakt,
0 Falschtreffer/0 Exceptions in allen Edge-Batteries, ti.ch/WFS/Fedlex-
Stichproben deckungsgleich. **OFFEN dokumentiert:** SZ ordentlich 26/30
(Alpthal/Lauerz/Steinerberg/Wangen fehlen quellbedingt — SZ-Vermittler-
Erhebung als Kandidat; SZ_MIETE deckt 30). Tore: gate voll GRÜN.
**PUSH + DEPLOY VOLLZOGEN (12.6.2026): origin/main = Prod = `7ff7315`**
(dpl_CWUebRfaqtCdhzraMDHJYr9qXpuu, /tmp-HEAD-Worktree, Hash live=lokal
index-B8c9RHkx, 8/8 Kernrouten 200, CI grün). **CSP-Klicktest auf Prod
BESTANDEN:** Bundes-Adresssuche live (Limmatstrasse 152 → 8005/Zürich/ZH
übernommen, 0 CSP-Fehler — connect-src api3.geo.admin.ch wirkt);
ZH-Kreis-Automatik auf Prod verifiziert. **Verfallsregister meldet
fällig: StGB-Re-Pin 12.6.2026 (AS 2026 231) — nächste Session.**

## Session 12.6.2026 — ZH-Kreis-Automatik + Adress-Ausbau Stufen 1–3 (Entscheide David, ungepusht)

**(0) Verifikationsfrage David beantwortet** (`8842bfd`): Stadt-Zürcher
PLZ sind **NICHT kreisscharf** (16/30 mehrkreisig; amtliche
Gebäudeadressen Stadt ZH, 56'666 real) — dank Ämter-Paarung sind 19 PLZ
amts-eindeutig → **Kreis-Automatik**: eindeutige PLZ lösen das
Kreis-Friedensrichteramt automatisch, mehrdeutige zeigen die
eingegrenzte Wahl mit Adressenanteil (dominant vorausgewählt), Postfach
→ Sechser-Wahl. Generator `zh-kreise-generieren.ts` → zuerichPlzKreise.
**(1) Stufe 1** (`0ec3a5d`): Strasse (+ Nr.) → Kreis-Amt offline
(`zhStrassen.json`, 1'984 Strassen, 58 amts-übergreifende per
Hausnummer; 26 KB gz); Vorrang Strasse → PLZ → Wahl, beide UIs.
**(2) Stufe 2** (`3bd6a9a`): schweizweit Strasse (+ Nr.) → Gemeinde bei
den 1'213 gemeinde-mehrdeutigen PLZ (47.4 % aller Adressen) — swisstopo
Gebäudeadressverzeichnis (3.24 Mio real) → `strassenVerzeichnis.json` +
`strassenNummern.json` (91'218 eindeutige Strassen, 1'425 Grenzstrassen
per Nummer; ~0.56 MB gz, eigene Lazy-Chunks); wirkt in PlzGemeindeWahl
(alle Eltern-UIs); kantonsübergreifend belegt (4052 Birswaldweg →
Münchenstein BL). Lint-Härtung `cb917b6` (PLZ-geschlüsselter Zustand).
**(3) Stufe 3** (`10ce93d`): `AdresseBundSuche` (§10) — Freitext-Adresse
über die Bundes-API (geo.admin.ch SearchServer + GWR-Detail) NUR auf
Klick, **permanenter Übermittlungs-Hinweis** + Offline-Alternative
benannt (Anweisung David); kantonsfremde Treffer offengelegt statt
übernommen; CSP + api3.geo.admin.ch (nur am echten Vercel prüfbar);
/datenschutz-Absatz ENTWURF. Empirie: Playwright beide UIs inkl.
Live-API (Bundesplatz 3 Bern → 3011/Bern/BE); 8044-Lehrstück
(Gockhausen→Dübendorf): Kreis-UI korrekt erst nach Gemeinde-Wahl.
Dossiers: gebaeudeadressverzeichnis-adressaufloesung.md (+ Verfalls-
Kandidat Re-Generierung 1.10.2026) · ZH-Vollerfassung Nachträge.
**OFFEN für David:** Wortlaut-Abnahmen (Datenschutz-geo.admin-Absatz,
«Beim Bund nachschlagen», Hinweis-Texte) · Verfallsregister-Eintrag
1.10.2026 entscheiden. Tore: gate voll GRÜN, Build 38/38.
**16 Commits ungepusht — Push/Deploy nur auf frisches Ja (§9).**

## Ältere Session-Karten und Chroniken — rotiert ins Archiv

Verbatim verschoben nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(FAHRPLAN-TOKEN-DISZIPLIN.md T-4): **13.6.2026** alle sieben 11.6.-Karten
(früher Abend · später Nachmittag · abends · nachmittags · vormittags ·
über Nacht · Tag «Schlichtung fertig + Vollerhebungen») · **11.6.2026**
Sessions 10.6. abends (STRUKTUR-UMBAU S-1–S-6) und nachmittags
(Fristen-Einheit FE-1–FE-6) · 7.6. abends (Betreibungsamt-Finder) und
nachts (Plan 9b Volldokumente) · 6.6. abends und nachmittags ·
Verschlankung 5.6.2026 · Session-Abschluss 6.6.2026.

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
