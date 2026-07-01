// ─── Prozesskosten-Engine (Art. 95/96 ZPO) ─────────────────────────────────
//
// FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN P1 (Hauptmoat). Dünner Lader über dem
// fachneutralen Tarif-Primitiv (`tarif/staffel`) und der kantonalen Datenschicht
// (`data/tarif/*`). Gliederung strikt nach Art. 95 ZPO:
//   Prozesskosten = Gerichtskosten (Entscheidgebühr) + Parteientschädigung.
// Vorgeschaltet die kostenlosen Verfahren nach Art. 113/114 ZPO (mit der
// Unterscheidung Schlichtung ↔ Entscheidverfahren). Determinismus §2: keine
// Schätzung — Ermessenstarife liefern die Spanne, nie einen erfundenen Punkt.
// Grundlage/Verifikation: bibliothek/recherche/prozesskosten-zpo-95-96.md.

import type { Berechnungsergebnis, Rechenschritt, Normverweis } from '../types/legal';
import { auswertenTarif, skaliereErgebnis, type TarifErgebnis } from './tarif/staffel';
import { MODIFIKATOREN, type Faktor } from '../data/tarif/modifikatoren';
import { GERICHTSKOSTEN } from '../data/tarif/gerichtskosten';
import { SCHLICHTUNG } from '../data/tarif/schlichtung';
import { PARTEIENTSCHAEDIGUNG } from '../data/tarif/parteientschaedigung';
import { KANTONE, MWST_NORMALSATZ_PROZENT, type KantonCode, type KantonalerTarif } from '../data/tarif/typen';
import {
  BGER_GERICHTSKOSTEN, BGER_GERICHTSKOSTEN_REDUZIERT, BGER_GERICHTSKOSTEN_OHNE_VERMOEGEN,
  BGER_PARTEIENTSCHAEDIGUNG, BGER_PARTEIENTSCHAEDIGUNG_OHNE_VERMOEGEN, type BgerTarif,
} from '../data/tarif/bundesgericht';
import { GERICHTSKOSTEN_NV, PARTEIENTSCHAEDIGUNG_NV, SCHLICHTUNG_NV } from '../data/tarif/nicht-vermoegensrechtlich';

export type { KantonCode } from '../data/tarif/typen';
export { KANTONE } from '../data/tarif/typen';

export type Verfahrensphase = 'schlichtung' | 'entscheid';

export type Materie =
  | 'allgemein'
  | 'arbeit'
  | 'miete_pacht'
  | 'gleichstellung'
  | 'behindertengleichstellung'
  | 'mitwirkung'
  | 'zusatzversicherung_kvg'
  | 'datenschutz'
  | 'gewaltschutz';

export const MATERIEN: { wert: Materie; label: string }[] = [
  { wert: 'allgemein', label: 'Allgemeine vermögensrechtliche Streitigkeit' },
  { wert: 'arbeit', label: 'Arbeitsrecht (inkl. AVG)' },
  { wert: 'miete_pacht', label: 'Miete/Pacht von Wohn-/Geschäftsräumen' },
  { wert: 'gleichstellung', label: 'Gleichstellung (GlG)' },
  { wert: 'behindertengleichstellung', label: 'Behindertengleichstellung (BehiG)' },
  { wert: 'mitwirkung', label: 'Mitwirkungsgesetz' },
  { wert: 'zusatzversicherung_kvg', label: 'Zusatzversicherung zur sozialen Krankenversicherung' },
  { wert: 'datenschutz', label: 'Datenschutz (DSG)' },
  { wert: 'gewaltschutz', label: 'Gewaltschutz (Art. 28b/28c ZGB)' },
];

export const VERFAHRENSPHASEN: { wert: Verfahrensphase; label: string }[] = [
  { wert: 'entscheid', label: 'Entscheidverfahren (Gericht)' },
  { wert: 'schlichtung', label: 'Schlichtungsverfahren' },
];

/** Instanz. 'erstinstanz' = kantonale erste Instanz; 'rechtsmittel' = obere
 *  kantonale Instanz (Berufung/Beschwerde, Faktor auf den kant. Tarif);
 *  'handelsgericht' = einzige kantonale Instanz für handelsrechtliche
 *  Streitigkeiten (Art. 6 ZPO; nur ZH/BE/AG/SG), ordentlicher Tarif, direkt → BGer;
 *  'bundesgericht' = Beschwerde ans BGer (bundesrechtlicher Tarif, Art. 65/68 BGG). */
export type Instanz = 'erstinstanz' | 'rechtsmittel' | 'handelsgericht' | 'bundesgericht';

/** Kantone mit einem Handelsgericht (Art. 6 ZPO). */
export const HANDELSGERICHT_KANTONE: readonly KantonCode[] = ['ZH', 'BE', 'AG', 'SG'];

/** Verfahrensart als Kosten-Modifikator (nur erste/Rechtsmittelinstanz, nicht BGer). */
export type Verfahrensart = 'ordentlich' | 'vereinfacht' | 'summarisch';

export const INSTANZEN: { wert: Instanz; label: string }[] = [
  { wert: 'erstinstanz', label: 'Erste Instanz (kantonal)' },
  { wert: 'rechtsmittel', label: 'Rechtsmittel (Berufung/Beschwerde)' },
  { wert: 'handelsgericht', label: 'Handelsgericht (einzige Instanz)' },
  { wert: 'bundesgericht', label: 'Bundesgericht' },
];
export const VERFAHRENSARTEN: { wert: Verfahrensart; label: string }[] = [
  { wert: 'ordentlich', label: 'Ordentliches Verfahren' },
  { wert: 'vereinfacht', label: 'Vereinfachtes Verfahren (Art. 243 ZPO)' },
  { wert: 'summarisch', label: 'Summarisches Verfahren' },
];

export interface ProzesskostenEingabe {
  kanton: KantonCode;
  streitwertCHF: number;
  phase: Verfahrensphase;
  materie: Materie;
  /** Default 'erstinstanz' (additiv; bestehende Aufrufe unverändert). */
  instanz?: Instanz;
  /** Default 'ordentlich' (Modifikator auf den Basistarif). */
  verfahren?: Verfahrensart;
  /** true = nicht vermögensrechtliche Streitigkeit (kein Streitwert): eigener
   *  kantonaler Gebührenrahmen, Festsetzung nach Bedeutung/Aufwand (Ermessen). */
  nichtVermoegensrechtlich?: boolean;
}

/** Herkunfts-/Anzeige-Metadaten eines Tarifs (ohne die Regel selbst). */
export interface TarifQuelle {
  erlassName: string;
  erlassNr: string;
  artikel: string;
  quelleUrl: string;
  stand: string;
  verifiziert: KantonalerTarif['verifiziert'];
  hinweis?: string;
  /** true = Betrag bereits inkl. MwSt (kein MwSt-Aufschlag auf die PE). */
  mwstInbegriffen?: boolean;
  /** I4 — Bemessungskriterien der kantonalen Norm (Anzeige bei Spanne, §8). */
  kriterien?: string[];
  /** Bezeichnung der Bemessungsnorm, aus der `kriterien` stammen. */
  kriterienNorm?: string;
}

export interface PostenErgebnis {
  /** true = für diese Konstellation werden keine Kosten gesprochen. */
  kostenlos: boolean;
  /** Norm + Materie, wenn kostenlos (Art. 113/114 ZPO). */
  kostenlosGrund?: string;
  /** true = Schlichtungspauschale (Art. 95 II lit. a ZPO): eigener, meist
   *  reduzierter Tarif (nicht die Entscheidgebühr) — hier nicht beziffert. */
  schlichtungspauschale?: boolean;
  /** Tarif-Ergebnis (Betrag oder Rahmen), wenn nicht kostenlos. */
  ergebnis?: TarifErgebnis;
  quelle: TarifQuelle;
}

