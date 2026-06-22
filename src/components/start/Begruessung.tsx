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
  // ─ Hochdeutsch, höflich ─
  'Hallo', 'Hallo und willkommen', 'Herzlich willkommen', 'Willkommen zurück',
  'Schön, dass Sie da sind', 'Schön, sind Sie hier', 'Schön, Sie zu sehen',
  'Schön, dass Sie reinschauen', 'Da sind Sie ja', 'Schön, Sie wieder hier zu haben',
  'Willkommen an Bord', 'Grüss Gott', 'Seien Sie gegrüsst',
  // ─ Schweizerdeutsch, regional gestreut ─
  'Grüezi', 'Grüezi wohl', 'Grüezi mitenand', 'Grüezi alli', 'Grüezi zäme',
  'Salü', 'Salü zäme', 'Sali', 'Sali zäme', 'Sali alli', 'Sali mitenand',
  'Hoi', 'Hoi zäme', 'Hoi mitenand', 'Tschau zäme',
  'Grüessech', 'Grüessech wohl',        // Bärndütsch
  'Grüessdi', 'Grüessech mitenand',     // Baseldütsch / Bern
  'Tagwohl', 'Sali bisäme',             // Wallis / Aargau
  'Hallöchen', 'Servus', 'Grüezi und willkommen',
  // ─ Dezent kanzlei-/rechts-gefärbt ─
  'Willkommen bei LexMetrik', 'Schön, dass Sie an die Akten gehen',
  'Bereit fürs Recht', 'Recht und Ordnung – willkommen',
  'Ihr Tag, Ihre Akten', 'Willkommen in der Rechtsstube',
  'Frisch ans Dossier', 'Die Akten warten', 'Willkommen im Paragraphendickicht',
  'Schön, dass Sie Recht behalten wollen',
];

