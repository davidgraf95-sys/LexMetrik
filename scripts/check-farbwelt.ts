// ─── Farbwelt-Mess-Tor (DESIGN-REGLEMENT §13/F2, FAHRPLAN-DESIGN-WAERME D-0) ──
//
// Das harte Kontrast-/Farbklima-Tor VOR jeder Wert-Änderung an der Farbwelt
// (E5 «Messung vor Geschmack»). Ohne dieses Script ist jedes «Kontrast-Gate»
// der Folge-Einheiten (D-1…D-8) Prosa — die axe-e2e-Stichprobe fängt Nicht-Text-
// Kontraste (WCAG 1.4.11) nicht, und dokumentierte Zahlen dürfen nie
// stillschweigend falsch werden (Fixpunkt 2 / D3/F6).
//
// QUELLE (deterministisch, §2 — kein Netz, keine Uhr, kein Zufall):
//   • `src/index.css`      — die :root- und html.dark-Token sind die WERTE.
//   • `tailwind.config.js` — Name→var()-Abbildung; Drift-Wächter, dass jedes
//     geprüfte Farb-Token als Utility überhaupt existiert (sonst stiller No-op).
//
// PRÜFUNGEN (Spec D-0):
//   (a) WCAG-Paare hell+dunkel als FAIL — Text ≥4.5:1, Nicht-Text/Zustände ≥3:1.
//       Die in den CSS-Kommentaren dokumentierten Paar-Listen sind Assertions.
//   (b) OKLCH Hue-Drift je Familie ≤~8° + L-Monotonie je Rampe — ERSTLAUF WARNUNG
//       (die Ist-ink-/brass-Mitten reissen die Schranke heute; erst D-4/D-5
//       legen die Sollwerte fest, dann scharf schalten).
//   (c) Dunkel-Rezept: Flächen-L-Leiter well<paper<surface<raised = FAIL-Regel;
//       Chroma-Dämpfung Akzent (dunkel C ≤ hell −10 %) = WARNUNG (D-4/D-5-Ziel).
//   (d) APCA-Spalte NUR beratend (Lc), nie Fail.
//   + REFERENZWERTE (C-1/C-2/C-3 Farb-Wörterbuch §4b-B + --paper-Fixpunkte):
//       Regressions-Referenz — Drift über Toleranz = FAIL (Zahlen dürfen nie
//       stillschweigend falsch werden).
//   + BEKANNTE RISSE (D-1-Input): heute unter der Schwelle liegende Paare —
//       WARNUNG + Fail NUR bei Verschlechterung (Baseline-Guard), damit das Tor
//       auf dem IST-Stand grün ist, ohne die Risse zu verstecken.
//
// Lauf:  npm run check:farbwelt   (Teil von check:seriell → check-parallel → gate).
import { readFileSync } from 'node:fs';
import { converter, parse, wcagContrast } from 'culori';
import { calcAPCA } from 'apca-w3';
import tw from '../tailwind.config.js';

const CSS = 'src/index.css';
const toRgb = converter('rgb');
const toOklab = converter('oklab');
const toOklch = converter('oklch');

type Farbe = { mode: 'rgb'; r: number; g: number; b: number; alpha: number };

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

function loeseFarbe(raw: string, tokens: Map<string, string>, seen = new Set<string>()): Farbe {
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

function ueber(fg: Farbe, bg: Farbe): Farbe {
  const a = fg.alpha;
  return { mode: 'rgb', r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), alpha: 1 };
}

type Mode = 'hell' | 'dunkel';
function tokensOf(mode: Mode): Map<string, string> { return mode === 'hell' ? ROOT : DARK; }

/** Kontrast fg-Token gegen bg-Token; transluzente Werte werden korrekt über
 *  das Grund-Papier des Modus komponiert. */
function kontrast(fg: string, bg: string, mode: Mode): number {
  const t = tokensOf(mode);
  const basis = ueber(loeseFarbe(t.get('paper')!, t), { mode: 'rgb', r: 1, g: 1, b: 1, alpha: 1 });
  let bgC = loeseFarbe(t.get(bg) ?? bg, t);
  if (bgC.alpha < 1) bgC = ueber(bgC, basis);
  let fgC = loeseFarbe(t.get(fg) ?? fg, t);
  if (fgC.alpha < 1) fgC = ueber(fgC, bgC);
  return wcagContrast(fgC, bgC);
}

