/**
 * scripts/normtext/check-revisionen-rectifies.ts — Netz-Arm «rectifies-Ziel vs.
 * Berichtigungstext» (Fehlerbuch ROADMAP W2·18, Kontext PR #827/#828).
 *
 * Fedlex' `jolux:rectifies` kann auf das FALSCHE AS-Dokument zeigen (belegt: AS 2025 686
 * SKV — Ziel AS 2025 648 = TAFV 2, der amtliche Berichtigungstext selbst nennt aber
 * AS 2025 644 = SKV). `check:revisionen` (offline, Prüfung 8/8b) prüft nur, dass der
 * §8-Marker `plausibilitaet` konsistent mit dem GESPEICHERTEN `jolux:rectifies`-Tripel ist —
 * es prüft NICHT, ob dieses Tripel selbst mit dem amtlichen BERICHTIGUNGSTEXT (Filestore-
 * HTML des berichtigenden AS) übereinstimmt. Das ist die Lücke, die dieser Netz-Arm schliesst.
 *
 * NETZ, kein Offline-Pflichttor (Filestore-HTML nötig, s. `rectifies-berichtigung.ts`) —
 * läuft in `check:netz:kette` im selben Rhythmus wie `check:revisionen-netz`. K1 (schützt
 * Datentreue, Skill `refactoring` §7).
 *
 * Klassen je rectifies-Kante (oc → dessen `jolux:rectifies`-Ziel):
 *   uebereinstimmend  — der amtliche Berichtigungstext nennt die Fundstelle/SR des Ziels.
 *   abweichend        — er nennt eine ANDERE (Befund, §7: gelistet, nie in Prosa gedeutet —
 *                        das kann ein Fedlex-Datenfehler sein wie SKV, muss es aber nicht:
 *                        s. Docstring-Fund AIG/oc/2025/342 unten).
 *   sammelberichtigung — der Text nennt MEHR ALS EINE Fundstelle; das rectifies-Tripel
 *                        trägt nur eine davon (§8-Ehrlichkeit, wie `baueOcZuRectifiesSr`).
 *   nicht-abrufbar     — keine HTML-Manifestation oder Casemates-Hülle (Skill-Falle 3) —
 *                        eine Lücke wird GELISTET, nie geraten.
 *
 * Exit 1 NUR bei `abweichend` ohne Eintrag in `bibliothek/normtext/rectifies-ausnahmen.json`
 * (Identität = exakte oc-URI, kein Substring). `sammelberichtigung`/`nicht-abrufbar` bleiben
 * grün (dokumentierter Befund, keine Behauptung eines Fehlers).
 *
 * ── Live-Befund 12.9.2026 (Mass, nicht übernommen — Auftragstext nannte ≈16/1/1/n) ──
 * 25 rectifies-Kanten im Korpus (nicht 71 — Schätzung des Auftrags widerlegt, §0/§17
 * «messen, nicht übernehmen»): 14 uebereinstimmend, 2 abweichend, 2 sammelberichtigung,
 * 7 nicht-abrufbar (nur pdf-a/docx, keine HTML-Manifestation). EIN abweichend ist der
 * dokumentierte SKV-Fund (Ausnahmeliste). Der ZWEITE — AIG/oc/2025/342 — ist ein NEUER,
 * bislang unbelegter Fund dieses Tors: der Berichtigungstext nennt «AsylG-Änderung vom
 * 25. September 2015 (AS 2016 3101)», das rectifies-Ziel `eli/oc/2018/438` ist aber die
 * SPÄTERE «Verordnung über die abschliessende Inkraftsetzung» derselben Änderung
 * (AS 2018 2855, 2018-06-08, in Kraft 2019-03-01) — SR-Familie stimmt (AsylG), die
 * konkrete AS-Fundstelle nicht. Ob das ein Fedlex-Datenfehler ist oder eine legitime,
 * bloss anders zu vergleichende Zwei-Stufen-Inkraftsetzung, entscheidet NICHT dieses Tor
 * (§7/§8) — es bleibt bewusst ROT, bis Gegenprüfung/David den Fund einordnet (Ausnahme
 * ergänzen ODER als zweiten Fedlex-Datenfehler im Fehlerbuch verankern). Da dieser Arm
 * nur in `check:netz:kette` (Schedule/`workflow_dispatch`, s. `normen-monitor.yml`) läuft,
 * blockiert das keinen PR-Merge — es öffnet den «Bei Rot»-Aufgaben-Zettel des Monitors.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import {
  extrahiereHeadlineZitate, holeBerichtigungstext, klassifiziereBerichtigung,
  loeseBerichtigungsHtmlUrl, type RectifiesKlasse,
} from './rectifies-berichtigung.ts';
import { holeMitCache, modusAusUmgebung } from './rectifies-cache.ts';
import type { RectifiesInfo } from './revisionen-generieren.ts';

const RAW_DIR = 'bibliothek/normtext/revisionen-raw';
const AUSNAHMEN_PFAD = 'bibliothek/normtext/rectifies-ausnahmen.json';

interface Kante { erlassKey: string; oc: string; info: RectifiesInfo }
interface Ausnahme { oc: string; seit: string; belegUrl: string; begruendung: string }
type Klasse = RectifiesKlasse | 'nicht-abrufbar';
interface Befund { erlassKey: string; oc: string; klasse: Klasse; detail: string }

/** Alle rectifies-Kanten aus den committeten store-raw-Dateien (§2: kein erneuter
 *  SPARQL-Aufruf für die Kantenliste selbst — die ist bereits Teil der Pipeline-1-Ausgabe;
 *  NUR der Berichtigungstext-Abgleich unten ist der frische Netz-Schritt dieses Tors). */