export interface ProzesskostenErgebnis {
  kanton: KantonCode;
  streitwertCHF: number;
  phase: Verfahrensphase;
  materie: Materie;
  gerichtskosten: PostenErgebnis;
  parteientschaedigung: PostenErgebnis;
  hinweise: string[];
}

const quelle = (t: KantonalerTarif): TarifQuelle => ({
  erlassName: t.erlassName, erlassNr: t.erlassNr, artikel: t.artikel,
  quelleUrl: t.quelleUrl, stand: t.stand, verifiziert: t.verifiziert, hinweis: t.hinweis, mwstInbegriffen: t.mwstInbegriffen,
  kriterien: t.kriterien, kriterienNorm: t.kriterienNorm,
});

const bgerQuelle = (t: BgerTarif): TarifQuelle => ({
  erlassName: t.erlassName, erlassNr: t.erlassNr, artikel: t.artikel,
  quelleUrl: t.quelleUrl, stand: t.stand, verifiziert: 'doppelt', hinweis: t.hinweis, mwstInbegriffen: t.mwstInbegriffen,
});

interface KostenlosBefund { kostenlos: boolean; norm?: string; grund?: string; }

/** Gerichtskosten-Kostenlosigkeit nach Art. 113 Abs. 2 (Schlichtung) bzw.
 *  Art. 114 ZPO (Entscheidverfahren). WICHTIG: Miete/Pacht ist NUR in der
 *  Schlichtung kostenfrei (Art. 113 II lit. c), NICHT im Entscheidverfahren. */
function gerichtskostenKostenlos(phase: Verfahrensphase, materie: Materie, streitwertCHF: number, nichtVermoegensrechtlich = false): KostenlosBefund {
  // Die Arbeits-Kostenfreiheit (Art. 113 II lit. d / 114 lit. c) knüpft an einen
  // Streitwert ≤ 30 000 an — bei einer nicht vermögensrechtlichen Streitigkeit
  // (kein Streitwert) greift sie nicht automatisch (§8: ehrlich nicht annehmen).
  const arbeitFrei = !nichtVermoegensrechtlich && streitwertCHF <= 30000;
  if (phase === 'schlichtung') {
    switch (materie) {
      case 'gleichstellung': return { kostenlos: true, norm: 'Art. 113 Abs. 2 lit. a ZPO', grund: 'Gleichstellungsgesetz' };
      case 'behindertengleichstellung': return { kostenlos: true, norm: 'Art. 113 Abs. 2 lit. b ZPO', grund: 'Behindertengleichstellungsgesetz' };
      case 'miete_pacht': return { kostenlos: true, norm: 'Art. 113 Abs. 2 lit. c ZPO', grund: 'Miete/Pacht von Wohn-/Geschäftsräumen' };
      case 'arbeit': return arbeitFrei ? { kostenlos: true, norm: 'Art. 113 Abs. 2 lit. d ZPO', grund: 'Arbeitsverhältnis bis Streitwert CHF 30 000' } : { kostenlos: false };
      case 'mitwirkung': return { kostenlos: true, norm: 'Art. 113 Abs. 2 lit. e ZPO', grund: 'Mitwirkungsgesetz' };
      case 'zusatzversicherung_kvg': return { kostenlos: true, norm: 'Art. 113 Abs. 2 lit. f ZPO', grund: 'Zusatzversicherung zur sozialen Krankenversicherung' };
      case 'datenschutz': return { kostenlos: true, norm: 'Art. 113 Abs. 2 lit. g ZPO', grund: 'Datenschutzgesetz' };
      default: return { kostenlos: false };
    }
  }
  switch (materie) {
    case 'gleichstellung': return { kostenlos: true, norm: 'Art. 114 lit. a ZPO', grund: 'Gleichstellungsgesetz' };
    case 'behindertengleichstellung': return { kostenlos: true, norm: 'Art. 114 lit. b ZPO', grund: 'Behindertengleichstellungsgesetz' };
    case 'arbeit': return arbeitFrei ? { kostenlos: true, norm: 'Art. 114 lit. c ZPO', grund: 'Arbeitsverhältnis bis Streitwert CHF 30 000' } : { kostenlos: false };
    case 'mitwirkung': return { kostenlos: true, norm: 'Art. 114 lit. d ZPO', grund: 'Mitwirkungsgesetz' };
    case 'zusatzversicherung_kvg': return { kostenlos: true, norm: 'Art. 114 lit. e ZPO', grund: 'Zusatzversicherung zur sozialen Krankenversicherung' };
    case 'gewaltschutz': return { kostenlos: true, norm: 'Art. 114 lit. f ZPO', grund: 'Gewalt/Drohung/Nachstellung (Art. 28b/28c ZGB)' };
    case 'datenschutz': return { kostenlos: true, norm: 'Art. 114 lit. g ZPO', grund: 'Datenschutzgesetz' };
    // miete_pacht: im Entscheidverfahren NICHT kostenlos (nur Schlichtung)
    default: return { kostenlos: false };
  }
}

const pruefeStreitwert = (chf: number): void => {
  if (!Number.isFinite(chf) || chf < 0) throw new RangeError(`Streitwert muss eine Zahl ≥ 0 sein (erhalten: ${chf}).`);
};

