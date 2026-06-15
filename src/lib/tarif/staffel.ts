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
  /** Feste Untergrenze des Gebührenrahmens. `null`/weglassen, wenn keine
   *  Untergrenze gilt (z. B. Bemessung nach Zeitaufwand) oder eine
   *  prozentuale Untergrenze (`minProzent`) zu verwenden ist. */
  minChf?: number | null;
  /** Feste Obergrenze des Gebührenrahmens. */
  maxChf?: number | null;
  /** Alternativ: Unter-/Obergrenze als Prozentsatz des Streitwerts (häufig im
   *  obersten Band, «über X Mio: a–b % des Streitwerts»; ganze TI-Skala). */
  minProzent?: number;
  maxProzent?: number;
  /** Bei prozentualer Bemessung: harter Sockel-/Deckelbetrag (CHF). */
  mindestChf?: number;
  hoechstChf?: number;
  hinweis?: string;
}

/** Ein Band einer mehrbandigen Sockel+Prozent-Staffel: bis zur Grenze gilt
 *  `sockelChf + prozent% × (wert − abChf)`. Der Sockel kumuliert die unteren
 *  Bänder, der Prozentsatz wirkt nur auf den Überschuss über `abChf`.
 *  (Deterministische Grundgebühr, z. B. ZH § 4 Abs. 1 GebV OG.) */
export interface SockelProzentBand {
  bisChf: number;
  sockelChf: number;
  abChf: number;
  prozent: number;
  minChf?: number;
  /** Höchstbetrag des Bandes (Deckel), z. B. NE >1 Mio: 4 %, max CHF 300'000. */
  maxChf?: number;
}

/** Ein Band einer Fix+Prozent-vom-Gesamtwert-Staffel: bis zur Grenze gilt
 *  `fixChf + prozent% × wert` (Prozent auf den GESAMTEN Streitwert, nicht den
 *  Überschuss). (Deterministisch, z. B. AG § 7 Abs. 1 GebührD.) Optionaler
 *  Mindest-/Höchstbetrag JE BAND (Schwellensatz-Tarife mit Stufen-Minima, z. B.
 *  UR Notariatstarif A, TI LTORF Art. 11/13). */
