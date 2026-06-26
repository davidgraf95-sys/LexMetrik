# Handlungsplan — UX-/Darstellungs-Punkteliste (Stand 25.6.2026)

Quelle: 20 mündliche Anweisungen David, konsolidiert. Code-Stellen per read-only Explore-Agenten verifiziert (main @ 10f27609).
**Status: reiner Plan. Noch nichts umgesetzt.** Umsetzung erst auf Startsignal.

## Geklärte Eckentscheide (aus Rückfragen)
- **Tab-Artikel im Label**: Abkürzung immer; Artikel-Zusatz (»OR – Art. 41«) **nur, wenn dasselbe Gesetz mehrfach offen** ist (sonst nur »OR«).
- **Tab-Piktogramme**: pro Typ unterscheiden (Gesetz / Engine-Rechner / Übersicht …).
- **Aufgehobene Normen**: eingeklappt, per Klick aufklappbar.
- **Blauer Hover-Kreis**: nur das visuelle Artefakt weg, Klick-/Permalink-Funktion behalten.
- **Tab-Limit**: hohes Limit (50) statt 8, nicht ganz unbegrenzt.
- **Einstellungen-Rubrik enthält**: Standard-Kanton, Gesamt-Reset, Theme hell/dunkel/auto, Vorlagen-Defaults (Detailgrad/Stil), Listendichte/Lesebreite, **Profil (Name + Adresse)** zum Vorausfüllen von Engines.
- **Standard-Kanton wirkt**: Fristenrechner + Gebühren-/Kostenrechner; mit Profil (Name/Adresse) verknüpft.
- **Prozess**: autonom in thematischen Batches, eigener Worktree ab main, pro Schritt Bug-/Logik-Check, nach jedem Batch deployen (Topologie-Check vor Deploy), die zwei Brocken (kantonale Entscheide, Einstellungen) via ultracode.

---

## Batch A — Quick-Wins: Bugfixes & CSS (geringes Risiko, kein Datenpfad)

### A1 · »Berechnung statt KI«-Badge von Startseite entfernen  *(Anw. 12)*
- **Stelle**: `src/pages/Startseite.tsx:36-38` (Pill-Badge) + Kommentar Z. 30.
- **Vorgehen**: das `<p>`-Badge löschen, Kommentar bereinigen. Kein anderer Ort rendert den String.
- **Verifikation**: Startseite lädt, kein Layout-Loch.

### A2 · Fristenrechner-Kalender nutzt vollen Platz  *(Anw. 4)*
- **Befund**: Kalender steckt in `lg:grid-cols-2` (rechte Hälfte) und wird durch `kompakt` auf schmale Kacheln gezwungen.
  - `src/components/start/Schnellrechner.tsx:108` (`lg:grid-cols-2`), Z. 112 (`lg:border-l … pl-5`), Z. 114 (`<FristenKalender>`).
  - `src/components/start/FristenKalender.tsx:44` (erzwingt `kompakt`).
  - `src/components/FristenKalender.tsx:144` Tile-Breite `w-[min(12.5rem,100%)]` (kompakt) vs. `15.5rem`.
- **Vorgehen**: Layout im Fristen-Tab so umstellen, dass der Kalender die volle Breite (oder eine breitere Spaltenaufteilung) bekommt; `kompakt`-Kachelbreite weiten. Eingabe darf darüber/daneben bleiben.
- **Verifikation (Playwright via Bash)**: Desktop + Mobil, Kalender füllt Breite, keine Überlauf-Scrollbar.

### A3 · Betreibungskosten-Kacheln auf gleiche Höhe  *(Anw. 18)*
- **Befund**: `src/components/forms/GebvKostenForm.tsx:103` `grid-cols-2` ohne `auto-rows-fr`; Felder haben variable Innenhöhe (Checkbox + verschachtelte Inputs).
- **Vorgehen**: `auto-rows-fr` aufs Grid, `h-full` auf die `<Field>`-Wrapper.
- **Verifikation**: `/rechner/betreibungskosten`, Kacheln einer Reihe gleich hoch.

