// scripts/entstehung/deckung-projektion.ts
// ── DIE AUSGELIEFERTE DECKUNGS-SICHT («was wir nicht haben») ──────────────────
//
// §11.5 FAHRPLAN-MATERIALIEN-VERZAHNUNG, Absatz «Deckungs-Seite (§8, Muster Lex
// /coverage)»: eine öffentliche Seite, die je Ebene und je Erlass sagt, was
// erfasst ist UND was nicht. Der Befund, der sie ausgelöst hat, steht in der
// ROADMAP (11.9.2026): ein Viertel der Synopse-Alt-Blöcke trägt kein
// Fussnoten-Ereignis — eine Vollständigkeits-Frage an den AMTLICHEN
// Fussnoten-Apparat, die man nur beantworten kann, wenn man sie zeigt.
//
// ── WARUM ÜBERHAUPT EINE PROJEKTION (und nicht «direkt aus den Artefakten») ───
// Die Zahlen liegen alle schon vor, aber in Artefakten, die kein Browser-Kanal
// sind oder sein dürfen:
//
//   bibliothek/register/entstehung-deckung.json   24 KB · liegt AUSSERHALB von
//                                                 public/, wird nie ausgeliefert
//   public/materialien/synopse/<KEY>.json         6,5 MB über 186 Shards
//   public/materialien/entstehung/<KEY>.json      692 KB über 185 Shards
//   public/materialien/register-provenienz.json   540 KB, KEIN Browser-Kanal
//   public/normtext/register.json                 1,5 MB
//
// Eine Seite, die den Bestand ÜBERBLICKT, dürfte nach §15 keine dieser Quellen
// anfassen — sie zöge 8 MB für 205 Zahlenpaare. Diese Projektion ist deshalb
// die schlanke Sicht: ~60 KB roh, ein Fetch, und nur auf DIESER Seite.
//
// ── SIE IST KEINE ZWEITE WAHRHEIT (§5) ────────────────────────────────────────
// Kein Feld wird gepflegt. Jede Zahl ist eine Auszählung über bestehende,
// bereits gegatete Artefakte; `check:entstehung` baut die Datei neu und
// vergleicht Byte für Byte (Muster der Entstehungs-Projektion E3). Auch die
// STÄNDE sind abgeleitet — aus `erzeugt`/`abgerufen` der Quellen —, damit die
// Datei ohne `Date.now()` und ohne `--datum` deterministisch ist (§2): zwei
// Läufe auf demselben Stand liefern dasselbe Byte.
//
// ── WAS SIE NICHT TUT ─────────────────────────────────────────────────────────
// Sie deutet nichts. «1144 Alt-Blöcke ohne Fussnoten-Ereignis» heisst hier
// genau das und nicht «1144 Fehler»; die Einordnung (Berichtigungen,
// Terminologie, echte Lücke) steht als Text auf der Seite und ist als
// UNGEPRÜFTE Quote gekennzeichnet — die Stichprobe belegt Einzelfälle, nicht
// die Quote (ROADMAP-Befund 11.9.2026, unverändert offen).

// Die FORM der ausgelieferten Datei steht genau einmal, in der Leseschicht
// (`src/lib/materialien/deckung.ts`) — Generator, Tor und Seite bauen gegen
// dieselben Typen (§5). Richtung wie bei den Nachbarn: scripts/ importiert aus
// src/, nie umgekehrt.
export type {
  DeckungEbene, DeckungErlassZeile, DeckungProjektion,
} from '../../src/lib/materialien/deckung.ts';
export { DECKUNG_PROFIL } from '../../src/lib/materialien/deckung.ts';

export const DECKUNG_PROJEKTION_PFAD = 'public/materialien/entstehung-deckung.json';

/** §15 · Deckel der ausgelieferten Datei. Sie ist der EINZIGE Ladekanal der
 *  Deckungs-Seite; wächst sie über diese Marke, ist nicht der Deckel falsch,
 *  sondern die Nutzlast (§8/§15) — dann wandert die Erlass-Liste in Shards.
 *
 *  Ist 12.9.2026: 78,4 KB roh / 10,8 KB gzip über 219 Erlasse (ø 340 B je
 *  Zeile). 128 KB tragen rund 145 weitere Erlasse — genug für den Bundes-
 *  Zuwachs, zu wenig für einen ganzen Kanton: kommt ZH dazu, muss die Liste
 *  geshardet werden, nicht der Deckel wachsen. */
export const DECKUNG_DECKEL = 128 * 1024;

