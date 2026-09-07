// scripts/datenhaltung/nachfuehren.ts
// QS-BASIS (d) K5 — die EINE Kette nach einem Korpus-Import.
//
// DAS PROBLEM, das dieses Script löst. Nach einem Import (Kanton zumal) sind vier
// Schritte nötig, und sie stehen bisher nur in Köpfen und Commit-Messages:
//   1. daten/*.db neu bauen           (datenhaltung:build)
//   2. Manifest mitziehen             (datenhaltung:manifest)
//   3. HOT-Replika nachziehen         (datenhaltung:turso-sync)
//   4. Frische der Replika prüfen     (check:turso-frische)
// Wird Schritt 3 vergessen, liefert die Edge-Suche weiter den ALTEN Korpus, während
// die prerenderten Seiten und der statische Index bereits den neuen zeigen. Der
// Nutzer sieht dann einen Erlass, den die Suche nicht kennt — und nichts wird rot.
//
// SEIT K1/K2 WIEGT DAS SCHWERER. Vorher war der Edge-Weg ein Zusatz zum statischen
// Index; seit der Recall- und Ranking-Parität ist er für die 30 709 kantonalen
// Artikel ein VOLLWERTIGER zweiter Weg. Eine veraltete Replika ist damit keine
// Verzögerung mehr, sondern eine falsche Auskunft.
// (Bewusst nicht «gleichwertig»: die Präfix- und Synonym-Grenzen des DB-Weges stehen
// in suche-kern.ts, «WO DIE PARITÄT GILT — UND WO NICHT». Für die Sorge DIESES
// Scripts ändert das nichts — ein veralteter Korpus ist eine falsche Auskunft,
// unabhängig davon, wie gut der Weg sonst ist.)
//
// EHRLICHES ÜBERSPRINGEN (§8). Ohne Turso-Token laufen die Schritte 1+2 normal, 3+4
// werden ÜBERSPRUNGEN — aber laut und mit Nennung dessen, was offen bleibt. Das
// Script endet dann trotzdem mit 0: CI und jede Maschine ohne Token sollen die
// Kette fahren können. «Nicht geprüft» wird ausgesprochen, nie als «in Ordnung»
// verkleidet — dieselbe Linie, die check:turso-frische schon zieht.
//
//   npm run datenhaltung:nachfuehren            volle Kette
//   npm run datenhaltung:nachfuehren -- --pruefen   nur prüfen, nichts schreiben
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const TOKEN_DATEI = 'daten/turso-token.txt';

/** Token wie in turso-sync.ts/check-turso-frische.ts: Env ODER lokale Datei. */
function hatToken(): boolean {
  if ((process.env.TURSO_AUTH_TOKEN ?? '').trim()) return true;
  return existsSync(TOKEN_DATEI) && readFileSync(TOKEN_DATEI, 'utf8').trim().length > 0;
}

interface Schritt {
  name: string;
  skript: string;
  /** Schreibt dieser Schritt? (Im --pruefen-Lauf übersprungen.) */
  schreibt: boolean;
  /** Braucht dieser Schritt den Turso-Token? */
  braucht: 'token' | null;
}

export const KETTE: Schritt[] = [
  { name: 'DB-Artefakte bauen', skript: 'datenhaltung:build', schreibt: true, braucht: null },
  { name: 'Manifest mitziehen', skript: 'datenhaltung:manifest', schreibt: true, braucht: null },
  { name: 'HOT-Replika nachziehen', skript: 'datenhaltung:turso-sync', schreibt: true, braucht: 'token' },
  { name: 'Frische der Replika prüfen', skript: 'check:turso-frische', schreibt: false, braucht: 'token' },
];

/** Ruft ein package.json-Skript auf und gibt dessen Exit-Code zurück. */
function lauf(skript: string): number {
  // `npm run` statt direktem vite-node: die Skript-Definition bleibt an EINER Stelle
  // (package.json), sonst driften Aufrufweg und Kette auseinander (§5).
  const r = spawnSync('npm', ['run', skript], { stdio: 'inherit', shell: false });
  return r.status ?? 1;
}

export interface KettenLage {
  token: boolean;
  nurPruefen: boolean;
  /** Ausführer eines Schritts — injizierbar, damit die Kette ohne echte Läufe prüfbar ist. */
  fuehreAus?: (skript: string) => number;
  log?: (zeile: string) => void;
  melde?: (zeile: string) => void;
}

export interface KettenErgebnis {
  /** Exit-Code, den der CLI-Aufruf setzt: 0 oder der Code des gescheiterten Schritts. */
  code: number;
  /** Skript-Namen in AUSFÜHRUNGS-Reihenfolge — inklusive des gescheiterten. */
  gelaufen: string[];
  /** Wortlaut der übersprungenen Schritte (geht in die Schluss-Meldung). */
  uebersprungen: string[];
}

