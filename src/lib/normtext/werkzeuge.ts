// ─── Norm ↔ Werkzeug-Brücke (D1, Differenzierung) ───────────────────────────
//
// Aus einem Gesetz direkt zum passenden LexMetrik-Rechner/zur Vorlage — die
// Verknüpfung, die kein reiner Rechtstext-Anbieter (Fedlex/lexfind) hat, weil
// keiner Rechner UND Normtext führt.
//
// Deklarierte Zuordnung Erlass-Key (Bund) → Katalog-Karten-IDs. Die Karte liefert
// Titel + href ZUR LAUFZEIT (Single Source = startseiteConfig, §5); nicht
// verfügbare (geplante) Karten werden ausgeblendet → nie ein toter Link (§8).

import { ALLE_KARTEN, istVerfuegbar } from '../startseiteConfig';
import { ERLASS_REGISTER } from './register';
import { bundSnapshotRef } from './bundRef';
import { MATERIAL_REGISTER, behoerdeVon, DOKTYP_LABEL } from '../materialien/register';
import type { Herkunft } from '../verzahnung/typen';

// Exportiert für das Konsistenz-Tor (werkzeuge.test.ts): jede Karten-ID muss auf
// eine existierende Katalog-Karte zeigen — sonst verschluckt `werkzeugeFuerNorm`
// einen Tippfehler still (§8: kein toter Link, aber auch kein heimlich fehlendes
// Werkzeug).
export const ERLASS_WERKZEUGE: Readonly<Record<string, string[]>> = {
  OR: ['kuendigung-sperrfristen', 'lohnfortzahlung', 'ferienanspruch', 'dreizehnter-monatslohn', 'ueberstunden-zuschlag', 'verjaehrung', 'verzugszins', 'schadenszins', 'gewaehrleistung', 'mietrecht', 'mietzinsanpassung', 'arbeitsvertrag', 'mietvertrag-wohnen', 'auftrag', 'werkvertrag', 'mahnung'],
  ZGB: ['erbrecht-fristen', 'erbteilung', 'erb-ausgleichung', 'gueterrecht-vorschlag', 'vorsorgeausgleich', 'eigenhaendiges-testament', 'oeffentliches-testament', 'vorsorgeauftrag', 'patientenverfuegung'],
  ZPO: ['prozesskosten', 'zustaendigkeit', 'zpo-fristen', 'streitwert', 'kostenvorschuss', 'parteientschaedigung-sicherheit', 'schlichtungsgesuch', 'klage-vereinfacht', 'klage-ordentlich'],
  SCHKG: ['schkg-fristen', 'betreibungskosten', 'schkg-zustaendigkeit', 'rechtsoeffnungsbegehren', 'rechtsvorschlag', 'nichtbekanntgabe-betreibung'],
  GEBV_SCHKG: ['betreibungskosten'],
  STGB: ['straf-verjaehrung', 'straf-zustaendigkeit', 'strafanzeige', 'strafantrag-vorlage'],
  STPO: ['straf-zustaendigkeit', 'einsprache'],
  BGG: ['bgg-fristen', 'bundesgerichtsgebuehren', 'rechtsmittelpruefung'],
  VVG: ['klage-vvg-leistungen'],
  HREGV: ['gmbh-gruendung', 'ag-gruendung', 'statuten', 'gv-vr-beschluss'],
  ARG: ['ferienanspruch', 'ueberstunden-zuschlag', 'dreizehnter-monatslohn', 'lohnfortzahlung'],
  VMWG: ['mietrecht', 'mietzinsanpassung'],
  // Stubs mit passenden Werkzeugen:
  DBG: ['steuer-verjaehrung'],
  STG: ['steuer-verjaehrung'],
  AHVG: ['ahv-beitraege'],
  AIG: ['auslaenderrecht-fristen'],
  DSG: ['datenschutz-fristen'],
};

export interface Werkzeug { id: string; titel: string; href: string; modus: 'rechner' | 'vorlage' }

