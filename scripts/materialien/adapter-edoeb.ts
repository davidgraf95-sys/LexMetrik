// scripts/materialien/adapter-edoeb.ts
// E6a Stufe 1 · Etappe M3 (FAHRPLAN-MATERIALIEN-VERZAHNUNG §3 Q3): Adapter EDÖB-Leitfäden/
// Merkblätter. Browserlos (§7 Build-Regel 5/6). Netz-Hülle (crawleEdoeb) GETRENNT von den
// PUR-testbaren Extraktionsfunktionen (Muster adapter-seco/adapter-lexwork).
//
// PRIMÄRQUELLE (live-verifiziert 4.7.2026): das server-gerenderte SSR-HTML der zwei Hub-Seiten
//   https://www.edoeb.admin.ch/de/dokumentation-datenschutz  → Sektion «Leitfäden und Merkblätter» (DSG)
//   https://www.edoeb.admin.ch/de/dokumentation-bgoe         → Sektion «Öffentlichkeitsprinzip allgemein» (BGÖ)
// Struktur wie SECO: <a class="download-item" href="…/dam/de/sd-web/<TOKEN>/<Datei>.pdf"> mit
//   <h4 class="download-item__title"> + <span class="meta-info__item">6. Oktober 2025</span>.
// Wir schneiden je Hub NUR die genannte Sektion aus (Positions-Segmentierung zwischen zwei echten
// <h2>/<h3>-Überschriften; TOC-Links sind <a>, keine Überschrift → nicht getroffen) und nehmen NUR
// PDF-Downloads (Musterbriefe/Word ausgeschlossen).
//
// ERLASS-ZUORDNUNG kuratiert (§3 Q3): DS-Hub → DSG, BGÖ-Hub → BGÖ (Korpus-Key BGOE). VBGÖ ist
// gestrichen (nicht im Korpus, §0/B4). quelle='kuratiert' für die Erlass-Ebene. ARTIKELSCHARF NUR,
// wo der amtliche Titel den Artikel des ZUGEORDNETEN Erlasses nennt (z. B. «… nach Art. 24 DSG»):
// quelle='amtlich', konfidenz='regex-hoch'. Die Revisions-Cutoff-Regel (§2.4, revDSG 2023-09-01)
// greift in der PROJEKTION (braucheDowngrade) — ein DSFA-Merkblatt vom 4.8.2023 mit «Art. 22 und 23
// DSG» wird dort deterministisch auf Erlass-Ebene herabgestuft.
//
// ID = normalisierter Titel-Slug (§2.6, keine Nummern-Systematik). BESTEHENDER KEY GEWINNT
// (§2.6, wörtlich): vier Dokumente der Sektion «Leitfäden und Merkblätter» liegen bereits als
// KURIERTE Einträge im MATERIAL_REGISTER (COOKIES/DATABREACH/TOM/DSFA). Der Adapter erkennt sie über
// die Slug→Key-Tabelle KURIERT_BEKANNT und ÜBERSPRINGT sie (der kuratierte Eintrag bleibt
// massgeblich) — kein Parallel-Eintrag, keine Dublette. Grund für das Überspringen statt Migration:
// die Norm-Kontext-Brücke (materialienFuerNorm) liest bis M5 NUR das in-Bundle-MATERIAL_REGISTER;
// eine Migration in die DB würde diese vier Dokumente bis zum M5-Async-Loader aus dem Norm-Kontext-
// Panel entfernen (Funktions-Regression, §15). Die artikelscharfen Kanten dieser vier (DATABREACH →
// Art. 24 DSG; DSFA → Art. 22/23 DSG, revDSG-Cutoff) werden mit M5 nachgezogen, wenn die Migration
// ohne Regression möglich ist (Abweichung offengelegt, §7). Bei Titel-Retusche ohne Skip-Eintrag:
// Slug wechselt → der Eintrag würde als neues Dokument erscheinen; KURIERT_BEKANNT dann nachtragen
// (das Tor warnt sonst bei Entlisten+Neuanlegen mit hoher Ähnlichkeit, §2.6/A10).
// Die artikelscharfe Extraktion (artikelAusTitel) bleibt aktiv — sie greift für künftige NEUE
// Dokumente, deren amtlicher Titel einen Korpus-Artikel nennt.
//
// Scraping-Fallen (Skill scraping-swiss-official-sources, live bestätigt):
//  · Erfolg NIE am HTTP-Status festmachen — Content-Type prüfen (Soft-404-Shell trotz 200).
//  · Datumslabel + Titel VERBATIM übernehmen (keine ASCII-Faltung, amtliche Titel nie umschreiben).
//  · DAM-<TOKEN> in der URL ist VOLATIL → quell_ids, NIE Teil der ID (§2.6). Nie hardkodieren.
//  · Der DAM-Token wechselt bei Neu-Upload einer PDF → er ist im drift_token (über die URL) das
//    Datei-Versions-Signal; ETag/Last-Modified (CDN-variabel) bleibt Zweitsignal (Stufe 2).

