// ─── MehrKante — die ehrliche Masse-Kante (§1.5) ────────────────────────────
//
// V1 kennt ZWEI Zustände, beide live:
//   • «+n weitere» (lokal, klappt die schon geladene Restmenge auf)
//   • still/unsichtbar (nichts da bzw. bereits aufgeklappt → nichts gerendert;
//     §15.2: kein reservierter Leerraum je Kante)
//
// Erweiterungspunkt V2: der dritte Zustand «+n weitere (online)» lädt die Masse per
// Edge-Query nach (§8-Satz «Anfrage verlässt dafür den Browser»). Bewusst NUR dieser
// Kommentar-Slot — kein toter Online-Zweig im Code (§0-1e).

export function MehrKante({ rest, offen, onOeffne, className = '' }: {
  /** Anzahl noch verborgener Kanten. */
  rest: number;
  /** Bereits aufgeklappt? Dann rendert die Kante nichts (der Rest steht schon). */
  offen: boolean;
  onOeffne: () => void;
  className?: string;
}) {
  if (rest <= 0 || offen) return null;
  return (
    <button type="button" onClick={onOeffne}
      className={`lc-chip no-underline text-ink-500 hover:text-brass-700 hover:border-brass-400 ${className}`}>
      +<span className="num">{rest}</span> weitere
    </button>
  );
}