/**
 * Karten-IDs → verfügbare Werkzeuge (Rechner/Vorlagen), in Eingabereihenfolge,
 * dedupliziert. Die Karte liefert Titel + href ZUR LAUFZEIT (Single Source =
 * startseiteConfig, §5); nicht verfügbare (geplante) oder href-lose Karten werden
 * ausgeblendet (§8: kein toter Link). Geteilter Auflöser für die Erlass- UND die
 * artikelscharfe Brücke — genau eine Auflöse-Regel.
 */
function aufloeseWerkzeuge(ids: readonly string[]): Werkzeug[] {
  const seen = new Set<string>();
  const out: Werkzeug[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const k = ALLE_KARTEN.find((c) => c.id === id);
    if (k && istVerfuegbar(k) && k.href) { seen.add(id); out.push({ id, titel: k.title, href: k.href, modus: k.modus }); }
  }
  return out;
}

/**
 * Norm↔Werkzeug-Index (ROADMAP Schritt 2): verfügbare Werkzeuge (Rechner/
 * Vorlagen) zu einem Erlass-Key, in deklarierter Reihenfolge. Erlass-granular
 * und ehrlich — nicht verfügbare/geplante Karten werden ausgeblendet (§8).
 */
export function werkzeugeFuerNorm(key: string): Werkzeug[] {
  const ids = ERLASS_WERKZEUGE[key];
  return ids ? aufloeseWerkzeuge(ids) : [];
}

// ─── Artikel-scharfe Norm↔Werkzeug-Map (V1, W2·10-UI-NAV) ───────────────────
//
// EINE artikel-scharfe Datenstruktur für BEIDE Richtungen (§5): am Artikel den
// passenden Rechner zeigen (Art. 127 OR → Verjährung) UND am Entscheid das
// Erlass-Rauschen wegfiltern (BGE 152 I 65 zitiert Art. 448 ZGB = Erwachsenen-
// schutz, NICHT Erbrecht → kein Erbrechts-Rechner). Jede Kante trägt einen
// fachlichen Norm-Beleg (§7); nur EINDEUTIGE Zuordnungen sind erfasst — Zweifels-
// fälle werden NICHT geraten, sondern ausgelassen und im Block §Zweifelsfälle
// unten offen ausgewiesen (§8). Der `erlass`-Key ist der Register-/Snapshot-Key
// (= `bundSnapshotRef().quelle`); `von`/`bis` sind die Haupt-Artikelnummern
// (inklusiv) — Sub-Artikel wie 335a/335c fallen unter 335, weil der Anker-Token
// «335_c» auf die Hauptnummer 335 normalisiert wird.
export interface ArtikelWerkzeugKante {
  /** Register-/Snapshot-Key des Erlasses (z. B. 'OR', 'ZGB'). */
  erlass: string;
  /** Haupt-Artikelnummer von/bis, inklusiv (Sub-Artikel 335a ⊂ 335). */
  von: number;
  bis: number;
  /** Katalog-Karten-IDs (SSoT §5), Reihenfolge = Anzeige. */
  werkzeuge: string[];
  /** Fachlicher Beleg der Kante — welche Norm die Zuordnung trägt (§7). */
  beleg: string;
}

