import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RECHTSGEBIETE, RECHTSGEBIET_SEKTIONEN, istVerfuegbar, istAktiv, type CalculatorCard } from '../lib/startseiteConfig';
import { RECHTSBEREICH_GRUPPEN } from '../lib/rechtsbereichGruppen';
import { kartePasst, sucheRang } from '../lib/katalogSuche';
import { RechnerKarte } from './RechnerKarte';
import { sansAmp } from './typografie';

// Katalog der Hauptseite «/» (eine Hauptseite seit 7.6.2026).
// Anatomie seit 6.6.2026 (Auftrag David, «Kachel-Katalog»): Die Rechtsgebiete
// erscheinen als KOMPAKTE KACHELN unter ihren juristischen Obergruppen; ein
// Klick öffnet das Gebiet als volle Breite direkt unter der Kachel-Zeile
// (die übrigen Kacheln rutschen nach unten), ein zweiter Klick schliesst.
// Eine aktive Suche (?q=) ersetzt das Raster durch eine flache,
// deterministisch gerankte Trefferliste (Titel > Keyword exakt > Keyword >
// Norm > Gebiet).
//
// Radikal-Verschlankung 7.6.2026 (Auftrag David «mache das alles weg»):
// Das REGISTER ist die ganze Seite — Tabs (Verfügbar/Gesamt), Typ-Filter,
// Chip-Einstiege, «Zuletzt verwendet» und das seiteneigene Suchfeld sind
// ENTFERNT; die Suche lebt im Header (HeaderSuche schreibt ?q=). Gezeigt
// wird immer der GESAMTE Katalog — das ehrliche Mengenbild tragen die
// Kachel-Zähler («N verfügbar · M in Vorbereitung», §8); Alt-Parameter
// ?ansicht= wird ignoriert und bleibt harmlos.

// ─── Karten-Sortierung innerhalb eines Gebiets: verfügbare vor geplanten ────

function sortiereKarten(karten: CalculatorCard[]): CalculatorCard[] {
  const hatAktiv = new Set(karten.filter((k) => k.status !== 'geplant').map((k) => k.rechtsgebiet));
  const gebietsRang = (g: string) => {
    const idx = RECHTSGEBIETE.indexOf(g);
    return (hatAktiv.has(g) ? 0 : RECHTSGEBIETE.length + 1) + (idx === -1 ? RECHTSGEBIETE.length : idx);
  };
  return [...karten].sort((a, b) =>
    gebietsRang(a.rechtsgebiet) - gebietsRang(b.rechtsgebiet) ||
    Number(a.status === 'geplant') - Number(b.status === 'geplant'));
}

// ─── Gebiet-Kachel: kleines Viereck mit Inhaltsangabe ───────────────────────
// «Was ist drin?» konkret: die verfügbaren Werkzeug-Titel (geklemmt), sonst
// die Gebiets-Lede; der Zähler trägt das ehrliche Mengenbild (§8).
// Klick → die Kachel weicht ihrem Panel an Ort und Stelle; die ÜBRIGEN
// Kacheln bleiben sichtbar und rutschen nach unten (Wunsch David 6.6.2026).
// Eigener view-transition-name je Kachel: der Browser animiert das
// Nachrutschen jedes Vierecks einzeln (View Transitions; ohne Support hart).

