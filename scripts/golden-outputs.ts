// Golden-Output-Protokoll (§6 CLAUDE.md): friert die Ergebnisse ALLER
// Engines und Vorlagen über eine breite Eingaben-Matrix ein. Die Basis ist
// COMMITTET (golden/lexmetrik-golden.json) und wird im CI gegated
// (FAHRPLAN-GRUNDLAGEN G2/A1): jeder Push muss byte-gleich sein.
//
//   npm run golden            # Basis NEU schreiben — nur bei deklarierter
//                             # fachlicher Änderung, im selben Commit begründen
//   npm run golden:vergleich  # Gate: aktueller Code vs. committete Basis
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { berechneFrist } from '../src/lib/zpoFristen';
import { berechneSchkgFrist } from '../src/lib/schkgFristen';
import { berechneKuendigungsfrist } from '../src/lib/kuendigungsfrist';
import { berechneSperrfristen } from '../src/lib/sperrfristen';
import { berechneMietkuendigung } from '../src/lib/mietrecht';
import { berechneVerjaehrung } from '../src/lib/verjaehrung';
import { berechneGewaehrleistung } from '../src/lib/gewaehrleistung';
import { berechneVerzugszins } from '../src/lib/verzugszins';
import { berechneLohnfortzahlung } from '../src/lib/lohnfortzahlung';
import { berechneErbteilung } from '../src/lib/erbteilung';
import { berechneAllgemeineFrist, berechneRueckwaertsFrist, tageZwischen, zustellHinweis, icsFuerFrist } from '../src/lib/allgemeineFrist';
import { bestimmeZustaendigkeit, bestimmeRechtsmittel } from '../src/lib/zustaendigkeit';
import { bestimmeSchkgZustaendigkeit } from '../src/lib/schkgZustaendigkeit';
import { bestimmeStrafZustaendigkeit } from '../src/lib/strafZustaendigkeit';

import { testamentZusammenstellen, TESTAMENT_DEFAULTS } from '../src/lib/vorlagen/testament';
import { pvZusammenstellen, PV_DEFAULTS } from '../src/lib/vorlagen/patientenverfuegung';
import { vaZusammenstellen, VA_DEFAULTS } from '../src/lib/vorlagen/vorsorgeauftrag';
import { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } from '../src/lib/vorlagen/schlichtungsgesuchBs';
import { koZusammenstellen, KO_DEFAULTS } from '../src/lib/vorlagen/klageOrdentlich';
import { avZusammenstellen, AV_DEFAULTS, pruefeAvGates } from '../src/lib/vorlagen/arbeitsvertrag';
import { agDokumentmappe, AG_DOK_DEFAULTS, type AgDokAntworten } from '../src/lib/vorlagen/gruendungAgDokumente';
import { mvZusammenstellen, MV_DEFAULTS, pruefeMvGates } from '../src/lib/vorlagen/mietvertrag';
import { maZusammenstellen, MA_DEFAULTS, pruefeMaGates, type MaAntworten } from '../src/lib/vorlagen/mahnung';
import { vvZusammenstellen, VV_DEFAULTS, pruefeVvGates } from '../src/lib/vorlagen/verjaehrungsverzicht';
import { skZusammenstellen, skWarnungen, SK_DEFAULTS } from '../src/lib/vorlagen/scheidungsklage';
import { sbZusammenstellen, SB_DEFAULTS } from '../src/lib/vorlagen/scheidungsbegehren';
import { berechneBgerRechtsweg } from '../src/lib/bgerRechtsweg';

const faelle: Record<string, unknown> = {};
const f = (id: string, fn: () => unknown) => {
  try { faelle[id] = fn(); } catch (e) { faelle[id] = { FEHLER: String(e) }; }
};

// ── Rechner: je Engine mehrere repräsentative + Kanten-Fälle ────────────────
const KANTONE = ['ZH', 'BS', 'GE', 'TI', 'VS'] as const;

