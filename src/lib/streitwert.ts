// Dossier: bibliothek/recherche/zpo-kosten-streitwert.md
import type { Berechnungsergebnis, Normverweis, Rechenschritt } from '../types/legal';

// ─── Streitwert-Engine (Art. 91–94a ZPO, Konsolidierung 1.1.2025) ───────────
//
// Grundlage: Recherche-Dossier bibliothek/recherche/zpo-kosten-streitwert.md
// (Rechner 1; Wortlaute am Fedlex-Cache /tmp/zpo.html verifiziert, inkl.
// Rev. 2025: Art. 94 Abs. 3 Teilklage, Art. 94a Verbandsklage).
//
// §2-Schnitt (Dossier §4): Hart regelbasiert sind ×20-Kapitalisierung,
// Zusammenrechnung, Widerklage-Maximum und die Teilklage-Sonderregel.
// ERMESSEN (nicht beziffert, Leibrenten-Barwert ohne Eingabe, Verbandsklage)
// wird NIE geschätzt — die Engine gibt dann KEINEN Wert aus, sondern die
// Weiche «das Gericht setzt den Streitwert fest» (Art. 91 Abs. 2 / 94a).
//
// Zwei getrennte Ausgaben (Art. 94 Abs. 1 vs. Abs. 2/3): «Streitwert für
// Verfahren/Rechtsmittel» und «Kosten-Bemessungsgrundlage».

export type BegehrenTyp = 'einmalig' | 'wiederkehrend' | 'unbeziffert';
export type WiederkehrDauer = 'unbestimmt' | 'bestimmt' | 'leibrente';

export type Begehren = {
  typ: BegehrenTyp;
  /** einmalig bezifferte Forderung (CHF, ohne Zinsen/Kosten — Art. 91 Abs. 1). */
  betragCHF?: number;
  /** wiederkehrend: Jahresbetrag der Nutzung/Leistung (Art. 92 Abs. 1). */
  jahresbetragCHF?: number;
  dauer?: WiederkehrDauer;
  /** bestimmte Dauer in Jahren (Art. 92 Abs. 1 Kapitalwert). */
  jahre?: number;
  /** Leibrente: BARWERT als Eingabe (Art. 92 Abs. 2 — nicht berechenbar). */
  barwertCHF?: number;
};

export type StreitwertInput = {
  begehren: Begehren[];
  /** Die Begehren schliessen sich gegenseitig aus (Art. 93 Abs. 1 Halbs. 2). */
  begehrenSchliessenSichAus?: boolean;
  widerklage?: {
    betragCHF: number;
    /** Klage und Widerklage schliessen sich gegenseitig aus (Art. 94 Abs. 2). */
    schliesstAus?: boolean;
  };
  /** Hauptklage ist eine Teilklage (Art. 94 Abs. 3, Rev. 2025). */
  hauptklageIstTeilklage?: boolean;
};

export type StreitwertErgebnis = Berechnungsergebnis & {
  /** Massgeblicher Streitwert für Verfahrensart/Rechtsmittel — null = Ermessen. */
  streitwertVerfahrenCHF: number | null;
  /** Bemessungsgrundlage der Prozesskosten (Art. 94 Abs. 2/3) — null = Ermessen. */
  kostenBasisCHF: number | null;
};

const N = (artikel: string, bemerkung?: string): Normverweis => ({ artikel, bemerkung });
const N91 = N('Art. 91 ZPO', 'Grundsatz: Rechtsbegehren; ohne Zinsen und Kosten');
const N92 = N('Art. 92 ZPO', 'Wiederkehrende Nutzungen/Leistungen: Kapitalwert');
const N93 = N('Art. 93 ZPO', 'Klagenhäufung/Streitgenossenschaft: Zusammenrechnung');
const N94 = N('Art. 94 ZPO', 'Widerklage');

const chf = (n: number) => `CHF ${n.toLocaleString('de-CH')}`;

const gueltigerBetrag = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0;

