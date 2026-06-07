import { describe, it, expect } from 'vitest';
import {
  KV_DEFAULTS, kvRouting, kvKlagefrist, kvZusammenstellen, kvMaengel, kvHinweise, kvStreitwert,
  type KvAnswers,
} from '../lib/vorlagen/klageVereinfacht';
import { ZPO_SCHWELLEN } from '../lib/zustaendigkeit';

// Akzeptanztests «Klage im vereinfachten Verfahren – BS» (Auftrag 5.6.2026,
// ZPO-Fassung 1.1.2025). Schwellen aus ZPO_SCHWELLEN (SSoT).

function basis(patch: Partial<KvAnswers> = {}): KvAnswers {
  return {
    ...KV_DEFAULTS,
    materie: 'vermoegensrechtlich',
    streitwert: '12000',
    klaeger: { typ: 'natuerlich', vorname: 'Anna', name: 'Muster', strasse: 'Musterweg 1', plz: '4051', ort: 'Basel' },
    beklagte: { typ: 'juristisch', firma: 'X AG', sitzStrasse: 'Beispielgasse 2', sitzPlz: '4051', sitzOrt: 'Basel' },
    streitgegenstand: 'Forderung aus Werkvertrag (Rechnung Nr. 2026-12)',
    klagebewilligungVorhanden: true,
    klagebewilligungDatum: '2026-05-01',
    datum: '2026-06-05',
    ...patch,
  };
}

describe('Klage vereinfacht — BS-Routing (Auftrags-Logik)', () => {
  it('Arbeit ≤ 30 000 → Arbeitsgericht, gerichtskostenfrei (Art. 114 lit. c)', () => {
    const r = kvRouting('arbeit', 25_000);
    expect(r.anwendbar && r.gericht).toBe('arbeitsgericht');
    expect(r.anwendbar && r.kostenlos).toBe(true);
    expect(r.anwendbar && r.kostenlosNorm).toContain('lit. c');
  });
  it('Arbeit > 30 000 → Stopp (nur mit Parteivereinbarung, § 73 Abs. 2 GOG)', () => {
    const r = kvRouting('arbeit', 30_001);
    expect(r.anwendbar).toBe(false);
    expect(!r.anwendbar && r.stopp).toBe('arbeit_ueber_30k');
  });
  it('GlG/Mitwirkung → Dreiergericht, streitwertunabhängig, kostenfrei', () => {
    const glg = kvRouting('glg', 500_000);
    expect(glg.anwendbar && glg.spruchkoerper).toContain('Dreiergericht');
    expect(glg.anwendbar && glg.kostenlos).toBe(true);
    const mit = kvRouting('mitwirkung', null);
    expect(mit.anwendbar && mit.kostenlosNorm).toContain('lit. d');
  });
  it('Gewaltschutz/DSG/Miete-Kern → Einzelgericht, streitwertunabhängig', () => {
    for (const m of ['gewaltschutz', 'dsg_auskunft', 'miete_kernbereich'] as const) {
      const r = kvRouting(m, 100_000);
      expect(r.anwendbar && r.spruchkoerper).toContain('Einzelgericht');
    }
  });
  it('ABWEICHUNG vom Auftrag (am Wortlaut verifiziert): Miete-Kern im Entscheidverfahren NICHT kostenfrei', () => {
    const r = kvRouting('miete_kernbereich', 8_000);
    expect(r.anwendbar && r.kostenlos).toBe(false);
    // Gewaltschutz/DSG dagegen kostenfrei (Art. 114 lit. f/g)
    expect(kvRouting('gewaltschutz', null).anwendbar && (kvRouting('gewaltschutz', null) as { kostenlos: boolean }).kostenlos).toBe(true);
  });
  it('vermögensrechtlich: 30 000 → Einzelgericht; 30 001 → Stopp ordentliches Verfahren', () => {
    expect(kvRouting('vermoegensrechtlich', ZPO_SCHWELLEN.VEREINFACHT).anwendbar).toBe(true);
    const r = kvRouting('vermoegensrechtlich', ZPO_SCHWELLEN.VEREINFACHT + 1);
    expect(!r.anwendbar && r.stopp).toBe('ordentlich');
  });
  it('KVG-Zusatz → Stopp Sozialversicherungsgericht (BS-Sonderweg, nicht abgebildet)', () => {
    const r = kvRouting('kvg_zusatz', 5_000);
    expect(!r.anwendbar && r.stopp).toBe('kvg_sozialversicherungsgericht');
  });
});

