# R12A · Übersichts-Köpfe (D22, Vorgriff auf R12) — Bau-Protokoll

**Auftrag** David 6.9.2026 zum Bild `/gesetze` @~1160 hell: «hier hat es wieder komische
lücken». Bindend: Zeile **D22** der Prüfbefunde, dazu **D11** (Übersichts-Köpfe) und der
**R12**-Abschnitt («Wege verkürzen»). Basis: `04815ac33`. Parallel bauten R6b
(`gesetz-leser/**`) und D19 (`layout/Reiterleiste`, `lib/tabs`) — beides unberührt.

---

## 1 · Was gebaut ist (D22 Ziff. 1–7)

| # | Zusage | Stand |
|---|---|---|
| 1 | Kopf: H1 = Bereichsname, DARUNTER die Ausgabe-Zeile (Archivo 13, ink-500), kein Overline, keine halbe Haarlinie | **gebaut**, alle fünf Übersichten |
| 2 | EIN Filterfeld in voller Inhaltsbreite, Unterstrich-Zeile mit sichtbarem Label «Filtern», Facetten als Text-Schalter | **gebaut** auf /gesetze, /materialien, /rechner — **nicht** auf /rechtsprechung und /vorlagen (s. §4) |
| 3 | Norm-Sprung-Kasten auf /gesetze entfällt, Kopf-Suche trägt den Sprung, ⌘K-Hinweis dort | **gebaut**, Beweis §3 |
| 4 | Grösste senkrechte Leerfläche zwischen Inhaltsblöcken ≤ 48 px @1440/1160/1024/390 | **gebaut** auf dem Mass B (sichtbare Blöcke); Mass A s. §2 |
| 5 | Kernerlasse als Link-Zeile unter dem Filter (10 Erlasse, `erlassPfadVonKey`) | **gebaut**, Wächter mit Rot-Probe |
| 6 | Sprach-Diät: keine Erklärsätze im Kopf, §8-Satz im Fuss | **gebaut** (der §8-Satz stand schon im Fuss, der Erklär-Absatz war bereits mit D11/M10 gefallen) |
| 7 | Golden byte-gleich, keine Datenänderung | **gebaut**: `golden:vergleich` → IDENTISCH, 256 Fälle |

Die Anatomie liegt zentral: `components/layout/SeitenKopf.tsx` bekommt `ausgabe` (unter dem
Titel) und ein optionales `overline` (die statischen Seiten behalten ihr Etikett oben);
die Formklassen `.ub-ausgabe`, `.ub-filter`, `.ub-filter-fuss`, `.ub-schalter`, `.ub-kern`
stehen additiv am Ende von `src/index.css`. Die Ebenen-Wahl auf /gesetze ist von der
Segmented-Control (`ui/Tabs`, Kasten + Schatten) auf vier Text-Schalter umgestellt —
«Alle · Bund · Kantone · International»; der zweite Knopf «← Übersicht» daneben ist
damit entfallen. `ui/Tabs` selbst bleibt unangetastet (dort ist die Kasten-Form richtig).

---

## 2 · Leerflächen: gemessen, nicht geschätzt

Skript: Playwright, `main#inhalt`, fünf Übersichten × 1440/1160/1024/390, Preview auf
`dist`. Zwei Masse, weil sie Verschiedenes sagen:

* **A — Lücke zwischen Textkästen.** Konservativ: das Innenpolster einer Karte
  (`.lc-card p-5` = 20 px) zählt als Leerfläche mit, obwohl es zum Block gehört.
* **B — Lücke zwischen sichtbaren Blöcken.** Karten, Hinweise und Linien zählen mit
  ihrer Fläche; gemessen wird der Zwischenraum, den man wirklich sieht.

| Route | Breite | A vorher | A nachher | B nachher |
|---|---|---|---|---|
| /gesetze | 1440 / 1160 / 1024 / 390 | 64 | 60 | **29** |
| /rechtsprechung | 1440 / 1160 / 1024 | 37 | 37 | **32** |
| /rechtsprechung | 390 | 49 | 45 | **32** |
| /materialien | 1440 / 1160 / 1024 / 390 | 57 | 46 | **24** |
| /rechner | 1440 / 1160 / 1024 | 74 | 66 | **48** |
| /rechner | 390 | 60 | 48 | **48** |
| /vorlagen | 1440 | 56 | 48 | **48** |
| /vorlagen | 1160 / 1024 / 390 | 38 | 38 | **25** |

Budget ≤ 48 px: auf Mass B überall gehalten. Auf Mass A bleiben /gesetze (60) und
/rechner (66) darüber; der Rest steckt in `.lc-card`-Polster bzw. im `border-t pt-5` von
`MassgebendeGesetze` — zentrale Bausteine ausserhalb dieser Bau-Fläche, deren Änderung
die ganze App beträfe.

Hebel, die gezogen wurden (nur Abstände, kein Inhalt): Seitenrhythmus `space-y-8` →
`space-y-6` auf allen fünf, Behörden-Sektionen `space-y-10` → `space-y-6`, Landeplatz
`space-y-4` → `space-y-3`, Sachgebiets-Rail @390 `mb-4` → `mb-3`.

---

## 3 · Der Norm-Sprung ist nicht verloren gegangen

