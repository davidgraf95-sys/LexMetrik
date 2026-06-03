import { parseISO, addDays, addMonths, addYears, format, isBefore, isAfter } from 'date-fns';
import type { Normverweis, Rechenschritt } from '../types/legal';
import type { ZpoInput, ZpoErgebnis, ZpoVerfahren, ZpoEinheit } from '../types/zpo';
import {
  stillstandsperioden,
  stillstandsperiodeFuer,
  dauerTage,
  istArbeitsfreierTag,
} from '../data/zpoFeiertage';

// ─── Feste Normverweise (Art. 142–148 ZPO) ────────────────────────────────

const N_142_1:    Normverweis = { artikel: 'Art. 142 Abs. 1 ZPO', bemerkung: 'Tagesfrist: Beginn am Folgetag' };
const N_142_1bis: Normverweis = { artikel: 'Art. 142 Abs. 1bis ZPO', bemerkung: 'Zustellung an arbeitsfreiem Tag' };
const N_142_2:    Normverweis = { artikel: 'Art. 142 Abs. 2 ZPO', bemerkung: 'Wochen-/Monats-/Jahresfrist: gleichbezeichneter Tag' };
const N_142_3:    Normverweis = { artikel: 'Art. 142 Abs. 3 ZPO', bemerkung: 'Ende am Sa/So/Feiertag → nächster Werktag' };
const N_143:      Normverweis = { artikel: 'Art. 143 ZPO', bemerkung: 'Fristwahrung (Expeditionsprinzip)' };
const N_144_1:    Normverweis = { artikel: 'Art. 144 Abs. 1 ZPO', bemerkung: 'Gesetzliche Frist nicht erstreckbar' };
const N_144_2:    Normverweis = { artikel: 'Art. 144 Abs. 2 ZPO', bemerkung: 'Gerichtliche Frist erstreckbar' };
const N_145_1:    Normverweis = { artikel: 'Art. 145 Abs. 1 ZPO', bemerkung: 'Fristenstillstand (Gerichtsferien)' };
const N_145_2:    Normverweis = { artikel: 'Art. 145 Abs. 2 ZPO', bemerkung: 'Ausnahmen vom Stillstand' };
const N_145_3:    Normverweis = { artikel: 'Art. 145 Abs. 3 ZPO', bemerkung: 'Hinweispflicht des Gerichts' };
const N_146_1:    Normverweis = { artikel: 'Art. 146 Abs. 1 ZPO', bemerkung: 'Wirkung des Stillstands / Aufschub' };
const N_147:      Normverweis = { artikel: 'Art. 147 ZPO', bemerkung: 'Säumnis' };
const N_148:      Normverweis = { artikel: 'Art. 148 ZPO', bemerkung: 'Wiederherstellung' };

// ─── Verfahrensart → Geltung des Fristenstillstands (Art. 145 Abs. 2) ─────

const STILLSTAND_GILT: Record<ZpoVerfahren, boolean> = {
  ordentlich: true,
  vereinfacht: true,
  familienrecht: true,
  klagefrist_klagebewilligung: true, // Art. 209 Abs. 3/4 – gehört zum gerichtlichen Verfahren
  schlichtung: false,
  summarisch: false,
  rechtsmittel_summarisch: false,
};

// ─── Datums-Helfer ────────────────────────────────────────────────────────

const fmt = (d: Date) => format(d, 'dd.MM.yyyy');
const iso = (d: Date) => format(d, 'yyyy-MM-dd');
const leq = (a: Date, b: Date) => !isAfter(a, b);

// ─── Hilfsfunktionen ───────────────────────────────────────────────────────

function imStillstand(d: Date, verfahren: ZpoVerfahren): boolean {
  return STILLSTAND_GILT[verfahren] && stillstandsperiodeFuer(d) !== null;
}

// Art. 142 Abs. 1bis: Zustellung per gewöhnlicher Post an Sa/So/Feiertag → nächster Werktag.
function ereignisKorrigiert(input: ZpoInput, ereignis: Date): { tag: Date; korrigiert: boolean } {
  if (input.zustellart === 'gewoehnliche_post' && istArbeitsfreierTag(ereignis, input.kanton)) {
    let d = ereignis;
    while (istArbeitsfreierTag(d, input.kanton)) d = addDays(d, 1);
    return { tag: d, korrigiert: true };
  }
  return { tag: ereignis, korrigiert: false };
}

