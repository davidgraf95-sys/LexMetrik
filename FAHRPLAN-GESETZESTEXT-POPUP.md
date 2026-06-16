# Gesetzestext-Popup (Norm-Vorschau) — Implementierungs-Fahrplan

> **Für agentische Worker:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development`
> (empfohlen) oder `superpowers:executing-plans`, Task für Task. Schritte nutzen
> Checkbox-Syntax (`- [ ]`). Vor jeder Struktur-Arbeit: `CLAUDE.md` §1–§12 und
> `STRUKTUR.md` lesen. Bei mehreren Sessions: §12 (Worktree-Isolation).

**Ziel:** Beim Klick auf einen Normverweis erscheint ein Popover mit dem
**Volltext des einschlägigen Artikels** (Bund **und** Kanton), die zitierte
Stelle (Abs./lit./Ziff.) **hervorgehoben**, mit Quelle + Stand und erst danach
dem Link zur amtlichen Fassung — statt sofortiger Weiterleitung.

**Architektur (der schlaue Weg, kein Brute-Force):** Drei Schichten.
(1) **Build-time-Snapshot** der *zitierten* Artikel als statische JSON-Dateien —
Bund aus den **bereits gecachten** Fedlex-Filestore-HTMLs (`fedlex-cache.sh`),
Kantone über **einen** LexWork-Adapter (18 von 26 Kantonen teilen die Plattform
`…/app/{de|fr}/texts_of_law/{id}`) plus wenige Spezial-Adapter. (2) **Client-
Loader** lädt die JSON lazy beim Öffnen (nie im Haupt-Bundle). (3) **`<NormPopover>`**
als *progressive enhancement* des zentralen `NormLink`: Snapshot vorhanden → reicher
Popover; fehlt → heutiges Verhalten (reiner Link). Null Regression, PDF unberührt.

**Tech-Stack:** React 19 + Vite + TypeScript (Browser-only, kein Server),
Tailwind, Vitest, Playwright; Build-Skripte als `vite-node`. Quellen: Fedlex
Filestore-HTML (`id="art_…"`), LexWork-SPA-Backend (clex.ch u. a.).

---

## §7-Entscheid (Voraussetzung dieses Fahrplans)

David hat am 16.6.2026 **§7 für Zitate gelockert**: gespeicherter Gesetzestext
ist erlaubt, **sofern** jeder Snapshot trägt: (a) **Stand** (Konsolidierungs-/
Abrufdatum), (b) **amtliche Quelle-URL**, (c) **Live-Link** zur geltenden Fassung
sichtbar im Popover, (d) **Drift-Erkennung** (automatischer Abgleich gegen die
Quelle, damit nie stillschweigend veraltet). Dieser Fahrplan setzt (a)–(d) als
*nicht verhandelbare* Bausteine um — sonst kippt der §7-Konflikt zurück.

**Erste Umsetzungs-Aufgabe:** `CLAUDE.md` §7 um einen Absatz „Zitat-Ausnahme
(Snapshot)" ergänzen, der (a)–(d) festschreibt, damit der Code-Grundsatz mit der
Realität übereinstimmt (§8 Ehrlichkeit). Ohne diese Eintragung kein Merge.

---

## Architektur-Kern: warum nicht Brute-Force

| Naiver Weg | Schlauer Weg (dieser Plan) | Beleg |
|---|---|---|
| 26 Kantons-Scraper, PDF-Parsing, 2–3 Wo. | **1 LexWork-Adapter** deckt 18 Kt.; 4 Spezial-Adapter; 2 ehrliche Fallbacks | `erlassLinks.ts:14–38` — 18× `…/app/{de\|fr}/texts_of_law/{id}` |
| Bund neu fetchen | **Bestehenden Fedlex-Cache extrahieren** (`id="art_x"` schon da) | `scripts/fedlex-cache.sh:96–135` |
| Ganze Gesetze speichern | **Nur zitierte Artikel** (begrenzte Menge) | `~615` Bund-Artikel; strukturierte `artikel:`-Felder in `src/data/tarif/*.ts` (1016 Einträge) |
| Staleness-Risiko | **SPARQL-Drift-Check wiederverwenden** + LexWork-`versions/{id}` pinnen | `scripts/fedlex-versionen-pruefen.ts` existiert |
| Volltext ins Bundle | **Lazy-Fetch statischer JSON** aus `public/normtext/` | §3, Bundle-Disziplin |

**„Wörter, die auf den Passus zeigen":** Die Zitate sind granular (`Art. 335c
Abs. 1`, `§ 4 Abs. 1`). Im eigenen Popover heben wir den genannten Abs./lit./Ziff.
**zuverlässig** hervor (wir kontrollieren das Markup). Für den externen Link
hängen wir ein `#:~:text=`-Text-Fragment an (Chromium hebt hervor; Safari/Firefox
ignorieren es gefahrlos).

---

## Datenmodell (Single Source of Truth für Snapshots)

**Datei:** `src/lib/normtext/typen.ts` (NEU)

```ts
// Ein Snapshot-Eintrag = genau EIN Artikel eines Erlasses, mit Provenienz.
// §7-Zitat-Ausnahme: stand + quelleUrl + abgerufen sind PFLICHT (kein Default).
export interface NormSnapshot {
  /** Stabiler Schlüssel, z.B. 'bund/OR/art_335_c' oder 'kanton/BE/161.12/art_4'. */
  id: string;
  ebene: 'bund' | 'kanton';
  /** Bund: FedlexGesetz-Key ('OR'). Kanton: Kantonskürzel ('BE'). */
  quelle: string;
  /** Erlass-Bezeichnung wie zitiert ('OR', 'GebV OG / LS 211.11'). */
  erlass: string;
  /** Artikel-Token wie im Anker ('335_c', '4'); Paragraf-Erlasse: '4'. */
  artikel: string;
  /** Menschliche Artikel-Bezeichnung ('Art. 335c', '§ 4'). */
  artikelLabel: string;
  /** Absatz-/Marginalie-Blöcke in Reihenfolge; absatz: '1','2','a','bis' … */
  bloecke: Array<{ absatz: string | null; text: string }>;
  /** Konsolidierungs-/Fassungsdatum der Quelle (ISO 'YYYY-MM-DD'). */
  stand: string;
  /** Amtliche Live-URL (mit Anker, wenn vorhanden). */
  quelleUrl: string;
  /** Abrufdatum des Snapshots (ISO). */
  abgerufen: string;
  /** Drift-Token: Bund=Konsolidierung 'YYYYMMDD'; LexWork=versions/{id}. */
  fassungsToken: string;
  /** sha256 des extrahierten Volltexts — Regressions-/Drift-Anker. */
  sha: string;
}

