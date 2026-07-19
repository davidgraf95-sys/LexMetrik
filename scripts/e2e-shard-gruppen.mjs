#!/usr/bin/env node
// ─── e2e-Shard-Balancing: gemessene Datei-Gruppen statt Alphabet ─────────────
// Playwright 1.60 verteilt `--shard=i/N` nach TEST-ZAHL in Projekt- +
// Alphabet-Reihenfolge (fullyParallel:true → Test-Ebene), NICHT nach Dauer.
// Ergebnis: die schweren OR-Reader-Specs (leser-*, gesetze.e2e, norm-sprung)
// liegen alphabetisch beisammen und landeten alle in Shard 2 → 22–42 min,
// während Shard 1/3 in 7–11 min durchliefen. Auf dem gestarveten Runner riss
// die lange Chromium-Session dann sogar Einzel-Budgets (a33-F1 240 s).
//
// Lösung: DETERMINISTISCHE, aus gemessenen Dauern gepackte Datei-Gruppen
// (`shard-gruppen.json`), je Matrix-Job eine Gruppe. Das ändert NUR, WELCHE
// Datei auf WELCHEM Runner läuft — kein `expect`, kein Test, kein Timeout, kein
// Umfang wird berührt (§6.3). Die Union der Gruppen MUSS exakt die Gesamtmenge
// der von Playwright gesammelten Specs sein; das erzwingt der `--pruefen`-
// Wächter unten (in `check:seriell` und als CI-Schritt vor den Shards).
//
// Verwendung:
//   node scripts/e2e-shard-gruppen.mjs --pruefen        Union-Wächter (Gruppen == playwright --list)
//   node scripts/e2e-shard-gruppen.mjs --fahren <N>     Gruppe N mit Playwright fahren (Exit-Code durchgereicht)
//   node scripts/e2e-shard-gruppen.mjs --dateien <N>    Datei-Argumente der Gruppe N ausgeben
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HIER = dirname(fileURLToPath(import.meta.url))
const WURZEL = join(HIER, '..')
const GRUPPEN_JSON = join(WURZEL, 'e2e', 'shard-gruppen.json')

/** Gruppen-Definition laden: { "1": [datei, …], "2": […], "3": […] }. */
function ladeGruppen() {
  const roh = JSON.parse(readFileSync(GRUPPEN_JSON, 'utf8'))
  const schluessel = Object.keys(roh.gruppen)
  return { meta: roh, schluessel, gruppen: roh.gruppen }
}

/**
 * Autoritative Gesamtmenge: was Playwright SELBST sammelt (`--list`), über
 * beide Projekte (schwer + chromium). Rückgabe = Set der Spec-Datei-Basenamen.
 * `--list` startet weder webServer noch Browser — günstig und offline.
 */
function gesammelteSpecs() {
  const ausgabe = execFileSync(
    'npx',
    ['playwright', 'test', '--list'],
    { cwd: WURZEL, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env } },
  )
  const dateien = new Set()
  for (const zeile of ausgabe.split('\n')) {
    const treffer = zeile.match(/([A-Za-z0-9._-]+\.e2e\.ts):\d+/)
    if (treffer) dateien.add(treffer[1])
  }
  return dateien
}

function pruefen() {
  const { gruppen } = ladeGruppen()
  const gesamt = gesammelteSpecs()

  const fehler = []
  const gesehen = new Map() // datei -> gruppe (Duplikat-Erkennung)
  const union = new Set()

  for (const [g, dateien] of Object.entries(gruppen)) {
    for (const d of dateien) {
      if (gesehen.has(d)) {
        fehler.push(`DOPPELT: ${d} in Gruppe ${gesehen.get(d)} UND Gruppe ${g}`)
      }
      gesehen.set(d, g)
      union.add(d)
      if (!gesamt.has(d)) {
        fehler.push(`UNBEKANNT: ${d} (Gruppe ${g}) — von Playwright nicht gesammelt`)
      }
    }
  }
  for (const d of gesamt) {
    if (!union.has(d)) {
      fehler.push(`FEHLT: ${d} — in keiner Gruppe zugeordnet (neue Spec? → in shard-gruppen.json packen)`)
    }
  }

  if (fehler.length) {
    console.error('✗ e2e-Shard-Union-Wächter ROT — Gruppen ≠ playwright --list:')
    for (const f of fehler) console.error('   ' + f)
    console.error(`\n   Gesammelt: ${gesamt.size} Specs · in Gruppen: ${union.size} · Datei: e2e/shard-gruppen.json`)
    process.exit(1)
  }
  console.log(
    `✓ e2e-Shard-Union-Wächter grün — ${gesamt.size} Specs, Union der ${Object.keys(gruppen).length} Gruppen exakt deckungsgleich, keine Doppelten.`,
  )
}

function dateienDerGruppe(n) {
  const { gruppen } = ladeGruppen()
  const dateien = gruppen[String(n)]
  if (!dateien) {
    console.error(`Unbekannte Gruppe: ${n} (bekannt: ${Object.keys(gruppen).join(', ')})`)
    process.exit(2)
  }
  return dateien.map((d) => `e2e/${d}`)
}

function fahren(n) {
  const args = ['playwright', 'test', ...dateienDerGruppe(n)]
  const r = spawnSync('npx', args, { cwd: WURZEL, stdio: 'inherit', env: { ...process.env } })
  process.exit(r.status ?? 1)
}

const [modus, arg] = process.argv.slice(2)
switch (modus) {
  case '--pruefen':
    pruefen()
    break
  case '--fahren':
    fahren(arg)
    break
  case '--dateien':
    console.log(dateienDerGruppe(arg).join(' '))
    break
  default:
    console.error('Verwendung: --pruefen | --fahren <N> | --dateien <N>')
    process.exit(2)
}
