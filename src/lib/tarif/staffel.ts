// ─── Fachneutrales Tarif-Staffel-Primitiv ──────────────────────────────────
//
// FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN B-P0a (Säule B, Hauptmoat). Reine,
// deterministische Auswertung deklarierter Gebührenregeln über einen
// Bemessungswert (i.d.R. Streitwert/Forderung in CHF). Dies ist
// INFRASTRUKTUR, KEINE materielle Rechtsregel (§2 Determinismus; §4: geteilte
// fachneutrale Schicht, kein Recht). Welche Regel für welches Verfahren in
// welchem Kanton gilt, deklariert die Datenschicht je Kanton (B-P1) — dieses
// Modul rechnet nur aus, was man ihm gibt.
//
// Bandgrenzen-Semantik ist EXPLIZIT typisiert (§1: lieber zwei klare Typen als
// eine Abstraktion, die einen Frankenbetrag um einen Rappen verschiebt):
//  · staffel_inklusiv  – Obergrenze gehört noch zum Band (wert <= bisChf);
//    das ist die in gebvKosten.ts bewährte Form (Charakterisierungs-Test in
//    tarifStaffel.test.ts reproduziert sie → spätere Ablösung byte-gleich).
//  · staffel_exklusiv  – Obergrenze ist erste Zahl des Folgebandes
//    (wert <  bisChf); für Tarife in der Schreibweise «1001–10 000».
//
// Ermessens-/extern bestimmte Tarife liefern KEINEN erfundenen Punktwert
// (§2/§8): `rahmen`/`formel_extern` tragen das Betrags-Feld typseitig gar nicht
// — die diskriminierte Ergebnis-Union zwingt die UI, den Rahmen/Hinweis
// auszuweisen statt eine Scheinzahl anzuzeigen.

/** Ein Band einer flachen Bracket-Staffel: bis zur Grenze gilt der Festbetrag.
 *  Das letzte Band MUSS `bisChf: Infinity` tragen (Bereich lückenlos decken). */
export interface StaffelBand {
  bisChf: number;
  chf: number;
}

/** Ein Band einer Rahmen-Staffel: bis zur Streitwert-Grenze gilt der
 *  Gebühren-RAHMEN [minChf, maxChf] (Festsetzung im Ermessen der Behörde nach
 *  ihren Kriterien — KEIN Punktwert, §2/§8). Häufigster Schweizer Tarif-Typ
 *  (z. B. BS § 5 GGR, BL, SO, BE, GE, SG). Letztes Band `grenzeChf: Infinity`. */
export interface RahmenBand {
  grenzeChf: number;
  minChf: number;
  maxChf: number;
}

export type TarifRegel =
  | { typ: 'fix'; chf: number }
  /** Sockelbetrag + Prozentsatz auf den Überschuss über eine Schwelle,
   *  optional gedeckelt/mit Mindestbetrag. Z. B. «CHF 3'150 + 8 % über
   *  CHF 20'000». `abChf`/`sockelChf` default 0. */
  | { typ: 'sockel_prozent'; prozent: number; abChf?: number; sockelChf?: number; minChf?: number; maxChf?: number }
  /** Promille des Bemessungswerts, optional gedeckelt/mit Mindestbetrag. */
  | { typ: 'promille'; promille: number; minChf?: number; maxChf?: number }
  | { typ: 'staffel_inklusiv'; baender: StaffelBand[] }
  | { typ: 'staffel_exklusiv'; baender: StaffelBand[] }
  /** Bracket-Staffel, deren Bänder einen Gebühren-RAHMEN statt eines
   *  Punktwerts tragen (deterministische Band-Wahl, ehrliche Spanne). */
  | { typ: 'staffel_rahmen'; baender: RahmenBand[] }
  /** Behördlicher Rahmen ohne deterministischen Punktwert. */
  | { typ: 'rahmen'; vonChf: number; bisChf: number; hinweis?: string }
  /** Tarif hängt von extern bestimmten Faktoren ab (nicht berechenbar). */
  | { typ: 'formel_extern'; hinweis: string };

export type TarifErgebnis =
  | { deterministisch: true; betragChf: number; schritte: string[] }
  | { deterministisch: false; vonChf?: number; bisChf?: number; hinweis: string };

const round2 = (x: number) => Math.round(x * 100) / 100;
const chf = (x: number) => `CHF ${round2(x).toLocaleString('de-CH')}`;

const pruefeBasis = (basisChf: number): void => {
  if (!Number.isFinite(basisChf) || basisChf < 0) {
    throw new RangeError(`Bemessungswert muss eine Zahl ≥ 0 sein (erhalten: ${basisChf}).`);
  }
};

