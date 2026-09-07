# R10-Nachzug 3 «Pult» — D29: Modul-Links führen je zu ihrem eigenen Ziel

**Stand 6.9.2026 · Branch `feat/w2-24-r10c`, abgezweigt von `c9154161`.**
Bug David 6.9.2026 (Bild Startseite, Modul «Bundesrecht, systematische
Ordnung»): «jede Kachel führt zu der gleichen Seite» — Spec-Zeile D29,
`w224-pruef-r2-funde.md`.

## 1 · Ursache — gemessen, nicht vermutet

Die Spec-Zeile vermutete: alle sechs Zeilen verlinken auf dasselbe
`/gesetze` (ohne Anker/`?rg=`/`?ebene=`). Das ist **nicht**, was der
Quelltext auf `c9154161` tut — gemessen per Playwright `getAttribute('href')`
auf dem UNVERÄNDERTEN Stand (`vite` dev, Port 4371):

| Zeile | Href VORHER (unverändert, bereits distinkt) |
|---|---|
| 01 Staats- und Verfassungsrecht | `/gesetze?ebene=bund#sys-staat` |
| 02 Privatrecht | `/gesetze?ebene=bund#sys-privatrecht` |
| 03 Zivilprozess- und Zwangsvollstreckungsrecht | `/gesetze?ebene=bund#sys-zivilverfahren` |
| 04 Strafrecht und Strafverfahren | `/gesetze?ebene=bund#sys-straf` |
| 05 Verwaltungsrecht | `/gesetze?ebene=bund#sys-verwaltung` |
| 0 Internationales Recht | `/gesetze?ebene=international` |

Kantone-Modul (`?ebene=kanton&kt=<KT>`, 26 verschiedene) und Behörden-Modul
(`/materialien#b-<id>`) waren ebenfalls bereits je Zeile distinkt. Der
tatsächliche Defekt: die **Kürzel-Zeile** einer Kategorie (`BV · ParlG ·
RVOG · RVOV`) war reiner `<small>`-Text **ohne eigenes Ziel** — sechs Zeilen,
die bis auf die Kürzel-Aufzählung optisch identisch aufgebaut sind, sahen für
David darum wie «immer dieselbe Seite» aus, weil der einzige Teil der Zeile,
der zwischen den Kategorien sichtbar unterschiedlichen Inhalt trug (die
Kürzel), nirgendwohin führte.

Diese Abweichung von der Spec-Hypothese wird hier offengelegt (§7/§14.7),
nicht still nachgeführt.

## 2 · Zusätzlich gefunden, NICHT behoben (ausserhalb Whitelist)

Beim Nachmessen des Klicks auf Zeile 03 im Browser (Vollreload,
`http://localhost:4371/gesetze?ebene=bund#sys-zivilverfahren`) blieb
`window.scrollY` bei kalter Erstladung zeitweise auf `0`, obwohl der
Ziel-Anker (`#sys-zivilverfahren`) längst im DOM stand — `ScrollZuHash`
(`src/App.tsx`) gibt seinen Scroll-Versuch nach 30 `requestAnimationFrame`-
Zyklen (~0.5 s) auf; das Laden des Browse-Manifests (`ladeBrowseManifest()`,
`pages/Gesetze.tsx`) kann bei kaltem Start länger dauern. Bei
SPA-Navigation (Klick von der Startseite) und im gebauten `dist/`-Stand war
der Sprung in dieser Session zuverlässig — dennoch bleibt ein Timing-Fenster,
in dem derselbe wahrgenommene Effekt («Klick, aber es scheint sich nichts zu
bewegen») nochmal auftreten kann. `src/App.tsx` liegt ausserhalb der
Whitelist dieses Auftrags (`src/components/start/**`) — **nicht behoben,
hiermit gemeldet** für einen eigenen Bau-Schritt (30-Frame-Budget an die
Ladezeit des Manifests koppeln statt an eine feste Framezahl).

## 3 · Fix

