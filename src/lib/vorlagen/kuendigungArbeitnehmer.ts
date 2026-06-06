import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { formatDatum } from '../datumsUtils';
import { berechneKuendigungsfrist, type KuendigungsfristResultat } from '../kuendigungsfrist';
import {
  type KdgBasisAntworten, KDG_BASIS_DEFAULTS, kdgBasisAbgeleitet,
  kdgAbsender, kdgAdressat, kdgDatumzeile, kdgBetreff, kdgSchluss, kdgUnterschrift,
} from './kuendigungGemeinsam';

// ─── Maske 1a: Kündigung Arbeitsverhältnis durch ARBEITNEHMER:in (free) ─────
//
// Bauspezifikation: bibliothek/recherche/kuendigungs-masken.md (6.6.2026).
// Beendigungsdatum kommt aus der LIVE-Engine berechneKuendigungsfrist
// (lib/kuendigungsfrist.ts) – hier wird KEINE Frist neu gerechnet (§3/§5).
// Sperrfristen (Art. 336c OR) gelten für Arbeitnehmer-Kündigungen NICHT
// (so in sperrfristen.ts, C7) – darum kein Sperr-Pfad, keine Blocker.

export type KanProbezeit = 'keine' | 'gesetzlich' | 'vereinbart';

export type KanAntworten = KdgBasisAntworten & {
  vertragsbeginn: string;                // ISO
  zugangKuendigung: string;              // ISO (erwarteter Zugang – Stichtag)
  probezeit: KanProbezeit;
  probezeitMonate: number;               // 1–3 (nur bei 'vereinbart')
  fristQuelle: 'gesetzlich' | 'abweichend';
  abweichendeFristMonate: number;        // ≥ 1 (nur bei 'abweichend')
  abweichendeFristFormGueltig: boolean;  // Schriftform/GAV bestätigt (Art. 335c Abs. 2)
  kuendigungsterminMonatsende: boolean;
  zeugnisVerlangen: boolean;
  schlussabrechnungVerlangen: boolean;
};

export const KAN_DEFAULTS: KanAntworten = {
  ...KDG_BASIS_DEFAULTS,
  vertragsbeginn: '', zugangKuendigung: '',
  probezeit: 'keine', probezeitMonate: 1,
  fristQuelle: 'gesetzlich', abweichendeFristMonate: 3, abweichendeFristFormGueltig: false,
  kuendigungsterminMonatsende: true,
  zeugnisVerlangen: true, schlussabrechnungVerlangen: true,
};

// ── Gates: keine harten Blocker (Spez. 1a/d) – nur Hinweise ────────────────

export type KanGateErgebnis = { blocker: string[]; warnungen: string[]; hinweise: string[] };

export function pruefeKanGates(a: KanAntworten, engine: KuendigungsfristResultat | null): KanGateErgebnis {
  const hinweise: string[] = [
    'Sieht der Arbeitsvertrag für die Kündigung Schriftform vor, ist sie Gültigkeitsvoraussetzung – dieses Schreiben unterschreiben und nachweisbar zustellen.',
    'Freistellung oder Ferienbezug während der Kündigungsfrist nicht selbst verfügen – das ist Sache der Arbeitgeberin/des Arbeitgebers.',
  ];
  const warnungen: string[] = engine ? [...engine.ergebnis.warnungen] : [];
  if (a.fristQuelle === 'abweichend' && !a.abweichendeFristFormGueltig) {
    // Die Engine warnt inhaltlich gleich; hier nur, solange sie mangels Daten
    // noch nicht rechnet.
    if (!engine) warnungen.push('Abweichende Frist ohne bestätigte Schriftform/GAV ist unwirksam (Art. 335c Abs. 2 OR) – es würde die gesetzliche Frist gelten.');
  }
  return { blocker: [], warnungen, hinweise };
}

