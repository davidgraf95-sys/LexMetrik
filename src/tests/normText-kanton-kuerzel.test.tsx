import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NormText, VERWEIS_AUSSEN_CLASS, type InternRefs } from '../components/NormText';
import { baueKantonKuerzelKarte, kuerzelKandidaten } from '../pages/gesetz-leser/inhalt-sprung';
import type { BrowseErlass } from '../lib/normtext/browse-typen';
import { LocaleProvider } from '../components/locale';

// ═══ W2·20-VERWEIS-SCHAERFE · V-3 (Kanton-Kürzel-Resolver) + V-4 (Aussen) ════
//
// V-3: «§ 6 IRG» in der BS-Verfassung ist kein Grosswort-Rauschen, sondern ein
// benannter Erlass DESSELBEN Kantons — und im Kanton ist das Kürzel eindeutig.
// Der Grosswort-Guard (PARAGRAF_FREMD_GROSS) unterdrückte ihn bis hierher mit
// der richtigen Begründung («ein StG in BS ist nicht das StG in ZH»), die
// zugleich ihre Auflösung nennt: der Kanton des gelesenen Erlasses steht fest.
//
// V-4: der Verweis in einen ANDEREN Erlass trägt seither das Aussen-Zeichen
// (`lc-verweis-aussen` → ↗ als ::after), der Sprung IM Erlass nicht.
//
// Fixtures sind ECHTE Snapshot- und Register-Daten (public/normtext, nur
// gelesen); eine erfundene Beispielzeile bewiese nichts über den Korpus (§7).

const ssr = (el: React.ReactElement) => renderToString(<LocaleProvider>{el}</LocaleProvider>);
const NORMTEXT = join(process.cwd(), 'public/normtext');

type Snapshot = {
  eintraege: Array<{
    artikel: string;
    bloecke?: Array<{ text?: string; items?: Array<{ text?: string }> }>;
  }>;
};
const lade = (rel: string): Snapshot => JSON.parse(readFileSync(join(NORMTEXT, `${rel}.json`), 'utf8')) as Snapshot;
const register = JSON.parse(readFileSync(join(NORMTEXT, 'register.json'), 'utf8')) as { erlasse: BrowseErlass[] };

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

/** InternRefs wie der Reader sie baut — inkl. der ECHTEN Kanton-Karte. */
function refs(rel: string, opts: { paragrafDesigniert?: boolean; eigenesKuerzel?: string; ohneKarte?: boolean } = {}): InternRefs {
  const tokenMap = new Map<string, string>();
  for (const e of lade(rel).eintraege) tokenMap.set(e.artikel.toLowerCase().replace(/[^a-z0-9]/g, ''), e.artikel);
  const [ebene, key] = rel.split('/');
  const eigen = register.erlasse.find((e) => e.key === key);
  return {
    tokenMap,
    basisPfad: `/gesetze/${ebene}/${key}`,
    springeZu: () => {},
    paragrafDesigniert: opts.paragrafDesigniert,
    eigenesKuerzel: opts.eigenesKuerzel,
    kantonKuerzel: opts.ohneKarte ? undefined : baueKantonKuerzelKarte(register.erlasse, eigen?.kanton, key),
  };
}
/** Sichtbarer Text = Eingabe (die Weiche fügt nur Anker-Hüllen hinzu, §1). */
const nurText = (html: string) => html.replace(/<[^>]*>/g, '');