function hex(c: Farbe): string {
  const h = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, '0');
  return `#${h(c.r)}${h(c.g)}${h(c.b)}`.toUpperCase();
}
function oklchOf(token: string, mode: Mode) {
  const t = tokensOf(mode);
  const c = loeseFarbe(t.get(token)!, t);
  return { l: toOklab(c).l, ...toOklch(c) } as { l: number; c: number; h: number | undefined };
}

// ── 3 · Assertion-Tabellen ───────────────────────────────────────────────────
const fehler: string[] = [];
const warnungen: string[] = [];

// (a) WCAG-PFLICHTPAARE — heute erfüllt, FAIL bei Unterschreitung.
type Paar = { fg: string; bg: string; min: number; art: 'Text' | 'Nicht-Text'; quelle: string };
const TEXT = (fg: string, bg: string, quelle: string): Paar => ({ fg, bg, min: 4.5, art: 'Text', quelle });
const NICHT = (fg: string, bg: string, quelle: string): Paar => ({ fg, bg, min: 3.0, art: 'Nicht-Text', quelle });
const PFLICHT: Paar[] = [
  // Sekundär-/Meta-/Feinschrift-Basis (lc-overline/lc-fineprint/lc-notice = ink-600)
  TEXT('ink-600', 'well', 'lc-overline/lc-fineprint (index.css:350/374)'),
  TEXT('ink-600', 'paper', 'ink-600 Sekundärtext'),
  TEXT('ink-600', 'surface', 'ink-600 auf Karte'),
  // Tertiärtext ink-500 (NICHT auf well — dort 4.48 = bekannter Riss, s. u.)
  TEXT('ink-500', 'paper', 'ink-500 Tertiärtext (D-4-Referenz)'),
  TEXT('ink-500', 'surface', 'ink-500 auf Karte (index.css: D-5-Referenz 5.01)'),
  TEXT('placeholder', 'well', 'lc-input::placeholder (index.css:37/164)'),
  // Messing-Text/Links
  TEXT('brass-700', 'paper', 'a/--accent-text (index.css:90/214)'),
  TEXT('brass-700', 'surface', 'brass-700 auf Karte'),
  TEXT('brass-700', 'well', 'brass-700 auf Eingabefeld'),
  TEXT('brass-800', 'brass-100', 'lc-highlight .lc-overline (index.css:649/65)'),
  // Status-Badge-Text auf Tönungsfläche
  TEXT('sage-700', 'sage-bg', 'lc-badge-ok (index.css:525)'),
  TEXT('slate-700', 'slate-bg', 'lc-badge-soft (index.css:537)'),
  TEXT('warn-700', 'warn-bg', 'lc-badge-warn (index.css:528)'),
  TEXT('danger-700', 'danger-bg', 'lc-badge-danger (index.css:536)'),
  // Nicht-Text: Fokus-Ring (--focus) auf allen drei Flächen (WCAG 1.4.11)
  NICHT('focus', 'paper', '--focus Ring (index.css:91-95/187-189)'),
  NICHT('focus', 'surface', '--focus Ring auf Karte'),
  NICHT('focus', 'well', '--focus Ring auf Eingabefeld'),
  // Nicht-Text: Akzent-Oberkanten (lc-akzent-*) auf Karte
  NICHT('brass-line', 'surface', 'lc-akzent-brass (index.css:402)'),
  NICHT('warn-line', 'surface', 'lc-akzent-warn (index.css:403)'),
  NICHT('danger-line', 'surface', 'lc-akzent-danger (index.css:404/193)'),
  // D-1.3: sage/slate-Linien-Aliasse (dunkel auf -700 gehoben) — Nicht-Text-
  // Kanten/Balken greifen den Alias, nie -500 direkt.
  NICHT('sage-line', 'surface', 'D-1.3 border-sage-line (Patientenverfügung u. a.)'),
  NICHT('slate-line', 'surface', 'D-1.3 --slate-line-Alias'),
  NICHT('danger-line', 'paper', 'D-1.3 border-t-danger-line/SperrtageZaehler-Balken'),
];