### A4 · /gesetze?ebene=kanton — Kantone werden nicht angezeigt  *(Anw. 5, Bug)*
- **Root Cause**: `src/pages/Gesetze.tsx:338-341` `gefiltert` filtert auf `ebene === 'bund'`; der Kanton-Render-Zweig (Z. 515/517/528) füttert aber genau dieses Bund-only-`gefiltert` in `gruppiereNachKanton`/Filter → 0 Kantone. Die `kantone`-Memo (Z. 346-349) und die SchweizKarte (Z. 477) sind korrekt — daher funktioniert die Karte, die Liste nicht.
- **Vorgehen**: kantons-skopierte Quelle bauen (`erlasse.filter(e => e.ebene === 'kanton')` mit `filtern(...)` über die Suche) und an Z. 515/517/528 statt `gefiltert` verwenden.
- **Verifikation**: `/gesetze?ebene=kanton` listet Kantone; Einzelkanton-Ansicht + Suche funktionieren.

### A5 · Sidebar: Strafverfahren/SchKG markiert fälschlich Zivilprozess mit  *(Anw. 13+14, Bug)*
- **Root Cause**: `src/components/layout/Sidebar.tsx:18-43` `istAktiv`. Drei Karten teilen denselben Pfad `/rechner/zustaendigkeit`, nur per Hash unterschieden (`src/lib/startseiteKarten.ts:443` ohne Hash = Zivilprozess, `:461` `#schkg`, `:477` `#straf`). Der Hash-Guard (Z. 26-27) greift nur, wenn das **Ziel** einen Hash hat — das hash-lose Zivilprozess-Ziel matcht daher jeden `loc.hash`.
- **Vorgehen**: in `istAktiv` hash-lose Ziele nur aktiv markieren, wenn `loc.hash === ''`. (Die Query-Discriminator-Schleife Z. 38-41 deckt `?ebene`/`?kt` schon ab; nur der Hash-Fall fehlt.)
- **Verifikation**: Klick auf jede der drei Zuständigkeits-Karten markiert nur sich selbst; Regressions-Check übrige Sidebar.

### A6 · Blauer Hover-Kreis bei Ziffern/Litterae entfernen (Funktion behalten)  *(Anw. 3)*
- **Befund (ehrlich)**: Es gibt **kein blaues Token** im Design-System; keine projekteigene Regel erzeugt einen blauen Kreis. Wahrscheinlich **browser-natives** Fokus-/Tap-Highlight-Artefakt auf den Marker-Buttons. Eingrenzbare Stellen:
  - `src/components/normtext/ArtikelBody.tsx:428` (Item-Hover-Ring brass), `:18-32` (`ZitierMarke`-Button), `:38-67` (`FnRef`).
  - `src/index.css:165` (`:focus-visible` outline brass) — kein `:focus{outline:none}` vorhanden.
- **Vorgehen**: **zuerst live im Browser reproduzieren** (Hover vs. Klick-Fokus, evtl. mobiles Tap-Highlight `-webkit-tap-highlight-color`). Dann gezielt nur das Artefakt unterdrücken (z. B. `-webkit-tap-highlight-color: transparent`, Tap-Outline), Permalink-/Klick-Funktion der Marke unangetastet lassen.
- **Verifikation**: Hover/Klick auf lit./Ziff. → kein Kreis; Permalink-Kopieren/Sprung funktioniert weiter.

---

## Batch B — Tab-System  *(eine zusammenhängende Einheit: `lib/tabs.ts` + `TabStreifen` + `TabTracker`)*

> Architektur: kein Store/Context — State liegt in `localStorage['lexmetrik-tabs']`, Sync via Custom-Event. Dateien: `src/lib/tabs.ts` (SSoT), `src/components/TabTracker.tsx` (Erzeugung), `src/components/layout/TabStreifen.tsx` (Anzeige), `src/lib/verlaufLabel.ts` (Label).
> **Achtung Golden/Prerender**: Der `< 2 → null`-Guard (TabStreifen.tsx:98) existiert u. a. wegen byte-gleicher Prerender-Ausgabe. Bei B3 Topologie-/Prerender-Check mitziehen.

### B1 · Tab-Limit 8 → 50  *(Anw. 6)*
- **Stelle**: `src/lib/tabs.ts:21` `const MAX = 8` (Verdrängung via `slice(-MAX)` Z. 63, Lade-Schutz `slice(0,MAX)` Z. 35).
- **Vorgehen**: `MAX = 50`. (Optisch unkritisch, da Tabs sich pro Kategorie in ein Dropdown gruppieren.)