export const ARTIKEL_WERKZEUGE: readonly ArtikelWerkzeugKante[] = [
  // ── OR — Obligationenrecht ────────────────────────────────────────────────
  { erlass: 'OR', von: 60, bis: 60, werkzeuge: ['verjaehrung'],
    beleg: 'Art. 60 OR — Verjährung des Anspruchs aus unerlaubter Handlung (relativ 3 J. / absolut). Verjährungsrechner.' },
  { erlass: 'OR', von: 67, bis: 67, werkzeuge: ['verjaehrung'],
    beleg: 'Art. 67 OR — Verjährung des Bereicherungsanspruchs (3 J. / 10 J.). Verjährungsrechner.' },
  { erlass: 'OR', von: 102, bis: 102, werkzeuge: ['mahnung', 'verzugszins'],
    beleg: 'Art. 102 OR — Schuldnerverzug durch Mahnung. Mahnungs-Vorlage; Verzugsfolge = Verzugszins.' },
  { erlass: 'OR', von: 104, bis: 105, werkzeuge: ['verzugszins'],
    beleg: 'Art. 104 OR — Verzugszins 5 %; Art. 105 OR — Verzugszins auf Zinsen/Renten. Verzugszinsrechner.' },
  { erlass: 'OR', von: 127, bis: 142, werkzeuge: ['verjaehrung'],
    beleg: 'Art. 127–142 OR — allgemeine Verjährung: 10 J. (Art. 127), 5 J. (Art. 128), Beginn (Art. 130), Stillstand (Art. 134), Unterbrechung (Art. 135). Verjährungsrechner.' },
  { erlass: 'OR', von: 197, bis: 210, werkzeuge: ['gewaehrleistung'],
    beleg: 'Art. 197–210 OR — Sachgewährleistung im Kaufrecht: Mängelrüge (Art. 201), Verjährung der Gewährleistung (Art. 210).' },
  { erlass: 'OR', von: 253, bis: 253, werkzeuge: ['mietvertrag-wohnen'],
    beleg: 'Art. 253 OR — Begriff des Mietvertrags. Wohnungsmietvertrag-Vorlage.' },
  { erlass: 'OR', von: 266, bis: 273, werkzeuge: ['mietrecht'],
    beleg: 'Art. 266–273c OR — Kündigung, Kündigungsschutz (Art. 271 f.) und Erstreckung (Art. 272 ff.) im Mietverhältnis.' },
  { erlass: 'OR', von: 269, bis: 270, werkzeuge: ['mietzinsanpassung'],
    beleg: 'Art. 269–270e OR — missbräuchliche Mietzinse, Anpassung an den Referenzzinssatz.' },
  { erlass: 'OR', von: 319, bis: 319, werkzeuge: ['arbeitsvertrag'],
    beleg: 'Art. 319 OR — Begriff des Einzelarbeitsvertrags. Arbeitsvertrags-Vorlage.' },
  { erlass: 'OR', von: 321, bis: 321, werkzeuge: ['ueberstunden-zuschlag'],
    beleg: 'Art. 321c OR — Überstundenarbeit und Zuschlag (25 %, dispositiv).' },
  { erlass: 'OR', von: 324, bis: 324, werkzeuge: ['lohnfortzahlung'],
    beleg: 'Art. 324a/324b OR — Lohnfortzahlung bei unverschuldeter Verhinderung des Arbeitnehmers.' },
  { erlass: 'OR', von: 329, bis: 329, werkzeuge: ['ferienanspruch'],
    beleg: 'Art. 329a–329d OR — Ferienanspruch und Ferienlohn.' },
  { erlass: 'OR', von: 335, bis: 336, werkzeuge: ['kuendigung-sperrfristen'],
    beleg: 'Art. 335–336c OR — Kündigungsfristen (Art. 335c) und Sperrfristen (Art. 336c) im Arbeitsverhältnis.' },
  { erlass: 'OR', von: 363, bis: 363, werkzeuge: ['werkvertrag'],
    beleg: 'Art. 363 OR — Begriff des Werkvertrags. Werkvertrags-Vorlage.' },
  { erlass: 'OR', von: 394, bis: 394, werkzeuge: ['auftrag'],
    beleg: 'Art. 394 OR — Begriff des einfachen Auftrags. Auftrags-Vorlage.' },
  { erlass: 'OR', von: 620, bis: 635, werkzeuge: ['ag-gruendung', 'statuten'],
    beleg: 'Art. 620–635a OR — Gründung der Aktiengesellschaft (Errichtung, Statuten, qualifizierte Gründung).' },
  { erlass: 'OR', von: 698, bis: 705, werkzeuge: ['gv-vr-beschluss'],
    beleg: 'Art. 698–705 OR — Generalversammlung der AG: Befugnisse, Beschlüsse, Protokoll.' },
  { erlass: 'OR', von: 772, bis: 779, werkzeuge: ['gmbh-gruendung', 'statuten'],
    beleg: 'Art. 772–779 OR — Gründung der GmbH (Stammkapital, Statuten, Errichtung).' },
  // ── ZGB — Zivilgesetzbuch ─────────────────────────────────────────────────
  { erlass: 'ZGB', von: 122, bis: 124, werkzeuge: ['vorsorgeausgleich'],
    beleg: 'Art. 122–124e ZGB — Ausgleich der beruflichen Vorsorge (BVG) bei Scheidung.' },
  { erlass: 'ZGB', von: 207, bis: 215, werkzeuge: ['gueterrecht-vorschlag'],
    beleg: 'Art. 207–215 ZGB — güterrechtliche Auseinandersetzung, Vorschlagsberechnung (Errungenschaftsbeteiligung).' },
  { erlass: 'ZGB', von: 360, bis: 369, werkzeuge: ['vorsorgeauftrag'],
    beleg: 'Art. 360–369 ZGB — Vorsorgeauftrag (Errichtung, Form, Wirksamkeit).' },
  { erlass: 'ZGB', von: 370, bis: 373, werkzeuge: ['patientenverfuegung'],
    beleg: 'Art. 370–373 ZGB — Patientenverfügung.' },
  { erlass: 'ZGB', von: 470, bis: 473, werkzeuge: ['erbteilung'],
    beleg: 'Art. 470–473 ZGB — verfügbare Quote und Pflichtteile (Fassung ab 1.1.2023).' },
  { erlass: 'ZGB', von: 499, bis: 503, werkzeuge: ['oeffentliches-testament'],
    beleg: 'Art. 499–503 ZGB — öffentliche letztwillige Verfügung (Beurkundung mit zwei Zeugen).' },
  { erlass: 'ZGB', von: 505, bis: 505, werkzeuge: ['eigenhaendiges-testament'],
    beleg: 'Art. 505 ZGB — eigenhändige letztwillige Verfügung (vollständig handschriftlich).' },
  { erlass: 'ZGB', von: 522, bis: 533, werkzeuge: ['erbteilung', 'erbrecht-fristen'],
    beleg: 'Art. 522–533 ZGB — Herabsetzung bei Pflichtteilsverletzung; Herabsetzungsklage-Frist (Art. 533: 1 Jahr).' },
  { erlass: 'ZGB', von: 567, bis: 571, werkzeuge: ['erbrecht-fristen'],
    beleg: 'Art. 567–571 ZGB — Ausschlagung der Erbschaft (Frist 3 Monate, Art. 567).' },
  { erlass: 'ZGB', von: 598, bis: 601, werkzeuge: ['erbrecht-fristen'],
    beleg: 'Art. 598–601 ZGB — Erbschaftsklage (Frist Art. 600: 1 J. relativ / 10 bzw. 30 J. absolut).' },
  { erlass: 'ZGB', von: 626, bis: 632, werkzeuge: ['erb-ausgleichung'],
    beleg: 'Art. 626–632 ZGB — erbrechtliche Ausgleichung von Zuwendungen.' },
  // ── ZPO — Zivilprozessordnung ─────────────────────────────────────────────
  { erlass: 'ZPO', von: 9, bis: 46, werkzeuge: ['zustaendigkeit'],
    beleg: 'Art. 9–46 ZPO — örtliche Zuständigkeit (Gerichtsstände) im Zivilprozess.' },
  { erlass: 'ZPO', von: 91, bis: 94, werkzeuge: ['streitwert'],
    beleg: 'Art. 91–94 ZPO — Berechnung des Streitwerts.' },
  { erlass: 'ZPO', von: 95, bis: 96, werkzeuge: ['prozesskosten'],
    beleg: 'Art. 95–96 ZPO — Prozesskosten (Gerichtskosten, Parteientschädigung, Tarife).' },
  { erlass: 'ZPO', von: 98, bis: 98, werkzeuge: ['kostenvorschuss'],
    beleg: 'Art. 98 ZPO — Kostenvorschuss für die Gerichtskosten.' },
  { erlass: 'ZPO', von: 99, bis: 99, werkzeuge: ['parteientschaedigung-sicherheit'],
    beleg: 'Art. 99 ZPO — Sicherheit für die Parteientschädigung.' },
  { erlass: 'ZPO', von: 104, bis: 111, werkzeuge: ['prozesskosten'],
    beleg: 'Art. 104–111 ZPO — Verteilung und Liquidation der Prozesskosten.' },
  { erlass: 'ZPO', von: 142, bis: 149, werkzeuge: ['zpo-fristen'],
    beleg: 'Art. 142–149 ZPO — Fristenberechnung, Stillstand, Säumnis, Wiederherstellung.' },
  { erlass: 'ZPO', von: 202, bis: 202, werkzeuge: ['schlichtungsgesuch'],
    beleg: 'Art. 202 ZPO — Einleitung des Schlichtungsverfahrens (Schlichtungsgesuch).' },
  { erlass: 'ZPO', von: 220, bis: 220, werkzeuge: ['klage-ordentlich'],
    beleg: 'Art. 220 ZPO — Einleitung des ordentlichen Verfahrens durch Klage.' },
  { erlass: 'ZPO', von: 243, bis: 247, werkzeuge: ['klage-vereinfacht'],
    beleg: 'Art. 243–247 ZPO — vereinfachtes Verfahren.' },
  { erlass: 'ZPO', von: 311, bis: 321, werkzeuge: ['zpo-fristen'],
    beleg: 'Art. 311/314/321 ZPO — Berufungs- (30/10 Tage) und Beschwerdefristen.' },
  // ── SchKG — Schuldbetreibung und Konkurs ──────────────────────────────────
  { erlass: 'SCHKG', von: 8, bis: 8, werkzeuge: ['nichtbekanntgabe-betreibung'],
    beleg: 'Art. 8a SchKG — Einsichtsrecht und Nichtbekanntgabe der Betreibung gegenüber Dritten (Art. 8a Abs. 3).' },
  { erlass: 'SCHKG', von: 31, bis: 33, werkzeuge: ['schkg-fristen'],
    beleg: 'Art. 31–33 SchKG — Fristen im Betreibungsverfahren (Berechnung, Einhaltung, Erstreckung).' },
  { erlass: 'SCHKG', von: 46, bis: 55, werkzeuge: ['schkg-zustaendigkeit'],
    beleg: 'Art. 46–55 SchKG — Betreibungsort (ordentlich und besonders).' },
  { erlass: 'SCHKG', von: 68, bis: 68, werkzeuge: ['betreibungskosten'],
    beleg: 'Art. 68 SchKG — Kostentragung der Betreibung (Tarif: GebV SchKG).' },
  { erlass: 'SCHKG', von: 74, bis: 75, werkzeuge: ['rechtsvorschlag', 'schkg-fristen'],
    beleg: 'Art. 74–75 SchKG — Rechtsvorschlag (Frist 10 Tage ab Zustellung des Zahlungsbefehls).' },
  { erlass: 'SCHKG', von: 80, bis: 84, werkzeuge: ['rechtsoeffnungsbegehren'],
    beleg: 'Art. 80–84 SchKG — provisorische und definitive Rechtsöffnung.' },
  // ── StGB — Strafgesetzbuch ────────────────────────────────────────────────
  { erlass: 'STGB', von: 3, bis: 8, werkzeuge: ['straf-zustaendigkeit'],
    beleg: 'Art. 3–8 StGB — räumlicher Geltungsbereich (Begehungsort, Territorialität).' },
  { erlass: 'STGB', von: 30, bis: 33, werkzeuge: ['strafantrag-vorlage'],
    beleg: 'Art. 30–33 StGB — Strafantrag bei Antragsdelikten (Frist 3 Monate, Art. 31).' },
  { erlass: 'STGB', von: 97, bis: 101, werkzeuge: ['straf-verjaehrung'],
    beleg: 'Art. 97–101 StGB — Verfolgungs- und Vollstreckungsverjährung.' },
  // ── StPO — Strafprozessordnung ────────────────────────────────────────────
  { erlass: 'STPO', von: 31, bis: 42, werkzeuge: ['straf-zustaendigkeit'],
    beleg: 'Art. 31–42 StPO — Gerichtsstand im Strafverfahren.' },
  { erlass: 'STPO', von: 301, bis: 301, werkzeuge: ['strafanzeige'],
    beleg: 'Art. 301 StPO — Anzeigerecht (Strafanzeige).' },
  { erlass: 'STPO', von: 354, bis: 354, werkzeuge: ['einsprache'],
    beleg: 'Art. 354 StPO — Einsprache gegen den Strafbefehl (Frist 10 Tage).' },
  // ── BGG — Bundesgerichtsgesetz ────────────────────────────────────────────
  { erlass: 'BGG', von: 44, bis: 48, werkzeuge: ['bgg-fristen'],
    beleg: 'Art. 44–48 BGG — Fristenberechnung, Stillstand, Einhaltung vor Bundesgericht.' },
  { erlass: 'BGG', von: 65, bis: 65, werkzeuge: ['bundesgerichtsgebuehren'],
    beleg: 'Art. 65 BGG — Gerichtsgebühren des Bundesgerichts.' },
  { erlass: 'BGG', von: 72, bis: 89, werkzeuge: ['rechtsmittelpruefung'],
    beleg: 'Art. 72–89 BGG — Beschwerdearten und Zulässigkeit (Beschwerde in Zivil-/Straf-/öffentlich-rechtlichen Sachen).' },
  { erlass: 'BGG', von: 100, bis: 100, werkzeuge: ['bgg-fristen'],
    beleg: 'Art. 100 BGG — Beschwerdefrist (30 Tage).' },
  // ── DBG — Direkte Bundessteuer ────────────────────────────────────────────
  { erlass: 'DBG', von: 120, bis: 121, werkzeuge: ['steuer-verjaehrung'],
    beleg: 'Art. 120–121 DBG — Veranlagungs- und Bezugsverjährung.' },
  // ── AHVG — Alters- und Hinterlassenenversicherung ─────────────────────────
  { erlass: 'AHVG', von: 4, bis: 11, werkzeuge: ['ahv-beitraege'],
    beleg: 'Art. 4–11 AHVG — Beitragspflicht und Bemessung der AHV-Beiträge.' },
  // ── DSG — Datenschutzgesetz ───────────────────────────────────────────────
  { erlass: 'DSG', von: 25, bis: 25, werkzeuge: ['datenschutz-fristen'],
    beleg: 'Art. 25 DSG — Auskunftsrecht der betroffenen Person; die 30-Tage-Frist steht in Art. 18 DSV (SR 235.11). Gegenprüfung 11.7.2026.' },
];