/** Prozesskosten für EINEN Kanton (Art. 95 ZPO: Gerichtskosten + Parteientschädigung). */
export function berechneProzesskosten(e: ProzesskostenEingabe): ProzesskostenErgebnis {
  pruefeStreitwert(e.streitwertCHF);

  // Instanz Bundesgericht (Art. 65/68 BGG): bundesrechtlicher Tarif,
  // kantonsunabhängig. Kein Art.-113/114-Vorschalter — reduzierter Ansatz nach
  // Art. 65 Abs. 4 BGG (NICHT Mietrecht!), sonst ordentliche BGer-Staffel.
  if (e.instanz === 'bundesgericht') {
    const nv = e.nichtVermoegensrechtlich === true;
    const reduziert = !nv && (e.materie === 'gleichstellung' || e.materie === 'behindertengleichstellung'
      || (e.materie === 'arbeit' && e.streitwertCHF <= 30000));
    const gkB = nv ? BGER_GERICHTSKOSTEN_OHNE_VERMOEGEN : reduziert ? BGER_GERICHTSKOSTEN_REDUZIERT : BGER_GERICHTSKOSTEN;
    const peB = nv ? BGER_PARTEIENTSCHAEDIGUNG_OHNE_VERMOEGEN : BGER_PARTEIENTSCHAEDIGUNG;
    return {
      kanton: e.kanton, streitwertCHF: e.streitwertCHF, phase: 'entscheid', materie: e.materie,
      gerichtskosten: { kostenlos: false, ergebnis: auswertenTarif(gkB.regel, e.streitwertCHF), quelle: bgerQuelle(gkB) },
      parteientschaedigung: { kostenlos: false, ergebnis: auswertenTarif(peB.regel, e.streitwertCHF), quelle: bgerQuelle(peB) },
      hinweise: [
        'Beschwerde ans Bundesgericht (Art. 65/68 BGG); Tarife bundesrechtlich, kantonsunabhängig.',
        nv ? 'Streitigkeit ohne Vermögensinteresse: Gerichtsgebühr nach Art. 65 Abs. 3 lit. a BGG (CHF 200–5000), streitwertunabhängig; die Parteientschädigung setzt das Gericht nach Ermessen fest.'
          : reduziert ? 'Reduzierter Ansatz nach Art. 65 Abs. 4 BGG (streitwertunabhängig).' : 'Gerichtsgebühr nach Streitwert (Art. 65 Abs. 3 lit. b BGG); Überschreitung bis zum Doppelten möglich (Abs. 5).',
        'Kostenvorschuss in Höhe der mutmasslichen Gerichtskosten (Art. 62 BGG); unentgeltliche Rechtspflege Art. 64 BGG.',
      ],
    };
  }

  const nv = e.nichtVermoegensrechtlich === true;
  const gkTarif = nv ? GERICHTSKOSTEN_NV[e.kanton] : GERICHTSKOSTEN[e.kanton];
  const schlichtungTarif = nv ? SCHLICHTUNG_NV[e.kanton] : SCHLICHTUNG[e.kanton];
  const peTarif = nv ? PARTEIENTSCHAEDIGUNG_NV[e.kanton] : PARTEIENTSCHAEDIGUNG[e.kanton];

  // Gerichtskosten (Art. 95 II): im Entscheidverfahren die Entscheidgebühr
  // (lit. b) nach kantonalem Tarif; im Schlichtungsverfahren die Pauschale für
  // das Schlichtungsverfahren (lit. a) nach dem EIGENEN kantonalen Schlichtungs-
  // tarif (data/tarif/schlichtung.ts — regime-treu getrennt vom Entscheidgebühr-
  // Tarif, §4). Vorbehältlich Kostenlosigkeit (Art. 113/114 ZPO).
  const gkFrei = gerichtskostenKostenlos(e.phase, e.materie, e.streitwertCHF, nv);
  const aktiverGkTarif = e.phase === 'schlichtung' ? schlichtungTarif : gkTarif;
  let gerichtskosten: PostenErgebnis = gkFrei.kostenlos
    ? { kostenlos: true, kostenlosGrund: `${gkFrei.norm}: ${gkFrei.grund}`, quelle: quelle(aktiverGkTarif) }
    : { kostenlos: false, ergebnis: auswertenTarif(aktiverGkTarif.regel, e.streitwertCHF), quelle: quelle(aktiverGkTarif) };

  // Parteientschädigung (Art. 95 III): im Schlichtungsverfahren wird KEINE
  // gesprochen (Art. 113 Abs. 1 ZPO); im Entscheidverfahren nach kant. Tarif.
  let parteientschaedigung: PostenErgebnis = e.phase === 'schlichtung'
    ? { kostenlos: true, kostenlosGrund: 'Art. 113 Abs. 1 ZPO: im Schlichtungsverfahren keine Parteientschädigung', quelle: quelle(peTarif) }
    : { kostenlos: false, ergebnis: auswertenTarif(peTarif.regel, e.streitwertCHF), quelle: quelle(peTarif) };

  const hinweise = [
    'Prozesskosten = Gerichtskosten + Parteientschädigung (Art. 95 ZPO); die Kantone setzen die Tarife fest (Art. 96 ZPO).',
    'Kostenvorschuss in der Regel bis zur Hälfte der mutmasslichen Gerichtskosten (Art. 98 ZPO).',
    'Beträge sind die Grund-/Entscheidgebühr bzw. das Grundhonorar; gerichtliche Erhöhungen/Ermässigungen, Auslagen, Beweis-/Übersetzungskosten und MwSt. sind nicht enthalten.',
  ];
  if (e.phase === 'schlichtung') {
    hinweise.push('Im Schlichtungsverfahren gilt der kantonale Schlichtungstarif (Pauschale, Art. 95 II lit. a ZPO) — ein eigener, vom Entscheidgebühr-Tarif getrennter Ansatz. Fällt die Schlichtungsbehörde einen Entscheid oder unterbreitet sie einen Urteilsvorschlag (Art. 210/212 ZPO), kann er sich erhöhen (siehe Tarif-Hinweis).');
  }
  if (nv) {
    hinweise.push('Nicht vermögensrechtliche Streitigkeit: kein Streitwert — die Gebühr wird im gesetzlichen Rahmen nach Bedeutung der Sache, Umfang/Schwierigkeit und Zeitaufwand festgesetzt (Ermessen, daher Spanne).');
    if (e.materie === 'arbeit') hinweise.push('Hinweis Arbeitsrecht: Die Kostenfreiheit nach Art. 113 II lit. d / 114 lit. c ZPO knüpft an einen Streitwert ≤ CHF 30 000 an und greift bei einer nicht vermögensrechtlichen Streitigkeit nicht ohne Weiteres.');
  }
  if (e.instanz === 'handelsgericht') {
    hinweise.push(HANDELSGERICHT_KANTONE.includes(e.kanton)
      ? `Handelsgericht ${e.kanton}: einzige kantonale Instanz für handelsrechtliche Streitigkeiten (Art. 6 ZPO; Voraussetzungen Abs. 2). Kein Schlichtungsverfahren (Art. 198 lit. f ZPO); Weiterzug direkt mit Beschwerde in Zivilsachen ans Bundesgericht (Art. 75 Abs. 2 lit. b BGG). Es gilt der ordentliche erstinstanzliche Tarif.`
      : `Der Kanton ${e.kanton} führt kein Handelsgericht (nur ZH/BE/AG/SG, Art. 6 ZPO); angezeigt ist zum Vergleich der ordentliche erstinstanzliche Tarif.`);
  }

  // Verfahrensart-/Instanz-Modifikator (Entscheidphase, kantonale Instanz):
  // Faktor-Spanne auf den Basistarif (Rechtsmittel hat Vorrang vor Verfahrensart).
  // Das Handelsgericht führt das ordentliche Verfahren als einzige Instanz —
  // kein Modifikator (Basistarif).
  if (e.phase === 'entscheid' && e.instanz !== 'handelsgericht') {
    const mod = MODIFIKATOREN[e.kanton];
    let fak: Faktor | null = null; let label = '';
    if (e.instanz === 'rechtsmittel') { fak = mod.rechtsmittel; label = 'Rechtsmittelinstanz'; }
    else if (e.verfahren === 'summarisch') { fak = mod.summarisch; label = 'summarisches Verfahren'; }
    else if (e.verfahren === 'vereinfacht') { fak = mod.vereinfacht; label = 'vereinfachtes Verfahren'; }
    if (fak && !(fak.gkMin === 1 && fak.gkMax === 1 && fak.peMin === 1 && fak.peMax === 1)) {
      const caveat = mod.verifiziert === 'recherche' ? ', nicht abschliessend verifiziert' : '';
      if (!gerichtskosten.kostenlos && gerichtskosten.ergebnis) {
        gerichtskosten = { ...gerichtskosten, ergebnis: skaliereErgebnis(gerichtskosten.ergebnis, fak.gkMin, fak.gkMax, `${label}: Faktor ${fak.gkMin}–${fak.gkMax} (${mod.artikel}${caveat})`) };
      }
      if (!parteientschaedigung.kostenlos && parteientschaedigung.ergebnis) {
        parteientschaedigung = { ...parteientschaedigung, ergebnis: skaliereErgebnis(parteientschaedigung.ergebnis, fak.peMin, fak.peMax, `${label}: Faktor ${fak.peMin}–${fak.peMax} (${mod.artikel}${caveat})`) };
      }
      hinweise.push(`Modifikator «${label}»: Faktor auf den erstinstanzlichen Basistarif (${mod.artikel})${caveat}.`);
    }
  }

  // Ermessenskriterien (Auftrag David): bei Spannen nennen, wonach die Behörde
  // innerhalb des Rahmens festsetzt. Die genaue Bemessungsnorm je Tarif steht im
  // quelle.hinweis; hier die kantonsübergreifend einschlägigen Kriterien.
  const istSpanne = (p: PostenErgebnis) => !p.kostenlos && p.ergebnis !== undefined && !p.ergebnis.deterministisch;
  if (istSpanne(gerichtskosten) || istSpanne(parteientschaedigung)) {
    hinweise.push('Innerhalb des Rahmens setzt die Behörde nach Ermessen fest — massgebend sind Bedeutung der Sache, tatsächliche und rechtliche Schwierigkeit/Komplexität, Umfang der Sache und Zeitaufwand (teils wirtschaftliche Verhältnisse der Parteien); die genaue Bemessungsnorm steht beim jeweiligen Tarif.');
  }

  return { kanton: e.kanton, streitwertCHF: e.streitwertCHF, phase: e.phase, materie: e.materie, gerichtskosten, parteientschaedigung, hinweise };
}

