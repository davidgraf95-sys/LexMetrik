import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { istLesbar, type BrowseErlass } from '../../lib/normtext/browse-typen';
import { useErlassOeffnen, istErlassOffen } from '../../lib/useErlassOeffnen';
import { werkzeugeFuerNorm } from '../../lib/normtext/werkzeuge';

// Klick-Handler für eine Erlass-Verlinkung (Punkt G): der <Link> trägt weiter den
// nackten Basispfad (SEO/Mittelklick/Cmd-Klick/Copy-Link). Nur der EINFACHE
// Linksklick wird abgefangen — und auch nur, wenn das Gesetz schon offen ist:
// dann öffnet der Hook eine neue Instanz (?r). Sonst läuft der normale
// Link-Navigate, der ohnehin den Basispfad öffnet.
function macheOeffnenHandler(
  e: BrowseErlass,
  basePath: string,
  oeffne: (ebene: string, key: string, kuerzel?: string) => void,
) {
  return (ev: MouseEvent) => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (!istErlassOffen(basePath)) return;
    ev.preventDefault();
    oeffne(e.ebene, e.key, e.kuerzel);
  };
}

// Erlass-Karte in der Übersicht /gesetze. Nüchtern/kanzleihaft (DESIGN-REGLEMENT):
// Kürzel als Anker, Titel klein, Meta (SR · Artikelzahl), Stand als Chip. Reine
// Darstellung (§3). 'snapshot' UND 'pdf-embed' (amtliches PDF in-app) führen in
// die In-App-Lesesicht; 'nur-live-link' trägt ehrlich nur den amtlichen Link (§8).

function StandChip({ stand }: { stand: string }) {
  if (!stand) return null;
  const m = stand.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const anzeige = m ? `${m[3]}.${m[2]}.${m[1]}` : stand;
  return <span className="lc-chip whitespace-nowrap">Stand <span className="num ml-1">{anzeige}</span></span>;
}

function KarteInhalt({ e }: { e: BrowseErlass }) {
  // Norm↔Werkzeug-Brücke (ROADMAP Schritt 2, Task 4.3): dezenter Hinweis, dass
  // dieser Erlass passende Rechner/Vorlagen trägt (das Alleinstellungsmerkmal,
  // §8: nur verfügbare Werkzeuge gezählt). Die Karte verlinkt in den Reader, wo
  // das Kontext-Panel sie ausklappt — hier nur das Signal, kein zweiter Link.
  const werkzeugAnzahl = werkzeugeFuerNorm(e.key).length;
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-h3 font-semibold text-ink-900 leading-none">{e.kuerzel}</span>
        {e.sprache !== 'de' && (
          <span className="lc-badge lc-badge-soft uppercase">{e.sprache}</span>
        )}
      </div>
      <p className="mt-1.5 text-body-s text-ink-600 leading-snug line-clamp-2">{e.titel}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
        {e.sr && <span>SR <span className="num">{e.sr}</span></span>}
        {e.status === 'snapshot'
          ? <span><span className="num">{e.artikelAnzahl}</span> Artikel</span>
          : e.status === 'pdf-embed'
            ? <span className="text-ink-500">amtliches PDF</span>
            : <span className="text-ink-500">nur Live-Link</span>}
        <StandChip stand={e.stand} />
        {werkzeugAnzahl > 0 && (
          <span className="text-brass-700">
            <span className="num">{werkzeugAnzahl}</span> {werkzeugAnzahl === 1 ? 'passendes Werkzeug' : 'passende Werkzeuge'}
          </span>
        )}
      </div>
    </>
  );
}

