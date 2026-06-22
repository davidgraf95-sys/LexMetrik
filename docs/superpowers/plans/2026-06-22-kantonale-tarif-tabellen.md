# Kantonale Tarif-Tabellen — Implementation Plan (Stufe 1: SG Füllpunkt-Zweispalter)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Füllpunkt-Tarifzeilen kantonaler PDF-Erlasse («Beschreibung . . . . 30.—») werden bei der Extraktion in strukturierte Tabellenzeilen `{beschreibung, betrag}` zerlegt und im UI als echte 2-Spalten-Tabelle dargestellt — statt als Fliesstext mit literalen Punkten.

**Architecture:** Reine, deterministische Extraktionsfunktion im PDF-Adapter (`adapter-pdf.ts`) erzeugt ein additives Block-Feld `tabelle`; der Snapshot-Writer trägt es unverändert weiter (Drift-SHA deckt es); `ArtikelBody.tsx` rendert `tabelle` als 2-Spalten-Block. Stufe 1 nur für die 3 SG-Snapshots end-to-end.

**Tech Stack:** TypeScript, vite-node (Generator), Vitest, React/TSX, Tailwind. PDF-Extraktion via pdfjs zur Build-Zeit (bestehend).

## Global Constraints

- **§1 Logik vor allem:** Inhalt (Beschreibung, Betrag) exakt wie Quelle — nichts erfinden, umrechnen, verschlucken. Im Zweifel Zeile als Text belassen statt falsch splitten.
- **§2 Determinismus:** reine Funktionen, kein `Date.now()`/`Math.random()`.
- **§3 Schichten:** Rechtslogik nur in `src/lib/`/`scripts/`; `ArtikelBody.tsx` rendert nur, erfindet keinen Inhalt.
- **§6 Refactoring-Protokoll:** Tore mit voller Ausgabe; Golden-Änderung ist ein DEKLARIERTER fachlicher Schritt (Struktur-Änderung), kein stilles Aufweichen. Tor-Kommandos NACKT (keine Pipe — `tor-schutz.py` blockiert sonst).
- **§7 Norm-Snapshots nur via Generator** (`npm run normtext`), nie von Hand editieren. Stand/Quelle/Drift bleiben Pflicht.
- **§9 Push/Deploy nur nach Davids ausdrücklichem Ja.** Dieser Plan endet VOR Deploy.
- **§12 Parallel-Session:** Commits mit explizitem Pathspec; Arbeit auf Branch `feat/kantonale-tarif-tabellen`.
- **Daueranweisung David:** «immer wieder Logik- und Bug-Check durchführen» — nach JEDEM Task Logik- + Bug-Check (siehe Schlussschritt je Task), plus adversarialer Schlussdurchgang (Task 7).
- **Geltungsbereich Stufe 1:** NUR `public/normtext/kanton/SG-2935.json`, `SG-3849.json`, `SG-2808.json`. Andere Kantone/Profile und über/bis-Staffeln = spätere Stufen.

---

### Task 1: Geld-Parser `betragAmAnfang` (reine Funktion)

Extrahiert die führende Geld-Angabe aus dem Text NACH einem Füllpunkt-Leader. Herzstück der Zeilen-Zerlegung; isoliert getestet gegen echte SG-Beträge.

**Files:**
- Create: `scripts/normtext/tarif-tabelle.ts`
- Test: `src/tests/tarif-tabelle.test.ts`

**Interfaces:**
- Produces: `export function betragAmAnfang(s: string): { betrag: string; rest: string } | null` — `betrag` = getrimmte Geld-Angabe am Anfang von `s` (inkl. optionalem « bis »-Bereich), `rest` = Text danach (getrimmt). `null`, wenn `s` nicht mit einer Geld-Angabe beginnt.

- [ ] **Step 1: Failing test mit echten SG-Beträgen**

