// ─── Zentrales SR-Nummern- und Fedlex-Link-Register ───────────────────────
//
// Einzige Quelle für SR-Nummern und Fedlex-ELI-Pfade. Nicht pro Rechner
// streuen. Nur Erlasse aufnehmen, deren SR-Nummer und ELI-Pfad gesichert
// sind – nichts erfinden oder «anreichern».

export type ErlassInfo = {
  sr: string;   // SR-Nummer (Systematische Rechtssammlung)
  eli: string;  // Fedlex-ELI-Pfad der konsolidierten Fassung
};

export const ERLASSE: Record<string, ErlassInfo> = {
  ZPO:   { sr: '272',     eli: 'eli/cc/2010/262' },
  OR:    { sr: '220',     eli: 'eli/cc/27/317_321_377' },
  ZGB:   { sr: '210',     eli: 'eli/cc/24/233_245_233' },
  SchKG: { sr: '281.1',   eli: 'eli/cc/11/529_488_529' },
  BGG:   { sr: '173.110', eli: 'eli/cc/2006/218' },
};

const KUERZEL = /\b(ZPO|SchKG|ZGB|BGG|OR)\b/;
// Bug-Check 10.6.2026 (NIEDRIG): lat. Suffix mit erfassen — «Art. 334bis OR»
// ergäbe sonst den FALSCHEN Anker #art_334_b statt #art_334_bis.
const ARTIKEL = /Art\.\s*(\d+)([a-z])?(bis|ter|quater|quinquies)?/i;

export type NormLink = {
  url: string;       // klickbarer Fedlex-Link inkl. Artikel-Anker
  sr: string;        // korrekte SR-Nummer des Erlasses
  erlass: string;    // Kürzel (ZPO, OR, …)
};

/**
 * Leitet aus einem Normverweis-Text («Art. 142 Abs. 3 ZPO») den Fedlex-Link
 * mit Artikel-Anker und die SR-Nummer ab. Liefert null, wenn der Erlass nicht
 * im Register steht (dann wird im PDF bewusst KEIN Link gerendert).
 */
export function normLink(artikel: string): NormLink | null {
  // Schlusstitel-Artikel (z. B. «Art. 15 SchlT ZGB») haben auf Fedlex eigene
  // Anker – ein #art_15-Link zeigte fälschlich auf Art. 15 ZGB. Kein Link.
  if (/\bSchlT\b/.test(artikel)) return null;
  const k = artikel.match(KUERZEL);
  if (!k) return null;
  const erlass = k[1];
  const info = ERLASSE[erlass];
  if (!info) return null;
  const a = artikel.match(ARTIKEL);
  const anker = a ? `#art_${a[1]}${a[2] ? '_' + a[2].toLowerCase() : ''}${a[3] ? '_' + a[3].toLowerCase() : ''}` : '';
  return {
    url: `https://www.fedlex.admin.ch/${info.eli}/de${anker}`,
    sr: info.sr,
    erlass,
  };
}
