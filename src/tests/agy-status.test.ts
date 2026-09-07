// src/tests/agy-status.test.ts — Musterprüfung für die geteilte
// Kontingent-Erkennung (scripts/analyse/agy-status.ts), genutzt von
// gemini-diskrepanz.ts und fremdagenten-messung.ts --kontingent
// (Auftrag QS-FREMDAGENTEN «Kontingent-Alarm», 4.9.2026).

import { describe, it, expect } from 'vitest';
import { klassiereAgyFehler } from '../../scripts/analyse/agy-status.ts';

describe('klassiereAgyFehler', () => {
  it.each([
    'Error: quota exceeded for this project',
    'RESOURCE_EXHAUSTED: too many requests',
    'rate limit reached, try again later',
    'HTTP 429 Too Many Requests',
    'daily limit reached',
    'Rate-Limit erreicht',
  ])('erkennt Kontingent-Sperren im Text: %s', (text) => {
    const klass = klassiereAgyFehler(text);
    expect(klass.art).toBe('kontingent');
    expect(klass.text).toBe(text.trim());
  });

  it.each([
    'ENOENT: no such file or directory',
    'Unexpected token < in JSON at position 0',
    'Model gemini-x-unknown not found',
    'connection reset by peer',
    '',
    '   ',
  ])('klassiert andere Fehler als "fehler", nicht als "kontingent": %s', (text) => {
    const klass = klassiereAgyFehler(text);
    expect(klass.art).toBe('fehler');
  });

  it('liefert bei leerem Text einen Platzhalter statt leerem String', () => {
    const klass = klassiereAgyFehler('   ');
    expect(klass.art).toBe('fehler');
    expect(klass.text).toBe('(kein Text)');
  });

  it('ist gross-/kleinschreibungs-unabhängig', () => {
    expect(klassiereAgyFehler('QUOTA EXCEEDED').art).toBe('kontingent');
    expect(klassiereAgyFehler('Quota Exceeded').art).toBe('kontingent');
  });

  it('trimmt umgebenden Whitespace im zurückgegebenen Text', () => {
    const klass = klassiereAgyFehler('  quota exceeded  \n');
    expect(klass.text).toBe('quota exceeded');
  });
});
