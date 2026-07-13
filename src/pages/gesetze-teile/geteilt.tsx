// H-10 (§6.6 billig, B27): geteilte Bausteine für die gesetze-teile-Module
// (BundSystematik.tsx, KantonSystematik.tsx) sowie für Gesetze.tsx selbst
// (Gitter in der Such-Trefferliste). Reiner Move aus Gesetze.tsx —
// Verhalten/Props unverändert.
import { usePaneKlasse } from '../../components/layout/PaneKontext';
import { ErlassKarte, ErlassZeile } from '../../components/normtext/ErlassKarte';
import { type BrowseErlass } from '../../lib/normtext/browse-typen';

export function Gitter({ erlasse }: { erlasse: BrowseErlass[] }) {
  const pk = usePaneKlasse();
  return (
    <div className={pk('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', 'grid grid-cols-1 @lg/pane:grid-cols-2 @3xl/pane:grid-cols-3 gap-3')}>
      {erlasse.map((e) => <ErlassKarte key={e.key} e={e} />)}
    </div>
  );
}

// Ausführungsrecht (Verordnung/Reglement) erkennt man am Titel — rein für die
// ANZEIGE-Hierarchie (Leitgesetze prominent, Verordnungen dezent); ändert keine
// Rechtslogik. Echte Gesetze tragen «Verordnung» nicht im Titel.
// (Nur modulintern verwendet — kein Export: Fast-Refresh-Regel, Datei exportiert Komponenten.)
const istVerordnung = (e: BrowseErlass) => /verordnung|reglement/i.test(e.titel);

// Eine aufklappbare Systematik-Kategorie (modulweit, kontrolliert über offen/onToggle).
export function Kategorie({ id, offen, onToggle, kopf, anzahl, children }: {
  id?: string; offen: boolean; onToggle: () => void; kopf: React.ReactNode; anzahl: number; children: React.ReactNode;
}) {
  return (
    <details id={id} open={offen}
      onToggle={(e) => { if ((e.currentTarget as HTMLDetailsElement).open !== offen) onToggle(); }}
      className="group lc-card overflow-hidden scroll-mt-24">
      <summary className="flex items-baseline gap-3 cursor-pointer select-none px-5 py-3.5 hover:bg-brass-100/30">
        {kopf}
        <span className="num text-body-s text-ink-500 ml-auto">{anzahl}</span>
      </summary>
      <div className="px-5 pb-5 pt-4 space-y-5 border-t border-line">{children}</div>
    </details>
  );
}

// Inhalt einer Untergruppe: Leitgesetze als Karten, untergeordnetes
// Ausführungsrecht (Verordnungen/Reglemente) dezent als eingerückte Liste.
export function GruppenInhalt({ titel, items }: { titel: string; items: BrowseErlass[] }) {
  const pk = usePaneKlasse();
  const gesetze = items.filter((e) => !istVerordnung(e));
  const verordnungen = items.filter(istVerordnung);
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-3">
        <h3 className="lc-overline text-brass-700">{titel}</h3>
        <span aria-hidden className="flex-1 h-px bg-line" />
      </div>
      {gesetze.length > 0 && <Gitter erlasse={gesetze} />}
      {verordnungen.length > 0 && (
        <div className="pl-3 border-l-2 border-line/70 ml-0.5">
          <p className="lc-overline mb-1">Verordnungen &amp; Ausführungsrecht</p>
          <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-x-4', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-x-4')}>
            {verordnungen.map((e) => <ErlassZeile key={e.key} e={e} />)}
          </div>
        </div>
      )}
    </div>
  );
}
