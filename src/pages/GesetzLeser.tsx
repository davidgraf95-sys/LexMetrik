import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import { GesetzTOC } from '../components/normtext/GesetzTOC';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, baueBaender, bandFuerToken, type Band,
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

// Ein Artikel im Lesefluss: Anker, Label, Zitier-/Permalink-Knopf, Volltext.
function ArtikelLeser({ e, erlass, basisPfad }: { e: NormSnapshot; erlass: BrowseErlass; basisPfad: string }) {
  const [kopiert, setKopiert] = useState<'' | 'zitat' | 'link'>('');
  const zitat = `${e.artikelLabel} ${erlass.kuerzel}`;
  const kopiere = (was: 'zitat' | 'link') => {
    const text = was === 'zitat' ? zitat
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${basisPfad}#art-${e.artikel}`;
    void navigator.clipboard?.writeText(text).then(() => {
      setKopiert(was);
      window.setTimeout(() => setKopiert(''), 1500);
    });
  };
  return (
    <article id={`art-${e.artikel}`} className="group scroll-mt-24 border-t border-line/70 pt-4 first:border-t-0">
      <div className="flex items-baseline gap-2">
        <h3 className="lc-overline text-ink-700">{e.artikelLabel}</h3>
        <span className="flex gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button type="button" onClick={() => kopiere('zitat')}
            className="text-micro text-ink-400 hover:text-brass-700" aria-label={`${zitat} kopieren`}>
            {kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}
          </button>
          <button type="button" onClick={() => kopiere('link')}
            className="text-micro text-ink-400 hover:text-brass-700" aria-label="Permalink kopieren">
            {kopiert === 'link' ? '✓ kopiert' : 'Link'}
          </button>
        </span>
      </div>
      <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }}
        className="mt-1 space-y-2 text-ink-800" />
    </article>
  );
}

