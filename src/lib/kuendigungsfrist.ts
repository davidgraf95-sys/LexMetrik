import { parseISO, addDays, addMonths, isBefore, isEqual } from 'date-fns';
import type { KuendigungsfristInput, Berechnungsergebnis, Normverweis } from '../types/legal';
import {
  berechneDienstjahr,
  formatDatum,
  letzerTagDesMonats,
} from './datumsUtils';
import { rechtsprechung } from '../data/verifikation';

// ─── Feste Normverweise (Art. 335a–c OR) ─────────────────────────────────

const N_335a:   Normverweis = { artikel: 'Art. 335a OR', bemerkung: 'Parität der Kündigungsfristen' };
const N_335b:   Normverweis = { artikel: 'Art. 335b OR', bemerkung: 'Probezeit' };
const N_335c:   Normverweis = { artikel: 'Art. 335c OR', bemerkung: 'Kündigungsfristen und -termine' };
const N_335c_2: Normverweis = { artikel: 'Art. 335c Abs. 2 OR', bemerkung: 'Abänderung; < 1 Monat nur GAV & 1. DJ' };
const N_335c_3: Normverweis = { artikel: 'Art. 335c Abs. 3 OR', bemerkung: 'Verlängerung bei Vaterschaftsurlaub' };

export type KuendigungsfristResultat = {
  ergebnis: Berechnungsergebnis;
  beendigungsdatum?: Date;
  fristLaufendeDatum?: Date;
  istProbezeit: boolean;
  fristMonate: number;
};

