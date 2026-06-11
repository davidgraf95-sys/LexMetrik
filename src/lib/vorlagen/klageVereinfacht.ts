import type { VorlageSchema, Antworten } from './engine';
import { assemble } from './engine';
import { fmtDatum, fmtCHF } from './datum';
import { parteiZeilen, parteiVollstaendig, parteiKurz, SG_PERSON_NATUERLICH, type SgPartei } from './schlichtungsgesuchBs';
import { behoerdeManuellVollstaendig, type BehoerdeManuell } from './behoerden';
import { ZPO_SCHWELLEN } from '../zustaendigkeit';
import { berechneFrist } from '../zpoFristen';
import { KANTONE } from '../kantone';
import type { Kanton } from '../../types/legal';

// ─── Klage im vereinfachten Verfahren (Art. 243 ff. ZPO) · Basel-Stadt ───────
//
// Normverifizierter Auftrag «Klage im vereinfachten Verfahren – BS» (5.6.2026,
// ZPO-Fassung seit 1.1.2025). Zweite BS-Eingabe nach dem Schlichtungsgesuch-
// Pilot; gleiche Engine-Familie (format 'eingabe', feste Bausteine, kein LLM).
//
// Kerninhalt Art. 244 Abs. 1 ZPO: Parteien, Rechtsbegehren, Streitgegenstand,
// (wo nötig) Streitwert, Datum, Unterschrift. Die BEGRÜNDUNG ist freiwillig
// (Art. 244 Abs. 2) — als strukturierter Platzhalter (Behauptungs-Liste +
// Beweismittel), standardmässig deaktiviert mit Verzichts-Baustein.
//
// ABWEICHUNG VOM AUFTRAG (offengelegt, §7): Der Auftrag nahm für Mietsachen
// Kostenlosigkeit nach «Art. 114 lit. d» an. Der am Fedlex-Filestore
// verifizierte Wortlaut von Art. 114 ZPO (5.6.2026) kennt KEINE Miete-
// Position: lit. a GlG · b BehiG · c Arbeit/AVG bis 30'000 · d Mitwirkungs-
// gesetz · e KVG-Zusatz · f Gewalt/Nachstellung 28b/28c ZGB · g DSG.
// Mietsachen sind im ENTSCHEIDverfahren somit nicht gerichtskostenfrei
// (kostenfrei nur die Schlichtung, Art. 113 Abs. 2 lit. c).
//
// Kantonale GOG-BS-Verweise (§§ 32/71/73/74) laut Auftrag «verified true»
// (Geschäftsverteilung 2026); Status bleibt entwurf bis Davids Abnahme.

export type KvMaterie =
  | 'vermoegensrechtlich'    // Art. 243 Abs. 1 (bis CHF 30'000)
  | 'arbeit'                 // Arbeitsverhältnis (≤ 30'000 → Arbeitsgericht, § 73 GOG BS)
  | 'miete_kernbereich'      // Art. 243 Abs. 2 lit. c (Hinterlegung/Missbrauch/Kündigungsschutz/Erstreckung)
  | 'glg'                    // lit. a
  | 'gewaltschutz'           // lit. b (Art. 28b/28c ZGB)
  | 'dsg_auskunft'           // lit. d (Art. 25 DSG)
  | 'mitwirkung'             // lit. e
  | 'kvg_zusatz';            // lit. f

export const KV_MATERIEN: { id: KvMaterie; label: string; hint?: string }[] = [
  { id: 'vermoegensrechtlich', label: 'Vermögensrechtliche Streitigkeit bis CHF 30\'000', hint: 'Art. 243 Abs. 1 ZPO – z. B. Forderung aus Vertrag' },
  { id: 'arbeit', label: 'Arbeitsrechtliche Streitigkeit', hint: 'bis CHF 30\'000 vor dem Arbeitsgericht BS (§ 73 GOG); gerichtskostenfrei (Art. 114 lit. c ZPO)' },
  { id: 'miete_kernbereich', label: 'Miete/Pacht – Kernbereich', hint: 'Hinterlegung, Missbrauchsschutz, Kündigungsschutz, Erstreckung (Art. 243 Abs. 2 lit. c ZPO) – streitwertunabhängig' },
  { id: 'glg', label: 'Gleichstellungsgesetz (GlG)', hint: 'Art. 243 Abs. 2 lit. a ZPO – streitwertunabhängig, gerichtskostenfrei' },
  { id: 'gewaltschutz', label: 'Gewalt, Drohungen, Nachstellungen (Art. 28b/28c ZGB)', hint: 'Art. 243 Abs. 2 lit. b ZPO' },
  { id: 'dsg_auskunft', label: 'Auskunftsrecht nach Art. 25 DSG', hint: 'Art. 243 Abs. 2 lit. d ZPO' },
  { id: 'mitwirkung', label: 'Mitwirkungsgesetz', hint: 'Art. 243 Abs. 2 lit. e ZPO' },
  { id: 'kvg_zusatz', label: 'Zusatzversicherung zur sozialen Krankenversicherung', hint: 'Art. 243 Abs. 2 lit. f ZPO – in BS Sondersituation (Sozialversicherungsgericht)' },
];