// Endnormalisierung: Art. 142 Abs. 3 und Art. 145 Abs. 1 kumulativ.
function normalisiereEnde(ende: Date, input: ZpoInput): { tag: Date; verschoben: boolean } {
  let d = ende;
  let verschoben = false;
  // Schutz gegen Endlosschleife (max. ~1 Jahr Verschiebung möglich)
  for (let guard = 0; guard < 400; guard++) {
    const p = STILLSTAND_GILT[input.verfahren] ? stillstandsperiodeFuer(d) : null;
    if (p) { d = addDays(p.bis, 1); verschoben = true; continue; }
    if (istArbeitsfreierTag(d, input.kanton)) { d = addDays(d, 1); verschoben = true; continue; }
    break;
  }
  return { tag: d, verschoben };
}

// ─── Tagesfristen (Art. 142 Abs. 1 ZPO, Ziff. 6.3) ────────────────────────

function fristendeTage(input: ZpoInput, massgeblich: Date): { diesAQuo: Date; ende: Date } {
  let cursor = addDays(massgeblich, 1); // Art. 142 Abs. 1: Beginn am Folgetag
  let gezaehlt = 0;
  let diesAQuo: Date | null = null;
  for (let guard = 0; guard < 4000; guard++) {
    if (!imStillstand(cursor, input.verfahren)) { // Art. 145/146: Stillstandstage zählen nicht
      gezaehlt += 1;
      if (gezaehlt === 1) diesAQuo = cursor;
      if (gezaehlt === input.laenge) return { diesAQuo: diesAQuo!, ende: cursor };
    }
    cursor = addDays(cursor, 1);
  }
  throw new Error('Fristberechnung (Tage) konvergiert nicht.');
}

// ─── Wochen-/Monats-/Jahresfristen (Art. 142 Abs. 2 ZPO, Ziff. 6.4) ───────

function naivesEnde(ref: Date, einheit: ZpoEinheit, N: number): Date {
  switch (einheit) {
    case 'wochen': return addDays(ref, 7 * N);     // gleicher Wochentag
    case 'monate': return addMonths(ref, N);       // date-fns klemmt auf Monatsende
    case 'jahre':  return addYears(ref, N);        // date-fns klemmt 29.2. → 28.2.
    case 'tage':   return addDays(ref, N);         // (nicht für Tagesfristen genutzt)
  }
}

function fristendeKalender(input: ZpoInput, massgeblich: Date): { diesAQuo: Date; ende: Date; verlaengerungTage: number } {
  // dies a quo: Ereignistag selbst, bzw. letzter Tag der Stillstandsperiode (Art. 146 Abs. 1).
  let diesAQuo = massgeblich;
  if (imStillstand(massgeblich, input.verfahren)) {
    diesAQuo = stillstandsperiodeFuer(massgeblich)!.bis;
  }
  // Berechnungsbasis (Mindermeinung [UMSTRITTEN]: Beginn am Folgetag).
  let ref = diesAQuo;
  if (input.modus === 'mindermeinung') ref = addDays(ref, 1);

  let ende = naivesEnde(ref, input.einheit, input.laenge);

  // Kumulative Stillstandsverlängerung (Art. 145 Abs. 1 i.V.m. Art. 146 Abs. 1).
  let verlaengerungTage = 0;
  if (STILLSTAND_GILT[input.verfahren]) {
    const angewandt = new Set<string>();
    for (let guard = 0; guard < 50; guard++) {
      let cand: { key: string; von: Date; bis: Date } | null = null;
      for (let jy = ref.getFullYear() - 1; jy <= ende.getFullYear() + 1; jy++) {
        for (const p of stillstandsperioden(jy)) {
          if (angewandt.has(p.key)) continue;
          if (isAfter(p.von, ref) && leq(p.von, ende)) {
            if (!cand || isBefore(p.von, cand.von)) cand = p;
          }
        }
      }
      if (!cand) break;
      const d = dauerTage(cand);
      ende = addDays(ende, d);
      verlaengerungTage += d;
      angewandt.add(cand.key);
    }
  }
  return { diesAQuo, ende, verlaengerungTage };
}