for (const kanton of KANTONE) {
  f(`zpo:tage10:${kanton}`, () => berechneFrist({ ereignis: '2025-12-10', einheit: 'tage', laenge: 10, verfahren: 'ordentlich', kanton, fristnatur: 'gesetzlich' }));
  f(`zpo:monat1:${kanton}`, () => berechneFrist({ ereignis: '2026-01-26', einheit: 'monate', laenge: 1, verfahren: 'ordentlich', kanton, fristnatur: 'gesetzlich' }));
}
f('zpo:sommer30', () => berechneFrist({ ereignis: '2026-07-01', einheit: 'tage', laenge: 30, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich' }));
f('zpo:summarisch', () => berechneFrist({ ereignis: '2026-07-01', einheit: 'tage', laenge: 10, verfahren: 'summarisch', kanton: 'ZH', fristnatur: 'gesetzlich' }));
f('zpo:hinweisFehlt', () => berechneFrist({ ereignis: '2026-07-01', einheit: 'tage', laenge: 10, verfahren: 'summarisch', kanton: 'ZH', fristnatur: 'gesetzlich', gerichtshinweisStillstand: false }));
f('zpo:mindermeinung', () => berechneFrist({ ereignis: '2026-01-26', einheit: 'monate', laenge: 1, verfahren: 'ordentlich', kanton: 'ZH', fristnatur: 'gesetzlich', modus: 'mindermeinung' }));

f('schkg:rv10', () => berechneSchkgFrist({ ereignis: '2026-03-20', einheit: 'tage', laenge: 10, modus: 'schkg_betreibungsferien', fristnatur: 'verwirkung', kanton: 'ZH' }));
f('schkg:ostern', () => berechneSchkgFrist({ ereignis: '2026-03-25', einheit: 'tage', laenge: 10, modus: 'schkg_betreibungsferien', fristnatur: 'verwirkung', kanton: 'ZH' }));
f('schkg:weihnachten', () => berechneSchkgFrist({ ereignis: '2025-12-20', einheit: 'tage', laenge: 10, modus: 'schkg_betreibungsferien', fristnatur: 'verwirkung', kanton: 'ZH' }));
f('schkg:zpoStillstand', () => berechneSchkgFrist({ ereignis: '2026-07-01', einheit: 'tage', laenge: 20, modus: 'zpo_stillstand', fristnatur: 'klagefrist', kanton: 'ZH' }));

f('kuendigung:dj1', () => berechneKuendigungsfrist({ vertragsbeginn: '2025-03-01', zugangKuendigung: '2025-09-10', kuendigendePartei: 'arbeitgeber', kuendigungsterminMonatsende: true, probezeitMonate: 1 }));
f('kuendigung:dj10', () => berechneKuendigungsfrist({ vertragsbeginn: '2015-01-01', zugangKuendigung: '2025-09-10', kuendigendePartei: 'arbeitnehmer', kuendigungsterminMonatsende: true, probezeitMonate: 1 }));

f('sperr:krank', () => berechneSperrfristen({ vertragsbeginn: '2020-01-01', zugangKuendigung: '2025-04-20', kuendigendePartei: 'arbeitgeber', probezeitMonate: 1, kuendigungsterminMonatsende: true, sperrereignisse: [{ typ: 'krankheit_unfall', von: '2025-05-01', bis: '2025-05-20' }] }));
f('sperr:nichtig', () => berechneSperrfristen({ vertragsbeginn: '2020-01-01', zugangKuendigung: '2025-03-15', kuendigendePartei: 'arbeitgeber', probezeitMonate: 1, kuendigungsterminMonatsende: true, sperrereignisse: [{ typ: 'militaer_zivil', von: '2025-03-12', bis: '2025-03-20' }, { typ: 'militaer_zivil', von: '2025-03-21', bis: '2025-03-30' }] }));

f('miet:ordentlich', () => berechneMietkuendigung({ kuendigungsart: 'ordentlich', objekt: 'wohnung', zugang: '2026-02-10', kanton: 'ZH', partei: 'mieter' }));
f('miet:zahlungsverzug', () => berechneMietkuendigung({ kuendigungsart: 'zahlungsverzug', objekt: 'wohnung', zugang: '2026-02-10', kanton: 'ZH', partei: 'vermieter' }));
f('miet:geschaeft', () => berechneMietkuendigung({ kuendigungsart: 'ordentlich', objekt: 'geschaeftsraum', zugang: '2026-02-10', kanton: 'ZH', partei: 'mieter' }));

f('verj:or127', () => berechneVerjaehrung({ regime: 'ordentlich', beginnRelativ: '2020-03-15', stichtag: '2026-06-05', kanton: 'ZH' }));
f('verj:delikt', () => berechneVerjaehrung({ regime: 'delikt', beginnRelativ: '2024-02-29', beginnAbsolut: '2024-02-29', stichtag: '2026-06-05', kanton: 'ZH' }));
f('verj:unterbrochen', () => berechneVerjaehrung({ regime: 'kurz', beginnRelativ: '2022-01-10', stichtag: '2026-06-05', kanton: 'ZH', unterbrechungen: [{ datum: '2024-03-01', art: 'betreibung' }] } as never));

f('gewaehr:alt', () => berechneGewaehrleistung({ vertragstyp: 'fahrniskauf', vertragsdatum: '2025-06-01', objekt: 'beweglich', uebergabe: '2025-07-01', mangelTyp: 'offen', kanton: 'ZH', stichtag: '2026-06-05' }));
f('gewaehr:neu', () => berechneGewaehrleistung({ vertragstyp: 'fahrniskauf', vertragsdatum: '2026-02-01', objekt: 'beweglich', uebergabe: '2026-03-01', mangelTyp: 'versteckt', entdeckung: '2026-04-01', kanton: 'ZH', stichtag: '2026-06-05' }));

f('verzug:einfach', () => berechneVerzugszins({ kapital: 10000, verzugsbeginn: '2025-01-15', stichtag: '2026-02-20' }));
f('verzug:teilzahlung', () => berechneVerzugszins({ kapital: 10000, verzugsbeginn: '2025-01-15', stichtag: '2026-02-20', ereignisse: [{ datum: '2025-07-01', typ: 'teilzahlung', betrag: 4000 }] } as never));

f('lohn:bs', () => berechneLohnfortzahlung({ vertragsbeginn: '2020-01-01', verhinderungBeginn: '2026-02-01', verhinderungEnde: '2026-04-15', arbeitsunfaehigkeitProzent: 100, kanton: 'BS', ktgGleichwertigVorhanden: false }));
f('lohn:teilauf', () => berechneLohnfortzahlung({ vertragsbeginn: '2024-06-01', verhinderungBeginn: '2026-01-10', verhinderungEnde: '2026-03-01', arbeitsunfaehigkeitProzent: 50, kanton: 'ZH', ktgGleichwertigVorhanden: false }));

f('erb:ehegatte2kinder', () => berechneErbteilung({ todesdatum: '2026-03-01', zivilstand: 'verheiratet', kinderLebend: 2 } as never));
f('erb:nurEltern', () => berechneErbteilung({ todesdatum: '2026-03-01', zivilstand: 'ledig', kinderLebend: 0 } as never));

f('allg:30t', () => berechneAllgemeineFrist({ start: '2020-10-23', laenge: 30, einheit: 'tage', wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH' }));
f('allg:klemm', () => berechneAllgemeineFrist({ start: '2026-01-31', laenge: 1, einheit: 'monate', wochenendeVerschieben: true, feiertageVerschieben: true, kanton: 'ZH' }));
f('allg:rueck', () => berechneRueckwaertsFrist({ stichtag: '2026-06-30', laenge: 3, einheit: 'monate', verschiebung: 'keine' }));
f('allg:zwischen', () => tageZwischen('2026-06-01', '2026-07-01'));
f('allg:zustell', () => zustellHinweis('einschreiben', '2026-04-01'));
f('allg:ics', () => icsFuerFrist({ titel: 'Fristende', endISO: '2026-06-30', vorfristTage: 3 }));

// ── Zuständigkeits-Engines (deklarierte Erweiterung 6.6.2026: neue Fälle,
// bestehende 53 unverändert — Vergleich gegen alte Baseline bleibt gültig,
// neue IDs werden beim ersten Schreiben Teil der Baseline) ──────────────────
f('zust:geld:80k', () => bestimmeZustaendigkeit({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 80_000 }));
f('zust:miete:kuendigungsschutz', () => bestimmeZustaendigkeit({ streitsache: 'miete_wohn_geschaeft', vermoegensrechtlich: true, streitwertCHF: 25_000, mieteUnterfall: 'kuendigungsschutz' }));
f('zust:gewaltschutz', () => bestimmeZustaendigkeit({ streitsache: 'persoenlichkeit', vermoegensrechtlich: false, streitwertCHF: null, persoenlichkeitUnterfall: 'gewaltschutz' }));
f('zust:ip:gsv', () => bestimmeZustaendigkeit({ streitsache: 'ip_wettbewerb', vermoegensrechtlich: true, streitwertCHF: 12_000, gerichtsstandsvereinbarung: true }));
f('rm:arbeit:15k', () => bestimmeRechtsmittel({ streitsache: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 15_000 }));
f('rm:geld:9999', () => bestimmeRechtsmittel({ streitsache: 'geldforderung', vermoegensrechtlich: true, streitwertCHF: 9_999 }));

// ── BGer-Rechtsweg (FAHRPLAN-BGER-RECHTSWEG R-1, 11.6.2026) ─────────────────
f('bger:zivil:50k', () => berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet: 'schuldrecht', vermoegensrechtlich: true, streitwertCHF: 50_000 }));
f('bger:zivil:schwelle', () => berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet: 'arbeit', vermoegensrechtlich: true, streitwertCHF: 14_999 }));
f('bger:rechtsoeffnung', () => berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet: 'rechtsoeffnung', vermoegensrechtlich: true, streitwertCHF: 50_000, eroeffnung: '2026-07-01', kanton: 'ZH' }));
f('bger:schkg-aufsicht', () => berechneBgerRechtsweg({ weg: 'schkg_aufsicht', eroeffnung: '2026-02-04', kanton: 'ZH' }));
f('bger:wechsel', () => berechneBgerRechtsweg({ weg: 'schkg_aufsicht', wechselbetreibung: true }));
f('bger:eheschutz', () => berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet: 'familienrecht', vermoegensrechtlich: false, eheschutz: true, eroeffnung: '2026-07-01', kanton: 'BS' }));
f('bger:schied', () => berechneBgerRechtsweg({ weg: 'zivil', zivilGebiet: 'schuldrecht', vermoegensrechtlich: true, streitwertCHF: 1_000, schiedsgericht: true }));
f('bger:marke', () => berechneBgerRechtsweg({ weg: 'zivil', markenwiderspruch: true }));
f('bger:straf', () => berechneBgerRechtsweg({ weg: 'straf', objekt: 'zwischen_anderer' }));
f('bger:verwaltung', () => berechneBgerRechtsweg({ weg: 'verwaltung', verwaltungSonderfall: 'rechtshilfe_amtshilfe' }));
f('schkg:einleiten:grundpfand', () => bestimmeSchkgZustaendigkeit({ anliegen: 'betreibung_einleiten', schuldnerTyp: 'jur_person_hr', pfand: 'grundpfand', forderungCHF: 250_000 }));
f('schkg:ro:prov', () => bestimmeSchkgZustaendigkeit({ anliegen: 'rechtsoeffnung', schuldnerTyp: 'natuerlich_wohnsitz', rechtsoeffnungArt: 'provisorisch' }));
f('schkg:widerspruch:dritter_ch', () => bestimmeSchkgZustaendigkeit({ anliegen: 'widerspruch', schuldnerTyp: 'natuerlich_wohnsitz', widerspruchKonstellation: 'gewahrsam_dritter_ch' }));
// Erweiterung Golden-Matrix 7.6.2026: alle 11 SchKG-Anliegen abdecken
// (bislang nur betreibung_einleiten/rechtsoeffnung/widerspruch). Eingaben
// fachlich plausibel, deterministisch.
f('schkg:aberkennung', () => bestimmeSchkgZustaendigkeit({ anliegen: 'aberkennungsklage', schuldnerTyp: 'natuerlich_wohnsitz', forderungCHF: 30_000 }));
f('schkg:anerkennung', () => bestimmeSchkgZustaendigkeit({ anliegen: 'anerkennungsklage', schuldnerTyp: 'jur_person_hr', forderungCHF: 50_000 }));
f('schkg:rueckforderung', () => bestimmeSchkgZustaendigkeit({ anliegen: 'rueckforderung', schuldnerTyp: 'natuerlich_wohnsitz', forderungCHF: 8_000 }));
f('schkg:feststellung', () => bestimmeSchkgZustaendigkeit({ anliegen: 'feststellung', schuldnerTyp: 'natuerlich_wohnsitz', forderungCHF: 15_000 }));
f('schkg:kollokation:konkurs', () => bestimmeSchkgZustaendigkeit({ anliegen: 'kollokation', schuldnerTyp: 'jur_person_hr', kollokationIn: 'konkurs', forderungCHF: 120_000 }));
f('schkg:kollokation:pfaendung', () => bestimmeSchkgZustaendigkeit({ anliegen: 'kollokation', schuldnerTyp: 'natuerlich_wohnsitz', kollokationIn: 'pfaendung', forderungCHF: 20_000 }));
f('schkg:arrest', () => bestimmeSchkgZustaendigkeit({ anliegen: 'arrest', schuldnerTyp: 'ausland_niederlassung', arrestGelegt: true, forderungCHF: 200_000 }));
f('schkg:konkursbegehren:hr', () => bestimmeSchkgZustaendigkeit({ anliegen: 'konkursbegehren', schuldnerTyp: 'jur_person_hr', forderungCHF: 90_000 }));
f('schkg:konkursbegehren:natuerlich', () => bestimmeSchkgZustaendigkeit({ anliegen: 'konkursbegehren', schuldnerTyp: 'natuerlich_wohnsitz', arrestGelegt: true, forderungCHF: 40_000 }));
f('schkg:beschwerde_amt', () => bestimmeSchkgZustaendigkeit({ anliegen: 'beschwerde_amt', schuldnerTyp: 'natuerlich_wohnsitz' }));
f('straf:anzeige:antragsdelikt', () => bestimmeStrafZustaendigkeit({ anliegen: 'anzeige', tatort: 'bekannt', antragsdelikt: true }));
f('straf:kaskade:ergreifung', () => bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'ausland_oder_ungewiss', kaskade32: 'ergreifungsort', mehrereTatenVerschOrte: true }));
// Erweiterung Golden-Matrix 7.6.2026: alle 5 Kaskadenstufen des Art. 32 StPO
// abdecken (bislang nur ergreifungsort). Kaskade greift nur bei
// tatort='ausland_oder_ungewiss' ohne Spezialforum.
f('straf:kaskade:wohnsitz', () => bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'ausland_oder_ungewiss', kaskade32: 'wohnsitz' }));
f('straf:kaskade:aufenthalt', () => bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'ausland_oder_ungewiss', kaskade32: 'aufenthalt' }));
f('straf:kaskade:heimatort', () => bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'ausland_oder_ungewiss', kaskade32: 'heimatort' }));
f('straf:kaskade:auslieferung', () => bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'ausland_oder_ungewiss', kaskade32: 'auslieferung' }));
f('straf:unternehmen', () => bestimmeStrafZustaendigkeit({ anliegen: 'gerichtsstand', tatort: 'bekannt', spezialforum: 'unternehmen', uebertretung: false }));

