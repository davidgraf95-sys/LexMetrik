import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Sektion, Fussnote } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { ERLASS_REGISTER } from '../../lib/normtext/register';

// M11 (§5 Verzahnung): Reverse-Resolver SR-Nummer → interner Erlass, ABGELEITET
// aus dem Register (keine Handtabelle, §3/§5 eine Quelle). Nur Bund-Erlasse, die
// wir tatsächlich im Volltext/PDF-embed haben — sonst bleibt der Fedlex-Link der
// ehrliche Fallback (§8). Einmal modulweit aufgebaut (statisch).
const SR_INTERN: ReadonlyMap<string, { key: string; ebene: 'bund' | 'kanton' }> = new Map(
  ERLASS_REGISTER
    .filter((e) => e.ebene === 'bund' && e.sr && (e.status === 'snapshot' || e.status === 'pdf-embed'))
    .map((e) => [e.sr as string, { key: e.key, ebene: e.ebene }]),
);

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

// G15: Hervorhebungen (fett/kursiv) im Fussnotentext als Rich-Text rendern. Der
// Extraktor (fussnoten-extrahiere.clean) behält bare <b>/<i>; hier werden sie in
// <strong>/<em> übersetzt (rekursiv für die seltene Verschachtelung <i>…<b>…</b>…</i>).
export function richText(s: string, keyBase: string): ReactNode {
  if (!s.includes('<')) return s;
  const out: ReactNode[] = [];
  const re = /<(b|i)>([\s\S]*?)<\/\1>/gi;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const kinder = richText(m[2], `${keyBase}-${k}`);
    out.push(m[1].toLowerCase() === 'b'
      ? <strong key={`${keyBase}-b${k}`}>{kinder}</strong>
      : <em key={`${keyBase}-i${k}`}>{kinder}</em>);
    last = re.lastIndex;
    k++;
  }
  if (last < s.length) out.push(s.slice(last));
  return out.length === 1 ? out[0] : out;
}

// Fussnoten-Text mit klickbaren AS/BBl-Verweisen (die Label-Vorkommen werden
// durch Anker ersetzt) und erhaltenen Hervorhebungen (G15). Reine Darstellung.
export function escRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
export function fnTextMitLinks(fn: Fussnote): ReactNode {
  if (!fn.links.length) return richText(fn.text, 'fn');
  const map = new Map(fn.links.map((l) => [l.label, l.url]));
  const re = new RegExp(`(${[...map.keys()].sort((a, b) => b.length - a.length).map(escRe).join('|')})`, 'g');
  return fn.text.split(re).map((t, i) => {
    const url = map.get(t);
    if (url === undefined) return <Fragment key={i}>{richText(t, `fn${i}`)}</Fragment>;
    // SR-Erkennung (M11) auf dem TAG-FREIEN Label — Hervorhebungen («SR <b>220</b>»)
    // dürfen den Treffer nicht verhindern.
    const plano = t.replace(/<[^>]+>/g, '');
    const kinder = richText(t, `fn${i}`);
    // M11 (§5): SR-Verweis «SR 220» auf einen Erlass, den wir im Volltext haben,
    // verlinkt INTERN auf den LexMetrik-Leser statt immer nach Fedlex — man bleibt
    // im Werkzeug. Die SR-Nummer steht im Label; nur exakte Treffer (Bund,
    // snapshot/pdf-embed). Sonst Fedlex-Link als ehrlicher Fallback (§8).
    const srTreffer = plano.match(/^SR\s+([\d.]+)$/);
    const intern = srTreffer ? SR_INTERN.get(srTreffer[1]) : undefined;
    if (intern) {
      // Stand-Transparenz (§5/§8, David-Entscheid 28.6.): der intern gezeigte
      // Stand kann vom zitierten abweichen (bis Versionierung) → den zitierten
      // Fedlex-Konsolidierungsstand im title offenlegen, nicht stillschweigend
      // gleichsetzen. Konsolidierung steht als YYYYMMDD im Fedlex-Link.
      const standM = url.match(/\/(\d{4})(\d{2})(\d{2})(?:\/|$)/);
      const titel = standM
        ? `Intern öffnen · zitierter Fedlex-Stand ${standM[3]}.${standM[2]}.${standM[1]}`
        : 'Intern öffnen';
      return (
        <Link key={i} to={`/gesetze/${intern.ebene}/${encodeURIComponent(intern.key)}`}
          title={titel}
          className="text-brass-700/90 hover:text-brass-700 hover:underline decoration-dotted underline-offset-2">{kinder}</Link>
      );
    }
    return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-brass-700/90 hover:text-brass-700 hover:underline">{kinder}</a>;
  });
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
  // Hängender-Einzug-Schutz (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT §Randtitel-
  // Hierarchie): mehrzeilige Randtitel («1. Im Allgemeinen») brechen sonst als
  // «1. Im / Allgemeinen» — die Fortsetzungszeile rückt via text-indent:-1em +
  // pl-[1em] auf die Titel-Startspalte ein (Fedlex-AVOID). Reine Darstellung (§3).
  const hang = '[text-indent:-1em] pl-[1em]';
  if (istBlatt) return `${hang} text-base font-semibold text-ink-800`;
  if (level <= 0) return `${hang} text-body-s font-medium uppercase tracking-wide text-ink-500`;
  return `${hang} text-body-s text-ink-600`;
}
