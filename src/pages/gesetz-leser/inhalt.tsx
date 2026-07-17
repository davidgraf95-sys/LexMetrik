import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { naechsteInstanz, merkeTab, aktualisiereTabArtikel, tabSchluessel } from '../../lib/tabs';
import { merkeAnker, bezugslinie } from './scrollAnker';
import { aktiverArtikel } from '../../lib/normtext/aktuellerArtikel';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import { usePaneKontext } from '../../components/layout/PaneKontext';
import { useMeldeInhaltsKopf } from '../../components/layout/InhaltsKopfKontext';
import type { InternRefs } from '../../components/NormText';
import { labelMitBereich, randtitelKnoten } from '../../lib/normtext/darstellung';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, ladeStruktur, ladeErlassKopf, ladeKantonSystematik, ladeCurrency,
  baueGliederungsbaum, type Sektion, type StrukturMap, type ErlassKopf, type CurrencyMap,
} from '../../lib/normtext/browse';
import { sachgruppe, topTitel, type KantonSystematik } from '../../lib/normtext/systematik';
import { linienProfil } from './linienAufbau';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { KontextPanel } from '../../components/kontext/KontextPanel';
import type { BrowseErlass, BrowseManifest } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { formatiereDatum, passtAufSuche, pfadZu, kopfOverline, grundartMeta } from './helpers';
import { ArtikelLeser, SektionKopf, SektionBaumTOC, ErlassKopfBlock, ErlassLeserKopf } from './parts';
import { LeserAnsichtMenu } from './LeserAnsichtMenu';
import { beiLeerlauf } from '../../lib/leerlauf';
import { ladeLeitfallShard, normArtikelToken, type LeitfallShard } from '../../lib/rechtsprechung/norm-index';
import { ladeRevisionShard, revisionFuerToken, type RevisionShard } from '../../lib/verzahnung/artikel-revisionen';
import {
  paneRoot, istAnhangToken, findeArt,
  berechneSekPos, berechneSektionMeta,
} from './berechnungen';
import { AmtlichesPdf } from './parts/AmtlichesPdf';
import { GesetzFehlSeite } from './FehlSeite';

