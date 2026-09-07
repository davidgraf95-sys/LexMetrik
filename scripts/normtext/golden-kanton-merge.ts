// Golden-Merge für kantonale Teilläufe des Normtext-Generators (§5, §8).
//
// EINE Quelle für die Frage «welche bestehenden Golden-Schlüssel darf ein
// Teillauf verwerfen?». Vorher stand die Regel inline in
// scripts/normtext-snapshot.ts (--nur=kanton, --nur=zh) und war darum nicht
// isoliert testbar — genau die Stelle, an der der AR-1203-Verlust entstand
// (Commit 7a14fa06). Seiteneffektfreies Modul: normtext-snapshot.ts startet beim
// Import main(), kann also nicht aus einem Unit-Test importiert werden (dieselbe
// Begründung wie bei normtext/lawid-safe.ts).

/** Schlüssel-Aufbau der kantonalen Golden-Einträge: kanton/<KT>/<lawIdSafe>/<anker>. */
const SEGMENTE_KANTON = 4;

/**
 * Erlass-Präfix eines kantonalen Golden-Schlüssels — `kanton/<KT>/<lawIdSafe>`,
 * also genau die Granularität EINER Snapshot-Datei
 * (public/normtext/kanton/<KT>-<lawIdSafe>.json).
 *
 * Gibt `null` für alles, was kein kantonaler Artikel-Schlüssel ist (bund/*,
 * Fremdformat) — solche Schlüssel sind für einen Kantons-Teillauf nie ersetzbar.
 */
export function erlassPraefix(key: string): string | null {
  const teile = key.split('/');
  if (teile[0] !== 'kanton' || teile.length < SEGMENTE_KANTON) return null;
  return teile.slice(0, 3).join('/');
}

export interface GoldenKantonMerge {
  /** Der neue Golden-Bestand (unsortiert; der Aufrufer sortiert wie bisher). */
  gemischt: Record<string, string>;
  /** Erlass-Präfixe der Ziel-Kantone, deren Altbestand ersetzt wurde. */
  ersetzt: string[];
  /** Erlass-Präfixe der Ziel-Kantone OHNE frische Einträge — Altbestand bewahrt. */
  bewahrt: string[];
  /** Erlass-Präfixe der Ziel-Kantone ohne frische Einträge UND ohne Snapshot-Datei
   *  — aus dem Korpus zurückgezogen, darum korrekt fallengelassen. */
  verworfen: string[];
  /** Ziel-Kantone, die im Lauf KEINEN einzigen frischen Eintrag lieferten. */
  fehlgeschlageneKantone: string[];
}

/**
 * Mischt den bestehenden Golden-Index mit dem frischen Lauf-Index eines
 * Kantons-Teillaufs.
 *
 * @param bestand  committeter Golden-Index (golden/normtext-snapshot.json)
 * @param frisch   Lauf-Index: nur die in DIESEM Lauf erzeugten Snapshot-Knoten
 * @param kantone  Ziel-Kantone des Teillaufs (--kanton=…)
 * @param dateiExistiert Sonde auf den Projektionspfad (i.d.R. existsSync). Ohne
 *   Sonde bleibt jeder ausgefallene Erlass bewahrt — das bisherige Verhalten.
 */