const GRUESSE: { ab: number; bis: number; pool: string[] }[] = [
  { ab: 5, bis: 10, pool: [
    // Hochdeutsch
    'Guten Morgen', 'Schönen guten Morgen', 'Einen wunderschönen Morgen',
    'Guten Morgen miteinander', 'Einen schönen Morgen', 'Einen guten Morgen Ihnen',
    'Auf einen guten Morgen', 'Einen klaren Morgen', 'Einen frischen Morgen',
    'Einen sonnigen Morgen', 'Einen ruhigen Morgen', 'Einen feinen Morgen',
    // Start-in-den-Tag
    'Einen guten Start in den Tag', 'Schönen Start in den Tag',
    'Einen schwungvollen Start', 'Einen guten Start', 'Auf einen guten Tag',
    'Einen produktiven Morgen', 'Einen erfolgreichen Morgen',
    'Bereit für den Tag?', 'Frisch ans Werk', 'Frisch ans Tagwerk',
    'Voller Tatendrang in den Tag', 'Möge der Tag gelingen',
    // Sprichwörtlich
    'Morgenstund hat Gold im Mund', 'Der frühe Vogel …',
    'Wer früh aufsteht …', 'Der Morgen gehört den Fleissigen',
    // Schweizerdeutsch
    'Guete Morge', 'Guete Morge mitenand', 'Schöne guete Morge',
    'En guete Morge', 'En schöne Morge', 'En guete Start id Tag',
    'Guete Morge zäme', 'Morge zäme', 'Frisch dra hütt',
    // Kanzlei
    'Einen guten Aktenmorgen', 'Die ersten Paragraphen warten',
    'Ein neuer Tag, neue Fälle', 'Auf eine gute Aktenlage',
  ] },
  { ab: 10, bis: 14, pool: [
    // Hochdeutsch
    'Guten Tag', 'Schönen guten Tag', 'Einen schönen Tag', 'Einen wunderschönen Tag',
    'Einen schönen Tag Ihnen', 'Auf einen guten Tag', 'Einen angenehmen Tag',
    'Einen erfolgreichen Tag', 'Einen produktiven Tag', 'Einen schönen Wochentag',
    'Schön, dass Sie da sind', 'Weiterhin guten Tag', 'Möge der Tag gelingen',
    // Mittag
    'Guten Mittag', 'Schönen Mittag', 'Einen schönen Mittag', 'Schöne Mittagszeit',
    'Einen guten Mittag', 'Schon Mittag?', 'Zeit für die Mittagspause?',
    'En Guete zum Mittag', 'En Guete', 'Lassen Sie es sich schmecken',
    // Schwung
    'Schaffe, schaffe …', 'Mitten im Tagwerk', 'Volle Fahrt voraus',
    'Der Tag läuft', 'Bestens unterwegs', 'Schön produktiv heute',
    // Schweizerdeutsch
    'Guete Tag', 'En guete Tag', 'En schöne Tag', 'Schöne Tag mitenand',
    'En guete Tag zäme', 'Schöne Mittag mitenand', 'En Guete zäme',
    // Kanzlei
    'Mitten in den Akten', 'Auf eine klare Rechtslage', 'Die Fälle laufen',
    'Einen erfolgreichen Verhandlungstag',
  ] },
  { ab: 14, bis: 18, pool: [
    // Hochdeutsch
    'Guten Tag', 'Einen schönen Nachmittag', 'Schönen Nachmittag',
    'Einen wunderschönen Nachmittag', 'Einen angenehmen Nachmittag',
    'Einen produktiven Nachmittag', 'Einen entspannten Nachmittag',
    'Auf einen guten Nachmittag', 'Weiterhin guten Tag', 'Schönen Tag noch',
    'Einen ruhigen Nachmittag', 'Einen erfolgreichen Nachmittag',
    'Schön, dass Sie noch dran sind', 'Bleiben Sie dran',
    // Schwung / Endspurt
    'Auf die zweite Tageshälfte', 'Noch viel vor heute?',
    'Der Nachmittag gehört Ihnen', 'Gut durch den Tag bisher?',
    'Zeit für einen Kaffee?', 'Ein Käfeli gefällig?', 'Durchatmen und weiter',
    'Endspurt am Nachmittag', 'Die Zielgerade naht',
    // Schweizerdeutsch
    'Guete Namittag', 'Schöne Namittag', 'En schöne Namittag',
    'Schöne Namittag mitenand', 'En guete Namittag', 'En schöne Namittag zäme',
    'Witer en schöne Tag', 'Schöne Tag no',
    // Kanzlei
    'Weiterhin gute Aktenlage', 'Auf einen klaren Nachmittag',
    'Die Dossiers im Griff?', 'Noch ein Schriftsatz vor Feierabend?',
  ] },
  { ab: 18, bis: 22, pool: [
    // Hochdeutsch
    'Guten Abend', 'Einen schönen Abend', 'Einen wunderschönen Abend',
    'Schönen Abend noch', 'Einen angenehmen Abend', 'Einen gemütlichen Abend',
    'Einen ruhigen Abend', 'Einen entspannten Abend', 'Einen erholsamen Abend',
    'Auf einen schönen Abend', 'Einen feinen Abend', 'Einen geruhsamen Abend',
    'Schön, sind Sie noch da', 'Schön, dass Sie noch reinschauen',
    // Feierabend
    'Schönen Feierabend', 'Einen schönen Feierabend', 'Bald Feierabend?',
    'Zeit zum Durchschnaufen', 'Der Tag klingt aus', 'Gut gearbeitet heute',
    'Lassen Sie den Tag ausklingen', 'Feierabend in Sicht',
    'Noch ein letzter Punkt?', 'Verdienter Feierabend naht',
    // Schweizerdeutsch
    'Guete Aabig', 'Schöne Aabig', 'En schöne Aabig', 'En guete Aabig',
    'Schöne Aabig mitenand', 'En gmüetliche Aabig', 'Schöne Fyrabig',
    'En schöne Fyrabig', 'Schöne Aabig zäme', 'Gniess de Aabig',
    // Kanzlei
    'Die Akten dürfen ruhen', 'Schluss für heute mit den Paragraphen?',
    'Ein guter Tag fürs Recht', 'Dossier zu, Feierabend auf',
  ] },
  { ab: 22, bis: 5, pool: [
    // Hochdeutsch
    'Gute Nacht', 'Eine gute Nacht', 'Eine ruhige Nacht', 'Eine geruhsame Nacht',
    'Eine erholsame Nacht', 'Schlafen Sie gut', 'Träumen Sie schön',
    'Einen ruhigen Ausklang', 'Schönen späten Abend', 'Ein ruhiges Ende des Tages',
    // Spätschicht
    'Noch spät am Werk?', 'Brennt die Lampe noch?', 'Spätschicht?',
    'Nachtschicht?', 'Die Eule unter den Juristen?', 'Noch wach und produktiv?',
    'Nicht mehr zu lange', 'Bald Feierabend?', 'Zeit fürs Bett bald?',
    'Der Tag ist eigentlich vorbei', 'Auch Akten brauchen Schlaf',
    'Gönnen Sie sich Ruhe', 'Morgen ist auch noch ein Tag',
    'Die Nacht gehört der Erholung', 'Genug für heute?',
    // Schweizerdeutsch
    'Gueti Nacht', 'En schöni Nacht', 'Schlaf guet', 'No spaat dra?',
    'Bald is Bett?', 'Gniess d Rueh', 'Mach nüm so lang',
    // Kanzlei
    'Die Paragraphen warten bis morgen', 'Der Fall läuft Ihnen nicht davon',
    'Ruhe für Richter und Anwälte', 'Schluss mit den Akten für heute',
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
