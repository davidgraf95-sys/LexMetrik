// ─── Fundamentaler Logik-Sweep: kompletter Eingaberaum × Widerspruchsregeln ──
import { bestimmeZustaendigkeit, bestimmeRechtsmittel, ZPO_SCHWELLEN, RECHTSMITTEL_SCHWELLEN,
  type ZustaendigkeitInput, type Streitsache } from '../src/lib/zustaendigkeit';
import { BGER_SCHWELLEN } from '../src/lib/bgerRechtsweg';
import { fahrplanSchritte } from '../src/lib/zustaendigkeitFahrplan';
import { bestimmeSchkgZustaendigkeit, gebuehrZahlungsbefehl,
  type SchkgInput } from '../src/lib/schkgZustaendigkeit';
import { bestimmeStrafZustaendigkeit, type StrafInput } from '../src/lib/strafZustaendigkeit';

const fehler: string[] = [];
const melde = (id: string, input: unknown, regel: string) =>
  fehler.push(`${id} :: ${regel} :: ${JSON.stringify(input)}`);

// ═══ 1 · ZIVIL — voller Raster ═══
const STREITSACHEN: Streitsache[] = ['geldforderung','miete_wohn_geschaeft','arbeit','scheidung','erbrecht','delikt','persoenlichkeit','gesellschaft','ip_wettbewerb'];
const SW = [null, 0, 1999, 2000, 2001, 5000, 5001, 8000, 29_999, 30_000, 30_001, 99_999, 100_000, 100_001, 250_000];
let zivilN = 0;
for (const streitsache of STREITSACHEN)
for (const vermoegensrechtlich of [true, false])
for (const sw of vermoegensrechtlich ? SW.filter((x) => x !== null) : [null])
for (const glg of [false, true])
for (const gsv of [false, true])
for (const auslandUnbekannt of [false, true])
for (const mieteUnterfall of streitsache === 'miete_wohn_geschaeft' ? (['kuendigungsschutz','sonstige'] as const) : ([undefined] as const))
for (const deliktUnterfall of streitsache === 'delikt' ? (['allgemein','verkehrsunfall','ungerechtfertigte_massnahme'] as const) : ([undefined] as const))
for (const persU of streitsache === 'persoenlichkeit' ? (['verletzung','gegendarstellung','datenschutz','gewaltschutz'] as const) : ([undefined] as const))
for (const beklagteImHR of streitsache === 'geldforderung' || streitsache === 'gesellschaft' ? [false, true] : [false])
for (const klaegerImHR of beklagteImHR ? [false, true] : [false])
for (const ipUnterfall of streitsache === 'ip_wettbewerb' ? (['ip_kartell_firma','uwg','klage_gegen_bund'] as const) : ([undefined] as const))
for (const bundKlagerecht of ipUnterfall === 'uwg' ? [false, true] : [false]) {
  const input: ZustaendigkeitInput = {
    streitsache, vermoegensrechtlich, streitwertCHF: sw,
    glgBetroffen: glg, gerichtsstandsvereinbarung: gsv,
    beklagteAuslandOderUnbekannt: auslandUnbekannt,
    mieteUnterfall, deliktUnterfall, persoenlichkeitUnterfall: persU,
    beklagteImHR, klaegerImHR, geschaeftlicheTaetigkeit: beklagteImHR,
    ipUnterfall, bundKlagerecht,
  };
  zivilN++;
  let r;
  try { r = bestimmeZustaendigkeit(input); } catch (e) { melde('Z-THROW', input, String(e)); continue; }
  const s = r.schlichtung;
  // I1 · obligatorisch ⊕ entfaelltGrund
  if (s.obligatorisch && s.entfaelltGrund !== null) melde('Z-I1a', input, 'obligatorisch UND entfaelltGrund gesetzt');
  if (!s.obligatorisch && s.entfaelltGrund === null) melde('Z-I1b', input, 'nicht obligatorisch OHNE Grund');
  // I2 · eingabeArt ↔ Schlichtungspflicht
  if (r.eingabeArt === 'schlichtungsgesuch' && !s.obligatorisch) melde('Z-I2a', input, 'Gesuch trotz entfallener Schlichtung');
  if (r.eingabeArt === 'klage_direkt' && s.obligatorisch) melde('Z-I2b', input, 'Klage direkt trotz Schlichtungspflicht');
  if (streitsache === 'scheidung' && r.eingabeArt !== 'scheidungsbegehren_oder_klage') melde('Z-I2c', input, 'Scheidung ohne Scheidungs-Eingabeart');
  // I3 · kostenlos nur mit Schlichtung + Grund-Kopplung
  if (s.kostenlos !== (s.kostenlosGrund !== null)) melde('Z-I3a', input, 'kostenlos ↮ kostenlosGrund');
  if (s.kostenlos && !s.obligatorisch) melde('Z-I3b', input, 'kostenlos ohne Schlichtungsverfahren');
  // I4 · gemeinsamer Verzicht
  if (s.verzichtGemeinsam && !(s.obligatorisch && sw !== null && sw >= ZPO_SCHWELLEN.VERZICHT_GEMEINSAM)) melde('Z-I4', input, 'verzichtGemeinsam ohne Voraussetzungen');
  // I5 · Entscheidkompetenzen ↔ Schwellen + Schlichtung
  if (r.entscheidkompetenz.entscheidAufAntrag && !(s.obligatorisch && sw !== null && sw <= ZPO_SCHWELLEN.ENTSCHEID_AUF_ANTRAG)) melde('Z-I5a', input, 'entscheidAufAntrag ausserhalb Art. 212');
  if (r.entscheidkompetenz.entscheidvorschlag && !s.obligatorisch) melde('Z-I5b', input, 'Urteilsvorschlag ohne Schlichtung');
  // I6/I7 · einzige Instanz (Art. 5) — lit. a–c unbedingt; UWG >30k ODER Bund-Klagerecht; lit. f nur >30k
  const einzigeErwartet = streitsache === 'ip_wettbewerb'
    && ((ipUnterfall ?? 'ip_kartell_firma') === 'ip_kartell_firma'
      || (sw !== null && sw > ZPO_SCHWELLEN.VEREINFACHT)
      || (ipUnterfall === 'uwg' && bundKlagerecht));
  if (einzigeErwartet) {
    if (s.obligatorisch) melde('Z-I7a', input, 'Art. 5: Schlichtung müsste entfallen (199 III)');
    if (r.verfahrensart === 'vereinfacht') melde('Z-I7b', input, 'Art. 5: vereinfacht ausgeschlossen (243 III)');
    if (r.eingabeArt !== 'klage_direkt') melde('Z-I7c', input, 'Art. 5: Eingabe muss Klage direkt sein');
  }
  // I8 · Gewaltschutz
  if (streitsache === 'persoenlichkeit' && persU === 'gewaltschutz') {
    if (s.obligatorisch) melde('Z-I8a', input, 'Gewaltschutz: 198 abis verlangt Entfall');
    if (r.verfahrensart !== 'vereinfacht') melde('Z-I8b', input, 'Gewaltschutz: 243 II b verlangt vereinfacht');
  }
  // I9 · Struktur-Invarianten
  if (r.rechenweg.length === 0 || r.normverweise.length === 0 || !r.oertlich.gerichtsstand) melde('Z-I9', input, 'leere Pflichtstruktur');
  if (r.oertlich.teilzwingend !== (r.oertlich.bindung === 'teilzwingend')) melde('Z-I9b', input, 'teilzwingend-Flag ↮ bindung');
  // I10 · vereinfacht nur im 243-Rahmen
  if (r.verfahrensart === 'vereinfacht' && vermoegensrechtlich && sw !== null && sw > ZPO_SCHWELLEN.VEREINFACHT) {
    const streitwertunabhaengig = ['miete_wohn_geschaeft','arbeit','persoenlichkeit'].includes(streitsache) || glg;
    if (!streitwertunabhaengig) melde('Z-I10', input, 'vereinfacht über 30k ohne 243-II-Grund');
  }
  // I11 · GSV-Konsistenz: zwingend ⇒ Unwirksamkeits-Warnung, keine Pro-GSV-Weiche
  if (gsv && r.oertlich.bindung === 'zwingend') {
    if (!r.warnungen.some((w) => w.toLowerCase().includes('unwirksam'))) melde('Z-I11a', input, 'GSV bei zwingendem GS ohne Unwirksamkeits-Warnung');
  }
  // I12 · Fahrplan-Kreuzkonsistenz
  const fp = fahrplanSchritte(r, { vorlageVerfuegbar: false, stelleBekannt: false });
  if (r.eingabeArt === 'schlichtungsgesuch') {
    if (fp.length !== 4) melde('Z-I12a', input, `Schlichtungsweg mit ${fp.length}≠4 Schritten`);
    if (r.entscheidkompetenz.entscheidAufAntrag && !fp[2].text.includes('212')) melde('Z-I12b', input, 'Fahrplan verschweigt Art.-212-Kompetenz');
    if (!r.entscheidkompetenz.entscheidAufAntrag && fp[2].text.includes('212')) melde('Z-I12c', input, 'Fahrplan behauptet Art.-212 zu Unrecht');
    if (fp[3].titel.includes('vereinfachten') !== (r.verfahrensart === 'vereinfacht')) melde('Z-I12d', input, 'Fahrplan-Verfahrensart ↮ Engine');
  } else if (fp.length !== 3 && r.eingabeArt === 'klage_direkt') melde('Z-I12e', input, `Direktklage mit ${fp.length}≠3 Schritten`);
  // I13 · Rechtsmittel-Kreuzkonsistenz
  const rm = bestimmeRechtsmittel(input);
  if ((rm.kantonal === 'entfaellt_einzige_instanz') !== einzigeErwartet) melde('Z-I13a', input, 'einzige Instanz ↮ Rechtsmittel-Entfall');
  if (vermoegensrechtlich && sw !== null && !einzigeErwartet) {
    const erwartet = sw >= RECHTSMITTEL_SCHWELLEN.BERUFUNG_MIN ? 'berufung' : 'beschwerde';
    if (rm.kantonal !== erwartet) melde('Z-I13b', input, `kantonal=${rm.kantonal}, erwartet ${erwartet}`);
    const grenze = ['arbeit','miete_wohn_geschaeft'].includes(streitsache) ? BGER_SCHWELLEN.MIETE_ARBEIT : BGER_SCHWELLEN.UEBRIGE;
    if ((rm.bger === 'zulaessig') !== (sw >= grenze)) melde('Z-I13c', input, `bger=${rm.bger} bei sw=${sw}, Grenze ${grenze}`);
  }
  if (!vermoegensrechtlich && !einzigeErwartet && rm.kantonal !== 'berufung') melde('Z-I13d', input, 'nicht vermögensrechtlich ≠ Berufung');
  // Determinismus
  if (JSON.stringify(r) !== JSON.stringify(bestimmeZustaendigkeit(input))) melde('Z-DET', input, 'nicht deterministisch');
}

