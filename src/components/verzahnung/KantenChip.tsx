import { memo } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { revisionDetailText, type ArtikelRevision } from '../../lib/verzahnung/artikel-revisionen';

// ─── KantenChip — der EINE Chip für Dokument-Referenzen (§1.2) ───────────────
//
// Ersetzt die drei Ad-hoc-Chip-Varianten (LeitfallZeile, KontextPanel, Verweise)
// durch EINE Anatomie mit Dichte-Regel: Label + EIN Zusatz — Fundstellen-Sublabel
// ODER ★-Glyph, nie beides plus Badge-Text. Hat ein Chip Sublabel UND Leitentscheid-
// Status, gewinnt das Sublabel; der ★ rückt als Präfix-Glyph vor das Label (bleibt
// 1 Zeichen, §0-1b). Token `lc-chip` unverändert — kein neues CSS.
//
// React.memo (Default-Komparator), weil in Listen wiederkehrend gemountet (§15.4,
// Compiler AUS). Kein eigener ⧉ am Chip (§0-3b) — der liefert der umgebende Kontext
// (Panel-Zeile/Popover) unter Pane-Gating.
//
// Erweiterungspunkt V2: `konfidenz`-Marker (dezenter Punkt `text-warn-700` bei
// 'niedrig', Text-Tooltip, Farbe nie allein tragend). NICHT bauen.

// Farb-Wörterbuch V2·C-1 (§4b-B): brass = Norm-/Wortlaut-Referenz (Default,
// byte-identisch), slate = Rechtsprechungs-Kante (BGE/Entscheid). slate ist der
// neutrale Referenzton, NIE ein Rechtsstatus-Urteil (§4b-B). Nur der Tick + die
// Hover-Utilities tauschen mit; Anatomie/Token `lc-chip` bleiben gleich. Der
// Default 'norm' rendert die unveränderte brass-Klassenzeile — golden byte-gleich.
const CHIP_KLASSE: Record<'norm' | 'entscheid', string> = {
  norm: 'lc-chip num no-underline hover:text-brass-700 hover:border-brass-400',
  entscheid: 'lc-chip lc-chip-entscheid num no-underline hover:text-slate-700 hover:border-slate-700',
};

export const KantenChip = memo(function KantenChip({ to, label, sublabel, leitentscheid = false, revidiert, titel, kategorie = 'norm' }: {
  to: string;
  /** Doktyp-Kürzel oder Zitierung, z. B. «OR» oder «BGE 147 III 209». */
  label: string;
  /** Fundstellen-Sublabel, z. B. «via Art. 257d» — schliesst den ★-Suffix aus. */
  sublabel?: string;
  leitentscheid?: boolean;
  /** Referenz-Kategorie → Chip-Farbfamilie (§4b-B). 'norm' (Default) = brass
   *  (Wortlaut/zitierte Normen, byte-identisch); 'entscheid' = slate-Tick
   *  (Rechtsprechungs-Kante). Steuert Tick UND Hover-Utilities gemeinsam. */
  kategorie?: 'norm' | 'entscheid';
  /** V1c: die zitierte Norm wurde seit dem Entscheid revidiert → ↻-Glyph mit
   *  Revisionsdatum + AS-Fundstelle (aria-label/Tooltip). null/undefined = kein
   *  Zusatz (Dichte-Regel: der ↻ ist ein blosser 1-Zeichen-Suffix-Glyph wie der
   *  ★, kein Volltext-Badge — er verdrängt weder Sublabel noch ★). */
  revidiert?: ArtikelRevision | null;
  /** Hover-/Screenreader-Titel des Chips (Default: `label`). */
  titel?: string;
}) {
  // Dichte-Regel: Sublabel gewinnt → ★ als Präfix; sonst ★ als Suffix.
  const sternPraefix = leitentscheid && !!sublabel;
  const sternSuffix = leitentscheid && !sublabel;
  return (
    <Link to={to} title={titel ?? label}
      className={CHIP_KLASSE[kategorie]}>
      {sternPraefix && <StatusBadge praedikat="leitentscheid" variant="glyph" className="mr-1" />}
      {label}
      {sublabel && <span className="ml-1 text-micro font-normal normal-case text-ink-500">{sublabel}</span>}
      {sternSuffix && <StatusBadge praedikat="leitentscheid" variant="glyph" className="ml-1" />}
      {revidiert && <StatusBadge praedikat="revidiert" variant="glyph" detail={revisionDetailText(revidiert)} className="ml-1" />}
    </Link>
  );
});
