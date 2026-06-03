import { parseISO, addDays, differenceInDays, isAfter, isBefore, isEqual, endOfMonth } from 'date-fns';
import type { SperrfristenInput, Sperrereignis, Berechnungsergebnis, Normverweis } from '../types/legal';
import {
  berechneDienstjahr,
  formatDatum,
  intervallSchnittTage,
  istInIntervall,
} from './datumsUtils';
import { berechneKuendigungsfrist } from './kuendigungsfrist';

// ─── Feste Normverweise (Art. 336c OR) ────────────────────────────────────

const N_336c_1: Normverweis = { artikel: 'Art. 336c Abs. 1 OR', bemerkung: 'Sperrfristen-Tatbestände' };
const N_336c_2: Normverweis = { artikel: 'Art. 336c Abs. 2 OR', bemerkung: 'Nichtigkeit / Hemmung' };
const N_336c_3: Normverweis = { artikel: 'Art. 336c Abs. 3 OR', bemerkung: 'Erstreckung auf Kündigungstermin' };

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
      let maxTage: number;
      if (dj <= 1)       maxTage = 30;
      else if (dj <= 5)  maxTage = 90;
      else               maxTage = 180;

      // C5: Dienstjahreswechsel 1→2 oder 5→6 innerhalb der Sperrfrist?
      const wechseldaten: { tag: Date; neuMaxTage: number }[] = [
        // Jahrestag für Übergang 1→2. DJ (30→90 Tage)
        { tag: addDays(parseISO(ereignis.von), 0), neuMaxTage: -1 }, // Platzhalter, wird unten befüllt
      ];

      // Berechne Jahrestag 1→2 und 5→6
      let sperrfristEnde: Date;

      // Wechsel 1→2 DJ (wenn dj=1) oder 5→6 DJ (wenn dj=5)
      if (dj === 1 || dj === 5) {
        const naechsterJahrestag = addDays(
          new Date(vertragsbeginn.getFullYear() + (dj), vertragsbeginn.getMonth(), vertragsbeginn.getDate()),
          0,
        );
        const naechsteLaengereMaxTage = dj === 1 ? 90 : 180;
        const vorlaeufigesEnde = addDays(von, maxTage - 1);

        if (
          (isAfter(naechsterJahrestag, von) || isEqual(naechsterJahrestag, von)) &&
          (isBefore(naechsterJahrestag, vorlaeufigesEnde) || isEqual(naechsterJahrestag, vorlaeufigesEnde))
        ) {
          // Jahrestag fällt in die Sperrfrist → C5 Wechsel
          const bereitsVerstrichenTage = differenceInDays(naechsterJahrestag, von);
          const verbleibendeTage = naechsteLaengereMaxTage - bereitsVerstrichenTage;
          const erweiterteEnde = addDays(naechsterJahrestag, verbleibendeTage - 1);
          sperrfristEnde = isBefore(erweiterteEnde, bis) ? erweiterteEnde : bis;
          void wechseldaten; // suppress unused warning
          return {
            von,
            bis: sperrfristEnde,
            beschreibung:
              `Krankheit/Unfall: Sperrfrist ${maxTage} Tage (${dj}. DJ), nach Wechsel zum ${dj + 1}. DJ (C5: ${formatDatum(naechsterJahrestag)}) ` +
              `auf ${naechsteLaengereMaxTage} Tage erweitert. Effektives Ende: ${formatDatum(sperrfristEnde)}.`,
            normen: [N_336c_1, N_336c_2],
          };
        }
      }

      sperrfristEnde = isBefore(bis, addDays(von, maxTage - 1)) ? bis : addDays(von, maxTage - 1);
      return {
        von,
        bis: sperrfristEnde,
        beschreibung: `Krankheit/Unfall: Schutz max. ${maxTage} Tage (${dj}. DJ). Sperrfrist ${formatDatum(von)} – ${formatDatum(sperrfristEnde)}.`,
        normen: [N_336c_1],
      };
    }

    case 'schwangerschaft': {
      return {
        von,
        bis, // wird durch User angegeben (Schwangerschaft bis 16 Wochen nach Niederkunft)
        beschreibung: `Schwangerschaft: Sperrfrist gesamte Schwangerschaft + 16 Wochen (112 Tage) nach Niederkunft. ${formatDatum(von)} – ${formatDatum(bis)}.`,
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
          (dauerTage > 11 ? ` > 11 Tage → Sperrfrist je 4 Wochen davor/danach. Sperrfrist ${formatDatum(sfVon)} – ${formatDatum(sfBis)}.` : ` ≤ 11 Tage → nur Dienstdauer. Sperrfrist ${formatDatum(sfVon)} – ${formatDatum(sfBis)}.`),
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

    // Ordentliche Beendigung berechnen
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

  // ─── Sperrfrist-Intervalle berechnen ────────────────────────────────

  const intervalle: SperrfristIntervall[] = sperrereignisse.map((e) =>
    berechneSperrfristIntervall(e, vb),
  );

  intervalle.forEach((iv, i) => {
    rechenweg.push({
      beschreibung: `Sperrereignis ${i + 1} – ${sperrereignisse[i].typ} (Art. 336c Abs. 1 OR)`,
      zwischenergebnis: iv.beschreibung,
      normen: iv.normen,
    });
  });

  // ─── C2: Kündigung WÄHREND Sperrfrist → nichtig ──────────────────────

  const waehrendSperrfrist = intervalle.find((iv) => istInIntervall(zugang, iv.von, iv.bis));

  if (waehrendSperrfrist) {
    rechenweg.push({
      beschreibung: 'C2 – Kündigung während Sperrfrist → NICHTIG (Art. 336c Abs. 2 OR)',
      zwischenergebnis:
        `Zugang der Kündigung (${formatDatum(zugang)}) fällt in die Sperrfrist ${formatDatum(waehrendSperrfrist.von)} – ${formatDatum(waehrendSperrfrist.bis)}. ` +
        `Die Kündigung ist nichtig. Sie muss nach Ablauf der Sperrfrist unter Einhaltung der ordentlichen Kündigungsfrist wiederholt werden.`,
      normen: [N_336c_2],
    });
    return {
      ergebnis:
        `Kündigung NICHTIG: Zugang (${formatDatum(zugang)}) liegt in der Sperrfrist (${formatDatum(waehrendSperrfrist.von)} – ${formatDatum(waehrendSperrfrist.bis)}). ` +
        `Nach Ablauf der Sperrfrist mit ordentlicher Frist neu kündigen.`,
      status: 'nichtig',
      rechenweg,
      annahmen,
      warnungen: [
        'Sperrfrist (Art. 336c OR) und Lohnfortzahlung (Art. 324a OR) sind voneinander unabhängig. Eine Sperrfrist bedeutet nicht automatisch Lohnfortzahlung in gleicher Dauer.',
        ...warnungen,
      ],
      normverweise: [N_336c_1, N_336c_2],
    };
  }

  // ─── C3: Hemmung – Sperrfrist in laufender Kündigungsfrist ───────────

  rechenweg.push(...kb.ergebnis.rechenweg);
  annahmen.push(...kb.ergebnis.annahmen);

  const beendigungOriginal = kb.beendigungsdatum!;

  // Kündigungsfrist-Intervall: [zugang, beendigungOriginal]
  const kuendigungsfristIntervall = { von: zugang, bis: beendigungOriginal };

  let totalHemmungTage = 0;
  const hemmungen: { intervall: SperrfristIntervall; tage: number }[] = [];

  intervalle.forEach((iv) => {
    const schnitt = intervallSchnittTage(kuendigungsfristIntervall, { von: iv.von, bis: iv.bis });
    if (schnitt > 0) {
      hemmungen.push({ intervall: iv, tage: schnitt });
      totalHemmungTage += schnitt;
    }
  });

  if (totalHemmungTage === 0) {
    rechenweg.push({
      beschreibung: 'C3 – Hemmungsprüfung',
      zwischenergebnis: 'Keine Sperrfrist-Überschneidung mit der Kündigungsfrist. Keine Hemmung.',
      normen: [N_336c_2],
    });
    return {
      ergebnis: kb.ergebnis.ergebnis + ' (Keine Sperrfrist-Hemmung.)',
      status: 'ok',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_336c_1, N_336c_2, N_336c_3, ...kb.ergebnis.normverweise],
    };
  }

  hemmungen.forEach(({ intervall, tage }) => {
    rechenweg.push({
      beschreibung: 'C3 – Hemmung: Sperrfrist schneidet Kündigungsfrist',
      zwischenergebnis:
        `Sperrfrist ${formatDatum(intervall.von)} – ${formatDatum(intervall.bis)} schneidet die Kündigungsfrist ` +
        `(${formatDatum(zugang)} – ${formatDatum(beendigungOriginal)}): ${tage} Hemmungstage.`,
      normen: [N_336c_2],
    });
  });

  rechenweg.push({
    beschreibung: 'Hemmung total',
    zwischenergebnis: `Gesamt Hemmungstage: ${totalHemmungTage}. Ursprüngliches Beendigungsdatum (vor Hemmung): ${formatDatum(beendigungOriginal)}.`,
    normen: [N_336c_2],
  });

  // Beendigungsdatum nach Hemmung (vor Erstreckung)
  const beendigungNachHemmung = addDays(beendigungOriginal, totalHemmungTage);

  // ─── C4: Erstreckung auf Monatsende ──────────────────────────────────

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
        : ` Bereits Monatsende → keine weitere Erstreckung.`),
    normen: [N_336c_3],
  });

  warnungen.push(
    'Sperrfrist (Art. 336c OR) und Lohnfortzahlung (Art. 324a OR) sind voneinander unabhängig. Die Hemmung verlängert die Kündigungsfrist, bestimmt aber nicht die Dauer der Lohnfortzahlung.',
    'Rückfall derselben Krankheit/desselben Unfalls löst keine neue Sperrfrist aus (Rechtsprechung; zu verifizieren).',
  );

  return {
    ergebnis:
      `Kündigung gültig. Kündigungsfrist gehemmt um ${totalHemmungTage} Tage. ` +
      `Beendigungsdatum nach Hemmung und Erstreckung: ${formatDatum(beendigungEndgueltig)}.`,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise: [N_336c_1, N_336c_2, N_336c_3, ...kb.ergebnis.normverweise],
  };
}
