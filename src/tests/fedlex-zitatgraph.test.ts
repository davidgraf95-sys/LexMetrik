// ─── Z2/Z3 · Zitatgraph — Normalisierung, Vergleich, Fehlerpfad ─────────────
//
// Netzfrei (§2): jede Abfrage läuft gegen eine Attrappe. Geprüft werden die
// REINEN Bausteine — die Stellen, an denen ein Fehler still ein falsches
// Artefakt erzeugen würde:
//
//   · Normalisierung (URI-Form, Dedupe, Roh-Zeilenzahl fürs Count-Gate)
//   · Graph-Bau (Inversion, Selbstzitat, Sortierung, Byte-Stabilität)
//   · Count-Gate (still unvollständiges Ergebnis ⇒ Abbruch, kein Teil-Artefakt)
//   · Content-Type-Wächter (HTTP 200 MIT HTML-Fehlerseite ⇒ Abbruch)
//   · Z3-Vergleich (Klassen A/B, R2, R4, Selbstzitat)

import { describe, it, expect } from 'vitest';
import {
  exprUri, eliAusWork, normalisiereKanten, baueGraph, serialisiere, erhebe,
} from '../../scripts/fedlex-zitatgraph';
import { sparqlSelect } from '../../scripts/fedlex-sparql';
import { vergleicheErlass } from '../../scripts/zitatgraph-vergleich';
import type { PinVoll } from '../../scripts/fedlex-pins';

const pin = (name: string, eli: string, kons: string, sr: string): PinVoll => ({
  name, eli, kons: `${kons.slice(0, 4)}-${kons.slice(4, 6)}-${kons.slice(6, 8)}`,
  konsKompakt: kons, n: 0, anker: [], sr,
});
const OR = pin('or', 'cc/27/317_321_377', '20260101', '220');
const ZGB = pin('zgb', 'cc/24/233_245_233', '20260701', '210');

const binding = (expr: string, eId: string, rs: string, work: string) => ({
  fromExpr: { value: expr }, eId: { value: eId }, rs: { value: rs }, toWork: { value: work },
});

/** Attrappe: erste Antwort = COUNT, zweite = Daten (Reihenfolge wie in `erhebe`). */
function fakeFetch(antworten: unknown[]): typeof fetch {
  let i = 0;
  return (async () => {
    const body = antworten[i++];
    return {
      ok: true,
      headers: new Headers({ 'content-type': 'application/sparql-results+json' }),
      json: async () => body,
    };
  }) as unknown as typeof fetch;
}
const res = (bindings: unknown[]) => ({ results: { bindings } });

describe('Z2 · URI-Form (live verifiziert 2.9.2026)', () => {
  it('setzt «text» VOR das Konsolidierungsdatum', () => {
    // Der Auftrag nannte «…/<datum>/text»; die Sonde gegen den Endpunkt zeigt
    // die umgekehrte Reihenfolge. Dieser Test verankert das Gemessene (§7).
    expect(exprUri(OR)).toBe('https://fedlex.data.admin.ch/eli/cc/27/317_321_377/text/20260101');
  });
  it('schält den ELI-Pfad aus der Ziel-Work-URI', () => {
    expect(eliAusWork('https://fedlex.data.admin.ch/eli/cc/24/233_245_233/text')).toBe('cc/24/233_245_233');
    expect(eliAusWork('https://example.invalid/anders')).toBe('https://example.invalid/anders');
  });
});

describe('Z2 · Normalisierung', () => {
  const e = exprUri(OR);
  const w = 'https://fedlex.data.admin.ch/eli/cc/24/233_245_233/text';

  it('dedupliziert dieselbe Stelle→Ziel-Kante, zählt aber ROHE Zeilen fürs Count-Gate', () => {
    const { kanten, rohZeilen } = normalisiereKanten([
      binding(e, 'art_1', '210', w), binding(e, 'art_1', '210', w), binding(e, 'art_2', '210', w),
    ]);
    expect(kanten.get(e)).toHaveLength(2);
    expect(rohZeilen.get(e)).toBe(3); // Count-Gate prüft gegen die ROHE Zahl
  });

  it('überspringt Bindings mit fehlendem Pflichtfeld statt sie zu raten', () => {
    const { kanten } = normalisiereKanten([
      { fromExpr: { value: e }, eId: { value: 'art_1' }, toWork: { value: w } }, // rs fehlt
      binding(e, 'art_3', '210', w),
    ]);
    expect(kanten.get(e)?.map((k) => k.eId)).toEqual(['art_3']);
  });
});

