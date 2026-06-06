// ─── Pro-Sitzung (clientseitig) ─────────────────────────────────────────────
//
// Wer den Pro-Bereich betritt, ist «eingeloggt» und bleibt es über
// Neuladen hinweg (localStorage). Der Header zeigt dann «Ausloggen» statt
// des Pro-Pfeils; «/» führt eingeloggt direkt nach /pro. Dieses Modul ist
// der spätere Andockpunkt für das Zahlungs-Gate (Phase 4, PAYWALL_ACTIVE;
// Zahlungssystem bewusst noch nicht definiert — Entscheid David 6.6.2026):
// proEinloggen() wird dann erst nach erfolgreichem Kauf aufgerufen.
// SSR-/Privacy-sicher: jeder Zugriff in try/catch, kein Tracking.

const KEY = 'lexmetrik.pro.v1';

export function istProEingeloggt(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function proEinloggen(): void {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* Speicher nicht verfügbar – Sitzung gilt nur für die laufende Ansicht */
  }
}

export function proAusloggen(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* leer */
  }
}
