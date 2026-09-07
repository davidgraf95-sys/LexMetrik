# R5-F1G — D27: Der Reiter folgt der Lesestellung · a11y-Wurzel der Kopf-Suche · Blatt-Gruppen

**Auftrag:** Fixer 1g von W2·24-DESIGN-IDENTITAET — letzter Rahmen-Nachzug vor
der Landung. Vorlage: **D27** (David 6.9.2026), der a11y-Blocker aus
`e2e-pre-landung.log` und die zwei offenen Punkte aus Fixer 1i.
**Ausgangsstand:** `2ef37a69b` (Integrationszweig) · **Branch:** `feat/w2-24-r5-f1g`
**Bilder:** `r5f1g-*.jpg` in diesem Verzeichnis (@1440, hell).

---

## 1 · Was gebaut wurde

| Punkt | Gemessener Vorher-Stand | Gebaut |
|---|---|---|
| **D27** Lesestellung im Reiter | Beschriftung aus `TabEintrag.wahl` (dem Anker der ADRESSE); beim Scrollen unverändert «ZGB» | Beschriftung aus der **Lesestellung** (`TabEintrag.path`, vom Scroll-Spy geführt): «Art. 1 ZGB» → «Art. 17 ZGB» → «Art. 28g ZGB» |
| **D27** kein Flackern | — (Kurzform war EIN Textblock) | Kurzform in drei Teile (Kopf · **Stelle** · Kern); `.rl-stelle` reserviert `--app-reiter-stelle-b` = 60 px. Reiterbreite über drei Stände **konstant 137 px** (§2) |
| **a11y-Blocker** Kopf-Suche | `aria-valid-attr-value (critical)`: `aria-controls="_r_0_"` am Suchfeld, 6/10 rot | Das Warte-Panel IST der Combobox-Popup: `role=listbox` + `id` + `aria-busy`. 10/10 grün, plus deterministischer Wächter **E5** |
| **Blatt-Gruppen** | `/gesetze` & Co. standen im Überlauf-Blatt unter «Weitere» | `reiterKategorie` leitet aus dem **Bereichs-Präfix** ab; Blatt zeigt Gesetze 5 · Rechtsprechung 1 · Materialien 1 · Vorlagen 3 · Rechner 5, kein «Weitere» |
| **Rückbau** | `REG_HOVER_FLAECHE_REITER` (4 Klassennamen) ohne Konsumenten | gestrichen (§17-Gegengewicht); seit R11-R1 trägt jeder Reiter seine Registerfarbe dauerhaft, der Hover hebt nur die Deckkraft |
| **Nebenbefund** Wortfuge | Knopf las sich als «Art. 257dOR» (Lücke kam allein aus `gap-1`) | echtes Leerzeichen zwischen den Teilen — betrifft auch die ältere Fuge zum gekürzten Gericht («OGer AGHOR.2024.19»), WCAG 4.1.2 |

### Die Regel, die sich gedreht hat (§7-Offenlegung)

Der R2-Nachzug hatte F5 so gelöst: «die Beschriftung folgt der ADRESSE, nicht
dem Scrollen». D27 dreht das um. **Determinismus (§2) ist damit nicht
aufgegeben, sondern umformuliert:** «gleiche **Lesestellung** ⇒ gleiche
Beschriftung». Die Lesestellung ist der gespeicherte `path`, den der Scroll-Spy
des Lesers ohnehin führt (`aktualisiereTabArtikel`, 200 ms entprellt) — dieselbe
Quelle, aus der schon der `title` «gelesen bis Art. 336c» kommt (§5, keine
zweite Wahrheit). `wahl` bleibt Rückfall für das Fenster vor dem ersten
Spy-Lauf.

---

## 2 · Messungen (Preview 4373, gebautes `dist/`, Chromium @1440×900, hell)

**Lesestellung wandert, Breite nicht** — vier Reiter offen (ZGB · Gesetze · OR ·
Fristenrechner), im ZGB gescrollt:

