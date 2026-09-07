import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { InhaltsKopf } from '../components/layout/InhaltsKopf';
import { PaneKopf } from '../components/layout/PaneKopf';
import { OrtsAngabe } from '../components/layout/OrtsAngabe';
import type { KopfDaten } from '../components/layout/InhaltsKopfKontext';

// ─── A-4 (W2·19-DESIGN-KONSISTENZ, 31.8.2026) · EINE ORTSANGABE ─────────────
//
// Die Frage «wo bin ich?» wurde in zwei Leisten in zwei Anatomien beantwortet
// (Gegenüberstellung des Vorzustands im Kopf von `layout/OrtsAngabe.tsx`).
// Diese Sonden prüfen, dass beide Leisten dieselbe Anatomie AUS DERSELBEN
// QUELLE ziehen — nicht, dass sie zufällig gleich aussehen.
//
// ROT ZU BEKOMMEN (§6.7, am 31.8.2026 gesehen): in `PaneKopf.tsx` den
// `<OrtsAngabe>`-Aufruf wieder durch die eigene Krumen-Schleife ersetzen (die
// Paritäts-Fälle fallen), oder in `OrtsAngabe.tsx` `@md/ort:` durch `sm:`
// zurückdrehen (die Kaskaden-Sonde fällt).

const noop = () => {};

const KRUMEN = [
  { label: 'Gesetze', to: '/gesetze' },
  { label: 'Bund', to: '/gesetze' },
  { label: 'StPO' },
];
const MIT_KRUME: KopfDaten = { breadcrumb: KRUMEN, stand: '01.04.2025', artikel: 'Art. 429 StPO' };

function inhaltsKopfHtml(daten: KopfDaten = MIT_KRUME): string {
  return renderToString(
    <MemoryRouter>
      <InhaltsKopf daten={daten} breiteKlasse="max-w-content" onSchliessen={noop} />
    </MemoryRouter>,
  );
}

function paneKopfHtml(extra: Record<string, unknown> = {}): string {
  return renderToString(
    <PaneKopf rolle="sekundaer" label="StPO" stand="01.04.2025" artikel="Art. 429 StPO"
      breadcrumb={KRUMEN} onBreadcrumb={noop} onSchliessen={noop} onHauptfenster={noop} {...extra} />,
  );
}

/** Klassenzeichenkette des <nav>-Elements — die Anatomie der Zone selbst. */
function navKlassen(html: string): string {
  const m = /<nav[^>]*class="([^"]*)"/.exec(html);
  return m ? m[1] : '';
}

