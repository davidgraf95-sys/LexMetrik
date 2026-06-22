# Design-Spec: Kantonale Tarif-Tabellen — Zahlen & Tabellen richtig darstellen (Stufe 1)

**Datum:** 2026-06-22 · **Auftrag David:** «überarbeite die kantonalen Gesetze,
sodass insbesondere Zahlen und Tabellen richtig dargestellt werden.» · **Ansatz
(von David gewählt):** Generator-Extrakt, gestuft (§7-sauber, nicht UI-Heuristik).

## Problem (belegt)

Kantonale Gesetzestexte kommen aus PDF-Extraktion (`scripts/normtext/adapter-pdf.ts`,
Profile sz|ti|vd|ju|olexAt|olexPar). Tabellen/Spalten kollabieren bei der
Extraktion zu einem Fliesstext. Drei Defektklassen:

1. **Füllpunkt-Zweispalter** (Zielklasse Stufe 1): zweispaltige Tarife, deren
   Spalten durch Punkt-Leader getrennt sind. Betroffen (SG, Quelle
   `gesetzessammlung.sg.ch` PDF, Profil olex):
   - `public/normtext/kanton/SG-2935.json` — GB-GebV/GebT Beurkundungen
   - `public/normtext/kanton/SG-3849.json` — GB-GebV/GebT Beurkundungen
   - `public/normtext/kanton/SG-2808.json` — Gerichtskostenverordnung (GKV)
   - Beispiel-Ist: `"Schuldübernahmeanzeige(Art.834Abs.1ZGB ) … . . . . . . . . 30.–"`
     und `"Ehevertrag … im Rahmen von . . . . . . 200.– bis 2000.–"`.
   - Soll: zwei Spalten — Beschreibung links, Betrag rechtsbündig.
2. **Verklebte Tokens** an Spaltengrenzen: `2Promille`, `(Art.834Abs.1ZGB`
   (Lücken-Heuristik `baueZeile` greift dort nicht).
3. **über/bis-Staffeln**: aktuell vom UI heuristisch zerschnitten
   (`ArtikelBody.tsx` `staffelZeilen`/`normalisiereTarifText`) — am falschen Ort.

**Wichtig (§3/Schichten):** Die normtext-Snapshots sind reine *Anzeige* für die
«Gesetze»-Browse-Ansicht. Die Rechen-Engines haben EIGENE Tarifdaten — diese
Arbeit berührt KEINE Berechnung. §1-Risiko damit auf Darstellungstreue begrenzt:
Inhalt (Beschreibung, Betrag) exakt wie Quelle, nichts erfinden/umrechnen.

## Scope Stufe 1 (diese Lieferung)

Nur **Defektklasse 1 (Füllpunkt-Zweispalter)**, end-to-end für die 3 SG-Snapshots,
inkl. Token-Entklebung an der Spaltengrenze (Defektklasse 2), soweit sie in genau
diesen Tabellenzeilen auftritt. Defektklasse 3 + andere Profile = spätere Stufen.

## Architektur / Komponenten

### 1. Extraktion — `scripts/normtext/adapter-pdf.ts`
- **Füllpunkt-Detektor (rein, deterministisch, §2):** Eine Body-Textzeile, die
  einen Punkt-Leader-Lauf enthält (Regex ~`/\.(?:\s?\.){3,}/` — ≥4 Punkte, ggf.
  mit Einzel-Leerzeichen), ist eine Tarif-Tabellenzeile:
  - **links** = Beschreibung (vor dem Leader, getrimmt),
  - **rechts** = Betrag (nach dem Leader, getrimmt; z.B. `30.–`, `200.– bis 2000.–`).
  - Leader-Punkte werden entfernt (sie sind Layout, kein Inhalt).
- **Token-Entklebung** nur am Spaltenrand der erkannten Tabellenzeile (z.B.
  `2Promille`→`2 Promille`) über die bestehende x-Lücken-Information bzw. eine
  eng begrenzte Regel; KEINE globale Ziffer-Trennung (§1: keine erfundenen Splits).
