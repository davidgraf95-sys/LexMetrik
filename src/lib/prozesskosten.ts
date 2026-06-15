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

import { auswertenTarif, skaliereErgebnis, type TarifErgebnis } from './tarif/staffel';
import { MODIFIKATOREN, type Faktor } from '../data/tarif/modifikatoren';
import { GERICHTSKOSTEN } from '../data/tarif/gerichtskosten';
import { PARTEIENTSCHAEDIGUNG } from '../data/tarif/parteientschaedigung';
import { KANTONE, MWST_NORMALSATZ_PROZENT, type KantonCode, type KantonalerTarif } from '../data/tarif/typen';
import {
  BGER_GERICHTSKOSTEN, BGER_GERICHTSKOSTEN_REDUZIERT, BGER_PARTEIENTSCHAEDIGUNG, type BgerTarif,
} from '../data/tarif/bundesgericht';

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
 *  'bundesgericht' = Beschwerde ans BGer (bundesrechtlicher Tarif, Art. 65/68 BGG). */
export type Instanz = 'erstinstanz' | 'rechtsmittel' | 'bundesgericht';

/** Verfahrensart als Kosten-Modifikator (nur erste/Rechtsmittelinstanz, nicht BGer). */
export type Verfahrensart = 'ordentlich' | 'vereinfacht' | 'summarisch';

export const INSTANZEN: { wert: Instanz; label: string }[] = [
  { wert: 'erstinstanz', label: 'Erste Instanz (kantonal)' },
  { wert: 'rechtsmittel', label: 'Rechtsmittel (Berufung/Beschwerde)' },
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
  quelleUrl: t.quelleUrl, stand: t.stand, verifiziert: t.verifiziert, hinweis: t.hinweis,
});

const bgerQuelle = (t: BgerTarif): TarifQuelle => ({
  erlassName: t.erlassName, erlassNr: t.erlassNr, artikel: t.artikel,
  quelleUrl: t.quelleUrl, stand: t.stand, verifiziert: 'doppelt', hinweis: t.hinweis,
});

interface KostenlosBefund { kostenlos: boolean; norm?: string; grund?: string; }

/** Gerichtskosten-Kostenlosigkeit nach Art. 113 Abs. 2 (Schlichtung) bzw.
 *  Art. 114 ZPO (Entscheidverfahren). WICHTIG: Miete/Pacht ist NUR in der
 *  Schlichtung kostenfrei (Art. 113 II lit. c), NICHT im Entscheidverfahren. */
