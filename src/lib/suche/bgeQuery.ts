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
  /** Amtlicher Bundesgerichts-Permalink (immer gesetzt — auch als Zweitlink). */
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

/** Amtlicher Bundesgerichts-Permalink (CLIR), identisch zum Snapshot-`quelleUrl`. */
export function bgerPermalink(z: BgeZitat): string {
  const docid = `atf://${z.band}-${z.teil}-${z.seite}:de`;
  return `https://search.bger.ch/ext/eurospider/live/de/php/clir/http/index.php?highlight_docid=${encodeURIComponent(docid)}&lang=de&zoom=&type=show_document`;
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
  const amtlichHref = bgerPermalink(z);
  if (index === null) return { zitat: z.anzeige, imBestand: false, key: null, amtlichHref, laedt: true };
  const key = index.get(z.schluessel) ?? null;
  return { zitat: z.anzeige, imBestand: key !== null, key, amtlichHref };
}
