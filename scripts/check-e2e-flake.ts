// scripts/check-e2e-flake.ts — Flacker-Wächter für die Playwright-Shards.
//
// PROBLEM (Beleg 8.9.2026, Lauf 34209371435, Shard 8/8): unter `retries: 2`
// zählt ein erst im zweiten Versuch grüner Test als `flaky`, der Prozess endet
// mit Exit 0, GitHub meldet grün — so verdeckt beim echten Defekt
// `a-ueberlauf-ohne-scroller`. REGEL (Entscheid David 8.9.2026): Flackern ist
// ROT, ausser die Spec steht mit Datum und Grund in `e2e/flake-ausnahmen.json`;
// jeder Eintrag verfällt nach höchstens 30 Tagen (Fang-Vermerk, keine Amnestie).
// FEHLERSEITE (§6.7 lit. b) — jede Unklarheit ist rot: Report fehlt/unlesbar ·
// ohne `stats`-Block · `stats.flaky > 0` ohne auffindbaren `flaky`-Test ·
// Ausnahmeliste formwidrig (auch bei grünem Lauf). Format-Beleg: Playwright
// 1.60.0, `JSONReport.stats.flaky` und `JSONReportTest.status … | 'flaky'`.
// Der JSON-Reporter ist nur unter `CI` verdrahtet — darum steht das Tor
// begründet auf `ALLOWLIST_NUR_CI` (scripts/check-tor-paritaet.ts).
import { readFileSync } from 'node:fs';

/** Eintrag der Ausnahmeliste: Spec, Eintragungstag, Pflicht-Grund, letzter Geltungstag (ISO). */
export type FlakeAusnahme = { spec: string; seit: string; grund: string; ablauf: string };

/** Flackernde Spec: Summe der Wiederholungen, Testtitel, greifende Ausnahme oder `null`. */
export type FlackerFund = { spec: string; retries: number; titel: string[]; ausnahme: FlakeAusnahme | null };

/** `meldungen` inkl. GitHub-Annotationen (`::error`/`::warning`), Schlusszeile zuletzt. */
export type Verdikt = { rot: boolean; funde: FlackerFund[]; meldungen: string[]; zusammenfassung: string };

/** Höchstdauer einer Ausnahme in Tagen (Entscheid David 8.9.2026). */
export const AUSNAHME_TAGE_MAX = 30;

const TAG_MS = 86_400_000;
const ISO_TAG = /^\d{4}-\d{2}-\d{2}$/;
const FELDER = ['spec', 'seit', 'grund', 'ablauf'] as const;

/** ISO-Tag → UTC-Zeitstempel; `null` bei falscher Form oder Kalenderwert (`2026-02-30`). */
function tag(wert: unknown): number | null {
  if (typeof wert !== 'string' || !ISO_TAG.test(wert)) return null;
  const ms = Date.parse(`${wert}T00:00:00Z`);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString().slice(0, 10) === wert ? ms : null;
}

/** `./e2e/x.e2e.ts`, `e2e/x.e2e.ts`, `x.e2e.ts` ⇒ `x.e2e.ts`. */
export function specNormalisieren(pfad: string): string {
  return pfad.trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/^e2e\//, '');
}