- Erkennung greift nur, wenn der Leader-Lauf eindeutig ist — sonst Zeile
  unverändert als normaler `text` (kein Fehlschnitt normaler Absätze).

### 2. Datenmodell — `PdfBlock` + Snapshot-JSON
- Additives optionales Feld am Block:
  ```ts
  tabelle?: Array<{ beschreibung: string; betrag: string }>;
  ```
- `text` bleibt erhalten (Fallback + Drift-SHA-Basis weiter über Text+items;
  `tabelle` fliesst in den `sha` ein, damit Drift erkannt bleibt — §7 d).
- Rein additiv: bestehende Snapshots ohne `tabelle` bleiben gültig.

### 3. Render — `src/components/normtext/ArtikelBody.tsx`
- Hat ein Block `tabelle`, rendert er eine echte 2-Spalten-Tabelle:
  Beschreibung links, Betrag rechtsbündig, `[font-variant-numeric:tabular-nums]`,
  dezente Trennlinien (gleiche Optik wie `StaffelTabelle`).
- Fällt `tabelle` weg, bleibt der bisherige Pfad (`staffelZeilen`/Text) unberührt.

## Datenfluss
PDF → `adapter-pdf.ts` (Füllpunkt-Detektor erzeugt `tabelle` je Block) →
`public/normtext/kanton/SG-*.json` (Feld `tabelle`) → `ArtikelBody` (2-Spalten).

## Verifikation (§6/§7) — und iterativer Logik+Bug-Check (Daueranweisung David)

**Daueranweisung:** «immer wieder Logik- und Bug-Check durchführen» — nach JEDEM
Teilschritt (nicht nur am Ende): rechtslogische Prüfung (stimmt Beschreibung↔Betrag
exakt zur Quelle? keine Zeile verschluckt/erfunden?) + Bug-Check (Regex-Kanten,
Mehrfach-Leader, Beträge mit «bis»/Spannen, Nicht-Tarif-Zeilen mit Punkten).

- **Unit-Tests** gegen Fixtures echten extrahierten SG-Texts (Füllpunkt-Zeilen,
  Spannen-Beträge, knifflige Beschreibungen) — analog `normtext-pdf-adapter.test.ts`.
- **Regeneration** der 3 SG-Snapshots: `npm run normtext -- --datum=$(date +%F)
  --nur=kanton --kanton=SG` (braucht Netz: gesetzessammlung.sg.ch). Danach
  `npm run normtext:register` falls Register betroffen.
- **Manuelle Sichtprüfung** des Diffs jeder der 3 Snapshots: jede Tarifzeile
  Beschreibung/Betrag gegen die amtliche PDF gegengeprüft (§7, doppelt verifiziert).
- **Tore:** `npm run gate` grün; `check:normtext` grün (neue `tabelle`-Felder in
  Drift/Golden aufgenommen); Golden bewusst aktualisiert (Struktur-Änderung,
  deklarierter fachlicher Schritt, kein stilles Aufweichen — §6 Ziff. 3).
- **Adversarialer Bug-Check** am Ende: unabhängiger Durchgang, der gezielt
  Fehlschnitte und veränderten Inhalt sucht.

## Nicht in Scope (spätere Stufen)
- über/bis-Staffeln aus UI-Heuristik in den Generator ziehen.
- Weitere PDF-Profile / weitere Kantone mit Tabellen.
- Generische Token-Entklebung über alle Snapshots.

## Risiken
- Netzabhängigkeit der Regeneration (Quelle erreichbar? Drift seit letztem Stand?).
- Füllpunkt-Regex zu gierig → normale Absätze mit «…» fälschlich gesplittet
  (Gegenmittel: ≥4-Punkte-Schwelle + Betrag-Plausibilität rechts).
- Beträge als Spannen/Verweise («200.– bis 2000.–», «nach Aufwand») — betrag-Feld
  muss freitextfähig sein, nicht nur eine Zahl.

## Deploy
Push/Deploy erst nach Davids ausdrücklichem Ja (§9). Diese Stufe endet mit grünem
Gate + Sichtprüfung; Deploy separat.