Der entfernte Kasten hatte **keine** eigene Funktion: sein Klick löste
`window.dispatchEvent(new CustomEvent('lm:suche-fokus'))` aus und fokussierte damit die
Kopf-Suche (`useUniversalSuche` hat er nie konsumiert — die Sprung-Logik lebt seit A5
ausschliesslich in `HeaderSuche`). Der Weg ist end-zu-end bewiesen statt bloss behauptet:

`e2e/norm-sprung.e2e.ts` → «Norm-Sprung ab /gesetze ohne CTA-Kasten: «OR 257d» → Art. 257d OR»
— ab `/gesetze`, Kasten nachweislich nicht mehr vorhanden (`toHaveCount(0)`), Eingabe
«OR 257d» in die Kopf-Suche, Sprung-Treffer, Enter, URL `/gesetze/bund/OR#art-257_d`. Grün.
Der ⌘K-Hinweis steht an der Filterzeile («Artikel-Sprung über die Suche oben (⌘K)»).

---

## 4 · Was ausdrücklich NICHT gebaut ist

* **/rechtsprechung und /vorlagen: Filterzeile unverändert.** Ihre Filterfelder leben in
  `components/rechtsprechung/{EntscheidFilter,LiveSuche}` bzw. in der geteilten
  `KategorieSektion` — beide ausserhalb der Whitelist dieses Auftrags und mit eigenen
  Wächtern. Kopf und Leerflächen sind dort gebaut, das Feld bleibt für einen eigenen
  Schritt (R7/R9-Nachzug).
* **`.lc-card`-Polster und `MassgebendeGesetze`**: s. §2, letzter Absatz.

## 5 · Vorgefundener Rot-Stand (Nullprobe, nicht von diesem Bau)

`e2e/gesetze-az-register.e2e.ts` → «Register nur auf dem Landeplatz — Säulen-Sichten
bleiben unverändert (G4)» ist **auf dem Basis-Commit `04815ac33` bereits rot** (Nullprobe
6.9.2026: Basis-Quellen ausgecheckt, gebaut, Test einzeln gelaufen — dieselbe Meldung,
`getByText(/Systematische Sammlung|Erlasse/).first()` löst auf eine H3 in einer
zugeklappten `<details>` auf und ist damit «hidden»). Der Fall wurde **nicht** angepasst:
einen fremden roten Test grün zu locatorn hiesse, einen Befund zu verstecken (§6.3/§8).
Zur Weitergabe an den Rahmen-Fixer.

---

## 6 · Tore und Nachweise

`npm run lint` · `npx tsc -b` · `npm run test` (447 Dateien) · `check:design-tokens` ·
`check:seo-index` · `check:zaehler` · `golden:vergleich` (IDENTISCH, 256) ·
`npm run build` · `check:e2e-shards` — alle grün (Ausgaben im Bau-Bericht).

Playwright (Preview `dist`, Port 4357): `a11y`, `gesetze`, `gesetze-uebersicht-u`,
`gesetze-ia-v2-walks`, `gesetze-ia4-scope`, `gesetze-az-register`,
`uinav-j-rechtsprechung`, `norm-sprung`, `gesetze-footer-cls`, `suche-q-fokus-s1-s6`,
`gesetze-rechtsgebiet-g6`, `gesetze-ia5-rechtsgebiet-kanon`, `uinav-o2-sidebar`.

**Deklarierte Test-Anpassungen** (Absicht je Fall unverändert, Begründung am Ort):

| Datei | Was | Warum |
|---|---|---|
| `src/tests/gesetze-kernerlasse.test.ts` | NEU, mit Rot-Probe | Kernerlass-Zeile: Kürzel ≠ Schlüssel (rot: 6 statt 10) |
| `src/tests/uebersichten-o4-o5.test.tsx` | «Nur Titel, Nummer …» → «Titel, Nummer …» | führendes «Nur» in der Filterhülle entbehrlich |
| `e2e/gesetze.e2e.ts` | Kachel-Locator `/\d+ Kantone/`, `/Staatsverträge/` | «Kantone»/«International» stehen jetzt auch als Ebenen-Schalter |
| `e2e/gesetze-footer-cls.e2e.ts`, `e2e/gesetze-ia4-scope.e2e.ts`, `e2e/suche-q-fokus-s1-s6.e2e.ts` | Feld-Locator → Name «Filtern» | sichtbarer Text IST der zugängliche Name (WCAG 2.5.3) |
| `e2e/gesetze-rechtsgebiet-g6.e2e.ts` | «← Übersicht» → Schalter «Alle» | zwei Bedienelemente für eine Achse zusammengelegt |
| `e2e/gesetze-az-register.e2e.ts` | CTA-Kasten → Kernerlass-Link «OR» | der Kasten ist entfallen |
| `e2e/norm-sprung.e2e.ts` | CTA-Fokus-Test → End-zu-End-Sprung ab /gesetze; Ready-Latte auf die Kernerlass-Zeile | schärfere Zusicherung statt Fokus-Prüfung |
| `e2e/uinav-o2-sidebar.e2e.ts` | Platzhalter/Scope-Wortlaut | Label «Filtern» trägt das Verb, der Platzhalter nennt die Felder |

**Screens** (je hell + dunkel, @1440/@1160/@390, 30 Bilder):
`r12a-{gesetze,rechtsprechung,materialien,rechner,vorlagen}-{hell,dunkel}-{1440,1160,390}.jpg`.