/** Mindest-/Höchstbetrag anwenden; protokolliert die wirksame Klammer. */
const klammere = (roh: number, minChf: number | undefined, maxChf: number | undefined, schritte: string[]): number => {
  let betrag = roh;
  if (typeof maxChf === 'number' && betrag > maxChf) {
    betrag = maxChf;
    schritte.push(`Höchstgebühr ${chf(maxChf)} → ${chf(betrag)}`);
  }
  if (typeof minChf === 'number' && betrag < minChf) {
    betrag = minChf;
    schritte.push(`Mindestgebühr ${chf(minChf)} → ${chf(betrag)}`);
  }
  return betrag;
};

const ausStaffel = (baender: StaffelBand[], basisChf: number, inklusiv: boolean): TarifErgebnis => {
  const treffer = baender.find((b) => (inklusiv ? basisChf <= b.bisChf : basisChf < b.bisChf));
  if (!treffer) {
    throw new RangeError(`Staffel deckt den Bemessungswert ${chf(basisChf)} nicht (letztes Band braucht bisChf: Infinity).`);
  }
  const grenze = Number.isFinite(treffer.bisChf)
    ? `${inklusiv ? 'bis und mit' : 'unter'} ${chf(treffer.bisChf)}`
    : 'oberstes Band';
  return { deterministisch: true, betragChf: round2(treffer.chf), schritte: [`Band ${grenze}: ${chf(treffer.chf)}`] };
};

/** Wertet eine Tarifregel über den Bemessungswert aus. Deterministisch für
 *  fix/sockel_prozent/promille/staffel_*; ehrlicher Rahmen/Hinweis für
 *  rahmen/formel_extern. */
export function auswertenTarif(regel: TarifRegel, basisChf: number): TarifErgebnis {
  switch (regel.typ) {
    case 'fix':
      return { deterministisch: true, betragChf: round2(regel.chf), schritte: [`Fixgebühr ${chf(regel.chf)}`] };

    case 'sockel_prozent': {
      pruefeBasis(basisChf);
      const ab = regel.abChf ?? 0;
      const sockel = regel.sockelChf ?? 0;
      const ueberschuss = Math.max(0, basisChf - ab);
      const schritte: string[] = [];
      if (sockel > 0) schritte.push(`Sockel ${chf(sockel)}`);
      schritte.push(`${regel.prozent} % auf ${chf(ueberschuss)}${ab > 0 ? ` (Überschuss über ${chf(ab)})` : ''} = ${chf(ueberschuss * regel.prozent / 100)}`);
      const roh = round2(sockel + (ueberschuss * regel.prozent) / 100);
      return { deterministisch: true, betragChf: klammere(roh, regel.minChf, regel.maxChf, schritte), schritte };
    }

    case 'promille': {
      pruefeBasis(basisChf);
      const schritte = [`${regel.promille} ‰ von ${chf(basisChf)} = ${chf((basisChf * regel.promille) / 1000)}`];
      const roh = round2((basisChf * regel.promille) / 1000);
      return { deterministisch: true, betragChf: klammere(roh, regel.minChf, regel.maxChf, schritte), schritte };
    }

    case 'staffel_inklusiv':
      pruefeBasis(basisChf);
      return ausStaffel(regel.baender, basisChf, true);

    case 'staffel_exklusiv':
      pruefeBasis(basisChf);
      return ausStaffel(regel.baender, basisChf, false);

    case 'staffel_rahmen': {
      pruefeBasis(basisChf);
      const treffer = regel.baender.find((b) => basisChf <= b.grenzeChf);
      if (!treffer) {
        throw new RangeError(`Rahmen-Staffel deckt den Bemessungswert ${chf(basisChf)} nicht (letztes Band braucht grenzeChf: Infinity).`);
      }
      const grenze = Number.isFinite(treffer.grenzeChf) ? `bis und mit ${chf(treffer.grenzeChf)}` : 'oberstes Band';
      return {
        deterministisch: false,
        vonChf: treffer.minChf,
        bisChf: treffer.maxChf,
        hinweis: `Gebührenrahmen ${chf(treffer.minChf)}–${chf(treffer.maxChf)} (Streitwert-Band ${grenze}); Festsetzung im Ermessen der Behörde.`,
      };
    }

    case 'rahmen':
      return { deterministisch: false, vonChf: regel.vonChf, bisChf: regel.bisChf, hinweis: regel.hinweis ?? 'Behördlicher Gebührenrahmen – kein fester Punktwert.' };

    case 'formel_extern':
      return { deterministisch: false, hinweis: regel.hinweis };
  }
}
