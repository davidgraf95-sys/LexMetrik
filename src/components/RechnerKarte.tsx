import { Link } from 'react-router-dom';
import type { CalculatorCard } from '../lib/startseiteConfig';
import { karte, istAktiv } from '../lib/startseiteConfig';
import { Icon } from './Icon';
import { sansAmp } from './typografie';
import { useLocale, fedlexLokalisiert } from './locale';

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
  // Drei distinkte Zustände (ehrliches Status-Modell):
  // geprüft = Goldrand (aktuell nirgends vergeben) · entwurf = orange,
  // gebaut aber fachlich ungeprüft · geplant = gedämpft, «In Vorbereitung».
  const aktiv = istAktiv(card.status);
  const entwurf = card.status === 'entwurf';
  const H = headingLevel;
  const { locale } = useLocale();
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
        <Link to={card.href} aria-label={`${card.title} öffnen`} className="absolute inset-0 rounded-lg" />
      )}
      <div className="flex items-start justify-between">
        {card.icon ? (
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-md ${
            entwurf ? 'bg-warn-bg text-warn-700' : aktiv ? 'bg-brass-100 text-brass-700' : 'bg-paper-sunken text-ink-500'
          }`}>
            <Icon name={card.icon} />
          </span>
        ) : <span />}
        {/* Statussignal: Goldrand allein = geprüft; Entwurf trägt zusätzlich
            das orange Badge (Unterscheidbarkeit der drei Zustände). */}
        {entwurf && (
          <span className="lc-badge lc-badge-warn" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>
        )}
        {!aktiv && <span className="lc-badge lc-badge-soft">In Vorbereitung</span>}
      </div>
      <div>
        <p className="lc-overline">{card.rechtsgebiet}</p>
        <H className="text-h3 font-display font-semibold text-ink-900 mt-1 text-balance">{sansAmp(card.title)}</H>
      </div>
      <p className="text-body-s text-ink-500 leading-relaxed">{card.description}</p>
      {/* Konsolidierte Karten: abgedeckte Szenarien; geplante Optionen gedämpft */}
      {card.modus === 'rechner' && card.szenarien && card.szenarien.length > 0 && (
        <ul className="space-y-0.5">
          {card.szenarien.map((sz) => (
            <li key={sz.label} className={`text-xs leading-relaxed ${sz.status === 'geplant' ? 'text-ink-400' : 'text-ink-600'}`}>
              <span aria-hidden className={`mr-1 ${sz.status === 'geplant' ? 'text-ink-300' : 'text-warn-500'}`}>–</span>
              {sz.label}{sz.status === 'geplant' && <span className="text-ink-400"> · in Vorbereitung</span>}
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
      {aktiv && card.norms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {/* Norm-Pills: Anzeigetext unverändert; Link auf die amtliche
              konsolidierte Fassung (Fedlex), neues Tab. */}
          {card.norms.map((n) =>
            n.url ? (
              <a key={n.label} href={fedlexLokalisiert(n.url, locale)} target="_blank" rel="noopener noreferrer"
                className="relative lc-chip no-underline hover:text-brass-700"
                title={`${n.label} auf Fedlex öffnen${n.verified ? '' : ' — Verweis noch nicht fachlich geprüft'}`}>
                {n.label}
              </a>
            ) : (
              <span key={n.label} className="lc-chip">{n.label}</span>
            ),
          )}
        </div>
      )}
      {/* Footer: CTA nur bei «geprüft»; der Status steht bereits im Badge oben
          (kein doppeltes «In Vorbereitung»). Eigene Hinweise (note) bleiben. */}
      {/* Nur der CTA ist am Kartenboden verankert — der Höhenausgleich liegt
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
