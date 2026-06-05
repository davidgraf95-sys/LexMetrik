import { describe, it, expect } from 'vitest';
import {
  VOLLMACHT_DEFAULTS, vollmachtZusammenstellen, pruefeVollmachtGates,
  type VollmachtAntworten,
} from '../lib/vorlagen/vollmacht';

// ─── Vollmacht (Art. 32 ff. OR) – EINE Maske mit Typ-Schalter ────────────────
// Grundlagen-Bericht 5.6.2026: formfrei (Art. 11 OR) → ausgabeArt 'fertig';
// deterministische Form-Gates (Bürgschaft Sperre, Grundstück/Bank Warnung,
// Vorsorge-Weiche als Hinweis).

function basis(patch: Partial<VollmachtAntworten> = {}): VollmachtAntworten {
  return {
    ...VOLLMACHT_DEFAULTS,
    vorname: 'Anna', nachname: 'Muster', adresse: 'Musterweg 1, 4051 Basel',
    bevollmaechtigte: [{ name: 'Ben Beispiel', angaben: 'geb. 01.01.1980, Beispielstrasse 2, 4052 Basel' }],
    datum: '2026-06-05',
    ...patch,
  };
}

function gesamtText(r: ReturnType<typeof vollmachtZusammenstellen>): string {
  return r.dokument.absaetze.map((a) => (a.ueberschrift ? a.ueberschrift + '\n' : '') + a.text).join('\n');
}

describe('Vollmacht – gemeinsamer OR-AT-Kern', () => {
  it('Generalvollmacht Minimalfall: Kernbausteine, Titel-Override, druckfertig', () => {
    const r = vollmachtZusammenstellen(basis());
    expect(r.dokument.titel).toBe('Generalvollmacht');
    expect(r.dokument.format).toBe('vertrag');
    expect(r.dokument.ausgabeArt).toBe('fertig'); // einfache Schriftform (Art. 11 OR)
    expect(r.aufgenommen).toContain('VM01_geber_natuerlich');
    expect(r.aufgenommen).toContain('VM02_bevollmaechtigte');
    expect(r.aufgenommen).toContain('VM20_umfang_general');
    expect(r.aufgenommen).toContain('VM21_grenze_hoechstpersoenlich'); // Art. 19c ZGB immer bei General
    expect(r.aufgenommen).toContain('VM51_substitution_verboten');     // Default konservativ
    expect(r.aufgenommen).toContain('VM61_widerruf');                  // deklaratorisch, immer
    expect(r.aufgenommen).toContain('VM70_unterschrift');
    const txt = gesamtText(r);
    expect(txt).toContain('Anna Muster');
    expect(txt).toContain('Ben Beispiel');
    expect(txt).toContain('Generalvollmacht');
    expect(txt).toContain('Anna Muster (Vollmachtgeber/in)');
  });

  it('deterministisch: identische Antworten ⇒ identisches Dokument', () => {
    const a = basis({ typ: 'anwalt', prozessbefugnisse: true, ermaechtigungen: ['vergleich'] });
    expect(vollmachtZusammenstellen(a)).toEqual(vollmachtZusammenstellen(a));
  });

  it('juristische Vollmachtgeberin: eigener Ingress + Unterschriftszeile «Für …»', () => {
    const r = vollmachtZusammenstellen(basis({
      geberTyp: 'juristisch', firma: 'Muster AG', sitz: 'Basel', vertretenDurch: 'Carla Chef',
    }));
    expect(r.aufgenommen).toContain('VM01_geber_juristisch');
    expect(r.aufgenommen).not.toContain('VM01_geber_natuerlich');
    const txt = gesamtText(r);
    expect(txt).toContain('Muster AG, mit Sitz in Basel, vertreten durch Carla Chef');
    expect(txt).toContain('Für Muster AG: Carla Chef');
  });

  it('mehrere Bevollmächtigte: Einzel- bzw. Kollektivklausel nur bei > 1 Person', () => {
    const eine = vollmachtZusammenstellen(basis());
    expect(eine.aufgenommen).not.toContain('VM03_einzeln');
    expect(eine.aufgenommen).not.toContain('VM03_gemeinsam');

    const zwei = basis({ bevollmaechtigte: [{ name: 'Ben Beispiel', angaben: '' }, { name: 'Cleo Dritt', angaben: '' }] });
    expect(vollmachtZusammenstellen(zwei).aufgenommen).toContain('VM03_einzeln');
    expect(vollmachtZusammenstellen({ ...zwei, vertretung: 'gemeinsam' }).aufgenommen).toContain('VM03_gemeinsam');
  });

  it('Substitution erlaubt ⇒ Substitutionsklausel statt Ausschluss', () => {
    const r = vollmachtZusammenstellen(basis({ substitution: 'erlaubt' }));
    expect(r.aufgenommen).toContain('VM50_substitution_erlaubt');
    expect(r.aufgenommen).not.toContain('VM51_substitution_verboten');
  });

  it('Befristung und transmortale Klausel nur auf Wahl; Widerruf immer', () => {
    const ohne = vollmachtZusammenstellen(basis());
    expect(ohne.aufgenommen).not.toContain('VM60_befristung');
    expect(ohne.aufgenommen).not.toContain('VM62_fortgeltung');

    const mit = vollmachtZusammenstellen(basis({ befristetBis: '2027-12-31', fortgeltungTod: true }));
    expect(gesamtText(mit)).toContain('gilt bis zum 31.12.2027');
    expect(mit.aufgenommen).toContain('VM62_fortgeltung');
    // Hinweis zur Vorsorge-Weiche wird im Protokoll offengelegt (§8)
    expect(mit.protokoll.find((p) => p.bausteinId === 'VM62_fortgeltung')?.hinweis).toContain('Vorsorgeauftrag');
  });
});