function istInProbezeit(vb: Date, zugang: Date, probezeitMonate: number): boolean {
  if (probezeitMonate === 0) return false;
  // Bug-Check 10.6.2026 (MITTEL, deklarierte fachliche Änderung): Der erste
  // Arbeitstag zählt mit (Praxis zu Art. 335b OR: 1 Monat ab 1.4. endet am
  // 30.4.). Vorher galt der Zugang am Tag NACH Probezeitende noch als
  // Probezeitkündigung (7 Tage, keine Sperrfristen).
  const probezeitEnde = addDays(addMonths(vb, probezeitMonate), -1);
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
    rechtsprechung: [rechtsprechung('BGE_134_III_354')],
  });

  // ─── Abweichende Frist prüfen (§3.2 – max() entfernt) ─────────────────
  //
  // Art. 335c Abs. 2 OR: Abänderung durch schriftliche Abrede / NAV / GAV; Minimalfrist
  // 1 Monat (beidseitig zwingend); Verkürzung < 1 Monat nur durch GAV und nur im 1. DJ.
  // Schriftform ist Gültigkeitsvoraussetzung. Parität: für AG und AN gilt dieselbe Frist
  // (Art. 335a Abs. 1 OR).

  let fristMonate = gesetzlicheFristMonate;

  if (abweichendeFristMonate != null) {
    const formGueltig = input.abweichendeFristFormGueltig ?? false;
    const quelleGAV = input.abweichendeFristQuelleGAV ?? false;

    if (!formGueltig) {
      // Schriftform/GAV nicht bestätigt → Abrede unwirksam, gesetzliche Frist gilt.
      fristMonate = gesetzlicheFristMonate;
      warnungen.push(
        abweichendeFristMonate < gesetzlicheFristMonate
          ? `Abweichende Frist (${abweichendeFristMonate} Monate) unterschreitet die gesetzliche Frist (${gesetzlicheFristMonate} Monate); mangels bestätigter Schriftform/GAV (Art. 335c Abs. 2 OR, Gültigkeitsvoraussetzung) gilt die gesetzliche Frist.`
          : `Abweichende Frist (${abweichendeFristMonate} Monate) ist mangels bestätigter Schriftform/GAV (Art. 335c Abs. 2 OR) unwirksam; es gilt die gesetzliche Frist (${gesetzlicheFristMonate} Monate).`,
      );
      rechenweg.push({
        beschreibung: 'Schritt 3 – Abweichende Kündigungsfrist: Schriftform/GAV nicht bestätigt (Art. 335c Abs. 2 OR)',
        zwischenergebnis: `Abrede unwirksam → gesetzliche Frist ${gesetzlicheFristMonate} Monat/e.`,
        normen: [N_335c_2, N_335a],
      });
    } else if (abweichendeFristMonate >= 1) {
      // Gültig vereinbarte Frist ≥ 1 Monat gilt – auch wenn KÜRZER als gesetzlich.
      fristMonate = abweichendeFristMonate;
      rechenweg.push({
        beschreibung: 'Schritt 3 – Abweichende Kündigungsfrist gültig vereinbart (Art. 335a/c OR)',
        zwischenergebnis:
          `Schriftlich/GAV vereinbarte Frist ${abweichendeFristMonate} Monat/e (≥ Minimalfrist 1 Monat) gilt` +
          (abweichendeFristMonate < gesetzlicheFristMonate
            ? `, auch wenn kürzer als die dispositive gesetzliche Frist (${gesetzlicheFristMonate} Monate).`
            : abweichendeFristMonate > gesetzlicheFristMonate
              ? ` (länger als die gesetzliche Frist).`
              : ` (entspricht der gesetzlichen Frist).`) +
          ` Parität (Art. 335a Abs. 1 OR): für Arbeitgeber und Arbeitnehmer gilt dieselbe Frist.`,
        normen: [N_335a, N_335c_2],
      });
    } else if (quelleGAV && dienstjahr === 1) {
      // Verkürzung < 1 Monat nur durch GAV und nur im 1. Dienstjahr.
      fristMonate = abweichendeFristMonate;
      rechenweg.push({
        beschreibung: 'Schritt 3 – Verkürzung < 1 Monat (GAV, 1. Dienstjahr) (Art. 335c Abs. 2 OR)',
        zwischenergebnis: `Durch GAV im 1. Dienstjahr zulässige Frist < 1 Monat: ${abweichendeFristMonate} Monat/e.`,
        normen: [N_335c_2],
      });
    } else {
      // Unzulässige Verkürzung < 1 Monat → gesetzliche Mindestfrist.
      fristMonate = Math.max(1, gesetzlicheFristMonate);
      warnungen.push(
        `Verkürzung unter 1 Monat ist nur durch Gesamtarbeitsvertrag und nur im ersten Dienstjahr zulässig (Art. 335c Abs. 2 OR). Es gilt die gesetzliche Frist (${fristMonate} Monat/e).`,
      );
      rechenweg.push({
        beschreibung: 'Schritt 3 – Unzulässige Verkürzung < 1 Monat (Art. 335c Abs. 2 OR)',
        zwischenergebnis: `Verkürzung unzulässig → gesetzliche Frist ${fristMonate} Monat/e.`,
        normen: [N_335c_2],
      });
    }
  }

  // ─── Fristberechnung und Endtermin (inkl. §3.4 Vaterschaftsurlaub) ────

  let fristLaufende = addMonths(zugang, fristMonate);

  // §3.4 Art. 335c Abs. 3 OR: Verlängerung um nicht bezogene Vaterschaftsurlaubstage —
  // nur bei Arbeitgeberkündigung.
  const vaterschaftResttage =
    kuendigendePartei === 'arbeitgeber' && input.vaterschaftsurlaubResttage
      ? Math.max(0, input.vaterschaftsurlaubResttage)
      : 0;
  if (vaterschaftResttage > 0) {
    fristLaufende = addDays(fristLaufende, vaterschaftResttage); // VERIFY: genaue Tagesberechnung
  }

  const beendigung = kuendigungsterminMonatsende
    ? letzerTagDesMonats(fristLaufende)
    : fristLaufende;

  rechenweg.push({
    beschreibung: `Schritt ${abweichendeFristMonate != null ? 4 : 3} – Fristberechnung und Endtermin`,
    zwischenergebnis:
      `Frist: ${fristMonate} Monat/e ab Zugang ${formatDatum(zugang)} → ${formatDatum(addMonths(zugang, fristMonate))}. ` +
      (vaterschaftResttage > 0
        ? `Verlängerung um ${vaterschaftResttage} nicht bezogene Vaterschaftsurlaubstage (Art. 335c Abs. 3 OR) → ${formatDatum(fristLaufende)}. `
        : '') +
      (kuendigungsterminMonatsende
        ? `Kündigungstermin = Monatsende: Beendigung ${formatDatum(beendigung)}.`
        : `Kein Monatsendtermin: Beendigung ${formatDatum(beendigung)}.`),
    normen: vaterschaftResttage > 0 ? [N_335c, N_335c_3] : [N_335c],
  });

  if (vaterschaftResttage > 0) {
    annahmen.push(
      'Während des Vaterschaftsurlaubs besteht kein zeitlicher Kündigungsschutz (keine Sperrfrist), die Kündigungsfrist verlängert sich aber um die nicht bezogenen Urlaubstage (Art. 335c Abs. 3 OR; Tagesberechnung zu verifizieren).',
    );
  }

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
