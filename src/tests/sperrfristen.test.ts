import { describe, it, expect } from 'vitest';
import { berechneSperrfristen } from '../lib/sperrfristen';
import type { SperrfristenInput } from '../types/legal';

const BASE: Omit<SperrfristenInput, 'sperrereignisse'> = {
  vertragsbeginn: '2020-01-01',
  zugangKuendigung: '2025-04-20',
  kuendigendePartei: 'arbeitgeber',
  probezeitMonate: 1,
  kuendigungsterminMonatsende: true,
};

function rechenwegText(r: ReturnType<typeof berechneSperrfristen>): string {
  return r.rechenweg.map((s) => s.beschreibung + ' ' + s.zwischenergebnis).join('\n');
}

describe('Sperrfristen P1/P2 (Art. 336c OR)', () => {
  // §7.1 – Rückrechnungsprinzip: Sperrgrund nur zwischen Zugang und Fristbeginn → keine Hemmung
  it('§7.1: Sperrgrund zwischen Zugang und (rückgerechnetem) Fristbeginn → keine Hemmung', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-05',   // dj6 → 2 Monate; ende_ungehemmt 30.06., Fristbeginn 30.04.
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-04-06', bis: '2025-04-20' }, // vor Fristbeginn
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('30.06.2025');           // Beendigung unverändert
    expect(r.ergebnis).toContain('Keine Sperrfrist-Hemmung');
  });

  // §7.2 – Art. 77 OR: Krankheit 30 Tage im 1. DJ: Beginn T → Sperrende T+30 (nicht T+29)
  it('§7.2: Krankheit 30 Tage 1. DJ → Sperrende von+30 (Art. 77 OR)', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2025-01-01',     // 1. DJ
      zugangKuendigung: '2025-09-01',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-03-01', bis: '2025-12-01' }, // lange Krankheit
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('31.03.2025');   // 01.03. + 30 Tage = 31.03. (nicht 30.03.)
    expect(txt).not.toContain('30.03.2025');
  });

  // §7.3 – Zwei verschiedene Krankheiten parallel → Union, keine Doppelzählung
  it('§7.3: Zwei parallele Krankheiten → Union (46 statt 63 Hemmungstage)', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-20',   // Fenster 30.04.–30.06.
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-31' },
        { typ: 'krankheit_unfall', von: '2025-05-15', bis: '2025-06-15' },
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('um 46 Tage'); // Union [01.05–15.06] ∩ Fenster = 46 (nicht 31+32)
  });

  // §7.4 – Rückfall gleiche Ursache → nur eine Sperrfrist
  it('§7.4: Rückfall derselben Ursache → keine zweite Sperrfrist', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-20',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-10' },
        { typ: 'krankheit_unfall', von: '2025-06-01', bis: '2025-06-10', gleicheUrsacheWieEreignis: 0 },
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('um 10 Tage'); // nur Ereignis 0 zählt
    expect(rechenwegText(r)).toContain('Rückfall');
  });

  // §7.5 – Dienstjahreswechsel 1→2 während laufender Krankheit → 90 Tage ab erstem AUF-Tag
  it('§7.5: DJ-Wechsel 1→2 während Sperrfrist → 90 Tage ab erstem AUF-Tag', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2025-01-01',
      zugangKuendigung: '2025-12-01',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-12-15', bis: '2026-06-01' }, // Jahrestag 01.01.2026 in 30-Tage-Frist
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('Dienstjahreswechsel');
    expect(txt).toContain('15.03.2026'); // 15.12.2025 + 90 Tage
  });

  // Schaltjahr-Regression: Vertragsbeginn 29.2. → DJ-Wechsel-Jahrestag 28.2. (addYears,
  // konsistent mit differenceInYears in berechneDienstjahr), NICHT 1.3. (Date-Überlauf).
  it('Schaltjahr: Vertragsbeginn 29.02.2020, DJ-Wechsel 1→2 am 28.02.2021, nicht 01.03.2021', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2020-02-29',
      zugangKuendigung: '2021-01-15',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2021-02-01', bis: '2021-06-01' }, // 30-Tage-Frist läuft am Jahrestag noch
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('Dienstjahreswechsel');
    expect(txt).toContain('am 28.02.2021 während laufender Sperrfrist');
    expect(txt).toContain('02.05.2021'); // 01.02.2021 + 90 Tage (Art. 77 OR, ab erstem AUF-Tag)
  });

  // §7.6 – Sperrfrist endete im alten DJ → keine Verlängerung
  it('§7.6: Sperrfrist endet vor Jahrestag → keine C5-Verlängerung', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2025-01-01',
      zugangKuendigung: '2025-09-15',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-10-01', bis: '2026-06-01' }, // 30-Tage-Frist endet 31.10., Jahrestag 01.01.2026 später
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('31.10.2025');         // 30 Tage, nicht verlängert
    expect(txt).not.toContain('Dienstjahreswechsel');
  });

  // §7.7 – Zugang in Sperrfrist → nichtig
  it('§7.7: Zugang in Sperrfrist → nichtig', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-05-10',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-06-30' },
      ],
    });
    expect(r.status).toBe('nichtig');
  });

  // §7.8 – Arbeitnehmerkündigung → keine Sperrfristen
  it('§7.8: Arbeitnehmerkündigung → keine Sperrfristen', () => {
    const r = berechneSperrfristen({
      ...BASE,
      kuendigendePartei: 'arbeitnehmer',
      zugangKuendigung: '2025-05-10',
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-06-30' },
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.status).not.toBe('nichtig');
  });

  // Betreuungsurlaub (Art. 329i OR) – Sperrfrist max. 6 Monate
  it('Betreuungsurlaub: Sperrfrist gekappt auf 6 Monate ab Beginn', () => {
    const r = berechneSperrfristen({
      ...BASE,
      vertragsbeginn: '2020-01-01',
      zugangKuendigung: '2025-11-01',
      sperrereignisse: [
        { typ: 'betreuungsurlaub', von: '2025-01-01', bis: '2025-12-31' }, // 1 Jahr → auf 01.07. gekappt
      ],
    });
    const txt = rechenwegText(r);
    expect(txt).toContain('Betreuungsurlaub');
    expect(txt).toContain('01.07.2025'); // 6 Monate ab 01.01.2025
    expect(txt).not.toContain('31.12.2025');
  });

  // §7.9 – Neue AUF in Erstreckungsphase → ignoriert
  it('§7.9: Sperrgrund in Erstreckungsphase (nach Endtermin) → ignoriert', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-20',   // Fenster 30.04.–30.06.
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-20' }, // 20 Hemmungstage
        { typ: 'krankheit_unfall', von: '2025-07-25', bis: '2025-08-05' }, // nach Endtermin → ignoriert
      ],
    });
    expect(r.status).toBe('ok');
    expect(r.ergebnis).toContain('um 20 Tage'); // nur das erste Ereignis
    expect(r.ergebnis).toContain('31.07.2025');
  });
});

