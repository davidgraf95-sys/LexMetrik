import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArtikelBody, FnRef } from '../components/normtext/ArtikelBody';
import type { InternRefs } from '../components/NormText';
import { trenneAenderungshistorie, labelMitBereich } from '../lib/normtext/darstellung';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, ladeStruktur,
  baueGliederungsbaum, type Sektion, type StrukturMap, type Fussnote,
} from '../lib/normtext/browse';
import { GEBIET_LABEL } from '../lib/normtext/register';
import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../lib/fedlex';
import { NormChip } from '../components/vorlagen/ui';
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

// Ein Artikel im Lesefluss (Richtung A): zweispaltig wie die amtliche Druckfassung —
// links «Art. N» als ruhiger Anker mit den Randtiteln darunter (rechtsbündig, nur die
// gegenüber dem Vorartikel GEÄNDERTEN Stufen, `marg`), rechts der Serif-
// Bestimmungstext. Ersetzt den früheren fliegenden Standort-Tracker. Reine Darstellung.
function ArtikelLeser({ e, erlass, basisPfad, fussnoten, fussnotenAuf, intern, marg }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; fussnoten?: Fussnote[]; fussnotenAuf: boolean; intern?: InternRefs;
  marg?: string[];
}) {
  const [kopiert, setKopiert] = useState<'' | 'zitat' | 'link'>('');
  const label = labelMitBereich(e.artikelLabel, e.artikel);
  const zitat = `${label} ${erlass.kuerzel}`;
  // Fussnoten am Fuss: amtliche Sidecar-Fussnoten bevorzugen; fehlen sie, die
  // aus dem Wortlaut-Block abgetrennte Änderungshistorie (Extraktions-Artefakt)
  // hier zeigen — einheitlich EINE Quelle, keine Doppelung.
  const fussAnzeige: Fussnote[] = fussnoten && fussnoten.length > 0
    ? fussnoten
    : e.bloecke
        .map((b) => trenneAenderungshistorie(b.text).historie)
        .filter((h): h is string => !!h)
        .map((text): Fussnote => ({ nr: '', text, links: [] }));
  const [artOffen, setArtOffen] = useState(true); // einzelner Artikel ein-/ausklappbar
  // Fussnoten dem Absatz zuordnen, den sie betreffen: trägt der Absatz einen
  // Normverweis auf denselben Erlass (eli/cc-Basis), auf den die Fussnote
  // verlinkt (z. B. «SR 311.0» = StGB), gehört die Fussnote zu diesem Absatz →
  // Marker am Absatzende. Sonst (z. B. «Fassung gemäss …») an der Artikelnummer.
  // Fussnote → Block: die Absatznummer kommt direkt aus der Extraktion
  // (fn.absatz = Absatz, in dem der Marker im Fedlex-HTML steht). Marker auf dem
  // Artikelkopf/der Marginalie tragen absatz=null → Artikelebene. Schlüssel =
  // Block-Index (mehrere absatzlose Blöcke kollidieren nicht).
  const fnProAbsatz: Record<number, string[]> = {};
  const fnProItem: Record<string, string[]> = {}; // Schlüssel «<blockIndex>|<marke>»
  const fnArtikelEbene: string[] = [];
  for (const f of fussAnzeige) {
    if (!f.nr) continue;
    let idx = f.absatz != null ? e.bloecke.findIndex((b) => b.absatz === f.absatz) : -1;
    if (f.item && idx < 0) idx = e.bloecke.findIndex((b) => (b.items ?? []).some((it) => it.marke === f.item));
    if (idx >= 0 && f.item && (e.bloecke[idx].items ?? []).some((it) => it.marke === f.item)) {
      (fnProItem[`${idx}|${f.item}`] ??= []).push(f.nr); // Fussnote am lit/Ziff-Item
    } else if (idx >= 0) {
      (fnProAbsatz[idx] ??= []).push(f.nr); // am Absatz
    } else fnArtikelEbene.push(f.nr); // am Artikel
  }
  const fnMarker = fussnotenAuf && fnArtikelEbene.length > 0
    ? <span className="ml-0.5">{fnArtikelEbene.map((nr, i) => (
        <span key={nr}>{i > 0 && <span className="align-super text-[0.62em] text-ink-300">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
      ))}</span>
    : null;
  // VERWEISE: im Artikel genannte, auflösbare (Bund-)Normverweise als Chips am
  // Fuss sammeln (Davids Referenz). Dedupliziert; nur was fedlexLinkFuerArtikel
  // wirklich auflöst (nie ein toter Link, §8). Inline-Links bleiben (17.6).
  const verweise: string[] = (() => {
    const seen = new Set<string>(); const out: string[] = [];
    for (const b of e.bloecke) {
      for (const t of [b.text, ...(b.items?.map((it) => it.text) ?? [])]) {
        for (const m of t.matchAll(NORM_IM_TEXT)) {
          const roh = m[0].trim();
          if (fedlexLinkFuerArtikel(roh) == null) continue;
          const key = roh.replace(/\s+/g, ' ');
          if (!seen.has(key)) { seen.add(key); out.push(roh); }
        }
      }
    }
    return out;
  })();
  const kopiere = (was: 'zitat' | 'link') => {
    const text = was === 'zitat' ? zitat
      : `${typeof window !== 'undefined' ? window.location.origin : ''}${basisPfad}#art-${e.artikel}`;
    void navigator.clipboard?.writeText(text).then(() => {
      setKopiert(was); window.setTimeout(() => setKopiert(''), 1500);
    });
  };
  return (
    <article id={`art-${e.artikel}`}
      className="group relative z-0 scroll-mt-[8.5rem] border-t border-line/70 pt-7 mt-7 first:border-t-0 first:mt-0 first:pt-0 transition duration-200 group-has-[[data-lese]:hover]/lese:opacity-80 has-[[data-lese]:hover]:!opacity-100 has-[[data-lese]:hover]:z-[5]">
      <div className="lg:grid lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-x-8">
        {/* Linke Marginalspalte: «Art. N» als ruhiger Anker, darunter die Randtitel
            (rechtsbündig, ruhig) — die statische Druckfassungs-Randspalte statt des
            früheren fliegenden Trackers. */}
        <div className="mb-2 lg:mb-0 lg:pt-1 lg:text-right">
          <div className="flex items-baseline gap-2 lg:justify-end">
            <button type="button" onClick={() => setArtOffen((v) => !v)} aria-expanded={artOffen}
              aria-label={artOffen ? 'Artikel einklappen' : 'Artikel ausklappen'}
              className="shrink-0 text-[0.65rem] text-ink-300 hover:text-brass-700">{artOffen ? '▾' : '▸'}</button>
            <a href={`#art-${e.artikel}`} className="num text-[1.05rem] font-bold tracking-wide text-ink-900 hover:text-brass-700 no-underline">{label}</a>{fnMarker}
          </div>
          {artOffen && marg && marg.length > 0 && (
            <div className="mt-1.5 space-y-0.5 font-serif text-[0.8rem] leading-snug text-ink-400">
              {marg.map((m, i) => (
                <div key={i} className={i === marg.length - 1 ? 'italic text-ink-500' : ''}>{m}</div>
              ))}
            </div>
          )}
          {artOffen && (
            <div className="mt-2 flex gap-3 lg:justify-end opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
              <button type="button" onClick={() => kopiere('zitat')} className="text-micro text-ink-400 hover:text-brass-700" aria-label={`${zitat} kopieren`}>{kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}</button>
              <button type="button" onClick={() => kopiere('link')} className="text-micro text-ink-400 hover:text-brass-700" aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
            </div>
          )}
        </div>
        {/* Rechte Lesespalte: grosse Serifenschrift, hängende Messing-Absatznummern. */}
        {artOffen && (
        <div className="max-w-[46rem]">
          <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
            zitierKontext={{ artikelLabel: label, kuerzel: erlass.kuerzel }}
            fnProAbsatz={fussnotenAuf ? fnProAbsatz : undefined} fnProItem={fussnotenAuf ? fnProItem : undefined}
            intern={intern}
            className="space-y-3.5 font-serif text-[1.15rem] leading-[1.65] text-ink-800" />
          {/* VERWEISE: auflösbare Normverweise des Artikels als Chips (Referenz David). */}
          {verweise.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-ink-400 mr-1">Verweise</span>
              {verweise.map((v) => <NormChip key={v} artikel={v} />)}
            </div>
          )}
          {/* Fussnoten (Änderungs-/Quellenhistorie, AS/BBl klickbar): nur auf Wunsch
              (globaler Schalter in der Suchleiste). */}
          {fussnotenAuf && fussAnzeige.length > 0 && (
            <div className="mt-3 border-t border-line/50 pt-2 space-y-1">
              {fussAnzeige.map((fn, i) => (
                <p key={i} id={fn.nr ? `fn-${e.artikel}-${fn.nr}` : undefined} className="scroll-mt-[8.5rem] text-xs leading-normal text-ink-400 target:bg-brass-50">
                  {fn.nr && <span className="num mr-1 text-ink-300">{fn.nr}</span>}
                  {fnTextMitLinks(fn)}
                </p>
              ))}
            </div>
          )}
        </div>
        )}
      </div>
    </article>
  );
}