describe('V-3 — Kürzel eines anderen Erlasses DESSELBEN Kantons wird aufgelöst', () => {
  // Beleg-Fall des Auftrags David 31.8.2026, im Korpus nachgewiesen:
  // BS-111.100 (Verfassung) § 143 zitiert «§ 6 IRG»; IRG ist in BS eindeutig
  // das Gesetz betreffend Initiativen und Referendum (BS-131.100).
  it('BS-111.100 § 143: «§ 6 IRG» führt auf BS-131.100 § 6', () => {
    const text = snapshotText('kanton/BS-111.100', '143', '§ 6 IRG eingereicht');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-111.100', { paragrafDesigniert: true })} />);
    expect(out).toContain('/gesetze/kanton/BS-131.100#art-6"');
    expect(nurText(out)).toBe(text); // Wortlaut zeichengleich (§1)
  });

  it('… und zwar als AUSSEN-Verweis, nicht als Sprung im eigenen Erlass (V-4)', () => {
    const text = snapshotText('kanton/BS-111.100', '143', '§ 6 IRG eingereicht');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-111.100', { paragrafDesigniert: true })} />);
    expect(out).toMatch(/<a href="\/gesetze\/kanton\/BS-131\.100#art-6" class="[^"]*lc-verweis-aussen"/);
    // Der Selbstverweis DERSELBEN Stelle («§ 47 Abs. 4 dieser Verfassung»)
    // bleibt ein Sprung OHNE Aussen-Zeichen — genau die Unterscheidung, die
    // V-4 sichtbar macht.
    expect(out).toMatch(/<a href="\/gesetze\/kanton\/BS-111\.100#art-47"[^>]*class="(?![^"]*lc-verweis-aussen)/);
  });

  it('dieselbe Stelle: «§ 4 des Gesetzes betreffend … (IRG)» bleibt Text (des/der-Guard)', () => {
    // Die ausgeschriebene Präpositionsform ist KEIN Kürzel am Zitat — der
    // Resolver greift dort nicht, der bestehende Guard bleibt scharf.
    const text = snapshotText('kanton/BS-111.100', '143', '§ 6 IRG eingereicht');
    expect(text).toContain('§ 4 des Gesetzes betreffend Initiativen und Referendum (IRG)');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-111.100', { paragrafDesigniert: true })} />);
    expect(out).not.toContain('#art-4"');
  });

  it('BS-132.100 § 28: «§ 28 Abs. 1 IRG» führt in den ANDEREN Erlass, nicht auf den eigenen § 28', () => {
    // Der Passus steht ZWISCHEN Nummer und Kürzel — genau die Asymmetrie, an
    // der der Zwilling des Messberichts hing (AHVG Art. 9 vs. AIG Art. 80a).
    const text = snapshotText('kanton/BS-132.100', '28', '§ 28 Abs. 1 IRG');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-132.100', { paragrafDesigniert: true })} />);
    expect(out).toContain('/gesetze/kanton/BS-131.100#art-28"');
    expect(out).not.toContain('/gesetze/kanton/BS-132.100#art-28"');
  });

  it('ohne Karte (Bund, Kanton ohne Register) bleibt der Grosswort-Guard unverändert', () => {
    const text = snapshotText('kanton/BS-111.100', '143', '§ 6 IRG eingereicht');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-111.100', { paragrafDesigniert: true, ohneKarte: true })} />);
    expect(out).not.toContain('/gesetze/kanton/BS-131.100');
  });

  it('unbekanntes Grosswort bleibt Text — der Resolver rät nicht', () => {
    const intern = refs('kanton/BS-111.100', { paragrafDesigniert: true });
    // «Pauschalgebühren»/«Vorschriften» sind gewöhnliche Substantive (der Preis
    // des Grosswort-Guards, bewusst bezahlt), «Bundespersonalgesetz» ein
    // Erlassname ohne BS-Registereintrag — alle drei bleiben Text.
    for (const t of ['Es gilt § 6 Pauschalgebühren sinngemäss.', 'Es gilt § 6 Vorschriften.',
      'Es gilt § 6 Bundespersonalgesetz.']) {
      expect(ssr(<NormText text={t} intern={intern} />)).not.toContain('#art-6"');
    }
  });

  it('Kürzel MIT Anhang ist ein anderer Erlass (Wortgrenze inkl. Bindestrich, Lehre KKV/KKV-FINMA)', () => {
    const intern = refs('kanton/BS-111.100', { paragrafDesigniert: true });
    expect(ssr(<NormText text="Vorbehalten bleibt § 6 IRG-Anhang." intern={intern} />))
      .not.toContain('/gesetze/kanton/BS-131.100');
  });

  it('Satzzeichen und Passus gehören zum Zitat, nicht zum Kürzel', () => {
    const intern = refs('kanton/BS-111.100', { paragrafDesigniert: true });
    for (const t of ['Vorbehalten bleibt § 6 IRG.', 'Vorbehalten bleibt § 6 Abs. 2 IRG.', 'Vgl. § 6 IRG;']) {
      expect(ssr(<NormText text={t} intern={intern} />)).toContain('/gesetze/kanton/BS-131.100#art-6"');
    }
  });

  it('der Anker folgt der Snapshot-Token-Form («§ 6a» → #art-6_a)', () => {
    const intern = refs('kanton/BS-111.100', { paragrafDesigniert: true });
    expect(ssr(<NormText text="Vorbehalten bleibt § 6a IRG." intern={intern} />))
      .toContain('/gesetze/kanton/BS-131.100#art-6_a"');
  });

  it('das EIGENE Kürzel bleibt ein Selbstverweis (V-2 schlägt V-3)', () => {
    const text = snapshotText('kanton/BS-162.100', '19_a', '§ 19 Personalgesetz');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-162.100', { paragrafDesigniert: true, eigenesKuerzel: 'Personalgesetz' })} />);
    expect(out).toContain('/gesetze/kanton/BS-162.100#art-19"');
  });

  it('ART.-PFAD unberührt: «Art. 17 Abs. 2 EnG» in BS-772.400 zeigt NIE auf den kantonalen EnG', () => {
    // Gemessene Grenze (§1): Bundeserlasse zitieren sich mit «Art.», und ihre
    // Kürzel kollidieren mit kantonalen — «Art. 17 EnG (ZEV …)» meint das
    // BUNDES-Energiegesetz, nicht BS-772.100. Der Resolver läuft darum NUR im
    // §-Pfad. Dieser Test hält die Grenze fest.
    const text = snapshotText('kanton/BS-772.400', '2', 'Art. 17 Abs. 2 EnG');
    const out = ssr(<NormText text={text} intern={refs('kanton/BS-772.400')} />);
    expect(out).not.toContain('/gesetze/kanton/BS-772.100');
  });
});