// (Referenz) C-1/C-2/C-3-Farb-Wörterbuch (§4b-B) — dokumentierte Zahlen als
// Regressions-Referenz; Drift > Toleranz = FAIL.
type Ref = { fg: string; bg: string; hell: number; dunkel: number; quelle: string };
const REF_TOL = 0.06;
const REFERENZ: Ref[] = [
  { fg: 'slate-500', bg: 'well', hell: 4.81, dunkel: 3.47, quelle: 'C-1 lc-chip-entscheid Tick (§4b-B)' },
  { fg: 'warn-700', bg: 'well', hell: 5.24, dunkel: 9.43, quelle: 'C-2 Currency-Chip warn (§4b-B)' },
  { fg: 'brass-700', bg: 'well', hell: 4.91, dunkel: 10.48, quelle: 'C-3 brass-Tick (§4b-B)' },
];

// (Fixpunkt) --paper hell/dunkel sind unantastbare Anker (Fixpunkt 1).
const FIXPUNKT: { token: string; mode: Mode; soll: string }[] = [
  { token: 'paper', mode: 'hell', soll: '#FAF8F2' },
  { token: 'paper', mode: 'dunkel', soll: '#16150F' },
];

// (Baseline) BEKANNTE RISSE (D-1-Input): heute unter Schwelle → WARNUNG, FAIL nur
// bei Verschlechterung gegenüber dem gemessenen Ist-Wert (Baseline-Guard).
const BASELINE_TOL = 0.03;
const RISSE: { fg: string; bg: string; mode: Mode; schwelle: number; ist: number; tag: string }[] = [
  { fg: 'ink-500', bg: 'well', mode: 'hell', schwelle: 4.5, ist: 4.48, tag: 'D-4 (ink-Wärme: ink-500 ≥4.5 auf well)' },
  // D-1.3 ✅: alle direkten Nicht-Text-Call-Sites von danger-500 sind auf
  // --danger-line aliassiert (dunkel = -700, 7.54:1) — das Token-PAAR bleibt
  // als Baseline-Guard, bis D-4/D-5 die -500-Mitte selbst kalibriert.
  { fg: 'danger-500', bg: 'paper', mode: 'dunkel', schwelle: 3.0, ist: 2.72, tag: 'D-1.3 Call-Sites aliassiert (--danger-line); Token-Paar bis D-4/D-5' },
];

// ── 4 · tailwind.config-Drift-Wächter: jedes geprüfte Token muss als Utility
//        existieren (sonst stiller No-op, F7). ────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const twColors: Record<string, any> = (tw as any).theme?.extend?.colors ?? {};
const CONFIG_TOKENS = new Set<string>();
for (const [fam, val] of Object.entries(twColors)) {
  if (val && typeof val === 'object') for (const s of Object.keys(val)) CONFIG_TOKENS.add(s === 'DEFAULT' ? fam : `${fam}-${s}`);
  else CONFIG_TOKENS.add(fam);
}
// Semantische :root-Aliase, die bewusst kein Utility sind (nur via var() genutzt).
const ALIAS = new Set(['focus', 'placeholder', 'brass-line', 'warn-line', 'danger-line', 'auf-gold']);
function pruefeConfig(token: string) {
  if (ALIAS.has(token) || CONFIG_TOKENS.has(token)) return;
  fehler.push(`Config-Drift: Token «${token}» wird geprüft, fehlt aber in tailwind.config.js (stiller Utility-No-op, F7).`);
}

// ── 5 · Ausführung ───────────────────────────────────────────────────────────
console.log('Farbwelt-Tor (D-0) — WCAG hell+dunkel · OKLCH-Struktur · APCA beratend\n');

