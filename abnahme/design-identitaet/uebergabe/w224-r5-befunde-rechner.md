# R5-Befunde Familie B «Rechner» (W2·24) — 6.9.2026

Geprüft: 20 Rechner-Routen (`/rechner/*` aus `startseiteKarten*.ts` via `href`),
hell @1440×900 alle 20; hell+dunkel @1440 und @390 für die 6 Tiefenrouten
(tagerechner, prozesskosten, verjaehrung, streitwert, zustaendigkeit,
kuendigung); Funktions-Smoke + axe (`@axe-core/playwright`, eigenes Skript,
Scope `main`) auf den 6 Tiefenrouten. Preview `npx vite preview --port 4342`
auf HEAD `0834cbd7b` (nach `npm run build`, dist war zu alt). Playwright-
Skripte lagen temporär in `.claude/worktrees/w2-24-pruef/scratch-*.mjs`
(read-only Messung, nicht committet).

**Methoden-Korrektur während der Prüfung:** Der erste Dunkel-Test (nur
`html.classList.add('dark')` + `emulateMedia`) griff NICHT — die App liest
das Thema aus `localStorage['lexmetrik-thema']` (`src/components/thema.ts`)
und überschreibt eine nachträgliche DOM-Klassenänderung beim nächsten
Render. Alle "dunkel"-Screenshots der ersten Runde waren de facto hell.
Korrigiert über `context.addInitScript` + `localStorage.setItem(...,
'dunkel')` vor Navigation; die Tabelle unten basiert auf den korrigierten
Messungen.

**Zweite Korrektur (adversarial):** Kategorie 2 (Radius/Shadow) zeigte beim
naiven "computed style ≠ 0/none"-Check hohe Zahlen (radius 7–28, shadow 2–4
je Route). Direktmessung der KONKRETEN Elemente ergab: `--radius-sm/md/lg/
xl/2xl` stehen in `src/index.css:339-340` global auf `0px`, `--shadow-sm/md`
auf `none` (Zeilen 398-399) — nur `--shadow-lg` bleibt für Menü/Popover
reserviert. Card-Wrapper, `.lc-card`-Kacheln, Tab-Panel (`shadow-md`),
Floating-Button (`shadow-md`) liefern alle **computed radius:0px,
shadow:none** — die im Screenshot sichtbaren "Kästen" sind bereits
Zielbild-konform flach. Die einzigen echten Radius-Treffer sind
`rounded-full` an Kreis-Markern (Radio-Punkte, Kalender-Marker, 22–48 px
Durchmesser je nach Route) — grösser als die 12-px-Ausnahme, aber
funktional "echte Punkte", keine Kästen.

## Befunde nach Schwere

| ID | Route(n) | Viewport/Modus | Kat. | Messwert/Selektor | Datei:Zeile | Schwere | Fix |
|---|---|---|---|---|---|---|---|
| R-1 | ALLE 20 Routen | 390, kuendigung exemplarisch geprüft | 7 | Themen-Tab-Leiste (`flex ... bg-surface border ... rounded-lg`, 3 Reiter) hat `scrollWidth 415px > clientWidth 348px`; `overflow-x:auto` ohne Fade/Pfeil-Hinweis; 3. Reiter am rechten Rand abgeschnitten | Komponente der Themen-Tab-Leiste (Klasse `print:hidden flex min-h-11 ... rounded-lg w-fit`), Fundort in Rechner-Seiten mit Mehrthemen-Struktur (kuendigung bestätigt, mietrecht/zustaendigkeit strukturell ähnlich, nicht einzeln @390 gemessen) | mittel | Scroll-Fade/Pfeil ergänzen oder Reiter bei <400px zweizeilig statt horizontal-scroll |
| R-2 | ALLE 6 Tiefenrouten | hell+dunkel | 10 (axe) | `aria-allowed-role` (minor), 1 Treffer je Route, Selektor `.lc-notice` bzw. `details[role="note"]` | `src/components/PflichtDisclaimer.tsx:7` — `<details className="lc-notice" role="note">` | mittel (systemisch, 1 Ursache × 6/6 Routen, vermutlich alle 20) | `role="note"` von `<details>` entfernen oder auf erlaubte Rolle wechseln |
| R-3 | verjaehrung, streitwert, kuendigung | hell | 10 (axe) | `heading-order` (moderate), 1 Treffer, Sample nur `h3` (Kontext nicht isoliert) | nicht lokalisiert — weitere Diagnose nötig | mittel, aber **nicht abschliessend geprüft** | Heading-Hierarchie in den 3 Routen prüfen |
| R-4 | tagerechner (4×), kuendigung (2×) | hell+dunkel | 2 | `.lc-termin-ring`/`span.num` (Kalender-Fristenlauf-Marker, `rounded-full`, 28×28px) trägt echten Box-Shadow-Ring `0 0 0 2px #fff, 0 0 0 3px sage-600` (kein Blur/Versatz) ausserhalb Menü/Dialog | Kalender-Komponente des Fristenrechners (Marker-Klasse `num ... lc-termin-ring`) | kosmetisch | Falls das Zielbild auch Status-Ringe verbietet: über `border` statt `box-shadow` lösen; sonst als akzeptierte Ausnahme (Punkt-Marker) dokumentieren |
| R-5 | ALLE 20 Routen | hell+dunkel | 1 | Card-Wrapper (`bg-surface-raised border border-line p-6 sm:p-8`, `ui/Card.tsx`) sowie `.lc-tile`/`.lc-panel`/unselektierte Auswahl-Kacheln erfüllen die Skript-Definition "Rahmen ≥3 Seiten + Füllung≠Papier" — **aber** Füllungsdifferenz zur Seite nur 2–4/255 RGB hell (`rgb(255,255,255)` vs. Body `rgb(251,251,251)`), 5–12/255 dunkel — visuell keine wahrnehmbare "Fläche" | `src/components/ui/Card.tsx`; `.lc-tile`/`.lc-panel` in `src/index.css:1457,2307` | kosmetisch (Skript-Falsch-Positiv im strengen Sinne, technisch aber ein Fund) | Kein Handlungsbedarf — ggf. Skript-Schwelle in künftigen Prüf-Läufen auf wahrnehmbare ΔE anheben |

