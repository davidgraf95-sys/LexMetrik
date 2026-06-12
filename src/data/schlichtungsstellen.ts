import type { Kanton } from '../types/legal';
import type { SchlichtungsbehoerdeTyp } from '../lib/zustaendigkeit';
import { vdArbeitsStufe, vdSchlichtungsStufe, VD_GLG_OHNE_GELD_TEXT, VD_KASKADE_TEXT } from '../lib/vdSchlichtung';

// ─── Schlichtungsstellen aller Kantone (Recherche-Schicht) ──────────────────
//
// Anordnung David 5.6.2026: Der Zuständigkeitsrechner soll nach der Prüfung
// IMMER eine konkrete Stelle zeigen — nicht nur für BS. Quelle sind die
// ZWEIFACH GEPRÜFTEN Dossiers (Erstrecherche + adversarialer Durchgang +
// Schiedsrichter-Entscheide, alle 5.6.2026):
//   bibliothek/behoerden/schlichtungsbehoerden-kantone.md (+ Vollerfassungen)
//
// EHRLICHKEITS-MODELL (§8): Drei Auflösungsstufen statt Raten —
//   'zentral'      eine Stelle für den ganzen Kanton → konkrete Adresse
//   'liste'        wenige Stellen → alle mit Adresse + Zuständigkeitsgebiet
//   'verzeichnis'  gemeinde-/kreisaufgelöst (z. B. ZH: 171 Ämter) → Anzahl +
//                  amtliches Verzeichnis (Gemeinde→Stelle löst die UI nicht
//                  heuristisch auf)
// Jeder Kanton trägt quelle + stand. Status der Schicht: Recherche zweifach
// geprüft, FACHLICHE ABNAHME DURCH DAVID AUSSTEHEND — die UI legt das offen.
// BS bleibt in behoerden.ts (abgenommene Stammdaten) und hat dort Vorrang.

export interface SchlichtungsAdresse {
  name: string;
  strasse: string;
  plzOrt: string;
  /** Bei 'liste': wofür diese Stelle zuständig ist (Region/Bezirk). */
  zustaendigFuer?: string;
  hinweis?: string;
  /** Direkte amtliche Detailseite DIESER Stelle (additiv, optional). Nur
   *  https; wörtlich aus den bibliothek-Dossiers. Fehlt das Feld, fällt die
   *  UI auf die Kantons-url bzw. die Quelle-Ebene zurück. */
  url?: string;
}

export type SchlichtungsAufloesung =
  | { modus: 'zentral'; stelle: SchlichtungsAdresse }
  | { modus: 'liste'; stellen: SchlichtungsAdresse[]; hinweis?: string }
  | { modus: 'verzeichnis'; beschreibung: string; url: string };

export interface KantonSchlichtung {
  stand: string;
  quelle: string;
  /** Kantonale Übersichts-/Verzeichnisseite als Fallback-Link, wenn einzelne
   *  Stellen (modus 'liste'/'zentral') keine eigene Detail-url tragen. Nur
   *  https; wörtlich aus den bibliothek-Dossiers (additiv, optional). */
  url?: string;
  ordentlich: SchlichtungsAufloesung;
  miete?: SchlichtungsAufloesung;   // paritätische Stelle Miete/Pacht (Art. 200 Abs. 1)
  glg?: SchlichtungsAufloesung;     // paritätische Stelle GlG (Art. 200 Abs. 2)
}

const A = (name: string, strasse: string, plzOrt: string, zustaendigFuer?: string, hinweis?: string, url?: string): SchlichtungsAdresse =>
  ({ name, strasse, plzOrt, ...(zustaendigFuer ? { zustaendigFuer } : {}), ...(hinweis ? { hinweis } : {}), ...(url ? { url } : {}) });

// ─── Kanonische BS-Schlichtungsadressen (Single Source of Truth, §5) ─────────
// Strasse + PLZ/Ort der drei Basler Schlichtungsstellen existieren nur HIER.
// Sowohl der BS-Eintrag in SCHLICHTUNGSSTELLEN als auch die Vorlagen-Registry
// lib/vorlagen/behoerden.ts beziehen diese Werte (behoerden.ts importiert
// BS_ADRESSEN und ergänzt nur Name-Aufteilung/zusatz/stand/quelle).
// Adress-Gesamtprüfung 6.6.2026 (zuletzt geprüfter Stand) — amtliche Quelle:
// staatskalender.bs.ch.
export const BS_ADRESSEN = {
  zivil: { strasse: 'Bäumleingasse 5', plzOrt: '4001 Basel' },
  miete: { strasse: 'Grenzacherstrasse 62', plzOrt: '4005 Basel' },
  diskriminierung: { strasse: 'Grenzacherstrasse 62', plzOrt: '4005 Basel' },
} as const;

// ─── VD: Instanzen der Streitwert-Stufen ≥ CHF 10'000 (Dossier §37) ──────────
// Adressen WebFetch-verifiziert 11.6.2026 (vd.ch/ojv-Detailseiten); die
// Arrondissement-Einteilung folgt dem AAJTJ (BLV 173.01.2, Art. 1/2).
export const VD_TRIBUNAUX: SchlichtungsAdresse[] = [
  A('Tribunal d’arrondissement de Lausanne', 'Allée E.-Ansermet 2, Palais de justice de Montbenon', '1014 Lausanne', 'Districts Lausanne und Ouest lausannois', undefined, 'https://www.vd.ch/ojv/tribunaux-darrondissement/lausanne'),
  A('Tribunal d’arrondissement de La Côte', 'Route de Saint-Cergue 38', '1260 Nyon', 'Districts Morges und Nyon', undefined, 'https://www.vd.ch/ojv/tribunaux-darrondissement/la-cote'),
  A('Tribunal d’arrondissement de l’Est vaudois', 'Cour-au-Chantre, Rue du Simplon 22', '1800 Vevey', 'Districts Aigle, Lavaux-Oron und Riviera-Pays-d’Enhaut', 'Verhandlungen überwiegend an der Rue du Musée 6, Vevey (vd.ch)', 'https://www.vd.ch/ojv/tribunaux-darrondissement/est-vaudois'),
  A('Tribunal d’arrondissement de la Broye et du Nord vaudois', 'Rue des Moulins 8, Case postale', '1401 Yverdon-les-Bains', 'Districts Broye-Vully, Gros-de-Vaud und Jura-Nord vaudois', undefined, 'https://www.vd.ch/ojv/tribunaux-darrondissement/broye-et-nord-vaudois'),
];
export const VD_CHAMBRE_PATRIMONIALE: SchlichtungsAdresse =
  A('Chambre patrimoniale cantonale', 'Allée E.-Ansermet 2, Palais de justice de Montbenon', '1014 Lausanne', 'ganzer Kanton (Art. 96f LOJV-VD: beim Tribunal d’arrondissement de Lausanne)', undefined, 'https://www.vd.ch/ojv/chambre-patrimoniale-cantonale');
// Justice de paix (Name wie in aemterKantone.json/Dossier §37) → Index in
// VD_TRIBUNAUX. Eindeutig, weil die Doppel-District-JdP (Jura-Nord vaudois/
// Gros-de-Vaud) beide Districts im selben Arrondissement hat.
export const VD_JDP_ZU_TA: Record<string, number> = {
  'Justice de paix Lausanne': 0,
  'Justice de paix Ouest lausannois': 0,
  'Justice de paix Morges': 1,
  'Justice de paix Nyon': 1,
  'Justice de paix Aigle': 2,
  'Justice de paix Riviera': 2,
  'Justice de paix Lavaux-Oron': 2,
  'Justice de paix Broye-Vully': 3,
  'Justice de paix Jura-Nord vaudois/Gros-de-Vaud': 3,
};
/** Amtliche Instanz-Suche des Kantons (Gemeinde/PLZ → zuständige Instanz). */
export const VD_INSTANZSUCHE_URL = 'https://www.vd.ch/justice/le-pouvoir-judiciaire/recherche-de-linstance-judiciaire-competente';