import { createHash } from 'node:crypto';
import { fetchMitWiederholung } from '../normtext/netz-retry.ts';
import { dekodiereEntities } from '../normtext/html-entities.ts';
import { normalisiereZitat } from '../datenhaltung/normalisiere-zitat.ts';
import { datumslabelNachIso, istDeutschesDatumslabel } from './datum-de.ts';
import type { SoftLawDok, NormRefKante, AdapterErgebnis } from './adapter-typen.ts';
import type { DoktypId } from '../../src/lib/materialien/typen.ts';

export const EDOEB_USER_AGENT = 'LexMetrik-Materialien/1.0 (+https://lexmetrik.vercel.app)';

/** Definition einer Hub-Sektion (eine Erlass-Zuordnung je Sektion). */
export interface EdoebHubDef {
  /** interner Tag (Snapshot-Substrat, Präfix-Scope). */
  tag: 'ds' | 'bgoe';
  hubUrl: string;
  /** amtliche <h2>/<h3>-Überschrift der zu erfassenden Sektion (verbatim). */
  sektion: string;
  /** Korpus-Erlass-Key (GROSS). */
  erlassKey: 'DSG' | 'BGOE';
  /** Abkürzung, wie sie im amtlichen Titel vor der Artikelnummer steht (Bindung der Extraktion). */
  erlassAbk: 'DSG' | 'BGÖ';
  /** untere Count-Gate-Schwelle dieser Sektion (§2.5). */
  min: number;
}

export const EDOEB_HUBS: readonly EdoebHubDef[] = [
  // min = untere Count-Gate-Schwelle NACH Abzug der kuratiert-bekannten (§2.5); DS-Sektion hat live
  // 12 PDFs, davon 4 kuratiert-bekannt → 8 neue (Schwelle konservativ 6). BGÖ: 2 neue.
  { tag: 'ds', hubUrl: 'https://www.edoeb.admin.ch/de/dokumentation-datenschutz', sektion: 'Leitfäden und Merkblätter', erlassKey: 'DSG', erlassAbk: 'DSG', min: 6 },
  { tag: 'bgoe', hubUrl: 'https://www.edoeb.admin.ch/de/dokumentation-bgoe', sektion: 'Öffentlichkeitsprinzip allgemein', erlassKey: 'BGOE', erlassAbk: 'BGÖ', min: 2 },
];

/** Alle EDÖB-DB-IDs beginnen so (Entlistungs-/Netz-Scope). Die im kuratierten Register
 *  verbleibenden EDÖB-Einträge (REVDSG/AUSLAND/SCC/TB-32) sind NIE im Zustands-Manifest. */
export const EDOEB_ID_PREFIX = 'EDOEB-';

// ── Roh-Download aus dem HTML ──────────────────────────────────────────────────
export interface RohEdoebDok {
  href: string;
  titel: string;
  datumLabel: string;
  dateiname: string;
}

// ══ Reine Extraktionsfunktionen ══════════════════════════════════════════════

/** Transliteriert deutsche/französische Diakritika für den pfadsicheren Slug (KEY-Sicherheit). */
function transliteriere(s: string): string {
  return s
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .replace(/[àâáã]/gi, 'a').replace(/[éèêë]/gi, 'e').replace(/[îïí]/gi, 'i')
    .replace(/[ôöó]/gi, 'o').replace(/[ûùú]/gi, 'u').replace(/ç/gi, 'c');
}

