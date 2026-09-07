import { describe, expect, it } from 'vitest';
import { KANTONE } from '../lib/kantone';
import { ERLASS_REGISTER } from '../lib/normtext/register';
import { kanonisierePfad, routenEbeneVonKey } from '../lib/normtext/erlassAdresse';
import { umzugsZiel } from '../pages/gesetz-leser/adressUmzug';
import registerManifest from '../../public/normtext/register.json';

// ─── K-3 · EIN ERLASS, EINE ADRESSE — AUCH KANTONAL (W2·13-KANTONE) ──────────
//
// Der Befund-45-Umzug hat die Regel «genau eine Adresse, jede andere leitet
// dorthin» für die 238 Bundes-Schlüssel eingeführt. Für die 1231 kantonalen
// blieb eine ausdrücklich dokumentierte Lücke: sie stehen nicht im
// `ERLASS_REGISTER` (das trägt nur den Bund), also fiel `routenEbeneVonKey` auf
// das URL-Segment zurück — `/gesetze/bund/ZH-211.1` rendete eine vollständige,
// funktionierende Kantonsseite mit der Brotkrume «Kanton Zürich». Exakt Befund
// 45, nur eine Ebene tiefer: eine zweite Adresse, deren URL der angezeigten
// Ebene widerspricht (§5/§8).
//
// DIE REGEL, DIE DIE LÜCKE SCHLIESST, IST BEWACHT, NICHT GERATEN (§2/§7): ein
// kantonaler Schlüssel trägt das Kantonskürzel als Präfix (`ZH-…`,
// `BS-RiE 911.900`), ein Bundes-Schlüssel nie. Dass das für den GANZEN
// committeten Bestand gilt, prüfen die beiden Korpus-Sonden unten — käme je ein
// Gegenbeispiel hinzu, wird dieser Test rot, statt dass still falsch geleitet
// wird. Das Register bleibt trotzdem die erste Instanz: die Präfix-Regel greift
// nur für Schlüssel, die es NICHT kennt.

const MANIFEST = (registerManifest as { erlasse: { key: string; ebene: string }[] }).erlasse;
const KANTON_KEYS = MANIFEST.filter((e) => e.ebene === 'kanton').map((e) => e.key);
const BUND_KEYS = MANIFEST.filter((e) => e.ebene !== 'kanton').map((e) => e.key);

describe('K-3 · Korpus-Sonden: die Präfix-Regel deckt den ganzen Bestand', () => {
  const praefix = new RegExp(`^(${KANTONE.join('|')})-`);

  it('jeder kantonale Schlüssel trägt ein Kantonskürzel als Präfix', () => {
    expect(KANTON_KEYS.length).toBeGreaterThan(1000);
    expect(KANTON_KEYS.filter((k) => !praefix.test(k))).toEqual([]);
  });

  it('kein Bundes-/International-Schlüssel trägt eines', () => {
    expect(BUND_KEYS.filter((k) => praefix.test(k))).toEqual([]);
    expect(ERLASS_REGISTER.filter((e) => praefix.test(e.key)).map((e) => e.key)).toEqual([]);
  });
});

describe('K-3 · Ebenen-Redirect: falsche Ebene führt auf die kanonische Adresse', () => {
  it('kantonaler Schlüssel unter «bund» leitet auf «kanton»', () => {
    expect(umzugsZiel('bund', 'ZH-211.1')).toBe('/gesetze/kanton/ZH-211.1');
  });

  it('… ebenso unter «international» (kein Kantons-Staatsvertrag)', () => {
    expect(umzugsZiel('international', 'BS-RiE 911.900')).toBe('/gesetze/kanton/BS-RiE%20911.900');
  });

  it('auf der Zieladresse feuert nichts (keine Schleife)', () => {
    expect(umzugsZiel('kanton', 'ZH-211.1')).toBeNull();
    expect(umzugsZiel('kanton', 'BS-RiE 911.900')).toBeNull();
  });

  it('die Gegenrichtung bleibt, wie sie war (Bund-Erlass unter «kanton»)', () => {
    expect(umzugsZiel('kanton', 'OR')).toBe('/gesetze/bund/OR');
    expect(umzugsZiel('bund', 'OR')).toBeNull();
    expect(umzugsZiel('bund', 'CISG')).toBe('/gesetze/international/CISG');
  });

  it('das Register schlägt die Präfix-Regel (es ist die erste Instanz)', () => {
    // Ein Bundes-Schlüssel bleibt Bund, gleich welches Segment ankommt.
    expect(routenEbeneVonKey('OR', 'kanton')).toBe('bund');
    expect(routenEbeneVonKey('CISG', 'kanton')).toBe('international');
  });

  it('unbekannte Schlüssel ohne Kantons-Präfix bleiben beim Segment (§8: nichts raten)', () => {
    expect(umzugsZiel('bund', 'GIBTSNICHT')).toBeNull();
    expect(umzugsZiel('kanton', 'GIBTSNICHT')).toBeNull();
    expect(routenEbeneVonKey('XX-999', 'bund')).toBe('bund'); // «XX» ist kein Kanton
    expect(umzugsZiel('bund', '')).toBeNull();
  });

  it('gespeicherte Alt-Adressen ziehen mit (Reiter/Panes), Anker und Query überleben', () => {
    expect(kanonisierePfad('/gesetze/bund/ZH-211.1')).toBe('/gesetze/kanton/ZH-211.1');
    expect(kanonisierePfad('/gesetze/bund/ZH-211.1?r=2#art-5')).toBe('/gesetze/kanton/ZH-211.1?r=2#art-5');
    expect(kanonisierePfad('/gesetze/kanton/ZH-211.1')).toBe('/gesetze/kanton/ZH-211.1');
  });

  it('gilt für JEDEN kantonalen Schlüssel des Bestands (1231), ohne Ausnahme', () => {
    const falschGeleitet = KANTON_KEYS.filter((k) => umzugsZiel('kanton', k) !== null);
    expect(falschGeleitet).toEqual([]);
    const nichtGeleitet = KANTON_KEYS.filter((k) => umzugsZiel('bund', k) === null);
    expect(nichtGeleitet).toEqual([]);
  });
});
