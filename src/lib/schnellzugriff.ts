// ─── Schnellzugriff: Favoriten + Zuletzt verwendet (Pro-Katalog, Phase 4) ───
//
// Clientseitig in localStorage, Schlüssel nach bestehender Konvention
// (Punkt + Version, wie lexmetrik.vorlage.*.v1 / lexmetrik.pro.v1 —
// deklarierte Abweichung vom Auftrags-Beispiel «lexmetrik:favoriten»).
// Kein Backend, keine Synchronisation (Berufsgeheimnis-Prinzip). Defensive
// Filterung gegen unbekannte/entfernte IDs erfolgt beim KONSUM (UI filtert
// gegen die aktuelle Config), nicht beim Speichern.

const FAV_KEY = 'lexmetrik.favoriten.v1';
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

export function ladeFavoriten(): string[] {
  return lese(FAV_KEY);
}

/** Stern an/aus; gibt die neue Liste zurück (für setState). */
export function toggleFavorit(id: string): string[] {
  const alt = lese(FAV_KEY);
  const neu = alt.includes(id) ? alt.filter((x) => x !== id) : [...alt, id];
  schreibe(FAV_KEY, neu);
  return neu;
}

export function ladeZuletzt(): string[] {
  return lese(ZULETZT_KEY);
}

/** Beim Öffnen eines Tools: nach vorn, dedupliziert, max. 6. */
export function merkeZuletzt(id: string): void {
  const neu = [id, ...lese(ZULETZT_KEY).filter((x) => x !== id)].slice(0, ZULETZT_MAX);
  schreibe(ZULETZT_KEY, neu);
}
