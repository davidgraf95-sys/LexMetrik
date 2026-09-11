// scripts/entstehung/curia.ts
// E4 «Entstehung am Artikel» (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.4/§11.6/§11.7):
// die Parlaments-Etappen einer Vorlage aus Curia Vista (ws.parlament.ch, OData v3).
//
// PERSONENDATEN — die harte Grenze (§11.8, Kritik B1, Entscheid David 11.9.2026 Nr. 2):
// Namen, `PersonNumber`, Fraktion und Kanton einzelner Ratsmitglieder werden weder
// gespeichert NOCH ABGEFRAGT. Jede Abfrage nennt ihre Felder über `$select`; die
// Voting-Abfrage holt ausschliesslich `IdVote,Decision,DecisionText`. Die Einzelstimmen
// verlassen den Endpunkt damit gar nicht erst in identifizierbarer Form — die Aggregation
// ist keine nachträgliche Anonymisierung, sondern die einzige Form, in der wir die Daten
// je sehen. `$select` halbiert nebenbei die Nutzlast (Business 53 866 → 544 Bytes).
//
// NUTZUNGSAUFLAGE (Zitat, Abruf 11.9.2026): «Die Daten dürfen nur mit Angabe der Quelle
// ‹Parlamentsdienste der Bundesversammlung, Bern› verwendet werden.» / «Die Daten dürfen
// inhaltlich nicht verändert werden.» Übernommene Textfelder stehen deshalb WÖRTLICH im
// Shard, jeder Shard trägt `quellenangabe` + `abgerufen`, und jede abgeleitete Zahl ist
// als eigene Auszählung beschriftet.
//
// §2: reine Parse-Funktionen getrennt vom Fetch, Ausgabe deterministisch sortiert.
import { createHash } from 'node:crypto';

export const CURIA_BASIS = 'https://ws.parlament.ch/odata.svc';
export const CURIA_QUELLENANGABE = 'Parlamentsdienste der Bundesversammlung, Bern';
/** Beschriftung jeder selbst ausgezählten Zahl (§8 + Auflage «nicht verändern»). */
export const AUSZAEHLUNG_HINWEIS = 'eigene Auszählung der amtlichen Einzelstimmen';

export type OdataZeile = Record<string, unknown>;

/**
 * OData v3 antwortet je Entität mal `{d:{results:[…]}}`, mal `{d:[…]}` (live belegt:
 * Business/Bill vs. Preconsultation/Resolution). Beides akzeptieren, alles andere ist
 * ein Fehler — nie stillschweigend als «keine Treffer» lesen (§6.7 lit. b).
 */
export function odataZeilen(json: unknown): OdataZeile[] {
  const d = (json as { d?: unknown }).d;
  if (Array.isArray(d)) return d as OdataZeile[];
  if (d && typeof d === 'object' && Array.isArray((d as { results?: unknown }).results)) {
    return (d as { results: OdataZeile[] }).results;
  }
  throw new Error('curia: unerwartete OData-Antwortform (weder d[] noch d.results[])');
}

/** `/Date(1505433600000)/` → `2017-09-15` (UTC). Unlesbar ⇒ null, nie geraten. */
export function odataDatum(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = /^\/Date\((-?\d+)(?:[+-]\d+)?\)\/$/.exec(v);
  if (!m) return null;
  return new Date(Number(m[1])).toISOString().slice(0, 10);
}

// ── Decision-Codes: FESTE, live belegte Tabelle (§2) ───────────────────────────
// `$metadata` deklariert kein Enum (R4 §2 Ziff. 4). Die Tabelle ist deshalb EMPIRISCH
// erhoben: je Code eine Abfrage `Voting?$filter=Decision eq N&$top=1` gegen den amtlichen
// Endpunkt, Abruf 11.9.2026. Codes 0, 9 und 10 liefern keine Zeile — sie existieren nicht.
// Ein unbekannter Code macht den Lauf ROT (nie in einen Sammeltopf werfen: er könnte
// «Enthaltung» heissen und würde das Stimmenverhältnis verfälschen).
export const DECISION_CODES: Readonly<Record<number, { feld: keyof StimmAggregat; amtlich: string }>> = {
  1: { feld: 'ja', amtlich: 'Ja' },
  2: { feld: 'nein', amtlich: 'Nein' },
  3: { feld: 'enthaltung', amtlich: 'Enthaltung' },
  4: { feld: 'anwesend', amtlich: 'Anwesend' },
  5: { feld: 'nichtTeilgenommen', amtlich: 'Hat nicht teilgenommen' },
  6: { feld: 'entschuldigt', amtlich: 'Entschuldigt gemäss Art. 57 Abs. 4' },
  7: { feld: 'praesidiumStimmtNicht', amtlich: 'Die Präsidentin/der Präsident stimmt nicht' },
  8: { feld: 'demissioniert', amtlich: 'Demissioniert' },
};

