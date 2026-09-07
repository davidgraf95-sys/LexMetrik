/**
 * W2·19-DESIGN-KONSISTENZ · B1/BAU-3 — Befunde D-1, D-2, D-4, D-8.
 *
 * Gemeinsamer Nenner der vier Befunde: dieselbe Inhaltsklasse trug mehrere
 * Optiken, weil jede Fläche ihre eigene Kopie mitbrachte. Behoben wurde nach
 * §5/§10 — Konsumenten auf den geteilten Baustein ziehen, die Kopie LÖSCHEN.
 * Genau das prüfen die Sonden hier: nicht «sieht gleich aus», sondern «es gibt
 * die zweite Definition nicht mehr».
 *
 *   D-1  /suche-Facetten: lokale Pillen-Kopie `FacetChip` → `.lc-chip`-Familie.
 *   D-2  `BezugFacettenWahl` + `PanelSachgebiet`: byte-gleiches KNOPF/AKTIV/
 *        RUHIG-Tripel in ZWEI Dateien → `.lc-chip` / `.lc-chip-selected`.
 *   D-4  «Entwurf» trug slate (`lc-badge-soft`) → `lc-badge-entwurf`.
 *   D-8  Filterzähler trug die ok-Zustandsfarbe (`lc-badge-ok`) → nackte Zahl.
 *
 * §6.7 — jede Sonde einmal rot gesehen, indem der jeweilige Ist-Stand VOR dem
 * Bau eingesetzt wurde (FacetChip zurück, Konstanten-Tripel zurück,
 * `lc-badge lc-badge-soft` zurück, `num lc-badge lc-badge-ok` zurück).
 *
 * Reine Darstellung (§3) — keine Rechtslogik berührt.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { PanelSachgebiet } from '../pages/gesetz-leser/v3/PanelSachgebiet';
import { alleTsx, liesOhneKommentare, ohneKommentare, rel } from './appDateien';

const rohLies = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');
const CSS = rohLies('../index.css');

/**
 * Quelltext OHNE Kommentare.
 *
 * Warum das sein muss (und beim ersten Lauf sofort zugeschlagen hat): die
 * Sonden fragen «gibt es die alte Bauform noch?». Der Bau hat aber genau an
 * jeder behobenen Stelle einen Kommentar hinterlassen, der die alte Bauform
 * BENENNT («die Marke trug `lc-badge-soft`»). Läse die Sonde den Rohtext, wäre
 * sie für immer rot — und die naheliegende «Reparatur» wäre, die Begründung aus
 * dem Code zu löschen. Sie prüft darum den ausführbaren Teil; die Dokumentation
 * darf und soll den Vorzustand beim Namen nennen (§2b: Belege altern nicht).
 */
const lies = (p: string) => rohLies(p)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((z) => !/^\s*(\/\/|\*)/.test(z)).join('\n');

