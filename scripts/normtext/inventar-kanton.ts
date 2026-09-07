/**
 * Kantonales Norm-Inventar für die Snapshot-Erzeugung.
 *
 * Sammelt aus den kantonalen Tarif-Tabellen (src/data/tarif/*.ts) ALLE Einträge
 * mit (kanton, erlassName, erlassNr, artikel, quelleUrl) und teilt sie nach der
 * quelleUrl auf:
 *   - LexWork-Quelle  https://<host>/app/(de|fr)/texts_of_law/<lawId>
 *       → in sammleKantonInventar(), gruppiert nach (kanton, host, lang, lawId),
 *         mit deduplizierten Artikel-Tokens (parsePassus über den artikel-String).
 *   - alles andere (PDF, zhlex-HTML, lexfind, silgeneve, rsn, m3.ti, …)
 *       → in sammleFallback() (kein Snapshot möglich, §8: sichtbar gemacht).
 *
 * §2: rein/deterministisch (kein Date.now/Math.random). §8: keine stillen Caps —
 * jeder einschlägige Eintrag wird genau einer der beiden Listen zugeordnet.
 *
 * Die Tarif-Tabellen haben heterogene Formen (Record<Kanton,…>, verschachtelte
 * Record<Geschäftsart, Record<Kanton,…>>, einzelne Tarif-Objekte). Statt jede
 * Form einzeln zu kennen, walken wir jeden Export rekursiv und erkennen einen
 * Tarif-Eintrag an seiner Signatur (die fünf string-Felder). Nicht-Tarif-Exporte
 * (BgerTarif ohne kanton, MODIFIKATOREN ohne quelleUrl) fallen so von selbst weg.
 */
import * as gerichtskosten from '../../src/data/tarif/gerichtskosten.ts';
import * as schlichtung from '../../src/data/tarif/schlichtung.ts';
import * as parteientschaedigung from '../../src/data/tarif/parteientschaedigung.ts';
import * as beurkundung from '../../src/data/tarif/beurkundung.ts';
import * as grundbuch from '../../src/data/tarif/grundbuch.ts';
import * as notariatGrundbuch from '../../src/data/tarif/notariat-grundbuch.ts';
import * as modifikatoren from '../../src/data/tarif/modifikatoren.ts';
import * as bundesgericht from '../../src/data/tarif/bundesgericht.ts';
import * as nichtVermoegensrechtlich from '../../src/data/tarif/nicht-vermoegensrechtlich.ts';
import { parsePassus } from '../../src/lib/normtext/passus.ts';
import { ZH_QUELLEN } from './zh-quellen.ts';

/** Roh-Tarif-Eintrag, wie er in den Daten steht (nur die hier relevanten Felder). */
export interface TarifEintrag {
  kanton: string;
  erlassName: string;
  erlassNr: string;
  artikel: string;
  quelleUrl: string;
  /** Anzeige-String der Fassung («1.1.2024», «2026 (konsolidiert)», …).
   *  W3-TARIF-STAND: das Drift-Tor `check:tarif-drift` liest ihn über die
   *  Projektion `scripts/tarif/stand.ts`. Alle 954 Einträge tragen ihn
   *  (Erhebung 6.9.2026) — die Signatur-Erkennung unten prüft ihn mit, damit
   *  ein künftiger Eintrag ohne `stand` sichtbar herausfällt statt still
   *  ungeprüft mitzulaufen. */
  stand: string;
}

export interface KantonInventarArtikel {
  /** Artikel-Token wie im LexWork-Anker ('36', '4', '335_c'). */
  token: string;
  /** Originaler, ungekürzter Artikel-String aus den Daten ('§ 4 Abs. 1'). */
  label: string;
  /** Absatz, falls im Zitat genannt; sonst null. */
  absatz: string | null;
}

export interface KantonInventarGruppe {
  kanton: string;
  host: string;
  lang: 'de' | 'fr';
  lawId: string;
  erlassName: string;
  erlassNr: string;
  /** Originale /app/-URL (Live-Link für den Snapshot; LexWork hat keinen
   *  Artikel-Anker → Gesetzes-Seite). Erster Eintrag der Gruppe gewinnt. */
  quelleUrl: string;
  artikel: KantonInventarArtikel[];
}

