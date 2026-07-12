// ─── Seed: Grundart-Klassifikation → Register-Datengrundlage (G0, W2·5d) ──────
//
// Liest die Grundarten-Klassifikation (docs/ux-audit-2026-07/erlass-klassifikation.json,
// 1460 Erlasse, 8 Grundarten, Signal `paragrafZaehlung`) und schreibt daraus die
// generierte Datengrundlage src/lib/normtext/grundart.generated.ts (GRUNDART_SEED),
// gematcht per `key`. register.ts merged daraus `grundart`/`erlassTyp` in die
// Erlass-Einträge; das kantonale `bestimmungsEtikett` (§/Art.-Label) liegt hier
// bereit für die spätere Grundart-Darstellung (G3a), trägt `entwurf`, bis es pro
// Kanton gegen die amtliche Quelle verifiziert ist (K6/§8).
//
// WICHTIG (K2/R8): `bestimmungsEtikett` ist NUR ein sichtbares Label — NIE der
// Anker. Die Anker-`id` bleibt überall `art-<token>` (parts.tsx:183).
//
// Regenerieren:  node scripts/normtext/seed-grundart.mjs
// Reine Daten (§3), kein Render — golden byte-gleich.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, '..', '..');
const QUELLE = join(WURZEL, 'docs/ux-audit-2026-07/erlass-klassifikation.json');
const KANTON_SNAPSHOTS = join(WURZEL, 'public/normtext/kanton');
const ZIEL = join(WURZEL, 'src/lib/normtext/grundart.generated.ts');

const GRUNDARTEN = new Set([
  'KODIFIKATION', 'STANDARD_ERLASS', 'ERLASS_MIT_ANHANG', 'FLACHER_KURZERLASS',
  'STAATSVERTRAG', 'KANTON', 'PDF_EMBED', 'LIVE_VERWEIS',
]);

// Grenzfälle (Spec §9, aus JSON.grenzfaelle): diese Schlüssel MÜSSEN KODIFIKATION
// sein (Umfang schlägt Hierarchie-Tiefe); ZPO/StPO/ParlG/VTS/KVV/BVG/IVG/AHVG sind
// zusätzlich KODIFIKATION-mit-Anhang (hatAnhang → Anhang-Rendering in G3b).
const GRENZFALL_KODIFIKATION = new Set([
  'STPO', 'SCHKG', 'ZPO', 'PARLG', 'VTS', 'KVV', 'BVG', 'IVG', 'AHVG',
]);

/** ErlassTyp deterministisch aus Grundart/Titel/Kürzel ableiten (behebt den
 *  Heuristik-Bug «Verordnung als Bundesgesetz betitelt», §5.1). Best-effort;
 *  das Kopf-Label wird erst in G2b daraus gezogen. */
function erlassTypAbleiten(e) {
  if (e.grundart === 'STAATSVERTRAG') return 'staatsvertrag';
  const t = `${e.titel ?? ''}`;
  const k = `${e.kuerzel ?? ''}`;
  const heu = `${t} ${k}`;
  if (/(^|\s)Verfassung|Bundesverfassung|Kantonsverfassung/i.test(heu) || /^(BV|KV|Cst)\b/.test(k)) {
    return 'verfassung';
  }
  // Völkerrechtliche Träger vor Gesetz/Verordnung (auch wenn als PDF_EMBED geführt).
  if (/Übereinkommen|Abkommen|Konvention|Pakt|Charta|Protokoll|Übereinkunft|Vereinbarung/i.test(heu)) {
    return 'staatsvertrag';
  }
  if (/Verordnung|Reglement|Verfügung/i.test(heu)) return 'verordnung';
  if (/Gesetz|Dekret|Ordnung|Statut|Vertrag/i.test(heu)) {
    return 'gesetz';
  }
  return 'sonstiges';
}

/** §-vs-Art.-Etikett aus der GESPEICHERTEN amtlichen Fassung ableiten (Arbiter,
 *  Gegenprüfungs-Befund 4.7.2026): Mehrheit der Dispositiv-`artikelLabel` («§ 1»
 *  vs. «Art. 1») im Kanton-Snapshot. «Anhang Ziff.»-Einträge zählen NICHT mit —
 *  genau daran verzählte sich das Audit-Signal `paragrafZaehlung` bei ZH-243
 *  (NotGebV: 18 §-Bestimmungen + 132 Anhang-Ziffern → Signal fälschlich false).
 *  Rückgabe null, wenn kein Snapshot/keine §-oder-Art.-Labels (→ Signal-Fallback). */
function etikettAusSnapshot(key) {
  const pfad = join(KANTON_SNAPSHOTS, `${key}.json`);
  if (!existsSync(pfad)) return null;
  let daten;
  try {
    daten = JSON.parse(readFileSync(pfad, 'utf8'));
  } catch {
    return null;
  }
  const eintraege = Array.isArray(daten?.eintraege) ? daten.eintraege : [];
  let par = 0;
  let art = 0;
  for (const e of eintraege) {
    const label = typeof e?.artikelLabel === 'string' ? e.artikelLabel : '';
    if (/^§/.test(label)) par += 1;
    else if (/^Art\.?\s/i.test(label) || /^Art\.?$/i.test(label)) art += 1;
  }
  if (par === 0 && art === 0) return null;
  return par > art ? 'paragraf' : 'art';
}

