// ─── Begrüssungs-Pools der Startseite (W2·23-STARTSEITE-V4 §4) ──────────────
//
// Auftrag David 5.9.2026: «es hatte früher mal verschiedene begrüssungen. das
// hat mir noch gefallen und es etwas persönlicher gemacht.» Die Pools sind der
// KURATIERTE Nachlass der früheren `components/start/Begruessung.tsx`
// (Fassung vor f2643c53e): Tageszeit-Fenster 5–10 · 10–14 · 14–18 · 18–22 ·
// 22–5 plus ein tageszeit-unabhängiger «immer»-Pool, Hochdeutsch und
// Schweizerdeutsch gemischt, dezent kanzlei-gefärbt.
//
// KURATIERT, nicht 1:1 übernommen (§4-Auflage): Sprichwort-Fragmente («Der
// frühe Vogel …», «Morgenstund hat Gold im Mund», «Schaffe, schaffe …») und
// alles, was nach Werbung oder Kalauer klingt («Willkommen im Paragraphen-
// dickicht», «Die Eule unter den Juristen?», «Hallöchen», «Servus»), sind
// gestrichen. Jeder Eintrag ist ein ganzer Satz oder ein Gruss MIT Punkt — die
// Zeile im Hero setzt keine Interpunktion nach.
//
// LÄNGE ist eine Layout-Zusage, keine Stilfrage: die Grussliste hält jeden
// Eintrag kurz genug, dass die Begrüssungszeile auch auf 390 px einzeilig
// bleibt (Höhen-Reservierung im Hero, CLS). Der Wächter dazu steht in
// src/tests/begruessungen.test.ts.
//
// §2 (Determinismus): diese Datei bleibt REIN. Sie liefert Sprachmaterial und
// eine Auswahlfunktion, deren Zufallsquelle der AUFRUFER mitbringt — der
// eslint-Riegel gegen `Math.random()` in `src/lib/**` greift hier also nicht
// durch eine Ausnahme, sondern weil es hier gar keinen Zufall gibt.

/** Obergrenze für die Zeichenlänge eines Grusses (Einzeiligkeit @390 px). */
export const GRUSS_MAX_ZEICHEN = 30;

/** Tageszeit-unabhängige Grüsse — kommen zu JEDEM Tageszeit-Pool dazu. */
export const IMMER: readonly string[] = [
  // Hochdeutsch, höflich
  'Herzlich willkommen.',
  'Willkommen zurück.',
  'Willkommen bei LexMetrik.',
  'Schön, dass Sie da sind.',
  'Schön, dass Sie reinschauen.',
  'Schön, Sie wieder zu sehen.',
  'Seien Sie gegrüsst.',
  // Schweizerdeutsch, regional gestreut
  'Grüezi.',
  'Grüezi wohl.',
  'Grüezi mitenand.',
  'Grüezi zäme.',
  'Grüessech.',
  'Salü zäme.',
  'Sali mitenand.',
  'Hoi zäme.',
  // Dezent kanzlei-gefärbt
  'Die Akten warten.',
  'Frisch ans Dossier.',
  'Ihr Tag, Ihre Akten.',
];

export interface Tageszeit {
  /** Stabile Kennung (Tests, Debug). */
  id: 'morgen' | 'tag' | 'nachmittag' | 'abend' | 'nacht';
  /** Fenster [ab, bis) in Stunden; das Nacht-Fenster überspannt Mitternacht. */
  ab: number;
  bis: number;
  pool: readonly string[];
}