export interface FallbackEintrag {
  kanton: string;
  erlassName: string;
  quelleUrl: string;
}

/** Eine HTM-Erlassquelle (NE rsn.ne.ch / GE silgeneve.ch) mit den zitierten
 *  Artikel-Tokens. Eine Gruppe = ein .htm (= ein Erlass). */
export interface HtmInventarGruppe {
  kanton: string; // 'NE' | 'GE' | 'TI'
  profil: 'ne' | 'ge' | 'ti';
  quelleUrl: string; // die exakte Quell-URL (Manifest-Key; TI: pdfatto/atto-URL)
  erlassName: string;
  erlassNr: string;
  artikel: KantonInventarArtikel[];
}

/** Eine ZH-zhlex-PDF-Erlassquelle mit den zitierten §-Tokens. Eine Gruppe = eine
 *  zhlex-Registry-URL (= ein Erlass; Manifest-Key). Der ZH-PDF-Adapter löst die
 *  Registry-Seite → notes.zh.ch-PDF (JS-Redirect) auf und extrahiert den Volltext. */
export interface ZhPdfInventarGruppe {
  kanton: string; // 'ZH'
  quelleUrl: string; // die exakte zhlex-Registry-URL (Manifest-Key)
  erlassName: string;
  erlassNr: string;
  artikel: KantonInventarArtikel[];
}

/** ZH-zhlex-Registry-Erlassseite (Einzelerlass): zh.ch/.../zhlex-ls/erlass-…html.
 *  NUR die erlass-…-Einzelseiten (nicht die Sammlungs-Übersicht …/gesetzessammlung.html),
 *  weil nur die Einzelseite einen OpenAttachment-PDF-Link trägt. */
const ZH_PDF_QUELLE = /^https:\/\/www\.zh\.ch\/.*\/zhlex-ls\/erlass-[^/]*\.html$/i;

/** Eine Einzelspalten-PDF-Erlassquelle (SZ/TI/VD/JU) mit den zitierten Tokens.
 *  Eine Gruppe = eine PDF-quelleUrl (= ein Erlass; Manifest-Key). Der generische
 *  PDF-Adapter (adapter-pdf.ts) löst die quelleUrl je Profil zur PDF auf und
 *  extrahiert den Volltext. */
/** Profil-Namen des generischen PDF-Adapters (Spiegel von PdfProfilName). */
type PdfProfilName = 'sz' | 'ti' | 'vd' | 'ju' | 'olexAt' | 'olexPar';

export interface PdfInventarGruppe {
  kanton: string; // 'SZ' | 'TI' | 'VD' | 'JU' | 'AR' | 'GR' | 'LU' | 'SG' | 'FR' | 'VS'
  profil: PdfProfilName;
  quelleUrl: string; // die exakte Tarif-quelleUrl (Manifest-Key)
  erlassName: string;
  erlassNr: string;
  artikel: KantonInventarArtikel[];
}

/**
 * PDF-Profil einer (kanton, url)-Kombination oder null. Bewusst NACH dem Kanton
 * UND dem Host-Muster gescoped: lexfind.ch dient mehreren Kantonen (GE/SZ/TI/VS),
 * aber nur die VD-lexfind-Erlasse sind als Volltext erschlossen (die übrigen
 * lexfind-Quellen bleiben Fallback, §8). SZ via sz.ch, TI via m3.ti.ch, JU via
 * rsju.jura.ch. So aktiviert kein fremder Kanton versehentlich ein Profil.
 */
