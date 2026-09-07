# R5-F1F · Seitenleiste: Inhalt und Standard eingeklappt (D25 · D26)

**Branch** `feat/w2-24-r5-f1f`, abgezweigt von `ebf53e425`
**Datum** 6.9.2026 · **Fahrplan** W2·24-DESIGN-IDENTITAET

Davids Sätze, die diesen Schritt auslösen:
«seitenleiste soll als default zuerst eingeklappt sein» (D25) ·
«die seitenleiste, also die einklappbare, nochmals überarbeiten, was sie
anzeigt» (D26) · «keine funktion verloren» · «nicht trist» ·
«wenn man bspw. auf rechtsprechung klickt verschiebt sich alles» (D21) ·
«Fusszeile flackert beim Routenwechsel» (D21-Nebenfund).

---

## 1 · D25 — die Leiste startet überall eingeklappt

`src/components/layout/useSeitenleiste.ts` führt neu `VORGABE_EINGEKLAPPT = true`
und nimmt keinen Vorgabewert mehr vom Aufrufer entgegen. Damit ist die
Ä1c-Regel «nur im Gesetz-Leser eingeklappt» (17.8.2026) nicht verschärft,
sondern **abgelöst**: eine bereichsabhängige Vorgabe hat keinen Fall mehr.

Der Ä1c-Befund von damals ist **wörtlich** nach `useSeitenleiste.ts` gewandert
(Beleg altert nicht, er wird ergänzt — nur der Geltungsbereich ist jetzt «alle
Routen»). `Shell.tsx` ist dabei um genau drei Zeilen berührt worden
(s. Ziff. 7).

Unverändert bleibt:

- **Nutzerwahl gewinnt.** `null` = «noch nicht gewählt»; wer den Schalter im
  Titelblatt betätigt, dessen Wahl gilt überall und über Sitzungen hinweg
  (`localStorage`, versionierter Schlüssel `…eingeklappt.v2`).
- **Der Schalter bleibt, wo er war** (Titelblatt, `aria-pressed`).
- **Die mobile Schublade ist unberührt** — unter `lg` gibt es die persistente
  Leiste ohnehin nicht.

**Prerender.** Ohne `window` liefert `ladeEingeklappt()` `null`, der Vorgabewert
greift, das ausgelieferte HTML trägt kein `<aside data-app-seitenleiste>`. Die
Inhaltsspalte hat ab dem ersten Frame die volle Breite. Belegt mit
abgeschaltetem JavaScript im Wächter (Ziff. 5).

## 2 · D26 — die Leiste zeigt Ziele statt Kategorien

Vorher war die Leiste eine Kopie der Kategorien-Ordnung; wer etwas aufschlagen
wollte, klappte erst auf und las dann eine Rubrik. Neu steht in jeder Rubrik
das, was man täglich aufschlägt, als direktes Ziel, darunter genau eine Zeile
«Alle …».

| Rubrik | Inhalt neu | Quelle (keine Handpflege, §5) |
|---|---|---|
| Gesetze | OR ZGB ZPO StGB StPO SchKG BV DBG VwVG BGG · «Alle Bundeserlasse» · Gruppe «Kantone» (26, mit Zahl) · Gruppe «International» (5) | `components/gesetze/kernerlasse.ts` (dieselbe Liste wie die Übersicht) + Erlass-Register · `KANTONE` + Zähler-Generat · `INTERNATIONAL_RUBRIKEN` |
| Rechtsprechung | 6 Sachgebiete mit Entscheid-Zahl (`?rg=`) · «Leitentscheide» mit Zahl (`?leit=1`) | `startseiteZaehler.generated` — neu `rechtsprechungSachgebiete` / `rechtsprechungLeitentscheide` |
| Materialien | 9 Behörden mit Zahl (`#b-<id>`) · «Alle Materialien» | `startseiteZaehler.generated.materialienBehoerden` |
| Rechner | Verfahrens- & Rechtsmittelfristen · Prozesskosten · Verjährung · Zuständigkeit Zivilprozess · Verzugszins · «Alle Rechner» | fünf geführte Katalog-**IDs**, aufgelöst über `KATALOG_KARTEN` |
| Vorlagen | 5 Kategorie-Gruppen wie bisher | `VORLAGE_SEKTIONEN` |

