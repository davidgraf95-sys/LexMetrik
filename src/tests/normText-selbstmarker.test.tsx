import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NormText, type InternRefs } from '../components/NormText';
import { LocaleProvider } from '../components/locale';

// ═══ W2·20-VERWEIS-SCHAERFE · V-2 — Selbstmarker-Weiche vor den Fremd-Guards ══
//
// Drei EXPLIZITE Selbst-Signale, die bis hierher in einer Fremd-Unterdrückung
// landeten. Alle drei sind wörtliche Signale im Quelltext, keine Heuristik:
//
//  1. «Art./§ N [Passus] des vorliegenden Gesetzes / der vorliegenden Verordnung
//     / dieses Vertrages …» — der Verweis NENNT den eigenen Erlass. Er fiel in
//     den des/der-Guard (NormText.tsx), weil der nur das erste Wort nach dem
//     Zitat prüft. Gemessen 31.8.2026 am Korpus (1 458 Snapshots): 27 Stellen im
//     Art.-Pfad, 2 im §-Pfad, 1 hinter F41.
//  2. «§ N <eigenes Register-Kürzel>» — der Grosswort-Guard des §-Pfads sperrt
//     jedes gross beginnende Wort am Zitat; steht dort das Kürzel des GELESENEN
//     Erlasses, ist es ein Selbstverweis (13 Stellen, BS-162.100 + BS-410.700).
//  3. «Art. N <eigenes FEDLEX-Kürzel>» — der Verweis wird heute als Fremd-Chip
//     nach Fedlex geführt, obwohl der Leser bereits in der geltenden Fassung
//     steht (6 Stellen in SSV/VZV/VVEA-Anhängen).
//
// Leitplanke unverändert (§1/§8): das Signal muss EXPLIZIT sein, und ohne Token
// im gelesenen Erlass bleibt es Text — nie ein toter Link.
//
// Fixtures sind ECHTE Snapshot-Texte (public/normtext, nur gelesen); eine
// erfundene Beispielzeile bewiese nichts über den Korpus (§7).

const ssr = (el: React.ReactElement) => renderToString(<LocaleProvider>{el}</LocaleProvider>);
const NORMTEXT = join(process.cwd(), 'public/normtext');

type Snapshot = {
  eintraege: Array<{
    artikel: string;
    bloecke?: Array<{ text?: string; items?: Array<{ text?: string }> }>;
  }>;
};
const lade = (rel: string): Snapshot => JSON.parse(readFileSync(join(NORMTEXT, `${rel}.json`), 'utf8')) as Snapshot;

/** Erster Blocktext (inkl. Aufzählungs-Items) eines Artikels, der `nadel` trägt. */
function snapshotText(rel: string, artikel: string, nadel: string): string {
  const e = lade(rel).eintraege.find((x) => x.artikel === artikel);
  for (const b of e?.bloecke ?? []) {
    for (const t of [b.text, ...(b.items ?? []).map((i) => i.text)]) {
      if (t && t.includes(nadel)) return t;
    }
  }
  throw new Error(`Fixture fehlt: ${rel} ${artikel} «${nadel}»`);
}

/** InternRefs wie der Reader sie baut (tokenMap aus dem echten Snapshot). */
function refs(rel: string, opts: { paragrafDesigniert?: boolean; eigenesKuerzel?: string } = {}): InternRefs {
  const tokenMap = new Map<string, string>();
  for (const e of lade(rel).eintraege) tokenMap.set(e.artikel.toLowerCase().replace(/[^a-z0-9]/g, ''), e.artikel);
  const [ebene, key] = rel.split('/');
  return {
    tokenMap,
    basisPfad: `/gesetze/${ebene}/${key}`,
    springeZu: () => {},
    ...opts,
  };
}
/** Sichtbarer Text = Eingabe (die Weiche fügt nur Anker-Hüllen hinzu, §1). */
const nurText = (html: string) => html.replace(/<[^>]*>/g, '');