// ═══ 2 · SCHKG — voller Raster ═══
const ANLIEGEN: SchkgInput['anliegen'][] = ['betreibung_einleiten','rechtsoeffnung','aberkennungsklage','anerkennungsklage','rueckforderung','feststellung','widerspruch','kollokation','arrest','konkursbegehren','beschwerde_amt'];
const SCHULDNER: SchkgInput['schuldnerTyp'][] = ['natuerlich_wohnsitz','natuerlich_ohne_wohnsitz','jur_person_hr','jur_person_nicht_hr','erbschaft','stockwerkeigentuemer','ausland_niederlassung'];
let schkgN = 0;
for (const anliegen of ANLIEGEN)
for (const schuldnerTyp of SCHULDNER)
for (const pfand of ['kein','faustpfand','grundpfand'] as const)
for (const arrestGelegt of [false, true])
for (const forderungCHF of [null, 0, 100, 100.01, 9_999, 1_000_000, 5_000_000])
for (const wk of anliegen === 'widerspruch' ? (['gewahrsam_schuldner','gewahrsam_dritter_ch','gewahrsam_dritter_ausland','grundstueck'] as const) : ([undefined] as const))
for (const ki of anliegen === 'kollokation' ? (['pfaendung','konkurs'] as const) : ([undefined] as const))
for (const ro of anliegen === 'rechtsoeffnung' ? (['provisorisch','definitiv'] as const) : ([undefined] as const)) {
  const input: SchkgInput = { anliegen, schuldnerTyp, pfand, arrestGelegt, forderungCHF, widerspruchKonstellation: wk, kollokationIn: ki, rechtsoeffnungArt: ro };
  schkgN++;
  let r;
  try { r = bestimmeSchkgZustaendigkeit(input); } catch (e) { melde('S-THROW', input, String(e)); continue; }
  // S1 · Grundpfand: zwingend, kein Wahltext, kein Arrest-Zusatz
  if (pfand === 'grundpfand') {
    if (!r.betreibungsort.text.includes('ZWINGEND')) melde('S-I1a', input, 'Grundpfand ohne ZWINGEND');
    if (r.betreibungsort.text.includes('nach Wahl') || r.betreibungsort.text.includes('WAHLWEISE') || r.betreibungsort.text.includes('Arrestgegenstand')) melde('S-I1b', input, 'Grundpfand mit Wahl-/Arresttext');
  }
  // S2 · Arrest-Zusatz nur wenn gesetzt; Warnung gekoppelt
  if (r.betreibungsort.text.includes('Arrestgegenstand') !== (arrestGelegt && pfand !== 'grundpfand' && anliegen !== 'konkursbegehren')) melde('S-I2a', input, 'Arrest-Wahlort ↮ Input');
  if ((arrestGelegt && pfand !== 'grundpfand') !== r.warnungen.some((w) => w.includes('Art. 52 Satz 2'))) melde('S-I2b', input, 'Arrest-Warnung ↮ Input');
  // S2c · LOGIKWIDERSPRUCH-KANDIDAT: Konkursbegehren + Arrest-Wahlort in derselben Auskunft
  if (anliegen === 'konkursbegehren' && r.betreibungsort.text.includes('WAHLWEISE am Ort des Arrestgegenstands')) melde('S-I2c', input, 'Konkursbegehren zeigt Arrest-WAHLORT im Betreibungsort (Art. 52 S. 2 verbietet genau das)');
  // S3 · Kosten nur bei Einleitung; Gebühr monoton
  if ((r.kostenZahlungsbefehl !== null) !== (anliegen === 'betreibung_einleiten' && forderungCHF !== null)) melde('S-I3', input, 'ZB-Gebühr ↮ Anliegen/Forderung');
  // S4 · Rechtsöffnung: prov ⇔ 83-Frist
  if (anliegen === 'rechtsoeffnung') {
    const hat83 = r.fristen.some((f) => f.norm.includes('83'));
    if (hat83 !== (ro !== 'definitiv')) melde('S-I4', input, '83-II-Frist ↮ RO-Art');
  }
  // S5 · Anerkennungsklage: KEIN Betreibungsort-Forum
  if (anliegen === 'anerkennungsklage' && r.forum.stelle.includes('Betreibungsortes')) melde('S-I5', input, 'Art. 79 mit SchKG-Forum');
  // S6 · kritische Fristen tragen Norm; jederzeit nie kritisch
  for (const f of r.fristen) {
    if (f.frist.includes('jederzeit') && f.kritisch) melde('S-I6', input, `«jederzeit» als kritisch: ${f.label}`);
  }
  // S7 · Beschwerde: Aufsicht, nicht Gericht
  if (anliegen === 'beschwerde_amt' && r.forum.stelle.toLowerCase().includes('gericht des betreibungsortes')) melde('S-I7', input, 'Aufsichtsbeschwerde ans Gericht geroutet');
  if (JSON.stringify(r) !== JSON.stringify(bestimmeSchkgZustaendigkeit(input))) melde('S-DET', input, 'nicht deterministisch');
}
// Gebühr: Monotonie über feines Raster
let letzte = -1;
for (let f = 0; f <= 1_200_000; f += 997) {
  const g = gebuehrZahlungsbefehl(f).gebuehrCHF;
  if (g < letzte) melde('S-GEB', { f }, `Gebühr fällt: ${letzte}→${g}`);
  letzte = g;
}

