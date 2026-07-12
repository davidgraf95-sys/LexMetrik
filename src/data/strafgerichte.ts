import type { Kanton } from '../types/legal';
import { OBERE_INSTANZEN } from './obereInstanzen';

// ─── Strafgerichte: erste Instanz + Berufungsinstanz (+ ZMG) je Kanton ──────
//
// Datenschicht «Strafgerichte» für den Straf-Zuständigkeitsrechner
// (Auftrag David, 6.6.2026). Quelle (einzig): ERSTRECHERCHE-Dossier
// bibliothek/behoerden/strafgerichte-kantone.md (Abruf 6.6.2026; 26 Kantone ×
// {1. Instanz, Berufungsinstanz, teils ZMG}).
//
// STATUS: Erstrecherche, Doppelcheck + fachliche Abnahme ausstehend. Kein
// `verified: true` (CLAUDE.md §7/§8). Offene Hausnummern werden NICHT geraten,
// sondern weggelassen und im `hinweis` mit dem dokumentierten Vorbehalt
// festgehalten (BL Strafjustizzentrum Muttenz, AR Fünfeckpalast Trogen,
// diverse ZMG-Lücken).
//
// §5 SINGLE SOURCE OF TRUTH: Die Berufungsinstanz (Art. 21 StPO) ist laut
// Dossier in JEDEM Kanton dasselbe Haus/dieselbe Behörde wie die Zivil-
// Berufungsinstanz in `obereInstanzen.ts` (andere Kammer) — keine einzige
// Adress-Abweichung. Deshalb wird die Adresse NICHT abgetippt, sondern aus
// OBERE_INSTANZEN bezogen (Spread `berufungVon(...)`); lokal ergänzt wird nur
// der Straf-/Berufungskammer-Name.
//
// STRUKTURELLE DISKREPANZEN (Dossier, ausgewiesen — nicht stillschweigend):
// - BS: erste Strafinstanz = Strafgericht, Schützenmattstrasse 20 (≠ das in
//   obereInstanzen.ts geführte Appellationsgericht Bäumleingasse 1, = Berufung).
// - LU: erste Strafinstanz (schwere Fälle) = Kriminalgericht,
//   Landenbergstrasse 36 (eigenes Haus, ≠ Kantonsgericht Hirschengraben 16).
// - GE: Strafgerichte (police/correctionnel/criminel) = Rue des Chaudronniers 9
//   (≠ Tribunal de première instance Bourg-de-Four 1 der Zivil-1.-Instanz).
// - VS: Straf-1.-Instanz = 3 Tribunaux d'arrondissement (Art. 11 LOJ), nicht
//   die 9 Tribunaux de district (= Zivil-1.-Instanz); Sitze decken sich.

export interface StrafGerichtAdresse {
  name: string;
  strasse?: string;
  plzOrt?: string;
  hinweis?: string;
}

export interface KantonStrafgerichte {
  stand: string;
  quelle: string;
  /**
   * Erstinstanzliches Strafgericht (Art. 19 StPO): Einheitsgericht mit Adresse
   * ODER System-Beschreibung (z. B. «12 Bezirksgerichte») mit Hauptort-Beispiel.
   */
  ersteInstanz: StrafGerichtAdresse & { system?: string };
  /**
   * Berufungsinstanz (Art. 21 StPO). Deckt sich laut Dossier 1:1 mit
   * obereInstanzen.ts — Adresse via `berufungVon(...)` projiziert, nur der
   * Strafkammer-Name lokal ergänzt (§5).
   */
  berufung: StrafGerichtAdresse;
  /** Zwangsmassnahmengericht (Art. 18 StPO), wo belegt. */
  zmg?: StrafGerichtAdresse;
}

const STAND = '6.6.2026';
const QUELLE =
  'Quelle: bibliothek/behoerden/strafgerichte-kantone.md (Abruf 6.6.2026) — Doppelcheck + fachliche Abnahme ausstehend';

/**
 * §5-Projektion: Berufungs-Adresse aus OBERE_INSTANZEN beziehen (Spread) und
 * nur den Straf-/Berufungskammer-Namen lokal überschreiben. So bleibt die
 * Adresse genau einmal gepflegt; eine Adress-Abweichung wäre ein Bug.
 */
