import type { ReactNode } from 'react';

// Rendert «&» in Display-Titeln in der Sans-Schrift (Geist) statt der
// verschnörkelten Fraunces-Glyphe. Styling über .lc-amp (index.css).
export function sansAmp(text: string): ReactNode {
  if (!text.includes('&')) return text;
  return text.split('&').flatMap((teil, i) =>
    i === 0 ? [teil] : [<span key={i} className="lc-amp">&amp;</span>, teil],
  );
}

// Tausendergruppierte Zahl in der Mono-Stimme (LM-119/LM-108, B13).
// Die Mono-Schrift gibt JEDEM Glyph dieselbe Laufweite — der Tausender-
// Apostroph bekommt darum eine volle Ziffernbreite und «1'577» liest sich
// als «1 ' 577». Trennzeichen bleibt der GERADE Apostroph (SSoT
// src/lib/konventionen.ts, «CHF 50'000»); geschrumpft wird nur seine
// Laufweite, per `.lc-apo` (index.css) — dieselbe Bauart wie `sansAmp`.
// Reine Darstellung (§3): formatiert wird, nicht gerundet.
export function zahlGruppiert(n: number): ReactNode {
  const teile = n.toLocaleString('de-CH').split("'");
  if (teile.length === 1) return teile[0];
  return teile.flatMap((teil, i) =>
    i === 0 ? [teil] : [<span key={i} className="lc-apo">&#39;</span>, teil],
  );
}
