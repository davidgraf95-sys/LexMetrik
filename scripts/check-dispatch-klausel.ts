// scripts/check-dispatch-klausel.ts — hält den §0-Pflichtblock lauffähig.
// Ohne dieses Tor bricht ein umformatierter §0-Block erst beim nächsten Auftrag.
// 20.7.2026 (PR #315): erste Fassung prüfte nur die Vorlage, meldete GRÜN
// während `dispatch -- pruefung` ein stiller No-op war (F2(a), §6.7a) — darum
// zwei Ebenen: (A) STRUKTUR — Block+6 Punkte in der Vorlage. (B) WIRKUNG —
// `npm run dispatch -- <klasse>` liefert ihn als echter Subprozess (kein Import).
// (C, 4.8.2026): `.claude/agents/lex-<klasse>.md` trägt die Klausel eingebaut;
// dispatch-schutz.py befreit lex-*-Dispatches, solange sie byte-gleich zur
// Projektion aus dispatch-agents.ts sind — das prüft (C).
// (Varianten, 7.8.2026): read-only-Klassen pruefung/recherche tragen nur
// Punkte 1–3 (Punkt 4 Recovery-COMMIT widerspräche ihrem TABU); Byte-Gleichheit
// der gemeinsamen Punkte 1–3 wird separat geprüft (§5).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import {
  pflichtKlausel, templateLesen, KLASSEN, TEMPLATE, PALETTE, PALETTE_STAND,
  VARIANTE, varianteVon, type Klauselvariante,
} from './dispatch';
import { agentDatei, AGENTEN, AGENTS_DIR } from './dispatch-agents';

const P123: [string, RegExp][] = [
  ['1 Daten-nicht-Auftrag (F4)', /^1 DATEN, NICHT AUFTRAG\./m],
  ['2 Reproduzieren-vor-Fix (F2d)', /^2 ERST REPRODUZIEREN, DANN FIXEN\./m],
  ['3 Verteilung-statt-Einzelwert (F3)', /^3 VERTEILUNG STATT EINZELWERT\./m],
];
const P456: [string, RegExp][] = [
  ['4 Recovery-Commit (F5)', /^4 RECOVERY\./m],
  ['5 Kollisionsprüfung (F6)', /^5 KOLLISION\./m],
  ['6 Kein-Merge-im-Bau-Auftrag (F1)', /^6 KEIN MERGE IM BAU-AUFTRAG\./m],
];

/** Pflicht-Set je Variante. Die Kopfzeile ist bei `pruefung` selbst Pflichtpunkt:
 *  ohne sie könnte der Generator still den Voll-Block liefern und niemand merkte es. */