// ── Vorlagen: assemble-Ergebnisse (Dokument + Protokoll) ────────────────────
f('vorl:testament', () => testamentZusammenstellen({
  ...TESTAMENT_DEFAULTS, vorname: 'Anna', nachname: 'Beispiel', geburtsdatum: '1960-04-12',
  heimatort: 'Basel BS', adresse: 'Musterweg 1, 4051 Basel',
  erben: [{ name: 'B', angaben: 'geb. 1990', quoteProzent: 60 }, { name: 'C', angaben: 'geb. 1992', quoteProzent: 40, ersatz: 'deren Nachkommen' }],
  vermaechtnisse: [{ empfaenger: 'Museum', gegenstand: 'CHF 5000' }],
  willensvollstrecker: 'Dr. X', ortErrichtung: 'Basel', datumErrichtung: '2026-06-15',
}));
f('vorl:pv', () => pvZusammenstellen({ ...PV_DEFAULTS, vorname: 'A', name: 'B', geburtsdatum: '1960-01-01', wohnort: 'Basel', ziel: 'palliativ', situationen: ['terminal'], organspende: 'ja' }));
f('vorl:va-eigen', () => vaZusammenstellen({ ...VA_DEFAULTS, volljaehrig: true, urteilsfaehigBestaetigt: true, keineUmfassendeBeistandschaft: true, vorname: 'A', nachname: 'B', geburtsdatum: '1960-01-01', heimatort: 'Basel', adresse: 'X 1', beauftragte: [{ name: 'C', angaben: 'geb. 1990', typ: 'natuerlich', bereiche: ['personensorge'] }], datum: '2026-06-15' }));
f('vorl:va-notar', () => vaZusammenstellen({ ...VA_DEFAULTS, formMode: 'oeffentlich_beurkundet', volljaehrig: true, urteilsfaehigBestaetigt: true, keineUmfassendeBeistandschaft: true, vorname: 'A', nachname: 'B', geburtsdatum: '1960-01-01', heimatort: 'Basel', adresse: 'X 1', beauftragte: [{ name: 'C', angaben: 'geb. 1990', typ: 'natuerlich', bereiche: ['vermoegenssorge'] }], datum: '2026-06-15' }));
f('vorl:sg', () => sgZusammenstellen({
  ...SG_DEFAULTS, streitgegenstandTyp: 'geldforderung', baselForumBestaetigt: true,
  klaeger: [{ ...SG_PERSON_NATUERLICH, vorname: 'A', name: 'B', strasse: 'S 1', plz: '4051', ort: 'Basel' }],
  beklagte: [{ typ: 'juristisch', firma: 'X GmbH', sitzStrasse: 'S 2', sitzPlz: '4051', sitzOrt: 'Basel' }],
  geld: { betrag: '12000', zins: { satz: '5', abDatum: '2026-01-01' } },
  streitgegenstand: 'Forderung Nr. 2025-117', beilagen: [{ bezeichnung: 'Rechnung' }], datum: '2026-06-15', ort: 'Basel',
}));
const avBasis = {
  ...AV_DEFAULTS, arbeitgeberName: 'AG', arbeitgeberAdresse: 'X 1', arbeitnehmerVorname: 'A', arbeitnehmerName: 'B',
  arbeitnehmerAdresse: 'Y 2', funktion: 'F', arbeitsort: 'Basel', arbeitsortKanton: 'BS', beginn: '2026-08-01',
  lohnBetrag: '6500', ort: 'Basel', datum: '2026-06-15',
} as const;
// Klage ordentliches Verfahren (NEU 10.6.2026, Auftrag David): repräsentativer
// ZH-Fall mit Pflicht-Begründung und dedupliziertem Beweismittelverzeichnis.
f('vorl:ko', () => koZusammenstellen({
  ...KO_DEFAULTS, gerichtsKanton: 'ZH',
  gerichtAufgeloest: { zeilen: ['Bezirksgericht Zürich', 'Postfach', '8036 Zürich'] },
  streitwert: '80000',
  klaeger: { typ: 'natuerlich', vorname: 'A', name: 'B', strasse: 'S 1', plz: '8001', ort: 'Zürich' },
  beklagte: { typ: 'juristisch', firma: 'X AG', sitzStrasse: 'S 2', sitzPlz: '8002', sitzOrt: 'Zürich' },
  streitgegenstand: 'Forderung aus Werkvertrag',
  zins: { satz: '5', abDatum: '2026-04-15' },
  tatsachen: [
    { text: 'Die Parteien schlossen am 1.2.2026 einen Werkvertrag.', beweise: [{ bezeichnung: 'Werkvertrag (Urkunde)' }] },
    { text: 'Die Rechnung blieb trotz Mahnung unbezahlt.', beweise: [{ bezeichnung: 'Mahnung vom 20.4.2026 (Urkunde)' }, { bezeichnung: 'Werkvertrag (Urkunde)' }] },
  ],
  rechtlicheBegruendung: [{ text: 'Der Anspruch stützt sich auf Art. 363 OR.' }],
  klagebewilligungVorhanden: true, klagebewilligungDatum: '2026-05-04',
  vollmachtBeilage: true, ort: 'Zürich', datum: '2026-06-15',
}));

