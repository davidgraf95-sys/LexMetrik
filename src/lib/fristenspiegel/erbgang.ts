import { berechneErbFrist } from '../erbFristen';
import type { Kanton } from '../../types/legal';
import type { FristenspiegelErgebnis, SpiegelZeile } from './typen';

// ─── Fristenspiegel A.6: Kenntnis des Erbgangs / Todesfall ──────────────────
//
// Orchestrierung über den ERB_FRISTEN-Katalog (Konzept-Dossier A.6, «NICHTS
// fehlt»): Ausschlagung und Inventar-Begehren teilen den Fristbeginn
// (Kenntnis vom Tod bzw. amtliche Mitteilung, Art. 567/580 ZGB) — sie laufen
// hier parallel. Die KLAGEN (Ungültigkeit/Herabsetzung) haben ANDERE Trigger
// (Kenntnis der Verfügung/Verletzung) und erscheinen als Hinweis-Zeilen,
// nie mit einem aus dem Todesdatum gerechneten Ende (Multi-Trigger, §1).

export type ErbgangSpiegelInput = {
  /** gesetzliche Erbin: Kenntnis vom Tod · eingesetzte: amtliche Mitteilung. */
  datum: string; // yyyy-MM-dd
  kanton: Kanton;
  erbenstellung: 'gesetzlich' | 'eingesetzt';
};

export function berechneErbgangsSpiegel(input: ErbgangSpiegelInput): FristenspiegelErgebnis {
  const ausschlagung = berechneErbFrist({
    key: input.erbenstellung === 'gesetzlich' ? 'ausschlagung_gesetzlich' : 'ausschlagung_eingesetzt',
    trigger: input.datum, werktagsVerschiebung: true, kanton: input.kanton,
  });
  const inventar = berechneErbFrist({
    key: 'oeff_inventar_begehren',
    trigger: input.datum, werktagsVerschiebung: true, kanton: input.kanton,
  });

  const zeilen: SpiegelZeile[] = [
    {
      key: 'ausschlagung',
      label: input.erbenstellung === 'gesetzlich'
        ? 'Ausschlagung der Erbschaft (gesetzliche Erbin/Erbe)'
        : 'Ausschlagung der Erbschaft (eingesetzte Erbin/Erbe)',
      normRef: ausschlagung.preset.norm,
      fristnatur: 'verwirkung',
      status: 'berechnet',
      endeText: ausschlagung.resultat.endDatum,
      endeISO: ausschlagung.resultat.endDatumISO,
      bedingung: 'Erklärung an die zuständige kantonale Behörde (Art. 570 ZGB); unbedingt und vorbehaltlos.',
    },
    {
      key: 'inventar',
      label: 'Begehren um öffentliches Inventar',
      normRef: inventar.preset.norm,
      fristnatur: 'verwirkung',
      status: 'berechnet',
      endeText: inventar.resultat.endDatum,
      endeISO: inventar.resultat.endDatumISO,
      bedingung: 'Gleicher Fristbeginn wie die Ausschlagung; das Begehren eines Erben wirkt für alle (Art. 580 Abs. 3 ZGB).',
    },
    {
      key: 'ungueltigkeit',
      label: 'Ungültigkeitsklage',
      normRef: 'Art. 521 ZGB',
      fristnatur: 'verjaehrung',
      status: 'hinweis',
      bedingung: 'Anderer Auslöser: 1 Jahr ab KENNTNIS von Verfügung und Ungültigkeitsgrund (absolut 10 Jahre ab Eröffnung) — im Erb-Fristen-Rechner mit dem richtigen Trigger berechnen.',
    },
    {
      key: 'herabsetzung',
      label: 'Herabsetzungsklage',
      normRef: 'Art. 533 ZGB',
      fristnatur: 'verjaehrung',
      status: 'hinweis',
      bedingung: 'Anderer Auslöser: 1 Jahr ab KENNTNIS der Pflichtteilsverletzung (absolut 10 Jahre) — im Erb-Fristen-Rechner mit dem richtigen Trigger berechnen.',
    },
  ];

  return {
    ereignisLabel: 'Kenntnis des Erbgangs / Todesfall',
    ereignisDatumISO: input.datum,
    zeilen,
    annahmen: [
      input.erbenstellung === 'gesetzlich'
        ? 'Fristbeginn: Kenntnis vom Tod des Erblassers (Art. 567 Abs. 2 ZGB); spätere Kenntnis der Erbenstellung ist nachzuweisen.'
        : 'Fristbeginn: Zugang der amtlichen Mitteilung von der Verfügung (Art. 567 Abs. 2 ZGB).',
      ...ausschlagung.annahmen,
    ],
    warnungen: [...new Set([...ausschlagung.warnungen, ...inventar.warnungen])],
  };
}