describe('Vollmacht – Typ Anwalt', () => {
  it('Anwaltsvollmacht: Umfangsklausel mit Mandatsgegenstand; Titel-Override', () => {
    const r = vollmachtZusammenstellen(basis({ typ: 'anwalt', mandatsgegenstand: 'Forderung aus Werkvertrag gegen X AG' }));
    expect(r.dokument.titel).toBe('Anwaltsvollmacht');
    expect(r.aufgenommen).toContain('VM10_umfang_anwalt');
    expect(r.aufgenommen).not.toContain('VM20_umfang_general');
    expect(gesamtText(r)).toContain('in Sachen Forderung aus Werkvertrag gegen X AG');
  });

  it('Vergleichs-/Anerkennungs-/Rückzugsbefugnis NUR als ausdrücklicher Baustein (Art. 396 Abs. 3 OR)', () => {
    const ohne = vollmachtZusammenstellen(basis({ typ: 'anwalt' }));
    expect(ohne.aufgenommen).not.toContain('VM11_prozessbefugnisse');
    expect(gesamtText(ohne)).not.toContain('Vergleiche abzuschliessen');

    const mit = vollmachtZusammenstellen(basis({ typ: 'anwalt', prozessbefugnisse: true }));
    expect(mit.aufgenommen).toContain('VM11_prozessbefugnisse');
    expect(gesamtText(mit)).toContain('Klagen anzuerkennen und zurückzuziehen');
  });

  it('Geheimnisentbindung nur auf Wahl und nur beim Typ Anwalt', () => {
    expect(vollmachtZusammenstellen(basis({ typ: 'anwalt', geheimnisentbindung: true })).aufgenommen).toContain('VM12_geheimnisentbindung');
    expect(vollmachtZusammenstellen(basis({ typ: 'anwalt' })).aufgenommen).not.toContain('VM12_geheimnisentbindung');
    // typ-fremd wirkungslos (deterministische includeIf-Verknüpfung)
    expect(vollmachtZusammenstellen(basis({ typ: 'general', geheimnisentbindung: true })).aufgenommen).not.toContain('VM12_geheimnisentbindung');
  });
});

describe('Vollmacht – Typ Spezial', () => {
  it('Geschäft UND Bereiche: «zudem»-Variante; nur Bereiche: Grundvariante', () => {
    const beides = vollmachtZusammenstellen(basis({ typ: 'spezial', geschaeft: 'Verkauf PW VW Golf', bereiche: ['behoerden'] }));
    expect(beides.aufgenommen).toContain('VM30_spezial_geschaeft');
    expect(beides.aufgenommen).toContain('VM31a_bereiche_zusatz');
    expect(beides.aufgenommen).not.toContain('VM31b_bereiche');

    const nurBereiche = vollmachtZusammenstellen(basis({ typ: 'spezial', bereiche: ['behoerden', 'post'] }));
    expect(nurBereiche.aufgenommen).toContain('VM31b_bereiche');
    expect(nurBereiche.aufgenommen).not.toContain('VM30_spezial_geschaeft');
    expect(gesamtText(nurBereiche)).toContain('Behörden und Ämtern');
  });

  it('Beschränkungsklausel immer beim Typ Spezial', () => {
    const r = vollmachtZusammenstellen(basis({ typ: 'spezial', geschaeft: 'X' }));
    expect(r.aufgenommen).toContain('VM32_beschraenkung');
    expect(vollmachtZusammenstellen(basis()).aufgenommen).not.toContain('VM32_beschraenkung');
  });

  it('Gate: Spezial ohne Geschäft und ohne Bereiche → Blocker (Art. 33 Abs. 2 OR)', () => {
    const g = pruefeVollmachtGates(basis({ typ: 'spezial' }));
    expect(g.blocker.some((b) => b.includes('Art. 33 Abs. 2 OR'))).toBe(true);
    expect(pruefeVollmachtGates(basis({ typ: 'spezial', bereiche: ['post'] })).blocker).toEqual([]);
  });
});