f('vorl:av', () => avZusammenstellen({ ...avBasis }));
f('vorl:av-gates', () => pruefeAvGates({ ...avBasis, lohnfortzahlung: 'ktg', ktgWartefristTage: 60, ktgWartefristLohnProzent: 0 }));
f('vorl:av-kv', () => avZusammenstellen({ ...avBasis, konkurrenzverbot: true, kvEinblickBestaetigt: true, kvGegenstand: 'Treuhand', kvOrt: 'BS', kvDauerMonate: 12, kvKonventionalstrafeCHF: '20000', kvKarenz: true, kvKarenzCHFProMonat: '2000', kvKarenzVerzichtsrecht: true }));
const mvBasis = {
  ...MV_DEFAULTS, vermieterName: 'V', vermieterAdresse: 'X 1', mieterName: 'M', mieterAdresse: 'Y 2',
  objektBeschrieb: '3.5-Zi', objektAdresse: 'Z 3', beginn: '2026-10-01', mietzinsNettoCHF: '2000',
  nebenkostenCHF: '250', nkPositionen: ['Heizung'], ort: 'Basel', datum: '2026-06-15',
} as const;
f('vorl:mv', () => mvZusammenstellen({ ...mvBasis }));
f('vorl:mv-gates', () => pruefeMvGates({ ...mvBasis, kautionCHF: '6800' }));
f('vorl:mv-staffel', () => mvZusammenstellen({ ...mvBasis, mietzinsModell: 'staffel', mindestdauerJahre: 3, staffeln: [{ ab: '2027-10-01', erhoehungCHF: '50' }] }));
// Mahnung & Inverzugsetzung (11.6.2026): beide Varianten + Verfalltag-/
// Vertragszins-/Mahngebühren-Weichen + Gates.
const maBasis: MaAntworten = {
  ...MA_DEFAULTS, absenderName: 'A', absenderAdresse: 'X 1', adressatName: 'B', adressatAdresse: 'Y 2',
  betrag: '1250', rechtsgrund: 'Rechnung Nr. 4711 vom 12. Mai 2026', faelligSeit: '2026-05-15',
  vertragBezeichnung: 'Werkvertrag vom 1. Februar 2026', leistungBeschrieb: 'Lieferung und Montage der Kücheneinrichtung',
  zahlungsverbindung: 'IBAN CH00 0000 0000 0000 0000 0',
  ort: 'Basel', datum: '2026-06-11',
};
f('vorl:ma-zahlung', () => maZusammenstellen({ ...maBasis }));
f('vorl:ma-verfalltag', () => maZusammenstellen({ ...maBasis, verfalltagVereinbart: true, verfalltag: '2026-05-31', zinsVertraglich: true, zinssatzProzent: '8' }));
f('vorl:ma-mahngebuehr', () => maZusammenstellen({ ...maBasis, mahngebuehrErfassen: true, mahngebuehr: '20', mahngebuehrVertraglich: true, betreibungAndrohen: false }));
f('vorl:ma-nachfrist', () => maZusammenstellen({ ...maBasis, variante: 'nachfrist' }));

