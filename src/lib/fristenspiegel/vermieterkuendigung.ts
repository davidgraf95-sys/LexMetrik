import { berechneMietkuendigung } from '../mietrecht';
import type { Kanton } from '../../types/legal';
import type { Kuendigungsart, Mietobjekt } from '../../types/mietrecht';
import type { FristenspiegelErgebnis, SpiegelZeile } from './typen';

// ─── Fristenspiegel A.4: Zugang einer Vermieter-Kündigung ───────────────────
//
// PILOT des Orchestrierer-Rahmens (Konzept-Dossier §D.3): reiner KONSUMENT
// von lib/mietrecht.ts — die Engine liefert `anfechtungBis`/`erstreckungBis`
// fertig berechnet (Art. 273 OR, Art. 78 OR angewandt; bei Art. 257d/257f
// unterdrückt sie `erstreckungBis` selbst, Art. 272a). Hier wird NICHTS
// gerechnet, nur EIN Engine-Aufruf tabelliert (§5). Der Golden-Test beweist:
// Spiegel-Datum == direktes Engine-Resultat.

// Pilot-Umfang: Kündigungsarten, die ohne Zusatzeingaben deterministisch
// durchlaufen (Konsumgüter/Tod/Eigenbedarf brauchen Mietbeginn → später).
export const VK_KUENDIGUNGSARTEN = [
  { code: 'ordentlich', label: 'Ordentliche Kündigung' },
  { code: 'zahlungsverzug', label: 'Zahlungsverzug (Art. 257d OR)' },
  { code: 'pflichtverletzung', label: 'Pflichtverletzung (Art. 257f Abs. 3 OR)' },
  { code: 'wichtige_gruende', label: 'Wichtige Gründe (Art. 266g OR)' },
] as const satisfies readonly { code: Kuendigungsart; label: string }[];

export type VermieterkuendigungSpiegelInput = {
  zugang: string; // yyyy-MM-dd — Empfang der Kündigung beim Mieter
  objekt: Extract<Mietobjekt, 'wohnung' | 'geschaeftsraum'>;
  kanton: Kanton;
  kuendigungsart: (typeof VK_KUENDIGUNGSARTEN)[number]['code'];
};

// Engine-Anzeigeformat (dd.MM.yyyy) deterministisch nach ISO zurückführen —
// reine Formatkonvertierung, KEINE zweite Berechnung (der Wert bleibt der
// eine Engine-Wert; die Engine selbst bleibt unangetastet, §6).
export function ddMMyyyyZuISO(d: string): string | undefined {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
}

export function berechneVermieterkuendigungsSpiegel(input: VermieterkuendigungSpiegelInput): FristenspiegelErgebnis {
  // EIN Aufruf der bestehenden Engine; terminQuelle ist für die beiden
  // Art.-273-Fristen ohne Belang (sie hängen NUR am Zugang) — gewählt wird
  // die voraussetzungsfreie Quelle, damit kein Mietbeginn nötig ist.
  const e = berechneMietkuendigung({
    kuendigungsart: input.kuendigungsart,
    objekt: input.objekt,
    zugang: input.zugang,
    kanton: input.kanton,
    partei: 'vermieter',
    terminQuelle: 'jedes_monatsende',
  });

  const zeilen: SpiegelZeile[] = [
    {
      key: 'anfechtung',
      label: 'Anfechtung der Kündigung (Schlichtungsbehörde)',
      normRef: 'Art. 273 Abs. 1 OR',
      fristnatur: 'verwirkung',
      status: e.anfechtungBis ? 'berechnet' : 'hinweis',
      endeText: e.anfechtungBis,
      endeISO: e.anfechtungBis ? ddMMyyyyZuISO(e.anfechtungBis) : undefined,
      bedingung: e.anfechtungBis ? undefined : 'kein Datum berechnet — siehe Mietrechts-Rechner (Rechenweg)',
    },
    e.erstreckungBis
      ? {
          key: 'erstreckung',
          label: 'Erstreckungsbegehren (unbefristetes Verhältnis)',
          normRef: 'Art. 273 Abs. 2 lit. a OR',
          fristnatur: 'verwirkung',
          status: 'berechnet',
          endeText: e.erstreckungBis,
          endeISO: ddMMyyyyZuISO(e.erstreckungBis),
        }
      : {
          key: 'erstreckung',
          label: 'Erstreckungsbegehren',
          normRef: 'Art. 272a OR',
          fristnatur: 'verwirkung',
          status: 'ausgeschlossen',
          bedingung: 'Erstreckung bei dieser Kündigungsart ausgeschlossen (Art. 272a OR)',
        },
  ];

  return {
    ereignisLabel: 'Zugang einer Vermieter-Kündigung',
    ereignisDatumISO: input.zugang,
    zeilen,
    annahmen: [
      'Formgültige Kündigung vorausgesetzt (amtliches Formular, Art. 266l Abs. 2 OR; Familienwohnung Art. 266n OR) — Formprüfung im Mietrechts-Rechner.',
      ...e.annahmen,
    ],
    warnungen: [
      // Konzept-Dossier A.4: Art. 273 Abs. 2 lit. b (befristetes Verhältnis,
      // 60 Tage VOR Ablauf) ist eine Rückwärtsfrist und nicht abgebildet.
      'Befristetes Mietverhältnis: Das Erstreckungsbegehren ist dort SPÄTESTENS 60 Tage vor Ablauf der Vertragsdauer zu stellen (Art. 273 Abs. 2 lit. b OR) — diese Rückwärtsfrist zeigt der Spiegel nicht.',
      ...e.warnungen,
    ],
  };
}
