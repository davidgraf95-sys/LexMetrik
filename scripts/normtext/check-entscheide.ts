// ─── Tor: Integrität des Rechtsprechungs-Korpus (offline) ───────────────────
//
// Pendant zu check-drift.ts (Gesetze), eigener Namespace → berührt die Gesetzes-
// Tore nie. Prüft: Manifest ⊇ Snapshots, Provenienz vollständig (§7), sha
// konsistent, Norm-Index-Refs ⊆ Manifest, ERFASST == Manifest-Keys, Mengen-
// Budget, Anonymisierungs-Heuristik (Warnung). Harte Verstösse → exit 1.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { sha256EntscheidBloecke } from './sha-entscheide';
import type { EntscheidSnapshotDatei } from '../../src/lib/rechtsprechung/typen';
import type { EntscheidManifest } from '../../src/lib/rechtsprechung/register';
import type { NormEntscheidIndex } from '../../src/lib/rechtsprechung/norm-index';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
// Mengen-Budget (empirisch nachgezogen): 23.6.2026 8 → 20 MB; 26.6.2026 20 → 35 MB, weil
// jeder BGE-Leitentscheid nun ZWEI Texte trägt (voller Urteils-Body + amtlicher
// Sammlungs-Auszug) für den UI-Umschalter. Bewusst angehoben (Entscheid David 26.6.):
// der Browse-Index register.json bleibt klein (Metadaten); die Bodies sind lazy geladene
// statische Assets. Bleibt Deckel gegen unbeabsichtigte Massen-Importe, auf realem Niveau.
// Freigabe David 26.6.2026: dieser Deckel wird pro Aufgabe FLIESSEND gesetzt (Ist +
// grosszügige Reserve) und bei Bedarf deliberat angehoben — er bremst Unfälle, limitiert
// aber nicht künstlich. Bei Korpus-Ausbau bewusst nachziehen.
const BUDGET_MB = 35;
const AHV = /\b756\.\d{4}\.\d{4}\.\d{2}\b/;   // CH-Sozialversicherungsnummer (darf nicht vorkommen)

const fehler: string[] = [];
const warn: string[] = [];

function dirGroesseMB(dir: string): number {
  let total = 0;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop()!;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else total += statSync(p).size;
    }
  }
  return total / (1024 * 1024);
}

