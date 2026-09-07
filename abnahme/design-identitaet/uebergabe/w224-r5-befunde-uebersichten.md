# R5-Befunde Familie A «Übersichten + statische Seiten» (W2·24, 6.9.2026)

Preview: `npx vite preview --port 4341`, HEAD `0834cbd7b` (dist neu gebaut, war 54 min älter als
HEAD → `npm run build` nachgeholt). Gemessen per Playwright (eigenes Skript, kein Auge-allein),
hell+dunkel, @1440×900 und @390×844, wo relevant. Routen: `/gesetze`, `/gesetze?ebene=kanton`,
`/gesetze?ebene=kanton&kt=BS`, `/gesetze?ebene=international`, `/rechtsprechung`,
`/rechtsprechung?sachgebiet=privat`, `/materialien`, `/rechner`, `/vorlagen`, `/einstellungen`,
`/methodik`, `/ueber`, `/kontakt`, `/datenschutz`, `/gibtesnicht`, `/suche?q=Kündigung`.

## Befunde nach Schwere

| ID | Route(n) | Viewport/Modus | Kat. | Messwert/Selektor | Datei:Zeile | Schwere | Fix |
|---|---|---|---|---|---|---|---|
| U1 | `/ueber`, `/kontakt`, `/datenschutz` | hell@1440, axe | 10 | axe `link-in-text-block` (impact **serious**), 5 Knoten: `.text-brass-700.hover\:text-brass-600[href$="abdeckung"]`, `[href$="methodik"]`, `[href$="kontakt"]` (Ueber.tsx), `.text-brass-700` (Kontakt.tsx, Datenschutz.tsx) | `src/pages/Ueber.tsx:81,83,88`; `src/pages/Kontakt.tsx:71`; `src/pages/Datenschutz.tsx:35` | **hoch** | Inline-Links unterstreichen (`underline` statt nacktem `text-brass-700 hover:text-brass-600`) — der frühere B-2-Markenentscheid «kein Unterstrich» ist laut `e2e/a11y.e2e.ts:49-51` mit dem Design-Identitäts-Umbau AUFGEHOBEN («Links unterstrichen», FAHRPLAN-DESIGN-IDENTITAET.md:82); diese 3 Seiten sind auf keiner Standard-axe-Route (nur Start/Tagerechner/Arbeitsvertrag/Zuständigkeit geprüft) und blieben darum unentdeckt. |
| U2 | 9 von 14 Routen (`gesetze`, `gesetze-kanton`, `gesetze-bs`, `gesetze-intl`, `rechtsprechung`, `materialien`, `rechner`, `vorlagen`, `einstellungen`) | hell+dunkel@1440 | 1 | `.lc-card`/`.lc-panel`/`.lc-tile`: Rahmen auf allen 4 Seiten UND eigene Füllung (`--surface:#FDFDFD` bzw. `--surface-raised:#FFFFFF`) ≠ `--paper:#FBFBFB`, aber Δ nur 2–4/255 (visuell kaum wahrnehmbar). Instanzen: `materialien` 1561×, `rechtsprechung` 847 Chips + 339 Badges + 7 Panels, `gesetze-intl` 37 Karten, `gesetze-bs` 15 `<details>`, `rechner` 21+12, `vorlagen` 26, `gesetze` 4, `einstellungen` 6 | `src/index.css:1405` (`.lc-card { @apply bg-surface border border-line rounded-lg shadow-md; }`), `:2307` (`.lc-panel`), `:1457` (`.lc-tile`) | mittel | Zielbild (§5) ist «Linien statt Flächen»: `border-line` auf allen 4 Seiten + eigene (wenn auch fast unsichtbare) Füllfarbe bleibt die Kasten-Anatomie, obwohl Radius (`--radius-lg:0px`) und Schatten (`--shadow-md:none`) bereits 2026 auf 0 gesetzt wurden. Entweder auf reine Trennlinie (nur `border-bottom`) umstellen oder bewusst als Ausnahme im Fahrplan begründen — aktuell nicht dokumentiert, warum `.lc-card` die Vollrahmen-Anatomie behalten darf. |
| U3 | `/rechtsprechung`, `/rechtsprechung?sachgebiet=privat` | hell+dunkel, @1440 UND @390 | 7 | `truncate` ohne `title`-Attribut: 63 Instanzen @1440 (z. B. Bezeichnung „Siegelung und Entsiegelung sichergestell…“ scrollWidth 1006/clientWidth 596), 325 Instanzen @390 (ratio bis 360/132 = nur ~37 % sichtbar) | `src/components/rechtsprechung/EntscheidZeile.tsx:43` (`className="min-w-0 flex-1 truncate …"`, kein `title={bezeichnung}`) | mittel | `title={bezeichnung}` auf den Span setzen (Muster existiert bereits eine Zeile darüber bei `datumUnbekannt`), damit Hover/A11y-Baum die volle Bezeichnung zeigt — reine Ergänzung, keine Layout-Änderung. |
| U4 | `/gesetze?ebene=kanton&kt=BS` | hell+dunkel, @390 | 7/10 | `span.font-sans.font-semibold` (Gemeinde-Titel) scrollWidth 182 vs. clientWidth 171/177 (≈6–9 px, ≈5 %) | `src/pages/gesetze-teile/KantonSystematik.tsx:123,129` (`line-clamp-2`) | kosmetisch | Randfall von `line-clamp-2` bei sehr schmalen Kacheln @390 — geringfügig, ggf. `min-w-0` ergänzen; kein optischer Bruch in den Screens sichtbar. |

