import { expect } from 'vitest';
import {
  agDokumentmappe,
  AG_DOK_DEFAULTS,
  type AgDokAntworten,
} from '../lib/vorlagen/gruendungAgDokumente';

export const BASIS: AgDokAntworten = {
  einlageArt: 'bar',
  besondereVorteile: false,
  optingOut: true,
  eigeneBueros: true,
  immobilienHauptzweck: false,
  inhaberaktien: false,
  fremdwaehrung: false,
  bankInUrkundeGenannt: true,
  chWohnsitzVertretung: true,
  leistungenChf: undefined,
  ...AG_DOK_DEFAULTS,
  firma: 'Muster Immobilien AG',
  sitz: 'Zürich',
  kanton: 'ZH',
  zweck: 'den Erwerb und die Verwaltung von Beteiligungen',
  aktienkapitalChf: "100'000",
  anzahlAktien: '100',
  nennwertChf: "1'000",
  liberierungProzent: '100',
  gruender: [{ name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '100' }],
  verwaltungsraete: [{ name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'Musterweg 1, 8000 Zürich', praesident: true, zeichnungsArt: 'einzelunterschrift' }],
  bankName: 'Zürcher Kantonalbank',
  bankOrt: 'Zürich',
  rechtsdomizilAdresse: 'Musterweg 1, 8000 Zürich',
  ort: 'Zürich',
  datum: '2026-06-07',
};

export const text = (m: ReturnType<typeof agDokumentmappe>, id: string) => {
  const d = m.dokumente.find((x) => x.id === id || x.id.startsWith(id));
  expect(d, `Dokument ${id} fehlt (vorhanden: ${m.dokumente.map((x) => x.id).join(', ')})`).toBeDefined();
  return d!.ergebnis.dokument.absaetze.map((a) => `${a.ueberschrift ?? ''}\n${a.text}`).join('\n');
};
