// @vitest-environment node
// ─── QS-BASIS (d) K3: Ebenen-Wahl des Generators — SCHARF seit 1.9.2026 ──────
//
// `SUCHE_INDEX_EBENEN` erlaubt es, den statischen Suchindex ohne eine Ebene zu
// bauen (Kanton = 4.26 MiB gzip = 45.2 % des Index, Messung K0 vom 31.8.2026;
// am 1.9.2026 am gewachsenen Korpus nachgemessen: 4 663.0 KB gzip = 46.8 %).
// Der Schalter war bis zum 31.8.2026 DEFAULT AUS; seit dem 1.9.2026 ist der
// Default `EBENEN_DEFAULT = ['bund']` — kantonaler Volltext kommt vom Edge.
// Der Entscheid ist ein §8-Entscheid über die eigene Vollständigkeit und lag bei
// David (Go vom 31.8.2026, nach positiver Live-Verifikation der Edge-Suche).
//
// Dieser Test hält beide Hälften fest:
//   1. Der Schalter FILTERT nur — der Vollindex (`bund,kanton`) ist byte-gleich
//      mit dem Code-Weg VOR dem Schalter, der Default-Lauf byte-gleich mit dem
//      Bund-Teil daraus. Ohne das wäre die Scharfschaltung eine Inhaltsänderung.
//   2. Der Index trägt die weggelassene Ebene wirklich nicht MEHR, und der Client
//      meldet sie — nicht als «lädt noch», sondern über `nurOnlineEbenen` als
//      dauerhaft nur online. Ohne diese zweite Hälfte wäre der Schalter eine
//      stille Auskunftslücke: eine leere kantonale Trefferliste ist vom «es gibt
//      keine kantonale Bestimmung» nicht zu unterscheiden.
import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import * as flex from 'flexsearch';
import { EBENEN, EBENEN_DEFAULT, baueEbenenIndex, baueIndex, gewaehlteEbenen } from '../../../scripts/such-index-generieren';
import { baueSucher, SUCHE_OHNE_INDEX } from '../../lib/suche/artikelVolltext';
import { artikelGruppe, sucheAlles } from '../../lib/universalSuche';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FlexSearch: any = (flex as unknown as { default?: unknown }).default ?? flex;

describe('K3 Ebenen-Wahl: Default ist SCHARF (nur Bund)', () => {
  it('ohne Variable → nur die Default-Ebenen, nicht alle', () => {
    expect(gewaehlteEbenen(undefined)).toEqual(EBENEN_DEFAULT);
    expect(gewaehlteEbenen('')).toEqual(EBENEN_DEFAULT);
    expect(gewaehlteEbenen('   ')).toEqual(EBENEN_DEFAULT);
    // Explizit: der Default ist NICHT mehr die volle Ebenen-Liste. Diese Zeile ist
    // der Rot-Beweis der Scharfschaltung — sie war bis zum 31.8.2026 umgekehrt.
    expect(gewaehlteEbenen(undefined)).not.toEqual(EBENEN);
    expect(EBENEN_DEFAULT).toEqual(['bund']);
  });

  it('alle Ebenen ausdrücklich genannt → dasselbe wie Default', () => {
    expect(gewaehlteEbenen('bund,kanton')).toEqual(EBENEN);
    // Nenn-Reihenfolge ändert die Eintrags-Reihenfolge NICHT (§2 stabil).
    expect(gewaehlteEbenen('kanton,bund')).toEqual(EBENEN);
  });
});