const PFLICHT: Record<Klauselvariante, [string, RegExp][]> = {
  voll: [...P123, ...P456],
  pruefung: [
    ['Kopfzeile der Prüf-Variante', /^§0 PFLICHT-KLAUSEL \(PRÜFUNG/m],
    ...P123,
  ],
};

function rot(text: string): never {
  console.log(`check:dispatch-klausel ROT — ${text}`);
  process.exit(1);
}

/** Punkte 1–3 eines Blocks, ohne Kopfzeile und ohne 4–6 — für den Byte-Vergleich. */
function punkte123(block: string): string {
  const von = block.indexOf('\n1 DATEN, NICHT AUFTRAG.');
  if (von < 0) return '';
  const bis = block.indexOf('\n4 RECOVERY.');
  return (bis < 0 ? block.slice(von) : block.slice(von, bis)).trimEnd();
}

// ── (A) Struktur der Vorlage — BEIDE Fences ───────────────────────────
const bloecke = {} as Record<Klauselvariante, string>;
for (const variante of Object.keys(PFLICHT) as Klauselvariante[]) {
  let block: string;
  try {
    block = pflichtKlausel(templateLesen(), variante);
  } catch (e) {
    rot((e as Error).message);
  }
  const fehlend = PFLICHT[variante].filter(([, re]) => !re.test(block)).map(([n]) => n);
  if (fehlend.length) {
    rot(
      `${fehlend.length} Pflichtpunkt(e) fehlen im §0-Block der Variante '${variante}' in ${TEMPLATE}:\n` +
      `${fehlend.map((n) => `  - ${n}`).join('\n')}\n\n` +
      `  Jeder Punkt deckt eine belegte Fehlerklasse (F1–F6, Vorfälle 18.–20.7.2026).\n` +
      `  Streichen ist möglich, aber nur bewusst: Punkt hier UND im Template entfernen.`);
  }
  bloecke[variante] = block;
}

// (A2) Punkte 1–3 sind in beiden Fassungen dieselben Bytes (§5) — sonst hinge
// die Wortlaut-Treue von F4/F2d/F3 an Disziplin; deckt zugleich ab, dass 4–6
// im Prüf-Fence fehlen.
if (punkte123(bloecke.pruefung) !== punkte123(bloecke.voll)) {
  rot(
    `Die Punkte 1–3 laufen zwischen Voll- und Prüf-Fence auseinander (${TEMPLATE}).\n\n` +
    `  Sie gehen WÖRTLICH und unverändert in beide Fassungen (F4/F2d/F3).\n` +
    `  Der Prüf-Fence trägt ausschliesslich Kopfzeile + Punkte 1–3.\n` +
    `  → Punkte 1–3 aus dem Voll-Fence byte-gleich in den Fence unter «### 0a ·» kopieren.`);
}

// (B0) Jede Auftragsklasse hat eine ausdrückliche Varianten-Zuordnung. Ohne das
// fiele eine neue Klasse still auf `voll` — fail-safe, aber unbemerkt.
const ohneVariante = Object.keys(KLASSEN).filter((k) => !(k in VARIANTE));
if (ohneVariante.length) {
  rot(
    `Auftragsklasse(n) ohne Eintrag in VARIANTE (scripts/dispatch.ts): ${ohneVariante.join(', ')}\n` +
    `  Jede Klasse in KLASSEN braucht eine ausdrückliche Zuordnung 'voll' | 'pruefung'.`);
}

// (B0b) `varianteVon()` ist der fail-safe Wrapper um VARIANTE — darf nicht abweichen.
// 7.8.2026 Rotprobe: Ebene (B) leitete die ERWARTUNG aus varianteVon() selbst ab;
// Sabotage (Funktion immer 'voll') meldete GRÜN trotz toter Varianten-Wahl (F2(a)
// eine Ebene höher). Seither Erwartung aus der Tabelle VARIANTE, Wrapper hier
// zusätzlich geprüft.
const wrapperDrift = Object.keys(VARIANTE).filter((k) => varianteVon(k) !== VARIANTE[k]);
if (wrapperDrift.length) {
  rot(
    `varianteVon() weicht von der Tabelle VARIANTE ab: ${wrapperDrift.join(', ')}\n` +
    `${wrapperDrift.map((k) => `  - ${k}: Tabelle '${VARIANTE[k]}', Funktion '${varianteVon(k)}'`).join('\n')}\n` +
    `  Der Wrapper darf NUR für unbekannte Klassen auf 'voll' fallen, nie für bekannte.`);
}

/**
 * (B0c) SOLL-LISTE der read-only-Klassen — einzige Menge mit verkürzter Klausel.
 * Befund B3 (Gegenprüfung 7.8.2026): Erwartung lebte nur im Vitest — eine
 * schreibende Klasse (z. B. daten) auf 'pruefung' herabgestuft + Agent-Dateien
 * regeneriert wäre konsistent und GRÜN, obwohl ihr die Punkte 4/5/6 fehlten.
 * Darum als Konstante hier: eine Herabstufung ist Reglement-Entscheid, nicht Mechanik.
 */
const READONLY_SOLL = ['pruefung', 'recherche'] as const;

const unerlaubtHerabgestuft = Object.keys(VARIANTE)
  .filter((k) => VARIANTE[k] === 'pruefung' && !(READONLY_SOLL as readonly string[]).includes(k));
if (unerlaubtHerabgestuft.length) {
  rot(
    `Klasse(n) auf die Prüf-Variante herabgestuft, die nicht in der Soll-Liste stehen: ` +
    `${unerlaubtHerabgestuft.join(', ')}\n\n` +
    `  Soll-Liste read-only: ${READONLY_SOLL.join(', ')}\n` +
    `  Die Prüf-Fassung nimmt einer Klasse die Punkte 4 (Recovery-Commit),\n` +
    `  5 (Kollisionssonden) und 6 (kein Merge im Bau-Auftrag). Das ist nur\n` +
    `  zulässig, wenn die Klasse WIRKLICH nicht schreiben darf (Werkzeug-Liste\n` +
    `  in dispatch-agents.ts, TABU in KLASSEN). Eine Herabstufung ist nie\n` +
    `  mechanisch — sie ist ein Reglement-Entscheid und wird HIER mitgeführt.`);
}

const unerlaubtHochgestuft = (READONLY_SOLL as readonly string[])
  .filter((k) => k in VARIANTE && VARIANTE[k] !== 'pruefung');
if (unerlaubtHochgestuft.length) {
  rot(
    `Read-only-Klasse(n) tragen wieder den Voll-Block: ${unerlaubtHochgestuft.join(', ')}\n` +
    `  Das ist ungefährlich (zu viel Klausel, nie zu wenig), aber unbeabsichtigt:\n` +
    `  Punkt 4 verlangt von ihnen Commits, die ihr eigenes TABU verbietet.\n` +
    `  → VARIANTE in scripts/dispatch.ts oder die Soll-Liste hier angleichen.`);
}

/**
 * (B0d) Hook erkennt Prüf-Fassung an Kopfzeile + read-only-TABU (Härtung zu
 * Befund B1) — ein wörtliches Zitat aus KLASSEN. Wird das TABU dort umformuliert,
 * entwertet das die Variante still (fail-safe, aber unbemerkt) — darum hier fixiert.
 */
const HOOK_TABU: Record<string, string> = {
  pruefung: 'TABU: nichts ändern',
  recherche: 'TABU: kein Code, keine Repo-Änderung',
};
// Geprüft wird die aktive Hook-Datei mit Marker `PRUEF_KOPF`. Der frühere
// Vorschlags-Pfad ist seit 14.8.2026 (QS-EFFIZIENZ Pkt. 2) gelöscht (§5).
const HOOK_DATEIEN = ['.claude/hooks/dispatch-schutz.py'];
const HOOK_MARKER = 'PRUEF_KOPF';

for (const [klasse, tabu] of Object.entries(HOOK_TABU)) {
  if (!KLASSEN[klasse]?.startsWith(tabu)) {
    rot(
      `Das read-only-TABU der Klasse '${klasse}' beginnt nicht mehr mit «${tabu}».\n` +
      `  Ist:  ${(KLASSEN[klasse] ?? '(Klasse fehlt)').split('\n')[0]}\n\n` +
      `  Der Hook-Vorschlag erkennt einen echten Prüf-Dispatch an genau diesem\n` +
      `  Wortlaut (zweites Merkmal neben der Kopfzeile, Befund B1). Wortlaut in\n` +
      `  KLASSEN geändert ⇒ HOOK_TABU hier und PRUEF_TABU im Hook nachziehen.`);
  }
}
const hookGeprueft: string[] = [];
for (const datei of HOOK_DATEIEN.filter((d) => existsSync(d))) {
  const inhalt = readFileSync(datei, 'utf8');
  if (!inhalt.includes(HOOK_MARKER)) continue;   // Vorgängerfassung, s. o.
  hookGeprueft.push(datei);
  const fehlt = Object.values(HOOK_TABU).filter((t) => !inhalt.includes(t));
  if (fehlt.length) {
    rot(
      `${datei} kennt ${fehlt.length} read-only-TABU nicht mehr:\n` +
      `${fehlt.map((t) => `  - «${t}»`).join('\n')}\n` +
      `  Ohne das zweite Merkmal senkt eine bloss ZITIERTE Prüf-Kopfzeile das\n` +
      `  Pflicht-Set auf drei Punkte (Befund B1 der Gegenprüfung 7.8.2026).`);
  }
}

// (B0e, Auflage B2-2, 14.8.2026): 0 geprüfte Dateien = ein Tor, das nie
// scheitern kann (§6.7) — bislang still GRÜN bei leerem HOOK_DATEIEN/Marker.
if (hookGeprueft.length === 0) {
  rot(
    `Keine Hook-Datei geprüft (0 von ${HOOK_DATEIEN.length} in HOOK_DATEIEN existiert/trägt den Marker).\n\n` +
    `  Ein Tor, das 0 Dateien prüft, kann nie scheitern und ist damit kein Tor (§6.7).\n` +
    `  → Existiert ${HOOK_DATEIEN.join(', ')}? Trägt sie noch den Marker '${HOOK_MARKER}'?`);
}

// ── (B) Wirkung: der vorgeschriebene Aufrufweg liefert den Block wirklich ──
for (const klasse of Object.keys(KLASSEN)) {
  // ERWARTUNG aus der Tabelle, nicht aus varianteVon() — s. Lektion II oben.
  const variante = VARIANTE[klasse];
  let ausgabe = '';
  try {
    ausgabe = execFileSync('npm', ['run', '--silent', 'dispatch', '--', klasse], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      timeout: 120_000,
    });
  } catch (e) {
    rot(
      `\`npm run dispatch -- ${klasse}\` ist nicht lauffähig: ${(e as Error).message}\n` +
      `  Der Generator ist der einzige Weg, auf dem Sub-Agenten den §0-Block je sehen.`);
  }

  if (!ausgabe.trim()) {
    rot(
      `\`npm run dispatch -- ${klasse}\` gibt NICHTS aus (stiller No-op, exit 0).\n\n` +
      `  Genau dieser Defekt bestand am 20.7.2026 unbemerkt, während dieses Tor\n` +
      `  grün meldete. Ein Tor, das nur die Vorlage liest, sieht ihn nie.\n` +
      `  → scripts/dispatch-cli.ts und die 'dispatch'-Zeile in package.json prüfen.`);
  }

  const fehlendB = PFLICHT[variante].filter(([, re]) => !re.test(ausgabe)).map(([n]) => n);
  if (fehlendB.length) {
    rot(
      `\`npm run dispatch -- ${klasse}\` (Variante '${variante}') liefert ` +
      `${fehlendB.length} Pflichtpunkt(e) NICHT:\n` +
      `${fehlendB.map((n) => `  - ${n}`).join('\n')}\n` +
      `  (Die Vorlage trägt sie — der Generator gibt sie nicht weiter.)`);
  }

  // read-only-Klassen müssen die Prüf-Fassung bekommen; sonst wäre eine
  // kaputte Varianten-Wahl unsichtbar (Voll-Block enthält Punkte 1–3 mit).
  if (variante === 'pruefung' && P456.some(([, re]) => re.test(ausgabe))) {
    rot(
      `\`npm run dispatch -- ${klasse}\` ist als read-only-Klasse auf die Prüf-Variante\n` +
      `  gesetzt, liefert aber Punkte aus dem Voll-Block (4/5/6). Die Varianten-Wahl\n` +
      `  greift nicht.  → VARIANTE und pflichtKlausel() in scripts/dispatch.ts prüfen.`);
  }
}

