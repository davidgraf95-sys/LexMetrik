// scripts/check-e2e-flake.ts — Flacker-Wächter für die Playwright-Shards.
//
// PROBLEM (Beleg 8.9.2026, Lauf 34209371435, Shard 8/8): Playwright fährt in
// der CI `retries: 2`. Ein Test, der im Erstversuch rot ist und im zweiten
// grün, zählt für Playwright als `flaky` — der Prozess endet mit Exit 0, der
// Job wird «success», GitHub meldet grün. Am 8.9.2026 verdeckte das genau so
// den echten Defekt `a-ueberlauf-ohne-scroller` (Attempt 0 rot, Attempt 1
// grün). Ein Lauf, der nur im Wiederholungsversuch grün wird, ist kein grüner
// Lauf: er ist eine unbewiesene Behauptung über den nächsten Lauf.
//
// REGEL (Variante «rot mit Ausnahmeliste», Entscheid David 8.9.2026):
// Flackern ist ROT — es sei denn, die Spec-Datei steht mit Datum und Grund in
// `e2e/flake-ausnahmen.json`. Jeder Eintrag verfällt nach spätestens 30 Tagen;
// danach ist derselbe Flake wieder rot. Damit ist die Ausnahme ein
// Fang-Vermerk mit Ablaufdatum (Muster aus `aufraeumen.md`), keine dauerhafte
// Amnestie: wer sie setzt, kauft Zeit für die Wurzeldiagnose (§17), nicht
// Ruhe.
//
// FEHLERSEITE (§6.7 lit. b) — jede Unklarheit ist ROT, nie stilles Grün:
//   · Report fehlt oder ist kein lesbares JSON      ⇒ rot
//   · Report ohne `stats`-Block                     ⇒ rot
//   · `stats.flaky > 0`, aber kein Test mit Status
//     `flaky` auffindbar (Formatwechsel)            ⇒ rot
//   · Ausnahmeliste formwidrig (fehlender Grund,
//     fehlendes/ungültiges Datum, Ablauf > 30 Tage) ⇒ rot, unabhängig davon,
//     ob dieser Lauf überhaupt geflackert hat
//
// BELEG zum Report-Format (Playwright 1.60.0, node_modules/playwright/types/
// testReporter.d.ts): `JSONReport.stats.flaky: number` (Z. 259) und
// `JSONReportTest.status: 'skipped' | 'expected' | 'unexpected' | 'flaky'`
// (Z. 291). Der JSON-Reporter ist in `playwright.config.ts` nur unter `CI`
// verdrahtet (`outputFile: 'playwright-report.json'`) — darum läuft dieses Tor
// in ci.yml und steht begründet auf `ALLOWLIST_NUR_CI` in
// `scripts/check-tor-paritaet.ts`.
import { readFileSync } from 'node:fs';

/** Ein Eintrag der Ausnahmeliste `e2e/flake-ausnahmen.json`. */
export type FlakeAusnahme = {
  /** Spec-Datei, z. B. `gesetze-a-ueberlauf.e2e.ts` (mit oder ohne `e2e/`). */
  spec: string;
  /** Tag der Eintragung, ISO `YYYY-MM-DD`. */
  seit: string;
  /** Warum das Flackern vorübergehend geduldet wird — Pflichtfeld. */
  grund: string;
  /** Letzter Geltungstag, ISO `YYYY-MM-DD`, höchstens `seit` + 30 Tage. */
  ablauf: string;
};

export type FlackerFund = {
  /** Spec-Datei, normalisiert. */
  spec: string;
  /** Summe der Wiederholungsversuche über alle flackernden Tests der Datei. */
  retries: number;
  /** Titel der flackernden Tests (für die Meldung). */
  titel: string[];
  /** Greifende Ausnahme, sonst `null`. */
  ausnahme: FlakeAusnahme | null;
};

export type Verdikt = {
  rot: boolean;
  funde: FlackerFund[];
  /** Ausgabezeilen in Reihenfolge, inkl. GitHub-Annotationen (`::error`/`::warning`). */
  meldungen: string[];
  zusammenfassung: string;
};

/** Höchstdauer einer Ausnahme in Tagen (Entscheid David 8.9.2026). */
export const AUSNAHME_TAGE_MAX = 30;

const TAG_MS = 86_400_000;
const ISO_TAG = /^\d{4}-\d{2}-\d{2}$/;

