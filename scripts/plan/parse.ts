// scripts/plan/parse.ts
import { parseEtikett, type Etikett } from './etikett';

export type Checkbox = '[ ]' | '[x]' | '[~]' | '[d]' | null;
export interface Einheit {
  id: string;
  etikett: Etikett;
  checkbox: Checkbox;
  sektion: string;
  /** 0-basierte Position in der ROADMAP-Dokumentreihenfolge = die Bau-Reihenfolge.
   *  Ohne dieses Feld sortiert next.ts lexikografisch und macht damit alle
   *  ready-Einheiten gleichrangig — «oberster offener Schritt» wird unbeantwortbar. */
  pos: number;
}

function checkboxAus(zeile: string): Checkbox {
  const m = zeile.match(/^\s*[-*+]\s*\[([ xX~Dd])\]/);
  return m ? (`[${m[1].toLowerCase()}]` as Checkbox) : null;
}

export function parseRoadmap(md: string): { einheiten: Einheit[]; blockers: Record<string, string> } {
  const zeilen = md.split(/\r?\n/);
  const einheiten: Einheit[] = [];
  const blockers: Record<string, string> = {};
  let sektion = '';
  let imBlockers = false;

  for (let i = 0; i < zeilen.length; i++) {
    const z = zeilen[i];
    if (z.startsWith('## ')) {
      // Sektion = Überschriftstext ohne Marker/Emoji und ohne Tail (— … / *(…)*)
      sektion = z.replace(/^##+\s+/, '').replace(/^[⚡🚀▶■\s]+/u, '').replace(/\s+—.*$/, '').replace(/\s+\*.*$/, '').trim();
    }
    if (z.trim().startsWith('<!-- @blockers')) {
      imBlockers = !z.includes('-->');
      if (!imBlockers) {
        const innen = z.replace(/.*<!--\s*@blockers/, '').replace(/-->.*/, '');
        for (const teil of innen.split(/[;\n]/)) {
          const bm = teil.match(/^\s*([^:]+):\s*(.+)$/);
          if (bm) blockers[bm[1].trim()] = bm[2].trim();
        }
      }
      continue;
    }
    if (imBlockers) {
      if (z.trim().startsWith('-->')) { imBlockers = false; continue; }
      const bm = z.match(/^\s*([^:]+):\s*(.*)$/);
      if (bm) blockers[bm[1].trim()] = bm[2].trim();
      continue;
    }
    if (z.includes('<!-- @meta')) {
      const etikett = parseEtikett(z);
      // Checkbox aus der nächsten nicht-leeren Zeile DARÜBER
      let cb: Checkbox = null;
      for (let j = i - 1; j >= 0; j--) {
        if (zeilen[j].trim() === '') continue;
        cb = checkboxAus(zeilen[j]);
        break;
      }
      einheiten.push({ id: etikett.id, etikett, checkbox: cb, sektion, pos: einheiten.length });
    }
  }
  return { einheiten, blockers };
}
