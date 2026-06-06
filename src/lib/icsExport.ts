import { parseISO, addDays } from 'date-fns';
import { formatISO } from './datumsUtils';

// ─── Kalender-Export (.ics, RFC 5545) — geteilter Baustein ─────────────────
//
// FAHRPLAN-PRAXIS Etappe 1.1 (Auftrag David 6.6.2026): verhaltensneutral aus
// lib/allgemeineFrist.ts hierher gelöst (§6/§10), damit ALLE Fristenrechner
// denselben Export nutzen. Deterministisch: DTSTAMP/UID leiten sich aus dem
// Fristdatum ab, kein Date.now() (§2). Ganztages-Event am Fristende mit
// optionalem Vorfrist-Alarm.

export function icsFuerFrist(opts: { titel: string; endISO: string; beschreibung?: string; vorfristTage?: number }): string {
  const kompakt = opts.endISO.replace(/-/g, '');
  const folgetag = formatISO(addDays(parseISO(opts.endISO), 1)).replace(/-/g, '');
  const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const zeilen = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LexMetrik//Fristenrechner//DE',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:frist-${kompakt}-${opts.titel.replace(/\W+/g, '').slice(0, 24)}@lexmetrik`,
    `DTSTAMP:${kompakt}T000000Z`,
    `DTSTART;VALUE=DATE:${kompakt}`,
    `DTEND;VALUE=DATE:${folgetag}`,
    `SUMMARY:${esc(opts.titel)}`,
    ...(opts.beschreibung ? [`DESCRIPTION:${esc(opts.beschreibung)}`] : []),
    ...(opts.vorfristTage && opts.vorfristTage > 0
      ? ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Vorfrist: ${opts.titel}`)}`, `TRIGGER:-P${opts.vorfristTage}D`, 'END:VALARM']
      : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // RFC 5545 §3.1: Zeilen über 75 Oktette falten (CRLF + Leerzeichen).
  const falte = (zeile: string): string => {
    const enc = new TextEncoder();
    if (enc.encode(zeile).length <= 75) return zeile;
    let rest = zeile;
    const teile: string[] = [];
    while (enc.encode(rest).length > 75) {
      let schnitt = 75 - (teile.length ? 1 : 0);
      while (schnitt > 1 && enc.encode(rest.slice(0, schnitt)).length > 75 - (teile.length ? 1 : 0)) schnitt--;
      teile.push(rest.slice(0, schnitt));
      rest = rest.slice(schnitt);
    }
    teile.push(rest);
    return teile.join('\r\n ');
  };
  return zeilen.map(falte).join('\r\n') + '\r\n';
}
