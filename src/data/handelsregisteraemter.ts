// Dossier: bibliothek/behoerden/handelsregisteraemter-kantone.md
import type { Kanton } from '../types/legal';

// ─── Kantonale Handelsregisterämter (Anmeldung Gründung/Kapitalerhöhung) ─────
//
// Stammdaten-Quelle: bibliothek/behoerden/handelsregisteraemter-kantone.md
// (Erstrecherche 7.6.2026 über die amtlichen kantonalen Behördenseiten;
// zefix-REST-API liefert 401 — Abgleich offen, Verfallsregister). Geführt
// wird je Kanton der HAUPTSITZ; Mehrfach-Standorte (VS: 3 Arrondissements,
// TI: Amt in Biasca) als Hinweis offengelegt (§8). Jeder Kanton führt ein
// EIGENES Amt (kein Konkordat, Art. 927 OR/HRegV — empirisch 26/26 geprüft).
// Status: ERSTRECHERCHE, fachliche Abnahme David ausstehend — die UI sagt das.

export interface HrAmtEintrag {
  name: string;
  strasse: string;
  plzOrt: string;
  telefon: string;
  url: string;
  /** Mehrstandort-/Bezeichnungs-Besonderheit für die Hinweiszeile (§8). */
  hinweis?: string;
}

export const HR_AEMTER_STAND = '7.6.2026';