// Innerer Leser: bekommt den Schlüssel als Prop und wird vom Wrapper mit
// key={schluessel} gemountet → Erlasswechsel = Remount, alle Zustände frisch
// (kein Reset-Effekt nötig; React-19-Lint react-hooks/set-state-in-effect).
function GesetzLeserInhalt({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;

  const [erlass, setErlass] = useState<BrowseErlass | null>(null);
  const [eintraege, setEintraege] = useState<NormSnapshot[] | null>(null);
  const [manifest, setManifest] = useState<BrowseManifest | null>(null);
  const [fehler, setFehler] = useState(false);
  const [suche, setSuche] = useState('');
  // Offen-Zustand der Bänder: fehlender Schlüssel = offen (Default Lesefluss).
  const [offen, setOffen] = useState<Record<string, boolean>>({});
  const [aktivBand, setAktivBand] = useState<string | null>(null);
  const bandRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    let lebt = true;
    void ladeBrowseManifest().then((m) => { if (lebt) setManifest(m); });
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
  }, [schluessel]);

  const baender = useMemo<Band[]>(() => (eintraege ? baueBaender(eintraege) : []), [eintraege]);

  // Hash-Sprung (#art-token, z.B. aus dem Popover): Band öffnen + scrollen.
  // setState steht in requestAnimationFrame (nicht synchron im Effekt-Körper).
  useEffect(() => {
    if (!eintraege || typeof window === 'undefined') return;
    const m = window.location.hash.match(/^#art-(.+)$/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    const bi = bandFuerToken(baender, token);
    if (bi < 0) return;
    window.requestAnimationFrame(() => {
      setOffen((o) => ({ ...o, [baender[bi].id]: true }));
      const el = document.getElementById(`art-${token}`);
      el?.scrollIntoView({ block: 'center', behavior: 'auto' });
      el?.classList.add('lc-ziel-blink');
      window.setTimeout(() => el?.classList.remove('lc-ziel-blink'), 2400);
    });
  }, [eintraege, baender]);

  // Scrollspy: aktives Band = oberstes sichtbares (setState im Observer-Callback).
  useEffect(() => {
    if (!baender.length || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      (eintr) => {
        const sicht = eintr.filter((x) => x.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (sicht[0]) setAktivBand(sicht[0].target.getAttribute('data-band'));
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    bandRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [baender, offen]);

  const sucheTrim = suche.trim().toLowerCase();
  const treffer = useMemo(
    () => (eintraege && sucheTrim ? eintraege.filter((e) => passtAufSuche(e, sucheTrim)) : null),
    [eintraege, sucheTrim],
  );

  // Nachbarn + Verwandte aus dem Manifest (gleiche Ebene / gleiches Gebiet).
  const { vorher, nachher, verwandte } = useMemo(() => {
    if (!manifest || !erlass) return { vorher: null as BrowseErlass | null, nachher: null as BrowseErlass | null, verwandte: [] as BrowseErlass[] };
    const gleicheEbene = manifest.erlasse.filter((e) => e.ebene === erlass.ebene && e.status === 'snapshot');
    const i = gleicheEbene.findIndex((e) => e.key === erlass.key);
    return {
      vorher: i > 0 ? gleicheEbene[i - 1] : null,
      nachher: i >= 0 && i < gleicheEbene.length - 1 ? gleicheEbene[i + 1] : null,
      verwandte: gleicheEbene.filter((e) => e.rechtsgebiet === erlass.rechtsgebiet && e.key !== erlass.key).slice(0, 3),
    };
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
        {/* Eigener Lade-Text (nicht «Wird geladen», s. prerender-Drift-Tor). */}
        <p className="text-body-s text-ink-500">Der Erlass wird abgerufen …</p>
      </div>
    );
  }

  const alleOffen = baender.every((b) => offen[b.id] ?? true);

  return (
    <div className="space-y-5">
      {/* Brotkrumen */}
      <nav className="text-xs text-ink-500" aria-label="Pfad">
        <Link to="/gesetze" className="hover:text-brass-700">Gesetze</Link>
        <span className="mx-1.5 text-ink-300">›</span>
        {erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`}
        <span className="mx-1.5 text-ink-300">›</span>
        <span className="text-ink-600">{GEBIET_LABEL[erlass.rechtsgebiet]}</span>
      </nav>

      {/* Kopf */}
      <header className="space-y-2 border-b border-line pb-5">
        <p className="lc-overline">{erlass.ebene === 'bund' ? 'Bundesgesetz' : `Kanton ${erlass.kanton}`}</p>
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">
          {erlass.kuerzel} <span className="text-ink-400 font-normal">— {erlass.titel}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          {erlass.sr && <span>SR <span className="num">{erlass.sr}</span></span>}
          <span><span className="num">{eintraege.length}</span> Artikel</span>
          {erlass.stand && <span>Stand <span className="num">{formatiereDatum(erlass.stand)}</span></span>}
          {erlass.quelleUrl && (
            <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">
              ↗ geltende Fassung
            </a>
          )}
        </div>
        <p className="text-micro text-ink-400">Snapshot — massgeblich ist die amtliche Fassung (Live-Link).</p>
      </header>

      {/* In-Gesetz-Suche */}
      <input
        type="search"
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
        placeholder="Im Gesetz suchen (Artikel, Wortlaut) …"
        aria-label="Im Gesetz suchen"
        className="lc-input h-9 py-0 text-body-s w-full max-w-md"
      />

      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
        {/* TOC: Desktop sticky links; Mobile zuklappbar oben */}
        {!treffer && (
          <aside className="mb-4 lg:mb-0">
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <div className="flex items-center justify-end mb-2">
                <button type="button"
                  onClick={() => setOffen(Object.fromEntries(baender.map((b) => [b.id, !alleOffen])))}
                  className="text-micro text-ink-400 hover:text-brass-700">
                  {alleOffen ? 'Alle einklappen' : 'Alle aufklappen'}
                </button>
              </div>
              <GesetzTOC
                baender={baender}
                aktivId={aktivBand}
                onSprung={(id) => {
                  setOffen((o) => ({ ...o, [id]: true }));
                  window.requestAnimationFrame(() =>
                    bandRefs.current.get(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
                }}
              />
            </div>
          </aside>
        )}

        {/* Artikel */}
        <div className="max-w-[42rem]">
          {treffer ? (
            <div className="space-y-3">
              <p className="text-body-s text-ink-500">
                <span className="num">{treffer.length}</span> Treffer für «{suche.trim()}»
              </p>
              {treffer.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} />)}
              {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Artikel gefunden.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {baender.map((b) => (
                <section
                  key={b.id}
                  data-band={b.id}
                  ref={(el) => { if (el) bandRefs.current.set(b.id, el); else bandRefs.current.delete(b.id); }}
                >
                  {baender.length > 1 ? (
                    <details
                      open={offen[b.id] ?? true}
                      onToggle={(ev) => setOffen((o) => ({ ...o, [b.id]: (ev.target as HTMLDetailsElement).open }))}
                    >
                      <summary className="cursor-pointer select-none flex items-center gap-2 py-2 text-body-s font-medium text-ink-700 hover:text-ink-900">
                        <span className="num">{b.label}</span>
                        <span className="text-xs text-ink-400">· {b.eintraege.length} Artikel</span>
                      </summary>
                      <div className="space-y-3 pt-1">
                        {b.eintraege.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} />)}
                      </div>
                    </details>
                  ) : (
                    <div className="space-y-3">
                      {b.eintraege.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} />)}
                    </div>
                  )}
                </section>
              ))}
            </div>
          )}

          {/* Nachbar-/Verwandt-Navigation */}
          <nav className="mt-10 border-t border-line pt-5 space-y-4" aria-label="Weitere Erlasse">
            <div className="flex justify-between gap-4 text-body-s">
              {vorher
                ? <Link to={`/gesetze/${vorher.ebene}/${encodeURIComponent(vorher.key)}`} className="text-brass-700 hover:underline">‹ {vorher.kuerzel}</Link>
                : <span />}
              {nachher
                ? <Link to={`/gesetze/${nachher.ebene}/${encodeURIComponent(nachher.key)}`} className="text-brass-700 hover:underline text-right">{nachher.kuerzel} ›</Link>
                : <span />}
            </div>
            {verwandte.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-micro text-ink-400">Verwandt:</span>
                {verwandte.map((v) => (
                  <Link key={v.key} to={`/gesetze/${v.ebene}/${encodeURIComponent(v.key)}`} className="lc-chip no-underline hover:text-brass-700">
                    {v.kuerzel}
                  </Link>
                ))}
              </div>
            )}
            <Link to="/gesetze" className="inline-block text-body-s text-ink-500 hover:text-brass-700">‹ Zur Gesetzessammlung</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function GesetzLeser() {
  const { ebene, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  // key={schluessel}: Erlasswechsel mountet den Inhalt frisch (keine Stale-Daten).
  return <GesetzLeserInhalt key={schluessel} ebene={ebene ?? ''} schluessel={schluessel} />;
}
