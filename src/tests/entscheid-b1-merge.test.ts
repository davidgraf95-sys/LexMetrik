import { describe, it, expect } from 'vitest';
import { mergeB1Ergebnis } from '../../scripts/normtext/entscheide-b1-merge';
import type { EntscheidRegeste } from '../lib/rechtsprechung/typen';

type Fixture = { regeste: EntscheidRegeste | null };

const sprachfassungenFixture = [
  { sprache: 'de' as const, kopf: 'DE-Kopf', absaetze: ['DE-Absatz'], quelleUrl: 'https://www.bger.ch/de' },
  { sprache: 'fr' as const, kopf: 'FR-Kopf', absaetze: ['FR-Absatz'], quelleUrl: 'https://www.bger.ch/fr' },
  { sprache: 'it' as const, kopf: 'IT-Kopf', absaetze: ['IT-Absatz'], quelleUrl: 'https://www.bger.ch/it' },
];

describe('mergeB1Ergebnis (Gegenprüfungs-Auflage B1, 12.9.2026, PR #816)', () => {
  it('übernimmt regeste.sprachfassungen aus dem Bestand, wenn das frische Ergebnis keine trägt (Anlassfall: 6/6 BGE verloren)', () => {
    const alt: Fixture = { regeste: { text: 'Regeste-Text', quelle: 'opencaselaw', sprachfassungen: sprachfassungenFixture } };
    const neu: Fixture = { regeste: { text: 'Regeste-Text', quelle: 'opencaselaw' } };
    const merged = mergeB1Ergebnis(alt, neu);
    expect(merged.regeste?.sprachfassungen).toEqual(sprachfassungenFixture);
  });
  it('lässt ein frisches Ergebnis mit EIGENEN Sprachfassungen unangetastet', () => {
    const eigene = [sprachfassungenFixture[0]];
    const alt: Fixture = { regeste: { text: 'Regeste-Text', quelle: 'opencaselaw', sprachfassungen: sprachfassungenFixture } };
    const neu: Fixture = { regeste: { text: 'Regeste-Text', quelle: 'opencaselaw', sprachfassungen: eigene } };
    expect(mergeB1Ergebnis(alt, neu).regeste?.sprachfassungen).toEqual(eigene);
  });
  it('übernimmt NICHTS, wenn sich der flache Regeste-Text geändert hat (nie eine Übersetzung falsch zuordnen)', () => {
    const alt: Fixture = { regeste: { text: 'Alter Text', quelle: 'opencaselaw', sprachfassungen: sprachfassungenFixture } };
    const neu: Fixture = { regeste: { text: 'Neuer Text', quelle: 'opencaselaw' } };
    expect(mergeB1Ergebnis(alt, neu).regeste?.sprachfassungen).toBeUndefined();
  });
  it('ist ein No-Op, wenn der Bestand selbst keine Sprachfassungen trägt', () => {
    const alt: Fixture = { regeste: { text: 'Regeste-Text', quelle: 'opencaselaw' } };
    const neu: Fixture = { regeste: { text: 'Regeste-Text', quelle: 'opencaselaw' } };
    expect(mergeB1Ergebnis(alt, neu)).toBe(neu);
  });
  it('ist ein No-Op, wenn das frische Ergebnis keine Regeste (mehr) hat', () => {
    const alt: Fixture = { regeste: { text: 'Regeste-Text', quelle: 'opencaselaw', sprachfassungen: sprachfassungenFixture } };
    const neu: Fixture = { regeste: null };
    expect(mergeB1Ergebnis(alt, neu)).toBe(neu);
  });
});