// (a) Pflichtpaare
for (const p of PFLICHT) {
  pruefeConfig(p.fg); pruefeConfig(p.bg);
  for (const mode of ['hell', 'dunkel'] as Mode[]) {
    const k = kontrast(p.fg, p.bg, mode);
    if (k < p.min - 1e-9)
      fehler.push(`WCAG ${p.art} ${p.fg}/${p.bg} ${mode}: ${k.toFixed(2)}:1 < ${p.min}:1 — ${p.quelle}`);
  }
}

// Referenzwerte
for (const r of REFERENZ) {
  for (const mode of ['hell', 'dunkel'] as Mode[]) {
    const soll = mode === 'hell' ? r.hell : r.dunkel;
    const ist = kontrast(r.fg, r.bg, mode);
    if (Math.abs(ist - soll) > REF_TOL)
      fehler.push(`Referenz-Drift ${r.fg}/${r.bg} ${mode}: ${ist.toFixed(2)}:1 ≠ dokumentiert ${soll.toFixed(2)}:1 (±${REF_TOL}) — ${r.quelle}. Zahl in DESIGN-REGLEMENT-NORMTEXT §4b-B nachziehen.`);
  }
}

// Fixpunkte
for (const f of FIXPUNKT) {
  const t = tokensOf(f.mode);
  const ist = hex(loeseFarbe(t.get(f.token)!, t));
  if (ist !== f.soll.toUpperCase())
    fehler.push(`Fixpunkt verletzt: --${f.token} ${f.mode} = ${ist} ≠ ${f.soll} (unantastbarer Anker, FAHRPLAN Fixpunkt 1).`);
}

// Bekannte Risse (Baseline-Guard)
for (const r of RISSE) {
  const ist = kontrast(r.fg, r.bg, r.mode);
  const marke = ist < r.schwelle ? 'RISS' : 'geheilt';
  warnungen.push(`[${marke}] ${r.fg}/${r.bg} ${r.mode}: ${ist.toFixed(2)}:1 (Ziel ${r.schwelle}:1) — ${r.tag}`);
  if (ist < r.ist - BASELINE_TOL)
    fehler.push(`Verschlechterung ${r.fg}/${r.bg} ${r.mode}: ${ist.toFixed(2)}:1 < Baseline ${r.ist.toFixed(2)}:1 — bekannter Riss darf nicht tiefer sinken (${r.tag}).`);
}

// (c) Dunkel-Rezept: Flächen-L-Leiter well<paper<surface<raised — FAIL-Regel.
for (const mode of ['hell', 'dunkel'] as Mode[]) {
  const leiter = ['well', 'paper', 'surface', 'paper-raised'];
  const Ls = leiter.map((t) => oklchOf(t, mode).l);
  for (let i = 1; i < Ls.length; i++)
    if (!(Ls[i] > Ls[i - 1]))
      fehler.push(`Flächen-L-Leiter ${mode}: ${leiter[i - 1]}(L${Ls[i - 1].toFixed(3)}) ≥ ${leiter[i]}(L${Ls[i].toFixed(3)}) — Erhebungs-Logik verletzt (D-0c/D-6).`);
}

// (b) OKLCH Hue-Drift + L-Monotonie je Familie — ERSTLAUF WARNUNG.
const FAMILIEN: Record<string, string[]> = {
  ink: ['ink-900', 'ink-800', 'ink-700', 'ink-600', 'ink-500', 'ink-400', 'ink-300'],
  brass: ['brass-800', 'brass-700', 'brass-600', 'brass-500', 'brass-400', 'brass-300'],
};
const HUE_DRIFT_MAX = 8;
for (const [fam, toks] of Object.entries(FAMILIEN)) {
  for (const mode of ['hell', 'dunkel'] as Mode[]) {
    const oks = toks.map((t) => oklchOf(t, mode));
    const hues = oks.map((o) => o.h).filter((h): h is number => h != null && Number.isFinite(h));
    if (hues.length) {
      const spanne = Math.max(...hues) - Math.min(...hues);
      if (spanne > HUE_DRIFT_MAX)
        warnungen.push(`[b] Hue-Drift ${fam} ${mode}: ${spanne.toFixed(1)}° > ${HUE_DRIFT_MAX}° — EIN Ziel-Hue je Achse (D-4). Erstlauf beratend.`);
    }
    // L-Monotonie: -900 dunkelste Stufe (Text) … monoton fallende L Richtung -300.
    const Ls = oks.map((o) => o.l);
    for (let i = 1; i < Ls.length; i++)
      if (mode === 'hell' ? Ls[i] <= Ls[i - 1] : Ls[i] >= Ls[i - 1]) {
        warnungen.push(`[b] L-Monotonie ${fam} ${mode}: bei ${toks[i - 1]}→${toks[i]} nicht monoton — Rampe (D-4/D-5). Erstlauf beratend.`);
        break;
      }
  }
}

