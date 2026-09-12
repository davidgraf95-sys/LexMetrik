/**
 * Testbindung der Cache-PIN-Identitäts-Sonde `pinBefund`/`pinIdentitaet`
 * (QS-CURRENCY-KANON-FRISCHE, Gegenprüfung #806, 12.9.2026).
 *
 * ANLASS. `cacheBefund` (siehe fedlex-cache-befund.test.ts) urteilt rein nach
 * INHALT — Grösse, Shell-Marker, Anker. Das lässt eine Lücke offen: ein
 * bestehender `/tmp/<key>.html`-Cache aus der Zeit VOR einem Re-Pin besteht
 * alle drei Inhalts-Sonden anstandslos (er ist ja ein echter, vollständiger
 * Normtext-Dump — nur der einer ÜBERHOLTEN html-Revision). Ohne eine zweite,
 * gegen die aktuell gepinnte Manifestation geprüfte Sonde baut
 * `sicherstelleCaches` den Snapshot still aus der falschen Fassung, sobald ein
 * Re-Pin (`fedlex:repin-kanonik --write`) stattfindet, ohne dass der Prozess
 * neu startet (der Cache selbst überlebt Neustarts nicht, wohl aber eine
 * längere Shell-/CI-Sitzung mit mehreren Läufen). Bei ERV blieb das am
 * 12.9.2026 folgenlos (html-6 ≡ html-7, byte-identisch), ist aber §7-relevant,
 * sobald ein Republish inhaltlich abweicht.
 *
 * ROT-BEWEIS (§6.7): Test 2 unten reproduziert exakt das Szenario — ein Cache
 * trägt einen Marker für html-6, der Eintrag ist inzwischen auf html-7
 * gepinnt. Vor dieser Sonde hätte NUR `cacheBefund` (Inhalt) entschieden, und
 * der wäre `ok:true` gewesen (Test 1 zeigt das ausdrücklich) — der Defekt wäre
 * unsichtbar geblieben. `pinBefund` macht daraus einen sichtbaren Neuabruf.
 *
 * KEIN NETZ, KEIN ECHTER PIN. Alle Fixtures sind synthetisch, eigener
 * /tmp-Namensraum, wird nach jedem Test entfernt.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { cacheBefund, pinBefund, pinIdentitaet } from '../../scripts/normtext-snapshot';

let n = 0;
const angelegt: string[] = [];
/** Legt Cache-HTML + optional Pin-Marker an; liefert den Erlass-Namen. */
function fixture(inhalt: string, pinMarke?: string): string {
  const name = `lexmetrik-pinbefund-${process.pid}-${n++}`;
  const pfad = `/tmp/${name}.html`;
  writeFileSync(pfad, inhalt, 'utf8');
  angelegt.push(pfad);
  if (pinMarke !== undefined) {
    const pinPfad = `${pfad}.pin`;
    writeFileSync(pinPfad, pinMarke, 'utf8');
    angelegt.push(pinPfad);
  }
  return name;
}

afterEach(() => {
  for (const p of angelegt.splice(0)) rmSync(p, { force: true, recursive: true });
});

const ANKER = '<p id="art_1">Art. 1</p>';
function gross(kern: string): string {
  return kern + 'x'.repeat(20_000);
}

describe('pinIdentitaet — deterministisches Marker-Format', () => {
  it('baut eli|konsolidierung|html-N', () => {
    expect(pinIdentitaet('cc/2020/1', '20250101', 7)).toBe('cc/2020/1|20250101|7');
  });
});

describe('pinBefund — Kernfälle', () => {
  it('kein Marker vorhanden → Neuabruf nötig (auch bei sonst gültigem Inhalt)', () => {
    const name = fixture(gross(`<html>${ANKER}`)); // ohne .pin-Datei
    const b = pinBefund(name, 'cc/2020/1', '20250101', 7);
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('Pin-Marker fehlt');
    expect(b.grund).toContain('cc/2020/1|20250101|7');
  });

  it('ROT-BEWEIS: Marker aus einer ÜBERHOLTEN html-Revision (Re-Pin html-6 → html-7) wird abgewiesen', () => {
    // Der Cache stammt aus einem Lauf VOR dem Re-Pin: Marker trägt noch html-6,
    // der Eintrag ist inzwischen auf html-7 gepinnt (derselbe eli/derselbe
    // Konsolidierungsstand — nur die Filestore-Manifestation wechselte).
    const name = fixture(gross(`<html>${ANKER}`), 'cc/2020/1|20250101|6');

    // Zeigt den Vorher-Zustand: die reine Inhalts-Sonde hätte diesen Cache
    // anstandslos angenommen — GENAU DIE LÜCKE, die dieser Test schliesst.
    expect(cacheBefund(name)).toEqual({ ok: true });

    const b = pinBefund(name, 'cc/2020/1', '20250101', 7);
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('Cache=cc/2020/1|20250101|6');
    expect(b.grund).toContain('gepinnt=cc/2020/1|20250101|7');
    expect(b.grund).toContain('Neuabruf nötig');
  });

  it('Marker stimmt exakt überein → gültig', () => {
    const name = fixture(gross(`<html>${ANKER}`), 'cc/2020/1|20250101|7');
    expect(pinBefund(name, 'cc/2020/1', '20250101', 7)).toEqual({ ok: true });
  });

  it('Marker weicht nur in der Konsolidierung ab (Re-Pin auf neuen Stand) → Neuabruf nötig', () => {
    const name = fixture(gross(`<html>${ANKER}`), 'cc/2020/1|20250101|7');
    const b = pinBefund(name, 'cc/2020/1', '20260101', 7);
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('weicht ab');
  });

  it('Marker-Datei ist ein Verzeichnis statt einer Datei → abgewiesen, nicht geworfen', () => {
    const name = `lexmetrik-pinbefund-${process.pid}-${n++}`;
    const pfad = `/tmp/${name}.html`;
    writeFileSync(pfad, gross(`<html>${ANKER}`), 'utf8');
    angelegt.push(pfad);
    mkdirSync(`${pfad}.pin`, { recursive: true });
    angelegt.push(`${pfad}.pin`);
    const b = pinBefund(name, 'cc/2020/1', '20250101', 7);
    expect(b.ok).toBe(false);
    expect(b.grund).toContain('unlesbar');
  });
});
