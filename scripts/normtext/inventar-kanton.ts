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

/** Roh-Tarif-Eintrag, wie er in den Daten steht (nur die hier relevanten Felder). */
interface TarifEintrag {
  kanton: string;
  erlassName: string;
  erlassNr: string;
  artikel: string;
  quelleUrl: string;
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
  kanton: string; // 'NE' | 'GE'
  profil: 'ne' | 'ge';
  quelleUrl: string; // die exakte .htm-URL (Manifest-Key)
  erlassName: string;
  erlassNr: string;
  artikel: KantonInventarArtikel[];
}

/** /app/(de|fr)/texts_of_law/<lawId> — Host + Sprache + lawId. */
const LEXWORK = /^https:\/\/([^/]+)\/app\/(de|fr)\/texts_of_law\/(.+)$/;

/** Statische .htm-Erlasssammlungen mit strukturiertem Word-Export, je Profil:
 *   NE: rsn.ne.ch …/htm/*.htm   ·   GE: silgeneve.ch …/*.htm
 *  (lexfind.ch, m3.ti u.a. bleiben echter Fallback — kein eigener Adapter.) */
const HTM_QUELLEN: Array<{ muster: RegExp; profil: 'ne' | 'ge' }> = [
  { muster: /^https:\/\/rsn\.ne\.ch\/.*\.htm$/i, profil: 'ne' },
  { muster: /^https:\/\/silgeneve\.ch\/.*\.htm$/i, profil: 'ge' },
];

/** Liefert das HTM-Profil einer URL oder null (kein HTM-Adapter zuständig). */
function htmProfil(url: string): 'ne' | 'ge' | null {
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
    typeof o.quelleUrl === 'string'
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
 *   Eintrag ist über die Identität des Objekts oder den Tripel-Schlüssel eindeutig.) */
function alleTarifEintraege(): TarifEintrag[] {
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
    const lawId = m[3];

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
        quelleUrl: e.quelleUrl,
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
  return [...gruppen.values()].filter((g) => g.artikel.length > 0);
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

/** Alle kantonalen Tarifquellen, die WEDER über LexWork NOCH über den HTM-
 *  Adapter (NE/GE) erschlossen sind (PDF, zhlex-HTML, lexfind, m3.ti, …) —
 *  dedupliziert nach (kanton, quelleUrl). */
export function sammleFallback(): FallbackEintrag[] {
  const eintraege = alleTarifEintraege();
  const gesehen = new Set<string>();
  const fallback: FallbackEintrag[] = [];

  for (const e of eintraege) {
    if (LEXWORK.test(e.quelleUrl)) continue;
    if (htmProfil(e.quelleUrl)) continue; // jetzt über HTM-Adapter erschlossen
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
