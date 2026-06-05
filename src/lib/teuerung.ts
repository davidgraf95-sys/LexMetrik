import type { Berechnungsergebnis, Normverweis, Rechenschritt } from '../types/legal';
import { LIK_REIHEN, LIK_LETZTER_MONAT, LIK_STAND, LIK_QUELLE } from '../data/likReihe';

// ─── LIK-Teuerungsrechner (Art. 269b OR / Art. 17 VMWG · Art. 286/128 ZGB) ──
//
// Grundlage: Konzept-Bericht 5.6.2026. Kernformel aller drei Modi:
//   Betrag_neu = Betrag_alt × (Index_neu / Index_alt)
// Datenbasis: amtliche BFS-Indexierungstabelle (gerundete Originalbasen-
// Reihen, src/data/likReihe.ts — generiert, OPEN-BY). Basis-Wahl wie der
// offizielle BFS-Rechner («AUTO»): die JÜNGSTE Originalbasis, die beide
// Monate abdeckt — so entfallen Verkettungs-Rundungsfehler; das Verhältnis
// ist basisinvariant. Wortlaut-Verifikation: Art. 17 VMWG am Filestore-HTML
// (Konsolidierung 20251001) byte-genau geprüft; Art. 269b OR, Art. 286/128
// ZGB Anker empirisch verifiziert (5.6.2026).
// Rein, deterministisch, clientseitig — kein Date.now (Default-Endmonat =
// letzter publizierter Wert der hinterlegten Reihe).

export type TeuerungModus = 'generisch' | 'indexmiete' | 'unterhalt';
export type TeuerungRundung = '0.01' | '0.05' | '1';

export interface TeuerungInput {
  modus: TeuerungModus;
  betrag: number;            // CHF, > 0 (Miete: NETTOmietzins; Unterhalt: Beitrag gemäss Urteil)
  vonMonat: string;          // 'YYYY-MM' — Indexstand alt (Vertrag/Urteil/letzte Anpassung)
  bisMonat: string;          // 'YYYY-MM' — Indexstand neu
  rundung?: TeuerungRundung; // Default: Miete/Unterhalt 0.05, generisch 0.01
}

export type TeuerungErgebnis = Berechnungsergebnis & {
  indexAlt: number;
  indexNeu: number;
  basis: string;             // verwendete Originalbasis, z. B. '2005-12'
  prozent: number;           // Veränderung in % (eine Dezimalstelle, wie BFS)
  betragNeu: number;
};

const MONAT_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const MONATSNAMEN = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
export function monatLabel(m: string): string {
  const [j, mm] = m.split('-');
  return `${MONATSNAMEN[Number(mm) - 1]} ${j}`;
}

export const TEUERUNG_ERSTER_MONAT = '1966-09';
export { LIK_LETZTER_MONAT, LIK_STAND, LIK_QUELLE };

/** Jüngste Originalbasis, die BEIDE Monate abdeckt (BFS-«AUTO»-Logik). */
export function basisAuto(vonMonat: string, bisMonat: string): string | null {
  const basen = Object.keys(LIK_REIHEN).sort().reverse(); // jüngste zuerst
  for (const b of basen) {
    const r = LIK_REIHEN[b];
    if (r[vonMonat] !== undefined && r[bisMonat] !== undefined) return b;
  }
  return null;
}

export function indexWert(basis: string, monat: string): number | undefined {
  return LIK_REIHEN[basis]?.[monat];
}

function runden(wert: number, rundung: TeuerungRundung): number {
  if (rundung === '1') return Math.round(wert);
  if (rundung === '0.05') return Math.round(wert * 20) / 20;
  return Math.round(wert * 100) / 100;
}

const RUNDUNG_LABEL: Record<TeuerungRundung, string> = {
  '0.01': 'auf den Rappen', '0.05': 'auf 5 Rappen', '1': 'auf ganze Franken',
};

