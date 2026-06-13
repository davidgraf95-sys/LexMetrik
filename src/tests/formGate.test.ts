import { describe, it, expect } from 'vitest';
import { ALLE_KARTEN, type VorlageCard, type FormGate } from '../lib/startseiteConfig';
import type { AusgabeArt, VorlageSchema } from '../lib/vorlagen/engine';

// FAHRPLAN-VORLAGEN-AUSBAU V1: Das Karten-Feld `formGate` ist nur ein
// ANZEIGE-SPIEGEL — SSoT der Formfolge bleibt das Schema-`ausgabeArt`
// (§5). Dieser Test erzwingt die Übereinstimmung mechanisch: driftet ein
// Schema (z. B. Beurkundungs-Entscheid), bricht er, bis die Karte folgt.

import { AV_SCHEMA } from '../lib/vorlagen/arbeitsvertrag';
import { MV_SCHEMA } from '../lib/vorlagen/mietvertrag';
import { PV_SCHEMA } from '../lib/vorlagen/patientenverfuegung';
import { SG_SCHEMA } from '../lib/vorlagen/schlichtungsgesuchBs';
import { TESTAMENT_SCHEMA } from '../lib/vorlagen/testament';
import { VA_SCHEMA } from '../lib/vorlagen/vorsorgeauftrag';
import { VOLLMACHT_SCHEMA } from '../lib/vorlagen/vollmacht';
import { MA_SCHEMA } from '../lib/vorlagen/mahnung';
import { VV_SCHEMA } from '../lib/vorlagen/verjaehrungsverzicht';
import { FA_SCHEMA } from '../lib/vorlagen/forderungsabtretung';
import { AF_SCHEMA } from '../lib/vorlagen/auftrag';
import { FE_SCHEMA } from '../lib/vorlagen/fristerstreckung';
import { NB_SCHEMA } from '../lib/vorlagen/nichtbekanntgabe';
import { SK_SCHEMA } from '../lib/vorlagen/scheidungsklage';
import { SB_SCHEMA } from '../lib/vorlagen/scheidungsbegehren';
import { EG_SCHEMA } from '../lib/vorlagen/eheschutzgesuch';
import { KM_SCHEMA } from '../lib/vorlagen/kuendigungMieter';
import { KAG_SCHEMA } from '../lib/vorlagen/kuendigungArbeitgeber';
import { KAN_SCHEMA } from '../lib/vorlagen/kuendigungArbeitnehmer';
import { KV_SCHEMA as KVERTRAG_SCHEMA } from '../lib/vorlagen/kuendigungAllgemein';
import { KV_SCHEMA as KVEREINFACHT_SCHEMA } from '../lib/vorlagen/klageVereinfacht';
import { KO_SCHEMA } from '../lib/vorlagen/klageOrdentlich';
import { AG_ALLE_SCHEMAS } from '../lib/vorlagen/gruendungAgDokumente';
import { gmbhDokumentmappe, GMBH_DOK_DEFAULTS } from '../lib/vorlagen/gruendungGmbhDokumente';
import { keDokumentmappe, KE_DEFAULTS, type KeAntworten } from '../lib/vorlagen/kapitalerhoehung';

const vorlagen = Object.values(ALLE_KARTEN).filter(
  (k): k is VorlageCard => k.modus === 'vorlage');
const karte = (id: string) => {
  const v = vorlagen.find((x) => x.id === id);
  if (!v) throw new Error(`Karte fehlt: ${id}`);
  return v;
};

// Erwartetes Gate aus einer Schema-Menge: eine Art → diese; mehrere → gemischt.
const gateAus = (arten: AusgabeArt[]): FormGate => {
  const set = new Set<AusgabeArt>(arten);
  return set.size === 1 ? [...set][0] : 'gemischt';
};

// Einzel-Schema-Vorlagen: Karte ↔ Schema (ausgabeArt-Default ist 'fertig').
const EINZEL: [string, VorlageSchema][] = [
  ['arbeitsvertrag', AV_SCHEMA],
  ['mietvertrag-wohnen', MV_SCHEMA],
  ['patientenverfuegung', PV_SCHEMA],
  ['schlichtungsgesuch', SG_SCHEMA],
  ['eigenhaendiges-testament', TESTAMENT_SCHEMA],
  ['vorsorgeauftrag', VA_SCHEMA],
  ['vollmacht', VOLLMACHT_SCHEMA],
  ['mahnung', MA_SCHEMA],
  ['verjaehrungsverzicht', VV_SCHEMA],
  ['forderungsabtretung', FA_SCHEMA],
  ['auftrag', AF_SCHEMA],
  ['fristerstreckungsgesuch', FE_SCHEMA],
  ['nichtbekanntgabe-betreibung', NB_SCHEMA],
  ['scheidungsklage', SK_SCHEMA],
  ['scheidungsbegehren-gemeinsam', SB_SCHEMA],
  ['eheschutzgesuch', EG_SCHEMA],
  ['kuendigung-mieter', KM_SCHEMA],
  ['kuendigung-arbeitgeber', KAG_SCHEMA],
  ['kuendigung-arbeitnehmer', KAN_SCHEMA],
  ['kuendigung-vertrag', KVERTRAG_SCHEMA],
  ['klage-vereinfacht', KVEREINFACHT_SCHEMA],
  ['klage-ordentlich', KO_SCHEMA],
];

