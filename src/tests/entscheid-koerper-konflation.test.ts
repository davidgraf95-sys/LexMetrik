import { describe, it, expect } from 'vitest';
import { findeFremdeFundstelleImBody } from '../../scripts/normtext/entscheide-koerper-konflation';

describe('findeFremdeFundstelleImBody (Gegenprüfungs-Auflage C1, 12.9.2026, PR #816)', () => {
  it('erkennt einen laufenden Kopf DESSELBEN Bandes, der zu einer ANDEREN Fundstelle gehört (Anlassfall bge_152_V_2 ← 152 V 20)', () => {
    const body = 'Diese Version stand vom 1. Januar BGE 152 V 20 S. 23 1996 bis Ende Juli 2008 in Kraft.';
    expect(findeFremdeFundstelleImBody(body, '152 V 2')).toBe('152 V 20');
  });
  it('meldet NICHTS bei einer legitimen Zitierung eines ÄLTEREN Bandes (Norm-/Präjudiz-Zitat)', () => {
    const body = 'Nach ständiger Rechtsprechung (vgl. BGE 82 III 94 S. 96) gilt …';
    expect(findeFremdeFundstelleImBody(body, '146 III 113')).toBeNull();
  });
  it('meldet NICHTS, wenn der laufende Kopf zur EIGENEN Fundstelle passt', () => {
    const body = 'BGE 151 II 475 S. 480 Erwägungen …';
    expect(findeFremdeFundstelleImBody(body, '151 II 475')).toBeNull();
  });
  it('meldet NICHTS ohne bgeReferenz (kantonale/bger-Entscheide)', () => {
    expect(findeFremdeFundstelleImBody('BGE 152 V 20 S. 23', null)).toBeNull();
  });
  it('meldet NICHTS in leerem Text', () => {
    expect(findeFremdeFundstelleImBody('', '152 V 2')).toBeNull();
  });
});