import { DECKUNG_PROFIL as PROFIL } from '../../src/lib/materialien/deckung.ts';
import type {
  DeckungErlassZeile, DeckungProjektion,
} from '../../src/lib/materialien/deckung.ts';

/** Byte-deterministische Serialisierung (Schlüssel sortiert, Feldreihenfolge fest). */
export function serialisiereDeckungProjektion(p: DeckungProjektion): string {
  const erlasse: Record<string, DeckungErlassZeile> = {};
  for (const k of Object.keys(p.erlasse).sort()) erlasse[k] = p.erlasse[k];
  return `${JSON.stringify({ ...p, erlasse }, null, 2)}\n`;
}

// ── Quell-Formen, so schmal wie der Generator sie wirklich braucht ────────────

export interface DeckungRegisterQuelle {
  erzeugt: string;
  erlasse: Record<string, { ocFussnoten: number; ocGetroffen: number }>;
}
export interface NormRegisterEintrag { key: string; titel?: string; sr?: string | null }
export interface NormRegisterQuelle { erzeugt: string; erlasse: NormRegisterEintrag[] }
export interface EntstehungQuelle {
  abgerufen: string;
  aenderungen: Record<string, { botschaft?: string }>;
}
export interface SynopseQuelle {
  erzeugt: string;
  fensterAb: string;
  schritte: {
    ereignisOhneAenderung?: string[];
    artikel: { zustand?: string }[];
  }[];
}
export interface ProvenienzQuelle {
  erzeugt: string;
  eintraege: Record<string, {
    ereignisse?: unknown[];
    bsKanten?: { quelle?: string }[];
  }>;
}
export interface AnkerRegisterQuelle {
  erzeugt: string;
  quellen: Record<string, { ankerZahl?: number }>;
}

export interface DeckungBauEingabe {
  deckung: DeckungRegisterQuelle;
  normRegister: NormRegisterQuelle;
  /** Erlass-Key → Entstehungs-Projektion (E3). */
  entstehung: Map<string, EntstehungQuelle>;
  /** Erlass-Key → Synopse-Shard (E5). */
  synopse: Map<string, SynopseQuelle>;
  provenienz: ProvenienzQuelle;
  ankerRegister: AnkerRegisterQuelle;
  /** Zahl der Curia-Shards + deren Abrufdatum (aus den Shards gelesen). */
  curia: { geschaefte: number; abgerufen: string };
}

/** Grösster Wert einer Menge von ISO-Daten; `fallback`, wenn leer. */
function juengstes(werte: Iterable<string>, fallback: string): string {
  let max = '';
  for (const w of werte) if (w > max) max = w;
  return max || fallback;
}

/**
 * Baut die Deckungs-Projektion — rein, ohne Datei-Zugriff, ohne Uhr (§2).
 *
 * Die GRUNDGESAMTHEIT ist die VEREINIGUNG der drei Erlass-Mengen, nicht das
 * Deckungs-Register allein. Das Register führt nur Erlasse mit mindestens einer
 * oc-Fundstelle in den Artikel-Fussnoten (`misseDeckung` überspringt den Rest,
 * weil die Quote dort nicht definiert ist) — gemessen 12.9.2026 fielen so 14
 * Staatsverträge heraus, die sehr wohl ein Synopse-Fenster haben (CISG, EMRK,
 * UNO_PAKT_I/II …). Genau sie gehören auf eine Seite «was wir nicht haben»:
 * `ocFussnoten: 0` heisst dort «keine oc-Fundstelle in den Artikel-Fussnoten»,
 * und die Seite schreibt das aus, statt eine 0-%-Quote zu behaupten (§8).
 *
 * Ein Erlass ohne Synopse-Shard steht mit leeren Synopse-Feldern in der Liste
 * und nicht etwa gar nicht — «nicht erfasst» ist die Auskunft, um die es hier
 * geht.
 */
