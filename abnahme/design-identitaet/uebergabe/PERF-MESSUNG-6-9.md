# W2·24-DESIGN-IDENTITAET — Perf-Vergleich ALT vs NEU (Gesetzesleser)

Frage David 6.9.2026: «kann es sein, dass gesetze länger brauchen zum laden als früher?»
**Antwort: JA, auf /gesetze/bund/OR real und gravierend — auf ZGB/BS/Übersicht nicht.**

## Messaufbau (Mess-Hygiene, Skill `perf`)
- ALT = origin/main @ b7a174075 (Worktree `.claude/worktrees/w2-24-perf-alt`, Port 4360)
- NEU = feat/w2-24-design-identitaet @ 04815ac33 (Worktree `.claude/worktrees/w2-24-pruef`, Port 4361)
- Beide **Produktions-Build** (`npm run build` je Stand, frisch gebaut) + `vite preview`, nie Dev-Server.
- Playwright/Chromium, CDP `Emulation.setCPUThrottlingRate(4)` **immer aktiv** (alle Zeilen unten sind
  CPU-4×-gedrosselt), Netz ungedrosselt ausser explizit "fast3g" markiert.
- Median + Spannweite aus n Läufen (n in Klammer), jeder Lauf = frischer Browser-Context (kalt),
  ausser "warm" (zweite Navigation im selben Context).
- **Bekannte Lücke:** TBT/Longtask-Zähler im Haupt-Messskript lieferte durchgehend 0 — Bug (Long-Task-
  Entries werden ohne VORHER registrierten `PerformanceObserver({buffered:true})` nicht rückwirkend
  geliefert). Reale Longtask-Werte wurden separat per Zielmessung nachgezogen (siehe Abschnitt Ursache).

## Kern-Tabelle (Median, ms; CPU×4, ungedrosseltes Netz, kalt)

| Route/Szenario | Kennzahl | ALT | NEU | Δ |
|---|---|---:|---:|---:|
| `/gesetze/bund/OR` (kalt) | **LCP** | 432 (n=5, 404–532) | **14808** (n=5, 8384–15340) | **+14376 ms / +3328 %** |
| `/gesetze/bund/OR` (warm) | LCP | 596 (n=5, 144–1324) | 10260 (n=5, 7820–15528) | +9664 ms |
| `/gesetze/bund/OR` fast3g | LCP | 1316 (n=3) | 11172 (n=3, 10456–20232) | +9856 ms |
| `/gesetze/bund/OR#art-336_c` | LCP | 384 (n=5, 156–900) | 5472 (n=5, 168–6168) | +5088 ms |
| `/gesetze/bund/OR#art-336_c` | Zeit bis Anker sichtbar | 6331 (n=5, 3837–11950) | 5012 (n=5, 4902–5441) | **−1319 ms (besser)** |
| `/gesetze/bund/ZGB#art-457` | LCP | 168 (n=5, 152–256) | 244 (n=5, 152–5180) | +76 ms Median, aber 1/5 Ausreisser auf 5180 |
| `/gesetze` (Übersicht) | LCP | 748 (n=5, 700–784) | 856 (n=5, 596–1300) | +108 ms |
| `/gesetze/kanton/BS-152.110` | LCP | 1000 (n=5, 152–2588) | 2140 (n=5, 204–3500) | +1140 ms (hohe Streuung beidseits) |

CLS: **0 in allen 7×2 Szenarien, beide Stände, exakte Range [0,0]** — die neue L1-Sperre
(`html[data-lr6-anker-warten]`, `src/index.css:2911-2912`) verhindert Sprünge zuverlässig; die im
Code-Kommentar dokumentierten historischen CLS-Werte (1.1664 etc., `inhalt-hooks.tsx:317-367`) treten
in dieser Messung nicht mehr auf — Fix wirkt wie beabsichtigt.

Bytes gesamt/Fonts/JS/JSON: kaum Unterschied bandbreitenseitig (`OR kalt`: ALT 1'289'612 B gesamt /
104'312 Fonts / 317'459 JS / 626'580 JSON vs NEU 1'376'300 / 185'126 / 321'399 / 626'580 — Fonts +81 KB
wegen Archivo/Literata Variable statt Geist/Source-Serif, aber das erklärt die 14-Sekunden-LCP-Lücke
bei weitem nicht). `useBezuege`-Shard (`verzahnung/artikel-revisionen/OR.json`) ist mit 25.6 KB winzig
und wird bei jedem Lauf sofort geholt — **das ist NICHT der im Auftrag vermutete 419-KB-Shard**; der
schwere Bezugs-Shard (`bezuege.ts`) wird laut Code-Kommentar (`bezuegeLaden.ts:9-15`) nur bei aktiver
Instanz-Facette und im Leerlauf geladen — in keinem meiner Läufe aktiv, also nicht Ursache.