// Gerichte BS (Quelle: Auftrag 5.6.2026, «verified true» am Staatskalender BS;
// PLZ-Konvention wie SG-Pilot: 4001 = Postadresse).
export const KV_GERICHTE_BS = {
  // url: amtlich verifiziert 10.6.2026 (WebFetch 200; bs.ch bzw. Staatskalender)
  zivilgericht: { name: 'Zivilgericht Basel-Stadt', strasse: 'Bäumleingasse 5', plzOrt: '4001 Basel', stand: '5.6.2026', quelle: 'Staatskalender BS (Auftrag «verified true»)', url: 'https://www.bs.ch/gerichte-judikative/zivilgericht' },
  arbeitsgericht: { name: 'Arbeitsgericht Basel-Stadt', strasse: 'Bäumleingasse 5', plzOrt: '4001 Basel', stand: '5.6.2026', quelle: 'Staatskalender BS (Auftrag «verified true»)', url: 'https://staatskalender.bs.ch/organization/richterliche-behoerden/gerichte/zivilgericht/arbeitsgericht' },
} as const;

// ── Routing (deterministisch, Auftrag «Routing-Logik der Engine») ───────────

export type KvRouting =
  | { anwendbar: true; gericht: keyof typeof KV_GERICHTE_BS | 'kantonal'; spruchkoerper: string; spruchkoerperNorm: string;
      kostenlos: boolean; kostenlosNorm?: string; abs2Lit?: string }
  | { anwendbar: false; stopp: 'ordentlich' | 'arbeit_ueber_30k' | 'kvg_sozialversicherungsgericht' };

// Kantonsausbau 10.6.2026 (Auftrag David «alle Kantone abbilden»): Die
// ANWENDBARKEIT (Art. 243/114 ZPO) ist Bundesrecht und gilt überall gleich;
// kantonsspezifisch sind nur Gericht und Spruchkörper. Ausserhalb BS liefert
// das Routing gericht:'kantonal' mit neutraler Spruchkörper-Angabe — die
// konkrete Adresse löst die UI über data/zivilgerichteErstinstanz.ts auf
// (zweifach geprüft, Abnahme ausstehend); die BS-Spruchkörper (§ 71 GOG BS)
// bleiben dem abgenommenen BS-Pilot vorbehalten (§1: kein stilles
// Übertragen kantonalen Organisationsrechts auf andere Kantone).
export function kvRouting(materie: KvMaterie, streitwertCHF: number | null, kanton: Kanton = 'BS'): KvRouting {
  const bs = kanton === 'BS';
  const kantonal = {
    gericht: 'kantonal' as const,
    spruchkoerper: 'Erstinstanzliches Zivilgericht',
    spruchkoerperNorm: `Spruchkörper nach kantonalem Gerichtsorganisationsrecht (${kanton})`,
  };
  if (materie === 'arbeit') {
    if (streitwertCHF !== null && streitwertCHF <= ZPO_SCHWELLEN.VEREINFACHT) {
      return bs
        ? { anwendbar: true, gericht: 'arbeitsgericht', spruchkoerper: 'Arbeitsgericht (Dreiergericht)',
            spruchkoerperNorm: '§§ 73 f. GOG BS', kostenlos: true, kostenlosNorm: 'Art. 114 lit. c ZPO' }
        : { anwendbar: true, ...kantonal, kostenlos: true, kostenlosNorm: 'Art. 114 lit. c ZPO' };
    }
    return { anwendbar: false, stopp: 'arbeit_ueber_30k' };
  }
  if (materie === 'glg' || materie === 'mitwirkung') {
    const kosten = { kostenlos: true, kostenlosNorm: materie === 'glg' ? 'Art. 114 lit. a ZPO' : 'Art. 114 lit. d ZPO',
      abs2Lit: materie === 'glg' ? 'a' : 'e' };
    return bs
      ? { anwendbar: true, gericht: 'zivilgericht', spruchkoerper: 'Dreiergericht des Zivilgerichts',
          spruchkoerperNorm: '§ 71 GOG BS (Geschäftsverteilung 2026)', ...kosten }
      : { anwendbar: true, ...kantonal, ...kosten };
  }
  if (materie === 'gewaltschutz' || materie === 'dsg_auskunft' || materie === 'miete_kernbereich') {
    const kosten = {
      // Miete: im Entscheidverfahren NICHT kostenfrei (Art. 114 kennt keine
      // Miete-Position — verifizierter Wortlaut; Abweichung vom Auftrag).
      kostenlos: materie !== 'miete_kernbereich',
      kostenlosNorm: materie === 'gewaltschutz' ? 'Art. 114 lit. f ZPO' : materie === 'dsg_auskunft' ? 'Art. 114 lit. g ZPO' : undefined,
      abs2Lit: materie === 'gewaltschutz' ? 'b' : materie === 'dsg_auskunft' ? 'd' : 'c',
    };
    return bs
      ? { anwendbar: true, gericht: 'zivilgericht', spruchkoerper: 'Einzelgericht des Zivilgerichts',
          spruchkoerperNorm: '§ 71 GOG BS (Geschäftsverteilung 2026)', ...kosten }
      : { anwendbar: true, ...kantonal, ...kosten };
  }
  if (materie === 'kvg_zusatz') return { anwendbar: false, stopp: 'kvg_sozialversicherungsgericht' };
  // vermögensrechtlich (Art. 243 Abs. 1)
  if (streitwertCHF !== null && streitwertCHF <= ZPO_SCHWELLEN.VEREINFACHT) {
    return bs
      ? { anwendbar: true, gericht: 'zivilgericht', spruchkoerper: 'Einzelgericht des Zivilgerichts',
          spruchkoerperNorm: '§ 71 GOG BS (Geschäftsverteilung 2026)', kostenlos: false }
      : { anwendbar: true, ...kantonal, kostenlos: false };
  }
  return { anwendbar: false, stopp: 'ordentlich' };
}