export interface StimmAggregat {
  ja: number; nein: number; enthaltung: number; anwesend: number;
  nichtTeilgenommen: number; entschuldigt: number;
  praesidiumStimmtNicht: number; demissioniert: number;
  /** Summe aller Zeilen = Zahl der Ratsmitglieder in dieser Abstimmung. */
  total: number;
}

export function leeresAggregat(): StimmAggregat {
  return {
    ja: 0, nein: 0, enthaltung: 0, anwesend: 0, nichtTeilgenommen: 0,
    entschuldigt: 0, praesidiumStimmtNicht: 0, demissioniert: 0, total: 0,
  };
}

/**
 * REIN: Voting-Zeilen → Aggregat. Ein unbekannter `Decision`-Code wirft (§2).
 * Es werden NUR Zähler gebildet; keine Zeile wird gespeichert.
 */
export function aggregiereStimmen(zeilen: OdataZeile[]): StimmAggregat {
  const a = leeresAggregat();
  for (const z of zeilen) {
    const code = Number(z.Decision);
    const t = DECISION_CODES[code];
    if (!t) {
      throw new Error(
        `curia: unbekannter Voting.Decision-Code ${code} («${String(z.DecisionText)}») — `
        + 'Tabelle in scripts/entstehung/curia.ts und bibliothek/register/curia-decision-codes.md '
        + 'gegen den amtlichen Endpunkt nachführen (nie in einen Sammeltopf werfen, §2).',
      );
    }
    a[t.feld] += 1;
    a.total += 1;
  }
  return a;
}

/**
 * NR oder SR? `Voting` hat KEIN `Council`-Feld (R4 §2 Ziff. 3, `$metadata` geprüft).
 * Das einzige Unterscheidungsmerkmal ist die Zeilenzahl: der Nationalrat zählt 200
 * Sitze, der Ständerat 46. Wir behaupten «Nationalrat» deshalb NUR bei einer
 * plausiblen NR-Grösse und sagen sonst «Rat nicht bestimmbar» (§8) — lieber keine
 * Zahl als eine falsch beschriftete.
 */
export function ratAusGroesse(total: number): 'Nationalrat' | null {
  return total >= 150 && total <= 200 ? 'Nationalrat' : null;
}

/** Erkennt die Schlussabstimmung sprachübergreifend (R4 §2 Ziff. 1: `Subject` ist nicht sprachrein). */
export const SCHLUSSABSTIMMUNG_RE = /Schlussabstimmung|Vote\s+final|Votazione\s+finale/i;

// ── Shard-Typen ───────────────────────────────────────────────────────────────
export interface CuriaKommission { datum: string | null; name: string; kuerzel: string | null }
export interface CuriaBeschluss {
  datum: string | null; rat: string | null; ratKuerzel: string | null;
  /** WÖRTLICH aus `ResolutionText` (Auflage «nicht verändern»). */
  text: string;
  vorlage: number | null;
}
export interface CuriaPublikation {
  datum: string | null; art: string | null; jahr: string | null; nummer: string | null;
  /** WÖRTLICH aus `ReferenceText`. */
  text: string | null;
  referendumsfrist: string | null;
}
export interface CuriaSchlussabstimmung {
  datum: string | null;
  vorlage: number | null;
  /** Rat, sofern aus der Grösse bestimmbar — sonst null (§8). */
  rat: 'Nationalrat' | null;
  aggregat: StimmAggregat;
  /** Pflicht-Beschriftung der selbst ausgezählten Zahlen. */
  beschriftung: string;
}
export interface CuriaShard {
  nummer: string;
  /** WÖRTLICH aus `Business.Title`. */
  titel: string | null;
  geschaeftstyp: string | null;
  status: string | null;
  eingereicht: string | null;
  erstrat: string | null;
  quelleUrl: string;
  quellenangabe: string;
  abgerufen: string;
  kommissionen: CuriaKommission[];
  beschluesse: CuriaBeschluss[];
  publikationen: CuriaPublikation[];
  schlussabstimmungen: CuriaSchlussabstimmung[];
}

/** Felder, die NIE in einem Shard stehen dürfen (Personendaten-Tor, §11.8). */
export const VERBOTENE_FELDER: readonly string[] = [
  'FirstName', 'LastName', 'PersonNumber', 'PersonIdCode', 'CouncillorName',
  'ParlGroupCode', 'ParlGroupName', 'Canton', 'CantonName', 'CantonAbbreviation',
  'Rapporteur', 'RapporteurName', 'SubmittedBy',
];

/** Byte-deterministische Serialisierung eines Shards. */
export function serialisiereShard(s: CuriaShard): string {
  return JSON.stringify(s, null, 2) + '\n';
}

export function shaShard(s: CuriaShard): string {
  return createHash('sha256').update(serialisiereShard(s), 'utf8').digest('hex');
}