/** Stoppwörter (klein): Artikel/Präpositionen/Konjunktionen — halten den Slug knapp + stabil. */
const STOP = new Set([
  'des', 'der', 'die', 'das', 'den', 'dem', 'und', 'oder', 'zu', 'zum', 'zur', 'im', 'in', 'am',
  'an', 'auf', 'bei', 'fuer', 'von', 'vom', 'mit', 'nach', 'ueber', 'ein', 'eine', 'einer', 'eines',
  'einem', 'betreffend', 'sowie', 'aehnlichen', 'aehnlicher', 'aehnliche', 'edoeb', 'sd',
]);

/**
 * Normalisierter Titel-Slug (§2.6): transliteriert, klein, ohne Stoppwörter, Bindestrich-getrennt,
 * auf die ersten sinntragenden Tokens gekürzt. Deterministisch + pfadsicher (nur [a-z0-9-]).
 */
export function slugify(titel: string): string {
  const tokens = transliteriere(titel)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
  return tokens.slice(0, 7).join('-');
}

/** Doktyp aus dem amtlichen Titel (nur registrierte DoktypIds, §0/B6). Default 'leitfaden'. */
export function doktypAusTitel(titel: string): DoktypId {
  const t = titel.toLowerCase();
  if (/\bmerkblatt\b/.test(t)) return 'merkblatt';
  if (/\banleitung\b/.test(t)) return 'anleitung';
  if (/\bcheckliste\b/.test(t)) return 'checkliste';
  return 'leitfaden';
}

/** Kurz-Kürzel des Doktyps für den Key-Infix (GROSS). */
function doktypInfix(doktyp: DoktypId): string {
  return doktyp === 'merkblatt' ? 'MERKBLATT' : doktyp === 'anleitung' ? 'ANLEITUNG' : doktyp === 'checkliste' ? 'CHECKLISTE' : 'LEITFADEN';
}

// ── KURIERT_BEKANNT: Slug → bereits kuratierter MATERIAL_REGISTER-Key (§2.6, «bestehender Key
// gewinnt») ── Dokumente der Sektion, die schon kuratiert im Register stehen. Der Adapter
// ÜBERSPRINGT sie (kuratierter Eintrag bleibt massgeblich, kein Parallel-Eintrag). Slugs aus den
// aktuellen amtlichen Titeln (4.7.2026, live). Bei Titel-Retusche ⇒ hier nachtragen (Tor warnt, A10).
export const KURIERT_BEKANNT: Readonly<Record<string, string>> = {
  'leitfaden-datenbearbeitungen-mittels-cookies-technologien': 'EDOEB-LEITFADEN-COOKIES',
  'leitfaden-meldung-datensicherheitsverletzungen-information-betroffenen-art-24': 'EDOEB-LEITFADEN-DATABREACH',
  'leitfaden-technischen-organisatorischen-massnahmen-datenschutzes-tom': 'EDOEB-LEITFADEN-TOM',
  'merkblatt-datenschutz-folgenabschaetzung-dsfa-art-22-23': 'EDOEB-MERKBLATT-DSFA',
};

/** true, wenn der Titel bereits einem kuratierten MATERIAL_REGISTER-Eintrag entspricht (⇒ skip). */
export function istKuriertBekannt(titel: string): boolean {
  return slugify(titel) in KURIERT_BEKANNT;
}

/** Dokument-ID (NEUE Dokumente): EDOEB-<DOKTYP>-<SLUG>, pfadsicher. Ein führendes Doktyp-Wort im
 *  Slug wird entfernt (kein EDOEB-MERKBLATT-MERKBLATT-…). */
export function dokKey(titel: string, doktyp: DoktypId): string {
  const slug = slugify(titel);
  const infix = doktypInfix(doktyp);
  const rest = slug.replace(new RegExp(`^${infix.toLowerCase()}-`), '');
  return `${EDOEB_ID_PREFIX}${infix}-${rest}`.toUpperCase();
}

