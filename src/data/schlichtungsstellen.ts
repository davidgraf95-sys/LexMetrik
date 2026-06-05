import type { Kanton } from '../types/legal';
import type { SchlichtungsbehoerdeTyp } from '../lib/zustaendigkeit';

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
}

export type SchlichtungsAufloesung =
  | { modus: 'zentral'; stelle: SchlichtungsAdresse }
  | { modus: 'liste'; stellen: SchlichtungsAdresse[]; hinweis?: string }
  | { modus: 'verzeichnis'; beschreibung: string; url: string };

export interface KantonSchlichtung {
  stand: string;
  quelle: string;
  ordentlich: SchlichtungsAufloesung;
  miete?: SchlichtungsAufloesung;   // paritätische Stelle Miete/Pacht (Art. 200 Abs. 1)
  glg?: SchlichtungsAufloesung;     // paritätische Stelle GlG (Art. 200 Abs. 2)
}

const A = (name: string, strasse: string, plzOrt: string, zustaendigFuer?: string, hinweis?: string): SchlichtungsAdresse =>
  ({ name, strasse, plzOrt, ...(zustaendigFuer ? { zustaendigFuer } : {}), ...(hinweis ? { hinweis } : {}) });

export const SCHLICHTUNGSSTELLEN: Record<Kanton, KantonSchlichtung> = {
  ZH: {
    stand: '5.6.2026', quelle: 'vfzh.ch-Ämterverzeichnis · gerichte-zh.ch · BWO 13.2.2026',
    ordentlich: { modus: 'verzeichnis', beschreibung: '171 kommunale Friedensrichterämter (Auflösung nach Wohnsitzgemeinde der beklagten Partei)', url: 'https://www.vfzh.ch/recht-finden/aemterverzeichnis' },
    miete: {
      modus: 'liste', hinweis: 'je Bezirk eine paritätische Stelle (beim Bezirksgericht)',
      stellen: [
        A('SB Miete Bezirk Zürich', 'Wengistrasse 30', '8004 Zürich', 'Bezirk Zürich', 'seit 9.3.2026 (Rückumzug)'),
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
    glg: { modus: 'zentral', stelle: A('Schlichtungsbehörde nach Gleichstellungsgesetz', 'Wengistrasse 30', '8004 Zürich', 'ganzer Kanton') },
  },
  BE: {
    stand: '5.6.2026', quelle: 'zsg.justice.be.ch (4 Detailseiten)',
    ordentlich: {
      modus: 'liste', hinweis: 'eine regionale Schlichtungsbehörde je Gerichtsregion (Art. 84 GSOG)',
      stellen: [
        A('Schlichtungsbehörde Bern-Mittelland', 'Effingerstrasse 34', '3008 Bern', 'Region Bern-Mittelland'),
        A('Schlichtungsbehörde Berner Jura-Seeland', 'Neuengasse 8', '2502 Biel/Bienne', 'Region Berner Jura-Seeland', 'Antenne Jura bernois: Unionsgasse 13, 2502 Biel (ab 1.1.2026)'),
        A('Schlichtungsbehörde Emmental-Oberaargau', 'Dunantstrasse 3', '3400 Burgdorf', 'Region Emmental-Oberaargau'),
        A('Schlichtungsbehörde Oberland', 'Scheibenstrasse 11B', '3600 Thun', 'Region Oberland'),
      ],
    },
  },
  LU: {
    stand: '5.6.2026', quelle: 'gerichte.lu.ch (Friedensrichter/Kontakt) · BWO 13.2.2026',
    ordentlich: {
      modus: 'liste', hinweis: 'vier Friedensrichterämter (Kreise = Gerichtsbezirke)',
      stellen: [
        A('Friedensrichteramt Luzern', 'Grabenstrasse 2, Postfach 2266', '6002 Luzern', 'Bezirk Luzern'),
        A('Friedensrichteramt Kriens', 'Villastrasse 1', '6010 Kriens', 'Bezirk Kriens'),
        A('Friedensrichteramt Hochdorf', 'Hohenrainstrasse 8', '6280 Hochdorf', 'Bezirk Hochdorf'),
        A('Friedensrichteramt Willisau', 'Menzbergstrasse 16, Postfach', '6130 Willisau', 'Bezirk Willisau'),
      ],
    },
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Miete und Pacht', 'Bahnhofstrasse 22', '6002 Luzern', 'ganzer Kanton') },
  },
  UR: {
    stand: '5.6.2026', quelle: 'ur.ch/gerichte · BWO 13.2.2026',
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde Uri', 'Bahnhofstrasse 43', '6460 Altdorf', 'ganzer Kanton') },
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Uri (Miete/Pacht)', 'Bahnhofstrasse 43', '6460 Altdorf', 'ganzer Kanton') },
  },
  SZ: {
    stand: '5.6.2026', quelle: 'sz.ch/vermittleraemter (amtliche Karte) — Zusammenlegungen laufend',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Vermittlerämter der Gemeinden/Bezirke (mehrere Zusammenlegungen, z. B. Höfe seit 2020; Vollliste amtlich nur als Karte)', url: 'https://www.sz.ch/behoerden/justiz/vermittleraemter.html' },
    miete: { modus: 'verzeichnis', beschreibung: 'sechs Bezirks-Schlichtungsstellen für Miete/Pacht (überwiegend Postfach-Adressen)', url: 'https://www.sz.ch/behoerden/justiz/schlichtungsbehoerden.html' },
  },
  OW: {
    stand: '5.6.2026', quelle: 'ow.ch/gerichte · BWO 13.2.2026 (2. Durchgang: Enetriederstrasse bestätigt)',
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde Obwalden', 'Enetriederstrasse 1', '6060 Sarnen', 'ganzer Kanton') },
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Obwalden (Miete/Pacht)', 'Enetriederstrasse 1', '6060 Sarnen', 'ganzer Kanton') },
  },
  NW: {
    stand: '5.6.2026', quelle: 'nw.ch · BWO 13.2.2026',
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde Nidwalden', 'Rathausplatz 9, Postfach 1244', '6371 Stans', 'ganzer Kanton') },
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Nidwalden (Miete/Pacht)', 'Rathausplatz 9, Postfach 1244', '6371 Stans', 'ganzer Kanton') },
  },
  GL: {
    stand: '5.6.2026', quelle: 'gl.ch/rechtspflege · BWO 13.2.2026',
    ordentlich: { modus: 'zentral', stelle: A('Kantonale Schlichtungsbehörde Glarus', 'Gerichtshausstrasse 22', '8750 Glarus', 'ganzer Kanton (seit 1.7.2018)') },
    miete: { modus: 'zentral', stelle: A('Kantonale Schlichtungsbehörde Glarus (Miete/Pacht)', 'Gerichtshausstrasse 22, Postfach', '8750 Glarus', 'ganzer Kanton') },
  },
  ZG: {
    stand: '5.6.2026', quelle: 'zg.ch/schlichtungsbehoerden (11 Ämter) · BWO 13.2.2026',
    ordentlich: { modus: 'verzeichnis', beschreibung: '11 kommunale Friedensrichterämter (je Einwohnergemeinde)', url: 'https://zg.ch/de/recht-justiz/zivilverfahren/schlichtung' },
    miete: { modus: 'zentral', stelle: A('Schlichtungsbehörde Miet- und Pachtrecht', 'Baarerstrasse 131', '6300 Zug', 'ganzer Kanton', 'PLZ amtlich 6300 (Postfach-Zeile 6301)') },
  },
  FR: {
    stand: '5.6.2026', quelle: 'fr.ch (Friedensgerichte/Mietkommissionen)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'sieben Friedensgerichte (justices de paix) als Schlichtungsbehörde — je Bezirk', url: 'https://www.fr.ch/de/sjd/institutionen-und-politische-rechte/gerichtsbehoerden/die-friedensgerichte' },
    miete: { modus: 'verzeichnis', beschreibung: 'Schlichtungskommissionen für Miete/Pacht (je Bezirk)', url: 'https://www.fr.ch/de/wohnungswesen/mietrecht' },
  },
  SO: {
    stand: '5.6.2026', quelle: 'so.ch (Friedensrichter/Oberämter)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Friedensrichter der Gemeinden (teils zusammengelegte Kreise; zentrale Liste nur für 10 Kreise)', url: 'https://so.ch/gerichte/weitere-gerichte/friedensrichter/' },
    miete: {
      modus: 'liste', hinweis: 'Mietschlichtung bei den vier Oberämtern',
      stellen: [
        A('Oberamt Region Solothurn', 'Rötistrasse 4', '4500 Solothurn', 'Region Solothurn'),
        A('Oberamt Region Olten', 'Amthausquai 23', '4600 Olten', 'Region Olten'),
        A('Oberamt Thal-Gäu', 'Wengimattstrasse 2', '4710 Balsthal', 'Thal-Gäu'),
        A('Oberamt Dorneck-Thierstein', 'Passwangstrasse 29', '4226 Breitenbach', 'Dorneck-Thierstein'),
      ],
    },
  },
  BS: {
    // Adress-Stammdaten kommen aus behoerden.ts (abgenommen) — dieser Eintrag
    // dient nur der Vollständigkeit der Schicht (gleiches Verhalten wie heute).
    stand: '5.6.2026', quelle: 'staatskalender.bs.ch (abgenommene Stammdaten in behoerden.ts)',
    ordentlich: { modus: 'zentral', stelle: A('Schlichtungsbehörde des Zivilgerichts', 'Bäumleingasse 5', '4001 Basel', 'ganzer Kanton') },
    miete: { modus: 'zentral', stelle: A('Staatliche Schlichtungsstelle für Mietstreitigkeiten', 'Grenzacherstrasse 62', '4005 Basel', 'ganzer Kanton') },
    glg: { modus: 'zentral', stelle: A('Kantonale Schlichtungsstelle für Diskriminierungsfragen', 'Grenzacherstrasse 62', '4005 Basel', 'ganzer Kanton') },
  },
  BL: {
    stand: '5.6.2026', quelle: 'baselland.ch (Friedensrichter) · VGD/oslvb.bl.ch + BWO (Miete, Schiedsrichter-Entscheid)',
    ordentlich: { modus: 'verzeichnis', beschreibung: '15 Friedensrichterkreise (Amt bei der jeweiligen Gemeindeverwaltung)', url: 'https://www.baselland.ch/politik-und-behorden/gerichte/friedensrichter-innen' },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Mietangelegenheiten', 'Rheinstrasse 16', '4410 Liestal', 'ganzer Kanton', 'zweifach entschieden (frühere Angaben Bahnhofstrasse 3/5 überholt)') },
  },
  SH: {
    stand: '5.6.2026', quelle: 'sh.ch · BWO 13.2.2026 (Zentralisierung per 1.1.2018)',
    ordentlich: { modus: 'zentral', stelle: A('Friedensrichteramt des Kantons Schaffhausen', 'Vordergasse 54', '8201 Schaffhausen', 'ganzer Kanton', 'Adress-Vorbehalt: neuere Treffer nennen Fronwagplatz 24 — vor Einreichung auf sh.ch prüfen') },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Mietsachen', 'Vordergasse 54', '8201 Schaffhausen', 'ganzer Kanton') },
  },
  AR: {
    stand: '5.6.2026', quelle: 'ar.ch/gerichte (Vermittler/Schlichtungsstellen)',
    ordentlich: {
      modus: 'liste', hinweis: 'drei Vermittlerkreise',
      stellen: [
        A('Vermittleramt Kreis 1', 'Regierungsgebäude, Obstmarkt 3', '9100 Herisau', 'Kreis 1 (Hinterland; Postfach-PLZ 9102)'),
        A('Vermittleramt Kreise 2 und 3', 'Rathaus, Landsgemeindeplatz 2', '9043 Trogen', 'Kreise 2/3 (Mittel-/Vorderland)'),
      ],
    },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Miete und nichtlandwirtschaftliche Pacht', 'Landsgemeindeplatz 7c', '9043 Trogen', 'ganzer Kanton') },
  },
  AI: {
    stand: '5.6.2026', quelle: 'ai.ch (via amtliche Erlasssammlung/Staatskalender; Portal blockt Direktabruf)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'fünf Bezirks-Vermittler (Appenzell, Schwende-Rüte, Schlatt-Haslen, Gonten, Oberegg)', url: 'https://www.ai.ch/gerichte/vermittler' },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Mietverhältnisse (Sekretariat)', 'c/o Ratskanzlei, Marktgasse 2', '9050 Appenzell', 'beide Landesteile') },
  },
  SG: {
    stand: '5.6.2026', quelle: 'sg.ch (Vermittlungsämter/Mietschlichtung) — 2. Durchgang: alle Adressen bestätigt',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'zehn Vermittlungsämter (je Vermittlungskreis)', url: 'https://www.sg.ch/recht/zivilrecht-strafrecht-zivilprozess-strafprozess/schlichtungsverfahren/vermittlungsaemter.html' },
    miete: { modus: 'verzeichnis', beschreibung: 'sieben Schlichtungsstellen für Miet- und Pachtverhältnisse', url: 'https://www.sg.ch/recht/zivilrecht-strafrecht-zivilprozess-strafprozess/schlichtungsverfahren/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html' },
  },
  GR: {
    stand: '5.6.2026', quelle: 'justiz-gr.ch (Vermittlerämter/Mietsachen) — 11/11 bestätigt',
    ordentlich: {
      modus: 'liste', hinweis: 'ein Vermittleramt je Region (GOG GR Art. 85 ff.)',
      stellen: [
        A('Vermittleramt Plessur', 'Bärenloch 1, Postfach 290', '7001 Chur', 'Region Plessur'),
        A('Vermittleramt Imboden', 'Postfach 308', '7001 Chur', 'Region Imboden'),
        A('Vermittleramt Landquart', 'Bahnhofplatz 2b, Postfach 244', '7302 Landquart', 'Region Landquart'),
        A('Vermittleramt Prättigau/Davos', 'Postfach 125', '7250 Klosters', 'Region Prättigau/Davos'),
        A('Vermittleramt Albula', 'Stradung 26', '7450 Tiefencastel', 'Region Albula'),
        A('Vermittleramt Viamala', 'Untere Gasse 1', '7430 Thusis', 'Region Viamala'),
        A('Vermittleramt Surselva', 'Via Centrala 4', '7130 Ilanz/Glion', 'Region Surselva'),
        A('Vermittleramt Engiadina Bassa/Val Müstair', 'Saglina 22', '7554 Sent', 'Region EB/VM'),
        A('Vermittleramt Maloja', 'Plazza da Scoula 16, Postfach 83', '7500 St. Moritz', 'Region Maloja'),
        A('Vermittleramt Bernina', 'Via da la Pesa 8', '7742 Poschiavo', 'Region Bernina'),
        A('Vermittleramt Moesa', 'Al Giardinètt 2', '6535 Roveredo', 'Region Moesa'),
      ],
    },
    miete: { modus: 'verzeichnis', beschreibung: 'Schlichtungsbehörden für Mietsachen je Region (beim Regionalgericht)', url: 'https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/mietsachen/' },
  },
  AG: {
    stand: '5.6.2026', quelle: 'ag.ch (Friedensrichterkreise/Mietschlichtung nach Bezirken)',
    ordentlich: { modus: 'verzeichnis', beschreibung: '17 Friedensrichterkreise (Auflösung nach Gemeinde)', url: 'https://www.ag.ch/de/verwaltung/dvi/gerichte/friedensrichter' },
    miete: { modus: 'verzeichnis', beschreibung: '11 Schlichtungsbehörden für Miete und Pacht (je Bezirk)', url: 'https://www.ag.ch/de/verwaltung/dvi/gerichte/schlichtungsbehoerden-fuer-miete-und-pacht' },
  },
  TG: {
    stand: '5.6.2026', quelle: 'friedensrichteraemter.tg.ch · erechtsverkehr.tg.ch (Miete kommunal)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'fünf Friedensrichterämter (je Bezirk: Arbon, Frauenfeld, Kreuzlingen, Münchwilen, Weinfelden)', url: 'https://friedensrichteraemter.tg.ch' },
    miete: { modus: 'verzeichnis', beschreibung: 'kommunale Schlichtungsbehörden in Mietsachen (je politische Gemeinde — TG-Sonderfall)', url: 'https://erechtsverkehr.tg.ch/schlichtungsbehoerden-in-mietsachen.html' },
  },
  TI: {
    stand: '5.6.2026', quelle: 'ti.ch (giudici di pace; locazione — 11 Uffici, Schiedsrichter-Entscheid inkl. Chiasso)',
    ordentlich: { modus: 'verzeichnis', beschreibung: '38 Giudicature di pace (je Circolo; Art. 28 f. LOG)', url: 'https://www4.ti.ch/poteri/giudiziario/giustizia-civile/giudici-di-pace' },
    miete: {
      modus: 'liste', hinweis: '11 Uffici di conciliazione in materia di locazione',
      stellen: [
        A('Ufficio di conciliazione Chiasso', 'Piazza Bernasconi 1', '6830 Chiasso', 'Chiasso/Balerna/Breggia/Coldrerio/Morbio Inf./Vacallo'),
        A('Ufficio di conciliazione Mendrisio', 'Via Municipio 13', '6850 Mendrisio', 'Mendrisiotto (übrige)'),
        A('Ufficio di conciliazione Lugano (Est/Ovest)', 'Via Sala 13', '6963 Pregassona', 'Lugano'),
        A('Ufficio di conciliazione Agno', 'Piazza Colonnello Vicari 1', '6982 Agno', 'Malcantone'),
        A('Ufficio di conciliazione Massagno', 'Via Motta 53', '6900 Massagno', 'Massagno/Umgebung'),
        A('Ufficio di conciliazione Locarno', 'Via Trevani 1a', '6600 Locarno', 'Locarnese'),
        A('Ufficio di conciliazione Minusio', 'Via San Gottardo 60, CP 1670', '6648 Minusio', 'Minusio/Umgebung'),
        A('Ufficio di conciliazione Bellinzona', 'Via Lugano 1, CP 2694', '6501 Bellinzona', 'Bellinzona'),
        A('Ufficio di conciliazione Giubiasco', 'Piazza Grande 3', '6512 Giubiasco', 'Giubiasco/Umgebung'),
        A('Ufficio di conciliazione Biasca', 'Via Lucomagno 14', '6710 Biasca', 'Tre Valli'),
      ],
    },
  },
  VD: {
    stand: '5.6.2026', quelle: 'vd.ch/ojv (justices de paix — alle 9 amtlich; Miete: 10 commissions préfectorales)',
    ordentlich: {
      modus: 'liste', hinweis: 'neun Justices de paix (Friedensgerichte) als Schlichtungsbehörde',
      stellen: [
        A('Justice de paix Lausanne', 'Côtes-de-Montbenon 8', '1014 Lausanne', 'District Lausanne'),
        A('Justice de paix Ouest lausannois', 'Av. de Longemalle 1', '1020 Renens', 'Ouest lausannois'),
        A('Justice de paix Morges', 'Rue Saint-Louis 2', '1110 Morges', 'District Morges'),
        A('Justice de paix Nyon', 'Rue Jules-Gachet 5', '1260 Nyon', 'District Nyon'),
        A('Justice de paix Aigle', 'Hôtel de Ville, Place du Marché 1', '1860 Aigle', 'District Aigle', 'Umzug 2025'),
        A('Justice de paix Riviera', 'Rue du Musée 6', '1800 Vevey', 'Riviera–Pays-d’Enhaut'),
        A('Justice de paix Lavaux-Oron', 'Rue Davel 9', '1096 Cully', 'Lavaux-Oron'),
        A('Justice de paix Broye-Vully', 'Rue de la Gare 45', '1530 Payerne', 'Broye-Vully'),
        A('Justice de paix Jura-Nord vaudois/Gros-de-Vaud', 'Rue des Moulins 10', '1400 Yverdon-les-Bains', 'JNV + Gros-de-Vaud'),
      ],
    },
    miete: { modus: 'verzeichnis', beschreibung: '10 Commissions préfectorales de conciliation (eine je District)', url: 'https://www.vd.ch/etat-droit-finances/communes-et-districts/prefectures/commissions-prefectorales-de-conciliation' },
  },
  VS: {
    stand: '5.6.2026', quelle: 'vs.ch (Liste juges de commune; SICT bail à loyer)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Juge de commune je Gemeinde (122 Gemeinden; Anlaufstelle = Gemeindeverwaltung)', url: 'https://www.vs.ch/web/tribunaux/liste-de-juges-et-vice-juges-de-commune' },
    miete: { modus: 'zentral', stelle: A('Commission cantonale de conciliation en matière de bail à loyer', 'Av. du Midi 7', '1950 Sion', 'ganzer Kanton', 'PLZ 1951 ebenfalls amtlich in Gebrauch') },
  },
  NE: {
    stand: '5.6.2026', quelle: 'ne.ch/PJNE (Chambre de conciliation, 3 Standorte; in Bail-Sachen paritätisch besetzt)',
    ordentlich: {
      modus: 'liste', hinweis: 'Chambre de conciliation der zwei Regionalgerichte (drei Standorte)',
      stellen: [
        A('Tribunal régional Littoral/Val-de-Travers', 'Rue de l’Hôtel-de-Ville 2 (CP 1)', '2000 Neuchâtel', 'Littoral/Val-de-Travers'),
        A('Tribunal régional Littoral/Val-de-Travers (Boudry)', 'Rue Louis-Favre 39, CP 36', '2017 Boudry', 'Littoral/Val-de-Travers'),
        A('Tribunal régional Montagnes/Val-de-Ruz', 'Av. Léopold-Robert 10, CP 2284', '2300 La Chaux-de-Fonds', 'Montagnes/Val-de-Ruz', 'Umzug auf Nr. 63 im Sommer 2026 angekündigt'),
      ],
    },
  },
  GE: {
    stand: '5.6.2026', quelle: 'justice.ge.ch (TPI/Commission baux — Rue de l’Athénée bestätigt)',
    ordentlich: { modus: 'zentral', stelle: A('Tribunal de première instance (conciliation)', 'Rue de l’Athénée 6-8', '1205 Genève', 'ganzer Kanton') },
    miete: { modus: 'zentral', stelle: A('Commission de conciliation en matière de baux et loyers', 'Rue de l’Athénée 6-8', '1205 Genève', 'ganzer Kanton') },
  },
  JU: {
    stand: '5.6.2026', quelle: 'jura.ch/JUST (TPI; Droit du bail — 3 Bezirkskommissionen)',
    ordentlich: { modus: 'zentral', stelle: A('Juge civil, Tribunal de première instance', 'Le Château, Chemin du Château 9', '2900 Porrentruy', 'ganzer Kanton') },
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

/** Auflösung für Kanton + Behördentyp; GlG fällt mangels eigener Stelle auf
 *  die ordentliche Behörde zurück (mit Hinweis in der UI). */
export function schlichtungAufloesung(kanton: Kanton, typ: SchlichtungsbehoerdeTyp): {
  aufloesung: SchlichtungsAufloesung; stand: string; quelle: string; glgFallback: boolean;
} | null {
  const k = SCHLICHTUNGSSTELLEN[kanton];
  if (!k) return null;
  if (typ === 'paritaetisch_miete' && k.miete) return { aufloesung: k.miete, stand: k.stand, quelle: k.quelle, glgFallback: false };
  if (typ === 'paritaetisch_glg') {
    if (k.glg) return { aufloesung: k.glg, stand: k.stand, quelle: k.quelle, glgFallback: false };
    return { aufloesung: k.ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: true };
  }
  if (typ === 'paritaetisch_miete') return { aufloesung: k.ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: true };
  return { aufloesung: k.ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: false };
}
