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
import { VORLAGE_SEKTIONEN, KATALOG_KARTEN, istVerfuegbar } from '../lib/startseiteConfig';
import { istVorlage } from '../lib/vorlagenKategorie';
import { SYSTEMATIK_VON_KEY } from '../lib/normtext/systematik';
import { ERLASS_REGISTER } from '../lib/normtext/register';
import { kernerlasse } from '../components/gesetze/kernerlasse';
import { erlassPfadVonKey } from '../lib/normtext/erlassAdresse';
import { KANTONE, KANTON_NAMEN } from '../data/tarif/typen';
import { ROUTEN_MANIFEST } from '../routesManifest';

const abschnitt = (titel: string) => NAVIGATION.find((a) => a.titel === titel)!;

describe('Navigations-SSoT', () => {
  // ── D26 (David 6.9.2026), DEKLARIERTE FACHLICHE ÄNDERUNG (§6.3) ────────────
  // Bis hierher verlangte dieser Test unter «Rechner» die drei Oberkategorien
  // als aufklappbare Gruppen. D26 («nochmals überarbeiten, was sie anzeigt»)
  // ersetzt sie durch fünf DIREKTE Ziele + «Alle Rechner»: die Leiste soll
  // öffnen, was man täglich braucht, statt die Kategorien-Ordnung der
  // Übersichtsseite zu wiederholen. Die Kategorien selbst sind unverändert —
  // sie leben in `OBERKATEGORIEN` und auf `/rechner` weiter, nur nicht mehr in
  // der Leiste. Was der Test SCHÜTZT, bleibt dasselbe: die Einträge sind aus dem
  // Katalog abgeleitet, nicht zweitgepflegt (Leitplanke 4).
  it('Rechner = fünf geführte Katalog-IDs (aufgelöst, nicht abgeschrieben) + «Alle Rechner»', () => {
    const kinder = abschnitt('Rechner').kinder;
    // Keine Gruppen mehr — nur Blätter.
    expect(kinder.every((k) => k.art === 'link')).toBe(true);
    const links = kinder as { label: string; ziel: string }[];
    expect(links.at(-1)).toEqual({ art: 'link', label: 'Alle Rechner', ziel: '/rechner' });
    // Jedes der fünf Ziele ist eine VERFÜGBARE Katalog-Karte mit eigener Seite,
    // und Beschriftung wie Adresse stammen aus dem Katalog — nicht aus der Nav.
    const werkzeuge = links.slice(0, -1);
    expect(werkzeuge).toHaveLength(5);
    for (const l of werkzeuge) {
      const k = KATALOG_KARTEN.find((x) => x.href === l.ziel);
      expect(k, `kein Katalog-Eintrag zu ${l.ziel}`).toBeTruthy();
      expect(istVerfuegbar(k!)).toBe(true);
      expect(istVorlage(k!)).toBe(false);
      expect(l.label).toBe(k!.title);
    }
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
    });
  });

  // ── D26, DEKLARIERTE FACHLICHE ÄNDERUNG (§6.3) ────────────────────────────
  // Statt der zwölf SYSTEMATIK-Titel unter einer Gruppe «Bund» stehen jetzt die
  // Kernerlasse direkt in der Leiste, darunter EIN Ziel «Alle Bundeserlasse».
  // Die Systematik ist damit nicht verschwunden: sie ist die Gliederung der
  // Bund-Säule und wird auf `/gesetze?ebene=bund` gezeigt. Die Kernerlass-Liste
  // wird NICHT hier geführt, sondern aus `components/gesetze/kernerlasse.ts`
  // gelesen — derselben Liste, die die Übersicht zeigt (§5).
  it('Gesetze = Kernerlasse (aus kernerlasse.ts) + «Alle Bundeserlasse»; Kantone aufklappbar', () => {
    const gesetze = abschnitt('Gesetze').kinder;
    const kern = kernerlasse();
    expect(kern.length).toBeGreaterThan(0); // Nulltest-Schutz (§6.7)
    expect(gesetze.slice(0, kern.length).map((k) => (k.art === 'link' ? { label: k.label, ziel: k.ziel } : null)))
      .toEqual(kern.map((e) => ({ label: e.kuerzel, ziel: e.pfad })));
    // Der volle Titel steht im Accessible Name (die Sicht-Beschriftung ist darin
    // enthalten — WCAG 2.5.3), nie nur das Kürzel.
    for (let i = 0; i < kern.length; i++) {
      const k = gesetze[i];
      expect(k.art === 'link' && k.ariaLabel).toBe(`${kern[i].kuerzel} — ${kern[i].titel}`);
    }
    expect(gesetze[kern.length]).toEqual({ art: 'link', label: 'Alle Bundeserlasse', ziel: '/gesetze?ebene=bund' });
    // Kantone unverändert: aufklappbare Gruppe mit den 26 Kantonen (Auftrag David 20.6.2026).
    // Gesetzes-UX G5 · §4.3.4: ALPHABETISCH nach Vollnamen (nicht mehr föderal),
    // Vollname als Label — dieselbe Ordnung wie das Kantonsraster der Übersicht.
    const kantone = gesetze.find((k) => k.art === 'gruppe' && k.label === 'Kantone') as NavGruppe;
    expect(kantone.art).toBe('gruppe');
    expect(kantone.aufklappbar).toBe(true);
    expect(kantone.standardOffen).toBe(false);
    expect(kantone.kinder.map((k) => (k.art === 'link' ? { label: k.label, ziel: k.ziel } : null)))
      .toEqual(
        [...KANTONE]
          .sort((a, b) => KANTON_NAMEN[a].localeCompare(KANTON_NAMEN[b], 'de'))
          .map((kt) => ({ label: KANTON_NAMEN[kt], ziel: `/gesetze?ebene=kanton&kt=${kt}` })),
      );
  });

  // Soft-Vollständigkeits-Tor (Review-Befund 25.6.2026): jeder Bund-Volltext-
  // Erlass MUSS in genau einer SYSTEMATIK-Gruppe stehen, sonst fällt er stumm in
  // «Weitere Erlasse» (per Design tolerant, §8 — aber beim Promovieren leicht
  // vergessen). Dieser Tor fängt das Vergessen, OHNE die tolerante Laufzeit-
  // Logik zu verschärfen. Wird ein Erlass bewusst NICHT eingeordnet, hier in die
  // Ausnahmeliste eintragen (mit Begründung).
  it('jeder Bund-Volltext-Erlass ist in der SYSTEMATIK eingeordnet (Sidebar-Vollständigkeit)', () => {
    const AUSNAHMEN = new Set<string>([]); // bewusst nicht eingeordnete Keys (mit Begründung)
    // International (SR 0.*, rechtsgebiet 'international') gehört NICHT in die
    // Bund-Systematik-Sidebar, sondern in die eigene Rubrik «International»
    // (/international + International-Tab) — daher ausgenommen (Volltext-Promotion
    // 25.6.2026, deklarierte Änderung §6.3).
    const fehlend = ERLASS_REGISTER
      .filter((r) => r.ebene === 'bund' && r.status === 'snapshot' && r.rechtsgebiet !== 'international')
      .map((r) => r.key)
      .filter((key) => !SYSTEMATIK_VON_KEY.has(key) && !AUSNAHMEN.has(key));
    expect(fehlend).toEqual([]);
  });

  // IA-6 Stufe 2 (FAHRPLAN-GESETZES-UX §11.4 Ziff. 3 / §11.8 Y-C, David-Go
  // 3.8.2026): Der Alias /international ist zum Redirect aufgelöst — KEIN
  // interner Link zeigt mehr auf ihn (R-SCOPE-4). Kopf UND alle 5 Anker-Kinder
  // zielen auf die kanonische Säule. Deklarierte fachliche Änderung dieses
  // Tests (§6.3, kein Refactoring: Stufe 1 hielt die Kinder bewusst am Alias).
  it('IA-6 Stufe 2: Gesetze › International — Kopf UND die 5 Anker zielen auf die kanonische Säule', () => {
    // D26: Positionsindex durch Label-Suche ersetzt — die Kernerlasse stehen
    // jetzt vor den Gruppen, und ein Index wäre eine stille Kopplung an ihre Zahl.
    const international = abschnitt('Gesetze').kinder
      .find((k) => k.art === 'gruppe' && k.label === 'International') as NavGruppe;
    expect(international.art).toBe('gruppe');
    expect(international.label).toBe('International');
    expect(international.ziel).toBe('/gesetze?ebene=international');
    expect(international.kinder.map((k) => (k.art === 'link' ? k.ziel : null))).toEqual([
      '/gesetze?ebene=international#menschenrechte',
      '/gesetze?ebene=international#privat-zivil',
      '/gesetze?ebene=international#rechtshilfe',
      '/gesetze?ebene=international#schweiz-eu',
      '/gesetze?ebene=international#eu-verordnungen',
    ]);
  });

  it('IA-6 Stufe 2: kein Nav-Link zeigt mehr auf den Alias /international', () => {
    for (const l of alleNavLinks()) {
      expect(l.ziel.split('?')[0].split('#')[0], `${l.label} → ${l.ziel}`).not.toBe('/international');
    }
  });

  it('jedes Blatt-Ziel löst auf eine echte Route auf (keine toten Links)', () => {
    // Statische Seiten + alle Karten-Routen (Rechner/Vorlagen) aus dem Manifest.
    const echteRouten = new Set<string>([
      // '/international' steht hier NICHT mehr: seit IA-6 Stufe 2 ist es eine
      // Redirect-Route, kein Nav-Ziel (der Test oben verbietet es ausdrücklich).
      '/', '/rechner', '/vorlagen', '/gesetze', '/rechtsprechung', '/materialien', '/einstellungen', '/methodik', '/ueber', '/kontakt', '/datenschutz',
      ...ROUTEN_MANIFEST.map((r) => r.pfad),
      // D26 (deklariert, §6.3): die Leiste verlinkt jetzt Erlass-Leser-Routen
      // direkt (`/gesetze/<ebene>/<key>`). Massstab ist das Erlass-Register —
      // also genau die Menge, die der Leser bedient und der Prerender erzeugt;
      // ein Kernerlass-Schlüssel ohne Register-Eintrag fällt in `kernerlasse()`
      // ohnehin schon weg und käme hier gar nicht an.
      ...ERLASS_REGISTER.map((r) => erlassPfadVonKey(r.key)),
    ]);
    for (const l of alleNavLinks()) {
      const pfad = l.ziel.split('?')[0].split('#')[0];
      expect(echteRouten.has(pfad), `${l.label} → ${l.ziel}`).toBe(true);
    }
  });

  it('Meta-Bereich trägt Einstellungen + die vier Vertrauens-/Pflichtseiten', () => {
    expect(NAVIGATION_META.map((l) => l.ziel))
      .toEqual(['/einstellungen', '/methodik', '/ueber', '/kontakt', '/datenschutz']);
  });
});
