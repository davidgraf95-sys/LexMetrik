import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { naechsteInstanz, merkeTab, aktualisiereTabArtikel } from '../../lib/tabs';
import { aktiverArtikel } from '../../lib/normtext/aktuellerArtikel';
import { useDialogFokus } from '../../components/layout/useDialogFokus';
import { usePaneKontext } from '../../components/layout/PaneKontext';
import { useMeldeInhaltsKopf } from '../../components/layout/InhaltsKopfKontext';
import type { InternRefs } from '../../components/NormText';
import { trenneAenderungshistorie, labelMitBereich, randtitelKnoten } from '../../lib/normtext/darstellung';
import {
  ladeBrowseManifest, ladeErlass, ladeErlassDatei, ladeStruktur, ladeErlassKopf, ladeKantonSystematik,
  baueGliederungsbaum, type Sektion, type StrukturMap, type ErlassKopf,
} from '../../lib/normtext/browse';
import { sachgruppe, topTitel, type KantonSystematik } from '../../lib/normtext/systematik';
import { GEBIET_LABEL } from '../../lib/normtext/register';
import { KontextPanel } from '../../components/kontext/KontextPanel';
import type { BrowseErlass, BrowseManifest } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { formatiereDatum, passtAufSuche, pfadZu } from './helpers';
import { ArtikelLeser, SektionKopf, SektionBaumTOC, ErlassKopfBlock } from './parts';

// ─── Pane-Scoping-Helfer (B-2.5) — MODUL-Ebene = referenzstabil ────────────
// Bewusst KEIN React Compiler im Projekt → in-Komponente definierte Funktionen
// hätten je Render neue Identität und würden Effekte (IntersectionObserver,
// Hash-Sprung) bei jedem Render neu auslösen (Re-Render-/Scroll-Schleife). Als
// Modulfunktionen sind sie stabil und nicht Teil der Effect-Deps (nur die
// Primitiven `imPane` + die Ref `wurzel` zählen).
function paneRoot(imPane: boolean, wurzel: RefObject<HTMLElement | null> | null): HTMLElement | null {
  return imPane ? wurzel?.current ?? null : null;
}
function findeArt(root: HTMLElement | null, token: string): HTMLElement | null {
  if (!root) return document.getElementById(`art-${token}`);
  // CSS.escape: ein präparierter #hash-Token (z. B. mit «"]») darf den Selektor
  // nicht sprengen. getElementById (document-Pfad) ist ohnehin selektor-frei.
  const id = `art-${token}`;
  return root.querySelector(`#${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id}`);
}

