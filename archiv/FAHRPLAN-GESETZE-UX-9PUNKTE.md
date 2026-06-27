# Konsolidierter Handlungsplan — Gesetze-UX (9 Punkte)

*Synthese aus 4 Read-only-Investigator-Befunden. Konventionen: CLAUDE.md §1 (Logik vor allem), §3 (Darstellung deterministisch), §6 (Refactoring-/Golden-Protokoll), §12 (Pathspec-Disziplin), §13/F1–F3 (Mass-Skala, Kontrast, Hervorhebung nicht nur Rahmen). Tests/`npm run gate` vor Deploy, display-first bei Render-Bugs, Playwright via Bash für visuelle Verifikation (Desktop + Mobil, Hell + Dunkel).*

## STAND 27.6.2026 — ALLE 9 PUNKTE UMGESETZT + auf `main` (deployt; Code-verifiziert 28.6.)
- **Geteiltes Observer-Fundament:** `src/lib/normtext/aktuellerArtikel.ts` (reine Funktion
  `aktiverArtikel`) speist P2 und P9 aus EINEM Token.
- **P1** `?r`-Duplikate (`tabs.ts:29/115`) · **P2** Viewport-Mitte-Tracking live
  (`inhalt.tsx:314-381`, IO+rAF+200 ms-Throttle+jumpLock).
- **P3** vertikales Akkordeon nach Herkunft: `tabGruppen.ts`, `HerkunftIcon.tsx`
  (CH-Kreuz+Welt+Wappen), `TabPanel.tsx`/`ReiterUebersicht.tsx`, Test `tabGruppen.test.ts`.
  Commit `71e3c0d1`/`cc142b90`.
- **P4** Randtitel über Art.-Nr (`parts.tsx:107/113`) · **P5/6/7** Hover ohne scale/ring/
  shadow/-mx-2, nur translate+bg (`ArtikelBody.tsx:358/463`) · **P8** Knöpfe inline in
  Art.-Nr-Zeile (`parts.tsx:142`). Commits `5a5c63c9`/`eaef1795`/`e60a85db`.
- **P9** Scroll-Spy aus Observer, Auto-Aufklappen expand-only (`inhalt.tsx:412/207/639`).
- **OFFEN:** kein offener Code-Punkt → ins `archiv/`. (Aufräum-Notiz: toter Helfer
  `randtitelEintraege`/`randtitelTeile` in `darstellung.ts` → in Welle 2 prüfen/streichen.)

---

## 0. Entscheidungen David (26.6.2026) — verbindlich

| Frage | Entscheidung | Konsequenz für den Plan |
|-------|--------------|--------------------------|
| **P1 — Bedeutung «zweimal dasselbe Gesetz»** | **Tab-Umschaltung reicht** (kein Split-View) | Punkt 1 = nur verifizieren (`?r` ist bereits gebaut). Kein Neufeature. Offene Frage 1 erledigt. |
| **P3 — Einbauort vertikale Reiter-Liste** | **Zusätzliches, aufklappbares Reiter-Panel** (ersetzt den horizontalen Streifen NICHT) | `--tabstreifen-h`-Vertrag bleibt intakt → **Risiko R7 entschärft**, Observer-Mitte (P2/9) sitzt auf stabilem Layout. Reihenfolge-Zwang «P3 zuletzt» damit gelockert (Layout bricht nicht mehr). Offene Frage 3 erledigt. |
| **P3 — Geltungsbereich Gruppierung** | **Alle Reiter, eigene Top-Gruppen**: Rechner / Vorlagen / Rechtsprechung je eigene Top-Gruppe; Gesetze-Gruppe darunter nach Herkunft Bund→Kanton→International | `herkunftVon()` reicht nicht — zusätzlich `reiterKategorie()`-Achse (Top-Gruppe) nötig. Offene Frage 2 erledigt. |

**Restliche offene Fragen (Abschnitt 8): mit Empfehlung als Default übernommen, sofern David nicht widerspricht** — P8 = Knöpfe inline in Art.-Nr-Zeile verschieben; P5 = nur dezenter Hintergrund (kein Poppen); P9 = Auto-Aufklappen **expand-only** (nie auto-zuklappen); P4 = Randtitel auch bei eingeklapptem/aufgehobenem Artikel über der Nummer (Fedlex-treu); P6/2 = Reiter-Label throttled kontinuierlich beim Scrollen, Tiefe = einzelner Artikel.

---

## 1. Kurz-Übersicht der 9 Punkte (gruppiert)

