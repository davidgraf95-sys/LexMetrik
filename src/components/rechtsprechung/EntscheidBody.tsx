import type { MouseEvent } from 'react';
import type { EntscheidAbschnitt } from '../../lib/rechtsprechung/typen';
import { ABSCHNITT_TITEL, abschnittAnker } from '../../lib/rechtsprechung/abschnitte';
import { NormText } from '../NormText';

// EntscheidBody: rendert die Abschnitte eines Entscheid-Snapshots (Sachverhalt /
// Erwägungen / Dispositiv). Erwägungs-Blöcke tragen die amtliche Ziffer ('E. 3.2')
// als Randmarke (Zitiereinheit, tabular-nums, nach Tiefe eingerückt) und sind je
// ein stabiler Anker + Pin-Cite-Permalink (Reglement R6/R7). Jeder Block läuft
// durch <NormText> → genannte Bundesnormen werden verlinkt. Reine Darstellung (§3).
//
// Ehrlichkeit (§8): Liegt nur EIN Fliesstext-Block ohne Erwägungs-Marken vor
// (Fallback der Extraktion, keine echte Gliederung), wird das offen ausgewiesen.

/** Stabiler Anker einer Erwägung aus ihrer amtlichen Marke ('E. 2.3' → 'e-2-3'). */
function erwaegungAnker(marke: string): string {
  return marke.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Klick auf die Randziffer kopiert den Pin-Cite-Permalink (Fallback: Anker-Sprung). */
function kopierePermalink(ev: MouseEvent, anker: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof location !== 'undefined') {
    ev.preventDefault();
    const url = `${location.origin}${location.pathname}#${anker}`;
    navigator.clipboard.writeText(url).catch(() => { /* still: Anker bleibt sichtbar */ });
    if (typeof history !== 'undefined') history.replaceState(null, '', `#${anker}`);
  }
}

function Abschnitt({ a }: { a: EntscheidAbschnitt }) {
  const istErwaegung = a.typ === 'erwaegung';
  return (
    <section id={abschnittAnker(a.typ)} className="scroll-mt-[7rem] space-y-4">
      <h2 className="lc-overline text-brass-700 flex items-center gap-3">
        {ABSCHNITT_TITEL[a.typ]}
        <span aria-hidden className="flex-1 h-px bg-line" />
      </h2>
      <div className="space-y-6">
        {a.bloecke.map((b, i) => {
          const tiefe = Math.max(0, (b.tiefe ?? 1) - 1);
          if (istErwaegung) {
            const anker = b.marke ? erwaegungAnker(b.marke) : undefined;
            return (
              <div key={i} id={anker}
                className="group scroll-mt-[7rem] lg:grid lg:grid-cols-[5rem_minmax(0,1fr)] lg:gap-x-5"
                style={tiefe > 0 ? { marginLeft: `${tiefe * 1.1}rem` } : undefined}>
                <div className="mb-1 lg:mb-0 lg:text-right lg:pt-0.5">
                  {b.marke && anker && (
                    <a href={`#${anker}`} onClick={(e) => kopierePermalink(e, anker)}
                      title="Fundstelle kopieren"
                      className="num tabular-nums text-body-s font-semibold text-brass-700 no-underline hover:text-brass-900">
                      {b.marke}
                      <span aria-hidden className="ml-1 opacity-0 group-hover:opacity-70 transition-opacity">§</span>
                    </a>
                  )}
                  {b.marke && !anker && (
                    <span className="num tabular-nums text-body-s font-semibold text-brass-700">{b.marke}</span>
                  )}
                </div>
                <p className="font-serif text-[1.08rem] leading-[1.7] text-ink-800">
                  <NormText text={b.text} />
                </p>
              </div>
            );
          }
          return (
            <p key={i} className="font-serif text-[1.08rem] leading-[1.7] text-ink-800 whitespace-pre-line">
              <NormText text={b.text} />
            </p>
          );
        })}
      </div>
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
    <div className="space-y-9">
      {ohneStruktur && (
        <p className="lc-notice text-body-s">
          Strukturierte Gliederung (Sachverhalt / Erwägungen / Dispositiv) nicht verfügbar — der Text wird unverändert wiedergegeben.
        </p>
      )}
      {abschnitte.map((a) => <Abschnitt key={a.typ} a={a} />)}
    </div>
  );
}
