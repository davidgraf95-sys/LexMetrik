# D5 — Der Schritt «Prüfen & Download» prüft

**Bau-Einheit:** W2·24-DESIGN-IDENTITAET · Befund D5 des Funktions-Inventars
(6./7.9.2026) · Zweig `feat/w2-24-d5`, Basis `32ac046e5`
**Fläche:** geteilter Vorlagen-Wizard-Rahmen (30 Vorlagen-Routen)

---

## 1 · Ist-Messung VOR dem Bau (7.9.2026)

Gemessen auf der Basis `32ac046e5`, Vite-Dev @ `localhost:4415`, Chromium
headless. Die Sonde lief aus einem Wegwerf-Verzeichnis (nicht im Repo) und ist
hier im Wortlaut festgehalten, damit die Messung wiederholbar bleibt: Route
öffnen, «Weiter →» klicken bis der Knopf fehlt oder deaktiviert ist, dann
zählen.

```js
// node <datei>.mjs http://localhost:4415/vorlagen/<route>   (aus dem Worktree)
import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(process.argv[2], { waitUntil: 'networkidle' });
for (let i = 0; i < 8; i++) {
  const w = p.getByRole('button', { name: /^Weiter/ });
  if (await w.count() === 0) break;
  if (await w.isDisabled()) { console.log('Weiter deaktiviert bei Klick', i); break; }
  await w.click(); await p.waitForTimeout(120);
}
const pdf = p.getByRole('button', { name: /PDF/ }).first();
console.log(JSON.stringify({
  schritt: await p.locator('h2').first().innerText(),
  alerts: await p.locator('[role=alert]').count(),
  invalid: await p.locator('[aria-invalid="true"]').count(),
  required: await p.locator('[required]').count(),
  befund: await p.locator('[data-pruefbefund]').count(),
  pdfDeaktiviert: await pdf.count() ? await pdf.isDisabled() : null,
  alertTexte: await p.locator('[role=alert]').allInnerTexts(),
}, null, 1));
await b.close();
```

### 1.1 Die Fläche aus dem Inventar-Befund

`/vorlagen/schlichtungsgesuch-bs`, Schritt 7 «Prüfen & Download», leeres
Formular:

```
{alerts: 1, invalid: 0, required: 0, befund: 0, pdfDeaktiviert: true}
alertTexte[0] = "Mängelliste – vor dem Download zu beheben
                 • Art des Streitgegenstands wählen. zum Schritt → …"
```

Dazu die Engine direkt (`vite-node`, `sgMaengel(SG_DEFAULTS)`): **5 Mängel**
(Streitgegenstand · klagende Partei · beklagte Partei · Streitgegenstand-Text ·
Datum).

**Damit ist ein Teil des Inventar-Befunds falsifiziert, nicht überholt.** Der
Inventar-Eintrag D5 nennt für genau diese Route «0 × `role=alert`, 0 ×
`aria-invalid`, 0 × `required`; PDF wird erzeugt». Gemessen wurde am 7.9.2026
das Gegenteil: **eine** Meldung mit `role=alert` und ein **deaktivierter**
PDF-Knopf. Beide Messungen stehen hier nebeneinander; der ältere Beleg wird
nicht «nachgeführt» (Dispatch-§0 Ziff. 2b). Wahrscheinlichste Erklärung: im
Inventar-Lauf war die Sonde nicht im Prüfen-Schritt bzw. die Mängelliste war
ausserhalb des gemessenen Ausschnitts — belegen lässt sich das nicht mehr.

### 1.2 Was sich reproduziert hat — und der eigentliche Bau-Anlass

Sonde über 12 weitere Vorlagen-Routen, jeweils leeres Formular:

