// ─── Norm-Query-Parser (Cmd/Ctrl-K, W2·5d G4 · FAHRPLAN-GESETZES-UX §4.2) ────
//
// Deterministischer Parser (§2 — kein LLM, keine Fuzzy-Heuristik), der eine
// Norm-Zitat-Eingabe («OR 257d», «Art. 5 AIG», «ZGB 684 II», «VMWG») auf einen
// direkten Deep-Link in den Leser auflöst. KEIN neuer Suchindex (K10): die
// Erlass-Auflösung läuft über die BESTEHENDE Registry (Browse-Manifest, das die
// Befehlspalette ohnehin lazy lädt). Die Artikel-Token-Ableitung ist kongruent
// zu passus.ts/fedlex.ts (Buchstaben-Artikel 257d → art-257_d, 49abis →
// art-49_a_bis). Reine Ableitung (§3) — keine Rechtslogik.
//
// Sicherheit gegen Fehl-Sprung (Akzeptanz §4.2): der Parser gibt NUR dann ein
// Ziel zurück, wenn ein Kürzel EINDEUTIG aufgelöst wird UND — sofern ein Artikel
// genannt ist — der Rest der Eingabe vollständig als Artikel-Designator (Art./§/
// Abs./lit./Ziff./röm.) parst. Freitext («Kündigung», «Mietzins 2024») liefert
// null → die Eingabe fällt in die normale Suche.

/** Minimal-Sicht eines Erlasses für die Auflösung (BrowseErlass ist zuweisbar). */
export interface NormErlass {
  key: string;
  ebene: 'bund' | 'kanton';
  kanton: string | null;
  kuerzel: string;
  titel: string;
  status: 'snapshot' | 'pdf-embed' | 'nur-live-link';
}

export interface NormQueryTreffer {
  erlass: NormErlass;
  /** Artikel-Anker-Token (z. B. «257_d») oder null für einen reinen Erlass-Sprung. */
  artikelToken: string | null;
  /** Anzeige-Form des Artikels («257d») — nur gesetzt, wenn artikelToken gesetzt ist. */
  artikelAnzeige: string | null;
  /** Fertiger Deep-Link inkl. #art-Anker (nur bei snapshot + Artikel). */
  href: string;
}

/** Vorgebauter Auflösungs-Index (in der Palette per useMemo einmal pro Manifest). */
export interface NormIndex {
  /** normalisiertes Kürzel/Key → Erlasse (Kollisionen möglich, z. B. «StG»). */
  map: Map<string, NormErlass[]>;
  /** Vorhandene Kantonskürzel (2-Buchstaben-Codes) für die Disambiguierung. */
  kantone: Set<string>;
}