### B2 · Gleiches Gesetz mehrfach öffnen können  *(Anw. 7)*
- **Befund**: Identität/Dedupe über `pfadTeil(path)` (Pfad ohne Hash), `merkeTab` `src/lib/tabs.ts:49-64` — derselbe Pfad aktualisiert den bestehenden Tab statt einen zweiten anzulegen. `pfadTeil` strippt zudem den Hash (`verlaufLabel.ts:21-23`), also gelten `…#art-1` und `…#art-700` als derselbe Tab.
- **Vorgehen**: Tab-Instanz-Identität einführen (eigene `id` pro Tab statt Pfad als Schlüssel), sodass bewusst ein zweiter Tab desselben Gesetzes entstehen kann (z. B. expliziter »in neuem Tab öffnen«-Pfad bzw. neue Instanz statt Update). Dedupe-Verhalten für normales Navigieren beibehalten, damit nicht ungewollt Duplikate entstehen.
- **Hinweis**: Greift in B4 (Label-Disambiguierung) und B3 (sofortige Sichtbarkeit). Sorgfältiger Logik-Check, da dies das Kernmodell ändert.

### B3 · Tab sofort beim ersten Gesetz/Engine  *(Anw. 8)*
- **Befund**: **kein** Erzeugungs-, sondern ein **Anzeige**-Problem. Der erste Tab wird erzeugt/gespeichert (`TabTracker.tsx:18-19`), aber `TabStreifen.tsx:98` `if (tabs.length < 2) return null` blendet den Streifen aus, bis ≥2 offen sind. »Übersicht« (`/gesetze`, `/rechner` …) erzeugt bewusst keinen Tab (`INHALT_ITEM`-Regex `TabTracker.tsx:13-18`).
- **Vorgehen**: Guard auf `< 1` lockern (Streifen ab dem ersten Inhalts-Tab zeigen). Prerender-/Golden-Byte-Gleichheit prüfen (Grund des bisherigen Guards) — ggf. Streifen nur clientseitig/nach Hydration zeigen, damit die statische Ausgabe stabil bleibt.
- **Verifikation**: Erstes geöffnetes Gesetz/Engine → sofort ein Tab; Übersichtsseiten weiterhin ohne Tab.

### B4 · Tab-Label »Abk – Art. X« (nur bei Mehrfach-Instanz)  *(Anw. 9)*
- **Befund**: Label-Resolver `src/lib/verlaufLabel.ts:65-81` liefert heute nur Kürzel/Titel. Der aktive Artikel lebt isoliert im Reader (`src/pages/GesetzLeser.tsx:257` `aktivIds` via IntersectionObserver; Hash `#art-…` Z. 355/387) und ist **nicht** mit dem Tab verdrahtet.
- **Vorgehen**:
  1. Aktiven Artikel an den Tab melden (Hash im Tab-Pfad mitführen **oder** eigenes Event Reader→Streifen).
  2. Im `TabStreifen` Label als »`Kürzel` – Art. X« mit **Bindestrich** zusammensetzen, **aber nur**, wenn ≥2 Instanzen desselben Gesetzes offen sind (Bedingung aus David: sonst nur Kürzel). Verzahnt mit B2.
- **Verifikation**: ein Gesetz offen → »OR«; zweimal offen → »OR – Art. 41« / »OR – Art. 97«, aktualisiert sinnvoll.

### B5 · Tab-Piktogramme pro Typ  *(Anw. 10)*
- **Befund**: `src/components/layout/TabStreifen.tsx:37-43` `KAT_META` (`gesetze:'§'`, `rechtsprechung:'⚖'`, `vorlagen:'▤'`, `rechner:'⊞'`), Kanton-Sonderfall = Wappen (`KantonWappen.tsx`).
- **Vorgehen**: klar unterscheidbare Glyphen/Icons je Typ (Gesetz / Engine-Rechner / Rechtsprechung / Vorlage / Übersicht) festlegen; Kanton-Wappen beibehalten. Optisch dezent halten.
- **Verifikation**: Tab-Leiste mit gemischten Typen, Icons auf einen Blick unterscheidbar; Dark-Mode-Parität.

