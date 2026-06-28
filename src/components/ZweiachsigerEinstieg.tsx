import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { einstiegMatrix } from '../lib/einstieg';

// ─── Zweiachsiger Einstieg: nach Rechtsgebiet (ROADMAP Schritt 5) ───────────
// Die zweite Achse zum bestehenden Aufgaben-Register auf /rechner: derselbe
// Katalog (§5), nach Rechtsgebiet aufgeschlüsselt, je Gebiet die Werkzeuge nach
// Aufgabe gruppiert. Reine Darstellung (§3); nur verfügbare Karten (§8).
// Kompakt/kanzleihaft: Gebiete als aufklappbare Kacheln, damit die Übersicht
// scannbar bleibt (DESIGN-REGLEMENT: nüchtern, Dichte als bewusster Hebel).

export function ZweiachsigerEinstieg() {
  // ALLE_KARTEN ist modul-statisch → einmal projizieren statt pro Render.
  const matrix = useMemo(() => einstiegMatrix(), []);
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="lc-overline">Einstieg nach Rechtsgebiet</p>
        <p className="text-body-s text-ink-600 leading-relaxed max-w-reading">
          Dieselben Werkzeuge, quer nach Rechtsgebiet erschlossen – je Gebiet die
          passenden Rechner und Vorlagen nach Aufgabe gruppiert. Aufklappen oder
          unten direkt nach Aufgabe blättern.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {matrix.map((g) => (
          <details key={g.id} className="lc-tile">
            <summary className="flex cursor-pointer items-baseline justify-between gap-2">
              <span className="text-body-s font-medium text-ink-900">{g.gebiet}</span>
              <span className="text-xs text-ink-500"><span className="num">{g.anzahl}</span></span>
            </summary>
            <div className="mt-3 space-y-3">
              {g.zellen.map((z) => (
                <div key={z.kategorie} className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{z.titel}</p>
                  <ul className="space-y-0.5">
                    {z.karten.map((k) => (
                      <li key={k.id}>
                        {k.href ? (
                          <Link to={k.href} className="text-body-s text-brass-700 no-underline hover:underline">{k.title}</Link>
                        ) : (
                          <span className="text-body-s text-ink-600">{k.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
