import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NormText, type InternRefs } from '../components/NormText';
import { LocaleProvider } from '../components/locale';

// ═══ W2·20-VERWEIS-SCHAERFE · V-6 — Passus-Asymmetrie im Art.-Pfad ══════════
//
// BEFUND (V-3/V-4-Bericht 31.8.2026, nachgemessen 31.8.2026): der M12-Guard
// prüfte den ROHEN Text hinter «Art. N», die V-2-Selbstmarker-Weiche dagegen
// den Text nach dem PASSUS. Dieselbe Stelle, zwei Rest-Definitionen — und die
// Fremd-Vermutung sah das Gesetzes-Kürzel nicht, sobald ein Passus- oder
// Aufzählungsglied dazwischenstand. Produktions-Beleg: OR Art. 973g zitiert
// «(Art. 895–898 ZGB)» und bekam einen Self-Link auf /gesetze/bund/OR#art-895
// — ein plausibel-falscher Link auf einen ZGB-Artikel im OR (§1).
//
// FIX: der M12-Guard prüft ZUSÄTZLICH den Rest nach `PARAGRAF_ANHANG` — exakt
// die Rest-Definition, die `selbstSignalAmZitat` schon nutzt (§5, eine
// Definition statt zweier). ODER-Semantik, nicht Ersetzung: der Guard greift
// weiterhin auf dem rohen Rest. Die Herleitung samt Messung steht am Guard
// selbst (NormText.tsx); hier stehen die BEWEISE.
//
// GEMESSEN 31.8.2026 über alle 1458 Snapshots (Blöcke + Items) mit den echten
// Guards: 446 Stellen in 121 Erlassen wechseln SELF → TEXT, kein einziger
// echter Self-Link und kein Fremd-Link geht verloren (Entscheidwechsel
// insgesamt: 446, alle in dieselbe Richtung).
//
// Fixtures sind ECHTE Snapshot-Texte (public/normtext, nur gelesen).

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

function refs(rel: string, opts: Partial<InternRefs> = {}): InternRefs {
  const tokenMap = new Map<string, string>();
  for (const e of lade(rel).eintraege) tokenMap.set(e.artikel.toLowerCase().replace(/[^a-z0-9]/g, ''), e.artikel);
  const [ebene, key] = rel.split('/');
  return { tokenMap, basisPfad: `/gesetze/${ebene}/${key}`, springeZu: () => {}, ...opts };
}
/** Sichtbarer Text = Eingabe (die Weiche fügt nur Anker-Hüllen hinzu, §1). */
const nurText = (html: string) => html.replace(/<[^>]*>/g, '');

describe('V-6 — der M12-Guard sieht das Kürzel auch HINTER dem Passus', () => {
  it('OR Art. 973g: «(Art. 895–898 ZGB)» bekommt keinen Self-Link auf OR art-895', () => {
    const text = snapshotText('bund/OR', '973_g', 'Art. 895');
    expect(text).toContain('Art. 895–898 ZGB');
    const out = ssr(<NormText text={text} intern={refs('bund/OR')} />);
    expect(out).not.toContain('/gesetze/bund/OR#art-895"');
    expect(nurText(out)).toBe(text);
  });

  it('AIG Art. 80a: «Artikel 17 Absatz 3 AsylG» bekommt keinen Self-Link auf AIG art-17', () => {
    // Bis V-6 fror `normText-selbstmarker.test.tsx` diesen Fall als
    // «Ehrlichkeits-Sonde» ein (der Test verlangte den falschen Link, damit
    // die Lücke sichtbar bleibt). Er ist mit V-6 geschlossen: «AsylG» steht
    // nicht in der FEDLEX-Tabelle (N2 greift nicht), aber es trägt zwei
    // Grossbuchstaben — der M12-Guard sieht es, sobald er hinter «Absatz 3»
    // blickt. Deklarierte fachliche Korrektur (§6.3), kein Refactoring.
    const text = snapshotText('bund/AIG', '80_a', 'des vorliegenden Gesetzes');
    expect(text).toContain('Artikel 17 Absatz 3 AsylG');
    const out = ssr(<NormText text={text} intern={refs('bund/AIG')} />);
    expect(out).not.toContain('/gesetze/bund/AIG#art-17"');
    // Der Selbstmarker derselben Stelle bleibt unberührt (V-2).
    expect(out).toContain('/gesetze/bund/AIG#art-66"');
    expect(nurText(out)).toBe(text);
  });

  it('MEPV Art. 66: «Artikel 22 Absätze 1 und 3 EU-MDR» springt nicht in die MEPV', () => {
    const text = snapshotText('bund/MEPV', '66', 'EU-MDR');
    const out = ssr(<NormText text={text} intern={refs('bund/MEPV')} />);
    expect(out).not.toContain('/gesetze/bund/MEPV#art-22"');
  });
});

