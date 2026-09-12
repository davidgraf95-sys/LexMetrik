import { describe, it, expect } from 'vitest';
import {
  baueRevisionen, roFundstelleAusOc, fundstelle, liveLink, botschaftIndex, serialisiere,
  belegtImXml, MARKER_CUTOFF, type ErlassMeta,
} from '../../scripts/normtext/revisionen-generieren';
import { revisionenFuerNorm, revisionTitel, type RevisionBezug } from '../lib/normtext/revisionen';
import type { SparqlBinding } from '../../scripts/fedlex-sparql';

// Paket 5 (W2·6-REV): reine Generator-Logik (dedupe/Sortierung/Determinismus/
// RO-Fundstelle/Botschafts-Join/Sammelerlass-Cross-Check/nichtKonsolidiert) + die
// Lese-Brücken-Projektion. Netz-Kette prüft die Live-Daten separat.

const OC = (s: string) => `https://fedlex.data.admin.ch/eli/oc/${s}`;
const ERLASS: ErlassMeta = { key: 'DSG', sr: '235.1' };

function bind(o: Record<string, string | undefined>): SparqlBinding {
  const b: SparqlBinding = {};
  for (const [k, v] of Object.entries(o)) if (v !== undefined) b[k] = { value: v };
  return b;
}

describe('roFundstelleAusOc', () => {
  it('leitet die moderne AS-Fundstelle aus der oc-URI ab', () => {
    expect(roFundstelleAusOc(OC('2022/491'))).toBe('AS 2022 491');
  });
  it('behandelt die Alt-AS-Band-Nummerierung (vor 1948)', () => {
    expect(roFundstelleAusOc(OC('63/837_843_843'))).toBe('AS 63 837');
  });
  it('gibt undefined bei unerwarteter URI', () => {
    expect(roFundstelleAusOc('https://example.org/foo')).toBeUndefined();
  });
});

describe('fundstelle — massgebliche AS-Fundstelle (§7, gelesen statt fabriziert)', () => {
  it('nimmt bei Einzel-Segment-ELI die historicalId-Seite (digitale AS vor 2019, Sequenz ≠ Seite)', () => {
    // Regressionsanker Gegenprüfung 11.7.2026: oc/2005/566 ⇒ real AS 2005 4395 (NICHT «AS 2005 566»).
    expect(fundstelle(OC('2005/566'), 'RO 2005 4395')).toBe('AS 2005 4395');
    expect(fundstelle(OC('2014/245'), 'RO 2014 1119')).toBe('AS 2014 1119');
  });
  it('bevorzugt bei Multi-Segment-ELI die DE-Ableitung (erstes Segment), nicht die FR-historicalId', () => {
    expect(fundstelle(OC('1973/348_347_349'), 'RO 1973 347')).toBe('AS 1973 348');
  });
  it('leitet ohne historicalId ab (Einzel-Segment seit der AS-Reform 2019: Sequenz == Seite)', () => {
    expect(fundstelle(OC('2024/487'))).toBe('AS 2024 487');
  });
  it('nimmt unerwartetes historicalId-Format verbatim (nie fabrizieren)', () => {
    expect(fundstelle(OC('2005/1'), 'BS 8 123')).toBe('BS 8 123');
    expect(fundstelle(OC('2005/1'), 'Sonderfall')).toBe('Sonderfall');
  });
});