function berufungVon(kanton: Kanton, name: string): StrafGerichtAdresse {
  const o = OBERE_INSTANZEN[kanton];
  return { name, strasse: o.strasse, plzOrt: o.plzOrt, ...(o.hinweis ? { hinweis: o.hinweis } : {}) };
}

export const STRAFGERICHTE: Record<Kanton, KantonStrafgerichte> = {
  ZH: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Bezirksgericht (Strafabteilung)',
      system: '12 Bezirksgerichte sind zugleich erstinstanzliche Strafgerichte (§ 22 ff. GOG); Einzel-/Kollegialgericht je nach Straferwartung',
      strasse: 'Badenerstrasse 90, Postfach',
      plzOrt: '8004 Zürich',
      hinweis: 'Hauptort-Beispiel: Bezirksgericht Zürich, Strafsachenkanzlei (Badenerstrasse 90 / Wengistrasse 28). Übrige 11 BG-Adressen: gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('ZH', 'Obergericht des Kantons Zürich, I./II. Strafkammer'),
    zmg: {
      name: 'Zwangsmassnahmengericht am Bezirksgericht Zürich',
      strasse: 'Güterstrasse 33, Postfach',
      plzOrt: '8010 Zürich',
      hinweis: 'An jedem der 12 Bezirksgerichte ein ZMG (§ 29 GOG); zentral organisiert',
    },
  },
  BE: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Regionalgericht (Strafabteilung)',
      system: '4 Regionalgerichte (Art. 80 f. GSOG) im Regelfall + kantonales Wirtschaftsstrafgericht (Art. 63–66 GSOG) für Wirtschaftsstraffälle',
      strasse: 'Amthaus, Hodlerstrasse 7',
      plzOrt: '3011 Bern',
      hinweis: 'Hauptort-Beispiel: Regionalgericht Bern-Mittelland. Übrige Sitze (Biel, Burgdorf, Thun): gerichtsbehoerden-kantone.md. Wirtschaftsstrafgericht: eigene Hausnummer nicht separat belegt (mutmasslich Amthaus Hodlerstrasse 7) — offen',
    },
    berufung: berufungVon('BE', 'Obergericht des Kantons Bern, 2. Strafkammer / Strafabteilung'),
    zmg: {
      name: 'Kantonales Zwangsmassnahmengericht',
      strasse: 'Amthaus, Hodlerstrasse 7',
      plzOrt: '3011 Bern',
      hinweis: '+ 3 regionale ZMG (Biel, Burgdorf, Thun); Art. 59–62 GSOG',
    },
  },
  LU: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kriminalgericht Luzern',
      system: 'Kriminalgericht (schwere Straffälle, § 33 JusG) + 4 Bezirksgerichte (Luzern/Kriens, Hochdorf, Willisau, Sursee) für übrige Strafsachen',
      strasse: 'Landenbergstrasse 36, Postfach 3439',
      plzOrt: '6002 Luzern',
      hinweis: 'Eigenes Haus — NICHT am Kantonsgericht (Hirschengraben 16) und NICHT an der Zivil-Bezirksgerichts-Adresse. Verhandlungssaal Alpenquai 10, 6005 Luzern',
    },
    berufung: berufungVon('LU', 'Kantonsgericht Luzern, 2. Abteilung (Strafrecht)'),
    zmg: {
      name: 'Zwangsmassnahmengericht (dem Kantonsgericht angegliedert)',
      strasse: 'Hirschengraben 16, Postfach 3569',
      plzOrt: '6002 Luzern',
      hinweis: 'Eigene ZMG-Hausnummer nicht separat belegt — Kantonsgerichts-Adresse (Repo-Querverweis)',
    },
  },
  UR: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Landgericht Uri',
      strasse: 'Rathausplatz 2, Postfach',
      plzOrt: '6460 Altdorf',
      hinweis: 'Kollegialgericht bzw. Landgerichtspräsidium als Einzelgericht (Art. 20/25 GOG)',
    },
    berufung: berufungVon('UR', 'Obergericht Uri (Strafsachen)'),
    zmg: {
      name: 'Landgerichtspräsidium als Zwangsmassnahmengericht',
      strasse: 'Rathausplatz 2',
      plzOrt: '6460 Altdorf',
      hinweis: 'Art. 19e GOG',
    },
  },
  SZ: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kantonales Straf-, Jugend- und Zwangsmassnahmengericht',
      system: '6 Bezirksgerichte (Schwyz, Gersau, March, Einsiedeln, Küssnacht, Höfe) im Regelfall (§ 32 JG) + kantonales Straf-/Jugend-/ZMG für schwere Fälle (§ 18/20 JG)',
      strasse: 'Kollegiumstrasse 28, Postfach 2267',
      plzOrt: '6431 Schwyz',
      hinweis: 'Adresse = schwere Fälle (kantonales Strafgericht). Bezirksgerichts-Adressen: gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('SZ', 'Kantonsgericht Schwyz, Strafkammer'),
    zmg: {
      name: 'Im Straf-, Jugend- und Zwangsmassnahmengericht vereint',
      strasse: 'Kollegiumstrasse 28, Postfach 2267',
      plzOrt: '6431 Schwyz',
      hinweis: 'Kombinierte Behörde — eine Adresse (§ 24 JG)',
    },
  },
  OW: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kantonsgericht Obwalden',
      strasse: 'Poststrasse 6, Postfach',
      plzOrt: '6060 Sarnen',
      hinweis: '«Kantonsgericht» ist hier die ERSTE Instanz (Kollegial + Präsidium als Einzelgericht; Art. 3/35 GOG)',
    },
    berufung: berufungVon('OW', 'Obergericht Obwalden (Strafsachen)'),
    zmg: {
      name: 'Kantonsgericht OW als Zwangsmassnahmengericht',
      strasse: 'Poststrasse 6',
      plzOrt: '6060 Sarnen',
      hinweis: 'Art. 48 GOG',
    },
  },
  NW: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kantonsgericht Nidwalden',
      strasse: 'Rathausplatz 1, Postfach 1244',
      plzOrt: '6371 Stans',
      hinweis: '«Kantonsgericht» ist hier die ERSTE Instanz (Einzel-/Kollegialgericht; Art. 6/17 GerG)',
    },
    berufung: berufungVon('NW', 'Obergericht Nidwalden (Strafsachen)'),
    zmg: {
      name: 'Kantonsgericht NW als Einzelgericht/Zwangsmassnahmengericht',
      strasse: 'Rathausplatz 1',
      plzOrt: '6371 Stans',
      hinweis: 'Art. 14 GerG',
    },
  },
  GL: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kantonsgericht Glarus',
      strasse: 'Gerichtshaus, Spielhof 6',
      plzOrt: '8750 Glarus',
      hinweis: '«Kantonsgericht» ist hier die ERSTE Instanz in Strafsachen (Art. 12 f. GOG)',
    },
    berufung: berufungVon('GL', 'Obergericht des Kantons Glarus (Rechtsmittelinstanz Straf)'),
    zmg: {
      name: 'Zwangsmassnahmengericht (dem Kantonsgericht zugeordnet)',
      strasse: 'Spielhof 6',
      plzOrt: '8750 Glarus',
      hinweis: 'Genaue ZMG-Bezeichnung nicht separat belegt — Repo-Querverweis',
    },
  },
  ZG: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Strafgericht des Kantons Zug',
      strasse: 'Gerichtsgebäude an der Aa, Aabachstrasse 3',
      plzOrt: '6301 Zug',
      hinweis: 'Eigenständiges Strafgericht (Kollegialgericht zu dritt, § 30–32 GOG); gleicher Komplex wie Kantonsgericht ZG (Zivil)',
    },
    berufung: berufungVon('ZG', 'Obergericht des Kantons Zug, Strafabteilung'),
    zmg: {
      name: 'Zwangsmassnahmengericht (eigenständig seit Revision 1.1.2025)',
      strasse: 'Aabachstrasse 3',
      plzOrt: '6301 Zug',
      hinweis: '§ 35a/35b GOG; gleicher Gerichtskomplex, eigene Hausnummer nicht abweichend publiziert',
    },
  },
  FR: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Bezirksgericht / Tribunal pénal d’arrondissement',
      system: '7 Bezirksgerichte (Saane, Sense, Greyerz, See, Glane, Broye, Vivisbach) als Strafgericht (Art. 32 ff. JG/LJ) + Wirtschaftsstrafgericht / Tribunal pénal économique für Wirtschaftsstraffälle',
      strasse: 'Route d’Englisberg 13',
      plzOrt: '1763 Granges-Paccot',
      hinweis: 'Adresse = Wirtschaftsstrafgericht (administrativ am TA Sarine). PROVISORISCH — Umzug ab April 2026, ~2 Jahre. Bezirksgerichts-Adressen: gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('FR', 'Kantonsgericht Freiburg / Tribunal cantonal, Strafhof / Cour pénale'),
    zmg: {
      name: 'Zwangsmassnahmengericht / Tribunal des mesures de contrainte',
      plzOrt: undefined,
      hinweis: 'Kantonal, Sitz Fribourg. Genaue Hausnummer nicht web-belegt — offen (Repo-Querverweis)',
    },
  },
  SO: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Richteramt (Amtsgericht) als Strafgericht',
      system: '5 Richterämter (Amtsgerichte) als Strafgericht (§ 15 GO, Dreierbesetzung) bzw. Amtsgerichtspräsident als Strafrichter (§ 12)',
      strasse: 'Amthaus 2, Westbahnhofstrasse 16',
      plzOrt: '4502 Solothurn',
      hinweis: 'Hauptort-Beispiel: Richteramt Solothurn-Lebern. Übrige (Bucheggberg-Wasseramt, Olten-Gösgen, Thal-Gäu, Dorneck-Thierstein): gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('SO', 'Obergericht des Kantons Solothurn, Strafkammer'),
    zmg: {
      name: 'Zwangsmassnahmengericht (Haftgericht)',
      plzOrt: undefined,
      hinweis: 'Solothurn. Genaue Hausnummer nicht separat belegt — offen (mutmasslich Amthaus, Repo-Querverweis)',
    },
  },
  BS: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Strafgericht Basel-Stadt',
      strasse: 'Schützenmattstrasse 20, Postfach',
      plzOrt: '4051 Basel',
      hinweis: 'Eigenständiges Strafgericht (§ 75/77 GOG). ⚠ Diskrepanz: NICHT das in obereInstanzen.ts geführte Appellationsgericht (Bäumleingasse 1 = Berufungs-/Zivilinstanz). Postfach 4009 Basel',
    },
    berufung: berufungVon('BS', 'Appellationsgericht Basel-Stadt, Strafrechtliche Abteilung'),
    zmg: {
      name: 'Straf- und Zwangsmassnahmengericht (dem Strafgericht zugeordnet)',
      strasse: 'Schützenmattstrasse 20',
      plzOrt: '4051 Basel',
      hinweis: '§ 78 GOG; gemeinsame Kanzlei mit dem Strafgericht (gleiches Haus)',
    },
  },
  BL: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Strafgericht Basel-Landschaft',
      // Behörden-Audit 6.6.2026: Lücke amtlich geschlossen — baselland.ch
      // Behördenverzeichnis «Strafgericht» + amtliche Verhandlungstermine-PDF
      // («Strafjustizzentrum, Grenzacherstr. 8, 4132 Muttenz»).
      strasse: 'Grenzacherstrasse 8 (Strafjustizzentrum)',
      plzOrt: '4132 Muttenz',
      hinweis: 'Kantonal (§ 20 GOG, Fünfer-/Dreierkammern); gleicher Komplex wie die StA BL',
    },
    berufung: berufungVon('BL', 'Kantonsgericht Basel-Landschaft, Abteilung Strafrecht'),
    zmg: {
      name: 'Präsidien des Strafgerichts (ZMG-Funktion)',
      strasse: 'Grenzacherstrasse 8 (Strafjustizzentrum)',
      plzOrt: '4132 Muttenz',
      hinweis: '§ 21 GOG; Adresse wie 1. Instanz (Behörden-Audit 6.6.2026)',
    },
  },
  SH: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kantonsgericht Schaffhausen',
      strasse: 'Herrenacker 26',
      plzOrt: '8200 Schaffhausen',
      hinweis: '«Kantonsgericht» ist hier die ERSTE Instanz in Strafsachen (Art. 33 JG)',
    },
    berufung: berufungVon('SH', 'Obergericht des Kantons Schaffhausen (Rechtsmittelinstanz Straf)'),
    zmg: {
      name: 'Kantonsgericht SH als Zwangsmassnahmengericht',
      strasse: 'Herrenacker 26',
      plzOrt: '8200 Schaffhausen',
      hinweis: 'Art. 35 JG',
    },
  },
  AR: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kantonsgericht Appenzell Ausserrhoden',
      strasse: 'Landsgemeindeplatz 2, Postfach',
      plzOrt: '9043 Trogen',
      hinweis: '«Kantonsgericht» ist hier die ERSTE Instanz («erstinstanzliches Gericht in Strafsachen», Art. 15 JG)',
    },
    berufung: berufungVon('AR', 'Obergericht Appenzell Ausserrhoden (Berufungs-/Beschwerdeinstanz Straf)'),
    zmg: {
      name: 'Zwangsmassnahmengericht (am Kantonsgericht / Einzelrichter)',
      plzOrt: undefined,
      hinweis: 'Trogen. Nicht separat belegt — offen (Repo-Querverweis)',
    },
  },
  AI: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Bezirksgericht Appenzell I.Rh.',
      strasse: 'Unteres Ziel 20',
      plzOrt: '9050 Appenzell',
      hinweis: 'Erstinstanzlich Zivil/Straf (Art. 7 f. GOG); selbes Gebäude wie Zielstrasse 38, eine Kanzlei',
    },
    berufung: berufungVon('AI', 'Kantonsgericht Appenzell Innerrhoden, Abteilung Zivil- und Strafgericht'),
    zmg: {
      name: 'Zwangsmassnahmerichter am Bezirksgericht',
      strasse: 'Unteres Ziel 20',
      plzOrt: '9050 Appenzell',
      hinweis: 'Art. 14 GOG',
    },
  },
  SG: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Kreisgericht (Strafgericht)',
      system: '7 Kreisgerichte sind erstinstanzliche Strafgerichte (Art. 5 f. GerG; Einzelrichter/Kollegial)',
      strasse: 'Bohl 1 (Haus Hecht) / Neugasse 3',
      plzOrt: '9004 St. Gallen',
      hinweis: 'Hauptort-Beispiel: Kreisgericht St. Gallen. Übrige (Rorschach, Rheintal/Altstätten, Werdenberg-Sarganserland/Mels, See-Gaster/Uznach, Toggenburg/Lichtensteig, Wil/Flawil): gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('SG', 'Kantonsgericht St. Gallen, Strafkammer (+ Anklagekammer)'),
    zmg: {
      name: 'Zwangsmassnahmengericht (am Kantonsgericht/Untersuchungsbereich)',
      plzOrt: undefined,
      hinweis: 'Genaue Zuordnung/Hausnummer nicht separat belegt — offen (Repo-Querverweis)',
    },
  },
  GR: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Regionalgericht (Strafkammer)',
      system: '11 Regionalgerichte mit Strafkammer (Art. 69 GOG)',
      strasse: 'Poststrasse 14, Postfach 262',
      plzOrt: '7001 Chur',
      hinweis: 'Hauptort-Beispiel: Regionalgericht Plessur. Übrige 10 RG (Albula, Bernina, Engiadina Bassa, Imboden, Landquart, Maloja, Moesa, Prättigau-Davos, Surselva, Viamala): gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('GR', 'Obergericht des Kantons Graubünden, Strafabteilung'),
    zmg: {
      name: 'Kantonales Zwangsmassnahmengericht',
      strasse: 'Theaterweg 1, Postfach 36',
      plzOrt: '7001 Chur',
      hinweis: 'Art. 59–61 GOG',
    },
  },
  AG: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Bezirksgericht (Strafgericht-Abteilung)',
      system: '11 Bezirksgerichte mit gegliederter Strafgericht-Abteilung (§ 50/52 GOG)',
      strasse: 'Kasinostrasse 5, Postfach',
      plzOrt: '5001 Aarau',
      hinweis: 'Hauptort-Beispiel: Bezirksgericht Aarau. Übrige BG-Adressen: gerichtsadressen-erstliste.md',
    },
    berufung: berufungVon('AG', 'Obergericht des Kantons Aargau, Strafgericht (Abteilung)'),
    zmg: {
      name: 'Zwangsmassnahmengericht (aus Bezirksgerichtspräsidien / Einzelrichter)',
      plzOrt: undefined,
      hinweis: '§ 60 GOG — am jeweiligen Bezirksgericht (keine zentrale Adresse)',
    },
  },
  TG: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Bezirksgericht (erstinstanzliches Strafgericht)',
      system: '5 Bezirksgerichte (Arbon, Frauenfeld, Kreuzlingen, Münchwilen, Weinfelden) als erstinstanzliche Strafgerichte (§ 14/21 ZSRG)',
      plzOrt: undefined,
      hinweis: 'Sitze: Arbon/Frauenfeld/Kreuzlingen/Münchwilen/Weinfelden — Adressen siehe gerichtsbehoerden-kantone.md (kein Einheits-Hauptsitz im Dossier ausgewiesen)',
    },
    berufung: berufungVon('TG', 'Obergericht des Kantons Thurgau (Berufungs-/Beschwerdeinstanz Straf)'),
    zmg: {
      name: 'Zwangsmassnahmengericht',
      plzOrt: undefined,
      hinweis: '§ 23 ZSRG. Genaue Hausnummer nicht separat belegt — offen (Repo-Querverweis)',
    },
  },
  TI: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Tribunale penale cantonale (+ Pretura penale)',
      system: 'Tribunale penale cantonale für schwere Strafsachen (assise criminali/correzionali, Art. 50 LOG) + Pretura penale (Strafbefehl/contravvenzioni, Einzelrichter, Sitz Bellinzona, Art. 39–41 LOG)',
      strasse: 'Via Pretorio 16',
      plzOrt: '6901 Lugano',
      hinweis: 'Das TPC ist am Tribunale d’appello angesiedelt. Eigene abweichende Hausnummer für das TPC nicht separat publiziert — offen; Pretura penale in Bellinzona',
    },
    berufung: berufungVon('TI', 'Corte di appello e di revisione penale (CARP), Tribunale d’appello'),
    zmg: {
      name: 'Ufficio del Giudice dei provvedimenti coercitivi (GPC)',
      strasse: 'Via Bossi 3',
      plzOrt: '6901 Lugano',
    },
  },
  VD: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Tribunal d’arrondissement (Strafbesetzung)',
      system: '4 Tribunaux d’arrondissement in Strafbesetzung (Tribunal correctionnel/criminel, Art. 96a LOJV) + Président = Tribunal de police (Einzelrichter, Art. 96c)',
      strasse: 'Allée Ernest-Ansermet 2 (Montbenon)',
      plzOrt: '1014 Lausanne',
      hinweis: 'Hauptort-Beispiel: Tribunal d’arrondissement de Lausanne. Übrige (Est vaudois/Vevey, La Côte/Nyon, Broye-Nord vaudois/Yverdon): gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('VD', 'Tribunal cantonal, Cour d’appel pénale / Chambre des recours pénale'),
    zmg: {
      name: 'Tribunal des mesures de contrainte',
      plzOrt: undefined,
      hinweis: 'Kantonsweit, Lausanne (Art. 3 LOJV + loi spéciale). Genaue Hausnummer nicht separat belegt — offen',
    },
  },
  VS: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Tribunal d’arrondissement (Strafgericht)',
      system: '3 Tribunaux d’arrondissement (Strafgerichte, Dreierkollegium: Haut-Valais, Centre, Bas-Valais; Art. 11 LOJ)',
      plzOrt: undefined,
      hinweis: '⚠ Straf-1.-Instanz ≠ Zivil-1.-Instanz (= 9 Tribunaux de district, Art. 10 LOJ). Sitze decken sich mit den Bezirksgerichten (Hauptsitze Brig / Sion / Martigny-Monthey), Besetzung unterscheidet sich — Einzeladressen je Arrondissement im Dossier nicht abschliessend belegt',
    },
    berufung: berufungVon('VS', 'Kantonsgericht Wallis / Tribunal cantonal, Cour pénale'),
    zmg: {
      name: 'Tribunal des mesures de contrainte',
      strasse: 'Rue Mathieu-Schiner 1',
      plzOrt: '1950 Sion',
      hinweis: 'Zentralisiert, Einzelrichter, Sitz Sion (Art. 12 LOJ); am Tribunal cantonal-Komplex — eigene abweichende Hausnummer nicht separat publiziert',
    },
  },
  NE: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Tribunal régional (Strafbesetzung)',
      system: '2 Tribunaux régionaux — Tribunal de police (Einzelrichter, bis 2 J. FS, Art. 25–27 OJN) und Tribunal criminel (3 Richter, > 2 J., Art. 28–30 OJN)',
      strasse: 'Rue de l’Hôtel-de-Ville 2',
      plzOrt: '2000 Neuchâtel',
      hinweis: 'Sitze: Neuchâtel (Hôtel-de-Ville 2) / Boudry (Louis-Favre 39) / La Chaux-de-Fonds (Léopold-Robert 10 — ⚠ Umzug ins Postgebäude Léopold-Robert 63, Audienzen dort ab Abschluss ~17.8.2026; ne.ch-Adresse 12.7.2026 noch Nr. 10). Adressen: gerichtsbehoerden-kantone.md',
    },
    berufung: berufungVon('NE', 'Tribunal cantonal, Cour pénale / Autorité de recours pénal'),
    zmg: {
      name: 'Tribunal des mesures de contrainte (Sektion des Tribunal régional)',
      plzOrt: undefined,
      hinweis: 'Art. 31–32 OJN. Genaue Hausnummer nicht separat belegt — offen; am jeweiligen Tribunal régional',
    },
  },
  GE: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Tribunal de police / correctionnel / criminel',
      system: 'Drei nach Straferwartung gestufte Strafgerichte am selben Komplex: Tribunal de police (Einzelrichter, Art. 95 f. LOJ), Tribunal correctionnel (> 2 bis 10 J., Art. 97 f.), Tribunal criminel (> 10 J., Art. 99 f.)',
      strasse: 'Rue des Chaudronniers 9, Bât. H, CP 3715',
      plzOrt: '1204 Genève',
      hinweis: '⚠ Diskrepanz zu gerichtsbehoerden: dort Tribunal de première instance (Zivil) am Bourg-de-Four 1 — die Strafgerichte sitzen an der Rue des Chaudronniers 9 (gleicher Justizkomplex Altstadt, andere Hausadresse). Greffe CP 3715, 1211 Genève 3',
    },
    berufung: berufungVon('GE', 'Cour de justice, Chambre pénale d’appel et de révision / Chambre pénale de recours'),
    zmg: {
      name: 'Tribunal des mesures de contrainte',
      strasse: 'Rue des Chaudronniers 9',
      plzOrt: '1204 Genève',
      hinweis: 'Art. 94 LOJ; am Justizkomplex der Strafgerichte — eigene Hausnummer nicht separat publiziert',
    },
  },
  JU: {
    stand: STAND,
    quelle: QUELLE,
    ersteInstanz: {
      name: 'Juge pénal / Tribunal pénal',
      strasse: 'Chemin du Château 9, Case postale',
      plzOrt: '2900 Porrentruy',
      hinweis: '3 Richter (Art. 32 lit. e–f LOJ), als Sektion des Tribunal de première instance',
    },
    berufung: berufungVon('JU', 'Tribunal cantonal, Cour pénale / Chambre pénale des recours'),
    zmg: {
      name: 'Juge des mesures de contrainte',
      strasse: 'Chemin du Château 9',
      plzOrt: '2900 Porrentruy',
      hinweis: 'Art. 32 lit. g LOJ',
    },
  },
};

export function strafgerichteFuer(k: Kanton): KantonStrafgerichte {
  return STRAFGERICHTE[k];
}
