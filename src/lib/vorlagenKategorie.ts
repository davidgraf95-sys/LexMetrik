// ─── Vorlagen-Register (S-2 FAHRPLAN-STRUKTUR-UMBAU) ────────────────────────
//
// Auftrag David 10.6.2026 abends: «Vorlagen sollen unterteilt werden in
// Behördeneingaben, Verträge, Gesellschaftsrecht, Einseitige Willens-
// erklärungen. … Klage einmal allgemein in Schlichtungsgesuch, einfache
// [vereinfachte], ordentliche Klage und dann Klage besonders … Dann auch
// noch Kachel für Gesuche und sonstige Eingaben.»
// Die Gruppen sind die VORLAGE_SEKTIONEN (startseiteConfig, §5); hier leben
// nur die Unterrubriken der Behördeneingaben und die Anzeige-Helfer.
// Vollständigkeit erzwingt src/tests/vorlagenKategorie.test.ts.

import type { CalculatorCard, VorlageCard, EingabeRubrik } from './startseiteConfig';

export interface EingabeRubrikDef {
  id: EingabeRubrik;
  titel: string;
  lede: string;
}

export const EINGABE_RUBRIKEN: EingabeRubrikDef[] = [
  { id: 'klage_allgemein', titel: 'Klagen – allgemein',
    lede: 'Der Standard-Weg der Klage: Schlichtungsgesuch, Klage im vereinfachten und im ordentlichen Verfahren.' },
  { id: 'klage_besonders', titel: 'Klagen – besondere Verfahren',
    lede: 'Klagen mit eigenem Zuschnitt, nach Gebiet geordnet (Familienrecht, Haftpflicht, Zwangsvollstreckung …).' },
  { id: 'gesuch_sonstige', titel: 'Gesuche & sonstige Eingaben',
    lede: 'Gesuche, Begehren, Einsprachen und Beschwerden an Gerichte, Ämter und Behörden.' },
];

export const istVorlage = (k: CalculatorCard): k is VorlageCard => k.modus === 'vorlage';