## Gut, behalten

- **Radius/Shadow bereits Zielbild-konform**: `--radius-*: 0px`, `--shadow-sm/md: none` global gesetzt (`src/index.css:339-340,398-400`) — betrifft Card-Wrapper, Auswahl-Kacheln, Tab-Panel, Floating-Buttons auf allen 20 Routen. `--shadow-lg` bleibt korrekt auf Menü/Popover beschränkt.
- **Formularfelder** (Kanton-/Streitwert-/Instanz-Selects, Datumsfelder) nutzen konsequent die Unterstrich-Anatomie statt Boxen (screenshot-bestätigt auf prozesskosten, tagerechner).
- **NormPopover** (Klick auf Norm-Chip, z. B. Art. 77 OR): radius 0, shadow none, ruhige Linien-Darstellung — kein D5-Muster (kein ✓-Doppel, kein Kasten-Fokus).
- **Farbreste**: 0 Treffer (Gold/Brass-Hex) auf allen 20 Routen.
- **Versalien/Tracking**: 0 echte Treffer (nur dekorativer "···"-Trenner mit `tracking-[0.3em]` auf 3 Zeichen, kein Fliesstext).
- **Mono ausserhalb Rechenweg**: 0 Treffer auf allen 20 Routen.
- **Leerlücken >120px** (Kategorie 6): 0 Treffer auf allen 20 Routen.
- **Konsolenfehler**: 0 auf allen 20 Routen (hell) und allen 6 Tiefenrouten (hell/dunkel/390).
- **Horizontaler Dokument-Overflow @390** (documentElement-Ebene): 0 auf den 6 Tiefenrouten.
- **Funktions-Smoke**: 6/6 Tiefenrouten liefern nach Eingabe/Klick ein sichtbares Ergebnis; verjaehrung berechnet bereits beim Laden live (kein Klick nötig) — korrektes Verhalten, kein Bug.

## Nicht geprüft

- Die restlichen 14 Rechner-Routen (nur hell@1440 gemessen, KEIN dunkel/390/Funktions-Smoke/axe): betreibungskosten, bgg-fristen, erb-fristen, erbteilung, gerichtszitat, gewaehrleistung, inkasso-strecke, mietrecht, notariat-grundbuch, schkg-fristen, teuerung, verjaehrung-board, verzugszins, zpo-fristen.
- Globale Menüs (Sprache/Thema-Umschalter, Verlauf, Reiter-Blatt in der Topbar) wurden auf der Rechner-Familie NICHT separat geöffnet/gescreenshottet — sie sind geteilte Komponenten, identisch zum bereits dokumentierten D5-Befund; keine rechner-spezifische Abweichung erwartet, aber nicht verifiziert.
- "Beispiel laden"-Preset-Suche (tagerechner, `#preset-suche`) — Eingabe hat die Seite zu einer anderen Sektion (Kalender-Ansicht) scrollen lassen, das eigentliche Dropdown-Ergebnis wurde nicht geöffnet/geprüft.
- `heading-order`-Befund (R-3) ist nicht bis zum konkreten Element zurückverfolgt.
- axe lief nur mit Scope `main` auf den 6 Tiefenrouten — Sidebar/Topbar (globale Chrome) nicht separat axe-geprüft.
- PDF-/.ics-Export-Knöpfe wurden als DOM-Elemente gemessen (Radius/Shadow), aber kein tatsächlicher Download/PDF-Inhalt verifiziert.
