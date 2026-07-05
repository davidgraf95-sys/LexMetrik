// ─── Leser-Options-Leiste (W2·5d G2a) — UI zu leserOptionen.ts ───────────────
//
// Genau drei echte role="switch"-Buttons (§3.1: keine Wucherung): Linien,
// Fussnoten, Verweise. Der Zustand kommt aus dem globalen Store
// (leserOptionen.ts, data-* am <html> + CSS); Klick ruft `setzeOption` →
// imperatives Attribut-Update + nur diese Buttons rendern neu, der Normtext
// nicht (§15). Fokus über die globale :focus-visible-Outline (index.css, §13/F3).

import { setzeOption, useLeserOptionen, type OptFeld } from './leserOptionen';

function OptSwitch({ feld, an, label, titel }: {
  feld: OptFeld;
  an: boolean;
  label: string;
  titel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={an}
      title={titel}
      onClick={() => setzeOption(feld, an ? 'aus' : 'an')}
      className={`lc-chip inline-flex items-center gap-1 hover:text-brass-700 ${
        an ? 'text-brass-700' : 'text-ink-600'
      }`}
    >
      <span aria-hidden>{an ? '✓' : '○'}</span>
      {label}
    </button>
  );
}

/** Die Options-Leiste. `zeigeLinien` blendet den Linien-Schalter aus, wo es keine
 *  Gliederungs-Sektion mit Guide gibt (flache Artikelliste) — er wäre sonst
 *  wirkungslos (§2.2④). `linienAutoAn` = ob im AUFBAU-abhängigen Default-Zustand
 *  ('auto', U-LINIEN/A8) der Guide für DIESEN Erlass sichtbar ist (flaches/mittleres
 *  Gesetz ⇒ an, tiefe Kodifikation ⇒ aus) — so zeigt der Schalter den EFFEKTIVEN
 *  Zustand ehrlich (§8) und ein Klick setzt das passende explizite 'an'/'aus'.
 *  Fussnoten/Verweise gelten immer. */
export function LeserOptionenLeiste({ zeigeLinien, linienAutoAn = false }: { zeigeLinien: boolean; linienAutoAn?: boolean }) {
  const opt = useLeserOptionen();
  // Effektiver Linien-Zustand: expliziter Nutzer-Wunsch schlägt die Grundart;
  // im Default 'auto' folgt er der Grundart (KODIFIKATION → an).
  const linienEffektivAn = opt.linien === 'an' || (opt.linien === 'auto' && linienAutoAn);
  return (
    <div
      role="group"
      aria-label="Darstellungsoptionen"
      className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1"
    >
      {zeigeLinien && (
        <OptSwitch
          feld="linien"
          an={linienEffektivAn}
          label="Linien"
          titel="Gliederungslinien und Einzug ein- oder ausblenden"
        />
      )}
      <OptSwitch
        feld="fussnoten"
        an={opt.fussnoten === 'an'}
        label="Fussnoten"
        titel="Fussnoten-Marker hervorheben oder dämpfen — der Text bleibt sichtbar und durchsuchbar"
      />
      <OptSwitch
        feld="verweise"
        an={opt.verweise === 'an'}
        label="Verweise"
        titel="Verweis-Links unterstreichen oder schlicht darstellen (der Link bleibt aktiv)"
      />
    </div>
  );
}
