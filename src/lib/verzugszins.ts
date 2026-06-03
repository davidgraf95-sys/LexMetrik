import { parseISO, differenceInCalendarDays } from 'date-fns';
import type { Berechnungsergebnis, Normverweis, Rechenschritt } from '../types/legal';
import { rechtsprechung } from '../data/verifikation';

// ─── Verzugszins (Art. 104 OR) ────────────────────────────────────────────
//
// Art. 104 fixiert den ZINSSATZ (Abs. 1: 5%/Jahr, dispositiv; Abs. 2: höher vertraglich;
// Abs. 3: kaufmännischer Diskontsatz), NICHT die Tageszählung. Letztere ist eine
// methodische Wahl und wird transparent ausgewiesen.

export type VerzugszinsMethode = 'act360' | 'act365' | '30E360';
export type VerzugsgrundTyp = 'mahnung' | 'verfalltag' | 'klage';
export type SatzGrund = 'gesetzlich' | 'vertraglich' | 'kaufmaennisch';

export type VerzugszinsInput = {
  kapital: number;            // CHF, > 0 (geschuldeter Betrag)
  verzugsbeginn: string;      // yyyy-MM-dd
  verzugsende: string;        // yyyy-MM-dd (Zahlung / Urteilstag / Stichtag)
  zinssatzProzent?: number;   // default 5 (Art. 104 Abs. 1)
  satzGrund?: SatzGrund;      // Abs. 1 / 2 / 3
  methode?: VerzugszinsMethode; // default 'act360'
  verzugsgrund?: VerzugsgrundTyp; // Semantik des Verzugsbeginns
};

export type VerzugszinsErgebnis = Berechnungsergebnis & {
  kapital: number;
  zinssatz: number;
  tage: number;
  methode: VerzugszinsMethode;
  zinsbetrag: number;     // gerundet auf Rappen
  zinsbetragCHF: string;
  totalCHF: string;
};

// ─── Normverweise ─────────────────────────────────────────────────────────

const N_104_1: Normverweis = { artikel: 'Art. 104 Abs. 1 OR', bemerkung: '5% pro Jahr (dispositiv)' };
const N_104_2: Normverweis = { artikel: 'Art. 104 Abs. 2 OR', bemerkung: 'höherer vertraglicher Zins' };
const N_104_3: Normverweis = { artikel: 'Art. 104 Abs. 3 OR', bemerkung: 'kaufmännischer Bankdiskonto' };
const N_102:   Normverweis = { artikel: 'Art. 102 OR', bemerkung: 'Verzug (Inverzugsetzung/Mahnung)' };
const N_108_1: Normverweis = { artikel: 'Art. 108 Ziff. 1 OR', bemerkung: 'Verzug ohne Mahnung (Verfalltag)' };

// ─── Helfer ────────────────────────────────────────────────────────────────

