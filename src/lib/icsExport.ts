import { parseISO, addDays } from 'date-fns';
import { formatISO } from './datumsUtils';

// ─── Kalender-Export (.ics, RFC 5545) — geteilter Baustein ─────────────────
//
// FAHRPLAN-PRAXIS Etappe 1.1 (Auftrag David 6.6.2026): verhaltensneutral aus
// lib/allgemeineFrist.ts hierher gelöst (§6/§10), damit ALLE Fristenrechner
// denselben Export nutzen. Deterministisch: DTSTAMP/UID leiten sich aus dem
// Fristdatum ab, kein Date.now() (§2). Ganztages-Event am Fristende mit
// optionalem Vorfrist-Alarm.
//
// Etappe 3.1b (Fristenspiegel): esc/falte/VEVENT-Bau aus der Closure auf
// Modulebene gehoben (§6, byte-identischer Einzel-Export — Anker-Test) und
// icsSammel() ergänzt: MEHRERE VEVENTs in EINEM VCALENDAR (Sammel-Export).

export type IcsFrist = { titel: string; endISO: string; beschreibung?: string; vorfristTage?: number };

const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// RFC 5545 §3.1: Zeilen über 75 Oktette falten (CRLF + Leerzeichen).
const falte = (zeile: string): string => {
  const enc = new TextEncoder();
  if (enc.encode(zeile).length <= 75) return zeile;
  let rest = zeile;
  const teile: string[] = [];
  while (enc.encode(rest).length > 75) {
    let schnitt = 75 - (teile.length ? 1 : 0);
    while (schnitt > 1 && enc.encode(rest.slice(0, schnitt)).length > 75 - (teile.length ? 1 : 0)) schnitt--;
    // Nie mitten im Surrogate-Paar schneiden (Deploy-Bug-Check 7.6.2026,
    // NIEDRIG): slice() arbeitet in UTF-16-Code-Units — endet der Schnitt
    // auf einem High-Surrogate (z. B. Emoji), entstünden zwei einzelne
    // Lone-Surrogates und damit ungültiges UTF-8 im VCALENDAR.
    const code = rest.charCodeAt(schnitt - 1);
    if (schnitt > 1 && code >= 0xd800 && code <= 0xdbff) schnitt--;
    teile.push(rest.slice(0, schnitt));
    rest = rest.slice(schnitt);
  }
  teile.push(rest);
  return teile.join('\r\n ');
};

// Ein VEVENT-Block (ohne Kalender-Rahmen) — von Einzel- und Sammel-Export geteilt.
function veventZeilen(opts: IcsFrist): string[] {
  const kompakt = opts.endISO.replace(/-/g, '');
  const folgetag = formatISO(addDays(parseISO(opts.endISO), 1)).replace(/-/g, '');
  return [
    'BEGIN:VEVENT',
    // Titel-Token kann bei rein nicht-lateinischen Titeln leer werden →
    // deterministischer Fallback 'frist' (Review-Befund 6.6.2026, kosmetisch)
    `UID:frist-${kompakt}-${opts.titel.replace(/\W+/g, '').slice(0, 24) || 'frist'}@lexmetrik`,
    `DTSTAMP:${kompakt}T000000Z`,
    `DTSTART;VALUE=DATE:${kompakt}`,
    `DTEND;VALUE=DATE:${folgetag}`,
    `SUMMARY:${esc(opts.titel)}`,
    ...(opts.beschreibung ? [`DESCRIPTION:${esc(opts.beschreibung)}`] : []),
    ...(opts.vorfristTage && opts.vorfristTage > 0
      ? ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Vorfrist: ${opts.titel}`)}`, `TRIGGER:-P${opts.vorfristTage}D`, 'END:VALARM']
      : []),
    'END:VEVENT',
  ];
}

const KALENDER_KOPF = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LexMetrik//Fristenrechner//DE', 'CALSCALE:GREGORIAN'];

export function icsFuerFrist(opts: IcsFrist): string {
  const zeilen = [...KALENDER_KOPF, ...veventZeilen(opts), 'END:VCALENDAR'];
  return zeilen.map(falte).join('\r\n') + '\r\n';
}

/**
 * Sammel-Export: alle Fristen eines Fristenspiegels als EIN Kalender mit
 * n Events (Fahrplan-Praxis 3.1b). UIDs bleiben deterministisch je Frist;
 * Einträge ohne gültiges ISO-Ende werden übersprungen (defensiv).
 */
export function icsSammel(eintraege: IcsFrist[]): string {
  const gueltig = eintraege.filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.endISO));
  const zeilen = [...KALENDER_KOPF, ...gueltig.flatMap(veventZeilen), 'END:VCALENDAR'];
  return zeilen.map(falte).join('\r\n') + '\r\n';
}