// ── §Zweifelsfälle — bewusst NICHT eingebaut (§8) ──────────────────────────
// Ausgelassen, weil kein eindeutiger Artikel-Anker (nicht geraten):
//  · dreizehnter-monatslohn: der 13. Monatslohn ist vertraglich, kein eigener
//    OR-Artikel; Art. 322d OR (Gratifikation) ist rechtlich etwas anderes.
//  · schadenszins: Anker umstritten (analog Art. 73/104 OR, richterrechtlich) —
//    kein sauberer Artikel-Bereich.
//  · gewaehrleistung im Werkvertrag (Art. 367–371 OR): der Rechner ist
//    kaufrechtlich zugeschnitten; Werkvertrags-Mängelrecht nicht abgebildet.
//  · auslaenderrecht-fristen (AIG): Fristen über viele Bestimmungen verstreut,
//    keine tragende Einzelnorm.
// Werden nachgezogen, sobald der jeweilige Rechner die Norm eindeutig trägt.

/** Haupt-Artikelnummer aus einem Anker-Token ('335_c' → 335, '60' → 60). */
function hauptArtikelNummer(token: string): number | null {
  const m = /^(\d+)/.exec(token);
  return m ? Number.parseInt(m[1], 10) : null;
}

/**
 * Artikel-scharfe Richtung «Artikel → Werkzeug» (V1): verfügbare Werkzeuge zu
 * EINEM Artikel eines Erlasses (Register-Key + Anker-Token). Union der Kanten,
 * deren Artikel-Bereich die Hauptnummer enthält, in Kanten-Reihenfolge,
 * dedupliziert. Leer, wo keine eindeutige Kante existiert (§8: lieber nichts als
 * grobes Rauschen).
 */
