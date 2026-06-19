// Dossier: bibliothek/recherche/ag-gruendung-amtliche-vorlagen.md · bibliothek/recherche/ag-qualifizierte-gruendung.md
import { addYears, parseISO } from 'date-fns';
import type { VorlageSchema, Antworten, AssembleErgebnis } from './engine';
import { assemble, nummeriereUeberschriftenAlsArtikel } from './engine';
import { fmtCHF, fmtDatum, ganzePositive, zahl } from './datum';
import { effektiveLiberierung } from './kapitalKern';
import { formatISO } from '../datumsUtils';
import { agGruendungsunterlagen, type AgGruendungEingaben } from '../gruendungsunterlagen';
import { ZEICHNUNGS_LABEL, type GmbhZeichnungsArt } from './gruendungGmbhDokumente';

// ─── AG-Gründungs-VOLLDOKUMENTE (Plan 9b, «danach gleiches Muster für die AG»)
//
// Bauspezifikation + Wortlaut-Belege:
//   bibliothek/recherche/gruendungsdokumente-wortlaute.md Teil 2 (Statuten
//   A1–A15), Teil 3 (Zeichnung IM Errichtungsakt, 630-Verpflichtungssatz),
//   Teil 4 (Erklärungen + VR-Konstituierungsprotokoll ZH verbatim), Teil 5/6.
//
// RECHTSSTAND wie GmbH: OR-Cache 1.1.2026 massgeblich (Anweisung David).
// §4: eigene Schemas — KEINE Fusion mit der GmbH; geteilt ist nur die
// fachneutrale Struktur (Zeichnungsarten-Label, Engine, Format-Gates).
//
// ERSTAUSBAU (Dossier Teil 9): Bargründung in CHF mit NAMENAKTIEN; Voll-
// oder Teilliberierung (Art. 632 OR). Qualifizierte Gründung, Fremdwährung
// und Inhaberaktien sperren mit ehrlichem Hinweis (Checkliste deckt sie).

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
const VR_ZEICHNUNGS_LABEL: Record<AgVrZeichnungsArt, string> = {
  ...ZEICHNUNGS_LABEL,
  ohne: 'ohne Zeichnungsberechtigung',
};

const VERTRETUNGS_ZEICHNUNGS_LABEL: Record<AgVertretungsZeichnungsArt, string> = {
  ...ZEICHNUNGS_LABEL,
  kollektivprokura: 'Kollektivprokura zu zweien',
};

// ── Liberierung: EINE Geld-Quelle, extrahiert nach ./kapitalKern.ts
// (V4 Vereinheitlichung 10.6.2026, byte-golden) — Doku/Stufe-2-Regeln dort.

// ── Gates ───────────────────────────────────────────────────────────────────

/** Eingabe-Bereich eines Blockers — die Wizard-Seite mappt ihn auf den
 *  Schritt, in dem die Eingabe liegt (Praxis-Runde 7.6.2026, Auftrag David:
 *  «am Ende mit Klick zurück an den Punkt, wo der Fehler ist»). Die
 *  Zuordnung ist Teil der Gate-Definition (§3: keine Logik in der Seite). */
export type AgBereich = 'konstellation' | 'gesellschaft' | 'kapital' | 'personen' | 'weiteres';

export type AgDokGates = {
  blocker: string[];
  warnungen: string[];
  /** Strukturierte Blocker (gleiche Reihenfolge wie `blocker`). */
  blockerDetails: { text: string; bereich: AgBereich }[];
};

