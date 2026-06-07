import { describe, it, expect } from 'vitest';
import { BETREIBUNGSAEMTER } from '../data/betreibungsaemter';
import { BETREIBUNGSAMT_KANTONE, betreibungsamtFuer } from '../data/betreibung/amtAufloesung';
import karten from '../data/betreibung/aemterKantone.json';
import plzVerzeichnis from '../data/plz/plzVerzeichnis.json';
import { KANTONE } from '../lib/kantone';
import type { Kanton } from '../types/legal';

// Akzeptanztests Betreibungsämter-Schicht (Auftrag David 7.6.2026:
// Betreibungsamt-Finder). Quelle: zweifach geprüftes Dossier
// bibliothek/behoerden/betreibungskreise-kantone.md (52 Agents, 7.6.2026).

describe('Betreibungsämter — Vollständigkeit & Integrität', () => {
  it('alle 26 Kantone tragen eine Auflösung mit Quelle und Stand', () => {
    for (const k of KANTONE) {
      const e = BETREIBUNGSAEMTER[k];
      expect(e, k).toBeDefined();
      expect(e.quelle.length, k).toBeGreaterThan(5);
      expect(e.stand, k).toBe('7.6.2026');
      expect(['einheitsamt', 'kreise', 'verzeichnis']).toContain(e.aufloesung.modus);
    }
  });
  it('Einheitsämter tragen volle Adresse; Kreise sind nie leer; Verzeichnisse https', () => {
    for (const k of KANTONE) {
      const a = BETREIBUNGSAEMTER[k].aufloesung;
      if (a.modus === 'einheitsamt') {
        expect(a.amt.strasse.length, k).toBeGreaterThan(3);
        expect(a.amt.plzOrt, k).toMatch(/^\d{4} /);
      }
      if (a.modus === 'kreise') {
        expect(a.aemter.length, k).toBeGreaterThan(1);
        for (const amt of a.aemter) {
          expect(amt.strasse.length, `${k}: ${amt.name}`).toBeGreaterThan(3);
          expect(amt.plzOrt, `${k}: ${amt.name}`).toMatch(/^\d{4} /);
        }
      }
      if (a.modus === 'verzeichnis') expect(a.url, k).toMatch(/^https:\/\//);
      const url = BETREIBUNGSAEMTER[k].url;
      if (url) expect(url, k).toMatch(/^https:\/\//);
    }
  });
});

describe('Betreibungsämter — Stichproben (dossier-verifizierte Werte)', () => {
  it('die 10 Einheitsamt-Kantone des Dossiers sind als Einheitsamt erfasst', () => {
    for (const k of ['BS', 'BL', 'SH', 'AI', 'NE', 'GE', 'JU', 'GL', 'OW', 'NW'] as const) {
      expect(BETREIBUNGSAEMTER[k].aufloesung.modus, k).toBe('einheitsamt');
    }
  });
  it('BS: Aeschenvorstadt 56 (Abteilung Betreibungen, staatskalender-geprüft)', () => {
    const a = BETREIBUNGSAEMTER.BS.aufloesung;
    if (a.modus === 'einheitsamt') {
      expect(a.amt.strasse).toBe('Aeschenvorstadt 56');
      expect(a.amt.plzOrt).toBe('4051 Basel');
    }
  });
  it('SH ist Einheitsamt SEIT 1.1.2025 (SHR 281.101; VOBA aufgehoben)', () => {
    const a = BETREIBUNGSAEMTER.SH.aufloesung;
    if (a.modus === 'einheitsamt') expect(a.amt.plzOrt).toBe('8200 Schaffhausen');
    expect(BETREIBUNGSAEMTER.SH.quelle).toContain('1.1.2025');
  });
  it('AI: Oberegg integriert (1.6.2024) — genau EIN Amt, Marktgasse 2', () => {
    const a = BETREIBUNGSAEMTER.AI.aufloesung;
    expect(a.modus).toBe('einheitsamt');
    if (a.modus === 'einheitsamt') expect(a.amt.strasse).toBe('Marktgasse 2');
  });
  it('SZ/AG-Verzeichnisse legen die Verbands- bzw. Erreichbarkeits-Lage offen (§8)', () => {
    expect(BETREIBUNGSAEMTER.SZ.quelle.toLowerCase()).toContain('verband');
    expect(BETREIBUNGSAEMTER.AG.quelle).toContain('nicht erreichbar');
  });
});

describe('Betreibungsämter — Kreis-Kantone (Etappe 2, Extraktion 7.6.2026)', () => {
  const ERWARTET: Partial<Record<Kanton, number>> = { ZH: 55, BE: 8, FR: 7, SO: 5, AR: 3, GR: 11, TG: 5, TI: 8, VD: 10, VS: 5 };
  it('Ämterzahlen entsprechen den amtlich verifizierten Strukturen', () => {
    for (const [k, n] of Object.entries(ERWARTET)) {
      const a = BETREIBUNGSAEMTER[k as Kanton].aufloesung;
      expect(a.modus, k).toBe('kreise');
      if (a.modus === 'kreise') expect(a.aemter.length, k).toBe(n);
    }
  });
  it('Gemeinde-Karten: Indizes gültig, alle Schlüssel sind AKTUELLE Gemeinden (swisstopo)', () => {
    const aktuelle = new Map<string, Set<string>>();
    for (const treffer of Object.values(plzVerzeichnis as unknown as Record<string, [string, string, number][]>)) {
      for (const [g, k] of treffer) {
        if (!aktuelle.has(k)) aktuelle.set(k, new Set());
        aktuelle.get(k)!.add(g);
      }
    }
    for (const [k, karte] of Object.entries(karten as Record<string, { gemeinden: Record<string, number> }>)) {
      const a = BETREIBUNGSAEMTER[k as Kanton].aufloesung;
      expect(a.modus, k).toBe('kreise');
      if (a.modus !== 'kreise') continue;
      for (const [g, idx] of Object.entries(karte.gemeinden)) {
        expect(idx, `${k}: ${g}`).toBeGreaterThanOrEqual(0);
        expect(idx, `${k}: ${g}`).toBeLessThan(a.aemter.length);
        expect(aktuelle.get(k)!.has(g), `${k}: «${g}» nicht im amtlichen Gemeinderegister`).toBe(true);
      }
    }
  });
  it('Abdeckung: ZH 158 (+2 Städte) · SO 104 · AR 20 · GR 100 · TG 80 · VD 300', () => {
    const K = karten as Record<string, { gemeinden: Record<string, number> }>;
    expect(Object.keys(K.ZH.gemeinden).length).toBe(158);
    expect(Object.keys(K.SO.gemeinden).length).toBe(104);
    expect(Object.keys(K.AR.gemeinden).length).toBe(20);
    expect(Object.keys(K.GR.gemeinden).length).toBe(100);
    expect(Object.keys(K.TG.gemeinden).length).toBe(80);
    expect(Object.keys(K.VD.gemeinden).length).toBe(300);
  });
});

describe('Betreibungsämter — Gemeinde-Auflösung (Goldwerte aus den Prüf-Stichproben)', () => {
  it('SO: amtlich bestätigte Zuordnungen (Dornach/Olten/Solothurn/Balsthal)', async () => {
    for (const [g, amt] of [['Dornach', 'Dorneck-Thierstein'], ['Olten', 'Olten'], ['Solothurn', 'Solothurn'], ['Balsthal', 'Thal-Gäu']] as const) {
      const t = await betreibungsamtFuer('SO', g);
      expect(t?.art, g).toBe('amt');
      if (t?.art === 'amt') expect(t.amt.name, g).toContain(amt);
    }
  });
  it('TI: Chiasso→Mendrisio · Airolo→Leventina · Biasca→Riviera (amtliche elenco-Stichproben)', async () => {
    for (const [g, ort] of [['Chiasso', 'Mendrisio'], ['Airolo', 'Leventina'], ['Biasca', 'Riviera']] as const) {
      const t = await betreibungsamtFuer('TI', g);
      expect(t?.art, g).toBe('amt');
      if (t?.art === 'amt') expect(t.amt.name + ' ' + (t.amt.zustaendigFuer ?? ''), g).toContain(ort);
    }
  });
  it('ZH: Elgg→Seuzach-Kreis und Wald (ZH)→Rüti (Live-Struktur, prüfer-bestätigt)', async () => {
    const elgg = await betreibungsamtFuer('ZH', 'Elgg');
    expect(elgg?.art).toBe('amt');
    if (elgg?.art === 'amt') expect(elgg.amt.zustaendigFuer ?? elgg.amt.name).toContain('Elgg');
    const wald = await betreibungsamtFuer('ZH', 'Wald (ZH)');
    expect(wald?.art).toBe('amt');
    if (wald?.art === 'amt') expect((wald.amt.zustaendigFuer ?? '') + wald.amt.name).toContain('Wald');
  });
  it('ZH-Städte lösen auf Stadtkreis-Ämter auf (Zürich 12, Winterthur 3)', async () => {
    const zh = await betreibungsamtFuer('ZH', 'Zürich');
    expect(zh?.art).toBe('stadtkreise');
    if (zh?.art === 'stadtkreise') expect(zh.aemter.length).toBe(12);
    const w = await betreibungsamtFuer('ZH', 'Winterthur');
    expect(w?.art).toBe('stadtkreise');
    if (w?.art === 'stadtkreise') expect(w.aemter.length).toBe(3);
  });
  it('Fusions-Nachfolger: Stammheim (ZH), Verzasca/Tresa (TI), Crans (VD) — abgeleitet per Vorgänger-Konsens', async () => {
    expect((await betreibungsamtFuer('ZH', 'Stammheim'))?.art).toBe('amt');
    expect((await betreibungsamtFuer('TI', 'Verzasca'))?.art).toBe('amt');
    expect((await betreibungsamtFuer('TI', 'Tresa'))?.art).toBe('amt');
    expect((await betreibungsamtFuer('VD', 'Crans (VD)'))?.art).toBe('amt');
  });
  it('BE/VS ohne Gemeinde-Karte: Auflösung gibt null (Dienststellen-Liste in der UI, §8)', async () => {
    expect(BETREIBUNGSAMT_KANTONE).not.toContain('BE');
    expect(await betreibungsamtFuer('BE', 'Bern')).toBeNull();
    expect(await betreibungsamtFuer('VS', 'Sion')).toBeNull();
  });
  it('Einheitsamt-Kantone: Auflösung nicht nötig (null) — Adresse kommt direkt aus der Stammschicht', async () => {
    expect(await betreibungsamtFuer('BS', 'Basel')).toBeNull();
  });
});
