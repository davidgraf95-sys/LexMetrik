# Leser-Tempo QS-PERF — Zeit bis bedienbar, A/B vor und nach zwei Massnahmen

> **Messung mit Massnahme.** Anders als das Vorgänger-Dossier
> [Kanton-Reader-Profil](kanton-reader-profil-2026-08-31.md) (reines Profil,
> «erst messen, nichts fixen») hält dieses Dossier eine **A/B-Reihe** fest: der
> Basis-Stand und derselbe Stand mit zwei gebauten Massnahmen, gemessen in
> derselben Sitzung auf derselben Maschine.

- **Erstellt:** 1.9.2026, ROADMAP-Schritt `QS-PERF` (Leser-Tempo), Branch
  `feat/qs-perf-leser-tempo`, Basis-Stand `cd4dc65cb`.
- **Status:** ERSTRECHERCHE (Messwerte; jede Zahl auf EINER Maschine erhoben —
  belastbar sind die **A/B-Differenzen und Verhältnisse**, nicht die
  Absolutwerte).
- **Wichtigster Satz zuerst:** Die zwei Massnahmen wirken (−22 bis −28 % unter
  Drossel). Sie machen den Leser schnell genug, dass eine **latente
  Mount-Kopplung** in ihm sichtbar wird (Befunde **B4** und **B5**) — deren
  **Wurzel-Fix ist in diesem Schritt gebaut** (Befund **B6**): die
  Sprung-Rückmeldungen werden beim Kopfzeilen-Wechsel nicht mehr
  ummontiert. Damit ist die volle e2e-Suite grün (722/722), und der
  Snapshot-Preload bleibt als eigener Folgeschritt offen.
- **Abnahme-Status:** keine fachliche Abnahme nötig und keine erteilt — es sind
  Messwerte, keine Rechtsinhalte.
- **Pflegebedarf:** Die Zahlen altern mit jedem Bundle- und Datenzuwachs. Sie
  werden **nicht nachgeführt, sondern ergänzt** (§0 Ziff. 2b). Laufende Wächter
  bleiben `check:perf-budget` (Nutzlast) und `check:perf-lighthouse` (CLS/LCP).
- **Quellen:** eigene Messreihen gegen `dist/` via `vite preview` +
  Playwright-Chromium/CDP. Werkzeug: `scripts/perf/leser-tempo.ts`
  (`npm run perf:leser`) — in diesem Schritt gebaut, im Repo, reproduzierbar.

## Messaufbau (reproduzierbar)

```
npm run build
npm run perf:leser -- --laeufe=5 --cpu=4 --netz=4g
npm run perf:leser -- --wasserfall --cpu=4 --netz=4g --route=/gesetze/bund/OR
```

- **Messgrösse «bedienbar»** = `[data-v3-ansicht]` im DOM. Bewusst genau die
  Bedingung, gegen die neun Leser-Specs warten
  (`e2e/helpers/leserBereit.ts`): der Ansicht-Öffner steht **nicht** im
  Prerender-HTML (dort ist kein einziger `<button>`), er existiert erst nach
  dem Client-Render. Zweite Messgrösse `article[id^="art-"]` (erster Artikel des
  interaktiven Lesers) — dieselbe wie im Kanton-Reader-Profil, damit die Reihen
  vergleichbar bleiben. Beide Marker fielen in allen Läufen zusammen.
- Erfasst per **MutationObserver aus einem Init-Script**, nicht per Polling —
  Polling verzerrt unter CPU-Drossel die eigene Messung.
- **Jeder Lauf kalt:** frischer Browser-Kontext + `Network.setCacheDisabled`.
- Drossel über CDP (`Emulation.setCPUThrottlingRate`,
  `Network.emulateNetworkConditions`); langsames 4G = 1.6 Mbit/s ↓ / 150 ms RTT,
  langsames 3G = 400 kbit/s ↓ / 400 ms RTT. Viewport 1440×900.
- **Netz-Mitschnitt über CDP**, nicht über `PerformanceResourceTiming` —
  Letzteres legt den Eintrag erst bei Abschluss an und übersieht genau die
  Downloads, die beim Marker noch laufen (Lehre aus dem Vorgänger-Dossier).