export function pruefeAgDokGates(a: AgDokAntworten): AgDokGates {
  const blockerDetails: { text: string; bereich: AgBereich }[] = [];
  const warnungen: string[] = [];
  // Sammel-Helfer: hält blocker (Strings, API-kompatibel) und Details synchron.
  const blocker = {
    push: (...texte: string[]) => { for (const t of texte) blockerDetails.push({ text: t, bereich: aktuellerBereich }); },
    get length() { return blockerDetails.length; },
  };
  let aktuellerBereich: AgBereich = 'kapital';
  const bereich = (b: AgBereich) => { aktuellerBereich = b; };

  bereich('kapital');
  // ── Qualifizierte Gründung (Etappe 2): Sacheinlage / Verrechnung / Vorteile ──
  const mitSach = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
  const mitVerr = a.einlageArt === 'verrechnung' || a.einlageArt === 'gemischt';
  const sachen = mitSach ? a.sacheinlagen.filter((s) => s.einlegerName.trim() || s.bezeichnung.trim()) : [];
  const verr = mitVerr ? a.verrechnungen.filter((v) => v.glaeubigerName.trim()) : [];
  const vorteile = a.besondereVorteile ? a.vorteile.filter((v) => v.beguenstigter.trim()) : [];

  if (a.einlageArt === 'sacheinlage' && sachen.length === 0) {
    blocker.push('Mindestens eine Sacheinlage erfassen (Art. 634 OR) – oder die Einlage-Art auf «bar» stellen.');
  }
  if (a.einlageArt === 'verrechnung' && verr.length === 0) {
    blocker.push('Mindestens eine Verrechnungsliberierung erfassen (Art. 634a OR) – oder die Einlage-Art anpassen.');
  }
  if (a.einlageArt === 'gemischt' && sachen.length === 0 && verr.length === 0) {
    blocker.push('Einlage-Art «gemischt»: mindestens eine Sacheinlage (Art. 634 OR) ODER Verrechnung (Art. 634a OR) erfassen.');
  }
  if (a.besondereVorteile && vorteile.length === 0) {
    blocker.push('Besondere Vorteile mit Begünstigten, Inhalt und Wert erfassen (Art. 636 OR) – oder die Weiche ausschalten.');
  }
  const eff = effektiveLiberierung(a);
  // Stufe 2 (Perfektion P1d): gemischte Teilliberierung ist offen — der
  // globale Grad gilt für die Bar-Aktien, Sach-/Verrechnungsaktien gelten
  // als voll liberiert. INDIVIDUELLE Grade bleiben bei qualifizierter
  // Gründung gesperrt (Zuordnung Bar-/Sach-Aktien je Gründer nicht eindeutig).
  if ((mitSach || mitVerr) && eff.individuellTeilweise) {
    blocker.push(
      'Individuelle Liberierungsgrade je Gründer:in nur bei der reinen Bargründung – bei Sacheinlage/' +
      'Verrechnung gilt der globale Liberierungsgrad für die Bareinlage-Aktien (Aktien aus Sacheinlage ' +
      'und Verrechnung gelten als voll liberiert; ZH-Vertragsvorlage).',
    );
  }
  // ── Fremdwährung (Etappe 3.1/D2 · Stufe 2 P1a): GBP/EUR/USD/JPY, Kurs in
  // der Urkunde; auch qualifiziert — Bewertungs-/Verrechnungs-/Vorteils-
  // Beträge sind dann Beträge in der KAPITALWÄHRUNG (Texte führen den
  // Währungscode), die Gegenwert-Gates (Art. 621 Abs. 2, 632 Abs. 2 OR)
  // rechnen auf Kapital bzw. geleisteten Einlagen gesamt. ──
  let kurs: number | null = null;
  if (a.fremdwaehrung) {
    if (!(AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung)) {
      blocker.push('Währung des Aktienkapitals wählen – zulässig sind GBP, EUR, USD und JPY (Anhang 3 i. V. m. Art. 45a HRegV).');
    }
    kurs = zahl(a.kursChf);
    if (kurs === null || kurs <= 0) {
      blocker.push('Umrechnungskurs zum Schweizerfranken angeben (Art. 629 Abs. 3 OR – der angewandte Kurs ist in der Urkunde zu nennen).');
    }
    if (!a.kursQuelle.trim()) {
      blocker.push('Quelle des Devisenmittelkurses angeben (ZH-Urkundenvorlage 3.2: «Dieser Umrechnungskurs entspricht dem Devisenmittelkurs der …»).');
    }
  }
  // ── Stufe 2 P2: Inhaberaktien-Weiche (Erstausbau-Sperre aufgehoben;
  // Art. 622/683/685a am OR-Cache 1.1.2026 verifiziert) ──
  bereich('gesellschaft');
  if (a.inhaberaktien) {
    if (!a.inhaberKotiert && !a.verwahrungsstelle.trim()) {
      blocker.push(
        'Inhaberaktien (Bucheffekten-Variante): Verwahrungsstelle in der Schweiz bezeichnen ' +
        '(Art. 622 Abs. 1bis OR – «bei einer von der Gesellschaft bezeichneten Verwahrungsstelle ' +
        'in der Schweiz hinterlegt») – oder die Kotierungs-Variante wählen.',
      );
    }
    if (a.vinkulierung) {
      blocker.push(
        'Vinkulierung gibt es nur für Namenaktien (Art. 685a Abs. 1 OR: «dass NAMENAKTIEN nur mit ' +
        'Zustimmung der Gesellschaft übertragen werden dürfen») – Vinkulierung ausschalten oder ' +
        'Namenaktien wählen.',
      );
    }
    if (!eff.vollLiberiert) {
      blocker.push(
        'Inhaberaktien dürfen erst nach Einzahlung des VOLLEN Nennwerts ausgegeben werden – vorher ' +
        'ausgegebene Aktien sind nichtig (Art. 683 Abs. 1 und 2 OR). Volliberierung wählen oder Namenaktien.',
      );
    }
    if (a.statutenUmfang === 'lang') {
      blocker.push(
        'Erstausbau: Inhaberaktien nur mit der Statuten-KURZFASSUNG – die amtliche ZH-Langvorlage ist ' +
        'Namenaktien-spezifisch (Aktienbuch-, Übertragungs- und Stimmrechts-Artikel müssten angepasst werden).',
      );
    }
  }
  // ── Stufe 2 P3: Statuten-Zusatzklauseln (697n/653s/653a — am Cache) ──
  if (a.schiedsklausel && !a.schiedsOrt.trim()) {
    blocker.push(
      'Schiedsklausel: Sitz des Schiedsgerichts angeben – er muss in der Schweiz liegen ' +
      '(Art. 697n Abs. 1 OR: «durch ein Schiedsgericht mit Sitz in der Schweiz»).',
    );
  }
  if (a.kapitalband) {
    const kapitalKb = zahl(a.aktienkapitalChf);
    const unter = zahl(a.kbUntergrenze);
    const ober = zahl(a.kbObergrenze);
    if (unter === null || ober === null) {
      blocker.push('Kapitalband: untere und obere Grenze beziffern (Art. 653t Abs. 1 Ziff. 1 OR).');
    } else if (kapitalKb !== null && kapitalKb > 0) {
      if (ober > kapitalKb * 1.5 + 0.005) {
        blocker.push(
          `Kapitalband: Die obere Grenze darf das Aktienkapital höchstens um die Hälfte übersteigen ` +
          `(Art. 653s Abs. 2 OR) – zulässig sind höchstens ${fmtCHF(String(kapitalKb * 1.5))}.`,
        );
      }
      if (a.kbRichtung === 'beide' && unter < kapitalKb * 0.5 - 0.005) {
        blocker.push(
          `Kapitalband: Die untere Grenze darf das Aktienkapital höchstens um die Hälfte unterschreiten ` +
          `(Art. 653s Abs. 2 OR) – zulässig sind mindestens ${fmtCHF(String(kapitalKb * 0.5))}.`,
        );
      }
      if (a.kbRichtung === 'erhoehen' && Math.abs(unter - kapitalKb) > 0.005) {
        blocker.push(
          'Kapitalband (nur Erhöhung): Die untere Grenze entspricht dem Aktienkapital – ohne ' +
          'Herabsetzungs-Ermächtigung kann das Kapital die Gründungshöhe nicht unterschreiten (Art. 653s Abs. 3 OR).',
        );
      }
      if (ober <= kapitalKb + 0.005 && a.kbRichtung === 'erhoehen') {
        blocker.push('Kapitalband (nur Erhöhung): Die obere Grenze muss über dem Aktienkapital liegen.');
      }
      if (unter > kapitalKb + 0.005 || ober < kapitalKb - 0.005) {
        blocker.push('Kapitalband: Das Aktienkapital muss innerhalb der Bandbreite liegen.');
      }
      // Bug-Check §9 MITTEL-1 (7.6.2026): Die Klausel nennt die Höchstzahl
      // neuer/zu vernichtender Aktien — Grenzen, die kein Vielfaches des
      // Nennwerts sind, wären in ganzen Aktien nie erreichbar (innerer
      // Textwiderspruch im selben Artikel).
      const nwKb = zahl(a.nennwertChf);
      if (nwKb !== null && nwKb > 0) {
        const istVielfaches = (x: number) => Math.abs(x / nwKb - Math.round(x / nwKb)) < 0.0001;
        if (!istVielfaches(ober - kapitalKb)) {
          blocker.push('Kapitalband: Der Abstand der oberen Grenze zum Aktienkapital muss einem Vielfachen des Nennwerts entsprechen (ganze Anzahl neuer Aktien — die Statuten nennen Anzahl, Nennwert und Art, Art. 653t Abs. 1 Ziff. 4 OR).');
        }
        if (a.kbRichtung === 'beide' && !istVielfaches(kapitalKb - unter)) {
          blocker.push('Kapitalband: Der Abstand der unteren Grenze zum Aktienkapital muss einem Vielfachen des Nennwerts entsprechen (ganze Anzahl zu vernichtender Aktien).');
        }
      }
    }
    if (!a.kbEndeDatum) {
      blocker.push('Kapitalband: Ende der Ermächtigung datieren (Art. 653t Abs. 1 Ziff. 2 OR) – längstens fünf Jahre (Art. 653s Abs. 1 OR).');
    } else if (a.datum) {
      // §2 Determinismus: reine Kalender-Arithmetik. Der frühere Mix aus
      // new Date(iso) (parst UTC) und getDate()/setFullYear() (lokal) machte
      // das Gate zeitzonenabhängig (Bug-Check 7.6.2026 HOCH-2: westlich von
      // UTC passierten 5 Jahre + 1 Tag, in Europe/Zurich blockierte die
      // DST-Grenze gültige Enddaten). addYears klemmt den 29.2. auf den
      // 28.2. (Monatsfrist-Konvention); ISO-Strings vergleichen lexikografisch.
      const max = formatISO(addYears(parseISO(a.datum), 5));
      if (a.kbEndeDatum > max) {
        blocker.push('Kapitalband: Die Ermächtigung gilt für längstens FÜNF Jahre ab Beschluss (Art. 653s Abs. 1 OR) – Ende-Datum kürzen.');
      }
    }
    if (a.kbRichtung === 'beide' && a.optingOut) {
      blocker.push(
        'Kapitalband mit Herabsetzungs-Ermächtigung nur, wenn die Gesellschaft NICHT auf die ' +
        'eingeschränkte Revision verzichtet hat (Art. 653s Abs. 4 OR) – «nur Erhöhung» wählen oder ' +
        'eine Revisionsstelle bestellen.',
      );
    }
  }
  if (a.bedingtesKapital) {
    const kapitalBk = zahl(a.aktienkapitalChf);
    const betrag = zahl(a.bkBetrag);
    if (betrag === null || betrag <= 0) {
      blocker.push('Bedingtes Kapital: Nennbetrag beziffern (Art. 653b Abs. 1 Ziff. 1 OR).');
    } else {
      if (kapitalBk !== null && kapitalBk > 0 && betrag > kapitalBk * 0.5 + 0.005) {
        blocker.push(
          `Bedingtes Kapital: Der Nennbetrag darf die Hälfte des eingetragenen Aktienkapitals nicht ` +
          `übersteigen (Art. 653a Abs. 1 OR) – zulässig sind höchstens ${fmtCHF(String(kapitalBk * 0.5))}.`,
        );
      }
      const nwBk = zahl(a.nennwertChf);
      if (nwBk !== null && nwBk > 0 && Math.abs(betrag / nwBk - Math.round(betrag / nwBk)) > 0.0001) {
        blocker.push('Bedingtes Kapital: Der Nennbetrag muss einem Vielfachen des Nennwerts entsprechen (ganze Anzahl Aktien, Art. 653b Abs. 1 Ziff. 2 OR).');
      }
    }
    if (!a.bkKreis.trim()) {
      blocker.push('Bedingtes Kapital: Kreis der Wandel- bzw. Optionsberechtigten angeben (Art. 653b Abs. 1 Ziff. 3 OR), z. B. «den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft».');
    }
  }

  bereich('kapital');
  const kapital = zahl(a.aktienkapitalChf);
  const anzahl = zahl(a.anzahlAktien);
  const nennwert = zahl(a.nennwertChf);
  const prozent = zahl(a.liberierungProzent);
  if (kapital === null || anzahl === null || nennwert === null) {
    blocker.push('Aktienkapital, Anzahl und Nennwert der Aktien beziffern (Art. 626 Abs. 1 Ziff. 3 und 4 OR).');
  } else {
    if (nennwert <= 0) blocker.push('Der Nennwert muss grösser als null sein (Art. 622 Abs. 4 OR).');
    if (!a.fremdwaehrung && kapital < 100_000) {
      blocker.push('Das Aktienkapital beträgt mindestens CHF 100\'000 (Art. 621 Abs. 1 OR).');
    }
    // Art. 621 Abs. 2 OR (am Cache verifiziert 7.6.2026): «Zum Zeitpunkt der
    // Errichtung muss dieses einem Gegenwert von mindestens 100 000 Franken
    // entsprechen.»
    if (a.fremdwaehrung && kurs !== null && kurs > 0 && kapital * kurs < 100_000) {
      blocker.push(
        `Das Aktienkapital in ${a.waehrung} muss im Zeitpunkt der Errichtung einem Gegenwert von mindestens ` +
        `CHF 100'000 entsprechen (Art. 621 Abs. 2 OR) – ${a.waehrung} ${fmtCHF(a.aktienkapitalChf)} × ${a.kursChf.trim().replace(',', '.')} ` +
        `= CHF ${fmtCHF(String(kapital * kurs))}.`,
      );
    }
    if (ganzePositive(a.anzahlAktien) === null) blocker.push('Anzahl Aktien als positive ganze Zahl angeben.');
    // Gleiche Befundklasse wie KE-M-1 (/simplify-Nachzug): keine «3.5 Aktien»
    // in der Zeichnungszeile des Errichtungsakts. Bereich personen: das
    // Eingabefeld liegt in der Gründer-Karte (Praxis-Check NIEDRIG-1).
    bereich('personen');
    for (const g of a.gruender) {
      if (g.name.trim() && ganzePositive(g.anzahl) === null) {
        blocker.push(`Gezeichnete Aktienzahl von ${g.name.trim()} als positive ganze Zahl angeben.`);
      }
    }
    bereich('kapital');
    if (nennwert > 0 && anzahl > 0 && Math.abs(anzahl * nennwert - kapital) > 0.005) {
      const wc = a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF';
      blocker.push(
        `Rechnerische Unstimmigkeit: ${a.anzahlAktien} Aktien × ${wc} ${fmtCHF(a.nennwertChf)} ergeben nicht das Aktienkapital von ${wc} ${fmtCHF(a.aktienkapitalChf)}.`,
      );
    }
    if (prozent === null || prozent < 20 || prozent > 100) {
      blocker.push('Liberierungsgrad zwischen 20 % und 100 % angeben (Art. 632 Abs. 1 OR: mindestens 20 % des Nennwerts jeder Aktie).');
    }
    // Etappe 3.3/D6: individuelle Liberierungsgrade je Gründer (ZH 3.1
    // Teilliberierung «a) … Aktien des Gründers … zu … %»); Bereich
    // personen — Feld in der Gründer-Karte (Praxis-Check NIEDRIG-1).
    bereich('personen');
    for (const g of a.gruender.filter((x) => x.name.trim() && (x.liberierung ?? '').trim() !== '')) {
      const p = zahl(g.liberierung);
      if (p === null || p < 20 || p > 100) {
        blocker.push(`Liberierungsgrad von ${g.name.trim()} zwischen 20 % und 100 % angeben (Art. 632 Abs. 1 OR).`);
      }
    }
    bereich('kapital');
    // Gesamt-Untergrenze auf den geleisteten Einlagen GESAMT (Nennwert-Teil
    // + voll geleistetes Agio — eine Quelle, effektiveLiberierung(); Art. 632
    // Abs. 2 OR: «In allen Fällen müssen die geleisteten Einlagen …»).
    const agioZusatz = eff.hatAgio ? ' (einschliesslich des voll geleisteten Agios)' : '';
    if (!eff.vollLiberiert && !a.fremdwaehrung && eff.einbezahltGesamt > 0 && eff.einbezahltGesamt < 50_000) {
      blocker.push(
        `Die geleisteten Einlagen müssen gesamthaft mindestens CHF 50'000 betragen (Art. 632 Abs. 2 OR) – die Liberierungsgrade ergeben nur CHF ${fmtCHF(String(eff.einbezahltGesamt))}${agioZusatz}.`,
      );
    } else if (!eff.vollLiberiert && a.fremdwaehrung && kurs !== null && kurs > 0 && eff.einbezahltGesamt * kurs < 50_000) {
      // Art. 632 Abs. 2 Satz 2 OR (am Cache verifiziert): Fremdwährungs-
      // Einlagen müssen im Errichtungszeitpunkt einem Gegenwert von
      // mindestens CHF 50'000 entsprechen.
      blocker.push(
        `Die geleisteten Einlagen müssen einem Gegenwert von mindestens CHF 50'000 entsprechen (Art. 632 Abs. 2 OR) – ` +
        `die Liberierungsgrade ergeben nur CHF ${fmtCHF(String(eff.einbezahltGesamt * kurs))}${agioZusatz}.`,
      );
    }
    // Etappe 3.2/D7 · Stufe 2 P1b/P1c: Agio (Ausgabebetrag über pari; Art.
    // 624 Abs. 1 OR: nie UNTER dem Nennwert). Das Agio ist bei der Ausgabe
    // VOLL zu leisten — teilliberierbar ist nur der Nennwert-Teil (Art. 632
    // Abs. 1 OR); die Einlagen-Rechnung deckt das (effektiveLiberierung).
    // Agio ist auch qualifiziert offen: Wert-Gates rechnen je Position auf
    // dem AUSGABEBETRAG (Art. 629 Abs. 2 Ziff. 2 OR: «die versprochenen
    // Einlagen entsprechen dem gesamten Ausgabebetrag»).
    const ausgabe = a.ausgabebetragChf.trim() === '' ? nennwert : zahl(a.ausgabebetragChf);
    if (ausgabe === null) {
      blocker.push('Ausgabebetrag je Aktie beziffern – oder leer lassen (Ausgabe zum Nennwert).');
    } else if (ausgabe < nennwert - 0.005) {
      blocker.push('Der Ausgabebetrag darf den Nennwert nicht unterschreiten (Ausgabe unter pari unzulässig, Art. 624 Abs. 1 OR).');
    }
    const gezeichnet = a.gruender.reduce((s, g) => s + (zahl(g.anzahl) ?? 0), 0);
    if (a.gruender.length > 0 && anzahl > 0 && gezeichnet !== anzahl) {
      blocker.push(
        `Die Zeichnungen der Gründer (${gezeichnet} Aktien) müssen sämtliche ${a.anzahlAktien} Aktien abdecken (Art. 629 Abs. 2 Ziff. 1 OR).`,
      );
    }

    // ── Etappe 2 · Stufe 2 P1c: Wert-Deckung je qualifizierter Position auf
    // dem AUSGABEBETRAG («die versprochenen Einlagen entsprechen dem gesamten
    // Ausgabebetrag», Art. 629 Abs. 2 Ziff. 2 OR — ohne Agio ist der
    // Ausgabebetrag der Nennwert, die Rechnung bleibt dieselbe). Beträge in
    // der Kapitalwährung (Stufe 2 P1a; wc unten). ──
    if (nennwert > 0) {
      const wc = a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF';
      const ausgabeWert = ausgabe !== null && ausgabe >= nennwert - 0.005 ? ausgabe : nennwert;
      const ausgabeFmtTxt = fmtCHF(a.ausgabebetragChf.trim() === '' ? a.nennwertChf : a.ausgabebetragChf);
      const basisLabel = eff.hatAgio ? 'Ausgabebetrag' : 'Nennwert';
      for (const s of sachen) {
        const wer = s.einlegerName.trim() || s.bezeichnung.trim() || 'Sacheinlage';
        const akt = ganzePositive(s.aktienAnzahl);
        const wert = zahl(s.wertChf);
        const gut = s.gutschriftChf.trim() === '' ? 0 : zahl(s.gutschriftChf);
        if (!s.bezeichnung.trim()) blocker.push(`Sacheinlage von ${wer}: Gegenstand bezeichnen (Statuten-Pflichtinhalt, Art. 634 Abs. 4 OR).`);
        if (!s.einlegerName.trim()) blocker.push('Sacheinlage: Name der Einlegerin / des Einlegers angeben (Art. 634 Abs. 4 OR).');
        if (akt === null) blocker.push(`Sacheinlage von ${wer}: Anzahl der dafür ausgegebenen Aktien als positive ganze Zahl angeben (Art. 634 Abs. 4 OR).`);
        if (wert === null || wert <= 0) blocker.push(`Sacheinlage von ${wer}: Bewertung in ${wc} (Kapitalwährung) beziffern (Art. 634 Abs. 4 OR).`);
        if (gut === null || gut < 0) blocker.push(`Sacheinlage von ${wer}: Gutschrift als Betrag ab 0 angeben.`);
        if (akt !== null && wert !== null && gut !== null && gut >= 0 && Math.abs(wert - (akt * ausgabeWert + gut)) > 0.005) {
          blocker.push(
            `Sacheinlage von ${wer}: Bewertung ${wc} ${fmtCHF(s.wertChf)} muss ${s.aktienAnzahl} Aktien × ${wc} ${ausgabeFmtTxt} (${basisLabel})` +
            (gut > 0 ? ` + Gutschrift ${wc} ${fmtCHF(s.gutschriftChf)}` : '') +
            ' entsprechen (Art. 629 Abs. 2 Ziff. 2 OR: versprochene Einlagen = gesamter Ausgabebetrag).',
          );
        }
        if (s.typ === 'geschaeft') {
          const akt2 = zahl(s.aktivenChf);
          const pas = zahl(s.passivenChf);
          if (akt2 === null || pas === null) {
            blocker.push(`Sacheinlage von ${wer}: Aktiven und Passiven der Übernahmebilanz beziffern (ZH-Vorlage «Geschäft»).`);
          } else if (wert !== null && wert > akt2 - pas + 0.005) {
            blocker.push(
              `Sacheinlage von ${wer}: Der Kaufpreis CHF ${fmtCHF(s.wertChf)} übersteigt die Netto-Aktiven der Übernahmebilanz ` +
              `(CHF ${fmtCHF(String(akt2 - pas))}) – Deckung nicht plausibel (Art. 634 Abs. 1 Ziff. 1 OR).`,
            );
          }
          // Art. 181 OR am Cache verifiziert (7.6.2026): Solidarhaftung des
          // bisherigen Schuldners 3 Jahre; Abs. 4 verweist eingetragene
          // Rechtsträger auf die FusG-Vermögensübertragung.
          warnungen.push(
            `Geschäftsübernahme von ${wer}: Mit der Übernahme von Aktiven und Passiven haftet die Gesellschaft den ` +
            'Gläubigern ab Mitteilung bzw. Auskündigung; die bisherige Schuldnerin haftet drei Jahre solidarisch weiter ' +
            '(Art. 181 Abs. 1 und 2 OR). Bei im Handelsregister eingetragenen Rechtsträgern richtet sich die Übernahme ' +
            'nach dem Fusionsgesetz (Art. 181 Abs. 4 OR).',
          );
        }
        if (s.grundstueck && a.immobilienHauptzweck === false) {
          warnungen.push(
            `Sacheinlage von ${wer} enthält ein Grundstück: Lex-Koller-Erklärung prüfen (Erwerb von ` +
            'Nicht-Betriebsstätte-Grundstücken durch Personen im Ausland, Frage 3 des ZH-Formulars; Art. 4 Abs. 1 lit. e BewG).',
          );
        }
      }
      for (const v of verr) {
        const akt = ganzePositive(v.aktienAnzahl);
        const ford = zahl(v.forderungChf);
        if (akt === null) blocker.push(`Verrechnung von ${v.glaeubigerName.trim()}: Anzahl der zukommenden Aktien als positive ganze Zahl angeben (Art. 634a Abs. 3 OR).`);
        if (ford === null || ford <= 0) blocker.push(`Verrechnung von ${v.glaeubigerName.trim()}: Betrag der Forderung in ${wc} (Kapitalwährung) beziffern (Art. 634a Abs. 3 OR).`);
        if (akt !== null && ford !== null && Math.abs(ford - akt * ausgabeWert) > 0.005) {
          blocker.push(
            `Verrechnung von ${v.glaeubigerName.trim()}: Verrechneter Betrag ${wc} ${fmtCHF(v.forderungChf)} muss ` +
            `${v.aktienAnzahl} Aktien × ${wc} ${ausgabeFmtTxt} (${basisLabel}) entsprechen (Art. 629 Abs. 2 Ziff. 2 OR).`,
          );
        }
      }
      for (const vt of vorteile) {
        if (!vt.inhalt.trim() || zahl(vt.wertChf) === null) {
          blocker.push(`Besonderer Vorteil für ${vt.beguenstigter.trim()}: Inhalt und Wert angeben (Art. 636 OR: «Inhalt und Wert des gewährten Vorteils»).`);
        }
      }
      // Deckungs-Summe: qualifizierte Aktien dürfen die Gesamtzahl nicht
      // übersteigen; bei reiner Sach-/Verrechnungsgründung müssen sie ALLE
      // Aktien decken (sonst bliebe ein ungedeckter Bar-Rest ohne Bareinlage).
      const qAktien = sachen.reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0)
        + verr.reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0);
      if (anzahl > 0 && qAktien > anzahl) {
        blocker.push(`Sacheinlage-/Verrechnungs-Aktien (${qAktien}) übersteigen die Gesamtzahl von ${a.anzahlAktien} Aktien.`);
      }
      if (anzahl > 0 && a.einlageArt !== 'gemischt' && (mitSach || mitVerr) && qAktien > 0 && qAktien < anzahl) {
        blocker.push(
          `Bei der Einlage-Art «${a.einlageArt}» müssen sämtliche ${a.anzahlAktien} Aktien qualifiziert gedeckt sein ` +
          `(erfasst: ${qAktien}) – für einen Bar-Anteil die Einlage-Art «gemischt» wählen.`,
        );
      }
      if (a.einlageArt === 'gemischt' && anzahl > 0 && qAktien >= anzahl) {
        blocker.push('Einlage-Art «gemischt»: mindestens eine Aktie muss bar liberiert bleiben – sonst die reine Einlage-Art wählen.');
      }
    }
  }

  bereich('personen');
  if (a.gruender.filter((g) => g.name.trim()).length === 0) {
    blocker.push('Mindestens eine Gründerin / einen Gründer erfassen (Einpersonengründung zulässig – Art. 625 OR aufgehoben).');
  }
  const vr = a.verwaltungsraete.filter((v) => v.name.trim());
  if (vr.length === 0) {
    blocker.push('Mindestens ein Mitglied des Verwaltungsrates erfassen (Art. 707 Abs. 1 OR).');
  }
  if (vr.length > 1 && vr.filter((v) => v.praesident).length !== 1) {
    blocker.push('Bei mehrgliedrigem Verwaltungsrat genau EINE Person als Präsidentin/Präsidenten bezeichnen (Art. 712 Abs. 2 OR).');
  }
  if (vr.length > 0 && vr.every((v) => v.zeichnungsArt === 'ohne')) {
    blocker.push('Mindestens ein Mitglied des Verwaltungsrates muss zur Vertretung befugt sein (Art. 718 Abs. 3 OR).');
  }
  bereich('weiteres');
  // Etappe 4.2/D9: Die Urkunde ersetzt nur die VR-Konstituierung — weitere
  // Zeichnungsberechtigte (Direktion/Prokura) brauchen das VR-Protokoll.
  if (a.konstituierungInUrkunde && a.weitereVertretungen.filter((v) => v.name.trim()).length > 0) {
    blocker.push(
      'Konstituierung in der Urkunde: weitere Zeichnungsberechtigte (Direktion/Prokura) können nicht in der ' +
      'Gründungsurkunde ernannt werden – Option ausschalten (VR-Protokoll) oder die Personen nach dem ' +
      'Eintrag durch den Verwaltungsrat ernennen lassen (Art. 716a Abs. 1 Ziff. 4 OR).',
    );
  }
  // Sammel-Bug-Check Befund 1 (7.6.2026): Die Konstituierungs-Erklärung in
  // der GRÜNDERURKUNDE können nur erschienene/unterzeichnende Personen
  // abgeben — die ZH-Vorlage setzt VR = Gründer voraus («die soeben als
  // Verwaltungsräte ernannten Gründer»). Nicht-Gründer-VR → VR-Protokoll.
  if (a.konstituierungInUrkunde) {
    const gruenderNamen = new Set(a.gruender.filter((g) => g.name.trim()).map((g) => g.name.trim()));
    const fremde = a.verwaltungsraete.filter((v) => v.name.trim() && !gruenderNamen.has(v.name.trim()));
    if (fremde.length > 0) {
      blocker.push(
        `Konstituierung in der Urkunde nur möglich, wenn alle VR-Mitglieder zugleich Gründerinnen/Gründer ` +
        `(erschienene und unterzeichnende Personen) sind – ${fremde.map((v) => v.name.trim()).join(', ')} ` +
        'steht nicht in der Gründerliste. Option ausschalten (separates VR-Protokoll) oder die Person als ' +
        'Gründer:in erfassen (ZH-Urkundenvorlage Ziff. VII: «die soeben als Verwaltungsräte ernannten Gründer»).',
      );
    }
  }
  bereich('kapital');
  if (a.bankInUrkundeGenannt && (a.einlageArt === 'bar' || a.einlageArt === 'gemischt') && (!a.bankName.trim() || !a.bankOrt.trim())) {
    blocker.push('Bank in der Urkunde nennen: Name und Ort des Instituts angeben (sonst separate Bankbescheinigung, Art. 43 Abs. 1 lit. f HRegV).');
  }
  bereich('weiteres');
  if (!a.eigeneBueros && (!a.domizilhalterName.trim() || !a.domizilhalterAdresse.trim())) {
    blocker.push('c/o-Domizil: Domizilhalter/in mit Adresse angeben (Art. 117 Abs. 3 HRegV).');
  }
  // Bug-Check-Befund Agent 1 (7.6.2026): Sitz ist Beleg-Inhalt (Art. 44
  // lit. f HRegV) und erscheint im druckfertigen RS-Wahlannahme-Absender —
  // wie bankOrt/domizilhalterAdresse hart verlangen.
  bereich('personen');
  if (!a.optingOut && (!a.revisionsstelleName.trim() || !a.revisionsstelleSitz.trim())) {
    blocker.push('Revisionsstelle mit Name und Sitz benennen oder Opting-out wählen (Art. 727a Abs. 2 OR; Art. 44 lit. f HRegV).');
  }

  bereich('weiteres');
  // Etappe 4.4/D11: Nachtrag nur mit mindestens einer erfassten Änderung.
  if (a.nachtragAktiv) {
    const hatU = a.nachtragUrkundeZiffer.trim() !== '' && a.nachtragUrkundeText.trim() !== '';
    const hatS = a.nachtragStatutenArtikel.trim() !== '' && a.nachtragStatutenText.trim() !== '';
    if (!hatU && !hatS) {
      blocker.push('Gründungs-Nachtrag: mindestens eine Änderung erfassen (Urkunden-Ziffer ODER Statuten-Artikel, je mit neuem Wortlaut — ZH-Vorlage 3.4).');
    }
  }

  bereich('gesellschaft');
  if (!a.firma.trim()) blocker.push('Firma angeben – mit Rechtsformzusatz «AG» (Art. 950 OR).');
  else if (!/\bag\b|aktiengesellschaft/i.test(a.firma)) {
    warnungen.push('Die Firma muss die Rechtsform angeben (Art. 950 Abs. 1 OR) – Zusatz «AG» ergänzen.');
  }
  if (!a.sitz.trim()) blocker.push('Sitz (politische Gemeinde) angeben (Art. 626 Abs. 1 Ziff. 1 OR).');
  if (!a.zweck.trim()) blocker.push('Zweck angeben (Art. 626 Abs. 1 Ziff. 2 OR).');

  return { blocker: blockerDetails.map((d) => d.text), warnungen, blockerDetails };
}

