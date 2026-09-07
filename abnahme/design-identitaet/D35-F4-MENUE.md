# D35-F4 · Menü-Anatomie — Ansicht-Menü und Baustein `ui/Menue`

**Bau-Einheit** W2·24-DESIGN-IDENTITAET · D35, Fixer F4
**Entscheid** David 7.9.2026 («A und verlustfrei»; «man soll mittels ansicht
alles einzelne abwählen können»)
**Zweig** `feat/w2-24-d35-f4-menue`, Basis `091e38ae5`
**Stand** 7.9.2026 · nur Darstellung (§3), keine Rechtslogik berührt

---

## 1 Befund (gemessen, nicht behauptet)

Alle Zahlen am Vorstand `091e38ae5`, Leser OR #art-336_c, @1440 hell.
Sie werden **nicht nachgeführt** (§0 Ziff. 2b).

| # | Befund | Messwert |
|---|---|---|
| B1 | Der AUS-Zustand einer Schalter-Zeile rendert nur einen **leeren Hakenplatz**; einziger sichtbarer Unterschied zum An-Zustand ist die Tintenstufe der Beschriftung (`text-ink-900` / `text-ink-600`). Davids Bild: «Fussnoten»/«Fassung» lesen sich als **Rubriken**, nicht als Schalter. | Marke im Aus-Zustand: 0 × 0 px, kein Element |
| B2 | Die Zeilen des Menüs sind **nicht gleich hoch**. Die dritte verlor 1 px, weil ihr als `:last-child` die trennende Haarlinie fehlte; die vierte trug den Schriftregler. | 38 / 38 / 37 / 52 px |
| B3 | Der Schriftregler sass in einem **Kasten mit eigener Kante und eigener Fläche** (`rounded-lg border border-line bg-surface`) — gegen F0.6 («Linien statt Flächen») und F0.9. | 135 × 35 px, Rahmen 1 px, Grund `--surface` |
| B4 | Die Menüfläche liegt @1440 bei x 952–1256, die Lesespalte bei 553–1195. | s. Ziff. 5 (Abweichung) |
| B5 | Gruppentitel als `.lc-overline` (Archivo) — Gruppenkopf und Zeile sprachen zwei Sprachen. | — |
| B6 | Dasselbe Zustandsbild im **Sprachmenü** der Topbar: Messing-Haken **rechts** beim gewählten Eintrag, beim nicht gewählten gar nichts. | — |

---

## 2 Soll und Fix

Ein Rezept, das **alle** Menüs des Hauses tragen — `src/components/ui/Menue.tsx`
plus die `.lc-menu-*`-Regeln in `src/index.css`.

| Soll (Auftrag / §F0 Menü D5) | Fix | Ort |
|---|---|---|
| Schalter-Zeile mit sichtbarem Aus-Zustand | Marke trägt eine **Form**: Kästchen (`menuitemcheckbox`) bzw. Kreis (`menuitemradio`), Kante `--ink-500` im Aus-, `--ink-900` samt Haken/Kern im An-Zustand | `Menue.tsx` `MenueSchalter` · `.lc-menu-kasten` / `-punkt-form` / `-punkt-kern` |
| Gleiche Zeilenhöhe überall, aus einem Token | `--menu-zeile-h: 2.375rem` (= 38 px bei Wurzel 16 — das gemessene Mass der drei gesunden Zeilen, kein neues), als `min-height` an Zeile **und** Regler; `py-2` → `py-1` am Regler, damit der Steller mit seiner `--tap-ziel`-Untergrenze hineinpasst | `index.css` Token-Block + `.lc-menu-zeile` / `.lc-menu-regler` |
| Trennlinien 1 px `--rule-soft` **zwischen Gruppen** | Haarlinie je Zeile entfernt (samt `:last-child`-Sonderfall, der die 37 px verursachte); neu `.lc-menu-gruppe + .lc-menu-gruppe`, `.lc-menu-gruppe + .lc-menu-regler`, `.lc-menu-titel:not(:first-child)` | `index.css` · neuer Baustein `MenueGruppe` |
| Gruppentitel als kursive Literata-Zeile (`.lc-randtitel`, GB-2) | `MenueTitel` rendert `lc-randtitel lc-menu-titel` statt `lc-overline` | `Menue.tsx` |
| Regler als Zeile ohne Kasten, Textknöpfe `.lc-btn-mini` | Pille gestrichen (Klammer trägt nur noch den Abstand), Knöpfe auf das Haus-Rezept | `ui/SchriftgroessenRegler.tsx` |
| Menü rechtsbündig unter dem Griff, ≤ 320 px, im Fenster, Papier + 1 px `--rule` | unverändert `right-0` + `w-[19rem]` (304 px) + `max-w-[calc(100vw-2rem)]` auf `.lc-schwebeflaeche`; jetzt **bewacht** statt zugesichert | e2e (Ziff. 4) |
| Rollen und Tastatur unverändert | `role="switch"`/`aria-checked` im Baustein, `menuitemcheckbox`/`menuitem` vom Aufrufer, `menueTastenFahrt`, Esc + Fokus aus `usePopoverAutoZu` — Zeile für Zeile unberührt | — |

