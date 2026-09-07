# R5-Finder Familie C «Vorlagen-Assistenten» — Befunde (6.9.2026)

cwd: `.claude/worktrees/w2-24-pruef` · HEAD `0834cbd7b` · Preview `npx vite preview --port 4343`
(dist frisch, 13:09 > HEAD 13:07). 31 Routen geprüft (`/vorlagen` Katalog + 30 Detailseiten;
Lehrvertrag/Handelsreisender/Heimarbeit sind KEINE eigenen Routen, sondern Vertragstyp-Varianten
innerhalb `/vorlagen/arbeitsvertrag`). Messung: Playwright-Skript (DOM/computed-style-Scan über
alle 31 Routen @1440 hell; @390 Overflow-Sweep über alle 31; @1024/@390/dunkel + Funktions-Smoke +
axe vertieft auf den 6 Pflicht-Routen + Katalog). Nicht erschöpfend @1024/dunkel für alle 31 —
siehe „nicht geprüft" unten.

## Blockierend

| ID | Route | Viewport/Modus | Kat. | Messwert/Selektor | Datei:Zeile | Fix |
|---|---|---|---|---|---|---|
| V1 | **ALLE Wizard-/VorlagenSeite-Routen** (Arbeitsvertrag exemplarisch) | 1440 hell **und** dunkel, auch 1024 | 6 | `.flex.flex-col.md:justify-center` (linke Formular-Spalte) hat Zellhöhe = rechte Vorschau-Spalte (Grid-Stretch); Kind-Box wird vertikal zentriert → **Leerfläche OBEN und UNTEN je 1151 px** (Arbeitsvertrag Schritt 1, hell wie dunkel identisch, da rein strukturell), Eheschutzgesuch 472 px×2, Klage-ordentlich 240 px×2, Schlichtungsgesuch-bs 214 px×2 (1440) / 197 px×2 (1024), Forderungsabtretung 94 px×2, Fristerstreckung 77 px×2, Ag-Gründung 0 px (Formular gerade so hoch wie Vorschau) | `src/components/vorlagen/wizard.tsx:181` (`<div className={\`flex flex-col ${pk('md:justify-center', ...)}\`}>`) | `justify-center` durch `items-start`/natürliche Höhe ersetzen oder Formular-Karte ans Zellen-Ende ausrichten statt zentrieren; Ursache ist das Grid-Stretch (`grid-cols-…` ohne `items-start` auf dem äusseren Grid, Zeile 180) kombiniert mit `justify-center` auf der inneren Flex-Spalte — EIN Fund, betrifft alle 19 Dateien, die `VorlagenWizardRahmen`/`VorlagenSeite` importieren (≈27 der 30 Detail-Routen). |

**Kontext-Widerspruch:** Der Code-Kommentar bei Zeile 169–179 behauptet, genau dieses Problem sei am 5.9.2026 (R6-D1) bereits behoben worden («0 px, weil die Karte die Zellenhöhe füllt/zentriert statt eine Lücke darunter offenzulassen»). Die Messung widerlegt das: Der alte Fehler (Lücke NUR unten, `items-start`) wurde durch `justify-center` in zwei halb so grosse Lücken oben UND unten übersetzt — die behauptete Nullstellung gilt nur, wenn Formular- und Vorschau-Höhe zufällig gleich sind (Ag-Gründung). Beleg-Screens: `abnahme/design-identitaet/finder-vorlagen-d6-arbeitsvertrag-1440-hell.jpg` (Katalog-Kacheln, Formular oben abgeschnitten sichtbar leer) und `…-1440-hell-scroll.jpg`/`…-1440-dunkel.jpg` (Scroll-Position 1100 px: linke Spalte komplett weiss/leer, rechts läuft die Dokument-Vorschau).

## Hoch