describe('V-2 Ziel 1 — «des vorliegenden Gesetzes» ist ein Selbst-Signal (Art.-Pfad)', () => {
  // ZWILLING (Messbericht 31.8.2026, Kernbefund 1): dieselbe Wendung, zwei
  // Ergebnisse — allein weil in AIG 80a ein Passus zwischen Nummer und «des»
  // steht und der des/der-Guard nur DIREKT hinter der Nummer prüft.
  it('AHVG Art. 9 Abs. 4: «Artikel 8 des vorliegenden Gesetzes» springt in den eigenen Erlass', () => {
    const text = snapshotText('bund/AHVG', '9', 'des vorliegenden Gesetzes');
    expect(text).toContain('Artikel 8 des vorliegenden Gesetzes');
    const out = ssr(<NormText text={text} intern={refs('bund/AHVG')} />);
    expect(out).toContain('/gesetze/bund/AHVG#art-8"');
    expect(nurText(out)).toBe(text);
  });

  it('AHVG Art. 9 Abs. 4: die FREMDEN Verweise derselben Stelle bleiben fremd', () => {
    const text = snapshotText('bund/AHVG', '9', 'des vorliegenden Gesetzes');
    const out = ssr(<NormText text={text} intern={refs('bund/AHVG')} />);
    // «Artikel 3 Absatz 1 des Bundesgesetzes … (IVG)» und «Artikel 27 Absatz 2
    // des Erwerbsersatzgesetzes …» dürfen nie auf AHVG-Artikel zeigen.
    expect(out).not.toContain('/gesetze/bund/AHVG#art-3"');
    expect(out).not.toContain('/gesetze/bund/AHVG#art-27"');
  });

  it('AIG Art. 80a Abs. 6 (Zwilling): war schon ein Self-Sprung und bleibt es', () => {
    const text = snapshotText('bund/AIG', '80_a', 'des vorliegenden Gesetzes');
    expect(text).toContain('Artikel 66 Absatz 1 des vorliegenden Gesetzes');
    const out = ssr(<NormText text={text} intern={refs('bund/AIG')} />);
    expect(out).toContain('/gesetze/bund/AIG#art-66"');
    expect(nurText(out)).toBe(text);
  });

  it('AIG Art. 80a Abs. 6: der Nebenbefund «Artikel 17 Absatz 3 AsylG» ist mit V-6 geschlossen', () => {
    // DEKLARIERTE FACHLICHE KORREKTUR (§6.3), 31.8.2026 — kein Refactoring.
    //
    // Bis V-6 stand hier eine EHRLICHKEITS-SONDE: der Test verlangte den
    // falschen Self-Link auf AIG art-17 und fror damit den Ist-Zustand ein,
    // «damit die Lücke sichtbar bleibt und ihr späterer Fix genau hier rot
    // wird». Genau das ist eingetreten. V-6 hat die Ursache behoben — der
    // M12-Guard prüft jetzt auch den Rest NACH dem Passus, sieht das «AsylG»
    // hinter «Absatz 3» und unterdrückt den Sprung (§1: kein Link ist besser
    // als ein falscher). Die Sonde wird darum nicht «nachgeführt», sondern
    // durch die Zusicherung ersetzt, die sie herbeigeführt hat.
    //
    // Der ausführliche Beweis samt Messung steht in
    // `src/tests/normText-passus-guards.test.tsx`; hier bleibt die Zeile
    // stehen, weil der Nebenbefund an DIESER Stelle entdeckt wurde und der
    // V-2-Selbstmarker derselben Stelle davon unberührt bleiben muss.
    const out = ssr(<NormText text={snapshotText('bund/AIG', '80_a', 'des vorliegenden Gesetzes')} intern={refs('bund/AIG')} />);
    expect(out).not.toContain('/gesetze/bund/AIG#art-17"');
    expect(out).toContain('/gesetze/bund/AIG#art-66"');
  });

  it('AIG Art. 31 Abs. 3: Selbst-Sprung auf Art. 68, StGB/MStG bleiben fremd', () => {
    const text = snapshotText('bund/AIG', '31', 'Ausweisung nach Artikel 68 des vorliegenden Gesetzes');
    const out = ssr(<NormText text={text} intern={refs('bund/AIG')} />);
    expect(out).toContain('/gesetze/bund/AIG#art-68"');
    expect(out).not.toContain('/gesetze/bund/AIG#art-66_a"');
    expect(out).not.toContain('/gesetze/bund/AIG#art-49_a"');
    expect(nurText(out)).toBe(text);
  });

  it('ohne Selbst-Signal bleibt der des/der-Guard scharf («des Bundesgesetzes …»)', () => {
    const t = 'Die Beiträge nach Artikel 8 des Bundesgesetzes vom 20. Dezember 1946 bleiben vorbehalten.';
    expect(ssr(<NormText text={t} intern={refs('bund/AHVG')} />)).not.toContain('#art-8"');
  });

  it('kein toter Link: KVG Art. 99 nennt «Artikel 11 dieses Gesetzes» — es gibt keinen mehr', () => {
    const text = snapshotText('bund/KVG', '99', 'Artikel 11 dieses Gesetzes');
    expect(text).toContain('Artikel 11 dieses Gesetzes');
    expect(ssr(<NormText text={text} intern={refs('bund/KVG')} />)).not.toContain('#art-11"');
  });
});

