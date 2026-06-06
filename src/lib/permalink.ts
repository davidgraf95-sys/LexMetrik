// ─── Permalink-Codec — geteilter Baustein (FAHRPLAN-PRAXIS 1.3) ─────────────
//
// Verallgemeinert das Tagerechner-Muster (fristQueryKodieren/Lesen): Jede
// Rechner-Form deklariert nur noch eine Spec (Feld → kurzer Query-Param +
// Typ + optionale Validierung); Kodieren/Lesen laufen hier. Deterministisch,
// kein Tracking, rein lokal (§2/§8). Beim Lesen wird typgeprüft und
// validiert — Ungültiges wird stillschweigend weggelassen (die Engines
// validieren ohnehin erneut).

export type PermalinkFeld<V> =
  | { p: string; typ: 'str'; gueltig?: (v: string) => boolean }
  | { p: string; typ: 'num'; gueltig?: (v: number) => boolean }
  | { p: string; typ: 'bool' }
  // json: für kleine Arrays/Objekte (z. B. Sperrereignisse, Stillstände).
  | { p: string; typ: 'json'; gueltig?: (v: V) => boolean };

export type PermalinkSpec<T> = { [K in keyof T & string]?: PermalinkFeld<T[K]> };

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;
export const istISO = (v: string) => ISO_DATUM.test(v);

const KANTONE_GUELTIG = new Set(['AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);
export const istKanton = (v: string) => KANTONE_GUELTIG.has(v);

/** Erzeugt einen Wertelisten-Wächter (Select-Felder: nur bekannte Codes). */
export const einerVon = (...werte: string[]) => {
  const set = new Set(werte);
  return (v: string) => set.has(v);
};

export function permalinkKodieren<T extends Record<string, unknown>>(spec: PermalinkSpec<T>, werte: T): string {
  const p = new URLSearchParams();
  for (const [feld, def] of Object.entries(spec) as [string, PermalinkFeld<unknown>][]) {
    const v = werte[feld];
    if (v == null) continue;
    switch (def.typ) {
      case 'str':
        if (typeof v === 'string' && v !== '') p.set(def.p, v);
        break;
      case 'num':
        if (typeof v === 'number' && Number.isFinite(v)) p.set(def.p, String(v));
        break;
      case 'bool':
        // Explizit '1'/'0': false kann vom Default abweichen und muss den
        // Link überleben (z. B. gerichtshinweisStillstand, Art. 145 Abs. 3).
        if (typeof v === 'boolean') p.set(def.p, v ? '1' : '0');
        break;
      case 'json':
        if (Array.isArray(v) ? v.length > 0 : typeof v === 'object') p.set(def.p, JSON.stringify(v));
        break;
    }
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function permalinkLesen<T extends Record<string, unknown>>(spec: PermalinkSpec<T>, query: string): Partial<T> {
  const p = new URLSearchParams(query);
  const aus: Record<string, unknown> = {};
  for (const [feld, def] of Object.entries(spec) as [string, PermalinkFeld<unknown>][]) {
    const roh = p.get(def.p);
    if (roh == null) continue;
    switch (def.typ) {
      case 'str':
        if (!def.gueltig || def.gueltig(roh)) aus[feld] = roh;
        break;
      case 'num': {
        const n = Number(roh);
        if (Number.isFinite(n) && (!def.gueltig || def.gueltig(n))) aus[feld] = n;
        break;
      }
      case 'bool':
        if (roh === '1' || roh === '0') aus[feld] = roh === '1';
        break;
      case 'json':
        try {
          const v = JSON.parse(roh);
          if (!def.gueltig || def.gueltig(v)) aus[feld] = v;
        } catch { /* ungültig → weglassen */ }
        break;
    }
  }
  return aus as Partial<T>;
}
