import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { agGruendungsunterlagen, type EinlageArt, type Phase } from '../lib/gruendungsunterlagen';
import { Field, NormLink, inputCls } from '../components/vorlagen/ui';
import { VorlagenWizardRahmen, VorschauPanel } from '../components/vorlagen/wizard';
import { MappenAnsicht, MappenGates, NotariatsHinweis } from '../components/vorlagen/Dokumentmappe';
import { PflichtDisclaimer } from '../components/PflichtDisclaimer';
import { karte } from '../lib/startseiteConfig';
import { BANNER_MAPPE_FERTIG, type PdfBanner } from '../lib/vorlagen/banner';
import {
  agDokumentmappe,
  AG_DOK_DEFAULTS,
  AG_FREMDWAEHRUNGEN,
  type AgDokAntworten,
  type AgGruenderZeile,
  type AgVrZeile,
  type AgVertretungsZeile,
  type AgVrZeichnungsArt,
  type AgVertretungsZeichnungsArt,
  type AgSacheinlageZeile,
  type AgVerrechnungZeile,
  type AgVorteilZeile,
  type AgWaehrung,
  type AgBereich,
} from '../lib/vorlagen/gruendungAgDokumente';
import { KANTONE } from '../lib/kantone';

// ─── Maske: AG-Gründung als WIZARD (Auftrag David 7.6.2026) ──────────────────
// Durchklickbar analog der anderen Vorlagen-Masken (VorlagenWizardRahmen):
// Konstellation → Gesellschaft → Kapital & Einlagen → Personen → Weiteres →
// Dokumente (Checkliste + Mappe + Sammel-Download). Rechtslogik vollständig
// in lib/vorlagen/gruendungAgDokumente.ts und lib/gruendungsunterlagen.ts
// (§3/§5); hier nur Darstellung und Eingabesammlung.

const SCHRITTE = [
  { id: 'konstellation', label: 'Konstellation' },
  { id: 'gesellschaft', label: 'Gesellschaft & Statuten' },
  { id: 'kapital', label: 'Kapital & Einlagen' },
  { id: 'personen', label: 'Personen & Organe' },
  { id: 'weiteres', label: 'Domizil & Optionen' },
  { id: 'dokumente', label: 'Checkliste & Dokumente' },
] as const;

const PHASEN: { id: Phase; titel: string; lead: string }[] = [
  { id: 'vorbereitung', titel: '1 · Vor dem Notariatstermin', lead: 'Beschaffen bzw. erstellen — die Urkundsperson muss diese Belege beim Termin vorliegen haben (Art. 631 OR).' },
  { id: 'beurkundung', titel: '2 · Beurkundung', lead: 'Entsteht beim Notariat; Wahlannahmen können direkt in der Urkunde erklärt werden.' },
  { id: 'anmeldung', titel: '3 · Handelsregister-Anmeldung', lead: 'Einreichung aller Belege nach Art. 43 HRegV.' },
  { id: 'nachEintrag', titel: '4 · Nach dem Eintrag', lead: 'Pflichten ab Rechtspersönlichkeit (Art. 643 OR).' },
];

const ERSTELLER_LABEL = { gruender: 'Gründer:innen', notariat: 'Notariat', bank: 'Bank', revisor: 'Revisor:in' } as const;

const CHF = new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 });

// Praxis-Runde (Auftrag David): Blocker sind klickbar und führen zum
// Schritt, in dem die Eingabe liegt (Bereichs-Tag aus der Engine, §3).
const BEREICH_SCHRITT: Record<AgBereich, number> = {
  konstellation: 0, gesellschaft: 1, kapital: 2, personen: 3, weiteres: 4,
};

const BANNER_ENTWURF: PdfBanner = {
  titel: 'ENTWURF – KEIN GÜLTIGES DOKUMENT',
  // Praxis-Runde: Text deckt ALLE Entwurfs-Dokumente der Mappe (auch
  // Nachtrag und Sacheinlagevertrag mit Grundstück), nicht nur
  // Statuten/Errichtungsakt.
  text: 'Vorbereitung für die Urkundsperson: Statuten werden notariell beglaubigt (Art. 22 Abs. 4 HRegV); Errichtungsakt, Nachtrag und Sacheinlageverträge mit Grundstücken bedürfen der öffentlichen Beurkundung (Art. 629 Abs. 1 und Art. 634 Abs. 2 OR).',
};

// D14: VR-Mitglieder können «ohne Zeichnungsberechtigung» sein (Gate: mind.
// eines vertretungsbefugt, Art. 718 Abs. 3 OR); weitere Zeichnungsberechtigte
// zusätzlich mit Kollektivprokura (ZH-Muster-Protokoll).
const VR_ZEICHNUNGS_OPTIONEN: { id: AgVrZeichnungsArt; label: string }[] = [
  { id: 'einzelunterschrift', label: 'Einzelunterschrift' },
  { id: 'kollektivzuzweien', label: 'Kollektivunterschrift zu zweien' },
  { id: 'ohne', label: 'ohne Zeichnungsberechtigung' },
];
const VERTRETUNGS_ZEICHNUNGS_OPTIONEN: { id: AgVertretungsZeichnungsArt; label: string }[] = [
  { id: 'einzelunterschrift', label: 'Einzelunterschrift' },
  { id: 'kollektivzuzweien', label: 'Kollektivunterschrift zu zweien' },
  { id: 'kollektivprokura', label: 'Kollektivprokura zu zweien' },
];

// Etappe 5/D23: FINMA-Bewilligungs-Bezeichnungen (Merkblatt HRegA ZH,
// «Belege für die Neueintragung», 11.12.2024) — deterministische Wortprüfung.
const FINMA_BEGRIFFE: { begriff: string; muster: RegExp }[] = [
  { begriff: 'Bank', muster: /\bbank\b/i },
  { begriff: 'Vermögensverwalter', muster: /vermögensverwalter/i },
  { begriff: 'Trustee', muster: /trustee/i },
  { begriff: 'Verwalter von Kollektivvermögen', muster: /verwalter von kollektivvermögen/i },
  { begriff: 'Fondsleitung', muster: /fondsleitung/i },
  { begriff: 'Wertpapierhaus', muster: /wertpapierhaus/i },
];

// ─── Punkt 7 (Perfektion): lokale Zwischenspeicherung ────────────────────────
// Versioniertes JSON unter EINEM Schlüssel; Hydration mit Normalisieren-
// Guards je Feld (Wizard-PFLICHT-Konvention: je Zeile fehlende Felder mit
// Defaults auffüllen, falsche Typen verwerfen — nie ungeprüft in den State).
const STORAGE_KEY = 'lexmetrik:ag-gruendung:v1';