/** ISO-Tag → UTC-Zeitstempel; `null`, wenn Form oder Kalenderwert nicht stimmen. */
function tag(wert: unknown): number | null {
  if (typeof wert !== 'string' || !ISO_TAG.test(wert)) return null;
  const ms = Date.parse(`${wert}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  // `2026-02-30` parst in manchen Runtimes; Rückprobe schliesst das aus.
  return new Date(ms).toISOString().slice(0, 10) === wert ? ms : null;
}

/** Spec-Bezeichner vereinheitlichen: `./e2e/x.e2e.ts`, `e2e/x.e2e.ts`, `x.e2e.ts` ⇒ `x.e2e.ts`. */
export function specNormalisieren(pfad: string): string {
  return pfad.trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^e2e\//, '');
}

const FELDER = ['spec', 'seit', 'grund', 'ablauf'] as const;

/** Ausnahmeliste prüfen. Rückgabe: geprüfte Einträge + Formfehler-Meldungen. */
function ausnahmenPruefen(roh: unknown): { liste: FlakeAusnahme[]; fehler: string[] } {
  const fehler: string[] = [];
  if (!Array.isArray(roh)) {
    return { liste: [], fehler: ['Ausnahmeliste ist kein JSON-Array.'] };
  }
  const liste: FlakeAusnahme[] = [];
  const gesehen = new Set<string>();
  roh.forEach((eintrag, i) => {
    const ort = `Eintrag ${i + 1}`;
    if (typeof eintrag !== 'object' || eintrag === null || Array.isArray(eintrag)) {
      fehler.push(`${ort}: kein Objekt.`);
      return;
    }
    const e = eintrag as Record<string, unknown>;
    const fremd = Object.keys(e).filter((k) => !(FELDER as readonly string[]).includes(k));
    if (fremd.length) fehler.push(`${ort}: unbekannte Felder ${fremd.join(', ')} — erlaubt sind ${FELDER.join(', ')}.`);
    const spec = typeof e.spec === 'string' ? specNormalisieren(e.spec) : '';
    if (!spec) fehler.push(`${ort}: Feld 'spec' fehlt oder ist leer.`);
    const grund = typeof e.grund === 'string' ? e.grund.trim() : '';
    if (!grund) fehler.push(`${ort} (${spec || '?'}): Feld 'grund' fehlt oder ist leer — eine Ausnahme ohne Begründung ist keine.`);
    const seit = tag(e.seit);
    if (seit === null) fehler.push(`${ort} (${spec || '?'}): Feld 'seit' fehlt oder ist kein ISO-Datum (YYYY-MM-DD).`);
    const ablauf = tag(e.ablauf);
    if (ablauf === null) fehler.push(`${ort} (${spec || '?'}): Feld 'ablauf' fehlt oder ist kein ISO-Datum (YYYY-MM-DD).`);
    if (seit !== null && ablauf !== null) {
      if (ablauf < seit) {
        fehler.push(`${ort} (${spec}): 'ablauf' (${e.ablauf as string}) liegt vor 'seit' (${e.seit as string}).`);
      } else if (ablauf - seit > AUSNAHME_TAGE_MAX * TAG_MS) {
        const tage = Math.round((ablauf - seit) / TAG_MS);
        fehler.push(`${ort} (${spec}): Ausnahme läuft ${tage} Tage — Höchstdauer ist ${AUSNAHME_TAGE_MAX} Tage.`);
      }
    }
    if (spec) {
      if (gesehen.has(spec)) fehler.push(`${ort}: '${spec}' steht mehrfach in der Liste.`);
      gesehen.add(spec);
    }
    if (spec && grund && seit !== null && ablauf !== null && !fremd.length) {
      liste.push({ spec, seit: e.seit as string, grund, ablauf: e.ablauf as string });
    }
  });
  return { liste, fehler };
}

type RohTest = { status?: unknown; results?: unknown };
type RohSpec = { file?: unknown; title?: unknown; tests?: unknown };
type RohSuite = { file?: unknown; specs?: unknown; suites?: unknown };

/** Suiten-Baum abgehen und alle Tests mit Status `flaky` je Spec-Datei sammeln. */
function flackerndeSammeln(suites: unknown, aus: Map<string, { retries: number; titel: string[] }>): void {
  if (!Array.isArray(suites)) return;
  for (const s of suites as RohSuite[]) {
    if (typeof s !== 'object' || s === null) continue;
    if (Array.isArray(s.specs)) {
      for (const spec of s.specs as RohSpec[]) {
        if (typeof spec !== 'object' || spec === null) continue;
        const datei = specNormalisieren(
          typeof spec.file === 'string' ? spec.file : typeof s.file === 'string' ? s.file : '(unbekannt)',
        );
        const tests = Array.isArray(spec.tests) ? (spec.tests as RohTest[]) : [];
        for (const t of tests) {
          if (typeof t !== 'object' || t === null || t.status !== 'flaky') continue;
          const versuche = Array.isArray(t.results) ? t.results.length : 1;
          const eintrag = aus.get(datei) ?? { retries: 0, titel: [] };
          eintrag.retries += Math.max(0, versuche - 1);
          const titel = typeof spec.title === 'string' ? spec.title : '(ohne Titel)';
          if (!eintrag.titel.includes(titel)) eintrag.titel.push(titel);
          aus.set(datei, eintrag);
        }
      }
    }
    flackerndeSammeln(s.suites, aus);
  }
}

/**
 * Reine Verdikt-Funktion (§2): Report-Rohtext + Ausnahmeliste-Rohtext + Datum
 * ⇒ Verdikt. `null` als Rohtext heisst «Datei fehlt» und ist rot.
 */
export function flackerVerdikt(eingabe: {
  reportRoh: string | null;
  ausnahmenRoh: string | null;
  heute: Date;
  reportPfad?: string;
  ausnahmenPfad?: string;
}): Verdikt {
  const reportPfad = eingabe.reportPfad ?? 'playwright-report.json';
  const ausnahmenPfad = eingabe.ausnahmenPfad ?? 'e2e/flake-ausnahmen.json';
  const meldungen: string[] = [];
  let rot = false;

  // ── Ausnahmeliste ────────────────────────────────────────────────────────
  let ausnahmen: FlakeAusnahme[] = [];
  if (eingabe.ausnahmenRoh === null) {
    rot = true;
    meldungen.push(`::error::Flacker-Wächter: Ausnahmeliste ${ausnahmenPfad} fehlt — ohne sie ist kein Verdikt möglich.`);
  } else {
    let geparst: unknown;
    try {
      geparst = JSON.parse(eingabe.ausnahmenRoh);
    } catch (e) {
      rot = true;
      meldungen.push(`::error::Flacker-Wächter: ${ausnahmenPfad} ist kein lesbares JSON — ${(e as Error).message}`);
      geparst = undefined;
    }
    if (geparst !== undefined) {
      const { liste, fehler } = ausnahmenPruefen(geparst);
      ausnahmen = liste;
      for (const f of fehler) {
        rot = true;
        meldungen.push(`::error file=${ausnahmenPfad}::Formfehler in der Flacker-Ausnahmeliste — ${f}`);
      }
    }
  }

  // ── Report ───────────────────────────────────────────────────────────────
  if (eingabe.reportRoh === null) {
    meldungen.push(
      `::error::Flacker-Wächter: Playwright-Report ${reportPfad} fehlt — ein Lauf ohne Report ist nicht bewertbar und gilt als rot (nie stilles Grün).`,
    );
    return abschluss(true, [], meldungen, ausnahmen);
  }
  let report: unknown;
  try {
    report = JSON.parse(eingabe.reportRoh);
  } catch (e) {
    meldungen.push(`::error::Flacker-Wächter: ${reportPfad} ist kein lesbares JSON — ${(e as Error).message}`);
    return abschluss(true, [], meldungen, ausnahmen);
  }
  const stats = (report as { stats?: unknown })?.stats as { flaky?: unknown } | undefined;
  if (typeof stats !== 'object' || stats === null || typeof stats.flaky !== 'number') {
    meldungen.push(
      `::error::Flacker-Wächter: ${reportPfad} trägt keinen 'stats.flaky'-Zähler — Report-Format geändert? Bis zur Klärung rot.`,
    );
    return abschluss(true, [], meldungen, ausnahmen);
  }

  const gesammelt = new Map<string, { retries: number; titel: string[] }>();
  flackerndeSammeln((report as { suites?: unknown }).suites, gesammelt);

  if (stats.flaky > 0 && gesammelt.size === 0) {
    rot = true;
    meldungen.push(
      `::error::Flacker-Wächter: ${reportPfad} meldet stats.flaky=${stats.flaky}, aber kein Test trägt den Status 'flaky' — die Zuordnung zur Spec-Datei schlägt fehl. Rot, damit der Fund nicht verloren geht.`,
    );
  }

  // ── Zuordnung Fund ↔ Ausnahme ────────────────────────────────────────────
  const heuteMs = tag(eingabe.heute.toISOString().slice(0, 10));
  const funde: FlackerFund[] = [];
  for (const [spec, { retries, titel }] of [...gesammelt].sort((a, b) => a[0].localeCompare(b[0]))) {
    const kandidat = ausnahmen.find((a) => a.spec === spec) ?? null;
    const ablaufMs = kandidat ? tag(kandidat.ablauf) : null;
    const gueltig = kandidat !== null && ablaufMs !== null && heuteMs !== null && heuteMs <= ablaufMs;
    funde.push({ spec, retries, titel, ausnahme: gueltig ? kandidat : null });
    const kopf = `FLACKERT: ${spec} — ${retries}× Retry (${titel.join(' · ')})`;
    if (gueltig && kandidat) {
      meldungen.push(`::warning file=e2e/${spec}::${kopf} — geduldet bis ${kandidat.ablauf}: ${kandidat.grund}`);
    } else if (kandidat) {
      rot = true;
      meldungen.push(
        `::error file=e2e/${spec}::${kopf} — Ausnahme ist am ${kandidat.ablauf} ABGELAUFEN. Wurzel messen (§17) oder Eintrag mit neuem Datum und Grund erneuern.`,
      );
    } else {
      rot = true;
      meldungen.push(
        `::error file=e2e/${spec}::${kopf} — nur im Wiederholungsversuch grün. Entweder Wurzel beheben oder mit Datum und Grund in e2e/flake-ausnahmen.json eintragen (max. ${AUSNAHME_TAGE_MAX} Tage).`,
      );
    }
  }

  // Ungenutzte Ausnahmen sind ein Hinweis, kein Rot: ein Shard sieht nur seine
  // eigene Spec-Gruppe, ein hier stummer Eintrag kann anderswo greifen.
  for (const a of ausnahmen) {
    if (gesammelt.has(a.spec)) continue;
    meldungen.push(`Hinweis: Ausnahme ${a.spec} (bis ${a.ablauf}) griff in diesem Shard nicht — bei grünen Läufen entfernen.`);
  }

  return abschluss(rot, funde, meldungen, ausnahmen);
}

function abschluss(rot: boolean, funde: FlackerFund[], meldungen: string[], ausnahmen: FlakeAusnahme[]): Verdikt {
  const genutzt = funde.filter((f) => f.ausnahme !== null);
  const rotZahl = funde.filter((f) => f.ausnahme === null).length;
  const bis = genutzt.flatMap((f) => (f.ausnahme ? [f.ausnahme.ablauf] : [])).sort();
  const teil = genutzt.length
    ? `${genutzt.length} Ausnahme${genutzt.length === 1 ? '' : 'n'} (gültig bis ${bis.join(', ')})`
    : `0 Ausnahmen (${ausnahmen.length} in der Liste)`;
  // Rot ohne Spec-Zuordnung (fehlender Report, Formfehler der Liste) darf in
  // der Schlusszeile nicht als «0 rot» erscheinen — das läse sich wie grün.
  const kopf = rot && rotZahl === 0 ? 'ROT (Report- oder Formfehler, s. oben)' : `${rotZahl} rot`;
  const zusammenfassung = `Flacker-Wächter: ${kopf} · ${teil}`;
  return { rot, funde, meldungen: [...meldungen, zusammenfassung], zusammenfassung };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

/** Datei lesen; `null`, wenn sie fehlt (jede andere Ursache wirft). */
function lesenOderNull(pfad: string): string | null {
  try {
    return readFileSync(pfad, 'utf8');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}

// Entry-Erkennung wie im übrigen `scripts/`-Bestand (check-schlankheit.ts,
// check-lizenzen.ts u. a.): `process.argv[1]` taugt hier NICHT — unter
// `vite-node` zeigt es auf das vite-node-Binary, nicht auf diese Datei
// (gemessen 8.9.2026). Der Verdikt-Test importiert das Modul und darf keinen
// `process.exit` auslösen.
if (!process.env.VITEST) {
  const argumente = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const reportPfad = argumente[0] ?? process.env.E2E_FLAKE_REPORT ?? 'playwright-report.json';
  const ausnahmenPfad = 'e2e/flake-ausnahmen.json';
  const verdikt = flackerVerdikt({
    reportRoh: lesenOderNull(reportPfad),
    ausnahmenRoh: lesenOderNull(ausnahmenPfad),
    heute: new Date(),
    reportPfad,
    ausnahmenPfad,
  });
  for (const z of verdikt.meldungen) console.log(z);
  process.exit(verdikt.rot ? 1 : 0);
}