function GebietKachel({ gebiet, karten, onOeffnen }: {
  gebiet: { name: string; id: string; lede: string };
  karten: CalculatorCard[];
  onOeffnen: () => void;
}) {
  const verf = karten.filter(istVerfuegbar);
  const geplant = karten.length - verf.length;
  const inhalt = verf.length > 0 ? verf.map((k) => k.title).join(' · ') : gebiet.lede;

  return (
    <button type="button" onClick={onOeffnen} id={`kachel-${gebiet.id}`}
      style={{ viewTransitionName: `kachel-${gebiet.id}` }}
      className="lc-card text-left p-5 flex flex-col gap-2 min-w-0 scroll-mt-28 bg-surface transition-all motion-reduce:transition-none motion-reduce:transform-none cursor-pointer hover:shadow-lg hover:-translate-y-0.5">
      <span className="flex items-start justify-between gap-2">
        <span className="font-sans font-semibold text-ink-900 text-body-l leading-snug text-balance">{sansAmp(gebiet.name)}</span>
        <span aria-hidden className="text-brass-700 leading-none mt-1">▸</span>
      </span>
      <span className="lc-overline text-ink-500">
        {verf.length > 0 && <><span className="num text-brass-700">{verf.length}</span> verfügbar</>}
        {verf.length > 0 && geplant > 0 && ' · '}
        {geplant > 0 && <><span className="num">{geplant}</span> in Vorbereitung</>}
      </span>
      {/* Inhaltsangabe auf EINE Zeile geklemmt (U4): einheitliche Kachel-
          höhe, scanbare Spalten; der Volltext steht im Panel. */}
      <span className="text-body-s text-ink-500 leading-relaxed line-clamp-1">{inhalt}</span>
    </button>
  );
}

// ─── Gebiet-Panel: volle Breite an der Stelle der angeklickten Kachel ───────
// Untergruppen «Rechner» und «Vorlagen» wie bisher (feste Auftrags-Ordnung);
// «Schliessen» (oder Zurück-Taste, ?gebiet=) stellt die Kachel wieder her.

