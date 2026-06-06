import { parseISO, addDays, differenceInCalendarDays } from 'date-fns';
import type { Berechnungsergebnis, Normverweis, Rechenschritt } from '../types/legal';
import { formatDatum } from './datumsUtils';
import { rechtsprechung } from '../data/verifikation';

// ─── Verzugszins (Art. 104 OR) – praxistaugliche, event-basierte Berechnung ──
//
// Art. 104 fixiert den ZINSSATZ (Abs. 1: 5%/Jahr dispositiv; Abs. 2: höher vertraglich;
// Abs. 3: kaufmännischer Diskonto), NICHT die Tageszählung. Eingebaut sind ferner:
//  • Anrechnung von Teilzahlungen Kosten/Zinsen vor Kapital (Art. 85 OR);
//  • Zinseszinsverbot (Art. 105 Abs. 3 OR): aufgelaufene Zinsen werden NIE verzinst;
//  • Verzugsbeginn nach Art. 102 (Mahnung / Verfalltag) bzw. Klagezustellung.

export type VerzugszinsMethode = 'act365' | 'act360' | '30E360';
export type VerzugsbeginnTyp = 'mahnung' | 'verfalltag' | 'klage';
export type SatzGrund = 'gesetzlich' | 'vertraglich' | 'kaufmaennisch';

export type VzEreignis =
  | { typ: 'teilzahlung'; datum: string; betrag: number }
  | { typ: 'satzaenderung'; datum: string; satz: number };

export type VerzugszinsInput = {
  kapital: number;                 // CHF, > 0 (geschuldeter Betrag)
  verzugsbeginn: string;           // yyyy-MM-dd – Mahnungs-/Klagedatum ODER Verfalltag
  beginnTyp?: VerzugsbeginnTyp;    // default 'mahnung'
  stichtag: string;                // yyyy-MM-dd – Ende (Zahlung / Urteilstag / heute)
  zinssatzProzent?: number;        // Anfangssatz, default 5
  satzGrund?: SatzGrund;
  methode?: VerzugszinsMethode;    // default 'act365'
  ereignisse?: VzEreignis[];       // Teilzahlungen + Satzänderungen
  rueckstaendigeZinsforderung?: boolean; // Art. 105 Abs. 1 (Zins-/Rentenforderung)
};

export type VzSegment = {
  von: string; bis: string; tage: number; kapital: number; satz: number; zins: number;
};

export type VerzugszinsErgebnis = Berechnungsergebnis & {
  ersterZinstag: string;
  stichtag: string;
  methode: VerzugszinsMethode;
  tageTotal: number;
  segmente: VzSegment[];
  zinsTotal: number;     // gesamter aufgelaufener Verzugszins
  zinsGetilgt: number;   // durch Teilzahlungen getilgte Zinsen
  zinsOffen: number;     // noch offener Verzugszins
  kapitalOffen: number;  // offenes Restkapital
  totalOffen: number;    // kapitalOffen + zinsOffen
  // formatiert (CHF)
  zinsTotalCHF: string;
  zinsOffenCHF: string;
  kapitalOffenCHF: string;
  totalOffenCHF: string;
};

// ─── Normverweise ─────────────────────────────────────────────────────────

const N_104_1: Normverweis = { artikel: 'Art. 104 Abs. 1 OR', bemerkung: '5 % pro Jahr (dispositiv)' };
const N_104_2: Normverweis = { artikel: 'Art. 104 Abs. 2 OR', bemerkung: 'höherer vertraglicher Zins' };
const N_104_3: Normverweis = { artikel: 'Art. 104 Abs. 3 OR', bemerkung: 'kaufmännischer Bankdiskonto' };
const N_102:   Normverweis = { artikel: 'Art. 102 OR', bemerkung: 'Verzug: Mahnung / Verfalltag' };
const N_85:    Normverweis = { artikel: 'Art. 85 OR', bemerkung: 'Anrechnung: Zinsen/Kosten vor Kapital' };
const N_105_1: Normverweis = { artikel: 'Art. 105 Abs. 1 OR', bemerkung: 'rückständige Zinsen/Renten: ab Betreibung/Klage' };
const N_105_3: Normverweis = { artikel: 'Art. 105 Abs. 3 OR', bemerkung: 'Zinseszinsverbot' };
const N_106:   Normverweis = { artikel: 'Art. 106 OR', bemerkung: 'weiterer Verzugsschaden' };

