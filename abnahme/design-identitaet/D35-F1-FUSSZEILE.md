# D35-F1 · Die Funktionszeile am Artikelende

**Roadmap:** W2·24-DESIGN-IDENTITAET · **Zweig:** `feat/w2-24-d35-f1-fusszeile`
**Entscheid David 7.9.2026:** Variante A des D35-Vorschlags, Nachtrag wörtlich:
«das alles soll dann nur auf klick aufklappbar sein».
**Wächter:** `e2e/leser-d35-f1-funktionszeile.e2e.ts` (Shard-Gruppe 5).

---

## 1 · Was gebaut ist

Am Ende jedes Artikels steht EINE Zeile. Links die Rubriken dieses Artikels mit
ihren Zahlen, rechts seine Aktionen:

    Bezüge  11 Entscheide ›  1 Rechner ›   Zitat · Link · Amtliche Fassung ↗ · ⧉ Daneben öffnen

Fünf Zusagen aus dem Entscheid, je einzeln gemessen:

1. **Zu beim Laden.** Keine Rubrik steht offen. Der Merker der D34-Zeile
   (`lm.leser.bezuege-offen`) ist ersatzlos gelöscht — läge er noch, wäre «nur
   auf Klick» eine Absicht statt einer Zusage.
2. **Je Rubrik ein eigener Griff.** Ein Klick öffnet genau seine Rubrik. Bis D34
   öffnete EIN `<details>` alle vier zugleich.
3. **Aktionen dauerhaft sichtbar.** «Zitat · Link · Amtliche Fassung ↗ · ⧉
   Daneben öffnen» stehen mit Deckkraft 1 und WCAG-2.5.8-Höhe da, ohne dass die
   Maus etwas berührt — und GENAU EINMAL je Artikel: die alte Kopf-Variante
   unter `opacity-0` ist gelöscht, nicht gedoppelt (§5).
4. **Zähler = Liste.** Die Zahl auf dem Griff ist die Länge dessen, was er
   aufklappt (§8). Die M-6-Wurzel ist mit behoben: die CSS-Regel
   `html[data-leitfaelle=aus] .lc-leser [data-leitfall-zeile]` ist gestrichen —
   die Zeile zeigt, was sie zählt, auch bei «Rechtsprechung im Kopf aus».

## 2 · «⧉ Daneben öffnen»: eine falsche Streichung und ihre Korrektur (§7)

Der Auftrag nennt als vierte Aktion «daneben öffnen». Sie war am 7.9.2026
**gebaut, dann wieder gestrichen** worden (Commit `7baaf70d5`). Die Streichung
war **falsch** und ist mit diesem Nachfix rückgängig gemacht.

**Die Messung von damals bleibt gültig und wird nicht nachgeführt** (Beleg-Regel:
ein datierter Befund wird ergänzt, nie umgeschrieben). Sie lautete — gemessen
7.9.2026, Preview `:4435`, `/gesetze/bund/OR#art-336_c` @1440:

- `istOffen` vergleicht `tabSchluessel(pathname + search)` (`Shell.tsx:301-303`).
- `tabSchluessel` streift den `#hash` ab (`usePaneLayout.ts:26`).
- `/gesetze/bund/OR#art-336_c` ist damit für die Pane-Steuerung derselbe Pfad wie
  `/gesetze/bund/OR` — und der steht immer offen, sonst stünde dieser Artikel gar
  nicht auf dem Schirm.
- Mit der Bedingung `kannOeffnen && !istOffen(panePfad)` renderte der Knopf an
  keinem Artikel; `Shell.tsx:357` verwarf zusätzlich den Klick.