**Die Zahlen sind gemessen, nicht illustriert.** Der Generator zählt die
Sachgebiete nach *derselben* Regel wie `zaehleSachgebiete` in
`lib/rechtsprechung/browse.ts` (Volltext-Verweise raus) — die Zahl in der Leiste
ist damit exakt die Zahl auf der Sachgebiets-Kachel der Übersicht (§5). Leere
Sachgebiete und Behörden ohne Bestand erscheinen gar nicht, statt als 0-Zeile
(§8). Jede Zahl trägt ihre Einheit im Accessible Name («Privatrecht — 992
Entscheide»), nie nur die nackte Zahl (O4-Muster).

**Keine Funktion verloren.** Die Systematik des Bundesrechts und die
Rechner-Oberkategorien sind nicht verschwunden — sie sind die Gliederung ihrer
Übersichtsseiten und werden dort gezeigt, wo der Filter sie auch bedient. Aus
der Leiste erreichbar bleibt beides über «Alle Bundeserlasse» bzw. «Alle
Rechner»; die Kopf-Suche findet jedes Werkzeug ohnehin direkt.

**Meta-Ziele in den Fuss.** Einstellungen · Methodik · Über · Kontakt ·
Datenschutz standen als fünf gleichrangige Zeilen unter den Inhalts-Rubriken.
Sie stehen jetzt im Seitenfuss, und `Footer.tsx` liest dafür **dieselbe SSoT**
`NAVIGATION_META`, die sie vorher in der Leiste zeichnete — sonst gäbe es nach
dem Umzug zwei Meta-Listen. Nebenbefund dabei behoben: im Fuss fehlte
ausgerechnet «Einstellungen».

**Nicht trist.** Die Registerfarben-Gruppenköpfe (F1C) bleiben; die Leiste hat
jetzt in jeder Rubrik Text UND Zahl statt vier grauer Klapp-Zeilen.

**Aktivmarke geschärft.** Weil die Kernerlasse eigene Ziele sind
(`/gesetze/bund/OR`), trafen auf einer Leser-Route zwei Einträge zu. Neu gilt:
trägt der aktuelle Pfad selbst einen Eintrag, gehört ihm die Marke allein
(`Sidebar.tsx`, `istAktiv`).

**Die Startseite ist unberührt.** Die Bereichs-Reihe iteriert nur die Top-Ebene
von `NAVIGATION` (Titel + Ziel); beides ist unverändert. Screens
`r5f1f-1440-*-start-eingeklappt.jpg` zeigen «/» wie zuvor.

## 3 · Die drei roten Sonden vom Basisstand

Alle drei waren auf `ebf53e425` rot, **bevor** dieser Schritt etwas verändert
hat (Nullprobe im Protokoll R12B beziffert, hier nachgemessen). Alle drei sind
Wächter-Mängel, kein Produktfehler:

| Sonde | Ursache (gemessen) | Behebung |
|---|---|---|
| `gesetze-az-register.e2e.ts:170` (G4) | `/Systematische Sammlung\|Erlasse/` traf mit `.first()` seit dem D22-Kopfumbau (04815ac33, `pages/Gesetze.tsx`) die Überschrift «Internationales Privatrecht & weitere Erlasse» — eine Systematik-Gruppe **innerhalb einer zugeklappten `<details>`-Karte**. Playwright wertet das als `hidden`. | Identitäts-Treffer auf die Ausgabe-Zeile der Säule («… Bundeserlasse · … Kantonserlasse»), sichtbar und eindeutig. |
| `rechtsprechung.e2e.ts:281` (V5 Rail) | `button[name=/schliessen/].first()` traf den Reiter-Schliessknopf der Arbeitsleiste («Reiter «BGE 152 IV 14» schliessen»), der im DOM vor dem Dialog steht und **unter** dessen Fläche liegt: `<div role="dialog"> subtree intercepts pointer events`, 30 s Timeout. | Locator in den Dialog gescopt. Der Reiterstreifen *darf* hinter einem modalen Dialog liegen. |
| `rechtsprechung.e2e.ts` A9 | Exakte Gleitkomma-Latte `CLS === 0`, gerissen mit **0.000631275720164609** (Subpixel-Rundung, runner-abhängig grün/rot). | Latte `≤ 0.001`, deklariert (§17). Das ist rund ein Pixel — jeder echte Sprung schlägt weiterhin voll durch. Die Ortsgrenze (nur Shifts innerhalb `main`) bleibt. |

## 4 · D21-Nebenfund — das Fuss-Flackern

