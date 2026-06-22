// Dossier: bibliothek/recherche/ag-gruendung-amtliche-vorlagen.md · bibliothek/recherche/ag-qualifizierte-gruendung.md

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

import type { VorlageSchema, Antworten, AssembleErgebnis } from './engine';
import { assemble, nummeriereUeberschriftenAlsArtikel } from './engine';
import { fmtCHF, fmtDatum, ganzePositive, zahl } from './datum';
import { effektiveLiberierung } from './kapitalKern';
import { agGruendungsunterlagen } from '../gruendungsunterlagen';
import { AG_FREMDWAEHRUNGEN, VR_ZEICHNUNGS_LABEL, VERTRETUNGS_ZEICHNUNGS_LABEL, type AgDokAntworten } from './gruendungAgDokumenteTypen';
import { pruefeAgDokGates, type AgDokGates } from './gruendungAgDokumenteGates';
export * from './gruendungAgDokumenteTypen';
export * from './gruendungAgDokumenteGates';

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