function GebietPanel({ gebiet, karten, onSchliessen }: {
  gebiet: { name: string; id: string; lede: string };
  karten: CalculatorCard[];
  onSchliessen: () => void;
}) {
  const gruppen = ([
    { id: 'rechner', titel: 'Rechner', karten: karten.filter((k) => k.modus === 'rechner') },
    { id: 'vorlagen', titel: 'Vorlagen', karten: karten.filter((k) => k.modus === 'vorlage') },
  ] as const).filter((g) => g.karten.length > 0);
  if (gruppen.length === 0) return null;

  return (
    <section id={`panel-${gebiet.id}`} aria-label={gebiet.name} tabIndex={-1}
      style={{ viewTransitionName: 'gebiet-panel' }}
      className="lc-reveal-panel col-span-full scroll-mt-28 bg-surface rounded-2xl border border-line p-6 sm:p-8 space-y-6 focus:outline-none">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{sansAmp(gebiet.name)}</h3>
          <p className="text-body-s text-ink-500 max-w-reading">{gebiet.lede}</p>
        </div>
        <button type="button" onClick={onSchliessen}
          className="shrink-0 text-body-s font-medium text-ink-500 hover:text-brass-700 transition-colors">
          Schliessen <span aria-hidden>✕</span>
        </button>
      </div>
      {gruppen.map((g) => (
        <div key={g.id}>
          <div className="flex items-center gap-4 mb-4">
            <h4 className="lc-overline text-ink-700">{g.titel}</h4>
            <div className="flex-1 h-px bg-line" />
            <span className="lc-overline num text-ink-500">{g.karten.length}</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-6">
            {sortiereKarten(g.karten).map((c) => (
              <RechnerKarte key={c.id} card={c} headingLevel="h5" />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── Treffer-Zeile: kompakte Zeile der flachen Suchergebnis-Liste ───────────

function TrefferZeile({ k }: { k: CalculatorCard }) {
  const aktiv = istAktiv(k.status) && !!k.href;
  const inhalt = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block font-sans font-medium text-ink-900 text-body-l leading-snug">{sansAmp(k.title)}</span>
        <span className="block text-body-s text-ink-500 truncate">{k.rechtsgebiet} · {k.modus === 'vorlage' ? 'Vorlage' : 'Rechner'}</span>
      </span>
      <span className="flex items-center gap-3 shrink-0">
        {k.status === 'entwurf' && <span className="lc-badge-entwurf" title="erstellt, fachlich noch nicht geprüft">Entwurf</span>}
        {k.status === 'geplant' && <span className="lc-badge lc-badge-soft">In Vorbereitung</span>}
        {aktiv && <span className="text-body-s font-medium text-brass-700 whitespace-nowrap">{k.modus === 'vorlage' ? 'Erstellen →' : 'Öffnen →'}</span>}
      </span>
    </>
  );
  const klasse = 'flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-line bg-surface no-underline';
  return aktiv ? (
    <Link to={k.href!}
      className={`${klasse} hover:border-brass-400 hover:bg-brass-100/30 transition-colors motion-reduce:transition-none`}>
      {inhalt}
    </Link>
  ) : (
    <div className={klasse}>{inhalt}</div>
  );
}

// ─── Katalog: das Register (Kacheln/Panels) + Trefferliste bei ?q= ──────────

export function Katalog({ karten }: { karten: CalculatorCard[] }) {
  // ── URL-Zustand: offenes Gebiet + Suche (teilbar) ──
  const [searchParams, setSearchParams] = useSearchParams();
  const offenGebiet = searchParams.get('gebiet');
  const patchParams = (patch: Record<string, string | null>, viewTransition = false) => {
    const p = new URLSearchParams(searchParams);
    for (const [key, wert] of Object.entries(patch)) {
      if (wert === null) p.delete(key); else p.set(key, wert);
    }
    // viewTransition: Raster ⇄ Fokus-Panel weich überblenden (View
    // Transitions API via Router; Browser ohne Support wechseln hart,
    // prefers-reduced-motion wird von der globalen Regel abgedeckt).
    setSearchParams(p, viewTransition ? { viewTransition: true } : undefined);
  };
  const toggleGebiet = (id: string) =>
    patchParams({ gebiet: offenGebiet === id ? null : id }, true);

  // Suche kommt aus der URL (?q=, geschrieben von der Header-Suche);
  // Zurücksetzen löscht nur den Parameter.
  const suche = searchParams.get('q') ?? '';
  const sucheZuruecksetzen = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('q');
    setSearchParams(p, { replace: true });
  };

  // Fokus-Verwaltung des Kachel↔Panel-Tauschs (Deploy-Bug-Check 7.6.2026,
  // MITTEL/a11y): das fokussierte Element verschwindet beim Öffnen wie beim
  // Schliessen aus dem DOM, der Fokus fiel auf <body>. Beim Öffnen erhält
  // das Panel den Fokus (tabIndex -1), beim Schliessen wieder die Kachel.
  const vorherOffen = useRef<string | null>(null);
  useEffect(() => {
    const vorher = vorherOffen.current;
    vorherOffen.current = offenGebiet;
    if (offenGebiet) {
      document.getElementById(`panel-${offenGebiet}`)?.focus({ preventScroll: true });
    } else if (vorher) {
      document.getElementById(`kachel-${vorher}`)?.focus({ preventScroll: true });
    }
  }, [offenGebiet]);

  const q = suche.trim();
  // Treffer-Semantik lebt in lib/katalogSuche.ts (Etappe 0.1) — dieselbe
  // Logik, gegen die auch die Suchbegriff-Goldliste testet; die früheren
  // Pill-Filter sind entfernt (leere Mengen).
  const passt = (k: CalculatorCard) =>
    kartePasst(k, { gebiete: new Set<string>(), bereiche: new Set<string>(), arten: new Set<string>(), nurVerfuegbar: false, suche });
  const treffer = karten.filter(passt);
  // Rang je Karte EINMAL berechnen, dann sortieren (/simplify 7.6.2026:
  // der Comparator rief sucheRang zuvor O(n log n)-fach neu auf).
  const trefferSortiert = q === '' ? treffer : treffer
    .map((k) => [k, sucheRang(k, suche) ?? 9] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k);

  // Rechtsgebiete in FESTER Auftrags-Reihenfolge (RECHTSGEBIETE pur), als
  // Kacheln unter ihren Obergruppen; leere Gebiete/Gruppen entfallen.
  const gebietSichtbar = [...RECHTSGEBIET_SEKTIONEN]
    .sort((a, b) => RECHTSGEBIETE.indexOf(a.name) - RECHTSGEBIETE.indexOf(b.name))
    .map((g) => ({ g, karten: karten.filter((k) => k.rechtsgebiet === g.name) }))
    .filter((x) => x.karten.length > 0);
  const sektionFuer = new Map(gebietSichtbar.map((x) => [x.g.name, x]));
  const gruppenSichtbar = RECHTSBEREICH_GRUPPEN
    .map((gr) => ({ gr, sektionen: gr.gebiete.map((n) => sektionFuer.get(n)).filter((x): x is NonNullable<typeof x> => !!x) }))
    .filter((x) => x.sektionen.length > 0);

  return (
    <div className="space-y-8">
      {q !== '' ? (
        trefferSortiert.length === 0 ? (
          /* Leerer Zustand: kein stilles Verschwinden */
          <section className="bg-surface rounded-2xl border border-line p-10 sm:p-14 text-center space-y-3">
            <p className="lc-overline">Keine Treffer</p>
            <h2 className="font-display font-semibold text-ink-900 text-h2">
              Nichts gefunden für «{q}».
            </h2>
            <p className="text-body-s text-ink-500 max-w-reading mx-auto">
              Versuchen Sie einen anderen Begriff (z. B. einen Gesetzesartikel wie «Art. 336c»)
              oder setzen Sie die Suche zurück.
            </p>
            <button type="button" onClick={sucheZuruecksetzen} className="lc-btn-outline mt-2">
              Suche zurücksetzen
            </button>
          </section>
        ) : (
          /* Flache, gerankte Trefferliste — Suchen-und-Öffnen ohne Umweg */
          <section aria-label="Suchtreffer" className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <p className="lc-overline text-ink-500"><span className="num">{trefferSortiert.length}</span> Treffer</p>
              <button type="button" onClick={sucheZuruecksetzen}
                className="text-body-s text-ink-500 hover:text-brass-700 transition-colors">
                Zurücksetzen
              </button>
            </div>
            <div className="space-y-2">
              {trefferSortiert.map((k) => <TrefferZeile key={k.id} k={k} />)}
            </div>
          </section>
        )
      ) : (
        /* Kachel-Katalog (Auftrag David 6.6.2026, präzisiert): Obergruppen
           als ruhige Trenner, darunter die Gebiets-Kacheln. Die angeklickte
           Kachel weicht ihrem Panel an Ort und Stelle (col-span-full);
           die ÜBRIGEN Kacheln bleiben sichtbar und rutschen nach unten —
           animiert über je einen eigenen view-transition-name. */
        gruppenSichtbar.map((x) => (
          <section key={x.gr.id} aria-labelledby={`gruppe-${x.gr.id}`} className="space-y-4">
            {/* Obergruppe als STILLE Overline (U4): das Register trägt die
                Hierarchie typografisch, nicht mit fünf Linealen. */}
            <div className="flex items-center gap-4 pt-1">
              <h2 id={`gruppe-${x.gr.id}`} className="lc-overline text-ink-700 whitespace-nowrap">
                {sansAmp(x.gr.label)}
              </h2>
              <span aria-hidden className="flex-1 h-px bg-line" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4">
              {x.sektionen.map((sx) => (
                offenGebiet === sx.g.id ? (
                  <GebietPanel key={sx.g.id} gebiet={sx.g} karten={sx.karten}
                    onSchliessen={() => toggleGebiet(sx.g.id)} />
                ) : (
                  <GebietKachel key={sx.g.id} gebiet={sx.g} karten={sx.karten}
                    onOeffnen={() => toggleGebiet(sx.g.id)} />
                )
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