function pdfProfil(kanton: string, url: string): PdfProfilName | null {
  if (kanton === 'SZ' && /^https:\/\/www\.sz\.ch\/.*\.pdf$/i.test(url)) return 'sz';
  // TI: NICHT mehr über den PDF-Adapter — TI wird jetzt über den HTM/TI-Profil
  // (m3.ti.ch …/legge/num) als strukturiertes HTML erschlossen (Auftrag David
  // 16.6.2026). pdfatto/atto-URLs werden in tiHtmlUrlAusQuelle zur HTML-Seite
  // abgeleitet; Manifest-Key bleibt die exakte Tarif-quelleUrl.
  if (kanton === 'VD' && /^https:\/\/www\.lexfind\.ch\/tolv\/\d+\/[a-z]{2}$/i.test(url)) return 'vd';
  if (kanton === 'JU' && /^https:\/\/rsju\.jura\.ch\/.*viewdocument\.html\?/i.test(url)) return 'ju';

  // ── Generische OrdoLex/gr-lex-Familie-PDFs (Konsolidierungs-PDF mit «(Stand …)»/
  // «(état …)»-Kopf). Kanton + Host EXAKT gescoped (§1-Lektion: kein Fremdkanton
  // aktiviert ein Profil). Marker: Art. (AR/GR/SG/FR/VS/VD-VS) bzw. § (LU/SZ).
  // quelleUrl = die /api/<lang>/versions/N/pdf_file[_with_annexes]-PDF (= identity).
  // Empirisch verifiziert extrahierbar (17.6.2026). Nicht-extrahierbare
  // Geschwister (GE-lexfind 199638, TI-lexfind 125201) bleiben Fallback (§8).
  const olexHosts: Array<{ kanton: string; muster: RegExp; profil: PdfProfilName }> = [
    { kanton: 'AR', muster: /^https:\/\/ar\.clex\.ch\/api\/de\/versions\/\d+\/pdf_file/i, profil: 'olexAt' },
    { kanton: 'GR', muster: /^https:\/\/www\.gr-lex\.gr\.ch\/api\/de\/versions\/\d+\/pdf_file/i, profil: 'olexAt' },
    { kanton: 'SG', muster: /^https:\/\/www\.gesetzessammlung\.sg\.ch\/api\/de\/versions\/\d+\/pdf_file/i, profil: 'olexAt' },
    { kanton: 'LU', muster: /^https:\/\/srl\.lu\.ch\/api\/de\/versions\/\d+\/pdf_file/i, profil: 'olexPar' },
    { kanton: 'FR', muster: /^https:\/\/bdlf\.fr\.ch\/api\/fr\/versions\/\d+\/pdf_file/i, profil: 'olexAt' },
    { kanton: 'VS', muster: /^https:\/\/lex\.vs\.ch\/api\/fr\/versions\/\d+\/pdf_file/i, profil: 'olexAt' },
    { kanton: 'TI', muster: /^https:\/\/www\.lexfind\.ch\/tolv\/125101\/it$/i, profil: 'ti' },
    // SZ Handänderungssteuergesetz: das lexfind-PDF trägt den «SRSZ D.M.YYYY»-
    // Konsolidierungsmarker als Seiten-Fusszeile im Body (Stand-Body-Fallback in
    // holePdf greift) → sz-Profil (§, leseSzStand).
    { kanton: 'SZ', muster: /^https:\/\/www\.lexfind\.ch\/tolv\/82040\/de$/i, profil: 'sz' },
    // NICHT erschlossen (bleibt Fallback, §8): VS lexfind/tolv/94116/fr —
    // kein Stand im PDF UND das Tarif-Zitat «OcRF Art. 96 ch. I.1» liegt nicht in
    // der 42-Artikel-OcRF (anderer Erlass) → erst Fachklärung der Quelle nötig.
  ];
  for (const h of olexHosts) if (kanton === h.kanton && h.muster.test(url)) return h.profil;
  return null;
}

/** /app/(de|fr)/texts_of_law/<lawId> — Host + Sprache + lawId. */
const LEXWORK = /^https:\/\/([^/]+)\/app\/(de|fr)\/texts_of_law\/(.+)$/;