describe('Klage vereinfacht — Klagefrist (Art. 209 Abs. 3/4 mit Gerichtsferien)', () => {
  it('Standard: 3 Monate; Sommer-Gerichtsferien (15.7.–15.8.) verlängern', () => {
    const f = kvKlagefrist('2026-05-01', 'vermoegensrechtlich')!;
    expect(f.fristLabel).toContain('3 Monate');
    // Rohende 1.8.2026 fällt in die Sommerferien → Ablauf NACH dem 15.8.
    expect(f.ablaufISO > '2026-08-15').toBe(true);
    expect(f.stillstandAktiv).toBe(true);
  });
  it('Miete-Kernbereich: 30 Tage (Art. 209 Abs. 4)', () => {
    const f = kvKlagefrist('2026-05-01', 'miete_kernbereich')!;
    expect(f.fristLabel).toContain('30 Tage');
  });
  it('deterministisch & ungültiges Datum → null', () => {
    expect(kvKlagefrist('quatsch', 'vermoegensrechtlich')).toBeNull();
    const a = kvKlagefrist('2026-02-01', 'vermoegensrechtlich');
    expect(a).toEqual(kvKlagefrist('2026-02-01', 'vermoegensrechtlich'));
  });
});

describe('Klage vereinfacht — Assemble (Art. 244 ZPO)', () => {
  const text = (a: KvAnswers) => {
    const e = kvZusammenstellen(a);
    return e.dokument.absaetze.map((x) => `${x.ueberschrift ?? ''}\n${x.text}`).join('\n');
  };

  it('Kerninhalt: Parteien, Begehren, Streitgegenstand, Streitwert, Gericht, Doppel-Hinweis', () => {
    const t = text(basis());
    expect(t).toContain('Anna Muster');
    expect(t).toContain('X AG');
    expect(t).toContain("CHF 12'000");
    expect(t).toContain('Forderung aus Werkvertrag');
    expect(t).toContain('Zivilgericht Basel-Stadt');
    expect(t).toContain('Art. 131 ZPO');
    expect(t).toContain('Klagebewilligung der Schlichtungsbehörde vom 01.05.2026');
  });
  it('ohne Begründung: Verzichts-Baustein (Art. 244 Abs. 2 / 245 Abs. 1); mit: Behauptungen + Beweismittel', () => {
    const ohne = kvZusammenstellen(basis());
    expect(ohne.aufgenommen).toContain('K09_keine_begruendung');
    expect(ohne.aufgenommen).not.toContain('K08b_sachverhalt');
    const mit = kvZusammenstellen(basis({
      begruendungAktiv: true,
      sachverhalt: [{ text: 'Am 1.2.2026 bestellte die Beklagte…' }],
      beweismittel: [{ bezeichnung: 'Rechnung Nr. 2026-12', fuer: 'Bestand der Forderung' }],
    }));
    expect(mit.aufgenommen).toContain('K08b_sachverhalt');
    expect(mit.aufgenommen).not.toContain('K09_keine_begruendung');
    const t = text(basis({ begruendungAktiv: true, sachverhalt: [{ text: 'B1' }], beweismittel: [{ bezeichnung: 'U1', fuer: 'B1' }] }));
    expect(t).toContain('(zum Beweis: B1)');
  });
  it('Arbeitsmaterie → Adressat Arbeitsgericht + Kostenfreiheits-Satz', () => {
    const t = text(basis({ materie: 'arbeit', streitwert: '20000' }));
    expect(t).toContain('Arbeitsgericht Basel-Stadt');
    expect(t).toContain('Art. 114 lit. c ZPO');
  });
  it('unbeziffert: Art.-85-Begehren mit Mindestwert; Rechtsöffnungs-Begehren bei Betreibung', () => {
    const t = text(basis({ begehrenTyp: 'unbeziffert', unbeziffertMindest: '5000', rechtsoeffnung: true, betreibungNr: '123456' }));
    expect(t).toContain('mindestens jedoch CHF 5\'000');
    expect(t).toContain('Art. 85 ZPO');
    expect(t).toContain('Rechtsvorschlag in der Betreibung Nr. 123456');
  });
  it('Ausnahme statt Klagebewilligung: Art.-198-Satz erscheint', () => {
    const t = text(basis({ klagebewilligungVorhanden: false, ausnahme: 'art198', ausnahmeText: 'Widerklage (lit. g)' }));
    expect(t).toContain('Art. 198 ZPO: Widerklage (lit. g)');
  });
  it('JEDES Rechtsbegehren erhält eine eigene Ziffer (Ultra-Review HOCH-2, 7.6.2026)', () => {
    // Hauptbegehren + weiteres Begehren + (immer angehängte) Kostenfolge → 1./2./3.
    const e = kvZusammenstellen(basis({ weitereRechtsbegehren: ['Eventualiter sei …'] }));
    const rb = e.dokument.absaetze.find((x) => x.bausteinId === 'K06_begehren')!;
    const zeilen = rb.text.split('\n');
    expect(zeilen.length).toBeGreaterThanOrEqual(3);
    zeilen.forEach((z, i) => expect(z.startsWith(`${i + 1}. `), `Zeile ${i}: «${z.slice(0, 40)}»`).toBe(true));
  });
});