describe('D-1 — /suche-Facetten tragen die Chip-Familie, die Kopie ist gelöscht', () => {
  const quelle = lies('../pages/Suche.tsx');

  it('die lokale Pillen-Komponente existiert nicht mehr', () => {
    expect(quelle).not.toContain('FacetChip');
    // Die Pillen-Anatomie selbst (rounded-full + eigener Rahmen) ist mit ihr weg.
    expect(quelle).not.toContain('rounded-full border');
  });

  // RUNDE 2 (31.8.2026, deklarierte Test-Nachführung): B1/D-1 hatte die OPTIK
  // der Achse vereinheitlicht, die ANATOMIE stand danach immer noch zweimal —
  // in `Suche.tsx` und als lokale `FacettenGruppe` in `EntscheidFilter.tsx`.
  // Beide sind jetzt auf `components/ui/FacettenGruppe` gezogen. Der Chip-Kanon
  // wird darum AM BAUSTEIN geprüft (dort steht er) und an beiden Flächen, dass
  // sie ihn konsumieren statt ihn nachzubauen. Die Zusicherung wird damit
  // stärker, nicht schwächer: sie deckt jetzt BEIDE Achsen.
  const baustein = lies('../components/ui/FacettenGruppe.tsx');
  const entscheidFilter = lies('../components/rechtsprechung/EntscheidFilter.tsx');

  // D24-NACHZUG (Fixer 1h, 6.9.2026, DEKLARIERTE TEST-ÄNDERUNG — §6.3 fachliche
  // Änderung, kein Refactoring): Prüfbefund «Aus D24 (offen)» verlangt Text-
  // Schalter statt Kasten (`.lc-chip`) für GENAU diese Achse — dieselbe
  // Kasten-Abräumung, die D22 an der Filterzeile schon vollzogen hat. Der
  // Baustein trägt seither `.fc-zeile`/`.fc-schalter` (additiv, index.css)
  // statt `.lc-chip-zeile`/`.lc-chip`/`.lc-chip-selected`. Die Sonde prüft
  // darum die NEUE Anatomie — die Absicht (ein Baustein, ein Auswahl-Signal,
  // aria-pressed trägt die Semantik) ist unverändert, nur der Klassenname.
  it('die Facetten-Reihe ist eine fc-zeile mit fc-schalter (keine Kästen mehr)', () => {
    expect(baustein).toContain('fc-zeile');
    expect(baustein).toContain('fc-schalter');
    // Die Kasten-Familie (Rahmen + Fläche) ist hier weg, nicht nur umbenannt.
    expect(baustein).not.toContain('lc-chip');
    // aria bleibt der Auswahl-Träger (das ✓ lebt im ::before, s. index.css).
    expect(baustein).toContain('aria-pressed');
  });

  it('beide Flächen konsumieren den EINEN Baustein und zeichnen keine Schalter mehr selbst', () => {
    for (const [name, q] of [['Suche', quelle], ['EntscheidFilter', entscheidFilter]] as const) {
      expect(q, `${name}: konsumiert FacettenGruppe`).toContain('<FacettenGruppe');
      expect(q, `${name}: importiert den Baustein`).toMatch(/import \{ FacettenGruppe \} from '[^']*ui\/FacettenGruppe'/);
      // `lies()` hat die Kommentare entfernt — was hier noch das AUSWAHL-Signal
      // der Achse setzt, ist eine echte Klassenkette und damit eine neue Kopie.
      expect(q, `${name}: kein eigenes Auswahl-Signal`).not.toContain('fc-schalter');
    }
    // /suche baut überhaupt keinen Chip/Schalter mehr von Hand; EntscheidFilter
    // trägt weiterhin `.lc-chip` an den ENTFERNBAREN Aktiv-Filtern — eine andere
    // Sache als die Facetten-Achse (LM-044/N1, dieselbe Grammatik, anderer Zweck).
    expect(quelle).not.toContain('lc-chip');
    expect(quelle).not.toContain('fc-schalter');
    // Die lokale Definition ist gelöscht, nicht bloss ungenutzt.
    expect(entscheidFilter).not.toMatch(/^function FacettenGruppe\(/m);
  });

  it('das ✓-Präfix, das die Kopie nicht hatte, kommt jetzt aus dem Kanon', () => {
    expect(CSS).toContain(".fc-schalter[aria-pressed=\"true\"]::before { content: '✓';");
  });

  it('der gewählte Schalter trägt den Registerstrich, keine Kasten-Fläche (D24: «keine Kästen»)', () => {
    // Negativ zuerst (§6.7-Geist: die Sonde muss die alte Kasten-Anatomie
    // erkennen können) — die Kasten-Familie ist nirgends im Kanon-CSS-Block
    // der neuen Schalter referenziert.
    expect(CSS).not.toMatch(/\.fc-schalter[^{]*\{[^}]*background:\s*var\(--brass/);
    expect(CSS).toMatch(/\.fc-zeile\[data-reg="r"\] \.fc-schalter\[aria-pressed="true"\] \{ border-bottom-color: var\(--reg-r\); \}/);
  });
});

describe('D-2 — die byte-gleiche Schalter-Optik existiert in KEINER der beiden Dateien mehr', () => {
  const bezug = lies('../components/verzahnung/BezugFacettenWahl.tsx');
  const sachgebiet = lies('../pages/gesetz-leser/v3/PanelSachgebiet.tsx');

  it('das KNOPF/AKTIV/RUHIG-Tripel ist in beiden Dateien gelöscht', () => {
    for (const [name, q] of [['BezugFacettenWahl', bezug], ['PanelSachgebiet', sachgebiet]] as const) {
      expect(q, `${name}: KNOPF-Konstante`).not.toMatch(/^const KNOPF =/m);
      expect(q, `${name}: AKTIV-Konstante`).not.toMatch(/^const AKTIV =/m);
      expect(q, `${name}: RUHIG-Konstante`).not.toMatch(/^const RUHIG =/m);
      // Die Auswahl-Fläche der Kopie (Farbe als einziges Signal) ist mit weg.
      expect(q, `${name}: Auswahl allein über Farbfläche`).not.toContain('bg-brass-100/60');
    }
  });

  it('der irrige Kommentar «steht seither allein hier» ist mitkorrigiert', () => {
    expect(bezug).not.toContain('steht seither allein hier');
  });

  it('PanelSachgebiet rendert lc-chip mit lc-chip-selected für die Auswahl', () => {
    const html = renderToStaticMarkup(
      <PanelSachgebiet gebiete={['Strafrecht', 'Zivilrecht']} gewaehlt={['Strafrecht']} onGebiete={() => {}} />,
    );
    expect(html).toContain('lc-chip-zeile');
    expect(html).toContain('lc-chip lc-chip-selected');
    // Der nicht gewählte Schalter trägt den Ruhezustand — Chip ohne Selected.
    expect(html).toMatch(/class="lc-chip "[^>]*data-v3-panel-gebiet="Zivilrecht"|data-v3-panel-gebiet="Zivilrecht"[^>]*class="lc-chip "/);
  });

  it('BezugFacettenWahl benutzt dieselben Klassen (kein zweiter Weg zurück)', () => {
    expect(bezug).toContain('lc-chip-zeile');
    expect(bezug).toContain("'lc-chip-selected'");
  });
});

describe('D-4 — «Entwurf» trägt die Entwurfs-Marke, nicht den slate-Referenzton', () => {
  const quelle = lies('../components/normtext/RechtsgebietSicht.tsx');

  it('die Marke ist lc-badge-entwurf', () => {
    expect(quelle).toContain('<span className="lc-badge-entwurf">Entwurf</span>');
  });

  it('slate (lc-badge-soft) trägt hier nichts mehr — das Wörterbuch schliesst es aus', () => {
    expect(quelle).not.toContain('lc-badge-soft');
  });

  it('der Ehrlichkeits-Wortlaut ist unverändert (§8: einfärben ≠ abschwächen)', () => {
    expect(quelle).toContain('>Entwurf<');
  });

  it('lc-badge-entwurf bringt die lc-badge-Anatomie selbst mit (keine zweite Klasse nötig)', () => {
    expect(CSS).toMatch(/\.lc-badge-entwurf \{\s*@apply lc-badge/);
  });
});

describe('D-8 — der Filterzähler ist eine Zählung, kein Status', () => {
  const quelle = lies('../components/rechtsprechung/FilterSheet.tsx');

  it('die ok-Zustandsfarbe trägt die Zahl nicht mehr (§G-i)', () => {
    expect(quelle).not.toContain('lc-badge-ok');
    expect(quelle).not.toContain('lc-badge');
  });

  it('Kanon der Zählung: nackte Zahl in der num-Stimme', () => {
    // R4-C (5.9.2026): der Wortlaut trug bis hierher zusätzlich `tabular-nums`.
    // GEMESSEN am Preview: die Utility überschreibt `.num` aus der späteren
    // CSS-Schicht und nimmt dabei `lining-nums` weg — sie war nicht redundant,
    // sondern schädlich (Herleitung und App-weiter Wächter in
    // `design-r3b-chrome.test.ts`, Abschnitt R4-C). Die geprüfte AUSSAGE ist
    // unverändert: nackte Zahl, `num`-Stimme, Zähler-Farbe ink-600 (§6.3).
    expect(quelle).toContain('<span className="num text-ink-600">{anzahl}</span>');
  });
});

describe('D-5 — «geplant» trägt EINE Marke (Entscheid David 31.8.2026: Umriss slate)', () => {
  // R3-α-WURZEL (31.8.2026, §17/§6.7): hier stand eine Liste von fünf Dateien.
  // Sie hat die fünf bewacht und die App nicht — genau die Bauart, die B3-8
  // durchgelassen hat (`RechnerStub` trug «In Vorbereitung» ohne die Marke).
  // Der Sweep geht über alle `.tsx`; die Liste ist gestrichen, nicht ergänzt.
  it('kein Vorbereitungs-/Bearbeitungs-Status mehr in soft- oder warn-Ton (App-weit)', () => {
    const suender: string[] = [];
    for (const d of alleTsx()) {
      // Kommentare zählen nicht: sie benennen den Alt-Ton legitim als Beleg (§2b).
      for (const zeile of liesOhneKommentare(d).split('\n')) {
        if (/(Vorbereitung|Bearbeitung)/.test(zeile) && /lc-badge-(soft|warn)/.test(zeile)) suender.push(rel(d));
      }
    }
    expect(suender, 'Status «geplant» in Alt-Ton statt lc-badge-geplant').toEqual([]);
  });

  it('die Marke ist genau einmal definiert (index.css) und App-weit kanonisch beschriftet', () => {
    const css = readFileSync('src/index.css', 'utf8');
    expect(css.match(/\.lc-badge-geplant\s*\{/g)?.length).toBe(1);
    const falschBeschriftet = alleTsx()
      .filter((d) => { const q = liesOhneKommentare(d); return q.includes('lc-badge-geplant') && !q.includes('In Vorbereitung'); })
      .map(rel);
    expect(falschBeschriftet, 'lc-badge-geplant ohne den Kanon-Wortlaut «In Vorbereitung»').toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Sweep sieht die Marke überhaupt', () => {
    expect(alleTsx().filter((d) => liesOhneKommentare(d).includes('lc-badge-geplant')).length)
      .toBeGreaterThanOrEqual(3);
  });
});

// ─── R3-α · D-1/D-2 App-weit: die Chip-Anatomie liegt genau einmal ──────────
//
// Die D-1/D-2-Sonden oben prüfen VIER namentlich genannte Dateien. Das war der
// Stand nach dem Bau; als Wächter deckt es die App nicht. Diese Sonde stellt
// die Regel App-weit: das AUSWAHL-SIGNAL der Chip-Familie (`lc-chip-selected`)
// darf nur dort stehen, wo die Familie zu Hause ist.
describe('D-1/D-2 (App-weit) — `lc-chip-selected` steht nur an den Chip-Bausteinen', () => {
  /** Die Flächen, die die Chip-Familie definieren bzw. sie als GANZE tragen. */
  const HEIMAT = [
    'components/ui/FacettenGruppe.tsx',
    'components/verzahnung/BezugFacettenWahl.tsx',
    'pages/gesetz-leser/v3/PanelSachgebiet.tsx',
  ];

  it('keine weitere Fläche setzt das Auswahl-Signal selbst', () => {
    const funde = alleTsx()
      .filter((d) => !HEIMAT.includes(rel(d)))
      .filter((d) => liesOhneKommentare(d).includes('lc-chip-selected'))
      .map(rel);
    expect(funde, 'eigene Chip-Auswahl statt FacettenGruppe/lc-chip-Familie').toEqual([]);
  });

  it('NEGATIV-KONTROLLE: der Ausdruck findet die gelöschte Kopie', () => {
    expect(ohneKommentare(`const AKTIV = 'lc-chip lc-chip-selected';`)).toContain('lc-chip-selected');
  });
});
