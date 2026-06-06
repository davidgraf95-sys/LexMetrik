import type { Kanton } from '../types/legal';

// ─── Obere kantonale Instanzen (Zivil-Rechtsmittel) ─────────────────────────
//
// Ausbau «obere Instanzen» (Anordnung David 5.6.2026). Quelle: ZWEIFACH
// GEPRÜFTE Dossiers bibliothek/behoerden/gerichtsbehoerden-kantone.md +
// gerichtsadressen-erstliste.md (Audit-Trail; dort korrigiert u. a.
// BE 3012 statt 3001). Abruf 5.6.2026; LU per Adress-Re-Audit 6.6.2026 auf
// 6002 (Postfach-PLZ Hirschengraben 16) gestellt — siehe hinweis am Eintrag.
// NAMENSLOGIK-FALLE (Dossier-Befund): «Kantonsgericht» ist in GL/SH/AR/OW/NW
// die ERSTE Instanz — die obere heisst dort Obergericht; in SG/AI/VS/FR/BL/LU
// ist «Kantonsgericht» die OBERE Instanz. Deshalb hier explizit je Kanton.

export interface ObereInstanz {
  name: string;
  strasse: string;
  plzOrt: string;
  hinweis?: string;
  // Spruchkörper-Ausbau (Auftrag David 6.6.2026; Erstrecherche-Dossier
  // bibliothek/behoerden/rechtsmittel-spruchkoerper-kantone.md §5): NUR
  // deterministisch + amtlich belegte Zuteilungen — Rest bewusst offen
  // (ZH/BE/SG/GR Geschäftsverteilung, BS streitwertabhängig, ZG-Schnitt
  // unbestätigt; Einkammer-Kantone redundant zum name).
  /** Spruchkörper für die Berufung (Art. 308 ZPO) — nur wenn deterministisch belegt. */
  kammerBerufung?: string;
  /** Spruchkörper für die Beschwerde (Art. 319 ZPO) — nur wenn er sich vom
   *  Berufungs-Spruchkörper unterscheidet (sonst weglassen). */
  kammerBeschwerde?: string;
  /** Quelle (Erlass + Art./§, konsolidierte Fassung) der Spruchkörper-Angabe. */
  quelleSpruchkoerper?: string;
}

