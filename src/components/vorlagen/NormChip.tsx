import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { useLocale, fedlexLokalisiert } from '../locale';
import { bundSnapshotRef } from '../../lib/normtext/bundRef';
import { ladeSnapshot } from '../../lib/normtext/laden';
import { naechsterFokus } from '../../lib/normtext/fokus';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { NormPopover } from '../NormPopover';

// Geteilter Fedlex-Norm-Chip (Code-Review #6, 7.6.2026: Kopien dieses
// Musters haben den Locale-Bug im Fristenspiegel erzeugt — neue Rechner
// nutzen DIESE Komponente, keine lokalen NormPill-Varianten).
//
// Progressive Enhancement (16.6.2026): Der Chip bleibt der heutige
// <a target=_blank> auf Fedlex (Fallback + SSR/Prerender/PDF-Pfad
// UNVERÄNDERT — NULL Regression, §6). Existiert ein Bund-Snapshot-Bezug
// (bundSnapshotRef), öffnet ein Klick im Browser stattdessen die Volltext-
// Vorschau im Popover.
//
// onClick-Variante (kein Doppel-Öffnen, SSR-neutral):
//  - Kein ref  → kein preventDefault → der Link öffnet wie heute (Fallback).
//  - ref da    → preventDefault + Popover-Shell SOFORT öffnen, dann async
//    laden. Async-preventDefault wäre zu spät (Default ist da schon gefeuert);
//    darum synchron entscheiden. Liefert ladeSnapshot null, zeigt das Popover
//    «Volltext nicht verfügbar» + den Live-Link statt zu navigieren — so wird
//    nie doppelt geöffnet/navigiert.
// SSR/Prerender: offen=false initial, kein Effekt läuft, der erste Render ist
// byte-identisch zum heutigen <a> (Golden unverändert).
// Default-Styling des Chip-Links — der heutige Pillen-Look. Als Default-Wert von
// linkClass ausgelagert, damit alle Bestands-Aufrufe (ohne linkClass) dasselbe
// Markup teilen und nur der Inline-Auto-Linker (NormText) ein anderes,
// fliesstext-taugliches Styling übergibt.
// V2·C-3 (§4b-B, NormChip-Verweisfarbe): + hover:border-brass-400 — der NormChip
// war der EINZIGE Norm-Chip ohne den brass-Hover-Border (KantenChip 'norm',
// rechtsprechung/NormChip, MassgebendeGesetze, EntscheidLeser tragen ihn alle);
// jetzt komplette brass-Familie (Norm/Verweis) auf einer Hover-Anatomie.
// SSR-Assertion in normLinkSsr.test deklariert nachgezogen (§6.3).
//
// H-8/B21 (12.7.2026): reiner Move aus vorlagen/ui.tsx — löste den
// Komponenten-Wert-Zyklus NormText → ui → NormPopover → ArtikelBody →
// NormText auf (madge check:zyklen). Exakt gleicher Export-Name/Props,
// keine Gelegenheits-Umbenennung. NormPopoverOverlay/NormPopoverHuelle
// bleiben bewusst in ui.tsx (zweiter Konsument KantonQuelleLink.tsx,
// keine Zyklus-Beteiligung) und werden von hier importiert.
const CHIP_LINK_CLASS = 'lc-chip no-underline hover:text-brass-700 hover:border-brass-400';