// NE: drei Standorte der zwei Tribunaux régionaux — SSoT (§5) für die
// ordentliche Chambre de conciliation UND die paritätische Miet-Besetzung
// (Art. 12 Abs. 1 OJN; Erhebung 11.6.2026).
const NE_TRIBUNAUX: SchlichtungsAdresse[] = [
  // Postfach-PLZ amtlich 2002 (Bug-Check B4 11.6.2026; Standort 2000)
  A('Tribunal régional Littoral/Val-de-Travers', 'Rue de l’Hôtel-de-Ville 2 (CP 1)', '2002 Neuchâtel 2', 'Littoral/Val-de-Travers'),
  A('Tribunal régional Littoral/Val-de-Travers (Boudry)', 'Rue Louis-Favre 39, CP 36', '2017 Boudry', 'Littoral/Val-de-Travers'),
  A('Tribunal régional Montagnes/Val-de-Ruz', 'Av. Léopold-Robert 10, CP 2284', '2300 La Chaux-de-Fonds', 'Montagnes/Val-de-Ruz', 'Umzug ins Hauptpost-Gebäude 1.7.–14.8.2026 angekündigt'),
];
// Arbeitsrecht inkl. GlG (LJT-VD): das Tribunal de prud'hommes ist die
// spezialisierte Kammer JEDES Tribunal d'arrondissement (Art. 5 LJT) —
// gleiche Anschrift wie das TA; verlinkt wird die verifizierte TA-Seite.
export const VD_PRUDHOMMES: SchlichtungsAdresse[] = VD_TRIBUNAUX.map((t) =>
  A(`Tribunal de prud’hommes (${t.name})`, t.strasse, t.plzOrt, t.zustaendigFuer, undefined, t.url));

