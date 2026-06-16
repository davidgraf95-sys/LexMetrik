import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { KantonQuelleLink, KantonArtikelTrigger } from '../components/KantonQuelleLink';
import { parsePassus } from '../lib/normtext/passus';

// Progressive Enhancement, NULL Regression (§6): der serverseitige Erst-Render
// von KantonQuelleLink MUSS byte-identisch zum heutigen kantonalen
// «amtliche Quelle ↗»-<a> sein — href=quelleUrl, target=_blank, rel noopener,
// die übergebene className, KEIN title, KEIN Popover/Overlay (offen=false
// initial, Laden erst im onClick im Browser). renderToString-Muster wie im Repo
// üblich (node-Env, kein jsdom).

const quelle = {
  quelleUrl: 'https://www.belex.sites.be.ch/app/de/texts_of_law/161.12#art_4',
  artikel: '§ 4 Abs. 1',
  erlassName: 'GebV OG',
  erlassNr: 'BSG 161.12',
};

describe('KantonQuelleLink — SSR/Prerender byte-gleich zum heutigen <a>', () => {
  it('rendert den <a> mit href, target, rel und der übergebenen className', () => {
    const out = renderToString(<KantonQuelleLink quelle={quelle} className="underline hover:text-ink-800" />);
    expect(out).toContain('<a');
    expect(out).toContain(`href="${quelle.quelleUrl}"`);
    expect(out).toContain('target="_blank"');
    expect(out).toMatch(/rel="[^"]*noopener[^"]*"/);
    expect(out).toContain('class="underline hover:text-ink-800"');
    expect(out).toContain('amtliche Quelle ↗');
  });

  it('rendert ohne übergebene className die Default-className (Repo-Standard)', () => {
    const out = renderToString(<KantonQuelleLink quelle={quelle} />);
    expect(out).toContain('class="underline hover:text-ink-800"');
  });

  it('rendert KEIN title-Attribut (Byte-Gleichheit der title-losen Einbaustellen)', () => {
    const out = renderToString(<KantonQuelleLink quelle={quelle} className="underline hover:text-ink-800" />);
    expect(out).not.toContain('title=');
  });

  it('kein Popover/Overlay im SSR-Output (offen=false initial, kein window-Zugriff)', () => {
    const out = renderToString(<KantonQuelleLink quelle={quelle} className="underline hover:text-ink-800" />);
    expect(out).not.toContain('role="dialog"');
    expect(out).not.toContain('Norm-Vorschau');
    expect(out).not.toContain('aria-modal');
  });

  it('Erst-Render ist genau EIN <a> (kein zweiter Knoten)', () => {
    const out = renderToString(<KantonQuelleLink quelle={quelle} className="underline hover:text-ink-800" />);
    expect(out.match(/<a/g)?.length).toBe(1);
    expect(out).not.toContain('<div');
  });
});

// parsePassus-Integration: belegt die Resolver-Logik, mit der der onClick
// entscheidet, ob ein Snapshot geladen wird (Token + Absatz) oder der Link
// wie heute navigiert (kein Token).
describe('KantonQuelleLink — parsePassus-Resolver', () => {
  it('«§ 4 Abs. 1» → Token "4" / Absatz "1"', () => {
    const p = parsePassus('§ 4 Abs. 1');
    expect(p).not.toBeNull();
    expect(p?.artikelToken).toBe('4');
    expect(p?.absatz).toBe('1');
  });

  it('Quelle ohne erkennbaren Artikel → null (Link navigiert wie heute)', () => {
    expect(parsePassus('Tarif nach Aufwand')).toBeNull();
  });
});

// children-Prop: die Artikel-Angabe selbst wird zum Popover-Trigger
// (David 16.6.2026). Default-Trigger bleibt «amtliche Quelle ↗».
describe('KantonQuelleLink — children als Trigger-Inhalt', () => {
  it('rendert children statt des Default-Texts', () => {
    const out = renderToString(
      <KantonQuelleLink quelle={quelle} className="x">{quelle.artikel}</KantonQuelleLink>,
    );
    expect(out).toContain('§ 4 Abs. 1');
    expect(out).not.toContain('amtliche Quelle ↗');
    expect(out).toContain('class="x"');
  });
});

// KantonArtikelTrigger: macht die konkrete Artikel-Angabe klickbar, wenn
// parsePassus auflöst UND eine quelleUrl da ist; sonst unverlinkter Text.
describe('KantonArtikelTrigger — Artikel als Popover-Trigger', () => {
  it('parsebarer Artikel + quelleUrl → klickbarer <a> mit dem Artikel-Text', () => {
    const out = renderToString(<KantonArtikelTrigger quelle={quelle} />);
    expect(out).toContain('<a');
    expect(out).toContain('§ 4 Abs. 1');
    expect(out).toContain('decoration-dotted');
    expect(out).toContain(`href="${quelle.quelleUrl}"`);
  });

  it('nicht parsebarer Artikel → unverlinkter Text (kein toter Trigger)', () => {
    const out = renderToString(
      <KantonArtikelTrigger quelle={{ ...quelle, artikel: 'Tarif nach Aufwand' }} />,
    );
    expect(out).not.toContain('<a');
    expect(out).toContain('Tarif nach Aufwand');
  });

  it('fehlende quelleUrl → unverlinkter Text', () => {
    const out = renderToString(
      <KantonArtikelTrigger quelle={{ artikel: '§ 4 Abs. 1', erlassName: 'GebV OG' }} />,
    );
    expect(out).not.toContain('<a');
    expect(out).toContain('§ 4 Abs. 1');
  });
});