// Gültige Mappen-Antworten (Fixtures aus kapitalerhoehung.test.ts bzw.
// konventionen.test.ts — Maximal-Konfiguration, Gates blockerfrei).
const KE_AG: KeAntworten = {
  ...KE_DEFAULTS,
  rechtsform: 'ag', firma: 'Muster Holding AG', sitz: 'Zürich', kanton: 'ZH',
  bisherigesKapitalChf: "100'000", bisherigeAnzahl: '100', nennwertChf: "1'000",
  anzahlNeue: '50', ausgabebetragChf: "1'200", statutenArtikelNr: '3',
  gvDatum: '2026-06-01',
  zeichner: [
    { name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '30', bereitsBeteiligt: true },
    { name: 'Beat Beispiel', angaben: 'von Bern, in Bern', anzahl: '20', bereitsBeteiligt: true },
  ],
  bankName: 'Zürcher Kantonalbank', bankOrt: 'Zürich',
  berichtUnterzeichner: 'Anna Muster', vorsitzName: 'Anna Muster',
  ort: 'Zürich', datum: '2026-06-07',
};

describe('formGate (V1) — Karte spiegelt Schema-ausgabeArt', () => {
  it('jede GEBAUTE Vorlage mit Export trägt formGate; geplante keins', () => {
    vorlagen.forEach((v) => {
      if (v.status === 'geplant') {
        expect(v.formGate, `${v.id}: geplante Karte ohne formGate`).toBeUndefined();
      } else if (v.id === 'kuendigung-vermieter') {
        // Checkliste ohne Export (Art. 266l Abs. 2 OR: amtliches Formular) —
        // bewusst ohne Gate-Zeile.
        expect(v.formGate).toBeUndefined();
        expect(v.output).toBeUndefined();
      } else {
        expect(v.formGate, `${v.id}: gebaute Vorlage braucht formGate`).toBeDefined();
      }
    });
  });

  it('Einzel-Schema-Vorlagen: formGate === Schema-ausgabeArt', () => {
    EINZEL.forEach(([id, schema]) => {
      expect(karte(id).formGate, id).toBe(gateAus([schema.ausgabeArt ?? 'fertig']));
    });
  });

  it('AG-Gründung: Mappe mischt fertig + entwurf → gemischt', () => {
    const arten = AG_ALLE_SCHEMAS.map((s) => s.ausgabeArt ?? 'fertig');
    expect(gateAus(arten)).toBe('gemischt');
    expect(karte('ag-gruendung').formGate).toBe('gemischt');
  });

  it('Kapitalerhöhung: Mappen-Lauf (AG-Fixture) mischt fertig + entwurf → gemischt', () => {
    const { dokumente, gates } = keDokumentmappe(KE_AG);
    expect(gates.blocker).toEqual([]);
    expect(gateAus(dokumente.map((d) => d.ergebnis.dokument.ausgabeArt))).toBe('gemischt');
    expect(karte('kapitalerhoehung').formGate).toBe('gemischt');
  });

  it('GmbH-Gründung: Mappen-Lauf mischt fertig + entwurf → gemischt', () => {
    const { dokumente, gates } = gmbhDokumentmappe({
      einlageArt: 'bar', besondereVorteile: false, gfGewaehlt: true,
      mehrereGeschaeftsfuehrer: false, weitereVertretungsberechtigte: false,
      optingOut: false, eigeneBueros: true, immobilienHauptzweck: false,
      auslJurPersonGesellschafter: false, fremdwaehrung: false,
      bankInUrkundeGenannt: false, chWohnsitzVertretung: true,
      statutKlauseln: [], leistungenChf: undefined,
      ...GMBH_DOK_DEFAULTS,
      firma: 'Muster GmbH', sitz: 'Zürich', kanton: 'ZH', zweck: 'Treuhand',
      stammkapitalChf: "20'000", anzahlAnteile: '20', nennwertChf: "1'000",
      gruender: [{ name: 'A', angaben: 'von Basel, in Zürich', anzahl: '20' }],
      geschaeftsfuehrer: [
        { name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', vorsitz: true, zeichnungsArt: 'einzelunterschrift' },
      ],
      revisionsstelleName: 'R AG', revisionsstelleSitz: 'Zürich',
      ort: 'Zürich', datum: '2026-06-15',
    });
    expect(gates.blocker).toEqual([]);
    expect(gateAus(dokumente.map((d) => d.ergebnis.dokument.ausgabeArt))).toBe('gemischt');
    expect(karte('gmbh-gruendung').formGate).toBe('gemischt');
  });
});