export function mischeGoldenKanton(
  bestand: Record<string, string>,
  frisch: Record<string, string>,
  kantone: ReadonlySet<string>,
  dateiExistiert: (pfad: string) => boolean = () => true,
): GoldenKantonMerge {
  // §8 (kein stiller Datenverlust). Ersetzbarkeit wird je ERLASS bestimmt, nicht
  // je Kanton: verworfen wird nur der Altbestand jener Snapshot-Dateien, die
  // DIESER Lauf tatsächlich neu erzeugt hat.
  //
  // WARUM NICHT je Kanton (der Defekt, Commit 7a14fa06): ein Kanton wird über
  // MEHRERE Routen erschlossen — AR z. B. über LexWork UND die PDF-Route
  // (olexAt). `--discovery` fährt aber nur die LexWork-Phase
  // (normtext-snapshot.ts ~995-1001). Kantons-Granularität verwarf deshalb auch
  // die Golden-Schlüssel der PDF-Routen-Erlasse, obwohl deren Snapshot-Dateien
  // unangetastet auf der Platte blieben: 59 Schlüssel von
  // public/normtext/kanton/AR-1203.json verloren, Drift-Basis weg (§7 lit. d),
  // ohne dass ein Tor es sah (heute sieht es check:golden-normtext).
  //
  // WARUM AUS DEM LAUF-INDEX ABGELEITET und nicht aus den Flags: die Frage
  // «welche Routen liefen?» müsste bei jedem neuen Teillauf-Schalter erneut
  // richtig beantwortet werden. Der Lauf-Index sagt es selbst — er enthält genau
  // die neu erzeugten Knoten. Ein Erlass, der in diesem Lauf 0 Knoten lieferte
  // (nicht gefahren, Fetch-Fehler, Extraktion leer), behält seinen Altbestand.
  //
  // Die INNER-Erlass-Purge bleibt erhalten: bei einem ersetzten Erlass fallen
  // weggefallene Artikel-Schlüssel (Anker-Rename, Anhang-Reorg) weiterhin weg,
  // sonst verwaisen sie (check:golden-normtext (b)).
  const frischePraefixe = new Set<string>();
  for (const k of Object.keys(frisch)) {
    const p = erlassPraefix(k);
    if (p !== null) frischePraefixe.add(p);
  }
  const zielPraefixe = new Set<string>();
  for (const k of Object.keys(bestand)) {
    const p = erlassPraefix(k);
    if (p !== null && kantone.has(p.split('/')[1])) zielPraefixe.add(p);
  }

  // DIESELBE Datei-Sonde wie im Voll-Lauf (mischeGoldenVollLauf, s.u.), und aus
  // demselben Grund: «0 frische Knoten» hat zwei Ursachen, die nur das
  // Dateisystem trennt. Der Erlass ist AUSGEFALLEN (Snapshot-Datei liegt noch
  // da → Altbestand bewahren, §8) oder er wurde aus dem Korpus ZURÜCKGEZOGEN
  // (Datei fort → Golden-Knoten verwerfen, sonst verwaist der Index und die
  // zurückgezogene Identität lebt in der Drift-Basis weiter, §5).
  // Bis hierher kannte nur der Voll-Lauf diese Unterscheidung; ein Teillauf
  // konnte einen Erlass darum GAR NICHT zurücknehmen — genau die Lage beim
  // Rückzug der GL-Schreibweisen-Dublette (5.9.2026), die einen Voll-Lauf über
  // alle 25 Kantone erzwungen hätte, um EINEN Schlüssel loszuwerden.
  const zurueckgezogen = new Set<string>();
  for (const p of zielPraefixe) {
    if (frischePraefixe.has(p)) continue;
    const pfad = snapshotDateiPfad(p);
    // Unbekannte Präfix-Form: bewahren (nie stillschweigend löschen, §8).
    if (pfad !== null && !dateiExistiert(pfad)) zurueckgezogen.add(p);
  }

  const istErsetzbar = (key: string): boolean => {
    const p = erlassPraefix(key);
    if (p === null || !kantone.has(p.split('/')[1])) return false;
    return frischePraefixe.has(p) || zurueckgezogen.has(p);
  };

  const gemischt: Record<string, string> = {};
  for (const k of Object.keys(bestand)) if (!istErsetzbar(k)) gemischt[k] = bestand[k];
  for (const k of Object.keys(frisch)) gemischt[k] = frisch[k];

  const erfolgKantone = new Set(Object.keys(frisch).map((k) => k.split('/')[1]));

  return {
    gemischt,
    ersetzt: [...zielPraefixe].filter((p) => frischePraefixe.has(p)).sort(),
    bewahrt: [...zielPraefixe]
      .filter((p) => !frischePraefixe.has(p) && !zurueckgezogen.has(p))
      .sort(),
    verworfen: [...zurueckgezogen].sort(),
    fehlgeschlageneKantone: [...kantone].filter((k) => !erfolgKantone.has(k)).sort(),
  };
}

