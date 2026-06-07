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

  // ── Kreis-Kantone (Etappe 2 — volle Ämterlisten, amtlich extrahiert und
  //    adversarial stichproben-geprüft 7.6.2026; Gemeinde→Amt-Auflösung via
  //    betreibung/amtAufloesung.ts, Karten in betreibung/aemterKantone.json) ──
  ZH: {
    stand: '7.6.2026', quelle: 'Betreibungsinspektorat ZH (geo_det.php-Detailseiten + Ämterliste, alle Adressen von den Detailseiten)',
    url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo.php',
    aufloesung: { modus: 'kreise', hinweis: '55 Kreis-Ämter nach § 1 EG SchKG (Stadt Zürich 12, Winterthur 3 Stadtkreis-Ämter); Reorganisation (Reduktion der Kreise) in Vernehmlassung — Stand 7.6.2026 massgeblich.', aemter: [
      { name: 'Betreibungs- und Stadtammannamt Affoltern am Albis', strasse: 'Obere Bahnhofstrasse 4', plzOrt: '8910 Affoltern a.A.', zustaendigFuer: 'Affoltern am Albis, Obfelden, Ottenbach', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=5' },
      { name: 'Betreibungs- und Gemeindeammannamt Andelfingen', strasse: 'Schlossgasse 14', plzOrt: '8450 Andelfingen', zustaendigFuer: 'Bezirk Andelfingen (Adlikon bis Waltalingen)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=8' },
      { name: 'Betreibungs- und Gemeindeammannamt Bassersdorf-Nürensdorf', strasse: 'Bungertweg 1', plzOrt: '8303 Bassersdorf', zustaendigFuer: 'Bassersdorf, Nürensdorf', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=13' },
      { name: 'Betreibungs- und Gemeindeammannamt Birmensdorf', strasse: 'Zürcherstrasse 24', plzOrt: '8903 Birmensdorf', zustaendigFuer: 'Aesch, Birmensdorf, Uitikon', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=18' },
      { name: 'Betreibungs- und Gemeindeammannamt Bonstetten', strasse: 'Dorfstrasse 40', plzOrt: '8906 Bonstetten', zustaendigFuer: 'Bonstetten, Hedingen, Stallikon, Wettswil a.A.', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=148' },
      { name: 'Betreibungs- und Stadtammannamt Bülach', strasse: 'Allmendstrasse 6', plzOrt: '8180 Bülach', zustaendigFuer: 'Bachenbülach, Bülach, Hochfelden, Höri, Winkel', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=25' },
      { name: 'Betreibungs- und Gemeindeammannamt Dielsdorf - Nord', strasse: 'Hauptstrasse 22', plzOrt: '8162 Steinmaur', zustaendigFuer: 'Dielsdorf-Nord (Bachs, Dielsdorf, Neerach u.a.)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=29' },
      { name: 'Betreibungs- und Stadtammannamt Dietikon', strasse: 'Neumattstrasse 24', plzOrt: '8953 Dietikon', zustaendigFuer: 'Dietikon', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=30' },
      { name: 'Betreibungs- und Stadtammannamt Dübendorf', strasse: 'Neugutstrasse 54', plzOrt: '8600 Dübendorf', zustaendigFuer: 'Dübendorf, Wangen-Brüttisellen', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=34' },
      { name: 'Betreibungs- und Gemeindeammannamt Embrachertal', strasse: 'Bahnstrasse 1', plzOrt: '8424 Embrach', zustaendigFuer: 'Embrachertal (Embrach, Freienstein-Teufen, Lufingen, Oberembrach, Rorbas)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=40' },
      { name: 'Betreibungs- und Gemeindeammannamt Engstringen', strasse: 'Zürcherstrasse 125', plzOrt: '8102 Oberengstringen', zustaendigFuer: 'Oberengstringen, Unterengstringen', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=92' },
      { name: 'Betreibungs- und Gemeindeammannamt Fällanden', strasse: 'Schwerzenbachstrasse 10', plzOrt: '8117 Fällanden', zustaendigFuer: 'Fällanden, Maur, Schwerzenbach', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=42' },
      { name: 'Betreibungs- und Gemeindeammannamt Furttal', strasse: 'Badenerstrasse 1', plzOrt: '8107 Buchs', zustaendigFuer: 'Furttal (Boppelsen, Buchs, Dällikon, Dänikon, Hüttikon, Otelfingen)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=24' },
      { name: 'Betreibungs- und Gemeindeammannamt Geroldswil - Oetwil an der Limmat - Weiningen', strasse: 'Huebwiesenstrasse 34', plzOrt: '8954 Geroldswil', zustaendigFuer: 'Geroldswil, Oetwil a.d. Limmat, Weiningen', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=47' },
      { name: 'Betreibungs- und Gemeindeammannamt Hausen am Albis', strasse: 'Zugerstrasse 10', plzOrt: '8915 Hausen am Albis', zustaendigFuer: 'Region Hausen a.A. (Knonauer Amt Süd: Aeugst, Hausen, Kappel, Knonau, Maschwanden, Mettmenstetten, Rifferswil)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=53' },
      { name: 'Betreibungs- und Gemeindeammannamt Hinwil', strasse: 'Gossauerstrasse 14', plzOrt: '8340 Hinwil', zustaendigFuer: 'Gossau, Grüningen, Hinwil', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=58' },
      { name: 'Betreibungs- und Gemeindeammannamt Horgen', strasse: 'Dorfplatz 1', plzOrt: '8810 Horgen', zustaendigFuer: 'Hirzel, Horgen, Oberrieden', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=63' },
      { name: 'Betreibungs- und Stadtammannamt Illnau-Effretikon', strasse: 'Märtplatz 29, Stadthaus, 2.OG', plzOrt: '8307 Effretikon', zustaendigFuer: 'Illnau-Effretikon, Kyburg, Lindau', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=67' },
      { name: 'Betreibungs- und Stadtammannamt Kloten', strasse: 'Kirchgasse 7', plzOrt: '8302 Kloten', zustaendigFuer: 'Kloten', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=71' },
      { name: 'Betreibungs- und Gemeindeammannamt Küsnacht-Zollikon-Zumikon', strasse: 'Wilhofstrasse 1', plzOrt: '8125 Zollikerberg', zustaendigFuer: 'Küsnacht, Zollikon, Zumikon', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=158' },
      { name: 'Betreibungs- und Gemeindeammannamt Meilen-Herrliberg-Erlenbach', strasse: 'Dorfstrasse 100', plzOrt: '8706 Meilen', zustaendigFuer: 'Erlenbach, Herrliberg, Meilen', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=82' },
      { name: 'Betreibungs- und Gemeindeammannamt Mittleres Tösstal', strasse: 'Kugelgasse 2', plzOrt: '8492 Wila', zustaendigFuer: 'Mittleres Tösstal (Bauma, Sternenberg, Wila, Wildberg)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=151' },
      { name: 'Betreibungs- und Gemeindeammannamt Niederhasli-Niederglatt', strasse: 'Dorfstrasse 13g', plzOrt: '8155 Niederhasli', zustaendigFuer: 'Niederglatt, Niederhasli', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=88' },
      { name: 'Betreibungs- und Stadtammannamt Oberwinterthur', strasse: 'Römerstrasse 182', plzOrt: '8404 Winterthur', zustaendigFuer: 'Stadt Winterthur, Kreis Oberwinterthur', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=155' },
      { name: 'Betreibungs- und Stadtammannamt Opfikon', strasse: 'Oberhauserstrasse 25', plzOrt: '8152 Opfikon', zustaendigFuer: 'Opfikon', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=98' },
      { name: 'Betreibungs- und Gemeindeammannamt Pfäffikon', strasse: 'Hochstrasse 65', plzOrt: '8330 Pfäffikon', zustaendigFuer: 'Fehraltorf, Hittnau, Pfäffikon, Russikon, Weisslingen', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=102' },
      { name: 'Betreibungs- und Gemeindeammannamt Pfannenstiel', strasse: 'Bahnhofstrasse 6', plzOrt: '8708 Männedorf', zustaendigFuer: 'Pfannenstiel (Hombrechtikon, Männedorf, Oetwil a.S., Stäfa, Uetikon a.S.)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=78' },
      { name: 'Betreibungs- und Gemeindeammannamt Rafzerfeld', strasse: 'Obergass 17', plzOrt: '8193 Eglisau', zustaendigFuer: 'Rafzerfeld (Eglisau, Glattfelden, Hüntwangen, Rafz, Wasterkingen, Wil ZH)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=104' },
      { name: 'Betreibungs- und Gemeindeammannamt Regensdorf', strasse: 'Watterstrasse 116', plzOrt: '8105 Regensdorf', zustaendigFuer: 'Regensdorf', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=106' },
      { name: 'Betreibungs- und Gemeindeammannamt Rümlang-Oberglatt', strasse: 'Oberdorfstrasse 17', plzOrt: '8153 Rümlang', zustaendigFuer: 'Oberglatt, Rümlang', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=112' },
      { name: 'Betreibungs- und Gemeindeammannamt Rüti', strasse: 'Breitenhofstrasse 30', plzOrt: '8630 Rüti', zustaendigFuer: 'Bubikon, Dürnten, Rüti sowie Fischenthal, Wald', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=114' },
      { name: 'Betreibungs- und Stadtammannamt Schlieren/Urdorf', strasse: 'Brunngasse 5', plzOrt: '8952 Schlieren', zustaendigFuer: 'Schlieren, Urdorf', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=117' },
      { name: 'Betreibungs- und Gemeindeammannamt Seuzach', strasse: 'Birchstrasse 4', plzOrt: '8472 Seuzach', zustaendigFuer: 'Seuzach-Region u. Elgg-Region (Dinhard, Neftenbach, Pfungen, Elgg, Elsau, Wiesendangen u.a.)', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=121' },
      { name: 'Betreibungs- und Stadtammannamt Sihltal', strasse: 'Zürichstrasse 10', plzOrt: '8134 Adliswil', zustaendigFuer: 'Adliswil, Langnau am Albis', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=2' },
      { name: 'Betreibungs- und Stadtammannamt Thalwil-Rüschlikon-Kilchberg', strasse: 'Gotthardstrasse 11', plzOrt: '8800 Thalwil', zustaendigFuer: 'Kilchberg, Rüschlikon, Thalwil', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=128' },
      { name: 'Betreibungs- und Stadtammannamt Uster', strasse: 'Oberlandstrasse 82', plzOrt: '8610 Uster', zustaendigFuer: 'Egg, Greifensee, Mönchaltorf, Uster', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=136' },
      { name: 'Betreibungs- und Gemeindeammannamt Volketswil', strasse: 'Zentralstrasse 21', plzOrt: '8604 Volketswil', zustaendigFuer: 'Volketswil', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=138' },
      { name: 'Betreibungs- und Stadtammannamt Wädenswil', strasse: 'Schönenbergstrasse 4a', plzOrt: '8820 Wädenswil', zustaendigFuer: 'Hütten, Richterswil, Schönenberg, Wädenswil', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=139' },
      { name: 'Betreibungs- und Stadtammannamt Wallisellen-Dietlikon', strasse: 'Zentralstrasse 9', plzOrt: '8304 Wallisellen', zustaendigFuer: 'Dietlikon, Wallisellen', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=141' },
      { name: 'Betreibungs- und Stadtammannamt Wetzikon', strasse: 'Bahnhofstrasse 167', plzOrt: '8620 Wetzikon', zustaendigFuer: 'Bäretswil, Seegräben, Wetzikon', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=149' },
      { name: 'Betreibungs- und Stadtammannamt Winterthur-Stadt', strasse: 'Neustadtgasse 17', plzOrt: '8400 Winterthur', zustaendigFuer: 'Stadt Winterthur, Kreise Stadt/Mattenbach/Seen/Töss; Brütten', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=154' },
      { name: 'Betreibungs- und Stadtammannamt Winterthur-Wülflingen', strasse: 'Wülflingerstrasse 239', plzOrt: '8408 Winterthur', zustaendigFuer: 'Stadt Winterthur, Kreise Wülflingen/Veltheim', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=156' },
      { name: 'Betreibungs- und Gemeindeammannamt Zell-Turbenthal', strasse: 'Spiegelacker 5', plzOrt: '8486 Rikon', zustaendigFuer: 'Turbenthal, Zell', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=157' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 1', strasse: 'Lindenhofstrasse 21 / Amtshaus lll', plzOrt: '8001 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 1', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=160' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 2', strasse: 'Ulmbergstrasse 1', plzOrt: '8027 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 2', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=161' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 3', strasse: 'Sihlfeldstrasse 10', plzOrt: '8003 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 3', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=162' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 4', strasse: 'Hohlstrasse 35', plzOrt: '8004 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 4', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=163' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 5', strasse: 'Fabrikstrasse 3', plzOrt: '8031 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 5', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=164' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 6', strasse: 'Beckenhofstrasse 59', plzOrt: '8006 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 6', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=165' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 7', strasse: 'Witikonerstrasse 15', plzOrt: '8032 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 7', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=166' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 8', strasse: 'Höschgasse 45', plzOrt: '8008 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 8', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=167' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 9', strasse: 'Hohlstrasse 550', plzOrt: '8048 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 9', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=168' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 10', strasse: 'Wipkingerplatz 5', plzOrt: '8037 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 10', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=169' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 11', strasse: 'Eggbühlstrasse 23', plzOrt: '8050 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 11', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=170' },
      { name: 'Betreibungs- und Stadtammannamt Zürich 12', strasse: 'Schwamendingerplatz 1', plzOrt: '8051 Zürich', zustaendigFuer: 'Stadt Zürich, Kreis 12', url: 'https://www.betreibungsinspektorat-zh.ch/deu/geo_det.php?amt_search=171' },
    ] },
  },
  BE: {
    stand: '7.6.2026', quelle: 'baka.dij.be.ch (Dienststellen-Seiten; alle 8 Adressen zeichengenau geprüft)',
    url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort.html',
    aufloesung: { modus: 'kreise', hinweis: '4 Regionen mit 8 Dienststellen (seit 1.1.2026); eine gemeindescharfe amtliche Zuordnung ist nicht publiziert — Dienststelle nach Region/Verwaltungskreis wählen.', aemter: [
      { name: 'Betreibungsamt Bern-Mittelland, Dienststelle Mittelland', strasse: 'Poststrasse 25', plzOrt: '3071 Ostermundigen', zustaendigFuer: 'Region Bern-Mittelland (Verwaltungskreis Bern-Mittelland)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Mittelland.html' },
      { name: 'Betreibungsamt Berner Jura-Seeland, Dienststelle Biel/Bienne', strasse: 'Kontrollstrasse 20', plzOrt: '2501 Biel', zustaendigFuer: 'Region Berner Jura-Seeland (Dienststelle Biel/Bienne); Hauptsitz der Region', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Biel.html' },
      { name: 'Betreibungsamt Berner Jura-Seeland, Dienststelle Seeland', strasse: 'Stadtplatz 33', plzOrt: '3270 Aarberg', zustaendigFuer: 'Region Berner Jura-Seeland (Dienststelle Seeland; Verwaltungskreis Seeland)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Seeland.html' },
      { name: 'Betreibungsamt Berner Jura-Seeland, Dienststelle Berner Jura', strasse: 'Sur le Brassiège 3', plzOrt: '2605 Sonceboz-Sombeval', zustaendigFuer: 'Region Berner Jura-Seeland (Dienststelle Berner Jura; Verwaltungskreis Berner Jura)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_jurabernois.html' },
      { name: 'Betreibungsamt Oberland, Dienststelle Oberland West', strasse: 'Scheibenstrasse 11', plzOrt: '3600 Thun', zustaendigFuer: 'Region Oberland (Dienststelle Oberland West; Verwaltungskreise Thun, Obersimmental-Saanen, Frutigen-Niedersimmental)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Oberlandwest.html' },
      { name: 'Betreibungsamt Oberland, Dienststelle Oberland Ost', strasse: 'Schloss 5', plzOrt: '3800 Interlaken', zustaendigFuer: 'Region Oberland (Dienststelle Oberland Ost; Verwaltungskreis Interlaken-Oberhasli)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Oberlandost.html' },
      { name: 'Betreibungsamt Emmental-Oberaargau, Dienststelle Emmental', strasse: 'Dunantstrasse 7C', plzOrt: '3400 Burgdorf', zustaendigFuer: 'Region Emmental-Oberaargau (Dienststelle Emmental; Verwaltungskreis Emmental)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Emmental.html' },
      { name: 'Betreibungsamt Emmental-Oberaargau, Dienststelle Oberaargau', strasse: 'Jurastrasse 22', plzOrt: '4900 Langenthal', zustaendigFuer: 'Region Emmental-Oberaargau (Dienststelle Oberaargau; Verwaltungskreis Oberaargau)', url: 'https://www.baka.dij.be.ch/de/start/ueber-uns/Standort/BA_Oberaargau.html' },
    ] },
  },
  FR: {
    stand: '7.6.2026', quelle: 'fr.ch/de/sjsd/baka (Amts-Detailseiten); Gemeinde→Bezirk amtliches Gemeindeverzeichnis FR',
    url: 'https://www.fr.ch/de/sjsd/baka',
    aufloesung: { modus: 'kreise', aemter: [
      { name: 'Betreibungsamt des Saanebezirks', strasse: 'Av. Beauregard 13', plzOrt: '1700 Freiburg', zustaendigFuer: 'Saanebezirk (Bezirk Saane/Sarine), 25 Gemeinden', url: 'https://www.fr.ch/de/baka/institutionen-und-politische-rechte/justiz/betreibungsamt-des-saanebezirks' },
      { name: 'Betreibungsamt des Sensebezirks', strasse: 'Schwarzseestrasse 5', plzOrt: '1712 Tafers', zustaendigFuer: 'Sensebezirk (Bezirk Sense/Singine), 15 Gemeinden', url: 'https://www.fr.ch/de/baka/institutionen-und-politische-rechte/justiz/betreibungsamt-des-sensebezirks' },
      { name: 'Betreibungsamt des Greyerzbezirks', strasse: 'Rue de l\'Europe 10, Postfach 155', plzOrt: '1630 Bulle', zustaendigFuer: 'Greyerzbezirk (Bezirk Greyerz/Gruyère), 25 Gemeinden', url: 'https://www.fr.ch/de/baka/institutionen-und-politische-rechte/justiz/betreibungsamt-des-greyerzbezirks' },
      { name: 'Betreibungsamt des Seebezirks', strasse: 'Hallwylstrasse 12', plzOrt: '3280 Murten', zustaendigFuer: 'Seebezirk (Bezirk See/Lac), 14 Gemeinden', url: 'https://www.fr.ch/de/baka/institutions-et-droits-politiques/justiz/see' },
      { name: 'Betreibungsamt des Glanebezirks', strasse: 'Rue des Moines 58', plzOrt: '1680 Romont', zustaendigFuer: 'Glanebezirk (Bezirk Glane/Glâne), 14 Gemeinden', url: 'https://www.fr.ch/de/baka/institutionen-und-politische-rechte/justiz/betreibungsamt-des-glanebezirks' },
      { name: 'Betreibungsamt des Broyebezirks', strasse: 'Rue St-Laurent 5', plzOrt: '1470 Estavayer-le-Lac', zustaendigFuer: 'Broyebezirk (Bezirk Broye), 17 Gemeinden', url: 'https://www.fr.ch/de/baka/institutionen-und-politische-rechte/justiz/betreibungsamt-des-broyebezirks' },
      { name: 'Betreibungsamt des Vivisbachbezirks', strasse: 'Bahnhofstrasse 33, Postfach 272', plzOrt: '1618 Châtel-St-Denis', zustaendigFuer: 'Vivisbachbezirk (Bezirk Vivisbach/Veveyse), 9 Gemeinden', url: 'https://www.fr.ch/de/baka/institutionen-und-politische-rechte/justiz/betreibungsamt-des-vivisbachsbezirks' },
    ] },
  },
  SO: {
    stand: '7.6.2026', quelle: 'so.ch (Geschäftsstellen + amtliche Gemeinde-Zuordnungsliste)',
    url: 'https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/zuordnung-der-gemeinden-1/',
    aufloesung: { modus: 'kreise', aemter: [
      { name: 'Betreibungsamt Dorneck-Thierstein', strasse: 'Amthausstrasse 15', plzOrt: '4143 Dornach', zustaendigFuer: 'Bezirke Dorneck und Thierstein (23 Gemeinden, u.a. Breitenbach, Dornach, Nunningen)', url: 'https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/kontakte/dorneck-thierstein/' },
      { name: 'Betreibungsamt Grenchen-Bettlach', strasse: 'Marktplatz 22', plzOrt: '2540 Grenchen', zustaendigFuer: 'Grenchen und Bettlach', url: 'https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/kontakte/grenchen-bettlach/' },
      { name: 'Betreibungsamt Olten-Gösgen', strasse: 'Amthausquai 23', plzOrt: '4601 Olten', zustaendigFuer: 'Bezirke Olten und Gösgen (25 Gemeinden, u.a. Olten, Schönenwerd, Trimbach)', url: 'https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/kontakte/olten-goesgen/' },
      { name: 'Betreibungsamt Region Solothurn', strasse: 'Rötistrasse 4', plzOrt: '4502 Solothurn', zustaendigFuer: 'Region Solothurn / Bezirke Solothurn, Lebern, Wasseramt, Bucheggberg (40 Gemeinden, u.a. Solothurn, Biberist, Zuchwil)', url: 'https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/kontakte/region-solothurn/' },
      { name: 'Betreibungsamt Thal-Gäu', strasse: 'Wengimattstrasse 2', plzOrt: '4710 Klus-Balsthal', zustaendigFuer: 'Bezirke Thal und Gäu (16 Gemeinden, u.a. Balsthal, Oensingen, Egerkingen)', url: 'https://so.ch/verwaltung/finanzdepartement/betreibungsaemter/kontakte/thal-gaeu/' },
    ] },
  },
  AR: {
    stand: '7.6.2026', quelle: 'ar.ch (Betreibungsämter mit Gemeindelisten)',
    url: 'https://ar.ch/verwaltung/departement-inneres-und-sicherheit/departementssekretariat/betreibungsaemter-und-konkursamt/betreibungsaemter/',
    aufloesung: { modus: 'kreise', aemter: [
      { name: 'Betreibungsamt Appenzeller Hinterland', strasse: 'Poststrasse 6, Postfach 1160', plzOrt: '9102 Herisau', zustaendigFuer: 'Region Hinterland: Herisau, Hundwil, Schwellbrunn, Waldstatt, Schönengrund, Urnäsch', url: 'https://www.herisau.ch/de/verwaltungpolitik/verwaltungherisau/aemter' },
      { name: 'Betreibungsamt Appenzeller Mittelland', strasse: 'Gremmstrasse 6, Postfach 48', plzOrt: '9053 Teufen', zustaendigFuer: 'Region Mittelland: Teufen (inkl. Niederteufen und Lustmühle), Bühler, Gais, Speicher (inkl. Speicherschwendi), Trogen, Stein', url: 'https://www.teufen.ch/betreibungsamt' },
      { name: 'Betreibungsamt Appenzeller Vorderland', strasse: 'Paradiesweg 2 / Haus Eden, Postfach 42', plzOrt: '9410 Heiden', zustaendigFuer: 'Region Vorderland: Heiden, Walzenhausen, Wolfhalden, Lutzenberg, Grub, Wald, Reute, Rehetobel', url: 'https://www.heiden.ch/de/verwaltung/aemter' },
    ] },
  },
  GR: {
    stand: '7.6.2026', quelle: 'justiz-gr.ch (Regionen-Ämter); Gemeinde→Region amtliche Regionszugehörigkeit',
    url: 'https://www.justiz-gr.ch/schuldbetreibung-und-konkurs/ueber-uns/betreibungs-und-konkursaemter/',
    aufloesung: { modus: 'kreise', aemter: [
      { name: 'Betreibungs- und Konkursamt der Region Albula', strasse: 'Stradung 26', plzOrt: '7450 Tiefencastel', zustaendigFuer: 'Region Albula: Albula/Alvra, Bergün Filisur, Lantsch/Lenz, Schmitten, Surses, Vaz/Obervaz' },
      { name: 'Betreibungs- und Konkursamt der Region Bernina', strasse: 'Via da Clalt 2', plzOrt: '7742 Poschiavo', zustaendigFuer: 'Region Bernina: Brusio, Poschiavo' },
      { name: 'Betreibungs- und Konkursamt der Region Engiadina Bassa/Val Müstair', strasse: 'Chasa du Parc, Via dals Bogns 161', plzOrt: '7550 Scuol', zustaendigFuer: 'Region Engiadina Bassa/Val Müstair: Samnaun, Scuol, Val Müstair, Valsot, Zernez (Aussenstelle: Via Umbrail, 7536 Sta. Maria)' },
      { name: 'Betreibungs- und Konkursamt der Region Imboden', strasse: 'Plazza Staziun 6', plzOrt: '7013 Domat/Ems', zustaendigFuer: 'Region Imboden: Bonaduz, Domat/Ems, Felsberg, Flims, Rhäzüns, Tamins, Trin' },
      { name: 'Betreibungs- und Konkursamt der Region Landquart', strasse: 'Bahnhofplatz 2, Postfach', plzOrt: '7302 Landquart', zustaendigFuer: 'Region Landquart: Fläsch, Jenins, Landquart, Maienfeld, Malans, Trimmis, Untervaz, Zizers' },
      { name: 'Betreibungs- und Konkursamt der Region Maloja', strasse: 'Chesa Ruppanner, Quadratscha 1', plzOrt: '7503 Samedan', zustaendigFuer: 'Region Maloja: Bever, Bregaglia, Celerina/Schlarigna, La Punt Chamues-ch, Madulain, Pontresina, Samedan, S-chanf, Sils im Engadin/Segl, Silvaplana, St. Moritz, Zuoz' },
      { name: 'Betreibungs- und Konkursamt der Region Moesa', strasse: 'Centro Regionale dei Servizi, Al Giardinètt 2', plzOrt: '6535 Roveredo', zustaendigFuer: 'Region Moesa: Buseno, Calanca, Cama, Castaneda, Grono, Lostallo, Mesocco, Rossa, Roveredo, San Vittore, Soazza, Santa Maria in Calanca' },
      { name: 'Betreibungs- und Konkursamt der Region Plessur', strasse: 'Stadthaus, Masanserstrasse 2, Postfach', plzOrt: '7001 Chur', zustaendigFuer: 'Region Plessur: Arosa, Chur, Churwalden' },
      { name: 'Betreibungs- und Konkursamt der Region Prättigau / Davos', strasse: 'Berglistutz 8', plzOrt: '7270 Davos Platz', zustaendigFuer: 'Region Prättigau/Davos: Conters im Prättigau, Davos, Fideris, Furna, Grüsch, Jenaz, Klosters, Küblis, Luzein, Schiers, Seewis im Prättigau (Aussenstelle: Dorfstrasse 42, 7220 Schiers)' },
      { name: 'Betreibungs- und Konkursamt der Region Surselva', strasse: 'Glennerstrasse 22A, Postfach 114', plzOrt: '7130 Ilanz', zustaendigFuer: 'Region Surselva: Breil/Brigels, Disentis/Mustér, Falera, Ilanz/Glion, Laax, Lumnezia, Medel (Lucmagn), Obersaxen Mundaun, Safiental, Sagogn, Schluein, Sumvitg, Trun, Tujetsch, Vals' },
      { name: 'Betreibungs- und Konkursamt der Region Viamala', strasse: 'Rathaus, Untere Gasse 1, Postfach 180', plzOrt: '7430 Thusis', zustaendigFuer: 'Region Viamala: Andeer, Avers, Cazis, Domleschg, Ferrera, Flerden, Fürstenau, Masein, Muntogna da Schons, Rheinwald, Rongellen, Rothenbrunnen, Scharans, Sils im Domleschg, Sufers, Thusis, Tschappina, Urmein, Zillis-Reischen' },
    ] },
  },
  TG: {
    stand: '7.6.2026', quelle: 'betreibungsamt.tg.ch (Bezirksämter mit Gemeindelisten)',
    url: 'https://betreibungsamt.tg.ch/html/928',
    aufloesung: { modus: 'kreise', aemter: [
      { name: 'Betreibungsamt Bezirk Arbon', strasse: 'Bahnhofstrasse 3, Postfach', plzOrt: '8590 Romanshorn', zustaendigFuer: 'Bezirk Arbon: Amriswil, Arbon, Dozwil, Egnach, Hefenhofen, Horn, Kesswil, Roggwil, Romanshorn, Salmsach, Sommeri, Uttwil (12 Gemeinden)', url: 'https://betreibungsamt.tg.ch/betreibungsaemter/betreibungsamt-arbon.html/990' },
      { name: 'Betreibungsamt Bezirk Frauenfeld', strasse: 'St. Gallerstrasse 4', plzOrt: '8510 Frauenfeld', zustaendigFuer: 'Bezirk Frauenfeld: 23 Gemeinden (Basadingen-Schlattingen bis Warth-Weiningen)', url: 'https://betreibungsamt.tg.ch/betreibungsaemter/betreibungsamt-frauenfeld.html/992' },
      { name: 'Betreibungsamt Bezirk Kreuzlingen', strasse: 'Bachstrasse 10, Postfach', plzOrt: '8280 Kreuzlingen', zustaendigFuer: 'Bezirk Kreuzlingen: 14 Gemeinden (Altnau bis Wäldi)', url: 'https://betreibungsamt.tg.ch/betreibungsaemter/betreibungsamt-kreuzlingen.html/993' },
      { name: 'Betreibungsamt Bezirk Münchwilen', strasse: 'Murgtalstrasse 20, Postfach 35', plzOrt: '9542 Münchwilen', zustaendigFuer: 'Bezirk Münchwilen: 13 Gemeinden (Aadorf bis Wilen)', url: 'https://betreibungsamt.tg.ch/betreibungsaemter/betreibungsamt-muenchwilen.html/994' },
      { name: 'Betreibungsamt Bezirk Weinfelden', strasse: 'Bahnhofstrasse 22, Postfach 140', plzOrt: '8570 Weinfelden', zustaendigFuer: 'Bezirk Weinfelden: 18 Gemeinden (Affeltrangen bis Zihlschlacht-Sitterdorf)', url: 'https://betreibungsamt.tg.ch/betreibungsaemter/betreibungsamt-weinfelden.html/995' },
    ] },
  },
  TI: {
    stand: '7.6.2026', quelle: 'ti.ch Sezione di esecuzione e fallimento (uffici + elenco-comuni-distretto)',
    url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione',
    aufloesung: { modus: 'kreise', hinweis: 'Seit 2015 bildet der ganze Kanton EINEN Betreibungskreis — die Distrikt-Zuteilung der Sedi ist administrativ; jede Sede ist kantonal zuständig.', aemter: [
      { name: 'Ufficio di esecuzione, Bellinzona', strasse: 'Via Henri Guisan 3', plzOrt: '6501 Bellinzona', zustaendigFuer: 'Sede principale; Distretto/comprensorio di Bellinzona. NB: dal 1.1.2015 l\'intero Cantone Ticino costituisce un unico circondario d\'esecuzione (ogni sede e\' competente cantonalmente); la ripartizione per distretto serve all\'assegnazione amministrativa delle pratiche.', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
      { name: 'Ufficio di esecuzione, Blenio', strasse: 'Via Bosco Ciossera 10', plzOrt: '6716 Acquarossa', zustaendigFuer: 'Agenzia; Distretto/comprensorio di Blenio (Valle di Blenio).', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
      { name: 'Ufficio di esecuzione, Leventina', strasse: 'Piazza Stefano Franscini 3B', plzOrt: '6760 Faido', zustaendigFuer: 'Agenzia; Distretto/comprensorio di Leventina.', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
      { name: 'Ufficio di esecuzione, Locarno', strasse: 'Via della Posta 9', plzOrt: '6601 Locarno', zustaendigFuer: 'Sede principale; Distretto/comprensorio di Locarno (Locarnese, comprese Onsernone/Centovalli/Gambarogno/Verzasca).', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
      { name: 'Ufficio di esecuzione, Lugano', strasse: 'Via Bossi 2A', plzOrt: '6901 Lugano', zustaendigFuer: 'Sede principale; Distretto/comprensorio di Lugano (Luganese, Malcantone, Capriasca).', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
      { name: 'Ufficio di esecuzione, Mendrisio', strasse: 'Via Pollini 29', plzOrt: '6850 Mendrisio', zustaendigFuer: 'Sede principale; Distretto/comprensorio di Mendrisio (Mendrisiotto).', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
      { name: 'Ufficio di esecuzione, Riviera', strasse: 'Via Lucomagno 19', plzOrt: '6710 Biasca', zustaendigFuer: 'Agenzia; Distretto/comprensorio di Riviera.', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
      { name: 'Ufficio di esecuzione, Vallemaggia', strasse: 'Via Pretorio 2', plzOrt: '6675 Cevio', zustaendigFuer: 'Agenzia; Distretto/comprensorio di Vallemaggia.', url: 'https://www4.ti.ch/di/dg/sezione-di-esecuzione-e-fallimento/chi-siamo/uffici-esecuzione' },
    ] },
  },
  VD: {
    stand: '7.6.2026', quelle: 'vd.ch/ojv/offices-des-poursuites (Office-Detailseiten); Commune→District amtlich',
    url: 'https://www.vd.ch/ojv/offices-des-poursuites',
    aufloesung: { modus: 'kreise', aemter: [
      { name: 'Office des poursuites du district d\'Aigle', strasse: 'Hôtel de Ville - Place du Marché 1, Case postale', plzOrt: '1860 Aigle', zustaendigFuer: 'District d\'Aigle (u.a. Aigle, Bex, Ollon, Leysin, Villeneuve, Montreux-nahe Gemeinden des Bezirks)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/aigle' },
      { name: 'Office des poursuites du district de la Broye-Vully', strasse: 'Rue de la Gare 45, Case postale', plzOrt: '1530 Payerne', zustaendigFuer: 'District de la Broye-Vully (u.a. Payerne, Avenches, Moudon, Lucens, Valbroye)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/broye-vully' },
      { name: 'Office des poursuites du district du Gros-de-Vaud', strasse: 'Place Emile Gardaz 5, Case postale', plzOrt: '1040 Echallens', zustaendigFuer: 'District du Gros-de-Vaud (u.a. Echallens, Montanaire, Penthalaz, Bercher)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/gros-de-vaud' },
      { name: 'Office des poursuites du district du Jura-Nord vaudois', strasse: 'Rue de Neuchâtel 1, Case postale', plzOrt: '1400 Yverdon-les-Bains', zustaendigFuer: 'District du Jura-Nord vaudois (u.a. Yverdon-les-Bains, Orbe, Grandson, Sainte-Croix, Vallorbe, Le Chenit)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/jura-nord-vaudois' },
      { name: 'Office des poursuites du district de Lausanne', strasse: 'Ch. du Trabandan 28 (entrée A)', plzOrt: '1014 Lausanne', zustaendigFuer: 'District de Lausanne (Lausanne, Epalinges, Le Mont-sur-Lausanne, Cheseaux-sur-Lausanne, Romanel-sur-Lausanne, Jouxtens-Mézery)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/lausanne' },
      { name: 'Office des poursuites du district de Lavaux-Oron', strasse: 'Chemin de Versailles 6, Case postale', plzOrt: '1096 Cully', zustaendigFuer: 'District de Lavaux-Oron (u.a. Lutry, Pully, Oron, Bourg-en-Lavaux, Savigny)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/lavaux-oron' },
      { name: 'Office des poursuites du district de Morges', strasse: 'Place St-Louis 4, Case postale', plzOrt: '1110 Morges', zustaendigFuer: 'District de Morges (u.a. Morges, Aubonne, Cossonay, La Sarraz, Saint-Prex)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/morges' },
      { name: 'Office des poursuites du district de Nyon', strasse: 'Av. Reverdil 2, Case postale', plzOrt: '1260 Nyon 2', zustaendigFuer: 'District de Nyon (u.a. Nyon, Gland, Rolle, Coppet, Saint-Cergue)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/nyon' },
      { name: 'Office des poursuites du district de l\'Ouest lausannois', strasse: 'Av. de Longemalle 1', plzOrt: '1020 Renens', zustaendigFuer: 'District de l\'Ouest lausannois (Renens, Ecublens, Prilly, Bussigny, Crissier, Chavannes-près-Renens, Saint-Sulpice, Villars-Sainte-Croix)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/ouest-lausannois' },
      { name: 'Office des poursuites du district de la Riviera-Pays-d\'Enhaut', strasse: 'Rue de la Madeleine 39, Case postale', plzOrt: '1800 Vevey 1', zustaendigFuer: 'District de la Riviera-Pays-d\'Enhaut (u.a. Vevey, Montreux, La Tour-de-Peilz, Château-d\'Oex)', url: 'https://www.vd.ch/ojv/offices-des-poursuites/riviera-pays-denhaut' },
    ] },
  },
  VS: {
    stand: '7.6.2026', quelle: 'vs.ch/de/web/spf/office-competent (5 Ämter, Adressen zeichengenau geprüft)',
    url: 'https://www.vs.ch/de/web/spf/office-competent',
    aufloesung: { modus: 'kreise', hinweis: '5 Ämter (Arrondissements nach Bezirksgruppen) — Zuordnung über den Bezirk der Gemeinde.', aemter: [
      { name: 'Betreibungsamt Oberwallis', strasse: 'Kantonsstrasse 6, Postfach 64', plzOrt: '3930 Visp', zustaendigFuer: 'Oberwallis: Bezirke Brig, Goms, Östlich Raron, Visp, Leuk, Westlich Raron', url: 'https://www.vs.ch/de/web/spf/office-competent' },
      { name: 'Betreibungsamt des Bezirkes Siders', strasse: 'Avenue du Rothorn 2, Case postale 312', plzOrt: '3960 Sierre', zustaendigFuer: 'Bezirk Siders (Sierre)', url: 'https://www.vs.ch/de/web/spf/office-competent' },
      { name: 'Betreibungsamt der Bezirke Sitten, Ering und Gundis', strasse: 'Route de la Piscine 10, Bâtiment C, Trame 3, Case postale 634', plzOrt: '1951 Sion', zustaendigFuer: 'Bezirke Sitten (Sion), Ering (Hérens), Gundis (Conthey)', url: 'https://www.vs.ch/de/web/spf/office-competent' },
      { name: 'Betreibungsamt der Bezirke Martinach Entremont', strasse: 'Rue du Léman 29, Case postale 784', plzOrt: '1920 Martigny', zustaendigFuer: 'Bezirke Martinach (Martigny), Entremont', url: 'https://www.vs.ch/de/web/spf/office-competent' },
      { name: 'Betreibungsamt der Bezirke Monthey St-Maurice', strasse: 'Avenue du Crochetan 2, Case postale 160', plzOrt: '1870 Monthey', zustaendigFuer: 'Bezirke Monthey, St-Maurice', url: 'https://www.vs.ch/de/web/spf/office-competent' },
    ] },
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
