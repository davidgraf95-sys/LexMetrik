import { parseISO } from 'date-fns';
import { berechneAllgemeineFrist } from '../allgemeineFrist';
import { formatDatum } from '../datumsUtils';
import type { FristenspiegelErgebnis, SpiegelZeile } from './typen';

// ─── Fristenspiegel A.3: Arbeitgeber-Kündigung (Art. 336b OR) ───────────────
//
// Konzept-Dossier A.3: Beide 336b-Fristen knüpfen am ENDE der Kündigungsfrist
// (Beendigung des Arbeitsverhältnisses) an — nicht am Zugang. Das schwierige
// Datum rechnet der Sperrfristen-Rechner (`beendigungISO`); der Spiegel
// übernimmt es als ANKER (Eingabe, später Prefill-Brücke) und rechnet darauf
// NUR die 180 Tage mit `allgemeineFrist.ts` (§5 — keine eigene Fristlogik).
//
// §2-Gate (Fahrplan/Dossier): Die 180-Tage-Klagefrist setzt eine GÜLTIG
// erhobene Einsprache voraus — sie erscheint nur als BEDINGTE Zeile.
// Konservativ (Dossier-TODO D.2/3 offen): KEINE Werktags-Verschiebung des
// 180-Tage-Endes unterstellt; stattdessen Warnung, vorher zu handeln.

export type AgKuendigungSpiegelInput = {
  /** Ende der Kündigungsfrist / Beendigung des Arbeitsverhältnisses
   *  (yyyy-MM-dd) — im Sperrfristen-Rechner berechnen (beendigungISO). */
  beendigung: string;
};

export function berechneAgKuendigungsSpiegel(input: AgKuendigungSpiegelInput): FristenspiegelErgebnis {
  // 180 Tage nach Beendigung (Art. 336b Abs. 2 OR) — geteilte Arithmetik,
  // bewusst ohne Wochenend-/Feiertags-Verschiebung (s. Kopfkommentar).
  const klage = berechneAllgemeineFrist({
    start: input.beendigung, laenge: 180, einheit: 'tage',
    wochenendeVerschieben: false, feiertageVerschieben: false,
  });

  const zeilen: SpiegelZeile[] = [
    {
      key: 'einsprache',
      label: 'Einsprache gegen die Kündigung (beim Kündigenden, schriftlich)',
      normRef: 'Art. 336b Abs. 1 OR',
      fristnatur: 'verwirkung',
      status: 'berechnet',
      // Das Ende der Kündigungsfrist IST die Einsprachefrist — keine
      // Arithmetik; angezeigt wird exakt das eingegebene Anker-Datum.
      endeText: formatDatum(parseISO(input.beendigung)),
      endeISO: input.beendigung,
      bedingung: 'Nur bei missbräuchlicher Kündigung (Art. 336/336a OR); längstens bis zum Ende der Kündigungsfrist.',
    },
    {
      key: 'klage',
      label: 'Klage auf Entschädigung',
      normRef: 'Art. 336b Abs. 2 OR',
      fristnatur: 'verwirkung',
      status: 'bedingt',
      endeText: klage.endDatum,
      endeISO: klage.endDatumISO,
      bedingung: 'NUR wenn fristgerecht und gültig Einsprache erhoben wurde und sich die Parteien nicht einigen — sonst ist der Anspruch verwirkt (Art. 336b Abs. 2 OR).',
    },
  ];

  return {
    ereignisLabel: 'Arbeitgeber-Kündigung: Ende der Kündigungsfrist (Art. 336b OR)',
    ereignisDatumISO: input.beendigung,
    zeilen,
    annahmen: [
      'Anker-Datum = Ende der Kündigungsfrist / Beendigung des Arbeitsverhältnisses — im Kündigungs-/Sperrfristen-Rechner berechnen (Sperrfristen verschieben die Beendigung!).',
      'Ordentliche Kündigung durch die Arbeitgeberin. Fristlose Kündigungen (Art. 337 ff. OR) sind NICHT Gegenstand dieses Spiegels.',
    ],
    warnungen: [
      'Ob sich das 180-Tage-Fristende bei Sa/So/Feiertag auf den nächsten Werktag verlängert (Art. 78 OR analog), ist hier nicht unterstellt — die Frist im Zweifel VORHER wahren.',
      'Die Einsprache muss SCHRIFTLICH beim Kündigenden erfolgen; blosse mündliche Beanstandung genügt nicht (Art. 336b Abs. 1 OR).',
    ],
  };
}
