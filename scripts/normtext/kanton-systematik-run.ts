/**
 * Generator: holt je importiertem Kanton den amtlichen Systematik-Baum (Top-Level-
 * Sachgebiete) von der clex/LexWork-API und schreibt ihn nach
 * public/normtext/kanton-systematik.json. Quelle:
 *   GET https://<host>/api/de/systematic_categories
 *   → [ { systematic_category: { systematic_number, name, children:[…] } }, … ]
 *
 * Damit gruppiert die UI einen kantonalen Vollkorpus nach der ECHTEN amtlichen
 * Systematik des Kantons (§7: aus der Quelle geholt, nicht hartcodiert/abgetippt;
 * §2: deterministisch). Die Top-Level-Nummern sind kanton-spezifisch (BS 1–9,
 * UR 1/2/3/9 + 10/20/…/70, ZG zusätzlich 10) — die UI macht Längster-Präfix-Match.
 *
 * Host je Kanton wird aus der quelleUrl der Snapshots (register.json) abgeleitet,
 * also läuft der Generator automatisch für jeden neu importierten clex-Kanton.
 * Kantone ohne clex-API (z. B. BE: PDF-Register) erscheinen nicht und fallen in
 * der UI auf den neutralen «Bereich N» zurück (§8).
 */
import { readFileSync, writeFileSync } from 'fs';
import { fetchMitWiederholung } from './netz-retry.ts';
// Single Source of Truth (§5): exakt dieselbe präfix-bewahrende Normalisierung
// wie der Lookup in der UI (src/lib/normtext/systematik.ts:sachgruppe).
import { systematikSchluessel } from '../../src/lib/normtext/systematik.ts';

interface Sachgebiet { nummer: string; name: string; }
/** Pro Kanton: Top-Level-Sachgebiete mit ihren Untergruppen (2. Ebene) für die
 *  Anzeige + Index jedes Baum-Knotens (präfix-bewahrender Schlüssel via
 *  systematikSchluessel: reine Ziffern «640100» bzw. Namespace «BaB#152110») →
 *  [Top-Nummer, Untergruppe-Nummer] seiner Vorfahren. So ordnet die UI einen
 *  Erlass über Längster-Präfix-Match seinem Sachgebiet UND seiner Untergruppe zu
 *  — korrekt auch bei AI (Hunderter), UR (10/20/…), ZG (+10) UND beim
 *  Gemeinderecht (BaB/BeB/BeE/RiB/RiE), das nie an numerische Wurzeln kippt. */
interface KantonSystematik {
  roots: Array<Sachgebiet & { kinder: Sachgebiet[] }>;
  index: Record<string, [string, string]>;
}

type ApiKnoten = {
  systematic_category?: {
    systematic_number?: string;
    name?: string;
    children?: ApiKnoten[];
  };
};

async function holeSystematik(host: string): Promise<KantonSystematik> {
  const res = await fetchMitWiederholung(
    `https://${host}/api/de/systematic_categories`,
    undefined,
    { versuche: 4 },
  );
  if (!res.ok) throw new Error(`systematic_categories ${host}: HTTP ${res.status}`);
  const roh = (await res.json()) as ApiKnoten[];

  const roots: Array<Sachgebiet & { kinder: Sachgebiet[] }> = [];
  const index: Record<string, [string, string]> = {};
  // Jeden Knoten auf [Top-Vorfahr, Untergruppe-Vorfahr] abbilden. top = Wurzel,
  // sub = Knoten der 2. Ebene (bleibt für tiefere Knoten konstant).
  const lauf = (knoten: ApiKnoten[], top: string, parentSub: string): void => {
    for (const k of knoten) {
      const c = k.systematic_category;
      if (!c?.systematic_number) continue;
      // Untergruppe = der Knoten der 2. Ebene. parentSub leer → ich BIN die 2.
      // Ebene (meine eigene Nummer); sonst erbe ich die Untergruppe meines Vorfahren.
      const meinSub = parentSub || String(c.systematic_number);
      const schluessel = systematikSchluessel(String(c.systematic_number));
      if (schluessel && !(schluessel in index)) index[schluessel] = [top, meinSub];
      if (Array.isArray(c.children)) lauf(c.children, top, meinSub);
    }
  };
  for (const k of roh) {
    const c = k.systematic_category;
    if (!c?.systematic_number || !c?.name) continue;
    const nummer = String(c.systematic_number);
    const kinder: Sachgebiet[] = (c.children ?? [])
      .map((ch) => ch.systematic_category)
      .filter((cc): cc is NonNullable<typeof cc> => !!cc?.systematic_number && !!cc?.name)
      .map((cc) => ({ nummer: String(cc.systematic_number), name: String(cc.name).trim() }));
    roots.push({ nummer, name: String(c.name).trim(), kinder });
    const schluessel = systematikSchluessel(nummer);
    if (schluessel) index[schluessel] = [nummer, ''];
    if (Array.isArray(c.children)) lauf(c.children, nummer, '');
  }
  return { roots, index };
}

const reg = JSON.parse(readFileSync('public/normtext/register.json', 'utf8')) as {
  erlasse?: Array<{ ebene?: string; kanton?: string; quelleUrl?: string }>;
};
const erlasse = reg.erlasse ?? [];

// Host je Kanton aus dem ersten kantonalen Snapshot mit quelleUrl.
const hostProKanton = new Map<string, string>();
for (const e of erlasse) {
  if (e.ebene !== 'kanton' || !e.kanton || !e.quelleUrl) continue;
  if (hostProKanton.has(e.kanton)) continue;
  try {
    hostProKanton.set(e.kanton, new URL(e.quelleUrl).host);
  } catch {
    /* defekte URL ignorieren */
  }
}

console.log(`[kanton-systematik] ${hostProKanton.size} Kantone mit Snapshots gefunden`);
const out: Record<string, KantonSystematik> = {};
for (const [kt, host] of [...hostProKanton].sort()) {
  try {
    const sys = await holeSystematik(host);
    if (sys.roots.length === 0) {
      console.log(`  ${kt} (${host}): 0 Top-Level — übersprungen`);
      continue;
    }
    out[kt] = sys;
    console.log(`  ${kt} (${host}): ${sys.roots.length} Top-Level, ${Object.keys(sys.index).length} Knoten`);
  } catch (e) {
    console.log(`  ${kt} (${host}): FEHLER ${(e as Error).message} — übersprungen (Fallback neutral)`);
  }
}

const sortiert: Record<string, KantonSystematik> = {};
for (const k of Object.keys(out).sort()) sortiert[k] = out[k];
writeFileSync(
  'public/normtext/kanton-systematik.json',
  JSON.stringify(sortiert, null, 2) + '\n',
  'utf8',
);
console.log(
  `\n[kanton-systematik] ${Object.keys(sortiert).length} Kantone → public/normtext/kanton-systematik.json`,
);
