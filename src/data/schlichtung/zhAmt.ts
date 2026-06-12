// ─── ZH: Gemeinde → Friedensrichteramt (konkrete Adresse) ───────────────────
// Quelle: bibliothek/behoerden/schlichtungsbehoerden-zh-vollerfassung.md
// (vfzh.ch-Ämterverzeichnis, zweifach geprüft 5.6.2026); generiert via
// scripts/plz-generieren.ts. Stadt Zürich ist über die GEMEINDE nicht
// eindeutig (sechs Kreis-Ämter) — dafür liefert zuerichKreisAemter() die
// vollständige Liste; den massgeblichen Stadtkreis kennt nur der Nutzer.

import { strassenKandidaten } from '../plz/strassenKandidaten';

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

interface ZhDaten {
  gemeinden: Record<string, ZhAmt>;
  zuerichKreise: ZhKreisAmt[];
  /** Stadt Zürich: PLZ → [Stadtkreis, amtlicher Adressenanteil %][] aus den
   *  Gebäudeadressen der Stadt (zh-kreise-generieren.ts, 12.6.2026). */
  zuerichPlzKreise: Record<string, [string, number][]>;
}
let cache: ZhDaten | null = null;

async function lade(): Promise<ZhDaten> {
  if (!cache) cache = (await import('./zhFriedensrichter.json')).default as unknown as ZhDaten;
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

// ── Stadt Zürich: PLZ → Kreis-Amt (Kreis-Automatik, 12.6.2026) ──────────────
// Verifikationsauftrag David 11.6.2026: Stadt-PLZ sind NICHT kreisscharf
// (16 von 30 Stadt-PLZ überlappen mehrere Kreise) — dank der Ämter-Paarung
// (1+2 · 3+9 · 4+5 · 6+10 · 7+8 · 11+12) sind viele PLZ trotzdem
// AMTS-eindeutig. Der amtliche Adressenanteil reist mit (analog
// plzVerzeichnis.json): die UI löst eindeutige PLZ automatisch auf und
// grenzt mehrdeutige auf die in Frage kommenden Ämter ein. Keine Heuristik
// (§2): vollständige Auszählung der realen amtlichen Gebäudeadressen.

export interface ZhKreisAmtTreffer extends ZhKreisAmt {
  /** Anteil der realen Gebäudeadressen der PLZ in den Kreisen dieses Amts
   *  in Prozent (amtliche Vermessung Stadt Zürich, 1 Dezimale). */
  anteilProzent: number;
}

/** Kreisnummern eines Kreis-Amts («Kreise 1 + 2» → ['1', '2']) — feste
 *  Abbildung aus dem Datenbestand, kein Fuzzy-Matching. */
function amtKreise(a: ZhKreisAmt): string[] {
  return a.kreise.replace(/^Kreise\s+/, '').split('+').map((k) => k.trim());
}

/** Kreis-Ämter, in deren Kreisen reale Gebäudeadressen der PLZ liegen —
 *  grösster Adressenanteil zuerst; null bei PLZ ohne Stadt-Zürich-Adressen
 *  (dann gilt die volle Sechser-Wahl). Genau ein Treffer = amts-eindeutige
 *  PLZ (Auto-Auflösung). */
// ── Stadt Zürich: Strasse (+ Hausnummer) → Kreis-Amt (Stufe 1, 12.6.2026) ──
// Adress-Ausbau (Entscheid David): strassen-genaue Auflösung OHNE externen
// Request. Eigener Lazy-Chunk zhStrassen.json (Generator
// zh-strassen-generieren.ts; 1'984 Strassen, 58 amts-übergreifend mit
// Hausnummern-Tabelle). Kein Fuzzy-Matching (§2): exakter Name,
// case-insensitiver Zweitindex und die feste «…str.»→«…strasse»-Abbildung;
// kein Treffer → null (die UI fällt auf PLZ-Automatik/Amts-Wahl zurück).

interface ZhStrassenDaten {
  strassen: Record<string, string[]>;
  nummern: Record<string, Record<string, string>>;
}
let strassenCache: ZhStrassenDaten | null = null;
let strassenKlein: Map<string, string> | null = null;

async function ladeStrassen(): Promise<ZhStrassenDaten> {
  if (!strassenCache) strassenCache = (await import('./zhStrassen.json')).default as unknown as ZhStrassenDaten;
  return strassenCache;
}

export type ZuerichStrassenErgebnis =
  | { typ: 'amt'; amt: ZhKreisAmt; kreise: string[] }
  | { typ: 'nummer_noetig'; strasse: string; kreise: string[] };

/** Kreis-Amt für eine Stadt-Zürcher Strasse; bei amts-übergreifenden
 *  Strassen entscheidet die Hausnummer (amtliche Einzeladresse). null =
 *  Strasse nicht im amtlichen Bestand (Tippfehler/auswärts). */
export async function zuerichAmtFuerStrasse(strasse: string, hausnummer = ''): Promise<ZuerichStrassenErgebnis | null> {
  const [d, daten] = await Promise.all([lade(), ladeStrassen()]);
  let name: string | null = null;
  for (const k of strassenKandidaten(strasse)) {
    if (daten.strassen[k]) { name = k; break; }
  }
  if (name === null) {
    if (!strassenKlein) strassenKlein = new Map(Object.keys(daten.strassen).map((s) => [s.toLowerCase(), s]));
    for (const k of strassenKandidaten(strasse)) {
      const t = strassenKlein.get(k.toLowerCase());
      if (t) { name = t; break; }
    }
  }
  if (name === null) return null;
  const kreise = daten.strassen[name];
  const amtFuerKreis = (kreis: string): ZhKreisAmt | null =>
    d.zuerichKreise.find((a) => amtKreise(a).includes(kreis)) ?? null;
  const aemter = new Set(kreise.map((k) => amtFuerKreis(k)?.kreise));
  if (aemter.size === 1) {
    const amt = amtFuerKreis(kreise[0]);
    return amt ? { typ: 'amt', amt, kreise } : null;
  }
  // amts-übergreifende Strasse: Hausnummer entscheidet (Vergleich
  // case-insensitiv wegen Buchstaben-Suffixen «12a»; feste Abbildung).
  const nrRoh = hausnummer.trim().replace(/\s+/g, '');
  if (nrRoh !== '') {
    const tabelle = daten.nummern[name] ?? {};
    const kreis = tabelle[nrRoh]
      ?? Object.entries(tabelle).find(([nr]) => nr.toLowerCase() === nrRoh.toLowerCase())?.[1];
    if (kreis) {
      const amt = amtFuerKreis(kreis);
      return amt ? { typ: 'amt', amt, kreise: [kreis] } : null;
    }
  }
  return { typ: 'nummer_noetig', strasse: name, kreise };
}

export async function zuerichAemterFuerPlz(plz: string): Promise<ZhKreisAmtTreffer[] | null> {
  const d = await lade();
  const kreise = d.zuerichPlzKreise[plz.trim()];
  if (!kreise || kreise.length === 0) return null;
  const treffer: ZhKreisAmtTreffer[] = [];
  for (const amt of d.zuerichKreise) {
    const eigene = amtKreise(amt);
    const eigeneTreffer = kreise.filter(([k]) => eigene.includes(k));
    // Aufnahme PRÄSENZ-basiert, nicht anteil-basiert: Kleinst-Anteile sind
    // in der Quelle auf 0.0 gerundet (8032: 1 von 3392 Adressen im Kreis 8)
    // — ein realer Treffer darf nicht an der Rundung verschwinden.
    if (eigeneTreffer.length === 0) continue;
    const anteil = eigeneTreffer.reduce((s, [, a]) => s + a, 0);
    treffer.push({ ...amt, anteilProzent: Math.round(anteil * 10) / 10 });
  }
  if (treffer.length === 0) return null;
  return treffer.sort((a, b) => b.anteilProzent - a.anteilProzent || a.kreise.localeCompare(b.kreise, 'de'));
}
