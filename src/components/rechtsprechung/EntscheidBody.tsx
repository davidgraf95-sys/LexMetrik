import type { MouseEvent } from 'react';
import type { EntscheidAbschnitt, EntscheidBlock } from '../../lib/rechtsprechung/typen';
import { ABSCHNITT_TITEL, abschnittAnker } from '../../lib/rechtsprechung/abschnitte';
import { NormText } from '../NormText';

// EntscheidBody: amtliches BGer-Lesebild (Art. 112 BGG: Sachverhalt → Erwägungen →
// Dispositiv, feste Reihenfolge als Invariante).
//  · Erwägungen nach Top-Ziffer GRUPPIERT: jede „N." mit einheitlicher Kopfzeile +
//    Trennlinie (auch bei ausgelassener Zwischenebene); Unter-Erwägungen nach Tiefe
//    eingerückt. Im Text nur die nackte Ziffer; „E." nur in Zitat/Anker (bger.ch-Regeln).
//  · Klick auf eine Ziffer kopiert die VOLLE Fundstelle (z.B. „BGer … vom …, E. 2.1").
//  · Markenlose Erwägungen (unplausible/kantonale Daten) als Fliesstext — kein „E. 0".
//  · Dispositiv als nummerierte Liste; Schlussformel gedämpft.
//  · `rsp-prose` hält Norm-Links dezent (R11); Lesegrösse via --rsp-fs (R17).

const ABSATZ = 'font-serif text-[length:var(--rsp-fs,1.08rem)] leading-[1.7] text-ink-800 whitespace-pre-line';
const SEKTIONS_ORDNUNG: Record<string, number> = { sachverhalt: 0, erwaegung: 1, dispositiv: 2 };

function segmente(marke: string | null): number[] {
  const m = /(\d+(?:\.\d+)*)/.exec(marke ?? '');
  return m ? m[1].split('.').map(Number) : [];
}
function ankerFuer(marke: string): string {
  return marke.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '');
}

