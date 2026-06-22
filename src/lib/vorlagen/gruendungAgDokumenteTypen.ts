// Typen + statische Daten der AG-Gründungsdokumente (§6 Datei-Schlankheit).
// Aus gruendungAgDokumente.ts ausgelagert — verhaltensneutral.
import { ZEICHNUNGS_LABEL, type GmbhZeichnungsArt } from './gruendungGmbhDokumente';
import type { AgGruendungEingaben } from '../gruendungsunterlagen';

export type AgGruenderZeile = {
  name: string;
  angaben: string;
  anzahl: string;
  /** Etappe 3.3/D6: individueller Liberierungsgrad in Prozent (ZH-Urkunde
   *  3.1 Teilliberierung: «a) … Aktien des Gründers … zu … %»); leer/fehlend
   *  = globaler Liberierungsgrad gilt. */
  liberierung?: string;
};

/** Zulässige Fremdwährungen des Aktienkapitals (Anhang 3 i. V. m. Art. 45a
 *  HRegV; ZH-Urkundenvorlage 3.2 — Etappe 3.1/D2). */
export const AG_FREMDWAEHRUNGEN = ['GBP', 'EUR', 'USD', 'JPY'] as const;
export type AgWaehrung = 'CHF' | (typeof AG_FREMDWAEHRUNGEN)[number];

/** VR-Zeichnungsarten: ZH-Muster-Protokoll führt auch VR-Mitglieder
 *  «ohne Zeichnungsberechtigung» (D14; Gate: mind. eines vertretungsbefugt,
 *  Art. 718 Abs. 3 OR). */
export type AgVrZeichnungsArt = GmbhZeichnungsArt | 'ohne';
/** Weitere Zeichnungsberechtigte: zusätzlich Kollektivprokura zu zweien
 *  (ZH-Muster-Protokoll, D14). */
export type AgVertretungsZeichnungsArt = GmbhZeichnungsArt | 'kollektivprokura';

export type AgVrZeile = {
  name: string;
  herkunft: string;
  wohnort: string;
  adresse: string;       // für die Wahlannahmeerklärung
  praesident: boolean;
  zeichnungsArt: AgVrZeichnungsArt;
  /** Etappe 4.1/D8: Annahme der Wahl direkt in der Urkunde erklärt
   *  (anwesende Person; ZH-Erläuterung zu Ziff. VI: «welcher hiermit die
   *  Annahme erklärt») — die separate Wahlannahmeerklärung entfällt dann;
   *  fehlend = separat. */
  annahmeInUrkunde?: boolean;
};

export type AgVertretungsZeile = { name: string; funktion: string; zeichnungsArt: AgVertretungsZeichnungsArt };

// ── Qualifizierte Gründung (Etappe 2/D3–D5; Dossier ag-qualifizierte-gruendung.md) ──

/** Eine Sacheinlage (Art. 634 OR). `typ`: Sachgesamtheit (Inventarliste) oder
 *  Geschäft/Einzelunternehmen (Übernahmebilanz) — ZH-Vorlagen «einfach»/«Geschäft». */
export type AgSacheinlageZeile = {
  typ: 'sachgesamtheit' | 'geschaeft';
  /** Umfang der Sacheinlage bzw. Firma des Einzelunternehmens. */
  bezeichnung: string;
  /** Datum der Inventarliste bzw. «Übernahmebilanz per» (ISO). */
  belegDatum: string;
  /** Anrechnungswert/Kaufpreis in CHF (Erstausbau ohne Agio: = Aktien ×
   *  Nennwert + Gutschrift). */
  wertChf: string;
  /** Grundstück enthalten → Vertrag beurkundungspflichtig (Art. 657 ZGB),
   *  Export nur als ENTWURF (§8); Urkunden-Weiche «bedingungsloser Anspruch
   *  auf Eintragung in das Grundbuch» (Art. 634 Abs. 1 Ziff. 3 OR). */
  grundstueck: boolean;
  einlegerName: string;
  aktienAnzahl: string;
  /** Gutschrift in den Büchern (weitere Gegenleistung, Art. 634 Abs. 4 OR);
   *  leer = keine. */
  gutschriftChf: string;
  /** Zustand der Sacheinlage bzw. Bericht je Bilanzposten (Gründungsbericht
   *  Art. 635 Ziff. 1 OR — Freitext der fachkundigen Eingabe). */
  zustand: string;
  // nur typ 'geschaeft':
  imHrEingetragen: boolean;
  cheNr: string;                 // leer = keine UID-Angabe
  aktivenChf: string;
  passivenChf: string;
  /** «Die seit dem … abgeschlossenen Rechtsgeschäfte gelten als für Rechnung
   *  der Gesellschaft getätigt» (ZH-Vertragsvorlage Geschäft; ISO). */
  rueckwirkungDatum: string;
};

