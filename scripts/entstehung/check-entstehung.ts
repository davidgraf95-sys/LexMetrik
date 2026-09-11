// scripts/entstehung/check-entstehung.ts — Tor `check:entstehung` (CLAUDE.md §6.7,
// FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.6). VOLLSTÄNDIG OFFLINE, in `check:seriell`.
//
// Fünf Zusicherungen, jede einmal rot gezeigt (§6.7 — Rot-Beweise im PR-Body):
//  (1) DECKEL je Klasse, mit Ist-Wert in der Ausgabe (nie nur «ok»).
//  (2) ANKER-sha gegen das Quell-Register: jedes ausgelieferte Sidecar steht im Register,
//      trägt dessen HTML-sha und lässt sich byte-gleich rekonstruieren.
//  (3) CURIA-Zustandsträger ohne Verlust (E4) — Geschäfte verschwinden nie still.
//  (4) DECKUNGS-DIAGNOSE je Erlass gegen den gebuchten Stand; Rückgang ohne benannten
//      `grund` ⇒ rot (Kritik A7/C11: Korpus-Summe verdeckt den Erlass-Rückgang, und ein
//      Offline-Tor kann keinen PR-Trailer lesen — der Stand lebt im Register).
//  (5) DETERMINISMUS-WÄCHTER: ein Sidecar darf sich nie ändern, ohne dass sich der
//      Quell-Hash der amtlichen Manifestation geändert hat (§7d — Parser-Drift darf nie
//      wie eine Gesetzesänderung aussehen; Muster Lex/SFHAJJI). Durchgesetzt in zwei
//      Hälften: der Generator verweigert die stille Parser-Änderung (anker-run.ts),
//      dieses Tor verweigert das von Hand geänderte Artefakt.
//
// --schreibe bucht neue Erlasse und HÖHERE Quoten; eine Senkung schreibt es NIE von
// selbst — die verlangt einen von Hand eingetragenen `grund` (Mensch-Entscheid, §8).
import { readFileSync, existsSync, readdirSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ANKER_DIR, type AnkerSidecar } from '../../src/lib/entstehung/anker.ts';
import { shaSidecar, serialisiereSidecar } from './anker-sidecars.ts';
import { ANKER_REGISTER_PFAD, type AnkerRegister } from './anker-register.ts';
import {
  misseDeckung, serialisiereDeckung, DECKUNG_REGISTER_PFAD,
  type DeckungRegister, type DeckungErlass,
} from './deckung.ts';
import { CURIA_DIR, CURIA_ZUSTAND_PFAD, leseCuriaZustand } from './curia-zustand.ts';
import {
  VERBOTENE_FELDER, CURIA_QUELLENANGABE, AUSZAEHLUNG_HINWEIS, DECISION_CODES,
  serialisiereShard, shaShard, leeresAggregat, type CuriaShard,
} from './curia.ts';
import {
  baueProjektion, serialisiereProjektion, PROJEKTION_DIR,
  type BotschaftQuelle, type HistorieQuelle, type RevisionsQuelle,
} from './entstehung-projektion.ts';
import { BOTSCHAFTEN } from '../../src/lib/materialien/botschaften.generated.ts';

const schreibe = process.argv.includes('--schreibe');
const datumArg = process.argv.find((a) => a.startsWith('--datum='));
const heute = datumArg ? datumArg.slice('--datum='.length) : '';
if (schreibe && !/^\d{4}-\d{2}-\d{2}$/.test(heute)) {
  console.error('check:entstehung --schreibe verlangt --datum=YYYY-MM-DD (§2: kein Date.now).');
  process.exit(1);
}

const fehler: string[] = [];
const zeilen: string[] = [];

