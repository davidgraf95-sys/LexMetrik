// ─── ZH: Gemeinde → Friedensrichteramt (konkrete Adresse) ───────────────────
// Quelle: bibliothek/behoerden/schlichtungsbehoerden-zh-vollerfassung.md
// (vfzh.ch-Ämterverzeichnis, zweifach geprüft 5.6.2026); generiert via
// scripts/plz-generieren.ts. Stadt Zürich ist über die GEMEINDE nicht
// eindeutig (sechs Kreis-Ämter) — dafür liefert zuerichKreisAemter() die
// vollständige Liste; den massgeblichen Stadtkreis kennt nur der Nutzer.

export interface ZhAmt { name: string; strasse: string; plzOrt: string; url?: string }
export interface ZhKreisAmt extends ZhAmt { kreise: string }

/** Deterministische Namens-Kandidaten für den Gemeinde-Lookup (KEIN Fuzzy-
 *  Matching, §2): exakt · ohne/mit «(KT)»-Suffix · «St. »↔«St.»-Schreibweise
 *  (swisstopo vs. Dossier) · amtlicher Langname → Dossier-Kurzname («Thalheim
 *  an der Thur» → «Thalheim»). PLZ-Audit-Fix 6.6.2026: 21 PLZ (u. a. 9000
 *  St. Gallen, 8700 Küsnacht ZH) liefen wegen dieser Schreibweisen-Differenzen
 *  ins Leere, obwohl die Ämter erfasst sind. */
export function namensKandidaten(gemeinde: string, kanton: string): string[] {
  const out = new Set<string>();
  const roh = gemeinde.trim();
  // Apostroph-Normalisierung beidseitig (Bug-Check 11.6.2026: handgetipptes
  // «Château-d’Oex» mit U+2019 fand den ASCII-Schlüssel der BFS-/swisstopo-
  // Daten nicht; macOS setzt typografische Apostrophe automatisch). Feste
  // Abbildung U+2019↔U+0027, kein Fuzzy-Matching.
  for (const basis of new Set([roh, roh.replace(/’/g, "'"), roh.replace(/'/g, '’')])) {
    for (const v of [basis, basis.replace(/ \([A-Z]{2}\)$/, '')]) {
      for (const w of [v, v.replace(/\bSt\.\s+/g, 'St.'), v.replace(/\bSt\.(?=\S)/g, 'St. ')]) {
        out.add(w);
        out.add(`${w} (${kanton})`);
        const kurz = w.replace(/ (?:an der|an dem|am|bei|im) .+$/, '');
        if (kurz !== w) out.add(kurz);
      }
    }
  }
  return [...out];
}

interface ZhDaten { gemeinden: Record<string, ZhAmt>; zuerichKreise: ZhKreisAmt[] }
let cache: ZhDaten | null = null;

async function lade(): Promise<ZhDaten> {
  if (!cache) cache = (await import('./zhFriedensrichter.json')).default as ZhDaten;
  return cache;
}

/** Friedensrichteramt für eine ZH-Gemeinde (amtliche Schreibweise, z. B.
 *  «Wald (ZH)»); null bei Stadt Zürich (Kreis massgeblich) und Unbekanntem.
 *  Case-insensitiver Fallback (Bug-Check 5.6.2026) — kein Fuzzy-Matching. */
let zhKlein: Map<string, ZhAmt> | null = null;
export async function zhFriedensrichterFuer(gemeinde: string): Promise<ZhAmt | null> {
  const d = await lade();
  // PLZ-Audit-Fix 6.6.2026: gleiche Kandidaten-Normalisierung wie amtFuer —
  // vorher fehlte u. a. das ABSTREIFEN eines vorhandenen «(ZH)»-Suffixes.
  const kandidaten = namensKandidaten(gemeinde, 'ZH');
  for (const k of kandidaten) {
    const t = d.gemeinden[k];
    if (t) return t;
  }
  if (!zhKlein) zhKlein = new Map(Object.entries(d.gemeinden).map(([g, a]) => [g.toLowerCase(), a]));
  for (const k of kandidaten) {
    const t = zhKlein.get(k.toLowerCase());
    if (t) return t;
  }
  return null;
}

export async function zuerichKreisAemter(): Promise<ZhKreisAmt[]> {
  return (await lade()).zuerichKreise;
}
