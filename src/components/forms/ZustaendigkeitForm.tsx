import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EckdatenKachel, ErgebnisSprung, FehlerBox, Field, LiveHeader, inputCls } from '../vorlagen/ui';
import { SelectionGrid } from '../ui/SelectionGrid';
import { BetragsFeld } from '../BetragsFeld';
import { ErgebnisAnzeige } from '../ErgebnisAnzeige';
import { PdfExportButton } from '../PdfExport';
import { PflichtDisclaimer } from '../PflichtDisclaimer';
import { KANTONE } from '../../lib/kantone';
import type { Kanton } from '../../types/legal';
import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import {
  zustaendigkeitErgebnis, ZPO_SCHWELLEN, bestimmeRechtsmittel,
  type ZustaendigkeitInput, type Streitsache, type MieteUnterfall, type Rechtsweg,
  type DeliktUnterfall, type PersoenlichkeitUnterfall, type IpUnterfall,
  type RmObjekt, type RmVerfahren, type RmVorinstanz,
} from '../../lib/zustaendigkeit';
import { obereInstanzFuer } from '../../data/obereInstanzen';
import { stelleFuer, kantonErfasst, kantonZustaendigkeit, gemeindeImKanton } from '../../data/zustaendigkeitKantone';
import { schlichtungAufloesung } from '../../data/schlichtungsstellen';
import { kostenFuer } from '../../data/zustaendigkeitKosten';
import { ERLASS_LINKS } from '../../data/erlassLinks';
import { fahrplanSchritte } from '../../lib/zustaendigkeitFahrplan';
import { hauptTreffer, plzAufloesen, type PlzTreffer } from '../../data/plz/plzAufloesung';
import { zuerichKreisAemter, type ZhKreisAmt } from '../../data/schlichtung/zhAmt';
import { amtFuer, AMT_KANTONE, type SchlichtungsAmt } from '../../data/schlichtung/amtAufloesung';
import { behoerdeAlsBlock } from '../../lib/vorlagen/behoerden';
import { sgPrefillKodieren } from '../../lib/vorlagen/schlichtungsgesuchBs';
import { SchkgZustaendigkeitTeil } from './SchkgZustaendigkeitTeil';
import { StrafZustaendigkeitTeil } from './StrafZustaendigkeitTeil';
import { handelsgerichtFuer } from '../../data/handelsgerichte';

// ─── Zuständigkeitsrechner – UI (Umbau 5.6.2026, Entscheid David) ───────────
// Vier-Stufen-Führung: 1) RECHTSWEG (Zivil aktiv; SchKG/Straf/Verwaltung als
// ehrliche «in Vorbereitung»-Kacheln — eigene künftige Engines, §4) →
// 2) STREITSACHE (daraus folgt die Zuständigkeitslogik) → 3) ORT/STREITWERT/
// INSTANZ → 4) konkrete Behörde MIT Adresse + ART der Eingabe + Vorlagen-Sprung.
// Reine Darstellung (§3): Bundesrecht in lib/zustaendigkeit.ts, Kantonsdaten
// in data/zustaendigkeitKantone.ts.

const DISCLAIMER =
  'Automatisierte Orientierung zur Zuständigkeit nach ZPO (Fassung seit 1.1.2025) – keine Rechtsberatung. ' +
  'Binnenverhältnis Schweiz; internationale Sachverhalte (IPRG/LugÜ), Schiedsklauseln und die ' +
  'Streitwertberechnung selbst sind nicht abgebildet. Ermessensfragen (z. B. Handelsgericht) werden ' +
  'als offene Weichen ausgewiesen; der konkrete Fall ist fachlich zu prüfen.';

const RECHTSWEGE: { code: Rechtsweg; label: string; sub: string; aktiv: boolean }[] = [
  { code: 'zivil', label: 'Zivil', sub: 'Forderungen, Miete, Arbeit, Familie (ZPO)', aktiv: true },
  { code: 'schkg', label: 'Betreibung (SchKG)', sub: 'Betreibungsort, Rechtsöffnung, Aberkennung u. a.', aktiv: true },
  { code: 'straf', label: 'Straf', sub: 'Anzeige, Gerichtsstand, Strafantrag (StPO)', aktiv: true },
  { code: 'verwaltung', label: 'Verwaltung', sub: 'Beschwerdeinstanzen (VwVG/kantonal)', aktiv: false },
];

const STREITSACHEN: { code: Streitsache; label: string; sub: string }[] = [
  { code: 'geldforderung', label: 'Vertrag / Geldforderung', sub: 'Rechnung, Darlehen, Kauf u. a.' },
  { code: 'miete_wohn_geschaeft', label: 'Miete & Pacht', sub: 'Wohn-/Geschäftsräume inkl. Kündigungsschutz' },
  { code: 'arbeit', label: 'Arbeitsrecht', sub: 'Forderungen aus dem Arbeitsverhältnis' },
  { code: 'delikt', label: 'Schadenersatz (Delikt)', sub: 'Unerlaubte Handlung, Verkehrsunfall (Art. 36–38 ZPO)' },
  { code: 'persoenlichkeit', label: 'Persönlichkeit & Datenschutz', sub: 'Verletzung, Gegendarstellung, DSG, Gewaltschutz (Art. 20 ZPO)' },
  { code: 'scheidung', label: 'Scheidung', sub: 'Gemeinsames Begehren oder Klage (Art. 274 ff. ZPO)' },
  { code: 'erbrecht', label: 'Erbrecht', sub: 'Erbrechtliche Klagen (Herabsetzung, Ungültigkeit, Teilung)' },
  { code: 'gesellschaft', label: 'Gesellschaftsrecht', sub: 'Verantwortlichkeitsklagen (Art. 40 ZPO)' },
  { code: 'ip_wettbewerb', label: 'IP & Wettbewerb', sub: 'Immaterialgüter, Kartell, Firma, UWG — einzige Instanz (Art. 5 ZPO)' },
];

const DELIKT_UNTERFAELLE: { code: DeliktUnterfall; label: string }[] = [
  { code: 'allgemein', label: 'Allgemeine unerlaubte Handlung (Art. 36 ZPO)' },
  { code: 'verkehrsunfall', label: 'Motorfahrzeug-/Fahrradunfall (Art. 38 ZPO)' },
  { code: 'ungerechtfertigte_massnahme', label: 'Schadenersatz wegen ungerechtfertigter vorsorglicher Massnahme (Art. 37 ZPO)' },
];

const PERSOENLICHKEIT_UNTERFAELLE: { code: PersoenlichkeitUnterfall; label: string }[] = [
  { code: 'verletzung', label: 'Persönlichkeitsverletzung (Art. 28 ZGB)' },
  { code: 'gegendarstellung', label: 'Gegendarstellung' },
  { code: 'datenschutz', label: 'Datenschutz (DSG)' },
  { code: 'gewaltschutz', label: 'Gewalt, Drohungen, Nachstellungen (Art. 28b/28c ZGB)' },
];

const MIETE_UNTERFAELLE: { code: MieteUnterfall; label: string }[] = [
  { code: 'kuendigungsschutz', label: 'Kündigungsschutz (Anfechtung der Kündigung)' },
  { code: 'erstreckung', label: 'Erstreckung des Mietverhältnisses' },
  { code: 'mietzins_anfechtung', label: 'Schutz vor missbräuchlichem Mietzins' },
  { code: 'hinterlegung', label: 'Hinterlegung des Mietzinses' },
  { code: 'sonstige', label: 'Übrige Miet-/Pachtstreitigkeit (z. B. Forderung)' },
];

// Welcher Ort ist je Streitsache örtlich massgeblich? (reine Beschriftung —
// die Regel selbst lebt in der Engine, Art. 10/23/32/33/34 ZPO)
const ORT_LABEL: Record<Streitsache, string> = {
  geldforderung: 'Wohnsitz/Sitz der beklagten Partei',
  miete_wohn_geschaeft: 'Ort der Miet-/Pachtsache',
  arbeit: 'Wohnsitz/Sitz der beklagten Partei oder gewöhnlicher Arbeitsort',
  scheidung: 'Wohnsitz einer der Parteien',
  erbrecht: 'letzter Wohnsitz der Erblasserin/des Erblassers',
  delikt: 'Wohnsitz/Sitz einer Partei, Handlungs- oder Erfolgsort',
  persoenlichkeit: 'Wohnsitz/Sitz einer der Parteien',
  gesellschaft: 'Wohnsitz/Sitz der beklagten Partei oder Sitz der Gesellschaft',
  ip_wettbewerb: 'Wohnsitz/Sitz der beklagten Partei (bzw. Handlungs-/Erfolgsort)',
};

