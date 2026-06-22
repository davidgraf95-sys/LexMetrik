import { useEffect, useMemo, useState } from 'react';

import { permalinkLesen } from '../../lib/permalink';
import { ZUST_LINK_SPEC } from './zustaendigkeitLinkSpecs';

import type { PdfDocConfig } from '../../lib/pdf/pdfModel';
import { zustaendigkeitErgebnis, bestimmeRechtsmittel, type ZustaendigkeitInput, type Rechtsweg } from '../../lib/zustaendigkeit';
import { obereInstanzFuer } from '../../data/obereInstanzen';
import { stelleFuer, kantonErfasst, kantonZustaendigkeit, gemeindeImKanton } from '../../data/zustaendigkeitKantone';
import { schlichtungAufloesung } from '../../data/schlichtungsstellen';
import { kostenFuer } from '../../data/zustaendigkeitKosten';

import { fahrplanSchritte } from '../../lib/zustaendigkeitFahrplan';
import { hauptTreffer, plzAufloesen, type PlzTreffer } from '../../data/plz/plzAufloesung';

import { zuerichAemterFuerPlz, zuerichAmtFuerStrasse, zuerichKreisAemter, type ZhKreisAmt } from '../../data/schlichtung/zhAmt';
import { amtFuer, AMT_KANTONE, mieteAmtFuer, MIETE_AMT_KANTONE, vdAmtFuer, type SchlichtungsAmt } from '../../data/schlichtung/amtAufloesung';
import { tiKandidaten, tiMieteKandidaten } from '../../data/schlichtung/tiAmt';
import { vdSchlichtungsStufe } from '../../lib/vdSchlichtung';

import { sgPrefillKodieren } from '../../lib/vorlagen/schlichtungsgesuchBs';

import { handelsgerichtFuer } from '../../data/handelsgerichte';

// ─── Zuständigkeitsrechner – UI (Umbau 5.6.2026, Entscheid David) ───────────
// Vier-Stufen-Führung: 1) RECHTSWEG (Zivil aktiv; SchKG/Straf/Verwaltung als
// ehrliche «in Vorbereitung»-Kacheln — eigene künftige Engines, §4) →
// 2) STREITSACHE (daraus folgt die Zuständigkeitslogik) → 3) ORT/STREITWERT/
// INSTANZ → 4) konkrete Behörde MIT Adresse + ART der Eingabe + Vorlagen-Sprung.
// Reine Darstellung (§3): Bundesrecht in lib/zustaendigkeit.ts, Kantonsdaten
// in data/zustaendigkeitKantone.ts.

import { DISCLAIMER, STREITSACHEN, MIETE_UNTERFAELLE, DEFAULTS, type State } from './zustaendigkeitFormDaten';

