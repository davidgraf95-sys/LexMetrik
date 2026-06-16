import { cloneElement, createContext, isValidElement, useContext, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { useLocale, fedlexLokalisiert } from '../locale';
import { bundSnapshotRef } from '../../lib/normtext/bundRef';
import { ladeSnapshot } from '../../lib/normtext/laden';
import { naechsterFokus } from '../../lib/normtext/fokus';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { NormPopover } from '../NormPopover';

// Geteilte UI-Bausteine der Vorlagen-Wizards (Testament, Patientenverfügung, …).

export const inputCls = 'lc-input';

export function Field({ label, children, hint, optional }: {
  label: string; children: React.ReactNode; hint?: string; optional?: boolean;
}) {
  // Label↔Control-Verknüpfung (FAHRPLAN-DESIGN 3.6): native Einzel-Controls
  // (input/select/textarea) bekommen automatisch id + htmlFor; zusammengesetzte
  // Einzel-Komponenten (DatumsFeld, BetragsFeld) bekommen das Label per
  // aria-labelledby aufs innere input gereicht (axe-Befund label/critical,
  // 10.6.2026) — ein Label-Wrap wäre dort riskant (Klick-Redispatch ins
  // Kalender-Popover). Eigenes aria-label des Kindes hat Vorrang.
  const id = useId();
  const nativ = isValidElement(children) && typeof children.type === 'string'
    && !(children.props as { id?: string }).id;
  const komposit = isValidElement(children) && typeof children.type !== 'string'
    && (children.props as Record<string, unknown>)['aria-label'] === undefined
    && (children.props as Record<string, unknown>)['aria-labelledby'] === undefined;
  const control = nativ
    ? cloneElement(children as React.ReactElement<{ id?: string }>, { id })
    : komposit
      ? cloneElement(children as React.ReactElement<{ 'aria-labelledby'?: string }>, { 'aria-labelledby': `${id}-label` })
      : children;
  return (
    <div className="space-y-1">
      <label id={`${id}-label`} htmlFor={nativ ? id : undefined} className="block text-body-s font-medium text-ink-700">
        {label}{optional && <span className="text-ink-500 font-normal"> · optional</span>}
      </label>
      {control}
      {hint && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

/** Geteiltes Ankreuzfeld (Redesign E11) — eine Trefferzeile (≥44px Touch),
 *  gebrandetes Häkchen (accent-color global), einheitlicher Abstand und
 *  Fokus. Ersetzt schrittweise die ~290 inline-Label-Checkboxen. Reine
 *  Darstellung (§3) — der Zustand bleibt beim aufrufenden Formular. */
export function Checkbox({ checked, onChange, label, hint, disabled, name, className = '' }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  name?: string;
  /** Zusatzklassen am Label (z. B. pl-6 für eingerückte Unter-Optionen). */
  className?: string;
}) {
  return (
    <label className={`flex items-start gap-2.5 py-1.5 min-h-[2.25rem] text-body-s ${disabled ? 'text-ink-400 cursor-not-allowed' : 'text-ink-700 cursor-pointer'}${className ? ' ' + className : ''}`}>
      <input type="checkbox" name={name} checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)} className="mt-0.5 shrink-0" />
      <span className="min-w-0">
        {label}
        {hint && <span className="block text-xs text-ink-500">{hint}</span>}
      </span>
    </label>
  );
}

/** Sektions-Kopf innerhalb eines Wizard-Schritts (Redesign, Entscheid David):
 *  Overline (Messing) + Haarlinie — gleiche Anatomie wie die Abschnitts-Köpfe
 *  der Rechner/des Katalogs, damit lange Schritte in lesbare Sektionen
 *  zerfallen. Ersetzt das zuvor leise <p className="lc-overline">-Muster. */
export function GruppenTitel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="lc-overline text-brass-700">{children}</p>
      <span aria-hidden className="flex-1 h-px bg-line" />
    </div>
  );
}

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
// linkClass ausgelagert, damit alle Bestands-Aufrufe (ohne linkClass) SSR-byte-
// identisch bleiben (§6) und nur der Inline-Auto-Linker (NormText) ein anderes,
// fliesstext-taugliches Styling übergibt.
const CHIP_LINK_CLASS = 'lc-chip no-underline hover:text-brass-700';

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
        <NormPopoverOverlay onClose={schliessen}>
          {snapshot && snapshot !== 'laedt'
            ? <NormPopover snapshot={snapshot} passus={{ absatz: ref?.absatz ?? null, lit: ref?.lit, ziff: ref?.ziff }} onClose={schliessen} />
            : <NormPopoverHuelle zustand={snapshot === 'laedt' ? 'laedt' : 'fehlt'} url={url} artikel={artikel} onClose={schliessen} />}
        </NormPopoverOverlay>
      )}
    </>
  );
}

