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
    stand: '5.6.2026', quelle: 'sz.ch/vermittleraemter (amtliche Karte) — Zusammenlegungen laufend',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Vermittlerämter der Gemeinden/Bezirke (mehrere Zusammenlegungen, z. B. Höfe seit 2020; Vollliste amtlich nur als Karte)', url: 'https://www.sz.ch/behoerden/justiz/vermittleraemter.html/8756-8758-8801-12287' },
    miete: { modus: 'verzeichnis', beschreibung: 'sechs Bezirks-Schlichtungsstellen für Miete/Pacht (überwiegend Postfach-Adressen)', url: 'https://www.sz.ch/verwaltung/volkswirtschaftsdepartement/departementssekretariat/miete-und-pacht/schlichtungsbehoerden.html/8756-8758-8802-10373-10393-10887-10888' },
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
    stand: '5.6.2026', quelle: 'fr.ch (Friedensgerichte/Mietkommissionen)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'sieben Friedensgerichte (justices de paix) als Schlichtungsbehörde — je Bezirk', url: 'https://www.fr.ch/de/staat-und-recht/justiz/gerichtsbehoerden-friedensgerichte' },
    miete: { modus: 'verzeichnis', beschreibung: 'Schlichtungskommissionen für Miete/Pacht (je Bezirk)', url: 'https://www.fr.ch/de/staat-und-recht/justiz/gerichtsbehoerden-friedensgerichte' },
  },
  SO: {
    stand: '5.6.2026', quelle: 'so.ch (Friedensrichter/Oberämter)',
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
    stand: '5.6.2026', quelle: 'ai.ch (via amtliche Erlasssammlung/Staatskalender; Portal blockt Direktabruf)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'fünf Bezirks-Vermittler (Appenzell, Schwende-Rüte, Schlatt-Haslen, Gonten, Oberegg)', url: 'https://www.ai.ch/gerichte/vermittler' },
    miete: { modus: 'zentral', stelle: A('Schlichtungsstelle für Mietverhältnisse (Sekretariat)', 'c/o Ratskanzlei, Marktgasse 2', '9050 Appenzell', 'beide Landesteile') },
  },
  SG: {
    stand: '5.6.2026', quelle: 'sg.ch (Vermittlungsämter/Mietschlichtung) — 2. Durchgang: alle Adressen bestätigt',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'zehn Vermittlungsämter (je Vermittlungskreis)', url: 'https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/vermittlungsaemter.html' },
    miete: { modus: 'verzeichnis', beschreibung: 'sieben Schlichtungsstellen für Miet- und Pachtverhältnisse', url: 'https://www.sg.ch/recht/gerichte/organisation---standorte/schlichtungsstellen-und-vermittlungsaemter/schlichtungsstellen-fuer-miet--und-pachtverhaeltnisse.html' },
  },
  GR: {
    stand: '5.6.2026', quelle: 'justiz-gr.ch (Vermittlerämter/Mietsachen) — 11/11 bestätigt',
    // url aus schlichtungsbehoerden-ti-vs-gr-vollerfassung.md (Stand 5.6.2026):
    // kantonale Verzeichnisseite der Vermittlerämter (keine Stellen-Detailseiten belegt)
    url: 'https://www.justiz-gr.ch/schlichtungsbehoerden-und-mediation/ueber-uns/vermittleraemter/',
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
    ordentlich: { modus: 'verzeichnis', beschreibung: '17 Friedensrichterkreise (Auflösung nach Gemeinde)', url: 'https://www.ag.ch/de/gerichte/schlichtungsbehoerden/friedensrichterinnen-und-friedensrichter/friedensrichterkreise' },
    miete: { modus: 'verzeichnis', beschreibung: '11 Schlichtungsbehörden für Miete und Pacht (je Bezirk)', url: 'https://www.ag.ch/de/ueber-uns/gerichte-kanton-aargau/organisation/schlichtungsbehoerden/schlichtungsbehoerden-fuer-miete-und-pacht' },
  },
  TG: {
    stand: '5.6.2026', quelle: 'friedensrichteraemter.tg.ch · erechtsverkehr.tg.ch (Miete kommunal)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'fünf Friedensrichterämter (je Bezirk: Arbon, Frauenfeld, Kreuzlingen, Münchwilen, Weinfelden)', url: 'https://friedensrichteraemter.tg.ch' },
    miete: { modus: 'verzeichnis', beschreibung: 'kommunale Schlichtungsbehörden in Mietsachen (je politische Gemeinde — TG-Sonderfall)', url: 'https://erechtsverkehr.tg.ch/schlichtungsbehoerden-in-mietsachen.html/7980' },
  },
  TI: {
    stand: '5.6.2026', quelle: 'ti.ch (giudici di pace; locazione — 11 Uffici, Schiedsrichter-Entscheid inkl. Chiasso)',
    ordentlich: { modus: 'verzeichnis', beschreibung: '38 Giudicature di pace (je Circolo; Art. 28 f. LOG)', url: 'https://www4.ti.ch/poteri/giudiziario/giustizia-civile/giudici-di-pace' },
    miete: {
      modus: 'liste', hinweis: '11 Uffici di conciliazione in materia di locazione',
      stellen: [
        A('Ufficio di conciliazione Chiasso', 'Piazza Bernasconi 1', '6830 Chiasso', 'Chiasso/Balerna/Breggia/Coldrerio/Morbio Inf./Vacallo'),
        // url aus schlichtungsbehoerden-ti-vs-gr-vollerfassung.md (Stand 5.6.2026)
        A('Ufficio di conciliazione Mendrisio', 'Via Municipio 13', '6850 Mendrisio', 'Mendrisiotto (übrige)', undefined, 'https://mendrisio.ch/en/home/a-proposito-di-mendrisio/chi-siamo/dicasteri-e-uffici/dicastero-istituzioni-e-risorse/ufficio-conciliazione.html'),
        // url aus schlichtungsbehoerden-ti-vs-gr-vollerfassung.md (Stand 5.6.2026)
        A('Ufficio di conciliazione Lugano (Est/Ovest)', 'Via Sala 13', '6963 Pregassona', 'Lugano', undefined, 'https://www.lugano.ch/la-mia-citta/sportelli-in-citta/ufficio-conciliazione/'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — amtliche Comune-Seite (nennt Stelle; dort Adresse Contrada Nuova 3)
        A('Ufficio di conciliazione Agno', 'Piazza Colonnello Vicari 1', '6982 Agno', 'Malcantone', undefined, 'https://www.agno.ch/index.php?node=395&lng=1&vis=1&rif=2392173537'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — amtliche Comune-Seite
        A('Ufficio di conciliazione Massagno', 'Via Motta 53', '6900 Massagno', 'Massagno/Umgebung', undefined, 'https://www.massagno.ch/Ufficio-conciliazione-in-materia-di-locazione'),
        // url aus schlichtungsbehoerden-ti-vs-gr-vollerfassung.md (Stand 5.6.2026)
        A('Ufficio di conciliazione Locarno', 'Via Trevani 1a', '6600 Locarno', 'Locarnese', undefined, 'https://www.locarno.ch/it/ufficio-conciliazione-in-materia-di-locazione'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — amtliche Comune-Seite
        A('Ufficio di conciliazione Minusio', 'Via San Gottardo 60, CP 1670', '6648 Minusio', 'Minusio/Umgebung', undefined, 'https://www.minusio.ch/uc'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — amtliche Comune-Seite Bellinzona (führt Uffici Nr. 9/10/11)
        A('Ufficio di conciliazione Bellinzona', 'Via Lugano 1, CP 2694', '6501 Bellinzona', 'Bellinzona', undefined, 'https://www.bellinzona.ch/Ufficio-di-conciliazione-c0723c00'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — dieselbe Bellinzona-Seite führt Ufficio Nr. 10 Giubiasco
        A('Ufficio di conciliazione Giubiasco', 'Piazza Grande 3', '6512 Giubiasco', 'Giubiasco/Umgebung', undefined, 'https://www.bellinzona.ch/Ufficio-di-conciliazione-c0723c00'),
        // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — dieselbe Bellinzona-Seite führt Ufficio Nr. 11 Biasca
        A('Ufficio di conciliazione Biasca', 'Via Lucomagno 14', '6710 Biasca', 'Tre Valli', undefined, 'https://www.bellinzona.ch/Ufficio-di-conciliazione-c0723c00'),
      ],
    },
  },
  VD: {
    stand: '5.6.2026', quelle: 'vd.ch/ojv (justices de paix — alle 9 amtlich; Miete: 10 commissions préfectorales)',
    ordentlich: {
      modus: 'liste', hinweis: 'neun Justices de paix (Friedensgerichte) als Schlichtungsbehörde',
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
        A('Justice de paix Jura-Nord vaudois/Gros-de-Vaud', 'Rue des Moulins 10', '1400 Yverdon-les-Bains', 'JNV + Gros-de-Vaud', undefined, 'https://www.vd.ch/ojv/justices-de-paix/jura-nord-vaudois-et-gros-de-vaud'),
      ],
    },
    miete: { modus: 'verzeichnis', beschreibung: '10 Commissions préfectorales de conciliation (eine je District)', url: 'https://www.vd.ch/etat-droit-finances/districts-/-prefectures/prefectures/prestations-des-prefectures/commissions-prefectorales-de-conciliation' },
  },
  VS: {
    stand: '5.6.2026', quelle: 'vs.ch (Liste juges de commune; SICT bail à loyer)',
    ordentlich: { modus: 'verzeichnis', beschreibung: 'Juge de commune je Gemeinde (122 Gemeinden; Anlaufstelle = Gemeindeverwaltung)', url: 'https://www.vs.ch/web/tribunaux/liste-de-juges-et-vice-juges-de-commune' },
    // url aus schlichtungsbehoerden-ti-vs-gr-vollerfassung.md (Stand 5.6.2026)
    miete: { modus: 'zentral', stelle: A('Commission cantonale de conciliation en matière de bail à loyer', 'Av. du Midi 7', '1950 Sion', 'ganzer Kanton', 'PLZ 1951 ebenfalls amtlich in Gebrauch', 'https://www.vs.ch/en-GB/web/sict/bail-a-loyer') },
  },
  NE: {
    stand: '5.6.2026', quelle: 'ne.ch/PJNE (Chambre de conciliation, 3 Standorte; in Bail-Sachen paritätisch besetzt)',
    // url: Erstrecherche 6.6.2026 (WebFetch verifiziert) — PJNE-Übersicht der Tribunaux régionaux
    // nennt alle drei Standorte (Neuchâtel, Boudry, La Chaux-de-Fonds) mit Adressen; keine
    // Stellen-Detailseiten je Tribunal → Kantons-Fallback.
    url: 'https://www.ne.ch/autorites/PJNE/tribunaux-regionaux/Pages/accueil.aspx',
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

/** Auflösung für Kanton + Behördentyp; GlG fällt mangels eigener Stelle auf
 *  die ordentliche Behörde zurück (mit Hinweis in der UI). */
export function schlichtungAufloesung(kanton: Kanton, typ: SchlichtungsbehoerdeTyp): {
  aufloesung: SchlichtungsAufloesung; stand: string; quelle: string; glgFallback: boolean; kantonsUrl?: string;
} | null {
  const k = SCHLICHTUNGSSTELLEN[kanton];
  if (!k) return null;
  if (typ === 'paritaetisch_miete' && k.miete) return { aufloesung: k.miete, stand: k.stand, quelle: k.quelle, glgFallback: false, kantonsUrl: k.url };
  if (typ === 'paritaetisch_glg') {
    if (k.glg) return { aufloesung: k.glg, stand: k.stand, quelle: k.quelle, glgFallback: false, kantonsUrl: k.url };
    return { aufloesung: k.ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: true, kantonsUrl: k.url };
  }
  if (typ === 'paritaetisch_miete') return { aufloesung: k.ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: true, kantonsUrl: k.url };
  return { aufloesung: k.ordentlich, stand: k.stand, quelle: k.quelle, glgFallback: false, kantonsUrl: k.url };
}
