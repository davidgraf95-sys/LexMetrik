// ─── Plausibilität eines Rubrum-Feldes (§1/§8: lieber leer als falsch) ────────
//
// Die best-effort-Extraktion aus dem Volltext (scripts/normtext/adapter-entscheide.ts)
// erzeugt vereinzelt Falsch-Positive: mitten im Satz abgeschnittene Erwägungs-/
// Sachverhalts-Fragmente, die als „Gegenstand"/„Parteien" gespeichert wurden
// (z.B. „d.h. die Frage, ob der Schuldner … (BGE 131 I 24 E. 2.2)"). Solche Werte
// sind im Reader sichtbar falsch und untergraben das Vertrauen (§8).
//
// Diese reine, deterministische Prüfung verwirft erkennbar fragmentarische Werte
// (FAIL-SAFE → Feld wird null → der Reader fällt auf die ehrliche Thema-Leitzeile
// zurück). EINE SSoT, genutzt von der Anzeige (kopf.ts), der Live-Extraktion und
// der Bestands-Reinigung — damit dieselbe Regel überall gilt (§5).

export type RubrumFeld = 'gegenstand' | 'parteien' | 'vorinstanz' | 'besetzung';

// Echte Rubrum-Einträge sind knapp; deutlich längere Werte sind fast immer
// fehlgeschnittener Fliesstext. (parteien darf am längsten sein: mehrere
// Parteien mit Vertretung.)
const MAX_LAENGE: Record<RubrumFeld, number> = {
  gegenstand: 160, parteien: 400, vorinstanz: 200, besetzung: 220,
};

// Marker, die in einem sauberen Rubrum-Eintrag nie vorkommen, in zitierenden
// Erwägungen/Sachverhalten aber typisch sind (Präjudiz-/Materialien-Verweise).
const ERWAEGUNGS_MARKER = /\bBGE\s+\d|\bBBl\b|\bE\.\s*\d|\bi\.V\.m\.|\bZiff\.\s*\d|\bErwägung/i;

/**
 * true ⇒ der Wert ist als Rubrum-Eintrag plausibel. Verworfen wird, was nach
 * abgeschnittenem Fliesstext aussieht: leer, zu lang, mit Kleinbuchstaben
 * beginnend (Satzmitte) oder mit Erwägungs-/Zitat-Markern.
 */
export function rubrumFeldPlausibel(label: RubrumFeld, wert: string | null | undefined): boolean {
  const t = (wert ?? '').trim();
  if (!t) return false;
  if (t.length > MAX_LAENGE[label]) return false;
  // Saubere Einträge beginnen mit Grossbuchstabe, Ziffer oder Parteimarke (A.);
  // ein Kleinbuchstabe am Anfang verrät ein mitten im Satz gekapptes Fragment.
  // Unicode-bewusst (\p{Ll}) → erfasst auch fr/it-Akzent-Kleinbuchstaben (é/è/à/ù/ì/ç/œ…).
  if (/^\p{Ll}/u.test(t)) return false;
  if (ERWAEGUNGS_MARKER.test(t)) return false;
  return true;
}