// ── Klagefrist der Klagebewilligung (Art. 209 Abs. 3/4 ZPO) ─────────────────
// 3 Monate bzw. 30 Tage (Miete/Pacht); die Frist gehört zum ENTSCHEIDverfahren
// → Gerichtsferien gelten (Art. 145 Abs. 1 ZPO; BGE 138 III 615 E. 2.4).
// Berechnung über die BESTEHENDE ZPO-Fristen-Engine (§4/§5: geteilte, getestete
// Arithmetik mit Stillstand; Verfahrenstyp 'klagefrist_klagebewilligung').

export function kvKlagefrist(kbDatumISO: string, materie: KvMaterie, kanton: Kanton = 'BS'): {
  ablauf: string; ablaufISO: string; stillstandAktiv: boolean; fristLabel: string;
} | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(kbDatumISO)) return null;
  // Kalender-Gültigkeit zusätzlich zur Syntax (Bug-Check 5.6.2026: «2025-02-30»
  // passierte den Regex und warf in der Fristen-Engine) — Roundtrip-Probe hält
  // den |null-Vertrag auch bei unsauberer Aufrufquelle (Defense-in-Depth).
  const probe = new Date(`${kbDatumISO}T00:00:00Z`);
  if (Number.isNaN(probe.getTime()) || probe.toISOString().slice(0, 10) !== kbDatumISO) return null;
  const miete = materie === 'miete_kernbereich';
  const r = berechneFrist({
    ereignis: kbDatumISO,
    einheit: miete ? 'tage' : 'monate',
    laenge: miete ? 30 : 3,
    verfahren: 'klagefrist_klagebewilligung',
    // Kantonsausbau 10.6.2026: Feiertage am GERICHTSORT (Art. 142 Abs. 3 ZPO).
    kanton,
    fristnatur: 'gesetzlich',
  });
  return {
    ablauf: r.diesAdQuem, ablaufISO: r.diesAdQuemISO, stillstandAktiv: r.stillstandAktiv,
    fristLabel: miete ? '30 Tage (Art. 209 Abs. 4 ZPO)' : '3 Monate (Art. 209 Abs. 3 ZPO)',
  };
}

// ── Antworten ───────────────────────────────────────────────────────────────

export type KvAusnahme = '' | 'verzicht_gemeinsam' | 'verzicht_einseitig' | 'art198';

export type KvAnswers = {
  materie: KvMaterie | '';
  streitwert: string;             // BetragsFeld-Rohwert; leer = nicht beziffert
  // Kantonsausbau 10.6.2026 (Auftrag David): Gericht je Kanton.
  gerichtsKanton: Kanton;
  /** Ausserhalb BS: aufgelöste Gerichtsadresse (data/zivilgerichteErstinstanz) */
  gerichtAufgeloest?: { zeilen: string[]; url?: string };
  gerichtManuellAktiv?: boolean;
  gerichtManuell?: BehoerdeManuell;
  // Parteien (je eine; Mehrparteien später)
  klaeger: SgPartei;
  beklagte: SgPartei;
  vertretung?: string;            // Name/Kanzlei der Vertretung der klagenden Partei
  // Rechtsbegehren
  begehrenTyp: 'beziffert' | 'unbeziffert';
  zins?: { satz: string; abDatum: string };
  unbeziffertMindest?: string;    // Art. 85 ZPO
  unbeziffertGrund?: string;
  rechtsoeffnung: boolean;        // Beseitigung Rechtsvorschlag (i.V.m. SchKG)
  betreibungNr?: string;
  weitereRechtsbegehren: string[];
  // Streitgegenstand (Pflicht, Art. 244 Abs. 1 lit. c)
  streitgegenstand: string;
  // Begründung (freiwillig, Art. 244 Abs. 2) — strukturierter Platzhalter
  begruendungAktiv: boolean;
  sachverhalt: { text: string }[];          // Tatsachenbehauptungen, je Ziffer
  beweismittel: { bezeichnung: string; fuer?: string }[];
  /** Auftrag David 11.6.2026: bei aktiver Begründung wahlweise PLATZHALTER
   *  im Dokument («später ausfüllen») statt der Masken-Eingaben; alte
   *  Speicherstände ohne Feld = false (Maske). */
  begruendungPlatzhalter?: boolean;
  // Klagebewilligung / Ausnahme (Art. 209 bzw. 198/199 ZPO)
  klagebewilligungVorhanden: boolean;
  klagebewilligungDatum: string;  // ISO (Eröffnung/Zustellung)
  ausnahme: KvAusnahme;
  ausnahmeText?: string;          // z. B. konkreter Art.-198-Tatbestand
  // Beilagen
  vollmachtBeilage: boolean;
  weitereBeilagen: { bezeichnung: string }[];
  ort: string;
  datum: string;                  // ISO
};