### Block A — Tab-/Navigationssystem (Punkte 1–3) · Dateien: `lib/tabs.ts`, `TabStreifen.tsx`, `GesetzLeser.tsx`, `verlaufLabel.ts`
| Nr | Titel | Ist-Stand (verkürzt) | Aufwand |
|----|-------|----------------------|---------|
| 1 | Duplikate desselben Gesetzes als Reiter erlauben | **Bereits gebaut** (`?r`-Diskriminator in `tabSchluessel`, `naechsteInstanz`, Button «⧉ In neuem Reiter»). Nur verifizieren + offene Frage Split-View. | klein |
| 2 | Reiter zeigt Artikel in Viewport-**Mitte**, live beim Scrollen | **Fehlt.** Kein Live-Tracking, kein IntersectionObserver; Artikel-Anker nur bei Sprüngen geschrieben; Label-Gate nur bei Mehrfach-Instanz. | mittel |
| 3 | Vertikales Akkordeon nach **Herkunft** (Bund→Kanton→International), 3 Spalten | **Grosser Umbau.** Heute horizontal, nach Kategorie gruppiert. Kanton-Wappen vorhanden; CH-Kreuz + Welt-Icon fehlen. | gross |

### Block B — Normtext-Rendering (Punkte 4, 5, 6, 7, 8) · Dateien: `GesetzLeser.tsx` (ArtikelLeser), `ArtikelBody.tsx`, `index.css`
| Nr | Titel | Ist-Stand (verkürzt) | Aufwand |
|----|-------|----------------------|---------|
| 4 | Randtitel/Gliederung **über** die Artikelnummer (Fedlex-Logik) | JSX-Reihenfolge im Kopf-Wrapper falsch herum; Randtitel steht unter Art.-Nr. | klein |
| 5 | Hover auf Litera/Ziffer poppt **ganzen Absatz** statt nur Element | `hover:scale-[1.012]` sitzt auf dem Block-`<div>`, nicht auf der `<li>`. | klein |
| 6 | Rauspoppen schneidet Text rechts ab (Clipping) | `scale origin-left` + `-mx-2` läuft über `max-w-[52rem] overflow-x-clip` hinaus. Folgt aus 5. | klein |
| 7 | Bläulich empfundener Rahmen/Kasten um lit./Ziff. entfernen | `hover:ring-1 ring-brass-300/60 + shadow-sm` auf der `<li>` (brass = Gold, kein Blau). | klein |
| 8 | Zu grosser Abstand Artikelkopf → erster Absatz | Dauerhaft reservierte unsichtbare Knopfzeile (`opacity-0`) + `mt-2` + `mb-2.5`. | klein |

### Block C — Gliederung folgt Scroll (Punkt 9) · Datei: `GesetzLeser.tsx` (Scroll-Spy + TOC)
| Nr | Titel | Ist-Stand (verkürzt) | Aufwand |
|----|-------|----------------------|---------|
| 9 | Gliederung folgt Scroll: aktiv setzen / mitscrollen / aufklappen | (a) Aktiv-Setzen **fertig**; (b) Mitscrollen **defekt** (Effekt-Dependency `[tocBaum]` statt `aktivIds`); (c) Auto-Aufklappen **bewusst entfernt** (Flacker-Beschwerde David). Spy misst nur Sektionen, nicht Artikel. | mittel |

---

## 2. Architektur-Kernentscheidung: EIN geteilter «aktueller-Artikel»-Observer

**Entscheidung:** Ein einziger, zentraler Beobachter ermittelt den aktuell im Viewport-**Mittelpunkt** stehenden Artikel-Token (`art-<token>`) und ist die **gemeinsame Datenquelle** für Punkt 2 (Reiter-Label) UND Punkt 9 (TOC-Aktivpfad + Mitscrollen + Aufklappen).

**Begründung:**
- Beide Punkte fragen dieselbe Frage: «Welcher Artikel ist gerade dran?» Heute beantworten sie sie getrennt und unvollständig — der Sektions-Spy (Z.472-500) speist nur den TOC, `aktualisiereTabArtikel` nur bei Sprüngen. Zwei separate Observer würden konkurrierend scrollen/messen, doppelt `localStorage` schreiben und auseinanderlaufen.
- Eine Quelle garantiert Konsistenz: TOC-Hervorhebung und Reiter-Label zeigen **denselben** Artikel.
- Testbarkeit (§1/§2/§3): Die Auswahl-Logik wird als **reine Funktion** ausgelagert (Muster `fokus.ts`), unit-testbar ohne DOM.

**Konkrete Form — empfohlener Hook `useAktuellerArtikel` in `src/lib/normtext/` + Komponenten-Glue in `GesetzLeser.tsx`:**

1. **Messung:** `IntersectionObserver` auf alle `[id^="art-"]` mit `rootMargin`, der ein schmales **Mittel-Band** (um `innerHeight/2`) markiert. IO ist robuster als `getBoundingClientRect` wegen `content-visibility:auto` (`.nt-art-cv`, `index.css:177`) — Off-Screen-Artikel sind nur Platzhalter (`contain-intrinsic-size 320px`), `getBoundingClientRect` würde Platzhalter messen. *(Unsicherheit: Band-Tuning gegen den Sticky-Header-Offset / `scroll-margin-top` muss empirisch justiert werden, sonst springt die Auswahl eine Position zu früh.)*
2. **Reine Auswahl-Funktion:** `aktiverArtikel(eintraege: {id,top,bottom}[], viewportMitte): string | null` — wählt den Artikel, dessen Intervall die Mitte enthält bzw. ihr am nächsten ist. Deterministisch, unit-getestet.
3. **Zwei Konsumenten aus EINEM Token:**
   - **Punkt 9 (TOC):** `pfadZu(sektionen, s => s.artikel.some(e => e.artikel === token))` → `setAktivIds(...)`; plus Mitscroll-Effekt + Expand-only-Aufklappen.
   - **Punkt 2 (Reiter):** `aktualisiereTabArtikel(`${basisPfad}${location.search}#art-${token}`)` (search beibehalten → richtige `?r`-Instanz; idempotent dank Early-Return `tabs.ts:132`).
