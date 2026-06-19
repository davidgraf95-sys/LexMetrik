// ─── Navigations-SSoT: Ableitung statt Duplikat (Build-Plan App-Shell, P2) ──
//
// Verriegelt Leitplanke 4: die Sidebar-Einträge werden aus der bestehenden
// Fachkonfiguration ABGELEITET, nicht zweitgepflegt. Eine neue Oberkategorie,
// Vorlagen-Sektion oder ein neues Bund-Rechtsgebiet erscheint damit automatisch
// in der Navigation — und die Tests brechen, falls jemand wieder hartcodiert.
import { describe, expect, it } from 'vitest';
import { NAVIGATION, NAVIGATION_META, alleNavLinks, type NavGruppe } from '../lib/navigation';
import { OBERKATEGORIEN } from '../lib/oberkategorien';
import { VORLAGE_SEKTIONEN } from '../lib/startseiteConfig';
import { GEBIETE } from '../lib/normtext/register';

const abschnitt = (titel: string) => NAVIGATION.find((a) => a.titel === titel)!;

describe('Navigations-SSoT', () => {
  it('Rechner = OBERKATEGORIEN ohne «vorlagen», als Katalog-Kategorie-Ziele', () => {
    const erwartet = OBERKATEGORIEN
      .filter((k) => k.id !== 'vorlagen')
      .map((k) => ({ label: k.titel, ziel: `/?kategorie=${k.id}` }));
    const ist = abschnitt('Rechner').kinder.map((k) =>
      k.art === 'link' ? { label: k.label, ziel: k.ziel } : null);
    expect(ist).toEqual(erwartet);
  });

  it('Vorlagen = VORLAGE_SEKTIONEN, je mit Gruppen-Anker', () => {
    const erwartet = VORLAGE_SEKTIONEN.map((s) => ({
      label: s.title, ziel: `/?kategorie=vorlagen#vorlage-${s.id}`,
    }));
    const ist = abschnitt('Vorlagen').kinder.map((k) =>
      k.art === 'link' ? { label: k.label, ziel: k.ziel } : null);
    expect(ist).toEqual(erwartet);
  });

  it('Gesetze › Bund = GEBIETE (aufklappbar, eingeklappt); Kantone als Blatt', () => {
    const gesetze = abschnitt('Gesetze').kinder;
    const bund = gesetze[0] as NavGruppe;
    expect(bund.art).toBe('gruppe');
    expect(bund.aufklappbar).toBe(true);
    expect(bund.standardOffen).toBe(false);
    expect(bund.kinder.map((k) => (k.art === 'link' ? { label: k.label, ziel: k.ziel } : null)))
      .toEqual(GEBIETE.map((g) => ({ label: g.label, ziel: `/gesetze?ebene=bund#g-${g.id}` })));
    expect(gesetze[1]).toMatchObject({ art: 'link', ziel: '/gesetze?ebene=kanton' });
  });

  it('jedes Blatt-Ziel löst auf eine bekannte Basis-Route auf (keine toten Links)', () => {
    // Basis-Pfade der App (Sonderrouten + statische Seiten); Katalog-/Gesetze-
    // Sichten hängen nur Query/Hash an, der Pfad bleibt einer von diesen.
    const bekanntePfade = new Set(['/', '/recherche', '/gesetze', '/methodik', '/ueber', '/kontakt', '/datenschutz']);
    for (const l of alleNavLinks()) {
      const pfad = l.ziel.split('?')[0].split('#')[0];
      expect(bekanntePfade.has(pfad), `${l.label} → ${l.ziel}`).toBe(true);
    }
  });

  it('Meta-Bereich trägt die vier Vertrauens-/Pflichtseiten', () => {
    expect(NAVIGATION_META.map((l) => l.ziel))
      .toEqual(['/methodik', '/ueber', '/kontakt', '/datenschutz']);
  });
});
