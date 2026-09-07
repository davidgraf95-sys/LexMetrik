import type { KeyboardEvent } from 'react';

// ─── D4 (Gesamtprüfung W2·24, 7.9.2026) · ↑/↓/Home/End im «Ansicht»-Menü ──────
//
// Das eingelöste Versprechen von `role="menu"`: wer die Rolle nimmt, liefert die
// Pfeiltasten-Bedienung mit — genau die Bedingung, an der `LeserAnsichtV3` die
// Rolle bis 7.9.2026 abgelehnt hat. Der Ablauf ist zeichengleich der des
// Reiter-Kontextmenüs (`components/layout/ReiterMenue.tsx`, M4); Tab bleibt beim
// Dialog-Muster, Escape kommt aus `./usePopoverAutoZu`.
//
// WARUM EINE EIGENE DATEI: `LeserAnsichtV3.tsx` klemmt an der 420-Zeilen-Sonde
// des Fundaments (`src/tests/leser-v3-fundament.test.ts`, §6.6) — beim ersten
// Bau stand sie mit diesem Block bei 455. Ein Tasten-Fahrplan ist ohnehin keine
// Anordnung (§3), und hier ist er einzeln prüfbar.
//
// DER UMSCHLAG, nicht das Menü, trägt den Hörer: nach dem Öffnen liegt der Fokus
// auf der Schwebefläche selbst (`tabIndex={-1}`), und ein Hörer am inneren
// `role="menu"` bekäme den ersten Tastendruck nie zu sehen. Er kommt darum aus
// dem EREIGNIS (`currentTarget`) und nicht aus einem Ref — ein Ref, das im
// Render an eine Funktion gereicht wird, meldet `react-hooks/refs` (rot gesehen
// 7.9.2026), und gebraucht wird er ohnehin erst beim Tastendruck.
const EINTRAG = '[role="menuitem"], [role="menuitemcheckbox"]';

export function menueTastenFahrt(e: KeyboardEvent<HTMLElement>): void {
  const zeilen = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(EINTRAG));
  if (zeilen.length === 0) return;
  const i = zeilen.indexOf(document.activeElement as HTMLElement);
  const ziel = e.key === 'ArrowDown' ? (i < 0 ? 0 : (i + 1) % zeilen.length)
    : e.key === 'ArrowUp' ? (i <= 0 ? zeilen.length - 1 : i - 1)
      : e.key === 'Home' ? 0
        : e.key === 'End' ? zeilen.length - 1 : -1;
  if (ziel < 0) return;
  e.preventDefault();
  zeilen[ziel].focus();
}
