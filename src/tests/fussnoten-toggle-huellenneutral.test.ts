/**
 * Die Fussnoten-Weiche der Ansicht — hüllenneutrale CSS-Regel
 * (`.lc-leser`-Scope, kein React-Zweig im Artikel-Baum).
 *
 * ANLASS (Treuebruch 16.8.2026, gemessen, PR #539 / Stand 5e90082e3): Die Regel
 * suchte den Fussnoten-MARKER über seinen ACCESSIBLE NAME
 * (`button[aria-label^="Fussnote"]`) und traf damit in V3 auch den SCHALTER im
 * Ansicht-Menü («Fussnoten (283)») — er blendete sich selbst aus. Der Fix
 * verengte den Selektor damals auf `#lc-lesespalte`. Gemessen an der damaligen
 * Ist-Hülle (BGBM, localhost-Preview, inzwischen mit H5 gelöscht): 4 von 29
 * Marker-Buttons lagen AUSSERHALB `#lc-lesespalte` (Erlasskopf/Ingress) — die
 * Verengung schaltete dort still ab und verletzte die damalige Zusage FL-4
 * (ohne Flag bitgleich).
 *
 * WURZEL-FIX: Der Marker trägt eine eigene Kennung `data-fn-ref`
 * (`src/components/normtext/ArtikelBody.tsx`); die CSS-Regel greift darüber und
 * gar nicht mehr über Text. Der Schalter trägt die Kennung nicht.
 *
 * ── §6.3-DEKLARATION (D35-F3, Entscheid David 7.9.2026) ─────────────────────
 * Der bewachte Regelblock hiess bis 7.9.2026 `html[data-fussnoten="aus"]`. Ihn
 * gibt es nicht mehr: die Ansicht trägt seither EINE dreiwertige Wahl
 * (`html[data-vermerke]`), und keine ihrer Stellungen blendet den amtlichen
 * Apparat als GANZES aus (verlustfrei). Die Zahlen und der Anlass oben bleiben
 * unverändert stehen (§0 Ziff. 2b) — bewacht wird jetzt die Regel, die an ihre
 * Stelle getreten ist, und zusätzlich H0-Auflage 1: `A` ist die EINZIGE
 * Fussnoten-Klasse, die eine Ansicht dämpfen darf.
 *
 * Dieses Tor hält den Mechanismus fest, der ursprünglich bis zur CI unbemerkt
 * blieb — es ist billiger als ein zweites e2e.
 *
 * ROT ZU BEKOMMEN (§6.7): in `src/index.css` `.lc-leser ` aus einem der
 * A-Selektoren streichen (Fall 3), `[data-fn-klasse="V"]` danebenschreiben
 * (Fall 5) oder `data-fn-ref` aus `ArtikelBody.tsx` entfernen (Fall 4).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const css = readFileSync(fileURLToPath(new URL('../index.css', import.meta.url)), 'utf8');
const artikelBody = readFileSync(
  fileURLToPath(new URL('../components/normtext/ArtikelBody.tsx', import.meta.url)),
  'utf8',
);

/** Anker: der erste ECHTE Selektor der Dämpfungs-Regel (nicht ihr Kommentar). */
const ANKER = 'html[data-vermerke="fassung"] .lc-leser [data-fn-klasse="A"]';

/** Die Selektor-Liste des Dämpfungs-Blocks (bis zur öffnenden `{`). */
function daempfSelektoren(): string[] {
  const start = css.indexOf(ANKER);
  expect(start, `Regelblock ${ANKER} fehlt in src/index.css`).toBeGreaterThan(-1);
  const ende = css.indexOf('{', start);
  expect(ende).toBeGreaterThan(start);
  return css
    .slice(start, ende)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

describe('Die Ansicht-Weiche dämpft hüllenneutral und nur die Klasse A', () => {
  it('kein Selektor sucht den Marker über seinen accessible name (aria-label)', () => {
    const ueberText = daempfSelektoren().filter((s) => s.includes('aria-label'));
    expect(
      ueberText,
      'CSS darf Elemente nicht über ihren Text suchen — sonst trifft die Regel den Schalter mit',
    ).toEqual([]);
  });

  it('kein Selektor ist auf einen hüllen-spezifischen Wrapper gescopt', () => {
    // `.lc-leser` ist der einzige Wurzelknoten, den BEIDE Hüllen tragen.
    // `#lc-lesespalte` gibt es zwar in beiden, aber Erlasskopf/Ingress liegen
    // ausserhalb davon — ein Scope darauf verliert Marker (gemessen: 4/29 BGBM).
    const engeScopes = daempfSelektoren().filter((s) => s.includes('#lc-lesespalte'));
    expect(
      engeScopes,
      'Erlasskopf/Ingress liegen ausserhalb #lc-lesespalte — dort schaltet die Weiche sonst nicht',
    ).toEqual([]);
  });

  it('jeder Selektor ist auf .lc-leser gescopt (nur der Gesetzes-Reader, nie das Norm-Popover)', () => {
    for (const s of daempfSelektoren()) {
      expect(s, `Selektor ohne .lc-leser-Scope: ${s}`).toContain('.lc-leser ');
    }
  });

  it('die Marker-Kennung data-fn-ref bleibt gesetzt (der Wurzel-Fix von 16.8.2026)', () => {
    // Sie trägt seit D35-F3 keine Dämpfungs-Regel mehr — sie ist der NACHWEIS,
    // dass der Marker eine eigene, textfreie Kennung hat, an der eine künftige
    // Regel ansetzen kann, ohne wieder über den Accessible Name zu greifen.
    expect(artikelBody, 'ArtikelBody setzt data-fn-ref nicht mehr').toMatch(/data-fn-ref\b/);
  });

  it('H0-Auflage 1: KEINE Regel dämpft eine andere Fussnoten-Klasse als A', () => {
    // `V` (Verweis/Substanz), `G` (Grauzone), `Z` (Publikationsnachweis) und `U`
    // (unklar) sind amtlicher Nicht-Änderungs-Apparat. Sie zu verstecken wäre
    // Substanzverlust (§7/§8) — gemessen am ZPO-Apparat 99 von 311 Einträgen.
    // `includes` statt `not.toContain(css)`: der Diff einer 4100-Zeilen-Datei
    // im Fehlerbild ist unlesbar (und teuer) — der Satz sagt alles (T5).
    for (const kl of ['V', 'G', 'Z', 'U']) {
      expect(
        css.includes(`[data-fn-klasse="${kl}"]`),
        `src/index.css selektiert [data-fn-klasse="${kl}"] — H0-Auflage 1 verletzt`,
      ).toBe(false);
    }
  });

  it('die Menü-Bausteine tragen die Marker-Kennung nicht (sonst blenden sie sich selbst aus)', () => {
    // `LeserAnsichtMenu.tsx` (Ist-Hülle) gelöscht 21.8.2026 (H5).
    for (const datei of [
      '../pages/gesetz-leser/v3/LeserAnsichtV3.tsx',
      '../pages/gesetz-leser/v3/LeserAenderungsWahl.tsx',
    ]) {
      const quelle = readFileSync(fileURLToPath(new URL(datei, import.meta.url)), 'utf8');
      expect(quelle, `${datei} trägt data-fn-ref — die Wahl blendet sich selbst aus`).not.toMatch(
        /data-fn-ref\b/,
      );
      expect(quelle, `${datei} trägt data-fn-klasse — die Wahl blendet sich selbst aus`).not.toMatch(
        /data-fn-klasse\b/,
      );
    }
  });
});
