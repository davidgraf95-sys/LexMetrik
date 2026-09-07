import { useState } from 'react';
import { waehleBegruessung } from '../../lib/begruessungen';

// ─── Begrüssung und Tagesdatum der Startseite (W2·23-STARTSEITE-V4 §4) ──────
//
// W2·24-R3: aus der Zeile «Gruss + Datum» ist ein HOOK geworden. Grund ist der
// Satzspiegel: der Gruss steht in der Textspalte (kursive Literata), Wochentag
// und Datum stehen in der Marginalie links — zwei Orte, EINE Uhrzeit. Genau
// dafür braucht es den gemeinsamen Aufruf; zwei Komponenten mit je eigenem
// `new Date()` könnten (nachts, an der Monatsgrenze) auseinanderlaufen.
// Wortlaut, Pool und Zufallsquelle sind unverändert.
//
// ZUFALL, bewusst UND an der richtigen Schicht: der Gruss wird bei JEDEM
// Seitenaufruf neu aus dem Pool gezogen (Auftrag David 5.9.2026 «verschiedene
// Begrüssungen … etwas persönlicher»). Die Zufallsquelle `Math.random` steht
// HIER, in der Darstellungsschicht — `src/lib/**` sperrt sie mechanisch (§2,
// eslint no-restricted-properties), und das zu Recht: die Pool-Datei bleibt so
// rein und im Test deterministisch prüfbar. CLAUDE.md §2 ist nicht berührt: die
// Regel bindet die ENGINES (gleiche Eingabe → gleiche Frist, gleicher Betrag);
// diese Zeile trägt keinen Rechtswert und geht in keine Berechnung ein.
//
// PRERENDER: Gruss UND Datum divergieren zwischen Build und Client (der Build
// backt einen Gruss und den Build-Tag, der Client zieht neu). Beide Anzeigeorte
// tragen darum ehrlich `suppressHydrationWarning`. Ein min-height braucht es
// nicht: die Pool-Datei hält jeden Eintrag unter GRUSS_MAX_ZEICHEN (30), der
// Gruss bleibt also auch auf 390 px einzeilig (§15: kein Layout-Sprung, weil die
// Umbruchstelle nicht vom gezogenen Gruss abhängt).

// Datum «5. September 2026» + Wochentag getrennt — deterministisch ohne
// Locale-Abhängigkeit (SSR-stabil, keine Intl-Überraschungen zwischen Node und
// Browser).
const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export interface Heute {
  /** Gezogener Gruss aus dem Pool (`lib/begruessungen.ts`). */
  gruss: string;
  /** «Samstag» */
  wochentag: string;
  /** «5. September 2026» */
  datum: string;
}

/** Gruss, Wochentag und Datum aus EINER Uhrzeit (einmal beim Mount, lazy init). */
export function useHeute(): Heute {
  const [heute] = useState<Heute>(() => {
    const jetzt = new Date();
    return {
      gruss: waehleBegruessung(jetzt.getHours(), Math.random),
      wochentag: WOCHENTAGE[jetzt.getDay()],
      datum: `${jetzt.getDate()}. ${MONATE[jetzt.getMonth()]} ${jetzt.getFullYear()}`,
    };
  });
  return heute;
}
