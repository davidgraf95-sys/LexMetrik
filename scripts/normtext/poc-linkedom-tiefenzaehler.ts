/**
 * POC (W2·5b, §7-Messpflicht): löst der linkedom-DOM-Parser die Regex-
 * Tiefenzähler `findeDlEnde`/`findeDdEnde` in `extrahiere-fedlex.ts` verlustfrei
 * ab? Über den GANZEN gepinnten Bund-Korpus zwei unabhängige Vergleiche:
 *
 *  (1) GRENZEN-Balance: für JEDES <dl>/<dd> liefert der Regex-Zähler eine
 *      balancierte, korrekt mit </dl>/</dd> terminierte Grenze (die exakte
 *      Aufgabe der Tiefenzähler).
 *  (2) DOM-Wahrheit: die Regex-TAG-Zählung (worauf die Zähler beruhen) stimmt je
 *      Artikel mit der linkedom-ELEMENT-Zählung überein — es gibt keine
 *      Phantom-Tags (Kommentare/Script/Attribut-Strings), die den Regex-Zähler
 *      gegenüber dem DOM verschieben würden.
 *
 * Verdikt: 0 Abweichungen in (1)+(2) = die Regex-Zähler sind DOM-äquivalent →
 * ein Umbau wäre verhaltensneutral (kein fachlicher Gewinn) → Regex BEHALTEN.
 * Abweichungen = je Fall gegen das amtliche HTML klassifizieren (Regex-Bug →
 * migrieren; malformed-Edge → Entscheid). NICHT Teil der gate-Kette (Messung).
 */
import { readFileSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { findeDlEnde, findeDdEnde } from './extrahiere-fedlex.ts';
import { parseFedlexCacheEintraege } from './inventar-bund.ts';

const z = (s: string, re: RegExp) => (s.match(re) ?? []).length;

const shell = readFileSync('scripts/fedlex-cache.sh', 'utf8');
const eintraege = parseFedlexCacheEintraege(shell);

let dlGrenzen = 0, ddGrenzen = 0, artScan = 0;
const grenzAbw: string[] = [];
const zaehlAbw: string[] = [];

for (const e of eintraege) {
  const pfad = `/tmp/${e.name}.html`;
  if (!existsSync(pfad)) continue;
  const html = readFileSync(pfad, 'utf8');
  const artRe = /<article[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/article>/gi;
  let am: RegExpExecArray | null;
  while ((am = artRe.exec(html)) !== null) {
    artScan++;
    const inner = am[2].replace(/<div\s+class="footnotes">[\s\S]*$/i, '');
    if (!/<dl\b/i.test(inner)) continue;

    // (2) DOM-Wahrheit: Regex-Tag-Zählung vs linkedom-Element-Zählung.
    const { document } = parseHTML(`<div>${inner}</div>`);
    const domDl = document.querySelectorAll('dl').length;
    const domDd = document.querySelectorAll('dd').length;
    const reDl = z(inner, /<dl\b/gi);
    const reDd = z(inner, /<dd\b/gi);
    if (domDl !== reDl || domDd !== reDd) {
      if (zaehlAbw.length < 10) zaehlAbw.push(`${e.name}/${am[1]}: dl regex=${reDl} dom=${domDl} · dd regex=${reDd} dom=${domDd}`);
    }

    // (1) Grenzen-Balance der Regex-Tiefenzähler.
    const dlOpenRe = /<dl\b[^>]*>/gi;
    let dm: RegExpExecArray | null;
    while ((dm = dlOpenRe.exec(inner)) !== null) {
      dlGrenzen++;
      const slice = inner.slice(dm.index, findeDlEnde(inner, dm.index));
      if (z(slice, /<dl\b/gi) !== z(slice, /<\/dl>/gi) || !slice.endsWith('</dl>')) {
        if (grenzAbw.length < 10) grenzAbw.push(`dl ${e.name}/${am[1]} @${dm.index}`);
      }
    }
    const ddOpenRe = /<dd\b[^>]*>/gi;
    let em: RegExpExecArray | null;
    while ((em = ddOpenRe.exec(inner)) !== null) {
      ddGrenzen++;
      const startIdx = em.index + em[0].length;
      const voll = inner.slice(em.index, findeDdEnde(inner, startIdx) + '</dd>'.length);
      if (z(voll, /<dd\b/gi) !== z(voll, /<\/dd>/gi) || !voll.endsWith('</dd>')) {
        if (grenzAbw.length < 10) grenzAbw.push(`dd ${e.name}/${am[1]} @${em.index}`);
      }
    }
  }
}

console.log(`\n=== POC linkedom vs Regex-Tiefenzähler — ${eintraege.length} Erlasse, ${artScan} Artikel ===`);
console.log(`(1) Grenzen-Balance:  ${dlGrenzen} <dl> + ${ddGrenzen} <dd> geprüft · Abweichungen: ${grenzAbw.length}`);
console.log(`(2) Tag- vs DOM-Zählung (Artikel mit <dl>): Abweichungen: ${zaehlAbw.length}`);
if (grenzAbw.length) { console.log('\nGrenz-Abweichungen:'); grenzAbw.forEach((a) => console.log('  ·', a)); }
if (zaehlAbw.length) { console.log('\nZähl-Abweichungen:'); zaehlAbw.forEach((a) => console.log('  ·', a)); }
const total = grenzAbw.length + zaehlAbw.length;
console.log(`\nVERDIKT: ${total === 0
  ? '0 Abweichungen — Regex-Tiefenzähler sind DOM-äquivalent. Umbau verhaltensneutral → Regex BEHALTEN (kein Gewinn, unnötiges Risiko + linkedom-Laufzeit).'
  : `${total} Abweichung(en) — je Fall gegen amtliches HTML klassifizieren.`}`);
