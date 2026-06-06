import { describe, it, expect } from 'vitest';
import { berechneMietkuendigung } from '../lib/mietrecht';
import {
  berechneVermieterkuendigungsSpiegel, ddMMyyyyZuISO, VK_KUENDIGUNGSARTEN,
  type VermieterkuendigungSpiegelInput,
} from '../lib/fristenspiegel/vermieterkuendigung';
import { icsFuerFrist, icsSammel } from '../lib/icsExport';
import { KANTONE } from '../lib/kantone';

// ─── Fristenspiegel-Rahmen + Pilot A.4 (FAHRPLAN-PRAXIS 3.1b) ───────────────
// Konzept: bibliothek/recherche/fristenspiegel-konzept.md. Der zentrale
// Beweis: Der Spiegel rechnet NICHTS selbst — jedes Zeilen-Datum ist exakt
// das Resultat der bestehenden Engine (§5; «Golden-Test» des Konzepts §D.3).

const FAELLE: VermieterkuendigungSpiegelInput[] = [
  { zugang: '2026-06-06', objekt: 'wohnung', kanton: 'ZH', kuendigungsart: 'ordentlich' },
  { zugang: '2026-06-06', objekt: 'geschaeftsraum', kanton: 'BS', kuendigungsart: 'ordentlich' },
  { zugang: '2026-12-15', objekt: 'wohnung', kanton: 'VS', kuendigungsart: 'wichtige_gruende' },
  // Fristende 30 Tage später auf einem Wochenende/Feiertag → Art. 78 OR
  { zugang: '2026-03-02', objekt: 'wohnung', kanton: 'TI', kuendigungsart: 'ordentlich' },
  { zugang: '2026-06-06', objekt: 'wohnung', kanton: 'ZH', kuendigungsart: 'zahlungsverzug' },
  { zugang: '2026-06-06', objekt: 'geschaeftsraum', kanton: 'GE', kuendigungsart: 'pflichtverletzung' },
];

