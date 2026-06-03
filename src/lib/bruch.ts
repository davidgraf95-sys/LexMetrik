// ─── Exakte Bruchrechnung ─────────────────────────────────────────────────
//
// Erbquoten und Pflichtteile sind «Quoten einer Quote» (z. B. 3/4 × 1/2 = 3/8).
// Fliesskomma würde Rundungsfehler in die Rechtsanwendung tragen – deshalb
// werden alle Quoten als gekürzte Brüche geführt und erst für CHF-Beträge
// in Zahlen umgerechnet.

export type Bruch = { z: number; n: number }; // Zähler / Nenner, stets gekürzt, n > 0

function ggt(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

/** Erzeugt einen gekürzten Bruch. */
export function br(z: number, n = 1): Bruch {
  if (n === 0) throw new Error('Nenner 0');
  if (n < 0) { z = -z; n = -n; }
  const t = ggt(z, n);
  return { z: z / t, n: n / t };
}

export const NULL_BRUCH: Bruch = { z: 0, n: 1 };
export const EINS: Bruch = { z: 1, n: 1 };

export const addB = (a: Bruch, b: Bruch): Bruch => br(a.z * b.n + b.z * a.n, a.n * b.n);
export const subB = (a: Bruch, b: Bruch): Bruch => br(a.z * b.n - b.z * a.n, a.n * b.n);
export const mulB = (a: Bruch, b: Bruch): Bruch => br(a.z * b.z, a.n * b.n);
export const divB = (a: Bruch, b: Bruch): Bruch => br(a.z * b.n, a.n * b.z);
export const eqB = (a: Bruch, b: Bruch): boolean => a.z === b.z && a.n === b.n;
export const istNull = (a: Bruch): boolean => a.z === 0;
export const zahl = (a: Bruch): number => a.z / a.n;

/** Anzeige: «1/2», «3/8», «1» (ganz), «0». */
export function fmtB(a: Bruch): string {
  if (a.z === 0) return '0';
  if (a.n === 1) return String(a.z);
  return `${a.z}/${a.n}`;
}
