import type { Kanton } from '../types/legal';

// ─── Betreibungsämter aller Kantone (Recherche-Schicht) ─────────────────────
//
// Auftrag David 7.6.2026 («bau», Betreibungsamt-Finder nach EasyGov-Vorbild):
// Der SchKG-Zuständigkeitsrechner soll am Betreibungsort das KONKRETE
// Betreibungsamt zeigen statt nur auf EasyGov zu verlinken. Quelle ist das
// ZWEIFACH GEPRÜFTE Dossier (Erstrecherche + adversarialer Durchgang je
// Kanton, 52 Agents 7.6.2026):
//   bibliothek/behoerden/betreibungskreise-kantone.md
//
// EHRLICHKEITS-MODELL (§8, Muster schlichtungsstellen.ts) — drei Stufen:
//   'einheitsamt'  EIN kantonales Amt → konkrete Adresse (10 Kantone)
//   'kreise'       Bezirks-/Regional-/Gemeindeämter → alle mit Adresse +
//                  Zuständigkeitsgebiet; Gemeinde→Amt-Auflösung über
//                  betreibung/amtAufloesung.ts, wo amtlich belegt
//   'verzeichnis'  (noch) nicht erfasst → amtliches kantonales Verzeichnis
// Jeder Kanton trägt quelle + stand. Status der Schicht: Recherche zweifach
// geprüft, FACHLICHE ABNAHME DURCH DAVID AUSSTEHEND — die UI legt das offen.
//
// ACHTUNG Pflege (Verfallsregister): ZH-Reorganisation 56→34/18 Kreise in
// Vernehmlassung (RR-Beschluss 5.11.2025); BE 4 Regionen erst seit 1.1.2026.

export interface BetreibungsamtAdresse {
  name: string;
  strasse: string;
  plzOrt: string;
  /** Bei 'kreise': wofür dieses Amt zuständig ist (Bezirk/Region/Gemeinden). */
  zustaendigFuer?: string;
  hinweis?: string;
  /** Amtliche Detailseite DIESES Amts (nur https). */
  url?: string;
}

export type BetreibungsamtAufloesung =
  | { modus: 'einheitsamt'; amt: BetreibungsamtAdresse }
  | { modus: 'kreise'; aemter: BetreibungsamtAdresse[]; hinweis?: string }
  | { modus: 'verzeichnis'; beschreibung: string; url: string };

export interface KantonBetreibungsaemter {
  stand: string;
  quelle: string;
  /** Kantonale Übersichts-/Verzeichnisseite als Fallback-Link (nur https). */
  url?: string;
  aufloesung: BetreibungsamtAufloesung;
}

const EINHEITSAMT = (
  name: string, strasse: string, plzOrt: string, hinweis?: string, url?: string,
): BetreibungsamtAufloesung =>
  ({ modus: 'einheitsamt', amt: { name, strasse, plzOrt, ...(hinweis ? { hinweis } : {}), ...(url ? { url } : {}) } });