describe('Fristenspiegel A.4: Spiegel-Datum == direktes Engine-Resultat (keine zweite Rechnung)', () => {
  it.each(FAELLE)('Fall %#: $kuendigungsart $objekt $kanton', (fall) => {
    const direkt = berechneMietkuendigung({
      kuendigungsart: fall.kuendigungsart, objekt: fall.objekt, zugang: fall.zugang,
      kanton: fall.kanton, partei: 'vermieter', terminQuelle: 'jedes_monatsende',
    });
    const spiegel = berechneVermieterkuendigungsSpiegel(fall);
    const anfechtung = spiegel.zeilen.find((z) => z.key === 'anfechtung')!;
    const erstreckung = spiegel.zeilen.find((z) => z.key === 'erstreckung')!;

    // Anfechtung: identischer Anzeigetext UND konsistentes ISO
    expect(anfechtung.endeText).toBe(direkt.anfechtungBis);
    expect(anfechtung.endeISO).toBe(ddMMyyyyZuISO(direkt.anfechtungBis!));

    if (direkt.erstreckungBis) {
      expect(erstreckung.status).toBe('berechnet');
      expect(erstreckung.endeText).toBe(direkt.erstreckungBis);
    } else {
      // Art. 257d/257f → Art. 272a: Engine unterdrückt, Spiegel legt offen
      expect(erstreckung.status).toBe('ausgeschlossen');
      expect(erstreckung.normRef).toBe('Art. 272a OR');
      expect(erstreckung.endeISO).toBeUndefined();
    }
  });

  it('257d/257f schliessen die Erstreckung aus; ordentliche Kündigung nicht', () => {
    const aus = (art: VermieterkuendigungSpiegelInput['kuendigungsart']) =>
      berechneVermieterkuendigungsSpiegel({ zugang: '2026-06-06', objekt: 'wohnung', kanton: 'ZH', kuendigungsart: art })
        .zeilen.find((z) => z.key === 'erstreckung')!.status;
    expect(aus('zahlungsverzug')).toBe('ausgeschlossen');
    expect(aus('pflichtverletzung')).toBe('ausgeschlossen');
    expect(aus('ordentlich')).toBe('berechnet');
    expect(aus('wichtige_gruende')).toBe('berechnet');
  });

  it('Anfechtung/Erstreckung hängen NUR am Zugang — nicht an der Termin-Quelle (Pilot-Annahme)', () => {
    // Beweis der Pilot-Annahme: terminQuelle variiert, die Art.-273-Daten nicht.
    const a = berechneMietkuendigung({ kuendigungsart: 'ordentlich', objekt: 'wohnung', zugang: '2026-06-06', kanton: 'ZH', partei: 'vermieter', terminQuelle: 'jedes_monatsende' });
    const b = berechneMietkuendigung({ kuendigungsart: 'ordentlich', objekt: 'wohnung', zugang: '2026-06-06', kanton: 'ZH', partei: 'vermieter', terminQuelle: 'vertraglich_monate', vertragsTermineMonate: [3, 9] });
    expect(a.anfechtungBis).toBe(b.anfechtungBis);
    expect(a.erstreckungBis).toBe(b.erstreckungBis);
  });

  it('alle Pilot-Kündigungsarten laufen für alle 26 Kantone deterministisch durch', () => {
    for (const kanton of KANTONE) {
      for (const { code } of VK_KUENDIGUNGSARTEN) {
        const e = berechneVermieterkuendigungsSpiegel({ zugang: '2026-06-06', objekt: 'wohnung', kanton, kuendigungsart: code });
        expect(e.zeilen.find((z) => z.key === 'anfechtung')!.endeISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        // zweiter Lauf identisch (§2)
        expect(berechneVermieterkuendigungsSpiegel({ zugang: '2026-06-06', objekt: 'wohnung', kanton, kuendigungsart: code })).toEqual(e);
      }
    }
  });

  it('Spiegel legt Annahmen/Weichen offen (§8): Formgültigkeit, befristetes Verhältnis', () => {
    const e = berechneVermieterkuendigungsSpiegel({ zugang: '2026-06-06', objekt: 'wohnung', kanton: 'ZH', kuendigungsart: 'ordentlich' });
    expect(e.annahmen.some((a) => a.includes('Formgültige Kündigung vorausgesetzt'))).toBe(true);
    expect(e.warnungen.some((w) => w.includes('60 Tage vor Ablauf'))).toBe(true);
  });
});

describe('Fristenspiegel A.1: Zivilentscheid — Weiche aus bestimmeRechtsmittel, Datum aus berechneFrist (§5)', async () => {
  const { berechneZivilentscheidsSpiegel } = await import('../lib/fristenspiegel/zivilentscheid');
  const { bestimmeRechtsmittel } = await import('../lib/zustaendigkeit');
  const { berechneFrist } = await import('../lib/zpoFristen');
  const { PRESETS } = await import('../lib/zpoPresets');

  const rmZeile = (e: ReturnType<typeof berechneZivilentscheidsSpiegel>) =>
    e.zeilen.find((z) => z.key === 'rechtsmittel')!;

  it('Berufung ordentlich (SW ≥ 10k): 30 Tage MIT Stillstand — Datum == direkte Engine', () => {
    const spiegel = berechneZivilentscheidsSpiegel({
      zustellung: '2026-07-01', kanton: 'ZH', vermoegensrechtlich: true,
      streitwertCHF: 50_000, verfahren: 'ordentlich_vereinfacht',
    });
    const direkt = berechneFrist({ ereignis: '2026-07-01', einheit: 'tage', laenge: 30, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich', gerichtshinweisStillstand: true });
    const z = rmZeile(spiegel);
    expect(z.normRef).toBe('Art. 311 Abs. 1 ZPO');
    expect(z.endeText).toBe(direkt.diesAdQuem);
    expect(direkt.stillstandAktiv).toBe(true); // Zustellung 1.7. → Stillstand 15.7.–15.8. greift
  });

  it('Beschwerde (SW < 10k) und summarisch (10 T OHNE Stillstand): konsistent mit der Weiche', () => {
    const beschwerde = berechneZivilentscheidsSpiegel({
      zustellung: '2026-07-01', kanton: 'ZH', vermoegensrechtlich: true,
      streitwertCHF: 5_000, verfahren: 'ordentlich_vereinfacht',
    });
    expect(rmZeile(beschwerde).normRef).toBe('Art. 321 Abs. 1 ZPO');
    expect(rmZeile(beschwerde).label).toContain('Beschwerde');

    const summar = berechneZivilentscheidsSpiegel({
      zustellung: '2026-07-01', kanton: 'ZH', vermoegensrechtlich: true,
      streitwertCHF: 50_000, verfahren: 'summarisch',
    });
    const direkt10 = berechneFrist({ ereignis: '2026-07-01', einheit: 'tage', laenge: 10, verfahren: 'summarisch', kanton: 'ZH', fristnatur: 'gesetzlich', gerichtshinweisStillstand: true });
    expect(rmZeile(summar).normRef).toBe('Art. 314 Abs. 1 ZPO');
    expect(rmZeile(summar).endeText).toBe(direkt10.diesAdQuem);
    expect(direkt10.stillstandAktiv).toBe(false); // Art. 145 Abs. 2 lit. b
    // Anschlussberufung im Summarverfahren unzulässig (Art. 314 Abs. 1)
    expect(summar.zeilen.find((z) => z.key === 'anschlussberufung')!.status).toBe('ausgeschlossen');
  });

  it('familienrechtliche Summarsache (Art. 314 Abs. 2): 30 Tage, trotzdem KEIN Stillstand; Anschluss zulässig (Hinweis)', () => {
    const e = berechneZivilentscheidsSpiegel({
      zustellung: '2026-07-01', kanton: 'ZH', vermoegensrechtlich: false,
      streitwertCHF: null, verfahren: 'summarisch', familienSummarsache: true,
    });
    const rm = bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: false, streitwertCHF: null, rmVerfahren: 'summarisch', rmFamilienSummarsache: true });
    expect(rm.kantonalFrist!.tage).toBe(30);
    expect(rm.kantonalFrist!.stillstand).toBe(false);
    const direkt = berechneFrist({ ereignis: '2026-07-01', einheit: 'tage', laenge: 30, verfahren: 'summarisch', kanton: 'ZH', fristnatur: 'gesetzlich', gerichtshinweisStillstand: true });
    expect(rmZeile(e).normRef).toBe('Art. 314 Abs. 2 ZPO');
    expect(rmZeile(e).endeText).toBe(direkt.diesAdQuem);
    expect(e.zeilen.find((z) => z.key === 'anschlussberufung')!.status).toBe('hinweis');
  });

  it('Spiegel-Norm steht im Weiche-Text (Schutz gegen Divergenz der Norm-Pille)', () => {
    const faelle = [
      { vr: true, sw: 50_000, vf: 'ordentlich_vereinfacht' as const, fam: false },
      { vr: true, sw: 5_000, vf: 'ordentlich_vereinfacht' as const, fam: false },
      { vr: true, sw: 50_000, vf: 'summarisch' as const, fam: false },
      { vr: false, sw: null, vf: 'summarisch' as const, fam: true },
    ];
    for (const f of faelle) {
      const e = berechneZivilentscheidsSpiegel({ zustellung: '2026-03-02', kanton: 'BE', vermoegensrechtlich: f.vr, streitwertCHF: f.sw, verfahren: f.vf, familienSummarsache: f.fam });
      const rm = bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: f.vr, streitwertCHF: f.sw, rmVerfahren: f.vf, rmFamilienSummarsache: f.fam });
      const artNummer = rmZeile(e).normRef.replace(' ZPO', '').replace('Art. ', '');
      expect(rm.kantonalFrist!.text, JSON.stringify(f)).toContain(artNummer);
    }
  });

  it('nur Dispositiv (Art. 239 ZPO): Begründungs-Frist == zpoPresets-Parameter; KEIN Rechtsmittel-Datum (§1)', () => {
    const e = berechneZivilentscheidsSpiegel({
      zustellung: '2026-07-01', kanton: 'ZH', vermoegensrechtlich: true,
      streitwertCHF: 50_000, verfahren: 'ordentlich_vereinfacht', nurDispositiv: true,
    });
    const beg = e.zeilen.find((z) => z.key === 'begruendung')!;
    // Parameter-Identität mit dem bestehenden Preset (§5)
    const preset = PRESETS.find((p) => p.key === 'begruendung')!;
    expect(preset).toMatchObject({ einheit: 'tage', laenge: 10, verfahren: 'ordentlich', fristnatur: 'gesetzlich', norm: 'Art. 239 Abs. 2 ZPO' });
    const direkt = berechneFrist({ ereignis: '2026-07-01', einheit: preset.einheit, laenge: preset.laenge!, verfahren: preset.verfahren, kanton: 'ZH', fristnatur: preset.fristnatur });
    expect(beg.endeText).toBe(direkt.diesAdQuem);
    // Rechtsmittel: Hinweis ohne Datum — die Frist läuft erst ab Begründung
    const rm = rmZeile(e);
    expect(rm.status).toBe('hinweis');
    expect(rm.endeISO).toBeUndefined();
  });

  it('BGer immer als abgesetzte Folgestufe ohne Datum; Determinismus (zweiter Lauf identisch)', () => {
    const input = { zustellung: '2026-07-01', kanton: 'ZH' as const, vermoegensrechtlich: true, streitwertCHF: 20_000, verfahren: 'ordentlich_vereinfacht' as const, mietOderArbeit: true };
    const e = berechneZivilentscheidsSpiegel(input);
    const bger = e.zeilen.find((z) => z.key === 'bger')!;
    expect(bger.status).toBe('hinweis');
    expect(bger.endeISO).toBeUndefined();
    // BGer-Schwelle 15k (Art. 74 I lit. a) via mietOderArbeit in den Warnungen
    expect(e.warnungen.join(' ')).toContain('15');
    expect(berechneZivilentscheidsSpiegel(input)).toEqual(e);
  });
});