// ═══ 3 · STRAF — voller Raster ═══
let strafN = 0;
for (const anliegen of ['anzeige','gerichtsstand'] as const)
for (const tatort of ['bekannt','nur_erfolgsort','mehrere_orte','ausland_oder_ungewiss'] as const)
for (const kaskade32 of tatort === 'ausland_oder_ungewiss' ? (['wohnsitz','aufenthalt','heimatort','ergreifungsort','auslieferung'] as const) : ([undefined] as const))
for (const spezialforum of ['kein','medien','schkg_delikt','unternehmen','einziehung'] as const)
for (const beteiligung of ['allein','teilnehmer','mittaeter'] as const)
for (const mehrereTaten of [false, true])
for (const antragsdelikt of [false, true])
for (const uebertretung of [false, true])
for (const bund of [false, true]) {
  const input: StrafInput = { anliegen, tatort, kaskade32, spezialforum, beteiligung, mehrereTatenVerschOrte: mehrereTaten, antragsdelikt, uebertretung, moeglichesBundesdelikt: bund };
  strafN++;
  let r;
  try { r = bestimmeStrafZustaendigkeit(input); } catch (e) { melde('T-THROW', input, String(e)); continue; }
  // T1 · Spezialforum verdrängt Tatort vollständig
  if (spezialforum !== 'kein') {
    if (r.forum.normen[0].artikel.includes('31') || r.forum.normen[0].artikel.includes('32')) melde('T-I1', input, 'Spezialforum nicht vorrangig');
  } else {
    const erwartet = tatort === 'ausland_oder_ungewiss' ? '32' : '31';
    if (!r.forum.normen[0].artikel.includes(erwartet)) melde('T-I1b', input, `Forum-Norm ≠ Art. ${erwartet}`);
  }
  // T2 · Antragsfrist exakt gekoppelt
  const fk = r.fristen.filter((f) => f.kritisch).length;
  if (anliegen === 'anzeige' && antragsdelikt && fk !== 1) melde('T-I2a', input, 'Antragsdelikt ohne genau 1 kritische Frist');
  // T-I2b nachgeführt 7.6.2026: M-6 (`6e1acb6`, deklarierte fachliche
  // Änderung §6.3) gibt dem Gerichtsstands-Strang IMMER genau die
  // 10-Tage-Beschwerdefrist Art. 41 Abs. 2 StPO als Frist-Objekt mit.
  if (anliegen === 'gerichtsstand') {
    if (!(r.fristen.length === 1 && r.fristen[0].norm === 'Art. 41 Abs. 2 StPO')) melde('T-I2b', input, 'Gerichtsstand ohne (genau) die Art.-41-II-Frist');
  } else if (!(anliegen === 'anzeige' && antragsdelikt) && r.fristen.length !== 0) melde('T-I2b', input, 'Fristen ohne Antragsdelikt/Anzeige');
  // T3 · Übertretung ⇒ Behörden-Hinweis + Normen
  if (uebertretung !== r.behoerdeTyp.includes('ÜBERTRETUNGSSTRAFBEHÖRDE')) melde('T-I3', input, 'Übertretungs-Flag ↮ Behördentyp');
  // T4 · Bund-Weiche ⇒ Warnung; sonst keine
  if (bund !== r.warnungen.some((w) => w.includes('BUNDESGERICHTSBARKEIT'))) melde('T-I4', input, 'Bund-Flag ↮ BA-Warnung');
  // T5 · Basis-Weichen 38/41/42 immer; Beteiligungs-/34-Weichen exakt gekoppelt
  const w38 = r.weichen.filter((w) => w.includes('Art. 38 Abs. 1')).length;
  const w42 = r.weichen.filter((w) => w.includes('perpetuatio')).length;
  if (w38 !== 1 || w42 !== 1) melde('T-I5a', input, 'Basis-Weichen 38/42 fehlen/doppelt');
  if ((beteiligung === 'teilnehmer') !== r.weichen.some((w) => w.includes('Täterschaft zieht') || w.includes('Forum der Haupttat'))) melde('T-I5b', input, 'Teilnahme-Weiche ↮ Input');
  if (mehrereTaten !== r.weichen.some((w) => w.includes('SCHWERSTEN STRAFE'))) melde('T-I5c', input, '34-Weiche ↮ Input');
  // T6 · Fahrplan je Anliegen nicht leer + anzeige-spezifisch
  if (anliegen === 'anzeige' && !r.fahrplan[0].text.includes('301')) melde('T-I6', input, 'Anzeige-Fahrplan ohne Art. 301');
  if (JSON.stringify(r) !== JSON.stringify(bestimmeStrafZustaendigkeit(input))) melde('T-DET', input, 'nicht deterministisch');
}

