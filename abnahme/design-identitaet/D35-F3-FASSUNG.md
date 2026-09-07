# D35-F3 · «Änderungen anzeigen als: Fassung | Fussnoten | aus»

**Bau-Einheit** W2·24-DESIGN-IDENTITAET · D35, Fixer F3
**Entscheid David 7.9.2026**, wörtlich: «es soll entweder fassung oder fussnoten
angezeigt werden. also entweder fassung, fussnoten oder aus» — und zur Variante:
**«A und verlustfrei»**
**Zweig** `feat/w2-24-d35-f3-fassung`, Basis `21c1ddd63` (= F4-Zweig, PR #752)
**Stand** 7.9.2026 · nur Darstellung (§3), keine Rechtslogik, kein Korpus berührt

---

## 1 Klartext (für David)

Bisher waren «Fussnoten» und «Fassung» **zwei getrennte Schalter**, und beide
konnten gleichzeitig an sein — genau das Bild, das dir aufgefallen ist. Jetzt ist
es **eine Wahl mit drei Stellungen**, wie du es beschrieben hast.

Wichtig ist die Grenze, die wir dabei gezogen haben: die Wahl schaltet **nur die
Änderungsgeschichte** — also die Fussnoten der Sorte «Fassung gemäss Ziffer I des
Bundesgesetzes vom …» und die daraus gebaute Zeile «Gilt seit …». **Alle anderen
amtlichen Fussnoten bleiben in jeder Stellung stehen.** Am ZPO sind das 101 von
313 Einträgen — ein Drittel. Hätten wir «Fassung» wörtlich als «Fussnoten aus»
gebaut, wären diese 101 amtlichen Fussnoten mit verschwunden; das wäre
Substanzverlust, kein Aufräumen (§7/§8).

**Was du im Ausdruck bekommst, ändert sich nicht:** gedruckt wird der Apparat
immer vollständig. Ein Ausdruck, dem amtliche Fussnoten fehlen, weil am
Bildschirm eine Einstellung stand, wäre ein unvollständiges Dokument.

**Eine sichtbare Folge, die du kennen solltest:** die Vorgabe ist «Fassung» (weil
vorher beide Schalter an waren). Beim Bundesrecht sind die meisten Fussnoten
Änderungsvermerke — im Grundzustand stehen also deutlich weniger Fussnoten am
Artikel als vorher. Eine Stellung weiter («Fussnoten») ist alles wieder da.

**Wartet auf dich:** ob es zusätzlich einen eigenen, klar benannten Schalter
«Fussnoten-Apparat» geben soll, der wirklich *alles* wegblendet. Den gab es bis
jetzt versteckt als Nebenwirkung; er ist mit dieser Runde weggefallen. Empfehlung:
erst mal ohne — wer ohne Apparat lesen will, hat den Druck-Weg und die amtliche
Fassung.

---

## 2 Befund (gemessen, nicht behauptet)

Alle Zahlen aus dem D35-Bericht Teil 3 (Vorstand `cfa8a9f81`, 7.9.2026, ZPO
@1440) und aus der Nachmessung unten. Sie werden **nicht nachgeführt**
(§0 Ziff. 2b).

| # | Befund | Messwert |
|---|---|---|
| B1 | «Fussnoten» und «Fassung» waren **unabhängig**; alle vier Kombinationen erreichbar. | 2 × 2 Stellungen, Art. 271 900 / 863 / 861 / 898 px |
| B2 | Ihre Wirkungen sind **disjunkt**: «Fussnoten» schaltete Apparat **und** Marker aller Klassen, «Fassung» nur den abgeleiteten Slot. | `[data-fn-apparat]` 157 → 0 · `[data-hist-slot]` 417 → 0 |
| B3 | Der Fassungs-Slot wird **ausschliesslich aus den `kl:'A'`-Fussnoten** gebaut (`scripts/normtext/historie-generieren.ts` → `baueArtikelHistorie`). Für diese Klasse sind «Fassung» und «Fussnoten» wirklich zwei Bilder derselben Auskunft — Davids Intuition trifft zu. | — |
| B4 | Eine Radiogruppe **im Wortsinn** hätte im ZPO 99 amtliche Nicht-Änderungs-Fussnoten mitgenommen. | `kl:A` 212 · `kl:V` 96 · `kl:U` 3 (32 % nicht-A) |
| B5 | Kantonsrecht trägt **gar keine** `kl`-Klassifikation (`src/lib/normtext/browse.ts`) und **keinen** Historie-Shard. | 0 von 209 Shards kantonal; 40 geprüfte Kanton-Sidecars, 0 mit `kl` |

---

## 3 Soll und Fix

| Soll (Auftrag) | Fix | Ort |
|---|---|---|
| **Eine** Radiogruppe «Änderungen anzeigen als: ○ Fassung ○ Fussnoten ○ aus» | neuer Baustein mit `role="group"`, drei `menuitemradio`, Marke `punkt` (die Form, die D35-F4 für genau diesen Fall vorgesehen hat) | `src/pages/gesetz-leser/v3/LeserAenderungsWahl.tsx` (neu, 119 Z.) |
| «Fassung»: Slot + Zeitleiste an, `kl:'A'` samt Markern aus, V/G/Z/U bleiben | `html[data-vermerke="fassung"] .lc-leser [data-fn-klasse="A"] { display:none }` | `src/index.css` |
| «Fussnoten»: voller Apparat, Slot aus | `html[data-vermerke="fussnoten"] .lc-leser [data-hist-slot]` | `src/index.css` |
| «aus»: beides aus, übriger Apparat bleibt (verlustfrei) | dieselben zwei Regeln zusammen | `src/index.css` |
| Kein zweiter Zustand für dieselbe Frage (§5) | zwei Booleans → **ein** Feld `vermerke`, **ein** Attribut `data-vermerke` | `leserOptionen.ts` |
| Migration ohne stilles Kippen (§8) | `an/an` und `aus/an` → **Fassung** · `an/aus` → **Fussnoten** · `aus/aus` → **aus**; Alt-Schlüssel `hist` speist die Regel weiter | `leserOptionen.ts` `ausAltenSchaltern` |
| Druck-Ansicht unverändert | die A-Dämpfung liegt in `@media screen`; der Slot folgt der Wahl wie bisher | `src/index.css` |
| Kein leerer Apparat-Rahmen | `data-fn-nur-a` **in React** entschieden — eine `:has()`-Regel über 1686 Artikel ist die von W2·19/F1 belegte Scroll-Bremse (§15) | `parts/ArtikelLeser.tsx` |
| §8 auf unklassifizierten Erlassen | Hinweiszeile + `aria-describedby`, wenn `kl:'A'` = 0; ohne Vermerke wird die Wahl gar nicht angeboten (D1) | `LeserAenderungsWahl.tsx` |
| Such-Ehrlichkeit folgt | Malbarkeit `'fussnoten'` → `'aenderung'`; nur A-Treffer tragen «(ausgeblendet)» | `leserSuche.ts`, `inhalt-suchtreffer.tsx` |
| ↑/↓ erreichen die Wahl | `menuitemradio` in `EINTRAG` aufgenommen | `v3/menueTasten.ts` |

---

## 4 Matrix nachher (gemessen 7.9.2026, ZPO, @1440 hell, dsf 2)

Messbedingung: gebautes `dist/` über `vite preview` auf :4434, Sprung auf
`#art-271`, 3 s Wartezeit + Scroll, `checkVisibility()`; die Seiten-Zahlen sind
der gerenderte Ausschnitt (`content-visibility: auto`), nicht der ganze Erlass.

| Stellung | Apparat-Zeilen sichtbar | davon `kl:A` | **nicht-A** | Marker | `[data-hist-slot]` | «Gilt seit …» | Höhe Art. 271 |
|---|---|---|---|---|---|---|---|
| **Fassung** (Vorgabe) | 101 | **0** | **101** | 118 | 417 | 131 | 900 px |
| **Fussnoten** | 313 | **212** | **101** | 320 | 0 | 0 | 898 px |
| **aus** | 101 | **0** | **101** | 118 | 0 | 0 | 898 px |

**Der Beweis der Verlustfreiheit steht in der vierten Spalte:** 101 nicht-A-Zeilen
in **allen drei** Stellungen. Die 212 A-Zeilen sind die einzige Menge, die
wechselt — genau H0-Auflage 1.

Höhenunterschied beim Umschalten: 2 px an Art. 271 (der Slot). Klick-getrieben,
also input-exkludiert ⇒ kein CLS-Beitrag; eng gemessen in
`e2e/leser-optionen.e2e.ts` («A1-Mechanik … kein CLS», Beobachter installiert,
EIN Umschaltvorgang, 0.0).

**Screenshots** (hell @1440, ZPO Art. 271, Menü offen):
`d35-f3-fassung.jpg` · `d35-f3-fussnoten.jpg` · `d35-f3-aus.jpg`.

---

## 5 Wächter und Rot-Proben (§6.7)

| Wächter | Was er hält |
|---|---|
| `e2e/w224-d35-f3-vermerke.e2e.ts` (neu, Gruppe 8) | die BEDIENUNG: drei `menuitemradio`, genau eine gesetzt, Kreis-Marke, Gruppentitel, Idempotenz, ↑/↓ erreichen sie, alle vier Bestands-Kombinationen migrieren im Browser, MONTREAL zeigt die Hinweiszeile samt `aria-describedby` |
| `e2e/hist-ansicht-w25i.e2e.ts` (umgeschrieben) | die WIRKUNG: A weg in «Fassung»/«aus», V/G/Z/U immer da, A-only-Apparat samt Rahmen weg, DOM vollständig, Persistenz/Pre-Paint, H0-Auflage 1 an ELG Art. 10 (A+G+U auf einem Artikel), Kanton ohne Wahl, axe |
| `src/tests/leser-optionen-migration.test.ts` | Davids Tabelle DOM-frei, plus «das Ergebnis trägt genau zwei Schlüssel» |
| `src/tests/fussnoten-toggle-huellenneutral.test.ts` | neu **H0-Auflage 1 als Tor**: `index.css` darf `[data-fn-klasse="V"|"G"|"Z"|"U"]` nirgends selektieren |
| `e2e/helpers/vollerApparat.ts` (neu) | die Extraktions-Sonden stellen den vollen Apparat ein — an EINER Stelle (§5) |

**Rot-Proben** — siehe Ziff. 8.

---

## 6 Deklarierte Test-Anpassungen (§6.3)

Alle zitierten **zwei unabhängige Schalter** oder das Attribut, das es nicht mehr
gibt; die geprüfte Aussage bleibt in jedem Fall dieselbe.

`leser-optionen` · `leser-kopf-v2` · `leser-v3-umschalten` · `leser-v3-kopf` ·
`leser-lesemass` · `leser-v3-split-a34-bugs` · `leser-w224-g` ·
`w224-d35-f4-menue` · `a31a-fussnote-inline` · `bild-block-items` ·
`fn5-wortposition` · `fussnote-absatz-altform` · `src/tests/leser-schriftskala` ·
`src/tests/leser-suche-w219` · `src/tests/leser-benennung` ·
`src/tests/leser-v3-bauteile`.

Zwei **Prüfmechanik**-Fehler mitbehoben (keine Aussage-Änderung):
`ansichtOeffnen` war in zwei Specs nicht idempotent (ein zweiter Klick klappte das
Menü zu), und der Verweis-Link-Fall griff den ersten statt den ersten
**sichtbaren** Treffer.

---

## 7 Abweichungen vom Auftrag (offengelegt, §7)

**A-1 · Kantonsrecht bekommt keine Hinweiszeile, sondern gar keine Wahl.**
Der Auftrag sah vor, dass die Radiogruppe auf Kantonsrecht «ehrlich «Fussnoten»
ohne A-Dämpfung» zeigt. Gemessen (7.9.2026) trägt Kantonsrecht **weder** `kl`
**noch** einen Historie-Shard — alle drei Stellungen hätten dort dieselbe Wirkung,
also gar keine. Ein Steuerelement mit drei identischen Stellungen ist das tote
Steuerelement, das D1 gerade abgeschafft hat (§8). Die bestehende D1-Regel
(`bieteAenderungsvermerkeSchalter`) entscheidet darum unverändert, ob die Wahl
überhaupt erscheint; die Hinweiszeile greift für die **zwei** Bund-Erlasse mit
Fassungs-Zeile, aber ohne `kl:'A'` (MONTREAL, PVUE — Korpus-Messung 17.8.2026).

**A-2 · Der Apparat-Schalter fällt ersatzlos.** Mit `fussnoten` verschwindet die
einzige Bedienung, die den amtlichen Nicht-Änderungs-Apparat verbergen konnte.
Das ist die Verlustfreiheit von der anderen Seite gelesen und im Auftrag so
angelegt; benannt statt versteckt (`leserOptionen.ts`, Typ `VermerkeWahl`). Ob
ein eigener, klar benannter Schalter «Fussnoten-Apparat» nachkommen soll, ist
Davids Entscheid.

**A-3 · Die CLS-Zusage steht an EINER Stelle.** Sie stand in beiden Specs; in
`hist-ansicht-w25i` mass sie über drei Umschaltungen samt Scroll-Fahrten und traf
0.000153 statt 0 — ein **Nachlade**-Shift des idle-Historie-Shards, kein
Klick-Shift. Ein Beobachter, der Nachladen mitmisst, sagt über den Klick nichts
aus (§6.7). Die enge Messung bleibt in `leser-optionen`.

**A-4 · Kollision gemeldet, nicht doppelt gebaut (§0 Ziff. 5).** PR #744 (D34,
Bezüge-Zeile ans Artikelende) berührt ebenfalls `parts/ArtikelLeser.tsx`. Diese
Runde fasst dort **eine** Zeile an (`data-fn-nur-a` am Apparat-`<div>`); ein
Konflikt beim Landen ist klein und mechanisch.

