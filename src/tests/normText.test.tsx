import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NORM_IM_TEXT, FEDLEX } from '../lib/fedlex';
import { NormText, type InternRefs } from '../components/NormText';
import { LocaleProvider } from '../components/locale';

// Inline-Norm-Auto-Linker (Auftrag David 17.6.2026): jeder im Fliesstext
// genannte Bund-Normverweis wird zum Popover-Trigger; der Text bleibt
// zeichenidentisch, nicht auflösbare Nennungen bleiben Text (kein toter Link).

// matchAll-Helfer: alle Treffer-Strings der globalen Regex (frischer lastIndex).
const treffer = (s: string) => Array.from(s.matchAll(NORM_IM_TEXT), (m) => m[0]);

describe('NORM_IM_TEXT — Bund-Normverweise im Fliesstext', () => {
  it('findet einfachen Verweis', () => {
    expect(treffer('Frist nach Art. 335c OR beachten')).toEqual(['Art. 335c OR']);
  });

  it('findet Verweis mit Abs./lit./Ziff.-Kette', () => {
    expect(treffer('vgl. Art. 8a Abs. 3 lit. d SchKG hier')).toEqual(['Art. 8a Abs. 3 lit. d SchKG']);
    expect(treffer('siehe Art. 629 Abs. 2 Ziff. 2 OR.')).toEqual(['Art. 629 Abs. 2 Ziff. 2 OR']);
  });

  it('lateinische Suffixe und Buchstaben-Artikel', () => {
    expect(treffer('Art. 336c OR und Art. 35a VVG')).toEqual(['Art. 336c OR', 'Art. 35a VVG']);
  });

  it('Mehrwort-Gesetz «GebV SchKG» wird ganz erfasst (nicht nur SchKG)', () => {
    expect(treffer('Gebühr nach Art. 16 Abs. 1 GebV SchKG')).toEqual(['Art. 16 Abs. 1 GebV SchKG']);
  });

  it('StGB vor StG (Suffix-Kollision)', () => {
    expect(treffer('Art. 97 StGB und Art. 8 StG')).toEqual(['Art. 97 StGB', 'Art. 8 StG']);
  });

  it('findet mehrere Verweise in einem Satz', () => {
    expect(treffer('Art. 19 OR sowie Art. 131 ZPO gelten')).toEqual(['Art. 19 OR', 'Art. 131 ZPO']);
  });

  it('greift NICHT auf «§ N» (kantonal, ohne Erlass-Kontext)', () => {
    expect(treffer('§ 4 Abs. 1 und § 8 GOG')).toEqual([]);
  });

  it('greift NICHT auf Art.-Nennung ohne bekanntes Gesetz', () => {
    expect(treffer('Art. 5 Abs. 2 der Verordnung')).toEqual([]);
    expect(treffer('Art. 8 ZZG')).toEqual([]);
  });

  it('läuft nicht über einen zweiten «Art.» hinaus', () => {
    expect(treffer('Art. 1 und Art. 19 OR')).toEqual(['Art. 19 OR']);
  });
});

const ssr = (el: React.ReactElement) => renderToString(<LocaleProvider>{el}</LocaleProvider>);

