/**
 * Reine Prüf-Logik für den Drift-Check (§7 Zitat-Ausnahme d).
 * Exportiert für Tests (normtext-drift.test.ts) und für check-drift.ts.
 * §2: kein Date.now/Math.random — rein deterministisch.
 */

export interface NormSnapshot {
  id: string;
  quelle: string;
  fassungsToken: string;
  [key: string]: unknown;
}

export interface BundFassungsMismatch {
  id: string;
  snapshotToken: string;
  cacheToken: string;
}

/**
 * Prüft für jeden Snapshot-Eintrag, ob fassungsToken === cacheMap[gesetz].
 *
 * @param snapshots - alle NormSnapshot-Einträge aus allen Bund-Snapshot-Dateien
 * @param cacheMap  - Map von Gesetz-Name (lowercase, z.B. 'or') → Konsolidierung ('20260101')
 * @returns Liste aller Mismatches
 */
export function pruefeBundFassung(
  snapshots: NormSnapshot[],
  cacheMap: Map<string, string>,
): BundFassungsMismatch[] {
  const mismatches: BundFassungsMismatch[] = [];

  for (const snap of snapshots) {
    // id-Format: "bund/<GESETZ>/art_xxx" → Gesetz-Name aus Teil 2
    const teile = snap.id.split('/');
    if (teile.length < 3 || teile[0] !== 'bund') continue;

    const gesetzName = teile[1].toLowerCase(); // z.B. "OR" → "or"
    const erwartet = cacheMap.get(gesetzName);
    if (erwartet === undefined) continue; // kein Cache-Eintrag → nicht prüfbar

    if (snap.fassungsToken !== erwartet) {
      mismatches.push({
        id: snap.id,
        snapshotToken: snap.fassungsToken,
        cacheToken: erwartet,
      });
    }
  }

  return mismatches;
}

/**
 * Prüft, welche Pflicht-Anker aus dem Cache in den Snapshots fehlen.
 *
 * @param snapshotIds - Set aller vorhandenen Snapshot-IDs (z.B. "bund/OR/art_11")
 * @param ankerMap    - Map von Gesetz-Name (lowercase) → Array der Pflicht-Anker
 * @returns Liste der fehlenden IDs
 */
export function pruefeBundVollstaendigkeit(
  snapshotIds: Set<string>,
  ankerMap: Map<string, string[]>,
): string[] {
  const fehlend: string[] = [];

  for (const [name, anker] of ankerMap) {
    const gesetz = name.toUpperCase();
    for (const a of anker) {
      const erwartetId = `bund/${gesetz}/${a}`;
      if (!snapshotIds.has(erwartetId)) {
        fehlend.push(erwartetId);
      }
    }
  }

  return fehlend;
}