describe('V-3 — das Kürzel-Register des Kantons (baueKantonKuerzelKarte)', () => {
  const bs = baueKantonKuerzelKarte(register.erlasse, 'BS', 'BS-111.100');

  it('löst das Kürzel auf die kanonische Lese-Adresse auf', () => {
    expect(bs?.get('IRG')).toBe('/gesetze/kanton/BS-131.100');
  });

  it('kennt nur Erlasse DESSELBEN Kantons', () => {
    const ag = baueKantonKuerzelKarte(register.erlasse, 'AG', 'AG-291.150');
    expect(ag?.get('IRG')).toBeUndefined();
    for (const pfad of ag?.values() ?? []) expect(pfad).toContain('/AG-');
  });

  it('Bund/ohne Kanton ⇒ keine Karte (die Weiche ruht)', () => {
    expect(baueKantonKuerzelKarte(register.erlasse, null, 'OR')).toBeUndefined();
    expect(baueKantonKuerzelKarte(undefined, 'BS', 'BS-111.100')).toBeUndefined();
  });

  it('der GELESENE Erlass ist nie Ziel (Selbstverweis ist Sache von V-2)', () => {
    const eigen = baueKantonKuerzelKarte(register.erlasse, 'BS', 'BS-131.100');
    expect(eigen?.get('IRG')).toBeUndefined();
    expect(bs?.get('IRG')).toBe('/gesetze/kanton/BS-131.100'); // aus fremder Sicht sehr wohl
  });

  it('mehrdeutige Kürzel fehlen — lieber Text als der falsche von zweien', () => {
    // Konstruiert, weil der Fall im Korpus je Kanton selten ist: zwei Erlasse
    // desselben Kantons mit demselben Kandidaten ⇒ der Eintrag verschwindet,
    // AUCH wenn später ein dritter dazukommt.
    const e = (key: string, kuerzel: string): BrowseErlass => ({
      ...register.erlasse.find((x) => x.key === 'BS-131.100')!, key, kuerzel,
    });
    const karte = baueKantonKuerzelKarte([e('BS-1', 'XYZ'), e('BS-2', 'XYZ'), e('BS-3', 'XYZ')], 'BS', 'BS-9');
    expect(karte?.get('XYZ')).toBeUndefined();
  });

  it('nur lesbare Ziele: ein Eintrag ohne Snapshot wird nicht verlinkt (§8)', () => {
    const basis = register.erlasse.find((x) => x.key === 'BS-131.100')!;
    const karte = baueKantonKuerzelKarte(
      [{ ...basis, key: 'BS-7', kuerzel: 'QQQ', status: 'live-link' as BrowseErlass['status'] }], 'BS', 'BS-9',
    );
    expect(karte?.get('QQQ')).toBeUndefined();
  });

  it('Kandidaten-Regel: EIN Wort, ≥2 Zeichen, gross beginnend', () => {
    expect(kuerzelKandidaten('Behindertenfinanzierungsgesetz; BeFiG'))
      .toEqual(['Behindertenfinanzierungsgesetz', 'BeFiG']);
    expect(kuerzelKandidaten('Dekret über den Notariatstarif')).toEqual([]);
    expect(kuerzelKandidaten('EG SVG')).toEqual([]);
    expect(kuerzelKandidaten('IWB-Gesetz')).toEqual(['IWB-Gesetz']);
    expect(kuerzelKandidaten('EG/ELG')).toEqual(['EG/ELG']);
  });
});