// Verjährungsverzicht (Art. 141 OR; FAHRPLAN-VORLAGEN-AUSBAU V2, 12.6.2026)
const vvBasis = {
  ...VV_DEFAULTS, absenderName: 'S AG', absenderAdresse: 'X 1, 4051 Basel',
  adressatName: 'G GmbH', adressatAdresse: 'Y 2, 8000 Zürich',
  forderungBeschrieb: 'Werklohnforderung aus Werkvertrag vom 1. Februar 2026',
  verzichtBis: '2027-12-31', ort: 'Basel', datum: '2026-06-12',
};
f('vorl:vv-standard', () => vvZusammenstellen(vvBasis));
f('vorl:vv-betrag-ohne-vorbehalte', () => vvZusammenstellen({ ...vvBasis, betragErfassen: true, betrag: '25000', vorbehaltEingetreten: false, keineAnerkennung: false }));
f('vorl:vv-blanko', () => vvZusammenstellen({ ...VV_DEFAULTS }));
f('vorl:vv-gates-hoechstdauer', () => pruefeVvGates({ ...vvBasis, verzichtBis: '2036-06-13' }));

// Scheidungsklage (Art. 290 ZPO; Musterklagen-Auftrag David 12.6.2026)
const skBasis = {
  ...SK_DEFAULTS, gerichtsKanton: 'BS' as const,
  klaeger: { typ: 'natuerlich' as const, vorname: 'Anna', name: 'Muster', firma: '', strasse: 'A-Gasse 1', plz: '4051', ort: 'Basel' },
  beklagte: { typ: 'natuerlich' as const, vorname: 'Beat', name: 'Muster', firma: '', strasse: 'B-Weg 2', plz: '4052', ort: 'Basel' },
  grund: '114' as const, trennungSeit: '2024-03-01',
  ort: 'Basel', datum: '2026-06-12',
};
f('vorl:sk-standard', () => skZusammenstellen(skBasis));
f('vorl:sk-kinder-115', () => skZusammenstellen({ ...skBasis, grund: '115' as const, trennungSeit: '', kinderErfassen: true, kinder: [{ vorname: 'Carla', geburtsdatum: '2019-05-04' }], obhut: 'alternierend' as const, unterhaltEhegatte: 'beziffert' as const, unterhaltBetrag: '2500' }));
f('vorl:sk-blanko', () => skZusammenstellen({ ...SK_DEFAULTS }));
f('vorl:sk-warnung-zweijahre', () => skWarnungen({ ...skBasis, trennungSeit: '2025-01-01' }));