**Falsch war der Schluss, nicht die Messung.** Aus «diese Bedingung ist an jedem
Artikel false» wurde «ein Knopf, der nie erscheint, wird nicht gebaut» — und
damit fiel eine Funktion weg, statt dass eine falsche Bedingung korrigiert wurde.
Die App löst genau diese Frage **eine Ebene höher seit M8** (Prüfbefund R11 #28,
6.9.2026): der Erlass-Kopf öffnet nicht den eigenen Pfad, sondern
`naechsteInstanz(pfad)` — «…/OR?r=2», den Instanz-Diskriminator, den
`tabSchluessel` ausdrücklich **behält** (`src/pages/gesetz-leser/v3/ReiterAktion.tsx`,
`src/lib/tabs.ts:710`). Damit ist der Pfad nie «schon offen», `istOffen` ist
gegenstandslos, und `kannOeffnen` (≥ lg + freie Kapazität) bleibt die einzige,
richtige Bedingung.

**Der Nachfix benutzt genau diesen Weg** — kein zweiter Mechanismus (§5):
dieselbe Steuerung (`usePaneSteuerung`), dieselbe Instanz-Vergabe
(`lib/tabs.naechsteInstanz`), dasselbe Wort («Daneben öffnen», Ä118/M8). Der
einzige Unterschied zum Erlass-Kopf ist der **Anker**: dort `pathname + search +
hash`, hier der eigene Artikel (`#art-<token>`) — «Art. 336c neben Art. 335c» ist
genau die Geste, für die es die zweite Instanz gibt.

**Gemessen nach dem Nachfix** (7.9.2026, Preview `:4435` aus eigenem `dist/`,
`/gesetze/bund/OR#art-336_c`): @1440 steht der Knopf genau einmal, Deckkraft 1;
sein Klick öffnet `[data-pane="sekundaer"]`, und Art. 336c steht darin 92 px
unter der Fensteroberkante (Anker gehalten). @1023 und @390 ist er abwesend
(`kannOeffnen` false) — kein Knopf ohne Wirkung (§8). Wächter: Fall (f) der
Sonde, zwei Rot-Proben in §3.

## 2a · Wie der Fehlschluss den CI rot machte — und was daran NICHT die Ursache war

Der CI-Lauf `34134684969` (Shard 8) meldete
`e2e/leser-v3-split-a34-bugs.e2e.ts` rot: «element(s) not found». Die naheliegende
Zuschreibung an die gestrichene Aktion ist **falsch** — jene Sonde fasst den
Artikelfuss überhaupt nicht an. Gemessen (7.9.2026, beide Stände als eigener
Build, Preview aus eigenem `dist/`, ZGB @1440):

| Stand | Art. 683 (y) | Art. 684 (y) | aktiv an der Bezugslinie (154 px) | Panel |
|---|---|---|---|---|
| main `8d398874e` | −24 … **108** | 205 … 709 | **Art. 684** (683 endet über der Linie und fällt aus dem Kandidatensatz) | 3 Entscheide |
| D35-F1 | 24 … **199** | 296 … 801 | **Art. 683** | 0 Entscheide |

Ursache ist die Funktionszeile selbst: sie macht **jeden** Artikel rund 43 px
höher, und Art. 683 reicht damit über die Bezugslinie. Der Scroll-Spy arbeitet
korrekt; was kippte, war eine **unausgesprochene Vorbedingung der Sonde**
(`scrollIntoViewIfNeeded` scrollt minimal und sagt nur zu, dass Art. 684
*sichtbar* ist, nicht, dass er *an der Linie steht*). Der Setup-Schritt stellt
Art. 684 jetzt ausdrücklich an die Linie (`scrollIntoView({ block: 'start' })`
landet über die `.nt-anker`-`scroll-margin-top` genau dort). **Keine Assertion und
keine Zusage der Sonde ist berührt** (§6.3) — die Änderung ist in der Datei
begründet und hier deklariert.

## 3 · Rot-Proben (§6.7) — jede einzeln gefahren

Messbedingung durchgehend: eigener Worktree, Preview `:4435` aus **eigenem
`dist/`**, vor jeder Probe `npm run build` (Exit 0) und Neustart des
Preview-Servers — F11 (stale `dist/`) damit ausgeschlossen. `--workers=2`.

