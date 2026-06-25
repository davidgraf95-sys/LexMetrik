// ─── Token-Schranke (DESIGN-REGLEMENT B2/D2/F7/E1, §13) ─────────────────────
// Macht die Token-Disziplin aus «Konvention» zu «erzwungen». Zwei Prüfungen:
//
//  1) TYPO (B2): keine Tailwind-Default-Grössen (text-sm/lg/xl…) und keine ROHEN
//     absoluten Arbitrary-Grössen (text-[12px] / text-[1.1rem]). Erlaubt: die
//     hauseigene Skala, token-/var-basierte Grössen text-[length:var(--…)] und
//     relative em/% (kontextrelativ).
//
//  2) FARBE (F7): jede genutzte Farb-Utility (bg-/text-/border-/ring-… einer
//     hauseigenen Farbfamilie) muss in tailwind.config.js existieren — sonst
//     generiert Tailwind die Klasse STILL nicht (No-op). Genau diese Bug-Klasse
//     (bg-brass-50 / border-brass-300) erscheint sonst gar nicht im UI (F6/F7).
//
// Lauf:  npm run check:design-tokens   (Teil von `npm run check` → gate voll).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import tw from '../tailwind.config.js';

const WURZEL = 'src';

// ── Typo-Regeln ──
const DEFAULT_GROESSE = /\btext-(sm|lg|[2-9]?xl)\b/;
const ROH_ABSOLUT = /text-\[[0-9.]+(?:px|rem)\]/;

// ── Farb-Regel: gültige <familie>[-<stufe>] aus der Config ableiten ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const farben: Record<string, any> = (tw as any).theme?.extend?.colors ?? {};
const GUELTIG = new Set<string>();            // z. B. "brass-100", "line", "line-strong"
for (const [fam, val] of Object.entries(farben)) {
  if (val && typeof val === 'object') {
    for (const stufe of Object.keys(val)) GUELTIG.add(stufe === 'DEFAULT' ? fam : `${fam}-${stufe}`);
  } else {
    GUELTIG.add(fam);                          // skalare Familie (z. B. well)
  }
}
const FAMILIEN = Object.keys(farben).join('|');
// Utility-Präfixe, die eine Farbe tragen:
const PRAEFIX = 'bg|text|border|ring|from|via|to|divide|outline|fill|stroke|decoration|placeholder|caret|accent|ring-offset';
// Fängt <praefix>-<familie>[-<stufe>] (Stufe optional = DEFAULT); /<alpha> wird ignoriert.
const FARB_RE = new RegExp(`\\b(?:${PRAEFIX})-(${FAMILIEN})(?:-([a-z0-9.]+))?(?:/[0-9.]+)?\\b`, 'g');

function dateien(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { out.push(...dateien(p)); continue; }
    if (/\.(ts|tsx)$/.test(e) && !/\.test\.(ts|tsx)$/.test(e)) out.push(p);
  }
  return out;
}

const fehler: string[] = [];
for (const datei of dateien(WURZEL)) {
  const zeilen = readFileSync(datei, 'utf8').split('\n');
  zeilen.forEach((zeile, i) => {
    if (DEFAULT_GROESSE.test(zeile))
      fehler.push(`${datei}:${i + 1} — Tailwind-Default-Grösse (text-sm/lg/xl…). Stattdessen die Skala oder text-[length:var(--…)].`);
    if (ROH_ABSOLUT.test(zeile))
      fehler.push(`${datei}:${i + 1} — rohe Arbitrary-Grösse text-[…px|rem]. Wert als Token (--…) führen und text-[length:var(--…)] nutzen.`);
    let m: RegExpExecArray | null;
    FARB_RE.lastIndex = 0;
    while ((m = FARB_RE.exec(zeile)) !== null) {
      const token = m[2] ? `${m[1]}-${m[2]}` : m[1];     // familie-stufe bzw. familie (DEFAULT)
      if (!GUELTIG.has(token))
        fehler.push(`${datei}:${i + 1} — Farb-Utility «${m[0]}» → Stufe «${token}» fehlt in tailwind.config.js (stiller No-op, F7). Existierende Stufe nutzen oder Token ergänzen.`);
    }
  });
}

if (fehler.length > 0) {
  console.error(`Token-Schranke ROT — ${fehler.length} Verstoss/Verstösse (DESIGN-REGLEMENT B2/F7/§13):`);
  for (const f of fehler) console.error('  ' + f);
  process.exit(1);
}
console.log(`Token-Schranke ok — Typo-Skala sauber, alle Farb-Utilities in der Config (${GUELTIG.size} gültige Stufen).`);
