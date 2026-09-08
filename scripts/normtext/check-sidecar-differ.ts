/**
 * Differ-Beweis für eine ADDITIVE Sidecar-Regeneration (W2·5i-HIST-ANSICHT / H1).
 *
 * Frage, die dieses Skript beantwortet: Hat der Regenerations-Lauf ausser den
 * ERLAUBTEN Feldern irgendetwas verändert? Eine Regeneration aus dem Fedlex-Cache
 * läuft über den ganzen Extraktor — ein stiller Nebeneffekt (anderer Cache-Stand,
 * geänderter Parser, verlorene `pos`-Offsets aus FN-5/M14) würde ohne diesen
 * Beweis unbemerkt in den Bestand wandern. §6: Verhaltensneutralität ist zu
 * BEWEISEN, nicht zu behaupten.
 *
 * Verfahren (rein strukturell, nicht textuell — Schlüssel-Reihenfolge und
 * Formatierung sind hier bewusst NICHT das Kriterium; dafür ist `git diff` da):
 * rekursiver Vergleich alt↔neu. Jede Abweichung wird als PFAD gemeldet und gegen
 * die Erlaubnisliste gehalten:
 *
 *   · `erzeugt`                        — Generierungsdatum (§2, aus der Shell)
 *   · hinzugefügtes `…/fussnoten/N/kl` — die neue Klasse (H0-Auflage 3)
 *   · GEÄNDERTES `…/fussnoten/N/kl`    — nur mit `--kl-wechsel=A>G,…` ausdrücklich
 *                                        erlaubt (s. u.), jede Änderung wird einzeln
 *                                        mit Datei/Artikel/fn-Nr ausgewiesen
 *
 * ALLES ANDERE ist ein Fehler: fehlende/geänderte Felder, neue Fussnoten,
 * verschwundene Artikel, verschobene `pos`-Offsets, geänderte Texte. Dann
 * Exit 1 mit den ersten Belegen — STOPP, nicht committen.
 *
 * `--kl-wechsel` ist bewusst eine WHITELIST von Richtungen, nicht ein «erlaube
 * Klassenwechsel»-Schalter: eine Regeländerung, die Fussnoten NACH 'A' schiebt
 * (= neu ausblendbar macht), ist die sicherheitskritische Richtung und muss rot
 * werden, auch wenn im selben Lauf erwünschte A→G-Wechsel stattfinden.
 *
 * ─── Was dieses Skript IST und was nicht ──────────────────────────────────────
 * Es ist ein **Einmalbeweis-Skript, manuell gefahren** — KEIN Dauer-Tor: es
 * hängt nicht in `npm run gate`/`run-parallel` und läuft nicht in CI, weil es
 * einen VORZUSTAND braucht, den nur der Mensch benennen kann (welcher git-Ref ist
 * «alt»?). Es beweist eine konkrete Regeneration, nicht eine Invariante.
 * Verankert als `npm run normtext:sidecar-differ` (Gegenprüfungs-Befund B6:
 * nicht mehr versprechen als da ist).
 *
 * Aufruf:
 *   git archive HEAD public/normtext/struktur/bund | tar -x -C /tmp/alt
 *   npm run normtext:sidecar-differ -- /tmp/alt/public/normtext/struktur/bund \
 *                                      public/normtext/struktur/bund
 *   # mit erwarteten Klassenwechseln:
 *   npm run normtext:sidecar-differ -- <alt> <neu> --kl-wechsel=A>G
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2).filter((a) => a !== '--');
const wechselArg = args.find((a) => a.startsWith('--kl-wechsel='));
const stellen = args.filter((a) => !a.startsWith('--'));
const [ALT, NEU] = stellen;
if (!ALT || !NEU) {
  console.error('check-sidecar-differ: <alt-dir> <neu-dir> erforderlich.');
  process.exit(2);
}
// Erlaubte Klassenwechsel-RICHTUNGEN, mehrere kommagetrennt. Separator tolerant
// (`A>G`, `A-G`, `A:G`) — `>` ist in der Shell ein Umleitungs-Operator und muss
// gequotet werden; ein unbemerkt verschluckter Wert liess den Lauf sonst mit
// leerer Whitelist laufen und produzierte 62 «unerlaubte» Abweichungen (erlebt
// 26.7.2026). Die tolerante Form nimmt dem Aufruf diese Falle.
const ERLAUBTE_WECHSEL = new Set(
  (wechselArg ? wechselArg.slice('--kl-wechsel='.length) : '')
    .split(',')
    .map((s) => s.trim().toUpperCase().replace(/[^A-Z]+/g, '>'))
    .filter((s) => /^[AVGZU]>[AVGZU]$/.test(s)),
);
for (const d of [ALT, NEU]) {
  if (!existsSync(d)) { console.error(`check-sidecar-differ: Verzeichnis fehlt: ${d}`); process.exit(2); }
}

type Json = unknown;

/** Ein Unterschied: `art` sagt, WAS passiert ist, `pfad` WO. */
interface Diff { art: 'nur-alt' | 'nur-neu' | 'wert' | 'typ'; pfad: string; alt?: string; neu?: string }