describe('V-2 Ziel 1 — Selbst-Signal im §-Pfad', () => {
  it('BS-834.400 § 62: «§ 59 Abs. 2 des vorliegenden Gesetzes» springt selbst', () => {
    const text = snapshotText('kanton/BS-834.400', '62', 'des vorliegenden Gesetzes');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-834.400', { paragrafDesigniert: true })} />);
    expect(out).toContain('/gesetze/kanton/BS-834.400#art-59"');
    expect(nurText(out)).toBe(text);
  });

  it('BS-569.500 § 9: «§ 7 der vorliegenden Verordnung» springt selbst', () => {
    const text = snapshotText('kanton/BS-569.500', '9', 'der vorliegenden Verordnung');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-569.500', { paragrafDesigniert: true })} />);
    expect(out).toContain('/gesetze/kanton/BS-569.500#art-7"');
  });

  it('der Fremd-Name-Guard bleibt scharf («der Verordnung über …»)', () => {
    const text = snapshotText('kanton/SO-615.11', '50', '§§ 19 bis 21 der Verordnung');
    const out = ssr(<NormText text={text} intern={refs('kanton/SO-615.11', { paragrafDesigniert: true })} />);
    expect(out).not.toContain('#art-19"');
    expect(out).not.toContain('#art-21"');
  });

  it('F41 weicht dem expliziten Selbst-Signal: BS-833.100 § 6 «Art. 12 dieses Vertrages»', () => {
    // Der Erlass IST ein Vertrag und zählt mit «§»; er zitiert seine eigene
    // Bestimmung als «Art. 12». Die Drafting-Konvention (F41) ist ein Indiz,
    // der Selbstmarker ein ausdrückliches Signal — das Signal gewinnt.
    const text = snapshotText('kanton/BS-833.100', '6', 'Art. 12 dieses Vertrages');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-833.100', { paragrafDesigniert: true })} />);
    expect(out).toContain('/gesetze/kanton/BS-833.100#art-12"');
  });

  it('F41 bleibt sonst gesperrt (bare «Art. N» ohne Signal im §-Erlass)', () => {
    const text = snapshotText('kanton/BS-427.800', '1', 'Art. 18 Abs. 2 des Bundesgesetzes');
    expect(ssr(<NormText text={text} intern={refs('kanton/BS-427.800', { paragrafDesigniert: true })} />))
      .not.toContain('#art-18"');
  });
});

describe('V-2 Ziel 2 — das EIGENE Register-Kürzel ist kein Fremdgesetz (kantonal)', () => {
  it('BS-162.100 § 19a: «§ 19 Personalgesetz» springt auf den eigenen § 19', () => {
    const text = snapshotText('kanton/BS-162.100', '19_a', '§ 19 Personalgesetz');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-162.100', { paragrafDesigniert: true, eigenesKuerzel: 'Personalgesetz' })} />);
    expect(out).toContain('/gesetze/kanton/BS-162.100#art-19"');
    // «Art. 320 Strafgesetzbuch» derselben Stelle bleibt Text (fremd, F41).
    expect(out).not.toContain('#art-320"');
    expect(nurText(out)).toBe(text);
  });

  it('BS-410.700 § 41: «§ 41 SLV» springt auf den eigenen § 41', () => {
    const text = snapshotText('kanton/BS-410.700', '41', '§ 41 SLV');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-410.700', { paragrafDesigniert: true, eigenesKuerzel: 'SLV' })} />);
    expect(out).toContain('/gesetze/kanton/BS-410.700#art-41"');
  });

  it('ohne bekanntes Register-Kürzel bleibt der Grosswort-Guard unverändert', () => {
    const text = snapshotText('kanton/BS-162.100', '19_a', '§ 19 Personalgesetz');
    expect(ssr(<NormText text={text} intern={refs('kanton/BS-162.100', { paragrafDesigniert: true })} />))
      .not.toContain('#art-19"');
  });

  it('FREMDES Kürzel bleibt Text — verglichen wird exakt, nicht ungefähr', () => {
    const intern = refs('kanton/BS-410.700', { paragrafDesigniert: true, eigenesKuerzel: 'SLV' });
    for (const t of ['Es gilt § 41 SLVO für die Anmeldung.', 'Es gilt § 41 StG für die Anmeldung.',
      'Es gilt § 41 Integrationsgesetz für die Anmeldung.']) {
      expect(ssr(<NormText text={t} intern={intern} />)).not.toContain('#art-41"');
    }
  });

  it('das eigene Kürzel ohne eigene Bestimmung ⇒ kein Link (§8)', () => {
    const intern = refs('kanton/BS-410.700', { paragrafDesigniert: true, eigenesKuerzel: 'SLV' });
    expect(ssr(<NormText text="Vorbehalten bleibt § 999 SLV." intern={intern} />)).not.toContain('#art-999');
  });
});

