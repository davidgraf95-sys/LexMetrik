// scripts/plan/etikett.ts
export type Status = 'ready' | 'wip' | 'blocked' | 'done' | 'parked';
export const STATUS_WERTE: readonly Status[] = ['ready', 'wip', 'blocked', 'done', 'parked'];

export interface Etikett {
  id: string;
  status: Status;
  statusAgent: string | null;
  of: boolean;
  blocker: string | null;
  dep: string[];
  kollision: string[];
  worktree: boolean;
  asset26x: boolean;
  fahrplan: string | null;
}

function ja(v: string): boolean {
  if (v === 'ja') return true;
  if (v === 'nein') return false;
  throw new Error(`@meta: erwartet ja/nein, bekam "${v}"`);
}
function liste(v: string): string[] {
  const innen = v.trim().replace(/^\[/, '').replace(/\]$/, '').trim();
  return innen === '' ? [] : innen.split(',').map((s) => s.trim());
}
function nullbar(v: string): string | null {
  return v === 'null' ? null : v;
}

export function parseEtikett(line: string): Etikett {
  const m = line.match(/<!--\s*@meta\s+(.*?)\s*-->/);
  if (!m) throw new Error(`Keine @meta-Zeile: ${line}`);
  const feld: Record<string, string> = {};
  for (const teil of m[1].split(' · ')) {
    const i = teil.indexOf(': ');
    if (i < 0) throw new Error(`@meta: Feld ohne ': ' → "${teil}"`);
    feld[teil.slice(0, i).trim()] = teil.slice(i + 2).trim();
  }
  const sm = (feld.status ?? '').match(/^(\w+)(?:\((.*)\))?$/);
  if (!sm) throw new Error(`@meta: Status unlesbar "${feld.status}"`);
  const status = sm[1] as Status;
  if (!STATUS_WERTE.includes(status)) throw new Error(`@meta: ungültiger Status "${status}"`);
  const noetig = ['id', 'status', 'of', 'blocker', 'dep', 'kollision', 'worktree', '26x'];
  for (const k of noetig) if (!(k in feld)) throw new Error(`@meta: Feld "${k}" fehlt`);
  return {
    id: feld.id,
    status,
    statusAgent: sm[2] ?? null,
    of: ja(feld.of),
    blocker: nullbar(feld.blocker),
    dep: liste(feld.dep),
    kollision: liste(feld.kollision),
    worktree: ja(feld.worktree),
    asset26x: ja(feld['26x']),
    fahrplan: 'fahrplan' in feld ? nullbar(feld.fahrplan) : null,
  };
}

export function serializeEtikett(e: Etikett, indent: string): string {
  const st = e.statusAgent ? `${e.status}(${e.statusAgent})` : e.status;
  const teile = [
    `id: ${e.id}`,
    `status: ${st}`,
    `of: ${e.of ? 'ja' : 'nein'}`,
    `blocker: ${e.blocker ?? 'null'}`,
    `dep: [${e.dep.join(', ')}]`,
    `kollision: [${e.kollision.join(', ')}]`,
    `worktree: ${e.worktree ? 'ja' : 'nein'}`,
    `26x: ${e.asset26x ? 'ja' : 'nein'}`,
  ];
  if (e.fahrplan) teile.push(`fahrplan: ${e.fahrplan}`);
  return `${indent}<!-- @meta ${teile.join(' · ')} -->`;
}
