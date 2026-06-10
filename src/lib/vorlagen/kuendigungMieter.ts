// Dossier: bibliothek/recherche/kuendigungs-masken.md
import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { berechneMietkuendigung } from '../mietrecht';
import type { MietErgebnis, Mietobjekt, TerminQuelle } from '../../types/mietrecht';
import type { Kanton } from '../../types/legal';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgAbsender, kdgAdressat, kdgDatumzeile, kdgSchluss,
} from './kuendigungGemeinsam';

// ─── Maske 2a: Kündigung MIETVERHÄLTNIS durch MIETER:in ─────────────────────
//
// Bauspezifikation: bibliothek/recherche/kuendigungs-masken.md (6.6.2026).
// Engine: berechneMietkuendigung (lib/mietrecht.ts, partei 'mieter') — sie
// prüft Form/Nichtigkeit (Art. 266l–266o OR) bereits intern; die Maske mappt
// nur Felder und übernimmt den Blocker (§3/§5). Kern-Sicherheitsregel:
// Familienwohnung OHNE Zustimmung des Ehegatten/der eingetragenen
// Partner:in = NICHTIG (Art. 266m/266o OR) → harter Export-Blocker.

export type KmAntworten = KdgBasisAntworten & {
  mitmieter: string[];                 // weitere Mieter:innen (unterschreiben mit)
  mietobjektAdresse: string;
  objekt: Mietobjekt;
  kanton: Kanton | '';
  mietbeginn: string;                  // ISO (für Auffangregel/266e)
  zugang: string;                      // ISO (erwarteter Zugang)
  terminQuelle: TerminQuelle;
  vertragsTermineMonate: number[];
  dezemberAusgeschlossen: boolean;
  vereinbarteFristMonate: number | null;
  familienwohnung: boolean;
  zustimmungEhegatte: boolean;
  ehegatteName: string;
  ausserterminlich: boolean;           // Art. 264 OR (Nachmieter-Pfad)
  nachmieterName: string;
  nachmieterZahlungsfaehig: boolean;
  uebernahmeGleicheBedingungen: boolean;
  rueckgabeWunschdatum: string;        // ISO, optional
};

export const KM_DEFAULTS: KmAntworten = {
  ...KDG_BASIS_DEFAULTS,
  mitmieter: [],
  mietobjektAdresse: '',
  objekt: 'wohnung',
  kanton: '',
  mietbeginn: '', zugang: '',
  terminQuelle: 'ortsueblich',
  vertragsTermineMonate: [],
  dezemberAusgeschlossen: false,
  vereinbarteFristMonate: null,
  familienwohnung: false, zustimmungEhegatte: false, ehegatteName: '',
  ausserterminlich: false, nachmieterName: '',
  nachmieterZahlungsfaehig: false, uebernahmeGleicheBedingungen: false,
  rueckgabeWunschdatum: '',
};

// ── Engine-Adapter (M9) ─────────────────────────────────────────────────────

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function kmEngine(a: KmAntworten): MietErgebnis | null {
  if (!ISO.test(a.zugang) || a.kanton === '') return null;
  if ((a.terminQuelle === 'gesetzlich' || a.objekt === 'moebliertes_zimmer') && !ISO.test(a.mietbeginn)) return null;
  if (a.terminQuelle === 'vertraglich_monate' && a.vertragsTermineMonate.length === 0) return null;
  try {
    return berechneMietkuendigung({
      kuendigungsart: 'ordentlich',
      objekt: a.objekt,
      zugang: a.zugang,
      kanton: a.kanton,
      partei: 'mieter',
      terminQuelle: a.terminQuelle,
      vertragsTermineMonate: a.terminQuelle === 'vertraglich_monate' ? a.vertragsTermineMonate : undefined,
      dezemberAusgeschlossen: a.dezemberAusgeschlossen || undefined,
      mietbeginn: ISO.test(a.mietbeginn) ? a.mietbeginn : undefined,
      vereinbarteFristMonate: a.vereinbarteFristMonate ?? undefined,
      familienwohnung: a.familienwohnung,
      zustimmungEhegatte: a.familienwohnung ? a.zustimmungEhegatte : undefined,
    });
  } catch {
    return null;
  }
}

