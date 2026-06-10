import { bestimmeRechtsmittel } from '../zustaendigkeit';
import { berechneFrist } from '../zpoFristen';
import type { Kanton } from '../../types/legal';
import type { FristenspiegelErgebnis, SpiegelZeile } from './typen';

// ─── Fristenspiegel A.1: Zustellung erstinstanzlicher Zivilentscheid ────────
//
// Orchestrierung über ZWEI bestehende Logiken (§5, Konzept-Dossier A.1/D.3):
// 1. `bestimmeRechtsmittel` (lib/zustaendigkeit.ts) entscheidet die WEICHE
//    (Berufung/Beschwerde, 30/10 Tage, Stillstand ja/nein — Art. 308/311/
//    314/319/321 ZPO inkl. Art. 314 Abs. 2 Rev. 2025) — hier wird KEINE
//    Schwelle dupliziert.
// 2. `berechneFrist` (lib/zpoFristen.ts) rechnet das DATUM mit derselben
//    Engine wie der ZPO-Fristenrechner (Stillstand Art. 145, Endnormalisierung
//    Art. 142 Abs. 3) — exakt die Parameter der Prefill-Brücke 2.1a.
// Anschlussberufung (anderer Auslöser) und BGer (Folgestufe) erscheinen als
// HINWEIS-Zeilen, nie als parallel laufende Daten (Konzept §C/§D).

export type ZivilentscheidSpiegelInput = {
  /** Zustellung des Entscheids (bzw. des Dispositivs, wenn `nurDispositiv`). */
  zustellung: string; // yyyy-MM-dd
  kanton: Kanton;     // Gerichtsort (Art. 142 Abs. 3 ZPO)
  vermoegensrechtlich: boolean;
  streitwertCHF: number | null; // Pflicht, wenn vermögensrechtlich
  verfahren: 'ordentlich_vereinfacht' | 'summarisch';
  /** Art. 314 Abs. 2 ZPO: familienrechtliche Summarsache (271/276/302/305). */
  familienSummarsache?: boolean;
  /** arbeits-/mietrechtlicher Fall → BGer-Schwelle 15 000 (Art. 74 I lit. a BGG). */
  mietOderArbeit?: boolean;
  /** Nur das Dispositiv wurde eröffnet (Art. 239 ZPO) — Vorstufe nötig. */
  nurDispositiv?: boolean;
};

