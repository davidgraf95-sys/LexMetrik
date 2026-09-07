// scripts/plan/buchung.ts — Kernlogik des Merge-Trailers `Roadmap-Status`
// (QS-PLAN-EINFACH, 14.8.2026, Punkt 1).
//
// ZWECK: Der Hand-Schritt «plan:set status=… + push» nach jeder Landung entfällt,
// wenn der Squash-Commit die Absicht schon trägt. Trailer-Konvention (ZUSÄTZLICH
// zum bestehenden `Roadmap: <ID>`, siehe scripts/plan/bildSeiten.ts Z. 166):
//
//   Roadmap-Status: done
//   Roadmap-Status: ready
//   Roadmap-Status: parked(<blocker-token>)
//
// Der Workflow `.github/workflows/plan-buchung.yml` kann diese Prüfung nicht
// lokal vorführen (kein `act`-Runner hier) — darum liegt die Trailer-Parse- und
// Validierungslogik hier als reine, mit Vitest getestete Funktion. Der Workflow
// ruft diese Datei als CLI auf; bei einem ungültigen Trailer wirft sie und
// beendet den Prozess mit Exit 1, BEVOR `npm run plan:set` je aufgerufen wird —
// kein unwahrer Buchungsversuch, kein Teil-Schreibzugriff auf ROADMAP.md (§6.7).
//
// ABSICHTLICH NICHT HIER GEPRÜFT: ob die ID tatsächlich in ROADMAP.md existiert.
// Das prüft `plan:set` bereits selbst (setField wirft `Schritt-id "…" nicht
// gefunden`, siehe set.ts) — eine zweite Prüfung derselben Regel wäre eine
// zweite Wahrheit (§5). «Unbekannte ID ⇒ Exit 1» ist damit über die bestehende
// Kette abgedeckt, sobald der Workflow `npm run plan:set` aufruft.
import { STATUS_WERTE, type Status } from './etikett';

// Nur diese drei Werte sind per Merge-Trailer buchbar. `wip`/`blocked` bleiben
// bewusst aussen vor: ein Merge nach main ist ein ABSCHLUSS-Ereignis, kein
// Zwischenstand — ein automatischer `wip`/`blocked`-Trailer hätte keine
// plausible Quelle (wer merged einen Schritt als "noch in Arbeit"?) und bleibt
// darum weiterhin nur von Hand über `npm run plan:set` setzbar.
const BUCHBARE_STATUS: readonly Status[] = ['done', 'ready', 'parked'];

export interface Buchung {
  id: string;
  status: Status;
  blocker: string | null;
}

/**
 * Parst den Wert des `Roadmap-Status`-Trailers. Wirft bei unbekanntem Status,
 * bei einem Klammer-Zusatz ausserhalb von `parked`, oder wenn `parked` OHNE
 * Blocker-Token kommt (die Roadmap kennt keinen "geparkt, aber warum"-Zustand —
 * FELDER-Kommentar in set.ts / check.ts Regel 3).
 */
export function parseStatusTrailer(wert: string): { status: Status; blocker: string | null } {
  const roh = wert.trim();
  const m = roh.match(/^(\w+)(?:\((.*)\))?$/);
  if (!m) {
    throw new Error(`Roadmap-Status: Wert unlesbar "${wert}" — erwartet "done" | "ready" | "parked(<token>)".`);
  }
  const [, statusRoh, blockerRoh] = m;
  if (!STATUS_WERTE.includes(statusRoh as Status) || !BUCHBARE_STATUS.includes(statusRoh as Status)) {
    throw new Error(
      `Roadmap-Status: ungültiger Wert "${statusRoh}" — per Merge-Trailer buchbar sind nur ` +
      `${BUCHBARE_STATUS.join('/')} (wip/blocked sind kein Merge-Ergebnis, weiterhin nur per ` +
      `'npm run plan:set' von Hand setzbar).`);
  }
  const status = statusRoh as Status;
  if (status === 'parked') {
    if (!blockerRoh || !blockerRoh.trim()) {
      throw new Error(
        `Roadmap-Status: "parked" verlangt ein Blocker-Token in Klammern, z. B. ` +
        `"Roadmap-Status: parked(a33-flake)".`);
    }
    return { status, blocker: blockerRoh.trim() };
  }
  if (blockerRoh !== undefined) {
    throw new Error(
      `Roadmap-Status: "${status}(${blockerRoh})" — der Klammer-Zusatz ist nur bei "parked" erlaubt.`);
  }
  return { status, blocker: null };
}

