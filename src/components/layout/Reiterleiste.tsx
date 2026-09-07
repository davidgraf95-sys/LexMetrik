import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTabs } from './useTabs';
import {
  schliesseTab, leereTabs, ordneTabsUm, tabSchluessel, type TabEintrag,
  neuerLeererReiter, schliesseAndere, schliesseRechtsVon,
  stelleLetztenWiederHer, letzterGeschlossener, naechsteInstanz, merkeTab,
  // ── R3 (Prüfbefund R11, 6.9.2026) · EINE KURZFORM, EIN TITEL (§5) ────────
  // Beide Ableitungen wohnten bis hierher IN dieser Datei — das Überlauf-Blatt
  // (`TabPanel`) baute daneben seine eigene Beschriftung aus `verlaufLabel`
  // und trug darum den Volltitel, wo die Leiste die Kurzform zeigte. Jetzt
  // stehen sie in `lib/tabs` und beide Flächen lesen dieselbe Quelle.
  reiterKurzformTeile, reiterKurzformText, reiterTitel,
} from '../../lib/tabs';
import { verlaufLabel, type VerlaufManifeste } from '../../lib/verlaufLabel';
import { reiterKategorie } from '../../lib/tabGruppen';
import { registerVonPfad, REG_FLAECHE, REG_TON } from './bereiche';
import { SchliessKnopf } from '../ui/SchliessKnopf';
import { Leerzustand } from '../ui/Leerzustand';
// ── §15 · AUCH DAS ÜBERLAUF-BLATT ERST BEIM ÖFFNEN ─────────────────────────
// Dieselbe Überlegung wie beim Kontextmenü unten, und dieselbe Messung: das
// Blatt rendert ausschliesslich im Portal hinter `blattOffen`, zieht aber mit
// `TabPanel` die ganze Gruppier-Achse (`lib/tabGruppen`, `HerkunftIcon`) in
// den Start-Chunk. Wer nie auf «+N» klickt — die Mehrheit —, lädt sie
// umsonst. Logikverlust: keiner, dieselbe Komponente, nur später.
const TabPanel = lazy(() => import('./TabPanel').then((m) => ({ default: m.TabPanel })));
import { useDialogFokus } from './useDialogFokus';
import { usePaneSteuerung } from './usePaneLayout';
// ── §15 · DAS KONTEXTMENÜ GEHÖRT NICHT IN DEN START-CHUNK ──────────────────
// GEMESSEN 6.9.2026 (`npm run check:perf-budget`, gebautes dist/): mit einem
// statischen Import stieg der Entry-Chunk von 59.7 KB auf 61.3 KB gzip und
// riss das 60-KB-Budget — das Menü zieht `ui/Menue` mit, das sonst nur die
// (lazy geladene) Leser-Fläche braucht. Es erscheint frühestens beim ersten
// Rechtsklick; bis dahin kostet es nichts. Fallback `null`: es gibt nichts zu
// zeigen, solange nichts geöffnet ist, und ein Platzhalter unter dem Zeiger
// wäre schlechter als das Menü einen Wimpernschlag später.
// LOGIKVERLUST-BEWERTUNG (§15): keiner — dieselbe Komponente, dieselben
// Aktionen, nur später geladen. Die Reiter-Mechanik selbst (`lib/tabs`) bleibt
// im Entry, wo sie hingehört.
const ReiterMenue = lazy(() => import('./ReiterMenue').then((m) => ({ default: m.ReiterMenue })));
import type { ReiterMenueEintrag } from './ReiterMenue';

// ─── Arbeitsleiste: die offenen Reiter, sichtbar (W2·24 §5a, Wunsch David) ───
//
// «analog zum browser die offenen tabs oben anstatt mit dem drei linien drop
// down» (David 6.9.2026). Ersetzt `ReiterUebersicht` (☰-Trigger + Flyout) —
// die Datei ist mit diesem Schritt gelöscht, ihr Flyout-Inhalt (`TabPanel`)
// lebt hier im Überlauf-Blatt weiter.
//
// ZWEITE ZEILE, ZWEITE BEDEUTUNG (§5a Ziff. 1): die Titelblatt-Zeile darüber
// führt BEREICHE (unterstrichener Text, keine Fläche, kein ✕), diese Leiste
// führt DOKUMENTE (Reiter mit Registerfarben-Strich und ✕). Damit man die
// beiden nicht verwechselt, sind sie optisch verschieden gebaut.
//
// KEINE neue Reiter-Mechanik (§3/§5): Liste, Reihenfolge, Umsortieren,
// Schliessen und die Persistenz kommen unverändert aus `lib/tabs.ts`
// (localStorage `lexmetrik-tabs`, Pfad INKLUSIVE `#art-…`-Anker — die
// Lesestellung überlebt den Neustart also schon heute, §5a Ziff. 6).

/** Wie viele Reiter höchstens NEBENEINANDER stehen; der Rest zieht in das
 *  «+N»-Blatt. Zahl aus §5a Ziff. 5 («Überlauf ab ~8 Reitern»). Der aktive
 *  Reiter ist von der Kappung ausgenommen — er ist immer im Bild. */
const SICHTBAR_MAX = 8;
/** Ab dieser Zahl bietet die schmale Ansicht zusätzlich den «N offen»-Knopf
 *  an (§5a Ziff. 8). */
const MOBIL_BLATT_AB = 3;
/** Eigener MIME-Typ für das Ziehen eines Reiters in ein Pane (§5a Ziff. 4).
 *  `dragover` darf die Nutzlast nicht lesen, nur die Typen — darum ein eigener
 *  Typ statt einer Inhaltsprüfung auf `text/plain`. */
export const REITER_MIME = 'application/x-lexmetrik-reiter';