/** Eine Snapshot-Datei pro Erlass/Kanton. */
export interface NormSnapshotDatei {
  erzeugt: string;            // ISO, vom Build-Skript gestempelt (via args, nie Date.now im Skript)
  eintraege: NormSnapshot[];
}
```

**Speicherort der Snapshots:** `public/normtext/bund/<GESETZ>.json` und
`public/normtext/kanton/<KT>-<erlassNr>.json`. Vite serviert `public/` an der
Wurzel → Client-`fetch('/normtext/...')`, lazy. **Nie** im JS-Bundle (§3).

---

## Dateistruktur (Überblick)

| Datei | Verantwortung | Status |
|---|---|---|
| `src/lib/normtext/typen.ts` | Datentypen (oben) | NEU |
| `src/lib/normtext/passus.ts` | Zitat → {artikelToken, absatz} parsen; `#:~:text=` bauen | NEU |
| `src/lib/normtext/laden.ts` | Client: Snapshot lazy laden + In-Memory-Cache | NEU |
| `src/components/NormPopover.tsx` | Popover-UI (Volltext + Highlight + Quelle/Stand + Live-Link) | NEU |
| `src/components/vorlagen/ui.tsx` | `NormLink` → Popover-Trigger einhängen (progressive enhancement) | MOD `:82–95` |
| `scripts/normtext/extrahiere-fedlex.ts` | Bund: aus gecachtem Filestore-HTML Artikel extrahieren | NEU |
| `scripts/normtext/adapter-lexwork.ts` | 18 Kt.: LexWork-Backend → Artikel | NEU |
| `scripts/normtext/adapter-zhlex.ts`, `…-romandie.ts` | ZH / TI/VD/NE/GE/JU | NEU (Phase 3) |
| `scripts/normtext/inventar.ts` | Liste der zu snapshottenden (Erlass, Artikel) sammeln | NEU |
| `scripts/normtext-snapshot.ts` | Orchestrator: Inventar → Adapter → `public/normtext/*.json` | NEU |
| `scripts/normtext/check-drift.ts` | CI: Snapshot-Fassung vs. Quelle (erweitert `check:netz`) | NEU |
| `src/tests/normtext-*.test.ts` | Unit-Tests | NEU |
| `golden/normtext-snapshot.json` | Golden-Regression der erzeugten Snapshots | NEU |
| `CLAUDE.md` | §7 Zitat-Ausnahme dokumentieren | MOD |