// ─── Voll-Lauf (npm run normtext ohne --nur=…) ───────────────────────────────
//
// WARUM ES DIESE ZWEITE FUNKTION BRAUCHT. mischeGoldenKanton oben sichert die
// TEILLÄUFE (--nur=kanton, --nur=zh). Der VOLL-Lauf schrieb den Index bis zum
// 13.8.2026 pauschal aus dem Lauf-Index (normtext-snapshot.ts, Zeilen
// 1525-1531) — ausgerechnet der Pfad, den die Fedlex-Frische-Automatik fährt
// (.github/workflows/fedlex-frische.yml, Schritt «Regenerierung»:
// `npm run normtext -- --datum=…`, ohne --nur=).
//
// DERSELBE SCHADEN, ZWEIMAL:
//   27.7.2026 (PR #383): 55'763 → 32'639 Einträge, −23'473 Kantons-Knoten.
//     Reaktion: das Tor check:golden-normtext wurde gebaut. Die Ursache blieb.
//   10.8.2026 (b84ee8302): 56'113 → 32'640, wieder −23'473. AR 6398 → 453,
//     BS 17688 → 160; 1116 Erlass-Präfixe ohne Drift-Basis, während ihre
//     Snapshot-Dateien unverändert auf der Platte lagen. Kein Golden-sha
//     änderte sich, kein Schlüssel kam hinzu — der Lauf hat nur gelöscht.
// Erkennen ohne Reparieren erzeugt genau diese Wiederholung (§17).
//
// MECHANISMUS. Fällt eine Quelle aus (LexWork-Token fehlt, PDF-Cache leer,
// Netzfehler), liefert die Route 0 Knoten. Die Snapshot-DATEI bleibt liegen —
// sie wird nur bei Erfolg überschrieben. Pauschales Schreiben löscht dann die
// Drift-Basis einer Datei, die es weiterhin gibt (§7 lit. d, §8).
//
// WARUM DIE DATEI-SONDE. «0 frische Knoten» hat zwei Ursachen, die man nur am
// Dateisystem unterscheiden kann: der Erlass ist AUSGEFALLEN (Datei da →
// bewahren) oder er wurde aus dem Korpus ENTFERNT (Datei fort → verwerfen, sonst
// verwaist der Index, check:golden-normtext (b) / §5 zweite Wahrheit).
// Injiziert statt importiert, damit die Regel ohne Dateisystem testbar bleibt
// (§2) — dieselbe Begründung wie beim seiteneffektfreien Modulschnitt oben.

/** Schlüssel-Aufbau der Bund-Einträge: bund/<KEY>/<eId>. */
const SEGMENTE_BUND = 3;

/**
 * Erlass-Präfix eines BELIEBIGEN Golden-Schlüssels — die Granularität genau
 * EINER Snapshot-Datei:
 *   `bund/<KEY>/<eId>`            → `bund/<KEY>`
 *   `kanton/<KT>/<lawIdSafe>/<a>` → `kanton/<KT>/<lawIdSafe>`
 *
 * `null` für alles andere (Fremdformat) — im Ist-Bestand gemessen 13.8.2026:
 * 25'404 bund (3 Segmente), 7236 kanton (4 Segmente), 0 Fremdformate.
 */
export function erlassPraefixVoll(key: string): string | null {
  const teile = key.split('/');
  if (teile[0] === 'kanton' && teile.length >= SEGMENTE_KANTON) return teile.slice(0, 3).join('/');
  if (teile[0] === 'bund' && teile.length >= SEGMENTE_BUND) return teile.slice(0, 2).join('/');
  return null;
}

/**
 * Projektionspfad der Snapshot-Datei eines Erlass-Präfixes. Umkehrung der
 * Dateinamens-Regel des Generators (`<KT>-<lawIdSafe>.json` bzw. `<KEY>.json`).
 */
