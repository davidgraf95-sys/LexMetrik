// ─── Materialien-Typen: amtliche Ressourcen (Soft-Law) ──────────────────────
//
// Rubrik «Amtliche Ressourcen / Materialien»: Verwaltungsverordnungen und
// Behörden-Publikationen (ESTV-Kreisschreiben, EDÖB-Leitfäden, SECO-Wegleitungen
// …). Das sind KEINE Gesetze (kein Normtext, §7) und keine Gerichtsentscheide —
// sondern faktisch praxisleitendes «Soft-Law». Eigener Namespace, klont das
// Muster des Erlass-Registers (src/lib/normtext/register.ts), ohne es zu berühren.
//
// Reine Daten/Typen (§3): KEINE Rechtslogik, KEIN Normtext. Identität + Taxonomie
// werden DEKLARIERT (§2: keine Heuristik). Der Sach-Achsen-Typ `Rechtsgebiet`
// wird aus dem Erlass-Register importiert — dieselbe Achse trägt die Verzahnung
// Norm ↔ Material (§5, eine Sachgebiets-Taxonomie für die ganze App).

import type { Rechtsgebiet, Sprache } from '../normtext/register';

export type { Rechtsgebiet, Sprache };

// ── Status der In-App-Sicht ──────────────────────────────────────────────────
// 'nur-live-link' = nur Link zur amtlichen Quelle (kein gespeicherter Inhalt);
//                   die In-App-Detailseite zeigt ausschliesslich bibliografische
//                   Metadaten + prominenten Live-Link. KEIN Normtext, kein
//                   Extraktionsrisiko (§7/§8). P0-Default für alle Materialien.
// 'pdf-embed'     = amtliches PDF in-app eingebettet (public/materialien/pdf/KEY.pdf).
//                   Das Angezeigte IST die amtliche Fassung (kein Extrakt). Künftig.
// 'volltext'      = strukturierter Volltext-Snapshot (public/materialien/volltext/).
//                   Nur mit §7-Zitat-Ausnahme (Stand/Quelle/Live-Link/Drift). Künftig.
export type MaterialStatus = 'nur-live-link' | 'pdf-embed' | 'volltext';

// ── Behörde (Herausgeber) ────────────────────────────────────────────────────
export type BehoerdeId =
  | 'ESTV'   // Eidg. Steuerverwaltung
  | 'EDOEB'  // Eidg. Datenschutz- und Öffentlichkeitsbeauftragter
  | 'SECO'   // Staatssekretariat für Wirtschaft
  | 'BJ'     // Bundesamt für Justiz / Eidg. Amt für das Handelsregister (EHRA)
  | 'FINMA'  // Eidg. Finanzmarktaufsicht
  | 'BSV'    // Bundesamt für Sozialversicherungen
  | 'IGE';   // Eidg. Institut für Geistiges Eigentum

export interface Behoerde {
  id: BehoerdeId;
  /** Kürzel für die Anzeige ('ESTV'). */
  kuerzel: string;
  /** Voller Behördenname. */
  name: string;
  /** Sortiergewicht (Praxisrelevanz, niedriger = weiter oben). */
  rang: number;
}

// ── Dokumenttyp ──────────────────────────────────────────────────────────────
export type DoktypId =
  | 'kreisschreiben'
  | 'ks-anhang' // Beilage zu einem Kreisschreiben (Anhang/FAQ/Schema/Fragebogen) — M4/ESTV-KS
  | 'weisung' // alte ESTV-W-Serie (W95-002 …) — M4/ESTV-KS
  | 'rundschreiben'
  | 'mwst-info'
  | 'wegleitung'
  | 'merkblatt'
  | 'leitfaden'
  | 'checkliste'
  | 'richtlinie'
  | 'taetigkeitsbericht'
  | 'anleitung'
  | 'mitteilung';

export interface Doktyp {
  id: DoktypId;
  label: string;
}

// ── Register-Eintrag (SSoT: Identität + Taxonomie, reine Daten) ──────────────
export interface MaterialRegistereintrag {
  /** Stabiler Slug == Manifest-/URL-Schlüssel, z. B. 'ESTV-KS-5A'. URL-sicher
   *  (keine `/ \ # ?`, kein Leerzeichen) — Tor in materialien-register.test. */
  key: string;
  behoerde: BehoerdeId;
  doktyp: DoktypId;
  /** Volltitel des Dokuments. */
  titel: string;
  /** Amtliche Nummer/Signatur, falls vorhanden ('Nr. 5a', 'MWST-Info 09'). */
  nummer?: string;
  /** Sach-Achse (für Filter + Verzahnung Norm↔Material). */
  rechtsgebiet: Rechtsgebiet;
  /** Hauptsprache des Dokuments (DE/FR/IT; Mehrsprachigkeit im Hinweis). */
  sprache: Sprache;
  status: MaterialStatus;
  /** Amtliche Quelle-URL (Pflicht für alle Status, §7 c — sichtbarer Live-Link). */
  quelleUrl: string;
  /** Stand der aktuell publizierten Fassung (ISO YYYY-MM-DD). */
  stand: string;
  /** Sortiergewicht innerhalb (Behörde); niedriger = weiter oben. */
  rang: number;
  /** Verknüpfte Erlass-Keys (Bund) für die Norm↔Material-Brücke (werkzeuge.ts). */
  normKeys?: string[];
  /** Optionaler Ehrlichkeits-/Pflege-Hinweis (z. B. «Hash unbestätigt»). */
  hinweis?: string;
}

// ── Browse-Manifest-Schema (generiert → public/materialien/register.json) ────
// EIN Eintrag pro Material; Identität/Taxonomie aus dem Register, plus aufgelöste
// Anzeige-Labels (Behörde/Doktyp) und ein deterministischer sha über die
// Identitätsfelder (Provenienz, §2/§7). Lazy geladen, nie im Bundle (§3).
export interface BrowseMaterial {
  key: string;
  behoerde: BehoerdeId;
  behoerdeName: string;
  behoerdeKuerzel: string;
  doktyp: DoktypId;
  doktypLabel: string;
  titel: string;
  nummer: string | null;
  rechtsgebiet: Rechtsgebiet;
  sprache: Sprache;
  status: MaterialStatus;
  quelleUrl: string;
  stand: string;
  rang: number;
  normKeys: string[];
  hinweis: string | null;
  /** sha-256 über die Identitätsfelder (Drift-/Provenienz-Token). */
  sha: string;
}

export interface MaterialManifest {
  erzeugt: string;
  materialien: BrowseMaterial[];
}