export function Reiterleiste({ paneSchluessel = [] }: {
  /** Reiter-Schlüssel der offenen Panes in Fenster-Ordnung (0 = links/Haupt).
   *  Daraus zeichnet die Leiste die Aktiv-Marken «links»/«rechts» (§5a Ziff. 4). */
  paneSchluessel?: string[];
}) {
  const tabs = useTabs();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { oeffneDaneben, kannOeffnen, istOffen, schliessePane } = usePaneSteuerung();
  const [manifeste, setManifeste] = useState<VerlaufManifeste>({});
  const [blattOffen, setBlattOffen] = useState(false);
  const [suche, setSuche] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const blattRef = useRef<HTMLDivElement>(null);
  const leisteRef = useRef<HTMLDivElement>(null);
  /** Die scrollende Reiter-Fläche selbst — Ziel des Mausrads (M6) und Anker
   *  für den Doppelklick auf den Leerraum. */
  const streifenRef = useRef<HTMLDivElement>(null);
  /** Offenes Reiter-Kontextmenü (M4): welcher Reiter, an welcher Stelle. */
  const [menue, setMenue] = useState<{ path: string; x: number; y: number } | null>(null);
  const gezogen = useRef<string | null>(null);
  /** Gezogener Reiter als STATE (nicht nur Ref): der Reiter unter dem Zeiger
   *  soll sich während des Zugs sichtbar zurücknehmen — dafür braucht es ein
   *  Re-Render. Die Ref bleibt daneben, weil `dragover`/`drop` sie SYNCHRON
   *  lesen müssen (ein State-Wert wäre im selben Ereignis noch der alte). */
  const [zieht, setZieht] = useState<string | null>(null);
  /** Wo die Einfügemarke steht: an welchem Reiter, und auf welcher Seite.
   *  Die Seite kommt aus dem Zeiger-X über der Ziel-Hälfte (D15). */
  const [ueber, setUeber] = useState<{ path: string; davor: boolean } | null>(null);

  // Reader-Labels (Gesetz/Entscheid) aus den ohnehin lazy ladbaren Manifesten —
  // Muster und Bedingung wörtlich aus der abgelösten `ReiterUebersicht`.
  //
  // M2 (6.9.2026): dasselbe Muster jetzt DREIMAL — Materialien tragen seit
  // `lib/tabs.istReiterPfad` einen eigenen Reiter, und ohne ihr Manifest hiesse
  // er «Material öffnen», also eine Aufforderung statt eines Namens
  // (Prüfbefund R11 #24). Die `brauchtX`-Bedingung bleibt die Eintrittskarte:
  // `/materialien/register.json` wird NUR geladen, wenn wirklich ein
  // Material-Reiter offen ist — kein dritter Download in der Kopfzone auf
  // Vorrat (§15; `check:perf-budget` misst es).
  useEffect(() => {
    const brauchtG = tabs.some((t) => reiterKategorie(t.path) === 'gesetze');
    const brauchtE = tabs.some((t) => reiterKategorie(t.path) === 'rechtsprechung');
    const brauchtM = tabs.some((t) => reiterKategorie(t.path) === 'materialien');
    if (!brauchtG && !brauchtE && !brauchtM) return;
    let lebt = true;
    void (async () => {
      const [g, ent, mat] = await Promise.all([
        brauchtG ? import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()).catch(() => null) : Promise.resolve(null),
        brauchtE ? import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()).catch(() => null) : Promise.resolve(null),
        brauchtM ? import('../../lib/materialien/browse').then((m) => m.ladeMaterialManifest()).catch(() => null) : Promise.resolve(null),
      ]);
      if (lebt) setManifeste((alt) => ({
        gesetze: g ?? alt.gesetze ?? null,
        entscheide: ent ?? alt.entscheide ?? null,
        materialien: mat ?? alt.materialien ?? null,
      }));
    })();
    return () => { lebt = false; };
  }, [tabs]);

  const aktivSchluessel = tabSchluessel(pathname + search);

  // ── D16 (David 6.9.2026) · DIE LEISTE ZEIGT DEN SPEICHER, SONST NICHTS ────
  //
  // Hier stand bis zum Fixer 1c eine ZWEITE Ordnung: die Reiter wurden nach
  // `KAT_ORDER` gebündelt und innerhalb «gesetze» nach `HERKUNFT_ORDER` —
  // dieselbe Gruppierung wie im Überlauf-Blatt (`TabPanel`). Der Gedanke war
  // «eine App, eine Ordnung». Gemessen war die Folge das Gegenteil:
  // `lib/tabs.ordneTabsUm` verschiebt den FLACHEN Speicher, und jede
  // Verschiebung über eine Kategoriegrenze sammelte das Bucketing sofort wieder
  // ein. David 6.9.2026: «es geht nur wenn nur gesetze offen sind — bug»
  // (nachgestellt über acht Kombinationen, `e2e/w224-reiter-umordnen-d16`).
  //
  // ENTSCHEID (analog Browser): man ordnet, was man SIEHT. Die Arbeitsleiste
  // zeigt darum die reine Speicherreihenfolge. Die Gruppierung nach Art bleibt
  // dort, wo sie eine LISTE ordnet und niemand zieht — im Überlauf-Blatt.
  // Dass die beiden damit verschieden sortieren, ist kein Widerspruch, sondern
  // die Aufgabenteilung: die Leiste ist eine Arbeitsfläche, das Blatt ein
  // Verzeichnis.
  const ordnung = tabs;

  // ── Überlauf (§5a Ziff. 5) · NIE STILLES SCHLIESSEN ────────────────────────
  // Gekappt wird nur die SICHTBARKEIT, nie die Liste. Der aktive Reiter ist von
  // der Kappung ausgenommen: liegt er hinter der Grenze, rückt er auf den
  // letzten sichtbaren Platz — «der aktive Reiter ist im Bild» gilt auch, wenn
  // zwölf offen sind.
  const { sichtbar, versteckt } = useMemo(() => {
    if (ordnung.length <= SICHTBAR_MAX) return { sichtbar: ordnung, versteckt: [] as TabEintrag[] };
    const vorn = ordnung.slice(0, SICHTBAR_MAX);
    const hinten = ordnung.slice(SICHTBAR_MAX);
    const aktivHinten = hinten.findIndex((t) => tabSchluessel(t.path) === aktivSchluessel);
    if (aktivHinten === -1) return { sichtbar: vorn, versteckt: hinten };
    const getauscht = [...vorn.slice(0, SICHTBAR_MAX - 1), hinten[aktivHinten]];
    const rest = [vorn[SICHTBAR_MAX - 1], ...hinten.filter((_, i) => i !== aktivHinten)];
    return { sichtbar: getauscht, versteckt: rest };
  }, [ordnung, aktivSchluessel]);

  const schliessen = (path: string) => {
    // M1: steht dieser Reiter gerade in einem zweiten Fenster, geht das Fenster
    // mit — sonst zeigte es weiter ein Dokument, das die Leiste nicht mehr
    // führt (der gemessene P4-Zustand, nur rückwärts).
    schliessePane(path);
    const teil = tabSchluessel(path);
    if (aktivSchluessel === teil) {
      const idx = ordnung.findIndex((t) => tabSchluessel(t.path) === teil);
      const nachbar = ordnung[idx - 1] ?? ordnung[idx + 1];
      schliesseTab(path);
      navigate(nachbar ? nachbar.path : '/');
    } else schliesseTab(path);
  };

  // ── D19 (David 6.9.2026: «mit plus einen neuen reiter erzeugen können») ───
  // Der Browser-«+»: legt den (höchstens einen) leeren Reiter an bzw.
  // aktiviert den bestehenden (`lib/tabs.neuerLeererReiter` trägt die
  // Höchstens-einer-Regel), zeigt die Startseite und schickt den Fokus in die
  // Kopf-Suche — dieselbe global lauschende Geste wie der /gesetze-Landeplatz
  // (`lm:suche-fokus`, `HeaderSuche.tsx`); kein zweiter Fokus-Weg nötig.
  const neuerReiter = () => {
    neuerLeererReiter();
    navigate('/');
    window.dispatchEvent(new CustomEvent('lm:suche-fokus'));
  };

  // ── M3 · «ZULETZT GESCHLOSSEN» (Prüfbefund R11 #37) ───────────────────────
  // EIN Weg, drei Zugänge: Alt+Shift+T, der Eintrag im Reiter-Kontextmenü und
  // die Zeile im Überlauf-Blatt rufen alle diese Funktion. Sie stellt den
  // Reiter an seiner alten Position wieder her (`lib/tabs`) und geht dorthin —
  // wer wiederherstellt, will das Dokument sehen, nicht nur seinen Reiter.
  const stelleWiederHer = () => {
    const wieder = stelleLetztenWiederHer();
    if (wieder) navigate(wieder.path);
  };

  // ── Tastatur (§5a Ziff. 7) ────────────────────────────────────────────────
  // Alt+1…9 springt auf den n-ten Reiter der sichtbaren Ordnung. Zum SCHLIESSEN
  // ist es Alt+W und NICHT Ctrl/⌘+W: der Browser fängt Ctrl/⌘+W selbst ab und
  // schliesst sein eigenes Fenster — eine Belegung, die man nicht bekommen
  // kann, wäre eine Zusage, die nicht gilt (§8). §5a Ziff. 7 sieht genau diesen
  // Rückfall vor. Kein Eingriff, solange der Fokus in einem Eingabefeld steht.
  //
  // ── D15 · UMORDNEN OHNE MAUS: Alt+Shift+←/→ ───────────────────────────────
  // Ziehen ist eine Zeigergeste; sie allein zu bauen hiesse, das Umordnen für
  // Tastatur und Screenreader gar nicht anzubieten (WCAG 2.1.1). Alt+Shift ist
  // frei — Alt+Ziffer und Alt+W belegen die Leiste schon, Alt+←/→ OHNE Shift
  // gehört dem Browser (Verlauf zurück/vorwärts). KEIN UMLAUF am Rand: ein
  // Reiter, der am linken Ende gedrückt plötzlich rechts steht, ist verloren
  // statt verschoben.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      const a = document.activeElement as HTMLElement | null;
      if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return;
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const idx = ordnung.findIndex((t) => tabSchluessel(t.path) === aktivSchluessel);
        if (idx === -1) return;
        const links = e.key === 'ArrowLeft';
        const ziel = ordnung[idx + (links ? -1 : 1)];
        if (!ziel) { e.preventDefault(); return; }
        e.preventDefault();
        ordneTabsUm(ordnung[idx].path, ziel.path, links);
        return;
      }
      // ── M3 · ALT+SHIFT+T STELLT WIEDER HER ─────────────────────────────────
      // Browser-Idiom (dort Ctrl/⌘+Shift+T); Ctrl/⌘ fängt der Browser selbst
      // ab und stellt SEINEN Tab wieder her — dieselbe Lage wie bei Alt+W und
      // Alt+T, darum dieselbe Antwort: Alt statt Ctrl/⌘.
      if (e.shiftKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        stelleWiederHer();
        return;
      }
      if (e.shiftKey) return;
      if (/^[1-9]$/.test(e.key)) {
        const ziel = ordnung[Number(e.key) - 1];
        if (!ziel) return;
        e.preventDefault();
        navigate(ziel.path);
        return;
      }
      if (e.key.toLowerCase() === 'w') {
        const aktiv = ordnung.find((t) => tabSchluessel(t.path) === aktivSchluessel);
        if (!aktiv) return;
        e.preventDefault();
        schliessen(aktiv.path);
        return;
      }
      // ── D19 · NEUER REITER OHNE MAUS: Alt+T ─────────────────────────────────
      // Ctrl/⌘+T wäre die Browser-Erwartung, aber der Browser fängt sie selbst
      // ab und öffnet sein EIGENES Fenster (dieselbe Lage wie beim Schliessen,
      // Alt+W statt Ctrl/⌘+W oben) — eine Zusage, die man nicht bekommen kann.
      if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        neuerReiter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Aktiven Reiter ins Bild scrollen (§5a Ziff. 8, mobile Leiste).
  //
  // BEWUSST NICHT `scrollIntoView`: GEMESSEN 6.9.2026 (Preview, Chromium,
  // `/gesetze/bund/GEBV_HREG`) setzte der Aufruf den Startpunkt der
  // Tab-Reihenfolge des Dokuments auf den Reiter — der erste Tab-Druck landete
  // danach auf dem Reiter statt auf dem Skip-Link, und `e2e/a11y.e2e.ts` (E4)
  // wurde rot. Der Skip-Link ist die erste Zusage der Tastaturbedienung; ein
  // Komfort-Scroll darf sie nicht kosten. Hier wird darum NUR die waagrechte
  // Scroll-Position des Streifens selbst gesetzt: kein Dokument-Scroll, kein
  // Eingriff in die Fokus-Reihenfolge, gleiche Wirkung.
  useEffect(() => {
    const streifen = leisteRef.current?.querySelector<HTMLElement>('[data-reiter-streifen]');
    const el = streifen?.querySelector<HTMLElement>('[data-reiter-aktiv="true"]');
    if (!streifen || !el) return;
    const links = el.offsetLeft;
    const rechts = links + el.offsetWidth;
    if (links < streifen.scrollLeft) streifen.scrollLeft = links;
    else if (rechts > streifen.scrollLeft + streifen.clientWidth) {
      streifen.scrollLeft = rechts - streifen.clientWidth;
    }
  }, [aktivSchluessel, sichtbar.length]);

  // ── M6 · DAS MAUSRAD ROLLT DIE LEISTE (Prüfbefund R11 #33) ────────────────
  //
  // GEMESSEN 6.9.2026 @390 mit echtem Überlauf (`scrollWidth 818 /
  // clientWidth 253`): senkrechtes Rad über der Leiste liess `scrollLeft` bei
  // 0 — nur ein waagrechtes Rad bewegte sie. Eine gewöhnliche Maus ohne
  // Querrad erreichte die hinteren Reiter durch Rollen also nie.
  //
  // NATIVER LAUSCHER STATT `onWheel`: React hängt `wheel` PASSIV an die
  // Wurzel; ein `preventDefault()` im React-Handler wirkte nicht und würde nur
  // eine Konsolen-Warnung erzeugen. `{ passive: false }` ist die einzige Art,
  // das Seiten-Scrollen an dieser Stelle wirklich zu ersetzen.
  //
  // NUR BEI ECHTEM ÜBERLAUF (Risiko aus dem Plan): läuft die Leiste nicht
  // über, bleibt das Rad beim Dokument — GEMESSEN scrollt die Seite heute
  // unter dem Zeiger auf der klebenden Leiste (`scrollY 400`), und diese
  // Funktion darf nicht verlorengehen. Und nur, wenn die senkrechte Bewegung
  // die stärkere ist: wer ein Querrad hat, behält seinen eigenen Weg.
  useEffect(() => {
    const el = streifenRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Blatt schliessen bei Klick ausserhalb (Trigger + portaliertes Blatt).
  useEffect(() => {
    if (!blattOffen) return;
    const zu = (e: MouseEvent) => {
      const ziel = e.target as Node;
      if (triggerRef.current?.contains(ziel) || blattRef.current?.contains(ziel)) return;
      setBlattOffen(false);
    };
    document.addEventListener('mousedown', zu);
    return () => document.removeEventListener('mousedown', zu);
  }, [blattOffen]);
  useDialogFokus(blattOffen, blattRef, () => setBlattOffen(false));

  // ── R10-BEFUND (Nullprobe 6.9.2026) · DIE HÖHE STEHT VOR DEN REITERN ──────
  //
  // Hier stand `if (tabs.length < 1) return null` — «keine Reiter, keine
  // Zeile». GEMESSEN am Stand `0093fad28` (Preview, `/rechner/tagerechner`,
  // ganzer Spec-Lauf `ics-export-z1` A9): der Prerender kennt keinen Speicher,
  // lieferte also KEINE Leiste; unmittelbar nach der Hydration las `useTabs`
  // den `localStorage`, die Leiste erschien, und `main#inhalt` rutschte von
  // 132 px auf 166 px — 34 px = genau `--app-reiter-h`, CLS 0.025 auf einer
  // Seite, die sonst 0 misst (§15). Der WURZEL-FIX bleibt: die Zeile ist immer
  // da und immer gleich hoch (`sticky top-[--app-krone-h]`, `h-[--app-reiter-h]`),
  // ob mit oder ohne Reiter — der Wechsel verschiebt nichts.
  //
  // ── D19-NACHTRAG (6.9.2026) · KEIN STUMMER PLATZHALTER MEHR ────────────────
  // Bis hierher stand an dieser Stelle bei 0 Reitern EIN `aria-hidden`-`<div>`
  // ohne `<nav>` — eine Navigations-Landmark ohne ein einziges Ziel wäre für
  // den Screenreader ein leeres Versprechen gewesen. Seit dem «+»-Knopf
  // (unten im Streifen) gibt es aber IMMER ein Ziel, auch bei 0 Reitern: den
  // Browser-«+», mit dem man den ERSTEN Reiter überhaupt anlegt. Der frühere
  // Sonderpfad ist darum ersatzlos gestrichen (§17-Gegengewicht) — dieselbe
  // `<nav>` trägt jetzt beide Fälle, `sichtbar`/`ordnung` sind bei 0 Reitern
  // schlicht leer und rendern keinen Reiter, keinen Überlauf-Knopf.

  const gefiltert = suche.trim()
    ? tabs.filter((t) => `${reiterKurzformText(t, manifeste)} ${verlaufLabel(t.path, manifeste)} ${t.path}`
        .toLowerCase().includes(suche.trim().toLowerCase()))
    : tabs;

  const ueberlaufZahl = versteckt.length;
  const blattTitel = ueberlaufZahl > 0 ? `+${ueberlaufZahl}` : `${tabs.length} offen`;

  // ── M4 · WAS IM KONTEXTMENÜ EINES REITERS STEHT ───────────────────────────
  //
  // Die Fläche zeichnet `ReiterMenue`; WELCHE Einträge es gibt und was sie tun,
  // steht hier — und rechnen tut es `lib/tabs` (§3). Jeder Eintrag erscheint
  // nur, wenn er auch etwas bewirkt: kein «Daneben öffnen» ohne freies
  // Fenster, kein «Rechts davon schliessen» am letzten Reiter, kein «Zuletzt
  // geschlossen» bei leerem Ring. Ein Menüeintrag, der nichts tut, ist eine
  // Zusage, die nicht gilt (§8).
  const menueEintraege = (t: TabEintrag): ReiterMenueEintrag[] => {
    const idx = ordnung.findIndex((x) => tabSchluessel(x.path) === tabSchluessel(t.path));
    const rechts = idx >= 0 ? ordnung.slice(idx + 1) : [];
    const wieder = letzterGeschlossener();
    const e: ReiterMenueEintrag[] = [];
    if (kannOeffnen && !istOffen(t.path)) {
      e.push({ id: 'daneben', label: 'Daneben öffnen', onKlick: () => oeffneDaneben(t.path) });
    }
    // «Duplizieren» ist der Klick-Weg zur ZWEITEN INSTANZ desselben Dokuments
    // (`?r=<n>`) — dieselbe Buchführung, die der Leser-Knopf bis M8 benutzt
    // hat. Die Funktion geht damit nicht verloren, sie steht jetzt an jedem
    // Reiter statt nur im Erlass-Kopf.
    e.push({ id: 'duplizieren', label: 'Duplizieren', onKlick: () => {
      const ziel = naechsteInstanz(t.path);
      merkeTab(ziel, t.label);
      navigate(ziel);
    } });
    if (ordnung.length > 1) {
      e.push({ id: 'andere', label: 'Alle anderen schliessen', onKlick: () => {
        for (const x of ordnung) if (tabSchluessel(x.path) !== tabSchluessel(t.path)) schliessePane(x.path);
        schliesseAndere(t.path);
        navigate(t.path);
      } });
    }
    if (rechts.length > 0) {
      e.push({ id: 'rechts', label: 'Rechts davon schliessen', rechts: String(rechts.length), onKlick: () => {
        for (const x of rechts) schliessePane(x.path);
        schliesseRechtsVon(t.path);
        if (rechts.some((x) => tabSchluessel(x.path) === aktivSchluessel)) navigate(t.path);
      } });
    }
    // KEINE ✕-Marke: das Schliess-Glyph kommt in dieser App aus genau EINEM
    // Baustein (`ui/SchliessKnopf`, A3-1) — eine Menüzeile, die es selbst
    // zeichnet, wäre die zweite Stelle (Wächter `design-r3b-chrome`).
    e.push({ id: 'schliessen', label: 'Schliessen', rechts: 'Alt+W', onKlick: () => schliessen(t.path) });
    if (wieder) {
      // EIN WORT FÜR EINE SACHE (Ä118-Lehre): dieselbe Zeile steht auch im
      // Überlauf-Blatt, darum derselbe Wortlaut. GEMESSEN 6.9.2026 (Screen
      // `r11-kontextmenue-1440-hell`, zweiter Lauf): «Zuletzt geschlossen:
      // ZGB» brach im Menü hinter dem Doppelpunkt ab — der Name, also gerade
      // das Nützliche, fiel weg. «Wieder öffnen: ZGB» stellt die Tätigkeit
      // nach vorn und trägt den Namen ganz.
      e.push({ id: 'wieder', label: `Wieder öffnen: ${reiterKurzformText(wieder, manifeste)}`,
        rechts: 'Alt+⇧+T', onKlick: stelleWiederHer });
    }
    return e;
  };

  /** R2: kein Reiter offen — die Leiste hält ihre Höhe, aber weder Unterstrich
   *  noch Trennkante, und das «+» rückt an den Inhaltsrand. */
  const leer = tabs.length === 0;

  /** Der Browser-«+» (D19). `solo` = die Fassung ohne Reiter: keine linke
   *  Trennkante, weil links von ihm nichts steht, das zu trennen wäre. */
  const plusKnopf = (solo: boolean) => (
    <button type="button" onClick={neuerReiter}
      aria-label="Neuer Reiter" title="Neuer Reiter (Alt+T)"
      className={`rl-plus${solo ? ' rl-plus-solo' : ''}`}>
      <span aria-hidden className="lc-griff-glyph">+</span>
    </button>
  );

  const reiter = (t: TabEintrag, i: number) => {
    const schluessel = tabSchluessel(t.path);
    const aktiv = schluessel === aktivSchluessel;
    const { kopf, kern, stelle } = reiterKurzformTeile(t, manifeste);
    const name = reiterKurzformText(t, manifeste);
    // R8 · Volltitel, Stand/Datum/Kurzbeschreibung und Lesestellung stehen in
    // EINER Ableitung (`lib/tabs.reiterTitel`) — Herleitung dort.
    const titel = reiterTitel(t, manifeste);
    const reg = registerVonPfad(t.path);
    // F10 · EINE REGEL FÜR BEIDE GRIFFE (✕ und ⧉): der aktive Reiter zeigt sie
    // immer, inaktive bei Hover ODER Tastatur-Fokus irgendwo im Reiter. Vorher
    // war das ✕ dauernd sichtbar und das ⧉ nur bei Hover — zwei Regeln für
    // dieselbe Zeile, und die Tastatur erreichte das ⧉ nur unsichtbar.
    const griffSicht = aktiv
      ? ''
      : 'opacity-0 transition-opacity group-hover/reiter:opacity-100 group-focus-within/reiter:opacity-100';
    // Aktiv-Marken der Panes: welcher Reiter steht in welchem Fenster (§5a
    // Ziff. 4). Bei einem einzigen Pane trägt der aktive Reiter keine Marke —
    // «links» ohne ein «rechts» sagt nichts.
    const paneIdx = paneSchluessel.length > 1 ? paneSchluessel.indexOf(schluessel) : -1;
    const paneWort = paneIdx === 0 ? 'links' : paneIdx > 0 ? 'rechts' : null;
    return (
      <div key={schluessel}
        data-reiter-aktiv={aktiv}
        // Test-Anker: die Reiter-IDENTITÄT im DOM (`lib/tabs.tabSchluessel`).
        // Die Beschriftung taugt dafür nicht — sie hängt an lazy geladenen
        // Manifesten und ist genau das, was hier NICHT gemessen werden soll.
        data-reiter-schluessel={schluessel}
        draggable
        onDragStart={(ev) => {
          gezogen.current = t.path;
          setZieht(t.path);
          ev.dataTransfer.setData('text/plain', t.path);
          ev.dataTransfer.setData(REITER_MIME, t.path);
          ev.dataTransfer.effectAllowed = 'copyMove';
          // GHOST: der Reiter selbst hängt am Zeiger, gefasst dort, wo man ihn
          // angepackt hat. Chromium nimmt zwar von sich aus das gezogene
          // Element — aber erst NACH dem Handler und ohne Griffpunkt; ein
          // explizites `setDragImage` mit dem Zeiger-Offset ist der Unterschied
          // zwischen «etwas fliegt» und «ich halte diesen Reiter» (D15: die
          // Funktion war da, nur nicht als Funktion erkennbar).
          const kasten = ev.currentTarget.getBoundingClientRect();
          try { ev.dataTransfer.setDragImage(ev.currentTarget, ev.clientX - kasten.left, ev.clientY - kasten.top); }
          catch { /* ältere Engines ohne setDragImage — der Default-Ghost tut es auch */ }
        }}
        onDragOver={(ev) => {
          const von = gezogen.current;
          if (!von || von === t.path) return;
          ev.preventDefault();
          // SEITE AUS DEM ZEIGER-X (D15, «analog browser»): linke Hälfte des
          // Ziels = davor, rechte Hälfte = dahinter. Ohne diese Unterscheidung
          // liesse sich ein Reiter nie ans ENDE der Leiste ziehen — hinter dem
          // letzten gibt es kein weiteres Ziel.
          const kasten = ev.currentTarget.getBoundingClientRect();
          const davor = ev.clientX < kasten.left + kasten.width / 2;
          if (ueber?.path !== t.path || ueber.davor !== davor) setUeber({ path: t.path, davor });
        }}
        onDrop={(ev) => {
          ev.preventDefault();
          const von = gezogen.current ?? ev.dataTransfer.getData(REITER_MIME);
          if (von && von !== t.path) {
            const kasten = ev.currentTarget.getBoundingClientRect();
            ordneTabsUm(von, t.path, ev.clientX < kasten.left + kasten.width / 2);
          }
          gezogen.current = null; setZieht(null); setUeber(null);
        }}
        onDragEnd={() => { gezogen.current = null; setZieht(null); setUeber(null); }}
        // M4 · RECHTSKLICK ÖFFNET DAS REITER-MENÜ. Unterdrückt wird das
        // Browser-Kontextmenü NUR über einem Reiter — über der Leiste
        // daneben, über dem «+» und über der ganzen übrigen Seite bleibt es
        // erreichbar (Risiko aus dem Plan).
        onContextMenu={(ev) => {
          ev.preventDefault();
          setMenue({ path: t.path, x: ev.clientX, y: ev.clientY });
        }}
        title={titel}
        // F9 · DER AKTIVE REITER IST EINE FLÄCHE, KEIN 4-EINHEITEN-UNTERSCHIED.
        // GEMESSEN 6.9.2026: aktiv `paper-raised` (255) gegen inaktiv `paper`
        // (251) — der Unterschied trug allein der 2-px-Strich. Jetzt trägt der
        // aktive Reiter die REGISTERFARBE seiner Domäne als leichte Tönung
        // (Papier bleibt Papier, die Farbe sagt zugleich, WELCHES Register).
        // `cursor-grab` / `active:cursor-grabbing` an der HÜLLE: die Affordanz
        // war der ganze D15-Befund — das Ziehen funktionierte, sah aber nach
        // nichts aus. Der Zeiger sagt jetzt schon vor dem Anfassen, dass hier
        // etwas zu greifen ist; die Griffe ✕/⧉ setzen ihren eigenen Zeiger.
        // Der gezogene Reiter nimmt sich zurück (`opacity-40`) — was am Zeiger
        // hängt, soll nicht zugleich an seinem alten Platz stehen.
        className={`group/reiter relative flex shrink-0 cursor-grab items-center border-r border-rule-soft active:cursor-grabbing ${
          zieht === t.path ? 'opacity-40' : ''
        } ${aktiv ? (reg ? REG_TON[reg] : 'bg-paper-raised') : ''}`}>
        {/* EINFÜGEMARKE (D15): 2 px in der Registerfarbe des GEZOGENEN Reiters,
            über die volle Reiterhöhe, auf der Seite, auf der er landen wird.
            Sie ersetzt den früheren, immer linken `border-l-2` — der konnte
            nicht sagen, ob der Reiter davor oder dahinter einrastet, und ans
            Ende der Leiste kam man mit ihm gar nicht. */}
        {ueber?.path === t.path && (
          <span aria-hidden data-reiter-marke={ueber.davor ? 'davor' : 'dahinter'}
            className={`pointer-events-none absolute inset-y-0 w-0.5 ${ueber.davor ? '-left-px' : '-right-px'} ${
              zieht && registerVonPfad(zieht) ? REG_FLAECHE[registerVonPfad(zieht)!] : 'bg-ink-900'}`} />
        )}
        {/* ── R1 (Prüfbefund R11, 6.9.2026) · DIE LEISTE IST NICHT TRIST ─────
            GEMESSEN: alle inaktiven Reiter trugen `bg-ink-400 opacity-30` —
            eine graue Leiste, in der die Registerfarbe erst beim Überfahren
            erschien. Der Streifen ist aber die EINE Stelle, an der man ohne
            Lesen sieht, was offen ist (Gesetz, Entscheid, Werkzeug …).
            ENTSCHEID (David «nicht trist»): jeder Reiter trägt seine eigene
            Registerfarbe, der inaktive auf 60 % Deckkraft, der aktive voll
            plus Flächen-Tönung (`REG_TON`, oben). 60 % ist die Stufe, die
            RUHIG bleibt und den aktiven Reiter trotzdem eindeutig lässt: er
            unterscheidet sich in ZWEI Merkmalen (volle Farbe UND Tönung),
            nicht nur in der Deckkraft. Der Hover hebt auf 100 % — dieselbe
            Auskunft wie vorher, nur nicht mehr die einzige.
            Ohne Register (Meta-Route) bleibt es bei Tinte: geraten wird keine
            Farbe (§8). */}
        <span aria-hidden className={`absolute inset-x-0 bottom-0 h-0.5 ${
          aktiv
            ? (reg ? REG_FLAECHE[reg] : 'bg-ink-900')
            : `${reg ? REG_FLAECHE[reg] : 'bg-ink-400'} opacity-60 group-hover/reiter:opacity-100`}`} />
        <button type="button" aria-current={aktiv ? 'page' : undefined}
          onClick={() => navigate(t.path)}
          onAuxClick={(ev) => {
            // Mittelklick schliesst — das Browser-Idiom, das David meint.
            if (ev.button === 1) { ev.preventDefault(); schliessen(t.path); }
          }}
          // M4 · DASSELBE MENÜ OHNE MAUS: Shift+F10 und die Menü-Taste sind
          // die beiden Wege, die Windows/Linux-Tastaturen dafür kennen
          // (WCAG 2.1.1 — eine Zeigergeste allein wäre keine Bedienung).
          // Verankert wird es an der linken unteren Ecke des Reiters, nicht am
          // Zeiger, den es hier nicht gibt.
          onKeyDown={(ev) => {
            if (ev.key !== 'ContextMenu' && !(ev.key === 'F10' && ev.shiftKey)) return;
            ev.preventDefault();
            const k = ev.currentTarget.getBoundingClientRect();
            setMenue({ path: t.path, x: k.left, y: k.bottom });
          }}
          className={`flex min-w-0 items-baseline gap-1 py-1.5 pl-2.5 pr-1 text-body-s ${
            aktiv ? 'font-medium text-ink-900' : 'text-ink-600 hover:text-ink-900'}`}>
          <span className="sr-only">{`Reiter ${i + 1}: `}</span>
          {/* F6 · DIE GESCHÄFTSNUMMER WIRD NIE GEKÜRZT. Gekürzt wird der Kopf
              (das Gericht, ohnehin schon abgekürzt); der Kern trägt die Nummer
              und steht `shrink-0`. Der Deckel sitzt darum AM KOPF, nicht am
              Knopf: läge er am Knopf, ragte ein langer Kern als `shrink-0`-Kind
              über dessen Kasten und legte sich über die ⧉/✕-Griffe daneben.
              Ohne Kopf kürzt der Kern selbst — dann ist er der ganze Name
              (Gesetz, Rechner, Vorlage) und nichts daran ist geschützt. */}
          {/* ── DIE WORTFUGE IST EIN ECHTES LEERZEICHEN, KEIN `gap` ─────────
              GEMESSEN 6.9.2026 (`e2e/w224-plus-reiter`, nach der D27-Trennung):
              der Knopf las sich als «Art. 257dOR» — die Lücke kam allein aus
              `gap-1` des Flex-Kastens, und die trägt weder `textContent` noch
              die Berechnung des Accessible Name (WCAG 4.1.2: eine Sprachaus-
              gabe hätte «Artikel 257dOR» gesagt). `{' '}` ist ein Leerzeichen-
              Textknoten: als Flex-Kind wird er nicht gerendert (das Bild bleibt
              byte-gleich, die Lücke macht weiter `gap-1`), im Text steht er.
              Gilt für BEIDE Fugen — die zum Kopf hatte den Defekt schon
              vorher («OGer AGHOR.2024.19»). */}
          {kopf && <span className="truncate max-w-[9rem]">{kopf}</span>}
          {kopf && ' '}
          {/* ── D27 (David 6.9.2026) · DIE LESESTELLUNG STEHT IM REITER ──────
              «diese funktion, dass es anzeigt in welchem artikel wir sind,
              soll der tab bekommen.» Die Stelle wandert beim Scrollen (aus
              `lib/tabs`, entprellt auf 200 ms vom Scroll-Spy des Lesers) —
              und ein wandernder Text ändert seine Breite. Läge er im selben
              Fluss wie der Kern, schöbe jeder Artikelwechsel alle Reiter
              rechts davon. `.rl-stelle` (index.css) reserviert darum eine
              feste Breite, auch solange die Stellung noch unbekannt ist
              (`stelle === ''`): die Leiste steht schon vor dem ersten
              Spy-Lauf da, wo sie danach steht. Nur Gesetzes-Reiter tragen den
              Platz (`stelle === null` = keine Stellung möglich). */}
          {stelle !== null && <span className="rl-stelle num">{stelle}</span>}
          {stelle ? ' ' : null}
          <span className={kopf ? 'shrink-0' : 'truncate max-w-[15rem]'}>{kern}</span>
          {paneWort && <span className="sr-only">{` (Fenster ${paneWort})`}</span>}
        </button>
        {/* Fenster-Marke: zeigt, welcher Reiter links bzw. rechts steht. */}
        {paneWort && (
          <span aria-hidden title={`Fenster ${paneWort}`}
            className="shrink-0 border border-rule-soft px-1 text-micro leading-tight text-ink-500">
            {paneWort === 'links' ? '◧' : '◨'}
          </span>
        )}
        {/* «daneben öffnen» — der Klick-Weg zu dem, was das Ziehen ins zweite
            Fenster tut (§5a Ziff. 4); nur ab lg und mit freier Kapazität. */}
        {kannOeffnen && !istOffen(t.path) && (
          <button type="button" onClick={() => oeffneDaneben(t.path)}
            aria-label={`«${name}» daneben öffnen`} title="Daneben öffnen"
            className={`hidden lg:inline-flex h-6 w-5 shrink-0 items-center justify-center text-ink-400 hover:text-ink-900 ${griffSicht}`}>
            <span aria-hidden className="lc-griff-glyph">⧉</span>
          </button>
        )}
        {/* A3-1: EIN Schliess-✕ der App; der Klick wirft ein offenes Dokument
            samt Leseposition weg — derselbe deklarierte destruktive Ton wie in
            der Reiter-Liste und der Pane-Titelleiste.
            `komfort={false}`: die 44-px-Trefferfläche des Bausteins läge in
            einer 28-px-Reiterzeile über dem ⧉-Nachbarn UND über dem nächsten
            Reiter — dieselbe begründete Ausnahme wie dort; die AA-Untergrenze
            (24 px, WCAG 2.5.8) hält die Grundklasse. */}
        <SchliessKnopf name={`Reiter «${name}» schliessen`} ton="destruktiv" komfort={false}
          onClick={() => schliessen(t.path)} klasse={`h-6 w-6 mr-1 shrink-0 ${griffSicht}`} />
      </div>
    );
  };

  return (
    <nav aria-label="Offene Reiter" ref={leisteRef}
      // W2·24-R4: die Arbeitsleiste KLEBT jetzt — unter der Titelblatt-Zeile
      // (`--app-krone-h`) und mit ihrer eigenen, festen Höhe (`--app-reiter-h`).
      // Beide Zahlen stehen in `src/index.css`; dieselbe Summe (`--app-kopf-h`)
      // liest `pages/gesetz-leser/v3/leserGeometrie.ts` für den Kopf-Anschlag
      // und `--nt-stick`. R2 hatte die Leiste bewusst im Fluss gelassen, weil
      // diese eine Quelle fehlte (R2-Protokoll §2) — ohne sie landete jeder
      // `#art-…`-Sprung um die Leistenhöhe zu hoch.
      // ── R2 (Prüfbefund R11, 6.9.2026) · KEIN STRICH UNTER DEM NICHTS ──────
      // GEMESSEN auf «/» (Startseite, die nach D7 bewusst keinen Reiter
      // erzeugt): ein 34 px hoher, leerer Streifen mit einem durchgehenden
      // Unterstrich über die volle Breite — eine Trennlinie, die nichts trennt.
      // Der Unterstrich fällt weg, solange kein Reiter da ist; die HÖHE bleibt
      // reserviert (`h-[var(--app-reiter-h)]`, box-border: der 1-px-Rahmen
      // liegt INNEN), damit der Inhalt beim ersten Reiter nicht springt —
      // CLS 0, bewacht in `e2e/w224-r11-reiterleiste.e2e.ts`.
      data-reiter-leer={leer ? '' : undefined}
      className={`print:hidden shrink-0 sticky top-[var(--app-krone-h)] z-leiste h-[var(--app-reiter-h)] bg-paper${
        leer ? '' : ' border-b border-rule-soft'}`}>
      <div className="flex items-stretch px-4 sm:px-6">
        {/* R2 · OHNE REITER STEHT DAS «+» LINKS, AM INHALTSRAND. Im Browser
            beginnt die Leiste dort, wo der Inhalt beginnt — ein «+», das ganz
            rechts im Leeren klebt, findet niemand. Mit Reitern bleibt es am
            Ende des Streifens (unten), wo es dem letzten Reiter folgt. */}
        {leer && plusKnopf(true)}
        {/* M6 · DOPPELKLICK AUF DEN LEERRAUM = NEUER REITER (Befund #34).
            GEMESSEN 6.9.2026: 457 px ungenutzte Fläche rechts des letzten
            Reiters — im Browser genau die Stelle, auf die man doppelklickt.
            `ev.target === ev.currentTarget` ist die ganze Bedingung: ein
            Doppelklick AUF einem Reiter steigt hierher auf und darf keinen
            zweiten Reiter erzeugen (Risiko aus dem Plan). */}
        <div ref={streifenRef} data-reiter-streifen
          onDoubleClick={(ev) => { if (ev.target === ev.currentTarget) neuerReiter(); }}
          className={`relative flex min-w-0 flex-1 items-stretch overflow-x-auto lc-reiter-scroll${
            leer ? '' : ' border-l border-rule-soft'}`}>
          {sichtbar.map(reiter)}
        </div>
        {/* D19 · BROWSER-«+» AM ENDE DES STREIFENS — fest, nicht Teil der
            scrollenden Reiter-Fläche (das Vorbild wandert beim Scrollen der
            Reiter nicht mit weg). `.rl-plus` trägt nur Breite/Zentrierung/
            Hover (index.css); die 34-px-Höhe kommt aus `items-stretch` des
            Elternflusses, ohne eigene Höhen-Angabe. */}
        {!leer && plusKnopf(false)}
        {/* «+N» bzw. «N offen» — EIN Blatt für Überlauf (Desktop) und die
            schmale Ansicht (§5a Ziff. 5 + 8). Inhalt ist die gruppierte Liste
            `TabPanel`, also genau das, was das abgelöste ☰-Flyout zeigte,
            zusätzlich mit Suchfeld. */}
        {(ueberlaufZahl > 0 || tabs.length >= MOBIL_BLATT_AB) && (
          <button ref={triggerRef} type="button"
            aria-haspopup="dialog" aria-expanded={blattOffen}
            aria-label={`Alle ${tabs.length} offenen Reiter`}
            title="Alle offenen Reiter"
            onClick={() => setBlattOffen((v) => !v)}
            className={`shrink-0 self-center ml-2 border border-rule-soft px-2 py-1 text-body-s text-ink-600 hover:text-ink-900 ${
              ueberlaufZahl > 0 ? '' : 'md:hidden'}`}>
            <span className="num">{blattTitel}</span>
          </button>
        )}
      </div>

      {/* M4 · das Kontextmenü des angeklickten Reiters. Ein Menü zur Zeit —
          `menue` hält den Reiter, nicht der Reiter das Menü (sonst stünden bei
          zwölf Reitern zwölf Portale bereit). */}
      {menue && (() => {
        const t = tabs.find((x) => tabSchluessel(x.path) === tabSchluessel(menue.path));
        if (!t) return null;
        return (
          <Suspense fallback={null}>
            <ReiterMenue x={menue.x} y={menue.y} name={reiterKurzformText(t, manifeste)}
              eintraege={menueEintraege(t)} onSchliessen={() => setMenue(null)} />
          </Suspense>
        );
      })()}

      {blattOffen && createPortal(
        <div className="fixed inset-0 z-overlay">
          <div className="lc-scrim-voll absolute inset-0" onClick={() => setBlattOffen(false)} aria-hidden />
          <div ref={blattRef} tabIndex={-1} role="dialog" aria-label="Alle geöffneten Reiter"
            className="lc-schwebeflaeche absolute right-2 top-2 max-h-[80vh] w-[22rem] max-w-[calc(100vw-1rem)] overflow-y-auto p-2 focus:outline-none">
            <label className="mb-2 block">
              <span className="sr-only">Offene Reiter durchsuchen</span>
              <input type="search" value={suche} onChange={(e) => setSuche(e.target.value)}
                placeholder="Reiter suchen" className="lc-input h-9 w-full py-0 text-body-s" />
            </label>
            {/* D19 · derselbe Browser-«+» zusätzlich im Blatt: die schmale
                Ansicht (§5a Ziff. 8) wechselt bei drei und mehr Reitern auf
                dieses durchsuchbare Blatt als Haupt-Weg zu den Reitern — der
                «+» gehört dort dazu, ohne erst den Streifen dahinter zu
                verlassen. Der Streifen-Knopf bleibt daneben unverändert
                erreichbar (fixe Breite, nicht Teil der scrollenden Fläche). */}
            <button type="button" onClick={() => { neuerReiter(); setBlattOffen(false); }}
              title="Neuer Reiter (Alt+T)" className="lc-btn-outline lc-btn-sm mb-2 w-full">
              <span aria-hidden className="lc-griff-glyph mr-1">+</span>Neuer Reiter
            </button>
            <Suspense fallback={null}>
              <TabPanel
                tabs={gefiltert}
                manifeste={manifeste}
                aktivSchluessel={aktivSchluessel}
                onNavigate={(p) => { navigate(p); setBlattOffen(false); }}
                onSchliessen={schliessen}
                onDaneben={kannOeffnen ? (p) => { oeffneDaneben(p); setBlattOffen(false); } : undefined}
                paneOffen={istOffen}
              />
            </Suspense>
            {gefiltert.length === 0 && (
              <div className="px-2 py-3">
                {/* D-7: EIN Leerzustands-Baustein für «hier ist nichts» — die
                    Suche filtert einen BESTAND, der Weiterweg ist das Leeren
                    des Feldes. */}
                <Leerzustand art="filter" text={`Kein offener Reiter passt zu «${suche.trim()}».`}
                  weiterweg={{ text: 'Filter leeren', onKlick: () => setSuche('') }} />
              </div>
            )}
            {/* M3 · DIE RÜCKFAHRKARTE, SICHTBAR. Alt+Shift+T kennt niemand,
                der es nicht gesagt bekommt — und «Alle schliessen» direkt
                darunter ist genau die Geste, nach der man sie am dringendsten
                braucht. Steht nur da, wenn der Ring etwas hergibt. */}
            {(() => {
              const wieder = letzterGeschlossener();
              if (!wieder) return null;
              return (
                <div className="mt-1 border-t border-rule-soft pt-1">
                  <button type="button"
                    onClick={() => { stelleWiederHer(); setBlattOffen(false); }}
                    title="Zuletzt geschlossenen Reiter wiederherstellen (Alt+Shift+T)"
                    className="lc-btn-outline lc-btn-sm w-full">
                    <span aria-hidden className="lc-griff-glyph mr-1">↩</span>
                    Wieder öffnen: {reiterKurzformText(wieder, manifeste)}
                  </button>
                </div>
              );
            })()}
            {tabs.length > 1 && (
              <div className="mt-1 border-t border-rule-soft pt-1">
                <button type="button"
                  onClick={() => { leereTabs(); navigate('/'); setBlattOffen(false); }}
                  className="lc-btn-outline lc-btn-sm w-full">
                  Alle schliessen
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </nav>
  );
}
