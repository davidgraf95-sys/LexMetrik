// ─── SchKG-Zuständigkeits-Engine (Rechtsweg «Betreibung») ───────────────────
//
// Eigene Engine analog Zivil (Anordnung David 5.6.2026; §4: KEINE Fusion mit
// lib/zustaendigkeit.ts). Quelle: bibliothek/normen/schkg-zustaendigkeit-
// regelwerk.md (Wortlaute verbatim am Fedlex-Cache /tmp/schkg.html, Stand
// 1.1.2025, verifiziert 5.6.2026) — insb. die Synthese-Tabelle §6.
// Kosten: GebV SchKG (SR 281.35) Art. 16, Wortlaut verifiziert am Filestore
// Stand 1.1.2022; eine Änderung per 1.1.2026 (AS 2025 630) ist nur als
// signiertes PDF publiziert → Beträge tragen einen Prüf-Vorbehalt
// (Parameter-Verfallsregister).
//
// Rein und deterministisch (§2). Reihenfolge der Prüfung analog Zivil:
// 1) BETREIBUNGSORT (Wurzelgrösse, Art. 46–55) → 2) FORUM des Anliegens
// (Synthese-Tabelle) → 3) Eingabe-Art/Verfahren → 4) FRISTEN (Verwirkung!).

export type SchkgSchuldnerTyp =
  | 'natuerlich_wohnsitz'      // Art. 46 Abs. 1
  | 'natuerlich_ohne_wohnsitz' // Art. 48
  | 'jur_person_hr'            // Art. 46 Abs. 2 (Sitz)
  | 'jur_person_nicht_hr'      // Art. 46 Abs. 2 (Hauptsitz der Verwaltung)
  | 'erbschaft'                // Art. 49
  | 'ausland_niederlassung';   // Art. 50 Abs. 1

export type SchkgPfand = 'kein' | 'faustpfand' | 'grundpfand';

export type SchkgAnliegen =
  | 'betreibung_einleiten'
  | 'rechtsoeffnung'
  | 'aberkennungsklage'
  | 'anerkennungsklage'
  | 'rueckforderung'
  | 'feststellung'        // Art. 85 / 85a
  | 'widerspruch'         // Art. 106–109
  | 'kollokation'         // Art. 148 / 250
  | 'arrest'
  | 'konkursbegehren'
  | 'beschwerde_amt';     // Art. 17–19 (Aufsichtsbehörde!)

export type WiderspruchKonstellation =
  | 'gewahrsam_schuldner'        // 107/109 I Ziff. 1 → Betreibungsort
  | 'gewahrsam_dritter_ch'       // 108/109 II → Wohnsitz Beklagter
  | 'gewahrsam_dritter_ausland'  // 108/109 I Ziff. 2 → Betreibungsort
  | 'grundstueck';               // 109 III → Ort des Grundstücks

export interface SchkgInput {
  anliegen: SchkgAnliegen;
  schuldnerTyp: SchkgSchuldnerTyp;
  pfand?: SchkgPfand;
  arrestGelegt?: boolean;
  forderungCHF?: number | null;
  widerspruchKonstellation?: WiderspruchKonstellation;
  kollokationIn?: 'pfaendung' | 'konkurs';
  rechtsoeffnungArt?: 'provisorisch' | 'definitiv';
}

export interface SchkgNorm { artikel: string; bemerkung?: string }
export interface SchkgFrist { label: string; frist: string; norm: string; kritisch: boolean }
export interface SchkgSchritt { titel: string; text: string }

export interface SchkgErgebnis {
  betreibungsort: { text: string; normen: SchkgNorm[] };
  forum: { stelle: string; text: string; normen: SchkgNorm[] };
  eingabe: { art: string; verfahren: string };
  fristen: SchkgFrist[];
  /** Gebühr Zahlungsbefehl nach Art. 16 GebV SchKG (nur bei Einleitung). */
  kostenZahlungsbefehl: { gebuehrCHF: number; band: string } | null;
  fahrplan: SchkgSchritt[];
  warnungen: string[];
  weichen: string[];
  normverweise: SchkgNorm[];
}

