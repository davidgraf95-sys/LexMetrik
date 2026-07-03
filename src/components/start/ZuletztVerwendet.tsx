import { useState } from 'react';
import { Link } from 'react-router-dom';
import { holeZuletzt } from '../../lib/zuletztVerwendet';

// ─── Startseiten-Modul «Zuletzt verwendet» (V3, Modul #5) ───────────────────
//
// Auto-getrackte Chips der zuletzt besuchten Inhalts-Routen (Rechner/Vorlage;
// Gesetze/Entscheide folgen als eigenes Arbeitspaket, FAHRPLAN §3 #5). Reine
// Darstellung (§3): liest die vom ZuletztTracker (App-Shell) geschriebene Liste
// SYNCHRON aus localStorage (kein async-Nachwachsen → kein Shift; §0/§15).
//
// Erstbesuch/leer: rendert NICHTS (kein leerer Kopf, §8). Der Container hält
// min-h-modul-zuletzt als Fallback-Reservierung (FAHRPLAN §3 #5). SSR/Prerender
// hat kein localStorage → serverseitig leer; der Client liest beim Mount synchron
// nach — die eine client-divergente Stelle trägt darum ehrlich
// suppressHydrationWarning (wie Begruessung/Favoriten zuvor).
//
// (Wird in diesem Schritt noch NICHT in Startseite.tsx eingebunden — die
//  Neukomposition kommt in Bausequenz-Schritt 4.)

export function ZuletztVerwendet() {
  const [eintraege] = useState(holeZuletzt); // lazy, synchron — kein Effect-Nachwachsen
  if (eintraege.length === 0) return null;
  return (
    // Harte 1-Zeilen-Kappung: flex-nowrap + whitespace-nowrap + overflow-x-auto
    // (@390 px waagrecht scrollbar, kein Umbruch, kein Seiten-Overflow).
    <div className="min-h-modul-zuletzt overflow-x-auto" suppressHydrationWarning>
      <div className="flex w-max max-w-full flex-nowrap gap-1.5">
        {eintraege.map((e) => (
          <Link key={e.route} to={e.route}
            className="lc-chip no-underline whitespace-nowrap hover:text-brass-700 hover:border-brass-400">
            {e.titel}
          </Link>
        ))}
      </div>
    </div>
  );
}