const kurz = (v: Json): string => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return (s ?? String(v)).length > 90 ? `${(s ?? '').slice(0, 90)}…` : (s ?? String(v));
};

function vergleiche(a: Json, b: Json, pfad: string, out: Diff[]): void {
  if (a === b) return;
  const ta = Array.isArray(a) ? 'array' : a === null ? 'null' : typeof a;
  const tb = Array.isArray(b) ? 'array' : b === null ? 'null' : typeof b;
  if (ta !== tb) { out.push({ art: 'typ', pfad, alt: ta, neu: tb }); return; }
  if (ta === 'array') {
    const aa = a as Json[], bb = b as Json[];
    const n = Math.max(aa.length, bb.length);
    for (let i = 0; i < n; i++) {
      if (i >= aa.length) { out.push({ art: 'nur-neu', pfad: `${pfad}/${i}`, neu: kurz(bb[i]) }); continue; }
      if (i >= bb.length) { out.push({ art: 'nur-alt', pfad: `${pfad}/${i}`, alt: kurz(aa[i]) }); continue; }
      vergleiche(aa[i], bb[i], `${pfad}/${i}`, out);
    }
    return;
  }
  if (ta === 'object') {
    const ao = a as Record<string, Json>, bo = b as Record<string, Json>;
    // Schlüssel-MENGE vergleichen (Reihenfolge ist hier nicht das Kriterium).
    for (const k of Object.keys(ao)) {
      if (!(k in bo)) { out.push({ art: 'nur-alt', pfad: `${pfad}/${k}`, alt: kurz(ao[k]) }); continue; }
      vergleiche(ao[k], bo[k], `${pfad}/${k}`, out);
    }
    for (const k of Object.keys(bo)) {
      if (!(k in ao)) out.push({ art: 'nur-neu', pfad: `${pfad}/${k}`, neu: kurz(bo[k]) });
    }
    return;
  }
  out.push({ art: 'wert', pfad, alt: kurz(a), neu: kurz(b) });
}

// ── Erlaubnisliste: NUR diese zwei Formen sind zulässig ────────────────────────
// Der `kl`-Pfad ist streng verankert (…/fussnoten/<index>/kl) — ein `kl` irgendwo
// anders im Baum wäre ein Fehler und darf hier NICHT durchfallen.
const KL_PFAD = /\/fussnoten\/\d+\/kl$/;
const KL_WERTE = new Set(['A', 'V', 'G', 'Z', 'U']);

function istErlaubt(d: Diff, neuWert: Json): boolean {
  if (d.art === 'wert' && d.pfad === '/erzeugt') return true;
  if (d.art === 'nur-neu' && KL_PFAD.test(d.pfad)) {
    return typeof neuWert === 'string' && KL_WERTE.has(neuWert);
  }
  // GEÄNDERTE Klasse: nur wenn die Richtung ausdrücklich whitelisted ist.
  if (d.art === 'wert' && KL_PFAD.test(d.pfad)) {
    return ERLAUBTE_WECHSEL.has(`${d.alt}>${d.neu}`);
  }
  return false;
}

/** Wert an einem `/a/b/0/c`-Pfad holen (für die Wert-Prüfung der Erlaubnisliste). */
function hole(wurzel: Json, pfad: string): Json {
  let cur: Json = wurzel;
  for (const teil of pfad.split('/').filter(Boolean)) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, Json>)[teil];
  }
  return cur;
}

const dateien = new Set<string>([
  ...readdirSync(ALT).filter((f) => f.endsWith('.json')),
  ...readdirSync(NEU).filter((f) => f.endsWith('.json')),
]);