// ─── Helfer ────────────────────────────────────────────────────────────────

const round2 = (x: number) => Math.round(x * 100) / 100;

/** Schweizer Betragsformat mit Tausender-Apostroph: 1'234.50 */
export function formatCHF(x: number): string {
  const [ganz, dez] = Math.abs(x).toFixed(2).split('.');
  const gruppiert = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  return `${x < 0 ? '-' : ''}${gruppiert}.${dez}`;
}

const fmt = formatDatum;

function tage30E360(von: Date, bis: Date): number {
  const d1 = Math.min(von.getDate(), 30);
  const d2 = Math.min(bis.getDate(), 30);
  return 360 * (bis.getFullYear() - von.getFullYear())
    + 30 * (bis.getMonth() - von.getMonth())
    + (d2 - d1);
}

const METHODE_LABEL: Record<VerzugszinsMethode, string> = {
  act365: 'tatsächliche Tage / 365 (wie Zürcher Gerichtsrechner)',
  act360: 'tatsächliche Tage / 360 (Bankusanz)',
  '30E360': '30E/360 (kaufmännisch)',
};

function segmentTageBasis(methode: VerzugszinsMethode, von: Date, bis: Date): { tage: number; basis: number } {
  switch (methode) {
    case 'act360': return { tage: differenceInCalendarDays(bis, von), basis: 360 };
    case '30E360': return { tage: tage30E360(von, bis), basis: 360 };
    case 'act365':
    default:       return { tage: differenceInCalendarDays(bis, von), basis: 365 };
  }
}

// ─── Hauptfunktion ───────────────────────────────────────────────────────────