// ─── Kostenrisiko nach Obsiegensquote (Art. 106/111 ZPO) ────────────────────
// Verteilung der Prozesskosten nach Ausgang des Verfahrens (Art. 106 Abs. 2:
// «nach dem Ausgang verteilt»); die unterliegende Partei zahlt der anderen die
// zugesprochene Parteientschädigung (Art. 111 Abs. 2). Vorbehalten bleibt die
// Verteilung nach Ermessen (Art. 107, u. a. Familienrecht) und Art. 108 — daher
// als Schätzung mit Hinweis. Ermessenstarife → Spanne (von/bis).

export interface Spanne { vonChf: number; bisChf: number }

export interface Kostenrisiko {
  obsiegensquote: number; // 0..1
  berechenbar: boolean;
  /** true = unter Annahme bewilligter unentgeltlicher Rechtspflege (Art. 118 ZPO). */
  unentgeltlich?: boolean;
  /** Gerichtskosten zu eigenen Lasten = Gerichtskosten × (1 − Quote). */
  gerichtskostenZuLasten?: Spanne;
  /** Saldo Parteientschädigung = (2·Quote − 1) × Tarif; positiv = Sie erhalten,
   *  negativ = Sie zahlen (Art. 111 Abs. 2). */
  parteientschaedigungSaldo?: Spanne;
  /** Eigene Anwaltskosten als Richtwert (kant. Tarif). Achtung Deckungslücke:
   *  das effektiv vereinbarte Honorar kann höher sein als der Tarif. */
  eigeneAnwaltskostenRichtwert?: Spanne;
  /** Geschätzte Netto-Kostenbelastung = (1−Quote) × (Gerichtskosten + 2 ×
   *  Parteientschädigung): eigener + gegnerischer Tarifanteil abzüglich
   *  Erstattung. */
  nettoBelastung?: Spanne;
  hinweise: string[];
}

const postenSpanne = (p: PostenErgebnis): Spanne | null => {
  if (p.kostenlos) return { vonChf: 0, bisChf: 0 };
  if (p.schlichtungspauschale) return null;
  const e = p.ergebnis;
  if (!e) return null;
  if (e.deterministisch) return { vonChf: e.betragChf, bisChf: e.betragChf };
  if (typeof e.vonChf === 'number' && typeof e.bisChf === 'number') return { vonChf: e.vonChf, bisChf: e.bisChf };
  return null; // formel_extern / nur einseitig offene Spanne → nicht rechenbar
};

const skaliere = (s: Spanne, f: number): Spanne =>
  f >= 0 ? { vonChf: Math.round(s.vonChf * f), bisChf: Math.round(s.bisChf * f) }
         : { vonChf: Math.round(s.bisChf * f), bisChf: Math.round(s.vonChf * f) };

/** Kostenrisiko aus Gerichtskosten- und Parteientschädigungs-Posten bei
 *  gegebener Obsiegensquote (0..1). gk/pe stammen aus berechneProzesskosten.
 *  `unentgeltlich` = bewilligte unentgeltliche Rechtspflege (Art. 118 ZPO):
 *  eigene Gerichtskosten befreit, Vorschuss entfällt, Rechtsbeistand vom Kanton —
 *  ABER die Parteientschädigung an die Gegenpartei bleibt geschuldet (Abs. 3),
 *  Nachzahlungsvorbehalt (Art. 123). */
export function berechneKostenrisiko(gk: PostenErgebnis, pe: PostenErgebnis, obsiegensquote: number, unentgeltlich = false): Kostenrisiko {
  const q = Math.min(1, Math.max(0, obsiegensquote));
  const gkS = postenSpanne(gk);
  const peS = postenSpanne(pe);
  const hinweise = [
    'Verteilung nach Ausgang des Verfahrens (Art. 106 ZPO); die unterliegende Partei zahlt die zugesprochene Parteientschädigung (Art. 111 Abs. 2 ZPO).',
    'Schätzung: das Gericht kann nach Ermessen abweichen (Art. 107 ZPO, u. a. familienrechtliche Verfahren) und unnötige Kosten gesondert auferlegen (Art. 108 ZPO).',
    'Deckungslücke: die zugesprochene Parteientschädigung (Tarif) kann unter dem effektiv vereinbarten Anwaltshonorar liegen.',
  ];
  if (unentgeltlich) hinweise.push(
    'Unentgeltliche Rechtspflege bewilligt: Befreiung von Vorschuss/Sicherheit und Gerichtskosten, unentgeltlicher Rechtsbeistand (Art. 118 Abs. 1 ZPO).',
    'ABER: keine Befreiung von der Parteientschädigung an die Gegenpartei (Art. 118 Abs. 3 ZPO) — dieses Risiko bleibt.',
    'Nachzahlungspflicht, sobald die Partei dazu in der Lage ist; der Anspruch des Kantons verjährt 10 Jahre nach Verfahrensabschluss (Art. 123 ZPO).',
  );
  if (!gkS || !peS) {
    return { obsiegensquote: q, berechenbar: false, unentgeltlich, hinweise: [...hinweise, 'Für diese Konstellation (z. B. Schlichtungspauschale oder aufwandbasierter Anwaltstarif) ist das Kostenrisiko nicht beziffert.'] };
  }
  // Bei UR trägt die Partei die eigenen Gerichtskosten nicht (Art. 118 I lit. b)
  // und der eigene Rechtsbeistand wird vom Kanton entschädigt; es bleibt das
  // Risiko der gegnerischen Parteientschädigung bei (teilweisem) Unterliegen.
  const gkZuLasten = unentgeltlich ? { vonChf: 0, bisChf: 0 } : skaliere(gkS, 1 - q);
  const netto = unentgeltlich
    ? skaliere(peS, 1 - q) // nur die gegnerische Parteientschädigung
    : { vonChf: Math.round((1 - q) * (gkS.vonChf + 2 * peS.vonChf)), bisChf: Math.round((1 - q) * (gkS.bisChf + 2 * peS.bisChf)) };
  return {
    obsiegensquote: q,
    berechenbar: true,
    unentgeltlich,
    gerichtskostenZuLasten: gkZuLasten,
    parteientschaedigungSaldo: skaliere(peS, 2 * q - 1),
    eigeneAnwaltskostenRichtwert: peS,
    nettoBelastung: netto,
    hinweise,
  };
}

// ─── Vollständigkeit der Kostenposten (I6 — Art. 95/98/117 ff. ZPO) ─────────
// Über die Entscheidgebühr + Parteientschädigung hinaus prägen weitere Posten
// das Kostenbild: der Kostenvorschuss (Liquidität, Art. 98), die MwSt auf die
// Parteientschädigung (fallabhängig) sowie die nicht bezifferbaren Auslagen-/
// Beweis-/Übersetzungs-/Kindesvertretungskosten und die unentgeltliche
// Rechtspflege (Hinweis). Grundlage/Verifikation: prozesskosten-zpo-95-96.md §A
// (Art. 98 Rev. 1.1.2025) + prozesskosten-sonderkonstellationen.md §6.4/§6.7/§3.

