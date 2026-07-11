/**
 * V2·C-3 (Farb-Wörterbuch Abschluss, §4b-B) — Familien-Punkt der Referenzgruppen.
 *
 * Schliesst das Wörterbuch: jede Referenz-/Verzahnungsgruppe (KontextGruppe) trägt
 * VOR ihrem Titel den Familien-Punkt ihrer Farbe — brass = Norm/Verweis (NormChip-
 * Verweisfarbe), slate = Rechtsprechung, sage = Materialien-Familie (Botschaften/
 * Vernehmlassungen/Soft-Law, kein Gesetzesrang). Der Punkt ist redundant zum
 * Gruppentitel (aria-hidden, Farbe trägt NIE allein, §13/F2) und ändert weder
 * Anatomie noch Layout (CLS 0). Ohne Prop kein Punkt (Werkzeuge/Revisionen neutral).
 */
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { KontextGruppe } from '../components/kontext/KontextPanel';
import { NormChip } from '../components/vorlagen/ui';
import { LocaleProvider } from '../components/locale';

const ssr = (punkt?: 'norm' | 'entscheid' | 'material') => renderToString(
  <KontextGruppe titel="Gruppe" richtung="Legt aus" anzahl={2} punkt={punkt}>
    <span>x</span>
  </KontextGruppe>,
);

describe('C-3 — Farb-Wörterbuch-Abschluss (Familien-Punkt)', () => {
  it('punkt="norm" trägt den brass-Default-Punkt (NormChip-Verweisfarbe, aria-hidden)', () => {
    const out = ssr('norm');
    expect(out).toContain('class="lc-punkt"');
    expect(out).toContain('aria-hidden');
    // kein Entscheid-/Material-Ton auf der Norm-Gruppe
    expect(out).not.toContain('lc-punkt-entscheid');
    expect(out).not.toContain('lc-punkt-material');
  });

  it('punkt="entscheid" trägt den slate-Punkt (Rechtsprechung)', () => {
    const out = ssr('entscheid');
    expect(out).toContain('lc-punkt lc-punkt-entscheid');
    expect(out).toContain('aria-hidden');
  });

  it('punkt="material" trägt den sage-Punkt (Materialien-Familie)', () => {
    const out = ssr('material');
    expect(out).toContain('lc-punkt lc-punkt-material');
    expect(out).toContain('aria-hidden');
  });

  it('ohne punkt kein Familien-Marker (Werkzeuge/Revisionen neutral)', () => {
    const out = ssr(undefined);
    expect(out).not.toContain('lc-punkt');
  });
});

describe('C-3 — NormChip-Verweisfarbe (brass-Hover-Familie komplett)', () => {
  it('NormChip-Default trägt den brass-Hover-Border wie alle anderen Norm-Chips', () => {
    const out = renderToString(
      <LocaleProvider>
        <NormChip artikel="Art. 335c OR" hrefOverride="https://www.fedlex.admin.ch/eli/cc/27/317_321_377/de#art_335_c" />
      </LocaleProvider>,
    );
    expect(out).toContain('hover:border-brass-400');
    expect(out).toContain('hover:text-brass-700');
    // kein Fremdfamilien-Ton auf dem Norm-Chip (EIN Entscheid je Farbe, §4b-B)
    expect(out).not.toMatch(/hover:(text|border)-slate/);
  });
});
