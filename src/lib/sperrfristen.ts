import { parseISO, addDays, differenceInDays, isAfter, isBefore, isEqual, endOfMonth, subMonths } from 'date-fns';
import type { SperrfristenInput, Sperrereignis, Berechnungsergebnis, Normverweis } from '../types/legal';
import {
  berechneDienstjahr,
  formatDatum,
  intervallSchnittTage,
  istInIntervall,
  sperrfristEnde,
} from './datumsUtils';
import { berechneKuendigungsfrist } from './kuendigungsfrist';
import { rechtsprechung } from '../data/verifikation';

// ─── Feste Normverweise (Art. 336c OR) ────────────────────────────────────

const N_336c_1: Normverweis = { artikel: 'Art. 336c Abs. 1 OR', bemerkung: 'Sperrfristen-Tatbestände' };
const N_336c_2: Normverweis = { artikel: 'Art. 336c Abs. 2 OR', bemerkung: 'Nichtigkeit / Hemmung' };
const N_336c_3: Normverweis = { artikel: 'Art. 336c Abs. 3 OR', bemerkung: 'Erstreckung auf Kündigungstermin' };
const N_77:     Normverweis = { artikel: 'Art. 77 OR', bemerkung: 'Anfangstag zählt nicht (§1.2)' };
const N_335c_1: Normverweis = { artikel: 'Art. 335c Abs. 1 OR', bemerkung: 'Rückrechnung vom Endtermin (§1.1)' };

// ─── Hilfsfunktion: Sperrfrist-Intervall berechnen ───────────────────────

type SperrfristIntervall = {
  von: Date;
  bis: Date;
  beschreibung: string;
  normen: Normverweis[];
};

function berechneSperrfristIntervall(
  ereignis: Sperrereignis,
  vertragsbeginn: Date,
): SperrfristIntervall {
  const von = parseISO(ereignis.von);
  const bis = parseISO(ereignis.bis);

  switch (ereignis.typ) {
    case 'krankheit_unfall': {
      // Dienstjahr am Beginn der Verhinderung
      const dj = berechneDienstjahr(vertragsbeginn, von);
      const kurzeMaxTage = dj <= 1 ? 30 : dj <= 5 ? 90 : 180;

      // §1.2: Anfangstag zählt nicht (Art. 77 OR) → sperrfristEnde = von + Tage (kein −1),
      // gekappt durch tatsächliches Ende der Verhinderung ("bis").
      const kurzeEndeMax = sperrfristEnde(von, kurzeMaxTage);
      const kurzeEnde = isBefore(bis, kurzeEndeMax) ? bis : kurzeEndeMax;

      // §1.5 / C5: Dienstjahreswechsel 1→2 (30→90) oder 5→6 (90→180) während laufender Sperrfrist.
      // BGE 133 III 517: längere Sperrfrist ab ERSTEM AUF-Tag berechnen; bereits verstrichene
      // Tage werden dadurch automatisch angerechnet. Nur wenn die (kürzere) Sperrfrist beim
      // Jahrestag NOCH LÄUFT.
      if (dj === 1 || dj === 5) {
        const jahrestag = new Date(
          vertragsbeginn.getFullYear() + dj,
          vertragsbeginn.getMonth(),
          vertragsbeginn.getDate(),
        );
        const laeuftNoch =
          (isAfter(jahrestag, von) || isEqual(jahrestag, von)) &&
          (isBefore(jahrestag, kurzeEnde) || isEqual(jahrestag, kurzeEnde));
        if (laeuftNoch) {
          const neueMaxTage = dj === 1 ? 90 : 180;
          const neuEndeMax = sperrfristEnde(von, neueMaxTage); // ab erstem AUF-Tag, Art. 77 OR
          const neuEnde = isBefore(bis, neuEndeMax) ? bis : neuEndeMax;
          return {
            von,
            bis: neuEnde,
            beschreibung:
              `Krankheit/Unfall: Sperrfrist ${kurzeMaxTage} Tage (${dj}. DJ). Dienstjahreswechsel zum ${dj + 1}. DJ ` +
              `am ${formatDatum(jahrestag)} während laufender Sperrfrist → längere Sperrfrist ${neueMaxTage} Tage ` +
              `ab erstem AUF-Tag (Art. 77 OR), alte Tage angerechnet. Effektives Ende: ${formatDatum(neuEnde)}. ` +
              `(BGE 133 III 517, zu verifizieren.)`,
            normen: [N_336c_1, N_77],
          };
        }
      }

      return {
        von,
        bis: kurzeEnde,
        beschreibung:
          `Krankheit/Unfall: Schutz max. ${kurzeMaxTage} Tage (${dj}. DJ), Anfangstag zählt nicht (Art. 77 OR). ` +
          `Sperrfrist ${formatDatum(von)} – ${formatDatum(kurzeEnde)}.`,
        normen: [N_336c_1, N_77],
      };
    }

    case 'schwangerschaft': {
      return {
        von,
        bis, // Nutzereingabe: Beginn Schwangerschaft bis 16 Wochen (112 Tage) nach Niederkunft
        beschreibung:
          `Schwangerschaft: Sperrfrist gesamte Schwangerschaft + 16 Wochen (112 Tage) nach Niederkunft. ` +
          `${formatDatum(von)} – ${formatDatum(bis)}. (Schwangerschaftsbeginn als Anfangstag: BGE 143 III 21, zu verifizieren.)`,
        normen: [N_336c_1],
      };
    }

    case 'militaer_zivil': {
      const dauerTage = differenceInDays(bis, von) + 1;
      let sfVon = von;
      let sfBis = bis;
      if (dauerTage > 11) {
        sfVon = addDays(von, -28); // 4 Wochen vor
        sfBis = addDays(bis, 28);  // 4 Wochen nach
      }
      return {
        von: sfVon,
        bis: sfBis,
        beschreibung:
          `Militär/Zivildienst: Dauer ${dauerTage} Tage.` +
          (dauerTage > 11
            ? ` > 11 Tage → Sperrfrist je 4 Wochen davor/danach. Sperrfrist ${formatDatum(sfVon)} – ${formatDatum(sfBis)}.`
            : ` ≤ 11 Tage → nur Dienstdauer. Sperrfrist ${formatDatum(sfVon)} – ${formatDatum(sfBis)}.`),
        normen: [N_336c_1],
      };
    }

    case 'hilfsaktion': {
      return {
        von,
        bis,
        beschreibung: `Hilfsaktion (lit. d): Sperrfrist Dauer der Dienstleistung. ${formatDatum(von)} – ${formatDatum(bis)}.`,
        normen: [N_336c_1],
      };
    }
  }
}

