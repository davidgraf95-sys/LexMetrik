import type { ReactNode } from 'react';

// ═══ D5 (David 6.9.2026) · DIE EINE MENÜ-ANATOMIE ════════════════════════════
//
// David am Bild des Leser-«Ansicht»-Menüs: die Einträge trugen «✓ an» rechts,
// der erste einen harten 2-px-Fokuskasten, der letzte brach zweizeilig um und
// hatte den Schriftregler eingequetscht. Sein Auftrag dazu ausdrücklich:
// «Gilt als Muster für ALLE Menüs/Popover (Verlauf, Reiter-Blatt, Sprache,
// Thema)».
//
// DIESE DATEI IST DAS GERÜST, nicht ein weiteres Menü. Sie trägt genau die
// Teile, die in allen Menüs gleich sind — Titelzeile, Zeile, Schalter-Zeile,
// Regler-Zeile —, und NICHTS von dem, was ein einzelnes Menü ausmacht: Position,
// Breite, z-Index, Öffnen/Schliessen, Fokus-Falle und ARIA-Rollen bleiben beim
// Aufrufer. Das ist dieselbe Trennung, die `.lc-schwebeflaeche` und `.lc-scrim`
// schon führen («wo die Fläche liegt, entscheidet ihr Anker, nicht ihre
// Anatomie»); die Werte selbst stehen als `.lc-menu-*` in `src/index.css`.
//
// WARUM KEIN `role="menu"`: dieselbe Begründung, die `LeserAnsichtV3` seit H1
// führt (Risiko R2/A4-Präzedenz) — `role=menu` verspricht eine
// Pfeiltasten-Bedienung, die diese Popover nicht haben. Die Rollen setzt darum
// der Aufrufer, passend zu dem, was er wirklich einlöst.

/**
 * Titel-Etikett über einer Menü-Gruppe.
 *
 * D35-F4 (7.9.2026): kursive Literata-Zeile (`.lc-randtitel`, GB-2) statt
 * Archivo-Etikett (`.lc-overline`). Der Gruppenkopf ist im Haus die Zeile, die
 * einen Abschnitt BENENNT — dieselbe Stimme wie Marginalie und Blattname; mit
 * der Overline sahen Kopf und Zeile darunter nach zwei Systemen aus. Grösse,
 * Tinte und Innenabstand stehen als `.lc-menu-titel` in `index.css`, damit
 * hier keine zweite Wahrheit über Menü-Masse entsteht (§5).
 */
export function MenueTitel({ children }: { children: ReactNode }) {
  return <p className="lc-randtitel lc-menu-titel">{children}</p>;
}

/**
 * Klammer um Zeilen, die zusammen EINE Frage beantworten.
 *
 * Die Haarlinie eines Menüs steht zwischen zwei Gruppen, nicht unter jeder
 * Zeile (Herleitung in `index.css`, Block «DIE LINIE TRENNT GRUPPEN»). Der
 * Aufrufer entscheidet, ob die Gruppe eine ARIA-Rolle trägt: eine Radio-Gruppe
 * setzt `attrs={{ role: 'group', 'aria-label': … }}`, das Ansicht-Menü setzt
 * `role="menu"` — dieselbe Trennung wie bei den Zeilen («die Rollen setzt der
 * Aufrufer, passend zu dem, was er wirklich einlöst»).
 */
export function MenueGruppe({ children, attrs }: {
  children: ReactNode;
  attrs?: Record<string, string | undefined>;
}) {
  return <div className="lc-menu-gruppe" {...attrs}>{children}</div>;
}

/**
 * Gewöhnliche Menüzeile (Knopf). Trägt links optional dieselbe Marken-Spalte
 * wie der Schalter, damit Beschriftungen über alle Zeilen hinweg fluchten.
 */
export function MenueZeile({ label, titel, onKlick, rechts, attrs }: {
  label: ReactNode;
  /** ── R6/R7 (Prüfer D23/R11, 6.9.2026) · DIE MARKEN-SPALTE TRÄGT KEIN BILD MEHR
   *  Davids Soll für die Menü-Anatomie: «Icons in Menüs weg (alle)» — entweder
   *  jede Zeile trägt eines oder keine, und der Entscheid ist «keine». Die
   *  Zeichen waren ohnehin ungleich verteilt (⧉ ↩ ⚖ neben Zeilen ganz ohne),
   *  also gerade das Bild, das ein Menü unruhig macht.
   *  Der SLOT bleibt im Typ, solange ein Aufrufer ihn noch übergibt
   *  (`pages/gesetz-leser/v3/LeserAnsichtV3.tsx`, eigener Bauschritt) — der
   *  Wert wird NICHT mehr gerendert. Die SPALTE selbst bleibt, leer: sie hält
   *  die Beschriftungen in der Flucht der Schalter-Zeilen, die links weiterhin
   *  ihren Zustand (✓) führen. Ein Zustand ist kein Icon. */
  marke?: ReactNode;
  titel?: string;
  onKlick: () => void;
  /** Kleine Zusatzangabe am Zeilenende (Zahl, Kürzel) — nie ein Zustandswort. */
  rechts?: ReactNode;
  attrs?: Record<string, string>;
}) {
  return (
    <button type="button" onClick={onKlick} title={titel} className="lc-menu-zeile" {...attrs}>
      <span aria-hidden className="lc-menu-marke" />
      <span className="lc-menu-label">{label}</span>
      {rechts !== undefined && <span className="shrink-0 text-xs text-ink-500">{rechts}</span>}
    </button>
  );
}