export interface VollProzentBand {
  bisChf: number;
  fixChf: number;
  prozent: number;
  minChf?: number;
  maxChf?: number;
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
  /** Mehrbandige Sockel+Prozent-Tabelle (deterministische Grundgebühr). */
  | { typ: 'staffel_sockel_prozent'; baender: SockelProzentBand[] }
  /** Fix + Prozent vom Gesamtwert je Band (deterministisch). */
  | { typ: 'staffel_voll_prozent'; baender: VollProzentBand[] }
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
// Gebühren werden ganzzahlig dargestellt (Frankenbeträge; Bug-Check 14.6.2026).
const chf = (x: number) => `CHF ${Math.round(x).toLocaleString('de-CH')}`;

const pruefeBasis = (basisChf: number): void => {
  if (!Number.isFinite(basisChf) || basisChf < 0) {
    throw new RangeError(`Bemessungswert muss eine Zahl ≥ 0 sein (erhalten: ${basisChf}).`);
  }
};

/** Mindest-/Höchstbetrag anwenden; protokolliert die wirksame Klammer. */
const klammere = (roh: number, minChf: number | undefined, maxChf: number | undefined, schritte: string[]): number => {
  if (typeof minChf === 'number' && typeof maxChf === 'number' && minChf > maxChf) {
    throw new RangeError(`Bandgrenzen widersprüchlich: minChf ${minChf} > maxChf ${maxChf}.`);
  }
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

/** Skaliert ein Tarif-Ergebnis mit einer Faktor-SPANNE (z. B. summarisches
 *  Verfahren ½–¾, Rechtsmittelinstanz, Schlichtungs-Bruchteil). Ergebnis wird
 *  zur Spanne (vonChf×faktorMin … bisChf×faktorMax); ein deterministischer
 *  Betrag wird zur Spanne. Faktor [1,1] lässt das Ergebnis unverändert. Nicht
 *  bezifferte Ergebnisse (formel_extern) bleiben unverändert. */
export function skaliereErgebnis(e: TarifErgebnis, faktorMin: number, faktorMax: number, hinweis: string): TarifErgebnis {
  if (faktorMin === 1 && faktorMax === 1) return e;
  if (e.deterministisch) {
    return { deterministisch: false, vonChf: Math.round(e.betragChf * faktorMin), bisChf: Math.round(e.betragChf * faktorMax), hinweis };
  }
  const von = typeof e.vonChf === 'number' ? Math.round(e.vonChf * faktorMin) : undefined;
  const bis = typeof e.bisChf === 'number' ? Math.round(e.bisChf * faktorMax) : undefined;
  if (von === undefined && bis === undefined) return e;
  return { deterministisch: false, vonChf: von, bisChf: bis, hinweis: `${e.hinweis} · ${hinweis}` };
}

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

    case 'staffel_sockel_prozent': {
      pruefeBasis(basisChf);
      const b = regel.baender.find((x) => basisChf <= x.bisChf);
      if (!b) throw new RangeError(`Sockel-Prozent-Staffel deckt ${chf(basisChf)} nicht (letztes Band braucht bisChf: Infinity).`);
      const ueberschuss = Math.max(0, basisChf - b.abChf);
      const schritte: string[] = [];
      if (b.sockelChf > 0) schritte.push(`Sockel ${chf(b.sockelChf)}`);
      schritte.push(`${b.prozent} % auf ${chf(ueberschuss)}${b.abChf > 0 ? ` (Überschuss über ${chf(b.abChf)})` : ''} = ${chf((ueberschuss * b.prozent) / 100)}`);
      const roh = round2(b.sockelChf + (ueberschuss * b.prozent) / 100);
      return { deterministisch: true, betragChf: klammere(roh, b.minChf, b.maxChf, schritte), schritte };
    }

    case 'staffel_voll_prozent': {
      pruefeBasis(basisChf);
      const b = regel.baender.find((x) => basisChf <= x.bisChf);
      if (!b) throw new RangeError(`Voll-Prozent-Staffel deckt ${chf(basisChf)} nicht (letztes Band braucht bisChf: Infinity).`);
      const schritte = [`Fix ${chf(b.fixChf)} + ${b.prozent} % von ${chf(basisChf)} = ${chf(b.fixChf + (basisChf * b.prozent) / 100)}`];
      const roh = round2(b.fixChf + (basisChf * b.prozent) / 100);
      return { deterministisch: true, betragChf: klammere(roh, b.minChf, b.maxChf, schritte), schritte };
    }

    case 'staffel_rahmen': {
      pruefeBasis(basisChf);
      const b = regel.baender.find((x) => basisChf <= x.grenzeChf);
      if (!b) {
        throw new RangeError(`Rahmen-Staffel deckt den Bemessungswert ${chf(basisChf)} nicht (letztes Band braucht grenzeChf: Infinity).`);
      }
      // Grenze fest (minChf/maxChf) ODER prozentual (minProzent/maxProzent ×
      // Streitwert, optional mit Sockel/Deckel). `null`/undefined = keine Grenze.
      const seite = (fest: number | null | undefined, pct: number | undefined): number | undefined => {
        if (fest != null) return fest;
        if (pct == null) return undefined;
        let v = Math.round((basisChf * pct) / 100);
        if (b.mindestChf != null) v = Math.max(v, b.mindestChf);
        if (b.hoechstChf != null) v = Math.min(v, b.hoechstChf);
        return v;
      };
      const von = seite(b.minChf, b.minProzent);
      const bis = seite(b.maxChf, b.maxProzent);
      const grenze = Number.isFinite(b.grenzeChf) ? `bis und mit ${chf(b.grenzeChf)}` : 'oberstes Band';
      const spanne = von != null && bis != null ? `${chf(von)}–${chf(bis)}`
        : bis != null ? `bis ${chf(bis)}`
        : von != null ? `ab ${chf(von)}`
        : 'nach Aufwand';
      // %-Hinweis nur für tatsächlich prozentual bestimmte Seiten (kein irreführendes «0 %»).
      const pctNote = (b.minProzent != null && b.maxProzent != null) ? ` (${b.minProzent}–${b.maxProzent} % des Streitwerts)`
        : b.maxProzent != null ? ` (bis ${b.maxProzent} % des Streitwerts)`
        : b.minProzent != null ? ` (ab ${b.minProzent} % des Streitwerts)`
        : '';
      return {
        deterministisch: false,
        vonChf: von,
        bisChf: bis,
        hinweis: b.hinweis ?? `Gebührenrahmen ${spanne}${pctNote} (Streitwert-Band ${grenze}); Festsetzung im Ermessen der Behörde.`,
      };
    }

    case 'rahmen':
      return { deterministisch: false, vonChf: regel.vonChf, bisChf: regel.bisChf, hinweis: regel.hinweis ?? 'Behördlicher Gebührenrahmen – kein fester Punktwert.' };

    case 'formel_extern':
      return { deterministisch: false, hinweis: regel.hinweis };
  }
}
