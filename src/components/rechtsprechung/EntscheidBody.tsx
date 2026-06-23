import type { MouseEvent } from 'react';
import type { EntscheidAbschnitt, EntscheidBlock } from '../../lib/rechtsprechung/typen';
import { ABSCHNITT_TITEL, abschnittAnker } from '../../lib/rechtsprechung/abschnitte';
import { NormText } from '../NormText';

// EntscheidBody: amtliches BGer-Lesebild.
//  · Erwägungen werden nach Top-Ziffer GRUPPIERT: jede Top-Erwägung (E. 1, E. 2 …)
//    bekommt eine einheitliche Kopfzeile mit Trennlinie — AUCH wenn die Rohdaten
//    die leere Zwischenebene auslassen (Sprung „E. 1.3" → „E. 2.1"). Unter-Erwägungen
//    sind nach Tiefe gleichmässig eingerückt. Jede Ziffer = Anker + Pin-Cite (R6/R7).
//  · Dispositiv als nummerierte Liste.
//  · `rsp-prose` hält inline-Norm-Links dezent (R11); Lesegrösse via --rsp-fs (R17).
//  · Ehrlicher Fallback (§8), wenn keine Gliederung vorliegt.

const ABSATZ = 'font-serif text-[length:var(--rsp-fs,1.08rem)] leading-[1.7] text-ink-800 whitespace-pre-line';

/** Numerischer Pfad einer Erwägungs-Marke: 'E. 2.1.3' → [2,1,3]; 'E. 2' → [2]. */
function segmente(marke: string | null): number[] {
  const m = /(\d+(?:\.\d+)*)/.exec(marke ?? '');
  return m ? m[1].split('.').map(Number) : [];
}
function ankerFuer(marke: string): string {
  return marke.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '');
}
function kopierePermalink(ev: MouseEvent, anker: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof location !== 'undefined') {
    ev.preventDefault();
    navigator.clipboard.writeText(`${location.origin}${location.pathname}#${anker}`).catch(() => {});
    if (typeof history !== 'undefined') history.replaceState(null, '', `#${anker}`);
  }
}

function Ziffer({ marke, anker, stark }: { marke: string; anker: string; stark: boolean }) {
  return (
    <a href={`#${anker}`} onClick={(e) => kopierePermalink(e, anker)} title="Fundstelle kopieren"
      className={`mb-1 inline-flex items-baseline no-underline num tabular-nums font-semibold ${stark ? 'text-ink-900 text-[1.05rem]' : 'text-ink-700 text-[0.95rem]'}`}>
      {marke}
      <span aria-hidden className="ml-1.5 text-brass-600 opacity-0 group-hover:opacity-80 transition-opacity">§</span>
    </a>
  );
}

function Erwaegungen({ bloecke }: { bloecke: EntscheidBlock[] }) {
  // Nach Top-Ziffer gruppieren (Reihenfolge bleibt).
  const gruppen: { top: number; bloecke: EntscheidBlock[] }[] = [];
  for (const b of bloecke) {
    const top = segmente(b.marke)[0] ?? 0;
    const g = gruppen[gruppen.length - 1];
    if (!g || g.top !== top) gruppen.push({ top, bloecke: [b] });
    else g.bloecke.push(b);
  }
  return (
    <div>
      {gruppen.map((g) => {
        const erstesIstKopf = segmente(g.bloecke[0].marke).length === 1;
        const kopf = erstesIstKopf ? g.bloecke[0] : null;
        const subs = erstesIstKopf ? g.bloecke.slice(1) : g.bloecke;
        const kopfAnker = `e-${g.top}`;
        return (
          <section key={g.top} className="mt-7 pt-5 border-t border-line first:mt-2 first:pt-0 first:border-0">
            {/* Einheitliche Top-Kopfzeile „E. N" — auch wenn die Rohdaten sie auslassen. */}
            <div id={kopfAnker} className="group scroll-mt-[7rem]">
              <Ziffer marke={`E. ${g.top}`} anker={kopfAnker} stark />
              {kopf && <p className={`${ABSATZ} mt-1`}><NormText text={kopf.text} /></p>}
            </div>
            {subs.map((b, i) => {
              const seg = segmente(b.marke);
              const ein = Math.max(0, seg.length - 2); // Tiefe relativ zur Unter-Ebene
              const anker = b.marke ? ankerFuer(b.marke) : `${kopfAnker}-${i}`;
              return (
                <div key={i} id={anker} className="group scroll-mt-[7rem] mt-4 border-l border-line/70 pl-4"
                  style={ein > 0 ? { marginLeft: `${ein}rem` } : undefined}>
                  {b.marke && <Ziffer marke={b.marke} anker={anker} stark={false} />}
                  <p className={ABSATZ}><NormText text={b.text} /></p>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

function Dispositiv({ bloecke }: { bloecke: EntscheidBlock[] }) {
  const nummeriert = bloecke.filter((b) => b.marke);
  const schluss = bloecke.filter((b) => !b.marke);
  if (!nummeriert.length) {
    return <>{bloecke.map((b, i) => <p key={i} className={ABSATZ}><NormText text={b.text} /></p>)}</>;
  }
  return (
    <>
      <ol className="space-y-3">
        {nummeriert.map((b, i) => (
          <li key={i} className="grid grid-cols-[1.7rem_minmax(0,1fr)] gap-x-2">
            <span className="num tabular-nums font-semibold text-ink-700">{b.marke}</span>
            <p className="font-serif text-[length:var(--rsp-fs,1.05rem)] leading-[1.65] text-ink-800 whitespace-pre-line"><NormText text={b.text} /></p>
          </li>
        ))}
      </ol>
      {/* Schlussformel (Lausanne / Im Namen … / Besetzung) — gedämpft abgesetzt. */}
      {schluss.map((b, i) => (
        <p key={i} className="mt-4 pt-3 border-t border-line/60 text-body-s text-ink-500 whitespace-pre-line">{b.text}</p>
      ))}
    </>
  );
}

function Abschnitt({ a }: { a: EntscheidAbschnitt }) {
  return (
    <section id={abschnittAnker(a.typ)} className="scroll-mt-[7rem] space-y-3">
      <h2 className="lc-overline text-brass-700">{ABSCHNITT_TITEL[a.typ]}</h2>
      {a.typ === 'erwaegung'
        ? <Erwaegungen bloecke={a.bloecke} />
        : a.typ === 'dispositiv'
          ? <Dispositiv bloecke={a.bloecke} />
          : <div className="space-y-4">{a.bloecke.map((b, i) => <p key={i} className={ABSATZ}><NormText text={b.text} /></p>)}</div>}
    </section>
  );
}

export function EntscheidBody({ abschnitte }: { abschnitte: EntscheidAbschnitt[] }) {
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