describe('Z2 · Graph-Bau', () => {
  const eOr = exprUri(OR), eZgb = exprUri(ZGB);
  const wZgb = 'https://fedlex.data.admin.ch/eli/cc/24/233_245_233/text';
  const wOr = 'https://fedlex.data.admin.ch/eli/cc/27/317_321_377/text';
  const kanten = new Map([
    [eOr, [
      { eId: 'art_7', zielSr: '210', zielEli: 'cc/24/233_245_233' },
      { eId: 'art_2', zielSr: '210', zielEli: 'cc/24/233_245_233' },
      { eId: 'art_5', zielSr: '999.9', zielEli: 'cc/9/9' }, // Ziel nicht gepinnt
      { eId: 'art_9', zielSr: '220', zielEli: 'cc/27/317_321_377' }, // Selbstzitat
    ]],
    [eZgb, [{ eId: 'art_11', zielSr: '220', zielEli: 'cc/27/317_321_377' }]],
  ]);
  void wZgb; void wOr;
  const g = baueGraph([OR, ZGB], kanten);

  it('invertiert ausgehende zu eingehenden Kanten', () => {
    const zgb = g.erlasse.find((k) => k.sr === '210')!;
    expect(zgb.eingehendAusKorpus).toEqual([
      { vonSr: '220', vonEId: 'art_2' }, { vonSr: '220', vonEId: 'art_7' },
    ]);
    expect(g.erlasse.find((k) => k.sr === '220')!.eingehendAusKorpus)
      .toEqual([{ vonSr: '210', vonEId: 'art_11' }]);
  });

  it('macht aus einem Selbstzitat keine eingehende Kante', () => {
    const or = g.erlasse.find((k) => k.sr === '220')!;
    expect(or.ausgehend.some((a) => a.zielSr === '220')).toBe(true); // ausgehend bleibt
    expect(or.eingehendAusKorpus.some((a) => a.vonSr === '220')).toBe(false); // eingehend nie
  });

  it('erzeugt keine eingehende Kante für ein nicht gepinntes Ziel', () => {
    expect(g.erlasse.map((k) => k.sr)).toEqual(['210', '220']);
  });

  it('sortiert stabil und serialisiert byte-gleich bei umgestellter Eingabe', () => {
    const or = g.erlasse.find((k) => k.sr === '220')!;
    expect(or.ausgehend.map((a) => a.eId)).toEqual(['art_2', 'art_5', 'art_7', 'art_9']);
    const umgestellt = new Map([...kanten].reverse().map(([k, v]) => [k, [...v].reverse()]));
    expect(serialisiere(baueGraph([ZGB, OR], umgestellt))).toBe(serialisiere(g));
  });

  it('endet mit genau einem Newline (Byte-Gleichheit)', () => {
    const s = serialisiere(g);
    expect(s.endsWith('}\n')).toBe(true);
    expect(s.endsWith('}\n\n')).toBe(false);
  });

  it('zählt den Korpus über beide Richtungen', () => {
    expect(g.korpus).toEqual({ erlasse: 2, ausgehend: 5, eingehendAusKorpus: 3, ohneKanten: 0 });
  });
});

