// ─── Fundamentaler Logik-Sweep: kompletter Eingaberaum × Widerspruchsregeln ──
import { bestimmeZustaendigkeit, bestimmeRechtsmittel, ZPO_SCHWELLEN, RECHTSMITTEL_SCHWELLEN,
  type ZustaendigkeitInput, type Streitsache } from '../src/lib/zustaendigkeit';
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
for (const klaegerImHR of beklagteImHR ? [false, true] : [false]) {
  const input: ZustaendigkeitInput = {
    streitsache, vermoegensrechtlich, streitwertCHF: sw,
    glgBetroffen: glg, gerichtsstandsvereinbarung: gsv,
    beklagteAuslandOderUnbekannt: auslandUnbekannt,
    mieteUnterfall, deliktUnterfall, persoenlichkeitUnterfall: persU,
    beklagteImHR, klaegerImHR, geschaeftlicheTaetigkeit: beklagteImHR,
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
  // I6/I7 · einzige Instanz (Art. 5)
  if (streitsache === 'ip_wettbewerb') {
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
  if ((rm.kantonal === 'entfaellt_einzige_instanz') !== (streitsache === 'ip_wettbewerb')) melde('Z-I13a', input, 'einzige Instanz ↮ Rechtsmittel-Entfall');
  if (vermoegensrechtlich && sw !== null && streitsache !== 'ip_wettbewerb') {
    const erwartet = sw >= RECHTSMITTEL_SCHWELLEN.BERUFUNG_MIN ? 'berufung' : 'beschwerde';
    if (rm.kantonal !== erwartet) melde('Z-I13b', input, `kantonal=${rm.kantonal}, erwartet ${erwartet}`);
    const grenze = ['arbeit','miete_wohn_geschaeft'].includes(streitsache) ? RECHTSMITTEL_SCHWELLEN.BGER_MIETE_ARBEIT : RECHTSMITTEL_SCHWELLEN.BGER_UEBRIGE;
    if ((rm.bger === 'zulaessig') !== (sw >= grenze)) melde('Z-I13c', input, `bger=${rm.bger} bei sw=${sw}, Grenze ${grenze}`);
  }
  if (!vermoegensrechtlich && streitsache !== 'ip_wettbewerb' && rm.kantonal !== 'berufung') melde('Z-I13d', input, 'nicht vermögensrechtlich ≠ Berufung');
  // Determinismus
  if (JSON.stringify(r) !== JSON.stringify(bestimmeZustaendigkeit(input))) melde('Z-DET', input, 'nicht deterministisch');
}

// ═══ 2 · SCHKG — voller Raster ═══
const ANLIEGEN: SchkgInput['anliegen'][] = ['betreibung_einleiten','rechtsoeffnung','aberkennungsklage','anerkennungsklage','rueckforderung','feststellung','widerspruch','kollokation','arrest','konkursbegehren','beschwerde_amt'];
const SCHULDNER: SchkgInput['schuldnerTyp'][] = ['natuerlich_wohnsitz','natuerlich_ohne_wohnsitz','jur_person_hr','jur_person_nicht_hr','erbschaft','ausland_niederlassung'];
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
  if (!(anliegen === 'anzeige' && antragsdelikt) && r.fristen.length !== 0) melde('T-I2b', input, 'Fristen ohne Antragsdelikt/Anzeige');
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

console.log(`Geprüft: Zivil ${zivilN} · SchKG ${schkgN} · Straf ${strafN} Kombinationen`);
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
}
