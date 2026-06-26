import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { naechsteInstanz, merkeTab, aktualisiereTabArtikel } from '../lib/tabs';
import { aktiverArtikel } from '../lib/normtext/aktuellerArtikel';
import { ArtikelBody, FnRef } from '../components/normtext/ArtikelBody';
import { useDialogFokus } from '../components/layout/useDialogFokus';
import type { InternRefs } from '../components/NormText';
import { trenneAenderungshistorie, labelMitBereich, artikelGanzAufgehoben } from '../lib/normtext/darstellung';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, ladeStruktur, ladeKantonSystematik,
  baueGliederungsbaum, type Sektion, type StrukturMap, type Fussnote,
} from '../lib/normtext/browse';
import { sachgruppe, topTitel, type KantonSystematik } from '../lib/normtext/systematik';
import { GEBIET_LABEL } from '../lib/normtext/register';
import { NORM_IM_TEXT, fedlexLinkFuerArtikel } from '../lib/fedlex';
import { NormChip } from '../components/vorlagen/ui';
import { werkzeugeFuer } from '../lib/normtext/werkzeuge';
import { rechtsprechungFuerErlass, type EntscheidRef } from '../lib/rechtsprechung/norm-index';
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
function ArtikelLeser({ e, erlass, basisPfad, fussnoten, fussnotenAuf, intern, marg, imTreffer, onSpringe }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; fussnoten?: Fussnote[]; fussnotenAuf: boolean; intern?: InternRefs;
  marg?: string[];
  // Treffer-Modus (Auftrag David): Klick auf die Artikelnummer springt in den
  // VOLLTEXT zu diesem Artikel und löscht die Suche, statt nur innerhalb der
  // Trefferliste zu ankern.
  imTreffer?: boolean; onSpringe?: (token: string) => void;
}) {
  const [kopiert, setKopiert] = useState<'' | 'zitat' | 'link'>('');
  const label = labelMitBereich(e.artikelLabel, e.artikel);
  const zitat = `${label} ${erlass.kuerzel}`;
  // Vollständig aufgehobener Artikel → dezent + standardmässig eingeklappt
  // (Auftrag David: «nicht so präsent», aufklappbar über den ▾/▸-Toggle).
  const ganzAufgehoben = artikelGanzAufgehoben(e.bloecke);
  // Fussnoten am Fuss: amtliche Sidecar-Fussnoten bevorzugen; fehlen sie, die
  // aus dem Wortlaut-Block abgetrennte Änderungshistorie (Extraktions-Artefakt)
  // hier zeigen — einheitlich EINE Quelle, keine Doppelung.
  const fussAnzeige: Fussnote[] = fussnoten && fussnoten.length > 0
    ? fussnoten
    : e.bloecke
        .map((b) => trenneAenderungshistorie(b.text).historie)
        .filter((h): h is string => !!h)
        .map((text): Fussnote => ({ nr: '', text, links: [] }));
  const [artOffen, setArtOffen] = useState(!ganzAufgehoben); // einzelner Artikel ein-/ausklappbar; aufgehoben → zu
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
  // Marker nur, wenn der Artikel offen ist (Ziel <p id=fn-…> lebt im artOffen-Block):
  // sonst öffnete der sichtbare Marker am eingeklappten Artikel ein leeres Popover
  // (toter Bedienpfad — typisch bei aufgehobenen Artikeln, Default eingeklappt).
  const fnMarker = artOffen && fussnotenAuf && fnArtikelEbene.length > 0
    ? <span className="ml-0.5">{fnArtikelEbene.map((nr, i) => (
        <span key={nr}>{i > 0 && <span className="align-super text-[0.62em] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
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
      className="nt-art-cv group relative z-0 nt-anker border-t border-line/70 pt-7 mt-7 first:border-t-0 first:mt-0 first:pt-0 transition duration-200 group-has-[[data-lese]:hover]/lese:opacity-80 has-[[data-lese]:hover]:!opacity-100 has-[[data-lese]:hover]:z-[5]">
      {/* Fedlex-Stil (Auftrag David): «Art. N» + Randtitel/Sachüberschrift stehen
          IMMER OBERHALB des Absatztextes (keine seitliche Randspalte mehr), damit
          der Normtext die volle Lesespaltenbreite bekommt. Reine Darstellung (§3). */}
      <div>
        {/* Kopfzeile des Artikels: «Art. N» als Anker, darunter die Randtitel
            (linksbündig, Sachüberschrift zuunterst) — über dem Fliesstext. */}
        <div className="mb-1.5">
          {/* Fedlex-Reihenfolge (Auftrag David 26.6.2026): Gliederungs-/Randtitel
              stehen ÜBER der Artikelnummer (nicht darunter) — und bleiben auch bei
              eingeklapptem/aufgehobenem Artikel sichtbar (Fedlex-treu). Die unterste
              Stufe (Sachüberschrift) zuunterst, font-medium. Reine Darstellung (§3).
              N1 (BS-Audit 23.6.2026): amtlicher Randtitel (article_title) nur, wenn
              KEINE feinere struktur-Marginalie (marg) vorliegt. */}
          {marg && marg.length > 0 ? (
            <div className="mb-1 space-y-0.5 font-serif leading-snug">
              {marg.map((m, i) => (
                <div key={i} className={i === marg.length - 1
                  ? 'text-base font-semibold text-ink-800'
                  : 'text-body-s text-ink-600'}>{m}</div>
              ))}
            </div>
          ) : e.titel ? (
            <div className="mb-1 font-serif leading-snug text-base font-semibold text-ink-800">
              {e.titel}
            </div>
          ) : null}
          {/* Artikelnummer-Zeile: «Art. N» als Anker; Zitat/Link rechtsbündig INLINE
              (ml-auto) statt als eigene Zeile darunter — schliesst den Abstand zum
              ersten Absatz (Auftrag David 26.6.2026, P8). */}
          <div className="flex items-baseline gap-2">
            <button type="button" onClick={() => setArtOffen((v) => !v)} aria-expanded={artOffen}
              aria-label={artOffen ? 'Artikel einklappen' : 'Artikel ausklappen'}
              className="shrink-0 text-micro text-ink-300 hover:text-brass-700">{artOffen ? '▾' : '▸'}</button>
            {imTreffer && onSpringe ? (
              <button type="button" onClick={() => onSpringe(e.artikel)}
                title="Im Volltext zu diesem Artikel springen"
                className={`num text-base font-bold tracking-wide hover:text-brass-700 text-left ${ganzAufgehoben ? 'text-ink-400 font-normal' : 'text-ink-900'}`}>{label}</button>
            ) : (
              <a href={`#art-${e.artikel}`} className={`num text-base font-bold tracking-wide hover:text-brass-700 no-underline ${ganzAufgehoben ? 'text-ink-400 font-normal' : 'text-ink-900'}`}>{label}</a>
            )}{fnMarker}
            {ganzAufgehoben && <span className="text-xs italic text-ink-400">· aufgehoben</span>}
            {artOffen && (
              <span className="ml-auto flex shrink-0 gap-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                <button type="button" onClick={() => kopiere('zitat')} className="text-micro text-ink-500 hover:text-brass-700" aria-label={`${zitat} kopieren`}>{kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}</button>
                <button type="button" onClick={() => kopiere('link')} className="text-micro text-ink-500 hover:text-brass-700" aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
              </span>
            )}
          </div>
        </div>
        {/* Rechte Lesespalte: grosse Serifenschrift, hängende Messing-Absatznummern.
            overflow-x-clip + min-w-0: bei geteiltem/schmalem Bildschirm darf der
            Artikel-Block (hängender Absatz-Einzug pl-9/-indent-9) NICHT über die
            Spalte hinausragen → sonst wurde Text rechts abgeschnitten (Befund David
            25.6.2026). Der Wortumbruch im Absatz (overflow-wrap:anywhere) bleibt. */}
        {artOffen && (
        <div className="max-w-[52rem] min-w-0 overflow-x-clip">
          <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
            zitierKontext={{ artikelLabel: label, kuerzel: erlass.kuerzel }}
            fnProAbsatz={fussnotenAuf ? fnProAbsatz : undefined} fnProItem={fussnotenAuf ? fnProItem : undefined}
            intern={intern}
            className="space-y-3.5 font-serif text-body-l leading-[1.65] text-ink-800" />
          {/* VERWEISE: auflösbare Normverweise des Artikels als Chips (Referenz David). */}
          {verweise.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="lc-overline mr-1">Verweise</span>
              {verweise.map((v) => <NormChip key={v} artikel={v} />)}
            </div>
          )}
          {/* Fussnoten (Änderungs-/Quellenhistorie, AS/BBl klickbar): nur auf Wunsch
              (globaler Schalter in der Suchleiste). */}
          {fussnotenAuf && fussAnzeige.length > 0 && (
            <div className="mt-3 border-t border-line/50 pt-2 space-y-1">
              {fussAnzeige.map((fn, i) => (
                <p key={i} id={fn.nr ? `fn-${e.artikel}-${fn.nr}` : undefined} className="nt-anker text-xs leading-normal text-ink-500 target:bg-brass-100">
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
  // Titelgrösse nach Tiefe (E, Auftrag David 26.6.2026): Fedlex-artig abgestuft —
  // oberste Stufe prominent (h2), dann h3, body-l, sonst base. font-semibold liegt
  // am Titel-Span (unten). Nur existierende Tokens (§13).
  const titelStil = s.ebene === 0 ? 'text-h2' : s.ebene === 1 ? 'text-h3' : s.ebene === 2 ? 'text-body-l' : 'text-base';
  return (
    <div ref={refCb} data-sek={s.id} className={`nt-anker ${mt} ${regel}`}>
      <button type="button" onClick={onToggle} aria-expanded={offen} className="group/sek w-full text-left">
        {pre && <span className="lc-overline group-hover/sek:text-brass-700">{pre}</span>}
        <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {/* Einklapp-Marke deutlich (analog Fedlex, Auftrag David): jede Stufe
              inkl. Untergruppe ist klappbar — vorher war das Chevron zu blass/winzig,
              darum wirkte es, als ginge es nicht. Messing-Akzent macht es als
              Steuerelement erkennbar. */}
          <span className={`shrink-0 w-4 text-body-s transition-colors ${offen ? 'text-brass-600' : 'text-ink-500'} group-hover/sek:text-brass-700`}>{offen ? '▾' : '▸'}</span>
          <span className={`font-display font-semibold text-ink-900 ${titelStil} group-hover/sek:text-brass-700`}>{rest || s.label}</span>
          {bereich && <span className="num shrink-0 text-xs font-normal text-ink-500">{bereich}</span>}
        </span>
      </button>
    </div>
  );
}

function GesetzLeserInhalt({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;
  const navigate = useNavigate();
  const location = useLocation();
  const [erlass, setErlass] = useState<BrowseErlass | null>(null);
  const [eintraege, setEintraege] = useState<NormSnapshot[] | null>(null);
  const [struktur, setStruktur] = useState<StrukturMap | null>(null);
  const [manifest, setManifest] = useState<BrowseManifest | null>(null);
  const [fehler, setFehler] = useState(false);
  const [suche, setSuche] = useState('');
  // Scrollposition VOR der Suche merken → beim Leeren der Suche dorthin zurück,
  // statt an den Anfang zu springen (Auftrag David). Ein Treffer-Klick nullt das
  // (springt stattdessen zum Artikel).
  const scrollVorSuche = useRef<number | null>(null);
  const sucheVorher = useRef('');
  // Auf-/Zu-Zustand des FLIESSTEXTS (Sektionen im Lesefluss). Default OFFEN
  // (renderSektion mit defOpen=true) — Fedlex-treu der ganze Erlass lesbar; jede
  // Stufe ist per SektionKopf-Toggle einzeln einklappbar. Eigener State, vom TOC
  // entkoppelt (D, Auftrag David 26.6.2026).
  const [offen, setOffen] = useState<Record<string, boolean>>({});
  // Eigener Auf-/Zu-Zustand NUR für den TOC-Baum (entkoppelt vom Fliesstext).
  // Default ZU (SektionBaumTOC: `?? false`); beim Scrollen klappt der Spy die
  // aktive Sektion auf und beim Verlassen wieder zu (K) — manuell geöffnete
  // Zweige bleiben offen (autoOffenRef).
  const [tocBaum, setTocBaum] = useState<Record<string, boolean>>({});
  // Während eines Klick-Sprungs den Scroll-Spy stilllegen, damit der Baum nicht
  // durch die durchscrollten Zwischen-Sektionen flackert (auf/zu).
  const jumpLock = useRef(false);
  // K (Auftrag David 26.6.2026): Zweige, die der Scroll-Spy AUTOMATISCH geöffnet
  // hat. Nur diese darf der Spy wieder zuklappen, sobald die Leseposition den
  // Zweig verlässt — manuell (Klick) geöffnete Zweige bleiben offen, weil sie
  // nicht in diesem Set stehen (tocToggle/springeZuSektion nehmen sie heraus).
  const autoOffenRef = useRef<Set<string>>(new Set());
  // Zweige, die der NUTZER selbst aufgeklappt hat (Klick/Sprung). Der Scroll-Spy
  // darf diese NIE ins Auto-Set adoptieren und NIE auto-zuklappen — auch dann
  // nicht, wenn die Leseposition durch sie hindurchscrollt (David: «nur was
  // automatisch geöffnet wurde, geht wieder zu»).
  const manuellOffenRef = useRef<Set<string>>(new Set());
  // Zweige, die der NUTZER selbst zugeklappt hat — auch wenn sie im aktiven
  // Lesepfad liegen. Der Scroll-Spy darf sie NICHT wieder auto-aufklappen,
  // solange der Nutzer sie nicht selbst wieder öffnet (sonst überschreibt der
  // Spy das explizite Einklappen des gerade gelesenen Zweigs).
  const manuellZuRef = useRef<Set<string>>(new Set());
  // Manuelles Auf-/Zuklappen im TOC: beim Öffnen in manuellOffenRef aufnehmen
  // (bleibt offen) + aus manuellZuRef nehmen; beim Schliessen umgekehrt (in
  // manuellZuRef, aus manuellOffenRef); nie im Auto-Set (K).
  const tocToggle = (id: string) => {
    setTocBaum((o) => {
      const offenJetzt = !o[id];
      autoOffenRef.current.delete(id);
      if (offenJetzt) { manuellOffenRef.current.add(id); manuellZuRef.current.delete(id); }
      else { manuellOffenRef.current.delete(id); manuellZuRef.current.add(id); }
      return { ...o, [id]: offenJetzt };
    });
  };
  const [aktivIds, setAktivIds] = useState<string[]>([]); // Sektions-IDs (TOC-Markierung, eindeutig)
  const [tocAuf, setTocAuf] = useState(false); // unter xl: Gliederungs-Drawer offen?
  const [tocOffen, setTocOffen] = useState(true); // ab xl: Gliederungsspalte ein-/ausklappen
  // Echte xl-Erkennung (2-Spalten gibt es nur ab 1280px). Ohne sie behandelte der
  // Code «tocOffen» fälschlich als 2-Spalten-aktiv → unter xl verschwand der
  // Gliederungs-Zugang beim Scrollen (Auftrag David: «bei geteiltem Bildschirm
  // jederzeit ausklappbar, analog Seitenleiste»). SSR-Default false = mobil-Layout.
  const [istXl, setIstXl] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const upd = () => setIstXl(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);
  const [fussnotenAuf, setFussnotenAuf] = useState(false); // Fussnoten nur auf Wunsch
  // N13: amtliche Kanton-Systematik (lazy) — liefert das echte Sachgebiet eines
  // kantonalen Erlasses für die Reader-Overline (statt Einheits-«Öffentliches Recht»).
  const [kantonSys, setKantonSys] = useState<Record<string, KantonSystematik>>({});
  const [rspr, setRspr] = useState<EntscheidRef[]>([]); // BGer-Entscheide zu diesem Erlass (Verzahnung)
  useEffect(() => {
    if (!erlass) return;  // kein synchrones setState im Effekt-Body (Default ist [])
    let lebt = true;
    rechtsprechungFuerErlass(erlass.key).then((r) => { if (lebt) setRspr(r); });
    return () => { lebt = false; };
  }, [erlass]);
  const sekRefs = useRef<Map<string, HTMLElement>>(new Map());
  // Mobiler Suche-&-Gliederung-Drawer (role=dialog): Esc-Schliessen, Fokus
  // setzen + fangen, Fokus-Rückgabe an den Auslöser über den geteilten Hook (§5).
  const tocDrawerRef = useRef<HTMLDivElement | null>(null);
  useDialogFokus(!istXl && tocAuf, tocDrawerRef, () => setTocAuf(false));
  // Live-Label des aktiven Reiters beim Scrollen entprellen (Trailing-Debounce):
  // sonst ein localStorage-Write + globales TABS_EVENT pro überschrittener
  // Artikelgrenze (Scroll-Jank auf langen Erlassen). Reine Timing-Optimierung (§6.4).
  const tabArtikelTimer = useRef<number | null>(null);

  useEffect(() => {
    let lebt = true;
    void ladeBrowseManifest().then((m) => { if (lebt) setManifest(m); });
    void ladeStruktur(ebene, schluessel).then((s) => { if (lebt) setStruktur(s); });
    // N13: Systematik-Bäume nur für die Kanton-Lesesicht laden; fehlen sie, bleibt
    // die Overline ohne Sachgebiet (§8 — nichts Erfundenes).
    if (ebene === 'kanton') void ladeKantonSystematik().then((s) => { if (lebt) setKantonSys(s); });
    void ladeErlass(schluessel).then(async (e) => {
      if (!lebt) return;
      if (!e) { setFehler(true); return; }
      // pdf-embed: kein Snapshot-JSON — Erlass setzen, der Reader rendert das
      // eingebettete amtliche PDF (eintraege bleibt null).
      if (e.status === 'pdf-embed') { setErlass(e); return; }
      if (!e.datei) { setFehler(true); return; }
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
    let prevGl = '';
    for (const e of eintraege ?? []) {
      const m = struktur?.[e.artikel]?.marginalie ?? [];
      // Delta nur INNERHALB derselben Gliederungs-Sektion: am Sektionsanfang den
      // vollen Randtitel zeigen (prev zurücksetzen). Sonst fehlt dem ersten
      // Artikel einer Sektion der gegen den — evtl. verborgenen — Vorartikel der
      // VORigen Sektion weggekürzte Randtitel (Befund 26.6.2026: DBG Art. 18 zeigte
      // sonst gar keinen, SVG 26→27 unterdrückte die obere Stufe). Reine Darstellung.
      const gl = (struktur?.[e.artikel]?.gliederung ?? []).map((g) => g.label).join('');
      if (gl !== prevGl) prev = [];
      let i = 0;
      while (i < m.length && i < prev.length && m[i] === prev[i]) i++;
      map.set(e.artikel, m.slice(i));
      prev = m;
      prevGl = gl;
    }
    return map;
  }, [eintraege, struktur]);

  // Interner Artikel-Sprung (Querverweise im Wortlaut): Vorfahren öffnen, scrollen,
  // Permalink setzen — derselbe Mechanismus wie der Hash-Sprung.
  const springeZuArtikel = useCallback((token: string) => {
    // Im Suchmodus erst die Suche verlassen, sonst ist das Ziel nicht im DOM
    // (nur Treffer gerendert) → Permalink änderte sich ohne Sprung. Kein Zurück
    // zur Vor-Such-Position (wir springen ja gezielt zum Artikel).
    scrollVorSuche.current = null;
    setSuche('');
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    if (ids.length) {
      setOffen((o) => { const n = { ...o }; for (const id of ids) n[id] = true; return n; });
      // TOC sofort auf den Zielpfad + Spy während des (zweistufigen, wegen
      // content-visibility ungenauen) Sprungs stilllegen — sonst flackert der Baum
      // durch die kurz zentrierten Zwischensektionen auf/zu. autoOffenRef/manuellOffenRef
      // bleiben unangetastet (der Zweig wird vom Spy normal nachgeführt + collabiert
      // beim Wegscrollen wieder), nur ein evtl. manuelles ZU wird aufgehoben.
      for (const id of ids) manuellZuRef.current.delete(id);
      setAktivIds(ids);
      setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((id) => [id, true])) }));
      jumpLock.current = true;
    }
    if (typeof window === 'undefined') return;
    // ?search (Instanz-Diskriminator ?r) erhalten, sonst verliert ein Mehrfach-
    // Reiter seine Identität. Aktiven Reiter auf diesen Artikel melden → Live-
    // Label «Kürzel – Art. X» bei Mehrfach-Instanz (Auftrag David).
    const ziel = `${basisPfad}${window.location.search}#art-${token}`;
    window.history.replaceState(null, '', ziel);
    aktualisiereTabArtikel(ziel);
    // Erst nach dem Aufklapp-Render scrollen (behavior:auto wie der Hash-Sprung);
    // grosse Sektionen wachsen beim Aufklappen → nach Settle ein Korrektur-Scroll.
    const scrolle = () => {
      const el = document.getElementById(`art-${token}`);
      if (!el) return;
      el.scrollIntoView({ block: 'center', behavior: 'auto' });
      el.classList.add('lc-ziel-blink');
      window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
    };
    window.requestAnimationFrame(() => window.setTimeout(() => {
      scrolle();
      window.setTimeout(() => { scrolle(); jumpLock.current = false; }, 400);
    }, 110));
  }, [sektionen, basisPfad]);

  // Wechsel zwischen zwei Instanzen DESSELBEN Gesetzes (?r) bzw. ein Tab-Klick mit
  // #art-Anker remountet den Reader nicht (gleicher pathname) — darum bei jeder
  // Navigation mit Artikel-Anker gezielt dorthin springen (Auftrag David: Klick
  // auf den Reiter führt zum gemerkten Artikel der Instanz).
  const letzteNavKey = useRef<string | null>(null);
  useEffect(() => {
    if (!sektionen.length || typeof window === 'undefined') return;
    // Nur bei ECHTER Navigation (location.key wechselt), nicht wenn sektionen
    // nachlädt. Den Initial-Load (erster key) deckt der Lade-Hash-Effekt ab →
    // kein doppelter Sprung/Blink. Dieser Effekt trägt nur den Instanz-Wechsel
    // (gleicher pathname, nur ?r/#).
    if (letzteNavKey.current === location.key) return;
    const erstmalig = letzteNavKey.current === null;
    letzteNavKey.current = location.key;
    if (erstmalig) return;
    const m = location.hash.match(/^#art-(.+)$/);
    if (!m) return;
    const token = decodeURIComponent(m[1]);
    const id = window.requestAnimationFrame(() => springeZuArtikel(token));
    return () => window.cancelAnimationFrame(id);
  }, [location.key, location.hash, sektionen, springeZuArtikel]);

  // Suche aktivieren → an den Anfang scrollen; Suche schliessen/leeren → an die
  // Scrollposition VOR der Suche zurück (Auftrag David). Grund fürs Hoch-Scrollen
  // beim Aktivieren (Bug David 26.6.2026): die Trefferliste ist kürzer als der
  // Volltext — war man tief gescrollt, rutschte der sticky-Container (Suchleiste +
  // Gliederung) mit seinem geschrumpften Inhalt über den Viewport hinaus und war
  // «aus dem Bild». Nach oben scrollen holt Suchleiste + Gliederung zurück ins
  // Sichtfeld. Reine Scroll-Steuerung (kein setState) → keine Render-Kaskade.
  useEffect(() => {
    const war = sucheVorher.current;
    sucheVorher.current = suche;
    if (typeof window === 'undefined') return;
    if (!war && suche) {
      scrollVorSuche.current = window.scrollY;
      window.requestAnimationFrame(() => window.scrollTo(0, 0));
    } else if (war && !suche && scrollVorSuche.current != null) {
      const y = scrollVorSuche.current;
      scrollVorSuche.current = null;
      window.requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [suche]);

  // Token-Auflösung für bare Artikelverweise (normalisiert «6a» → Token «6_a»).
  const internRefs = useMemo<InternRefs | undefined>(() => {
    if (!eintraege) return undefined;
    const tokenMap = new Map<string, string>();
    for (const e of eintraege) tokenMap.set(e.artikel.toLowerCase().replace(/[^a-z0-9]/g, ''), e.artikel);
    return { tokenMap, basisPfad, springeZu: springeZuArtikel };
  }, [eintraege, basisPfad, springeZuArtikel]);

  // Offen-Zustand des FLIESSTEXTS (eigener State; der TOC-Baum hat seinen eigenen
  // `tocBaum`). renderSektion ruft mit defOpen=true → der ganze Erlass ist
  // Fedlex-treu standardmässig aufgeklappt; jede Stufe bleibt per Toggle
  // einklappbar. Reine Darstellung (§3).
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
    // Deep-Link mit Artikel-Anker → aktiven Reiter darauf melden (Live-Label).
    aktualisiereTabArtikel(window.location.pathname + window.location.search + window.location.hash);
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

  // Geteilter «aktueller-Artikel»-Beobachter (Auftrag David 26.6.2026): EIN
  // IntersectionObserver bestimmt den Artikel im Viewport-MITTELPUNKT und speist
  // daraus zwei Konsumenten aus EINER Quelle — (a) die Gliederungs-Markierung +
  // automatisches Auf-/Zuklappen des aktiven Zweigs (P9/K) UND (b) das Live-Label des aktiven Reiters
  // «Kürzel – Art. X» (P2). IntersectionObserver statt getBoundingClientRect-
  // Schleife wegen content-visibility:auto (Off-Screen-Artikel sind nur Platz-
  // halter); das schmale Mittel-Band (rootMargin -45%/-45%) meldet genau den
  // zentrierten Artikel. Die Auswahl-Logik ist die reine, getestete Funktion
  // aktiverArtikel (§2/§3).
  const letzterArtToken = useRef<string | null>(null);
  useEffect(() => {
    // C (Auftrag David 26.6.2026): auch starten, wenn der Erlass KEINE Gliederung
    // hat (kantonale Erlasse → alle Artikel in `ohneGliederung`). Sonst lief der
    // Beobachter nie an und «aktueller Artikel» (Reiter-Live-Label, P2) blieb
    // bei Kanton stehen. Artikel tragen bei Bund UND Kanton id="art-<token>".
    if ((!sektionen.length && !ohneGliederung.length) || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const sichtbar = new Map<Element, IntersectionObserverEntry>();
    let raf = 0;
    const auswerten = () => {
      raf = 0;
      if (jumpLock.current) return; // während eines Klick-Sprungs nicht dazwischenfunken
      const mitte = window.innerHeight / 2;
      const rects = [...sichtbar.values()]
        .filter((en) => en.isIntersecting)
        .map((en) => {
          const r = en.target.getBoundingClientRect();
          return { token: (en.target as HTMLElement).id.replace(/^art-/, ''), top: r.top, bottom: r.bottom };
        });
      const token = aktiverArtikel(rects, mitte);
      if (!token || token === letzterArtToken.current) return; // dedup: nur bei Wechsel
      letzterArtToken.current = token;
      // (b) Reiter-Live-Label: ?search (Instanz-?r) erhalten, Hash = #art-token.
      //     aktualisiereTabArtikel ist idempotent + no-op ohne passenden Reiter.
      //     Entprellt (trailing): beim schnellen Durchscrollen sonst ein
      //     localStorage-Write + globales TABS_EVENT pro Artikelgrenze.
      const tabZiel = `${basisPfad}${window.location.search}#art-${token}`;
      if (tabArtikelTimer.current != null) window.clearTimeout(tabArtikelTimer.current);
      tabArtikelTimer.current = window.setTimeout(() => aktualisiereTabArtikel(tabZiel), 200);
      // (a) Gliederung: aktiven Pfad markieren + den Zweig automatisch AUFklappen
      //     und beim Verlassen wieder ZUklappen (K, Auftrag David 26.6.2026) —
      //     aber nur Zweige, die der Spy selbst geöffnet hat (autoOffenRef);
      //     manuell geöffnete bleiben offen. Der Mitscroll-Effekt hält den
      //     aktiven Eintrag dann im TOC-Container sichtbar.
      const ids = pfadZu(sektionen, (s) => s.artikel.some((x) => x.artikel === token)) ?? [];
      if (!ids.length) return;
      // Wertgleichen Pfad nicht neu setzen (pfadZu liefert stets ein neues Array):
      // sonst Re-Render + Mitscroll-Effekt bei jedem Artikel derselben Blatt-Sektion.
      setAktivIds((prev) => prev.length === ids.length && prev.every((v, i) => v === ids[i]) ? prev : ids);
      // Auto-Set fortschreiben (Seiteneffekt ausserhalb des State-Updaters, der
      // rein bleibt): zuklappen, was automatisch offen war und nicht mehr im
      // aktiven Pfad liegt; aufklappen, was jetzt im Pfad liegt.
      const auto = autoOffenRef.current;
      const schliessen: string[] = [];
      for (const id of [...auto]) if (!ids.includes(id)) { auto.delete(id); schliessen.push(id); }
      // Aktive Pfad-IDs auto-aufklappen — aber manuell geöffnete NICHT ins Auto-Set
      // adoptieren (die bleiben dauerhaft offen) und manuell ZUgeklappte (manuellZuRef)
      // gar nicht auto-aufklappen (explizites Einklappen des aktiven Zweigs gewinnt).
      for (const id of ids) if (!manuellOffenRef.current.has(id) && !manuellZuRef.current.has(id)) auto.add(id);
      setTocBaum((o) => {
        let geaendert = false;
        const n = { ...o };
        for (const id of ids) if (!n[id] && !manuellZuRef.current.has(id)) { n[id] = true; geaendert = true; }
        for (const id of schliessen) if (n[id]) { n[id] = false; geaendert = true; }
        return geaendert ? n : o; // identische Referenz, wenn nichts ändert → kein Re-Render
      });
    };
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) sichtbar.set(en.target, en);
      if (!raf) raf = window.requestAnimationFrame(auswerten);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    // Alle aktuell gerenderten Artikel beobachten. Auf-/Zuklappen (offen) und
    // Suche (suche) verändern die DOM-Artikelmenge → Effekt läuft über die Deps
    // neu und beobachtet die dann sichtbaren Artikel.
    document.querySelectorAll('[id^="art-"]').forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (tabArtikelTimer.current != null) window.clearTimeout(tabArtikelTimer.current);
    };
  }, [sektionen, ohneGliederung, basisPfad, offen, suche]);

  // Aktiven Eintrag im TOC sichtbar halten — sanft, nur den TOC-Container, nie die
  // Seite scrollen. Läuft bei JEDEM Wechsel des aktiven Pfads (aktivIds) UND nach
  // dem Aufklapp-Settle (tocBaum): so folgt die Gliederung beim Scrollen der
  // Leseposition (P9b — vorher fehlte aktivIds in den Deps, darum scrollte der TOC
  // beim Scrollen nicht mit). Nur scrollen, wenn der aktive Eintrag aus dem Sicht-
  // feld des TOC-Containers gelaufen ist (sonst kein unnötiger Sprung).
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
  }, [aktivIds, tocBaum]);

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
  // ── pdf-embed: amtliches PDF in-app (kein extrahierbarer Volltext-HTML) ──────
  // Auftrag David 25.6.2026: statt nacktem Live-Link das amtliche Fedlex-PDF in
  // den vollen Reader-Rahmen einbetten (Breadcrumb, Kopf, Provenienz, Download,
  // native PDF-Suche). Fedlex setzt X-Frame-Options: DENY → Hotlink unmöglich,
  // darum SELBST gehostet (same-origin). Wichtig: die globale DENY-Header-Politik
  // (vercel.json) ist für /normtext/ auf SAMEORIGIN + frame-ancestors 'self'
  // gelockert, sonst blockiert der Browser auch den eigenen PDF-iframe (Prod-only).
  // Massgeblich bleibt die amtliche Quelle (sichtbarer Live-Link, §7/§8); Drift-
  // Tor: check:pdf (offline Integrität + netz Drift & geltende Konsolidierung).
  if (erlass && erlass.status === 'pdf-embed' && erlass.pdfPfad) {
    const titelOhneSuffixP = erlass.titel.replace(/\s*\([^)]*\)\s*$/, '').trim();
    const titelRedundantP = titelOhneSuffixP.toLowerCase() === erlass.kuerzel.trim().toLowerCase();
    return (
      <div className="space-y-5">
        <div className="-mx-5 sm:-mx-6 px-5 sm:px-6 py-2 border-b border-line text-xs text-ink-500">
          <Link to="/gesetze" className="hover:text-brass-700">Gesetze</Link>
          <span className="mx-1.5 text-ink-300">›</span>
          {erlass.rechtsgebiet === 'international' ? 'International' : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`}
          <span className="mx-1.5 text-ink-300">›</span>
          <span className="text-ink-700 font-medium">{erlass.kuerzel}</span>
        </div>
        <header className="space-y-2.5 border-b border-line pb-5">
          <p className="lc-overline">{erlass.ebene === 'bund' ? 'Staatsvertrag' : `Kanton ${erlass.kanton}`} · amtliches PDF</p>
          <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900 [overflow-wrap:anywhere] hyphens-auto">
            {erlass.kuerzel}{!titelRedundantP && <span className="text-ink-500 font-normal"> — {erlass.titel}</span>}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
            {erlass.sr && <span>SR <span className="num">{erlass.sr}</span></span>}
            {erlass.sr && <span className="text-ink-300" aria-hidden>·</span>}
            {erlass.stand && <span>Stand <span className="num">{formatiereDatum(erlass.stand)}</span></span>}
            {erlass.quelleUrl && <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">↗ geltende Fassung</a>}
            <a href={`/normtext/${erlass.pdfPfad}`} download={`${erlass.kuerzel}.pdf`} className="lc-chip no-underline hover:text-brass-700" title="Amtliches PDF herunterladen">⬇ PDF herunterladen</a>
            <span className="basis-full sm:basis-auto sm:ml-auto text-micro text-ink-500">Amtliches PDF — massgeblich ist die amtliche Fassung</span>
          </div>
        </header>
        {(() => { const wz = werkzeugeFuer(erlass.key); return wz.length > 0 ? (
          <details className="rounded-lg border border-line bg-paper-sunken/40 px-4 py-3">
            <summary className="lc-overline cursor-pointer select-none text-ink-600 hover:text-brass-700">Passende Werkzeuge <span className="text-ink-500">({wz.length})</span></summary>
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 -mb-1 sm:flex-wrap sm:overflow-visible [scrollbar-width:thin]">
              {wz.map((w) => <Link key={w.id} to={w.href} className="lc-chip shrink-0 whitespace-nowrap no-underline hover:text-brass-700 hover:border-brass-400"><span className="text-ink-500 mr-1">{w.modus === 'rechner' ? '⊞' : '▤'}</span>{w.titel}</Link>)}
            </div>
          </details>
        ) : null; })()}
        {rspr.length > 0 && (
          <details className="rounded-lg border border-line bg-paper-sunken/40 px-4 py-3">
            <summary className="lc-overline cursor-pointer select-none text-ink-600 hover:text-brass-700">Bundesgerichtsentscheide zu diesem Erlass <span className="text-ink-500">({rspr.length})</span></summary>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {rspr.slice(0, 8).map((r) => (
                <li key={r.key} className="text-body-s"><Link to={`/rechtsprechung/${r.key}`} className="no-underline hover:text-brass-700"><span className="font-medium">{r.zitierung}</span>{r.leitcharakter === 'leitentscheid' ? <span className="lc-chip ml-2 align-middle text-micro">Leitentscheid</span> : null}{r.regesteKurz ? <span className="text-ink-500"> — {r.regesteKurz}</span> : null}</Link></li>
              ))}
            </ul>
          </details>
        )}
        {/* Eingebettetes amtliches PDF (same-origin → Browser-Viewer mit nativer
            Suche/Zoom/Druck). iframe ist für Inline-PDF am zuverlässigsten; darunter
            ein sichtbarer Fallback-Link für Browser ohne PDF-Viewer. */}
        <iframe src={`/normtext/${erlass.pdfPfad}#view=FitH`} title={`${erlass.kuerzel} — amtliches PDF`}
          className="w-full rounded-lg border border-line bg-paper-sunken/30"
          style={{ height: 'min(82vh, 1100px)' }} />
        <nav className="mt-4 border-t border-line pt-5 flex flex-wrap justify-between gap-3 text-body-s" aria-label="Weitere Erlasse">
          <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">‹ Übersicht</Link>
          <a href={`/normtext/${erlass.pdfPfad}`} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">Amtliches PDF in neuem Tab öffnen ↗</a>
        </nav>
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

  // S8 (BS-Audit 23.6.2026): Doppeltitel «Advokaturgesetz — Advokaturgesetz
  // (291.100)» vermeiden. Trägt der Volltitel (ohne abschliessendes «(…)»-Suffix,
  // z. B. die SR-Nr.) denselben Wortlaut wie das Kürzel, ist der «— {titel}»-Teil
  // reine Wiederholung → weglassen. Reine Darstellung (§3); keine Datenänderung.
  const titelOhneSuffix = erlass.titel.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const titelRedundant = titelOhneSuffix.toLowerCase() === erlass.kuerzel.trim().toLowerCase();

  // N13 (BS-Audit 23.6.2026): die Reader-Overline zeigte für JEDEN kantonalen
  // Erlass stur das Einheits-Rechtsgebiet («Öffentliches Recht»). Stattdessen das
  // echte Sachgebiet aus der amtlichen Kanton-Systematik (sachgruppe→topTitel).
  // Nur wenn ein verifizierter Titel vorliegt — der neutrale Fallback («Bereich N»,
  // «Ohne Systematik-Nummer») wird weggelassen (§8, nichts Geratenes). Bund bleibt
  // beim Rechtsgebiet-Label.
  const overlineGebiet: string | null = (() => {
    if (erlass.ebene === 'bund') return GEBIET_LABEL[erlass.rechtsgebiet];
    const sys = erlass.kanton ? kantonSys[erlass.kanton] : undefined;
    if (!sys) return null;
    const { top } = sachgruppe(sys, erlass.sr);
    if (top === '~') return null;
    const name = topTitel(sys, top);
    return /^Bereich /.test(name) ? null : name;
  })();

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
      titelRedundant ? erlass.kuerzel : `${erlass.kuerzel} — ${erlass.titel}`,
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

  // Geteilte Such-Steuerung (Eingabe + Fussnoten-Schalter). Wird an ZWEI Orten
  // gerendert: in der Gliederungs-Spalte (2-Spalten-Fall, oberhalb der TOC) ODER
  // als volle Breite (kein Gliederungs-Spalt: keine Sektionen oder eingeklappt).
  const sucheEingabe = (
    <>
      <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
        placeholder="Im Gesetz suchen …" aria-label="Im Gesetz suchen"
        className="lc-input h-9 py-0 text-body-s flex-1 min-w-0" />
      <button type="button" onClick={() => setFussnotenAuf((v) => !v)} aria-pressed={fussnotenAuf}
        className={`shrink-0 text-micro ${fussnotenAuf ? 'text-brass-700' : 'text-ink-500 hover:text-brass-700'}`}
        title="Fussnoten ein-/ausblenden">{fussnotenAuf ? '✓ Fussnoten' : 'Fussnoten'}</button>
    </>
  );
  // 2-Spalten aktiv ⇒ die Suche lebt in der Gliederungs-Spalte (oberhalb der TOC),
  // NICHT als Vollbreite über dem Gesetzestext (Auftrag David).
  // 2-Spalten-Layout ist NUR ab xl aktiv (xl:grid). Darunter immer einspaltig →
  // die Suche + der Gliederungs-Zugang leben in der STICKY Vollbreiten-Leiste.
  const zweiSpalten = sektionen.length > 0 && tocOffen && istXl;

  // Gliederungs-Baum EINMAL beschreiben (genutzt in der xl-Spalte UND im
  // mobilen Drawer, §5 — kein doppelter onSprung). Beim Sprung den mobilen
  // Drawer schliessen (analog Seitenleiste: Auswahl schliesst das Overlay).
  const springeZuSektion = (id: string) => {
    const ids = pfadZu(sektionen, (s) => s.id === id) ?? [id];
    jumpLock.current = true;
    setAktivIds(ids);
    // Sprung-Ziel als MANUELL behandeln (K): in manuellOffenRef aufnehmen und aus
    // dem Auto-Set nehmen, damit der Scroll-Spy den angesprungenen Zweig nicht
    // gleich wieder zuklappt.
    for (const x of ids) { autoOffenRef.current.delete(x); manuellOffenRef.current.add(x); manuellZuRef.current.delete(x); }
    setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
    setOffen((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
    setTocAuf(false); // mobilen Drawer schliessen
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sekRefs.current.get(id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
      requestAnimationFrame(() => { jumpLock.current = false; });
    }));
  };
  const tocBaumEl = (
    <SektionBaumTOC sektionen={sektionen} aktivPfad={aktivIds} offen={tocBaum}
      onToggle={tocToggle} onSprung={springeZuSektion} />
  );

  return (
    <div className="space-y-5">
      {/* Breadcrumb (scrollt weg; die Suchleiste ist die sticky Kopfzeile) */}
      <div className="-mx-5 sm:-mx-6 px-5 sm:px-6 py-2 border-b border-line text-xs text-ink-500">
        <Link to="/gesetze" className="hover:text-brass-700">Gesetze</Link>
        <span className="mx-1.5 text-ink-300">›</span>
        {erlass.rechtsgebiet === 'international' ? 'International' : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`}
        <span className="mx-1.5 text-ink-300">›</span>
        <span className="text-ink-700 font-medium">{erlass.kuerzel}</span>
      </div>

      <header className="space-y-2.5 border-b border-line pb-5">
        <p className="lc-overline">{erlass.rechtsgebiet === 'international'
          ? (overlineGebiet ?? 'Staatsvertrag')
          : `${erlass.ebene === 'bund' ? 'Bundesgesetz' : `Kanton ${erlass.kanton}`}${overlineGebiet ? ` · ${overlineGebiet}` : ''}`}</p>
        <h1 className="text-h2 sm:text-h1 font-display font-semibold text-ink-900">
          {erlass.kuerzel}{!titelRedundant && <span className="text-ink-500 font-normal"> — {erlass.titel}</span>}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-500">
          {erlass.sr && <span>SR <span className="num">{erlass.sr}</span></span>}
          {erlass.sr && <span className="text-ink-300" aria-hidden>·</span>}
          <span><span className="num">{eintraege.length}</span> Artikel</span>
          {erlass.stand && <span className="text-ink-300" aria-hidden>·</span>}
          {erlass.stand && <span>Stand <span className="num">{formatiereDatum(erlass.stand)}</span></span>}
          {erlass.quelleUrl && <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="lc-chip no-underline hover:text-brass-700">↗ geltende Fassung</a>}
          <button type="button" onClick={herunterladen} className="lc-chip hover:text-brass-700" title="Ganzen Erlass als Textdatei herunterladen">⬇ Herunterladen</button>
          {/* Dasselbe Gesetz zusätzlich in einem zweiten Reiter öffnen (Auftrag
              David) — zum Vergleich zweier Stellen; die Reiter unterscheiden sich
              im Label über den Artikel («OR – Art. 41» / «OR – Art. 97»). */}
          <button type="button"
            onClick={() => {
              const ziel = naechsteInstanz(window.location.pathname + window.location.hash);
              merkeTab(ziel, erlass.kuerzel);
              navigate(ziel);
            }}
            className="lc-chip hover:text-brass-700" title="Diesen Erlass zusätzlich in einem neuen Reiter öffnen">⧉ In neuem Reiter</button>
          <span className="basis-full sm:basis-auto sm:ml-auto text-micro text-ink-500">Snapshot — massgeblich ist die amtliche Fassung</span>
        </div>
      </header>

      {/* Norm↔Werkzeug-Brücke (D1): passende Rechner/Vorlagen zu diesem Erlass.
          #11: standardmässig eingeklappt — öffnet nur auf Wunsch (Auftrag David). */}
      {(() => {
        const wz = werkzeugeFuer(erlass.key);
        return wz.length > 0 ? (
          <details className="rounded-lg border border-line bg-paper-sunken/40 px-4 py-3">
            <summary className="lc-overline cursor-pointer select-none text-ink-600 hover:text-brass-700">
              Passende Werkzeuge <span className="text-ink-500">({wz.length})</span>
            </summary>
            {/* Mobile: eine horizontal scrollbare Chip-Reihe (sonst stapeln sich
                viele Werkzeuge sehr hoch); ab sm normaler Umbruch. */}
            <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 -mb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mb-0 [scrollbar-width:thin]">
              {wz.map((w) => (
                <Link key={w.id} to={w.href} className="lc-chip shrink-0 whitespace-nowrap no-underline hover:text-brass-700 hover:border-brass-400">
                  <span className="text-ink-500 mr-1">{w.modus === 'rechner' ? '⊞' : '▤'}</span>{w.titel}
                </Link>
              ))}
            </div>
          </details>
        ) : null;
      })()}

      {/* Verzahnung (Norm→Entscheid): Bundesgerichtsentscheide zu diesem Erlass.
          Quelle = maschinell extrahierte Norm-Nennungen → keine geprüfte Präjudizienliste (§8).
          #11: standardmässig eingeklappt — öffnet nur auf Wunsch. */}
      {rspr.length > 0 && (
        <details className="rounded-lg border border-line bg-paper-sunken/40 px-4 py-3 mt-3">
          <summary className="lc-overline cursor-pointer select-none text-ink-600 hover:text-brass-700">
            Bundesgerichtsentscheide zu diesem Erlass <span className="text-ink-500">({rspr.length})</span>
          </summary>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {rspr.slice(0, 8).map((r) => (
              <li key={r.key} className="text-body-s">
                <Link to={`/rechtsprechung/${r.key}`} className="no-underline hover:text-brass-700">
                  <span className="font-medium">{r.zitierung}</span>
                  {r.leitcharakter === 'leitentscheid' ? <span className="lc-chip ml-2 align-middle text-micro">Leitentscheid</span> : null}
                  {r.regesteKurz ? <span className="text-ink-500"> — {r.regesteKurz}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-micro text-ink-500 mt-2">Maschinell aus den zitierten Normen zugeordnet — keine geprüfte Präjudizienliste.</p>
        </details>
      )}

      {/* Suche als Vollbreite NUR ohne 2-Spalten (keine Sektionen ODER Gliederung
          eingeklappt) — dann trägt sie auch den «☰ Gliederung»-Wiedereinblender.
          Sticky direkt unter dem 4rem-Header (der Reiter-Streifen entfiel; die
          Reiter-Übersicht lebt jetzt in der Topbar). Im 2-Spalten-Fall
          sitzt die Suche in der linken Spalte oberhalb der TOC (Auftrag David:
          nicht über dem Gesetzestext). */}
      {/* Sticky Kopfzeile UNTER dem Reiter-Streifen. Zwei Varianten (Auftrag David
          25.6.2026): ab xl (eingeklappte Spalte) die volle Suchleiste + ☰-Knopf zum
          Wiedereinblenden der Spalte; UNTER xl nur EIN kompakter Knopf, der Suche +
          Gliederung als Overlay-Drawer auf Wunsch öffnet (analog Seitenleiste) —
          so nimmt der Reader keine zweite volle Bar weg, die den Reiter-Streifen
          eng macht/abschneidet. */}
      {!zweiSpalten && (
        <div data-such-bar className="sticky z-[16] mb-4 rounded-lg bg-paper"
          style={{ top: '4rem' }}>
          {istXl ? (
            <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 shadow-sm">
              {sektionen.length > 0 && (
                <button type="button" aria-expanded={tocOffen} onClick={() => setTocOffen(true)}
                  title="Gliederung einblenden" className="shrink-0 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-micro font-medium text-ink-600 hover:text-brass-700 hover:border-brass-300 transition-colors">
                  <span aria-hidden>☰</span><span className="hidden sm:inline">Gliederung</span>
                </button>
              )}
              {sucheEingabe}
            </div>
          ) : (
            <button type="button" aria-expanded={tocAuf} onClick={() => setTocAuf((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 text-body-s font-medium text-ink-600 shadow-sm hover:text-brass-700 hover:border-brass-300 transition-colors">
              <span aria-hidden>☰</span>{sektionen.length > 0 ? 'Gliederung & Suche' : 'Im Gesetz suchen'}
            </button>
          )}
        </div>
      )}

      {/* 2-Spalten (Gliederungs-Sidebar links, Inhalt rechts) erst ab xl (1280px) —
          darunter (geteilter Bildschirm / mittlere Breiten) bekommt der Normtext die
          volle Spaltenbreite, die Gliederung sitzt als einklappbarer Block darüber
          (wie mobil). So frisst die feste 16rem-TOC-Spalte erst, wenn genug Breite da
          ist. Reine Darstellung (§3). */}
      {/* Unter xl: Suche + Gliederung als Overlay-Drawer (analog Seitenleiste),
          NUR auf Wunsch über den sticky ☰-Knopf geöffnet (Auftrag David 25.6.2026)
          — so liegt keine zweite Dauer-Bar unter dem Reiter-Streifen. Die Suche
          steht oben, darunter (falls vorhanden) der Gliederungsbaum; Sektionswahl
          schliesst den Drawer (springeZuSektion). */}
      {!istXl && tocAuf && (
        <>
          <div className="fixed inset-0 z-40 bg-ink-900/30 xl:hidden" onClick={() => setTocAuf(false)} aria-hidden />
          <div ref={tocDrawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Suche & Gliederung"
            className="fixed inset-x-0 z-50 xl:hidden bg-paper-raised border-b border-line shadow-lg max-h-[80vh] overflow-y-auto overscroll-contain"
            style={{ top: '4rem' }}>
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-paper-raised px-4 py-2.5">
              <p className="lc-overline">{sektionen.length > 0 ? 'Suche & Gliederung' : 'Im Gesetz suchen'}</p>
              <button type="button" onClick={() => setTocAuf(false)} className="text-micro text-ink-500 hover:text-brass-700">✕ schliessen</button>
            </div>
            <div className="px-4 pt-3 pb-1">{sucheEingabe}</div>
            {sektionen.length > 0 && <div className="px-3 py-2 border-t border-line mt-2">{tocBaumEl}</div>}
          </div>
        </>
      )}

      <div className={sektionen.length > 0 && tocOffen ? 'xl:grid xl:grid-cols-[16rem_minmax(0,1fr)] xl:gap-8' : ''}>
        {/* xl-Spalte (nur ab 1280px): Suche + Gliederungsbaum, sticky. Unter xl
            wird die Gliederung NICHT inline hier gerendert (sie scrollte sonst weg),
            sondern als Overlay-Drawer (oben) über den sticky ☰-Knopf. */}
        {sektionen.length > 0 && (
          <aside
            style={{ top: 'calc(4rem + 0.75rem)', maxHeight: 'calc(100vh - 4rem - 1.5rem)' }}
            className={`hidden xl:mb-0 xl:sticky xl:flex-col ${tocOffen ? 'xl:flex' : 'xl:hidden'}`}>
            {zweiSpalten && (
              <div data-such-bar className="mb-3 shrink-0">
                <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-1.5 shadow-sm">
                  {sucheEingabe}
                </div>
              </div>
            )}
            <div className="mb-2 flex items-baseline justify-between shrink-0">
              <p className="lc-overline">Gliederung</p>
              <button type="button" onClick={() => setTocOffen((v) => !v)} className="text-micro text-ink-500 hover:text-brass-700" title="Gliederung ein-/ausklappen">{tocOffen ? '‹ einklappen' : 'ausklappen ›'}</button>
            </div>
            <div data-toc className="xl:flex-1 xl:min-h-0 xl:overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
              {tocBaumEl}
            </div>
          </aside>
        )}

        {/* Lesespalte: ohne 2-Spalten-Sidebar zentriert + auf ~56rem begrenzt.
            Im 2-Spalten-Fall greift die Begrenzung erst ab xl über das Grid; darunter
            (lg–xl, geteilter Bildschirm) bleibt der Text zentriert + auf eine
            komfortable Lesebreite begrenzt, statt die volle Inhaltsbreite zu füllen. */}
        <div className={`group/lese ${sektionen.length > 0 && tocOffen ? 'mx-auto w-full max-w-[52rem] xl:mx-0 xl:max-w-none' : 'mx-auto w-full max-w-[56rem]'}`}>
          {treffer ? (
            <div className="space-y-4">
              <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{suche.trim()}»</p>
              {treffer.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} fussnotenAuf={fussnotenAuf} intern={internRefs} marg={struktur?.[e.artikel]?.marginalie} imTreffer onSpringe={springeZuArtikel} />)}
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
  // Akkordeon: Standard zu. Aufgeklappt wird durch Klick (Chevron/Sprung) ODER
  // automatisch durch den Scroll-Spy (K): der aktive Zweig klappt beim Scrollen
  // auf und beim Verlassen wieder zu. Manuell (Klick) geöffnete Zweige bleiben
  // offen (autoOffenRef im Reader steuert das). Markierung über `aktivPfad`.
  const zeile = (s: Sektion, tiefe: number): ReactNode => {
    const auf = offen[s.id] ?? false;
    const { pre, rest } = romanFrei(s.label);
    const aktiv = aktivPfad.includes(s.id);
    const hatKinder = s.kinder.length > 0;
    return (
      <li key={s.id}>
        <div className="flex items-start" style={{ paddingLeft: `${tiefe * 0.6}rem` }}>
          {hatKinder
            ? <button type="button" onClick={() => onToggle(s.id)} aria-label={auf ? 'Einklappen' : 'Aufklappen'} className="shrink-0 text-ink-300 hover:text-ink-600 px-1 mt-0.5 text-micro w-4">{auf ? '▾' : '▸'}</button>
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
