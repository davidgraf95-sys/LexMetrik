// Zitat-Zerlegung. Das Artikel-Token folgt dem Fedlex-Anker-Format
// (335c → 335_c, 334bis → 334_bis), kongruent zu src/lib/fedlex.ts.
const ART = /(?:Art\.?|§)\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)/i;
const ABS = /Abs\.?\s*(\d+[a-z]?)/i;
// lit./Bst. b  →  Buchstaben-Punkt; Ziff./Ziffer 17  →  Ziffern-Punkt.
const LIT = /(?:lit\.?|Bst\.?)\s*([a-z](?:bis|ter)?)/i;
const ZIFF = /(?:Ziff\.?|Ziffer)\s*(\d+[a-z]?)/i;
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/;

/**
 * Zerlegtes Zitat. lit/ziff sind nur gesetzt, wenn das Zitat sie nennt
 * (sonst weggelassen — die Felder sind optional, damit Bestandstests
 * mit `toEqual({ artikelToken, absatz })` ohne lit/ziff sauber bleiben).
 */
export interface Passus {
  artikelToken: string;
  absatz: string | null;
  lit?: string;
  ziff?: string;
}

export function parsePassus(zitat: string): Passus | null {
  const a = zitat.match(ART);
  if (!a) return null;
  const artikelToken = a[1].toLowerCase()
    .replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
  const abs = zitat.match(ABS);
  const passus: Passus = { artikelToken, absatz: abs ? abs[1].toLowerCase() : null };
  const lit = zitat.match(LIT);
  if (lit) passus.lit = lit[1].toLowerCase();
  const ziff = zitat.match(ZIFF);
  if (ziff) passus.ziff = ziff[1].toLowerCase();
  return passus;
}

// Text-Fragment für externe Links (Chromium hebt hervor, andere ignorieren).
// Erste 6 Wörter genügen für eine eindeutige Sprungmarke.
export function textFragment(text: string): string {
  const woerter = text.trim().split(/\s+/).slice(0, 6).join(' ');
  return `#:~:text=${encodeURIComponent(woerter)}`;
}