describe('A-4 — Ortsangabe: EINE Anatomie in beiden Leisten', () => {
  it('POSITIV-SONDE: beide Leisten zeigen die Kette überhaupt', () => {
    expect(inhaltsKopfHtml()).toContain('Gesetze');
    expect(paneKopfHtml()).toContain('Gesetze');
  });

  it('beide tragen die IDENTISCHE Zonen-Anatomie (Schriftgrad, Kaskade, Overflow)', () => {
    const einzel = navKlassen(inhaltsKopfHtml());
    const pane = navKlassen(paneKopfHtml());
    expect(einzel, 'die Einzelansicht hat gar keine Ortsangabe-Zone mehr').not.toBe('');
    expect(pane).toBe(einzel);
    // Der frühere Bruch, benannt: text-xs ist Kanon, text-body-s war die Kopie.
    expect(pane).toContain('text-xs');
    expect(pane).toContain('@container/ort');
  });

  it('beide tragen eine benannte Landmark — im Pane mit dem Fenster im Namen', () => {
    expect(inhaltsKopfHtml()).toContain('aria-label="Brotkrümel"');
    // Der PaneKopf trug bis 31.8.2026 GAR KEINE Landmark (Begründung: gleich-
    // namige Landmark-Flut). Der Einwand galt der Gleichnamigkeit: der Name
    // nennt jetzt das Fenster, mehrere Panes bleiben unterscheidbar.
    expect(paneKopfHtml()).toMatch(/aria-label="Brotkrümel [«&][^"]*StPO/);
  });

  it('die Overflow-Kaskade misst die ZONE, nicht den Viewport', () => {
    const quelle = readFileSync('src/components/layout/OrtsAngabe.tsx', 'utf8');
    // Die abgelöste Regel schaltete auf `sm:` — im Pane die falsche Zahl.
    expect(/className="[^"]*\bsm:/.test(quelle), 'in der Ortsangabe steht wieder eine Viewport-Kaskade').toBe(false);
    expect(quelle).toContain('@md/ort:');
    // Und beide Leisten bekommen sie dadurch tatsächlich ins Markup:
    expect(inhaltsKopfHtml()).toContain('@md/ort:');
    expect(paneKopfHtml()).toContain('@md/ort:');
  });

  it('das Artikel-Etikett doppelt in KEINER Leiste das Kürzel der Krume daneben', () => {
    // Geprüft am gerenderten Markup, nicht an der (bewusst nicht exportierten)
    // Ableitung: der PaneKopf gab bis 31.8.2026 das VOLLE Zitat «Art. 429 StPO»
    // aus, obwohl die Krume «StPO» seit der Breadcrumb-Ergänzung unmittelbar
    // davor steht. Die weite Fassung trägt seither dieselbe Kürzung wie die
    // Einzelansicht; die schmale bleibt das volle Zitat (dort steht keine Krume
    // daneben) — §5: eine Quelle, zwei Zuschnitte.
    //
    // ── FORTGESCHRIEBEN 7.9.2026 (GA-1, W2·24) ────────────────────────────
    // Der Fall ist seither ASYMMETRISCH, und zwar aus der Substanz heraus: die
    // Einzelansicht zeigt die Blatt-Krume «StPO» gar nicht mehr (die Regel
    // dazu in `layout/BrotkrumeRegel`), also steht neben dem Artikel kein
    // Kürzel, das er doppeln könnte — dort MUSS das volle Zitat stehen, sonst
    // fehlte die Angabe ganz (§8). Im Pane steht die Krume weiterhin daneben,
    // dort gilt die Kürzung unverändert. Die geprüfte Aussage ist dieselbe
    // geblieben: das Kürzel steht genau einmal je Leiste.
    const einzel = inhaltsKopfHtml();
    expect(einzel, 'Einzelansicht').toContain('data-ort-artikel');
    expect(einzel, 'Einzelansicht: die Blatt-Krume ist mit GA-1 gefallen').not.toContain('>StPO</span>');
    expect(einzel, 'Einzelansicht: ohne Krume daneben gehört das volle Zitat hin')
      .not.toContain('>Art. 429</span>');
    expect(einzel, 'Einzelansicht: das volle Zitat fehlt').toContain('>Art. 429 StPO</span>');

    const pane = paneKopfHtml();
    expect(pane, 'Pane').toContain('data-ort-artikel');
    expect(pane, 'Pane: die weite Fassung doppelt das Kürzel').toContain('>Art. 429</span>');
    expect(pane, 'Pane: die schmale Fassung hat das volle Zitat verloren').toContain('>Art. 429 StPO</span>');
  });

  it('GA-1: die Ortsleiste der Einzelansicht nennt nur die Sektion, das Pane die ganze Kette', () => {
    // Die eine Regel, an ihrer Wirkung geprüft (Herleitung und Messung in
    // `layout/BrotkrumeRegel.ts`): oben trägt der Reiter das Blatt, unten die
    // H1 — dazwischen bleibt nur der Rückweg. Im Split-View ist die Zeile
    // dagegen die Identität des Fensters und behält die Kette.
    const einzel = inhaltsKopfHtml();
    expect(einzel).toContain('>Gesetze</a>');
    expect(einzel, 'die Zwischen-Krume steht wieder in der Leiste').not.toContain('>Bund</a>');
    expect(paneKopfHtml()).toContain('Bund');
  });

  it('GA-1: wo die Seite ihren Rückweg selbst zeigt, schweigt die Leiste ganz', () => {
    // Vorlagen: `vorlagen/wizard` rendert «← Zurück zum Katalog» im Kopf —
    // eine zweite Krume daneben wäre der zweite Rückweg auf dasselbe Ziel.
    const html = inhaltsKopfHtml({
      breadcrumb: [{ label: 'Vorlagen', to: '/vorlagen' }, { label: 'Kündigung durch Arbeitgeber:in' }],
    });
    expect(html).not.toContain('>Vorlagen</a>');
    expect(html).not.toContain('Kündigung durch Arbeitgeber:in');
  });

  it('ohne Suffix-Treffer bleibt das Zitat ganz (keine blinde Kürzung)', () => {
    const html = paneKopfHtml({ breadcrumb: [{ label: 'Gesetze', to: '/gesetze' }, { label: 'ZGB' }] });
    expect(html).toContain('>Art. 429 StPO</span>');
    expect(html).not.toContain('>Art. 429</span>');
  });

  it('ohne Krume fällt die Zone auf das Fenster-Label zurück (Pane-Vertrag)', () => {
    const html = paneKopfHtml({ breadcrumb: undefined, artikel: undefined });
    expect(html).toMatch(/<span[^>]*>StPO<\/span>/);
  });

  it('ohne `onBreadcrumb` bleibt alles statisch (SSR/Prerender, Rückwärtskompat)', () => {
    const html = paneKopfHtml({ onBreadcrumb: undefined });
    expect(html).not.toMatch(/<button[^>]*>Gesetze<\/button>/);
    expect(html).toMatch(/<span[^>]*>Gesetze<\/span>/);
  });

  it('POSITIV-SONDE: der Baustein rendert auch für sich allein', () => {
    const html = renderToString(<OrtsAngabe breadcrumb={KRUMEN} navLabel="Brotkrümel" />);
    expect(html).toContain('Bund');
    expect(html).toContain('aria-label="Brotkrümel"');
  });
});

