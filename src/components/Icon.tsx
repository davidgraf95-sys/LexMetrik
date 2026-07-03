// Linien-Icons im Gravur-Stil des Designsystems: feine Strichstärke (1.5),
// runde Kappen, ruhige Geometrie auf 24×24. Schlüssel entsprechen den
// `icon`-Feldern der Rechner-/Vorlagen-Registry.

const PATHS: Record<string, string> = {
  // Dokument: Blatt mit Eselsohr und Textzeilen
  document: 'M7 3h7l4 4v14H7z M14 3v4h4 M10 12h4.5 M10 15h4.5',
  // Uhr als Instrument: Zifferblatt mit Viertel-Ticks und Zeigern
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z M12 5v1.5 M19 12h-1.5 M12 19v-1.5 M5 12h1.5 M12 8.5V12l2.8 1.8',
  // Prozent: Diagonale mit zwei feinen Ringen
  percent: 'M18.5 5.5l-13 13 M9 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z M19 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  // Waage: Balken, hängende Schalen, Fuss
  scale: 'M12 3.5V20 M8.5 20h7 M4.5 6.5h15 M4.5 6.5l-2 5h4l-2-5Z M19.5 6.5l-2 5h4l-2-5Z M2.5 11.5a2 2 0 0 0 4 0 M17.5 11.5a2 2 0 0 0 4 0',
  // Haus: Dachlinie, Korpus, Tür
  house: 'M3.5 11 12 4l8.5 7 M6 9.5V20h12V9.5 M10.5 20v-5.5h3V20',
  // Klemmbrett: Brett, Clip, Zeilen
  clipboard: 'M9.5 3.5h5a1 1 0 0 1 1 1V6h-7V4.5a1 1 0 0 1 1-1Z M8.5 5h-2v15.5h11V5h-2 M9.5 10.5h5 M9.5 13.5h5 M9.5 16.5h3',
  // Gericht: Giebel, Säulenreihe, Sockel (klassizistische Justiz-Fassade)
  court: 'M3.5 8.5 12 4l8.5 4.5 M4.5 8.5v.5h15v-.5 M6.5 10.5V18 M10 10.5V18 M14 10.5V18 M17.5 10.5V18 M4 18h16 M3 20.5h18',
  // Rechner: Gehäuse, Anzeigefeld, Tastenraster
  calculator: 'M6 3.5h12v17H6z M8.5 6.5h7v3h-7z M9 13h.01 M12 13h.01 M15 13h.01 M9 16.5h.01 M12 16.5h.01 M15 16.5h.01',
};

export function Icon({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  const d = PATHS[name] ?? PATHS.document;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