/** Curia «17.059» → AffairId «20170059» → amtlicher Deep-Link (§7c). */
export function curiaUrl(nummer: string): string | null {
  const m = /^(\d{2}|\d{4})\.(\d{1,4})$/.exec(nummer.trim());
  if (!m) return null;
  let jahr = m[1];
  if (jahr.length === 2) jahr = (Number(jahr) <= 30 ? '20' : '19') + jahr;
  return `https://www.parlament.ch/de/ratsbetrieb/suche-curia-vista/geschaeft?AffairId=${jahr}${m[2].padStart(4, '0')}`;
}

/** Textfeld übernehmen — WÖRTLICH (Auflage «nicht verändern»), aber leere Hüllen aussortieren.
 *  Der Endpunkt liefert stellenweise den LITERALEN String «null» (live belegt an 17.059,
 *  Objective.PublicationYear/-Number): ihn als Wert zu übernehmen hiesse, «null» als
 *  Jahrgang anzuzeigen. Er zählt deshalb als fehlender Wert, nicht als Text. */
const txt = (v: unknown): string | null =>
  (typeof v === 'string' && v.trim() && v.trim().toLowerCase() !== 'null' ? v : null);
const zahl = (v: unknown): number | null => (typeof v === 'number' ? v : null);

/** REIN: Preconsultation-Zeilen → Kommissionen (Organ, nie Person), dedupliziert + sortiert. */
export function baueKommissionen(zeilen: OdataZeile[]): CuriaKommission[] {
  const m = new Map<string, CuriaKommission>();
  for (const z of zeilen) {
    const name = txt(z.CommitteeName);
    if (!name) continue;
    const k: CuriaKommission = {
      datum: odataDatum(z.PreconsultationDate),
      name,
      kuerzel: txt(z.Abbreviation1) ?? txt(z.Abbreviation) ?? txt(z.Abbreviation2),
    };
    m.set(`${k.datum ?? ''}|${k.name}`, k);
  }
  return [...m.values()].sort((a, b) => (`${a.datum ?? ''}|${a.name}` < `${b.datum ?? ''}|${b.name}` ? -1 : 1));
}

/** REIN: Resolution-Zeilen → Rats-Beschlüsse, dedupliziert + sortiert. */
export function baueBeschluesse(zeilen: OdataZeile[], vorlageJeBill: Map<string, number>): CuriaBeschluss[] {
  const m = new Map<string, CuriaBeschluss>();
  for (const z of zeilen) {
    const text = txt(z.ResolutionText);
    if (!text) continue;
    const b: CuriaBeschluss = {
      datum: odataDatum(z.ResolutionDate),
      rat: txt(z.CouncilName),
      ratKuerzel: txt(z.CouncilAbbreviation),
      text,
      vorlage: vorlageJeBill.get(String(z.IdBill)) ?? null,
    };
    m.set(`${b.datum ?? ''}|${b.rat ?? ''}|${b.vorlage ?? ''}|${b.text}`, b);
  }
  return [...m.values()].sort((a, b) => {
    const ka = `${a.datum ?? '9999'}|${String(a.vorlage ?? 99).padStart(2, '0')}|${a.rat ?? ''}|${a.text}`;
    const kb = `${b.datum ?? '9999'}|${String(b.vorlage ?? 99).padStart(2, '0')}|${b.rat ?? ''}|${b.text}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/** REIN: Objective-Zeilen → Publikationen inkl. Referendumsfrist, dedupliziert + sortiert. */
export function bauePublikationen(zeilen: OdataZeile[]): CuriaPublikation[] {
  const m = new Map<string, CuriaPublikation>();
  for (const z of zeilen) {
    const p: CuriaPublikation = {
      datum: odataDatum(z.PublicationDate),
      art: txt(z.PublicationTypeName),
      jahr: txt(z.PublicationYear),
      nummer: txt(z.PublicationNumber),
      text: txt(z.ReferenceText),
      referendumsfrist: odataDatum(z.ReferendumDeadline),
    };
    m.set(`${p.datum ?? ''}|${p.art ?? ''}|${p.jahr ?? ''}|${p.nummer ?? ''}|${p.referendumsfrist ?? ''}`, p);
  }
  return [...m.values()].sort((a, b) => {
    const ka = `${a.datum ?? '9999'}|${a.jahr ?? ''}|${(a.nummer ?? '').padStart(8, '0')}`;
    const kb = `${b.datum ?? '9999'}|${b.jahr ?? ''}|${(b.nummer ?? '').padStart(8, '0')}`;
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/** REIN: Vote-Zeilen → die Schlussabstimmungs-IDs (sprachübergreifend erkannt). */
export function schlussabstimmungsVotes(zeilen: OdataZeile[]): { id: number; datum: string | null; vorlage: number | null }[] {
  const m = new Map<number, { id: number; datum: string | null; vorlage: number | null }>();
  for (const z of zeilen) {
    if (!SCHLUSSABSTIMMUNG_RE.test(txt(z.Subject) ?? '')) continue;
    const id = Number(z.ID);
    if (!Number.isFinite(id)) continue;
    m.set(id, { id, datum: odataDatum(z.VoteEnd), vorlage: zahl(z.BillNumber) });
  }
  return [...m.values()].sort((a, b) => a.id - b.id);
}
