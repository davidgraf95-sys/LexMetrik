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

import { ankerZuToken } from './extrahiere-fedlex.ts';

// ─── Typen ─────────────────────────────────────────────────────────────────────

/**
 * Prüfung 5 (30.6.2026): Struktur-Sidecar ↔ Snapshot-Konsistenz.
 *
 * Snapshot (`public/normtext/bund/<G>.json`) und Struktur-Sidecar
 * (`public/normtext/struktur/bund/<G>.json`) werden von ZWEI getrennten Befehlen
 * erzeugt (`npm run normtext` vs. `normtext:struktur`). Wird nur einer neu
 * gebaut (z.B. Snapshot auf neue Konsolidierung re-gepinnt, Struktur vergessen),
 * driften sie STILL auseinander: Artikel rendern ohne ihre Gliederung/Randtitel,
 * verwaiste Struktur-Schlüssel zeigen ins Leere. Genau dieser Defekt lag am
 * 30.6.2026 in Produktion (OR: `219_a`/`226_a_226_d` ohne Struktur, `226_a`/
 * `226_f` verwaist). Dieses Tor macht den Drift unmöglich, still zu verschiffen.
 *
 * Invariante je Bund-Snapshot-Gesetz:
 *   (a) KEIN verwaister Struktur-Schlüssel (jeder Struktur-Schlüssel hat einen
 *       Snapshot-Eintrag) — verwaiste Schlüssel = veraltete Struktur.
 *   (b) JEDER Snapshot-Token hat einen Struktur-Schlüssel — AUSSER den
 *       Synthese-Suffix-Token «…__N» (2./3. Vorkommen einer doppelten art_id;
 *       die Struktur keyt nach roher HTML-id ohne Suffix → bekannte, dokumentierte
 *       Doppelartikel-Grenze, separat als `fehlendDoppelId` geführt, kein Fehler).
 */
export interface StrukturKonsistenz {
  /** Struktur-Schlüssel ohne Snapshot-Eintrag (veraltete Struktur → FEHLER). */
  verwaist: string[];
  /** Snapshot-Token ohne Struktur (echter Token, kein «__N» → FEHLER). */
  fehlend: string[];
  /** Snapshot-Token «…__N» ohne Struktur (Doppelartikel-Grenze → nur Hinweis). */
  fehlendDoppelId: string[];
}

/**
 * Reine Konsistenz-Prüfung (testbar). `snapshotTokens` = alle `artikel`-Werte
 * der Snapshot-Datei; `strukturKeys` = alle Schlüssel von `struktur.artikel`.
 */
export function pruefeStrukturKonsistenz(
  snapshotTokens: readonly string[],
  strukturKeys: readonly string[],
): StrukturKonsistenz {
  const snap = new Set(snapshotTokens);
  const stru = new Set(strukturKeys);
  const verwaist = [...stru].filter((k) => !snap.has(k));
  const fehlendAlle = [...snap].filter((t) => !stru.has(t));
  return {
    verwaist,
    fehlend: fehlendAlle.filter((t) => !/__\d+$/.test(t)),
    fehlendDoppelId: fehlendAlle.filter((t) => /__\d+$/.test(t)),
  };
}

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
 * @param schlussteilAnker - M13: VOLLE Schlusstitel-/UeB-Anker (via alleSchlussteilAnker,
 *                   z.B. 'disp_u1/art_1'). Deren Snapshot-id wird über ankerZuToken
 *                   gebildet — exakt wie im Generator —, sodass auch der Schlussteil
 *                   auf Vollabdeckung geprüft wird (§7), ohne den Haupttext-Pfad zu ändern.
 * @returns Fehlende Artikel (in HTML, nicht im Snapshot, ausser dokumentierte Skips)
 */
