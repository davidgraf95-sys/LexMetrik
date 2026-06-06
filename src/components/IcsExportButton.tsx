import { icsFuerFrist } from '../lib/icsExport';

// ─── «In Kalender (.ics)»-Button — geteilter Baustein (FAHRPLAN-PRAXIS 1.1) ─
// Kapselt den clientseitigen Download (Blob, kein Netzwerk); der Inhalt kommt
// deterministisch aus lib/icsExport.ts. Reine Darstellung (§3).

export function IcsExportButton({ titel, endISO, beschreibung, vorfristTage = 3, dateiName = 'Fristende.ics', className = 'lc-btn-outline' }: {
  titel: string;
  /** Fristende als yyyy-MM-dd — der Button rendert nur bei gültigem Wert. */
  endISO: string | undefined | null;
  beschreibung?: string;
  /** Vorfrist-Alarm in Tagen (0 = keiner). Default 3. */
  vorfristTage?: number;
  dateiName?: string;
  className?: string;
}) {
  if (!endISO || !/^\d{4}-\d{2}-\d{2}$/.test(endISO)) return null;
  const laden = () => {
    const blob = new Blob([icsFuerFrist({ titel, endISO, beschreibung, vorfristTage })], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = dateiName; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" className={className} onClick={laden}>
      In Kalender (.ics)
    </button>
  );
}