1. **Kernerlass-Kürzel sind eigene Links** (`src/components/start/modulZiele.ts`,
   neue Datei — Ziel-Ableitungen dürfen nicht in `*.tsx` stehen, eslint
   `react-refresh/only-export-components`, wie `components/gesetze/kernerlasse.ts`
   neben `pages/Gesetze.tsx`): `kuerzelZiel(kuerzel)` bildet über
   `ERLASS_REGISTER` (Feld `kuerzel`, NICHT den Anzeigetext als Schlüssel) auf
   `erlassPfadVonKey(key)` ab. Nötig, weil Register-Kürzel und -Schlüssel bei
   Staatsverträgen auseinanderfallen (`LugÜ`→`LUGUE`, `HZÜ`→`HZUE`) — beide sind
   im Fix korrekt verlinkt (`/gesetze/international/LUGUE` bzw. `HZUE`, Routen-
   Ebene `international`, nicht `bund`, s. `erlassAdresse.ts` Befund 45).
   Ein Kürzel ohne Registereintrag bleibt bewusst Text ohne Link (§8: kein
   geratener Sprung).
2. **Verschachtelung aufgelöst**: die Zeile war vorher EIN `<Link>` um Titel,
   Kürzel-Text und Zahl. Mit Kürzel-Sub-Links wäre das verschachteltes
   `<a><a></a></a>` (ungültiges HTML). Die Zeile ist jetzt ein `<div>`, der
   Titel trägt seinen eigenen `<Link>` auf die Kategorie, die Zahl ist wieder
   reiner Text (war vorher Teil des grossen Links, trug keine eigene Aussage).
3. **Kantone-/Behörden-Modul**: Ziel-Ableitung (`kantonZiel`, `behoerdeZiel`)
   nach `modulZiele.ts` gezogen, Verhalten unverändert (dieselben Templates
   wie vorher inline, jetzt exportiert für den Wächter).
4. **Fussnote auf einen Satz gekürzt**: «Die Ordnung ist die der
   Gesetzes-Übersicht.» gestrichen, der zweite Satz («Die Zahl je Zeile ist
   der bei uns erfasste Volltext …») bleibt WÖRTLICH stehen — er ist die vom
   Wächter `design-r2c-bausteine.test.ts` («§8: der Zähler-Wortlaut ist
   gewandert, nicht abgeschwächt») geschützte Zeichenkette; ein Umbau des
   Satzes hätte diesen bestehenden Wächter gebrochen.

## 4 · §15-Abweichung: Register-Import in den Startseiten-Chunk

`SystematikListe.tsx` importierte bisher bewusst weder `ERLASS_REGISTER`
noch `systematik.ts` (Kommentar im Bestand: «damit bleibt der
Startseiten-Chunk ohne Register-Import»). Der Fix bricht das: `kuerzelZiel`
braucht das Register (nur Bund, ~230 Einträge), um Kürzel auf Erlass-Keys
abzubilden. Gemessen (`npm run build` + `check:perf-budget`):

- **Guard grün**: `entry` 57.8 KB / 60 KB, `vendor-react` 70.8 KB / 90 KB —
  unverändert, weil `Startseite` weiter `lazy()` geladen wird (`RouteSwitch.tsx`)
  und das Budget nur Entry/Vendor-React bewacht.
- **Nicht gewacht, aber real**: der Register-Chunk (`register-*.js`,
  von mehreren Seiten geteilt) wiegt **18.7 KB gzip** und wird jetzt auch
  beim ersten Laden der Startseite nachgezogen — vorher gar nicht. Zum
  Vergleich: `startseiteConfig-*.js` (bereits Teil des Startseiten-Pfads)
  wiegt 20.5 KB gzip.
- **Sauberer Fix wäre**: `kuerzelZiel` build-seitig in
  `scripts/gen-startseite-zaehler.ts` vorrechnen (`bundSystematik[].kuerzel`
  als `{kuerzel, pfad}` statt blanker String) — dann bräuchte der
  Startseiten-Chunk das Register gar nicht. **Nicht umgesetzt**: der
  Generator und `src/data/startseiteZaehler.generated.ts` liegen ausserhalb
  der Whitelist dieses Auftrags. Empfehlung: eigener Bau-Schritt.

