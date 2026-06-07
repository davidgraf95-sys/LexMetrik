// ─── Abnahme-Dossier AG-Gründung generieren (Perfektion Punkt 15) ───────────
//
// Erzeugt ABNAHME-AG-BAUSTEINE.md im Repo-Root: ALLE Bausteine aller
// AG-Schemas (AG_ALLE_SCHEMAS, Mappen-Reihenfolge) als EIN Lese-Dokument
// für Davids Wort-für-Wort-Abnahme — je Baustein id · Wortlaut (text) ·
// Norm · Begründung · Hinweis · includeIf-Bedingung lesbar.
// Abgehakte Bausteine erhalten danach `verified: true` (§7: setzt die
// fachliche Abnahme durch David voraus — nie automatisch).
//
// Deterministisch (§2): kein Datum, keine Reihenfolge-Zufälle — Re-Läufe
// diffen sauber. Aufruf: npx vite-node scripts/abnahme-ag.ts

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AG_ALLE_SCHEMAS } from '../src/lib/vorlagen/gruendungAgDokumente';
import type { Bedingung } from '../src/lib/vorlagen/engine';

const ZIEL = join(import.meta.dirname, '..', 'ABNAHME-AG-BAUSTEINE.md');

// ── Bedingung → lesbarer Ausdruck ───────────────────────────────────────────

function lesbar(b: Bedingung): string {
  if ('and' in b) return b.and.map(geklammert).join(' UND ');
  if ('or' in b) return b.or.map(geklammert).join(' ODER ');
  if ('not' in b) return `NICHT (${lesbar(b.not)})`;
  if ('eq' in b) return `${b.feld} = ${JSON.stringify(b.eq)}`;
  if ('in' in b) return `${b.feld} ∈ {${b.in.map((x) => JSON.stringify(x)).join(', ')}}`;
  return `${b.feld} nicht leer`;
}
const geklammert = (b: Bedingung): string =>
  'and' in b || 'or' in b ? `(${lesbar(b)})` : lesbar(b);

// ── Markdown bauen ──────────────────────────────────────────────────────────

const teile: string[] = [];

teile.push(`# Abnahme-Dossier AG-Gründung — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme der AG-Gründungs-Schemas durch David
(fachkundige Person, CLAUDE.md §7). Je Baustein eine Abhak-Zeile; abgehakte
Bausteine werden anschliessend im Schema auf \`verified: true\` gehoben.

**Quelle:** \`src/lib/vorlagen/gruendungAgDokumente.ts\` (Registry
\`AG_ALLE_SCHEMAS\`). **Generiert:** \`npx vite-node scripts/abnahme-ag.ts\` —
nach Engine-Änderungen NEU laufen lassen, das Dossier ist eine Ableitung,
keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument;
sonst die lesbare \`includeIf\`-Bedingung über die Antwort-Felder.
«wiederholt über» = ein Absatz je Listeneintrag ({{item.…}}-Platzhalter).
{{platzhalter}} werden beim Erzeugen interpoliert; Fragment-Felder
(…Satz/…Zeile) verschwinden leer ersatzlos.
`);

let gesamt = 0;

for (const schema of AG_ALLE_SCHEMAS) {
  const kopf = [
    `Schema \`${schema.id}\` · Version ${schema.version}`,
    `Format ${schema.format ?? 'verfuegung'}`,
    `Ausgabe ${schema.ausgabeArt ?? 'fertig'}`,
  ].join(' · ');
  teile.push(`\n---\n\n## ${schema.titel}\n\n${kopf}\n\n> **Disclaimer (Fusszeile):** ${schema.disclaimer}\n`);

  schema.bausteine.forEach((b, i) => {
    gesamt += 1;
    const zeilen: string[] = [];
    zeilen.push(`\n### ${i + 1}. \`${b.id}\`${b.ueberschrift ? ` — «${b.ueberschrift}»` : ''}\n`);
    zeilen.push(`- [ ] **abgenommen** (David)`);
    if (b.norm) zeilen.push(`- **Norm:** ${b.norm}`);
    zeilen.push(`- **Aufnahme:** ${b.includeIf ? lesbar(b.includeIf) : 'immer'}`);
    if (b.wiederholeUeber) zeilen.push(`- **Wiederholt über:** \`${b.wiederholeUeber}\` (ein Absatz je Eintrag)`);
    if (b.rolle) zeilen.push(`- **Layout-Rolle:** ${b.rolle}`);
    if (b.nummeriert) zeilen.push(`- **Nummeriert** (fortlaufende Ziffer im Dokument)`);
    zeilen.push(`- **Begründung (Protokoll):** ${b.begruendung}`);
    if (b.hinweis) zeilen.push(`- **Hinweis (offengelegt):** ${b.hinweis}`);
    zeilen.push(`\n**Wortlaut:**\n`);
    zeilen.push(b.text.split('\n').map((z) => `> ${z}`.trimEnd()).join('\n'));
    teile.push(zeilen.join('\n'));
  });
}

teile.push(`\n---\n\n**Summe:** ${gesamt} Bausteine in ${AG_ALLE_SCHEMAS.length} Schemas.\n`);

writeFileSync(ZIEL, teile.join('\n'), 'utf8');
console.log(`ABNAHME-AG-BAUSTEINE.md geschrieben — ${gesamt} Bausteine, ${AG_ALLE_SCHEMAS.length} Schemas.`);
