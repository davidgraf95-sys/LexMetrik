// ─── O2 · Sidebar-Konsistenz (W2·10-UI-NAV-O) ───────────────────────────────
//
// Zwei Versprechen werden hier verriegelt:
//  1. JEDE aufklappbare Untergruppe der Seitenleiste trägt ein `ziel` — das
//     Label navigiert überall, nicht nur bei Bund/Kantone/International.
//  2. Die dafür neu verdrahteten Anker sind KEINE Erfindung: `register-<id>`
//     und `vorlage-<id>` werden von /rechner bzw. /vorlagen wirklich gerendert.
//     Massstab sind die real gerenderten ids (§7 «verifizieren, nicht
//     vertrauen»), nicht eine Annahme über den Katalog.
//  3. Landet man per Deep-Link auf einem Werkzeug, ist dessen Gruppe in der
//     Seitenleiste offen (Auto-Expandieren, Mount-Fall). Der Klick-Fall
//     (Standortwechsel ohne Remount) hängt an einem Effekt und ist darum in
//     e2e/uinav-o2-sidebar.e2e.ts belegt — SSR führt keine Effekte aus.
//
// SSR-Strings statt jsdom: dieselbe Prüftechnik wie katalog.test.tsx /
// zuletztVerwendetChips.test.tsx (das Repo hat kein Testing-Library-Setup).
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { NAVIGATION, type NavGruppe, type NavKnoten } from '../lib/navigation';
import { Sidebar } from '../components/layout/Sidebar';
import { RechnerUebersicht } from '../pages/RechnerUebersicht';
import { VorlagenUebersicht } from '../pages/VorlagenUebersicht';

/** Alle Gruppen-Knoten (rekursiv) der Hauptnavigation. */
function alleGruppen(knoten: NavKnoten[] = NAVIGATION.flatMap((a) => a.kinder)): NavGruppe[] {
  return knoten.flatMap((k) => (k.art === 'gruppe' ? [k, ...alleGruppen(k.kinder)] : []));
}

const seite = (pfad: string) =>
  renderToString(<MemoryRouter initialEntries={[pfad]}><Sidebar markeZeigen={false} /></MemoryRouter>);

