import type { Kanton } from '../types/legal';

// ─── Erstinstanzliche Zivilgerichte aller Kantone (Adressat-Auflösung) ──────
// Auftrag David 10.6.2026: «vereinfachte Klage … sodass es alle Kantone
// abbildet». Quelle: bibliothek/behoerden/gerichtsbehoerden-kantone.md
// (Master-Liste, zweifach geprüft: Erstrecherche + adversarialer Durchgang
// 5./6.6.2026) und gerichtsadressen-erstliste.md (Verifikationsverdikte —
// massgeblich sind die dort als «amtlich korrekt» ausgewiesenen Adressen).
// FACHLICHE ABNAHME DURCH DAVID AUSSTEHEND — die UI legt das offen (§8).
//
// Muster wie schlichtungsstellen.ts (§10): zentral (Einheitsgericht, Adresse
// direkt) · liste (mehrere Gerichte, Wahl nach örtlicher Zuständigkeit beim
// Nutzer) · verzeichnis (amtliche Übersicht verlinkt, Adresse von Hand).
// Die örtliche Zuordnung Gemeinde→Gerichtskreis ist NICHT abgebildet
// (eigener Arbeitsgang; vgl. Betreibungskreise) — die Wahl trifft die
// Nutzerin anhand des Forums.
//
// BS läuft NICHT hierüber: KV_GERICHTE_BS in lib/vorlagen/klageVereinfacht.ts
// ist abgenommene Stammdate («verified true», Auftrag David) und hat Vorrang
// (§5). Der BS-Eintrag hier dient nur der Vollständigkeit der Schicht.

export interface GerichtsAdresse {
  name: string;
  strasse: string;
  plzOrt: string;
  /** Bei 'liste': Gerichtskreis/Bezirk, für den dieses Gericht zuständig ist. */
  zustaendigFuer?: string;
  hinweis?: string;
  /** Amtliche Detailseite DIESES Gerichts (nur https, verifiziert). */
  url?: string;
}

export type GerichtsAufloesung =
  | { modus: 'zentral'; stelle: GerichtsAdresse }
  | { modus: 'liste'; gerichte: GerichtsAdresse[]; hinweis?: string }
  | { modus: 'verzeichnis'; beschreibung: string; url: string };

export interface KantonZivilgerichteErstinstanz {
  stand: string;
  quelle: string;
  /** Amtliche Übersichtsseite der Erstinstanzen (Link-Fallback, nur https). */
  url?: string;
  erstinstanz: GerichtsAufloesung;
  /** Belegte Sonderwege je Materie (nur wo das Dossier sie ausweist) —
   *  reine Hinweis-Texte für die UI, KEIN automatisches Routing (§1/§8). */
  hinweisArbeit?: string;
  hinweisMiete?: string;
}

const Q_MASTER = 'gerichtsbehoerden-kantone.md (zweifach geprüft 5./6.6.2026)';
const Q_ERSTLISTE = 'gerichtsadressen-erstliste.md (amtlich verifiziert 5.6.2026)';

