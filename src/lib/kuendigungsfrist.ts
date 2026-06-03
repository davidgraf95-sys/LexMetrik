import { parseISO, addDays, addMonths, isBefore, isEqual } from 'date-fns';
import type { KuendigungsfristInput, Berechnungsergebnis, Normverweis } from '../types/legal';
import {
  berechneDienstjahr,
  formatDatum,
  letzerTagDesMonats,
} from './datumsUtils';

// ─── Feste Normverweise (Art. 335a–c OR) ─────────────────────────────────

const N_335a: Normverweis = { artikel: 'Art. 335a OR', bemerkung: 'Parität der Kündigungsfristen' };
const N_335b: Normverweis = { artikel: 'Art. 335b OR', bemerkung: 'Probezeit' };
const N_335c: Normverweis = { artikel: 'Art. 335c OR', bemerkung: 'Kündigungsfristen und -termine' };

export type KuendigungsfristResultat = {
  ergebnis: Berechnungsergebnis;
  beendigungsdatum?: Date;
  fristLaufendeDatum?: Date;
  istProbezeit: boolean;
  fristMonate: number;
};

function istInProbezeit(vb: Date, zugang: Date, probezeitMonate: number): boolean {
  if (probezeitMonate === 0) return false;
  const probezeitEnde = addMonths(vb, probezeitMonate);
  return isBefore(zugang, probezeitEnde) || isEqual(zugang, probezeitEnde);
}

