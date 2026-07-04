import { Link } from 'react-router-dom';
import { NAVIGATION } from '../../lib/navigation';
import { Icon } from '../Icon';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';
import { GesetzeChips } from './GesetzeChips';

// ─── Rubrik-Kacheln der Startseite (Startseite V3, Modul #4) ────────────────
//
// Fünf Link-Kacheln als vollständige Landkarte der Sammlung, iteriert über die
// EINE Navigations-SSoT (navigation.ts::NAVIGATION ohne «Start») — gleiche
// Ordnung wie die Sidebar (I1). Reine Darstellung (§3): je Kachel ein
// monolineares Icon (≤20 px), Titel, EIN konkreter Nutzen-Satz und — nur wo
// substanziell — ein gescopter Zähler. Die Zahlen kommen aus der buildseitig
// generierten Mini-Datei (startseiteZaehler.generated.ts, Tor check:zaehler) —
// KEIN Register-Import in den Startseiten-Chunk, kein Client-Fetch.
//
// Wortlaut-Regeln (§6): konkreter Nutzen, kein «geprüft», keine Floskeln; Zähler
// nur mit Scope. Gesetze/Entscheide zählen echten Volltext; Materialien sind
// bibliografische Verweise → «erfasst», nie «Volltext» (§8, E6a·M5).

const z = STARTSEITE_ZAEHLER;
const nf = (n: number) => n.toLocaleString('de-CH');

// Anzeige je Rubrik, verschlüsselt über das Navigations-Ziel (die EINE Ordnung).
const RUBRIK: Record<string, { icon: string; nutzen: string; zaehler?: string }> = {
  '/gesetze': {
    icon: 'scale',
    nutzen: 'Bundes- und Kantonserlasse im Volltext, geltende Fassung mit Stand und Link zur amtlichen Quelle.',
    zaehler: `${nf(z.gesetzeVolltext)} Erlasse im Volltext`,
  },
  '/rechtsprechung': {
    icon: 'court',
    nutzen: 'Bundesgerichts- und weitere Gerichtsentscheide, nach Sachgebiet erschlossen und mit den Normen verzahnt.',
    zaehler: `${nf(z.rechtsprechungVolltext)} Entscheide im Volltext`,
  },
  '/materialien': {
    icon: 'clipboard',
    nutzen: 'Kreisschreiben, Leitfäden und Wegleitungen der Bundesbehörden, je mit Link zur amtlichen Fassung.',
    // Zähler «erfasste» (§8, nie «Volltext» — alle sind nur-live-link/Verweis; E6a·M5, §0/B10a).
    zaehler: `${nf(z.materialien)} amtliche Materialien erfasst`,
  },
  '/rechner': {
    icon: 'calculator',
    nutzen: 'Fristen, Kosten und Zuständigkeiten nach festen Regeln, mit offengelegtem Rechenweg.',
    zaehler: `${nf(z.rechner)} Rechner`,
  },
  '/vorlagen': {
    icon: 'document',
    nutzen: 'Verträge und Eingaben aus Bausteinen mit Normbezug, als Word und PDF.',
    zaehler: `${nf(z.vorlagen)} Vorlagen`,
  },
};

export function RubrikKacheln() {
  // Landkarte = dieselben Rubriken wie die Sidebar, ohne «Start» (titel === null).
  const rubriken = NAVIGATION.filter((a) => a.titel !== null && a.ziel && RUBRIK[a.ziel]);
  return (
    <div className="space-y-4">
      {/* Mobil grid-cols-1 zwingend (bekannte Overflow-Falle @390); Desktop fünf
          Spalten als eine Reihe (die volle Landkarte auf einen Blick). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {rubriken.map((a) => {
          const r = RUBRIK[a.ziel!];
          return (
            <Link key={a.ziel} to={a.ziel!}
              className="group lc-tile p-5 no-underline flex flex-row sm:flex-col items-start gap-3
                         transition-[border-color,box-shadow] duration-fast hover:border-line-strong hover:shadow-md
                         focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-600 focus-visible:outline-offset-2">
              <span className="shrink-0 text-brass-600" aria-hidden>
                <Icon name={r.icon} className="w-5 h-5" />
              </span>
              <span className="min-w-0 space-y-1">
                <span className="block text-h3 font-display font-semibold text-ink-900 group-hover:text-brass-800 transition-colors">
                  {a.titel}
                </span>
                <span className="block text-body-s text-ink-700 leading-snug">{r.nutzen}</span>
                {r.zaehler && <span className="block text-micro num text-ink-500">{r.zaehler}</span>}
              </span>
            </Link>
          );
        })}
      </div>
      <GesetzeChips />
    </div>
  );
}