## Gut, behalten

- **Radien und Schatten bereits flach:** `--radius-sm/md/lg/xl/2xl:0px` und `--shadow-sm/md:none` (`src/index.css:339-340,398-400,612-614`) — Kategorie 2 (Radien>0, Box-Shadow ausserhalb Menü/Dialog) liefert **0 Treffer auf allen 16 Routen × 4 Modi**; `--shadow-lg` bleibt gezielt nur für Menü/Popover/Dialog reserviert (Kommentar Zeile 394). `backdrop-filter` ebenfalls 0 Treffer.
- **Farbtreue:** kein einziger Treffer auf Gold/Brass-Hexwerte (`#826225`, `#B08D4A`, `#DDC9A0`, `#F1E8D6`) in computed colors auf allen 16 Routen.
- **Versalien:** einzige `text-transform:uppercase`-Fundstellen sind Sprachkürzel-Badges (`fr`, `de` auf `.lc-badge-soft`), `letter-spacing:normal` (0 em) — Kategorie-3-Ausnahme greift korrekt, kein Verstoss.
- **Kopf-Anatomie über die ganze Familie identisch** (Kategorie 9, Tabelle unten): Titelblatt (Overline+H1) sitzt bei y=179 auf JEDER der 16 Routen, genau 1 `<h1>` pro Seite, keine Dopplung, keine springende Höhe.
- **Native `<select>` statt Custom-Dropdown** für „Sortierung“ (`EntscheidFilter.tsx:209`) — vermeidet das D5-Muster (✓-an-Doppel, Kasten-Fokus, Umbruch) von vornherein, weil kein selbst gebautes Popover nötig ist.
- **Header-Suchtreffer-Panel** (`role="listbox"`, `.lc-card`) sauber: Highlight per `<mark>`, kein Fokus-Kasten, keine Umbrüche, screenshotted (`finder-uebersichten-menu-suche.jpg`).
- **Funktions-Smoke bestanden:** Rechtsprechung-Sachgebiet-Filter setzt `?rg=privat` und filtert; Gesetze-Sidebar-Accordion „Nach Sachgebiet“ togglet `aria-expanded` false→true; Rechner-Kachel verlinkt korrekt (`/rechner/zustaendigkeit`); Header-Suche liefert für „Kündigung“ 245 Treffer inkl. Art. 271 OR mit Highlight.
- **Leerlücken:** kein Fund > 120 px im Hauptinhalt auf irgendeiner der 16 Routen (Kategorie 6) — kein D6-Wiederholungsfall in dieser Familie.

## Kategorie 9 — Kopf-/Ortsprüfung (Tabelle, y-Position @1440, hell)