// Gliederungs-Überschrift im Fliesstext: klappbar (Fedlex-analog), volle
// Bezeichnung, nach Ebene abgestuft.
function SektionKopf({ s, refCb, offen, onToggle, bereich }: {
  s: Sektion; refCb: (el: HTMLElement | null) => void; offen: boolean; onToggle: () => void; bereich?: string;
}) {
  const { pre, rest } = romanFrei(s.label);
  // Vollwertige Abschnitts-Überschrift im Fliesstext: feine Overline mit dem
  // Aufzähler («Erster Abschnitt»), darunter der Sachtitel + Artikel-Bereich. Trägt
  // wieder die Standort-Info im Text (der frühere fliegende Running-Header entfällt).
  const mt = s.ebene <= 1 ? 'mt-8 first:mt-0' : s.ebene === 2 ? 'mt-6' : s.ebene === 3 ? 'mt-5' : 'mt-4';
  const regel = s.ebene <= 1 ? 'border-t border-line pt-4' : s.ebene === 2 ? 'border-t border-line/50 pt-3' : '';
  // Titelgrösse nach Tiefe: oberste Stufen prominent, tiefere ruhiger.
  const titelStil = s.ebene <= 1 ? 'text-[1.3rem]' : s.ebene === 2 ? 'text-[1.15rem]' : s.ebene === 3 ? 'text-[1.05rem]' : 'text-[0.98rem]';
  return (
    <div ref={refCb} data-sek={s.id} className={`scroll-mt-[8.5rem] ${mt} ${regel}`}>
      <button type="button" onClick={onToggle} aria-expanded={offen} className="group/sek w-full text-left">
        {pre && <span className="lc-overline group-hover/sek:text-brass-700">{pre}</span>}
        <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-ink-300 text-[0.6rem] shrink-0 w-3">{offen ? '▾' : '▸'}</span>
          <span className={`font-display font-semibold text-ink-900 ${titelStil} group-hover/sek:text-brass-700`}>{rest || s.label}</span>
          {bereich && <span className="num shrink-0 text-[0.78rem] font-normal text-ink-400">{bereich}</span>}
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
  // Eigener Auf-/Zu-Zustand NUR für den TOC-Baum (entkoppelt vom Fliesstext, der
  // immer offen bleibt) — beim Scrollen klappt die aktive Sektion auf, die übrige zu.
  const [tocBaum, setTocBaum] = useState<Record<string, boolean>>({});
  const aktivIdRef = useRef<string | null>(null);
  // Während eines Klick-Sprungs den Scroll-Spy stilllegen, damit der Baum nicht
  // durch die durchscrollten Zwischen-Sektionen flackert (auf/zu).
  const jumpLock = useRef(false);
  const tocToggle = (id: string) => setTocBaum((o) => ({ ...o, [id]: !o[id] }));
  const [aktivIds, setAktivIds] = useState<string[]>([]); // Sektions-IDs (TOC-Markierung, eindeutig)
  const [tocAuf, setTocAuf] = useState(false); // mobil: Gliederung ein-/ausblenden
  const [tocOffen, setTocOffen] = useState(true); // Desktop: Gliederungsspalte ein-/ausklappen
  const [fussnotenAuf, setFussnotenAuf] = useState(false); // Fussnoten nur auf Wunsch
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

  // Dokument-Position je Artikel-Token (für den Artikel-Bereich «Art. 1–10» in den
  // Sektionsüberschriften).
  const artIndex = useMemo(() => {
    const map = new Map<string, number>();
    (eintraege ?? []).forEach((e, i) => map.set(e.artikel, i));
    return map;
  }, [eintraege]);

  // Randtitel je Artikel als DELTA zum Vorartikel (amtliche Druck-/Fedlex-Manier):
  // nur die gegenüber dem vorigen Artikel geänderten Randtitel-Stufen werden in der
  // linken Marginalspalte gezeigt (Art. 1 alle, Art. 2 nur «2. Betreffend
  // Nebenpunkte» …). Reine Darstellung — ersetzt den früheren fliegenden Tracker.
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

  // Interner Artikel-Sprung (Querverweise im Wortlaut): Vorfahren öffnen, scrollen,
  // Permalink setzen — derselbe Mechanismus wie der Hash-Sprung.
  const springeZuArtikel = useCallback((token: string) => {
    // Im Suchmodus erst die Suche verlassen, sonst ist das Ziel nicht im DOM
    // (nur Treffer gerendert) → Permalink änderte sich ohne Sprung.
    setSuche('');
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    if (ids.length) setOffen((o) => { const n = { ...o }; for (const id of ids) n[id] = true; return n; });
    if (typeof window === 'undefined') return;
    window.history.replaceState(null, '', `${basisPfad}#art-${token}`);
    // Erst nach dem Aufklapp-Render scrollen (behavior:auto wie der Hash-Sprung);
    // grosse Sektionen wachsen beim Aufklappen → nach Settle ein Korrektur-Scroll.
    const scrolle = () => {
      const el = document.getElementById(`art-${token}`);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'auto' });
      el.classList.add('lc-ziel-blink');
      window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
    };
    window.requestAnimationFrame(() => window.setTimeout(() => { scrolle(); window.setTimeout(scrolle, 400); }, 110));
  }, [sektionen, basisPfad]);

  // Token-Auflösung für bare Artikelverweise (normalisiert «6a» → Token «6_a»).
  const internRefs = useMemo<InternRefs | undefined>(() => {
    if (!eintraege) return undefined;
    const tokenMap = new Map<string, string>();
    for (const e of eintraege) tokenMap.set(e.artikel.toLowerCase().replace(/[^a-z0-9]/g, ''), e.artikel);
    return { tokenMap, basisPfad, springeZu: springeZuArtikel };
  }, [eintraege, basisPfad, springeZuArtikel]);

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

  // Scrollspy: aktiver Pfad = UNTERSTE Sektion, deren Überschrift bereits über die
  // Schwelle (knapp unter dem Site-Header) gescrollt ist. Funktioniert auch tief in
  // den Artikeln einer Sektion — nicht nur, wenn eine Überschrift gerade im Bild ist.
  useEffect(() => {
    if (!sektionen.length || typeof window === 'undefined') return;
    let raf = 0;
    const mess = () => {
      raf = 0;
      if (jumpLock.current) return;
      const schwelle = 150;
      let beste: string | null = null;
      let besteTop = -Infinity;
      sekRefs.current.forEach((el, id) => {
        const top = el.getBoundingClientRect().top;
        if (top <= schwelle && top > besteTop) { besteTop = top; beste = id; }
      });
      if (beste && beste !== aktivIdRef.current) {
        aktivIdRef.current = beste;
        const ids = pfadZu(sektionen, (s) => s.id === beste) ?? [];
        // NUR die aktive Gliederung markieren (Klassen) — der Baum wird beim
        // Scrollen NICHT mehr auf-/zugeklappt (Auftrag David: kein Akkordeon-
        // Flackern). Auf-/Zuklappen passiert ausschliesslich auf Klick/Sprung.
        setAktivIds(ids);
      }
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(mess); };
    mess();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
    // `offen` bewusst NICHT in den Deps: mess() liest nur Refs + Live-DOM, sonst
    // unnötiger Listener-Neuaufbau bei jedem Sektions-Toggle.
  }, [sektionen]);

  // Aktiven Eintrag im TOC sichtbar halten — sanft, nur den TOC-Container, erst
  // nach dem Akkordeon-Settle (tocBaum), nie die Seite scrollen.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const cont = document.querySelector('[data-toc]') as HTMLElement | null;
    if (!cont) return;
    const aktive = cont.querySelectorAll('[data-toc-aktiv]');
    const el = aktive[aktive.length - 1] as HTMLElement | undefined;
    if (!el) return;
    const cr = cont.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (er.top < cr.top + 8 || er.bottom > cr.bottom - 8) {
      cont.scrollTo({ top: cont.scrollTop + (er.top - cr.top) - cr.height / 2, behavior: 'smooth' });
    }
  }, [tocBaum]);

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
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;

  // Artikel-Bereich «Art. 1–10» einer Sektion (inkl. Unterabschnitte) — erster und
  // letzter Artikel in Dokument-Reihenfolge. Reine Darstellung (Sektionsüberschrift).
  const sammleArtikel = (s: Sektion): NormSnapshot[] => [...s.artikel, ...s.kinder.flatMap(sammleArtikel)];
  const sekBereich = (s: Sektion): string | undefined => {
    const arts = sammleArtikel(s);
    if (arts.length === 0) return undefined;
    let erst = arts[0], letzt = arts[0];
    for (const a of arts) {
      const idx = artIndex.get(a.artikel) ?? 0;
      if (idx < (artIndex.get(erst.artikel) ?? 0)) erst = a;
      if (idx > (artIndex.get(letzt.artikel) ?? 0)) letzt = a;
    }
    if (erst === letzt) return erst.artikelLabel;
    return `${erst.artikelLabel}–${letzt.artikelLabel.replace(/^(Art\.|§)\s*/, '')}`;
  };

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
      L.push('', `${labelMitBereich(e.artikelLabel, e.artikel)}${m.length ? `  [${m.join(' · ')}]` : ''}`);
      for (const b of e.bloecke) {
        // Eingemischte Änderungshistorie (verdoppelte Fussnoten-Nr) abtrennen.
        const { wortlaut, historie } = trenneAenderungshistorie(b.text);
        const txt = wortlaut.trim() ? wortlaut : historie ? '[aufgehoben]' : b.text;
        L.push(`${b.absatz ? `${b.absatz} ` : ''}${txt}`);
        for (const it of b.items ?? []) L.push(`    ${it.marke}. ${it.text}`);
        // Extrahierte Historie nur, wenn keine amtliche Sidecar-Fussnote da ist
        // (sonst Doppelung mit der Fussnoten-Schleife unten).
        if (historie && !(st?.fussnoten?.length)) L.push(`    — ${historie}`);
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
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)} bereich={sekBereich(s)} />
        {auf && (
          <div className="space-y-5">
            {s.kinder.map((k) => renderSektion(k, true))}
            {s.artikel.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} fussnotenAuf={fussnotenAuf} intern={internRefs} marg={margAnzeige.get(e.artikel)} />)}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb (scrollt weg; die Suchleiste ist die sticky Kopfzeile) */}
      <div className="-mx-5 sm:-mx-6 px-5 sm:px-6 py-2 border-b border-line text-xs text-ink-500">
        <Link to="/gesetze" className="hover:text-brass-700">Gesetze</Link>
        <span className="mx-1.5 text-ink-300">›</span>
        {erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`}
        <span className="mx-1.5 text-ink-300">›</span>
        <span className="text-ink-700 font-medium">{erlass.kuerzel}</span>
      </div>

      <header className="space-y-2.5 border-b border-line pb-5">
        <p className="lc-overline">{erlass.ebene === 'bund' ? 'Bundesgesetz' : `Kanton ${erlass.kanton}`} · {GEBIET_LABEL[erlass.rechtsgebiet]}</p>
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">
          {erlass.kuerzel} <span className="text-ink-400 font-normal">— {erlass.titel}</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
          {erlass.sr && <span>SR <span className="num">{erlass.sr}</span></span>}
          {erlass.sr && <span className="text-ink-300" aria-hidden>·</span>}
          <span><span className="num">{eintraege.length}</span> Artikel</span>
          {erlass.stand && <span className="text-ink-300" aria-hidden>·</span>}
          {erlass.stand && <span>Stand <span className="num">{formatiereDatum(erlass.stand)}</span></span>}
          {erlass.quelleUrl && <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">↗ geltende Fassung</a>}
          <button type="button" onClick={herunterladen} className="lc-chip hover:text-brass-700" title="Ganzen Erlass als Textdatei herunterladen">⬇ Herunterladen</button>
          <span className="basis-full sm:basis-auto sm:ml-auto text-micro text-ink-400">Snapshot — massgeblich ist die amtliche Fassung</span>
        </div>
      </header>

      {/* Norm↔Werkzeug-Brücke (D1): passende Rechner/Vorlagen zu diesem Erlass */}
      {(() => {
        const wz = werkzeugeFuer(erlass.key);
        return wz.length > 0 ? (
          <div className="rounded-lg border border-line bg-paper-sunken/40 px-4 py-3">
            <p className="lc-overline mb-2">Passende Werkzeuge</p>
            {/* Mobile: eine horizontal scrollbare Chip-Reihe (sonst stapeln sich
                viele Werkzeuge sehr hoch); ab sm normaler Umbruch. */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mb-0 [scrollbar-width:thin]">
              {wz.map((w) => (
                <Link key={w.id} to={w.href} className="lc-chip shrink-0 whitespace-nowrap no-underline hover:text-brass-700 hover:border-brass-400">
                  <span className="text-ink-400 mr-1">{w.modus === 'rechner' ? '⊞' : '▤'}</span>{w.titel}
                </Link>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      {/* 2-Spalten: links Gliederung (sticky), rechts Inhalt mit Suchleiste auf
          HÖHE DER ARTIKEL (in der Inhalts-Spalte, nicht über der Gliederung). */}
      <div className={sektionen.length > 0 && tocOffen ? 'lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8' : ''}>
        {sektionen.length > 0 && (
          <aside className={`mb-4 lg:mb-0 lg:sticky lg:top-[10.5rem] lg:max-h-[calc(100vh-11rem)] lg:flex-col ${tocOffen ? 'lg:flex' : 'lg:hidden'}`}>
            <button type="button" onClick={() => setTocAuf((v) => !v)} className="lg:hidden text-micro text-brass-700 mb-1">
              {tocAuf ? 'Gliederung ausblenden' : 'Gliederung anzeigen'}
            </button>
            <div className="mb-2 hidden lg:flex items-baseline justify-between shrink-0">
              <p className="lc-overline">Gliederung</p>
              <button type="button" onClick={() => setTocOffen((v) => !v)} className="text-micro text-ink-400 hover:text-brass-700" title="Gliederung ein-/ausklappen">{tocOffen ? '‹ einklappen' : 'ausklappen ›'}</button>
            </div>
            <div data-toc className={`${tocAuf ? 'block max-h-[60vh] overflow-y-auto' : 'hidden'} ${tocOffen ? 'lg:block' : 'lg:hidden'} lg:flex-1 lg:min-h-0 lg:overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]`}>
              <SektionBaumTOC sektionen={sektionen} aktivPfad={aktivIds} offen={tocBaum}
                onToggle={tocToggle}
                onSprung={(id) => {
                  const ids = pfadZu(sektionen, (s) => s.id === id) ?? [id];
                  // Spy stilllegen + Ziel markieren. Den Pfad NUR aufklappen (andere
                  // Sektionen NICHT zuklappen) — sonst schrumpft das Layout ÜBER dem
                  // Ziel und der Sprung landet zu kurz (im Vorabschnitt, Bug David).
                  jumpLock.current = true;
                  aktivIdRef.current = id;
                  setAktivIds(ids);
                  setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
                  // Lesebereich-Pfad öffnen, damit die Ziel-Überschrift gerendert IST
                  // (zugeklappt existiert sie nicht im DOM → Sprung verpufft).
                  setOffen((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
                  // Nach dem Render (zwei Frames) präzise positionieren. INSTANT statt
                  // smooth → kein Scroll-Spy-Race, der den Treffer mitten in der
                  // Animation auf den Vorabschnitt umlatcht. scrollIntoView respektiert
                  // das scroll-mt (Header + Suchleiste) → Überschrift landet sichtbar.
                  requestAnimationFrame(() => requestAnimationFrame(() => {
                    sekRefs.current.get(id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
                    requestAnimationFrame(() => { jumpLock.current = false; });
                  }));
                }} />
            </div>
          </aside>
        )}

        <div className={`group/lese ${sektionen.length > 0 && tocOffen ? '' : 'mx-auto w-full max-w-[56rem]'}`}>
          {/* Suchleiste auf Höhe der Artikel (eigene Zeile, sticky bündig unter dem
              Header). Der frühere fliegende Standort-Tracker entfällt — der Standort
              ergibt sich aus der markierten Gliederung, den Sektionsüberschriften und
              den statischen Randtiteln an den Artikeln. */}
          <div data-such-bar className="sticky top-16 z-[15] mb-4 rounded-lg bg-paper">
            <div className="flex items-center gap-3 rounded-lg border border-line bg-paper px-3 py-2 shadow-sm">
              {sektionen.length > 0 && !tocOffen && (
                <button type="button" onClick={() => setTocOffen(true)} title="Gliederung einblenden"
                  className="shrink-0 text-micro text-ink-500 hover:text-brass-700">☰ Gliederung</button>
              )}
              <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
                placeholder="Im Gesetz suchen …" aria-label="Im Gesetz suchen"
                className="lc-input h-9 py-0 text-body-s flex-1 min-w-0" />
              <button type="button" onClick={() => setFussnotenAuf((v) => !v)} aria-pressed={fussnotenAuf}
                className={`shrink-0 text-micro ${fussnotenAuf ? 'text-brass-700' : 'text-ink-400 hover:text-brass-700'}`}
                title="Fussnoten ein-/ausblenden">{fussnotenAuf ? '✓ Fussnoten' : 'Fussnoten'}</button>
            </div>
          </div>
          {treffer ? (
            <div className="space-y-4">
              <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{suche.trim()}»</p>
              {treffer.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} fussnotenAuf={fussnotenAuf} intern={internRefs} marg={struktur?.[e.artikel]?.marginalie} />)}
              {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Artikel gefunden.</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {ohneGliederung.length > 0 && (
                <div className="space-y-5 mb-6">
                  {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} fussnotenAuf={fussnotenAuf} intern={internRefs} marg={margAnzeige.get(e.artikel)} />)}
                </div>
              )}
              {sektionen.map((s) => renderSektion(s, true))}
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
  sektionen: Sektion[]; aktivPfad: string[]; offen: Record<string, boolean>; // aktivPfad = Sektions-IDs
  onToggle: (id: string) => void; onSprung: (id: string) => void;
}) {
  // Akkordeon: Standard zu — aufgeklappt wird NUR durch Klick (Chevron oder
  // Sprung). Scrollen klappt nichts auf/zu (Auftrag David: kein Flackern); der
  // Scroll-Spy markiert nur den aktiven Pfad, ohne den Baum umzubauen.
  const zeile = (s: Sektion, tiefe: number): ReactNode => {
    const auf = offen[s.id] ?? false;
    const { pre, rest } = romanFrei(s.label);
    const aktiv = aktivPfad.includes(s.id);
    const hatKinder = s.kinder.length > 0;
    return (
      <li key={s.id}>
        <div className="flex items-start" style={{ paddingLeft: `${tiefe * 0.6}rem` }}>
          {hatKinder
            ? <button type="button" onClick={() => onToggle(s.id)} aria-label={auf ? 'Einklappen' : 'Aufklappen'} className="shrink-0 text-ink-300 hover:text-ink-600 px-1 mt-0.5 text-[0.6rem] w-4">{auf ? '▾' : '▸'}</button>
            : <span className="shrink-0 w-4" aria-hidden />}
          <button type="button" onClick={() => onSprung(s.id)} data-toc-aktiv={aktiv ? '1' : undefined} aria-current={aktiv ? 'true' : undefined}
            className={`flex-1 text-left rounded px-1.5 py-0.5 leading-snug transition-colors ${tiefe === 0 ? 'text-body-s' : 'text-xs'} ${aktiv ? 'text-ink-900 font-medium bg-brass-100/40' : 'text-ink-600 hover:text-ink-900 hover:bg-paper-sunken/60'}`}>
            {pre ? <><span className="font-medium text-ink-700">{pre}:</span> {rest}</> : s.label}
          </button>
        </div>
        {/* Sanftes Auf-/Zuklappen via grid-rows (0fr↔1fr) — Kinder bleiben gemountet. */}
        {hatKinder && (
          <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${auf ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden min-h-0">
              <ul className="space-y-0.5 mt-0.5">{s.kinder.map((k) => zeile(k, tiefe + 1))}</ul>
            </div>
          </div>
        )}
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
