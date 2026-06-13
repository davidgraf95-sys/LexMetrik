// ─── Generischer Abnahme-Dossier-Bauer (FUNDAMENT-UMBAU Thema C, Schritt 1) ──
//
// Erzeugt aus einer VorlageSchema-Registry EIN Lese-Dokument für Davids
// Wort-für-Wort-Abnahme (§7): je Baustein id · Wortlaut (text) · Norm ·
// Begründung · Hinweis · includeIf-Bedingung lesbar. Reine ABLEITUNG aus den
// Schemas, keine zweite Pflege-Stelle (§5). Deterministisch (§2): kein Datum,
// keine Reihenfolge-Zufälle — Re-Läufe diffen sauber.
//
// Logik 1:1 aus scripts/abnahme-ag.ts extrahiert; abnahme-ag.ts ruft diese
// Funktion mit AG_ALLE_SCHEMAS + seinem bisherigen Kopf auf → der erzeugte
// String ist byte-identisch zum bisherigen ABNAHME-AG-BAUSTEINE.md (Beweis:
// Skript neu laufen lassen, git diff leer). scripts/abnahme-dossiers.ts nutzt
// dieselbe Funktion für GmbH + die Vertrags-Vorlagen.

import type { Bedingung, VorlageSchema } from '../src/lib/vorlagen/engine';

// ── Bedingung → lesbarer Ausdruck ───────────────────────────────────────────

export function lesbar(b: Bedingung): string {
  if ('and' in b) return b.and.map(geklammert).join(' UND ');
  if ('or' in b) return b.or.map(geklammert).join(' ODER ');
  if ('not' in b) return `NICHT (${lesbar(b.not)})`;
  if ('eq' in b) return `${b.feld} = ${JSON.stringify(b.eq)}`;
  if ('in' in b) return `${b.feld} ∈ {${b.in.map((x) => JSON.stringify(x)).join(', ')}}`;
  return `${b.feld} nicht leer`;
}
const geklammert = (b: Bedingung): string =>
  'and' in b || 'or' in b ? `(${lesbar(b)})` : lesbar(b);

// ── Markdown bauen (kopf = vollständiger Markdown-Kopf inkl. «# …») ──────────

export function abnahmeDossier(schemas: VorlageSchema[], kopf: string): string {
  const teile: string[] = [kopf];
  let gesamt = 0;

  for (const schema of schemas) {
    const kopfZeile = [
      `Schema \`${schema.id}\` · Version ${schema.version}`,
      `Format ${schema.format ?? 'verfuegung'}`,
      `Ausgabe ${schema.ausgabeArt ?? 'fertig'}`,
    ].join(' · ');
    teile.push(`\n---\n\n## ${schema.titel}\n\n${kopfZeile}\n\n> **Disclaimer (Fusszeile):** ${schema.disclaimer}\n`);

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

  teile.push(`\n---\n\n**Summe:** ${gesamt} Bausteine in ${schemas.length} Schemas.\n`);
  return teile.join('\n');
}