export function werkzeugeFuerArtikel(erlassKey: string, token: string): Werkzeug[] {
  const nr = hauptArtikelNummer(token);
  if (nr === null) return [];
  const ids: string[] = [];
  for (const k of ARTIKEL_WERKZEUGE) {
    if (k.erlass === erlassKey && nr >= k.von && nr <= k.bis) ids.push(...k.werkzeuge);
  }
  return aufloeseWerkzeuge(ids);
}

/**
 * Artikel-scharfe Werkzeuge zu den ZITIERTEN Normen eines Entscheids (V1,
 * Rausch-Filter #28): jedes Zitat wird über `bundSnapshotRef` in Erlass-Key +
 * Artikel-Token aufgelöst und artikelscharf gemappt. Union über alle Zitate,
 * dedupliziert. Ersetzt am Entscheid die grobe Erlass-Zuordnung — nur Werkzeuge
 * zu tatsächlich zitierten Artikeln (Art. 448 ZGB ⇒ kein Erbrecht).
 */
export function werkzeugeFuerZitate(zitate: readonly string[]): Werkzeug[] {
  const ids: string[] = [];
  for (const zitat of zitate) {
    const ref = bundSnapshotRef(zitat);
    if (!ref) continue;
    const nr = hauptArtikelNummer(ref.token);
    if (nr === null) continue;
    for (const k of ARTIKEL_WERKZEUGE) {
      if (k.erlass === ref.quelle && nr >= k.von && nr <= k.bis) ids.push(...k.werkzeuge);
    }
  }
  return aufloeseWerkzeuge(ids);
}