export function EntscheidBody({ abschnitte, zitierung, bgeReferenz }: {
  abschnitte: EntscheidAbschnitt[];
  zitierung: string;
  bgeReferenz: string | null;
}) {
  // Volle Fundstelle einer Erwägung (Pin-Cite): amtlich BGE bzw. übriges Urteil + „E. x.y".
  function pinCite(marke: string): string {
    const e = segmente(marke).join('.');
    const basis = bgeReferenz ? `BGE ${bgeReferenz}` : zitierung;
    return e ? `${basis}, E. ${e}` : basis;
  }
  function kopiere(ev: MouseEvent, zitat: string, anker: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof location !== 'undefined') {
      ev.preventDefault();
      navigator.clipboard.writeText(`${zitat}\n${location.origin}${location.pathname}#${anker}`).catch(() => {});
      if (typeof history !== 'undefined') history.replaceState(null, '', `#${anker}`);
    }
  }
  function Ziffer({ label, marke, anker, stark }: { label: string; marke: string; anker: string; stark: boolean }) {
    return (
      <a href={`#${anker}`} onClick={(e) => kopiere(e, pinCite(marke), anker)} title={`${pinCite(marke)} — Fundstelle kopieren`}
        className={`mb-1 inline-flex items-baseline no-underline num tabular-nums font-semibold ${stark ? 'text-ink-900 text-base' : 'text-ink-700 text-body-s'}`}>
        {label}
        <span aria-hidden className="ml-1.5 text-brass-600 opacity-0 group-hover:opacity-80 transition-opacity">§</span>
      </a>
    );
  }

  function Erwaegungen({ bloecke }: { bloecke: EntscheidBlock[] }) {
    const gruppen: { top: number; bloecke: EntscheidBlock[] }[] = [];
    for (const b of bloecke) {
      const top = segmente(b.marke)[0] ?? 0;
      const g = gruppen[gruppen.length - 1];
      if (!g || g.top !== top) gruppen.push({ top, bloecke: [b] });
      else g.bloecke.push(b);
    }
    return (
      <div>
        {gruppen.map((g, gi) => {
          // top===0 ⇒ markenlose Erwägungen (unplausibel/kantonal): reiner Fliesstext, kein „E. 0".
          if (g.top === 0) {
            return (
              <div key={`roh-${gi}`} className="space-y-4">
                {g.bloecke.map((b, i) => <p key={i} className={ABSATZ}><NormText text={b.text} /></p>)}
              </div>
            );
          }
          const erstesIstKopf = segmente(g.bloecke[0].marke).length === 1;
          const kopf = erstesIstKopf ? g.bloecke[0] : null;
          const subs = erstesIstKopf ? g.bloecke.slice(1) : g.bloecke;
          const kopfAnker = `e-${g.top}`;
          return (
            <section key={g.top} className="mt-7 pt-5 border-t border-line first:mt-2 first:pt-0 first:border-0">
              <div id={kopfAnker} className="group scroll-mt-[7rem]">
                <Ziffer label={`${g.top}.`} marke={`E. ${g.top}`} anker={kopfAnker} stark />
                {kopf && <p className={`${ABSATZ} mt-1`}><NormText text={kopf.text} /></p>}
              </div>
              {subs.map((b, i) => {
                const ein = Math.max(0, (b.tiefe ?? segmente(b.marke).length) - 1); // Tiefe 1 = bündig
                const anker = b.marke ? ankerFuer(b.marke) : `${kopfAnker}-${i}`;
                return (
                  <div key={i} id={anker} className="group scroll-mt-[7rem] mt-4 border-l border-line/70 pl-4"
                    style={ein > 1 ? { marginLeft: `${(ein - 1)}rem` } : undefined}>
                    {b.marke && <Ziffer label={b.marke.replace(/^E\.\s*/, '')} marke={b.marke} anker={anker} stark={false} />}
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
    if (!nummeriert.length) return <>{bloecke.map((b, i) => <p key={i} className={ABSATZ}><NormText text={b.text} /></p>)}</>;
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
        {schluss.map((b, i) => (
          <p key={i} className="mt-4 pt-3 border-t border-line/60 text-body-s text-ink-500 whitespace-pre-line">{b.text}</p>
        ))}
      </>
    );
  }

  // Sachverhalt: Buchstaben-Gliederung (A.a/A.b/B.a …) als Label je Absatz. Leere
  // Top-Köpfe (tiefe 1, z.B. „B.") werden ausgeblendet — der Top-Buchstabe steckt
  // schon im Sub-Label (Anzeige-Politur). KEIN Text-Trim mehr: der Block-Text wird
  // unverändert gezeigt (nachlaufende Marker sind bereits im Split abgetrennt, §1).
  function Sachverhalt({ bloecke }: { bloecke: EntscheidBlock[] }) {
    return (
      <div className="space-y-4">
        {bloecke.map((b, i) => {
          if (b.tiefe === 1 && !b.text.trim()) return null;
          if (!b.marke) {
            if (/^[A-ZÄÖÜ]\.$/.test(b.text.trim())) return null;
            return <p key={i} className={ABSATZ}><NormText text={b.text} /></p>;
          }
          return (
            <p key={i} className={ABSATZ}>
              <span className="num mr-1.5 font-semibold text-ink-900">{b.marke}</span>
              <NormText text={b.text} />
            </p>
          );
        })}
      </div>
    );
  }

  function Abschnitt({ a }: { a: EntscheidAbschnitt }) {
    return (
      <section id={abschnittAnker(a.typ)} className="scroll-mt-[7rem] space-y-3">
        <h2 className="lc-overline text-brass-700">{ABSCHNITT_TITEL[a.typ]}</h2>
        {a.typ === 'sachverhalt' && a.vollstaendig === false && (
          <p className="text-micro text-ink-500 -mt-1">Auszug — der vollständige Sachverhalt steht in der amtlichen Fassung (Link unten).</p>
        )}
        {a.typ === 'erwaegung'
          ? <Erwaegungen bloecke={a.bloecke} />
          : a.typ === 'dispositiv'
            ? <Dispositiv bloecke={a.bloecke} />
            : a.typ === 'sachverhalt'
              ? <Sachverhalt bloecke={a.bloecke} />
              : <div className="space-y-4">{a.bloecke.map((b, i) => <p key={i} className={ABSATZ}><NormText text={b.text} /></p>)}</div>}
      </section>
    );
  }

  if (abschnitte.length === 0) {
    return (
      <div className="lc-notice lc-notice-warn">
        Für diesen Entscheid liegt kein erfasster Text vor — massgeblich ist die amtliche Fassung (Link unten).
      </div>
    );
  }

  const sortiert = [...abschnitte].sort((a, b) => (SEKTIONS_ORDNUNG[a.typ] ?? 9) - (SEKTIONS_ORDNUNG[b.typ] ?? 9));
  const alleBloecke = abschnitte.flatMap((a) => a.bloecke);
  const ohneStruktur = abschnitte.length <= 1 && alleBloecke.length === 1 && !alleBloecke.some((b) => b.marke);
  const hatErw = abschnitte.some((a) => a.typ === 'erwaegung');
  const hatDisp = abschnitte.some((a) => a.typ === 'dispositiv');

  return (
    <div className="rsp-prose space-y-9">
      {ohneStruktur && (
        <p className="lc-notice text-body-s">
          Strukturierte Gliederung (Sachverhalt / Erwägungen / Dispositiv) nicht verfügbar — der Text wird unverändert wiedergegeben.
        </p>
      )}
      {sortiert.map((a) => <Abschnitt key={a.typ} a={a} />)}
      {hatErw && !hatDisp && (
        <p className="text-micro text-ink-500">Das Urteilsdispositiv ist in dieser Erfassung nicht zuverlässig abgegrenzt — massgeblich ist die amtliche Fassung.</p>
      )}
    </div>
  );
}