export const SCHLICHTUNGSSTELLEN: Record<Kanton, KantonSchlichtung> = {
  ZH: {
    stand: '5.6.2026', quelle: 'vfzh.ch-Ämterverzeichnis · gerichte-zh.ch · BWO 13.2.2026',
    ordentlich: { modus: 'verzeichnis', beschreibung: '171 kommunale Friedensrichterämter (Auflösung nach Wohnsitzgemeinde der beklagten Partei)', url: 'https://www.vfzh.ch/recht-finden/aemterverzeichnis' },
    miete: {
      modus: 'liste', hinweis: 'je Bezirk eine paritätische Stelle (beim Bezirksgericht)',
      stellen: [
        // url aus schlichtungsbehoerden-zh-vollerfassung.md (Stand 5.6.2026)
        A('SB Miete Bezirk Zürich', 'Wengistrasse 30', '8004 Zürich', 'Bezirk Zürich', 'seit 9.3.2026 (Rückumzug)', 'https://www.gerichte-zh.ch/organisation/bezirksgerichte/bezirksgericht-zuerich/kontakt/adressen-telefonnummern/mietgericht-und-schlichtungsbehoerde'),
        A('SB Miete (BezGer Winterthur)', 'Lindstrasse 10', '8400 Winterthur', 'Bezirk Winterthur'),
        A('SB Miete (BezGer Bülach)', 'Spitalstrasse 13', '8180 Bülach', 'Bezirk Bülach'),
        A('SB Miete (BezGer Dietikon)', 'Bahnhofplatz 10', '8953 Dietikon', 'Bezirk Dietikon'),
        A('SB Miete (BezGer Affoltern)', 'Im Grund 15', '8910 Affoltern am Albis', 'Bezirk Affoltern'),
        A('SB Miete (BezGer Andelfingen)', 'Thurtalstrasse 1', '8450 Andelfingen', 'Bezirk Andelfingen'),
        A('SB Miete (BezGer Dielsdorf)', 'Spitalstrasse 7', '8157 Dielsdorf', 'Bezirk Dielsdorf'),
        A('SB Miete (BezGer Hinwil)', 'Gerichtshausstrasse 12', '8340 Hinwil', 'Bezirk Hinwil'),
        A('SB Miete (BezGer Horgen)', 'Burghaldenstrasse 3', '8810 Horgen', 'Bezirk Horgen'),
        A('SB Miete (BezGer Meilen)', 'Untere Bruech 139/140', '8706 Meilen', 'Bezirk Meilen'),
        A('SB Miete (BezGer Pfäffikon)', 'Hörnlistrasse 55', '8330 Pfäffikon ZH', 'Bezirk Pfäffikon'),
        A('SB Miete (BezGer Uster)', 'Gerichtsstrasse 17', '8610 Uster', 'Bezirk Uster'),
      ],
    },
    // url aus schlichtungsbehoerden-zh-vollerfassung.md (Stand 5.6.2026)
    glg: { modus: 'zentral', stelle: A('Schlichtungsbehörde nach Gleichstellungsgesetz', 'Wengistrasse 30', '8004 Zürich', 'ganzer Kanton', undefined, 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-zuerich/schlichtungsbehoerde') },
  },
  BE: {
    stand: '5.6.2026', quelle: 'zsg.justice.be.ch (4 Detailseiten)',
    ordentlich: {
      modus: 'liste', hinweis: 'eine regionale Schlichtungsbehörde je Gerichtsregion (Art. 84 GSOG)',
      stellen: [
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Schlichtungsbehörde Bern-Mittelland', 'Effingerstrasse 34', '3008 Bern', 'Region Bern-Mittelland', undefined, 'https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/bern-mittelland.html'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Schlichtungsbehörde Berner Jura-Seeland', 'Neuengasse 8', '2502 Biel/Bienne', 'Region Berner Jura-Seeland', 'Antenne Jura bernois: Unionsgasse 13, 2502 Biel (ab 1.1.2026)', 'https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/berner-jura-seeland.html'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Schlichtungsbehörde Emmental-Oberaargau', 'Dunantstrasse 3', '3400 Burgdorf', 'Region Emmental-Oberaargau', undefined, 'https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/emmental-oberaargau.html'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Schlichtungsbehörde Oberland', 'Scheibenstrasse 11B', '3600 Thun', 'Region Oberland', undefined, 'https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/oberland.html'),
      ],
    },
    // Miete (11.6.2026): dieselben vier regionalen Schlichtungsbehörden in
    // paritätischer Besetzung (Art. 200 Abs. 1 ZPO) — Auto-Auflösung über
    // das ordentliche BE-Register (mieteAmtFuer-Alias).
    miete: { modus: 'verzeichnis', beschreibung: 'die vier regionalen Schlichtungsbehörden amten paritätisch auch für Miete/Pacht (Art. 200 Abs. 1 ZPO) — PLZ/Gemeinde eingeben für die konkrete Stelle', url: 'https://www.zsg.justice.be.ch/de/start/themen/schlichtungsverfahren.html' },
  },
  LU: {
    stand: '5.6.2026', quelle: 'gerichte.lu.ch (Friedensrichter/Kontakt) · BWO 13.2.2026',
    ordentlich: {
      modus: 'liste', hinweis: 'vier Friedensrichterämter (Kreise = Gerichtsbezirke)',
      stellen: [
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Friedensrichteramt Luzern', 'Grabenstrasse 2, Postfach 2266', '6002 Luzern', 'Bezirk Luzern', undefined, 'https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/luzern'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Friedensrichteramt Kriens', 'Villastrasse 1', '6010 Kriens', 'Bezirk Kriens', undefined, 'https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/kriens'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Friedensrichteramt Hochdorf', 'Hohenrainstrasse 8', '6280 Hochdorf', 'Bezirk Hochdorf', undefined, 'https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/hochdorf'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
        A('Friedensrichteramt Willisau', 'Menzbergstrasse 16, Postfach', '6130 Willisau', 'Bezirk Willisau', undefined, 'https://staatskalender.lu.ch/organization/gerichte/schlichtungsbehoerden/friedensrichteraemter/willisau'),
      ],
    },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Miete und Pacht', 'Bahnhofstrasse 22', '6002 Luzern', 'ganzer Kanton', undefined, 'https://gerichte.lu.ch/organisation/schlichtungsbehoerden/miete_pacht') },
  },
  UR: {
    stand: '5.6.2026', quelle: 'ur.ch/gerichte · BWO 13.2.2026',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — eine Stelle, paritetisch auch für Miete/GlG
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde Uri', 'Bahnhofstrasse 43', '6460 Altdorf', 'ganzer Kanton', undefined, 'https://www.ur.ch/aemter/1586') },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Uri (Miete/Pacht)', 'Bahnhofstrasse 43', '6460 Altdorf', 'ganzer Kanton', undefined, 'https://www.ur.ch/aemter/1586') },
  },
  SZ: {
    stand: '11.6.2026', quelle: 'Miete-Register 11.6.2026 · sz.ch/vermittleraemter (amtliche Karte) — Zusammenlegungen laufend',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Vermittlerämter der Gemeinden/Bezirke (mehrere Zusammenlegungen, z. B. Höfe seit 2020; Vollliste amtlich nur als Karte)', url: 'https://www.sz.ch/behoerden/justiz/vermittleraemter.html/8756-8758-8801-12287' },
    miete: { modus: 'verzeichnis', beschreibung: 'sechs Bezirks-Schlichtungsstellen für Miete/Pacht — PLZ/Gemeinde eingeben für die konkrete Stelle (Register 11.6.2026; teils Postfach)', url: 'https://www.sz.ch/verwaltung/volkswirtschaftsdepartement/departementssekretariat/miete-und-pacht/schlichtungsbehoerden.html/8756-8758-8802-10373-10393-10887-10888' },
  },
  OW: {
    stand: '5.6.2026', quelle: 'ow.ch/gerichte · BWO 13.2.2026 (2. Durchgang: Enetriederstrasse bestätigt)',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — eine Stelle
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde Obwalden', 'Enetriederstrasse 1', '6060 Sarnen', 'ganzer Kanton', undefined, 'https://www.ow.ch/fachbereiche/2131') },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Obwalden (Miete/Pacht)', 'Enetriederstrasse 1', '6060 Sarnen', 'ganzer Kanton', undefined, 'https://www.ow.ch/fachbereiche/2131') },
  },
  NW: {
    stand: '5.6.2026', quelle: 'nw.ch · BWO 13.2.2026',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — eine Stelle
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde Nidwalden', 'Rathausplatz 9, Postfach 1244', '6371 Stans', 'ganzer Kanton', undefined, 'https://www.nw.ch/judikative/326') },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Nidwalden (Miete/Pacht)', 'Rathausplatz 9, Postfach 1244', '6371 Stans', 'ganzer Kanton', undefined, 'https://www.nw.ch/judikative/326') },
  },
  GL: {
    stand: '5.6.2026', quelle: 'gl.ch/rechtspflege · BWO 13.2.2026',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — eine Stelle
    ordentlich: { modus: 'zentral', stelle: A('Kantonale Schlichtungsbehörde Glarus', 'Gerichtshausstrasse 22', '8750 Glarus', 'ganzer Kanton (seit 1.7.2018)', undefined, 'https://www.gl.ch/rechtspflege/kantonale-schlichtungsbehoerde.html/316') },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Kantonale Schlichtungsbehörde Glarus (Miete/Pacht)', 'Gerichtshausstrasse 22, Postfach', '8750 Glarus', 'ganzer Kanton', undefined, 'https://www.gl.ch/rechtspflege/kantonale-schlichtungsbehoerde.html/316') },
  },
  ZG: {
    stand: '5.6.2026', quelle: 'zg.ch/schlichtungsbehoerden (11 Ämter) · BWO 13.2.2026',
    ordentlich: { modus: 'verzeichnis', beschreibung: '11 kommunale Friedensrichterämter (je Einwohnergemeinde)', url: 'https://zg.ch/de/recht-justiz/zivilverfahren/schlichtung' },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Miet- und Pachtrecht', 'Baarerstrasse 131', '6300 Zug', 'ganzer Kanton', 'PLZ amtlich 6300 (Postfach-Zeile 6301)', 'https://zg.ch/de/recht-justiz/zivilverfahren/schlichtung/mietschlichtungsverfahren') },
  },
  FR: {
    stand: '11.6.2026', quelle: 'Miete-Register 11.6.2026 · fr.ch (Friedensgerichte/Mietkommissionen)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'sieben Friedensgerichte (justices de paix) als Schlichtungsbehörde — je Bezirk', url: 'https://www.fr.ch/de/staat-und-recht/justiz/gerichtsbehoerden-friedensgerichte' },
    miete: { modus: 'verzeichnis', beschreibung: 'DREI Schlichtungskommissionen Miete/Pacht (Saane · Sense+See · Süd-Bezirke — Korrektur 11.6.2026, nicht je Bezirk); PLZ/Gemeinde eingeben für die konkrete Stelle', url: 'https://www.fr.ch/de/staat-und-recht/justiz/gerichtsbehoerden-friedensgerichte' },
  },
  SO: {
    // Weiche § 5/§ 10 GO SO verdrahtet 11.6.2026 (soOrdentlich; AGP-Auto-
    // Auflösung über aemterKantone, Dossier §39).
    stand: '11.6.2026', quelle: 'GO SO (BGS 125.12, Stand 1.1.2026) wörtlich · so.ch Richterämter/Friedensrichter · Miete: so.ch Oberämter (5.6.2026)',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — kantonale Mietschlichtungs-Sammelseite
    // listet alle vier Oberämter (Miete) mit Adressen; keine Stellen-Detailseiten je Oberamt.
    url: 'https://so.ch/verwaltung/departement-des-innern/oberaemter/schlichtung-und-vermittlung/mietschlichtung/',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Friedensrichter der Gemeinden (teils zusammengelegte Kreise; zentrale Liste nur für 10 Kreise)', url: 'https://so.ch/gerichte/weitere-gerichte/friedensrichter/' },
    miete: {
      modus: 'liste', hinweis: 'Mietschlichtung bei den vier Oberämtern',
      stellen: [
        // PLZ amtlich 4502 (Behörden-Audit 6.6.2026)
        A('Oberamt Region Solothurn', 'Rötistrasse 4', '4502 Solothurn', 'Region Solothurn'),
        A('Oberamt Region Olten', 'Amthausquai 23', '4600 Olten', 'Region Olten'),
        A('Oberamt Thal-Gäu', 'Wengimattstrasse 2', '4710 Balsthal', 'Thal-Gäu'),
        A('Oberamt Dorneck-Thierstein', 'Passwangstrasse 29', '4226 Breitenbach', 'Dorneck-Thierstein'),
      ],
    },
    // GlG (Bug-Check 11.6.2026 B1): § 34bis/ter GO SO — EINE kantonale
    // Schlichtungsbehörde für Gleichstellung (privatrechtliche Arbeits-
    // verhältnisse); Sekretariat beim Oberamt Region Solothurn (§ 34quater,
    // Adresse = Oberamt, PLZ amtlich 4502). GlG ist dem Friedensrichter
    // ausdrücklich entzogen (§ 5 Abs. 2 lit. e) — vorher fiel der Typ
    // fälschlich in die § 5-Weiche zurück.
    glg: { modus: 'zentral', stelle: A('Kantonale Schlichtungsbehörde für Gleichstellung von Frau und Mann', 'Sekretariat: Oberamt Region Solothurn, Rötistrasse 4', '4502 Solothurn', 'ganzer Kanton (§§ 34bis f. GO SO)') },
  },
  BS: {
    // SSoT (B7, Adress-Gesamtprüfung 6.6.2026): Die BS-Schlichtungsadressen
    // (Strasse/PLZ/Ort) leben AUSSCHLIESSLICH hier. lib/vorlagen/behoerden.ts
    // projiziert daraus (importiert BS_ADRESSEN) und ergänzt nur die
    // vorlagen-spezifischen Zusatzfelder (Name-Aufteilung, zusatz, stand,
    // quelle). Keine Divergenz festgestellt: Strasse/PLZ waren in beiden
    // Quellen bereits identisch (Stand 5.6.2026); 6.6.2026 unverändert bestätigt.
    stand: '5.6.2026', quelle: 'staatskalender.bs.ch (abgenommene Stammdaten in behoerden.ts)',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — staatskalender.bs.ch-Detailseiten
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde des Zivilgerichts', BS_ADRESSEN.zivil.strasse, BS_ADRESSEN.zivil.plzOrt, 'ganzer Kanton', undefined, 'https://staatskalender.bs.ch/organization/richterliche-behoerden/gerichte/zivilgericht/kanzlei-schlichtungsbehoerde') },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Staatliche Schlichtungsstelle für Mietstreitigkeiten', BS_ADRESSEN.miete.strasse, BS_ADRESSEN.miete.plzOrt, 'ganzer Kanton', undefined, 'https://staatskalender.bs.ch/organization/regierung-und-verwaltung/praesidialdepartement/staatskanzlei/mietstreitigkeiten-staatliche-schlichtungsstelle-fuer') },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    glg: { modus: 'zentral', stelle: A('Kantonale Schlichtungsstelle für Diskriminierungsfragen', BS_ADRESSEN.diskriminierung.strasse, BS_ADRESSEN.diskriminierung.plzOrt, 'ganzer Kanton', undefined, 'https://staatskalender.bs.ch/organization/regierung-und-verwaltung/praesidialdepartement/staatskanzlei/schlichtungsstelle-fuer-diskriminierungsfragen-kantonale') },
  },
  BL: {
    stand: '5.6.2026', quelle: 'baselland.ch (Friedensrichter) · VGD/oslvb.bl.ch + BWO (Miete, Schiedsrichter-Entscheid)',
    ordentlich: { modus: 'verzeichnis', beschreibung: '15 Friedensrichterkreise (Amt bei der jeweiligen Gemeindeverwaltung)', url: 'https://www.baselland.ch/politik-und-behorden/gerichte/friedensrichter-innen' },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Mietangelegenheiten', 'Rheinstrasse 16', '4410 Liestal', 'ganzer Kanton', 'zweifach entschieden (frühere Angaben Bahnhofstrasse 3/5 überholt)') },
  },
  SH: {
    stand: '5.6.2026', quelle: 'sh.ch · BWO 13.2.2026 (Zentralisierung per 1.1.2018)',
    ordentlich: { modus: 'zentral', stelle: A('Friedensrichteramt des Kantons Schaffhausen', 'Vordergasse 54', '8201 Schaffhausen', 'ganzer Kanton', 'Amtlich bestätigt: Vordergasse 54 (sh.ch, 6.6.2026)') },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Mietsachen', 'Vordergasse 54', '8201 Schaffhausen', 'ganzer Kanton') },
  },
  AR: {
    stand: '5.6.2026', quelle: 'ar.ch/gerichte (Vermittler/Schlichtungsstellen)',
    ordentlich: {
      modus: 'liste', hinweis: 'drei Vermittlerkreise',
      stellen: [
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — staatskalender.ar.ch
        A('Vermittleramt Kreis 1', 'Regierungsgebäude, Obstmarkt 3', '9100 Herisau', 'Kreis 1 (Hinterland; Postfach-PLZ 9102)', undefined, 'https://staatskalender.ar.ch/organization/kantonale-behoerden/gerichtsbehoerden/schlichtungsbehoerden/vermittleramt-kreis-1-appenzeller-hinterland'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — Sitz Trogen = staatskalender-Detailseite Kreis 2 (Mittelland)
        A('Vermittleramt Kreise 2 und 3', 'Rathaus, Landsgemeindeplatz 2', '9043 Trogen', 'Kreise 2/3 (Mittel-/Vorderland)', undefined, 'https://staatskalender.ar.ch/organization/kantonale-behoerden/gerichtsbehoerden/schlichtungsbehoerden/vermittleramt-kreis-2-appenzeller-mitteland'),
      ],
    },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Miete und nichtlandwirtschaftliche Pacht', 'Landsgemeindeplatz 7c', '9043 Trogen', 'ganzer Kanton', undefined, 'https://ar.ch/gerichte/vermittler-und-schlichtungsstellen/schlichtungsstelle-fuer-miete-und-nichtlandwirtschaftliche-pacht/') },
  },
  AI: {
    stand: '5.6.2026', quelle: 'ai.ch (via amtliche Erlasssammlung/Staatskalender; ai.ch/gerichte/vermittler (Direktabruf 10.6.2026))',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'fünf Bezirks-Vermittler (Appenzell, Schwende-Rüte, Schlatt-Haslen, Gonten, Oberegg)', url: 'https://www.ai.ch/gerichte/vermittler' },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Mietverhältnisse (Sekretariat)', 'c/o Ratskanzlei, Marktgasse 2', '9050 Appenzell', 'beide Landesteile') },
  },
  SG: {
    stand: '11.6.2026', quelle: 'Miete-Register 11.6.2026 · sg.ch (Vermittlungsämter/Mietschlichtung) — 2. Durchgang: alle Adressen bestätigt',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'zehn Vermittlungsämter (je Vermittlungskreis)', url: 'https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/vermittlungsaemter.html' },
    miete: { modus: 'verzeichnis', beschreibung: 'sieben Schlichtungsstellen für Miet- und Pachtverhältnisse (Gerichtskreise; Werdenberg+Sarganserland zusammengelegt) — PLZ/Gemeinde eingeben für die konkrete Stelle (Register 11.6.2026)', url: 'https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html' },
  },
  GR: {
    stand: '11.6.2026', quelle: 'Miete-Register 11.6.2026 · justiz-gr.ch (Vermittlerämter/Mietsachen) — 11/11 bestätigt',
    // url aus schlichtungsbehoerden-ti-vs-gr-vollerfassung.md (Stand 5.6.2026):
    // kantonale Verzeichnisseite der Vermittlerämter (keine Stellen-Detailseiten belegt)
    url: 'https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/',
    ordentlich: {
      modus: 'liste', hinweis: 'ein Vermittleramt je Region (GOG GR Art. 85 ff.)',
      stellen: [
        A('Vermittleramt Plessur', 'Bärenloch 1, Postfach 290', '7001 Chur', 'Region Plessur'),
        A('Vermittleramt Imboden', 'Postfach 667' /* 10.6.2026: PF 308→667, Tamins+Domat/Ems (justiz-gr.ch noch 308 — Vorbehalt im Dossier) */, '7001 Chur', 'Region Imboden'),
        A('Vermittleramt Landquart', 'Bahnhofplatz 2b, Postfach 244', '7302 Landquart', 'Region Landquart'),
        A('Vermittleramt Prättigau/Davos', 'Talstrasse 10a, Postfach 125' /* 10.6.2026: Strasse via Gemeinde Davos, Tel.-identisch */, '7250 Klosters', 'Region Prättigau/Davos'),
        A('Vermittleramt Albula', 'Stradung 26', '7450 Tiefencastel', 'Region Albula'),
        A('Vermittleramt Viamala', 'Untere Gasse 1', '7430 Thusis', 'Region Viamala'),
        A('Vermittleramt Surselva', 'Via Centrala 4', '7130 Ilanz/Glion', 'Region Surselva'),
        A('Vermittleramt Engiadina Bassa/Val Müstair', 'Saglina 22', '7554 Sent', 'Region EB/VM'),
        A('Vermittleramt Maloja', 'Plazza da Scoula 16, Postfach 83', '7500 St. Moritz', 'Region Maloja'),
        A('Vermittleramt Bernina', 'Via da la Pesa 8', '7742 Poschiavo', 'Region Bernina'),
        A('Vermittleramt Moesa', 'Al Giardinètt 2', '6535 Roveredo', 'Region Moesa'),
      ],
    },
    miete: { modus: 'verzeichnis', beschreibung: 'Schlichtungsbehörden für Mietsachen je Region — PLZ/Gemeinde eingeben (Register 11.6.2026; Adressen der Mietsachen-Sammelseite, teils abweichend vom Regionalgericht)', url: 'https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/' },
  },
  AG: {
    stand: '11.6.2026', quelle: 'Miete-Register 11.6.2026 · ag.ch (Friedensrichterkreise/Mietschlichtung nach Bezirken)',
    ordentlich: { modus: 'verzeichnis', beschreibung: '17 Friedensrichterkreise (Auflösung nach Gemeinde)', url: 'https://www.ag.ch/de/gerichte/schlichtungsbehoerden/friedensrichterinnen-und-friedensrichter/friedensrichterkreise' },
    miete: { modus: 'verzeichnis', beschreibung: '11 Schlichtungsbehörden für Miete und Pacht (je Bezirk) — PLZ/Gemeinde eingeben für die konkrete Stelle (Register 11.6.2026)', url: 'https://www.ag.ch/de/ueber-uns/gerichte-kanton-aargau/organisation/schlichtungsbehoerden/schlichtungsbehoerden-fuer-miete-und-pacht' },
  },
  TG: {
    stand: '11.6.2026', quelle: 'Miete-Register 11.6.2026 · friedensrichteraemter.tg.ch · erechtsverkehr.tg.ch (Miete kommunal)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'fünf Friedensrichterämter (je Bezirk: Arbon, Frauenfeld, Kreuzlingen, Münchwilen, Weinfelden)', url: 'https://friedensrichteraemter.tg.ch' },
    miete: { modus: 'verzeichnis', beschreibung: 'kommunale Schlichtungsbehörden in Mietsachen (je politische Gemeinde — TG-Sonderfall; 80/80 erhoben) — PLZ/Gemeinde eingeben für die konkrete Stelle (Register 11.6.2026)', url: 'https://erechtsverkehr.tg.ch/schlichtungsbehoerden-in-mietsachen.html/7980' },
  },
  TI: {
    stand: '12.6.2026', quelle: 'ti.ch (amtliche Località-Suche: giudici di pace 169/169 am 11.6.2026; locazione 168/168 am 12.6.2026 — 11 Uffici, Art. 5 LALoc)',
    // Gemeinde→Circolo amtlich verdrahtet (aemterKantone.json, Dossier §38);
    // Lugano/Lema/Tresa über die Ortsteil-Wahl (tiAmt.ts).
    ordentlich: { modus: 'verzeichnis', beschreibung: '38 Giudicature di pace (je Circolo; Art. 28 f. LOG — Auflösung nach Gemeinde, bei Lugano/Lema/Tresa nach Ortsteil)', url: 'https://www4.ti.ch/poteri/giudiziario/giustizia-civile/giudici-di-pace' },
    miete: {
      modus: 'liste', hinweis: '11 Uffici di conciliazione in materia di locazione (Art. 5 LALoc) — PLZ/Gemeinde oben löst automatisch auf; Lugano/Bellinzona/Val Mara nach Ortsteil',
      stellen: [
        // Località-Vollerhebung 12.6.2026 (ti.ch id=29229, 168/168; Dossier
        // schlichtungsaemter-gemeindezuordnung.md §51) — Namen/Adressen
        // identisch mit dem TI_MIETE-Register (Auto-Auflösung).
        A('Ufficio di conciliazione in materia di locazione n. 1 — Chiasso', 'c/o Municipio, Piazza Bernasconi 1', '6830 Chiasso', 'Chiasso, Balerna, Breggia, Coldrerio, Morbio Inferiore, Vacallo'),
        A('Ufficio di conciliazione in materia di locazione n. 2 — Mendrisio', 'Via Municipio 13', '6850 Mendrisio', 'übriges Mendrisiotto inkl. Melano/Rovio (Val Mara)', undefined, 'https://mendrisio.ch/en/home/a-proposito-di-mendrisio/chi-siamo/dicasteri-e-uffici/dicastero-istituzioni-e-risorse/ufficio-conciliazione.html'),
        A('Ufficio di conciliazione in materia di locazione n. 3 — Lugano Ovest', 'Via Sala 13', '6963 Pregassona', 'Lugano: Zentrum und Westquartiere', undefined, 'https://www.lugano.ch/la-mia-citta/sportelli-in-citta/ufficio-conciliazione/'),
        A('Ufficio di conciliazione in materia di locazione n. 4 — Lugano Est', 'Via Sala 13', '6963 Pregassona', 'Lugano: Ostquartiere inkl. Ex-Sonvico/Valcolla', undefined, 'https://www.lugano.ch/la-mia-citta/sportelli-in-citta/ufficio-conciliazione/'),
        // Adress-KORREKTUR 12.6.2026 (amtliche Località-Suche): Contrada
        // Nuova 3 — die agno.ch-Seite nannte sie schon am 6.6.2026; der
        // bisherige Eintrag führte die Giudicatura-Adresse (Piazza Vicari).
        A('Ufficio di conciliazione in materia di locazione n. 5 — Agno', 'Contrada Nuova 3', '6982 Agno', 'Malcantone inkl. Lema/Tresa, Maroggia (Val Mara), Bissone, Sorengo', undefined, 'https://www.agno.ch/index.php?node=395&lng=1&vis=1&rif=2392173537'),
        A('Ufficio di conciliazione in materia di locazione n. 6 — Massagno', 'c/o Municipio, Via Motta 53', '6900 Massagno', 'Massagno, Vedeggio/Capriasca (u. a. Monteceneri)', undefined, 'https://www.massagno.ch/Ufficio-conciliazione-in-materia-di-locazione'),
        A('Ufficio di conciliazione in materia di locazione n. 7 — Locarno', 'Via Trevani 1a', '6600 Locarno', 'Locarno, Losone, Brissago, Centovalli, Onsernone, Terre di Pedemonte', undefined, 'https://www.locarno.ch/it/ufficio-conciliazione-in-materia-di-locazione'),
        A('Ufficio di conciliazione in materia di locazione n. 8 — Minusio', 'Via San Gottardo 60, CP 1670', '6648 Minusio', 'Minusio, Ascona, Muralto, Gambarogno, Verzasca, Vallemaggia', undefined, 'https://www.minusio.ch/uc'),
        A('Ufficio di conciliazione in materia di locazione n. 9 — Bellinzona', 'Via Lugano 1, CP 2694', '6501 Bellinzona', 'Bellinzona: Kernstadt', undefined, 'https://www.bellinzona.ch/Ufficio-di-conciliazione-c0723c00'),
        A('Ufficio di conciliazione in materia di locazione n. 10 — Bellinzona (quartiere di Giubiasco)', 'Piazza Grande 3', '6512 Giubiasco', 'Bellinzona-Süd-Quartiere, Arbedo-Castione, Cadenazzo, Isone, Lumino, Sant’Antonino', undefined, 'https://www.bellinzona.ch/Ufficio-di-conciliazione-c0723c00'),
        A('Ufficio di conciliazione in materia di locazione n. 11 — Biasca', 'Via Lucomagno 14', '6710 Biasca', 'Tre Valli (Riviera, Blenio, Leventina) inkl. Quartier Claro', undefined, 'https://www.bellinzona.ch/Ufficio-di-conciliazione-c0723c00'),
      ],
    },
  },
  VD: {
    stand: '11.6.2026', quelle: 'vd.ch/ojv (9 justices de paix · 4 tribunaux d’arrondissement · chambre patrimoniale) · LOJV/CDPJ am konsolidierten Erlass verifiziert; Miete: 10 commissions préfectorales',
    // VD-Sonderfall (Dossier §37): KEINE eigene Schlichtungsstelle — die
    // sachlich zuständige Instanz schlichtet selbst (Art. 41 CDPJ-VD).
    // schlichtungAufloesung() ersetzt diesen Eintrag streitwertabhängig
    // (lib/vdSchlichtung.ts); die JdP-Liste hier ist die Stufe < CHF 10'000.
    ordentlich: {
      modus: 'liste', hinweis: 'neun Justices de paix (Friedensgerichte) als Schlichtungsbehörde für Streitwerte unter CHF 10’000 (Art. 113 Abs. 1bis LOJV-VD)',
      stellen: [
        // url je Justice de paix: Erstrecherche 6.6.2026 (WebFetch verifiziert) — vd.ch/ojv
        A('Justice de paix Lausanne', 'Côtes-de-Montbenon 8', '1014 Lausanne', 'District Lausanne', undefined, 'https://www.vd.ch/ojv/justices-de-paix/lausanne'),
        A('Justice de paix Ouest lausannois', 'Av. de Longemalle 1', '1020 Renens', 'Ouest lausannois', undefined, 'https://www.vd.ch/ojv/justices-de-paix/ouest-lausannois'),
        A('Justice de paix Morges', 'Rue Saint-Louis 2', '1110 Morges', 'District Morges', undefined, 'https://www.vd.ch/ojv/justices-de-paix/morges'),
        A('Justice de paix Nyon', 'Rue Jules-Gachet 5', '1260 Nyon', 'District Nyon', undefined, 'https://www.vd.ch/ojv/justices-de-paix/nyon'),
        A('Justice de paix Aigle', 'Hôtel de Ville, Place du Marché 1', '1860 Aigle', 'District Aigle', 'Umzug 2025', 'https://www.vd.ch/ojv/justices-de-paix/aigle'),
        A('Justice de paix Riviera', 'Rue du Musée 6', '1800 Vevey', 'Riviera–Pays-d’Enhaut', undefined, 'https://www.vd.ch/ojv/justices-de-paix/riviera-pays-denhaut'),
        A('Justice de paix Lavaux-Oron', 'Rue Davel 9', '1096 Cully', 'Lavaux-Oron', undefined, 'https://www.vd.ch/ojv/justices-de-paix/lavaux-oron'),
        A('Justice de paix Broye-Vully', 'Rue de la Gare 45', '1530 Payerne', 'Broye-Vully', undefined, 'https://www.vd.ch/ojv/justices-de-paix/broye-vully'),
        // Postanschrift amtlich mit Postfach (Bug-Check 11.6.2026: vd.ch führt «Case postale, 1401»)
        A('Justice de paix Jura-Nord vaudois/Gros-de-Vaud', 'Rue des Moulins 10, Case postale', '1401 Yverdon-les-Bains', 'JNV + Gros-de-Vaud', undefined, 'https://www.vd.ch/ojv/justices-de-paix/jura-nord-vaudois-et-gros-de-vaud'),
      ],
    },
    miete: { modus: 'verzeichnis', beschreibung: '10 Commissions préfectorales de conciliation (eine je District) — PLZ/Gemeinde eingeben für die konkrete Stelle (Register 11.6.2026)', url: 'https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/prestations-des-prefectures/commissions-prefectorales-de-conciliation' },
  },
  VS: {
    // Einzelerhebung aller 122 Gemeindeverwaltungs-Adressen 11.6.2026
    // (Dossier §40) — Auto-Auflösung via aemterKantone; die amtliche
    // Richterliste (nur Namen) bleibt der Verzeichnis-Link.
    stand: '11.6.2026', quelle: 'vs.ch/communes (Richterliste + Gemeindeverzeichnis) · amtliche Website jeder Gemeinde (122/122 einzeln, 11.6.2026); SICT bail à loyer (5.6.2026)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Juge de commune / Gemeinderichter je Gemeinde (122; Anlaufstelle = Gemeindeverwaltung — PLZ/Gemeinde eingeben für die konkrete Adresse)', url: 'https://www.vs.ch/web/communes/juges-vice-juges' },
    // url aus schlichtungsbehoerden-ti-vs-gr-vollerfassung.md (Stand 5.6.2026)
    miete: { modus: 'zentral', stelle: A('Commission cantonale de conciliation en matière de bail à loyer', 'Av. du Midi 7', '1950 Sion', 'ganzer Kanton', 'PLZ 1951 ebenfalls amtlich in Gebrauch', 'https://www.vs.ch/en-GB/web/sict/bail-a-loyer') },
  },
  NE: {
    stand: '11.6.2026', quelle: 'ne.ch/PJNE (Chambre de conciliation, 3 Standorte) · OJN RSN 161.1 (état 1.2.2026) wörtlich: Miete paritätisch nach Art. 12 Abs. 1 OJN',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — PJNE-Übersicht der Tribunaux régionaux
    // nennt alle drei Standorte (Neuchâtel, Boudry, La Chaux-de-Fonds) mit Adressen; keine
    // Stellen-Detailseiten je Tribunal → Kantons-Fallback.
    url: 'https://www.ne.ch/autorites/PJNE/tribunaux-regionaux/Pages/accueil.aspx',
    ordentlich: {
      modus: 'liste', hinweis: 'Chambre de conciliation der zwei Regionalgerichte (drei Standorte)',
      stellen: NE_TRIBUNAUX,
    },
    // Miete (Erhebung 11.6.2026, OJN RSN 161.1 «état au 1.2.2026» wörtlich):
    // KEINE separate Mietschlichtungsstelle — die Chambre de conciliation
    // tagt in Miet-/Pachtsachen paritätisch (Art. 12 Abs. 1 OJN: Richter +
    // je eine Mieter- und Vermietervertretung; Art. 200 Abs. 1 ZPO).
    miete: {
      modus: 'liste', hinweis: 'Chambre de conciliation in paritätischer Besetzung für Miete/Pacht (Art. 200 Abs. 1 ZPO; Art. 12 Abs. 1 OJN-NE)',
      stellen: NE_TRIBUNAUX,
    },
  },
  GE: {
    stand: '5.6.2026', quelle: 'justice.ge.ch (TPI/Commission baux — Rue de l’Athénée bestätigt)',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — justice.ge.ch (FR)
    ordentlich: { modus: 'zentral', stelle: A('Tribunal de première instance (conciliation)', 'Rue de l’Athénée 6-8', '1205 Genève', 'ganzer Kanton', undefined, 'https://justice.ge.ch/fr/contenu/tribunal-de-premiere-instance') },
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert)
    miete: { modus: 'zentral', stelle: A('Commission de conciliation en matière de baux et loyers', 'Rue de l’Athénée 6-8', '1205 Genève', 'ganzer Kanton', undefined, 'https://justice.ge.ch/fr/contenu/commission-de-conciliation-en-matiere-de-baux-et-loyers') },
  },
  JU: {
    stand: '5.6.2026', quelle: 'jura.ch/JUST (TPI; Droit du bail — 3 Bezirkskommissionen)',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — jura.ch Sammelseite «Droit du travail et du bail»
    // nennt alle drei Commissions de conciliation en matière de bail mit Adressen → Kantons-Fallback für miete.
    url: 'https://www.jura.ch/JUST/Renseignements-juridiques/Droit-du-travail-et-du-bail/Droit-du-travail-et-du-bail.html',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — jura.ch TPI/juge civil
    ordentlich: { modus: 'zentral', stelle: A('Juge civil, Tribunal de première instance', 'Le Château, Chemin du Château 9', '2900 Porrentruy', 'ganzer Kanton', undefined, 'https://www.jura.ch/fr/Autorites/JUST/Instances-judiciaires/Tribunal-de-premiere-instance/Tribunal-de-premiere-instance.html') },
    miete: {
      modus: 'liste', hinweis: 'drei Bezirks-Commissions de conciliation en matière de bail',
      stellen: [
        A('Commission de conciliation District de Delémont', 'Hôtel-de-Ville, Case postale', '2800 Delémont', 'District Delémont (inkl. Moutier)'),
        A('Commission de conciliation District de Porrentruy', 'Rue de la Roche-de-Mars 5', '2900 Porrentruy', 'District Porrentruy'),
        A('Commission de conciliation Franches-Montagnes', 'Au Village 21c', '2360 Le Bémont', 'Franches-Montagnes'),
      ],
    },
  },
};

