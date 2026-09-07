# D36 · «Einstellungen» wieder unten in der Seitenleiste, abgesetzt

**Auftrag** Fixer D36 der W2·24-Nachzug-Reihe (David 7.9.2026).
**Wunsch (wörtlich):** «können diese felder wieder unten an die seitenleiste?
Einstellungen · Methodik · Über LexMetrik · Kontakt · Datenschutzerklärung» —
präzisiert: «also einstellungen separat» / «oder nur einstellungen».
**Entscheid (Auftrag):** NUR «Einstellungen» kehrt in die Seitenleiste
zurück. Methodik/Über/Kontakt/Datenschutz bleiben im Footer (D26,
6.9.2026, unverändert).

**Branch** `feat/w2-24-d36-seitenleiste-fuss`, Basis `cfa8a9f81`. Kein Merge,
kein Deploy (Bau-Auftrag).

---

## 1 · Fix

**`src/components/layout/Sidebar.tsx`** — Import `NAVIGATION_META` ergänzt;
Modul-Konstante `EINSTELLUNGEN = NAVIGATION_META.find((l) => l.ziel ===
'/einstellungen')!` (dieselbe SSoT wie zuvor, §5 — kein zweiter
hartcodierter Eintrag). Im Fuss-Block (`mt-auto pt-3 border-t
border-rule-soft …`, vorher nur `<KorpusStand>`) steht jetzt zuerst
`<Blatt k={EINSTELLUNGEN} loc={loc} onNavigate={onNavigate} />`, dann
`<KorpusStand>`. Der Block ist bereits `mt-auto` im `flex-col min-h-full`-
`<nav>` → am unteren Rand verankert, kein Sprung; die Haarlinie
(`border-t border-rule-soft`) sass schon dort und trägt jetzt zusätzlich den
Einstellungen-Eintrag. Dieselbe `Sidebar`-Komponente rendert Desktop-Aside
UND mobile Schublade (`Shell.tsx`) — keine zweite Stelle nötig.

**`src/components/layout/Footer.tsx`** — `NAVIGATION_META` wird beim Aufbau
der Footer-Navigation um `/einstellungen` gefiltert
(`.filter((l) => l.ziel !== '/einstellungen')`), damit die Angabe nicht
doppelt erscheint (D4: jede Angabe einmal — die Seitenleiste ist der
nähere Ort). Methodik/Über/Kontakt/Datenschutz unverändert.

**Aktiver Zustand:** `Blatt` setzt `aria-current="page"` wie jeder andere
Leisten-Eintrag (`istAktiv('/einstellungen', loc)`); Fokus/Tastatur laufen
über den normalen `<Link>` — keine Sonderbehandlung nötig.

### Deklarierte Abweichung vom Auftragstext (§7)

Der Auftrag beschreibt für den **eingeklappten** Zustand «Symbol/Kurzform mit
title». Diese Architektur existiert im Repo nicht: `Shell.tsx` rendert die
persistente `<aside data-app-seitenleiste>` (und damit `<Sidebar>`)
ÜBERHAUPT NICHT, solange `seitenleiste.eingeklappt === true`
(`{!seitenleiste.eingeklappt && (<aside>…<Sidebar/>…</aside>)}`, Zeile 428) —
es gibt keine Icon-Rail-Fassung der Leiste, nur einen Umschalt-Knopf im
Titelblatt (`aria-pressed`). «Eingeklappt» heisst binär «Leiste weg», nicht
«Leiste als Symbolspalte». Umgesetzt wurde darum die tatsächliche Anatomie:
«Einstellungen» erscheint, sobald die Leiste eingeblendet ist (Desktop wie
mobile Schublade) — Screenshot 3 belegt den unveränderten Vorgabe-Zustand
(eingeklappt = kein Leisten-Symbol sichtbar, nur der Schalter).

---

## 2 · Rot-Probe (§6.7 — ein Tor, das nicht scheitern kann, ist gefährlicher als keines)

