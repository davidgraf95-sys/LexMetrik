import { Link } from 'react-router-dom';
import type { CalculatorCard } from '../lib/startseiteConfig';
import { karte } from '../lib/startseiteConfig';
import { Icon } from './Icon';

// Startseiten-Karte (Zwei-Säulen-Struktur). Kartenanatomie wie bisher:
// Icon-Bubble, Status-Badge, Mikro-Label, Serif-Titel, Beschrieb, Norm-Pills,
// Goldrand (border-t brass) als Semantik für «geprüft».
//
// Verlinkung als «stretched link» (absolute Fläche) statt umschliessendem
// <a>, damit die «Verwandte Rechner»-Links keine verschachtelten Anker bilden.

type Props = {
  card: CalculatorCard;
  headingLevel?: 'h3' | 'h5' | 'h6'; // direkt unter der Typ-Sektion (h2) → h3
};

export function RechnerKarte({ card, headingLevel = 'h3' }: Props) {
  const aktiv = card.status === 'geprüft';
  const H = headingLevel;
  const verwandte = (card.related ?? [])
    .map((id) => karte(id))
    .filter((k) => k && k.status === 'geprüft' && k.href);

  return (
    <article className={`relative h-full lc-card bg-surface-raised p-6 flex flex-col gap-3 transition-shadow ${
      aktiv ? 'border-t-[3px] border-t-brass-500 hover:shadow-lg' : 'opacity-[0.74] cursor-default'
    }`}>
      {aktiv && card.href && (
        <Link to={card.href} aria-label={`${card.title} öffnen`} className="absolute inset-0 rounded-lg" />
      )}
      <div className="flex items-start justify-between">
        {card.icon ? (
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-brass-100 text-brass-700">
            <Icon name={card.icon} />
          </span>
        ) : <span />}
        {/* Status «geplant» wird als «In Vorbereitung» angezeigt */}
        <span className={`lc-badge ${aktiv ? 'lc-badge-ok' : 'lc-badge-soft'}`}>
          {aktiv ? 'geprüft' : 'In Vorbereitung'}
        </span>
      </div>
      <div>
        <p className="lc-overline">{card.rechtsgebiet}</p>
        <H className="text-h3 font-display font-semibold text-ink-900 mt-1">{card.title}</H>
      </div>
      <p className="text-body-s text-ink-500 leading-relaxed">{card.description}</p>
      {/* Verwandte in der flexiblen Zone – Pills + «Öffnen» bleiben dadurch in
          allen Karten als einheitlicher Boden-Block auf gleicher Höhe. */}
      {aktiv && verwandte.length > 0 && (
        <p className="relative text-body-s text-ink-400">
          Verwandte Rechner:{' '}
          {verwandte.map((k, i) => (
            <span key={k.id}>
              {i > 0 && ' · '}
              <Link to={k.href!} className="text-brass-700 hover:text-brass-600 no-underline">{k.title}</Link>
            </span>
          ))}
        </p>
      )}
      <div className="flex-1" aria-hidden />
      {aktiv && card.norms.length > 0 && (
        <div className="relative flex flex-wrap gap-1.5">
          {/* Norm-Pills: Anzeigetext unverändert; Link auf die amtliche
              konsolidierte Fassung (Fedlex), neues Tab. */}
          {card.norms.map((n) =>
            n.url ? (
              <a key={n.label} href={n.url} target="_blank" rel="noopener noreferrer"
                className="lc-chip no-underline hover:text-brass-700"
                title={`${n.label} auf Fedlex öffnen${n.verified ? '' : ' (Gesetzes-Seite)'}`}>
                {n.label}
              </a>
            ) : (
              <span key={n.label} className="lc-chip">{n.label}</span>
            ),
          )}
        </div>
      )}
      <p className={`text-body-s font-medium ${aktiv ? 'text-brass-700' : 'text-ink-400'}`}>
        {aktiv ? 'Öffnen →' : (card.note ?? 'In Vorbereitung')}
      </p>
    </article>
  );
}
