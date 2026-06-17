import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, ladeStruktur,
  baueGliederungsbaum, type Sektion, type StrukturMap,
} from '../lib/normtext/browse';
import { GEBIET_LABEL } from '../lib/normtext/register';
import type { BrowseErlass, BrowseManifest } from '../lib/normtext/browse-typen';
import type { NormSnapshot } from '../lib/normtext/typen';

function formatiereDatum(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

function passtAufSuche(e: NormSnapshot, s: string): boolean {
  if (e.artikelLabel.toLowerCase().includes(s)) return true;
  return e.bloecke.some((b) =>
    b.text.toLowerCase().includes(s) || (b.items ?? []).some((it) => it.text.toLowerCase().includes(s)));
}

// Ein Artikel im Lesefluss (Richtung A): Serif-Lesespalte + Randtitel in echter
// Marginalspalte rechts (auf < lg über dem Artikel). Querverweise klickbar.
function ArtikelLeser({ e, erlass, basisPfad, marginalie }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; marginalie: string[];
}) {
  const [kopiert, setKopiert] = useState<'' | 'zitat' | 'link'>('');
  const zitat = `${e.artikelLabel} ${erlass.kuerzel}`;
  const kopiere = (was: 'zitat' | 'link') => {
    const text = was === 'zitat' ? zitat
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${basisPfad}#art-${e.artikel}`;
    void navigator.clipboard?.writeText(text).then(() => {
      setKopiert(was); window.setTimeout(() => setKopiert(''), 1500);
    });
  };
  return (
    <article id={`art-${e.artikel}`} className="group scroll-mt-28 lg:grid lg:grid-cols-[minmax(0,40rem)_12rem] lg:gap-x-6">
      <div className="order-2 lg:order-1">
        <div className="flex items-baseline gap-2">
          <h3 className="lc-overline text-brass-700">{e.artikelLabel}</h3>
          <span className="flex gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <button type="button" onClick={() => kopiere('zitat')} className="text-micro text-ink-400 hover:text-brass-700" aria-label={`${zitat} kopieren`}>
              {kopiert === 'zitat' ? '✓' : 'Zitat'}
            </button>
            <button type="button" onClick={() => kopiere('link')} className="text-micro text-ink-400 hover:text-brass-700" aria-label="Permalink kopieren">
              {kopiert === 'link' ? '✓' : 'Link'}
            </button>
          </span>
        </div>
        <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
          className="mt-1 space-y-2 font-serif text-[1.0625rem] leading-[1.6] text-ink-800" />
      </div>
      {/* Randtitel (Marginalie): sans, gedämpft, in der rechten Marge; auf Mobil
          als feine Zeile über dem Artikel. */}
      {marginalie.length > 0 && (
        <aside className="order-1 lg:order-2 mb-1 lg:mb-0 lg:pt-1">
          <p className="text-xs leading-snug text-ink-400">
            {marginalie.map((m, i) => (
              <span key={i} className={i === marginalie.length - 1 ? 'text-ink-500' : ''}>{m}{i < marginalie.length - 1 ? <br /> : null}</span>
            ))}
          </p>
        </aside>
      )}
    </article>
  );
}

// Überschrift einer Gliederungsstufe — ruhig, nach Ebene abgestuft (Légifrance-
// Lehre: nicht überladen). Ebene 1 trägt den stärksten Akzent.
function SektionKopf({ s, refCb, onToggle, offen, klappbar }: {
  s: Sektion; refCb: (el: HTMLElement | null) => void; onToggle?: () => void; offen?: boolean; klappbar?: boolean;
}) {
  const inner = (
    <>
      {s.ebene <= 1 && <span className="lc-overline text-brass-700 block">{romanFrei(s.label).pre}</span>}
      <span className={s.ebene <= 1 ? 'font-display text-h3 text-ink-900' : s.ebene === 2 ? 'font-display text-body-l text-ink-900' : 'font-medium text-body-s text-ink-700'}>
        {s.ebene <= 1 ? romanFrei(s.label).rest : s.label}
      </span>
    </>
  );
  return (
    <div ref={refCb} data-sek={s.id} className={`scroll-mt-28 ${s.ebene <= 1 ? 'mt-8 first:mt-0' : s.ebene === 2 ? 'mt-6' : 'mt-4'}`}>
      {klappbar ? (
        <button type="button" onClick={onToggle} aria-expanded={offen} className="w-full text-left flex items-baseline justify-between gap-2 group">
          <span>{inner}</span>
          <span className="text-ink-400 text-xs shrink-0">{offen ? '▾' : '▸'}</span>
        </button>
      ) : <div>{inner}</div>}
    </div>
  );
}