---

## PHASE 0 — Fundament: Zitat-Parser + Datentypen (rein, TDD)

Kein Netz, keine UI. Liefert die Bausteine, auf denen alles ruht.

### Task 0.1: §7-Zitat-Ausnahme in CLAUDE.md

**Files:** Modify: `CLAUDE.md` (§7-Block)

- [ ] **Schritt 1:** In §7 nach dem bestehenden Absatz einfügen:

```markdown
**Zitat-Ausnahme (Snapshot, Entscheid David 16.6.2026):** Gespeicherter
Gesetzestext (Norm-Snapshot) ist zulässig, wenn er trägt: (a) Stand
(Konsolidierungs-/Abrufdatum), (b) amtliche Quelle-URL, (c) im UI sichtbaren
Live-Link zur geltenden Fassung, (d) automatische Drift-Erkennung gegen die
Quelle (kein stilles Veralten). Fehlt eines davon, ist der Snapshot kein
Zitat, sondern eine zweite Wahrheit (§5) — dann nicht speichern.
```

- [ ] **Schritt 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: §7 Zitat-Ausnahme für Norm-Snapshots (Entscheid David 16.6.2026)"
```

### Task 0.2: Zitat → Passus-Parser

**Files:** Create `src/lib/normtext/passus.ts`; Test `src/tests/normtext-passus.test.ts`

- [ ] **Schritt 1: Failing-Test**

```ts
import { describe, it, expect } from 'vitest';
import { parsePassus, textFragment } from '../lib/normtext/passus';

describe('parsePassus', () => {
  it('liest Artikel-Token und Absatz aus einem OR-Zitat', () => {
    expect(parsePassus('Art. 335c Abs. 1 OR')).toEqual({ artikelToken: '335_c', absatz: '1' });
  });
  it('liest Paragraf + Absatz (kantonal)', () => {
    expect(parsePassus('§ 4 Abs. 1')).toEqual({ artikelToken: '4', absatz: '1' });
  });
  it('ohne Absatz → absatz null', () => {
    expect(parsePassus('Art. 96 ZPO')).toEqual({ artikelToken: '96', absatz: null });
  });
  it('lit.-Angabe wird als Absatz-Verfeinerung erkannt', () => {
    expect(parsePassus('Art. 6 Abs. 1 lit. h StG')).toEqual({ artikelToken: '6', absatz: '1' });
  });
});

describe('textFragment', () => {
  it('baut ein gekürztes #:~:text=-Fragment aus den ersten Wörtern', () => {
    expect(textFragment('Der Arbeitgeber kann das Arbeitsverhältnis nicht kündigen, solange …'))
      .toBe('#:~:text=Der%20Arbeitgeber%20kann%20das%20Arbeitsverh%C3%A4ltnis%20nicht');
  });
});
```

- [ ] **Schritt 2: Lauf → FAIL** — `npx vitest run src/tests/normtext-passus.test.ts` (Modul fehlt)

- [ ] **Schritt 3: Implementierung**

```ts
// src/lib/normtext/passus.ts
// Zitat-Zerlegung. Das Artikel-Token folgt dem Fedlex-Anker-Format
// (335c → 335_c, 334bis → 334_bis), kongruent zu src/lib/fedlex.ts.
const ART = /(?:Art\.?|§)\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)/i;
const ABS = /Abs\.?\s*(\d+[a-z]?)/i;
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/;

export interface Passus { artikelToken: string; absatz: string | null }

export function parsePassus(zitat: string): Passus | null {
  const a = zitat.match(ART);
  if (!a) return null;
  const artikelToken = a[1].toLowerCase()
    .replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
  const abs = zitat.match(ABS);
  return { artikelToken, absatz: abs ? abs[1].toLowerCase() : null };
}