// ── (1) Deckel je Klasse, immer mit Ist-Wert ───────────────────────────────────
/** [Bezeichnung, Pfad, Deckel in Bytes, gzip?] — Deckel aus §11.6, Ist-Werte gemessen 11.9.2026. */
const DECKEL: readonly (readonly [string, string, number, boolean])[] = [
  // §11.6: Anker-Sidecars < 0,5 MB (Ist 11.9.2026: 45 KB über 4 Sidecars).
  ['Anker-Sidecars        ', ANKER_DIR, 512 * 1024, false],
  // §11.6/A16: der Historie-Baum bleibt UNANGETASTET; der Deckel ist reiner Wächter
  // (Ist 9,5 MB) — reisst er, hat jemand am Ein-Quellen-Artefakt gearbeitet.
  ['Historie-Shards       ', 'public/normtext/historie', 11 * 1024 * 1024, false],
  // §11.6: Parlaments-Shards ~2 KB je Geschäft über 385 Geschäfte ⇒ ~0,8 MB.
  ['Curia-Shards          ', CURIA_DIR, 2 * 1024 * 1024, false],
  // Ergänzung dieses Bau-Schritts (offengelegt, §7): register.json ist der einzige
  // browser-erreichbare Kanal der Verfahrensketten und wuchs durch E1 um 5 % gzip.
  // Ohne Deckel wächst er unbemerkt weiter; check:perf-budget führt ihn nicht.
  ['Materialien-Register  ', 'public/materialien/register.json', 400 * 1024, true],
  // E3 (§11.6): die Entstehungs-Projektion ist der Ladekanal der Karte am Artikel —
  // sie existiert nur, WEIL das Register als Kanal zu schwer ist. Ohne eigenen Deckel
  // könnte sie unbemerkt dorthin zurückwachsen (Ist 11.9.2026: 692 KB über 185 Erlasse,
  // ø 3,7 KB; grösste Datei AIG 43,6 KB — je Datei bewacht die Zeile darunter).
  ['Entstehungs-Projektion', PROJEKTION_DIR, 1536 * 1024, false],
];

/** §15/§11.6 · Deckel JE ERLASS für die Projektion: die Karte lädt genau EINE
 *  dieser Dateien je Klick, und die Summe verdeckt einen Ausreisser (Kritik A7 —
 *  dieselbe Denkart wie bei der Deckung: Korpus-Summe ist keine Diagnose). */
const PROJEKTION_DECKEL_DATEI = 96 * 1024;

function groesse(pfad: string, gzip: boolean): number | null {
  if (!existsSync(pfad)) return null;
  const s = statSync(pfad);
  if (s.isFile()) return gzip ? gzipSync(readFileSync(pfad)).length : s.size;
  let summe = 0;
  for (const f of readdirSync(pfad)) {
    const t = join(pfad, f);
    const st = statSync(t);
    summe += st.isDirectory() ? (groesse(t, gzip) ?? 0) : (gzip ? gzipSync(readFileSync(t)).length : st.size);
  }
  return summe;
}

const kb = (n: number): string => `${(n / 1024).toFixed(1)} KB`;
zeilen.push('check:entstehung — Deckel je Klasse (Ist / Deckel):');
for (const [name, pfad, max, gzip] of DECKEL) {
  const ist = groesse(pfad, gzip);
  if (ist === null) { zeilen.push(`  ${name} —          (noch nicht gebaut)   Deckel ${kb(max)}`); continue; }
  const anteil = ((ist / max) * 100).toFixed(0);
  zeilen.push(`  ${name} ${kb(ist).padStart(10)} / ${kb(max).padStart(10)}  (${anteil} %)${gzip ? ' gzip' : ''}`);
  if (ist > max) fehler.push(`Deckel gerissen: ${pfad} ${kb(ist)} > ${kb(max)} — nie den Deckel anheben, sondern die Nutzlast (§8/§15).`);
}