## Kalibrierung gegen das Vorgänger-Dossier

Bevor die A/B-Reihe zählt, muss das Werkzeug dieselbe Welt sehen wie das
Profil vom 31.8.2026. Auf dem Basis-Stand, 6× CPU + langsames 3G, n=5:

| Route | hier gemessen (Median) | Profil 31.8.2026 (n=3) |
|---|--:|--:|
| `/gesetze/bund/OR` | 38 296 ms | 36 979 ms |
| `/gesetze/kanton/BS-154.100` | 18 538 ms | 17 360 ms |

Abweichung +3.6 % bzw. +6.8 % — dieselbe Grössenordnung, plausibel aus
Datenzuwachs und Tagesform. Das Werkzeug misst, was das Profil gemessen hat.

## Wasserfall auf dem Basis-Stand (`/gesetze/bund/OR`, 4× CPU + langsames 4G)

Marker «bedienbar» 10 009 ms. Gekürzt auf die taktgebende Kette:

| von → bis (ms) | KB | Ressource |
|---|--:|---|
| 0 → ~190 | 217 | `/gesetze/bund/OR` (Prerender-HTML) |
| 167 → 1989 | ~190 | 18 Eager-Chunks (`index`, `vendor-react`, `startseiteConfig`, `register-*`, `browse-*`, `fedlex`, `kantone`, `katalogSuche` …) |
| 2554 → 3154 | 45 | Route-Welle (`GesetzLeser`, `NormText`, `KontextPanel`, `werkzeuge` …) |
| 2672 → 5200 | 148 | `/normtext/register.json` |
| 2676 → **läuft beim Marker noch** | (753) | `/rechtsprechung/register.json` |
| 3166 → 3912 | 35 | `LeserRahmenV3` |
| 3923 → 5286 | 84 | `/normtext/struktur/bund/OR.json` |
| **5215 → 8861** | 344 | `/normtext/bund/OR.json` ← **der Snapshot** |
| — | | Marker **10 009** |

**Die zentrale Zahl: der Snapshot wird erst nach 5215 ms von 10 009 ms
angefordert — 52 % der Wartezeit vergehen, bevor die eigentliche Nutzlast
überhaupt bestellt ist.** Grund ist eine harte Abhängigkeit: `ladeErlass(key)`
wartet auf das Register, weil `e.datei` erst daraus kommt
(`src/lib/normtext/browse.ts:75–78`, `src/pages/gesetz-leser/inhalt-hooks.tsx:94`).
Das bestätigt Kandidat **K2** des Vorgänger-Dossiers auf der Bund-Route; **K1**
(`/rechtsprechung/register.json` auf jeder Gesetzes-Leserseite) ist ebenfalls
sichtbar — der Download läuft beim Marker noch.

## Die zwei gebauten Massnahmen

| # | Massnahme | Logikverlust |
|---|---|---|
| M1 | `Shell.tsx` lädt ein Browse-Manifest nur noch, wenn ein **tatsächlich gezeigter** Pfad ein Label daraus braucht (`[pathname, ...liveSek]`) | **keiner** — kein Label geht verloren, es lädt bei Bedarf nach; Muster von `ReiterUebersicht.tsx` |
| M2 | Prerender setzt `<link rel="preload" as="fetch" crossorigin="anonymous">` für **Register und Struktur-Sidecar** in den Kopf jeder Erlass-Seite | **keiner** — Preload ändert nur das WANN, nie das WAS; Register bleibt im Client die einzige Quelle des Dateinamens (§5) |

M2 umfasste zunächst auch den **Snapshot** selbst; er ist wieder ausgebaut, weil
er 20 Leser-Specs reisst — siehe Befund **B4** unten. Das ist die grösste
Einzelerkenntnis dieses Schritts.

Nicht gebaut wurden die im Vorgänger-Dossier als verlustbehaftet bewerteten
Varianten («Lader ganz auf Rechtsprechungs-Pfade beschränken», «Dateipfad im
Client ableiten»).

## A/B-Ergebnis (Median, n=5 je Zelle, je Lauf kalt)

### 1× CPU · Netz ungedrosselt (schnelle Maschine, lokaler Server)

