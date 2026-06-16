// Zitat-Zerlegung. Das Artikel-Token folgt dem Fedlex-Anker-Format
// (335c → 335_c, 334bis → 334_bis), kongruent zu src/lib/fedlex.ts.
const ART = /(?:Art\.?|§)\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)/i;
// Lat. Suffixe (bis/ter/…) wie bei ART zuerst, sonst verstümmelt «Abs. 1bis»
// zu «1b» (B2). Reihenfolge: Suffix vor optionalem Einzel-Buchstaben.
const ABS = /Abs\.?\s*(\d+(?:bis|ter|quater|quinquies)?[a-z]?)/i;
// lit./Bst. b  →  Buchstaben-Punkt; Ziff./Ziffer 17  →  Ziffern-Punkt.
// Schlüsselwort mit Punkt ODER Wortgrenze, damit «litera a» NICHT als
// «lit» + «e» (Match mitten im Wort «litera») fehlinterpretiert wird (B3):
// nach «lit»/«Bst» muss ein Punkt oder eine Wortgrenze (\b) folgen.
const LIT = /(?:lit\.|Bst\.|\blit\b|\bBst\b)\s*([a-z](?:bis|ter)?)\b/i;
const ZIFF = /(?:Ziff\.|Ziffer|\bZiff\b)\s*(\d+[a-z]?)/i;
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
  // Bewusst First-Match: bei verketteten Zitaten («… i.V.m. Ziff. X») wird die
  // ERSTE genannte lit/Ziff übernommen. Das ist gewollt (das Popover hebt die
  // primär zitierte Stelle hervor); die Wortgrenze in LIT/ZIFF stellt nur
  // sicher, dass keine Marke mitten aus einem Wort gegriffen wird (B3).
  return passus;
}

// Text-Fragment für externe Links (Chromium hebt hervor, andere ignorieren).
// Erste 6 Wörter genügen für eine eindeutige Sprungmarke.
export function textFragment(text: string): string {
  const woerter = text.trim().split(/\s+/).slice(0, 6).join(' ');
  return `#:~:text=${encodeURIComponent(woerter)}`;
}