| Stand | `window.scrollY` | Beschriftungen | Reiterbreiten (px) |
|---|---:|---|---|
| A | 0 | **Art. 1 ZGB** · Gesetze · OR · Fristenrechner | 137 · 115 · 148 · 154 |
| B | 5683 | **Art. 17 ZGB** · Gesetze · OR · Fristenrechner | 137 · 115 · 148 · 154 |
| C | 14827 | **Art. 28g ZGB** · Gesetze · OR · Fristenrechner | 137 · 115 · 148 · 154 |

Bilder: `r5f1g-leiste-stand-a|b|c-1440-hell.jpg`. Kein Reiter ändert seine
Breite, obwohl die Beschriftung dreimal wechselt.

**Textbreiten der Stelle** (`text-body-s`, Archivo) — daraus stammt das Token:

| Label | «Art. 1» | «Art. 97» | «Art. 28g» | «Art. 336c» | «Art. 1013» | «Art. 31–32» |
|---|---:|---:|---:|---:|---:|---:|
| px | 33.8 | 41.8 | 49.8 | 57.3 | 57.9 | 64.9 |

`--app-reiter-stelle-b: 3.75rem` (60 px) deckt jede Einzel-Stelle ab; nur
Bereichs-Labels wachsen darüber hinaus — dann einmal statt bei jedem Schritt.

**Split** (`r11`-Weg «Daneben öffnen», zwei Instanzen desselben Erlasses): beim
Scrollen im sekundären Fenster wechselt **genau eine** der beiden
Beschriftungen (Wächter (g)).

**Reload** — GEMESSEN und bewusst so: der Leser springt nach dem Neustart NICHT
an die alte Stelle zurück (Entscheid W2·10-UI-NAV/R4: kein Auto-Sprung, dafür
der «Weiterlesen»-Chip). Nach dem Reload steht man am Dokumentanfang, und der
Reiter sagt genau das («Art. 1 ZGB»). Die Zusage lautet deshalb «gleiche
Stellung ⇒ gleiche Beschriftung» — geprüft wird sie, indem nach dem Reload
erneut an dieselbe Stelle gescrollt wird und dieselbe Zeichenkette steht.

---

## 3 · Der a11y-Blocker — abweichend vom Auftrag (§7)

Der Auftrag nannte `scrollable-region-focusable` an `.lc-schwebeflaeche`. Die
Ausgabe in `e2e-pre-landung.log` nennt eine andere Regel und einen anderen
Knoten:

```
aria-valid-attr-value (critical): ARIA attributes must conform to valid values
— 1 Knoten, z. B. input | Invalid ARIA attribute value: aria-controls="_r_0_"
```

**Wurzel:** `HeaderSuche` meldet `aria-expanded` + `aria-controls={listboxId}`,
sobald etwas getippt ist. In den 120 ms der Entprellung ist `q` aber noch leer,
und `SuchResultate` rendert für diesen Fall ein Warte-Panel **ohne** `id` und
ohne `role` — die Referenz zeigte ins Leere. Weil der bisherige Wächter nur auf
`.lc-suchpanel` wartet (dieselbe Klasse trägt das Warte-Panel), traf er das
Fenster nur zufällig: **6/10**.

**Fix:** Das Warte-Panel ist der Popup — `role="listbox"`, `id={listboxId}`,
`aria-label`, `aria-busy` (das ARIA-Muster für eine ladende Listbox; ohne
`aria-busy` verlangte `aria-required-children` bereits Optionen). Damit greift
auch `scrollable-region-focusable` nicht mehr: die Regel nimmt genau das per
`aria-controls` referenzierte Combobox-Popup aus.

**10/10 grün** (`Startseite mit offener Kopf-Suche`, hell und dunkel je 10 Läufe).

---

## 4 · Rot-Proben (§6.7) — jede einmal gefahren

