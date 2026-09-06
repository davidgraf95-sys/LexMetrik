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
              {/* LM-029 (B11-Karten, 4.9.2026): `ml-auto`. Die `<summary>` ist
                  eine Flex-Zeile mit DREI Posten — Titel, Zähler und dem
                  Chevron aus `details > summary::after` (index.css), das als
                  Pseudo-Element ein vollwertiges Flex-Item ist. `justify-between`
                  verteilte den freien Raum darum ZWISCHEN Titel und Zähler:
                  gemessen auf `/rechner` (1440 px, linke Spalte, Kachelkante
                  329–827 px) sass der Zähler bei x 682 / 592 / 650 statt in
                  einer Kolonne. Mit `ml-auto` fällt der ganze freie Raum vor
                  den Zähler, er steht bündig vor der festen Chevron-Spalte. */}
              <span className="ml-auto text-xs text-ink-500"><span className="num">{g.anzahl}</span></span>
            </summary>
            <div className="mt-3 space-y-3">
              {g.zellen.map((z) => (
                <div key={z.kategorie} className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{z.titel}</p>
                  {/* B-L1 (R9-1, 6.9.2026): am Link unten stand `no-underline
                      hover:underline` — ein Strich, den es erst beim Überfahren gab. Für
                      Tastatur und Touch ist das gar keine Affordanz (WCAG 1.4.1). Die
                      Zeile ist ein LISTEN-Link (ul/li, Einstiegs-Spalte), also gilt für
                      sie die Konvention «Navigation und Listen tragen ihre Affordanz aus
                      der Form» (F0.8): dauerhaft ohne Strich, Rückmeldung über die Farbe
                      (dieselbe Form, die `layout/OrtsAngabe.tsx` in der Krume führt).
                      Kein Unterstrich-Flackern mehr, keine dritte Form. */}
                  <ul className="space-y-0.5">
                    {z.karten.map((k) => (
                      <li key={k.id}>
                        {k.href ? (
                          <Link to={k.href} className="text-body-s text-brass-700 no-underline hover:text-brass-800">{k.title}</Link>
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