Neuer Wächter `e2e/d36-einstellungen-fuss.e2e.ts` (3 Fälle: Desktop @1440,
mobile Schublade @390, Footer-Dopplung). Vor dem Fix (Sidebar.tsx/Footer.tsx
per `git stash` auf den Vorzustand zurückgesetzt, `dist` neu gebaut) liefen
alle drei ROT:

```
1) Desktop @1440 …
   Error: expect(locator).toBeVisible() failed
   Locator: locator('aside[data-app-seitenleiste] nav').getByRole('link', { name: 'Einstellungen', exact: true })
   Expected: visible
   Timeout: 20000ms
   Error: element(s) not found

2) Mobile Schublade @390 …
   Error: expect(locator).toBeVisible() failed
   Locator: getByRole('dialog', { name: 'Navigation' }).getByRole('link', { name: 'Einstellungen', exact: true })
   Expected: visible
   Error: element(s) not found

3) Footer führt «Einstellungen» NICHT mehr doppelt …
   Error: expect(locator).toHaveCount(expected) failed
   Locator: getByRole('navigation', { name: 'Footer-Navigation' }).getByRole('link', { name: 'Einstellungen', exact: true })
   Expected: 0
   Received: 1
```

Mit dem Fix (Stand wiederhergestellt, `dist` neu gebaut): 3/3 grün, auch mit
`--repeat-each=2` (s. §3).

---

## 3 · Tor-Ergebnisse

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün, keine Ausgabe |
| `npm run lint` | 0 Fehler (1 Warnung, vorbestehend, `useUniversalSuche.ts`, ausserhalb Whitelist) |
| `npm run test` (vitest) | 460 Testdateien, 7454 grün / 2 skipped |
| `npm run check:schlankheit` | GRÜN — 1486 Dateien, 15 Bestands-Einträge, keine Überschreitung |
| `npm run gen:e2e-shards` + `npm run check:e2e-shards` | GRÜN — 139 Specs, Union der 8 Gruppen deckungsgleich, `shard-gruppen.json` aktuell |
| `npm run build` (inkl. Prerender) | grün, 63 Routen prerendered |
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich (verhaltensneutral — reine UI-Ergänzung, keine Rechenlogik berührt) |
| `npx playwright test e2e/d36-einstellungen-fuss.e2e.ts e2e/w223b-kopf-seitenleiste.e2e.ts e2e/uinav-o2-sidebar.e2e.ts e2e/gesetze-footer-cls.e2e.ts e2e/d21-seitenleiste-kein-sprung.e2e.ts e2e/leser-v3-seitenleiste-ordnung.e2e.ts e2e/gesetze-ia7-sidebar-badges.e2e.ts --repeat-each=2 --workers=2` | 54/54 grün (27 Fälle × 2 Wiederholungen) |

Preview lief gegen den eigenen `dist`-Stand auf Port 4426
(`vite preview -- --port 4426 --strictPort`, `E2E_PORT=4426`).

---

## 4 · Screenshots (max. 4)

- `d36-1440-hell-ausgeklappt-fuss.jpg` — Desktop @1440, hell, Leiste
  ausgeklappt, Fuss gescrollt: «Einstellungen» als letzter Eintrag, Haarlinie
  oben, darunter `KorpusStand`.
- `d36-1440-dunkel-ausgeklappt-fuss.jpg` — dieselbe Stelle im Dunkelmodus.
- `d36-1440-hell-eingeklappt.jpg` — Desktop @1440, hell, Vorgabe-Zustand
  (eingeklappt): keine Leiste sichtbar, nur der Umschalt-Knopf im
  Titelblatt — belegt die Abweichung aus §1.
- `d36-390-hell-schublade-fuss.jpg` — mobile Schublade @390: «Einstellungen»
  steht auch dort am Fuss, mit Haarlinie.

---

**Geänderte Dateien:**
`src/components/layout/Sidebar.tsx` (Einstellungen-Eintrag im Fuss),
`src/components/layout/Footer.tsx` (Einstellungen aus der Footer-Liste
gefiltert), `e2e/d36-einstellungen-fuss.e2e.ts` (neuer Wächter),
`e2e/shard-gruppen.json` (Projektion, `gen:e2e-shards`), diese Datei, vier
Screenshots.
