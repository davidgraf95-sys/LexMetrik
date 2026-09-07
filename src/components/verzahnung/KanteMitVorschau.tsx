import { memo, useCallback, useId, useRef, useState, lazy, Suspense } from 'react';
import { KantenChip } from './KantenChip';
import { usePaneSteuerung } from '../layout/usePaneLayout';
import type { ArtikelRevision } from '../../lib/verzahnung/artikel-revisionen';
import { HOVER_OEFFNEN_MS, HOVER_SCHLIESSEN_MS, istHoverZeiger } from '../hoverVorschau';

// ─── V3 · EINE Kanten-Zelle: Chip + ⧉ + Kurztext-Vorschau (W2·10-UI-NAV) ─────
//
// Die Leitfall-Zeile (V1a) und die Bezüge-Linien (B4/B7) rendern seit jeher
// dieselbe Zelle — `<KantenChip>` plus den ⧉-Knopf unter Pane-Gating — als zwei
// wortgleiche Kopien. Diese Komponente ist genau diese Zelle, EINMAL (§5): so
// kann die V3-Vorschau nicht an einer der beiden Stellen fehlen oder anders
// aussehen. Reine Darstellung (§3), keine Datenschicht, kein Fetch.
//
// ── WARUM DER ⧉ AM CHIP BLEIBT (deklarierte Abweichung, §14.7) ──────────────
// Die V3-Spec hält fest, der ⧉ je Chip bleibe verworfen und die Split-Aktion
// lebe im Popover. Der ⧉ ist hier aber KEIN Neubau, sondern Bestand seit dem
// Split-View-Schnitt — und er ist die von `e2e/split-view-a34.e2e.ts` gemessene
// Einstiegsgeste («nebeneinander öffnen» am Artikel). Ihn im Zuge eines
// Darstellungs-Schnitts zu entfernen, hiesse einen bestehenden Test anzupassen;
// das ist nach §6.3 eine fachliche Änderung und gehört in einen eigenen,
// deklarierten Schritt. Er bleibt darum, und er trägt zugleich den Tastatur-Weg
// zur Split-Aktion (der portalierte Popover-Knopf ist nur über ↓ erreichbar).
//
// ── LADEKOSTEN (§15) ───────────────────────────────────────────────────────
// Das Popover wird `lazy` geladen: es erscheint frühestens nach einer bewussten
// Geste (Hover mit Verzögerung / Fokus / ↓) — sein Code gehört nicht in den
// Erst-Chunk einer Seite mit hunderten Artikeln.
//
// ── DER PORTAL-FALLSTRICK, belegt (§9-Bug-Check 4.8.2026, B1) ───────────────
// Der Kasten hängt im DOM an <body>, im REACT-Baum aber unter dieser Zelle.
// React leitet Ereignisse dem REACT-Baum entlang weiter — jedes `keydown`,
// `focus` und `blur` aus dem Kasten läuft also durch die Handler HIER vorbei,
// obwohl `zelle.contains(ziel)` im DOM false ist. Daraus entstanden zwei
// Fehler, beide reproduziert (Chip fokussieren → ↓ → Esc):
//   (1) `onFocus` feuerte, sobald der Fokus IN den Kasten wanderte, und setzte
//       die Tastatur-Merkung zurück — der Fokus-Rückweg war damit tot Code.
//   (2) Der Esc-Zweig der Zelle lief vor dem `onClose`-Pfad des Kastens und
//       schloss OHNE Fokus-Rückgabe: `document.activeElement` war danach
//       `BODY` (WCAG 2.4.3 gebrochen — die Tastatur stand am Seitenanfang).
// Gegenmittel: (a) die Tastatur-Merkung liegt in einem `ref`, den kein Re-Render
// und kein durchgereichtes Fokus-Ereignis überschreibt; (b) Fokus-Ereignisse AUS
// dem Kasten werden an beiden Enden (`onFocus`/`onBlur`) über die DOM-Zugehörig-
// keit ausgesiebt; (c) es gibt genau EINEN Schliess-Pfad mit Fokus-Rückgabe, den
// Esc UND `onClose` gemeinsam benutzen.
const RegestePopover = lazy(() => import('./RegestePopover').then((m) => ({ default: m.RegestePopover })));

// Hover-Anatomie (Verzögerung/Nachlauf/Zeiger-Regel) liegt seit V2 EINMAL in
// `components/hoverVorschau.ts` — dieselben Werte tragen jetzt auch die
// Norm-Chip-Vorschau (§5, keine zwei driftenden Kopien). Werte unverändert.
const OEFFNEN_MS = HOVER_OEFFNEN_MS;
const SCHLIESSEN_MS = HOVER_SCHLIESSEN_MS;