describe('V-2 Ziel 3 — das eigene FEDLEX-Kürzel führt in den Erlass, nicht nach Fedlex', () => {
  it('SSV Anhang 3: «Art. 65 Abs. 5 SSV» springt intern, «Art. 20a VRV» bleibt fremd', () => {
    const text = snapshotText('bund/SSV', 'annex_3', 'Art. 65 Abs. 5 SSV');
    const out = ssr(<NormText text={text} intern={refs('bund/SSV')} />);
    expect(out).toContain('/gesetze/bund/SSV#art-65"');
    expect(out).not.toMatch(/href="[^"]*fedlex[^"]*"[^>]*>Art\. 65/);
    expect(out).toContain('VRV'); // der Fremdverweis bleibt stehen
    expect(nurText(out)).toBe(text);
  });

  it('VZV Anhang 4: «Art. 10 Abs. 1 VZV» springt intern', () => {
    const text = snapshotText('bund/VZV', 'annex_4', 'Art. 10 Abs. 1 VZV');
    expect(ssr(<NormText text={text} intern={refs('bund/VZV')} />)).toContain('/gesetze/bund/VZV#art-10"');
  });

  it('VVEA Anhang 2: «Art. 4 Abs. 2 VVEA» springt intern', () => {
    const text = snapshotText('bund/VVEA', 'annex_2', 'Art. 4 Abs. 2 VVEA');
    expect(ssr(<NormText text={text} intern={refs('bund/VVEA')} />)).toContain('/gesetze/bund/VVEA#art-4"');
  });

  it('FREMDES Fedlex-Kürzel bleibt ein Fremd-Verweis', () => {
    const out = ssr(<NormText text="Massgebend ist Art. 65 Abs. 5 VRV." intern={refs('bund/SSV')} />);
    expect(out).not.toContain('/gesetze/bund/SSV#art-65"');
  });

  it('ohne Reader-Kontext (kein intern) bleibt alles wie bisher', () => {
    const text = snapshotText('bund/SSV', 'annex_3', 'Art. 65 Abs. 5 SSV');
    const out = ssr(<NormText text={text} />);
    expect(out).not.toContain('/gesetze/bund/SSV#art-65"');
    expect(nurText(out)).toBe(text);
  });

  it('kein toter Link: eigenes Kürzel ohne eigenen Artikel bleibt Fremd-Verweis', () => {
    // SSV hat keinen Art. 999 → der Self-Sprung entfällt, der Chip bleibt.
    const out = ssr(<NormText text="Vgl. Art. 999 SSV hierzu." intern={refs('bund/SSV')} />);
    expect(out).not.toContain('/gesetze/bund/SSV#art-999');
  });
});

describe('Gliederungs-Genitive sind KEINE Selbstmarker (V-1-Fund, Härtung 31.8.2026)', () => {
  // ZGB Schlusstitel Art. 13d zitiert «Artikel 8a dieses Titels» — gemeint ist
  // der SchlT, nie der Erlass. Heute existiert kein Token «8a» im ZGB-Snapshot
  // (totes Ziel, degradiert zu Text); die Härtung stellt sicher, dass auch MIT
  // einem solchen Token nie ein Self-Link entstünde (§1: kein falscher Link).
  it('ZGB SchlT: «Artikel 8a dieses Titels» bleibt Text, auch mit erzwungenem Token', () => {
    const text = snapshotText('bund/ZGB', 'disp_u1_art_13_d', 'dieses Titels');
    const r = refs('bund/ZGB');
    r.tokenMap.set('8a', '8_a'); // erzwungenes Ziel — die Weiche darf trotzdem nicht greifen
    const out = ssr(<NormText text={text} intern={r} />);
    expect(out).not.toContain('#art-8_a"');
    expect(nurText(out)).toBe(text);
  });
});