// ─── F3 (Gegenprüfung 31.8.2026): der BYTE-Beweis, den der Kommentar behauptete ──────
//
// Der K3-Kommentar in such-index-generieren.ts berief sich auf einen Byte-Gleichheits-
// Beweis in `src/tests/suchIndex.test.ts` — zweifach falsch: die Datei enthielt keinen
// solchen Beweis, und die K3-Tests standen ohnehin hier. Damit stützte sich die
// Aussage «Default AUS ist wirkungslos» auf gar nichts Ausführbares. Ein behaupteter
// Beweis ist schlimmer als kein Beweis: er beendet das Nachfragen (§8).
//
// Die Tests darüber prüfen nur, welche EBENEN-LISTE herauskommt. Das ist die Absicht,
// nicht die Wirkung. Hier steht die Wirkung: der VOLLE Index, byte-für-byte.
describe('F3 Byte-Beweis: der Schalter filtert, er verändert nichts', () => {
  // ~0,5 s für den vollen Index über alle 57 036 Artikel (gemessen 1.9.2026) —
  // billig genug, um bei jedem Lauf mitzufahren, statt nur behauptet zu werden.
  // AUSDRÜCKLICH `EBENEN`, seit der Default nur noch den Bund baut (K3 scharf,
  // 1.9.2026): dieser Block prüft die Montage, nicht die Auslieferungs-Wahl.
  const voll = JSON.stringify(baueIndex(EBENEN));
  const sha = (s: string) => createHash('sha256').update(s).digest('hex');

  it('Vollindex ist byte-gleich mit der Montage OHNE Schalter', () => {
    // DIE REFERENZ, und warum ausgerechnet diese:
    //
    // · NICHT `baueIndex(EBENEN)` — das wäre zirkulär, beide Seiten gingen durch
    //   denselben Schalter und dieselbe Montage.
    // · NICHT das ausgelieferte `public/such-index/artikel.json` — verlockend, aber
    //   falsch: der Ordner steht in .gitignore und die Datei entsteht erst in
    //   `npm run build` (gen:suchindex). Der CI-Job `tore` baut nicht (kein
    //   `needs: bau`); der Test wäre dort mit ENOENT rot gelaufen — lokal am
    //   31.8.2026 durch Wegnehmen der Datei reproduziert. Ein Tor, das von einem
    //   ungebauten Artefakt abhängt, prüft nicht die Sache, sondern die Umgebung.
    // · SONDERN die Montage aus `baueEbenenIndex` je Ebene — genau der Code-Weg, den
    //   es vor dem Schalter gab. Der Schalter sitzt in `gewaehlteEbenen()` und im
    //   Default-Parameter von `baueIndex`; diese Referenz fragt ihn nicht.
    const teile = EBENEN.map((eb) => baueEbenenIndex(eb));
    const ohneSchalter = JSON.stringify({
      erzeugt: 'generiert',
      ebenen: EBENEN,
      eintraege: teile.flatMap((t) => t.eintraege),
      uebersprungen: teile.flatMap((t) => t.uebersprungen),
    });
    expect(
      sha(voll),
      `sha256 Vollindex ${sha(voll).slice(0, 16)}… vs. ohne Schalter ${sha(ohneSchalter).slice(0, 16)}…`,
    ).toBe(sha(ohneSchalter));
    expect(voll.length).toBe(ohneSchalter.length);
  });

  it('der DEFAULT-Lauf ist byte-gleich mit der Bund-Montage (K3 scharf)', () => {
    // Die Auslieferungs-Wahl selbst, byte-für-byte: was `npm run build` ohne
    // gesetzte Variable schreibt, ist genau der Bund-Teil — kein anderer Aufbau,
    // keine veränderte Reihenfolge, kein verändertes Feld.
    const default_ = JSON.stringify(baueIndex());
    const teil = baueEbenenIndex('bund');
    const bundMontage = JSON.stringify({
      erzeugt: 'generiert',
      ebenen: EBENEN_DEFAULT,
      eintraege: teil.eintraege,
      uebersprungen: teil.uebersprungen,
    });
    expect(sha(default_)).toBe(sha(bundMontage));
  });

  it('der Schalter FILTERT nur — er verändert keinen einzigen Eintrag', () => {
    // Die zweite Hälfte des Beweises. «Byte-gleich beim Vollindex» allein schlösse
    // nicht aus, dass der Schalter gefiltert nebenher etwas am Eintrag ändert. Geprüft
    // wird darum: die Bund-Einträge des gefilterten Laufs sind Zeichen für Zeichen und
    // in derselben Reihenfolge die Bund-Einträge des vollen Laufs.
    const nurBund = baueIndex(['bund']);
    const bundAusVoll = baueIndex(EBENEN).eintraege.filter((e) => e.eb === 'bund');
    expect(nurBund.eintraege.length).toBe(bundAusVoll.length);
    expect(sha(JSON.stringify(nurBund.eintraege))).toBe(sha(JSON.stringify(bundAusVoll)));
    // …und die weggelassene Ebene ist im Artefakt SICHTBAR abwesend, nicht bloss leer.
    expect(nurBund.ebenen).toEqual(['bund']);
    expect(nurBund.eintraege.some((e) => e.eb === 'kanton')).toBe(false);
  });

  it('zwei Läufe sind byte-gleich (§2 Determinismus, kein Date/Netz/Zufall)', () => {
    expect(sha(JSON.stringify(baueIndex(EBENEN)))).toBe(sha(voll));
  });
});

