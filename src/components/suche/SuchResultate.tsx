import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SuchGruppe, SuchTreffer } from '../../lib/universalSuche';
import type { Abdeckung } from './useUniversalSuche';
import { suchOptionId } from './suchOptionId';
import { StatusBadge } from '../verzahnung/StatusBadge';

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

function Marke({ text, ton, redundant }: NonNullable<SuchTreffer['marke']>) {
  // Leitentscheid über das geteilte StatusBadge-Vokabular (W2·7-VZUI): EIN
  // aria-label an allen vier Fundorten (Suche, Panel, Leitfall-Zeile, Reader).
  // Nicht interaktiv — die Zeile ist eine ARIA-Option (kein nested-interactive).
  if (ton === 'leitentscheid') return <StatusBadge praedikat="leitentscheid" className="shrink-0" />;
  const cls = ton === 'ok' ? 'lc-badge-ok' : ton === 'entwurf' ? 'lc-badge-entwurf' : 'lc-badge-soft';
  // Redundanter Typ-Chip (dupliziert den Gruppentitel «Gesetzestext»/«Material»/…):
  // auf Mobil ausgeblendet, wo der Platz knapp ist (S3/#56). Desktop bleibt.
  const mobil = redundant ? 'max-sm:hidden ' : '';
  return <span className={`${mobil}lc-badge ${cls} shrink-0`}>{text}</span>;
}

const ZEILE_CLS = 'group/z flex items-center gap-3 px-4 py-2 no-underline transition-colors hover:bg-brass-100/40';

// Query-Wörter im Snippet/Untertitel deterministisch hervorheben (S3/#56). Rein:
// Wörter ab 2 Zeichen, regex-escaped, case-insensitiv als <mark> umschlossen.
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function markiere(text: string, q: string): ReactNode {
  const worte = q.trim().split(/\s+/).filter((w) => w.length >= 2).map(escapeRe);
  if (worte.length === 0) return text;
  const muster = worte.join('|');
  const teile = text.split(new RegExp(`(${muster})`, 'ig'));
  const test = new RegExp(`^(?:${muster})$`, 'i');
  // Hervorhebung über Gewicht + dunklere Tinte statt Farbfläche: eine brass-
  // Hintergrund-Tönung drückte den ink-500-Snippet-Text unter AA (axe: 4.23:1
  // auf brass-100) — Gewicht/ink-700 ist in BEIDEN Themes kontrastsicher, weil
  // der Hintergrund die Panel-Fläche bleibt (§13/F2).
  return teile.map((teil, i) => (test.test(teil)
    ? <mark key={i} className="bg-transparent font-semibold text-ink-700">{teil}</mark>
    : teil));
}

function ZeileInhalt({ t, sprung, q }: { t: SuchTreffer; sprung?: boolean; q: string }) {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-s font-medium text-ink-900 transition-colors group-hover/z:text-brass-800">{t.label}</span>
        {/* Zweizeiliges Snippet mit Highlight (S3/#56) statt einzeiligem Abschnitt. */}
        {t.untertitel && <span className="line-clamp-2 text-body-s text-ink-500">{markiere(t.untertitel, q)}</span>}
      </span>
      {t.marke && <Marke {...t.marke} />}
      {/* Norm-Sprung (A5): ↵ signalisiert die Primäraktion «Enter springt».
          Alle anderen Treffer öffnen mit «→». */}
      <span aria-hidden className={sprung
        ? 'text-brass-500'
        : 'text-ink-300 transition-all group-hover/z:translate-x-0.5 group-hover/z:text-brass-500'}>{sprung ? '↵' : '→'}</span>
    </>
  );
}

