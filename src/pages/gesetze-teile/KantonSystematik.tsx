// H-10 (§6.6 billig, B27): reiner Move aus Gesetze.tsx — Props/Verhalten unverändert.
import { useMemo, useState } from 'react';
import { usePaneKlasse } from '../../components/layout/PaneKontext';
import { SysZeile } from '../../components/normtext/ErlassKarte';
import { type BrowseErlass } from '../../lib/normtext/browse-typen';
import {
  sachgruppe, topTitel, subTitel, sachgebietRang, untergruppeRang, srVergleich, type KantonSystematik,
} from '../../lib/normtext/systematik';
import { Kategorie } from './geteilt';

// SysZeile (kompakte, überlaufsichere Kanton-Erlass-Zeile) + standJahr leben
// jetzt in ErlassKarte.tsx (geteilt mit den Relevanz-/Rechtsgebiet-Sichten,
// GesetzeGliederung.tsx) — A14-Titelumbruch dort. Hier nur importiert.

// Ein gewählter Kanton, gegliedert nach der OFFIZIELLEN Systematik (systematik.ts:
// Top-Sachgebiet + Untergruppe aus dem amtlichen clex-Baum). Übersicht zuerst:
// alle Top-Sektionen eingeklappt (Sachgebiete des Kantons auf einen Blick), Klick
// öffnet eine; «Alle auf-/zuklappen». Im Inneren je Untergruppe ein Zwischen-
// titel, darunter nach SR-Nr sortierte Zeilen. Die Seiten-Suche liefert die
// flache Trefferliste — diese gegliederte Ansicht zeigt sich nur ohne Suche.
export function KantonSystematik({ erlasse, sys }: { erlasse: BrowseErlass[]; sys?: KantonSystematik }) {
  const pk = usePaneKlasse();
  const gruppen = useMemo(() => {
    const rangTop = sachgebietRang(sys);
    const tops = new Map<string, Map<string, BrowseErlass[]>>();
    for (const e of erlasse) {
      const { top, sub } = sachgruppe(sys, e.sr);
      if (!tops.has(top)) tops.set(top, new Map());
      const subs = tops.get(top)!;
      if (!subs.has(sub)) subs.set(sub, []);
      subs.get(sub)!.push(e);
    }
    const alle = [...tops.entries()]
      .sort((a, b) => rangTop(a[0]) - rangTop(b[0]) || a[0].localeCompare(b[0], 'de', { numeric: true }))
      .map(([top, subs]) => {
        const rangSub = untergruppeRang(sys, top);
        const anzahl = [...subs.values()].reduce((n, arr) => n + arr.length, 0);
        const untergruppen = [...subs.entries()]
          .sort((a, b) => rangSub(a[0]) - rangSub(b[0]) || a[0].localeCompare(b[0], 'de', { numeric: true }))
          .map(([sub, items]) => ({
            sub,
            titel: subTitel(sys, top, sub),
            items: items.sort((a, b) => srVergleich(a.sr, b.sr) || a.titel.localeCompare(b.titel, 'de')),
          }));
        // amtlich = das Top-Sachgebiet trägt einen verifizierten Namen aus dem
        // Systematik-Baum. `false` = Fallback-Bucket (Sammlungs-Kürzel «LS»/«bGS»
        // oder «~» ohne Nummer), das sonst als vermeintliches Sachgebiet in die UI
        // lecken würde (§4.3.5). Reine Anzeige-Prüfung auf der `sys`-Prop (§3).
        const amtlich = !!sys?.roots.find((x) => x.nummer === top);
        return { top, amtlich, titel: topTitel(sys, top), anzahl, untergruppen };
      });
    // Roh-Code→Klartext (Gesetzes-UX G5 · §4.3.5): Buckets ohne amtlichen
    // Sachgebiets-Namen (interne Sammlungs-Kürzel «LS»/«bGS» oder «~» ohne Nummer,
    // die sonst als vermeintliches Sachgebiet «Bereich LS» in die UI lecken) werden
    // ehrlich zu EINEM «Nicht systematisiert»-Block gebündelt (§8). Der Roh-Code
    // bleibt je Erlass an der systematischen Nummer sichtbar (SysZeile); erfunden
    // wird kein Sachgebietsname.
    const amtlich = alle.filter((g) => g.amtlich);
    const rest = alle.filter((g) => !g.amtlich);
    if (rest.length === 0) return amtlich;
    const restItems = rest
      .flatMap((g) => g.untergruppen.flatMap((u) => u.items))
      .sort((a, b) => srVergleich(a.sr, b.sr) || a.titel.localeCompare(b.titel, 'de'));
    return [
      ...amtlich,
      {
        top: '__nicht_systematisiert__', amtlich: false, titel: 'Nicht systematisiert',
        anzahl: restItems.length,
        untergruppen: [{ sub: '', titel: '', items: restItems }],
      },
    ];
  }, [erlasse, sys]);

  const alleIds = gruppen.map((g) => g.top);
  const [offen, setOffen] = useState<Set<string>>(() => new Set());
  const alleOffen = alleIds.length > 0 && offen.size >= alleIds.length;
  const toggle = (id: string) => setOffen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAlle = () => setOffen(alleOffen ? new Set() : new Set(alleIds));

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button type="button" onClick={toggleAlle}
          className="text-body-s font-medium text-brass-700 hover:text-brass-600 transition-colors">
          {alleOffen ? 'Alle einklappen' : 'Alle aufklappen'}
        </button>
      </div>
      {gruppen.map((g) => (
        <Kategorie key={g.top} offen={offen.has(g.top)} onToggle={() => toggle(g.top)} anzahl={g.anzahl}
          kopf={
            g.amtlich ? (
              <span className="flex items-baseline gap-2.5 min-w-0">
                <span aria-hidden className="num font-display text-h3 leading-none text-brass-700 shrink-0">{g.top}</span>
                {/* N10: nicht hart einzeilig kürzen (lange Sachgebietstitel werden auf
                    Mobil sonst abgeschnitten) — bis zu zwei Zeilen, dann erst ellipsis. */}
                <span className="font-sans font-semibold text-ink-900 text-h3 tracking-tight line-clamp-2">{g.titel}</span>
              </span>
            ) : (
              // Fallback-Block (§4.3.5): KEIN Roh-Code-Badge — der Sammlungs-Code ist
              // kein Sachgebiet. Ehrlicher, gedämpfter Kopf (§8).
              <span className="flex flex-col min-w-0">
                <span className="font-sans font-semibold text-ink-700 text-h3 tracking-tight line-clamp-2">{g.titel}</span>
                <span className="text-body-s text-ink-500 font-normal">Kein amtliches Sachgebiet hinterlegt — nach systematischer Nummer geordnet.</span>
              </span>
            )
          }>
          <div className="space-y-4">
            {g.untergruppen.map((u) => (
              <section key={u.sub || '_'} className="space-y-1.5">
                {u.titel && (
                  <div className="flex items-baseline gap-2">
                    <span aria-hidden className="num text-xs text-brass-700 shrink-0">{u.sub}</span>
                    <h4 className="lc-overline text-brass-700">{u.titel}</h4>
                    <span className="text-ink-500 text-xs">· {u.items.length}</span>
                    <span aria-hidden className="flex-1 h-px bg-line/70" />
                  </div>
                )}
                <div className={pk('grid grid-cols-1 sm:grid-cols-2 gap-x-5', 'grid grid-cols-1 @lg/pane:grid-cols-2 gap-x-5')}>
                  {u.items.map((e) => <SysZeile key={e.key} e={e} />)}
                </div>
              </section>
            ))}
          </div>
        </Kategorie>
      ))}
    </div>
  );
}