// Gemeinsames Scheidungsbegehren (Art. 285/286 ZPO; Musterklagen 12.6.2026)
const sbBasis = {
  ...SB_DEFAULTS, gerichtsKanton: 'BS' as const,
  ehegatte1: { typ: 'natuerlich' as const, vorname: 'Anna', name: 'Muster', firma: '', strasse: 'A-Gasse 1', plz: '4051', ort: 'Basel' },
  ehegatte2: { typ: 'natuerlich' as const, vorname: 'Beat', name: 'Muster', firma: '', strasse: 'A-Gasse 1', plz: '4051', ort: 'Basel' },
  vereinbarungDatum: '2026-05-20', ort: 'Basel', datum: '2026-06-12',
};
f('vorl:sb-voll', () => sbZusammenstellen(sbBasis));
f('vorl:sb-teil-kinder', () => sbZusammenstellen({ ...sbBasis, einigung: 'teil' as const, streitigePunkte: ['nachehelicher Unterhalt'], antraegeEhegatte1: ['Es sei kein nachehelicher Unterhalt zuzusprechen.'], kinderErfassen: true, kinder: [{ vorname: 'Carla', geburtsdatum: '2019-05-04' }] }));
f('vorl:sb-blanko', () => sbZusammenstellen({ ...SB_DEFAULTS }));
f('vorl:ma-gates', () => pruefeMaGates({ ...maBasis, mahngebuehrErfassen: true, mahngebuehr: '20' }));
f('vorl:ma-gates-nachfrist', () => pruefeMaGates({ ...maBasis, variante: 'nachfrist' }));

// ── AG-Gründungsmappe (Perfektions-Runde 12, 7.6.2026): repräsentative
// Konstellationen über ALLE Schemas/Weichen — schützt jedes künftige
// Refactoring byte-genau (§6). Erfasst werden Gates + alle Dokumente
// (Titel, ausgabeArt, Absätze).
const agGolden = (id: string, antworten: AgDokAntworten) => f(`ag:${id}`, () => {
  const m = agDokumentmappe(antworten);
  return {
    blocker: m.gates.blocker,
    warnungen: m.gates.warnungen,
    dokumente: m.dokumente.map((d) => ({
      id: d.id, titel: d.titel, ausgabeArt: d.ergebnis.dokument.ausgabeArt,
      absaetze: d.ergebnis.dokument.absaetze,
    })),
  };
});

const AG_BASIS: AgDokAntworten = {
  einlageArt: 'bar', besondereVorteile: false, optingOut: true,
  eigeneBueros: true, immobilienHauptzweck: false, inhaberaktien: false,
  fremdwaehrung: false, bankInUrkundeGenannt: true, chWohnsitzVertretung: true,
  leistungenChf: undefined,
  ...AG_DOK_DEFAULTS,
  firma: 'Golden Muster AG', sitz: 'Zürich', kanton: 'ZH', zweck: 'Beteiligungen',
  gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '100', liberierung: '' }],
  verwaltungsraete: [{ name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'Weg 1, 8000 Zürich', praesident: true, zeichnungsArt: 'einzelunterschrift' }],
  bankName: 'Zürcher Kantonalbank', bankOrt: 'Zürich',
  rechtsdomizilAdresse: 'Weg 1, 8000 Zürich',
  ort: 'Zürich', datum: '2026-06-15',
};