// ─── Hauptfunktion ──────────────────────────────────────────────────────────

export function berechneFrist(input: ZpoInput): ZpoErgebnis {
  if (!Number.isInteger(input.laenge) || input.laenge <= 0) {
    throw new Error('Fristlänge muss eine ganze Zahl > 0 sein.');
  }

  const rechenweg: Rechenschritt[] = [];
  const annahmen: string[] = [];
  const warnungen: string[] = [];

  const ereignis = parseISO(input.ereignis);
  const stillstandGilt = STILLSTAND_GILT[input.verfahren];

  // Schritt 1: massgeblichen Ereignistag bestimmen (Art. 142 Abs. 1bis)
  const { tag: massgeblich, korrigiert } = ereignisKorrigiert(input, ereignis);
  rechenweg.push({
    beschreibung: 'Schritt 1 – Massgeblicher Ereignistag',
    zwischenergebnis: korrigiert
      ? `Zustellung per gewöhnlicher Post an einem arbeitsfreien Tag (${fmt(ereignis)}) → gilt als zugestellt am nächsten Werktag ${fmt(massgeblich)}.`
      : `Auslösendes Ereignis: ${fmt(ereignis)} (keine Korrektur nach Art. 142 Abs. 1bis).`,
    normen: korrigiert ? [N_142_1bis] : [],
  });

  // Schritt 2: Fristende provisorisch berechnen
  let diesAQuo: Date;
  let endeProvisorisch: Date;
  let verlaengerungTage = 0;

  if (input.einheit === 'tage') {
    const r = fristendeTage(input, massgeblich);
    diesAQuo = r.diesAQuo;
    endeProvisorisch = r.ende;
    rechenweg.push({
      beschreibung: 'Schritt 2 – Tagesfrist (dies a quo am Folgetag)',
      zwischenergebnis:
        `Tagesfrist von ${input.laenge} Tagen. Beginn des Fristenlaufs (dies a quo): ${fmt(diesAQuo)}. ` +
        (stillstandGilt ? 'Stillstandstage werden nicht mitgezählt (die Frist pausiert). ' : 'Kein Fristenstillstand in diesem Verfahren. ') +
        `Rechnerisches Ende (vor Endnormalisierung): ${fmt(endeProvisorisch)}.`,
      normen: stillstandGilt ? [N_142_1, N_146_1] : [N_142_1],
    });
  } else {
    const r = fristendeKalender(input, massgeblich);
    diesAQuo = r.diesAQuo;
    endeProvisorisch = r.ende;
    verlaengerungTage = r.verlaengerungTage;
    const einheitLabel = input.einheit === 'wochen' ? 'Wochen' : input.einheit === 'monate' ? 'Monate' : 'Jahre';
    rechenweg.push({
      beschreibung: `Schritt 2 – ${einheitLabel}frist (gleichbezeichneter Tag, Art. 142 Abs. 2)`,
      zwischenergebnis:
        `dies a quo: ${fmt(diesAQuo)}` +
        (imStillstand(massgeblich, input.verfahren) ? ' (Ereignis im Stillstand → letzter Tag der Stillstandsperiode, Art. 146 Abs. 1).' : ' (Ereignistag selbst; Art. 142 Abs. 1 findet keine Anwendung).') +
        (input.modus === 'mindermeinung' ? ' [Mindermeinung: Beginn am Folgetag.]' : '') +
        ` Naives Ende: ${fmt(endeProvisorisch)}.` +
        (verlaengerungTage > 0 ? ` Stillstandsverlängerung: +${verlaengerungTage} Tage (Art. 145 Abs. 1).` : ''),
      normen: verlaengerungTage > 0 ? [N_142_2, N_145_1, N_146_1] : [N_142_2],
    });
  }

  // Schritt 3: Endnormalisierung (Art. 142 Abs. 3 + Art. 145 kumulativ)
  const { tag: diesAdQuem, verschoben } = normalisiereEnde(endeProvisorisch, input);
  rechenweg.push({
    beschreibung: 'Schritt 3 – Endnormalisierung (Art. 142 Abs. 3 / Art. 145 Abs. 1)',
    zwischenergebnis: verschoben
      ? `Das rechnerische Ende ${fmt(endeProvisorisch)} fiel auf einen arbeitsfreien Tag bzw. in einen Stillstand → verschoben auf den nächsten Werktag: ${fmt(diesAdQuem)}.`
      : `Ende ${fmt(diesAdQuem)} ist bereits ein Werktag ausserhalb des Stillstands – keine Verschiebung.`,
    normen: [N_142_3, N_145_1],
  });

  // Optional: Erstreckung (Ziff. 7.5) – nur gerichtliche Fristen
  let erstrecktBis: string | undefined;
  if (input.erstreckung && input.fristnatur === 'gerichtlich') {
    const tage = input.erstreckung.einheit === 'wochen' ? input.erstreckung.laenge * 7 : input.erstreckung.laenge;
    // Beginn am Tag nach dem letzten Tag der ursprünglichen Frist; Art. 142 Abs. 1 gilt nicht.
    let cursor = addDays(diesAdQuem, 1);
    let gezaehlt = 0;
    let ende = cursor;
    for (let guard = 0; guard < 4000 && gezaehlt < tage; guard++) {
      if (!imStillstand(cursor, input.verfahren)) {
        gezaehlt += 1;
        ende = cursor;
      }
      if (gezaehlt < tage) cursor = addDays(cursor, 1);
    }
    const norm = normalisiereEnde(ende, input);
    erstrecktBis = iso(norm.tag);
    rechenweg.push({
      beschreibung: 'Erstreckung (gerichtliche Frist, Art. 144 Abs. 2 ZPO)',
      zwischenergebnis: `Erstreckung um ${input.erstreckung.laenge} ${input.erstreckung.einheit} ab dem Tag nach Fristablauf. Neues Ende: ${fmt(norm.tag)} (Art. 142 Abs. 1 findet keine Anwendung; Abs. 3 und Stillstand gelten).`,
      normen: [N_144_2, N_142_3],
    });
  }

  // ─── Hinweise / Vorbehalte ────────────────────────────────────────────

  // Erstreckbarkeit (Ziff. 6.8)
  if (input.fristnatur === 'gesetzlich') {
    warnungen.push('Gesetzliche Frist: nicht erstreckbar (Art. 144 Abs. 1 ZPO). Bei Versäumnis kommt nur die Wiederherstellung in Betracht (Art. 148 ZPO).');
    rechenweg.push({
      beschreibung: 'Erstreckbarkeit (Art. 144 Abs. 1 ZPO)',
      zwischenergebnis: 'Gesetzliche Frist – nicht erstreckbar.',
      normen: [N_144_1],
    });
  } else {
    warnungen.push('Gerichtliche Frist: erstreckbar aus zureichenden Gründen, sofern das Gesuch vor Fristablauf (spätestens am letzten Tag bis 24.00 Uhr) gestellt wird (Art. 144 Abs. 2 ZPO). Kein Anspruch; Entscheid im gerichtlichen Ermessen.');
    rechenweg.push({
      beschreibung: 'Erstreckbarkeit (Art. 144 Abs. 2 ZPO)',
      zwischenergebnis: 'Gerichtliche Frist – aus zureichenden Gründen erstreckbar (Gesuch vor Fristablauf).',
      normen: [N_144_2],
    });
  }

  // Art. 145 Abs. 3: Hinweispflicht bei Nichtgeltung des Stillstands
  if (!stillstandGilt) {
    warnungen.push('Hat das Gericht nicht auf die Nichtgeltung des Fristenstillstands hingewiesen, kann der Stillstand dennoch zu beachten sein (Art. 145 Abs. 3 ZPO).');
    rechenweg.push({
      beschreibung: 'Geltung des Fristenstillstands (Art. 145 Abs. 2/3 ZPO)',
      zwischenergebnis: `Im gewählten Verfahren gilt der Fristenstillstand nicht. Hinweispflicht des Gerichts beachten (Art. 145 Abs. 3 ZPO).`,
      normen: [N_145_2, N_145_3],
    });
  }

  // [UNGEKLÄRT] Jahresfristen vs. Gerichtsferien
  if (input.einheit === 'jahre' && stillstandGilt) {
    warnungen.push('[UNGEKLÄRT] Die Behandlung von Jahresfristen im Verhältnis zu den Gerichtsferien ist nicht gesichert. Bitte manuell prüfen.');
  }

  // [UMSTRITTEN] Mindermeinung
  if (input.modus === 'mindermeinung') {
    warnungen.push('[UMSTRITTEN] Berechnung nach der Mindermeinung (Art. 142 Abs. 1 ZPO für alle Fristen → Beginn am Folgetag). Das Bundesgericht teilt diese Auffassung nicht (BGer 5A_691/2023); es besteht ein Fristrisiko.');
  }

  // Feiertags-Verifikationsvorbehalt (Ziff. 6.7)
  warnungen.push('Kantonale/lokale Feiertage bitte verifizieren (Gerichtsort massgeblich); bei Unklarheit über einen Feiertag kommt regelmässig eine Fristwiederherstellung (Art. 148 ZPO) in Betracht.');

  // Fristwahrung (Art. 143) + Säumnis (Art. 147/148)
  rechenweg.push({
    beschreibung: 'Fristwahrung (Art. 143 ZPO)',
    zwischenergebnis: 'Eingaben spätestens am letzten Tag bis 24.00 Uhr beim Gericht oder zu dessen Handen der Schweizerischen Post übergeben (Expeditionsprinzip; rechtzeitige Aufgabe ist beweisbelastet). Elektronisch: Quittung der Zustellplattform (Abs. 2). Fristgerecht beim unzuständigen schweizerischen Gericht eingereicht gilt als rechtzeitig (Abs. 1bis).',
    normen: [N_143],
  });
  rechenweg.push({
    beschreibung: 'Säumnisfolgen (Hinweis)',
    zwischenergebnis: 'Dieser Rechner bestimmt nur das Fristende, nicht die Rechtsfolgen einer Versäumnis. Bei Säumnis: Art. 147 ZPO; Wiederherstellung: Art. 148 ZPO.',
    normen: [N_147, N_148],
  });

  annahmen.push(
    `Verfahrensart: ${input.verfahren} – Fristenstillstand ${stillstandGilt ? 'gilt' : 'gilt nicht'} (Art. 145 Abs. 2 ZPO).`,
    `Gerichtsort: ${input.kanton} (Sitz des Gerichts; massgeblich für Feiertage, nicht der Wohnsitz der Partei/Vertretung).`,
    `Fristtyp: ${input.einheit}; Berechnungsmodus: ${input.modus === 'mindermeinung' ? 'Mindermeinung' : 'bundesgerichtliche Praxis (BGer 5A_691/2023)'}.`,
    'Ablauf jeweils um 24.00 Uhr des letzten Tages (dies ad quem).',
  );

  const normverweise: Normverweis[] = [
    input.einheit === 'tage' ? N_142_1 : N_142_2,
    N_142_3,
    N_145_1,
    N_143,
    input.fristnatur === 'gesetzlich' ? N_144_1 : N_144_2,
    N_148,
  ];

  return {
    ergebnis: `Fristende (dies ad quem): ${fmt(diesAdQuem)}, 24.00 Uhr.` + (erstrecktBis ? ` Nach Erstreckung: ${fmt(parseISO(erstrecktBis))}.` : ''),
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise,
    massgeblicherEreignistag: fmt(massgeblich),
    diesAQuo: fmt(diesAQuo),
    diesAdQuem: fmt(diesAdQuem),
    erstrecktBis: erstrecktBis ? fmt(parseISO(erstrecktBis)) : undefined,
  };
}

// ─── Optional (Ziff. 7.2): Zustellfiktion-Helfer (Art. 138 Abs. 3 lit. a) ──
//
// Nicht abgeholte eingeschriebene Sendung gilt am 7. Tag nach dem erfolglosen
// Zustellversuch als zugestellt (unabhängig vom Wochentag). Hilfsgrösse.

export function zustellfiktion(erfolgloserVersuch: string): string {
  return iso(addDays(parseISO(erfolgloserVersuch), 7));
}
