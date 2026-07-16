// src/components/fehlermeldung.ts — O-1.9 Client-Seite des Minimal-Fehlerkanals (QS-OPT).
//
// Sendet einen unerwarteten Laufzeit-/Render-Fehler GESAMPELT und fire-and-forget an
// /api/fehler (Edge, 'self'). Bewusst datensparsam und robust:
//   • NUR Fehlermeldung + aktuelle Route (pathname, KEINE Query/Hash — die könnten
//     Eingaben tragen) + Build-Kennung. Keine Eingaben, kein Stacktrace, kein
//     localStorage, kein Fingerprinting.
//   • Sampling im Client (STANDARD_QUOTE) hält das Volumen klein; die Server-Seite
//     ratenbegrenzt zusätzlich best-effort.
//   • Wirft NIE (ein Fehler im Fehler-Melder darf die App nicht zusätzlich stören)
//     und ist ein No-op ohne Netz/`fetch` (SSR, alte Browser).
//
// §3: reine Darstellungs-Infrastruktur, keine Rechtslogik — darum components/,
// nicht lib/ (dort ist Math.random per §2-Lint verboten; Sampling ist kein Rechnen).

/** Anteil der Fehler, der tatsächlich gemeldet wird (Rest wird verworfen). */
const STANDARD_QUOTE = 0.25;
const MAX_MELDUNG = 300;

/** Build-Kennung aus der Vite-Define (Vercel-Commit-SHA, sonst 'dev'). */
function buildKennung(): string {
  try {
    return (import.meta.env?.VITE_BUILD_ID as string | undefined) ?? 'dev';
  } catch {
    return 'dev';
  }
}

/** Nur der Pfad — bewusst OHNE search/hash, damit keine Eingaben durchsickern. */
function aktuelleRoute(): string {
  try {
    return typeof window !== 'undefined' ? window.location.pathname : '';
  } catch {
    return '';
  }
}

export interface MeldeOptionen {
  /** Sampling-Quote überschreiben (Tests/immer-melden); Default STANDARD_QUOTE. */
  quote?: number;
  /** Zufallszahl injizierbar (Determinismus im Test). */
  wuerfel?: () => number;
}

/**
 * Reine Entscheidung + Payload-Bau (testbar, ohne Netz): liefert den zu sendenden
 * Body oder null (verworfen / keine Meldung). Kappt die Meldung hart.
 */
export function baueMeldung(
  meldung: unknown,
  opt: MeldeOptionen = {},
): { meldung: string; route: string; build: string } | null {
  const text = typeof meldung === 'string' ? meldung.trim() : '';
  if (!text) return null;
  const quote = opt.quote ?? STANDARD_QUOTE;
  const wuerfel = opt.wuerfel ?? Math.random;
  if (wuerfel() >= quote) return null; // gesampelt verworfen
  return { meldung: text.slice(0, MAX_MELDUNG), route: aktuelleRoute(), build: buildKennung() };
}

/** Fire-and-forget-Meldung an /api/fehler. Wirft nie; No-op ohne fetch. */
export function meldeFehler(meldung: unknown, opt: MeldeOptionen = {}): void {
  try {
    const body = baueMeldung(meldung, opt);
    if (!body) return;
    if (typeof fetch !== 'function') return;
    // keepalive: die Meldung überlebt einen unmittelbar folgenden Seitenwechsel/Reload.
    void fetch('/api/fehler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {
      /* Netzfehler im Fehler-Melder bewusst schlucken. */
    });
  } catch {
    /* niemals werfen */
  }
}