/** Anzeige-Gruppe der Richtung «Artikel → Werkzeug» für den Gesetz-Reader (#38). */
export interface ArtikelWerkzeugGruppe {
  /** «Art. 127–142» bzw. «Art. 335» (bei einzelnem Artikel). */
  label: string;
  von: number;
  bis: number;
  werkzeuge: Werkzeug[];
  beleg: string;
}

/**
 * Alle artikelscharfen Kanten EINES Erlasses als anzeige-fertige Gruppen (#38,
 * «Werkzeuge zu diesem Artikel» im KontextPanel des Gesetz-Readers). Kanten ohne
 * derzeit verfügbares Werkzeug (nur geplante Karten) werden ausgelassen (§8: kein
 * leerer Eintrag). Nach Artikelnummer sortiert.
 */
export function artikelWerkzeugGruppen(erlassKey: string): ArtikelWerkzeugGruppe[] {
  const out: ArtikelWerkzeugGruppe[] = [];
  for (const k of ARTIKEL_WERKZEUGE) {
    if (k.erlass !== erlassKey) continue;
    const werkzeuge = aufloeseWerkzeuge(k.werkzeuge);
    if (werkzeuge.length === 0) continue;
    out.push({
      label: k.von === k.bis ? `Art. ${k.von}` : `Art. ${k.von}–${k.bis}`,
      von: k.von, bis: k.bis, werkzeuge, beleg: k.beleg,
    });
  }
  return out.sort((a, b) => a.von - b.von || a.bis - b.bis);
}

