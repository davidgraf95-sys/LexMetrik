import { describe, it, expect } from 'vitest';
import { baueAnfrage, mappeTreffer } from '../lib/rechtsprechung/livesuche';

describe('baueAnfrage', () => {
  it('baut query_string mit AND-Default + size/from', () => {
    const b = baueAnfrage('Mietzins Staffelung', { size: 10, from: 20 });
    expect(b.query.query_string.query).toBe('Mietzins Staffelung');
    expect(b.query.query_string.default_operator).toBe('AND');
    expect(b.size).toBe(10);
    expect(b.from).toBe(20);
    expect(b.sort).toBeUndefined(); // Relevanz = ES-Default
  });

  it('trimmt den Begriff und klemmt size in [1,50]', () => {
    expect(baueAnfrage('  x  ').query.query_string.query).toBe('x');
    expect(baueAnfrage('x', { size: 999 }).size).toBe(50);
    expect(baueAnfrage('x', { size: 0 }).size).toBe(1);
    expect(baueAnfrage('x', { from: -5 }).from).toBe(0);
  });

  it('setzt Datums-Sort nur bei sortNach=datum', () => {
    expect(baueAnfrage('x', { sortNach: 'datum' }).sort).toEqual([{ date: { order: 'desc' } }]);
    expect(baueAnfrage('x', { sortNach: 'relevanz' }).sort).toBeUndefined();
  });

  it('lädt den Volltext NICHT (attachment.content nicht in _source.includes)', () => {
    const inc = baueAnfrage('x')._source.includes;
    expect(inc).toContain('attachment.content_url');
    expect(inc).not.toContain('attachment.content');
  });
});

const ES_FIXTURE = {
  hits: {
    total: { value: 10000, relation: 'gte' },
    hits: [
      {
        _id: 'SZ_KG_001_ZK1-2025-11_2025-11-04',
        _source: {
          date: '2025-11-04',
          hierarchy: ['SZ', 'SZ_KG', 'SZ_KG_001'],
          abstract: { de: 'Mietzinserhöhung | Mietrecht', fr: 'Loyer', it: 'Pigione' },
          title: { de: 'Schwyz Kantonsgericht 1. Zivilkammer 04.11.2025 ZK1 2025 11', fr: 'Schwytz …', it: 'Svitto …' },
          reference: ['ZK1 2025 11'],
          canton: 'SZ',
          attachment: { content_url: 'https://entscheidsuche.ch/docs/SZ_Gerichte/SZ_KG_001_ZK1-2025-11_2025-11-04.pdf' },
          id: 'SZ_KG_001_ZK1-2025-11_2025-11-04',
        },
      },
    ],
  },
};

describe('mappeTreffer', () => {
  it('mappt einen Treffer vollständig (de bevorzugt)', () => {
    const r = mappeTreffer(ES_FIXTURE);
    expect(r.total).toBe(10000);
    expect(r.totalIstMindestens).toBe(true);
    const t = r.treffer[0];
    expect(t.titel).toBe('Schwyz Kantonsgericht 1. Zivilkammer 04.11.2025 ZK1 2025 11');
    expect(t.thema).toBe('Mietzinserhöhung | Mietrecht');
    expect(t.kanton).toBe('SZ');
    expect(t.datum).toBe('2025-11-04');
    expect(t.aktenzeichen).toBe('ZK1 2025 11');
    expect(t.quelleUrl).toContain('entscheidsuche.ch/docs/');
  });

  it('ist defensiv bei fehlenden Feldern (kein Wurf, null/leere Werte)', () => {
    const r = mappeTreffer({ hits: { hits: [{ _id: 'x', _source: {} }] } });
    const t = r.treffer[0];
    expect(t.id).toBe('x');
    expect(t.titel).toBe('Entscheid'); // Fallback ohne title/reference
    expect(t.thema).toBeNull();
    expect(t.quelleUrl).toBeNull();
    expect(r.totalIstMindestens).toBe(false);
  });

  it('liefert leeres Ergebnis bei fehlendem hits-Block', () => {
    expect(mappeTreffer({}).treffer).toEqual([]);
    expect(mappeTreffer(null).treffer).toEqual([]);
  });

  it('fällt für den Titel auf das Aktenzeichen zurück, wenn kein title-Feld da ist', () => {
    const r = mappeTreffer({ hits: { hits: [{ _id: 'y', _source: { reference: ['4A_1/2025'] } }] } });
    expect(r.treffer[0].titel).toBe('4A_1/2025');
  });
});
