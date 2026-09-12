// scripts/zustaendigkeit/gpkg.ts — minimaler, deterministischer GPKG/WKB-Leser.
//
// WARUM EIGENBAU: Für die BE-Sprengel-Zuordnung (K-15) brauchen wir aus drei
// GeoPackages nur zweierlei — Attributzeilen und Flächen-Ringe. Ein GeoPackage
// IST eine SQLite-Datei; `node:sqlite` liest sie ohne Zusatzabhängigkeit. Eine
// Geo-Bibliothek einzuziehen hiesse, für 200 Zeilen Bedarf eine Lizenz- und
// Determinismus-Frage mitzukaufen (die Kandidaten der Fremdquellen-Sichtung
// 2.9.2026 §3 sind LGPL/GPL/NOASSERTION). Nichts davon läuft im Browser:
// dieser Leser ist reine Build-Zeit (§2 — das Artefakt ist die Projektion).
//
// ABDECKUNG: Polygon (3), MultiPolygon (6), CurvePolygon (10), MultiSurface
// (12); Ringe als LineString (2), CircularString (8), CompoundCurve (9).
// GRENZ5 (Gemeindegrenzen) führt echte Kreisbögen — die amtliche Vermessung
// beschreibt Grenzbögen exakt, nicht als Sehnenzug. Alles andere wirft, statt
// still eine leere Fläche zu liefern (§8: Lücke nie verschweigen).

import { DatabaseSync } from 'node:sqlite';

/** Feste Zahl Sehnen je Kreisbogen. KEIN Toleranz-Parameter: eine Toleranz
 *  macht die Punktzahl von der Bogenlänge abhängig und damit die Ausgabe von
 *  Gleitkomma-Rundung — eine Konstante ist reproduzierbar (§2). */
const SEHNEN_JE_BOGEN = 16;

/** Ein Ring: [x0,y0,x1,y1,…] in der Projektion der Quelle (hier LV95/EPSG 2056). */
export type Ring = Float64Array;
/** Eine Fläche: Aussenring + Löcher. */
export type Flaeche = Ring[];
/** Eine Geometrie: eine oder mehrere Flächen. */
export type Gebiet = Flaeche[];

interface Leser { b: Buffer; o: number }

function kopf(s: Leser): { bo: number; typ: number } {
  const bo = s.b.readUInt8(s.o);
  s.o += 1;
  const roh = bo === 1 ? s.b.readUInt32LE(s.o) : s.b.readUInt32BE(s.o);
  s.o += 4;
  return { bo, typ: roh % 1000 };
}
const u32 = (s: Leser, bo: number): number => {
  const v = bo === 1 ? s.b.readUInt32LE(s.o) : s.b.readUInt32BE(s.o);
  s.o += 4;
  return v;
};
const f64 = (s: Leser, bo: number): number => {
  const v = bo === 1 ? s.b.readDoubleLE(s.o) : s.b.readDoubleBE(s.o);
  s.o += 8;
  return v;
};

function punktfolge(s: Leser, bo: number): number[] {
  const n = u32(s, bo);
  const a: number[] = new Array<number>(2 * n);
  for (let i = 0; i < n; i++) {
    a[2 * i] = f64(s, bo);
    a[2 * i + 1] = f64(s, bo);
  }
  return a;
}

/** Kreisbogen p0→p1→p2 über die exakte Kreisgeometrie in Sehnen zerlegen.
 *  Kollineare Tripel (Determinante ~ 0) sind gerade Strecken. */
function bogen(p: number[], i: number, out: number[]): void {
  const [x0, y0, x1, y1, x2, y2] = [p[i], p[i + 1], p[i + 2], p[i + 3], p[i + 4], p[i + 5]];
  const d = 2 * (x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1));
  if (Math.abs(d) < 1e-9) {
    out.push(x1, y1, x2, y2);
    return;
  }
  const a0 = x0 * x0 + y0 * y0;
  const a1 = x1 * x1 + y1 * y1;
  const a2 = x2 * x2 + y2 * y2;
  const cx = (a0 * (y1 - y2) + a1 * (y2 - y0) + a2 * (y0 - y1)) / d;
  const cy = (a0 * (x2 - x1) + a1 * (x0 - x2) + a2 * (x1 - x0)) / d;
  const r = Math.hypot(x0 - cx, y0 - cy);
  const t0 = Math.atan2(y0 - cy, x0 - cx);
  const t1 = Math.atan2(y1 - cy, x1 - cx);
  const t2 = Math.atan2(y2 - cy, x2 - cx);
  const voll = 2 * Math.PI;
  const norm = (a: number): number => ((a % voll) + voll) % voll;
  // Drehsinn: liegt der Mittelpunkt p1 im Gegenuhrzeigersinn vor p2, läuft der
  // Bogen im Gegenuhrzeigersinn.
  const gegen = norm(t1 - t0) < norm(t2 - t0);
  const spanne = gegen ? norm(t2 - t0) : -norm(t0 - t2);
  for (let k = 1; k <= SEHNEN_JE_BOGEN; k++) {
    const t = t0 + (spanne * k) / SEHNEN_JE_BOGEN;
    out.push(cx + r * Math.cos(t), cy + r * Math.sin(t));
  }
}