// ─── §1.3: Union überlappender Intervalle (verhindert Doppelzählung) ──────

type Iv = { von: Date; bis: Date };

function unionIntervalle(ivs: Iv[]): Iv[] {
  if (ivs.length === 0) return [];
  const sorted = [...ivs].sort((a, b) => a.von.getTime() - b.von.getTime());
  const merged: Iv[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    // Überlappend oder direkt anschliessend (≤ 1 Tag Lücke) → zusammenfassen
    if (!isAfter(cur.von, addDays(last.bis, 1))) {
      if (isAfter(cur.bis, last.bis)) last.bis = cur.bis;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────

export function berechneSperrfristen(input: SperrfristenInput): Berechnungsergebnis {
  const { kuendigendePartei, sperrereignisse = [] } = input;

  const rechenweg: Berechnungsergebnis['rechenweg'] = [];
  const annahmen: string[] = [];
  const warnungen: string[] = [];

  // ─── C7: Arbeitnehmerkündigung ────────────────────────────────────────

  if (kuendigendePartei === 'arbeitnehmer') {
    rechenweg.push({
      beschreibung: 'Sperrfristen-Prüfung (Art. 336c OR)',
      zwischenergebnis: 'Art. 336c OR gilt nur für Arbeitgeberkündigungen. Bei Arbeitnehmerkündigung keine Sperrfristen und keine Hemmung.',
      normen: [N_336c_1],
    });
    const kb = berechneKuendigungsfrist(input);
    rechenweg.push(...kb.ergebnis.rechenweg);
    annahmen.push(...kb.ergebnis.annahmen);
    return {
      ergebnis: kb.ergebnis.ergebnis + ' (Art. 336c OR nicht anwendbar; Arbeitnehmerkündigung bleibt gültig.)',
      status: 'ok',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_336c_1, ...kb.ergebnis.normverweise],
    };
  }

  // ─── Kündigungsfrist-Ergebnis holen ──────────────────────────────────

  const kb = berechneKuendigungsfrist(input);

  if (kb.istProbezeit) {
    rechenweg.push({
      beschreibung: 'Sperrfristen-Prüfung (Art. 336c OR)',
      zwischenergebnis: 'Art. 336c OR gilt nicht während der Probezeit (Art. 335b OR). Beendigung nach 7-Tages-Frist.',
      normen: [N_336c_1, { artikel: 'Art. 335b OR', bemerkung: 'Probezeit' }],
    });
    rechenweg.push(...kb.ergebnis.rechenweg);
    return {
      ergebnis: kb.ergebnis.ergebnis,
      status: 'ok',
      rechenweg,
      annahmen: [...kb.ergebnis.annahmen],
      warnungen,
      normverweise: [N_336c_1],
    };
  }

  if (sperrereignisse.length === 0) {
    rechenweg.push({
      beschreibung: 'Sperrfristen-Prüfung (Art. 336c OR)',
      zwischenergebnis: 'Keine Sperrereignisse angegeben. Keine Sperrfrist-Hemmung.',
      normen: [N_336c_1],
    });
    rechenweg.push(...kb.ergebnis.rechenweg);
    annahmen.push(...kb.ergebnis.annahmen);
    return {
      ...kb.ergebnis,
      rechenweg,
    };
  }

  const vb     = parseISO(input.vertragsbeginn);
  const zugang = parseISO(input.zugangKuendigung);

  // ─── Sperrfrist-Intervalle berechnen (§1.3: Rückfall ohne eigene Frist) ───

  const intervalle: SperrfristIntervall[] = [];
  sperrereignisse.forEach((e, i) => {
    if (e.gleicheUrsacheWieEreignis != null) {
      // §1.3 / BGE 120 II 124: Rückfall derselben Ursache → KEINE neue Sperrfrist.
      rechenweg.push({
        beschreibung: `Sperrereignis ${i + 1} – ${e.typ}: Rückfall (gleiche Ursache wie Ereignis ${e.gleicheUrsacheWieEreignis + 1})`,
        zwischenergebnis:
          `Gleichartiger Grund derselben Ursache löst keine neue Sperrfrist aus (BGE 120 II 124 «aucun lien», zu verifizieren). ` +
          `Keine eigene Sperrfrist; das Kontingent des ursprünglichen Ereignisses bleibt massgebend.`,
        normen: [N_336c_1],
      });
      return;
    }
    const iv = berechneSperrfristIntervall(e, vb);
    intervalle.push(iv);
    rechenweg.push({
      beschreibung: `Sperrereignis ${i + 1} – ${e.typ} (Art. 336c Abs. 1 OR)`,
      zwischenergebnis: iv.beschreibung,
      normen: iv.normen,
    });
  });

  warnungen.push(
    'Sperrfrist (Art. 336c OR) und Lohnfortzahlung (Art. 324a OR) sind voneinander unabhängig. Eine Sperrfrist bedeutet nicht automatisch Lohnfortzahlung in gleicher Dauer (Art. 336c N 2; BGE 115 V 437, zu verifizieren).',
  );

  // ─── C2: Kündigung WÄHREND Sperrfrist → nichtig (Stichtag = Zugang) ───

  const waehrendSperrfrist = intervalle.find((iv) => istInIntervall(zugang, iv.von, iv.bis));

  if (waehrendSperrfrist) {
    rechenweg.push({
      beschreibung: 'C2 – Kündigung während Sperrfrist → NICHTIG (Art. 336c Abs. 2 OR)',
      zwischenergebnis:
        `Zugang der Kündigung (${formatDatum(zugang)}) fällt in die Sperrfrist ${formatDatum(waehrendSperrfrist.von)} – ${formatDatum(waehrendSperrfrist.bis)}. ` +
        `Die Kündigung ist nichtig. Sie muss nach Ablauf der Sperrfrist unter Einhaltung der ordentlichen Kündigungsfrist wiederholt werden.`,
      normen: [N_336c_2],
      rechtsprechung: [rechtsprechung('BGE_134_III_354')],
    });
    return {
      ergebnis:
        `Kündigung NICHTIG: Zugang (${formatDatum(zugang)}) liegt in der Sperrfrist (${formatDatum(waehrendSperrfrist.von)} – ${formatDatum(waehrendSperrfrist.bis)}). ` +
        `Nach Ablauf der Sperrfrist mit ordentlicher Frist neu kündigen.`,
      status: 'nichtig',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_336c_1, N_336c_2],
    };
  }

  // ─── §1.1: Hemmung anhand der RÜCKGERECHNETEN Kündigungsfrist ────────

  rechenweg.push(...kb.ergebnis.rechenweg);
  annahmen.push(...kb.ergebnis.annahmen);

  const ende_ungehemmt = kb.beendigungsdatum!; // Endtermin (Monatsende) aus Modul B
  // VERIFY: Rückrechnung Fristbeginn = Endtermin − Frist (Kalendermonate). Bei Monatsendtermin
  // beginnt die Frist effektiv am 1. des auf den Zugang folgenden Monats; Rückrechnungslehre
  // (h.L., BGE 134 III 354 / 115 V 437), a.M. BGE 131 III 467 (Frist ab Zustellung).
  const beginn_frist = subMonths(ende_ungehemmt, kb.fristMonate);

  annahmen.push(
    `Hemmung nach Rückrechnungsprinzip: massgeblich ist die rückgerechnete Kündigungsfrist ` +
    `(${formatDatum(beginn_frist)} – ${formatDatum(ende_ungehemmt)}), nicht das Fenster ab Zugang (${formatDatum(zugang)}). ` +
    `Ein Sperrgrund zwischen Zugang und Fristbeginn löst keine Hemmung aus (Art. 336c N 7, abweichende Lehre vorhanden).`,
  );

  rechenweg.push({
    beschreibung: 'C3 – Rückgerechnete Kündigungsfrist (Art. 335c Abs. 1 i.V.m. Art. 336c Abs. 2 OR)',
    zwischenergebnis:
      `Endtermin (ungehemmt): ${formatDatum(ende_ungehemmt)}. Frist ${kb.fristMonate} Monat/e rückgerechnet → ` +
      `hemmbares Fenster ${formatDatum(beginn_frist)} – ${formatDatum(ende_ungehemmt)}. ` +
      `Sperrgründe zwischen Zugang (${formatDatum(zugang)}) und Fristbeginn werden NICHT gehemmt.`,
    normen: [N_335c_1, N_336c_2],
    rechtsprechung: [rechtsprechung('BGE_134_III_354'), rechtsprechung('BGE_115_V_437'), rechtsprechung('BGE_131_III_467')],
  });

  // §1.3: Union der Sperrfrist-Intervalle bilden, dann mit dem Fenster schneiden.
  const fenster: Iv = { von: beginn_frist, bis: ende_ungehemmt };
  const union = unionIntervalle(intervalle.map((iv) => ({ von: iv.von, bis: iv.bis })));

  let totalHemmungTage = 0;
  union.forEach((piece) => {
    const schnitt = intervallSchnittTage(fenster, piece);
    if (schnitt > 0) {
      totalHemmungTage += schnitt;
      rechenweg.push({
        beschreibung: 'C3 – Hemmung: Sperrfrist schneidet rückgerechnete Kündigungsfrist',
        zwischenergebnis:
          `Sperrfrist-Abschnitt ${formatDatum(piece.von)} – ${formatDatum(piece.bis)} schneidet das Fenster ` +
          `${formatDatum(beginn_frist)} – ${formatDatum(ende_ungehemmt)}: ${schnitt} Hemmungstage.`,
        normen: [N_336c_2],
      });
    }
  });

  if (totalHemmungTage === 0) {
    rechenweg.push({
      beschreibung: 'C3 – Hemmungsprüfung',
      zwischenergebnis: 'Keine Sperrfrist-Überschneidung mit der rückgerechneten Kündigungsfrist. Keine Hemmung.',
      normen: [N_336c_2],
    });
    return {
      ergebnis: kb.ergebnis.ergebnis + ' (Keine Sperrfrist-Hemmung; Sperrgrund ausserhalb der rückgerechneten Frist.)',
      status: 'ok',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_336c_1, N_336c_2, N_336c_3, N_335c_1, ...kb.ergebnis.normverweise],
    };
  }

  rechenweg.push({
    beschreibung: 'Hemmung total',
    zwischenergebnis: `Gesamt Hemmungstage (Union, keine Doppelzählung): ${totalHemmungTage}. Endtermin vor Hemmung: ${formatDatum(ende_ungehemmt)}.`,
    normen: [N_336c_2],
  });

  // Endtermin nach Hemmung (vor Erstreckung)
  const beendigungNachHemmung = addDays(ende_ungehemmt, totalHemmungTage);

  // ─── §1.4 / C4: Erstreckung auf Endtermin (Monatsende) ───────────────

  const eoM = endOfMonth(beendigungNachHemmung);
  const beendigungEndgueltig =
    input.kuendigungsterminMonatsende && !isEqual(beendigungNachHemmung, eoM)
      ? eoM
      : beendigungNachHemmung;

  rechenweg.push({
    beschreibung: 'C4 – Erstreckung auf Kündigungstermin (Art. 336c Abs. 3 OR)',
    zwischenergebnis:
      `Nach Hemmung: ${formatDatum(beendigungNachHemmung)}.` +
      (input.kuendigungsterminMonatsende && !isEqual(beendigungNachHemmung, eoM)
        ? ` Kein Monatsende → Erstreckung auf ${formatDatum(beendigungEndgueltig)}.`
        : ` Bereits Monatsende → keine weitere Erstreckung.`) +
      ` Eine neue Arbeitsunfähigkeit in der Erstreckungsphase löst keine neue Sperrfrist aus (BGE 124 III 474, zu verifizieren).`,
    normen: [N_336c_3],
    rechtsprechung: [rechtsprechung('BGE_124_III_474')],
  });

  warnungen.push(
    'Rückfall derselben Krankheit/desselben Unfalls löst keine neue Sperrfrist aus (BGE 120 II 124, zu verifizieren).',
  );

  return {
    ergebnis:
      `Kündigung gültig. Kündigungsfrist gehemmt um ${totalHemmungTage} Tage. ` +
      `Beendigungsdatum nach Hemmung und Erstreckung: ${formatDatum(beendigungEndgueltig)}.`,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise: [N_336c_1, N_336c_2, N_336c_3, N_335c_1, ...kb.ergebnis.normverweise],
  };
}
