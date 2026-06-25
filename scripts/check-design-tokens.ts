// ─── Token-Schranke (DESIGN-REGLEMENT B2/D2/E1, §13) ────────────────────────
// Macht die Typo-Skala-Disziplin aus «Konvention» zu «erzwungen»: verbietet in
// src/**/*.{ts,tsx} die Tailwind-Default-Grössen (text-sm/lg/xl…) und ROHE
// absolute Arbitrary-Grössen (text-[12px] / text-[1.1rem]). Erlaubt bleiben:
//   · die hauseigene Skala (micro/xs/body-s/base/body-l/h3/h2/h1/display)
//   · token-/var-basierte Grössen  text-[length:var(--…)]   (z. B. --fs-*, --rsp-fs)
//   · relative Grössen             text-[0.62em] / text-[90%]   (kontextrelativ)
// Lauf:  npm run check:design-tokens   (Teil von `npm run check` → gate voll).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = 'src';

// Tailwind-Default-Schriftgrössen, die NICHT in der Skala stehen (tailwind.config.js
// definiert micro/overline/xs/body-s/body-l/h3/h2/h1/display(-l); base/xs bleiben
// als Default zulässig). Verboten: sm, lg und alle *xl-Stufen.
const DEFAULT_GROESSE = /\btext-(sm|lg|[2-9]?xl)\b/;
// Rohe absolute Arbitrary-Grösse: text-[<zahl>px|rem]. var()/length:var/em/% bleiben frei.
const ROH_ABSOLUT = /text-\[[0-9.]+(?:px|rem)\]/;

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
      fehler.push(`${datei}:${i + 1} — Tailwind-Default-Grösse (text-sm/lg/xl…). Stattdessen die Skala (text-body-s/body-l/h3…) oder text-[length:var(--fs-*)].`);
    if (ROH_ABSOLUT.test(zeile))
      fehler.push(`${datei}:${i + 1} — rohe Arbitrary-Grösse text-[…px|rem]. Wert als Token in index.css (--fs-*) führen und text-[length:var(--fs-*)] nutzen.`);
  });
}

if (fehler.length > 0) {
  console.error(`Token-Schranke ROT — ${fehler.length} Off-Scale-Grösse(n) (DESIGN-REGLEMENT B2/§13):`);
  for (const f of fehler) console.error('  ' + f);
  process.exit(1);
}
console.log('Token-Schranke ok — keine Off-Scale-Schriftgrössen in src/.');
