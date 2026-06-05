// ─── ZH: Gemeinde → Friedensrichteramt (konkrete Adresse) ───────────────────
// Quelle: bibliothek/behoerden/schlichtungsbehoerden-zh-vollerfassung.md
// (vfzh.ch-Ämterverzeichnis, zweifach geprüft 5.6.2026); generiert via
// scripts/plz-generieren.ts. Stadt Zürich ist über die GEMEINDE nicht
// eindeutig (sechs Kreis-Ämter) — dafür liefert zuerichKreisAemter() die
// vollständige Liste; den massgeblichen Stadtkreis kennt nur der Nutzer.

export interface ZhAmt { name: string; strasse: string; plzOrt: string }
export interface ZhKreisAmt extends ZhAmt { kreise: string }

interface ZhDaten { gemeinden: Record<string, ZhAmt>; zuerichKreise: ZhKreisAmt[] }
let cache: ZhDaten | null = null;

async function lade(): Promise<ZhDaten> {
  if (!cache) cache = (await import('./zhFriedensrichter.json')).default as ZhDaten;
  return cache;
}

/** Friedensrichteramt für eine ZH-Gemeinde (amtliche Schreibweise, z. B.
 *  «Wald (ZH)»); null bei Stadt Zürich (Kreis massgeblich) und Unbekanntem. */
export async function zhFriedensrichterFuer(gemeinde: string): Promise<ZhAmt | null> {
  const d = await lade();
  const k = gemeinde.trim();
  return d.gemeinden[k] ?? d.gemeinden[`${k} (ZH)`] ?? null;
}

export async function zuerichKreisAemter(): Promise<ZhKreisAmt[]> {
  return (await lade()).zuerichKreise;
}