type Instanz = 'einleitung' | 'rechtsmittel';

type State = {
  streitsache: Streitsache;
  vermoegensrechtlich: boolean;
  streitwertRoh: string;
  mieteUnterfall: MieteUnterfall;
  glgBetroffen: boolean;
  konsumentenvertrag: boolean;
  klaegeristGeschuetzt: boolean;
  geschaeftlicheTaetigkeit: boolean;
  beklagteImHR: boolean;
  klaegerImHR: boolean;
  beklagteAuslandOderUnbekannt: boolean;
  widerklageOderGerichtlicheFrist: boolean;
  // Ausbau 5.6.2026:
  ausVertrag: boolean;
  deliktUnterfall: DeliktUnterfall;
  persoenlichkeitUnterfall: PersoenlichkeitUnterfall;
  ipUnterfall: IpUnterfall;
  bundKlagerecht: boolean;
  avgVerleih: boolean;
  gerichtsstandsvereinbarung: boolean;
  gemeinde: string;
  plz: string;
  kanton: Kanton | '';
  instanz: Instanz;
  // Rechtsmittel-Umbau 6.6.2026 (Auftrag David):
  rmObjekt: RmObjekt;
  rmVerfahren: RmVerfahren;
  rmVorinstanz: RmVorinstanz;
  rmFamilienSummarsache: boolean;
};

const DEFAULTS: State = {
  streitsache: 'geldforderung',
  vermoegensrechtlich: true,
  streitwertRoh: '',
  mieteUnterfall: 'sonstige',
  glgBetroffen: false,
  konsumentenvertrag: false,
  klaegeristGeschuetzt: true,
  geschaeftlicheTaetigkeit: false,
  beklagteImHR: false,
  klaegerImHR: false,
  beklagteAuslandOderUnbekannt: false,
  widerklageOderGerichtlicheFrist: false,
  ausVertrag: false,
  deliktUnterfall: 'allgemein',
  persoenlichkeitUnterfall: 'verletzung',
  ipUnterfall: 'ip_kartell_firma',
  bundKlagerecht: false,
  avgVerleih: false,
  gerichtsstandsvereinbarung: false,
  gemeinde: '',
  plz: '',
  kanton: '',
  instanz: 'einleitung',
  rmObjekt: 'endentscheid',
  rmVerfahren: 'ordentlich_vereinfacht',
  rmVorinstanz: 'erstinstanz',
  rmFamilienSummarsache: false,
};