**Grün-Grundlage vor den Proben:** 6/6 grün (12.3 s) — für die vier ersten
Proben. Nach dem «Daneben öffnen»-Nachfix (7.9.2026): 8/8 grün (19.5 s); die
beiden letzten Zeilen der Tabelle sind gegen diesen Stand gefahren.

| Fall | Mutation | Ergebnis | Meldung der Sonde |
|---|---|---|---|
| (a) zu beim Laden | `BezuegeKopf.tsx`: `useState({})` → `useState({ r: true, m: true, g: true, w: true })` | **ROT** | «eine Rubrik steht ungefragt offen» — Expected 0, Received **600** |
| (b) je Rubrik ein Griff | `BezuegeKopf.tsx`: `setOffen((s) => ({ ...s, [m.reg]: jetzt }))` → `setOffen({ r: jetzt, m: jetzt, g: jetzt, w: jetzt })` (D34-Sammelschalter) | **ROT** | `#art-271 .lr7-bez-block` — Expected 1, Received **2** |
| (d) Aktionen ohne Hover | `ArtikelAktionen.tsx`: Gruppe `<span className="lr7-bez-aktionen">` → `… opacity-0` (D34-Kopf-Kette) | **ROT** | «‹Zitat› steht mit Deckkraft 0 da» — Expected 1, Received **0** |
| (e) Skelett überreserviert nicht | `tailwind.config.js`: `'bez-skelett': '3rem'` → `'40rem'` | **ROT** | «Skelett 640 px, geladen 530 px — der Block SCHRUMPFT beim Laden, der Sprung ist nur verlegt» |
| (f) «Daneben öffnen» WIRKT | `ArtikelAktionen.tsx`: `oeffneDaneben(naechsteInstanz(panePfad))` → `oeffneDaneben(panePfad)` (der eigene, immer offene Pfad) | **ROT** | «der Klick öffnet kein zweites Fenster» — `[data-pane="sekundaer"]` nicht gefunden |
| (f)+(d) «Daneben öffnen» IST DA | `ArtikelAktionen.tsx`: `{kannOeffnen && (` → `{kannOeffnen && false && (` (= die Streichung vom 7.9.2026) | **ROT** | (f): «die vierte Aktion des Auftrags fehlt am Artikel» — Expected 1, Received 0 · (d): «/daneben öffnen$/ steht nicht genau einmal am Artikel» |

### 3a · Ein Tor, das nicht scheitern konnte — und der Fix

Die **Erstfassung von (d) blieb bei genau dieser Mutation GRÜN**, während die
Knöpfe unsichtbar waren. Grund: sie mass `getComputedStyle(el).opacity` an den
KINDERN der Aktionsgruppe. Deckkraft ist aber nicht vererbt, sondern **kumulativ**
— ein `opacity-0` an der Gruppe lässt jedes Kind weiterhin «1» melden. Die Sonde
misst seither die Kette vom Artikel abwärts (`checkVisibility({ opacityProperty:
true })` sieht jede unsichtbare Vorfahrin) UND die Deckkraft der Gruppe selbst.
Erst danach biss die Probe (Tabelle oben). Der Rot-Weg im Kopf der Sonde nennt
darum ausdrücklich die **Gruppe**, nicht die Knöpfe.

*(Kein eigener Rot-Weg für (c): der Fall teilt sich den Test mit (b) und ist über
die Gleichung Zähler ↔ Listenlänge an ZPO 271 gemessen — der Rubrik «Verweise»,
die ohne jeden Shard auskommt und darum keine wartende Zusage ist.)*

## 4 · Screenshots (5)

- `d35f1-1440-hell-zu.jpg` — @1440 hell, **zu**: die Zeile am Ende von OR 336c,
  links «Bezüge · 11 Entscheide › · 1 Rechner ›», rechts «Zitat · Link ·
  Amtliche Fassung ↗» — sichtbar ohne Maus-Berührung, keine Rubrik offen.
