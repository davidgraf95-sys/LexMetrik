import { Link, type To } from 'react-router-dom';
import { GruppenTitel } from '../vorlagen/ui';
import { ALLE_KARTEN, istVerfuegbar } from '../../lib/startseiteConfig';
import { sansAmp } from '../typografie';

// ─── «Passende Vorlage für Ihre Eingabe» (S-4 FAHRPLAN-STRUKTUR-UMBAU) ──────
//
// Auftrag David 10.6.2026 abends: «Die Zuständigkeitsengine soll, nachdem
// die Zuständigkeit eruiert wurde, direkt zu den Vorlagen für die jeweils
// zuständige Instanz führen.» Geteilter Block für alle Rechtswege (§10):
// gebaut → Link (mit Prefill, wo die Brücke existiert; Adresse der
// ermittelten Stelle reist als Schlüssel mit, §5) · geplant → ehrlich
// «In Vorbereitung» (§8). Reines Mapping, keine Rechtslogik (§3).

export function VorlagenSprung({ karteId, link, zusatz, prefillHinweis }: {
  karteId: string;
  /** Sprungziel mit Prefill; ohne Angabe wird karte.href verwendet. */
  link?: To;
  zusatz?: string | null;
  /** Hinweis, was vorbefüllt wird (nur bei gebauter Vorlage mit Link). */
  prefillHinweis?: string;
}) {
  const karte = ALLE_KARTEN.find((k) => k.id === karteId);
  if (!karte) return null;
  const gebaut = istVerfuegbar(karte) && !!karte.href;
  const ziel: To | null = gebaut ? (link ?? karte.href!) : null;
  return (
    <div className="lc-card p-4 space-y-2">
      <GruppenTitel>Passende Vorlage für Ihre Eingabe</GruppenTitel>
      <p className="text-body-s text-ink-900 font-medium">
        {sansAmp(karte.title)}
        {!gebaut && <span className="lc-badge lc-badge-warn ml-2 align-middle">In Vorbereitung</span>}
      </p>
      {zusatz && <p className="text-body-s text-ink-700">{zusatz}</p>}
      {ziel ? (
        <div className="pt-1">
          <Link to={ziel} className="lc-btn-primary no-underline">Weiter zur Vorlage →</Link>
          {prefillHinweis && <p className="text-xs text-ink-500 mt-2">{prefillHinweis}</p>}
        </div>
      ) : (
        <p className="text-xs text-ink-500">
          Diese Vorlage ist noch nicht verfügbar — die hier eruierte Zuständigkeit
          (Stelle und Adresse oben) gilt unabhängig davon.
        </p>
      )}
    </div>
  );
}
