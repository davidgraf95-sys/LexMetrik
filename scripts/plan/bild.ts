// scripts/plan/bild.ts — Lagebild-Generator `npm run plan:bild` (Schritt QS-PLAN-BILD).
//
// Erzeugt FÜNF untereinander verlinkte HTML-Seiten (Mehrseiten-Ausbau,
// Go David 4.8.2026 — «gerne auch mehrere Seiten»; fünfte Seite mit dem Umbau
// «Lagebild schlank» 8.9.2026):
//
//   plan-bild.html             Lagebild — fünf Klartext-Blöcke (EINSTIEG)
//   plan-bild-bau.html         Bau-Details — Vollliste, Sperren, Bau-Aufträge
//   plan-bild-projekt.html     Projekt & Produkt — Werkzeuge, Gesetze, Rechtsprechung
//   plan-bild-geschichte.html  Geschichte & Bau-Statistik
//   plan-bild-methode.html     Arbeitsweise & Glossar
//
// **Der Dateiname der Index-Seite bleibt `plan-bild.html`** — App-Kachel und
// LaunchAgent zeigen auf diesen Anker. Die Zusatzseiten hängen ihr Suffix
// an denselben Präfix und werden relativ verlinkt (funktioniert unter file://).
//
// Aufbau (§6.6 Datei-Schlankheit):
//   ./bildDaten.ts   — alle Datensammler (Plan, git/gh, Katalog, Register, Chronik)
//   ./bildHtml.ts    — Design-Tokens/CSS, Escaping, Navigation, Dokument-Rahmen
//   ./bildSeiten.ts  — die vier Seiten-Inhalte + Bau-Prompt
//   diese Datei      — CLI, Ausgabepfade, Zusammenbau
//
// Kennzahlen-Wahrheit: parseRoadmap()+resolve() — DIESELBEN Funktionen wie
// plan:next/check:plan (§5, keine zweite Resolver-Logik). Die Seiten behaupten
// nichts, was nicht aus Plan, Registern, git oder gh belegbar ist.
//
// Aufruf:  npm run plan:bild                      → tmp/plan-bild.html + 4 Zusatzseiten
//          npm run plan:bild -- --out <pfad>      → eigener Pfad der INDEX-Seite;
//                                                   die Zusatzseiten liegen daneben
//                                                   mit demselben Präfix
//          npm run plan:bild -- --open            → danach im Browser öffnen (macOS)
//          npm run plan:bild -- --watch [sek]     → alle N Sekunden neu erzeugen
//                                                   (Default 60); alle fünf Seiten
//                                                   laden sich selbst nach.
//                                                   Kein Server (Spec).
//                                                   ACHTUNG (Lehre 8.8.2026): der
//                                                   Watch-Prozess rendert dauerhaft
//                                                   mit dem CODE-Stand seines Starts
//                                                   (Module bleiben geladen; --pull
//                                                   erneuert nur die Daten). Für
//                                                   Hintergrund-Betrieb darum NIE
//                                                   --watch, sondern je Durchlauf
//                                                   einen frischen Prozess — so der
//                                                   LaunchAgent ch.lexmetrik.planbild
//                                                   (planbild-watch.sh, Schleife)
//                                                   seit 8.8.2026. Anlass: Lagebild
//                                                   zeigte 4 Tage eine alte Fassung.
//          npm run plan:bild -- --pull            → vor jeder Erzeugung git pull
//                                                   --ff-only (still; scheitert der
//                                                   Pull — schmutzig/divergiert —,
//                                                   wird der lokale Stand gezeigt).
//                                                   Opt-in David 4.8.2026.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { sh } from './bildDaten';
import { SEITEN, seitenPfad, type SeitenSchluessel } from './bildHtml';
import { bauSeite } from './bildBau';
import { bauPrompt, geschichteSeite, lagebildSeite, methodeSeite, projektSeite, type SeitenOpts } from './bildSeiten';

/** Seiten-Schlüssel → Generator. Reihenfolge = Reihenfolge der Navigation. */
const GENERATOREN: Record<SeitenSchluessel, (o: SeitenOpts) => string> = {
  lagebild: lagebildSeite,
  bau: bauSeite,
  projekt: projektSeite,
  geschichte: geschichteSeite,
  methode: methodeSeite,
};

/** Erzeugt alle fünf Seiten und gibt die geschriebenen Pfade zurück. */
export function baueAlleSeiten(indexPfad: string, watch: number | null): string[] {
  const stand = new Date().toLocaleString('de-CH', { dateStyle: 'medium', timeStyle: 'short' });
  const opts: SeitenOpts = { indexPfad, watch, stand };
  const ordner = dirname(indexPfad);
  if (ordner && !existsSync(ordner)) mkdirSync(ordner, { recursive: true });
  const geschrieben: string[] = [];
  for (const s of SEITEN) {
    const pfad = seitenPfad(indexPfad, s.schluessel);
    writeFileSync(pfad, GENERATOREN[s.schluessel](opts));
    geschrieben.push(pfad);
  }
  return geschrieben;
}

/** Rückwärtskompatible Fassade: nur die Index-Seite als String (Tests, Importe). */
export function baueSeite(opts: { watch: number | null; indexPfad?: string }): string {
  return lagebildSeite({
    indexPfad: opts.indexPfad ?? 'tmp/plan-bild.html',
    watch: opts.watch,
    stand: new Date().toLocaleString('de-CH', { dateStyle: 'medium', timeStyle: 'short' }),
  });
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
if (!process.env.VITEST) {
  const argv = process.argv.slice(2);
  const outIdx = argv.indexOf('--out');
  const out = outIdx >= 0 ? argv[outIdx + 1] : 'tmp/plan-bild.html';
  const watchIdx = argv.indexOf('--watch');
  const watch = watchIdx >= 0 ? Number(argv[watchIdx + 1]) || 60 : null;
  const pull = argv.includes('--pull');

  const schreib = () => {
    // sh() schluckt Fehler: ist der Checkout schmutzig oder divergiert,
    // unterbleibt der Pull still und die Seiten zeigen den lokalen Stand —
    // der Erzeugt-Zeitstempel bleibt der Wahrheitsanker.
    if (pull) sh('git', ['pull', '--ff-only', '--quiet']);
    const pfade = baueAlleSeiten(out, watch);
    console.log(`plan:bild → ${pfade.join(' · ')}${watch ? ` (watch, alle ${watch} s)` : ''}`);
  };
  schreib();
  if (argv.includes('--open')) sh('open', [out]);
  if (watch) setInterval(schreib, watch * 1000);
}

export { bauPrompt };
export { schrittInfoAusRoadmap } from './bildDaten';