/**
 * Kanonische Schreibweise einer LexWork-lawId (§5 eine Wahrheit, §7 amtliche
 * Nummer). Rein.
 *
 * Die amtliche Systematiknummer ist EIN Pfadsegment — sie darf selbst
 * Schrägstriche tragen (GL «GS III B/7/1»). In der quelleUrl kann derselbe
 * Erlass darum in zwei Schreibweisen stehen, und gesetze.gl.ch beantwortet
 * beide mit HTTP 200 (empirisch 5.9.2026):
 *   …/texts_of_law/III%20B%2F7%2F1   (Nummer als EIN kodiertes Segment)
 *   …/texts_of_law/III%20B/7/1       (Schrägstriche roh)
 * Ungefiltert erzeugt das zwei Gruppen, zwei Snapshots und zwei Register-Keys
 * für einen Erlass: der Schlüssel entsteht aus `lawIdSafe` («/»→«_»), also
 * `GL-III%20B_7_1` NEBEN `GL-III%20B%2F7%2F1` — dieselbe Verordnung zweimal in
 * Register, Sitemap und Kantonsliste (§5-Doppelwahrheit; Befund der
 * Gegenprüfung zu PR #684, 5.9.2026).
 *
 * Kanonisch ist die vollständig kodierte Form. Begründung: nur sie dekodiert
 * verlustfrei auf die amtliche Nummer «III B/7/1» zurück (der `_`-Ersatz in
 * `lawIdSafe` ist von einem echten Unterstrich nicht mehr unterscheidbar), nur
 * sie adressiert die Nummer als das eine Pfadsegment, das sie ist, und sie
 * deckt sich mit der Schreibweise des Schwester-Erlasses
 * `GL-III%20B%2F3%2F2` wie auch der Mehrheit der Tarif-Zitate.
 */
