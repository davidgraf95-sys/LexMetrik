// scripts/plan/check.ts
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { parseRoadmap, type Einheit } from './parse';
import { INVENTAR } from './inventar';

export interface Problem { id: string | null; meldung: string }

// Archiv-Backlog (Stand 1.7.2026): FAHRPLAN-*.md, die historisch nicht aus ROADMAP.md
// verlinkt sind (Archiv-Kandidaten, s. ROADMAP «Strang-Detailpunkte»). Grandfathered, damit
// der Link-Check NEU hinzugefügte/referenzierte unverlinkte FAHRPLAN rot meldet, ohne die
// Altlast jedesmal rotzumachen. Beim Archivieren/Verlinken einer Datei hier streichen.
const ARCHIV_BACKLOG = new Set<string>([
  'FAHRPLAN-BEURKUNDUNGS-AUSBAU.md',
  'FAHRPLAN-BGE-DARSTELLUNG-EINHEITLICH.md',
  'FAHRPLAN-BGER-RECHTSWEG.md',
  'FAHRPLAN-FALL-RUECKGRAT.md',
  'FAHRPLAN-FUNDAMENT-UMBAU.md',
  'FAHRPLAN-GMBH-GRUENDUNG.md',
  'FAHRPLAN-GRUNDLAGEN.md',
  'FAHRPLAN-INTERNATIONAL-VOLLTEXT.md',
  'FAHRPLAN-KANTONALE-ENTSCHEIDE.md',
  'FAHRPLAN-LUECKEN-SCHLIESSEN.md',
  'FAHRPLAN-NOTARIAT-GRUNDBUCH.md',
  'FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md',
  'FAHRPLAN-RECHTSPRECHUNG.md',
  'FAHRPLAN-VERTRAGS-VARIANTEN.md',
]);

const CHECKBOX_STATUS: Record<string, string[]> = {
  '[x]': ['done'],
  '[~]': ['wip'],
  '[ ]': ['ready', 'blocked', 'parked'],
};

function zyklus(einheiten: Einheit[]): string | null {
  const dep = new Map(einheiten.map((e) => [e.id, e.etikett.dep]));
  const farbe = new Map<string, number>(); // 0=weiss 1=grau 2=schwarz
  let fund: string | null = null;
  const dfs = (id: string) => {
    if (fund) return;
    farbe.set(id, 1);
    for (const d of dep.get(id) ?? []) {
      const f = farbe.get(d) ?? 0;
      if (f === 1) { fund = d; return; }
      if (f === 0 && dep.has(d)) dfs(d);
    }
    farbe.set(id, 2);
  };
  for (const e of einheiten) if ((farbe.get(e.id) ?? 0) === 0) dfs(e.id);
  return fund;
}

export function pruefe(
  md: string,
  fahrplanDateien: string[],
  fileExists: (p: string) => boolean,
  inventar: readonly string[] = INVENTAR,
): Problem[] {
  const probleme: Problem[] = [];
  const { einheiten, blockers } = parseRoadmap(md);
  const vorhanden = new Set(einheiten.map((e) => e.id));

  // (1) Inventar-Abdeckung + keine Doppel
  for (const id of inventar) if (!vorhanden.has(id)) probleme.push({ id, meldung: `Inventar-ID "${id}" hat kein @meta` });
  const zaehl = new Map<string, number>();
  for (const e of einheiten) zaehl.set(e.id, (zaehl.get(e.id) ?? 0) + 1);
  for (const [id, n] of zaehl) if (n > 1) probleme.push({ id, meldung: `id "${id}" mehrfach etikettiert` });
  const invSet = new Set(inventar);
  for (const e of einheiten) if (!invSet.has(e.id)) probleme.push({ id: e.id, meldung: `@meta "${e.id}" ist nicht im Inventar (verwaist)` });

  for (const e of einheiten) {
    const t = e.etikett;
    // (2) Checkbox-Kopplung nur bei vorhandener Checkbox
    if (e.checkbox && !CHECKBOX_STATUS[e.checkbox].includes(t.status)) {
      probleme.push({ id: e.id, meldung: `Checkbox ${e.checkbox} passt nicht zu status ${t.status}` });
    }
    // (3) blocker-Konsistenz
    if ((t.status === 'blocked' || t.status === 'parked')) {
      if (!t.blocker) probleme.push({ id: e.id, meldung: `status ${t.status} ohne blocker` });
      else if (!Object.prototype.hasOwnProperty.call(blockers, t.blocker)) probleme.push({ id: e.id, meldung: `blocker "${t.blocker}" nicht im @blockers-Register` });
    }
    if (t.status === 'ready' && t.blocker) probleme.push({ id: e.id, meldung: `status ready aber blocker gesetzt` });
    // (4) dep-IDs existieren
    for (const d of t.dep) if (!vorhanden.has(d)) probleme.push({ id: e.id, meldung: `dep "${d}" existiert nicht` });
    // (6) kollision-Pfade existieren (Globs: nur einfache Existenz des Pfads bzw. Verzeichnis-Präfix)
    for (const k of t.kollision) {
      const basis = k.replace(/[*?{[].*$/, '');
      if (!fileExists(basis)) probleme.push({ id: e.id, meldung: `kollision-Pfad "${k}" existiert nicht` });
    }
  }
  // (4b) Azyklie
  const z = zyklus(einheiten);
  if (z) probleme.push({ id: z, meldung: `dep-Graph hat einen Zyklus bei "${z}"` });
  // (5) max. ein 26x auf wip
  const wip26 = einheiten.filter((e) => e.etikett.asset26x && e.etikett.status === 'wip');
  if (wip26.length > 1) probleme.push({ id: null, meldung: `zwei 26×-Assets gleichzeitig wip: ${wip26.map((e) => e.id).join(', ')}` });
  // (7) FAHRPLAN-Link-Check (eingegliedertes QS-PH)
  for (const f of fahrplanDateien) if (!md.includes(f)) probleme.push({ id: null, meldung: `${f} ist nicht aus ROADMAP.md verlinkt` });

  return probleme;
}

// CLI
if (!process.env.VITEST) {
  const md = readFileSync('ROADMAP.md', 'utf8');
  // FAHRPLAN-Link-Check (QS-PH): JEDE FAHRPLAN-*.md im Repo-Wurzel muss aus ROADMAP.md
  // verlinkt sein — AUSSER den in ARCHIV_BACKLOG grandfatherten Altlasten (Archiv-Kandidaten).
  // So meldet der Check eine NEU hinzugefügte/neu referenzierte unverlinkte FAHRPLAN rot,
  // ohne die historische Altlast jedesmal rotzumachen.
  const alle = readdirSync('.').filter((f) => /^FAHRPLAN-.*\.md$/.test(f));
  const zuPruefen = alle.filter((f) => !ARCHIV_BACKLOG.has(f));
  let probleme: Problem[];
  try {
    probleme = pruefe(md, zuPruefen, (p) => existsSync(p));
  } catch (e) {
    console.error('check:plan ROT:\n  - (global): @meta nicht lesbar — ' + (e as Error).message);
    process.exit(1);
  }
  if (probleme.length) {
    console.error('check:plan ROT:');
    for (const p of probleme) console.error(`  - ${p.id ?? '(global)'}: ${p.meldung}`);
    process.exit(1);
  }
  console.log('check:plan grün.');
}