describe('Sperrtage-Zähler (Art. 336c Abs. 1 OR)', () => {
  it('Krankheit 2. DJ: Kontingent 90, beansprucht nach Art. 77, verbleibend', () => {
    const e = berechneSperrfristen({
      vertragsbeginn: '2023-01-01', zugangKuendigung: '2024-07-01', kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1, kuendigungsterminMonatsende: true,
      sperrereignisse: [{ typ: 'krankheit_unfall', von: '2024-06-01', bis: '2024-07-15' }],
    });
    const z = e.sperrtage![0];
    expect(z.kontingent).toBe(90);
    expect(z.beansprucht).toBe(44); // 01.06.–15.07., Anfangstag zählt nicht
    expect(z.verbleibend).toBe(46);
    expect(z.rueckfall).toBeUndefined();
  });

  it('Kontingent ausgeschöpft: AUF länger als Sperrfrist → verbleibend 0', () => {
    const e = berechneSperrfristen({
      vertragsbeginn: '2023-01-01', zugangKuendigung: '2024-09-01', kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1, kuendigungsterminMonatsende: true,
      sperrereignisse: [{ typ: 'krankheit_unfall', von: '2024-01-10', bis: '2024-12-31' }],
    });
    const z = e.sperrtage![0];
    expect(z.beansprucht).toBe(90);
    expect(z.verbleibend).toBe(0);
  });

  it('Rückfall gleicher Ursache: kein neues Kontingent, 0 beansprucht', () => {
    const e = berechneSperrfristen({
      vertragsbeginn: '2023-01-01', zugangKuendigung: '2024-09-01', kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1, kuendigungsterminMonatsende: true,
      sperrereignisse: [
        { typ: 'krankheit_unfall', von: '2024-02-01', bis: '2024-02-20' },
        { typ: 'krankheit_unfall', von: '2024-05-01', bis: '2024-05-10', gleicheUrsacheWieEreignis: 0 },
      ],
    });
    expect(e.sperrtage).toHaveLength(2);
    expect(e.sperrtage![1].rueckfall).toBe(true);
    expect(e.sperrtage![1].beansprucht).toBe(0);
  });

  it('Militärdienst > 11 Tage: Kalendertage inkl. ±4 Wochen, kein Kontingent', () => {
    const e = berechneSperrfristen({
      vertragsbeginn: '2020-01-01', zugangKuendigung: '2024-09-01', kuendigendePartei: 'arbeitgeber',
      probezeitMonate: 1, kuendigungsterminMonatsende: true,
      sperrereignisse: [{ typ: 'militaer_zivil', von: '2024-03-04', bis: '2024-03-22' }],
    });
    const z = e.sperrtage![0];
    expect(z.kontingent).toBeUndefined();
    expect(z.beansprucht).toBe(19 + 56); // 19 Diensttage + je 28 davor/danach
  });
});

