import type { ButtonHTMLAttributes, Ref } from 'react';

// ─── EIN Schliess-✕ der App (A3-1, 31.8.2026) ────────────────────────────────
//
// W2·19-DESIGN-KONSISTENZ · Runde 3, Paket β. GEMESSEN waren sieben Fundstellen
// derselben Inhaltsklasse — «dieses Ding hier wegmachen» — in fünf Grammatiken:
//
//   `lc-btn lc-btn-ghost lc-btn-sm`  Shell (Navigations-Schublade)
//   `lc-btn-ghost lc-btn-sm px-2`    NormPopover
//   `lc-leiste-griff`                InhaltsKopf (Griff-Zeile des Inhaltskopfs)
//   ink-500 → ink-900                HeaderSuche (Fokusmodus verlassen)
//   ink-500 → brass-700              SheetRahmen · LeserPanel
//   ink-500 → danger-700             TabPanel (Reiter schliessen)
//
// KANON (Mehrheitsform, das Reglement schweigt zum ✕):
//   · Glyph «✕» in `text-base leading-none`, `aria-hidden` — 5:1:1.
//     R6-A (5.9.2026): Grösse UND Schnitt liegen seither in
//     `.lc-griff-glyph` (index.css). Der Span schrieb nur die GRÖSSE
//     fest; die FAMILIE erbte er von der Umgebung, und im `InhaltsKopf`
//     (`lc-leiste-griff`) ist die Mono — gemessen 9.64 px ✕-Tinte gegen
//     12.20 px überall sonst, bei identischen 16 px. Halbe Deklaration wie
//     beim Ziffernsatz (R4-C/R5-B), eine Ebene höher.
//   · Farbe `ink-500`, im Hover eine Messing-Stufe: `brass-700` — 2:1:1 unter
//     den ausgeschriebenen Tönen und zugleich die Regel des Reglements
//     (§G-j: Interaktion läuft über die WÄRME, eine Flexoki-Stufe tiefer).
//     `hover:text-ink-900` (HeaderSuche) war die einzige Fundstelle, die im
//     Hover DUNKLER statt wärmer wurde.
//   · Der NAME steht am Knopf, nicht am Glyph (`aria-label`): «Schliessen» ist
//     ohne Objekt keine Auskunft — jeder Aufrufer sagt, WAS er schliesst (§8).
//
// TREFFERFLÄCHE — der eigentliche Mangel hinter der Streuung: die sichtbaren
// Boxen reichten von 24 px (Leisten-Griff) bis 44 px, drei der sieben lagen
// unter dem AAA-Komfortmass. Statt sieben Boxen anzugleichen (was jede in ihrer
// Zeile falsch machte: die Reiter-Leiste hat für 44 px keine Höhe) wächst die
// TREFFERFLÄCHE über `::after` auf `--tap-ziel-komfort`, während die sichtbare
// Optik bleibt, wo sie ist — dieselbe Technik und derselbe Token wie bei den
// Pillen des `SelectionGrid` (Regeln `.lc-schliessknopf*`, index.css).
//
// Sie ist DEFAULT, aber abschaltbar, und das ist kein Wackeln: das Pseudo-
// Element liegt über allem, was es überlappt, und nimmt dem Nachbarn dessen
// Klicks. Wo das ✕ frei steht, ist das folgenlos; in einer dichten Griff-Zeile
// (Reiter-Liste, Inhaltskopf-Leiste) läge es über den Nachbarknöpfen bzw. den
// Zeilen darüber/darunter — dort wäre es ein Bedienfehler, kein Gewinn. Die
// zwei Ausnahmen sind am Fundort begründet und im Wächter aufgeführt; die
// AA-Untergrenze (WCAG 2.5.8, 24 px) hält die Grundklasse überall.
//
// WAS NICHT VEREINHEITLICHT WIRD (deklariert, mit Grund): die BOX. Sie gehört
// der Zeile, in der der Knopf steht — 44 px im Such-Streifen und im Bottom-Sheet
// (Finger-Zonen), 28 px in der Reiter-Liste, der Leisten-Griff im Inhaltskopf
// (B6, 28.7.2026: EINE Anatomie für ALLE Bedien-Elemente jener Leiste — eine
// datierte Entscheidung mit Vorfall, die dieser Baustein nicht überschreibt).
// Der Aufrufer übergibt sie als `klasse`; alles andere bringt der Baustein.
//
// §3: reine Darstellung — der Baustein weiss nicht, was geschlossen wird.

const TON = {
  /** Regelfall: leiser Griff, im Hover eine Messing-Stufe. */
  ruhig: 'text-ink-500 hover:text-brass-700',
  /** Der Klick WIRFT etwas weg (offener Reiter samt Verlauf) — nicht «nur zu».
   *  Bis hierher stand dieser Ton als blosse Utility im Reiter-JSX; als
   *  benannter Wert ist er eine Aussage über die Handlung, keine Farbwahl. */
  destruktiv: 'text-ink-500 hover:text-danger-700',
  /** KEINE eigene Farbe: die Anatomie der Umgebung trägt sie (`lc-leiste-griff`
   *  im Inhaltskopf). Ausdrücklich benannt, damit die Ausnahme sichtbar ist. */
  geerbt: '',
} as const;

export function SchliessKnopf({ name, ton = 'ruhig', komfort = true, klasse, ref, ...rest }: {
  /** `aria-label` UND `title`: WAS wird geschlossen (§8, nie nur «Schliessen»). */
  name: string;
  ton?: keyof typeof TON;
  /** Komfort-Trefferfläche (44 px per `::after`). `false` NUR, wo das Pseudo-
   *  Element einen Nachbarn überdeckte — mit Begründung am Fundort. */
  komfort?: boolean;
  /** Box/Position der Umgebung (Höhe, Ränder, `absolute …`) — nie Farbe. */
  klasse?: string;
  ref?: Ref<HTMLButtonElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'aria-label' | 'title' | 'ref'>) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={name}
      title={name}
      className={['lc-schliessknopf', komfort && 'lc-schliessknopf-komfort', TON[ton], klasse]
        .filter(Boolean).join(' ')}
      {...rest}
    >
      <span aria-hidden className="lc-griff-glyph">✕</span>
    </button>
  );
}
