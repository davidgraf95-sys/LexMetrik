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
  // Erweiterungspunkt V2: 'masse' → Masse-Kennzeichnung aus den automatisch
  //   erfassten 195'000 Urteilen (lc-badge-soft, gestrichelt).
  // Erweiterungspunkt V3: 'nur-verweis' → «nur PDF-Verweis» (lc-badge-soft).
};

export function StatusBadge({ praedikat, variant = 'voll', interaktiv = false, className = '' }: {
  praedikat: StatusPraedikat;
  /** 'voll' = ausgeschriebenes Badge (Reader-Kopf/Suche); 'glyph' = blanker ★ mit aria-label (Chip-Reihen). */
  variant?: 'voll' | 'glyph';
  /** Nur 'voll': Label als touch-/tastaturtauglicher Begriff-Tooltip (Reader-Kopf). */
  interaktiv?: boolean;
  className?: string;
}) {
  const r = REZEPT[praedikat];
  if (!r) return null;                       // V2/V3-Slot ohne Darstellung

  // Glyph-Variante: blanker ★ (nur wo einer definiert ist), Text trägt das
  // aria-label (role=img → Screenreader liest das Label, nicht die Rohglyphe).
  if (variant === 'glyph') {
    if (!r.glyph) return null;
    return (
      <span role="img" aria-label={r.ariaLabel} title={r.erklaerung}
        className={`text-brass-700 ${className}`}>
        {r.glyph}
      </span>
    );
  }

  // Volltext-Variante: ausgeschriebenes Badge. `interaktiv` macht das Label zu
  // einem Begriff (fokussier- + tap-bedienbarer Erklär-Tooltip, §1.7) — nur wo ein
  // Glossar-Eintrag existiert; sonst trägt `title` die Erklärung.
  return (
    <span className={`lc-badge ${r.ton} ${className}`} aria-label={r.ariaLabel}
      title={interaktiv && r.glossar ? undefined : r.erklaerung}>
      {r.glyph && <span aria-hidden className="mr-1">{r.glyph}</span>}
      {interaktiv && r.glossar
        ? <Begriff schluessel={r.glossar}>{r.label}</Begriff>
        : r.label}
    </span>
  );
}
