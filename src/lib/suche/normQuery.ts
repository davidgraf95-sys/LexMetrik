// ─── Norm-Query-Parser (Cmd/Ctrl-K, W2·5d G4 · FAHRPLAN-GESETZES-UX §4.2) ────
//
// Deterministischer Parser (§2 — kein LLM, keine Fuzzy-Heuristik), der eine
// Norm-Zitat-Eingabe («OR 257d», «Art. 5 AIG», «ZGB 684 II», «VMWG») auf einen
// direkten Deep-Link in den Leser auflöst. KEIN neuer Suchindex (K10): die
// Erlass-Auflösung läuft über die BESTEHENDE Registry (Browse-Manifest, das die
// Befehlspalette ohnehin lazy lädt). Die Artikel-Token-Ableitung ist kongruent
// zu passus.ts/fedlex.ts (Buchstaben-Artikel 257d → art-257_d, 49abis →
// art-49_a_bis). Reine Ableitung (§3) — keine Rechtslogik.
//
// Sicherheit gegen Fehl-Sprung (Akzeptanz §4.2): der Parser gibt NUR dann ein
// Ziel zurück, wenn ein Kürzel EINDEUTIG aufgelöst wird UND — sofern ein Artikel
// genannt ist — der Rest der Eingabe vollständig als Artikel-Designator (Art./§/
// Abs./lit./Ziff./röm.) parst. Freitext («Kündigung», «Mietzins 2024») liefert
// null → die Eingabe fällt in die normale Suche.

/** Minimal-Sicht eines Erlasses für die Auflösung (BrowseErlass ist zuweisbar). */
export interface NormErlass {
  key: string;
  ebene: 'bund' | 'kanton';
  kanton: string | null;
  kuerzel: string;
  titel: string;
  status: 'snapshot' | 'pdf-embed' | 'nur-live-link';
}

export interface NormQueryTreffer {
  erlass: NormErlass;
  /** Artikel-Anker-Token (z. B. «257_d») oder null für einen reinen Erlass-Sprung. */
  artikelToken: string | null;
  /** Anzeige-Form des Artikels («257d») — nur gesetzt, wenn artikelToken gesetzt ist. */
  artikelAnzeige: string | null;
  /** Fertiger Deep-Link inkl. #art-Anker (nur bei snapshot + Artikel). */
  href: string;
}

/** Vorgebauter Auflösungs-Index (in der Palette per useMemo einmal pro Manifest). */
export interface NormIndex {
  /** normalisiertes Kürzel/Key → Erlasse (Kollisionen möglich, z. B. «StG»). */
  map: Map<string, NormErlass[]>;
  /** Vorhandene Kantonskürzel (2-Buchstaben-Codes) für die Disambiguierung. */
  kantone: Set<string>;
}

// Kürzel/Codes vergleichsfest machen: Grossschreibung, Diakritika weg
// (Ö→O, kongruent für gespeicherten Wert UND Eingabe), nur A–Z0–9. So matcht
// «GebV SchKG» = «GEBVSCHKG», «ArGV 1» = «ARGV1», «BGÖ» = «BGO».
function norm(s: string): string {
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

// Lateinische Suffixe zuerst (bis/ter/…), sonst würde «1bis» zu «1_b» verstümmelt
// (kongruent passus.ts:16/fedlex). Gross-/Kleinschreibung egal.
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/;

// Artikel-Teil-Grammatik: optionaler Designator (Art./Artikel/§/Par.) + Nummer
// mit optionalem Buchstaben-/Latein-Suffix, danach optional Abs./lit./Ziff. und
// eine römische Ziffer (Absatz-Notation «II»). ANKER ^…$ — steht ein Fremdwort
// im Rest, schlägt der Match fehl → kein Fehl-Sprung (Freitext → Suche).
const ARTIKEL_TEIL =
  /^(?:art(?:ikel)?\.?|§|par(?:agraf|agraph)?\.?)?\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)\s*(?:abs\.?\s*\w+)?\s*(?:(?:lit\.?|bst\.?|ziff\.?|ziffer)\s*\w+)?\s*(?:[ivxlcdm]+\.?)?\s*$/i;

/** Baut den Auflösungs-Index aus der Erlass-Liste (Browse-Manifest). */
export function baueNormIndex(erlasse: readonly NormErlass[]): NormIndex {
  const map = new Map<string, NormErlass[]>();
  const kantone = new Set<string>();
  for (const e of erlasse) {
    if (e.kanton) kantone.add(norm(e.kanton));
    // Sowohl Anzeige-Kürzel als auch Routen-Key indexieren (z. B. «GebV SchKG»
    // und «GEBV_SCHKG» → beide «GEBVSCHKG»). Set dedupt gleiche Normalform.
    for (const k of new Set([norm(e.kuerzel), norm(e.key)])) {
      if (!k) continue;
      const arr = map.get(k);
      if (arr) { if (!arr.includes(e)) arr.push(e); }
      else map.set(k, [e]);
    }
  }
  return { map, kantone };
}

