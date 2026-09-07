/**
 * `stand` maschinenlesbar — reine Projektion des Anzeige-Strings auf ein Datum.
 *
 * ── Warum KEIN neues Datenfeld (§5, Entscheid W3-TARIF-STAND 6.9.2026) ───────
 * Die ~954 Tarif-Einträge tragen `stand` als Anzeige-String in >6 Schreibweisen
 * («1.1.2024», «01.01.2024», «2024-01-01», «1. Januar 2024», «2012/2013»,
 * «geltende Fassung»). Ein zusätzlich gepflegtes `standIso`-Feld wäre eine
 * ZWEITE Wahrheit neben `stand` (§5) und müsste selbst bewacht werden; ein aus
 * ISO projizierter Anzeige-String wiederum verlöre die Zusätze, die `stand`
 * heute trägt («(Nachtrag 087)», «(Punktwert 1.1.2025)») — und diese Strings
 * stehen WÖRTLICH in `golden/lexmetrik-golden.json` (68 Vorkommen), müssen also
 * byte-gleich bleiben (§6).
 *
 * Darum die umgekehrte Richtung: `stand` bleibt die eine gepflegte Wahrheit,
 * das maschinenlesbare Datum ist eine deterministische PROJEKTION daraus. Kein
 * Datenfeld, kein Konsistenz-Tor nötig, kein Byte an den Daten geändert.
 *
 * ── Die Leseregel (bewusst konservativ, kein Raten) ──────────────────────────
 * Massgeblich ist das SPÄTESTE im String belegte Datum, mit seiner Granularität
 * (Tag oder Jahr). Begründung: was der String auch immer semantisch meint
 * («Erlass 1985 / Änderung 2011», «Stand X (Folgefassung Y)»), er behauptet
 * KEINE Fassung, die jünger als dieses Datum wäre. Für die Drift-Frage «ist die
 * amtliche Fassung neuer als die hinterlegte?» ist das die für die Daten
 * günstigste Lesart: fällt das Verdikt trotzdem auf DRIFT, gilt es unter jeder
 * anderen Lesart erst recht. Umgekehrt wird bei Jahres-Granularität innerhalb
 * desselben Jahres nie «aktuell» behauptet, sondern «unklar» (drift-logik.ts).
 *
 * §2: rein und deterministisch — kein `Date.now()`, keine Heuristik, kein Netz.
 * §7: nichts wird geraten; ein String ohne belegtes Datum ergibt `unbekannt`.
 */

export type Genauigkeit = 'tag' | 'jahr' | 'unbekannt';

export interface StandDatum {
  /** ISO-Datum «YYYY-MM-DD» (Genauigkeit 'tag') bzw. «YYYY» ('jahr'); sonst null. */
  iso: string | null;
  genauigkeit: Genauigkeit;
  /** Warum das Ergebnis so lautet — geht wörtlich in die Tor-Ausgabe. */
  grund: string;
}

/** Monatsnamen der drei Amtssprachen + Englisch-freie FR-Formen (klein geschrieben). */
const MONATE: Record<string, number> = {
  januar: 1, februar: 2, maerz: 3, 'märz': 3, april: 4, mai: 5, juni: 6,
  juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12,
  janvier: 1, 'février': 2, fevrier: 2, mars: 3, avril: 4, juin: 6,
  juillet: 7, 'août': 8, aout: 8, septembre: 9, octobre: 10, novembre: 11, 'décembre': 12, decembre: 12,
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre_it: 11, dicembre: 12,
};