// Kompakte Zeile für untergeordnetes Ausführungsrecht (Verordnungen/Reglemente):
// dezent, einzeilig — damit die Leitgesetze (Karten) prominent bleiben
// (Praktikabilität, Auftrag David). Gleiche Verlinkung wie die Karte.
export function ErlassZeile({ e }: { e: BrowseErlass }) {
  const inhalt = (
    <>
      <span className="font-medium text-ink-700 shrink-0">{e.kuerzel}</span>
      <span className="text-ink-500 truncate">{e.titel}</span>
      {e.sr && <span className="num text-xs text-ink-500 shrink-0 ml-auto">SR {e.sr}</span>}
      {e.status === 'nur-live-link' && <span aria-hidden className="text-xs text-brass-700 shrink-0">↗</span>}
    </>
  );
  const cls = 'flex items-baseline gap-2 text-body-s no-underline rounded px-2 py-1 hover:bg-brass-100/30 transition-colors min-w-0';
  const oeffne = useErlassOeffnen();
  const basePath = `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
  return istLesbar(e)
    ? <Link to={basePath} onClick={macheOeffnenHandler(e, basePath, oeffne)} className={cls}>{inhalt}</Link>
    : <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer" className={cls}>{inhalt}</a>;
}

// Stand-Jahr (ISO «YYYY-…») — reine Anzeige. Sehr alte Stände (vor 1990) werden
// dezent markiert: ein sehr alter Stand ist für die Anwältin ein nützliches
// Signal, soll aber nicht so laut wie ein frischer wirken. Fixe Schwelle (kein
// Date.now(), §2 — reine Darstellung).
const standJahr = (stand: string): string | null =>
  stand.slice(0, 4).match(/^\d{4}$/)?.[0] ?? null;

// Kompakte, überlaufsichere Erlass-Zeile für die Kanton-Sichten (Systematik +
// Relevanz + Rechtsgebiet): SR-Nr fix links (tabellarisch), dann der Titel, dann
// die Meta (Artikelzahl · Stand-Jahr) rechts. Bewusst NICHT ErlassZeile —
// kantonale «kuerzel» sind oft der ganze (bis 276 Z.) Titel.
//
// A14 (David 5.7.2026): der lange amtliche Titel wird NICHT MEHR abgeschnitten
// (kein `truncate` → «aktuell viel abgeschnitten»). Drei-Spalten-Grid
// (SR · Titel · Meta) mit `items-baseline`: der Titel umbricht in der mittleren
// Spalte auf beliebig viele Zeilen (`break-words`, `minmax(0,1fr)` gegen
// Overflow), SR und Meta bleiben auf der ersten Grundlinie. So bleibt der ganze
// Titel lesbar — auch @390 — ohne H-Overflow.
export function SysZeile({ e }: { e: BrowseErlass }) {
  const jahr = standJahr(e.stand);
  const altDezent = jahr != null && Number(jahr) < 1990;
  const inhalt = (
    <>
      <span className="num text-xs text-ink-500 shrink-0 w-20 tabular-nums truncate">{e.sr}</span>
      <span className="text-ink-700 break-words group-hover/z:text-brass-700 min-w-0">{e.titel}</span>
      {istLesbar(e) ? (
        <span className="shrink-0 flex items-baseline gap-2 num text-xs tabular-nums">
          {e.artikelAnzahl > 0 && <span className="text-ink-500">{e.artikelAnzahl} Art.</span>}
          {/* Sehr alte Stände dezent (italic) statt blass — Kontrast (S10/WCAG) bleibt gewahrt. */}
          {jahr && <span className={`hidden sm:inline text-ink-500${altDezent ? ' italic' : ''}`}>{jahr}</span>}
        </span>
      ) : (
        <span aria-hidden className="text-xs text-brass-700 shrink-0">↗</span>
      )}
    </>
  );
  const cls = 'group/z grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-3 text-body-s no-underline rounded px-2 py-1 hover:bg-brass-100/30 transition-colors';
  const oeffne = useErlassOeffnen();
  const basePath = `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
  return !istLesbar(e)
    ? <a href={e.quelleUrl} target="_blank" rel="noopener noreferrer" className={cls}>{inhalt}</a>
    : (
      <Link
        to={basePath}
        onClick={macheOeffnenHandler(e, basePath, oeffne)}
        className={cls}
      >{inhalt}</Link>
    );
}

export function ErlassKarte({ e }: { e: BrowseErlass }) {
  // Hook vor jeder Verzweigung (Rules of Hooks) — auch wenn der nur-live-link-
  // Pfad ihn nicht braucht.
  const oeffne = useErlassOeffnen();
  // nur-live-link: kein interner Reader (ehrlich, §8) → amtlicher Link extern.
  if (!istLesbar(e)) {
    return (
      <a
        href={e.quelleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="lc-card block p-4 no-underline transition-colors hover:border-brass-400"
      >
        <KarteInhalt e={e} />
        <span className="mt-2 inline-flex text-xs text-brass-700">↗ amtliche Fassung</span>
      </a>
    );
  }
  const basePath = `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
  return (
    <Link
      to={basePath}
      onClick={macheOeffnenHandler(e, basePath, oeffne)}
      className="lc-card group block p-4 no-underline transition-colors hover:border-brass-400"
    >
      <KarteInhalt e={e} />
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brass-700 opacity-0 transition-opacity group-hover:opacity-100">
        {e.status === 'pdf-embed' ? 'Amtliches PDF öffnen →' : 'Volltext lesen →'}
      </span>
    </Link>
  );
}