export const BETREIBUNGSAEMTER: Record<Kanton, KantonBetreibungsaemter> = {
  // ── Einheitsamt-Kantone (Etappe 1; Adressen adressgeprüft 7.6.2026) ───────
  OW: {
    stand: '7.6.2026', quelle: 'ow.ch (Fachbereich Betreibung und Konkurs)',
    url: 'https://www.ow.ch/fachbereiche/1906',
    aufloesung: EINHEITSAMT('Betreibungs- und Konkursamt Obwalden', 'Enetriederstrasse 1', '6060 Sarnen',
      'Ein Kreis für den ganzen Kanton; Zweigstelle Engelberg bis auf Weiteres geschlossen.'),
  },
  NW: {
    stand: '7.6.2026', quelle: 'nw.ch (Betreibungs- und Konkursamt)',
    url: 'https://www.nw.ch/baka/315',
    aufloesung: EINHEITSAMT('Betreibungs- und Konkursamt Nidwalden', 'Engelbergstrasse 34, Postfach 1243', '6371 Stans',
      'Ein Kreis mit Sitz in Stans (Art. 1 EG SchKG NW).'),
  },
  GL: {
    stand: '7.6.2026', quelle: 'gl.ch (Departement Sicherheit und Justiz)',
    url: 'https://www.gl.ch/verwaltung/sicherheit-und-justiz/justiz/betreibungs-konkursamt.html/1258',
    aufloesung: EINHEITSAMT('Betreibungs- und Konkursamt des Kantons Glarus', 'Zwinglistrasse 8', '8750 Glarus'),
  },
  BS: {
    stand: '7.6.2026', quelle: 'bs.ch · staatskalender.bs.ch',
    url: 'https://www.bs.ch/gerichte-judikative/betreibungs-und-konkursamt',
    aufloesung: EINHEITSAMT('Betreibungs- und Konkursamt Basel-Stadt (Abteilung Betreibungen)', 'Aeschenvorstadt 56', '4051 Basel',
      'Postadresse: Postfach, 4001 Basel.'),
  },
  BL: {
    stand: '7.6.2026', quelle: 'baselland.ch (Zivilrechtsverwaltung)',
    url: 'https://www.baselland.ch/politik-und-behorden/direktionen/sicherheitsdirektion/zivilrechtsverwaltung/betreibungsamt/',
    aufloesung: EINHEITSAMT('Betreibungs- und Konkursamt Basel-Landschaft (Betreibungsabteilung)', 'Eichenweg 12, Postfach', '4410 Liestal'),
  },
  SH: {
    stand: '7.6.2026', quelle: 'sh.ch (Betreibungs- und Konkursamt; Einheitsamt seit 1.1.2025, SHR 281.101)',
    url: 'https://sh.ch/CMS/Webseite/Kanton-Schaffhausen/Beh-rde/Justiz/Betreibungs--und-Konkursamt-407143-DE.html',
    aufloesung: EINHEITSAMT('Betreibungsamt Schaffhausen', 'Münsterplatz 31', '8200 Schaffhausen',
      'Ein Kreis für den ganzen Kanton seit 1.1.2025 (frühere Regionalstellen geschlossen).'),
  },
  AI: {
    stand: '7.6.2026', quelle: 'ai.ch (Volkswirtschaftsdepartement)',
    url: 'https://www.ai.ch/verwaltung/volkwirtschaftsdepartement/betreibungs-und-konkursamt',
    aufloesung: EINHEITSAMT('Betreibungs- und Konkursamt Appenzell I.Rh.', 'Marktgasse 2', '9050 Appenzell',
      'Ein Kreis seit 1.6.2024 (Betreibungsamt Oberegg integriert).'),
  },
  NE: {
    stand: '7.6.2026', quelle: 'ne.ch (Service des poursuites et faillites)',
    url: 'https://www.ne.ch/autorites/DESC/SEPF/Organisation/Pages/ofpo.aspx',
    aufloesung: EINHEITSAMT('Office des poursuites du canton de Neuchâtel', 'Rue de Tivoli 28, Case postale 1', '2002 Neuchâtel 2'),
  },
  GE: {
    stand: '7.6.2026', quelle: 'ge.ch (Office cantonal des poursuites)',
    url: 'https://www.ge.ch/organisation/ocp-direction-office-cantonal-poursuites',
    aufloesung: EINHEITSAMT('Office cantonal des poursuites (OCP)', 'Rue du Stand 46', '1204 Genève',
      'Postadresse: Case postale 208, 1211 Genève 8.'),
  },
  JU: {
    stand: '7.6.2026', quelle: 'jura.ch (Office des poursuites et faillites)',
    url: 'https://www.jura.ch/fr/Autorites/Administration/DFI/Office-des-poursuites-et-faillites-OPF.html',
    aufloesung: EINHEITSAMT('Office des poursuites et faillites (OPF)', 'Rue Auguste-Cuenin 15', '2900 Porrentruy',
      'Sitz Porrentruy; Permanence Delémont nach Voranmeldung.'),
  },

  // ── Kreis-Kantone (Etappe 2 in Arbeit — bis dahin amtliches Verzeichnis) ──
  ZH: {
    stand: '7.6.2026', quelle: 'Betreibungsinspektorat ZH (Obergericht)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '55 Betreibungs- und Stadtammannämter in Betreibungskreisen (§ 1 EG SchKG ZH); PLZ-/Ortssuche beim Betreibungsinspektorat', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo.php' },
  },
  BE: {
    stand: '7.6.2026', quelle: 'baka.dij.be.ch (Betreibungs- und Konkursamt des Kantons Bern)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '4 Regionen mit 8 Dienststellen (seit 1.1.2026)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort.html' },
  },
  FR: {
    stand: '7.6.2026', quelle: 'fr.ch (Betreibungsämter und Konkursamt)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '7 Bezirks-Betreibungsämter (je Verwaltungsbezirk eines)', url: 'https://www.fr.ch/de/sjsd/baka' },
  },
  SO: {
    stand: '7.6.2026', quelle: 'so.ch (Betreibungsämter, amtliche Gemeinde-Zuordnung)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '5 Betreibungsämter (= Amtschreibereikreise) mit amtlicher Gemeinde-Zuordnungsliste', url: 'https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/zuordnung-der-gemeinden-1/' },
  },
  AR: {
    stand: '7.6.2026', quelle: 'ar.ch (Betreibungsämter und Konkursamt)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '3 regionale Betreibungsämter (Art. 1 EG SchKG AR)', url: 'https://ar.ch/verwaltung/departement-inneres-und-sicherheit/departementssekretariat/betreibungsaemter-und-konkursamt/betreibungsaemter/' },
  },
  GR: {
    stand: '7.6.2026', quelle: 'justiz-gr.ch (Betreibungs- und Konkursämter)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '11 Regionen-Ämter (jede Region = ein Betreibungs- und Konkurskreis, Art. 1 EGzSchKG)', url: 'https://www.justiz-gr.ch/schuldbetreibung-und-konkurs/ueber-uns/betreibungs-und-konkursaemter/' },
  },
  TG: {
    stand: '7.6.2026', quelle: 'betreibungsamt.tg.ch (Amt für Betreibungs- und Konkurswesen)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '5 Bezirksbetreibungsämter (§ 57 ZSRG: «Jeder Bezirk hat ein Betreibungsamt»)', url: 'https://betreibungsamt.tg.ch/html/928' },
  },
  TI: {
    stand: '7.6.2026', quelle: 'ti.ch (Sezione di esecuzione e fallimento)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '8 Uffici di esecuzione (je circondario)', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
  },
  VD: {
    stand: '7.6.2026', quelle: 'vd.ch (Offices des poursuites)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '10 Offices des poursuites (je district)', url: 'https://www.vd.ch/ojv/offices-des-poursuites' },
  },
  VS: {
    stand: '7.6.2026', quelle: 'vs.ch (Office des poursuites compétent)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '5 Betreibungsämter (Arrondissements)', url: 'https://www.vs.ch/de/web/spf/office-competent' },
  },

  // ── Gemeinde-/Mischkantone (Etappe 3 — amtliches bzw. deklariertes
  //    Verzeichnis; SZ/AG sind VERBANDS-Verzeichnisse, offengelegt §8) ───────
  LU: {
    stand: '7.6.2026', quelle: 'gerichte.lu.ch (Verzeichnis der Betreibungsämter)',
    aufloesung: { modus: 'verzeichnis', beschreibung: 'Gemeinde-Betreibungskreise mit laufenden Zusammenschlüssen (§ 1 EGSchKG LU); amtliche Liste der Gerichte', url: 'https://gerichte.lu.ch/organisation/betreibungsaemter' },
  },
  UR: {
    stand: '7.6.2026', quelle: 'ur.ch (Betreibungswesen)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '2 Betreibungskreise', url: 'https://www.ur.ch/rechtsgebiete/3912' },
  },
  SZ: {
    stand: '7.6.2026', quelle: 'ba-sz.ch (Ämterverzeichnis der Schwyzer Betreibungsämter — Verbandsseite)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '11 Betreibungsämter (Bezirks-/Gemeindekreise, § 1 EGzSchKG SZ); Verzeichnis verbandsgeführt', url: 'https://ba-sz.ch/home/aemterverzeichnis/' },
  },
  ZG: {
    stand: '7.6.2026', quelle: 'zg.ch (Adressliste Betreibungsämter, PDF Stand 2/2023)',
    aufloesung: { modus: 'verzeichnis', beschreibung: '8 Betreibungsämter der Einwohnergemeinden (Zusammenschlüsse möglich)', url: 'https://zg.ch/dam/jcr:87cb3853-5a22-4f9b-928e-40d220e2f906/Adressen%20Betreibungs%C3%A4mter%20Stand%20Februar%202023.pdf' },
  },
  SG: {
    stand: '7.6.2026', quelle: 'sGS 971.1 Art. 1 (jede politische Gemeinde = Betreibungskreis); kein zentrales kantonales Adressverzeichnis (Negativbefund)',
    aufloesung: { modus: 'verzeichnis', beschreibung: 'Jede politische Gemeinde bildet einen Betreibungskreis — Adresse bei der Gemeindeverwaltung; amtliche Suche über EasyGov (SECO)', url: 'https://www.easygov.swiss/easygov/#/de/public/betreibungen/betreibungsamt-finden' },
  },
  AG: {
    stand: '7.6.2026', quelle: 'ag.ch (Betreibungsinspektorat); Verbands-Amtsverzeichnis betreibungsamt-ag.ch am 7.6.2026 nicht erreichbar',
    aufloesung: { modus: 'verzeichnis', beschreibung: 'Gemeinde- und Regional-Betreibungskreise (§ 1 EG SchKG AG); Auskunft über das Betreibungsinspektorat', url: 'https://www.ag.ch/de/ueber-uns/gerichte-kanton-aargau/organisation/betreibungs-und-konkurswesen/betreibungsinspektorat' },
  },
};