// ── Prefill-Brücke (FAHRPLAN-PRAXIS 2.1b): Zuständigkeits-Wizard → Klage ────
// Muster sgPrefill (§5: Kodieren/Lesen am selben Ort); nur validierte Werte.

export function kvPrefillKodieren(p: { materie: KvMaterie; streitwertCHF?: number | null; kanton?: Kanton }): string {
  const q = new URLSearchParams();
  q.set('materie', p.materie);
  if (p.streitwertCHF != null && Number.isFinite(p.streitwertCHF) && p.streitwertCHF >= 0) {
    q.set('streitwert', String(p.streitwertCHF));
  }
  if (p.kanton) q.set('kanton', p.kanton);
  return q.toString();
}

export function kvPrefillLesen(search: string): Partial<KvAnswers> | null {
  const q = new URLSearchParams(search);
  const materie = q.get('materie') as KvMaterie | null;
  if (!materie || !KV_MATERIEN.some((m) => m.id === materie)) return null;
  const aus: Partial<KvAnswers> = { materie };
  const sw = q.get('streitwert');
  if (sw && /^\d+(\.\d{1,2})?$/.test(sw)) aus.streitwert = sw;
  const kt = q.get('kanton');
  if (kt && (KANTONE as readonly string[]).includes(kt)) aus.gerichtsKanton = kt as Kanton;
  return aus;
}

export const KV_DEFAULTS: KvAnswers = {
  materie: '',
  streitwert: '',
  gerichtsKanton: 'BS',
  klaeger: { ...SG_PERSON_NATUERLICH },
  beklagte: { ...SG_PERSON_NATUERLICH },
  begehrenTyp: 'beziffert',
  rechtsoeffnung: false,
  weitereRechtsbegehren: [],
  streitgegenstand: '',
  begruendungAktiv: false,
  sachverhalt: [],
  beweismittel: [],
  klagebewilligungVorhanden: true,
  klagebewilligungDatum: '',
  ausnahme: '',
  vollmachtBeilage: false,
  weitereBeilagen: [],
  ort: 'Basel',
  datum: '',
};

