import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { PaneKopf } from '../components/layout/PaneKopf';

// PaneKopf-Breadcrumb im Split-View: früher rein statisch (§ „keine Navigation im
// Pane"). Auftrag David (1.7.2026): im Split-View KLICKBAR, aber pane-lokal —
// der Klick geht über `onBreadcrumb(to)` an den Pane-eigenen Navigator (bzw. beim
// primären Pane an den Haupt-Router), nie als globaler <Link> (der das ganze
// Fenster wegnavigieren würde). Krümel MIT `to` werden zu <button>, das Blatt
// (aktuelle Seite, ohne `to`) bleibt nicht-klickbarer <span>. Ohne `onBreadcrumb`
// bleibt alles statisch (Rückwärtskompat / SSR-Prerender).
const noop = () => {};
const crumbs = [
  { label: 'Gesetze', to: '/gesetze' },
  { label: 'Bund', to: '/gesetze' },
  { label: 'OR' }, // Blatt: aktuelle Seite, kein `to`
];

describe('PaneKopf — pane-lokal klickbare Breadcrumb (David 1.7.2026)', () => {
  it('mit onBreadcrumb: Krümel mit `to` als <button>, Blatt bleibt <span>', () => {
    const html = renderToString(
      <PaneKopf label="OR" rolle="sekundaer" breadcrumb={crumbs}
        onSchliessen={noop} onHauptfenster={noop} onBreadcrumb={noop} />,
    );
    expect(html).toMatch(/<button[^>]*>Gesetze<\/button>/);
    expect(html).toMatch(/<button[^>]*>Bund<\/button>/);
    // Blatt ist NICHT klickbar
    expect(html).not.toMatch(/<button[^>]*>OR<\/button>/);
    expect(html).toMatch(/<span[^>]*>OR<\/span>/);
  });

  it('ohne onBreadcrumb: alles statisch (Rückwärtskompat)', () => {
    const html = renderToString(
      <PaneKopf label="OR" rolle="sekundaer" breadcrumb={crumbs}
        onSchliessen={noop} onHauptfenster={noop} />,
    );
    expect(html).not.toMatch(/<button[^>]*>Gesetze<\/button>/);
    expect(html).not.toMatch(/<button[^>]*>Bund<\/button>/);
    expect(html).toMatch(/<span[^>]*>Gesetze<\/span>/);
  });
});