/** Verrechnungsliberierung (Art. 634a OR) — eigenständige qualifizierte
 *  Liberierungsart, KEINE Sacheinlage (BE-Merkblatt; Dossier Teil 1). */
export type AgVerrechnungZeile = {
  glaeubigerName: string;
  forderungChf: string;
  aktienAnzahl: string;
  /** Bestand + Verrechenbarkeit (Gründungsbericht Art. 635 Ziff. 2 OR). */
  begruendungTxt: string;
};

/** Besonderer Vorteil (Art. 636 OR). */
export type AgVorteilZeile = {
  beguenstigter: string;
  inhalt: string;
  wertChf: string;
  /** Begründung + Angemessenheit (Gründungsbericht Art. 635 Ziff. 3 OR). */
  begruendungTxt: string;
};

export type AgDokAntworten = AgGruendungEingaben & {
  firma: string;             // inkl. Rechtsformzusatz «… AG» (Art. 950 OR)
  sitz: string;
  kanton: string;
  zweck: string;
  zweckErweiterung: boolean;
  aktienkapitalChf: string;
  anzahlAktien: string;
  nennwertChf: string;
  /** Liberierungsgrad in Prozent (100 = vollständig; Art. 632 OR: ≥ 20 %,
   *  geleistete Einlagen gesamthaft ≥ CHF 50'000). Gilt als Default für
   *  alle Gründer; individuelle Werte je Zeile (Etappe 3.3). */
  liberierungProzent: string;
  /** Etappe 3.2/D7: Ausgabebetrag je Aktie (leer = Nennwert; Art. 624 OR:
   *  nie unter pari). Erstausbau: Agio nur bei Volliberierung und reiner
   *  Bargründung. */
  ausgabebetragChf: string;
  gruender: AgGruenderZeile[];
  verwaltungsraete: AgVrZeile[];
  weitereVertretungen: AgVertretungsZeile[];
  protokollfuehrerName: string;   // leer → Präsident/in führt das Protokoll
  bankName: string;
  bankOrt: string;
  rechtsdomizilAdresse: string;
  domizilhalterName: string;
  domizilhalterAdresse: string;
  revisionsstelleName: string;
  revisionsstelleSitz: string;
  vinkulierung: boolean;          // Art. 685a/685b OR (Statutenklausel)
  virtuelleGv: boolean;           // Art. 701d OR (Statutenklausel)
  /** Statuten-Umfang (Etappe 1/D18): kurz = amtliche ZH-Kurzvorlage,
   *  lang = amtliche ZH-Langvorlage (zusätzliche Organisations-Artikel). */
  statutenUmfang: 'kurz' | 'lang';
  /** Geschäftsjahr-Grenzen für den Statuten-Artikel (amtliche ZH-Kurzvorlage;
   *  Freitext wie «1. Januar» / «31. Dezember»). */
  gjBeginn: string;
  gjEnde: string;
  /** Sitzungs-Uhrzeiten des VR-Konstituierungsprotokolls (D13: Mindestelemente
   *  «Datum, Beginn und Ende der Sitzung», Merkblatt Formelle Anforderungen
   *  7.1.2025; Freitext wie «11.00»). */
  sitzungBeginn: string;
  sitzungEnde: string;
  /** Nachtrags-Bevollmächtigte:r mit vollen Personalien (D10: ZH-Klausel «Auf
   *  Verlangen der Gründer» — leer = Klausel entfällt). */
  nachtragsbevollmaechtigter: string;
  /** Fremdwährungs-Gründung (Etappe 3.1/D2) — wirksam nur mit der
   *  Checklisten-Weiche `fremdwaehrung`; Erstausbau: nur reine Bargründung,
   *  Einlagewährung = Kapitalwährung. */
  waehrung: AgWaehrung;
  /** Umrechnungskurs: 1 Einheit der Währung = X CHF (Art. 629 Abs. 3 OR —
   *  in der Urkunde anzugeben; Freitext-Zahl wie «0.93»). */
  kursChf: string;
  /** Quelle des Devisenmittelkurses (ZH 3.2: «Dieser Umrechnungskurs
   *  entspricht dem Devisenmittelkurs der {{Bank}}.»). */
  kursQuelle: string;
  /** Etappe 4.4/D11: Gründungs-Nachtrag (ZH-Vorlage 3.4) — Korrektur nach
   *  Beanstandung durch die Handelsregisterbehörde; öffentliche Beurkundung
   *  → ENTWURF (§8). Aktiv nur auf ausdrücklichen Wunsch. */
  nachtragAktiv: boolean;
  /** Datum der ursprünglichen Gründungsurkunde (ISO; leer = Blanko). */
  nachtragGruendungsdatum: string;
  nachtragUrkundeZiffer: string;     // leer = kein Urkunden-Punkt
  nachtragUrkundeText: string;
  nachtragStatutenArtikel: string;   // leer = kein Statuten-Punkt
  nachtragStatutenAbsatz: string;
  nachtragStatutenText: string;
  /** Etappe 4.2/D9: Konstituierung, Zeichnungsberechtigung und Domizil
   *  direkt in der Urkunde erklären (ZH Ziff. VII, «unter der Bedingung,
   *  dass der Verwaltungsrat vollzählig anwesend ist») — das separate
   *  VR-Protokoll entfällt dann. */
  konstituierungInUrkunde: boolean;
  /** Etappe 4.2/D9: Domizil in der Urkunde weglassen (ZH-Erläuterung zu
   *  Ziff. VII — das Domizil steht dann nur in der HR-Anmeldung). */
  domizilNurAnmeldung: boolean;
  /** Lex-Koller-Erklärung (Etappe 4.3/D16; ZH-Formular 1.1.2025) — wirksam
   *  nur mit der Checklisten-Weiche `immobilienHauptzweck`. Frage 4
   *  (Kapitalherabsetzung) ist bei der Gründung nicht anwendbar. */
  lexKollerAuslandBeteiligt: boolean;
  lexKollerNeuerwerb: boolean;
  lexKollerGrundstueckErwerb: boolean;
  /** Qualifizierte Gründung (Etappe 2) — wirksam nur mit den Checklisten-
   *  Weichen `einlageArt`/`besondereVorteile` (§5). */
  sacheinlagen: AgSacheinlageZeile[];
  verrechnungen: AgVerrechnungZeile[];
  vorteile: AgVorteilZeile[];
  /** Zugelassene:r Revisor:in der Prüfungsbestätigung (Art. 635a OR);
   *  leer = Blanko-Linie. */
  revisorName: string;
  /** Statuten-Zusatzklauseln (Stufe 2 P3; alle am OR-Cache 1.1.2026
   *  verifiziert). Schiedsklausel Art. 697n OR: Schiedsgericht MIT SITZ IN
   *  DER SCHWEIZ; bindet ohne andere Regelung Gesellschaft, Organe, deren
   *  Mitglieder und Aktionäre; Verfahren nach ZPO Teil 3. */
  schiedsklausel: boolean;
  /** Sitz des Schiedsgerichts (Ort in der Schweiz; Pflicht bei Weiche). */
  schiedsOrt: string;
  /** Kapitalband Art. 653s ff. OR: Ermächtigung des VR, das Kapital während
   *  längstens 5 Jahren innerhalb der Bandbreite zu verändern. */
  kapitalband: boolean;
  kbUntergrenze: string;     // ≥ ½ des AK (653s II)
  kbObergrenze: string;      // ≤ 1½ des AK (653s II)
  kbEndeDatum: string;       // ISO; ≤ 5 Jahre (653s I; 653t I Ziff. 2)
  /** 'beide' = erhöhen und herabsetzen; 'erhoehen' = nur erhöhen (653s III).
   *  Herabsetzungs-Ermächtigung setzt voraus, dass NICHT auf die
   *  eingeschränkte Revision verzichtet wurde (653s IV → Opting-out-Gate);
   *  «nur herabsetzen» ist bei der Gründung praxisfern und nicht abgebildet
   *  (offengelegt). */
  kbRichtung: 'beide' | 'erhoehen';
  /** Bedingtes Kapital Art. 653 ff. OR (Wandel-/Optionsrechte). */
  bedingtesKapital: boolean;
  bkBetrag: string;          // Nennbetrag, ≤ ½ des AK (653a I)
  /** Kreis der Wandel-/Optionsberechtigten (653b I Ziff. 3; Freitext, z. B.
   *  «den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft»). */
  bkKreis: string;
  /** Lang-Stufe: Stichentscheid des Vorsitzenden in der GV (ZH-Langvorlage;
   *  statutarische Klausel — abwählbar, dann gilt die gesetzliche Lage:
   *  Stimmengleichheit = Antrag abgelehnt). */
  stichentscheidGv: boolean;
  /** «Geschäftsjahr erstmals am»: Ende des ERSTEN Geschäftsjahrs (Freitext
   *  wie «31. Dezember 2026»; leer = kein Satz). */
  gjErstesEnde: string;
  /** Inhaberaktien (Stufe 2 P2; wirksam nur mit der Checklisten-Weiche
   *  `inhaberaktien`): Zulässigkeits-Voraussetzung nach Art. 622 Abs. 1bis
   *  OR (am Cache verifiziert) — Börsenkotierung ODER Ausgestaltung als
   *  Bucheffekten mit Hinterlegung bei einer von der Gesellschaft
   *  bezeichneten Verwahrungsstelle in der Schweiz. true = kotiert. */
  inhaberKotiert: boolean;
  /** Verwahrungsstelle in der Schweiz (Pflicht bei Bucheffekten-Variante;
   *  Name und Ort, z. B. «SIX SIS AG, Olten»). */
  verwahrungsstelle: string;
  ort: string;
  datum: string;
};