/** Ausnahmeliste prüfen: geprüfte Einträge + Formfehler-Meldungen. */
function ausnahmenPruefen(roh: unknown): { liste: FlakeAusnahme[]; fehler: string[] } {
  if (!Array.isArray(roh)) return { liste: [], fehler: ['Ausnahmeliste ist kein JSON-Array.'] };
  const fehler: string[] = [];
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
    if (fremd.length) fehler.push(`${ort}: unbekannte Felder ${fremd.join(', ')} — erlaubt: ${FELDER.join(', ')}.`);
    const spec = typeof e.spec === 'string' ? specNormalisieren(e.spec) : '';
    if (!spec) fehler.push(`${ort}: Feld 'spec' fehlt oder ist leer.`);
    const grund = typeof e.grund === 'string' ? e.grund.trim() : '';
    if (!grund) fehler.push(`${ort} (${spec || '?'}): Feld 'grund' fehlt oder ist leer — eine Ausnahme ohne Begründung ist keine.`);
    const seit = tag(e.seit);
    const ablauf = tag(e.ablauf);
    for (const [feld, wert] of [['seit', seit], ['ablauf', ablauf]] as const) {
      if (wert === null) fehler.push(`${ort} (${spec || '?'}): Feld '${feld}' fehlt oder ist kein ISO-Datum (YYYY-MM-DD).`);
    }
    if (seit !== null && ablauf !== null) {
      if (ablauf < seit) fehler.push(`${ort} (${spec}): 'ablauf' (${e.ablauf as string}) liegt vor 'seit' (${e.seit as string}).`);
      else if (ablauf - seit > AUSNAHME_TAGE_MAX * TAG_MS)
        fehler.push(`${ort} (${spec}): Ausnahme läuft ${Math.round((ablauf - seit) / TAG_MS)} Tage — Höchstdauer ist ${AUSNAHME_TAGE_MAX} Tage.`);
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

/** Suiten-Baum abgehen und alle `flaky`-Tests je Spec-Datei sammeln. */
function flackerndeSammeln(suites: unknown, aus: Map<string, { retries: number; titel: string[] }>): void {
  if (!Array.isArray(suites)) return;
  for (const s of suites as RohSuite[]) {
    if (typeof s !== 'object' || s === null) continue;
    for (const spec of (Array.isArray(s.specs) ? s.specs : []) as RohSpec[]) {
      if (typeof spec !== 'object' || spec === null) continue;
      const datei = specNormalisieren(
        typeof spec.file === 'string' ? spec.file : typeof s.file === 'string' ? s.file : '(unbekannt)',
      );
      for (const t of (Array.isArray(spec.tests) ? spec.tests : []) as RohTest[]) {
        if (typeof t !== 'object' || t === null || t.status !== 'flaky') continue;
        const eintrag = aus.get(datei) ?? { retries: 0, titel: [] };
        eintrag.retries += Math.max(0, (Array.isArray(t.results) ? t.results.length : 1) - 1);
        const titel = typeof spec.title === 'string' ? spec.title : '(ohne Titel)';
        if (!eintrag.titel.includes(titel)) eintrag.titel.push(titel);
        aus.set(datei, eintrag);
      }
    }
    flackerndeSammeln(s.suites, aus);
  }
}

/** Reine Verdikt-Funktion (§2). `null` als Rohtext heisst «Datei fehlt» und ist rot. */
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

  // Report: jede Unklarheit endet hier, ohne Fund-Liste, aber als ROT.
  const abbruch = (grund: string): Verdikt => abschluss(true, [], [...meldungen, `::error::${grund}`], ausnahmen);
  if (eingabe.reportRoh === null) {
    return abbruch(`Flacker-Wächter: Playwright-Report ${reportPfad} fehlt — ein Lauf ohne Report ist nicht bewertbar (nie stilles Grün).`);
  }
  let report: unknown;
  try {
    report = JSON.parse(eingabe.reportRoh);
  } catch (e) {
    return abbruch(`Flacker-Wächter: ${reportPfad} ist kein lesbares JSON — ${(e as Error).message}`);
  }
  const stats = (report as { stats?: unknown })?.stats as { flaky?: unknown } | undefined;
  if (typeof stats !== 'object' || stats === null || typeof stats.flaky !== 'number') {
    return abbruch(`Flacker-Wächter: ${reportPfad} trägt keinen 'stats.flaky'-Zähler — Report-Format geändert? Bis zur Klärung rot.`);
  }

  const gesammelt = new Map<string, { retries: number; titel: string[] }>();
  flackerndeSammeln((report as { suites?: unknown }).suites, gesammelt);
  if (stats.flaky > 0 && gesammelt.size === 0) {
    rot = true;
    meldungen.push(
      `::error::Flacker-Wächter: ${reportPfad} meldet stats.flaky=${stats.flaky}, aber kein Test trägt den Status 'flaky' — die Zuordnung zur Spec-Datei schlägt fehl. Rot, damit der Fund nicht verloren geht.`,
    );
  }

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
      continue;
    }
    rot = true;
    meldungen.push(
      kandidat
        ? `::error file=e2e/${spec}::${kopf} — Ausnahme ist am ${kandidat.ablauf} ABGELAUFEN. Wurzel messen (§17) oder Eintrag mit neuem Datum und Grund erneuern.`
        : `::error file=e2e/${spec}::${kopf} — nur im Wiederholungsversuch grün. Wurzel beheben oder mit Datum und Grund in e2e/flake-ausnahmen.json eintragen (max. ${AUSNAHME_TAGE_MAX} Tage).`,
    );
  }

  // Ungenutzte Ausnahme = Hinweis, kein Rot: ein Shard sieht nur seine Spec-Gruppe.
  for (const a of ausnahmen) {
    if (gesammelt.has(a.spec)) continue;
    meldungen.push(`Hinweis: Ausnahme ${a.spec} (bis ${a.ablauf}) griff in diesem Shard nicht — bei grünen Läufen entfernen.`);
  }

  return abschluss(rot, funde, meldungen, ausnahmen);
}

function abschluss(rot: boolean, funde: FlackerFund[], meldungen: string[], ausnahmen: FlakeAusnahme[]): Verdikt {
  const genutzt = funde.flatMap((f) => (f.ausnahme ? [f.ausnahme] : []));
  const rotZahl = funde.length - genutzt.length;
  const teil = genutzt.length
    ? `${genutzt.length} Ausnahme${genutzt.length === 1 ? '' : 'n'} (gültig bis ${genutzt.map((a) => a.ablauf).sort().join(', ')})`
    : `0 Ausnahmen (${ausnahmen.length} in der Liste)`;
  // Rot ohne Spec-Zuordnung (fehlender Report, Formfehler) darf nicht als «0 rot» erscheinen.
  const kopf = rot && rotZahl === 0 ? 'ROT (Report- oder Formfehler, s. oben)' : `${rotZahl} rot`;
  const zusammenfassung = `Flacker-Wächter: ${kopf} · ${teil}`;
  return { rot, funde, meldungen: [...meldungen, zusammenfassung], zusammenfassung };
}

// Entry-Erkennung über `VITEST`, nicht über `process.argv[1]`: unter vite-node
// zeigt das aufs Binary (gemessen 8.9.2026); der Test darf keinen Exit auslösen.
if (!process.env.VITEST) {
  const lies = (p: string): string | null => {
    try {
      return readFileSync(p, 'utf8');
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw e;
    }
  };
  const reportPfad =
    process.argv.slice(2).filter((a) => !a.startsWith('-'))[0] ?? process.env.E2E_FLAKE_REPORT ?? 'playwright-report.json';
  const ausnahmenPfad = 'e2e/flake-ausnahmen.json';
  const verdikt = flackerVerdikt({
    reportRoh: lies(reportPfad),
    ausnahmenRoh: lies(ausnahmenPfad),
    heute: new Date(),
    reportPfad,
    ausnahmenPfad,
  });
  for (const z of verdikt.meldungen) console.log(z);
  process.exit(verdikt.rot ? 1 : 0);
}