export function berechneTeuerung(input: TeuerungInput): TeuerungErgebnis {
  if (!(input.betrag > 0)) throw new Error('Betrag muss grösser als 0 sein.');
  if (!MONAT_RE.test(input.vonMonat) || !MONAT_RE.test(input.bisMonat)) {
    throw new Error('Monate im Format JJJJ-MM angeben.');
  }
  if (input.vonMonat >= input.bisMonat) {
    throw new Error('Der Ausgangsmonat muss vor dem Zielmonat liegen.');
  }
  if (input.bisMonat > LIK_LETZTER_MONAT) {
    throw new Error(`Der Indexstand ${monatLabel(input.bisMonat)} ist noch nicht publiziert — letzter verfügbarer Monat: ${monatLabel(LIK_LETZTER_MONAT)} (BFS publiziert im Folgemonat).`);
  }
  if (input.vonMonat < TEUERUNG_ERSTER_MONAT) {
    throw new Error(`Hinterlegt sind Indexstände ab ${monatLabel(TEUERUNG_ERSTER_MONAT)}.`);
  }

  const basis = basisAuto(input.vonMonat, input.bisMonat);
  if (!basis) throw new Error('Für diese Monate ist keine gemeinsame Indexbasis hinterlegt.');
  const indexAlt = indexWert(basis, input.vonMonat)!;
  const indexNeu = indexWert(basis, input.bisMonat)!;

  const faktor = indexNeu / indexAlt;
  const prozent = Math.round((faktor - 1) * 1000) / 10; // eine Dezimalstelle (BFS)
  const rundung = input.rundung ?? (input.modus === 'generisch' ? '0.01' : '0.05');
  const roh = input.betrag * faktor;
  const betragNeu = runden(roh, rundung);

  const fmtCHF = (n: number) => n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const N_269B: Normverweis = { artikel: 'Art. 269b OR', bemerkung: 'Indexmiete: nur LIK, Vertrag ≥ 5 Jahre' };
  const N_17: Normverweis = { artikel: 'Art. 17 VMWG', bemerkung: 'Erhöhung max. im Umfang der LIK-Zunahme; Senkungspflicht (Abs. 2)' };
  const N_286: Normverweis = { artikel: 'Art. 286 ZGB', bemerkung: 'Indexierung des Kindesunterhalts' };
  const N_128: Normverweis = { artikel: 'Art. 128 ZGB', bemerkung: 'Indexierung des nachehelichen Unterhalts (fakultativ)' };

  const normverweise: Normverweis[] =
    input.modus === 'indexmiete' ? [N_269B, N_17]
    : input.modus === 'unterhalt' ? [N_286, N_128]
    : [];

  const rechenweg: Rechenschritt[] = [
    {
      beschreibung: `Indexstand alt — ${monatLabel(input.vonMonat)} (Basis ${monatLabel(basis)} = 100)`,
      zwischenergebnis: `${indexAlt.toFixed(1)} Punkte`,
      normen: [],
    },
    {
      beschreibung: `Indexstand neu — ${monatLabel(input.bisMonat)} (gleiche Basis)`,
      zwischenergebnis: `${indexNeu.toFixed(1)} Punkte`,
      normen: [],
    },
    {
      beschreibung: `Veränderung: (${indexNeu.toFixed(1)} ÷ ${indexAlt.toFixed(1)} − 1) × 100`,
      zwischenergebnis: `${prozent > 0 ? '+' : ''}${prozent.toFixed(1)} %`,
      normen: input.modus === 'indexmiete' ? [N_17] : [],
    },
    {
      beschreibung: `Betrag neu: CHF ${fmtCHF(input.betrag)} × ${indexNeu.toFixed(1)} ÷ ${indexAlt.toFixed(1)}, gerundet ${RUNDUNG_LABEL[rundung]}`,
      zwischenergebnis: `CHF ${fmtCHF(betragNeu)}`,
      normen: input.modus === 'unterhalt' ? [N_286] : input.modus === 'indexmiete' ? [N_269B] : [],
    },
  ];

  const annahmen = [
    `Gerechnet mit den publizierten, GERUNDETEN BFS-Indexreihen auf der Originalbasis ${monatLabel(basis)} = 100 (BFS-«AUTO»-Wahl: jüngste Basis, die beide Monate abdeckt). Eine andere Basis ändert das Ergebnis nicht; Rundungsdifferenzen von ±0.1 Indexpunkt sind möglich und werden vom BFS im Folgemonat kompensiert.`,
    `${LIK_QUELLE} — ${LIK_STAND}. Freie Nutzung, Quellenangabe Pflicht (OPEN-BY).`,
  ];

  const warnungen: string[] = [];
  if (input.modus === 'indexmiete') {
    warnungen.push('Indexmiete: Die Anpassung bezieht sich auf den NETTOmietzins. Voraussetzungen: Vertrag für mindestens fünf Jahre, Bindung ausschliesslich an den LIK (Art. 269b OR). Die Erhöhung ist mit dem kantonal genehmigten amtlichen Formular und einer Frist von 30 Tagen auf ein Monatsende anzukündigen (Art. 17 Abs. 3, Art. 19 VMWG); der neue Indexstand muss publiziert sein (keine Vorwegnahme, Art. 19 Abs. 2 VMWG). Einziger Anfechtungsgrund ist die falsche Berechnung (Art. 270c OR).');
    warnungen.push('Wird ein indexierter Vertrag stillschweigend unbefristet fortgesetzt, kann sich der Vermieter nicht mehr auf die Indexklausel berufen (BGer 4A_252/2023 — zu verifizieren).');
  }
  if (input.modus === 'unterhalt') {
    warnungen.push('Unterhalts-Praxis: Index alt = Stand bei Urteil/Vereinbarung (bleibt konstant); Index neu = üblicherweise NOVEMBER des Vorjahres, Anpassung per 1. Januar. Massgeblich ist die Indexklausel im Urteil — häufige Vorbehalte: Anpassung nur bei teuerungsangepasstem Einkommen der pflichtigen Person (Beweislast bei ihr) oder erst je 10 Punkte Indexveränderung. Vergessene Anpassungen sind höchstens 5 Jahre rückwirkend nachforderbar.');
    warnungen.push('Ohne Indexklausel im Urteil besteht beim nachehelichen Unterhalt grundsätzlich kein Anpassungsanspruch (Art. 128 ZGB fakultativ; BGE 100 II 245 — zu verifizieren); die Indexierung wirkt dann auch bei sinkendem Index nach unten.');
  }
  if (prozent < 0 && input.modus === 'indexmiete') {
    warnungen.push('Der Index ist GESUNKEN: Bei Indexmiete besteht eine Senkungspflicht (Art. 17 Abs. 2 VMWG) — der Mieter kann die Herabsetzung verlangen.');
  }

  return {
    ergebnis: `CHF ${fmtCHF(betragNeu)} (${prozent > 0 ? '+' : ''}${prozent.toFixed(1)} %)`,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise,
    indexAlt, indexNeu, basis, prozent, betragNeu,
  };
}