export const OBERE_INSTANZEN: Record<Kanton, ObereInstanz> = {
  ZH: { name: 'Obergericht des Kantons Zürich', strasse: 'Hirschengraben 13/15', plzOrt: '8001 Zürich' },
  BE: { name: 'Obergericht des Kantons Bern', strasse: 'Hochschulstrasse 17', plzOrt: '3012 Bern' },
  LU: { name: 'Kantonsgericht Luzern', strasse: 'Hirschengraben 16, Postfach 3569', plzOrt: '6002 Luzern', hinweis: 'Postadresse (6003 = Paket-/Hauszustellung)' },
  UR: { name: 'Obergericht Uri', strasse: 'Rathausplatz 2', plzOrt: '6460 Altdorf' },
  SZ: { name: 'Kantonsgericht Schwyz', strasse: 'Kollegiumstrasse 28, Postfach 2265', plzOrt: '6431 Schwyz' },
  OW: { name: 'Obergericht Obwalden', strasse: 'Poststrasse 6', plzOrt: '6061 Sarnen' },
  NW: { name: 'Obergericht Nidwalden', strasse: 'Bahnhofplatz 3, Postfach 1241', plzOrt: '6371 Stans' },
  GL: { name: 'Obergericht des Kantons Glarus', strasse: 'Gerichtshaus, Spielhof 6', plzOrt: '8750 Glarus' },
  ZG: { name: 'Obergericht des Kantons Zug', strasse: 'Kirchenstrasse 6, Postfach', plzOrt: '6301 Zug' },
  FR: { name: 'Kantonsgericht Freiburg / Tribunal cantonal', strasse: 'Rue des Augustins 3, CP 630', plzOrt: '1701 Freiburg' },
  SO: { name: 'Obergericht des Kantons Solothurn', strasse: 'Amthaus 1, Bielstrasse 1', plzOrt: '4502 Solothurn' },
  BS: { name: 'Appellationsgericht Basel-Stadt', strasse: 'Bäumleingasse 1', plzOrt: '4051 Basel' },
  BL: { name: 'Kantonsgericht Basel-Landschaft', strasse: 'Bahnhofplatz 16', plzOrt: '4410 Liestal' },
  SH: { name: 'Obergericht des Kantons Schaffhausen', strasse: 'Frauengasse 17', plzOrt: '8200 Schaffhausen' },
  AR: { name: 'Obergericht Appenzell Ausserrhoden', strasse: 'Fünfeckpalast, Postfach', plzOrt: '9043 Trogen', hinweis: 'Hausnummer amtlich nicht publiziert' },
  AI: { name: 'Kantonsgericht Appenzell Innerrhoden', strasse: 'Zielstrasse 38', plzOrt: '9050 Appenzell' },
  SG: { name: 'Kantonsgericht St. Gallen', strasse: 'Klosterhof 1', plzOrt: '9001 St. Gallen' },
  GR: { name: 'Obergericht des Kantons Graubünden', strasse: 'Grabenstrasse 30', plzOrt: '7001 Chur', hinweis: 'so benannt seit der Justizreform 1.1.2025' },
  AG: { name: 'Obergericht des Kantons Aargau', strasse: 'Obere Vorstadt 38', plzOrt: '5000 Aarau' },
  TG: { name: 'Obergericht des Kantons Thurgau', strasse: 'Promenadenstrasse 12A', plzOrt: '8500 Frauenfeld' },
  TI: { name: "Tribunale d'appello", strasse: 'Via Pretorio 16', plzOrt: '6901 Lugano',
    kammerBerufung: "Camere civili del Tribunale d'appello",
    quelleSpruchkoerper: 'LOG RL 177.100 Art. 48 (Zuteilung sachgebietsabhängig; Berufung = Beschwerde)' },
  VD: { name: 'Tribunal cantonal', strasse: 'Route du Signal 8', plzOrt: '1014 Lausanne',
    // Einziger Kanton mit amtlich belegter Zuteilung NACH Rechtsmittel-Typ.
    kammerBerufung: "Cour d'appel civile",
    kammerBeschwerde: 'Chambre des recours civile',
    quelleSpruchkoerper: 'LOJV RSV 173.01 Art. 84 / Art. 73 (État 1.7.2017)' },
  VS: { name: 'Kantonsgericht Wallis / Tribunal cantonal', strasse: 'Rue Mathieu-Schiner 1', plzOrt: '1950 Sitten' },
  NE: { name: 'Tribunal cantonal', strasse: 'Rue du Pommier 1, Case postale 1', plzOrt: '2002 Neuchâtel 2', hinweis: 'Re-Audit 6.6.2026: CP 1/2002 amtlich aktuell (CP 3174/2000 überholt); Hausnummer 1 bestätigt',
    kammerBerufung: 'Cour civile du Tribunal cantonal',
    quelleSpruchkoerper: 'OJN RSN 161.1 Art. 40–42 (Berufung = Beschwerde)' },
  GE: { name: 'Cour de justice', strasse: 'Place du Bourg-de-Four 1, CP 3108', plzOrt: '1204 Genf',
    kammerBerufung: 'Chambre civile de la Cour de justice',
    quelleSpruchkoerper: 'LOJ rsGE E 2 05 Art. 119–120 (Berufung = Beschwerde)' },
  JU: { name: 'Tribunal cantonal', strasse: 'Chemin du Château 9, CP 1693', plzOrt: '2900 Porrentruy',
    kammerBerufung: 'Cour civile du Tribunal cantonal',
    quelleSpruchkoerper: 'LOJ RSJU 181.1 Art. 20 lit. b (Berufung = Beschwerde)' },
};

export function obereInstanzFuer(kanton: Kanton): ObereInstanz {
  return OBERE_INSTANZEN[kanton];
}