export const KanteMitVorschau = memo(function KanteMitVorschau({
  ziel, zitierung, sublabel, kurztext, leitentscheid = false, revidiert, titel, statusLabel, className = '',
}: {
  /** Interner Reader-Pfad (trägt bereits `?norm=`). */
  ziel: string;
  zitierung: string;
  /** Fundstellen-Sublabel am Chip selbst (z. B. Datum oder «via Art. N») —
   *  reine Durchreiche an `KantenChip` (Panel-Entscheide, W2·5m-LESER-V3/§7b:
   *  die Panel-Zelle zeigte das Datum bisher separat, `KantenChip` kennt dafür
   *  bereits genau diesen Slot, §5 — kein zweiter Anzeige-Pfad). */
  sublabel?: string;
  /** Bestandstext aus dem Shard; null/leer ⇒ keine Vorschau (§8: nichts erfinden). */
  kurztext?: string | null;
  leitentscheid?: boolean;
  revidiert?: ArtikelRevision | null;
  titel?: string;
  statusLabel?: string;
  /** Zusatzklassen der Zelle (die Bezüge-Linie braucht `shrink-0`). */
  className?: string;
}) {
  const { oeffneDaneben, kannOeffnen, istOffen } = usePaneSteuerung();
  const zelle = useRef<HTMLSpanElement>(null);
  // Der Kasten selbst — für die DOM-Zugehörigkeitsprüfung der durchgereichten
  // Fokus-Ereignisse (er hängt an <body>, nicht in dieser Zelle).
  const kasten = useRef<HTMLDivElement>(null);
  const uhr = useRef<number | undefined>(undefined);
  // Tastatur-Merkung als REF: sie überlebt jedes Re-Render und wird von keinem
  // durchgereichten Fokus-Ereignis überschrieben (B1 (1)).
  const perTastatur = useRef(false);
  // §7b-BEFUND (21.8.2026, PanelEntscheide-Integration — Fehler war LATENT,
  // nicht neu: reproduziert auch am alten Standort, `leitfaelle-chips.e2e.ts`
  // (d) gegen Projekt `leser-v1`, Zeile 202, VOR jeder Änderung hier). Siehe
  // Herleitung an `schliesse`/`onFocus` unten.
  const schliessendRef = useRef(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [autoFokus, setAutoFokus] = useState(false);
  const kastenId = useId();
  const hatVorschau = !!kurztext && kurztext.trim() !== '';

  const stoppUhr = () => {
    if (uhr.current !== undefined) { window.clearTimeout(uhr.current); uhr.current = undefined; }
  };
  const oeffne = useCallback((mitTastatur: boolean) => {
    stoppUhr();
    const el = zelle.current?.firstElementChild ?? zelle.current;
    if (!el) return;
    if (mitTastatur) { perTastatur.current = true; setAutoFokus(true); }
    setRect(el.getBoundingClientRect());
  }, []);
  /**
   * DER EINE Schliess-Pfad. `fokusZurueck` = die Schliessung ist eine bewusste
   * Tastatur-Geste (Esc) — dann muss der Fokus zurück auf den Chip, sonst fällt
   * er auf `<body>` (B1 (2), WCAG 2.4.3). Beim Weg-Zeigen (`pointerleave`) oder
   * Weg-Tabben gibt es nichts zurückzugeben: dort steht der Fokus längst woanders.
   */
  const schliesse = useCallback((fokusZurueck: boolean) => {
    stoppUhr();
    setRect(null);
    setAutoFokus(false);
    // §7b-BUGFIX: `setRect(null)` ist in React 18 auch aus einem nativen
    // Listener (Esc-Handler in `RegestePopover`) automatisch gebatched — der
    // Kasten steht im DOM also noch, wenn die Zeile darunter synchron läuft.
    // `.focus()` löst SOFORT (synchron, noch im selben Tick) `onFocus` weiter
    // unten aus; ohne diese Sperre sah der die zurückkehrende Fokus-Geste als
    // NEUEN Öffnungsgrund an (`imKasten` prüft nur den PORTAL-Kasten, nicht
    // die Zelle selbst) und riss den gerade geschlossenen Kasten in derselben
    // Bewegung wieder auf — ein Escape blieb wirkungslos, sobald die Vorschau
    // per Tastatur geöffnet worden war (nur DANN läuft dieser Zweig, `pointerleave`
    // gibt keinen Fokus zurück). Reproduziert (§0.2) BEIDSEITIG, unabhängig von
    // der V3-Integration: `leitfaelle-chips.e2e.ts` (d) schlug mit exakt diesem
    // Bild auch am alten Standort (Projekt `leser-v1`) fehl — ein latenter
    // Fehler, den erst die neue V3-Deckung hier sichtbar gemacht hat.
    if (fokusZurueck && perTastatur.current) {
      schliessendRef.current = true;
      zelle.current?.querySelector('a')?.focus();
      schliessendRef.current = false;
    }
    perTastatur.current = false;
  }, []);
  /** Liegt der Knoten im portalierten Kasten? (Fokus-Aussiebung, siehe Kopf.) */
  const imKasten = (n: Node | null | undefined) => !!n && !!kasten.current?.contains(n);

  if (!hatVorschau) {
    return <Zelle ref={zelle} className={className} {...{ ziel, zitierung, sublabel, leitentscheid, revidiert, titel, kannOeffnen, istOffen, oeffneDaneben }} />;
  }
  return (
    <span
      className={`inline-flex items-center ${className}`}
      ref={zelle}
      onPointerEnter={(e) => {
        // Nur echte Zeiger (Maus/Stift) öffnen per Hover. Auf Touch ist «hover»
        // ein Synthese-Ereignis DES TAPS — dort bleibt es beim Klick (die Zelle
        // navigiert), sonst öffnete sich der Kasten genau im Moment der
        // Navigation und flackerte über den Seitenwechsel.
        if (!istHoverZeiger(e.pointerType)) return;
        stoppUhr();
        uhr.current = window.setTimeout(() => oeffne(false), OEFFNEN_MS);
      }}
      onPointerLeave={(e) => {
        if (!istHoverZeiger(e.pointerType)) return;
        stoppUhr();
        uhr.current = window.setTimeout(() => schliesse(false), SCHLIESSEN_MS);
      }}
      onFocus={(e) => {
        // Fokus IM Kasten ist kein neuer Öffnungsgrund — er würde nur die
        // Tastatur-Merkung und das Anker-Rechteck neu setzen (B1 (1)).
        if (imKasten(e.target)) return;
        // §7b-BUGFIX: die eigene Fokus-RÜCKGABE aus `schliesse` ist ebenfalls
        // kein neuer Öffnungsgrund — Herleitung dort.
        if (schliessendRef.current) return;
        oeffne(false);
      }}
      onBlur={(e) => {
        const ziel = e.relatedTarget as Node | null;
        if (e.currentTarget.contains(ziel) || imKasten(ziel)) return;
        schliesse(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); oeffne(true); }
        // Esc läuft durch DENSELBEN Pfad wie `onClose` — inklusive Fokus-Rückgabe.
        else if (e.key === 'Escape' && rect) { e.preventDefault(); schliesse(true); }
      }}
    >
      <KantenChip to={ziel} label={zitierung} sublabel={sublabel} kategorie="entscheid"
        leitentscheid={leitentscheid} revidiert={revidiert} titel={titel ?? zitierung}
        // B2: der Chip sagt, dass er etwas aufgeklappt hat und was. `aria-controls`
        // NUR im offenen Zustand — eine Referenz auf einen nicht existierenden
        // Knoten ist ein a11y-Fehler, keine Auskunft.
        ariaExpanded={rect ? true : false}
        ariaControls={rect ? kastenId : undefined} />
      {kannOeffnen && !istOffen(ziel) && (
        <SplitKnopf zitierung={zitierung} onClick={() => oeffneDaneben(ziel)} />
      )}
      {rect && (
        <Suspense fallback={null}>
          <RegestePopover ankerRect={rect} hostRef={zelle} kastenRef={kasten} kastenId={kastenId}
            zitierung={zitierung} kurztext={kurztext!}
            ziel={ziel} statusLabel={statusLabel} autoFokus={autoFokus}
            onClose={() => schliesse(true)} />
        </Suspense>
      )}
    </span>
  );
});