4. **Drosselung:** rAF + Dedup (nur bei Token-Wechsel schreiben/dispatchen) + `jumpLock` respektieren (während programmatischer Sprünge pausieren). Verhindert TABS_EVENT-Flut → `useTabs`-Re-Render des ganzen Streifens und `localStorage`-Schreibflut.

> Wer Punkt 2 ODER 9 anfasst, **muss diesen Hook zuerst bauen**. Nicht zwei Mechanismen tolerieren.

---

## 3. Empfohlene Umsetzungs-Reihenfolge (mit Begründung)

**Phase 0 — Verifikation (kein Code):**
- **Punkt 1 verifizieren** (Playwright via Bash): «⧉ In neuem Reiter» erzeugt `?r=2`, Wechsel springt je zur gemerkten `#art`-Stelle. Offene Frage Split-View an David klären, **bevor** irgendetwas gebaut wird (entscheidet, ob Punkt 1 «fertig» ist oder Neufeature).

**Phase 1 — Quick-Wins, reine Darstellung, niedriges Risiko (Block B, ein PR):**
- **Punkte 5 + 6 + 7 gemeinsam** in `ArtikelBody.tsx` (`zk`-Zweig). 5 und 6 hängen kausal zusammen (Entfernen von `hover:scale` + `-mx-2` löst 6 automatisch). 7 ist dieselbe `<li>`-Zeile. Golden-Pfad (Popover) bleibt byte-gleich, da nur `${zk ? ...}` berührt.
- **Punkte 4 + 8 gemeinsam** in `GesetzLeser.tsx`/`ArtikelLeser` (derselbe `mb-2.5`-Kopf-Wrapper Z.146). Reihenfolge umstellen (4) und danach Kopf→Absatz-Abstand neu messen (8).

*Warum zuerst:* hoher Nutzen, kleiner Aufwand, keine Logik, kein Architektur-Risiko — schafft sichtbaren Fortschritt und entkoppelt Block B vollständig von Block A/C.

**Phase 2 — Observer-Fundament (Block A/C Kern):**
- **Geteilten `useAktuellerArtikel`-Hook bauen** (Abschnitt 2) inkl. reiner Auswahl-Funktion + Unit-Tests. **Dies ist das Fundament** für Punkt 2 und Punkt 9 — beide danach.

**Phase 3 — Punkt 9 (TOC folgt Scroll):**
- TOC an Observer hängen: `setAktivIds` aus Token, Mitscroll-Dependency `[aktivIds]` reparieren, Expand-only-Aufklappen (flacker-sicher, David-Constraint).

**Phase 4 — Punkt 2 (Reiter-Label):**
- `aktualisiereTabArtikel` an denselben Observer-Token hängen; Label-Gate in `TabStreifen.tsx` lockern (Artikel immer als 3. Spalte).

**Phase 5 — Punkt 3 (vertikales Akkordeon, grösster Umbau, ZULETZT):**
- Layout-/Gruppierachsen-Umbau + 2 neue Icons + `tabsSsr.test.tsx`-Anpassung + `--tabstreifen-h`-Vertrag neu denken.

**Begründungs-Kern der Reihenfolge:**
1. **Punkt 1 ist Fundament-Klärung** für die ganze Reiter-Semantik (`?r`) — die der Observer (Punkt 2) ohnehin braucht. Erst verstehen, dann bauen.
2. **Observer vor Tab/Gliederung:** 2 und 9 sind sonst doppelt gebaut.
3. **Reine CSS-Fixes (5/6/7/8) früh** als risikoarme Quick-Wins, bevor Punkt 3 den Layout-Vertrag (`--tabstreifen-h`) umwirft.
4. **Punkt 3 zuletzt**, weil er den `--tabstreifen-h`-Vertrag bricht — und genau dieser Vertrag (Streifenhöhe ↔ `scroll-margin-top` der Artikel) beeinflusst die **Mitte-Berechnung des Observers**. Würde Punkt 3 vor Punkt 2/9 gebaut, müsste der Observer auf einem instabilen Layout justiert werden.

---

## 4. Detail pro Punkt

