// scripts/fahrplan-slice.ts
// QS-TOK / FAHRPLAN-TOKEN-OEKONOMIE.md §3 T3 «FAHRPLAN-§-Slice statt Ganzdatei».
//
// Ein Bau-Agent braucht selten die ganze (oft > 100 KB) FAHRPLAN-Datei, sondern
// Kopf + §0 (Quer-Lektionen) + die zuständigen §§. Diese CLI druckt deterministisch
// genau das — plus IMMER das vollständige ##/###-Inventar (ToC, K §3 T3: gegen
// Querkontext-Blindheit). «Ganzdatei bei Unklarheit» bleibt der Rückfall.
//
//   npm run fahrplan -- <FAHRPLAN-Datei> <§...>
//   npm run fahrplan -- FAHRPLAN-GESETZES-UX.md 10          → Kopf + §0 + §10 + ToC
//   npm run fahrplan -- FAHRPLAN-TOKEN-OEKONOMIE.md §3 §8   → Kopf + §0/Stand + §3 + §8
//   npm run fahrplan -- FAHRPLAN-GESETZES-UX.md 10.7        → Unter-§ (### 10.7)
//   npm run fahrplan -- FAHRPLAN-X.md                       → nur Kopf + §0 + ToC
//
// Verschiedene FAHRPLAN-Dateien nummerieren unterschiedlich (`## §1`, `## 1 ·`,
// `### 10.7`). Der Matcher normalisiert: führendes «§» und Whitespace weg, dann
// Vergleich des ersten Wort-Tokens der Überschrift.
import { readFileSync } from 'node:fs';

export interface Heading {
  level: number; // 2 = ##, 3 = ###
  title: string; // Text nach «## »
  token: string; // erstes Wort, ohne führendes «§» (z. B. «10», «3», «10.7», «0b»)
  start: number; // Byte-/Zeichen-Offset der Überschrift im Volltext
}

const HEADING_RE = /^(#{2,3}) (.*)$/gm;

/** Normalisiert einen §-Schlüssel: «§10» → «10», « 3 » → «3». */
export function normKey(s: string): string {
  return s.trim().replace(/^§/, '').trim();
}

export function headings(md: string): Heading[] {
  const out: Heading[] = [];
  for (const m of md.matchAll(HEADING_RE)) {
    const title = m[2];
    const token = normKey(title.split(/\s+/)[0] ?? '');
    out.push({ level: m[1].length, title, token, start: m.index ?? 0 });
  }
  return out;
}

/** Ende-Offset einer Sektion: nächste Überschrift mit Level ≤ dem eigenen. */
function sektionEnde(hs: Heading[], i: number, laenge: number): number {
  for (let j = i + 1; j < hs.length; j++) {
    if (hs[j].level <= hs[i].level) return hs[j].start;
  }
  return laenge;
}

export interface SliceResult {
  text: string;
  gefunden: string[]; // aufgelöste Token
  fehlend: string[]; // angefragte, nicht gefundene Token
}

/**
 * Baut den Slice: Kopf (vor erster Überschrift) + §0-Sektion (falls vorhanden)
 * + Ziel-§§ + vollständiges ToC. Alle Sektionen VERBATIM (byte-treu).
 */
export function slice(md: string, keys: string[], datei = 'FAHRPLAN'): SliceResult {
  const hs = headings(md);
  const kopf = hs.length ? md.slice(0, hs[0].start) : md;

  // Immer mitliefern: eine «0»-Sektion (Quer-Lektionen / §0-Regeln), sofern vorhanden.
  const stets = hs.filter((h) => h.level === 2 && h.token === '0');
  const gewuenscht = keys.map(normKey).filter(Boolean);

  const gefunden: string[] = [];
  const fehlend: string[] = [];
  const gewaehlt: Heading[] = [...stets];
  for (const k of gewuenscht) {
    const h = hs.find((x) => x.token === k);
    if (h) {
      if (!gewaehlt.includes(h)) gewaehlt.push(h);
      gefunden.push(k);
    } else {
      fehlend.push(k);
    }
  }
  // Nach Dokumentreihenfolge sortieren, Duplikate raus.
  const einzig = [...new Set(gewaehlt)].sort((a, b) => a.start - b.start);

  // ToC = vollständiges ##/###-Inventar (K §3 T3).
  const toc = hs
    .map((h) => `${h.level === 3 ? '  - ' : '- '}${'#'.repeat(h.level)} ${h.title}`)
    .join('\n');

  const teile: string[] = [];
  teile.push(
    `> **§-Slice von \`${datei}\`** (deterministisch, QS-TOK/T3). Enthalten: ` +
      `Kopf${stets.length ? ' + §0' : ''}${
        gefunden.length ? ' + §' + gefunden.join(' §') : ''
      }. **Ganzdatei bei Unklarheit:** \`cat ${datei}\` bzw. den ganzen §.` +
      (fehlend.length ? ` ⚠️ Nicht gefunden: ${fehlend.join(', ')}.` : ''),
  );
  teile.push(`\n## Inhalt — vollständiges ##/###-Inventar\n\n${toc}\n`);
  teile.push(`\n---\n\n${kopf.trimEnd()}\n`);
  for (const h of einzig) {
    teile.push(`\n${md.slice(h.start, sektionEnde(hs, hs.indexOf(h), md.length)).trimEnd()}\n`);
  }
  return { text: teile.join('\n'), gefunden, fehlend };
}

// CLI
if (!process.env.VITEST) {
  const [datei, ...keys] = process.argv.slice(2).filter((a) => a !== '--');
  if (!datei) {
    console.error(
      'Aufruf: npm run fahrplan -- <FAHRPLAN-Datei> [<§...>]\n' +
        '  z. B. npm run fahrplan -- FAHRPLAN-GESETZES-UX.md 10',
    );
    process.exit(2);
  }
  let md: string;
  try {
    md = readFileSync(datei, 'utf8');
  } catch (e) {
    console.error(`Datei nicht lesbar: ${datei} — ${(e as Error).message}`);
    process.exit(2);
  }
  const res = slice(md, keys, datei);
  process.stdout.write(res.text);
  if (res.fehlend.length) process.exitCode = 1;
}