/** true, wenn (j, m, t) ein echter Kalendertag ist (kein 31.2., kein 30.2.). */
function istKalendertag(j: number, m: number, t: number): boolean {
  if (m < 1 || m > 12 || t < 1 || t > 31) return false;
  const tage = [31, (j % 4 === 0 && j % 100 !== 0) || j % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return t <= tage[m - 1];
}

const zwei = (n: number): string => String(n).padStart(2, '0');

/** Sortierschlüssel: Jahres-Angaben zählen mit ihrer UNTERGRENZE (1. Januar),
 *  damit ein taggenaues Datum desselben Jahres als das spätere gewinnt. */
function schluessel(k: { jahr: number; monat?: number; tag?: number }): string {
  return `${k.jahr}-${zwei(k.monat ?? 1)}-${zwei(k.tag ?? 1)}`;
}

/**
 * Projiziert einen `stand`-Anzeige-String auf sein spätestes belegtes Datum.
 *
 * @example standDatum('1.1.2015 (Nachtrag 087)')  // { iso: '2015-01-01', genauigkeit: 'tag' }
 * @example standDatum('2012/2013')                // { iso: '2013', genauigkeit: 'jahr' }
 * @example standDatum('geltende Fassung')         // { iso: null, genauigkeit: 'unbekannt' }
 */
export function standDatum(stand: string): StandDatum {
  const roh = stand.trim();
  if (!roh) return { iso: null, genauigkeit: 'unbekannt', grund: 'leerer stand-String' };

  // AUSNAHME (benannt, damit sie nicht still zur Regel wird): «bis TT.MM.JJJJ»
  // nennt das ENDE der Geltung, nicht die Fassung. Unter der Spätestes-Datum-
  // Regel läse es sich als Fassungsdatum und könnte fälschlich «aktuell»
  // ergeben (falsches Grün, §6.7). Darum ausdrücklich unbekannt.
  if (/^bis\b/i.test(roh)) {
    return { iso: null, genauigkeit: 'unbekannt', grund: `«${roh}» nennt ein Enddatum, kein Fassungsdatum` };
  }

  const kandidaten: Array<{ iso: string; genauigkeit: Genauigkeit; sort: string }> = [];
  // Rest-String: als gültig ERKANNTE Volldaten werden ausgeixt, damit ihre
  // Jahreszahl nicht ein zweites Mal als blosse Jahresangabe zählt. Ein
  // verworfenes Scheindatum («31.2.2024») bleibt stehen — seine Jahreszahl ist
  // weiterhin belegt und darf nicht mit dem Scheindatum verschwinden.
  let rest = roh;
  const streiche = (index: number, laenge: number) => {
    rest = rest.slice(0, index) + ' '.repeat(laenge) + rest.slice(index + laenge);
  };

  // 1. ISO «YYYY-MM-DD».
  for (const m of roh.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) {
    const [j, mo, t] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (istKalendertag(j, mo, t)) {
      streiche(m.index ?? 0, m[0].length);
      kandidaten.push({ iso: `${m[1]}-${m[2]}-${m[3]}`, genauigkeit: 'tag', sort: schluessel({ jahr: j, monat: mo, tag: t }) });
    }
  }

  // 2. «T.M.JJJJ» / «TT.MM.JJJJ» (auch «7.10.1986», auch in «25.3.2014/17.3.2015»).
  for (const m of roh.matchAll(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g)) {
    const [t, mo, j] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (istKalendertag(j, mo, t)) {
      streiche(m.index ?? 0, m[0].length);
      kandidaten.push({ iso: `${j}-${zwei(mo)}-${zwei(t)}`, genauigkeit: 'tag', sort: schluessel({ jahr: j, monat: mo, tag: t }) });
    }
  }

  // 3. Ausgeschriebener Monat: «1. Januar 2024», «13 mai 2015», «13 juin 2012».
  const monatsMuster = new RegExp(
    `\\b(\\d{1,2})\\.?\\s+(${Object.keys(MONATE).filter((k) => !k.endsWith('_it')).join('|')})\\s+(\\d{4})\\b`,
    'gi',
  );
  for (const m of roh.matchAll(monatsMuster)) {
    const t = Number(m[1]);
    const mo = MONATE[m[2].toLowerCase()];
    const j = Number(m[3]);
    if (mo && istKalendertag(j, mo, t)) {
      streiche(m.index ?? 0, m[0].length);
      kandidaten.push({ iso: `${j}-${zwei(mo)}-${zwei(t)}`, genauigkeit: 'tag', sort: schluessel({ jahr: j, monat: mo, tag: t }) });
    }
  }

  // 4. Blosse Jahreszahl im ÜBRIGEN String («2012/2013», «konsolidierte Fassung 2026»).
  //    Fenster 1900–2099: schliesst Nachtragsnummern («087») und Beträge aus.
  for (const m of rest.matchAll(/\b(19|20)\d{2}\b/g)) {
    const j = Number(m[0]);
    kandidaten.push({ iso: String(j), genauigkeit: 'jahr', sort: schluessel({ jahr: j }) });
  }

  if (kandidaten.length === 0) {
    return { iso: null, genauigkeit: 'unbekannt', grund: `«${roh}» nennt kein Datum` };
  }

  // Befund M1 (W3-TARIF-STAND Nachzug 6.9.2026, konservativ nach §7): tragen
  // die Kandidaten UNTERSCHIEDLICHE JAHRE, ist offen, welcher davon die
  // Fassung meint — «spätestes gewinnt» hat das bisher geraten und lag
  // nachweislich falsch: «1.1.2017 (Punktwert 1.1.2025)» (notariat-grundbuch.ts,
  // RSJU 176.331) ist Stand 2017, das zweite Datum nennt nur den Stichtag eines
  // indexierten Punktwerts, keine neue Fassung; ebenso «2025/2020» (AG) und
  // «2019/2025» (ZG) — welcher der beiden Werte die Fassung trägt, steht im
  // String nicht. Ein rein struktureller Parser kann das nicht von echten
  // Folgefassungen unterscheiden (geprüft: der heutige Code kennt keinen
  // Zusatz, der ein zweites belegtes Datum ignoriert — «Nachtrag 087» etc.
  // sind bereits vorher unwirksam, weil sie GAR KEIN Datum sind, nicht weil
  // ein erkanntes Datum verworfen würde). Darum: im Zweifel unbekannt, nicht
  // raten — keine Ausnahme, bis ein solcher Zusatz belegt ist.
  //
  // Dasselbe Jahr in mehreren Granularitäten («2026» und «1.3.2026») ist KEINE
  // Mehrdeutigkeit — beide belegen dasselbe Jahr, die taggenaue Lesart ist nur
  // die präzisere (unverändert gegenüber der bisherigen Regel, Fall 5b unten).
  const jahre = new Set(kandidaten.map((k) => k.iso.slice(0, 4)));
  if (jahre.size > 1) {
    const namen = kandidaten.map((k) => k.iso).join(', ');
    return {
      iso: null,
      genauigkeit: 'unbekannt',
      grund: `«${roh}» mehrdeutig: ${jahre.size} unterschiedliche Jahre belegt (${namen})`,
    };
  }

  // Innerhalb desselben Jahres: taggenau schlägt Jahres-Granularität; bei
  // mehreren taggenauen Daten im selben Jahr gewinnt weiterhin das spätere.
  kandidaten.sort((a, b) =>
    a.sort === b.sort
      ? (a.genauigkeit === 'tag' ? -1 : 1)
      : (a.sort < b.sort ? 1 : -1));
  const sieger = kandidaten[0];
  const grund = kandidaten.length === 1
    ? `«${roh}» → ${sieger.iso}`
    : `«${roh}» → ${sieger.iso} (${kandidaten.length} Angaben, dasselbe Jahr)`;
  return { iso: sieger.iso, genauigkeit: sieger.genauigkeit, grund };
}