function Zeile({ t, onAuswahl, onNavigate, optionId, aktiv, alsOption, sprung, q }: {
  t: SuchTreffer;
  onAuswahl?: () => void;
  onNavigate?: (href: string) => void;
  optionId?: string;
  aktiv?: boolean;
  alsOption?: boolean;
  sprung?: boolean;
  q: string;
}) {
  // Listbox-Option: KEIN inneres <a> (ein fokussierbarer Link in role=option ist
  // nested-interactive, axe serious — Entscheid David 26.6.2026). Maus/Touch
  // navigieren über onNavigate; die Tastatur läuft über die Combobox (Enter im
  // Feld öffnet den aktiven Treffer, aria-activedescendant zeigt ihn an).
  if (alsOption) {
    return (
      <li role="option" id={optionId} aria-selected={!!aktiv}
        onClick={() => { onAuswahl?.(); onNavigate?.(t.href); }}
        className={`${ZEILE_CLS} cursor-pointer${aktiv ? ' bg-brass-100/40' : ''}`}>
        <ZeileInhalt t={t} sprung={sprung} q={q} />
      </li>
    );
  }
  return (
    <li>
      <Link to={t.href} onClick={onAuswahl} className={ZEILE_CLS}>
        <ZeileInhalt t={t} sprung={sprung} q={q} />
      </Link>
    </li>
  );
}

function Gruppe({ g, index, onAuswahl, onNavigate, listboxId, aktivId, q, sektionsRollen }: {
  g: SuchGruppe;
  index: number;
  onAuswahl?: () => void;
  onNavigate?: (href: string) => void;
  listboxId?: string;
  aktivId?: string;
  q: string;
  sektionsRollen?: boolean;
}) {
  // Gruppen-Landmarke: im Listbox-Modus zwingend (role=group in der Listbox); auf
  // der /suche-Seite (S5) optional per `sektionsRollen`, damit Screenreader die
  // Inhaltstyp-Abschnitte ansteuern können — ohne den Options-Modus.
  const alsGruppe = !!listboxId || !!sektionsRollen;
  return (
    <div role={alsGruppe ? 'group' : undefined} aria-label={alsGruppe ? g.titel : undefined}
      className="lc-reveal border-t border-line first:border-t-0" style={{ animationDelay: `${index * 55}ms` }}>
      <div className="flex items-baseline gap-2 px-4 pt-3 pb-1">
        <span className="lc-overline">{g.titel}</span>
        {/* Zähler je Gruppe (A6) — ausser beim einzeiligen Norm-Sprung («1» wäre Lärm). */}
        {!g.laedt && g.id !== 'sprung' && <span className="num text-xs text-ink-500">{g.gesamt}</span>}
        {g.mehrHref && (
          <Link to={g.mehrHref} onClick={onAuswahl} className="ml-auto text-body-s text-brass-700 no-underline hover:text-brass-600">
            alle {g.gesamt} →
          </Link>
        )}
      </div>
      {/* Einmalige, dezente §8-Offenlegung (z. B. «Suchbegriffe verlassen den Browser»). */}
      {g.hinweis && <p className="px-4 pb-1 text-body-s text-ink-500">{g.hinweis}</p>}
      {/* Externer Amtslink (BGE «nicht im Bestand» → search.bger.ch). Echter
          `<a target>` (kein Listbox-Option — External-Navigation), rel gesichert. */}
      {g.externLink && (
        <a href={g.externLink.href} target="_blank" rel="noopener noreferrer"
          className="mx-4 mb-2 mt-1 inline-flex items-center gap-1.5 text-body-s text-brass-700 no-underline hover:text-brass-600">
          {g.externLink.label} <span aria-hidden>↗</span>
        </a>
      )}
      {g.laedt
        // Mindesthöhen-Platzhalter (§15.2): reserviert eine Trefferzeile, damit
        // die Gruppen darunter beim Einwachsen weniger springen (min-h-11-Token).
        ? <p className="px-4 pb-3 text-body-s text-ink-500 min-h-11">wird durchsucht …</p>
        : <ul role={listboxId ? 'none' : undefined} className="pb-1.5">
            {g.treffer.map((t) => {
              const oid = listboxId ? suchOptionId(listboxId, g.id, t.id) : undefined;
              return <Zeile key={`${g.id}:${t.id}`} t={t} onAuswahl={onAuswahl} onNavigate={onNavigate}
                optionId={oid} aktiv={!!oid && oid === aktivId} alsOption={!!listboxId} sprung={g.id === 'sprung'} q={q} />;
            })}
          </ul>}
    </div>
  );
}

