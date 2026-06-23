# Design-Abnahmegrundlage (FAHRPLAN-DESIGN 3.7 / 4.6 / 5.8)

Erstellt 10.6.2026 abends. Schliesst die offenen Prüf-Punkte des
Design-Audits ab; die Etappen 1–5 selbst sind seit 7.6.2026 gebaut
(f96b28c · ed1f7c5 · 542a909 · 3ee2c32 · a441444, Bug-Check 9c3b3c1).

**Dieses Dokument ist die Entscheidungsgrundlage für Davids Abnahme** —
es protokolliert KEINE Katalog-Einträge (dafür gilt `abnahme/SCHEMA.md`).

## Methode

- **axe-core-Stichprobe** (`e2e/a11y.e2e.ts`, läuft seither in jeder CI):
  WCAG 2.1 A/AA über 6 Prüfpunkte — Startseite (zu + Register offen),
  Tagerechner (zu + Kalender-Popover offen), Vorlage Arbeitsvertrag,
  Zuständigkeit mit PLZ-Auswahl. Impact critical/serious bricht den Test;
  moderate/minor wird als Test-Anhang dokumentiert. reducedMotion wird
  emuliert (die lc-reveal-Einblendung verfälschte sonst die Kontrastmessung).
- **Tastatur-Protokoll** (`e2e/tastatur.e2e.ts`): automatisierte Prüfung des
  DatumsFeld-Popovers (Dialog-/Grid-Rollen, roving tabindex, Pfeile, Enter,
  Escape-Fokus-Rückkehr, Monatsblättern) — zugleich Regressionsschutz für
  Befund 1 des Bug-Checks vom 7.6.2026.
- **Screenshot-Serien** (`scripts/screenshots.ts`): 6 Motive × 360/768/1280 px,
  fullPage, drei Stände am SELBEN Tag (10.6.2026):

| Stand | Commit | Bedeutung |
|---|---|---|
| `vorher-5778ebd` | Parent von Etappe 1 | vor dem Design-Audit |
| `nachher-9c3b3c1` | Design-Bug-Check | nach Etappen 1–5 (isoliert die Design-Arbeit) |
| `ist-6512be0` | HEAD bei Erstellung | heutige App |

**Ehrlichkeits-Hinweis (§8):** vorher↔nachher isoliert exakt die
Design-Etappen (beide Stände 7.6., gleiche Routen). Die Differenz
nachher↔ist ist dagegen der **Struktur-Umbau S-1–S-6 + Fristen-Einheit
(10.6.)**, nicht das Design-Audit. Timeline-/Mappen-Motive zeigen den
Default-Zustand (ohne Eingaben); die Responsive-Brüche unter Last (4.2)
sind dort nur teilweise sichtbar.

**Ablage:** Die 54 PNGs (19 MB) liegen UNVERSIONIERT in
`abnahme/design-2026-06/screenshots/` (gitignored — Repo-Gewicht und
Deploy-Upload-Risiko). Exakt regenerierbar:

```
git worktree add /tmp/lexmetrik-<stand> <sha>
(cd /tmp/lexmetrik-<stand> && npm ci && npm run build && npm run preview -- --port 4321 --strictPort)
npx vite-node scripts/screenshots.ts -- --base-url http://localhost:4321 \
  --out abnahme/design-2026-06/screenshots/<stand>-<sha7>
```

## A · axe-Erstlauf: behobene Befunde (Commit e17b936, deklarierte E3-Nacharbeit)

| # | Impact | Befund | Fix |
|---|---|---|---|
| A-1 | **critical** | `label`: Forderungs-Feld (SchKG 3b) ohne programmatische Beschriftung — `Field` kann zusammengesetzten Controls kein `htmlFor` geben | `Field` reicht das Label per `aria-labelledby` an BetragsFeld/DatumsFeld weiter (Rahmen-Fix: wirkt auf ALLE Field-umhüllten Betrags-/Datumsfelder, ~14 Stellen) |
| A-2 | serious | `aria-prohibited-attr`: Unterschriftslinien-`<span aria-label>` in der Vorlagen-Vorschau (4 Knoten) — aria-label auf rollenlosem span unzulässig | `role="img"` — bleibt für Screenreader «Unterschriftslinie» |
| A-3 | serious | `color-contrast`: Header-Pflichthinweis «Orientierung – keine Rechtsberatung» mass 4.44:1 (ink-500, 11 px, auf dem paper-sunken-Streifen) | ink-600 (≈ 6.7:1) |

## B · Offene Befunde — ENTSCHEID DAVID (als BEKANNTE_BEFUNDE im Test dokumentiert)