/** Kostenvorschuss nach Art. 98 ZPO (Stand 1.1.2025): Regel = höchstens die
 *  Hälfte der mutmasslichen Gerichtskosten; voller Vorschuss im Schlichtungs-,
 *  summarischen und Rechtsmittelverfahren (sowie Art. 6 IV lit. c / Art. 8 ZPO).
 *  Am Bundesgericht gilt Art. 62 BGG (voller mutmasslicher Betrag). */
export interface Kostenvorschuss {
  /** Vorschuss-Spanne aus den mutmasslichen Gerichtskosten × Faktor; null =
   *  nicht bezifferbar (Schlichtungspauschale / aufwandbasierte Gerichtskosten). */
  spanne: Spanne | null;
  /** true = voller Vorschuss (Faktor 1); false = höchstens die Hälfte (Faktor ½). */
  voll: boolean;
  faktor: 0.5 | 1;
  norm: string;
  hinweis: string;
}

export function berechneKostenvorschuss(
  gk: PostenErgebnis, phase: Verfahrensphase, instanz: Instanz, verfahren: Verfahrensart,
): Kostenvorschuss {
  if (gk.kostenlos) {
    return { spanne: { vonChf: 0, bisChf: 0 }, voll: false, faktor: 0.5, norm: 'Art. 98 ZPO',
      hinweis: 'Für diese Konstellation fallen keine Gerichtskosten an — kein Kostenvorschuss.' };
  }
  // Bundesgericht: Art. 62 BGG (voller mutmasslicher Betrag), nicht Art. 98 ZPO.
  if (instanz === 'bundesgericht') {
    const s = postenSpanne(gk);
    return { spanne: s, voll: true, faktor: 1, norm: 'Art. 62 BGG',
      hinweis: 'Beschwerde ans Bundesgericht: Vorschuss in Höhe der mutmasslichen Gerichtskosten (Art. 62 Abs. 1 BGG).' };
  }
  // Voller Vorschuss (Art. 98 II): Schlichtung, summarisches und Rechtsmittelverfahren.
  const grundVoll = phase === 'schlichtung' ? 'Schlichtungsverfahren'
    : instanz === 'rechtsmittel' ? 'Rechtsmittelverfahren'
    : verfahren === 'summarisch' ? 'summarisches Verfahren'
    : null;
  const voll = grundVoll !== null;
  const faktor: 0.5 | 1 = voll ? 1 : 0.5;
  const s = postenSpanne(gk);
  const spanne = s ? skaliere(s, faktor) : null;
  const summarischAusnahme = grundVoll === 'summarisches Verfahren'
    ? ' — im summarischen Verfahren mit Ausnahmen (Art. 248 lit. d sowie bestimmte familienrechtliche Angelegenheiten: dort nur die Hälfte)'
    : '';
  const hinweis = voll
    ? `Voller Vorschuss möglich (${grundVoll}, Art. 98 Abs. 2 ZPO)${gk.schlichtungspauschale ? ' — die Schlichtungspauschale ist hier nicht beziffert' : ''}${summarischAusnahme}.`
    : 'Regel: höchstens die Hälfte der mutmasslichen Gerichtskosten (Art. 98 Abs. 1 ZPO, Fassung seit 1.1.2025).';
  return { spanne, voll, faktor, norm: voll ? 'Art. 98 Abs. 2 ZPO' : 'Art. 98 Abs. 1 ZPO', hinweis };
}

/** MwSt auf die Parteientschädigung (Art. 95 III lit. b ZPO i.V.m. MWSTG):
 *  Normalsatz 8,1 % (seit 1.1.2024). Kommt hinzu, wenn die berechtigte Partei
 *  NICHT vorsteuerabzugsberechtigt ist (z. B. Privatperson); die kantonale
 *  Behandlung ist uneinheitlich (inkl./zzgl./ohne). Anwendbarkeit fallabhängig
 *  → nur auf ausdrücklichen Wunsch hinzugerechnet (§8). */
export interface MwstAufschlag {
  satzProzent: number;
  /** MwSt-Betrag auf die Parteientschädigung; null = PE nicht beziffert. */
  betrag: Spanne | null;
  /** Parteientschädigung inkl. MwSt; null = nicht beziffert. */
  bruttoSpanne: Spanne | null;
  hinweis: string;
}

export function berechneMwstParteientschaedigung(
  pe: PostenErgebnis, satzProzent: number = MWST_NORMALSATZ_PROZENT,
): MwstAufschlag {
  const s = postenSpanne(pe);
  // Enthält der Tarif die MwSt bereits (z. B. Bundesgericht-Reglement, VS LTar),
  // wird KEIN Aufschlag gerechnet — sonst Doppelzählung (§1/§8, Bug-Check 15.6.2026).
  if (pe.quelle.mwstInbegriffen) {
    return { satzProzent, betrag: null, bruttoSpanne: s,
      hinweis: `Die Parteientschädigung enthält die MwSt bereits (${pe.quelle.artikel}) — kein zusätzlicher Aufschlag.` };
  }
  const basis = `MwSt-Normalsatz ${satzProzent.toLocaleString('de-CH')} % (seit 1.1.2024) auf die Parteientschädigung — anwendbar, wenn die berechtigte Partei nicht vorsteuerabzugsberechtigt ist (z. B. Privatperson); die kantonale Behandlung ist uneinheitlich (inkl./zzgl./ohne).`;
  if (!s || (s.vonChf === 0 && s.bisChf === 0)) {
    return { satzProzent, betrag: null, bruttoSpanne: null,
      hinweis: pe.kostenlos ? 'Keine Parteientschädigung — kein MwSt-Aufschlag.' : `${basis} Hier nicht beziffert.` };
  }
  const f = satzProzent / 100;
  const betrag: Spanne = { vonChf: Math.round(s.vonChf * f), bisChf: Math.round(s.bisChf * f) };
  const bruttoSpanne: Spanne = { vonChf: Math.round(s.vonChf * (1 + f)), bisChf: Math.round(s.bisChf * (1 + f)) };
  return { satzProzent, betrag, bruttoSpanne, hinweis: basis };
}

// ─── Sicherheit für die Parteientschädigung (Art. 99 ZPO — Kaution) ─────────
// Die beklagte Partei kann von der klagenden Partei Sicherheit für ihre
// Parteientschädigung verlangen (Kautionsgründe Art. 99 Abs. 1 lit. a–d). Höhe
// = mutmassliche Parteientschädigung der Gegenpartei. Ausgeschlossen in den
// Fällen von Art. 99 Abs. 3 (vereinfachtes Verfahren ausser Art. 243 I,
// Scheidung, summarisch ausser Art. 257, DSG). Wortlaut Fedlex 1.1.2025
// verifiziert (15.6.2026); Recherche: prozesskosten-sonderkonstellationen.md §3.17–3.19.

export interface Sicherheitsleistung {
  /** false = im aktuellen Verfahren von Gesetzes wegen ausgeschlossen (Art. 99 III). */
  moeglich: boolean;
  /** Höhe = mutmassliche Parteientschädigung der beklagten Partei (null = nicht beziffert). */
  spanne: Spanne | null;
  /** Ausschlussgrund (Art. 99 Abs. 3 ZPO), wenn moeglich = false. */
  ausschluss?: string;
  norm: string;
  hinweise: string[];
}

