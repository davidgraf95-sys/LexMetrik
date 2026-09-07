/**
 * ─── check:tarif-drift — Fassungs-Drift der kantonalen Tarif-Stammdaten ──────
 *
 * WARUM (Blindflug-Präzedenz): für Norm-Snapshots existiert Drift-Erkennung
 * (`check:normtext-netz`, `check:fedlex-versionen`); für die ~954 TARIFZAHLEN in
 * `src/data/tarif/**` gab es keine. Belegter Schaden: SG GKV sGS 941.12 hing an
 * LexWork-Version 2808 (Stand 1.3.2012), amtlich galt seit 1.7.2026 Version
 * 3863 — unbemerkt bis zur Handprüfung 13.8.2026 (`bibliothek/register/
 * parameter-verfall.md`). Dieses Tor macht genau diese Klasse maschinell rot.
 *
 * WAS es prüft: je Eintrag die hinterlegte Fassung (Fassungskennung aus der
 * `quelleUrl` bzw. das Datum aus `stand`, projiziert über `stand.ts`) gegen die
 * amtlich geltende Fassung der Quelle. Verdikte: aktuell · DRIFT · unklar ·
 * unerreichbar. «unklar» und «unerreichbar» sind NIE grün (§8).
 *
 * WAS es NICHT prüft: Tarif-WERTE. Ein DRIFT-Befund sagt «die zitierte Fassung
 * ist überholt», nicht «die Zahl ist falsch» — die Nachverifikation der Werte
 * ist fachliche Arbeit (§7/§8, Abnahme durch David).
 *
 * ADAPTER (alle wiederverwendet, kein neuer Portal-Code):
 *   · LexWork `/app/{de|fr}/texts_of_law/{id}`   → `lexworkApiUrl()` aus
 *     scripts/normtext/lexwork-url.ts, Netz über
 *     `fetchMitWiederholung()` aus scripts/normtext/netz-retry.ts.
 *     Geltende Fassung = `current_version.id` + deren In-Kraft-Datum.
 *   · LexWork-Versions-PDF `/api/{lang}/versions/{N}/…` → die URL PINNT die
 *     Fassung N. Der Erlass wird über die Systematiknummer aus `erlassNr` am
 *     selben Host aufgelöst und N gegen `current_version.id` verglichen.
 *     (Das ist exakt die SG-2808-Klasse.)
 *   · ZH `zh.ch/…/erlass-{nr}-{beschluss}-{inkraft}-{suppl}.html` → Vergleich
 *     gegen `ZH_QUELLEN` (scripts/normtext/zh-quellen.ts), das die Registry-URL
 *     der geltenden Fassung führt. Dessen eigene Aktualität bewacht bereits
 *     `zh-quellen-aufloesen.ts` als Teil von `check:normtext-netz` (Rot-Beweis
 *     dort 31.8.2026) — darum hier ohne eigenen Netz-Zugriff.
 *   · alles Übrige (lexfind, rsn.ne, silgeneve, m3.ti, PDF-Ablagen, rsju,
 *     prestations.vd) → «unklar: kein Adapter». Ehrlich statt still grün.
 *
 * NETZ-DISZIPLIN (§ Auftrag): höchstens EINE Abfrage je distinkter Quelle pro
 * Lauf (Ergebnis-Cache über den Quell-Schlüssel), serieller Abstand, Timeout,
 * Retry-Limit aus `netz-retry.ts`. Fehler = «unerreichbar», nie stilles Grün.
 *
 * AUFRUF
 *   npm run check:tarif-drift                 # Netz, Tabelle, Exit 1 bei DRIFT
 *   npm run check:tarif-drift -- --offline    # nur die offline entscheidbaren
 *                                             # Adapter (ZH) + Stand-Projektion
 *   npm run check:tarif-drift -- --streng     # unklar/unerreichbar kippen auch
 *   npm run check:tarif-drift -- --nur=SG     # auf einen Kanton eingrenzen
 *
 * §2: keine Rechenlogik, kein Date.now in der Beurteilung (drift-logik.ts ist rein).
 */

