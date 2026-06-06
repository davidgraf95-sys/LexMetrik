import { rechtsprechungUrl, RECHTSPRECHUNG_IM_TEXT } from '../lib/bge';

// ─── Rechtsprechungs-Verlinkung (Web-Anzeige; Auftrag David 6.6.2026) ───────
//
// Zitierte Entscheide (BGE / BGer-Urteile) werden in der WEB-Anzeige zum
// amtlichen Link (bger.ch); der Anzeigetext bleibt zeichenidentisch (§1 —
// nur Darstellung). PDF-/DOCX-Renderer sind bewusst NICHT berührt.
// Suchlinks (Urteile ohne ableitbaren Permalink) tragen einen title-Hinweis.

export function RechtsprechungAnker({ aktenzeichen, className }: {
  aktenzeichen: string;
  className?: string;
}) {
  const link = rechtsprechungUrl(aktenzeichen);
  if (!link) return <>{aktenzeichen}</>;
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer"
      title={link.direkt ? 'Entscheid auf bger.ch öffnen' : 'Suche in der amtlichen Urteilsdatenbank (bger.ch)'}
      className={className ?? 'underline decoration-dotted underline-offset-2 hover:text-brass-700'}>
      {aktenzeichen}
    </a>
  );
}

/** Fliesstext mit verlinkten Entscheid-Zitaten — Text bleibt zeichenidentisch. */
export function RechtsprechungText({ text }: { text: string }) {
  const teile: React.ReactNode[] = [];
  let zuletzt = 0;
  for (const treffer of text.matchAll(RECHTSPRECHUNG_IM_TEXT)) {
    const start = treffer.index;
    if (start > zuletzt) teile.push(text.slice(zuletzt, start));
    teile.push(<RechtsprechungAnker key={`${start}-${treffer[0]}`} aktenzeichen={treffer[0]} />);
    zuletzt = start + treffer[0].length;
  }
  if (teile.length === 0) return <>{text}</>;
  if (zuletzt < text.length) teile.push(text.slice(zuletzt));
  return <>{teile}</>;
}
