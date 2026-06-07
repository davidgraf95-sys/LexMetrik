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
//
// Beschriftungs-Überarbeitung (Auftrag David 7.6.2026, deklarierte
// Darstellungs-Änderung): Aktenzeichen wandert in Titel, Beschreibung und
// UID (zwei gleichnamige Fristen am selben Tag wurden sonst vom Kalender
// als Duplikat verschluckt); Beschreibung strukturiert (Ergebnis-Satz +
// Aktenzeichen + Permalink zur Berechnung + zentrale Fusszeile §8);
// URL-Property nach RFC 5545 §3.8.4.6; Vorfrist-Alarm nennt die Vorlaufzeit.

export type IcsFrist = {
  titel: string;
  endISO: string;
  beschreibung?: string;
  vorfristTage?: number;
  /** Mandats-/Aktenzeichen — erscheint in Titel, Beschreibung und UID. */
  aktenzeichen?: string;
  /** Permalink zur Berechnung — URL-Property + Zeile in der Beschreibung. */
  url?: string;
};

// Zentrale Fusszeile jedes Eintrags (§8) — die Formulare liefern nur noch
// den fachlichen Kontext (Ergebnis-Satz, Norm), nie mehr eigene Disclaimer.
const FUSSZEILE = 'Berechnet mit LexMetrik – automatisierte Orientierung, keine Rechtsberatung.';

const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// Deterministischer Kurz-Hash (djb2/xor, base36) für UID-Tokens, die über
// 24 Zeichen gekappt werden — die Kappung allein verlor das Aktenzeichen-
// Suffix und liess verschiedene Mandate auf DIESELBE UID kollidieren
// (Bug-Check 7.6.2026 M-1; Kalender deduplizieren dann stumm).
const kurzHash = (t: string): string => {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

const uidToken = (summary: string): string => {
  const voll = summary.replace(/\W+/g, '') || 'frist';
  return voll.length <= 24 ? voll : `${voll.slice(0, 24)}-${kurzHash(voll)}`;
};

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
  const az = opts.aktenzeichen?.trim() || undefined;
  const summary = az ? `${opts.titel} – ${az}` : opts.titel;
  const beschreibung = [
    opts.beschreibung,
    az ? `Aktenzeichen: ${az}` : undefined,
    opts.url ? `Berechnung: ${opts.url}` : undefined,
    FUSSZEILE,
  ].filter((z): z is string => Boolean(z)).join('\n');
  const vorfrist = opts.vorfristTage ?? 0;
  return [
    'BEGIN:VEVENT',
    // Titel-Token kann bei rein nicht-lateinischen Titeln leer werden →
    // deterministischer Fallback 'frist' (Review-Befund 6.6.2026, kosmetisch).
    // UID aus dem VOLLEN Summary (inkl. Aktenzeichen). Tokens ≤ 24 Zeichen
    // bleiben byte-identisch zu vorher (Re-Importe/Anker stabil); längere
    // erhalten einen Kurz-Hash des VOLLEN Tokens, sonst kollidieren Mandate,
    // deren Az erst nach Zeichen 24 divergiert (Bug-Check 7.6.2026 M-1).
    `UID:frist-${kompakt}-${uidToken(summary)}@lexmetrik`,
    `DTSTAMP:${kompakt}T000000Z`,
    `DTSTART;VALUE=DATE:${kompakt}`,
    `DTEND;VALUE=DATE:${folgetag}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(beschreibung)}`,
    // URL ist Value-Typ URI (kein TEXT) — nicht escapen, nur falten.
    ...(opts.url ? [`URL:${opts.url}`] : []),
    ...(vorfrist > 0
      ? ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`Vorfrist (${vorfrist === 1 ? '1 Tag' : `${vorfrist} Tage`}): ${summary}`)}`, `TRIGGER:-P${vorfrist}D`, 'END:VALARM']
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
