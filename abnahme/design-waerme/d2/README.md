# Abnahme-Mappe D-2 — Rollen-Alias-Schicht (FAHRPLAN-DESIGN-WAERME, W2·11-DESIGN)

Stand: 12.7.2026 · Bau: Opus (autonom) · Vorbedingung D-1 (PR #215) gemergt.

D-2 ist eine **reine Token-/Rollen-Schicht** — wertidentische Aliase über den
Basis-Skalen (Radix-Muster). Es ändert sich **kein gerenderter Farbwert**; die
Screens dienen dem Nachweis, dass die Migration visuell neutral ist (Davids
Gesamtbild-Touchpoint, Squint-Test-Notiz siehe DESIGN-REGLEMENT §G-a).

## Was D-2 gebaut hat

- **Rollen-Aliase** (additiv, in `src/index.css` + `tailwind.config.js`):
  Akzent `--accent-bg/-bg-hover/-line-decor/-line/-solid/-text/-text-strong/-hover`;
  Status `--{sage,slate,warn,danger}-solid/-text`; Zustand `--ok-solid/-text/-bg/-line`.
- **F1 aufgelöst:** die drei Zustands-Sites `lc-badge-ok`/`lc-live`/`lc-termin-ring`
  greifen jetzt die `--ok-*`-Rolle (wertidentisch zu sage), sind aber semantisch
  von der Materialien-Kennfarbe sage getrennt.
- **Reinweiss-Invariante** ins Gate `check:design-tokens` (§13-Nachtrag d).
- **§13-Nachträge a–j** in `DESIGN-REGLEMENT.md` (neuer Block G).

## Beweise (keine Referenzwert-Drift — «Aliase sind wertidentisch»)

- `check:farbwelt`: **vorher == nachher BYTE-IDENTISCH** (46 Pflichtpaare, 6
  Referenzwerte, 2 Fixpunkte, 9 Warnungen — unverändert). Die Assertion-Tabellen
  sind name-basiert; additive Aliase sind für das Tor inert.
- `golden:vergleich`: 209 Fälle byte-gleich.
- dist-CSS-Kette: `--ok-bg → var(--sage-bg)`, `--accent-hover → var(--brass-800)` —
  gerenderte Werte identisch.
- `npm run gate` GRÜN · `build` 63 Routen · axe-e2e **26/26** hell+dunkel.

## Screens (4 Kernseiten × hell/dunkel, Desktop 1280×900)

| Seite | hell | dunkel |
|---|---|---|
| Startseite (`/`) | `startseite-hell.png` | `startseite-dunkel.png` |
| Gesetz-Reader (`/gesetze/bund/OR`) | `gesetz-reader-OR-hell.png` | `gesetz-reader-OR-dunkel.png` |
| Entscheid (`/rechtsprechung/bger_1B_278_2022`) | `entscheid-reader-hell.png` | `entscheid-reader-dunkel.png` |
| Rechner (`/rechner/verjaehrung`) | `rechner-verjaehrung-hell.png` | `rechner-verjaehrung-dunkel.png` |

**Squint-Test (§G-a):** Brass leuchtet nur an bedeutungstragenden Stellen (Marke,
«massgebliche Fassung», Norm-Ticks) — keine flächige Einfärbung. Bestätigt an
allen vier hellen Screens.