export const TAGESZEITEN: readonly Tageszeit[] = [
  {
    id: 'morgen', ab: 5, bis: 10, pool: [
      'Guten Morgen.',
      'Schönen guten Morgen.',
      'Einen guten Morgen Ihnen.',
      'Einen ruhigen Morgen.',
      'Einen klaren Morgen.',
      'Einen produktiven Morgen.',
      'Einen guten Start in den Tag.',
      'Schönen Start in den Tag.',
      'Bereit für den Tag?',
      'Guete Morge.',
      'Guete Morge zäme.',
      'Guete Morge mitenand.',
      'En schöne Morge.',
      'En guete Start id Tag.',
      'Einen guten Aktenmorgen.',
      'Die ersten Paragraphen warten.',
      'Ein neuer Tag, neue Fälle.',
      'Auf eine gute Aktenlage.',
    ],
  },
  {
    id: 'tag', ab: 10, bis: 14, pool: [
      'Guten Tag.',
      'Schönen guten Tag.',
      'Einen schönen Tag.',
      'Einen angenehmen Tag.',
      'Einen produktiven Tag.',
      'Weiterhin guten Tag.',
      'Guten Mittag.',
      'Schöne Mittagszeit.',
      'En Guete zum Mittag.',
      'Guete Tag.',
      'En guete Tag zäme.',
      'En schöne Tag.',
      'Schöne Mittag mitenand.',
      'Mitten im Tagwerk.',
      'Mitten in den Akten.',
      'Auf eine klare Rechtslage.',
      'Die Fälle laufen.',
      'Einen guten Verhandlungstag.',
    ],
  },
  {
    id: 'nachmittag', ab: 14, bis: 18, pool: [
      'Einen schönen Nachmittag.',
      'Schönen Nachmittag.',
      'Einen angenehmen Nachmittag.',
      'Einen ruhigen Nachmittag.',
      'Einen produktiven Nachmittag.',
      'Auf einen guten Nachmittag.',
      'Schönen Tag noch.',
      'Auf die zweite Tageshälfte.',
      'Endspurt am Nachmittag.',
      'Guete Namittag.',
      'En schöne Namittag.',
      'Schöne Namittag mitenand.',
      'Witer en schöne Tag.',
      'Zeit für einen Kaffee?',
      'Ein Käfeli gefällig?',
      'Weiterhin gute Aktenlage.',
      'Die Dossiers im Griff?',
      'Noch ein Schriftsatz heute?',
    ],
  },
  {
    id: 'abend', ab: 18, bis: 22, pool: [
      'Guten Abend.',
      'Einen schönen Abend.',
      'Einen angenehmen Abend.',
      'Einen ruhigen Abend.',
      'Einen geruhsamen Abend.',
      'Einen erholsamen Abend.',
      'Schönen Feierabend.',
      'Einen schönen Feierabend.',
      'Der Tag klingt aus.',
      'Lassen Sie den Tag ausklingen.',
      'Guete Aabig.',
      'En schöne Aabig.',
      'En gmüetliche Aabig.',
      'Schöne Fyrabig.',
      'Schöne Aabig zäme.',
      'Die Akten dürfen ruhen.',
      'Ein guter Tag fürs Recht.',
      'Dossier zu, Feierabend auf.',
    ],
  },
  {
    id: 'nacht', ab: 22, bis: 5, pool: [
      'Gute Nacht.',
      'Eine ruhige Nacht.',
      'Eine geruhsame Nacht.',
      'Eine erholsame Nacht.',
      'Schlafen Sie gut.',
      'Einen ruhigen Ausklang.',
      'Schönen späten Abend.',
      'Ein ruhiges Ende des Tages.',
      'Noch spät am Werk?',
      'Nachtschicht?',
      'Gönnen Sie sich Ruhe.',
      'Morgen ist auch noch ein Tag.',
      'Gueti Nacht.',
      'En schöni Nacht.',
      'Schlaf guet.',
      'No spaat dra?',
      'Paragraphen warten bis morgen.',
      'Der Fall läuft nicht davon.',
    ],
  },
];

/** Tageszeit zu einer Stunde 0–23. Das Nacht-Fenster (22–5) überspannt
 *  Mitternacht und wird darum gesondert geprüft. */
export function tageszeitFuer(stunde: number): Tageszeit {
  const nacht = TAGESZEITEN[TAGESZEITEN.length - 1];
  if (stunde >= nacht.ab || stunde < nacht.bis) return nacht;
  return TAGESZEITEN.find((t) => stunde >= t.ab && stunde < t.bis) ?? nacht;
}

/** Auswahlmenge einer Stunde: Tageszeit-Pool + «immer»-Pool. */
export function begruessungsPool(stunde: number): readonly string[] {
  return [...tageszeitFuer(stunde).pool, ...IMMER];
}

/**
 * Ein Gruss für die angegebene Stunde. `zufall` ist PFLICHT-Parameter, ohne
 * Default: `src/lib/**` ist die Logikschicht, in der §2 mechanisch gesperrt ist
 * (eslint no-restricted-properties — kein `Math.random()` hier). Die Zufalls-
 * QUELLE liegt darum beim Aufrufer in der Darstellungsschicht
 * (`components/start/Begruessung.tsx`), diese Funktion bleibt rein und im Test
 * deterministisch prüfbar. Davids Wunsch «verschiedene» betrifft die ANZEIGE,
 * nicht die Prüfbarkeit.
 */
export function waehleBegruessung(stunde: number, zufall: () => number): string {
  const pool = begruessungsPool(stunde);
  const i = Math.min(pool.length - 1, Math.max(0, Math.floor(zufall() * pool.length)));
  return pool[i];
}
