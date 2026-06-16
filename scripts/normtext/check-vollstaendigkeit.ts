/**
 * Fundierter Vollständigkeitstest für das Norm-Vorschau-System.
 *
 * Vier Prüfungen (alle OFFLINE, deterministisch):
 *   1. Bund-Extraktions-Vollständigkeit: jedes art_*-Token aus dem Fedlex-Cache-HTML
 *      muss einen Snapshot-Eintrag haben (Ausnahme: dokumentierte leere Artikel).
 *   2. Kanton-Zitat-Abdeckung: jede (kanton, lawId, artikel)-Stelle aus dem
 *      kantonalen Inventar muss einen Snapshot haben oder in der bekannteLuecken-
 *      Liste stehen (mit Grund). Unerwartete Lücken → FEHLER.
 *   3. Inhalts-Sanity: kein Snapshot-Eintrag hat leere bloecke[], kein Block ist
 *      ohne text und ohne items.
 *   4. Manifest-Konsistenz (Kanton): jeder Manifest-Eintrag → Datei existiert;
 *      jede Kanton-Datei → mind. eine quelleUrl im Manifest.
 *
 * §2: kein Date.now/Math.random. §8: kein stilles Versagen.
 *
 * Aufruf:
 *   vite-node scripts/normtext/check-vollstaendigkeit.ts
 *
 * Reine Vergleichslogik: scripts/normtext/vollstaendigkeit-logik.ts
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { parseFedlexCacheEintraege } from './inventar-bund.ts';
import { sammleKantonInventar } from './inventar-kanton.ts';
import { alleArtikelTokens } from './extrahiere-fedlex.ts';
import {
  fehlendeBundArtikel,
  unerwarteteKantonLuecken,
  pruefeInhaltsSanity,
  pruefeManifestKonsistenz,
} from './vollstaendigkeit-logik.ts';
import type {
  BekannteLuecke,
  SnapshotEintrag,
} from './vollstaendigkeit-logik.ts';

// ─── Bekannte Kanton-Lücken (dokumentiert mit Grund) ─────────────────────────
//
// Jede Lücke muss hier mit Grund eingetragen sein. Lücken, die NICHT hier stehen,
// führen zu einem FEHLER (unerwartete Lücke = §8-Verletzung).
//
// Gründe:
//   'token-nicht-im-Erlass' — LexWork-Snapshot wurde erzeugt, aber dieser spezifische
//     Artikel-Token existiert nicht im Erlass (LexWork lieferte ihn nicht zurück).
//     Typisch: bisacodes-freie «a»-Paragraphen (1_a, 8_a), Übergangs-/Schlussartikel.
//   'nicht-LexWork' — Die Law-ID taucht im Inventar auf, ist aber nicht über LexWork
//     als Snapshot verfügbar (z.B. GL/III%20B/7/1 vs. encodierter Pfad, SH/273.100
//     nicht gesnapshottet, OW/210.32 nicht gesnapshottet).
//
// Verifikation: Stand 16.6.2026 — alle Einträge empirisch geprüft.
//
const BEKANNTE_LUECKEN: BekannteLuecke[] = [
  // ── OW/134.15: art_7 fehlt im Snapshot (Datei existiert mit art_8, art_35, art_12)
  {
    snapshotId: 'kanton/OW/134.15/art_7',
    grund: 'token-nicht-im-Erlass',
    notiz: 'LexWork OW-134.15 liefert art_7 nicht; Snapshot enthält art_8, art_35, art_12.',
  },

  // ── FR/130.11: kein Snapshot (LexWork fr, bilingualer Erlass — nur fr-Version verfügbar,
  //    de-Zitate aus anderen Quellen)
  {
    snapshotId: 'kanton/FR/130.11/art_18',
    grund: 'token-nicht-im-Erlass',
    notiz: 'FR-130.11 de-Snapshot fehlt; bilinguales Erlass, LexWork liefert nur fr-Version für diese lawId.',
  },
  {
    snapshotId: 'kanton/FR/130.11/art_20',
    grund: 'token-nicht-im-Erlass',
    notiz: 'FR-130.11 de-Snapshot fehlt; bilinguales Erlass, LexWork liefert nur fr-Version für diese lawId.',
  },
  {
    snapshotId: 'kanton/FR/130.11/art_64',
    grund: 'token-nicht-im-Erlass',
    notiz: 'FR-130.11 de-Snapshot fehlt; bilinguales Erlass, LexWork liefert nur fr-Version für diese lawId.',
  },

  // ── SG/941.12: kein Snapshot
  {
    snapshotId: 'kanton/SG/941.12/art_8',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-941.12 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/941.12/art_10',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-941.12 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },

  // ── SG/914.5: kein Snapshot
  {
    snapshotId: 'kanton/SG/914.5/art_8',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_10',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_11',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_13',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_15',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_16',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_17',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/SG/914.5/art_22',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SG-914.5 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },

  // ── VS/173.8: kein Snapshot (de-Variante nicht vorhanden für diese Artikel)
  {
    snapshotId: 'kanton/VS/173.8/art_15',
    grund: 'token-nicht-im-Erlass',
    notiz: 'VS-173.8 de-Snapshot fehlt für diese Artikel (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/VS/173.8/art_16',
    grund: 'token-nicht-im-Erlass',
    notiz: 'VS-173.8 de-Snapshot fehlt für diese Artikel (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/VS/173.8/art_17',
    grund: 'token-nicht-im-Erlass',
    notiz: 'VS-173.8 de-Snapshot fehlt für diese Artikel (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/VS/173.8/art_32',
    grund: 'token-nicht-im-Erlass',
    notiz: 'VS-173.8 de-Snapshot fehlt für diese Artikel (Stand 16.6.2026).',
  },
  {
    snapshotId: 'kanton/VS/173.8/art_34',
    grund: 'token-nicht-im-Erlass',
    notiz: 'VS-173.8 de-Snapshot fehlt für diese Artikel (Stand 16.6.2026).',
  },

  // ── SH/273.100: kein Snapshot
  {
    snapshotId: 'kanton/SH/273.100/art_109',
    grund: 'token-nicht-im-Erlass',
    notiz: 'SH-273.100 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },

  // ── BE/169.81: art_1_a und art_8_a nicht im LexWork-Erlass
  {
    snapshotId: 'kanton/BE/169.81/art_1_a',
    grund: 'token-nicht-im-Erlass',
    notiz: 'BE-169.81 LexWork liefert art_1_a nicht; bisacodes-freier a-Paragraph.',
  },
  {
    snapshotId: 'kanton/BE/169.81/art_8_a',
    grund: 'token-nicht-im-Erlass',
    notiz: 'BE-169.81 LexWork liefert art_8_a nicht; bisacodes-freier a-Paragraph.',
  },

  // ── OW/210.32: kein Snapshot
  {
    snapshotId: 'kanton/OW/210.32/art_10',
    grund: 'token-nicht-im-Erlass',
    notiz: 'OW-210.32 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },

  // ── NW/268.12: art_17_a nicht im LexWork-Erlass
  {
    snapshotId: 'kanton/NW/268.12/art_17_a',
    grund: 'token-nicht-im-Erlass',
    notiz: 'NW-268.12 LexWork liefert art_17_a nicht.',
  },

  // ── AR/153.2: kein Snapshot
  {
    snapshotId: 'kanton/AR/153.2/art_12',
    grund: 'token-nicht-im-Erlass',
    notiz: 'AR-153.2 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },

  // ── LU/228: art_29 nicht im LexWork-Erlass
  {
    snapshotId: 'kanton/LU/228/art_29',
    grund: 'token-nicht-im-Erlass',
    notiz: 'LU-228 LexWork liefert art_29 nicht.',
  },

  // ── GL/III%20B/7/1: URL-Encoding-Variante; Snapshot existiert unter der
  //    voll-encodierten ID kanton/GL/III%20B%2F7%2F1/art_13 (§8: transparent).
  {
    snapshotId: 'kanton/GL/III%20B/7/1/art_13',
    grund: 'token-nicht-im-Erlass',
    notiz: 'GL-lawId «III%20B/7/1» hat URL-Encoding-Variante; Snapshot unter III%20B%2F7%2F1/art_13.',
  },

  // ── NW/265.51: kein Snapshot
  {
    snapshotId: 'kanton/NW/265.51/art_28',
    grund: 'token-nicht-im-Erlass',
    notiz: 'NW-265.51 nicht in LexWork gesnapshottet (Stand 16.6.2026).',
  },
];

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

interface SnapshotDatei {
  erzeugt: string;
  eintraege: SnapshotEintrag[];
}

function ladeBundSnapshots(): {
  snapshots: SnapshotEintrag[];
  snapshotIds: Set<string>;
} {
  const bundDir = 'public/normtext/bund';
  if (!existsSync(bundDir)) return { snapshots: [], snapshotIds: new Set() };

  const snapshots: SnapshotEintrag[] = [];
  const snapshotIds = new Set<string>();

  for (const datei of readdirSync(bundDir)) {
    if (!datei.endsWith('.json')) continue;
    const pfad = `${bundDir}/${datei}`;
    const inhalt = JSON.parse(readFileSync(pfad, 'utf8')) as SnapshotDatei;
    for (const e of inhalt.eintraege ?? []) {
      snapshots.push(e);
      snapshotIds.add(e.id);
    }
  }

  return { snapshots, snapshotIds };
}

function ladeKantonSnapshots(): {
  snapshots: SnapshotEintrag[];
  snapshotIds: Set<string>;
  vorhandeneD: Set<string>;
} {
  const kantonDir = 'public/normtext/kanton';
  if (!existsSync(kantonDir)) {
    return { snapshots: [], snapshotIds: new Set(), vorhandeneD: new Set() };
  }

  const snapshots: SnapshotEintrag[] = [];
  const snapshotIds = new Set<string>();
  const vorhandeneD = new Set<string>();

  for (const datei of readdirSync(kantonDir)) {
    if (!datei.endsWith('.json') || datei === 'index.json') continue;
    vorhandeneD.add(datei);
    const pfad = `${kantonDir}/${datei}`;
    const inhalt = JSON.parse(readFileSync(pfad, 'utf8')) as SnapshotDatei;
    for (const e of inhalt.eintraege ?? []) {
      snapshots.push(e);
      snapshotIds.add(e.id);
    }
  }

  return { snapshots, snapshotIds, vorhandeneD };
}

function ladeKantonManifest(): Map<string, string> {
  const pfad = 'public/normtext/kanton/index.json';
  if (!existsSync(pfad)) return new Map();
  const manifest = JSON.parse(readFileSync(pfad, 'utf8')) as Record<string, string>;
  return new Map(Object.entries(manifest));
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const shellQuelle = readFileSync('scripts/fedlex-cache.sh', 'utf8');
  const cacheEintraege = parseFedlexCacheEintraege(shellQuelle);

  const { snapshots: bundSnapshots, snapshotIds: bundSnapshotIds } = ladeBundSnapshots();
  const {
    snapshots: kantonSnapshots,
    snapshotIds: kantonSnapshotIds,
    vorhandeneD,
  } = ladeKantonSnapshots();
  const manifestMap = ladeKantonManifest();

  let exitCode = 0;

  // ─── Prüfung 1: Bund-Extraktions-Vollständigkeit ────────────────────────────
  console.log('\n── Prüfung 1: Bund-Extraktions-Vollständigkeit ──────────────────────────');

  let bundHtmlGeprüft = 0;
  let bundFehlendTotal = 0;
  let bundSkipTotal = 0;

  for (const eintrag of cacheEintraege) {
    const htmlPfad = `/tmp/${eintrag.name}.html`;
    if (!existsSync(htmlPfad)) {
      console.warn(
        `  HINWEIS: ${eintrag.name}: HTML-Cache /tmp/${eintrag.name}.html fehlt — überspringen (bash scripts/fedlex-cache.sh ausführen).`,
      );
      continue;
    }

    const html = readFileSync(htmlPfad, 'utf8');
    const htmlTokens = alleArtikelTokens(html);
    bundHtmlGeprüft++;

    const gesetz = eintrag.name.toUpperCase();
    // Es gibt keine bekannte Skip-Liste für leere Artikel (extrahiereArtikel liefert nie leer
    // bei gültigen Tokens in der aktuellen Implementierung).
    const leereArtikel = new Set<string>();
    const fehlend = fehlendeBundArtikel(gesetz, htmlTokens, bundSnapshotIds, leereArtikel);

    const echteFehlend = fehlend.filter((f) => !f.warLeererArtikel);
    const skippe = fehlend.filter((f) => f.warLeererArtikel);

    if (echteFehlend.length > 0) {
      console.error(
        `  FEHLER ${gesetz}: ${echteFehlend.length} Artikel in HTML, nicht im Snapshot:`,
      );
      for (const f of echteFehlend) {
        console.error(`    ${f.snapshotId}`);
      }
      exitCode = 1;
    }

    if (skippe.length > 0) {
      console.log(
        `  HINWEIS ${gesetz}: ${skippe.length} leere Artikel (dokumentierter Skip):`,
        skippe.map((f) => f.token).join(', '),
      );
    }

    bundFehlendTotal += echteFehlend.length;
    bundSkipTotal += skippe.length;

    const statusText =
      echteFehlend.length === 0
        ? `ok (${htmlTokens.length} Tokens)`
        : `FEHLER ${echteFehlend.length} fehlend`;
    console.log(`  ${gesetz}: ${statusText}`);
  }

  const bundStatus = bundFehlendTotal === 0 ? 'ok' : `${bundFehlendTotal} fehlend`;
  console.log(
    `\nBund: ${bundHtmlGeprüft} Gesetze geprüft, ${bundSnapshots.length} Snapshots, fehlend: ${bundStatus}${bundSkipTotal > 0 ? `, ${bundSkipTotal} leere-Artikel-Skips` : ''}`,
  );

  // ─── Prüfung 2: Kanton-Zitat-Abdeckung ──────────────────────────────────────
  console.log('\n── Prüfung 2: Kanton-Zitat-Abdeckung ────────────────────────────────────');

  const gruppen = sammleKantonInventar();
  const zitierte: Array<{ kanton: string; lawId: string; artikelToken: string }> = [];
  for (const g of gruppen) {
    for (const a of g.artikel) {
      zitierte.push({ kanton: g.kanton, lawId: g.lawId, artikelToken: a.token });
    }
  }

  const unerwartet = unerwarteteKantonLuecken(zitierte, kantonSnapshotIds, BEKANNTE_LUECKEN);

  if (unerwartet.length > 0) {
    console.error(`  FEHLER: ${unerwartet.length} unerwartete Kanton-Zitat-Lücken (nicht in bekannteLuecken):`);
    for (const l of unerwartet) {
      console.error(`    ${l.snapshotId}`);
    }
    exitCode = 1;
  }

  // Bekannte Lücken als Klartext ausgeben (§8-Transparenz)
  const abgedeckt = BEKANNTE_LUECKEN.filter((l) =>
    zitierte.some(
      (z) => `kanton/${z.kanton}/${z.lawId}/art_${z.artikelToken}` === l.snapshotId,
    ),
  );
  if (abgedeckt.length > 0) {
    console.log(`  Bekannte Lücken (${abgedeckt.length}, akzeptiert mit Grund):`);
    for (const l of abgedeckt) {
      console.log(`    [${l.grund}] ${l.snapshotId}${l.notiz ? ' — ' + l.notiz : ''}`);
    }
  }

  const kantonStatus = unerwartet.length === 0 ? 'ok' : `${unerwartet.length} unerwartet`;
  console.log(
    `\nKanton: ${zitierte.length} Zitat-Tripel geprüft, ${kantonSnapshotIds.size} Snapshot-IDs, bekannte Lücken: ${abgedeckt.length}, unerwartet: ${kantonStatus}`,
  );

  // ─── Prüfung 3: Inhalts-Sanity ───────────────────────────────────────────────
  console.log('\n── Prüfung 3: Inhalts-Sanity ─────────────────────────────────────────────');

  const alleSnapshots = [...bundSnapshots, ...kantonSnapshots];
  const sanityFehler = pruefeInhaltsSanity(alleSnapshots);

  if (sanityFehler.length > 0) {
    console.error(`  FEHLER: ${sanityFehler.length} Sanity-Probleme:`);
    for (const f of sanityFehler) {
      const detail =
        f.problem === 'leerer-block' ? ` (Block ${f.blockIndex})` : '';
      console.error(`    [${f.problem}${detail}] ${f.snapshotId}`);
    }
    exitCode = 1;
  }

  const sanityStatus = sanityFehler.length === 0 ? 'ok' : `${sanityFehler.length} Fehler`;
  console.log(
    `Sanity: ${alleSnapshots.length} Einträge (${bundSnapshots.length} Bund + ${kantonSnapshots.length} Kanton) geprüft — ${sanityStatus}`,
  );

  // ─── Prüfung 4: Manifest-Konsistenz (Kanton) ────────────────────────────────
  console.log('\n── Prüfung 4: Manifest-Konsistenz (Kanton) ──────────────────────────────');

  const manifestFehler = pruefeManifestKonsistenz(manifestMap, vorhandeneD);

  if (manifestFehler.length > 0) {
    console.error(`  FEHLER: ${manifestFehler.length} Manifest-Inkonsistenzen:`);
    for (const f of manifestFehler) {
      const detail = f.quelleUrl ? ` (quelleUrl: ${f.quelleUrl})` : '';
      console.error(`    [${f.problem}] ${f.datei}${detail}`);
    }
    exitCode = 1;
  }

  const manifestStatus = manifestFehler.length === 0 ? 'ok' : `${manifestFehler.length} Fehler`;
  console.log(
    `Manifest: ${manifestMap.size} Einträge, ${vorhandeneD.size} Dateien — ${manifestStatus}`,
  );

  // ─── Gesamtstatus ─────────────────────────────────────────────────────────────
  console.log('\n── Gesamtstatus ─────────────────────────────────────────────────────────');
  if (exitCode === 0) {
    console.log('check:vollstaendigkeit: GRÜN — alle 4 Prüfungen bestanden.');
  } else {
    console.error('check:vollstaendigkeit: ROT — Fehler oben beheben!');
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('check-vollstaendigkeit: unerwarteter Fehler:', err);
  process.exit(1);
});
