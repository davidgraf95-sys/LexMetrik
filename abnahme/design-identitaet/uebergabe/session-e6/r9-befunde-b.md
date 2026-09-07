# R9 Finder-Welle B — Interaktions-Klassen (Link, Knopf, Feld, Reiter, Menü)

Ort: `.claude/worktrees/w2-24`, HEAD 89596edf (nur `e2e/shard-gruppen.json` nach
dem letzten dist-Build geändert — dist gültig, nicht neu gebaut). Preview
`npx vite preview --port 4342`. Methode: Playwright-Skript (headless Chromium)
+ grep im Quellcode; Screens in `abnahme/design-identitaet/finder-r9-b-*.jpg`.

## 1. Link

| ID | Route/Modus | Rezept-Streuung | Datei:Zeile | Schwere | Soll | Fix |
|---|---|---|---|---|---|---|
| B-L1 | app-weit, hell (Grep-Beleg) | **≥4 Rezepte** für Inline-Textlinks: (a) `underline` pur — 106 Fundstellen; (b) `underline decoration-dotted underline-offset-2` (`NormText.tsx:88` `VERWEIS_RUHE`, `KantonQuelleLink.tsx:83`, `RechtsprechungLink.tsx:19`) — 6 Fundstellen; (c) `no-underline hover:underline` (Hover-only-Unterstrich) — 2 Fundstellen (`ZweiachsigerEinstieg.tsx:49`, `KatalogHinweis.tsx`-Nachbarn); (d) `.rsp-prose a` — `border-bottom` statt `text-decoration` (`src/index.css:2744`, deklarierte Ausnahme R11, s. u.). Keine `.lc-link`-Klasse existiert (`grep '\.lc-link' src/index.css` → 0 Treffer). | `src/components/NormText.tsx:88`, `KantonQuelleLink.tsx:28,83`, `RechtsprechungLink.tsx:19`, 106× app-weit | mittel | neuer Baustein `.lc-link` (Basis `a{color:brass-700}` `src/index.css:662` fehlt Decoration-Deklaration) | Einen Text-Link-Baustein mit fester Unterstrich-Anatomie definieren, die 4 Ad-hoc-Varianten darauf ziehen (Ausnahme `.rsp-prose` bestehen lassen). |
| — | Nav-Links (Breadcrumb `/gesetze/bund/OR`) | einheitlich: `color rgb(37,35,31)` (ink-900), `text-decoration:none`, Archivo 12px/400 — bewusst ungestrichen (Navigation, nicht Fliesstext) | Playwright-Messung, hell/1440 | — | schon einheitlich | keins |
| — | Listen-Links (`/rechtsprechung`-Karten) | einheitlich: `ink-900`, `text-decoration:none`, Archivo 16px/400; Hover nur Farbwechsel `rgb(29,27,23)`, kein Unterstrich-Wechsel | Playwright-Messung, hell/1440, Screen `finder-r9-b-link-liste.jpg` | kosmetisch | Karten-Titel dürfen ungestrichen bleiben (Konvention Listen-Link) | keins, F3-Fokus nicht separat geprüft |

## 2. Knopf

