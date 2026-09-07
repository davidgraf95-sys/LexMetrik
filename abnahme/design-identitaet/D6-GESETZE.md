# D6 · /gesetze: Schnellzugriff blendet beim Filtern aus

**Auftrag** Fixer D6 der W2·24-Gesamtprüfung «Funktions-Inventar».
**Befund** (gemessen, scratchpad `w224-gesamt-funktion.md` D6): auf `/gesetze`
blieben die zehn Schnellzugriff-Kürzel (`Kernerlasse`, R12A) beim Filtern
(z. B. «miet») stehen und standen ÜBER den 8 echten Treffern — kein
Rechtsschluss (§1), reine Bedienreihenfolge.
**Entscheid** (Auftrag): ausblenden, sobald ein Filterbegriff greift — Treffer
zuerst — ohne Layout-Sprung der Trefferliste (D9).

**Branch** `feat/w2-24-d6`, Basis `32ac046e5`. Kein PR, kein Merge (Bau-Auftrag).

---

## 1 · Fix

`Kernerlasse` (`src/pages/Gesetze.tsx:105–128`) bekommt eine `aktiv`-Prop
(`aktiv={!suche.trim()}`, Aufruf `Gesetze.tsx:412`). Bei `aktiv=false` steht
`visibility: hidden` + `aria-hidden` + `tabIndex={-1}` je Link statt eines
bedingten Renderns.

**Warum nicht bedingtes Rendern (`{!suche.trim() && <Kernerlasse />}`):** die
erste Fassung entfernte den Block aus dem Fluss und schob damit den
darunterliegenden `min-h-inhalt-region`-Block nach oben — einen ECHTEN
Layout-Shift (0.0198, Quelle `DIV.min-h-inhalt-region`, y 497→425), unter
CPU-Drossel 6× in `e2e/gesetze-footer-cls.e2e.ts` gemessen (bestehendes,
scharfes Tor). `visibility: hidden` reserviert die Zeilenhöhe unverändert
(kein Element darunter bewegt sich) und entfernt die Links zugleich aus
Fokus-Reihenfolge und Screenreader-Baum — dasselbe Muster wie
`html[data-lr6-anker-warten] footer` in `src/index.css:3145`.

---

## 2 · Rot-Probe (§6.7 — ein Tor, das nicht scheitern kann, ist gefährlicher als keines)

Neuer Wächter `e2e/gesetze-schnellzugriff-filter.e2e.ts`: Landeplatz zeigt die
`.ub-kern`-Zeile, Filter «miet» blendet sie aus (`toBeHidden`), die
Treffer-Zeile («… Treffer für «miet»») erscheint, Reset zeigt die Zeile wieder.

Vor dem Fix (Befund-Zustand nachgestellt: `<Kernerlasse />` unbedingt
gerendert) lief der Wächter ROT:

```
Error: expect(locator).toBeHidden() failed
Locator:  getByRole('main').locator('.ub-kern')
Expected: hidden
Received: visible
    at e2e/gesetze-schnellzugriff-filter.e2e.ts:31:29
```

Mit dem Fix: grün (siehe §3).

---

## 3 · Tor-Ergebnisse

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün, keine Ausgabe |
| `npm run lint` | 0 Fehler (1 Warnung, vorbestehend, `useUniversalSuche.ts`, ausserhalb Whitelist) |
| `npm run test` (vitest) | 459 Testdateien, 7445 grün / 2 skipped |
| `npm run check:e2e-shards` | grün — 132 Specs, Union deckungsgleich; `shard-gruppen.json` aktuell |
| e2e (`--project=chromium`): `gesetze-schnellzugriff-filter`, `gesetze-footer-cls`, `gesetze-ia4-scope`, `gesetze.e2e` | 13/13 grün — inkl. `gesetze-footer-cls` (CLS 0 unter CPU-Drossel 6×, D9 erfüllt) |

**Geänderte Dateien:** `src/pages/Gesetze.tsx` (Schnellzugriff-Stelle, D6),
`e2e/gesetze-schnellzugriff-filter.e2e.ts` (neuer Wächter),
`e2e/shard-gruppen.json` (Projektion, generiert aus den `@shard-gruppe`-
Annotationen — Diff enthält zusätzlich `w224-gb-register.e2e.ts` aus
paralleler Arbeit einer anderen W2·24-Fixer-Session, nicht Teil von D6),
diese Datei.
