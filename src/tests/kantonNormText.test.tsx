import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { KantonNormText } from '../components/KantonNormText';
import { LocaleProvider } from '../components/locale';

// Phase 2 (Auftrag David «jede Norm verlinkt» + «§≡Art»): kontext-bewusster
// Inline-Linker für kantonale Tarif-Hinweise. § wird auf den Kontext-Erlass
// (quelleUrl) aufgelöst, Bund-«Art. N GESETZ» bleibt Bund, ohne quelleUrl kein
// kantonaler (toter) Link. SSR-Erstrender = <a>/Text (Popover erst im Browser).

const ssr = (el: React.ReactElement) => renderToString(<LocaleProvider>{el}</LocaleProvider>);
const ZH_URL = 'https://www.zh.ch/erlass-211_11.html';

describe('KantonNormText — kontextbezogene § / Bund-Auflösung', () => {
  it('verlinkt «§ N» auf die Quelle-URL des Kontext-Erlasses', () => {
    const out = ssr(<KantonNormText text="Nach § 5 Abs. 1 GebV OG." quelle={{ quelleUrl: ZH_URL, artikel: '§ 5', erlassName: 'GebV OG' }} />);
    expect(out).toContain('<a');
    expect(out).toContain(`href="${ZH_URL}"`);
    expect(out).toContain('§ 5 Abs. 1');
  });

  it('Bund-«Art. N GESETZ» bleibt Bund (Fedlex), nicht kantonal zugeschrieben', () => {
    const out = ssr(<KantonNormText text="Prozesskosten Art. 95 ZPO und § 6." quelle={{ quelleUrl: ZH_URL, artikel: '§ 5' }} />);
    expect(out).toMatch(/href="[^"]*fedlex[^"]*#art_95"/); // Bund
    expect(out).toContain(`href="${ZH_URL}"`);               // kantonal § 6
  });

  it('ohne quelleUrl wird «§ N» NICHT verlinkt (kein toter Link)', () => {
    const out = ssr(<KantonNormText text="Nach § 6 reduziert." quelle={{ artikel: '§ 5' }} />);
    expect(out).not.toContain('<a');
    expect(out).toContain('§ 6');
  });

  it('«Art. N» (bundesfremd) nur bei Art.-Stil-Quelle kantonal verlinkt', () => {
    const artStil = ssr(<KantonNormText text="Gemäss Art. 37 hier." quelle={{ quelleUrl: ZH_URL, artikel: 'Art. 37' }} />);
    expect(artStil).toContain(`href="${ZH_URL}"`);
    // §-Stil-Quelle: ein bundesfremdes «Art. 37» bleibt Text (kein Fehlbezug)
    const parStil = ssr(<KantonNormText text="Gemäss Art. 37 hier." quelle={{ quelleUrl: ZH_URL, artikel: '§ 5' }} />);
    expect(parStil).not.toContain('<a');
  });
});