### Punkt 1 — Duplikate erlauben
- **Datei:Stelle:** `lib/tabs.ts:29-34` (`tabSchluessel` mit `?r`), `:115-123` (`naechsteInstanz`); `GesetzLeser.tsx:787-793` (Button), `:399-415` (Re-Jump bei Wechsel); Tests `tabs.test.ts:48-62`.
- **Änderung:** **Verifizieren statt bauen.** Falls David Split-View (zwei gemountete Reader) meint → Neufeature, separat planen.
- **Risiken:** Eng mit Punkt 2 verzahnt (ohne Live-Tracking merkt sich Instanz nur letzten Sprung-Anker, nicht freie Scrollposition). `MAX=50`-Kappung (`tabs.ts:21`) kann echte Reiter verdrängen. Geteilter `localStorage`-Key mit Rechtsprechungs-Parallelsession.
- **Tests:** Vorhanden `tabs.test.ts:48-62`. Falls Verhalten geändert → Integrationstest «zweiter Reiter via Button» + «Wechsel springt zur Instanz-Stelle».
- **Aufwand:** klein (nur Verifikation).

### Punkt 2 — Reiter zeigt Artikel in Viewport-Mitte (live)
- **Datei:Stelle:** Neuer Hook `src/lib/normtext/useAktuellerArtikel` (+ reine `aktiverArtikel`-Funktion); Glue in `GesetzLeser.tsx` (Artikel-Elemente Z.138 `art-${e.artikel}`); `aktualisiereTabArtikel` `tabs.ts:128-136`; Label-Gate `TabStreifen.tsx:138-145` (Gate `kuerzelHaeufig>=2` Z.140 entfernen).
- **Änderung:** Observer-Token → `aktualisiereTabArtikel(... + location.search + #art-token)`; `jumpLock` respektieren; rAF + Dedup.
- **Risiken:** Schreib-/Render-Frequenz (TABS_EVENT → ganzer Streifen re-rendert); `scroll-margin-top` (`index.css:181`) verschiebt effektive Mitte → Header-Offset einrechnen; Mobiler Suchmodus (nur Treffer im DOM) → Tracking nur bei vollständiger Liste.
- **Tests:** `normtext-fokus.test.ts` **nicht** einschlägig. Neu: reine `aktiverArtikel`-Funktion unit-testen; optional Integrationstest, dass der richtige `?r`-Reiter getroffen wird.
- **Aufwand:** mittel.

### Punkt 3 — Vertikales Akkordeon nach Herkunft, 3 Spalten
- **Datei:Stelle:** `TabStreifen.tsx:159-225` (Layout/Gruppierung), `:26-33`/`:45` (Kategorie-Achse heute), `:138-145` (Label); Herkunft via `verlaufLabel.ts:56-59` + `browse-typen.ts:10` (`rechtsgebiet==='international'`, **keine** eigene Ebene); Reihenfolge-Vorbild `Gesetze.tsx:14,18-20`; Einbau `Shell.tsx:119`; `--tabstreifen-h` (`TabStreifen.tsx:62-66` ↔ `index.css:181`); Icons `KantonWappen.tsx` (vorhanden), `public/icons.svg` (Welt fehlt), CH-Kreuz fehlt.
- **Änderung:** Neue reine `herkunftVon(path)`-Funktion → `'bund'|'kanton'|'international'`; horizontal→vertikales Akkordeon; 3-Spalten-Zeile (Icon | Name | Artikel); 2 neue gemeinfreie SVGs (CH-Kreuz, Welt); Einbau-Ort + `--tabstreifen-h`-Vertrag neu definieren.
- **Risiken:** `tabsSsr.test.tsx`-DOM-Vertrag (aria-label «Geöffnete Reiter», `aria-current`, kein `role=tablist`) → als deklarierte fachliche Änderung (§6.3) anpassen; `--tabstreifen-h`-Bruch betrifft Punkt 2/9-Offset; 2 neue Assets müssen lizenzsauber + WCAG-Kontrast ≥3:1; mischt Rechtsprechungs-Reiter → **Konflikt mit Parallelsession**; mobiler vertikaler Platzverbrauch.
- **Tests:** `tabsSsr.test.tsx` anpassen; neu `herkunftVon()` unit; SSR-Check Gruppen-Reihenfolge + Icon je Herkunft.
- **Aufwand:** gross.

