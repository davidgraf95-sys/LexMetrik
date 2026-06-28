// Goldlist/Linter über die ECHTE begruendungsAbsatz()-Ausgabe
// (FAHRPLAN-BEGRUENDUNGS-ABSATZ B0-3, Muster konventionen.test).
//
// EHRLICH (§8): Dieser Test sichert KONVENTION + TYPOGRAFIE des kopierfertigen
// Absatzes (keine «5%», «Art.221», kein ß, kein doppelter Schlusspunkt) und dass
// ein nicht-leerer Normen-Satz entsteht. Er sagt NICHTS über die fachliche
// Rechtsschrift-EIGNUNG aus — die bleibt Davids Abnahme vorbehalten.
//
// Abgedeckt sind genau die Engines, deren Form das ROHE Engine-Ergebnis an
// begruendungsAbsatz() gibt (deckungsgleich mit der B0-2-Golden-Baseline). Die
// UI-gewickelten Forms (allg/zust/rm) folgen mit dem Phase-2-BegruendungSlot.
import { describe, it, expect } from 'vitest';
import { begruendungsAbsatz, fristbeginnZusatz } from '../lib/begruendung';
import { pruefeFormulierung } from '../lib/konventionen';
import { berechneFrist } from '../lib/zpoFristen';
import { berechneSchkgFrist } from '../lib/schkgFristen';
import { berechneSperrfristen } from '../lib/sperrfristen';
import { berechneMietkuendigung } from '../lib/mietrecht';
import { berechneVerjaehrung } from '../lib/verjaehrung';
import { berechneGewaehrleistung } from '../lib/gewaehrleistung';
import { berechneVerzugszins } from '../lib/verzugszins';
import { berechneLohnfortzahlung } from '../lib/lohnfortzahlung';
import { berechneErbteilung } from '../lib/erbteilung';
import { berechneBgerRechtsweg } from '../lib/bgerRechtsweg';
import { berechneStreitwert } from '../lib/streitwert';
import { berechneTeuerung } from '../lib/teuerung';
import { berechneBetreibungskosten } from '../lib/gebvKosten';
import { berechneErbFrist } from '../lib/erbFristen';

const FAELLE: { id: string; absatz: () => string }[] = [
  {
    id: 'zpo:tage10',
    absatz: () => {
      const r = berechneFrist({ ereignis: '2025-12-10', einheit: 'tage', laenge: 10, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich' });
      return begruendungsAbsatz(r, fristbeginnZusatz(r.diesAQuoISO, r.fristbeginnNorm));
    },
  },
  {
    id: 'schkg:rv10',
    absatz: () => {
      const r = berechneSchkgFrist({ ereignis: '2026-03-20', einheit: 'tage', laenge: 10, modus: 'schkg_betreibungsferien', fristnatur: 'verwirkung', kanton: 'ZH' });
      return begruendungsAbsatz(r, fristbeginnZusatz(r.diesAQuoISO, r.fristbeginnNorm));
    },
  },
  { id: 'kuendigung:sperr:krank', absatz: () => begruendungsAbsatz(berechneSperrfristen({ vertragsbeginn: '2020-01-01', zugangKuendigung: '2025-04-20', kuendigendePartei: 'arbeitgeber', probezeitMonate: 1, kuendigungsterminMonatsende: true, sperrereignisse: [{ typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-20' }] })) },
  { id: 'miet:ordentlich', absatz: () => begruendungsAbsatz(berechneMietkuendigung({ kuendigungsart: 'ordentlich', objekt: 'wohnung', zugang: '2026-02-10', kanton: 'ZH', partei: 'mieter' })) },
  { id: 'verj:or127', absatz: () => begruendungsAbsatz(berechneVerjaehrung({ regime: 'ordentlich', beginnRelativ: '2020-03-15', stichtag: '2026-06-05', kanton: 'ZH' })) },
  { id: 'gewaehr:neu', absatz: () => begruendungsAbsatz(berechneGewaehrleistung({ vertragstyp: 'fahrniskauf', vertragsdatum: '2026-02-01', objekt: 'beweglich', uebergabe: '2026-03-01', mangelTyp: 'versteckt', entdeckung: '2026-04-01', kanton: 'ZH', stichtag: '2026-06-05' })) },
  { id: 'verzug:einfach', absatz: () => begruendungsAbsatz(berechneVerzugszins({ kapital: 10000, verzugsbeginn: '2025-01-15', stichtag: '2026-02-20' })) },
  { id: 'lohn:bs', absatz: () => begruendungsAbsatz(berechneLohnfortzahlung({ vertragsbeginn: '2020-01-01', verhinderungBeginn: '2026-02-01', verhinderungEnde: '2026-04-15', arbeitsunfaehigkeitProzent: 100, kanton: 'BS', ktgGleichwertigVorhanden: false })) },
  { id: 'erb:ehegatte2kinder', absatz: () => begruendungsAbsatz(berechneErbteilung({ todesdatum: '2026-03-01', zivilstand: 'verheiratet', kinderLebend: 2 } as never)) },
  { id: 'bger:zivil:50k', absatz: () => begruendungsAbsatz(berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet: 'schuldrecht', vermoegensrechtlich: true, streitwertCHF: 50_000 })) },
  { id: 'streitwert:einmalig50k', absatz: () => begruendungsAbsatz(berechneStreitwert({ begehren: [{ typ: 'einmalig', betragCHF: 50_000 }] })) },
  { id: 'teuerung:indexmiete', absatz: () => begruendungsAbsatz(berechneTeuerung({ modus: 'indexmiete', betrag: 2500, vonMonat: '2007-10', bisMonat: '2012-03' })) },
  { id: 'gebv:zb5000', absatz: () => begruendungsAbsatz(berechneBetreibungskosten({ forderungCHF: 5_000, zahlungsbefehl: { zustellversuche: 2, weitereAusfertigungen: 1 } })) },
  { id: 'erbfrist:ausschlagung', absatz: () => begruendungsAbsatz(berechneErbFrist({ key: 'ausschlagung_gesetzlich', trigger: '2026-03-10' })) },
];

describe('Begründungs-Absatz — Goldlist (Konvention/Typografie)', () => {
  it.each(FAELLE)('$id: keine Konventionsverstösse', ({ absatz }) => {
    const text = absatz();
    const verstoesse = pruefeFormulierung(text).map((v) => v.regel);
    expect(verstoesse).toEqual([]);
  });

  it.each(FAELLE)('$id: nicht-leerer Normen-Satz', ({ absatz }) => {
    expect(absatz()).toContain('Massgebend sind ');
  });

  it.each(FAELLE)('$id: genau ein Schlusspunkt (kein «u. a..»)', ({ absatz }) => {
    const text = absatz();
    expect(text).not.toMatch(/\.\.\s*$/); // Regressionswächter für den B0-2-Bugfix
    expect(text).not.toContain('u. a..');
    expect(text.trimEnd()).toMatch(/[.!?]$/);
  });
});