/**
 * Kombiniert die beiden Trailer-Werte (`Roadmap`, `Roadmap-Status`) zu einer
 * validierten Buchung. Der Workflow ruft diese Funktion nur auf, wenn BEIDE
 * Trailer im Head-Commit vorhanden sind — sie bleibt trotzdem defensiv gegen
 * einen leeren Trailer-WERT (`Roadmap:` ohne Inhalt ist für `git log
 * %(trailers:…)` ein vorhandener, aber leerer Treffer).
 */
// Enger Zeichensatz für ID und Blocker-Token (Gegenprüfungs-Befund 14.8.2026):
// die Werte stammen aus dem Commit-Text und fliessen in plan:set und die
// Commit-Message des Buchungs-Commits — Shell-Metazeichen (`$`, Backtick, `;`,
// Anführungszeichen …) haben in einer Schritt-ID nichts verloren und werden
// hart abgewiesen, BEVOR irgendetwas weiterläuft. Echte IDs: `W2·10-UI-NAV`,
// `QS-GP`; echte Tokens: `vps-bestellung-david`, `pr-451`.
const ID_RE = /^[A-Za-z0-9·.-]+$/;
const TOKEN_RE = /^[a-z0-9-]+$/;

export function parseBuchung(idTrailer: string, statusTrailer: string): Buchung {
  const id = idTrailer.trim();
  if (!id) throw new Error('Roadmap: Trailer ist leer — keine ID zum Buchen.');
  if (!ID_RE.test(id)) {
    throw new Error(`Roadmap: "${id}" enthält unerlaubte Zeichen (erlaubt: Buchstaben, Ziffern, ·, ., -).`);
  }
  const { status, blocker } = parseStatusTrailer(statusTrailer);
  if (blocker !== null && !TOKEN_RE.test(blocker)) {
    throw new Error(`Roadmap-Status: Blocker-Token "${blocker}" enthält unerlaubte Zeichen (erlaubt: a-z, 0-9, -).`);
  }
  return { id, status, blocker };
}

// ---------------------------------------------------------------------------
// FALLBACK (Lehre 14.8.2026, real bei PR #491): GitHub Auto-Merge nimmt bei
// einem Squash mit MEHREREN Commits den Standard-Text — nur die verketteten
// Commit-SUBJECTS, endet auf "Co-authored-by". Ein Trailer, der nur im BODY
// eines Zwischen-Commits stand, erreicht den Squash-Commit dann nie; der
// Buchungs-Workflow blieb (korrekt fail-safe) still, die Buchung musste von
// Hand nachgezogen werden.
//
// Ersatzweise wird die Buchungs-Absicht aus dem PR-BODY gelesen — dort steht
// sie unverändert, unabhängig davon, was GitHub in den Squash-Commit kopiert.
// PR-Body ist FREMDTEXT (Daten, nie Code, §14.7 Dispatch-Klausel): er wird wie
// eine Commit-Message als Trailer-Block interpretiert. Gefundene Werte laufen
// exakt durch dieselbe Zeichensatz-Wache (`parseBuchung` → `ID_RE`/`TOKEN_RE`)
// wie Commit-Trailer; ein Injection-Versuch im Blocker-Token oder in der ID
// wird dadurch genauso hart abgewiesen. Priorität: Commit-Trailer schlägt
// PR-Body (der Workflow ruft diesen Fallback nur auf, wenn der Commit-Trailer
// fehlte).
//
// Gegenprüfungs-Auflage B1-1 (14.8.2026): Haus-PR-Bodies enden auf den
// Werkzeug-Footer «🤖 Generated with […]» — ein reiner "letzter Absatz"-Blick
// hätte den Anlass-PR #491 selbst NIE gebucht, weil der Footer, nicht der
// Trailer, zuletzt steht. Der Parser geht darum die Absätze VON HINTEN durch
// und überspringt reine Footer-/Trenn-Absätze (jede Zeile beginnt mit "🤖"
// oder "_🤖", oder ist eine "---"-Trennlinie); der ERSTE verbleibende Absatz
// ist dann der einzige Kandidat für den Trailer-Block — ist er es nicht
// vollständig, gibt es keinen Treffer (kein Weitersuchen weiter zurück: ein
// "Roadmap:"-Satz mitten in der Beschreibung ist kein Trailer).
//
// Gegenprüfungs-Auflage B1-3 (14.8.2026): NUR die drei bekannten Trailer-Keys
// zählen (Roadmap, Roadmap-Status, Gegenpruefung — die reale Haus-Konvention,
// siehe z. B. ROADMAP-CHRONIK.md), UND eine Zeile zählt nie als Trailer-Zeile,
// wenn sie eingerückt ist (≥1 Leerzeichen vor dem Key — Markdown-Codeblock-
// Konvention: 4 Leerzeichen) oder innerhalb eines ``` -Fences liegt. Deshalb
// KEIN `.trim()` auf die einzelne Zeile vor der Klassifikation — nur zum
// Erkennen einer rein-leeren Zeile (Absatz-Trenner).
const TRAILER_KEYS = ['Roadmap', 'Roadmap-Status', 'Gegenpruefung'] as const;
const TRAILER_LINE_RE = /^(Roadmap-Status|Roadmap|Gegenpruefung):\s*(.*)$/;
const FOOTER_ZEILE_RE = /^(🤖|_🤖)/;
const TRENNLINIE_RE = /^-{3,}$/;

