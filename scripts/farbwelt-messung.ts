// ─── Farbwelt-Maschine: Token-Extraktion und Wert-Auflösung ─────────────────
//
// Aus `scripts/check-farbwelt.ts` herausgelöst (31.8.2026, W2·20 —
// Steuerungs-Flächendeckel `scripts/check-*.ts`, CLAUDE.md §17-Gegengewicht).
// Die Trennlinie ist inhaltlich, nicht mechanisch:
//
//   · HIER steht, WIE eine Farbe entsteht und gemessen wird — die :root-/
//     html.dark-Token aus `src/index.css`, die Auflösung von var(),
//     color-mix(in srgb|oklab), transparent und hex, die Alpha-Komposition und
//     die Metriken (WCAG-Kontrast, hex, OKLCh).
//   · IN `farbwelt-tabellen.ts` steht, WAS geprüft wird (Pflichtpaare,
//     Referenzwerte, Fixpunkte, bekannte Risse, Familien, APCA-Proben).
//   · IN `check-farbwelt.ts` steht das TOR — Ausführung, Fail/Warn-Politik,
//     Bericht, Exit-Code.
//
// Zweck, Quellen und die Prüf-Spezifikation (D-0) stehen unverändert im Kopf
// von `scripts/check-farbwelt.ts`; sie gelten für diese Maschine.
//
// GRENZE (§8, ehrlich): dieses Modul liest `src/index.css` BEIM IMPORT (ROOT/
// DARK sind Modul-Konstanten) — unverändert gegenüber dem früheren Einzel-
// Skript. Es ist damit kein seiteneffektfreier Import, sondern ein
// Lade-Zeitpunkt-Lesevorgang ohne Netz, Uhr und Zufall (§2 bleibt gewahrt).

import { readFileSync } from 'node:fs';
import { converter, parse, wcagContrast } from 'culori';

const CSS = 'src/index.css';
const toRgb = converter('rgb');
const toOklab = converter('oklab');
const toOklch = converter('oklch');

export type Farbe = { mode: 'rgb'; r: number; g: number; b: number; alpha: number };

// ── 1 · Token-Extraktion aus index.css (:root + html.dark) ───────────────────
function ausschnitt(css: string, selektor: string): string {
  // Findet `<selektor> {` und liefert den Inhalt bis zur passenden `}`.
  const start = css.indexOf(selektor);
  if (start < 0) throw new Error(`check-farbwelt: Selektor «${selektor}» nicht in ${CSS} gefunden.`);
  let i = css.indexOf('{', start);
  let tiefe = 0;
  const von = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === '{') tiefe++;
    else if (css[i] === '}') { tiefe--; if (tiefe === 0) return css.slice(von, i); }
  }
  throw new Error(`check-farbwelt: Block «${selektor}» nicht geschlossen.`);
}

function tokenMap(block: string): Map<string, string> {
  const m = new Map<string, string>();
  // Nur Deklarationen der obersten Ebene (keine verschachtelten Regeln): jede
  // `--name: wert;`-Zeile. color-mix()-Werte enthalten kein `;` bis zum Ende.
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let x: RegExpExecArray | null;
  while ((x = re.exec(block)) !== null) m.set(x[1], x[2].trim());
  return m;
}

const css = readFileSync(CSS, 'utf8');
const rootBlock = ausschnitt(css, ':root');
const darkBlock = ausschnitt(css, 'html.dark');
const ROOT = tokenMap(rootBlock);
const DARK = new Map([...ROOT, ...tokenMap(darkBlock)]); // dark = root, überschrieben

// ── 2 · Wert-Auflösung: var(), color-mix(in srgb|oklab), transparent, hex ─────
function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let tiefe = 0, akt = '';
  for (const ch of s) {
    if (ch === '(') tiefe++;
    else if (ch === ')') tiefe--;
    if (ch === sep && tiefe === 0) { out.push(akt); akt = ''; }
    else akt += ch;
  }
  out.push(akt);
  return out;
}

function loesePercent(tok: string, tokens: Map<string, string>): number {
  tok = tok.trim();
  const varM = tok.match(/^var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)$/);
  if (varM) {
    const v = tokens.get(varM[1]) ?? varM[2];
    if (v == null) throw new Error(`check-farbwelt: Prozent-Var --${varM[1]} unauflösbar.`);
    return loesePercent(v, tokens);
  }
  const m = tok.match(/^([\d.]+)%$/);
  if (!m) throw new Error(`check-farbwelt: kein Prozentwert: «${tok}».`);
  return parseFloat(m[1]) / 100;
}