---

## Batch C — Gesetzesleser Darstellung  *(`GesetzLeser.tsx` + `ArtikelBody.tsx`)*

### C1 · Marginalien oberhalb der Absätze, Text volle Breite (Fedlex-Stil)  *(Anw. 2)*
- **Befund**: Randtitel in seitlicher Spalte via Grid `src/pages/GesetzLeser.tsx:136` `xl:grid-cols-[12.5rem_minmax(0,1fr)]`; Marginalblock Z. 140-170 (Struktur-Marginalie Z. 147-153 / amtlicher `e.titel` Z. 159-163), Lesespalte Z. 176-202 (`max-w-[46rem]`). Delta-Logik `margAnzeige` Z. 333-344. Keine `position:absolute`/`aside` — rein das Grid.
- **Vorgehen**: Grid auflösen; Marginalblock **über** die Absätze setzen (Sachüberschrift als fett/serif Heading oberhalb, Fedlex-Manier); Lesespalte verbreitern (`max-w` erhöhen). Delta-Anzeige der Randtitel beibehalten.
- **Verifikation (Playwright)**: mehrere Erlasse (Bund + Kanton), Randtitel sitzen oberhalb, Text breiter, keine Doppelanzeige; mobil unverändert gut.

### C2 · Aufgehobene Artikel/Absätze eingeklappt + aufklappbar  *(Anw. 15)*
- **Befund**: Erkennung `src/components/normtext/ArtikelBody.tsx:82-92` (`istAufgehoben`); Darstellung Absatz Z. 361 / Item Z. 449-450 als `italic text-ink-400`.
- **Vorgehen**: aufgehobene Einheiten standardmäßig zu einer dünnen Zeile zusammenklappen (»Art. X aufgehoben ▸«), per Klick aufklappbar. Download-Text (`GesetzLeser.tsx:613`) unverändert vollständig lassen. (Optionaler globaler »ganz ausblenden«-Schalter kommt über Einstellungen, Batch E.)
- **Verifikation**: Erlass mit aufgehobenen Normen → dezente Zeile, aufklappbar; Lesefluss ruhig.

### C3 · Suche: beim Schliessen Position halten + Klick auf Treffer-Artikelnummer  *(Anw. 1)*
- **Befund**: `suche`-State `GesetzLeser.tsx:247`; bei leerer Suche wird `treffer` null → Volltext rendert ab Sektion 1, **keine Scroll-Restauration** (Z. 857-866) = der gemeldete »springt an Anfang«. Treffer-Artikelüberschrift ist nur Hash-Anker `<a href="#art-…">` (`:145`), **löscht die Suche nicht**. Es existiert bereits `springeZuArtikel` (`:348-366`) mit `setSuche('')` + Scroll + Blink — das ist das Vorbild.
- **Vorgehen**:
  1. **Schließen der Suche**: Scrollposition vor Suchbeginn merken und nach Leeren wiederherstellen (oder Suche als Overlay über dem Volltext führen, sodass die Position erhalten bleibt).
  2. **Klick auf Artikelnummer im Treffer**: an `springeZuArtikel`-Logik koppeln → `setSuche('')` + Sprung zum Artikel im Fließtext + Blink.
- **Verifikation**: suchen → Treffer-Artikelnr klicken → landet am Artikel, Suche leer; Suche leeren ohne Klick → bleibt an voriger Position.

### C4 · Gliederung + Suchfeld bündig zu Header/Tab-Fenster  *(Anw. 11)*
- **Befund**: Bezugskanten Header `Topbar.tsx:22` `h-16`=4rem + `TabStreifen.tsx:64-65` CSS-Var `--tabstreifen-h`. Sticky-Offsets korrekt bei `GesetzLeser.tsx:777` & `:812` (`calc(4rem + var(--tabstreifen-h))`), **aber** die xl-TOC/Such-Spalte `:828` nutzt eine **Magic-Number `xl:top-[10.5rem]`** statt der Var → driftet, wenn Tabs offen sind. (Gleiches Muster in `EntscheidLeser.tsx`.)
- **Vorgehen**: Magic-Number durch `calc(4rem + var(--tabstreifen-h) + …)` ersetzen, sodass Gliederung/Suchfeld bündig am Header+Tab-Streifen kleben. Hängt mit B3 zusammen (Streifen jetzt früher sichtbar → `--tabstreifen-h` öfter ≠ 0).
- **Verifikation**: mit/ohne offene Tabs bündig; auch EntscheidLeser prüfen.