/** Wert eines einzelnen Begehrens — null = Ermessens-Weiche (kein Schätzen, §2). */
function begehrenWert(b: Begehren): { wert: number | null; text: string; normen: Normverweis[]; warnung?: string } {
  if (b.typ === 'unbeziffert') {
    return {
      wert: null,
      text: 'Nicht beziffertes Begehren (Forderung unbestimmter Höhe, Gestaltungs-/Naturalleistung oder Verbandsklage): Das GERICHT setzt den Streitwert fest (Art. 91 Abs. 2 bzw. Art. 94a ZPO) — keine Berechnung.',
      normen: [N91, N('Art. 94a ZPO', 'Verbandsklage: Ermessen')],
    };
  }
  if (b.typ === 'einmalig') {
    if (!gueltigerBetrag(b.betragCHF)) return { wert: null, text: 'Einmaliges Begehren ohne gültigen Betrag.', normen: [N91] };
    return { wert: b.betragCHF, text: `Einmalig beziffertes Begehren: ${chf(b.betragCHF)} (Art. 91 Abs. 1 ZPO; Zinsen und Kosten werden nicht hinzugerechnet).`, normen: [N91] };
  }
  // wiederkehrend
  if (b.dauer === 'leibrente') {
    if (!gueltigerBetrag(b.barwertCHF)) {
      return {
        wert: null,
        text: 'Leibrente: Massgeblich ist der BARWERT (Art. 92 Abs. 2 ZPO) — er hängt von Alter/Sterbetafeln ab und wird hier nicht geschätzt; Barwert beziffern oder gerichtliche Festsetzung.',
        normen: [N92],
      };
    }
    return { wert: b.barwertCHF, text: `Leibrente: eingegebener Barwert ${chf(b.barwertCHF)} (Art. 92 Abs. 2 ZPO).`, normen: [N92] };
  }
  if (!gueltigerBetrag(b.jahresbetragCHF)) return { wert: null, text: 'Wiederkehrende Leistung ohne gültigen Jahresbetrag.', normen: [N92] };
  if (b.dauer === 'bestimmt') {
    if (!gueltigerBetrag(b.jahre) || b.jahre! <= 0) return { wert: null, text: 'Bestimmte Dauer ohne gültige Jahresangabe.', normen: [N92] };
    const wert = b.jahresbetragCHF * b.jahre!;
    return {
      wert,
      text: `Wiederkehrende Leistung, bestimmte Dauer: Kapitalwert ${chf(b.jahresbetragCHF)} × ${b.jahre} Jahre = ${chf(wert)} (Art. 92 Abs. 1 ZPO).`,
      normen: [N92],
      warnung: 'Kapitalwert bei BESTIMMTER Dauer als ungeschmälerte Summe gerechnet (ohne Abdiskontierung) — ob ein Barwert-Abzug zulässig/geboten ist, ist zu verifizieren (Dossier-Vorbehalt).',
    };
  }
  // ungewisse/unbeschränkte Dauer → ×20
  const wert = b.jahresbetragCHF * 20;
  return {
    wert,
    text: `Wiederkehrende Leistung, ungewisse/unbeschränkte Dauer: ${chf(b.jahresbetragCHF)} × 20 = ${chf(wert)} (Art. 92 Abs. 2 ZPO).`,
    normen: [N92],
  };
}