export function berechneZivilentscheidsSpiegel(input: ZivilentscheidSpiegelInput): FristenspiegelErgebnis {
  // Weiche: bestehende Rechtsmittel-Logik (ein Aufruf, §5). Streitsache nur
  // für die BGer-Schwelle relevant (Art. 74 I lit. a vs. b BGG).
  const rm = bestimmeRechtsmittel({
    streitsache: input.mietOderArbeit ? 'arbeit' : 'geldforderung',
    vermoegensrechtlich: input.vermoegensrechtlich,
    streitwertCHF: input.vermoegensrechtlich ? input.streitwertCHF : null,
    rmObjekt: 'endentscheid',
    rmVerfahren: input.verfahren,
    rmVorinstanz: 'erstinstanz',
    rmFamilienSummarsache: input.familienSummarsache,
  });

  const zeilen: SpiegelZeile[] = [];
  const warnungen: string[] = [];

  // ── Vorstufe: Begründung verlangen (Art. 239 Abs. 2 ZPO) ──
  // Parameter identisch mit zpoPresets key 'begruendung' (Test sichert das).
  if (input.nurDispositiv) {
    const beg = berechneFrist({
      ereignis: input.zustellung, einheit: 'tage', laenge: 10,
      verfahren: 'ordentlich', kanton: input.kanton, fristnatur: 'gesetzlich',
    });
    zeilen.push({
      key: 'begruendung',
      label: 'Begründung verlangen (Vorstufe)',
      normRef: 'Art. 239 Abs. 2 ZPO',
      fristnatur: 'gesetzlich',
      status: 'berechnet',
      endeText: beg.diesAdQuem,
      endeISO: beg.diesAdQuemISO,
      bedingung: 'Ohne fristgerechtes Begehren gilt der Verzicht auf die Anfechtung (Art. 239 Abs. 2 ZPO).',
    });
  }

  // ── Hauptrechtsmittel kantonal (Berufung/Beschwerde) ──
  const rmLabel = rm.kantonal === 'berufung' ? 'Berufung an die obere kantonale Instanz'
    : rm.kantonal === 'beschwerde' ? 'Beschwerde an die obere kantonale Instanz'
    : 'Kantonales Rechtsmittel';
  // Härtung 10.6.2026: massgeblich ist das WIRKSAME Familien-Flag — bei
  // mietOderArbeit ist eine Streitigkeit nach Art. 271/276/302/305 ZPO
  // begrifflich ausgeschlossen (dieselbe Regel wendet bestimmeRechtsmittel
  // auf die Streitsache an; deren erklärende Weiche landet in den Warnungen).
  const familienWirksam = input.familienSummarsache === true && !input.mietOderArbeit;
  const rmNorm = rm.kantonal === 'berufung'
    ? (input.verfahren === 'summarisch'
        ? (familienWirksam ? 'Art. 314 Abs. 2 ZPO' : 'Art. 314 Abs. 1 ZPO')
        : 'Art. 311 Abs. 1 ZPO')
    : (input.verfahren === 'summarisch' ? 'Art. 321 Abs. 2 ZPO' : 'Art. 321 Abs. 1 ZPO');

  if (input.nurDispositiv) {
    // §1: Ab dem Dispositiv läuft KEINE Rechtsmittelfrist — kein Datum zeigen.
    zeilen.push({
      key: 'rechtsmittel',
      label: rmLabel,
      normRef: rmNorm,
      fristnatur: 'gesetzlich',
      status: 'hinweis',
      bedingung: 'Die Rechtsmittelfrist läuft erst ab Zustellung des BEGRÜNDETEN Entscheids (Art. 311/321 ZPO) — zuerst Begründung verlangen.',
    });
  } else if (rm.kantonalFrist && rm.kantonalFrist.tage !== null && (rm.kantonal === 'berufung' || rm.kantonal === 'beschwerde')) {
    // Datum: dieselbe Engine + dieselben Parameter wie die Prefill-Brücke 2.1a
    // (laenge aus der Weiche; summarisch → kein Stillstand, Art. 145 II b).
    const frist = berechneFrist({
      ereignis: input.zustellung, einheit: 'tage', laenge: rm.kantonalFrist.tage,
      verfahren: input.verfahren === 'summarisch' ? 'summarisch' : 'ordentlich',
      kanton: input.kanton, fristnatur: 'gesetzlich', gerichtshinweisStillstand: true,
    });
    zeilen.push({
      key: 'rechtsmittel',
      label: rmLabel,
      normRef: rmNorm,
      fristnatur: 'gesetzlich',
      status: 'berechnet',
      endeText: frist.diesAdQuem,
      endeISO: frist.diesAdQuemISO,
      bedingung: rm.kantonalFrist.stillstandText,
    });
  } else {
    zeilen.push({
      key: 'rechtsmittel', label: rmLabel, normRef: rmNorm,
      fristnatur: 'gesetzlich', status: 'hinweis', bedingung: rm.kantonalText,
    });
  }

  // ── Anschlussberufung: anderer Auslöser bzw. unzulässig ──
  if (rm.kantonal === 'berufung') {
    if (input.verfahren === 'summarisch' && !familienWirksam) {
      zeilen.push({
        key: 'anschlussberufung', label: 'Anschlussberufung', normRef: 'Art. 314 Abs. 1 ZPO',
        fristnatur: 'gesetzlich', status: 'ausgeschlossen',
        bedingung: 'Im summarischen Verfahren ist die Anschlussberufung unzulässig (Art. 314 Abs. 1 ZPO).',
      });
    } else {
      zeilen.push({
        key: 'anschlussberufung', label: 'Anschlussberufung (Gegenpartei)', normRef: 'Art. 313 ZPO',
        fristnatur: 'gesetzlich', status: 'hinweis',
        bedingung: 'Anderer Auslöser: Die Anschlussberufung wird in der Berufungsantwort erhoben — die 30-Tage-Frist (Art. 312 Abs. 2 ZPO) läuft ab Zustellung der BERUFUNG an die Gegenpartei, nicht ab der Urteilszustellung.',
      });
    }
  }

  // ── Folgestufe Bundesgericht (nicht parallel — abgesetzt, Konzept §C) ──
  zeilen.push({
    key: 'bger', label: 'Beschwerde in Zivilsachen (Bundesgericht)', normRef: 'Art. 100 Abs. 1 BGG',
    fristnatur: 'gesetzlich', status: 'hinweis',
    bedingung: 'Folgestufe: erst gegen den Entscheid der OBEREN kantonalen Instanz — 30 Tage ab Eröffnung der vollständigen Ausfertigung, eigener Stillstands-Kalender (Art. 46 BGG).',
  });

  warnungen.push(
    rm.kantonalText,
    rm.bgerText,
    ...rm.weichen,
    rm.fristHinweis,
  );

  return {
    ereignisLabel: 'Zustellung eines erstinstanzlichen Zivilentscheids',
    ereignisDatumISO: input.zustellung,
    zeilen,
    annahmen: [
      'Endentscheid einer erstinstanzlichen Zivilbehörde (Zwischenentscheide, prozessleitende Verfügungen, Handelsgerichts- und Art.-5-Konstellationen: Rechtsmittel-Fahrplan im Zuständigkeits-Rechner).',
      `Massgeblich ist die Zustellung ${input.nurDispositiv ? 'des Dispositivs (Art. 239 ZPO)' : 'des begründeten Entscheids'}; Gerichtsort Kanton ${input.kanton} (Feiertage, Art. 142 Abs. 3 ZPO).`,
    ],
    warnungen,
  };
}
