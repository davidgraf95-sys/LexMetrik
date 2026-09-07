# KF — Kleinfunde Funktions-Inventar (D1/D2/D3)

**Runde** W2·24-DESIGN-IDENTITAET/KF · **Datum** 7.9.2026 · **Branch**
`feat/w2-24-kleinfunde` (ab `018b41a37`) · **Spec** drei Defekte aus der
Gesamtprüfung «Funktions-Inventar» (`w224-gesamt-funktion.md`, Abschnitt
«Defekte», D1/D2/D3).

Alles Gemessene stammt aus `npx playwright test` gegen den gebauten `dist/`
(`vite preview`, Chromium, headless), je Fall zuerst am unveränderten Stand
`018b41a37` (Rot-Probe) und danach am gefixten Stand (Grün-Probe).

---

## 1 · Was gebaut ist

| Fund | Fundstelle | Fix | Wächter |
|---|---|---|---|
| **D1** — unmögliches Datum (`31.02.2026`) im Tagerechner: altes Fristende blieb stehen, 0× `aria-invalid`, 0× Meldung | `src/components/DatumsFeld.tsx` | Vollständig eingegebenes, kalendarisch unmögliches Datum ⇒ Feld `aria-invalid` + Feld-Fehlerzeile (`.lc-notice-danger`, «Dieses Datum gibt es nicht – bitte prüfen.») + Wert wird geleert (`onChange('')`) — der Aufrufer fällt von selbst auf seinen bestehenden Leerzustand zurück. Rechenlogik unberührt (§3). | `e2e/tagerechner-datum-ungueltig.e2e.ts` |
| **D2** — Kopf-Suche: Esc nahm den Fokus (`blur()`), Weitertippen ging ins Leere | `src/components/layout/HeaderSuche.tsx` | `feld.current?.blur()` entfernt — Vorbild die Erlass-Suche im Leser (`SuchSprungFeld.tsx`, L5), die auf Esc ebenfalls nie defokussiert. | `e2e/kopfsuche-esc.e2e.ts` |
| **D3** — Kopf-Suche: `aria-expanded="true"` blieb nach dem ersten Esc bei 0 Optionen stehen | `src/components/layout/HeaderSuche.tsx` | Wurzel: `<input type="search">` löscht seinen Wert bei Escape NATIV (Chromium) und feuert dabei ein eigenes `input`-Event, dessen `onChange` im selben Tastendruck erneut `setOffen(true)` setzte und den gerade gesetzten Schliess-Zustand überschrieb. `e.preventDefault()` unterdrückt die native Löschung; dieselben State-Setzer wie `auswahl()` leeren Feld/Query/Panel deterministisch. | `e2e/kopfsuche-esc.e2e.ts` |

`src/components/forms/EinfacheFristForm.tsx` (Whitelist-Datei) blieb
**unverändert**: ihr `gueltig = istISOTag(start) && …` fällt bei geleertem
`start` bereits auf den bestehenden Leerzustand (`ErgebnisPlatzhalter`,
`data-platzhalter`) zurück — der D1-Fix in `DatumsFeld.tsx` genügt.

---

## 2 · Rot/Grün-Beweis (§6.7)

Je Fund am Stand `018b41a37` (vor dem Fix) UND am gefixten Stand ausgeführt.

| Test | Vorher (`018b41a37`) | Nachher |
|---|---|---|
| `D1 · 31.02.2026 markiert das Feld und leert das alte Fristende` | ROT — `aria-invalid` fehlte (`""` statt `"true"`) | GRÜN |
| `D1 · 99.99.9999 verhält sich gleich` | ROT — dieselbe Ursache | GRÜN |
| `D2/D3 · Esc leert das Feld, hält den Fokus und schliesst das Panel` | ROT — `aria-expanded` blieb `"true"` (Assertion auf `"false"` schlug fehl) | GRÜN |

Zusätzlich ohne Regression grün: `e2e/w224-kopfsuche-d23.e2e.ts` (13 Fälle),
`e2e/tagerechner-rechenweg-sync.e2e.ts` (6 Fälle).

---

## 3 · Tore

| Tor | Ergebnis |
|---|---|
| `npx tsc -b` | grün, keine Ausgabe |
| `npm run lint` | 0 Fehler (1 vorbestehende, unveränderte Warnung in `useUniversalSuche.ts`, nicht Teil dieser Whitelist) |
| `npm run test` (vitest) | 459 Dateien / 7443 Tests grün, 2 skipped |
| `npm run golden:vergleich` | IDENTISCH — 256 Fälle byte-gleich |
| `npx playwright test e2e/tagerechner-datum-ungueltig.e2e.ts e2e/kopfsuche-esc.e2e.ts e2e/w224-kopfsuche-d23.e2e.ts e2e/tagerechner-rechenweg-sync.e2e.ts --project=chromium` | 22/22 grün |
| `npm run check:e2e-shards` | grün — 131 Specs, Union deckungsgleich, `shard-gruppen.json` aktuell |

---

## 4 · Offene Punkte

Keine. D1/D2/D3 aus dem Inventar sind geschlossen; D4–D7 (a11y-Menürolle,
Vorlagen-Fehlerbox, Schnellzugriff-Reihenfolge, Sprachwahl-Wortlaut) sind
**nicht** Teil dieses Auftrags und bleiben offen im Gesamtprüfungs-Bericht.
