import { describe, it, expect } from 'vitest';
import { ALLE_KARTEN, KATALOG_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { sucheTrifft, sucheRang, kartePasst, LEERER_FILTER } from '../lib/katalogSuche';

// ─── Suchbegriff-Goldliste (Fahrplan Katalog-UI, Etappe 0.1) ────────────────
//
// Misst die AUFFINDBARKEIT: typische Praxis-Suchbegriffe in drei Klassen
// (Laienbegriff / Fachbegriff / Normzitat) müssen die erwartete VERFÜGBARE
// Karte treffen — gegen dieselbe sucheTrifft()-Logik, die auch die Pro-UI
// nutzt (lib/katalogSuche.ts). Erweiterungen der Liste sind erwünscht;
// Begriffe dürfen nur Karten versprechen, deren Tool den Inhalt wirklich
// abdeckt (§8 — vor Aufnahme am Engine-/Preset-Code verifizieren).

type Goldpaar = [suchbegriff: string, erwarteteId: string];

const LAIE: Goldpaar[] = [
  ['gekündigt', 'kuendigung-sperrfristen'],
  ['schwanger', 'kuendigung-sperrfristen'],
  ['krank', 'lohnfortzahlung'],
  ['Mahnung', 'verzugszins'],
  ['Testament', 'eigenhaendiges-testament'],
  ['Zahlungsbefehl', 'schkg-fristen'],
  ['Untermiete', 'mietvertrag-wohnen'], // Konsolidierung E2: Deep-Link-Karte eingeschmolzen
  ['Pflichtteil', 'erbteilung'],
  ['Probezeit', 'arbeitsvertrag'],
  ['Kaution', 'mietvertrag-wohnen'],
  ['Wohnung kündigen', 'mietrecht'],
  // Etappe 1.1 (6.6.2026): Laienphrasen, am Tool-Umfang verifiziert
  ['Kündigung erhalten', 'kuendigung-sperrfristen'],
  ['Urteil erhalten', 'zustaendigkeit'],
  ['Scheidung', 'zustaendigkeit'],
  ['betreiben', 'zustaendigkeit'], // Konsolidierung E2: Rechtsweg-Karten vereint
  ['Schulden', 'schkg-fristen'],
  ['ausziehen', 'mietrecht'], // Konsolidierung E3: Maske über den Themen-Einstieg
  ['Mietzins', 'mietvertrag-wohnen'],
  // FE-6 (FAHRPLAN-FRISTEN-EINHEIT): Fristen-Laienbegriffe — jeder Begriff
  // muss den RICHTIGEN Einstieg treffen (Keywords am Preset-/Engine-Code
  // verifiziert: famStatusPresets, mietrecht-/sperrfristen-Engine).
  ['Kündigungsfrist', 'mietrecht'],
  ['Kündigungsfrist', 'kuendigung-sperrfristen'],
  ['verjährt', 'verjaehrung'],
  ['Erbschaft ausschlagen', 'erbrecht-fristen'],
  ['Vaterschaft', 'tagerechner'],
  ['KESB', 'tagerechner'],
];

const FACH: Goldpaar[] = [
  ['Rechtsvorschlag', 'schkg-fristen'],
  ['Rechtsöffnung', 'zustaendigkeit'], // Konsolidierung E2
  ['Sperrfrist', 'kuendigung-sperrfristen'],
  ['Gerichtsferien', 'zpo-fristen'],
  ['Stillstand', 'zpo-fristen'],
  ['Schlichtung', 'schlichtungsgesuch'],
  ['Klagebewilligung', 'schlichtungsgesuch'],
  ['Mängelrüge', 'gewaehrleistung'],
  ['Ausschlagung', 'erbrecht-fristen'],
  ['Arrest', 'zustaendigkeit'], // Konsolidierung E2
  ['Gerichtsstand', 'zustaendigkeit'],
  // Etappe 1.1 (6.6.2026): Fachbegriffe gemäss schkgPresets/Engine-Umfang
  ['Fortsetzungsbegehren', 'schkg-fristen'],
  ['Konkursandrohung', 'schkg-fristen'],
  ['Berufungsfrist', 'zpo-fristen'],
  ['Rechtsmittel', 'zustaendigkeit'],
  // FE-6: Fach-Direkteinstiege bleiben über die Fachbegriffe auffindbar
  ['Betreibungsferien', 'schkg-fristen'],
];

const NORM: Goldpaar[] = [
  ['Art. 336c', 'kuendigung-sperrfristen'],
  ['336c', 'kuendigung-sperrfristen'],
  ['Art. 257d', 'mietrecht'],
  ['Art. 266l', 'mietrecht'], // Konsolidierung E3
  ['Art. 271', 'mietrecht'], // Konsolidierung E3
  ['Art. 335c', 'arbeitsvertrag'],
  ['Art. 367', 'gewaehrleistung'],
  ['Art. 104', 'verzugszins'],
  ['Art. 202', 'schlichtungsgesuch'],
  // Etappe 1.1 (6.6.2026): Norm-Keywords für implementierte Presets;
  // Keywords werden seit 1.1 kompakt verglichen («Art.311» = «311 ZPO»)
  ['Art. 311', 'zpo-fristen'],
  ['311 ZPO', 'zpo-fristen'],
  ['Art.311', 'zpo-fristen'],
  ['Art. 148 ZPO', 'zpo-fristen'],
  ['Art. 88 SchKG', 'schkg-fristen'],
  ['Art. 127 OR', 'verjaehrung'],
];

// Deklarierte Anpassung Konsolidierung 7.6.2026 (FAHRPLAN-KATALOG-
// KONSOLIDIERUNG E2/E3): Die Goldliste misst die Auffindbarkeit im
// SICHTBAREN Katalog — imKatalog:false-Karten erscheinen in der Suche
// nicht, ihre Begriffe müssen die Themen-Einstiege treffen.
const verfuegbar = KATALOG_KARTEN.filter(istVerfuegbar);
const treffer = (q: string) => verfuegbar.filter((k) => sucheTrifft(k, q)).map((k) => k.id);

describe.each([
  ['Laienbegriffe', LAIE],
  ['Fachbegriffe', FACH],
  ['Normzitate', NORM],
])('Suchbegriff-Goldliste: %s', (_klasse, paare) => {
  it.each(paare)('«%s» findet %s', (q, erwartet) => {
    expect(treffer(q), `Suche «${q}»`).toContain(erwartet);
  });
});

describe('Such-Semantik (Verhaltens-Anker der Extraktion)', () => {
  it('leere Suche trifft jede Karte; Filter LEERER_FILTER lässt alles durch', () => {
    ALLE_KARTEN.forEach((k) => {
      expect(sucheTrifft(k, '')).toBe(true);
      expect(kartePasst(k, LEERER_FILTER)).toBe(true);
    });
  });

  it('Normzitate treffen leerzeichen-tolerant («Art.336c» = «Art. 336c»)', () => {
    expect(treffer('Art.336c')).toEqual(treffer('Art. 336c'));
  });

  it('Gross-/Kleinschreibung ist egal', () => {
    expect(treffer('RECHTSVORSCHLAG')).toEqual(treffer('rechtsvorschlag'));
  });

  it('sucheRang ordnet deterministisch: Titel (0) vor Keyword (1/2) vor Norm (3) vor Gebiet (4)', () => {
    const byId = (id: string) => ALLE_KARTEN.find((k) => k.id === id)!;
    // Titel-Treffer: «Verzugszins» ist der Kartentitel
    expect(sucheRang(byId('verzugszins'), 'Verzugszins')).toBe(0);
    // Keyword exakt: «Mahnung» ist Keyword des Verzugszins-Rechners
    expect(sucheRang(byId('verzugszins'), 'Mahnung')).toBe(1);
    // Norm-Treffer (leerzeichen-tolerant): Art. 104 steht beim Verzugszins
    // nur in den Norm-Pills, nicht in den Keywords
    expect(sucheRang(byId('verzugszins'), 'Art.104')).toBe(3);
    // Gebiets-Treffer als letzte Stufe
    expect(sucheRang(byId('verzugszins'), 'Vertrag & Forderung')).toBe(4);
    // kein Treffer → null; leere Suche → null (Rang nur bei aktiver Suche)
    expect(sucheRang(byId('verzugszins'), 'Patentrecht')).toBeNull();
    expect(sucheRang(byId('verzugszins'), '')).toBeNull();
    // Konsistenz: Rang ≠ null ⟺ sucheTrifft (gleiche Treffermenge wie vor der Rang-Einführung)
    ALLE_KARTEN.forEach((k) => {
      expect(sucheTrifft(k, 'Frist'), k.id).toBe(sucheRang(k, 'Frist') !== null);
    });
  });

  it('Rang-Ordnung der Praxisfälle: bester VERFÜGBARER Treffer ist das richtige Werkzeug (Logik-Check 6.6.2026)', () => {
    const ersterTreffer = (q: string) => {
      const hits = verfuegbar
        .map((k) => ({ k, rang: sucheRang(k, q) }))
        .filter((x): x is { k: (typeof verfuegbar)[number]; rang: number } => x.rang !== null);
      // stabile Sortierung: Rang, dann Katalogposition (wie die UI)
      return hits.sort((a, b) => a.rang - b.rang)[0]?.k.id;
    };
    // 336c: der RECHNER schlägt die Vorlage (Keyword-Parität + Katalogposition)
    expect(ersterTreffer('Art. 336c')).toBe('kuendigung-sperrfristen');
    expect(ersterTreffer('336c')).toBe('kuendigung-sperrfristen');
    // «Urteil»: Rechtsmittelprüfung vor «Urteilsunfähigkeits»-Vorlagen
    expect(ersterTreffer('Urteil')).toBe('zustaendigkeit');
  });

  it('nurVerfuegbar blendet Geplantes aus, ändert Verfügbares nicht', () => {
    const f = { ...LEERER_FILTER, nurVerfuegbar: true };
    const gefiltert = ALLE_KARTEN.filter((k) => kartePasst(k, f));
    expect(gefiltert.every((k) => k.status !== 'geplant')).toBe(true);
    expect(gefiltert.length).toBe(ALLE_KARTEN.filter((k) => k.status !== 'geplant').length);
  });
});
