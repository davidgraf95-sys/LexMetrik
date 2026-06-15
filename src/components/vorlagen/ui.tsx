import { cloneElement, createContext, isValidElement, useContext, useId, useState } from 'react';
import { fedlexLinkFuerArtikel } from '../../lib/fedlex';
import { useLocale, fedlexLokalisiert } from '../locale';

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

// Geteilter Fedlex-Norm-Chip (Code-Review #6, 7.6.2026: Kopien dieses
// Musters haben den Locale-Bug im Fristenspiegel erzeugt — neue Rechner
// nutzen DIESE Komponente, keine lokalen NormPill-Varianten).
export function NormLink({ artikel, title, bemerkung }: { artikel: string; title?: string; bemerkung?: string }) {
  const { locale } = useLocale();
  const roh = fedlexLinkFuerArtikel(artikel);
  const url = roh ? fedlexLokalisiert(roh, locale) : null;
  const inhalt = (
    <>
      {artikel}
      {bemerkung && <span className="opacity-70"> · {bemerkung}</span>}
    </>
  );
  return url
    ? <a href={url} target="_blank" rel="noopener noreferrer" title={title ?? `${artikel} auf Fedlex öffnen`} className="lc-chip no-underline hover:text-brass-700">{inhalt}</a>
    : <span className="lc-chip" title={title}>{inhalt}</span>;
}

// Stepper-Leiste (klickbar bis zum erreichten Schritt)
export function Stepper({ schritte, aktiv, onWechsel }: {
  schritte: readonly { id: string; label: string }[];
  aktiv: number;
  onWechsel: (i: number) => void;
}) {
  return (
    <nav aria-label="Schritte" className="flex flex-wrap gap-x-1 gap-y-2">
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
      <p className={`text-body-l font-semibold text-ink-900${num ? ' num' : ''}`}>{wert}</p>
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