/** Dünner Wrapper auf NormChip — bewahrt das heutige NormLink-Markup
 *  byte-genau: der Default-title («… auf Fedlex öffnen») gilt nur, wenn der
 *  Chip wirklich als Link rendert; im span-Fallback (unbekanntes Gesetz) bleibt
 *  der title roh wie bisher (undefined → kein Attribut). */
export function NormLink({ artikel, title, bemerkung }: { artikel: string; title?: string; bemerkung?: string }) {
  const istLink = fedlexLinkFuerArtikel(artikel) !== null;
  return (
    <NormChip
      artikel={artikel}
      title={istLink ? (title ?? `${artikel} auf Fedlex öffnen`) : title}
      anzeige={
        <>
          {artikel}
          {bemerkung && <span className="opacity-70"> · {bemerkung}</span>}
        </>
      }
    />
  );
}

// Overlay/Backdrop + Zentrierung für die Norm-Vorschau. NormPopover liefert
// bewusst nur den Dialog-Inhalt (lc-card), nicht das Overlay — beides stellt
// dieser Rahmen: zentriert, Klick auf den Backdrop schliesst. Rein
// clientseitig gerendert (nur wenn offen, also nie im SSR/Prerender).
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
export function NormPopoverOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const dialogContainerRef = useRef<HTMLDivElement>(null);

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
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
      onClick={onClose}
    >
      {/* Klicks im Dialog dürfen nicht zum Backdrop durchschlagen. */}
      <div ref={dialogContainerRef} onClick={(e) => e.stopPropagation()} className="w-full max-w-xl">
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