/**
 * Werkzeuge zu den ANGEWANDTEN Normen eines Entscheids (transitiv über die
 * Norm↔Werkzeug-Brücke). Grob (Erlass-Granularität) → «auch relevant»-Klasse,
 * Status 'maschinell'; keine kuratierte Empfehlung (§8). Dedupliziert.
 */
export function werkzeugeFuerEntscheid(normKeys: string[]): Werkzeug[] {
  const seen = new Set<string>();
  const out: Werkzeug[] = [];
  for (const k of normKeys) {
    for (const w of werkzeugeFuerNorm(k)) {
      if (!seen.has(w.id)) { seen.add(w.id); out.push(w); }
    }
  }
  return out;
}

export interface MassgebenderErlass { key: string; kuerzel: string; titel: string; pfad: string }

/**
 * Inverse Norm↔Werkzeug-Brücke (W2.1): Erlasse mit Volltext-Detailseite
 * (status 'snapshot' → kein toter Link, §8), die mindestens ein verfügbares
 * Werkzeug des gegebenen Modus tragen — für den «Massgebende Gesetze»-Block der
 * Rubrik-Übersichten (interne Verlinkung Werkzeug → Norm-Detailseite). Reihenfolge
 * = ERLASS_REGISTER (rang/Gebiet). Pfad-Keys sind Bund (sauber, keine Kodierung).
 */
