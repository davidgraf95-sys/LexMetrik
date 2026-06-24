// Amtliches Kantonswappen (gemeinfreie SVGs aus public/wappen/<KT>.svg, bezogen
// über Wikidata P94 → Wikimedia Commons). Reine Darstellung; der Kantonscode
// bleibt die SSoT. object-contain in fester Box, damit die unterschiedlichen
// Wappen-Seitenverhältnisse im Raster sauber ausgerichtet sind.
//
// `dekorativ`: im Tab-Streifen steht der Kantonsname ohnehin daneben (Titel) —
// dort wird das Wappen aria-hidden gesetzt, damit der Screenreader nicht
// «Wappen Kanton ZH» vor jeden Reiter-Titel liest (Review-Politur 25.6.2026).
// In Rastern/Übersichten (Default) bleibt der alt-Text als Beschriftung.
export function KantonWappen(
  { kanton, className = 'h-9 w-8', dekorativ = false }:
  { kanton: string; className?: string; dekorativ?: boolean },
) {
  return (
    <img
      src={`/wappen/${kanton}.svg`}
      alt={dekorativ ? '' : `Wappen Kanton ${kanton}`}
      aria-hidden={dekorativ || undefined}
      loading="lazy"
      width={32}
      height={36}
      className={`${className} object-contain shrink-0 select-none`}
      draggable={false}
    />
  );
}