```ts
// src/tests/tarif-tabelle.test.ts
import { describe, it, expect } from 'vitest';
import { betragAmAnfang } from '../../scripts/normtext/tarif-tabelle.ts';

describe('betragAmAnfang', () => {
  it('liest einfache Beträge (em-/en-dash)', () => {
    expect(betragAmAnfang('30.—')).toEqual({ betrag: '30.—', rest: '' });
    expect(betragAmAnfang('150.– bis 2000.–')).toEqual({ betrag: '150.– bis 2000.–', rest: '' });
  });
  it('liest Rappen-Beträge «—.50»', () => {
    expect(betragAmAnfang('—.50')).toEqual({ betrag: '—.50', rest: '' });
  });
  it('liest «bis»-Spanne und gibt Folgetext als rest', () => {
    expect(betragAmAnfang('100.— bis 1000.— 22.60 Aufsichtsrechtliche Verfügungen'))
      .toEqual({ betrag: '100.— bis 1000.—', rest: '22.60 Aufsichtsrechtliche Verfügungen' });
  });
  it('gibt null bei Nicht-Geld-Anfang', () => {
    expect(betragAmAnfang('Vollmachten und Erklärungen')).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `npx vitest run src/tests/tarif-tabelle.test.ts`
Expected: FAIL (`betragAmAnfang is not a function` / Modul fehlt).

- [ ] **Step 3: Implementiere `betragAmAnfang`**

```ts
// scripts/normtext/tarif-tabelle.ts
// Reine, deterministische Zerlegung von Füllpunkt-Tarifzeilen (§2). Stufe 1:
// SG-Beurkundungs-/Gerichtskostentarife (gesetzessammlung.sg.ch-PDF).

// Geld-Atom: «30.—», «150.–», «1.—», «—.50», «2000.—», auch mit Tausender-
// Trennern/­schmalem Leerzeichen. Dash = em (—), en (–) oder Bindestrich (-).
const GELD = String.raw`(?:\d[\d'’  ]*\.[—–-]|[—–-]\.\d+|\d[\d'’  ]*\.\d+)`;
const BETRAG_ANFANG = new RegExp(`^\\s*(${GELD}(?:\\s+bis\\s+${GELD})?)`);

