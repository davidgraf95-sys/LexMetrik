// Minimale Linien-Icons (Platzhalter). Werden mit dem Designsystem ersetzt.
// Schlüssel entsprechen den `icon`-Feldern der Rechner-Registry.

const PATHS: Record<string, string> = {
  document: 'M7 3h7l4 4v14H7zM14 3v4h4',
  clock: 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  percent: 'M19 5 5 19M7.5 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm12 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
  scale: 'M12 4v16M6 8h12M6 8l-3 6h6zm12 0 3 6h-6zM8 20h8',
  house: 'M4 11 12 4l8 7M6 10v10h12V10',
  clipboard: 'M9 4h6v3H9zM7 5H5v16h14V5h-2',
};

export function Icon({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  const d = PATHS[name] ?? PATHS.document;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