// Art. 16 Abs. 1 GebV SchKG — Staffel wörtlich (Stand 1.1.2022; Vorbehalt
// AS 2025 630 per 1.1.2026, nur signiertes PDF):
const GEBUEHR_ZB: { bis: number; gebuehr: number; band: string }[] = [
  { bis: 100, gebuehr: 7, band: 'bis 100' },
  { bis: 500, gebuehr: 20, band: 'über 100 bis 500' },
  { bis: 1_000, gebuehr: 40, band: 'über 500 bis 1 000' },
  { bis: 10_000, gebuehr: 60, band: 'über 1 000 bis 10 000' },
  { bis: 100_000, gebuehr: 90, band: 'über 10 000 bis 100 000' },
  { bis: 1_000_000, gebuehr: 190, band: 'über 100 000 bis 1 000 000' },
  { bis: Number.POSITIVE_INFINITY, gebuehr: 400, band: 'über 1 000 000' },
];

export function gebuehrZahlungsbefehl(forderungCHF: number): { gebuehrCHF: number; band: string } {
  if (!Number.isFinite(forderungCHF) || forderungCHF < 0) {
    throw new Error('Forderung muss eine Zahl ≥ 0 sein.');
  }
  const stufe = GEBUEHR_ZB.find((s) => forderungCHF <= s.bis)!;
  return { gebuehrCHF: stufe.gebuehr, band: stufe.band };
}

const ORT_NORM: Record<SchkgSchuldnerTyp, { text: string; norm: SchkgNorm }> = {
  natuerlich_wohnsitz: { text: 'am WOHNSITZ der Schuldnerin/des Schuldners', norm: { artikel: 'Art. 46 Abs. 1 SchKG' } },
  natuerlich_ohne_wohnsitz: { text: 'am AUFENTHALTSORT (kein fester Wohnsitz)', norm: { artikel: 'Art. 48 SchKG' } },
  jur_person_hr: { text: 'am SITZ der im Handelsregister eingetragenen juristischen Person/Gesellschaft', norm: { artikel: 'Art. 46 Abs. 2 SchKG' } },
  jur_person_nicht_hr: { text: 'am HAUPTSITZ DER VERWALTUNG (nicht eingetragene juristische Person)', norm: { artikel: 'Art. 46 Abs. 2 SchKG' } },
  erbschaft: { text: 'am Ort, wo die Erblasserin/der Erblasser zur Zeit des Todes betrieben werden konnte (solange Teilung/Gemeinderschaft/amtliche Liquidation nicht erfolgt ist)', norm: { artikel: 'Art. 49 SchKG' } },
  ausland_niederlassung: { text: 'am SITZ DER SCHWEIZER GESCHÄFTSNIEDERLASSUNG (für auf deren Rechnung eingegangene Verbindlichkeiten); bei gewähltem Spezialdomizil an diesem Ort', norm: { artikel: 'Art. 50 SchKG' } },
};