- `d35f1-1440-hell-auf.jpg` — @1440 hell, **auf**: «11 Entscheide» aufgeklappt.
- `d35f1-1440-dunkel-auf.jpg` — dieselbe Stelle dunkel. Deutlich zu sehen: «11
  Entscheide ⌄» ist offen, «1 Rechner ›» daneben **bleibt zu** — je Rubrik ein
  Griff.
- `d35f1-390-hell-zu.jpg` — @390 hell, zu: dieselbe Zeile, die Aktionen brechen
  unter die Rubriken um; kein waagrechter Überlauf (von der Sonde gemessen).

- `d35f1-1440-hell-daneben.jpg` — @1440 hell, **nach dem Nachfix**: dieselbe
  Zeile mit allen VIER Aktionen «Zitat · Link · Amtliche Fassung ↗ · ⧉ Daneben
  öffnen».

Die vier ERSTEN Screens sind vor dem Nachfix entstanden und zeigen darum keinen
vierten Aktions-Knopf. Sie werden nicht neu aufgenommen — sie belegen ihren
Stand (Ziff. 2); den heutigen belegt der fünfte.

## 5 · Deklarierte Sonden-Anpassung (§6.3)

Vier Bestandssonden griffen über `summary.lr7-bez-zeile` bzw.
`details.lr7-bez[open]` auf die D34-Zeile zu. Da die Zeile kein `<details>` mehr
ist, nennt jede Sonde neu die Rubrik, die sie braucht — **die Zusagen sind Wort
für Wort unverändert, nur der Weg zum Aufklappen ist ein anderer**:

| Sonde | neu geöffnete Rubrik |
|---|---|
| `leser-bezuege-inhalt-d30.e2e.ts` | «m» (Materialien) |
| `leser-links-p3.e2e.ts` | alle — der Befund zählt die Links aller Rubriken |
| `popover-lesbar-d31.e2e.ts` | «r» (Entscheide) |
| `verweis-u.e2e.ts` | «g» (Verweise) |

Dazu kommt mit dem Nachfix eine **fünfte**, andersartige Anpassung:
`leser-v3-split-a34-bugs.e2e.ts` stellt Art. 684 im SETUP ausdrücklich an die
Bezugslinie (`scrollIntoView({ block: 'start' })` statt
`scrollIntoViewIfNeeded()`). Grund, Messung und Nachweis, dass keine Assertion
berührt ist: Ziff. 2a.

In `leser-bezuege-inhalt-d30` ist zusätzlich vermerkt, dass einer der dortigen
Rot-Wege (`ref`-Ruf entfernen ⇒ (a) rot bei gemerkt offener Zeile)
**gegenstandslos** geworden ist — der gemerkte Zustand existiert nicht mehr. Der
Beleg bleibt als Beleg SEINES Datums stehen und wird nicht nachgeführt (§2b);
ergänzt ist nur, welche Rot-Wege heute an seine Stelle treten.

---

**Geänderte Dateien:** `src/pages/gesetz-leser/parts/ArtikelLeser.tsx`,
`parts/BezuegeKopf.tsx`, `parts/ArtikelLeser.bezuegeFuss.tsx`,
`parts/ArtikelAktionen.tsx` (neu), `src/index.css`, `tailwind.config.js`,
`src/tests/leser-adresse-lm202.test.ts`, `src/tests/v2-c2-farbwoerterbuch.test.tsx`,
`e2e/leser-d35-f1-funktionszeile.e2e.ts` (neuer Wächter, Fall (f) mit dem
Nachfix), die vier Sonden aus Ziff. 5 sowie
`e2e/leser-v3-split-a34-bugs.e2e.ts` (Setup, Ziff. 2a),
`e2e/shard-gruppen.json` (Projektion, `gen:e2e-shards`), diese Datei,
fünf Screenshots.
