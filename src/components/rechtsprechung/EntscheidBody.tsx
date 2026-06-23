import type { MouseEvent } from 'react';
import type { EntscheidAbschnitt, EntscheidBlock } from '../../lib/rechtsprechung/typen';
import { ABSCHNITT_TITEL, abschnittAnker } from '../../lib/rechtsprechung/abschnitte';
import { NormText } from '../NormText';

// EntscheidBody: rendert die Abschnitte eines Entscheid-Snapshots (Sachverhalt /
// Erwägungen / Dispositiv) im amtlichen BGer-Lesebild:
//  · Erwägungen sind klar ABGETRENNTE, nummerierte Blöcke (Ziffer als Kopfzeile,
//    oberste Ebene mit Haarlinie getrennt, Unter-Erwägungen eingerückt mit
//    Randlinie). Jede Ziffer = stabiler Anker + Pin-Cite-Permalink (R6/R7).
//  · Dispositiv als nummerierte Liste (R: Anordnungen einzeln).
//  · Wrapper-Klasse `rsp-prose` hält inline-Norm-Links dezent (R11).
//  · Ehrlicher Fallback (§8), wenn keine Gliederung vorliegt (kantonal).

/** Stabiler Anker einer Erwägung aus ihrer amtlichen Marke ('E. 2.3' → 'e-2-3'). */
function erwaegungAnker(marke: string): string {
  return marke.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Klick auf die Ziffer kopiert den Pin-Cite-Permalink (Fallback: Anker-Sprung). */
function kopierePermalink(ev: MouseEvent, anker: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof location !== 'undefined') {
    ev.preventDefault();
    const url = `${location.origin}${location.pathname}#${anker}`;
    navigator.clipboard.writeText(url).catch(() => { /* Anker bleibt sichtbar */ });
    if (typeof history !== 'undefined') history.replaceState(null, '', `#${anker}`);
  }
}

const ABSATZ = 'font-serif text-[1.08rem] leading-[1.7] text-ink-800 whitespace-pre-line';

function Erwaegung({ b }: { b: EntscheidBlock }) {
  const tiefe = Math.max(0, (b.tiefe ?? 1) - 1);
  const top = tiefe === 0;
  const anker = b.marke ? erwaegungAnker(b.marke) : undefined;
  return (
    <div id={anker}
      className={[
        'group scroll-mt-[7rem]',
        top ? 'mt-7 pt-5 border-t border-line first:mt-2 first:pt-0 first:border-0' : 'mt-4 border-l border-line/70 pl-4',
      ].join(' ')}
      style={tiefe > 1 ? { marginLeft: `${(tiefe - 1) * 1}rem` } : undefined}>
      {b.marke && anker && (
        <a href={`#${anker}`} onClick={(e) => kopierePermalink(e, anker)}
          title="Fundstelle kopieren"
          className={`mb-1 inline-flex items-baseline no-underline num tabular-nums font-semibold ${top ? 'text-ink-900 text-[1.05rem]' : 'text-ink-700 text-[0.95rem]'}`}>
          {b.marke}
          <span aria-hidden className="ml-1.5 text-brass-600 opacity-0 group-hover:opacity-80 transition-opacity">§</span>
        </a>
      )}
      <p className={ABSATZ}><NormText text={b.text} /></p>
    </div>
  );
}

function Dispositiv({ bloecke }: { bloecke: EntscheidBlock[] }) {
  // Nummerierte Anordnungen als Liste; ohne Marken (Fallback) als Fliesstext.
  if (!bloecke.some((b) => b.marke)) {
    return <>{bloecke.map((b, i) => <p key={i} className={ABSATZ}><NormText text={b.text} /></p>)}</>;
  }
  return (
    <ol className="space-y-3">
      {bloecke.map((b, i) => (
        <li key={i} className="grid grid-cols-[1.6rem_minmax(0,1fr)] gap-x-2">
          <span className="num tabular-nums font-semibold text-ink-700">{b.marke}</span>
          <p className="font-serif text-[1.05rem] leading-[1.65] text-ink-800"><NormText text={b.text} /></p>
        </li>
      ))}
    </ol>
  );
}

function Abschnitt({ a }: { a: EntscheidAbschnitt }) {
  return (
    <section id={abschnittAnker(a.typ)} className="scroll-mt-[7rem] space-y-3">
      <h2 className="lc-overline text-brass-700">{ABSCHNITT_TITEL[a.typ]}</h2>
      {a.typ === 'erwaegung'
        ? <div>{a.bloecke.map((b, i) => <Erwaegung key={i} b={b} />)}</div>
        : a.typ === 'dispositiv'
          ? <Dispositiv bloecke={a.bloecke} />
          : <div className="space-y-4">{a.bloecke.map((b, i) => <p key={i} className={ABSATZ}><NormText text={b.text} /></p>)}</div>}
    </section>
  );
}

export function EntscheidBody({ abschnitte }: { abschnitte: EntscheidAbschnitt[] }) {
  // Fallback-Erkennung (§8): genau ein Abschnitt, ein Block, keine Erwägungs-Marke.
  const alleBloecke = abschnitte.flatMap((a) => a.bloecke);
  const ohneStruktur = abschnitte.length <= 1
    && alleBloecke.length === 1
    && !alleBloecke.some((b) => b.marke);

  if (abschnitte.length === 0) {
    return (
      <div className="lc-notice lc-notice-warn">
        Für diesen Entscheid liegt kein erfasster Text vor — massgeblich ist die amtliche Fassung (Link unten).
      </div>
    );
  }

  return (
    <div className="rsp-prose space-y-9">
      {ohneStruktur && (
        <p className="lc-notice text-body-s">
          Strukturierte Gliederung (Sachverhalt / Erwägungen / Dispositiv) nicht verfügbar — der Text wird unverändert wiedergegeben.
        </p>
      )}
      {abschnitte.map((a) => <Abschnitt key={a.typ} a={a} />)}
    </div>
  );
}