// ── Die beiden Bausteine der Zelle, damit der vorschaulose Zweig byte-gleich
//    dasselbe Markup rendert wie bisher (kein zweiter Chip-Aufbau, §5). ───────

function SplitKnopf({ zitierung, onClick }: { zitierung: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      title={`${zitierung} nebeneinander öffnen`} aria-label={`${zitierung} nebeneinander öffnen`}
      className="ml-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line text-ink-500 hover:text-brass-700 hover:border-brass-400 transition-colors">
      <span aria-hidden className="lc-griff-glyph">⧉</span>
    </button>
  );
}

function Zelle({ ref, className, ziel, zitierung, sublabel, leitentscheid, revidiert, titel, kannOeffnen, istOffen, oeffneDaneben }: {
  ref: React.Ref<HTMLSpanElement>;
  className: string;
  ziel: string;
  zitierung: string;
  sublabel?: string;
  leitentscheid: boolean;
  revidiert?: ArtikelRevision | null;
  titel?: string;
  kannOeffnen: boolean;
  istOffen: (pfad: string) => boolean;
  oeffneDaneben: (pfad: string) => void;
}) {
  return (
    <span className={`inline-flex items-center ${className}`} ref={ref}>
      <KantenChip to={ziel} label={zitierung} sublabel={sublabel} kategorie="entscheid"
        leitentscheid={leitentscheid} revidiert={revidiert} titel={titel ?? zitierung} />
      {kannOeffnen && !istOffen(ziel) && (
        <SplitKnopf zitierung={zitierung} onClick={() => oeffneDaneben(ziel)} />
      )}
    </span>
  );
}