function gerichtskostenKostenlos(phase: Verfahrensphase, materie: Materie, streitwertCHF: number): KostenlosBefund {
  const arbeitFrei = streitwertCHF <= 30000;
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
    const reduziert = e.materie === 'gleichstellung' || e.materie === 'behindertengleichstellung'
      || (e.materie === 'arbeit' && e.streitwertCHF <= 30000);
    const gkB = reduziert ? BGER_GERICHTSKOSTEN_REDUZIERT : BGER_GERICHTSKOSTEN;
    return {
      kanton: e.kanton, streitwertCHF: e.streitwertCHF, phase: 'entscheid', materie: e.materie,
      gerichtskosten: { kostenlos: false, ergebnis: auswertenTarif(gkB.regel, e.streitwertCHF), quelle: bgerQuelle(gkB) },
      parteientschaedigung: { kostenlos: false, ergebnis: auswertenTarif(BGER_PARTEIENTSCHAEDIGUNG.regel, e.streitwertCHF), quelle: bgerQuelle(BGER_PARTEIENTSCHAEDIGUNG) },
      hinweise: [
        'Beschwerde ans Bundesgericht (Art. 65/68 BGG); Tarife bundesrechtlich, kantonsunabhängig.',
        reduziert ? 'Reduzierter Ansatz nach Art. 65 Abs. 4 BGG (streitwertunabhängig).' : 'Gerichtsgebühr nach Streitwert (Art. 65 Abs. 3 lit. b BGG); Überschreitung bis zum Doppelten möglich (Abs. 5).',
        'Kostenvorschuss in Höhe der mutmasslichen Gerichtskosten (Art. 62 BGG); unentgeltliche Rechtspflege Art. 64 BGG.',
      ],
    };
  }

  const gkTarif = GERICHTSKOSTEN[e.kanton];
  const peTarif = PARTEIENTSCHAEDIGUNG[e.kanton];

  // Gerichtskosten (Art. 95 II): im Entscheidverfahren die Entscheidgebühr
  // (lit. b) nach kantonalem Tarif; im Schlichtungsverfahren gilt die
  // Schlichtungspauschale (lit. a) — ein eigener, meist reduzierter Tarif, der
  // (noch) nicht erhoben ist und daher NICHT mit der Entscheidgebühr beziffert
  // wird (§1/§8; Bug-Check 14.6.2026). Vorbehältlich Kostenlosigkeit (113/114).
  const gkFrei = gerichtskostenKostenlos(e.phase, e.materie, e.streitwertCHF);
  let gerichtskosten: PostenErgebnis = gkFrei.kostenlos
    ? { kostenlos: true, kostenlosGrund: `${gkFrei.norm}: ${gkFrei.grund}`, quelle: quelle(gkTarif) }
    : e.phase === 'schlichtung'
      ? { kostenlos: false, schlichtungspauschale: true, quelle: quelle(gkTarif) }
      : { kostenlos: false, ergebnis: auswertenTarif(gkTarif.regel, e.streitwertCHF), quelle: quelle(gkTarif) };

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
    hinweise.push('Im Schlichtungsverfahren gilt für die Gerichtskosten die Schlichtungspauschale (Art. 95 II lit. a ZPO) — ein eigener, meist reduzierter kantonaler Tarif (oft ein Bruchteil der Entscheidgebühr); hier nicht beziffert. Der angezeigte kantonale Tarif betrifft die Entscheidgebühr im Gerichtsverfahren.');
  }

  // Verfahrensart-/Instanz-Modifikator (Entscheidphase, kantonale Instanz):
  // Faktor-Spanne auf den Basistarif (Rechtsmittel hat Vorrang vor Verfahrensart).
  if (e.phase === 'entscheid') {
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
 *  gegebener Obsiegensquote (0..1). gk/pe stammen aus berechneProzesskosten. */
export function berechneKostenrisiko(gk: PostenErgebnis, pe: PostenErgebnis, obsiegensquote: number): Kostenrisiko {
  const q = Math.min(1, Math.max(0, obsiegensquote));
  const gkS = postenSpanne(gk);
  const peS = postenSpanne(pe);
  const hinweise = [
    'Verteilung nach Ausgang des Verfahrens (Art. 106 ZPO); die unterliegende Partei zahlt die zugesprochene Parteientschädigung (Art. 111 Abs. 2 ZPO).',
    'Schätzung: das Gericht kann nach Ermessen abweichen (Art. 107 ZPO, u. a. familienrechtliche Verfahren) und unnötige Kosten gesondert auferlegen (Art. 108 ZPO).',
    'Deckungslücke: die zugesprochene Parteientschädigung (Tarif) kann unter dem effektiv vereinbarten Anwaltshonorar liegen.',
  ];
  if (!gkS || !peS) {
    return { obsiegensquote: q, berechenbar: false, hinweise: [...hinweise, 'Für diese Konstellation (z. B. Schlichtungspauschale oder aufwandbasierter Anwaltstarif) ist das Kostenrisiko nicht beziffert.'] };
  }
  return {
    obsiegensquote: q,
    berechenbar: true,
    gerichtskostenZuLasten: skaliere(gkS, 1 - q),
    parteientschaedigungSaldo: skaliere(peS, 2 * q - 1),
    eigeneAnwaltskostenRichtwert: peS,
    nettoBelastung: { vonChf: Math.round((1 - q) * (gkS.vonChf + 2 * peS.vonChf)), bisChf: Math.round((1 - q) * (gkS.bisChf + 2 * peS.bisChf)) },
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

/** Interkantonaler Vergleich: dieselbe Konstellation über ALLE 26 Kantone
 *  (Auftrag David — Vergleichstabelle «was kostet es anderswo»). */
export function vergleichAlleKantone(
  streitwertCHF: number, phase: Verfahrensphase, materie: Materie,
  instanz?: Instanz, verfahren?: Verfahrensart,
): ProzesskostenErgebnis[] {
  return KANTONE.map((kanton) => berechneProzesskosten({ kanton, streitwertCHF, phase, materie, instanz, verfahren }));
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