// Aus mehreren Kandidaten den EINEN wählen: genau ein Treffer → dieser; sonst
// genau ein Bund-Treffer → dieser (Bund schlägt kollidierende Kantonskürzel wie
// «StG», es sei denn der Kanton wird explizit genannt); sonst mehrdeutig → null.
function waehle(cands: NormErlass[] | undefined, filter?: (e: NormErlass) => boolean): NormErlass | null {
  if (!cands) return null;
  const c = filter ? cands.filter(filter) : cands;
  if (c.length === 1) return c[0];
  if (c.length === 0) return null;
  const bund = c.filter((e) => e.ebene === 'bund');
  return bund.length === 1 ? bund[0] : null;
}

// Artikel-Token + Anzeige aus den Nicht-Kürzel-Tokens. null, wenn der Rest kein
// sauberer Artikel-Designator ist (Fremdwort/leer) → kein Fehl-Sprung.
function parseArtikel(tokens: string[]): { token: string; anzeige: string } | null {
  if (tokens.length === 0) return null;
  const m = tokens.join(' ').match(ARTIKEL_TEIL);
  if (!m) return null;
  const anzeige = m[1].toLowerCase();
  const token = anzeige.replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
  return { token, anzeige };
}

// Versucht (Kürzel + optional Artikel) auf `tokens` gegen `index` aufzulösen.
// filter grenzt die Kandidaten ein (Kanton-Disambiguierung).
function loese(index: NormIndex, tokens: string[], filter?: (e: NormErlass) => boolean): { erlass: NormErlass; artikel: { token: string; anzeige: string } | null } | null {
  if (tokens.length === 0) return null;
  // (1) Reines Kürzel (ganze Eingabe) → Erlass-Sprung ohne Artikel.
  const ganz = waehle(index.map.get(norm(tokens.join(''))), filter);
  if (ganz) return { erlass: ganz, artikel: null };
  // (2) Kürzel am ENDE (Artikel davor), längste Spanne zuerst (max. 3 Tokens für
  //     mehrteilige Kürzel wie «GebV SchKG»).
  for (let len = Math.min(3, tokens.length - 1); len >= 1; len--) {
    const erlass = waehle(index.map.get(norm(tokens.slice(-len).join(''))), filter);
    if (erlass) {
      const artikel = parseArtikel(tokens.slice(0, -len));
      if (artikel) return { erlass, artikel };
    }
  }
  // (3) Kürzel am ANFANG (Artikel danach).
  for (let len = Math.min(3, tokens.length - 1); len >= 1; len--) {
    const erlass = waehle(index.map.get(norm(tokens.slice(0, len).join(''))), filter);
    if (erlass) {
      const artikel = parseArtikel(tokens.slice(len));
      if (artikel) return { erlass, artikel };
    }
  }
  return null;
}

function bauHref(e: NormErlass, artikelToken: string | null): string {
  const basis = `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
  // Anker nur für gerenderten Volltext (snapshot). pdf-embed/nur-live-link haben
  // keine #art-Anker → nur der Erlass wird geöffnet (§15 Funktions-Treue).
  return artikelToken && e.status === 'snapshot' ? `${basis}#art-${artikelToken}` : basis;
}

/**
 * Löst eine Norm-Query auf einen Leser-Deep-Link auf, oder gibt null zurück
 * (→ normale Suche). Deterministisch, ohne Suchindex.
 */
export function parseNormQuery(query: string, index: NormIndex): NormQueryTreffer | null {
  const roh = query.trim();
  if (!roh) return null;
  const tokens = roh.split(/\s+/);

  // Explizite Kantons-Angabe (2-Buchstaben-Code irgendwo in der Eingabe) grenzt
  // die Auflösung auf diesen Kanton ein und wird ZUERST versucht (der Nutzer
  // meint diesen Kanton, nicht den kollidierenden Bund-Treffer wie «StG»).
  const ktIdx = tokens.findIndex((t) => index.kantone.has(norm(t)) && /^[a-zA-Z]{2}$/.test(t));
  if (ktIdx >= 0) {
    const code = norm(tokens[ktIdx]);
    const rest = tokens.filter((_, i) => i !== ktIdx);
    const r = loese(index, rest, (e) => e.kanton != null && norm(e.kanton) === code);
    if (r) return { erlass: r.erlass, artikelToken: r.artikel?.token ?? null, artikelAnzeige: r.artikel?.anzeige ?? null, href: bauHref(r.erlass, r.artikel?.token ?? null) };
  }

  const r = loese(index, tokens);
  if (!r) return null;
  return { erlass: r.erlass, artikelToken: r.artikel?.token ?? null, artikelAnzeige: r.artikel?.anzeige ?? null, href: bauHref(r.erlass, r.artikel?.token ?? null) };
}