export function fehlendeBundArtikel(
  gesetz: string,
  htmlTokens: string[],
  snapshotIds: Set<string>,
  leereArtikel: ReadonlySet<string>,
  schlussteilAnker: readonly string[] = [],
  anhangAnker: readonly string[] = [],
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

  // M13: Schlussteil-Anker mit eigenem Token-Namespace (kollisionsfrei zum Haupttext).
  for (const anker of schlussteilAnker) {
    const token = ankerZuToken(anker);
    const snapshotId = `bund/${gesetzOben}/${token}`;
    if (!snapshotIds.has(snapshotId)) {
      fehlend.push({
        gesetz: gesetzOben,
        token,
        snapshotId,
        warLeererArtikel: leereArtikel.has(token),
      });
    }
  }

  // M13-Annex: Anhang-Anker (annex_*). Es werden NUR die content-tragenden Anker
  // übergeben (extrahiereAnhang ≠ null) — reine Gruppen-Überschriften ohne Body
  // sind keine Snapshot-Einträge und dürfen keine Lücke melden (Caller filtert).
  for (const anker of anhangAnker) {
    const token = ankerZuToken(anker);
    const snapshotId = `bund/${gesetzOben}/${token}`;
    if (!snapshotIds.has(snapshotId)) {
      fehlend.push({
        gesetz: gesetzOben,
        token,
        snapshotId,
        warLeererArtikel: false,
      });
    }
  }

  return fehlend;
}

// ─── Prüfung 2: Kanton-Zitat-Abdeckung ───────────────────────────────────────

/**
 * Prüft, welche Kanton-Zitat-Tokens keinen Snapshot haben, ohne in bekannteLuecken zu stehen.
 *
 * Einfache ID-String-Variante: nützlich für Einheits-Tests und Fälle, bei denen
 * Snapshot-IDs direkt aus (kanton, lawId, token) ableitbar sind (Normalfall ohne
 * Sprach-Suffix oder URL-Encoding-Varianten). Für die vollständige Laufzeit-Prüfung
 * mit Manifest-Auflösung → `unerwarteteKantonLueckenMitQuelleUrl`.
 *
 * @param zitierte    - Alle zitierten (kanton, lawId, artikelToken)-Tripel aus dem Inventar
 * @param snapshotIds - Set aller vorhandenen Kanton-Snapshot-IDs (z.B. 'kanton/BE/161.12/art_4')
 * @param bekannteLuecken - Liste bekannter, akzeptierter Lücken mit Grund
 * @returns Unerwartete Lücken (nicht im Snapshot, nicht erklärt) → FEHLER
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

/**
 * Zitat-Inventar-Gruppe mit quelleUrl — wie von sammleKantonInventar() geliefert.
 * Nur die Felder, die die Manifest-Auflösung braucht.
 */
export interface KantonInventarGruppeRef {
  kanton: string;
  lawId: string;
  quelleUrl: string;
  artikel: ReadonlyArray<{ token: string }>;
}

/**
 * Vollständigkeitsprüfung via Laufzeit-Auflösung (quelleUrl + artikel-Token).
 *
 * Löst EXAKT so auf wie das Laufzeit-Chip: Manifest (quelleUrl → Datei) →
 * Snapshot-Einträge der Datei → Eintrag mit `artikel === token`. Diese Auflösung
 * ist robust gegen Snapshot-ID-Suffixe (z.B. '130.11-de', '173.8-fr', 'III%20B_7_1'),
 * die entstehen wenn mehrsprachige Erlasse oder URL-kodierte lawIds verschiedene
 * Dateinamen/IDs tragen als die kanonische `kanton/${k}/${lawId}/art_${t}`-Form.
 *
 * Ein echtes Loch liegt NUR vor, wenn:
 *   (a) die quelleUrl nicht im Manifest steht, ODER
 *   (b) die Snapshot-Datei keinen Eintrag mit `artikel === token` enthält.
 *
 * @param gruppen         - Inventar-Gruppen mit quelleUrl + artikel-Tokens
 * @param manifestMap     - Map quelleUrl → Dateiname (aus public/normtext/kanton/index.json)
 * @param artikelNachUrl  - Map quelleUrl → Set<string> der `artikel`-Werte in der Snapshot-Datei
 * @param bekannteLuecken - Bekannte, akzeptierte Lücken (mit Grund); identifiziert über
 *                          kanonische snapshotId `kanton/${kanton}/${lawId}/art_${token}`
 * @returns Unerwartete Lücken → FEHLER
 */
