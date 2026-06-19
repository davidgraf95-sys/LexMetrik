# Design-Reglement Vorlagen — verbindliches Schriftbild der Dokument-Outputs

Stand: 18.6.2026 (Auftrag David: «schön, nutzerfreundlich, state of the art»
für die Dokument-Outputs der Vorlagen — grundlegende Regeln **in Code
erzwungen**, nicht nur beschrieben; Schlichtungsgesuch als erste Umsetzung).
Geltungsbereich: alle Vorlagen-Outputs (PDF, DOCX, On-Screen-Vorschau).

**Das Verbindliche ist der Code** (`src/lib/vorlagen/formatvorlagen.ts` +
`src/components/vorlagen/vorschauStil.ts`); diese Notiz hält das *Warum* fest.
Spiegel zu `DESIGN-REGLEMENT-RECHNER.md` (das die Rechner-Seiten regelt).

Leitidee: **Ein Dokument, drei Renderer, eine Quelle.** Jede Vorlage wird über
ein rollenbasiertes Modell zusammengesetzt (`assemble()` → `DokumentAbsatz[]`);
PDF, DOCX und Vorschau interpretieren dieselben Rollen und Muster. Eine
Verbesserung an der geteilten Schicht färbt jede Vorlage konsistent.

## V1 · Dokument-Anatomie (Rollen)

`assemble()` (`engine.ts`) liefert Absätze mit `rolle`:
`absender · adressat · datumzeile · betreff · rubrum · parteien · anrede ·
schlussformel · unterschrift · default`. Geteilte Textmuster (`MUSTER`):
nummerierte Klausel `1. …` (hängender Einzug), `– `-Unterpunkt, Strichzeile
`______` (gezeichnete Unterschriftslinie), Rubrum-Parteirolle `— … —`.

**Der Assemble-Text ist die SSoT des Inhalts** (golden-gegated, §6). Renderer
dürfen ihn nur DARSTELLEN, nie verändern. Anzeige-Transformationen (z. B.
`rolleLabel`: «— klagende Partei —» → «klagende Partei») sind erlaubt, weil
sie den Assemble-Text nicht anfassen.

## V2 · Eine Quelle, drei Einheiten-Sichten (das «Reglement in Code»)

Alle Masse/Typografie liegen an EINER Stelle (`formatvorlagen.ts`), bewusst in
drei nebeneinander gepflegten Einheiten-Sichten — NICHT auseinander abgeleitet:

| Sicht | Einheit | Renderer | Wo |
|---|---|---|---|
| `FORMAT_TYPOGRAFIE` | mm + `docx:{}` (twips) | format-abhängige Typografie (Brot/Zeile/Ränder/Titel) | lib |
| `ROLLEN_PDF` | mm / pt | PDF-Rollen-Abstände + Einzüge | lib |
| `ROLLEN_DOCX` | twips / half-points | DOCX-Rollen-Abstände + Einzüge | lib |
| `VORSCHAU` | rem / em | On-Screen-«Papier» | `components/vorlagen/vorschauStil.ts` |

**Warum keine Projektion (eine Einheit → Rest gerechnet):**
- mm → twips wäre falsch: die Word-Masse sind seit jeher eigenständig auf das
  Word-Schriftbild getunt (Adressblock 10 mm im PDF vs. 300 twips ≈ 5.3 mm im
  DOCX). Eine Umrechnung hätte das DOCX-Schriftbild verändert (§6-Bruch).
- mm → rem wäre unstimmig: das Vorschau-«Papier» ist CONTAINER-RELATIV
  (responsiv), nicht mm-skaliert — ein in mm projizierter Einzug passte nicht
  zur container-breiten Seite.

Die drei Sichten werden **im Gleichschritt** gepflegt: wer den Rhythmus eines
Dokuments ändert, fasst alle drei an. Geteilt wird nur, was wirklich dasselbe
ist (z. B. `betreffGroesse`: pt; DOCX = 2× als Half-Points; `rolleLabel`).

