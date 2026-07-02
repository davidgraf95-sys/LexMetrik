// scripts/datenhaltung/normalisiere-zitat.ts
// QS-DATA §3.1: die EINE Match-Key-Kanonisierung. Rein, deterministisch, DB-frei (CLAUDE.md §2:
// gleiche Eingabe → gleiche Ausgabe, kein I/O, keine Heuristik).
//
// Schreib-Seite (Adapter/Bulk-Import) und Match-Seite (Resolve-Pass E4) importieren dieselbe
// Funktion — sonst divergieren Idempotenz-Anker und der Rohstring-UNIQUE reisst (§3.2). In E0+ ist
// das Modul nur GEBAUT + unit-getestet; die Kanten-Tabellen sind bis E3/E4 leer, es gibt noch
// keine Laufzeit-Verdrahtung. Konsistent zur bestehenden ECLI-/BGE-Konvention
// (src/lib/rechtsprechung/ecli.ts: Abteilung römisch I–VI + historische «Ia/Va»).

/** Grundreiniger: NFC, Kleinschreibung, Whitespace kollabiert, Rand getrimmt. */
export function grundreinigung(roh: string): string {
  return roh.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
}

// BGE-Fundstelle: optionaler «BGE/ATF/DTF»-Präfix, Band, römische Abteilung (I–VI + hist. a/b),
// Seite; ein optionaler Erwägungs-/Rest-Schwanz («E. 1.2») wird ignoriert.
const BGE = /^(?:bge|atf|dtf)?\s*(\d{1,3})\s+([ivx]{1,4}[ab]?)\s+(\d{1,4})(?:\s+\S.*)?$/;

/**
 * BGE-Referenz → Match-Key: 'BGE 150 III 423' → '150-III-423'.
 * Sprach-/Präfix-neutral (BGE = ATF = DTF), Abteilung gross, Trenner stabil '-'.
 * Gibt null zurück, wenn der String keine BGE-Fundstelle ist.
 */
export function bgeMatchKey(roh: string): string | null {
  const m = BGE.exec(grundreinigung(roh));
  if (!m) return null;
  return `${m[1]}-${m[2].toUpperCase()}-${m[3]}`;
}

/**
 * ECLI → Match-Key: kleingeschrieben, Whitespace entfernt, sonst unverändert (ID-Zeichensatz
 * a-z 0-9 . _ - laut Spec). 'ECLI:CH:BGER:2025:5A_1100.2025' → 'ecli:ch:bger:2025:5a_1100.2025'.
 * Idempotent. Gibt null zurück, wenn der String kein ECLI ist.
 */
export function ecliMatchKey(roh: string): string | null {
  const s = roh.normalize('NFC').toLowerCase().replace(/\s+/g, '');
  return s.startsWith('ecli:') ? s : null;
}

// Latinische Ordinal-Suffixe (bis…decies) — die eine reale «bis/ter»-Variante der Norm-Zitate.
const ORDINAL = 'bis|ter|quater|quinquies|sexies|septies|octies|novies|decies';

/**
 * Generischer Norm-/Zitat-Match-Key: Whitespace/Interpunktion normalisiert, latinische
 * Ordinal-Suffixe an die Zahl angeschlossen ('Art. 52 bis OR' → 'art. 52bis or'), Rand-
 * Interpunktion entfernt. Basis für `norm_referenzen.zitat_key` (§3.2). Deterministisch;
 * Schreib- und Match-Seite müssen exakt diese Funktion teilen.
 */
export function normalisiereZitat(roh: string): string {
  return grundreinigung(roh)
    .replace(new RegExp(`(\\d)\\s+(${ORDINAL})\\b`, 'g'), '$1$2')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/[.,;:]+$/, '')
    .trim();
}
