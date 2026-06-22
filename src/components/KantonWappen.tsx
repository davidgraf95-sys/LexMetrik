// Amtliches Kantonswappen (gemeinfreie SVGs aus public/wappen/<KT>.svg, bezogen
// über Wikidata P94 → Wikimedia Commons). Reine Darstellung; der Kantonscode
// bleibt die SSoT. object-contain in fester Box, damit die unterschiedlichen
// Wappen-Seitenverhältnisse im Raster sauber ausgerichtet sind.
export function KantonWappen({ kanton, className = 'h-9 w-8' }: { kanton: string; className?: string }) {
  return (
    <img
      src={`/wappen/${kanton}.svg`}
      alt={`Wappen Kanton ${kanton}`}
      loading="lazy"
      width={32}
      height={36}
      className={`${className} object-contain shrink-0 select-none`}
      draggable={false}
    />
  );
}
