import { useEffect, useMemo, useRef, useState } from 'react';
import { agGruendungsunterlagen, type EinlageArt, finmaBegriffsTreffer } from '../lib/gruendungsunterlagen';
import { Field, inputCls } from '../components/vorlagen/ui';
import { NormText } from '../components/NormText';
import { VorlagenWizardRahmen, VorschauPanel } from '../components/vorlagen/wizard';
import { karte } from '../lib/startseiteConfig';
import { BANNER_MAPPE_FERTIG } from '../lib/vorlagen/banner';
import { getAusgabeStil } from '../components/vorlagen/ausgabeStil';
import {
  agDokumentmappe,
  AG_DOK_DEFAULTS,
  AG_FREMDWAEHRUNGEN,
  type AgDokAntworten,
  type AgGruenderZeile,
  type AgVrZeile,
  type AgVertretungsZeile,
  type AgSacheinlageZeile,
  type AgVerrechnungZeile,
  type AgVorteilZeile,
  type AgWaehrung,
} from '../lib/vorlagen/gruendungAgDokumente';
import { KANTONE } from '../lib/kantone';

// ─── Maske: AG-Gründung als WIZARD (Auftrag David 7.6.2026) ──────────────────
// Durchklickbar analog der anderen Vorlagen-Masken (VorlagenWizardRahmen):
// Konstellation → Gesellschaft → Kapital & Einlagen → Personen → Weiteres →
// Dokumente (Checkliste + Mappe + Sammel-Download). Rechtslogik vollständig
// in lib/vorlagen/gruendungAgDokumente.ts und lib/gruendungsunterlagen.ts
// (§3/§5); hier nur Darstellung und Eingabesammlung.

import { SCHRITTE, BEREICH_SCHRITT, BANNER_ENTWURF, VR_ZEICHNUNGS_OPTIONEN, VERTRETUNGS_ZEICHNUNGS_OPTIONEN, STORAGE_KEY, ladeStand, txt, bool, wahl, zeilenGuard, GRUENDER_LEER, VR_LEER, VERTRETUNG_LEER, SACHEINLAGE_LEER, VERRECHNUNG_LEER, VORTEIL_LEER } from './vorlagenAgGruendungDaten';
import type { AgSchrittCtx } from './vorlage-ag-gruendung/ctx';
import { SchrittKonstellation, SchrittGesellschaft, SchrittKapital, SchrittPersonen, SchrittWeiteres } from './vorlage-ag-gruendung/schritte-eingabe';
import { SchrittDokumente } from './vorlage-ag-gruendung/schritte-dokumente';