// Stepper-Leiste (klickbar bis zum erreichten Schritt)
export function Stepper({ schritte, aktiv, onWechsel }: {
  schritte: readonly { id: string; label: string }[];
  aktiv: number;
  onWechsel: (i: number) => void;
}) {
  const anteil = (aktiv + 1) / schritte.length;
  return (
    <nav aria-label="Schritte">
      {/* Mobile: kompakter Fortschritt statt Chip-Wolke (bei 7 Schritten sonst
          eine mehrzeilige Wolke ohne Fortschrittsgefühl, Redesign E6). */}
      <div className="sm:hidden space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="lc-overline shrink-0">Schritt <span className="num">{aktiv + 1}</span>/<span className="num">{schritte.length}</span></span>
          <span className="text-body-s font-medium text-ink-700 truncate text-right">{schritte[aktiv].label}</span>
        </div>
        <div className="h-1 rounded-full bg-well overflow-hidden"
          role="progressbar" aria-valuenow={aktiv + 1} aria-valuemin={1} aria-valuemax={schritte.length}>
          <div className="h-full bg-brass-500 origin-left transition-transform motion-reduce:transition-none" style={{ transform: `scaleX(${anteil})` }} />
        </div>
      </div>
      {/* Desktop: klickbare Schritt-Chips */}
      <div className="hidden sm:flex flex-wrap gap-x-1 gap-y-2">
        {schritte.map((s, i) => {
          const erledigt = i < aktiv;
          const istAktiv = i === aktiv;
          return (
            <button key={s.id} type="button" onClick={() => i <= aktiv && onWechsel(i)}
              aria-current={istAktiv ? 'step' : undefined}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                istAktiv ? 'bg-surface-raised border border-line text-brass-700 shadow-sm'
                : erledigt ? 'text-ink-700 hover:bg-brass-100/50'
                : 'text-ink-500 cursor-default'
              }`}>
              <span className={`num inline-flex items-center justify-center w-5 h-5 rounded-full text-micro ${
                erledigt ? 'bg-brass-500 text-ink-900' : istAktiv ? 'border border-brass-500 text-brass-700' : 'border border-line text-ink-500'
              }`}>{erledigt ? '✓' : i + 1}</span>
              {s.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Geteilte Engine-UI (UX-Programm Etappe 1, 5.6.2026) ────────────────────
// Entdoppelung wortgleicher Muster aus den 12 Rechner-Formularen (§10).

/** Live-Hinweis über dem Ergebnisblock — vorher 9× wortgleich dupliziert. */
export function LiveHeader() {
  return (
    <p className="lc-live lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>
      Live-Berechnung – aktualisiert sich automatisch
    </p>
  );
}

// Grundsatz David (14.6.2026): im leeren Anfangszustand keine Eingabefehler.
// FehlerBox wird erst sichtbar, wenn das umschliessende Formular «berührt»
// wurde. Default true → ausserhalb eines BeruehrtRahmen (z. B. Vorlagen-
// Wizards, die selbst gaten) unverändert. BeruehrtRahmen ist layout-transparent
// (display:contents) und setzt «berührt» beim ersten onInput/onChange.
const BeruehrtContext = createContext(true);

export function BeruehrtRahmen({ children }: { children: React.ReactNode }) {
  const [beruehrt, setBeruehrt] = useState(false);
  const merke = () => { if (!beruehrt) setBeruehrt(true); };
  return (
    <BeruehrtContext.Provider value={beruehrt}>
      {/* Bewusst nur onInput/onChange (keine onClick): ein Fokus-Klick ins leere
          Feld ist noch keine Eingabe und darf keine Fehler zeigen (Grundsatz
          David). Reine Klick-Auswahlen (SelectionGrid) lösen «berührt» daher
          erst über ein begleitendes Feld aus — in der Praxis unkritisch, da
          Fehler dieser Formulare von onChange-Feldern abhängen. */}
      <div className="contents" onInput={merke} onChange={merke}>{children}</div>
    </BeruehrtContext.Provider>
  );
}

/** Einheitliche Eingabefehler-Box (vorher 4 Varianten; immer role="alert"). */
export function FehlerBox({ fehler }: { fehler: string[] }) {
  const beruehrt = useContext(BeruehrtContext);
  if (!beruehrt || fehler.length === 0) return null;
  return (
    <div role="alert" className="rounded-lg border border-line bg-danger-bg p-4 space-y-1">
      <p className="text-xs font-semibold text-danger-700 uppercase tracking-wide mb-1">Eingabefehler</p>
      {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• {f}</p>)}
    </div>
  );
}

/** Beispiel-Chips über den Eingaben (UX A5) — vorher 2× wortgleich dupliziert;
 *  die Beispiel-INHALTE bleiben fachlich beim jeweiligen Formular. */
export function BeispielChips({ items }: { items: { label: string; laden: () => void }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="lc-overline text-ink-500 normal-case" style={{ letterSpacing: '0.04em' }}>Beispiel laden:</span>
      {items.map((b) => (
        <button type="button" key={b.label} onClick={b.laden} className="lc-chip hover:bg-brass-200 transition-colors">{b.label}</button>
      ))}
    </div>
  );
}

/** Eckdaten-Kachel (UX C2) — vorher in 6+ Formularen wortgleich dupliziert.
 *  Nur die einfache Label/Wert(-Sub)-Form; Spezialkacheln (z. B. Verjährungs-
 *  FristKarte mit «massgeblich»-Badge) bleiben bewusst eigenständig.
 *  `akzent` markiert die EINE wichtigste Kachel des Blocks mit der
 *  Messing-Oberkante (DESIGN-REGLEMENT-RECHNER R4 Ziff. 1). */
export function EckdatenKachel({ label, wert, sub, num, akzent }: { label: string; wert: string; sub?: string; num?: boolean; akzent?: boolean }) {
  return (
    <div className={akzent ? 'lc-tile lc-akzent-brass' : 'lc-tile'}>
      <p className="text-xs text-ink-500 mb-1">{label}</p>
      {/* key={wert}: bei Wertänderung re-mountet der Knoten → der lc-wert-puls
          läuft erneut, also wird die Live-Neuberechnung sichtbar (Redesign E8). */}
      <p key={wert} className={`lc-wert-puls text-body-l font-semibold text-ink-900${num ? ' num' : ''}`}>{wert}</p>
      {sub && <p className="text-xs text-ink-500 mt-0.5">{sub}</p>}
    </div>
  );
}

/** Mobile Sprungmarke zum Live-Ergebnis (UX A7) — nur sichtbar, wenn ein
 *  Ergebnis existiert und der Schirm schmal ist; rein navigatorisch. */
export function ErgebnisSprung({ zielId }: { zielId: string }) {
  return (
    <a href={`#${zielId}`} className="sm:hidden fixed bottom-4 right-4 z-40 lc-btn-outline lc-btn-sm shadow-md bg-surface"
      onClick={(e) => { e.preventDefault(); document.getElementById(zielId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
      ↓ Ergebnis
    </a>
  );
}