export function kanonischeLawId(lawId: string): string {
  return lawId.replace(/\//g, '%2F');
}

/** Dekodierte Identität einer lawId — zwei Schreibweisen derselben amtlichen
 *  Nummer fallen hier zusammen («III%20B/7/1» und «III%20B%2F7%2F1» → «III B/7/1»). */
function lawIdIdentitaet(lawId: string): string {
  try {
    return decodeURIComponent(kanonischeLawId(lawId));
  } catch {
    return kanonischeLawId(lawId);
  }
}

/** Strukturiert erschlossene HTML/HTM-Erlassquellen, je Profil:
 *   NE: rsn.ne.ch …/htm/*.htm        (Word-Export, latin-1)
 *   GE: silgeneve.ch …/*.htm         (Word-Export, latin-1)
 *   TI: m3.ti.ch …/pdfatto/atto/{N}  (server-gerendertes HTML, utf-8; die HTML-
 *       Seite …/legge/num/{N} wird im Adapter abgeleitet, Manifest-Key bleibt
 *       die exakte pdfatto-quelleUrl).
 *  (übrige lexfind.ch u.a. bleiben echter Fallback — kein eigener Adapter.) */
const HTM_QUELLEN: Array<{ muster: RegExp; profil: 'ne' | 'ge' | 'ti' }> = [
  { muster: /^https:\/\/rsn\.ne\.ch\/.*\.htm$/i, profil: 'ne' },
  { muster: /^https:\/\/silgeneve\.ch\/.*\.htm$/i, profil: 'ge' },
  { muster: /^https:\/\/m3\.ti\.ch\/.*\/pdfatto\/atto\/\d+$/i, profil: 'ti' },
];

/** Liefert das HTM-Profil einer URL oder null (kein HTM-Adapter zuständig). */
function htmProfil(url: string): 'ne' | 'ge' | 'ti' | null {
  for (const q of HTM_QUELLEN) if (q.muster.test(url)) return q.profil;
  return null;
}

/** true, wenn der Wert die fünf string-Felder eines Tarif-Eintrags trägt. */
function istTarifEintrag(v: unknown): v is TarifEintrag {
  if (v === null || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.kanton === 'string' &&
    typeof o.erlassName === 'string' &&
    typeof o.erlassNr === 'string' &&
    typeof o.artikel === 'string' &&
    typeof o.quelleUrl === 'string' &&
    typeof o.stand === 'string'
  );
}

/** Rekursiv jeden Tarif-Eintrag aus einem beliebig verschachtelten Wert sammeln. */
function sammleEintraege(v: unknown, ziel: TarifEintrag[]): void {
  if (istTarifEintrag(v)) {
    ziel.push(v);
    return; // ein Tarif-Eintrag wird nicht weiter durchsucht
  }
  if (v === null || typeof v !== 'object') return;
  for (const wert of Object.values(v as Record<string, unknown>)) {
    sammleEintraege(wert, ziel);
  }
}

/** Alle Tarif-Module deep-walken → flache, deduplizierte Eintragsliste.
 *  (Mehrere Module re-exportieren dieselbe NOTARIAT/GRUNDBUCH-Tabelle; ein
 *   Eintrag ist über die Identität des Objekts oder den Tripel-Schlüssel eindeutig.)
 *
 *  Exportiert (W3-TARIF-STAND, 6.9.2026): `scripts/tarif/tarif-drift.ts` braucht
 *  dieselbe Eintragsliste. §5 — ein zweiter Enumerator wäre eine zweite Wahrheit
 *  darüber, was «alle Tarif-Einträge» sind. */
export function alleTarifEintraege(): TarifEintrag[] {
  const module: unknown[] = [
    gerichtskosten,
    schlichtung,
    parteientschaedigung,
    beurkundung,
    grundbuch,
    notariatGrundbuch,
    modifikatoren,
    bundesgericht,
    nichtVermoegensrechtlich,
  ];
  const roh: TarifEintrag[] = [];
  for (const m of module) sammleEintraege(m, roh);

  // Identische Objekt-Referenzen entdoppeln (Re-Exporte).
  const gesehen = new Set<TarifEintrag>();
  const eindeutig: TarifEintrag[] = [];
  for (const e of roh) {
    if (gesehen.has(e)) continue;
    gesehen.add(e);
    eindeutig.push(e);
  }
  return eindeutig;
}

/**
 * Gruppiert die kantonalen LexWork-Tarifquellen nach (kanton, host, lang, lawId)
 * und merged die Artikel-Tokens (dedupe). Einträge ohne parsebares Artikel-Token
 * werden übersprungen (die Gruppe bleibt, falls andere Einträge ein Token liefern).
 */
export function sammleKantonInventar(): KantonInventarGruppe[] {
  const eintraege = alleTarifEintraege();
  const gruppen = new Map<string, KantonInventarGruppe>();

  for (const e of eintraege) {
    const m = e.quelleUrl.match(LEXWORK);
    if (!m) continue; // Nicht-LexWork → Fallback (separat)
    // §7 «Realität gewinnt»: der Host wird UNVERÄNDERT übernommen (inkl. evtl.
    // führendem 'www.'). Empirisch (16.6.2026) liefern mehrere LexWork-Hosts
    // — belex.sites.be.ch, gesetzessammlung.sg.ch, rechtsbuch.tg.ch — die API
    // NUR unter der www-Variante (nackter Host → fetch failed). Die Seiten-URL
    // in den Tarif-Daten trägt das www. korrekt; daran halten wir uns.
    const host = m[1];
    const lang = m[2] as 'de' | 'fr';
    // §5: die Systematiknummer wird auf ihre kanonische Schreibweise gebracht,
    // BEVOR gruppiert wird — sonst spaltet eine zweite Schreibweise denselben
    // Erlass in zwei Gruppen (→ zwei Register-Keys, s. kanonischeLawId).
    const lawId = kanonischeLawId(m[3]);
    const quelleUrl =
      lawId === m[3] ? e.quelleUrl : `https://${host}/app/${lang}/texts_of_law/${lawId}`;

    const passus = parsePassus(e.artikel);
    if (!passus) continue; // kein Artikel-Token extrahierbar

    const schluessel = `${e.kanton}|${host}|${lang}|${lawId}`;
    let gruppe = gruppen.get(schluessel);
    if (!gruppe) {
      gruppe = {
        kanton: e.kanton,
        host,
        lang,
        lawId,
        erlassName: e.erlassName,
        erlassNr: e.erlassNr,
        quelleUrl,
        artikel: [],
      };
      gruppen.set(schluessel, gruppe);
    }

    if (!gruppe.artikel.some((a) => a.token === passus.artikelToken)) {
      gruppe.artikel.push({
        token: passus.artikelToken,
        label: e.artikel,
        absatz: passus.absatz,
      });
    }
  }

  // Leere Gruppen können nicht entstehen (jede Gruppe wird mit mind. einem
  // Token erzeugt); zur Sicherheit dennoch filtern.
  const fertig = [...gruppen.values()].filter((g) => g.artikel.length > 0);

  // §5-Netz: `kanonischeLawId` fängt die Schrägstrich-Achse. Bleiben zwei
  // Gruppen mit derselben dekodierten Nummer übrig (etwa rohes Leerzeichen
  // gegen «%20»), ist das erneut ein Erlass mit zwei Schlüsseln — dann bricht
  // der Generator ab, statt still eine Dublette in den Korpus zu schreiben.
  const nachIdentitaet = new Map<string, KantonInventarGruppe[]>();
  for (const g of fertig) {
    const id = `${g.kanton}|${g.host}|${g.lang}|${lawIdIdentitaet(g.lawId)}`;
    const liste = nachIdentitaet.get(id);
    if (liste) liste.push(g);
    else nachIdentitaet.set(id, [g]);
  }
  const kollisionen = [...nachIdentitaet.entries()].filter(([, v]) => v.length > 1);
  if (kollisionen.length > 0) {
    const text = kollisionen
      .map(([id, v]) => `  ${id} ← ${v.map((g) => JSON.stringify(g.lawId)).join(' , ')}`)
      .join('\n');
    throw new Error(
      'BLOCKED: dieselbe amtliche Systematiknummer steht in den Tarif-Daten in ' +
        `mehreren Schreibweisen — das erzeugt zwei Snapshot-Schlüssel für einen Erlass (§5).\n${text}\n` +
        'Fix: die quelleUrl in src/data/tarif/*.ts auf EINE Schreibweise bringen ' +
        '(kanonisch: Systematiknummer als ein prozent-kodiertes Pfadsegment).',
    );
  }

  return fertig;
}

/**
 * Gruppiert die NE/GE-HTM-Tarifquellen nach quelleUrl (= ein .htm = ein Erlass)
 * und merged die Artikel-Tokens (dedupe). Verkettete Zitate («Art. 16 / Art. 4
 * al. 6 / Art. 84») werden über parsePassus zerlegt — parsePassus liefert nur
 * das ERSTE Artikel-Token; weitere Tokens im selben artikel-String werden hier
 * zusätzlich gesammelt, damit alle zitierten Artikel snapshotten.
 */
export function sammleHtmInventar(): HtmInventarGruppe[] {
  const eintraege = alleTarifEintraege();
  const gruppen = new Map<string, HtmInventarGruppe>();

  for (const e of eintraege) {
    const profil = htmProfil(e.quelleUrl);
    if (!profil) continue;

    let gruppe = gruppen.get(e.quelleUrl);
    if (!gruppe) {
      gruppe = {
        kanton: e.kanton,
        profil,
        quelleUrl: e.quelleUrl,
        erlassName: e.erlassName,
        erlassNr: e.erlassNr,
        artikel: [],
      };
      gruppen.set(e.quelleUrl, gruppe);
    }

    // Alle in diesem Zitat genannten «Art. N» einzeln zerlegen (verkettete
    // Zitate wie «Art. 16 / Art. 4 al. 6 / Art. 84»). Je Teilzitat parsePassus.
    const teile = e.artikel.split('/');
    for (const teil of teile) {
      const passus = parsePassus(teil);
      if (!passus) continue;
      if (!gruppe.artikel.some((a) => a.token === passus.artikelToken)) {
        gruppe.artikel.push({
          token: passus.artikelToken,
          label: teil.trim(),
          absatz: passus.absatz,
        });
      }
    }
  }

  return [...gruppen.values()].filter((g) => g.artikel.length > 0);
}

/**
 * Gruppiert die ZH-zhlex-PDF-Tarifquellen nach quelleUrl (= eine zhlex-Registry-
 * Seite = ein Erlass) und merged die §-Tokens (dedupe). Nur Einträge mit einer
 * ZH_PDF_QUELLE-URL und einem parsebaren Token werden aufgenommen. Seit 17.6.2026
 * löst parsePassus auch «Anhang Ziff. N.N.N» (NotGebV) auf einen gepunkteten Token
 * auf → diese Einträge sind jetzt HIER (nicht mehr Fallback) und werden über den
 * zhlex-PDF-Anhang-Segmentierer (segmentiereAnhangZiffern) als Volltext erschlossen.
 *
 * ZH-4a (31.8.2026): Die Menge ist seither die VEREINIGUNG aus (a) der
 * Tarif-Ableitung und (b) der deklarativen Quellenliste `ZH_QUELLEN`
 * (`zh-quellen.ts`), dedupliziert über die Registry-URL. Vorher war ein
 * ZH-Erlass ohne Tarif-Zitat für Generator UND Drift-Prüfung nicht existent
 * (§7-d-Lücke, Dossier §7). Listen-Erlasse tragen keine zitierten §-Tokens —
 * `artikel: []` ist für sie der Normalfall und KEIN Mangel: der Generator
 * extrahiert ohnehin alle Paragraphen (Vollabdeckung §7-1); `artikel` steuert
 * nur die §8-Sichtbarkeit «zitierter Token fehlt im Erlass».
 *
 * DEDUPE-REGEL (§6-Verhaltensneutralität): Bei gleicher Registry-URL gewinnt
 * die TARIF-Ableitung die Kopf-Daten (`erlassName`/`erlassNr`) — sie speisen
 * `erlassBezeichnung()` und damit das `erlass`-Feld jedes Snapshots. Würde die
 * Liste sie überschreiben, änderten sich die drei Bestands-Snapshots
 * (ZH-211.11/215.3/243) byte-weise ohne fachlichen Grund. Die Liste ergänzt
 * darum nur, was die Tarif-Ableitung nicht kennt.
 */
export function sammleZhPdfInventar(): ZhPdfInventarGruppe[] {
  const eintraege = alleTarifEintraege();
  const gruppen = new Map<string, ZhPdfInventarGruppe>();

  for (const e of eintraege) {
    if (!ZH_PDF_QUELLE.test(e.quelleUrl)) continue;

    const passus = parsePassus(e.artikel);
    if (!passus) continue; // «Anhang Ziff.» → kein §-Token → Fallback

    let gruppe = gruppen.get(e.quelleUrl);
    if (!gruppe) {
      gruppe = {
        kanton: e.kanton,
        quelleUrl: e.quelleUrl,
        erlassName: e.erlassName,
        erlassNr: e.erlassNr,
        artikel: [],
      };
      gruppen.set(e.quelleUrl, gruppe);
    }

    if (!gruppe.artikel.some((a) => a.token === passus.artikelToken)) {
      gruppe.artikel.push({
        token: passus.artikelToken,
        label: e.artikel,
        absatz: passus.absatz,
      });
    }
  }

  // Tarif-Gruppen ohne parsebaren Token fallen wie bisher weg (Fallback-Route);
  // erst DANACH kommt die deklarative Liste dazu, damit ein Listen-Erlass nicht
  // an diesem Filter scheitert (er hat naturgemäss keine zitierten Tokens).
  const vereinigt = [...gruppen.values()].filter((g) => g.artikel.length > 0);
  const bekannt = new Set(vereinigt.map((g) => g.quelleUrl));
  for (const q of ZH_QUELLEN) {
    if (bekannt.has(q.registryUrl)) continue;
    vereinigt.push({
      kanton: 'ZH',
      quelleUrl: q.registryUrl,
      erlassName: q.titel,
      // «LS 131.1» — dieselbe Schreibweise wie die Tarif-Zitate (Bestand:
      // «Notariatsgebührenverordnung (NotGebV) (LS 243)»), damit der Korpus
      // eine Erlass-Bezeichnung führt und nicht zwei.
      erlassNr: `LS ${q.nr}`,
      artikel: [],
    });
  }
  return vereinigt;
}

/**
 * Gruppiert die SZ/TI/VD/JU-PDF-Tarifquellen nach quelleUrl (= eine PDF = ein
 * Erlass) und merged die §/Art.-Tokens (dedupe). Nur Einträge mit aktivem
 * pdfProfil(kanton,url) und einem parsebaren Token werden aufgenommen; verkettete
 * Zitate («Art. 16 / Art. 84») werden über '/' zerlegt (wie HTM). Einträge ohne
 * Token (z.B. «Anhang Ziff.») bleiben in sammleFallback().
 */
export function sammlePdfInventar(): PdfInventarGruppe[] {
  const eintraege = alleTarifEintraege();
  const gruppen = new Map<string, PdfInventarGruppe>();

  for (const e of eintraege) {
    const profil = pdfProfil(e.kanton, e.quelleUrl);
    if (!profil) continue;

    let gruppe = gruppen.get(e.quelleUrl);
    if (!gruppe) {
      gruppe = {
        kanton: e.kanton,
        profil,
        quelleUrl: e.quelleUrl,
        erlassName: e.erlassName,
        erlassNr: e.erlassNr,
        artikel: [],
      };
      gruppen.set(e.quelleUrl, gruppe);
    }

    for (const teil of e.artikel.split('/')) {
      const passus = parsePassus(teil);
      if (!passus) continue;
      if (!gruppe.artikel.some((a) => a.token === passus.artikelToken)) {
        gruppe.artikel.push({
          token: passus.artikelToken,
          label: teil.trim(),
          absatz: passus.absatz,
        });
      }
    }
  }

  return [...gruppen.values()].filter((g) => g.artikel.length > 0);
}

/** Alle kantonalen Tarifquellen, die WEDER über LexWork NOCH über den HTM-
 *  Adapter (NE/GE) NOCH über den ZH-PDF-Adapter NOCH über den generischen
 *  PDF-Adapter (SZ/TI/VD/JU) erschlossen sind (übrige lexfind-/PDF-Quellen,
 *  zhlex-HTML ohne §-Token, …) — dedupliziert nach (kanton, quelleUrl). */
export function sammleFallback(): FallbackEintrag[] {
  const eintraege = alleTarifEintraege();
  const gesehen = new Set<string>();
  const fallback: FallbackEintrag[] = [];

  // (kanton, quelleUrl)-Kombinationen, die der generische PDF-Adapter bereits
  // erschliesst (mind. EIN Zitat dieser Quelle hat ein parsebares Token). Eine
  // SOLCHE Quelle darf NICHT zusätzlich als Fallback geführt werden, auch wenn
  // ein ANDERES Zitat derselben Quelle keinen Token trägt (sonst doppelte
  // Zuordnung, §8). Analog deckt der ZH-Block unten je Eintrag ab.
  const pdfErschlossen = new Set(
    sammlePdfInventar().map((g) => `${g.kanton}|${g.quelleUrl}`),
  );

  for (const e of eintraege) {
    if (LEXWORK.test(e.quelleUrl)) continue;
    if (htmProfil(e.quelleUrl)) continue; // jetzt über HTM-Adapter erschlossen
    // ZH-PDF-Quellen mit §-Token: über ZH-PDF-Adapter erschlossen.
    if (ZH_PDF_QUELLE.test(e.quelleUrl) && parsePassus(e.artikel)) continue;
    // SZ/TI/VD/JU-PDF-Quellen, die das PDF-Inventar erschliesst (URL-genau).
    if (pdfErschlossen.has(`${e.kanton}|${e.quelleUrl}`)) continue;
    const schluessel = `${e.kanton}|${e.quelleUrl}`;
    if (gesehen.has(schluessel)) continue;
    gesehen.add(schluessel);
    fallback.push({
      kanton: e.kanton,
      erlassName: e.erlassName,
      quelleUrl: e.quelleUrl,
    });
  }
  return fallback;
}
