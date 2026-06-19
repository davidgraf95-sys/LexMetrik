import { useEffect, useState } from 'react';

// ─── Begrüssung + Datum/Uhrzeit (Startseite V2) ─────────────────────────────
//
// Reine Darstellung. Die Begrüssung wechselt bei jedem Seitenaufruf zufällig aus
// einem zur TAGESZEIT passenden Pool (Auftrag David); rechts steht das aktuelle
// Datum mit live tickender Uhr. Beides ist client-spezifisch — die Seite wird
// prerendert, darum suppressHydrationWarning (der am Build gebackene Wert wird
// beim Hydrieren ohne Warnung durch den echten ersetzt).

// Zu jeder Tageszeit passende, GANZE Tags-übergreifende Grüsse stehen zusätzlich
// im «immer»-Pool; so kommt möglichst viel Abwechslung (Auftrag David).
const IMMER = [
  'Grüezi wohl', 'Grüezi mitenand', 'Grüezi', 'Salü', 'Hallo', 'Hoi',
  'Hallo und willkommen', 'Schön, dass Sie da sind', 'Willkommen zurück',
  'Schön, sind Sie hier', 'Grüss Gott', 'Sali zäme', 'Hoi zäme',
];

const GRUESSE: { ab: number; bis: number; pool: string[] }[] = [
  { ab: 5, bis: 10, pool: [
    'Guten Morgen', 'Einen wunderschönen Morgen', 'Schönen guten Morgen',
    'Guete Morge', 'Einen guten Start in den Tag', 'Morgenstund hat Gold im Mund',
    'Frisch ans Werk', 'Einen produktiven Morgen', 'Schönen Start in den Tag',
    'Guten Morgen miteinander', 'Auf einen guten Morgen', 'Einen klaren Morgen',
  ] },
  { ab: 10, bis: 14, pool: [
    'Guten Tag', 'Schönen guten Tag', 'Guete Tag', 'Einen schönen Tag',
    'Schönen Mittag', 'Guten Mittag', 'Einen erfolgreichen Tag',
    'Auf einen guten Tag', 'Schaffe, schaffe …', 'Einen schönen Wochentag',
  ] },
  { ab: 14, bis: 18, pool: [
    'Guten Tag', 'Einen schönen Nachmittag', 'Schönen Nachmittag', 'Guete Namittag',
    'Einen produktiven Nachmittag', 'Auf einen guten Nachmittag', 'Schönen Tag noch',
    'Einen angenehmen Nachmittag', 'Weiterhin guten Tag',
  ] },
  { ab: 18, bis: 22, pool: [
    'Guten Abend', 'Einen schönen Abend', 'Schönen Feierabend', 'Guete Aabig',
    'Einen gemütlichen Abend', 'Schönen Abend noch', 'Einen ruhigen Abend',
    'Auf einen schönen Abend', 'Schön, sind Sie noch da', 'Einen entspannten Abend',
  ] },
  { ab: 22, bis: 5, pool: [
    'Gute Nacht', 'Noch spät am Werk?', 'Schönen späten Abend', 'Eine ruhige Nacht',
    'Brennt die Lampe noch?', 'Spätschicht?', 'Einen ruhigen Ausklang',
    'Nicht mehr zu lange', 'Eine geruhsame Nacht', 'Bald Feierabend?',
  ] },
];

function poolFuer(h: number): string[] {
  // Nacht-Fenster (22–5) überspannt Mitternacht → gesondert prüfen.
  const nacht = GRUESSE[GRUESSE.length - 1];
  if (h >= nacht.ab || h < 5) return nacht.pool;
  return (GRUESSE.find((g) => h >= g.ab && h < g.bis) ?? GRUESSE[1]).pool;
}

function waehleGruss(): string {
  // Tageszeit-Pool + tageszeitunabhängige Grüsse → maximale Abwechslung.
  const pool = [...poolFuer(new Date().getHours()), ...IMMER];
  return pool[Math.floor(Math.random() * pool.length)];
}

const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const zwei = (n: number) => String(n).padStart(2, '0');
function datumZeit(d: Date): string {
  return `${WOCHENTAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()} · ${zwei(d.getHours())}:${zwei(d.getMinutes())}:${zwei(d.getSeconds())}`;
}

export function Begruessung() {
  // Gruss EINMAL pro Aufruf zufällig (lazy init) — ändert sich nicht im Sekundentakt.
  const [gruss] = useState(waehleGruss);
  const [jetzt, setJetzt] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setJetzt(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h1 suppressHydrationWarning className="font-display font-semibold text-ink-900 text-h2 leading-tight">
        {gruss}
      </h1>
      <p suppressHydrationWarning className="num text-body-s text-ink-500 whitespace-nowrap">
        {datumZeit(jetzt)}
      </p>
    </div>
  );
}