**Funktion unverändert.** Kein Handler, kein Store-Feld, kein `aria-*` wurde
angefasst; die Schaltlogik (`schalte(...)`, `setzeOption`) steht wie zuvor.

---

## 3 Konsumenten

| Menü | Datei | Was sich ändert |
|---|---|---|
| Ansicht (Leser) | `src/pages/gesetz-leser/v3/LeserAnsichtV3.tsx` | eine Klassenzeile: `flex flex-col` → `lc-menu-gruppe` (Rolle und Name bleiben) |
| Verlauf | `src/components/layout/VerlaufUebersicht.tsx` | Gruppen-`<div>` → `MenueGruppe` (ohne die Klammer setzte die Gruppen-Haarlinie nirgends mehr an, weil der Titel in seinem `<div>` `:first-child` ist) |
| Sprache | `src/components/SprachUmschalter.tsx` | Radio-Punkt links statt Messing-Haken rechts; Breite 14 → 18 rem, weil die Namen sonst neben «In Vorbereitung» kappten (gemessen: «E…» / «Fr…» / «Ital…») |
| Reiter-Kontextmenü | `src/components/layout/ReiterMenue.tsx` | keine Quelländerung — zieht Titel und Zeilen aus dem Baustein, erbt das Rezept |
| Einstellungen (Regler «Ganze Seite») | `src/pages/Einstellungen.tsx` | keine Quelländerung — zieht `SchriftgroessenRegler` und verliert die Pille mit. **Offengelegt (§5):** genau der Zweck des gemeinsamen Rezepts; zwei Anatomien für dasselbe Knopf-Paar wären der Befund, den C1 abgeräumt hat |
| Thema, «Startseite anpassen» | — | tragen das Menü-Rezept **nicht** (`grep lc-menu-*` = 0 Treffer ausserhalb der drei oben); Thema ist ein Segment-Schalter, nicht ein Menü. Nicht angefasst |

---

## 4 Wächter und Rot-Probe (§6.7)

### 4.1 vitest — `src/tests/design-d35-f4-menue.test.tsx` (14 Fälle)

Markenform in beiden Stellungen · Punkt-Variante · `--menu-zeile-h` an Zeile
und Regler · keine Haarlinie je Zeile · Gruppentitel `.lc-randtitel` ·
Regler-Klammer ohne Rahmen/Fläche/Radius · `aria-live` und Prozentwert
unberührt. Jeder Fall hat zusätzlich eine **Negativ-Kontrolle** mit dem
Wortlaut von vor dem Bau.

**Rot-Probe** (Marke zurück auf den leeren Hakenplatz, `.lc-menu-zeile` zurück
auf `border-bottom` + `:last-child`, Regler zurück in die Pille):

```
Test Files  1 failed (1)
     Tests  7 failed | 7 passed (14)
```

Wiederhergestellt: `Tests 14 passed (14)`.

### 4.2 e2e — `e2e/w224-d35-f4-menue.e2e.ts` (8 Fälle, @1440 + @390)

Zeilenhöhen ±1 px · Marke sichtbar **vor und nach** dem Umlegen (Kante 1 px) ·
Regler ohne Kante/Fläche/Radius · Menü ≤ 320 px, ganz im Fenster, deckender
Grund und 1-px-Kante · axe am aufgezogenen Menü · Rollen und Tastatur wie D4.

**Rot-Probe 1** (derselbe Vorzustand, neu gebaut):

```
✘ @1440: alle Zeilen ±1 px gleich   Error: Zeilenhöhen: 38 / 38 / 37 / 52   (max-min 15 > 1)
✘ @390:  alle Zeilen ±1 px gleich   Error: Zeilenhöhen: 38 / 38 / 37 / 52
✘ jeder Schalter zeigt seine Marke  Error: Marke vorhanden (aria-checked=true) → false
✘ keine eigene Kante/Fläche         Rahmen des Reglers: erwartet 0px/0px/0px/0px, war 1px/1px/1px/1px
4 failed / 4 passed
```

Die reproduzierten Zeilenhöhen sind **exakt die Befundzahlen** 38/38/37/52.

**Rot-Probe 2** für den Breiten-/Fenster-Wächter (Panel testweise auf
`w-[26rem]`, neu gebaut):

```
✘ @1440: ≤ 320 px breit …   Menübreite: erwartet <= 320, war 416
✘ @390:  ≤ 320 px breit …   Menübreite: erwartet <= 320, war 358
2 failed
```

Wiederhergestellt: alle 8 grün, zweimal hintereinander (`--repeat-each=2`).

### 4.3 Bestehende Sonden — unverändert grün

`leser-w224-g` (D4-Rollen + axe) · `w224-r11-reiterleiste` (Kontextmenü) ·
`hist-ansicht-w25i` · `leser-v3-umschalten` · `leser-v3-schriftskala` ·
`leser-v3-kopfzeile` · `verlauf-o1` · `topbar-kein-ueberlauf-320` ·
`d36-einstellungen-fuss` · `a11y-flaeche`. Keine davon musste angepasst
werden (§6.3).

