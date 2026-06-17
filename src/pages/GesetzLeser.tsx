import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtikelBody } from '../components/normtext/ArtikelBody';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, ladeStruktur,
  baueGliederungsbaum, type Sektion, type StrukturMap, type Fussnote,
} from '../lib/normtext/browse';
import { GEBIET_LABEL } from '../lib/normtext/register';
import { werkzeugeFuer } from '../lib/normtext/werkzeuge';
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

// «Erster Titel: Die Entstehung …» → {pre:'Erster Titel', rest:'Die Entstehung …'}
function romanFrei(label: string): { pre: string; rest: string } {
  const m = label.match(/^([^:]+):\s*(.+)$/);
  return m ? { pre: m[1].trim(), rest: m[2].trim() } : { pre: '', rest: label };
}

// Pfad (Sektions-ids Wurzel→Treffer) zur ersten Sektion, die das Prädikat erfüllt.
function pfadZu(sektionen: Sektion[], treffer: (s: Sektion) => boolean): string[] | null {
  for (const s of sektionen) {
    if (treffer(s)) return [s.id];
    const sub = pfadZu(s.kinder, treffer);
    if (sub) return [s.id, ...sub];
  }
  return null;
}

// Fussnoten-Text mit klickbaren AS/BBl-Verweisen (die Label-Vorkommen werden
// durch Anker ersetzt). Reine Darstellung.
function escRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function fnTextMitLinks(fn: Fussnote): ReactNode {
  if (!fn.links.length) return fn.text;
  const map = new Map(fn.links.map((l) => [l.label, l.url]));
  const re = new RegExp(`(${[...map.keys()].sort((a, b) => b.length - a.length).map(escRe).join('|')})`, 'g');
  return fn.text.split(re).map((t, i) => map.has(t)
    ? <a key={i} href={map.get(t)} target="_blank" rel="noopener noreferrer" className="text-brass-700/90 hover:text-brass-700 hover:underline">{t}</a>
    : t);
}

// Ein Artikel im Lesefluss (Richtung A): ruhige Artikelnummer links (auf Grundlinie
// des 1. Absatzes), Serif-Bestimmungstext, NEUE Randtitel in der Marge (entdoppelt),
// amtliche Fussnoten (Änderungs-/AS/BBl-Historie) am Fuss.
function ArtikelLeser({ e, erlass, basisPfad, marginalie, fussnoten }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; marginalie: string[]; fussnoten?: Fussnote[];
}) {
  const [kopiert, setKopiert] = useState<'' | 'zitat' | 'link'>('');
  const zitat = `${e.artikelLabel} ${erlass.kuerzel}`;
  // Geschätzte Zeilenzahl (≈90 Z./Zeile). Der Hover-Zoom (scale) auf den GANZEN
  // Artikel verzerrt lange Bestimmungen (z. B. § 11 Notariatstarif BS, ~20 Tarif-
  // ziffern) — er wächst dann hunderte px. Darum: Zoom nur für kurze Artikel; lange
  // bekommen nur die (nicht skalierende) Hintergrund-/Schatten-Hervorhebung.
  const zeilen = e.bloecke.reduce((n, b) =>
    n + Math.max(1, Math.ceil((b.text?.length ?? 0) / 90))
      + (b.items?.reduce((m, it) => m + Math.max(1, Math.ceil((it.text?.length ?? 0) / 90)), 0) ?? 0), 0);
  const langeBestimmung = zeilen > 10;
  const kopiere = (was: 'zitat' | 'link') => {
    const text = was === 'zitat' ? zitat
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${basisPfad}#art-${e.artikel}`;
    void navigator.clipboard?.writeText(text).then(() => {
      setKopiert(was); window.setTimeout(() => setKopiert(''), 1500);
    });
  };
  return (
    <article id={`art-${e.artikel}`} className={`group relative z-0 hover:z-[5] rounded-md px-3 -mx-3 py-2 scroll-mt-28 mt-1 first:mt-0 origin-left transition-[transform,background-color,box-shadow] duration-200 hover:bg-brass-50/60 hover:shadow-md ${langeBestimmung ? '' : 'lg:hover:scale-[1.035]'} lg:grid lg:grid-cols-[3.75rem_minmax(0,35rem)_9.5rem] lg:gap-x-4 lg:items-baseline`}>
      {/* Artikelnummer: ruhiger Marker links, auf Grundlinie des 1. Absatzes */}
      <div className="order-1 flex items-baseline gap-2 lg:block lg:text-right">
        <a href={`#art-${e.artikel}`} className="num text-xs font-medium text-brass-700/90 hover:text-brass-700 no-underline leading-snug break-words">{e.artikelLabel}</a>
        <span className="lg:mt-1 flex gap-2 lg:justify-end opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <button type="button" onClick={() => kopiere('zitat')} className="text-micro text-ink-400 hover:text-brass-700" aria-label={`${zitat} kopieren`}>{kopiert === 'zitat' ? '✓' : 'Zitat'}</button>
          <button type="button" onClick={() => kopiere('link')} className="text-micro text-ink-400 hover:text-brass-700" aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
        </span>
      </div>
      <div className="order-3 lg:order-2">
        <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
          zitierKontext={{ artikelLabel: e.artikelLabel, kuerzel: erlass.kuerzel }}
          className="space-y-2 font-serif text-[1.0625rem] leading-[1.6] text-ink-800" />
        {/* Amtliche Fussnoten (Änderungs-/Quellenhistorie, AS/BBl klickbar) */}
        {fussnoten && fussnoten.length > 0 && (
          <div className="mt-2.5 border-t border-line/50 pt-1.5 space-y-1">
            {fussnoten.map((fn, i) => (
              <p key={i} className="text-micro leading-snug text-ink-400">
                {fn.nr && <span className="num mr-1 text-ink-300">{fn.nr}</span>}
                {fnTextMitLinks(fn)}
              </p>
            ))}
          </div>
        )}
      </div>
      {marginalie.length > 0 && (
        <aside className="order-2 lg:order-3 mb-1 lg:mb-0">
          <p className="text-xs leading-snug text-ink-500">
            {marginalie.map((m, i) => <span key={i}>{m}{i < marginalie.length - 1 ? <br /> : null}</span>)}
          </p>
        </aside>
      )}
    </article>
  );
}