| Route | vorher | nachher | Δ |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 788 | 780 | −8 ms |
| `/gesetze/bund/ZGB` | 708 | 730 | +22 ms |
| `/gesetze/bund/StGB` | 547 | 559 | +12 ms |
| `/gesetze/kanton/BS-154.100` | 427 | 431 | +4 ms |

**Ungedrosselt wirkt keine der Massnahmen** — und muss es nicht: dort ist die
Seite schon vorher unter 1 s bedienbar. Die Differenzen liegen innerhalb der
Streuung der Einzelläufe (OR: 771–818 gegen 776–853 ms) und sind **kein
Gewinn**, sondern Rauschen.

### 4× CPU · langsames 4G (Lighthouse-Mobil-Profil)

| Route | vorher | nachher | Δ |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 10 368 | 7 899 | **−2 469 ms (−23.8 %)** |
| `/gesetze/bund/ZGB` | 8 486 | 6 399 | **−2 087 ms (−24.6 %)** |
| `/gesetze/bund/StGB` | 6 511 | 4 834 | **−1 677 ms (−25.8 %)** |
| `/gesetze/kanton/BS-154.100` | 4 902 | 3 807 | **−1 095 ms (−22.3 %)** |

*Nachher-Spalte auf dem ENDSTAND gemessen, also inklusive Wurzel-Fix (B6).
Ohne ihn lagen dieselben Zellen bei 7 613 / 6 362 / 4 803 / 3 781 ms — der Fix
kostet nichts Messbares (die OR-Zelle trägt einen Ausreisser 9 168 ms in
sonst 7 637–8 029).*

### 6× CPU · langsames 3G

| Route | vorher | nachher | Δ |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 38 296 | 27 432 | **−10 864 ms (−28.4 %)** |
| `/gesetze/kanton/BS-154.100` | 18 538 | 13 975 | **−4 563 ms (−24.6 %)** |

Die Spannen der Einzelläufe überlappen zwischen den Armen in **keiner** Zelle
der gedrosselten Bedingungen (z. B. OR @4×/4G: 10 226–10 593 gegen
7 637–9 168 ms) — der Unterschied ist nicht die Streuung.

### Anteil je Massnahme (4× CPU + langsames 4G, Zwischenstände n=3)

| Route | Basis | nur M1 | M1+M2 (Endstand, n=5) |
|---|--:|--:|--:|
| `/gesetze/bund/OR` | 10 009 | 7 609 (−24.0 %) | 7 613 |
| `/gesetze/bund/ZGB` | 8 410 | 6 556 (−22.0 %) | 6 362 |
| `/gesetze/bund/StGB` | 6 273 | 5 093 (−18.8 %) | 4 803 |
| `/gesetze/kanton/BS-154.100` | 4 824 | 4 016 (−16.8 %) | 3 781 |

**M1 trägt den weit grösseren Teil** und deckt sich mit der Gegenprobe des
Vorgänger-Dossiers (−16 bis −19 % durch blosses Abwürgen derselben Datei). M2 in
der ausgelieferten, snapshot-freien Fassung trägt auf den kleineren Erlassen
noch 5–6 %, auf dem OR nichts Messbares — dort ist der Register-Start nicht der
bindende Term.

**Zum Vergleich, was die verworfene Fassung MIT Snapshot-Preload gebracht
hätte** (n=3, derselbe Aufbau — nicht ausgeliefert, siehe B4): OR 7 346,
ZGB 6 180, StGB 4 548, BS 3 472 ms; also rund 3–10 % mehr je Route. Diese Zahl
steht hier, damit die Folgearbeit weiss, was am Reihenfolge-Fix hängt.

## Befunde

### B1 — Der Befund «OR 8,4–17,2 s bis bedienbar» ist ungedrosselt nicht mehr reproduzierbar

`fahrplaene/FAHRPLAN-PERFORMANCE.md` §1-N2 hält für den **17.8.2026** fest: OR
«8,4–17,2 s bis zur Bedienbarkeit auf einem schnellen, unbelasteten Rechner».
Am 1.9.2026 misst dieselbe Grösse auf dem Basis-Stand `cd4dc65cb`
ungedrosselt **788 ms** (n=5, Spanne 776–853 ms).