// ─── GlG-Schlichtungsstellen (Art. 200 Abs. 2 ZPO) — Vollerhebung 11.6.2026 ──
// Quelle: bibliothek/behoerden/glg-schlichtungsstellen-kantone.md (alle 26
// Kantone, Norm WÖRTLICH am kantonalen Erlass + amtliche Adresse). 17 weitere
// Kantone mit eigener/konzentrierter GlG-Stelle (inkl. Arbeitsgerichte GE/JU
// und BE-Konzentration auf die SB Bern-Mittelland in Fünferbesetzung) —
// zusätzlich zu den Record-Einträgen ZH/BS/SO und dem VD-Sonderpfad.
// UR/OW/NW/GL bleiben bewusst beim Fallback (zentrale ordentliche Stelle =
// fachlich korrekt); NE schlichtet GlG paritätisch bei der Chambre de
// conciliation (gleiche Standorte — eigener Listen-Eintrag unten).
const GLG_STELLEN: Partial<Record<Kanton, SchlichtungsAufloesung>> = {
  BE: { modus: 'zentral', stelle: A('Schlichtungsbehörde Bern-Mittelland (kantonsweit ausschliesslich zuständig für GlG)', 'Effingerstrasse 34', '3008 Bern', 'ganzer Kanton (GSOG, BSG 161.1, Art. 85 Abs. 1)', undefined, 'https://www.zsg.justice.be.ch/de/start/ueber-uns/schlichtungsbehoerden/bern-mittelland.html') },
  LU: { modus: 'zentral', stelle: A('Schlichtungsbehörde Gleichstellung (administrativ beim Arbeitsgericht)', 'Zentralstrasse 28', '6002 Luzern', 'ganzer Kanton (JusG, SRL 260, § 3 Abs. 1 lit. d)', undefined, 'https://gerichte.lu.ch/organisation/schlichtungsbehoerden/gleichstellung') },
  SZ: { modus: 'zentral', stelle: A('Kantonale Schlichtungsstelle für Diskriminierungsstreitigkeiten im Erwerbsleben', 'c/o Vorsitzende Dr. iur. Stefanie Wiget, RAin, Hauptplatz 7, Postfach 46', '6430 Schwyz', 'ganzer Kanton (KGlG, SRSZ 140.310, § 3 Abs. 1–2)', undefined, 'https://www.sz.ch/kanton/gleichstellung.html/8756-8757-12155') },
  ZG: { modus: 'zentral', stelle: A('Schlichtungsbehörde Arbeitsrecht, c/o Kantonsgerichtskanzlei', 'Aabachstrasse 3', '6300 Zug', 'ganzer Kanton (GOG, BGS 161.1, § 39 Abs. 1)', undefined, 'https://zg.ch/de/gerichte/zivil-und-strafrechtspflege/schlichtungsbehoerden/schlichtungsbehoerde-arbeitsrecht') },
  FR: { modus: 'zentral', stelle: A('Schlichtungskommission für die Gleichstellung der Geschlechter im Erwerbsleben / Commission de conciliation en matière d\'égalité', 'p.A. Büro für die Gleichstellung von Frau und Mann und für Familienfragen (GFB), Rue de la Poste 1', '1700 Freiburg', 'ganzer Kanton (JG, SGF 130.1, Art. 62 Abs. 1)', undefined, 'https://www.fr.ch/de/staat-und-recht/justiz/gerichtsbehoerden-schlichtungskommission-fuer-die-gleichstellung-der-geschlechter-im-erwerbsleben') },
  BL: { modus: 'zentral', stelle: A('Schlichtungsstelle für Diskriminierungsstreitigkeiten im Erwerbsleben (administrativ beim GS der Volkswirtschafts- und Gesundheitsdirektion)', 'Bahnhofstrasse 3', '4410 Liestal', 'ganzer Kanton (EG ZPO, SGS 221, § 2 lit. b)', undefined, 'https://www.baselland.ch/politik-und-behorden/direktionen/volkswirtschafts-und-gesundheitsdirektion/generalsekretariat/aufgaben/schlichtungsstellen/diskriminierung') },
  SH: { modus: 'zentral', stelle: A('Schlichtungsstelle bei Diskriminierungen im Erwerbsleben (Kanzlei beim Kantonsgericht)', 'Vordergasse 54', '8201 Schaffhausen', 'ganzer Kanton (JG, SHR 173.200, Art. 11 Abs. 1)', undefined, 'https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Justiz/Schlichtungsstelle-bei-Diskriminierungen-im-Erwerbsleben-110374-DE.html') },
  AR: { modus: 'zentral', stelle: A('Kantonale Schlichtungsstelle bei Diskriminierung im Erwerbsleben (Sitz beim Kantonsgericht)', 'Landsgemeindeplatz 7c / Fünfeckpalast', '9043 Trogen', 'ganzer Kanton (Justizgesetz, bGS 145.31, Art. 5 Abs. 1 lit. a/c)', undefined, 'https://ar.ch/gerichte/vermittler-und-schlichtungsstellen/schlichtungsstelle-bei-diskriminierung-im-erwerbsleben/') },
  AI: { modus: 'zentral', stelle: A('Schlichtungsstelle Gleichstellung von Frau und Mann (Sekretariat: Volkswirtschaftsdepartement)', 'c/o Departementssekretariat Volkswirtschaft, Marktgasse 2', '9050 Appenzell', 'ganzer Kanton (GOG, GS 173.000, Art. 5 Abs. 2 (Marginalie «Paritätische Schlichtungsstellen»))', undefined, 'https://www.ai.ch/verwaltung/kommissionen/schlichtungsstelle-gleichstellung-von-frau-und-mann') },
  SG: { modus: 'zentral', stelle: A('Schlichtungsstelle für Klagen nach dem Gleichstellungsgesetz', 'Engelgasse 2 / Marktplatz', '9004 St.Gallen', 'ganzer Kanton (EG-ZPO, sGS 961.2, Art. 5)', undefined, 'https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstelle-fuer-klagen-nach-dem-gleichstellungsgesetz.html') },
  GR: { modus: 'zentral', stelle: A('Kantonale Schlichtungsbehörde für Gleichstellungssachen', 'c/o Obergericht, Grabenstrasse 30', '7001 Chur', 'ganzer Kanton (GOG, BR 173.000, Art. 92 Abs. 1)', undefined, 'https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/gleichstellungssachen/') },
  AG: { modus: 'zentral', stelle: A('Schlichtungsstelle für Gleichstellungsfragen', 'Obere Vorstadt 37 (Post: Postfach, 5001 Aarau)', '5000 Aarau', 'ganzer Kanton (EG ZPO, SAR 221.200, § 4 Abs. 1 lit. d)', undefined, 'https://www.ag.ch/de/ueber-uns/gerichte-kanton-aargau/organisation/schlichtungsbehoerden/schlichtungsstelle-fuer-gleichstellungsfragen') },
  TG: { modus: 'zentral', stelle: A('Schlichtungsstelle gemäss Gleichstellungsgesetz (kantonal; Eingaben über das Präsidium — keine eigene Amtsadresse publiziert)', 'Präsidium: Doris Ammann, RAin, Thundorferstrasse 13', '8501 Frauenfeld', 'ganzer Kanton (ZSRG, RB 271.1, § 18)', undefined, 'https://www.tg.ch/regierung/kommissionen/schlichtungsstelle-gemaess-gleichstellungsgesetz-.html/78') },
  TI: { modus: 'zentral', stelle: A('Ufficio di conciliazione in materia di parità dei sessi', 'c/o Segreteria della Divisione della giustizia, Palazzo Governativo', '6500 Bellinzona', 'ganzer Kanton (LACPC, RL/TI 270.100, Art. 6 Abs. 1)', undefined, 'https://www4.ti.ch/poteri/giudiziario/giustizia-civile/la-parita-di-sessi') },
  VS: { modus: 'zentral', stelle: A('Commission cantonale de conciliation pour les litiges relevant de la loi fédérale sur l\'égalité / Kantonale Schlichtungskommission für Streitigkeiten nach dem GlG', 'c/o Service de protection des travailleurs et des relations du travail (SPT/DAA), Rue des Cèdres 5', '1951 Sion', 'ganzer Kanton (Loi cantonale sur le travail, RS/VS 822.1, Art. 32 Abs. 1)', undefined, 'https://www.vs.ch/web/spt/commission-cantonale-de-conciliation-pour-les-litiges-relevant-de-la-leg') },
  GE: { modus: 'zentral', stelle: A('Tribunal des prud\'hommes — Autorité de conciliation', 'Boulevard Helvétique 27 (Post: Case postale 3688, 1211 Genève 3)', '1207 Genève', 'ganzer Kanton (LTPH, RS/GE E 3 10, Art. 11 al. 3)', undefined, 'https://justice.ge.ch/fr/contenu/tribunal-des-prudhommes') },
  JU: { modus: 'zentral', stelle: A('Conseil de prud\'hommes (Präsident:in als autorité de conciliation), beim Tribunal de première instance', 'Chemin du Château 9, Case postale', '2900 Porrentruy 1', 'ganzer Kanton (Loi instituant le Conseil de prud\'hommes, RSJU 182.34, Art. 22)', undefined, 'https://www.jura.ch/JUST/Instances-judiciaires/Tribunal-de-premiere-instance/Conseil-de-prud-hommes/Conseil-de-prud-hommes.html') },
  NE: { modus: 'liste', hinweis: 'Chambre de conciliation in paritätischer GlG-Besetzung (Art. 200 Abs. 2 ZPO)', stellen: NE_TRIBUNAUX },
};