| Wächter | Eingriff | Gemessene Rot-Ausgabe |
|---|---|---|
| `tabGruppen.test` «Bereichs-Übersicht in ihrer Gruppe» | das Glied `p === \`/${kat}\`` streichen | 2 Fälle rot: `expected 'sonstiges' to be 'gesetze'` |
| `reiterKurzformD27.test` (D27-Quelle) | `hashVon(t.path) ?? t.wahl` → `t.wahl` | 5 Fälle rot: `expected 'ZGB' to be 'Art. 43a ZGB'` |
| `reiterKurzformD27.test` (Einzeiler) | `stelle` aus der Verkettung nehmen | 5 Fälle rot: `expected 'OR' to be 'Art. 336c OR'` |
| `w224-reiterverhalten (e)` | dieselbe Quell-Umkehr, im gebauten `dist/` | rot: `Received "ZGB"` statt `/^Art\. \S+ ZGB$/` |
| `a11y (e2e) E5` | `id={listboxId}` im Warte-Zweig streichen | **4/4** rot: `aria-controls=«_r_0_» zeigt auf 0 Elemente` — dieselbe Zeichenkette wie im Blocker |

---

## 5 · Deklarierte Test-Änderungen (§6.3)

- **`e2e/w224-reiterverhalten.e2e.ts` (e)** misst seit D27 das GEGENTEIL:
  scrollen ⇒ der Text wechselt. Drei Zusagen (Wechsel · gleiche Stellung über
  den Neustart · Kaltstart == SPA). Die geprüfte Sache ist unverändert die
  Reproduzierbarkeit der Beschriftung, nur ihr Bezugspunkt ist ein anderer.
- **Neu (g)**: im Split folgt jedes Fenster seiner eigenen Stellung.
- Helfer `beschriftungen` filtert leere Spannen (die Breiten-Reservierung steht
  auch ohne gemeldete Stellung im DOM).
- **`e2e/a11y.e2e.ts` E5** neu: solange das Feld ein Popup ankündigt, muss das
  angekündigte Element existieren — deterministisch statt 6/10.
- **`src/tests/reiterKurzformD27.test.ts`** neu (9 Fälle).
- **`src/tests/tabGruppen.test.ts`** um drei Fälle ergänzt.

---

## 6 · Zwei Werkzeug-Befunde nebenbei

1. **`page.mouse.wheel` ohne vorheriges `page.mouse.move`** liefert sein Rad an
   der Zeigerposition (0,0) ab — dort steht das Titelblatt, und der Leser
   scrollt keinen Pixel (`window.scrollY` blieb 0). Die bisherigen Fälle, die
   nach dem Rad «es hat sich NICHTS geändert» messen (`(D7 c)`, die alte
   Fassung von `(e)`), bestehen darum auch dann, wenn gar nicht gescrollt
   wurde. Für (e) korrigiert; die übrigen sind in ihrer Zusage unberührt,
   messen sie aber schwächer als gedacht — Nachzug-Kandidat.
2. **`e2e/a11y.e2e.ts` wartet auf `.lc-suchpanel`**, und diese Klasse trägt
   auch das Warte-Panel. Ein Wächter, dessen Vorbedingung zwei verschiedene
   Zustände erfüllen können, misst mal den einen und mal den anderen — das war
   die ganze Flatterhaftigkeit.

---

## 7 · Tore

`npm run lint` (0 Fehler, 1 vorbestehende Warnung) · `npx tsc -b` · `npm run test`
(7410 grün) · `check:design-tokens` · `check:perf-budget` (entry 52.3/60 KB) ·
`golden:vergleich` (**256 Fälle byte-gleich**) · `npm run build` · `check:e2e-shards`.
E2E gegen `dist/` auf 4373: `a11y` · `w224-reiterverhalten` ·
`w224-r11-reiterleiste` · `w224-kopfsuche-d23` · `w224-plus-reiter` ·
`w224-reiter-umordnen-d16` · `tastatur` — **115/115 grün**.

**Vorbestehend rot, NICHT von diesem Bau (Nullprobe gegen `2ef37a69b`):**
`src/tests/startseite-modul-links.test.ts` › «jedes Zeilen-Ziel existiert im
Nav-Bestand» — `/gesetze?ebene=bund#sys-staat` fehlt im Nav-Bestand. Liegt in
`start/**` (für diesen Auftrag TABU) und ist ein Landungs-Blocker des
Integrationszweigs.