let dateienGeprueft = 0;
let erzeugtGeaendert = 0;
let klNeu = 0;
const klVerteilung: Record<string, number> = { A: 0, V: 0, G: 0, Z: 0, U: 0 };
const klWechsel: Array<{ datei: string; ort: string; nr: string; von: string; nach: string }> = [];
const klWechselProRichtung: Record<string, number> = {};
const verstoesse: string[] = [];
const fehlendeDateien: string[] = [];

for (const datei of [...dateien].sort()) {
  const pAlt = join(ALT, datei), pNeu = join(NEU, datei);
  if (!existsSync(pAlt)) { fehlendeDateien.push(`NUR NEU: ${datei}`); continue; }
  if (!existsSync(pNeu)) { fehlendeDateien.push(`NUR ALT (verschwunden!): ${datei}`); continue; }
  const alt = JSON.parse(readFileSync(pAlt, 'utf8')) as Json;
  const neu = JSON.parse(readFileSync(pNeu, 'utf8')) as Json;
  dateienGeprueft++;
  const diffs: Diff[] = [];
  vergleiche(alt, neu, '', diffs);
  for (const d of diffs) {
    const wert = d.art === 'nur-neu' ? hole(neu, d.pfad) : undefined;
    if (istErlaubt(d, wert)) {
      if (d.art === 'wert' && d.pfad === '/erzeugt') erzeugtGeaendert++;
      else if (d.art === 'wert') {
        // Klassenwechsel — EINZELN ausweisen (Artikel + fn-Nr aus dem Sidecar holen,
        // damit der Bericht ohne Nachschlagen prüfbar ist).
        const m = /^\/(?:artikel\/(.+?)|(kopf))\/fussnoten\/(\d+)\/kl$/.exec(d.pfad);
        const ort = m ? (m[1] ?? m[2]) : d.pfad;
        const idx = m ? Number(m[3]) : -1;
        const nr = (() => {
          const liste = hole(neu, d.pfad.replace(/\/\d+\/kl$/, '')) as Array<{ nr?: string }> | undefined;
          return idx >= 0 && liste?.[idx]?.nr ? String(liste[idx].nr) : `#${idx}`;
        })();
        klWechsel.push({ datei, ort, nr, von: String(d.alt), nach: String(d.neu) });
        klWechselProRichtung[`${d.alt}→${d.neu}`] = (klWechselProRichtung[`${d.alt}→${d.neu}`] ?? 0) + 1;
      } else { klNeu++; klVerteilung[String(wert)]++; }
      continue;
    }
    if (verstoesse.length < 40) {
      verstoesse.push(`${datei}${d.pfad} [${d.art}]${d.alt != null ? ` alt=${d.alt}` : ''}${d.neu != null ? ` neu=${d.neu}` : ''}`);
    } else if (verstoesse.length === 40) {
      verstoesse.push('… (weitere unterdrückt)');
    }
  }
}

// Gegenprobe: JEDE Fussnote im neuen Bestand muss ein gültiges `kl` tragen. Ohne
// diese Zählung wäre ein Lauf, der die Klassifikation gar nicht anwendet, grün
// («keine unerlaubte Abweichung») — ein Tor, das nicht scheitern kann (§6.7).
// Zusätzlich der ALT-Bestand: nur so ist «alt hatte kl + neu ergänzt == alle»
// prüfbar, und ein VERLORENES kl fällt auf (der Struktur-Vergleich oben sieht ein
// entferntes Feld zwar als `nur-alt`, aber die Bilanz macht es unmissverständlich).
const zaehleKl = (dir: string): { gesamt: number; ohne: number; verteilung: Record<string, number> } => {
  let gesamt = 0;
  let ohne = 0;
  const verteilung: Record<string, number> = { A: 0, V: 0, G: 0, Z: 0, U: 0 };
  for (const datei of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    const d = JSON.parse(readFileSync(join(dir, datei), 'utf8')) as {
      kopf?: { fussnoten?: Array<{ kl?: string }> };
      artikel?: Record<string, { fussnoten?: Array<{ kl?: string }> }>;
    };
    const listen = [d.kopf?.fussnoten ?? [], ...Object.values(d.artikel ?? {}).map((a) => a.fussnoten ?? [])];
    for (const liste of listen) {
      for (const fn of liste) {
        gesamt++;
        if (typeof fn.kl !== 'string' || !KL_WERTE.has(fn.kl)) ohne++;
        else verteilung[fn.kl]++;
      }
    }
  }
  return { gesamt, ohne, verteilung };
};
const neuStand = zaehleKl(NEU);
const altStand = zaehleKl(ALT);
const fnGesamt = neuStand.gesamt;
const fnOhneKl = neuStand.ohne;
const altMitKl = altStand.gesamt - altStand.ohne;

