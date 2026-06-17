import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { KantonArtikelTrigger } from '../components/KantonQuelleLink';
import { LocaleProvider } from '../components/locale';

// Befunde David 17.6.2026:
//  - «Anhang Ziff. 1.1.1» (nicht parsbarer Passus) war gar nicht verlinkt.
//  - Föderaler Posten (BGer «Art. 65 BGG», fedlex-URL) lief über den Kanton-
//    Loader → toter/Fallback-Popover statt BGG-Snapshot.

const ssr = (el: React.ReactElement) => renderToString(<LocaleProvider>{el}</LocaleProvider>);

describe('KantonArtikelTrigger — direkt verlinkt + föderale Quelle über Bund', () => {
  it('nicht parsbarer Artikel mit Quelle-URL ist klickbar (Link auf amtliche Quelle)', () => {
    const url = 'https://www.zh.ch/erlass-243.html';
    const out = ssr(<KantonArtikelTrigger quelle={{ quelleUrl: url, artikel: 'Anhang Ziff. 1.1.1', erlassName: 'NotGebV' }} />);
    expect(out).toContain('<a');
    expect(out).toContain(url);
    expect(out).toContain('Anhang Ziff. 1.1.1');
  });

  it('föderaler Posten (fedlex-Quelle) → Bund-Link auf den Artikel, Tarif-Rest bleibt Text', () => {
    const out = ssr(<KantonArtikelTrigger quelle={{ quelleUrl: 'https://www.fedlex.admin.ch/eli/cc/2006/218/de', artikel: 'Art. 65 BGG / Tarif Ziff. 1', erlassName: 'BGG' }} />);
    expect(out).toMatch(/href="[^"]*fedlex[^"]*#art_65"/);
    expect(out).toContain('Art. 65 BGG');
    expect(out).toContain('Tarif Ziff. 1'); // Rest unverändert
  });

  it('kantonaler § bleibt auf dem Kanton-Pfad (Quelle-URL des Erlasses)', () => {
    const out = ssr(<KantonArtikelTrigger quelle={{ quelleUrl: 'https://srl.lu.ch/app/de/texts_of_law/265', artikel: '§ 5 Abs. 1', erlassName: 'JusKV' }} />);
    expect(out).toContain('srl.lu.ch');
    expect(out).toContain('§ 5 Abs. 1');
  });

  it('ohne Quelle-URL bleibt der Artikel reiner Text (kein toter Link)', () => {
    const out = ssr(<KantonArtikelTrigger quelle={{ artikel: '§ 5' }} />);
    expect(out).not.toContain('<a');
    expect(out).toContain('§ 5');
  });
});