// ── Verfahrens-Ereignisse (E1): eigene Klasse, Deckel < 100 KB (§11.6) ─────────
{
  const quelle = 'src/lib/materialien/botschaften.generated.ts';
  if (existsSync(quelle)) {
    const s = readFileSync(quelle, 'utf8');
    const bloecke = s.match(/ereignisse: \[[^\]]*\]/g) ?? [];
    const bytes = bloecke.reduce((n, b) => n + Buffer.byteLength(b, 'utf8'), 0);
    const max = 100 * 1024;
    zeilen.push(`  Verfahrens-Ereignisse  ${kb(bytes).padStart(10)} / ${kb(max).padStart(10)}  (${((bytes / max) * 100).toFixed(0)} %, ${bloecke.length} Ketten)`);
    if (bytes > max) fehler.push(`Deckel gerissen: Verfahrens-Ereignisse ${kb(bytes)} > ${kb(max)} in ${quelle}.`);
    if (bloecke.length === 0) fehler.push(`${quelle} trägt keine Verfahrensketten mehr — E1 rückgebaut? (Generator neu laufen.)`);
  }
}

// ── (2) + (5) Anker-Sidecars gegen das Quell-Register ──────────────────────────
{
  const register: AnkerRegister | null = existsSync(ANKER_REGISTER_PFAD)
    ? (JSON.parse(readFileSync(ANKER_REGISTER_PFAD, 'utf8')) as AnkerRegister)
    : null;
  const dateien = existsSync(ANKER_DIR) ? readdirSync(ANKER_DIR).filter((f) => f.endsWith('.json')).sort() : [];
  if (dateien.length && !register) {
    fehler.push(`${ANKER_DIR} ist befüllt, aber ${ANKER_REGISTER_PFAD} fehlt — ohne Quell-Register ist kein Sidecar belegbar (§7d).`);
  }
  let geprueft = 0;
  if (register) {
    for (const f of dateien) {
      const key = f.slice(0, -'.json'.length);
      const roh = readFileSync(join(ANKER_DIR, f), 'utf8');
      const sidecar = JSON.parse(roh) as AnkerSidecar;
      const eintrag = register.quellen[key];
      if (!eintrag) { fehler.push(`Anker-Sidecar ${f} steht nicht im Quell-Register — Herkunft unbelegt (§7).`); continue; }
      if (sidecar.sha !== eintrag.sha) {
        fehler.push(`Anker-Sidecar ${f}: sha ${sidecar.sha.slice(0, 12)}… ≠ Register ${eintrag.sha.slice(0, 12)}… — Quell-Hash weicht ab.`);
      }
      const neu = shaSidecar(sidecar);
      if (eintrag.sidecarSha && neu !== eintrag.sidecarSha) {
        fehler.push(
          `Anker-Sidecar ${f}: Inhalt geändert, ohne dass der Quell-Hash der amtlichen Manifestation `
          + 'sich geändert hat (Determinismus-Wächter §11.6 (5)) — Parser-Drift darf nie wie eine '
          + 'Gesetzesänderung aussehen. Generator neu laufen (npm run materialien:anker -- --datum=…).',
        );
      }
      if (roh !== serialisiereSidecar(sidecar)) {
        fehler.push(`Anker-Sidecar ${f} ist nicht kanonisch serialisiert — von Hand editiert? (Generator neu laufen.)`);
      }
      if (sidecar.anker.some((a) => sidecar.mehrdeutig.includes(a.eId))) {
        fehler.push(`Anker-Sidecar ${f} liefert eine mehrdeutige eId als Anker aus — falscher Sprung möglich (§1).`);
      }
      geprueft += 1;
    }
    for (const [key, e] of Object.entries(register.quellen)) {
      if (e.sidecarSha && !dateien.includes(`${key}.json`)) {
        fehler.push(`Quell-Register nennt einen Sidecar ${key}.json, der in ${ANKER_DIR} fehlt — stiller Verlust.`);
      }
    }
  }
  zeilen.push(`check:entstehung — Anker: ${geprueft} Sidecar(s) gegen ${register ? Object.keys(register.quellen).length : 0} Register-Einträge geprüft (sha + Determinismus-Wächter).`);
}