function kurve(s: Leser): number[] {
  const h = kopf(s);
  if (h.typ === 2) return punktfolge(s, h.bo);
  if (h.typ === 8) {
    const p = punktfolge(s, h.bo);
    if (p.length < 6 || (p.length / 2) % 2 === 0) {
      throw new Error(`gpkg: CircularString mit ${p.length / 2} Punkten (erwartet ungerade, ≥ 3).`);
    }
    const out: number[] = [p[0], p[1]];
    for (let i = 0; i + 5 < p.length; i += 4) bogen(p, i, out);
    return out;
  }
  if (h.typ === 9) {
    const n = u32(s, h.bo);
    let out: number[] = [];
    for (let i = 0; i < n; i++) {
      const seg = kurve(s);
      out = out.length === 0 ? seg : out.concat(seg.slice(2));
    }
    return out;
  }
  throw new Error(`gpkg: unbekannter Kurventyp ${h.typ} (erwartet 2/8/9).`);
}

function gebiet(s: Leser): Gebiet {
  const h = kopf(s);
  if (h.typ === 3 || h.typ === 10) {
    const n = u32(s, h.bo);
    const ringe: Flaeche = [];
    for (let i = 0; i < n; i++) {
      ringe.push(Float64Array.from(h.typ === 3 ? punktfolge(s, h.bo) : kurve(s)));
    }
    return [ringe];
  }
  if (h.typ === 6 || h.typ === 12) {
    const n = u32(s, h.bo);
    let alle: Gebiet = [];
    for (let i = 0; i < n; i++) alle = alle.concat(gebiet(s));
    return alle;
  }
  throw new Error(`gpkg: unbekannter Flächentyp ${h.typ} (erwartet 3/6/10/12).`);
}

/** GPKG-BLOB (Magic «GP» + Flags + optionale Hülle + WKB) → Flächen. */
export function leseGeometrie(blob: Uint8Array): Gebiet {
  const b = Buffer.from(blob);
  if (b.length < 8 || b[0] !== 0x47 || b[1] !== 0x50) {
    throw new Error('gpkg: BLOB ohne GeoPackage-Magic «GP».');
  }
  const huelle = [0, 32, 48, 48, 64][(b[3] >> 1) & 7];
  if (huelle === undefined) throw new Error('gpkg: unbekannter Hüllen-Indikator.');
  return gebiet({ b, o: 8 + huelle });
}

/** Punkt-in-Fläche, gerade/ungerade Regel über alle Ringe und Teilflächen. */
export function imGebiet(g: Gebiet, x: number, y: number): boolean {
  let drin = false;
  for (const ringe of g) {
    let teil = false;
    for (const r of ringe) {
      const n = r.length / 2;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const yi = r[2 * i + 1];
        const yj = r[2 * j + 1];
        if (yi > y !== yj > y && x < ((r[2 * j] - r[2 * i]) * (y - yi)) / (yj - yi) + r[2 * i]) {
          teil = !teil;
        }
      }
    }
    if (teil) drin = !drin;
  }
  return drin;
}

const ringFlaeche = (r: Ring): number => {
  let s = 0;
  const n = r.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) s += r[2 * j] * r[2 * i + 1] - r[2 * i] * r[2 * j + 1];
  return s / 2;
};

/** Garantierter INNENpunkt (point-on-surface), deterministisch: feste Schar
 *  von Scanlinien über die flächengrösste Teilfläche; es gewinnt die breiteste
 *  Innenspanne (bei Gleichstand die zuerst gefundene). Ein Schwerpunkt taugt
 *  nicht — bei L- oder Ring-Formen liegt er ausserhalb. */
export function innenPunkt(g: Gebiet): [number, number] {
  let best: Flaeche | null = null;
  let bestA = -1;
  for (const ringe of g) {
    const a = Math.abs(ringFlaeche(ringe[0]));
    if (a > bestA) {
      bestA = a;
      best = ringe;
    }
  }
  if (best === null) throw new Error('gpkg: leere Geometrie ohne Innenpunkt.');
  const aus = best[0];
  let ymin = Infinity;
  let ymax = -Infinity;
  for (let i = 1; i < aus.length; i += 2) {
    if (aus[i] < ymin) ymin = aus[i];
    if (aus[i] > ymax) ymax = aus[i];
  }
  let punkt: [number, number] | null = null;
  let breite = -1;
  for (let k = 1; k < 64; k++) {
    const y = ymin + ((ymax - ymin) * k) / 64;
    const xs: number[] = [];
    for (const r of best) {
      const n = r.length / 2;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const yi = r[2 * i + 1];
        const yj = r[2 * j + 1];
        if (yi > y !== yj > y) xs.push(r[2 * j] + ((r[2 * i] - r[2 * j]) * (y - yj)) / (yi - yj));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const w = xs[i + 1] - xs[i];
      if (w > breite) {
        breite = w;
        punkt = [(xs[i] + xs[i + 1]) / 2, y];
      }
    }
  }
  if (punkt === null) throw new Error('gpkg: kein Innenpunkt gefunden (entartete Fläche).');
  return punkt;
}

/** Tabellenzeilen eines GeoPackage lesen (read-only). */
export function leseTabelle(datei: string, tabelle: string, spalten: string[]): Record<string, unknown>[] {
  const db = new DatabaseSync(datei, { readOnly: true });
  try {
    const sql = `SELECT ${spalten.map((s) => `"${s}"`).join(', ')} FROM "${tabelle}" ORDER BY "fid"`;
    return db.prepare(sql).all() as unknown as Record<string, unknown>[];
  } finally {
    db.close();
  }
}