export function VorlageAgGruendung() {
  const card = karte('ag-gruendung');

  // Punkt 7: gespeicherter Stand wird GENAU EINMAL gelesen (Lazy-Init);
  // alle Eingabe-States hydratisieren daraus mit Typ-Guards.
  const [stand] = useState(ladeStand);

  // ── Schritt-Navigation ──
  const [schritt, setSchritt] = useState(0);

  // ── Konstellation (Checklisten-Weichen, §5) ──
  const [einlageArt, setEinlageArt] = useState<EinlageArt>(() => wahl(stand?.einlageArt, ['bar', 'sacheinlage', 'verrechnung', 'gemischt'], 'bar'));
  const [besondereVorteile, setBesondereVorteile] = useState(() => bool(stand?.besondereVorteile, false));
  const [optingOut, setOptingOut] = useState(() => bool(stand?.optingOut, true));
  const [eigeneBueros, setEigeneBueros] = useState(() => bool(stand?.eigeneBueros, true));
  const [immobilienHauptzweck, setImmobilienHauptzweck] = useState(() => bool(stand?.immobilienHauptzweck, false));
  const [inhaberaktien, setInhaberaktien] = useState(() => bool(stand?.inhaberaktien, false));
  const [fremdwaehrung, setFremdwaehrung] = useState(() => bool(stand?.fremdwaehrung, false));
  const [bankInUrkunde, setBankInUrkunde] = useState(() => bool(stand?.bankInUrkunde, true));
  const [chVertretung, setChVertretung] = useState(() => bool(stand?.chVertretung, true));
  const [leistungen, setLeistungen] = useState(() => txt(stand?.leistungen, ''));

  // ── Gesellschaft & Statuten ──
  const [firma, setFirma] = useState(() => txt(stand?.firma, ''));
  const [sitz, setSitz] = useState(() => txt(stand?.sitz, ''));
  const [kanton, setKanton] = useState<string>(() => wahl(stand?.kanton, KANTONE, 'ZH'));
  const [zweck, setZweck] = useState(() => txt(stand?.zweck, ''));
  const [zweckErweiterung, setZweckErweiterung] = useState(() => bool(stand?.zweckErweiterung, true));
  const [statutenUmfang, setStatutenUmfang] = useState<AgDokAntworten['statutenUmfang']>(() => wahl(stand?.statutenUmfang, ['kurz', 'lang'], 'kurz'));
  const [vinkulierung, setVinkulierung] = useState(() => bool(stand?.vinkulierung, false));
  const [virtuelleGv, setVirtuelleGv] = useState(() => bool(stand?.virtuelleGv, false));
  // Stufe 2 P2: Inhaberaktien-Voraussetzung (Art. 622 Abs. 1bis OR).
  const [inhaberKotiert, setInhaberKotiert] = useState(() => bool(stand?.inhaberKotiert, false));
  const [verwahrungsstelle, setVerwahrungsstelle] = useState(() => txt(stand?.verwahrungsstelle, ''));
  // Stufe 2 P3: Statuten-Zusatzklauseln.
  const [schiedsklausel, setSchiedsklausel] = useState(() => bool(stand?.schiedsklausel, false));
  const [schiedsOrt, setSchiedsOrt] = useState(() => txt(stand?.schiedsOrt, ''));
  const [kapitalband, setKapitalband] = useState(() => bool(stand?.kapitalband, false));
  const [kbUntergrenze, setKbUntergrenze] = useState(() => txt(stand?.kbUntergrenze, ''));
  const [kbObergrenze, setKbObergrenze] = useState(() => txt(stand?.kbObergrenze, ''));
  const [kbEndeDatum, setKbEndeDatum] = useState(() => txt(stand?.kbEndeDatum, ''));
  const [kbRichtung, setKbRichtung] = useState<AgDokAntworten['kbRichtung']>(() => wahl(stand?.kbRichtung, ['erhoehen', 'beide'], 'erhoehen'));
  const [bedingtesKapital, setBedingtesKapital] = useState(() => bool(stand?.bedingtesKapital, false));
  const [bkBetrag, setBkBetrag] = useState(() => txt(stand?.bkBetrag, ''));
  const [bkKreis, setBkKreis] = useState(() => txt(stand?.bkKreis, ''));
  const [stichentscheidGv, setStichentscheidGv] = useState(() => bool(stand?.stichentscheidGv, true));
  const [gjErstesEnde, setGjErstesEnde] = useState(() => txt(stand?.gjErstesEnde, ''));
  const [gjBeginn, setGjBeginn] = useState(() => txt(stand?.gjBeginn, AG_DOK_DEFAULTS.gjBeginn));
  const [gjEnde, setGjEnde] = useState(() => txt(stand?.gjEnde, AG_DOK_DEFAULTS.gjEnde));

  // ── Kapital & Einlagen ──
  const [ak, setAk] = useState(() => txt(stand?.ak, AG_DOK_DEFAULTS.aktienkapitalChf));
  const [anzahl, setAnzahl] = useState(() => txt(stand?.anzahl, AG_DOK_DEFAULTS.anzahlAktien));
  const [nennwert, setNennwert] = useState(() => txt(stand?.nennwert, AG_DOK_DEFAULTS.nennwertChf));
  const [liberierung, setLiberierung] = useState(() => txt(stand?.liberierung, AG_DOK_DEFAULTS.liberierungProzent));
  const [ausgabebetrag, setAusgabebetrag] = useState(() => txt(stand?.ausgabebetrag, ''));
  const [waehrung, setWaehrung] = useState<AgWaehrung>(() => wahl(stand?.waehrung, AG_FREMDWAEHRUNGEN, 'EUR'));
  const [kursChf, setKursChf] = useState(() => txt(stand?.kursChf, ''));
  const [kursQuelle, setKursQuelle] = useState(() => txt(stand?.kursQuelle, ''));
  const [bankName, setBankName] = useState(() => txt(stand?.bankName, ''));
  const [bankOrt, setBankOrt] = useState(() => txt(stand?.bankOrt, ''));
  const [sacheinlagen, setSacheinlagen] = useState<(AgSacheinlageZeile & { key: number })[]>(
    () => zeilenGuard<AgSacheinlageZeile>(stand?.sacheinlagen, SACHEINLAGE_LEER, { typ: ['sachgesamtheit', 'geschaeft'] }));
  const [verrechnungen, setVerrechnungen] = useState<(AgVerrechnungZeile & { key: number })[]>(
    () => zeilenGuard<AgVerrechnungZeile>(stand?.verrechnungen, VERRECHNUNG_LEER));
  const [vorteile, setVorteile] = useState<(AgVorteilZeile & { key: number })[]>(
    () => zeilenGuard<AgVorteilZeile>(stand?.vorteile, VORTEIL_LEER));
  const [revisorName, setRevisorName] = useState(() => txt(stand?.revisorName, ''));

  // ── Personen & Organe ──
  const [gruender, setGruender] = useState<(AgGruenderZeile & { key: number })[]>(
    () => zeilenGuard<AgGruenderZeile>(stand?.gruender, GRUENDER_LEER));
  const [vr, setVr] = useState<(AgVrZeile & { key: number })[]>(
    () => zeilenGuard<AgVrZeile>(stand?.vr, VR_LEER, { zeichnungsArt: VR_ZEICHNUNGS_OPTIONEN.map((o) => o.id) }));
  const [vertretungen, setVertretungen] = useState<(AgVertretungsZeile & { key: number })[]>(
    () => zeilenGuard<AgVertretungsZeile>(stand?.vertretungen, VERTRETUNG_LEER, { zeichnungsArt: VERTRETUNGS_ZEICHNUNGS_OPTIONEN.map((o) => o.id) }));
  const [protokollfuehrer, setProtokollfuehrer] = useState(() => txt(stand?.protokollfuehrer, ''));
  const [sitzungBeginn, setSitzungBeginn] = useState(() => txt(stand?.sitzungBeginn, ''));
  const [sitzungEnde, setSitzungEnde] = useState(() => txt(stand?.sitzungEnde, ''));
  const [rsName, setRsName] = useState(() => txt(stand?.rsName, ''));
  const [rsSitz, setRsSitz] = useState(() => txt(stand?.rsSitz, ''));

  // ── Domizil & Optionen ──
  const [rechtsdomizil, setRechtsdomizil] = useState(() => txt(stand?.rechtsdomizil, ''));
  const [domizilhalterName, setDomizilhalterName] = useState(() => txt(stand?.domizilhalterName, ''));
  const [domizilhalterAdresse, setDomizilhalterAdresse] = useState(() => txt(stand?.domizilhalterAdresse, ''));
  const [konstituierungInUrkunde, setKonstituierungInUrkunde] = useState(() => bool(stand?.konstituierungInUrkunde, false));
  const [domizilNurAnmeldung, setDomizilNurAnmeldung] = useState(() => bool(stand?.domizilNurAnmeldung, false));
  const [nachtragsbevollmaechtigter, setNachtragsbevollmaechtigter] = useState(() => txt(stand?.nachtragsbevollmaechtigter, ''));
  const [lkAusland, setLkAusland] = useState(() => bool(stand?.lkAusland, false));
  const [lkNeuerwerb, setLkNeuerwerb] = useState(() => bool(stand?.lkNeuerwerb, false));
  const [lkGrundstueck, setLkGrundstueck] = useState(() => bool(stand?.lkGrundstueck, false));
  const [nachtragAktiv, setNachtragAktiv] = useState(() => bool(stand?.nachtragAktiv, false));
  const [ntGruendungsdatum, setNtGruendungsdatum] = useState(() => txt(stand?.ntGruendungsdatum, ''));
  const [ntUrkundeZiffer, setNtUrkundeZiffer] = useState(() => txt(stand?.ntUrkundeZiffer, ''));
  const [ntUrkundeText, setNtUrkundeText] = useState(() => txt(stand?.ntUrkundeText, ''));
  const [ntStatutenArtikel, setNtStatutenArtikel] = useState(() => txt(stand?.ntStatutenArtikel, ''));
  const [ntStatutenAbsatz, setNtStatutenAbsatz] = useState(() => txt(stand?.ntStatutenAbsatz, ''));
  const [ntStatutenText, setNtStatutenText] = useState(() => txt(stand?.ntStatutenText, ''));
  const [ort, setOrt] = useState(() => txt(stand?.ort, ''));
  // Punkt 7: Datum-Default «heute» NUR, wenn kein gespeicherter Wert vorliegt.
  // E2-1: LOKALE Zeit (toLocaleDateString 'sv-SE') statt toISOString (UTC) — sonst
  // zwischen 00:00 und 01/02:00 Schweizer Zeit der Vortag beim Beurkundungsdatum.
  const [datum, setDatum] = useState(() => txt(stand?.datum, '') || new Date().toLocaleDateString('sv-SE'));

  // Zähler über den gespeicherten Stand heben: Hydration vergibt je Liste die
  // Keys 1…n neu, der Zähler startet darum oberhalb der längsten Liste (und
  // mindestens beim gespeicherten Zählerstand).
  const naechsterKey = useRef(Math.max(
    typeof stand?.naechsterKey === 'number' && Number.isInteger(stand.naechsterKey) ? stand.naechsterKey : 1,
    1 + Math.max(0, ...[stand?.gruender, stand?.vr, stand?.vertretungen, stand?.sacheinlagen, stand?.verrechnungen, stand?.vorteile]
      .map((a) => (Array.isArray(a) ? a.length : 0))),
  ));
  const neuerKey = () => naechsterKey.current++;

  const weichen = useMemo(() => {
    const betrag = Number(leistungen.replace(/['’\s]/g, ''));
    return {
      einlageArt,
      besondereVorteile,
      optingOut,
      eigeneBueros,
      immobilienHauptzweck,
      inhaberaktien,
      fremdwaehrung,
      bankInUrkundeGenannt: bankInUrkunde,
      chWohnsitzVertretung: chVertretung,
      leistungenChf: leistungen.trim() === '' || Number.isNaN(betrag) ? undefined : betrag,
    };
  }, [einlageArt, besondereVorteile, optingOut, eigeneBueros, immobilienHauptzweck, inhaberaktien, fremdwaehrung, bankInUrkunde, chVertretung, leistungen]);

  const checkliste = useMemo(() => agGruendungsunterlagen(weichen), [weichen]);

  const antworten: AgDokAntworten = useMemo(() => ({
    ...weichen,
    ...AG_DOK_DEFAULTS,
    firma, sitz, kanton, zweck, zweckErweiterung,
    aktienkapitalChf: ak, anzahlAktien: anzahl, nennwertChf: nennwert,
    liberierungProzent: liberierung, ausgabebetragChf: ausgabebetrag,
    gruender, verwaltungsraete: vr, weitereVertretungen: vertretungen,
    protokollfuehrerName: protokollfuehrer,
    bankName, bankOrt, rechtsdomizilAdresse: rechtsdomizil,
    domizilhalterName, domizilhalterAdresse,
    revisionsstelleName: rsName, revisionsstelleSitz: rsSitz,
    vinkulierung, virtuelleGv, statutenUmfang, gjBeginn, gjEnde,
    inhaberKotiert, verwahrungsstelle,
    schiedsklausel, schiedsOrt, kapitalband, kbUntergrenze, kbObergrenze,
    kbEndeDatum, kbRichtung, bedingtesKapital, bkBetrag, bkKreis,
    stichentscheidGv, gjErstesEnde,
    sitzungBeginn, sitzungEnde, nachtragsbevollmaechtigter,
    waehrung, kursChf, kursQuelle,
    lexKollerAuslandBeteiligt: lkAusland, lexKollerNeuerwerb: lkNeuerwerb, lexKollerGrundstueckErwerb: lkGrundstueck,
    konstituierungInUrkunde, domizilNurAnmeldung,
    nachtragAktiv, nachtragGruendungsdatum: ntGruendungsdatum,
    nachtragUrkundeZiffer: ntUrkundeZiffer, nachtragUrkundeText: ntUrkundeText,
    nachtragStatutenArtikel: ntStatutenArtikel, nachtragStatutenAbsatz: ntStatutenAbsatz, nachtragStatutenText: ntStatutenText,
    sacheinlagen, verrechnungen, vorteile, revisorName, ort, datum,
  }), [weichen, firma, sitz, kanton, zweck, zweckErweiterung, ak, anzahl, nennwert, liberierung,
    gruender, vr, vertretungen, protokollfuehrer, bankName, bankOrt, rechtsdomizil,
    domizilhalterName, domizilhalterAdresse, rsName, rsSitz, vinkulierung, virtuelleGv,
    inhaberKotiert, verwahrungsstelle,
    schiedsklausel, schiedsOrt, kapitalband, kbUntergrenze, kbObergrenze,
    kbEndeDatum, kbRichtung, bedingtesKapital, bkBetrag, bkKreis,
    stichentscheidGv, gjErstesEnde,
    statutenUmfang, gjBeginn, gjEnde, sitzungBeginn, sitzungEnde, nachtragsbevollmaechtigter,
    waehrung, kursChf, kursQuelle, lkAusland, lkNeuerwerb, lkGrundstueck,
    ausgabebetrag, konstituierungInUrkunde, domizilNurAnmeldung,
    nachtragAktiv, ntGruendungsdatum, ntUrkundeZiffer, ntUrkundeText,
    ntStatutenArtikel, ntStatutenAbsatz, ntStatutenText,
    sacheinlagen, verrechnungen, vorteile, revisorName, ort, datum]);

  const mappe = useMemo(() => agDokumentmappe(antworten), [antworten]);

  // Stufe 2 P1a: Beträge der qualifizierten Gründung sind Beträge in der
  // KAPITALWÄHRUNG — die Feld-Labels führen den wirksamen Währungscode.
  const wc = fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(waehrung) ? waehrung : 'CHF';

  // Etappe 5/D23: FINMA-Wortprüfung über Firma + Zweck — Regel lebt in der
  // Engine-Schicht (gruendungsunterlagen.finmaBegriffsTreffer, §3).
  const finmaTreffer = useMemo(() => finmaBegriffsTreffer(firma, zweck), [firma, zweck]);

  // Praxis-Runde (Auftrag David): Blocker klickbar — Klick springt zum
  // Schritt, in dem die Eingabe liegt (Bereichs-Tag aus den Engine-Gates).
  const blockerKlickbar = (titel: string) => mappe.gates.blockerDetails.length === 0 ? null : (
    <div className="rounded-md bg-danger-bg p-3 space-y-1.5" role="alert">
      <p className="text-body-s font-medium text-danger-700">{titel}</p>
      {mappe.gates.blockerDetails.map((b) => (
        <button key={b.text} type="button"
          onClick={() => setSchritt(BEREICH_SCHRITT[b.bereich])}
          className="block w-full text-left text-body-s text-danger-700 hover:underline">
          • {b.text} <span aria-hidden>→ {SCHRITTE[BEREICH_SCHRITT[b.bereich]].label}</span>
        </button>
      ))}
    </div>
  );

  // Punkt 7: ALLE Eingabe-States (inkl. Weichen, Arrays und Key-Zähler) als
  // versioniertes JSON zwischenspeichern. Läuft nach jedem Render — jeder
  // Tastendruck rendert ohnehin, das Schreiben ist günstig und idempotent.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: 1,
        stand: {
          einlageArt, besondereVorteile, optingOut, eigeneBueros, immobilienHauptzweck,
          inhaberaktien, fremdwaehrung, bankInUrkunde, chVertretung, leistungen,
          firma, sitz, kanton, zweck, zweckErweiterung, statutenUmfang, vinkulierung,
          virtuelleGv, gjBeginn, gjEnde, inhaberKotiert, verwahrungsstelle,
          schiedsklausel, schiedsOrt, kapitalband, kbUntergrenze, kbObergrenze,
          kbEndeDatum, kbRichtung, bedingtesKapital, bkBetrag, bkKreis,
          stichentscheidGv, gjErstesEnde,
          ak, anzahl, nennwert, liberierung, ausgabebetrag, waehrung, kursChf, kursQuelle,
          bankName, bankOrt, sacheinlagen, verrechnungen, vorteile, revisorName,
          gruender, vr, vertretungen, protokollfuehrer, sitzungBeginn, sitzungEnde, rsName, rsSitz,
          rechtsdomizil, domizilhalterName, domizilhalterAdresse, konstituierungInUrkunde,
          domizilNurAnmeldung, nachtragsbevollmaechtigter, lkAusland, lkNeuerwerb, lkGrundstueck,
          nachtragAktiv, ntGruendungsdatum, ntUrkundeZiffer, ntUrkundeText,
          ntStatutenArtikel, ntStatutenAbsatz, ntStatutenText, ort, datum,
          naechsterKey: naechsterKey.current,
        },
      }));
    } catch {
      // Speicher blockiert/voll → Zwischenspeicherung still aus; die Maske
      // funktioniert unverändert (nichts verlässt den Browser, §8).
    }
  });

  // Punkt 6 (Perfektion): Sammel-Download als EIN ZIP — alle Dokumente der
  // Mappe via vorlagenPdfDokument (jsPDF-Doc, NICHT …Erzeugen) zu
  // ArrayBuffers, mit fflate gepackt; Banner je ausgabeArt wie beim
  // Einzel-Export. Einzel-Downloads (MappenAnsicht) bleiben bestehen.
  // Auftrag David 7.6.2026: neben PDF auch Word — je Dokument liegt
  // zusätzlich ein DOCX im ZIP (Form-Gate §8 prüft vorlagenDocxDokument).
  const docxErlaubt = card?.modus === 'vorlage' && (card.output?.includes('docx') ?? false);
  const [batchLaeuft, setBatchLaeuft] = useState(false);
  const [batchMeldung, setBatchMeldung] = useState<string | null>(null);
  const alleHerunterladen = async () => {
    setBatchLaeuft(true);
    setBatchMeldung(null);
    try {
      const [{ vorlagenPdfDokument }, { vorlagenDocxDokument }, { zipSync }] = await Promise.all([
        import('../lib/vorlagen/vorlagenPdf'),
        import('../lib/vorlagen/vorlagenDocx'),
        import('fflate'),
      ]);
      const eintraege: Record<string, Uint8Array> = {};
      // Mehrere gleichnamige Dokumente (z. B. zwei Sacheinlageverträge)
      // dürfen sich im ZIP nicht überschreiben → Suffix -2, -3, …
      const frei = (basis: string, endung: string) => {
        let name = `${basis}.${endung}`;
        for (let n = 2; name in eintraege; n++) name = `${basis}-${n}.${endung}`;
        return name;
      };
      const docxUebersprungen: string[] = [];
      // Gewählten Ausgabe-Stil (nüchtern⇄modern) auch im Sammel-ZIP
      // respektieren — sonst ignoriert der Bulk-Export die Wizard-Wahl.
      const stil = getAusgabeStil();
      for (const d of mappe.dokumente) {
        const entwurf = d.ergebnis.dokument.ausgabeArt === 'entwurf';
        const banner = entwurf ? BANNER_ENTWURF : BANNER_MAPPE_FERTIG;
        const doc = vorlagenPdfDokument(d.ergebnis, { banner, stil });
        eintraege[frei(d.dateiName, 'pdf')] = new Uint8Array(doc.output('arraybuffer'));
        if (docxErlaubt) {
          // Per-Dokument-Guard (Bug-Check 7.6.2026 N-1): ein einzelnes
          // Word-gesperrtes Dokument (z. B. künftige abschrift-Ausgabe-
          // art, §8-Gate in vorlagenDocx) darf nicht den GESAMTEN ZIP
          // abbrechen — das PDF ist dann schon drin, Word wird ehrlich
          // als übersprungen gemeldet.
          try {
            const blob = await vorlagenDocxDokument(d.ergebnis, { banner, stil });
            eintraege[frei(d.dateiName, 'docx')] = new Uint8Array(await blob.arrayBuffer());
          } catch {
            docxUebersprungen.push(d.dateiName);
          }
        }
      }
      const slug = (firma.trim().toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || 'ag';
      const blob = new Blob([zipSync(eintraege)], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gruendung-${slug}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      const docxHinweis = docxUebersprungen.length > 0
        ? `, Word übersprungen für: ${docxUebersprungen.join(', ')}`
        : (docxErlaubt ? ', je als PDF und Word' : '');
      setBatchMeldung(`${mappe.dokumente.length} Dokumente als ZIP heruntergeladen (gruendung-${slug}.zip${docxHinweis}).`);
    } catch (e) {
      setBatchMeldung(e instanceof Error ? e.message : 'Der Sammel-Download ist fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setBatchLaeuft(false);
    }
  };

  // Punkt 7: Zurücksetzen löscht auch die lokale Zwischenspeicherung —
  // sonst hydratisiert der Reload den alten Stand sofort wieder.
  const zuruecksetzen = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Speicher blockiert — Reload setzt dann nur die Sitzung zurück.
    }
    window.location.reload();
  };

  // P9 (Perfektion): «Mit Musterdaten füllen» — kompletter Demo-Datensatz,
  // Werte aus dem Golden-Fall ag:gemischt-qualifiziert (scripts/golden-
  // outputs.ts): gemischte qualifizierte Gründung mit Sacheinlage
  // (Geschäft, Grundstück), Verrechnung, besonderen Vorteilen, c/o-Domizil,
  // Revisionsstelle und Lex Koller.
  const musterdatenFuellen = () => {
    setEinlageArt('gemischt'); setBesondereVorteile(true); setOptingOut(false);
    setEigeneBueros(false); setImmobilienHauptzweck(true); setInhaberaktien(false);
    setFremdwaehrung(false); setBankInUrkunde(true); setChVertretung(true); setLeistungen('');
    setFirma('Golden Muster AG'); setSitz('Zürich'); setKanton('ZH'); setZweck('Beteiligungen');
    setZweckErweiterung(true); setStatutenUmfang('kurz'); setVinkulierung(false); setVirtuelleGv(false);
    setInhaberKotiert(false); setVerwahrungsstelle('');
    setSchiedsklausel(false); setSchiedsOrt(''); setKapitalband(false); setBedingtesKapital(false);
    setGjBeginn(AG_DOK_DEFAULTS.gjBeginn); setGjEnde(AG_DOK_DEFAULTS.gjEnde); setGjErstesEnde('');
    setAk("400'000"); setAnzahl('400'); setNennwert("1'000"); setLiberierung('100'); setAusgabebetrag('');
    setBankName('Zürcher Kantonalbank'); setBankOrt('Zürich');
    setGruender([
      { key: neuerKey(), name: 'Anna Muster', angaben: 'von Basel, in Zürich', anzahl: '300', liberierung: '' },
      { key: neuerKey(), name: 'Beat Beispiel', angaben: 'von Bern, in Bern', anzahl: '100', liberierung: '' },
    ]);
    setVr([
      { key: neuerKey(), name: 'Anna Muster', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' },
      { key: neuerKey(), name: 'Beat Beispiel', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
    ]);
    setVertretungen([]);
    setSacheinlagen([{
      key: neuerKey(), typ: 'geschaeft', bezeichnung: 'Werkbau Muster', belegDatum: '2025-12-31',
      wertChf: "110'000", grundstueck: true, einlegerName: 'Anna Muster', aktienAnzahl: '100',
      gutschriftChf: "10'000", zustand: 'Liegenschaft zum Fortführungswert; Maschinenpark gemäss Anlagespiegel.',
      imHrEingetragen: true, cheNr: 'CHE-111.222.333', aktivenChf: "260'000", passivenChf: "150'000",
      rueckwirkungDatum: '2026-01-01',
    }]);
    setVerrechnungen([{ key: neuerKey(), glaeubigerName: 'Beat Beispiel', forderungChf: "50'000", aktienAnzahl: '50', begruendungTxt: 'Darlehen vom 01.02.2025, valutiert und fällig.' }]);
    setVorteile([{ key: neuerKey(), beguenstigter: 'Anna Muster', inhalt: 'Vorkaufsrecht an der Werkhalle zum Verkehrswert', wertChf: "5'000", begruendungTxt: 'Abgeltung der Aufbauarbeit.' }]);
    setRevisorName('Revisia AG'); setRsName('Revisia AG'); setRsSitz('Zürich');
    setProtokollfuehrer(''); setSitzungBeginn('11.00'); setSitzungEnde('11.30');
    setRechtsdomizil(''); setDomizilhalterName('Treuhand Muster AG'); setDomizilhalterAdresse('Bahnhofstrasse 10, 8001 Zürich');
    setKonstituierungInUrkunde(false); setDomizilNurAnmeldung(false); setNachtragsbevollmaechtigter('');
    setLkAusland(false); setLkNeuerwerb(false); setLkGrundstueck(true);
    setNachtragAktiv(false);
    setOrt('Zürich'); setDatum('2026-06-15');
  };

  // ── Schritt-Inhalte ──
  // §6-Datei-Split (Ziff. 6): die Schritt-Renderer liegen in Geschwister-
  // Dateien (src/pages/vorlage-ag-gruendung/). Alle Werte/Setter/Helfer aus dem
  // Komponenten-Scope werden in EINEM Ctx-Objekt gebündelt und unverändert an
  // die Render-Funktionen durchgereicht — reine Darstellung (§3), die JSX-
  // Bodies bleiben byte-identisch.
  const ctx: AgSchrittCtx = {
    einlageArt, setEinlageArt, besondereVorteile, setBesondereVorteile,
    optingOut, setOptingOut, eigeneBueros, setEigeneBueros,
    immobilienHauptzweck, setImmobilienHauptzweck, inhaberaktien, setInhaberaktien,
    fremdwaehrung, setFremdwaehrung, bankInUrkunde, setBankInUrkunde,
    chVertretung, setChVertretung, leistungen, setLeistungen,
    firma, setFirma, sitz, setSitz, kanton, setKanton, zweck, setZweck,
    zweckErweiterung, setZweckErweiterung, statutenUmfang, setStatutenUmfang,
    vinkulierung, setVinkulierung, virtuelleGv, setVirtuelleGv,
    inhaberKotiert, setInhaberKotiert, verwahrungsstelle, setVerwahrungsstelle,
    schiedsklausel, setSchiedsklausel, schiedsOrt, setSchiedsOrt,
    kapitalband, setKapitalband, kbUntergrenze, setKbUntergrenze,
    kbObergrenze, setKbObergrenze, kbEndeDatum, setKbEndeDatum,
    kbRichtung, setKbRichtung, bedingtesKapital, setBedingtesKapital,
    bkBetrag, setBkBetrag, bkKreis, setBkKreis,
    stichentscheidGv, setStichentscheidGv, gjErstesEnde, setGjErstesEnde,
    gjBeginn, setGjBeginn, gjEnde, setGjEnde,
    ak, setAk, anzahl, setAnzahl, nennwert, setNennwert,
    liberierung, setLiberierung, ausgabebetrag, setAusgabebetrag,
    waehrung, setWaehrung, kursChf, setKursChf, kursQuelle, setKursQuelle,
    bankName, setBankName, bankOrt, setBankOrt,
    sacheinlagen, setSacheinlagen, verrechnungen, setVerrechnungen,
    vorteile, setVorteile, revisorName, setRevisorName,
    gruender, setGruender, vr, setVr, vertretungen, setVertretungen,
    protokollfuehrer, setProtokollfuehrer, sitzungBeginn, setSitzungBeginn,
    sitzungEnde, setSitzungEnde, rsName, setRsName, rsSitz, setRsSitz,
    rechtsdomizil, setRechtsdomizil, domizilhalterName, setDomizilhalterName,
    domizilhalterAdresse, setDomizilhalterAdresse,
    konstituierungInUrkunde, setKonstituierungInUrkunde,
    domizilNurAnmeldung, setDomizilNurAnmeldung,
    nachtragsbevollmaechtigter, setNachtragsbevollmaechtigter,
    lkAusland, setLkAusland, lkNeuerwerb, setLkNeuerwerb,
    lkGrundstueck, setLkGrundstueck, nachtragAktiv, setNachtragAktiv,
    ntGruendungsdatum, setNtGruendungsdatum, ntUrkundeZiffer, setNtUrkundeZiffer,
    ntUrkundeText, setNtUrkundeText, ntStatutenArtikel, setNtStatutenArtikel,
    ntStatutenAbsatz, setNtStatutenAbsatz, ntStatutenText, setNtStatutenText,
    ort, setOrt, datum, setDatum,
    wc, finmaTreffer, checkliste, mappe, card, neuerKey,
    musterdatenFuellen, blockerKlickbar, alleHerunterladen, batchLaeuft, batchMeldung,
  };
  const inhalteRoh = [
    <SchrittKonstellation ctx={ctx} />,
    <SchrittGesellschaft ctx={ctx} />,
    <SchrittKapital ctx={ctx} />,
    <SchrittPersonen ctx={ctx} />,
    <SchrittWeiteres ctx={ctx} />,
    <SchrittDokumente ctx={ctx} />,
  ];
  // In den Eingabe-Schritten unten eine kompakte, klickbare Offen-Liste
  // (Engine-Reihenfolge; Praxis-Check NIEDRIG-2: Kommentar präzisiert).
  const inhalte = inhalteRoh.map((inhalt, i) => i === inhalteRoh.length - 1 ? inhalt : (
    <div className="space-y-4">
      {/* P10 (Perfektion): Feldmarkierung — der Schritt, in dem Eingaben
          fehlen, trägt oben eine rote Sektion mit SEINEN Blockern
          (Zuordnung aus den Engine-Bereichs-Tags, §3). */}
      {mappe.gates.blockerDetails.some((b) => BEREICH_SCHRITT[b.bereich] === i) && (
        <div className="rounded-md border border-danger-700/40 bg-danger-bg p-3 space-y-1" role="alert">
          <p className="text-body-s font-medium text-danger-700">In diesem Schritt noch offen:</p>
          {mappe.gates.blockerDetails.filter((b) => BEREICH_SCHRITT[b.bereich] === i).map((b) => (
            <p key={b.text} className="text-body-s text-danger-700">• {b.text}</p>
          ))}
        </div>
      )}
      {inhalt}
      {mappe.gates.blockerDetails.length > 0 && (
        <details className="rounded-md border border-line bg-surface p-3">
          <summary className="cursor-pointer select-none text-body-s text-ink-700">
            Für die Dokumente noch offen: {mappe.gates.blockerDetails.length} Punkt{mappe.gates.blockerDetails.length === 1 ? '' : 'e'}
          </summary>
          <div className="pt-2 space-y-1">
            {mappe.gates.blockerDetails.map((b) => (
              <button key={b.text} type="button"
                onClick={() => setSchritt(BEREICH_SCHRITT[b.bereich])}
                className="block w-full text-left text-body-s text-ink-700 hover:text-brass-700 hover:underline">
                • {b.text} <span aria-hidden className="text-ink-500">→ {SCHRITTE[BEREICH_SCHRITT[b.bereich]].label}</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  ));

  // P8 (Perfektion): Vorschau-Wahl — Dropdown über die Mappen-Dokumente
  // (Default Statuten); fällt auf das erste Dokument zurück, wenn die
  // gewählte Weiche wegfällt. Navigations-State, bewusst NICHT persistiert.
  const [aktivesVorschauDok, setAktivesVorschauDok] = useState('statuten');
  const vorschauDok = mappe.dokumente.find((d) => d.id === aktivesVorschauDok) ?? mappe.dokumente[0];
  const vorschau = mappe.dokumente.length > 0
    ? (
      <div className="space-y-3">
        <div className="px-4 pt-4">
          <Field label="Dokument der Vorschau">
            <select className={inputCls} value={vorschauDok.id} onChange={(e) => setAktivesVorschauDok(e.target.value)}>
              {mappe.dokumente.map((d) => <option key={d.id} value={d.id}>{d.titel}</option>)}
            </select>
          </Field>
        </div>
        <VorschauPanel ergebnis={vorschauDok.ergebnis} />
      </div>
    )
    : (
      <div className="p-4 space-y-2">
        <p className="text-body-s font-medium text-ink-900">Noch keine Dokumente</p>
        <p className="text-body-s text-ink-600">
          Die Vorschau erscheint, sobald die Pflichtangaben vollständig sind:
        </p>
        <ul className="lc-list space-y-1 text-xs text-ink-600">
          {mappe.gates.blocker.slice(0, 8).map((b) => <li key={b}><NormText text={b} /></li>)}
        </ul>
      </div>
    );

  return (
    <VorlagenWizardRahmen
      zurueckHref="/"
      overline="Gesellschaftsrecht · Vorlage"
      titel="AG-Gründungsunterlagen"
      intro={
        <>
          Schritt für Schritt zur vollständigen Dokumentmappe: Statuten und Errichtungsakt als ENTWURF
          für die Urkundsperson (die öffentliche Beurkundung bleibt zwingend, Art. 629 OR), Wahlannahmen,
          VR-Protokoll, Sacheinlageverträge, Gründungsbericht, Lex-Koller-Erklärung und
          Handelsregister-Anmeldung druckfertig — am Schluss mit Checkliste (Art. 43/44 HRegV) und
          Sammel-Download aller notwendigen Dokumente.
        </>
      }
      norms={card?.norms ?? []}
      badge="Dokumentmappe (Urkunde als Entwurf)"
      fussnote="Eingaben verlassen den Browser nicht; lokale Zwischenspeicherung auf diesem Gerät — «Zurücksetzen» löscht sie."
      zuruecksetzen={zuruecksetzen}
      schritte={SCHRITTE}
      schritt={schritt}
      setSchritt={setSchritt}
      weiterDeaktiviert={false}
      inhalt={inhalte[schritt]}
      vorschau={vorschau}
    />
  );
}