| Route | Halt bei | alerts | aria-invalid | PDF-Knopf |
|---|---|---|---|---|
| `/vorlagen/testament` | Schritt «Person», Weiter deaktiviert | 0 | 0 | gesperrt |
| `/vorlagen/nda` | «Parteien & Richtung» | 0 | 0 | offen |
| `/vorlagen/mahnung` | «Parteien» | 0 | 0 | offen |
| `/vorlagen/vollmacht` | «Vollmachtgeber/in» | 0 | 0 | gesperrt |
| `/vorlagen/mietvertrag` | «Mietobjekt» | 0 | 0 | gesperrt |
| `/vorlagen/patientenverfuegung` | «Person» | 0 | 0 | offen |
| `/vorlagen/klage-ordentlich` | «Gericht & Streitwert» | 0 | 0 | offen |
| `/vorlagen/vorsorgeauftrag` | «Voraussetzungen & Form» | 0 | 0 | gesperrt |
| `/vorlagen/auftrag` | «Parteien» | 0 | 0 | offen |
| `/vorlagen/konkubinat` | «Parteien» | 0 | 0 | offen |
| `/vorlagen/rubrum` | «Gericht & Verfahren» | 0 | 0 | offen |
| `/vorlagen/kuendigung-vermieter` | kein Wizard-Halt (Sonderfläche) | 0 | 0 | – |

Der belastbare Befund ist damit ein anderer als der protokollierte, und er ist
ein §10-Befund: **die Sammel-Auskunft «was fehlt noch, und wo steht es»
existierte genau einmal im ganzen Haus — als handgeschriebene Kopie auf einer
von 30 Flächen** (`VorlageSchlichtungsgesuchBs.tsx`, eigene «Mängelliste» mit
`role=alert` und «zum Schritt →»-Knöpfen). Der geteilte Rahmen
(`VorlagenWizardRahmen`) kannte nur `fehler` — die Mängel des **gerade
sichtbaren** Schritts. Im letzten Schritt sind das nur noch Ort, Datum und die
fachlichen Blocker; was die Eingabe-Schritte offen gelassen hatten, konnte er
strukturell nicht wissen. Ein Schritt namens «Prüfen» prüfte darum auf 29 von
30 Flächen nichts, und **kein einziges Feld** im Vorlagen-Wizard trug je
`aria-invalid`.

**Kein W2·24-Rückschritt.** `git diff main` auf `wizard.tsx`/`ui.tsx` zeigt an
der Prüf-Mechanik keine einzige Zeile: die Treffer sind ausschliesslich die
Umstilisierung der `FehlerBox` (`rounded-lg border … bg-danger-bg` →
`lc-notice lc-notice-danger`). `VorlagenSeite.tsx` und `useWizardState.ts` sind
gegenüber `main` unverändert. Der Mangel ist vorbestehend.

---

## 2 · Was gebaut wurde

Alles im geteilten Rahmen — **keine Kopie je Vorlage** (§10).

| Datei | Änderung |
|---|---|
| `src/components/vorlagen/seiteHelfer.ts` | `sammleBefunde()` / `befundZahl()` — reine, deterministische Sammelfunktion über alle Schritte (§2) |
| `src/components/vorlagen/PruefBefund.tsx` (neu) | Sammel-Hinweis `role=alert` · `.lc-notice.lc-notice-danger` · `data-pruefbefund="offen"`, mit Zahl, Sprungliste je Schritt und der ausdrücklichen §8-Zeile, dass der Download offen bleibt. Ist nichts offen: `data-pruefbefund="vollstaendig"`, neutrale `.lc-notice`, **kein** `role=alert` |
| `src/components/vorlagen/wizard.tsx` | neue optionale Prop `fehlerJeSchritt`; Befund nur im letzten Schritt; Sprung setzt `beruehrt` und fokussiert die Schritt-Überschrift (`tabIndex={-1}`); `OffeneAngabenContext` trägt die Zahl zur `ExportLeiste` |
| `src/components/vorlagen/wizard.tsx` (`ExportLeiste`) | Export bleibt **aktiv**; bei offenen Angaben fängt der erste Klick ab und zeigt `data-export-rueckfrage` («Es fehlen N Pflichtangaben — trotzdem exportieren?») mit «Trotzdem exportieren» / «Abbrechen». Danach wird nicht mehr gefragt |
| `src/components/vorlagen/ui.tsx` (`Field`) | optionale Prop `fehlt` → `aria-invalid` + `aria-describedby` am **nativen** Control plus Fehlerzeile |
| `src/components/vorlagen/VorlagenSeite.tsx` | reicht `fehlerImSchritt` durch (deckt 11 Flächen); Ort/Datum im Prüfen-Schritt tragen Fehlerzeile, das Ort-Feld `aria-invalid` |
| 17 × `src/pages/Vorlage*.tsx` | je **eine** Zeile: `fehlerJeSchritt={fehlerImSchritt}` bzw. der vorhandene `maengel`-Filter |
| `src/pages/VorlageSchlichtungsgesuchBs.tsx` | die handgeschriebene «Mängelliste» ist **gestrichen** (§17-Gegengewicht: Zweitbau ersetzen, nicht bewachen) — dieselbe Quelle (`sgMaengel`) läuft jetzt durch den geteilten Befund |