export function betragAmAnfang(s: string): { betrag: string; rest: string } | null {
  const m = s.match(BETRAG_ANFANG);
  if (!m) return null;
  return { betrag: m[1].trim(), rest: s.slice(m[0].length).trim() };
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `npx vitest run src/tests/tarif-tabelle.test.ts`
Expected: PASS (4 Tests).

- [ ] **Step 5: Logik+Bug-Check (Daueranweisung)**
  - Logik: Wird der Betrag exakt wie in der Quelle übernommen (kein Zeichen geändert)? Ja — `slice`/`trim` nur.
  - Bug: Greift `GELD` versehentlich in normalen Text? Ergänze einen Test `betragAmAnfang('2 Promille des Erwerbspreises')` → muss `null` sein (beginnt mit «2 Promille», kein Geld-Atom mit Dezimal-Dash). Lauf erneut; falls es fälschlich matcht, `GELD` verschärfen (Dezimaltrenner `.` Pflicht).

- [ ] **Step 6: Commit**

```bash
git add scripts/normtext/tarif-tabelle.ts src/tests/tarif-tabelle.test.ts
git commit -m "feat(normtext): betragAmAnfang — Geld-Parser für Füllpunkt-Tarifzeilen" -- scripts/normtext/tarif-tabelle.ts src/tests/tarif-tabelle.test.ts
```

---

### Task 2: `extrahiereTarifTabelle` — Block-Text → {vortext, tabelle}

Zerlegt einen Block-Text mit Füllpunkt-Leadern in einen optionalen Vortext + Tabellenzeilen. Deckt Einzel-Leader- UND Multi-Leader-Blöcke ab (jede `Beschreibung <leader> Betrag`-Einheit = eine Zeile).

**Files:**
- Modify: `scripts/normtext/tarif-tabelle.ts`
- Test: `src/tests/tarif-tabelle.test.ts`

**Interfaces:**
- Consumes: `betragAmAnfang` (Task 1).
- Produces: `export interface TarifZeile { beschreibung: string; betrag: string }` und `export function extrahiereTarifTabelle(text: string): { vortext: string; tabelle: TarifZeile[] } | null` — `null`, wenn keine verwertbare Tarifzeile gefunden (kein Leader, oder kein Betrag nach Leader).

- [ ] **Step 1: Failing tests (echte SG-Strings)**

```ts
// in src/tests/tarif-tabelle.test.ts ergänzen
import { extrahiereTarifTabelle } from '../../scripts/normtext/tarif-tabelle.ts';

describe('extrahiereTarifTabelle', () => {
  it('Einzelzeile: Beschreibung | Betrag, kein Vortext', () => {
    const r = extrahiereTarifTabelle('Aufsichtsrechtliche Genehmigung . . . . . . . . . 150.— bis 2000.—');
    expect(r).toEqual({
      vortext: '',
      tabelle: [{ beschreibung: 'Aufsichtsrechtliche Genehmigung', betrag: '150.— bis 2000.—' }],
    });
  });

  it('Rappen-Betrag «—.50»', () => {
    const r = extrahiereTarifTabelle('für jede weitere Kopie . . . . . . . . . . —.50');
    expect(r).toEqual({ vortext: '', tabelle: [{ beschreibung: 'für jede weitere Kopie', betrag: '—.50' }] });
  });

  it('Multi-Leader: mehrere verschmolzene Zeilen werden getrennt', () => {
    const r = extrahiereTarifTabelle(
      'Einvernahme . . . . . . . 30.— bis 250.— Augenschein . . . . . . . 150.— bis 3000.—',
    );
    expect(r).toEqual({
      vortext: '',
      tabelle: [
        { beschreibung: 'Einvernahme', betrag: '30.— bis 250.—' },
        { beschreibung: 'Augenschein', betrag: '150.— bis 3000.—' },
      ],
    });
  });

  it('Vortext (Einleitung mit «:») bleibt erhalten, Rest wird Tabelle', () => {
    const r = extrahiereTarifTabelle(
      'Die Gebühren betragen: Vorladung . . . . . . . 6.— Mahnung . . . . . . . 10.— bis 50.—',
    );
    expect(r!.vortext).toBe('Die Gebühren betragen:');
    expect(r!.tabelle).toEqual([
      { beschreibung: 'Vorladung', betrag: '6.—' },
      { beschreibung: 'Mahnung', betrag: '10.— bis 50.—' },
    ]);
  });

  it('kein Leader → null (normaler Absatz unangetastet)', () => {
    expect(extrahiereTarifTabelle('Dieser Erlass regelt die Erhebung der Gebühren.')).toBeNull();
  });

  it('Leader aber kein Betrag danach → null (kein Fehlschnitt)', () => {
    expect(extrahiereTarifTabelle('Siehe Anhang . . . . . . folgende Bestimmungen')).toBeNull();
  });
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `npx vitest run src/tests/tarif-tabelle.test.ts`
Expected: FAIL (`extrahiereTarifTabelle is not a function`).

- [ ] **Step 3: Implementiere `extrahiereTarifTabelle`**

```ts
// in scripts/normtext/tarif-tabelle.ts ergänzen
export interface TarifZeile { beschreibung: string; betrag: string }

// Leader = ≥4 Punkte, ggf. durch einzelne Leerzeichen getrennt («. . . .» / «....»).
const LEADER = /\.(?:\s?\.){3,}/g;

export function extrahiereTarifTabelle(
  text: string,
): { vortext: string; tabelle: TarifZeile[] } | null {
  // In Segmente an den Leadern zerlegen: [desc0, nach1, nach2, …]. Jedes
  // «nachK» beginnt mit dem Betrag der K-ten Zeile, gefolgt von der
  // Beschreibung der (K+1)-ten Zeile.
  const segmente = text.split(LEADER);
  if (segmente.length < 2) return null; // kein Leader

  const tabelle: TarifZeile[] = [];
  let offeneBeschreibung = segmente[0].trim();
  let vortext = '';

  // Einleitungssatz bis und mit «:» (z.B. «… betragen:») als Vortext abtrennen.
  const doppelp = offeneBeschreibung.lastIndexOf(':');
  if (doppelp >= 0 && doppelp < offeneBeschreibung.length - 1) {
    vortext = offeneBeschreibung.slice(0, doppelp + 1).trim();
    offeneBeschreibung = offeneBeschreibung.slice(doppelp + 1).trim();
  }

  for (let k = 1; k < segmente.length; k++) {
    const b = betragAmAnfang(segmente[k]);
    if (!b) return null; // Leader ohne Betrag → kein Tarif → nicht splitten (§1)
    tabelle.push({ beschreibung: offeneBeschreibung, betrag: b.betrag });
    offeneBeschreibung = b.rest; // Beschreibung der nächsten Zeile
  }
  if (tabelle.length === 0) return null;
  return { vortext, tabelle };
}
```

- [ ] **Step 4: Run, verify PASS**

Run: `npx vitest run src/tests/tarif-tabelle.test.ts`
Expected: PASS (alle Tests Task 1 + 2).

- [ ] **Step 5: Logik+Bug-Check gegen ECHTE Snapshot-Daten**

Lauf dieses Ad-hoc-Skript und lies die Ausgabe (Wortlaut-Treue prüfen):

```bash
npx vite-node -e "
import { extrahiereTarifTabelle } from './scripts/normtext/tarif-tabelle.ts';
import { readFileSync } from 'node:fs';
const LEAD=/\.(?:\s?\.){3,}/;
let ok=0, nullCount=0, beispiele=[];
for (const fn of ['SG-2935','SG-3849','SG-2808']) {
  const d=JSON.parse(readFileSync('public/normtext/kanton/'+fn+'.json','utf8'));
  for (const e of d.eintraege) for (const b of e.bloecke) {
    if (!LEAD.test(b.text||'')) continue;
    const r=extrahiereTarifTabelle(b.text);
    if (r) { ok++; if (beispiele.length<6) beispiele.push(r.tabelle.slice(0,2)); }
    else nullCount++;
  }
}
console.log('verwertet:', ok, ' null(Leader ohne Betrag):', nullCount);
console.log(JSON.stringify(beispiele, null, 1));
"
```
  - Logik: Stimmt je Zeile `beschreibung`+`betrag` mit dem Quell-Wortlaut? Keine verschluckte/erfundene Zeile? Punkte raus, Rest exakt?
  - Bug: Wie viele Blöcke fallen auf `null` (Leader ohne Betrag)? Sieh dir 2–3 davon an — sind das echte Nicht-Tarif-Zeilen (gut) oder unerkannte Betrag-Formate (dann `GELD` in Task 1 erweitern + Test ergänzen + Tasks 1/2 erneut grün)? Iteriere, bis die `null`-Fälle plausibel Nicht-Tarif sind.

- [ ] **Step 6: Commit**

```bash
git add scripts/normtext/tarif-tabelle.ts src/tests/tarif-tabelle.test.ts
git commit -m "feat(normtext): extrahiereTarifTabelle — Block-Text in {vortext, tabelle} zerlegen" -- scripts/normtext/tarif-tabelle.ts src/tests/tarif-tabelle.test.ts
```

---

### Task 3: `PdfBlock.tabelle` + Anreicherung in `baueBloecke` + Drift-SHA

Das Adapter-Block-Modell um `tabelle` erweitern und die Anreicherung am Ende von `baueBloecke` anhängen; `berechnePdfQuelleHash` deckt `tabelle` mit ab.

**Files:**
- Modify: `scripts/normtext/adapter-pdf.ts` (Typ `PdfBlock` 79–83; `baueBloecke` Ende ~734; `berechnePdfQuelleHash` 852–862; Import oben)
- Test: `src/tests/normtext-pdf-adapter.test.ts`

**Interfaces:**
- Consumes: `extrahiereTarifTabelle`, `TarifZeile` (Task 2).
- Produces: `PdfBlock.tabelle?: TarifZeile[]` — Blöcke, deren Text in eine Tarif-Tabelle zerfällt, tragen `tabelle` und nur noch den `vortext` als `text`.

- [ ] **Step 1: Failing test (baueBloecke reichert tabelle an)**

```ts
// src/tests/normtext-pdf-adapter.test.ts — neuen Block ergänzen
import { extrahiereAllePdfArtikel } from '../../scripts/normtext/adapter-pdf.ts';

it('baueBloecke: Füllpunkt-Block wird zu tabelle (Text=vortext)', () => {
  const basis = [
    '§ 5',
    '¶1 Die Gebühren betragen: Vorladung . . . . . . . 6.— Mahnung . . . . . . . 10.— bis 50.—',
  ].join('\n');
  const art = extrahiereAllePdfArtikel(basis, '§');
  const block = art['5'].bloecke[0];
  expect(block.text).toBe('Die Gebühren betragen:');
  expect(block.tabelle).toEqual([
    { beschreibung: 'Vorladung', betrag: '6.—' },
    { beschreibung: 'Mahnung', betrag: '10.— bis 50.—' },
  ]);
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `npx vitest run src/tests/normtext-pdf-adapter.test.ts`
Expected: FAIL (`block.tabelle` undefined / `text` ist noch der Volltext).

- [ ] **Step 3: Implementiere — Import, Typ, Anreicherung, SHA**

Import oben bei den anderen Imports (nach Zeile 66):
```ts
import { extrahiereTarifTabelle, type TarifZeile } from './tarif-tabelle.ts';
```

`PdfBlock` (Zeilen 79–83) erweitern:
```ts
export interface PdfBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string }>;
  /** Stufe 1: Füllpunkt-Tarifzeilen (Beschreibung | Betrag), aus dem Text
   *  zerlegt. text trägt dann nur noch den Einleitungs-Vortext. */
  tabelle?: TarifZeile[];
}
```

In `baueBloecke` die `return`-Zeile (aktuell `return bloecke.filter(...)`, ~734) ersetzen:
```ts
  // Füllpunkt-Tarifzeilen je Block in strukturierte Tabelle zerlegen (§1: nur
  // wenn eindeutig Beschreibung…Betrag; sonst Text unverändert).
  for (const b of bloecke) {
    if (!b.text) continue;
    const t = extrahiereTarifTabelle(b.text);
    if (t) {
      b.text = t.vortext;
      b.tabelle = t.tabelle;
    }
  }
  return bloecke.filter(
    (b) => b.text !== '' || (b.items && b.items.length > 0) || (b.tabelle && b.tabelle.length > 0),
  );
```

`berechnePdfQuelleHash` (Zeilen 856–859) — `tabelle` einfliessen lassen, damit Drift sie erfasst:
```ts
    for (const b of artikel[token].bloecke) {
      const items = (b.items ?? []).map((i) => `${i.marke}\t${i.text}`).join('\n');
      const tab = (b.tabelle ?? []).map((z) => `${z.beschreibung}\t${z.betrag}`).join('\n');
      teile.push(`${b.absatz ?? ''}\t${b.text}${items ? `\n${items}` : ''}${tab ? `\n${tab}` : ''}`);
    }
```

- [ ] **Step 4: Run, verify PASS**

Run: `npx vitest run src/tests/normtext-pdf-adapter.test.ts`
Expected: PASS (neuer Test + bestehende).

- [ ] **Step 5: Logik+Bug-Check**
  - Logik: Bestehende Nicht-Tarif-Blöcke unverändert (kein `tabelle`)? Der Test-Erlass-Absatz «Dieser Erlass regelt…» darf kein `tabelle` bekommen.
  - Bug: `npx tsc -b` läuft sauber (Typ-Erweiterung)? Lauf `npx tsc -b` (volle Ausgabe).

- [ ] **Step 6: Commit**

```bash
git add scripts/normtext/adapter-pdf.ts src/tests/normtext-pdf-adapter.test.ts
git commit -m "feat(normtext): PdfBlock.tabelle + baueBloecke-Anreicherung + Drift-SHA" -- scripts/normtext/adapter-pdf.ts src/tests/normtext-pdf-adapter.test.ts
```

---

### Task 4: Snapshot-Typ + Generator-SHA tragen `tabelle`

`tabelle` ins öffentliche Snapshot-Schema (`typen.ts`) aufnehmen und in `sha256Bloecke` des Generators einfliessen lassen. Die `bloecke: treffer.bloecke`-Zuweisungen im Generator übernehmen `tabelle` dann automatisch.

**Files:**
- Modify: `src/lib/normtext/typen.ts:22-26`
- Modify: `scripts/normtext-snapshot.ts` (`sha256Bloecke` 107–123)

**Interfaces:**
- Produces: `NormSnapshot.bloecke[].tabelle?: Array<{ beschreibung: string; betrag: string }>` — von `ArtikelBody` (Task 5) konsumiert.

- [ ] **Step 1: Typ erweitern (`typen.ts:22-26`)**

```ts
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
    /** Stufe 1: Füllpunkt-Tarifzeilen (Beschreibung | Betrag). */
    tabelle?: Array<{ beschreibung: string; betrag: string }>;
  }>;
```

- [ ] **Step 2: `sha256Bloecke` (107–123) — tabelle aufnehmen**

Block-Typ-Parameter (108–112) ergänzen:
```ts
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
    tabelle?: Array<{ beschreibung: string; betrag: string }>;
  }>,
```
und das Mapping (114–121):
```ts
  const zusammen = bloecke
    .map((b) => {
      const itemTeil = (b.items ?? []).map((i) => `${i.marke}\t${i.text}`).join('\n');
      const tabTeil = (b.tabelle ?? []).map((z) => `${z.beschreibung}\t${z.betrag}`).join('\n');
      return [b.text, itemTeil, tabTeil].filter(Boolean).join('\n');
    })
    .join('\n');
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: keine Fehler (Generator + src kompilieren; `treffer.bloecke` ist jetzt typkompatibel).

- [ ] **Step 4: Logik+Bug-Check**
  - Logik: Der `sha` ändert sich nur, wenn ein Block `tabelle` ODER `items` hat — bestehende reine Text-Blöcke ergeben byte-gleich denselben `sha` wie vorher (prüfe: `[b.text, '', ''].filter(Boolean).join('\n')` === `b.text`). Bestätigt → kein unnötiger Golden-Churn bei unbetroffenen Erlassen.
  - Bug: `tsc` grün.

- [ ] **Step 5: Commit**

```bash
git add src/lib/normtext/typen.ts scripts/normtext-snapshot.ts
git commit -m "feat(normtext): Snapshot-Schema + Generator-SHA tragen tabelle" -- src/lib/normtext/typen.ts scripts/normtext-snapshot.ts
```

---

### Task 5: UI — `TarifTabelle` in `ArtikelBody.tsx`

Blöcke mit `tabelle` als echte 2-Spalten-Tabelle rendern (Beschreibung links, Betrag rechtsbündig, `tabular-nums`), Optik analog `StaffelTabelle`.

**Files:**
- Modify: `src/components/normtext/ArtikelBody.tsx` (neue Komponente nahe `StaffelTabelle` ~180; Render-Zweig im Block ~248-262)
- Test: `src/tests/ArtikelBody.test.tsx`

**Interfaces:**
- Consumes: `b.tabelle` (Task 4).

- [ ] **Step 1: Failing test**

```tsx
// src/tests/ArtikelBody.test.tsx — neuen Test ergänzen (Imports/render wie bestehende Tests)
it('rendert tabelle als 2-Spalten-Tarif (Beschreibung + Betrag)', () => {
  const bloecke = [{
    absatz: null, text: 'Die Gebühren betragen:',
    tabelle: [
      { beschreibung: 'Vorladung', betrag: '6.—' },
      { beschreibung: 'Mahnung', betrag: '10.— bis 50.—' },
    ],
  }];
  render(<ArtikelBody bloecke={bloecke} artikel="5" passus={{ absatz: null, lit: null, ziff: null } as never} />);
  expect(screen.getByText('Die Gebühren betragen:')).toBeInTheDocument();
  expect(screen.getByText('Vorladung')).toBeInTheDocument();
  expect(screen.getByText('10.— bis 50.—')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run, verify FAIL**

Run: `npx vitest run src/tests/ArtikelBody.test.tsx`
Expected: FAIL («Vorladung» nicht gefunden — tabelle wird nicht gerendert).

- [ ] **Step 3: `TarifTabelle`-Komponente (nach `StaffelTabelle`, ~180)**

```tsx
// 2-Spalten-Tarif (Beschreibung | Betrag) aus strukturiertem block.tabelle.
// Reine Darstellung (§3); Wortlaut je Zelle unverändert.
function TarifTabelle({ zeilen }: { zeilen: Array<{ beschreibung: string; betrag: string }> }) {
  return (
    <span className="mt-1.5 block rounded-md border border-line overflow-hidden [font-variant-numeric:tabular-nums]">
      {zeilen.map((z, j) => (
        <span key={j} className={`flex items-baseline justify-between gap-4 px-3 py-1.5 leading-snug ${j > 0 ? 'border-t border-line/60' : ''}`}>
          <span className="text-ink-700">{z.beschreibung}</span>
          <span className="shrink-0 text-right font-medium text-ink-800">{z.betrag}</span>
        </span>
      ))}
    </span>
  );
}
```

- [ ] **Step 4: Render-Zweig im Block einfügen**

Im IIFE-Block (aktuell ~248-262), VOR der `staffelZeilen`-Logik den `tabelle`-Fall behandeln. Ersetze den `return zeilen ? <StaffelTabelle …/> : verlinkt(anzeige)`-Abschluss durch eine Variante, die zuerst `b.tabelle` prüft. Konkret nach `const { wortlaut } = trenneAenderungshistorie(rohtext);` einfügen:

```tsx
                // Strukturierte Tarif-Tabelle (Stufe 1) hat Vorrang vor der
                // Text-Heuristik. Vortext (b.text) bleibt als normaler Absatz davor.
                const tab = b.tabelle && b.tabelle.length > 0 ? b.tabelle : null;
```
und den Abschluss des IIFE (`const zeilen = staffelZeilen(anzeige); return zeilen ? … : verlinkt(anzeige);`) ersetzen durch:
```tsx
                const zeilen = staffelZeilen(anzeige);
                return (
                  <>
                    {anzeige.trim() && !istAufgehoben(anzeige) && (zeilen ? <StaffelTabelle zeilen={zeilen} /> : verlinkt(anzeige))}
                    {tab && <TarifTabelle zeilen={tab} />}
                  </>
                );
```
Hinweis: Die bestehende Aufhebungs-Prüfung (`if (!anzeige.trim() || istAufgehoben(anzeige)) return …aufgehoben…`) bleibt UNVERÄNDERT davor — greift aber nur, wenn KEIN `tab` vorhanden ist. Passe sie an:
```tsx
                if ((!anzeige.trim() || istAufgehoben(anzeige)) && !tab) return <span className="italic text-ink-400">aufgehoben</span>;
```

- [ ] **Step 5: Run, verify PASS**

Run: `npx vitest run src/tests/ArtikelBody.test.tsx`
Expected: PASS (neuer Test + bestehende ArtikelBody-Tests grün — Byte-Gleichheit der Nicht-Tabellen-Pfade).

- [ ] **Step 6: Logik+Bug-Check**
  - Logik: Block OHNE `tabelle` rendert exakt wie zuvor (kein Fragment-`<></>`-Diff bricht bestehende golden/Tests)? Falls bestehende Snapshot-Tests brechen, prüfe ob das Fragment leere `text` anders rendert — ggf. nur bei `tab` das Fragment nutzen, sonst direkt zurückgeben.
  - Bug: `npx tsc -b` grün.

- [ ] **Step 7: Commit**

```bash
git add src/components/normtext/ArtikelBody.tsx src/tests/ArtikelBody.test.tsx
git commit -m "feat(gesetze): TarifTabelle — block.tabelle als 2-Spalten-Tarif rendern" -- src/components/normtext/ArtikelBody.tsx src/tests/ArtikelBody.test.tsx
```

---

### Task 6: SG-Snapshots regenerieren + Golden aktualisieren

Die 3 SG-Snapshots aus der Quelle neu erzeugen (Netz), Diff sichten, Golden bewusst aktualisieren, Tore grün ziehen.

**Files:**
- Modify (generiert, NICHT von Hand): `public/normtext/kanton/SG-2935.json`, `SG-3849.json`, `SG-2808.json`
- Modify (generiert): `public/normtext/register.json` (falls betroffen), `golden/lexmetrik-golden.json` (Struktur-Änderung)

- [ ] **Step 1: SG-Snapshots regenerieren (Netz)**

Run: `npm run normtext -- --datum=$(date +%F) --nur=kanton --kanton=SG`
Expected: erzeugt SG-Snapshots ohne Fehler; Konsole zeigt verarbeitete Erlasse. (Bei Netzfehler/Drift: melden, nicht hineinfixen.)

- [ ] **Step 2: Diff sichten + Logik-Check gegen Quelle (Daueranweisung)**

Run: `git --no-pager diff --stat public/normtext/kanton/SG-2935.json public/normtext/kanton/SG-3849.json public/normtext/kanton/SG-2808.json`
Dann je Datei stichprobenartig die neuen `tabelle`-Felder ansehen:
```bash
npx vite-node -e "
import { readFileSync } from 'node:fs';
for (const fn of ['SG-2935','SG-3849','SG-2808']) {
  const d=JSON.parse(readFileSync('public/normtext/kanton/'+fn+'.json','utf8'));
  let n=0; for (const e of d.eintraege) for (const b of e.bloecke) if (b.tabelle) n+=b.tabelle.length;
  console.log(fn,'Tarifzeilen:',n);
}
"
```
  - Logik (§7 doppelt verifizieren): Öffne die amtliche PDF (quelleUrl im Snapshot) und prüfe 5–8 zufällige Tarifzeilen je Erlass: Beschreibung + Betrag exakt? Keine Zeile verloren/erfunden? Vortext sinnvoll?
  - Bug: Gibt es Blöcke, die FÄLSCHLICH zur Tabelle wurden (normaler Text mit «…»)? Falls ja → `betragAmAnfang`/`LEADER` in Task 1/2 verschärfen, Tests ergänzen, Tasks neu, dann regenerieren.

- [ ] **Step 3: check:normtext (offline Drift/Schema) grün**

Run: `npm run check:normtext`
Expected: grün (neue `tabelle`-Felder schema-konform; SHA neu, aber konsistent erzeugt).

- [ ] **Step 4: Golden aktualisieren (deklarierter fachlicher Schritt, §6 Ziff. 3)**

Run: `npm run golden:vergleich`
Erwartung: zeigt Abweichungen NUR in den 3 SG-Erlassen (Struktur-Änderung). Abweichungen je Fall ansehen: `npm run golden:diff -- <id>` für 2–3 SG-Fälle. Dann Golden neu festschreiben gemäss Projekt-Konvention (z.B. `npm run golden:schreiben` falls vorhanden — sonst die im Repo etablierte Golden-Update-Route; KEINE Test-Aufweichung, nur den Golden-Stand auf den neuen, sicht­geprüften Output setzen).

- [ ] **Step 5: Volles Tor grün**

Run: `npm run gate`
Expected: grün (tsc · vitest · golden · lint · build · check:normtext/zitate/vollstaendigkeit). Bei Rot: §6 Ziff. 5 Diagnose, Ursache beheben.

- [ ] **Step 6: Commit (generierte Artefakte gebündelt)**

```bash
git add public/normtext/kanton/SG-2935.json public/normtext/kanton/SG-3849.json public/normtext/kanton/SG-2808.json public/normtext/register.json golden/lexmetrik-golden.json
git commit -m "chore(normtext): SG-Tarif-Snapshots mit tabelle regeneriert + Golden aktualisiert" -- public/normtext/kanton/SG-2935.json public/normtext/kanton/SG-3849.json public/normtext/kanton/SG-2808.json public/normtext/register.json golden/lexmetrik-golden.json
```
(Falls `register.json` unverändert: aus add/commit weglassen.)

---

### Task 7: Adversarialer Schluss-Bug-Check + visuelle Verifikation

Unabhängiger Durchgang, der gezielt Fehlschnitte, veränderten Inhalt und Render-Defekte sucht (Daueranweisung «immer wieder Logik+Bug-Check» + §9-Bug-Check vor Deploy).

**Files:** keine (Verifikation)

- [ ] **Step 1: Adversarialer Daten-Check (unabhängige Perspektive)**

Dispatch einen frischen Subagenten (oder eigener fokussierter Durchgang) mit dem Auftrag: «Suche in den 3 neuen SG-Snapshots gezielt nach (a) Tabellenzeilen, deren Betrag offensichtlich Teil der Beschreibung ist oder umgekehrt, (b) verlorenen/duplizierten Zeilen gegenüber der amtlichen PDF, (c) normalen Absätzen, die fälschlich zur Tabelle wurden, (d) leeren beschreibung/betrag.» Befund melden.

- [ ] **Step 2: Visuelle Verifikation im laufenden App**

App starten und die Gesetze-Ansicht der 3 SG-Erlasse öffnen (Route `/gesetze/kanton/SG-…`), je 1–2 Tarif-Artikel ansehen: Tabelle sauber 2-spaltig, Beträge rechtsbündig/`tabular-nums`, keine literalen Punkte mehr, Vortext korrekt davor. (Skill `run`/`verify` nutzen.)
  - Logik: stimmt das Bild mit der amtlichen PDF überein?
  - Bug: Mobile-Ansicht (schmaler Viewport) — bricht die Tabelle sauber um?

- [ ] **Step 3: Schlussbefund + Übergabe**

Befund zusammenfassen (was geprüft, was sauber, was offen). KEIN Deploy ohne Davids Ja (§9). STRUKTUR.md-Session-Karte nachziehen (Pflegeregel — der SessionStart-Hook erinnert sonst). Danach David fragen: PR/Merge + Deploy?

---

## Self-Review (gegen Spec)

- **Spec-Abdeckung:** Füllpunkt-Detektor (Task 1–2) ✓; Datenmodell `tabelle` additiv (Task 3–4) ✓; UI-2-Spalten (Task 5) ✓; SG-only Scope (Task 6) ✓; iterativer Logik+Bug-Check je Task + adversarial (alle Tasks Step «Logik+Bug-Check» + Task 7) ✓; Drift-SHA deckt tabelle (Task 3 + 4) ✓; Golden als deklarierter Schritt (Task 6) ✓; kein Deploy (Task 7) ✓. Token-Entklebung (`2Promille`): bewusst NICHT separat — sie steckt in der Beschreibung und bleibt wortlaut-treu; falls sie in der visuellen Prüfung (Task 7) stört, eigener Folge-Task. **Vermerkt als bewusste Scope-Grenze.**
- **Platzhalter:** keine offenen TODO/TBD; alle Code-Schritte mit vollständigem Code.
- **Typkonsistenz:** `TarifZeile {beschreibung, betrag}` einheitlich über tarif-tabelle.ts → PdfBlock → typen.ts → sha256Bloecke → ArtikelBody.
```
