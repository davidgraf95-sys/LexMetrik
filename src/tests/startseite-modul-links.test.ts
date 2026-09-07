import { describe, it, expect } from 'vitest';
import { systematikZeilen, kuerzelZiel, kantonZiel, behoerdeZiel } from '../components/start/modulZiele';
import { KANTONE } from '../data/tarif/typen';
import { STARTSEITE_ZAEHLER } from '../data/startseiteZaehler.generated';
import { ERLASS_REGISTER } from '../lib/normtext/register';
import { SYSTEMATIK } from '../lib/normtext/systematik';
import { NAVIGATION } from '../lib/navigation';

// ─── D29-Wächter: Startseiten-Modul-Links (R10-Nachzug-3) ───────────────────
//
// Bug David 6.9.2026 («jede Kachel führt zu der gleichen Seite», Bild
// Systematik-Modul): der HREF war je Zeile schon distinkt (Bau-Bericht,
// Playwright-Messung vorher), sichtbar gleich sah es aus, weil die
// Kürzel-Zeile reiner Text ohne eigenes Ziel war. Dieser Wächter hält BEIDE
// Ebenen fest — Zeilen-Ziel UND Kürzel-Ziel —, damit keine der beiden je
// wieder still auf dasselbe Ziel zusammenfällt.
//
// Ziel-Existenz-Nachweis: die Zeilen-Ziele (Kategorie/Kanton/Behörde) stehen
// alle auch in der Seitenleisten-Navigation (`NAVIGATION`, derselbe Baum, den
// `components/layout/Sidebar.tsx` als Bestand rendert) — ein Ziel, das dort
// fehlt, führt nirgendwohin. `alleNavLinks()` allein reicht nicht: sie
// flacht nur die BLATT-Links ab, eine Gruppen-Überschrift (z. B.
// «International», selbst klickbar auf die Säule) trägt ihr `ziel` am
// Gruppenknoten — deshalb hier der volle Baum, rekursiv beide Ebenen. Die
// Kürzel-Ziele sind Erlass-Leser-Pfade; deren Existenz hält
// `erlass-adresse.test.ts` bereits fest (§5 — kein zweiter Adress-Test hier),
// dieser Wächter prüft nur, dass JEDES angezeigte Kürzel, das das Register
// führt, auch tatsächlich verlinkt ist.

function alleZiele(knoten: readonly unknown[]): string[] {
  const out: string[] = [];
  for (const k of knoten as { ziel?: string; kinder?: unknown[] }[]) {
    if (k.ziel) out.push(k.ziel);
    if (k.kinder) out.push(...alleZiele(k.kinder));
  }
  return out;
}
// NACHZUG Fixer 1f/D26 (6.9.2026): die Seitenleiste listet die Bund-Kategorien
// nicht mehr als Blätter (sie trägt jetzt Kernerlasse + «Alle Bundeserlasse»),
// darum ist der Nav-Baum allein kein Bestand mehr für `#sys-<id>`-Ziele. Die
// Anker-Quelle ist `SYSTEMATIK` (`lib/normtext/systematik.ts`), die
// `pages/Gesetze.tsx` als `#sys-<id>` auflöst (Z. ~197) — derselbe Bestand,
// den die Startseiten-Zeilen verlinken (§5). Nav-Baum bleibt als zweite
// Quelle (International-Säule, Kantone, Behörden).
const navZiele = new Set([
  ...alleZiele(NAVIGATION),
  ...SYSTEMATIK.map((k) => `/gesetze?ebene=bund#sys-${k.id}`),
]);

describe('D29 — Systematik-Modul: Zeilen-Ziele', () => {
  const zeilen = systematikZeilen();

  it('genau sechs Zeilen (fünf Bund-Kategorien + International)', () => {
    expect(zeilen.length).toBe(6);
  });

  it('jede Zeile hat ein eigenes Ziel — paarweise verschieden', () => {
    const ziele = zeilen.map((z) => z.ziel);
    expect(new Set(ziele).size).toBe(ziele.length);
  });

  it('jedes Zeilen-Ziel existiert im Nav-Bestand (Sidebar-Ableitung)', () => {
    for (const z of zeilen) expect(navZiele.has(z.ziel), z.ziel).toBe(true);
  });
});

describe('D29 — Systematik-Modul: Kürzel-Links', () => {
  const alleKuerzel = STARTSEITE_ZAEHLER.bundSystematik.flatMap((k) => k.kuerzel)
    .concat(STARTSEITE_ZAEHLER.internationalKuerzel);
  const registerKuerzel = new Set(ERLASS_REGISTER.map((r) => r.kuerzel));

  it('jedes angezeigte Kürzel, das das Register führt, bekommt einen Link', () => {
    for (const k of alleKuerzel) {
      if (registerKuerzel.has(k)) expect(kuerzelZiel(k), k).not.toBeNull();
    }
  });

  it('Kürzel-Link zeigt auf den Erlass mit GENAU diesem Kürzel (Register-Rundlauf)', () => {
    for (const k of alleKuerzel) {
      const ziel = kuerzelZiel(k);
      if (ziel === null) continue;
      const eintrag = ERLASS_REGISTER.find((r) => r.kuerzel === k)!;
      expect(ziel, k).toContain(encodeURIComponent(eintrag.key));
    }
  });

  it('Kürzel mit Register-Schlüssel ≠ Anzeige-Kürzel lösen trotzdem korrekt auf (LugÜ/HZÜ)', () => {
    expect(STARTSEITE_ZAEHLER.internationalKuerzel).toContain('LugÜ');
    // Staatsverträge tragen die Routen-Ebene 'international' (Befund 45,
    // erlassAdresse.ts), NICHT 'bund' — trotz Daten-Ebene 'bund' im Register.
    expect(kuerzelZiel('LugÜ')).toBe('/gesetze/international/LUGUE');
  });

  it('alle Kürzel-Ziele einer Zeile sind paarweise verschieden (keine Dubletten)', () => {
    for (const z of systematikZeilen()) {
      const ziele = z.kuerzel.map((k) => kuerzelZiel(k)).filter((p): p is string => p !== null);
      expect(new Set(ziele).size, z.titel).toBe(ziele.length);
    }
  });
});

describe('D29 — Kantone-Modul: Ziele', () => {
  it('jeder Kanton hat ein eigenes Ziel — paarweise verschieden', () => {
    const ziele = KANTONE.map((kt) => kantonZiel(kt));
    expect(new Set(ziele).size).toBe(ziele.length);
  });

  it('jedes Kantons-Ziel existiert im Nav-Bestand (Sidebar-Ableitung)', () => {
    for (const kt of KANTONE) expect(navZiele.has(kantonZiel(kt)), kt).toBe(true);
  });
});

describe('D29 — Behörden-Modul: Ziele', () => {
  const behoerden = STARTSEITE_ZAEHLER.materialienBehoerden;

  it('mindestens eine Behörde ist erfasst (sonst nichts zu prüfen)', () => {
    expect(behoerden.length).toBeGreaterThan(0);
  });

  it('jede Behörde hat ein eigenes Ziel — paarweise verschieden', () => {
    const ziele = behoerden.map((b) => behoerdeZiel(b.id));
    expect(new Set(ziele).size).toBe(ziele.length);
  });

  it('jedes Behörden-Ziel existiert im Nav-Bestand (Sidebar-Ableitung)', () => {
    for (const b of behoerden) expect(navZiele.has(behoerdeZiel(b.id)), b.id).toBe(true);
  });
});