// Setup/Hooks/abgeleiteter State der Zuständigkeits-UI — aus
// ZustaendigkeitForm.tsx ausgelagert (§6 Datei-Schlankheit). Verhaltensneutral:
// identische Hook-Aufrufe + JSX byte-gleich; die Komponente destrukturiert nur.
export function useZustaendigkeitForm({ onRechtswegChange, rechtswegVorwahl }: {
  onRechtswegChange?: (w: Rechtsweg) => void;
  /** Vorauswahl aus dem URL-Hash der Katalog-Split-Karten (#schkg/#straf). */
  rechtswegVorwahl?: Rechtsweg;
} = {}) {
  const [ausLink] = useState<Partial<State> & { schritt?: number }>(() => {
    try { return permalinkLesen(ZUST_LINK_SPEC, window.location.search) as Partial<State> & { schritt?: number }; }
    catch { return {}; }
  });
  const [f, setF] = useState<State>(() => {
    const rest = { ...ausLink };
    delete rest.schritt;
    // M-7-Härtung (10.6.2026): Sub-Felder aus dem Permalink nur übernehmen,
    // wenn die zugehörige Streitsache/Instanz im SELBEN Link steht. Die
    // Engine-Eingabe filtert zwar ohnehin (unten), aber ein manipulierter
    // Link liesse sonst z. B. mieteUnterfall im State zurück, der beim
    // späteren Umschalten auf Miete unbemerkt vorbelegt wäre.
    const sache = rest.streitsache ?? DEFAULTS.streitsache;
    const instanz = rest.instanz ?? DEFAULTS.instanz;
    const passt: Partial<Record<keyof State, boolean>> = {
      mieteUnterfall: sache === 'miete_wohn_geschaeft',
      glgBetroffen: sache === 'arbeit',
      avgVerleih: sache === 'arbeit',
      konsumentenvertrag: sache === 'geldforderung',
      klaegeristGeschuetzt: sache === 'geldforderung',
      geschaeftlicheTaetigkeit: sache === 'geldforderung',
      beklagteImHR: sache === 'geldforderung',
      klaegerImHR: sache === 'geldforderung',
      ausVertrag: sache === 'geldforderung',
      deliktUnterfall: sache === 'delikt',
      persoenlichkeitUnterfall: sache === 'persoenlichkeit',
      ipUnterfall: sache === 'ip_wettbewerb',
      bundKlagerecht: sache === 'ip_wettbewerb',
      rmObjekt: instanz === 'rechtsmittel',
      rmVerfahren: instanz === 'rechtsmittel',
      rmVorinstanz: instanz === 'rechtsmittel',
      rmFamilienSummarsache: instanz === 'rechtsmittel',
    };
    for (const k of Object.keys(passt) as (keyof State)[]) {
      if (passt[k] === false) delete rest[k];
    }
    return { ...DEFAULTS, ...rest };
  });
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

  // ── Geführter Schritt-Dialog (Auftrag David 6.6.2026) ─────────────────────
  // Reine Dramaturgie (§3): die bestehenden Eingabe- und Ergebnis-Blöcke
  // werden unverändert in nacheinander sichtbare Schritte gehängt; die Engine-
  // Aufrufe und ihre Eingaben bleiben semantisch identisch. Das Schritt-Gerüst
  // nutzt denselben Stepper wie die Vorlagen-Wizards (geteilter Baustein, §10).
  const [schritt, setSchritt] = useState(ausLink.schritt ?? 0);

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

  const istMiete = f.streitsache === 'miete_wohn_geschaeft';
  const istArbeit = f.streitsache === 'arbeit';
  const istGeld = f.streitsache === 'geldforderung';
  const istScheidung = f.streitsache === 'scheidung';

  // Scheidung: nicht vermögensrechtlich, kein Streitwert (UI blendet aus).
  const vermoegensrechtlich = istScheidung ? false : f.vermoegensrechtlich;
  const streitwert = f.streitwertRoh.trim() === '' ? null : Number(f.streitwertRoh);
  // VD-Sonderfall (Art. 41 CDPJ-VD): die Schlichtungsinstanz hängt vom
  // Streitwert ab — Stufe aus der reinen Engine (lib/vdSchlichtung.ts);
  // memoisiert (stabile Referenz je Eingabe-Tupel für den Amts-Effect).
  const vdStufe = useMemo(() => (f.kanton === 'VD'
    ? vdSchlichtungsStufe(vermoegensrechtlich, vermoegensrechtlich ? streitwert : null)
    : null), [f.kanton, vermoegensrechtlich, streitwert]);

  // SO-Weiche (§ 5 Abs. 1 GO SO, 11.6.2026): wohnen/sitzen beide Parteien
  // in derselben Gemeinde? Reine Darstellungs-Frage der Kantonsschicht (§3).
  const [soGleicheGemeinde, setSoGleicheGemeinde] = useState<boolean | undefined>(undefined);

  // ── Konkretes Schlichtungsamt über Gemeinde (PLZ→Gemeinde→Amt) ────────────
  // Aufgelöste Kantone: AMT_KANTONE (ZH/AG/SG/TG; Ausbau folgt mit den
  // weiteren Gemeinde-Zuordnungen). Stadt Zürich: sechs Kreis-Ämter.
  // VD: stufengerechte Instanz (JdP/TA/Chambre) statt pauschalem Amt.
  const [amt, setAmt] = useState<SchlichtungsAmt | null>(null);
  // Miete-Register (Vollerhebung 11.6.2026): paritätische Miet-Stelle der
  // Gemeinde — eigener Lookup, Anzeige nur im paritaetisch_miete-Zweig.
  const [mieteAmt, setMieteAmt] = useState<SchlichtungsAmt | null>(null);
  // TI-Miete (12.6.2026): Lugano/Bellinzona/Val Mara erstrecken sich über
  // mehrere Uffici di conciliazione — Ortsteil-Kandidaten (Dossier §51).
  const [mieteKandidaten, setMieteKandidaten] = useState<ZhKreisAmt[] | null>(null);
  // anteilProzent: nur bei PLZ-eingegrenzten Stadt-Zürich-Treffern gesetzt
  // (Kreis-Automatik 12.6.2026); TI-Ortsteil-Kandidaten führen keinen.
  const [zhKreise, setZhKreise] = useState<(ZhKreisAmt & { anteilProzent?: number })[] | null>(null);
  // Strassen-Auflösung Stadt Zürich (Adress-Ausbau Stufe 1, 12.6.2026):
  // optionale Strasse + Nr. lösen den Kreis offline aus dem amtlichen
  // Stadt-Index — Vorrang vor der PLZ-Automatik; Status für die Hinweise.
  const [zhStrasse, setZhStrasse] = useState('');
  const [zhNummer, setZhNummer] = useState('');
  const [zhStrassenInfo, setZhStrassenInfo] = useState<'strasse' | 'nummer_noetig' | 'unbekannt' | null>(null);
  useEffect(() => {
    let aktiv = true;
    const ladeMiete = async (): Promise<{ amt: SchlichtungsAmt | null; kandidaten: ZhKreisAmt[] | null }> => {
      const kanton = f.kanton;
      const gemeinde = f.gemeinde.trim();
      if (kanton === '' || !MIETE_AMT_KANTONE.includes(kanton) || gemeinde === '') return { amt: null, kandidaten: null };
      if (kanton === 'TI') {
        const kandidaten = await tiMieteKandidaten(gemeinde);
        if (kandidaten) return { amt: null, kandidaten };
      }
      return { amt: await mieteAmtFuer(kanton, gemeinde), kandidaten: null };
    };
    ladeMiete()
      .then((m) => { if (aktiv) { setMieteAmt(m.amt); setMieteKandidaten(m.kandidaten); } })
      .catch(() => { if (aktiv) { setMieteAmt(null); setMieteKandidaten(null); } });
    const lade = async (): Promise<{ amt: SchlichtungsAmt | null; kreise: ZhKreisAmt[] | null; zhInfo?: 'strasse' | 'nummer_noetig' | 'unbekannt' | null }> => {
      const kanton = f.kanton;
      const gemeinde = f.gemeinde.trim();
      if (kanton === '' || !AMT_KANTONE.includes(kanton) || gemeinde === '') return { amt: null, kreise: null };
      if (kanton === 'ZH' && gemeinde.toLowerCase() === 'zürich') {
        // Strassen-Index (Stufe 1, 12.6.2026): Strasse (+ Nr.) hat Vorrang —
        // exakte amtliche Einzeladresse, offline. Kein Treffer/Nummer offen
        // → weiter mit der PLZ-Automatik (Hinweis via zhInfo).
        let zhInfo: 'nummer_noetig' | 'unbekannt' | null = null;
        if (zhStrasse.trim() !== '') {
          const erg = await zuerichAmtFuerStrasse(zhStrasse, zhNummer);
          if (erg?.typ === 'amt') return { amt: erg.amt, kreise: null, zhInfo: 'strasse' };
          zhInfo = erg ? 'nummer_noetig' : 'unbekannt';
        }
        // Kreis-Automatik (12.6.2026): amts-eindeutige PLZ direkt auflösen,
        // mehrdeutige auf die in Frage kommenden Kreis-Ämter eingrenzen
        // (amtliche Gebäudeadressen der Stadt Zürich; Stadt-PLZ sind NICHT
        // kreisscharf — Verifikation 12.6.2026). Ohne/unbekannte PLZ
        // (z. B. Postfach-PLZ) wie bisher die volle Sechser-Wahl.
        if (/^\d{4}$/.test(f.plz)) {
          const treffer = await zuerichAemterFuerPlz(f.plz);
          if (treffer && treffer.length === 1) return { amt: treffer[0], kreise: null, zhInfo };
          if (treffer) return { amt: null, kreise: treffer, zhInfo };
        }
        return { amt: null, kreise: await zuerichKreisAemter(), zhInfo };
      }
      // TI (11.6.2026): Lugano/Lema/Tresa liegen in mehreren Circoli —
      // Ortsteil-Wahl über denselben Kreis-Mechanismus wie Stadt Zürich.
      if (kanton === 'TI') {
        const kandidaten = await tiKandidaten(gemeinde);
        if (kandidaten) return { amt: null, kreise: kandidaten };
      }
      if (kanton === 'VD') {
        if (!vdStufe) return { amt: null, kreise: null };
        // Arbeit: prud'hommes-Kaskade (Art. 2 LJT-VD, Bug-Check 11.6.2026)
        return { amt: await vdAmtFuer(gemeinde, vdStufe.stufe, istArbeit), kreise: null };
      }
      // SO: Amtsgerichtspräsidium nur, wenn die Parteien NICHT in derselben
      // Gemeinde wohnen/sitzen (§ 10 GO; sonst Friedensrichter, § 5 Abs. 1).
      if (kanton === 'SO' && soGleicheGemeinde !== false) return { amt: null, kreise: null };
      return { amt: await amtFuer(kanton, gemeinde), kreise: null };
    };
    lade()
      .then((r) => { if (aktiv) { setAmt(r.amt); setZhKreise(r.kreise); setZhStrassenInfo(r.zhInfo ?? null); } })
      .catch(() => { if (aktiv) { setAmt(null); setZhKreise(null); setZhStrassenInfo(null); } });
    return () => { aktiv = false; };
  }, [f.kanton, f.gemeinde, f.plz, zhStrasse, zhNummer, vdStufe, istArbeit, soGleicheGemeinde]);
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
    ? schlichtungAufloesung(f.kanton, r.schlichtung.behoerdeTyp,
      { vermoegensrechtlich, streitwertCHF: vermoegensrechtlich ? streitwert : null, arbeitsrechtlich: istArbeit, gleicheGemeinde: soGleicheGemeinde })
    : null;
  const kantonOffen = f.kanton !== '' && !kantonErfasst(f.kanton) && !recherche;
  const kantonDaten = f.kanton ? kantonZustaendigkeit(f.kanton) : null;
  const gemeindeFremd = f.kanton !== '' && kantonErfasst(f.kanton)
    && f.gemeinde.trim() !== '' && !gemeindeImKanton(f.kanton, f.gemeinde);

  // CTA «Weiter zur Vorlage» (Auftrag §8): nur wenn die Ziel-Vorlage den Fall
  // trägt UND die Stelle erfasst ist; sonst ehrlich ausgeblendet.
  // Bug-Check 10.6.2026 abends (Befund David «automatische Zuweisung»):
  // auch Miete/GlG springen mit Typ + Ort in die Vorlage — sie adressiert
  // seit dem Umbau die paritätische Stelle selbst (kein Stopp mehr).
  const sgTyp = istGeld ? 'geldforderung' as const
    : istArbeit ? (f.glgBetroffen ? 'gleichstellung_glg' as const : 'arbeitsrecht' as const)
    : f.streitsache === 'miete_wohn_geschaeft' ? 'miete_pacht' as const
    : f.streitsache === 'erbrecht' ? 'uebrige_zivilsache' as const : null;
  // S-4 (Auftrag David 10.6.2026): nicht mehr auf BS begrenzt — die
  // SG-Vorlage löst die Schlichtungsbehörde (ordentlich wie paritätisch)
  // ALLER Kantone über dieselben Datenschichten auf (SgBehoerdenWahl);
  // PLZ/Gemeinde der Ermittlung reisen als Schlüssel mit, die Vorlage
  // setzt daraus die konkrete Stelle samt ADRESSE als Adressat ein (§5).
  const sgPrefill = r && f.kanton !== '' && r.eingabeArt === 'schlichtungsgesuch' && sgTyp
    ? sgPrefillKodieren({
      typ: sgTyp, betragCHF: vermoegensrechtlich ? streitwert : null, kanton: f.kanton,
      plz: f.plz, gemeinde: f.gemeinde.trim(),
    })
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

  // FAHRPLAN-PRAXIS 1.2: Mandats-Referenz für den PDF-Kopf (optional).
  const [aktenzeichen, setAktenzeichen] = useState('');
  const pdfConfig: PdfDocConfig = {
    aktenzeichen: aktenzeichen.trim() || undefined,
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

  // ── Schritt-Definition der ZIVIL-Strecke ──────────────────────────────────
  // Die Schritt-Liste ergibt sich aus der Streitsache (Streitwert entfällt bei
  // Scheidung) und der Instanz (Rechtsmittel hat eine eigene, kürzere Strecke).
  // SchKG/Straf laufen nicht über diesen Stepper, sondern über ihre eigenen
  // eingebetteten Komponenten (eigene Engines, §4) – dort gibt es nur den
  // Einstiegsschritt «Was möchten Sie tun?».
  type SchrittId = 'was' | 'sache' | 'ort' | 'streitwert' | 'sonderfaelle' | 'ergebnis';
  const zivil = rechtsweg === 'zivil';
  const schritte: { id: SchrittId; label: string }[] = !zivil
    ? [{ id: 'was', label: 'Was möchten Sie tun?' }]
    : f.instanz === 'rechtsmittel'
      ? [
          // Befund David 6.6.2026 (Fahrplan blieb leer): Die Engine braucht
          // auch im Rechtsmittel-Modus Streitsache (BGer-Schwelle Miete/
          // Arbeit, Art.-5-Weiche) und Streitwert (308 Abs. 2 / 74 BGG) —
          // beide Schritte gehören in die Strecke.
          { id: 'was', label: 'Was möchten Sie tun?' },
          { id: 'sache', label: 'Worum geht es?' },
          ...(istScheidung ? [] : [{ id: 'streitwert' as SchrittId, label: 'Streitwert' }]),
          { id: 'ort', label: 'Kanton' },
          { id: 'ergebnis', label: 'Fahrplan' },
        ]
      : [
          { id: 'was', label: 'Was möchten Sie tun?' },
          { id: 'sache', label: 'Worum geht es?' },
          { id: 'ort', label: 'Örtliche Anknüpfung' },
          ...(istScheidung ? [] : [{ id: 'streitwert' as SchrittId, label: 'Streitwert' }]),
          { id: 'sonderfaelle', label: 'Sonderfälle' },
          { id: 'ergebnis', label: 'Fahrplan' },
        ];
  // Index defensiv im gültigen Bereich halten, falls sich die Liste durch eine
  // Streitsachen-/Instanz-Wahl verkürzt (adjusting state, kein Effect).
  const maxIndex = schritte.length - 1;
  if (schritt > maxIndex) setSchritt(maxIndex);
  const aktiverSchritt = Math.min(schritt, maxIndex);
  const aktuelleId = schritte[aktiverSchritt].id;
  const zeige = (id: SchrittId) => aktuelleId === id;
  // «Weiter» erst zulassen, wenn der jeweilige Schritt schlüssig ist (Streitwert
  // muss vor dem Verlassen seines Schritts gültig sein – reine UI-Führung, die
  // Engine validiert ohnehin erneut).
  const weiterAus = aktuelleId === 'streitwert' && fehler.length > 0;

  return { f, setF, rechtsweg, setRechtsweg, set, schritt, setSchritt, plzTreffer, istMiete, istArbeit, istGeld, istScheidung, vermoegensrechtlich, streitwert, vdStufe, soGleicheGemeinde, setSoGleicheGemeinde, amt, mieteAmt, mieteKandidaten, zhKreise, zhStrasse, setZhStrasse, zhNummer, setZhNummer, zhStrassenInfo, fehler, input, ergebnis, r, rechtsmittel, obereInstanz, stelle, recherche, kantonOffen, kantonDaten, gemeindeFremd, sgPrefill, fahrplan, kosten, hgWeicheAktiv, handelsgericht, eingabeText, aktenzeichen, setAktenzeichen, pdfConfig, zivil, schritte, maxIndex, aktiverSchritt, zeige, weiterAus };
}
