import { Link } from 'react-router-dom';
import type { BrowseMaterial } from '../../lib/materialien/typen';
import { StandChip } from '../ui/StandChip';

// ─── Material-Karte in der Übersicht /materialien ───────────────────────────
//
// Amtliche Ressource (Soft-Law) als Karte. Nüchtern/kanzleihaft (DESIGN-
// REGLEMENT §13): Doktyp+Nummer als Overline, Titel als Anker, Stand als Meta
// (die Behörde trägt der Gruppenkopf — LM-195). Reine Darstellung (§3). Die Karte führt auf die IN-APP-Detailseite
// (/materialien/:key) mit bibliografischen Metadaten + prominentem Live-Link —
// KEIN gespeicherter Dokumentinhalt (§7/§8), massgeblich bleibt die amtliche
// Quelle.

// Der Stand-Chip stand hier und in `normtext/ErlassKarte.tsx` zeichengleich als
// lokale Kopie (Design-Konsistenz, C-Begleitbefund «Stand-Chip-Dedupe»,
// 31.8.2026) — jetzt EIN Baustein: `ui/StandChip.tsx`.

export function MaterialKarte({ m }: { m: BrowseMaterial }) {
  const overline = m.nummer ? `${m.doktypLabel} · ${m.nummer}` : m.doktypLabel;
  return (
    <Link
      to={`/materialien/${encodeURIComponent(m.key)}`}
      className="lc-card group flex h-full flex-col p-4 no-underline"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="lc-overline">{overline}</span>
        {m.sprache !== 'de' && <span className="lc-badge lc-badge-soft">{m.sprache}</span>}
      </div>
      <p className="mt-1.5 text-body-s font-medium text-ink-900 leading-snug line-clamp-3">{m.titel}</p>
      {/* lc-chip-zeile (LM-044/N1): der Stand-Chip ist ein <span> ohne role und
          bleibt darum ausdrücklich FLACH — reine Angabe, keine Aktion, kein Link.
          Genau das war der Befund: «Stand 01.02.2022» war formal nicht von einem
          Normverweis «ZGB» zu unterscheiden. Die Opt-in-Klasse macht die
          Flachheit zur ERKLÄRTEN Aussage statt zum Zufall (§23). */}
      {/* LM-028 (B11-Karten, 4.9.2026): `mt-auto` hängt die Metazeile an den
          Kartenfuss statt an den Titel (gemessen /materialien @1440: drei- gegen
          zweizeiliger Titel setzte «Stand …» 19 px auseinander). Die Karte ist
          dafür eine Flex-Spalte (`flex h-full flex-col`); Kartenhöhe unverändert.
          LM-195 (B14, 4.9.2026): kein `behoerdeKuerzel` mehr in der Zeile — die
          Karten liegen immer in der Behörden-Gruppe, deren Kopf das Kürzel trägt
          (einziger Aufrufer `pages/Materialien.tsx`); bewusst keine Prop dafür.
          Die `lc-chip-zeile` trägt weiter den Stand-Chip (§23/N1). */}
      <div className="lc-chip-zeile mt-auto pt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        <StandChip stand={m.stand} />
      </div>
      {/* ── LM-195, zweiter Teil · DIE KLICKBARKEIT IST SICHTBAR ────────────────
          Die Weiterweg-Zeile trug `opacity-0 … group-hover:opacity-100` — auf
          Touch und im Ruhezustand also unsichtbar, während die Karten der übrigen
          Bereiche ihren Weiterweg stehend zeigen. Die Sichtbarkeit einer Aktion
          darf nicht am Zeigergerät hängen (§8). Der Hover bleibt als VERSTÄRKUNG:
          `ink-500` im Ruhezustand → Messing beim Überfahren. Kein Layout-Sprung,
          weil die Zeile schon vorher Platz belegte (nur `opacity`). */}
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink-500 transition-colors group-hover:text-brass-700">
        Details &amp; amtliche Fassung →
      </span>
    </Link>
  );
}