### C5 · Erlass-Kopf + Ingress/Erlassformel darstellen  *(Anw. 17)*  — **Datenpfad, größerer Posten**
- **Befund**: Kopf (SR, Titel, Stand, Live-Link) wird schon gerendert (`GesetzLeser.tsx:702-717` aus `BrowseErlass`). **Erlassformel/Ingress** (»Die Bundesversammlung … beschliesst:«) wird **weder extrahiert noch gerendert** — kein Feld dafür.
- **Vorgehen**:
  1. Extraktor erweitern (`scripts/normtext/struktur-extrahiere.ts` / `extrahiere-fedlex.ts`), Ingress-Element + Datum (»vom …«) erfassen.
  2. Feld in `NormSnapshot`/`BrowseErlass` ergänzen (`src/lib/normtext/typen.ts` / `browse-typen.ts`).
  3. Im Reader zwischen Kopf und Art. 1 in geeigneter Form rendern (inkl. Fußnoten der Ingress-Verweise).
  4. Betroffene Erlasse neu generieren; **Currency-Arbiter** `check:fedlex-versionen` + adversariale Stichprobe (vgl. Lektion ELI-Resolver liefert veraltete Daten).
- **Hinweis**: Datenregenerierung → eigener sorgfältiger Schritt, ggf. ans Ende von C oder eigener Mini-Batch.
- **Verifikation**: Stichprobe Bund-Erlasse (z. B. ZGB) zeigt Kopf + Ingress wie Fedlex; keine Fußnoten-Leaks.

---

## Batch D — Internationale Verträge: Darstellung überarbeiten  *(Anw. 16)*
- **Befund**: Keine eigene Volltext-Darstellung. Internationale Erlasse (SR 0.*, `rechtsgebiet === 'international'`) laufen als Live-Link oder `pdf-embed`-iframe (`GesetzLeser.tsx:481-537`); Rubrik `src/pages/International.tsx` + `src/components/normtext/InternationalRubriken.tsx`. Tabellen sind allgemein in `ArtikelBody.tsx:167-256`, **nicht** international-spezifisch.
- **Vorgehen**:
  1. **Zuerst Recherche**: reale Strukturen internationaler Verträge auf Fedlex sichten (abweichende Gliederung, Präambeln, **Anhänge/Tabellen am Ende**, Unterzeichnerlisten).
  2. Darstellungsregeln ableiten (Präambel-Block, Anhang-/Tabellen-Sektion am Ende sauber rendern statt abschneiden).
  3. Umsetzen in `ArtikelBody`/Reader bzw. eigenem int.-Pfad; ggf. Extraktor-Anpassung.
- **Hinweis**: Umfang erst nach Recherche bezifferbar — evtl. eigener Plan, falls Extraktor-Arbeit nötig.
- **Verifikation**: Stichprobe Staatsverträge mit Anhängen/Tabellen sauber dargestellt.

---

## Batch E — Rubrik »Einstellungen«  *(Anw. 20, ultracode)*
- **Ziel**: neue Sidebar-Rubrik »Einstellungen« mit persistenten Optionen (localStorage), die in die App durchgreifen.
- **Inhalt (geklärt)**:
  - **Standard-Kanton** → wirkt auf Fristenrechner + Gebühren-/Kostenrechner (Vorbelegung).
  - **Profil: Name + Adresse** → füllt passende Engines vor; mit Standard-Kanton verknüpft.
  - **Theme** hell/dunkel/auto (heute nur Auto-Dark).
  - **Vorlagen-Defaults**: Detailgrad + Stil (nüchtern/modern).
  - **Listendichte/Lesebreite** (kompakt/komfortabel; optional Lesebreite im Gesetzesleser — verzahnt mit C1).
  - **Gesamt-Reset** der gespeicherten Informationen/Zustände.
  - **Optional**: globaler Schalter »aufgehobene Normen ausblenden« (verzahnt mit C2).
