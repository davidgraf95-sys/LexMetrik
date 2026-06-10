# Fahrplan: Engine-Vereinheitlichung (gleiche Logik-/Rechenbasis)

Stand: 10.6.2026 (Auftrag David: «erstelle handlungsplan um engines die auf
gleicher logik/rechenbasis basieren zu vereinheitlichen»). Rahmen: neuer
**CLAUDE.md §4** — Verschmelzung erlaubt, aber strikt **§6-Golden-gegated**
und **regime-treu** (interne Verzweigung statt Kollaps); §1/§3 unangetastet.
Voraussetzung erfüllt: Golden-Basis ist committet und CI-gegated (G2/A1).

## 0 · Bestandsaufnahme — was BEREITS eine Quelle hat

Geteilt sind heute: `fristenEngine.ts` (Kalender-/Stillstandskern — konsumiert
von zpoFristen, schkgFristen, allgemeineFrist) · `datumsUtils.ts` ·
`bruch.ts` · Querschnitt (permalink/icsExport/begruendung/pdf/bge/fedlex) ·
UI-Rahmen (wizard/Dokumentmappe/ui/Tabs/SelectionGrid) · Bericht-Mapper-
Muster (G3.1). Die Vereinheitlichung ist also **Rest-Dubletten-Arbeit**,
kein Neuaufbau.

## TABU (Regime-Grenzen — werden NIE fusioniert)

- Die drei Zuständigkeits-Engines (zivil/schkg/straf) und ihre
  Rechtsmittel-Zweige: eigene Verfahrensordnungen, Daueranweisung §4-Kern.
- Materielle Regimes untereinander (Verjährung OR ≠ DBG ≠ StGB; Miet- ≠
  Arbeits-Kündigungsrecht): Sie dürfen denselben RECHENRAHMEN nutzen,
  nie dieselbe Regel.
- Engines mit eigenem Berechnungs-Regime werden nicht in den Tagerechner
  gefaltet (das regelt der §0-Mehrwert-Test, umgekehrte Richtung).

## Die Stufen (risikoarm zuerst; jede Stufe einzeln durch die Tore)

### V1 · Termin-/Monatsende-Arithmetik → EINE Quelle in `datumsUtils.ts`
**Befund:** `sperrfristen.ts` nutzt `endOfMonth` aus date-fns direkt
(Z. 569), `kuendigungsfrist.ts` via `datumsUtils.letzerTagDesMonats`;
der Schalttag-Clamp (setDate(0)-Fix der Perfektions-Runde) lebt lokal.
**Schritt:** Monatsende-Erstreckung + Schalttag-Clamp als benannte Helfer
in `datumsUtils.ts`; sperrfristen/kuendigungsfrist (und mietrecht, falls
Dublette) konsumieren. **Risiko: klein** (reine Arithmetik, dichte Tests).

### V2 · Preset-Rahmen ZPO/SchKG
**Befund:** `ZpoPreset`/`SchkgPreset` sind strukturgleiche Typen mit
gleichen Konventionen (hinweis/fristnatur/ausloeser/verweise);
Warn-Bausteine (MATERIELL_WARNUNG) leben nur ZPO-seitig.
**Schritt:** gemeinsamer generischer Preset-Typ + geteilte Warn-Bausteine
in einem `presetRahmen.ts`; Presets selbst bleiben je Regime-Datei.
**Risiko: klein** (Typ-/Text-Ebene, byte-golden).

### V3 · Fristen-Restdubletten hinter `fristenEngine.ts`
**Befund:** `verjaehrung.ts` führt eigene `rohesEnde`/`mitStillstand`/
`werktagsEnde` (Z. 132/159/180) — konzeptgleich mit fristenEngine-Bausteinen
(Ruhen-Verlängerung, Endnormalisierung), aber materiell anders begründet
(Art. 132/134 OR statt Art. 142 ff. ZPO). `gewaehrleistung`/`erbFristen`
prüfen. **Schritt:** Inventur-Skript (welche Datums-Helfer existieren
mehrfach?) → je Einzelfund entscheiden: in den Kern heben (wenn fach-
NEUTRAL) oder als bewusste Regime-Kopie kommentieren (§1: lieber Duplikat
als falsche Abstraktion). **Risiko: mittel** — nur mit byte-gleichem
Golden + Sweep; Fehlrichtungs-Gefahr bei Stillstandsbegriffen.

### V4 · Gesellschafts-Geldkern (Liberierung/Kapital)
**Befund:** `effektiveLiberierung()` ist die EINE Geld-Quelle der AG;
GmbH-Dokumente (Volliberierung zwingend, 777c) und Kapitalerhöhung Stufe 2
haben eigene Geld-Sätze. **Schritt (vorbereitend, da GmbH-Bau §0a-gesperrt):**
Extraktion des AG-Geldkerns nach `vorlagen/kapitalKern.ts` (AG konsumiert,
byte-golden inkl. 87er-Matrix + AG-Sweep 3264); GmbH/KE docken erst beim
G-Programm an. **Risiko: mittel** (grosse Datei, aber Golden deckt 13
Schemas/194 Bausteine).

### V5 · Verjährungs-RAHMEN (Vorbereitung künftiger Regimes)
**Ziel:** relativ/absolut-Paar + Unterbrechungs-/Hemmungs-Kette als
generischer Rahmen, damit steuer-verjaehrung (DBG 120/121, Rangliste C)
und straf-verjaehrung (97 ff. StGB) bei §0a-Öffnung NICHT die Mechanik
duplizieren. **Schritt:** erst NACH V3; Rahmen aus verjaehrung.ts
extrahieren, OR-Regime als erste Instanziierung (byte-golden).
**Risiko: mittel-hoch** — nur als letzte Stufe, einzeln deklariert.

## Verfahren je Stufe (verbindlich, §6)

1. `npm run golden:vergleich` IDENTISCH als Startbedingung.
2. Umbau OHNE Testanpassung; Regimes intern verzweigt halten.
3. Tore: tsc · Suite · Lint (voll) · Build · `npm run check` ·
   `golden:vergleich` byte-gleich · bei Fristen-Stufen zusätzlich Sweep-
   Protokoll im Commit.
4. Abbruchkriterium: Erfordert der Merge auch nur EINE fachliche
   Fallunterscheidung, die vorher implizit war → Stufe stoppen, Befund in
   diesen Fahrplan schreiben, ggf. als bewusstes Duplikat belassen (§1).
5. Ein Commit pro Stufe, Stand hier abhaken.

- [ ] V1 Termin-Arithmetik
- [ ] V2 Preset-Rahmen
- [ ] V3 Fristen-Restdubletten (mit Inventur-Skript)
- [ ] V4 Gesellschafts-Geldkern (Extraktion)
- [ ] V5 Verjährungs-Rahmen
