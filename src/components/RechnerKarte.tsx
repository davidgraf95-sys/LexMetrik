import { Link } from 'react-router-dom';
import type { CalculatorCard } from '../lib/startseiteConfig';
import { karte, istAktiv } from '../lib/startseiteConfig';
import { Icon } from './Icon';

// Startseiten-Karte (Redesign 6.6.2026, Auftrag David): Icon-Bubble,
// Status-Badge, Mikro-Label, Sans-Titel (Geist), geklemmter Beschrieb —
// OHNE Norm-Pills (die Artikel leben auf der Detailseite, nicht im Katalog).
// Goldrand (border-t brass) bleibt die Semantik für «geprüft» (§8).
//
// Verlinkung als «stretched link» (absolute Fläche) statt umschliessendem
// <a>, damit die «Verwandte Rechner»-Links keine verschachtelten Anker bilden.

type Props = {
  card: CalculatorCard;
  headingLevel?: 'h3' | 'h5' | 'h6'; // direkt unter der Typ-Sektion (h2) → h3
  /** Beim Öffnen des Tools (für «Zuletzt verwendet»). */
  onOeffnen?: () => void;
};

export function RechnerKarte({ card, headingLevel = 'h3', onOeffnen }: Props) {
  // Drei distinkte Zustände (ehrliches Status-Modell):
  // geprüft = Goldrand (aktuell nirgends vergeben) · entwurf = orange,
  // gebaut aber fachlich ungeprüft · geplant = gedämpft, «In Vorbereitung».
  const aktiv = istAktiv(card.status);
  const entwurf = card.status === 'entwurf';
  const H = headingLevel;
  const verwandte = (card.related ?? [])
    .map((id) => karte(id))
    .filter((k) => k && istAktiv(k.status) && k.href);

  return (
    <article className={`relative h-full min-w-0 lc-card p-6 flex flex-col gap-3 transition-all motion-reduce:transition-none motion-reduce:transform-none ${
      aktiv
        ? `bg-surface-raised border-t-[3px] ${entwurf ? 'border-t-warn-500' : 'border-t-brass-500'} hover:shadow-lg hover:-translate-y-0.5`
        // «gedämpft» AA-konform: flache Fläche/grauer Akzent statt Opacity
        : 'bg-surface shadow-none cursor-default'
    }`}>
      {aktiv && card.href && (
        <Link to={card.href} aria-label={`${card.title} öffnen`} className="absolute inset-0 rounded-lg"
          onClick={onOeffnen} />
      )}
      <div className="flex items-start justify-between">
        {card.icon ? (
          /* Icon-Bubble einheitlich Messing für alle aktiven Karten — das
             Entwurf-Signal tragen Oberkante + Badge, nicht noch das Icon
             (Design-Review 6.6.2026: ein Flächensignal pro Karte). */
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${
            aktiv ? 'bg-brass-100 text-brass-700' : 'bg-paper-sunken text-ink-500'
          }`}>
            <Icon name={card.icon} />
          </span>
        ) : <span />}
        {/* Statussignal: Goldrand allein = geprüft; Entwurf trägt zusätzlich
            das orange Badge (Unterscheidbarkeit der drei Zustände). */}
        <span className="inline-flex items-center gap-1.5">
          {entwurf && (
            <span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>
          )}
        </span>
        {!aktiv && <span className="lc-badge lc-badge-soft">In Vorbereitung</span>}
      </div>
      <div>
        <p className="lc-overline">{card.rechtsgebiet}</p>
        <H className="text-h3 font-display font-semibold text-ink-900 mt-1 text-balance tracking-tight">{card.title}</H>
      </div>
      {/* Beschrieb auf 3 Zeilen geklemmt — ruhiger Kartenrhythmus; der volle
          Text steht auf der Detailseite. */}
      <p className="text-body-s text-ink-500 leading-relaxed line-clamp-3">{card.description}</p>
      {/* Konsolidierte Karten: abgedeckte Szenarien; geplante Optionen gedämpft */}
      {card.modus === 'rechner' && card.szenarien && card.szenarien.length > 0 && (
        <ul className="space-y-0.5">
          {card.szenarien.map((sz) => (
            <li key={sz.label} className={`text-xs leading-relaxed ${sz.status === 'geplant' ? 'text-ink-500' : 'text-ink-600'}`}>
              <span aria-hidden className={`mr-1 ${sz.status === 'geplant' ? 'text-ink-300' : 'text-warn-500'}`}>–</span>
              {sz.label}{sz.status === 'geplant' && <span className="text-ink-500"> · in Vorbereitung</span>}
            </li>
          ))}
        </ul>
      )}
      {/* Verwandte in der flexiblen Zone – Pills + «Öffnen» bleiben dadurch in
          allen Karten als einheitlicher Boden-Block auf gleicher Höhe. */}
      {aktiv && verwandte.length > 0 && (
        <p className="text-body-s text-ink-500">
          Verwandt:{' '}
          {verwandte.map((k, i) => (
            <span key={k.id}>
              {i > 0 && ' · '}
              <Link to={k.href!} className="relative text-brass-700 hover:text-brass-600 no-underline">{k.title}</Link>
            </span>
          ))}
        </p>
      )}
      {/* Norm-Pills auf den Kacheln ENTFERNT (Auftrag David 6.6.2026):
          die Artikel-Verweise leben auf der Detailseite (RechnerKopf bzw.
          Vorlagen-Kopf) — der Katalog bleibt aufgeräumt. */}
      {/* Footer: CTA nur bei «geprüft»; der Status steht bereits im Badge oben
          (kein doppeltes «In Vorbereitung»). Eigene Hinweise (note) bleiben. */}
      {/* Nur der CTA ist am Kartenboden verankert – der Höhenausgleich liegt
          als ruhiger Abstand UNTER den Pills, nicht als Loch in der Karte. */}
      {aktiv ? (
        <p className="mt-auto pt-1 text-body-s font-medium text-brass-700">
          {card.modus === 'vorlage' ? 'Erstellen →' : 'Öffnen →'}
        </p>
      ) : card.note ? (
        <p className="mt-auto pt-1 text-body-s font-medium text-ink-500">{card.note}</p>
      ) : null}
    </article>
  );
}