import { alleTarifEintraege, type TarifEintrag } from '../normtext/inventar-kanton.ts';
import { lexworkApiUrl } from '../normtext/lexwork-url.ts';
import { fetchMitWiederholung } from '../normtext/netz-retry.ts';
import { ZH_QUELLEN } from '../normtext/zh-quellen.ts';
import { standDatum } from './stand.ts';
import { beurteile, zaehle, exitCode, type QuellFassung, type Verdikt } from './drift-logik.ts';

const UA = 'LexMetrik-Import/1.0 (kontakt: david.graf95@gmail.com)';
const ABSTAND_MS = 700; // höflich gegen die Kantonsportale (seriell)
const TIMEOUT_MS = 20_000;

const schlaf = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// ─── Quell-Klassifikation ────────────────────────────────────────────────────

type Adapter = 'lexwork' | 'lexwork-version' | 'zh' | null;

const LEXWORK_APP = /^https:\/\/([^/]+)\/app\/(de|fr|it)\/texts_of_law\/(.+)$/;
const LEXWORK_VERSION = /^https:\/\/([^/]+)\/api\/(de|fr|it)\/versions\/(\d+)\//;
const ZH_ERLASS = /^https:\/\/www\.zh\.ch\/.*\/zhlex-ls\/erlass-([0-9_]+)-\d{4}_\d{2}_\d{2}-\d{4}_\d{2}_\d{2}-\d+\.html$/;

/** Host einer URL, ohne bei leerer/kaputter URL zu werfen (§8: sichtbar, nicht laut). */
function hostVon(url: string): string {
  const m = url.match(/^https?:\/\/([^/]+)/);
  return m ? m[1] : '(keine quelleUrl)';
}

function adapterFuer(url: string): Adapter {
  if (LEXWORK_APP.test(url)) return 'lexwork';
  if (LEXWORK_VERSION.test(url)) return 'lexwork-version';
  if (ZH_ERLASS.test(url)) return 'zh';
  return null;
}

/**
 * Systematiknummer aus dem `erlassNr`-String — die erste Zahlengruppe der Form
 * «N» oder «N.N[.N…]» («sGS 941.12» → 941.12, «BR 210.370» → 210.370,
 * «SRL 258» → 258, «914.5 (GB-GebV); 821.5 (GebT)» → 914.5).
 * Die Auflösung wird gegen die Antwort GEGENGEPRÜFT (`systematic_number`),
 * damit eine falsch geratene Nummer nie ein Verdikt trägt (§7).
 */
export function systematikNummer(erlassNr: string): { nr: string } | { mehrdeutig: string[] } | null {
  const alle = [...new Set([...erlassNr.matchAll(/\b(\d+(?:\.\d+)*)\b/g)].map((m) => m[1]))];
  if (alle.length === 0) return null;
  // MEHRDEUTIG statt «erste gewinnt» (§7, Befund 6.9.2026): SG führt
  // «914.5 (GB-GebV); 821.5 (GebT)» — die erste Nummer aufzulösen ergab ein
  // Verdikt über den FALSCHEN Erlass (GB-GebV statt GebT). Ein geratener
  // Bezug darf nie ein Verdikt tragen; solche Einträge werden «unklar».
  if (alle.length > 1) return { mehrdeutig: alle };
  return { nr: alle[0] };
}

// ─── LexWork-Abfrage (eine je Erlass, Ergebnis gecacht) ──────────────────────

interface LexWorkAntwort {
  systematischeNr: string | null;
  versionsId: string | null;
  inKraftIso: string | null;
  aufgehoben: boolean;
}