### Punkt 4 — Randtitel über die Artikelnummer
- **Datei:Stelle:** `GesetzLeser.tsx` `ArtikelLeser`, Kopf-Wrapper `<div class="mb-2.5">` Z.146; Art.-Nr-Flexzeile Z.147-159; Randtitel-Block Z.160-166; amtl. Titel Z.172-176; Datenquelle `margAnzeige` Z.353-364.
- **Änderung:** Randtitel-Block + amtl.-Titel-Block **vor** die Art.-Nr-Flexzeile ziehen (erste Kinder des `mb-2.5`-Wrappers). `mt-1` vom Top weg → `mb-1` unter Randtitel + `mt-1` an Art.-Nr-Zeile. Verschachtelung bleibt durch Array-Reihenfolge erhalten; unterste Stufe weiter `font-medium`. **Nicht** auf `randtitelEintraege`/`randtitelTeile` umstellen (würde Aufzähler «3.»/«a.» strippen → weicht vom Auftrag ab).
- **Risiken:** `artOffen`-Gating (Z.160/172) → bei eingeklapptem Artikel verschwindet Überschrift, «Art. N · aufgehoben» bleibt = kopflose Zeile (offene Frage). Folgeartikel können «kopflos» (nur «a.» ohne «3.») wirken — Delta-Verfahren gewollt. `ArtikelLeser` an 3 Stellen gerendert (Z.711/935/942), Änderung zentral → keine Aufrufer-Anpassung.
- **Tests:** Kein bestehender Kopf-Reihenfolge-Test. Neu (§6.3): `renderToString` mit `marg=['3. Vereinsbeschluss','a. Beschlussfassung']` → Index «3. …» < «a. …» < «Art. 66».
- **Aufwand:** klein.

### Punkt 5 — Hover poppt ganzen Absatz
- **Datei:Stelle:** `ArtikelBody.tsx:302` (Block-`<div>`, `zk`-Zweig), `:421` (`<li>`).
- **Änderung:** Aus Z.302 streichen: `origin-left relative z-0 transition duration-200 will-change-transform hover:z-10 hover:scale-[1.012] hover:bg-brass-100/60` **und** `rounded -mx-2 px-2`. Pro-Element-Hover auf `<li>` (Z.421) `transition-colors hover:bg-brass-200/60` als einzige Rückmeldung behalten. `blockStark`/`blockDezent` (Z.296-301, zitierter Block) unangetastet.
- **Risiken:** Geteilte Komponente (Popover ohne `zk`) → alles im `${zk ? ...}`-Zweig, Popover byte-gleich. `relative z-0/hover:z-10` mit-entfernen verhaltensneutral, sobald kein Scale mehr stapelt.
- **Tests:** Neu: Render-Test **mit** `zitierKontext`, prüft KEIN `hover:scale-` mehr auf Block. `NormPopover.test.tsx` als Golden-Wächter.
- **Aufwand:** klein.

### Punkt 6 — Clipping beim Rauspoppen
- **Datei:Stelle:** Ursache `ArtikelBody.tsx:302` (scale origin-left + `-mx-2`); Clip-Rand `GesetzLeser.tsx:190` `max-w-[52rem] min-w-0 overflow-x-clip`.
- **Änderung:** **Mit Punkt-5-Fix automatisch gelöst** (kein Transform → kein Überstand). `overflow-x-clip` (Z.190) **NICHT** entfernen — schützt Mobil-Overflow des hängenden Einzugs `pl-9 -indent-9` (dokumentierter Befund 25.6.).
- **Risiken:** `overflow-x-clip` versehentlich entfernen würde Mobil-Overflow-Bug reaktivieren.
- **Tests:** Playwright-Screenshot: Hover längste Item-Zeile breiter Artikel, vorher/nachher, kein Zeichen fehlt; Gegenprobe ~360-414px Einzug läuft nicht über. Indirekt durch Punkt-5-Regressionstest.
- **Aufwand:** klein.

