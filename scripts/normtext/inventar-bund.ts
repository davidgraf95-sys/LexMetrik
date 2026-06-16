/**
 * Inventar-Parser für fedlex-cache.sh
 *
 * Parst das EINTRAEGE-Array aus dem Shell-Skript-Text.
 * Format jeder Zeile: "name|eli|konsolidierung|html-N|anker1,anker2,…"
 * Kommentarzeilen (beginnend mit #) werden ignoriert.
 */

export interface FedlexCacheEintrag {
  name: string;
  eli: string;
  konsolidierung: string;
  htmlN: number;
  anker: string[];
}

/**
 * Parst die EINTRAEGE-Array-Zeilen aus dem Text eines fedlex-cache.sh-Skripts.
 *
 * @param shellQuelle - Volltext des Shell-Skripts
 * @returns Array der geparsten Einträge
 */
export function parseFedlexCacheEintraege(shellQuelle: string): FedlexCacheEintrag[] {
  // Extrahiere den Block zwischen EINTRAEGE=( und der schliessenden )
  const blockMatch = shellQuelle.match(/EINTRAEGE=\(([\s\S]*?)\n\)/);
  if (!blockMatch) return [];

  const block = blockMatch[1];
  const ergebnis: FedlexCacheEintrag[] = [];

  for (const zeile of block.split('\n')) {
    const bereinigt = zeile.trim();

    // Kommentarzeilen und Leerzeilen überspringen
    if (bereinigt.startsWith('#') || bereinigt.length === 0) continue;

    // Anführungszeichen entfernen und Inline-Kommentar abschneiden
    // Format: "name|eli|kons|n|anker,..." (mit optionalem # Kommentar nach dem String)
    const zeilenMatch = bereinigt.match(/^"([^"]+)"/);
    if (!zeilenMatch) continue;

    const inhalt = zeilenMatch[1];
    const teile = inhalt.split('|');
    if (teile.length < 5) continue;

    const [name, eli, konsolidierung, htmlNStr, ankerStr] = teile;
    const anker = ankerStr.split(',').map((a) => a.trim()).filter((a) => a.length > 0);

    ergebnis.push({
      name: name.trim(),
      eli: eli.trim(),
      konsolidierung: konsolidierung.trim(),
      htmlN: parseInt(htmlNStr.trim(), 10),
      anker,
    });
  }

  return ergebnis;
}
