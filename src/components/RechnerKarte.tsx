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
  headingLevel?: 'h5' | 'h6'; // unter Rechtsgebiet (h4) bzw. Cluster (h5)
};

export function RechnerKarte({ card, headingLevel = 'h5' }: Props) {
  const aktiv = card.status === 'geprüft';
  const H = headingLevel;
  const verwandte = (card.related ?? [])
    .map((id) => karte(id))
    .filter((k) => k && k.status === 'geprüft' && k.href);

  return (
    <article className={`relative h-full lc-card p-6 flex flex-col gap-3 transition-shadow ${
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
        <span className={`lc-badge ${aktiv ? 'lc-badge-ok' : 'lc-badge-soft'}`}>{card.status}</span>
      </div>
      <div>
        <p className="lc-overline">{card.category}</p>
        <H className="text-h3 font-display font-semibold text-ink-900 mt-1">{card.title}</H>
      </div>
      <p className="text-body-s text-ink-500 leading-relaxed flex-1">{card.description}</p>
      {aktiv && card.norms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.norms.map((n) => <span key={n.label} className="lc-chip">{n.label}</span>)}
        </div>
      )}
      <p className={`text-body-s font-medium ${aktiv ? 'text-brass-700' : 'text-ink-400'}`}>
        {aktiv ? 'Öffnen →' : (card.note ?? 'bald verfügbar')}
      </p>
      {aktiv && verwandte.length > 0 && (
        <p className="relative text-body-s text-ink-400 border-t border-line pt-2 -mt-1">
          Verwandte Rechner:{' '}
          {verwandte.map((k, i) => (
            <span key={k.id}>
              {i > 0 && ' · '}
              <Link to={k.href!} className="text-brass-700 hover:text-brass-600 no-underline">{k.title}</Link>
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