export function berechneKuendigungsfrist(input: KuendigungsfristInput): KuendigungsfristResultat {
  const {
    vertragsbeginn,
    zugangKuendigung,
    kuendigendePartei,
    probezeitMonate,
    abweichendeFristMonate,
    kuendigungsterminMonatsende,
  } = input;

  const vb     = parseISO(vertragsbeginn);
  const zugang = parseISO(zugangKuendigung);

  const rechenweg: Berechnungsergebnis['rechenweg'] = [];
  const annahmen: string[] = [
    'Massgebend ist der Zugang der Kündigung beim Empfänger (Zugangsprinzip), nicht das Datum des Absenders.',
    `Kündigungstermin: ${kuendigungsterminMonatsende ? 'Monatsende' : 'freies Datum (kein Monatsendtermin vereinbart)'}.`,
  ];
  const warnungen: string[] = [];

  // ─── Probezeit prüfen (Art. 335b OR) ─────────────────────────────────

  const dauerProbezeitMonate = Math.min(Math.max(probezeitMonate, 0), 3);
  const inProbezeit = istInProbezeit(vb, zugang, dauerProbezeitMonate);

  if (dauerProbezeitMonate > 0) {
    const probezeitEnde = addMonths(vb, dauerProbezeitMonate);
    rechenweg.push({
      beschreibung: 'Schritt 1 – Probezeit prüfen (Art. 335b OR)',
      zwischenergebnis: inProbezeit
        ? `Zugang ${formatDatum(zugang)} liegt in der Probezeit (${dauerProbezeitMonate} Monat/e, Ende ${formatDatum(probezeitEnde)}). Frist: 7 Tage, kein Monatsendtermin, keine Sperrfristen.`
        : `Zugang ${formatDatum(zugang)} liegt ausserhalb der Probezeit (Ende ${formatDatum(probezeitEnde)}). Ordentliche Frist gilt.`,
      normen: [N_335b],
    });
  }

  if (inProbezeit) {
    const beendigung = addDays(zugang, 7);
    return {
      ergebnis: {
        ergebnis: `Kündigung in der Probezeit: Frist 7 Tage. Beendigung: ${formatDatum(beendigung)}.`,
        status: 'ok',
        rechenweg,
        annahmen,
        warnungen,
        normverweise: [N_335b, N_335a],
      },
      beendigungsdatum: beendigung,
      istProbezeit: true,
      fristMonate: 0,
    };
  }

  // ─── Dienstjahr und gesetzliche Frist (Art. 335c OR) ─────────────────

  const dienstjahr = berechneDienstjahr(vb, zugang);

  let gesetzlicheFristMonate: number;
  if (dienstjahr <= 1) {
    gesetzlicheFristMonate = 1;
  } else if (dienstjahr <= 9) {
    gesetzlicheFristMonate = 2;
  } else {
    gesetzlicheFristMonate = 3;
  }

  rechenweg.push({
    beschreibung: 'Schritt 2 – Dienstjahr (Stichtag = Zugang der Kündigung)',
    zwischenergebnis:
      `Vertragsbeginn ${formatDatum(vb)}, Zugang ${formatDatum(zugang)}: ${dienstjahr - 1} vollendete Jahre + 1 = ${dienstjahr}. Dienstjahr. Gesetzliche Frist: ${gesetzlicheFristMonate} Monat/e.`,
    normen: [N_335c],
    rechtsprechung: [
      {
        aktenzeichen: 'BGE 134 III 354',
        aussage: 'Massgeblich ist der Zugang der Kündigung beim Empfänger (Empfangs- bzw. Zugangsprinzip)',
        verifiziert: false,
      },
    ],
  });

  // ─── Abweichende Frist prüfen ─────────────────────────────────────────

  let fristMonate = gesetzlicheFristMonate;

  if (abweichendeFristMonate != null) {
    // Parität: gilt die längere Frist (Art. 335a)
    fristMonate = Math.max(abweichendeFristMonate, gesetzlicheFristMonate);

    if (abweichendeFristMonate < gesetzlicheFristMonate) {
      warnungen.push(
        `Abweichende Frist (${abweichendeFristMonate} Monate) unterschreitet die gesetzliche Mindestfrist (${gesetzlicheFristMonate} Monate). Es gilt die gesetzliche Frist. Verkürzung unter 1 Monat nur im 1. DJ und nur durch GAV zulässig (Art. 335c OR; genaue Absatznummer zu verifizieren).`,
      );
    }

    if (abweichendeFristMonate !== gesetzlicheFristMonate) {
      rechenweg.push({
        beschreibung: 'Schritt 3 – Abweichende Kündigungsfrist prüfen (Art. 335a/c OR)',
        zwischenergebnis:
          `Abweichende Frist: ${abweichendeFristMonate} Monate. Gesetzliche Frist: ${gesetzlicheFristMonate} Monate. ` +
          `Parität (Art. 335a OR): Massgebend ist die längere Frist = ${fristMonate} Monate.`,
        normen: [N_335a, N_335c],
      });
    } else {
      rechenweg.push({
        beschreibung: 'Schritt 3 – Abweichende Kündigungsfrist (Art. 335c OR)',
        zwischenergebnis: `Abweichende Frist: ${abweichendeFristMonate} Monate (entspricht der gesetzlichen Frist).`,
        normen: [N_335a, N_335c],
      });
    }
  }

  // ─── Fristberechnung und Endtermin ────────────────────────────────────

  const fristLaufende = addMonths(zugang, fristMonate);
  const beendigung = kuendigungsterminMonatsende
    ? letzerTagDesMonats(fristLaufende)
    : fristLaufende;

  rechenweg.push({
    beschreibung: `Schritt ${abweichendeFristMonate != null ? 4 : 3} – Fristberechnung und Endtermin`,
    zwischenergebnis:
      `Frist: ${fristMonate} Monat/e ab Zugang ${formatDatum(zugang)} → ${formatDatum(fristLaufende)}. ` +
      (kuendigungsterminMonatsende
        ? `Kündigungstermin = Monatsende: Beendigung ${formatDatum(beendigung)}.`
        : `Kein Monatsendtermin: Beendigung ${formatDatum(beendigung)}.`),
    normen: [N_335c],
  });

  annahmen.push(
    `Kündigung durch: ${kuendigendePartei === 'arbeitgeber' ? 'Arbeitgeber' : 'Arbeitnehmer'}.`,
  );

  return {
    ergebnis: {
      ergebnis: `Ordentliche Kündigung (${kuendigendePartei === 'arbeitgeber' ? 'Arbeitgeber' : 'Arbeitnehmer'}): Frist ${fristMonate} Monat/e. Beendigungsdatum: ${formatDatum(beendigung)}.`,
      status: 'ok',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_335a, N_335b, N_335c],
    },
    beendigungsdatum: beendigung,
    fristLaufendeDatum: fristLaufende,
    istProbezeit: false,
    fristMonate,
  };
}
