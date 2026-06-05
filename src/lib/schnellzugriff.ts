// ─── Schnellzugriff: Zuletzt verwendet (Pro-Katalog) ────────────────────────
//
// Clientseitig in localStorage, Schlüssel nach bestehender Konvention
// (Punkt + Version, wie lexmetrik.vorlage.*.v1 / lexmetrik.pro.v1).
// Kein Backend, keine Synchronisation (Berufsgeheimnis-Prinzip). Defensive
// Filterung gegen unbekannte/entfernte IDs erfolgt beim KONSUM (UI filtert
// gegen die aktuelle Config), nicht beim Speichern.
// Favoriten entfernt (Anweisung David 5.6.2026); der alte Schlüssel
// «lexmetrik.favoriten.v1» bleibt in bestehenden Browsern liegen und wird
// schlicht nicht mehr gelesen.

const ZULETZT_KEY = 'lexmetrik.zuletzt.v1';
const ZULETZT_MAX = 6;

function lese(key: string): string[] {
  try {
    const roh = localStorage.getItem(key);
    const wert: unknown = roh ? JSON.parse(roh) : [];
    return Array.isArray(wert) ? wert.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function schreibe(key: string, ids: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* Speicher nicht verfügbar – Schnellzugriff bleibt sitzungslokal leer */
  }
}

export function ladeZuletzt(): string[] {
  return lese(ZULETZT_KEY);
}

/** Beim Öffnen eines Tools: nach vorn, dedupliziert, max. 6. */
export function merkeZuletzt(id: string): void {
  const neu = [id, ...lese(ZULETZT_KEY).filter((x) => x !== id)].slice(0, ZULETZT_MAX);
  schreibe(ZULETZT_KEY, neu);
}