/** Schweizer Betragsformat mit Tausender-Apostroph: 1'234.50 */
export function formatCHF(x: number): string {
  const [ganz, dez] = Math.abs(x).toFixed(2).split('.');
  const gruppiert = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${x < 0 ? '-' : ''}${gruppiert}.${dez}`;
}

/** Tage nach 30E/360 (europäische kaufmännische Methode). */
function tage30E360(von: Date, bis: Date): number {
  const d1 = Math.min(von.getDate(), 30);
  const d2 = Math.min(bis.getDate(), 30);
  return 360 * (bis.getFullYear() - von.getFullYear())
    + 30 * (bis.getMonth() - von.getMonth())
    + (d2 - d1);
}

const METHODE_LABEL: Record<VerzugszinsMethode, string> = {
  act360: 'tatsächliche Kalendertage / 360 (Bankusanz)',
  act365: 'tatsächliche Kalendertage / 365',
  '30E360': '30E/360 (kaufmännisch)',
};

function tageUndBasis(input: VerzugszinsInput, von: Date, bis: Date): { tage: number; basis: number } {
  switch (input.methode ?? 'act360') {
    case 'act365': return { tage: differenceInCalendarDays(bis, von), basis: 365 };
    case '30E360': return { tage: tage30E360(von, bis), basis: 360 };
    case 'act360':
    default:       return { tage: differenceInCalendarDays(bis, von), basis: 360 };
  }
}

// ─── Hauptfunktion ───────────────────────────────────────────────────────────

export function berechneVerzugszins(input: VerzugszinsInput): VerzugszinsErgebnis {
  const methode = input.methode ?? 'act360';
  const satz = input.zinssatzProzent ?? 5;
  const grund: SatzGrund = input.satzGrund ?? 'gesetzlich';

  const rechenweg: Rechenschritt[] = [];
  const annahmen: string[] = [];
  const warnungen: string[] = [];

  const leer: Omit<VerzugszinsErgebnis, keyof Berechnungsergebnis> = {
    kapital: input.kapital, zinssatz: satz, tage: 0, methode,
    zinsbetrag: 0, zinsbetragCHF: formatCHF(0), totalCHF: formatCHF(input.kapital || 0),
  };

  // Validierung
  if (!(input.kapital > 0)) {
    return {
      ergebnis: 'Kein Verzugszins: Der geschuldete Betrag muss grösser als 0 sein.',
      status: 'kein_anspruch', rechenweg, annahmen,
      warnungen: ['Verzugszins kann nur auf einem tatsächlich geschuldeten Betrag anfallen (BGer 4A_117/2014).'],
      normverweise: [N_104_1], ...leer,
    };
  }
  const von = parseISO(input.verzugsbeginn);
  const bis = parseISO(input.verzugsende);
  if (differenceInCalendarDays(bis, von) < 0) {
    return {
      ergebnis: 'Ungültiger Zeitraum: Das Verzugsende liegt vor dem Verzugsbeginn.',
      status: 'unzulaessig', rechenweg, annahmen,
      warnungen: ['Bitte Verzugsbeginn und -ende prüfen.'],
      normverweise: [N_104_1], ...leer,
    };
  }

  // Schritt 1 – Voraussetzungen
  rechenweg.push({
    beschreibung: 'Schritt 1 – Voraussetzungen des Verzugszinses (Art. 104 Abs. 1 OR)',
    zwischenergebnis: 'Verzugszins setzt Fälligkeit der Geldforderung und Inverzugsetzung des Schuldners voraus. Ein Schaden- oder Verschuldensnachweis ist nicht erforderlich.',
    normen: [N_104_1, N_102],
    rechtsprechung: [rechtsprechung('BGE_130_III_591')],
  });

  // Schritt 2 – Zinsenlauf-Beginn
  const grundTyp = input.verzugsgrund ?? 'mahnung';
  const beginnText =
    grundTyp === 'verfalltag'
      ? 'Verfalltag / Verzug ohne Mahnung (Art. 108 Ziff. 1 OR): der Zins läuft umgehend ab Verzugseintritt.'
      : grundTyp === 'klage'
        ? 'Bei Klageeinleitung läuft der Verzugszins ab Zustellung der Klage bzw. Widerklage.'
        : 'Der Verzugszins läuft ab dem Tag, an dem der Schuldner die Mahnung erhalten hat.';
  rechenweg.push({
    beschreibung: 'Schritt 2 – Beginn des Zinsenlaufs',
    zwischenergebnis: `${beginnText} Angesetzter Verzugsbeginn: ${input.verzugsbeginn}.`,
    normen: grundTyp === 'verfalltag' ? [N_108_1] : [N_104_1],
    rechtsprechung: grundTyp === 'verfalltag'
      ? [rechtsprechung('BGer_4A_58_2019')]
      : grundTyp === 'klage' ? [rechtsprechung('BGer_4A_282_2017')] : undefined,
  });

  // Schritt 3 – Zinssatz
  const satzNormen = grund === 'vertraglich' ? [N_104_2] : grund === 'kaufmaennisch' ? [N_104_3] : [N_104_1];
  const satzText =
    grund === 'vertraglich'
      ? `Vertraglich vereinbarter Verzugszins von ${satz}% (Art. 104 Abs. 2 OR). Die Beweislast für die Vereinbarung des höheren Satzes trägt der Gläubiger.`
      : grund === 'kaufmaennisch'
        ? `Kaufmännischer Verzugszins von ${satz}% (Art. 104 Abs. 3 OR): zulässig im objektiv kaufmännischen Verkehr, soweit der übliche Bankdiskonto (Privatdiskontsatz) am Zahlungsort 5% übersteigt.`
        : `Gesetzlicher Verzugszins von ${satz}% pro Jahr (Art. 104 Abs. 1 OR).`;
  rechenweg.push({
    beschreibung: 'Schritt 3 – Massgebender Zinssatz',
    zwischenergebnis: satzText,
    normen: satzNormen,
    rechtsprechung: grund === 'vertraglich'
      ? [rechtsprechung('BGE_137_III_453')]
      : grund === 'kaufmaennisch' ? [rechtsprechung('BGE_116_II_140')]
      : satz !== 5 ? [rechtsprechung('BGE_117_V_349')] : undefined,
  });

  // Schritt 4 – Tage
  const { tage, basis } = tageUndBasis(input, von, bis);
  rechenweg.push({
    beschreibung: 'Schritt 4 – Anzahl Verzugstage',
    zwischenergebnis: `Zeitraum ${input.verzugsbeginn} bis ${input.verzugsende}: ${tage} Tage. Tageszählung: ${METHODE_LABEL[methode]}.`,
    normen: [N_104_1],
  });

  // Schritt 5 – lineare Zinsberechnung (keine Zinseszinsen)
  const roh = input.kapital * (satz / 100) * (tage / basis);
  const zinsbetrag = Math.round(roh * 100) / 100;
  rechenweg.push({
    beschreibung: 'Schritt 5 – Zinsberechnung (linear, keine Zinseszinsen)',
    zwischenergebnis:
      `CHF ${formatCHF(input.kapital)} × ${satz}% × ${tage}/${basis} = CHF ${formatCHF(zinsbetrag)}. ` +
      `Die Zinsen wachsen linear auf dem Kapital; Zinseszinsen werden nicht berechnet.`,
    normen: [N_104_1],
    rechtsprechung: [rechtsprechung('BGer_4A_514_2007')],
  });

  // Hinweise
  warnungen.push(
    `Tageszählung (${METHODE_LABEL[methode]}) ist nicht durch Art. 104 OR vorgegeben, sondern eine methodische Annahme – im Einzelfall zu prüfen.`,
    'Verzugszins fällt nur auf dem tatsächlich geschuldeten Betrag an; Zinseszinsen werden nicht berechnet (BGer 4A_514/2007; 4A_117/2014).',
  );
  if (grund === 'vertraglich') warnungen.push('Höherer vertraglicher Zinssatz (Art. 104 Abs. 2 OR): Beweislast für die Vereinbarung beim Gläubiger.');
  if (grund === 'kaufmaennisch') warnungen.push('Art. 104 Abs. 3 OR gilt nur im objektiv kaufmännischen Verkehr; der konkrete Privatdiskontsatz am Zahlungsort ist nachzuweisen.');
  if (grund === 'gesetzlich' && satz !== 5) warnungen.push('Art. 104 Abs. 1 OR ist dispositiv; ein abweichender Satz bedarf einer Grundlage (Vereinbarung/Reglement).');

  annahmen.push(
    'Ein einziger Zinssatz über den gesamten Zeitraum; bei wechselndem Satz ist je Teilperiode getrennt zu rechnen.',
    'Geschuldeter Kapitalbetrag als Zinsbasis (ohne aufgelaufene Zinsen).',
  );

  const total = Math.round((input.kapital + zinsbetrag) * 100) / 100;

  return {
    ergebnis: `Verzugszins: CHF ${formatCHF(zinsbetrag)} (${satz}% auf CHF ${formatCHF(input.kapital)} für ${tage} Tage). Total inkl. Kapital: CHF ${formatCHF(total)}.`,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise: [N_104_1, N_104_2, N_104_3],
    kapital: input.kapital,
    zinssatz: satz,
    tage,
    methode,
    zinsbetrag,
    zinsbetragCHF: formatCHF(zinsbetrag),
    totalCHF: formatCHF(total),
  };
}