export function NormChip({ artikel, anzeige, hrefOverride, title, linkClass = CHIP_LINK_CLASS }: {
  /** Norm-Text für die Snapshot-Auflösung (bundSnapshotRef) + Fallback-URL. */
  artikel: string;
  /** Anzeigetext im Chip (Default: artikel). */
  anzeige?: React.ReactNode;
  /** Bereits aufgelöste/lokalisierte Fallback-URL; wenn gesetzt, exakt diese
   *  nutzen (z. B. wenn die Strecke n.url aus den Schema-Daten kennt). */
  hrefOverride?: string;
  /** title-Attribut — NUR rendern, wenn gesetzt (SSR-Byte-Gleichheit der
   *  title-losen Einbaustellen). */
  title?: string;
  /** className des Link-<a>. Default = Pillen-Chip; NormText übergibt einen
   *  dezenten Inline-Stil (gleiche Popover-Logik, andere Darstellung). */
  linkClass?: string;
}) {
  const { locale } = useLocale();
  const inhalt = anzeige ?? artikel;
  // Fallback-URL: explizite Override hat Vorrang, sonst aus dem Artikel
  // ableiten (wie das heutige NormLink).
  const roh = hrefOverride ? null : fedlexLinkFuerArtikel(artikel);
  const url = hrefOverride ?? (roh ? fedlexLokalisiert(roh, locale) : null);

  const triggerRef = useRef<HTMLAnchorElement>(null);
  const [offen, setOffen] = useState(false);
  // 'laedt' | NormSnapshot (geladen) | null (Snapshot nicht verfügbar)
  const [snapshot, setSnapshot] = useState<NormSnapshot | 'laedt' | null>('laedt');

  // Keine Fallback-URL → exakt das heutige Verhalten (reiner span-Chip).
  if (!url) return <span className="lc-chip" title={title}>{inhalt}</span>;

  const ref = bundSnapshotRef(artikel);

  const beimKlick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref) return; // kein Snapshot → normaler Link öffnet wie heute
    e.preventDefault();
    setSnapshot('laedt');
    setOffen(true);
    ladeSnapshot('bund', ref.quelle, ref.token).then((s) => setSnapshot(s));
  };

  const schliessen = () => {
    setOffen(false);
    triggerRef.current?.focus(); // Fokus zurück auf den Chip (A11y)
  };

  return (
    <>
      <a
        ref={triggerRef}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        {...(title ? { title } : {})}
        className={linkClass}
        onClick={beimKlick}
      >
        {inhalt}
      </a>
      {offen && (
        <NormPopoverOverlay onClose={schliessen} triggerRef={triggerRef}>
          {snapshot && snapshot !== 'laedt'
            ? <NormPopover snapshot={snapshot} passus={{ absatz: ref?.absatz ?? null, lit: ref?.lit, ziff: ref?.ziff }} onClose={schliessen} />
            : <NormPopoverHuelle zustand={snapshot === 'laedt' ? 'laedt' : 'fehlt'} url={url} artikel={artikel} onClose={schliessen} />}
        </NormPopoverOverlay>
      )}
    </>
  );
}

