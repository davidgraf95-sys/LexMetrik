import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ERLASS_REGISTER } from '../lib/normtext/register';
import registerManifest from '../../public/normtext/register.json';

// ─── F25 · DER SCHLÜSSEL WIRD GENAU EINMAL DEKODIERT (K-1b, W2·13-KANTONE) ───
//
// `react-router` v7 liefert `useParams()` bereits DEKODIERT. Der Leser rief
// darauf ein zweites `decodeURIComponent` — für jeden Schlüssel ohne `%` folgen-
// los, für die drei Glarner Schlüssel, die ein `%` IM KANONISCHEN KEY tragen,
// tödlich: aus `GL-III%20B%2F3%2F2` wurde `GL-III B/3/2`, das Register kennt
// diesen Schlüssel nicht, und die Seite war unerreichbar (Fehlseite).
//
// GEMESSEN 31.8.2026 gegen `public/normtext/register.json`: genau 3 Schlüssel
// enthalten ein `%`, 162 ein Leerzeichen. Die 162 sind der Grund, warum der
// Zweitdecode überhaupt plausibel aussah — `%20` im Pfad MUSS zum Leerzeichen
// werden. Nur macht das react-router bereits; der zweite Lauf ist einer zu viel.
//
// GEPRÜFT WIRD DAS ORIGINAL, nicht eine Nachbildung der Regel: der Test rendert
// die echte `GesetzLeser`-Route und greift den `schluessel` ab, den sie an den
// Leser-Rahmen weiterreicht (jsx-Runtime-Abgriff, Muster aus
// `leser-v3-bauteile.test.tsx`).

const gefangeneProps: Record<string, unknown>[] = [];
const merke = (props: unknown) => {
  if (props && typeof props === 'object' && 'schluessel' in props) {
    gefangeneProps.push(props as Record<string, unknown>);
  }
};

vi.mock('react/jsx-runtime', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const wrap = (fn: (...a: unknown[]) => unknown) => (type: unknown, props: unknown, ...rest: unknown[]) => {
    merke(props);
    return fn(type, props, ...rest);
  };
  return { ...mod, jsx: wrap(mod.jsx as never), jsxs: wrap(mod.jsxs as never) };
});
vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const wrap = (fn: (...a: unknown[]) => unknown) => (type: unknown, props: unknown, ...rest: unknown[]) => {
    merke(props);
    return fn(type, props, ...rest);
  };
  return { ...mod, jsxDEV: wrap(mod.jsxDEV as never) };
});

// Nach den vi.mock-Aufrufen importieren (hoisting: die Mocks stehen vor jedem
// Modul-Import, der die Runtime zieht).
const { GesetzLeser } = await import('../pages/GesetzLeser');

beforeEach(() => { gefangeneProps.length = 0; });

/** Der `schluessel`, mit dem die Route den Leser-Rahmen aufruft. */
function schluesselAusRoute(ebene: string, key: string): string | null {
  renderToString(
    <MemoryRouter initialEntries={[`/gesetze/${ebene}/${encodeURIComponent(key)}`]}>
      <Routes>
        <Route path="/gesetze/:ebene/:key" element={<GesetzLeser />} />
      </Routes>
    </MemoryRouter>,
  );
  const treffer = gefangeneProps.at(-1);
  return treffer ? (treffer.schluessel as string) : null;
}

const ALLE_KEYS: string[] = (registerManifest as { erlasse: { key: string }[] }).erlasse.map((e) => e.key);

describe('F25 · Routen-Schlüssel wird genau einmal dekodiert (K-1b)', () => {
  // Die Glarner Schlüssel mit `%` in der Kanonik — der Defekt in Reinform.
  // Nachtrag 5.9.2026 (deklarierte Teständerung): `GL-III%20B_7_1` ist fort. Er
  // war die zweite Schreibweise desselben Erlasses (GS III B/7/1) und stand als
  // Dublette neben `GL-III%20B%2F7%2F1`; der Korpus führt ihn nicht mehr. Am
  // geprüften Verhalten ändert das nichts — beide verbliebenen Schlüssel tragen
  // dasselbe Muster («%» + «%2F») und durchlaufen dieselben Zusicherungen.
  const PROZENT_KEYS = ['GL-III%20B%2F7%2F1', 'GL-III%20B%2F3%2F2'];

  it('die Messgrundlage stimmt: genau diese Schlüssel tragen ein «%»', () => {
    expect(ALLE_KEYS.filter((k) => k.includes('%')).sort()).toEqual([...PROZENT_KEYS].sort());
  });

  it.each(PROZENT_KEYS)('«%s» kommt unverfälscht am Leser an', (key) => {
    expect(schluesselAusRoute('kanton', key)).toBe(key);
  });

  it('Leerzeichen-Schlüssel bleiben erreichbar (%20 → Leerzeichen, einmal)', () => {
    // 162 Schlüssel tragen ein Leerzeichen; einer davon steht stellvertretend.
    expect(ALLE_KEYS.filter((k) => k.includes(' ')).length).toBe(162);
    expect(schluesselAusRoute('kanton', 'BS-RiE 911.900')).toBe('BS-RiE 911.900');
  });

  it('gewöhnliche Schlüssel bleiben unberührt', () => {
    expect(schluesselAusRoute('bund', 'OR')).toBe('OR');
    expect(schluesselAusRoute('kanton', 'ZH-211.1')).toBe('ZH-211.1');
  });

  it('Trailing Slash wird normalisiert (dev/preview ohne 308; §9-Bug-Check 31.8., Fund 4)', () => {
    renderToString(
      <MemoryRouter initialEntries={['/gesetze/kanton/ZH-211.1/']}>
        <Routes>
          <Route path="/gesetze/:ebene/:key" element={<GesetzLeser />} />
        </Routes>
      </MemoryRouter>,
    );
    const treffer = gefangeneProps.at(-1);
    expect(treffer ? (treffer.schluessel as string) : null).toBe('ZH-211.1');
  });

  it('nur die %-Schlüssel überleben einen zweiten Decode-Lauf NICHT', () => {
    // §7-Sonde: Belegt, dass der Zweitdecode GENAU die drei %-Schlüssel zerstört
    // — und dass er sonst nirgends nötig war (alle übrigen sind Fixpunkte).
    const zerstoert = ALLE_KEYS.filter((k) => {
      try { return decodeURIComponent(k) !== k; } catch { return true; }
    });
    expect(zerstoert.sort()).toEqual([...PROZENT_KEYS].sort());
  });

  it('Bund-Register und Manifest teilen die Schlüssel-Form (keine zweite Wahrheit)', () => {
    const manifestBund = new Set(ALLE_KEYS);
    for (const e of ERLASS_REGISTER) expect(manifestBund.has(e.key)).toBe(true);
  });
});