/** Streitwert-Kontext für Kantone, deren ordentliche Schlichtungsinstanz
 *  streitwertabhängig ist (heute nur VD, Art. 41 CDPJ-VD). */
export interface SchlichtungsKontext {
  vermoegensrechtlich: boolean;
  streitwertCHF: number | null;
  /** Arbeitsrechtliche Streitigkeit (inkl. AVG) — in VD eigene Kaskade
   *  über das Tribunal de prud'hommes (Art. 2 LJT-VD). */
  arbeitsrechtlich?: boolean;
  /** SO-Weiche (§ 5 Abs. 1 GO SO): wohnen/sitzen BEIDE Parteien in
   *  derselben Gemeinde? true → Friedensrichter dieser Gemeinde ·
   *  false → Amtsgerichtspräsidium (§ 10 GO) · undefined → unbeantwortet
   *  (ehrliche Weiche-Erklärung, keine Auto-Zuordnung). */
  gleicheGemeinde?: boolean;
}

/** SO: ordentliche Auflösung nach der § 5/§ 10-GO-Weiche (Dossier §39). */
function soOrdentlich(kontext: SchlichtungsKontext | undefined): SchlichtungsAufloesung {
  const FR_URL = 'https://so.ch/gerichte/weitere-gerichte/friedensrichter/';
  if (kontext?.gleicheGemeinde === true) {
    return {
      modus: 'verzeichnis',
      beschreibung: 'Beide Parteien in derselben Gemeinde: Schlichtungsbehörde ist die Friedensrichterin/der Friedensrichter dieser Gemeinde (§ 5 Abs. 1 GO SO) — ein Gemeindeorgan mit Amtssitz in der Wahlgemeinde (§ 86 GO); Anlaufstelle ist die Gemeindeverwaltung, eine Strassenadresse publiziert der Kanton nicht. Kreis-Zusammenschlüsse ändern an der Gleiche-Gemeinde-Voraussetzung nichts. Ausnahmen (§ 5 Abs. 2 GO): ist der Staat oder eine Gemeinde Partei oder geht es um Klagen nach Art. 961/975 ZGB, schlichtet stattdessen das Amtsgerichtspräsidium',
      url: FR_URL,
    };
  }
  if (kontext?.gleicheGemeinde === false) {
    return {
      modus: 'verzeichnis',
      beschreibung: 'Parteien in verschiedenen Gemeinden: Schlichtungsbehörde ist das Amtsgerichtspräsidium des zuständigen Richteramts (§ 10 Abs. 1 GO SO) — PLZ/Gemeinde eingeben für die konkrete Adresse (fünf Richterämter, Amtei-Einteilung nach Art. 43 KV SO)',
      url: 'https://so.ch/gerichte/richteraemter/',
    };
  }
  return {
    modus: 'verzeichnis',
    beschreibung: 'Weiche nach § 5 Abs. 1 GO SO: Wohnen oder sitzen BEIDE Parteien in derselben Gemeinde, schlichtet die Friedensrichterin/der Friedensrichter dieser Gemeinde (Anlaufstelle Gemeindeverwaltung); sonst das Amtsgerichtspräsidium des Richteramts (§ 10 GO). Die Frage oben beantworten für die konkrete Zuordnung',
    url: FR_URL,
  };
}

