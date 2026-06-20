// ─── Navigations-SSoT: Ableitung statt Duplikat (Build-Plan App-Shell, P2) ──
//
// Verriegelt Leitplanke 4: die Sidebar-Einträge werden aus der bestehenden
// Fachkonfiguration ABGELEITET, nicht zweitgepflegt. Eine neue Oberkategorie,
// Vorlagen-Sektion, ein neues Werkzeug oder Bund-Rechtsgebiet erscheint damit
// automatisch in der Navigation — und die Tests brechen, falls jemand wieder
// hartcodiert.
//
// Stand 19.6.2026 (Auftrag David): die echten Rechner/Vorlagen hängen DIREKT als
// aufklappbare Werkzeug-Gruppen unter ihrer Kategorie (Klicktiefe 1).
import { describe, expect, it } from 'vitest';
import { NAVIGATION, NAVIGATION_META, alleNavLinks, type NavGruppe } from '../lib/navigation';
import { OBERKATEGORIEN, kategorieFuer } from '../lib/oberkategorien';
import { VORLAGE_SEKTIONEN, KATALOG_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { istVorlage } from '../lib/vorlagenKategorie';
import { SYSTEMATIK } from '../lib/normtext/systematik';
import { KANTONE } from '../data/tarif/typen';
import { ROUTEN_MANIFEST } from '../routesManifest';

const abschnitt = (titel: string) => NAVIGATION.find((a) => a.titel === titel)!;
const katVon = (k: typeof KATALOG_KARTEN[number]) => kategorieFuer(k) ?? 'vorlagen';

describe('Navigations-SSoT', () => {
  it('Rechner = OBERKATEGORIEN ohne «vorlagen» als aufklappbare Werkzeug-Gruppen', () => {
    const gruppen = abschnitt('Rechner').kinder as NavGruppe[];
    const erwarteteKats = OBERKATEGORIEN.filter((k) => k.id !== 'vorlagen');
    expect(gruppen.map((g) => g.label)).toEqual(erwarteteKats.map((k) => k.titel));
    // Jede Gruppe trägt genau die verfügbaren Rechner ihrer Kategorie als
    // Direktlinks (aus dem Katalog abgeleitet), mit passendem Zähler.
    erwarteteKats.forEach((kat, i) => {
      const g = gruppen[i];
      expect(g.art).toBe('gruppe');
      expect(g.aufklappbar).toBe(true);
      const erwartet = KATALOG_KARTEN
        .filter((k) => istVerfuegbar(k) && !!k.href && !istVorlage(k) && katVon(k) === kat.id)
        .map((k) => ({ label: k.title, ziel: k.href! }));
      expect(g.kinder.map((k) => (k.art === 'link' ? { label: k.label, ziel: k.ziel } : null))).toEqual(erwartet);
      expect(g.anzahl).toBe(erwartet.length);
    });
  });

  it('Vorlagen = VORLAGE_SEKTIONEN als aufklappbare Gruppen mit ihren Vorlagen', () => {
    const gruppen = abschnitt('Vorlagen').kinder as NavGruppe[];
    expect(gruppen.map((g) => g.label)).toEqual(VORLAGE_SEKTIONEN.map((s) => s.title));
    VORLAGE_SEKTIONEN.forEach((s, i) => {
      const g = gruppen[i];
      const erwartet = KATALOG_KARTEN
        .filter((k) => istVerfuegbar(k) && !!k.href && istVorlage(k) && k.art === s.art)
        .map((k) => ({ label: k.title, ziel: k.href! }));
      expect(g.kinder.map((k) => (k.art === 'link' ? { label: k.label, ziel: k.ziel } : null))).toEqual(erwartet);
      expect(g.anzahl).toBe(erwartet.length);
    });
  });

  it('Gesetze › Bund = SYSTEMATIK-Kategorien; Kantone = Kantone (beide aufklappbar)', () => {
    const gesetze = abschnitt('Gesetze').kinder;
    const bund = gesetze[0] as NavGruppe;
    expect(bund.art).toBe('gruppe');
    expect(bund.aufklappbar).toBe(true);
    expect(bund.standardOffen).toBe(false);
    expect(bund.kinder.map((k) => (k.art === 'link' ? { label: k.label, ziel: k.ziel } : null)))
      .toEqual(SYSTEMATIK.map((s) => ({ label: s.titel, ziel: `/gesetze?ebene=bund#sys-${s.id}` })));
    // Kantone gleich wie Bund: aufklappbare Gruppe mit den 26 Kantonen (Auftrag David 20.6.2026).
    const kantone = gesetze[1] as NavGruppe;
    expect(kantone.art).toBe('gruppe');
    expect(kantone.aufklappbar).toBe(true);
    expect(kantone.standardOffen).toBe(false);
    expect(kantone.kinder.map((k) => (k.art === 'link' ? { label: k.label, ziel: k.ziel } : null)))
      .toEqual(KANTONE.map((kt) => ({ label: kt, ziel: `/gesetze?ebene=kanton&kt=${kt}` })));
  });

  it('jedes Blatt-Ziel löst auf eine echte Route auf (keine toten Links)', () => {
    // Statische Seiten + alle Karten-Routen (Rechner/Vorlagen) aus dem Manifest.
    const echteRouten = new Set<string>([
      '/', '/recherche', '/gesetze', '/methodik', '/ueber', '/kontakt', '/datenschutz',
      ...ROUTEN_MANIFEST.map((r) => r.pfad),
    ]);
    for (const l of alleNavLinks()) {
      const pfad = l.ziel.split('?')[0].split('#')[0];
      expect(echteRouten.has(pfad), `${l.label} → ${l.ziel}`).toBe(true);
    }
  });

  it('Meta-Bereich trägt die vier Vertrauens-/Pflichtseiten', () => {
    expect(NAVIGATION_META.map((l) => l.ziel))
      .toEqual(['/methodik', '/ueber', '/kontakt', '/datenschutz']);
  });
});
