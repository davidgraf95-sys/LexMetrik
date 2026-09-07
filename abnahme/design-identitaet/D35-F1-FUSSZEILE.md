# D35-F1 · Die Funktionszeile am Artikelende

**Roadmap:** W2·24-DESIGN-IDENTITAET · **Zweig:** `feat/w2-24-d35-f1-fusszeile`
**Entscheid David 7.9.2026:** Variante A des D35-Vorschlags, Nachtrag wörtlich:
«das alles soll dann nur auf klick aufklappbar sein».
**Wächter:** `e2e/leser-d35-f1-funktionszeile.e2e.ts` (Shard-Gruppe 5).

---

## 1 · Was gebaut ist

Am Ende jedes Artikels steht EINE Zeile. Links die Rubriken dieses Artikels mit
ihren Zahlen, rechts seine Aktionen:

    Bezüge  11 Entscheide ›  1 Rechner ›            Zitat · Link · Amtliche Fassung ↗

Vier Zusagen aus dem Entscheid, je einzeln gemessen:

1. **Zu beim Laden.** Keine Rubrik steht offen. Der Merker der D34-Zeile
   (`lm.leser.bezuege-offen`) ist ersatzlos gelöscht — läge er noch, wäre «nur
   auf Klick» eine Absicht statt einer Zusage.
2. **Je Rubrik ein eigener Griff.** Ein Klick öffnet genau seine Rubrik. Bis D34
   öffnete EIN `<details>` alle vier zugleich.
3. **Aktionen dauerhaft sichtbar.** «Zitat · Link · Amtliche Fassung ↗» stehen
   mit Deckkraft 1 und WCAG-2.5.8-Höhe da, ohne dass die Maus etwas berührt —
   und GENAU EINMAL je Artikel: die alte Kopf-Variante unter `opacity-0` ist
   gelöscht, nicht gedoppelt (§5).
4. **Zähler = Liste.** Die Zahl auf dem Griff ist die Länge dessen, was er
   aufklappt (§8). Die M-6-Wurzel ist mit behoben: die CSS-Regel
   `html[data-leitfaelle=aus] .lc-leser [data-leitfall-zeile]` ist gestrichen —
   die Zeile zeigt, was sie zählt, auch bei «Rechtsprechung im Kopf aus».

## 2 · Abweichung vom Auftrag, offengelegt (§7): «⧉ Daneben öffnen» fehlt

Der Auftrag nennt als vierte Aktion «daneben öffnen». Der Knopf wurde gebaut und
GEMESSEN (7.9.2026, Preview :4435, `/gesetze/bund/OR#art-336_c` @1440) — er kann
an einem Artikel **nie erscheinen**:

- `istOffen` vergleicht `tabSchluessel(pathname + search)` (`Shell.tsx:301-303`).
- `tabSchluessel` streift den `#hash` ab (`usePaneLayout.ts:26`).
- `/gesetze/bund/OR#art-336_c` ist damit für die Pane-Steuerung derselbe Pfad wie
  `/gesetze/bund/OR` — und der steht immer offen, sonst stünde dieser Artikel gar
  nicht auf dem Schirm.
- `kannOeffnen && !istOffen(…)` ist an JEDEM Artikel jedes Erlasses false; der
  Knopf renderte nicht ein einziges Mal. Und würde er es doch, bliebe er
  wirkungslos: `Shell.tsx:357` führt dieselbe Sperre im Klick-Pfad noch einmal.

**Ein Knopf, der nie erscheinen kann, wird nicht gebaut** (§8; §17-Gegengewicht:
was nicht wirken kann, wird gestrichen statt bewacht). Der Weg, der WIRKEN würde,
wäre eine zweite Instanz desselben Erlasses (`?r=`-Diskriminator — `tabSchluessel`
behält ihn ausdrücklich); die Vergabe dieser Instanz-Nummer gehört der Fenster-
und Reiter-Mechanik (R13), nicht dieser Zeile. **Der Auftrag ist insoweit OFFEN**
und im PR als solcher gemeldet, nicht still übergangen. Der Weg zum zweiten
Fenster bleibt unterdessen, wo er heute steht: am Erlass-Kopf und an jedem
Norm-Popover.

## 3 · Rot-Proben (§6.7) — jede einzeln gefahren

Messbedingung durchgehend: eigener Worktree, Preview `:4435` aus **eigenem
`dist/`**, vor jeder Probe `npm run build` (Exit 0) und Neustart des
Preview-Servers — F11 (stale `dist/`) damit ausgeschlossen. `--workers=2`.

**Grün-Grundlage vor den Proben:** 6/6 grün (12.3 s).

| Fall | Mutation | Ergebnis | Meldung der Sonde |
|---|---|---|---|
| (a) zu beim Laden | `BezuegeKopf.tsx`: `useState({})` → `useState({ r: true, m: true, g: true, w: true })` | **ROT** | «eine Rubrik steht ungefragt offen» — Expected 0, Received **600** |
| (b) je Rubrik ein Griff | `BezuegeKopf.tsx`: `setOffen((s) => ({ ...s, [m.reg]: jetzt }))` → `setOffen({ r: jetzt, m: jetzt, g: jetzt, w: jetzt })` (D34-Sammelschalter) | **ROT** | `#art-271 .lr7-bez-block` — Expected 1, Received **2** |
| (d) Aktionen ohne Hover | `ArtikelAktionen.tsx`: Gruppe `<span className="lr7-bez-aktionen">` → `… opacity-0` (D34-Kopf-Kette) | **ROT** | «‹Zitat› steht mit Deckkraft 0 da» — Expected 1, Received **0** |
| (e) Skelett überreserviert nicht | `tailwind.config.js`: `'bez-skelett': '3rem'` → `'40rem'` | **ROT** | «Skelett 640 px, geladen 530 px — der Block SCHRUMPFT beim Laden, der Sprung ist nur verlegt» |

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

## 4 · Screenshots (4)

- `d35f1-1440-hell-zu.jpg` — @1440 hell, **zu**: die Zeile am Ende von OR 336c,
  links «Bezüge · 11 Entscheide › · 1 Rechner ›», rechts «Zitat · Link ·
  Amtliche Fassung ↗» — sichtbar ohne Maus-Berührung, keine Rubrik offen.
- `d35f1-1440-hell-auf.jpg` — @1440 hell, **auf**: «11 Entscheide» aufgeklappt.
- `d35f1-1440-dunkel-auf.jpg` — dieselbe Stelle dunkel. Deutlich zu sehen: «11
  Entscheide ⌄» ist offen, «1 Rechner ›» daneben **bleibt zu** — je Rubrik ein
  Griff.
- `d35f1-390-hell-zu.jpg` — @390 hell, zu: dieselbe Zeile, die Aktionen brechen
  unter die Rubriken um; kein waagrechter Überlauf (von der Sonde gemessen).

Auf keinem der vier Screens ein vierter Aktions-Knopf (Ziff. 2).

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
`e2e/leser-d35-f1-funktionszeile.e2e.ts` (neuer Wächter), die vier Sonden aus
Ziff. 5, `e2e/shard-gruppen.json` (Projektion, `gen:e2e-shards`), diese Datei,
vier Screenshots.