export function berechneVerzugszins(input: VerzugszinsInput): VerzugszinsErgebnis {
  const methode = input.methode ?? 'act365';
  const startSatz = input.zinssatzProzent ?? 5;
  const grund: SatzGrund = input.satzGrund ?? 'gesetzlich';
  const beginnTyp = input.beginnTyp ?? 'mahnung';

  const rechenweg: Rechenschritt[] = [];
  const annahmen: string[] = [];
  const warnungen: string[] = [];

  const leer = {
    ersterZinstag: '', stichtag: input.stichtag, methode, tageTotal: 0, segmente: [] as VzSegment[],
    zinsTotal: 0, zinsGetilgt: 0, zinsOffen: 0, kapitalOffen: input.kapital || 0, totalOffen: input.kapital || 0,
    zinsTotalCHF: formatCHF(0), zinsOffenCHF: formatCHF(0),
    kapitalOffenCHF: formatCHF(input.kapital || 0), totalOffenCHF: formatCHF(input.kapital || 0),
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

  // Erster Zinstag: bei Verfalltag ab Folgetag (Art. 102 Abs. 2), sonst = Eingabedatum.
  const eingabeBeginn = parseISO(input.verzugsbeginn);
  const ersterZinstag = beginnTyp === 'verfalltag' ? addDays(eingabeBeginn, 1) : eingabeBeginn;
  const stichtag = parseISO(input.stichtag);

  if (differenceInCalendarDays(stichtag, ersterZinstag) < 0) {
    return {
      ergebnis: 'Ungültiger Zeitraum: Der Stichtag liegt vor dem ersten Zinstag.',
      status: 'unzulaessig', rechenweg, annahmen,
      warnungen: ['Bitte Verzugsbeginn/Verfalltag und Stichtag prüfen.'],
      normverweise: [N_104_1], ...leer,
    };
  }

  // ── Schritt 1: Voraussetzungen ──
  rechenweg.push({
    beschreibung: 'Schritt 1 – Voraussetzungen des Verzugszinses (Art. 104 Abs. 1 OR)',
    zwischenergebnis: 'Verzugszins setzt Fälligkeit der Geldforderung und Inverzugsetzung voraus; kein Schaden- oder Verschuldensnachweis nötig.',
    normen: [N_104_1, N_102],
    rechtsprechung: [rechtsprechung('BGE_130_III_591')],
  });

  // ── Schritt 2: Verzugsbeginn ──
  const beginnText =
    beginnTyp === 'verfalltag'
      ? `Bestimmter Verfalltag am ${fmt(eingabeBeginn)} (Art. 102 Abs. 2 OR): Verzug ohne Mahnung; der Zins läuft ab dem Folgetag ${fmt(ersterZinstag)}.`
      : beginnTyp === 'klage'
        ? `Klageeinleitung: der Verzugszins läuft ab Zustellung der Klage/Widerklage (${fmt(ersterZinstag)}).`
        : `Mahnung (Art. 102 Abs. 1 OR): der Zins läuft ab Erhalt der Mahnung (${fmt(ersterZinstag)}).`;
  rechenweg.push({
    beschreibung: 'Schritt 2 – Beginn des Zinsenlaufs',
    zwischenergebnis: beginnText,
    // Audit-Fix 6.6.2026 (deklarierte fachliche Änderung): Der Verfalltag-Verzug
    // folgt aus Art. 102 Abs. 2 OR; Art. 108 OR betrifft die Entbehrlichkeit der
    // NACHFRIST beim Rücktritt (Ziff. 3: Verfalltag-Geschäft), nicht den Verzugseintritt —
    // der frühere Verweis auf «Art. 108 Ziff. 1» war dogmatisch unzutreffend.
    normen: beginnTyp === 'verfalltag' ? [N_102] : [N_102, N_104_1],
    rechtsprechung: beginnTyp === 'verfalltag'
      ? [rechtsprechung('BGer_4A_58_2019')]
      : beginnTyp === 'klage' ? [rechtsprechung('BGer_4A_282_2017')] : undefined,
  });

  // ── Schritt 3: Satz ──
  const satzNormen = grund === 'vertraglich' ? [N_104_2] : grund === 'kaufmaennisch' ? [N_104_3] : [N_104_1];
  const satzText =
    grund === 'vertraglich'
      ? `Vertraglich vereinbarter Verzugszins von ${startSatz} % (Art. 104 Abs. 2 OR); Beweislast für die Vereinbarung beim Gläubiger.`
      : grund === 'kaufmaennisch'
        ? `Kaufmännischer Verzugszins von ${startSatz} % (Art. 104 Abs. 3 OR): nur im objektiv kaufmännischen Verkehr, soweit der übliche Bankdiskonto (Privatdiskontsatz) 5 % übersteigt.`
        : `Gesetzlicher Verzugszins von ${startSatz} % pro Jahr (Art. 104 Abs. 1 OR).`;
  rechenweg.push({
    beschreibung: 'Schritt 3 – Massgebender Zinssatz',
    zwischenergebnis: satzText,
    normen: satzNormen,
    rechtsprechung: grund === 'vertraglich' ? [rechtsprechung('BGE_137_III_453')]
      : grund === 'kaufmaennisch' ? [rechtsprechung('BGE_116_II_140')]
      : startSatz !== 5 ? [rechtsprechung('BGE_117_V_349')] : undefined,
  });

  // ── Event-Timeline aufbauen ──
  type Ev = { datum: Date; iso: string } & ({ typ: 'teilzahlung'; betrag: number } | { typ: 'satzaenderung'; satz: number });
  const events: Ev[] = [];
  (input.ereignisse ?? []).forEach((e) => {
    const d = parseISO(e.datum);
    if (differenceInCalendarDays(d, ersterZinstag) < 0 || differenceInCalendarDays(stichtag, d) < 0) {
      warnungen.push(`Ereignis vom ${fmt(d)} liegt ausserhalb des Zeitraums (${fmt(ersterZinstag)}–${fmt(stichtag)}) und wird ignoriert.`);
      return;
    }
    events.push(e.typ === 'teilzahlung'
      ? { datum: d, iso: e.datum, typ: 'teilzahlung', betrag: e.betrag }
      : { datum: d, iso: e.datum, typ: 'satzaenderung', satz: e.satz });
  });
  events.sort((a, b) => a.datum.getTime() - b.datum.getTime());

  // Grenzpunkte = Event-Daten + Stichtag (in Reihenfolge)
  const grenzen: Date[] = [];
  events.forEach((e) => { if (!grenzen.some((g) => +g === +e.datum)) grenzen.push(e.datum); });
  if (!grenzen.some((g) => +g === +stichtag)) grenzen.push(stichtag);
  grenzen.sort((a, b) => a.getTime() - b.getTime());

  // ── Timeline ablaufen (Zinseszinsverbot: aufgelaufeneZinsen werden NIE verzinst) ──
  let kapital = input.kapital;
  let satz = startSatz;
  let aufgelaufeneZinsen = 0;
  let zinsTotal = 0;
  let zinsGetilgt = 0;
  const segmente: VzSegment[] = [];
  let cursor = ersterZinstag;

  for (const g of grenzen) {
    const { tage, basis } = segmentTageBasis(methode, cursor, g);
    if (tage > 0 && kapital > 0) {
      const zins = round2(kapital * (satz / 100) * (tage / basis));
      segmente.push({ von: fmt(cursor), bis: fmt(g), tage, kapital: round2(kapital), satz, zins });
      aufgelaufeneZinsen = round2(aufgelaufeneZinsen + zins);
      zinsTotal = round2(zinsTotal + zins);
      rechenweg.push({
        beschreibung: `Periode ${fmt(cursor)} – ${fmt(g)} (${tage} Tage)`,
        zwischenergebnis: `CHF ${formatCHF(kapital)} × ${satz} % × ${tage}/${basis} = CHF ${formatCHF(zins)} (${METHODE_LABEL[methode]}).`,
        normen: [N_104_1],
      });
    }
    // Ereignisse an diesem Grenzpunkt anwenden (Teilzahlung zuerst, dann Satzänderung)
    const evHier = events.filter((e) => +e.datum === +g);
    for (const e of evHier.filter((e) => e.typ === 'teilzahlung') as Extract<Ev, { typ: 'teilzahlung' }>[]) {
      const tilgtZins = Math.min(e.betrag, aufgelaufeneZinsen);
      const restKapital = round2(e.betrag - tilgtZins);
      const kapitalVor = kapital;
      aufgelaufeneZinsen = round2(aufgelaufeneZinsen - tilgtZins);
      zinsGetilgt = round2(zinsGetilgt + tilgtZins);
      kapital = round2(Math.max(0, kapital - restKapital));
      if (restKapital > kapitalVor) warnungen.push(`Teilzahlung vom ${fmt(g)} übersteigt die Restschuld; der Überschuss bleibt unberücksichtigt.`);
      rechenweg.push({
        beschreibung: `Teilzahlung CHF ${formatCHF(e.betrag)} am ${fmt(g)} (Art. 85 OR)`,
        zwischenergebnis:
          `Anrechnung zuerst auf aufgelaufene Zinsen (CHF ${formatCHF(tilgtZins)}), dann auf das Kapital (CHF ${formatCHF(Math.min(restKapital, kapitalVor))}). ` +
          `Restkapital neu: CHF ${formatCHF(kapital)}. Aufgelaufene Zinsen werden nicht verzinst (Art. 105 Abs. 3 OR).`,
        normen: [N_85, N_105_3],
        rechtsprechung: [rechtsprechung('BGer_4A_514_2007')],
      });
    }
    for (const e of evHier.filter((e) => e.typ === 'satzaenderung') as Extract<Ev, { typ: 'satzaenderung' }>[]) {
      satz = e.satz;
      rechenweg.push({
        beschreibung: `Zinssatz-Änderung ab ${fmt(g)}`,
        zwischenergebnis: `Neuer Verzugszinssatz: ${satz} %.`,
        normen: [N_104_1],
      });
    }
    cursor = g;
    if (kapital <= 0 && aufgelaufeneZinsen <= 0) break;
  }

  const zinsOffen = aufgelaufeneZinsen;
  const kapitalOffen = kapital;
  const totalOffen = round2(kapitalOffen + zinsOffen);
  // B8-Fix 6.6.2026: tageTotal = Summe der tatsächlich verzinsten Segment-Tage.
  // Vorher wurde die volle Spanne ersterZinstag–Stichtag gemeldet, auch wenn das
  // Kapital durch Teilzahlungen vorher vollständig getilgt war (Kennzahl ≠ Rechnung).
  const tageTotal = segmente.reduce((s, x) => s + x.tage, 0);

  // ── Schritt: Gesamtaufstellung ──
  rechenweg.push({
    beschreibung: 'Ergebnis – Aufstellung',
    zwischenergebnis:
      `Aufgelaufener Verzugszins gesamt: CHF ${formatCHF(zinsTotal)}` +
      (zinsGetilgt > 0 ? `, davon durch Teilzahlungen getilgt CHF ${formatCHF(zinsGetilgt)}, offen CHF ${formatCHF(zinsOffen)}.` : '.') +
      ` Offenes Kapital: CHF ${formatCHF(kapitalOffen)}. Total offen: CHF ${formatCHF(totalOffen)}.`,
    normen: [N_104_1, N_85],
  });

  // ── Hinweise ──
  warnungen.push(
    `Tageszählung (${METHODE_LABEL[methode]}) ist nicht durch Art. 104 OR vorgegeben, sondern eine methodische Annahme; eine zwingende bundesgerichtliche Methode ist nicht belegt – im Einzelfall zu prüfen.`,
    'Teilzahlungen werden zuerst auf Zinsen/Kosten, dann auf das Kapital angerechnet (Art. 85 OR; Reihenfolge Kosten→Zinsen→Kapital nach Lehre/Praxis).',
    'Zinseszinsverbot: Auf aufgelaufene Verzugszinsen werden keine weiteren Verzugszinsen berechnet (Art. 105 Abs. 3 OR).',
    'Über den Verzugszins hinausgehender Schaden bleibt vorbehalten und ist gesondert nachzuweisen (Art. 106 OR).',
  );
  if (grund === 'vertraglich') warnungen.push('Höherer vertraglicher Zinssatz (Art. 104 Abs. 2 OR): Beweislast für die Vereinbarung beim Gläubiger.');
  if (grund === 'kaufmaennisch') warnungen.push('Art. 104 Abs. 3 OR gilt nur im objektiv kaufmännischen Verkehr; der Privatdiskontsatz am Zahlungsort ist nachzuweisen.');
  if (grund === 'gesetzlich' && startSatz !== 5) warnungen.push('Art. 104 Abs. 1 OR ist dispositiv; ein abweichender Satz bedarf einer Grundlage (Vereinbarung/Reglement/Sondergesetz).');
  if (input.rueckstaendigeZinsforderung) warnungen.push('Rückständige Zins-/Rentenforderung: Verzugszinsen laufen erst ab Anhebung der Betreibung oder gerichtlichen Klage (Art. 105 Abs. 1 OR) – der Verzugsbeginn sollte diesem Datum entsprechen.');

  annahmen.push(
    'Erster Zinstag = Verzugsbeginn (Konvention: Anzahl Tage = Stichtag − erster Zinstag).',
    'Geschuldeter Kapitalbetrag als Zinsbasis; aufgelaufene Zinsen werden separat geführt und nicht verzinst.',
  );

  const ergebnisText = zinsGetilgt > 0 || (input.ereignisse ?? []).length > 0
    ? `Offener Verzugszins: CHF ${formatCHF(zinsOffen)}; offenes Kapital: CHF ${formatCHF(kapitalOffen)}; Total offen: CHF ${formatCHF(totalOffen)}. Aufgelaufener Verzugszins gesamt: CHF ${formatCHF(zinsTotal)}.`
    : `Verzugszins: CHF ${formatCHF(zinsTotal)} (${startSatz} % auf CHF ${formatCHF(input.kapital)} für ${tageTotal} Tage). Total inkl. Kapital: CHF ${formatCHF(totalOffen)}.`;

  const normverweise = [N_104_1, N_104_2, N_104_3, N_102, N_85, N_105_3, N_106];
  if (input.rueckstaendigeZinsforderung) normverweise.push(N_105_1);

  return {
    ergebnis: ergebnisText,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise,
    ersterZinstag: fmt(ersterZinstag),
    stichtag: fmt(stichtag),
    methode,
    tageTotal,
    segmente,
    zinsTotal,
    zinsGetilgt,
    zinsOffen,
    kapitalOffen,
    totalOffen,
    zinsTotalCHF: formatCHF(zinsTotal),
    zinsOffenCHF: formatCHF(zinsOffen),
    kapitalOffenCHF: formatCHF(kapitalOffen),
    totalOffenCHF: formatCHF(totalOffen),
  };
}
