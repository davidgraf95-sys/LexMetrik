// ─── Such-Vokabular: deterministische Query-Expansion (ROADMAP W9) ───────────
//
// Portiert aus OpenCaseLaw (mcp_server.py: LEGAL_QUERY_EXPANSIONS +
// LAW_SEARCH_EXPANSIONS) → src/data/such-vokabular.json. Zweck: einen getippten
// Suchbegriff um Synonyme/Doktrin-Varianten (DE/FR/IT) und umgangssprachlich→
// Normtext-Brücken ergänzen, damit z. B. «vaterschaftsurlaub» auch den
// Gesetzestext trifft, der «Urlaub … Geburt» sagt.
//
// §2: rein & deterministisch — kein LLM, keine Heuristik, kein Date.now(); nur
// ein statisches Wörterbuch-Lookup. Nicht load-bearing (reine Suche, kein
// Rechtswert), darum keine Gegenprüfung nötig.

import vokabular from '../../data/such-vokabular.json';

type Karte = Record<string, string[]>;

/** lowercase + Diakritika strippen (NFKD), damit «Kündigung»/«proprietà» auf
 *  die FTS-normalisierten OCL-Schlüssel treffen. Deterministisch. */
export function normalisiereBegriff(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

// Beide OCL-Karten beim Laden EINMAL zu einer normalisierten Lookup-Map
// verschmelzen (Werte unioniert, Reihenfolge stabil). Schlüssel UND Werte
// werden normalisiert, damit Lookup und Ausgabe konsistent sind.
const LOOKUP: Map<string, string[]> = (() => {
  const m = new Map<string, string[]>();
  const add = (karte: Karte) => {
    for (const [rohSchluessel, werte] of Object.entries(karte)) {
      const schluessel = normalisiereBegriff(rohSchluessel);
      if (!schluessel) continue;
      const bestehend = m.get(schluessel) ?? [];
      for (const w of werte) {
        const nw = normalisiereBegriff(w);
        if (nw && !bestehend.includes(nw)) bestehend.push(nw);
      }
      m.set(schluessel, bestehend);
    }
  };
  add((vokabular as { rechtsprechung: Karte }).rechtsprechung);
  add((vokabular as { gesetzestext: Karte }).gesetzestext);
  return m;
})();

/** Alle bekannten Vokabular-Begriffe (Schlüssel + Werte, normalisiert, dedupt) —
 *  Kandidaten-Fundus für den «Meinten Sie …?»-Vorschlag (UI-NAV S3). Rein. */
export function vokabularBegriffe(): string[] {
  const s = new Set<string>();
  for (const [k, werte] of LOOKUP) {
    s.add(k);
    for (const w of werte) s.add(w);
  }
  return [...s];
}

/**
 * Erweitert einen Suchbegriff um sein Vokabular. Gibt NUR die zusätzlichen
 * Begriffe zurück (ohne den Originalbegriff) — der Aufrufer sucht Original +
 * Erweiterungen. Ganzer (mehrwortiger) Begriff UND einzelne Tokens werden
 * nachgeschlagen (deckt Mehrwort-Schlüssel wie «conge parental» ab).
 * Deterministisch: gleiche Eingabe → gleiche Reihenfolge.
 */
export function expandiereSuchbegriff(q: string): string[] {
  const norm = normalisiereBegriff(q);
  if (!norm) return [];
  const kandidaten = norm.includes(' ') ? [norm, ...norm.split(/\s+/)] : [norm];
  const erweiterungen: string[] = [];
  for (const kand of kandidaten) {
    const werte = LOOKUP.get(kand);
    if (!werte) continue;
    for (const w of werte) {
      if (w !== norm && !erweiterungen.includes(w)) erweiterungen.push(w);
    }
  }
  return erweiterungen;
}