describe('belegtImXml — Finding 4b (AS-Fundstelle bereits im Konsolidierungstext zitiert)', () => {
  it('erkennt eine oc-URI, deren href-Zitat NEBEN «angewendet ab» steht (FZA-Muster)', () => {
    const xml = '<p>… Art. 1 des Beschlusses Nr. 1/2020 …, in Kraft seit 15. Dez. 2020 und angewendet ab 1. Jan. 2021 (<ref href="https://fedlex.data.admin.ch/eli/oc/2021/12">AS <b>2021</b> 12</ref>).</p>';
    expect(belegtImXml(xml, OC('2021/12'))).toBe(true);
  });
  it('gibt false, wenn die oc-URI nicht vorkommt', () => {
    expect(belegtImXml('<p>kein Verweis hier</p>', OC('2024/100'))).toBe(false);
  });
  it('gibt false bei blosser href-Nennung OHNE «angewendet ab» (KLV-Gegenbeleg: Historie-Aufzählung / Teil-Inkrafttreten)', () => {
    // Live-Gegenprobe 12.9.2026: KLV zitiert Amendment-ocs in Änderungs-Historien und bei
    // Teil-Inkrafttreten («Abs. 1 Bst. a und c in Kraft seit …, die anderen Bestimmungen
    // treten später in Kraft») — dort bleibt der Marker korrekt bestehen, obwohl die href
    // vorkommt. Kein «angewendet ab» im Dokument ⇒ kein Beleg.
    const historie = '<p>Fassung gemäss … vom 2. Dez. 2025 (<ref href="https://fedlex.data.admin.ch/eli/oc/2025/852">852</ref>) und Ziff. II vom 9. Juni 2026, in Kraft seit 1. Juli 2026 (<ref href="https://fedlex.data.admin.ch/eli/oc/2026/336">AS 2026 336</ref>).</p>';
    expect(belegtImXml(historie, OC('2025/852'))).toBe(false);
    const teilInKraft = '<p>Eingefügt durch Ziff. I der V des EDI vom 12. Juni 2026, Abs. 1 Bst. a und c in Kraft seit 1. Aug. 2026 (<ref href="https://fedlex.data.admin.ch/eli/oc/2026/348">AS 2026 348</ref>). Die anderen Bestimmungen treten zu einem späteren Zeitpunkt in Kraft.</p>';
    expect(belegtImXml(teilInKraft, OC('2026/348'))).toBe(false);
  });
  it('verlangt «angewendet ab» IN DER NÄHE der href, nicht irgendwo im Dokument', () => {
    const weitWeg = `<p>angewendet ab ${'x'.repeat(500)} <ref href="https://fedlex.data.admin.ch/eli/oc/2021/12">AS 2021 12</ref></p>`;
    expect(belegtImXml(weitWeg, OC('2021/12'))).toBe(false);
  });
});

describe('liveLink', () => {
  it('baut den DE-Live-Link auf www.fedlex', () => {
    expect(liveLink(OC('2022/491'))).toBe('https://www.fedlex.admin.ch/eli/oc/2022/491/de');
  });
});