// Kürzel/Codes vergleichsfest machen: Grossschreibung, Diakritika weg
// (Ö→O, kongruent für gespeicherten Wert UND Eingabe), nur A–Z0–9. So matcht
// «GebV SchKG» = «GEBVSCHKG», «ArGV 1» = «ARGV1», «BGÖ» = «BGO».
// Exportiert (W2·10-UI-NAV/N0b): dieselbe Normalisierung dient der
// Erlass-Key-Auflösung + den Fuzzy-Vorschlägen der Fehlseite (kein neuer Index).
export function norm(s: string): string {
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

// Lateinische Suffixe zuerst (bis/ter/…), sonst würde «1bis» zu «1_b» verstümmelt
// (kongruent passus.ts:16/fedlex). Gross-/Kleinschreibung egal.
const SUFFIX = /^(\d+)([a-z])?(bis|ter|quater|quinquies)?$/;

// Artikel-Teil-Grammatik: optionaler Designator (Art./Artikel/§/Par.) + Nummer
// mit optionalem Buchstaben-/Latein-Suffix, danach optional Abs./lit./Ziff. und
// eine römische Ziffer (Absatz-Notation «II»). ANKER ^…$ — steht ein Fremdwort
// im Rest, schlägt der Match fehl → kein Fehl-Sprung (Freitext → Suche).
const ARTIKEL_TEIL =
  /^(?:art(?:ikel)?\.?|§|par(?:agraf|agraph)?\.?)?\s*(\d+[a-z]?(?:bis|ter|quater|quinquies)?)\s*(?:abs\.?\s*\w+)?\s*(?:(?:lit\.?|bst\.?|ziff\.?|ziffer)\s*\w+)?\s*(?:[ivxlcdm]+\.?)?\s*$/i;

/** Baut den Auflösungs-Index aus der Erlass-Liste (Browse-Manifest). */
export function baueNormIndex(erlasse: readonly NormErlass[]): NormIndex {
  const map = new Map<string, NormErlass[]>();
  const kantone = new Set<string>();
  for (const e of erlasse) {
    if (e.kanton) kantone.add(norm(e.kanton));
    // Sowohl Anzeige-Kürzel als auch Routen-Key indexieren (z. B. «GebV SchKG»
    // und «GEBV_SCHKG» → beide «GEBVSCHKG»). Set dedupt gleiche Normalform.
    for (const k of new Set([norm(e.kuerzel), norm(e.key)])) {
      if (!k) continue;
      const arr = map.get(k);
      if (arr) { if (!arr.includes(e)) arr.push(e); }
      else map.set(k, [e]);
    }
  }
  return { map, kantone };
}

// FR/IT-Kürzel-Aliasse (O-4 · UI-NAV S2/Z3 — billigster Romandie/Ticino-Hebel):
// die welschen/italienischen amtlichen Kurztitel der Bundeserlasse zeigen auf das
// vorhandene deutsche Erlass-Kürzel. Normalisierte Alias-Form (norm(): Grosschrift,
// Diakritika + Interpunktion weg → «Cst.»=«Cst»=CST, «Cost.»=COST) → normalisierte
// Ziel-Kürzel-Form (= norm(e.key)/norm(e.kuerzel) im Register).
//
// QUELLE (§7, verifiziert 16.7.2026): amtlicher `jolux:titleShort` je Sprach-
// fassung (DEU/FRA/ITA) der IN-KRAFT-Konsolidierung bei Fedlex SPARQL, je Eintrag
// mit SR-Nummer belegt (Belege im PR-Body/Gegenprüfung). Die in-force-Filterung
// ist entscheidend: dieselbe SR-Nummer trägt aufgehobene Vorgänger mit gleichem
// DE-Kürzel, aber ABWEICHENDER FR/IT-Form (z.B. KG-IT alt «LC» → heute «LCart»).
//
// Wo FR und IT abweichen (37 Erlasse), stehen ZWEI Zeilen auf dasselbe Ziel
// (z.B. SchKG: LP/LEF). Kollisionsprüfung durchgeführt: KEIN FR/IT-Kürzel
// entspricht einem deutschen Register-Kürzel eines ANDEREN Erlasses. Der Alias
// greift ohnehin NUR als Fallback: existiert ein echter Erlass mit dem Kürzel,
// gewinnt er (holeErlasse prüft die Karte zuerst); «StG»-Bund/Kanton-Vorrang
// (waehle) bleibt. Kein amtlicher FR/IT-Kurztitel bei Fedlex: TxG (SR 810.21),
// CO2-Gesetz (SR 641.71) — daher bewusst KEIN Alias.
const ALIAS: Readonly<Record<string, string>> = {
  // ── Zivil-/Handels-/Immaterialgüterrecht ──
  CO: 'OR',        // Code des obligations / Codice delle obbligazioni (220)
  CC: 'ZGB',       // Code civil / Codice civile (210)
  LCA: 'VVG',      // Loi/Legge sur le contrat d'assurance (221.229.1)
  LFUS: 'FUSG',    // Loi/Legge sur la fusion (221.301)
  ORC: 'HREGV',    // Ordonnance/Ordinanza sur le registre du commerce (221.411)
  LDA: 'URG',      // Loi/Legge sur le droit d'auteur (231.1)
  LPM: 'MSCHG',    // Loi/Legge sur la protection des marques (232.11)
  LBI: 'PATG',     // Loi/Legge sur les brevets d'invention (232.14)
  LDES: 'DESG',    // Loi/Legge sur les designs (232.12)
  LPART: 'PARTG',  // Loi sur le partenariat (fr, 211.231)
  LUD: 'PARTG',    // Legge sull'unione domestica registrata (it, 211.231)
  LDIP: 'IPRG',    // Loi/Legge sur le droit international privé (291)
  LCC: 'KKG',      // Loi/Legge sur le crédit à la consommation (221.214.1)
  // ── Straf-/Strafprozess-/Rechtshilferecht ──
  CP: 'STGB',      // Code pénal / Codice penale (311.0)
  DPMIN: 'JSTG',   // Droit pénal des mineurs / Diritto penale minorile (311.1)
  LSTUP: 'BETMG',  // Loi/Legge sur les stupéfiants (812.121)
  DPA: 'VSTRR',    // Droit pénal administratif / Diritto penale amministrativo (313.0)
  CPM: 'MSTG',     // Code pénal militaire / Codice penale militare (321.0)
  EIMP: 'IRSG',    // Entraide pénale internationale (fr, 351.1)
  AIMP: 'IRSG',    // Assistenza internazionale in materia penale (it, 351.1)
  LAVI: 'OHG',     // Loi sur l'aide aux victimes (fr, 312.5)
  LAV: 'OHG',      // Legge sull'aiuto alle vittime (it, 312.5)
  // ── Verfahren / Gerichtsorganisation ──
  CPC: 'ZPO',      // Code de procédure civile / Codice di procedura civile (272)
  CPP: 'STPO',     // Code de procédure pénale / Codice di procedura penale (312.0)
  PPMIN: 'JSTPO',  // Procédure pénale des mineurs / Procedura penale minorile (312.1)
  LTF: 'BGG',      // Loi/Legge sur le Tribunal fédéral (173.110)
  LTAF: 'VGG',     // Loi/Legge sur le Tribunal administratif fédéral (173.32)
  LOAP: 'STBOG',   // Loi/Legge sur l'organisation des autorités pénales (173.71)
  PA: 'VWVG',      // Procédure administrative / Procedura amministrativa (172.021)
  LP: 'SCHKG',     // Loi sur la poursuite pour dettes et la faillite (fr, 281.1)
  LEF: 'SCHKG',    // Legge esecuzione e fallimento (it, 281.1)
  LLCA: 'BGFA',    // Loi/Legge sur la libre circulation des avocats (935.61)
  // ── Verfassung / Staat / Politische Rechte ──
  CST: 'BV',       // Constitution fédérale (fr «Cst.», 101)
  COST: 'BV',      // Costituzione federale (it «Cost.», 101)
  LDP: 'BPR',      // Loi/Legge sur les droits politiques (161.1)
  LPARL: 'PARLG',  // Loi/Legge sur le Parlement (171.10)
  LOGA: 'RVOG',    // Loi/Legge sur l'organisation du gouvernement (172.010)
  LPUBL: 'PUBLG',  // Loi sur les publications officielles (fr, 170.512)
  LPUBB: 'PUBLG',  // Legge sulle pubblicazioni ufficiali (it, 170.512)
  LPERS: 'BPG',    // Loi/Legge sur le personnel de la Confédération (172.220.1)
  LTRANS: 'BGOE',  // Loi sur la transparence (fr, 152.3)
  LTRAS: 'BGOE',   // Legge sulla trasparenza (it, 152.3)
  LN: 'BUEG',      // Loi sur la nationalité (fr, 141.0)
  LCIT: 'BUEG',    // Legge sulla cittadinanza (it, 141.0)
  LRCF: 'VG',      // Loi sur la responsabilité (fr, 170.32)
  LRESP: 'VG',     // Legge sulla responsabilità (it, 170.32)
  LMP: 'BOEB',     // Loi sur les marchés publics (fr, 172.056.1)
  LAPUB: 'BOEB',   // Legge sugli appalti pubblici (it, 172.056.1)
  // ── Datenschutz / Wettbewerb / Binnenmarkt / Preise ──
  LPD: 'DSG',      // Loi/Legge sur la protection des données (235.1)
  LCART: 'KG',     // Loi/Legge sur les cartels (251)
  LMI: 'BGBM',     // Loi/Legge sur le marché intérieur (943.02)
  LETC: 'THG',     // Loi sur les entraves techniques au commerce (fr, 946.51)
  LOTC: 'THG',     // Legge sugli ostacoli tecnici al commercio (it, 946.51)
  LSPR: 'PUEG',    // Loi/Legge sur la surveillance des prix (942.20)
  // ── Sozialversicherungsrecht ──
  LPGA: 'ATSG',    // Loi/Legge sur la partie générale des assurances sociales (830.1)
  LAVS: 'AHVG',    // Loi/Legge sur l'assurance-vieillesse et survivants (831.10)
  LAI: 'IVG',      // Loi/Legge sur l'assurance-invalidité (831.20)
  LPC: 'ELG',      // Loi/Legge sur les prestations complémentaires (831.30)
  LPP: 'BVG',      // Loi/Legge sur la prévoyance professionnelle (831.40)
  LFLP: 'FZG',     // Loi/Legge sur le libre passage (831.42)
  LAA: 'UVG',      // Loi sur l'assurance-accidents (fr, 832.20)
  LAINF: 'UVG',    // Legge sull'assicurazione contro gli infortuni (it, 832.20)
  LAMAL: 'KVG',    // Loi/Legge sur l'assurance-maladie (832.10)
  LACI: 'AVIG',    // Loi sur l'assurance-chômage (fr, 837.0)
  LADI: 'AVIG',    // Legge sull'assicurazione contro la disoccupazione (it, 837.0)
  LAFAM: 'FAMZG',  // Loi/Legge sur les allocations familiales (836.2)
  LAPG: 'EOG',     // Loi sur les allocations pour perte de gain (fr, 834.1)
  LIPG: 'EOG',     // Legge sulle indennità di perdita di guadagno (it, 834.1)
  LAM: 'MVG',      // Loi/Legge sur l'assurance militaire (833.1)
  // ── Steuerrecht ──
  LIFD: 'DBG',     // Loi/Legge sur l'impôt fédéral direct (642.11)
  LHID: 'STHG',    // Loi sur l'harmonisation des impôts directs (fr, 642.14)
  LAID: 'STHG',    // Legge sull'armonizzazione delle imposte dirette (it, 642.14)
  LIA: 'VSTG',     // Loi sur l'impôt anticipé (fr, 642.21)
  LIP: 'VSTG',     // Legge sull'imposta preventiva (it, 642.21)
  LTVA: 'MWSTG',   // Loi sur la TVA (fr, 641.20)
  LIVA: 'MWSTG',   // Legge sull'IVA (it, 641.20)
  LT: 'STG',       // Loi sur les droits de timbre (fr, 641.10)
  LTB: 'STG',      // Legge sulle tasse di bollo (it, 641.10)
  // ── Migration / Gleichstellung / Bürgerrecht ──
  LEI: 'AIG',      // Loi sur les étrangers et l'intégration (fr, 142.20)
  LSTRI: 'AIG',    // Legge sugli stranieri e la loro integrazione (it, 142.20)
  LASI: 'ASYLG',   // Loi/Legge sur l'asile (142.31)
  LEG: 'GLG',      // Loi sur l'égalité (fr, 151.1)
  LPAR: 'GLG',     // Legge sulla parità dei sessi (it, 151.1)
  // ── Wirtschafts-/Finanzmarktrecht ──
  LFINMA: 'FINMAG',// Loi/Legge sur l'Autorité fédérale de surveillance des marchés financiers (956.1)
  LB: 'BANKG',     // Loi sur les banques (fr, 952.0)
  LBCR: 'BANKG',   // Legge sulle banche e le casse di risparmio (it, 952.0)
  LSFIN: 'FIDLEG', // Loi sur les services financiers (fr, 950.1)
  LSERFI: 'FIDLEG',// Legge sui servizi finanziari (it, 950.1)
  LPCC: 'KAG',     // Loi sur les placements collectifs (fr, 951.31)
  LICOL: 'KAG',    // Legge sugli investimenti collettivi (it, 951.31)
  LEFIN: 'FINIG',  // Loi sur les établissements financiers (fr, 954.1)
  LISFI: 'FINIG',  // Legge sugli istituti finanziari (it, 954.1)
  LIMF: 'FINFRAG', // Loi sur l'infrastructure des marchés financiers (fr, 958.1)
  LINFI: 'FINFRAG',// Legge sull'infrastruttura finanziaria (it, 958.1)
  LSA: 'VAG',      // Loi/Legge sur la surveillance des assurances (961.01)
  LBA: 'GWG',      // Loi sur le blanchiment d'argent (fr, 955.0)
  LRD: 'GWG',      // Legge sul riciclaggio di denaro (it, 955.0)
  LTI: 'BEG',      // Loi sur les titres intermédiés (fr, 957.1)
  LTCO: 'BEG',     // Legge sui titoli contabili (it, 957.1)
  // ── Verwaltungs-/Umwelt-/Raum-/Sektorrecht ──
  LAT: 'RPG',      // Loi sur l'aménagement du territoire (fr, 700)
  LPT: 'RPG',      // Legge sulla pianificazione del territorio (it, 700)
  LPE: 'USG',      // Loi sur la protection de l'environnement (fr, 814.01)
  LPAMB: 'USG',    // Legge sulla protezione dell'ambiente (it, 814.01)
  LEAUX: 'GSCHG',  // Loi sur la protection des eaux (fr, 814.20)
  LPAC: 'GSCHG',   // Legge sulla protezione delle acque (it, 814.20)
  LPN: 'NHG',      // Loi/Legge sur la protection de la nature (451)
  LEX: 'ENTG',     // Loi sur l'expropriation (fr, 711)
  LESPR: 'ENTG',   // Legge sull'espropriazione (it, 711)
  LDFR: 'BGBB',    // Loi/Legge sur le droit foncier rural (211.412.11)
  LFAIE: 'BEWG',   // Loi sur l'acquisition d'immeubles par des personnes à l'étranger (fr, 211.412.41)
  LAFE: 'BEWG',    // Legge sull'acquisto di fondi da parte di persone all'estero (it, 211.412.41)
  LCR: 'SVG',      // Loi sur la circulation routière (fr, 741.01)
  LCSTR: 'SVG',    // Legge sulla circolazione stradale (it, 741.01)
  LPTH: 'HMG',     // Loi sur les produits thérapeutiques (fr, 812.21)
  LATER: 'HMG',    // Legge sugli agenti terapeutici (it, 812.21)
  LDAL: 'LMG',     // Loi sur les denrées alimentaires (fr, 817.0)
  LDERR: 'LMG',    // Legge sulle derrate alimentari (it, 817.0)
  LEP: 'EPG',      // Loi/Legge sur les épidémies (818.101)
  LENE: 'ENG',     // Loi/Legge sur l'énergie (730.0)
  LA: 'LFG',       // Loi sur l'aviation (fr, 748.0)
  LNA: 'LFG',      // Legge sulla navigazione aerea (it, 748.0)
  LTC: 'FMG',      // Loi/Legge sur les télécommunications (784.10)
  LAAM: 'MG',      // Loi sur l'armée et l'administration militaire (fr, 510.10)
  LM: 'MG',        // Legge militare (it, 510.10)
};

// Kandidaten zu einem normalisierten Kürzel holen; findet die Karte nichts, wird
// EINMAL über die FR/IT-Alias-Tabelle nachgeschlagen (nie rekursiv). So bleibt ein
// echtes Kürzel «CP» (falls je im Register) immer vorrangig vor dem Alias.
function holeErlasse(index: NormIndex, key: string): NormErlass[] | undefined {
  return index.map.get(key) ?? (ALIAS[key] ? index.map.get(ALIAS[key]) : undefined);
}

// Aus mehreren Kandidaten den EINEN wählen: genau ein Treffer → dieser; sonst
// genau ein Bund-Treffer → dieser (Bund schlägt kollidierende Kantonskürzel wie
// «StG», es sei denn der Kanton wird explizit genannt); sonst mehrdeutig → null.
function waehle(cands: NormErlass[] | undefined, filter?: (e: NormErlass) => boolean): NormErlass | null {
  if (!cands) return null;
  const c = filter ? cands.filter(filter) : cands;
  if (c.length === 1) return c[0];
  if (c.length === 0) return null;
  const bund = c.filter((e) => e.ebene === 'bund');
  return bund.length === 1 ? bund[0] : null;
}

// Artikel-Token + Anzeige aus den Nicht-Kürzel-Tokens. null, wenn der Rest kein
// sauberer Artikel-Designator ist (Fremdwort/leer) → kein Fehl-Sprung.
function parseArtikel(tokens: string[]): { token: string; anzeige: string } | null {
  if (tokens.length === 0) return null;
  const m = tokens.join(' ').match(ARTIKEL_TEIL);
  if (!m) return null;
  const anzeige = m[1].toLowerCase();
  const token = anzeige.replace(SUFFIX, (_, n, b, suf) => [n, b, suf].filter(Boolean).join('_'));
  return { token, anzeige };
}

// Versucht (Kürzel + optional Artikel) auf `tokens` gegen `index` aufzulösen.
// filter grenzt die Kandidaten ein (Kanton-Disambiguierung).
function loese(index: NormIndex, tokens: string[], filter?: (e: NormErlass) => boolean): { erlass: NormErlass; artikel: { token: string; anzeige: string } | null } | null {
  if (tokens.length === 0) return null;
  // (1) Reines Kürzel (ganze Eingabe) → Erlass-Sprung ohne Artikel.
  const ganz = waehle(holeErlasse(index, norm(tokens.join(''))), filter);
  if (ganz) return { erlass: ganz, artikel: null };
  // (2) Kürzel am ENDE (Artikel davor), längste Spanne zuerst (max. 3 Tokens für
  //     mehrteilige Kürzel wie «GebV SchKG»).
  for (let len = Math.min(3, tokens.length - 1); len >= 1; len--) {
    const erlass = waehle(holeErlasse(index, norm(tokens.slice(-len).join(''))), filter);
    if (erlass) {
      const artikel = parseArtikel(tokens.slice(0, -len));
      if (artikel) return { erlass, artikel };
    }
  }
  // (3) Kürzel am ANFANG (Artikel danach).
  for (let len = Math.min(3, tokens.length - 1); len >= 1; len--) {
    const erlass = waehle(holeErlasse(index, norm(tokens.slice(0, len).join(''))), filter);
    if (erlass) {
      const artikel = parseArtikel(tokens.slice(len));
      if (artikel) return { erlass, artikel };
    }
  }
  return null;
}

function bauHref(e: NormErlass, artikelToken: string | null): string {
  const basis = `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
  // Anker nur für gerenderten Volltext (snapshot). pdf-embed/nur-live-link haben
  // keine #art-Anker → nur der Erlass wird geöffnet (§15 Funktions-Treue).
  return artikelToken && e.status === 'snapshot' ? `${basis}#art-${artikelToken}` : basis;
}

// Kompaktform «or257d» (kein Trennzeichen zwischen Kürzel und Artikel) in zwei
// Tokens auftrennen: der Alpha-Präfix (≥2 Buchstaben) ist das Kürzel, der
// Ziffern-Rest der Artikel. Ambiguitäts-Vorsicht (Kürzel-mit-Ziffer wie «ArGV 1»):
// die Auftrennung greift NUR als Fallback, NACHDEM die ungetrennte Auflösung
// gescheitert ist — «ArGV1» löst sich vorher als ganzes Kürzel auf und erreicht
// diesen Pfad nie. Gibt null, wenn kein Token eine solche Grenze hat.
function kompaktSplit(tokens: string[]): string[] | null {
  let veraendert = false;
  const out: string[] = [];
  for (const t of tokens) {
    const m = t.match(/^([A-Za-zÀ-ÿ]{2,})(\d.*)$/);
    if (m) { out.push(m[1], m[2]); veraendert = true; }
    else out.push(t);
  }
  return veraendert ? out : null;
}

// Ein Auflösungs-Versuch für eine gegebene Token-Liste (Kantons-Pfad zuerst).
function versuche(index: NormIndex, tokens: string[]): NormQueryTreffer | null {
  // Explizite Kantons-Angabe (2-Buchstaben-Code irgendwo in der Eingabe) grenzt
  // die Auflösung auf diesen Kanton ein und wird ZUERST versucht (der Nutzer
  // meint diesen Kanton, nicht den kollidierenden Bund-Treffer wie «StG»).
  const ktIdx = tokens.findIndex((t) => index.kantone.has(norm(t)) && /^[a-zA-Z]{2}$/.test(t));
  if (ktIdx >= 0) {
    const code = norm(tokens[ktIdx]);
    const rest = tokens.filter((_, i) => i !== ktIdx);
    const r = loese(index, rest, (e) => e.kanton != null && norm(e.kanton) === code);
    if (r) return { erlass: r.erlass, artikelToken: r.artikel?.token ?? null, artikelAnzeige: r.artikel?.anzeige ?? null, href: bauHref(r.erlass, r.artikel?.token ?? null) };
  }
  const r = loese(index, tokens);
  if (!r) return null;
  return { erlass: r.erlass, artikelToken: r.artikel?.token ?? null, artikelAnzeige: r.artikel?.anzeige ?? null, href: bauHref(r.erlass, r.artikel?.token ?? null) };
}

/**
 * Löst eine Norm-Query auf einen Leser-Deep-Link auf, oder gibt null zurück
 * (→ normale Suche). Deterministisch, ohne Suchindex.
 */
export function parseNormQuery(query: string, index: NormIndex): NormQueryTreffer | null {
  const roh = query.trim();
  if (!roh) return null;
  const tokens = roh.split(/\s+/);
  const direkt = versuche(index, tokens);
  if (direkt) return direkt;
  // Fallback: Kompaktform «or257d» auftrennen und erneut versuchen.
  const kompakt = kompaktSplit(tokens);
  return kompakt ? versuche(index, kompakt) : null;
}