describe('K3 Ebenen-Wahl: AN lässt die Ebene wirklich weg', () => {
  it('«bund» wählt nur den Bund', () => {
    expect(gewaehlteEbenen('bund')).toEqual(['bund']);
  });

  it('Trennzeichen Komma und Leerraum sind gleichwertig', () => {
    expect(gewaehlteEbenen('bund kanton')).toEqual(EBENEN);
  });

  it('Tippfehler wird LAUT, nicht still zum halben Index', () => {
    // Der Fehlmodus aus PR #313: ein halber Index, der nie rot wurde. Eine
    // unbekannte Ebene muss den Lauf abbrechen, nicht stillschweigend wegfallen.
    expect(() => gewaehlteEbenen('bnud')).toThrow(/unbekannte Ebene/);
    expect(() => gewaehlteEbenen('bund,kantonn')).toThrow(/kantonn/);
    expect(() => gewaehlteEbenen(',,')).toThrow(/keine gültige Ebene/);
  });
});

describe('K3 Ebenen-Ehrlichkeit im Client: weggelassene Ebene wird als fehlend gemeldet', () => {
  const leer = { m: '', n: '', g: '', tb: '', f: '' };
  const NUR_BUND = [
    { k: 'OR', ku: 'OR', eb: 'bund' as const, kt: '', a: '253', l: 'Art. 253', t: 'miete des vermieters', ...leer },
  ];
  const BEIDE = [
    ...NUR_BUND,
    { k: 'AI-640.000', ku: 'StG (GS 640.000)', eb: 'kanton' as const, kt: 'AI', a: '116', l: 'Art. 116', t: 'handänderungssteuer', ...leer },
  ];

  it('Index OHNE kantonale Einträge → «kanton» gilt NICHT als bereit', () => {
    const s = baueSucher(NUR_BUND as never, FlexSearch);
    s.ergaenze('bund');
    s.ergaenze('kanton'); // liefert nichts — darf darum nicht eingehängt werden
    expect(s.bereiteEbenen()).toEqual(['bund']);
    // Genau daraus baut artikelVolltext.baue() `fehlendeEbenen`:
    const fehlend = EBENEN.filter((eb) => !s.bereiteEbenen().includes(eb));
    expect(fehlend).toEqual(['kanton']);
  });

  it('auch gestaffelt: eine leere Ebene rückt nicht als «bereit» nach', async () => {
    const s = baueSucher(NUR_BUND as never, FlexSearch);
    s.ergaenze('bund');
    await s.ergaenzeGestaffelt('kanton');
    expect(s.bereiteEbenen()).toEqual(['bund']);
  });

  it('VERHALTENSNEUTRAL für den heutigen Voll-Index: beide Ebenen bleiben bereit', () => {
    // Die Regel darf den Normalfall nicht anfassen — sonst wäre aus der
    // K3-Vorbereitung eine Verhaltensänderung geworden.
    const s = baueSucher(BEIDE as never, FlexSearch);
    s.ergaenze('bund');
    s.ergaenze('kanton');
    expect(s.bereiteEbenen()).toEqual(['bund', 'kanton']);
    expect(EBENEN.filter((eb) => !s.bereiteEbenen().includes(eb))).toEqual([]);
  });
});

