import type { Baustein } from './engine';
import { fmtDatumLang } from './datum';

// ─── Geteilte Module der Kündigungs-Familie (M1–M8) ─────────────────────────
//
// Bauspezifikation: bibliothek/recherche/kuendigungs-masken.md (6.6.2026,
// Abschnitt «Geteilte Module der Familie»). Diese Fragmente wiederholen sich
// in jeder Kündigungs-Maske und leben darum genau EINMAL (§5/§10). Sie liegen
// in der Schema-Schicht und enthalten KEINE Rechtsregeln (§3) – nur
// Brief-Anatomie (Absender/Adressat/Datum/Betreff/Schluss/Unterschrift) und
// die gemeinsamen Hinweis-Texte.

// ── Gemeinsame Antworten-Basis (M1–M3, M6) ──────────────────────────────────

export type KdgBasisAntworten = {
  absenderName: string;
  absenderAdresse: string;
  adressatName: string;
  adressatAdresse: string;
  ort: string;
  datum: string; // ISO (Erklärungsdatum)
};

export const KDG_BASIS_DEFAULTS: KdgBasisAntworten = {
  absenderName: '', absenderAdresse: '',
  adressatName: '', adressatAdresse: '',
  ort: '', datum: '',
};

/** Abgeleitete Felder der Brief-Anatomie (für …Zusammenstellen). */
export function kdgBasisAbgeleitet(a: KdgBasisAntworten): Record<string, string> {
  return {
    absenderBlock: [a.absenderName, a.absenderAdresse].filter(Boolean).join('\n'),
    adressatBlock: [a.adressatName, a.adressatAdresse].filter(Boolean).join('\n'),
    datumFmt: fmtDatumLang(a.datum),
  };
}

// ── Baustein-Fabriken M1–M4, M6–M7 (je Maske mit eigenem id-Präfix) ────────

export function kdgAbsender(id: string): Baustein {
  return {
    id, rolle: 'absender', text: '{{absenderBlock}}',
    begruendung: 'Absenderin/Absender der Kündigung – immer enthalten.',
  };
}

export function kdgAdressat(id: string): Baustein {
  return {
    id, rolle: 'adressat', text: '{{adressatBlock}}',
    begruendung: 'Empfängerin/Empfänger der Kündigung – immer enthalten.',
  };
}

export function kdgDatumzeile(id: string): Baustein {
  return {
    id, rolle: 'datumzeile', text: '{{ort}}, {{datumFmt}}',
    begruendung: 'Ort und Datum der Erklärung – immer enthalten.',
  };
}

export function kdgBetreff(id: string, text: string): Baustein {
  return {
    id, rolle: 'betreff', text,
    begruendung: 'Betreff des Kündigungsschreibens – immer enthalten.',
  };
}

export function kdgSchluss(id: string): Baustein {
  return {
    id, rolle: 'schlussformel', text: 'Freundliche Grüsse',
    begruendung: 'Schlussformel – immer enthalten.',
  };
}

/** Eine Unterschriftslinie (einseitige Kündigung; per Begründungs-Override
 *  auch für andere Eingaben nutzbar — Review-Befund 13.6.2026: das
 *  Bausteinprotokoll sprach in Gesuchen von der «kündigenden Partei»). */
export function kdgUnterschrift(
  id: string,
  nameFeld = 'absenderName',
  begruendung = 'Unterschrift der kündigenden Partei.',
): Baustein {
  return {
    id, rolle: 'unterschrift',
    text: `___________________________\n{{${nameFeld}}}`,
    begruendung,
  };
}

// ── M5: Zugangs-/Beweis-Hinweis (UI-Hinweis, KEIN Brieftext) ────────────────
// Wortlaut deckungsgleich mit der Annahme der Fristen-Engines (Zugangsprinzip;
// SSoT §5): die 7-Tage-Zustellfiktion der ZPO gilt im materiellen Recht NICHT.

export const KDG_ZUGANGS_HINWEIS =
  'Massgebend ist der ZUGANG beim Empfänger (Empfangstheorie), nicht das Absendedatum. '
  + 'Empfehlung: eingeschrieben UND A-Post (Beweis + zeitnaher Zugang). Bei eingeschriebener '
  + 'Sendung gilt der Zugang in der Regel mit der Abholung bzw. am Folgetag der '
  + 'Abholungseinladung – die zivilprozessuale 7-Tage-Zustellfiktion gilt im materiellen '
  + 'Recht nicht.';

// ── M8: gemeinsamer Ausgabe-Grundsatz ───────────────────────────────────────
// Alle Kündigungen der Familie sind unterschreibbare Endprodukte:
// ausgabeArt 'fertig', PDF immer, DOCX erlaubt (keine Eigenhändigkeits-/
// Beurkundungspflicht). Formvorschriften (z. B. Schriftform Art. 266l Abs. 1
// OR) sind ein FAKTUM (Brief unterschreiben) und werden je Maske als
// Banner/Hinweis offengelegt (§8).
