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

import type { CalculatorCard, VorlageCard, EingabeRubrik, VertragRubrik, FormGate } from './startseiteConfig';

export interface EingabeRubrikDef {
  id: EingabeRubrik;
  titel: string;
  lede: string;
}

export const EINGABE_RUBRIKEN: EingabeRubrikDef[] = [
  { id: 'klage_allgemein', titel: 'Klagen – allgemein',
    lede: 'Der Standard-Weg der Klage: Schlichtungsgesuch, Klage im vereinfachten und im ordentlichen Verfahren.' },
  // Bug-Check §9 10.6.2026 (fachliche Lupe, NIEDRIG): «besondere
  // Konstellationen» statt «besondere Verfahren» — Letzteres ist in der
  // ZPO der Titel des vereinfachten/summarischen Verfahrens, das hier
  // gerade unter «allgemein» steht.
  { id: 'klage_besonders', titel: 'Klagen – besondere Konstellationen',
    lede: 'Klagen mit eigenem Zuschnitt, nach Gebiet geordnet (Familienrecht, Haftpflicht, Zwangsvollstreckung …).' },
  { id: 'gesuch_sonstige', titel: 'Gesuche & sonstige Eingaben',
    lede: 'Gesuche, Begehren, Erklärungen (z. B. Rechtsvorschlag), Einsprachen und Beschwerden an Gerichte, Ämter und Behörden.' },
];

export const istVorlage = (k: CalculatorCard): k is VorlageCard => k.modus === 'vorlage';

// ─── Verträge-Rubriken (FAHRPLAN-VORLAGEN-AUSBAU V1) ────────────────────────
//
// Skalierbare Untergliederung der Sektion II «Verträge» (Wettbewerbsanalyse
// 12.6.2026, Abschn. 6.1): EIN Katalog-Eintrag pro Vertragstyp, Varianten
// leben im Wizard — die Rubriken machen die Sektion bei wachsendem Bestand
// lesbar. Rubriken ohne Karten erscheinen nicht (Katalog filtert leere).
// Vollständigkeit erzwingt src/tests/vorlagenKategorie.test.ts.

export interface VertragRubrikDef {
  id: VertragRubrik;
  titel: string;
  lede: string;
}

export const VERTRAG_RUBRIKEN: VertragRubrikDef[] = [
  { id: 'arbeit', titel: 'Arbeit & Personal',
    lede: 'Arbeitsvertrag und Vereinbarungen rund ums Arbeitsverhältnis.' },
  { id: 'miete_pacht', titel: 'Miete & Pacht',
    lede: 'Gebrauchsüberlassung von Wohn- und Geschäftsräumen und weiteren Objekten.' },
  { id: 'kauf', titel: 'Kauf & Schenkung',
    lede: 'Übertragung von Sachen – gegen Preis oder unentgeltlich.' },
  { id: 'auftrag_werk', titel: 'Auftrag & Werkvertrag',
    lede: 'Dienstleistungen und die Herstellung von Werken.' },
  { id: 'darlehen_sicherheiten', titel: 'Darlehen, Sicherheiten & Forderung',
    lede: 'Kredite, Sicherungsgeschäfte und Vereinbarungen über Forderungen.' },
  { id: 'familie', titel: 'Familie & Partnerschaft',
    lede: 'Vereinbarungen unter Ehegatten, Eltern und Konkubinatspaaren.' },
  { id: 'zusammenarbeit', titel: 'Zusammenarbeit & Geheimhaltung',
    lede: 'Kooperationen und der Schutz vertraulicher Informationen.' },
];

// ─── Form-Gate-Zeile der Vorlagen-Karten (V1) ───────────────────────────────
//
// Drei feste Formulierungen + Mappen-Mischfall; Quelle ist der formGate-
// Spiegel der Karte (SSoT = Schema-ausgabeArt, erzwungen durch
// formGate.test.ts). EIN zusammengesetzter String je Karte (SSR-Regel).

const FORMAT_LABEL = { pdf: 'PDF', docx: 'DOCX', xlsx: 'XLSX' } as const;

export function formGateText(v: VorlageCard): string | undefined {
  if (!v.formGate) return undefined;
  const formate = (v.output ?? ['pdf']).map((f) => FORMAT_LABEL[f]).join('/');
  const texte: Record<FormGate, string> = {
    fertig: `druckfertig (${formate})`,
    abschrift: 'Abschreibvorlage – von Hand zu errichten',
    entwurf: 'Entwurf – öffentliche Beurkundung nötig',
    gemischt: 'Mappe – teils druckfertig, teils Beurkundungs-Entwurf',
  };
  return texte[v.formGate];
}
