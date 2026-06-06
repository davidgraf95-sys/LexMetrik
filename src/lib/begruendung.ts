import type { Berechnungsergebnis, Normverweis } from '../types/legal';

// ─── Begründungs-Absatz für Rechtsschriften (FAHRPLAN-PRAXIS 2.2) ───────────
//
// Komponiert aus dem OHNEHIN vorhandenen Engine-Ergebnis (Ergebnissatz +
// Normverweise) einen kopierfertigen Fliesstext-Absatz — KEINE neue
// Rechtslogik, reine deterministische Formulierung (§2/§3). Der Ergebnissatz
// der Engines ist bereits konventionsgeprüft (konventionen.test); hier kommen
// nur die Norm-Nennung und optional ein rechnerspezifischer Zusatzsatz dazu.

const MAX_NORMEN = 6;

function normenSatz(normverweise: Normverweis[]): string {
  const gesehen = new Set<string>();
  const artikel: string[] = [];
  for (const n of normverweise) {
    if (gesehen.has(n.artikel)) continue;
    gesehen.add(n.artikel);
    artikel.push(n.artikel);
  }
  if (artikel.length === 0) return '';
  const gezeigt = artikel.slice(0, MAX_NORMEN);
  const rest = artikel.length - gezeigt.length;
  return ` Massgebend sind ${gezeigt.join(', ')}${rest > 0 ? ' u. a.' : ''}.`;
}

/**
 * Kopierfertiger Absatz: Ergebnissatz der Engine + Norm-Nennung + optionaler
 * rechnerspezifischer Zusatz (z. B. Fristbeginn/-ende-Satz der Form — der
 * Zusatz wird aus Engine-FELDERN formuliert, nie neu gerechnet).
 */
export function begruendungsAbsatz(e: Berechnungsergebnis, zusatz?: string): string {
  const teile = [e.ergebnis.trim()];
  if (zusatz?.trim()) teile.push(zusatz.trim());
  let text = teile.join(' ');
  if (!/[.!?]$/.test(text)) text += '.';
  text += normenSatz(e.normverweise);
  return text;
}