**Nicht gebaut, bewusst:** kein Blockieren. Fehlende Angaben sperren den Export
nach wie vor nicht (Daueranweisung David 12.6.2026: jede Vorlage ist jederzeit
herunterladbar, leere Felder bleiben Ausfüll-Striche); gesperrt bleibt allein,
was fachlich falsch wäre (`gates.blocker`). Der Direkt-Export unter der
Vorschau — der ausdrücklich «auch unausgefüllt» anbietet — fragt gar nicht
nach.

**Nicht gebaut, weil der Auftrag insoweit auf einer falschen Annahme beruht
(§7):** Der Auftrag verweist auf «Pflichtfelder aus den Schemas in
`src/lib/vorlagen/` (Feld-Definition `required`/Pflicht-Marker)». Ein solcher
Marker existiert nicht — geprüft über alle 47 Dateien in `src/lib/vorlagen/`:
kein `required`, kein Pflicht-Flag an einer Feld-Definition. Die
Pflicht-Eigenschaft lebt heute ausschliesslich in den Fehlerfunktionen der
Seiten (`fehlerEingabe` / `fehlerImSchritt` / `…Maengel`). Der Bau nutzt genau
diese Quelle; §3 bleibt gewahrt (der Rahmen zählt und zeigt, er entscheidet
nicht, was Pflicht ist).

---

## 3 · Wächter und Rot-Probe (§6.7)

### 3.1 `src/tests/wizard-pruefschritt-d5.test.tsx` (vitest, SSR)

9 Fälle: Sammelfunktion · Alarm mit Zahl und Sprungliste · positive Quittung
ohne Alarm · Schweigen im Eingabe-Schritt (Grundsatz David 14.6.2026) ·
Unverändertheit ohne die Prop · `Field`-`aria-invalid` mit und ohne `fehlt` ·
Struktur-Wächter «jede Wizard-Fläche führt `fehlerJeSchritt`» samt
Ausnahme-Lebendprüfung.

**Rot-Probe.** Quellstand auf `32ac046e5` zurückgesetzt
(`git checkout 32ac046e5 -- src/components/vorlagen src/pages`,
`PruefBefund.tsx` entfernt), Wächter unverändert:

```
Test Files  1 failed (1)      Tests  5 failed | 4 passed (9)      EXIT=1
FAIL … > sammelt die Lücken ALLER Schritte, nicht nur des sichtbaren
FAIL … > leere Pflichtangaben ⇒ role=alert mit Zahl und Sprung je Schritt
FAIL … > alles ausgefüllt ⇒ positive Quittung, KEIN Alarm
FAIL … > Field mit `fehlt` setzt aria-invalid am nativen Control …
FAIL … > keine Fläche rendert VorlagenWizardRahmen ohne die Prop
        → expected [ …(19) ] to deeply equal []
```

Die 19 gemeldeten Flächen sind exakt `VorlagenSeite.tsx` + die 18
handgeschriebenen Seiten. Die vier grün gebliebenen Fälle sind die
Negativ-Fälle (kein Befund ohne Prop, kein `aria-invalid` ohne `fehlt`) — sie
MÜSSEN im Vor-Zustand grün sein. Nach dem Zurücksetzen auf den Bau-Stand:
`Tests 9 passed (9)`, EXIT=0.

### 3.2 `e2e/vorlagen-pruefschritt-d5.e2e.ts` (Playwright, Gruppe 1)