function ladeStand(): Record<string, unknown> | null {
  // Nackter localStorage-Zugriff wie useWizardState: im SSR-Smoke wirft er
  // (ReferenceError) und wird gefangen; der Test-Stub liegt auf globalThis.
  try {
    const roh = localStorage.getItem(STORAGE_KEY);
    if (!roh) return null;
    const json: unknown = JSON.parse(roh);
    if (!json || typeof json !== 'object') return null;
    const o = json as { v?: unknown; stand?: unknown };
    if (o.v !== 1 || !o.stand || typeof o.stand !== 'object' || Array.isArray(o.stand)) return null;
    return o.stand as Record<string, unknown>;
  } catch {
    return null; // defekter/blockierter Speicher = wie «nichts gespeichert»
  }
}

const txt = (v: unknown, def: string) => (typeof v === 'string' ? v : def);
const bool = (v: unknown, def: boolean) => (typeof v === 'boolean' ? v : def);
const wahl = <T extends string>(v: unknown, erlaubt: readonly T[], def: T): T =>
  typeof v === 'string' && (erlaubt as readonly string[]).includes(v) ? (v as T) : def;

/** Array-Hydration: nur Objekt-Zeilen übernehmen, je Feld der Vorlage den
 *  gespeicherten Wert nur bei passendem Typ (Wahl-Felder nur bei erlaubtem
 *  Wert) — sonst Default; keys werden NEU vergeben (1…n je Liste). */
function zeilenGuard<T extends Record<string, string | boolean | undefined>>(
  roh: unknown,
  vorlage: Required<T>,
  wahlFelder: Partial<Record<keyof T, readonly string[]>> = {},
): (T & { key: number })[] {
  if (!Array.isArray(roh)) return [];
  return roh
    .filter((z): z is Record<string, unknown> => z !== null && typeof z === 'object' && !Array.isArray(z))
    .map((z, i) => {
      const zeile: Record<string, string | boolean | number | undefined> = { ...vorlage, key: i + 1 };
      for (const feld of Object.keys(vorlage)) {
        const wert = z[feld];
        const erlaubt = wahlFelder[feld];
        if (erlaubt) {
          if (typeof wert === 'string' && (erlaubt as readonly string[]).includes(wert)) zeile[feld] = wert;
        } else if ((typeof wert === 'string' || typeof wert === 'boolean') && typeof wert === typeof vorlage[feld]) {
          zeile[feld] = wert;
        }
      }
      return zeile as unknown as T & { key: number };
    });
}

