# CWV-Baseline (W1.11) — Indexierungs-Hebel

> Mess-Infrastruktur (Strang B, kein harter Gate). Lokal mit `vite preview`
> gegen `dist/` gemessen — absolute ms sind umgebungsabhängig, aussagekräftig
> ist der **relative** Vergleich (schwere vs. leichte Seite) und der Trend nach
> W2.8 (Payload-Splitting). Erneut messen: `npm run build && npm run messung:cwv`.

- **Stand (Commit):** `ca2e46e3`
- **Methode:** Chromium headless, viewport 1280×900, `waitUntil:'load'` + 600 ms
  Ruhe; LCP = letzter `largest-contentful-paint`-Eintrag; Transfer = Summe der
  Resource-/Navigation-`transferSize`.

| Seite | Pfad | LCP (ms) | DOMContentLoaded (ms) | Transfer (KB) | Requests |
|---|---|--:|--:|--:|--:|
| Startseite | `/` | 572 | 41 | 532 | 55 |
| Rechner (verzugszins) | `/rechner/verzugszins` | 64 | 41 | 270 | 30 |
| Erlass OR (~1.7 MB, schwerster) | `/gesetze/bund/OR` | 616 | 113 | 1015 | 23 |
| Erlass ZGB (~1.1 MB) | `/gesetze/bund/ZGB` | 572 | 25 | 791 | 23 |
| Erlass GebV-HReg (klein) | `/gesetze/bund/GEBV_HREG` | 380 | 19 | 416 | 23 |
| Entscheid (BGer) | `/rechtsprechung/bger_1B_278_2022` | 396 | 28 | 375 | 22 |

## Lesehilfe

- **render-then-replace:** Die Detailseiten liefern den Artikel-Volltext bereits
  im statischen `#root` (Prerender) → LCP sollte auch bei OR/ZGB durch den
  sofort gemalten Text getragen sein, **unabhängig** vom grossen JSON-Nachladen.
- **Transfer** der schweren Erlasse zeigt das W2.8-Splitting-Potenzial (das JSON
  wird für die Client-Hydration nachgeladen, nicht für den ersten Paint).
- Auffällige LCP-Regression an OR/ZGB → W2.8 vorziehen.
