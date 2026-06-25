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

/** Zeitbasierte Vorgabe (Auftrag David 19.6.2026): abends 20:00 bis morgens
 *  08:00 automatisch dunkel, sonst hell. SSR-sicher (new Date() im Build ist
 *  unkritisch — main.tsx wendet beim Client-Mount neu an). */
export function zeitThema(): Thema {
  const h = new Date().getHours();
  return h >= 20 || h < 8 ? 'dunkel' : 'hell';
}

/** Gespeicherte (manuelle) Wahl gewinnt; sonst die zeitbasierte Vorgabe. */
export function effektivesThema(): Thema {
  return gespeichertesThema() ?? zeitThema();
}

/** Wendet das Thema auf das Dokument an (Klasse + color-scheme + Browser-Chrome). */
export function wendeThemaAn(t: Thema): void {
  const el = document.documentElement;
  const dunkel = t === 'dunkel';
  el.classList.toggle('dark', dunkel);
  // Explizite .light-Klasse (statt nur Abwesenheit von .dark): macht die manuelle
  // Wahl eindeutig erkennbar — Grundlage für einen späteren Pre-Hydration-
  // prefers-color-scheme-Fallback (html:not(.light):not(.dark)).
  el.classList.toggle('light', !dunkel);
  el.style.colorScheme = dunkel ? 'dark' : 'light';
  // Browser-Chrome (meta theme-color) ans tatsächlich angezeigte Thema koppeln.
  // Die media-Tags in index.html decken den Vor-JS-Moment nach SYSTEM-Präferenz
  // ab. Der Browser nimmt laut WHATWG-Spec das ERSTE passende theme-color-Tag in
  // Baumreihenfolge → dieses media-lose Tag wird deshalb VOR die media-Tags
  // gestellt (gewinnt immer) und bildet so auch eine Wahl gegen die Systemvorgabe
  // ab (z. B. zeitThema = dunkel bei hellem System → dunkles Chrome statt hell).
  try {
    let m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
    if (!m) {
      m = document.createElement('meta');
      m.name = 'theme-color';
      // vor das erste vorhandene theme-color-Tag (null → ans Kopf-Ende = appendChild)
      document.head.insertBefore(m, document.head.querySelector('meta[name="theme-color"]'));
    }
    m.content = dunkel ? '#16150F' : '#F7F4EC';
  } catch { /* SSR/Prerender ohne document.head — unkritisch */ }
}

export function speichereThema(t: Thema): void {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* privater Modus o. Ä. — Thema gilt dann nur für die Sitzung */
  }
}