// ═══ §7-WÄCHTER · `PaneKopf.stand` IST ERREICHBAR ════════════════════════════
//
// Das Bau-Paket A-4 verlangte die Streichung der Prop als unerreichbar (§6.7);
// der Fahrplan führte sie unter «Nebenfunde» ebenso. Nachgerechnet ist die
// Behauptung FALSCH — die Kette (a)–(d) steht im JSDoc der Prop
// (`layout/PaneKopf.tsx`). Diese Sonde fährt sie nach, damit die Streichung
// nicht in einer späteren Runde doch noch «aufräumt»: auf pdf-embed- und
// nur-live-link-Erlassen ist diese Zeile die EINZIGE Stand-Angabe des Panes,
// und der Stand ist ein Rechtswert (§8, D1).
describe('§7 — PaneKopf.stand: erreichbar, darum nicht gestrichen', () => {
  it('(b) der Gesetz-Leser NIMMT den Kopf-Anspruch auf drei Wegen zurück', () => {
    const quelle = readFileSync('src/pages/gesetz-leser/v3/useKopfAnspruch.ts', 'utf8');
    expect(quelle).toMatch(/bleibendOhneKopf \? null :/);
  });

  it('(c) die Shell reicht dann `nurSteuerung: undefined` UND einen Stand durch', () => {
    const quelle = readFileSync('src/components/layout/Shell.tsx', 'utf8');
    expect(quelle).toContain('nurSteuerung={kopfDaten?.kopfzeileSelbst}');
    expect(quelle).toContain('<PaneKopf {...titelVon(pathname)}');
  });

  it('(d) bei fehlendem `nurSteuerung` STEHT der Stand in der Leiste', () => {
    expect(paneKopfHtml()).toContain('01.04.2025');
    expect(paneKopfHtml({ nurSteuerung: true }), 'A-2 bleibt unberührt').not.toContain('01.04.2025');
  });

  it('(a)/(d) der betroffene Bestand ist nicht leer — gezählt am Register', async () => {
    const register = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
      erlasse: { key: string; status?: string; stand?: string }[];
    };
    const ohneVolltext = register.erlasse.filter(
      (e) => e.status === 'pdf-embed' || e.status === 'nur-live-link');
    expect(ohneVolltext.length, 'kein Erlass mehr ohne Volltext — die Herleitung ist überholt')
      .toBeGreaterThan(0);
    expect(ohneVolltext.filter((e) => e.stand).length).toBe(ohneVolltext.length);
  });
});
