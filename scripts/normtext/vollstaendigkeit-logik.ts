/**
 * Reine Vollständigkeits-Logik für den Norm-Vollständigkeitscheck.
 * Exportiert für Tests (normtext-vollstaendigkeit.test.ts) und check-vollstaendigkeit.ts.
 * §2: kein Date.now/Math.random — rein deterministisch.
 *
 * Vier Prüfbereiche:
 *   1. fehlendeBundArtikel     — HTML-Tokens ohne Snapshot-Eintrag
 *   2. unerwarteteKantonLuecken — Zitat-Token ohne Snapshot, der nicht in bekannteLuecken steht
 *   3. pruefeInhaltsSanity     — Snapshot-Einträge mit leeren bloecke / leeren Blöcken
 *   4. pruefeManifestKonsistenz — Kanton-Manifest vs. tatsächliche Dateien
 */

// ─── Typen ─────────────────────────────────────────────────────────────────────

export interface BundArtikelLuecke {
  /** Name des Gesetzes (z.B. 'OR'). */
  gesetz: string;
  /** Token ohne «art_»-Präfix (z.B. '335_c'). */
  token: string;
  /** Vollständige erwartete Snapshot-ID (z.B. 'bund/OR/art_335_c'). */
  snapshotId: string;
  /** Ob extrahiereArtikel für diesen Token leer zurückgab (dokumentierter Skip). */
  warLeererArtikel: boolean;
}

export interface KantonZitatLuecke {
  /** Kanton-Kürzel (z.B. 'BE'). */
  kanton: string;
  /** LexWork-lawId (z.B. '161.12'). */
  lawId: string;
  /** Artikel-Token (z.B. 'art_4'). */
  artikelToken: string;
  /** Vollständige erwartete Snapshot-ID (z.B. 'kanton/BE/161.12/art_4'). */
  snapshotId: string;
}

/** Bekannte Lücke mit Grund. Unerwartete Lücken (nicht in dieser Liste) → FEHLER. */
export interface BekannteLuecke {
  /** Snapshot-ID (z.B. 'kanton/BE/161.12/art_4'). */
  snapshotId: string;
  /** Grund der Lücke (nurPdf / token-nicht-im-Erlass / fetch-404 / nicht-LexWork / leer-artikel). */
  grund: 'nurPdf' | 'token-nicht-im-Erlass' | 'fetch-404' | 'nicht-LexWork' | 'leer-artikel';
  /** Optionale Erläuterung. */
  notiz?: string;
}

export interface SanityFehler {
  /** Snapshot-ID des fehlerhaften Eintrags. */
  snapshotId: string;
  /** Art des Sanity-Fehlers. */
  problem: 'leere-bloecke' | 'leerer-block';
  /** Absatz-Index des problematischen Blocks (nur bei leerer-block). */
  blockIndex?: number;
}

export interface ManifestFehler {
  /** Dateiname (z.B. 'AG-291.150.json'). */
  datei: string;
  /** Art des Fehlers. */
  problem: 'datei-fehlt-fuer-manifest-eintrag' | 'datei-nicht-im-manifest';
  /** quelleUrl die im Manifest steht / stehen sollte. */
  quelleUrl?: string;
}

// ─── Prüfung 1: Bund-Extractions-Vollständigkeit ─────────────────────────────

/**
 * Vergleicht HTML-Tokens eines Bundesgesetzes mit den im Snapshot vorhandenen Tokens.
 *
 * @param gesetz       - Gesetz-Name in Grossbuchstaben (z.B. 'OR')
 * @param htmlTokens   - Array aller art_*-Tokens aus der Fedlex-HTML (via alleArtikelTokens)
 * @param snapshotIds  - Set aller vorhandenen Snapshot-IDs (z.B. 'bund/OR/art_1')
 * @param leereArtikel - Tokens, für die extrahiereArtikel leer zurückgab (dokumentierter Skip)
 * @returns Fehlende Artikel (in HTML, nicht im Snapshot, ausser dokumentierte Skips)
 */
export function fehlendeBundArtikel(
  gesetz: string,
  htmlTokens: string[],
  snapshotIds: Set<string>,
  leereArtikel: ReadonlySet<string>,
): BundArtikelLuecke[] {
  const fehlend: BundArtikelLuecke[] = [];
  const gesetzOben = gesetz.toUpperCase();

  for (const token of htmlTokens) {
    const snapshotId = `bund/${gesetzOben}/art_${token}`;
    if (!snapshotIds.has(snapshotId)) {
      fehlend.push({
        gesetz: gesetzOben,
        token,
        snapshotId,
        warLeererArtikel: leereArtikel.has(token),
      });
    }
  }

  return fehlend;
}