---

## 8 Rot-Proben (§6.7 — jede einmal gefahren)

### R-1 · Die Migrations-Tabelle (Unit, gefahren 7.9.2026)

Eingriff: in `leserOptionen.ts` `ausAltenSchaltern` die zwei Zeilen vertauscht
(`hist === 'an'` liefert «fussnoten» statt «fassung»).

```
 ❯ src/tests/leser-optionen-migration.test.ts (14 tests | 11 failed)
   × fussnoten=an · histansicht=an ⇒ «fassung»      AssertionError: expected 'fussnoten' to be 'fassung'
   × fussnoten=an · histansicht=aus ⇒ «fussnoten»   AssertionError: expected 'aus' to be 'fussnoten'
   × fussnoten=aus · histansicht=aus ⇒ «aus»        AssertionError: expected 'fassung' to be 'aus'
   × leerer Speicher ⇒ Vorgabe: Fassung sichtbar    - "vermerke": "fassung" / + "vermerke": "fussnoten"
   … 11 von 14 rot
```

Zurückgenommen (`git checkout`), danach 14/14 grün.

### R-2 · H0-Auflage 1 als Tor (Unit, gefahren 7.9.2026)

Eingriff: in `src/index.css` `[data-fn-klasse="V"]` neben den A-Selektor gesetzt.

```
 FAIL  src/tests/fussnoten-toggle-huellenneutral.test.ts
   > H0-Auflage 1: KEINE Regel dämpft eine andere Fussnoten-Klasse als A
   AssertionError: src/index.css selektiert [data-fn-klasse="V"] — H0-Auflage 1 verletzt
```

Zurückgenommen, danach 6/6 grün. *(Nebenbefund mitbehoben: die Zusicherung lief
über `expect(css).not.toContain(...)` und warf im Fehlerfall den Diff einer
4100-Zeilen-Datei aus — jetzt `expect(css.includes(...)).toBe(false)`, T5.)*

