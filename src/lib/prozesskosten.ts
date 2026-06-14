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

import { auswertenTarif, type TarifErgebnis } from './tarif/staffel';
import { GERICHTSKOSTEN } from '../data/tarif/gerichtskosten';
import { PARTEIENTSCHAEDIGUNG } from '../data/tarif/parteientschaedigung';
import { KANTONE, type KantonCode, type KantonalerTarif } from '../data/tarif/typen';

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

export interface ProzesskostenEingabe {
  kanton: KantonCode;
  streitwertCHF: number;
  phase: Verfahrensphase;
  materie: Materie;
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
  const gkTarif = GERICHTSKOSTEN[e.kanton];
  const peTarif = PARTEIENTSCHAEDIGUNG[e.kanton];

  // Gerichtskosten (Art. 95 II): im Entscheidverfahren die Entscheidgebühr
  // (lit. b) nach kantonalem Tarif; im Schlichtungsverfahren gilt die
  // Schlichtungspauschale (lit. a) — ein eigener, meist reduzierter Tarif, der
  // (noch) nicht erhoben ist und daher NICHT mit der Entscheidgebühr beziffert
  // wird (§1/§8; Bug-Check 14.6.2026). Vorbehältlich Kostenlosigkeit (113/114).
  const gkFrei = gerichtskostenKostenlos(e.phase, e.materie, e.streitwertCHF);
  const gerichtskosten: PostenErgebnis = gkFrei.kostenlos
    ? { kostenlos: true, kostenlosGrund: `${gkFrei.norm}: ${gkFrei.grund}`, quelle: quelle(gkTarif) }
    : e.phase === 'schlichtung'
      ? { kostenlos: false, schlichtungspauschale: true, quelle: quelle(gkTarif) }
      : { kostenlos: false, ergebnis: auswertenTarif(gkTarif.regel, e.streitwertCHF), quelle: quelle(gkTarif) };

  // Parteientschädigung (Art. 95 III): im Schlichtungsverfahren wird KEINE
  // gesprochen (Art. 113 Abs. 1 ZPO); im Entscheidverfahren nach kant. Tarif.
  const parteientschaedigung: PostenErgebnis = e.phase === 'schlichtung'
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

  return { kanton: e.kanton, streitwertCHF: e.streitwertCHF, phase: e.phase, materie: e.materie, gerichtskosten, parteientschaedigung, hinweise };
}

/** Interkantonaler Vergleich: dieselbe Konstellation über ALLE 26 Kantone
 *  (Auftrag David — Vergleichstabelle «was kostet es anderswo»). */
export function vergleichAlleKantone(streitwertCHF: number, phase: Verfahrensphase, materie: Materie): ProzesskostenErgebnis[] {
  return KANTONE.map((kanton) => berechneProzesskosten({ kanton, streitwertCHF, phase, materie }));
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