| # | Impact | Befund | Optionen |
|---|---|---|---|
| B-1 | serious | `color-contrast` FristenKalender: Sa/So-Spaltenköpfe, arbeitsfreie Tage, Legende in **ink-400** (3.26:1, < 4.5) — 12 Knoten im Tagerechner | Das ist der dokumentierte E3-Kompromiss (3.5: «Abschwächung ist Gestaltungsabsicht; Info zusätzlich in title+Legende»). (a) belassen + dokumentiert, (b) auf ink-500/600 heben (verliert die gestalterische Zurücknahme) |
| B-2 | serious | `link-in-text-block`: Inline-Links (brass-700) sind im Fliesstext NUR farblich unterschieden (1.02:1 zum umgebenden ink-Text); `no-underline` ist Markenentscheid — betrifft Fedlex-/Rechner-Links auf praktisch jeder Seite | (a) belassen + dokumentiert, (b) Unterstreichung (dezent, z. B. `text-decoration-color` brass-400) für Links IM Fliesstext — Marken-Eingriff, daher dein Entscheid |
| B-3 | serious | `color-contrast` Gesetze-Seite (S11-Tor, BS-Audit 23.6.2026), zwei vorbestehende Klassen: (a) **brass-Aktionstext** «Alle auf-/einklappen» (brass-700/600, ≈3.8:1) — dieselbe Marken-Token-Spannung wie B-2; (b) **gedämpftes «aufgehoben»** und die Absatz-Zitiermarke (`!text-ink-400`, ≈3.3:1) im Reader — dieselbe Gestaltungs-Zurücknahme wie B-1 (aufgehobene/sekundäre Stellen bewusst leiser). Die echten S10-Ordnungsmerkmale (SR-Nr, Kanton-Meta, Sektions-/Untergruppen-Zähler, Pills) wurden auf ink-500 gehoben (≥4.5:1). | (a) belassen + dokumentiert (brass-Token + gedämpft = Markenentscheid, B-1/B-2-Familie), (b) brass-Aktionstext auf brass-800 heben und «aufgehoben» auf ink-500 — beides Marken-/Gestaltungseingriff, daher dein Entscheid |

moderate/minor-Befunde: als JSON-Anhang an den jeweiligen Testläufen
(`npx playwright test e2e/a11y.e2e.ts`, Anhänge `*-befunde-dokumentiert.json`).

## C · Tastatur-Protokoll

**Automatisiert grün** (e2e/tastatur.e2e.ts): Trigger öffnet `role="dialog"` ·
Fokus landet im `role="grid"` auf genau EINER tabbaren Zelle (roving
tabindex) · Pfeiltasten bewegen tagweise (← → ↑ ↓) · Enter wählt + schliesst +
Wert steht im Feld · Escape schliesst + Fokus zurück auf den Auslöser ·
nach ‹/›-Monatsblättern bleibt das Raster tabbar (Monatserster), kein
Fokus-Klau, Pfeil-Start beim Monatsersten.

**OFFEN — manuell (nicht automatisierbar, nicht als geprüft behauptet):**
1. Screenreader-Ansagen (VoiceOver): aria-live-Verhalten der Ergebnisblöcke,
   Ansage-Qualität der Kalender-Zellen.
2. Visuelle Wahrnehmbarkeit der focus-visible-Stile auf allen Hintergründen.
3. Fachliches Urteil: ist die Tab-REIHENFOLGE der Formulare sinnvoll?

## D · Screenshot-Index

6 Motive × 3 Breiten × 3 Stände = 54 Dateien,
`<motiv>--<breite>.png` unter `screenshots/{vorher-5778ebd, nachher-9c3b3c1, ist-6512be0}/`:

| Motiv | zeigt (Fahrplan-Punkt) |
|---|---|
| `startseite` | Header mobil (4.3), Gesamtbild |
| `startseite-register-offen` | Katalog-/Register-Panel-Grid (4.4) |
| `tagerechner-fristenkalender` | FristenKalender-Mehrmonats-Layout (4.1) |
| `verzugszins-timeline` | VerzugszinsTimeline-Marker (4.2) — Default-Zustand |
| `kuendigung-timeline` | KuendigungTimeline (4.2) — Default-Zustand |
| `ag-gruendung-dokumentmappe` | Dokumentmappen-Tablisten (4.5) |

## E · Entscheid-Block (David)

- [ ] B-1 FristenKalender-Kontrast: belassen (dokumentiert) / heben
- [ ] B-2 Inline-Link-Unterstreichung: belassen (dokumentiert) / einführen
- [ ] Manuelle Posten C.1–C.3: erledigt am ____ / delegiert
- [ ] Screenshot-Serien gesichtet; Abnahme FAHRPLAN-DESIGN: erteilt / mit Auflagen