/**
 * Die Kette selbst — rein bis auf die injizierten Ausgaben (§2).
 *
 * WARUM DIESE NAHT EXISTIERT (Gegenprüfungs-Befund F4, 31.8.2026). K5 war ohne
 * jeden Test gelandet, und zwar nicht aus Nachlässigkeit, sondern weil die Logik
 * keinen Angriffspunkt hatte: sie stand als Rumpf-Code im Modul und rief `npm run`
 * und `process.exit` direkt auf. Genau die zwei Eigenschaften, an denen alles hängt —
 * dass ein Fehlschlag DURCHSCHLÄGT und dass die Folgeschritte dann NICHT mehr laufen —
 * waren damit nur durch einen echten, zerstörenden Lauf zu beobachten. Ein Verhalten,
 * das man nur kaputt beobachten kann, wird nie beobachtet.
 *
 * Die Naht ändert am Ablauf nichts: derselbe Text, dieselbe Reihenfolge, derselbe
 * Exit-Code. Sie macht ihn bloss aufrufbar (Tests in nachfuehren.test.ts).
 */
export function fuehreKette(lage: KettenLage): KettenErgebnis {
  const { token, nurPruefen } = lage;
  const fuehreAus = lage.fuehreAus ?? lauf;
  const log = lage.log ?? ((z: string) => console.log(z));
  const melde = lage.melde ?? ((z: string) => console.error(z));

  const gelaufen: string[] = [];
  const uebersprungen: string[] = [];

  log(
    `datenhaltung:nachfuehren — ${KETTE.length}er-Kette${nurPruefen ? ' (NUR PRÜFEN)' : ''}, ` +
      `Turso-Token ${token ? 'vorhanden' : 'FEHLT'}.`,
  );

  for (const [i, s] of KETTE.entries()) {
    const nr = `[${i + 1}/${KETTE.length}]`;
    if (s.braucht === 'token' && !token) {
      uebersprungen.push(`${s.skript} (${s.name})`);
      log(`${nr} ${s.name} — ÜBERSPRUNGEN (kein TURSO_AUTH_TOKEN).`);
      continue;
    }
    if (nurPruefen && s.schreibt) {
      uebersprungen.push(`${s.skript} (${s.name}, schreibend)`);
      log(`${nr} ${s.name} — ÜBERSPRUNGEN (--pruefen).`);
      continue;
    }
    log(`${nr} ${s.name} — npm run ${s.skript}`);
    gelaufen.push(s.skript);
    const code = fuehreAus(s.skript);
    if (code !== 0) {
      // ABBRUCH statt Weiterlaufen: ein Sync auf eine halb gebaute DB stellt einen
      // falschen Index live. Die Kette ist eine Reihenfolge, keine Wunschliste.
      melde(
        `\ndatenhaltung:nachfuehren ROT: «${s.skript}» endete mit ${code}. ` +
          'Kette abgebrochen — die folgenden Schritte liefen NICHT.',
      );
      return { code, gelaufen, uebersprungen };
    }
  }

  if (uebersprungen.length === 0) {
    log('\ndatenhaltung:nachfuehren grün: Kette vollständig durchlaufen, Replika geprüft.');
    return { code: 0, gelaufen, uebersprungen };
  }

  // Der Kern von K5: was NICHT lief, steht am Ende ausgeschrieben — mit dem Befehl,
  // der es nachholt. Eine Kette, die stillschweigend die Hälfte auslässt, wäre
  // schlimmer als gar keine: sie erzeugt das Gefühl, fertig zu sein.
  log('\ndatenhaltung:nachfuehren: Kette TEILWEISE gelaufen. Offen geblieben:');
  for (const u of uebersprungen) log(`  · ${u}`);
  if (!token) {
    log(
      '\nDie HOT-Replika ist damit NICHT nachgezogen. Solange das offen ist, kann die\n' +
        'Edge-Suche einen älteren Korpus liefern als die ausgelieferten Seiten — seit der\n' +
        'Recall-/Ranking-Parität (QS-BASIS (d) K1/K2) betrifft das die kantonalen Artikel\n' +
        'in vollem Umfang.\n\n' +
        'Nachholen auf einer Maschine MIT Token:\n' +
        `  export TURSO_AUTH_TOKEN=…   (oder ${TOKEN_DATEI} anlegen)\n` +
        '  npm run datenhaltung:nachfuehren\n' +
        'Oder den Workflow «Turso-Serving-Sync» per workflow_dispatch anstossen.',
    );
  }
  return { code: 0, gelaufen, uebersprungen };
}

// CLI-Teil NICHT unter vitest ausführen — der Test importiert `fuehreKette` und darf
// die Kette nicht als Seiteneffekt starten (dieselbe Klemme wie in
// such-index-generieren.ts; vite-node setzt VITEST nicht, der CLI-Weg läuft normal).
if (!process.env.VITEST) {
  const { code } = fuehreKette({ token: hatToken(), nurPruefen: process.argv.includes('--pruefen') });
  process.exit(code);
}