export function berechneSicherheitsleistung(
  pe: PostenErgebnis, phase: Verfahrensphase, verfahren: Verfahrensart, materie: Materie, nichtVermoegensrechtlich: boolean,
): Sicherheitsleistung {
  const ausschluss = phase === 'schlichtung'
    ? 'Im Schlichtungsverfahren wird keine Parteientschädigung gesprochen (Art. 113 Abs. 1 ZPO) — keine Sicherheitsleistung.'
    : materie === 'datenschutz'
      ? 'Keine Sicherheit in Streitigkeiten nach dem DSG (Art. 99 Abs. 3 lit. d ZPO).'
      : verfahren === 'summarisch'
        ? 'Keine Sicherheit im summarischen Verfahren (Art. 99 Abs. 3 lit. c ZPO) — Ausnahme: Rechtsschutz in klaren Fällen (Art. 257 ZPO).'
        : (verfahren === 'vereinfacht' && nichtVermoegensrechtlich)
          ? 'Keine Sicherheit im vereinfachten Verfahren (Art. 99 Abs. 3 lit. a ZPO); Ausnahme nur für vermögensrechtliche Streitigkeiten nach Art. 243 Abs. 1 ZPO.'
          : undefined;
  const moeglich = ausschluss === undefined;
  const hinweise = moeglich ? [
    'Auf Antrag der beklagten Partei (Art. 99 Abs. 1 ZPO), wenn die klagende Partei: keinen Wohnsitz/Sitz in der Schweiz hat (lit. a); zahlungsunfähig erscheint — Konkurs, Nachlassverfahren, Verlustscheine (lit. b); Prozesskosten aus früheren Verfahren schuldet (lit. c); oder die Parteientschädigung aus anderen Gründen erheblich gefährdet ist (lit. d).',
    'Höhe der Sicherheit = mutmassliche Parteientschädigung der Gegenpartei (kantonaler Tarif).',
    'Bei notwendiger Streitgenossenschaft nur, wenn bei allen Streitgenossen ein Grund vorliegt (Art. 99 Abs. 2 ZPO).',
    'Nicht im Scheidungsverfahren (Art. 99 Abs. 3 lit. b ZPO).',
  ] : [ausschluss];
  return { moeglich, spanne: moeglich ? postenSpanne(pe) : null, ausschluss, norm: 'Art. 99 ZPO', hinweise };
}

/** Nicht bezifferbare weitere Kostenposten (Art. 95 II lit. c–e / III lit. a ZPO)
 *  und die unentgeltliche Rechtspflege (Art. 117 ff. ZPO) — ehrlich als Hinweis
 *  ausgewiesen (§2/§8: aufwand-/bedürftigkeitsabhängig, kein deterministischer
 *  Betrag). Reine, statische Aufklärung; keine fallabhängige Berechnung. */
export const WEITERE_KOSTENPOSTEN: readonly string[] = [
  'Kosten der Beweisführung (Gutachten, Zeugen) — Art. 95 Abs. 2 lit. c ZPO: aufwandabhängig, nicht im Voraus beziffert.',
  'Übersetzungskosten — Art. 95 Abs. 2 lit. d ZPO; Kosten der Kindesvertretung (Art. 299/300) — Art. 95 Abs. 2 lit. e ZPO.',
  'Notwendige Auslagen der Partei (z. B. Reise-/Porto-/Kopierkosten) — Art. 95 Abs. 3 lit. a ZPO.',
  'Unentgeltliche Rechtspflege bei Mittellosigkeit und nicht aussichtsloser Sache: Befreiung von Vorschüssen und Gerichtskosten, unentgeltlicher Rechtsbeistand (Art. 117–118 ZPO) — mit Nachzahlungspflicht binnen 10 Jahren (Art. 123 ZPO); die Parteientschädigung an die Gegenpartei bleibt geschuldet.',
];

// ─── Instanz-Akkumulation (I7 — Gesamtkostenrisiko über den Instanzenzug) ───
// Eine Streitsache durchläuft oft mehrere Stufen (Schlichtung → erste Instanz →
// Rechtsmittel → Bundesgericht). Die Gerichtskosten fallen je Stufe an, die
// Parteientschädigung schuldet die unterliegende Partei je Stufe. Dieser
// Aggregator summiert die bezifferbaren Posten über die gewählten Stufen
// (Maximalbetrachtung: Unterliegen auf jeder Stufe) und weist nicht bezifferte
// Stufen (Schlichtungspauschale, aufwandbasierte Tarife) ehrlich aus (§8).

export interface InstanzenzugWahl {
  schlichtung: boolean;
  erstinstanz: boolean;
  rechtsmittel: boolean;
  bundesgericht: boolean;
}

export interface InstanzStufe {
  schluessel: keyof InstanzenzugWahl;
  label: string;
  ergebnis: ProzesskostenErgebnis;
  /** Gerichtskosten dieser Stufe (null = nicht beziffert, z. B. Schlichtungspauschale). */
  gk: Spanne | null;
  /** Parteientschädigung dieser Stufe (null = nicht beziffert / aufwandbasiert). */
  pe: Spanne | null;
}

export interface Instanzenzug {
  stufen: InstanzStufe[];
  gesamtGk: Spanne | null;
  gesamtPe: Spanne | null;
  /** Gerichtskosten + Parteientschädigung über alle gewählten Stufen summiert. */
  gesamt: Spanne | null;
  /** true = mindestens eine gewählte Stufe ist nicht beziffert (Summe = Untergrenze). */
  unbeziffert: boolean;
  hinweise: string[];
}

const addiere = (a: Spanne | null, b: Spanne | null): Spanne | null => {
  if (!a) return b;
  if (!b) return a;
  return { vonChf: a.vonChf + b.vonChf, bisChf: a.bisChf + b.bisChf };
};

const STUFEN_REIHENFOLGE: { schluessel: keyof InstanzenzugWahl; label: string; phase: Verfahrensphase; instanz: Instanz }[] = [
  { schluessel: 'schlichtung', label: 'Schlichtungsverfahren', phase: 'schlichtung', instanz: 'erstinstanz' },
  { schluessel: 'erstinstanz', label: 'Erste Instanz (kantonal)', phase: 'entscheid', instanz: 'erstinstanz' },
  { schluessel: 'rechtsmittel', label: 'Rechtsmittel (Berufung/Beschwerde)', phase: 'entscheid', instanz: 'rechtsmittel' },
  { schluessel: 'bundesgericht', label: 'Bundesgericht', phase: 'entscheid', instanz: 'bundesgericht' },
];

/** Gesamtkostenrisiko über die gewählten Stufen des Instanzenzugs (Auftrag David,
 *  I7). Jede Stufe wird über `berechneProzesskosten` gerechnet; bezifferte Posten
 *  werden summiert (kumulatives Unterliegens-Szenario), nicht bezifferte ehrlich
 *  ausgewiesen. `verfahren` gilt für die kantonalen Tatsacheninstanzen. */