export function GesetzLeserInhalt({ ebene, schluessel }: { ebene: string; schluessel: string }) {
  const basisPfad = `/gesetze/${ebene}/${encodeURIComponent(schluessel)}`;
  const navigate = useNavigate();
  const location = useLocation();
  const [erlass, setErlass] = useState<BrowseErlass | null>(null);
  const [eintraege, setEintraege] = useState<NormSnapshot[] | null>(null);
  const [struktur, setStruktur] = useState<StrukturMap | null>(null);
  const [kopf, setKopf] = useState<ErlassKopf | null>(null);
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
  const [istXlVp, setIstXlVp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const upd = () => setIstXlVp(mq.matches);
    upd();
    mq.addEventListener('change', upd);
    return () => mq.removeEventListener('change', upd);
  }, []);
  const { imPane, rolle, wurzel, overlayWurzel } = usePaneKontext();
  // Split-View E (Container-responsiv): ein Pane wählt sein Layout nach SEINER
  // Breite, nicht nach dem Viewport. `istXl` (treibt 2-Spalten-Gliederung + Drawer-
  // vs-Sidebar) kommt im Pane aus einem ResizeObserver auf der Pane-Wurzel (Schwelle
  // PANE_BREIT_PX), sonst unverändert aus matchMedia (1280px) → Nicht-Pane byte-gleich.
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
  const [fussnotenAuf, setFussnotenAuf] = useState(false); // Fussnoten nur auf Wunsch
  // M3: Gruppierungslinien (vertikale Schachtelungslinie je Sektion) — pro Gesetz
  // an/aus, zustandslos (component-local useState wie fussnotenAuf; jeder Pane
  // eigener Zustand). Default AN, damit jedes Gesetz seine Section-Schachtelung
  // sichtbar nestet (Parität ZGB/OR ↔ Teil/Titel/Abschnitt-Gesetze).
  const [gruppierungslinienAn, setGruppierungslinienAn] = useState(true);
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

  useEffect(() => {
    let lebt = true;
    void ladeBrowseManifest().then((m) => { if (lebt) setManifest(m); });
    void ladeStruktur(ebene, schluessel).then((s) => { if (lebt) setStruktur(s); });
    void ladeErlassKopf(ebene, schluessel).then((k) => { if (lebt) setKopf(k); });
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
    if (istSekundaer) return; // sekundäres Pane treibt den Browser-Tab-Titel nicht (B-2.5)
    const kurz = erlass.titel.match(/\(([^)]+)\)\s*$/)?.[1] ?? erlass.titel;
    document.title = `${erlass.kuerzel} (${kurz}) — LexMetrik`;
  }, [erlass, istSekundaer]);

  // A/A2/A3/F: Kopf melden (Breadcrumb Gesetze › Ebene › Kürzel · Stand · aktueller
  // Artikel). Wird vom NÄCHSTEN Provider gefangen: Einzelansicht → Inhalts-Kopf
  // (Shell); Split-View → der jeweilige PaneKopf (SekundaerPane bzw. primär Shell).
  // Live-Artikel kommt aus dem IntersectionObserver.
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
    });
  }, [erlass, aktArtikel, meldeInhaltsKopf]);
  // Beim Verlassen den Kopf räumen (Shell setzt bei Routenwechsel ohnehin zurück).
  useEffect(() => () => meldeInhaltsKopf(null), [meldeInhaltsKopf]);

  const { sektionen, ohneGliederung } = useMemo(
    () => (eintraege ? baueGliederungsbaum(eintraege, struktur) : { sektionen: [], ohneGliederung: [] }),
    [eintraege, struktur],
  );

  // Dokument-Position (Index des ersten enthaltenen Artikels) je Sektion — EINMAL
  // bottom-up berechnet, damit renderSektion die Kinder + direkten Artikel eines
  // Knotens in Dokument-Reihenfolge mischen kann, ohne pro Scroll-Render erneut den
  // Teilbaum zu durchlaufen (6b: Knoten tragen seit der Randtitel-Promotion oft
  // beides). Reine Darstellung (§3).
  const sekPos = useMemo(() => {
    const pos = new Map<string, number>();
    const artPos = new Map<string, number>();
    (eintraege ?? []).forEach((e, i) => artPos.set(e.artikel, i));
    const walk = (s: Sektion): number => {
      let min = Infinity;
      for (const a of s.artikel) min = Math.min(min, artPos.get(a.artikel) ?? Infinity);
      for (const k of s.kinder) min = Math.min(min, walk(k));
      pos.set(s.id, min);
      return min;
    };
    for (const s of sektionen) walk(s);
    return pos;
  }, [sektionen, eintraege]);

  // Dokument-Position je Artikel-Token (für den Artikel-Bereich «Art. 1–10» in den
  // Sektionsüberschriften).
  const artIndex = useMemo(() => {
    const map = new Map<string, number>();
    (eintraege ?? []).forEach((e, i) => map.set(e.artikel, i));
    return map;
  }, [eintraege]);

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
      el.scrollIntoView({ block: 'center', behavior: 'auto' });
      el.classList.add('lc-ziel-blink');
      window.setTimeout(() => el.classList.remove('lc-ziel-blink'), 2400);
    };
    window.requestAnimationFrame(() => window.setTimeout(() => {
      scrolle();
      window.setTimeout(() => { scrolle(); jumpLock.current = false; }, 400);
    }, 110));
  }, [sektionen, basisPfad, istSekundaer, imPane, wurzel]);

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
    const war = sucheVorher.current;
    sucheVorher.current = suche;
    if (typeof window === 'undefined') return;
    // Im Pane scrollt der Pane-Container, nicht das Fenster (B-2.5).
    const sc = paneRoot(imPane, wurzel);
    const hole = () => sc ? sc.scrollTop : window.scrollY;
    const setze = (y: number) => sc ? sc.scrollTo(0, y) : window.scrollTo(0, y);
    if (!war && suche) {
      scrollVorSuche.current = hole();
      window.requestAnimationFrame(() => setze(0));
    } else if (war && !suche && scrollVorSuche.current != null) {
      const y = scrollVorSuche.current;
      scrollVorSuche.current = null;
      window.requestAnimationFrame(() => setze(y));
    }
  }, [suche, imPane, wurzel]);

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
    if (istSekundaer) return; // sekundäres Pane: kein eigener #hash (pfad ist anker-frei), nie Haupt-URL lesen
    const m = window.location.hash.match(/^#art-(.+)$/);
    if (!m) return;
    // Deep-Link mit Artikel-Anker → aktiven Reiter darauf melden (Live-Label).
    aktualisiereTabArtikel(window.location.pathname + window.location.search + window.location.hash);
    const token = decodeURIComponent(m[1]);
    const ids = pfadZu(sektionen, (s) => s.artikel.some((e) => e.artikel === token)) ?? [];
    window.requestAnimationFrame(() => {
      if (ids.length) oeffnePfad(ids);
      window.setTimeout(() => {
        const el = findeArt(paneRoot(imPane, wurzel), token);
        el?.scrollIntoView({ block: 'center', behavior: 'auto' });
        el?.classList.add('lc-ziel-blink');
        window.setTimeout(() => el?.classList.remove('lc-ziel-blink'), 2400);
      }, 110);
    });
  }, [eintraege, sektionen, istSekundaer, imPane, wurzel]);

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
      // Mittelpunkt im Viewport-Koordinatensystem (getBoundingClientRect): im Pane
      // die Pane-Mitte, sonst die Fenster-Mitte (B-2.5).
      const sc = paneRoot(imPane, wurzel);
      const mitte = sc ? sc.getBoundingClientRect().top + sc.clientHeight / 2 : window.innerHeight / 2;
      const rects = [...sichtbar.values()]
        .filter((en) => en.isIntersecting)
        .map((en) => {
          const r = en.target.getBoundingClientRect();
          return { token: (en.target as HTMLElement).id.replace(/^art-/, ''), top: r.top, bottom: r.bottom };
        });
      const token = aktiverArtikel(rects, mitte);
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
    }, { root: paneRoot(imPane, wurzel), rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    // Alle aktuell gerenderten Artikel beobachten — im Pane nur die DIESES Panes
    // (B-2.5: sonst beobachtet der Spy auch das andere Pane → falsches Live-Label).
    // Auf-/Zuklappen (offen) und Suche (suche) verändern die DOM-Artikelmenge → Effekt
    // läuft über die Deps neu und beobachtet die dann sichtbaren Artikel.
    (paneRoot(imPane, wurzel) ?? document).querySelectorAll('[id^="art-"]').forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      if (tabArtikelTimer.current != null) window.clearTimeout(tabArtikelTimer.current);
      if (aktArtikelTimer.current != null) window.clearTimeout(aktArtikelTimer.current);
    };
  }, [sektionen, ohneGliederung, basisPfad, offen, suche, istSekundaer, imPane, wurzel]);

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
    const aktive = cont.querySelectorAll('[data-toc-aktiv]');
    const el = aktive[aktive.length - 1] as HTMLElement | undefined;
    if (!el) return;
    const cr = cont.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    if (er.top < cr.top + 8 || er.bottom > cr.bottom - 8) {
      cont.scrollTo({ top: cont.scrollTop + (er.top - cr.top) - cr.height / 2, behavior: 'smooth' });
    }
  }, [aktivIds, tocBaum, imPane, wurzel]);

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
        {/* Breadcrumb trägt der Kopf (Inhalts-Kopf bzw. PaneKopf) — kein Inline-Dup. */}
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
        {/* M5: Erlass-Kopf-Slot auch im pdf-embed-Pfad (für PDF-Erlasse ohne
            Struktur-Sidecar bleibt kopf=null → nichts gerendert). */}
        {kopf && <ErlassKopfBlock kopf={kopf} fussnotenAuf={false} />}
        {/* Eingebettetes amtliches PDF (same-origin → Browser-Viewer mit nativer
            Suche/Zoom/Druck). iframe ist für Inline-PDF am zuverlässigsten; darunter
            ein sichtbarer Fallback-Link für Browser ohne PDF-Viewer. */}
        <iframe src={`/normtext/${erlass.pdfPfad}#view=FitH`} title={`${erlass.kuerzel} — amtliches PDF`}
          className="w-full rounded-lg border border-line bg-paper-sunken/30"
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
  // Randtitel-promotete Knoten (s.randtitel) bekommen einen ruhigen Einzug-Strich,
  // damit die Buchstaben-/Ziffern-Gruppierung als Verschachtelung lesbar bleibt.
  // Ein Knoten kann seit 6b DIREKTE Artikel UND Unter-Knoten tragen (z. B.
  // «II. Handlungsfähigkeit» enthält Art. 12 direkt und die Untergruppe
  // «2. Voraussetzungen») — beide werden in Dokument-Reihenfolge gemischt.
  const renderSektion = (s: Sektion, defOpen: boolean, tiefe: number): ReactNode => {
    const auf = istOffen(s.id, defOpen);
    // Kinder + direkte Artikel in EINER nach Dokument-Position sortierten Liste.
    const inhalt = auf
      ? [
          ...s.kinder.map((k) => ({ pos: sekPos.get(k.id) ?? Infinity, el: renderSektion(k, true, tiefe + 1) })),
          ...s.artikel.map((e) => ({
            pos: artIndex.get(e.artikel) ?? 0,
            el: <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} fussnotenAuf={fussnotenAuf} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} />,
          })),
        ].sort((a, b) => a.pos - b.pos)
      : [];
    // M3: Gruppierungslinie aus der Section-Schachtelung — vertikale Linie + Einzug
    // für JEDE geschachtelte Sektion (tiefe > 0), unabhängig vom Typ (offizielle
    // Teil/Titel/Abschnitt-Gliederung UND Randtitel-Gruppen). Die WURZEL (tiefe 0)
    // bleibt bündig (kein Voll-Dokument-Einzug). An/Aus über den Umschalter; aus =
    // flach (nur die horizontalen Sektions-Trennlinien in SektionKopf bleiben).
    const linie = gruppierungslinienAn && tiefe > 0;
    return (
      <section key={s.id} className={`space-y-3 ${linie ? 'border-l border-line/60 pl-3' : ''}`}>
        <SektionKopf s={s} refCb={regRef(s.id)} offen={auf} onToggle={() => toggle(s.id, defOpen)} bereich={sekBereich(s)} bereichEinzel={sammleArtikel(s).length === 1} fussnotenAuf={fussnotenAuf} />
        {auf && <div className="space-y-5">{inhalt.map((x) => x.el)}</div>}
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
      {/* Breadcrumb trägt seit A/F der Kopf: Einzelansicht → Inhalts-Kopf, Split-View
          → PaneKopf. Kein zweiter Inline-Breadcrumb mehr (sonst Dopplung im Pane). */}
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
          {/* M3 (Auftrag David): Gruppierungslinien-Umschalter oben AM GESETZ (nicht
              bei der Suche/Fussnoten). Zustandslos (je Pane eigen), nur wenn das
              Gesetz überhaupt geschachtelt ist. */}
          {sektionen.length > 0 && (
            <button type="button" onClick={() => setGruppierungslinienAn((v) => !v)} aria-pressed={gruppierungslinienAn}
              className={`lc-chip hover:text-brass-700 ${gruppierungslinienAn ? 'text-brass-700' : ''}`}
              title="Gliederungs-/Gruppierungslinien ein- oder ausblenden" aria-label="Gruppierungslinien ein- oder ausblenden">{gruppierungslinienAn ? '✓ Linien' : '⊟ Linien'}</button>
          )}
          <span className="basis-full sm:basis-auto sm:ml-auto text-micro text-ink-500">Snapshot — massgeblich ist die amtliche Fassung</span>
        </div>
      </header>

      {/* M5: Erlass-Kopf (Ingress/Erlassformel bzw. materielle Präambel + Erlass-
          datum + Kopf-Fussnoten) — Fedlex-Fundiertheits-Floor (§2), bisher verworfen. */}
      {kopf && <ErlassKopfBlock kopf={kopf} fussnotenAuf={fussnotenAuf} />}

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
      {!istXl && tocAuf && (() => {
        // Im Pane in die Overlay-Schicht portalieren + `absolute` (vom relative-
        // Wrapper eingefangen) → der Drawer bleibt IM Pane statt als `position:fixed`
        // über beide Panes zu quellen (container-type fängt fixed nicht). Ausserhalb
        // unverändert `fixed` an den Viewport (byte-gleich).
        const ziel = (imPane && overlayWurzel?.current) || null;
        const inPane = ziel != null;
        const drawer = (
          <>
            <div className={inPane ? 'pointer-events-auto absolute inset-0 z-40 bg-ink-900/30' : `fixed inset-0 z-40 bg-ink-900/30 ${imPane ? '' : 'xl:hidden'}`}
              onClick={() => setTocAuf(false)} aria-hidden />
            {/* Kompakt (Wunsch David): begrenzte Höhe, fixer Such-Kopf, NUR der
                Gliederungsbaum scrollt darunter → verdeckt die Trefferliste nicht.
                In der Einzelansicht beginnt er UNTER dem Inhalts-Kopf (Topbar 4rem
                + Kopf 2.25rem); im Pane in der Overlay-Schicht ab dessen Oberkante. */}
            <div ref={tocDrawerRef} tabIndex={-1} role="dialog" aria-modal={inPane ? undefined : true} aria-label="Suche & Gliederung"
              className={`${inPane ? 'pointer-events-auto absolute inset-x-0 top-0 z-50 max-h-[75%]' : `fixed inset-x-0 z-50 max-h-[60vh] ${imPane ? '' : 'xl:hidden'}`} flex flex-col bg-paper-raised border-b border-line shadow-lg`}
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

        {/* Lesespalte: ohne 2-Spalten-Sidebar zentriert + auf ~56rem begrenzt.
            Im 2-Spalten-Fall greift die Begrenzung erst ab xl über das Grid; darunter
            (lg–xl, geteilter Bildschirm) bleibt der Text zentriert + auf eine
            komfortable Lesebreite begrenzt, statt die volle Inhaltsbreite zu füllen. */}
        <div className={`group/lese ${sektionen.length > 0 && tocOffen ? (istXl ? 'w-full' : 'mx-auto w-full max-w-[52rem]') : 'mx-auto w-full max-w-[56rem]'}`}>
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
                  {ohneGliederung.map((e) => <ArtikelLeser key={e.id} e={e} erlass={erlass} basisPfad={basisPfad} fussnoten={fn(e.artikel)} fussnotenAuf={fussnotenAuf} intern={internRefs} marg={margAnzeige.get(e.artikel)?.teile} margBasis={margAnzeige.get(e.artikel)?.ab} />)}
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