export function SuchResultate({ gruppen, allesGeladen, q, onAuswahl, onNavigate, listboxId, aktivId, vorschlag, abdeckung, onVorschlag, sektionsRollen }: {
  gruppen: SuchGruppe[];
  allesGeladen: boolean;
  q: string;
  onAuswahl?: () => void;
  /** Maus/Touch-Navigation im Listbox-Modus (Optionen sind keine <a> mehr). */
  onNavigate?: (href: string) => void;
  /** Setzt das Panel in den ARIA-Listbox-Modus (Pfeil-Nav vom steuernden Feld). */
  listboxId?: string;
  /** Options-ID des aktuell hervorgehobenen Treffers (aria-activedescendant). */
  aktivId?: string;
  /** «Meinten Sie …?»-Vorschlag (S3) — oder null/undefined. */
  vorschlag?: string | null;
  /** §8-Korpus-Offenlegung für die Fusszeile (S3/E1) — oder null. */
  abdeckung?: Abdeckung | null;
  /** Übernimmt einen Vorschlag als neue Query (setzt das Feld). */
  onVorschlag?: (begriff: string) => void;
  /** /suche-Seite (S5): jede Gruppe als role=group-Landmarke (ohne Listbox). */
  sektionsRollen?: boolean;
}) {
  if (q === '') return null;

  // §8-ehrlicher Zähler (S3/#5): solange Sektionen laden, ist die Zahl nicht final
  // → «N+ … wird noch durchsucht»; erst wenn alles geladen ist, die feste Zahl.
  const nochLaedt = !allesGeladen || gruppen.some((g) => g.laedt);
  const gesamt = gruppen.reduce((n, g) => n + (g.laedt ? 0 : g.gesamt), 0);
  const status = gruppen.length === 0
    ? (allesGeladen ? 'Keine Treffer' : 'wird durchsucht …')
    : nochLaedt ? `mindestens ${gesamt} Treffer, wird noch durchsucht …` : `${gesamt} Treffer`;

  return (
    <>
      {/* Knappe Live-Region: nur die Trefferzahl, nicht die ganze Liste (§13/F4). */}
      <p className="sr-only" role="status" aria-live="polite">{status}</p>
      {/* «Meinten Sie …?» (S3) — deterministischer Tippfehler-Vorschlag, ausserhalb
          der Listbox (kein Options-Element), setzt bei Klick die Query. */}
      {vorschlag && (
        <p className="lc-card mb-2 px-4 py-2 text-body-s text-ink-600">
          Meinten Sie{' '}
          <button type="button" onClick={() => onVorschlag?.(vorschlag)}
            className="font-medium text-brass-700 underline decoration-dotted underline-offset-2 hover:text-brass-600">
            {vorschlag}
          </button>
          ?
        </p>
      )}
      <div className="lc-card overflow-hidden"
        role={listboxId ? 'listbox' : undefined} id={listboxId}
        aria-label={listboxId ? 'Suchtreffer' : undefined}>
        {gruppen.length === 0
          ? <p className="px-4 py-4 text-body-s text-ink-500">
              {allesGeladen
                ? <>Keine Treffer zu «{q}». Versuchen Sie einen Erlass, eine Norm oder ein Stichwort.</>
                : <>wird durchsucht …</>}
            </p>
          : gruppen.map((g, i) => <Gruppe key={g.id} g={g} index={i} onAuswahl={onAuswahl} onNavigate={onNavigate} listboxId={listboxId} aktivId={aktivId} q={q} sektionsRollen={sektionsRollen} />)}
      </div>
      {/* §8-Korpus-Offenlegung (S3/E1): was die Suche wirklich durchsucht, ausserhalb
          der Listbox. Link auf die Abdeckungsseite «Was ist drin». */}
      {abdeckung && (
        // 11px-Feinschrift in ink-600, nicht ink-500 (Auftrag David 25.6.2026,
        // Muster lc-fineprint): auf brass-getönten Flächen (Hero) fällt ink-500
        // bei 11px unter AA (axe 4.23:1) — ink-600 trägt AA in beiden Themes.
        <p className="mt-2 px-1 text-micro leading-snug text-ink-600">
          Durchsucht: {abdeckung.volltext} Bund-Erlasse im Volltext · {abdeckung.bge} BGE ·
          {' '}kantonale Erlasse ({abdeckung.kantonTitel}): nur nach Titel.{' '}
          <Link to="/abdeckung" onClick={onAuswahl} className="text-brass-700 no-underline hover:text-brass-600">Was ist drin? →</Link>
        </p>
      )}
    </>
  );
}
