import { FristenKalender as FristenKalenderBasis } from '../FristenKalender';
import type { Kanton } from '../../types/legal';

// ─── Fristen-Kalender im Schnellrechner (#7, Auftrag David) ─────────────────
//
// ANGLEICHUNG an den Fristenrechner-Kalender (Auftrag David 24.6.2026): Statt
// einer eigenen Einzelmonats-Darstellung nutzt der Schnellrechner jetzt DIESELBE
// Kalender-Komponente wie die Fristen-Formulare (src/components/FristenKalender,
// §5/§10 — eine Quelle, dieselbe Almanach-Optik: Fristband, runde Marker,
// Mehrmonats-Raster, Legende). Diese Hülle bildet nur die regimeneutrale
// `FristMarkierung` (vom Formular geliefert) auf die Basis-Props ab — REINE
// Darstellung (§3), keine eigene Rechnung.

/** Vom Formular gelieferte Stichtage (regimeneutral). */
export interface FristMarkierung {
  startISO: string;              // Ereignistag (zählt nicht)
  endeISO: string;               // Fristende (massgebend, regime-korrekt)
  fristbeginnISO?: string;       // erster mitzählender Tag (nur «keine Ferien»)
  verschiebeGruende?: string[];  // Verschiebung (nur «keine Ferien»)
  hinweis?: string;              // z.B. «Stillstand (Art. 145 ZPO) berücksichtigt»
  stillstand?: { vonISO: string; bisISO: string }[]; // Gerichtsferien-/Stillstand-Perioden (ISO, inkl.)
}

export function FristenKalender({ markierung, kanton }: {
  markierung: FristMarkierung | null;
  kanton: Kanton;
}) {
  if (!markierung) {
    return (
      <p className="text-body-s text-ink-500 py-6 text-center">
        Datum und Frist links eingeben – der Kalender markiert dann Ereignis und Fristende.
      </p>
    );
  }
  return (
    <div className="space-y-2.5" aria-live="polite">
      <FristenKalenderBasis
        ereignisISO={markierung.startISO}
        aQuoISO={markierung.fristbeginnISO}
        adQuemISO={markierung.endeISO}
        kanton={kanton}
        stillstandAktiv={(markierung.stillstand?.length ?? 0) > 0}
        stillstandPerioden={markierung.stillstand}
      />
      {markierung.hinweis && <p className="text-xs text-ink-500">{markierung.hinweis}</p>}
      {markierung.verschiebeGruende && markierung.verschiebeGruende.length > 0 && (
        <p className="text-xs text-ink-500">Verschoben: {markierung.verschiebeGruende.join(' · ')}</p>
      )}
    </div>
  );
}