| Route | Header (sticky) | Sekundär-Nav (Bund/Kantone o. ä.) | Titelblatt (Overline+H1) | H1-Text | Erste Sektion | Footer-Nav |
|---|---|---|---|---|---|---|
| `/gesetze` | y=0 | y=0 (Ebene-Tabs) | y=95→179 | „Schweizer Gesetzessammlung“ | y=~250 | y=8764/9038 |
| `/gesetze?ebene=kanton` | y=0 | y=0 | y=95→179 | „Schweizer Gesetzessammlung“ | — | y=1403 |
| `/gesetze?ebene=kanton&kt=BS` | y=0 | y=0 | y=95→179 | „Schweizer Gesetzessammlung“ | — | y=1980 |
| `/gesetze?ebene=international` | y=0 | y=0 | y=95→179 | „Schweizer Gesetzessammlung“ | — | y=4141 |
| `/rechtsprechung` | y=0 | y=0 | y=95→179 | „Rechtsprechung“ | Sachgebiet-Leiste y=306 (sticky) | y=27058 |
| `/materialien` | y=0 | y=0 | y=95→179 | „Materialien“ | — | y=95859 |
| `/rechner` | y=0 | y=0 | y=95→179 | „Rechner“ | — | y=3934 |
| `/vorlagen` | y=0 | y=0 | y=95→179 | „Vorlagen“ | — | y=2955 |
| `/einstellungen` | y=0 | y=0 | y=95→179 | „Einstellungen“ | — | y=2014 |
| `/methodik` | y=0 | y=0 | y=95→179 | „Wie LexMetrik rechnet“ | — | y=6270 |
| `/ueber` | y=0 | y=0 | y=95→179 | „Über LexMetrik“ | — | y=1514 |
| `/kontakt` | y=0 | y=0 | y=95→179 | „Kontakt aufnehmen“ | — | y=1181 |
| `/datenschutz` | y=0 | y=0 | y=95→179 | „Datenschutzerklärung“ | — | y=2387 |
| `/gibtesnicht` (404) | y=0 | y=0 | y=243 (kein Overline, kürzerer Header-Block) | „Seite nicht gefunden“ | Wege-Links y=341 | y=606 |
| `/suche?q=Kündigung` | y=0 | y=0 | y=95→179 | „Suche“ | — | y=14446 |

Auffällig: `/gibtesnicht` bricht das sonst durchgängige y=179-Muster (H1 bei y=243, ohne
Overline-Zeile) — konsistent mit der Fehlseiten-Sonderkomponente `FehlSeite`, kein Fund (andere,
bewusst schlankere Anatomie für 404), aber nicht identisch mit dem Rest — als Beobachtung
festgehalten, nicht als Mangel gewertet, da 404 keine reguläre Übersichtsseite ist.

## Nicht geprüft

- **Verlauf-Popover** (`VerlaufUebersicht.tsx`, `aria-haspopup="dialog"`): Trigger erscheint nur
  bei nicht-leerem `localStorage`-Verlauf (`lexmetrik-zuletzt`) nach echter Client-Navigation;
  mit `page.goto()`-Preload liess sich der Verlauf nicht befüllen (3 Versuche, auch mit
  Zwischenseiten) — Menü-Anatomie (Kategorie 8, D5-Muster) für dieses Popover NICHT gemessen.
- **Sprache-/Thema-Menü als Popover:** `ThemaUmschalter` ist ein reiner Zyklus-Button (kein
  Dropdown) — kein Popover zu öffnen; ein eigenständiges Sprache-Popover wurde im Header dieser
  Familie nicht gefunden (evtl. nur im Leser/andere Familie) — als „nicht vorhanden“ statt
  „nicht geprüft“ zu werten, aber nicht mit letzter Sicherheit ausgeschlossen.
- **`/rechtsprechung?sachgebiet=…`**: Adressform laut Quellcode ist `?rg=<id>` (bestätigt per
  Funktions-Smoke, Klick auf „Privatrecht“ setzte `?rg=privat`), NICHT `?sachgebiet=` wie im
  Auftrag vermutet — mit `?sachgebiet=privat` aufgerufen lief die Seite ungefiltert (kein Fehler,
  aber der Filter griff nicht). Für die Messung wurde zusätzlich `?rg=privat` separat verifiziert
  (Funktions-Smoke), die Voll-Messreihe (11 Kategorien) lief nur auf der ungefilterten Vermutungs-URL.
- **Axe auf `/gesetze-bs`, `/gesetze-intl`, `/gesetze-kanton`, `/materialien`, `/rechner`,
  `/vorlagen`, `/einstellungen`, `/methodik`, `/gibtesnicht`, `/suche`, `/rechtsprechung`:**
  axe lief nur auf hell@1440 je Route (Budget), dunkel@1440 und beide @390 wurden NICHT
  axe-geprüft — nur DOM-Messungen (Kästen/Radien/Farbe/etc.) liefen in allen 4 Modi.
- **Mobile-Screenshots (@390):** nur Messwerte erhoben, keine Screens gespeichert (Budget:
  max. 25 Bilder, priorisiert auf hell@1440 je Route + die 2 geöffneten Menüs = 17 Dateien).