// ─── Prüfung 2: Kanton-Zitat-Abdeckung ───────────────────────────────────────

/**
 * Prüft, welche Kanton-Zitat-Tokens keinen Snapshot haben, ohne in bekannteLuecken zu stehen.
 *
 * @param zitierte    - Alle zitierten (kanton, lawId, artikelToken)-Tripel aus dem Inventar
 * @param snapshotIds - Set aller vorhandenen Kanton-Snapshot-IDs (z.B. 'kanton/BE/161.12/art_4')
 * @param bekannteLuecken - Liste bekannter, akzeptierter Lücken mit Grund
 * @returns Unerwartete Lücken (nicht in HTML, nicht erklärt) → FEHLER
 */
export function unerwarteteKantonLuecken(
  zitierte: ReadonlyArray<{ kanton: string; lawId: string; artikelToken: string }>,
  snapshotIds: Set<string>,
  bekannteLuecken: ReadonlyArray<BekannteLuecke>,
): KantonZitatLuecke[] {
  const bekannteIds = new Set(bekannteLuecken.map((l) => l.snapshotId));
  const unerwartet: KantonZitatLuecke[] = [];

  for (const { kanton, lawId, artikelToken } of zitierte) {
    const snapshotId = `kanton/${kanton}/${lawId}/art_${artikelToken}`;
    if (!snapshotIds.has(snapshotId) && !bekannteIds.has(snapshotId)) {
      unerwartet.push({ kanton, lawId, artikelToken, snapshotId });
    }
  }

  return unerwartet;
}

// ─── Prüfung 3: Inhalts-Sanity ────────────────────────────────────────────────

export interface SnapshotBlock {
  absatz: string | null;
  text?: string;
  items?: Array<{ marke: string; text: string }>;
}

export interface SnapshotEintrag {
  id: string;
  bloecke: SnapshotBlock[];
  [key: string]: unknown;
}

/**
 * Prüft, dass kein Snapshot-Eintrag leere bloecke[] hat und kein Block leeren Inhalt.
 * Ein Block ist gültig, wenn er entweder nicht-leeren text oder nicht-leere items hat.
 *
 * @param eintraege - Alle Snapshot-Einträge (Bund + Kanton)
 * @returns Liste der Sanity-Fehler
 */
export function pruefeInhaltsSanity(eintraege: ReadonlyArray<SnapshotEintrag>): SanityFehler[] {
  const fehler: SanityFehler[] = [];

  for (const e of eintraege) {
    if (!e.bloecke || e.bloecke.length === 0) {
      fehler.push({ snapshotId: e.id, problem: 'leere-bloecke' });
      continue;
    }

    for (let i = 0; i < e.bloecke.length; i++) {
      const b = e.bloecke[i];
      const hatText = typeof b.text === 'string' && b.text.trim().length > 0;
      const hatItems = Array.isArray(b.items) && b.items.length > 0;
      if (!hatText && !hatItems) {
        fehler.push({ snapshotId: e.id, problem: 'leerer-block', blockIndex: i });
      }
    }
  }

  return fehler;
}

// ─── Prüfung 4: Manifest-Konsistenz (Kanton) ──────────────────────────────────

/**
 * Prüft Kanton-Manifest-Konsistenz in beide Richtungen:
 *   a) Jeder Manifest-Eintrag zeigt auf eine existierende Datei
 *   b) Jede Snapshot-Datei ist im Manifest über mind. eine quelleUrl referenziert
 *
 * @param manifestMap   - Map quelleUrl → Dateiname (aus index.json)
 * @param vorhandeneD   - Set der tatsächlich vorhandenen Dateinamen (ohne Pfad)
 * @returns Liste der Manifest-Fehler
 */
export function pruefeManifestKonsistenz(
  manifestMap: ReadonlyMap<string, string>,
  vorhandeneD: ReadonlySet<string>,
): ManifestFehler[] {
  const fehler: ManifestFehler[] = [];

  // a) Jeder Manifest-Eintrag → Datei muss existieren
  for (const [quelleUrl, datei] of manifestMap) {
    if (!vorhandeneD.has(datei)) {
      fehler.push({
        datei,
        problem: 'datei-fehlt-fuer-manifest-eintrag',
        quelleUrl,
      });
    }
  }

  // b) Jede Datei → muss im Manifest referenziert sein
  const referenzierteDateien = new Set(manifestMap.values());
  for (const datei of vorhandeneD) {
    if (!referenzierteDateien.has(datei)) {
      fehler.push({
        datei,
        problem: 'datei-nicht-im-manifest',
      });
    }
  }

  return fehler;
}