describe('V-4 — Aussen-Anzeige nur dort, wo es ein «innen» gibt', () => {
  it('der Fedlex-Fremd-Chip im Lesetext trägt das Aussen-Zeichen', () => {
    const out = ssr(<NormText text="Massgeblich ist Art. 336c OR." intern={refs('bund/AHVG')} />);
    expect(out).toMatch(/<a [^>]*class="[^"]*lc-verweis-aussen"/);
  });

  it('der Sprung im gelesenen Erlass trägt es NICHT', () => {
    const out = ssr(<NormText text="Die Frist nach Art. 5 beginnt." intern={refs('bund/AHVG')} />);
    expect(out).toContain('/gesetze/bund/AHVG#art-5"');
    expect(out).not.toContain('lc-verweis-aussen');
  });

  it('ohne Lesesicht (kein intern) bleibt die Auszeichnung der ganzen Site unverändert', () => {
    // Reichweiten-Grenze: NormText steht auch in Tarif-Hinweisen und
    // Vorlagen-Texten (~20 prerenderte Seiten). Dort gibt es kein «innen».
    const out = ssr(<NormText text="Massgeblich ist Art. 336c OR." />);
    expect(out).not.toContain('lc-verweis-aussen');
  });

  it('die Klasse ist additiv — die Ruhe-Anatomie bleibt unverändert', () => {
    expect(VERWEIS_AUSSEN_CLASS.startsWith('underline decoration-dotted underline-offset-2')).toBe(true);
    expect(VERWEIS_AUSSEN_CLASS).toContain('lc-verweis-aussen');
  });

  it('das Zeichen ist kein Textknoten — sonst wanderte es beim Kopieren mit (§1)', () => {
    const out = ssr(<NormText text="Massgeblich ist Art. 336c OR." intern={refs('bund/AHVG')} />);
    expect(nurText(out)).toBe('Massgeblich ist Art. 336c OR.');
    expect(out).not.toContain('↗');
  });

  it('und es ist in index.css als Form-Signal definiert (nicht als Farbe)', () => {
    const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');
    expect(css).toContain('.lc-verweis-aussen::after');
    expect(css).toMatch(/\.lc-verweis-aussen::after\s*\{[^}]*content:\s*'↗'/);
    // Die Schrift gehört zur RICHTIGKEIT, nicht zur Kosmetik: die Lese-Serife
    // führt U+2197 nicht, Chrome setzte den Ersatzglyph mit Vorschub 0 und malte
    // ihn 32 px LINKS vom Verweis (gemessen 31.8.2026 im gebauten Stand). Ohne
    // diese Zeile steht der Pfeil wieder vor statt hinter dem Verweis.
    expect(css).toMatch(/\.lc-verweis-aussen::after\s*\{[\s\S]*?font-family:\s*var\(--font-sans\)/);
    // Und `display: inline`: als `inline-block` mass derselbe Kasten im Lesetext
    // 0 px, und der Pfeil landete 32 px LINKS vom Verweis (gemessen ebenda).
    expect(css).toMatch(/\.lc-verweis-aussen::after\s*\{[\s\S]*?display:\s*inline;/);
  });
});