describe('NormText — Inline-Render (SSR/Prerender)', () => {
  it('verlinkt einen auflösbaren Verweis als Inline-<a> (kein Pillen-Chip)', () => {
    const out = ssr(<NormText text="Kündigungsfrist nach Art. 335c OR." />);
    expect(out).toContain('<a');
    expect(out).toMatch(/href="[^"]*fedlex[^"]*#art_335_c"/);
    expect(out).toContain('decoration-dotted');
    expect(out).not.toContain('lc-chip');
    // Text bleibt zeichenidentisch (nur <a>-Hülle dazwischen).
    expect(out).toContain('Kündigungsfrist nach ');
    expect(out).toContain('Art. 335c OR');
    expect(out).toContain('.');
  });

  it('kein Popover/Overlay im SSR (offen=false initial)', () => {
    const out = ssr(<NormText text="Art. 335c OR" />);
    expect(out).not.toContain('role="dialog"');
    expect(out).not.toContain('aria-modal');
  });

  it('nicht auflösbarer Verweis bleibt reiner Text (kein <a>)', () => {
    const out = ssr(<NormText text="Frist nach § 4 GebVN beachten" />);
    expect(out).not.toContain('<a');
    expect(out).toContain('§ 4 GebVN');
  });

  it('mischt verlinkte und reine Text-Stellen korrekt', () => {
    const out = ssr(<NormText text="Art. 19 OR, nicht § 3, aber Art. 131 ZPO" />);
    expect(out).toMatch(/#art_19/);
    expect(out).toMatch(/#art_131/);
    expect(out).toContain('nicht § 3, aber ');
  });
});

// i.V.m.-Ketten-Verlinkung (Bug David 3.7.2026, Referenz BGE 151 III 377): das
// Kürzel am Ketten-Ende wird auf vorangehende bare Glieder propagiert; jedes
// Glied wird EINZELN verlinkt, die Anzeige bleibt zeichenidentisch.
describe('NormText — i.V.m.-Ketten (Verweis-Präzision)', () => {
  it('«Art. 684 i.V.m. Art. 679 ZGB»: BEIDE Glieder verlinkt (684 → #art_684, 679 → #art_679)', () => {
    const out = ssr(<NormText text="klagen (Art. 684 i.V.m. Art. 679 ZGB)." />);
    expect(out).toMatch(/href="[^"]*#art_684"/);   // vorher unverlinkt (Bug)
    expect(out).toMatch(/href="[^"]*#art_679"/);
    // Anzeige zeichenidentisch: das bare Glied zeigt genau «Art. 684» (kein «ZGB» dazu).
    expect(out).toContain('>Art. 684<');
    expect(out).toContain('i.V.m. ');
  });

  it('umgekehrte Richtung «Art. 679 i.V.m. Art. 684 ZGB»: 679 (bare) wird verlinkt', () => {
    const out = ssr(<NormText text="nach Art. 679 i.V.m. Art. 684 ZGB vorzugehen." />);
    expect(out).toMatch(/href="[^"]*#art_679"/);
    expect(out).toMatch(/href="[^"]*#art_684"/);
    expect(out).toContain('>Art. 679<');
  });

  it('fremdes Kürzel dazwischen wird NICHT umgehängt (§1): «Art. 5 OR und Art. 6 ZGB»', () => {
    const out = ssr(<NormText text="Art. 5 OR und Art. 6 ZGB gelten." />);
    // Art. 5 bleibt OR (die OR-eli-Basis vor #art_5), Art. 6 bleibt ZGB — nie ZGB auf Art. 5.
    const orId = FEDLEX.OR.match(/eli\/cc\/([^/]+)/)![1];
    const zgbId = FEDLEX.ZGB.match(/eli\/cc\/([^/]+)/)![1];
    expect(out).toMatch(new RegExp(`href="[^"]*${orId}[^"]*#art_5"`));
    expect(out).toMatch(new RegExp(`href="[^"]*${zgbId}[^"]*#art_6"`));
  });

  it('Negativfall bleibt Text: «Art. 5 der Verordnung» erzeugt keinen Link', () => {
    const out = ssr(<NormText text="Art. 5 der Verordnung gilt hier." />);
    expect(out).not.toContain('<a');
    expect(out).toContain('Art. 5 der Verordnung');
  });
});

// Interne Querverweise (Lesesicht, intern-Prop): bare «Art. N» → Sprung-Link auf
// denselben Erlass. Regression zu den Bug-Check-Funden 19.6.2026 (bis/ter-Suffix
// abgeschnitten + Fremdgesetz-Backtracking).
describe('NormText — interne Artikel-Sprünge (intern)', () => {
  // tokenMap wie im Reader: normalisierter Ref → Artikel-Token. Enthält bewusst
  // die Kollision «122_bis»/«122_b» (real in SG-811.1).
  const tokenMap = new Map<string, string>([
    ['122bis', '122_bis'], ['122b', '122_b'], ['6a', '6_a'], ['5', '5'], ['20', '20'], ['329gbis', '329g_bis'],
  ]);
  const intern: InternRefs = { tokenMap, basisPfad: '/gesetze/kanton/SG-811.1', springeZu: () => {} };

  it('«Art. 122bis» springt auf 122_bis (NICHT 122_b)', () => {
    const out = ssr(<NormText text="vgl. Art. 122bis hier" intern={intern} />);
    expect(out).toContain('href="/gesetze/kanton/SG-811.1#art-122_bis"');
    expect(out).not.toContain('#art-122_b"');
    expect(out).toContain('Art. 122bis');
  });

  it('Buchstabe+lat. Suffix «Art. 329gbis» vollständig erfasst', () => {
    const out = ssr(<NormText text="nach Art. 329gbis usw." intern={intern} />);
    expect(out).toContain('#art-329g_bis"');
  });

  it('bare «Art. 6a» und «Art. 5» werden intern verlinkt', () => {
    expect(ssr(<NormText text="gemäss Art. 6a" intern={intern} />)).toContain('#art-6_a"');
    expect(ssr(<NormText text="siehe Art. 5 oben" intern={intern} />)).toContain('#art-5"');
  });

  it('benannter Fremderlass «Art. 20 des OR» wird NICHT intern verlinkt', () => {
    const out = ssr(<NormText text="Art. 20 des OR bleibt extern" intern={intern} />);
    expect(out).not.toContain('#art-');
    expect(out).toContain('Art. 20 des OR');
  });

  it('ohne intern-Prop entstehen keine internen Sprung-Links', () => {
    const out = ssr(<NormText text="gemäss Art. 6a hier" />);
    expect(out).not.toContain('#art-6_a');
  });

  // M12 (§1/§6): bare «Artikel N ‹KÜRZEL›» = Fremd-/Trägergesetz-Verweis, kein
  // Self-Verweis → falscher Self-Sprunglink wird unterdrückt (BGerR-Befund).
  it('«Artikel 5 BGG» (ausgeschrieben + Kürzel) wird NICHT self-verlinkt', () => {
    const out = ssr(<NormText text="richtet sich nach Artikel 5 BGG sinngemäss" intern={intern} />);
    expect(out).not.toContain('#art-5"');
    expect(out).toContain('Artikel 5 BGG'); // Text bleibt erhalten
  });

  it('«Artikel 20 OR» wird NICHT self-verlinkt (Trägergesetz)', () => {
    const out = ssr(<NormText text="gemäss Artikel 20 OR gilt" intern={intern} />);
    expect(out).not.toContain('#art-20"');
  });

  it('«Artikel 5 Absatz 2» (EIN Grossbuchstabe) bleibt ein Self-Sprung', () => {
    const out = ssr(<NormText text="nach Artikel 5 Absatz 2 hier" intern={intern} />);
    expect(out).toContain('#art-5"');
  });

  // N2 (Bündel N): die AUSGESCHRIEBENE Passus-Form «Artikel N Absatz X … GESETZ»
  // (727 Fälle im Bund-Korpus) entging der alten Sofort-Kürzel-Regel und erzeugte
  // einen falschen Self-Link (Bsp. AHVV «Artikel 1a Absatz 1 … AHVG» → AHVV art 1a
  // statt AHVG). Jetzt unterdrückt.
  it('«Artikel 5 Absatz 2 Buchstabe c AHVG» wird NICHT self-verlinkt (ausgeschrieben)', () => {
    const out = ssr(<NormText text="richtet sich nach Artikel 5 Absatz 2 Buchstabe c AHVG weiter" intern={intern} />);
    expect(out).not.toContain('#art-5"');
    expect(out).toContain('Artikel 5 Absatz 2 Buchstabe c AHVG');
  });

  it('«Artikel 5 Absatz 2 des IVG» wird NICHT self-verlinkt (Präpositions-Form)', () => {
    const out = ssr(<NormText text="gemäss Artikel 5 Absatz 2 des IVG gilt" intern={intern} />);
    expect(out).not.toContain('#art-5"');
  });

  it('§1-Präzision: «Artikel 5 Absatz 2 und die Bestimmungen des OR» BLEIBT self-verlinkt', () => {
    // Der Fremdgesetz-Name gehört zu einem SEPARATEN Verweis, nicht zum «Artikel 5»-
    // Zitat → «Artikel 5 Absatz 2» ist ein echter Self-Verweis und bleibt verlinkt.
    const out = ssr(<NormText text="nach Artikel 5 Absatz 2 und die Bestimmungen des OR" intern={intern} />);
    expect(out).toContain('#art-5"');
  });

  it('eigenes Kürzel ist KEIN Fremdgesetz: «Artikel 5 Absatz 2 AHVG» in AHVG bleibt self', () => {
    // Nennt der Verweis exakt das Kürzel DIESES Erlasses, ist es ein Self-Verweis
    // und bleibt verlinkt (Fremdgesetz-Erkennung greift nur bei anderem Kürzel).
    const internEigen: InternRefs = { tokenMap, basisPfad: '/gesetze/bund/AHVG', springeZu: () => {} };
    const out = ssr(<NormText text="nach Artikel 5 Absatz 2 AHVG hier" intern={internEigen} />);
    expect(out).toContain('#art-5"');
  });

  // QS-GP-Regression (1.7.): Register-Schlüssel «FINFRAV_FINMA» (Unterstrich) vs.
  // FEDLEX-Key «FinfraV-FINMA» (Bindestrich) — vor der Normalisierung unterdrückte
  // ein Gesetz mit getrenntem Kürzel seinen EIGENEN Self-Verweis fälschlich.
  it('getrennt-benanntes Kürzel: «Artikel 5 Absatz 2 FinfraV-FINMA» in FINFRAV_FINMA bleibt self', () => {
    const internSep: InternRefs = { tokenMap, basisPfad: '/gesetze/bund/FINFRAV_FINMA', springeZu: () => {} };
    const out = ssr(<NormText text="Meldepflicht nach Artikel 5 Absatz 2 FinfraV-FINMA in der Fassung" intern={internSep} />);
    expect(out).toContain('#art-5"');
  });
});
