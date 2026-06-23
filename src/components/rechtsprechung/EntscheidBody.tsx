import type { MouseEvent } from 'react';
import type { EntscheidAbschnitt } from '../../lib/rechtsprechung/typen';
import { ABSCHNITT_TITEL, abschnittAnker } from '../../lib/rechtsprechung/abschnitte';
import { NormText } from '../NormText';

// EntscheidBody: rendert die Abschnitte eines Entscheid-Snapshots (Sachverhalt /
// Erwägungen / Dispositiv). Erwägungen werden — wie im amtlichen BGer-Layout —
// als klar ABGETRENNTE, nummerierte Blöcke gesetzt: die amtliche Ziffer ('E. 2.3')
// steht als eigene Kopfzeile über ihrem Absatz, Erwägungen oberster Ebene sind
// durch eine Haarlinie + Abstand getrennt, Unter-Erwägungen nach Tiefe eingerückt.
// Jede Ziffer ist ein stabiler Anker + Pin-Cite-Permalink (Reglement R6/R7). Jeder
// Absatz läuft durch <NormText> → genannte Bundesnormen werden verlinkt.
//
// Ehrlichkeit (§8): Liegt nur EIN Fliesstext-Block ohne Erwägungs-Marken vor
// (kantonal/Fallback ohne amtliche Gliederung), wird das offen ausgewiesen.

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

function Abschnitt({ a }: { a: EntscheidAbschnitt }) {
  const istErwaegung = a.typ === 'erwaegung';
  return (
    <section id={abschnittAnker(a.typ)} className="scroll-mt-[7rem] space-y-4">
      <h2 className="lc-overline text-brass-700 flex items-center gap-3">
        {ABSCHNITT_TITEL[a.typ]}
        <span aria-hidden className="flex-1 h-px bg-line" />
      </h2>
      <div className={istErwaegung ? '' : 'space-y-6'}>
        {a.bloecke.map((b, i) => {
          if (!istErwaegung) {
            return (
              <p key={i} className="font-serif text-[1.08rem] leading-[1.7] text-ink-800 whitespace-pre-line">
                <NormText text={b.text} />
              </p>
            );
          }
          // Erwägung: abgetrennter Block mit Ziffer als Kopfzeile (amtliches Layout).
          const tiefe = Math.max(0, (b.tiefe ?? 1) - 1);
          const top = tiefe === 0;
          const anker = b.marke ? erwaegungAnker(b.marke) : undefined;
          return (
            <div key={i} id={anker}
              className={`group scroll-mt-[7rem] ${top ? 'mt-6 pt-5 border-t border-line/70 first:mt-0 first:pt-0 first:border-0' : 'mt-4'}`}
              style={tiefe > 0 ? { marginLeft: `${tiefe * 1.25}rem` } : undefined}>
              {b.marke && anker && (
                <a href={`#${anker}`} onClick={(e) => kopierePermalink(e, anker)}
                  title="Fundstelle kopieren"
                  className={`mb-1.5 inline-flex items-baseline no-underline num tabular-nums font-semibold ${top ? 'text-ink-900 text-[1.05rem]' : 'text-brass-700 text-body-s'}`}>
                  {b.marke}
                  <span aria-hidden className="ml-1.5 text-brass-700 opacity-0 group-hover:opacity-70 transition-opacity">§</span>
                </a>
              )}
              <p className="font-serif text-[1.08rem] leading-[1.7] text-ink-800 whitespace-pre-line">
                <NormText text={b.text} />
              </p>
            </div>
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