describe('Vollmacht – besondere Ermächtigungen (Art. 396 Abs. 3 OR)', () => {
  it('nur gewählte Ermächtigungen erscheinen; ohne Wahl kein Baustein', () => {
    const ohne = vollmachtZusammenstellen(basis());
    expect(ohne.aufgenommen).not.toContain('VM40_ermaechtigungen');

    const mit = vollmachtZusammenstellen(basis({ ermaechtigungen: ['vergleich', 'schenkungen'] }));
    expect(mit.aufgenommen).toContain('VM40_ermaechtigungen');
    const txt = gesamtText(mit);
    expect(txt).toContain('einen Vergleich abzuschliessen');
    expect(txt).toContain('Schenkungen zu machen');
    expect(txt).not.toContain('wechselrechtliche Verbindlichkeiten');
  });
});

describe('Vollmacht – deterministische Form-Gates (Bericht Ziff. 6)', () => {
  it('Trigger 1 Bürgschaft: SPERRE (Art. 493 Abs. 6 OR)', () => {
    const g = pruefeVollmachtGates(basis({ buergschaft: true }));
    expect(g.blocker.some((b) => b.includes('Art. 493 Abs. 6 OR'))).toBe(true);
  });

  it('Trigger 2 Grundstücke: Warnung mit Beurkundung (Art. 216 OR), GBV-Beglaubigung und offener Formfrage', () => {
    const g = pruefeVollmachtGates(basis({ ermaechtigungen: ['grundstuecke'] }));
    const w = g.warnungen.join('\n');
    expect(w).toContain('Art. 216 Abs. 1 OR');
    expect(w).toContain('Art. 86 GBV');
    expect(w).toContain('BGE 112 II 330'); // Formfrage offen → keine definitive Aussage
  });

  it('Trigger 3 Beglaubigungs-Usanz: Hinweis bei Bank-/Immobilien-/Grundstücksbezug', () => {
    expect(pruefeVollmachtGates(basis({ typ: 'spezial', bereiche: ['immobilien'] })).hinweise.join('\n')).toContain('Beglaubigung');
    expect(pruefeVollmachtGates(basis()).hinweise.join('\n')).not.toContain('Beglaubigung');
  });

  it('Trigger 4 Bank: Warnung «bankeigene Formulare»', () => {
    const g = pruefeVollmachtGates(basis({ typ: 'spezial', bereiche: ['bank'] }));
    expect(g.warnungen.some((w) => w.includes('BANKEIGENE'))).toBe(true);
  });

  it('Trigger 5 Vorsorge-Weiche: Hinweis auf Vorsorgeauftrag bei transmortaler Klausel', () => {
    const g = pruefeVollmachtGates(basis({ fortgeltungTod: true }));
    expect(g.hinweise.some((h) => h.includes('VORSORGEAUFTRAG'))).toBe(true);
  });

  it('Laienvertretung: Prozess-Bereich warnt ausser beim Typ Anwalt (Art. 68 ZPO)', () => {
    expect(pruefeVollmachtGates(basis({ typ: 'spezial', bereiche: ['prozess'] })).warnungen.join('\n')).toContain('Art. 68 Abs. 2 ZPO');
    expect(pruefeVollmachtGates(basis({ typ: 'anwalt', bereiche: ['prozess'] })).warnungen.join('\n')).not.toContain('Art. 68 Abs. 2 ZPO');
  });

  it('Gate: ohne bevollmächtigte Person → Blocker (Art. 32 Abs. 1 OR)', () => {
    const g = pruefeVollmachtGates(basis({ bevollmaechtigte: [] }));
    expect(g.blocker.some((b) => b.includes('Art. 32 Abs. 1 OR'))).toBe(true);
  });
});