describe('Klage vereinfacht — Mängel/Hinweise', () => {
  it('Stopp-Mängel: ordentlich / Arbeit > 30k / KVG', () => {
    expect(kvMaengel(basis({ streitwert: '50000' })).some((m) => m.text.includes('ordentliches Verfahren'))).toBe(true);
    expect(kvMaengel(basis({ materie: 'arbeit', streitwert: '50000' })).some((m) => m.text.includes('§ 73 Abs. 2'))).toBe(true);
    expect(kvMaengel(basis({ materie: 'kvg_zusatz' })).some((m) => m.text.includes('Sozialversicherungsgericht'))).toBe(true);
  });
  it('Pflichtangaben: Streitgegenstand, Parteien, KB-Datum, Datum', () => {
    const m = kvMaengel({ ...KV_DEFAULTS, materie: 'vermoegensrechtlich', streitwert: '1000' });
    expect(m.some((x) => x.text.includes('Streitgegenstand'))).toBe(true);
    expect(m.some((x) => x.text.includes('Klagende Partei'))).toBe(true);
    expect(m.some((x) => x.text.includes('Datum der Klagebewilligung'))).toBe(true);
  });
  it('keine KB und keine Ausnahme → Mangel; mit Ausnahme nicht', () => {
    expect(kvMaengel(basis({ klagebewilligungVorhanden: false, ausnahme: '' })).some((x) => x.text.includes('Klagebewilligung beilegen'))).toBe(true);
    expect(kvMaengel(basis({ klagebewilligungVorhanden: false, ausnahme: 'verzicht_einseitig' })).some((x) => x.text.includes('Klagebewilligung beilegen'))).toBe(false);
  });
  it('Hinweise: Klagefrist-Ablauf + Miete-Kostenfreiheits-Abweichung offengelegt', () => {
    const h = kvHinweise(basis({ materie: 'miete_kernbereich' }));
    expect(h.some((x) => x.includes('nicht gerichtskostenfrei'))).toBe(true);
    expect(h.some((x) => x.includes('Klagefrist'))).toBe(true);
  });
  it('Streitwert-Helfer: Apostroph-Format und unbezifferter Mindestwert', () => {
    expect(kvStreitwert(basis({ streitwert: "12'000" }))).toBe(12000);
    expect(kvStreitwert(basis({ begehrenTyp: 'unbeziffert', unbeziffertMindest: '5000', streitwert: '' }))).toBe(5000);
  });
});

describe('kvKlagefrist — Kalender-Gültigkeit (Bug-Check-Fix 5.6.2026)', () => {
  it('syntaktisch gültige, kalendarisch unmögliche Daten → null statt Wurf', () => {
    for (const d of ['2025-02-30', '2025-13-01', '2025-00-10', '2025-04-31']) {
      expect(kvKlagefrist(d, 'vermoegensrechtlich')).toBeNull();
      expect(kvKlagefrist(d, 'miete_kernbereich')).toBeNull();
    }
    // Schalttag bleibt gültig
    expect(kvKlagefrist('2024-02-29', 'vermoegensrechtlich')).not.toBeNull();
  });
});
