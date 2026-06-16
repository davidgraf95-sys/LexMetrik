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

### Task 3.1: SPIKE — LexWork-Backend-Vertrag ✅ ERLEDIGT (16.6.2026)

**Ergebnis (empirisch verifiziert über 5 Subdomains: BE belex, BL clex, SG
gesetzessammlung, AR clex, ZG bgs):**

- **Endpunkt:** `GET https://<host>/api/{de|fr}/texts_of_law/{erlassId}` → HTTP 200,
  `application/json`, ohne Auth/Header-Tricks. (`/app/` = SPA-Shell; `/api/` = Daten.)
  Version-gepinnt: `…/texts_of_law/{erlassId}/versions/{versionId}`. **Achtung:**
  `/api/de/versions/{id}` ohne `texts_of_law`-Präfix ist **404** — immer den vollen Pfad.
- **JSON-Form:** Top-Level `{ "text_of_law": { … } }`. Volltext als **EIN HTML-Blob**
  in `text_of_law.selected_version.xhtml_tol` (nicht artikelweise). Meta: `systematic_number`,
  `title`, `abbreviation`, `enactment`, `version_uid`, `current_version.{id, version_dates_str}`,
  `old_versions[]`, `future_versions[]`.
- **XHTML-Markup (stabile CSS-Klassen, einheitlich über Kantone):**
  - Artikel: `div.article` → `.article_number > .number` (Nummer) + `.article_title .title_text`
  - Absatz: `div.paragraph` → `.number` (Absatznr.) + `.text_content` (Text)
  - Buchstaben-Listen: `table.enumeration_item` → `td.number` (`a.`) + Text-Zelle
  - Gliederung: `div.level_N.title`; Fussnoten: `a.footnote`. Entities HTML-encodiert.
- **Drift-Token:** `version_uid` (MD5-artig, ändert je Fassung) → ideal für `fassungsToken`.
  `current_version.id` (monoton) + `version_dates_str` als Zusatz. `future_versions[]`
  erlaubt proaktive Warnung vor Inkrafttreten.
- **PDF-Only-Sonderfall:** `xhtml_tol` ist `null` **genau dann**, wenn
  `text_of_law.structured_document_id == null` (Alt-Erlass nur als PDF-Scan). Adapter
  MUSS das behandeln → ehrlicher Fallback (Task 3.4), `pdf_link_tol` als Live-Link.
  Anteil unbekannt → beim Bulk-Lauf zählen.
- **Urteil:** „Adapter machbar via JSON-API" — ein browserloser Build-time-Adapter
  deckt alle 18 Instanzen. (Dossier-Eintrag → Task Q.4.)

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

---

## Betrieb & Build-Regel (verbindlich ab 16.6.2026 — Auftrag David)

**Generator:** `npm run normtext -- --datum=$(date +%F)` erzeugt ALLE Snapshots
unter `public/normtext/{bund,kanton}/` + das Kanton-Manifest `index.json`. Nie
von Hand editieren. Voraussetzung Bund: `bash scripts/fedlex-cache.sh` (lädt die
gepinnten Konsolidierungen nach /tmp).

**Verbindliches Muster (auch für neue Norm-Quellen):**
1. **Vollabdeckung** — alle Artikel je Erlass (Bund: jedes `<article id="art_*">`
   der Konsolidierung; Kanton: jeder Artikel des LexWork-Erlasses), nicht nur die
   zitierten. (Bund-Stand 16.6.2026: 5760 Artikel/18 Gesetze.)
2. **Aufzählungen vollständig** — lit. (Bund, `<dl><dt>/<dd>`) und Ziff. (Kanton,
   `enumeration_item`-Tabellen ODER inline `1. …`) als `items: {marke,text}[]` je
   Absatz. Nichts abschneiden.
3. **Geltende Fassung** — Bund: gepinnte Fedlex-Konsolidierung, durch
   `check:fedlex-versionen` (SPARQL) als „aktuell" bestätigt; künftige Fassungen
   NICHT pinnen. Kanton: `current_version` der LexWork-API (`/api/{de|fr}/texts_of_law/{id}`),
   `version_uid` = Drift-Token, `stand` = „in Kraft seit"-Datum aus `version_dates_str`.
