import type { Kanton } from '../types/legal';

// ─── Staatsanwaltschaften: zentrale Anlauf-/Leitungsstelle je Kanton ────────
// Rechtsweg «Straf» (Task 7b, 6.6.2026). Quelle: ZWEIFACH GEPRÜFTES Dossier
// bibliothek/behoerden/strafbehoerden-kantone.md (inkl. der Korrekturen des
// adversarialen Durchgangs: SZ Schmiedgasse 21 statt Archivgasse · AG
// Frey-Herosé-Strasse 20 · VD MP central Renens · TG Maurerstrasse 8 ·
// BL Strafjustizzentrum Muttenz). Es ist die ZENTRALE Stelle — regionale
// Abteilungen weist das Dossier bzw. das kantonale Portal aus.

export interface Staatsanwaltschaft {
  name: string;
  strasse: string;
  plzOrt: string;
  hinweis?: string;
}

export const STAATSANWALTSCHAFTEN: Record<Kanton, Staatsanwaltschaft> = {
  ZH: { name: 'Oberstaatsanwaltschaft des Kantons Zürich', strasse: 'Güterstrasse 33, Postfach', plzOrt: '8010 Zürich', hinweis: '5 allgemeine + 4 besondere Staatsanwaltschaften; Anzeige auch bei jeder Polizeiwache' },
  BE: { name: 'Generalstaatsanwaltschaft des Kantons Bern', strasse: 'Nordring 8', plzOrt: '3013 Bern', hinweis: '4 Regionale Staatsanwaltschaften + besondere Aufgaben (Re-Audit 6.6.2026: Sitzverlegung — Maulbeerstrasse 10 überholt)' },
  LU: { name: 'Oberstaatsanwaltschaft Luzern', strasse: 'Zentralstrasse 28, Postfach', plzOrt: '6002 Luzern' },
  UR: { name: 'Staatsanwaltschaft Uri', strasse: 'Bahnhofstrasse 1', plzOrt: '6460 Altdorf' },
  SZ: { name: 'Staatsanwaltschaft Schwyz (Amtsleitung)', strasse: 'Schmiedgasse 21', plzOrt: '6431 Schwyz', hinweis: 'Abteilungen auch in Wollerau (Bahnhofstrasse 4) und Bennau (Jugendanwaltschaft)' },
  OW: { name: 'Staatsanwaltschaft Obwalden', strasse: 'Enetriederstrasse 1', plzOrt: '6060 Sarnen' },
  NW: { name: 'Staatsanwaltschaft Nidwalden', strasse: 'Kreuzstrasse 2, Postfach 1242', plzOrt: '6371 Stans' },
  GL: { name: 'Staats- und Jugendanwaltschaft Glarus', strasse: 'Postgasse 29', plzOrt: '8750 Glarus' },
  ZG: { name: 'Staatsanwaltschaft Zug', strasse: 'An der Aa 4', plzOrt: '6300 Zug' },
  FR: { name: 'Staatsanwaltschaft / Ministère public Freiburg', strasse: 'Liebfrauenplatz 4, Postfach', plzOrt: '1701 Freiburg' },
  SO: { name: 'Staatsanwaltschaft Solothurn', strasse: 'Franziskanerhof, Barfüssergasse 28', plzOrt: '4502 Solothurn', hinweis: 'Abteilung Olten: Amthausquai 23' },
  BS: { name: 'Staatsanwaltschaft Basel-Stadt', strasse: 'Binningerstrasse 21', plzOrt: '4051 Basel' },
  BL: { name: 'Staatsanwaltschaft Basel-Landschaft (Strafjustizzentrum)', strasse: 'Grenzacherstrasse 8', plzOrt: '4132 Muttenz', hinweis: 'Hauptabteilung Strafbefehle separat: Rheinstrasse 12, 4410 Liestal' },
  SH: { name: 'Staatsanwaltschaft Schaffhausen (Allgemeine Abteilung)', strasse: 'Beckenstube 7 (Regierungsgebäude)', plzOrt: '8200 Schaffhausen' },
  AR: { name: 'Staatsanwaltschaft Appenzell Ausserrhoden', strasse: 'Schützenstrasse 1A', plzOrt: '9100 Herisau', hinweis: 'Sitz in Herisau — nicht in Trogen (dort die Gerichte)' },
  AI: { name: 'Staatsanwaltschaft Appenzell Innerrhoden', strasse: 'Unteres Ziel 20', plzOrt: '9050 Appenzell' },
  SG: { name: 'Untersuchungsamt St. Gallen', strasse: 'St. Leonhard-Strasse 7', plzOrt: '9001 St. Gallen', hinweis: 'regionale Untersuchungsämter in Altstätten/Uznach/Gossau; Kantonales Untersuchungsamt Spisergasse 15' },
  GR: { name: 'Staatsanwaltschaft Graubünden', strasse: 'Rohanstrasse 5', plzOrt: '7001 Chur' },
  AG: { name: 'Oberstaatsanwaltschaft des Kantons Aargau', strasse: 'Frey-Herosé-Strasse 20', plzOrt: '5001 Aarau', hinweis: '6 regionale Staatsanwaltschaften (u. a. Brugg-Zurzach: Wildischachen 14, 5200 Brugg)' },
  TG: { name: 'Generalstaatsanwaltschaft Thurgau', strasse: 'Maurerstrasse 8', plzOrt: '8510 Frauenfeld', hinweis: 'regionale Abteilungen Frauenfeld/Bischofszell/Kreuzlingen' },
  TI: { name: 'Ministero pubblico del Cantone Ticino', strasse: 'Via Pretorio 16', plzOrt: '6901 Lugano', hinweis: 'Zweigstelle: Viale Stefano Franscini 17, 6500 Bellinzona' },
  VD: { name: 'Ministère public central du canton de Vaud', strasse: 'Avenue de Longemalle 1', plzOrt: '1020 Renens', hinweis: '4 Ministères publics d’arrondissement (Lausanne, Est vaudois, La Côte, Nord vaudois)' },
  VS: { name: 'Ministère public / Staatsanwaltschaft Wallis (Office central)', strasse: 'Rue des Vergers 9, CP 2305', plzOrt: '1950 Sion 2', hinweis: 'regionale Offices: Brig (Überlandstrasse 42) / Sion / St-Maurice (Place Ste-Marie 6)' },
  NE: { name: 'Ministère public du canton de Neuchâtel', strasse: 'Passage de la Bonne-Fontaine 41', plzOrt: '2300 La Chaux-de-Fonds' },
  GE: { name: 'Ministère public du canton de Genève', strasse: 'Route de Chancy 6B, CP 3565', plzOrt: '1213 Petit-Lancy', hinweis: 'Übertretungen: Service des contraventions, Chemin de la Gravière 5, 1227 Les Acacias' },
  JU: { name: 'Ministère public du canton du Jura', strasse: 'Chemin du Château 9', plzOrt: '2900 Porrentruy' },
};

/** Bundesanwaltschaft — bei Bundesgerichtsbarkeit (Art. 23/24 StPO). */
export const BUNDESANWALTSCHAFT: Staatsanwaltschaft = {
  name: 'Bundesanwaltschaft',
  strasse: 'Guisanplatz 1',
  plzOrt: '3003 Bern',
  hinweis: 'Zweigstellen in Zürich (Werdstrasse 138/140), Lausanne und Lugano',
};

export function staatsanwaltschaftFuer(kanton: Kanton): Staatsanwaltschaft {
  return STAATSANWALTSCHAFTEN[kanton];
}
