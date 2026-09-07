// Rank 11 (QS-PERF): metrik-angepasste Fallback-Fonts GENERIEREN.
//
// Misst aus den ECHTEN latin-woff2 (fontsource) die Font-Metriken und leitet mit
// @capsizecss die size-adjust/ascent-/descent-/line-gap-override ab, sodass der
// System-Fallback (Arial für Archivo-Sans, Georgia für Literata) VOR dem Laden
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
import timesNewRoman from '@capsizecss/metrics/timesNewRoman';

// W2·24-DESIGN-IDENTITAET R1 (6.9.2026): Geist → Archivo (Bedienung),
// Source Serif 4 → Literata (Lesetext). Gemessen wird die `wght`-Achse des
// latin-Subsets — genau die Datei, die der Browser für deutschen Text lädt.
const FILES = {
  sans: 'node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2',
  serif: 'node_modules/@fontsource-variable/literata/files/literata-latin-wght-normal.woff2',
};

async function metriken(pfad: string) {
  return fromBuffer(readFileSync(pfad));
}

async function main() {
  const archivo = await metriken(FILES.sans);
  const serif = await metriken(FILES.serif);

  console.log('// gemessen:', archivo.familyName, 'unitsPerEm', archivo.unitsPerEm, '| capHeight', archivo.capHeight);
  console.log('// gemessen:', serif.familyName, 'unitsPerEm', serif.unitsPerEm, '| capHeight', serif.capHeight);
  console.log();

  const sans = createFontStack([archivo, arial]);
  const serifStack = createFontStack([serif, georgia]);
  // Linux-Härtung (R5-Forensik 19.7.2026, gilt für Literata unverändert): das
  // CI-Image hat KEIN Georgia → der Georgia-getunte Fallback greift dort NICHT,
  // generic `serif` = Liberation Serif (Times-Metrik, schmal) trägt untuned die
  // Lesespalte → zu viele Zeichen pro Zeile. Liberation Serif / Tinos sind
  // metrik-IDENTISCH zu Times New Roman (wie Arimo/Liberation Sans zu Arial) →
  // Times-New-Roman-Metrik ist der korrekte capsize-Proxy für die Laufweite.
  const serifTimesStack = createFontStack([serif, timesNewRoman]);

  console.log('/* ── SANS (Archivo → Arial-Fallback) ── */');
  console.log('fontFamily:', sans.fontFamily);
  console.log(sans.fontFaces);
  console.log();
  console.log('/* ── SERIF (Literata → Georgia-Fallback) ── */');
  console.log('fontFamily:', serifStack.fontFamily);
  console.log(serifStack.fontFaces);
  console.log();
  console.log('/* ── SERIF-TIMES (Literata → Times/Liberation-Serif-Fallback) ── */');
  console.log('fontFamily:', serifTimesStack.fontFamily);
  console.log(serifTimesStack.fontFaces);
}

main().catch((e) => { console.error(e); process.exit(1); });
