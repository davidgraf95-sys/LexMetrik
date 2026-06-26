import { Link } from 'react-router-dom';
import type { SuchGruppe, SuchTreffer } from '../../lib/universalSuche';
import { suchOptionId } from './suchOptionId';

// ─── Trefferpanel der Universal-Suche (geteilt: Header-Dropdown + Hero, §5) ──
//
// Reine Darstellung (§3): rendert die vom Aggregator gelieferten Gruppen als
// gruppierte Trefferliste. Identisch in Header und Startseiten-Hero, damit beide
// EINEN Suchweg zeigen. `onAuswahl` schliesst das Dropdown nach einem Klick.
//
// Tastatur/ARIA (Bug-Check §13/F4): Wird `listboxId` gesetzt, rendert das Panel
// als ARIA-Listbox (role=listbox + role=option je Treffer, stabile Options-IDs,
// aria-selected für den hervorgehobenen Treffer). Das steuernde Eingabefeld
// (Hero/Header) hält aria-activedescendant auf der aktiven Options-ID. Ohne
// `listboxId` bleibt das Markup wie zuvor (Header-Dropdown ohne Pfeil-Nav).
// Die knappe Trefferzahl wird über EINE sr-only Live-Region angesagt — nicht
// mehr das ganze Panel, das sonst bei jedem Tastendruck neu vorgelesen würde.

function Marke({ text, ton }: NonNullable<SuchTreffer['marke']>) {
  const cls = ton === 'ok' ? 'lc-badge-ok' : ton === 'entwurf' ? 'lc-badge-entwurf' : 'lc-badge-soft';
  return <span className={`lc-badge ${cls} shrink-0`}>{text}</span>;
}

function Zeile({ t, onAuswahl, optionId, aktiv, alsOption }: {
  t: SuchTreffer;
  onAuswahl?: () => void;
  optionId?: string;
  aktiv?: boolean;
  alsOption?: boolean;
}) {
  return (
    <li role={alsOption ? 'option' : undefined} id={optionId} aria-selected={alsOption ? !!aktiv : undefined}>
      <Link to={t.href} onClick={onAuswahl} tabIndex={alsOption ? -1 : undefined}
        className={`group/z flex items-center gap-3 px-4 py-2 no-underline transition-colors hover:bg-brass-100/40${aktiv ? ' bg-brass-100/40' : ''}`}>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-s font-medium text-ink-900 transition-colors group-hover/z:text-brass-800">{t.label}</span>
          {t.untertitel && <span className="block truncate text-body-s text-ink-500">{t.untertitel}</span>}
        </span>
        {t.marke && <Marke {...t.marke} />}
        <span aria-hidden className="text-ink-300 transition-all group-hover/z:translate-x-0.5 group-hover/z:text-brass-500">→</span>
      </Link>
    </li>
  );
}

function Gruppe({ g, index, onAuswahl, listboxId, aktivId }: {
  g: SuchGruppe;
  index: number;
  onAuswahl?: () => void;
  listboxId?: string;
  aktivId?: string;
}) {
  return (
    <div role={listboxId ? 'group' : undefined} aria-label={listboxId ? g.titel : undefined}
      className="lc-reveal border-t border-line first:border-t-0" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="flex items-baseline gap-2 px-4 pt-3 pb-1">
        <span className="lc-overline text-ink-500">{g.titel}</span>
        {!g.laedt && <span className="num text-xs text-ink-500">{g.gesamt}</span>}
        {g.mehrHref && (
          <Link to={g.mehrHref} onClick={onAuswahl} className="ml-auto text-body-s text-brass-700 no-underline hover:text-brass-600">
            alle {g.gesamt} →
          </Link>
        )}
      </div>
      {g.laedt
        ? <p className="px-4 pb-3 text-body-s text-ink-500">wird durchsucht …</p>
        : <ul role={listboxId ? 'none' : undefined} className="pb-1.5">
            {g.treffer.map((t) => {
              const oid = listboxId ? suchOptionId(listboxId, g.id, t.id) : undefined;
              return <Zeile key={`${g.id}:${t.id}`} t={t} onAuswahl={onAuswahl}
                optionId={oid} aktiv={!!oid && oid === aktivId} alsOption={!!listboxId} />;
            })}
          </ul>}
    </div>
  );
}

export function SuchResultate({ gruppen, allesGeladen, q, onAuswahl, listboxId, aktivId }: {
  gruppen: SuchGruppe[];
  allesGeladen: boolean;
  q: string;
  onAuswahl?: () => void;
  /** Setzt das Panel in den ARIA-Listbox-Modus (Pfeil-Nav vom steuernden Feld). */
  listboxId?: string;
  /** Options-ID des aktuell hervorgehobenen Treffers (aria-activedescendant). */
  aktivId?: string;
}) {
  if (q === '') return null;

  const sichtbar = gruppen.reduce((n, g) => n + g.treffer.length, 0);
  const status = gruppen.length === 0
    ? (allesGeladen ? 'Keine Treffer' : 'wird durchsucht …')
    : `${sichtbar} Treffer`;

  return (
    <>
      {/* Knappe Live-Region: nur die Trefferzahl, nicht die ganze Liste (§13/F4). */}
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
      <div className="lc-card overflow-hidden"
        role={listboxId ? 'listbox' : undefined} id={listboxId}
        aria-label={listboxId ? 'Suchtreffer' : undefined}>
        {gruppen.length === 0
          ? <p className="px-4 py-4 text-body-s text-ink-500">
              {allesGeladen
                ? <>Keine Treffer zu «{q}». Versuchen Sie einen Erlass, eine Norm oder ein Stichwort.</>
                : <>wird durchsucht …</>}
            </p>
          : gruppen.map((g, i) => <Gruppe key={g.id} g={g} index={i} onAuswahl={onAuswahl} listboxId={listboxId} aktivId={aktivId} />)}
      </div>
    </>
  );
}