4. **Provenienz** je Eintrag: `stand`, `quelleUrl`, `fassungsToken`, `sha`
   (Text + items) — §7-Zitat-Ausnahme.
5. **Drift-Tor:** `check:normtext` (offline: Fassung == Konsolidierung,
   Vollständigkeit) + `check:normtext-netz` (live: version_uid/Konsolidierung) —
   in `check`/`check:netz` verdrahtet, müssen grün sein.

**Neue Norm-Quelle anbinden:** browserloser Adapter (Fetch + strukturierte
Extraktion + Drift-Token), kein Headless-Browser, kein Pro-Kanton-Scraping.
LexWork deckt 18+ Kantone über EINEN Adapter; Nicht-LexWork (zhlex, lexfind-PDF,
TI/VD/NE/GE/JU) bleibt ehrlicher Fallback (Live-Link, kein Volltext, §8) bis ein
Adapter existiert.

**Darstellung (einheitlich Bund/Kanton):** ein `NormPopover` für beide Ebenen;
Absätze + `items` (lit./Ziff.) gleich gerendert; die zitierte Stelle wird präzise
markiert (Item via `passus.lit`/`passus.ziff`, sonst Absatz); aufgehobene Stellen
(„…") erscheinen als „aufgehoben". Live-Link im Fuss, Label „In Kraft seit".

**Pflege:** Bei Rechtsänderung melden die Drift-Checks rot → `npm run normtext`
neu laufen, Caches/Pins in `scripts/fedlex-cache.sh` + `quellen-register.md`
nachführen (§11).

---

## ERLEDIGT 17.6.2026 — Inline-Norm-Auto-Linker «NormText» Phase 1 (Bund) gebaut + verifiziert

**Stand:** Branch `feat/normtext-popup`, ungepusht (Push/Abnahme offen, §9). Phase 1
(bundesrechtliche Inline-Verweise) ist gebaut, getestet, gate-grün, browser-verifiziert.

- **Gebaut:** `NORM_IM_TEXT`-Regex in `fedlex.ts` (Gesetzes-Namen aus den FEDLEX-Keys +
  Alias «GebV SchKG», single source; bewusst KEIN blinder `§`-Regex — kantonal mehrdeutig,
  träfe die CLAUDE.md-§-Prinzipien). `src/components/NormText.tsx` = **universeller**
  Inline-Linker: Normen via `NormChip`-Popover UND Rechtsprechung (threading durch
  `RechtsprechungText`); ersetzt das frühere blosse `<RechtsprechungText>` in `ErgebnisAnzeige`.
  `NormChip` um `linkClass` erweitert (Default = heutige Pillen-Klasse → SSR byte-gleich;
  Inline-Stil nur via NormText). Nicht-auflösbare Nennungen bleiben Text (kein toter Link, §8).
- **Eingebaut (~90 Stellen, screen-only):** `ErgebnisAnzeige` (Warnungen + Annahmen ALLER
  Rechner), Wizard-Bausteinprotokoll, `VorlagenSeite`-Gates, 11 Formular-Dateien
  (hinweise/weichen/warnungen), 18 Vorlagen-Seiten (gates warnungen/hinweise/blocker),
  `Dokumentmappe`, `KvGerichtWahl`.
- **Verifikation:** `npm run gate` voll grün (tsc/vitest/**golden byte-gleich**/lint/check);
  13 neue Tests; 2 unabhängige adversariale Reviews (Regex/Komponente + Integration) ohne
  echten Bug; Browser-Smoke (prozesskosten 9 Inline-Links + Popover «Art. 95 ZPO» öffnet,
  arbeitsvertrag 8, vollmacht 2; 0 nested `<a>`, 0 Console-Fehler über 9 Seiten). Eine
  zwischenzeitliche «keine Links»-Beobachtung war ein **stale-`dist`** (alter preview-Prozess
  auf :4173), kein Code-Fehler — nach Neubau verifiziert.

### OFFEN — Phase 2 (kantonal) + Phase 3 (Prosa-Literale)

- **Phase 2 — kantonale Inline-Verweise:** «§ N ERLASS» in Hinweisen über den Kanton/Erlass-
  Kontext der zugehörigen Quelle auflösen (nicht über blinden §-Regex). Die Tarif-`quelle`
  kennt Kanton/Erlass bereits; Kontext an den Hinweis-Renderer übergeben.
- **Phase 3 — Prosa-Literale (~616 Funde, 57 Dateien):** «Art. N GESETZ» steht in vielen
  Vorlagen-/Rechner-Seiten als STATISCHER JSX-Text (z. B. `…eigenhändig (Art. 505 Abs. 1
  ZGB)…`), den NormText (nur Variablen) nicht erreicht. Heterogen (Prosa, Option-Labels,
  Placeholder [NICHT verlinken!], Field-hints, Validierungstexte). Hoher Hebel: geteilte
  Display-Primitive (Field-hint, FehlerBox) durch NormText führen statt 616 Einzel-Edits;
  reine `<p>`-Prosa separat. Bewusst von Phase 1 getrennt (anderes Risikoprofil).

## OFFEN (Plan-Notiz) — Inline-Norm-Auto-Linker «NormText» (Auftrag David 17.6.2026)

**Befund David:** «es sind noch immer viele genannte Artikel nicht verlinkt.»
Richtig — das Popover greift bisher nur an STRUKTURIERTEN Chip-Stellen. Artikel,
die im FLIESSTEXT genannt werden (Begründungen, Hinweise, Tarif-`hinweis`-Felder,
Ergebnis-/Gates-Warnungen), sind reiner Text. Kartierung (Explore 17.6.2026):

- **Umfang:** ~2093 «Art. N [GESETZ]»-Nennungen in den Datenquellen (Tarif-`hinweis`
  ~718, Vorlagen-`begruendung`/`hinweis` ~725, Engine-`hinweise`/`warnungen` ~78 …).
- **Auflösbarkeit:** ~40 % sind FEDERAL («Art. N OR/ZPO/…», via `fedlexLinkFuerArtikel`
  /`bundSnapshotRef` sofort auflösbar). ~60 % kantonal ohne Erlass-Kontext («§ 4»,
  «Art. 10 GebVN») — NICHT ohne zusätzliche Kanton-Metadaten auflösbar.
- **Muster existiert:** `RechtsprechungText` (src/components/RechtsprechungLink.tsx:26)
  macht genau das für BGE/BGer (Regex-Split + Wrap). Vorlage 1:1 übernehmbar.

**Plan:**
1. **`src/components/NormText.tsx` (NEU)** — `({text}) → JSX`: matcht alle
   «Art. N[suffix] GESETZ»-Vorkommen, wrappt jedes via `<NormChip artikel={match} />`
   (Popover), Rest plain. `fedlexLinkFuerArtikel` bleibt Single Source; nicht-
   auflösbare Treffer bleiben Text (kein toter Link). Test wie RechtsprechungText.
2. **Einbau (ersetzt heutiges plain `{text}`/`{h}`/`{w}`):** Rechner-Hinweise in den
   8 Formularen (BeurkundungForm:200, GrundbuchEintragForm:140, NotariatGrundbuchForm:178,
   ProzesskostenForm:275/356/431/445, AllgemeineFristForm:197, EreignisFristen:361,
   Schkg/StrafZustaendigkeitTeil:464/263/517); Vorlagen-Protokoll `wizard.tsx:383/384`
   (begruendung/hinweis); Gates `VorlagenSeite.tsx:106–110`. Eine Komponente deckt alle ab.
3. **Tor:** `npm run golden:vergleich` byte-gleich (NormText ist screen-only; PDF/SSR
   unberührt — die Hinweis-Texte selbst ändern sich nicht, nur ihr Inline-Rendering).
4. **Phase 2 (später):** kantonaler Inline-Resolver — die Tarif-`quelle` kennt den
   Kanton/Erlass bereits; «§ N» im zugehörigen Hinweis könnte über den Erlass der
   Quelle aufgelöst werden (Kanton-Kontext an den Hinweis-Renderer übergeben).