describe('Audit 5.6.2026 – anschliessende Sperrfristen bei Nichtigkeit', () => {
  it('frühestens neue Kündigung erst nach ALLEN zusammenhängenden Sperrfristen', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-03-15',
      sperrereignisse: [
        { typ: 'militaer_zivil', von: '2025-03-12', bis: '2025-03-20' },
        { typ: 'militaer_zivil', von: '2025-03-21', bis: '2025-03-30' },
      ],
    });
    expect(r.status).toBe('nichtig');
    // NICHT 21.03. (mitten in der zweiten Sperrfrist), sondern nach deren Ende
    expect(r.fruehesteNeueKuendigungISO).toBe('2025-03-31');
    expect(rechenwegText(r)).toContain('anschliessende weitere Sperrfrist');
  });
});

// ─── B1/B10-Fixes 6.6.2026 (deklarierte fachliche Erweiterung) ──────────────
// Art. 336c Abs. 1 lit. cbis/cter/cquinquies (am OR-Cache 20260101 verifiziert)
// + deterministische Niederkunfts-Berechnung für lit. c.

describe('Audit-Fix B1 – neue Sperrfrist-Tatbestände lit. cbis/cter/cquinquies', () => {
  it('lit. cbis: Kündigung im verlängerten Mutterschaftsurlaub → nichtig', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-04-20',
      sperrereignisse: [
        { typ: 'mutterschaftsurlaub_verlaengert', von: '2025-03-01', bis: '2025-07-15' },
      ],
    });
    expect(r.status).toBe('nichtig');
    expect(r.fruehesteNeueKuendigungISO).toBe('2025-07-16');
    expect(rechenwegText(r)).toContain('Art. 329f Abs. 2');
  });

  it('lit. cter: Kappung «3 Monate ab Ende der lit.-c-Sperrfrist» greift mit Niederkunftsdatum', () => {
    // Niederkunft 01.01.2025 → lit.-c-Ende 23.04.2025 → Kappe 23.07.2025.
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-02-10', // im Urlaubszeitraum → nichtig; Intervall prüfen
      sperrereignisse: [
        { typ: 'zusatzurlaub_tod_elternteil', von: '2025-02-01', bis: '2025-08-31', niederkunft: '2025-01-01' },
      ],
    });
    expect(r.status).toBe('nichtig');
    expect(r.sperrIntervalle?.[0].bis).toBe('2025-07-23'); // gekappt, nicht 31.08.
    expect(rechenwegText(r)).toContain('überschreitet die Kappung');
  });

  it('lit. cter ohne Niederkunftsdatum: Kappung offen, ehrlicher Hinweis', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-02-10',
      sperrereignisse: [
        { typ: 'zusatzurlaub_tod_elternteil', von: '2025-02-01', bis: '2025-08-31' },
      ],
    });
    expect(r.sperrIntervalle?.[0].bis).toBe('2025-08-31');
    expect(rechenwegText(r)).toContain('NICHT geprüft');
  });

  it('lit. cquinquies: Kündigung während des Urlaubs nach Tod der Mutter → nichtig', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-05-01',
      sperrereignisse: [
        { typ: 'urlaub_tod_mutter', von: '2025-04-10', bis: '2025-07-17' }, // 14 Wochen ab Tag nach Tod
      ],
    });
    expect(r.status).toBe('nichtig');
    expect(rechenwegText(r)).toContain('Art. 329gbis');
  });
});