---

## 5 Abweichung, offengelegt (§7)

Der Auftrag verlangt «kein Überragen über die Lesespalte hinaus» **und**
«öffnet rechtsbündig unter dem Griff». Am gebauten Stand gemessen (@1440):

```
Ansicht-Griff  1186 – 1256
Menü            952 – 1256   (304 px, rechtsbündig unter dem Griff)
Erlass-Kopf     180 – 1260
Lesespalte      553 – 1195
```

Das Menü endet **exakt an der rechten Kante seines Griffs** und bleibt
innerhalb des Kopfes. Es ragt damit 61 px über die **rechte Kante der
Lesespalte** hinaus — weil der Griff selbst dort steht (die Griff-Zone des
Erlass-Kopfes reicht bis 1256). Das Menü in die Textspalte zu zwingen hiesse,
es von seinem Anker zu lösen, also die zweite Hälfte desselben Satzes zu
brechen. Umgesetzt ist darum die **operative** Fassung: Breite ≤ 320 px, ganz
im Fenster, rechtsbündig am Griff — so bewacht die e2e es auch. Wenn David die
Textspalten-Fassung will, ist das ein eigener, kleiner Nachzug (Anker auf die
Spalte statt auf den Griff).

---

## 6 Erweiterung ohne Umbau (Demo für F1/F3)

Der Baustein trägt Radio-Gruppen und weitere Kontrollkästchen bereits; F1/F3
schreiben nur noch Zeilen, keine Anatomie:

```tsx
{/* Dreier-Wahl — eine Gruppe, drei menuitemradio-Zeilen */}
<MenueTitel>Fusszeile</MenueTitel>
<MenueGruppe attrs={{ role: 'group', 'aria-label': 'Rubriken der Fusszeile' }}>
  {(['alle', 'nur Bezüge', 'keine'] as const).map((wahl) => (
    <MenueSchalter key={wahl} form="punkt"
      an={rubrik === wahl} label={wahl}
      titel={`Fusszeile: ${wahl}`}
      onKlick={() => setzeRubrik(wahl)}
      attrs={{ role: 'menuitemradio' }} />
  ))}
</MenueGruppe>

{/* Weiterer Schalter — dieselbe Gruppe, dieselbe Zeilenhöhe, kein CSS */}
<MenueSchalter an={bezuege} label="Bezüge" titel="Bezüge am Artikelfuss"
  onKlick={…} attrs={{ role: 'menuitemcheckbox' }} />
```

Die Trennlinie zur nächsten Gruppe, die Zeilenhöhe, die Markenform und der
Fokus-Strich kommen aus dem Rezept.

---

## 7 Belegbilder

`abnahme/design-identitaet/`

| Datei | Was sie zeigt |
|---|---|
| `d35-f4-1440-hell-ansicht.jpg` | Ansicht-Menü hell, **«Fassung» ausgeschaltet** — leeres Kästchen neben zwei gehakten; Regler ohne Kasten |
| `d35-f4-1440-dunkel-ansicht.jpg` | dasselbe Menü dunkel, alle drei an |
| `d35-f4-1440-hell-sprache.jpg` | Sprachmenü mit Radio-Punkten, Namen ungekappt (18 rem) |
| `d35-f4-1440-dunkel-kontextmenue.jpg` | Reiter-Kontextmenü dunkel, sieben Zeilen à 38 px, kursiver Titel |
| `d35-f4-390-hell-ansicht.jpg` | Ansicht-Menü @390, im Fenster (x 66–370 bei 390) |

Gemessene Zeilenhöhen in **jedem** dieser Menüs: 38 / 38 / 38 / 38 (Kontextmenü
38 × 7). @390 dunkel trägt keine eigene Datei (Deckel 5 Bilder); die Masse sind
themenunabhängig und laufen im e2e für beide Breiten.

Schlussmessung @1440 hell: Marke 13 × 13 px, Kante 1 px `rgb(37,35,31)` =
`--ink-900` · Regler 121 × 24 px, Rahmen `0px`, Grund `rgba(0,0,0,0)` ·
Gruppentitel «Literata Variable» italic 13 px in `rgb(29,78,137)`
(`--reg-marke` der Route, GB-2).

---

## 8 Offene Punkte

1. **Textspalten-Anker** — s. Ziff. 5, wartet auf Davids Entscheid.
2. **`SchriftgroessenRegler` in der Knopf-Ratsche** (`design-r9-knopf-baustein`)
   steht weiter mit 2. Die Knöpfe **tragen** jetzt `.lc-btn-mini`, aber über die
   Variable `knopf` — der Sweep sieht nur das öffnende Tag. Die Ratsche bleibt
   darum unverändert; sie zu senken hätte sie rot gemacht, ohne dass etwas
   besser wäre. Ein Sweep, der `className={variable}` auflöst, wäre ein eigener
   §17-Schritt.
3. **F1/F3** bringen die neuen Einträge (Rubrik-Schalter der Fusszeile,
   Dreier-Wahl) — Anatomie steht, s. Ziff. 6.