// ── (C) Agent-Typen: Definitionen sind byte-gleiche Projektionen ──────────
const md = templateLesen();
for (const klasse of Object.keys(AGENTEN)) {
  const pfad = `${AGENTS_DIR}/lex-${klasse}.md`;
  const soll = agentDatei(klasse, md);
  if (!existsSync(pfad)) {
    rot(
      `Agent-Typ ${pfad} fehlt.\n\n` +
      `  Der Hook dispatch-schutz.py befreit lex-*-Dispatches von der §0-Prompt-\n` +
      `  Prüfung, WEIL die Klausel in der Definition sitzt. Fehlt die Datei, ist\n` +
      `  die Befreiung ein Loch.  → npm run dispatch:agents`);
  }
  const ist = readFileSync(pfad, 'utf8');
  if (ist !== soll) {
    rot(
      `Agent-Typ ${pfad} weicht von der Projektion ab (Hand-Edit oder veraltete Quelle).\n` +
      `  Die Dateien sind GENERIERT (§5) — Quelle sind dispatch.ts (KLASSEN, PALETTE)\n` +
      `  und der §0-Block im Template.  → npm run dispatch:agents`);
  }
}

const pruefKlassen = Object.keys(KLASSEN).filter((k) => VARIANTE[k] === 'pruefung');
console.log(
  `check:dispatch-klausel OK — beide §0-Fences extrahierbar: voll ` +
  `(${bloecke.voll.split('\n').length} Zeilen, alle ${PFLICHT.voll.length} Punkte F1–F6), ` +
  `pruefung (${bloecke.pruefung.split('\n').length} Zeilen, Punkte 1–3 byte-gleich zum Voll-Block). ` +
  `Generator-Output stimmt für alle ${Object.keys(KLASSEN).length} Auftragsklassen ` +
  `(${Object.keys(KLASSEN).join(', ')}); read-only ⇒ Prüf-Fassung: ${pruefKlassen.join(', ')}. ` +
  `Soll-Liste read-only unverletzt (${READONLY_SOLL.join(', ')}); ` +
  `Hook-TABU-Zitat geprüft in ${hookGeprueft.length} Datei(en)` +
  `${hookGeprueft.length ? ` (${hookGeprueft.join(', ')})` : ''}. ` +
  `Byte-gleich in ${Object.keys(AGENTEN).length} Agent-Typen (lex-*). ` +
  `Palette: ${Object.entries(PALETTE).map(([s, m]) => `${s}=${m}`).join(' ')} ` +
  `(Stand ${PALETTE_STAND}).`);
