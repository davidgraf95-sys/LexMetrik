import type { Berechnungsergebnis, Normverweis, Rechenschritt } from '../types/legal';
import { gebuehrZahlungsbefehl } from './schkgZustaendigkeit';

// ─── Betreibungskosten-Engine (GebV SchKG, SR 281.35, Stand 1.1.2026) ───────
//
// Grundlage: bibliothek/recherche/gebv-schkg-kostenrechner.md – jede Zahl
// Wert für Wert am Filestore-HTML der Konsolidierung 1.1.2026 verifiziert
// (Voll-Diff gegen 1.1.2022: Rechner-Tatbestände unverändert; Deep-Research
// 7.6.2026 mit unabhängigen Zweitbelegen, 3:0).
//
// §2-Schnitt (Dossier §C): FIXE Staffeln (Art. 16/20/30/19) → Punktwerte;
// RAHMENGEBÜHREN (Art. 48) → ausschliesslich Bandbreite; Auslagen (Art. 13)
// NIE als Betrag, nur als Hinweis. Art.-16-Staffel wird aus
// schkgZustaendigkeit.gebuehrZahlungsbefehl WIEDERVERWENDET (§5).

export type GebvEingabe = {
  /** Bemessung Art. 6: bezifferte Forderung OHNE nicht bezifferte Zinsen. */
  forderungCHF: number;
  zahlungsbefehl?: { weitereAusfertigungen?: number; zustellversuche?: number };
  pfaendung?: { ausgang: 'vollzogen' | 'fruchtlos' | 'erfolglos' };
  /** Verwertung: Erlös (bzw. Schätzwert, wenn kein Erwerber). */
  verwertung?: { betragCHF: number; keinErwerber?: boolean };
  einzahlung?: { summeCHF: number };
  /** Gerichtlicher Entscheid in Summarsache (z. B. Rechtsöffnung) – Bandbreite. */
  entscheidSummarsache?: { streitwertCHF: number };
};

export type GebvErgebnis = Berechnungsergebnis & {
  totalPunktwerteCHF: number;
  bandbreite?: { vonCHF: number; bisCHF: number };
};

