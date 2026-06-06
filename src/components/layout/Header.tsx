import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LexMetrikSiegel, LexMetrikWortmarke } from './Logo';
import { SprachUmschalter } from '../SprachUmschalter';
import { istProEingeloggt, proAusloggen } from '../../lib/proSession';

// Header (Iteration 4): ruhiges ZWEI-ZONEN-Layout – Logo links, Aktions-
// cluster rechts (Sprache · Methodik · Pro-Button), Mitte bewusst leer.
// «Über» wandert ans Seitenende (Footer-Navigation, Entscheid 5.6.2026) –
// der Header trägt nur noch, was beim Arbeiten gebraucht wird.
// Der frühere Stufen-Umschalter ist aufgelöst: «/» (Free) ist der Default;
// ein gerichteter Button führt in den Pro-Bereich (gekapselte Route, später
// Zahlungs-Gate – PAYWALL_ACTIVE; Zahlungssystem noch nicht definiert) und von dort zurück.
const NAV = [
  { to: '/methodik', label: 'Methodik', match: (p: string) => p === '/methodik' },
];

// Pro-Sitzungs-Button: Wer Pro betreten hat, ist eingeloggt (localStorage,
// überlebt Neuladen) und sieht «Ausloggen»; sonst den gerichteten Pro-Pfeil.
const PRO_BTN_CLS =
  'inline-flex items-center gap-1 h-9 px-2.5 sm:px-3 rounded-lg border border-brass-400 bg-surface text-body-s font-medium text-brass-700 no-underline hover:bg-brass-100/60 hover:border-brass-500 transition-colors whitespace-nowrap';

function ProButton() {
  const { pathname, search } = useLocation(); // re-rendert bei Navigation → Login-Status frisch
  const navigate = useNavigate();
  // Auf /pro gilt die Sitzung als aktiv, auch wenn der Pro-Effekt erst nach
  // diesem Render einloggt (Review B1: sonst zeigte der Erstbesuch «Pro →»).
  if (istProEingeloggt() || pathname.startsWith('/pro')) {
    return (
      <button type="button" className={PRO_BTN_CLS}
        onClick={() => { proAusloggen(); navigate('/'); }}>
        Ausloggen
      </button>
    );
  }
  return (
    <Link to={{ pathname: '/pro', search }} className={PRO_BTN_CLS}>
      <span>Pro</span> →
    </Link>
  );
}

export function Header() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-20 border-b border-line"
      style={{ background: 'color-mix(in srgb, var(--paper) 92%, transparent)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      {/* Utility-Bar (schlank): nur der Pflichthinweis rechts – der Claim
          steht genau einmal im Hero. Auf Mobile ausgeblendet. */}
      <div className="hidden sm:block border-b border-line" style={{ background: 'color-mix(in srgb, var(--paper-sunken) 55%, transparent)' }}>
        <div className="max-w-content mx-auto px-5 sm:px-6 h-7 flex items-center justify-end">
          <p className="lc-overline text-ink-500 truncate">Orientierung – keine Rechtsberatung</p>
        </div>
      </div>

      {/* Hauptzeile: Logo links · Aktionscluster rechts · Mitte leer */}
      <div className="max-w-content mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 no-underline shrink-0" aria-label="LexMetrik – Startseite">
          <LexMetrikSiegel size={30} />
          <LexMetrikWortmarke className="text-[1.35rem] hidden md:block" />
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Sprache (en/fr/it «in Bearbeitung», DE-Fallback) */}
          <SprachUmschalter />
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            {NAV.map((n) => {
              const aktiv = n.match(pathname);
              return (
                <Link key={n.to} to={n.to}
                  className={`relative px-2.5 sm:px-3 py-2 text-body-s font-medium no-underline transition-colors ${
                    aktiv ? 'text-ink-900' : 'text-ink-600 hover:text-ink-900'
                  }`}>
                  {n.label}
                  {/* Aktives Item: Messing-Balken als Unterstrich (Designsystem §5) */}
                  {aktiv && <span className="scale-rule scale-rule-sm absolute left-2 right-2 -bottom-0.5" aria-hidden />}
                </Link>
              );
            })}
          </div>
          {/* Gerichteter Pro-Zugang: einziges umrandetes Element rechts aussen */}
          <ProButton />
        </nav>
      </div>
    </header>
  );
}