| ID | Route | Rezept-Streuung | Datei:Zeile | Schwere | Soll | Fix |
|---|---|---|---|---|---|---|
| B-K1 | `/rechner`, `/vorlagen`, `/rechtsprechung`, `EntscheidLeser.tsx` | Rohes `<button>` **ohne** `lc-btn*`-Klasse: gemessen h=18px, Padding 2px/2px, Archivo 16px/400 — vs. `.lc-btn*`-Familie h=36/44px, Padding 0/12/18px, 14–16px/**600**. ≥220 Grep-Treffer `<button` ohne `lc-btn\|lc-chip\|lc-tab`-Klasse (grobe Zählung, viele mit Fremd-Utilities). | `src/pages/RechnerTagerechner.tsx:247`, `src/pages/Rechtsprechung.tsx:153,161`, `src/pages/EntscheidLeser.tsx:694,827,831,837,842` | hoch | `.lc-btn-ghost`/`.lc-btn-mini` (`src/index.css:1700,1755`) | Ikon-/Inline-Knöpfe auf `.lc-btn-mini`/`-ghost` ziehen statt bare `<button>`. |
| — | `.lc-btn-primary/-ghost/-sm`, hell | einheitlich bei sichtbaren (h=44) Exemplaren: radius 0, Fokus-Ring `outline 2px rgb(37,35,31)` (=ink-900), kein `box-shadow`-Ring | Playwright-Messung `/rechner`,`/vorlagen` | — | schon einheitlich | keins |

## 3. Feld

| ID | Route | Rezept-Streuung | Datei:Zeile | Schwere | Soll | Fix |
|---|---|---|---|---|---|---|
| — | `.lc-input`-Familie (Text/Number/Select/Search), hell | einheitliche Unterstrich-Anatomie: `border-bottom:1px solid rgb(37,35,31)` (ink-900), `border-radius:0`, transparenter Hintergrund — app-weit (Tagerechner, Rechtsprechung-Filter, Kopf-Suche) | `src/index.css:1511` `.lc-input` | — | schon einheitlich | keins |
| B-F1 | `/rechner/tagerechner` vs `/rechtsprechung` vs Kopf-Suche | Höhen-Streuung 36/44/50px zwischen den drei Feld-Kontexten (Formularfeld 50px, Filter/Kopf-Suche 44/36px) — passt zu deklarierten Varianten `lc-input`/`lc-input-sm` (`index.css:1638`), aber die 50px-Formularhöhe ist in keiner Variante benannt (dritte De-facto-Höhe) | `src/index.css:1511` vs `1638` vs Konsumenten in `RechnerTagerechner.tsx` | kosmetisch | dritte Höhe explizit benennen oder auf bestehende Variante ziehen | Prüfen ob 50px beabsichtigt (Label+Feld-Stack) oder Drift. |
| — | Radio (Tagerechner) | nativ, `border-bottom-width:0` (kein Unterstrich-Bezug, erwartungsgemäss andere Anatomie) | — | — | Ausnahme (native Control) | keins |

## 4. Reiter/Tab

| ID | Route | Rezept-Streuung | Datei:Zeile | Schwere | Soll | Fix |
|---|---|---|---|---|---|---|
| B-R1 | Arbeitsleiste (`/gesetze/bund/OR`) vs `ui/Tabs.tsx` (`/rechner/tagerechner`) | **Zwei verschiedene Aktivmarken-Sprachen**: Arbeitsleiste markiert aktiv über `font-medium text-ink-900` (kein Rahmen/Box, Zeile 677) bei h=33–34px, Archivo 16px/400; `ui/Tabs.tsx` markiert aktiv über **Box-Chip** `bg-surface-raised text-brass-700 shadow-sm border border-line` bei h=30px (`h-11 sm:h-9`), 14px/**500**. Eine Klasse (Reiter), zwei optische Systeme (Unterstrich/Fett vs. Box-Chip). | `src/components/layout/Reiterleiste.tsx:677`, `src/components/ui/Tabs.tsx` (`AKTIV`/`INAKTIV`-Konstanten, `KNOPF`/`HOEHE`-Tabellen) | hoch | `ui/Tabs.tsx` als der geteilte Baustein (bereits mehrfach entdoppelt, s. Kommentar im File) | Arbeitsleiste auf dieselbe Aktivmarken-Logik ziehen ODER bewusste Ausnahme (Arbeitsleiste = Browser-Tab-Metapher) im Reglement verankern. |
| — | Vorlagen-Wizard-Schritte | nicht erreicht — `/vorlagen` verlinkte in der Messung keine Wizard-Route direkt (`a[href^="/vorlagen/"]` traf keinen Schritt-Container mit `[class*=schritt]`) | — | — | nicht geprüft | Welle A/Nachprüfung: Wizard-Schritt-Leiste separat messen. |

## 5. Menü/Popover

| ID | Route/Modus | Rezept-Streuung | Datei:Zeile | Schwere | Soll | Fix |
|---|---|---|---|---|---|---|
| — | Verlauf, Sprache, Ansicht (Gesetze-Reader, hell/1440) | **Hülle einheitlich**: `background rgb(255,255,255)` (= `--paper-raised` hell), `border-top 1px`, `border-radius 0`, identischer `box-shadow` (`0 8px 24px rgba(0,0,0,.12)`), `padding-top 4px` — dieselbe `.lc-schwebeflaeche`-Anatomie (`src/index.css:2454`) über alle drei Menüs | Screens `finder-r9-b-menu-1..3.jpg` | — | schon einheitlich (Hülle) | keins |
| B-M1 | Sprache- vs Ansicht-Menü, Zeileninhalt | Item-Anatomie weicht: Sprache-Items `font-size 14px/500`, `padding 8px/12px`; Ansicht-Items `14px/400`, `padding 8px/12px` (Gewicht 500 vs 400 bei sonst gleicher Box) — beide führen Zustandswort per `✓`-Präfix (`"DEDeutsch\n✓"`, `"✓\nFussnoten"`), konsistent mit Muster D5, aber Schriftschnitt uneinheitlich | Playwright-Messung, `finder-r9-b-menu-2.jpg`/`-3.jpg` | mittel | ein Item-Rezept (Gewicht 400, aktive Zeile fett statt 500 durchgehend) | Sprache-Menü-Items auf dasselbe Gewicht wie Ansicht-Menü ziehen. |
| — | Mobile-Schublade @390 (`/gesetze/bund/OR`) | Hülle gemessen: `background rgb(255,255,255)`, `border-top 0px`, gleicher Schatten — kein Vergleichsobjekt zweiter mobiler Schublade gefunden, daher kein Streuungsbefund möglich | Screen `finder-r9-b-menu-mobile-drawer.jpg` | — | nicht abschliessend geprüft | zweite mobile Schublade (z. B. Startseite „Startseite anpassen“) nachmessen. |
| — | Filter/Sortierung `/rechtsprechung` | **nicht erreicht** — Playwright-Selektor (`button:has-text("Filter"), button:has-text("Sortier")`) fand kein Element, kein Screen erzeugt | — | — | nicht geprüft | Welle A/Nachprüfung mit spezifischerem Selektor. |
| — | Kontextmenü der Reiter, Startseite „Startseite anpassen“-Blatt | **nicht erreicht** in dieser Welle (Zeit-/Selektor-Budget) | — | — | nicht geprüft | Nachprüfung nötig. |
| — | Reiter-Überlauf-Blatt («N offen») | **nicht erreicht** — kein Overflow-Zustand im Testfall provoziert (zu wenige offene Reiter) | — | — | nicht geprüft | Nachprüfung mit ≥6 offenen Reitern. |

## Nicht geprüft / nicht erreichbar (Zusammenfassung)
`/materialien` + Materialie, `/einstellungen`, `/suche?q=…`, Split-View
(Artikel+Entscheid via `?p=`), `/rechner/verjaehrung`, Filter/Sortierung
`/rechtsprechung`, Kontextmenü Reiter, Startseite-Anpassen-Blatt,
Reiter-Überlauf-Blatt, Wizard-Schritt-Leiste, Dunkelmodus für alle Klassen,
@390 für Link/Knopf/Feld/Reiter — Zeitbudget dieser Welle ging in Tiefe statt
Breite (Playwright-Skript deckte 1 Theme × primär 1440px).