describe('Z2 · Fehlerpfade — lieber kein Artefakt als ein stilles Halbes', () => {
  it('reisst das Count-Gate, wenn der Endpunkt weniger Zeilen liefert als er zählt', async () => {
    const e = exprUri(OR);
    const f = fakeFetch([
      res([{ fromExpr: { value: e }, n: { value: '3' } }]),                 // COUNT sagt 3
      res([binding(e, 'art_1', '210', 'https://fedlex.data.admin.ch/eli/cc/24/233_245_233/text')]),
    ]);
    await expect(erhebe([OR], f)).rejects.toThrow(/Count-Gate gerissen.*COUNT sagt 3, geliefert 1/s);
  });

  it('reisst das Count-Gate bei einer leeren, aber gültigen Antwort (vakuant)', async () => {
    // {results:{bindings:[]}} ist eine GÜLTIGE Antwort (kein Fehler, kein HTML) — ohne die
    // VALUES-Soll-Prüfung liefe die COUNT-Schleife mit null Iterationen glatt durch und ein
    // Teil-Artefakt mit 0 Kanten entstünde. Das darf nicht sein (Kopf-Kommentar «KEIN TEIL-ARTEFAKT»).
    const f = fakeFetch([res([]), res([])]);
    await expect(erhebe([OR], f)).rejects.toThrow(/vakuant.*1 von 1 Pin/s);
  });

  it('reisst das Count-Gate, wenn ein einzelner Pin ganz in der COUNT-Antwort fehlt', async () => {
    // Zwei Pins angefragt, nur einer erscheint in der COUNT-Antwort (Endpunkt-Defekt) — muss
    // auffallen, obwohl der ANWESENDE Pin für sich genommen ein stimmiges COUNT=0 hätte.
    const eOr = exprUri(OR);
    const f = fakeFetch([
      res([{ fromExpr: { value: eOr }, n: { value: '0' } }]),
      res([]),
    ]);
    await expect(erhebe([OR, ZGB], f)).rejects.toThrow(/vakuant.*1 von 2 Pin/s);
  });

  it('bricht bei HTTP 200 MIT HTML-Fehlerseite ab (Content-Type, nie Statuscode)', async () => {
    const html = (async () => ({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'text/html;charset=UTF-8' }),
      text: async () => '<!DOCTYPE html><html><head><title>Error</title></head><body>Fehler</body></html>',
      json: async () => { throw new Error('kein JSON'); },
    })) as unknown as typeof fetch;
    await expect(sparqlSelect('SELECT * WHERE {}', html))
      .rejects.toThrow(/Content-Type «text\/html;charset=UTF-8» statt JSON/);
    await expect(erhebe([OR], html)).rejects.toThrow(/statt JSON/);
  });

  it('lässt Attrappen ohne headers durch (netzfreie Bestands-Tests bleiben grün)', async () => {
    const ohneHeader = (async () => ({ ok: true, json: async () => res([]) })) as unknown as typeof fetch;
    await expect(sparqlSelect('SELECT * WHERE {}', ohneHeader)).resolves.toEqual([]);
  });
});

describe('Z3 · Vergleich Fedlex ↔ Leser', () => {
  const korpus = new Map([['210', 'ZGB'], ['830.1', 'ATSG']]);
  const ziele = new Map([
    ['art_1', { verlinkt: new Set(['210']), erkannt: new Set<string>() }],
    ['art_2', { verlinkt: new Set<string>(), erkannt: new Set(['830.1']) }],
    ['art_3', { verlinkt: new Set<string>(), erkannt: new Set<string>() }],
  ]);
  const b = vergleicheErlass('220', [
    { eId: 'art_1', zielSr: '210' },    // verlinkt ⇒ gedeckt
    { eId: 'art_2', zielSr: '830.1' },  // erkannt, nicht verlinkt ⇒ Klasse A
    { eId: 'art_3', zielSr: '210' },    // gar nicht erkannt ⇒ Klasse B
    { eId: 'art_1', zielSr: '999.9' },  // Ziel nicht im Korpus ⇒ R2
    { eId: 'annex_2/lvl_u1', zielSr: '210' }, // kein Snapshot-Eintrag ⇒ R4
    { eId: 'art_1', zielSr: '220' },    // Selbstzitat ⇒ ignoriert
  ], ziele, korpus);

  it('trennt Klasse A (erkannt, nicht verlinkt) von Klasse B (unerkannt)', () => {
    expect(b.erkanntNichtVerlinkt).toEqual([{ sr: '220', eId: 'art_2', zielSr: '830.1', zielKuerzel: 'ATSG' }]);
    expect(b.warnungen).toEqual([{ sr: '220', eId: 'art_3', zielSr: '210', zielKuerzel: 'ZGB' }]);
  });

  it('zählt Deckung, R2 und R4 getrennt und lässt das Selbstzitat aus', () => {
    expect(b.gedeckt).toBe(1);
    expect(b.zielAusserhalb).toBe(1);
    expect(b.eIdOhneEintrag).toBe(1);
    // 6 Kanten − 1 Selbstzitat = 5 einsortierte
    expect(b.gedeckt + b.zielAusserhalb + b.eIdOhneEintrag + b.warnungen.length
      + b.erkanntNichtVerlinkt.length).toBe(5);
  });
});
