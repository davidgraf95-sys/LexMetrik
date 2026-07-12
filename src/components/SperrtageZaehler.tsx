import type { SperrfristenErgebnis } from '../lib/sperrfristen';
import { NormText } from './NormText';

// Sperrtage-Zähler (Art. 336c Abs. 1 OR): je Ereignis beanspruchte Tage;
// bei Krankheit/Unfall zusätzlich Kontingent (30/90/180 je Dienstjahr) und
// verbleibende Tage mit Messing-Füllbalken. Rückfälle gleicher Ursache
// erhalten kein neues Kontingent (BGE 120 II 124, zu verifizieren).

const TYP_LABEL: Record<string, string> = {
  krankheit_unfall: 'Krankheit / Unfall',
  schwangerschaft: 'Schwangerschaft / Niederkunft',
  militaer_zivil: 'Militär- / Zivildienst',
  hilfsaktion: 'Hilfsaktion im Ausland',
  betreuungsurlaub: 'Betreuungsurlaub (Art. 329i OR)',
  mutterschaftsurlaub_verlaengert: 'Verlängerter Mutterschaftsurlaub (lit. cbis)',
  zusatzurlaub_tod_elternteil: 'Zusatzurlaub nach Tod des anderen Elternteils (lit. cter)',
  urlaub_tod_mutter: 'Urlaub nach Tod der Mutter (lit. cquinquies)',
};

const fmtISO = (s: string) => (s ? s.split('-').reverse().join('.') : '–');

export function SperrtageZaehler({ sperrtage }: { sperrtage: NonNullable<SperrfristenErgebnis['sperrtage']> }) {
  if (sperrtage.length === 0) return null;
  return (
    <section aria-label="Sperrtage-Zähler" className="lc-card p-5 space-y-3">
      <div className="flex items-center gap-4">
        <h3 className="lc-overline text-ink-700">Sperrtage-Zähler</h3>
        <div className="flex-1 h-px bg-line" />
        <span className="lc-overline"><NormText text={`Art. 336c OR`} /></span>
      </div>

      <ul className="space-y-3">
        {sperrtage.map((z) => {
          const label = TYP_LABEL[z.typ] ?? z.typ;
          const anteil = z.kontingent ? Math.min(1, z.beansprucht / z.kontingent) : null;
          return (
            <li key={z.ereignis} className="space-y-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-body-s text-ink-700">
                  <span className="num text-ink-500 mr-1.5">{z.ereignis}.</span>
                  {label}
                  <span className="text-ink-500"> · {fmtISO(z.vonISO)} – {fmtISO(z.bisISO)}</span>
                </p>
                {z.rueckfall ? (
                  <p className="text-body-s text-ink-500">Rückfall – kein neues Kontingent</p>
                ) : z.kontingent != null ? (
                  <p className="num text-body-s text-ink-900">
                    {z.beansprucht} / {z.kontingent} Tage
                    <span className={`ml-2 ${z.verbleibend === 0 ? 'text-danger-700' : 'text-ink-500'}`}>
                      · {z.verbleibend === 0 ? 'Kontingent ausgeschöpft' : `${z.verbleibend} verbleibend`}
                    </span>
                  </p>
                ) : (
                  <p className="num text-body-s text-ink-900">{z.beansprucht} Sperrtage</p>
                )}
              </div>
              {anteil !== null && (
                <div className="h-1.5 rounded-full bg-paper-sunken overflow-hidden" role="img"
                  aria-label={`${z.beansprucht} von ${z.kontingent} Sperrtagen beansprucht`}>
                  <div className={`h-full rounded-full ${anteil >= 1 ? 'bg-danger-line' : 'bg-brass-500'}`}
                    style={{ width: `${Math.round(anteil * 100)}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-ink-500">
        Kontingent Krankheit/Unfall je Dienstjahr: 30 (1. DJ) · 90 (2.–5. DJ) · 180 Tage (ab 6. DJ);
        Anfangstag zählt nicht (Art. 77 OR). Das Kontingent gilt je Verhinderungsursache —
        Überlappungen mehrerer Ereignisse werden für die Hemmung bereinigt.
      </p>
    </section>
  );
}