describe('Audit-Fix B10 – Schwangerschaft: deterministisches Ende aus Niederkunftsdatum', () => {
  it('mit Niederkunft: Ende = Niederkunft + 112 Tage (Nutzereingabe «bis» wird ersetzt)', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-09-01', // innerhalb der berechneten Frist → nichtig
      sperrereignisse: [
        // bewusst falsches «bis» (zu früh) — die Engine muss 21.09.2025 rechnen
        { typ: 'schwangerschaft', von: '2024-10-01', bis: '2025-07-01', niederkunft: '2025-06-01' },
      ],
    });
    expect(r.status).toBe('nichtig');
    expect(r.sperrIntervalle?.[0].bis).toBe('2025-09-21');
    expect(rechenwegText(r)).toContain('berechnetes Ende 21.09.2025');
  });

  it('ohne Niederkunft: Verhalten unverändert («bis» gemäss Eingabe), ehrlich deklariert', () => {
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2025-05-01',
      sperrereignisse: [
        { typ: 'schwangerschaft', von: '2024-10-01', bis: '2025-07-01' },
      ],
    });
    expect(r.sperrIntervalle?.[0].bis).toBe('2025-07-01');
    expect(rechenwegText(r)).toContain('Ende gemäss Eingabe');
  });
});

describe('Randfall-Fix 6.6.2026 — cter-Urlaub nach Ablauf der Kappung', () => {
  it('Urlaubsbeginn nach der Kappe → KEIN Schutz, kein invertiertes Intervall, 0 Sperrtage', () => {
    // Niederkunft 01.01.2026 → lit.-c-Ende 23.04. → Kappe 23.07.2026;
    // Urlaub erst 01.–10.08.2026 (Rahmenfrist 6 Monate ab Tod erlaubt das).
    const r = berechneSperrfristen({
      ...BASE,
      zugangKuendigung: '2026-08-05', // läge IM Urlaub — darf NICHT nichtig machen
      sperrereignisse: [
        { typ: 'zusatzurlaub_tod_elternteil', von: '2026-08-01', bis: '2026-08-10', niederkunft: '2026-01-01' },
      ],
    });
    expect(r.status).toBe('ok'); // kein Schutz → Kündigung gültig
    expect(r.sperrIntervalle ?? []).toHaveLength(0);
    expect(r.sperrtage?.[0].beansprucht).toBe(0);
    expect(rechenwegText(r)).toContain('KEIN zeitlicher');
  });
});