function mischeInRaum(cA: Farbe, pA: number, cB: Farbe, pB: number, raum: string): Farbe {
  // color-mix: premultiplizierte Alpha im angegebenen Raum (CSS-konform).
  const sum = pA + pB || 1;
  pA /= sum; pB /= sum;
  const aOut = pA * cA.alpha + pB * cB.alpha;
  const kanal = (a: number, b: number) => (aOut === 0 ? 0 : (pA * cA.alpha * a + pB * cB.alpha * b) / aOut);
  if (raum === 'oklab') {
    const oa = toOklab(cA), ob = toOklab(cB);
    const gemischt = { mode: 'oklab' as const, l: kanal(oa.l, ob.l), a: kanal(oa.a, ob.a), b: kanal(oa.b, ob.b), alpha: aOut };
    const r = toRgb(gemischt);
    return { mode: 'rgb', r: r.r, g: r.g, b: r.b, alpha: aOut };
  }
  // srgb: gamma-kodierte sRGB-Kanäle (CSS «in srgb»).
  return { mode: 'rgb', r: kanal(cA.r, cB.r), g: kanal(cA.g, cB.g), b: kanal(cA.b, cB.b), alpha: aOut };
}

const TRANSPARENT: Farbe = { mode: 'rgb', r: 0, g: 0, b: 0, alpha: 0 };

export function loeseFarbe(raw: string, tokens: Map<string, string>, seen = new Set<string>()): Farbe {
  raw = raw.trim();
  if (raw === 'transparent') return TRANSPARENT;
  const varM = raw.match(/^var\(\s*--([\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (varM) {
    const name = varM[1];
    if (seen.has(name)) throw new Error(`check-farbwelt: Zyklus bei --${name}.`);
    const v = tokens.get(name) ?? varM[2];
    if (v == null) throw new Error(`check-farbwelt: Farb-Var --${name} unauflösbar.`);
    return loeseFarbe(v, tokens, new Set([...seen, name]));
  }
  if (raw.startsWith('color-mix(')) {
    const inner = raw.slice(raw.indexOf('(') + 1, raw.lastIndexOf(')'));
    const teile = splitTop(inner, ',').map((t) => t.trim());
    const raum = teile[0].replace(/^in\s+/, '').trim();
    const args = teile.slice(1).map((arg) => {
      const worte = arg.split(/\s+/).filter(Boolean);
      let pct: number | null = null, farbe = '';
      for (const w of worte) {
        if (/%$/.test(w) || /^var\(--[\w-]+\)$/.test(w) && tokens.get(w.slice(6, -1))?.endsWith('%')) {
          pct = loesePercent(w, tokens);
        } else farbe += (farbe ? ' ' : '') + w;
      }
      return { farbe: loeseFarbe(farbe, tokens, seen), pct };
    });
    // Fehlende Prozente füllen sich zum Rest auf 100 %.
    const bekannt = args.reduce((s, a) => s + (a.pct ?? 0), 0);
    const offen = args.filter((a) => a.pct == null).length;
    for (const a of args) if (a.pct == null) a.pct = offen ? (1 - bekannt) / offen : 0;
    return mischeInRaum(args[0].farbe, args[0].pct!, args[1].farbe, args[1].pct!, raum);
  }
  const p = parse(raw);
  if (!p) throw new Error(`check-farbwelt: unparsbare Farbe «${raw}».`);
  const r = toRgb(p);
  return { mode: 'rgb', r: r.r, g: r.g, b: r.b, alpha: r.alpha ?? 1 };
}

export function ueber(fg: Farbe, bg: Farbe): Farbe {
  const a = fg.alpha;
  return { mode: 'rgb', r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), alpha: 1 };
}

export type Mode = 'hell' | 'dunkel';
export function tokensOf(mode: Mode): Map<string, string> { return mode === 'hell' ? ROOT : DARK; }

/** Kontrast fg-Token gegen bg-Token; transluzente Werte werden korrekt über
 *  das Grund-Papier des Modus komponiert. */
export function kontrast(fg: string, bg: string, mode: Mode): number {
  const t = tokensOf(mode);
  const basis = ueber(loeseFarbe(t.get('paper')!, t), { mode: 'rgb', r: 1, g: 1, b: 1, alpha: 1 });
  let bgC = loeseFarbe(t.get(bg) ?? bg, t);
  if (bgC.alpha < 1) bgC = ueber(bgC, basis);
  let fgC = loeseFarbe(t.get(fg) ?? fg, t);
  if (fgC.alpha < 1) fgC = ueber(fgC, bgC);
  return wcagContrast(fgC, bgC);
}

export function hex(c: Farbe): string {
  const h = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase();
}
export function oklchOf(token: string, mode: Mode) {
  const t = tokensOf(mode);
  const c = loeseFarbe(t.get(token)!, t);
  // Das vorangestellte `l: toOklab(c).l` war TOTER CODE: der nachfolgende Spread
  // überschrieb es (TS2783, sichtbar erst seit QS-TYP-LUECKE 15.8.2026). Der
  // gelieferte Wert ändert sich dadurch NICHT — OKLCh ist die Polarform von
  // OKLab und trägt dasselbe L. Weg damit, damit die Zeile sagt, was sie tut.
  return { ...toOklch(c) } as { l: number; c: number; h: number | undefined };
}