**Messbedingung:** @1440, gebautes `dist/`, Chromium mit 400 kbit/s + 150 ms
Latenz (drosselt das Fenster auf messbare Länge; über eine schnelle Leitung
dauert dasselbe ~100 ms — genau Davids Beobachtung).

Weg `/gesetze` → `/rechtsprechung`, Nullprobe 3×:

```
t≈2.8 s  Suspense-Fallback     Dokumenthöhe 1524   Fuss y=1189  (unter der Falz)
t≈3.2 s  Ladezustand der Seite Dokumenthöhe  900   Fuss y= 564  (IM Bild)
t≈5.4 s  register.json da      Dokumenthöhe 27208
```

Einziger gezählter Layout-Shift: **Quelle `FOOTER`**, CLS **0.3070** (3/3
bitgleich). Auf `/` → `/rechner` trat er nicht auf — dort lädt die Seite nichts
nach.

**Ursache:** `components/layout/RouteHuelle.tsx` reserviert die Routenhöhe nur
bis zum Auflösen des lazy-Chunks. Danach hängt `pages/Rechtsprechung.tsx` an
seinem eigenen `register.json` (Fetch in `useEffect`, Zeile ~268) und rendert
bis dahin einen ~200 px hohen Ladeblock **ohne Höhenreservierung**; die
Inhaltsspalte fällt unter die Fensterhöhe, der Fuss rutscht ins Bild und beim
Eintreffen der Daten wieder hinaus.

**Abweichung vom Auftrag, offengelegt (§7):** der Auftrag vermutete die Ursache
in `Footer.tsx` oder im Shell-Übergang. Beide sind nicht beteiligt — der Fuss
folgt korrekt dem Fluss, und die Shell wechselt die Route ohne eigenen Sprung.

**Fix:** der Ladezustand reserviert dieselbe Höhe wie der Fallback der
Routen-Hülle (`pk('min-h-screen', 'min-h-[24rem]')`). Nachmessung unter
derselben Bedingung: **CLS 0.0000 in 3/3**.

Der Ladeblock wird dabei weder verzögert noch versteckt — es steht dieselbe
Anzeige, nur ohne dass der Seitenfuss dafür nach oben rückt.

## 5 · Wächter, jeder einmal rot gezeigt (§6.7)

Neu `e2e/d21-seitenleiste-kein-sprung.e2e.ts` (4 Fälle) und
`e2e/helpers/seitenleiste.ts` (die eine Stelle, an der die D25-Vorbedingung
«Leiste erst einblenden» hergestellt wird, §5).

| Fall | Rot-Probe | Gemessen rot |
|---|---|---|
| Sidebar-Nachbar: Kante und Breite von `main#inhalt` über den Routenwechsel identisch (Δ = 0, drei SPA-Schritte inkl. Zurück-Taste) | `VORGABE_EINGEKLAPPT = false` **und** Leiste in `Shell.tsx` wieder von «/» ausnehmen (D17-Stand davor) | «Kante wandert beim Wechsel / → /rechtsprechung: 0 → 256» |
| Gegenprobe mit **stehender** Leiste: derselbe Wechsel, ebenfalls Δ = 0 | dieselbe Sonde | rot (Leiste auf «/» gar nicht da) |
| D21-Nebenfund: Fuss flackert nicht (gedrosselt, CLS ≤ 0.01) | Höhenreservierung in `pages/Rechtsprechung.tsx` entfernen | CLS 0.30696296296296294, Quelle `FOOTER` |
| D25-Prerender: volle Breite ab dem ersten Frame (JavaScript aus) | — (misst das ausgelieferte HTML direkt) | grün, kein Nachrutschen |

Δ = 0 statt einer Toleranz ist Absicht: es gibt keinen Grund, warum ein
Routenwechsel den Satzspiegel um auch nur einen Subpixel verschieben dürfte.

## 6 · Deklarierte Wächter-Nachzüge (§6.3)

Kein Refactoring — die Seitenleiste hat sich fachlich geändert, also ändern sich
die Wächter mit Begründung am Fundort:

- `src/tests/navigation.test.ts` — «Rechner = OBERKATEGORIEN» → fünf geführte
  Katalog-IDs + «Alle Rechner» (weiterhin aufgelöst, nicht abgeschrieben);
  «Gesetze › Bund = SYSTEMATIK» → Kernerlasse aus `kernerlasse.ts` + «Alle
  Bundeserlasse»; International über Label statt Positionsindex; die
  Toter-Link-Prüfung kennt die Erlass-Leser-Routen aus dem Erlass-Register.
