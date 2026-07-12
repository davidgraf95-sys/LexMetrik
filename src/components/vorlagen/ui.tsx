import { cloneElement, createContext, isValidElement, useContext, useEffect, useId, useState } from 'react';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { NormText } from '../NormText';
import { NormChip } from './NormChip';

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
      {hint && <p className="text-xs text-ink-500"><NormText text={hint} /></p>}
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
    <label className={`flex items-start gap-2.5 py-1.5 min-h-[2.25rem] text-body-s ${disabled ? 'text-ink-500 cursor-not-allowed' : 'text-ink-700 cursor-pointer'}${className ? ' ' + className : ''}`}>
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
          {bemerkung && <span className="text-ink-600"> · {bemerkung}</span>}
        </>
      }
    />
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
    <p className="lc-live lc-overline lc-overline-soft">
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
      {fehler.map((f, i) => <p key={i} className="text-body-s text-danger-700">• <NormText text={f} /></p>)}
    </div>
  );
}

/** Beispiel-Chips über den Eingaben (UX A5) — vorher 2× wortgleich dupliziert;
 *  die Beispiel-INHALTE bleiben fachlich beim jeweiligen Formular. */
export function BeispielChips({ items }: { items: { label: string; laden: () => void }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="lc-overline lc-overline-soft">Beispiel laden:</span>
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
 *  Ergebnis existiert und der Schirm schmal ist; rein navigatorisch.
 *  W2·10-UI-NAV/N0d·W5: blendet sich per IntersectionObserver aus, sobald das
 *  Ergebnis selbst im Viewport steht (kein FAB, der auf ohnehin Sichtbares zeigt);
 *  taucht beim Zurückscrollen zu den Eingaben wieder auf. Reine Navigation (§3). */
export function ErgebnisSprung({ zielId }: { zielId: string }) {
  const [zielSichtbar, setZielSichtbar] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const el = document.getElementById(zielId);
    if (!el) return;
    // −45 % Boden-Marge: als «sichtbar» gilt das Ergebnis erst, wenn es spürbar
    // in den oberen Bildbereich rückt (nicht schon beim ersten Pixel am unteren Rand).
    const io = new IntersectionObserver(
      ([eintrag]) => setZielSichtbar(eintrag.isIntersecting),
      { rootMargin: '0px 0px -45% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [zielId]);
  if (zielSichtbar) return null;
  return (
    <a href={`#${zielId}`} className="sm:hidden fixed bottom-4 right-4 z-40 lc-btn-outline lc-btn-sm shadow-md bg-surface"
      onClick={(e) => { e.preventDefault(); document.getElementById(zielId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
      ↓ Ergebnis
    </a>
  );
}
