// ─── Eigener Inhalts-Hash für Entscheid-Snapshots (Fahrplan Strang-0) ────────
//
// NICHT die private sha256Bloecke der Gesetze wiederverwenden — eigener Anker,
// damit Änderungen hier nie die Gesetzes-SHAs (Golden) berühren können.

import { createHash } from 'node:crypto';
import type { EntscheidAbschnitt } from '../../src/lib/rechtsprechung/typen';

/** sha256 über Abschnitts-Typ + Marke + Text (Regressions-/Drift-Anker). */
export function sha256EntscheidBloecke(abschnitte: EntscheidAbschnitt[]): string {
  const norm = abschnitte
    .map((a) => a.typ + '' + a.bloecke.map((b) => (b.marke ?? '') + '' + b.text).join(''))
    .join('');
  return createHash('sha256').update(norm, 'utf8').digest('hex');
}