export function kvStreitwert(a: KvAnswers): number | null {
  const roh = a.begehrenTyp === 'unbeziffert' ? a.unbeziffertMindest : a.streitwert;
  if (roh == null || roh === '') return null;
  const n = Number(String(roh).replace(/['\s]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

// ── Mängel/Gates (deterministisch; Download-Gate analog SG) ─────────────────

export type KvMangel = { schritt: number; text: string };

export function kvMaengel(a: KvAnswers): KvMangel[] {
  const m: KvMangel[] = [];
  const sw = kvStreitwert(a);
  const routing = a.materie ? kvRouting(a.materie, sw, a.gerichtsKanton) : null;

  if (!a.materie) m.push({ schritt: 0, text: 'Materie wählen (bestimmt Verfahren, Spruchkörper und Kosten).' });
  if (routing && !routing.anwendbar) {
    if (routing.stopp === 'ordentlich') m.push({ schritt: 0, text: `Streitwert über CHF ${fmtCHF(String(ZPO_SCHWELLEN.VEREINFACHT))} ohne Materie nach Art. 243 Abs. 2 ZPO → ordentliches Verfahren (Art. 219 ff. ZPO); diese Vorlage ist nicht anwendbar.` });
    if (routing.stopp === 'arbeit_ueber_30k') m.push({
      schritt: 0,
      text: a.gerichtsKanton === 'BS'
        ? `Arbeitsrechtliche Streitigkeit über CHF ${fmtCHF(String(ZPO_SCHWELLEN.VEREINFACHT))}: ordentliches Verfahren vor dem Zivilgericht; das Arbeitsgericht ist nur mit Vereinbarung beider Parteien zuständig (§ 73 Abs. 2 GOG BS).`
        : `Arbeitsrechtliche Streitigkeit über CHF ${fmtCHF(String(ZPO_SCHWELLEN.VEREINFACHT))}: ordentliches Verfahren (Art. 219 ff. ZPO); diese Vorlage ist nicht anwendbar.`,
    });
    // § 82 GOG BS: Sozialversicherungsgericht als einzige kantonale Instanz
    // inkl. Zusatzversicherungen (Art. 7 ZPO) — GOG-Recherche 5.6.2026; die
    // Auftrags-Angabe «§ 50 GOG» war falsch (§ 50 = Verwaltungschef).
    // Kantonsausbau 10.6.2026: Art. 7 ZPO gilt bundesweit (einzige kantonale
    // Instanz möglich) — ausserhalb BS kantonsneutral formuliert.
    if (routing.stopp === 'kvg_sozialversicherungsgericht') m.push({
      schritt: 0,
      text: a.gerichtsKanton === 'BS'
        ? 'Zusatzversicherungen zur sozialen Krankenversicherung: In Basel-Stadt entscheidet das Sozialversicherungsgericht als einzige kantonale Instanz (§ 82 GOG BS; Art. 7 ZPO) — diese Vorlage deckt den Weg nicht ab.'
        : `Zusatzversicherungen zur sozialen Krankenversicherung: Die Kantone können ein Gericht als einzige kantonale Instanz bezeichnen (Art. 7 ZPO — im Kanton ${a.gerichtsKanton} regelmässig das Versicherungs-/Sozialversicherungsgericht); diese Vorlage deckt den Weg nicht ab. Hat der Kanton keine einzige Instanz bezeichnet, gilt das vereinfachte Verfahren vor dem ordentlichen Gericht — auch diesen Weg deckt die Vorlage bewusst nicht ab.`,
    });
  }
  // Kantonsausbau 10.6.2026: ausserhalb BS muss das Gericht bestimmt sein
  // (aufgelöst über die Recherche-Schicht oder von Hand) — Export-Gate wie
  // beim Schlichtungsgesuch.
  if (a.gerichtsKanton !== 'BS'
      && !(a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell))
      && (a.gerichtAufgeloest?.zeilen.length ?? 0) < 3) {
    m.push({ schritt: 0, text: `Zuständiges Gericht für den Kanton ${a.gerichtsKanton} bestimmen (Gericht wählen) — oder die Adresse von Hand erfassen.` });
  }
  if (a.gerichtManuellAktiv && !behoerdeManuellVollstaendig(a.gerichtManuell)) {
    m.push({ schritt: 0, text: 'Gerichtsadresse von Hand: Name, Strasse mit Hausnummer und PLZ/Ort vollständig erfassen.' });
  }
  if (a.materie === 'vermoegensrechtlich' && sw === null) {
    m.push({ schritt: 0, text: 'Streitwert angeben (Art. 244 Abs. 1 lit. d ZPO; Berechnung nach Art. 91 ZPO – ohne Zinsen und Kosten).' });
  }
  if (!parteiVollstaendig(a.klaeger)) m.push({ schritt: 1, text: 'Klagende Partei vollständig bezeichnen (Art. 244 Abs. 1 lit. a ZPO).' });
  if (!parteiVollstaendig(a.beklagte)) m.push({ schritt: 1, text: 'Beklagte Partei vollständig bezeichnen (Art. 244 Abs. 1 lit. a ZPO).' });
  if (a.begehrenTyp === 'beziffert' && (a.streitwert ?? '') === '' ) {
    m.push({ schritt: 2, text: 'Forderungsbetrag beziffern (Art. 84 Abs. 2 ZPO) — oder auf «unbeziffert» (Art. 85 ZPO) wechseln.' });
  }
  if (a.begehrenTyp === 'unbeziffert' && !(a.unbeziffertMindest ?? '').trim()) {
    m.push({ schritt: 2, text: 'Unbezifferte Forderungsklage: Mindestwert angeben (Art. 85 Abs. 1 ZPO).' });
  }
  if (!a.streitgegenstand.trim()) m.push({ schritt: 2, text: 'Streitgegenstand in wenigen Sätzen/Stichworten bezeichnen (Art. 244 Abs. 1 lit. c ZPO).' });
  if (!a.klagebewilligungVorhanden && !a.ausnahme) {
    m.push({ schritt: 4, text: 'Klagebewilligung beilegen (Prozessvoraussetzung) ODER Ausnahme/Verzicht nach Art. 198/199 ZPO angeben.' });
  }
  if (a.klagebewilligungVorhanden && !a.klagebewilligungDatum) {
    m.push({ schritt: 4, text: 'Datum der Klagebewilligung angeben (für die Klagefrist nach Art. 209 Abs. 3/4 ZPO).' });
  }
  if (!a.datum) m.push({ schritt: 5, text: 'Datum angeben (Art. 244 Abs. 1 lit. e ZPO).' });
  return m;
}

export function kvHinweise(a: KvAnswers): string[] {
  const h: string[] = [];
  const sw = kvStreitwert(a);
  const routing = a.materie ? kvRouting(a.materie, sw, a.gerichtsKanton) : null;
  if (routing?.anwendbar && routing.kostenlos && routing.kostenlosNorm) {
    h.push(`Gerichtskostenfrei (${routing.kostenlosNorm}); die Parteientschädigung an die Gegenpartei bleibt bei Unterliegen geschuldet.`);
  }
  if (a.materie === 'miete_kernbereich') {
    h.push('Mietsachen: Das ENTSCHEIDverfahren ist – anders als die Schlichtung (Art. 113 Abs. 2 lit. c ZPO) – nicht gerichtskostenfrei; Art. 114 ZPO kennt keine Miete-Position (am Wortlaut verifiziert, abweichend von verbreiteten Darstellungen).');
    h.push('Klagefrist der Klagebewilligung: 30 Tage (Art. 209 Abs. 4 ZPO).');
  }
  if (a.klagebewilligungVorhanden && a.klagebewilligungDatum && a.materie) {
    const f = kvKlagefrist(a.klagebewilligungDatum, a.materie);
    if (f) h.push(`Klagefrist: ${f.fristLabel}, läuft am ${f.ablauf} ab (Gerichtsferien nach Art. 145 Abs. 1 ZPO ${f.stillstandAktiv ? 'berücksichtigt' : 'im Zeitraum ohne Wirkung'}; BGE 138 III 615). Bei Arrestprosequierung gilt die kürzere 10-Tage-Frist (Art. 279 SchKG) — zu prüfen.`);
  }
  if (!a.begruendungAktiv) {
    h.push('Ohne schriftliche Begründung stellt das Gericht die Klage der Gegenpartei zu und lädt direkt zur Verhandlung vor (Art. 245 Abs. 1 ZPO); die Begründung kann mündlich erfolgen.');
  }
  if (a.begruendungAktiv && a.begruendungPlatzhalter) {
    h.push('Begründung als Platzhalter: die Leer-Ziffern (Tatsachendarstellung und Beweismittel) vor der Einreichung von Hand ausfüllen — oder die Eingaben in der Maske erfassen.');
  }
  if (a.begruendungAktiv) {
    // Wortlaut am Fedlex-Cache 20250101 verifiziert (11.6.2026).
    h.push('Mit schriftlicher Begründung setzt das Gericht der beklagten Partei zunächst eine Frist zur schriftlichen Stellungnahme (Art. 245 Abs. 2 ZPO) — statt direkter Vorladung zur Verhandlung.');
  }
  if (routing?.anwendbar) {
    h.push(`Sachlich zuständig: ${routing.spruchkoerper} (${routing.spruchkoerperNorm}). Berufung ans Appellationsgericht ab Streitwert CHF 10'000 (Art. 308 Abs. 2 ZPO).`);
  }
  return h;
}

// ── Schema ──────────────────────────────────────────────────────────────────

export const KV_SCHEMA: VorlageSchema = {
  id: 'klage-vereinfacht-bs',
  format: 'eingabe',
  version: '1.0.0 (ZPO-Fassung seit 1.1.2025; GOG BS gem. Auftrag 5.6.2026)',
  titel: 'Klage im vereinfachten Verfahren',
  ausgabeArt: 'fertig',
  disclaimer:
    'Erstellt mit LexMetrik – keine Rechtsberatung. Klage im vereinfachten Verfahren nach ' +
    'Art. 243 ff. ZPO; einzureichen unterschrieben im Doppel (ein Exemplar je Gegenpartei, ' +
    'Art. 131 ZPO), mit Klagebewilligung bzw. Ausnahme-Nachweis als Beilage. Fristen (Art. 209 ' +
    'Abs. 3/4 ZPO) eigenverantwortlich wahren.',
  bausteine: [
    { id: 'K01_absender', rolle: 'absender', text: '{{klaegerBlock}}{{vertretungZeile}}',
      begruendung: 'Absenderin = klagende Partei (bzw. Vertretung).', norm: 'Art. 244 Abs. 1 lit. a ZPO' },
    { id: 'K02_adressat', rolle: 'adressat', text: '{{gerichtBlock}}',
      begruendung: 'Zuständiges Gericht aus dem deterministischen Routing (BS: GOG-Spruchkörper; übrige Kantone: kantonale Gerichtsschicht).', norm: 'Art. 4 ZPO i.V.m. GOG BS' },
    { id: 'K03_datum', rolle: 'datumzeile', text: '{{ortDatumZeile}}',
      begruendung: 'Ort und Datum der Eingabe.', norm: 'Art. 244 Abs. 1 lit. e ZPO' },
    { id: 'K04_betreff', rolle: 'betreff', text: 'Klage im vereinfachten Verfahren (Art. 243 ff. ZPO){{streitwertBetreffZeile}}',
      begruendung: 'Betreff mit Verfahrensart; Streitwert, wo nötig.', norm: 'Art. 244 Abs. 1 lit. d ZPO' },
    { id: 'K05_rubrum', rolle: 'rubrum',
      text: 'in Sachen\n{{klaegerRubrum}}\n(klagende Partei)\n\ngegen\n\n{{beklagteRubrum}}\n(beklagte Partei)\n\nbetreffend {{streitgegenstandKurz}}',
      begruendung: 'Rubrum mit Parteien und Streitgegenstand.', norm: 'Art. 244 Abs. 1 lit. a–c ZPO' },
    { id: 'K06_begehren', ueberschrift: 'Rechtsbegehren', text: '{{item.text}}',
      wiederholeUeber: 'rechtsbegehrenListe', nummeriert: true,
      begruendung: 'Bezifferte (Art. 84 Abs. 2) bzw. unbezifferte (Art. 85) Begehren; Kostenfolge.', norm: 'Art. 244 Abs. 1 lit. b ZPO' },
    { id: 'K07_formelles', ueberschrift: 'Formelles', text: '{{formellesText}}',
      begruendung: 'Zuständigkeit, Verfahrensart, Klagebewilligung/Ausnahme, ggf. Kostenfreiheit.', norm: 'Art. 243/209 ZPO; GOG BS' },
    { id: 'K08_begruendung_intro', ueberschrift: 'Begründung',
      text: 'Zur Begründung wird Folgendes ausgeführt (Art. 244 Abs. 2 ZPO):',
      includeIf: { feld: 'sachverhaltListe', nichtLeer: true },
      begruendung: 'Freiwillige Begründung als strukturierte Tatsachenbehauptungen.', norm: 'Art. 244 Abs. 2 ZPO' },
    { id: 'K08b_sachverhalt', text: '– {{item.text}}',
      includeIf: { feld: 'sachverhaltListe', nichtLeer: true }, wiederholeUeber: 'sachverhaltListe',
      begruendung: 'Je Behauptung eine Zeile (Tatsachendarstellung).', norm: 'Art. 244 Abs. 2 ZPO' },
    { id: 'K08c_beweise', ueberschrift: 'Beweismittel', text: '– {{item.bezeichnung}}{{item.fuerZeile}}',
      includeIf: { feld: 'beweismittelListe', nichtLeer: true }, wiederholeUeber: 'beweismittelListe',
      begruendung: 'Beweismittel-Verzeichnis (Urkunden, Zeugen, Parteibefragung).', norm: 'Art. 244 Abs. 3 lit. c ZPO' },
    { id: 'K09_keine_begruendung',
      text: 'Auf eine schriftliche Begründung wird verzichtet; sie erfolgt mündlich an der Hauptverhandlung (Art. 244 Abs. 2, Art. 245 Abs. 1 ZPO).',
      includeIf: { feld: 'ohneBegruendung', eq: true },
      begruendung: 'Verzichts-Baustein: Begründung ist im vereinfachten Verfahren freiwillig.', norm: 'Art. 244 Abs. 2 ZPO' },
    { id: 'K10_beilagen', ueberschrift: 'Beilagen', text: '– {{item.text}}',
      includeIf: { feld: 'beilagenListe', nichtLeer: true }, wiederholeUeber: 'beilagenListe',
      begruendung: 'Beilagenverzeichnis: Klagebewilligung bzw. Ausnahme-Nachweis, Vollmacht, Beweisurkunden.', norm: 'Art. 244 Abs. 3 ZPO' },
    { id: 'K11_gruss', rolle: 'schlussformel', text: 'Mit freundlichen Grüssen',
      begruendung: 'Schlussformel der Eingabe.' },
    { id: 'K12_unterschrift', rolle: 'unterschrift',
      text: '_________________________________\n{{unterschriftName}}',
      begruendung: 'Eigenhändige Unterschrift (Gültigkeitserfordernis).', norm: 'Art. 244 Abs. 1 lit. e ZPO' },
    { id: 'K13_doppel',
      text: 'Einreichung im Doppel: ein Exemplar für das Gericht und je ein Exemplar für jede beklagte Partei (Art. 131 ZPO).',
      begruendung: 'Exemplare-Hinweis nach Art. 131 ZPO.', norm: 'Art. 131 ZPO' },
  ],
};

// ── Zusammenstellen ─────────────────────────────────────────────────────────

export function kvZusammenstellen(a: KvAnswers) {
  const sw = kvStreitwert(a);
  const routing = a.materie ? kvRouting(a.materie, sw, a.gerichtsKanton) : null;
  // Adressat-Kaskade (Kantonsausbau 10.6.2026, Muster Schlichtungsgesuch §5):
  // Handeingabe → BS-Stammdaten (abgenommen) → kantonal aufgelöste Adresse
  // (zweifach geprüfte Recherche-Schicht) → Striche (Mängel-Gate hält Export).
  const bsGericht = routing?.anwendbar && routing.gericht !== 'kantonal'
    ? KV_GERICHTE_BS[routing.gericht] : KV_GERICHTE_BS.zivilgericht;
  const gerichtBlock = a.gerichtManuellAktiv && behoerdeManuellVollstaendig(a.gerichtManuell)
    ? [a.gerichtManuell!.name, a.gerichtManuell!.strasse, a.gerichtManuell!.plzOrt].join('\n')
    : a.gerichtsKanton === 'BS'
      ? [bsGericht.name, bsGericht.strasse, bsGericht.plzOrt].join('\n')
      : (a.gerichtAufgeloest?.zeilen.length ?? 0) >= 3
        ? a.gerichtAufgeloest!.zeilen.join('\n')
        : '________\n________\n________';

  // Rechtsbegehren-Liste deterministisch aufbauen
  const begehren: { text: string }[] = [];
  if (a.begehrenTyp === 'beziffert') {
    const zins = a.zins?.satz?.trim() && a.zins?.abDatum
      ? `, nebst Zins zu ${a.zins.satz} % seit ${fmtDatum(a.zins.abDatum)}` : '';
    begehren.push({ text: `Die beklagte Partei sei zu verpflichten, der klagenden Partei CHF ${a.streitwert ? fmtCHF(a.streitwert) : '________'}${zins} zu bezahlen.` });
  } else {
    begehren.push({ text: `Die beklagte Partei sei zu verpflichten, der klagenden Partei einen nach dem Beweisergebnis zu beziffernden Betrag, mindestens jedoch CHF ${a.unbeziffertMindest ? fmtCHF(a.unbeziffertMindest) : '________'}, zu bezahlen (Art. 85 ZPO${a.unbeziffertGrund?.trim() ? `; ${a.unbeziffertGrund.trim()}` : ''}).` });
  }
  if (a.rechtsoeffnung) {
    begehren.push({ text: `Der Rechtsvorschlag in der Betreibung${a.betreibungNr?.trim() ? ` Nr. ${a.betreibungNr.trim()}` : ' ________'} sei zu beseitigen.` });
  }
  for (const w of a.weitereRechtsbegehren) if (w.trim()) begehren.push({ text: w.trim() });
  begehren.push({ text: 'Unter Kosten- und Entschädigungsfolge zulasten der beklagten Partei.' });

  // Formelles
  const formellesTeile: string[] = [];
  if (routing?.anwendbar) {
    formellesTeile.push(routing.gericht === 'kantonal'
      ? `Sachlich zuständig ist das erstinstanzliche Zivilgericht (Spruchkörper nach kantonalem Gerichtsorganisationsrecht, Kanton ${a.gerichtsKanton}); es gilt das vereinfachte Verfahren (${routing.abs2Lit ? `Art. 243 Abs. 2 lit. ${routing.abs2Lit} ZPO, streitwertunabhängig` : 'Art. 243 Abs. 1 ZPO'}).`
      : `Sachlich zuständig ist das ${routing.spruchkoerper} (${routing.spruchkoerperNorm}); es gilt das vereinfachte Verfahren (${routing.abs2Lit ? `Art. 243 Abs. 2 lit. ${routing.abs2Lit} ZPO, streitwertunabhängig` : 'Art. 243 Abs. 1 ZPO'}).`);
    if (routing.kostenlos && routing.kostenlosNorm) formellesTeile.push(`Es werden keine Gerichtskosten gesprochen (${routing.kostenlosNorm}).`);
  }
  if (a.klagebewilligungVorhanden) {
    formellesTeile.push(`Die Klagebewilligung der Schlichtungsbehörde vom ${a.klagebewilligungDatum ? fmtDatum(a.klagebewilligungDatum) : '________'} liegt als Beilage 1 bei (Art. 209 ZPO).`);
  } else if (a.ausnahme) {
    const txt = a.ausnahme === 'verzicht_gemeinsam'
      ? `Die Parteien haben gemeinsam auf das Schlichtungsverfahren verzichtet (Art. 199 Abs. 1 ZPO; Streitwert mindestens CHF ${fmtCHF(String(ZPO_SCHWELLEN.VERZICHT_GEMEINSAM))}); die Verzichtserklärung liegt als Beilage 1 bei.`
      : a.ausnahme === 'verzicht_einseitig'
        ? 'Die klagende Partei verzichtet einseitig auf das Schlichtungsverfahren (Art. 199 Abs. 2 ZPO).'
        : `Das Schlichtungsverfahren entfällt (Art. 198 ZPO${a.ausnahmeText?.trim() ? `: ${a.ausnahmeText.trim()}` : ''}).`;
    formellesTeile.push(txt);
  }

  // Beilagen
  const beilagen: { text: string }[] = [];
  if (a.klagebewilligungVorhanden) beilagen.push({ text: `Beilage 1: Klagebewilligung vom ${a.klagebewilligungDatum ? fmtDatum(a.klagebewilligungDatum) : '________'}` });
  else if (a.ausnahme === 'verzicht_gemeinsam') beilagen.push({ text: 'Beilage 1: Verzichtserklärung (Art. 199 Abs. 1 ZPO)' });
  if (a.vollmachtBeilage) beilagen.push({ text: `Beilage ${beilagen.length + 1}: Vollmacht` });
  for (const b of a.beweismittel) {
    if (b.bezeichnung.trim()) beilagen.push({ text: `Beilage ${beilagen.length + 1}: ${b.bezeichnung.trim()}` });
  }
  for (const b of a.weitereBeilagen) {
    if (b.bezeichnung.trim()) beilagen.push({ text: `Beilage ${beilagen.length + 1}: ${b.bezeichnung.trim()}` });
  }

  const antworten: Antworten = {
    ...a,
    klaegerBlock: parteiZeilen(a.klaeger).join('\n'),
    vertretungZeile: a.vertretung?.trim() ? `\nvertreten durch ${a.vertretung.trim()}` : '',
    gerichtBlock,
    ortDatumZeile: `${a.ort.trim() ? a.ort.trim() + ', ' : ''}${a.datum ? fmtDatum(a.datum) : '________'}`,
    streitwertBetreffZeile: sw !== null ? `\nStreitwert: CHF ${fmtCHF(String(sw))} (Art. 91 ZPO)` : '',
    klaegerRubrum: parteiZeilen(a.klaeger).join(', '),
    beklagteRubrum: parteiZeilen(a.beklagte).join(', '),
    streitgegenstandKurz: a.streitgegenstand.trim() || '________',
    rechtsbegehrenListe: begehren,
    formellesText: formellesTeile.join(' '),
    // Platzhalter-Modus (Auftrag David 11.6.2026): Leer-Ziffern zum
    // Handausfüllen statt der Masken-Eingaben.
    sachverhaltListe: a.begruendungAktiv
      ? (a.begruendungPlatzhalter
        ? [{ text: '________' }, { text: '________' }, { text: '________' }]
        : a.sachverhalt.filter((s) => s.text.trim()).map((s) => ({ text: s.text.trim() })))
      : [],
    beweismittelListe: a.begruendungAktiv
      ? (a.begruendungPlatzhalter
        ? [{ bezeichnung: '________', fuerZeile: '' }]
        : a.beweismittel.filter((b) => b.bezeichnung.trim()).map((b) => ({
            bezeichnung: b.bezeichnung.trim(),
            fuerZeile: b.fuer?.trim() ? ` (zum Beweis: ${b.fuer.trim()})` : '',
          })))
      : [],
    ohneBegruendung: !a.begruendungAktiv,
    beilagenListe: beilagen,
    unterschriftName: parteiKurz(a.klaeger) || '________',
  };
  return assemble(KV_SCHEMA, antworten);
}