// ═══ ABSCHNITT · Reine Rechenlogik ausgelagert (QS-TOK/P5, §6 Ziff. 6) ═══════
// paneRoot/istAnhangToken/findeArt (Pane-Scoping, referenzstabil, KEIN React
// Compiler → Modulfunktionen), sekPos/sektionMeta/sekLabelById-Ableitungen und
// der Download-Text leben jetzt in ./berechnungen.ts. Ab hier NUR die
// zustandsbehaftete Reader-Komponente (Hooks, Effekte, Rendering).
export function GesetzLeserInhalt({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;
  const navigate = useNavigate();
  const location = useLocation();
  const [erlass, setErlass] = useState<BrowseErlass | null>(null);
  const [eintraege, setEintraege] = useState<NormSnapshot[] | null>(null);
  const [struktur, setStruktur] = useState<StrukturMap | null>(null);
  const [kopf, setKopf] = useState<ErlassKopf | null>(null);
  const [manifest, setManifest] = useState<BrowseManifest | null>(null);
  // P1-d: Currency-Sidecar (geltend-geprüft-Datum + angekündigte Fassung je Erlass-Key).
  const [currency, setCurrency] = useState<CurrencyMap | null>(null);
  // Leitfall-Shard des Erlasses: GENAU EIN idle-Fetch auf Reader-Ebene (V1a-
  // Endzustand nach CI-Befund W2·7-VZUI) — die ~1000 LeitfallZeilen grosser
  // Erlasse sind reine Renderer und erhalten ihre Treffer als Prop. Ergebnis an
  // den Erlass-Key gebunden (Pane-/Erlass-Wechsel liefert nie fremde Chips).
  const [leitfallShard, setLeitfallShard] = useState<{ key: string; shard: LeitfallShard | null } | null>(null);
  // Revisions-Shard des Erlasses (V1c): Artikel-Token → Datum der letzten Text-
  // änderung + AS-Fundstelle. EIN idle-Fetch auf Reader-Ebene wie der Leitfall-
  // Shard; klassifiziert je Leitfall-Kante, ob sich die Norm SEIT dem Entscheid
  // revidiert hat (Normrevisions-Ehrlichkeit, §V1c).
  const [revisionShard, setRevisionShard] = useState<{ key: string; shard: RevisionShard | null } | null>(null);
  const [fehler, setFehler] = useState(false);
  // W2·10-UI-NAV/N0d·O3: kurze Bestätigung nach «In neuem Reiter» — der Reader
  // wird bei der ?r-Instanz-Navigation NICHT neu gemountet (gleicher key=schluessel),
  // darum überlebt dieser Zustand den Soft-Nav und weist zum Reiter-Tracker (☰).
  const [reiterToast, setReiterToast] = useState(false);
  const reiterToastTimer = useRef<number | null>(null);
  useEffect(() => () => { if (reiterToastTimer.current) window.clearTimeout(reiterToastTimer.current); }, []);
  const [suche, setSuche] = useState('');
  // Rank 9 (QS-PERF, §15/3): entprellter Suchwert. Das Eingabefeld bleibt sofort
  // responsiv (`suche`), aber die TEUREN Ableitungen — Treffer-Filter über ~1000
  // Artikel + IntersectionObserver-Neuaufbau — laufen erst ~200 ms nach dem letzten
  // Tastendruck über `sucheDebounced` statt bei JEDEM Zeichen (Jank auf schwacher
  // CPU). LEEREN wirkt SOFORT (kein Lag beim Suche-Verlassen / Treffer→Artikel-Sprung,
  // `springeZuArtikel` setzt setSuche('')). Reine Timing-Optimierung (§6.4): ändert
  // nur WANN gefiltert wird, nie WAS (dieselbe passtAufSuche-Menge, dieselbe Ansicht).
  const [sucheDebounced, setSucheDebounced] = useState('');
  useEffect(() => {
    // Leeren: 0 ms (praktisch sofort, ein Tick — kein Lag beim Suche-Verlassen /
    // Treffer→Artikel-Sprung). Tippen: 200 ms entprellt. Beide über setTimeout,
    // damit kein synchrones set-state-in-effect entsteht (Muster wie UniversalSuche).
    const id = window.setTimeout(() => setSucheDebounced(suche), suche === '' ? 0 : 200);
    return () => window.clearTimeout(id);
  }, [suche]);
  // Scrollposition VOR der Suche merken → beim Leeren der Suche dorthin zurück,
  // statt an den Anfang zu springen (Auftrag David). Ein Treffer-Klick nullt das
  // (springt stattdessen zum Artikel).
  const scrollVorSuche = useRef<number | null>(null);
  const sucheVorher = useRef('');
  // Auf-/Zu-Zustand des FLIESSTEXTS (Sektionen im Lesefluss). Default OFFEN
  // (renderSektion mit defOpen=true) — Fedlex-treu der ganze Erlass lesbar; jede
  // Stufe ist per SektionKopf-Toggle einzeln einklappbar. Eigener State, vom TOC
  // entkoppelt (D, Auftrag David 26.6.2026).
  useEffect(() => {
    const key = erlass?.key;
    if (!key) return;
    let lebt = true;
    const abbrechen = beiLeerlauf(() => {
      void ladeLeitfallShard(key).then((shard) => { if (lebt) setLeitfallShard({ key, shard }); });
      void ladeRevisionShard(key).then((shard) => { if (lebt) setRevisionShard({ key, shard }); });
    });
    return () => { lebt = false; abbrechen(); };
  }, [erlass?.key]);
  // Artikel-Token → Leitfälle des AKTUELLEN Erlasses (sonst undefined = keine Zeile).
  const leitfaelleFuer = useCallback((artikel: string) => (
    erlass && leitfallShard?.key === erlass.key
      ? leitfallShard.shard?.proArtikel[normArtikelToken(artikel)]
      : undefined
  ), [erlass, leitfallShard]);
  // Revision r(a) des AKTUELLEN Erlass-Artikels (§V1c): undefined = Shard
  // fehlt/lädt/Erlass nicht abgedeckt (⇒ 'unbekannt'); null = Urfassung (⇒ 'gleich');
  // Objekt = letzte Textänderung. Stabile Referenz aus dem Shard → memo-freundlich.
  const revisionFuer = useCallback((artikel: string) => (
    erlass && revisionShard?.key === erlass.key
      ? revisionFuerToken(revisionShard.shard, artikel)
      : undefined
  ), [erlass, revisionShard]);

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
  // Rank 4 (QS-PERF, §15/4): useCallback ([] — liest nur setTocBaum + stabile Refs),
  // sonst hätte onToggle bei jedem Parent-Render neue Identität und die React.memo-
  // Wrapper von SektionBaumTOC liefe bei jeder Scroll-Spy-Aktualisierung leer.
  const tocToggle = useCallback((id: string) => {
    setTocBaum((o) => {
      const offenJetzt = !o[id];
      autoOffenRef.current.delete(id);
      if (offenJetzt) { manuellOffenRef.current.add(id); manuellZuRef.current.delete(id); }
      else { manuellOffenRef.current.delete(id); manuellZuRef.current.add(id); }
      return { ...o, [id]: offenJetzt };
    });
  }, []);
  const [aktivIds, setAktivIds] = useState<string[]>([]); // Sektions-IDs (TOC-Markierung, eindeutig)
  const [tocAuf, setTocAuf] = useState(false); // unter lg: Gliederungs-Drawer offen?
  const [tocOffen, setTocOffen] = useState(true); // ab lg: Gliederungsspalte ein-/ausklappen
  // 2-Spalten-Erkennung. R2 (Auftrag David 30.6.2026): Schwelle von 1280px auf
  // 1024px (Tailwind lg) gesenkt → die linke Gliederungsspalte erscheint schon auf
  // kleineren Laptops «grundsätzlich», nicht erst ab 1280px. 1024px deckt sich mit
  // der Schwelle der persistenten App-Seitenleiste (lg) UND mit PANE_BREIT_PX (1024)
  // des Pane-Pfads → unter lg sind sowohl Seitenleiste als auch Gliederung Drawer
  // (kohärent, «nur bei echt-zu-klein in den Drawer»). Die Lesespalte bleibt nutzbar:
  // Inhaltsbreite ist auf max-w-content (70rem) gedeckelt, abzüglich 16rem TOC + gap-8
  // läuft der Fliesstext (max-w-reading 40rem) nie unter ~26rem. SSR-Default false =
  // mobil-Layout (byte-gleich). Ohne diese Erkennung behandelte der Code «tocOffen»
  // fälschlich als 2-Spalten-aktiv → der Gliederungs-Zugang verschwand beim Scrollen.
  // §15.2 «Client-Initialstate auf den Server-Zustand pinnen»: den WAHREN
  // Viewport-Stand schon im ERSTEN Client-Render lesen (lazy Initializer),
  // nicht erst per useEffect nach dem Mount. Sonst rendert der Client (der per
  // createRoot frisch mountet, kein hydrateRoot — §15.5) zuerst mit `false`
  // = 1-Spalten-Layout und flippt danach auf `true` = 2-Spalten-Grid
  // (`grid-cols-[16rem_…]`) → die gesamte Lesespalte reflowt = grosser Layout-
  // Shift. Unter CPU-Last (CI: 6 parallele Tore-Jobs) verlor dieser useEffect
  // das Rennen gegen den Snapshot-Fetch: die Artikel rendern 1-spaltig, DANN
  // flippt der Effekt → byte-identischer 0,49-CLS (verweis-u «Plural-Sprung»).
  // SSR/Prerender: `window` ist undefiniert → `false` (Mobil-Layout,
  // renderToString byte-gleich; die Erlass-Detailseiten kommen ohnehin aus dem
  // separaten String-Builder `erlassVolltextHtml`, nicht aus dieser Komponente).
  const [istXlVp, setIstXlVp] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const upd = () => setIstXlVp(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);
  const { imPane, rolle, wurzel, overlayWurzel } = usePaneKontext();
  // Split-View E (Container-responsiv): ein Pane wählt sein Layout nach SEINER
  // Breite, nicht nach dem Viewport. `istXl` (treibt 2-Spalten-Gliederung + Drawer-
  // vs-Sidebar) kommt im Pane aus einem ResizeObserver auf der Pane-Wurzel (Schwelle
  // PANE_BREIT_PX = 1024), sonst aus matchMedia (1024px, R2) — beide Pfade ab 1024.
  // Reines @container-CSS reicht hier NICHT: istXl steuert bedingtes Rendering
  // (Vollbar/Kompaktknopf, Existenz des Drawers), das CSS nicht schalten kann.
  const PANE_BREIT_PX = 1024;
  const [istBreit, setIstBreit] = useState(false);
  useEffect(() => {
    // Kein Reset bei !imPane nötig: istXl ignoriert istBreit dann ohnehin.
    if (!imPane || !wurzel?.current || typeof ResizeObserver === 'undefined') return;
    const el = wurzel.current;
    const ro = new ResizeObserver((eintraege) => {
      // border-box (inkl. Scrollbar) → die Scrollbarbreite verschiebt den
      // Schwellenvergleich nicht (kein Flackern an der 1024px-Grenze).
      for (const e of eintraege) {
        const w = e.borderBoxSize?.[0]?.inlineSize ?? e.contentRect.width;
        setIstBreit(w >= PANE_BREIT_PX);
      }
    });
    ro.observe(el, { box: 'border-box' });
    return () => ro.disconnect();
  }, [imPane, wurzel]);
  const istXl = imPane ? istBreit : istXlVp;
  // A3: aktuell gelesener Artikel (live) für den Einzelansicht-Kopf. Nur in der
  // Einzelansicht (!imPane) gepflegt; im Split-View trägt der PaneKopf den Titel.
  const meldeInhaltsKopf = useMeldeInhaltsKopf();
  const [aktArtikel, setAktArtikel] = useState<string | null>(null);
  // B-2.5: In einem Pane scopen wir DOM-Queries + Scroll auf die Pane-Wurzel
  // (sonst kollidieren doppelte `art-`-IDs / trifft der Scroll das falsche Pane).
  // NUR ein SEKUNDÄRES Pane unterdrückt globale URL-/Reiter-Writes — das primäre
  // Pane IST die URL und pflegt sie wie heute. Ausserhalb eines Panes alles wie bisher.
  const istSekundaer = rolle === 'sekundaer';
  // W2·5d G2b (Fussnoten-Unifizierung): der frühere `fussnotenAuf`-React-Schalter
  // (Such-Leiste, Default AUS) entfällt — die Fussnoten-Bedienung ist jetzt EINE
  // (der data-fussnoten-Toggle der Options-Leiste, Default AN). Marker + Apparat
  // liegen IMMER im DOM (R9/§8, Ctrl+F/Print/Screenreader); «AUS» dämpft rein per
  // CSS (index.css), versteckt nie. Kein React-State-Zweig mehr im Artikel-Baum.
  // W2·5d G2a: Die Gruppierungs-/Gliederungslinien werden nicht mehr per
  // component-local useState geschaltet (das rendert die Artikelliste neu, §15),
  // sondern über den globalen data-linien-Toggle der Options-Leiste
  // (leserOptionen.tsx) rein per CSS. renderSektion emittiert Guide + Einzug
  // darum IMMER (wie der frühere Default AN → Markup byte-gleich); `[data-linien
  // ="aus"]` blendet Guide + Einzug per CSS aus (index.css, gescopt auf .lc-leser).
  // N13: amtliche Kanton-Systematik (lazy) — liefert das echte Sachgebiet eines
  // kantonalen Erlasses für die Reader-Overline (statt Einheits-«Öffentliches Recht»).
  const [kantonSys, setKantonSys] = useState<Record<string, KantonSystematik>>({});
  // BGer-Entscheide/Materialien/Werkzeuge zu diesem Erlass: das einheitliche
  // KontextPanel (B3) lädt + zeigt sie selbst (Single Source, §5) — am Leseende.
  const sekRefs = useRef<Map<string, HTMLElement>>(new Map());
  // Mobiler Suche-&-Gliederung-Drawer (role=dialog): Esc-Schliessen, Fokus
  // setzen + fangen, Fokus-Rückgabe an den Auslöser über den geteilten Hook (§5).
  const tocDrawerRef = useRef<HTMLDivElement | null>(null);
  useDialogFokus(!istXl && tocAuf, tocDrawerRef, () => setTocAuf(false));
  // Live-Label des aktiven Reiters beim Scrollen entprellen (Trailing-Debounce):
  // sonst ein localStorage-Write + globales TABS_EVENT pro überschrittener
  // Artikelgrenze (Scroll-Jank auf langen Erlassen). Reine Timing-Optimierung (§6.4).
  const tabArtikelTimer = useRef<number | null>(null);
  // Entprellt die Kopf-Artikel-Meldung: beim schnellen Durchscrollen sonst ein
  // setKopfDaten (Shell) pro Artikelgrenze → unnötige Re-Renders der übrigen Panes.
  const aktArtikelTimer = useRef<number | null>(null);
  // E7/A33-F3 (RC2): das automatische Auf-/Zuklappen des aktiven Zweigs (K) wird
  // entprellt — analog aktArtikelTimer/tabArtikelTimer. Beim schnellen Durchscrollen
  // sonst eine dichte Reflow-Folge des Gliederungsbaums (Δ~100 px pro Zweigwechsel),
  // die den TOC in Eigenbewegung versetzt («Gliederung springt umher», David 16.7.).
  const tocBaumTimer = useRef<number | null>(null);
  // E7/A33-F2 (RC1b): Zeitstempel der letzten NUTZER-Bedienung des TOC (wheel/
  // pointerdown/touchstart). Solange der Nutzer die Gliederung aktiv durchblättert,
  // pausiert das automatische Nachführen (Mitscroll-Effekt) — sonst reisst eine
  // verspätete Rückhol-Bewegung das manuelle Erkunden zurück (Symptom 3). Kein
  // `scroll`-Event als Auslöser: der eigene programmatische Scroll würde den Guard
  // sonst selbst armieren.
  const tocTouchRef = useRef(0);

  useEffect(() => {
    let lebt = true;
    void ladeBrowseManifest().then((m) => { if (lebt) setManifest(m); });
    void ladeCurrency().then((c) => { if (lebt) setCurrency(c); });
    void ladeStruktur(ebene, schluessel).then((s) => { if (lebt) setStruktur(s); });
    void ladeErlassKopf(ebene, schluessel).then((k) => { if (lebt) setKopf(k); });
    // N13: Systematik-Bäume nur für die Kanton-Lesesicht laden; fehlen sie, bleibt
    // die Overline ohne Sachgebiet (§8 — nichts Erfundenes).
    if (ebene === 'kanton') void ladeKantonSystematik().then((s) => { if (lebt) setKantonSys(s); });
    void ladeErlass(schluessel).then(async (e) => {
      if (!lebt) return;
      if (!e) {
        // W2·10-UI-NAV/N0b: Key case-insensitiv gegen das Register auflösen und auf
        // die kanonische URL umleiten (/gesetze/bund/or → /gesetze/bund/OR). Nur bei
        // EINDEUTIGEM Case-Treffer (kein Rate-Sprung); sonst ehrliche Fehlseite.
        const m = await ladeBrowseManifest();
        if (!lebt) return;
        const roh = schluessel.toLowerCase();
        const kandidaten = m?.erlasse.filter((x) => x.key.toLowerCase() === roh) ?? [];
        if (kandidaten.length === 1) {
          const ziel = kandidaten[0];
          navigate(`/gesetze/${ziel.ebene}/${encodeURIComponent(ziel.key)}`, { replace: true });
          return;
        }
        setFehler(true);
        return;
      }
      // pdf-embed: kein Snapshot-JSON — Erlass setzen, der Reader rendert das
      // eingebettete amtliche PDF (eintraege bleibt null).
      if (e.status === 'pdf-embed') { setErlass(e); return; }
      // LIVE_VERWEIS (⑧, W2·5d G3a): kein In-App-Volltext gehostet — Erlass setzen,
      // der Reader zeigt eine ehrliche Verweiskarte (amtlicher Live-Link + Stand,
      // §8) statt der «nicht verfügbar»-Fehlerseite. eintraege bleibt null.
      if (e.status === 'nur-live-link') { setErlass(e); return; }
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
    if (istSekundaer) return; // sekundäres Pane treibt den Browser-Tab-Titel nicht (B-2.5)
    const kurz = erlass.titel.match(/\(([^)]+)\)\s*$/)?.[1] ?? erlass.titel;
    document.title = `${erlass.kuerzel} (${kurz}) — LexMetrik`;
  }, [erlass, istSekundaer]);

  // A/A2/A3/F: Kopf melden — die Meldung selbst steht weiter unten (nach `linien`/
  // `fussnotenAnzahl`, die der A26-Ansicht-Slot braucht; TDZ). Hier nur das Aufräumen.
  // Beim Verlassen den Kopf räumen (Shell setzt bei Routenwechsel ohnehin zurück).
  useEffect(() => () => meldeInhaltsKopf(null), [meldeInhaltsKopf]);

  // ═══ ABSCHNITT · Abgeleitete Werte (Gliederungsbaum, Linien-Profil, Sektions-
  // Positionen/-Meta/-Labels, Randtitel) — useMemo, Rechenkerne in ./berechnungen.ts ═══
  const { sektionen, ohneGliederung } = useMemo(
    () => (eintraege ? baueGliederungsbaum(eintraege, struktur) : { sektionen: [], ohneGliederung: [] }),
    [eintraege, struktur],
  );

  // W2·5d U-LINIEN (A8): das Linien-Regelwerk «wann welche Linie» leitet der Reader
  // aus dem TATSÄCHLICHEN Aufbau des Erlasses ab (Struktur-Sidecar: Gliederungstiefe
  // + Artikel-Dichte je Ebene), NICHT mehr aus der grundart-Schublade (der frühere
  // K11-Default «nur KODIFIKATION»). `guideEbene` sagt renderSektion, welche Sektions-
  // tiefe den EINEN vertikalen Guide trägt; `autoGuide` steuert den Auto-Default
  // (data-guide-auto am .lc-leser → index.css). Reine Darstellung (§3, SSoT
  // linienAufbau.ts, im Tor `check:linien-kanon` korpusweit gegated).
  const linien = useMemo(() => linienProfil(struktur), [struktur]);

  // V2·K-2: Gesamtzahl der Fussnoten aus dem Struktur-Sidecar (Kopf-Signal + Zähler
  // am Fussnoten-Chip). null = Sidecar noch nicht geladen ⇒ der Chip erscheint erst
  // danach (kein Zahl-Nachwachsen im Kopf → CLS-schonend). EINMAL je Sidecar berechnet.
  const fussnotenAnzahl = useMemo<number | null>(() => {
    if (!struktur) return null;
    let n = 0;
    for (const v of Object.values(struktur)) n += v?.fussnoten?.length ?? 0;
    return n;
  }, [struktur]);

  // A/A2/A3/F + A26: Kopf melden (Breadcrumb Gesetze › Ebene › Kürzel · Stand ·
  // aktueller Artikel · «Ansicht»-Dropdown). Wird vom NÄCHSTEN Provider gefangen:
  // Einzelansicht → Inhalts-Kopf (Shell); Split-View → der jeweilige PaneKopf.
  // Live-Artikel kommt aus dem IntersectionObserver.
  // A26 (David 11.7.2026): NUR die Einzelansicht (!imPane) trägt das «Ansicht»-
  // Dropdown im immer sichtbaren Inhalts-Kopf mit — im Split-View bleibt es (ohne
  // PaneKopf-Umbau/Stacking-Risiko) im Erlass-Kopf. `eintraege` (Volltext-Snapshot)
  // grenzt pdf-embed/nur-live-link aus (dort wären die Optionen wirkungslos, §13 F4).
  useEffect(() => {
    if (!erlass) return;
    const ebeneLabel = erlass.rechtsgebiet === 'international'
      ? 'International'
      : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`;
    // Ebene-Segment klickbar → gefilterte Gesetzes-Übersicht (?ebene=/?kt=).
    const ebeneTo = erlass.rechtsgebiet === 'international'
      ? '/gesetze?ebene=international'
      : erlass.ebene === 'bund' ? '/gesetze'
        : `/gesetze?ebene=kanton&kt=${encodeURIComponent(erlass.kanton ?? '')}`;
    meldeInhaltsKopf({
      breadcrumb: [{ label: 'Gesetze', to: '/gesetze' }, { label: ebeneLabel, to: ebeneTo }, { label: erlass.kuerzel }],
      stand: erlass.stand ? formatiereDatum(erlass.stand) : null,
      // Hinter dem laufenden Artikel die Gesetzesabkürzung (z. B. «Art. 7 OR»).
      artikel: aktArtikel ? `${aktArtikel} ${erlass.kuerzel}` : null,
      ansichtSlot: !imPane && eintraege
        ? <LeserAnsichtMenu zeigeLinien={linien.guideEbene !== null} linienAutoAn={linien.autoGuide} fussnotenAnzahl={fussnotenAnzahl} />
        : undefined,
    });
  }, [erlass, aktArtikel, meldeInhaltsKopf, imPane, eintraege, linien, fussnotenAnzahl]);

  // Dokument-Position (Index des ersten enthaltenen Artikels) je Sektion — EINMAL
  // bottom-up berechnet, damit renderSektion die Kinder + direkten Artikel eines
  // Knotens in Dokument-Reihenfolge mischen kann, ohne pro Scroll-Render erneut den
  // Teilbaum zu durchlaufen (6b: Knoten tragen seit der Randtitel-Promotion oft
  // beides). Reine Darstellung (§3).
  const sekPos = useMemo(() => berechneSekPos(sektionen, eintraege), [sektionen, eintraege]);

  // Dokument-Position je Artikel-Token (für den Artikel-Bereich «Art. 1–10» in den
  // Sektionsüberschriften).
  const artIndex = useMemo(() => {
    const map = new Map<string, number>();
    (eintraege ?? []).forEach((e, i) => map.set(e.artikel, i));
    return map;
  }, [eintraege]);

  // Rank 4 (QS-PERF, §6.4): Sektions-Bereichslabel («Art. 1–10») + Artikelzahl
  // EINMAL bottom-up vorberechnen — statt 2× O(Subtree) je Sektion je Scroll-Render
  // (bisher rief renderSektion sekBereich(s) UND sammleArtikel(s).length je Knoten,
  // jeweils den Teilbaum sammelnd). Deps [sektionen, artIndex] → nur bei echtem
  // Gliederungs-/Index-Wechsel neu. Die Label-Logik ist byte-identisch zur früheren
  // sekBereich/sammleArtikel (golden/struktur-konsistenz grün). Reine Darstellung (§3).
  const sektionMeta = useMemo(() => berechneSektionMeta(sektionen, artIndex), [sektionen, artIndex]);

  // M13: Token → korrektes Anzeige-Label («Art. 3», «Art. 31–32») für den
  // Scroll-Spy-/Reiter-Kopf. Schlusstitel-Token («disp_u1_art_3») lassen sich
  // NICHT heuristisch aus dem Token ableiten — hier den echten artikelLabel des
  // Eintrags nehmen (Haupttext byte-gleich: dort ist es ohnehin «Art. <token>»).
  const artLabelByToken = useMemo(() => {
    const map = new Map<string, string>();
    (eintraege ?? []).forEach((e) => map.set(e.artikel, labelMitBereich(e.artikelLabel, e.artikel)));
    return map;
  }, [eintraege]);

  // Ueberschrift je Artikel im FLIESSTEXT: nur noch die artikel-EIGENE
  // Sachueberschrift (das Randtitel-Blatt). Die uebergeordneten, von mehreren
  // Artikeln geteilten Randtitel-Gruppierungen (A. ... -> II. ...) sind seit 6b
  // eigene, einklappbare Gliederungs-Knoten (baueGliederungsbaum) und erscheinen
  // als Sektions-Ueberschriften -- sie hier zusaetzlich je Artikel zu wiederholen,
  // waere die vom Auftrag gewarnte Doppel-Darstellung. Hat der Artikel keine eigene
  // Sachueberschrift (blatt = null, z. B. aufgehoben), faellt ArtikelLeser auf
  // e.titel zurueck. Form wie die Such-/Volltextsicht erwartet ({ teile, ab }); das
  // Blatt wird ueber margStufeStil(_, istBlatt=true) prominent gesetzt. Reine
  // Darstellung (Sektions-Knoten zur Laufzeit abgeleitet, Sidecars unberuehrt).
  const margAnzeige = useMemo(() => {
    const map = new Map<string, { teile: string[]; ab: number }>();
    for (const e of eintraege ?? []) {
      const { blatt } = randtitelKnoten(struktur?.[e.artikel]?.marginalie ?? []);
      map.set(e.artikel, { teile: blatt ? [blatt] : [], ab: 0 });
    }
    return map;
  }, [eintraege, struktur]);

  // Interner Artikel-Sprung (Querverweise im Wortlaut): Vorfahren öffnen, scrollen,
  // Permalink setzen — derselbe Mechanismus wie der Hash-Sprung.
  // ═══ ABSCHNITT · Navigation & Sprünge (Artikel/Sektion, Hash, Permalink, Scroll-Spy) ═══
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
      // F3: einen noch schwebenden Auto-Akkordeon-Timer verwerfen — der Klick-Sprung
      // setzt den Zielpfad sofort und autoritativ; ein verspäteter Auto-Update dürfte
      // ihn nicht überschreiben.
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
      setAktivIds(ids);
      setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((id) => [id, true])) }));
      jumpLock.current = true;
    }
    if (typeof window === 'undefined') return;
    // ?search (Instanz-Diskriminator ?r) erhalten, sonst verliert ein Mehrfach-
    // Reiter seine Identität. Aktiven Reiter auf diesen Artikel melden → Live-
    // Label «Kürzel – Art. X» bei Mehrfach-Instanz (Auftrag David).
    // Sekundäres Pane: NIE die Haupt-URL/-Reiter überschreiben (es ist nicht die
    // adressierte Seite). Primär/1-Pane: wie heute URL + Reiter-Live-Label pflegen.
    if (!istSekundaer) {
      const ziel = `${basisPfad}${window.location.search}#art-${token}`;
      window.history.replaceState(null, '', ziel);
      aktualisiereTabArtikel(ziel);
    }
    // Erst nach dem Aufklapp-Render scrollen (behavior:auto wie der Hash-Sprung);
    // grosse Sektionen wachsen beim Aufklappen → nach Settle ein Korrektur-Scroll.
    const scrolle = () => {
      const el = findeArt(paneRoot(imPane, wurzel), token);
      if (!el) return;
      // R1: an den OBEREN Lese-Rand sprungen (block:'start' + nt-anker-scroll-margin
      // ≈5rem) statt zentrieren — deckt sich mit der oben angesetzten Scroll-Spy-
      // Bezugslinie, sonst markierte der Spy nach dem Sprung den Vorgänger-Artikel.
      el.scrollIntoView({ block: 'start', behavior: 'auto' });
      el.classList.add('lc-ziel-blink');
      window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
    };
    window.requestAnimationFrame(() => window.setTimeout(() => {
      scrolle();
      window.setTimeout(() => { scrolle(); jumpLock.current = false; }, 400);
    }, 110));
  }, [sektionen, basisPfad, istSekundaer, imPane, wurzel]);

  // Sprung aus dem Gliederungs-Baum (TOC): Pfad öffnen, markieren, scrollen. Beim
  // Sprung den mobilen Drawer schliessen (analog Seitenleiste). Rank 4 (QS-PERF,
  // §15/4): useCallback [sektionen] — nur pfadZu liest sektionen, alle Setter/Refs
  // stabil → SektionBaumTOC (React.memo) re-rendert nur bei aktivPfad-/offen-Wechsel.
  // Muss ÜBER dem early-return (`!erlass || !eintraege`) stehen, sonst wäre der Hook
  // bedingt (Rules of Hooks) — das war der in Batch 1 zurückgestellte Reorder.
  const springeZuSektion = useCallback((id: string) => {
    const ids = pfadZu(sektionen, (s) => s.id === id) ?? [id];
    jumpLock.current = true;
    // F3: schwebenden Auto-Akkordeon-Timer verwerfen (Klick-Sprung ist autoritativ).
    if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
    // Sprung-Ziel als MANUELL behandeln (K): in manuellOffenRef aufnehmen und aus
    // dem Auto-Set nehmen, damit der Scroll-Spy den angesprungenen Zweig nicht
    // gleich wieder zuklappt.
    for (const x of ids) { autoOffenRef.current.delete(x); manuellOffenRef.current.add(x); manuellZuRef.current.delete(x); }
    // §15.2: der Klick öffnet den TOC-Zweig — diese Höhenänderung SYNCHRON im
    // Klick-Task committen (flushSync), damit der Layout-Shift des einwachsenden
    // Gliederungs-Zweigs dem Input zugerechnet wird (hadRecentInput ⇒ CLS-frei).
    // Ohne flushSync verzögert React unter CPU-Last (CI: 6 parallele Tore-Jobs)
    // den Commit über das 500-ms-Input-Fenster hinaus → der Shift zählt als
    // unerwartet (leser-kopf-a9 «Breadcrumb-Fluss» Mikro-CLS).
    flushSync(() => {
      setAktivIds(ids);
      setTocBaum((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
      setOffen((o) => ({ ...o, ...Object.fromEntries(ids.map((x) => [x, true])) }));
      setTocAuf(false); // mobilen Drawer schliessen
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sekRefs.current.get(id)?.scrollIntoView({ block: 'start', behavior: 'auto' });
      // §15.2: den Scroll-Spy bis NACH dem Einschwingen des programmatischen Scrolls
      // gesperrt halten (jumpLock). Sonst feuert der IntersectionObserver, sobald der
      // Sprung-Scroll einläuft, und klappt den aktiven TOC-Zweig auf/zu — eine
      // Höhenänderung im Sticky-Gliederungsbaum, die (nicht input-nah) als
      // unerwarteter CLS zählt. Unter CPU-Last läuft der Scroll spät ein, darum ein
      // Zeit- statt rAF-Fenster (wie springeZuArtikel); der Spy nimmt die Endposition
      // danach normal auf. Reine Timing-Steuerung (kein setState) → kein Re-Render.
      window.setTimeout(() => { jumpLock.current = false; }, 500);
    }));
  }, [sektionen]);

  // Wechsel zwischen zwei Instanzen DESSELBEN Gesetzes (?r) bzw. ein Tab-Klick mit
  // #art-Anker remountet den Reader nicht (gleicher pathname) — darum bei jeder
  // Navigation mit Artikel-Anker gezielt dorthin springen (Auftrag David: Klick
  // auf den Reiter führt zum gemerkten Artikel der Instanz).
  const letzteNavKey = useRef<string | null>(null);
  useEffect(() => {
    if (!sektionen.length || typeof window === 'undefined') return;
    if (istSekundaer) return; // sekundäres Pane: location.key ist fix («default»), kein Instanz-Wechsel
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
  }, [location.key, location.hash, sektionen, springeZuArtikel, istSekundaer]);

  // Suche aktivieren → an den Anfang scrollen; Suche schliessen/leeren → an die
  // Scrollposition VOR der Suche zurück (Auftrag David). Grund fürs Hoch-Scrollen
  // beim Aktivieren (Bug David 26.6.2026): die Trefferliste ist kürzer als der
  // Volltext — war man tief gescrollt, rutschte der sticky-Container (Suchleiste +
  // Gliederung) mit seinem geschrumpften Inhalt über den Viewport hinaus und war
  // «aus dem Bild». Nach oben scrollen holt Suchleiste + Gliederung zurück ins
  // Sichtfeld. Reine Scroll-Steuerung (kein setState) → keine Render-Kaskade.
  useEffect(() => {
    // An `sucheDebounced` gekoppelt (nicht `suche`): der Ansichtswechsel Volltext↔
    // Trefferliste erfolgt über `treffer` (aus sucheDebounced), darum muss die
    // Scroll-Rettung/-Rückgabe mit genau diesem Moment fluchten (Rank 9).
    const war = sucheVorher.current;
    sucheVorher.current = sucheDebounced;
    if (typeof window === 'undefined') return;
    // Im Pane scrollt der Pane-Container, nicht das Fenster (B-2.5).
    const sc = paneRoot(imPane, wurzel);
    const hole = () => sc ? sc.scrollTop : window.scrollY;
    const setze = (y: number) => sc ? sc.scrollTo(0, y) : window.scrollTo(0, y);
    if (!war && sucheDebounced) {
      scrollVorSuche.current = hole();
      window.requestAnimationFrame(() => setze(0));
    } else if (war && !sucheDebounced && scrollVorSuche.current != null) {
      const y = scrollVorSuche.current;
      scrollVorSuche.current = null;
      window.requestAnimationFrame(() => setze(y));
    }
  }, [sucheDebounced, imPane, wurzel]);

  // Token-Auflösung für bare Artikelverweise (normalisiert «6a» → Token «6_a»).
  const internRefs = useMemo<InternRefs | undefined>(() => {
    if (!eintraege) return undefined;
    const tokenMap = new Map<string, string>();
    for (const e of eintraege) tokenMap.set(e.artikel.toLowerCase().replace(/[^a-z0-9]/g, ''), e.artikel);
    // W2·5d U-POSITION/A16: ein Klick auf einen Verweis IM Text ist nutzer-initiiert
    // und soll einen echten History-Eintrag anlegen, damit Browser-/UI-Zurück exakt
    // an den Ausgangs-Artikel zurückkehrt. In der PRIMÄR-/Einzelansicht darum über
    // den Router navigieren (react-router besitzt die History; der letzteNavKey-
    // Effekt führt den eigentlichen Sprung aus, ScrollWiederherstellung/ScrollZuHash
    // stellt beim Zurück die Ausgangsstelle her — Anker bei hashlosem Ausgang,
    // #art-Hash bei Hash-Ausgang). Ein MANUELLES pushState würde react-router
    // desynchronisieren (Zurück löste dann keinen Location-Wechsel aus → kein
    // Rück-Sprung). Im SEKUNDÄREN Pane bleibt der direkte Sprung (eigene Pane-
    // History, scrollt den Pane-Container; kein globaler Router-Eingriff, B-2.5).
    const springeZuRef = (t: string) => {
      if (istSekundaer) { springeZuArtikel(t); return; }
      navigate(`${basisPfad}${window.location.search}#art-${t}`);
    };
    return { tokenMap, basisPfad, springeZu: springeZuRef };
  }, [eintraege, basisPfad, springeZuArtikel, istSekundaer, navigate]);

  // Offen-Zustand des FLIESSTEXTS (eigener State; der TOC-Baum hat seinen eigenen
  // `tocBaum`). renderSektion ruft mit defOpen=true → der ganze Erlass ist
  // Fedlex-treu standardmässig aufgeklappt; jede Stufe bleibt per Toggle
  // einklappbar. Reine Darstellung (§3).
  const istOffen = (id: string, defOpen: boolean) => offen[id] ?? defOpen;
  const toggle = (id: string, defOpen: boolean) => setOffen((o) => ({ ...o, [id]: !(o[id] ?? defOpen) }));
  const oeffnePfad = (ids: string[]) => setOffen((o) => {
    const n = { ...o }; for (const id of ids) n[id] = true; return n;
  });

  // E3/A34 (David 16.7.2026): der Seed-Sprung unten darf pro Erlass-Ladung NUR
  // EINMAL feuern — nicht erneut, wenn die Einzelansicht in den Split-View kippt
  // (`imPane`/`wurzel` wechseln von false→true). Sonst las der Effekt beim Pane-
  // Öffnen erneut `window.location.hash` (= der zuvor angeklickte Artikel) und
  // sprang das frisch weitergescrollte Gesetz-Pane auf diesen früheren Artikel
  // zurück (Scroll-Verlust, §15 Funktions-Treue «Split-View-Pane-Zustand»). Der
  // Wächter wird pro Erlass zurückgesetzt; spätere Hash-Wechsel trägt ohnehin der
  // letzteNavKey-Effekt (Primär) bzw. die eigene Pane-History (A16/A17).
  const hashSeedGetan = useRef(false);
  useEffect(() => { hashSeedGetan.current = false; }, [ebene, schluessel]);

  // Hash-Sprung: alle Vorfahren des Ziel-Artikels öffnen + scrollen.
  // W2·5d U-POSITION/A17: auch im SEKUNDÄREN Pane an die Fundstelle springen —
  // der ⧉-Öffner legt den Pfad MIT `#art-token` ab (NormPopover readerLink), aber
  // die Fundstelle stand bisher nur in `window.location.hash` (= die Haupt-URL,
  // NICHT der Pane-Pfad) und der Effekt brach für Panes ab ⇒ das Pane öffnete oben
  // statt an der Norm. Quelle des Hashs ist im Pane die PANE-LOKALE Location
  // (`<Routes location={loc}>` → react-router `useLocation()` liefert den Pane-Pfad),
  // sonst wie bisher die echte Fenster-URL (Primär/Einzelansicht byte-gleich).
  useEffect(() => {
    if (!eintraege || !sektionen.length || typeof window === 'undefined') return;
    // A34: nur der ERSTE inhaltsbereite Lauf sät den Sprung. Danach gesperrt —
    // ein `imPane`/`wurzel`-Wechsel (Split-View öffnet) re-triggert den Effekt,
    // darf aber NICHT erneut an den (alten) Hash springen. Wächter VOR dem Hash-
    // Test setzen, damit auch ein hashloser Erststart den späteren Re-Lauf sperrt.
    if (hashSeedGetan.current) return;
    hashSeedGetan.current = true;
    const hashQuelle = istSekundaer ? location.hash : window.location.hash;
    const m = hashQuelle.match(/^#art-(.+)$/);
    if (!m) return;
    // Deep-Link mit Artikel-Anker → aktiven Reiter darauf melden (Live-Label).
    // Sekundäres Pane treibt den globalen Reiter-Tracker NICHT (es ist nicht die URL).
    if (!istSekundaer) aktualisiereTabArtikel(window.location.pathname + window.location.search + window.location.hash);
    const token = decodeURIComponent(m[1]);
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    window.requestAnimationFrame(() => {
      if (ids.length) oeffnePfad(ids);
      window.setTimeout(() => {
        const el = findeArt(paneRoot(imPane, wurzel), token);
        // R1: oberer Lese-Rand statt Mitte (deckt sich mit der Scroll-Spy-Bezugslinie).
        el?.scrollIntoView({ block: 'start', behavior: 'auto' });
        el?.classList.add('lc-ziel-blink');
        window.setTimeout(() => el?.classList.remove('lc-ziel-blink'), 2400);
      }, 110);
    });
    // location.hash bewusst NICHT in den Deps: der Effekt springt EINMAL beim
    // Erlass-Laden an die (Pane-lokale bzw. Fenster-)Fundstelle — die Primär-
    // Instanz führt spätere Hash-Wechsel über den letzteNavKey-Effekt nach
    // (kein Doppel-Sprung/-Blink), das Pane öffnet an seiner Seed-Fundstelle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eintraege, sektionen, istSekundaer, imPane, wurzel]);

  // Geteilter «aktueller-Artikel»-Beobachter (Auftrag David 26.6.2026): EIN
  // IntersectionObserver bestimmt den Artikel, der OBEN im Viewport angeschnitten
  // ist, und speist daraus zwei Konsumenten aus EINER Quelle — (a) die Gliederungs-
  // Markierung + automatisches Auf-/Zuklappen des aktiven Zweigs (P9/K) UND (b) das
  // Live-Label des aktiven Reiters «Kürzel – Art. X» (P2). IntersectionObserver
  // statt getBoundingClientRect-Schleife wegen content-visibility:auto (Off-Screen-
  // Artikel sind nur Platzhalter).
  // R1 (Auftrag David 30.6.2026): NICHT mehr der mittige Artikel, sondern der
  // ZUOBERST angeschnittene — die Bezugslinie sitzt am Sprung-Landepunkt (5rem unter
  // dem Container-Oberrand, deckungsgleich mit `.nt-anker`), das Beobachtungs-Band
  // liegt darum oben (rootMargin oben ~45 % statt -45%/-45%). Die Auswahl-Logik bleibt
  // die reine, getestete Funktion aktiverArtikel — sie wählt generisch den Artikel
  // an der Bezugslinie (§2/§3).
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
      // Bezugslinie im Viewport-Koordinatensystem (getBoundingClientRect): R1 — nicht
      // mehr die Mitte, sondern eine Linie nahe dem oberen Lese-Rand, damit der zuoberst
      // angeschnittene Artikel «dran» ist. Im Pane relativ zur Pane-Oberkante, sonst
      // zum Fenster (B-2.5).
      // KRITISCH (R1×R3): Der Klick-/Anker-Sprung landet den Artikel über die
      // `.nt-anker`-scroll-margin (= 5rem, index.css) genau 5rem unter dem
      // Container-Oberrand. Die Bezugslinie MUSS denselben Offset treffen, sonst
      // markiert der Spy nach dem Sprung den Vorgänger. Darum FIXER rem-Offset (5rem
      // + Epsilon), NICHT ein Höhen-Prozent: rem-basiert skaliert er mit der
      // R3-Schriftskala mit und ist unabhängig von der Viewport-Höhe/vom Zoom.
      const sc = paneRoot(imPane, wurzel);
      const oben = sc ? sc.getBoundingClientRect().top : 0;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const bezug = oben + 5 * remPx + 8;
      const rects = [...sichtbar.values()]
        .filter((en) => en.isIntersecting)
        .map((en) => {
          const r = en.target.getBoundingClientRect();
          return { token: (en.target as HTMLElement).id.replace(/^art-/, ''), top: r.top, bottom: r.bottom };
        });
      const token = aktiverArtikel(rects, bezug);
      if (!token || token === letzterArtToken.current) return; // dedup: nur bei Wechsel
      letzterArtToken.current = token;
      // A3/F: aktuellen Artikel an den Kopf melden (Einzelansicht-Kopf ODER PaneKopf),
      // entprellt (150 ms) → coalesct schnelle Artikelgrenzen, weniger Pane-Re-Renders.
      // Echtes Label des Eintrags (deckt Schlusstitel «Art. 3» korrekt ab);
      // Fallback auf die Token-Heuristik nur, falls kein Eintrag passt.
      const artLabel = artLabelByToken.get(token) ?? `Art. ${token.replace(/_/g, '')}`;
      if (aktArtikelTimer.current != null) window.clearTimeout(aktArtikelTimer.current);
      aktArtikelTimer.current = window.setTimeout(() => setAktArtikel(artLabel), 150);
      // (b) Reiter-Live-Label: ?search (Instanz-?r) erhalten, Hash = #art-token.
      //     aktualisiereTabArtikel ist idempotent + no-op ohne passenden Reiter.
      //     Entprellt (trailing): beim schnellen Durchscrollen sonst ein
      //     localStorage-Write + globales TABS_EVENT pro Artikelgrenze.
      // Sekundäres Pane treibt den globalen Reiter-Tracker NICHT (es ist nicht die URL).
      if (!istSekundaer) {
        const tabZiel = `${basisPfad}${window.location.search}#art-${token}`;
        if (tabArtikelTimer.current != null) window.clearTimeout(tabArtikelTimer.current);
        tabArtikelTimer.current = window.setTimeout(() => aktualisiereTabArtikel(tabZiel), 200);
      }
      // (a) Gliederung: aktiven Pfad markieren + den Zweig automatisch AUFklappen
      //     und beim Verlassen wieder ZUklappen (K, Auftrag David 26.6.2026) —
      //     aber nur Zweige, die der Spy selbst geöffnet hat (autoOffenRef);
      //     manuell geöffnete bleiben offen. Der Mitscroll-Effekt hält den
      //     aktiven Eintrag dann im TOC-Container sichtbar.
      const ids = pfadZu(sektionen, (s) => s.artikel.some((x) => x.artikel === token)) ?? [];
      if (!ids.length) return;
      // F3 (RC2, Auftrag David 16.7. «Gliederung springt umher»): den (a)-Block
      // (Markierung + Auto-Akkordeon) TRAILING entprellen (~200 ms, analog aktArtikel/
      // tabArtikel oben). Der Timer verarbeitet stets das ZULETZT gemeldete `ids` (jeder
      // neue Frame löscht den vorigen Timer). Wirkung: beim schnellen Durchscrollen EIN
      // Auf/Zu statt einer dichten Reflow-Folge des Baums. Das Verhalten (Auto-Auf-/
      // Zuklappen, Auftrag K 26.6.) bleibt — nur seine Frequenz sinkt. Der Klick-Sprung-
      // Pfad (springeZuArtikel/springeZuSektion) setzt aktivIds/tocBaum weiterhin SOFORT
      // und löscht diesen Timer (kein Kampf mit einem verspäteten Auto-Update).
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current);
      tocBaumTimer.current = window.setTimeout(() => {
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
      }, 200);
    };
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) sichtbar.set(en.target, en);
      if (!raf) raf = window.requestAnimationFrame(auswerten);
      // R1: Beobachtungs-Band im oberen Bereich (obere ~45 % der Container-Höhe).
      // Grosszügig genug, dass die FIXE Bezugslinie (~5rem) bei jeder Viewport-Höhe
      // und jeder R3-Schriftskala drin liegt; aktiverArtikel wählt daraus exakt den
      // Artikel an der Linie. Eine schmale %-Bande verfehlte die fixe Linie bei
      // grossen Schirmen/Zoom.
    }, { root: paneRoot(imPane, wurzel), rootMargin: '0px 0px -55% 0px', threshold: 0 });
    // Alle aktuell gerenderten Artikel beobachten — im Pane nur die DIESES Panes
    // (B-2.5: sonst beobachtet der Spy auch das andere Pane → falsches Live-Label).
    // Auf-/Zuklappen (offen) und Suche (sucheDebounced) verändern die DOM-Artikelmenge
    // → Effekt läuft über die Deps neu und beobachtet die dann sichtbaren Artikel.
    // Rank 9: an sucheDebounced statt suche gekoppelt — der Observer-Neuaufbau (alle
    // art--Knoten neu beobachten) läuft so nicht bei jedem Tastendruck.
    (paneRoot(imPane, wurzel) ?? document).querySelectorAll('[id^="art-"]').forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (tabArtikelTimer.current != null) window.clearTimeout(tabArtikelTimer.current);
      if (aktArtikelTimer.current != null) window.clearTimeout(aktArtikelTimer.current);
      if (tocBaumTimer.current != null) window.clearTimeout(tocBaumTimer.current); // F3
    };
  }, [sektionen, ohneGliederung, basisPfad, offen, sucheDebounced, istSekundaer, imPane, wurzel]);

  // Aktiven Eintrag im TOC sichtbar halten — sanft, nur den TOC-Container, nie die
  // Seite scrollen. Läuft bei JEDEM Wechsel des aktiven Pfads (aktivIds) UND nach
  // dem Aufklapp-Settle (tocBaum): so folgt die Gliederung beim Scrollen der
  // Leseposition (P9b — vorher fehlte aktivIds in den Deps, darum scrollte der TOC
  // beim Scrollen nicht mit). Nur scrollen, wenn der aktive Eintrag aus dem Sicht-
  // feld des TOC-Containers gelaufen ist (sonst kein unnötiger Sprung).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    // Pane-gescopt: sonst trifft der globale Query ein FREMDES Pane (zwei breite
    // Gesetz-Panes haben je ein [data-toc]) → falsches Pane scrollt (E-Regression).
    const wurzelEl = paneRoot(imPane, wurzel);
    const cont = (wurzelEl ?? document).querySelector('[data-toc]') as HTMLElement | null;
    if (!cont) return;
    // F2 (RC1b) + V1: solange der Nutzer die Gliederung aktiv durchblättert (letzte
    // Bedienung < 1,5 s her), NICHT nachführen — er soll sich frei darin bewegen
    // können (David 16.7. «Wenn man sich darin bewegt»). V1 (stille Wiederaufnahme):
    // dieser Effekt läuft nur bei echtem aktivIds-/tocBaum-Wechsel; nach Ablauf des
    // Guards führt also erst der NÄCHSTE Artikelwechsel wieder nach — keine verspätete
    // Rückhol-Bewegung, die das Erkunden abbricht.
    if (Date.now() - tocTouchRef.current < 1500) return;
    const aktive = cont.querySelectorAll('[data-toc-aktiv]');
    const el = aktive[aktive.length - 1] as HTMLElement | undefined;
    if (!el) return;
    const cr = cont.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    // F1 (RC1a): minimaler Rand-NUDGE statt Zentrieren, INSTANT statt smooth. Nur so
    // weit scrollen, dass der aktive Eintrag knapp in das 8-px-Dead-Band am jeweiligen
    // Rand rückt (Auslöseschwelle == Zielposition → kein Re-Trigger); Delta ≈ eine
    // Zeilenhöhe statt ½ Container (früher `- cr.height/2` = Sprünge von 289–315 px).
    // Bewusst KEIN scrollIntoView({block:'nearest'}): das kann Ancestor/Seite mitscrollen
    // (E-Regression, Kommentar oben «nie die Seite scrollen»). Kein `smooth`: beseitigt
    // den Klickziel-Hazard (Buttons wandern nicht mehr unter dem Cursor weg).
    const dOben = er.top - (cr.top + 8);
    const dUnten = er.bottom - (cr.bottom - 8);
    if (dOben < 0) cont.scrollTo({ top: cont.scrollTop + dOben });
    else if (dUnten > 0) cont.scrollTo({ top: cont.scrollTop + dUnten });
  }, [aktivIds, tocBaum, imPane, wurzel]);

  // F2 (RC1b): Nutzer-Interaktions-Guard. Passive Input-Listener am [data-toc]-
  // Container (pane-gescopt) armieren den Guard — NICHT `scroll`, sonst würde der
  // eigene programmatische Nudge den Guard selbst auslösen. Läuft neu, sobald die
  // TOC-Spalte erscheint/verschwindet (istXl/tocOffen/sektionen).
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const wurzelEl = paneRoot(imPane, wurzel);
    const cont = (wurzelEl ?? document).querySelector('[data-toc]') as HTMLElement | null;
    if (!cont) return;
    const merke = () => { tocTouchRef.current = Date.now(); };
    cont.addEventListener('wheel', merke, { passive: true });
    cont.addEventListener('pointerdown', merke, { passive: true });
    cont.addEventListener('touchstart', merke, { passive: true });
    return () => {
      cont.removeEventListener('wheel', merke);
      cont.removeEventListener('pointerdown', merke);
      cont.removeEventListener('touchstart', merke);
    };
  }, [sektionen, istXl, tocOffen, imPane, wurzel]);

  // W2·5d U-POSITION/A16: laufend den Scroll-Anker dieses Reiters festhalten
  // (oberster sichtbarer Artikel `letzterArtToken` + Offset in ihn hinein). Beim
  // Zurück-/Reiter-Wechsel stellt App.tsx:ScrollWiederherstellung EXAKT diese Stelle
  // wieder her — element-basiert und darum robust gegen die content-visibility-
  // Höhenschätzung (David 5.7.: scrollTop allein ist unzuverlässig). Nur die
  // Primär-/Einzelansicht (die Fenster-Restoration); das Pane hat eigene History.
  // Passiver, rAF-entprellter Scroll-Listener (§15): eine getBoundingClientRect je
  // Frame, kein setState (keine Render-Kaskade).
  useEffect(() => {
    if (istSekundaer || typeof window === 'undefined') return;
    let raf = 0;
    const erfasse = () => {
      raf = 0;
      const token = letzterArtToken.current;
      if (!token) return;
      const el = findeArt(null, token);
      if (!el) return;
      const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const offset = Math.max(0, Math.round(bezugslinie(0, remPx) - el.getBoundingClientRect().top));
      merkeAnker(tabSchluessel(basisPfad + window.location.search), { token, offset });
    };
    const onScroll = () => { if (!raf) raf = window.requestAnimationFrame(erfasse); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) window.cancelAnimationFrame(raf); };
  }, [istSekundaer, basisPfad]);

  const sucheTrim = sucheDebounced.trim().toLowerCase(); // Rank 9: entprellt (nicht `suche`)
  // ═══ ABSCHNITT · In-Gesetz-Suche & Treffer ═══
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
    // W2·10-UI-NAV/N0b: hilfreiche Fehlseite (angefragter Key + Fuzzy-Vorschläge +
    // eingebettetes Erlass-Suchfeld) statt der nackten «nicht verfügbar»-Notiz.
    return <GesetzFehlSeite schluessel={schluessel} manifest={manifest} />;
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
    return (
      <div className="space-y-5">
        {/* Breadcrumb trägt der Kopf (Inhalts-Kopf bzw. PaneKopf) — kein Inline-Dup.
            G2b: EINE Kopf-Komponente (ErlassLeserKopf) — hier ohne Options-Leiste,
            da am eingebetteten PDF Linien/Fussnoten/Verweise wirkungslos wären
            (keine toten Steuerelemente, §13 F4). */}
        <ErlassLeserKopf erlass={erlass} artikelAnzahl={null} currency={currency?.[erlass.key]}
          overline={`${erlass.ebene === 'bund' ? 'Staatsvertrag' : `Kanton ${erlass.kanton}`} · amtliches PDF`}
          hinweis="Amtliches PDF — massgeblich ist die amtliche Fassung"
          aktionen={
            <AmtlichesPdf href={`/normtext/${erlass.pdfPfad}`} stand={erlass.stand} extern={false} dateiname={`${erlass.kuerzel}.pdf`} />
          } />
        {/* M5: Erlass-Kopf-Slot auch im pdf-embed-Pfad (für PDF-Erlasse ohne
            Struktur-Sidecar bleibt kopf=null → nichts gerendert). */}
        {kopf && <ErlassKopfBlock kopf={kopf} intern={internRefs} />}
        {/* Eingebettetes amtliches PDF (same-origin → Browser-Viewer mit nativer
            Suche/Zoom/Druck). iframe ist für Inline-PDF am zuverlässigsten; darunter
            ein sichtbarer Fallback-Link für Browser ohne PDF-Viewer. */}
        {/* ⑦ PDF-Rahmen (W2·5d G3a): der iframe-Rahmen nutzt die benannte Struktur-
            Linie (border-rule-struktur) statt der Ad-hoc border-line — konsistent mit
            dem Linien-Kanon (§2.2⑦). Das PDF IST die amtliche Fassung (§7/§8). */}
        <iframe src={`/normtext/${erlass.pdfPfad}#view=FitH`} title={`${erlass.kuerzel} — amtliches PDF`}
          className="w-full rounded-lg border border-rule-struktur bg-paper-sunken/30"
          style={{ height: 'min(82vh, 1100px)' }} />
        {/* Einheitliches Kontext-Panel (B3): Entscheide/Materialien/Werkzeuge zu
            diesem Erlass am Leseende (Single Source mit dem Volltext-Reader). */}
        <KontextPanel typ="norm" normKeys={[erlass.key]} />
        <nav className="mt-4 border-t border-line pt-5 flex flex-wrap justify-between gap-3 text-body-s" aria-label="Weitere Erlasse">
          <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">‹ Übersicht</Link>
          <a href={`/normtext/${erlass.pdfPfad}`} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">Amtliches PDF in neuem Tab öffnen ↗</a>
        </nav>
      </div>
    );
  }
  // ── ⑧ LIVE_VERWEIS: kein In-App-Volltext — ehrliche Verweiskarte (§8) ────────
  // Statt der «nicht verfügbar»-Fehlerseite: prominenter amtlicher Live-Link +
  // Stand + ehrlicher Hinweis «nicht als In-App-Volltext gehostet» (FAHRPLAN
  // §2.2⑧, Referenz DSGVO). Massgeblich bleibt die amtliche Quelle (§7/§8). Reine
  // Darstellung; eintraege bleibt null (darum VOR dem Lade-Guard unten).
  if (erlass && erlass.status === 'nur-live-link') {
    const verweisOverline = `${erlass.rechtsgebiet === 'international' ? 'International' : erlass.ebene === 'bund' ? 'Bund' : `Kanton ${erlass.kanton}`} · amtlicher Verweis`;
    return (
      <div className="space-y-5">
        <ErlassLeserKopf erlass={erlass} artikelAnzahl={null} currency={currency?.[erlass.key]}
          overline={verweisOverline}
          hinweis="Verweis — massgeblich ist die amtliche Fassung" />
        <section className="max-w-reading space-y-4 rounded-lg border border-rule-struktur bg-paper-sunken/20 p-5">
          <p className="font-serif text-body-l leading-[1.65] text-ink-700">
            Dieser Erlass wird in LexMetrik <strong className="font-semibold">nicht als In-App-Volltext gehostet</strong>.
            Massgeblich und vollständig ist die amtliche Fassung bei der Quelle.
          </p>
          {erlass.quelleUrl && (
            <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-brass-400 px-3 py-2 text-body-s font-medium text-brass-700 no-underline hover:border-brass-500 hover:bg-brass-100/40 transition-colors">
              <span aria-hidden>↗</span> Amtliche Fassung öffnen
            </a>
          )}
          {erlass.stand && (
            <p className="text-micro text-ink-500">Stand der zuletzt erfassten Referenz: <span className="num">{formatiereDatum(erlass.stand)}</span></p>
          )}
        </section>
        {/* Einheitliches Kontext-Panel (B3) auch hier: Entscheide/Materialien/
            Werkzeuge zu diesem Erlass (Single Source, §5). */}
        <KontextPanel typ="norm" normKeys={[erlass.key]} />
        <nav className="mt-4 border-t border-line pt-5 flex flex-wrap justify-between gap-3 text-body-s" aria-label="Weitere Erlasse">
          <Link to="/gesetze" className="text-ink-500 hover:text-brass-700">‹ Übersicht</Link>
          {erlass.quelleUrl && <a href={erlass.quelleUrl} target="_blank" rel="noopener noreferrer" className="text-brass-700 hover:underline">Amtliche Fassung in neuem Tab öffnen ↗</a>}
        </nav>
      </div>
    );
  }
  if (!erlass || !eintraege) {
    // Mindesthöhe reserviert die volle Lesehöhe, solange Snapshot/Struktur async
    // laden: ohne sie kollabiert das (bei Bund prerenderte) Volltext-Dokument auf
    // die kurze Spinner-Zeile und der einwachsende React-Baum erzeugt den grossen
    // CLS-Sprung. min-h-screen ist ein Token (§13), reserviert nur Platz, kürzt
    // keinen Inhalt (§15/2).
    return (
      <div className="min-h-screen py-12 text-center space-y-3">
        <div className="scale-rule max-w-[200px] mx-auto" aria-hidden />
        <p className="text-body-s text-ink-500">Der Erlass wird abgerufen …</p>
      </div>
    );
  }

  const regRef = (id: string) => (el: HTMLElement | null) => {
    if (el) sekRefs.current.set(id, el); else sekRefs.current.delete(id);
  };
  const fn = (tok: string) => struktur?.[tok]?.fussnoten;

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

  // W2·5d G3a: Grundart-Metadaten zur Laufzeit aus dem Register (SSoT, §5) per
  // key — die BrowseErlass trägt sie bewusst nicht. Steuert Kopf-Label (erlassTyp),
  // §-Zähl-Substantiv (bestimmungsEtikett, ⑥) und den grundart-abhängigen Linien-
  // Default (data-grundart am .lc-leser-Root, K11).
  const meta = grundartMeta(erlass.key);
  const bestimmungsWort = meta.bestimmungsEtikett === 'paragraf' ? 'Paragraphen' : 'Artikel';

  // Artikel-Bereich «Art. 1–10» + Einzelartikel-Flag je Sektion kommen aus dem
  // `sektionMeta`-useMemo (Rank 4) — einmal bottom-up berechnet statt je Render.


  // Jede Sektionsstufe ist klappbar (Fedlex-analog); Inhalt rendert nur offen.
  // Randtitel-promotete Knoten (s.randtitel) bekommen einen ruhigen Einzug-Strich,
  // damit die Buchstaben-/Ziffern-Gruppierung als Verschachtelung lesbar bleibt.
  // Ein Knoten kann seit 6b DIREKTE Artikel UND Unter-Knoten tragen (z. B.
  // «II. Handlungsfähigkeit» enthält Art. 12 direkt und die Untergruppe
  // «2. Voraussetzungen») — beide werden in Dokument-Reihenfolge gemischt.
  // ═══ ABSCHNITT · Rendering (renderSektion, TOC-Baum, Options-Leiste, JSX-Return) ═══
  const renderSektion = (s: Sektion, defOpen: boolean, tiefe: number): ReactNode => {
    const auf = istOffen(s.id, defOpen);
    // Kinder + direkte Artikel in EINER nach Dokument-Position sortierten Liste.
    const inhalt = auf
      ? [
          ...s.kinder.map((k) => ({ pos: sekPos.get(k.id) ?? Infinity, el: renderSektion(k, true, tiefe + 1) })),
          ...s.artikel.map((e) => ({
            pos: artIndex.get(e.artikel) ?? 0,
            el: <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} leitfaelle={leitfaelleFuer(e.artikel)} revision={revisionFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />,
          })),
        ].sort((a, b) => a.pos - b.pos)
      : [];
    // Linien-Kanon (W2·5d G1 + U-LINIEN/A8, DESIGN-REGLEMENT-NORMTEXT §4b Regel 1 +
    // §Weissraum-Rhythmus): HÖCHSTENS EINE vertikale Guide-Linie gleichzeitig — genau
    // die aufbau-abhängige `linien.guideEbene` trägt den Guide (Ebene 0 bei einer
    // einzigen Gliederungsebene → «flache Ebene sichtbar», sonst Ebene 1); tiefere
    // Ebenen tragen ihre Tiefe allein über den EINZUG (kein gestapelter «Barcode» aus
    // border-l pro Ebene, der ZGB Art. 684 / OR Art. 319 zupflasterte). `guideEbene
    // === null` (flache Artikelliste) ⇒ gar kein Guide. Einzug-Skala (V2·L-1): Tiefe
    // 1–5 → je eine `einzug`-Stufe (20px), gedeckelt bei 5 (vorher 3 — tiefe
    // Kodifikationen ZGB/OR verloren ab Ebene 3 die visuelle Verschachtelung, David-
    // Befund «funktioniert praktisch nicht»). MOBIL kollabiert der Einzug NICHT mehr
    // auf 0, sondern trägt `einzug-mobil` (~0.75rem, `pl-einzug-mobil sm:pl-einzug`)
    // → die Verschachtelung flüstert auch @390 weiter; die eine Guide bleibt am
    // Spaltenrand. CLS 0: Einzug = padding, Guide = border darauf. Der Guide wird bei
    // jedem Erlass mit Gliederung emittiert; ob er im Auto-Default SICHTBAR ist,
    // entscheidet der aufbau-basierte `data-guide-auto`-Toggle rein per CSS (kein
    // Artikel-Re-Render, §15). `data-linien="aus"` kollabiert den Einzug weiterhin
    // auf 0 über ALLE Ebenen (index.css, padding-left:0).
    const guide = linien.guideEbene !== null && tiefe === linien.guideEbene;
    const eingerueckt = tiefe > 0 && tiefe <= 5;
    const einzugCls = eingerueckt ? 'pl-einzug-mobil sm:pl-einzug' : '';
    return (
      <section key={s.id} data-normtext-linie className={`space-y-3 ${guide ? 'border-l border-guide' : ''} ${einzugCls}`}>
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)} bereich={sektionMeta.get(s.id)?.bereich} bereichEinzel={sektionMeta.get(s.id)?.einzel ?? false} />
        {auf && <div className="space-y-5">{inhalt.map((x) => x.el)}</div>}
      </section>
    );
  };

  // Geteilte Such-Steuerung (nur noch die Eingabe — der frühere Fussnoten-Schalter
  // ist in die Options-Leiste unifiziert, G2b). Wird an ZWEI Orten gerendert: in der
  // Gliederungs-Spalte (2-Spalten-Fall, oberhalb der TOC) ODER als volle Breite
  // (kein Gliederungs-Spalt: keine Sektionen oder eingeklappt).
  const sucheEingabe = (
    <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
      placeholder="Im Gesetz suchen …" aria-label="Im Gesetz suchen"
      className="lc-input h-9 py-0 text-body-s flex-1 min-w-0" />
  );
  // E3/A34: das «Ansicht»-Dropdown im SPLIT-VIEW (nur `imPane`). Es lebt in den
  // pane-lokalen STICKY Leisten (Such-Bar bzw. 2-Spalten-TOC-Sub-Bar) statt im
  // wegscrollenden ErlassLeserKopf — so bleibt die Ansichtswahl beim Lesen im Pane
  // dauerhaft erreichbar (A26-Ziel «immer sichtbar», jetzt auch für den Pane).
  // In der Einzelansicht (!imPane) trägt der sticky Inhalts-Kopf das Menü (A26) →
  // hier `null`, kein Doppel. Such-Bar (`!zweiSpalten`) und TOC-Sub-Bar
  // (`zweiSpalten`) schliessen sich aus ⇒ nie zwei Menüs gleichzeitig.
  const ansichtMenuPane = imPane
    ? <LeserAnsichtMenu zeigeLinien={linien.guideEbene !== null} linienAutoAn={linien.autoGuide} fussnotenAnzahl={fussnotenAnzahl} />
    : null;
  // 2-Spalten aktiv ⇒ die Suche lebt in der Gliederungs-Spalte (oberhalb der TOC),
  // NICHT als Vollbreite über dem Gesetzestext (Auftrag David).
  // 2-Spalten-Layout ist NUR ab lg aktiv (istXl, R2: 1024px). Darunter immer
  // einspaltig → Suche + Gliederungs-Zugang leben in der STICKY Vollbreiten-Leiste.
  const zweiSpalten = sektionen.length > 0 && tocOffen && istXl;

  // Gliederungs-Baum EINMAL beschreiben (genutzt in der xl-Spalte UND im mobilen
  // Drawer, §5 — kein doppelter onSprung). `springeZuSektion`/`tocToggle` sind
  // oben als useCallback definiert (über dem early-return, Rank 4).
  const tocBaumEl = (
    <SektionBaumTOC sektionen={sektionen} aktivPfad={aktivIds} offen={tocBaum}
      onToggle={tocToggle} onSprung={springeZuSektion} />
  );

  return (
    // `lc-leser`: Scope-Anker für die G2a-Options-CSS (index.css) — die
    // data-linien/-fussnoten/-verweise-Regeln greifen NUR im Reader, nie im
    // Norm-Popover der Rechner o. Ä. `data-guide-auto` (U-LINIEN/A8): der
    // AUFBAU-abhängige Linien-Default 'auto' wertet CSS hieran aus — 'aus' = tiefe
    // Kodifikation bleibt ruhig (Guide unsichtbar, Einzug bleibt), 'an' = flaches/
    // mittleres Gesetz zeigt seine EINE Guide-Ebene. Löst den grundart-Kategorie-
    // Default (K11) ab. `data-grundart` bleibt als semantischer Marker (§5).
    <div className="lc-leser space-y-5" data-grundart={meta.grundart ?? undefined} data-guide-auto={linien.autoGuide ? 'an' : 'aus'}
      // W2·10-UI-NAV/N0c: reale Sticky-Höhe für die .nt-anker-Sprünge. Einzelansicht:
      // Topbar (4rem) + Inhalts-Kopf (2.25rem) + dritte klebende Zeile (~3rem). Im
      // Pane liegen Topbar/PaneKopf ausserhalb des Scroll-Containers → nur die dritte
      // Zeile (top 0.5rem) klebt (Muster --rsp-stick, Entscheid-Leser B3).
      style={{ '--nt-stick': imPane ? '3.5rem' : 'calc(4rem + 2.25rem + 3rem)' } as CSSProperties}>
      {/* O3: flüchtige Bestätigung nach «In neuem Reiter» — zeigt zum ☰-Reiter-
          Tracker oben rechts (aria-live für Screenreader). Fixed, überlagert nichts
          Interaktives; verschwindet nach ~3 s bzw. bei erneutem Reiter-Öffnen. */}
      {reiterToast && (
        <div role="status" aria-live="polite"
          className="fixed right-3 top-20 z-50 flex items-center gap-2 rounded-lg border border-line bg-paper-raised px-3 py-2 text-body-s text-ink-700 shadow-lg">
          <span aria-hidden className="text-brass-700">⧉</span>
          Im neuen Reiter geöffnet — oben unter ☰
        </div>
      )}
      {/* Breadcrumb trägt seit A/F der Kopf: Einzelansicht → Inhalts-Kopf, Split-View
          → PaneKopf. Kein zweiter Inline-Breadcrumb mehr (sonst Dopplung im Pane).
          G2b: EINE Kopf-Komponente (ErlassLeserKopf) — dieselbe wie im pdf-embed-
          Pfad; sie trägt die Options-Leiste (Linien/Fussnoten/Verweise). */}
      <ErlassLeserKopf erlass={erlass} artikelAnzahl={eintraege.length} bestimmungsWort={bestimmungsWort} currency={currency?.[erlass.key]}
        overline={kopfOverline(erlass, meta.erlassTyp, overlineGebiet)}
        hinweis="Snapshot — massgeblich ist die amtliche Fassung"
        aktionen={
          // V2 (koordinierter Kopf-PR): EIN Slot-Layout in der Reihenfolge
          // Ansicht · Fussnoten · Download (§F2) — der Slot wird nicht mehrfach
          // umgebaut. «In neuem Reiter» steht zwischen den Bedien- und den
          // Download-Aktionen (Download bleibt der letzte, verankerte Punkt).
          <>
            {/* W2·5d U-KOPF/A4 + V2·B-1/B-2: «Ansicht»-Dropdown
                (Linien/Fussnoten/Verweise/Entscheide + Zeitraum) — reine data-*-/
                CSS-Toggles bzw. JS-Filter (leserOptionen.ts), global, jede Instanz
                synchron. A26 (David 11.7.2026) verschob es in der EINZELANSICHT in
                den immer sichtbaren Inhalts-Kopf (via ansichtSlot). E3/A34 (David
                16.7.2026): im SPLIT-VIEW lag es hier im ErlassLeserKopf — der scrollt
                mit dem Gesetzestext weg, sodass beim Lesen «keine Möglichkeit mehr,
                die Ansicht zu ändern» blieb. Das Menü wandert darum in die pane-
                lokale STICKY Such-/Gliederungs-Leiste (unten `ansichtMenuPane`),
                die im Pane dauerhaft oben klebt — daher hier NICHT mehr gerendert. */}
            {/* Dasselbe Gesetz zusätzlich in einem zweiten Reiter öffnen (Auftrag
                David) — zum Vergleich zweier Stellen; die Reiter unterscheiden sich
                im Label über den Artikel («OR – Art. 41» / «OR – Art. 97»). */}
            <button type="button"
              onClick={() => {
                const ziel = naechsteInstanz(window.location.pathname + window.location.hash);
                merkeTab(ziel, erlass.kuerzel);
                navigate(ziel);
                // O3: kurze Bestätigung mit Zeiger auf den Reiter-Tracker (☰ oben).
                setReiterToast(true);
                if (reiterToastTimer.current) window.clearTimeout(reiterToastTimer.current);
                reiterToastTimer.current = window.setTimeout(() => setReiterToast(false), 3200);
              }}
              className="lc-chip hover:text-brass-700" title="Diesen Erlass zusätzlich in einem neuen Reiter öffnen">⧉ In neuem Reiter</button>
            {/* W2·5d U-PDF/A12: Download = AMTLICHES PDF der gepinnten Fassung
                (Bund Fedlex-Filestore / Kanton LexWork; aus erlass.pdfUrl,
                synchron am Erlass ⇒ CLS 0, §15/2). Fehlt die amtliche PDF-URL,
                entfällt die Aktion (nie render-eigenes PDF, §8/§10.5). */}
            {erlass.pdfUrl && (
              <AmtlichesPdf href={erlass.pdfUrl} stand={erlass.pdfStand ?? erlass.stand} extern />
            )}
          </>
        } />

      {/* M5: Erlass-Kopf (Ingress/Erlassformel bzw. materielle Präambel + Erlass-
          datum + Kopf-Fussnoten) — Fedlex-Fundiertheits-Floor (§2), bisher verworfen. */}
      {kopf && <ErlassKopfBlock kopf={kopf} intern={internRefs} />}

      {/* Suche als Vollbreite NUR ohne 2-Spalten (keine Sektionen ODER Gliederung
          eingeklappt) — dann trägt sie auch den «☰ Gliederung»-Wiedereinblender.
          Sticky direkt unter dem 4rem-Header (der Reiter-Streifen entfiel; die
          Reiter-Übersicht lebt jetzt in der Topbar). Im 2-Spalten-Fall
          sitzt die Suche in der linken Spalte oberhalb der TOC (Auftrag David:
          nicht über dem Gesetzestext). */}
      {/* Sticky Kopfzeile UNTER dem Reiter-Streifen. Zwei Varianten (Auftrag David
          25.6.2026): ab lg (eingeklappte Spalte) die volle Suchleiste + ☰-Knopf zum
          Wiedereinblenden der Spalte; UNTER lg nur EIN kompakter Knopf, der Suche +
          Gliederung als Overlay-Drawer auf Wunsch öffnet (analog Seitenleiste) —
          so nimmt der Reader keine zweite volle Bar weg, die den Reiter-Streifen
          eng macht/abschneidet. */}
      {!zweiSpalten && (
        <div data-such-bar className="sticky z-[16] mb-4 rounded-lg bg-paper"
          style={{ top: imPane ? '0.5rem' : 'calc(4rem + 2.25rem)' }}>
          {istXl ? (
            <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 shadow-sm">
              {sektionen.length > 0 && (
                <button type="button" aria-expanded={tocOffen} onClick={() => setTocOffen(true)}
                  title="Gliederung einblenden" className="shrink-0 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-micro font-medium text-ink-600 hover:text-brass-700 hover:border-brass-300 transition-colors">
                  <span aria-hidden>☰</span><span className="hidden sm:inline">Gliederung</span>
                </button>
              )}
              {sucheEingabe}
              {/* A34: Ansicht-Menü im Split-View in der sticky Such-Bar (rechts). */}
              {ansichtMenuPane && <span className="shrink-0">{ansichtMenuPane}</span>}
            </div>
          ) : (
            // A34: unter der 2-Spalten-Schwelle trägt die Bar den ☰-Knopf UND (im
            // Split-View) das sticky Ansicht-Menü — nebeneinander in EINER Zeile.
            <div className="flex items-center gap-2">
              <button type="button" aria-expanded={tocAuf} onClick={() => setTocAuf((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 text-body-s font-medium text-ink-600 shadow-sm hover:text-brass-700 hover:border-brass-300 transition-colors">
                <span aria-hidden>☰</span>{sektionen.length > 0 ? 'Gliederung & Suche' : 'Im Gesetz suchen'}
              </button>
              {ansichtMenuPane && (
                <span className="shrink-0 inline-flex rounded-md border border-line bg-paper px-2 py-1 shadow-sm">{ansichtMenuPane}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2-Spalten (Gliederungs-Sidebar links, Inhalt rechts) ab lg (1024px, R2) —
          darunter (mobil / sehr schmale Fenster) bekommt der Normtext die volle
          Spaltenbreite, die Gliederung sitzt als einklappbarer Drawer (wie mobil).
          So frisst die feste 16rem-TOC-Spalte erst, wenn genug Breite da ist —
          deckungsgleich mit der App-Seitenleiste (lg). Reine Darstellung (§3). */}
      {/* Unter xl: Suche + Gliederung als Overlay-Drawer (analog Seitenleiste),
          NUR auf Wunsch über den sticky ☰-Knopf geöffnet (Auftrag David 25.6.2026)
          — so liegt keine zweite Dauer-Bar unter dem Reiter-Streifen. Die Suche
          steht oben, darunter (falls vorhanden) der Gliederungsbaum; Sektionswahl
          schliesst den Drawer (springeZuSektion). */}
      {!istXl && tocAuf && (() => {
        // Im Pane in die Overlay-Schicht portalieren + `absolute` (vom relative-
        // Wrapper eingefangen) → der Drawer bleibt IM Pane statt als `position:fixed`
        // über beide Panes zu quellen (container-type fängt fixed nicht). Ausserhalb
        // unverändert `fixed` an den Viewport (byte-gleich).
        const ziel = (imPane && overlayWurzel?.current) || null;
        const inPane = ziel != null;
        const drawer = (
          <>
            <div className={inPane ? 'pointer-events-auto absolute inset-0 z-40 bg-ink-900/30' : `fixed inset-0 z-40 bg-ink-900/30 ${imPane ? '' : 'lg:hidden'}`}
              onClick={() => setTocAuf(false)} aria-hidden />
            {/* Kompakt (Wunsch David): begrenzte Höhe, fixer Such-Kopf, NUR der
                Gliederungsbaum scrollt darunter → verdeckt die Trefferliste nicht.
                In der Einzelansicht beginnt er UNTER dem Inhalts-Kopf (Topbar 4rem
                + Kopf 2.25rem); im Pane in der Overlay-Schicht ab dessen Oberkante. */}
            <div ref={tocDrawerRef} tabIndex={-1} role="dialog" aria-modal={inPane ? undefined : true} aria-label="Suche & Gliederung"
              className={`${inPane ? 'pointer-events-auto absolute inset-x-0 top-0 z-50 max-h-[75%]' : `fixed inset-x-0 z-50 max-h-[60vh] ${imPane ? '' : 'lg:hidden'}`} flex flex-col bg-paper-raised border-b border-line shadow-lg`}
              style={inPane ? undefined : { top: 'calc(4rem + 2.25rem)' }}>
              <div className="shrink-0 border-b border-line bg-paper-raised">
                <div className="flex items-center justify-between px-4 pt-2.5 pb-1.5">
                  <p className="lc-overline">{sektionen.length > 0 ? 'Suche & Gliederung' : 'Im Gesetz suchen'}</p>
                  <button type="button" onClick={() => setTocAuf(false)} className="text-micro text-ink-500 hover:text-brass-700">✕ schliessen</button>
                </div>
                <div className="flex items-center gap-2 px-4 pb-2.5">{sucheEingabe}</div>
              </div>
              {sektionen.length > 0 && <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2 [scrollbar-width:thin]">{tocBaumEl}</div>}
            </div>
          </>
        );
        return ziel ? createPortal(drawer, ziel) : drawer;
      })()}

      {/* 2-Spalten-Gliederung: ab `istXl` — im Pane container-breitenabhängig
          (ResizeObserver), sonst viewport-xl. istXl treibt die Klassen direkt
          (kein xl:-Prefix), damit ein BREITES Pane denselben Aufbau wie der
          Einzelbildschirm bekommt. */}
      <div className={istXl && sektionen.length > 0 && tocOffen ? 'grid grid-cols-[16rem_minmax(0,1fr)] gap-8' : ''}>
        {/* TOC-Spalte (Suche + Gliederungsbaum, sticky). Nur wenn istXl; darunter
            Overlay-Drawer (oben) über den sticky ☰-Knopf. Im schmalen Pane: Drawer. */}
        {istXl && sektionen.length > 0 && (
          <aside
            style={imPane
              // Im Pane: an die SICHTBARE Pane-Höhe binden (Topbar 4rem + PaneKopf
              // 2.25rem ab), nicht an die indefinite Grid-Zeile (calc(100%) löste
              // gegen content-Höhe → kein interner Scroll, sticky brach).
              ? { top: '0.5rem', maxHeight: 'calc(100dvh - 4rem - 2.25rem - 1rem)' }
              : { top: 'calc(4rem + 2.25rem + 0.75rem)', maxHeight: 'calc(100vh - 4rem - 2.25rem - 1.5rem)' }}
            className={`mb-0 sticky flex-col ${tocOffen ? 'flex' : 'hidden'}`}>
            {zweiSpalten && (
              <div data-such-bar className="mb-3 shrink-0">
                <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-1.5 shadow-sm">
                  {sucheEingabe}
                  {/* A34: im BREITEN Split-View-Pane (2-Spalten) trägt die sticky
                      TOC-Sub-Bar das Ansicht-Menü — die Such-Bar oben entfällt hier. */}
                  {ansichtMenuPane && <span className="shrink-0">{ansichtMenuPane}</span>}
                </div>
              </div>
            )}
            <div className="mb-2 flex items-baseline justify-between shrink-0">
              <p className="lc-overline">Gliederung</p>
              <button type="button" onClick={() => setTocOffen((v) => !v)} className="text-micro text-ink-500 hover:text-brass-700" title="Gliederung ein-/ausklappen">{tocOffen ? '‹ einklappen' : 'ausklappen ›'}</button>
            </div>
            <div data-toc className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
              {tocBaumEl}
            </div>
          </aside>
        )}

        {/* Lesespalte: hart auf die Lese-Token-Breite `max-w-reading` (40rem ≈
            66–71 ch) begrenzt — die EINE Lesespalte gilt für alle Grundarten
            (W2·5d G1 / DESIGN-REGLEMENT-NORMTEXT §Typo-Skala, R2: keine arbitrary
            max-w mehr). Im 2-Spalten-Fall (istXl) trägt die innere ArtikelBody-
            Spalte (parts.tsx, ebenfalls max-w-reading) die Begrenzung; darunter
            zentriert die ganze Spalte auf max-w-reading. */}
        <div className={`group/lese ${sektionen.length > 0 && tocOffen ? (istXl ? 'w-full' : 'mx-auto w-full max-w-reading') : 'mx-auto w-full max-w-reading'}`}>
          {/* A27 (David 12.7.2026): der Sticky Section-Kontextkopf «Titel › … ›
              Art. N › ⧉ Zitat» ist ENTFERNT. Seit A26 (#198) trägt der immer
              sichtbare Inhalts-Kopf (InhaltsKopf, Brotkrümel + Live-Artikel) die
              Orientierung; der tiefe In-Erlass-Gliederungspfad war für David
              «nicht notwendig». Die «Zitat kopieren»-Aktion bleibt vollständig
              erhalten — sie steht (identisches baueZitat-Voll-Zitat) je Artikel in
              der Artikelnummer-Zeile (ArtikelLeser). §15 Funktions-Treue gewahrt. */}
          {treffer ? (
            <div className="space-y-4">
              <p className="text-body-s text-ink-500"><span className="num">{treffer.length}</span> Treffer für «{sucheDebounced.trim()}»</p>
              {treffer.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={struktur?.[e.artikel]?.marginalie} imTreffer onSpringe={springeZuArtikel} leitfaelle={leitfaelleFuer(e.artikel)} revision={revisionFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />)}
              {treffer.length === 0 && <p className="text-body-s text-ink-500">Kein Artikel gefunden.</p>}
            </div>
          ) : (
            <div className="space-y-2">
              {ohneGliederung.length > 0 && (
                <div className="space-y-5 mb-6">
                  {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} leitfaelle={leitfaelleFuer(e.artikel)} revision={revisionFuer(e.artikel)} istAnhang={istAnhangToken(e.artikel)} />)}
                </div>
              )}
              {sektionen.map((s) => renderSektion(s, true, 0))}
            </div>
          )}

          {/* Einheitliches Kontext-Panel (B3): Entscheide/Materialien/Werkzeuge zu
              diesem Erlass am Leseende — Norm ↔ Entscheid ↔ Material ↔ Werkzeug an
              einer Stelle (Burggraben). Lädt die Entscheide selbst (Single Source, §5). */}
          <KontextPanel typ="norm" normKeys={[erlass.key]} />

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