Echte Strecke auf `/vorlagen/mahnung`: Parteien und Forderung ausfüllen, Ort
und Datum offen lassen, Prüfen-Schritt erreichen → `data-pruefbefund="offen"`
mit `role=alert`, beide Meldungen im Text, genau 1 × `aria-invalid`,
Sprung-Knopf vorhanden; Export-Knopf **aktiv**, Klick zeigt
`data-export-rueckfrage`, «Abbrechen» räumt sie weg; Ort und Datum gefüllt →
`data-pruefbefund="vollstaendig"`, 0 × `aria-invalid`.

**Rot-Probe** (gleicher Rücksetz-Trick):

```
✘ 1 [chromium] › … meldet offene Pflichtangaben, springt zurück und fragt … (11.4s)
  Error: expect(locator).toBeVisible() failed
  Locator: locator('[data-pruefbefund="offen"]')  ·  element(s) not found
1 failed
```

Auf dem Bau-Stand: `1 passed`.

---

## 4 · Nach-Messung (7.9.2026, Bau-Stand)

`/vorlagen/schlichtungsgesuch-bs`, Schritt 7, leeres Formular, gleiche Sonde:

```
{alerts: 1, invalid: 0, befund: 1, pdfDeaktiviert: true}
alertTexte[0] = "Prüfung · Es fehlen 5 Pflichtangaben.
                 Schritt 1 · Streitgegenstand & Vorprüfung → • Art des …
                 Schritt 2 · Klagende Partei → • Klagende P…"
```

Gleich viele Meldungen wie vorher (die Kopie ist ersetzt, nicht ergänzt),
jetzt aber nach Schritt gruppiert, mit Zahl und mit Fokus-Sprung — und
dieselbe Auskunft steht ab sofort auf allen Vorlagen-Flächen.

---

## 5 · Offene Punkte

1. **Ort/Datum ohne Zugangsnamen.** Im Prüfen-Schritt der generischen
   Vorlagen-Seite stehen Ort-Eingabe und `DatumsFeld` gemeinsam in **einem**
   `<Field>` (zweispaltiges Raster). `Field` verknüpft Label und Control nur
   bei einem einzelnen nativen bzw. zusammengesetzten Kind — bei diesem Paar
   also gar nicht: beide Controls sind namenlos (axe `label`). Vorbestehend,
   von D5 nur sichtbar gemacht (die e2e muss das Ort-Feld über den Platzhalter
   ansprechen). Eigener Schritt, weil die Auflösung entweder das sichtbare
   Label teilt oder die Config-Texte der 11 Flächen ändert.
2. **`aria-invalid` nur am Ort-Feld.** Das `DatumsFeld` nimmt keine
   ARIA-Zustände von aussen entgegen; es trägt darum nur die Fehlerzeile.
   Auflösung gehört zu `src/components/DatumsFeld.tsx` (ausserhalb der
   D5-Whitelist).
3. **`e2e/qsui-hierarchie.e2e.ts` · «Verdikt zuerst · Vorlagen — Desktop ·
   `/vorlagen/arbeitsvertrag`» ist rot — und war es schon vorher.**
   Nullprobe (Dispatch-§0 Ziff. 3a): derselbe Test auf der unveränderten Basis
   `32ac046e5`, D5-Dateien entfernt, liefert **denselben Wert auf die
   Nachkommastelle**:

   ```
   Basis 32ac046e5:  Expected <= 1.25   Received 1.25326171875   → 1 failed
   Bau-Stand D5:     Expected <= 1.25   Received 1.25326171875   → 1 failed
   ```

   Der Befund liegt also auf der Zweig-Basis, nicht an D5 (der Prüf-Befund
   rendert ausschliesslich im LETZTEN Schritt, gemessen wird der erste). Die
   Schranke ist um 0.26 % gerissen — jemand hat über dem Dokument dieser einen
   Fläche etwas eingefügt. Gehört zur Kopf-Arbeit von W2·24, nicht hierher.
4. **`sgMaengel` prüft nicht alle Pflichtangaben** — der Ausdruck «Rechtsbegehren»
   (Schritt 4) etwa erzeugt keinen Mangel. Rechtslogik (`src/lib`), gehört in
   einen fachlichen Schritt mit Abnahme, nicht in einen Darstellungs-Bau.