## Verdikt je Route
- **`/gesetze/bund/OR` (mit UND ohne Hash, kalt/warm/fast3g): LANGSAMER — massiv** (LCP +9 bis +14 s
  unter CPU×4, real spürbar auf Mittelklasse-Geräten).
- **`/gesetze/bund/OR#art-336_c` Anker-Sichtbarkeit**: eher SCHNELLER/gleich (L1-Fix wirkt), aber die
  Seite selbst (LCP) bleibt am stärksten betroffenen Fall.
- **`/gesetze/bund/ZGB#art-457`**: GLEICH im Median, aber ein Ausreisser (1/5) zeigt, dass derselbe
  Effekt gelegentlich auch hier zuschlägt.
- **`/gesetze` Übersicht**: GLEICH (+108 ms bei n=5, innerhalb der Spannweite beider Stände).
- **Kanton BS**: leicht LANGSAMER, aber Streuung so gross (152–3500 ALT, 204–3500 NEU), dass die
  Messung kein Feature-Ergebnis ist (Dispatch-§0 Ziff. 3c) — eher Rauschen als Befund.

## Ursache (empirisch, CPU-Profil via CDP `Profiler`)
Auf `/gesetze/bund/OR` dominiert in BEIDEN Ständen derselbe Chunk `fedlex-BMmBUhNP.js`
(Funktionen `G`/`Te`/`Q`) mit **~4.4–5.6 s Eigenzeit unter CPU×4** — eine sehr grosse kompilierte
Alternations-Regex über alle Bundesgesetz-Titel (sichtbar im Profil als
`RegExp: (?:\b(Bundesgesetzes)...)`), aufgerufen aus `chapeauZielFremdgesetz`
(**`src/components/normtext/ArtikelBody.tsx:7`**, Import aus `src/lib/fedlex.ts`) — vermutlich einmal
pro Artikel für ~1'000+ OR-Artikel.

**Der Unterschied ist NICHT die Kosten-Höhe (fast identisch, ALT 4.4 s / NEU 4.6 s Eigenzeit), sondern
die zeitliche REIHENFOLGE relativ zum sichtbaren H1-Paint:**
- ALT: LCP-Kandidat (H1, Grösse ~59'972) malt bereits bei **t≈408 ms**, die schwere fedlex-Arbeit läuft
  danach (t≈1803–6378 ms) — blockiert die sichtbare Überschrift nicht.
- NEU: erster (kleiner) LCP-Kandidat bei t≈820 ms, die schwere fedlex-Arbeit läuft **t≈1094–6700 ms**,
  und erst danach, bei **t≈6856 ms**, erscheint der grössere H1-Kandidat (Grösse 60'144) — die
  Überschrift wird also erst NACH der schweren Berechnung final/gross gemalt.

Die genaue Codestelle, die diese Reihenfolge in NEU gegenüber ALT verschiebt, konnte ich in der
verbleibenden Zeit **nicht abschliessend verifizieren** (kein Diff-Beweis auf Zeilenebene, nur die
Zeitreihen-Korrelation über CPU-Profile) — das ist eine offene Lücke dieser Prüfung.

## Fix-Vorschläge (je ≤5 Zeilen)
1. **Fedlex-Verlinkung vom kritischen Render-Pfad lösen**: `chapeauZielFremdgesetz`-Aufruf in
   `ArtikelBody.tsx` hinter `beiLeerlauf`/`requestIdleCallback` verschieben (analog zum bereits
   bestehenden Muster in `bezuegeLaden.ts`), Text zuerst roh rendern, Verlinkung als zweite Schicht
   nachziehen — würde die H1/Artikel-Sichtbarkeit von der 4–5 s-Aufgabe entkoppeln.
2. **Titel-Regex einmal pro Session cachen statt pro Render neu kompilieren** (falls `new RegExp(...)`
   je Artikel/Render neu gebaut wird) — in `src/lib/fedlex/positivliste.ts` bzw. `erkennung.ts` prüfen,
   ob ein Modul-Level-Singleton fehlt.
3. **Root-Cause der Reihenfolgen-Verschiebung** noch nicht gefunden — als eigener Untersuchungsschritt
   (React-Profiler-Flamegraph ALT vs NEU auf Commit-Ebene) empfehlen, bevor Fix 1 gebaut wird, damit
   nicht symptomatisch repariert wird.

## Nicht geprüft
- CPU-Profil-Ursache nur für `/gesetze/bund/OR`, nicht für BS/ZGB/Übersicht (Zeitbudget).
- `check:perf-budget` / `check:perf-lighthouse` nicht gefahren (ausserhalb Auftrag, separates Tor).
- Real-Gerät-Messung (nur CPU×4-Emulation, kein echtes Mittelklasse-Handy).
- Fast-3G × CPU×4 nur n=3 statt 5 (Zeitbudget) — Tendenz aber eindeutig (ALT 1316 vs NEU 11172 ms).
