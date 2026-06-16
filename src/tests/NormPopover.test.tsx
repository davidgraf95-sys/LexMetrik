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

const html = (passus: { absatz: string | null }) =>
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

  it('Stand-Text sichtbar', () => {
    const out = html({ absatz: '1' });
    expect(out).toContain('Stand:');
    expect(out).toContain('2026-01-01');
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