agGolden('bar-voll-singular', AG_BASIS);
agGolden('bar-teil-individuell-lang', {
  ...AG_BASIS,
  statutenUmfang: 'lang', vinkulierung: true, virtuelleGv: true,
  aktienkapitalChf: "200'000", anzahlAktien: '200',
  gruender: [
    { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '120', liberierung: '50' },
    { name: 'Beat Beispiel', angaben: 'von Bern, in Bern', anzahl: '80', liberierung: '' },
  ],
  verwaltungsraete: [
    { name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
    { name: 'Beat Beispiel', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'ohne' },
  ],
  sitzungBeginn: '11.00', sitzungEnde: '11.30',
});
agGolden('gemischt-qualifiziert', {
  ...AG_BASIS,
  einlageArt: 'gemischt', besondereVorteile: true, optingOut: false, eigeneBueros: false,
  immobilienHauptzweck: true, lexKollerGrundstueckErwerb: true,
  aktienkapitalChf: "400'000", anzahlAktien: '400',
  gruender: [
    { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '300', liberierung: '' },
    { name: 'Beat Beispiel', angaben: 'von Bern, in Bern', anzahl: '100', liberierung: '' },
  ],
  verwaltungsraete: [
    { name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
    { name: 'Beat Beispiel', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
  ],
  domizilhalterName: 'Treuhand Muster AG', domizilhalterAdresse: 'Bahnhofstrasse 10, 8001 Zürich',
  revisionsstelleName: 'Revisia AG', revisionsstelleSitz: 'Zürich', revisorName: 'Revisia AG',
  sacheinlagen: [{
    typ: 'geschaeft', bezeichnung: 'Werkbau Muster', belegDatum: '2025-12-31', wertChf: "110'000",
    grundstueck: true, einlegerName: 'Anna Muster', aktienAnzahl: '100', gutschriftChf: "10'000",
    zustand: 'Liegenschaft zum Fortführungswert; Maschinenpark gemäss Anlagespiegel.',
    imHrEingetragen: true, cheNr: 'CHE-111.222.333', aktivenChf: "260'000", passivenChf: "150'000",
    rueckwirkungDatum: '2026-01-01',
  }],
  verrechnungen: [{ glaeubigerName: 'Beat Beispiel', forderungChf: "50'000", aktienAnzahl: '50', begruendungTxt: 'Darlehen vom 01.02.2025, valutiert und fällig.' }],
  vorteile: [{ beguenstigter: 'Anna Muster', inhalt: 'Vorkaufsrecht an der Werkhalle zum Verkehrswert', wertChf: "5'000", begruendungTxt: 'Abgeltung der Aufbauarbeit.' }],
});
agGolden('fw-agio', {
  ...AG_BASIS,
  fremdwaehrung: true, waehrung: 'EUR', kursChf: '0.93', kursQuelle: 'Zürcher Kantonalbank',
  aktienkapitalChf: "120'000", anzahlAktien: '120', ausgabebetragChf: "1'200",
  gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '120', liberierung: '' }],
});
// Stufe 2 (Perfektion P1–P4, 7.6.2026): neue Konstellationen einfrieren.
agGolden('inhaber-bucheffekten', {
  ...AG_BASIS,
  inhaberaktien: true, verwahrungsstelle: 'SIX SIS AG, Olten',
});
agGolden('gemischt-teil-agio', {
  ...AG_BASIS,
  einlageArt: 'gemischt',
  aktienkapitalChf: "200'000", anzahlAktien: '200',
  liberierungProzent: '50', ausgabebetragChf: "1'200",
  gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '200', liberierung: '' }],
  sacheinlagen: [{
    typ: 'sachgesamtheit', bezeichnung: 'eine Werkstatteinrichtung', belegDatum: '2026-06-01',
    wertChf: "120'000", grundstueck: false, einlegerName: 'Anna Muster', aktienAnzahl: '100',
    gutschriftChf: '', zustand: 'gebraucht, betriebsbereit', imHrEingetragen: false, cheNr: '',
    aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
  }],
  revisorName: 'Revisia AG',
});
agGolden('zusatzklauseln', {
  ...AG_BASIS,
  optingOut: false, revisionsstelleName: 'Revisia AG', revisionsstelleSitz: 'Zürich',
  schiedsklausel: true, schiedsOrt: 'Zürich',
  kapitalband: true, kbRichtung: 'beide', kbUntergrenze: "50'000", kbObergrenze: "150'000", kbEndeDatum: '2031-06-01',
  bedingtesKapital: true, bkBetrag: "50'000", bkKreis: 'den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft',
  gjErstesEnde: '31. Dezember 2026',
});
agGolden('urkunden-optionen-nachtrag', {
  ...AG_BASIS,
  konstituierungInUrkunde: true, domizilNurAnmeldung: true,
  verwaltungsraete: [{ ...AG_BASIS.verwaltungsraete[0], annahmeInUrkunde: true }],
  nachtragsbevollmaechtigter: 'Max Muster, 01.01.1990, von Chur, Weg 1, 7000 Chur',
  nachtragAktiv: true, nachtragGruendungsdatum: '2026-06-01',
  nachtragStatutenArtikel: '3', nachtragStatutenAbsatz: '1', nachtragStatutenText: 'Neuer Wortlaut.',
});