// ── AG-Gründungsmappe (Perfektions-Runde 13, 7.6.2026): Invarianten über
// den vollen Weichen-Raum — verstetigt den 4608er-Sweep des Sammel-Bug-
// Checks als Dauerwerkzeug. Invarianten: keine Exception · Dokument-IDs
// eindeutig · blocker == blockerDetails.map(text) · ohne Blocker: römische
// Urkunden-Ziffern lückenlos, Statuten-Artikel fortlaufend, ENTWURF nur
// für Statuten/Errichtungsakt/Nachtrag/Grundstücks-Sacheinlagevertrag.
import { agDokumentmappe, AG_DOK_DEFAULTS, type AgDokAntworten } from '../src/lib/vorlagen/gruendungAgDokumente';
import { fmtCHF } from '../src/lib/vorlagen/datum';

const ROEMISCH_OK = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
let agN = 0;
const agBasis = (): AgDokAntworten => ({
  einlageArt: 'bar', besondereVorteile: false, optingOut: true,
  eigeneBueros: true, immobilienHauptzweck: false, inhaberaktien: false,
  fremdwaehrung: false, bankInUrkundeGenannt: true, chWohnsitzVertretung: true,
  leistungenChf: undefined,
  ...AG_DOK_DEFAULTS,
  firma: 'Sweep AG', sitz: 'Zürich', kanton: 'ZH', zweck: 'Beteiligungen',
  gruender: [{ name: 'A', angaben: 'von Basel, in Zürich', anzahl: '100', liberierung: '' }],
  verwaltungsraete: [{ name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift' }],
  bankName: 'ZKB', bankOrt: 'Zürich', rechtsdomizilAdresse: 'W 1',
  domizilhalterName: 'D AG', domizilhalterAdresse: 'X 1, 8000 Zürich',
  revisionsstelleName: 'R AG', revisionsstelleSitz: 'Zürich', revisorName: 'R AG',
  ort: 'Zürich', datum: '2026-06-15',
});

for (const einlageArt of ['bar', 'sacheinlage', 'verrechnung', 'gemischt'] as const)
for (const optingOut of [true, false])
for (const eigeneBueros of [true, false])
for (const konstituierungInUrkunde of [false, true])
for (const domizilNurAnmeldung of [false, true])
for (const annahmeInUrkunde of [false, true])
for (const fremdwaehrung of [false, true])
for (const agio of [false, true])
for (const liberierung of ['100', '50', 'individuell'] as const)
for (const zweiGruender of [false, true]) {
  agN++;
  const a = agBasis();
  a.einlageArt = einlageArt; a.optingOut = optingOut; a.eigeneBueros = eigeneBueros;
  a.konstituierungInUrkunde = konstituierungInUrkunde; a.domizilNurAnmeldung = domizilNurAnmeldung;
  a.fremdwaehrung = fremdwaehrung;
  if (fremdwaehrung) { a.waehrung = 'EUR'; a.kursChf = '0.93'; a.kursQuelle = 'ZKB'; a.aktienkapitalChf = "120'000"; a.anzahlAktien = '120'; a.gruender[0].anzahl = '120'; }
  if (agio) a.ausgabebetragChf = "1'200";
  a.liberierungProzent = liberierung === 'individuell' ? '100' : liberierung;
  if (zweiGruender) {
    a.aktienkapitalChf = fremdwaehrung ? "240'000" : "200'000";
    a.anzahlAktien = fremdwaehrung ? '240' : '200';
    a.gruender = [
      { name: 'A', angaben: 'von Basel, in Zürich', anzahl: fremdwaehrung ? '140' : '120', liberierung: liberierung === 'individuell' ? '50' : '' },
      { name: 'B', angaben: 'von Bern, in Bern', anzahl: '100', liberierung: '' },
    ];
    a.verwaltungsraete = [
      { name: 'A', herkunft: 'Basel', wohnort: 'Zürich', adresse: 'W 1', praesident: true, zeichnungsArt: 'einzelunterschrift', annahmeInUrkunde },
      { name: 'B', herkunft: 'Bern', wohnort: 'Bern', adresse: 'W 2', praesident: false, zeichnungsArt: 'kollektivzuzweien' },
    ];
  } else {
    a.verwaltungsraete[0].annahmeInUrkunde = annahmeInUrkunde;
    if (liberierung === 'individuell') a.gruender[0].liberierung = '60';
  }
  if (einlageArt === 'sacheinlage' || einlageArt === 'gemischt') {
    a.sacheinlagen = [{
      typ: 'sachgesamtheit', bezeichnung: 'eine Anlage', belegDatum: '2026-06-01',
      wertChf: agio ? "60'000" : "50'000", grundstueck: false, einlegerName: 'A', aktienAnzahl: '50',
      gutschriftChf: '', zustand: 'gut', imHrEingetragen: false, cheNr: '',
      aktivenChf: '', passivenChf: '', rueckwirkungDatum: '',
    }];
    if (einlageArt === 'sacheinlage') {
      // reine Sacheinlage: alle Aktien decken
      a.sacheinlagen[0].aktienAnzahl = a.anzahlAktien;
      a.sacheinlagen[0].wertChf = String(Number(a.anzahlAktien) * 1000);
    }
  }
  if (einlageArt === 'verrechnung' || einlageArt === 'gemischt') {
    const n = einlageArt === 'verrechnung' ? Number(a.anzahlAktien) : 30;
    a.verrechnungen = [{ glaeubigerName: 'A', forderungChf: String(n * 1000), aktienAnzahl: String(n), begruendungTxt: 'Darlehen, fällig.' }];
  }
  pruefeAgInvarianten(a);
}

// ── AG-G: arithmetische GELD-Invariante (offene Härtung aus dem Sammel-
// Bug-Check 7.6.2026, Agent-1-Empfehlung): die Struktur-Invarianten fangen
// Zahlen-Mutationen nicht. Erwartungswerte hier als EIGENSTÄNDIGE Hand-
// rechnung aus den Eingaben (bewusst OHNE effektiveLiberierung — sonst
// zirkulär); geprüft wird, dass der Errichtungsakt-Text exakt die korrekt
// formatierten Beträge trägt. ──
function agGeldErwartung(a: AgDokAntworten) {
  const num = (s: string | undefined) => Number(String(s ?? '').replace(/['\u2019\s]/g, '')) || 0;
  const nennwert = num(a.nennwertChf);
  const anzahl = num(a.anzahlAktien);
  const kapital = num(a.aktienkapitalChf);
  const global = (a.liberierungProzent ?? '').trim() === '' ? 100 : num(a.liberierungProzent);
  const ausgabe = (a.ausgabebetragChf ?? '').trim() === '' ? nennwert : num(a.ausgabebetragChf);
  const agioJe = Math.max(0, ausgabe - nennwert);
  const mitSach = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
  const mitVerr = a.einlageArt === 'verrechnung' || a.einlageArt === 'gemischt';
  const q = (mitSach ? a.sacheinlagen : []).reduce((sum, x) => sum + num(x.aktienAnzahl), 0)
    + (mitVerr ? a.verrechnungen : []).reduce((sum, x) => sum + num(x.aktienAnzahl), 0);
  const bar = Math.max(0, anzahl - q);
  const individuell = a.gruender.some((g) => (g.liberierung ?? '').trim() !== '');
  // Sach-/Verrechnungsaktien gelten als voll liberiert (634/634a); der
  // globale Grad wirkt nur auf den Bar-Anteil. Individuelle Grade sind bei
  // qualifizierter Gründung per Gate gesperrt (blockerfreie Fälle: q=0).
  let einbezahlt: number;
  if (q > 0) einbezahlt = q * nennwert + bar * nennwert * (Math.min(global, 100) / 100);
  else if (individuell) einbezahlt = a.gruender
    .filter((g) => g.name.trim())
    .reduce((sum, g) => sum + num(g.anzahl) * nennwert
      * (((g.liberierung ?? '').trim() === '' ? global : num(g.liberierung)) / 100), 0);
  else einbezahlt = kapital * (global / 100);
  const barEinbezahlt = q > 0 ? bar * nennwert * (Math.min(global, 100) / 100) : einbezahlt;
  return { einbezahlt, barEinbezahlt, gesamt: einbezahlt + anzahl * agioJe, q, bar };
}

// Geteilte AG-Invarianten (P-Abschluss 7.6.2026: zweiter Sweep-Strang für
// die Stufe-2-Weichen nutzt dieselben Checks).
function pruefeAgInvarianten(a: AgDokAntworten) {
  try {
    const m = agDokumentmappe(a);
    if (m.gates.blocker.join('|') !== m.gates.blockerDetails.map((d) => d.text).join('|')) {
      melde('AG-I1', a, 'blocker != blockerDetails');
    }
    if (m.gates.blocker.length === 0) {
      const ids = m.dokumente.map((d) => d.id);
      if (new Set(ids).size !== ids.length) melde('AG-I2', a, `Dokument-IDs doppelt: ${ids.join(',')}`);
      const ea = m.dokumente.find((d) => d.id === 'errichtungsakt');
      if (!ea) melde('AG-I3', a, 'Errichtungsakt fehlt');
      else {
        const roem = ea.ergebnis.dokument.absaetze
          .map((x) => x.ueberschrift).filter((u): u is string => !!u && u !== 'Bestätigung der Urkundsperson')
          .map((u) => u.split('.')[0]);
        const erwartet = ROEMISCH_OK.slice(0, roem.length);
        if (roem.join(',') !== erwartet.join(',')) melde('AG-I4', a, `Urkunden-Ziffern lückenhaft: ${roem.join(',')}`);

        // AG-G1/G2/G3: Geld-Beträge im Errichtungsakt = Handrechnung.
        const eaText = ea.ergebnis.dokument.absaetze.map((x) => x.text).join(' ');
        const geld = agGeldErwartung(a);
        const code = a.fremdwaehrung ? a.waehrung : 'CHF';
        if (geld.q === 0) {
          // Bar-/Voll-Fall: «Einlagen von gesamthaft {code} {einbezahlt}»
          if (!eaText.includes(`${code} ${fmtCHF(String(geld.einbezahlt))}`)) {
            melde('AG-G1', a, `Einlagen-Betrag fehlt/falsch: erwartet ${code} ${fmtCHF(String(geld.einbezahlt))}`);
          }
        } else if (geld.bar > 0) {
          // Qualifiziert gemischt: Bar-Satz trägt den Bar-Anteil.
          if (!eaText.includes(`${code} ${fmtCHF(String(geld.barEinbezahlt))}`)) {
            melde('AG-G2', a, `Bar-Anteil fehlt/falsch: erwartet ${code} ${fmtCHF(String(geld.barEinbezahlt))}`);
          }
        }
        if (a.fremdwaehrung) {
          // FW-Gegenwert: geleistete Einlagen GESAMT × Kurs (Art. 621 Abs. 2).
          const kurs = Number(String(a.kursChf ?? '').replace(/['\s]/g, '')) || 0;
          if (!eaText.includes(`CHF ${fmtCHF(String(geld.gesamt * kurs))}`)) {
            melde('AG-G3', a, `FW-Gegenwert fehlt/falsch: erwartet CHF ${fmtCHF(String(geld.gesamt * kurs))}`);
          }
        }
      }
      const st = m.dokumente.find((d) => d.id === 'statuten');
      if (st) {
        const nums = st.ergebnis.dokument.absaetze
          .map((x) => x.ueberschrift).filter((u): u is string => !!u)
          .map((u) => Number(u.match(/^Art\. (\d+)/)?.[1] ?? NaN));
        if (nums.some((x, i) => x !== i + 1)) melde('AG-I5', a, `Statuten-Artikel nicht fortlaufend: ${nums.join(',')}`);
      }
      for (const d of m.dokumente) {
        const entwurfErlaubt = d.id === 'statuten' || d.id === 'errichtungsakt' || d.id === 'nachtrag' || d.id.startsWith('sacheinlagevertrag');
        if (d.ergebnis.dokument.ausgabeArt === 'entwurf' && !entwurfErlaubt) melde('AG-I6', a, `unerwarteter ENTWURF: ${d.id}`);
      }
    }
  } catch (e) {
    melde('AG-EX', a, `Exception: ${String(e)}`);
  }
}

// ── AG Stufe-2-Weichen (Perfektion P1–P4, 7.6.2026): Zusatzklauseln,
// Inhaberaktien, Kapitalband, bedingtes Kapital — eigener Strang, damit das
// Hauptgitter nicht um ×16 wächst. ──
for (const inhaberaktien of [false, true])
for (const schiedsklausel of [false, true])
for (const kapitalband of ['aus', 'erhoehen', 'beide'] as const)
for (const bedingtesKapital of [false, true])
for (const statutenUmfang of ['kurz', 'lang'] as const)
for (const optingOut of [true, false])
for (const gjErstes of [false, true]) {
  agN++;
  const a = agBasis();
  a.statutenUmfang = statutenUmfang;
  a.optingOut = optingOut;
  a.inhaberaktien = inhaberaktien;
  if (inhaberaktien) a.verwahrungsstelle = 'SIX SIS AG, Olten';
  a.schiedsklausel = schiedsklausel;
  if (schiedsklausel) a.schiedsOrt = 'Zürich';
  if (kapitalband !== 'aus') {
    a.kapitalband = true;
    a.kbRichtung = kapitalband;
    a.kbUntergrenze = kapitalband === 'erhoehen' ? "100'000" : "50'000";
    a.kbObergrenze = "150'000";
    a.kbEndeDatum = '2031-06-01';
  }
  if (bedingtesKapital) { a.bedingtesKapital = true; a.bkBetrag = "50'000"; a.bkKreis = 'den Arbeitnehmenden der Gesellschaft'; }
  a.gjErstesEnde = gjErstes ? '31. Dezember 2026' : '';
  pruefeAgInvarianten(a);

  // Zusätzliche Stufe-2-Invarianten
  const m = agDokumentmappe(a);
  const erwarteteBlocker = (kapitalband === 'beide' && optingOut)   // 653s IV
    || (inhaberaktien && statutenUmfang === 'lang');                 // P2-Erstausbau
  if (erwarteteBlocker && m.gates.blocker.length === 0) melde('AG-S1', a, 'erwarteter Stufe-2-Blocker fehlt');
  if (!erwarteteBlocker && m.gates.blocker.length > 0) melde('AG-S2', a, `unerwarteter Blocker: ${m.gates.blocker[0]}`);
  if (m.gates.blocker.length === 0) {
    const st = m.dokumente.find((d) => d.id === 'statuten');
    const stText = st?.ergebnis.dokument.absaetze.map((x) => `${x.ueberschrift ?? ''} ${x.text}`).join(' ') ?? '';
    // Klausel-Präsenz an den ÜBERSCHRIFTEN messen — der 704-Katalog der
    // Langfassung (ASL37) nennt «Kapitalband»/«bedingtes Kapital»/
    // «Schiedsklausel» auch OHNE die Klauseln (Gesetzeswortlaut).
    const stKoepfe = st?.ergebnis.dokument.absaetze.map((x) => x.ueberschrift ?? '').join(' | ') ?? '';
    if (inhaberaktien && !stText.includes('Inhaberaktien')) melde('AG-S3', a, 'Inhaberaktien-Weiche ohne Inhaber-Text');
    if (!inhaberaktien && stText.includes('Inhaberaktien')) melde('AG-S4', a, 'Inhaber-Text ohne Weiche');
    if (schiedsklausel !== stKoepfe.includes('Schiedsklausel')) melde('AG-S5', a, 'Schiedsklausel-Weiche ↮ Artikel');
    if ((kapitalband !== 'aus') !== stKoepfe.includes('Kapitalband')) melde('AG-S6', a, 'Kapitalband-Weiche ↮ Artikel');
    if (bedingtesKapital !== stKoepfe.includes('Bedingtes Kapital')) melde('AG-S7', a, 'BedingtesKapital-Weiche ↮ Artikel');
    if (gjErstes !== stText.includes('Das erste Geschäftsjahr endet am')) melde('AG-S8', a, 'gjErstesEnde-Weiche ↮ Text');
    if (kapitalband === 'erhoehen' && !stText.includes('Herabsetzung des Aktienkapitals innerhalb des Kapitalbands ist ausgeschlossen')) melde('AG-S9', a, 'Nur-Erhöhungs-Satz fehlt');
    // Unterschriftenblatt in jeder Mappe (P4)
    if (!m.dokumente.some((d) => d.id === 'unterschriftenbogen')) melde('AG-S10', a, 'Unterschriftenblatt fehlt');
  }
}

console.log(`Geprüft: Zivil ${zivilN} · SchKG ${schkgN} · Straf ${strafN} · AG-Mappe ${agN} Kombinationen`);
if (fehler.length === 0) console.log('KEINE WIDERSPRÜCHE');
else {
  const gruppen = new Map<string, { n: number; beispiel: string }>();
  for (const f of fehler) {
    const id = f.split(' :: ')[0];
    const g = gruppen.get(id) ?? { n: 0, beispiel: f };
    g.n++; gruppen.set(id, g);
  }
  console.log(`\n${fehler.length} VERLETZUNGEN in ${gruppen.size} Regeln:`);
  for (const [id, g] of gruppen) console.log(`\n■ ${id} (${g.n}×)\n  ${g.beispiel.slice(0, 400)}`);
  // P-Abschluss 7.6.2026: Verletzungen müssen das Tor BRECHEN (Exit ≠ 0) —
  // bisher exitete der Sweep auch mit Befunden mit 0 (CI-Lücke).
  process.exitCode = 1;
}