/**
 * In-Kraft-Datum aus `version_dates_str`.
 *
 * ERWEITERUNG gegenüber `inKraftSeit()` (scripts/normtext/adapter-lexwork.ts):
 * jene Funktion kennt «in Kraft seit» (de) und «en vigueur …» (fr). SG schreibt
 * aber «Aktuelle Fassung in Vollzug seit: 01.07.2026» — empirisch belegt
 * 6.9.2026 an sGS 941.12. Ohne diese Variante fiele der Stand auf `enactment`
 * (2012-03-01) zurück und ein SG-Erlass sähe ewig aktuell aus.
 * Die gemeinsame Wurzel wird NICHT hier geflickt: `inKraftSeit()` speist die
 * Norm-Snapshot-Stände, ein Eingriff dort ändert Snapshot-Daten (anderer
 * Risikopfad, eigener Schritt). Befund + Wurzel-Fix-Vorschlag stehen im
 * Bericht zu W3-TARIF-STAND (§17).
 */
export function inVollzugSeit(versionDatesStr: string | undefined): string | null {
  if (!versionDatesStr) return null;
  const m = versionDatesStr.match(
    /(?:in\s+Kraft|in\s+Vollzug|en\s+vigueur)\s*(?:seit|depuis|dès|des)?\s*(?:le\s+)?:?\s*(\d{2})\.(\d{2})\.(\d{4})/i,
  );
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Nur ein strikt ISO-formatiertes Datum (YYYY-MM-DD) gilt als belegt. */
export function nurIso(wert: string | null | undefined): string | null {
  return typeof wert === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(wert) ? wert : null;
}

async function holeLexWorkMeta(url: string): Promise<LexWorkAntwort> {
  await schlaf(ABSTAND_MS);
  // Timeout als Option: netz-retry setzt das `signal` je Versuch selbst
  // (Code-Lupe 6.9.2026 — ein `signal` im init wäre wirkungslos).
  const res = await fetchMitWiederholung(
    url,
    { headers: { 'User-Agent': UA, Accept: 'application/json' } },
    { timeoutMs: TIMEOUT_MS },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status} auf ${url}`);
  // Soft-404-Shell am Content-Type erkennen, nicht am Status (scraping-Skill
  // Fakt 3; dieselbe Falle, die LexWorkShellError in adapter-lexwork.ts fängt).
  const ct = res.headers?.get?.('content-type') ?? '';
  if (ct && !/json/i.test(ct)) throw new Error(`Content-Type "${ct}" statt JSON auf ${url} (Portal-Shell?)`);
  const json = (await res.json()) as {
    text_of_law?: {
      systematic_number?: string;
      abrogated?: boolean;
      enactment?: string;
      current_version?: { id?: number; version_dates_str?: string } | null;
    };
  };
  const tol = json.text_of_law;
  if (!tol) throw new Error(`kein text_of_law im JSON von ${url}`);
  const cur = tol.current_version ?? null;
  return {
    systematischeNr: tol.systematic_number ?? null,
    versionsId: cur?.id != null ? String(cur.id) : null,
    // `enactment` ist ein Portal-Fremddatum: nur strikt ISO übernehmen, sonst null
    // (⇒ Verdikt «unklar» statt String-Vergleich; Code-Lupe 6.9.2026, wie inKraftSeit()).
    inKraftIso: inVollzugSeit(cur?.version_dates_str) ?? nurIso(tol.enactment),
    aufgehoben: tol.abrogated === true,
  };
}

// ─── ZH (offline gegen ZH_QUELLEN) ───────────────────────────────────────────

/** «211_11» → «211.11» (LS-Nummer in der Registry-URL). */
function zhNummer(url: string): string | null {
  const m = url.match(ZH_ERLASS);
  return m ? m[1].replace(/_/g, '.') : null;
}

function zhQuellFassung(url: string): { quelle: QuellFassung | null; fehler: string | null } {
  const nr = zhNummer(url);
  if (!nr) return { quelle: null, fehler: null };
  const q = ZH_QUELLEN.find((z) => z.nr === nr);
  if (!q) {
    return {
      quelle: null,
      fehler: null, // → «unklar: kein Adapter»-Pfad, mit eigener Begründung unten
    };
  }
  return {
    quelle: { kennung: q.registryUrl, standIso: null, anzeige: `ZH_QUELLEN ${q.nr} (${q.registryUrl.split('-').pop()})` },
    fehler: null,
  };
}

// ─── Lauf ────────────────────────────────────────────────────────────────────

interface Zeile {
  kanton: string;
  erlassNr: string;
  tarif: string;
  standHinterlegt: string;
  standIso: string;
  quellFassung: string;
  verdikt: Verdikt;
  begruendung: string;
}

/** Quell-Schlüssel: alles, was dieselbe eine Netz-Abfrage teilt. */
function quellSchluessel(e: TarifEintrag): string {
  const a = adapterFuer(e.quelleUrl);
  if (a === 'lexwork') {
    const m = e.quelleUrl.match(LEXWORK_APP)!;
    return `lexwork|${m[1]}|${m[2]}|${m[3]}`;
  }
  if (a === 'lexwork-version') {
    const m = e.quelleUrl.match(LEXWORK_VERSION)!;
    const n = systematikNummer(e.erlassNr);
    const nr = n && 'nr' in n ? n.nr : `?${e.erlassNr}`;
    return `lexwork-version|${m[1]}|${m[2]}|${nr}`;
  }
  return `${a ?? 'ohne'}|${e.quelleUrl}`;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const offline = argv.includes('--offline');
  const streng = argv.includes('--streng');
  const nurArg = argv.find((a) => a.startsWith('--nur='));
  const nurKanton = nurArg ? nurArg.slice('--nur='.length).toUpperCase() : null;

  const eintraege = alleTarifEintraege()
    .filter((e) => (nurKanton ? e.kanton === nurKanton : true))
    .sort((a, b) =>
      a.kanton !== b.kanton ? a.kanton.localeCompare(b.kanton)
        : a.erlassNr !== b.erlassNr ? a.erlassNr.localeCompare(b.erlassNr)
          : a.artikel.localeCompare(b.artikel));

  // Eine Abfrage je Quell-Schlüssel (Netz-Disziplin).
  const cache = new Map<string, { quelle: QuellFassung | null; fehler: string | null; grundOhne?: string }>();
  const zeilen: Zeile[] = [];

  for (const e of eintraege) {
    const schluessel = quellSchluessel(e);
    if (!cache.has(schluessel)) {
      cache.set(schluessel, await erhebe(e, offline));
    }
    const { quelle, fehler, grundOhne } = cache.get(schluessel)!;
    const stand = standDatum(e.stand);
    const hinterlegt = { kennung: hinterlegteKennung(e), stand };
    const b = beurteile(hinterlegt, quelle, fehler);
    zeilen.push({
      kanton: e.kanton,
      erlassNr: e.erlassNr,
      tarif: `${e.erlassNr} ${e.artikel}`.trim(),
      standHinterlegt: e.stand,
      standIso: stand.iso ?? '—',
      quellFassung: quelle?.anzeige ?? (fehler ? 'unerreichbar' : (grundOhne ?? 'kein Adapter')),
      verdikt: b.verdikt,
      begruendung: grundOhne && !quelle && !fehler ? grundOhne : b.begruendung,
    });
  }

  drucke(zeilen, offline, streng);
  const z = zaehle(zeilen.map((r) => r.verdikt));
  process.exit(exitCode(z, streng));
}

/** Fassungskennung, die die `quelleUrl` selbst pinnt (sonst null). */
function hinterlegteKennung(e: TarifEintrag): string | null {
  const mv = e.quelleUrl.match(LEXWORK_VERSION);
  if (mv) return mv[3];
  if (ZH_ERLASS.test(e.quelleUrl)) return e.quelleUrl;
  return null;
}

async function erhebe(
  e: TarifEintrag,
  offline: boolean,
): Promise<{ quelle: QuellFassung | null; fehler: string | null; grundOhne?: string }> {
  const a = adapterFuer(e.quelleUrl);
  if (a === null) {
    return { quelle: null, fehler: null, grundOhne: `kein Adapter für ${hostVon(e.quelleUrl)}` };
  }
  if (a === 'zh') {
    const r = zhQuellFassung(e.quelleUrl);
    if (!r.quelle) {
      return { quelle: null, fehler: null, grundOhne: `ZH ${zhNummer(e.quelleUrl)} nicht in ZH_QUELLEN — erst über zh-quellen-aufloesen.ts aufnehmen` };
    }
    return r;
  }
  if (offline) return { quelle: null, fehler: null, grundOhne: 'Netz-Adapter, im --offline-Lauf nicht abgefragt' };

  try {
    if (a === 'lexwork') {
      const api = lexworkApiUrl(e.quelleUrl);
      if (!api) return { quelle: null, fehler: 'LexWork-URL nicht in API-Form überführbar' };
      const r = await holeLexWorkMeta(api);
      return { quelle: alsQuellFassung(r), fehler: null };
    }
    // lexwork-version: Erlass über die Systematiknummer am selben Host auflösen
    // (dieselbe /app/ → /api/-Übersetzung, damit es genau EINE Regel dafür gibt).
    const m = e.quelleUrl.match(LEXWORK_VERSION)!;
    const n = systematikNummer(e.erlassNr);
    if (n === null) {
      return { quelle: null, fehler: null, grundOhne: `erlassNr «${e.erlassNr}» nennt keine Systematiknummer — Erlass nicht auflösbar` };
    }
    if ('mehrdeutig' in n) {
      return {
        quelle: null,
        fehler: null,
        grundOhne: `erlassNr «${e.erlassNr}» nennt ${n.mehrdeutig.length} Systematiknummern (${n.mehrdeutig.join(', ')}) — Erlass nicht eindeutig auflösbar`,
      };
    }
    const nr = n.nr;
    const api = lexworkApiUrl(`https://${m[1]}/app/${m[2]}/texts_of_law/${nr}`);
    if (!api) return { quelle: null, fehler: 'Auflöse-URL nicht bildbar' };
    const r = await holeLexWorkMeta(api);
    // §7 Identitäts-Gegenprüfung: die Antwort muss DIESE Nummer tragen.
    if (r.systematischeNr !== null && r.systematischeNr !== nr) {
      return { quelle: null, fehler: `Auflösung ergab ${r.systematischeNr}, erwartet ${nr} — Nummer nicht identisch` };
    }
    return { quelle: alsQuellFassung(r), fehler: null };
  } catch (err) {
    return { quelle: null, fehler: err instanceof Error ? err.message : String(err) };
  }
}