### Punkt 7 — Rahmen/Kasten entfernen
- **Datei:Stelle:** `ArtikelBody.tsx:421` (`<li>`, `zk`-Zweig).
- **Änderung:** `hover:ring-1 hover:ring-brass-300/60 hover:shadow-sm` entfernen; `transition-colors hover:bg-brass-200/60` belassen. Linker Akzentbalken des **zitierten** Items (`border-l-4 border-brass-500`, Z.422-424) **nicht** anfassen. `rounded-md` kann bleiben.
- **Risiken:** Kontrast (§13/F2): `hover:bg-brass-200/60` muss in Hell (#E6D7B8) UND Dunkel (#574A2C) erkennbar bleiben — gegenprüfen.
- **Tests:** Neu: Render-Test mit `zk`, prüft KEIN `hover:ring-`/`hover:shadow-`, aber weiter `hover:bg-brass-200/60`.
- **Aufwand:** klein.

### Punkt 8 — Abstand Kopf → erster Absatz
- **Datei:Stelle:** `GesetzLeser.tsx:146` (`mb-2.5`), Z.177-182 (Zitat/Link-Block `opacity-0` + `mt-2`), Z.189-195 (`ArtikelBody`).
- **Änderung (empfohlen):** Zitat/Link-Knöpfe in die Art.-Nr-Flexzeile (Z.147-159) integrieren, rechtsbündig `ml-auto`, weiter `opacity-0 group-hover:opacity-100 focus-within:opacity-100` → reservierte Leerzeile (~0.825rem) entfällt ohne Layout-Sprung. Verbleibendes `mb-2.5` → `mb-1`/`mb-1.5`. **Risikoarme Alternative:** nur `mb-2.5`→`mb-1` und `mt-2`→`mt-1` (Knopfzeile bleibt). Nur Mass-Skala-Tokens (§13/F1). **Gemeinsam mit Punkt 4** umsetzen (selber Wrapper).
- **Risiken:** Knopfzeile auf 0 ohne Inline-Verschiebung → Layout-Shift bei Hover. `focus-within` erhalten (Touch/Tastatur). `mb-0` verklebt Art.-Nr und Absatz.
- **Tests:** Playwright (~390px + breit, Hell + Dunkel). Bei Inline-Verschiebung: Render-Test, dass aria-label-Knöpfe («… kopieren», «Permalink kopieren») weiter im Kopf vorhanden.
- **Aufwand:** klein.

### Punkt 9 — Gliederung folgt Scroll
- **Datei:Stelle:** `GesetzLeser.tsx` Scroll-Spy Z.472-500, Mitscroll-Effekt Z.504-516 (Dependency Z.516), `SektionBaumTOC` Z.962-997 (`aktiv` Z.972, Hervorhebung Z.980-981), `jumpLock` Z.275, `springeZuSektion` Z.740-752, `pfadZu` Z.38 (rein, un-exportiert); `index.css:177/181`.
- **Änderung:** (a) Aktiv-Setzen aus Observer-Token (Abschnitt 2) statt Sektions-Schwelle. (b) **Mitscrollen reparieren:** Effekt-Dependency `[tocBaum]` → `[aktivIds, tocBaum]` (oder kombinierte Marke), `jumpLock` respektieren. (c) **Auto-Aufklappen wieder ergänzen, aber expand-only** (`setTocBaum(o => ({...o, ...ids→true}))`), nie auto-zuklappen, debounced/nach Settle — David-Flacker-Constraint. `pfadZu` exportieren + testen.
- **Risiken:** Direkter Konflikt mit David-Entscheidung «kein Akkordeon-Flackern» (Z.488-491, 966-968) → strikt expand-only + gedämpft. `content-visibility:auto` → IO statt `getBoundingClientRect`. Mitscroll feuert bei jeder `aktivIds`-Änderung → throttle/settle, `behavior:'smooth'` kann sich überlagern. Drei Scroll-Treiber (Seite + TOC-Container + `App.tsx:92-95` Scroll-Restore) → `jumpLock` konsequent.
- **Tests:** `normtext-fokus.test.ts` nicht einschlägig. `tabs.test.ts:64` deckt `aktualisiereTabArtikel`. Neu: reine Auswahl-/`pfadZu`-Funktion unit (Kanten: kein Treffer, nur `ohneGliederung`, tiefste Verschachtelung); optional jsdom-Test `aktivIds`→`data-toc-aktiv`/`aria-current`.
- **Aufwand:** mittel.

---

## 5. Geteilte Dateien / Konfliktmatrix

| Datei | Punkte | Bearbeitungsreihenfolge / Disziplin |
|-------|--------|--------------------------------------|
| **`ArtikelBody.tsx`** | 5, 6, 7 | **Ein PR, gemeinsam** (alle im `${zk ? ...}`-Zweig). Golden-Wächter (Popover ohne `zk`) muss byte-gleich bleiben → `npm run golden:vergleich` vor/nach. |
| **`GesetzLeser.tsx` — `ArtikelLeser`-Kopf (`mb-2.5`-Wrapper Z.146)** | 4, 8 | **Ein PR, gemeinsam** (sonst Edit-Konflikt am selben Wrapper). 4 vor 8 messen. |
| **`GesetzLeser.tsx` — useEffect-Cluster (Z.399-516, 740-752) + Artikel-Elemente** | 2, 9 (+ 1 Re-Jump, 6 Clip-Container Z.190) | **Gemeinsam über den Observer-Hook** (Phase 2→3→4). Nicht parallel von zwei Bearbeitern. Punkt 6 berührt Z.190 nur diagnostisch (keine Änderung dort). |
| **`TabStreifen.tsx`** | 2 (Label-Gate), 3 (Layout/Gruppierung/Icons) | Punkt 2 (kleine Gate-Lockerung) **vor** Punkt 3 (grosser Umbau). Punkt 3 baut auf gelockertem Gate auf. |
| **`lib/tabs.ts`** | 1 (`?r`), 2/9 (`aktualisiereTabArtikel`) | SSoT `localStorage 'lexmetrik-tabs'`. 1 bereits drin; 2/9 nur Konsumenten — keine Schema-Änderung nötig. MAX-Kappung beachten. |
| **`index.css` (`--tabstreifen-h` Z.181, `.nt-art-cv` Z.177)** | 2/9 (Offset), 3 (Vertrag bricht), 8 (kein Eingriff) | Punkt 3 **zuletzt**, weil er `--tabstreifen-h` umwirft → Offset-Basis für Observer (2/9). 2/9 auf stabilem Layout justieren, dann Punkt 3. |
| **`verlaufLabel.ts` / `browse-typen.ts`** | 2 (Label), 3 (Herkunft) | EIN Lookup speist beide; nur lesend, keine Reihenfolge-Sorge. |
| **`tabsSsr.test.tsx`** | 3 | DOM-Vertrag; als deklarierte fachliche Änderung (§6.3) anpassen, wenn Akkordeon kommt. |

**Parallelsession-Konflikt (§12):** Worktree `feat/echte-leitentscheide` (Rechtsprechung) berührt potenziell `TabStreifen.tsx`/`lib/tabs.ts` (gemeinsames Reiter-System) und teilt `ArtikelBody.tsx`/`darstellung.ts` (Norm-Popover in `RechtsprechungText`). **Vor jedem Commit Pathspec-Disziplin**, `TabStreifen`-Änderungen (Punkt 2/3) mit der Parallelsession koordinieren.

---

## 6. Risiko-Register (Top, je mit Gegenmassnahme)

| # | Risiko | Schwere | Gegenmassnahme |
|---|--------|---------|----------------|
| R1 | **Punkt-3-Akkordeon bricht `tabsSsr.test.tsx`** (aria-label, `aria-current`, kein `role=tablist`) | hoch | Als deklarierte fachliche Änderung (§6.3) bewusst anpassen; neue ARIA-Disclosure (button+`aria-expanded`) statt tablist; Assertions neu schreiben, nicht löschen. |
| R2 | **Punkt 4 (Reorder) bricht `normtext-fedlex`/`struktur-marginalie`-Tests** | mittel | **Befund: tut es nicht** — diese Tests prüfen Extraktion/Body, nicht Kopf-Reihenfolge. Trotzdem `npm run gate` vollständig laufen lassen + neuen Kopf-Render-Test ergänzen. |
| R3 | **Scroll-Observer Performance** (TABS_EVENT-Flut, Mitscroll bei jeder `aktivIds`-Änderung, `localStorage`-Schreibflut, `smooth`-Überlagerung) | hoch | rAF-Drosselung + Token-Dedup (nur bei Wechsel schreiben), `jumpLock` während Sprüngen, settle-Debounce für Mitscroll; idempotenter Pfadvergleich (`tabs.ts:132`). |
| R4 | **Auto-Aufklappen reaktiviert das von David beanstandete Flackern** | hoch | Strikt **expand-only** (nie auto-zuklappen beim Scrollen), debounced/nach Settle; David-Constraint (Z.488-491) als Akzeptanzkriterium. |
| R5 | **Golden-Bruch in `ArtikelBody`** (Popover-Pfad) durch Punkt 5/6/7 | mittel | Änderungen ausschliesslich im `${zk ? ...}`-Zweig; `npm run golden:vergleich` vor/nach byte-gleich; `NormPopover.test.tsx` grün. |
| R6 | **`content-visibility:auto` verfälscht Messung** (Off-Screen = Platzhalter) | mittel | IntersectionObserver statt `getBoundingClientRect` für die Artikel-Ebene. |
| R7 | **`--tabstreifen-h`-Bruch durch Punkt 3** verschiebt `scroll-margin-top` → falsche Observer-Mitte (2/9) | mittel | Punkt 3 zuletzt; Layout-Vertrag explizit neu definieren, danach Observer-Offset nachjustieren + visuell verifizieren. |
| R8 | **Layout-Shift bei Punkt 8** (Knopfzeile auf 0 ohne Inline-Verschiebung) | niedrig | Entweder Margen reduzieren (Zeile bleibt) ODER Knöpfe inline verschieben (Zeile entfällt sauber); `focus-within` erhalten. |
| R9 | **Parallelsession-Schreibkonflikt** (geteilter `localStorage`-Key + `TabStreifen.tsx`) | mittel | Pathspec-Disziplin (§12), `TabStreifen`-Umbau koordinieren, MAX-Kappung (`tabs.ts:21`) bedenken. |
| R10 | **Punkt-1-Fehlannahme** (David meint evtl. Split-View statt Tab-Umschaltung) | mittel | Vor Bau klären (offene Frage); `?r` deckt nur Umschaltung ab. |

---

## 7. Verifikationsstrategie

**Tests laufen lassen (`npm run gate` vor jedem Deploy):**
- Phase 1 (5/6/7): neue `ArtikelBody`-Render-Tests mit `zitierKontext` (kein `hover:scale-`/`ring-`/`shadow-`, aber `hover:bg-brass-200/60`); `NormPopover.test.tsx` + `golden:vergleich` byte-gleich.
- Phase 1 (4/8): neuer Kopf-Reihenfolge-Render-Test (Index Randtitel < Art.-Nr); aria-label-Knöpfe-Test bei Inline-Verschiebung; bestehende `ArtikelBody`/`fedlex`/`marginalie`-Tests grün.
- Phase 2 (Observer): reine `aktiverArtikel`- und `pfadZu`-Unit-Tests (Kanten: kein Treffer, `ohneGliederung`, tiefste Verschachtelung).
- Phase 3/4 (9/2): jsdom-Test `aktivIds`→`data-toc-aktiv`/`aria-current`; `tabs.test.ts:64` (`aktualisiereTabArtikel`) grün.
- Phase 5 (3): `herkunftVon()`-Unit; `tabsSsr.test.tsx` angepasst + grün.

**Playwright-Visual-Checks (via Bash, Desktop + Mobil ~390px, Hell + Dunkel):**
- P6/P5: Hover längste Item-Zeile breiter Artikel → kein Zeichen abgeschnitten, nur 1 Element reagiert.
- P7: Hover-Hintergrund sichtbar ohne Rahmen, beide Themes.
- P8: Kopf→Absatz-Abstand knapp aber lesbar, kein Hover-Layout-Shift.
- P4: Randtitel-Stufen über Art.-Nr, Verschachtelung erkennbar; eingeklappter/aufgehobener Artikel prüfen.
- P9: Scrollen → TOC-Aktivzeile mitscrollt + tiefster Eintrag aufgeklappt sichtbar, **kein Flackern**.
- P2: Scrollen → Reiter-Label «Kürzel – Art. X» folgt; richtige `?r`-Instanz.
- P3: Gruppen-Reihenfolge Bund→Kanton→International, korrektes Icon je Herkunft, Kontrast ≥3:1, mobiler Einbau.

**Akzeptanzkriterien (Auswahl):**
- P4: Strings der Marginalie erscheinen im DOM **vor** «Art. N»; Reihenfolge aussen→innen erhalten.
- P5: nur das überfahrene `<li>` ändert sich, kein Block-Scale.
- P6: bei keiner Viewport-Breite fehlt ein Zeichen im Hover.
- P7: kein umlaufender Ring/Schatten mehr, nur Hintergrund.
- P8: kein Layout-Sprung beim Hover; Knöpfe per Tastatur/Touch erreichbar.
- P9: aktiver Eintrag immer im TOC-Container sichtbar, Aufklappen nur expandiert.
- P2: Label = mittiger Artikel, idempotent (kein Re-Write ohne Wechsel).
- P3: korrekte Herkunfts-Gruppe + Icon je Reiter; aria-Disclosure-Vertrag erfüllt.

---

## 8. Offene Fragen an David (gebündelt — nur echte Entscheidungen)

1. **Punkt 1:** Meinst du Tab-**Umschaltung** (bereits via `?r` gebaut) oder echte **gleichzeitige Nebeneinander-Sicht** (Split-View, zwei gemountete Reader)? Letzteres ist ein Neufeature.
2. **Punkt 3 — Geltungsbereich:** Gilt die Herkunfts-Gruppierung (Bund/Kanton/International) **nur für Gesetze-Reiter**? Wie werden rechner-/vorlagen-/rechtsprechung-Reiter eingeordnet (eigene Top-Gruppen? eigener Streifen?)?
3. **Punkt 3 — Einbauort:** Soll das vertikale Akkordeon in die **Seitenleiste**, als eigener linker Panel, oder **ersetzt** es den horizontalen Streifen (`Shell.tsx:119`)? Davon hängt der `--tabstreifen-h`-Umbau (und der Observer-Offset) ab.
4. **Punkt 3 — Icons:** Quelle/Lizenz der zwei neuen Icons (Schweizerkreuz, Welt) — gemeinfrei wie die Wikimedia-Wappen? Inline-SVG-Komponente oder `public/icons.svg`-Symbol?
5. **Punkt 9 — Auto-Aufklappen:** Soll es trotz früherer Flacker-Beschwerde wieder aktiv werden? Vorschlag: **expand-only** (nie auto-zuklappen). Einverstanden, oder beim Verlassen der Sektion auch wieder zuklappen?
6. **Punkt 9/2 — Tiefe & Frequenz:** Soll das Reiter-Label kontinuierlich beim Scrollen mitlaufen (häufige `localStorage`-Schreibvorgänge, throttled) oder nur an Sektions-/Sprung-Grenzen? Und bis auf welche Tiefe (Sektion vs. einzelner Artikel)?
7. **Punkt 4 — eingeklappte Artikel:** Soll der Randtitel auch bei **eingeklapptem/aufgehobenem** Artikel über der Nummer sichtbar bleiben (Fedlex-treu) oder an `artOffen` gekoppelt bleiben (minimal-invariant)?
8. **Punkt 8 — Variante:** Risikoarme Margen-Reduktion (Knopfzeile bleibt reserviert) **oder** saubere Inline-Verschiebung der Zitat/Link-Knöpfe in die Art.-Nr-Zeile (grösste Ersparnis, kein Shift)? Empfehlung: Inline-Verschiebung.
9. **Punkt 5 — Hover-Effekt:** Genügt dezenter **Hintergrund** (§13, kein Clip-Risiko) oder soll ein echtes kleines «Rauspoppen» pro Element bleiben? Empfehlung: nur Hintergrund.

*(Nicht-blockierende Aufräum-Kandidaten, keine David-Entscheidung nötig: ungenutzte Helfer `randtitelEintraege`/`randtitelTeile` in `darstellung.ts` — toter Code, später streichen, §Regelmässig-aufräumen.)*