// Gliederungs-Überschrift im Fliesstext: klappbar (Fedlex-analog), volle
// Bezeichnung, nach Ebene abgestuft.
function SektionKopf({ s, refCb, offen, onToggle }: {
  s: Sektion; refCb: (el: HTMLElement | null) => void; offen: boolean; onToggle: () => void;
}) {
  const { pre, rest } = romanFrei(s.label);
  const groesse = s.ebene <= 1 ? 'text-h3 font-display text-ink-900'
    : s.ebene === 2 ? 'text-body-l font-display text-ink-900'
    : 'text-body-s font-semibold text-ink-700';
  return (
    <div ref={refCb} data-sek={s.id} className={`scroll-mt-28 ${s.ebene <= 1 ? 'mt-8 first:mt-0' : s.ebene === 2 ? 'mt-6' : 'mt-4'}`}>
      <button type="button" onClick={onToggle} aria-expanded={offen}
        className="w-full text-left flex items-baseline gap-2 group/sek">
        <span className="text-ink-300 text-xs shrink-0 mt-1 w-3">{offen ? '▾' : '▸'}</span>
        <span className="flex-1">
          {pre && <span className="lc-overline text-brass-700 block">{pre}</span>}
          <span className={groesse}>{pre ? rest : s.label}</span>
        </span>
      </button>
    </div>
  );
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

  // Browser-Tab zeigt den Erlass: «OR (Obligationenrecht) — LexMetrik». Kurztitel
  // = Klammer-Inhalt am Ende des Volltitels (LEGES-Konvention), sonst der Titel.
  useEffect(() => {
    if (!erlass || typeof document === 'undefined') return;
    const kurz = erlass.titel.match(/\(([^)]+)\)\s*$/)?.[1] ?? erlass.titel;
    document.title = `${erlass.kuerzel} (${kurz}) — LexMetrik`;
  }, [erlass]);

  const { sektionen, ohneGliederung } = useMemo(
    () => (eintraege ? baueGliederungsbaum(eintraege, struktur) : { sektionen: [], ohneGliederung: [] }),
    [eintraege, struktur],
  );

  const sekPfadMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const gehe = (liste: Sektion[], pfad: string[]) => {
      for (const s of liste) {
        const p = [...pfad, romanFrei(s.label).pre || s.label];
        map.set(s.id, p); gehe(s.kinder, p);
      }
    };
    gehe(sektionen, []);
    return map;
  }, [sektionen]);

  // Offen-Zustand (TOC + Fliesstext geteilt). Default: erster Pfad aufgeklappt,
  // alles andere zu (Perf + Fedlex-Gefühl). Toggle an jeder Stufe.
  const istOffen = (id: string, defOpen: boolean) => offen[id] ?? defOpen;
  const toggle = (id: string, defOpen: boolean) => setOffen((o) => ({ ...o, [id]: !(o[id] ?? defOpen) }));
  const oeffnePfad = (ids: string[]) => setOffen((o) => {
    const n = { ...o }; for (const id of ids) n[id] = true; return n;
  });

  // Hash-Sprung: alle Vorfahren des Ziel-Artikels öffnen + scrollen.
  useEffect(() => {
    if (!eintraege || !sektionen.length || typeof window === 'undefined') return;
    const m = window.location.hash.match(/^#art-(.+)$/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    window.requestAnimationFrame(() => {
      if (ids.length) oeffnePfad(ids);
      window.setTimeout(() => {
        const el = document.getElementById(`art-${token}`);
        el?.scrollIntoView({ block: 'center', behavior: 'auto' });
        el?.classList.add('lc-ziel-blink');
        window.setTimeout(() => el?.classList.remove('lc-ziel-blink'), 2400);
      }, 110);
    });
  }, [eintraege, sektionen]);

  // Scrollspy: aktiver Pfad = oberste sichtbare Sektion.
  useEffect(() => {
    if (!sektionen.length || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver((eintr) => {
      const sicht = eintr.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const id = sicht[0]?.target.getAttribute('data-sek');
      if (id) setAktivPfad(sekPfadMap.get(id) ?? []);
    }, { rootMargin: '-110px 0px -75% 0px' });
    sekRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sektionen, offen, sekPfadMap]);

  // Marginalien entdoppeln (Print-Konvention): je Artikel nur die NEUEN Randtitel
  // gegenüber dem vorigen Artikel (gemeinsamer Präfix wird weggelassen).
  const margAnzeige = useMemo(() => {
    const map = new Map<string, string[]>();
    let prev: string[] = [];
    for (const e of eintraege ?? []) {
      const m = struktur?.[e.artikel]?.marginalie ?? [];
      let i = 0;
      while (i < m.length && i < prev.length && m[i] === prev[i]) i++;
      map.set(e.artikel, m.slice(i));
      prev = m;
    }
    return map;
  }, [eintraege, struktur]);

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
  const marg = (tok: string) => margAnzeige.get(tok) ?? [];
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;

  // Erlass als Gesamtheit herunterladen (client-seitig, reiner Text).
  const baueText = (): string => {
    const L: string[] = [
      `${erlass.kuerzel} — ${erlass.titel}`,
      [erlass.sr ? `SR ${erlass.sr}` : '', erlass.stand ? `Stand ${formatiereDatum(erlass.stand)}` : ''].filter(Boolean).join(' · '),
      `Quelle: ${erlass.quelleUrl}`,
      'Heruntergeladen aus LexMetrik — massgeblich ist die amtliche Fassung (Live-Link).',
      '',
    ];
    let prev: string[] = [];
    for (const e of eintraege) {
      const st = struktur?.[e.artikel];
      const gl = st?.gliederung ?? [];
      for (let i = 0; i < gl.length; i++) {
        if (gl[i].label !== prev[i]) L.push('', `${'#'.repeat(Math.min(gl[i].ebene, 4))} ${gl[i].label}`);
      }
      prev = gl.map((g) => g.label);
      const m = st?.marginalie ?? [];
      L.push('', `${e.artikelLabel}${m.length ? `  [${m.join(' · ')}]` : ''}`);
      for (const b of e.bloecke) {
        L.push(`${b.absatz ? `${b.absatz} ` : ''}${b.text}`);
        for (const it of b.items ?? []) L.push(`    ${it.marke}. ${it.text}`);
      }
      for (const f of st?.fussnoten ?? []) L.push(`  [${f.nr}] ${f.text}`);
    }
    return L.join('\n');
  };
  const herunterladen = () => {
    if (typeof document === 'undefined') return;
    const blob = new Blob([baueText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${erlass.kuerzel.replace(/[^\w.-]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Jede Sektionsstufe ist klappbar (Fedlex-analog); Inhalt rendert nur offen.
  const renderSektion = (s: Sektion, defOpen: boolean): ReactNode => {
    const auf = istOffen(s.id, defOpen);
    return (
      <section key={s.id} className="space-y-3">
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)} />
        {auf && (
          <div className="space-y-5 lg:pl-5">
            {s.kinder.map((k, i) => renderSektion(k, defOpen && i === 0))}
            {s.artikel.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} marginalie={marg(e.artikel)} fussnoten={fn(e.artikel)} />)}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-5">
      {/* Sticky Breadcrumb mit aktueller Position */}
      <div className="sticky top-0 z-10 -mx-5 sm:-mx-6 px-5 sm:px-6 py-2 border-b border-line bg-paper/90 backdrop-blur text-xs text-ink-500">
        <Link to="/gesetze" className="hover:text-brass-700">Gesetze</Link>
        <span className="mx-1.5 text-ink-300">›</span>
        {erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`}
        <span className="mx-1.5 text-ink-300">›</span>
        <span className="text-ink-700 font-medium">{erlass.kuerzel}</span>
        {aktivPfad.length > 0 && <span className="hidden sm:inline"><span className="mx-1.5 text-ink-300">·</span>{aktivPfad.join(' › ')}</span>}
      </div>

      <header className="space-y-2 border-b border-line pb-5">
        <p className="lc-overline">{erlass.ebene === 'bund' ? 'Bundesgesetz' : `Kanton ${erlass.kanton}`} · {GEBIET_LABEL[erlass.rechtsgebiet]}</p>
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">
          {erlass.kuerzel} <span className="text-ink-400 font-normal">— {erlass.titel}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          {erlass.sr && <span>SR <span className="num">{erlass.sr}</span></span>}
          <span><span className="num">{eintraege.length}</span> Artikel</span>
          {erlass.stand && <span>Stand <span className="num">{formatiereDatum(erlass.stand)}</span></span>}
          {erlass.quelleUrl && <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">↗ geltende Fassung</a>}
          <button type="button" onClick={herunterladen} className="lc-chip hover:text-brass-700" title="Ganzen Erlass als Textdatei herunterladen">⬇ Herunterladen</button>
        </div>
        <p className="text-micro text-ink-400">Snapshot — massgeblich ist die amtliche Fassung (Live-Link).</p>
      </header>

      {/* Norm↔Werkzeug-Brücke (D1): passende Rechner/Vorlagen zu diesem Erlass */}
      {(() => {
        const wz = werkzeugeFuer(erlass.key);
        return wz.length > 0 ? (
          <div className="rounded-lg border border-line bg-paper-sunken/40 px-4 py-3">
            <p className="lc-overline mb-2">Passende Werkzeuge</p>
            <div className="flex flex-wrap gap-2">
              {wz.map((w) => (
                <Link key={w.id} to={w.href} className="lc-chip no-underline hover:text-brass-700 hover:border-brass-400">
                  <span className="text-ink-400 mr-1">{w.modus === 'rechner' ? '⊞' : '▤'}</span>{w.titel}
                </Link>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
        placeholder="Im Gesetz suchen (Artikel, Wortlaut) …" aria-label="Im Gesetz suchen"
        className="lc-input h-9 py-0 text-body-s w-full max-w-md" />

      {/* 2-Spalten (TOC + Inhalt) NUR wenn es eine Gliederung gibt. Sonst (flacher
          Fallback ohne Struktur / Suchtreffer) volle Breite — sonst landet der einzige
          Grid-Inhalt in der 16rem-Spalte und die Lesespalte kollabiert. */}
      <div className={!treffer && sektionen.length > 0 ? 'lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8' : ''}>
        {!treffer && sektionen.length > 0 && (
          <aside className="mb-4 lg:mb-0">
            <button type="button" onClick={() => setTocAuf((v) => !v)} className="lg:hidden text-micro text-brass-700 mb-1">
              {tocAuf ? 'Gliederung ausblenden' : 'Gliederung anzeigen'}
            </button>
            <div className={`${tocAuf ? 'block' : 'hidden'} lg:block lg:sticky lg:top-12 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto pr-1`}>
              <p className="lc-overline mb-2">Gliederung</p>
              <SektionBaumTOC sektionen={sektionen} aktivPfad={aktivPfad} offen={offen}
                onToggle={toggle}
                onSprung={(id) => {
                  const ids = pfadZu(sektionen, (s) => s.id === id) ?? [id];
                  oeffnePfad(ids);
                  window.requestAnimationFrame(() => window.setTimeout(() =>
                    sekRefs.current.get(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 80));
                }} />
            </div>
          </aside>
        )}

        <div>
          {treffer ? (
            <div className="space-y-4 max-w-[40rem]">
              <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{suche.trim()}»</p>
              {treffer.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} marginalie={marg(e.artikel)} fussnoten={fn(e.artikel)} />)}
              {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Artikel gefunden.</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {ohneGliederung.length > 0 && (
                <div className="space-y-5 mb-6">
                  {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} marginalie={marg(e.artikel)} fussnoten={fn(e.artikel)} />)}
                </div>
              )}
              {sektionen.map((s, i) => renderSektion(s, i === 0))}
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

// TOC-Gliederungsbaum: jede Stufe einklappbar (geteilter Zustand mit dem
// Fliesstext); Dreieck klappt, Label springt.
function SektionBaumTOC({ sektionen, aktivPfad, offen, onToggle, onSprung }: {
  sektionen: Sektion[]; aktivPfad: string[]; offen: Record<string, boolean>;
  onToggle: (id: string, defOpen: boolean) => void; onSprung: (id: string) => void;
}) {
  const zeile = (s: Sektion, tiefe: number, defOpen: boolean): ReactNode => {
    const auf = offen[s.id] ?? defOpen;
    const { pre, rest } = romanFrei(s.label);
    const aktiv = aktivPfad.includes(pre || s.label);
    const hatKinder = s.kinder.length > 0;
    return (
      <li key={s.id}>
        <div className="flex items-start" style={{ paddingLeft: `${tiefe * 0.6}rem` }}>
          {hatKinder
            ? <button type="button" onClick={() => onToggle(s.id, defOpen)} aria-label={auf ? 'Einklappen' : 'Aufklappen'} className="shrink-0 text-ink-300 hover:text-ink-600 px-1 mt-0.5 text-[0.6rem] w-4">{auf ? '▾' : '▸'}</button>
            : <span className="shrink-0 w-4" aria-hidden />}
          <button type="button" onClick={() => onSprung(s.id)}
            className={`flex-1 text-left rounded px-1.5 py-0.5 leading-snug ${tiefe === 0 ? 'text-body-s' : 'text-xs'} ${aktiv ? 'text-ink-900 font-medium bg-brass-100/40' : 'text-ink-600 hover:text-ink-900 hover:bg-paper-sunken/60'}`}>
            {pre ? <><span className="font-medium text-ink-700">{pre}:</span> {rest}</> : s.label}
          </button>
        </div>
        {hatKinder && auf && <ul className="space-y-0.5 mt-0.5">{s.kinder.map((k, i) => zeile(k, tiefe + 1, defOpen && i === 0))}</ul>}
      </li>
    );
  };
  return <ul className="space-y-0.5">{sektionen.map((s, i) => zeile(s, 0, i === 0))}</ul>;
}

export function GesetzLeser() {
  const { ebene, key: keyRoh } = useParams<{ ebene: string; key: string }>();
  const schluessel = keyRoh ? decodeURIComponent(keyRoh) : '';
  return <GesetzLeserInhalt key={schluessel} ebene={ebene ?? ''} schluessel={schluessel} />;
}