function main() {
  if (!existsSync(PUB) || !existsSync(join(PUB, 'register.json'))) {
    console.error('[check:entscheide] public/rechtsprechung/register.json fehlt — Korpus nicht gebaut.');
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(join(PUB, 'register.json'), 'utf8')) as EntscheidManifest;
  const keys = new Set(manifest.entscheide.map((e) => e.key));
  const azaKeys: Record<string, string[]> = {};   // aza-Key → BGE-Keys (Kollisions-Backstop)

  for (const e of manifest.entscheide) {
    // Verweis-Eintrag (vollständiges Urteil zu einem BGE, Deep-Link): KEIN eigenes
    // Snapshot-File; eigene Invarianten, dann überspringen (keine Datei-/sha-Prüfung).
    if (e.verweis) {
      if (e.datei) fehler.push(`${e.key}: Verweis-Eintrag darf keine datei haben`);
      if (e.bgeReferenz) fehler.push(`${e.key}: Verweis-Eintrag mit bgeReferenz (Doppelzählung §8)`);
      if (e.leitcharakter !== 'routine') fehler.push(`${e.key}: Verweis-Eintrag muss 'routine' sein`);
      if (!/^https?:\/\//.test(e.quelleUrl)) fehler.push(`${e.key}: Verweis-quelleUrl nicht http(s)`);
      if (!keys.has(e.verweis.zielKey)) fehler.push(`${e.key}: Verweis-zielKey ${e.verweis.zielKey} unbekannt`);
      continue;
    }
    // Provenienz (§7)
    for (const f of ['datum', 'quelleUrl', 'quelle', 'fassungsToken'] as const) {
      if (!e[f]) fehler.push(`${e.key}: Provenienz-Feld '${f}' fehlt`);
    }
    // §8-Invariante: 'leitentscheid' ⟺ amtlicher BGE (bgeReferenz). Eine maschinelle/
    // kantonale Regeste begründet KEINEN Leitstatus (Befund 26.6.2026: verriegelt gegen
    // ein versehentliches Wiedereinführen des '!!regeste'-Glieds in der Klassifizierung).
    if (e.leitcharakter === 'leitentscheid' && !e.bgeReferenz) {
      fehler.push(`${e.key}: 'leitentscheid' ohne bgeReferenz — kein amtlicher BGE (§8)`);
    }
    if (e.bgeReferenz && e.leitcharakter !== 'leitentscheid') {
      fehler.push(`${e.key}: bgeReferenz ohne 'leitentscheid' — Invariante verletzt (§8)`);
    }
    if (e.kuratierung === 'geprueft') warn.push(`${e.key}: kuratierung 'geprueft' ohne Abnahme? (P0 erwartet 'maschinell')`);
    if (e.datum && manifest.erzeugt && e.datum > manifest.erzeugt) {
      warn.push(`${e.key}: Entscheiddatum ${e.datum} liegt nach dem Erzeugungsdatum ${manifest.erzeugt} (OCL-Publikations-/Datumsartefakt prüfen)`);
    }
    // Datei + sha + Anonymisierung
    if (!e.datei) { if (e.bestand === 'snapshot') fehler.push(`${e.key}: bestand 'snapshot' ohne datei`); continue; }
    const fp = join(PUB, e.datei);
    if (!existsSync(fp)) { fehler.push(`${e.key}: Datei ${e.datei} fehlt`); continue; }
    const d = JSON.parse(readFileSync(fp, 'utf8')) as EntscheidSnapshotDatei;
    const snap = d.eintraege?.[0];
    if (!snap) { fehler.push(`${e.key}: keine eintraege in ${e.datei}`); continue; }
    const erwartet = sha256EntscheidBloecke(snap.abschnitte);
    if (snap.sha !== erwartet) fehler.push(`${e.key}: sha-Drift (Datei ${snap.sha?.slice(0, 8)} ≠ erwartet ${erwartet.slice(0, 8)})`);
    const volltext = snap.abschnitte.flatMap((a) => a.bloecke.map((b) => b.text)).join('\n');
    if (AHV.test(volltext) || AHV.test(snap.regeste?.text ?? '')) warn.push(`${e.key}: mögliche AHV-Nummer im Text (Anonymisierung prüfen)`);
    // BGE-Umschalter-Integrität (§8, Bug-Check 26.6.): auszugAbschnitte ⟹ azaUrteil; und
    // der Volltext darf nicht deutlich kürzer sein als der Auszug (Inversion = falscher aza).
    if (snap.auszugAbschnitte?.length && !snap.azaUrteil) {
      fehler.push(`${e.key}: auszugAbschnitte ohne azaUrteil — Umschalter-Invariante verletzt (§8)`);
    }
    if (snap.azaUrteil) {
      (azaKeys[snap.azaUrteil.key] ??= []).push(e.key);
      // §7/§8-Tor: aufgelöstes Urteil MUSS eine http(s)-Live-Quelle (massgebliche Fassung)
      // tragen — sonst zeigt die Voll-Ansicht/Übersichts-Karte still auf den BGE statt aufs Urteil.
      if (!/^https?:\/\//.test(snap.azaUrteil.quelleUrl ?? '')) {
        fehler.push(`${e.key}: azaUrteil ohne http(s)-quelleUrl (massgebliche Fassung fehlt)`);
      }
      const len = (a?: typeof snap.abschnitte) => (a ?? []).reduce((n, ab) => n + ab.bloecke.reduce((m, b) => m + b.text.length, 0), 0);
      if (snap.auszugAbschnitte?.length && len(snap.abschnitte) < len(snap.auszugAbschnitte) * 0.85) {
        warn.push(`${e.key}: Volltext kürzer als Auszug (mögliche aza-Fehlzuordnung/Inversion)`);
      }
    }
    // Vollständigkeits-/Plausibilitäts-Warnungen (P4, nicht-blockierend).
    const sv = snap.abschnitte.find((a) => a.typ === 'sachverhalt');
    if (sv && sv.vollstaendig === false) warn.push(`${e.key}: Sachverhalt nur Auszug (full_text-Schnitt fehlgeschlagen?)`);
    for (const a of snap.abschnitte) for (const b of a.bloecke) {
      if (a.typ === 'dispositiv' && b.text.length > 4000) warn.push(`${e.key}: Dispositiv-Block ${b.text.length} Z. (>4000 — Korruption?)`);
    }
    const tops = (snap.abschnitte.find((a) => a.typ === 'erwaegung')?.bloecke ?? [])
      .map((b) => Number(/(\d+)/.exec(b.marke ?? '')?.[1] ?? NaN)).filter(Number.isFinite);
    for (let i = 1; i < tops.length; i++) if (tops[i] - tops[i - 1] >= 3) { warn.push(`${e.key}: Erwägungs-Top-Sprung ${tops[i - 1]}→${tops[i]}`); break; }
  }

  // aza-Kollision (§8-Backstop, Bug-Check 26.6.): kein aza-Urteil darf von ZWEI BGE als
  // Volltext beansprucht werden — sonst ist mindestens eine Zuordnung falsch.
  for (const [k, refs] of Object.entries(azaKeys)) {
    if (refs.length > 1) fehler.push(`aza-Kollision: ${k} von mehreren BGE beansprucht (${refs.join(', ')}) — Fehlzuordnung (§8)`);
  }

  // Norm-Index: jede referenzierte key ⊆ Manifest
  if (existsSync(join(PUB, 'norm-index.json'))) {
    const idx = JSON.parse(readFileSync(join(PUB, 'norm-index.json'), 'utf8')) as NormEntscheidIndex;
    for (const [nk, refs] of Object.entries(idx.proNorm)) {
      for (const r of refs) if (!keys.has(r.key)) fehler.push(`norm-index[${nk}]: unbekannter key ${r.key}`);
    }
  }

  // ERFASST == Manifest-Keys
  const genPfad = join(ROOT, 'src', 'lib', 'rechtsprechung', 'erfasste-keys.generated.ts');
  if (existsSync(genPfad)) {
    const gen = readFileSync(genPfad, 'utf8');
    const inSet = new Set([...gen.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
    for (const k of keys) if (!inSet.has(k)) fehler.push(`ERFASST fehlt key ${k}`);
    for (const k of inSet) if (!keys.has(k)) fehler.push(`ERFASST hat verwaisten key ${k}`);
  }

  // Mengen-Budget
  const mb = dirGroesseMB(PUB);
  if (mb > BUDGET_MB) fehler.push(`Mengen-Budget überschritten: ${mb.toFixed(1)} MB > ${BUDGET_MB} MB`);

  for (const w of warn) console.warn(`[check:entscheide] WARN ${w}`);
  if (fehler.length) {
    for (const f of fehler) console.error(`[check:entscheide] FEHLER ${f}`);
    process.exit(1);
  }
  console.log(`[check:entscheide] OK — ${manifest.entscheide.length} Entscheide, ${mb.toFixed(2)} MB, ${warn.length} Warnung(en).`);
}

main();
