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

/** /app/(de|fr)/texts_of_law/<lawId> — Host + Sprache + lawId. */
const LEXWORK = /^https:\/\/([^/]+)\/app\/(de|fr)\/texts_of_law\/(.+)$/;

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
    // Führendes 'www.' strippen: die LexWork-API wird unter dem nackten Host
    // ausgeliefert (Spike-Vertrag), während die Seiten-URL teils mit 'www.'
    // verlinkt. Der Host steuert nur die API-Abfrage; die Live-quelleUrl bleibt
    // im Orchestrator die originale /app/-URL (unverändert).
    const host = m[1].replace(/^www\./, '');
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

/** Alle kantonalen Tarifquellen, die NICHT über LexWork erreichbar sind
 *  (PDF, zhlex-HTML, lexfind, silgeneve, rsn, m3.ti, …) — dedupliziert nach
 *  (kanton, quelleUrl). */
export function sammleFallback(): FallbackEintrag[] {
  const eintraege = alleTarifEintraege();
  const gesehen = new Set<string>();
  const fallback: FallbackEintrag[] = [];

  for (const e of eintraege) {
    if (LEXWORK.test(e.quelleUrl)) continue;
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