export function massgebendeErlasse(modus: 'rechner' | 'vorlage'): MassgebenderErlass[] {
  const out: MassgebenderErlass[] = [];
  for (const e of ERLASS_REGISTER) {
    if (e.status !== 'snapshot') continue;
    if (!werkzeugeFuerNorm(e.key).some((w) => w.modus === modus)) continue;
    out.push({ key: e.key, kuerzel: e.kuerzel, titel: e.titel, pfad: `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}` });
  }
  return out;
}

// ─── Norm ↔ Material-Brücke (Auftrag 5, additiv) ────────────────────────────
//
// Inverse zu MaterialRegistereintrag.normKeys: zu einem Erlass-Key die amtlichen
// Materialien (Kreisschreiben/Wegleitungen/Leitfäden …), die ihn auslegen — für
// einen «Materialien zu diesem Erlass»-Block im Gesetze-Reader (Burggraben:
// Norm + Behördenpraxis an einer Stelle). Reine Daten-Projektion aus dem
// MATERIAL_REGISTER (§3); Reihenfolge = Behörde-rang → eigener rang.

export interface MaterialBezug {
  key: string; titel: string; behoerdeKuerzel: string; doktypLabel: string;
  nummer: string | null; pfad: string;
  /** §8-Herkunft. In-Bundle-kuratierte Materialien sind 'kuratiert'; die asynchron
   *  geladenen Soft-Law-Kanten (kontextSoftLaw) tragen die Adapter-quelle. */
  herkunft: Herkunft;
  /** Stand der Dokument-Fassung (ISO) — Chip-Anzeige + Staleness-Klassifikation (§2.4). */
  stand: string;
  /** Repräsentativer Korpus-Artikel-Token für DIESEN Erlass (Staleness §2.4). */
  artikel?: string;
  /** Fundstellen-Sublabel («via Art. 24») oder undefined (Erlass-Ebene). */
  sublabel?: string;
}

export function materialienFuerNorm(normKey: string): MaterialBezug[] {
  const out: MaterialBezug[] = [];
  for (const m of MATERIAL_REGISTER) {
    if (!(m.normKeys ?? []).includes(normKey)) continue;
    // Kuratierter artikelscharfer Bezug für DIESEN Erlass (E6a·M5, §2.4/§7).
    const bezug = m.artikelBezuege?.find((b) => b.erlass === normKey);
    out.push({
      key: m.key,
      titel: m.titel,
      behoerdeKuerzel: behoerdeVon(m.behoerde).kuerzel,
      doktypLabel: DOKTYP_LABEL[m.doktyp],
      nummer: m.nummer ?? null,
      pfad: `/materialien/${encodeURIComponent(m.key)}`,
      herkunft: 'kuratiert',
      stand: m.stand,
      artikel: bezug?.artikel,
      sublabel: bezug ? `via Art. ${bezug.artikel.replace(/_/g, '')}` : undefined,
    });
  }
  return out.sort((a, b) => a.behoerdeKuerzel.localeCompare(b.behoerdeKuerzel) || a.key.localeCompare(b.key));
}