describe('icsExport: Byte-Anker + Sammel-Export (3.1b, §6)', () => {
  it('icsFuerFrist ist nach der Helfer-Hebung BYTE-IDENTISCH (Anker vor dem Umbau erfasst)', () => {
    const out = icsFuerFrist({
      titel: 'Berufung; Frist, läuft\nab',
      endISO: '2026-07-07',
      beschreibung: 'Ein länger Text mit Umlauten äöü und Sonderzeichen ;,\\ der sicher über fünfundsiebzig Oktette hinausläuft, damit die Faltung greift.',
      vorfristTage: 3,
    });
    expect(out).toBe(
      'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LexMetrik//Fristenrechner//DE\r\nCALSCALE:GREGORIAN\r\nBEGIN:VEVENT\r\nUID:frist-20260707-BerufungFristluftab@lexmetrik\r\nDTSTAMP:20260707T000000Z\r\nDTSTART;VALUE=DATE:20260707\r\nDTEND;VALUE=DATE:20260708\r\nSUMMARY:Berufung\\; Frist\\, läuft\\nab\r\nDESCRIPTION:Ein länger Text mit Umlauten äöü und Sonderzeichen \\;\\,\\\\ d\r\n er sicher über fünfundsiebzig Oktette hinausläuft\\, damit die Faltung g\r\n reift.\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Vorfrist: Berufung\\; Frist\\, läuft\\nab\r\nTRIGGER:-P3D\r\nEND:VALARM\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n',
    );
  });

  it('icsSammel: EIN VCALENDAR, n VEVENTs, deterministische UIDs, RFC-Faltung', () => {
    const out = icsSammel([
      { titel: 'Anfechtung der Kündigung', endISO: '2026-07-06', vorfristTage: 3 },
      { titel: 'Erstreckungsbegehren', endISO: '2026-07-06' },
      { titel: 'ohne gültiges Datum', endISO: 'kein-iso' }, // wird übersprungen
    ]);
    expect(out.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
    expect(out.match(/END:VCALENDAR/g)).toHaveLength(1);
    expect(out.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(out).toContain('UID:frist-20260706-AnfechtungderKndigung@lexmetrik');
    expect(out).toContain('UID:frist-20260706-Erstreckungsbegehren@lexmetrik');
    expect(out).not.toContain('kein-iso');
    // Faltung: keine Zeile über 75 Oktette
    const enc = new TextEncoder();
    for (const zeile of out.split('\r\n')) {
      expect(enc.encode(zeile).length, zeile).toBeLessThanOrEqual(75);
    }
    // Determinismus: zweiter Lauf byte-identisch
    expect(icsSammel([{ titel: 'Anfechtung der Kündigung', endISO: '2026-07-06', vorfristTage: 3 }, { titel: 'Erstreckungsbegehren', endISO: '2026-07-06' }, { titel: 'ohne gültiges Datum', endISO: 'kein-iso' }])).toBe(out);
  });
});