export function ladeKanten(rawDir: string = RAW_DIR): Kante[] {
  if (!existsSync(rawDir)) return [];
  const kanten: Kante[] = [];
  for (const datei of readdirSync(rawDir).filter((f) => f.endsWith('.json')).sort()) {
    const erlassKey = datei.slice(0, -5);
    const raw = JSON.parse(readFileSync(`${rawDir}/${datei}`, 'utf8')) as {
      rectifiesInfoProOc?: Record<string, RectifiesInfo>;
    };
    for (const [oc, info] of Object.entries(raw.rectifiesInfoProOc ?? {})) kanten.push({ erlassKey, oc, info });
  }
  return kanten.sort((a, b) => (a.erlassKey !== b.erlassKey
    ? (a.erlassKey < b.erlassKey ? -1 : 1)
    : (a.oc < b.oc ? -1 : a.oc > b.oc ? 1 : 0)));
}

export function ladeAusnahmen(pfad: string = AUSNAHMEN_PFAD): Map<string, Ausnahme> {
  if (!existsSync(pfad)) return new Map();
  const arr = JSON.parse(readFileSync(pfad, 'utf8')) as Ausnahme[];
  return new Map(arr.map((a) => [a.oc, a]));
}

async function pruefeKante(k: Kante, modus: ReturnType<typeof modusAusUmgebung>): Promise<Befund> {
  try {
    const treffer = await holeMitCache(k.oc, async () => {
      const url = await loeseBerichtigungsHtmlUrl(k.oc);
      if (!url) throw new Error('keine html-Manifestation (nur pdf-a/docx?) — Skill-Falle 3: nie raten.');
      const html = await holeBerichtigungstext(url);
      return { url, html };
    }, modus);
    const zitate = extrahiereHeadlineZitate(treffer.html);
    const klasse = klassifiziereBerichtigung(zitate, k.info);
    const detail = klasse === 'uebereinstimmend'
      ? `Text: ${zitate.as.join(', ') || '∅'}.`
      : `Text nennt ${zitate.as.join(', ') || '∅'} (SR ${zitate.sr.join(', ') || '∅'}) — `
        + `rectifies-Ziel ${k.info.zielFundstelle ?? k.info.zielOc} (SR ${k.info.fremdeSr}).`;
    return { erlassKey: k.erlassKey, oc: k.oc, klasse, detail };
  } catch (e) {
    return { erlassKey: k.erlassKey, oc: k.oc, klasse: 'nicht-abrufbar', detail: (e as Error).message };
  }
}

async function main(): Promise<void> {
  if (!existsSync(RAW_DIR)) {
    console.error(`check:revisionen-rectifies ROT: ${RAW_DIR} fehlt — Tor kann nicht laufen (§6.7 kein stilles Grün).`);
    process.exit(2);
  }
  const kanten = ladeKanten();
  const ausnahmen = ladeAusnahmen();
  const modus = modusAusUmgebung();

  const befunde: Befund[] = [];
  for (const k of kanten) befunde.push(await pruefeKante(k, modus));

  const counts: Partial<Record<Klasse, number>> = {};
  for (const b of befunde) counts[b.klasse] = (counts[b.klasse] ?? 0) + 1;

  console.log(`check:revisionen-rectifies: ${kanten.length} rectifies-Kante(n) geprüft (Modus ${modus}).`);
  console.log(`Klassen: ${JSON.stringify(counts)}`);

  const nichtGruen = befunde
    .filter((b) => b.klasse !== 'uebereinstimmend')
    .sort((a, b) => (a.oc < b.oc ? -1 : a.oc > b.oc ? 1 : 0));
  for (const b of nichtGruen) {
    const ausnahme = b.klasse === 'abweichend' ? ausnahmen.get(b.oc) : undefined;
    const marker = ausnahme ? ` [Ausnahmeliste seit ${ausnahme.seit}]` : '';
    console.log(`  - ${b.erlassKey} ${b.oc} → ${b.klasse}${marker}: ${b.detail}`);
  }

  const rotOhneAusnahme = befunde.filter((b) => b.klasse === 'abweichend' && !ausnahmen.has(b.oc));
  if (rotOhneAusnahme.length) {
    console.error(`\ncheck:revisionen-rectifies ROT: ${rotOhneAusnahme.length} unbelegte Abweichung(en):`);
    for (const b of rotOhneAusnahme) console.error(`  - ${b.erlassKey} ${b.oc}: ${b.detail}`);
    console.error(
      `Beleg-URL amtlich prüfen und — nur bei bestätigtem Fedlex-Datenfehler (§7) — Eintrag `
      + `in ${AUSNAHMEN_PFAD} ergänzen (oc + seit + belegUrl + begruendung).`,
    );
    process.exit(1);
  }
  console.log('check:revisionen-rectifies grün: keine unbelegte Abweichung.');
}

await main();
