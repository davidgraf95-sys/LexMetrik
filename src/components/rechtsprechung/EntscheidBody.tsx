import type { EntscheidAbschnitt } from '../../lib/rechtsprechung/typen';
import { ABSCHNITT_TITEL, abschnittAnker } from '../../lib/rechtsprechung/abschnitte';
import { NormText } from '../NormText';

// EntscheidBody: rendert die Abschnitte eines Entscheid-Snapshots (Sachverhalt /
// Erwägungen / Dispositiv). Erwägungs-Blöcke tragen die Ziffer ('E. 3.2') als
// Randmarke und werden nach tiefe eingerückt; jeder Block läuft durch
// <NormText> → genannte Bundesnormen werden verlinkt (Verzahnung mit den
// Gesetzen). Reine Darstellung (§3) — kein Inhalt erzeugt.
//
// Ehrlichkeit (§8): Liegt nur EIN Fliesstext-Block ohne Erwägungs-Marken vor
// (Fallback der Extraktion, keine echte Gliederung), wird das offen ausgewiesen
// statt eine Struktur vorzutäuschen.

function Abschnitt({ a }: { a: EntscheidAbschnitt }) {
  // Erwägungen tragen Marken (E. 1, E. 2 …); Sachverhalt/Dispositiv sind Fliesstext.
  const istErwaegung = a.typ === 'erwaegung';
  return (
    <section id={abschnittAnker(a.typ)} className="scroll-mt-[7rem] space-y-4">
      <h2 className="lc-overline text-brass-700 flex items-center gap-3">
        {ABSCHNITT_TITEL[a.typ]}
        <span aria-hidden className="flex-1 h-px bg-line" />
      </h2>
      <div className="space-y-4">
        {a.bloecke.map((b, i) => {
          const tiefe = Math.max(0, (b.tiefe ?? 1) - 1);
          if (istErwaegung) {
            return (
              <div key={i}
                className="lg:grid lg:grid-cols-[5rem_minmax(0,1fr)] lg:gap-x-5"
                style={tiefe > 0 ? { marginLeft: `${tiefe * 1.1}rem` } : undefined}>
                <div className="mb-1 lg:mb-0 lg:text-right lg:pt-0.5">
                  {b.marke && (
                    <span className="num text-body-s font-semibold text-brass-700">{b.marke}</span>
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