// ── Engine-Adapter (M9): reine Feld-Umbenennung, keine Rechenregel ──────────

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function kanEngine(a: KanAntworten): KuendigungsfristResultat | null {
  if (!ISO.test(a.vertragsbeginn) || !ISO.test(a.zugangKuendigung)) return null;
  return berechneKuendigungsfrist({
    vertragsbeginn: a.vertragsbeginn,
    zugangKuendigung: a.zugangKuendigung,
    kuendigendePartei: 'arbeitnehmer',
    probezeitMonate: a.probezeit === 'keine' ? 0 : a.probezeit === 'gesetzlich' ? 1 : Math.min(Math.max(a.probezeitMonate, 1), 3),
    abweichendeFristMonate: a.fristQuelle === 'abweichend' ? a.abweichendeFristMonate : undefined,
    abweichendeFristFormGueltig: a.fristQuelle === 'abweichend' ? a.abweichendeFristFormGueltig : undefined,
    kuendigungsterminMonatsende: a.kuendigungsterminMonatsende,
  });
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const KAN_SCHEMA: VorlageSchema = {
  id: 'kuendigung-arbeitnehmer',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  version: '1.0.0 (Rechtsstand OR Art. 335 ff.; Masken-Spezifikation 6.6.2026)',
  titel: 'Kündigung des Arbeitsverhältnisses',
  disclaimer:
    'Erstellt mit LexMetrik. Keine Rechtsberatung. Die Kündigung des Arbeitsverhältnisses ist '
    + 'formfrei gültig (vorbehältlich vertraglicher Schriftform); massgebend ist der Zugang beim '
    + 'Empfänger. Das Beendigungsdatum beruht auf den eingegebenen Daten (Art. 335a–c OR).',
  bausteine: [
    kdgAbsender('K1_absender'),
    kdgAdressat('K1_adressat'),
    kdgDatumzeile('K1_datumzeile'),
    kdgBetreff('K1_betreff', 'Kündigung des Arbeitsverhältnisses'),
    { id: 'K1_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren',
      begruendung: 'Anrede – immer enthalten.' },
    { id: 'K1_erklaerung',
      text: 'Hiermit kündige ich das Arbeitsverhältnis ordentlich und fristgerecht per {{beendigungFmt}}.',
      norm: 'Art. 335 Abs. 1 OR',
      begruendung: 'Kündigungserklärung mit Beendigungsdatum aus der Fristen-Engine (Art. 335a–c OR).' },
    { id: 'K1_probezeit',
      text: '(Die Kündigung erfolgt während der Probezeit; es gilt die siebentägige Frist nach Art. 335b OR.)',
      includeIf: { feld: 'istProbezeit', eq: true },
      norm: 'Art. 335b OR',
      begruendung: 'Zugang liegt in der Probezeit (Engine-Befund) – Klarstellung der 7-Tage-Frist.' },
    { id: 'K1_zeugnis',
      text: 'Ich bitte um Ausstellung eines qualifizierten Arbeitszeugnisses.',
      includeIf: { feld: 'zeugnisVerlangen', eq: true },
      norm: 'Art. 330a OR',
      begruendung: 'Zeugnisbitte gewählt (Anspruch nach Art. 330a OR).' },
    { id: 'K1_abrechnung',
      text: 'Bitte stellen Sie mir die Schlussabrechnung (Lohn, anteiliger 13. Monatslohn, Feriensaldo, Überstunden) bis zum Austritt zu.',
      includeIf: { feld: 'schlussabrechnungVerlangen', eq: true },
      begruendung: 'Bitte um Schlussabrechnung gewählt.' },
    { id: 'K1_dank',
      text: 'Ich danke für die Zusammenarbeit und bitte um eine kurze schriftliche Bestätigung dieser Kündigung.',
      begruendung: 'Bestätigungsbitte (Zugangs-/Beweissicherung) – immer enthalten.' },
    kdgSchluss('K1_schluss'),
    kdgUnterschrift('K1_unterschrift'),
  ],
};

// ── Zusammenstellung (Schema + Engine-Ergebnis → Dokument) ──────────────────

export function kanZusammenstellen(a: KanAntworten) {
  const engine = kanEngine(a);
  const antworten: Antworten = {
    ...a,
    ...kdgBasisAbgeleitet(a),
    beendigungFmt: engine?.beendigungsdatum ? formatDatum(engine.beendigungsdatum) : '',
    istProbezeit: engine?.istProbezeit ?? false,
  };
  return { ergebnis: assemble(KAN_SCHEMA, antworten), engine };
}