export const AG_DOK_DEFAULTS: Omit<AgDokAntworten, keyof AgGruendungEingaben> = {
  firma: '', sitz: '', kanton: '', zweck: '', zweckErweiterung: true,
  aktienkapitalChf: "100'000", anzahlAktien: '100', nennwertChf: "1'000",
  liberierungProzent: '100', ausgabebetragChf: '',
  gruender: [], verwaltungsraete: [], weitereVertretungen: [],
  protokollfuehrerName: '',
  bankName: '', bankOrt: '', rechtsdomizilAdresse: '',
  domizilhalterName: '', domizilhalterAdresse: '',
  revisionsstelleName: '', revisionsstelleSitz: '',
  vinkulierung: false, virtuelleGv: false,
  statutenUmfang: 'kurz',
  gjBeginn: '1. Januar', gjEnde: '31. Dezember',
  sitzungBeginn: '', sitzungEnde: '',
  nachtragsbevollmaechtigter: '',
  waehrung: 'CHF', kursChf: '', kursQuelle: '',
  konstituierungInUrkunde: false, domizilNurAnmeldung: false,
  nachtragAktiv: false, nachtragGruendungsdatum: '',
  nachtragUrkundeZiffer: '', nachtragUrkundeText: '',
  nachtragStatutenArtikel: '', nachtragStatutenAbsatz: '', nachtragStatutenText: '',
  lexKollerAuslandBeteiligt: false, lexKollerNeuerwerb: false, lexKollerGrundstueckErwerb: false,
  sacheinlagen: [], verrechnungen: [], vorteile: [], revisorName: '',
  inhaberKotiert: false, verwahrungsstelle: '',
  schiedsklausel: false, schiedsOrt: '',
  kapitalband: false, kbUntergrenze: '', kbObergrenze: '', kbEndeDatum: '', kbRichtung: 'erhoehen',
  bedingtesKapital: false, bkBetrag: '', bkKreis: '',
  stichentscheidGv: true, gjErstesEnde: '',
  ort: '', datum: '',
};

// Basis-Labels aus der GmbH-Mappe (eine Quelle, /simplify Reuse#2);
// AG ergänzt nur die ZH-Protokoll-Spezialfälle (D14).
export const VR_ZEICHNUNGS_LABEL: Record<AgVrZeichnungsArt, string> = {
  ...ZEICHNUNGS_LABEL,
  ohne: 'ohne Zeichnungsberechtigung',
};

export const VERTRETUNGS_ZEICHNUNGS_LABEL: Record<AgVertretungsZeichnungsArt, string> = {
  ...ZEICHNUNGS_LABEL,
  kollektivprokura: 'Kollektivprokura zu zweien',
};

// ── Liberierung: EINE Geld-Quelle, extrahiert nach ./kapitalKern.ts
// (V4 Vereinheitlichung 10.6.2026, byte-golden) — Doku/Stufe-2-Regeln dort.