| ID | Route | Viewport | Kat. | Messwert/Selektor | Datei:Zeile | Fix |
|---|---|---|---|---|---|---|
| V2 | **Ganze Familie** (alle 31 Routen, Stichprobe Forderungsabtretung/Ag-Gründung, aber `grep` bestätigt für alle) | 1440 hell (Struktur themen-unabhängig) | 5 | `document.fonts`/computed `font-family`: **kein einziges Element auf keiner der 31 Routen trägt `Literata`** (`--font-serif`) — Titel (H1), Lead-Text, Klauseltext der Dokument-Vorschau (das „Gelesene" schlechthin) laufen alle in Archivo (`--font-display`). Global existiert bislang nur ein gescopter Serif-Einsatz (`.lc-leser […] .lr-blatt` Randtitel, `.st-frage-feld` Suchfeld) — kein wiederverwendbarer „Lesetext"-Baustein für Vorlagen. | `src/index.css:627` (`h1,h2,h3{font-family:var(--font-display)…}` — kein Override für Vorlagen-Titel/Vorschau); `src/index.css:1068`,`2571` (einzige Serif-Scopes, beide fachfremd) | §5 verlangt Literata für „Titel" und „alles Gelesene" — Dokument-Vorschau und H1/Lead brauchen einen Literata-Baustein analog zum Leser-Rollout (R1–R4), bisher schlicht nicht gebaut für Familie C. |
| V3 | ALLE Wizard-/VorlagenSeite-Routen | 1440/1024 hell+dunkel | 1+2 | Formular-Karte `bg-surface-raised rounded-2xl border border-line` — 4-seitiger Rahmen + Radius 16px; im Hellmodus Füllung `#FFFFFF` vs. Seiten-`#FBFBFB` (Δ4, kaum sichtbar), im **Dunkelmodus** `--surface-raised:#212121` vs. `--paper:#151515` (deutlich sichtbarer Kasten) | `src/components/vorlagen/wizard.tsx:182` | Rahmen durch Linie ersetzen (Zielbild „Linien statt Flächen"), Radius auf 0 (§5 Form); EIN Fund, gleicher Ursprung wie V1 (dieselbe Komponente). |
| V4 | Schlichtungsgesuch-bs (repräsentativ für alle Wizard-Routen, gleicher Shell) | 390 hell | 9 | Zwei sichtbare, textgleiche Elemente **„Schlichtungsgesuch (alle Kantone)"** übereinander (top=70 Tab-Button in `NAV`, top=108 zweite `NAV` mit eigenem «‹» und eigenem «×») — H1 der Seite lautet aber „Schlichtungsgesuch (Basel-Stadt)": Tab-Titel und Breadcrumb nennen den generischen Vorlagen-Namen, doppelt, während der Seiteninhalt kantonsspezifisch ist. | Geteilte Shell `src/components/layout/Reiterleiste.tsx` + `OrtsAngabe.tsx` (nicht Familie-C-spezifisch — vermutlich auch in anderen Familien sichtbar, hier nur gemessen) | Zwei Zeilen mit identischem Text + zwei Schliessen-Symbolen für eine Seite verschwenden auf 390px kostbaren Platz; eine der beiden Zeilen (Tab ODER Brotkrume) muss weg oder differenzieren (Tab = Kurzform, Brotkrume = Vollname mit Kanton). Screen: `finder-vorlagen-390-hell-schlichtung.jpg`. |

## Mittel

| ID | Route | Viewport | Kat. | Messwert/Selektor | Datei:Zeile | Fix |
|---|---|---|---|---|---|---|
| V5 | Wizard-Routen (Schlichtungsgesuch-bs u. a.) | 1440 hell | 2 | Schritt-Nummern-Badges `rounded-full` mit `w-7 h-7`/`w-5 h-5` (28px/20px) — über der im Auftrag genannten 12px-Ausnahmegrenze für „echte Punkte" | `src/components/vorlagen/ui.tsx:295` (Stepper-Badge) | Badge-Grösse ≤12px oder eckig; systemisch (EIN `Stepper`, alle Wizard-Routen betroffen). |
| V6 | Katalog `/vorlagen` | 1440 hell | 1 | 26× `.lc-card` (4-seitiger Rahmen); Füllung `rgb(253,253,253)` vs. Body `rgb(251,251,251)` — Δ2, technisch eine Fläche, optisch kaum unterscheidbar von Papier | `src/index.css:1405` (`.lc-card{@apply … rounded-lg shadow-md}` — `rounded-lg`/`shadow-md` werden aber von einer späteren Regel auf 0/none zurückgesetzt, computed bestätigt `border-radius:0px; box-shadow:none`) | Grenzfall: Rahmen bleibt (Linien-Charakter), Füllungs-Delta ist vernachlässigbar; tote `rounded-lg`/`shadow-md`-Deklaration in der Quelle aufräumen (Verwirrung für nächste Lektüre), keine visuelle Dringlichkeit. |
| V7 | Arbeitsvertrag, Eheschutzgesuch, Fristerstreckung (Stichprobe) | 1440 hell, axe | 10 | axe-Regel `region`: 5 Knoten „All page content should be contained by landmarks" (Ausgabe-Zeile „Register erzeugt: …" unterhalb der Tableiste liegt ausserhalb von `<main>`/`<nav>`/`<header>`) | Layout-Shell (nicht Familie-C-spezifisch lokalisiert — gleiche 5 Selektoren auf allen 3 Stichproben) | Ausgabe-Zeile in eine benannte Landmark (z. B. `role="status"` im Header) einhängen; wahrscheinlich App-weit, nicht nur Vorlagen. |

## Kosmetisch

| ID | Route | Kat. | Messwert | Fix |
|---|---|---|---|---|
| V8 | fast alle Vorlagen-Dateien (40 Fundstellen in 39 Dateien, `grep -rc brass- src/pages/Vorlage*.tsx src/components/vorlagen/*.tsx`) | 4 | Utility-Klassen wie `bg-brass-500`, `text-brass-700`, `border-brass-500` sind **visuell unauffällig**, weil `--brass-500/-700/-800` in `index.css:162-169` bereits auf Graustufen (`#767676`,`#151515`,`#0D0D0D`) umgemappt wurden (R1-Token-Tausch) — keine sichtbare Gold-Farbe mehr, nur der Klassenname ist irreführend. | Kein visueller Fix nötig; bei Gelegenheit Klassen auf neutrale Namen umbenennen (Wartbarkeit), keine Dringlichkeit. |

## Gut, behalten

- NormPopover (Art. 319 OR etc., aufgerufen auf `/vorlagen/arbeitsvertrag`): Radius 0, `box-shadow:none`, Live-Link „Amtliche Fassung ↗", Snapshot-Hinweis sichtbar — entspricht §5/§7 vollständig. Screen: `finder-vorlagen-normpopover-1440-hell.jpg`.
- Export-Knöpfe (`ExportLeiste`, `src/components/vorlagen/wizard.tsx:559`): klare Buttons statt Menü/Dropdown, keine Chip-Anatomie — passt zum D5-Sollbild.
- Funktions-Smoke bestanden auf 2 Stichproben: Fristerstreckung (Feld füllen → Vorschau reagiert sofort, PDF/DOCX-Buttons aktiv, Reset-Button vorhanden) und Schlichtungsgesuch-bs (Checkbox setzen → „Weiter" entsperrt → Schritt 2 „Klagende Partei" → Feld füllen → Vorschau reagiert).
- Kein horizontaler Overflow (`scrollWidth>clientWidth`) auf allen 31 Routen @390.
- Mobile Schritt-Anzeige (`sm:hidden`, kompakte Fortschrittsleiste statt Chip-Wolke) vermeidet den Umbruch, den die Desktop-Chip-Leiste theoretisch haben könnte (bei 7 Schritten @1440 kein Umbruch beobachtet, `flex-wrap` griff auf keiner Stichprobe).

## Nicht geprüft

- @1024 und Dunkelmodus **nicht** für alle 31 Routen einzeln vermessen — nur für die 6 Pflicht-Routen + Stichproben (V1 mit 6 Werten belegt, Rest der 30 Routen dürfte dieselbe Ursache tragen, aber nicht einzeln gemessen).
- axe nur auf 3 von 31 Routen gefahren (Arbeitsvertrag, Eheschutzgesuch, Fristerstreckung) — nicht die volle Familie.
- Menü-Anatomie: nur EIN Popover-Typ in der Familie identifiziert (NormPopover) und geprüft; kein Filter-/Sortier-Menü in `VorlagenUebersicht.tsx` vorhanden (Katalog ist eine reine Liste ohne Menü) — Kategorie 8 damit für Familie C bereits vollständig, aber nicht am Ansicht-/Verlauf-/Sprache-/Thema-Menü der globalen Kopfzeile (das ist App-weit, nicht Familie-C-spezifisch, vermutlich von anderem Prüfer abgedeckt).
- Download-Knöpfe nur auf Zustand (vorhanden/aktiv) geprüft, nie geklickt (Auftrag).
- Variantenauswahl-Kacheln „Vertragstyp"/„Detailgrad" (sichtbar auf Arbeitsvertrag) nicht einzeln auf Radius/Rahmen vermessen (visuell im Screenshot: `border`, kein Radius sichtbar, aber nicht per Skript verifiziert).
- Kein Vergleich mit dem parallel laufenden David-Preview auf Port 5181 (nicht angetastet wie verlangt).