## 5 · Wächter

- **Unit** `src/tests/startseite-modul-links.test.ts` (neu, 12 Fälle): alle
  Systematik-/Kantons-/Behörden-Ziele paarweise verschieden, jedes
  Zeilen-Ziel existiert im Nav-Bestand (`NAVIGATION`-Baum rekursiv, nicht nur
  `alleNavLinks()` — eine Gruppen-Überschrift wie «International» trägt ihr
  Ziel selbst, nicht als Blatt), jedes angezeigte Register-Kürzel bekommt
  einen Link, Kürzel/Schlüssel-Mismatch (LugÜ/HZÜ) namentlich geprüft.
  ROT-PROBE: gegen den unveränderten `SystematikListe.tsx`-Stand bricht der
  Import (`systematikZeilen is not a function`) — GRÜN erst nach dem Fix.
- **E2E** `e2e/startseite-pult-r10.e2e.ts`, neuer Block «D29 · Systematik-Modul:
  eigenes Ziel je Zeile» (3 Fälle): sechs verschiedene Zeilen-Hrefs; ein
  Kürzel-Link (`BV` → `/gesetze/bund/BV`) sichtbar und korrekt; Klick auf
  Zeile 03 → URL `#sys-zivilverfahren` UND `<details id="sys-zivilverfahren">`
  offen, sichtbar, im Viewport. ROT-PROBE (§6.7, dokumentiert im Fall-Kommentar):
  am Vorzustand meldete `getByRole('link', {name:'BV'})` 0 statt 1 Treffer.

## 6 · Nachweis

**Build**: `npm run build` grün (63 Routen prerendered), Preview
`vite preview --port 4371`.

| Href NACHHER | |
|---|---|
| 01–05, International | unverändert (Tabelle Ziff. 1) |
| BV · ParlG · RVOG · RVOV · ZGB · ZStV · GBV · TGBV · ZPO · SchKG · GebV SchKG · KOV · StGB · StPO · JStPO · JStG · VwVG · VGG · VGKE · VGR · CISG · LugÜ · HZÜ · HBewÜ | 24 eigene Links, `/gesetze/bund/<KEY>` bzw. `/gesetze/international/<KEY>` — alle 24 paarweise verschieden |

**Tore**: `npm run lint` (0 Fehler, 1 Alt-Warnung unverändert) ·
`npx tsc -b` (leer) · `npm run test` (450/450 Dateien, 7367 grün, 2 skip) ·
`npm run check:design-tokens` (grün) · `npm run check:zaehler` (grün) ·
`npm run build` (grün, exit 0) · `npm run check:e2e-shards` (grün) ·
`npm run check:perf-budget` (grün, s. Ziff. 4).

**E2E**: `npx playwright test e2e/startseite-pult-r10.e2e.ts e2e/a11y.e2e.ts`
— 57/57 grün (ein einzelner Fall, «Gesetze — Reader BS-640.100», riss beim
ersten 57-Fälle-Lauf unter starker Parallel-Last anderer Worktree-Agenten auf
diesem Rechner; isoliert nachgefahren [2/2 grün] und im vollen Lauf danach
[57/57 grün] — Nullprobe nach §3, kein Bezug zu diesem Fix).

**Screenshot**: `r10c-systematik-1440-hell.jpg` (@1440, hell, Preview-Build,
Systematik-Modul im Blickfeld).

## 7 · Nichts verloren

Zähler (`STARTSEITE_ZAEHLER`, unverändert gelesen) · Reihenfolge der Zeilen
(Bund-Kategorien dann International, unverändert) · Modul-Schalter/Register
(kommen weiter aus `PultModul`/`ModulFuss`, hier nicht angefasst) ·
Registerstriche (`border-t border-rule-soft`, unverändert) · IA-6/R3-F9-Kommentare
zur Ordnungsziffer «0» (in `modulZiele.ts` gekürzt, aber inhaltlich erhalten).