/** VD: ordentliche Auflösung nach Streitwert-Stufe (Dossier §37). Ohne
 *  bezifferten Streitwert KEINE Stellen-Liste (die pauschale JdP-Liste wäre
 *  ab CHF 10'000 falsch) — stattdessen die Kaskade + amtliche Instanzsuche.
 *  Arbeitsrecht: LJT-Kaskade (prud'hommes ≤ 30'000, Bug-Check 11.6.2026). */
function vdOrdentlich(kontext: SchlichtungsKontext | undefined, jdpListe: SchlichtungsAufloesung): SchlichtungsAufloesung {
  if (kontext?.arbeitsrechtlich) {
    const a = vdArbeitsStufe(kontext.vermoegensrechtlich ? kontext.streitwertCHF : null);
    if (!a) return { modus: 'verzeichnis', beschreibung: VD_KASKADE_TEXT, url: VD_INSTANZSUCHE_URL };
    if (a.instanz === 'prudhommes') return { modus: 'liste', stellen: VD_PRUDHOMMES, hinweis: a.text };
    if (a.instanz === 'chambre_patrimoniale') {
      return { modus: 'zentral', stelle: { ...VD_CHAMBRE_PATRIMONIALE, hinweis: a.text } };
    }
    return { modus: 'liste', stellen: VD_TRIBUNAUX, hinweis: a.text };
  }
  const s = kontext ? vdSchlichtungsStufe(kontext.vermoegensrechtlich, kontext.streitwertCHF) : null;
  if (!s) return { modus: 'verzeichnis', beschreibung: VD_KASKADE_TEXT, url: VD_INSTANZSUCHE_URL };
  if (s.stufe === 'justice_de_paix') {
    return jdpListe.modus === 'liste' ? { ...jdpListe, hinweis: s.text } : jdpListe;
  }
  if (s.stufe === 'chambre_patrimoniale') {
    return { modus: 'zentral', stelle: { ...VD_CHAMBRE_PATRIMONIALE, hinweis: s.text } };
  }
  return { modus: 'liste', stellen: VD_TRIBUNAUX, hinweis: s.text };
}

