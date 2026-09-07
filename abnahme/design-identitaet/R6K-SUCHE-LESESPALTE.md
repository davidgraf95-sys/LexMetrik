# R6K · Die Suchtreffer ersetzen den Gesetzestext (D38, David 7.9.2026)

Auftrag im Wortlaut: «die suchresultate die erscheinen wenn man im gesetz sucht
sollen nicht in der gliederung erscheinen sondern den gesetzestext ersetzen».

Bau-Branch `feat/w2-24-d38-suche-lesespalte`.

## Ausgangslage — eine Liste, drei falsche Orte

Gemessen am Stand `cfa8a9f81` (Preview 4428, gebautes `dist/`):

| Lage | wo die Trefferliste lag | Breite |
|---|---|---|
| Spalte @≥1280 | in der Gliederung, **anstelle** des Baums | 288 px |
| Spalte eingeklappt @≥1024 | Blatt am Suchfeld (`LeserTrefferBlatt`, Ä76) | 288 px |
| @390 · schmales Pane | Bottom-Sheet hinter ☰, modal über allem | 358 px |

Drei Geometrien, drei Wächter — für eine Auskunft, die auf 288 px Platz hatte,
während die 640 px breite Lesefläche daneben den Text zeigte, den man gerade
nicht liest, weil man sucht. Und die Gliederung, die man beim Sichten von
Treffern am nötigsten braucht, war genau dann verschwunden: Ä32 musste eigens
«alles auf/zu» abschalten, weil der Knopf auf einen Baum zeigte, der nicht mehr
dastand, Ä10 die Überschrift der Leiste von «Gliederung» auf «Treffer» drehen.

## Gebaut

Die Liste liegt als eigene Ebene über der **Lesespalte** — in jeder Breite, mit
und ohne Gliederungs-Spalte, je Pane. Die Gliederung bleibt unverändert stehen
und bedienbar. Gemessen @1440 auf `/gesetze/bund/OR`, Suche «Kündigung»:

```
Trefferfläche   absolute, x 484.5 · Breite 764        (die Lese-Zelle)
Scroller darin  sticky top = --nt-stick · x 546.5 · 640 × 710 px, Inhalt 5895 px
--nt-stick      calc(4rem + 2.125rem + max(3.5rem, 4.25rem)) = 166 px
Such-Zone       44 px im Ruhezustand · 68 px, sobald im Feld etwas steht
Gliederung      18 Baumzeilen — vor, während und nach der Suche dieselben
```

**Überlagern, nicht austauschen.** Der Gesetzestext bleibt gerendert und
bewegt sich nie; die Liste liegt `absolute` darüber und nimmt keinen Platz. Drei
Dinge fallen damit weg, statt gebaut werden zu müssen:

1. **Die Lesestellung** braucht keine Wiederherstellung. Ein Austausch nähme dem
   Dokument seine Höhe (OR: rund 816'000 px), der Scroller klemmte auf 0, und
   Esc müsste eine gemerkte Zahl zurückrechnen. Hier steht der Text still.
2. **Layout-Shift 0** ist Konstruktion, nicht Messglück: was keinen Platz nimmt,
   verschiebt nichts.
3. **Der Sprung zurück** läuft durch die bestehende Mechanik. `zeigeFundstelle`
   sucht `#art-…` im DOM — der Text ist die ganze Zeit da, ein Klick auf eine
   Trefferzeile springt sofort, ohne Remount und ohne zwei Frames Wartezeit.

Preis, offengelegt: der Text bleibt gerendert, während man ihn nicht sieht. Er
wird dadurch nicht teurer — er war schon da; teuer wären Aus- und Wiederaufbau
bei jedem Wechsel.

**Der Weg hinein und hinaus.** Tippen zeigt die Liste (sofort, am rohen
Feldwert — in den 200 ms bis zu den entprellten Treffern steht «sucht …» statt
einer falschen Null). Klick auf eine Trefferzeile oder ↵ im Feld gibt den Text
frei, an der Fundstelle, hervorgehoben, mit stehendem Suchbegriff. Die
Zähler-Zeile am Feld führt mit «Treffer anzeigen →» in einem Klick zurück; ‹ ›
und ↑↓ schreiten durch die Fundstellen, ohne die Liste zu brauchen. Esc oder ein
geleertes Feld beenden die Suche — der Text steht, wo er stand.

**↵ bestätigt nur, wenn es etwas zu bestätigen gibt.** «Art. 99999» löst nichts
auf und trifft nichts; dann bleibt die Liste mit ihrer ehrlichen Absage «Kein
Artikel gefunden für …» stehen (§8). Beim Bau anders gebaut und an
`leser-r1-r2` (Quickjump @390) aufgefallen.

**Die Zonenhöhe wird reserviert.** Solange im Feld etwas steht, ist die
Such-Zone 68 px hoch — auch wenn die Zähler-Zeile gerade schweigt, weil die
Liste ihre Zahlen selbst nennt (§5, kein doppelter Zähler). Ohne die Reservierung
spränge der klebende Kopf bei jedem Wechsel Text↔Treffer um 24 px, und mit ihm
`--nt-stick` und der ganze Text darunter.

## Was ersatzlos gefallen ist (§17)

* `v3/LeserTrefferBlatt.tsx` (129 Z.) und `v3/useTrefferBlatt.ts` — das Blatt am
  Feld war die Antwort auf «keine Spalte, aber Platz»; die Frage gibt es nicht
  mehr. Der Hook lebt als `useTrefferSicht.ts` weiter: dieselbe Frage, neuer Ort.
* Die Weiche Baum/Treffer in `v3/LeserGliederung.tsx`, `blatt`/`blattOffen` an
  der Such-Zone, `istXl`/`onSheet` im Zonen-Aufbau, und die drei Suchzweige der
  Seitenleiste (Ä32 zweimal, Ä10 einmal).
* **Offen übergeben:** `v3/anfangSlot.ts` kann seit D38 nicht mehr feuern
  (`baumKnoepfe` ist immer wahr). Der Rückbau berührt `LeserSeitenleiste.tsx`
  und `TrefferLeiste.tsx`; an der Seitenleiste bauen am 7.9.2026 zwei parallele
  Einheiten (D36/D37) — §0 Ziff. 5, kein Doppelbau. Herleitung steht in der Datei.

## Wächter

Neu: `e2e/leser-d38-treffer-lesespalte.e2e.ts` — (a) Ort, (b) Gliederung
unverändert und bedienbar, (c) Esc ohne Positionsverlust, (d) Umschalten ohne
Verschiebung, (e) @390 mit Sheet.

**Rot-Beweise, alle am gebauten Stand gesehen:**

| Handgriff | Wirkung |
|---|---|
| Suchzweig in `LeserGliederung` zurück | (a) 2 Listen statt 1 · (b) Baum 18 → 94 Zeilen · (e) Liste wieder im Sheet |
| `zoneHoch: feldGefuellt && !trefferSteht` | (d) «die Such-Zone springt beim Umschalten: 44 → 68 px» |
| Austausch statt Überlagerung (`{!trefferSpalte && …}`) | (c) «der Gesetzestext ist ausgehängt» |

Zwei Handgriffe, die **nicht** genügen und darum im Kopf der Spec stehen: der
blosse Tausch `absolute` → `relative` (der Slot ist letztes Kind der Zelle, die
Liste hinge unter dem Text) und die Liste in den Fluss vor die Zelle zu ziehen
(Chromes Scroll-Anchoring hält die Bildlage von selbst). Ein Rot-Beweis, der die
falsche Ursache setzt, beweist nichts.

Ebenso gemessen und darum in (d) nicht über CLS geprüft: jedes Umschalten ist
eine Nutzergeste, und der Browser verwirft jeden Shift innerhalb von 500 ms nach
einer Eingabe (`hadRecentInput`). Die erste Fassung von (d) mass nur CLS und
blieb mit dem Defekt grün. (d) misst darum die Geometrie; der CLS-Beobachter
läuft als Beifang mit.

**Deklariert umgestellt (§6.3):** `leser-v3-suche-ohne-gliederung` (Zeugen von
`[data-v3-treffer-blatt]` auf `[data-v3-treffer-spalte]`), `leser-r1-r2` (Ort;
Klick gibt den Text frei; A9-DoD ohne Zähler-Zeile), `leser-v3-blatt` (das Sheet
zeigt die Gliederung, Pos. 15), `leser-v3-esc-ohne-sprung` (Bildlage statt
`scrollY` — die Zone wächst jetzt auch mit stehender Spalte, Chromes
Scroll-Anchoring gleicht die 24 px aus), `leser-v3-suche-sprung`,
`leser-v3-suchfeld-ueberall` (beide Zonen-Zustände), `leser-v3-treffer-reihenfolge`
(Aufklappen über die ↓-Navigation statt über den Kopf-Klick),
`leser-suche-klappzustand` (aktive Zeile nach dem Wiederholen sichtbar).

## Bilder

| Datei | Lage |
|---|---|
| `r6k-1440-hell-treffer.jpg` | @1440 hell · OR/«Kündigung» · Liste über der Lesespalte, Gliederung links unverändert |
| `r6k-1440-hell-sprung.jpg` | @1440 hell · nach dem Klick auf Art. 102 — Text zurück, Begriff im Feld, «Treffer anzeigen →» |
| `r6k-1440-dunkel-treffer.jpg` | @1440 dunkel · dieselbe Lage |
| `r6k-390-hell-treffer.jpg` | @390 hell · die Liste hat die ganze Lesefläche |
