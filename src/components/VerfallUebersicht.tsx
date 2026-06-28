// «Aktualität & Pflege der Parameter» — sichtbare Fläche des Verfallsregisters
// (ROADMAP S0). Reine Anzeige-Schicht (§3): die datierten Einträge kommen aus
// dem generierten Datenmodul (SSoT = bibliothek/register/parameter-verfall.md,
// §5); der Tagesbezug (verfallen / bald fällig / aktuell) wird hier zur Laufzeit
// gebildet — bewusst CLIENT-seitig, damit das Prerendering nicht mit einem
// eingefrorenen Build-Datum hydratisiert (sonst Hydration-Mismatch).
import { useEffect, useState } from 'react';
import {
  VERFALL_TERMINE,
  VERFALL_STAND,
  VERFALL_MANUELL_ANZAHL,
} from '../data/verfallTermine.generated';

const VORLAUF_TAGE = 45; // gleicher Vorlauf wie das Deploy-Tor check:verfall

type Status = 'verfallen' | 'faellig' | 'aktuell';

const isoZuDe = (iso: string): string => {
  const [j, m, t] = iso.split('-');
  return `${t}.${m}.${j}`;
};

function heuteIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const STATUS_TEXT: Record<Status, string> = {
  verfallen: 'verfallen',
  faellig: 'bald fällig',
  aktuell: 'aktuell',
};
const STATUS_KLASSE: Record<Status, string> = {
  verfallen: 'lc-badge lc-badge-danger',
  faellig: 'lc-badge lc-badge-warn',
  aktuell: 'lc-badge lc-badge-ok',
};

export function VerfallUebersicht() {
  // null = vor der Montage (SSR/erster Paint): noch kein Tagesbezug, keine Badges.
  const [grenzen, setGrenzen] = useState<{ heute: string; warn: string } | null>(null);

  useEffect(() => {
    // Erst nach dem Paint setzen (Tagesbezug ist rein client-seitig — das
    // Prerendering kennt kein „heute“); deferred, damit kein synchroner
    // setState im Effekt-Körper kaskadiert (react-hooks/set-state-in-effect).
    const id = requestAnimationFrame(() => {
      const jetzt = new Date();
      const warn = new Date(jetzt.getTime() + VORLAUF_TAGE * 86_400_000);
      setGrenzen({ heute: heuteIso(jetzt), warn: heuteIso(warn) });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const status = (datum: string): Status | null => {
    if (!grenzen) return null;
    if (datum < grenzen.heute) return 'verfallen';
    if (datum <= grenzen.warn) return 'faellig';
    return 'aktuell';
  };

  return (
    <section className="space-y-3 border-t border-line pt-6">
      <h2 className="text-h3 font-display font-semibold text-ink-900">
        Aktualität &amp; Pflege der Parameter
      </h2>
      <p className="text-body-s text-ink-600 leading-relaxed">
        Einzelne Werte – etwa kantonale Tarife, der hypothekarische Referenzzinssatz oder
        Gebührenordnungen – ändern sich ausserhalb dieser Anwendung und müssen zu einem festen
        Termin neu geprüft werden. Diese Übersicht führt die {VERFALL_TERMINE.length} datierten
        Parameter mit ihrem nächsten Prüftermin. Sie wird automatisch aus dem internen Parameter-
        Verfallsregister abgeleitet (Stand {VERFALL_STAND}); jeder Eintrag nennt seine Fundstelle.
        Ein überschrittener Termin ist ein Veröffentlichungs-Hindernis für das betroffene Werkzeug –
        kein stiller Weiterbetrieb.
      </p>

      <ul className="space-y-2">
        {VERFALL_TERMINE.map((t) => {
          const s = status(t.datum);
          return (
            <li key={`${t.datum}-${t.label}`} className="lc-tile space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="lc-chip" title="Nächster Prüftermin">
                  {isoZuDe(t.datum)}
                </span>
                {s && <span className={STATUS_KLASSE[s]}>{STATUS_TEXT[s]}</span>}
              </div>
              <p className="text-body-s font-medium text-ink-900">{t.label}</p>
              {(t.wert || t.rhythmus) && (
                <p className="text-xs text-ink-500 leading-relaxed">
                  {t.wert}
                  {t.wert && t.rhythmus ? ' · ' : ''}
                  {t.rhythmus ? `Prüfrhythmus: ${t.rhythmus}` : ''}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-ink-500">
        Daneben führt das Register {VERFALL_MANUELL_ANZAHL} weitere Parameter ohne festen Termin
        (Prüfung «bei Bedarf» bzw. an ein künftiges Ereignis geknüpft).
      </p>
    </section>
  );
}