**Der alte Wert wird nicht nachgeführt** (§0 Ziff. 2b) — er gilt für seinen
Stand. Die naheliegende, hier **nicht bewiesene** Erklärung: zwischen beiden
Daten landete `QS-BASIS (d) K3` (Commit `cd4dc65cb`, 1.9.2026), das den
statischen Suchindex um **4.66 MiB gzip (−46.8 %)** verkleinert hat. Wer die
Frage schliessen will, misst `19a989f93` gegen `cd4dc65cb` mit demselben
Werkzeug; das ist hier bewusst **nicht** getan (der Schritt baut das
Leser-Tempo, er rekonstruiert keine Mess-Historie).

Praktische Folge: **Die Zielgrösse «unter 2 s bis bedienbar» war auf einer
schnellen Maschine schon vor diesem Schritt erfüllt.** Der reale Gewinn dieses
Schritts liegt dort, wo Nutzerinnen ihn spüren — auf gedrosselter CPU und
langsamem Netz (−23 bis −28 %).

### B2 — Gedrosselt ist die Strecke bandbreitengebunden, nicht mehr kettengebunden

In der Fassung mit vollem Preload starteten Snapshot, Register und
Struktur-Sidecar bei ~181 ms statt bei 5215/2672/3923 ms (CDP-Wasserfall). In
der ausgelieferten Fassung gilt das für Register und Struktur; der Snapshot
folgt weiterhin dem Register, startet aber rund 2.5 s früher als vorher, weil
das Register früher da ist. Was bleibt, ist in beiden Fällen die
**Summe der Bytes**: rund 1.1 MB gzip auf dem kritischen Pfad des OR
(217 KB Prerender-HTML + ~190 KB Eager-JS + 344 KB Snapshot + 148 KB Register +
84 KB Struktur + ~110 KB Schriften) — bei 1.6 Mbit/s allein rund 5.5 s reine
Downloadzeit. Weitere Gewinne auf dieser Achse verlangen **weniger Bytes**,
nicht eine andere Reihenfolge.

Der grösste Einzelposten ist strukturell: derselbe Normtext liegt zweimal auf
dem Pfad — einmal als prerendertes HTML (für Crawler und JS-lose Leser) und
einmal als JSON (für den interaktiven Leser). Beide Hälften zu streichen wäre
Logikverlust (SEO/no-JS gegen Bedienbarkeit); der Posten bleibt offen.

### B3 — `crossorigin` am Preload ist kein Kosmetik-Attribut

`<link rel="preload" as="fetch">` **ohne** `crossorigin` legt eine
no-cors-Anforderung an; der spätere `fetch()` (mode cors, credentials
same-origin) kann sie nicht wiederverwenden und lädt die Datei ein zweites Mal
— aus einer Beschleunigung würde eine Verdopplung der Nutzlast. Mit
`crossorigin="anonymous"` empirisch geprüft: im CDP-Wasserfall nach dem Bau
steht je Datei **genau ein** Eintrag.

### B4 — Der Snapshot-Preload reisst 20 Leser-Specs: der Leser hängt an der Reihenfolge

Der lohnendste Preload wäre der Snapshot selbst (OR: 344 KB gzip, zuletzt
angefordert). Mit ihm im Kopf fallen **20 Specs in 8 Dateien**: Scroll-Spy,
TOC-Ruhe (A33), Weiterlesen-Chip (R4/R8), Kopf-Geometrie, Ortsangabe,
Split-View-Faltung.

**Isolation** — je derselbe 49-Test-Satz, lokal, `--reporter=line`, nichts
sonst laufend:

| Stand | Ergebnis |
|---|---|
| Basis-Stand `cd4dc65cb` (Nullprobe) | 49 passed |
| + M1 (Shell), ohne Preload | 49 passed |
| + M1 + Preload Register/Struktur (**ausgeliefert**) | 49 passed |
| + M1 + Preload Register/Struktur/**Snapshot** | **29 passed, 20 failed** |

Damit ist der Snapshot-Preload als alleinige Ursache belegt und M1 entlastet.

**Mess-Hygiene, ehrlich:** Die erste Beobachtung dieser Rotfälle entstand,
während parallel eine `perf:leser`-Sonde mit eigenem Browser und eigenem
`vite preview` lief — also unter **selbstverschuldeter Parallel-Last**, genau
dem Treiber, den `e2e/gesetze-historie-badge.e2e.ts` als Flake-Wurzel
dokumentiert. Diese Beobachtung wurde deshalb verworfen und die ganze Reihe
sauber wiederholt. Die Tabelle oben stammt vollständig aus den sauberen Läufen.

**Symptome (aus den Rotläufen):** der Scroll-Spy schreibt die gelesene Stelle
nie — `localStorage` bleibt `null` bis zum 20-s-Timeout in `leseBis`
(`e2e/leser-weiterlesen-r4-r8.e2e.ts:44`); und der Abstand Kopf→Artikel wandert
um 44 px gegen einen Deckel von 4 px (`e2e/leser-v3-rahmen.e2e.ts:286`).

**Wertung.** Der Preload verschiebt hier nicht nur das WANN. Liegt der Snapshot
im Cache, ändert sich die **Reihenfolge**, in der der Leser Daten und Rahmen
bekommt — und der Leser hängt daran. Das ist Funktions-Treue (Scroll-Spy und
TOC stehen im Skill `perf` namentlich in der Logikverlust-Definition). §1/§15:
dort gewinnt die Treue, nicht das Tempo; §6.3 verbietet, stattdessen die Specs
anzupassen.

**Der eigentliche Fund ist nicht der Preload, sondern die
Reihenfolge-Abhängigkeit im Leser.** Sie ist ein latenter Defekt: jede künftige
Beschleunigung, die Daten früher liefert (Service-Worker-Cache, HTTP/2 Push,
Edge-Cache, ein warmer Reload), trifft sie ebenso. Sie gehört behoben, nicht
umschifft (§17) — Einstiegspunkt ist der Spy-Effekt in
`src/pages/gesetz-leser/inhalt-hooks.tsx:337 ff.`, dessen Aufsetzen an
`sektionen`/`ohneGliederung` hängt, also an einem Zustandsübergang, den ein
sofort verfügbarer Snapshot überspringt. Beweismittel liegt bereit: derselbe
49-Test-Satz plus der Ein-Zeilen-Eingriff (Snapshot in `preloads` aufnehmen,
`scripts/prerender.ts`).

### B5 — Auch die schonende Fassung stösst an dieselbe Wurzel: R7 wird rot

Nach dem Ausbau des Snapshot-Preloads (B4) blieb die volle e2e-Suite mit
**einem** Rotfall stehen: `e2e/leser-ruecksprung-r5-r7.e2e.ts:201` («R7 —
Deep-Link-Skeleton»). Gemessen mit `--repeat-each=5`, 6× CPU-Drossel, lokal,
nichts sonst laufend:

| Stand | R7 | gemessene Overlay-Standzeit |
|---|---|---|
| Basis-Stand `cd4dc65cb` (2 Reihen) | **0/10 rot** | (grün, Wert nicht gedruckt) |
| + M1 (Shell) allein | 1/5 rot | 241 ms |
| + M1 + M2 (Register/Struktur-Preload) | 4/5 rot | 89 · 103 · 104 · 106 · 151 ms |

Die Assertion lautet `dauerMs > 300` und war an der damals gemessenen Standzeit
von **1673 ms** kalibriert (Kommentar im Spec). Sie ist ein **Latenz-Boden**:
sie sagt nicht «das Overlay deckt den Lesebereich» (das prüfen die Frame-Zahl
und die Deckungsprüfung daneben), sondern «der Einsprung dauert lange». Der
Einsprung ist jetzt 7–19× schneller — die Assertion meldet einen Fehler für
einen Fortschritt.

**Und darunter liegt mehr.** In einem Diagnose-Lauf mit testweise gesenkter
Schranke (50 ms statt 300 ms — **nicht ausgeliefert**, der Eingriff wurde
zurückgenommen) fiel der Test weiter, nun an einer **substanziellen** Stelle:
`document.getElementById('art-8')` ist nach dem Verschwinden des Overlays in
3/5 Läufen `null` (`e2e/leser-ruecksprung-r5-r7.e2e.ts:288`, «Ziel im DOM»).
Der Latenz-Boden hat diesen Fall bisher verdeckt.

Die Erklärung liegt in `src/components/layout/DeepLinkSkeleton.tsx`: der
Toter-Anker-Zweig schliesst das Overlay, sobald **irgendein**
`article[id^="art-"]` im DOM steht — begründet mit der Annahme «die Artikel
erscheinen gemeinsam (eine Render-Runde)». Wird der Reader schneller, trifft
diese Annahme das Zeitfenster anders, und das Overlay gibt auf, bevor das Ziel
da ist. Das ist derselbe Wurzelbefund wie B4: **der Leser koppelt Bereitschaft
an Zeit und Reihenfolge statt an Zustand.**

**Konsequenz — und was daraus wurde:** Der Zweig war damit nicht landefähig, und
es genügte ausdrücklich **nicht**, M2 wegzulassen: auch M1 allein — die
unstrittige, verlustfreie Massnahme — riss R7 (1/5). Jede Beschleunigung tut
das. Die Schranke stattdessen zu senken wäre §6.3-widrig gewesen und hätte
zusätzlich einen echten Defekt zugedeckt; genau das zeigt der Diagnose-Lauf
oben. Also wurde die Wurzel gesucht — siehe **B6**.

### B6 — Die Wurzel war eine MOUNT-Kopplung, nicht der Toter-Anker-Zweig (gefixt)

Die Vermutung aus B5 (der Toter-Anker-Zweig schliesse zu früh) ist **gemessen
widerlegt**. rAF-Sampler auf `/gesetze/bund/BV#art-8`, 6× CPU-Drossel, n=3:

- **Alle 232 Artikel erscheinen im SELBEN Frame**, und `#art-8` erscheint auf
  die Millisekunde mit dem ersten `article[id^="art-"]` (1193 / 1227 / 1390 ms,
  beide Marker identisch). Die Annahme des Toter-Anker-Zweigs — «die Artikel
  erscheinen gemeinsam» — trägt also; er ist bereits zustandsgekoppelt.
- Die Ansage ging trotzdem vorzeitig aus, **und zwar auf die Millisekunde
  gleichzeitig mit dem Wechsel der Kopfzeile** auf `kopfzeileSelbst`:

  | Overlay-Flanken (ms) | Kopf-Zweig → `still` | Ziel im DOM |
  |---|--:|--:|
  | an 678 · **aus 823** · an 836 · aus 1441 | **823** | 1355 |
  | an 495 · **aus 666** · an 1177 · aus 1250 | **666** | 1177 |
  | an 501 · **aus 672** · an 1186 · aus 1263 | **672** | 1187 |

**Ursache.** `InhaltsKopf` hatte zwei `return`-Zweige (still / laut), und in
beiden standen `RuecksprungChip` und `DeepLinkSkeleton`. React ordnet statische
Kinder nach **Position** zu: im stillen Zweig lag der Chip an Index 0, im lauten
an Index 1 — der Zweigwechsel war damit kein Update, sondern **Unmount +
Remount** beider Rückmeldungen. Der Effekt-Cleanup des sterbenden Skeletons rief
`schliesse()`, die neue Instanz baute die Ansage neu auf. Und dieser
Zweigwechsel passiert bei **jedem** Leser-Einsprung: die Route
`/gesetze/:ebene/:key` ist `lazy`, die Shell rät bis dahin eine laute Leiste
(`kopfVonPfad`), und sobald der Leser steht, meldet er `kopfzeileSelbst`.

Für die Nutzerin war das ein **Blinken** der Ansage «Springe zur verlinkten
Stelle …» (13–511 ms Lücke) — ein Bestandsfehler, unabhängig vom Tempo. Sichtbar
wurde er erst, als die Lücke vor den Artikel-Render fiel.

**Fix.** Ein Träger, dessen Zustand nur Attribute, Klassen und den vorderen
Inhalt ändert; die zwei Rückmeldungen stehen in beiden Zuständen an derselben
Position und behalten ihre Identität. Gerendertes Markup unverändert (stiller
Zustand rendert `null` statt der Leisten-Zeile, `undefined`-Attribute lässt
React weg) — `golden:vergleich` byte-gleich, prerenderte Seiten unverändert, die
`h-9`-Reservierung des stillen Trägers (CLS-Herleitung `leser-kopf-cls-s3`)
unberührt.

**Nachher** (identischer Aufbau, n=3): genau **eine** Flanke je Lauf —
an 533 · aus 1309 (Ziel 1228) · an 520 · aus 1300 (Ziel 1218) ·
an 523 · aus 1287 (Ziel 1204). Die Ansage steht durchgehend, **bis das Ziel im
DOM ist**, rund 780 ms lang.

**Beweis.** R7 `--repeat-each=5` unter 6× Drossel: **50/50 grün** (vorher 4/5
rot). Volle Suite: **722 passed, 0 failed**. Kein Test angepasst — der
Latenz-Boden `dauerMs > 300` steht unverändert und wird jetzt erfüllt.

## Offen (nicht in diesem Schritt gebaut)

- **Snapshot-Preload (B4) — die Reihenfolge-Abhängigkeit des Spy-Effekts.** Der
  Deep-Link-Zweig ist mit B6 gefixt; die 20 Specs aus B4 hängen an einer
  ZWEITEN Stelle: der Spy-Effekt
  (`src/pages/gesetz-leser/inhalt-hooks.tsx:337 ff.`) setzt über
  `sektionen`/`ohneGliederung` auf, also über einen Zustandsübergang, den ein
  sofort verfügbarer Snapshot überspringt. Diese Wurzel ist **nicht** in diesem
  Schritt untersucht — B6 hat nur die Deep-Link-Kopplung erledigt. Solange sie
  steht, bleibt gesperrt, was dem Leser den SNAPSHOT früher liefert (Preload,
  Service-Worker-Cache, Edge-Cache, HTTP/2 Push). Daran hängen gemessene
  3–10 % je Route. Beweismittel: `npm run perf:leser` plus der 49-Test-Satz
  dieses Dossiers und der Ein-Zeilen-Eingriff in `scripts/prerender.ts`.
- **K3 — Drei-Wellen-Chunk-Kaskade.** In der Eager-Welle stehen Chunks, die der
  Leser nicht braucht (`katalogSuche`, drei `browse-*`, `kantone`, `fedlex`,
  `startseiteConfig`). Erwarteter Gewinn nach obiger Rechnung: rund 300 ms
  @4G je 60 KB. Berührt das Bundle-Budget und verlangt Golden-Beweis.
- **Reader-Kopf-Reflow** (`header 161 → 238 px`, `h1 49 → 75 px`, Quelle
  `div.flex.shrink-0`; Befund 17.8.2026, `FAHRPLAN-PERFORMANCE.md` §1-N2).
  Nicht angefasst: der Fix reserviert Kopf-Geometrie und ist damit eine
  **Design-Entscheidung** (§13, wie viel Leerraum ein kurzer Titel trägt), kein
  reiner Perf-Eingriff. `check:perf-lighthouse` misst OR-CLS aktuell bei
  **0.003** gegen eine Schranke von 0.05.
- **`main.tsx` nutzt `createRoot` statt `hydrateRoot`** (ROADMAP-Unterpunkt von
  `QS-BASIS`). Bewusst **nicht** hier gebaut: der Skill `perf` verbietet in
  Bauregel 5 ausdrücklich das naive `hydrateRoot` (ein Markup-Mismatch ist
  stiller Normtext-Verlust), und die ROADMAP verlangt für den Posten einen
  eigenen PR mit Hydrations-Fehler-Wächter und Gegenprüfung. Sein gemessener
  Anteil (27–78 ms nach `load`) ist gegenüber den hier gehobenen 3–11 s klein.

## Verwandtes

- [Kanton-Reader-Profil (K-11)](kanton-reader-profil-2026-08-31.md) — das
  Profil, dessen Kandidaten K1/K2 hier gebaut wurden; enthält die
  Logikverlust-Vorbewertung je Variante.
- [CWV-Baseline (W1.11)](cwv-baseline.md) — misst LCP/Transfer der prerenderten
  Seiten, also die **andere** Grösse (erster Text auf dem Schirm).
