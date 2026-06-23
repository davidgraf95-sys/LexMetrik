// ─── Besuchs-Verlauf «Weiter wo du warst» (Startseite-Überarbeitung) ────────
//
// SSoT des localStorage-Keys 'lexmetrik-verlauf' (§5). Reines Speicher-Werkzeug,
// KEINE Rechtslogik (§3) — ein Ringpuffer der zuletzt geöffneten Routen. Bewusst
// werden NUR Navigationspfade gespeichert (Pfad + optionales Anzeige-Label),
// niemals Formularinhalte: die Rechner-/Vorlagen-Formulare halten ihre Eingaben
// im Komponenten-State, nicht in der URL (Berufsgeheimnis, geteilte Geräte; ein
// «Verlauf löschen»-Knopf in der Verlauf-Schiene ergänzt das). Die Reihenfolge
// ergibt sich allein aus der Array-Position (neueste vorn) — kein Zeitstempel,
// also kein Date.now() in src/lib (§2 Determinismus).

export interface VerlaufEintrag {
  /** Vollständiges Navigationsziel (pathname + ?search + #hash). */
  path: string;
  /** Vorab aufgelöstes Label (Katalog/statische Seiten); für :key-Routen leer
   *  und erst beim Rendern aus den Manifesten aufgelöst. */
  label?: string;
}

const KEY = 'lexmetrik-verlauf';
const MAX = 12;

/** Nur der pathname-Anteil — Dublettenschlüssel (verschiedene ?-Presets desselben
 *  Rechners gelten als derselbe Eintrag und rücken nach vorn). */
function pfadTeil(path: string): string {
  return path.split(/[?#]/)[0];
}

export function ladeVerlauf(): VerlaufEintrag[] {
  try {
    const roh = localStorage.getItem(KEY);
    const arr = roh ? JSON.parse(roh) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((e): e is VerlaufEintrag =>
        e && typeof e.path === 'string' &&
        (e.label === undefined || typeof e.label === 'string'))
      .slice(0, MAX);
  } catch {
    return [];
  }
}

/** Merkt eine besuchte Route vorne im Ringpuffer (Dublette per pathname
 *  zusammengeführt, neueste zuerst, gekappt auf MAX). Idempotent gegen
 *  Mehrfach-Aufrufe desselben Pfads. */
export function merkePfad(path: string, label?: string): void {
  try {
    const teil = pfadTeil(path);
    const bisher = ladeVerlauf().filter((e) => pfadTeil(e.path) !== teil);
    const naechste: VerlaufEintrag[] = [{ path, ...(label ? { label } : {}) }, ...bisher].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(naechste));
  } catch {
    /* privater Modus / kein localStorage — Verlauf ist Komfort, kein Muss */
  }
}

export function loescheVerlauf(): void {
  try { localStorage.removeItem(KEY); } catch { /* privater Modus */ }
}
