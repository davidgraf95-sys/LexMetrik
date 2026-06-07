import type { VorlageSchema, Antworten, AssembleErgebnis } from './engine';
import { assemble, nummeriereUeberschriftenAlsArtikel } from './engine';
import { fmtCHF, fmtDatum, ganzePositive, zahl } from './datum';
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

// ── Liberierung (Etappe 3.3/D6 · Stufe 2 Perfektion P1): globaler Default +
// individuelle Grade + Agio + qualifizierte Aktien. EINE Quelle für Gates
// und Texte (§5). Im Gleich-Fall rechnet sie wie der bisherige globale Pfad
// (Kapital × Prozent — byte-identische Ausgabe). Stufe-2-Regeln (am OR-Cache
// 1.1.2026 verifiziert):
//  · Agio (Ausgabebetrag über Nennwert, Art. 624 Abs. 1 OR) ist bei der
//    Ausgabe VOLL zu leisten — teilliberierbar ist nur der Nennwert-Teil
//    (Art. 632 Abs. 1 OR bezieht die 20 % auf den Nennwert jeder Aktie).
//  · Aktien aus Sacheinlage/Verrechnung GELTEN als voll liberiert (ZH-
//    Vertragsvorlage «als voll liberiert geltende Aktien»); teilliberierbar
//    ist nur der Bar-Anteil — mit GLOBALEM Grad (individuelle Grade bei
//    gemischter Gründung bleiben gesperrt, Zuordnung Bar-/Sach-Aktien je
//    Gründer wäre nicht eindeutig).
//  · Geleistete Einlagen gesamthaft (Art. 632 Abs. 2 OR, FW-Gegenwert) =
//    geleisteter Nennwert-Teil + volles Agio (Beträge in Kapitalwährung).

