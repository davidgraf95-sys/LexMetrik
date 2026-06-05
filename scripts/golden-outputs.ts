// Golden-Output-Protokoll (§6 CLAUDE.md): friert die Ergebnisse ALLER
// Engines und Vorlagen über eine breite Eingaben-Matrix ein. Vor einem
// Refactoring laufen lassen (→ /tmp/lexmetrik-golden.json), nach dem
// Refactoring erneut + diffen: byte-identisch = verhaltensneutral.
//
//   npx vite-node .scratch/golden-outputs.ts            # schreiben
//   npx vite-node .scratch/golden-outputs.ts vergleich  # vergleichen
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

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

import { testamentZusammenstellen, TESTAMENT_DEFAULTS } from '../src/lib/vorlagen/testament';
import { pvZusammenstellen, PV_DEFAULTS } from '../src/lib/vorlagen/patientenverfuegung';
import { vaZusammenstellen, VA_DEFAULTS } from '../src/lib/vorlagen/vorsorgeauftrag';
import { sgZusammenstellen, SG_DEFAULTS, SG_PERSON_NATUERLICH } from '../src/lib/vorlagen/schlichtungsgesuchBs';
import { avZusammenstellen, AV_DEFAULTS, pruefeAvGates } from '../src/lib/vorlagen/arbeitsvertrag';
import { mvZusammenstellen, MV_DEFAULTS, pruefeMvGates } from '../src/lib/vorlagen/mietvertrag';

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

// ── Schreiben oder Vergleichen ──────────────────────────────────────────────
const PFAD = '/tmp/lexmetrik-golden.json';
const json = JSON.stringify(faelle, null, 1);
if (process.argv[2] === 'vergleich') {
  if (!existsSync(PFAD)) { console.error('Kein Golden-Stand vorhanden — zuerst ohne Argument laufen lassen.'); process.exit(2); }
  const alt = readFileSync(PFAD, 'utf-8');
  if (alt === json) {
    console.log(`IDENTISCH — ${Object.keys(faelle).length} Fälle byte-gleich (verhaltensneutral).`);
  } else {
    const altObj = JSON.parse(alt) as Record<string, unknown>;
    const diffs = Object.keys(faelle).filter((k) => JSON.stringify(altObj[k]) !== JSON.stringify(faelle[k]));
    console.error(`ABWEICHUNG in ${diffs.length} Fällen: ${diffs.join(', ')}`);
    process.exit(1);
  }
} else {
  writeFileSync(PFAD, json);
  const fehler = Object.entries(faelle).filter(([, v]) => (v as { FEHLER?: string })?.FEHLER);
  console.log(`Golden-Stand geschrieben: ${Object.keys(faelle).length} Fälle → ${PFAD}`);
  if (fehler.length) console.log('Mit FEHLER erfasst (Signatur prüfen):', fehler.map(([k]) => k).join(', '));
}
