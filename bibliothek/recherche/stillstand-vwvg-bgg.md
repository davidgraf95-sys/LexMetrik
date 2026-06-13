# Fristenstillstand — Verwaltungsverfahren (Art. 22a VwVG) und Bundesgericht (Art. 46 BGG)

**Erstellt:** 13.6.2026 (Auftrag David: «baue … den Verwaltungs-Stillstand
[Art. 22a VwVG] und den BGG-Stillstand [Art. 46 BGG] im Fristenrechner»).
**Stand:** OR/VwVG-Cache 20220701 (VwVG), BGG-Cache 20260401 — am Filestore-HTML
zeichengenau verifiziert.
**Status:** Erstrecherche, empirisch gegen Fedlex verifiziert; fachliche Abnahme
durch David ausstehend (Engine `src/lib/bggVwvgFristen.ts` = `entwurf`).

Speist: `src/lib/bggVwvgFristen.ts` (Engine) + `EinfacheFristForm.tsx`
(zwei neue Ferien-Optionen). Geteilte Infrastruktur (Perioden/Ruhen):
`src/data/zpoFeiertage.ts` + `src/lib/fristenEngine.ts`.

## 1 · Quelle + Stand

- **VwVG Art. 22a** (Stillstand der Fristen), Art. 20 Abs. 3 (Werktag-
  verschiebung) — Filestore `cc/1969/737_757_755`, Konsolidierung 20220701,
  Anker `art_22_a` / `art_20`.
- **BGG Art. 46** (Stillstand), Art. 45 Abs. 1 (Ende) — Filestore
  `cc/2006/...`, Konsolidierung 20260401, Anker `art_46` / `art_45`.
- Gegenprobe ZPO Art. 145/146 (Perioden identisch) — bereits in
  `zpoFristen.ts` verdrahtet.

## 2 · Regel deterministisch

**Drei Stillstandsperioden (für alle drei Regimes IDENTISCH):**

| Periode | Beginn | Ende (inklusiv) |
|---|---|---|
| Ostern | 7. Tag vor Ostern | 7. Tag nach Ostern |
| Sommer | 15. Juli | 15. August |
| Jahreswechsel | 18. Dezember | 2. Januar |

**Mechanik (Ruhen):** Während dieser Perioden ruht die Frist; die
Stillstandstage werden nicht mitgezählt. Fällt das Ende in eine Periode,
läuft die Frist am Tag nach dem Periodenende weiter. Identisch zur ZPO
(Art. 145/146); umgesetzt über die geteilte `fristenEngine`
(`endregel: 'ruhen_weiter'`).

**Werktagsverschiebung des letzten Tages:** Ist der letzte Tag ein Samstag,
Sonntag oder anerkannter Feiertag, endet die Frist am nächstfolgenden
Werktag. Massgebend sind die Feiertage am Wohnsitz/Sitz der Partei
(Art. 20 Abs. 3 VwVG bzw. Art. 45 Abs. 1 BGG).

## 3 · Geltungsbereich und Ausnahmen

**Geltungsbereich — NUR «nach Tagen bestimmte» Fristen** (Art. 22a Abs. 1
VwVG / Art. 46 Abs. 1 BGG, Wortlaut «Gesetzliche oder behördliche / nach
Tagen bestimmte Fristen»). Das ist der entscheidende Unterschied zur ZPO
(Art. 145 ZPO kennt diese Schranke nicht): **Wochen-, Monats- und
Jahresfristen stehen unter VwVG/BGG NICHT still** — sie erfahren nur die
Werktagsverschiebung am Ende. Die Engine verzweigt darauf
(`stillstandAktiv = einheit === 'tage'`) und legt die Nichtgeltung als
Warnung offen.

**Ausnahmen (Abs. 2) — je Regime verschieden, KEIN Kollaps (§1/§4):**

- **VwVG Art. 22a Abs. 2** — kein Stillstand in Verfahren betreffend:
  a) die aufschiebende Wirkung und andere vorsorgliche Massnahmen;
  b) die öffentlichen Beschaffungen.
- **BGG Art. 46 Abs. 2** — kein Stillstand in Verfahren betreffend:
  a) die aufschiebende Wirkung und andere vorsorgliche Massnahmen;
  b) die Wechselbetreibung; c) Stimmrechtssachen (Art. 82 Bst. c);
  d) die internationale Rechtshilfe in Strafsachen und die internationale
  Amtshilfe in Steuersachen; e) die öffentlichen Beschaffungen.

Diese Ausnahmen erkennt die Engine NICHT automatisch (sie hängen am
Verfahrensgegenstand); sie werden offengelegt («in diesen Verfahren
‹Keine Ferien› wählen»).

## 4 · Pflegebedarf

Keine datierten Parameter (die Perioden sind kalendarisch fix; das
Osterdatum berechnet `zpoFeiertage.ts`). Bei einer Revision von Art. 22a
VwVG / Art. 46 BGG (Ausnahmenkatalog) ist der `REGIME`-Block der Engine
nachzuführen. Nicht im Parameter-Verfallsregister zu führen (keine datierten
Werte).

## 5 · Abnahme-Status

Erstrecherche, empirisch verifiziert (Anker + Absatztext am Filestore-HTML,
`check:zitate` 0 Befunde). Fachliche Abnahme durch David ausstehend.
