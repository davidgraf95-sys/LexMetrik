import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { EntscheidBody } from '../components/rechtsprechung/EntscheidBody';

// D1 (Gegenprüfungs-Auflage 12.9.2026, PR #816): der Leer-Body-Hinweis
// (EntscheidBody.tsx, `abschnitte.length === 0`) hatte keinen Test und
// verschluckte einen gesetzten `quarantaene`-Grund still — der Nutzer erfuhr
// nicht, dass ein bekannter Quellenkonflikt vorliegt (§8). Muster wie
// entscheid-konsistenz.test.tsx: renderToString, kein testing-library.

describe('EntscheidBody — Leer-Body-Hinweis (D1, PR #816)', () => {
  it('zeigt den generischen Hinweis, wenn KEIN quarantaene-Grund vorliegt', () => {
    const html = renderToString(
      <EntscheidBody abschnitte={[]} zitierung="BGE 151 II 475" bgeReferenz="151 II 475" />,
    );
    expect(html).toContain('Für diesen Entscheid liegt kein erfasster Text vor');
    expect(html).not.toContain('vermischt');
    expect(html).not.toContain('data-quarantaene');
  });

  it('präzisiert den Hinweis mit der fremden Fundstelle, wenn quarantaene gesetzt ist (Anlassfall bge_152_V_2)', () => {
    const html = renderToString(
      <EntscheidBody
        abschnitte={[]}
        zitierung="BGE 152 V 2"
        bgeReferenz="152 V 2"
        quarantaene="ocl-konflation:152 V 20"
      />,
    );
    expect(html).toContain('mit BGE 152 V 20 vermischt');
    expect(html).toContain('massgeblich ist die amtliche Fassung');
    expect(html).toContain('data-quarantaene="ocl-konflation:152 V 20"');
  });
});