export const HR_AEMTER: Record<Kanton, HrAmtEintrag> = {
  ZH: { name: 'Handelsregisteramt des Kantons Zürich', strasse: 'Schöntalstrasse 5, Postfach', plzOrt: '8022 Zürich', telefon: '+41 43 259 74 00', url: 'https://www.zh.ch/de/direktion-der-justiz-und-des-innern/handelsregisteramt.html' },
  BE: { name: 'Handelsregisteramt des Kantons Bern', strasse: 'Poststrasse 25', plzOrt: '3071 Ostermundigen', telefon: '+41 31 633 43 60', url: 'https://www.hra.dij.be.ch/' },
  LU: { name: 'Handelsregister des Kantons Luzern', strasse: 'Bundesplatz 14', plzOrt: '6002 Luzern', telefon: '+41 41 228 58 16', url: 'https://handelsregister.lu.ch/' },
  UR: { name: 'Handelsregisteramt des Kantons Uri', strasse: 'Bahnhofstrasse 1', plzOrt: '6460 Altdorf', telefon: '+41 41 875 22 72', url: 'https://www.ur.ch/dienstleistungen/3349' },
  SZ: { name: 'Handelsregister des Kantons Schwyz (Amt für Wirtschaft)', strasse: 'Bahnhofstrasse 15, Postfach 1185', plzOrt: '6431 Schwyz', telefon: '+41 41 819 16 50', url: 'https://www.sz.ch/behoerden/verwaltung/volkswirtschaftsdepartement/amt-fuer-wirtschaft/handelsregister.html/8756-8758-8802-10373-10943-10947' },
  OW: { name: 'Handelsregister des Kantons Obwalden (Volkswirtschaftsamt)', strasse: 'St. Antonistrasse 4', plzOrt: '6060 Sarnen', telefon: '+41 41 666 62 21', url: 'https://www.ow.ch/fachbereiche/1876' },
  NW: { name: 'Handelsregisteramt des Kantons Nidwalden', strasse: 'Stansstaderstrasse 54, Postfach 1251', plzOrt: '6371 Stans', telefon: '+41 41 618 76 90', url: 'https://www.nw.ch/hregamt/316' },
  GL: { name: 'Handelsregister des Kantons Glarus', strasse: 'Zwinglistrasse 6', plzOrt: '8750 Glarus', telefon: '+41 55 646 66 30', url: 'https://www.gl.ch/verwaltung/volkswirtschaft-und-inneres/wirtschaft-und-arbeit/handelsregister.html/1038' },
  ZG: { name: 'Handelsregisteramt des Kantons Zug', strasse: 'Industriestrasse 24', plzOrt: '6300 Zug', telefon: '+41 41 594 55 60', url: 'https://zg.ch/de/wirtschaft-arbeit/handelsregister' },
  FR: { name: 'Service du registre du commerce (SRC) / Handelsregisteramt', strasse: 'Boulevard de Pérolles 25, Case postale', plzOrt: '1701 Fribourg', telefon: '+41 26 305 30 90', url: 'https://www.fr.ch/deef/src' },
  SO: { name: 'Kantonales Handelsregisteramt Solothurn', strasse: 'Schmelzihof, Wengimattstrasse 2', plzOrt: '4710 Klus-Balsthal', telefon: '+41 62 311 90 51', url: 'https://so.ch/verwaltung/finanzdepartement/kantonales-handelsregister/' },
  BS: { name: 'Handelsregisteramt Basel-Stadt', strasse: 'Postfach (Schalter: Claramattweg 8)', plzOrt: '4001 Basel', telefon: '+41 61 267 44 55', url: 'https://www.bs.ch/jsd/zentraler-rechtsdienst/handelsregisteramt' },
  BL: { name: 'Handelsregisteramt Basel-Landschaft (Zivilrechtsverwaltung)', strasse: 'Domplatz 13 (Eingang Domplatz 9), Postfach', plzOrt: '4144 Arlesheim', telefon: '+41 61 552 46 80', url: 'https://oslvb.bl.ch/Behoerdengang/213' },
  SH: { name: 'Handelsregisteramt des Kantons Schaffhausen', strasse: 'Mühlentalstrasse 105', plzOrt: '8200 Schaffhausen', telefon: '+41 52 632 72 22', url: 'https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Verwaltung/Volkswirtschaftsdepartement/Handelsregisteramt-3872-DE.html' },
  AR: { name: 'Handelsregister Appenzell Ausserrhoden (Amt für Wirtschaft und Arbeit)', strasse: 'Obstmarkt 3, Postfach', plzOrt: '9102 Herisau', telefon: '+41 71 353 61 11', url: 'https://ar.ch/verwaltung/departement-bau-und-volkswirtschaft/amt-fuer-wirtschaft-und-arbeit/handelsregister/' },
  AI: { name: 'Handelsregisteramt des Kantons Appenzell Innerrhoden', strasse: 'Marktgasse 2', plzOrt: '9050 Appenzell', telefon: '+41 71 788 96 66', url: 'https://www.ai.ch/verwaltung/volkwirtschaftsdepartement/handelsregisteramt' },
  SG: { name: 'Amt für Handelsregister und Notariate (Hauptsitz St. Gallen)', strasse: 'Davidstrasse 27', plzOrt: '9001 St. Gallen', telefon: '+41 58 229 37 24', url: 'https://www.sg.ch/recht/handelsregister-notariate/standorte/hauptsitz-st-gallen.html' },
  GR: { name: 'Grundbuchinspektorat und Handelsregister (GIHA)', strasse: 'Ringstrasse 10', plzOrt: '7001 Chur', telefon: '+41 81 257 24 85', url: 'https://www.gr.ch/DE/institutionen/verwaltung/dvs/giha/handelsregister/Seiten/handelsregister.aspx', hinweis: 'HR und Grundbuch in einem Amt (amtliche Bezeichnung GIHA).' },
  AG: { name: 'Handelsregisteramt des Kantons Aargau', strasse: 'Bahnhofplatz 3c', plzOrt: '5001 Aarau', telefon: '+41 62 835 14 80', url: 'https://www.ag.ch/de/themen/wirtschaft-arbeit/handelsregister' },
  TG: { name: 'Amt für Handelsregister und Zivilstandswesen', strasse: 'Bahnhofplatz 65', plzOrt: '8510 Frauenfeld', telefon: '+41 58 345 70 70', url: 'https://hz.tg.ch/handelsregister.html/3164' },
  TI: { name: 'Ufficio del registro di commercio', strasse: 'Via Tognola 7', plzOrt: '6710 Biasca', telefon: '+41 91 816 29 81', url: 'https://www4.ti.ch/di/dg/rf/contatti/ufficio-del-registro-di-commercio', hinweis: 'Das Amt sitzt in Biasca (die übergeordnete Sezione dei registri in Bellinzona).' },
  VD: { name: 'Office cantonal du registre du commerce (OJV)', strasse: 'Rue de la Grenade 38, Case postale', plzOrt: '1510 Moudon', telefon: '+41 21 557 81 21', url: 'https://www.vd.ch/ojv/office-cantonal-du-registre-du-commerce' },
  VS: { name: 'Registre du commerce du Valais central (2e arrondissement)', strasse: 'Place du Midi 30', plzOrt: '1951 Sion', telefon: '+41 27 322 92 05', url: 'https://www.vs.ch/web/ext-rc/contacts', hinweis: 'Drei gleichrangige Bezirksämter (Brig-Glis · Sion · St-Maurice) — massgeblich ist der Sitz-Bezirk; geführt ist das zentrale Amt in Sion.' },
  NE: { name: 'Office du registre du commerce', strasse: 'Rue de Tivoli 5, Case postale 1', plzOrt: '2002 Neuchâtel 2', telefon: '+41 32 889 61 14', url: 'https://www.ne.ch/autorites/decs/neco/ocrc' },
  GE: { name: 'Registre du commerce (OCIRT)', strasse: 'Rue du Puits-Saint-Pierre 4', plzOrt: '1204 Genève', telefon: '+41 22 546 88 60', url: 'https://www.ge.ch/organisation/ocirt-registre-du-commerce-rc' },
  JU: { name: 'Service du registre foncier et du registre du commerce (RFC)', strasse: 'Rue de la Justice 2', plzOrt: '2800 Delémont', telefon: '+41 32 420 59 77', url: 'https://www.jura.ch/rc', hinweis: 'HR und Grundbuch in einem Amt (RFC).' },
};
