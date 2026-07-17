// ─── BGE-Zitat-Direktsprung (UI-NAV S2 · FAHRPLAN-UI-NAVIGATION §2) ──────────
//
// Deterministischer Parser (§2 — kein LLM, keine Fuzzy-Heuristik), der eine
// BGE-Zitat-Eingabe («BGE 152 I 65», auch ohne Präfix «152 II 19», FR «ATF»,
// IT «DTF») erkennt und — sofern der Entscheid im Bestand ist — auf den internen
// Leser-Deep-Link auflöst. KEIN neuer Suchindex (K10): die Bestands-Prüfung läuft
// über das BESTEHENDE Entscheid-Manifest (`bgeReferenz`), das die Suche ohnehin
// lazy lädt. Reine Ableitung (§3) — keine Rechtslogik.
//
// §8-Kernstück: Ist das Zitat syntaktisch gültig, aber NICHT im Bestand, liefert
// der Parser eine ehrliche «nicht im Bestand»-Auskunft samt amtlichem Link auf
// die Bundesgerichts-Fassung (search.bger.ch) — statt stillem Rauschen unter
// 40 Freitext-Treffern. Der amtliche Permalink hat exakt das Format, das die
// Entscheid-Snapshots als `quelleUrl` tragen (CLIR-`docid` `atf://152-I-65:de`).

/** Zerlegtes BGE-Zitat (rein syntaktisch, ohne Bestands-Bezug). */
export interface BgeZitat {
  band: number;
  /** Abteilung in Grossbuchstaben-Römisch, optional a/b-Suffix («I», «Ia», «III»). */
  teil: string;
  seite: number;
  /** Kanonische Anzeige «BGE 152 I 65». */
  anzeige: string;
  /** Kanonischer Index-Schlüssel «152-I-65» (Bestands-Lookup). */
  schluessel: string;
}

/** Auflösungs-Ergebnis für die Sprung-Gruppe. */
export interface BgeSprung {
  zitat: string;
  /** true ⇒ Register-Key gesetzt (interner Sprung); false ⇒ amtlicher Extern-Link. */
  imBestand: boolean;
  /** Register-Key des Entscheids, wenn im Bestand; sonst null. */
  key: string | null;
  /** Amtlicher Bundesgerichts-Link (immer gesetzt — auch als Zweitlink). A40:
   *  ein ehrlicher CLIR-SUCH-Link auf das Zitat, KEIN aus dem Zitat konstruierter
   *  `highlight_docid`-Permalink (der landet still beim falschen Entscheid, s.u.). */
  amtlichHref: string;
  /** true, solange das Entscheid-Manifest noch lädt (kein voreiliges «nicht im Bestand»). */
  laedt?: boolean;
}

// Abteilungen des BGE: I, II, III, IV, V (historisch Ia/Ib). Streng gehalten,
// damit Freitext («152 VI 3», «10 X 5») KEINEN Fehl-Sprung auslöst. Voll
// verankert (^…$): steht ein Fremdwort daneben, schlägt der Match fehl → Freitext.
const BGE_RE = /^(?:bge|atf|dtf)?\s*(\d{1,3})\s+(iv|v|i{1,3})([ab])?\s+(\d{1,4})$/i;

/** Zerlegt eine Eingabe in ein BGE-Zitat, oder null (→ normale Suche). Rein. */
export function parseBgeZitat(query: string): BgeZitat | null {
  const m = query.trim().match(BGE_RE);
  if (!m) return null;
  const band = Number(m[1]);
  const teil = m[2].toUpperCase() + (m[3] ? m[3].toLowerCase() : '');
  const seite = Number(m[4]);
  return {
    band,
    teil,
    seite,
    anzeige: `BGE ${band} ${teil} ${seite}`,
    schluessel: `${band}-${teil}-${seite}`,
  };
}

/**
 * Ehrlicher amtlicher SUCH-Link (CLIR `simple_query`) auf ein BGE-Zitat, das
 * NICHT im Bestand ist.
 *
 * A40 (David 16.7.2026, empirisch gegen bger.ch verifiziert am 17.7.2026, §7):
 * Ein aus dem Zitat KONSTRUIERTER `highlight_docid=atf://BAND-TEIL-SEITE`-Permalink
 * ist UNZUVERLÄSSIG und landet still beim FALSCHEN Entscheid. Der CLIR-`docid`
 * verlangt als «SEITE» die EXAKTE ERSTE Seite des Entscheids; tippt der Nutzer
 * eine mittendrin liegende (oder falsche) Seite, löst CLIR unangekündigt fuzzy
 * auf. Belegt: `atf://150-III-38:de` zeigt auf bger.ch «BGE 150 III 385»
 * (Entscheid Nr. 38, beginnt auf S. 385 — 5A_178/2024), NICHT die zitierte
 * Fundstelle. Die erste Seite ist aus dem blossen Nutzer-Zitat nicht ableitbar
 * → ein Permalink wäre geraten. Darum der ehrliche `simple_query`-SUCH-Link:
 * bger.ch zeigt die echte Trefferliste (für «BGE 150 III 38» u. a. den
 * enthaltenden Entscheid «BGE 150 III 34»), der Nutzer wählt selbst — statt
 * scheinbar-direkt beim falschen Entscheid zu landen.
 *
 * (Die IN-Bestand-Snapshots tragen ihren `quelleUrl`-`docid` weiterhin selbst —
 * dort ist die erste Seite aus der amtlichen Extraktion bekannt und korrekt;
 * dieser Bauer betrifft NUR das aus dem Nutzer-Zitat konstruierte Ausser-Bestand-
 * Ziel, vgl. `bge.ts` für In-Text-Zitate mit realer Erst-Seite.)
 */
export function bgerSuchLink(z: BgeZitat): string {
  const query = `BGE ${z.band} ${z.teil} ${z.seite}`;
  return `https://www.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?lang=de&type=simple_query&query_words=${encodeURIComponent(query)}`;
}

/** Baut den Bestands-Index (kanonischer Zitat-Schlüssel → Register-Key) aus dem
 *  Entscheid-Manifest. Kein Zweit-Index (K10): nutzt `bgeReferenz`/`key` direkt. */
export function baueBgeIndex(
  entscheide: readonly { bgeReferenz: string | null; key: string }[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of entscheide) {
    if (!e.bgeReferenz) continue;
    const z = parseBgeZitat(e.bgeReferenz);
    if (z && !map.has(z.schluessel)) map.set(z.schluessel, e.key);
  }
  return map;
}

/**
 * Löst eine Eingabe auf einen BGE-Sprung auf, oder null (→ normale Suche).
 * `index === null` ⇒ Manifest lädt noch: der Sprung meldet `laedt` (kein
 * voreiliges «nicht im Bestand», §8). Deterministisch, ohne Suchindex.
 */
export function parseBgeSprung(query: string, index: Map<string, string> | null): BgeSprung | null {
  const z = parseBgeZitat(query);
  if (!z) return null;
  const amtlichHref = bgerSuchLink(z);
  if (index === null) return { zitat: z.anzeige, imBestand: false, key: null, amtlichHref, laedt: true };
  const key = index.get(z.schluessel) ?? null;
  return { zitat: z.anzeige, imBestand: key !== null, key, amtlichHref };
}
