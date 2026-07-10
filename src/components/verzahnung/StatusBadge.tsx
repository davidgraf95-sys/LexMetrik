import type { GlossarSchluessel } from '../../lib/verzahnung/glossar';
import type { StatusPraedikat } from '../../lib/verzahnung/typen';
import { Begriff } from './Begriff';

// ─── StatusBadge — EIN Vokabular, nur für Abweichungen (§1.3) ────────────────
//
// Geschlossene Liste. Der Normalfall (kuratiert erfasst) trägt KEIN Badge — nur
// Abweichungen werden markiert (§0-1a). KEINE Ampel-/Treatment-Farben (R16 zu);
// Messing ist Hervorhebung, kein Rechtsstatus-Urteil. Das `aria-label` je Prädikat
// ist TEXTGLEICH an allen Fundorten (Magic Moment 4) — dieselbe Konstante speist
// Glyph- und Volltext-Variante.
//
// V1 bespielt nur `leitentscheid` und `maschinell`. `masse` (V2) und `nur-verweis`
// (V3) sind Enum-Slots im Typ (typen.ts) — sie tragen HEUTE bewusst KEINE
// Darstellung (kein toter Zweig, §0-1e); die je-1-Variante kommt mit den Daten.

type Rezept = {
  glyph: string | null;
  label: string;
  ariaLabel: string;
  erklaerung: string;
  ton: string;
  /** Farbton der Glyph-Variante (Farb-Wörterbuch V2·C-1, §4b-B). Default
   *  `text-brass-700` (★ = Marke/Hervorhebung). Der Revisions-↻ trägt `text-warn-700`,
   *  weil er ein echter Fassungs-Vorbehalt ist — kein neutraler brass-Akzent. */
  glyphTon?: string;
  /** Nur wenn ein Glossar-Eintrag existiert → `interaktiv` wird zum Begriff-Tooltip. */
  glossar?: GlossarSchluessel;
};

const REZEPT: Partial<Record<StatusPraedikat, Rezept>> = {
  leitentscheid: {
    glyph: '★',
    label: 'Leitentscheid',
    ariaLabel: 'Leitentscheid — amtlich publizierter BGE',
    erklaerung: 'Amtlich publizierter Bundesgerichtsentscheid (BGE) — vom Bundesgericht selbst als wegweisend eingestuft.',
    ton: 'lc-badge-massgeblich',
    glossar: 'leitentscheid',
  },
  maschinell: {
    glyph: null,
    label: 'maschinell',
    ariaLabel: 'maschinell zugeordnet — keine redaktionell erfasste Angabe',
    erklaerung: 'Automatisch aus dem Text zugeordnet — keine redaktionell erfasste Angabe.',
    ton: 'lc-badge-soft',
  },
  // V1c (Normrevisions-Ehrlichkeit, §V1c): die zitierte Norm wurde SEIT dem
  // Entscheid revidiert — beweisbar aus den amtlichen Revisions-Fussnoten. Das
  // konkrete Revisionsdatum + die AS-Fundstelle liefert die `detail`-Prop je
  // Vorkommen (dynamisch, quell-belegt §7). KEINE Ampelfarbe (R16): `lc-badge-soft`.
  revidiert: {
    glyph: '↻',
    label: 'Norm revidiert seit Entscheid',
    ariaLabel: 'Norm seit dem Entscheid revidiert',
    erklaerung: 'Die zitierte Bestimmung wurde nach diesem Entscheid geändert — der Entscheid legt die damals geltende Fassung aus.',
    ton: 'lc-badge-soft',
    glyphTon: 'text-warn-700',
  },
  // V3 vorgezogen durch E6a·M5 (FAHRPLAN-VERZAHNUNG-UI §V3): der Material-Reader
  // hostet KEINEN Volltext — nur bibliografische Angaben + amtlichen Live-Link
  // (§7/§8). Auf der MaterialLeser-Karte, NICHT am Chip (Dichte-Regel §1.2). Kein
  // Glyph, lc-badge-soft (R16: keine Ampelfarbe). Kein Glossar-Eintrag nötig.
  'nur-verweis': {
    glyph: null,
    label: 'nur Verweis',
    ariaLabel: 'nur Verweis — kein aufbereiteter Volltext, nur amtlicher Live-Link',
    erklaerung: 'Nur Fundstelle und amtlicher Live-Link — kein in LexMetrik aufbereiteter Volltext. Massgeblich ist die amtliche Quelle.',
    ton: 'lc-badge-soft',
  },
  // Erweiterungspunkt V2: 'masse' → Masse-Kennzeichnung aus den automatisch
  //   erfassten 195'000 Urteilen (lc-badge-soft, gestrichelt).
};

export function StatusBadge({ praedikat, variant = 'voll', interaktiv = false, detail, className = '' }: {
  praedikat: StatusPraedikat;
  /** 'voll' = ausgeschriebenes Badge (Reader-Kopf/Suche); 'glyph' = blanker ★ mit aria-label (Chip-Reihen). */
  variant?: 'voll' | 'glyph';
  /** Nur 'voll': Label als touch-/tastaturtauglicher Begriff-Tooltip (Reader-Kopf). */
  interaktiv?: boolean;
  /** Instanz-spezifischer Zusatz (V1c: Revisionsdatum + AS-Fundstelle) — fliesst
   *  quell-belegt (§7) in aria-label UND Tooltip, ohne das feste Vokabular zu ändern. */
  detail?: string;
  className?: string;
}) {
  const r = REZEPT[praedikat];
  if (!r) return null;                       // V2/V3-Slot ohne Darstellung
  const ariaLabel = detail ? `${r.ariaLabel} — ${detail}` : r.ariaLabel;
  const titel = detail ? `${r.erklaerung} (${detail})` : r.erklaerung;

  // Glyph-Variante: blanker ★ (nur wo einer definiert ist), Text trägt das
  // aria-label (role=img → Screenreader liest das Label, nicht die Rohglyphe).
  if (variant === 'glyph') {
    if (!r.glyph) return null;
    return (
      <span role="img" aria-label={ariaLabel} title={titel}
        className={`${r.glyphTon ?? 'text-brass-700'} ${className}`}>
        {r.glyph}
      </span>
    );
  }

  // Volltext-Variante: ausgeschriebenes Badge. `interaktiv` macht das Label zu
  // einem Begriff (fokussier- + tap-bedienbarer Erklär-Tooltip, §1.7) — nur wo ein
  // Glossar-Eintrag existiert; sonst trägt `title` die Erklärung.
  // a11y (Review 3.7.): `aria-label` NIE auf einem role-losen Span
  // (axe aria-prohibited-attr) — statisch trägt es der role="img"-Span, im
  // interaktiven Fall der Begriff-Button (accessible name des Auslösers).
  if (interaktiv && r.glossar) {
    return (
      <span className={`lc-badge ${r.ton} ${className}`}>
        {r.glyph && <span aria-hidden className="mr-1">{r.glyph}</span>}
        <Begriff schluessel={r.glossar} ariaLabel={r.ariaLabel}>{r.label}</Begriff>
      </span>
    );
  }
  return (
    <span role="img" className={`lc-badge ${r.ton} ${className}`} aria-label={ariaLabel}
      title={titel}>
      {r.glyph && <span aria-hidden className="mr-1">{r.glyph}</span>}
      {r.label}
    </span>
  );
}