export function berechneInstanzenzug(
  kanton: KantonCode, streitwertCHF: number, materie: Materie, verfahren: Verfahrensart, wahl: InstanzenzugWahl,
  nichtVermoegensrechtlich = false,
): Instanzenzug {
  pruefeStreitwert(streitwertCHF);
  const stufen: InstanzStufe[] = STUFEN_REIHENFOLGE
    .filter((s) => wahl[s.schluessel])
    .map((s) => {
      // Verfahrensart wirkt nur auf den kantonalen Tatsachen-/Rechtsmittelzweig.
      const vf: Verfahrensart = (s.instanz === 'bundesgericht' || s.phase === 'schlichtung') ? 'ordentlich' : verfahren;
      const ergebnis = berechneProzesskosten({ kanton, streitwertCHF, phase: s.phase, materie, instanz: s.instanz, verfahren: vf, nichtVermoegensrechtlich });
      return { schluessel: s.schluessel, label: s.label, ergebnis, gk: postenSpanne(ergebnis.gerichtskosten), pe: postenSpanne(ergebnis.parteientschaedigung) };
    });

  const gesamtGk = stufen.reduce<Spanne | null>((acc, s) => addiere(acc, s.gk), null);
  const gesamtPe = stufen.reduce<Spanne | null>((acc, s) => addiere(acc, s.pe), null);
  const gesamt = addiere(gesamtGk, gesamtPe);
  const unbeziffert = stufen.some((s) => s.gk === null || s.pe === null);

  const hinweise = [
    'Kumulative Maximalbetrachtung über den Instanzenzug: Gerichtskosten fallen je Stufe an, die Parteientschädigung schuldet die jeweils unterliegende Partei (Unterliegen auf jeder Stufe).',
    'Bei (teilweisem) Obsiegen verschiebt sich die Verteilung nach Art. 106 ff. ZPO; die effektive Belastung liegt dann tiefer.',
  ];
  if (unbeziffert) hinweise.push('Mindestens eine Stufe ist nicht beziffert (Schlichtungspauschale oder aufwandbasierter Tarif) — die Summe ist insoweit eine Untergrenze.');

  return { stufen, gesamtGk, gesamtPe, gesamt, unbeziffert, hinweise };
}

// ─── PDF-Rechenbericht (I8 — mandatstauglicher Output) ──────────────────────
// Bildet das berechnete Kostenbild (Gerichtskosten + Parteientschädigung +
// Vorschuss + optional MwSt/Kostenrisiko/Instanzenzug) auf das gemeinsame
// `Berechnungsergebnis` ab, das die zentrale PDF-Schicht (lib/pdf) rendert.
// Reine Abbildung bereits berechneter Werte (§3: Text/Norm stammen aus der
// Engine, kein neuer Inhalt; §5: ein Assemble-Ergebnis für die Anzeige).

const spanneAlsText = (s: Spanne | null): string =>
  !s ? '—' : s.vonChf === s.bisChf ? chfText(s.vonChf) : `${chfText(s.vonChf)} – ${chfText(s.bisChf)}`;
const chfText = (n: number): string => `CHF ${Math.round(n).toLocaleString('de-CH')}`;

export interface BerichtZusatz {
  vorschuss?: Kostenvorschuss;
  mwst?: MwstAufschlag | null;
  kostenrisiko?: Kostenrisiko | null;
  instanzenzug?: Instanzenzug | null;
  sicherheit?: Sicherheitsleistung | null;
}

/** Baut den Berechnungsergebnis-Bericht für den PDF-Export. `e` ist das
 *  Hauptergebnis (eine Instanz); die optionalen Zusatzposten werden, wenn
 *  übergeben, als eigene Rechenschritte ausgewiesen. */
export function prozesskostenBericht(e: ProzesskostenErgebnis, zusatz: BerichtZusatz = {}): Berechnungsergebnis {
  const norm = (artikel: string, bemerkung?: string, url?: string): Normverweis => ({ artikel, bemerkung, url });
  const postenSchritt = (titel: string, p: PostenErgebnis): Rechenschritt => {
    const detail = !p.kostenlos && !p.schlichtungspauschale && p.ergebnis?.deterministisch && p.ergebnis.schritte.length
      ? ` (${p.ergebnis.schritte.join('; ')})` : '';
    const zwischen = p.kostenlos ? `keine Kosten — ${p.kostenlosGrund ?? ''}`
      : p.schlichtungspauschale ? 'Schlichtungspauschale (separater kantonaler Tarif, hier nicht beziffert)'
      : `${postenText(p)}${detail}`;
    return {
      beschreibung: `${titel}: ${p.quelle.erlassName} (${p.quelle.erlassNr}), ${p.quelle.artikel}, Stand ${p.quelle.stand}${p.quelle.verifiziert === 'recherche' ? ' — nicht abgenommen' : ''}`,
      zwischenergebnis: zwischen,
      normen: [norm('Art. 95 ZPO'), norm(`${p.quelle.artikel} (${p.quelle.erlassNr})`, p.quelle.erlassName, p.quelle.quelleUrl)],
    };
  };

  const rechenweg: Rechenschritt[] = [
    postenSchritt('Gerichtskosten', e.gerichtskosten),
    postenSchritt('Parteientschädigung', e.parteientschaedigung),
  ];

  if (zusatz.vorschuss) {
    rechenweg.push({
      beschreibung: `Kostenvorschuss (${zusatz.vorschuss.norm})`,
      zwischenergebnis: `${zusatz.vorschuss.spanne ? spanneAlsText(zusatz.vorschuss.spanne) : '—'} — ${zusatz.vorschuss.hinweis}`,
      normen: [norm(zusatz.vorschuss.norm)],
    });
  }
  if (zusatz.mwst && zusatz.mwst.bruttoSpanne) {
    rechenweg.push({
      beschreibung: `Parteientschädigung inkl. MwSt ${zusatz.mwst.satzProzent.toLocaleString('de-CH')} %`,
      zwischenergebnis: `${spanneAlsText(zusatz.mwst.bruttoSpanne)} (MwSt-Anteil ${spanneAlsText(zusatz.mwst.betrag)})`,
      normen: [norm('Art. 95 ZPO', 'Abs. 3 lit. b i.V.m. MWSTG')],
    });
  }
  if (zusatz.kostenrisiko && zusatz.kostenrisiko.berechenbar) {
    const k = zusatz.kostenrisiko;
    rechenweg.push({
      beschreibung: `Kostenrisiko bei ${Math.round(k.obsiegensquote * 100)} % Obsiegen`,
      zwischenergebnis: `geschätzte Netto-Kostenbelastung ${spanneAlsText(k.nettoBelastung ?? null)}; Parteientschädigungs-Saldo ${spanneAlsText(k.parteientschaedigungSaldo ?? null)} (+ erhalten / − zu zahlen)`,
      normen: [norm('Art. 106 ZPO'), norm('Art. 111 ZPO')],
    });
  }
  if (zusatz.instanzenzug) {
    const z = zusatz.instanzenzug;
    rechenweg.push({
      beschreibung: `Gesamtkostenrisiko über den Instanzenzug (${z.stufen.map((s) => s.label).join(' → ')})`,
      zwischenergebnis: `Gerichtskosten ${spanneAlsText(z.gesamtGk)} + Parteientschädigung ${spanneAlsText(z.gesamtPe)} = ${spanneAlsText(z.gesamt)}${z.unbeziffert ? ' (Untergrenze — nicht bezifferte Stufen)' : ''}`,
      normen: [norm('Art. 106 ZPO')],
    });
  }
  if (zusatz.sicherheit) {
    const si = zusatz.sicherheit;
    rechenweg.push({
      beschreibung: 'Sicherheit für die Parteientschädigung (Kaution)',
      zwischenergebnis: si.moeglich ? `mutmasslich ${spanneAlsText(si.spanne)} (auf Antrag der beklagten Partei, Kautionsgründe Art. 99 Abs. 1 lit. a–d)` : (si.ausschluss ?? 'im aktuellen Verfahren ausgeschlossen'),
      normen: [norm('Art. 99 ZPO')],
    });
  }

  const warnungen = [...e.hinweise];
  if (zusatz.kostenrisiko) warnungen.push(...zusatz.kostenrisiko.hinweise);
  if (zusatz.instanzenzug) warnungen.push(...zusatz.instanzenzug.hinweise);
  warnungen.push(...WEITERE_KOSTENPOSTEN);

  const normverweise: Normverweis[] = [
    norm('Art. 95 ZPO', 'Begriffe der Prozesskosten'),
    norm('Art. 96 ZPO', 'kantonale Tarifkompetenz'),
    norm('Art. 98 ZPO', 'Kostenvorschuss'),
    norm(`${e.gerichtskosten.quelle.erlassName} (${e.gerichtskosten.quelle.erlassNr}), ${e.gerichtskosten.quelle.artikel}`, 'Gerichtskosten-Tarif', e.gerichtskosten.quelle.quelleUrl),
    norm(`${e.parteientschaedigung.quelle.erlassName} (${e.parteientschaedigung.quelle.erlassNr}), ${e.parteientschaedigung.quelle.artikel}`, 'Parteientschädigungs-Tarif', e.parteientschaedigung.quelle.quelleUrl),
  ];

  return {
    ergebnis: `Gerichtskosten ${postenText(e.gerichtskosten)} · Parteientschädigung ${postenText(e.parteientschaedigung)}`,
    status: 'ok',
    rechenweg,
    annahmen: [],
    warnungen,
    normverweise,
  };
}