// ── (3) Curia-Zustandsträger ohne Verlust (E4) ─────────────────────────────────
{
  const zustand = leseCuriaZustand();
  const shards = existsSync(CURIA_DIR) ? readdirSync(CURIA_DIR).filter((f) => f.endsWith('.json')) : [];
  if (zustand === null && shards.length) {
    fehler.push(`${CURIA_DIR} ist befüllt, aber ${CURIA_ZUSTAND_PFAD} fehlt — der Zustandsträger ist der einzige Beleg des Laufs.`);
  }
  if (zustand) {
    for (const z of zustand) {
      if (!shards.includes(`${z.nummer}.json`)) {
        fehler.push(`Curia-Geschäft ${z.nummer} steht im Zustandsträger, sein Shard fehlt in ${CURIA_DIR} — stiller Verlust (§11.6).`);
      }
    }
    const bekannt = new Set(zustand.map((z) => `${z.nummer}.json`));
    for (const f of shards) {
      if (!bekannt.has(f)) fehler.push(`Curia-Shard ${f} steht nicht im Zustandsträger — Herkunft unbelegt (§7).`);
    }
    // ── (6) PERSONENDATEN-TOR (§11.8, Kritik B1, Entscheid David 11.9.2026 Nr. 2) ──
    // Kein Namensfeld, keine PersonNumber, keine Fraktion, kein Kanton — weder als
    // Schlüssel noch als Wert. Das Tor prüft die AUSGELIEFERTEN Artefakte, nicht bloss
    // die Absicht des Generators: eine künftige Erweiterung, die ein Personenfeld
    // durchreicht, wird hier rot, nicht erst in der Gegenprüfung.
    const zustandSha = new Map(zustand.map((z) => [z.nummer, z.sha]));
    let summenProben = 0;
    for (const f of shards) {
      const roh = readFileSync(join(CURIA_DIR, f), 'utf8');
      for (const verboten of VERBOTENE_FELDER) {
        if (new RegExp(`"${verboten}"\\s*:`).test(roh)) {
          fehler.push(`Curia-Shard ${f} trägt das Personendaten-Feld «${verboten}» — §11.8 verbietet jede Speicherung von Personendaten.`);
        }
      }
      const shard = JSON.parse(roh) as CuriaShard;
      if (roh !== serialisiereShard(shard)) {
        fehler.push(`Curia-Shard ${f} ist nicht kanonisch serialisiert — von Hand editiert? (Generator neu laufen.)`);
      }
      const sha = zustandSha.get(shard.nummer);
      if (sha && shaShard(shard) !== sha) {
        fehler.push(`Curia-Shard ${f}: sha weicht vom Zustandsträger ab — nachträglich verändert (§7).`);
      }
      // Nutzungsauflage der Parlamentsdienste: Quellenangabe + Abrufdatum je Datensatz.
      if (shard.quellenangabe !== CURIA_QUELLENANGABE) {
        fehler.push(`Curia-Shard ${f}: Quellenangabe fehlt oder weicht ab — Nutzungsauflage der Parlamentsdienste (§7c).`);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(shard.abgerufen)) {
        fehler.push(`Curia-Shard ${f}: Abrufdatum fehlt oder ist nicht ISO — Nutzungsauflage (§7a).`);
      }
      for (const sa of shard.schlussabstimmungen ?? []) {
        // Summenprobe: die Einzelzähler müssen die Gesamtzahl ergeben — sonst hat ein
        // unbekannter Decision-Code Stimmen verschluckt (Kritik A18).
        const felder = Object.keys(leeresAggregat()).filter((k) => k !== 'total') as (keyof typeof sa.aggregat)[];
        const summe = felder.reduce((n, k) => n + (sa.aggregat[k] ?? 0), 0);
        if (summe !== sa.aggregat.total) {
          fehler.push(`Curia-Shard ${f}: Stimm-Summe ${summe} ≠ total ${sa.aggregat.total} — ein Decision-Code fehlt in der Tabelle (§2).`);
        }
        if (!sa.beschriftung.startsWith(AUSZAEHLUNG_HINWEIS)) {
          fehler.push(`Curia-Shard ${f}: Schlussabstimmung ohne die Pflicht-Beschriftung «${AUSZAEHLUNG_HINWEIS}» (§8/Curia-Auflage).`);
        }
        if (sa.rat !== null && sa.rat !== 'Nationalrat') {
          fehler.push(`Curia-Shard ${f}: Rat «${String(sa.rat)}» behauptet — Voting hat kein Council-Feld, nur der Nationalrat ist über die Grösse belegbar (§8).`);
        }
        summenProben += 1;
      }
    }
    zeilen.push(
      `check:entstehung — Curia: ${zustand.length} Geschäft(e) im Zustandsträger, ${shards.length} Shard(s), verlustfrei; `
      + `${summenProben} Schlussabstimmung(en) summenrein, ${Object.keys(DECISION_CODES).length} geprüfte Decision-Codes, `
      + '0 Personendaten-Felder.',
    );
  } else {
    zeilen.push('check:entstehung — Curia: kein Zustandsträger (Etappe E4 noch nicht gelaufen).');
  }
}