// ─── K3-Scharfschaltung: was der NUTZER davon sieht (§8) ─────────────────────
//
// Die Ebene wegzulassen ist die halbe Sache; die andere Hälfte ist, es zu sagen.
// Und zwar RICHTIG: «wird noch geladen» wäre eine Vertröstung auf etwas, das nie
// kommt. Der statische Index trägt den Kanton dauerhaft nicht mehr — der Satz muss
// die Online-Bedingung UND die Offline-Folge nennen, und die Gruppe muss sichtbar
// bleiben, auch wenn eine rein kantonale Query null statische Treffer hat.
describe('K3 Ehrlichkeit in der Trefferliste: «nur online» ist kein «lädt noch»', () => {
  it('nurOnlineEbenen erzeugt den Online-Satz, nicht den Lade-Satz', () => {
    const g = artikelGruppe([], 6, 'handänderungssteuer', [], ['kanton']);
    expect(g.hinweis).toContain('nur über die Online-Suche');
    expect(g.hinweis).toContain('ohne Verbindung');
    expect(g.hinweis).not.toContain('werden noch geladen');
    // «wächst noch» darf NICHT behauptet werden: die Kopfzeile hängte sonst ein
    // dauerhaftes «wird noch ergänzt» an eine Menge, die fertig ist.
    expect(g.unvollstaendig).toBeUndefined();
    expect(g.eingeschraenkt).toBe(true);
  });

  it('die Gruppe bleibt sichtbar, auch ohne einen einzigen Treffer', () => {
    const gruppen = sucheAlles('handänderungssteuer', {
      presets: [], gesetze: [], artikel: [], entscheide: [], materialien: [],
      artikelNurOnlineEbenen: ['kanton'],
    });
    const artikel = gruppen.find((g) => g.id === 'artikel');
    expect(artikel, 'ohne die Gruppe verschwindet der Hinweis — und die Suche sagt stumm «nichts gefunden»').toBeDefined();
    expect(artikel!.hinweis).toContain('Online-Suche');
  });

  it('beide Zustände gleichzeitig: Bund lädt noch nach, Kanton bleibt online', () => {
    const g = artikelGruppe([], 6, 'x', ['bund'], ['kanton']);
    expect(g.hinweis).toContain('werden noch geladen');
    expect(g.hinweis).toContain('nur über die Online-Suche');
    expect(g.unvollstaendig).toBe(true);
    expect(g.eingeschraenkt).toBe(true);
  });

  it('ohne weggelassene Ebene bleibt alles wie vorher (kein Hinweis, keine leere Gruppe)', () => {
    const g = artikelGruppe([], 6, 'x', [], []);
    expect(g.hinweis).toBeUndefined();
    expect(g.eingeschraenkt).toBeUndefined();
    expect(sucheAlles('x', { presets: [], gesetze: [], artikel: [], entscheide: [], materialien: [] })
      .find((x) => x.id === 'artikel')).toBeUndefined();
  });
});

// ─── Totaler Index-Fehlschlag: auch DAS muss die Oberfläche sagen (§8) ───────
//
// Wenn `artikel.json` gar nicht lädt (Netz, 404, kaputtes JSON), ist lokal NICHTS
// durchsuchbar — nicht bloss der Kanton. Bis zum 1.9.2026 meldete dieser Pfad
// «nichts fehlt», die Gesetzestext-Gruppe fiel ohne Treffer aus der Liste und die
// Suche behauptete stumm «nichts gefunden» über einen Bestand, den sie nie gesehen
// hatte. Der Ersatz meldet darum beide Ebenen als nur-online — was in diesem
// Zustand die Wahrheit ist: die Edge-Suche deckt Bund UND Kanton ab.
describe('K3 Ehrlichkeit beim totalen Index-Fehlschlag', () => {
  it('SUCHE_OHNE_INDEX meldet beide Ebenen als nur-online', () => {
    expect(SUCHE_OHNE_INDEX.nurOnlineEbenen).toEqual(['bund', 'kanton']);
    expect(SUCHE_OHNE_INDEX.suche('miete')).toEqual([]);
  });

  it('die Gruppe bleibt sichtbar und nennt beide Ebenen', () => {
    const gruppen = sucheAlles('miete', {
      presets: [], gesetze: [], artikel: SUCHE_OHNE_INDEX.suche('miete'),
      entscheide: [], materialien: [],
      artikelNurOnlineEbenen: SUCHE_OHNE_INDEX.nurOnlineEbenen,
    });
    const artikel = gruppen.find((g) => g.id === 'artikel')
    expect(artikel, 'ohne Gruppe kein Hinweis — die Suche verschwiege den ungeladenen Bestand').toBeDefined();
    expect(artikel!.hinweis).toContain('Bundeserlasse');
    expect(artikel!.hinweis).toContain('Kantonale Erlasse');
  });
});
