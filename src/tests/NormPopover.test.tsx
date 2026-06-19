import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NormPopover } from '../components/NormPopover';
import { istSchliessTaste } from '../lib/normtext/tasten';
import type { NormSnapshot } from '../lib/normtext/typen';

// Norm-Vorschau-Popover. Testtechnik wie im Repo üblich (node-Env, kein jsdom):
// renderToString für die Markup-Zusicherungen; die Esc-Schliesslogik wird über
// den exportierten reinen Helfer istSchliessTaste geprüft (DOM-Events sind im
// node-Env nicht verfügbar). Der Schliess-Button + Esc-Verdrahtung sind im
// Markup als role/aria + Button präsent; die onClose-Wirkung der Taste ist über
// den Helfer deterministisch testbar.

const SNAP: NormSnapshot = {
  id: 'bund/OR/art_335_c',
  ebene: 'bund',
  quelle: 'OR',
  erlass: 'OR',
  artikel: '335_c',
  artikelLabel: 'Art. 335c',
  bloecke: [
    { absatz: '1', text: 'Das Arbeitsverhältnis kann im ersten Dienstjahr gekündigt werden.' },
    { absatz: '2', text: 'Diese Fristen dürfen durch schriftliche Abrede abgeändert werden.' },
    { absatz: '3', text: 'Kündigt der Arbeitgeber das Arbeitsverhältnis, so verlängert sich die Frist.' },
  ],
  stand: '2026-01-01',
  quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_335_c',
  abgerufen: '2026-06-16',
  fassungsToken: '20260101',
  sha: 'abc',
};

const html = (passus: { absatz: string | null; lit?: string; ziff?: string }) =>
  renderToString(<NormPopover snapshot={SNAP} passus={passus} onClose={() => {}} />);