// ── (4) Deckungs-Diagnose je Erlass ────────────────────────────────────────────
{
  const messung = misseDeckung();
  const gebucht: DeckungRegister = existsSync(DECKUNG_REGISTER_PFAD)
    ? (JSON.parse(readFileSync(DECKUNG_REGISTER_PFAD, 'utf8')) as DeckungRegister)
    : { erzeugt: heute, erlasse: {} };
  const neu: Record<string, DeckungErlass> = { ...gebucht.erlasse };
  let gesunken = 0;
  let neuGebucht = 0;
  for (const m of messung) {
    const alt = gebucht.erlasse[m.erlass];
    if (!alt) {
      if (schreibe) {
        neu[m.erlass] = { quote: m.quote, ocFussnoten: m.ocFussnoten, ocGetroffen: m.ocGetroffen, datum: heute };
        neuGebucht += 1;
      } else {
        fehler.push(`Deckung ${m.erlass}: nicht gebucht (Ist ${(m.quote * 100).toFixed(1)} %) — 'npm run entstehung:deckung -- --datum=$(date +%F)'.`);
      }
      continue;
    }
    if (m.quote < alt.quote) {
      gesunken += 1;
      if (!alt.grund) {
        fehler.push(
          `Deckung ${m.erlass}: ${(alt.quote * 100).toFixed(1)} % → ${(m.quote * 100).toFixed(1)} % gesunken `
          + `(${alt.ocGetroffen}/${alt.ocFussnoten} → ${m.ocGetroffen}/${m.ocFussnoten} oc) — eine Extraktion hat `
          + 'Fundstellen verloren. Ursache beheben, oder den gebuchten Stand mit Feld `grund` senken (§8).',
        );
      }
    } else if (schreibe && m.quote > alt.quote) {
      neu[m.erlass] = { quote: m.quote, ocFussnoten: m.ocFussnoten, ocGetroffen: m.ocGetroffen, datum: heute };
    }
  }
  if (schreibe) {
    mkdirSync('bibliothek/register', { recursive: true });
    writeFileSync(DECKUNG_REGISTER_PFAD, serialisiereDeckung({ erzeugt: heute, erlasse: neu }), 'utf8');
    console.log(`check:entstehung --schreibe: ${DECKUNG_REGISTER_PFAD} geschrieben (${neuGebucht} neu gebucht).`);
  }
  const summe = messung.reduce((n, m) => n + m.ocFussnoten, 0);
  const treffer = messung.reduce((n, m) => n + m.ocGetroffen, 0);
  const min = messung.length ? messung.reduce((a, m) => (m.quote < a.quote ? m : a)) : null;
  const max = messung.length ? messung.reduce((a, m) => (m.quote > a.quote ? m : a)) : null;
  zeilen.push(
    `check:entstehung — Deckung: ${messung.length} Erlasse, ${treffer}/${summe} Fussnoten-oc in der Fedlex-Änderungsliste `
    + `(${summe ? ((treffer / summe) * 100).toFixed(1) : '0.0'} % gesamt; Spanne ${min ? `${min.erlass} ${(min.quote * 100).toFixed(1)} %` : '—'} … `
    + `${max ? `${max.erlass} ${(max.quote * 100).toFixed(1)} %` : '—'}; ${gesunken} gesunken).`,
  );
}

