import { Fragment } from 'react';
import { START_MODULE } from '../lib/startseiteModule';

// ─── Startseite V3 — reiner Registry-Mapper (FAHRPLAN §4/§5) ────────────────
//
// Die Startseite komponiert sich aus der Modul-Registry (startseiteModule.tsx):
// EINE Reihenfolge (§2), ein Modul = eine Zeile. Diese Seite trägt nur den Rahmen
// — Sektionstrenner (Seclabel als <h2>) und die optionale CLS-Höhenreservierung.
// Alle Fach-/Zustandslogik (Leerzustände, localStorage, async) liegt IM Modul
// (§4: KEIN sichtbar() — Leerzustände gehören ins Modul). Reine Darstellung (§3).
//
// A11y (§8): genau EIN <h1> (im Hero), je betitelter Sektion ein <h2> mit
// <section aria-labelledby>, Kacheltitel als <h3> — keine Heading-Sprünge.
// Titellose Module (Hero/Zuletzt/News/Vertrauen) verwalten Titel/Höhe selbst.

function Seclabel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 id={id} className="lc-overline">{children}</h2>
      <span aria-hidden className="flex-1 h-px bg-line" />
    </div>
  );
}

export function Startseite() {
  return (
    <div className="space-y-10">
      {START_MODULE.map((modul) => {
        const Komponente = modul.Komponente;
        // Optionale, benannte CLS-Reservierung (§4) — aktuell nutzt sie kein
        // Modul (die async-Module Zuletzt/News reservieren selbst), bleibt aber
        // als FUNDAMENT-Fähigkeit generisch bedient.
        const inhalt = modul.minHoeheKlasse
          ? <div className={modul.minHoeheKlasse}><Komponente /></div>
          : <Komponente />;
        if (modul.titel) {
          const h2id = `sec-${modul.id}`;
          return (
            <section key={modul.id} aria-labelledby={h2id}>
              <Seclabel id={h2id}>{modul.titel}</Seclabel>
              {inhalt}
            </section>
          );
        }
        return <Fragment key={modul.id}>{inhalt}</Fragment>;
      })}
    </div>
  );
}