export function berechneStreitwert(input: StreitwertInput): StreitwertErgebnis {
  if (!input.begehren.length) throw new Error('Mindestens ein Rechtsbegehren erfassen.');
  if (input.widerklage && !gueltigerBetrag(input.widerklage.betragCHF)) {
    throw new Error('Widerklage: gültigen Streitwert (CHF ≥ 0) angeben.');
  }

  const rechenweg: Rechenschritt[] = [];
  const warnungen: string[] = [];
  const annahmen: string[] = [
    'Massgeblich ist das Rechtsbegehren; Zinsen, laufende Verfahrens- und Publikationskosten sowie EVENTUALBEGEHREN werden NICHT hinzugerechnet (Art. 91 Abs. 1 ZPO).',
    'Massgeblicher Zeitpunkt im Rechtsmittel: die zuletzt aufrechterhaltenen Rechtsbegehren (Art. 308 Abs. 2 ZPO); vor Bundesgericht gilt die EIGENE Streitwertordnung der Art. 51–53 BGG.',
  ];

  // ── Schritt 1: Wert je Begehren ──
  const werte = input.begehren.map((b, i) => {
    const w = begehrenWert(b);
    rechenweg.push({
      beschreibung: `Begehren ${i + 1}`,
      zwischenergebnis: w.text,
      normen: w.normen,
    });
    if (w.warnung) warnungen.push(w.warnung);
    return w.wert;
  });
  const ermessen = werte.some((w) => w === null);

  // ── Schritt 2: Häufung (Art. 93) ──
  let haupt: number | null = null;
  if (ermessen) {
    warnungen.push('Mindestens ein Begehren ist nicht berechenbar (Ermessen) — der Gesamtstreitwert wird vom GERICHT festgesetzt (Art. 91 Abs. 2 ZPO); die berechneten Teilwerte dienen nur der Orientierung.');
  } else if (werte.length === 1) {
    haupt = werte[0]!;
  } else if (input.begehrenSchliessenSichAus) {
    haupt = Math.max(...(werte as number[]));
    rechenweg.push({
      beschreibung: 'Klagenhäufung — sich ausschliessende Begehren',
      zwischenergebnis: `Die Begehren schliessen sich gegenseitig aus → KEINE Zusammenrechnung; massgeblich ist der höchste Einzelwert: ${chf(haupt)} (Art. 93 Abs. 1 ZPO e contrario).`,
      normen: [N93],
    });
  } else {
    haupt = (werte as number[]).reduce((a, b) => a + b, 0);
    rechenweg.push({
      beschreibung: 'Klagenhäufung/Streitgenossenschaft — Zusammenrechnung',
      zwischenergebnis: `Die geltend gemachten Ansprüche werden zusammengerechnet: ${chf(haupt)} (Art. 93 Abs. 1 ZPO). Bei einfacher Streitgenossenschaft bleibt die Verfahrensart trotz Zusammenrechnung erhalten (Abs. 2).`,
      normen: [N93],
    });
  }

  // ── Schritt 3: Widerklage (Art. 94) — zwei getrennte Grössen ──
  let verfahren: number | null = haupt;
  let kosten: number | null = haupt;
  if (input.widerklage && haupt !== null) {
    const wk = input.widerklage.betragCHF;
    verfahren = Math.max(haupt, wk);
    rechenweg.push({
      beschreibung: 'Widerklage — Streitwert für Verfahren/Rechtsmittel',
      zwischenergebnis: `Massgeblich ist das HÖHERE Rechtsbegehren: max(${chf(haupt)}, ${chf(wk)}) = ${chf(verfahren)} (Art. 94 Abs. 1 ZPO).`,
      normen: [N94],
    });
    if (input.hauptklageIstTeilklage) {
      kosten = haupt;
      rechenweg.push({
        beschreibung: 'Prozesskosten bei Teilklage (Rev. 2025)',
        zwischenergebnis: `Die Hauptklage ist eine TEILKLAGE: Die Prozesskosten werden ausschliesslich auf der Grundlage des Streitwerts der Hauptklage berechnet: ${chf(haupt)} (Art. 94 Abs. 3 ZPO, in Kraft seit 1.1.2025).`,
        normen: [N('Art. 94 Abs. 3 ZPO', 'Teilklage: Kosten nur nach Hauptklage')],
      });
    } else if (input.widerklage.schliesstAus) {
      kosten = Math.max(haupt, wk);
      rechenweg.push({
        beschreibung: 'Prozesskosten — sich ausschliessende Klagen',
        zwischenergebnis: `Klage und Widerklage schliessen sich gegenseitig aus → die Streitwerte werden NICHT zusammengerechnet (Art. 94 Abs. 2 ZPO); als Bemessungsgrundlage gilt der höhere Wert: ${chf(kosten)}.`,
        normen: [N94],
      });
      warnungen.push('Kosten-Bemessung bei sich ausschliessenden Klagen: Art. 94 Abs. 2 ZPO schliesst nur die Zusammenrechnung aus; dass der HÖHERE Wert massgeblich ist, entspricht der herrschenden Lesart — zu verifizieren.');
    } else {
      kosten = haupt + wk;
      rechenweg.push({
        beschreibung: 'Prozesskosten — Zusammenrechnung',
        zwischenergebnis: `Für die Prozesskosten werden die Streitwerte zusammengerechnet: ${chf(haupt)} + ${chf(wk)} = ${chf(kosten)} (Art. 94 Abs. 2 ZPO).`,
        normen: [N94],
      });
    }
  } else if (input.widerklage && haupt === null) {
    verfahren = null;
    kosten = null;
  }

  const ergebnis = verfahren !== null
    ? `Massgeblicher Streitwert (Verfahren/Rechtsmittel): ${chf(verfahren)}.` +
      (kosten !== null && kosten !== verfahren ? ` Kosten-Bemessungsgrundlage: ${chf(kosten)} (Art. 94 ZPO).` : '')
    : 'Der Streitwert ist nicht berechenbar — das Gericht setzt ihn fest (Art. 91 Abs. 2 ZPO); siehe Rechenweg.';

  return {
    ergebnis,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise: [N91, N92, N93, N94],
    streitwertVerfahrenCHF: verfahren,
    kostenBasisCHF: kosten,
  };
}