// ── Antworten-Aufbereitung ──────────────────────────────────────────────────

function basisAntworten(a: AgDokAntworten): Antworten {
  const datum = a.datum ? fmtDatum(a.datum) : '________';
  const nennwert = zahl(a.nennwertChf) ?? 0;
  const anzahl = zahl(a.anzahlAktien) ?? 0;
  // Etappe 3.2/3.3: effektive Liberierung (eine Quelle mit den Gates) und
  // Ausgabebetrag (leer = Nennwert).
  const eff = effektiveLiberierung(a);
  const ausgabe = a.ausgabebetragChf.trim() === '' ? nennwert : (zahl(a.ausgabebetragChf) ?? nennwert);
  const praesident = a.verwaltungsraete.find((v) => v.praesident)?.name.trim()
    ?? a.verwaltungsraete.find((v) => v.name.trim())?.name.trim() ?? '________';
  const gruenderAnzahl = a.gruender.filter((g) => g.name.trim()).length;
  const vrAnzahl = a.verwaltungsraete.filter((v) => v.name.trim()).length;
  // Etappe 2: qualifizierte Tatbestände (Weichen-gefiltert wie in den Gates, §5).
  const mitSach = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
  const mitVerr = a.einlageArt === 'verrechnung' || a.einlageArt === 'gemischt';
  const sachen = mitSach ? a.sacheinlagen.filter((s) => s.einlegerName.trim() || s.bezeichnung.trim()) : [];
  const verr = mitVerr ? a.verrechnungen.filter((v) => v.glaeubigerName.trim()) : [];
  const vorteile = a.besondereVorteile ? a.vorteile.filter((v) => v.beguenstigter.trim()) : [];
  const qAktien = sachen.reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0)
    + verr.reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0);
  const barAktien = Math.max(0, anzahl - qAktien);
  return {
    ...a,
    hatQualifiziert: sachen.length > 0 || verr.length > 0 || vorteile.length > 0,
    hatSacheinlagen: sachen.length > 0,
    hatVerrechnungen: verr.length > 0,
    hatVorteile: vorteile.length > 0,
    nurBar: a.einlageArt === 'bar',
    istGemischt: a.einlageArt === 'gemischt',
    // Etappe 3.1/D2: wirksame Kapitalwährung (CHF, solange die Weiche aus
    // ist oder keine zulässige Währung gewählt wurde — Gates erzwingen das).
    waehrungCode: a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF',
    fremdwaehrungAktiv: a.fremdwaehrung,
    // Stufe 2 P2: Aktien-Art (Art. 622 Abs. 1 OR) — EIN Wort an allen
    // Text-Stellen; für Namenaktien byte-identisch zur bisherigen Fassung.
    aktienArt: a.inhaberaktien ? 'Inhaberaktien' : 'Namenaktien',
    istInhaber: a.inhaberaktien,
    inhaberBucheffekten: a.inhaberaktien && !a.inhaberKotiert,
    inhaberKotiertAktiv: a.inhaberaktien && a.inhaberKotiert,
    verwahrungsstelleZeile: a.verwahrungsstelle.trim() || '________',
    // Stufe 2 P3: Statuten-Zusatzklauseln.
    hatSchiedsklausel: a.schiedsklausel,
    schiedsOrtTxt: a.schiedsOrt.trim() || '________',
    kapitalbandBeide: a.kapitalband && a.kbRichtung === 'beide',
    kapitalbandErhoehen: a.kapitalband && a.kbRichtung === 'erhoehen',
    kbUntergrenzeFmt: fmtCHF(a.kbUntergrenze),
    kbObergrenzeFmt: fmtCHF(a.kbObergrenze),
    kbEndeFmt: a.kbEndeDatum ? fmtDatum(a.kbEndeDatum) : '________',
    // Höchstzahlen neuer/zu vernichtender Aktien aus den Band-Grenzen
    // (653t I Ziff. 4: Anzahl, Nennwert und Art der Aktien).
    kbMaxNeuTxt: nennwert > 0 && zahl(a.kbObergrenze) !== null
      ? String(Math.max(0, Math.floor(((zahl(a.kbObergrenze) ?? 0) - (zahl(a.aktienkapitalChf) ?? 0)) / nennwert)))
      : '________',
    kbMaxWegTxt: nennwert > 0 && zahl(a.kbUntergrenze) !== null
      ? String(Math.max(0, Math.floor(((zahl(a.aktienkapitalChf) ?? 0) - (zahl(a.kbUntergrenze) ?? 0)) / nennwert)))
      : '________',
    hatBedingtesKapital: a.bedingtesKapital,
    bkBetragFmt: fmtCHF(a.bkBetrag),
    bkKreisTxt: a.bkKreis.trim() || '________',
    bkAnzahlTxt: nennwert > 0 && zahl(a.bkBetrag) !== null
      ? String(Math.max(0, Math.floor((zahl(a.bkBetrag) ?? 0) / nennwert)))
      : '________',
    // Lang-Stufe: Stichentscheid des Vorsitzenden (Fragment — leer, wenn
    // abgewählt; dann gilt die gesetzliche Lage: Stimmengleichheit =
    // Antrag abgelehnt). Wortlaut = ZH-Langvorlage verbatim.
    stichentscheidSatz: a.stichentscheidGv ? ' Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.' : '',
    // «Geschäftsjahr erstmals am»: Zusatzsatz im GJ-Artikel (Fragment).
    gjErstesSatz: a.gjErstesEnde.trim() ? ` Das erste Geschäftsjahr endet am ${a.gjErstesEnde.trim()}.` : '',
    // Bug-Check 3.1 Befund 2: Komma-Eingaben normalisieren (Urkunde zeigt
    // den Kurs in Punkt-Notation wie die ZH-Vorlage «CHF 1.xxxx»).
    kursTxt: a.kursChf.trim().replace(',', '.') || '________',
    kursQuelleTxt: a.kursQuelle.trim() || '________',
    // Sammel-Bug-Check HOCH-2 (7.6.2026) · Stufe 2 P1: Basis des CHF-
    // Gegenwerts sind die GELEISTETEN Einlagen GESAMT — geleisteter
    // Nennwert-Teil + voll geleistetes Agio (eine Quelle: effektive-
    // Liberierung; bei Volliberierung mit Agio = Anzahl × Ausgabebetrag,
    // byte-identisch zur bisherigen Sonderrechnung).
    einbezahltChfFmt: fmtCHF(String(eff.einbezahltGesamt * (zahl(a.kursChf) ?? 0))),
    hatBarEinlage: a.einlageArt === 'bar' || (a.einlageArt === 'gemischt' && barAktien > 0),
    // Stufe 2 P1d: geleisteter NENNWERT-Teil der Bar-Aktien (bei
    // Volliberierung = barAktien × Nennwert, byte-identisch); das Agio
    // weisen eigene Bausteine aus.
    barEinlageFmt: fmtCHF(String(eff.barEinbezahlt)),
    barAktienTxt: String(barAktien),
    // Stufe 2 P1b: Agio-Kennzahlen (Agio ist VOLL zu leisten).
    agioJeAktieFmt: fmtCHF(String(eff.agioJeAktie)),
    agioTotalFmt: fmtCHF(String(eff.agioTotal)),
    barAgioFmt: fmtCHF(String(barAktien * eff.agioJeAktie)),
    hatAgioTeilBar: eff.hatAgio && !eff.vollLiberiert && a.einlageArt === 'bar',
    hatAgioGemischt: eff.hatAgio && a.einlageArt === 'gemischt',
    hatAgioQualifiziertRein: eff.hatAgio && (a.einlageArt === 'sacheinlage' || a.einlageArt === 'verrechnung'),
    // Statuten-Klauseln der qualifizierten Gründung: bei Agio den
    // Ausgabebetrag offenlegen (Fragment, leer ersatzlos).
    ausgabeKlammerSatz: eff.hatAgio
      ? ` (Ausgabebetrag ${a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF'} ${fmtCHF(a.ausgabebetragChf.trim() === '' ? a.nennwertChf : a.ausgabebetragChf)} je Aktie)`
      : '',
    qualifiziertIntro:
      sachen.length > 0 && verr.length > 0
        ? 'Die in den Statuten angegebenen Sacheinlagen und Verrechnungstatbestände gemäss folgenden, vorliegenden Unterlagen:'
        : sachen.length > 0
          ? 'Die in den Statuten angegebenen Sacheinlagen gemäss folgenden, vorliegenden Unterlagen:'
          : 'Die in den Statuten angegebene Verrechnungsliberierung gemäss folgenden, vorliegenden Unterlagen:',
    revisorZeile: a.revisorName.trim() || '________',
    // Etappe 4.4/D11: Gründungs-Nachtrag (ZH 3.4).
    nachtragGruendungsdatumFmt: a.nachtragGruendungsdatum ? fmtDatum(a.nachtragGruendungsdatum) : '________',
    hatNachtragUrkunde: a.nachtragUrkundeZiffer.trim() !== '' && a.nachtragUrkundeText.trim() !== '',
    hatNachtragStatuten: a.nachtragStatutenArtikel.trim() !== '' && a.nachtragStatutenText.trim() !== '',
    nachtragAbsatzSatz: a.nachtragStatutenAbsatz.trim() ? ` Abs. ${a.nachtragStatutenAbsatz.trim()}` : '',
    // Etappe 4.3: Lex-Koller-Antworten als Ja/Nein-Text (Frage 4 ist bei
    // der Gründung nicht anwendbar — keine Kapitalherabsetzung).
    lkFrage1: a.lexKollerAuslandBeteiligt ? 'Ja' : 'Nein',
    lkFrage2: a.lexKollerNeuerwerb ? 'Ja' : 'Nein',
    lkFrage3: a.lexKollerGrundstueckErwerb ? 'Ja' : 'Nein',
    sachListe: sachen.map((s) => ({
      // Vertragsdatum = Mappen-Datum (alle Dokumente derselben Gründung).
      vertragDatumFmt: datum,
      typGeschaeft: s.typ === 'geschaeft',
      bezeichnung: s.bezeichnung.trim() || '________',
      belegDatumFmt: s.belegDatum ? fmtDatum(s.belegDatum) : '________',
      belegSatz: s.typ === 'geschaeft'
        ? `Übernahmebilanz per ${s.belegDatum ? fmtDatum(s.belegDatum) : '________'}`
        : `Inventarliste vom ${s.belegDatum ? fmtDatum(s.belegDatum) : '________'}`,
      wertFmt: fmtCHF(s.wertChf),
      einleger: s.einlegerName.trim() || '________',
      aktien: s.aktienAnzahl,
      gutschriftSatz: s.gutschriftChf.trim()
        ? ` Ferner werden ${s.einlegerName.trim() || '________'} ${a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF'} ${fmtCHF(s.gutschriftChf)} in den Büchern der Gesellschaft gutgeschrieben.`
        : '',
      gutschriftKlauselSatz: s.gutschriftChf.trim()
        ? `; als weitere Gegenleistung wird eine Gutschrift von ${a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF'} ${fmtCHF(s.gutschriftChf)} gewährt`
        : '',
      // Art. 634 Abs. 1 Ziff. 3 OR / ZH-Urkunde 3.3: Grundstücks-Weiche.
      verfuegungsSatz: s.grundstueck
        ? 'einen bedingungslosen Anspruch auf Eintragung in das Grundbuch erhält'
        : 'sofort als Eigentümerin über die Sacheinlage verfügen kann',
      grundstueck: s.grundstueck,
      hrZusatz: s.typ === 'geschaeft' ? (s.imHrEingetragen ? 'des im Handelsregister eingetragenen' : 'des im Handelsregister nicht eingetragenen') : '',
      cheSatz: s.typ === 'geschaeft' && s.cheNr.trim() ? ` (${s.cheNr.trim()})` : '',
      aktivenFmt: fmtCHF(s.aktivenChf),
      passivenFmt: fmtCHF(s.passivenChf),
      rueckwirkungFmt: s.rueckwirkungDatum ? fmtDatum(s.rueckwirkungDatum) : '',
      zustandTxt: s.zustand.trim() || '________',
      objektLabel: s.typ === 'geschaeft'
        ? `alle Aktiven und Passiven ${s.imHrEingetragen ? 'des im Handelsregister eingetragenen' : 'des im Handelsregister nicht eingetragenen'} Einzelunternehmens ${s.bezeichnung.trim() || '________'}`
        : (s.bezeichnung.trim() || '________'),
    })),
    verrListe: verr.map((v) => ({
      glaeubiger: v.glaeubigerName.trim(),
      forderungFmt: fmtCHF(v.forderungChf),
      aktien: v.aktienAnzahl,
      begruendungTxt: v.begruendungTxt.trim() || '________',
    })),
    vorteilListe: vorteile.map((v) => ({
      beguenstigter: v.beguenstigter.trim(),
      inhalt: v.inhalt.trim() || '________',
      wertFmt: fmtCHF(v.wertChf),
      begruendungTxt: v.begruendungTxt.trim() || '________',
    })),
    // D1: Einpersonen-Gründung → Urkunde im Singular (Erläuterung ZH-Vorlage
    // 3.1/3.5: «Falls nur eine einzige natürliche Person gründet …, ist die
    // Gründungsurkunde in der Einzahl abzufassen»).
    einGruender: gruenderAnzahl === 1,
    einVr: vrAnzahl === 1,
    istLang: a.statutenUmfang === 'lang',
    zuHandenZeile: gruenderAnzahl === 1 ? 'z. H. der Gründerin bzw. des Gründers' : 'z. H. der Gründerinnen und Gründer',
    // D13: Sitzungs-Uhrzeiten (Mindestelemente; leer → Blanko-Linie zum
    // handschriftlichen Ergänzen, wie beim Datum).
    sitzungBeginnZeile: a.sitzungBeginn.trim() ? `${a.sitzungBeginn.trim()} Uhr` : '________ Uhr',
    sitzungEndeZeile: a.sitzungEnde.trim() ? `${a.sitzungEnde.trim()} Uhr` : '________ Uhr',
    // Etappe 4.2/D9: Domizil-Ziffer der Urkunde nur, wenn weder die
    // Konstituierungs-Ziffer das Domizil trägt noch es weggelassen wird.
    domizilImDomizilArtikel: !a.konstituierungInUrkunde && !a.domizilNurAnmeldung,
    domizilInKonstituierung: a.konstituierungInUrkunde && !a.domizilNurAnmeldung,
    // D10: Nachtragsvollmacht nur, wenn eine Person benannt ist.
    hatNachtragsvollmacht: a.nachtragsbevollmaechtigter.trim().length > 0,
    nachtragsbevollmaechtigter: a.nachtragsbevollmaechtigter.trim(),
    gjBeginnTxt: a.gjBeginn.trim() || '________',
    gjEndeTxt: a.gjEnde.trim() || '________',
    akFmt: fmtCHF(a.aktienkapitalChf),
    nennwertFmt: fmtCHF(a.nennwertChf),
    // Etappe 3.2/D7: Ausgabebetrag (= Nennwert ohne Agio) und Einlagen-Total
    // der Volliberierung (Anzahl × Ausgabebetrag — mit Agio über dem Kapital).
    ausgabeFmt: fmtCHF(a.ausgabebetragChf.trim() === '' ? a.nennwertChf : a.ausgabebetragChf),
    einlagenTotalFmt: ausgabe > nennwert + 0.005 ? fmtCHF(String(anzahl * ausgabe)) : fmtCHF(a.aktienkapitalChf),
    hatAgio: ausgabe > nennwert + 0.005,
    einbezahltFmt: fmtCHF(String(eff.einbezahlt)),
    vollLiberiert: eff.vollLiberiert,
    // Stufe 2 P1d: Die «Auf dem Aktienkapital …»-Teilliberierungs-Bausteine
    // gelten der REINEN Bargründung; die gemischte Teilliberierung hat
    // eigene Bausteine (Bar-Teil teilliberiert, Sach-/Verrechnungsaktien
    // gelten als voll liberiert).
    teilGleich: !eff.vollLiberiert && !eff.individuell && a.einlageArt === 'bar',
    teilIndividuell: !eff.vollLiberiert && eff.individuell && a.einlageArt === 'bar',
    gemischtTeilBar: a.einlageArt === 'gemischt' && !eff.vollLiberiert,
    gruenderTeilListe: eff.zeilen,
    // Review-Befund M-2 (7.6.2026): Art. 626 Abs. 1 Ziff. 3 OR verlangt den
    // BETRAG der geleisteten Einlagen — bei Teilliberierung den Frankenbetrag
    // zusätzlich zum Prozentsatz ausweisen. Stufe 2 P1: Agio-Zusatz (das
    // Agio ist voll zu leisten) und gemischte Teilliberierung (Haus-
    // Fassungen, offengelegt).
    liberierungSatz: (() => {
      const wc = a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF';
      const agioZusatz = eff.hatAgio
        ? (a.einlageArt === 'gemischt'
          ? `; das Ausgabeagio ist vollständig geleistet (Bareinlage-Aktien in Geld, übrige durch die Sacheinlagen bzw. Verrechnungsforderungen gedeckt)`
          : `; das Ausgabeagio von ${wc} ${fmtCHF(String(eff.agioTotal))} ist vollständig geleistet`)
        : '';
      if (eff.vollLiberiert) return 'vollständig liberiert';
      if (a.einlageArt === 'gemischt') {
        return `im Umfang der geleisteten Einlagen von ${wc} ${fmtCHF(String(eff.einbezahlt))} liberiert ` +
          `(Bareinlage-Aktien zu ${a.liberierungProzent} % des Nennwerts; die Aktien aus Sacheinlage und ` +
          `Verrechnung gelten als voll liberiert)${agioZusatz}`;
      }
      if (eff.individuell) {
        // Etappe 3.3: Bei individuellen Graden gibt es keinen einheitlichen
        // Prozentsatz — Art. 626 Abs. 1 Ziff. 3 OR verlangt den BETRAG der
        // geleisteten Einlagen (Haus-Fassung, offengelegt).
        return `im Umfang der geleisteten Einlagen von ${wc} ${fmtCHF(String(eff.einbezahlt))} liberiert (je Aktie mindestens 20 %)${agioZusatz}`;
      }
      return `zu ${a.liberierungProzent} % liberiert (geleistete Einlagen: ${wc} ${fmtCHF(String(eff.einbezahlt))})${agioZusatz}`;
    })(),
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}den ${datum}`,
    gruenderListe: a.gruender.filter((g) => g.name.trim()).map((g) => ({
      name: g.name.trim(),
      angabenZeile: g.angaben.trim() ? `, ${g.angaben.trim()}` : '',
      anzahl: g.anzahl,
    })),
    vrListe: a.verwaltungsraete.filter((v) => v.name.trim()).map((v) => {
      const funktion = a.verwaltungsraete.filter((x) => x.name.trim()).length > 1 && v.praesident ? 'Präsident/in' : 'Mitglied';
      return {
        name: v.name.trim(),
        herkunft: v.herkunft.trim() || '________',
        wohnort: v.wohnort.trim() || '________',
        funktion,
        praesidentZeile: a.verwaltungsraete.filter((x) => x.name.trim()).length > 1 && v.praesident ? ', als Präsident/in' : '',
        zeichnung: VR_ZEICHNUNGS_LABEL[v.zeichnungsArt],
        // Etappe 4.1/D8: Wahl-Zusatz der ZH-Erläuterung zu Ziff. VI.
        wahlannahmeSatz: (v.annahmeInUrkunde ?? false) ? ', welche bzw. welcher hiermit die Annahme erklärt' : '',
        // Etappe 4.2/D9: Konstituierungs-Zeile (ZH Ziff. VII lit. a) —
        // «ohne Zeichnungsberechtigung» ohne das «mit» der Zeichnungs-Arten.
        konstituierungZeile: v.zeichnungsArt === 'ohne'
          ? `${v.name.trim()} ist ${funktion} ohne Zeichnungsberechtigung.`
          : `${v.name.trim()} ist ${funktion} mit ${VR_ZEICHNUNGS_LABEL[v.zeichnungsArt]}.`,
      };
    }),
    vertretungsListe: a.weitereVertretungen.filter((v) => v.name.trim()).map((v) => ({
      name: v.name.trim(),
      funktion: v.funktion.trim() || '________',
      zeichnung: VERTRETUNGS_ZEICHNUNGS_LABEL[v.zeichnungsArt],
    })),
    hatWeitereVertretungen: a.weitereVertretungen.filter((v) => v.name.trim()).length > 0,
    // Stufe 2 P4: Unterschriftenbogen — alle zeichnungsberechtigten
    // Personen (VR ohne «ohne Zeichnungsberechtigung» + weitere
    // Zeichnungsberechtigte), je mit Funktion und Zeichnungsart.
    unterschriftenListe: [
      ...a.verwaltungsraete.filter((v) => v.name.trim() && v.zeichnungsArt !== 'ohne').map((v) => ({
        name: v.name.trim(),
        funktion: a.verwaltungsraete.filter((x) => x.name.trim()).length > 1 && v.praesident
          ? 'Präsident/in des Verwaltungsrates' : 'Mitglied des Verwaltungsrates',
        zeichnung: VR_ZEICHNUNGS_LABEL[v.zeichnungsArt],
      })),
      ...a.weitereVertretungen.filter((v) => v.name.trim()).map((v) => ({
        name: v.name.trim(),
        funktion: v.funktion.trim() || '________',
        zeichnung: VERTRETUNGS_ZEICHNUNGS_LABEL[v.zeichnungsArt],
      })),
    ],
    praesidentName: praesident,
    protokollName: a.protokollfuehrerName.trim() || praesident,
  };
}

import {
  STATUTEN_SCHEMA, ERRICHTUNGSAKT_SCHEMA, WAHLANNAHME_SCHEMA, WAHLANNAHME_RS_SCHEMA,
  DOMIZILANNAHME_SCHEMA, VR_PROTOKOLL_SCHEMA, ANMELDUNG_SCHEMA, UNTERSCHRIFTENBOGEN_SCHEMA,
  SACHEINLAGEVERTRAG_SCHEMA, SACHEINLAGEVERTRAG_ENTWURF_SCHEMA, LEXKOLLER_SCHEMA,
  NACHTRAG_SCHEMA, GRUENDUNGSBERICHT_SCHEMA,
} from './gruendungAgSchemas';

// Errichtungsakt: römische Ziffern werden NACH der Weichen-Auswertung vergeben
// (lückenlos auch ohne optionale Abschnitte wie die Nachtragsvollmacht, D10);
// die Urkundsperson-Bestätigung bleibt unnummeriert (ZH-Vorlagen-Anatomie).
const ROEMISCH = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;
const UNNUMMERIERT = new Set(['Bestätigung der Urkundsperson']);

function nummeriereUrkundenZiffern(erg: AssembleErgebnis): AssembleErgebnis {
  let n = 0;
  for (const abs of erg.dokument.absaetze) {
    if (abs.ueberschrift && !UNNUMMERIERT.has(abs.ueberschrift)) {
      abs.ueberschrift = `${ROEMISCH[n] ?? String(n + 1)}. ${abs.ueberschrift}`;
      n += 1;
    }
  }
  return erg;
}

// ── Dokumentmappe ───────────────────────────────────────────────────────────

export type AgDokument = {
  id: string;
  titel: string;
  dateiName: string;
  ausgeloestDurch?: string;
  ergebnis: AssembleErgebnis;
};

export function agDokumentmappe(a: AgDokAntworten): { dokumente: AgDokument[]; gates: AgDokGates } {
  const gates = pruefeAgDokGates(a);
  if (gates.blocker.length > 0) return { dokumente: [], gates };

  // §5: Dokument-Auslöser aus der Checklisten-Engine (AG: Wahlannahme VR und
  // Konstituierungsprotokoll sind PFLICHT-Belege, Art. 43 Abs. 1 lit. c/e).
  const unterlagen = agGruendungsunterlagen(a).unterlagen;
  const hat = (id: string) => unterlagen.some((u) => u.id === id);

  const basis = basisAntworten(a);

  const belegeListe: { titel: string }[] = [{ titel: 'die Statuten' }];
  if (hat('bankbescheinigung')) {
    belegeListe.push({ titel: 'die Bestätigung über die Hinterlegung der Einlagen in Geld' });
  }
  // Etappe 2: Belege der qualifizierten Gründung (Art. 631 Abs. 2 OR).
  if (hat('sacheinlagevertrag')) {
    belegeListe.push({ titel: 'die Sacheinlageverträge mit den Inventarlisten bzw. Übernahmebilanzen' });
  }
  if (hat('gruendungsbericht')) {
    belegeListe.push({ titel: 'der Gründungsbericht (Art. 635 OR)' });
  }
  if (hat('pruefungsbestaetigung')) {
    belegeListe.push({ titel: 'die Prüfungsbestätigung des zugelassenen Revisors (Art. 635a OR)' });
  }

  const KEINE_BEILAGE = new Set(['statutenentwurf', 'kapitaleinlagekonto', 'hr-anmeldung', 'freigabe-einlagen', 'aktienbuch', 'wb-verzeichnis']);
  // Etappe 4.1/4.2: Belege, die durch die Urkunden-Optionen entbehrlich
  // werden, ehrlich aus der Anmeldungs-Beilagenliste nehmen (Art. 43 Abs. 1
  // lit. c/e HRegV: «sofern nicht aus der Urkunde ersichtlich»).
  const alleAnnahmenInUrkunde = a.verwaltungsraete.filter((v) => v.name.trim()).length > 0
    && a.verwaltungsraete.filter((v) => v.name.trim()).every((v) => v.annahmeInUrkunde ?? false);
  if (alleAnnahmenInUrkunde) KEINE_BEILAGE.add('wahlannahme-vr');
  if (a.konstituierungInUrkunde) KEINE_BEILAGE.add('vr-konstituierung');
  const belegeAnmeldung = unterlagen
    .filter((u) => !KEINE_BEILAGE.has(u.id))
    .map((u) => ({ titel: u.titel, norm: u.norm }));

  const dokumente: AgDokument[] = [];

  dokumente.push({
    id: 'statuten',
    titel: 'Statuten (Entwurf)',
    dateiName: 'ag-statuten-entwurf',
    ergebnis: nummeriereUeberschriftenAlsArtikel(assemble(STATUTEN_SCHEMA, basis)),
  });

  dokumente.push({
    id: 'errichtungsakt',
    titel: 'Errichtungsakt (Entwurf für die Urkundsperson)',
    dateiName: 'ag-errichtungsakt-entwurf',
    ergebnis: nummeriereUrkundenZiffern(assemble(ERRICHTUNGSAKT_SCHEMA, { ...basis, belegeListe })),
  });

  // ── Etappe 2: Sacheinlageverträge + Gründungsbericht ──────────────────────
  if (hat('sacheinlagevertrag')) {
    type SachItem = Record<string, string | boolean>;
    const sachItems = (basis as { sachListe: SachItem[] }).sachListe;
    const mitSachWeiche = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
    const sachen = mitSachWeiche ? a.sacheinlagen.filter((s) => s.einlegerName.trim() || s.bezeichnung.trim()) : [];
    sachen.forEach((s, i) => {
      const item = sachItems[i];
      dokumente.push({
        id: `sacheinlagevertrag-${i}`,
        titel: `Sacheinlagevertrag – ${String(item.einleger)}${s.grundstueck ? ' (Entwurf, Grundstück)' : ''}`,
        dateiName: s.grundstueck ? 'ag-sacheinlagevertrag-entwurf' : 'ag-sacheinlagevertrag',
        ausgeloestDurch: s.grundstueck
          ? 'Sacheinlage mit Grundstück (öffentliche Beurkundung, Art. 634 Abs. 2 OR / Art. 657 ZGB)'
          : 'Sacheinlage (Art. 634 OR)',
        ergebnis: assemble(
          s.grundstueck ? SACHEINLAGEVERTRAG_ENTWURF_SCHEMA : SACHEINLAGEVERTRAG_SCHEMA,
          {
            ...basis,
            ...item,
            einlegerName: String(item.einleger),
            rueckwirkungFmt: String(item.rueckwirkungFmt || '________'),
          },
        ),
      });
    });
  }

  if (hat('gruendungsbericht')) {
    dokumente.push({
      id: 'gruendungsbericht',
      titel: 'Gründungsbericht',
      dateiName: 'ag-gruendungsbericht',
      ausgeloestDurch: 'Qualifizierte Gründung (Art. 635 OR)',
      ergebnis: assemble(GRUENDUNGSBERICHT_SCHEMA, basis),
    });
  }

  const anmeldeAdresseZeile = a.eigeneBueros
    ? (a.rechtsdomizilAdresse.trim() || '________')
    : `c/o ${a.domizilhalterName.trim() || '________'}, ${a.domizilhalterAdresse.trim() || '________'}`;

  // Etappe 4.4/D11: Gründungs-Nachtrag auf ausdrücklichen Wunsch.
  if (a.nachtragAktiv) {
    dokumente.push({
      id: 'nachtrag',
      titel: 'Nachtrag zur Gründungsurkunde (Entwurf)',
      dateiName: 'ag-gruendungs-nachtrag-entwurf',
      ausgeloestDurch: 'Beanstandung durch die Handelsregisterbehörde (ZH-Vorlage 3.4)',
      ergebnis: assemble(NACHTRAG_SCHEMA, basis),
    });
  }

  // Etappe 4.3/D16: Lex-Koller-Erklärung (nur bei Immobilien-Haupttätigkeit).
  if (hat('lex-koller')) {
    dokumente.push({
      id: 'lex-koller',
      titel: 'Lex-Koller-Erklärung',
      dateiName: 'ag-lex-koller',
      ausgeloestDurch: 'Immobilien-Haupttätigkeit (ZH-Checkliste; Art. 18 BewG)',
      ergebnis: assemble(LEXKOLLER_SCHEMA, { ...basis, anmeldeAdresseZeile }),
    });
  }

  if (hat('wahlannahme-vr')) {
    // Review-Befund M-1 (7.6.2026): Index-ID gegen Namens-Kollisionen;
    // zudem NIEDRIG-1: Auslöser-Etikett wie bei der GmbH führen.
    // Etappe 4.1/D8: keine separate Erklärung, wenn die Annahme in der
    // Urkunde erklärt wird.
    a.verwaltungsraete.filter((x) => x.name.trim() && !(x.annahmeInUrkunde ?? false)).forEach((v, i) => {
      dokumente.push({
        id: `wahlannahme-${i}`,
        titel: `Wahlannahmeerklärung – ${v.name.trim()}`,
        dateiName: 'ag-wahlannahme',
        ausgeloestDurch: 'Pflichtbeleg (Art. 43 Abs. 1 lit. c HRegV)',
        ergebnis: assemble(WAHLANNAHME_SCHEMA, {
          ...basis,
          personName: v.name.trim(),
          personAdresse: v.adresse.trim() || '________',
        }),
      });
    });
  }

  if (hat('wahlannahme-rs')) {
    dokumente.push({
      id: 'wahlannahme-rs',
      titel: 'Wahlannahmeerklärung – Revisionsstelle',
      dateiName: 'ag-wahlannahme-rs',
      ausgeloestDurch: 'Revisionsstelle bestellt (Art. 43 Abs. 1 lit. d HRegV)',
      ergebnis: assemble(WAHLANNAHME_RS_SCHEMA, basis),
    });
  }

  // Etappe 4.2/D9: entfällt, wenn die Konstituierung in der Urkunde erfolgt.
  if (hat('vr-konstituierung') && !a.konstituierungInUrkunde) {
    dokumente.push({
      id: 'vr-protokoll',
      titel: 'VR-Protokoll (Konstituierung)',
      dateiName: 'ag-vr-protokoll',
      ergebnis: assemble(VR_PROTOKOLL_SCHEMA, { ...basis, datumZeile: a.datum ? fmtDatum(a.datum) : '________' }),
    });
  }

  if (hat('domizilannahme')) {
    dokumente.push({
      id: 'domizilannahme',
      titel: 'Domizilannahmeerklärung',
      dateiName: 'ag-domizilannahme',
      ausgeloestDurch: 'c/o-Adresse (kein eigenes Büro)',
      ergebnis: assemble(DOMIZILANNAHME_SCHEMA, basis),
    });
  }

  // Stufe 2 P4: Unterschriftenbogen — jede Gründung hat mindestens eine
  // zeichnungsberechtigte Person (Gate Art. 718 Abs. 3 OR).
  dokumente.push({
    id: 'unterschriftenbogen',
    titel: 'Unterschriftenblatt',
    dateiName: 'ag-unterschriftenblatt',
    ausgeloestDurch: 'Unterschriftshinterlegung (Art. 21 HRegV)',
    ergebnis: assemble(UNTERSCHRIFTENBOGEN_SCHEMA, basis),
  });

  dokumente.push({
    id: 'hr-anmeldung',
    titel: 'Handelsregister-Anmeldung',
    dateiName: 'ag-hr-anmeldung',
    ergebnis: assemble(ANMELDUNG_SCHEMA, {
      ...basis,
      belegeAnmeldung,
      anmeldeAdresseZeile,
    }),
  });

  return { dokumente, gates };
}

// ── Abnahme-Registry (Perfektion Punkt 15) ──────────────────────────────────

/** ALLE AG-Schemas in Mappen-Reihenfolge — Quelle für Davids Wort-für-Wort-
 *  Abnahme: `scripts/abnahme-ag.ts` generiert daraus ABNAHME-AG-BAUSTEINE.md
 *  (je Baustein id · Wortlaut · Norm · Begründung · Hinweis · Bedingung).
 *  Abgenommene Bausteine erhalten später `verified: true` (§7: nie
 *  automatisch setzen). */
export const AG_ALLE_SCHEMAS: VorlageSchema[] = [
  STATUTEN_SCHEMA,
  ERRICHTUNGSAKT_SCHEMA,
  SACHEINLAGEVERTRAG_SCHEMA,
  SACHEINLAGEVERTRAG_ENTWURF_SCHEMA,
  GRUENDUNGSBERICHT_SCHEMA,
  NACHTRAG_SCHEMA,
  LEXKOLLER_SCHEMA,
  WAHLANNAHME_SCHEMA,
  WAHLANNAHME_RS_SCHEMA,
  VR_PROTOKOLL_SCHEMA,
  DOMIZILANNAHME_SCHEMA,
  UNTERSCHRIFTENBOGEN_SCHEMA,
  ANMELDUNG_SCHEMA,
];