/** VD-GlG: das Tribunal de prud'hommes ist die GlG-Instanz (Art. 1 Abs. 1
 *  lit. c LJT-VD) — mit Geldbegehren nach der Streitwert-Kaskade (Art. 2
 *  Abs. 1), ohne Geldbegehren streitwertunabhängig (Art. 2 Abs. 2). */
function vdGlg(kontext: SchlichtungsKontext | undefined): SchlichtungsAufloesung {
  const sw = kontext && kontext.vermoegensrechtlich ? kontext.streitwertCHF : null;
  if (sw === null) return { modus: 'liste', stellen: VD_PRUDHOMMES, hinweis: VD_GLG_OHNE_GELD_TEXT };
  return vdOrdentlich({ vermoegensrechtlich: true, streitwertCHF: sw, arbeitsrechtlich: true },
    { modus: 'liste', stellen: VD_PRUDHOMMES });
}

/** Auflösung für Kanton + Behördentyp; GlG fällt mangels eigener Stelle auf
 *  die ordentliche Behörde zurück (mit Hinweis in der UI). Der optionale
 *  Streitwert-Kontext steuert die VD-Stufen-Weiche. */
export function schlichtungAufloesung(kanton: Kanton, typ: SchlichtungsbehoerdeTyp, kontext?: SchlichtungsKontext): {
  aufloesung: SchlichtungsAufloesung; stand: string; quelle: string; glgFallback: boolean; kantonsUrl?: string;
} | null {
  const k = SCHLICHTUNGSSTELLEN[kanton];
  if (!k) return null;
  const ordentlich = kanton === 'VD' ? vdOrdentlich(kontext, k.ordentlich)
    : kanton === 'SO' ? soOrdentlich(kontext)
    : k.ordentlich;
  if (typ === 'paritaetisch_miete' && k.miete) return { aufloesung: k.miete, stand: k.stand, quelle: k.quelle, glgFallback: false, kantonsUrl: k.url };
  if (typ === 'paritaetisch_glg') {
    if (k.glg) return { aufloesung: k.glg, stand: k.stand, quelle: k.quelle, glgFallback: false, kantonsUrl: k.url };
    // VD: GlG ist gesetzlich dem Tribunal de prud'hommes zugewiesen (Art. 1
    // Abs. 1 lit. c LJT-VD) — echte Stelle, kein Fallback-Disclaimer.
    if (kanton === 'VD') return { aufloesung: vdGlg(kontext), stand: k.stand, quelle: k.quelle, glgFallback: false, kantonsUrl: k.url };
    // Vollerhebung 11.6.2026: konkrete GlG-Stellen aller übrigen Kantone.
    const glgStelle = GLG_STELLEN[kanton];
    if (glgStelle) return { aufloesung: glgStelle, stand: '11.6.2026', quelle: 'kantonales Organisationsrecht, wörtlich am amtlichen Erlass (GlG-Vollerhebung 11.6.2026)', glgFallback: false, kantonsUrl: k.url };
    return { aufloesung: ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: true, kantonsUrl: k.url };
  }
  if (typ === 'paritaetisch_miete') return { aufloesung: ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: true, kantonsUrl: k.url };
  return { aufloesung: ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: false, kantonsUrl: k.url };
}