export function baueDeckungProjektion(e: DeckungBauEingabe): DeckungProjektion {
  const titel = new Map<string, { titel: string; sr?: string }>();
  for (const r of e.normRegister.erlasse) {
    if (!titel.has(r.key)) titel.set(r.key, { titel: r.titel ?? r.key, sr: r.sr ?? undefined });
  }

  const schluessel = new Set<string>([
    ...Object.keys(e.deckung.erlasse), ...e.synopse.keys(), ...e.entstehung.keys(),
  ]);

  const erlasse: Record<string, DeckungErlassZeile> = {};
  for (const key of [...schluessel].sort()) {
    const d = e.deckung.erlasse[key] ?? { ocFussnoten: 0, ocGetroffen: 0 };
    const meta = titel.get(key);
    const ent = e.entstehung.get(key);
    const zeile: DeckungErlassZeile = {
      titel: meta?.titel ?? key,
      ...(meta?.sr ? { sr: meta.sr } : {}),
      ocFussnoten: d.ocFussnoten,
      ocGetroffen: d.ocGetroffen,
      aenderungen: ent ? Object.keys(ent.aenderungen).length : 0,
      mitBotschaft: ent ? Object.values(ent.aenderungen).filter((a) => a.botschaft).length : 0,
    };
    const syn = e.synopse.get(key);
    if (syn) {
      let bloecke = 0;
      let ohne = 0;
      let konflikte = 0;
      let luecken = 0;
      for (const s of syn.schritte) {
        konflikte += s.ereignisOhneAenderung?.length ?? 0;
        for (const a of s.artikel) {
          bloecke += 1;
          if (a.zustand === 'ohne_ereignis') ohne += 1;
          if (a.zustand === 'quelle_unvollstaendig') luecken += 1;
        }
      }
      zeile.fensterAb = syn.fensterAb;
      zeile.schritte = syn.schritte.length;
      zeile.altBloecke = bloecke;
      zeile.ohneEreignis = ohne;
      zeile.konflikte = konflikte;
      zeile.quellLuecken = luecken;
    }
    erlasse[key] = zeile;
  }

  // ── Ebenen, die sich nicht aus der Erlass-Liste summieren lassen ────────────
  let ankerMit = 0;
  for (const q of Object.values(e.ankerRegister.quellen)) if ((q.ankerZahl ?? 0) > 0) ankerMit += 1;

  // BUND/BS OHNE SCHLÜSSEL-SCHNÜFFELN: ein Provenienz-Eintrag gehört zu
  // Basel-Stadt genau dann, wenn er `bsKanten` trägt — das Feld, das der
  // BS-Generator setzt. Ein Präfix-Test auf «BS-GR-» wäre eine zweite,
  // stillschweigende Herkunfts-Regel (§5) und bräche beim ersten Kanton, der
  // anders schlüsselt.
  let bsKetten = 0;
  let bsAmtlich = 0;
  let bsMaschinell = 0;
  let verfahrenBund = 0;
  let verfahrenBs = 0;
  for (const eintrag of Object.values(e.provenienz.eintraege)) {
    const hatKette = (eintrag.ereignisse?.length ?? 0) > 0;
    if (!eintrag.bsKanten) {
      if (hatKette) verfahrenBund += 1;
      continue;
    }
    bsKetten += 1;
    if (hatKette) verfahrenBs += 1;
    for (const k of eintrag.bsKanten) {
      if (k.quelle === 'amtlich') bsAmtlich += 1;
      else bsMaschinell += 1;
    }
  }

  return {
    profil: PROFIL,
    staende: {
      deckung: e.deckung.erzeugt,
      entstehung: juengstes([...e.entstehung.values()].map((x) => x.abgerufen), e.deckung.erzeugt),
      synopse: juengstes([...e.synopse.values()].map((x) => x.erzeugt), e.deckung.erzeugt),
      curia: e.curia.abgerufen,
      provenienz: e.provenienz.erzeugt,
      normtext: e.normRegister.erzeugt,
    },
    ebenen: {
      anker: {
        haben: ankerMit,
        gesamt: Object.keys(e.ankerRegister.quellen).length,
        stand: e.ankerRegister.erzeugt,
        quelle: 'Fedlex, Bundesblatt-Volltext (fedlex.admin.ch)',
      },
      curia: {
        haben: e.curia.geschaefte,
        gesamt: null,
        stand: e.curia.abgerufen,
        quelle: 'Parlamentsdienste der Bundesversammlung, Bern (Curia Vista)',
      },
      verfahrenBund: {
        haben: verfahrenBund,
        gesamt: null,
        stand: e.provenienz.erzeugt,
        quelle: 'Parlamentsdienste der Bundesversammlung, Bern (Curia Vista)',
      },
      verfahrenBs: {
        haben: verfahrenBs,
        gesamt: bsKetten,
        stand: e.provenienz.erzeugt,
        quelle: 'Grosser Rat des Kantons Basel-Stadt (grosserrat.bs.ch)',
      },
      bsKanten: { amtlich: bsAmtlich, maschinell: bsMaschinell },
      zh: {
        haben: 0,
        gesamt: null,
        stand: e.provenienz.erzeugt,
        quelle: 'Kantonsrat Zürich — noch nicht erschlossen',
      },
    },
    erlasse,
  };
}
