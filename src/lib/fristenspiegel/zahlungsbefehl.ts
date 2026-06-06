import { berechneSchkgFrist } from '../schkgFristen';
import { PRESETS_SCHKG } from '../schkgPresets';
import type { Kanton } from '../../types/legal';
import type { FristenspiegelErgebnis, SpiegelZeile } from './typen';

// ─── Fristenspiegel A.2: Zustellung des Zahlungsbefehls ─────────────────────
//
// Orchestrierung über die SchKG-Presets (Konzept-Dossier A.2, «NICHTS fehlt»):
// jede Zeile ruft `berechneSchkgFrist` mit EXAKT den Parametern des
// bestehenden Presets auf (§5 — der Test erzwingt die Parameter-Identität).
// Das Dual von Art. 88 SchKG (frühestens 20 Tage / spätestens 1 Jahr) liefert
// ZWEI Zeilen aus EINEM Preset — genau die Bauform des SchKG-Rechners.

export type ZahlungsbefehlSpiegelInput = {
  zustellung: string; // yyyy-MM-dd — Zustellung des Zahlungsbefehls
  kanton: Kanton;
};

function preset(key: string) {
  const p = PRESETS_SCHKG.find((x) => x.key === key);
  if (!p) throw new Error(`SchKG-Preset fehlt: ${key}`);
  return p;
}

export function berechneZahlungsbefehlsSpiegel(input: ZahlungsbefehlSpiegelInput): FristenspiegelErgebnis {
  const rv = preset('rechtsvorschlag');
  const fb = preset('fortsetzungsbegehren');

  const rvErg = berechneSchkgFrist({
    ereignis: input.zustellung, einheit: rv.einheit!, laenge: rv.laenge!,
    modus: rv.modus, fristnatur: rv.fristnatur, kanton: input.kanton, ausloeser: rv.ausloeser,
  });
  const fbWarte = berechneSchkgFrist({
    ereignis: input.zustellung, einheit: fb.wartefrist!.einheit, laenge: fb.wartefrist!.laenge,
    modus: fb.modus, fristnatur: 'wartefrist', kanton: input.kanton, ausloeser: fb.ausloeser,
  });
  const fbVerwirkung = berechneSchkgFrist({
    ereignis: input.zustellung, einheit: fb.verwirkung!.einheit, laenge: fb.verwirkung!.laenge,
    modus: fb.modus, fristnatur: 'verwirkung', kanton: input.kanton, ausloeser: fb.ausloeser,
  });

  const zeilen: SpiegelZeile[] = [
    {
      key: 'rechtsvorschlag',
      label: 'Rechtsvorschlag (Schuldner)',
      normRef: rv.norm,
      fristnatur: 'gesetzlich',
      status: 'berechnet',
      endeText: rvErg.diesAdQuem,
      endeISO: rvErg.diesAdQuemISO,
      bedingung: 'Keine Begründung nötig (Art. 75 SchKG); Erklärung an den Überbringer oder das Betreibungsamt.',
    },
    {
      key: 'fortsetzung_warte',
      label: 'Fortsetzungsbegehren (Gläubiger) — Wartefrist',
      normRef: 'Art. 88 Abs. 1 SchKG',
      fristnatur: 'wartefrist',
      status: 'bedingt',
      endeText: fbWarte.diesAdQuem,
      endeISO: fbWarte.diesAdQuemISO,
      endePraefix: 'frühestens ab',
      bedingung: 'Nur ohne Rechtsvorschlag bzw. nach dessen Beseitigung — vor Ablauf von 20 Tagen unzulässig (Art. 88 Abs. 1 SchKG).',
    },
    {
      key: 'fortsetzung_verwirkung',
      label: 'Fortsetzungsbegehren (Gläubiger) — Verwirkung',
      normRef: 'Art. 88 Abs. 2 SchKG',
      fristnatur: 'verwirkung',
      status: 'bedingt',
      endeText: fbVerwirkung.diesAdQuem,
      endeISO: fbVerwirkung.diesAdQuemISO,
      bedingung: 'Bei erhobenem Rechtsvorschlag steht die Jahresfrist zwischen Einleitung und Erledigung des dadurch veranlassten Gerichts-/Verwaltungsverfahrens STILL (Art. 88 Abs. 2 SchKG) — diese Hemmung erfasst der Spiegel nicht; mit Hemmungsfenster im SchKG-Fristenrechner rechnen.',
    },
    {
      key: 'rechtsoeffnung',
      label: 'Rechtsöffnung / Aberkennungsklage',
      normRef: 'Art. 83 Abs. 2 SchKG',
      fristnatur: 'klagefrist',
      status: 'hinweis',
      bedingung: 'Folgestufe nach erhobenem Rechtsvorschlag: Die 20-Tage-Frist der Aberkennungsklage läuft erst ab der provisorischen Rechtsöffnung (ZPO-Stillstand, Art. 145 Abs. 4 ZPO) — im SchKG-Fristenrechner berechnen.',
    },
  ];

  // Engine-Warnungen der drei Läufe zusammenführen (dedupliziert, §8).
  const warnungen = [...new Set([...rvErg.warnungen, ...fbWarte.warnungen, ...fbVerwirkung.warnungen])];

  return {
    ereignisLabel: 'Zustellung des Zahlungsbefehls',
    ereignisDatumISO: input.zustellung,
    zeilen,
    annahmen: [
      'Ordentliche Betreibung (auf Pfändung/Konkurs). In der WECHSELbetreibung gilt: Rechtsvorschlag 5 Tage und KEINE Betreibungsferien (Art. 179 Abs. 1 / Art. 56 Ziff. 2 SchKG) — dafür den SchKG-Fristenrechner verwenden.',
      `Kanton ${input.kanton} (staatlich anerkannte Feiertage für die Endregel).`,
      ...new Set([...rvErg.annahmen]),
    ],
    warnungen,
  };
}