console.log('check-sidecar-differ — additive Regeneration (W2·5i/H1):');
console.log(`  Dateien verglichen        ${dateienGeprueft}`);
console.log(`  Fussnoten im neuen Stand  ${fnGesamt}`);
console.log(`  davon ohne gültiges kl    ${fnOhneKl}`);
console.log(`  neue kl-Felder            ${klNeu}`);
if (klNeu > 0) {
  console.log(`  davon Klassen             ${(['A', 'V', 'G', 'Z', 'U'] as const)
    .map((k) => `${k} ${klVerteilung[k]}`).join(' · ')}`);
}
// Die VOLLE Verteilung des neuen Stands — unabhängig davon, ob die Felder in
// diesem Lauf neu hinzukamen oder nur ihren Wert wechselten. Das ist die Zahl,
// die in den Bericht gehört.
console.log(`  Verteilung NEU (gesamt)   ${(['A', 'V', 'G', 'Z', 'U'] as const)
  .map((k) => `${k} ${neuStand.verteilung[k]} (${fnGesamt ? ((100 * neuStand.verteilung[k]) / fnGesamt).toFixed(1) : '0.0'}%)`).join(' · ')}`);
console.log(`  Verteilung ALT (gesamt)   ${(['A', 'V', 'G', 'Z', 'U'] as const)
  .map((k) => `${k} ${altStand.verteilung[k]}`).join(' · ')}`);
console.log(`  erzeugt-Änderungen        ${erzeugtGeaendert}`);
console.log(`  unerlaubte Abweichungen   ${verstoesse.length}`);

if (ERLAUBTE_WECHSEL.size > 0 || klWechsel.length > 0) {
  console.log(`\n  Klassenwechsel (erlaubt: ${[...ERLAUBTE_WECHSEL].join(', ') || '—'}): ${klWechsel.length}`);
  for (const [richtung, n] of Object.entries(klWechselProRichtung)) console.log(`    ${richtung}: ${n}`);
  // Einzelnachweis: jede Änderung mit Erlass/Artikel/fn-Nr — ohne diese Liste wäre
  // «62 Wechsel» eine Behauptung, kein Beweis (§6).
  for (const w of klWechsel) {
    console.log(`    ${w.von}→${w.nach}  ${w.datei.replace(/\.json$/, '')} ${w.ort} fn${w.nr}`);
  }
}

const fehler: string[] = [];
if (fehlendeDateien.length) fehler.push(`Datei-Bestand verändert:\n    ${fehlendeDateien.slice(0, 20).join('\n    ')}`);
if (verstoesse.length) fehler.push(`Unerlaubte Abweichungen (STOPP — nur 'erzeugt' + neue 'kl' sind zulässig):\n    ${verstoesse.join('\n    ')}`);
if (fnGesamt === 0) fehler.push('Keine Fussnote im neuen Stand gefunden — der Vergleich wäre leer (§6.7).');
if (fnOhneKl > 0) fehler.push(`${fnOhneKl} Fussnote(n) ohne gültiges 'kl' — die Klassifikation lief nicht (oder nicht überall).`);
// Bilanz: was der ALT-Stand schon trug + was neu hinzukam == alle Fussnoten.
// Fällt ein `kl` weg oder wird eine Fussnote übersprungen, geht die Rechnung nicht auf.
if (altMitKl + klNeu !== fnGesamt) {
  fehler.push(
    `kl-Bilanz stimmt nicht: alt trug ${altMitKl} + neu ergänzt ${klNeu} = ${altMitKl + klNeu} ≠ ${fnGesamt} Fussnoten.`,
  );
}

if (fehler.length) {
  console.error(`\nFEHLER:\n  ${fehler.join('\n  ')}`);
  process.exit(1);
}
console.log(
  `\n✓ Regeneration ist beweisbar eng: nur erzeugt, neue kl (${klNeu})`
  + `${klWechsel.length ? ` und ${klWechsel.length} whitelisted Klassenwechsel` : ''}.`
  + ' Alle übrigen Felder (inkl. pos{b,it,o,l}) unverändert.',
);