// Overlay/Backdrop für die Norm-Vorschau. NormPopover liefert bewusst nur den
// Dialog-Inhalt (lc-card), nicht das Overlay — beides stellt dieser Rahmen:
// das Popover erscheint AM KLICKORT (am Trigger verankert, nicht mittig — Wunsch
// David), Klick auf den Backdrop schliesst. Rein clientseitig (nie im Prerender).
//
// Verankerung: fixe Koordinaten aus dem getBoundingClientRect des Triggers
// (unter dem Trigger, sonst darüber; horizontal in den Viewport geklemmt). Der
// Portal hängt am body → ausserhalb jedes `container-type`-Vorfahren, also
// Viewport-Koordinaten korrekt AUCH in einem Split-View-Pane (sonst läge das
// fixed-Popover am Pane-Container statt am Viewport — der eigentliche Bug).
// Ohne triggerRef (Altaufrufer) bleibt es mittig.
//
// PORTAL an document.body: Der Auslöser (Norm-Chip / «amtliche Quelle»-Link)
// steht teils in einem <p> (z. B. die Tarif-Quelle-Zeile). Würde das Overlay
// inline gerendert, läge der Dialog-<div>/<p>/<h2> IM <p> → ungültiges HTML +
// Hydration-Fehler. Der Portal hängt das Overlay ans body, ausserhalb des <p>.
//
// A11y (16.6.2026): Da der Dialog aria-modal="true" trägt, erwartet assistive
// Technik eine Fokus-Falle UND einen ruhenden Hintergrund. Beides wird hier
// verdrahtet — am gemeinsamen Overlay, das sowohl NormPopover als auch
// NormPopoverHuelle umschliesst:
//  (1) Fokus-Falle: Tab/Shift+Tab zyklisch zwischen erstem und letztem
//      fokussierbaren Element des Dialogs (reine Index-Logik in
//      lib/normtext/fokus.ts, hier nur die DOM-Verdrahtung).
//  (2) Body-Scroll-Lock: document.body overflow:hidden, solange offen; beim
//      Schliessen/Unmount exakt der vorherige Inline-Wert wiederhergestellt.
// Beides nur im useEffect (window/document) → SSR/Prerender unberührt; der
// Erst-Render bleibt byte-gleich (Overlay rendert ohnehin nur clientseitig).
// Der Fokus-Rückgabe auf den Trigger bleibt beim Aufrufer (triggerRef).
//
// H-8/B21 (12.7.2026): mit NormChip aus vorlagen/ui.tsx hierher gezogen (reiner
// Move) — NormPopoverOverlay/NormPopoverHuelle hatten nur zwei Konsumenten
// (NormChip hier + KantonQuelleLink.tsx), keine Zyklus-Beteiligung, aber ein
// Verbleib in ui.tsx hätte einen neuen NormChip.tsx↔ui.tsx-Zyklus erzeugt (ui.tsx
// importiert NormChip für NormLink). Exakt gleicher Export-Name/Props.
export function NormPopoverOverlay({ children, onClose, triggerRef }: {
  children: React.ReactNode;
  onClose: () => void;
  /** Trigger-Element → Popover wird daran verankert (sonst zentriert). */
  triggerRef?: RefObject<HTMLElement | null>;
}) {
  const dialogContainerRef = useRef<HTMLDivElement>(null);
  // Verankerte Position (am Trigger). null = noch nicht berechnet/kein Trigger.
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // Position aus dem Trigger-Rect ableiten: bevorzugt UNTER dem Trigger, sonst
  // darüber; horizontal an den Viewport geklemmt. useLayoutEffect misst die
  // gerenderte Kartenhöhe und setzt die Position VOR dem Paint (kein Springen).
  //
  // Befund David 3.7.2026 («Popover soll dort aufgehen, wo der Link ist»):
  // Die Horizontal-Klemmung kollabierte auf left=8, weil der Container `w-full`
  // trug und der Inline-Style `maxWidth: calc(100vw - 16px)` das `max-w-xl` der
  // Klasse ÜBERSCHRIEB → offsetWidth = voller Viewport, `vw - kw - m` ≈ 8. Das
  // Popover öffnete darum bei jedem Link rechts der Mitte am LINKEN Fensterrand.
  // Fix: der verankerte Container erhält seine Breite als EINEN Inline-Wert
  // (min(36rem = max-w-xl, 100vw − 16px)) — die Messung stimmt, die Klemmung
  // platziert am Link. Zusätzlich folgt die Position dem Trigger beim Scrollen
  // (capture-Listener fängt auch innere Scroll-Container, z. B. Split-View-
  // Panes, die der Body-Scroll-Lock nicht sperrt).
  useLayoutEffect(() => {
    const trigger = triggerRef?.current;
    const karte = dialogContainerRef.current;
    if (trigger == null || karte == null) return;
    const berechne = () => {
      const t = trigger.getBoundingClientRect();
      const kw = karte.offsetWidth;
      const kh = karte.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const m = 8; // Sicherheitsabstand zum Rand
      const left = Math.min(Math.max(m, t.left), Math.max(m, vw - kw - m));
      let top = t.bottom + 6;
      if (top + kh + m > vh) {
        const oben = t.top - kh - 6;
        top = oben >= m ? oben : Math.max(m, vh - kh - m);
      }
      setPos({ top, left });
    };
    berechne();
    // Scroll-Nachführung rAF-gedrosselt (Review 3.7.): das capture-Event feuert
    // auch beim Scrollen IM Popover — ungedrosselt wäre jeder Tick ein Re-Render.
    let raf = 0;
    const beiScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; berechne(); });
    };
    window.addEventListener('resize', berechne);
    window.addEventListener('scroll', beiScroll, true);
    return () => {
      window.removeEventListener('resize', berechne);
      window.removeEventListener('scroll', beiScroll, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [triggerRef, children]);

  // Fokus-Falle: hält Tab/Shift+Tab innerhalb des Dialogs (zyklisch). Die reine
  // Index-Berechnung liegt in naechsterFokus (testbar); hier nur DOM-Zugriff.
  useEffect(() => {
    const wurzel = dialogContainerRef.current;
    if (wurzel == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      // Bei jedem Tab frisch einsammeln (Inhalt kann nachladen: Hülle → Volltext).
      const fokussierbar = Array.from(
        wurzel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (fokussierbar.length === 0) return;
      const aktiv = fokussierbar.indexOf(document.activeElement as HTMLElement);
      const ziel = naechsterFokus(fokussierbar.length, aktiv, e.shiftKey);
      if (ziel < 0) return;
      e.preventDefault();
      fokussierbar[ziel].focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Body-Scroll-Lock: Hintergrund ruhig stellen, solange das Overlay offen ist.
  // Der vorherige Inline-Wert wird gemerkt und beim Unmount exakt zurückgesetzt
  // (mehrere Overlays gleichzeitig sind nicht möglich — eins pro Chip).
  useEffect(() => {
    const vorher = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = vorher; };
  }, []);

  if (typeof document === 'undefined') return null; // SSR/Prerender: kein Overlay
  const verankert = triggerRef != null;
  return createPortal(
    <div
      // Verankert: transparenter Klick-Fänger (kein Dim, Popover-Charakter).
      // Zentriert (Altpfad): gedimmter, mittig gestellter Modal-Backdrop.
      className={verankert ? 'fixed inset-0 z-50' : 'fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4'}
      onClick={onClose}
    >
      {/* Klicks im Dialog dürfen nicht zum Backdrop durchschlagen. */}
      <div
        ref={dialogContainerRef}
        onClick={(e) => e.stopPropagation()}
        style={verankert
          // Breite als EIN Inline-Wert (36rem = max-w-xl), damit offsetWidth die
          // echte Kartenbreite misst — s. Befund oben (sonst Klemmung auf left=8).
          ? { position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0, width: 'min(36rem, calc(100vw - 16px))', visibility: pos ? 'visible' : 'hidden' }
          : undefined}
        className="w-full max-w-xl"
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

// Lade-/Fallback-Inhalt, wenn (noch) kein Snapshot vorliegt. Esc + Fokus wie im
// NormPopover; bei 'fehlt' der sichtbare Live-Link (§8) statt Volltext.
export function NormPopoverHuelle({ zustand, url, artikel, onClose }: {
  zustand: 'laedt' | 'fehlt'; url: string; artikel: string; onClose: () => void;
}) {
  const schliessRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    schliessRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Esc') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Norm-Vorschau ${artikel}`} tabIndex={-1}
      className="lc-card w-full max-w-xl p-0 text-left">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3">
        <div className="min-w-0">
          <p className="lc-overline text-brass-700">Norm-Vorschau</p>
          <h2 className="text-body-l font-semibold text-ink-900 truncate">{artikel}</h2>
        </div>
        <button ref={schliessRef} type="button" onClick={onClose} aria-label="Schliessen"
          className="lc-btn-ghost lc-btn-sm shrink-0 px-2">✕</button>
      </div>
      <div className="px-5 py-4">
        <p className="text-body-s text-ink-700">
          {zustand === 'laedt' ? 'Volltext wird geladen …' : 'Volltext nicht verfügbar.'}
        </p>
      </div>
      <div className="border-t border-line px-5 py-3">
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="lc-chip no-underline hover:text-brass-700">↗ geltende Fassung auf Fedlex</a>
      </div>
    </div>
  );
}