function main() {
  const roh = JSON.parse(readFileSync(QUELLE, 'utf8'));
  const zuordnung = roh.zuordnung;
  if (!Array.isArray(zuordnung) || zuordnung.length !== roh.gesamtErlasse) {
    throw new Error(`seed-grundart: zuordnung (${zuordnung?.length}) ≠ gesamtErlasse (${roh.gesamtErlasse})`);
  }

  const eintraege = [];
  const gesehen = new Set();
  for (const e of zuordnung) {
    if (!GRUNDARTEN.has(e.grundart)) {
      throw new Error(`seed-grundart: ungültige grundart «${e.grundart}» bei ${e.key}`);
    }
    if (gesehen.has(e.key)) throw new Error(`seed-grundart: doppelter key «${e.key}»`);
    gesehen.add(e.key);

    // Grenzfall-Wächter: garantiert die KODIFIKATION-Zuordnung (Drift bräche hier).
    if (GRENZFALL_KODIFIKATION.has(e.key) && e.grundart !== 'KODIFIKATION') {
      throw new Error(`seed-grundart: Grenzfall ${e.key} erwartet KODIFIKATION, ist «${e.grundart}»`);
    }

    const rec = { grundart: e.grundart };
    const typ = erlassTypAbleiten(e);
    if (typ) rec.erlassTyp = typ;
    // hatAnhang-Hinweis für KODIFIKATION-mit-Anhang / ERLASS_MIT_ANHANG (G3b).
    if (e.signale?.hatAnhang === true) rec.hatAnhang = true;
    // Kanton: §-vs-Art.-Etikett. Arbiter = gespeicherte amtliche Fassung
    // (Snapshot-Label-Mehrheit, Dispositiv), Fallback = Audit-Signal
    // paragrafZaehlung. Seed = entwurf, bis pro Kanton verifiziert (K6/§8).
    if (e.ebene === 'kanton' || e.grundart === 'KANTON') {
      const ausSnapshot = etikettAusSnapshot(e.key);
      const ausSignal = e.signale?.paragrafZaehlung === true ? 'paragraf' : 'art';
      rec.bestimmungsEtikett = ausSnapshot ?? ausSignal;
      rec.bestimmungsEtikettStatus = 'entwurf';
      if (ausSnapshot && ausSnapshot !== ausSignal) {
        console.log(`  Korrektur (Snapshot > Signal): ${e.key} → ${ausSnapshot}`);
      }
    }
    eintraege.push([e.key, rec]);
  }

  // Deterministisch sortieren (stabile Diffs unabhängig von JSON-Reihenfolge).
  eintraege.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const zeilen = eintraege.map(([key, rec]) => {
    return `  ${JSON.stringify(key)}: ${JSON.stringify(rec)},`;
  });

  const verteilung = {};
  for (const [, rec] of eintraege) verteilung[rec.grundart] = (verteilung[rec.grundart] ?? 0) + 1;
  const verteilungKommentar = Object.entries(verteilung)
    .sort((a, b) => b[1] - a[1])
    .map(([g, n]) => `//   ${g}: ${n}`)
    .join('\n');

  const out = `// AUTO-GENERIERT von scripts/normtext/seed-grundart.mjs — NICHT von Hand editieren.
// Grundart-Klassifikation (${eintraege.length} Erlasse) aus der UX-Audit-Klassifikation
// docs/ux-audit-2026-07/erlass-klassifikation.json (Methode: ${roh.methode ?? 'n/a'}).
// Datengrundlage für register.ts (grundart/erlassTyp) + die spätere Grundart-
// Darstellung (bestimmungsEtikett, §/Art.-Label — NUR sichtbar, NIE Anker; K2/R8).
// Kantonales bestimmungsEtikett trägt entwurf, bis pro Kanton verifiziert (K6/§8).
// Regenerieren:  node scripts/normtext/seed-grundart.mjs
//
// Grundart-Verteilung:
${verteilungKommentar}
import type { Grundart, ErlassTyp } from './register-typen';

export interface GrundartSeed {
  grundart: Grundart;
  erlassTyp?: ErlassTyp;
  /** Anhang-Rendering (annex_*) nötig — für G3b (Risiko-Pfad). */
  hatAnhang?: boolean;
  /** Nur Kanton: §-vs-Art.-Etikett (Arbiter: Snapshot-Label-Mehrheit der
   *  gespeicherten amtlichen Fassung; Fallback: Audit-Signal paragrafZaehlung).
   *  NUR Label, NIE Anker (K2). */
  bestimmungsEtikett?: 'art' | 'paragraf';
  /** entwurf bis Kanton-Verifikation gegen die amtliche Quelle (K6/§8). */
  bestimmungsEtikettStatus?: 'entwurf';
}

/** key → Grundart-Seed. Match per key gegen das Erlass-Register (§5). */
export const GRUNDART_SEED: Readonly<Record<string, GrundartSeed>> = {
${zeilen.join('\n')}
};
`;

  writeFileSync(ZIEL, out, 'utf8');
  console.log(`seed-grundart: ${eintraege.length} Einträge → ${ZIEL}`);
  console.log('Verteilung:', verteilung);
}

main();