function istFusszeile(zeile: string): boolean {
  const roh = zeile.trim();
  return FOOTER_ZEILE_RE.test(roh) || TRENNLINIE_RE.test(roh);
}

/** Ein Absatz = fortlaufende Zeilen, `inFence` markiert Zeilen innerhalb eines
 *  ``` -Codeblocks (die Fence-Markierungszeile selbst zählt als "in Fence"). */
function absaetzeMitFenceStatus(text: string): { text: string; inFence: boolean }[][] {
  const zeilen = text.replace(/\r\n/g, '\n').split('\n');
  const absaetze: { text: string; inFence: boolean }[][] = [];
  let aktuell: { text: string; inFence: boolean }[] = [];
  let inFence = false;
  for (const roh of zeilen) {
    if (roh.trim().length === 0) {
      if (aktuell.length) { absaetze.push(aktuell); aktuell = []; }
      continue;
    }
    if (/^\s*```/.test(roh)) {
      aktuell.push({ text: roh, inFence: true });
      inFence = !inFence;
      continue;
    }
    aktuell.push({ text: roh, inFence });
  }
  if (aktuell.length) absaetze.push(aktuell);
  return absaetze;
}

/**
 * Sucht von HINTEN nach dem Trailer-Block: überspringt reine Footer-/Trenn-
 * Absätze, dann muss der nächste Absatz VOLLSTÄNDIG aus gültigen
 * Trailer-Zeilen (Keys Roadmap/Roadmap-Status/Gegenpruefung, unindentiert,
 * ausserhalb jedes ``` -Fences) bestehen — sonst kein Treffer (kein
 * Weitersuchen). Mehrfaches Vorkommen desselben Keys im Block: der letzte
 * gewinnt (wie `git interpret-trailers`).
 */
export function extractTrailerBlock(text: string): Record<string, string> {
  if (!text.trim()) return {};
  const absaetze = absaetzeMitFenceStatus(text);
  for (let i = absaetze.length - 1; i >= 0; i--) {
    const zeilen = absaetze[i];
    if (zeilen.every((z) => istFusszeile(z.text))) continue; // Footer/Trennlinie -> weiter zurück

    const ergebnis: Record<string, string> = {};
    for (const { text: zeile, inFence } of zeilen) {
      if (inFence) return {};
      const m = zeile.match(TRAILER_LINE_RE);
      if (!m) return {};
      ergebnis[m[1]] = m[2].trim();
    }
    return ergebnis;
  }
  return {};
}

// Nur zur Selbstdokumentation exportiert (Kommentar-Referenz oben) — kein
// Aufrufer ausserhalb dieser Datei braucht die Liste heute.
export { TRAILER_KEYS };

// Erkennt eine `Roadmap-Status:`-Zeile IRGENDWO im Body — nicht nur im
// extrahierten Schlussblock (Gegenprüfungs-Befund 3.9.2026, Opus-Prüfer:
// Regression A/B). Case-insensitive, zeilenweise (führender Leerraum
// zugelassen), damit auch eine Erwähnung ausserhalb des finalen Absatzes
// erkannt wird.
const STATUS_ZEILE_RE = /^roadmap-status\s*:/i;

/** `Roadmap-Status:`-Zeile irgendwo im Body, aber NUR ausserhalb von
 *  ``` -Fences und ohne Einrückung (Markdown-Code) — sonst zählt ein zitiertes
 *  Beispiel der Trailer-Form (Skill `landung` Ziff. 9 im PR-Body) als
 *  Buchungsabsicht (Nachprüfungs-Befund Opus 3.9.2026: Fence-Zitat machte den
 *  wip-Body rot). Dieselbe Fence-Logik wie `extractTrailerBlock`. */
function hatStatusZeileAusserhalbCode(body: string): boolean {
  for (const absatz of absaetzeMitFenceStatus(body)) {
    for (const { text, inFence } of absatz) {
      if (!inFence && STATUS_ZEILE_RE.test(text)) return true;
    }
  }
  return false;
}

/**
 * Liest die Buchungs-Trailer ersatzweise aus einem PR-Body. Gibt `null`
 * zurück, wenn dort kein vollständiger Trailer-Block steht (stiller
 * Normalfall, §6.7 kein Rot). Steht ein Trailer-Block da, aber mit ungültigem
 * Wert oder verbotenen Zeichen, wirft diese Funktion — wie `parseBuchung` —
 * und der Aufrufer (CLI unten) beendet den Prozess mit Exit 1: ein erkannter,
 * aber kaputter/bösartiger Buchungsversuch darf nie still verpuffen.
 *
 * VERHALTENSÄNDERUNG 3.9.2026 (deklariert, §6.3; Beleg: Workflow-Lauf
 * 33694227189 bei PR #636 rot): `Roadmap:` OHNE jede `Roadmap-Status:`-Zeile
 * im GESAMTEN Body ist kein Fehler mehr — «lone Roadmap = noop». Ein Schritt,
 * der nach der Landung bewusst `wip` bleibt (mehrere PRs pro Schritt, z. B.
 * QS-FREMDAGENTEN), hat keinen gültigen Merge-Status-Trailer; ein Body mit
 * nur `Roadmap:` ist dafür der einzig korrekte Zustand (Skill `landung`
 * Ziff. 9), symmetrisch zum Commit-Pfad (dort ruft der Workflow `parseBuchung`
 * ohnehin nur auf, wenn BEIDE Commit-Trailer vorhanden sind).
 *
 * GEGENPRÜFUNGS-KORREKTUR 3.9.2026 (Opus-Prüfer widerlegte die erste Fassung):
 * Der Noop-Fall darf sich NICHT auf den extrahierten Schlussblock stützen,
 * sondern muss den GANZEN Body prüfen — sonst zwei stille Regressionen:
 * (A) `Roadmap-Status:` steht in einem FRÜHEREN Absatz, `Roadmap:` allein im
 *     letzten — der Schlussblock enthält nur `Roadmap`, ein naiver Blick auf
 *     den Block hielte das für den Noop-Fall, obwohl irgendwo im Body sehr
 *     wohl eine Status-Absicht steht. Sobald IRGENDWO eine
 *     `Roadmap-Status:`-Zeile vorkommt, gelten die alten strengen Regeln
 *     (beide Trailer im SELBEN Schlussabsatz, nicht-leerer gültiger Wert) —
 *     sonst Wurf, nie still.
 * (B) `Roadmap-Status:` steht im SELBEN Absatz wie `Roadmap:`, aber mit
 *     LEEREM Wert (`Roadmap-Status:` ohne Rest) — ein naiver Blick auf
 *     `!status` behandelt einen leeren String genauso wie "keine Zeile
 *     vorhanden" und würde fälschlich null liefern. Die Zeile ist aber da;
 *     ein leerer Wert ist kein gültiger Status => Wurf.
 * Die Weiche unten prüft darum ZUERST den ganzen Body (nicht den Block).
 */
export function parseBuchungAusPrBody(body: string): Buchung | null {
  const block = extractTrailerBlock(body);
  const roadmap = block['Roadmap'];
  const status = block['Roadmap-Status'];

  // Keine `Roadmap-Status:`-Zeile IRGENDWO im Body -> nichts zu tun, auch
  // wenn `Roadmap:` (allein) da ist oder gar kein Trailer vorkommt.
  if (!hatStatusZeileAusserhalbCode(body)) {
    return null;
  }

  // Ab hier: irgendwo im Body steht eine `Roadmap-Status:`-Zeile -> die alten
  // strengen Regeln gelten wieder unbedingt: BEIDE Trailer müssen im selben
  // Schlussabsatz stehen (extractTrailerBlock liefert nur dann für BEIDE
  // Keys einen Wert), UND der Status-Wert darf nicht leer sein. Das verpuffte
  // bis 15.8.2026 STILL (Realfall PR #507: Workflow «success» ohne Buchung,
  // Hand-Buchung nötig). Erkannter, aber kaputter Buchungsversuch => laut
  // (Exit 1), nie still.
  if (!roadmap || !status) {
    throw new Error(
      `PR-Body: unvollständiger Buchungs-Block (Roadmap=${roadmap ?? '—'}, ` +
      `Roadmap-Status=${status || '—'}) — beide Trailer müssen im SELBEN Absatz ` +
      `stehen (zusammenhängender Block, Skill landung Ziff. 9).`);
  }
  return parseBuchung(roadmap, status);
}

// CLI, zwei Modi:
//   vite-node scripts/plan/buchung.ts -- "<Roadmap-Trailer>" "<Roadmap-Status-Trailer>"
//     Commit-Trailer-Pfad (unverändert). Gibt bei Erfolg drei Zeilen im
//     GITHUB_OUTPUT-Format aus (id=…/status=…/blocker=…) und wirft (Exit 1)
//     bei ungültiger Eingabe.
//   vite-node scripts/plan/buchung.ts --pr-body   (Body auf STDIN)
//     PR-Body-Fallback. Kein Trailer-Block im Body -> Exit 0 OHNE Ausgabe
//     (still, wie der Normalfall). Trailer-Block vorhanden, aber ungültig/
//     Injection-Versuch -> Exit 1, wie oben.
if (!process.env.VITEST) {
  const mode = process.argv[2];
  if (mode === '--pr-body') {
    void (async () => {
      let body = '';
      process.stdin.setEncoding('utf8');
      for await (const chunk of process.stdin) body += chunk;
      try {
        const b = parseBuchungAusPrBody(body);
        if (b) {
          console.log(`id=${b.id}`);
          console.log(`status=${b.status}`);
          console.log(`blocker=${b.blocker ?? ''}`);
        } else {
          // Kein (vollständiger) Buchungs-Trailer -> bewusst KEINE Zeile auf
          // stdout (das geht direkt in $GITHUB_OUTPUT, jede Fremdzeile dort
          // wäre ein ungültiger Eintrag) — der Hinweis geht auf stderr, Exit 0.
          console.error(
            'PR-Body: kein vollständiger Buchungs-Trailer (oder Roadmap ohne ' +
            'Status — gültiger wip-Normalfall seit 3.9.2026) — nichts zu tun.');
        }
      } catch (e) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
      }
    })();
  } else {
    const [idTrailer, statusTrailer] = process.argv.slice(2);
    if (!idTrailer || !statusTrailer) {
      console.error('Aufruf: vite-node scripts/plan/buchung.ts -- "<Roadmap>" "<Roadmap-Status>"');
      console.error('   oder: vite-node scripts/plan/buchung.ts --pr-body   (Body auf STDIN)');
      process.exit(2);
    }
    try {
      const b = parseBuchung(idTrailer, statusTrailer);
      console.log(`id=${b.id}`);
      console.log(`status=${b.status}`);
      console.log(`blocker=${b.blocker ?? ''}`);
    } catch (e) {
      console.error(e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  }
}
