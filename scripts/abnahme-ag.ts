// ─── Abnahme-Dossier AG-Gründung generieren (Perfektion Punkt 15) ───────────
//
// Erzeugt ABNAHME-AG-BAUSTEINE.md im Repo-Root: ALLE Bausteine aller
// AG-Schemas (AG_ALLE_SCHEMAS, Mappen-Reihenfolge) als EIN Lese-Dokument
// für Davids Wort-für-Wort-Abnahme — je Baustein id · Wortlaut (text) ·
// Norm · Begründung · Hinweis · includeIf-Bedingung lesbar.
// Abgehakte Bausteine erhalten danach `verified: true` (§7: setzt die
// fachliche Abnahme durch David voraus — nie automatisch).
//
// Markdown-Bau in scripts/abnahmeDossier.ts (geteilt mit den übrigen
// Gebiets-Dossiers, FUNDAMENT-UMBAU Thema C). Deterministisch (§2): kein
// Datum, keine Reihenfolge-Zufälle — Re-Läufe diffen sauber.
// Aufruf: npx vite-node scripts/abnahme-ag.ts

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AG_ALLE_SCHEMAS } from '../src/lib/vorlagen/gruendungAgDokumente';
import { abnahmeDossier } from './abnahmeDossier';

const ZIEL = join(import.meta.dirname, '..', 'ABNAHME-AG-BAUSTEINE.md');

const KOPF = `# Abnahme-Dossier AG-Gründung — alle Bausteine Wort für Wort

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
`;

writeFileSync(ZIEL, abnahmeDossier(AG_ALLE_SCHEMAS, KOPF), 'utf8');
console.log(`ABNAHME-AG-BAUSTEINE.md geschrieben — ${AG_ALLE_SCHEMAS.length} Schemas.`);