const GRUENDER_LEER: Required<AgGruenderZeile> = { name: '', angaben: '', anzahl: '', liberierung: '' };
const VR_LEER: Required<AgVrZeile> = {
  name: '', herkunft: '', wohnort: '', adresse: '', praesident: false,
  zeichnungsArt: 'einzelunterschrift', annahmeInUrkunde: false,
};
const VERTRETUNG_LEER: Required<AgVertretungsZeile> = { name: '', funktion: '', zeichnungsArt: 'kollektivzuzweien' };
const SACHEINLAGE_LEER: Required<AgSacheinlageZeile> = {
  typ: 'sachgesamtheit', bezeichnung: '', belegDatum: '', wertChf: '', grundstueck: false,
  einlegerName: '', aktienAnzahl: '', gutschriftChf: '', zustand: '',
  imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
};
const VERRECHNUNG_LEER: Required<AgVerrechnungZeile> = { glaeubigerName: '', forderungChf: '', aktienAnzahl: '', begruendungTxt: '' };
const VORTEIL_LEER: Required<AgVorteilZeile> = { beguenstigter: '', inhalt: '', wertChf: '', begruendungTxt: '' };

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
  const [datum, setDatum] = useState(() => txt(stand?.datum, '') || new Date().toISOString().slice(0, 10));

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

  // Etappe 5/D23: FINMA-Wortprüfung über Firma + Zweck.
  const finmaTreffer = useMemo(
    () => FINMA_BEGRIFFE.filter((b) => b.muster.test(`${firma} ${zweck}`)).map((b) => b.begriff),
    [firma, zweck],
  );

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
      for (const d of mappe.dokumente) {
        const entwurf = d.ergebnis.dokument.ausgabeArt === 'entwurf';
        const banner = entwurf ? BANNER_ENTWURF : BANNER_MAPPE_FERTIG;
        const doc = vorlagenPdfDokument(d.ergebnis, { banner });
        eintraege[frei(d.dateiName, 'pdf')] = new Uint8Array(doc.output('arraybuffer'));
        if (docxErlaubt) {
          const blob = await vorlagenDocxDokument(d.ergebnis, { banner });
          eintraege[frei(d.dateiName, 'docx')] = new Uint8Array(await blob.arrayBuffer());
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
      setBatchMeldung(`${mappe.dokumente.length} Dokumente als ZIP heruntergeladen (gruendung-${slug}.zip${docxErlaubt ? ', je als PDF und Word' : ''}).`);
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
  const schrittKonstellation = (
    <div className="space-y-4">
      <PflichtDisclaimer />
      <button type="button" className="lc-btn-outline lc-btn-sm" onClick={musterdatenFuellen}
        title="Füllt alle Schritte mit einem vollständigen Demo-Datensatz (gemischte qualifizierte Gründung) — zum Ausprobieren; eigene Eingaben werden überschrieben.">
        Mit Musterdaten füllen (Demo)
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Liberierung">
          <select className={inputCls} value={einlageArt} onChange={(e) => setEinlageArt(e.target.value as EinlageArt)}>
            <option value="bar">Bareinlage</option>
            <option value="sacheinlage">Sacheinlage</option>
            <option value="verrechnung">Verrechnung</option>
            <option value="gemischt">Gemischt (bar + Sache/Verrechnung)</option>
          </select>
        </Field>
        <Field label="Revision">
          <select className={inputCls} value={optingOut ? 'opting' : 'rs'} onChange={(e) => setOptingOut(e.target.value === 'opting')}>
            <option value="opting">Verzicht (Opting-out, ≤ 10 Vollzeitstellen)</option>
            <option value="rs">Revisionsstelle bestellt</option>
          </select>
        </Field>
        <Field label="Leistungen der Aktionäre (CHF, optional — für die Emissionsabgabe)">
          <input className={inputCls} inputMode="numeric" placeholder="z. B. 100000" value={leistungen} onChange={(e) => setLeistungen(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-y-2 text-body-s text-ink-700">
        <label className="flex items-center gap-2"><input type="checkbox" checked={besondereVorteile} onChange={(e) => setBesondereVorteile(e.target.checked)} /> Besondere Vorteile für Gründer/Dritte</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={inhaberaktien} onChange={(e) => setInhaberaktien(e.target.checked)} /> Inhaberaktien vorgesehen</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!eigeneBueros} onChange={(e) => setEigeneBueros(!e.target.checked)} /> c/o-Adresse (kein eigenes Büro)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={immobilienHauptzweck} onChange={(e) => setImmobilienHauptzweck(e.target.checked)} /> Immobilien-Haupttätigkeit</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={fremdwaehrung} onChange={(e) => setFremdwaehrung(e.target.checked)} /> Aktienkapital in Fremdwährung</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!bankInUrkunde} onChange={(e) => setBankInUrkunde(!e.target.checked)} /> Bank wird in der Urkunde NICHT genannt</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={chVertretung} onChange={(e) => setChVertretung(e.target.checked)} /> Vertretungsberechtigte Person mit CH-Wohnsitz vorhanden</label>
      </div>
      {checkliste.blocker.map((b) => (
        <div key={b} className="lc-notice-warn">
          <p className="text-body-s font-medium">Eintragungshindernis</p>
          <p className="text-body-s">{b}</p>
        </div>
      ))}
    </div>
  );

  const schrittGesellschaft = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Firma (mit Zusatz «AG», Art. 950 OR)">
          <input className={inputCls} value={firma} onChange={(e) => setFirma(e.target.value)} placeholder="z. B. Muster Immobilien AG" />
        </Field>
        <Field label="Sitz (politische Gemeinde)">
          <input className={inputCls} value={sitz} onChange={(e) => setSitz(e.target.value)} placeholder="z. B. Zürich" />
        </Field>
        <Field label="Kanton (Handelsregisteramt)">
          <select className={inputCls} value={kanton} onChange={(e) => setKanton(e.target.value)}>
            {KANTONE.map((kt) => <option key={kt} value={kt}>{kt}</option>)}
          </select>
        </Field>
      </div>
      <NotariatsHinweis kanton={kanton} />
      <Field label="Zweck">
        <textarea className={inputCls} rows={3} value={zweck} onChange={(e) => setZweck(e.target.value)}
          placeholder="z. B. den Erwerb, das Halten und die Verwaltung von Beteiligungen" />
      </Field>
      {finmaTreffer.length > 0 && (
        <div className="lc-notice-warn">
          <p className="text-body-s">
            Firma/Zweck enthält «{finmaTreffer.join('», «')}»: Solche Bezeichnungen dürfen nur mit
            entsprechender FINMA-Bewilligung ins Handelsregister eingetragen werden; eine Bank darf vor
            der Bewilligung gar nicht eingetragen werden (Merkblatt HRegA ZH, 11.12.2024).
          </p>
        </div>
      )}
      <label className="flex items-center gap-2 text-body-s text-ink-700">
        <input type="checkbox" checked={zweckErweiterung} onChange={(e) => setZweckErweiterung(e.target.checked)} />
        Übliche Zweck-Erweiterungsklausel
      </label>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-s text-ink-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={vinkulierung} onChange={(e) => setVinkulierung(e.target.checked)} />
          Vinkulierung der Namenaktien (Art. 685a f. OR)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={virtuelleGv} onChange={(e) => setVirtuelleGv(e.target.checked)} />
          Virtuelle/hybride Generalversammlung (Art. 701d OR)
        </label>
        <label className="flex items-center gap-2">
          Statuten-Umfang:
          <select className={inputCls} value={statutenUmfang}
            onChange={(e) => setStatutenUmfang(e.target.value as AgDokAntworten['statutenUmfang'])}>
            <option value="kurz">Kurzfassung (amtliche ZH-Kurzvorlage)</option>
            <option value="lang">Langfassung (mit Organisations-Artikeln)</option>
          </select>
        </label>
      </div>
      {/* Stufe 2 P2: Inhaberaktien-Voraussetzung (Art. 622 Abs. 1bis OR) */}
      {inhaberaktien && (
        <div className="rounded-md border border-line p-3 space-y-3">
          <p className="text-body-s font-medium text-ink-900">Inhaberaktien — Zulässigkeits-Voraussetzung (Art. 622 Abs. 1bis OR)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Voraussetzung">
              <select className={inputCls} value={inhaberKotiert ? 'kotiert' : 'bucheffekten'}
                onChange={(e) => setInhaberKotiert(e.target.value === 'kotiert')}>
                <option value="bucheffekten">Bucheffekten (BEG) + Verwahrungsstelle in der Schweiz</option>
                <option value="kotiert">Beteiligungspapiere an einer Börse kotiert</option>
              </select>
            </Field>
            {!inhaberKotiert && (
              <Field label="Verwahrungsstelle (Name und Ort)">
                <input className={inputCls} value={verwahrungsstelle}
                  onChange={(e) => setVerwahrungsstelle(e.target.value)} placeholder="z. B. SIX SIS AG, Olten" />
              </Field>
            )}
          </div>
          <p className="text-xs text-ink-500 max-w-reading">
            Inhaberaktien setzen Volliberierung voraus (Art. 683 OR) und schliessen Vinkulierung und die
            Statuten-Langfassung aus; der Nachweis ist der Anmeldung beizulegen (Art. 43 Abs. 1 lit. i HRegV).
          </p>
        </div>
      )}
      {/* Stufe 2 P3: Statuten-Zusatzklauseln */}
      <div className="rounded-md border border-line p-3 space-y-3">
        <p className="text-body-s font-medium text-ink-900">Statuten-Zusatzklauseln (optional)</p>
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={schiedsklausel} onChange={(e) => setSchiedsklausel(e.target.checked)} />
          Schiedsklausel (Art. 697n OR)
        </label>
        {schiedsklausel && (
          <Field label="Sitz des Schiedsgerichts (Ort in der Schweiz)">
            <input className={inputCls} value={schiedsOrt} onChange={(e) => setSchiedsOrt(e.target.value)} placeholder="z. B. Zürich" />
          </Field>
        )}
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={kapitalband} onChange={(e) => setKapitalband(e.target.checked)} />
          Kapitalband (Art. 653s ff. OR — VR-Ermächtigung, max. 5 Jahre, ±½ des Kapitals)
        </label>
        {kapitalband && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label="Richtung der Ermächtigung">
              <select className={inputCls} value={kbRichtung}
                onChange={(e) => setKbRichtung(e.target.value as AgDokAntworten['kbRichtung'])}>
                <option value="erhoehen">Nur Erhöhung (bei Opting-out zwingend)</option>
                <option value="beide">Erhöhung und Herabsetzung (nur mit Revisionsstelle)</option>
              </select>
            </Field>
            <Field label="Ende der Ermächtigung (max. 5 Jahre)">
              <input type="date" className={inputCls} value={kbEndeDatum} onChange={(e) => setKbEndeDatum(e.target.value)} />
            </Field>
            <Field label={`Untere Grenze (${wc}${kbRichtung === 'erhoehen' ? ' — bei «nur Erhöhung» = Aktienkapital' : ''})`}>
              <input className={inputCls} inputMode="numeric" value={kbUntergrenze} onChange={(e) => setKbUntergrenze(e.target.value)} />
            </Field>
            <Field label={`Obere Grenze (${wc}, höchstens das Anderthalbfache des Kapitals)`}>
              <input className={inputCls} inputMode="numeric" value={kbObergrenze} onChange={(e) => setKbObergrenze(e.target.value)} />
            </Field>
          </div>
        )}
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={bedingtesKapital} onChange={(e) => setBedingtesKapital(e.target.checked)} />
          Bedingtes Kapital (Art. 653 ff. OR — Wandel-/Optionsrechte, max. ½ des Kapitals)
        </label>
        {bedingtesKapital && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Field label={`Nennbetrag des bedingten Kapitals (${wc})`}>
              <input className={inputCls} inputMode="numeric" value={bkBetrag} onChange={(e) => setBkBetrag(e.target.value)} placeholder="z. B. 50'000" />
            </Field>
            <Field label="Kreis der Berechtigten (Art. 653b Abs. 1 Ziff. 3 OR)">
              <input className={inputCls} value={bkKreis} onChange={(e) => setBkKreis(e.target.value)}
                placeholder="z. B. den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft" />
            </Field>
          </div>
        )}
        {statutenUmfang === 'lang' && (
          <label className="flex items-center gap-2 text-body-s text-ink-700"
            title="ZH-Langvorlage: «Bei Stimmengleichheit hat der Vorsitzende den Stichentscheid.» — abwählbar; ohne Klausel gilt: Stimmengleichheit = Antrag abgelehnt (SG-Default, Kantonsvergleich B8).">
            <input type="checkbox" checked={stichentscheidGv} onChange={(e) => setStichentscheidGv(e.target.checked)} />
            Stichentscheid des Vorsitzenden in der Generalversammlung (Langfassung)
          </label>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Geschäftsjahr-Beginn (Statuten)">
          <input className={inputCls} value={gjBeginn} onChange={(e) => setGjBeginn(e.target.value)} placeholder="z. B. 1. Januar" />
        </Field>
        <Field label="Geschäftsjahr-Ende (Statuten)">
          <input className={inputCls} value={gjEnde} onChange={(e) => setGjEnde(e.target.value)} placeholder="z. B. 31. Dezember" />
        </Field>
        <Field label="Erstes Geschäftsjahr endet am (optional — bei unterjähriger Gründung)">
          <input className={inputCls} value={gjErstesEnde} onChange={(e) => setGjErstesEnde(e.target.value)} placeholder="z. B. 31. Dezember 2026" />
        </Field>
      </div>
    </div>
  );

  const schrittKapital = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={fremdwaehrung ? `Aktienkapital (${waehrung}; Gegenwert mind. CHF 100'000)` : "Aktienkapital (CHF, mind. 100'000)"}>
          <input className={inputCls} inputMode="numeric" placeholder="Tausender mit Apostroph, z. B. 100'000" value={ak} onChange={(e) => setAk(e.target.value)} />
        </Field>
        <Field label="Anzahl Namenaktien">
          <input className={inputCls} inputMode="numeric" value={anzahl} onChange={(e) => setAnzahl(e.target.value)} />
        </Field>
        <Field label="Nennwert je Aktie">
          <input className={inputCls} inputMode="numeric" value={nennwert} onChange={(e) => setNennwert(e.target.value)} />
        </Field>
        <Field label="Liberierung (%, 20–100; einbezahlt mind. CHF 50'000)">
          <input className={inputCls} inputMode="numeric" value={liberierung} onChange={(e) => setLiberierung(e.target.value)} />
        </Field>
        <Field label="Ausgabebetrag je Aktie (leer = Nennwert; ein Agio ist stets voll zu leisten)">
          <input className={inputCls} inputMode="numeric" value={ausgabebetrag} onChange={(e) => setAusgabebetrag(e.target.value)} placeholder="z. B. 1'200" />
        </Field>
      </div>

      {fremdwaehrung && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Währung des Aktienkapitals (Anhang 3 HRegV)">
            <select className={inputCls} value={waehrung} onChange={(e) => setWaehrung(e.target.value as AgWaehrung)}>
              {AG_FREMDWAEHRUNGEN.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Umrechnungskurs (1 Einheit = X CHF; Art. 629 Abs. 3 OR)">
            <input className={inputCls} inputMode="decimal" value={kursChf} onChange={(e) => setKursChf(e.target.value)} placeholder="z. B. 0.93" />
          </Field>
          <Field label="Quelle des Devisenmittelkurses (Bank)">
            <input className={inputCls} value={kursQuelle} onChange={(e) => setKursQuelle(e.target.value)} placeholder="z. B. Zürcher Kantonalbank" />
          </Field>
        </div>
      )}

      {bankInUrkunde && (einlageArt === 'bar' || einlageArt === 'gemischt') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bank (in der Urkunde genannt)">
            <input className={inputCls} value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </Field>
          <Field label="Bank-Ort">
            <input className={inputCls} value={bankOrt} onChange={(e) => setBankOrt(e.target.value)} />
          </Field>
        </div>
      )}

      {/* Etappe 2: Sacheinlagen (Art. 634 OR) */}
      {(einlageArt === 'sacheinlage' || einlageArt === 'gemischt') && (
        <div className="space-y-3">
          <p className="text-body-s font-medium text-ink-900">Sacheinlagen (Art. 634 OR)</p>
          <p className="text-body-s text-ink-500 max-w-reading">
            Deckungs-Voraussetzungen (Art. 634 Abs. 1 OR): als Aktiven bilanzierbar, übertragbar,
            nach dem Eintrag sofort frei verfügbar (bei Grundstücken: bedingungsloser
            Grundbuch-Anspruch) und durch Übertragung auf Dritte verwertbar.
          </p>
          {sacheinlagen.map((s) => (
            <div key={s.key} className="rounded-md border border-line p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_2fr_auto] gap-2 items-end">
                <Field label="Art der Einlage">
                  <select className={inputCls} value={s.typ}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, typ: e.target.value as AgSacheinlageZeile['typ'] } : x))}>
                    <option value="sachgesamtheit">Sachgesamtheit (Inventarliste)</option>
                    <option value="geschaeft">Einzelunternehmen (Übernahmebilanz)</option>
                  </select>
                </Field>
                <Field label={s.typ === 'geschaeft' ? 'Firma des Einzelunternehmens' : 'Gegenstand (Umfang der Sacheinlage)'}>
                  <input className={inputCls} value={s.bezeichnung}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, bezeichnung: e.target.value } : x))} />
                </Field>
                <Field label="Einleger:in (Name)">
                  <input className={inputCls} value={s.einlegerName}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, einlegerName: e.target.value } : x))} />
                </Field>
                <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Sacheinlage entfernen"
                  onClick={() => setSacheinlagen((alt) => alt.filter((x) => x.key !== s.key))}>✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                <Field label={`Bewertung (${wc})`}>
                  <input className={inputCls} inputMode="numeric" value={s.wertChf}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, wertChf: e.target.value } : x))} />
                </Field>
                <Field label="Dafür ausgegebene Aktien">
                  <input className={inputCls} inputMode="numeric" value={s.aktienAnzahl}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, aktienAnzahl: e.target.value } : x))} />
                </Field>
                <Field label={`Gutschrift (${wc}, optional)`}>
                  <input className={inputCls} inputMode="numeric" value={s.gutschriftChf}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, gutschriftChf: e.target.value } : x))} />
                </Field>
                <Field label={s.typ === 'geschaeft' ? 'Übernahmebilanz per' : 'Inventarliste vom'}>
                  <input type="date" className={inputCls} value={s.belegDatum}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, belegDatum: e.target.value } : x))} />
                </Field>
              </div>
              {s.typ === 'geschaeft' && (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-end">
                  <label className="flex items-center gap-2 text-body-s text-ink-700 pb-2">
                    <input type="checkbox" checked={s.imHrEingetragen}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, imHrEingetragen: e.target.checked } : x))} />
                    im HR eingetragen
                  </label>
                  <Field label="UID (CHE-…, optional)">
                    <input className={inputCls} value={s.cheNr}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, cheNr: e.target.value } : x))} />
                  </Field>
                  <Field label={`Aktiven (${wc})`}>
                    <input className={inputCls} inputMode="numeric" value={s.aktivenChf}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, aktivenChf: e.target.value } : x))} />
                  </Field>
                  <Field label={`Passiven (${wc})`}>
                    <input className={inputCls} inputMode="numeric" value={s.passivenChf}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, passivenChf: e.target.value } : x))} />
                  </Field>
                  <Field label="Rechtsgeschäfte gelten ab (Rückwirkung)">
                    <input type="date" className={inputCls} value={s.rueckwirkungDatum}
                      onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, rueckwirkungDatum: e.target.value } : x))} />
                  </Field>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-2 items-start">
                <label className="flex items-center gap-2 text-body-s text-ink-700 pt-2">
                  <input type="checkbox" checked={s.grundstueck}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, grundstueck: e.target.checked } : x))} />
                  Grundstück enthalten (Vertrag wird öffentlich beurkundet, Art. 657 ZGB — Export nur als Entwurf)
                </label>
                <Field label="Zustand der Sacheinlage (für den Gründungsbericht; bei Geschäft: Würdigung je Bilanzposten)">
                  <textarea className={inputCls} rows={2} value={s.zustand}
                    onChange={(e) => setSacheinlagen((alt) => alt.map((x) => x.key === s.key ? { ...x, zustand: e.target.value } : x))} />
                </Field>
              </div>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setSacheinlagen((alt) => [...alt, {
              key: neuerKey(), typ: 'sachgesamtheit', bezeichnung: '', belegDatum: '', wertChf: '',
              grundstueck: false, einlegerName: '', aktienAnzahl: '', gutschriftChf: '', zustand: '',
              imHrEingetragen: false, cheNr: '', aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
            }])}>
            + Sacheinlage hinzufügen
          </button>
        </div>
      )}

      {/* Etappe 2: Verrechnungsliberierung (Art. 634a OR) */}
      {(einlageArt === 'verrechnung' || einlageArt === 'gemischt') && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900">Verrechnungsliberierung (Art. 634a OR)</p>
          {verrechnungen.map((v) => (
            <div key={v.key} className="rounded-md border border-line p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                <Field label="Gläubiger:in (Name)">
                  <input className={inputCls} value={v.glaeubigerName}
                    onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, glaeubigerName: e.target.value } : x))} />
                </Field>
                <Field label={`Forderung (${wc})`}>
                  <input className={inputCls} inputMode="numeric" value={v.forderungChf}
                    onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, forderungChf: e.target.value } : x))} />
                </Field>
                <Field label="Aktien">
                  <input className={inputCls} inputMode="numeric" value={v.aktienAnzahl}
                    onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, aktienAnzahl: e.target.value } : x))} />
                </Field>
                <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                  onClick={() => setVerrechnungen((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
              </div>
              <Field label="Bestand und Verrechenbarkeit der Forderung (für den Gründungsbericht, Art. 635 Ziff. 2 OR)">
                <textarea className={inputCls} rows={2} value={v.begruendungTxt}
                  onChange={(e) => setVerrechnungen((alt) => alt.map((x) => x.key === v.key ? { ...x, begruendungTxt: e.target.value } : x))} />
              </Field>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setVerrechnungen((alt) => [...alt, { key: neuerKey(), glaeubigerName: '', forderungChf: '', aktienAnzahl: '', begruendungTxt: '' }])}>
            + Verrechnung hinzufügen
          </button>
        </div>
      )}

      {/* Etappe 2: Besondere Vorteile (Art. 636 OR) */}
      {besondereVorteile && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900">Besondere Vorteile (Art. 636 OR)</p>
          {vorteile.map((v) => (
            <div key={v.key} className="rounded-md border border-line p-3 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto] gap-2 items-end">
                <Field label="Begünstigte:r (Name)">
                  <input className={inputCls} value={v.beguenstigter}
                    onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, beguenstigter: e.target.value } : x))} />
                </Field>
                <Field label={`Wert (${wc})`}>
                  <input className={inputCls} inputMode="numeric" value={v.wertChf}
                    onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, wertChf: e.target.value } : x))} />
                </Field>
                <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                  onClick={() => setVorteile((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
              </div>
              <Field label="Inhalt des Vorteils (Statuten-Pflichtinhalt, Art. 636 OR)">
                <textarea className={inputCls} rows={2} value={v.inhalt}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, inhalt: e.target.value } : x))} />
              </Field>
              <Field label="Begründung und Angemessenheit (für den Gründungsbericht, Art. 635 Ziff. 3 OR)">
                <textarea className={inputCls} rows={2} value={v.begruendungTxt}
                  onChange={(e) => setVorteile((alt) => alt.map((x) => x.key === v.key ? { ...x, begruendungTxt: e.target.value } : x))} />
              </Field>
            </div>
          ))}
          <button type="button" className="lc-btn-outline lc-btn-sm"
            onClick={() => setVorteile((alt) => [...alt, { key: neuerKey(), beguenstigter: '', inhalt: '', wertChf: '', begruendungTxt: '' }])}>
            + Vorteil hinzufügen
          </button>
        </div>
      )}

      {(einlageArt !== 'bar' || besondereVorteile) && (
        <Field label="Zugelassene:r Revisor:in der Prüfungsbestätigung (Art. 635a OR; leer = Blanko)">
          <input className={inputCls} value={revisorName} onChange={(e) => setRevisorName(e.target.value)} />
        </Field>
      )}
    </div>
  );

  const schrittPersonen = (
    <div className="space-y-4">
      {/* Gründer */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Gründer:innen und Zeichnung (Art. 629/630 OR)</p>
        {gruender.map((g) => (
          <div key={g.key} className="rounded-md border border-line p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Name">
                <input className={inputCls} value={g.name}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, name: e.target.value } : x))} />
              </Field>
              <Field label="Angaben (z. B. «von Basel, in Zürich, Musterweg 1»)">
                <input className={inputCls} value={g.angaben}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, angaben: e.target.value } : x))} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
              <Field label="Gezeichnete Aktien">
                <input className={inputCls} inputMode="numeric" value={g.anzahl}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, anzahl: e.target.value } : x))} />
              </Field>
              <Field label="Liberierung in % (leer = globaler Wert)">
                <input className={inputCls} inputMode="numeric" value={g.liberierung ?? ''}
                  onChange={(e) => setGruender((alt) => alt.map((x) => x.key === g.key ? { ...x, liberierung: e.target.value } : x))} />
              </Field>
              <button type="button" className="lc-btn-outline lc-btn-sm"
                title="Übernimmt den Namen in den Verwaltungsrat (Heimatort/Wohnort dort ergänzen)."
                disabled={!g.name.trim() || vr.some((v) => v.name.trim() === g.name.trim())}
                onClick={() => setVr((alt) => [...alt, { key: neuerKey(), name: g.name.trim(), herkunft: '', wohnort: '', adresse: '', praesident: alt.length === 0, zeichnungsArt: 'einzelunterschrift' }])}>
                → als VR-Mitglied übernehmen
              </button>
              <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                onClick={() => setGruender((alt) => alt.filter((x) => x.key !== g.key))}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => setGruender((alt) => [...alt, { key: neuerKey(), name: '', angaben: '', anzahl: '', liberierung: '' }])}>
          + Gründer:in hinzufügen
        </button>
      </div>

      {/* Verwaltungsrat */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Verwaltungsrat (Art. 707 ff. OR)</p>
        {vr.map((v) => (
          <div key={v.key} className="rounded-md border border-line p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field label="Name">
                <input className={inputCls} value={v.name}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, name: e.target.value } : x))} />
              </Field>
              <Field label="Heimatort / Staatsangehörigkeit">
                <input className={inputCls} value={v.herkunft}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, herkunft: e.target.value } : x))} />
              </Field>
              <Field label="Wohnort">
                <input className={inputCls} value={v.wohnort}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, wohnort: e.target.value } : x))} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Adresse (für die Wahlannahmeerklärung)">
                <input className={inputCls} value={v.adresse}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, adresse: e.target.value } : x))} />
              </Field>
              <Field label="Zeichnungsberechtigung">
                <select className={inputCls} value={v.zeichnungsArt}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, zeichnungsArt: e.target.value as AgVrZeichnungsArt } : x))}>
                  {VR_ZEICHNUNGS_OPTIONEN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-s text-ink-700">
              <label className="flex items-center gap-1.5">
                <input type="checkbox" checked={v.praesident}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, praesident: e.target.checked } : x))} />
                Präsident:in
              </label>
              <label className="flex items-center gap-1.5"
                title="Die Person ist beim Beurkundungstermin anwesend und erklärt die Annahme in der Urkunde – die separate Wahlannahmeerklärung entfällt (Art. 43 Abs. 1 lit. c HRegV).">
                <input type="checkbox" checked={v.annahmeInUrkunde ?? false}
                  onChange={(e) => setVr((alt) => alt.map((x) => x.key === v.key ? { ...x, annahmeInUrkunde: e.target.checked } : x))} />
                Annahme in der Urkunde
              </label>
              <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
                onClick={() => setVr((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => setVr((alt) => [...alt, { key: neuerKey(), name: '', herkunft: '', wohnort: '', adresse: '', praesident: alt.length === 0, zeichnungsArt: 'einzelunterschrift' }])}>
          + VR-Mitglied hinzufügen
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Protokollführung (leer = Präsident:in)">
            <input className={inputCls} value={protokollfuehrer} onChange={(e) => setProtokollfuehrer(e.target.value)} />
          </Field>
          <Field label="Sitzungsbeginn (Uhrzeit, fürs Protokoll)">
            <input className={inputCls} value={sitzungBeginn} onChange={(e) => setSitzungBeginn(e.target.value)} placeholder="z. B. 11.00" />
          </Field>
          <Field label="Sitzungsende (Uhrzeit)">
            <input className={inputCls} value={sitzungEnde} onChange={(e) => setSitzungEnde(e.target.value)} placeholder="z. B. 11.15" />
          </Field>
        </div>
      </div>

      {/* Weitere Zeichnungsberechtigte */}
      <div className="space-y-2">
        <p className="text-body-s font-medium text-ink-900">Weitere Zeichnungsberechtigte (optional, ins VR-Protokoll)</p>
        {vertretungen.map((v) => (
          <div key={v.key} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_2fr_auto] gap-2 items-end">
            <Field label="Name">
              <input className={inputCls} value={v.name}
                onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, name: e.target.value } : x))} />
            </Field>
            <Field label="Funktion">
              <input className={inputCls} value={v.funktion}
                onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, funktion: e.target.value } : x))} />
            </Field>
            <Field label="Zeichnung">
              <select className={inputCls} value={v.zeichnungsArt}
                onChange={(e) => setVertretungen((alt) => alt.map((x) => x.key === v.key ? { ...x, zeichnungsArt: e.target.value as AgVertretungsZeichnungsArt } : x))}>
                {VERTRETUNGS_ZEICHNUNGS_OPTIONEN.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </Field>
            <button type="button" className="lc-btn-ghost lc-btn-sm" aria-label="Zeile entfernen"
              onClick={() => setVertretungen((alt) => alt.filter((x) => x.key !== v.key))}>✕</button>
          </div>
        ))}
        <button type="button" className="lc-btn-outline lc-btn-sm"
          onClick={() => setVertretungen((alt) => [...alt, { key: neuerKey(), name: '', funktion: '', zeichnungsArt: 'kollektivzuzweien' }])}>
          + Person hinzufügen
        </button>
      </div>

      {!optingOut && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Revisionsstelle (Name)">
            <input className={inputCls} value={rsName} onChange={(e) => setRsName(e.target.value)} />
          </Field>
          <Field label="Revisionsstelle (Sitz)">
            <input className={inputCls} value={rsSitz} onChange={(e) => setRsSitz(e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  );

  const schrittWeiteres = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {eigeneBueros ? (
          <Field label="Rechtsdomizil (Adresse am Sitz)">
            <input className={inputCls} value={rechtsdomizil} onChange={(e) => setRechtsdomizil(e.target.value)} />
          </Field>
        ) : (
          <>
            <Field label="Domizilhalter:in (c/o)">
              <input className={inputCls} value={domizilhalterName} onChange={(e) => setDomizilhalterName(e.target.value)} />
            </Field>
            <Field label="Adresse Domizilhalter:in">
              <input className={inputCls} value={domizilhalterAdresse} onChange={(e) => setDomizilhalterAdresse(e.target.value)} />
            </Field>
          </>
        )}
        <Field label="Ort (Unterschriften)">
          <input className={inputCls} value={ort} onChange={(e) => setOrt(e.target.value)} />
        </Field>
        <Field label="Datum">
          <input type="date" className={inputCls} value={datum} onChange={(e) => setDatum(e.target.value)} />
        </Field>
        <Field label="Nachtrags-Bevollmächtigte:r (optional; volle Personalien)">
          <input className={inputCls} value={nachtragsbevollmaechtigter} onChange={(e) => setNachtragsbevollmaechtigter(e.target.value)}
            placeholder="Vorname Name, Geburtsdatum, Bürgerort, Wohnadresse" />
        </Field>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-s text-ink-700">
        <label className="flex items-center gap-2"
          title="Konstituierung, Zeichnungsberechtigung und Domizil werden in der Gründungsurkunde erklärt (ZH Ziff. VII, Bedingung: VR vollzählig anwesend) – das separate VR-Protokoll entfällt.">
          <input type="checkbox" checked={konstituierungInUrkunde} onChange={(e) => setKonstituierungInUrkunde(e.target.checked)} />
          Konstituierung in der Urkunde
        </label>
        <label className="flex items-center gap-2"
          title="Das Domizil wird in der Urkunde weggelassen und steht nur in der HR-Anmeldung (ZH-Erläuterung zu Ziff. VII).">
          <input type="checkbox" checked={domizilNurAnmeldung} onChange={(e) => setDomizilNurAnmeldung(e.target.checked)} />
          Domizil nur in der Anmeldung
        </label>
      </div>

      {/* Etappe 4.3: Lex-Koller-Erklärung (Art. 18 BewG; ZH-Formular) */}
      {immobilienHauptzweck && (
        <div className="space-y-2">
          <p className="text-body-s font-medium text-ink-900">Lex-Koller-Erklärung (Erwerb von Grundstücken durch Personen im Ausland)</p>
          <div className="flex flex-col gap-1.5 text-body-s text-ink-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lkAusland} onChange={(e) => setLkAusland(e.target.checked)} />
              Personen im Ausland (Art. 5 BewG) sind an der Gesellschaft beteiligt
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lkNeuerwerb} onChange={(e) => setLkNeuerwerb(e.target.checked)} />
              Personen im Ausland erwerben mit der Gründung neu eine Beteiligung
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={lkGrundstueck} onChange={(e) => setLkGrundstueck(e.target.checked)} />
              Bei Sacheinlage: Die Gesellschaft erwirbt Nicht-Betriebsstätte-Grundstücke in der Schweiz
            </label>
          </div>
        </div>
      )}

      {/* Etappe 4.4: Gründungs-Nachtrag (ZH-Vorlage 3.4; ENTWURF) */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-body-s text-ink-700">
          <input type="checkbox" checked={nachtragAktiv} onChange={(e) => setNachtragAktiv(e.target.checked)} />
          Nachtrag zur Gründungsurkunde vorbereiten (nach Beanstandung durch die Handelsregisterbehörde)
        </label>
        {nachtragAktiv && (
          <div className="rounded-md border border-line p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Datum der Gründungsurkunde">
                <input type="date" className={inputCls} value={ntGruendungsdatum} onChange={(e) => setNtGruendungsdatum(e.target.value)} />
              </Field>
              <Field label="Geänderte Urkunden-Ziffer (z. B. III)">
                <input className={inputCls} value={ntUrkundeZiffer} onChange={(e) => setNtUrkundeZiffer(e.target.value)} />
              </Field>
            </div>
            <Field label="Neuer Wortlaut der Urkunden-Ziffer">
              <textarea className={inputCls} rows={3} value={ntUrkundeText} onChange={(e) => setNtUrkundeText(e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Geänderter Statuten-Artikel (Nr.)">
                <input className={inputCls} inputMode="numeric" value={ntStatutenArtikel} onChange={(e) => setNtStatutenArtikel(e.target.value)} />
              </Field>
              <Field label="Absatz (optional)">
                <input className={inputCls} inputMode="numeric" value={ntStatutenAbsatz} onChange={(e) => setNtStatutenAbsatz(e.target.value)} />
              </Field>
            </div>
            <Field label="Neuer Wortlaut des Statuten-Artikels">
              <textarea className={inputCls} rows={3} value={ntStatutenText} onChange={(e) => setNtStatutenText(e.target.value)} />
            </Field>
          </div>
        )}
      </div>
    </div>
  );

  const schrittDokumente = (
    <div className="space-y-5">
      {blockerKlickbar('Damit die Dokumente erzeugt werden können, fehlt noch — Klick führt zum Eingabefeld:')}
      <MappenGates gates={{ blocker: [], warnungen: mappe.gates.warnungen }} />

      {mappe.dokumente.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="lc-btn-primary" disabled={batchLaeuft} onClick={alleHerunterladen}>
              {batchLaeuft ? 'Erzeuge ZIP …' : `Alle ${mappe.dokumente.length} Dokumente herunterladen (ZIP)`}
            </button>
            <p className="text-xs text-ink-500 max-w-reading">
              Lädt alle notwendigen Dokumente Ihrer Konstellation als eine ZIP-Datei herunter, je als PDF
              und Word (DOCX) — Statuten und Errichtungsakt (sowie Sacheinlageverträge mit Grundstück) als
              ENTWURF mit Wasserzeichen, die übrigen druckfertig.
            </p>
          </div>
          {batchMeldung && <p className="text-body-s text-ink-700">{batchMeldung}</p>}
          <MappenAnsicht
            dokumente={mappe.dokumente}
            bannerEntwurf={BANNER_ENTWURF}
            docxErlaubt={card?.modus === 'vorlage' && (card.output?.includes('docx') ?? false)}
            startDokId="statuten"
          />
        </div>
      )}

      {/* Checkliste (Art. 43/44 HRegV) */}
      {PHASEN.map((ph) => {
        const zeilen = checkliste.unterlagen.filter((x) => x.phase === ph.id);
        if (zeilen.length === 0) return null;
        return (
          <section key={ph.id} className="rounded-xl border border-line p-4 space-y-3">
            <div>
              <p className="lc-overline">{ph.titel}</p>
              <p className="text-body-s text-ink-500">{ph.lead}</p>
            </div>
            <ul className="space-y-3">
              {zeilen.map((z) => (
                <li key={z.id} className="border-b border-line last:border-b-0 pb-3 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-body-s font-medium text-ink-900">{z.titel}</span>
                    <NormLink artikel={z.norm} />
                    <span className="lc-chip">{ERSTELLER_LABEL[z.ersteller]}</span>
                    {z.ausgeloestDurch && <span className="lc-chip">wegen: {z.ausgeloestDurch}</span>}
                  </div>
                  {z.hinweis && <p className="text-xs text-ink-500 mt-1 max-w-reading">{z.hinweis}</p>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* Kosten (Bund) */}
      <section className="rounded-xl border border-line p-4 space-y-3">
        <p className="lc-overline">Kosten (Bund) und Hinweise</p>
        <ul className="lc-list space-y-2 text-body-s text-ink-700">
          <li>
            <span className="font-medium text-ink-900">Handelsregister-Gebühr: CHF 420</span> (GebV-HReg, SR 221.411.1, Anhang Ziff. 1.3 «Kapitalgesellschaften», Stand 1.1.2021) — zuzüglich allfälliger Zuschläge bis 50 % und Auslagen (Art. 3/4 GebV-HReg).
          </li>
          {checkliste.emissionsabgabeChf !== null && (
            <li>
              <span className="font-medium text-ink-900">Emissionsabgabe: {CHF.format(checkliste.emissionsabgabeChf)}</span> — 1 % des CHF 1 Mio. übersteigenden Teils der Leistungen (Art. 8 Abs. 1 und Art. 6 Abs. 1 lit. h StG); Bemessung mindestens zum Nennwert, Sachen zum Verkehrswert.
            </li>
          )}
          <li>
            Notariatsgebühren sind kantonal geregelt (z. B. BE: Gebührenverordnung BSG 169.81) und hier bewusst nicht beziffert; Bank-Sperrkonto je nach Institut (Praxisbeispiel ZKB: 0,5 ‰, mind. CHF 250).
          </li>
          <li>
            Fremdsprachige Belege: wichtige Belege (Statuten, Urkunden, Sacheinlageverträge, Berichte) nur
            mit beglaubigter deutscher Übersetzung einreichen (Merkblatt «Formelle Anforderungen», HRegA ZH, 7.1.2025).
          </li>
          {checkliste.hinweise.map((h) => (
            <li key={h.slice(0, 40)}>{h}</li>
          ))}
        </ul>
      </section>

      {/* Etappe 5/D20+D21: Nach dem Eintrag — Pflichten und Warnung */}
      <section className="rounded-xl border border-line p-4 space-y-3">
        <p className="lc-overline">Nach dem Eintrag: Pflichten des Verwaltungsrates</p>
        <ul className="lc-list space-y-2 text-body-s text-ink-700">
          <li>
            <span className="font-medium text-ink-900">Buchführung ist persönliche Pflicht</span> jedes
            VR-Mitglieds: Die Buchführungspflicht folgt aus Art. 957 ff. OR, die Ausgestaltung des
            Rechnungswesens ist unübertragbare VR-Aufgabe (Art. 716a Abs. 1 Ziff. 3 OR) — sie gilt auch
            bei einer Firmenübernahme ohne erhaltene Buchhaltung; Unterlassung kann strafbar sein
            (Art. 166 StGB).
          </li>
          <li>
            <span className="font-medium text-ink-900">Kapitalverlust und Überschuldung:</span> Sind die
            Schulden nur noch zur Hälfte durch Aktiven gedeckt, sind Sanierungsmassnahmen zu ergreifen und
            ein geprüfter Zwischenabschluss zu erstellen (auch ohne Revisionsstelle); bei Überschuldung ist
            das Gericht zu benachrichtigen (Art. 725, 725b Abs. 3 OR) — sonst drohen persönliche Haftung
            und Strafbarkeit (Art. 165 StGB). Quelle: Merkblatt «Gesetzliche Pflichten als Mitglied des
            Verwaltungsrats», HRegA ZH, 3.12.2025.
          </li>
          <li>
            <span className="font-medium text-ink-900">Vorsicht vor privaten Registern:</span> Nach dem
            Eintrag verschicken private Firmen («Handelsregisteramt Schweiz», «ZEFIREG» u. ä.)
            rechnungsähnliche Offerten — nur die Rechnung des kantonalen Handelsregisteramts ist zu
            bezahlen (Merkblatt HRegA ZH, 17.2.2026; zh.ch/falsche-rechnungen).
          </li>
        </ul>
      </section>

      <p className="text-xs text-ink-500">
        Amtliche Vorlagen-Suite des HRegA Zürich: Musterstatuten (kurz/lang), VR-Protokoll, Wahlannahme-,
        Domizilannahmeerklärung und Unterschriftenblatt (zh.ch, notariate-zh.ch); elektronischer Weg über
        EasyGov (die Beurkundung bleibt beim Notariat). Vergleich der Unterlagen mit der GmbH:{' '}
        <Link to="/vorlagen/gmbh-gruendung" className="text-brass-700 underline">GmbH-Gründungsunterlagen</Link>.
      </p>
    </div>
  );

  const inhalteRoh = [schrittKonstellation, schrittGesellschaft, schrittKapital, schrittPersonen, schrittWeiteres, schrittDokumente];
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
          {mappe.gates.blocker.slice(0, 8).map((b) => <li key={b}>{b}</li>)}
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