const N = (artikel: string, bemerkung?: string): Normverweis => ({ artikel, bemerkung });
// Rappen-Rundung der Promille-Bänder (Deploy-Bug-Check 7.6.2026, MITTEL):
// 2 ‰/5 ‰ erzeugten >2 Dezimalstellen. Hauskonvention round2 (wie
// verzugszins.ts); ob amtlich auf 0.05 zu runden wäre, ist als
// Grundsatzfrage für David offengelegt (HANDLUNGSPLAN A.4).
const round2 = (n: number) => Math.round(n * 100) / 100;
const chf = (n: number) => `CHF ${n.toLocaleString('de-CH', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const pruefe = (n: number, was: string) => {
  if (!Number.isFinite(n) || n < 0) throw new Error(`${was}: Zahl ≥ 0 erforderlich.`);
};

// Staffel-Lookup (Bandgrenzen «bis einschliesslich», wie Art.-16-Helper).
const staffel = (stufen: [number, number][], wert: number) =>
  stufen.find(([bis]) => wert <= bis)![1];

/** Art. 20 Abs. 1 – Pfändungsvollzug (verifizierte Staffel). */
export function gebuehrPfaendung(forderungCHF: number): number {
  pruefe(forderungCHF, 'Forderung');
  return staffel([[100, 10], [500, 25], [1_000, 45], [10_000, 65], [100_000, 90], [1_000_000, 190], [Infinity, 400]], forderungCHF);
}

/** Art. 30 Abs. 2 – Verwertung (vor Kappung Abs. 3 / Minderung Abs. 4). */
export function gebuehrVerwertungRoh(betragCHF: number): number {
  pruefe(betragCHF, 'Erlös/Schätzwert');
  if (betragCHF > 100_000) return round2(betragCHF * 0.002); // 2 ‰
  return staffel([[500, 10], [1_000, 50], [10_000, 100], [100_000, 200]], betragCHF);
}

/** Art. 19 Abs. 1 – Entgegennahme/Überweisung einer Zahlung. */
export function gebuehrEinzahlung(summeCHF: number): number {
  pruefe(summeCHF, 'Summe');
  return summeCHF <= 1_000 ? 5 : Math.min(round2(summeCHF * 0.005), 500);
}

/** Art. 48 Abs. 1 – Entscheidgebühr Summarsachen: RAHMEN (nie Punktwert, §2). */
export function rahmenEntscheidSummarsache(streitwertCHF: number): { vonCHF: number; bisCHF: number } {
  pruefe(streitwertCHF, 'Streitwert');
  if (streitwertCHF <= 1_000) return { vonCHF: 40, bisCHF: 150 };
  if (streitwertCHF <= 10_000) return { vonCHF: 50, bisCHF: 300 };
  if (streitwertCHF <= 100_000) return { vonCHF: 60, bisCHF: 500 };
  if (streitwertCHF <= 1_000_000) return { vonCHF: 70, bisCHF: 2_000 };
  return { vonCHF: 500, bisCHF: 4_000 };
}

export function berechneBetreibungskosten(input: GebvEingabe): GebvErgebnis {
  pruefe(input.forderungCHF, 'Forderung');
  const rechenweg: Rechenschritt[] = [];
  const warnungen: string[] = [];
  const normverweise: Normverweis[] = [N('Art. 68 SchKG', 'Vorschuss Gläubiger; Schuldner trägt'), N('Art. 6 GebV SchKG', 'Bemessung ohne nicht bezifferte Zinsen')];
  let total = 0;
  let bandbreite: GebvErgebnis['bandbreite'];

  if (input.zahlungsbefehl) {
    const zb = gebuehrZahlungsbefehl(input.forderungCHF);
    total += zb.gebuehrCHF;
    rechenweg.push({
      beschreibung: 'Zahlungsbefehl (Art. 16 Abs. 1 GebV SchKG)',
      zwischenergebnis: `Forderung ${chf(input.forderungCHF)} (Band: ${zb.band}) → Gebühr ${chf(zb.gebuehrCHF)} (umfasst Erlass, doppelte Ausfertigung, Eintragung und Zustellung).`,
      normen: [N('Art. 16 Abs. 1 GebV SchKG')],
    });
    const weitere = input.zahlungsbefehl.weitereAusfertigungen ?? 0;
    if (weitere > 0) {
      const g = (zb.gebuehrCHF / 2) * weitere;
      total += g;
      rechenweg.push({
        beschreibung: 'Weitere doppelte Ausfertigungen (Art. 16 Abs. 2)',
        zwischenergebnis: `${weitere} × ${chf(zb.gebuehrCHF / 2)} (halbe Gebühr) = ${chf(g)}.`,
        normen: [N('Art. 16 Abs. 2 GebV SchKG')],
      });
    }
    const versuche = input.zahlungsbefehl.zustellversuche ?? 0;
    if (versuche > 0) {
      total += 7 * versuche;
      rechenweg.push({
        beschreibung: 'Zustellungsversuche (Art. 16 Abs. 3)',
        zwischenergebnis: `${versuche} × CHF 7 = ${chf(7 * versuche)} je Zahlungsbefehl.`,
        normen: [N('Art. 16 Abs. 3 GebV SchKG')],
      });
    }
  }

  if (input.pfaendung) {
    const basis = gebuehrPfaendung(input.forderungCHF);
    const a = input.pfaendung.ausgang;
    const g = a === 'vollzogen' ? basis : a === 'fruchtlos' ? Math.max(basis / 2, 10) : 10;
    total += g;
    rechenweg.push({
      beschreibung: 'Pfändung (Art. 20 GebV SchKG)',
      zwischenergebnis: a === 'vollzogen'
        ? `Vollzug inkl. Pfändungsurkunde: ${chf(g)} (Forderung ${chf(input.forderungCHF)}).`
        : a === 'fruchtlos'
          ? `FRUCHTLOSE Pfändung: halbe Gebühr (${chf(basis)} ÷ 2, mindestens CHF 10) = ${chf(g)}.`
          : `Erfolgloser Pfändungsversuch: ${chf(10)}.`,
      normen: [N(a === 'vollzogen' ? 'Art. 20 Abs. 1 GebV SchKG' : 'Art. 20 Abs. 2 GebV SchKG')],
    });
    warnungen.push('Dauert der Pfändungsvollzug länger als eine Stunde, erhöht sich die Gebühr um CHF 40 je weitere halbe Stunde (Art. 20 Abs. 3 GebV SchKG) – hier nicht erfasst.');
  }

  if (input.verwertung) {
    const v = input.verwertung;
    pruefe(v.betragCHF, 'Erlös/Schätzwert');
    let g: number; let text: string;
    if (v.keinErwerber) {
      g = Math.min(round2(gebuehrVerwertungRoh(v.betragCHF) / 2), 1_000);
      text = `Kein Erwerber: Bemessung nach dem Schätzungswert ${chf(v.betragCHF)}, vermindert um die Hälfte, höchstens CHF 1 000 → ${chf(g)} (Art. 30 Abs. 4).`;
    } else {
      const roh = gebuehrVerwertungRoh(v.betragCHF);
      g = Math.min(roh, v.betragCHF); // Abs. 3: nie höher als der Erlös
      text = `Erlös ${chf(v.betragCHF)} → ${v.betragCHF > 100_000 ? '2 ‰' : 'Staffel'} = ${chf(roh)}${g < roh ? `, gekappt auf den Erlös (${chf(g)}, Art. 30 Abs. 3)` : ''}.`;
    }
    total += g;
    rechenweg.push({
      beschreibung: 'Verwertung (Art. 30 GebV SchKG)',
      zwischenergebnis: text,
      normen: [N('Art. 30 GebV SchKG')],
    });
  }

  if (input.einzahlung) {
    const g = gebuehrEinzahlung(input.einzahlung.summeCHF);
    total += g;
    rechenweg.push({
      beschreibung: 'Entgegennahme und Überweisung einer Zahlung (Art. 19)',
      zwischenergebnis: `Summe ${chf(input.einzahlung.summeCHF)} → ${input.einzahlung.summeCHF <= 1_000 ? 'CHF 5' : `5 ‰, höchstens CHF 500`} = ${chf(g)}; Überweisungs-Auslagen zulasten des Gläubigers (Abs. 3).`,
      normen: [N('Art. 19 GebV SchKG')],
    });
  }

  if (input.entscheidSummarsache) {
    bandbreite = rahmenEntscheidSummarsache(input.entscheidSummarsache.streitwertCHF);
    rechenweg.push({
      beschreibung: 'Gerichtlicher Entscheid in betreibungsrechtlicher Summarsache (Art. 48)',
      zwischenergebnis: `Streitwert ${chf(input.entscheidSummarsache.streitwertCHF)} → RAHMENGEBÜHR ${chf(bandbreite.vonCHF)}–${chf(bandbreite.bisCHF)}; die konkrete Höhe setzt das Gericht im Ermessen fest (z. B. Rechtsöffnung).`,
      normen: [N('Art. 48 Abs. 1 GebV SchKG', 'Rahmen – kein Punktwert')],
    });
  }

  if (rechenweg.length === 0) throw new Error('Mindestens einen Verfahrensschritt wählen.');

  warnungen.push(
    'Zuzüglich AUSLAGEN (Art. 13 GebV SchKG: Porti, Sachverständige, Polizei, Bankspesen) – effektiv, hier nicht bezifferbar. Kantonale Übersichten weisen Beträge teils inklusive Zustell-Porti aus und liegen deshalb über der reinen Gebühr.',
    'Der Rechtsvorschlag selbst ist GEBÜHRENFREI (Art. 18 GebV SchKG); ebenso die Protokollierung des Rückzugs einer Betreibung (Art. 41).',
  );

  return {
    ergebnis:
      (total > 0 ? `Amtliche Gebühren (Punktwerte): ${chf(total)}.` : 'Keine Punktwert-Gebühren gewählt.') +
      (bandbreite ? ` Zusätzlich Entscheidgebühr im Rahmen ${chf(bandbreite.vonCHF)}–${chf(bandbreite.bisCHF)} (Art. 48 GebV SchKG).` : '') +
      ' Der Schuldner trägt die Betreibungskosten; der Gläubiger schiesst sie vor und erhebt sie von den Zahlungen vorab (Art. 68 SchKG).',
    status: 'ok',
    rechenweg,
    annahmen: [
      'Bemessungsgrösse ist die in Betreibung gesetzte, bezifferte Forderung; NICHT bezifferte Zinsen fallen ausser Betracht (Art. 6 GebV SchKG).',
      'Tarifstand: GebV SchKG, Konsolidierung 1.1.2026 (letzte betragsändernde Revision der erfassten Tatbestände: 1.1.2022).',
    ],
    warnungen,
    normverweise,
    totalPunktwerteCHF: total,
    bandbreite,
  };
}