- **Vorgehen**: via **ultracode**-Workflow — (1) Inventar aller heute verstreuten persistenten Zustände/Defaults (Tabs, Theme, Kanton-Filter, Vorlagen-Optionen) erheben; (2) zentralen Einstellungs-Store + Sidebar-Eintrag + Seite entwerfen; (3) Andockpunkte (Fristenrechner, Gebührenrechner, Engine-Prefill, Reader) verdrahten; (4) Reset sauber (welche Keys).
- **Verifikation**: jede Einstellung wirkt + überlebt Reload; Reset räumt definiert auf; Engines vorausgefüllt.

---

## Batch F — Kantonale Entscheide: Recherche + Plan  *(Anw. 19, ultracode — Deliverable = Plan, nicht Code)*
- **Befund**: Quelle OpenCaseLaw + entscheidsuche.ch; Pilot mit **5 Gerichten / 30 Entscheiden** (`public/rechtsprechung/kanton/<KT>/<gericht>/*.json`), gerendert über denselben Reader wie Bund (`EntscheidLeser.tsx` / `EntscheidBody.tsx`). Kern-Defizite (vom Explore-Agenten belegt):
  - SG-Regesten echt-amtlich, aber als `regesteAmtlich:false` fehletikettiert → UI untertreibt Qualität.
  - Uneinheitliche Regeste-Abdeckung (GR/BE/AG ohne Regeste-Feld).
  - `rubrum: null` durchgängig → kein Gegenstand/Parteien/Vorinstanz-Kopf.
  - Kantonale Normen werden nicht verlinkt (`fedlexLinkFuerArtikel` nur Bund).
  - alle `routine`/`maschinell`; bekannter Extraktions-Bug `152_I_105` (frz.).
- **Vorgehen (ultracode, Output = Plandokument)**:
  1. **Allgemein**: wie publizieren Kantone Entscheide (Portale, Formate, Strukturierungsgrad, Lizenz/Anonymisierung)?
  2. **Je Kanton** einzeln: Quelle, Format (HTML/PDF/JSON), Felder, Verlässlichkeit.
  3. **Gemeinsamkeiten** suchen → maschinell übernehmbares Schema? Wenn ja: Adapter-Plan.
  4. Wenn maschinell nicht tragfähig: **Plan für direkte PDF-/gesicherte Darstellung** (z. B. amtliches PDF einbetten wie `pdf-embed`-Pfad bei EMRK) mit ehrlichen Status-Markern.
- **Anschluss**: bestehende Pläne `FAHRPLAN-RECHTSPRECHUNG.md` (Kantone als P3+), `FAHRPLAN-ENTSCHEIDSUCHE-AUSBAU.md` einbeziehen, nicht duplizieren.
- **Hinweis**: passt in die Zeitsperre bis 1.12.2026 (Recherche/Plan/Status-Marker ohne Davids Fachzeit).

---

## Reihenfolge & Abhängigkeiten
1. **A** (Quick-Wins) — unabhängig, sofort deploybar in einem Rutsch.
2. **B** (Tab-System) — zusammenhängend; B2↔B4 verzahnt (Mehrfach-Instanz ↔ Artikel-Label), B3 vor C4.
3. **C** (Leser) — C4 hängt an B3 (Tab-Streifen-Höhe); C5 ist Datenpfad (eigener sorgfältiger Schritt).
4. **D** (intl. Verträge) — erst Recherche, dann Umfang.
5. **E** (Einstellungen, ultracode) — nach A (nutzt Fristen-/Gebührenrechner) sinnvoll.
6. **F** (kantonale Entscheide, ultracode) — reine Recherche/Plan, jederzeit parallelisierbar.

## Querschnitt-Regeln (Daueranweisungen)
- Eigener Worktree ab main; **nicht** den laufenden `seo-detail-prerender`-Worktree anfassen.
- Pro Teilschritt Logik-/Bug-Check, adversarialer Schlussdurchgang; Werte stets mit Norm/Link/Stand.
- Visuelle Verifikation per **Playwright via Bash** (Desktop + Mobil), Dark-Mode-Parität.
- **Topologie-Check vor jedem Deploy** (Feature-Rollback-Lektion); golden/prerender-Byte-Gleichheit bei B3/C beachten.
- Aufräumen: toten Code/Imports entfernen, nie Rechtsregel mitlöschen.