// ── Schreiben oder Vergleichen ──────────────────────────────────────────────
// Bug-Check 10.6.2026 (NIEDRIG): fileURLToPath statt .pathname — Letzteres
// liefert prozent-kodierte Pfade (Leerzeichen/Umlaute/Windows-Laufwerke).
const PFAD = fileURLToPath(new URL('../golden/lexmetrik-golden.json', import.meta.url));
const json = JSON.stringify(faelle, null, 1);
if (process.argv[2] === 'vergleich') {
  if (!existsSync(PFAD)) { console.error('Kein Golden-Stand vorhanden — zuerst ohne Argument laufen lassen.'); process.exit(2); }
  const alt = readFileSync(PFAD, 'utf-8');
  if (alt === json) {
    console.log(`IDENTISCH — ${Object.keys(faelle).length} Fälle byte-gleich (verhaltensneutral).`);
  } else {
    const altObj = JSON.parse(alt) as Record<string, unknown>;
    const geaendert = Object.keys(faelle).filter((k) => k in altObj && JSON.stringify(altObj[k]) !== JSON.stringify(faelle[k]));
    const neu = Object.keys(faelle).filter((k) => !(k in altObj));
    const entfernt = Object.keys(altObj).filter((k) => !(k in faelle));
    console.error(`ABWEICHUNG von der committeten Basis (${PFAD}):`);
    if (geaendert.length) console.error(`  geändert (${geaendert.length}): ${geaendert.join(', ')}`);
    if (neu.length) console.error(`  neu (${neu.length}): ${neu.join(', ')}`);
    if (entfernt.length) console.error(`  entfernt (${entfernt.length}): ${entfernt.join(', ')}`);
    console.error('Fachliche Änderung? → `npm run golden` + Begründung im Commit. Refactoring? → Bug.');
    process.exit(1);
  }
} else if (process.argv[2] === 'diff') {
  // Diagnose-Modus (Token-Disziplin 11.6.2026): NUR den Alt/Neu-Diff eines
  // Falls zeigen statt golden/lexmetrik-golden.json (11'900 Zeilen) zu lesen.
  // Ohne Fall-ID: kompakte Liste der abweichenden IDs. Reine Diagnose —
  // das Gate bleibt `golden:vergleich`.
  if (!existsSync(PFAD)) { console.error('Kein Golden-Stand vorhanden — zuerst ohne Argument laufen lassen.'); process.exit(2); }
  const altObj = JSON.parse(readFileSync(PFAD, 'utf-8')) as Record<string, unknown>;
  const id = process.argv[3];
  if (!id) {
    const geaendert = Object.keys(faelle).filter((k) => k in altObj && JSON.stringify(altObj[k]) !== JSON.stringify(faelle[k]));
    const neu = Object.keys(faelle).filter((k) => !(k in altObj));
    const entfernt = Object.keys(altObj).filter((k) => !(k in faelle));
    if (!geaendert.length && !neu.length && !entfernt.length) {
      console.log(`IDENTISCH — ${Object.keys(faelle).length} Fälle byte-gleich.`);
    } else {
      if (geaendert.length) console.log(`geändert (${geaendert.length}): ${geaendert.join(', ')}`);
      if (neu.length) console.log(`neu (${neu.length}): ${neu.join(', ')}`);
      if (entfernt.length) console.log(`entfernt (${entfernt.length}): ${entfernt.join(', ')}`);
      console.log('Einzelfall ansehen: npm run golden:diff -- <id>');
    }
  } else if (!(id in altObj) && !(id in faelle)) {
    console.error(`Unbekannte Fall-ID: ${id}`);
    process.exit(2);
  } else {
    const altZeilen = id in altObj ? JSON.stringify(altObj[id], null, 1).split('\n') : [];
    const neuZeilen = id in faelle ? JSON.stringify(faelle[id], null, 1).split('\n') : [];
    if (altZeilen.join('\n') === neuZeilen.join('\n')) {
      console.log(`IDENTISCH — Fall ${id} byte-gleich.`);
    } else {
      console.log(`DIFF ${id} (− Basis ${PFAD} / + aktueller Code):`);
      // naiver Zeilenvergleich (genügt für Textänderungen; bei Einfügungen
      // verschiebt sich der Index — Ausgabe gedeckelt, Hinweis am Ende)
      const max = Math.max(altZeilen.length, neuZeilen.length);
      let ausgegeben = 0;
      for (let i = 0; i < max && ausgegeben < 80; i++) {
        const a = altZeilen[i];
        const n = neuZeilen[i];
        if (a === n) continue;
        if (a !== undefined) { console.log(`− ${a}`); ausgegeben++; }
        if (n !== undefined) { console.log(`+ ${n}`); ausgegeben++; }
      }
      if (ausgegeben >= 80) console.log(`… gekürzt (Fall stark verändert; Zeilen alt ${altZeilen.length} / neu ${neuZeilen.length}).`);
    }
  }
} else if (process.argv[2] === undefined) {
  writeFileSync(PFAD, json);
  const fehler = Object.entries(faelle).filter(([, v]) => (v as { FEHLER?: string })?.FEHLER);
  console.log(`Golden-Stand geschrieben: ${Object.keys(faelle).length} Fälle → ${PFAD}`);
  if (fehler.length) console.log('Mit FEHLER erfasst (Signatur prüfen):', fehler.map(([k]) => k).join(', '));
} else {
  // Schutz (11.6.2026): JEDES unbekannte Argument fiel früher in den
  // Schreib-Zweig und überschrieb still die committete Basis.
  console.error(`Unbekanntes Argument «${process.argv[2]}» — erlaubt: (ohne) = Basis schreiben · vergleich · diff [id]. Basis NICHT angefasst.`);
  process.exit(2);
}