// «Erster Titel: Die Entstehung …» → {pre:'Erster Titel', rest:'Die Entstehung …'}
function romanFrei(label: string): { pre: string; rest: string } {
  const m = label.match(/^([^:]+):\s*(.+)$/);
  return m ? { pre: m[1], rest: m[2] } : { pre: '', rest: label };
}

function GesetzLeserInhalt({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;
  const [erlass, setErlass] = useState<BrowseErlass | null>(null);
  const [eintraege, setEintraege] = useState<NormSnapshot[] | null>(null);
  const [struktur, setStruktur] = useState<StrukturMap | null>(null);
  const [manifest, setManifest] = useState<BrowseManifest | null>(null);
  const [fehler, setFehler] = useState(false);
  const [suche, setSuche] = useState('');
  const [offen, setOffen] = useState<Record<string, boolean>>({});
  const [aktivPfad, setAktivPfad] = useState<string[]>([]);
  const [tocAuf, setTocAuf] = useState(false);
  const sekRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    let lebt = true;
    void ladeBrowseManifest().then((m) => { if (lebt) setManifest(m); });
    void ladeStruktur(ebene, schluessel).then((s) => { if (lebt) setStruktur(s); });
    void ladeErlass(schluessel).then(async (e) => {
      if (!lebt) return;
      if (!e || !e.datei) { setFehler(true); return; }
      setErlass(e);
      const datei = await ladeErlassDatei(e.datei);
      if (!lebt) return;
      if (!datei) { setFehler(true); return; }
      setEintraege(datei.eintraege);
    });
    return () => { lebt = false; };
  }, [ebene, schluessel]);

  const { sektionen, ohneGliederung } = useMemo(
    () => (eintraege ? baueGliederungsbaum(eintraege, struktur) : { sektionen: [], ohneGliederung: [] }),
    [eintraege, struktur],
  );

  // Pfad-Lookups je Sektion (für Breadcrumb-Scrollspy).
  const sekPfadMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const gehe = (liste: Sektion[], pfad: string[]) => {
      for (const s of liste) {
        const p = [...pfad, romanFrei(s.label).pre || s.label];
        map.set(s.id, p);
        gehe(s.kinder, p);
      }
    };
    gehe(sektionen, []);
    return map;
  }, [sektionen]);

  const istTopOffen = (id: string, idx: number) => offen[id] ?? (idx === 0);

  // Hash-Sprung: Top-Sektion des Ziel-Artikels öffnen + scrollen.
  useEffect(() => {
    if (!eintraege || !sektionen.length || typeof window === 'undefined') return;
    const m = window.location.hash.match(/^#art-(.+)$/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    const top = sektionen.find((s) => enthaeltToken(s, token));
    window.requestAnimationFrame(() => {
      if (top) setOffen((o) => ({ ...o, [top.id]: true }));
      window.setTimeout(() => {
        const el = document.getElementById(`art-${token}`);
        el?.scrollIntoView({ block: 'center', behavior: 'auto' });
        el?.classList.add('lc-ziel-blink');
        window.setTimeout(() => el?.classList.remove('lc-ziel-blink'), 2400);
      }, 90);
    });
  }, [eintraege, sektionen]);

  // Scrollspy: aktiver Pfad = oberste sichtbare Sektion (für Breadcrumb + TOC).
  useEffect(() => {
    if (!sektionen.length || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver((eintr) => {
      const sicht = eintr.filter((x) => x.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const id = sicht[0]?.target.getAttribute('data-sek');
      if (id) setAktivPfad(sekPfadMap.get(id) ?? []);
    }, { rootMargin: '-110px 0px -75% 0px' });
    sekRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sektionen, offen, sekPfadMap]);

  const sucheTrim = suche.trim().toLowerCase();
  const treffer = useMemo(
    () => (eintraege && sucheTrim ? eintraege.filter((e) => passtAufSuche(e, sucheTrim)) : null),
    [eintraege, sucheTrim],
  );

  const { vorher, nachher } = useMemo(() => {
    if (!manifest || !erlass) return { vorher: null as BrowseErlass | null, nachher: null as BrowseErlass | null };
    const g = manifest.erlasse.filter((e) => e.ebene === erlass.ebene && e.status === 'snapshot');
    const i = g.findIndex((e) => e.key === erlass.key);
    return { vorher: i > 0 ? g[i - 1] : null, nachher: i >= 0 && i < g.length - 1 ? g[i + 1] : null };
  }, [manifest, erlass]);

  if (fehler) {
    return (
      <div className="space-y-4">
        <Link to="/gesetze" className="text-body-s text-brass-700">‹ Zur Gesetzessammlung</Link>
        <div className="lc-notice lc-notice-warn">Dieser Erlass ist nicht als Volltext verfügbar.</div>
      </div>
    );
  }
  if (!erlass || !eintraege) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
        <p className="text-body-s text-ink-500">Der Erlass wird abgerufen …</p>
      </div>
    );
  }

  const regRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sekRefs.current.set(id, el); else sekRefs.current.delete(id);
  };
  const marg = (tok: string) => struktur?.[tok]?.marginalie ?? [];

  // Rekursives Rendern: Top-Sektionen sind klappbar (Perf + David «zuklappen»);
  // tiefere Sektionen fliessen innerhalb der offenen Top-Sektion durch.
  const renderSektion = (s: Sektion, tiefe: number, topIdx: number): ReactNode => {
    const top = tiefe === 0;
    const auf = top ? istTopOffen(s.id, topIdx) : true;
    return (
      <section key={s.id} className="space-y-3">
        <SektionKopf s={s} refCb={regRef(s.id)} klappbar={top} offen={auf}
          onToggle={top ? () => setOffen((o) => ({ ...o, [s.id]: !(o[s.id] ?? topIdx === 0) })) : undefined} />
        {auf && (
          <div className="space-y-5">
            {s.kinder.map((k) => renderSektion(k, tiefe + 1, topIdx))}
            {s.artikel.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} marginalie={marg(e.artikel)} />)}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-5">
      {/* Sticky Breadcrumb: Pfad + aktuelle Position beim Scrollen */}
      <div className="sticky top-0 z-10 -mx-5 sm:-mx-6 px-5 sm:px-6 py-2 border-b border-line bg-paper/90 backdrop-blur text-xs text-ink-500">
        <Link to="/gesetze" className="hover:text-brass-700">Gesetze</Link>
        <span className="mx-1.5 text-ink-300">›</span>
        {erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`}
        <span className="mx-1.5 text-ink-300">›</span>
        <span className="text-ink-700 font-medium">{erlass.kuerzel}</span>
        {aktivPfad.length > 0 && (
          <span className="hidden sm:inline">
            <span className="mx-1.5 text-ink-300">·</span>
            {aktivPfad.join(' › ')}
          </span>
        )}
      </div>

      {/* Kopf */}
      <header className="space-y-2 border-b border-line pb-5">
        <p className="lc-overline">{erlass.ebene === 'bund' ? 'Bundesgesetz' : `Kanton ${erlass.kanton}`} · {GEBIET_LABEL[erlass.rechtsgebiet]}</p>
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">
          {erlass.kuerzel} <span className="text-ink-400 font-normal">— {erlass.titel}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          {erlass.sr && <span>SR <span className="num">{erlass.sr}</span></span>}
          <span><span className="num">{eintraege.length}</span> Artikel</span>
          {erlass.stand && <span>Stand <span className="num">{formatiereDatum(erlass.stand)}</span></span>}
          {erlass.quelleUrl && (
            <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">↗ geltende Fassung</a>
          )}
        </div>
        <p className="text-micro text-ink-400">Snapshot — massgeblich ist die amtliche Fassung (Live-Link).</p>
      </header>

      <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
        placeholder="Im Gesetz suchen (Artikel, Wortlaut) …" aria-label="Im Gesetz suchen"
        className="lc-input h-9 py-0 text-body-s w-full max-w-md" />

      <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        {/* TOC: Gliederungsbaum */}
        {!treffer && sektionen.length > 0 && (
          <aside className="mb-4 lg:mb-0">
            <button type="button" onClick={() => setTocAuf((v) => !v)} className="lg:hidden text-micro text-brass-700 mb-1">
              {tocAuf ? 'Gliederung ausblenden' : 'Gliederung anzeigen'}
            </button>
            <div className={`${tocAuf ? 'block' : 'hidden'} lg:block lg:sticky lg:top-12 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto`}>
              <p className="lc-overline mb-2">Gliederung</p>
              <SektionBaumTOC sektionen={sektionen} aktivPfad={aktivPfad}
                onSprung={(id) => {
                  setOffen((o) => ({ ...o, [topOf(sektionen, id)]: true }));
                  window.requestAnimationFrame(() =>
                    window.setTimeout(() => sekRefs.current.get(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60));
                }} />
            </div>
          </aside>
        )}

        <div>
          {treffer ? (
            <div className="space-y-4 max-w-[40rem]">
              <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{suche.trim()}»</p>
              {treffer.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} marginalie={marg(e.artikel)} />)}
              {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Artikel gefunden.</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {ohneGliederung.length > 0 && (
                <div className="space-y-5 mb-6">
                  {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} marginalie={marg(e.artikel)} />)}
                </div>
              )}
              {sektionen.map((s, i) => renderSektion(s, 0, i))}
            </div>
          )}

          <nav className="mt-12 border-t border-line pt-5 flex justify-between gap-4 text-body-s" aria-label="Weitere Erlasse">
            {vorher ? <Link to={`/gesetze/${vorher.ebene}/${encodeURIComponent(vorher.key)}`} className="text-brass-700 hover:underline">‹ {vorher.kuerzel}</Link> : <span />}
            <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">Übersicht</Link>
            {nachher ? <Link to={`/gesetze/${nachher.ebene}/${encodeURIComponent(nachher.key)}`} className="text-brass-700 hover:underline text-right">{nachher.kuerzel} ›</Link> : <span />}
          </nav>
        </div>
      </div>
    </div>
  );
}

function enthaeltToken(s: Sektion, token: string): boolean {
  return s.artikel.some((e) => e.artikel === token) || s.kinder.some((k) => enthaeltToken(k, token));
}
function topOf(sektionen: Sektion[], id: string): string {
  for (const s of sektionen) { if (findeId(s, id)) return s.id; }
  return id;
}
function findeId(s: Sektion, id: string): boolean {
  return s.id === id || s.kinder.some((k) => findeId(k, id));
}

// TOC-Baum der Gliederung — kompakt, aktiver Pfad hervorgehoben.
function SektionBaumTOC({ sektionen, aktivPfad, onSprung }: {
  sektionen: Sektion[]; aktivPfad: string[]; onSprung: (id: string) => void;
}) {
  const zeile = (s: Sektion, tiefe: number): ReactNode => {
    const label = romanFrei(s.label);
    const aktiv = aktivPfad.includes(label.pre || s.label);
    return (
      <li key={s.id}>
        <button type="button" onClick={() => onSprung(s.id)}
          className={`block w-full text-left rounded px-2 py-0.5 text-body-s transition-colors ${aktiv ? 'text-ink-900 font-medium bg-brass-100/40' : 'text-ink-600 hover:text-ink-900 hover:bg-paper-sunken/60'}`}
          style={{ paddingLeft: `${0.5 + tiefe * 0.75}rem` }}>
          {label.pre || s.label}
        </button>
        {s.kinder.length > 0 && <ul>{s.kinder.map((k) => zeile(k, tiefe + 1))}</ul>}
      </li>
    );
  };
  return <ul className="space-y-0.5">{sektionen.map((s) => zeile(s, 0))}</ul>;
}

export function GesetzLeser() {
  const { ebene, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  return <GesetzLeserInhalt key={schluessel} ebene={ebene ?? ''} schluessel={schluessel} />;
}