describe('baueRevisionen — Kern-Logik', () => {
  const ocZuBotschaft = new Map([[OC('2022/491'), 'BOTSCHAFT-2017-2057']]);

  it('dedupliziert je oc auf das früheste Inkrafttreten, Sprachen kollabieren', () => {
    const bindings = [
      bind({ oc: OC('2022/491'), dateForce: '2023-09-01', dateDoc: '2020-09-25', titleDe: 'DE', titleFr: 'FR', titleIt: 'IT' }),
      bind({ oc: OC('2022/491'), dateForce: '2024-01-01' }), // späteres Teil-Inkrafttreten
    ];
    const s = baueRevisionen(ERLASS, bindings, [], '2025-01-01', ocZuBotschaft, '2026-07-10');
    const ae = s.revisionen.filter((r) => r.art === 'aenderung');
    expect(ae).toHaveLength(1);
    expect(ae[0].dateEntryInForce).toBe('2023-09-01'); // min
    expect(ae[0].titelDe).toBe('DE');
    expect(ae[0].roFundstelle).toBe('AS 2022 491');
    expect(ae[0].botschaftKey).toBe('BOTSCHAFT-2017-2057');
  });

  it('setzt nichtKonsolidiert gdw. dateEntryInForce > Korpus-Stand', () => {
    const bindings = [
      bind({ oc: OC('2026/500'), dateForce: '2026-10-01', titleDe: 'Künftig' }),
      bind({ oc: OC('2024/100'), dateForce: '2024-05-01', titleDe: 'Alt' }),
    ];
    const s = baueRevisionen(ERLASS, bindings, [], '2025-01-01', new Map(), '2026-07-10');
    const nk = s.revisionen.find((r) => r.ocUri === OC('2026/500'));
    const alt = s.revisionen.find((r) => r.ocUri === OC('2024/100'));
    expect(nk?.nichtKonsolidiert).toBe(true);
    expect(alt?.nichtKonsolidiert).toBeUndefined();
  });

  it('nichtKonsolidiert bleibt weg, wenn die oc-URI im Konsolidierungs-XML bereits zitiert ist (Finding 4b, FZA)', () => {
    // Gegenprüfung 16.8.2026: Fedlex modelliert `jolux:dateEntryInForce` bei gewissen
    // Staatsvertrags-Beschlüssen als «angewendet ab»-Datum, nicht als «in Kraft für die
    // Schweiz»-Datum. Live-Beleg FZA/AS 2021 12: Konsolidierung 2020-12-15 zitiert die
    // oc-URI bereits per <ref href> — der Marker wäre sonst falsch-positiv.
    const bindings = [
      bind({ oc: OC('2021/12'), dateForce: '2021-01-01', titleDe: 'Beschluss Nr. 1/2020' }),
      bind({ oc: OC('2024/100'), dateForce: '2024-05-01', titleDe: 'Echt künftig' }),
    ];
    const belegteOcs = new Set([OC('2021/12')]);
    const s = baueRevisionen(ERLASS, bindings, [], '2020-12-15', new Map(), '2026-07-10', belegteOcs);
    const belegt = s.revisionen.find((r) => r.ocUri === OC('2021/12'));
    const echtKuenftig = s.revisionen.find((r) => r.ocUri === OC('2024/100'));
    expect(belegt?.nichtKonsolidiert).toBeUndefined();
    expect(echtKuenftig?.nichtKonsolidiert).toBe(true); // ohne Text-Beleg bleibt die Warnung
  });

  it('erzeugt Sammelerlass-Marker für Pfad-(a)-Stände ohne (b)-Erlass, ab Cutoff', () => {
    const bindings = [bind({ oc: OC('2020/1'), dateForce: '2020-01-01', titleDe: 'Basis' })];
    // Pfad-(a)-Geltungsstände: einer deckungsgleich (2020-01-01), einer Mantelerlass (2022-06-01),
    // einer VOR dem Cutoff (1998-01-01, muss ignoriert werden).
    const aStaende = ['1998-01-01', '2020-01-01', '2022-06-01'];
    const s = baueRevisionen(ERLASS, bindings, aStaende, '2025-01-01', new Map(), '2026-07-10');
    const marker = s.revisionen.filter((r) => r.art === 'sammelerlass-marker');
    expect(marker).toHaveLength(1);
    expect(marker[0].dateEntryInForce).toBe('2022-06-01');
    expect(marker[0].ocUri).toBeUndefined();
    expect(MARKER_CUTOFF).toBe('2000-01-01');
  });

  it('sortiert Datum absteigend und ist byte-deterministisch', () => {
    const bindings = [
      bind({ oc: OC('2019/111'), dateForce: '2019-03-01', titleDe: 'A' }),
      bind({ oc: OC('2022/491'), dateForce: '2023-09-01', titleDe: 'B' }),
    ];
    const a = serialisiere(baueRevisionen(ERLASS, bindings, [], '2025-01-01', new Map(), '2026-07-10'));
    const b = serialisiere(baueRevisionen(ERLASS, [...bindings].reverse(), [], '2025-01-01', new Map(), '2026-07-10'));
    expect(a).toBe(b); // reihenfolge-unabhängig
    const s = JSON.parse(a) as { revisionen: RevisionBezug[] };
    expect(s.revisionen.map((r) => r.dateEntryInForce)).toEqual(['2023-09-01', '2019-03-01']);
  });
});

describe('botschaftIndex', () => {
  it('baut aus den persistierten ocUris einen ocUri→botschaftKey-Index', () => {
    const idx = botschaftIndex();
    expect(idx.size).toBeGreaterThan(0); // Paket 2 hat ocUris persistiert
  });
});

describe('revisionTitel', () => {
  const r: RevisionBezug = { art: 'aenderung', dateEntryInForce: '2023-09-01', titelDe: 'DE', titelFr: 'FR', titelIt: 'IT', quelleUrl: 'https://x' };
  it('wählt die Locale-Sprache mit DE-Fallback', () => {
    expect(revisionTitel(r, 'fr')).toBe('FR');
    expect(revisionTitel(r, 'it')).toBe('IT');
    expect(revisionTitel(r, 'de')).toBe('DE');
    expect(revisionTitel({ ...r, titelFr: undefined }, 'fr')).toBe('DE');
  });
});

describe('revisionenFuerNorm — Lese-Brücke', () => {
  it('gibt null zurück, wenn ALLE Sidecars nicht ladbar sind (Fetch-Fehler ≠ leer)', async () => {
    const orig = globalThis.fetch;
    globalThis.fetch = (async () => ({ ok: false })) as unknown as typeof fetch;
    try {
      expect(await revisionenFuerNorm(['NICHTVORHANDEN-KEY'])).toBeNull();
    } finally { globalThis.fetch = orig; }
  });
});