- `src/tests/navigation-ia7-badges.test.ts` — Kantonsgruppe über Label; «nur
  Kantone tragen Badges» gilt ausdrücklich **im Abschnitt Gesetze** (Rubriken
  Rechtsprechung/Materialien tragen seit D26 eigene, gezählte Zahlen).
- `src/tests/materialien-register.test.ts` — Behörden direkt in der Leiste,
  Massstab «BEHOERDEN **mit Bestand**».
- `src/tests/sidebar-o2-konsistenz.test.tsx` — Auto-Expandieren an der ersten
  zugeklappten Werkzeug-Gruppe (heute Vorlagen) statt an einer Rechner-Gruppe.
- `e2e/uinav-o2-sidebar.e2e.ts` — die drei O2-Zusagen an der Vorlagen-Gruppe
  «Behördeneingaben»/«Fristerstreckungsgesuch» statt an «Fristen»/«Verjährung»;
  der «fremde Seite»-Sprung über «Alle Rechner» statt «Methodik».
- `e2e/w223b-kopf-seitenleiste.e2e.ts` — D17 prüft jetzt beides: auf «/» ist die
  Leiste zuerst weg (D25-Vorgabe) und nach dem Schalter da.
- `e2e/gesetze-ia7-sidebar-badges.e2e.ts` — Badge-Zählung auf die Kantonsgruppe
  eingegrenzt.

## 7 · Berührte Zeilen in `Shell.tsx` (für den Merge mit R11)

Drei Stellen, alle trivial:

1. Zeile 18 — `istGesetzLeserPfad` aus der Importliste von
   `./InhaltsKopfKontext` entfernt (wird nur noch dort nicht mehr gebraucht).
2. Zeilen 97–108 — der Ä1c-Kommentarblock ist nach `useSeitenleiste.ts`
   gewandert; übrig bleibt ein Zweizeiler mit Verweis.
3. Zeile ~99 — `useSeitenleiste({ vorgabeEingeklappt: … })` → `useSeitenleiste()`.

Kein anderer Teil von `Shell.tsx` ist angefasst — Reiterleiste, Panes,
`usePaneLayout`, `Topbar`-Verdrahtung bleiben unberührt.

## 8 · Nachweis

Screens (hell + dunkel, @1440 und @390) im selben Ordner, Präfix `r5f1f-`:

- `1440-{hell,dunkel}-start-eingeklappt` — Vorgabe, volle Breite, Startseite
  unverändert
- `1440-{hell,dunkel}-start-aufgeklappt` — die neue Leiste
- `1440-{hell,dunkel}-rechtsprechung-aufgeklappt` · `…-materialien-aufgeklappt`
- `1440-{hell,dunkel}-leser-aufgeklappt` — der Leser behält seine Gliederung
- `1440-{hell,dunkel}-fuss-meta` — die Meta-Ziele im Seitenfuss
- `390-{hell,dunkel}-start` · `390-{hell,dunkel}-schublade` — Schublade
  unverändert

## 9 · Offen / nicht in diesem Schritt

- **`a11y.e2e.ts` «Startseite mit offener Kopf-Suche»** ist im vollen,
  parallelen Lauf rot: `scrollable-region-focusable (serious)` an
  `.lc-schwebeflaeche`. **Nullprobe auf `ebf53e425` unter derselben Bedingung:
  ebenfalls rot** — ein Bestandsmangel, nicht Folge von D25/D26. Einzeln
  aufgerufen ist der Fall grün, das Panel wird also nur unter Last scrollbar.
  Gehört zu Fixer 1e (Kopf-Suche-Panel): entweder das Panel fokussierbar machen
  (`tabIndex={-1}` am Scroll-Container) oder seine Höhe so deckeln, dass es
  nicht scrollt.
- **`a11y.e2e.ts` «Gesetze — Reader BS-640.100»** riss im parallelen Lauf das
  60-s-Budget (auf dem Basisstand 30.7 s) — Last-Streuung, kein Befund dieses
  Schritts.
- **Dieselbe Ladezustands-Lücke** wie in Ziff. 4 kann jede Übersicht treffen,
  die ihr Register client-seitig nachlädt. Gemessen und behoben ist
  `/rechtsprechung` (der von David gemeldete Weg). Ein gemeinsamer Ladezustand
  mit Höhenreservierung für alle fünf Übersichten wäre der Rahmen-Fix (§10) —
  eigener Schritt, weil er `components/**` breit berührt.