describe('NormPopover — Render', () => {
  it('zeigt artikelLabel und erlass im Kopf — ohne Mittelpunkt (David 16.6.2026)', () => {
    const out = html({ absatz: '2' });
    expect(out).toContain('Art. 335c');
    expect(out).toContain('OR');
    // Titel ist «Art. 335c OR», kein «·» dazwischen.
    expect(out).toContain('aria-label="Art. 335c OR"');
    expect(out).not.toContain('·');
  });

  it('rendert alle Blöcke (jeder Text vorhanden)', () => {
    const out = html({ absatz: '2' });
    for (const b of SNAP.bloecke) {
      // erste Wörter genügen als eindeutiger Anker
      expect(out).toContain(b.text.split(' ').slice(0, 4).join(' '));
    }
    // genau drei data-passus-Markierungen (ein Block je)
    expect(out.match(/data-passus=/g)!.length).toBe(SNAP.bloecke.length);
  });

  it('markiert genau den zitierten Absatz mit data-passus="true"', () => {
    const out = html({ absatz: '2' });
    expect(out.match(/data-passus="true"/g)!.length).toBe(1);
    expect(out.match(/data-passus="false"/g)!.length).toBe(SNAP.bloecke.length - 1);
    // der hervorgehobene Block trägt den Abs-2-Text
    const segAb2 = out.split('data-passus="true"')[1];
    expect(segAb2).toContain('Diese Fristen dürfen');
  });

  it('passus.absatz null → nichts hervorgehoben', () => {
    const out = html({ absatz: null });
    expect(out).not.toContain('data-passus="true"');
    expect(out.match(/data-passus="false"/g)!.length).toBe(SNAP.bloecke.length);
  });

  it('Fuss: Live-Link mit Text-Fragment auf den hervorgehobenen Block', () => {
    const out = html({ absatz: '2' });
    const m = out.match(/href="([^"]*:~:text=[^"]*)"/);
    expect(m, 'Live-Link mit :~:text= muss vorhanden sein').not.toBeNull();
    const href = m![1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'");
    expect(href.startsWith(SNAP.quelleUrl)).toBe(true);
    expect(href).toContain(':~:text=');
    // EIN Fragment: der Artikel-Anker und das Text-Fragment teilen sich das #
    // (…#art_335_c:~:text=… — kein doppeltes #, damit der Anker auch ohne
    // Text-Fragment-Unterstützung greift).
    expect(href).toContain('#art_335_c:~:text=');
    expect((href.match(/#/g) ?? []).length).toBe(1);
    // Fragment-Text stammt aus dem hervorgehobenen Abs-2-Block
    expect(href).toContain(encodeURIComponent('Diese'));
    // Sicherheits-Attribute
    expect(out).toContain('target="_blank"');
    expect(out).toMatch(/rel="[^"]*noopener[^"]*"/);
  });

  it('ohne Hervorhebung: Text-Fragment auf den ersten Block', () => {
    const out = html({ absatz: null });
    const href = out.match(/href="([^"]*:~:text=[^"]*)"/)![1];
    expect(href).toContain(encodeURIComponent('Das'));
    expect((href.match(/#/g) ?? []).length).toBe(1);
  });

  it('Bund: «Fassung vom»-Label + Datum DD.MM.YYYY (David 17.6.2026)', () => {
    const out = html({ absatz: '1' });
    // Bund-Snapshot (ebene='bund') → «Fassung vom:»; Kanton → «In Kraft seit:».
    expect(out).toContain('Fassung vom:');
    // Datum IMMER DD.MM.YYYY (nicht ISO): Stand 2026-01-01 → 01.01.2026.
    expect(out).toContain('01.01.2026');
    expect(out).not.toContain('2026-01-01');
    expect(out).not.toContain('>Stand: ');
  });

  it('Fuss: «Im Gesetz öffnen» führt in die Lesesicht an die zitierte Stelle', () => {
    const out = html({ absatz: '1' });
    expect(out).toContain('Im Gesetz öffnen');
    expect(out).toContain('href="/gesetze/bund/OR#art-335_c"');
  });

  it('A11y: role=dialog, aria-modal, Schliess-Button, Disclaimer', () => {
    const out = html({ absatz: '1' });
    expect(out).toContain('role="dialog"');
    expect(out).toContain('aria-modal="true"');
    expect(out).toMatch(/aria-label="[^"]*Schliessen[^"]*"/);
    // Disclaimer (§8): Snapshot ist nicht massgeblich
    expect(out.toLowerCase()).toContain('massgeblich');
  });
});

describe('NormPopover — Absatz-Vergleich normalisiert (FIX 3)', () => {
  // FR-261.16 trägt den Absatz im Snapshot als «1.» (mit Punkt), das Zitat
  // aber als «1». Ohne Normalisierung der Vergleichsränder griffe die
  // Hervorhebung nicht. absatzNorm strippt nachgestellte Punkte/Whitespace.
  const SNAP_PUNKT: NormSnapshot = {
    ...SNAP,
    ebene: 'kanton',
    bloecke: [
      { absatz: '1.', text: 'Der erste Absatz, im Snapshot mit nachgestelltem Punkt.' },
      { absatz: '2.', text: 'Der zweite Absatz, ebenfalls mit Punkt.' },
    ],
  };

  it('Block-Absatz «1.» wird von passus.absatz «1» markiert (data-passus="true")', () => {
    const out = renderToString(
      <NormPopover snapshot={SNAP_PUNKT} passus={{ absatz: '1' }} onClose={() => {}} />,
    );
    expect(out.match(/data-passus="true"/g)!.length).toBe(1);
    const seg = out.split('data-passus="true"')[1];
    expect(seg).toContain('Der erste Absatz');
  });
});

describe('NormPopover — aufgehobene Absätze (David 16.6.2026)', () => {
  // Aufgehobene Absätze tragen im Snapshot (faithful, §7) nur «…»; das Popover
  // zeigt statt des nackten «…» die Kennzeichnung «aufgehoben» (Darstellung,
  // §3 — die Daten bleiben «…»).
  const SNAP_AUFGEHOBEN: NormSnapshot = {
    ...SNAP,
    bloecke: [
      { absatz: '1', text: 'Erster, gültiger Absatz mit Inhalt.' },
      { absatz: '2', text: '…' },
    ],
  };

  it('Block mit nur «…» rendert «aufgehoben», nicht das nackte «…»', () => {
    const out = renderToString(
      <NormPopover snapshot={SNAP_AUFGEHOBEN} passus={{ absatz: null }} onClose={() => {}} />,
    );
    expect(out).toContain('aufgehoben');
    // der gültige Absatz bleibt unverändert sichtbar
    expect(out).toContain('Erster, gültiger Absatz');
    // im Absatz-2-Segment steht «aufgehoben», nicht das nackte «…»
    const sup2 = out.split('<sup');
    const ab2 = sup2[sup2.length - 1];
    expect(ab2).toContain('aufgehoben');
    expect(ab2).not.toContain('>…<');
  });

  it('gültiger «…»-Inhalt mit weiterem Text bleibt unberührt', () => {
    const SNAP_MIT_PUNKTEN: NormSnapshot = {
      ...SNAP,
      bloecke: [{ absatz: '1', text: 'Text mit … Auslassung im Satz.' }],
    };
    const out = renderToString(
      <NormPopover snapshot={SNAP_MIT_PUNKTEN} passus={{ absatz: null }} onClose={() => {}} />,
    );
    expect(out).toContain('Text mit … Auslassung im Satz.');
    expect(out).not.toContain('aufgehoben');
  });
});

describe('NormPopover — Aufzählungs-Items (lit./Ziff., einheitlich Bund/Kanton)', () => {
  // Bund-Beispiel: OR 336 mit lit. a–c. Kanton-Beispiel: §11 mit Ziffern.
  // Beide laufen über DENSELBEN NormPopover — gleiches Markup, nur die Marke
  // (Buchstabe bei Bund, Zahl bei Kanton) unterscheidet sich (Daten).
  const SNAP_LIT: NormSnapshot = {
    ...SNAP,
    bloecke: [
      {
        absatz: '1',
        text: 'Die Kündigung ist missbräuchlich, wenn eine Partei sie ausspricht:',
        items: [
          { marke: 'a', text: 'wegen einer Eigenschaft der anderen Partei;' },
          { marke: 'b', text: 'weil die andere Partei ein verfassungsmässiges Recht ausübt;' },
          { marke: 'c', text: 'ausschliesslich um die Entstehung von Ansprüchen zu vereiteln;' },
        ],
      },
    ],
  };
  const SNAP_ZIFF: NormSnapshot = {
    ...SNAP,
    ebene: 'kanton',
    bloecke: [
      {
        absatz: null,
        text: 'Die Gebühr beträgt:',
        items: [
          { marke: '16', text: 'für die Beurkundung eines Testaments 200 Franken;' },
          { marke: '17', text: 'für die Beurkundung eines Erbvertrags 300 Franken;' },
          { marke: '18', text: 'für eine Bürgschaft 150 Franken.' },
        ],
      },
    ],
  };

  it('rendert alle Item-Marken + Texte (Bund lit.)', () => {
    const out = renderToString(
      <NormPopover snapshot={SNAP_LIT} passus={{ absatz: null }} onClose={() => {}} />,
    );
    for (const it of SNAP_LIT.bloecke[0].items!) {
      expect(out).toContain(it.marke + '.');
      expect(out).toContain(it.text.split(' ').slice(0, 4).join(' '));
    }
    // Einleitungstext des Absatzes bleibt sichtbar
    expect(out).toContain('Die Kündigung ist missbräuchlich');
  });

  it('passus.lit="b" → genau Item «b» trägt data-passus-item="true», andere nicht', () => {
    const out = renderToString(
      <NormPopover snapshot={SNAP_LIT} passus={{ absatz: '1', lit: 'b' }} onClose={() => {}} />,
    );
    expect(out.match(/data-passus-item="true"/g)!.length).toBe(1);
    // das markierte Item trägt den b-Text
    const seg = out.split('data-passus-item="true"')[1];
    expect(seg).toContain('verfassungsmässiges Recht');
    // der Absatz-Block ist nur DEZENT (kein starkes data-passus="true")
    expect(out).not.toContain('data-passus="true"');
  });

  it('passus.ziff="17" → genau Item «17» trägt data-passus-item="true», andere nicht (Kanton)', () => {
    const out = renderToString(
      <NormPopover snapshot={SNAP_ZIFF} passus={{ absatz: null, ziff: '17' }} onClose={() => {}} />,
    );
    expect(out.match(/data-passus-item="true"/g)!.length).toBe(1);
    const seg = out.split('data-passus-item="true"')[1];
    expect(seg).toContain('Erbvertrags');
    // Item 16 und 18 sind NICHT markiert
    const seg16 = out.split('16.')[1];
    expect(seg16.startsWith(' ') || seg16.includes('Testaments')).toBe(true);
  });

  it('ohne lit/ziff → Absatz-Markierung wie bisher (data-passus="true», kein Item-Mark)', () => {
    const out = renderToString(
      <NormPopover snapshot={SNAP_LIT} passus={{ absatz: '1' }} onClose={() => {}} />,
    );
    expect(out.match(/data-passus="true"/g)!.length).toBe(1);
    expect(out).not.toContain('data-passus-item="true"');
  });

  // B1: Nennt das Zitat eine Marke (ziff/lit) aber KEINEN Absatz und kommt die
  // Marke in mehreren Blöcken vor, darf nur GENAU EIN Item markiert werden (das
  // erste in Dokumentreihenfolge), nicht alle gleichnamigen.
  it('Marke ohne Absatz, dieselbe Marke in zwei Blöcken → genau EIN Item markiert (B1)', () => {
    const SNAP_MARKE_DOPPELT: NormSnapshot = {
      ...SNAP,
      ebene: 'kanton',
      bloecke: [
        {
          absatz: '1',
          text: 'Erster Absatz:',
          items: [
            { marke: '1', text: 'erste Ziffer im ersten Absatz;' },
            { marke: '2', text: 'zweite Ziffer im ersten Absatz;' },
          ],
        },
        {
          absatz: '2',
          text: 'Zweiter Absatz:',
          items: [
            { marke: '1', text: 'erste Ziffer im zweiten Absatz;' },
            { marke: '2', text: 'zweite Ziffer im zweiten Absatz;' },
          ],
        },
      ],
    };
    const out = renderToString(
      <NormPopover snapshot={SNAP_MARKE_DOPPELT} passus={{ absatz: null, ziff: '1' }} onClose={() => {}} />,
    );
    expect(out.match(/data-passus-item="true"/g)!.length).toBe(1);
    // markiert ist das ERSTE «1» (erster Absatz), nicht das im zweiten
    const seg = out.split('data-passus-item="true"')[1];
    expect(seg).toContain('erste Ziffer im ersten Absatz');
  });

  it('Live-Link-Fragment springt auf den Item-Text, wenn ein Item zitiert ist', () => {
    const out = renderToString(
      <NormPopover snapshot={SNAP_ZIFF} passus={{ absatz: null, ziff: '17' }} onClose={() => {}} />,
    );
    const href = out.match(/href="([^"]*:~:text=[^"]*)"/)![1];
    // Fragment stammt aus dem Item-17-Text («für die Beurkundung eines Erbvertrags …»)
    expect(href).toContain(encodeURIComponent('Erbvertrags'));
  });

  it('aufgehobenes Item («…») rendert «aufgehoben», nicht das nackte «…»', () => {
    const SNAP_ITEM_AUFGEHOBEN: NormSnapshot = {
      ...SNAP,
      bloecke: [
        {
          absatz: '1',
          text: 'Einleitung des Absatzes.',
          items: [
            { marke: 'a', text: 'Gültiger Buchstabe a mit Inhalt.' },
            { marke: 'b', text: '…' },
          ],
        },
      ],
    };
    const out = renderToString(
      <NormPopover snapshot={SNAP_ITEM_AUFGEHOBEN} passus={{ absatz: null }} onClose={() => {}} />,
    );
    expect(out).toContain('aufgehoben');
    expect(out).toContain('Gültiger Buchstabe a');
    // im Item-b-Segment steht «aufgehoben», nicht das nackte «…»
    const segB = out.split('>b.<')[1] ?? out.split('b.')[1];
    expect(segB).toContain('aufgehoben');
  });
});

describe('NormPopover — Schliess-Logik', () => {
  it('istSchliessTaste erkennt Escape', () => {
    expect(istSchliessTaste({ key: 'Escape' })).toBe(true);
    expect(istSchliessTaste({ key: 'Esc' })).toBe(true);
    expect(istSchliessTaste({ key: 'a' })).toBe(false);
    expect(istSchliessTaste({ key: 'Enter' })).toBe(false);
  });

  it('Esc ruft onClose über den verdrahteten Handler', () => {
    const onClose = vi.fn();
    // den Keydown-Handler so nachbilden, wie ihn die Komponente nutzt:
    const handler = (e: { key: string }) => { if (istSchliessTaste(e)) onClose(); };
    handler({ key: 'Escape' });
    handler({ key: 'x' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// Tarif-Staffel-Tabelle (z. B. ZH GebV OG § 4): aus dem PDF-Snapshot kommt der
// Tarif als EIN Fliesstext-Blob; rein für die Darstellung (§3) in Zeilen je
// Streitwert-Band zerlegt (David 17.6.2026 «schöner darstellen»).
const STAFFEL: NormSnapshot = {
  id: 'kanton/ZH/art_4', ebene: 'kanton', quelle: 'ZH', erlass: 'GebV OG',
  artikel: '4', artikelLabel: '§ 4',
  bloecke: [
    { absatz: null, text: 'Die Gebühren betragen: Streitwert Grundgebühr bis 1000 25% des Streitwertes, mind. Fr. 150 über 1000 bis 5000 250 zuzügl. 20% des Fr. 1000 übersteigenden Streitwertes über 5000 bis 20000 1050 zuzügl. 14% des Fr. 5000 übersteigenden Streitwertes' },
    { absatz: '2', text: 'Die Grundgebühr kann ermässigt werden.' },
  ],
  stand: '2024-01-01', quelleUrl: 'https://www.zh.ch/erlass-211_11.html',
  abgerufen: '2026-06-17', fassungsToken: 'x', sha: 'y',
};

describe('NormPopover — Tarif-Staffel lesbar in Zeilen', () => {
  it('zerlegt den Staffel-Blob in mehrere Band-Zeilen (span.block)', () => {
    const out = renderToString(<NormPopover snapshot={STAFFEL} passus={{ absatz: null }} onClose={() => {}} />);
    const zeilen = (out.match(/class="block[^"]*"/g) ?? []).length;
    expect(zeilen).toBeGreaterThanOrEqual(3); // Kopf + ≥2 Bänder
    expect(out).toContain('bis 1000 25%');
    expect(out).toContain('über 5000 bis 20000');
  });

  it('normaler Absatz wird NICHT zerschnitten', () => {
    const out = renderToString(<NormPopover snapshot={STAFFEL} passus={{ absatz: '2' }} onClose={() => {}} />);
    // Der reine Absatz «Die Grundgebühr kann ermässigt werden.» bleibt am Stück.
    expect(out).toContain('Die Grundgebühr kann ermässigt werden.');
  });
});
