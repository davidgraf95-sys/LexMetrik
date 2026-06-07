// ─── Geteilter .ics-Download (Blob → ObjectURL → Klick → revoke) ────────────
// Eigene Datei (kein Component-Export), damit react-refresh sauber bleibt.
// Code-Review #8 (7.6.2026): das Boilerplate war im Fristenspiegel handgerollt
// dupliziert und drohte gegenüber dem IcsExportButton zu driften. Der
// ICS-INHALT kommt weiterhin deterministisch aus lib/icsExport.ts (§3).

export function ladeIcs(dateiName: string, inhalt: string): void {
  const blob = new Blob([inhalt], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = dateiName; a.click();
  URL.revokeObjectURL(url);
}