// ─── Verfahrensausgang & Verteilungs-Sonderfälle (Art. 106–109 ZPO) ─────────
// Art. 106 I S. 2: Nichteintreten/Rückzug → Kläger gilt als unterliegend;
// Anerkennung → Beklagter unterliegt — deterministisch auf eine Obsiegensquote
// abbildbar. Billigkeit (Art. 107), unnötige Kosten (Art. 108) und der Vergleich
// (Art. 109) sind Ermessen → ehrlicher Hinweis statt Punktwert (§2/§8).
// Recherche: prozesskosten-sonderkonstellationen.md §2 (ZPO 1.1.2025).

export type Verfahrensausgang = 'quote' | 'anerkennung' | 'rueckzug' | 'vergleich' | 'billigkeit';

export const VERFAHRENSAUSGAENGE: { wert: Verfahrensausgang; label: string }[] = [
  { wert: 'quote', label: 'Obsiegen nach Quote (Art. 106 II)' },
  { wert: 'anerkennung', label: 'Klageanerkennung (Beklagter unterliegt)' },
  { wert: 'rueckzug', label: 'Klagerückzug / Nichteintreten (Kläger unterliegt)' },
  { wert: 'vergleich', label: 'Vergleich (Art. 109)' },
  { wert: 'billigkeit', label: 'Billigkeitsverteilung (Art. 107)' },
];

export interface AusgangResolved {
  /** Obsiegensquote 0..1 aus Sicht der klagenden Partei; null = Ermessen (nicht beziffert). */
  quote: number | null;
  norm: string;
  hinweis: string;
}

/** Bildet den Verfahrensausgang auf eine Obsiegensquote ab, soweit deterministisch
 *  (Art. 106 I). `quoteManuell` (0..1) gilt nur im Modus 'quote'. */
export function verfahrensausgang(a: Verfahrensausgang, quoteManuell: number): AusgangResolved {
  switch (a) {
    case 'anerkennung':
      return { quote: 1, norm: 'Art. 106 Abs. 1 ZPO', hinweis: 'Klageanerkennung: die beklagte Partei gilt als unterliegend (volles Obsiegen der klagenden Partei). Billigkeitskorrektur nach Art. 107 Abs. 1 lit. b vorbehalten.' };
    case 'rueckzug':
      return { quote: 0, norm: 'Art. 106 Abs. 1 ZPO', hinweis: 'Klagerückzug / Nichteintreten: die klagende Partei gilt als unterliegend. Billigkeitskorrektur nach Art. 107 Abs. 1 lit. e (Gegenstandslosigkeit) vorbehalten.' };
    case 'vergleich':
      return { quote: null, norm: 'Art. 109 ZPO', hinweis: 'Vergleich: Kostenverteilung nach Parteivereinbarung. Fehlt eine Regelung oder belastet sie eine unentgeltlich prozessführende Partei einseitig, gilt die gesetzliche Verteilung (Art. 106–108 ZPO).' };
    case 'billigkeit':
      return { quote: null, norm: 'Art. 107 ZPO', hinweis: 'Billigkeitsverteilung nach gerichtlichem Ermessen — kein berechenbarer Wert (Wettschlagung oder Auferlegung an die obsiegende Partei je nach Tatbestand Art. 107 Abs. 1 lit. a–f).' };
    case 'quote':
    default:
      return { quote: Math.min(1, Math.max(0, quoteManuell)), norm: 'Art. 106 Abs. 2 ZPO', hinweis: 'Quotale Verteilung der Prozesskosten nach Ausgang (Obsiegensquote).' };
  }
}

/** Verteilungs-Sonderfälle (Art. 106 III / 107 / 108 / 109 ZPO) als ehrliche
 *  Aufklärung — Ermessens-Tatbestände, daher Hinweis statt Berechnung (§8). */
export const KOSTENVERTEILUNG_SONDERFAELLE: readonly string[] = [
  'Mehrere Parteien/Streitgenossen: interne Aufteilung nach Beteiligung (Art. 106 Abs. 3 Satz 1 ZPO); solidarische Haftung nur bei notwendiger Streitgenossenschaft (Art. 106 Abs. 3 Satz 2 ZPO, Fassung seit 1.1.2025).',
  'Billigkeit (Art. 107 Abs. 1 ZPO): Abweichung vom Unterliegerprinzip u. a. bei nur grundsätzlich, nicht in der Höhe gutgeheissener Klage (lit. a), gutgläubiger Veranlassung (lit. b), familienrechtlichen Verfahren / eingetragener Partnerschaft (lit. c/d), gegenstandslos abgeschriebenem Verfahren (lit. e) oder anderen besonderen Umständen (lit. f).',
  'Unnötige Prozesskosten trägt, wer sie verursacht hat — auch eine obsiegende Partei oder ein Dritter (Art. 108 ZPO).',
  'Bei einem Vergleich gilt die vereinbarte Kostenregelung; fehlt sie, wird nach Art. 106–108 ZPO verteilt (Art. 109 ZPO).',
];

/** Interkantonaler Vergleich: dieselbe Konstellation über ALLE 26 Kantone
 *  (Auftrag David — Vergleichstabelle «was kostet es anderswo»). */
export function vergleichAlleKantone(
  streitwertCHF: number, phase: Verfahrensphase, materie: Materie,
  instanz?: Instanz, verfahren?: Verfahrensart, nichtVermoegensrechtlich?: boolean,
): ProzesskostenErgebnis[] {
  return KANTONE.map((kanton) => berechneProzesskosten({ kanton, streitwertCHF, phase, materie, instanz, verfahren, nichtVermoegensrechtlich }));
}

/** Anzeige-Hilfe: ein PostenErgebnis als kurzer Text (Betrag, Spanne oder
 *  «kostenlos»/«nach Aufwand»). Reine Darstellung. */
export function postenText(p: PostenErgebnis): string {
  if (p.kostenlos) return 'keine Kosten';
  if (p.schlichtungspauschale) return 'Schlichtungspauschale (separater Tarif)';
  const e = p.ergebnis;
  if (!e) return '—';
  if (e.deterministisch) return `CHF ${Math.round(e.betragChf).toLocaleString('de-CH')}`;
  const f = (n: number | undefined) => n == null ? null : `CHF ${Math.round(n).toLocaleString('de-CH')}`;
  const von = f(e.vonChf); const bis = f(e.bisChf);
  if (von && bis) return `${von} – ${bis}`;
  if (bis) return `bis ${bis}`;
  if (von) return `ab ${von}`;
  return 'nach Aufwand';
}