export function bestimmeSchkgZustaendigkeit(input: SchkgInput): SchkgErgebnis {
  const warnungen: string[] = [];
  const weichen: string[] = [];
  const normverweise: SchkgNorm[] = [];
  const fristen: SchkgFrist[] = [];
  const fahrplan: SchkgSchritt[] = [];
  const pfand = input.pfand ?? 'kein';

  // ── 1 · Betreibungsort (Wurzelgrösse) ──────────────────────────────────────
  const basis = ORT_NORM[input.schuldnerTyp];
  let ortText: string;
  const ortNormen: SchkgNorm[] = [];
  if (pfand === 'grundpfand') {
    ortText = 'ZWINGEND am Ort des verpfändeten Grundstücks (bei mehreren Grundstücken: Betreibungskreis des wertvollsten Teils) — der allgemeine Betreibungsort steht NICHT zur Wahl';
    ortNormen.push({ artikel: 'Art. 51 Abs. 2 SchKG' });
  } else if (pfand === 'faustpfand') {
    ortText = `nach Wahl der Gläubigerin/des Gläubigers: ${basis.text} ODER am Ort, wo sich das Pfand bzw. sein wertvollster Teil befindet`;
    ortNormen.push({ artikel: 'Art. 51 Abs. 1 SchKG' }, basis.norm);
  } else {
    ortText = basis.text;
    ortNormen.push(basis.norm);
  }
  if (input.arrestGelegt && pfand !== 'grundpfand') {
    ortText += '; zusätzlich WAHLWEISE am Ort des Arrestgegenstands';
    ortNormen.push({ artikel: 'Art. 52 SchKG' });
    warnungen.push('Arrest-Betreibungsort (Art. 52 SchKG): Konkursandrohung und Konkurseröffnung sind NUR am ordentlichen Betreibungsort möglich (Art. 52 Satz 2 SchKG).');
  }
  weichen.push('Nach Ankündigung der Pfändung, Zustellung der Konkursandrohung oder des Zahlungsbefehls der Wechselbetreibung wird die Betreibung am BISHERIGEN Ort fortgesetzt, auch wenn der Schuldner den Wohnsitz wechselt (Art. 53 SchKG).');
  if (input.schuldnerTyp === 'erbschaft') {
    warnungen.push('Sonderfall Stockwerkeigentümergemeinschaft: Betreibungsort am Ort der gelegenen Sache (Art. 46 Abs. 4 SchKG) — hier nicht abgebildet.');
  }

  // ── 2 · Forum + Eingabe + Fristen je Anliegen (Synthese-Tabelle §6) ───────
  let forum: SchkgErgebnis['forum'];
  let eingabe: SchkgErgebnis['eingabe'];
  let kostenZB: SchkgErgebnis['kostenZahlungsbefehl'] = null;

  switch (input.anliegen) {
    case 'betreibung_einleiten': {
      forum = {
        stelle: 'Betreibungsamt am Betreibungsort',
        text: 'Das Betreibungsbegehren geht an das BETREIBUNGSAMT des Betreibungsortes (kein Gericht). Das zuständige Amt je PLZ weist das amtliche Verzeichnis des Bundesamts für Justiz aus.',
        normen: [{ artikel: 'Art. 67 SchKG', bemerkung: 'Betreibungsbegehren' }],
      };
      eingabe = { art: 'Betreibungsbegehren (Formular oder eSchKG)', verfahren: 'Vollstreckungsverfahren (kein Prozess); der Zahlungsbefehl ergeht ohne materielle Prüfung' };
      if (input.forderungCHF != null) kostenZB = gebuehrZahlungsbefehl(input.forderungCHF);
      fristen.push({ label: 'Rechtsvorschlag der Gegenseite', frist: '10 Tage ab Zustellung des Zahlungsbefehls', norm: 'Art. 74 Abs. 1 SchKG', kritisch: false });
      fahrplan.push(
        { titel: 'Betreibungsbegehren stellen', text: 'Gläubiger/Schuldner/Forderung (CHF, Grund) bezeichnen — Formular des Betreibungsamts oder eSchKG (Art. 67 SchKG). Ein Urteil ist NICHT erforderlich.' },
        { titel: 'Beim Betreibungsamt des Betreibungsortes einreichen', text: 'Das zuständige Amt ergibt sich aus dem Betreibungsort (oben); konkrete Adresse über das amtliche Verzeichnis (PLZ-Suche).' },
        { titel: 'Zahlungsbefehl wird zugestellt', text: 'Die Gegenseite kann innert 10 Tagen Rechtsvorschlag erheben (Art. 74 SchKG) — dann braucht es Rechtsöffnung oder Anerkennungsklage.' },
        { titel: 'Ohne Rechtsvorschlag: Fortsetzung verlangen', text: 'Frühestens 20 Tage, spätestens 1 Jahr nach Zustellung des Zahlungsbefehls (Art. 88 SchKG) — sonst erlischt die Betreibung.' },
      );
      fristen.push({ label: 'Fortsetzungsbegehren', frist: 'frühestens 20 Tage, spätestens 1 Jahr ab Zustellung ZB (Frist steht bei Rechtsvorschlag während des Gerichtsverfahrens still, Abs. 2)', norm: 'Art. 88 SchKG', kritisch: true });
      break;
    }
    case 'rechtsoeffnung': {
      const art = input.rechtsoeffnungArt ?? 'provisorisch';
      forum = {
        stelle: 'Gericht des Betreibungsortes (Rechtsöffnungsgericht)',
        text: 'Das Gesuch um Rechtsöffnung ist beim GERICHT DES BETREIBUNGSORTES zu stellen (Art. 84 Abs. 1 SchKG); summarisches Verfahren (Art. 251 lit. a ZPO).',
        normen: [{ artikel: 'Art. 84 SchKG' }, { artikel: 'Art. 251 ZPO' }],
      };
      eingabe = {
        art: art === 'definitiv' ? 'Gesuch um DEFINITIVE Rechtsöffnung (vollstreckbares Urteil/Entscheid, Art. 80 SchKG)' : 'Gesuch um PROVISORISCHE Rechtsöffnung (Schuldanerkennung, Art. 82 SchKG)',
        verfahren: 'Summarisches Verfahren — KEIN Gerichtsferien-Stillstand (Art. 145 Abs. 2 lit. b ZPO)',
      };
      if (art === 'provisorisch') {
        fristen.push({ label: 'Aberkennungsklage der Gegenseite', frist: '20 Tage ab Rechtsöffnung', norm: 'Art. 83 Abs. 2 SchKG', kritisch: true });
        weichen.push('Nach provisorischer Rechtsöffnung kann die Schuldnerseite innert 20 Tagen Aberkennungsklage erheben (Art. 83 Abs. 2 SchKG) — erst danach wird die Rechtsöffnung definitiv wirksam.');
      }
      fahrplan.push(
        { titel: 'Rechtsöffnungsgesuch verfassen', text: art === 'definitiv' ? 'Vollstreckbaren Entscheid beilegen (Art. 80/81 SchKG); Einwendungen der Gegenseite sind eng begrenzt.' : 'Schuldanerkennung (Vertrag, unterschriebenes Dokument) beilegen (Art. 82 SchKG).' },
        { titel: 'Beim Gericht des Betreibungsortes einreichen', text: 'Summarisches Verfahren; der Entscheid soll innert 5 Tagen nach Eingang der Stellungnahme ergehen (Art. 84 Abs. 2 SchKG).' },
        { titel: 'Nach Gutheissung: Fortsetzung der Betreibung', text: 'Fortsetzungsbegehren beim Betreibungsamt (Art. 88 SchKG)' + (art === 'provisorisch' ? ' — vorbehältlich der Aberkennungsklage (20 Tage).' : '.') },
      );
      break;
    }
    case 'aberkennungsklage': {
      forum = {
        stelle: 'Gericht des Betreibungsortes',
        text: 'Die Aberkennungsklage ist beim GERICHT DES BETREIBUNGSORTES einzureichen (Art. 83 Abs. 2 SchKG) — ordentliches (bzw. je nach Streitwert vereinfachtes) Verfahren.',
        normen: [{ artikel: 'Art. 83 Abs. 2 SchKG' }],
      };
      eingabe = { art: 'Aberkennungsklage (negative Feststellungsklage der Schuldnerseite)', verfahren: 'Ordentliches/vereinfachtes Verfahren nach ZPO; KEINE Schlichtung (Art. 198 lit. e Ziff. 1 ZPO)' };
      fristen.push({ label: 'Klagefrist', frist: '20 Tage ab Erteilung der provisorischen Rechtsöffnung', norm: 'Art. 83 Abs. 2 SchKG', kritisch: true });
      fahrplan.push(
        { titel: 'Frist sichern: 20 Tage', text: 'Die Frist ist eine VERWIRKUNGSFRIST — nach Ablauf wird die provisorische Rechtsöffnung definitiv (Art. 83 Abs. 3 SchKG).' },
        { titel: 'Klage direkt beim Gericht des Betreibungsortes', text: 'Keine Schlichtung (Art. 198 lit. e Ziff. 1 ZPO) — die Klage geht direkt ans Gericht.' },
      );
      break;
    }
    case 'anerkennungsklage': {
      forum = {
        stelle: 'ordentliches Gericht nach ZPO (KEIN SchKG-Forum)',
        text: 'Die Anerkennungsklage (Art. 79 SchKG) folgt den ORDENTLICHEN Gerichtsständen der ZPO (i. d. R. Wohnsitz/Sitz der beklagten Partei, Art. 10 ZPO) — der Betreibungsort begründet KEINE Zuständigkeit.',
        normen: [{ artikel: 'Art. 79 SchKG' }, { artikel: 'Art. 10 ZPO' }],
      };
      eingabe = { art: 'Anerkennungsklage (ordentlicher Prozess über den Bestand der Forderung)', verfahren: 'Verfahren nach ZPO inkl. Schlichtung (für die örtliche Prüfung: Zivil-Rechtsweg dieses Rechners nutzen)' };
      weichen.push('Alternative bei Schuldanerkennung/Urteil: provisorische bzw. definitive Rechtsöffnung am Betreibungsort (Art. 80/82 SchKG) — meist schneller und günstiger.');
      fahrplan.push(
        { titel: 'Forum nach ZPO bestimmen', text: 'Wohnsitz/Sitz der beklagten Partei (Art. 10 ZPO) oder besonderer Gerichtsstand — den Zivil-Rechtsweg dieses Rechners verwenden.' },
        { titel: 'Schlichtung/Klage nach ZPO', text: 'Obsiegen beseitigt den Rechtsvorschlag (Art. 79 SchKG) — danach Fortsetzungsbegehren.' },
      );
      break;
    }
    case 'rueckforderung': {
      forum = {
        stelle: 'Gericht des Betreibungsortes ODER ordentlicher Gerichtsstand der beklagten Partei (Wahl)',
        text: 'Die Rückforderungsklage (Nichtschuld bezahlt) kann am BETREIBUNGSORT oder am ordentlichen Gerichtsstand der BEKLAGTEN Partei erhoben werden (Art. 86 Abs. 2 SchKG).',
        normen: [{ artikel: 'Art. 86 SchKG' }],
      };
      eingabe = { art: 'Rückforderungsklage', verfahren: 'Verfahren nach ZPO' };
      fristen.push({ label: 'Klagefrist', frist: '1 Jahr ab Zahlung', norm: 'Art. 86 Abs. 1 SchKG', kritisch: true });
      fahrplan.push({ titel: 'Innert 1 Jahr klagen', text: 'Beweislast: Nichtschuld der bezahlten Forderung (Art. 86 Abs. 3 SchKG); Wahlgerichtsstand nutzen.' });
      break;
    }
    case 'feststellung': {
      forum = {
        stelle: 'Gericht des Betreibungsortes',
        text: 'Klagen nach Art. 85 (Aufhebung/Einstellung bei urkundlichem Tilgungs-/Stundungsnachweis, summarisch) und Art. 85a SchKG (Feststellung des Nichtbestands) gehen an das GERICHT DES BETREIBUNGSORTES.',
        normen: [{ artikel: 'Art. 85 SchKG' }, { artikel: 'Art. 85a SchKG' }],
      };
      eingabe = { art: 'Gesuch (Art. 85: Urkundenbeweis, summarisch) bzw. Klage (Art. 85a)', verfahren: 'Art. 85 summarisch · Art. 85a ordentliches/vereinfachtes Verfahren' };
      fristen.push({ label: 'Einreichung', frist: 'jederzeit während der Betreibung', norm: 'Art. 85/85a SchKG', kritisch: false });
      weichen.push('Art. 85a: Die Einstellung der Betreibung erfolgt erst auf gerichtliche Anordnung hin (Abs. 2) — die Klage allein stoppt die Betreibung nicht.');
      fahrplan.push({ titel: 'Nachweis wählen', text: 'Mit Urkunde (Quittung, Stundungsvereinbarung): schneller Weg über Art. 85. Ohne Urkunde: Klage nach Art. 85a.' });
      break;
    }
    case 'widerspruch': {
      const k = input.widerspruchKonstellation ?? 'gewahrsam_schuldner';
      const map: Record<WiderspruchKonstellation, { stelle: string; norm: string }> = {
        gewahrsam_schuldner: { stelle: 'Gericht des Betreibungsortes (Dritter klagt)', norm: 'Art. 107 Abs. 5 / 109 Abs. 1 Ziff. 1 SchKG' },
        gewahrsam_dritter_ch: { stelle: 'Gericht am Wohnsitz der beklagten Partei', norm: 'Art. 108 / 109 Abs. 2 SchKG' },
        gewahrsam_dritter_ausland: { stelle: 'Gericht des Betreibungsortes', norm: 'Art. 108 / 109 Abs. 1 Ziff. 2 SchKG' },
        grundstueck: { stelle: 'Gericht am Ort der gelegenen Sache (Grundstück)', norm: 'Art. 109 Abs. 3 SchKG' },
      };
      forum = {
        stelle: map[k].stelle,
        text: `Widerspruchsverfahren (Drittansprache an gepfändeten Vermögenswerten): zuständig ist das ${map[k].stelle} (${map[k].norm}).`,
        normen: [{ artikel: map[k].norm }],
      };
      eingabe = { art: 'Widerspruchsklage', verfahren: 'Beschleunigtes Verfahren der ZPO-Foren; KEINE Schlichtung (Art. 198 lit. e Ziff. 2 ZPO)' };
      fristen.push({ label: 'Klagefrist', frist: '20 Tage ab Fristansetzung durch das Betreibungsamt', norm: 'Art. 107 Abs. 5 / 108 Abs. 2 SchKG', kritisch: true });
      fahrplan.push({ titel: 'Konstellation bestimmt Forum UND Parteirollen', text: 'Gewahrsam beim Schuldner → der DRITTE muss klagen (Art. 107); Gewahrsam beim Dritten → der GLÄUBIGER muss klagen (Art. 108). Die 20-Tage-Frist ist Verwirkung.' });
      break;
    }
    case 'kollokation': {
      const inKonkurs = (input.kollokationIn ?? 'pfaendung') === 'konkurs';
      forum = {
        stelle: inKonkurs ? 'Gericht des Konkursortes' : 'Gericht des Betreibungsortes',
        text: inKonkurs
          ? 'Kollokationsklage im KONKURS: Gericht des Konkursortes (Art. 250 Abs. 1 SchKG).'
          : 'Kollokationsklage in der PFÄNDUNG: Gericht des Betreibungsortes (Art. 148 Abs. 1 SchKG).',
        normen: [{ artikel: inKonkurs ? 'Art. 250 SchKG' : 'Art. 148 SchKG' }],
      };
      eingabe = { art: 'Kollokationsklage', verfahren: 'Beschleunigtes Verfahren; KEINE Schlichtung (Art. 198 lit. e Ziff. 5 ZPO)' };
      fristen.push({ label: 'Klagefrist', frist: inKonkurs ? '20 Tage ab öffentlicher Auflage des Kollokationsplans' : '20 Tage ab Zustellung des Auszugs', norm: inKonkurs ? 'Art. 250 Abs. 1 SchKG' : 'Art. 148 Abs. 1 SchKG', kritisch: true });
      break;
    }
    case 'arrest': {
      forum = {
        stelle: 'Gericht des Betreibungsortes ODER Gericht am Ort der Vermögenswerte (Wahl)',
        text: 'Arrestgesuch beim Gericht des Betreibungsortes ODER am Ort, wo sich Vermögensgegenstände befinden (Art. 272 Abs. 1 SchKG); Glaubhaftmachung von Forderung, Arrestgrund (Art. 271) und Vermögenswerten.',
        normen: [{ artikel: 'Art. 271 SchKG' }, { artikel: 'Art. 272 SchKG' }],
      };
      eingabe = { art: 'Arrestgesuch (einseitig, ohne Anhörung der Gegenseite)', verfahren: 'Summarisches Verfahren (Art. 251 lit. a ZPO)' };
      fristen.push(
        { label: 'Arresteinsprache der Gegenseite', frist: '10 Tage ab Kenntnis des Arrests', norm: 'Art. 278 Abs. 1 SchKG', kritisch: true },
        { label: 'Arrestprosequierung (Betreibung/Klage)', frist: '10 Tage ab Zustellung der Arresturkunde (bzw. 20 Tage bei Auslandszustellung gemäss Praxis)', norm: 'Art. 279 SchKG', kritisch: true },
      );
      warnungen.push('Arrestkaution/Schadenersatzrisiko: Bei ungerechtfertigtem Arrest haftet die Arrestgläubigerin (Art. 273 SchKG); das Gericht kann Sicherheitsleistung verlangen.');
      fahrplan.push(
        { titel: 'Arrestgrund glaubhaft machen', text: 'Katalog des Art. 271 SchKG (z. B. kein Wohnsitz in der Schweiz, Schuldnerflucht, definitiver Rechtsöffnungstitel Ziff. 6).' },
        { titel: 'Nach Vollzug: prosequieren', text: 'Innert 10 Tagen Betreibung oder Klage anheben (Art. 279 SchKG) — sonst fällt der Arrest dahin.' },
      );
      break;
    }
    case 'konkursbegehren': {
      forum = {
        stelle: 'Konkursgericht am (ordentlichen) Betreibungsort',
        text: 'Das Konkursbegehren ist beim KONKURSGERICHT des Betreibungsortes zu stellen (Art. 166 SchKG); bei Arrest-/Pfand-Spezialorten gilt zwingend der ORDENTLICHE Betreibungsort (Art. 52 Satz 2 SchKG).',
        normen: [{ artikel: 'Art. 166 SchKG' }, { artikel: 'Art. 52 SchKG' }],
      };
      eingabe = { art: 'Konkursbegehren (nach Konkursandrohung)', verfahren: 'Summarisches Verfahren; Entscheid durch das Konkursgericht (Art. 171 SchKG)' };
      fristen.push(
        { label: 'Frühester Zeitpunkt', frist: '20 Tage nach Zustellung der Konkursandrohung', norm: 'Art. 166 Abs. 1 SchKG', kritisch: false },
        { label: 'Erlöschen des Rechts', frist: '15 Monate nach Zustellung des Zahlungsbefehls (Stillstand während des Rechtsvorschlag-Verfahrens, Abs. 2)', norm: 'Art. 166 Abs. 2 SchKG', kritisch: true },
        { label: 'Beschwerde gegen das Konkurserkenntnis', frist: '10 Tage', norm: 'Art. 174 SchKG', kritisch: true },
      );
      break;
    }
    case 'beschwerde_amt': {
      forum = {
        stelle: 'AUFSICHTSBEHÖRDE über Betreibungs- und Konkursämter (NICHT das Gericht)',
        text: 'Gegen VERFÜGUNGEN des Betreibungs-/Konkursamts (Pfändungsvollzug, Zustellung, Verwertung …) ist die BESCHWERDE an die kantonale Aufsichtsbehörde zu richten (Art. 17 SchKG) — nicht an das Zivilgericht. Materielle Einwände gegen die Forderung gehören dagegen vor das Gericht (Rechtsöffnung/Klagen).',
        normen: [{ artikel: 'Art. 17 SchKG' }, { artikel: 'Art. 13 SchKG' }],
      };
      eingabe = { art: 'Beschwerde (schriftlich, begründet)', verfahren: 'Aufsichtsverfahren; Weiterzug an das Bundesgericht nach Art. 19 SchKG (Beschwerde in Zivilsachen, streitwertunabhängig — Art. 74 Abs. 2 lit. c BGG)' };
      fristen.push(
        { label: 'Beschwerdefrist', frist: '10 Tage ab Kenntnis der Verfügung', norm: 'Art. 17 Abs. 2 SchKG', kritisch: true },
        { label: 'Rechtsverweigerung/-verzögerung', frist: 'jederzeit', norm: 'Art. 17 Abs. 3 SchKG', kritisch: false },
      );
      weichen.push('NICHTIGE Verfügungen (Verstoss gegen Vorschriften, die im öffentlichen Interesse oder im Interesse unbeteiligter Dritter erlassen sind) sind ohne Fristbindung von Amtes wegen festzustellen (Art. 22 SchKG).');
      break;
    }
  }

  // ── 3 · Rechenweg/Normverweise sammeln ─────────────────────────────────────
  normverweise.push(...ortNormen, ...forum.normen);

  return {
    betreibungsort: { text: ortText, normen: ortNormen },
    forum, eingabe, fristen,
    kostenZahlungsbefehl: kostenZB,
    fahrplan, warnungen, weichen, normverweise,
  };
}

/** Amtliches Verzeichnis der Betreibungs- und Konkursämter (Bundesamt für
 *  Justiz, eSchKG) — deterministischer Einstieg zur konkreten Amtsadresse. */
export const BETREIBUNGSAEMTER_VERZEICHNIS = 'https://www.e-service.admin.ch/eschkg/app/verzeichnis';
