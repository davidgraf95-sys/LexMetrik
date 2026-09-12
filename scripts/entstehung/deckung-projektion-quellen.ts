// scripts/entstehung/deckung-projektion-quellen.ts
// Das Einlesen der Quellen für die Deckungs-Projektion — EINMAL, für den
// Generator UND für das Tor (§5). Stünde es zweimal da, könnte der Tor-Lauf
// eine andere Grundgesamtheit lesen als der Generator und «byte-gleich» wäre
// keine Zusicherung mehr, sondern ein Zufall.
//
// Reines Lesen committeter Artefakte: kein Netz, keine Uhr (§2).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DECKUNG_REGISTER_PFAD } from './deckung.ts';
import {
  baueDeckungProjektion, serialisiereDeckungProjektion,
  DECKUNG_PROJEKTION_PFAD, DECKUNG_DECKEL,
} from './deckung-projektion.ts';
import { ANKER_REGISTER_PFAD } from './anker-register.ts';
import type {
  DeckungBauEingabe, DeckungRegisterQuelle, EntstehungQuelle, SynopseQuelle,
  ProvenienzQuelle, AnkerRegisterQuelle, NormRegisterQuelle,
} from './deckung-projektion.ts';

export * from './deckung-projektion.ts';

export const ENTSTEHUNG_DIR = 'public/materialien/entstehung';
export const SYNOPSE_DIR = 'public/materialien/synopse';
export const CURIA_DIR = 'public/materialien/curia';
export const PROVENIENZ_PFAD = 'public/materialien/register-provenienz.json';
export const NORM_REGISTER_PFAD = 'public/normtext/register.json';

function lies<T>(pfad: string): T {
  if (!existsSync(pfad)) {
    throw new Error(`${pfad} fehlt — die Deckungs-Projektion ist eine Sicht auf bestehende Artefakte (§5).`);
  }
  return JSON.parse(readFileSync(pfad, 'utf8')) as T;
}

function shards<T>(dir: string): Map<string, T> {
  const out = new Map<string, T>();
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    out.set(decodeURIComponent(f.slice(0, -'.json'.length)), JSON.parse(readFileSync(join(dir, f), 'utf8')) as T);
  }
  return out;
}

/** Liest alle Quellen der Deckungs-Projektion (offline, deterministisch). */
export function leseDeckungQuellen(): DeckungBauEingabe {
  const curiaDateien = existsSync(CURIA_DIR)
    ? readdirSync(CURIA_DIR).filter((f) => f.endsWith('.json')).sort()
    : [];
  // Abrufdatum der Parlaments-Ebene = das JÜNGSTE der Shards. Ein älteres zu
  // zeigen wäre eine Untertreibung, ein jüngeres eine Behauptung (§7a).
  let curiaAbgerufen = '';
  for (const f of curiaDateien) {
    const a = (JSON.parse(readFileSync(join(CURIA_DIR, f), 'utf8')) as { abgerufen?: string }).abgerufen ?? '';
    if (a > curiaAbgerufen) curiaAbgerufen = a;
  }
  const deckung = lies<DeckungRegisterQuelle>(DECKUNG_REGISTER_PFAD);
  return {
    deckung,
    normRegister: lies<NormRegisterQuelle>(NORM_REGISTER_PFAD),
    entstehung: shards<EntstehungQuelle>(ENTSTEHUNG_DIR),
    synopse: shards<SynopseQuelle>(SYNOPSE_DIR),
    provenienz: lies<ProvenienzQuelle>(PROVENIENZ_PFAD),
    ankerRegister: lies<AnkerRegisterQuelle>(ANKER_REGISTER_PFAD),
    curia: { geschaefte: curiaDateien.length, abgerufen: curiaAbgerufen || deckung.erzeugt },
  };
}

// ── Tor-Klasse «Deckungs-Sicht» (check:entstehung Ziff. 7) ───────────────────
//
// Dieselbe Zusicherung wie bei der Entstehungs-Projektion (E3): die
// ausgelieferte Datei ist eine SICHT und darf nie etwas anderes sagen als ihre
// Quellen. Weil sie ohne Uhr und ohne `--datum` gebaut wird — die Stände kommen
// aus den Quellen selbst —, ist der Vergleich offline vollständig: Byte für
// Byte. Die Funktion steht HIER und nicht im Tor, weil das Tor sonst über die
// §6.6-Schwelle wächst (Muster ./deckel.ts, Klasse «Verfahrens-Ereignisse»).

/** Ausgabezeile + Fehler der Klasse (rein bis auf das Lesen der Artefakte). */
export function pruefeDeckungsSicht(pfad: string = DECKUNG_PROJEKTION_PFAD): {
  zeile: string | null; fehler: string[];
} {
  if (!existsSync(pfad)) {
    return {
      zeile: null,
      fehler: [`${pfad} fehlt — die Deckungs-Seite hätte keinen Ladekanal («npm run gen:entstehung-deckung»).`],
    };
  }
  const ist = readFileSync(pfad, 'utf8');
  const soll = serialisiereDeckungProjektion(baueDeckungProjektion(leseDeckungQuellen()));
  const fehler: string[] = [];
  if (soll !== ist) {
    fehler.push(
      `${pfad} deckt sich nicht mit der Neuberechnung aus ihren Quellen — entweder von Hand `
      + 'geändert oder eine Quelle bewegte sich ohne Generator-Lauf. '
      + '«npm run gen:entstehung-deckung» ausführen und den Diff prüfen (§2/§5).',
    );
  }
  const zeilen = (JSON.parse(ist) as { erlasse: Record<string, unknown> }).erlasse;
  return {
    zeile: `check:entstehung — Deckungs-Sicht: ${Object.keys(zeilen).length} Erlass-Zeilen, `
      + `${(Buffer.byteLength(ist) / 1024).toFixed(1)} KB / ${(DECKUNG_DECKEL / 1024).toFixed(1)} KB; `
      + `${soll === ist ? 0 : 1} Abweichung(en) zur Neuberechnung.`,
    fehler,
  };
}