export const ZIVILGERICHTE_ERSTINSTANZ: Record<Kanton, KantonZivilgerichteErstinstanz> = {
  ZH: {
    stand: '10.6.2026', quelle: 'gerichte-zh.ch (Direkt-Abruf 10.6.2026; Nachtrag in gerichtsbehoerden-kantone.md)',
    url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte',
    // Alle 12 Bezirksgerichte amtlich verifiziert. BG Zürich: Briefpost
    // einheitlich «Postfach, 8036 Zürich» für alle Abteilungen — als
    // Eingabe-Adresse massgeblich (Badenerstrasse 90 = Paket/Standort).
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-zuerich', name: 'Bezirksgericht Zürich', strasse: 'Postfach', plzOrt: '8036 Zürich', zustaendigFuer: 'Bezirk Zürich', hinweis: 'Briefpost für alle Abteilungen; Paket/Standort: Badenerstrasse 90, 8004 Zürich' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-affoltern', name: 'Bezirksgericht Affoltern', strasse: 'Im Grund 15', plzOrt: '8910 Affoltern am Albis', zustaendigFuer: 'Bezirk Affoltern' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-andelfingen', name: 'Bezirksgericht Andelfingen', strasse: 'Thurtalstrasse 1, Postfach', plzOrt: '8450 Andelfingen', zustaendigFuer: 'Bezirk Andelfingen' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-buelach', name: 'Bezirksgericht Bülach', strasse: 'Spitalstrasse 13, Postfach', plzOrt: '8180 Bülach', zustaendigFuer: 'Bezirk Bülach' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-dielsdorf', name: 'Bezirksgericht Dielsdorf', strasse: 'Spitalstrasse 7', plzOrt: '8157 Dielsdorf', zustaendigFuer: 'Bezirk Dielsdorf' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-dietikon', name: 'Bezirksgericht Dietikon', strasse: 'Bahnhofplatz 10, Postfach', plzOrt: '8953 Dietikon', zustaendigFuer: 'Bezirk Dietikon' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-hinwil', name: 'Bezirksgericht Hinwil', strasse: 'Gerichtshausstrasse 12', plzOrt: '8340 Hinwil', zustaendigFuer: 'Bezirk Hinwil', hinweis: 'Neubau bis ~April 2028 — Adresse bleibt gültig' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-horgen', name: 'Bezirksgericht Horgen', strasse: 'Burghaldenstrasse 3', plzOrt: '8810 Horgen', zustaendigFuer: 'Bezirk Horgen' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-meilen', name: 'Bezirksgericht Meilen', strasse: 'Untere Bruech 139/140, Postfach', plzOrt: '8706 Meilen', zustaendigFuer: 'Bezirk Meilen' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-pfaeffikon', name: 'Bezirksgericht Pfäffikon', strasse: 'Hörnlistrasse 55', plzOrt: '8330 Pfäffikon ZH', zustaendigFuer: 'Bezirk Pfäffikon' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-uster', name: 'Bezirksgericht Uster', strasse: 'Gerichtsstrasse 17', plzOrt: '8610 Uster', zustaendigFuer: 'Bezirk Uster' },
        { url: 'https://www.gerichte-zh.ch/de/organisation/bezirksgerichte/bezirksgericht-winterthur', name: 'Bezirksgericht Winterthur', strasse: 'Lindstrasse 10', plzOrt: '8400 Winterthur', zustaendigFuer: 'Bezirk Winterthur' },
      ],
    },
    hinweisArbeit: 'Arbeitsgericht am Bezirksgericht (§§ 15, 20, 25 GOG ZH; Einzelgericht bis CHF 30’000) — Eingabe an das Arbeitsgericht des zuständigen Bezirks.',
    hinweisMiete: 'Mietgericht am Bezirksgericht (§§ 16, 21, 26 GOG ZH) — Eingabe an das Mietgericht des zuständigen Bezirks (Stadt Zürich: eigener Standort).',
  },
  BE: {
    stand: '5.6.2026', quelle: Q_ERSTLISTE,
    url: 'https://www.zsg.justice.be.ch/de/start/ueber-uns/regionalgerichte.html',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Regionalgericht Bern-Mittelland (Zivilabteilung)', strasse: 'Effingerstrasse 34', plzOrt: '3008 Bern', zustaendigFuer: 'Region Bern-Mittelland', hinweis: 'Hodlerstrasse 7 ist NUR die Strafabteilung' },
        { name: 'Regionalgericht Emmental-Oberaargau', strasse: 'Dunantstrasse 3', plzOrt: '3400 Burgdorf', zustaendigFuer: 'Region Emmental-Oberaargau' },
        { name: 'Regionalgericht Oberland', strasse: 'Scheibenstrasse 11 B', plzOrt: '3600 Thun', zustaendigFuer: 'Region Oberland' },
        { name: 'Regionalgericht Berner Jura-Seeland', strasse: 'Spitalstrasse 14', plzOrt: '2502 Biel/Bienne', zustaendigFuer: 'Region Berner Jura-Seeland' },
      ],
    },
  },
  LU: {
    stand: '5.6.2026', quelle: Q_ERSTLISTE,
    url: 'https://gerichte.lu.ch/organisation/erstinstanzliche_gerichte/bezirksgerichte',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Bezirksgericht Luzern', strasse: 'Grabenstrasse 2, Postfach 2266', plzOrt: '6002 Luzern', zustaendigFuer: 'Bezirk Luzern' },
        { url: 'https://gerichte.lu.ch/organisation/erstinstanzliche_gerichte/bezirksgerichte/bezirksgericht_kriens', name: 'Bezirksgericht Kriens', strasse: 'Villastrasse 1', plzOrt: '6010 Kriens', zustaendigFuer: 'Bezirk Kriens' },
        { name: 'Bezirksgericht Hochdorf', strasse: 'Bellevuestrasse 6', plzOrt: '6280 Hochdorf', zustaendigFuer: 'Bezirk Hochdorf' },
        { name: 'Bezirksgericht Willisau', strasse: 'Menzbergstrasse 16, Postfach', plzOrt: '6130 Willisau', zustaendigFuer: 'Bezirk Willisau' },
      ],
    },
    hinweisArbeit: 'Eigenes Arbeitsgericht (§ 32 JusG LU) — arbeitsrechtliche Klagen gehören dorthin.',
  },
  UR: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.ur.ch/gerichte/61',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Landgericht Uri', strasse: 'Rathausplatz 2, Postfach', plzOrt: '6460 Altdorf' } },
  },
  SZ: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.sz.ch/behoerden/justiz/bezirksgerichte.html/8756-8758-8801-9217',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Bezirksgericht Schwyz', strasse: 'Rathaus, Postfach 60', plzOrt: '6431 Schwyz', zustaendigFuer: 'Bezirk Schwyz', hinweis: 'nur Postfach publiziert' },
        { name: 'Bezirksgericht Gersau', strasse: 'Ausserdorfstrasse 7', plzOrt: '6442 Gersau', zustaendigFuer: 'Bezirk Gersau' },
        { name: 'Bezirksgericht March', strasse: 'Bahnhofplatz 3, Postfach 48', plzOrt: '8853 Lachen', zustaendigFuer: 'Bezirk March' },
        { name: 'Bezirksgericht Einsiedeln', strasse: 'Eisenbahnstrasse 20a, Postfach 38', plzOrt: '8840 Einsiedeln', zustaendigFuer: 'Bezirk Einsiedeln' },
        { name: 'Bezirksgericht Küssnacht', strasse: 'Luzernerstrasse 1, Postfach 170', plzOrt: '6403 Küssnacht', zustaendigFuer: 'Bezirk Küssnacht' },
        { name: 'Bezirksgericht Höfe', strasse: 'Rebhaldenstrasse 13', plzOrt: '8807 Freienbach', zustaendigFuer: 'Bezirk Höfe' },
      ],
    },
  },
  OW: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.ow.ch/gerichte/32',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Kantonsgericht Obwalden', strasse: 'Poststrasse 6, Postfach', plzOrt: '6060 Sarnen' } },
  },
  NW: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.nw.ch/kantonsgericht/80',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Kantonsgericht Nidwalden', strasse: 'Rathausplatz 1, Postfach 1244', plzOrt: '6371 Stans' } },
  },
  GL: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.gl.ch/rechtspflege/gerichte/kantonsgericht.html/280',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Kantonsgericht Glarus', strasse: 'Gerichtshaus, Spielhof 6', plzOrt: '8750 Glarus', hinweis: 'E-Mail-Eingaben unzulässig (Fristen)' } },
  },
  ZG: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://zg.ch/de/gerichte/zivil-und-strafrechtspflege/kantonsgericht',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Kantonsgericht Zug', strasse: 'Gerichtsgebäude an der Aa, Aabachstrasse 3, Postfach', plzOrt: '6301 Zug' } },
  },
  FR: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.fr.ch/etat-et-droit/justice/pouvoir-judiciaire-tribunaux-darrondissement',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Bezirksgericht Saane / Tribunal de la Sarine', strasse: 'Route d’Englisberg 13', plzOrt: '1763 Granges-Paccot', zustaendigFuer: 'Bezirk Saane', hinweis: 'Standort provisorisch (Umzug April 2026, ~2 Jahre)' },
        { name: 'Bezirksgericht Sense', strasse: 'Schwarzseestrasse 5', plzOrt: '1712 Tafers', zustaendigFuer: 'Bezirk Sense' },
        { name: 'Bezirksgericht Greyerz / Tribunal de la Gruyère', strasse: 'Rue de l’Europe 10', plzOrt: '1630 Bulle', zustaendigFuer: 'Bezirk Greyerz' },
        { name: 'Bezirksgericht See / Tribunal du Lac', strasse: 'Schlossgasse 2', plzOrt: '3280 Murten', zustaendigFuer: 'Bezirk See' },
        { name: 'Tribunal de la Glâne', strasse: 'Rue des Moines 58', plzOrt: '1680 Romont', zustaendigFuer: 'Bezirk Glane' },
        { name: 'Tribunal de la Broye', strasse: 'Rue de la Gare 1', plzOrt: '1470 Estavayer-le-Lac', zustaendigFuer: 'Bezirk Broye' },
        { name: 'Tribunal de la Veveyse', strasse: 'Avenue de la Gare 33', plzOrt: '1618 Châtel-St-Denis', zustaendigFuer: 'Bezirk Vivisbach' },
      ],
    },
    hinweisMiete: 'Drei Mietgerichte im Kanton (Art. 34 JG FR) — nicht je Bezirksgericht; zuständiges Mietgericht prüfen.',
  },
  SO: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://so.ch/gerichte/richteraemter/',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Richteramt Solothurn-Lebern', strasse: 'Amthaus 2, Westbahnhofstrasse 16', plzOrt: '4502 Solothurn', zustaendigFuer: 'Amtei Solothurn-Lebern' },
        { name: 'Richteramt Bucheggberg-Wasseramt', strasse: 'Amthaus 1, Bielstrasse 1', plzOrt: '4502 Solothurn', zustaendigFuer: 'Amtei Bucheggberg-Wasseramt' },
        { name: 'Richteramt Olten-Gösgen', strasse: 'Römerstrasse 2', plzOrt: '4600 Olten', zustaendigFuer: 'Amtei Olten-Gösgen' },
        { name: 'Richteramt Thal-Gäu', strasse: 'Schmelzihof, Wengimattstrasse 2', plzOrt: '4710 Balsthal', zustaendigFuer: 'Amtei Thal-Gäu' },
        { name: 'Richteramt Dorneck-Thierstein', strasse: 'Amthausstrasse 15', plzOrt: '4143 Dornach', zustaendigFuer: 'Amtei Dorneck-Thierstein' },
      ],
    },
  },
  BS: {
    stand: '5.6.2026', quelle: 'Staatskalender BS (abgenommene Stammdaten — Vorrang KV_GERICHTE_BS)',
    url: 'https://www.bs.ch/gerichte-judikative/zivilgericht',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Zivilgericht Basel-Stadt', strasse: 'Bäumleingasse 5', plzOrt: '4051 Basel' } },
    hinweisArbeit: 'Arbeitsgericht Basel-Stadt (§§ 72 ff. GOG BS) — wird vom BS-Routing dieser Vorlage automatisch gesetzt.',
  },
  BL: {
    stand: '5.6.2026', quelle: Q_ERSTLISTE,
    url: 'https://www.baselland.ch/politik-und-behorden/gerichte/bv-gerichte/zivilkreisgerichte',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Zivilkreisgericht Basel-Landschaft Ost', strasse: 'Hauptstrasse 108', plzOrt: '4450 Sissach', zustaendigFuer: 'Zivilkreis Ost' },
        { name: 'Zivilkreisgericht Basel-Landschaft West', strasse: 'Domplatz 5/7', plzOrt: '4144 Arlesheim', zustaendigFuer: 'Zivilkreis West' },
      ],
    },
  },
  SH: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Justiz/Kantonsgericht-110173-DE.html',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Kantonsgericht Schaffhausen', strasse: 'Herrenacker 26', plzOrt: '8200 Schaffhausen', hinweis: 'Snippet-verifiziert (sh.ch JS-Wall) — vor Einreichung gegenprüfen' } },
  },
  AR: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://ar.ch/gerichte/kantonsgericht/',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Kantonsgericht Appenzell Ausserrhoden', strasse: 'Landsgemeindeplatz 2, Postfach', plzOrt: '9043 Trogen' } },
  },
  AI: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.ai.ch/gerichte/bezirksgericht',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Bezirksgericht Appenzell Innerrhoden', strasse: 'Unteres Ziel 20', plzOrt: '9050 Appenzell' } },
  },
  SG: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.sg.ch/recht/gerichte/organisation---standorte/kreisgerichte.html',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Kreisgericht St. Gallen', strasse: 'Bohl 1 (Haus Hecht) / Neugasse 3', plzOrt: '9004 St. Gallen', zustaendigFuer: 'Kreis St. Gallen', hinweis: 'neuer Standort geplant — beobachten' },
        { name: 'Kreisgericht Rorschach', strasse: 'Mariabergstrasse 15', plzOrt: '9401 Rorschach', zustaendigFuer: 'Kreis Rorschach' },
        { name: 'Kreisgericht Rheintal', strasse: 'Rabengasse 2a, Postfach', plzOrt: '9450 Altstätten', zustaendigFuer: 'Kreis Rheintal' },
        { name: 'Kreisgericht Werdenberg-Sarganserland', strasse: 'Bahnhofstrasse 10', plzOrt: '8887 Mels', zustaendigFuer: 'Kreis Werdenberg-Sarganserland' },
        { name: 'Kreisgericht See-Gaster', strasse: 'Bahnhofstrasse 4', plzOrt: '8730 Uznach', zustaendigFuer: 'Kreis See-Gaster' },
        { name: 'Kreisgericht Toggenburg', strasse: 'Hauptgasse 21', plzOrt: '9620 Lichtensteig', zustaendigFuer: 'Kreis Toggenburg' },
        { name: 'Kreisgericht Wil', strasse: 'Bahnhofstrasse 12', plzOrt: '9230 Flawil', zustaendigFuer: 'Kreis Wil' },
      ],
    },
  },
  GR: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.justiz-gr.ch/gerichte/regionalgerichte/',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Regionalgericht Albula', strasse: 'Stradung 26', plzOrt: '7450 Tiefencastel', zustaendigFuer: 'Region Albula' },
        { name: 'Regionalgericht Bernina', strasse: 'Via da la Pesa 8', plzOrt: '7742 Poschiavo', zustaendigFuer: 'Region Bernina' },
        { name: 'Regionalgericht Engiadina Bassa/Val Müstair', strasse: 'Saglina 22', plzOrt: '7554 Sent', zustaendigFuer: 'Region Engiadina Bassa/Val Müstair' },
        { name: 'Regionalgericht Imboden', strasse: 'Plaz 7', plzOrt: '7013 Domat/Ems', zustaendigFuer: 'Region Imboden' },
        { name: 'Regionalgericht Landquart', strasse: 'Bahnhofplatz 2b, Postfach 295', plzOrt: '7302 Landquart', zustaendigFuer: 'Region Landquart' },
        { name: 'Regionalgericht Maloja', strasse: 'Plazza da Scoula 16', plzOrt: '7500 St. Moritz', zustaendigFuer: 'Region Maloja' },
        { name: 'Regionalgericht Moesa', strasse: 'Al Giardinètt 2', plzOrt: '6535 Roveredo', zustaendigFuer: 'Region Moesa' },
        { name: 'Regionalgericht Plessur', strasse: 'Poststrasse 14, Postfach 262', plzOrt: '7001 Chur', zustaendigFuer: 'Region Plessur' },
        { name: 'Regionalgericht Prättigau/Davos', strasse: 'Talstrasse 10a, Postfach 128', plzOrt: '7250 Klosters', zustaendigFuer: 'Region Prättigau/Davos' },
        { name: 'Regionalgericht Surselva', strasse: 'Via Centrala 4, Postfach 20', plzOrt: '7130 Ilanz/Glion', zustaendigFuer: 'Region Surselva' },
        { name: 'Regionalgericht Viamala', strasse: 'Untere Gasse 1 (Rathaus)', plzOrt: '7430 Thusis', zustaendigFuer: 'Region Viamala' },
      ],
    },
  },
  AG: {
    stand: '5.6.2026', quelle: Q_ERSTLISTE,
    url: 'https://www.ag.ch/de/ueber-uns/gerichte-kanton-aargau/organisation/bezirksgerichte/gerichte-nach-bezirken',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Bezirksgericht Aarau', strasse: 'Obere Vorstadt 37, Postfach', plzOrt: '5000 Aarau', zustaendigFuer: 'Bezirk Aarau' },
        { name: 'Bezirksgericht Baden', strasse: 'Mellingerstrasse 2a', plzOrt: '5400 Baden', zustaendigFuer: 'Bezirk Baden' },
        { name: 'Bezirksgericht Bremgarten', strasse: 'Rathausplatz 1', plzOrt: '5620 Bremgarten', zustaendigFuer: 'Bezirk Bremgarten' },
        { name: 'Bezirksgericht Brugg', strasse: 'Untere Hofstatt 4', plzOrt: '5200 Brugg', zustaendigFuer: 'Bezirk Brugg' },
        { name: 'Bezirksgericht Kulm', strasse: 'Zentrumsplatz 1', plzOrt: '5726 Unterkulm', zustaendigFuer: 'Bezirk Kulm' },
        { name: 'Bezirksgericht Laufenburg', strasse: 'Gerichtsgasse 85', plzOrt: '5080 Laufenburg', zustaendigFuer: 'Bezirk Laufenburg' },
        { name: 'Bezirksgericht Lenzburg', strasse: 'Malagarain 2', plzOrt: '5600 Lenzburg', zustaendigFuer: 'Bezirk Lenzburg', hinweis: 'Neubau, Umzug Juli 2025' },
        { name: 'Bezirksgericht Muri', strasse: 'Seetalstrasse 8', plzOrt: '5630 Muri', zustaendigFuer: 'Bezirk Muri' },
        { name: 'Bezirksgericht Rheinfelden', strasse: 'Hermann Keller-Strasse 6', plzOrt: '4310 Rheinfelden', zustaendigFuer: 'Bezirk Rheinfelden' },
        { name: 'Bezirksgericht Zofingen', strasse: 'Untere Grabenstrasse 30', plzOrt: '4800 Zofingen', zustaendigFuer: 'Bezirk Zofingen' },
        { name: 'Bezirksgericht Zurzach', strasse: 'Hauptstrasse 50', plzOrt: '5330 Bad Zurzach', zustaendigFuer: 'Bezirk Zurzach' },
      ],
    },
    hinweisArbeit: 'Arbeitsgericht als Abteilung des Bezirksgerichts (§ 53 GOG AG).',
  },
  TG: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://bezirksgericht.tg.ch/',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { url: 'https://bezirksgericht.tg.ch/arbon.html/4027', name: 'Bezirksgericht Arbon', strasse: 'Schlossgasse 4, Postfach 64', plzOrt: '9320 Arbon', zustaendigFuer: 'Bezirk Arbon' },
        { url: 'https://bezirksgericht.tg.ch/frauenfeld.html/4028', name: 'Bezirksgericht Frauenfeld', strasse: 'Zürcherstrasse 237a', plzOrt: '8501 Frauenfeld', zustaendigFuer: 'Bezirk Frauenfeld' },
        { url: 'https://bezirksgericht.tg.ch/kreuzlingen.html/4029', name: 'Bezirksgericht Kreuzlingen', strasse: 'Konstanzerstrasse 13', plzOrt: '8280 Kreuzlingen', zustaendigFuer: 'Bezirk Kreuzlingen' },
        { name: 'Bezirksgericht Münchwilen', strasse: 'Wilerstrasse 2', plzOrt: '9542 Münchwilen', zustaendigFuer: 'Bezirk Münchwilen' },
        { name: 'Bezirksgericht Weinfelden', strasse: 'Bahnhofstrasse 12, Postfach 44', plzOrt: '8570 Weinfelden', zustaendigFuer: 'Bezirk Weinfelden' },
      ],
    },
  },
  TI: {
    stand: '6.6.2026', quelle: Q_MASTER,
    url: 'https://www4.ti.ch/poteri/giudiziario/giustizia-civile/preture',
    // 10 Preture amtlich belegt, aber für mehrere nur Gebäude/Ort ohne
    // PLZ-Zeile publiziert → ehrlich Verzeichnis statt unvollständiger Liste.
    erstinstanz: {
      modus: 'verzeichnis',
      beschreibung: '10 Preture (je Distretto; u. a. Lugano Via Bossi 3, Bellinzona Piazza Governo 2, Faido Palazzo del Pretorio)',
      url: 'https://www4.ti.ch/poteri/giudiziario/giustizia-civile/preture',
    },
  },
  VD: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.vd.ch/toutes-les-autorites/ordre-judiciaire-vaudois-ojv/tribunaux-darrondissement',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Tribunal d’arrondissement de Lausanne', strasse: 'Allée Ernest-Ansermet 2 (Montbenon)', plzOrt: '1014 Lausanne', zustaendigFuer: 'Arrondissement de Lausanne' },
        { name: 'Tribunal d’arrondissement de l’Est vaudois', strasse: 'Rue du Simplon 22', plzOrt: '1800 Vevey', zustaendigFuer: 'Est vaudois' },
        { name: 'Tribunal d’arrondissement de La Côte', strasse: 'Route de Saint-Cergue 38', plzOrt: '1260 Nyon', zustaendigFuer: 'La Côte' },
        { name: 'Tribunal d’arrondissement de la Broye et du Nord vaudois', strasse: 'Rue des Moulins 8, Case postale 1401', plzOrt: '1400 Yverdon-les-Bains', zustaendigFuer: 'Broye et Nord vaudois' },
      ],
    },
    hinweisMiete: 'Tribunal des baux (kantonsweit, Avenue de Tivoli 2, 1014 Lausanne) — Miet-/Pachtsachen gehören dorthin (Art. 3 LOJV i.V.m. Spezialgesetz).',
  },
  VS: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.vs.ch/web/tribunaux/tribunaux-de-district',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Tribunal du district de Sion', strasse: 'Rue Mathieu-Schiner 1, Case postale 2192', plzOrt: '1950 Sion', zustaendigFuer: 'District de Sion' },
        { name: 'Tribunal des districts d’Hérens et Conthey', strasse: 'Rue Mathieu-Schiner 1, Case postale 2352', plzOrt: '1950 Sion', zustaendigFuer: 'Hérens et Conthey' },
        { name: 'Tribunal du district de Sierre', strasse: 'Avenue du Rothorn 2, Case postale 416', plzOrt: '3960 Sierre', zustaendigFuer: 'District de Sierre' },
        { name: 'Tribunal des districts de Martigny et St-Maurice', strasse: 'Hôtel de Ville 1', plzOrt: '1920 Martigny', zustaendigFuer: 'Martigny et St-Maurice' },
        { name: 'Tribunal du district d’Entremont', strasse: 'Rue du Collège 2', plzOrt: '1933 Sembrancher', zustaendigFuer: 'District d’Entremont' },
        { name: 'Tribunal du district de Monthey', strasse: 'Place de l’Hôtel de Ville 1, Case postale 28', plzOrt: '1870 Monthey 1', zustaendigFuer: 'District de Monthey' },
        { name: 'Bezirksgericht Brig, Östlich Raron und Goms', strasse: 'Alte Simplonstrasse 28', plzOrt: '3900 Brig', zustaendigFuer: 'Brig, Östlich Raron, Goms' },
        { name: 'Bezirksgericht Visp', strasse: 'St. Martiniplatz 5', plzOrt: '3930 Visp', zustaendigFuer: 'Bezirk Visp' },
        { name: 'Bezirksgericht Leuk und Westlich Raron', strasse: 'Rathausplatz 1', plzOrt: '3953 Leuk-Stadt', zustaendigFuer: 'Leuk und Westlich Raron' },
      ],
    },
  },
  NE: {
    stand: '10.6.2026', quelle: Q_MASTER + '; URL-Recherche 10.6.2026: neu organisiert als «Tribunal d’instance» (zwei Tribunaux régionaux darunter)',
    url: 'https://www.ne.ch/autorites/autorites-judiciaires/tribunal-dinstance',
    erstinstanz: {
      modus: 'liste',
      gerichte: [
        { name: 'Tribunal régional Littoral/Val-de-Travers (Neuchâtel)', strasse: 'Rue de l’Hôtel-de-Ville 2, Case postale 1', plzOrt: '2002 Neuchâtel', zustaendigFuer: 'Littoral et Val-de-Travers' },
        { name: 'Tribunal régional Littoral/Val-de-Travers (Boudry)', strasse: 'Rue Louis-Favre 39, Case postale 36', plzOrt: '2017 Boudry', zustaendigFuer: 'Littoral et Val-de-Travers (Standort Boudry)' },
        { name: 'Tribunal régional Montagnes/Val-de-Ruz', strasse: 'Avenue Léopold-Robert 10, Case postale 2284', plzOrt: '2300 La Chaux-de-Fonds', zustaendigFuer: 'Montagnes et Val-de-Ruz', hinweis: 'Umzug Sommer 2026 angekündigt (mutmasslich Nr. 63 — amtlich unbestätigt); vor Einreichung prüfen' },
      ],
    },
  },
  GE: {
    stand: '6.6.2026', quelle: Q_MASTER,
    url: 'https://justice.ge.ch/fr/contenu/tribunal-de-premiere-instance',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Tribunal de première instance', strasse: 'Place du Bourg-de-Four 1, Case postale 3736', plzOrt: '1211 Genève 3' } },
    hinweisArbeit: 'Tribunal des prud’hommes (Boulevard Helvétique 27, Case postale 3688, 1211 Genève 3) — arbeitsrechtliche Klagen gehören dorthin (Art. 110 LOJ GE).',
    hinweisMiete: 'Tribunal des baux et loyers (Komplex Bourg-de-Four/Chaudronniers, Case postale 3120, 1211 Genève 3) — Miet-/Pachtsachen gehören dorthin (Art. 89 LOJ GE).',
  },
  JU: {
    stand: '5.6.2026', quelle: Q_MASTER,
    url: 'https://www.jura.ch/fr/Autorites/JUST/Instances-judiciaires/Tribunal-de-premiere-instance/Tribunal-de-premiere-instance.html',
    erstinstanz: { modus: 'zentral', stelle: { name: 'Tribunal de première instance', strasse: 'Chemin du Château 9, Case postale', plzOrt: '2900 Porrentruy' } },
  },
};

/** Auflösung des erstinstanzlichen Zivilgerichts für den Kanton. */
export function zivilgerichtErstinstanz(kanton: Kanton): KantonZivilgerichteErstinstanz | null {
  return ZIVILGERICHTE_ERSTINSTANZ[kanton] ?? null;
}