function alsQuellFassung(r: LexWorkAntwort): QuellFassung {
  const teile = [
    r.versionsId ? `Version ${r.versionsId}` : null,
    r.inKraftIso ? `seit ${r.inKraftIso}` : null,
    r.aufgehoben ? 'AUFGEHOBEN' : null,
  ].filter(Boolean);
  return { kennung: r.versionsId, standIso: r.inKraftIso, anzeige: teile.join(', ') || '—', abrogated: r.aufgehoben };
}

// ─── Ausgabe ─────────────────────────────────────────────────────────────────

function kuerze(s: string, n: number): string {
  return s.length <= n ? s.padEnd(n) : `${s.slice(0, n - 1)}…`;
}

function drucke(zeilen: Zeile[], offline: boolean, streng: boolean): void {
  const z = zaehle(zeilen.map((r) => r.verdikt));
  console.log(`check:tarif-drift — ${zeilen.length} Tarif-Einträge${offline ? ' (--offline)' : ''}${streng ? ' (--streng)' : ''}\n`);

  const drift = zeilen.filter((r) => r.verdikt === 'DRIFT');
  if (drift.length) {
    // Ein Erlass trägt oft Dutzende Einträge (Geschäftsarten/Eintragsarten) mit
    // demselben Stand. Gebündelt je (Kanton, Erlass, Stand, Quellfassung) —
    // sonst ersäuft der Befund in Wiederholungen. Anzahl bleibt sichtbar.
    const gruppen = new Map<string, { r: Zeile; n: number }>();
    for (const r of drift) {
      const k = `${r.kanton}|${r.erlassNr}|${r.standHinterlegt}|${r.quellFassung}`;
      const g = gruppen.get(k);
      if (g) g.n++;
      else gruppen.set(k, { r, n: 1 });
    }
    console.log(`DRIFT — hinterlegte Fassung ist überholt (${drift.length} Einträge in ${gruppen.size} Erlassen; Befund, kein automatischer Fix):`);
    console.log(`  ${'Kt'.padEnd(3)}${kuerze('Erlass', 30)} ${'Einträge'.padStart(8)}  ${kuerze('Stand hinterlegt', 24)} ${kuerze('Fassung Quelle', 34)}`);
    for (const { r, n } of [...gruppen.values()].sort((a, b) =>
      a.r.kanton.localeCompare(b.r.kanton) || a.r.erlassNr.localeCompare(b.r.erlassNr))) {
      console.log(`  ${r.kanton.padEnd(3)}${kuerze(r.erlassNr, 30)} ${String(n).padStart(8)}  ${kuerze(r.standHinterlegt, 24)} ${kuerze(r.quellFassung, 34)}`);
    }
    console.log('');
  }

  const unerreichbar = zeilen.filter((r) => r.verdikt === 'unerreichbar');
  if (unerreichbar.length) {
    const nachGrund = new Map<string, number>();
    for (const r of unerreichbar) nachGrund.set(r.begruendung, (nachGrund.get(r.begruendung) ?? 0) + 1);
    console.log('unerreichbar (nie grün):');
    for (const [g, n] of [...nachGrund].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}×  ${g}`);
    console.log('');
  }

  const unklar = zeilen.filter((r) => r.verdikt === 'unklar');
  if (unklar.length) {
    const nachGrund = new Map<string, number>();
    for (const r of unklar) nachGrund.set(r.begruendung, (nachGrund.get(r.begruendung) ?? 0) + 1);
    console.log('unklar (nie grün):');
    for (const [g, n] of [...nachGrund].sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${String(n).padStart(4)}×  ${g}`);
    if (nachGrund.size > 25) console.log(`  … ${nachGrund.size - 25} weitere Gründe`);
    console.log('');
  }

  console.log(`aktuell ${z.aktuell} · DRIFT ${z.DRIFT} · unklar ${z.unklar} · unerreichbar ${z.unerreichbar}`);
  if (z.DRIFT > 0) {
    console.log(`\nFEHLER: ${z.DRIFT} Einträge zitieren eine überholte Fassung. Nachverifikation der`);
    console.log('Werte gegen die amtliche Quelle ist fachliche Arbeit (§7) — dieses Tor ändert nichts.');
  }
}

// Als CLI ausführen; beim Import aus dem Unit-Test (VITEST gesetzt) NICHT
// laufen — sonst startet ein blosser Import den Netz-Lauf und ruft process.exit.
// (Dieselbe Falle, die 6.9.2026 beim ersten Lauf dieses Tors zuschlug, weil
//  scripts/normtext/pdf-quellen-generieren.ts beim Import seinen Generator
//  startete; darum wohnt `lexworkApiUrl` jetzt in lexwork-url.ts.)
if (!process.env.VITEST) {
  main().catch((err) => {
    console.error('check:tarif-drift abgebrochen:', err);
    process.exit(1);
  });
}
