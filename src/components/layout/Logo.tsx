import { BEREICHE, registerVar } from './bereiche';

// ─── Marke (W2·24-DESIGN-IDENTITAET R2) ─────────────────────────────────────
//
// Vorher: gestempeltes §-Siegel mit Messing-Schnittkante, gerundeter Ecke und
// einer HART IN DAS SVG GESCHRIEBENEN Schriftfamilie («Geist Variable»). Die
// harte Familie war die letzte Stelle, an der R1 die Schrift NICHT umstellen
// konnte (Übergabe `abnahme/design-identitaet/KONTRAST-R1.md` §4) — sie steht
// jetzt wie überall auf `--font-display` (Archivo).
//
// Die zwei weiteren Änderungen folgen dem System (§5 des Fahrplans):
//  · Radius 0 — das Siegel ist ein Stempel, keine App-Kachel.
//  · Die fünf Messing-Skalenstriche sind die VIER REGISTERFARBEN geworden
//    (Gesetze · Rechtsprechung · Materialien · Werkzeuge, `./bereiche`). Sie
//    tragen damit dieselbe Bedeutung wie der Strich unter dem aktiven
//    Bereichs-Reiter und die Randmarke der Seitenleiste, statt nur Zierrat zu
//    sein. Reine Darstellung (§3).
//
// KEIN eigener Farbwert: die Striche lesen `--reg-*`, der Grund `--ink-900`,
// die Glyphe `--paper` (auf dem Ink-Grund die einzige lesbare Wahl in beiden
// Modi — die Tinte kippt mit dem Thema, das Verhältnis bleibt).

/** Die vier Register in fester Ordnung — Duplikate («Werkzeuge» zweimal, für
 *  Rechner und Vorlagen) fallen weg, es sind vier Striche, nicht fünf. */
const REGISTER_STRICHE = [...new Set(BEREICHE.map((b) => b.register))];

export function LexMetrikSiegel({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" fill="var(--ink-900)" />
      {/* §-Glyphe in der Bedienschrift (Archivo) — via `style`, damit die
          CSS-Variable auflöst (Präsentationsattribute lösen `var()` nicht
          zuverlässig auf). */}
      <text x="24" y="30" textAnchor="middle"
        style={{ fontFamily: 'var(--font-display), system-ui, sans-serif', fontSize: 22, fontWeight: 600 }}
        fill="var(--paper)">§</text>
      {/* Die vier Register als Schnitt am Fuss des Stempels. */}
      {REGISTER_STRICHE.map((r, i) => (
        <rect key={r} x={13 + i * 6} y="38" width="4" height="2" fill={registerVar(r)} />
      ))}
    </svg>
  );
}

export function LexMetrikWortmarke({ className = '' }: { className?: string }) {
  // Zweiton aufgelöst: seit R1 ist `--brass-700` wertgleich mit `--ink-900`
  // (die Messing-Skala ist neutral geworden) — zwei Spans, eine Farbe, also
  // eine Behauptung ohne Wirkung. Der Unterschied trägt jetzt das GEWICHT:
  // «Lex» halbfett, «Metrik» normal, beides Tinte, beides Archivo.
  return (
    <span className={`font-display tracking-[-.01em] text-ink-900 ${className}`}>
      <span className="font-semibold">Lex</span>
      <span className="font-normal">Metrik</span>
    </span>
  );
}