export function ZustaendigkeitForm({ onRechtswegChange, rechtswegVorwahl }: {
  onRechtswegChange?: (w: Rechtsweg) => void;
  /** Vorauswahl aus dem URL-Hash der Katalog-Split-Karten (#schkg/#straf). */
  rechtswegVorwahl?: Rechtsweg;
} = {}) {
  const [f, setF] = useState<State>(DEFAULTS);
  // Rechtsweg-Wahl (5.6.2026): Zivil + SchKG aktiv; Straf/Verwaltung folgen.
  const [rechtsweg, setRechtswegState] = useState<Rechtsweg>(rechtswegVorwahl ?? 'zivil');
  // Hero-Synchronisation (Fix 6.6.2026): Der Seitenkopf zeigt die Normen des
  // gewählten Rechtswegs — reine Anzeige-Meldung nach oben (§3).
  const setRechtsweg = (w: Rechtsweg) => { setRechtswegState(w); onRechtswegChange?.(w); };
  // Hash-Wechsel bei gemounteter Seite (Katalog-Split 6.6.2026): nur den
  // EIGENEN State anpassen (adjusting state); der Seitenkopf liest denselben
  // Hash selbst — kein setState fremder Komponenten während des Renderns.
  const [letzteVorwahl, setLetzteVorwahl] = useState(rechtswegVorwahl);
  if (rechtswegVorwahl !== letzteVorwahl) {
    setLetzteVorwahl(rechtswegVorwahl);
    if (rechtswegVorwahl) setRechtswegState(rechtswegVorwahl);
  }
  const set = <K extends keyof State>(k: K, v: State[K]) => setF((alt) => ({ ...alt, [k]: v }));

  // ── PLZ-Auflösung (amtliches Ortschaftenverzeichnis, lazy) ────────────────
  // Sämtliche setState-Aufrufe asynchron in der Promise-Kette (Lint-Regel
  // «kein synchrones setState im Effect»). Eindeutiger Kanton/Gemeinde aus
  // der PLZ wird automatisch gesetzt (amtliches Register, keine Heuristik);
  // bei Kantonsgrenz-PLZ bleibt die Wahl beim Nutzer.
  const [plzTreffer, setPlzTreffer] = useState<PlzTreffer[] | null>(null);
  useEffect(() => {
    let aktiv = true;
    plzAufloesen(f.plz)
      .then((treffer) => {
        if (!aktiv) return;
        setPlzTreffer(treffer);
        if (!treffer || treffer.length === 0) return;
        const kantone = [...new Set(treffer.map((t) => t.kanton))];
        const gemeinden = [...new Set(treffer.map((t) => t.gemeinde))];
        // PLZ-Audit-Fix 6.6.2026 (Beispiel 4052 Basel 97.7 % / Münchenstein
        // 2.3 %): Bei Randgebiets-Überlappungen wird die amtliche HAUPT-
        // Gemeinde (einziger Treffer ≥ 50 % Adressenanteil) vorausgefüllt;
        // die Randgemeinde bleibt im Hinweis wählbar (keine Heuristik).
        const haupt = hauptTreffer(treffer);
        setF((alt) => ({
          ...alt,
          ...(kantone.length === 1 && alt.kanton !== kantone[0]
            ? { kanton: kantone[0] }
            : haupt && alt.kanton === '' ? { kanton: haupt.kanton } : {}),
          ...(gemeinden.length === 1 && alt.gemeinde.trim() === ''
            ? { gemeinde: gemeinden[0] }
            : haupt && alt.gemeinde.trim() === '' ? { gemeinde: haupt.gemeinde } : {}),
        }));
      })
      .catch(() => { if (aktiv) setPlzTreffer(null); });
    return () => { aktiv = false; };
  }, [f.plz]);

  // ── Konkretes Schlichtungsamt über Gemeinde (PLZ→Gemeinde→Amt) ────────────
  // Aufgelöste Kantone: AMT_KANTONE (ZH/AG/SG/TG; Ausbau folgt mit den
  // weiteren Gemeinde-Zuordnungen). Stadt Zürich: sechs Kreis-Ämter.
  const [amt, setAmt] = useState<SchlichtungsAmt | null>(null);
  const [zhKreise, setZhKreise] = useState<ZhKreisAmt[] | null>(null);
  useEffect(() => {
    let aktiv = true;
    const lade = async (): Promise<{ amt: SchlichtungsAmt | null; kreise: ZhKreisAmt[] | null }> => {
      const kanton = f.kanton;
      const gemeinde = f.gemeinde.trim();
      if (kanton === '' || !AMT_KANTONE.includes(kanton) || gemeinde === '') return { amt: null, kreise: null };
      if (kanton === 'ZH' && gemeinde.toLowerCase() === 'zürich') {
        return { amt: null, kreise: await zuerichKreisAemter() };
      }
      return { amt: await amtFuer(kanton, gemeinde), kreise: null };
    };
    lade()
      .then((r) => { if (aktiv) { setAmt(r.amt); setZhKreise(r.kreise); } })
      .catch(() => { if (aktiv) { setAmt(null); setZhKreise(null); } });
    return () => { aktiv = false; };
  }, [f.kanton, f.gemeinde]);

  const istMiete = f.streitsache === 'miete_wohn_geschaeft';
  const istArbeit = f.streitsache === 'arbeit';
  const istGeld = f.streitsache === 'geldforderung';
  const istScheidung = f.streitsache === 'scheidung';

  // Scheidung: nicht vermögensrechtlich, kein Streitwert (UI blendet aus).
  const vermoegensrechtlich = istScheidung ? false : f.vermoegensrechtlich;
  const streitwert = f.streitwertRoh.trim() === '' ? null : Number(f.streitwertRoh);
  const fehler: string[] = [];
  if (vermoegensrechtlich && streitwert === null) fehler.push('Streitwert angeben (oder «nicht vermögensrechtlich» wählen).');
  if (vermoegensrechtlich && streitwert !== null && (!Number.isFinite(streitwert) || streitwert < 0)) fehler.push('Streitwert muss eine Zahl ≥ 0 sein.');

  const input: ZustaendigkeitInput | null = fehler.length > 0 ? null : {
    streitsache: f.streitsache,
    vermoegensrechtlich,
    streitwertCHF: vermoegensrechtlich ? streitwert : null,
    mieteUnterfall: istMiete ? f.mieteUnterfall : undefined,
    glgBetroffen: istArbeit ? f.glgBetroffen : undefined,
    konsumentenvertrag: istGeld ? f.konsumentenvertrag : undefined,
    klaegeristGeschuetzt: f.klaegeristGeschuetzt,
    geschaeftlicheTaetigkeit: istGeld ? f.geschaeftlicheTaetigkeit : undefined,
    beklagteImHR: istGeld ? f.beklagteImHR : undefined,
    klaegerImHR: istGeld ? f.klaegerImHR : undefined,
    beklagteAuslandOderUnbekannt: istScheidung ? undefined : f.beklagteAuslandOderUnbekannt,
    widerklageOderGerichtlicheFrist: istScheidung ? undefined : f.widerklageOderGerichtlicheFrist,
    ausVertrag: istGeld && !f.konsumentenvertrag ? f.ausVertrag : undefined,
    deliktUnterfall: f.streitsache === 'delikt' ? f.deliktUnterfall : undefined,
    persoenlichkeitUnterfall: f.streitsache === 'persoenlichkeit' ? f.persoenlichkeitUnterfall : undefined,
    ipUnterfall: f.streitsache === 'ip_wettbewerb' ? f.ipUnterfall : undefined,
    bundKlagerecht: f.streitsache === 'ip_wettbewerb' && f.ipUnterfall === 'uwg' ? f.bundKlagerecht : undefined,
    avgVerleih: istArbeit ? f.avgVerleih : undefined,
    gerichtsstandsvereinbarung: istScheidung ? undefined : f.gerichtsstandsvereinbarung,
    // Rechtsmittel-Weichen nur im Rechtsmittel-Modus mitgeben (§3: reine Durchreiche).
    rmObjekt: f.instanz === 'rechtsmittel' ? f.rmObjekt : undefined,
    rmVerfahren: f.instanz === 'rechtsmittel' ? f.rmVerfahren : undefined,
    rmVorinstanz: f.instanz === 'rechtsmittel' ? f.rmVorinstanz : undefined,
    rmFamilienSummarsache: f.instanz === 'rechtsmittel' ? f.rmFamilienSummarsache : undefined,
  };

  const ergebnis = (() => {
    if (!input) return null;
    try { return zustaendigkeitErgebnis(input); } catch { return null; }
  })();
  const r = ergebnis?.resultat ?? null;

  // Rechtsmittel-Auflösung (Ausbau «obere Instanzen», 5.6.2026): Bundesrecht
  // aus der Engine, konkrete obere Instanz aus der zweifach geprüften
  // Datenschicht. Nur im Rechtsmittel-Modus berechnet.
  const rechtsmittel = input && f.instanz === 'rechtsmittel' ? bestimmeRechtsmittel(input) : null;
  const obereInstanz = f.kanton !== '' ? obereInstanzFuer(f.kanton) : null;

  // Stellen-Auflösung (Kantonsschicht): Schlichtungsstellen — nur Einleitung.
  const stelle = r && f.kanton && f.instanz === 'einleitung' && r.schlichtung.obligatorisch
    ? stelleFuer(f.kanton, r.schlichtung.behoerdeTyp)
    : null;
  // Recherche-Schicht (Anordnung David 5.6.2026): konkrete Stelle für ALLE
  // Kantone — abgenommene Stammdaten (behoerden.ts) haben Vorrang.
  const recherche = r && f.kanton && !stelle && f.instanz === 'einleitung' && r.schlichtung.obligatorisch
    ? schlichtungAufloesung(f.kanton, r.schlichtung.behoerdeTyp)
    : null;
  const kantonOffen = f.kanton !== '' && !kantonErfasst(f.kanton) && !recherche;
  const kantonDaten = f.kanton ? kantonZustaendigkeit(f.kanton) : null;
  const gemeindeFremd = f.kanton !== '' && kantonErfasst(f.kanton)
    && f.gemeinde.trim() !== '' && !gemeindeImKanton(f.kanton, f.gemeinde);

  // CTA «Weiter zur Vorlage» (Auftrag §8): nur wenn die Ziel-Vorlage den Fall
  // trägt UND die Stelle erfasst ist; sonst ehrlich ausgeblendet.
  const sgTyp = istGeld ? 'geldforderung' as const : istArbeit ? 'arbeitsrecht' as const
    : f.streitsache === 'erbrecht' ? 'uebrige_zivilsache' as const : null;
  const sgPrefill = r && stelle && f.kanton === 'BS' && r.eingabeArt === 'schlichtungsgesuch'
    && r.schlichtung.behoerdeTyp === 'ordentlich' && sgTyp
    ? sgPrefillKodieren({ typ: sgTyp, betragCHF: vermoegensrechtlich ? streitwert : null, kanton: 'BS' })
    : null;

  // Praxis-Fahrplan + kantonale Kosten (Umbau 5.6.2026)
  const fahrplan = r ? fahrplanSchritte(r, { vorlageVerfuegbar: false, stelleBekannt: !!(stelle || recherche) }) : null;
  const kosten = f.kanton ? kostenFuer(f.kanton) : null;
  // Handelsgericht (Anordnung David 5.6.2026): konkrete Adresse in den
  // 4 HG-Kantonen, ehrliche Verneinung sonst — nur wenn die Engine die
  // Art.-6-Weiche stellt.
  const hgWeicheAktiv = r ? r.weichen.some((w) => w.includes('Handelsgericht')) : false;
  const handelsgericht = f.kanton !== '' ? handelsgerichtFuer(f.kanton) : null;

  const eingabeText = r === null ? '' : r.eingabeArt === 'scheidungsbegehren_oder_klage'
    ? 'Gemeinsames Scheidungsbegehren (bei Einigung) oder Scheidungsklage'
    : r.eingabeArt === 'schlichtungsgesuch' ? 'Schlichtungsgesuch (Art. 202 ZPO)' : 'Klage direkt beim Gericht';

  const pdfConfig: PdfDocConfig = {
    title: 'Zuständigkeit (ZPO)',
    rechtsgrundlage: 'Bestimmung nach Art. 4 ff., 197 ff., 243 ZPO (Fassung 1.1.2025)',
    domain: 'zustaendigkeit',
    fileBase: 'Zustaendigkeit',
    inputs: {
      'Rechtsweg': 'Zivil (ZPO)',
      'Streitsache': STREITSACHEN.find((s) => s.code === f.streitsache)?.label ?? f.streitsache,
      ...(istScheidung ? {} : { 'Streitwert': vermoegensrechtlich && streitwert !== null ? `CHF ${streitwert.toLocaleString('de-CH')}` : 'nicht vermögensrechtlich' }),
      ...(istMiete ? { 'Miet-Unterfall': MIETE_UNTERFAELLE.find((m) => m.code === f.mieteUnterfall)?.label ?? '' } : {}),
      ...(f.gemeinde.trim() || f.plz ? { 'Massgeblicher Ort': [f.plz, f.gemeinde.trim()].filter(Boolean).join(' ') } : {}),
      ...(f.kanton ? { 'Kanton (Forum)': f.kanton } : {}),
    },
    hero: r ? {
      hauptlabel: 'Einleitende Eingabe',
      hauptwert: eingabeText,
      nebenwerte: [
        { label: 'Verfahrensart', wert: r.verfahrensart === 'vereinfacht' ? 'vereinfacht' : r.verfahrensart === 'scheidungsverfahren' ? 'Scheidungsverfahren' : 'ordentlich' },
        ...(stelle ? [{ label: 'Zuständige Stelle', wert: stelle.name }] : []),
      ],
      kontext: r.oertlich.gerichtsstand,
    } : undefined,
    sections: ergebnis ? [{ titel: 'Zuständigkeit nach ZPO', ergebnis }] : [],
    disclaimer: DISCLAIMER,
  };

  return (
    <div className="space-y-6">
      <PflichtDisclaimer text={
        rechtsweg === 'schkg'
          ? 'Automatisierte Orientierung zu Betreibungsort und SchKG-Foren (SchKG, Stand 1.1.2025; GebV SchKG Stand 1.1.2022) – keine Rechtsberatung. Internationale Sachverhalte und die materielle Begründetheit sind nicht abgebildet; Fristen sind Verwirkungsfristen und im Einzelfall zu prüfen.'
          : rechtsweg === 'straf'
            ? 'Automatisierte Orientierung zum Gerichtsstand im Strafverfahren (StPO, Stand 1.1.2024) – keine Rechtsberatung. Die Katalog-Subsumtion der Bundesgerichtsbarkeit (Art. 23/24 StPO) und jugendstrafrechtliche Sonderwege (JStPO) sind nicht abgebildet.'
            : DISCLAIMER
      } />

      {/* 1 · Rechtsweg */}
      <div className="space-y-2">
        <p className="lc-overline">1 · Rechtsweg</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          {RECHTSWEGE.map((w) => (
            <button key={w.code} type="button" disabled={!w.aktiv}
              aria-pressed={rechtsweg === w.code}
              onClick={() => w.aktiv && setRechtsweg(w.code)}
              title={w.aktiv ? undefined : 'In Vorbereitung — eigene Engine folgt'}
              className={`text-left p-3 rounded-lg border transition-colors ${
                rechtsweg === w.code ? 'border-brass-500 bg-brass-100/60'
                : w.aktiv ? 'border-line bg-surface hover:border-brass-400'
                : 'border-line bg-surface opacity-55 cursor-not-allowed'
              }`}>
              <span className="block text-body-s font-medium text-ink-900">
                {w.label}{!w.aktiv && <span className="lc-badge lc-badge-soft ml-2">in Vorbereitung</span>}
              </span>
              <span className="block text-xs text-ink-500 mt-0.5">{w.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {rechtsweg === 'schkg' ? <SchkgZustaendigkeitTeil /> : rechtsweg === 'straf' ? <StrafZustaendigkeitTeil /> : <>

      {/* 2 · Eingangs-Gabelung (Anordnung David 6.6.2026): Einleitung vs.
          Rechtsmittel ZUERST — bestimmt, welche Fragen überhaupt nötig sind. */}
      <div className="space-y-2">
        <p className="lc-overline">2 · Was suchen Sie?</p>
        <SelectionGrid
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          items={[
            { code: 'einleitung' as Instanz, label: 'Verfahren einleiten', sub: 'Zuständige Schlichtungsbehörde bzw. erstes Gericht finden' },
            { code: 'rechtsmittel' as Instanz, label: 'Rechtsmittel ergreifen', sub: 'Berufung/Beschwerde — zuständige obere Instanz' },
          ]}
          value={f.instanz}
          onSelect={(code) => set('instanz', code)}
        />
      </div>

      {/* 2b · Angefochtener Entscheid (Rechtsmittel-Umbau 6.6.2026): die
          rechtlich entscheidenden Weichen — Objekt (Art. 308/319 ZPO),
          Verfahrensart der Vorinstanz (Fristlänge + Stillstand!) und
          Vorinstanz-Typ (Art. 75 Abs. 2 BGG). */}
      {f.instanz === 'rechtsmittel' && (
        <div className="space-y-3">
          <p className="lc-overline">2a · Was wird angefochten?</p>
          <SelectionGrid
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            items={[
              { code: 'endentscheid' as RmObjekt, label: 'Endentscheid', sub: 'Das Verfahren wird ganz oder teilweise abgeschlossen' },
              { code: 'zwischenentscheid' as RmObjekt, label: 'Zwischenentscheid', sub: 'z. B. über Zuständigkeit oder Ausstand (selbständig eröffnet)' },
              { code: 'vorsorgliche_massnahme' as RmObjekt, label: 'Vorsorgliche Massnahme', sub: 'Auch Eheschutz nach der BGer-Praxis (Art. 98 BGG)' },
              { code: 'prozessleitende_verfuegung' as RmObjekt, label: 'Prozessleitende Verfügung', sub: 'Nicht berufungsfähig — nur Art. 319 lit. b ZPO' },
            ]}
            value={f.rmObjekt}
            onSelect={(code) => set('rmObjekt', code)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Verfahrensart der Vorinstanz" hint="entscheidet über Fristlänge (30/10 Tage) und Gerichtsferien-Stillstand">
              <select className={inputCls} value={f.rmVerfahren} onChange={(e) => set('rmVerfahren', e.target.value as RmVerfahren)}>
                <option value="ordentlich_vereinfacht">Ordentliches oder vereinfachtes Verfahren</option>
                <option value="summarisch">Summarisches Verfahren (z. B. Rechtsschutz in klaren Fällen, Eheschutz)</option>
              </select>
            </Field>
            <Field label="Wer hat entschieden?" hint="Handelsgericht/Direktklage: kein kantonales Rechtsmittel (Art. 75 Abs. 2 BGG)">
              <select className={inputCls} value={f.rmVorinstanz} onChange={(e) => set('rmVorinstanz', e.target.value as RmVorinstanz)}>
                <option value="erstinstanz">Erstinstanzliches Gericht (Bezirks-/Regional-/Zivilgericht)</option>
                <option value="handelsgericht">Handelsgericht (ZH/BE/AG/SG, Art. 6 ZPO)</option>
                <option value="direktklage_oberes_gericht">Oberes Gericht nach Direktklage (Art. 8 ZPO)</option>
              </select>
            </Field>
          </div>
          {f.rmVerfahren === 'summarisch' && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={f.rmFamilienSummarsache} onChange={(e) => set('rmFamilienSummarsache', e.target.checked)} />
              <span>
                Familienrechtliche Streitigkeit nach Art. 271/276/302/305 ZPO (Eheschutz, vorsorgliche
                Massnahmen im Scheidungsverfahren, Unterhalts-/Vaterschaftsmassnahmen) —
                Berufungsfrist dann 30 statt 10 Tage (Art. 314 Abs. 2 ZPO, seit 1.1.2025)
              </span>
            </label>
          )}
        </div>
      )}

      {/* 2 · Streitsache */}
      <div className="space-y-2">
        <p className="lc-overline">3 · Art des Streits</p>
        <SelectionGrid
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
          items={STREITSACHEN.map((s) => ({ code: s.code, label: s.label, sub: s.sub }))}
          value={f.streitsache}
          onSelect={(code) => set('streitsache', code)}
        />
        {istMiete && (
          <Field label="Miet-Unterfall" hint="Schutzmaterien sind streitwertunabhängig vereinfacht (Art. 243 Abs. 2 lit. c ZPO)">
            <select className={inputCls} value={f.mieteUnterfall} onChange={(e) => set('mieteUnterfall', e.target.value as MieteUnterfall)}>
              {MIETE_UNTERFAELLE.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
            </select>
          </Field>
        )}
        {f.streitsache === 'delikt' && (
          <Field label="Delikts-Unterfall" hint="Spezialforen (Art. 37/38) gehen dem allgemeinen Deliktsforum vor">
            <select className={inputCls} value={f.deliktUnterfall} onChange={(e) => set('deliktUnterfall', e.target.value as DeliktUnterfall)}>
              {DELIKT_UNTERFAELLE.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
            </select>
          </Field>
        )}
        {f.streitsache === 'persoenlichkeit' && (
          <Field label="Unterfall" hint="Gewaltschutz: Schlichtung entfällt (Art. 198 lit. abis), vereinfacht streitwertunabhängig, gerichtskostenfrei (Art. 114 lit. f)">
            <select className={inputCls} value={f.persoenlichkeitUnterfall} onChange={(e) => set('persoenlichkeitUnterfall', e.target.value as PersoenlichkeitUnterfall)}>
              {PERSOENLICHKEIT_UNTERFAELLE.map((m) => <option key={m.code} value={m.code}>{m.label}</option>)}
            </select>
          </Field>
        )}

      {f.streitsache === 'ip_wettbewerb' && (
        <Field label="Art.-5-Materie" hint="UWG/Bund-Klagen sind nur über CHF 30 000 einzige Instanz (lit. d/f)">
          <select className={inputCls} value={f.ipUnterfall} onChange={(e) => set('ipUnterfall', e.target.value as IpUnterfall)}>
            <option value="ip_kartell_firma">IP / Kartell / Firma / übrige unbedingte Katalog-Materien (lit. a–c, e, g–i)</option>
            <option value="uwg">UWG (lit. d — über 30'000 oder Bund klagt)</option>
            <option value="klage_gegen_bund">Klage gegen den Bund (lit. f — nur über 30'000)</option>
          </select>
          {f.ipUnterfall === 'uwg' && (
            <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700 mt-2">
              <input type="checkbox" checked={f.bundKlagerecht} onChange={(e) => set('bundKlagerecht', e.target.checked)} />
              Der Bund übt sein Klagerecht aus (dann einzige Instanz unabhängig vom Streitwert)
            </label>
          )}
        </Field>
      )}
      </div>

      {/* 3 · Ort, Streitwert, Instanz */}
      <div className="space-y-3">
        <p className="lc-overline">4 · Wo — und um wie viel geht es?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {f.instanz === 'einleitung' && (
          <Field label={`Massgeblicher Ort: ${ORT_LABEL[f.streitsache]}`} optional hint="Gemeinde (für die Auflösung der konkreten Stelle)">
            <div className="space-y-1.5">
              <div className="grid grid-cols-[6.5rem_1fr] gap-2">
                <input className={inputCls + ' num'} value={f.plz} inputMode="numeric" maxLength={4}
                  onChange={(e) => set('plz', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="PLZ" aria-label="Postleitzahl" />
                <input className={inputCls} value={f.gemeinde} onChange={(e) => set('gemeinde', e.target.value)} placeholder="z. B. Basel" />
              </div>
              {f.plz.length === 4 && plzTreffer === null && (
                <p className="text-xs text-warn-700">PLZ {f.plz}: im amtlichen Ortschaftenverzeichnis nicht gefunden — bitte prüfen.</p>
              )}
              {plzTreffer && plzTreffer.length > 0 && (() => {
                const kantone = [...new Set(plzTreffer.map((t) => t.kanton))];
                const gemeinden = [...new Set(plzTreffer.map((t) => t.gemeinde))];
                const haupt = hauptTreffer(plzTreffer);
                // Randgebiets-Fall (z. B. 4052): Hauptgemeinde anzeigen, die
                // Splitter-Gemeinden mit ihrem amtlichen Adressenanteil nur als
                // Ausnahme-Hinweis — statt einer pauschalen Mehrkantons-Rückfrage.
                if (haupt && (kantone.length > 1 || gemeinden.length > 1)) {
                  const rand = plzTreffer.filter((t) => t !== haupt);
                  return (
                    <p className="text-xs text-ink-500">
                      PLZ {f.plz}: {haupt.gemeinde} ({haupt.kanton}, {haupt.anteilProzent} % der Adressen)
                      <span> — Randgebiete: {rand.slice(0, 3).map((t) => `${t.gemeinde} (${t.kanton}, ${t.anteilProzent} %)`).join(', ')}{rand.length > 3 ? ` +${rand.length - 3}` : ''}; nur wählen, falls die Adresse dort liegt.</span>
                    </p>
                  );
                }
                return (
                  <p className="text-xs text-ink-500">
                    PLZ {f.plz}: {gemeinden.slice(0, 4).join(', ')}{gemeinden.length > 4 ? ` +${gemeinden.length - 4}` : ''} ({kantone.join('/')})
                    {kantone.length > 1 && <span className="text-warn-700"> — PLZ liegt in mehreren Kantonen, Kanton bitte selbst wählen.</span>}
                    {gemeinden.length > 1 && kantone.length === 1 && <span> — Gemeinde präzisieren.</span>}
                  </p>
                );
              })()}
            </div>
          </Field>
          )}
          <Field label="Kanton (Forum)" hint="alle Kantone hinterlegt (zentrale Stelle, Stellen-Liste oder amtliches Verzeichnis)">
            <select className={inputCls + ' sm:max-w-[9rem]'} value={f.kanton} onChange={(e) => set('kanton', e.target.value as Kanton | '')}>
              <option value="">– wählen –</option>
              {KANTONE.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </Field>
          {!istScheidung && (
            <Field label="Streitwert (CHF)" hint="massgeblich ist das Rechtsbegehren; die Engine berechnet den Streitwert nicht">
              <div className="space-y-1.5">
                <BetragsFeld value={f.streitwertRoh} onChange={(v) => set('streitwertRoh', v)} className={inputCls}
                  placeholder="z. B. 12'000" aria-label="Streitwert in Franken" />
                <label className="flex items-center gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" checked={!f.vermoegensrechtlich}
                    onChange={(e) => set('vermoegensrechtlich', !e.target.checked)} />
                  nicht vermögensrechtliche Streitigkeit
                </label>
              </div>
            </Field>
          )}
        </div>
        {gemeindeFremd && (
          <p className="lc-notice-warn text-body-s">
            «{f.gemeinde.trim()}» ist keine Gemeinde des Kantons {f.kanton} (erfasst: {kantonDaten?.gemeinden.join(', ')}) —
            Kanton oder Ort prüfen.
          </p>
        )}
      </div>

      {/* Sonderfälle eingeklappt (Endkonsumenten-Dramaturgie 6.6.2026):
          Streitsache + Ort + Streitwert tragen das Routing — Spezial-
          konstellationen überladen den Erstkontakt nicht mehr. */}
      {!istScheidung && f.instanz === 'einleitung' && (
        <details className="lc-card p-4 group">
          <summary className="lc-overline cursor-pointer list-none flex items-center justify-between">
            <span>Weitere Angaben — Sonderfälle (Rechtsmittel, Vereinbarungen, Handelsregister, Ausland)</span>
            <span className="text-ink-500 group-open:rotate-180 transition-transform" aria-hidden>▾</span>
          </summary>
          <div className="space-y-3 mt-3">

          {istGeld && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={f.konsumentenvertrag} onChange={(e) => set('konsumentenvertrag', e.target.checked)} />
              <span>Konsumentenvertrag <span className="text-ink-500">(Leistung des üblichen Verbrauchs für persönliche/familiäre Bedürfnisse, Art. 32 ZPO)</span></span>
            </label>
          )}
          {istGeld && !f.konsumentenvertrag && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={f.ausVertrag} onChange={(e) => set('ausVertrag', e.target.checked)} />
              <span>Forderung aus Vertrag <span className="text-ink-500">(zusätzliches Forum am Ort der charakteristischen Leistung — der vertragstypprägenden, i. d. R. nicht der Geldleistung, Art. 31 ZPO)</span></span>
            </label>
          )}
          {istArbeit && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={f.avgVerleih} onChange={(e) => set('avgVerleih', e.target.checked)} />
              <span>Personalverleih/-vermittlung (AVG) <span className="text-ink-500">(zusätzliches Forum am Ort der Geschäftsniederlassung der verleihenden Person, Art. 34 Abs. 2 ZPO)</span></span>
            </label>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={f.gerichtsstandsvereinbarung} onChange={(e) => set('gerichtsstandsvereinbarung', e.target.checked)} />
            <span>Gerichtsstandsvereinbarung vorhanden <span className="text-ink-500">(Wirksamkeit hängt vom Bindungsgrad ab, Art. 9/17/35 ZPO)</span></span>
          </label>
          {istGeld && f.konsumentenvertrag && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700 pl-6">
              <input type="checkbox" className="mt-0.5" checked={f.klaegeristGeschuetzt} onChange={(e) => set('klaegeristGeschuetzt', e.target.checked)} />
              Die Konsumentin / der Konsument klagt
            </label>
          )}
          {istArbeit && (
            <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
              <input type="checkbox" className="mt-0.5" checked={f.glgBetroffen} onChange={(e) => set('glgBetroffen', e.target.checked)} />
              <span>Streit nach Gleichstellungsgesetz <span className="text-ink-500">(paritätische Behörde, vereinfacht streitwertunabhängig)</span></span>
            </label>
          )}
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={f.beklagteAuslandOderUnbekannt} onChange={(e) => set('beklagteAuslandOderUnbekannt', e.target.checked)} />
            <span>Beklagte Partei mit Sitz/Wohnsitz im Ausland oder Aufenthalt unbekannt <span className="text-ink-500">(einseitiger Schlichtungsverzicht, Art. 199 Abs. 2 ZPO)</span></span>
          </label>
          <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
            <input type="checkbox" className="mt-0.5" checked={f.widerklageOderGerichtlicheFrist} onChange={(e) => set('widerklageOderGerichtlicheFrist', e.target.checked)} />
            <span>Widerklage/Hauptintervention oder gerichtlich angesetzte Klagefrist <span className="text-ink-500">(Schlichtung entfällt, Art. 198 lit. g/h ZPO)</span></span>
          </label>
          {istGeld && (
            <details className="lc-card p-4">
              <summary className="cursor-pointer text-body-s font-medium text-ink-700">
                Handelsgerichts-Konstellation <span className="text-ink-500 font-normal">(nur Kantone mit Handelsgericht: ZH/BE/AG/SG; Art. 6 ZPO)</span>
              </summary>
              <div className="mt-3 space-y-2">
                <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={f.geschaeftlicheTaetigkeit} onChange={(e) => set('geschaeftlicheTaetigkeit', e.target.checked)} />
                  Geschäftliche Tätigkeit mindestens einer Partei betroffen
                </label>
                <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={f.beklagteImHR} onChange={(e) => set('beklagteImHR', e.target.checked)} />
                  Beklagte Partei im Handelsregister eingetragen
                </label>
                <label className="flex items-start gap-2 text-body-s cursor-pointer text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={f.klaegerImHR} onChange={(e) => set('klaegerImHR', e.target.checked)} />
                  Klagende Partei im Handelsregister eingetragen
                </label>
              </div>
            </details>
          )}
          </div>
        </details>
      )}

      <FehlerBox fehler={fehler} />

      {/* Rechtsmittel-Fahrplan (Umbau 6.6.2026, Auftrag David): vier Schritte
          statt zweier Textkarten — 1. statthaftes Rechtsmittel · 2. Instanz mit
          Adresse · 3. FRIST konkret aufgelöst (30/10 Tage, Stillstand ja/nein)
          · 4. Weiterzug BGer inkl. eigener Frist, Kognition und Weichen. */}
      {f.instanz === 'rechtsmittel' && rechtsmittel && (
        <div className="lc-reveal space-y-4" aria-live="polite">
          <LiveHeader />

          {/* Schritt 1 · Statthaftes Rechtsmittel */}
          <div className="lc-card p-5 space-y-2">
            <p className="lc-overline">1 · Statthaftes Rechtsmittel (kantonal)</p>
            <p className="text-h3 font-medium text-ink-900 leading-none">
              {rechtsmittel.kantonal === 'berufung' ? 'Berufung'
                : rechtsmittel.kantonal === 'beschwerde' ? 'Beschwerde'
                : rechtsmittel.kantonal === 'entfaellt_einzige_instanz' ? 'Kein kantonales Rechtsmittel'
                : 'Berufung oder Beschwerde — vom Streitwert abhängig'}
            </p>
            <p className="text-body-s text-ink-700">{rechtsmittel.kantonalText}</p>
          </div>

          {/* Schritt 2 · Zuständige Instanz */}
          <div className="lc-card p-5 space-y-3">
            <p className="lc-overline">2 · Wohin?</p>
            {rechtsmittel.kantonal !== 'entfaellt_einzige_instanz' ? (
              f.kanton !== '' ? (
                <div>
                  <p className="text-body-s text-ink-900 whitespace-pre-line">
                    {obereInstanz!.name}{'\n'}{obereInstanz!.strasse}{'\n'}{obereInstanz!.plzOrt}
                  </p>
                  {obereInstanz!.hinweis && <p className="text-xs text-ink-500 mt-1">{obereInstanz!.hinweis}.</p>}
                  <p className="text-xs text-ink-500 mt-1.5">
                    Quelle: zweifach geprüftes Gerichts-Dossier (Stand 5.6.2026) — fachliche Abnahme ausstehend; Adresse vor Einreichung kurz gegenprüfen.
                  </p>
                </div>
              ) : (
                <p className="text-body-s text-ink-500">Kanton wählen, um die zuständige obere Instanz mit Adresse anzuzeigen.</p>
              )
            ) : (
              <p className="text-body-s text-ink-700">
                Die kantonale Rechtsmittelinstanz entfällt — nächste (und einzige) Station ist das Bundesgericht, siehe Schritt 4.
              </p>
            )}
          </div>

          {/* Schritt 3 · Frist (kantonal) — konkret aufgelöst */}
          {rechtsmittel.kantonalFrist && (
            <div className="lc-card p-5 space-y-2">
              <p className="lc-overline">3 · Frist (kantonal)</p>
              <p className="text-h3 font-medium text-ink-900 leading-none">
                {rechtsmittel.kantonalFrist.tage !== null ? `${rechtsmittel.kantonalFrist.tage} Tage` : 'Von offener Weiche abhängig'}
              </p>
              <p className="text-body-s text-ink-700">{rechtsmittel.kantonalFrist.text}</p>
              <p className={`text-body-s ${rechtsmittel.kantonalFrist.stillstand ? 'text-ink-700' : 'text-warn-700 font-medium'}`}>
                {rechtsmittel.kantonalFrist.stillstandText}
              </p>
              <p className="text-xs text-ink-500">
                Konkretes Fristende berechnen: <Link to="/rechner/zpo-fristen" className="text-brass-700 underline">ZPO-Fristenrechner</Link>
                {' '}(Gerichtsferien werden dort automatisch berücksichtigt).
              </p>
            </div>
          )}

          {/* Schritt 4 · Weiterzug ans Bundesgericht */}
          <div className="lc-card p-5 space-y-3">
            <p className="lc-overline">{rechtsmittel.kantonalFrist ? '4' : '3'} · Weiterzug ans Bundesgericht</p>
            <p className="text-h3 font-medium text-ink-900 leading-none">
              {rechtsmittel.bger === 'zulaessig' ? 'Beschwerde in Zivilsachen: zulässig'
                : rechtsmittel.bger === 'schwelle_verfehlt' ? 'Streitwertgrenze nicht erreicht'
                : 'Vom Streitwert abhängig'}
            </p>
            <p className="text-body-s text-ink-700">{rechtsmittel.bgerText}</p>
            <div className="border-t border-line pt-3 space-y-1.5">
              <p className="text-body-s text-ink-900 font-medium">
                Frist: {rechtsmittel.bgerFrist.tage} Tage
              </p>
              <p className="text-body-s text-ink-700">{rechtsmittel.bgerFrist.text}</p>
              <p className={`text-body-s ${rechtsmittel.bgerFrist.stillstand ? 'text-ink-700' : 'text-warn-700 font-medium'}`}>
                {rechtsmittel.bgerFrist.stillstandText}
              </p>
            </div>
            {rechtsmittel.kognitionHinweis && (
              <div className="lc-notice-warn text-body-s">{rechtsmittel.kognitionHinweis}</div>
            )}
            <p className="text-body-s text-ink-900 whitespace-pre-line border-t border-line pt-3">
              Schweizerisches Bundesgericht{'\n'}Av. du Tribunal-fédéral 29{'\n'}1005 Lausanne
            </p>
          </div>

          {/* Offene Rechtsfragen-Weichen (§8: ehrlich ausweisen) */}
          {rechtsmittel.weichen.map((w, i) => (
            <div key={i} className="lc-notice-warn text-body-s">{w}</div>
          ))}

          <div className="lc-notice text-body-s">{rechtsmittel.fristHinweis}</div>
          <div className="flex flex-wrap gap-1.5">
            {rechtsmittel.normverweise.map((n, i) => <span key={i} className="lc-chip">{n.artikel}</span>)}
          </div>
        </div>
      )}

      {/* 4 · Ergebnis — EINLEITUNGS-Sicht (Bug-Check 5.6.2026: im
          Rechtsmittel-Modus tragen die Rechtsmittel-Karten oben die volle
          Auskunft; die Einleitungs-Blöcke [Verfahrensart/Schlichtung/Stellen-
          Notices/Weichen] würden dort sachfremd leaken) */}
      {ergebnis && r && f.instanz === 'einleitung' && (
        <div id="lc-ergebnis" className="lc-reveal space-y-4" aria-live="polite">
          <ErgebnisSprung zielId="lc-ergebnis" />
          <LiveHeader />

          {/* UX-Fix 5.6.2026 (Frage David «wieso bei Arbeitsrecht keine
              Schlichtungsbehörde?»): Ohne Kantonswahl gab es WEDER Stelle noch
              Hinweis — die Behörde ist hinterlegt, nur die Ortsangabe fehlte. */}
          {r.schlichtung.obligatorisch && f.kanton === '' && (
            <div className="lc-card p-4">
              <p className="lc-overline mb-1.5">Zuständige Schlichtungsbehörde</p>
              <p className="text-body-s text-ink-700">
                Die Schlichtungsbehörde ist für alle 26 Kantone hinterlegt — bitte oben
                <span className="font-medium text-ink-900"> PLZ eingeben oder Kanton wählen</span>, damit die
                konkrete Stelle mit Adresse angezeigt werden kann (örtlich massgeblich: {ORT_LABEL[f.streitsache]}).
              </p>
            </div>
          )}
          {/* Handelsgericht-Auflösung (Art. 6 ZPO; 4 Kantone) */}
          {hgWeicheAktiv && f.kanton !== '' && (
            <div className="lc-card p-4 space-y-2">
              <p className="lc-overline">Handelsgericht ({f.kanton})</p>
              {handelsgericht ? (
                <>
                  <p className="text-body-s text-ink-900 whitespace-pre-line">
                    {handelsgericht.name}{'\n'}{handelsgericht.strasse}{'\n'}{handelsgericht.plzOrt}
                  </p>
                  <p className="text-xs text-ink-500">{handelsgericht.organisation}. Bei handelsgerichtlicher Zuständigkeit: Klage direkt, keine Schlichtung (Art. 199 Abs. 3 ZPO); Rechtsmittel direkt ans Bundesgericht (Art. 75 Abs. 2 lit. b BGG).</p>
                </>
              ) : (
                <p className="text-body-s text-ink-700">
                  Der Kanton {f.kanton} führt KEIN Handelsgericht (Art. 6 Abs. 1 ZPO ist eine Kann-Vorschrift; Handelsgerichte
                  bestehen nur in ZH, BE, AG und SG) — die Klage geht an das ordentliche Gericht, die Handelsgericht-Weiche entfällt.
                </p>
              )}
            </div>
          )}
          {/* Konkrete Stelle (Kantonsschicht) + Vorlagen-Sprung */}
          {stelle && (
            <div className="lc-card p-4 space-y-3">
              <div>
                <p className="lc-overline mb-2">Zuständige Schlichtungsstelle ({f.kanton})</p>
                <p className="text-body-s text-ink-900 whitespace-pre-line">{behoerdeAlsBlock(stelle)}</p>
                {stelle.url && (
                  <p className="text-xs mt-1.5">
                    <a href={stelle.url} target="_blank" rel="noopener noreferrer" className="text-brass-700 underline">
                      Amtliche Behördenseite öffnen ↗
                    </a>
                  </p>
                )}
                <p className="text-xs text-ink-500 mt-2">Quelle: {stelle.quelle} (Stand {stelle.stand}).</p>
              </div>
              {sgPrefill && (
                <div className="pt-3 border-t border-line">
                  <Link to={{ pathname: '/vorlagen/schlichtungsgesuch-bs', search: sgPrefill }}
                    className="lc-btn-primary no-underline">
                    Weiter zum Schlichtungsgesuch (BS) →
                  </Link>
                  <p className="text-xs text-ink-500 mt-2">Streitsache und Streitwert werden vorbefüllt — alles bleibt editierbar.</p>
                </div>
              )}
            </div>
          )}
          {r.eingabeArt === 'scheidungsbegehren_oder_klage' && f.instanz === 'einleitung' && (
            <p className="lc-notice text-body-s">
              Vorlage für das gemeinsame Scheidungsbegehren bzw. die Scheidungsklage ist in Vorbereitung —
              örtlich zuständig ist das Gericht am Wohnsitz einer der Parteien (zwingend, Art. 23 ZPO);
              das konkrete Gericht richtet sich nach kantonalem Recht (Art. 4 ZPO).
            </p>
          )}
          {r.eingabeArt === 'klage_direkt' && f.instanz === 'einleitung' && (
            <p className="lc-notice text-body-s">
              Die Klage geht direkt an das erstinstanzliche Gericht{kantonDaten?.erstinstanzName ? ` (${f.kanton}: ${kantonDaten.erstinstanzName})` : ''} —
              eine Klage-Vorlage ist in Vorbereitung.
            </p>
          )}
          {recherche && (
            <div className="lc-card p-4 space-y-3">
              <p className="lc-overline">Zuständige Schlichtungsstelle ({f.kanton})</p>
              {recherche.glgFallback && (
                <p className="text-xs text-ink-500">Keine eigene paritätische Stelle hinterlegt — angezeigt wird die ordentliche Schlichtungsbehörde; die paritätische Besetzung (Art. 200 ZPO) stellt der Kanton sicher.</p>
              )}
              {recherche.aufloesung.modus === 'zentral' && (
                <div>
                  <p className="text-body-s text-ink-900 whitespace-pre-line">
                    {/* Direktlink (Auftrag David 6.6.2026): Stellen-Name verlinkt
                        auf die amtliche Detailseite, sofern in den Dossiers belegt. */}
                    {recherche.aufloesung.stelle.url ? (
                      <a href={recherche.aufloesung.stelle.url} target="_blank" rel="noopener noreferrer"
                        className="font-medium text-brass-700 underline" title="Amtliche Behördenseite öffnen">
                        {recherche.aufloesung.stelle.name} ↗
                      </a>
                    ) : recherche.aufloesung.stelle.name}
                    {'\n'}{recherche.aufloesung.stelle.strasse}{'\n'}{recherche.aufloesung.stelle.plzOrt}
                  </p>
                  {recherche.aufloesung.stelle.hinweis && (
                    <p className="text-xs text-warn-700 mt-1">⚠ {recherche.aufloesung.stelle.hinweis}</p>
                  )}
                </div>
              )}
              {recherche.aufloesung.modus === 'liste' && (
                <div className="space-y-2">
                  {recherche.aufloesung.hinweis && <p className="text-xs text-ink-500">{recherche.aufloesung.hinweis} — massgeblich: {ORT_LABEL[f.streitsache]}.</p>}
                  <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {recherche.aufloesung.stellen.map((s) => (
                      <li key={s.name + s.plzOrt} className="text-body-s text-ink-800">
                        {s.url ? (
                          <a href={s.url} target="_blank" rel="noopener noreferrer"
                            className="font-medium text-brass-700 underline" title="Amtliche Behördenseite öffnen">{s.name} ↗</a>
                        ) : (
                          <span className="font-medium text-ink-900">{s.name}</span>
                        )}
                        {s.zustaendigFuer && <span className="text-ink-500"> — {s.zustaendigFuer}</span>}
                        <br />{s.strasse}, {s.plzOrt}
                        {s.hinweis && <span className="block text-xs text-warn-700">⚠ {s.hinweis}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recherche.aufloesung.modus === 'verzeichnis' && (() => {
                const amtAufloesbar = f.kanton !== '' && AMT_KANTONE.includes(f.kanton) && r.schlichtung.behoerdeTyp === 'ordentlich';
                return <>
                  {/* PLZ→Gemeinde→Amt-Auflösung (ZH/AG/SG/TG/FR/ZG/AI, ordentliche Behörde) */}
                  {amtAufloesbar && amt && (
                    <div>
                      <p className="text-body-s text-ink-900 whitespace-pre-line">
                        {amt.name}{'\n'}{amt.strasse}{'\n'}{amt.plzOrt}
                      </p>
                      <p className="text-xs text-ink-500 mt-1">aufgelöst über {f.plz ? `PLZ ${f.plz} → ` : ''}Gemeinde {f.gemeinde.trim()} (amtl. Ortschaftenverzeichnis + amtliches Ämterverzeichnis).</p>
                    </div>
                  )}
                  {amtAufloesbar && zhKreise && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-ink-500">Stadt Zürich: massgeblich ist der STADTKREIS der beklagten Partei — sechs Kreis-Ämter:</p>
                      <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {zhKreise.map((a) => (
                          <li key={a.kreise} className="text-body-s text-ink-800">
                            <span className="font-medium text-ink-900">{a.name}</span> — {a.kreise}<br />{a.strasse}, {a.plzOrt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!(amtAufloesbar && (amt || zhKreise)) && (
                    <p className="text-body-s text-ink-800">
                      {recherche.aufloesung.beschreibung}.{' '}
                      {amtAufloesbar && (
                        <span className="text-ink-500">PLZ oder Gemeinde eingeben für die konkrete Amts-Adresse. </span>
                      )}
                      <a href={recherche.aufloesung.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">
                        Amtliches Verzeichnis öffnen ↗
                      </a>
                    </p>
                  )}
                </>;
              })()}
              <p className="text-xs text-ink-500 pt-2 border-t border-line">
                Quelle: {recherche.quelle} (Stand {recherche.stand}). Recherche zweifach geprüft — fachliche Abnahme ausstehend; Adresse vor Einreichung kurz gegenprüfen.
              </p>
            </div>
          )}
          {kantonOffen && (
            <p className="lc-notice text-body-s">
              Kanton {f.kanton}: Die konkreten Stellen sind noch nicht hinterlegt — die bundesrechtliche
              Einordnung oben gilt; Behörde und Adresse bitte über das kantonale Justizportal ermitteln.
            </p>
          )}
          {kantonDaten && r.schlichtung.obligatorisch && f.instanz === 'einleitung' && !stelle && !kantonOffen && (
            <p className="lc-notice text-body-s">
              Für diese Behörden-Art ist im Kanton {f.kanton} noch keine Adresse hinterlegt.
            </p>
          )}

          {/* Praxis-Fahrplan (Umbau «maximal praxistauglich», 5.6.2026) */}
          {fahrplan && f.instanz === 'einleitung' && (
            <div className="lc-card p-5 space-y-3">
              <p className="lc-overline">Ihr Fahrplan</p>
              <ol className="space-y-2.5">
                {fahrplan.map((s, i) => (
                  <li key={s.titel} className="flex gap-3">
                    <span aria-hidden className="shrink-0 w-6 h-6 rounded-full bg-brass-100 text-brass-700 inline-flex items-center justify-center text-xs font-semibold num">{i + 1}</span>
                    <span>
                      <span className="block text-body-s font-medium text-ink-900">{s.titel}</span>
                      <span className="block text-body-s text-ink-600">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Kosten (kantonale Rahmen, zweifach geprüfte Erlass-Daten) */}
          {f.instanz === 'einleitung' && (r.schlichtung.obligatorisch || r.eingabeArt === 'klage_direkt') && (
            <div className="lc-card p-5 space-y-2.5">
              <p className="lc-overline">Voraussichtliche Kosten{f.kanton ? ` (${f.kanton})` : ''}</p>
              {r.schlichtung.obligatorisch && (
                r.schlichtung.kostenlos ? (
                  <p className="text-body-s text-ink-800">
                    <span className="font-medium text-ink-900">Schlichtungsverfahren: kostenlos.</span>{' '}
                    {r.schlichtung.kostenlosGrund}. Keine Parteientschädigung im Schlichtungsverfahren (Art. 113 Abs. 1 ZPO).
                  </p>
                ) : kosten ? (
                  <p className="text-body-s text-ink-800">
                    <span className="font-medium text-ink-900">Schlichtungsgebühr: CHF {kosten.schlichtung.text}.</span>{' '}
                    <span className="text-ink-500">(
                      {f.kanton !== '' ? (
                        <a href={ERLASS_LINKS[f.kanton].schlichtung} target="_blank" rel="noreferrer" className="underline hover:text-brass-700">{kosten.schlichtung.erlass} ↗</a>
                      ) : kosten.schlichtung.erlass})</span>
                    {kosten.schlichtung.hinweis && <span className="block text-xs text-warn-700">⚠ {kosten.schlichtung.hinweis}</span>}
                  </p>
                ) : (
                  <p className="text-body-s text-ink-600">Schlichtungsgebühr: kantonaler Rahmen — Kanton wählen.</p>
                )
              )}
              {/* Nicht vermögensrechtlich (Auftrag David 6.6.2026): eigener
                  kantonaler Rahmen statt der Streitwert-Staffel; bei Scheidung
                  zusätzlich der Familien-Sonderrahmen, wo der Erlass einen kennt. */}
              {kosten && !f.vermoegensrechtlich && kosten.nichtVermoegensrechtlich ? (
                <p className="text-body-s text-ink-800">
                  <span className="font-medium text-ink-900">Gerichtskosten 1. Instanz (nicht vermögensrechtlich): {/^[A-Za-zÜü(]/.test(kosten.nichtVermoegensrechtlich.text) ? '' : 'CHF '}{kosten.nichtVermoegensrechtlich.text}.</span>{' '}
                  <span className="text-ink-500">(
                    {f.kanton !== '' && ERLASS_LINKS[f.kanton].gericht ? (
                      <a href={ERLASS_LINKS[f.kanton].gericht!} target="_blank" rel="noreferrer" className="underline hover:text-brass-700">{kosten.nichtVermoegensrechtlich.erlass} ↗</a>
                    ) : kosten.nichtVermoegensrechtlich.erlass})</span>
                  {kosten.nichtVermoegensrechtlich.hinweis && <span className="block text-xs text-ink-500">{kosten.nichtVermoegensrechtlich.hinweis}</span>}
                </p>
              ) : kosten && (
                <p className="text-body-s text-ink-800">
                  <span className="font-medium text-ink-900">Gerichtskosten 1. Instanz: {/^[A-Za-zÜü]/.test(kosten.gericht.text) ? '' : 'CHF '}{kosten.gericht.text}.</span>{' '}
                  <span className="text-ink-500">(
                    {f.kanton !== '' && ERLASS_LINKS[f.kanton].gericht ? (
                      <a href={ERLASS_LINKS[f.kanton].gericht!} target="_blank" rel="noreferrer" className="underline hover:text-brass-700">{kosten.gericht.erlass} ↗</a>
                    ) : kosten.gericht.erlass})</span>
                  {kosten.gericht.hinweis && <span className="block text-xs text-ink-500">{kosten.gericht.hinweis}</span>}
                </p>
              )}
              {kosten && f.streitsache === 'scheidung' && kosten.familie && (
                <p className="text-body-s text-ink-800">
                  <span className="font-medium text-ink-900">Familien-/Scheidungsrahmen: {/^[A-Za-zÜü(0-9]/.test(kosten.familie.text) && !/^\d/.test(kosten.familie.text) ? '' : 'CHF '}{kosten.familie.text}.</span>{' '}
                  <span className="text-ink-500">({kosten.familie.erlass})</span>
                  {kosten.familie.hinweis && <span className="block text-xs text-ink-500">{kosten.familie.hinweis}</span>}
                </p>
              )}
              <p className="text-xs text-ink-500">
                Rahmen aus den geltenden kantonalen Erlassen (Stand 5.6.2026) — die konkrete Festsetzung liegt bei der Behörde.
                Hinzu kommen ggf. eigene Anwaltskosten; die unterliegende Partei trägt im Gerichtsverfahren in der Regel die
                Kosten und eine Parteientschädigung (Art. 106 ZPO).
              </p>
            </div>
          )}

          {/* Verfahrens-Eckdaten — bewusst NACH Stelle/Fahrplan/Kosten (Endkonsumenten-Dramaturgie 6.6.2026) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Örtlich (Grundsatz)', val: r.oertlich.gerichtsstand },
              { label: 'Verfahrensart', val: r.verfahrensart === 'vereinfacht' ? 'Vereinfacht' : r.verfahrensart === 'scheidungsverfahren' ? 'Scheidungsverfahren' : 'Ordentlich' },
              { label: 'Einleitende Eingabe', val: eingabeText },
            ].map((c) => (
              <EckdatenKachel key={c.label} label={c.label} wert={c.val} />
            ))}
          </div>

          {r.weichen.length > 0 && (
            <div className="space-y-1.5">
              {r.weichen.map((w, i) => <p key={i} className="lc-notice text-body-s">{w}</p>)}
            </div>
          )}

          <ErgebnisAnzeige titel="Zuständigkeit nach ZPO" ergebnis={ergebnis} />
          <div className="flex flex-wrap items-center gap-3">
            <PdfExportButton config={pdfConfig} />
            <p className="text-body-s text-ink-500">
              Schwellen: vereinfacht ≤ CHF {ZPO_SCHWELLEN.VEREINFACHT.toLocaleString('de-CH')} ·
              Entscheidvorschlag ≤ {ZPO_SCHWELLEN.ENTSCHEIDVORSCHLAG.toLocaleString('de-CH')} ·
              Entscheid ≤ {ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG.toLocaleString('de-CH')} (ZPO-Fassung 1.1.2025).
            </p>
          </div>
        </div>
      )}
      </>}
    </div>
  );
}