describe('V-6 — Abgrenzung: echte Self-Verweise bleiben verlinkt', () => {
  it('URG Art. 20: «Artikel 19 Absatz 2 Werke …» bleibt ein Self-Sprung', () => {
    // EIN Grossbuchstabe am gewöhnlichen Substantiv — M12 verlangt zwei bzw.
    // eine Binnenmajuskel. Genau diese Grenze schützt den Self-Verweis, wenn
    // der Guard neu hinter den Passus blickt.
    const text = snapshotText('bund/URG', '20', 'Artikel 19 Absatz 2 Werke');
    const out = ssr(<NormText text={text} intern={refs('bund/URG')} />);
    expect(out).toContain('/gesetze/bund/URG#art-19"');
    expect(nurText(out)).toBe(text);
  });

  it('HREGV Art. 57: «Artikel 46 Absatz 3 Buchstabe d und 48 Absatz 1 Buchstabe i Anwendung»', () => {
    const text = snapshotText('bund/HREGV', '57', 'Absatz 1 Buchstabe i Anwendung');
    const out = ssr(<NormText text={text} intern={refs('bund/HREGV')} />);
    expect(out).toContain('/gesetze/bund/HREGV#art-46"');
  });

  it('«Art. N Absatz 2» ohne alles danach bleibt ein Self-Sprung', () => {
    const intern = refs('bund/URG');
    for (const t of ['Vorbehalten bleibt Artikel 19 Absatz 2.', 'Es gilt Art. 19 Abs. 2 Buchstabe a.',
      'Massgebend sind Artikel 19 und 20.']) {
      expect(ssr(<NormText text={t} intern={intern} />)).toContain('/gesetze/bund/URG#art-19"');
    }
  });

  it('das Passus-Wort selbst ist nie ein M12-Kürzel («Absatz», «Buchstabe», «Ziffer», «Satz»)', () => {
    const intern = refs('bund/URG');
    for (const w of ['Absatz 2', 'Absätze 2 und 3', 'Buchstabe a', 'Buchstaben a–e', 'Ziffer 3', 'Satz 2']) {
      expect(ssr(<NormText text={`Nach Artikel 19 ${w} gilt Folgendes.`} intern={intern} />))
        .toContain('/gesetze/bund/URG#art-19"');
    }
  });
});

describe('V-6 — bewusst NICHT erweitert: der des/der/über-Guard', () => {
  // Gemessen 31.8.2026: derselbe Umbau am des/der-Guard verschöbe 812 weitere
  // Self-Stellen — aber die Stichprobe (26 systematisch gezogene) zeigt 5
  // ECHTE Selbstverweise darunter (BV, NW-521.1, UVPV, VSTV, VTS ≈ 19 %).
  // «des/der/über» ist ein WEICHES Signal: hinter dem Passus steht dort oft
  // gewöhnliche Prosa («Absatz 1 der Quellensteuer unterliegen», «Absatz 1
  // über ein Projekt»). M12 dagegen verlangt zwei Grossbuchstaben — ein
  // hartes Kürzel-Signal. Erweitert wird nur das harte (§1: kein Link ist
  // besser als ein falscher, aber ein RICHTIGER Link ist besser als keiner).
  it('UVPV Art. 6a: «Artikel 5 Absatz 1 über ein Projekt» bleibt ein Self-Sprung', () => {
    const text = snapshotText('bund/UVPV', '6_a', 'über ein Projekt');
    expect(ssr(<NormText text={text} intern={refs('bund/UVPV')} />)).toContain('/gesetze/bund/UVPV#art-5"');
  });

  it('VTS Art. 222m: «Artikel 109 Absatz 1bis über die Tagfahrlichter» bleibt ein Self-Sprung', () => {
    const text = snapshotText('bund/VTS', '222_m', 'Tagfahrlichter');
    expect(ssr(<NormText text={text} intern={refs('bund/VTS')} />)).toContain('/gesetze/bund/VTS#art-109"');
  });
});

describe('V-6 — ODER-Semantik: keine Fremd-Erkennung geht verloren', () => {
  it('AHVV Art. 18: «Artikel 9 Absatz 2 Buchstaben a–e AHVG» bleibt unterdrückt (N2)', () => {
    // Der Passus-Überleser bricht bei «Buchstaben a–e» hinter dem «a» ab
    // («–e» ist kein Zahlenglied) — der Rest lautet «–e AHVG» und trägt kein
    // führendes Leerzeichen, das M12 und N2 verlangen. Nur weil der Guard
    // AUCH den rohen Rest prüft (ODER, nicht Ersetzung), greift N2 hier
    // weiterhin. Eine reine Ersetzung machte daraus einen Self-Link auf
    // AHVV art-9 — 150 solcher Stellen im Korpus (gemessen 31.8.2026).
    const text = snapshotText('bund/AHVV', '18', 'Buchstaben a–e AHVG');
    expect(ssr(<NormText text={text} intern={refs('bund/AHVV')} />)).not.toContain('/gesetze/bund/AHVV#art-9"');
  });

  it('IVG Art. 66 unter AHVG-Chapeau: «Art. 53–70 AHVG» führt weiter aufs AHVG', () => {
    // Im Fremdgesetz-Chapeau (M6-D) ruht die Erweiterung: das genannte Kürzel
    // IST dort das Chapeau-Ziel, und der Guard würde einen RICHTIGEN
    // Fremd-Link unterdrücken. Gemessen: 7 solche Stellen (ELG, EOG, IVG,
    // BS-154.200) — alle nennen exakt das Chapeau-Gesetz.
    const text = snapshotText('bund/IVG', '66', 'Art. 53–70 AHVG');
    const out = ssr(<NormText text={text} intern={{ ...refs('bund/IVG'), fremdKuerzel: 'AHVG' }} />);
    expect(out).not.toContain('/gesetze/bund/IVG#art-53"');
    expect(out).toContain('#art_53'); // Fedlex-Anker des AHVG
  });
});