export function snapshotDateiPfad(praefix: string): string | null {
  const teile = praefix.split('/');
  if (teile[0] === 'kanton' && teile.length === 3) {
    return `public/normtext/kanton/${teile[1]}-${teile[2]}.json`;
  }
  if (teile[0] === 'bund' && teile.length === 2) {
    return `public/normtext/bund/${teile[1]}.json`;
  }
  return null;
}

export interface GoldenVollLaufMerge {
  /** Der neue Golden-Bestand (unsortiert; der Aufrufer sortiert wie bisher). */
  gemischt: Record<string, string>;
  /** Präfixe ohne frische Knoten, deren Snapshot-Datei noch da ist — Altbestand bewahrt. */
  bewahrt: string[];
  /** Präfixe ohne frische Knoten UND ohne Snapshot-Datei — korrekt fallengelassen. */
  verworfen: string[];
  /** Präfixe, die dieser Lauf tatsächlich neu erzeugt hat. */
  ersetzt: string[];
}

/**
 * Mischt den bestehenden Golden-Index mit dem Lauf-Index eines VOLL-Laufs.
 *
 * Regel: ein Erlass-Präfix wird nur ersetzt, wenn dieser Lauf für ihn mindestens
 * einen Knoten erzeugt hat. Innerhalb eines ersetzten Erlasses bleibt die Purge
 * erhalten (weggefallene Anker verschwinden, sonst verwaisen sie).
 *
 * @param bestand        committeter Golden-Index (golden/normtext-snapshot.json)
 * @param frisch         Lauf-Index: nur die in DIESEM Lauf erzeugten Knoten
 * @param dateiExistiert Sonde auf den Projektionspfad (i.d.R. existsSync)
 */
export function mischeGoldenVollLauf(
  bestand: Record<string, string>,
  frisch: Record<string, string>,
  dateiExistiert: (pfad: string) => boolean,
): GoldenVollLaufMerge {
  const frischePraefixe = new Set<string>();
  for (const k of Object.keys(frisch)) {
    const p = erlassPraefixVoll(k);
    if (p !== null) frischePraefixe.add(p);
  }

  // Präfixe des Altbestands, die dieser Lauf NICHT geliefert hat.
  const ausgefallen = new Set<string>();
  for (const k of Object.keys(bestand)) {
    const p = erlassPraefixVoll(k);
    if (p !== null && !frischePraefixe.has(p)) ausgefallen.add(p);
  }

  // Datei-Sonde genau einmal je ausgefallenem Präfix (die gelieferten sind per
  // Definition da — sie wurden soeben geschrieben).
  const bewahrt: string[] = [];
  const verworfen: string[] = [];
  const bewahrtSet = new Set<string>();
  for (const p of [...ausgefallen].sort()) {
    const pfad = snapshotDateiPfad(p);
    // Unbekannte Präfix-Form: bewahren. Ein Schlüssel, dessen Datei wir nicht
    // benennen können, darf nicht stillschweigend gelöscht werden (§8) — das
    // Tor check:golden-normtext meldet ihn dann sichtbar als Waise.
    if (pfad === null || dateiExistiert(pfad)) {
      bewahrt.push(p);
      bewahrtSet.add(p);
    } else {
      verworfen.push(p);
    }
  }

  const gemischt: Record<string, string> = {};
  for (const k of Object.keys(bestand)) {
    const p = erlassPraefixVoll(k);
    // Fremdformat (p === null) hat kein Präfix und damit keinen Lauf-Bezug —
    // bewahren, statt es an einer Regel scheitern zu lassen, die es nicht kennt.
    if (p === null || bewahrtSet.has(p)) gemischt[k] = bestand[k];
  }
  for (const k of Object.keys(frisch)) gemischt[k] = frisch[k];

  return { gemischt, bewahrt, verworfen, ersetzt: [...frischePraefixe].sort() };
}