/**
 * Extrahiert die im amtlichen Titel EXPLIZIT genannten Artikel des ZUGEORDNETEN Erlasses.
 * Bindung: die Artikelnummer(n) müssen mit der Erlass-Abkürzung im selben «Art. … <ABK>»-Ausdruck
 * stehen. «ff»-Bereiche werden NICHT extrahiert (kein sauberer Einzelartikel → Erlass-Ebene, §1).
 * Rein, deterministisch. Rückgabe = sortierte, eindeutige Korpus-Token (z. B. ['22','23']).
 */
export function artikelAusTitel(titel: string, erlassAbk: string): string[] {
  const out = new Set<string>();
  // «Art. 24 DSG» | «Art. 22 und 23 DSG» | «Art. 16 Abs. 2 lit. d DSG» → Zahlen vor der Abkürzung.
  // Wir suchen «Art.» … <Zahlenkette mit und/,> … <ABK>, ohne dazwischenliegendes «ff».
  const abk = erlassAbk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\bArt\\.?\\s*([0-9][0-9a-z\\s.,und]*?)\\s*${abk}\\b`, 'gi');
  for (const m of titel.matchAll(re)) {
    const block = m[1];
    if (/\bff\b|ff\.?/i.test(block)) continue; // Bereich → nicht artikelscharf
    for (const zahl of block.matchAll(/\b(\d+)([a-z]?)\b/g)) {
      // «Abs.»/«lit.» sind keine Artikelnummern — wir nehmen nur Zahlen, die direkt Artikel sind.
      out.add(zahl[2] ? `${zahl[1]}_${zahl[2]}` : zahl[1]);
    }
  }
  return [...out].sort((a, b) => (parseInt(a, 10) - parseInt(b, 10)) || (a < b ? -1 : a > b ? 1 : 0));
}

/** DAM-<TOKEN> aus der URL (volatil; nur quell_ids). */
export function damTokenAusUrl(url: string): string {
  const m = /\/dam\/[a-z]{2}\/sd-web\/([^/]+)\//.exec(url);
  return m ? m[1] : '';
}

/** Drift-Token = sha256/16 über (titel + datumslabel + url) — DAM-Token-in-URL = Datei-Versions-
 *  Signal (§0/A8: kein Default). */
export function driftToken(titel: string, datumLabel: string, url: string): string {
  return createHash('sha256').update(`${titel} ${datumLabel} ${url}`, 'utf8').digest('hex').slice(0, 16);
}

/** Rang aus dem Stand (intrinsisch, snapshot-stabil): neuer ⇒ höher (kleiner). Deutlich über den
 *  kuratierten EDÖB-Rängen (≤ 8) ⇒ DB-Dokumente sortieren nach den kuratierten Einträgen. */
export function dokRang(stand: string): number {
  return 100000000 - Number(stand.replace(/-/g, ''));
}

const HINWEIS_EDOEB = 'Amtliche EDÖB-Publikation, kein Gesetzesrang.';

/** Baut aus einem Roh-Download + Hub-Definition ein Dokument + seine Kante(n) (rein). */
export function baueDokUndKanten(roh: RohEdoebDok, def: EdoebHubDef, abgerufen: string): { dok: SoftLawDok; kanten: NormRefKante[] } {
  const doktyp = doktypAusTitel(roh.titel);
  const id = dokKey(roh.titel, doktyp);
  const stand = datumslabelNachIso(roh.datumLabel);
  const artikel = artikelAusTitel(roh.titel, def.erlassAbk);
  const shaId = createHash('sha256')
    .update([id, roh.titel, roh.href, stand, def.erlassKey, artikel.join(',')].join(' '), 'utf8')
    .digest('hex');
  const dok: SoftLawDok = {
    id,
    behoerde: 'EDOEB',
    doktyp,
    titel: roh.titel,
    nummer: null,
    rechtsgebiet: 'oeffentlich',
    sprache: 'de',
    rang: dokRang(stand),
    normKeys: [def.erlassKey],
    hinweis: HINWEIS_EDOEB,
    quelle_url: roh.href,
    stand,
    stand_quelle: 'hub-label',
    abgerufen,
    drift_token: driftToken(roh.titel, roh.datumLabel, roh.href),
    quell_ids: { dam_token: damTokenAusUrl(roh.href), url_basis: roh.href },
    sha: shaId,
  };
  const kanten: NormRefKante[] = [];
  if (artikel.length > 0) {
    // Artikelscharf aus dem amtlichen Titel: quelle='amtlich'. (Revisions-Downgrade in der Projektion.)
    for (const a of artikel) {
      kanten.push({
        quelldok_id: id,
        erlass_key: def.erlassKey,
        artikel: a,
        zitat_key: normalisiereZitat(`${def.erlassKey} Art. ${a.replace('_', '')}`),
        roh_zitat: roh.titel,
        konfidenz: 'regex-hoch',
        quelle: 'amtlich',
        fundstelle: '',
        fundstelle_url: null,
        stand,
        abgerufen,
      });
    }
  } else {
    // Erlass-Ebene aus kuratierter Zuordnung: quelle='kuratiert'. konfidenz='regex-niedrig' meint hier
    // die GRANULARITÄT (Erlass-Ebene, nicht auf einen Artikel pinpointed) — die Methode ist 'kuratiert'.
    kanten.push({
      quelldok_id: id,
      erlass_key: def.erlassKey,
      artikel: '',
      zitat_key: normalisiereZitat(def.erlassKey),
      roh_zitat: roh.titel,
      konfidenz: 'regex-niedrig',
      quelle: 'kuratiert',
      fundstelle: '',
      fundstelle_url: null,
      stand,
      abgerufen,
    });
  }
  return { dok, kanten };
}

// ── HTML-Segmentierung: nur die genannte Sektion, nur PDFs ──────────────────────

interface Ueberschrift { idx: number; txt: string }

/** Alle echten <h2>/<h3>-Überschriften mit Position (TOC-Links sind <a> → nicht getroffen). */
export function ueberschriften(html: string): Ueberschrift[] {
  const out: Ueberschrift[] = [];
  for (const m of html.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h\1>/g)) {
    out.push({ idx: m.index ?? 0, txt: dekodiereEntities(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim() });
  }
  return out;
}

/** Schneidet den HTML-Bereich EINER Sektion aus (von ihrer Überschrift bis zur nächsten). */
export function sektionsHtml(html: string, sektion: string): string {
  const heads = ueberschriften(html);
  const si = heads.findIndex((h) => h.txt === sektion);
  if (si < 0) throw new Error(`adapter-edoeb: Sektion «${sektion}» nicht gefunden (Hub-Redesign?).`);
  const start = heads[si].idx;
  const end = si + 1 < heads.length ? heads[si + 1].idx : html.length;
  return html.slice(start, end);
}

/** Zerlegt einen download-item-Anker in Titel + Datumslabel (null, wenn unvollständig). */
export function parseAnkerInhalt(inner: string): { titel: string; datumLabel: string } | null {
  const t = /<h4[^>]*class="[^"]*download-item__title[^"]*"[^>]*>([\s\S]*?)<\/h4>/.exec(inner);
  if (!t) return null;
  const titel = dekodiereEntities(t[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  let datumLabel = '';
  for (const s of inner.matchAll(/<span class="meta-info__item">([^<]*)<\/span>/g)) {
    const v = dekodiereEntities(s[1]).trim();
    if (istDeutschesDatumslabel(v)) { datumLabel = v; break; }
  }
  if (!titel || !datumLabel) return null;
  return { titel, datumLabel };
}

/** Extrahiert die PDF-download-items EINER Sektion (Word/Musterbriefe ausgeschlossen). */
export function parseSektion(html: string, def: EdoebHubDef): RohEdoebDok[] {
  const slice = sektionsHtml(html, def.sektion);
  const out: RohEdoebDok[] = [];
  for (const m of slice.matchAll(/<a class="download-item"[^>]*?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = dekodiereEntities(m[1]).trim();
    if (!/\.pdf$/i.test(href.split('?')[0])) continue; // nur PDF (Leitfäden/Merkblätter)
    const inhalt = parseAnkerInhalt(m[2]);
    if (!inhalt) continue;
    const dateiname = decodeURIComponent(href.split('/').pop() ?? '');
    out.push({ href, titel: inhalt.titel, datumLabel: inhalt.datumLabel, dateiname });
  }
  return out;
}

/**
 * Baut aus einem geladenen Hub-HTML die Dokumente + Kanten EINER Sektion (rein bis auf das HTML).
 * Count-Gate + Key-Eindeutigkeit; wirft bei ROT (§8: kein stiller Teil-Snapshot).
 */
export function verarbeiteHub(html: string, def: EdoebHubDef, abgerufen: string): { dokumente: SoftLawDok[]; kanten: NormRefKante[] } {
  const rohs = parseSektion(html, def);
  const dokumente: SoftLawDok[] = [];
  const kanten: NormRefKante[] = [];
  const gesehen = new Set<string>();
  for (const roh of rohs) {
    if (istKuriertBekannt(roh.titel)) continue; // bereits kuratiert → skip (§2.6, kein Duplikat)
    const { dok, kanten: ks } = baueDokUndKanten(roh, def, abgerufen);
    if (gesehen.has(dok.id)) {
      throw new Error(`adapter-edoeb: Key-Kollision '${dok.id}' in Sektion «${def.sektion}» (zwei Titel → gleicher Slug; Slug/Alias schärfen, §2.6).`);
    }
    gesehen.add(dok.id);
    dokumente.push(dok);
    kanten.push(...ks);
  }
  if (dokumente.length < def.min) {
    throw new Error(`adapter-edoeb: Sektion «${def.sektion}» nur ${dokumente.length} PDF-Dokumente (< ${def.min}) — Quell-Bruch? Snapshot NICHT schreiben.`);
  }
  return { dokumente, kanten };
}

// ══ Netz-Hülle ═══════════════════════════════════════════════════════════════

/** Höflicher GET einer Hub-Seite; prüft Content-Type (Soft-404-Erkennung, §Skill). */
export async function ladeHub(url: string, fetchImpl?: typeof fetch): Promise<string> {
  const res = await fetchMitWiederholung(url, { headers: { 'User-Agent': EDOEB_USER_AGENT, Accept: 'text/html' } }, { fetchImpl });
  const ct = res.headers.get('content-type') ?? '';
  if (!res.ok) throw new Error(`adapter-edoeb: ${url} HTTP ${res.status}.`);
  if (!/text\/html/i.test(ct)) throw new Error(`adapter-edoeb: ${url} kein text/html (Content-Type «${ct}») — Soft-404-Verdacht.`);
  const html = await res.text();
  if (html.length < 5000) throw new Error(`adapter-edoeb: ${url} verdächtig kurz (${html.length} B) — Shell?`);
  return html;
}

export interface CrawlOptionen {
  abgerufen: string; // ISO (kein Date.now, §2)
  fetchImpl?: typeof fetch;
  warte?: (ms: number) => Promise<void>;
  substrat?: (tag: string, html: string) => void;
}

/**
 * Voll-Crawl beider EDÖB-Hubs (höflich, sequentiell). Ergebnisvertrag §3. indexSha = sha256/16 über
 * die sortierte (id → drift_token)-Menge.
 */
export async function crawleEdoeb(opt: CrawlOptionen): Promise<AdapterErgebnis> {
  const warte = opt.warte ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const dokumente: SoftLawDok[] = [];
  const kanten: NormRefKante[] = [];
  let erste = true;
  for (const def of EDOEB_HUBS) {
    if (!erste) await warte(400);
    erste = false;
    const html = await ladeHub(def.hubUrl, opt.fetchImpl);
    opt.substrat?.(def.tag, sektionsHtml(html, def.sektion));
    const teil = verarbeiteHub(html, def, opt.abgerufen);
    dokumente.push(...teil.dokumente);
    kanten.push(...teil.kanten);
  }
  const idx = [...dokumente].map((d) => `${d.id}=${d.drift_token}`).sort().join('\n');
  const indexSha = createHash('sha256').update(idx, 'utf8').digest('hex').slice(0, 16);
  return { dokumente, kanten, indexSha, abgerufen: opt.abgerufen };
}
