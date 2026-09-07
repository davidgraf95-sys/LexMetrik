import { MASSGEBLICH_SATZ } from '../../lib/benennung';
import type { GlossarSchluessel } from '../../lib/verzahnung/glossar';
import type { StatusPraedikat } from '../../lib/verzahnung/typen';

// ─── Das StatusBadge-Vokabular als Daten (§1.3) — EINE Quelle (§5) ───────────
//
// Aus StatusBadge.tsx herausgelöst (W2·17-UI-BEFUNDE-B1, LM-050): die sichtbare
// Zeichenerklärung (ZeichenLegende.tsx) braucht dieselben Texte wie die
// aria-label/title der Glyphen — und `react-refresh/only-export-components`
// verbietet Konstanten-Exporte aus Komponenten-Dateien. Inhalt byte-gleich
// übernommen, keine Textänderung.
//
// Geschlossene Liste. Der Normalfall (kuratiert erfasst) trägt KEIN Badge — nur
// Abweichungen werden markiert (§0-1a). KEINE Ampel-/Treatment-Farben (R16 zu);
// Messing ist Hervorhebung, kein Rechtsstatus-Urteil. Das `aria-label` je Prädikat
// ist TEXTGLEICH an allen Fundorten (Magic Moment 4) — dieselbe Konstante speist
// Glyph-, Volltext- und Legenden-Darstellung.

export type Rezept = {
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

export const REZEPT: Partial<Record<StatusPraedikat, Rezept>> = {
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
    // B-6-Nachzug (R2-A, 31.8.2026): «Quelle» → Wortquelle-Konstante. §8: der
    // Nachdruck «stets» kommt hinzu, der Satz wird also nicht abgeschwächt.
    erklaerung: `Nur Fundstelle und amtlicher Live-Link — kein in LexMetrik aufbereiteter Volltext. ${MASSGEBLICH_SATZ}`,
    ton: 'lc-badge-soft',
  },
  // Erweiterungspunkt V2: 'masse' → Masse-Kennzeichnung aus den automatisch
  //   erfassten 195'000 Urteilen (lc-badge-soft, gestrichelt).
};

/** LM-050 (W2·17-UI-BEFUNDE-B1): die Glyph-Prädikate mit Erklärtext für die
 *  sichtbare Zeichenerklärung (ZeichenLegende). DIESELBE Quelle wie aria-label/
 *  title der Glyphen (Magic Moment 4: textgleich an allen Fundorten, §5) —
 *  keine zweite Formulierung pflegen. */
export const GLYPH_LEGENDE = (['leitentscheid', 'revidiert'] as const).flatMap((p) => {
  const r = REZEPT[p];
  return r?.glyph
    ? [{ glyph: r.glyph, ton: r.glyphTon ?? 'text-brass-700', label: r.label, erklaerung: r.erklaerung }]
    : [];
});
