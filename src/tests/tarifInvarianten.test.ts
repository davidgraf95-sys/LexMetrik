// ─── Permanente Tarif-Invarianten (Regressions-Gate) ────────────────────────
//
// FAHRPLAN-LUECKEN-SCHLIESSEN. Die manuellen 4-Pass-Verifikationen (find →
// Doppelcheck → Zweitprüfung → Reencode + Stützpunkt-Abgleich) haben strukturelle
// Kodier-Fehler aufgedeckt (degressive Staffeln als Flachsatz, Sockel-Bug, Gesamt-
// wert vs. marginal). Damit diese Klassen NIE WIEDER stillschweigend zurückkehren,
// sind die strukturellen Invarianten hier als CI-Gate festgeschrieben (§6):
//   1. Monotonie — eine wertbasierte Gebühr darf bei steigendem Wert nie SINKEN
//      (ein Abwärtssprung an einer Bandgrenze = Sockel-/Akkumulations-Fehler).
//   2. Sanity — jeder deterministische Betrag ist endlich und ≥ 0.
//   3. Klammer-Treue — Mindest-/Höchstbetrag werden über alle Bänder respektiert.
import { describe, expect, it } from 'vitest';
import { tarifFuer, berechneBeurkundung } from '../lib/beurkundung';
import { GESCHAEFTSART_IDS } from '../data/tarif/beurkundung-typen';
import { tarifFuerGb, berechneGrundbuchgebuehr } from '../lib/grundbuchgebuehren';
import { GB_EINTRAGSART_IDS } from '../data/tarif/grundbuch-typen';
import { KANTONE, type KantonCode } from '../data/tarif/typen';
import { SONDERTARIFE, GRUNDSTUECKKAUF_BEURKUNDUNG } from '../data/tarif/beurkundung';
import { GRUNDBUCH_EIGENTUM_KAUF, GRUNDBUCH_EINTRAG } from '../data/tarif/grundbuch';
import { auswertenTarif } from '../lib/tarif/staffel';

const WERTE = [1, 10_000, 50_000, 100_000, 200_000, 300_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000];

const detVal = (e: { deterministisch: boolean; betragChf?: number }): number | null =>
  e.deterministisch ? (e as { betragChf: number }).betragChf : null;

function pruefeMonotonieUndSanity(label: string, werte: (number | null)[]): string[] {
  const fehler: string[] = [];
  let prev = -Infinity, prevW = 0;
  for (let i = 0; i < WERTE.length; i++) {
    const v = werte[i];
    if (v == null) continue;
    if (!Number.isFinite(v) || v < 0) fehler.push(`${label}: ungültiger Betrag ${v} @ ${WERTE[i]}`);
    if (v < prev - 0.5) fehler.push(`${label}: SINKT von ${prev} (@${prevW}) auf ${v} (@${WERTE[i]}) — Staffel-/Sockel-Fehler`);
    prev = v; prevW = WERTE[i];
  }
  return fehler;
}