describe('O2 · Sidebar-Konsistenz', () => {
  it('jede Gruppe hat ein eigenes Ziel — ausser sie IST ihr Abschnitt (Ein-Kind-Regel)', () => {
    // «Label navigiert IMMER» heisst nicht «jedes Label bekommt irgendeinen
    // Link». Zwei Gruppen («Nach Sachgebiet» unter Rechtsprechung, «Nach
    // Behörde» unter Materialien) sind das EINZIGE Kind ihres Abschnitts — ihr
    // einziges mögliches Ziel wäre exakt das Ziel der Abschnitts-Überschrift
    // eine Zeile darüber. Ein zweiter, wortgleicher Link dorthin wäre
    // Wucherung, kein Nutzen; sie bleiben reine Klapp-Zeilen (die ganze Zeile
    // schaltet, gleiche Anatomie wie die Ziel-Gruppen).
    // Die Ausnahme ist hier STRUKTURELL gefasst, nicht als Namensliste — sie
    // kann darum nicht stillschweigend wachsen: sobald ein Abschnitt ein
    // zweites Kind bekommt, verlangt dieses Tor ein eigenes Ziel.
    const verstoesse: string[] = [];
    for (const a of NAVIGATION) {
      for (const g of alleGruppen(a.kinder)) {
        if (g.ziel) continue;
        const istEinzigesAbschnittskind = a.kinder.length === 1 && a.kinder[0] === g;
        if (!(istEinzigesAbschnittskind && a.ziel)) verstoesse.push(`${a.titel ?? '—'} › ${g.label}`);
      }
    }
    expect(verstoesse, `Gruppen ohne Ziel und ohne Abschnitts-Deckung: ${verstoesse.join(', ')}`).toEqual([]);
    // Nulltest-Schutz (§6.7): es gibt überhaupt Gruppen MIT eigenem Ziel.
    expect(alleGruppen().filter((g) => g.ziel).length).toBeGreaterThan(3);
  });

  it('die Rechner-/Vorlagen-Gruppenziele treffen real gerenderte Anker (§7, keine toten Sprünge)', () => {
    const rechnerHtml = renderToString(
      <MemoryRouter initialEntries={['/rechner']}><RechnerUebersicht /></MemoryRouter>,
    );
    const vorlagenHtml = renderToString(
      <MemoryRouter initialEntries={['/vorlagen']}><VorlagenUebersicht /></MemoryRouter>,
    );
    // Real gerenderte id-Mengen — Identitäts-Treffer je id, keine Substring-Suche.
    const ids = (html: string) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    const rechnerIds = ids(rechnerHtml);
    const vorlagenIds = ids(vorlagenHtml);
    expect(rechnerIds.size, 'Rechner-Übersicht rendert überhaupt ids').toBeGreaterThan(0);
    expect(vorlagenIds.size, 'Vorlagen-Übersicht rendert überhaupt ids').toBeGreaterThan(0);

    const anker = alleGruppen()
      .map((g) => g.ziel)
      .filter((z): z is string => !!z && (z.startsWith('/rechner#') || z.startsWith('/vorlagen#')));
    // Es gibt sie überhaupt (sonst wäre der Test ein Nulltest, §6.7).
    expect(anker.length).toBeGreaterThanOrEqual(3 + 1);
    for (const ziel of anker) {
      const [pfad, id] = ziel.split('#');
      const menge = pfad === '/rechner' ? rechnerIds : vorlagenIds;
      expect(menge.has(id), `toter Sidebar-Anker ${ziel}`).toBe(true);
    }
  });

  it('Rotprobe des Anker-Wächters: eine erfundene id trifft die gerenderte Menge NICHT (§6.7)', () => {
    const html = renderToString(
      <MemoryRouter initialEntries={['/rechner']}><RechnerUebersicht /></MemoryRouter>,
    );
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    expect(ids.has('register-gibtesnicht')).toBe(false);
  });

  it('Deep-Link auf ein Werkzeug klappt seine Gruppe auf (Auto-Expandieren, Mount-Fall)', () => {
    // D26 (deklariert, §6.3): die Rechner-Kategorien sind keine Gruppen mehr —
    // die Leiste zeigt dort fünf direkte Ziele + «Alle Rechner». Die geprüfte
    // MECHANIK (eine zugeklappte Gruppe öffnet sich, wenn man per Deep-Link auf
    // eines ihrer Kinder landet) ist unverändert und wird jetzt an der
    // nächstliegenden verbliebenen Werkzeug-Gruppe belegt — den Vorlagen.
    // Bewusst NICHT auf eine Namensliste festgenagelt: gesucht wird die erste
    // zugeklappte Gruppe mit einem Werkzeug-Kind, egal welcher Rubrik.
    const istWerkzeug = (z: string) => z.startsWith('/rechner/') || z.startsWith('/vorlagen/');
    const gruppe = alleGruppen().find((g) =>
      !g.standardOffen && g.kinder.some((k) => k.art === 'link' && istWerkzeug(k.ziel)))!;
    expect(gruppe, 'keine zugeklappte Werkzeug-Gruppe gefunden').toBeTruthy();
    const kind = gruppe.kinder.find((k) => k.art === 'link' && istWerkzeug(k.ziel))!;
    const kindLabel = (kind as { label: string }).label;

    // Auf einer fremden Seite ist das Kind NICHT gerendert (Gruppe zu) …
    expect(seite('/methodik')).not.toContain(`>${kindLabel}<`);
    // … auf seiner eigenen Seite schon (Gruppe offen).
    expect(seite((kind as { ziel: string }).ziel)).toContain(`>${kindLabel}<`);
  });

  it('alle Gruppen-Zeilen benutzen dieselbe Klapp-Anatomie (kein <details> mehr)', () => {
    const html = seite('/');
    expect(html).toContain('aria-expanded');
    // Die frühere Zwei-Wege-Anatomie (natives <details> für ziel-lose Gruppen)
    // ist aufgelöst — die Seitenleiste trägt kein <details> mehr.
    expect(html).not.toContain('<details');
  });
});
