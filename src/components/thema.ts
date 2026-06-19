// ─── Thema (Hell/Dunkel) — Darstellungs-Infrastruktur, KEINE Rechtslogik (§3) ─
//
// Schaltet den Dunkelmodus über die .dark-Klasse am <html> (Token-Override in
// index.css). Bewusst KEIN Inline-Script (CSP script-src 'self' verbietet es;
// der Prerender-Drift-Wächter ebenso) — das Thema wird beim Client-Mount
// angewandt (main.tsx) und vom Umschalter gepflegt. Liegt neben components/
// locale.tsx, weil es zur App-/UI-Schicht gehört, nicht zur Engine-Schicht.

export type Thema = 'hell' | 'dunkel';

const KEY = 'lexmetrik-thema';

/** Ausdrückliche Wahl aus dem letzten Besuch (sonst null → System entscheidet). */
export function gespeichertesThema(): Thema | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'hell' || v === 'dunkel' ? v : null;
  } catch {
    return null;
  }
}

/** System-Vorgabe (prefers-color-scheme); Fallback hell (SSR-sicher). */
export function systemThema(): Thema {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dunkel' : 'hell';
  } catch {
    return 'hell';
  }
}

/** Gespeicherte Wahl, sonst System. */
export function effektivesThema(): Thema {
  return gespeichertesThema() ?? systemThema();
}

/** Wendet das Thema auf das Dokument an (Klasse + color-scheme). */
export function wendeThemaAn(t: Thema): void {
  const el = document.documentElement;
  el.classList.toggle('dark', t === 'dunkel');
  el.style.colorScheme = t === 'dunkel' ? 'dark' : 'light';
}

export function speichereThema(t: Thema): void {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* privater Modus o. Ä. — Thema gilt dann nur für die Sitzung */
  }
}