function effektiveLiberierung(a: AgDokAntworten): {
  individuell: boolean;
  vollLiberiert: boolean;
  /** Geleisteter NENNWERT-Teil (Kapitalwährung) — Basis der «(… % des
   *  Nennwerts)»-Texte; das Agio wird separat ausgewiesen. */
  einbezahlt: number;
  /** Geleistete Einlagen GESAMT = Nennwert-Teil + volles Agio (Basis der
   *  Gates Art. 632 Abs. 2 OR und des FW-Kurs-Satzes). */
  einbezahltGesamt: number;
  agioJeAktie: number;
  agioTotal: number;
  hatAgio: boolean;
  /** Aktien aus Sacheinlage/Verrechnung (gelten als voll liberiert). */
  qAktien: number;
  barAktien: number;
  /** Geleisteter Nennwert-Teil NUR der Bar-Aktien (gemischte Gründung). */
  barEinbezahlt: number;
  /** Individuelle Grade mit mindestens einem Teilgrad (< 100 %) — bei
   *  qualifizierter Gründung gesperrt (Gate), da die Zuordnung Bar-/Sach-
   *  Aktien je Gründer nicht eindeutig wäre. */
  individuellTeilweise: boolean;
  zeilen: { name: string; anzahl: string; prozentTxt: string }[];
} {
  const nennwert = zahl(a.nennwertChf) ?? 0;
  const anzahl = ganzePositive(a.anzahlAktien) ?? 0;
  const global = zahl(a.liberierungProzent) ?? 100;
  const ausgabe = a.ausgabebetragChf.trim() === '' ? nennwert : (zahl(a.ausgabebetragChf) ?? nennwert);
  const agioJeAktie = Math.max(0, ausgabe - nennwert);
  const hatAgio = agioJeAktie > 0.005;
  // Qualifizierte Aktien wie in den Gates gefiltert (§5).
  const mitSach = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
  const mitVerr = a.einlageArt === 'verrechnung' || a.einlageArt === 'gemischt';
  const qAktien = (mitSach ? a.sacheinlagen.filter((s) => s.einlegerName.trim() || s.bezeichnung.trim()) : [])
    .reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0)
    + (mitVerr ? a.verrechnungen.filter((v) => v.glaeubigerName.trim()) : [])
      .reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0);
  const barAktien = Math.max(0, anzahl - qAktien);

  const gr = a.gruender.filter((g) => g.name.trim());
  const individuell = gr.some((g) => (g.liberierung ?? '').trim() !== '');
  let einbezahlt = 0;
  let voll = true;
  const zeilen = gr.map((g) => {
    const p = (g.liberierung ?? '').trim() === '' ? global : (zahl(g.liberierung) ?? global);
    if (p < 100) voll = false;
    einbezahlt += (ganzePositive(g.anzahl) ?? 0) * nennwert * (p / 100);
    return { name: g.name.trim(), anzahl: g.anzahl, prozentTxt: (g.liberierung ?? '').trim() || a.liberierungProzent };
  });
  if (!individuell) {
    einbezahlt = (zahl(a.aktienkapitalChf) ?? 0) * (global / 100);
    voll = global >= 100;
  }
  const individuellTeilweise = individuell && !voll;
  let barEinbezahlt = einbezahlt;
  if (qAktien > 0) {
    // Qualifizierte Gründung: Sach-/Verrechnungsaktien voll; der globale
    // Grad gilt nur für den Bar-Anteil (individuelle Grade: Gate sperrt).
    barEinbezahlt = barAktien * nennwert * (Math.min(global, 100) / 100);
    einbezahlt = qAktien * nennwert + barEinbezahlt;
    voll = barAktien === 0 || global >= 100;
  }
  const agioTotal = anzahl * agioJeAktie;
  return {
    individuell, vollLiberiert: voll, einbezahlt,
    einbezahltGesamt: einbezahlt + agioTotal,
    agioJeAktie, agioTotal, hatAgio, qAktien, barAktien, barEinbezahlt,
    individuellTeilweise, zeilen,
  };
}

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
      const ende = new Date(a.kbEndeDatum);
      const max = new Date(a.datum);
      const tagVorher = max.getDate();
      max.setFullYear(max.getFullYear() + 5);
      // Bug-Check §9 MITTEL-2 (7.6.2026): setFullYear rollt den 29.2. eines
      // Schaltjahrs auf den 1.3. — auf den letzten Tag des Vormonats
      // (28.2.) klemmen, sonst ist die 5-Jahres-Grenze einen Tag zu lang.
      if (max.getDate() !== tagVorher) max.setDate(0);
      if (ende.getTime() > max.getTime()) {
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

// ── 1 · STATUTEN (ENTWURF) ──────────────────────────────────────────────────

const STATUTEN_SCHEMA: VorlageSchema = {
  id: 'ag-statuten',
  version: '1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026)',
  titel: 'Statuten',
  format: 'vertrag',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung der Gründung: ' +
    'Die Statuten der AG werden von der Urkundsperson geprüft und beglaubigt (Art. 22 Abs. 4 HRegV); ' +
    'massgeblich ist die beurkundete Fassung. Wortlaute nach den amtlichen Mustern ZH/SG/GL, ' +
    'verifiziert am OR-Stand 1.1.2026.',
  bausteine: [
    {
      id: 'AS00_ingress',
      text: 'der {{firma}} mit Sitz in {{sitz}}',
      begruendung: 'Identifikations-Ingress unter dem Dokumenttitel (Usanz aller amtlichen Muster).',
    },
    {
      id: 'AS01_firma_sitz',
      ueberschrift: 'Firma und Sitz',
      text: 'Unter der Firma {{firma}} besteht mit Sitz in {{sitz}} auf unbestimmte Dauer eine Aktiengesellschaft gemäss Art. 620 ff. OR.',
      norm: 'Art. 626 Abs. 1 Ziff. 1 OR',
      begruendung: 'Pflichtinhalt Firma/Sitz (Wortlaut ZH/SG/GL wortgleich).',
    },
    {
      id: 'AS02_zweck',
      ueberschrift: 'Zweck',
      text: 'Die Gesellschaft bezweckt {{zweck}}.',
      norm: 'Art. 626 Abs. 1 Ziff. 2 OR',
      begruendung: 'Pflichtinhalt Zweck.',
    },
    {
      id: 'AS02b_zweck_erweiterung',
      text: 'Die Gesellschaft kann Zweigniederlassungen errichten, sich an anderen Unternehmen beteiligen, Grundstücke erwerben, halten und veräussern, Finanzierungen für eigene oder fremde Rechnung vornehmen sowie Sicherheiten für Verbindlichkeiten verbundener Gesellschaften leisten.',
      includeIf: { feld: 'zweckErweiterung', eq: true },
      norm: 'Art. 626 Abs. 1 Ziff. 2 OR',
      begruendung: 'Aufgenommen, weil die übliche Zweck-Erweiterungsklausel gewählt wurde (ZH-/GL-Muster-Wortlaut).',
    },
    {
      id: 'AS03_kapital',
      ueberschrift: 'Aktienkapital und Aktien',
      text:
        'Das Aktienkapital beträgt {{waehrungCode}} {{akFmt}} und ist eingeteilt in {{anzahlAktien}} {{aktienArt}} ' +
        'zu {{waehrungCode}} {{nennwertFmt}}. Die Aktien sind {{liberierungSatz}}.',
      norm: 'Art. 626 Abs. 1 Ziff. 3 und 4 OR',
      begruendung: 'Pflichtinhalt: Höhe des Kapitals, geleistete Einlagen (Liberierungsgrad) sowie Anzahl, Nennwert und Art der Aktien (rev. 2023; Wortlaut ZH/SG/GL).',
    },
    {
      id: 'AS03b_inhaber_bucheffekten',
      text:
        'Die Aktien lauten auf den Inhaber. Sie sind als Bucheffekten im Sinne des Bucheffektengesetzes ' +
        'vom 3. Oktober 2008 (BEG) ausgestaltet und bei {{verwahrungsstelleZeile}}, einer von der ' +
        'Gesellschaft bezeichneten Verwahrungsstelle in der Schweiz, hinterlegt.',
      includeIf: { feld: 'inhaberBucheffekten', eq: true },
      norm: 'Art. 622 Abs. 1bis OR',
      begruendung: 'Stufe 2 P2 (Haus-Fassung am Normtext, offengelegt): Inhaberaktien sind nur zulässig, wenn Beteiligungspapiere kotiert sind ODER die Inhaberaktien als Bucheffekten ausgestaltet und bei einer bezeichneten Verwahrungsstelle in der Schweiz hinterlegt bzw. im Hauptregister eingetragen sind (Art. 622 Abs. 1bis OR am Cache verifiziert) — die Statuten erklären die gewählte Voraussetzung.',
      hinweis: 'Der Nachweis ist der Handelsregister-Anmeldung beizulegen (Art. 43 Abs. 1 lit. i HRegV; Checklisten-Eintrag «inhaberaktien-nachweis»). Die Variante «im Hauptregister eingetragen» deckt dieser Text nicht ab — bei Bedarf anpassen.',
    },
    {
      id: 'AS03b_inhaber_kotiert',
      text:
        'Die Aktien lauten auf den Inhaber. Die Gesellschaft hat Beteiligungspapiere an einer Börse kotiert.',
      includeIf: { feld: 'inhaberKotiertAktiv', eq: true },
      norm: 'Art. 622 Abs. 1bis OR',
      begruendung: 'Stufe 2 P2: Kotierungs-Variante der Zulässigkeits-Erklärung (Art. 622 Abs. 1bis OR); bei einer Neugründung praxisfern, aber gesetzlich vorgesehen.',
    },
    // ── Etappe 2: Pflichtklauseln der qualifizierten Gründung ───────────────
    // ── Stufe 2 P3: Kapitalband + bedingtes Kapital (Module der GV — bei
    // der Gründung von den Gründern in den Statuten festgelegt) ──
    {
      id: 'AS03c_kapitalband_beide',
      ueberschrift: 'Kapitalband',
      text:
        'Der Verwaltungsrat ist ermächtigt, das Aktienkapital bis zum {{kbEndeFmt}} innerhalb des ' +
        'Kapitalbands mit einer unteren Grenze von {{waehrungCode}} {{kbUntergrenzeFmt}} und einer oberen ' +
        'Grenze von {{waehrungCode}} {{kbObergrenzeFmt}} zu erhöhen oder herabzusetzen. Eine Erhöhung ' +
        'erfolgt durch Ausgabe von höchstens {{kbMaxNeuTxt}} neuen, vollständig zu liberierenden ' +
        '{{aktienArt}} zu je {{waehrungCode}} {{nennwertFmt}}; eine Herabsetzung erfolgt durch Vernichtung ' +
        'von höchstens {{kbMaxWegTxt}} {{aktienArt}} oder durch Herabsetzung des Nennwerts. Das ' +
        'Bezugsrecht der Aktionäre ist weder eingeschränkt noch aufgehoben. Die Ermächtigung ist an ' +
        'keine weiteren Einschränkungen, Auflagen oder Bedingungen geknüpft. Nach Ablauf der ' +
        'Ermächtigung streicht der Verwaltungsrat die Bestimmungen über das Kapitalband aus den Statuten.',
      includeIf: { feld: 'kapitalbandBeide', eq: true },
      norm: 'Art. 653s OR',
      begruendung: 'Stufe 2 P3 (Haus-Fassung am 653t-Katalog, offengelegt — die amtlichen Gründungs-Muster enthalten kein Kapitalband-Modul): Ziff. 1 Grenzen, Ziff. 2 Ende der Ermächtigung, Ziff. 3 «keine weiteren Einschränkungen», Ziff. 4 Anzahl/Nennwert/Art, Ziff. 6/7 ohne Beschränkungen, Streichungspflicht nach Ablauf (Art. 653t Abs. 2 OR). Grenzen ±½ und Dauer ≤ 5 Jahre erzwingen die Gates (Art. 653s Abs. 1 und 2 OR, am Cache verifiziert).',
      hinweis: 'Die Herabsetzungs-Ermächtigung setzt voraus, dass die Gesellschaft NICHT auf die eingeschränkte Revision verzichtet hat (Art. 653s Abs. 4 OR) — bei Opting-out sperrt das Gate. Vorrechte einzelner Kategorien, besondere Vorteile und Bezugsrechts-Beschränkungen innerhalb des Bands (Art. 653t Abs. 1 Ziff. 5/7/8/9/10 OR) deckt diese Klausel nicht ab.',
    },
    {
      id: 'AS03c_kapitalband_erhoehen',
      ueberschrift: 'Kapitalband',
      text:
        'Der Verwaltungsrat ist ermächtigt, das Aktienkapital bis zum {{kbEndeFmt}} innerhalb des ' +
        'Kapitalbands mit einer unteren Grenze von {{waehrungCode}} {{kbUntergrenzeFmt}} (entspricht dem ' +
        'Aktienkapital) und einer oberen Grenze von {{waehrungCode}} {{kbObergrenzeFmt}} zu erhöhen; eine ' +
        'Herabsetzung des Aktienkapitals innerhalb des Kapitalbands ist ausgeschlossen. Die Erhöhung ' +
        'erfolgt durch Ausgabe von höchstens {{kbMaxNeuTxt}} neuen, vollständig zu liberierenden ' +
        '{{aktienArt}} zu je {{waehrungCode}} {{nennwertFmt}}. Das Bezugsrecht der Aktionäre ist weder ' +
        'eingeschränkt noch aufgehoben. Die Ermächtigung ist an keine weiteren Einschränkungen, Auflagen ' +
        'oder Bedingungen geknüpft. Nach Ablauf der Ermächtigung streicht der Verwaltungsrat die ' +
        'Bestimmungen über das Kapitalband aus den Statuten.',
      includeIf: { feld: 'kapitalbandErhoehen', eq: true },
      norm: 'Art. 653s OR',
      begruendung: 'Stufe 2 P3: Nur-Erhöhungs-Variante (Art. 653s Abs. 3 OR: «Sie können insbesondere vorsehen, dass der Verwaltungsrat das Aktienkapital nur erhöhen … kann») — die einzige bei Opting-out zulässige Variante (Art. 653s Abs. 4 OR). Untergrenze = eingetragenes Aktienkapital (die Gates erzwingen das).',
    },
    {
      id: 'AS03d_bedingtes_kapital',
      ueberschrift: 'Bedingtes Kapital',
      text:
        'Das Aktienkapital erhöht sich um höchstens {{waehrungCode}} {{bkBetragFmt}} durch Ausgabe von ' +
        'höchstens {{bkAnzahlTxt}} vollständig zu liberierenden {{aktienArt}} zu je {{waehrungCode}} ' +
        '{{nennwertFmt}}, soweit Wandel- oder Optionsrechte ausgeübt werden, die {{bkKreisTxt}} ' +
        'eingeräumt werden (bedingtes Kapital). Das Bezugsrecht der bisherigen Aktionäre ist ' +
        'ausgeschlossen, soweit die Wandel- oder Optionsrechte nicht ihnen zugeteilt werden. Die ' +
        'Ausübung der Wandel- oder Optionsrechte und der Verzicht auf diese Rechte erfolgen schriftlich.',
      includeIf: { feld: 'hatBedingtesKapital', eq: true },
      norm: 'Art. 653b OR',
      begruendung: 'Stufe 2 P3 (Haus-Fassung am 653b-Katalog, offengelegt): Ziff. 1 Nennbetrag, Ziff. 2 Anzahl/Nennwert/Art, Ziff. 3 Kreis der Berechtigten, Ziff. 4 Bezugsrechts-Folge, Ziff. 7 Form der Ausübung/des Verzichts (Haus-Default: schriftlich). Erhöhung «ohne Weiteres» bei Ausübung (Art. 653 Abs. 2 OR); Einlage mindestens zum Nennwert (Art. 653a Abs. 2 OR); Höchstbetrag ½ des eingetragenen Kapitals erzwingt das Gate (Art. 653a Abs. 1 OR, alle am Cache verifiziert).',
      hinweis: 'Werden Anleihens- oder ähnliche Obligationen mit Wandel-/Optionsrechten nicht den Aktionären vorweg angeboten, verlangen die Statuten ZUSÄTZLICHE Angaben (Art. 653b Abs. 2 OR) — nicht abgebildet. Vor dem Handelsregister-Eintrag eingeräumte Wandel-/Optionsrechte sind nichtig (Art. 653b Abs. 3 OR). Vorrechte einzelner Kategorien und Übertragungsbeschränkungen neuer Namenaktien (Ziff. 5/6) deckt die Klausel nicht ab.',
    },
    {
      id: 'AS06_sacheinlagen',
      ueberschrift: 'Sacheinlagen',
      text:
        'Die Gesellschaft übernimmt bei der Gründung von {{item.einleger}} als Sacheinlage: ' +
        '{{item.objektLabel}} ({{item.belegSatz}}), bewertet mit {{waehrungCode}} {{item.wertFmt}}. Dafür werden ' +
        '{{item.aktien}} {{aktienArt}} zu {{waehrungCode}} {{nennwertFmt}}{{ausgabeKlammerSatz}} ausgegeben{{item.gutschriftKlauselSatz}}.',
      wiederholeUeber: 'sachListe',
      includeIf: { feld: 'hatSacheinlagen', eq: true },
      norm: 'Art. 634 Abs. 4 OR',
      begruendung: 'Pflichtinhalt bei Sacheinlage: Gegenstand, Bewertung, Name des Einlegers, ausgegebene Aktien und allfällige weitere Gegenleistungen (Art. 634 Abs. 4 OR; Elemente-Katalog am Cache verifiziert, Dossier ag-qualifizierte-gruendung.md Teil 1). Haus-Formulierung — die amtlichen Muster enthalten keinen Standard-Klauseltext. Stufe 2: Beträge in der Kapitalwährung (Art. 621 Abs. 2 OR); bei Agio wird der Ausgabebetrag offengelegt (Bewertung deckt Aktien × Ausgabebetrag + Gutschrift, Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634 Abs. 4 Satz 2 OR — Nachfolgeregel des aufgehobenen Art. 628 aOR).',
    },
    {
      id: 'AS07_verrechnung',
      ueberschrift: 'Verrechnungsliberierung',
      text:
        'Bei der Gründung werden {{item.aktien}} {{aktienArt}} zu {{waehrungCode}} {{nennwertFmt}}{{ausgabeKlammerSatz}} durch Verrechnung ' +
        'mit einer Forderung von {{item.glaeubiger}} im Betrag von {{waehrungCode}} {{item.forderungFmt}} liberiert.',
      wiederholeUeber: 'verrListe',
      includeIf: { feld: 'hatVerrechnungen', eq: true },
      norm: 'Art. 634a Abs. 3 OR',
      begruendung: 'Pflichtinhalt bei Verrechnungsliberierung: Betrag der Forderung, Name des Aktionärs, zukommende Aktien (Art. 634a Abs. 3 OR am Cache verifiziert). Eigenständige qualifizierte Liberierungsart — KEINE Sacheinlage; Werthaltigkeit der Forderung ist keine Voraussetzung (Art. 634a Abs. 2 OR). Stufe 2: Forderungsbetrag in der Kapitalwährung; bei Agio deckt die Forderung Aktien × Ausgabebetrag (Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634a Abs. 3 Satz 2 OR).',
    },
    {
      id: 'AS08_vorteile',
      ueberschrift: 'Besondere Vorteile',
      text:
        'Bei der Gründung wird {{item.beguenstigter}} folgender besonderer Vorteil gewährt: ' +
        '{{item.inhalt}} (Wert: {{waehrungCode}} {{item.wertFmt}}).',
      wiederholeUeber: 'vorteilListe',
      includeIf: { feld: 'hatVorteile', eq: true },
      norm: 'Art. 636 OR',
      begruendung: 'Pflichtinhalt bei besonderen Vorteilen: begünstigte Personen mit Namen sowie Inhalt und Wert des gewährten Vorteils (Art. 636 OR am Cache verifiziert).',
    },
    // ── LANG-Stufe (Etappe 1/D18): amtliche ZH-Langvorlage, Block «Kapital» ──
    {
      id: 'ASL20_zertifikate',
      ueberschrift: 'Aktienzertifikate',
      text: 'Anstelle von einzelnen Aktien kann die Gesellschaft Zertifikate über mehrere Aktien ausstellen.',
      includeIf: { feld: 'istLang', eq: true },
      begruendung: 'ZH-Langvorlage verbatim; gesetzlich nicht besonders geregelt — zulässige Ausgestaltung der Aktien als Wertpapiere (vgl. Art. 622 Abs. 1 OR), darum ohne Norm-Chip.',
    },
    {
      id: 'ASL21_zerlegung',
      ueberschrift: 'Zerlegung und Zusammenlegung von Aktien',
      text:
        'Die Generalversammlung kann bei unverändert bleibendem Aktienkapital durch Statutenänderung Aktien in solche von kleinerem Nennwert zerlegen oder zu solchen von grösserem Nennwert zusammenlegen; die Zusammenlegung bedarf der Zustimmung aller betroffenen Aktionäre.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 623 OR',
      begruendung: 'ZH-Langvorlage; Haus-Präzisierung (offengelegt): ZH sagt «der Zustimmung des Aktionärs» — Art. 623 Abs. 2 OR verlangt bei nicht kotierten Aktien die Zustimmung ALLER betroffenen Aktionäre.',
    },
    {
      id: 'ASL22_aktienbuch',
      ueberschrift: 'Aktienbuch',
      text:
        'Der Verwaltungsrat führt über alle Namenaktien ein Aktienbuch, in welches die Eigentümer und Nutzniesser mit Namen und Adresse eingetragen werden.\n' +
        'Im Verhältnis zur Gesellschaft gilt als Aktionär oder als Nutzniesser, wer im Aktienbuch eingetragen ist.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 686 OR',
      begruendung: 'ZH-Langvorlage verbatim (Aktienbuch-Führung und Legitimationswirkung, Art. 686 Abs. 1 und 4 OR).',
    },
    {
      id: 'AS10_vinkulierung',
      ueberschrift: 'Übertragung der Aktien',
      text:
        'Die Übertragung der Namenaktien oder die Begründung einer Nutzniessung an Namenaktien bedarf der Genehmigung durch den Verwaltungsrat.\n' +
        'Der Verwaltungsrat kann das Gesuch um Zustimmung ablehnen, wenn er im Namen der Gesellschaft dem Veräusserer anbietet, die Aktien zum wirklichen Wert im Zeitpunkt des Gesuches zu übernehmen, oder wenn der Erwerber nicht ausdrücklich erklärt, dass er die Aktien im eigenen Namen und auf eigene Rechnung erworben hat.\n' +
        'Werden Aktien durch Erbgang, Erbteilung, eheliches Güterrecht oder Zwangsvollstreckung erworben, so kann die Gesellschaft das Gesuch um Zustimmung nur ablehnen, wenn sie dem Erwerber die Übernahme der Aktien zum wirklichen Wert anbietet.',
      includeIf: { feld: 'vinkulierung', eq: true },
      norm: 'Art. 685a und 685b OR',
      begruendung: 'Aufgenommen, weil die Vinkulierung gewählt wurde – Wortlaut der wortgleichen amtlichen Muster ZH/SG/GL (Escape-Klausel und Sonderregel besondere Erwerbsarten).',
    },
    // ── LANG-Stufe: Block «Generalversammlung» (ZH-Langvorlage) ─────────────
    {
      id: 'ASL30_gv_befugnisse',
      ueberschrift: 'Befugnisse der Generalversammlung',
      text:
        'Oberstes Organ der Gesellschaft ist die Generalversammlung der Aktionäre. Ihr stehen folgende unübertragbare Befugnisse zu:\n' +
        '– die Festsetzung und Änderung der Statuten;\n' +
        '– die Wahl der Mitglieder des Verwaltungsrates und der Revisionsstelle;\n' +
        '– die Genehmigung des Lageberichts und der Konzernrechnung;\n' +
        '– die Genehmigung der Jahresrechnung sowie die Beschlussfassung über die Verwendung des Bilanzgewinnes, insbesondere die Festsetzung der Dividende und der Tantieme;\n' +
        '– die Festsetzung der Zwischendividende und die Genehmigung des dafür erforderlichen Zwischenabschlusses;\n' +
        '– die Beschlussfassung über die Rückzahlung der gesetzlichen Kapitalreserve;\n' +
        '– die Entlastung der Mitglieder des Verwaltungsrates;\n' +
        '– die Beschlussfassung über die Gegenstände, die der Generalversammlung durch das Gesetz oder die Statuten vorbehalten sind.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 698 OR',
      begruendung: 'ZH-Langvorlage verbatim — Befugnis-Katalog nach revidiertem Recht (inkl. Zwischendividende und Rückzahlung der gesetzlichen Kapitalreserve, Art. 698 Abs. 2 OR).',
    },
    {
      id: 'ASL31_einberufung',
      ueberschrift: 'Einberufung und Traktandierung',
      text:
        'Die ordentliche Versammlung findet jährlich innerhalb von sechs Monaten nach Abschluss des Geschäftsjahres statt, ausserordentliche Versammlungen werden je nach Bedürfnis einberufen.\n' +
        'Der Verwaltungsrat teilt den Aktionären die Einberufung der Generalversammlung mindestens 20 Tage vor dem Versammlungstag mit. Die Einberufung erfolgt durch den Verwaltungsrat, nötigenfalls durch die Revisionsstelle. Das Einberufungsrecht steht auch den Liquidatoren und den Vertretern der Anleihensgläubiger zu.\n' +
        'Die Einberufung einer Generalversammlung kann auch von einem oder mehreren Aktionären, die zusammen über mindestens 10 Prozent des Aktienkapitals oder der Stimmen verfügen, verlangt werden. Sie müssen die Einberufung schriftlich verlangen. Die Verhandlungsgegenstände und Anträge müssen im Begehren enthalten sein.\n' +
        'In der Einberufung sind das Datum, der Beginn, die Art und der Ort der Generalversammlung, die Verhandlungsgegenstände, die Anträge des Verwaltungsrates, gegebenenfalls die Anträge der Aktionäre samt kurzer Begründung sowie gegebenenfalls der Name und die Adresse des unabhängigen Stimmrechtsvertreters bekanntzugeben.\n' +
        'Mindestens 20 Tage vor der ordentlichen Generalversammlung sind der Geschäftsbericht und die Revisionsberichte den Aktionären zugänglich zu machen. Sofern die Unterlagen nicht elektronisch zugänglich sind, kann jeder Aktionär verlangen, dass ihm diese rechtzeitig zugestellt werden. Jeder Aktionär kann während eines Jahres nach der Generalversammlung verlangen, dass ihm der Geschäftsbericht in der von der Generalversammlung genehmigten Form sowie die Revisionsberichte zugestellt werden, sofern die Unterlagen nicht elektronisch zugänglich sind.\n' +
        'Aktionäre, die zusammen über mindestens 5 Prozent des Aktienkapitals oder der Stimmen verfügen, können die Traktandierung von Verhandlungsgegenständen oder die Aufnahme eines Antrages zu einem Verhandlungsgegenstand in die Einberufung der Generalversammlung verlangen.\n' +
        'Über Anträge zu nicht gehörig angekündigten Verhandlungsgegenständen können keine Beschlüsse gefasst werden; ausgenommen sind Anträge auf Einberufung einer ausserordentlichen Generalversammlung, auf Durchführung einer Sonderuntersuchung und auf Wahl einer Revisionsstelle.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 700 OR',
      begruendung: 'ZH-Langvorlage verbatim (inkl. Original-Interpunktion — Bug-Check B1, 7.6.2026). Norm-Kette: 6-Monats-Frist und Einberufungsrecht Art. 699 OR (10 % Abs. 3), Unterlagen-Zugänglichkeit Art. 699a OR, Traktandierungsrecht 5 % Art. 699b OR, Inhalt und Ankündigungs-Schranke Art. 700 OR.',
    },
    {
      id: 'AS13_beschlussfassung_virtuell',
      ueberschrift: 'Beschlussfassungsarten der Aktionäre',
      text:
        'Aktionäre können unter Beachtung der Einberufungs- und Traktandierungsvorschriften die Generalversammlungen vor Ort oder hybrid (vor Ort und virtuell) oder virtuell abhalten. ' +
        'Bei einer virtuellen Generalversammlung kann der Verwaltungsrat im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.\n' +
        'Sofern kein Aktionär oder dessen Vertretung eine mündliche Beratung an einer Generalversammlung verlangt, können die Aktionäre ihre Beschlüsse gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen.',
      includeIf: { feld: 'virtuelleGv', eq: true },
      norm: 'Art. 701d OR',
      begruendung: 'Beschlussfassungsarten-Artikel der amtlichen ZH-Kurzvorlage (Satz 1 verbatim); virtuelle GV braucht die statutarische Grundlage (Art. 701d OR), der Schriftweg-Satz gibt Art. 701 Abs. 3 OR wieder.',
      hinweis: 'Ein genereller statutarischer Verzicht auf die unabhängige Stimmrechtsvertretung ist unzulässig – zulässig ist nur die Einzelfall-Ermächtigung (EHRA-Praxismitteilung 1/23).',
    },
    {
      id: 'AS13_beschlussfassung',
      ueberschrift: 'Beschlussfassungsarten der Aktionäre',
      text:
        'Sofern kein Aktionär oder dessen Vertretung eine mündliche Beratung an einer Generalversammlung verlangt, können die Aktionäre ihre Beschlüsse gemäss Art. 701 Abs. 3 OR auch auf schriftlichem Weg fassen.',
      includeIf: { feld: 'virtuelleGv', eq: false },
      norm: 'Art. 701 Abs. 3 OR',
      begruendung: 'Beschlussfassungsarten-Artikel der amtlichen ZH-Kurzvorlage ohne den Virtuell-Satz (keine 701d-Grundlage gewählt); der Schriftweg-Satz gibt geltendes Recht deklaratorisch wieder.',
    },
    {
      id: 'ASL32_tagungsort',
      ueberschrift: 'Generalversammlung mit Tagungsort',
      text:
        'Der Verwaltungsrat bestimmt den Tagungsort der Generalversammlung. Durch die Festlegung des Tagungsortes darf für keinen Aktionär die Ausübung seiner Rechte im Zusammenhang mit der Generalversammlung in unsachlicher Weise erschwert werden.\n' +
        'Die Generalversammlung kann an verschiedenen Orten gleichzeitig durchgeführt werden. Die Voten der Teilnehmer müssen in diesem Fall unmittelbar in Bild und Ton an sämtliche Tagungsorte übertragen werden.\n' +
        'Die Generalversammlung kann im Ausland durchgeführt werden, wenn der Verwaltungsrat in der Einberufung einen unabhängigen Stimmrechtsvertreter bezeichnet. Der Verwaltungsrat kann auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters verzichten, sofern alle Aktionäre damit einverstanden sind.\n' +
        'Der Verwaltungsrat kann vorsehen, dass Aktionäre, die nicht am Ort der Generalversammlung anwesend sind, ihre Rechte auf elektronischem Weg ausüben können.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 701a OR',
      begruendung: 'ZH-Langvorlage verbatim (Tagungsort und mehrere Orte Art. 701a OR; Ausland mit Stimmrechtsvertreter-Statutengrundlage Art. 701b OR; elektronische Rechtsausübung Art. 701c OR).',
    },
    {
      id: 'ASL33_virtuell',
      ueberschrift: 'Generalversammlung ohne Tagungsort (virtuell)',
      text:
        'Eine Generalversammlung kann mit elektronischen Mitteln ohne Tagungsort durchgeführt werden. Der Verwaltungsrat kann im Einzelfall auf die Bezeichnung einer unabhängigen Stimmrechtsvertretung verzichten.\n' +
        'Der Verwaltungsrat regelt die Verwendung elektronischer Mittel. Er stellt sicher, dass die Identität der Teilnehmer feststeht, die Voten in der Generalversammlung unmittelbar übertragen werden, jeder Teilnehmer Anträge stellen und sich an der Diskussion beteiligen kann und das Abstimmungsergebnis nicht verfälscht werden kann.\n' +
        'Treten während der Generalversammlung technische Probleme auf, sodass die Generalversammlung nicht ordnungsgemäss durchgeführt werden kann, so muss sie wiederholt werden. Beschlüsse, welche die Generalversammlung vor dem Auftreten der technischen Probleme gefasst hat, bleiben gültig.',
      includeIf: { and: [{ feld: 'istLang', eq: true }, { feld: 'virtuelleGv', eq: true }] },
      norm: 'Art. 701d OR',
      begruendung: 'ZH-Langvorlage; Haus-Abweichung (offengelegt): Der ZH-Satz «Auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters kann verzichtet werden» ist als EINZELFALL-Ermächtigung des VR gefasst — ein genereller statutarischer Verzicht ist unzulässig (EHRA-Praxismitteilung 1/23). Technik-Pannen-Klausel = Art. 701f OR sinngemäss.',
      hinweis: 'Nur mit der Weiche «virtuelle GV» — der Artikel selbst ist die statutarische Grundlage nach Art. 701d Abs. 1 OR.',
    },
    {
      id: 'ASL34_vorsitz',
      ueberschrift: 'Vorsitz und Protokoll',
      text:
        'Den Vorsitz in der Generalversammlung führt der Präsident, in dessen Verhinderungsfalle ein anderes vom Verwaltungsrat bestimmtes Mitglied desselben. Nimmt kein Mitglied des Verwaltungsrates teil, wählt die Generalversammlung einen Tagesvorsitzenden.\n' +
        'Der Vorsitzende bezeichnet den Protokollführer und die Stimmenzähler, die nicht Aktionäre zu sein brauchen. Das Protokoll ist vom Vorsitzenden und vom Protokollführer zu unterzeichnen. Jeder Aktionär kann verlangen, dass ihm das Protokoll innerhalb von 30 Tagen nach der Generalversammlung zugänglich gemacht wird.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 702 OR',
      begruendung: 'ZH-Langvorlage verbatim (Protokollführung und 30-Tage-Zugänglichkeit, Art. 702 Abs. 2 und 4 OR).',
    },
    {
      id: 'ASL35_zirkular',
      ueberschrift: 'Protokollierung von schriftlichen Beschlüssen der Aktionäre',
      text:
        'Aktionäre können schriftliche Beschlüsse auf dem Zirkularweg oder mittels schriftlicher Abstimmung fassen. Diese Beschlüsse können auf schriftlichem Weg auf Papier, mittels einer vom Verwaltungsrat bezeichneten elektronischen Plattform oder in elektronischer Form, welche den Nachweis in Textform vorsieht, gefasst werden.\n' +
        'Ein Zirkularbeschluss ist von sämtlichen Aktionären zu unterzeichnen und mit der ausdrücklichen Feststellung eines Mitglieds des Verwaltungsrates zu ergänzen, dass die Beschlussfassung damit gültig zustande gekommen ist. Das Mitglied des Verwaltungsrates muss den Zirkularbeschluss mitunterzeichnen.\n' +
        'Sofern die Aktionäre mittels schriftlicher Abstimmung einen Beschluss fassen, muss in einem Erwahrungsprotokoll des Verwaltungsrates der Ablauf der schriftlichen Beschlussfassung sowie das Abstimmungsergebnis festgehalten werden. Das Erwahrungsprotokoll ist vom Vorsitzenden und Protokollführer zu unterzeichnen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 701 Abs. 3 OR',
      begruendung: 'ZH-Langvorlage verbatim (schriftliche Beschlussfassung Art. 701 Abs. 3 OR; Erwahrungsprotokoll-Praxis nach EHRA-Praxismitteilung 1/24).',
    },
    {
      id: 'ASL36_stimmrecht',
      ueberschrift: 'Stimmrecht und Vertretung',
      text:
        'Die Aktionäre üben ihr Stimmrecht in der Generalversammlung nach Verhältnis des gesamten Nennwerts der ihnen gehörenden Aktien aus.\n' +
        'Die Mitgliedschaftsrechte aus Namenaktien kann ausüben, wer durch den Eintrag im Aktienbuch ausgewiesen oder vom Aktionär dazu schriftlich bevollmächtigt ist.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 692 OR',
      begruendung: 'ZH-Langvorlage verbatim (Stimmkraft nach Nennwert Art. 692 Abs. 1 OR; Legitimation/Vertretung Art. 689a Abs. 1 OR).',
    },
    {
      id: 'ASL37_beschlussfassung',
      ueberschrift: 'Beschlussfassung',
      text:
        'Die Generalversammlung fasst ihre Beschlüsse und vollzieht ihre Wahlen, soweit das Gesetz oder die Statuten es nicht anders bestimmen, mit der Mehrheit der vertretenen Aktienstimmen.{{stichentscheidSatz}}\n' +
        'Ein Beschluss der Generalversammlung, der mindestens zwei Drittel der vertretenen Stimmen und die Mehrheit der vertretenen Aktiennennwerte auf sich vereinigt, ist erforderlich für:\n' +
        '– die Änderung des Gesellschaftszweckes;\n' +
        '– die Zusammenlegung von Aktien, soweit dafür nicht die Zustimmung aller betroffenen Aktionäre erforderlich ist;\n' +
        '– die Kapitalerhöhung aus Eigenkapital, gegen Sacheinlagen oder durch Verrechnung mit einer Forderung und die Gewährung von besonderen Vorteilen;\n' +
        '– die Einschränkung oder Aufhebung des Bezugsrechts;\n' +
        '– die Einführung eines bedingten Kapitals oder die Einführung eines Kapitalbands;\n' +
        '– die Umwandlung von Partizipationsscheinen in Aktien;\n' +
        '– die Beschränkung der Übertragbarkeit von Namenaktien;\n' +
        '– die Einführung von Stimmrechtsaktien;\n' +
        '– den Wechsel der Währung des Aktienkapitals;\n' +
        '– die Einführung des Stichentscheids des Vorsitzenden in der Generalversammlung;\n' +
        '– eine Statutenbestimmung zur Durchführung der Generalversammlung im Ausland;\n' +
        '– die Verlegung des Sitzes der Gesellschaft;\n' +
        '– die Einführung einer statutarischen Schiedsklausel;\n' +
        '– den Verzicht auf die Bezeichnung eines unabhängigen Stimmrechtsvertreters für die Durchführung einer virtuellen Generalversammlung bei Gesellschaften, deren Aktien nicht an einer Börse kotiert sind;\n' +
        '– die Auflösung der Gesellschaft.\n' +
        'Statutenbestimmungen, die für die Fassung bestimmter Beschlüsse grössere Mehrheiten als die vom Gesetz vorgeschriebenen festlegen, können nur mit dem vorgesehenen Mehr eingeführt, geändert oder aufgehoben werden.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 703 und 704 OR',
      begruendung: 'ZH-Langvorlage verbatim — Mehrheitserfordernis (Art. 703 OR), statutarischer Stichentscheid des Vorsitzenden (P3: als Weiche abwählbar — der SG-Lang-Default kennt KEINEN Stichentscheid, Kantonsvergleich B8; ohne Klausel gilt: Stimmengleichheit = Antrag abgelehnt) sowie der qualifizierte Katalog nach revidiertem Recht (Art. 704 Abs. 1 OR, inkl. Währungswechsel, Kapitalband, Schiedsklausel, GV im Ausland, Sitzverlegung, Stimmrechtsvertreter-Verzicht) und die Verschärfungs-Schranke (Art. 704 Abs. 2 OR). Haus-Anmerkung (Bug-Check B2, 7.6.2026): Ziff. 12 des Gesetzeskatalogs (Dekotierung der Beteiligungspapiere) ist wie in der ZH-Vorlage bewusst weggelassen — sie betrifft nur Gesellschaften mit börsenkotierten Papieren.',
    },
    // ── LANG-Stufe: Block «Verwaltungsrat» (ZH-Langvorlage) ─────────────────
    {
      id: 'ASL40_vr_wahl',
      ueberschrift: 'Wahl und Zusammensetzung des Verwaltungsrates',
      text:
        'Der Verwaltungsrat der Gesellschaft besteht aus einem oder mehreren Mitgliedern.\n' +
        'Die Mitglieder des Verwaltungsrates werden auf drei Jahre gewählt. Neugewählte treten in die Amtsdauer derjenigen Mitglieder ein, die sie ersetzen.\n' +
        'Der Verwaltungsrat konstituiert sich selbst. Er bezeichnet seinen Präsidenten und den Sekretär. Dieser muss dem Verwaltungsrat nicht angehören.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 710 OR',
      begruendung: 'ZH-Langvorlage verbatim (ein oder mehrere Mitglieder Art. 707 Abs. 1 OR; Amtsdauer drei Jahre Art. 710 Abs. 2 OR; Selbstkonstituierung Art. 712 Abs. 2 OR).',
    },
    {
      id: 'ASL41_vr_sitzungen',
      ueberschrift: 'Sitzungen und Beschlussfassung des Verwaltungsrates',
      text:
        'Beschlussfähigkeit, Beschlussfassung und Geschäftsordnung werden im Organisationsreglement geregelt. Jedes Mitglied des Verwaltungsrates kann unter Angabe der Gründe vom Präsidenten die unverzügliche Einberufung einer Sitzung verlangen.\n' +
        'Bei der Beschlussfassung in Sitzungen des Verwaltungsrates hat der Vorsitzende den Stichentscheid. Beschlüsse können auch auf dem Wege der schriftlichen Zustimmung oder in elektronischer Form zu einem gestellten Antrag gefasst werden, sofern nicht ein Mitglied die mündliche Beratung verlangt.\n' +
        'Über die Verhandlungen und Beschlüsse ist ein Protokoll zu führen, das vom Vorsitzenden und vom Sekretär unterzeichnet wird.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 713 OR',
      begruendung: 'ZH-Langvorlage verbatim (Einberufungsrecht Art. 715 OR; Beschlussformen und Protokoll Art. 713 OR).',
    },
    {
      id: 'ASL42_vr_zirkular',
      ueberschrift: 'Protokollierung von Beschlüssen des Verwaltungsrates',
      text:
        'Der Verwaltungsrat kann auf dem Zirkularweg oder mittels schriftlicher Abstimmung Beschluss fassen. Diese Beschlüsse können auf schriftlichem Weg auf Papier, mittels einer vom Verwaltungsrat bezeichneten elektronischen Plattform oder in elektronischer Form, welche den Nachweis in Textform vorsieht, gefasst werden.\n' +
        'Ein Zirkularbeschluss ist von sämtlichen Mitgliedern des Verwaltungsrates zu unterzeichnen.\n' +
        'Sofern die Mitglieder des Verwaltungsrates mittels schriftlicher Abstimmung einen Beschluss fassen, muss in einem Erwahrungsprotokoll des Verwaltungsrates der Ablauf der schriftlichen Beschlussfassung sowie das Abstimmungsergebnis festgehalten werden. Das Erwahrungsprotokoll ist vom Vorsitzenden und Protokollführer zu unterzeichnen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 713 Abs. 2 OR',
      begruendung: 'ZH-Langvorlage verbatim (Beschlussformen Art. 713 Abs. 2 OR; Erwahrungsprotokoll-Praxis nach EHRA-Praxismitteilung 1/24).',
    },
    {
      id: 'ASL43_vr_auskunft',
      ueberschrift: 'Recht auf Auskunft und Einsicht',
      text:
        'Jedes Mitglied des Verwaltungsrates kann Auskunft über alle Angelegenheiten der Gesellschaft verlangen.\n' +
        'In den Sitzungen sind alle Mitglieder des Verwaltungsrates sowie die mit der Geschäftsführung betrauten Personen zur Auskunft verpflichtet.\n' +
        'Ausserhalb der Sitzungen kann jedes Mitglied von den mit der Geschäftsführung betrauten Personen Auskunft über den Geschäftsgang und, mit Ermächtigung des Präsidenten, auch über einzelne Geschäfte verlangen.\n' +
        'Soweit es für die Erfüllung einer Aufgabe erforderlich ist, kann jedes Mitglied dem Präsidenten beantragen, dass ihm Bücher und Akten vorgelegt werden.\n' +
        'Weist der Präsident ein Gesuch auf Auskunft, Anhörung oder Einsicht ab, so entscheidet der Verwaltungsrat.\n' +
        'Regelungen oder Beschlüsse des Verwaltungsrates, die das Recht auf Auskunft und Einsichtnahme der Verwaltungsräte erweitern, bleiben vorbehalten.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 715a OR',
      begruendung: 'ZH-Langvorlage verbatim (Wiedergabe von Art. 715a Abs. 1–6 OR).',
    },
    {
      id: 'ASL44_vr_aufgaben',
      ueberschrift: 'Aufgaben des Verwaltungsrates',
      text:
        'Der Verwaltungsrat kann in allen Angelegenheiten Beschluss fassen, die nicht nach Gesetz oder Statuten der Generalversammlung zugeteilt sind. Er führt die Geschäfte der Gesellschaft, soweit er die Geschäftsführung nicht übertragen hat.\n' +
        'Der Verwaltungsrat hat folgende unübertragbare und unentziehbare Aufgaben:\n' +
        '– die Oberleitung der Gesellschaft und die Erteilung der nötigen Weisungen;\n' +
        '– die Festlegung der Organisation;\n' +
        '– die Ausgestaltung des Rechnungswesens, der Finanzkontrolle sowie der Finanzplanung, sofern diese für die Führung der Gesellschaft notwendig ist;\n' +
        '– die Ernennung und Abberufung der mit der Geschäftsführung und der Vertretung betrauten Personen;\n' +
        '– die Oberaufsicht über die mit der Geschäftsführung betrauten Personen, namentlich im Hinblick auf die Befolgung der Gesetze, Statuten, Reglemente und Weisungen;\n' +
        '– die Erstellung des Geschäftsberichtes sowie die Vorbereitung der Generalversammlung und die Ausführung ihrer Beschlüsse;\n' +
        '– die Einreichung eines Gesuchs um Nachlassstundung und die Benachrichtigung des Gerichts im Falle der Überschuldung.\n' +
        'Der Verwaltungsrat kann die Vorbereitung und die Ausführung seiner Beschlüsse oder die Überwachung von Geschäften Ausschüssen oder einzelnen Mitgliedern zuweisen. Er hat für eine angemessene Berichterstattung an seine Mitglieder zu sorgen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 716a OR',
      begruendung: 'ZH-Langvorlage verbatim (Vermutungskompetenz Art. 716 OR; unübertragbare Aufgaben Art. 716a Abs. 1 OR; Ausschüsse Art. 716a Abs. 2 OR).',
    },
    {
      id: 'ASL45_vr_delegation',
      ueberschrift: 'Übertragung der Geschäftsführung und der Vertretung',
      text:
        'Der Verwaltungsrat kann die Geschäftsführung nach Massgabe eines Organisationsreglementes ganz oder zum Teil an einzelne Mitglieder oder an Dritte übertragen (Geschäftsleitung).\n' +
        'Das Organisationsreglement ordnet die Geschäftsführung, bestimmt die hierfür erforderlichen Stellen, umschreibt deren Aufgaben und regelt insbesondere die Berichterstattung.\n' +
        'Soweit die Geschäftsführung nicht übertragen worden ist, steht sie allen Mitgliedern des Verwaltungsrates gesamthaft zu.\n' +
        'Der Verwaltungsrat kann die Vertretung einem oder mehreren Mitgliedern (Delegierte) oder Dritten (Direktoren) übertragen. Mindestens ein Mitglied des Verwaltungsrates muss zur Vertretung befugt sein. Die Gesellschaft muss durch eine Person vertreten werden können, die Wohnsitz in der Schweiz hat.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 716b OR',
      begruendung: 'ZH-Langvorlage (Delegation Art. 716b OR; Vertretung Art. 718 Abs. 2–4 OR). Haus-Korrektur (offengelegt): ZH schreibt «an einzelnen Mitgliedern oder an Dritten» — grammatisch richtig ist der Akkusativ «an einzelne Mitglieder oder an Dritte».',
    },
    // ── LANG-Stufe: Block «Revisionsstelle» (ZH-Langvorlage) ────────────────
    {
      id: 'ASL50_revision',
      ueberschrift: 'Revision',
      text:
        'Die Generalversammlung wählt eine Revisionsstelle. Sie kann auf die Wahl einer Revisionsstelle verzichten, wenn:\n' +
        '– die Gesellschaft nicht zur ordentlichen Revision verpflichtet ist;\n' +
        '– sämtliche Aktionäre zustimmen; und\n' +
        '– die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat.\n' +
        'Der Verzicht gilt auch für die nachfolgenden Jahre. Jeder Aktionär hat jedoch das Recht, spätestens zehn Tage vor der Generalversammlung die Durchführung einer eingeschränkten Revision und die Wahl einer entsprechenden Revisionsstelle zu verlangen. Die Generalversammlung darf diesfalls die Beschlüsse über die Genehmigung der Jahresrechnung und die Verwendung des Bilanzgewinnes erst fassen, wenn der Revisionsbericht vorliegt.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 727a OR',
      begruendung: 'ZH-Langvorlage; Haus-Abweichung (offengelegt): Der ZH-Binnenverweis «die Beschlüsse nach Art. 8 Ziff. 3 bis 6» ist durch die inhaltliche Umschreibung ersetzt (Genehmigung der Jahresrechnung, Verwendung des Bilanzgewinnes — Art. 731 Abs. 1 OR), weil die Artikelnummerierung der Haus-Statuten dynamisch ist.',
    },
    {
      id: 'ASL51_rs_anforderungen',
      ueberschrift: 'Anforderungen an die Revisionsstelle',
      text:
        'Als Revisionsstelle können eine oder mehrere natürliche oder juristische Personen oder Personengesellschaften gewählt werden.\n' +
        'Die Revisionsstelle muss ihren Wohnsitz, ihren Sitz oder eine eingetragene Zweigniederlassung in der Schweiz haben. Hat die Gesellschaft mehrere Revisionsstellen, so muss zumindest eine diese Voraussetzungen erfüllen.\n' +
        'Ist die Gesellschaft zur ordentlichen Revision verpflichtet, so muss die Generalversammlung als Revisionsstelle einen zugelassenen Revisionsexperten bzw. ein staatlich beaufsichtigtes Revisionsunternehmen nach den Vorschriften des Revisionsaufsichtsgesetzes vom 16. Dezember 2005 wählen.\n' +
        'Ist die Gesellschaft zur eingeschränkten Revision verpflichtet, so muss die Generalversammlung als Revisionsstelle einen zugelassenen Revisor nach den Vorschriften des Revisionsaufsichtsgesetzes vom 16. Dezember 2005 wählen. Vorbehalten bleibt der Verzicht auf die Wahl einer Revisionsstelle gemäss dem vorstehenden Artikel.\n' +
        'Die Revisionsstelle muss nach Art. 728 bzw. 729 OR unabhängig sein.\n' +
        'Die Revisionsstelle wird für ein Geschäftsjahr gewählt. Ihr Amt endet mit der Abnahme der letzten Jahresrechnung. Eine Wiederwahl ist möglich. Die Generalversammlung kann die Revisionsstelle nur aus wichtigen Gründen abberufen.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 727b OR',
      begruendung: 'ZH-Langvorlage (Wählbarkeit Art. 730 OR; ordentliche/eingeschränkte Revision Art. 727b/727c OR; Unabhängigkeit Art. 728/729 OR; Abberufung Art. 730a OR). Haus-Abweichungen (offengelegt): ZH-Binnenverweis «nach Artikel 23» durch «gemäss dem vorstehenden Artikel» ersetzt (dynamische Nummerierung); die Amtsdauer «für ein Geschäftsjahr» ist eine statutarische Festlegung INNERHALB der gesetzlichen Bandbreite von Art. 730a Abs. 1 OR (ein bis drei Geschäftsjahre — Bug-Check B3, 7.6.2026).',
    },
    {
      id: 'AS15_geschaeftsjahr',
      ueberschrift: 'Geschäftsjahr und Buchführung',
      text:
        'Das Geschäftsjahr beginnt am {{gjBeginnTxt}} und endet am {{gjEndeTxt}}.{{gjErstesSatz}}\n' +
        'Die Jahresrechnung, bestehend aus Erfolgsrechnung, Bilanz und Anhang, ist gemäss den Vorschriften des Schweizerischen Obligationenrechts, insbesondere der Art. 957 ff., zu erstellen.',
      norm: 'Art. 958 Abs. 2 OR',
      begruendung: 'Geschäftsjahr-Artikel der amtlichen ZH-Kurzvorlage (verbatim; kein Pflichtinhalt nach Art. 626 OR, aber Standard aller amtlichen Muster). Der Norm-Anker deckt die Jahresrechnungs-Bestandteile des zweiten Satzes (Bilanz, Erfolgsrechnung, Anhang — Art. 958 Abs. 2 OR); das Geschäftsjahr selbst ist gesetzlich nicht fixiert (Bug-Check-Befund 5, 7.6.2026).',
    },
    {
      id: 'ASL60_reserven',
      ueberschrift: 'Reserven und Gewinnverwendung',
      text:
        'Aus dem Jahresgewinn ist zuerst die Zuweisung an die gesetzliche Gewinnreserve entsprechend den Vorschriften des Gesetzes vorzunehmen. Der Bilanzgewinn steht zur Verfügung der Generalversammlung, die ihn im Rahmen der gesetzlichen Auflagen (insbesondere Art. 671 ff. OR) nach freiem Ermessen verwenden kann.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 672 OR',
      begruendung: 'ZH-Langvorlage verbatim (gesetzliche Gewinnreserve Art. 672 OR; der Sammelverweis «Art. 671 ff. OR» umfasst den ganzen Reserven-Abschnitt inkl. der gesetzlichen Kapitalreserve Art. 671 OR).',
    },
    {
      id: 'ASL61_aufloesung',
      ueberschrift: 'Auflösung und Liquidation',
      text:
        'Die Auflösung der Gesellschaft kann durch einen Beschluss der Generalversammlung, über den eine öffentliche Urkunde zu errichten ist, erfolgen.\n' +
        'Die Liquidation wird durch den Verwaltungsrat besorgt, falls sie nicht durch einen Beschluss der Generalversammlung anderen Personen übertragen wird. Die Liquidation erfolgt gemäss Art. 742 ff. OR.\n' +
        'Das Vermögen der aufgelösten Gesellschaft wird nach Tilgung ihrer Schulden nach Massgabe der einbezahlten Beträge unter die Aktionäre verteilt.',
      includeIf: { feld: 'istLang', eq: true },
      norm: 'Art. 736 OR',
      begruendung: 'ZH-Langvorlage verbatim (Auflösungsbeschluss mit öffentlicher Urkunde Art. 736 Abs. 1 Ziff. 2 OR; Liquidatoren Art. 740 OR; Verteilung nach einbezahlten Beträgen Art. 745 Abs. 1 OR).',
    },
    // ── Stufe 2 P3: Schiedsklausel (Art. 697n OR) ───────────────────────────
    {
      id: 'AS16_schiedsklausel',
      ueberschrift: 'Schiedsklausel',
      text:
        'Gesellschaftsrechtliche Streitigkeiten beurteilt unter Ausschluss der staatlichen Gerichte ein ' +
        'Schiedsgericht mit Sitz in {{schiedsOrtTxt}} (Schweiz). Die Schiedsklausel bindet die ' +
        'Gesellschaft, die Organe der Gesellschaft, die Mitglieder der Organe und die Aktionäre. Für das ' +
        'Verfahren vor dem Schiedsgericht gelten die Bestimmungen des 3. Teils der Schweizerischen ' +
        'Zivilprozessordnung. Personen, die von den Rechtswirkungen des Schiedsspruchs direkt betroffen ' +
        'sein können, sind über die Einleitung und die Beendigung des Verfahrens zu informieren; sie ' +
        'können sich bei der Bestellung des Schiedsgerichts beteiligen und dem Verfahren als ' +
        'Intervenienten beitreten.',
      includeIf: { feld: 'hatSchiedsklausel', eq: true },
      norm: 'Art. 697n OR',
      begruendung: 'Stufe 2 P3 (Haus-Fassung am Normtext, offengelegt — kein amtlicher Mustertext): Abs. 1 Sitz in der Schweiz + Bindungswirkung verbatim-nah; Abs. 2 ZPO Teil 3 (das 12. Kapitel des IPRG ist nicht anwendbar); Abs. 3 Pflicht-Sicherstellung von Information und Mitwirkung der direkt Betroffenen (am Cache verifiziert). Der Handelsregister-Eintrag enthält einen Verweis auf die Schiedsklausel (Art. 45 Abs. 1 lit. u HRegV).',
      hinweis: 'Einzelheiten (z. B. Verweisung auf eine Schiedsordnung) können die Statuten zusätzlich regeln (Art. 697n Abs. 3 OR) — hier bewusst nicht vorbelegt; die Einführung bedarf bei bestehenden Gesellschaften des qualifizierten Mehrs (Art. 704 Abs. 1 Ziff. 14 OR).',
    },
    {
      id: 'AS04_mitteilungen',
      ueberschrift: 'Mitteilungen',
      text: 'Mitteilungen der Gesellschaft an die Aktionärinnen und Aktionäre erfolgen per Brief oder E-Mail an die im Aktienbuch verzeichneten Adressen.',
      norm: 'Art. 626 Abs. 1 Ziff. 7 OR',
      begruendung: 'Pflichtinhalt Form der Mitteilungen (rev. 2023; Wortlaut ZH/SG).',
    },
  ],
};

// ── 2 · ERRICHTUNGSAKT (ENTWURF – Art. 629 OR) ──────────────────────────────

const ERRICHTUNGSAKT_SCHEMA: VorlageSchema = {
  id: 'ag-errichtungsakt',
  version: '1.0.0 (Rechtsstand OR 1.1.2026; Wortlaut-Dossier 7.6.2026)',
  titel: 'Öffentliche Urkunde über den Errichtungsakt',
  format: 'verfuegung',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF zur Vorbereitung des Beurkundungstermins: ' +
    'Der Errichtungsakt der AG bedarf der öffentlichen Beurkundung (Art. 629 Abs. 1 OR); die Urkunde ' +
    'entsteht bei der Urkundsperson. Gliederung und Wortlaute nach den amtlichen Vorlagen ZH/SG (2023/2024).',
  bausteine: [
    {
      id: 'AE01_ingress',
      text: 'Gründung der {{firma}} mit Sitz in {{sitz}}\n\nVor der unterzeichnenden Urkundsperson sind heute erschienen:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'Urkunden-Ingress mit Personalien-Block (Art. 44 lit. a HRegV).',
      norm: 'Art. 44 lit. a HRegV',
    },
    {
      id: 'AE01_ingress_singular',
      text: 'Gründung der {{firma}} mit Sitz in {{sitz}}\n\nVor der unterzeichnenden Urkundsperson ist heute erschienen:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Urkunden-Ingress im Singular (D1: Einpersonen-Gründung ist in der Einzahl abzufassen — Erläuterung der ZH-Vorlagen; eigenständige Singular-Vorlage 3.5).',
      norm: 'Art. 44 lit. a HRegV',
    },
    {
      id: 'AE02_gruenderliste',
      text: '– {{item.name}}{{item.angabenZeile}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Personenangaben zu allen Gründerinnen und Gründern.',
      norm: 'Art. 44 lit. a HRegV',
    },
    {
      id: 'AE03_erklaerung',
      ueberschrift: 'Gründungserklärung und Statuten',
      text:
        'Die erschienenen Personen erklären, eine Aktiengesellschaft unter der Firma {{firma}} mit ' +
        'Sitz in {{sitz}} zu gründen, und legen hiermit die beiliegenden Statuten fest, die Bestandteil ' +
        'dieser Urkunde bilden.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Gründungserklärung und Statutenfestlegung in der öffentlichen Urkunde (Art. 44 lit. b und c HRegV).',
    },
    {
      id: 'AE03_erklaerung_singular',
      ueberschrift: 'Gründungserklärung und Statuten',
      text:
        'Die erschienene Person erklärt, eine Aktiengesellschaft unter der Firma {{firma}} mit ' +
        'Sitz in {{sitz}} zu gründen, und legt hiermit die beiliegenden Statuten fest, die Bestandteil ' +
        'dieser Urkunde bilden.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Gründungserklärung im Singular (D1; ZH-Vorlage 3.5: «gründe ich» — Haus-Fassung in der dritten Person wie die Plural-Fassung).',
    },
    {
      id: 'AE04_zeichnung',
      ueberschrift: 'Aktienkapital und Zeichnung',
      text:
        'Das Aktienkapital der Gesellschaft beträgt {{waehrungCode}} {{akFmt}} und ist eingeteilt in {{anzahlAktien}} ' +
        '{{aktienArt}} zu je {{waehrungCode}} {{nennwertFmt}} (Nennwert), welche zum Ausgabebetrag von {{waehrungCode}} {{ausgabeFmt}} ' +
        'je Aktie wie folgt gezeichnet werden:',
      norm: 'Art. 630 Ziff. 1 OR',
      begruendung: 'Zeichnung mit Anzahl, Nennwert, Art und Ausgabebetrag – bei der Gründung in der Urkunde selbst (Art. 44 lit. d HRegV); Ausgabebetrag = Nennwert plus allfälliges Agio (Etappe 3.2/D7; Checkliste Errichtungsakt zu Art. 630 OR).',
    },
    {
      id: 'AE05_zeichnungsliste',
      text: '– {{item.name}}: {{item.anzahl}} {{aktienArt}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Zeichnungserklärung jeder Gründerin / jedes Gründers.',
      norm: 'Art. 44 lit. d HRegV',
    },
    {
      id: 'AE05b_verpflichtung',
      text: 'Jede Gründerin und jeder Gründer verpflichtet sich hiermit bedingungslos, die dem Ausgabebetrag der gezeichneten Aktien entsprechende Einlage zu leisten.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 630 Ziff. 2 OR',
      begruendung: 'Bedingungslose Einlage-Verpflichtung als Gültigkeitserfordernis der Zeichnung (ZH-Urkunde wortgleich).',
    },
    {
      id: 'AE05b_verpflichtung_singular',
      text: 'Die Gründerin bzw. der Gründer verpflichtet sich hiermit bedingungslos, die dem Ausgabebetrag der gezeichneten Aktien entsprechende Einlage zu leisten.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 630 Ziff. 2 OR',
      begruendung: 'Einlage-Verpflichtung im Singular (D1; ZH-Vorlage 3.5: «Der Gründer verpflichtet sich hiermit bedingungslos …»).',
    },
    {
      id: 'AE07_einlagen_voll_bank',
      ueberschrift: 'Einlagen',
      text:
        'Sämtliche Einlagen von gesamthaft {{waehrungCode}} {{einlagenTotalFmt}} wurden in Geld geleistet und sind bei der ' +
        '{{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und ' +
        'Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'nurBar', eq: true }, { feld: 'vollLiberiert', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 633 OR',
      begruendung: 'Volliberierung in Geld mit Banknennung in der Urkunde (separate Bescheinigung entfällt, Art. 43 Abs. 1 lit. f HRegV); nur bei der reinen Bargründung («Sämtliche Einlagen»).',
    },
    {
      id: 'AE07_einlagen_voll_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Sämtliche Einlagen von gesamthaft {{waehrungCode}} {{einlagenTotalFmt}} wurden in Geld geleistet und gemäss separater ' +
        'Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ' +
        'ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'nurBar', eq: true }, { feld: 'vollLiberiert', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 633 OR',
      begruendung: 'Volliberierung in Geld mit separater Bankbescheinigung als Beleg; nur bei der reinen Bargründung.',
    },
    {
      id: 'AE07_einlagen_teil_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} ({{liberierungProzent}} % ' +
        'des Nennwerts jeder Aktie) in Geld geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach ' +
        'Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der ' +
        'Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'teilGleich', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung mit EINHEITLICHEM Grad (mind. 20 % je Aktie, gesamthaft mind. CHF 50\'000); individuelle Grade je Gründer in der eigenen Variante (Etappe 3.3).',
    },
    {
      id: 'AE07_einlagen_teil_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} ({{liberierungProzent}} % ' +
        'des Nennwerts jeder Aktie) in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach ' +
        'Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der ' +
        'Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'teilGleich', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung (einheitlich) mit separater Bankbescheinigung.',
    },
    // ── Etappe 3.3/D6: Teilliberierung mit INDIVIDUELLEN Graden je Gründer ──
    {
      id: 'AE07i_einlagen_individuell_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} in Geld ' +
        'geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. ' +
        'Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich:',
      includeIf: { and: [{ feld: 'teilIndividuell', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung mit individuellen Graden nach ZH-Urkunde 3.1 («Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich a) … Aktien des Gründers … zu … %»).',
    },
    {
      id: 'AE07i_einlagen_individuell_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft {{waehrungCode}} {{einbezahltFmt}} in Geld ' +
        'geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. ' +
        'Dadurch ist das Aktienkapital teilweise liberiert worden, nämlich:',
      includeIf: { and: [{ feld: 'teilIndividuell', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 632 OR',
      begruendung: 'Individuelle Teilliberierung mit separater Bankbescheinigung.',
    },
    {
      id: 'AE07i_liste',
      text: '– {{item.anzahl}} Aktien von {{item.name}} zu {{item.prozentTxt}} %',
      wiederholeUeber: 'gruenderTeilListe',
      includeIf: { feld: 'teilIndividuell', eq: true },
      norm: 'Art. 632 Abs. 1 OR',
      begruendung: 'Je Gründerin/Gründer eine Liberierungs-Zeile (ZH-Urkunde 3.1 Teilliberierungs-Variante; Haus-Fassung geschlechtsneutral «Aktien von» statt «Aktien des Gründers»).',
    },
    // ── Stufe 2 P1b: Agio bei Teilliberierung (reine Bargründung) ───────────
    {
      id: 'AE07x_agio_teilbar',
      text:
        'Zusätzlich wurde das Ausgabeagio von gesamthaft {{waehrungCode}} {{agioTotalFmt}} ' +
        '({{waehrungCode}} {{agioJeAktieFmt}} je Aktie) vollständig in Geld geleistet und gleichermassen ' +
        'zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { feld: 'hatAgioTeilBar', eq: true },
      norm: 'Art. 632 Abs. 1 OR',
      begruendung: 'Haus-Fassung (offengelegt): Die ZH-Muster decken Agio mit Teilliberierung nicht. Das Agio ist bei der Ausgabe VOLL zu leisten — teilliberierbar ist nur der Nennwert-Teil (Art. 632 Abs. 1 OR bezieht die 20 % auf den Nennwert jeder Aktie); die vorstehende Einlagen-Ziffer nennt darum nur den Nennwert-Teil, dieser Absatz weist das voll geleistete Agio aus.',
      hinweis: 'Der über Nennwert und Ausgabekosten hinaus erzielte Erlös (Agio) ist der gesetzlichen Kapitalreserve zuzuweisen (Art. 671 Abs. 1 Ziff. 1 OR, am Cache verifiziert).',
    },
    {
      id: 'AE07w_kurs',
      text:
        'Die geleisteten Einlagen entsprechen, aufgrund des Umrechnungskurses per {{waehrungCode}} 1.00 = ' +
        'CHF {{kursTxt}}, dem Betrag von CHF {{einbezahltChfFmt}}. Dieser Umrechnungskurs entspricht dem ' +
        'Devisenmittelkurs der {{kursQuelleTxt}}.',
      includeIf: { feld: 'fremdwaehrungAktiv', eq: true },
      norm: 'Art. 629 Abs. 3 OR',
      begruendung: 'Pflicht-Kurs-Satz der Fremdwährungs-Gründung nach ZH-Urkundenvorlage 3.2 verbatim — inkl. «per» (Bug-Check 3.1 Befund 1; Art. 629 Abs. 3 OR: angewandte Umrechnungskurse sind in der Urkunde anzugeben). Basis des CHF-Gegenwerts: geleistete Einlagen GESAMT (Nennwert-Teil + voll geleistetes Agio). Einlage-/Bewertungswährung = Kapitalwährung — gilt auch für Sacheinlagen, Verrechnungen und Vorteile (Stufe 2 P1a); Einlagen in einer DRITTEN Währung bleiben ausgeklammert.',
    },
    // ── Etappe 2: Einlagen bei gemischter und qualifizierter Gründung ───────
    {
      id: 'AE07g_geld_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} in Geld ' +
        'geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: false }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 633 OR',
      begruendung: 'Bar-Anteil der gemischten Gründung, voll liberiert (ZH-Bemerkung 3.3: Varianten «mit Ziff. IV der Textvorlage 3.1 kombinierbar»); Banknennung in der Urkunde. Stufe 2: Währungscode = Kapitalwährung.',
    },
    {
      id: 'AE07g_geld_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} in Geld ' +
        'geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: false }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 633 OR',
      begruendung: 'Bar-Anteil der gemischten Gründung (voll liberiert) mit separater Bankbescheinigung.',
    },
    // ── Stufe 2 P1d: gemischte TEILLIBERIERUNG — Bar-Teil zum globalen Grad,
    // Sach-/Verrechnungsaktien gelten als voll liberiert ──
    {
      id: 'AE07g_geld_teil_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} ' +
        '({{liberierungProzent}} % des Nennwerts jeder dieser Aktien) in Geld geleistet und bei der ' +
        '{{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über die Banken und ' +
        'Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt. Die Aktien aus ' +
        'Sacheinlage und Verrechnung gelten als voll liberiert.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 632 OR',
      begruendung: 'Haus-Fassung (offengelegt): Die ZH-Muster kombinieren Teilliberierung und qualifizierte Einlagen nicht in einem Text. Teilliberierbar ist nur der Bar-Anteil (globaler Grad, mind. 20 % je Aktie, Art. 632 Abs. 1 OR); Aktien aus Sacheinlage/Verrechnung gelten als voll liberiert (ZH-Vertragsvorlage «als voll liberiert geltende Aktien») — der Urkunden-Text trennt beides ausdrücklich.',
    },
    {
      id: 'AE07g_geld_teil_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} {{aktienArt}} wurden Einlagen von gesamthaft {{waehrungCode}} {{barEinlageFmt}} ' +
        '({{liberierungProzent}} % des Nennwerts jeder dieser Aktien) in Geld geleistet und gemäss separater ' +
        'Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ' +
        'ausschliesslichen Verfügung der Gesellschaft hinterlegt. Die Aktien aus Sacheinlage und ' +
        'Verrechnung gelten als voll liberiert.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'gemischtTeilBar', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 632 OR',
      begruendung: 'Gemischte Teilliberierung mit separater Bankbescheinigung (Haus-Fassung wie die Bank-Variante).',
    },
    // ── Stufe 2 P1b/P1c: Agio bei gemischter/qualifizierter Gründung ────────
    {
      id: 'AE07gx_agio_gemischt',
      text:
        'Zusätzlich wurde auf den in Geld liberierten Aktien das Ausgabeagio von gesamthaft ' +
        '{{waehrungCode}} {{barAgioFmt}} ({{waehrungCode}} {{agioJeAktieFmt}} je Aktie) vollständig in Geld ' +
        'geleistet und gleichermassen hinterlegt; das Ausgabeagio der übrigen Aktien ist durch die ' +
        'angerechneten Sacheinlagen bzw. Verrechnungsforderungen gedeckt.',
      includeIf: { feld: 'hatAgioGemischt', eq: true },
      norm: 'Art. 629 Abs. 2 Ziff. 2 OR',
      begruendung: 'Haus-Fassung (offengelegt): Bei gemischter Gründung mit Agio wird das Agio der Bar-Aktien voll in Geld geleistet; bei den Sach-/Verrechnungsaktien deckt die Bewertung bzw. Forderung den GESAMTEN Ausgabebetrag (Wert-Gates rechnen Aktien × Ausgabebetrag, Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Der über Nennwert und Ausgabekosten hinaus erzielte Erlös (Agio) ist der gesetzlichen Kapitalreserve zuzuweisen (Art. 671 Abs. 1 Ziff. 1 OR, am Cache verifiziert).',
    },
    {
      id: 'AE07qx_agio_qualifiziert',
      text:
        'Das Ausgabeagio ist durch die angerechneten Sacheinlagen bzw. Verrechnungsforderungen gedeckt: ' +
        'Die Bewertung bzw. die zur Verrechnung gebrachte Forderung deckt den gesamten Ausgabebetrag der ' +
        'dafür ausgegebenen Aktien.',
      includeIf: { feld: 'hatAgioQualifiziertRein', eq: true },
      norm: 'Art. 629 Abs. 2 Ziff. 2 OR',
      begruendung: 'Haus-Fassung (offengelegt): Bei reiner Sach-/Verrechnungsgründung mit Agio fliesst kein Geld — die versprochenen Einlagen entsprechen dem gesamten Ausgabebetrag, weil die Wert-Gates je Position Aktien × Ausgabebetrag (+ Gutschrift) verlangen (Art. 629 Abs. 2 Ziff. 2 OR).',
      hinweis: 'Der über Nennwert und Ausgabekosten hinaus erzielte Erlös (Agio) ist der gesetzlichen Kapitalreserve zuzuweisen (Art. 671 Abs. 1 Ziff. 1 OR, am Cache verifiziert).',
    },
    {
      id: 'AE07q_intro_mit_titel',
      ueberschrift: 'Einlagen',
      text: '{{qualifiziertIntro}}',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'hatBarEinlage', eq: false }] },
      norm: 'Art. 629 Abs. 2 Ziff. 4 OR',
      begruendung: 'Einleitung des qualifizierten Einlagen-Blocks nach ZH-Urkunde 3.3 («Die in den Statuten angegebenen Sacheinlagen gemäss folgenden, uns vorliegenden Unterlagen» — Haus-Fassung ohne «uns», dritte Person); trägt die Abschnitts-Überschrift, wenn kein Bar-Absatz vorangeht.',
    },
    {
      id: 'AE07q_intro',
      text: '{{qualifiziertIntro}}',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'hatBarEinlage', eq: true }] },
      norm: 'Art. 629 Abs. 2 Ziff. 4 OR',
      begruendung: 'Einleitung des qualifizierten Einlagen-Blocks (gemischte Gründung — folgt dem Bar-Absatz unter derselben Ziffer).',
    },
    {
      id: 'AE07q_sachliste',
      text:
        '– Sacheinlagevertrag vom {{item.vertragDatumFmt}} mit {{item.einleger}} über {{item.objektLabel}} ' +
        '({{item.belegSatz}}; Bewertung {{waehrungCode}} {{item.wertFmt}} für {{item.aktien}} {{aktienArt}}{{item.gutschriftKlauselSatz}}), ' +
        'welcher genehmigt wird, mit der Bestätigung, dass die Gesellschaft nach ihrer Eintragung in das ' +
        'Handelsregister {{item.verfuegungsSatz}}.',
      wiederholeUeber: 'sachListe',
      includeIf: { feld: 'hatSacheinlagen', eq: true },
      norm: 'Art. 634 OR',
      begruendung: 'Je Sacheinlage eine Beleg-Zeile nach ZH-Urkunde 3.3 inkl. Grundstücks-Weiche (Art. 634 Abs. 1 Ziff. 3 OR: «sofort als Eigentümerin verfügen» vs. «bedingungsloser Anspruch auf Eintragung in das Grundbuch»).',
    },
    {
      id: 'AE07q_verrliste',
      text:
        '– Verrechnungsliberierung: {{item.aktien}} {{aktienArt}} werden durch Verrechnung mit einer ' +
        'Forderung von {{item.glaeubiger}} im Betrag von {{waehrungCode}} {{item.forderungFmt}} liberiert (Art. 634a OR).',
      wiederholeUeber: 'verrListe',
      includeIf: { feld: 'hatVerrechnungen', eq: true },
      norm: 'Art. 634a OR',
      begruendung: 'Je Verrechnungsliberierung eine Zeile — Haus-Fassung (die ZH-Vorlage kennt die Verrechnung nur in der Geschäftsübernahme-Variante; die generische Fassung deckt Art. 634a Abs. 1 OR, Bestand/Verrechenbarkeit belegt der Gründungsbericht, Art. 635 Ziff. 2 OR).',
    },
    {
      id: 'AE07q_vorteile',
      text: 'Ferner werden bei der Gründung die in den Statuten umschriebenen besonderen Vorteile gewährt.',
      includeIf: { feld: 'hatVorteile', eq: true },
      norm: 'Art. 636 OR',
      begruendung: 'Zusatz-Variante besondere Vorteile nach ZH-Urkunde 3.3.',
    },
    {
      id: 'AE07q_bericht',
      text:
        '– Gründungsbericht gemäss Art. 635 OR vom ________, von allen Gründerinnen und Gründern unterzeichnet.\n' +
        '– Prüfungsbestätigung gemäss Art. 635a OR vom ________ der zugelassenen Revisorin bzw. des zugelassenen ' +
        'Revisors {{revisorZeile}}, wonach der Gründungsbericht vollständig und richtig ist.',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 635a OR',
      begruendung: 'EINE Bericht- und Prüfungs-Zeile für alle Tatbestände (ZH-Bemerkung 3.3 erlaubt die Zusammenfassung ausdrücklich: «Werden mehrere Sachverhalte im gleichen Gründungsbericht … dargestellt, so ist der Varianten-Text entsprechend anzupassen»). Zugelassener REVISOR genügt (Art. 635a OR — Dossier: ZH-Checklisten-«Revisionsunternehmen» ist enger als das Gesetz).',
    },
    {
      id: 'AE07q_bericht_singular',
      text:
        '– Gründungsbericht gemäss Art. 635 OR vom ________, von der Gründerin bzw. dem Gründer unterzeichnet.\n' +
        '– Prüfungsbestätigung gemäss Art. 635a OR vom ________ der zugelassenen Revisorin bzw. des zugelassenen ' +
        'Revisors {{revisorZeile}}, wonach der Gründungsbericht vollständig und richtig ist.',
      includeIf: { and: [{ feld: 'hatQualifiziert', eq: true }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 635a OR',
      begruendung: 'Bericht-/Prüfungs-Zeile im Singular (D1).',
    },
    {
      id: 'AE07c_resteinlage',
      text:
        'Jede Gründerin und jeder Gründer verpflichtet sich, auf erstes Verlangen des Verwaltungsrates ' +
        'die restliche und vollständige Leistung der eigenen Einlage im Sinne von Art. 634b OR sofort zu erbringen.',
      includeIf: { and: [{ feld: 'vollLiberiert', eq: false }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 634b OR',
      begruendung: 'Resteinlage-Verpflichtungssatz der ZH-Urkunde verbatim (D6/0.3 — ersetzt die frühere Haus-Formulierung «sobald er es für nötig erachtet»). Norm-Gehalt: Art. 634b Abs. 1 OR lässt den VR die NACHTRÄGLICHE LEISTUNG BESCHLIESSEN; das «erste Verlangen» ist die vertragliche Verpflichtungsseite des Musters (Bug-Check-Befund 2, 7.6.2026).',
    },
    {
      id: 'AE07c_resteinlage_singular',
      text:
        'Die Gründerin bzw. der Gründer verpflichtet sich, auf erstes Verlangen des Verwaltungsrates ' +
        'die restliche und vollständige Leistung der Einlage im Sinne von Art. 634b OR sofort zu erbringen.',
      includeIf: { and: [{ feld: 'vollLiberiert', eq: false }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 634b OR',
      begruendung: 'Resteinlage-Verpflichtungssatz im Singular (D1/D6; ZH-Vorlage 3.5).',
    },
    {
      id: 'AE08_feststellungen',
      ueberschrift: 'Feststellungen',
      text:
        'Die Gründerinnen und Gründer stellen fest, dass:\n' +
        '– sämtliche Aktien gültig gezeichnet sind;\n' +
        '– die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen;\n' +
        '– die gesetzlichen und statutarischen Anforderungen an die geleisteten Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;\n' +
        '– keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 629 Abs. 2 OR',
      begruendung: 'Gesetzliche Feststellungen Ziff. 1–4 – Wortlaut der Norm folgend (ZH-Urkunde identisch).',
    },
    {
      id: 'AE08_feststellungen_singular',
      ueberschrift: 'Feststellungen',
      text:
        'Die Gründerin bzw. der Gründer stellt fest, dass:\n' +
        '– sämtliche Aktien gültig gezeichnet sind;\n' +
        '– die versprochenen Einlagen dem gesamten Ausgabebetrag entsprechen;\n' +
        '– die gesetzlichen und statutarischen Anforderungen an die geleisteten Einlagen im Zeitpunkt der Unterzeichnung des Errichtungsakts erfüllt sind;\n' +
        '– keine anderen Sacheinlagen, Verrechnungstatbestände oder besonderen Vorteile bestehen, als die in den Belegen genannten.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 629 Abs. 2 OR',
      begruendung: 'Feststellungen im Singular (D1; ZH-Vorlage 3.5: «Ich stelle fest, dass …» — Haus-Fassung in der dritten Person).',
    },
    {
      id: 'AE09_organbestellung',
      ueberschrift: 'Organe',
      text: 'Als Mitglieder des Verwaltungsrates werden gewählt:',
      includeIf: { feld: 'einVr', eq: false },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Organbestellung in der Urkunde; Personenangaben nach Art. 44 lit. e HRegV.',
    },
    {
      id: 'AE09_organbestellung_singular',
      ueberschrift: 'Organe',
      text: 'Als Mitglied des Verwaltungsrates wird gewählt:',
      includeIf: { feld: 'einVr', eq: true },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Organbestellung im Singular bei eingliedrigem Verwaltungsrat (Numerus-Korrektur analog D1).',
    },
    {
      id: 'AE09b_vrliste',
      text: '– {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}{{item.praesidentZeile}}{{item.wahlannahmeSatz}}',
      wiederholeUeber: 'vrListe',
      begruendung: 'Je VR-Mitglied eine Zeile; Wahl-Zusatz «welche bzw. welcher hiermit die Annahme erklärt» nach der ZH-Erläuterung zu Ziff. VI, wenn die Annahme in der Urkunde erfolgt (Etappe 4.1/D8 — die separate Wahlannahmeerklärung ist dann entbehrlich, Art. 43 Abs. 1 lit. c HRegV).',
      norm: 'Art. 44 lit. e HRegV',
    },
    {
      id: 'AE10_revisionsstelle',
      text: 'Als Revisionsstelle wird gewählt: {{revisionsstelleName}}, {{revisionsstelleSitz}}.',
      includeIf: { feld: 'optingOut', eq: false },
      norm: 'Art. 44 lit. f HRegV',
      begruendung: 'Aufgenommen, weil eine Revisionsstelle bestellt wird.',
    },
    {
      id: 'AE11_opting_out',
      text:
        'Auf eine Revision wird verzichtet. Die Gründerinnen und Gründer stellen fest, dass:\n' +
        '– die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;\n' +
        '– die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;\n' +
        '– sämtliche Gründerinnen und Gründer auf eine eingeschränkte Revision verzichten.',
      includeIf: { and: [{ feld: 'optingOut', eq: true }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 727a Abs. 2 OR',
      begruendung: 'Opting-out bei der Gründung: dreigliedrige Feststellung direkt in der Urkunde (Art. 44 lit. f HRegV; ZH-KMU-Merkblatt und SG-Formular wortgleich).',
    },
    {
      id: 'AE11_opting_out_singular',
      text:
        'Auf eine Revision wird verzichtet. Die Gründerin bzw. der Gründer stellt fest, dass:\n' +
        '– die Gesellschaft die Voraussetzungen für die Pflicht zur ordentlichen Revision nicht erfüllt;\n' +
        '– die Gesellschaft nicht mehr als zehn Vollzeitstellen im Jahresdurchschnitt hat;\n' +
        '– die Gründerin bzw. der Gründer als einzige Aktionärin bzw. einziger Aktionär auf eine eingeschränkte Revision verzichtet.',
      includeIf: { and: [{ feld: 'optingOut', eq: true }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 727a Abs. 2 OR',
      begruendung: 'Opting-out im Singular (D1; ZH-Vorlage 3.5). Bug-Check-Befund 1 (7.6.2026): Art. 62 Abs. 1 lit. c HRegV verlangt die Erklärung, dass SÄMTLICHE Aktionärinnen und Aktionäre verzichtet haben — der Verzichtsträger bleibt darum auch im Singular ausdrücklich benannt («als einzige Aktionärin bzw. einziger Aktionär»), kein subjektloses Passiv.',
    },
    {
      id: 'AE12_domizil_eigen',
      ueberschrift: 'Rechtsdomizil',
      text: 'Das Rechtsdomizil der Gesellschaft befindet sich an folgender Adresse: {{rechtsdomizilAdresse}}.',
      includeIf: { and: [{ feld: 'domizilImDomizilArtikel', eq: true }, { feld: 'eigeneBueros', eq: true }] },
      norm: 'Art. 117 Abs. 2 HRegV',
      begruendung: 'Eigene Adresse am Sitz; die Ziffer entfällt, wenn das Domizil in der Konstituierungs-Ziffer steht oder weggelassen wird (ZH-Erläuterung zu Ziff. VII: Domizil kann in der Urkunde weggelassen werden, muss aber in der Anmeldung stehen — Etappe 4.2/D9).',
    },
    {
      id: 'AE12_domizil_co',
      ueberschrift: 'Rechtsdomizil',
      text:
        'Die Gesellschaft hat ihr Rechtsdomizil als c/o-Adresse bei {{domizilhalterName}}, ' +
        '{{domizilhalterAdresse}}. Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.',
      includeIf: { and: [{ feld: 'domizilImDomizilArtikel', eq: true }, { feld: 'eigeneBueros', eq: false }] },
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'c/o-Domizil mit Domizilannahmeerklärung als Beleg (Art. 43 Abs. 1 lit. g HRegV); Ziffer entfällt analog AE12_domizil_eigen (Etappe 4.2/D9).',
    },
    // ── Etappe 4.2/D9: Konstituierung + Domizil in der Urkunde (ZH Ziff. VII) ──
    {
      id: 'AE12k_konstituierung',
      ueberschrift: 'Konstituierung und Zeichnungsberechtigung',
      text:
        'Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist, erklären die soeben ' +
        'ernannten Mitglieder des Verwaltungsrates:',
      includeIf: { and: [{ feld: 'konstituierungInUrkunde', eq: true }, { feld: 'einVr', eq: false }] },
      norm: 'Art. 712 OR',
      begruendung: 'ZH-Urkunde Ziff. VII mit der Vollzähligkeits-Bedingung («[Variante: Unter der Bedingung, dass der Verwaltungsrat vollzählig anwesend ist]»). Haus-Abweichung (offengelegt): «die soeben ernannten Mitglieder des Verwaltungsrates» statt ZH «die soeben als Verwaltungsräte ernannten Gründer» — die Maske erlaubt VR-Mitglieder, die nicht Gründer sind. Das separate VR-Protokoll ist damit entbehrlich (Art. 43 Abs. 1 lit. e HRegV — die Konstituierung ist aus der Urkunde ersichtlich).',
    },
    {
      id: 'AE12k_konstituierung_singular',
      ueberschrift: 'Konstituierung und Zeichnungsberechtigung',
      text: 'Das soeben ernannte einzige Mitglied des Verwaltungsrates erklärt:',
      includeIf: { and: [{ feld: 'konstituierungInUrkunde', eq: true }, { feld: 'einVr', eq: true }] },
      norm: 'Art. 712 OR',
      begruendung: 'Konstituierungs-Ziffer im Singular (eingliedriger VR — die Vollzähligkeits-Bedingung ist trivial erfüllt; D1-Numerus).',
    },
    {
      id: 'AE12k_liste',
      text: '– {{item.konstituierungZeile}}',
      wiederholeUeber: 'vrListe',
      includeIf: { feld: 'konstituierungInUrkunde', eq: true },
      norm: 'Art. 718 OR',
      begruendung: 'Je VR-Mitglied eine Zeile nach ZH Ziff. VII lit. a («… ist … mit … [Art der Zeichnungsberechtigung]»).',
    },
    {
      id: 'AE12k_domizil_eigen',
      text: 'Das Rechtsdomizil befindet sich an folgender Adresse: {{rechtsdomizilAdresse}} (eigene Geschäftsräume).',
      includeIf: { and: [{ feld: 'domizilInKonstituierung', eq: true }, { feld: 'eigeneBueros', eq: true }] },
      norm: 'Art. 117 Abs. 2 HRegV',
      begruendung: 'ZH Ziff. VII lit. b («Das Domizil befindet sich … mit Hinweis auf eigene Geschäftsräume oder auf die Erklärung des Domizilhalters»).',
    },
    {
      id: 'AE12k_domizil_co',
      text:
        'Das Rechtsdomizil befindet sich als c/o-Adresse bei {{domizilhalterName}}, {{domizilhalterAdresse}}. ' +
        'Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.',
      includeIf: { and: [{ feld: 'domizilInKonstituierung', eq: true }, { feld: 'eigeneBueros', eq: false }] },
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'ZH Ziff. VII lit. b, c/o-Fall («Eine allenfalls vorliegende Domizilhaltererklärung ist in der Urkunde zu nennen»).',
    },
    {
      id: 'AE13_nachtragsvollmacht',
      ueberschrift: 'Vollmacht',
      text:
        'Die Gründerinnen und Gründer bevollmächtigen {{nachtragsbevollmaechtigter}}, allfällige wegen ' +
        'Beanstandung durch die Handelsregisterbehörde erforderliche Änderungen an den Statuten oder am ' +
        'Errichtungsakt durch einen öffentlich zu beurkundenden Nachtrag namens aller Gründerinnen und ' +
        'Gründer vorzunehmen.',
      includeIf: { and: [{ feld: 'hatNachtragsvollmacht', eq: true }, { feld: 'einGruender', eq: false }] },
      norm: 'Art. 44 HRegV',
      begruendung: 'Aufgenommen, weil eine Nachtrags-Bevollmächtigung gewünscht ist (D10: ZH-Klausel «Auf Verlangen der Gründer» — eine benannte Person mit vollen Personalien: Vorname, Name, Geburtsdatum, Bürgerort bzw. Staatsangehörigkeit, Wohnadresse).',
    },
    {
      id: 'AE13_nachtragsvollmacht_singular',
      ueberschrift: 'Vollmacht',
      text:
        'Die Gründerin bzw. der Gründer bevollmächtigt {{nachtragsbevollmaechtigter}}, allfällige wegen ' +
        'Beanstandung durch die Handelsregisterbehörde erforderliche Änderungen an den Statuten oder am ' +
        'Errichtungsakt durch einen öffentlich zu beurkundenden Nachtrag in ihrem bzw. seinem Namen ' +
        'vorzunehmen.',
      includeIf: { and: [{ feld: 'hatNachtragsvollmacht', eq: true }, { feld: 'einGruender', eq: true }] },
      norm: 'Art. 44 HRegV',
      begruendung: 'Nachtragsvollmacht im Singular (D1/D10).',
    },
    {
      id: 'AE14_gruendungserklaerung',
      ueberschrift: 'Gründungserklärung',
      text: 'Abschliessend erklären die erschienenen Personen die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet.',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Abschliessende Gründungserklärung (ZH-Vorlage wortgleich).',
    },
    {
      id: 'AE14_gruendungserklaerung_singular',
      ueberschrift: 'Gründungserklärung',
      text: 'Abschliessend erklärt die erschienene Person die Gesellschaft den gesetzlichen Vorschriften entsprechend als gegründet.',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 629 Abs. 1 OR',
      begruendung: 'Abschliessende Gründungserklärung im Singular (D1; ZH-Vorlage 3.5: «erkläre ich» — Haus-Fassung dritte Person).',
    },
    {
      id: 'AE15_belege',
      ueberschrift: 'Bestätigung der Urkundsperson',
      text:
        'Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und ' +
        'den Gründerinnen und Gründern vorgelegen haben (Art. 631 Abs. 1 OR):',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 631 OR',
      begruendung: 'Beleg-Nennung und Vorlage-Bestätigung durch die Urkundsperson.',
    },
    {
      id: 'AE15_belege_singular',
      ueberschrift: 'Bestätigung der Urkundsperson',
      text:
        'Die Urkundsperson nennt die Belege über die Gründung einzeln und bestätigt, dass diese ihr und ' +
        'der Gründerin bzw. dem Gründer vorgelegen haben (Art. 631 Abs. 1 OR):',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 631 OR',
      begruendung: 'Vorlage-Bestätigung im Singular (D1; ZH-Vorlage 3.5: «… dass ihr und dem Gründer bzw. dessen Vertreter … vorgelegen haben»).',
    },
    {
      id: 'AE15b_belegliste',
      text: '– {{item.titel}}',
      wiederholeUeber: 'belegeListe',
      begruendung: 'Je Beleg eine Zeile (Art. 631 Abs. 2 OR; bei der Bargründung: Statuten und – sofern die Bank nicht in der Urkunde genannt ist – die Hinterlegungs-Bestätigung).',
      norm: 'Art. 631 Abs. 2 OR',
    },
    {
      id: 'AE16_unterschriften',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'Unterschriften der Gründerinnen und Gründer (Art. 44 lit. i HRegV).',
      norm: 'Art. 44 lit. i HRegV',
    },
    {
      id: 'AE16_unterschriften_singular',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerin bzw. der Gründer:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Unterschrift im Singular (D1).',
      norm: 'Art. 44 lit. i HRegV',
    },
    {
      id: 'AE16b_unterschriftenliste',
      rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
      norm: 'Art. 44 lit. i HRegV',
    },
    {
      id: 'AE17_urkundsperson',
      rolle: 'unterschrift',
      text: 'Die Urkundsperson:\n\n_________________________________',
      begruendung: 'Beurkundungsvermerk – wird von der Urkundsperson nach kantonalem Beurkundungsrecht ergänzt.',
    },
  ],
};

// ── 3 · WAHLANNAHME VR (fertig; ZH verbatim) ────────────────────────────────

const WAHLANNAHME_SCHEMA: VorlageSchema = {
  id: 'ag-wahlannahme',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Wahlannahmeerklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); ' +
    'entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die gewählte Person ' +
    'die Handelsregister-Anmeldung selbst unterzeichnet (Praxis ZH/LU/BE).',
  bausteine: [
    { id: 'AW01_absender', rolle: 'absender', text: '{{personName}}\n{{personAdresse}}', begruendung: 'Absenderin/Absender ist die gewählte Person.' },
    { id: 'AW02_adressat', rolle: 'adressat', text: '{{firma}}\n{{zuHandenZeile}}\n{{sitz}}', begruendung: 'Adressatin ist die Gesellschaft (in Gründung); z.-H.-Zeile im passenden Numerus (D1).' },
    { id: 'AW03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AW04_betreff', rolle: 'betreff', text: 'Wahlannahmeerklärung', begruendung: 'Betreff nach amtlicher ZH-Vorlage.' },
    { id: 'AW05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach amtlicher ZH-Vorlage.' },
    {
      id: 'AW06_text',
      text: 'Gerne bestätige ich Ihnen, dass ich die Wahl als Mitglied des Verwaltungsrates der {{firma}}, in {{sitz}}, annehme.',
      norm: 'Art. 43 Abs. 1 lit. c HRegV',
      begruendung: 'Annahme-Kernsatz – verbatim nach der amtlichen ZH-Vorlage (ag_vorlage_wahlannahme_vr).',
    },
    { id: 'AW07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlage.' },
    { id: 'AW08_unterschrift', rolle: 'unterschrift', text: '_________________________________\n{{personName}}', begruendung: 'Original-Unterschrift der gewählten Person.' },
  ],
};

// ── 3b · WAHLANNAHME REVISIONSSTELLE (fertig; Beleg lit. d) ─────────────────

const WAHLANNAHME_RS_SCHEMA: VorlageSchema = {
  id: 'ag-wahlannahme-rs',
  version: '1.0.0 (Haus-Fassung analog ZH-VR-Vorlage; Original-Suite 7.6.2026)',
  titel: 'Wahlannahmeerklärung der Revisionsstelle',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Im Original einzureichen (Art. 20 HRegV); ' +
    'entbehrlich, wenn die Annahme in der öffentlichen Urkunde erklärt wird oder die Revisionsstelle ' +
    'die Handelsregister-Anmeldung mitunterzeichnet (Merkblatt HRegA ZH).',
  bausteine: [
    { id: 'AR01_absender', rolle: 'absender', text: '{{revisionsstelleName}}\n{{revisionsstelleSitz}}', begruendung: 'Absenderin ist die gewählte Revisionsstelle.' },
    { id: 'AR02_adressat', rolle: 'adressat', text: '{{firma}}\n{{zuHandenZeile}}\n{{sitz}}', begruendung: 'Adressatin ist die Gesellschaft (in Gründung).' },
    { id: 'AR03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AR04_betreff', rolle: 'betreff', text: 'Wahlannahmeerklärung', begruendung: 'Betreff analog der amtlichen ZH-Vorlage für VR-Mitglieder.' },
    { id: 'AR05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach ZH-Vorlagen-Anatomie.' },
    {
      id: 'AR06_text',
      text: 'Gerne bestätigen wir Ihnen, dass wir die Wahl als Revisionsstelle der {{firma}}, in {{sitz}}, annehmen.',
      norm: 'Art. 43 Abs. 1 lit. d HRegV',
      begruendung: 'Annahme-Kernsatz analog der amtlichen ZH-VR-Vorlage (0.6/D15); wir-Form, da die Revisionsstelle regelmässig eine juristische Person ist (Haus-Fassung, offengelegt).',
    },
    { id: 'AR07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlagen-Anatomie.' },
    { id: 'AR08_unterschrift', rolle: 'unterschrift', text: '_________________________________\n{{revisionsstelleName}}', begruendung: 'Unterschrift der Revisionsstelle (zeichnungsberechtigte Person).' },
  ],
};

// ── 4 · DOMIZILANNAHME (fertig) ─────────────────────────────────────────────

const DOMIZILANNAHME_SCHEMA: VorlageSchema = {
  id: 'ag-domizilannahme',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Domizilannahmeerklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Erklärung der Domizilhalterin / des Domizilhalters ' +
    'nach Art. 117 Abs. 3 HRegV; im Original mit der Anmeldung einzureichen (Art. 43 Abs. 1 lit. g HRegV).',
  bausteine: [
    { id: 'AD01_absender', rolle: 'absender', text: '{{domizilhalterName}}\n{{domizilhalterAdresse}}', begruendung: 'Absender ist die Domizilhalterin / der Domizilhalter.' },
    { id: 'AD02_adressat', rolle: 'adressat', text: '{{firma}}\nc/o {{domizilhalterName}}\n{{domizilhalterAdresse}}', begruendung: 'Adressatin ist die Gesellschaft an der c/o-Adresse.' },
    { id: 'AD03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AD04_betreff', rolle: 'betreff', text: 'Domizilannahmeerklärung', begruendung: 'Betreff nach amtlicher ZH-Vorlage.' },
    { id: 'AD05_anrede', rolle: 'anrede', text: 'Sehr geehrte Damen und Herren', begruendung: 'Anrede nach amtlicher ZH-Vorlage.' },
    {
      id: 'AD06_text',
      text: 'Gerne bestätigen wir Ihnen, dass wir der {{firma}}, mit Sitz in {{sitz}}, an unserer Adresse ({{domizilhalterAdresse}}) Domizil gewähren.',
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'Kernsatz nach den amtlichen ZH-Vorlagen (AG-Fassung sagt «Sitz gewähren» – Haus-Fassung einheitlich «Domizil», deckt Art. 117 Abs. 3 HRegV; Abweichung offengelegt).',
    },
    { id: 'AD07_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen', begruendung: 'Schlussformel nach ZH-Vorlage.' },
    { id: 'AD08_unterschrift', rolle: 'unterschrift', text: '_________________________________\n{{domizilhalterName}}', begruendung: 'Unterschrift der Domizilhalterin / des Domizilhalters.' },
  ],
};

// ── 5 · VR-KONSTITUIERUNGSPROTOKOLL (fertig; Pflichtbeleg lit. e) ───────────

const VR_PROTOKOLL_SCHEMA: VorlageSchema = {
  id: 'ag-vr-protokoll',
  version: '1.0.0 (ZH-Vorlage 26.7.2024; Wortlaut-Dossier 7.6.2026)',
  titel: 'Protokoll des Verwaltungsrates (Konstituierung)',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Pflichtbeleg der AG-Gründung (Art. 43 Abs. 1 ' +
    'lit. e HRegV): Konstituierung, Vorsitz und Zeichnungsbefugnisse. Unterschriften von Vorsitz und ' +
    'Protokollführung (Art. 23 Abs. 2 HRegV); entbehrlich, wenn sämtliche VR-Mitglieder die Anmeldung ' +
    'unterzeichnen (Art. 23 Abs. 3 HRegV).',
  bausteine: [
    {
      id: 'VP01_ingress',
      text: 'der {{firma}}, mit Sitz in {{sitz}}\n\nDatum: {{datumZeile}}\nBeginn der Sitzung: {{sitzungBeginnZeile}}\nOrt: {{ort}}\nAnwesend: sämtliche Mitglieder des Verwaltungsrates\nAbwesend: keine\nVorsitz: {{praesidentName}}\nProtokoll: {{protokollName}}',
      begruendung: 'Protokoll-Kopf nach der amtlichen ZH-Vorlage (ag_vorlage_protokoll_vr; Zeilen-Reihenfolge Datum→Beginn→Ort wie das Original — Bug-Check-Befund 3); Mindestelemente der Praxis zu Art. 23 HRegV (Beginn der Sitzung, Anwesenheits-/Abwesenheits-Feststellung — Merkblatt «Formelle Anforderungen an Handelsregisterbelege», 7.1.2025; D13).',
      norm: 'Art. 43 Abs. 1 lit. e HRegV',
    },
    {
      id: 'VP02_eroeffnung',
      ueberschrift: 'Eröffnung der Sitzung und Feststellung der Beschlussfähigkeit',
      text:
        '{{praesidentName}} eröffnet die Sitzung und übernimmt den Vorsitz. {{protokollName}} amtet als ' +
        'Protokollführer/in. Der Vorsitzende stellt fest, dass der Verwaltungsrat in beschlussfähiger ' +
        'Anzahl anwesend ist. Gegen diese Feststellungen wird kein Widerspruch erhoben. Der ' +
        'Verwaltungsrat beschliesst:',
      begruendung: 'Eröffnungs-Passus nach der amtlichen ZH-Vorlage. Haus-Abweichung (offengelegt): Der ZH-Einladungs-Feststellungssatz («Einladung gemäss den statutarischen Vorschriften fristgerecht») entfällt — bei der Konstituierungs-Sitzung unmittelbar nach der Gründung sind sämtliche Mitglieder anwesend (Kopf-Feststellung), womit Einberufungsmängel nach herrschender Auffassung unbeachtlich sind.',
      norm: 'Art. 713 OR',
    },
    {
      id: 'VP03_konstituierung',
      ueberschrift: 'Konstituierung und Zeichnungsberechtigung',
      text: 'Der Verwaltungsrat konstituiert sich und erteilt seinen Mitgliedern Zeichnungsberechtigungen wie folgt:',
      nummeriert: true,
      norm: 'Art. 712 OR',
      begruendung: 'Selbstkonstituierung des VR (Präsidentenwahl bei mehrgliedrigem VR zwingend, Art. 712 Abs. 2 OR); Zeichnungsbefugnisse als Eintragungsinhalt.',
    },
    {
      id: 'VP03b_vrliste',
      text: '– {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}: {{item.funktion}}, {{item.zeichnung}}',
      wiederholeUeber: 'vrListe',
      begruendung: 'Je VR-Mitglied eine Zeile (Funktion + Zeichnungsart, ZH-Vorlagen-Struktur).',
      norm: 'Art. 718 OR',
    },
    {
      id: 'VP04_weitere',
      ueberschrift: 'Erteilung von weiteren Zeichnungsberechtigungen',
      text: 'Weitere Zeichnungsberechtigungen werden erteilt:',
      includeIf: { feld: 'hatWeitereVertretungen', eq: true },
      nummeriert: true,
      norm: 'Art. 716a Abs. 1 Ziff. 4 OR',
      begruendung: 'Aufgenommen, weil weitere Vertretungsberechtigte (Direktion/Prokura) ernannt werden.',
    },
    {
      id: 'VP04b_liste',
      text: '– {{item.name}}, als {{item.funktion}}, mit {{item.zeichnung}}',
      includeIf: { feld: 'hatWeitereVertretungen', eq: true },
      wiederholeUeber: 'vertretungsListe',
      begruendung: 'Je ernannte Person eine Zeile.',
      norm: 'Art. 718 Abs. 2 OR',
    },
    {
      id: 'VP04c_ende',
      text: 'Ende der Sitzung: {{sitzungEndeZeile}}',
      begruendung: 'Schluss-Zeile nach der amtlichen ZH-Vorlage; Mindestelement «Datum, Beginn und Ende der Sitzung» (Merkblatt 7.1.2025; D13).',
    },
    {
      id: 'VP05_unterschriften', rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\n_________________________________\n{{praesidentName}} (Vorsitz)\n\n_________________________________\n{{protokollName}} (Protokoll)',
      begruendung: 'Unterschriften von Vorsitz und Protokollführung (Art. 23 Abs. 2 HRegV); für die HR-Einreichung Unterschriften der Vertretungsberechtigten amtlich beglaubigt (Praxis ZH).',
      norm: 'Art. 23 Abs. 2 HRegV',
    },
  ],
};

// ── 6 · HR-ANMELDUNG (fertig) ───────────────────────────────────────────────

const ANMELDUNG_SCHEMA: VorlageSchema = {
  id: 'ag-hr-anmeldung',
  version: '1.0.0 (ZH-Formular-Struktur; Wortlaut-Dossier 7.6.2026)',
  titel: 'Anmeldung an das Handelsregisteramt',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Unterschriften beim Handelsregisteramt zeichnen ' +
    'oder beglaubigt einreichen (Art. 18 Abs. 2, Art. 21 HRegV); Gebühr CHF 420 (GebV-HReg, Anhang ' +
    'Ziff. 1.3). Belege im Original oder in beglaubigter Kopie (Art. 20 HRegV); per E-Mail eingereichte ' +
    'Unterlagen gelten als Kopien. Die Anmeldung ist auf Deutsch abzufassen (Praxis HRegA ZH); ' +
    'Ausweiskopien der einzutragenden Personen als separate, lose Beilage (Art. 24a HRegV – nicht ' +
    'öffentlich). Unterzeichnet eine bevollmächtigte Drittperson, Vollmachts-Kopie beilegen (Art. 17 HRegV).',
  bausteine: [
    { id: 'AA01_absender', rolle: 'absender', text: '{{firma}} (in Gründung)\n{{anmeldeAdresseZeile}}', begruendung: 'Absenderin ist die Gesellschaft in Gründung.' },
    { id: 'AA02_adressat', rolle: 'adressat', text: 'Handelsregisteramt des Kantons {{kanton}}', begruendung: 'Zuständig ist das Handelsregisteramt am Sitz (Art. 16 HRegV).', norm: 'Art. 16 HRegV' },
    { id: 'AA03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'AA04_betreff', rolle: 'betreff', text: 'Anmeldung zur Eintragung der Gründung der {{firma}}', begruendung: 'Betreff mit Identifikation der Rechtseinheit (Art. 16 Abs. 1 HRegV).', norm: 'Art. 16 Abs. 1 HRegV' },
    {
      id: 'AA05_text',
      text:
        'Zur Eintragung in das Handelsregister wird angemeldet: die Gründung der {{firma}} mit Sitz in ' +
        '{{sitz}}. Die einzutragenden Tatsachen ergeben sich aus den beigelegten Belegen.',
      norm: 'Art. 16 Abs. 1 HRegV',
      begruendung: 'Anmeldungs-Kern: Identifikation und Beleg-Verweis (ZH-Formular-Struktur).',
    },
    {
      id: 'AA05b_inhaber_bucheffekten',
      text:
        'Die Gesellschaft hat Inhaberaktien; diese sind als Bucheffekten im Sinne des ' +
        'Bucheffektengesetzes vom 3. Oktober 2008 (BEG) ausgestaltet. Wir beantragen die ' +
        'entsprechende Eintragung.',
      includeIf: { feld: 'inhaberBucheffekten', eq: true },
      norm: 'Art. 622 Abs. 2bis OR',
      begruendung: 'Stufe 2 P2: Eine Gesellschaft mit Inhaberaktien muss im Handelsregister eintragen lassen, ob sie Beteiligungspapiere kotiert hat oder ihre Inhaberaktien als Bucheffekten ausgestaltet sind (Art. 622 Abs. 2bis OR am Cache verifiziert) — Bucheffekten-Variante.',
    },
    {
      id: 'AA05b_inhaber_kotiert',
      text:
        'Die Gesellschaft hat Inhaberaktien und Beteiligungspapiere an einer Börse kotiert. ' +
        'Wir beantragen die entsprechende Eintragung.',
      includeIf: { feld: 'inhaberKotiertAktiv', eq: true },
      norm: 'Art. 622 Abs. 2bis OR',
      begruendung: 'Stufe 2 P2: Eintragungs-Erklärung nach Art. 622 Abs. 2bis OR — Kotierungs-Variante.',
    },
    {
      id: 'AA05c_schiedsklausel',
      text: 'Die Statuten enthalten eine Schiedsklausel; wir beantragen die Eintragung des entsprechenden Verweises.',
      includeIf: { feld: 'hatSchiedsklausel', eq: true },
      norm: 'Art. 45 Abs. 1 lit. u HRegV',
      begruendung: 'Stufe 2 P3: Der Handelsregister-Eintrag der AG enthält bei statutarischer Schiedsklausel einen Verweis darauf (Art. 45 Abs. 1 lit. u HRegV).',
    },
    {
      id: 'AA06_beilagen',
      ueberschrift: 'Beilagen',
      text: '– {{item.titel}} ({{item.norm}})',
      wiederholeUeber: 'belegeAnmeldung',
      begruendung: 'Beilagen-Liste aus der Gründungs-Konstellation – identisch mit der Checklisten-Engine (eine Quelle, §5).',
      norm: 'Art. 43 HRegV',
    },
    { id: 'AA07_unterschriften', rolle: 'unterschrift', text: 'Die Mitglieder des Verwaltungsrates:', begruendung: 'Anmeldende Personen (Art. 17 HRegV); Unterschriften nach Art. 18 Abs. 2 HRegV.', norm: 'Art. 18 HRegV' },
    { id: 'AA07b_liste', rolle: 'unterschrift', text: '_________________________________\n{{item.name}}', wiederholeUeber: 'vrListe', begruendung: 'Je anmeldende Person eine Unterschriftslinie.' },
  ],
};


// ── 6b · UNTERSCHRIFTENBOGEN (Stufe 2 P4; fertig) ───────────────────────────
// ZH führt ein amtliches «Unterschriftenblatt» (DOCX) — das Original liegt
// nicht in den Extrakten vor, darum HAUS-FASSUNG (offengelegt): je
// zeichnungsberechtigte Person Name · Funktion · Zeichnungsart ·
// Unterschriftslinie, mit den Hinterlegungs-Modalitäten nach Art. 21 HRegV
// (am Cache verifiziert: beim HRegA zeichnen ODER beglaubigt auf Papier /
// elektronisch beglaubigt / elektronisch selbst bestätigt einreichen).

const UNTERSCHRIFTENBOGEN_SCHEMA: VorlageSchema = {
  id: 'ag-unterschriftenbogen',
  version: '1.0.0 (Haus-Fassung am Rechtsstand HRegV 1.1.2025; P4 7.6.2026)',
  titel: 'Unterschriftenblatt',
  format: 'verfuegung',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Haus-Fassung nach dem Vorbild des amtlichen ' +
    'ZH-Unterschriftenblatts: Die Unterschriften sind beim Handelsregisteramt zu zeichnen oder ' +
    'beglaubigt einzureichen (Art. 21 HRegV); massgeblich sind die Vorgaben des zuständigen ' +
    'Handelsregisteramts.',
  bausteine: [
    {
      id: 'UB01_ingress',
      text: 'der {{firma}} mit Sitz in {{sitz}}',
      begruendung: 'Identifikations-Ingress unter dem Dokumenttitel (Usanz der amtlichen Muster).',
    },
    {
      id: 'UB02_hinweis',
      text:
        'Die nachfolgend aufgeführten Personen hinterlegen ihre eigenhändige Unterschrift zur Eintragung ' +
        'in das Handelsregister. Die Unterschrift ist beim Handelsregisteramt zu zeichnen (mit gültigem ' +
        'Pass, gültiger Identitätskarte oder gültigem schweizerischem Ausländerausweis) oder dem ' +
        'Handelsregisteramt als Beleg einzureichen: auf Papier von einer Urkundsperson beglaubigt, ' +
        'elektronisch eingelesen und von einer Urkundsperson beglaubigt oder elektronisch eingelesen ' +
        'und von der Person selbst bestätigt.',
      norm: 'Art. 21 HRegV',
      begruendung: 'Hinterlegungs-Modalitäten nach Art. 21 Abs. 1–3 HRegV (am Cache verifiziert) — Haus-Fassung, das amtliche ZH-Blatt liegt nicht im Wortlaut vor (offengelegt).',
    },
    {
      id: 'UB03_personen',
      rolle: 'unterschrift',
      text:
        '_________________________________\n' +
        '{{item.name}}\n{{item.funktion}} · {{item.zeichnung}}',
      wiederholeUeber: 'unterschriftenListe',
      norm: 'Art. 21 Abs. 1 HRegV',
      begruendung: 'Je zeichnungsberechtigte Person (VR-Mitglieder mit Zeichnungsberechtigung und weitere Zeichnungsberechtigte) eine Unterschriftszeile mit Funktion und Zeichnungsart.',
    },
    {
      id: 'UB04_ortdatum',
      text: '{{ortDatumZeile}}',
      begruendung: 'Ort und Datum.',
    },
  ],
};

// ── 7 · SACHEINLAGEVERTRAG (Etappe 2; fertig — mit Grundstück ENTWURF, §8) ──
// EIN Bausteinsatz (§5); zwei Schema-Hüllen, weil ausgabeArt formgebunden
// ist: Schriftform (Art. 634 Abs. 2 Satz 1 OR) → druckfertig; Grundstück →
// öffentliche Beurkundung (Art. 634 Abs. 2 Satz 2 OR i. V. m. Art. 657 ZGB)
// → nur ENTWURF. Wortlaute: ZH-Vorlagen vertrag_se_einfach / _geschaeft.

const SACHEINLAGEVERTRAG_BAUSTEINE: VorlageSchema['bausteine'] = [
  {
    id: 'SV01_parteien',
    text:
      'zwischen\n{{einlegerName}},\nals Veräusserer/in und Sacheinleger/in,\nund\n' +
      '{{firma}} in Gründung, {{sitz}}, vertreten durch die Gründerinnen und Gründer,\n' +
      'als übernehmende Gesellschaft.',
    begruendung: 'Parteien-Ingress nach den ZH-Vertragsvorlagen (Vertretung durch die Gründer; Haus-Fassung sammelt sie statt Einzelaufzählung — Unterschriftsblock nennt alle).',
  },
  {
    id: 'SV02_gegenstand_einfach',
    ueberschrift: 'Sacheinlage',
    text:
      'Der/die Sacheinleger/in bringt in die zu gründende {{firma}} ein: {{bezeichnung}} gemäss ' +
      'beiliegender Inventarliste vom {{belegDatumFmt}} im Wert und zum Preis von {{waehrungCode}} {{wertFmt}}.\n' +
      'Die beiliegende Inventarliste bildet einen integrierenden Bestandteil des vorliegenden Vertrages ' +
      'und wird demselben, von den Vertragsparteien unterzeichnet, beigeheftet.',
    includeIf: { feld: 'typGeschaeft', eq: false },
    norm: 'Art. 634 OR',
    begruendung: 'ZH-Vorlage «Sacheinlagevertrag einfach» verbatim (Sachgesamtheit mit unterzeichneter, datierter Inventarliste — Beleg-Anforderung des ZH-Merkblatts: Gegenstände einzeln aufgeführt und bewertet).',
  },
  {
    id: 'SV02_gegenstand_geschaeft',
    ueberschrift: 'Gegenstand der Sacheinlage',
    text:
      'Die {{firma}} übernimmt alle Aktiven und Passiven {{hrZusatz}} Einzelunternehmens ' +
      '{{bezeichnung}}{{cheSatz}} gemäss Übernahmebilanz per {{belegDatumFmt}}. Danach betragen die ' +
      'Aktiven {{waehrungCode}} {{aktivenFmt}} und die Passiven {{waehrungCode}} {{passivenFmt}}. Der Kaufpreis beträgt ' +
      '{{waehrungCode}} {{wertFmt}}. Die Bilanz bildet einen Bestandteil dieses Vertrages und wird von den ' +
      'Vertragsparteien anerkannt.',
    includeIf: { feld: 'typGeschaeft', eq: true },
    norm: 'Art. 634 OR',
    begruendung: 'ZH-Vorlage «Sacheinlagevertrag Geschäft» verbatim (Übernahme aller Aktiven und Passiven eines Einzelunternehmens mit Übernahmebilanz).',
  },
  {
    id: 'SV03_gegenleistung',
    ueberschrift: 'Gegenleistung',
    text:
      'Als Gegenleistung erhält {{einlegerName}} {{aktien}} als voll liberiert geltende {{aktienArt}} ' +
      'der Gesellschaft zu nominal {{waehrungCode}} {{nennwertFmt}}{{ausgabeKlammerSatz}}.{{gutschriftSatz}}',
    norm: 'Art. 634 Abs. 4 OR',
    begruendung: 'Gegenleistung nach den ZH-Vorlagen («als voll liberiert geltende Aktien … zu nominal»); Gutschrift-Satz = weitere Gegenleistung (Art. 634 Abs. 4 OR), nur wenn erfasst. Stufe 2: Währungscode = Kapitalwährung; bei Agio wird der Ausgabebetrag offengelegt (die Bewertung deckt Aktien × Ausgabebetrag, Art. 629 Abs. 2 Ziff. 2 OR).',
  },
  {
    id: 'SV04_zeitpunkt',
    ueberschrift: 'Zeitpunkt',
    text:
      'Der/die Sacheinleger/in erteilt mit der Unterzeichnung dieses Vertrages der {{firma}} die ' +
      'unwiderrufliche Befugnis, sofort nach ihrer Eintragung im Handelsregister über sämtliche ' +
      'übertragenen Vermögenswerte tatsächlich und rechtlich zu verfügen. Mit der Eintragung der ' +
      '{{firma}} im Handelsregister kann sie frei und bedingungslos über die Sacheinlage verfügen.',
    norm: 'Art. 634 Abs. 1 Ziff. 3 OR',
    begruendung: 'ZH-Vorlagen verbatim — setzt die Deckungs-Voraussetzung der sofortigen freien Verfügbarkeit um.',
  },
  {
    id: 'SV05_zusicherungen',
    ueberschrift: 'Zusicherungen',
    text: 'Die übernommenen Vermögenswerte sind frei von Rechten Dritter.',
    begruendung: 'ZH-Vorlagen verbatim.',
  },
  {
    id: 'SV06_rechtsgeschaefte',
    ueberschrift: 'Rechtsgeschäfte',
    text:
      'Die seit dem {{rueckwirkungFmt}} abgeschlossenen Rechtsgeschäfte des Einzelunternehmens ' +
      '{{bezeichnung}} gelten als für Rechnung der in Gründung begriffenen {{firma}} getätigt.',
    includeIf: { feld: 'typGeschaeft', eq: true },
    begruendung: 'Rückwirkungsklausel der ZH-Vorlage «Geschäft» (nur Geschäftsübernahme).',
  },
  {
    id: 'SV07_nutzen_gefahr',
    ueberschrift: 'Nutzen und Gefahr',
    text: 'Nutzen und Gefahr hinsichtlich aller übertragenen Vermögenswerte gelten als per {{belegDatumFmt}} auf die {{firma}} übergegangen.',
    begruendung: 'ZH-Vorlagen verbatim; Stichtag = Inventarlisten- bzw. Übernahmebilanz-Datum.',
  },
  {
    id: 'SV08_gewaehrleistung',
    ueberschrift: 'Gewährleistung',
    text: 'Der vorliegende Vertrag wird unter Aufhebung jeder Gewährleistung abgeschlossen.',
    begruendung: 'ZH-Vorlagen verbatim.',
  },
  {
    id: 'SV09_unterschriften',
    rolle: 'unterschrift',
    text: '{{ortDatumZeile}}\n\n_________________________________\n{{einlegerName}} (Sacheinleger/in)\n\n{{firma}} in Gründung – die Gründerinnen und Gründer:',
    begruendung: 'Unterschriften der Sacheinlegerin / des Sacheinlegers und aller Gründerinnen und Gründer (ZH-Vorlagen).',
  },
  {
    id: 'SV09b_gruenderliste',
    rolle: 'unterschrift',
    text: '_________________________________\n{{item.name}}',
    wiederholeUeber: 'gruenderListe',
    begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
  },
];

const SACHEINLAGEVERTRAG_SCHEMA: VorlageSchema = {
  id: 'ag-sacheinlagevertrag',
  version: '1.0.0 (ZH-Vorlagen vertrag_se_einfach/_geschaeft 26.7.2024; Dossier 7.6.2026)',
  titel: 'Sacheinlagevertrag',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Schriftform (Art. 634 Abs. 2 OR); im Original oder ' +
    'als beglaubigte Kopie einzureichen (Art. 20 HRegV). Inventarliste bzw. Übernahmebilanz unterzeichnet ' +
    'und datiert beiheften (Merkblatt HRegA ZH).',
  bausteine: SACHEINLAGEVERTRAG_BAUSTEINE,
};

const SACHEINLAGEVERTRAG_ENTWURF_SCHEMA: VorlageSchema = {
  ...SACHEINLAGEVERTRAG_SCHEMA,
  id: 'ag-sacheinlagevertrag-grundstueck',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF: Dieser Sacheinlagevertrag enthält ein ' +
    'Grundstück und bedarf der öffentlichen Beurkundung (Art. 634 Abs. 2 OR i. V. m. Art. 657 ZGB); ' +
    'eine einzige Urkunde genügt auch für Grundstücke in verschiedenen Kantonen und ist durch eine ' +
    'Urkundsperson am Sitz der Gesellschaft zu errichten (Art. 634 Abs. 3 OR).',
};

// ── 7b · LEX-KOLLER-ERKLÄRUNG (Etappe 4.3/D16; fertig) ──────────────────────
// Inhalt nach dem amtlichen ZH-Formular (Stand 1.1.2025); nur bei
// Immobilien-Haupttätigkeit einzureichen, unterzeichnet von EINEM Mitglied
// des obersten Leitungs- oder Verwaltungsorgans.

const LEXKOLLER_SCHEMA: VorlageSchema = {
  id: 'ag-lex-koller',
  version: '1.0.0 (ZH-Formular allg_formular_lex_koller_erklaerung 1.1.2025)',
  titel: 'Lex-Koller-Erklärung',
  format: 'eingabe',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Nur einzureichen, wenn die Gesellschaft eine ' +
    'Immobilien-Haupttätigkeit verfolgt; persönliche Unterschrift EINES Mitglieds des obersten ' +
    'Leitungs- oder Verwaltungsorgans (Merkblatt HRegA ZH). Fehlende Angaben können die Verweisung ' +
    'an die kantonale Bewilligungsbehörde zur Folge haben (Art. 18 Abs. 1 und 2 BewG).',
  bausteine: [
    { id: 'LK01_absender', rolle: 'absender', text: '{{firma}} (in Gründung)\n{{anmeldeAdresseZeile}}', begruendung: 'Absenderin ist die Gesellschaft in Gründung.' },
    { id: 'LK02_adressat', rolle: 'adressat', text: 'Handelsregisteramt des Kantons {{kanton}}', begruendung: 'Beleg zur HR-Anmeldung (Art. 43 HRegV; ZH-Checkliste «Lex-Koller-Erklärung»).' },
    { id: 'LK03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}', begruendung: 'Ort und Datum.' },
    { id: 'LK04_betreff', rolle: 'betreff', text: 'Lex-Koller-Erklärung', begruendung: 'Titel des amtlichen ZH-Formulars.' },
    {
      id: 'LK05_ingress',
      text:
        'Im Hinblick auf die Bestimmungen des Bundesgesetzes und der Verordnung über den Erwerb von ' +
        'Grundstücken durch Personen im Ausland erklärt das unterzeichnende Mitglied des Verwaltungsrates ' +
        'bezüglich der Gesellschaft {{firma}}, mit Sitz in {{sitz}}, Folgendes zum angemeldeten ' +
        'Eintragungsgeschäft (Neueintragung/Gründung):',
      begruendung: 'Ingress nach dem ZH-Formular («Im Hinblick auf die Bestimmungen … erklären die Unterzeichnenden bezüglich der Gesellschaft … Folgendes zum angemeldeten Eintragungsgeschäft» — Haus-Fassung im Singular, da ein VR-Mitglied unterzeichnet).',
    },
    {
      id: 'LK06_fragen',
      text:
        '1. Personen im Ausland bzw. Personen, die für Rechnung von Personen im Ausland handeln, sind an ' +
        'der Gesellschaft beteiligt: {{lkFrage1}}.\n' +
        '2. Personen im Ausland bzw. Personen, die für Rechnung von Personen im Ausland handeln, erwerben ' +
        'im Zusammenhang mit dem angemeldeten Eintragungsgeschäft an der Gesellschaft neu eine ' +
        'Beteiligung: {{lkFrage2}}.\n' +
        '3. Bei Sacheinlage, Fusion, Umwandlung oder Spaltung: Die Gesellschaft erwirbt ' +
        'Nicht-Betriebsstätte-Grundstücke in der Schweiz: {{lkFrage3}}.\n' +
        '4. Bei Kapitalherabsetzung: nicht anwendbar (Gründung).',
      begruendung: 'Die vier Erklärungen des ZH-Formulars verbatim-nah; Frage 4 betrifft nur Kapitalherabsetzungen und ist bei der Gründung als «nicht anwendbar» ausgewiesen (§8 — ehrlicher als eine leere Ankreuzzeile).',
    },
    {
      id: 'LK07_definitionen',
      text:
        'Personen im Ausland (Art. 5 BewG) sind insbesondere: Ausländerinnen und Ausländer mit Wohnsitz im ' +
        'Ausland; Ausländerinnen und Ausländer mit Wohnsitz in der Schweiz, die weder Staatsangehörige eines ' +
        'EU-/EFTA-Mitgliedstaates sind noch eine gültige Niederlassungsbewilligung (Ausweis C) besitzen; ' +
        'juristische Personen mit Sitz im Ausland oder mit Sitz in der Schweiz, die von Personen im Ausland ' +
        'beherrscht werden; sowie Personen, die ein Grundstück auf Rechnung einer Person im Ausland erwerben. ' +
        'Betriebsstätte-Grundstück (Art. 2 Abs. 2 lit. a und Abs. 3 BewG) ist ein Grundstück, das als ständige ' +
        'Betriebsstätte eines nach kaufmännischer Art geführten Gewerbes, eines Handwerksbetriebes oder eines ' +
        'freien Berufes dient.',
      begruendung: 'Definitions-Fussnoten des ZH-Formulars (gekürzt um den GB-Staatsvertrags-Sonderfall SR 0.142.113.672 — als Detail dem Formular-Original vorbehalten; Abweichung offengelegt).',
    },
    {
      id: 'LK08_folge',
      text:
        'Kann die Handelsregisterbehörde die Bewilligungspflicht nicht ohne Weiteres ausschliessen, so setzt ' +
        'sie das Eintragungsverfahren aus und verweist die Anmeldenden an die zuständige kantonale ' +
        'Bewilligungsbehörde (Art. 18 Abs. 1 und 2 BewG).',
      begruendung: 'Folgen-Hinweis des ZH-Formulars, kantonsneutral gefasst (ZH nennt die Bezirksräte — die Bewilligungsbehörde ist kantonal verschieden; Abweichung offengelegt).',
    },
    {
      id: 'LK09_unterschrift',
      rolle: 'unterschrift',
      text: 'Persönliche Unterschrift eines Mitglieds des Verwaltungsrates:\n\n_________________________________\n{{praesidentName}}',
      begruendung: 'ZH-Formular: «Persönliche Unterschrift von einem Mitglied des obersten Leitungs- oder Verwaltungsorgans»; vorbelegt mit der Präsidentin / dem Präsidenten.',
    },
  ],
};

// ── 7c · GRÜNDUNGS-NACHTRAG (Etappe 4.4/D11; ENTWURF §8) ────────────────────
// Nach ZH-Vorlage 3.4: Korrektur von Urkunde/Statuten nach Beanstandung
// durch die Handelsregisterbehörde — öffentliche Beurkundung nötig.

const NACHTRAG_SCHEMA: VorlageSchema = {
  id: 'ag-gruendungs-nachtrag',
  version: '1.0.0 (ZH-Vorlage 3.4 «AG Gründungs-Nachtrag»)',
  titel: 'Nachtrag zur Gründungsurkunde',
  format: 'verfuegung',
  ausgabeArt: 'entwurf',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. ENTWURF für die Urkundsperson: Der Nachtrag zur ' +
    'Gründungsurkunde bedarf der öffentlichen Beurkundung (ZH-Vorlage 3.4; Art. 629 Abs. 1 OR). ' +
    'Wer den Nachtrag namens aller Gründerinnen und Gründer vornimmt, ergibt sich aus der ' +
    'Nachtragsvollmacht der Gründungsurkunde oder dem persönlichen Erscheinen.',
  bausteine: [
    {
      id: 'NT01_ingress',
      text: 'Nachtrag zur Gründungsurkunde vom {{nachtragGruendungsdatumFmt}} der {{firma}} mit Sitz in {{sitz}}',
      begruendung: 'Ingress nach ZH 3.4 («Nachtrag zur Gründungsurkunde vom … der … mit Sitz in …»).',
    },
    {
      id: 'NT02_erklaerung',
      text: 'Die Gründerinnen und Gründer erklären infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'ZH 3.4 verbatim-nah («Die Gründer erklären infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag»).',
    },
    {
      id: 'NT02_erklaerung_singular',
      text: 'Die Gründerin bzw. der Gründer erklärt infolge einer Beanstandung durch die Handelsregisterbehörde folgenden Nachtrag:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Nachtrags-Erklärung im Singular (D1; ZH 3.4 führt beide Numeri).',
    },
    {
      id: 'NT03_urkunde',
      text: 'Ziff. {{nachtragUrkundeZiffer}} der Gründungsurkunde lautet neu wie folgt:\n«{{nachtragUrkundeText}}»',
      includeIf: { feld: 'hatNachtragUrkunde', eq: true },
      begruendung: 'Urkunden-Änderung nach ZH 3.4 («Ziff. … der Gründungsurkunde lautet neu wie folgt: „…“» — Haus-Anführung mit Guillemets statt deutscher Anführungszeichen, Konventions-Standard).',
    },
    {
      id: 'NT04_statuten',
      text: 'Art. {{nachtragStatutenArtikel}}{{nachtragAbsatzSatz}} der Statuten der Gesellschaft lautet neu wie folgt:\n«{{nachtragStatutenText}}»',
      includeIf: { feld: 'hatNachtragStatuten', eq: true },
      begruendung: 'Statuten-Änderung nach ZH 3.4.',
    },
    {
      id: 'NT05_statuten_feststellung',
      text:
        'Es liegt ein Exemplar der Gesellschaftsstatuten vor; es handelt sich um die vollständigen, unter ' +
        'Berücksichtigung der vorstehenden Änderungen gültigen Statuten. Diese Statuten sind Bestandteil ' +
        'dieser Urkunde.',
      begruendung: 'Vollständigkeits-Feststellung nach ZH 3.4 (Haus-Fassung in der dritten Person; ZH: «Der bzw. Die Gründer legt bzw. legen ein Exemplar … vor und erklärt bzw. erklären …»).',
    },
    {
      id: 'NT06_fortgeltung',
      text: 'Im Übrigen gilt der ursprüngliche Errichtungsakt (mit Statuten) unverändert weiter.',
      begruendung: 'ZH 3.4 verbatim.',
    },
    {
      id: 'NT07_unterschriften',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer (bzw. die bevollmächtigte Person):',
      begruendung: 'Unterschriften; die Urkundsperson ergänzt Bestätigung und Beurkundungsvermerk (ZH 3.4: Belegbestätigung Art. 631 Abs. 1 OR).',
    },
    {
      id: 'NT07b_gruenderliste',
      rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
    },
  ],
};

// ── 8 · GRÜNDUNGSBERICHT (Etappe 2; fertig — Art. 635 OR) ───────────────────

const GRUENDUNGSBERICHT_SCHEMA: VorlageSchema = {
  id: 'ag-gruendungsbericht',
  version: '1.0.0 (ZH-Vorlagen gruendungsbericht_se_einfach/_geschaeft 26.7.2024; Dossier 7.6.2026)',
  titel: 'Gründungsbericht',
  format: 'vertrag',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Von allen Gründerinnen und Gründern (oder ihren ' +
    'Vertretern) ORIGINAL HANDSCHRIFTLICH zu unterzeichnen (Praxis HRegA ZH); ein zugelassener Revisor ' +
    'prüft den Bericht und bestätigt schriftlich, dass er vollständig und richtig ist (Art. 635a OR).',
  bausteine: [
    {
      id: 'GB01_ingress',
      text: 'Die Gründerinnen und Gründer der {{firma}}, in {{sitz}}, erstatten hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR:',
      includeIf: { feld: 'einGruender', eq: false },
      norm: 'Art. 635 OR',
      begruendung: 'Ingress nach der ZH-Vorlage («Die Gründer der … AG erstatten hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR»).',
    },
    {
      id: 'GB01_ingress_singular',
      text: 'Die Gründerin bzw. der Gründer der {{firma}}, in {{sitz}}, erstattet hiermit folgenden Gründungsbericht im Sinne von Art. 635 OR:',
      includeIf: { feld: 'einGruender', eq: true },
      norm: 'Art. 635 OR',
      begruendung: 'Ingress im Singular (D1).',
    },
    {
      id: 'GB02_sach',
      ueberschrift: 'Art und Zustand der Sacheinlage',
      text:
        'Die Sacheinlage von {{item.einleger}} umfasst {{item.objektLabel}}. Der entsprechende ' +
        'Sacheinlagevertrag vom {{item.vertragDatumFmt}} mit {{item.belegSatz}} liegt diesem Bericht als ' +
        'integrierender Bestandteil bei. Zum Zustand der Sacheinlage wird Folgendes erklärt: {{item.zustandTxt}}\n' +
        'Auf Grund obiger Feststellungen kann die Bewertung der Sacheinlage mit {{waehrungCode}} {{item.wertFmt}} als angemessen bezeichnet werden.',
      wiederholeUeber: 'sachListe',
      includeIf: { feld: 'hatSacheinlagen', eq: true },
      norm: 'Art. 635 Ziff. 1 OR',
      begruendung: 'Je Sacheinlage ein Abschnitt nach den ZH-Vorlagen (Art/Zustand + Angemessenheit der Bewertung); beim Geschäft tritt die Übernahmebilanz an die Stelle der Inventarliste, die Posten-Würdigung steht im Zustands-Text (ZH-Vorlage «Geschäft»: je Bilanzposten Bestand und Bewertung).',
    },
    {
      id: 'GB03_verrechnung',
      ueberschrift: 'Bestand und Verrechenbarkeit',
      text:
        'Die zur Verrechnung gebrachte Forderung von {{item.glaeubiger}} im Betrag von ' +
        '{{waehrungCode}} {{item.forderungFmt}} besteht und ist verrechenbar. Begründung: {{item.begruendungTxt}}',
      wiederholeUeber: 'verrListe',
      includeIf: { feld: 'hatVerrechnungen', eq: true },
      norm: 'Art. 635 Ziff. 2 OR',
      begruendung: 'Rechenschaft über Bestand und Verrechenbarkeit der Schuld (Art. 635 Ziff. 2 OR; BE-Merkblatt) — Haus-Fassung, die ZH-Vorlagen decken nur den Sacheinlage-Fall.',
    },
    {
      id: 'GB04_vorteile',
      ueberschrift: 'Besondere Vorteile',
      text:
        '{{item.beguenstigter}} wird folgender besonderer Vorteil gewährt: {{item.inhalt}} ' +
        '(Wert: {{waehrungCode}} {{item.wertFmt}}). Begründung und Angemessenheit: {{item.begruendungTxt}}',
      wiederholeUeber: 'vorteilListe',
      includeIf: { feld: 'hatVorteile', eq: true },
      norm: 'Art. 635 Ziff. 3 OR',
      begruendung: 'Rechenschaft über Begründung und Angemessenheit besonderer Vorteile (Art. 635 Ziff. 3 OR) — Haus-Fassung.',
    },
    {
      id: 'GB05_unterschriften',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerinnen und Gründer:',
      includeIf: { feld: 'einGruender', eq: false },
      begruendung: 'Unterschriften ALLER Gründerinnen und Gründer (ZH-Praxis: original handschriftlich).',
    },
    {
      id: 'GB05_unterschriften_singular',
      rolle: 'unterschrift',
      text: '{{ortDatumZeile}}\n\nDie Gründerin bzw. der Gründer:',
      includeIf: { feld: 'einGruender', eq: true },
      begruendung: 'Unterschrift im Singular (D1).',
    },
    {
      id: 'GB05b_gruenderliste',
      rolle: 'unterschrift',
      text: '_________________________________\n{{item.name}}',
      wiederholeUeber: 'gruenderListe',
      begruendung: 'Je Gründerin/Gründer eine Unterschriftslinie.',
    },
  ],
};

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
