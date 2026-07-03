// scripts/datenhaltung/stabilitaets-report.ts
// QS-DATA E1 (FAHRPLAN-DATENHALTUNG §3.3 Stufe 3): Artikel-Stabilitäts-MESSUNG statt
// Behauptung. READ-ONLY — kein Tor, nur ein Report + Ablage in bibliothek/register/.
//
// Ehrliche Grenze (§8): in E1 liegt je Erlass GENAU EINE Fassung vor (der Fedlex-
// Portfolio-Paket-5-Historie-Rohstoff ist noch nicht in erlass_fassungen). Der
// eigentliche stabil/verändert/verschwunden-Diff über Revisionen ist darum NICHT
// messbar — der Report sagt das offen und misst die STRUKTUR-BASIS (art_id-Zahlen je
// Erlass), gegen die spätere Fassungen verglichen werden.
import { writeFileSync } from 'node:fs';
import { oeffneDb, frischesSchema } from './schema';
import { ingestNormtextZiel } from './ingest';

const ZIEL = 'bibliothek/register/stabilitaets-report-2026-07-03.md';

const db = oeffneDb();
frischesSchema(db, 'normtext');
ingestNormtextZiel(db);

const nErlasse = (db.prepare('SELECT COUNT(*) AS n FROM erlasse').get() as { n: number }).n;
const nArtikel = (db.prepare('SELECT COUNT(*) AS n FROM artikel').get() as { n: number }).n;
const nGrundlage = (db.prepare('SELECT COUNT(*) AS n FROM artikel WHERE grundlage IS NOT NULL').get() as { n: number }).n;

// Fassungen je Erlass (Beleg der Einzel-Fassungs-Grenze).
const fassungenProErlass = db
  .prepare('SELECT erlass_key, COUNT(*) AS n FROM erlass_fassungen GROUP BY erlass_key')
  .all() as Array<{ erlass_key: string; n: number }>;
const maxFassungen = Math.max(...fassungenProErlass.map((r) => r.n));

// art_id-Anzahl je Erlass (Struktur-Basis).
const proErlass = db
  .prepare('SELECT erlass_key, COUNT(*) AS n FROM artikel GROUP BY erlass_key ORDER BY n DESC')
  .all() as Array<{ erlass_key: string; n: number }>;
const zahlen = proErlass.map((r) => r.n).sort((a, b) => a - b);
const median = zahlen[Math.floor(zahlen.length / 2)];
const min = zahlen[0];
const max = zahlen[zahlen.length - 1];

// art_id-Muster (Haupttext vs. Schlussteil vs. Annex) — Struktur-Anteile.
function anzahlPraefix(praefix: string): number {
  return (
    db.prepare("SELECT COUNT(*) AS n FROM artikel WHERE art_id LIKE ? ESCAPE '\\'").get(`${praefix}\\_%`) as {
      n: number;
    }
  ).n;
}
const nArt = anzahlPraefix('art');
const nDisp = anzahlPraefix('disp');
const nAnnex = anzahlPraefix('annex');

const top = proErlass.slice(0, 12);
db.close();

const heute = '2026-07-03';
const md = `# Artikel-Stabilitäts-Report (QS-DATA E1) — Struktur-Basis

- **Quelle/Stand:** committete Bund-Snapshots \`public/normtext/bund/*.json\` (Stand 2026-06-30),
  reverse-ingestiert ins Zielschema \`artikel\`/\`erlass_fassungen\` (Spalten-Weg, E1).
- **Erzeugt:** ${heute} · read-only, kein Tor (\`npm run datenhaltung:stabilitaet\`).
- **Abnahme-Status:** Erstmessung (maschinell), keine Fachabnahme.

## Ehrliche Grenze (§8)

Der Fassungs-Diff aus FAHRPLAN-DATENHALTUNG §3.3 Stufe 3 (Anteil \`art_id\`s
**stabil / verändert / verschwunden** über die letzten N Revisionen) ist in E1 **NICHT
messbar**: je Erlass liegt **genau EINE Fassung** in \`erlass_fassungen\` vor
(max. Fassungen je Erlass = **${maxFassungen}**). Der Historie-Rohstoff
(Fedlex-Portfolio Paket 5 → \`erlass_fassungen\`) speist erst ab einem späteren
Ingest-Zyklus. Dieser Report misst darum nur die **Struktur-Basis**, gegen die
künftige Fassungen den Diff rechnen.

## Struktur-Basis (Messung ${heute})

| Kennzahl | Wert |
|---|---|
| Erlasse (Bund, Fassungen mit Ziel-Zeilen) | ${nErlasse} |
| Artikel-Zeilen (\`art_id\` gesamt) | ${nArtikel} |
| davon Haupttext (\`art_*\`) | ${nArt} |
| davon Schlussteil (\`disp_*\`) | ${nDisp} |
| davon Anhang (\`annex_*\`) | ${nAnnex} |
| Artikel mit Delegationsnorm (\`grundlage\`) | ${nGrundlage} |
| \`art_id\` je Erlass — min / median / max | ${min} / ${median} / ${max} |

### Grösste Erlasse (art_id-Zahl)

| Erlass | art_id |
|---|---|
${top.map((r) => `| ${r.erlass_key} | ${r.n} |`).join('\n')}

## Baseline für spätere Diffs

- Jede \`art_id\` je Erlass ist der Anker: eine **neue Fassung** vergleicht ihre
  \`art_id\`-Menge + je Artikel den \`sha\` (Umzugs-Erkennung, §3.3 Stufe 2) gegen
  diese Basis → stabil (sha gleich) / verändert (sha ≠) / verschwunden (art_id fehlt).
- Der Mechanismus steht (Spalten \`art_id\` + \`sha\` befüllt); es fehlt allein die
  zweite Fassung. Sobald \`erlass_fassungen\` > 1 Fassung je Erlass trägt, liefert
  dieselbe Query die echten Stabilitäts-Quoten.
`;

writeFileSync(ZIEL, md, 'utf8');
console.log(`Stabilitäts-Report geschrieben: ${ZIEL} (${nErlasse} Erlasse · ${nArtikel} Artikel · max Fassungen/Erlass ${maxFassungen}).`);