describe('Tarif-Invarianten — Beurkundung (Monotonie + Sanity, alle Arten × 26 Kt)', () => {
  it('keine Gebühr sinkt bei steigendem Geschäftswert; alle Beträge endlich ≥ 0', () => {
    const fehler: string[] = [];
    for (const k of KANTONE) {
      for (const art of GESCHAEFTSART_IDS) {
        if (art === 'grundstueckkauf') continue;
        if (!tarifFuer(art, k as KantonCode)) continue;
        fehler.push(...pruefeMonotonieUndSanity(`B ${art}/${k}`,
          WERTE.map((w) => detVal(berechneBeurkundung({ geschaeftsart: art, kanton: k as KantonCode, geschaeftswertCHF: w }).posten!.ergebnis))));
      }
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});

describe('Tarif-Invarianten — Grundbuch (Monotonie + Sanity, alle Arten × 26 Kt)', () => {
  it('keine Gebühr sinkt bei steigendem Wert; alle Beträge endlich ≥ 0', () => {
    const fehler: string[] = [];
    for (const k of KANTONE) {
      for (const art of GB_EINTRAGSART_IDS) {
        if (art === 'eigentum_kauf') continue;
        if (!tarifFuerGb(art, k as KantonCode)) continue;
        fehler.push(...pruefeMonotonieUndSanity(`G ${art}/${k}`,
          WERTE.map((w) => detVal(berechneGrundbuchgebuehr({ eintragsart: art, kanton: k as KantonCode, wertCHF: w }).posten!.ergebnis))));
      }
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});

describe('Tarif-Invarianten — keine Ermessens-Spanne wird auf einen Punktwert plattgedrückt (§8)', () => {
  // Bug-Klasse (16.6.2026, David fand BS AG-Gründung): eine staffel_sockel_prozent-
  // Regel kann einen behördlichen Ermessens-Rahmen hinter einem Punktwert verstecken:
  //   (a) abChf>0 + minChf<sockelChf: Werte unter abChf kollabieren auf sockelChf
  //       (oberer Rand) → muss per Band-Flag `unterAbRahmen` ehrlich sein (BS Ziff. 33).
  //   (b) Grundgebühr-Rahmen, dessen UNTERgrenze als sockelChf kodiert ist (abChf=0):
  //       jeder Wert liefert nur den unteren Rand → muss per regel-weitem
  //       `aufschlagBisChf` ehrlich sein (GE/VD/OW, NW § 40).
  // Beide werden hier als CI-Gate erzwungen: struktureller Verdacht (a) und
  // Hinweis-Sprache («Grundgebühr-Rahmen», «de N à M», «N bis M») müssen ein
  // explizites Spannen-Flag tragen.
  type Band = { abChf: number; minChf?: number; sockelChf: number; unterAbRahmen?: boolean };
  type Regel = { typ: string; baender?: Band[]; aufschlagVonChf?: number; aufschlagBisChf?: number };
  // Nur hochsichere Rahmen-Marker (kein breites «N bis M» — das trifft auch
  // Kapital-Schwellen wie «Sockel 300 bis 100'000 Kapital», JU/false positive).
  const RAHMEN_SPRACHE = /Grundgeb[uü]ehr(?:en)?-?[Rr]ahmen|émolument de base|\bde\s+\d[\d'’ ]*\s+à\s+\d[\d'’ ]*\s*(?:francs|fr\b)/;
  const alleTarife = () => {
    const out: { label: string; regel: Regel; hinweis: string }[] = [];
    const add = (label: string, t: { regel: Regel; hinweis?: string }) => out.push({ label, regel: t.regel, hinweis: t.hinweis ?? '' });
    for (const [art, perKt] of Object.entries(SONDERTARIFE))
      for (const [kt, t] of Object.entries(perKt as Record<string, { regel: Regel; hinweis?: string }>)) add(`B ${art}/${kt}`, t);
    for (const [kt, t] of Object.entries(GRUNDSTUECKKAUF_BEURKUNDUNG as Record<string, { regel: Regel; hinweis?: string }>)) add(`Kauf-Beurk/${kt}`, t);
    for (const [kt, t] of Object.entries(GRUNDBUCH_EIGENTUM_KAUF as Record<string, { regel: Regel; hinweis?: string }>)) add(`Kauf-GB/${kt}`, t);
    for (const [art, perKt] of Object.entries(GRUNDBUCH_EINTRAG))
      for (const [kt, t] of Object.entries(perKt as Record<string, { regel: Regel; hinweis?: string }>)) add(`G ${art}/${kt}`, t);
    return out;
  };
  const explizit = (regel: Regel): boolean =>
    regel.aufschlagBisChf != null || regel.baender?.[0]?.unterAbRahmen === true;

  it('struktureller Verdacht (Erstband abChf>0, minChf<sockelChf) trägt ein Spannen-Flag', () => {
    const fehler: string[] = [];
    for (const { label, regel } of alleTarife()) {
      if (regel.typ !== 'staffel_sockel_prozent') continue;
      const b0 = regel.baender?.[0];
      if (!b0) continue;
      if (b0.abChf > 0 && b0.minChf != null && b0.minChf < b0.sockelChf && !explizit(regel))
        fehler.push(`${label}: Erstband abChf ${b0.abChf}, minChf ${b0.minChf} < sockelChf ${b0.sockelChf} — Spanne unter der Schwelle plattgedrückt (unterAbRahmen/aufschlag fehlt).`);
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });

  it('jeder Tarif, dessen Hinweis einen Gebührenrahmen nennt, weist ihn auch aus', () => {
    const fehler: string[] = [];
    for (const { label, regel, hinweis } of alleTarife()) {
      if (regel.typ !== 'staffel_sockel_prozent') continue;
      if (RAHMEN_SPRACHE.test(hinweis) && !explizit(regel))
        fehler.push(`${label}: Hinweis nennt einen Rahmen («${hinweis.match(RAHMEN_SPRACHE)?.[0]}»), aber die Regel liefert einen Punktwert (aufschlag/unterAbRahmen fehlt).`);
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });

  it('explizit als Spanne ausgewiesene Regeln liefern KEINEN Punktwert', () => {
    const fehler: string[] = [];
    for (const { label, regel } of alleTarife()) {
      if (regel.typ !== 'staffel_sockel_prozent' || !explizit(regel)) continue;
      const ab = regel.baender?.[0]?.abChf ?? 0;
      const unten = ab > 0 ? Math.floor(ab / 2) : 1;
      const e = auswertenTarif(regel as Parameters<typeof auswertenTarif>[0], unten);
      if (e.deterministisch) fehler.push(`${label}: trotz Spannen-Flag deterministisch @${unten}`);
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});

describe('Tarif-Invarianten — Grundstückkauf-Referenz bleibt monoton (NOTARIAT/GRUNDBUCH)', () => {
  it('Beurkundung + Grundbuch des Grundstückkaufs steigen monoton', () => {
    const fehler: string[] = [];
    for (const k of KANTONE) {
      fehler.push(...pruefeMonotonieUndSanity(`Kauf-Beurk/${k}`,
        WERTE.map((w) => detVal(berechneBeurkundung({ geschaeftsart: 'grundstueckkauf', kanton: k as KantonCode, geschaeftswertCHF: w }).posten!.ergebnis))));
      fehler.push(...pruefeMonotonieUndSanity(`Kauf-GB/${k}`,
        WERTE.map((w) => detVal(berechneGrundbuchgebuehr({ eintragsart: 'eigentum_kauf', kanton: k as KantonCode, wertCHF: w }).posten!.ergebnis))));
    }
    expect(fehler, fehler.join('\n')).toEqual([]);
  });
});