// (c) Chroma-Dämpfung Akzent: dunkel C ≤ hell −10 % — WARNUNG (D-4/D-5-Ziel).
for (const tok of FAMILIEN.brass) {
  const ch = oklchOf(tok, 'hell').c, cd = oklchOf(tok, 'dunkel').c;
  if (cd > ch * 0.9 + 1e-9)
    warnungen.push(`[c] Chroma-Dämpfung ${tok}: dunkel C${cd.toFixed(3)} > hell C${ch.toFixed(3)} −10 % — Akzent dunkel zu bunt (D-4/D-5). Erstlauf beratend.`);
}

// (d) APCA-Spalte — NUR beratend (Lc), nie Fail.
const APCA_PROBEN: { fg: string; bg: string; label: string; ziel: number }[] = [
  { fg: 'ink-900', bg: 'paper', label: 'Fliesstext', ziel: 75 },
  { fg: 'ink-600', bg: 'paper', label: 'Meta/Sekundär', ziel: 60 },
  { fg: 'brass-700', bg: 'paper', label: 'Link/Akzent', ziel: 60 },
  { fg: 'focus', bg: 'paper', label: 'Nicht-Text Fokus', ziel: 45 },
];
const apcaZeilen: string[] = [];
for (const a of APCA_PROBEN) {
  for (const mode of ['hell', 'dunkel'] as Mode[]) {
    const t = tokensOf(mode);
    const basis = ueber(loeseFarbe(t.get('paper')!, t), { mode: 'rgb', r: 1, g: 1, b: 1, alpha: 1 });
    let bgC = loeseFarbe(t.get(a.bg) ?? a.bg, t); if (bgC.alpha < 1) bgC = ueber(bgC, basis);
    let fgC = loeseFarbe(t.get(a.fg) ?? a.fg, t); if (fgC.alpha < 1) fgC = ueber(fgC, bgC);
    const lc = Number(calcAPCA(hex(fgC), hex(bgC)));
    const mk = Math.abs(lc) >= a.ziel ? 'ok ' : '—  ';
    apcaZeilen.push(`    ${mk} ${a.label.padEnd(18)} ${a.fg}/${a.bg} ${mode.padEnd(6)} Lc ${lc.toFixed(1).padStart(6)} (Ziel |Lc|≥${a.ziel})`);
  }
}

// ── 6 · Bericht ──────────────────────────────────────────────────────────────
if (warnungen.length) {
  console.log(`WARNUNGEN (beratend, kein Tor — D-1/D-4/D-5-Input, ${warnungen.length}):`);
  for (const w of warnungen) console.log('  · ' + w);
  console.log('');
}
console.log('APCA (beratend, KEIN Tor — WCAG 2.2 ist das Gate):');
for (const z of apcaZeilen) console.log(z);
console.log('');

if (fehler.length) {
  console.error(`Farbwelt-Tor ROT — ${fehler.length} harte(r) Verstoss/Verstösse (DESIGN-REGLEMENT §13/F2):`);
  for (const f of fehler) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log(
  `Farbwelt-Tor ok — ${PFLICHT.length * 2} WCAG-Pflichtpaare (hell+dunkel), ` +
  `${REFERENZ.length * 2} Referenzwerte (§4b-B), ${FIXPUNKT.length} Fixpunkte, ` +
  `Flächen-L-Leiter beide Modi. ${warnungen.length} beratende Warnung(en) offen (D-1/D-4/D-5).`,
);
