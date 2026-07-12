# FAHRPLAN-DESIGN-WAERME — Farbklima, Wärme, Atmosphäre, Typografie

Stand: 11.7.2026 · Auftrag David (wörtlich): «ultracode recherche zu design und plan
erstellen. also hinsichtlich farbe und wärme und so weiter» + «direkt umsetzen wenn
plan vorliegt». ROADMAP-Schritt **W2·11-DESIGN**. Trailer `Roadmap: W2·11-DESIGN`.

Quelle: Ultracode-Recherche 11.7.2026 — 48 Befunde (24 empirische Mess-Befunde am
Live-Stand + 24 Forschungs-Befunde: Anthropic/Claude-System, Flexoki, Radix, Stripe,
iA Writer, OKLCH/Evil Martians, APCA, Lesbarkeits-/Dark-Mode-Literatur), adversarial
durch 3 Kritik-Linsen (reglement-treue · umsetzbarkeit · geschmacks-kohärenz)
gegengeprüft. Kernsatz der Kohärenz-Linse: **Die Forschungs-Schicht IST der Plan,
die Mess-Befunde sind ihre Symptomliste — System vor Symptom**, sonst entstehen zwei
konkurrierende Wärme-Kanäle (Patchwork).

**Achtung Befund-Vintage:** Teile der Messungen datieren vor den Merges vom
10./11.7. (C-1/C-2/C-3 Farb-Wörterbuch, #201). Vor jedem Bau-Schnitt den betroffenen
Ist-Stand am Prod/HEAD **re-verifizieren** (Muster W2·10-UI-NAV) — z. B. die
Currency-Chip-Tonung sage/warn (Befund 7) ist durch C-2 bereits gebaut.

---

## 0 · Fixpunkte (unantastbare Anker)

1. **`--paper` hell `#FAF8F2` / dunkel `#16150F` sind FIXPUNKTE.** Alle Bewegungen
   relativ dazu; die color-mix-Rezept-Architektur (alles hängt an `--paper`/`--ink-900`)
   bleibt der EINE Wärme-Steuerhebel.
2. **Farb-Wörterbuch C-1/C-2/C-3 (11.7.) ist semantischer BESTAND:** brass=Norm/
   Marke/Wortlaut-Referenz, slate=Entscheid, sage=Materialien + Currency «geltend
   geprüft (maschinell)», warn=Vorbehalt. Jede Wärme-Massnahme trägt es, keine
   stürzt es. Die gemessenen Kontraste vom 10./11.7. (slate 4.81/3.47 · warn
   5.24/9.43 · brass 4.91/10.48) sind **Regressions-Referenz** — nach jeder
   Token-Verschiebung neu messen und in `DESIGN-REGLEMENT-NORMTEXT §4b-B`
   nachziehen (D3/F6: dokumentierte Zahlen dürfen nie stillschweigend falsch werden).
3. **golden byte-gleich** für Normtext/Dokument-Outputs: alle Einheiten sind CSS-/
   Token-/Klassen-/Doku-Ebene → golden bleibt unberührt; trotzdem je PR
   `golden:vergleich` + `check:struktur-konsistenz` als Beweis, nicht Annahme.
4. **§15 Performance:** keine Textur-Assets/Noise-Overlays, kein zusätzlicher
   Font-Download; Wärme nur über Tonwerte.
5. **WCAG-Mess-Gate hell UND dunkel (§13/F2)** ist das harte Tor; APCA nur beratend.

## 1 · Die fünf tragenden Design-Entscheide

**E1 — Ein Papier, eine Tinte, ein Winkel.** Wärme entsteht ausschliesslich durch
OKLCH-Rekalibrierung der **neutralen** Achsen auf den Brass-Hue (~85–95°): ink-Rampe
hue-normalisiert (L halten), Flächen-Treppe mit Flexoki-Chroma-Tiefe-Kurve
(tiefer = mehr Chroma), alle `color-mix`-Rezepte in `oklab` statt `srgb`,
Reinweiss/Roh-Grau als Lesefläche verboten. **KEIN zweiter Wärme-Kanal:** kein
`--paper-warm`-Brass-Mix auf Arbeitsflächen, kein Sepia-Modus, keine flächen-lokalen
Warmtöne.

**E2 — Brass ist Signal, nicht Klima.** Klima-Wärme kommt aus E1 (60/30-Schicht);
Brass bleibt knappes Bedeutungs-/Marken-Signal (10 %). Dramaturgie: **warm
empfangen (Startseite/Rubriken), neutral-kühl prüfen (Entscheid/Rechner/Fristen)**
— der Temperatur-Kontrast des Wörterbuchs ist Feature, nicht Fehler. Signaturen
(gravierte Brass-Linie `scale-rule`, Schraffur, Regeste-Box) als katalogisierter
Motiv-Rhythmus an 2–3 definierten Orten, nicht als Tapete.

**E3 — Zwei Stimmen, eine deklarierte Ausnahme.** Serif (Source Serif 4) =
zitierfähiger **Werkstoff** (Normtext, Entscheidtext, Regesten, Zitate); Sans
(Geist) = **Werkzeug** (alle Produkt-UI); Mono radikal zurückgeschnitten auf echte
Sektions-Overlines + Zahlen/Aktenzeichen (`.num`). Display-Serif höchstens als EIN
definierter Marken-Moment — nur per David-Entscheid mit Perf-Messung (F5-Revision,
Geist-Entscheid 6.6.2026), nie autonom.

**E4 — Ein Lese-Register, Kontrastfenster statt -maximum.** Gemeinsame Dach-Tokens
`--reading-ink` (ink-800 in BEIDEN Modi — dämpft dunkel zugleich Halation) und
`--lese-fs`/`--lese-lh` für beide Reader; EINE Lesespalten-Regel für Regeste,
Rechner-Verdikt-Prosa und alle Langtexte; CPL erst messen, dann ändern.

**E5 — Rollen vor Stufen, Messung vor Geschmack.** Erhebung primär über Ton +
Haarlinie («Ton vor Schatten»; Schatten sekundär, ab «schwebend»). Rollen-Alias-
Schicht über den Basis-Skalen (Radix-Stufenlehre), damit künftige Rekalibrierungen
reine `:root`-Eingriffe sind. EIN Farbwelt-Mess-Tor (`check:farbwelt`) VOR jeder
Wert-Änderung — heute existiert **kein** Kontrast-Script, nur die axe-e2e-Stichprobe;
Nicht-Text-Kontraste (WCAG 1.4.11) fängt sonst niemand. Messbare Verstösse/Bugs
gehen VOR jede Atmosphäre-Arbeit.

## 2 · Bau-Einheiten (Reihenfolge ist harte Abhängigkeit)

Jede Einheit = eigener PR mit Mess-Quittung (Output `check:farbwelt` ab D-0),
axe-e2e hell+dunkel, golden-Beweis. Token-Einheiten (D-3…D-6) sind flip-reversibel;
Call-Site-Einheiten (D-8) nicht → Pilot zuerst. Bau durch Opus (Daueranweisung).

### D-0 · Mess-Fundament `scripts/check-farbwelt.ts` — SCHRITT 0 ✅ (PR #209, 11.7.2026)

**✅ GEBAUT (Nachtrag durch D-1 — der D-0-Branch entstand vor dem #208-Merge):**
`check:farbwelt` live in `check:seriell`→`gate` (culori+apca-w3 devDep): 40
WCAG-Pflichtpaare hell+dunkel (FAIL), 6 §4b-B-Referenzwerte + 2 --paper-Fixpunkte
(FAIL bei Drift), Flächen-L-Leiter (FAIL); Hue-Drift/L-Monotonie/Chroma-Dämpfung
Erstlauf-WARNUNG; APCA nur beratend. Bekannte Risse als Baseline-Guard:
ink-500/well hell 4.48 (→D-4) · danger-500/paper dunkel 2.72 (→D-1.3).
Sollwert-Tabelle: `DESIGN-REGLEMENT.md` §F2b.
*(Befunde 33+38+40; ohne dieses Tor ist jedes «Kontrast-Gate» der Folge-Einheiten Prosa)*
- **Kern:** Script (culori, devDep + apca-w3) parst alle `:root`- und `html.dark`-Token
  aus `src/index.css` und prüft: (a) **WCAG-Paare hell+dunkel als FAIL** (Text ≥4.5:1,
  Nicht-Text/Linien ≥3:1 — die dokumentierten Paar-Listen aus den CSS-Kommentaren
  werden zu Assertions); (b) OKLCH: Hue-Drift je Familie ≤ ~8°, L-Monotonie je Rampe —
  **Erstlauf als WARNUNG** (die Ist-ink-Mitten reissen die Schranke heute; erst
  Sollwerte D-4/D-5 festlegen, dann scharf); (c) Dunkel-Rezept als Regel: Flächen-
  L-Leiter (well < paper < surface < raised, Delta ~0.02–0.03) + Chroma-Dämpfung
  (Akzent dunkel C ≤ hell −10 %); (d) **APCA-Spalte nur beratend** (Lc-Ziele Fliesstext
  ≥75 / Meta ≥60 / Nicht-Text ≥45), nie Fail — Erst-Fokus Dunkel-Paare.
- **Fläche:** `scripts/check-farbwelt.ts` neu, `package.json` (in `npm run check`),
  Sollwert-Tabelle als §13-Nachtrag in `DESIGN-REGLEMENT.md`.
- **Aufwand:** M · **Golden:** neutral (reines Prüf-Script, kein Runtime).

### D-1 · Sofort-Fixes (messbare Verstösse/Bugs — kein Geschmacksurteil, kein David-Entscheid) ✅ (12.7.2026)

**✅ GEBAUT (9 Posten, je eigener Pathspec-Commit mit Messwert vorher→nachher):**
1 FS-Null-Guard (Erstbesucher 1.0→1.08rem; Einstellungen-Bridge nicht betroffen) ·
2 Overline-AA (55 Overrides gestrippt, ink-500/well 4.48→ink-600 6.65; Regex-Gate in
`check:design-tokens`, Negativ-Beweis) · 3 sage/slate-line-Aliasse + 7 Call-Site-Swaps
(danger dunkel 2.72→7.54; +3 farbwelt-Pflichtpaare 40→46; -500-Mitten unangetastet) ·
4 Regeste in max-w-reading (~115–120→~70–75 CPL; Prerender = reine SEO-Shell, nicht
betroffen) · 5 Verdikt-Prosa max-w-reading (nur Prosa-`<p>`, 18 Formulare im geteilten
Rahmen) · 6 Chevron-Hex #8A6A2F→#826225 (4.37→4.91 auf well) · 7 Motion-Dedup
(`var(--dur-*)`) · 8 `--ink-fixed-dark`-Solitär (VOR D-4) + `--placeholder` als
dokumentierte Stufe · 9 `--status-outline/-border-soft/-hatch` (45/30/26 %,
verhaltensneutral). golden 209 byte-gleich; danger-RISS im Tor bleibt als
Token-Paar-Baseline bis D-4/D-5 (Call-Sites aliassiert).
*(Befunde 19, 18, 11, 20, 21, 12, 14, 15, 10 — alle klein, golden-neutral)*
1. **FS-Bug Entscheid-Reader** (19): `ladeFsIdx()` in `src/pages/EntscheidLeser.tsx:88–93`
   — `Number(null)===0` → jeder Erstbesucher liest 1.0rem statt Default 1.08rem
   (stiller R2-Bruch). Null-Guard-Einzeiler; Bridge-Pfad `src/pages/Einstellungen.tsx`
   (gleicher Key `rsp-fs-idx`) mitprüfen. Danach live 17.28px nachmessen.
2. **Overline-AA-Verstoss** (18): ~50 Fundstellen `lc-overline text-ink-500`
   degradieren die kalibrierte ink-600-Basisklasse auf 4.05:1 bei 11px (AA-Fail auf
   getönten Flächen). Overrides `text-ink-(500|400|300)` neben `lc-overline`
   mechanisch strippen (brass-Pairings stehen lassen) + **E1-Schranke** gegen das
   Muster in `scripts/check-design-tokens.ts` (98 Z., genau dafür gebaut) — axe war
   trotz Verstoss grün, das Regex-Gate ist der einzige Wächter.
3. **Dark-1.4.11-Fail danger/slate** (11): `html.dark` überschreibt nur -700-Töne;
   danger-500 fällt dunkel auf 2.72:1 (<3:1) bei direkter Nicht-Text-Nutzung
   (SperrtageZaehler-Balken, `border-t-danger-500`-Call-Sites, Einstellungen-Border).
   Fix nach dem bestehenden `--danger-line`-Muster: Aliasse `--sage-line`/`--slate-line`
   (dunkel auf -700 hebend) + ~4 Call-Site-Swaps. **-500 NIE dort verschieben, wo es
   die `-bg`-color-mix speist.** `text-warn-500` (RechnerKarte:79) ist aria-hidden-Deko
   — billig mitfixen, kein harter Fail.
4. **Regeste in die Lesespalte** (20): `RegesteBlock` rendert in
   `EntscheidLeser.tsx:~464` VOR dem `max-w-reading`-`<article>` → ~115–120 CPL im
   wichtigsten Textblock. Nur Render-Pfad 1 fixen (Pfad 2 bei Z.600/617 liegt schon in
   der Spalte); erst ohne eigenes Mass probieren, ggf. dokumentiertes ~44rem-Token
   (Box-Optik brass bleibt).
5. **Rechner-Verdikt-Prosa** (21): ~135 CPL bei 14px (B2-Verstoss). Lesespalten-
   Schranke NUR für Prosa-`<p>` im geteilten Ergebnis-Baustein
   (`ErgebnisAnzeige.tsx`/`ErgebnisBlock.tsx`) — Kacheln/`lc-tile`/Tabellen unbegrenzt;
   vorher grep-verifizieren, dass die Verdikt-Prosa wirklich durch den geteilten
   Rahmen läuft; Playwright-Stichproben über mehrere Rechner.
6. **Select-Chevron-Drift** (12): data-URI trägt VOR-Kalibrierungs-Hex `#8A6A2F`
   (index.css:427) ≠ kalibriertes brass-700 `#826225`. Nur Hex nachziehen + Kommentar
   «= --brass-700, bei Rekalibrierung mitziehen». CSS-mask-Variante ist am nackten
   `<select>` NICHT machbar (background trägt die Well-Füllung) — verworfen.
7. **Motion-Dedup** (14): `tailwind.config.js:62` transitionDuration-Literale auf
   `var(--dur-*)` mappen (Muster der Nachbar-Keys) — index.css wird EINE Motion-Quelle.
8. **Solitär-Bindung** (15): `--ink-fixed-dark:#1A1A17` einführen, helles ink-900 UND
   `--auf-gold` daraus speisen (Nicht-Flip-Absicht bleibt); `--placeholder` als
   dokumentierte Stufe führen. **VOR D-4 einbauen** (Reihenfolge-Abhängigkeit).
9. **Status-Zwischenton-Tokens** (10): die drei Magic-Mixe 45 %/30 %/26 %
   (Z.498/501/389) sind DREI Rollen (Badge-Outline · Soft-Border · Schraffur-Streifen)
   → drei benannte Tokens, gleiche Endwerte (§6 verhaltensneutral), Komponenten drauf.
- **Aufwand:** S–M je Posten · **Mess:** betroffene Paare hell+dunkel, axe-e2e.

### D-2 · Rollen-Schicht + deklarierte §13-Reglement-Nachträge ✅ (12.7.2026, PR feat/design-d2-rollen)
*(Befunde 39+9 [Alias statt Werte-Tausch] + Doku 26a/28/29/31/32/41/43/47 + Fehlstellen F1/F5 der Kohärenz-Linse)*

**GEBAUT (Opus, autonom):** Rollen-Alias-Schicht additiv in `src/index.css` +
`tailwind.config.js` (Akzent `--accent-*`, Status `--{sage,slate,warn,danger}-solid/
-text`, Zustand `--ok-*`). Befund 9 gelöst OHNE Werte-Tausch (die Dark-Brass-
Inversion trägt `--accent-hover` = brass-800, erbt den Flip aus den Familien-Token).
F1 aufgelöst: `lc-badge-ok`/`lc-live`/`lc-termin-ring` auf `--ok-*` migriert
(grep-vollständig; sage bleibt Materialien/Currency). Reinweiss-Invariante (d) ins
Gate `check:design-tokens` (negativ-kontrolliert). §13-Nachträge a–j als Block G in
`DESIGN-REGLEMENT.md`. **Beweis:** `check:farbwelt` vorher==nachher BYTE-IDENTISCH
(46/6/2/9 unverändert — Aliase sind für das name-basierte Tor inert); golden 209
byte-gleich; dist-CSS-Kette `--ok-*→sage`/`--accent-*→brass`; `npm run gate` grün;
axe-e2e 26/26 hell+dunkel; Visual-Belege 8 Screens in `abnahme/design-waerme/d2/`.
Gegenprüfung n/a (reine Token-Schicht). Trailer `Roadmap: W2·11-DESIGN`.
- **Rollen-Aliase (rein additiv, keine Wertänderung):** je Familie
  `--accent-bg`(=brass-100) / `--accent-bg-hover`(=200) / `--accent-line-decor`(=300) /
  `--accent-line` / `--accent-solid`(=500) / `--accent-text`(existiert) /
  `--accent-text-strong` / `--accent-hover`; analog status-Familien. Löst Befund 9
  sauber: die **absichtliche** Dark-Brass-Inversion (800 hellster Ton, a:hover-Logik
  Z.209–211) wird NIE durch Werte-Tausch «repariert», Komponenten greifen Rollen.
  In `tailwind.config.js` exportieren; Regel «Basis-Stufen sind privat» gilt nur für
  NEUE Komponenten, Bestand opportunistisch migrieren (kein Riesen-Diff).
- **§13-Nachträge (deklariert, DURCH das Reglement — je ein Absatz in
  `DESIGN-REGLEMENT.md`, prüfbare Teile ins Gate):**
  a. **«Brass ist Signal, nicht Tapete»** (28) + Squint-Test je Kernseite als
     Abnahme-Ritual; grosse brass-Flächen nur für semantisch Massgebliches.
  b. **«Ton vor Schatten»** (26a) — Erhebung primär Flächenton + 1px `--line`,
     Schatten sekundär ab «schwebend» (Dropdown/Popover/Modal); KEIN Schatten-Verbot
     (lc-card-Doppelsignal bleibt). Regel «Tiefe = Stufe + Border, nie Schatten allein».
  c. **Temperatur-Dramaturgie** (32): Zuordnung Fläche→Temperatur (Einstieg warm,
     Prüf-/Arbeitsflächen neutral-kühl akzentuiert) — trägt das Wörterbuch.
  d. **Reinweiss-Invariante** (41): kein `#FFFFFF`/`bg-white` als Lesefläche
     (`--paper-raised` nur kleine erhabene Flächen); Gate-Erweiterung
     `check:design-tokens` (heute 0 Treffer = billige Versicherung); dokumentierte
     Ausnahmen `@media print` (body #fff, Z.318) + `text-paper` auf ink-Buttons.
  e. **Zwei-Stimmen-Regel** (43): Serif ausschliesslich+vollständig für zitierfähigen
     Quelltext; Sans für Interaktives; Mono für Zahlen/Aktenzeichen. grep-Audit über
     `font-serif`-Verwendungen. Keine dritte Schrift (§15).
  f. **Linien unter der Tinte + Textur-NEIN** (31): Struktur-Linien immer schwächer
     als ink-600-Sekundärtext, nur über color-mix-Tokens; explizites NEIN zu
     Papier-Texturen/Noise (auch §15).
  g. **Wärme-Architektur** (47): «Wärme wird ausschliesslich über --paper/--ink-
     Basiswerte + Rezepte gesteuert; niemals flächen-lokale Warmtöne; kein dritter
     Modus»; Änderungspfad dokumentiert.
  h. **Navy-Fussnote** (29): slate bleibt Entscheid-Semantikton, nie Markenfläche —
     Identität nicht Richtung Kanzlei-Navy «absichern» (Legal-Branding-Evidenz).
  i. **F1 Werkstoff- vs. Zustandsfarbe (grösste Wörterbuch-Lücke):** sage ist heute
     DOPPELT belegt (Materialien-Kennfarbe UND ok/Live-Zustand: `lc-badge-ok`,
     `lc-live`, `lc-termin-ring`). Entscheid dokumentieren: Zustands-Aliasse
     `--ok-*` einziehen (dürfen hell auf sage-Werte zeigen, heissen semantisch
     anders) — sonst bleibt jede Status-Einfärbung zweideutig (stolperten Befunde 7+37).
  j. **F5 Interaktions-Zustände:** Wärme-Verhalten von hover/active/selected als
     Regel (eine Flexoki-Stufe «tiefer»: mehr C, weniger L) — verhindert das nächste
     Patchwork.
- **Aufwand:** S–M · **Golden:** neutral (additiv + Doku).

### D-3 · color-mix `srgb` → `oklab` (eigener Mess-Commit)
*(Befund 36 — grösster Wärme-Hebel pro Zeile: srgb-Interpolation frisst bei 10–18 %-Tönungen Farbigkeit → Status-Flächen grauer/kälter als das Rezept verspricht)*
- **Kern:** `in srgb` → `in oklab` in den vier `-bg`-Rezepten
  (`--sage-bg/--slate-bg/--warn-bg/--danger-bg`) + Linien-Mixen (`--line`,
  `--line-strong`, `--guide-gliederung`/`--rule-artikel`/`--rule-struktur`).
  Mechanisch (~19 Fundstellen), Baseline-Support gegeben, Wort-für-Wort-revertierbar.
- **Harte Auflage:** verschiebt ALLE gerenderten -bg/-line-Werte site-weit → C-1-
  Referenzwerte (slate-Tick 3.47 dunkel ist KNAPP) + `lc-badge-soft`/`lc-badge-entwurf`
  in BEIDEN Modi durch D-0 messen, Kommentare in index.css/e2e nachführen;
  `check:linien-kanon` bleibt grün (prüft Verwendung, nicht Werte). VOR D-4/D-5 —
  sonst misst man alte srgb-Fehler in die neuen Rampen ein.
- **Aufwand:** S · **Golden:** neutral (CSS-only).

### D-4 · Ink-Wärme: EINE Hue-Normalisierung der Grau-Achse
*(Befunde 3+34 konsolidiert [Radix-Regel «saturated gray closest to accent»] + 15-Anteil)*
- **Kern:** ink-Rampe (900…300) + `--placeholder`, hell UND dunkel (16 Werte), in
  OKLCH auf EINEN Ziel-Hue (~Brass-Hue 85–95°) normalisieren; Chroma als flache
  Glocke (C≈0.008 an den Enden, C≈0.012–0.015 in den Mitten 600–400 — dort sitzt
  Sekundär-/Metatext, die sichtbarste Wärme-Fläche); **L halten** (WCAG-Näherung,
  trotzdem F2-Messung, keine Annahme). Haarlinien erben via Rezepte automatisch.
- **Mess-Pflichten:** ink-500 ≥4.5:1 auf paper/surface/well; `--placeholder` ≥4.5:1
  auf well (heute 4.75, knapp); D-0 danach für ink scharf schalten (Hue-Drift-Assert).
- **Referenzfälle:** Startseiten-Untertitel/Meta-Zeilen, Rechner-Hilfetexte, Footer.
- **Aufwand:** M · flip-reversibel.

### D-5 · Flächen-Wärme: Papier-Treppe im OKLCH-Raum (EIN Entwurf)
*(Befunde 2+35 konsolidiert; Befund 1 als Diagnose übernommen, seine `--paper-warm`-Mechanik VERWORFEN — E1-Veto)*
- **Kern:** `--surface`/`--paper-raised` sind heute KÜHLER als `--paper` (R−B 6/4 vs. 8)
  — Karten entziehen der Seite Wärme. Beide tonal auf die Papier-Achse (Ziel-Hue =
  brass), **heller als paper bleibt Pflicht** (Erhebungs-Logik); zugleich
  Flexoki-Kurve: je tiefer die Fläche (raised → paper → sunken/well), desto mehr
  Chroma bei sinkendem L (sunken/well ≈ C 0.015→0.022) — Wells/Eingabefelder lesen
  sich als «tieferes Papier» statt graue Mulde. Dunkel-Pendants mitkalibrieren.
  Danach messen, ob ein warmer Panel-Ton überhaupt noch fehlt (erwartet: nein).
- **Mess-Pflichten:** ink-500/surface (heute 5.01:1) und alle Chip-/Badge-Paare auf
  surface/well, hell+dunkel; `--placeholder` auf dem neuen well.
- **Referenzfälle:** Gesetze-Übersichtskacheln, Rechner-Karten, «Schnell rechnen»-
  Panel, Eingabefelder Verjährungs-Rechner.
- **Aufwand:** S–M (reiner :root-Edit, Z.39–47 + html.dark) · flip-reversibel.

### D-6 · Dunkel-Paket: Elevation, Schatten, Scrims (EIN PR)
*(Befunde 5+13+27+30 konsolidiert; Regelwerk 38 steckt schon in D-0(c))*
- **Kern:** (a) `--surface` dunkel eine halbe Stufe heben — EIN Wert entscheiden
  (~`#232019`, Ziel ≥1.12–1.15:1 gegen paper; heute 1.06:1 = Karten verschmelzen);
  `--paper-raised` eine Spur nach. (b) Dunkel-Schatten von reinem Schwarz
  `rgba(0,0,0,…)` (Z.192–194 — einziger kalter Fremdkörper) auf warme Basis
  (`--paper-sunken`-Ton `#100F0A`, Opazität leicht rauf). (c) optionale hauchfeine
  Lichtkante (`inset 0 1px 0 color-mix(ink-900 6%)`) als dunkle Entsprechung des
  warmen Papier-Schattens — gegen forced-colors/print prüfen. (d) Scrim-/Overlay-
  Audit: schwarze rgba-Scrims auf color-mix mit `var(--paper-sunken)` (grep zeigte
  TSX rgba-frei; Utilities mit `/alpha` prüfen).
- **Mess-Pflichten:** Karten-Rand/Nicht-Text 3:1 dunkel; L-Leiter-Assert D-0(c);
  axe dunkel.
- **Referenzfälle:** dunkle Gesetze-Übersicht, BGer-Karten Startseite, Modal/Drawer.
- **Aufwand:** S–M (Token-only, Z.161–194) · flip-reversibel.

### D-7 · Ein Lese-Register: `--reading-ink` + `--lese-fs`/`--lese-lh`
*(Befunde 42+45+23 konsolidiert + 44 Messung; Bug 19 ist schon in D-1 gefixt)*
- **Kern:** (a) `--reading-ink: var(--ink-800)` hell UND dunkel (Kontrastfenster
  ~10–12:1 statt Maximum; dunkel dämpft Halation — «Dark-Lesetext nie auf dem
  hellsten Ink-Ton»). Bestand: ArtikelLeser UND EntscheidBody stehen schon auf
  ink-800 → grossteils Formalisierung; realer Diff = Token + `RegesteBlock` (3×
  ink-900) umstellen. ink-800 auf brass-100-Fläche (Regeste!) nachmessen.
  (b) `--lese-fs`/`--lese-lh` als Dach-Basis beider Reader; Entscheid-Stepper
  (FS_STUFEN) auf Multiplikatoren des Basis-Tokens. Unifikations-Wert EINMAL
  entscheiden — Empfehlung **1.125rem** (liegt IN R2s Fenster 1.08–1.125, Gesetz-
  Leser nutzt es schon; real `leading-[1.65]`, nicht 1.625); der lh-Entscheid
  (1.65 vs. 1.7) wird einmal getroffen und in BEIDEN Domänen-Reglementen
  nachgezogen. Vorher/Nachher-Screens beider Reader in die Abnahme-Mappe.
  (c) CPL-Messung (44): Playwright im echten Reader (Art. 1 OR, volle Zeile);
  `maxWidth.reading` **NICHT global senken** (38 Call-Sites site-weit) — bei
  >72 CPL reader-spezifisches Mass-Token oder Serif-Feinstufe.
- **Regel in beide Domänen-Reglemente:** «Langtext = reading-ink; ink-900 nur
  Überschriften/Labels/kurze UI-Texte.»
- **Aufwand:** M · **Golden:** neutral (nur Klassen/Token; trotzdem Beweis je PR).

### D-8 · Anwendungs-Schicht: Wörterbuch auf die Fläche + Mono-Diät
*(Befunde 4, 17, 8, 6 — Call-Site-Arbeit, NICHT flip-reversibel → Pilot zuerst)*
1. **Slate auf Entscheid-Flächen** (4): Rubrik-Label + Leitentscheid-Chrome des
   Entscheid-Lesers auf slate-Rollen (Wörterbuch erlebbar machen; heute alles brass).
   **Die Regeste-Box-Kante bleibt brass** — amtlicher Wortlaut = exakt die
   brass-Semantik («massgeblich/Wortlaut-Referenz»); Umstellung wäre
   Wörterbuch-Verletzung. slate-Flächen dunkel gegen 3:1 messen (3.47 knapp).
2. **Mono-Diät** (17, Atmosphäre-Haupttreiber: 55 % Mono-Anteil Startseite):
   F5-Neufassung als deklarierter Reglement-Schritt — Mono nur noch (a) echte
   Sektions-Overlines, (b) Zahlen/Normzitate (`.num`, lc-chip). Feld-Labels/
   Hilfetexte auf Sans mit normalem Case. **KEIN zentrales `src/components/ui.tsx`**
   (nur `vorlagen/ui.tsx` = Wizard) — Labels leben verteilt in
   `DatumsFeld`/`BetragsFeld`/`forms/*` (~50 Stellen) → **Pilot** (Startseite +
   1 Rechner), Vorher/Nachher-Screens in die Abnahme-Mappe, dann mechanischer Rest.
   Datums-/Grusszeile in **Sans** (Serif wäre F5-Konflikt ohne David-Entscheid).
3. **Motiv-Katalog anwenden** (8): gravierte Brass-Linie (`scale-rule` besteht) an
   2–3 definierten Sektions-Orten; **Schraffur NICHT generalisieren**
   (`lc-hatch-warn` = spezifisch «Stillstand/ausgesetzt»). Reader-Kopf-Kahlheit (6)
   nur falls der Katalog eine billige Antwort hat (scale-rule unter Erlass-Titel),
   sonst zurückgestellt.
- **Aufwand:** M–L · **Golden:** neutral; Playwright-Screens Pflicht.

### D-9 · David-Entscheide (Warteliste — NICHT autonom bauen)
*(nur bereitlegen; Abnahme-Zeitsperre bis 1.12.2026 respektieren, nicht drängen)*
- **Display-Serif-Register** (22/26b): EIN Marken-Moment (Hero-H1 und/oder Erlass-/
  Entscheid-Titelzeile) — berührt F5 + Davids Geist-Entscheid 6.6.2026. VORHER
  Lade-Topologie messen (Startseite lädt Source Serif heute NICHT → potenziell
  LCP-relevanter Font-Download, §15-Behauptung des Befunds ungeprüft).
  Minimalinvasive Alternative **sofort erlaubt:** H1/H2-lineHeight leicht öffnen
  (1.05→1.1), negative Laufweite bei Lese-Überschriften reduzieren.
- **Typo-Rampe** (16): h2 25.6px→26px, h3 20→21px (~1.24er-Schritte) — sachlich
  richtig, aber verhaltensändernd site-weit → eigener deklarierter §6.3-Schritt mit
  Screenshot-Abnahme, NIE in einen Farb-Batch gemischt.
- **Stripe-L-Anker** (37): nur die vier **-700-Textstufen** auf gemeinsames L
  normieren (Vorschlag mit Screens); -500-Mitten nur bei konkretem D-0-Befund.
  Ob warn/danger lauter sein DÜRFEN (Vorbehalt-Salienz) ist Design-Entscheid, nicht
  Technik. Setzt F1-Entscheid (D-2i) voraus.
- **Regeste-Box-Kante slate?** (4-Rest): als Option dokumentieren, Empfehlung NEIN
  (brass = amtlicher Wortlaut).
- **Mobile Chip-Bündelung** (7-Rest): sekundäre Reader-Kopf-Chips hinter
  «Ansicht»-Menü — muss §4c respektieren (Fussnoten-Chip bewusst prominent,
  David 10.7.); Farbsemantik ist durch C-2 bereits gebaut → nur UX-Bündelung offen.

### Abnahme-Artefakt (F4 der Kohärenz-Linse)
Je Token-Einheit (D-3…D-7) wächst EIN Vorher/Nachher-Set: **4 Kernseiten
(Startseite · Gesetz-Reader · Entscheid · Rechner) × hell/dunkel** + Squint-Test-
Notiz → `abnahme/design-waerme/`. Nur bereitlegen (Zeitsperre) — Davids einziger
Gesamtbild-Touchpoint statt 40 Einzeländerungen.

## 3 · Verworfen (explizit, mit Grund)

| Vorschlag | Grund |
|---|---|
| `--paper-warm`-Brass-Mix-Token (Befund 1, Mechanik) | Zweiter Wärme-Kanal = Patchwork; kollidiert mit Token-Landkarte + 60-30-10; Wärme kommt aus D-4/D-5 (E1-Veto durch Befund 47) |
| Dark-Brass-Werte tauschen (9) | Inversion ist dokumentiert-absichtlich (a:hover dunkel = heller = stärker); Alias-Weg in D-2 |
| 3-stufige warme Elevation-Tokens (46) | Prämisse faktisch falsch: Hell-Schatten sind BEREITS warm ink-getönt (Z.116–118), boxShadow mappt bereits auf 3 Token-Stufen; Residuum = D-6(b) + Reglement-Satz D-2b |
| Sepia-/Wärme-Modus als dritter Modus | Redundanz zur Rezept-Architektur, verwässert das Wörterbuch (47) |
| CSS-mask-Chevron | Am nackten `<select>` technisch nicht machbar (background = Well-Füllung); nur Hex-Nachzug D-1.6 |
| Schraffur auf alle Zeitraum-Visualisierungen (8-Teil) | `lc-hatch-warn` = spezifisch «Stillstand»; Generalisierung verwässert EIN-Entscheid-je-Zeichen |
| `maxWidth.reading` global senken (44-Teil) | 38 Call-Sites überwiegend Sans-Prosa; Reader-Befund kippt nie das Dach-Token |
| Schriftgrad-Stepper «vormerken» (48) | Weitgehend gebaut (Entscheid-Reader-Stepper + globale Schriftskala); Rest-Kern = CPL-Stabilität als Fussnote in D-7(c) |
| BGer-News-Karten anreichern (24) | Inhalts-/Datenarbeit, keine Wärme-Schicht → läuft bereits in **W2·10-UI-NAV** (Rechtsprechungs-Politur «News-Karten»), kein Doppel (§14.3) |
| Reader-Kopf-Layout-Umbau (6, grosser Teil) | Layout-Empfinden, kein Token-Hebel; nur die billige Motiv-Antwort in D-8.3, Rest zurückgestellt |
| Warme-Neutrale-Sweep als «grosser Hebel» (25) | Empirisch schon sauber (0 bg-white/rgba-Treffer, Gate blockiert gray-*/zinc/neutral + Hex bereits); Rest = billige Gate-Erweiterung in D-2d |
| Papier-Texturen / Noise-Overlays | iA-Prinzip + §15 (D-2f) |

## 4 · Prozess

- **Reihenfolge hart:** D-0 → D-1 → D-2 → D-3 → D-4 → D-5 → D-6 → D-7 → D-8;
  D-9 asynchron als Entscheidungs-Mappe. Nie zwei Token-Einheiten in einem PR
  (jede Fläche nur einmal anfassen, Mess-Quittung je Commit).
- **Gates je PR:** `check:farbwelt` (ab D-0) + axe-e2e hell+dunkel + `gate:schnell`
  + golden-Beweis; Risiko-Pfade sind hier keine (reine Darstellung →
  `check:gegenpruefung` nicht betroffen), §13-Nachträge deklariert im Commit-Body.
- **Bau:** Opus (Daueranweisung Modellwahl); autonome Durchführung pro Einheit
  (Daueranweisung Batch), Auto-Merge bei grüner CI.