// ── Gates (Spez. 2a/d) ──────────────────────────────────────────────────────

export type KmGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeKmGates(a: KmAntworten, engine: MietErgebnis | null): KmGateErgebnis {
  const blocker: string[] = [];
  const warnungen: string[] = [];
  const hinweise: string[] = [];

  // G-FAMILIENWOHNUNG (BLOCKER, Art. 266m/266o): Engine liefert 'nichtig'.
  if (engine?.status === 'nichtig') {
    blocker.push(
      'Die Kündigung wäre NICHTIG: Bei der Wohnung der Familie braucht die Mieter-Kündigung die '
      + 'AUSDRÜCKLICHE Zustimmung des Ehegatten bzw. der eingetragenen Partnerin/des eingetragenen '
      + 'Partners (Art. 266m i.V.m. Art. 266o OR) — Zustimmung einholen und mitunterzeichnen lassen.',
    );
  }
  if (engine) warnungen.push(...engine.warnungen);
  if (engine?.verfehlterTermin) {
    hinweise.push(
      `Der gewünschte Termin wäre verfehlt — die Kündigung ist deswegen nicht ungültig, sie wirkt auf den `
      + `nächstmöglichen Termin (${engine.endtermin}, Art. 266a Abs. 2 OR).`,
    );
  }
  if (['wohnung', 'geschaeftsraum'].includes(a.objekt)) {
    hinweise.push('Schriftform (Art. 266l Abs. 1 OR): den Brief eigenhändig unterschreiben — bei mehreren Mieter:innen unterschreiben ALLE.');
  }
  if (a.ausserterminlich) {
    hinweise.push(
      'Ausserterminliche Rückgabe (Art. 264 OR): Befreiung nur, wenn der vorgeschlagene Nachmieter für die '
      + 'Vermieterschaft zumutbar, zahlungsfähig und zur Übernahme zu GLEICHEN Bedingungen bereit ist — '
      + 'sonst bleibt der Mietzins bis zum nächsten ordentlichen Termin geschuldet (Abs. 2). Die Beurteilung '
      + 'liegt bei der Vermieterschaft.',
    );
    if (!a.nachmieterZahlungsfaehig || !a.uebernahmeGleicheBedingungen) {
      warnungen.push('Nachmieter-Voraussetzungen (zahlungsfähig · gleiche Bedingungen) sind nicht bestätigt — das Befreiungsrisiko trägt die kündigende Partei.');
    }
  }
  return { blocker, warnungen, hinweise };
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const KM_SCHEMA: VorlageSchema = {
  id: 'kuendigung-mieter',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Rechtsstand OR Art. 253 ff./266a–o; Masken-Spezifikation 6.6.2026)',
  titel: 'Kündigung des Mietverhältnisses',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Endtermin und Form-Prüfung beruhen auf den '
    + 'eingegebenen Daten (Art. 266a–o OR); massgebend ist der Zugang bei der Vermieterschaft. '
    + 'Ortsübliche Termine sind eine Tatfrage des konkreten Ortes.',
  bausteine: [
    kdgAbsender('M_absender'),
    kdgAdressat('M_adressat'),
    kdgDatumzeile('M_datumzeile'),
    { id: 'M_betreff', rolle: 'betreff',
      text: 'Kündigung des Mietverhältnisses — {{mietobjektAdresse}}',
      begruendung: 'Betreff mit Mietobjekt — immer enthalten.' },
    { id: 'M_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
      begruendung: 'Anrede — immer enthalten.' },
    { id: 'M_erklaerung',
      text: 'Hiermit kündige ich das Mietverhältnis über die oben genannte Mietsache ordentlich per {{endterminFmt}}.{{mitmieterSatz}}',
      // Offengelegte Spez.-Abweichung (Bug-Check B): Spez. nennt «266a/266c–e»;
      // hier bewusst nur der führende Termin-/Fristartikel — die objekt-
      // spezifische Frist (266b–f) liefert und protokolliert die Engine.
      norm: 'Art. 266a OR',
      begruendung: 'Kündigungserklärung; Endtermin aus der Mietrechts-Engine (Termin-Hierarchie Vertrag → Ortsgebrauch → Gesetz; objektspezifische Frist nach Art. 266b–f OR).' },
    { id: 'M_familienwohnung_zustimmung',
      text: 'Die Mietsache dient als Wohnung der Familie. Diese Kündigung wird mit der ausdrücklichen Zustimmung von {{ehegatteName}} (Ehegatte/eingetragene Partnerin bzw. eingetragener Partner) ausgesprochen (Art. 266m OR); sie/er unterzeichnet mit.',
      includeIf: { and: [{ feld: 'familienwohnung', eq: true }, { feld: 'zustimmungEhegatte', eq: true }] },
      norm: 'Art. 266m OR',
      begruendung: 'Familienwohnung: Zustimmung dokumentiert und Mitunterzeichnung angekündigt (Nichtigkeitsfolge des Art. 266o OR vermieden).' },
    { id: 'M_ausserterminlich_264',
      text: 'Ich gebe die Mietsache vorzeitig zurück und schlage als zumutbare:n, zahlungsfähige:n Nachmieter:in vor, die/der bereit ist, den Mietvertrag zu den gleichen Bedingungen zu übernehmen: {{nachmieterName}}. Mit deren/dessen Eintritt bin ich von meinen Verpflichtungen aus dem Mietverhältnis befreit (Art. 264 OR).',
      includeIf: { and: [{ feld: 'ausserterminlich', eq: true }, { feld: 'nachmieterName', nichtLeer: true }] },
      norm: 'Art. 264 OR',
      begruendung: 'Ausserterminliche Rückgabe mit Nachmieter-Vorschlag gewählt.',
      hinweis: 'Ob der Nachmieter zumutbar, zahlungsfähig und übernahmebereit ist, beurteilt die Vermieterschaft — das Befreiungsrisiko bleibt offengelegt.' },
    { id: 'M_uebergabe',
      text: 'Ich bitte um einen Termin für die Rückgabe der Mietsache und die gemeinsame Erstellung des Übergabeprotokolls{{rueckgabeWunschSatz}} sowie um die Abrechnung und Freigabe des Mietzinsdepots.',
      begruendung: 'Übergabe-/Depot-Bitte — immer enthalten (praktische Abwicklung).' },
    kdgSchluss('M_schluss'),
    { id: 'M_unterschrift', rolle: 'unterschrift',
      text: '___________________________\n{{absenderName}}{{mitmieterUnterschriftenZeile}}',
      begruendung: 'Unterschrift der kündigenden Mietpartei; weitere Mieter:innen unterschreiben mit.' },
    { id: 'M_unterschrift_ehegatte', rolle: 'unterschrift',
      text: '___________________________\n{{ehegatteName}} (Zustimmung nach Art. 266m OR)',
      includeIf: { and: [{ feld: 'familienwohnung', eq: true }, { feld: 'zustimmungEhegatte', eq: true }] },
      norm: 'Art. 266m OR',
      begruendung: 'Zweite Unterschriftslinie für die zustimmende Person (Familienwohnung).' },
  ],
};

// ── Zusammenstellung ────────────────────────────────────────────────────────

export function kmZusammenstellen(a: KmAntworten) {
  const engine = kmEngine(a);
  const nichtig = engine?.status === 'nichtig';
  const mitmieter = a.mitmieter.map((m) => m.trim()).filter(Boolean);
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    endterminFmt: !nichtig && engine?.endtermin ? engine.endtermin : '',
    mitmieterSatz: mitmieter.length > 0 ? ` Diese Kündigung erfolgt gemeinsam mit ${mitmieter.join(', ')}.` : '',
    // Bug-Check 10.6.2026 (HOCH): Zeile-Suffix → Fragment-Konvention der
    // Engine greift; vorher druckte der Standardfall ohne Mitmieter
    // «Name________» in die Unterschriftszeile.
    mitmieterUnterschriftenZeile: mitmieter.map((m) => `\n\n___________________________\n${m}`).join(''),
    rueckgabeWunschSatz: ISO.test(a.rueckgabeWunschdatum)
      ? `, gewünscht per ${a.rueckgabeWunschdatum.split('-').reverse().join('.')}`
      : '',
  };
  return { ergebnis: assemble(KM_SCHEMA, antworten), engine };
}
