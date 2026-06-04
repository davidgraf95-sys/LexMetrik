import type { ReactNode } from 'react';

// Rendert «&» in Display-Titeln in der Sans-Schrift (Geist) statt der
// verschnörkelten Fraunces-Glyphe. Styling über .lc-amp (index.css).
export function sansAmp(text: string): ReactNode {
  if (!text.includes('&')) return text;
  return text.split('&').flatMap((teil, i) =>
    i === 0 ? [teil] : [<span key={i} className="lc-amp">&amp;</span>, teil],
  );
}