## V3 · §3-Grenze: lib gibt Zahlen, Components machen CSS

`src/lib/` enthält nur MASSZAHLEN (mm, twips, rem als Zahl) + den neutralen
`rolleLabel` — keine Tailwind-/CSS-Strings. Die Übersetzung in `className`/
`style` lebt in der Komponentenschicht (`vorschauStil.ts`, `wizard.tsx`).
Die Renderer in `src/lib/vorlagen/vorlagenPdf.ts` / `vorlagenDocx.ts` nehmen
`stil` als reinen Parameter — keine UI-Abhängigkeit.

## V4 · Schriftbild-Handwerk (gilt in beiden Stilen)

- **Tabellarische Ziffern**: Beträge/Daten/Nummern fluchten. Vorschau via
  `font-variant-numeric: tabular-nums` (Sans — NIE die Monospace-`.num`-Klasse,
  die den Fliesstext bräche). PDF/Helvetica und DOCX/Arial haben ohnehin
  gleich breite Ziffern.
- **Ruhige Hierarchie**: fetter Betreff + Haarlinie; scanbarer, hängend
  eingezogener Begehrensblock; klarer Unterschriftsblock.
- **Schweizer Eingabe-Konvention**: Adressblock oben links (fensterkuvert-
  tauglich), Ort/Datum rechts, breiter Korrekturrand rechts (`eingabe`).
- **Ehrlichkeit (§8)**: Status/Disclaimer ruhig im Output; keine Politur, die
  den Prüfstand verschleiert.

## V5 · Ausgabe-Stil: nüchtern ⇄ modern (`AusgabeStil`)

Eine Stilwahl, die auf alle drei Renderer KOHÄRENT wirkt (Vorschau = PDF =
DOCX). Differenzierer ist die Rubrum-Parteirolle (visuelle Signatur):

- **nuechtern** — klassisch-gerichtstauglich: `— klagende Partei —` zentriert.
- **modern** — Variante A «Dokument-Handwerk»: ruhiges, gesperrtes Versal-Label
  (Em-Striche entfallen, `rolleLabel`).

V4-Handwerk (Tabellarik, Hierarchie, Begehrensblock) gilt in BEIDEN Stilen.
Wahl liegt im Modul-Store `ausgabeStil.ts` (`useSyncExternalStore`,
localStorage, Default `modern`) — Vorschau UND beide Export-Knöpfe lesen
denselben Wert ohne Props-Plumbing. UI: `StilUmschalter` im Vorschaukopf.

## V6 · Verhaltensneutralität (§6) — was sich NIE ändern darf

Das Schriftbild ist Darstellung; der **Inhalt** ist es nicht. `assemble()`,
Schemas, Bausteine, Texte bleiben unberührt → `npm run golden:vergleich`
byte-gleich. Reine Token-Umstellungen (Magic-Numbers → benannte Tokens mit
identischem Wert) werden mit einem datums-/ID-bereinigten Render-Vergleich
(PDF-Operatoren + DOCX `document.xml`) als byte-gleich bewiesen.

## Prüfung (Checkliste vor Commit)

1. `npm run golden:vergleich` byte-gleich (Inhalt unberührt — Hauptbeweis §6).
2. `npm run gate` (tsc · vitest · golden · lint · check) + `npm run build` grün.
3. Keine hartkodierten Abstände mehr auf Rollen-Elementen der Vorschau
   (grep `mb-/mt-/w-/pl-` → nur strukturelle Utilities übrig).
4. Visuelle Sichtprüfung Vorschau (Desktop 1280 / Mobile 390) + je ein PDF +
   DOCX pro Format, in BEIDEN Stilen geöffnet und beurteilt.
5. Struktur-Tests, die altes DOM festschreiben, werden DEKLARIERT angepasst
   (§6 Ziff. 3, eigener begründeter Schritt) — nie stillschweigend aufgeweicht.
6. Kein Push/Deploy ohne Davids ausdrückliches Ja (§9); fachliche Abnahme der
   Optik durch David selbst (Ausprobieren).
