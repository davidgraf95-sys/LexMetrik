import type { ReactNode } from 'react';
import { AMTLICHE_FASSUNG, AMTLICHE_FASSUNG_AUFGEHOBEN } from '../../lib/benennung';

// ═══ Der Link auf die MASSGEBLICHE amtliche Quelle — EIN Baustein (B-1/B-2) ══
//
// GEMESSEN (Design-Konsistenz, Finder-Welle B, Runde 1, 31.8.2026): derselbe
// Link — «öffne die amtliche Fassung bei der Behörde» — trat in VIER Optiken
// und vier Wortlauten auf:
//   · `parts/ErlassLeserKopf.tsx:275`   «Amtliche Fassung ↗», `.lc-chip`
//   · `pages/MaterialLeser.tsx:116`     «Zur amtlichen Fassung ↗», schwarzer
//                                        Primärknopf (`.lc-btn-primary`)
//   · `components/NormPopover.tsx:167`  «↗ geltende Fassung», Pfeil VORNE
//   · `components/vorlagen/NormChip.tsx:484` «↗ geltende Fassung auf Fedlex»
// Dazu das Aufhebungs-Banner (`ErlassLeserKopf:299/304`) mit «↗ amtliche
// (aufgehobene) Fassung» und «↗ Nachfolge-Erlass: …» — Pfeil vorne, klein
// beginnend, beides gegen Ä110.
//
// KANON (Benennungs-Glossar Ä110, `docs/ux-audit-2026-07/reader/
// leser-v3-design-grundlage.md`): **«Amtliche Fassung ↗»** — Pfeil HINTEN (er
// kündigt das Verlassen der Seite an und gehört ans Ende der Beschriftung),
// gross beginnend (Aktions-/Link-Beschriftungen beginnen gross), ruhiger
// Textlink (kein Primärknopf: das Ziel ist eine Auskunft, keine Erledigung —
// und ein schwarzer Knopf ist auf einer Leseseite die lauteste Form, die es
// gibt).
//
// WARUM EIN BAUSTEIN UND NICHT VIER ANGEGLICHENE KOPIEN (§5/§10): die vier
// Stellen sind vier Mal AUSEINANDERGELAUFEN, obwohl das Wort seit Ä110
// (18.8.2026) feststeht — genau das kann nur eine geteilte Stelle verhindern.
//
// §3: reine Darstellung. Der Baustein entscheidet NICHT, ob ein Erlass gilt
// oder aufgehoben ist — das sagt ihm der Aufrufer über `variante`.
export function QuellLink({ href, variante = 'geltend', className, children, title }: {
  href: string;
  /** `aufgehoben` = derselbe Link führt auf die AUFGEHOBENE Konsolidierung; das
   *  gehört nach §8 in den Namen, nicht in eine Fussnote. */
  variante?: 'geltend' | 'aufgehoben';
  /** Container-Grammatik des Aufrufers (z. B. `.lc-chip` in der Kopf-Aktionen-
   *  Zeile, die ihre Chip-Anatomie in `.lc-kopf-aktionen` selbst neutralisiert).
   *  Ohne Angabe der ruhige Textlink — die Form, die der Kanon meint. */
  className?: string;
  /** Eigener Name statt des Kanon-Worts — für Ziele, die NICHT «die amtliche
   *  Fassung dieses Dokuments» sind, aber dieselbe Anatomie tragen (Pfeil
   *  hinten, gross beginnend): heute genau der Nachfolge-Erlass im
   *  Aufhebungs-Banner. */
  children?: ReactNode;
  /** Zusatzauskunft am Hover/Fokus — NIE die einzige Trägerin einer Tatsache
   *  (Touch erreicht sie nicht), immer nur die Ausführung dessen, was der Name
   *  schon sagt. Nachgezogen am 31.8.2026 für den Entscheid-Leser (B2/BAU-4):
   *  dort erklärt sie beim BGE ohne aufgelöstes Urteil, wohin der Link statt
   *  dessen führt — die Tatsache selbst steht sichtbar im Namen
   *  («Amtliche Fassung (Urteil n. v.) ↗»). */
  title?: string;
}) {
  // Der Pfeil bleibt SICHTBARER TEXT und nicht `aria-hidden`: er ist seit Ä110
  // Teil des Namens («Amtliche Fassung ↗»), und die bestehenden Sonden lesen
  // genau diesen zugänglichen Namen. Eine Umstellung auf `aria-hidden` wäre
  // eine eigene, deklarierte Änderung an allen Aussenlinks — nicht ein
  // Nebeneffekt der Vereinheitlichung.
  //
  // Der Kanon-Name wird als EINE Zeichenkette gebaut, nicht als «{wort} ↗»:
  // `renderToString` setzt zwischen zwei Textknoten ein `<!-- -->`, und der
  // Name landet so zerschnitten im prerenderten HTML und in jeder
  // SSR-Zeichenketten-Sonde. Ein Name, der nur im Browser zusammenhängt, ist
  // keiner (§5 — gemessen wird, was gedruckt wird).
  const kanon = `${variante === 'aufgehoben' ? AMTLICHE_FASSUNG_AUFGEHOBEN : AMTLICHE_FASSUNG} ↗`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      // B-L1 (R9-1, 6.9.2026): die Vorgabe war `hover:underline` — der Strich
      // erschien also erst beim Überfahren, und «Amtliche Fassung ↗» stand
      // ausserhalb des Lesers (Abruf-Fehler, Entscheid-Kopf, Popover) als Link
      // da, den nur die Farbe auswies (WCAG 1.4.1). `.lc-link` ist die
      // Opt-in-Klasse der EINEN Textlink-Regel in `index.css` — derselbe Strich
      // wie im Gesetzes- und im Rechtsprechungs-Leser, ohne dass jede
      // Aufrufstelle ihn selbst schreibt (§5/§10). Aufrufer, die ein eigenes
      // `className` übergeben (z. B. `lc-chip no-underline`), sind unberührt.
      className={className ?? 'lc-link text-brass-700 hover:text-brass-800'}
    >
      {children ? <>{children} ↗</> : kanon}
    </a>
  );
}
