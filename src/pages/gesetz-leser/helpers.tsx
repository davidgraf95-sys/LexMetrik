import type { ReactNode } from 'react';
import type { Sektion, Fussnote } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';

export function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

export function passtAufSuche(e: NormSnapshot, s: string): boolean {
  if (e.artikelLabel.toLowerCase().includes(s)) return true;
  return e.bloecke.some((b) =>
    b.text.toLowerCase().includes(s) || (b.items ?? []).some((it) => it.text.toLowerCase().includes(s)));
}

// «Erster Titel: Die Entstehung …» → {pre:'Erster Titel', rest:'Die Entstehung …'}
export function romanFrei(label: string): { pre: string; rest: string } {
  const m = label.match(/^([^:]+):\s*(.+)$/);
  return m ? { pre: m[1].trim(), rest: m[2].trim() } : { pre: '', rest: label };
}

// Pfad (Sektions-ids Wurzel→Treffer) zur ersten Sektion, die das Prädikat erfüllt.
export function pfadZu(sektionen: Sektion[], treffer: (s: Sektion) => boolean): string[] | null {
  for (const s of sektionen) {
    if (treffer(s)) return [s.id];
    const sub = pfadZu(s.kinder, treffer);
    if (sub) return [s.id, ...sub];
  }
  return null;
}

// Fussnoten-Text mit klickbaren AS/BBl-Verweisen (die Label-Vorkommen werden
// durch Anker ersetzt). Reine Darstellung.
export function escRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function fnTextMitLinks(fn: Fussnote): ReactNode {
  if (!fn.links.length) return fn.text;
  const map = new Map(fn.links.map((l) => [l.label, l.url]));
  const re = new RegExp(`(${[...map.keys()].sort((a, b) => b.length - a.length).map(escRe).join('|')})`, 'g');
  return fn.text.split(re).map((t, i) => map.has(t)
    ? <a key={i} href={map.get(t)} target="_blank" rel="noopener noreferrer" className="text-brass-700/90 hover:text-brass-700 hover:underline">{t}</a>
    : t);
}

// Randtitel-Stufe einheitlich formatieren (Auftrag 6a, David 26.6.2026 «un-
// einheitliche Bold-Formatierung»). Zwei stabile Rollen statt der früheren
// Positions-Logik `i === marg.length-1`:
//   • Das BLATT (unterste gezeigte Stufe = die eigentliche Sachüberschrift des
//     Artikels) ist IMMER prominent — auch wenn es allein steht. Das ist der
//     Normalfall: ~83 % der Randtitel sind eine einzige Sachüberschrift (oft
//     ohne Aufzähler, z. B. «Gegenstand und Geltungsbereich»); die dürfen nicht
//     zu einem blassen Abschnittslabel verkümmern.
//   • Die darüberliegenden VORFAHREN sind ruhiger Kontext, einheitlich je
//     ABSOLUTER Gliederungstiefe (0 = Abschnitt «A.» uppercase, tiefer schlicht)
//     — so flippt kein Vorfahre mehr zwischen den Artikeln (Befund: «II. Hand-
//     lungsfähigkeit» mal fett, mal klein). Reine Darstellung (§3), zur Laufzeit
//     abgeleitet aus Delta-Offset + Position (kein Massen-Regen, F3).
export function margStufeStil(level: number, istBlatt: boolean): string {
  if (istBlatt) return 'text-base font-semibold text-ink-800';
  if (level <= 0) return 'text-body-s font-medium uppercase tracking-wide text-ink-500';
  return 'text-body-s text-ink-600';
}