// Text-Fragment für externe Links (Chromium hebt hervor, andere ignorieren).
// Erste 6 Wörter genügen für eine eindeutige Sprungmarke.
export function textFragment(text: string): string {
  const woerter = text.trim().split(/\s+/).slice(0, 6).join(' ');
  return `#:~:text=${encodeURIComponent(woerter)}`;
}
```

- [ ] **Schritt 4: Lauf → PASS** — `npx vitest run src/tests/normtext-passus.test.ts`
- [ ] **Schritt 5: Commit** — `git commit -m "feat(normtext): Zitat→Passus-Parser + Text-Fragment" -- src/lib/normtext/passus.ts src/tests/normtext-passus.test.ts`

### Task 0.3: Datentypen

**Files:** Create `src/lib/normtext/typen.ts` (Inhalt siehe Datenmodell oben)

- [ ] **Schritt 1:** Datei mit den Interfaces `NormSnapshot` / `NormSnapshotDatei` anlegen (Wortlaut oben).
- [ ] **Schritt 2: Type-Check** — `npx tsc -b` → PASS
- [ ] **Schritt 3: Commit** — `git commit -m "feat(normtext): Snapshot-Datentypen" -- src/lib/normtext/typen.ts`

---

## PHASE 1 — Bund-Snapshot aus bestehendem Fedlex-Cache

Höchster ROI, niedrigstes Risiko: die Filestore-HTMLs liegen schon mit
`id="art_…"`-Ankern vor (`fedlex-cache.sh`). Wir extrahieren nur.

### Task 1.1: Artikel-Extraktor aus Filestore-HTML

**Files:** Create `scripts/normtext/extrahiere-fedlex.ts`; Test `src/tests/normtext-fedlex.test.ts`

- [ ] **Schritt 1: Failing-Test** (Fixture aus echtem Cache-Ausschnitt)

```ts
import { describe, it, expect } from 'vitest';
import { extrahiereArtikel } from '../../scripts/normtext/extrahiere-fedlex';

// Minimal-HTML im Fedlex-Format (article id="art_77", <p> je Absatz).
const HTML = `<article id="art_77"><h6 class="heading">Art. 77</h6>
<div class="collapseable"><p class="absatz"><sup>1</sup> Soll die Erfüllung …</p>
<p class="absatz"><sup>2</sup> Hierbei werden …</p></div></article>`;

describe('extrahiereArtikel', () => {
  it('liefert die Absatz-Blöcke eines Artikels in Reihenfolge', () => {
    const r = extrahiereArtikel(HTML, '77');
    expect(r?.bloecke.map(b => b.absatz)).toEqual(['1', '2']);
    expect(r?.bloecke[0].text).toMatch(/^Soll die Erfüllung/);
  });
  it('null, wenn der Anker fehlt', () => {
    expect(extrahiereArtikel(HTML, '999')).toBeNull();
  });
});
```

- [ ] **Schritt 2: Lauf → FAIL**

- [ ] **Schritt 3: Implementierung** (regex-basiert; SPIKE bestätigt das genaue
  Fedlex-Markup an einem echten Cache, siehe Task 1.2 — die Selektoren hier sind
  gegen das verifizierte Format zu justieren, falls der Spike abweicht)

```ts
// scripts/normtext/extrahiere-fedlex.ts
// Extrahiert einen Artikel aus einem konsolidierten Fedlex-Filestore-HTML.
// Annahme (Spike 1.2 verifiziert): <article id="art_<token>"> … </article>,
// Absätze als <p class="absatz"> mit führendem <sup>N</sup>.
export interface ArtikelText { bloecke: Array<{ absatz: string | null; text: string }> }

export function extrahiereArtikel(html: string, token: string): ArtikelText | null {
  const re = new RegExp(`<article[^>]*id="art_${token}"[^>]*>([\\s\\S]*?)</article>`, 'i');
  const m = html.match(re);
  if (!m) return null;
  const inner = m[1];
  const absRe = /<p[^>]*class="[^"]*absatz[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  const bloecke: ArtikelText['bloecke'] = [];
  for (const a of inner.matchAll(absRe)) {
    const roh = a[1];
    const supN = roh.match(/<sup[^>]*>(\d+[a-z]?)<\/sup>/i)?.[1] ?? null;
    const text = entferneTags(roh).replace(/^\s*\d+[a-z]?\s*/, '').trim();
    if (text) bloecke.push({ absatz: supN, text });
  }
  if (bloecke.length === 0) {
    const text = entferneTags(inner).replace(/^\s*Art\.\s*\S+\s*/, '').trim();
    if (text) bloecke.push({ absatz: null, text });
  }
  return { bloecke };
}

function entferneTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
```

- [ ] **Schritt 4: Lauf → PASS**
- [ ] **Schritt 5: Commit**

### Task 1.2: SPIKE — echtes Fedlex-Markup verifizieren (§7 doppelt-prüfen)

**Files:** keine (Verifikation)

- [ ] **Schritt 1:** Cache erzeugen — `bash scripts/fedlex-cache.sh` (lädt `/tmp/or.html` etc.).
- [ ] **Schritt 2:** An `/tmp/or.html` prüfen: Wie genau ist ein Artikel ausgezeichnet
  (`<article id="art_335_c">`? Klasse der Absätze? `<sup>`-Nummerierung?). Treffer
  notieren; **falls abweichend, die Regex in 1.1 anpassen** und Test-Fixture aus
  echtem Ausschnitt nachziehen. Belegen mit `grep -o 'id="art_335_c"[^>]*' /tmp/or.html`.
- [ ] **Schritt 3:** Gegenprobe an einem zweiten Gesetz (`/tmp/zpo.html`, Art. 96)
  und einem Buchstaben-Artikel (`art_335_c`) + lat. Suffix (`art_334_bis` falls vorhanden).
- [ ] **Schritt 4: Commit** der ggf. justierten Extraktor-Version + Fixtures.

### Task 1.3: Inventar der zu snapshottenden Bund-Artikel

**Files:** Create `scripts/normtext/inventar.ts`; Test `src/tests/normtext-inventar.test.ts`

- [ ] **Schritt 1: Failing-Test** — `sammleBundArtikel()` liefert je Gesetz die
  Menge distinkter Artikel-Token, gespeist aus (a) den `artikel:`-Feldern in
  `src/data/tarif/*.ts` und (b) dem Pflicht-Anker-Inventar aus `fedlex-cache.sh`.

```ts
import { describe, it, expect } from 'vitest';
import { sammleBundArtikel } from '../../scripts/normtext/inventar';

describe('sammleBundArtikel', () => {
  it('gruppiert distinkte Artikel-Token je Gesetz', async () => {
    const inv = await sammleBundArtikel();
    expect(inv.OR).toContain('335_c');
    expect(inv.ZPO).toContain('96');
    expect(new Set(inv.OR).size).toBe(inv.OR.length); // distinkt
  });
});
```

- [ ] **Schritt 2: Lauf → FAIL**
- [ ] **Schritt 3: Implementierung** — `artikel:`-Strings über `parsePassus` →
  Token, je `FedlexGesetz` gruppieren; Pflicht-Anker aus einer aus `fedlex-cache.sh`
  gepflegten Konstante mergen (Single Source: dieselbe Anker-Liste, nicht doppelt
  tippen — aus dem Shell-Skript per Parser ziehen oder in `fedlex.ts` zentralisieren).
- [ ] **Schritt 4: Lauf → PASS**
- [ ] **Schritt 5: Commit**

### Task 1.4: Orchestrator schreibt Bund-Snapshots

**Files:** Create `scripts/normtext-snapshot.ts`; Modify `package.json` (Script `normtext`)

- [ ] **Schritt 1:** `normtext-snapshot.ts`: über `sammleBundArtikel()` iterieren,
  je Gesetz `/tmp/<gesetz>.html` (oder frisch via `fedlex-cache.sh`-URL-Schema)
  lesen, `extrahiereArtikel` je Token, `NormSnapshot` mit `stand`=Konsolidierung,
  `quelleUrl`=`fedlexUrl(gesetz, …)`, `fassungsToken`=Konsolidierungs-`YYYYMMDD`,
  `sha`=sha256(Volltext) bauen; `abgerufen`/`erzeugt` aus `args` (kein `Date.now`,
  §2). Ausgabe `public/normtext/bund/<GESETZ>.json`.
- [ ] **Schritt 2:** `package.json` → `"normtext": "vite-node scripts/normtext-snapshot.ts"`.
- [ ] **Schritt 3: Lauf** — `npm run normtext` → prüfen, dass `public/normtext/bund/OR.json`
  z. B. `art_335_c` mit 2 Blöcken enthält (Sperrfristen-Artikel). Stichprobe gegen
  Fedlex-Live (doppelt verifizieren, David-Direktive).
- [ ] **Schritt 4: Golden festhalten** — `golden/normtext-snapshot.json` (Hash-Index
  je Eintrag) committen; spätere Läufe müssen byte-/hash-gleich sein (§6).
- [ ] **Schritt 5: Commit**

---

## PHASE 2 — Popover-UI (mit Bund-Daten sichtbar machen)

Erst jetzt UI — gegen vorhandene Bund-Snapshots. Liefert sofort sichtbaren Wert.

### Task 2.1: Client-Loader (lazy, gecacht)

**Files:** Create `src/lib/normtext/laden.ts`; Test `src/tests/normtext-laden.test.ts`

- [ ] **Schritt 1: Failing-Test** — `ladeSnapshot('OR', '335_c')` fetcht
  `/normtext/bund/OR.json` (gemockt), cached die Datei, liefert den Eintrag; zweiter
  Aufruf ohne erneuten Fetch.
- [ ] **Schritt 2: FAIL**
- [ ] **Schritt 3: Implementierung** — `fetch` + `Map`-Cache je Datei; Rückgabe
  `NormSnapshot | null`; Fehler/404 → `null` (Fallback-Pfad, kein Throw).
- [ ] **Schritt 4: PASS**
- [ ] **Schritt 5: Commit**

### Task 2.2: `<NormPopover>`-Komponente

**Files:** Create `src/components/NormPopover.tsx`; Test `src/tests/NormPopover.test.tsx`

- [ ] **Schritt 1: Failing-Test** — rendert Artikel-Label, alle Blöcke, hebt den
  zitierten Absatz hervor (`data-passus="true"`), zeigt „Stand …", und einen
  Live-Link (`target=_blank`, `rel=noopener`) auf `quelleUrl`. A11y: `role="dialog"`,
  Fokus-Falle, Schliessen per Esc.
- [ ] **Schritt 2: FAIL**
- [ ] **Schritt 3: Implementierung** — Popover (kein Framework, Tailwind + die
  bestehenden `ui.tsx`-Primitive). Highlight: Block, dessen `absatz` == `passus.absatz`,
  bekommt Hervorhebungs-Klasse. Kopf: Artikel-Label + Erlass. Fuss: „Stand {stand} ·
  geltende Fassung ↗" → `quelleUrl + textFragment(zitierterBlockText)`. Disclaimer
  (§8): „Snapshot — massgeblich ist die amtliche Fassung."
- [ ] **Schritt 4: PASS**
- [ ] **Schritt 5: Commit**

### Task 2.3: `NormLink` → Popover-Trigger (progressive enhancement, Null-Regression)

**Files:** Modify `src/components/vorlagen/ui.tsx:82–95`; Test `src/tests/NormLink.test.tsx`

- [ ] **Schritt 1: Failing-Test** — (a) ist ein Snapshot ladbar, öffnet Klick den
  Popover statt sofort zu navigieren; (b) ist keiner ladbar **oder** läuft im
  PDF-/SSR-Pfad, bleibt das heutige `<a target=_blank>`-Verhalten **unverändert**
  (Regressionsschutz). Golden-PDF darf sich nicht ändern.
- [ ] **Schritt 2: FAIL**
- [ ] **Schritt 3: Implementierung** — `NormLink` rendert weiterhin den Link;
  zusätzlich `onClick` → versuche `ladeSnapshot`; bei Treffer `preventDefault` +
  Popover öffnen; sonst normaler Link. Popover nur clientseitig (kein Effekt auf
  Prerender/PDF). `parsePassus(artikel)` liefert Token + Absatz.
- [ ] **Schritt 4: PASS** + `npm run golden:vergleich` byte-gleich (§6).
- [ ] **Schritt 5: Smoke** — `npm run gate:schnell`; Playwright: ein Rechner-Ergebnis,
  Klick auf `Art. 335c OR`-Chip → Popover mit Volltext + Highlight Abs. 1, Live-Link
  vorhanden, 0 Console-Fehler.
- [ ] **Schritt 6: Commit**

---

## PHASE 3 — Kantone: ein LexWork-Adapter (18 Kt.) + Spezialfälle

### Task 3.1: SPIKE — LexWork-Backend-Vertrag pinnen (Keystone, §7 doppelt)

**Files:** keine (Verifikation; Ergebnis = Adapter-Vertrag in 3.2)

LexWork ist eine SPA → der sichtbare HTML ist eine Shell; der Volltext kommt aus
einem JSON-Backend. **Dieser Spike pinnt das echte Endpoint-Schema**, bevor Code
entsteht (sonst rät der Adapter).

- [ ] **Schritt 1:** An einem Kanton (BE, `…/app/de/texts_of_law/161.12`) die
  Netzwerk-Requests inspizieren (DevTools/`curl` der vermuteten API-Pfade, z. B.
  `/api/.../texts_of_law/161.12` oder `…/versions/{id}`). Echte JSON-Antwort sichern.
- [ ] **Schritt 2:** Klären: (a) Wird Volltext je Artikel oder als ein Dokument
  geliefert? (b) Wie sind Artikel/§ ausgezeichnet (Feld, Anker, Nummerierung)?
  (c) Wie heisst die Fassungs-/Versions-ID (`versions/{id}`) → `fassungsToken`?
  (d) Stabil über die clex-Instanzen (BE/LU/OW/NW/GL/ZG/FR/SO/BS/BL/SH/AR/AI/SG/GR/AG/TG/VS)?
- [ ] **Schritt 3:** Stichprobe an 3 Instanzen unterschiedlicher Subdomains
  (`belex`, `bl.clex.ch`, `gesetzessammlung.sg.ch`) → Vertrag bestätigen oder
  Sub-Varianten dokumentieren.
- [ ] **Schritt 4:** Vertrag in `scripts/normtext/adapter-lexwork.ts` als Kommentar-
  Header + Fixture (`src/tests/fixtures/lexwork-be-161.12.json`) festschreiben.
  **Falls kein offenes JSON-Backend existiert** → Fallback-Entscheid: HTML der
  gerenderten Version parsen oder Kanton in den ehrlichen Fallback (Task 3.4)
  verschieben. Ergebnis dokumentieren (§11, `bibliothek/`-Eintrag).

### Task 3.2: LexWork-Adapter (TDD gegen Fixture aus 3.1)

**Files:** Create `scripts/normtext/adapter-lexwork.ts`; Test `src/tests/normtext-lexwork.test.ts`

- [ ] **Schritt 1: Failing-Test** — `holeLexWork({basis, erlassId, artikel:['4']})`
  liefert gegen die 3.1-Fixture einen `NormSnapshot` mit Blöcken, `fassungsToken`
  aus der Versions-ID, `quelleUrl` = amtlicher Deep-Link.
- [ ] **Schritt 2: FAIL**
- [ ] **Schritt 3: Implementierung** — exakt nach dem in 3.1 gepinnten Vertrag
  (JSON-Fetch + Artikel-Selektion + Block-Parsing). **Eine** Funktion für alle 18
  Instanzen, parametrisiert über `basis`-URL aus `erlassLinks.ts`.
- [ ] **Schritt 4: PASS**
- [ ] **Schritt 5: Orchestrator erweitern** — in `normtext-snapshot.ts` über die
  18 LexWork-Kantone iterieren (Mapping Kanton→{basis, erlassId} aus `erlassLinks.ts`
  ableiten), die *zitierten* kantonalen Artikel je Erlass aus den `artikel:`-Feldern
  der `src/data/tarif/*.ts` ziehen (kantonale Inventar-Funktion analog 1.3),
  `public/normtext/kanton/<KT>-<erlassNr>.json` schreiben.
- [ ] **Schritt 6:** `npm run normtext` → Stichprobe BE/SG/BL gegen Live (doppelt
  verifizieren). Golden nachziehen.
- [ ] **Schritt 7: Commit**

### Task 3.3: Popover deckt Kantone ab (kein UI-Code nötig, nur Loader-Key)

**Files:** Modify `src/lib/normtext/laden.ts`, `src/components/vorlagen/ui.tsx`

- [ ] **Schritt 1:** Loader-Schlüssel für kantonale Chips (Kanton + erlassNr +
  Artikel) ergänzen; `NormLink` (bzw. die kantonale Norm-Anzeige) übergibt diese.
- [ ] **Schritt 2: Test** — kantonaler Chip öffnet Popover mit Kantons-Volltext.
- [ ] **Schritt 3: PASS** + Playwright-Smoke (z. B. ZH/BE Gerichtskosten-Chip).
- [ ] **Schritt 4: Commit**

### Task 3.4: Ehrliche Fallbacks (§8) — ZH, lexfind (UR/SZ), Romandie/TI

**Files:** Modify `scripts/normtext-snapshot.ts`; `src/components/NormPopover.tsx`

- [ ] **Schritt 1:** Für Kantone ohne automatisierbaren Volltext (lexfind=PDF UR/SZ;
  TI/VD/NE/GE/JU Spezialformate; ZH zhlex-HTML solange kein Adapter): **keinen
  Schätztext**. Snapshot-Datei optional mit leeren `bloecke` + `quelleUrl` schreiben,
  oder gar keine.
- [ ] **Schritt 2:** Popover ohne Volltext zeigt: Erlass + Artikel-Label + Stand +
  „Volltext-Snapshot in Vorbereitung" + prominenten Live-Link. (Identisch zum
  heutigen Nutzen, plus Kontext.)
- [ ] **Schritt 3:** Abdeckungs-Log (§ kein stilles Cap): das Snapshot-Skript gibt
  am Ende aus, welche (Kanton, Erlass) ohne Volltext blieben — als Klartext-Liste.
- [ ] **Schritt 4 (optional, ROI-getrieben):** ZH-Adapter (`adapter-zhlex.ts`) bzw.
  Romandie nur, wenn nach G1-Praxisfeedback gefragt. Bis dahin Fallback.
- [ ] **Schritt 5: Commit**

---

## Querschnitt — Verifikation, Drift, Bundle, CI

### Task Q.1: Drift-Check in `check:netz`

**Files:** Create `scripts/normtext/check-drift.ts`; Modify `package.json`

- [ ] Bund: aktuelle Konsolidierung via vorhandenem SPARQL-Check
  (`fedlex-versionen-pruefen.ts`) gegen `fassungsToken` der Snapshots; Abweichung →
  Fehler („Snapshot veraltet, `npm run normtext` neu laufen"). LexWork: `versions/{id}`
  der Quelle gegen `fassungsToken`. In `check:netz` einhängen.
- [ ] Test: künstlich veralteter Token → Check schlägt fehl. Commit.

### Task Q.2: Anker-/Vollständigkeits-Prüfung erweitern

**Files:** Modify `scripts/norm-zitate-pruefen.ts` (oder neuer `check:zitate`-Teil)

- [ ] Jeder zitierte Bund-Artikel, der einen Snapshot haben sollte, hat einen
  (Inventar ⊆ Snapshot). Fehlende → Liste. Commit.

### Task Q.3: Bundle-Disziplin verifizieren (§3)

- [ ] `npm run build` → bestätigen, dass `public/normtext/*` **nicht** ins JS-Bundle
  wandert (nur statisch ausgeliefert), 51 Routen weiter prerendered, Bundle-Grösse
  unverändert (Lazy-Fetch). Beleg in der Session-Karte.

### Task Q.4: Bibliotheks-Eintrag (§11)

- [ ] `bibliothek/`-Dossier „Norm-Snapshot-System" (Quelle/Stand je Plattform,
  Adapter-Verträge, Drift-Mechanik, Abdeckung je Kanton) + `INDEX.md`-Eintrag.

---

## Risiko-Register

| Risiko | Wirkung | Gegenmassnahme |
|---|---|---|
| LexWork hat **kein** offenes JSON-Backend | Phase 3 Keystone wackelt | Spike 3.1 **vor** Code; Fallback HTML-Parse od. ehrlicher Fallback 3.4 |
| Fedlex-Markup weicht von Annahme ab | Extraktor falsch | Spike 1.2 pinnt echtes Markup, Test-Fixtures aus echtem Cache |
| `#:~:text=` nur Chromium | Highlight extern teils aus | Akzeptiert; In-Popover-Highlight ist die zuverlässige Lösung |
| Snapshot veraltet still | §7-Verletzung | Drift-Check Q.1 als CI-Tor; `stand` immer sichtbar |
| Golden/PDF ändert sich | §6-Verletzung | Popover nur Screen; Task 2.3 prüft Golden byte-gleich |
| Urheberrecht Gesetzestext | rechtlich | CH: amtliche Erlasse gemeinfrei (URG); dennoch Quelle+Live-Link (§8) |

## Offene Entscheide (vor/at Phase 3 zu klären)

1. **Snapshot-Tiefe:** nur zitierte Artikel (dieser Plan) — oder bei kantonalen
   Tarif-Erlassen den **ganzen** kleinen Erlass (oft <30 Artikel)? Empfehlung: nur
   zitierte; ganzer Erlass nur, wenn LexWork ihn ohnehin als ein Dokument liefert.
2. **Mehrsprachigkeit:** VS/Romandie/TI sind frz./ital. Popover zeigt die Sprache
   der Quelle; UI-Locale-Umschaltung später.
3. **ZH-Adapter jetzt oder nach G1?** Empfehlung: nach G1-Praxisfeedback (Fallback
   bis dahin), da ZH ein Einzel-Adapter ist.

---

## Selbst-Review (gegen die Idee gegengelesen)

- **„Popup mit Gesetzestext"** → Phase 1 (Bund) + 3 (Kantone) liefern Volltext-Blöcke; Phase 2 zeigt sie. ✓
- **„insbesondere kantonal"** → Phase 3 ist der Schwerpunkt; ein Adapter deckt 18/26. ✓
- **„dann erst Link zur Webseite"** → Popover-Fuss trägt immer den Live-Link (Reihenfolge: erst Text, dann Link). ✓
- **„relevanter Artikel + Wörter, die auf den Passus zeigen"** → `parsePassus` + In-Popover-Highlight (zuverlässig) + `#:~:text=` extern (best effort). ✓
- **§7-Konflikt** → Task 0.1 + Drift-Check Q.1 + sichtbarer Stand/Live-Link lösen ihn regelkonform. ✓
- **Null-Regression** → progressive enhancement (2.3), Golden byte-gleich, PDF unberührt. ✓