// ── (6) Entstehungs-Projektion: je-Erlass-Deckel + Determinismus (E3) ──────────
// Die Projektion ist eine SICHT auf Bestehendes (Historie-Shard, Revisions-Sidecar,
// Botschaften-Quelle). Sie darf deshalb niemals etwas anderes sagen als ihre Quellen —
// dieselbe Zusicherung wie bei den Anker-Sidecars (§11.6 (5)), nur offline vollständig
// nachrechenbar: das Tor baut die Datei neu und vergleicht Byte für Byte.
{
  const HIST = 'public/normtext/historie';
  const REV = 'public/normtext/revisionen';
  if (!existsSync(PROJEKTION_DIR)) {
    zeilen.push('check:entstehung — Projektion: keine Dateien (Etappe E3 noch nicht gelaufen).');
  } else {
    const botschaften = new Map<string, BotschaftQuelle>();
    for (const b of BOTSCHAFTEN) {
      if (b.doktyp !== 'botschaft') continue;
      botschaften.set(b.key, {
        key: b.key, titel: b.titel, nummer: b.nummer, quelleUrl: b.quelleUrl,
        stand: b.stand, ereignisse: b.ereignisse,
      });
    }
    const ankerKeys = new Set<string>(
      existsSync(ANKER_DIR)
        ? readdirSync(ANKER_DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5))
        : [],
    );
    const dateien = readdirSync(PROJEKTION_DIR).filter((f) => f.endsWith('.json')).sort();
    let groesste = 0;
    let groessteDatei = '\u2014';
    let abweichend = 0;
    for (const datei of dateien) {
      const ziel = join(PROJEKTION_DIR, datei);
      const ist = statSync(ziel).size;
      if (ist > groesste) { groesste = ist; groessteDatei = datei; }
      if (ist > PROJEKTION_DECKEL_DATEI) {
        fehler.push(`Projektion zu gross: ${ziel} ${kb(ist)} > ${kb(PROJEKTION_DECKEL_DATEI)} je Erlass (§15).`);
      }
      const erlass = decodeURIComponent(datei.slice(0, -5));
      const histPfad = join(HIST, datei);
      if (!existsSync(histPfad)) {
        fehler.push(`Projektion ohne Quelle: ${ziel} — kein Historie-Shard ${histPfad} (§8).`);
        continue;
      }
      const historie = JSON.parse(readFileSync(histPfad, 'utf8')) as HistorieQuelle;
      const revPfad = join(REV, datei);
      const revisionen = existsSync(revPfad)
        ? JSON.parse(readFileSync(revPfad, 'utf8')) as RevisionsQuelle
        : null;
      const neuGebaut = baueProjektion(erlass, historie, revisionen, botschaften, ankerKeys);
      const soll = neuGebaut ? serialisiereProjektion(neuGebaut) : null;
      if (soll !== readFileSync(ziel, 'utf8')) abweichend += 1;
    }
    if (abweichend > 0) {
      fehler.push(
        `${abweichend} Projektions-Datei(en) decken sich nicht mit der Neuberechnung aus ihren Quellen — `
        + 'entweder von Hand geändert oder die Quelle bewegte sich ohne Generator-Lauf. '
        + '«npm run gen:entstehung-projektion» ausführen und den Diff prüfen (§2/§5).',
      );
    }
    zeilen.push(
      `check:entstehung — Projektion: ${dateien.length} Erlasse, grösste ${groessteDatei} ${kb(groesste)} `
      + `/ ${kb(PROJEKTION_DECKEL_DATEI)} je Erlass; ${abweichend} Abweichung(en) zur Neuberechnung.`,
    );
  }
}

for (const z of zeilen) console.log(z);
if (fehler.length) {
  console.error(`\ncheck:entstehung ROT (${fehler.length}):`);
  for (const f of fehler) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\ncheck:entstehung GRÜN — Deckel, Anker-Provenienz, Curia-Zustand und Deckungs-Diagnose eingehalten.');
