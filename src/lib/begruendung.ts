import type { Berechnungsergebnis, Normverweis } from '../types/legal';

// ─── Begründungs-Absatz für Rechtsschriften (FAHRPLAN-PRAXIS 2.2) ───────────
//
// Komponiert aus dem OHNEHIN vorhandenen Engine-Ergebnis (Ergebnissatz +
// Normverweise) einen kopierfertigen Fliesstext-Absatz — KEINE neue
// Rechtslogik, reine deterministische Formulierung (§2/§3). Der Ergebnissatz
// der Engines ist bereits konventionsgeprüft (konventionen.test); hier kommen
// nur die Norm-Nennung und optional ein rechnerspezifischer Zusatzsatz dazu.

const MAX_NORMEN = 6;

/**
 * §8-Vorbehalt zum kopierfertigen Absatz — EINE Quelle (§5), damit UI und
 * (ab Phase 3) der PDF-Block denselben sichtbaren Hinweis tragen. Ohne ihn
 * wirkte der gedruckte Absatz fälschlich geprüft.
 */
export const BEGRUENDUNG_VORBEHALT =
  'Formuliert aus dem Rechenergebnis — vor Verwendung im Schriftsatz fachlich prüfen.';

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
  // «u. a.» trägt schon den abschliessenden Punkt (sonst doppelter Punkt
  // «u. a..» im kopierten Rechtsschrift-Absatz, §13/F6).
  return ` Massgebend sind ${gezeigt.join(', ')}${rest > 0 ? ' u. a.' : '.'}`;
}

/**
 * Fristbeginn-Satz aus Engine-FELDERN (Code-Review-Befund #5, 7.6.2026):
 * zentral formuliert, damit alle Frist-Rechner denselben Rechtsschrift-
 * Baustein liefern und die Norm-Zitierung aus der Engine kommt — nie im
 * UI hartcodiert (vgl. HOCH-Befund Art. 142 Abs. 1/2 im Deploy-Bug-Check).
 * Ohne Beginn-Datum (z. B. Rückwärtsfrist) entfällt der Satz ersatzlos.
 */
export function fristbeginnZusatz(beginnISO: string | null | undefined, normLabel?: string): string | undefined {
  if (!beginnISO) return undefined;
  const datum = beginnISO.split('-').reverse().join('.');
  return `Der Fristenlauf begann am ${datum}${normLabel ? ` (${normLabel})` : ''}.`;
}

/**
 * Kopierfertiger Absatz: Ergebnissatz der Engine + Norm-Nennung + optionaler
 * rechnerspezifischer Zusatz (z. B. Fristbeginn/-ende-Satz der Form — der
 * Zusatz wird aus Engine-FELDERN formuliert, nie neu gerechnet).
 */
export function begruendungsAbsatz(e: Berechnungsergebnis, zusatz?: string): string {
  // Kein Ergebnistext → kein Absatz (statt eines blossen «.»); der Baustein
  // rendert dann null. Reale Engines liefern stets einen Ergebnissatz; diese
  // Schranke wirkt nur bei leerem/Negativ-Platzhalter (Richtung Kritik-6).
  const kern = e.ergebnis.trim();
  if (!kern) return '';
  const teile = [kern];
  if (zusatz?.trim()) teile.push(zusatz.trim());
  let text = teile.join(' ');
  if (!/[.!?]$/.test(text)) text += '.';
  text += normenSatz(e.normverweise);
  return text;
}