/**
 * Schalter-Zeile (`role="switch"`, vom Aufrufer auf `menuitemcheckbox` bzw.
 * `menuitemradio` umgesetzt).
 *
 * DER ZUSTAND STEHT LINKS UND SAGT SICH GENAU EINMAL: bis zum D5-Nachzug stand
 * rechts «✓ an» bzw. «○ aus» — ein Zeichen UND ein Wort für dieselbe Auskunft,
 * an der Stelle, an die das Auge zuletzt kommt.
 *
 * ── D35-F4 (7.9.2026) · … UND ER SAGT SICH AUCH IM AUS-ZUSTAND ─────────────
 * Davids Bild: «Fussnoten» und «Fassung» lesen sich wie Rubriken, nicht wie
 * Schalter. Gemessen war das zutreffend — «aus» rendert bis hierher einen
 * LEEREN Hakenplatz; der einzige sichtbare Unterschied war die Tintenstufe der
 * Beschriftung. Eine Farbe allein trägt nie eine Auskunft (§13/F2), und wer
 * ein Menü mit drei ausgeschalteten Zeilen öffnet, sieht gar keinen Schalter.
 * JETZT trägt die Marke eine FORM, die in beiden Stellungen dasteht: ein
 * Kästchen (`kasten`, Vorgabe — eine Ja/Nein-Frage) oder ein Kreis (`punkt` —
 * eine Wahl aus mehreren, `menuitemradio`). Die Tintenstufe der Beschriftung
 * BLEIBT: sie ist jetzt die zweite Auskunft, nicht die einzige.
 *
 * Für Screenreader ändert sich nichts: die Auskunft trägt `aria-checked`, das
 * sichtbare Zeichen ist `aria-hidden` und damit nur für Sehende gedacht.
 */
export function MenueSchalter({ an, label, titel, onKlick, ariaLabel, form = 'kasten', attrs }: {
  an: boolean;
  label: string;
  titel: string;
  onKlick: () => void;
  ariaLabel?: string;
  /**
   * Die FORM der Marke, nicht ihre Rolle: `kasten` für eine Ja/Nein-Frage
   * (Vorgabe), `punkt` für eine Zeile, die eine von mehreren Möglichkeiten
   * wählt. Die ARIA-Rolle setzt weiterhin der Aufrufer über `attrs` — hier
   * steht nur, was man sieht (§3).
   */
  form?: 'kasten' | 'punkt';
  attrs?: Record<string, string>;
}) {
  const punkt = form === 'punkt';
  return (
    <button
      type="button" role="switch" aria-checked={an} aria-label={ariaLabel}
      title={titel} onClick={onKlick} {...attrs}
      className={`lc-menu-zeile ${an ? 'text-ink-900' : 'text-ink-600'}`}
    >
      {/* `aria-hidden`: die Zustandsauskunft trägt `aria-checked`, nicht das
          Zeichen — sonst hörte ein Screenreader sie zweimal. */}
      <span aria-hidden className="lc-menu-marke">
        <span data-an={an ? 'an' : 'aus'} data-menu-marke={form}
          className={`lc-menu-kasten${punkt ? ' lc-menu-punkt-form' : ''}`}>
          {an && (punkt ? <span className="lc-menu-punkt-kern" /> : '✓')}
        </span>
      </span>
      <span className="lc-menu-label" title={label}>{label}</span>
    </button>
  );
}

/**
 * Regler-Zeile: Label links, Steller rechts, EIGENE Zeile.
 *
 * Der Grund steht in Davids Befund: der Schriftregler sass in derselben Zeile
 * wie die Beschriftung «Nur Gesetzestext», die deshalb umbrach und den Regler
 * einquetschte. Ein Steller ist kein Zeilen-Anhängsel.
 */
export function MenueRegler({ label, children, ariaLabel }: {
  label: string;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="lc-menu-regler">
      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-body-s text-ink-700" title={label}>{label}</span>
      {children}
    </div>
  );
}
