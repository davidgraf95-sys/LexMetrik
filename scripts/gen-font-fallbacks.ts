// Rank 11 (QS-PERF): metrik-angepasste Fallback-Fonts GENERIEREN.
//
// Misst aus den ECHTEN latin-woff2 (fontsource) die Font-Metriken und leitet mit
// @capsizecss die size-adjust/ascent-/descent-/line-gap-override ab, sodass der
// System-Fallback (Arial für Geist-Sans, Georgia für Source Serif 4) VOR dem Laden
// des Webfonts denselben Platz belegt wie der Webfont danach → font-display:swap
// erzeugt keinen Reflow-Sprung mehr (CLS-Sekundärfix, §15/2).
//
// Ausgabe (stdout) ist REPRODUZIERBAR: die @font-face-Regeln + Stack-Strings werden
// 1:1 (CSS-only, kein Runtime-Dep) nach src/index.css übernommen. «Messen, nicht
// annehmen» (§7): geänderte Webfont-Version → Script neu laufen lassen.
//
//   npx vite-node scripts/gen-font-fallbacks.ts
import { readFileSync } from 'node:fs';
import { fromBuffer } from '@capsizecss/unpack';
import { createFontStack } from '@capsizecss/core';
import arial from '@capsizecss/metrics/arial';
import georgia from '@capsizecss/metrics/georgia';

const FILES = {
  geist: 'node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2',
  serif: 'node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2',
};

async function metriken(pfad: string) {
  return fromBuffer(readFileSync(pfad));
}

async function main() {
  const geist = await metriken(FILES.geist);
  const serif = await metriken(FILES.serif);

  console.log('// gemessen:', geist.familyName, 'unitsPerEm', geist.unitsPerEm, '| capHeight', geist.capHeight);
  console.log('// gemessen:', serif.familyName, 'unitsPerEm', serif.unitsPerEm, '| capHeight', serif.capHeight);
  console.log();

  const sans = createFontStack([geist, arial]);
  const serifStack = createFontStack([serif, georgia]);

  console.log('/* ── SANS (Geist → Arial-Fallback) ── */');
  console.log('fontFamily:', sans.fontFamily);
  console.log(sans.fontFaces);
  console.log();
  console.log('/* ── SERIF (Source Serif 4 → Georgia-Fallback) ── */');
  console.log('fontFamily:', serifStack.fontFamily);
  console.log(serifStack.fontFaces);
}

main().catch((e) => { console.error(e); process.exit(1); });
