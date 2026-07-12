# D-1 Sofort-Fixes — Visual-Belege (12.7.2026)

Nachher-Screens der betroffenen Flächen, Desktop 1280 + Mobil 390, hell + dunkel
(FAHRPLAN-DESIGN-WAERME D-1; vite preview auf dist, Playwright).

| Fläche | Fix | Dateien |
|---|---|---|
| Entscheid-Leser BGE 151 III 239 (Regeste in Lesespalte, FS-Default) | D-1.1 + D-1.4 | `entscheid-regeste-{desktop,mobil390}-{hell,dunkel}.png` |
| Verjährungs-Rechner (Verdikt-Prosa in Lesespalte) | D-1.5 | `rechner-verjaehrung-{desktop,mobil390}-{hell,dunkel}.png` |
| Streitwert-Rechner (Select-Chevron brass-700) | D-1.6 | `rechner-streitwert-chevron-{hell,dunkel}.png` |
| Einstellungen (danger-line-Border, Selects dunkel) | D-1.3 | `einstellungen-danger-{hell,dunkel}.png` |
| Startseite (Overline-Basis ink-600) | D-1.2 | `startseite-overlines-{hell,dunkel}.png` |

Live-Messungen (frischer Storage, Desktop):
- `--rsp-fs` Erstbesucher: **1.08rem** (vorher 1.0rem — D-1.1).
- Regeste-Absatz: **596 px Spaltenbreite, ~66 CPL** (vorher volle Breite ~115–120 CPL — D-1.4).
- Verdikt-/Disclaimer-`<p>`: **640 px** (max-w-reading; Disclaimer 14 px ≈ 91 CPL,
  vorher ~135 — D-1.5).
