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

export type AgGruenderZeile = { name: string; angaben: string; anzahl: string };

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
   *  geleistete Einlagen gesamthaft ≥ CHF 50'000). */
  liberierungProzent: string;
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
  /** Qualifizierte Gründung (Etappe 2) — wirksam nur mit den Checklisten-
   *  Weichen `einlageArt`/`besondereVorteile` (§5). */
  sacheinlagen: AgSacheinlageZeile[];
  verrechnungen: AgVerrechnungZeile[];
  vorteile: AgVorteilZeile[];
  /** Zugelassene:r Revisor:in der Prüfungsbestätigung (Art. 635a OR);
   *  leer = Blanko-Linie. */
  revisorName: string;
  ort: string;
  datum: string;
};

export const AG_DOK_DEFAULTS: Omit<AgDokAntworten, keyof AgGruendungEingaben> = {
  firma: '', sitz: '', kanton: '', zweck: '', zweckErweiterung: true,
  aktienkapitalChf: "100'000", anzahlAktien: '100', nennwertChf: "1'000",
  liberierungProzent: '100',
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
  sacheinlagen: [], verrechnungen: [], vorteile: [], revisorName: '',
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

// ── Gates ───────────────────────────────────────────────────────────────────

export type AgDokGates = { blocker: string[]; warnungen: string[] };

export function pruefeAgDokGates(a: AgDokAntworten): AgDokGates {
  const blocker: string[] = [];
  const warnungen: string[] = [];

  // ── Qualifizierte Gründung (Etappe 2): Sacheinlage / Verrechnung / Vorteile ──
  const mitSach = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
  const mitVerr = a.einlageArt === 'verrechnung' || a.einlageArt === 'gemischt';
  const sachen = mitSach ? a.sacheinlagen.filter((s) => s.einlegerName.trim() || s.bezeichnung.trim()) : [];
  const verr = mitVerr ? a.verrechnungen.filter((v) => v.glaeubigerName.trim()) : [];
  const vorteile = a.besondereVorteile ? a.vorteile.filter((v) => v.beguenstigter.trim()) : [];
  const qualifiziert = sachen.length > 0 || verr.length > 0 || vorteile.length > 0
    || mitSach || mitVerr || a.besondereVorteile;

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
  if (qualifiziert && (zahl(a.liberierungProzent) ?? 100) < 100) {
    blocker.push(
      'Erstausbau: Teilliberierung nur bei der reinen Bargründung – Aktien aus Sacheinlage/Verrechnung ' +
      'gelten als voll liberiert (ZH-Vertragsvorlage: «als voll liberiert geltende Aktien»); ' +
      'gemischte Teilliberierung als Stufe 2.',
    );
  }
  if (a.fremdwaehrung) {
    blocker.push(
      'Volldokumente sind zurzeit nur für Aktienkapital in CHF verfügbar (Fremdwährung verlangt ' +
      'Umrechnungskurs-Angaben in der Urkunde, Art. 629 Abs. 3 OR; Art. 44 lit. j HRegV) – bitte die Checkliste verwenden.',
    );
  }
  if (a.inhaberaktien) {
    blocker.push(
      'Volldokumente sind zurzeit nur für NAMENAKTIEN verfügbar: Inhaberaktien sind nur bei ' +
      'Börsenkotierung oder als Bucheffekten zulässig (Art. 622 Abs. 1bis OR) und brauchen den ' +
      'Zusatznachweis nach Art. 43 Abs. 1 lit. i HRegV – bitte die Checkliste verwenden.',
    );
  }

  const kapital = zahl(a.aktienkapitalChf);
  const anzahl = zahl(a.anzahlAktien);
  const nennwert = zahl(a.nennwertChf);
  const prozent = zahl(a.liberierungProzent);
  if (kapital === null || anzahl === null || nennwert === null) {
    blocker.push('Aktienkapital, Anzahl und Nennwert der Aktien beziffern (Art. 626 Abs. 1 Ziff. 3 und 4 OR).');
  } else {
    if (nennwert <= 0) blocker.push('Der Nennwert muss grösser als null sein (Art. 622 Abs. 4 OR).');
    if (kapital < 100_000) blocker.push('Das Aktienkapital beträgt mindestens CHF 100\'000 (Art. 621 Abs. 1 OR).');
    if (ganzePositive(a.anzahlAktien) === null) blocker.push('Anzahl Aktien als positive ganze Zahl angeben.');
    // Gleiche Befundklasse wie KE-M-1 (/simplify-Nachzug): keine «3.5 Aktien»
    // in der Zeichnungszeile des Errichtungsakts.
    for (const g of a.gruender) {
      if (g.name.trim() && ganzePositive(g.anzahl) === null) {
        blocker.push(`Gezeichnete Aktienzahl von ${g.name.trim()} als positive ganze Zahl angeben.`);
      }
    }
    if (nennwert > 0 && anzahl > 0 && Math.abs(anzahl * nennwert - kapital) > 0.005) {
      blocker.push(
        `Rechnerische Unstimmigkeit: ${a.anzahlAktien} Aktien × CHF ${fmtCHF(a.nennwertChf)} ergeben nicht das Aktienkapital von CHF ${fmtCHF(a.aktienkapitalChf)}.`,
      );
    }
    if (prozent === null || prozent < 20 || prozent > 100) {
      blocker.push('Liberierungsgrad zwischen 20 % und 100 % angeben (Art. 632 Abs. 1 OR: mindestens 20 % des Nennwerts jeder Aktie).');
    } else if (prozent < 100 && kapital * (prozent / 100) < 50_000) {
      blocker.push(
        `Die geleisteten Einlagen müssen gesamthaft mindestens CHF 50'000 betragen (Art. 632 Abs. 2 OR) – bei ${a.liberierungProzent} % von CHF ${fmtCHF(a.aktienkapitalChf)} sind es nur CHF ${fmtCHF(String(kapital * (prozent / 100)))}.`,
      );
    }
    const gezeichnet = a.gruender.reduce((s, g) => s + (zahl(g.anzahl) ?? 0), 0);
    if (a.gruender.length > 0 && anzahl > 0 && gezeichnet !== anzahl) {
      blocker.push(
        `Die Zeichnungen der Gründer (${gezeichnet} Aktien) müssen sämtliche ${a.anzahlAktien} Aktien abdecken (Art. 629 Abs. 2 Ziff. 1 OR).`,
      );
    }

    // ── Etappe 2: Wert-Deckung je qualifizierter Position (Erstausbau ohne
    // Agio: Ausgabebetrag = Nennwert; «die versprochenen Einlagen entsprechen
    // dem gesamten Ausgabebetrag», Art. 629 Abs. 2 Ziff. 2 OR). ──
    if (nennwert > 0) {
      for (const s of sachen) {
        const wer = s.einlegerName.trim() || s.bezeichnung.trim() || 'Sacheinlage';
        const akt = ganzePositive(s.aktienAnzahl);
        const wert = zahl(s.wertChf);
        const gut = s.gutschriftChf.trim() === '' ? 0 : zahl(s.gutschriftChf);
        if (!s.bezeichnung.trim()) blocker.push(`Sacheinlage von ${wer}: Gegenstand bezeichnen (Statuten-Pflichtinhalt, Art. 634 Abs. 4 OR).`);
        if (!s.einlegerName.trim()) blocker.push('Sacheinlage: Name der Einlegerin / des Einlegers angeben (Art. 634 Abs. 4 OR).');
        if (akt === null) blocker.push(`Sacheinlage von ${wer}: Anzahl der dafür ausgegebenen Aktien als positive ganze Zahl angeben (Art. 634 Abs. 4 OR).`);
        if (wert === null || wert <= 0) blocker.push(`Sacheinlage von ${wer}: Bewertung in CHF beziffern (Art. 634 Abs. 4 OR).`);
        if (gut === null || gut < 0) blocker.push(`Sacheinlage von ${wer}: Gutschrift als Betrag ab 0 angeben.`);
        if (akt !== null && wert !== null && gut !== null && gut >= 0 && Math.abs(wert - (akt * nennwert + gut)) > 0.005) {
          blocker.push(
            `Sacheinlage von ${wer}: Bewertung CHF ${fmtCHF(s.wertChf)} muss ${s.aktienAnzahl} Aktien × CHF ${fmtCHF(a.nennwertChf)}` +
            (gut > 0 ? ` + Gutschrift CHF ${fmtCHF(s.gutschriftChf)}` : '') +
            ' entsprechen (Erstausbau ohne Agio; Art. 629 Abs. 2 Ziff. 2 OR).',
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
        if (ford === null || ford <= 0) blocker.push(`Verrechnung von ${v.glaeubigerName.trim()}: Betrag der Forderung beziffern (Art. 634a Abs. 3 OR).`);
        if (akt !== null && ford !== null && Math.abs(ford - akt * nennwert) > 0.005) {
          blocker.push(
            `Verrechnung von ${v.glaeubigerName.trim()}: Verrechneter Betrag CHF ${fmtCHF(v.forderungChf)} muss ` +
            `${v.aktienAnzahl} Aktien × CHF ${fmtCHF(a.nennwertChf)} entsprechen (Erstausbau ohne Agio).`,
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
  if (a.bankInUrkundeGenannt && (a.einlageArt === 'bar' || a.einlageArt === 'gemischt') && (!a.bankName.trim() || !a.bankOrt.trim())) {
    blocker.push('Bank in der Urkunde nennen: Name und Ort des Instituts angeben (sonst separate Bankbescheinigung, Art. 43 Abs. 1 lit. f HRegV).');
  }
  if (!a.eigeneBueros && (!a.domizilhalterName.trim() || !a.domizilhalterAdresse.trim())) {
    blocker.push('c/o-Domizil: Domizilhalter/in mit Adresse angeben (Art. 117 Abs. 3 HRegV).');
  }
  // Bug-Check-Befund Agent 1 (7.6.2026): Sitz ist Beleg-Inhalt (Art. 44
  // lit. f HRegV) und erscheint im druckfertigen RS-Wahlannahme-Absender —
  // wie bankOrt/domizilhalterAdresse hart verlangen.
  if (!a.optingOut && (!a.revisionsstelleName.trim() || !a.revisionsstelleSitz.trim())) {
    blocker.push('Revisionsstelle mit Name und Sitz benennen oder Opting-out wählen (Art. 727a Abs. 2 OR; Art. 44 lit. f HRegV).');
  }

  if (!a.firma.trim()) blocker.push('Firma angeben – mit Rechtsformzusatz «AG» (Art. 950 OR).');
  else if (!/\bag\b|aktiengesellschaft/i.test(a.firma)) {
    warnungen.push('Die Firma muss die Rechtsform angeben (Art. 950 Abs. 1 OR) – Zusatz «AG» ergänzen.');
  }
  if (!a.sitz.trim()) blocker.push('Sitz (politische Gemeinde) angeben (Art. 626 Abs. 1 Ziff. 1 OR).');
  if (!a.zweck.trim()) blocker.push('Zweck angeben (Art. 626 Abs. 1 Ziff. 2 OR).');

  return { blocker, warnungen };
}

// ── Antworten-Aufbereitung ──────────────────────────────────────────────────

function basisAntworten(a: AgDokAntworten): Antworten {
  const datum = a.datum ? fmtDatum(a.datum) : '________';
  const prozent = zahl(a.liberierungProzent) ?? 100;
  const kapital = zahl(a.aktienkapitalChf) ?? 0;
  const nennwert = zahl(a.nennwertChf) ?? 0;
  const anzahl = zahl(a.anzahlAktien) ?? 0;
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
    hatBarEinlage: a.einlageArt === 'bar' || (a.einlageArt === 'gemischt' && barAktien > 0),
    barEinlageFmt: fmtCHF(String(barAktien * nennwert)),
    barAktienTxt: String(barAktien),
    qualifiziertIntro:
      sachen.length > 0 && verr.length > 0
        ? 'Die in den Statuten angegebenen Sacheinlagen und Verrechnungstatbestände gemäss folgenden, vorliegenden Unterlagen:'
        : sachen.length > 0
          ? 'Die in den Statuten angegebenen Sacheinlagen gemäss folgenden, vorliegenden Unterlagen:'
          : 'Die in den Statuten angegebene Verrechnungsliberierung gemäss folgenden, vorliegenden Unterlagen:',
    revisorZeile: a.revisorName.trim() || '________',
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
        ? ` Ferner werden ${s.einlegerName.trim() || '________'} CHF ${fmtCHF(s.gutschriftChf)} in den Büchern der Gesellschaft gutgeschrieben.`
        : '',
      gutschriftKlauselZusatz: s.gutschriftChf.trim()
        ? `; als weitere Gegenleistung wird eine Gutschrift von CHF ${fmtCHF(s.gutschriftChf)} gewährt`
        : '',
      // Art. 634 Abs. 1 Ziff. 3 OR / ZH-Urkunde 3.3: Grundstücks-Weiche.
      verfuegungsSatz: s.grundstueck
        ? 'einen bedingungslosen Anspruch auf Eintragung in das Grundbuch erhält'
        : 'sofort als Eigentümerin über die Sacheinlage verfügen kann',
      grundstueck: s.grundstueck,
      hrZusatz: s.typ === 'geschaeft' ? (s.imHrEingetragen ? 'des im Handelsregister eingetragenen' : 'des im Handelsregister nicht eingetragenen') : '',
      cheZusatz: s.typ === 'geschaeft' && s.cheNr.trim() ? ` (${s.cheNr.trim()})` : '',
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
    // D10: Nachtragsvollmacht nur, wenn eine Person benannt ist.
    hatNachtragsvollmacht: a.nachtragsbevollmaechtigter.trim().length > 0,
    nachtragsbevollmaechtigter: a.nachtragsbevollmaechtigter.trim(),
    gjBeginnTxt: a.gjBeginn.trim() || '________',
    gjEndeTxt: a.gjEnde.trim() || '________',
    akFmt: fmtCHF(a.aktienkapitalChf),
    nennwertFmt: fmtCHF(a.nennwertChf),
    einbezahltFmt: fmtCHF(String(kapital * (prozent / 100))),
    vollLiberiert: prozent >= 100,
    // Review-Befund M-2 (7.6.2026): Art. 626 Abs. 1 Ziff. 3 OR verlangt den
    // BETRAG der geleisteten Einlagen — bei Teilliberierung den Frankenbetrag
    // zusätzlich zum Prozentsatz ausweisen.
    liberierungSatz: prozent >= 100
      ? 'vollständig liberiert'
      : `zu ${a.liberierungProzent} % liberiert (geleistete Einlagen: CHF ${fmtCHF(String(kapital * (prozent / 100)))})`,
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}den ${datum}`,
    gruenderListe: a.gruender.filter((g) => g.name.trim()).map((g) => ({
      name: g.name.trim(),
      angabenZeile: g.angaben.trim() ? `, ${g.angaben.trim()}` : '',
      anzahl: g.anzahl,
    })),
    vrListe: a.verwaltungsraete.filter((v) => v.name.trim()).map((v) => ({
      name: v.name.trim(),
      herkunft: v.herkunft.trim() || '________',
      wohnort: v.wohnort.trim() || '________',
      funktion: a.verwaltungsraete.filter((x) => x.name.trim()).length > 1 && v.praesident ? 'Präsident/in' : 'Mitglied',
      praesidentZeile: a.verwaltungsraete.filter((x) => x.name.trim()).length > 1 && v.praesident ? ', als Präsident/in' : '',
      zeichnung: VR_ZEICHNUNGS_LABEL[v.zeichnungsArt],
    })),
    vertretungsListe: a.weitereVertretungen.filter((v) => v.name.trim()).map((v) => ({
      name: v.name.trim(),
      funktion: v.funktion.trim() || '________',
      zeichnung: VERTRETUNGS_ZEICHNUNGS_LABEL[v.zeichnungsArt],
    })),
    hatWeitereVertretungen: a.weitereVertretungen.filter((v) => v.name.trim()).length > 0,
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
        'Das Aktienkapital beträgt CHF {{akFmt}} und ist eingeteilt in {{anzahlAktien}} Namenaktien ' +
        'zu CHF {{nennwertFmt}}. Die Aktien sind {{liberierungSatz}}.',
      norm: 'Art. 626 Abs. 1 Ziff. 3 und 4 OR',
      begruendung: 'Pflichtinhalt: Höhe des Kapitals, geleistete Einlagen (Liberierungsgrad) sowie Anzahl, Nennwert und Art der Aktien (rev. 2023; Wortlaut ZH/SG/GL).',
    },
    // ── Etappe 2: Pflichtklauseln der qualifizierten Gründung ───────────────
    {
      id: 'AS06_sacheinlagen',
      ueberschrift: 'Sacheinlagen',
      text:
        'Die Gesellschaft übernimmt bei der Gründung von {{item.einleger}} als Sacheinlage: ' +
        '{{item.objektLabel}} ({{item.belegSatz}}), bewertet mit CHF {{item.wertFmt}}. Dafür werden ' +
        '{{item.aktien}} Namenaktien zu CHF {{nennwertFmt}} ausgegeben{{item.gutschriftKlauselZusatz}}.',
      wiederholeUeber: 'sachListe',
      includeIf: { feld: 'hatSacheinlagen', eq: true },
      norm: 'Art. 634 Abs. 4 OR',
      begruendung: 'Pflichtinhalt bei Sacheinlage: Gegenstand, Bewertung, Name des Einlegers, ausgegebene Aktien und allfällige weitere Gegenleistungen (Art. 634 Abs. 4 OR; Elemente-Katalog am Cache verifiziert, Dossier ag-qualifizierte-gruendung.md Teil 1). Haus-Formulierung — die amtlichen Muster enthalten keinen Standard-Klauseltext.',
      hinweis: 'Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634 Abs. 4 Satz 2 OR — Nachfolgeregel des aufgehobenen Art. 628 aOR).',
    },
    {
      id: 'AS07_verrechnung',
      ueberschrift: 'Verrechnungsliberierung',
      text:
        'Bei der Gründung werden {{item.aktien}} Namenaktien zu CHF {{nennwertFmt}} durch Verrechnung ' +
        'mit einer Forderung von {{item.glaeubiger}} im Betrag von CHF {{item.forderungFmt}} liberiert.',
      wiederholeUeber: 'verrListe',
      includeIf: { feld: 'hatVerrechnungen', eq: true },
      norm: 'Art. 634a Abs. 3 OR',
      begruendung: 'Pflichtinhalt bei Verrechnungsliberierung: Betrag der Forderung, Name des Aktionärs, zukommende Aktien (Art. 634a Abs. 3 OR am Cache verifiziert). Eigenständige qualifizierte Liberierungsart — KEINE Sacheinlage; Werthaltigkeit der Forderung ist keine Voraussetzung (Art. 634a Abs. 2 OR).',
      hinweis: 'Die Generalversammlung kann diese Statutenbestimmung erst nach zehn Jahren aufheben (Art. 634a Abs. 3 Satz 2 OR).',
    },
    {
      id: 'AS08_vorteile',
      ueberschrift: 'Besondere Vorteile',
      text:
        'Bei der Gründung wird {{item.beguenstigter}} folgender besonderer Vorteil gewährt: ' +
        '{{item.inhalt}} (Wert: CHF {{item.wertFmt}}).',
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
        'Die Generalversammlung fasst ihre Beschlüsse und vollzieht ihre Wahlen, soweit das Gesetz oder die Statuten es nicht anders bestimmen, mit der Mehrheit der vertretenen Aktienstimmen. Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.\n' +
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
      begruendung: 'ZH-Langvorlage verbatim — Mehrheitserfordernis (Art. 703 OR), statutarischer Stichentscheid des Vorsitzenden sowie der qualifizierte Katalog nach revidiertem Recht (Art. 704 Abs. 1 OR, inkl. Währungswechsel, Kapitalband, Schiedsklausel, GV im Ausland, Sitzverlegung, Stimmrechtsvertreter-Verzicht) und die Verschärfungs-Schranke (Art. 704 Abs. 2 OR). Haus-Anmerkung (Bug-Check B2, 7.6.2026): Ziff. 12 des Gesetzeskatalogs (Dekotierung der Beteiligungspapiere) ist wie in der ZH-Vorlage bewusst weggelassen — sie betrifft nur Gesellschaften mit börsenkotierten Papieren.',
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
        'Das Geschäftsjahr beginnt am {{gjBeginnTxt}} und endet am {{gjEndeTxt}}.\n' +
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
        'Das Aktienkapital der Gesellschaft beträgt CHF {{akFmt}} und ist eingeteilt in {{anzahlAktien}} ' +
        'Namenaktien zu je CHF {{nennwertFmt}} (Nennwert), welche zum Ausgabebetrag von CHF {{nennwertFmt}} ' +
        'je Aktie wie folgt gezeichnet werden:',
      norm: 'Art. 630 Ziff. 1 OR',
      begruendung: 'Zeichnung mit Anzahl, Nennwert, Art und Ausgabebetrag – bei der Gründung in der Urkunde selbst (Art. 44 lit. d HRegV); Ausgabe zum Nennwert (Erstausbau ohne Agio).',
    },
    {
      id: 'AE05_zeichnungsliste',
      text: '– {{item.name}}: {{item.anzahl}} Namenaktien',
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
        'Sämtliche Einlagen von gesamthaft CHF {{akFmt}} wurden in Geld geleistet und sind bei der ' +
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
        'Sämtliche Einlagen von gesamthaft CHF {{akFmt}} wurden in Geld geleistet und gemäss separater ' +
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
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft CHF {{einbezahltFmt}} ({{liberierungProzent}} % ' +
        'des Nennwerts jeder Aktie) in Geld geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach ' +
        'Art. 1 des Bundesgesetzes über die Banken und Sparkassen, zur ausschliesslichen Verfügung der ' +
        'Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'vollLiberiert', eq: false }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung (mind. 20 % je Aktie, gesamthaft mind. CHF 50\'000).',
    },
    {
      id: 'AE07_einlagen_teil_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf dem Aktienkapital wurden Einlagen von gesamthaft CHF {{einbezahltFmt}} ({{liberierungProzent}} % ' +
        'des Nennwerts jeder Aktie) in Geld geleistet und gemäss separater Bescheinigung bei einer Bank nach ' +
        'Art. 1 des Bundesgesetzes über die Banken und Sparkassen zur ausschliesslichen Verfügung der ' +
        'Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'vollLiberiert', eq: false }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 632 OR',
      begruendung: 'Teilliberierung mit separater Bankbescheinigung.',
    },
    // ── Etappe 2: Einlagen bei gemischter und qualifizierter Gründung ───────
    {
      id: 'AE07g_geld_bank',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} Namenaktien wurden Einlagen von gesamthaft CHF {{barEinlageFmt}} in Geld ' +
        'geleistet und bei der {{bankName}}, {{bankOrt}}, einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen, zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'bankInUrkundeGenannt', eq: true }] },
      norm: 'Art. 633 OR',
      begruendung: 'Bar-Anteil der gemischten Gründung (ZH-Bemerkung 3.3: Varianten «mit Ziff. IV der Textvorlage 3.1 kombinierbar»); Banknennung in der Urkunde.',
    },
    {
      id: 'AE07g_geld_bescheinigung',
      ueberschrift: 'Einlagen',
      text:
        'Auf {{barAktienTxt}} Namenaktien wurden Einlagen von gesamthaft CHF {{barEinlageFmt}} in Geld ' +
        'geleistet und gemäss separater Bescheinigung bei einer Bank nach Art. 1 des Bundesgesetzes über ' +
        'die Banken und Sparkassen zur ausschliesslichen Verfügung der Gesellschaft hinterlegt.',
      includeIf: { and: [{ feld: 'istGemischt', eq: true }, { feld: 'hatBarEinlage', eq: true }, { feld: 'bankInUrkundeGenannt', eq: false }] },
      norm: 'Art. 633 OR',
      begruendung: 'Bar-Anteil der gemischten Gründung mit separater Bankbescheinigung.',
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
        '({{item.belegSatz}}; Bewertung CHF {{item.wertFmt}} für {{item.aktien}} Namenaktien{{item.gutschriftKlauselZusatz}}), ' +
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
        '– Verrechnungsliberierung: {{item.aktien}} Namenaktien werden durch Verrechnung mit einer ' +
        'Forderung von {{item.glaeubiger}} im Betrag von CHF {{item.forderungFmt}} liberiert (Art. 634a OR).',
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
      text: '– {{item.name}}, von {{item.herkunft}}, in {{item.wohnort}}{{item.praesidentZeile}}',
      wiederholeUeber: 'vrListe',
      begruendung: 'Je VR-Mitglied eine Zeile (Konstituierung und Zeichnungsberechtigungen folgen im VR-Protokoll, Art. 43 Abs. 1 lit. e HRegV).',
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
      includeIf: { feld: 'eigeneBueros', eq: true },
      norm: 'Art. 117 Abs. 2 HRegV',
      begruendung: 'Eigene Adresse am Sitz.',
    },
    {
      id: 'AE12_domizil_co',
      ueberschrift: 'Rechtsdomizil',
      text:
        'Die Gesellschaft hat ihr Rechtsdomizil als c/o-Adresse bei {{domizilhalterName}}, ' +
        '{{domizilhalterAdresse}}. Die Erklärung der Domizilhalterin bzw. des Domizilhalters liegt vor.',
      includeIf: { feld: 'eigeneBueros', eq: false },
      norm: 'Art. 117 Abs. 3 HRegV',
      begruendung: 'c/o-Domizil mit Domizilannahmeerklärung als Beleg (Art. 43 Abs. 1 lit. g HRegV).',
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
      'beiliegender Inventarliste vom {{belegDatumFmt}} im Wert und zum Preis von CHF {{wertFmt}}.\n' +
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
      '{{bezeichnung}}{{cheZusatz}} gemäss Übernahmebilanz per {{belegDatumFmt}}. Danach betragen die ' +
      'Aktiven CHF {{aktivenFmt}} und die Passiven CHF {{passivenFmt}}. Der Kaufpreis beträgt ' +
      'CHF {{wertFmt}}. Die Bilanz bildet einen Bestandteil dieses Vertrages und wird von den ' +
      'Vertragsparteien anerkannt.',
    includeIf: { feld: 'typGeschaeft', eq: true },
    norm: 'Art. 634 OR',
    begruendung: 'ZH-Vorlage «Sacheinlagevertrag Geschäft» verbatim (Übernahme aller Aktiven und Passiven eines Einzelunternehmens mit Übernahmebilanz).',
  },
  {
    id: 'SV03_gegenleistung',
    ueberschrift: 'Gegenleistung',
    text:
      'Als Gegenleistung erhält {{einlegerName}} {{aktien}} als voll liberiert geltende Namenaktien ' +
      'der Gesellschaft zu nominal CHF {{nennwertFmt}}.{{gutschriftSatz}}',
    norm: 'Art. 634 Abs. 4 OR',
    begruendung: 'Gegenleistung nach den ZH-Vorlagen («als voll liberiert geltende Aktien … zu nominal»); Gutschrift-Satz = weitere Gegenleistung (Art. 634 Abs. 4 OR), nur wenn erfasst.',
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
        'Auf Grund obiger Feststellungen kann die Bewertung der Sacheinlage mit CHF {{item.wertFmt}} als angemessen bezeichnet werden.',
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
        'CHF {{item.forderungFmt}} besteht und ist verrechenbar. Begründung: {{item.begruendungTxt}}',
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
        '(Wert: CHF {{item.wertFmt}}). Begründung und Angemessenheit: {{item.begruendungTxt}}',
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

  if (hat('wahlannahme-vr')) {
    // Review-Befund M-1 (7.6.2026): Index-ID gegen Namens-Kollisionen;
    // zudem NIEDRIG-1: Auslöser-Etikett wie bei der GmbH führen.
    a.verwaltungsraete.filter((x) => x.name.trim()).forEach((v, i) => {
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

  if (hat('vr-konstituierung')) {
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

  dokumente.push({
    id: 'hr-anmeldung',
    titel: 'Handelsregister-Anmeldung',
    dateiName: 'ag-hr-anmeldung',
    ergebnis: assemble(ANMELDUNG_SCHEMA, {
      ...basis,
      belegeAnmeldung,
      anmeldeAdresseZeile: a.eigeneBueros
        ? (a.rechtsdomizilAdresse.trim() || '________')
        : `c/o ${a.domizilhalterName.trim() || '________'}, ${a.domizilhalterAdresse.trim() || '________'}`,
    }),
  });

  return { dokumente, gates };
}