export function unerwarteteKantonLueckenMitQuelleUrl(
  gruppen: ReadonlyArray<KantonInventarGruppeRef>,
  manifestMap: ReadonlyMap<string, string>,
  artikelNachUrl: ReadonlyMap<string, Set<string>>,
  bekannteLuecken: ReadonlyArray<BekannteLuecke>,
): KantonZitatLuecke[] {
  const bekannteIds = new Set(bekannteLuecken.map((l) => l.snapshotId));
  const unerwartet: KantonZitatLuecke[] = [];

  for (const gruppe of gruppen) {
    const { kanton, lawId, quelleUrl, artikel } = gruppe;
    // Hat die quelleUrl keinen Manifest-Eintrag, fehlt die Datei vollständig.
    const dateiVorhanden = manifestMap.has(quelleUrl);
    // Artikel-Set der Snapshot-Datei (leer wenn Datei fehlt oder kein Eintrag).
    const vorhandeneArtikel = dateiVorhanden
      ? (artikelNachUrl.get(quelleUrl) ?? new Set<string>())
      : new Set<string>();

    for (const { token } of artikel) {
      // Kanonische ID — für Abgleich mit bekannteLuecken und für Fehlermeldungen.
      const snapshotId = `kanton/${kanton}/${lawId}/art_${token}`;
      // Abgedeckt: Snapshot-Datei hat einen Eintrag mit artikel === token.
      const abgedeckt = vorhandeneArtikel.has(token);
      if (!abgedeckt && !bekannteIds.has(snapshotId)) {
        unerwartet.push({ kanton, lawId, artikelToken: token, snapshotId });
      }
    }
  }

  return unerwartet;
}

// ─── Prüfung 3: Inhalts-Sanity ────────────────────────────────────────────────

export interface SnapshotBlock {
  absatz: string | null;
  text?: string;
  items?: Array<{ marke: string; text: string }>;
  /** Tarif-Tabelle (Füllpunkt-Zweispalter); gültig als Block-Inhalt auch wenn text leer. */
  tabelle?: Array<{ beschreibung: string; betrag: string }>;
  /** Mehrspalten-Tarif-Tabelle (Stufe 2, ZH-Staffeln / ·–-Tabellen); gültig als Block-Inhalt auch wenn text leer. */
  mehrspaltig?: { kopf?: string[]; zeilen: string[][] };
}

export interface SnapshotEintrag {
  id: string;
  bloecke: SnapshotBlock[];
  [key: string]: unknown;
}

/**
 * Prüft, dass kein Snapshot-Eintrag leere bloecke[] hat und kein Block leeren Inhalt.
 * Ein Block ist gültig, wenn er nicht-leeren text, nicht-leere items ODER nicht-leere tabelle hat.
 * (tabelle = Füllpunkt-Zweispalter, eingeführt Task 1–5 Kantonale Tarif-Tabellen.)
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
      const hatTabelle = Array.isArray(b.tabelle) && b.tabelle.length > 0;
      const hatMehrspaltig = b.mehrspaltig != null && Array.isArray(b.mehrspaltig.zeilen) && b.mehrspaltig.zeilen.length > 0;
      if (!hatText && !hatItems && !hatTabelle && !hatMehrspaltig) {
        // Aufgehoben-Konvention (S1, BS-Audit 23.6.2026): ein EINZELNER leerer
        // Block ist die bewusste, ehrliche Darstellung eines aufgehobenen, aber
        // umnummerierten Artikels (Display → gedämpftes «aufgehoben»; §8). Der
        // Extraktor erzeugt ihn genau dann, wenn die Quelle keinen Body liefert.
        // Nur als Fehler werten, wenn der leere Block NEBEN Inhalt steht (echter
        // Streublock in einem mehrblockigen Eintrag).
        if (e.bloecke.length === 1) break;
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
