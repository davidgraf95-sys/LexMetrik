// scripts/plan/selbstoptKern.ts — reine Rechenkerne der Selbstoptimierungs-Messreihe
// (Roadmap-Schritt `QS-SELBSTOPT`, Stufe 1 «erst messen»).
//
// WARUM EIGENE DATEI. Der Sammler (`selbstopt-erheben.ts`) ist unrein: er ruft
// git und gh, liest Dateien, schreibt JSON. Alles, was daran RECHNUNG ist —
// aggregieren, parsen, validieren —, steht hier und kennt weder `node:fs` noch
// `node:child_process`. Nur so ist es ohne Netz, ohne Repo-Zustand und ohne
// Wanduhr testbar (§2); und nur so kann `check:plan` die Schema-Prüfung
// mitbenutzen, ohne den Sammler samt seiner Prozess-Aufrufe zu importieren (§5:
// eine Definition des Schemas, nicht zwei).
//
// BEKANNTE GRENZEN DER MESSUNG (Gegenprüfung 7.8.2026 — hier notiert, weil eine
// Grenze, die nur der Autor kennt, keine dokumentierte Grenze ist):
//
//  * **Die Reihe ist maschinen-lückenhaft.** Das Ereignis-Log
//    (`.selbstopt-ereignisse.jsonl`) ist gitignoriert und je Maschine eigen, die
//    Zeitreihe wird committet. Erhebt Maschine A einen Snapshot, wandern DEREN
//    Tor-Läufe hinein; die zwischenzeitlichen Läufe auf Maschine B sind für
//    immer verloren, weil A das Watermark vorschiebt. `torRot` ist deshalb «was
//    diese Maschinen gesehen haben», nie «was gelaufen ist». Für ein
//    Verlaufs-Signal reicht das; für eine Absolutaussage über Tor-Läufe nicht.
//  * **Zeitstempel-Auflösung.** `check-parallel.ts` stempelt mit echten
//    Millisekunden (`toISOString()`), `gate.sh` ebenso (s. dort). Ein Stempel
//    ohne Millisekunden liesse Ereignisse derselben Sekunde unter das Watermark
//    fallen (`e.ts > seit`) — deshalb ist die Auflösung an beiden Schreibstellen
//    zugesichert und nicht dem Zufall der Plattform überlassen.
//
// WAS DIESE ZAHLEN SIND — UND WAS NICHT. Alle Grössen hier sind
// **Beobachtungsgrössen**. Keine davon ist ein Tor-Kriterium, und keine darf je
// eines werden (Fahrplan-Spec: «Rework-Heuristik … Beobachtungsgrösse, nie
// Tor-Kriterium»). Das einzige Tor in diesem Umfeld prüft die FORM der Zeitreihe
// (Schema, Chronologie, Generat-Marke) — nie ihre WERTE. Eine steigende
// Rework-Quote ist ein Anlass zum Hinschauen, nie ein Grund, einen Bau rot zu
// machen: sonst optimierte der Bau die Messung statt der Sache.

/** Ablageort der Zeitreihe (generierte §5-Projektion, nie handgepflegt). */
export const ZEITREIHE_DATEI = 'messwerte/selbstopt-zeitreihe.json';

/** Lokales Ereignis-Log der Tor-Läufe (gitignoriert, je Maschine eigen). */
export const EREIGNIS_DATEI = '.selbstopt-ereignisse.jsonl';

/**
 * Pflicht-Marke im Kopf der Zeitreihe. `check:plan` prüft sie WÖRTLICH: wer die
 * Datei von Hand anlegt oder editiert, trifft diesen Satz nicht zufällig — und
 * eine handgepflegte Messreihe wäre eine zweite Wahrheit über den Bau-Zustand
 * (§5), nicht eine Projektion.
 */
export const GENERIERT_MARKE =
  'scripts/plan/selbstopt-erheben.ts — nie von Hand editieren';

/**
 * Schema-Version. Wird die Struktur je unverträglich geändert, zählt sie hoch.
 *
 * **2** seit 7.8.2026: neues Pflichtfeld `tokens` (Token-/Kostenmessung). Ältere
 * Snapshots bekommen es beim nächsten Sammler-Lauf verlustfrei als `null`
 * nachgetragen — s. `migriere()` in `selbstopt-erheben.ts`. Das ist kein
 * Umschreiben von Messwerten: nachgetragen wird ausschliesslich die Aussage
 * «nicht gemessen», und die ist für jene Snapshots wahr.
 *
 * **3** seit 4.9.2026 (QS-FREMDAGENTEN, Spec «Fremdagenten in den
 * Selbstoptimierungs-Kreislauf»): neues Pflichtfeld `fremdagenten` (Jules-
 * und Gemini-Kennzahlen, s. `FremdagentenBlock`). Dieselbe Migrationslinie
 * wie bei `tokens`: ältere Snapshots bekommen `{ jules: null, gemini: null,
 * claude_token_pro_schritt: null }` nachgetragen — «nicht gemessen» trifft
 * für sie zu, kein gemessener Wert wird angefasst.
 *
 * **4** seit 4.9.2026 (Nachbesserung QS-FREMDAGENTEN): `JulesMessung` bekommt
 * `proben_7d` (PRs mit Label `probe`, aus der Landungsquote ausgeschlossen)
 * und `prs_geschlossen_nummern` (Entdopplung der Lehre-Regel). Für ältere
 * Jules-Messungen trägt `migriere()` beide als **`null`** nach — nicht als 0
 * bzw. `[]`: jene Messung hat Proben schlicht nicht unterschieden, und «nicht
 * unterschieden» ist etwas anderes als «keine gefunden» (dieselbe Linie wie
 * bei `tokens`).
 *
 * **5** seit 5.9.2026 (QS-EFFIZIENZ, Befund `fahrplaene/FAHRPLAN-FREMDAGENTEN.md`
 * §5, PR #707): `JulesMessung` bekommt `entwurf_antworten_7d` (PRs mit Label
 * `entwurf-antwort` — gültige Entwurf-Antwort auf Feldabweichung, weder Bau
 * noch Ablehnung, s. `klassierePrs`). Ältere Jules-Messungen bekommen das
 * Feld von `migriere()` als **`null`** nachgetragen — dieselbe Linie wie bei
 * `proben_7d` in Schema 4: «nicht unterschieden», nicht «keine gefunden».
 */
export const SCHEMA_VERSION = 5;

// ───────────────────────────── Tor-Ereignisse ─────────────────────────────

/** Eine Zeile des JSONL-Logs: ein gelaufenes Tor mit seinem Verdikt. */
export interface Ereignis {
  /** ISO-Zeitpunkt des Laufs. */
  ts: string;
  /** Tor-Name — `check:*` beim Sub-Check, sonst der Gate-Schritt («vitest» …). */
  tor: string;
  /** `true` = grün (Exit 0), `false` = rot. */
  ok: boolean;
}

export interface TorZaehler {
  gesamt: number;
  rot: number;
}

export interface TorAggregat {
  gesamt: number;
  rot: number;
  /** Je Tor-Name ein Zählerpaar, nach Namen sortiert (stabile Ausgabe). */
  je: Record<string, TorZaehler>;
}

export const LEERES_AGGREGAT: TorAggregat = { gesamt: 0, rot: 0, je: {} };

/**
 * JSONL → Ereignisse. **Tolerant nach unten, nie werfend:** eine abgeschnittene
 * letzte Zeile (der Schreiber wurde mitten im Lauf abgebrochen) oder eine Zeile
 * fremden Formats wird ÜBERSPRUNGEN, nicht zum Absturz gemacht. Das Log ist ein
 * Nebenprodukt der Tore; ein defektes Nebenprodukt darf die Erhebung nicht
 * kosten. Wie viele Zeilen verworfen wurden, meldet `parseEreignisseMitRest`.
 */
export function parseEreignisse(jsonl: string): Ereignis[] {
  return parseEreignisseMitRest(jsonl).ereignisse;
}

export function parseEreignisseMitRest(jsonl: string): { ereignisse: Ereignis[]; verworfen: number } {
  const ereignisse: Ereignis[] = [];
  let verworfen = 0;
  for (const zeile of jsonl.split('\n')) {
    const s = zeile.trim();
    if (!s) continue;
    let roh: unknown;
    try {
      roh = JSON.parse(s);
    } catch {
      verworfen++;
      continue;
    }
    const o = roh as Partial<Ereignis>;
    if (typeof o?.ts !== 'string' || typeof o?.tor !== 'string' || typeof o?.ok !== 'boolean') {
      verworfen++;
      continue;
    }
    ereignisse.push({ ts: o.ts, tor: o.tor, ok: o.ok });
  }
  return { ereignisse, verworfen };
}

/**
 * Zählt Läufe und Rot-Läufe je Tor über die Ereignisse NACH `seit`.
 *
 * `seit === null` heisst «alles» (erster Snapshot). Der Schnitt ist bewusst
 * **echt grösser** als der Zeitstempel des letzten Snapshots: ein Ereignis, das
 * exakt in derselben Millisekunde liegt, wurde von jenem Snapshot bereits
 * gezählt und darf nicht doppelt zählen.
 */
export function aggregiereTore(ereignisse: Ereignis[], seit: string | null): TorAggregat {
  const je: Record<string, TorZaehler> = {};
  let gesamt = 0;
  let rot = 0;
  for (const e of ereignisse) {
    if (seit !== null && !(e.ts > seit)) continue;
    const z = (je[e.tor] ??= { gesamt: 0, rot: 0 });
    z.gesamt++;
    gesamt++;
    if (!e.ok) {
      z.rot++;
      rot++;
    }
  }
  return { gesamt, rot, je: sortiereSchluessel(je) };
}

/** Summiert zwei Aggregate (kumulierter Stand = voriger + neuer Abschnitt). */
export function addiereAggregat(a: TorAggregat, b: TorAggregat): TorAggregat {
  const je: Record<string, TorZaehler> = {};
  for (const q of [a.je, b.je]) {
    for (const [tor, z] of Object.entries(q)) {
      const ziel = (je[tor] ??= { gesamt: 0, rot: 0 });
      ziel.gesamt += z.gesamt;
      ziel.rot += z.rot;
    }
  }
  return { gesamt: a.gesamt + b.gesamt, rot: a.rot + b.rot, je: sortiereSchluessel(je) };
}

/** Objekt-Schlüssel alphabetisch — sonst hinge die JSON-Reihenfolge an der
 *  Ankunftsreihenfolge der Ereignisse, und zwei gleichwertige Läufe erzeugten
 *  verschiedene Dateien (§2, Diff-Rauschen). `sort()` ohne Locale. */
function sortiereSchluessel(je: Record<string, TorZaehler>): Record<string, TorZaehler> {
  const out: Record<string, TorZaehler> = {};
  for (const k of Object.keys(je).sort()) out[k] = je[k];
  return out;
}

// ─────────────────────────── Fehlerklassen F1–F6 ───────────────────────────

/**
 * Zählt je Fehlerklasse die datierten **Ereignisse** — nur aus der Spalte
 * «Was passierte», nie aus der Gegenmittel-Spalte.
 *
 * Quelle (§5) bleibt die Markdown-Tabelle «Register der belegten Fehlerklassen»
 * in `.claude/skills/lehren/SKILL.md`; dieser Parser ist ihre Projektion und
 * pflegt nichts nach.
 *
 * WARUM SPALTENGENAU — Befund der Gegenprüfung 7.8.2026, nachgemessen. Die
 * erste Fassung zählte alle Datumsangaben der GANZEN Registerzeile. Damit
 * zählte sie **Reparaturdaten als Vorfälle**:
 *
 *   * F2e: «Anlage 20.7.2026» (Ereignis) + «Fix 3.8.2026, PR #419» (Gegenmittel)
 *     ⇒ gemeldet als 2, tatsächlich 1 Ereignis und 0 Rückfälle.
 *   * F3: gar kein Ereignis-Datum, nur «3.8.2026» im Gegenmittel ⇒ gemeldet
 *     als 1, tatsächlich 0.
 *
 * Die Wirkung war nicht bloss kosmetisch: `retro:17` schlägt bei steigendem
 * Zähler «Gegenmittel greift nicht» vor. Ein künftiger Eintrag «Fix 9.9.2026»
 * hätte damit einen Rückfall erfunden — und der Bau hätte auf eine Reparatur
 * mit einer Eskalation geantwortet. Genau falsch herum.
 *
 * BEKANNTE GRENZE, bewusst in Kauf genommen: Ein Rückfall, der ausnahmsweise
 * NUR in der Gegenmittel-Spalte erzählt wird (heute: die «Eskalation 5.8.2026»
 * bei F6), wird nicht gezählt. Untererfassung ist hier das kleinere Übel —
 * ein zu niedriger Zähler unterlässt einen Vorschlag, ein zu hoher erzeugt
 * einen falschen. Die Register-Konvention sieht Vorfälle ohnehin in «Was
 * passierte» vor.
 *
 * Ein Datumsbereich wie «18.–20.7.2026» zählt als die ausgeschriebenen Daten
 * (hier eines), nicht als Spanne. Bewusst NICHT gezählt wird die Schwere; das
 * Register führt sie nicht mit, und eine geschätzte Gewichtung wäre keine
 * Messung mehr (§2).
 */
export function parseFKlassen(md: string): Record<string, number> {
  const out: Record<string, number> = {};
  // Nur der Registerabschnitt, nicht das ganze Dokument: sonst zählten
  // Erwähnungen aus der Prosa darunter mit.
  const start = md.indexOf('## Register der belegten Fehlerklassen');
  if (start < 0) return out;
  const rest = md.slice(start);
  const ende = rest.indexOf('\n## ', 1);
  const abschnitt = ende < 0 ? rest : rest.slice(0, ende);

  for (const zeile of abschnitt.split('\n')) {
    const getrimmt = zeile.trim();
    if (!/^\|\s*\*\*(F\d[a-z]?)\*\*\s*\|/.test(getrimmt)) continue;
    // Spalten der Registertabelle: | # | Klasse | Was passierte | Gegenmittel |
    // Der führende Pipe erzeugt eine leere Zelle 0, die Klasse steht in 1,
    // das EREIGNIS in 3. Fehlt die Spalte (umgebaute Tabelle), wird die Klasse
    // übersprungen statt geraten — ein stiller Fehlwert wäre schlimmer als eine
    // fehlende Klasse, und der Bindungs-Test schlägt dann an.
    const zellen = getrimmt.split('|');
    if (zellen.length < 5) continue;
    const klasse = /\*\*(F\d[a-z]?)\*\*/.exec(zellen[1])?.[1];
    if (!klasse) continue;
    const daten = new Set<string>();
    for (const d of zellen[3].matchAll(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g)) {
      daten.add(`${d[3]}-${d[2].padStart(2, '0')}-${d[1].padStart(2, '0')}`);
    }
    out[klasse] = daten.size;
  }
  const sortiert: Record<string, number> = {};
  for (const k of Object.keys(out).sort()) sortiert[k] = out[k];
  return sortiert;
}

// ───────────────────────── Fremdagenten (QS-FREMDAGENTEN) ─────────────────────────

/**
 * Jules-Kennzahlen eines Snapshots. Erhoben von `erhebeJules()` in
 * `scripts/analyse/fremdagenten-messung.ts` (§5: eine Definition der
 * Jules-Branch-/Dauer-Logik, nicht zwei) über die letzten 7 Tage.
 */
export interface JulesMessung {
  /** Jules-PRs, in den letzten 7 Tagen GEMERGED. */
  prs_gemerged_7d: number;
  /**
   * Jules-PRs, in den letzten 7 Tagen GESCHLOSSEN ohne Merge — **ohne Proben**
   * (s. `proben_7d`). Das ist der Nenner-Anteil der Landungsquote und misst
   * Ablehnung, NICHT Nacharbeit: ein PR kann gemergt werden und trotzdem
   * Nacharbeit gekostet haben. Die handgeführte Nacharbeits-Quote steht in
   * `fahrplaene/FAHRPLAN-FREMDAGENTEN.md` §5.
   */
  prs_geschlossen_7d: number;
  /**
   * Jules-PRs im selben Fenster mit Label `probe` — Werkzeug-Proben (etwa der
   * Erstfilter-Test PR #642), die weder Bau noch Ablehnung sind und darum aus
   * Zähler UND Nenner der Landungsquote fallen. Sie bleiben sichtbar, statt
   * zu verschwinden: eine Quote, die still Fälle weglässt, ist nicht prüfbar.
   *
   * `null` = diese Messung unterschied noch keine Proben (Schema < 4), nicht
   * «keine Proben gefunden».
   */
  proben_7d: number | null;
  /**
   * Jules-PRs im selben Fenster mit Label `entwurf-antwort` (ANLASS 5.9.2026,
   * PR #707: gültige Entwurf-Antwort auf Feldabweichung) — weder Bau noch
   * Ablehnung, darum wie `proben_7d` aus Zähler UND Nenner der Landungsquote
   * ausgeschlossen und getrennt ausgewiesen statt zu verschwinden.
   *
   * `null` = diese Messung unterschied noch keine Entwurf-Antworten
   * (Schema < 5), nicht «keine gefunden».
   */
  entwurf_antworten_7d: number | null;
  /**
   * Nummern der geschlossenen (nicht-Proben-)PRs. Trägt die Entdopplung der
   * Retro-Regel «Lehre verankern»: derselbe abgelehnte PR steht sieben Tage
   * lang in jedem Snapshot, die Lehre ist aber einmal zu ziehen.
   *
   * `null` = Nummern nicht mitgeführt (Schema < 4) — dann kann Stufe 2 nicht
   * entdoppeln und sagt das im Befund.
   */
  prs_geschlossen_nummern: number[] | null;
  /** Median Ticket→PR-Dauer der gemergten PRs, `null` ohne auflösbare Issue-Referenz. */
  median_dauer_min: number | null;
  /** Jules-Issues (Label `jules`), angelegt in den letzten 24 h. */
  tickets_24h: number;
  /** Mindestens ein Issue der letzten 24 h seit > 10 min ohne «Jules is on it» (Fahrplan §4 «Limite erkennen»). */
  alarm: boolean;
}

/**
 * Gemini-Kennzahlen eines Snapshots — Zeilen der drei §5-Register-Tabellen in
 * `fahrplaene/FAHRPLAN-FREMDAGENTEN.md`, gezählt/summiert von
 * `parseFremdagentenRegister`.
 *
 * `diskrepanz_echt`/`diskrepanz_schein` stehen NICHT wörtlich in der Spec
 * (dort nur `diskrepanz_laeufe`) — ABWEICHUNG, offengelegt (§7): Retro-Regel
 * (d) («Gemini Schein > echt ⇒ Rückbau Diskrepanz-Finder prüfen») kann sie
 * ohne diese Summen nicht bilden, und `retro17Kern.ts` liest laut eigenem
 * Vertrag ausschliesslich Zeitreihe + Chronik — ein Zusatz-Lesen der
 * Fahrplan-Datei dort wäre der grössere Bruch.
 */
export interface GeminiMessung {
  /** Zeilen im Diskrepanz-Finder-Register (Phase 2). */
  diskrepanz_laeufe: number;
  /** Summe der Spalte «echt» über dasselbe Register. */
  diskrepanz_echt: number;
  /** Summe der Spalte «Schein» über dasselbe Register. */
  diskrepanz_schein: number;
  /** Zeilen im Zweitblick-Register (Phase 3). */
  zweitblick_durchgaenge: number;
  /** Zeilen im Kontingent-Ereignisse-Register (Fahrplan §4). */
  kontingent_ereignisse: number;
}

export interface FremdagentenBlock {
  jules: JulesMessung | null;
  gemini: GeminiMessung | null;
  /**
   * Claude-Token pro gelandetem Schritt (Fahrplan §3, Zeile «Gesamt»). Noch
   * keine automatische Quelle — bleibt bewusst als Platzhalter `null`
   * geschrieben, bis eine Messung dafür existiert (nicht dieselbe Semantik
   * wie ein Ausfall: es ist keine Quelle, die je erhoben würde und scheitern
   * könnte, sondern eine, die noch gar nicht gebaut ist).
   */
  claude_token_pro_schritt: null;
}

/**
 * Die drei §5-Register: Überschrift WÖRTLICH aus dem Fahrplan (Auftragsvorgabe)
 * und die erwartete Kopfzeile.
 *
 * WARUM DIE KOPFZEILE MITGEFÜHRT WIRD (Nachbesserung 4.9.2026). Der Parser
 * liest Spalten nach POSITION (`echt` = Index 4, `Schein` = Index 5). Wer im
 * Fahrplan zwei Spalten vertauscht oder eine einfügt, bekäme ohne diese Prüfung
 * still vertauschte Summen — und die Retro-Regel «Schein > echt ⇒ Rückbau»
 * entschiede auf eine Zahl, die das Gegenteil dessen misst, was ihr Name sagt.
 * Stimmt die Kopfzeile nicht, wird darum NICHT gezählt, sondern ausgefallen.
 */
const REGISTER = {
  diskrepanz: {
    marke: '**Diskrepanz-Finder-Läufe (Phase 2)**',
    kopf: ['Datum', 'Erlass', 'Artikel mit Diff', 'an Gemini', 'echt', 'Schein', 'Tokens'],
  },
  zweitblick: {
    marke: '**Phase 3 — Zweitblick-Durchgänge**',
    kopf: ['Datum', 'Erlass/Norm', 'Prüfer', 'echt', 'Schein', 'verpasst', 'Tokens'],
  },
  kontingent: {
    marke: '**Kontingent-Ereignisse**',
    kopf: ['Datum', 'Dienst', 'Signal', 'Dauer', 'Folge'],
  },
} as const;

type RegisterDef = { marke: string; kopf: readonly string[] };

/** Ist die Zeile eine Markdown-Trennzeile (`|---|:--:|`)? */
function istTrennzeile(zeile: string): boolean {
  const t = zeile.trim();
  return t.startsWith('|') && /^[|\s:-]+$/.test(t) && t.includes('-');
}

/**
 * Zählt die Datenzeilen der Markdown-Tabelle, die auf `reg.marke` folgt.
 *
 * `null` — und damit ein benannter Ausfall beim Aufrufer — in DREI Fällen:
 * Marke nicht gefunden, keine Tabelle im Abschnitt der Marke, oder eine
 * Kopfzeile, die nicht Zelle für Zelle `reg.kopf` entspricht. Vorher lieferte
 * jeder dieser Fälle still `0`; eine 0 behauptet aber «gemessen und nichts
 * gefunden», und genau diese Verwechslung soll die Messreihe nie machen (§8).
 *
 * ABSCHNITTSGRENZE. Gelesen wird nur bis zur nächsten Registermarke (`**…`)
 * oder Überschrift (`## `). Ohne diese Grenze fände ein Register ohne eigene
 * Tabelle die Tabelle des NÄCHSTEN Registers und zählte fremde Zeilen.
 *
 * LEERZEILEN. Innerhalb der Tabelle werden sie übersprungen: im Markdown ist
 * eine eingestreute Leerzeile ein Formatierungsversehen, kein Tabellenende —
 * vorher fiel alles danach unter den Tisch. Beendet wird die Tabelle erst von
 * einer echten Nicht-Tabellenzeile (oder der Abschnittsgrenze).
 */
function zaehleRegisterZeilen(md: string, reg: RegisterDef): { zeilen: number; roh: string[] } | null {
  const start = md.indexOf(reg.marke);
  if (start < 0) return null;
  const alle = md.slice(start).split('\n');

  let ende = alle.length;
  for (let j = 1; j < alle.length; j++) {
    const t = alle[j].trim();
    if (t.startsWith('## ') || t.startsWith('**')) {
      ende = j;
      break;
    }
  }

  let i = 1;
  while (i < ende && !alle[i].trim().startsWith('|')) i++;
  if (i >= ende) return null; // Marke da, aber keine Tabelle
  if (zellen(alle[i]).join('|') !== reg.kopf.join('|')) return null; // Kopfzeile weicht ab
  i++;
  if (i >= ende || !istTrennzeile(alle[i])) return null; // Kopf ohne Trennzeile
  i++;

  const roh: string[] = [];
  while (i < ende) {
    const t = alle[i].trim();
    if (t === '') {
      i++;
      continue;
    }
    if (!t.startsWith('|')) break;
    roh.push(alle[i]);
    i++;
  }
  return { zeilen: roh.length, roh };
}

/** Eine Tabellenzeile → Zellinhalte (ohne führende/schliessende Leerzelle). */
function zellen(zeile: string): string[] {
  const t = zeile.trim();
  const ohneRand = t.replace(/^\|/, '').replace(/\|$/, '');
  return ohneRand.split('|').map((z) => z.trim());
}

/** Erste Zahl in einer Zelle, oder 0 (leere/Platzhalter-Zellen wie «—»). */
function zellZahl(zelle: string | undefined): number {
  const m = /-?\d+/.exec(zelle ?? '');
  return m ? Number(m[0]) : 0;
}

/**
 * Ergebnis von `parseFremdagentenRegister`: die Messung ODER `null` plus die
 * Namen der ausgefallenen Register. Alles-oder-nichts wie bei der
 * Jules-Messung — eine Hälfte des Schemas mit erfundenen 0 zu füllen wäre
 * schlimmer als ein ehrliches `null`, weil Stufe 2 die 0 deutet.
 */
export interface RegisterErgebnis {
  mess: GeminiMessung | null;
  ausfaelle: string[];
}

/**
 * Parst die drei §5-Register aus `fahrplaene/FAHRPLAN-FREMDAGENTEN.md`
 * deterministisch (Zeilen zählen, `echt`/`Schein` summieren). Kein Netz, kein
 * `gh` — reiner Text-Parser wie `parseFKlassen`.
 *
 * Spaltenreihenfolge des Diskrepanz-Registers (§5): Datum | Erlass | Artikel
 * mit Diff | an Gemini | echt | Schein | Tokens — Spalten 5 und 6 (nullbasiert
 * nach dem Split ohne Randzellen: Index 4 und 5); genau diese Reihenfolge
 * prüft `zaehleRegisterZeilen` an der Kopfzeile nach.
 */
export function parseFremdagentenRegister(md: string): RegisterErgebnis {
  const ausfaelle: string[] = [];
  const hole = (reg: RegisterDef) => {
    const out = zaehleRegisterZeilen(md, reg);
    if (out === null) {
      ausfaelle.push(`§5-Register «${reg.marke}»: Marke, Tabelle oder Kopfzeile fehlt/weicht ab (erwartet: ${reg.kopf.join(' | ')})`);
    }
    return out;
  };

  const diskrepanz = hole(REGISTER.diskrepanz);
  const zweitblick = hole(REGISTER.zweitblick);
  const kontingent = hole(REGISTER.kontingent);
  if (diskrepanz === null || zweitblick === null || kontingent === null) {
    return { mess: null, ausfaelle };
  }

  let echt = 0;
  let schein = 0;
  for (const roh of diskrepanz.roh) {
    const z = zellen(roh);
    echt += zellZahl(z[4]);
    schein += zellZahl(z[5]);
  }
  return {
    mess: {
      diskrepanz_laeufe: diskrepanz.zeilen,
      diskrepanz_echt: echt,
      diskrepanz_schein: schein,
      zweitblick_durchgaenge: zweitblick.zeilen,
      kontingent_ereignisse: kontingent.zeilen,
    },
    ausfaelle,
  };
}

// ────────────────────────────── Rework-Heuristik ──────────────────────────────

/**
 * Fenster der Rework-Beobachtung: welcher Zeitraum beurteilt wird (14 Tage) und
 * wie schnell ein erneutes Anfassen als «Nacharbeit» gilt (48 h). Beide Werte
 * sind gesetzt, nicht hergeleitet — sie stammen aus der Fahrplan-Spec
 * («Folge-Commits kurzer Frist auf denselben Dateien») und sind darum hier als
 * benannte Konstanten sichtbar, statt als Zahl im Code zu verschwinden.
 */
export const REWORK_FENSTER_TAGE = 14;
export const REWORK_NACHFASS_STUNDEN = 48;

/** Ein Commit, so weit die Rework-Frage ihn braucht. */
export interface RwCommit {
  sha: string;
  /** Autor-Zeit, ISO. */
  ts: string;
  /** Autor-Kennung (E-Mail) — «eigener Vorgänger» heisst: derselbe Autor. */
  autor: string;
  dateien: string[];
}

export interface ReworkKennzahl {
  fensterTage: number;
  nachfassStunden: number;
  /** Beurteilte Commits (im Fenster). */
  commits: number;
  /** Davon solche mit einem eigenen Vorgänger auf derselben Datei binnen Frist. */
  reworkCommits: number;
  /** `reworkCommits / commits`, 0 bei leerem Fenster. */
  anteil: number;
}

/**
 * **Handgeschriebener Quelltext** — Dateipfade, die als Rework-Signal taugen.
 *
 * ANLASS, EMPIRISCH (7.8.2026, erster Trockenlauf des Sammlers): Die Quote über
 * ALLE Dateien lag bei 90 % von 246 Commits. Nachgemessen war das kein Befund,
 * sondern ein Artefakt: die Commits des Fensters fassen zu Tausenden
 * regenerierte Korpus-Projektionen an (`public/normtext/**`,
 * `public/rechtsprechung/**` — 1932 bzw. mehrere hundert Treffer je Muster).
 * Ein Korpus-Build berührt dieselben Dateien zwangsläufig mehrfach binnen 48 h;
 * die Quote misst dann die Regenerierung, nicht die Nacharbeit, und stünde
 * dauerhaft bei ~90 % ohne je etwas anzuzeigen. Genau die Fehlerklasse F2a in
 * Messform: eine Grösse, die sich an sich selbst bestätigt.
 *
 * Beide Zahlen werden deshalb erhoben und BEIDE gespeichert (`alle` und
 * `handschrift`) — die rohe bleibt unangetastet nachvollziehbar, die gefilterte
 * ist die interpretierbare. Kein kuratierter Datei-Ausschluss, nur eine
 * Pfad-/Endungs-Regel: sonst driftete eine Liste still.
 */
export function istHandschrift(pfad: string): boolean {
  if (/\.generated\./.test(pfad)) return false;
  if (!/^(?:src|scripts|e2e|api)\//.test(pfad)) return false;
  return /\.(?:ts|tsx|js|jsx|mjs|cjs|css|sh|py)$/.test(pfad);
}

/**
 * Anteil der Commits im Fenster, die eine Datei erneut anfassen, die derselbe
 * Autor binnen `nachfassStunden` zuvor schon angefasst hat.
 *
 * **Deterministisch gegeben Historie und Bezugszeitpunkt.** Der Bezugszeitpunkt
 * (`jetztMs`) wird HEREINGEGEBEN, nicht hier gelesen — sonst wäre die Funktion
 * nicht prüfbar (§2). Vorgänger dürfen ÄLTER als das Fenster sein: `commits`
 * enthält deshalb absichtlich einen Vorlauf (der Sammler holt Fenster + Frist),
 * beurteilt wird aber nur, was im Fenster liegt. Ohne diesen Vorlauf zählte ein
 * Commit am Fensterrand seinen Vorgänger nicht mit und die Quote wäre am ersten
 * Tag jedes Fensters systematisch zu tief.
 *
 * **Was das NICHT misst:** ob die Nacharbeit nötig war. Ein Commit, der einen
 * Test nachreicht, sieht hier aus wie einer, der einen Fehler repariert. Die
 * Zahl ist ein Verlaufs-Signal über viele Läufe, kein Urteil über einen Commit —
 * darum steht sie in einer Zeitreihe und nicht in einem Tor.
 */
export function reworkKennzahl(
  commits: RwCommit[],
  jetztMs: number,
  fensterTage: number = REWORK_FENSTER_TAGE,
  nachfassStunden: number = REWORK_NACHFASS_STUNDEN,
  /** Optionaler Datei-Filter (s. `istHandschrift`); ohne ihn zählt jede Datei. */
  nimmDatei: (pfad: string) => boolean = () => true,
): ReworkKennzahl {
  const fensterMs = fensterTage * 24 * 3_600_000;
  const fristMs = nachfassStunden * 3_600_000;
  const grenze = jetztMs - fensterMs;

  // Aufsteigend nach Zeit: «Vorgänger» heisst früher, und bei gleichem
  // Zeitstempel entscheidet der SHA, damit die Reihenfolge stabil ist (§2).
  const sortiert = [...commits].sort(
    (a, b) => Date.parse(a.ts) - Date.parse(b.ts) || (a.sha < b.sha ? -1 : a.sha > b.sha ? 1 : 0),
  );

  /** Letzte Berührung je (Autor, Datei) — nur die jüngste zählt für die Frist. */
  const zuletzt = new Map<string, number>();
  let imFenster = 0;
  let rework = 0;

  for (const c of sortiert) {
    const t = Date.parse(c.ts);
    if (Number.isNaN(t)) continue;
    const dateien = c.dateien.filter(nimmDatei);
    // Ein Commit ohne eine einzige gemessene Datei gehört nicht in den Nenner:
    // sonst drückte ein reiner Korpus-Commit die Handschrift-Quote, ohne über
    // Handschrift irgendetwas auszusagen.
    if (dateien.length === 0) continue;
    // Das Fenster hat ZWEI Ränder. Die Obergrenze fehlte zunächst und fiel erst
    // im Test auf: ein Commit mit Zeitstempel in der Zukunft (Uhr-Versatz, ein
    // importierter Fremd-Commit) läge in JEDEM künftigen Fenster und zählte
    // dauerhaft mit. Ein Fenster «letzte 14 Tage», das die Zukunft einschliesst,
    // ist keines.
    const beurteilt = t >= grenze && t <= jetztMs;
    let istRework = false;
    for (const datei of dateien) {
      const schluessel = `${c.autor} ${datei}`;
      const vorher = zuletzt.get(schluessel);
      if (vorher !== undefined && t - vorher > 0 && t - vorher <= fristMs) istRework = true;
      zuletzt.set(schluessel, t);
    }
    if (beurteilt) {
      imFenster++;
      if (istRework) rework++;
    }
  }

  return {
    fensterTage,
    nachfassStunden,
    commits: imFenster,
    reworkCommits: rework,
    anteil: imFenster === 0 ? 0 : runde(rework / imFenster),
  };
}

/** Vier Nachkommastellen — genug Auflösung, kein Gleitkomma-Rauschen im Diff. */
export function runde(x: number): number {
  return Math.round(x * 10_000) / 10_000;
}

// ───────────────────────────────── CI-Läufe ─────────────────────────────────

export interface CiLauf {
  attempt: number;
  conclusion: string | null;
  status: string;
}

/**
 * Abschlüsse, die KEIN Urteil über den Bau-Stand sind: der Lauf wurde beendet,
 * bevor er etwas prüfen konnte. Sie gehören darum weder in den Zähler noch in
 * den Nenner der Ausfallquote.
 */
const OHNE_VERDIKT = new Set(['cancelled', 'skipped']);

export interface CiKennzahl {
  /** Abgeschlossene Läufe insgesamt (inkl. abgebrochener). */
  laeufe: number;
  /** Davon solche mit echtem Verdikt (weder `cancelled` noch `skipped`). */
  verdikte: number;
  /** Anteil NICHT-`success` **unter den Verdikten** — die eigentliche Ausfallquote. */
  failureRate: number;
  /** Anteil abgebrochener/übersprungener Läufe an allen abgeschlossenen. */
  cancelledRate: number;
  /** Anteil Läufe mit `run_attempt > 1` (also Wiederholungen). */
  rerunRate: number;
  /** Roh-Aufschlüsselung je `conclusion` — damit nichts hinter einer Quote verschwindet. */
  je: Record<string, number>;
}

/**
 * CI-Kennzahlen über die abgeschlossenen Läufe eines Workflows.
 *
 * **`cancelled` ist kein Ausfall** — Korrektur nach der Gegenprüfung vom
 * 7.8.2026. Die erste Fassung zählte jedes Nicht-`success` als Ausfall und
 * berief sich dafür auf Fehlerklasse F2c. Die Berufung war falsch, und der
 * Unterschied ist gross: nachgemessen an den letzten 50 CI-Läufen lagen **11
 * der 15 abgebrochenen Läufe auf `main`** — Verdrängung wartender Läufe durch
 * die Concurrency-Gruppe, also gewolltes Verhalten. Die übrigen 4 sind
 * designtes cancel-in-progress auf PRs. Als «Ausfall» gerechnet ergab das eine
 * Quote von 46 %, wo die echte bei 23 % liegt (8 Ausfälle auf 35 Verdikte).
 *
 * **Was F2c wirklich sagt:** «`cancelled` zählt als ROT» gilt dort für einen
 * GEPLANTEN Wächter-Lauf — wenn `turso-sync.yml` in den Timeout läuft, ist der
 * Suchindex nicht synchronisiert, und der graue Lauf verdeckt genau das. Bei
 * einem verdrängten `main`-Lauf ist nichts unterblieben: der verdrängende Lauf
 * prüft denselben oder einen neueren Stand. Dieselbe Farbe, zwei Sachverhalte —
 * die Lehre auf beide anzuwenden hiesse, sie zu verwechseln.
 *
 * Verschwiegen wird deshalb nichts: `cancelledRate` steht als eigenes Feld
 * daneben, und `je` trägt weiterhin die rohe Aufschlüsselung.
 *
 * `timed_out`, `action_required` und Konsorten zählen unverändert als Ausfall —
 * sie hatten ihre Gelegenheit zu prüfen und haben sie nicht bestanden.
 */
export function ciKennzahl(laeufe: CiLauf[]): CiKennzahl {
  const fertig = laeufe.filter((l) => l.status === 'completed');
  const je: Record<string, number> = {};
  let verdikte = 0;
  let ausfaelle = 0;
  let abgebrochen = 0;
  let reruns = 0;
  for (const l of fertig) {
    const k = l.conclusion ?? 'unbekannt';
    je[k] = (je[k] ?? 0) + 1;
    if (OHNE_VERDIKT.has(k)) {
      abgebrochen++;
    } else {
      verdikte++;
      if (k !== 'success') ausfaelle++;
    }
    if ((l.attempt ?? 1) > 1) reruns++;
  }
  const n = fertig.length;
  const sortiert: Record<string, number> = {};
  for (const k of Object.keys(je).sort()) sortiert[k] = je[k];
  return {
    laeufe: n,
    verdikte,
    failureRate: verdikte === 0 ? 0 : runde(ausfaelle / verdikte),
    cancelledRate: n === 0 ? 0 : runde(abgebrochen / n),
    rerunRate: n === 0 ? 0 : runde(reruns / n),
    je: sortiert,
  };
}

// ─────────────────────────── Token-/Kosten-Messung ───────────────────────────

/**
 * Endpunkt des LOKALEN Prometheus-Exports von Claude Code
 * (`OTEL_METRICS_EXPORTER=prometheus`). Kein Fremddienst und keine Telemetrie
 * nach aussen: der Prozess exportiert auf einen Port DIESER Maschine, und der
 * Sammler liest ihn. Ist die Umgebungsvariable nicht gesetzt, antwortet dort
 * nichts — dann bleibt `tokens: null`. Beleg und Quellenlage:
 * `bibliothek/recherche/state-of-the-art-abgleich-2026-08-07.md`.
 */
export const TOKEN_ENDPUNKT = 'http://localhost:9464/metrics';

/** Timeout des Abrufs. Kurz: ein Messwert darf keine Erhebung aufhalten. */
export const TOKEN_TIMEOUT_MS = 2000;

export interface TokenKennzahl {
  /** Summe aller `claude_code`-Token-Zähler. */
  gesamt: number;
  /** Aufschlüsselung nach dem Typ-Label (input/output/cacheRead/…), sortiert. */
  jeTyp: Record<string, number>;
  /** Summe der Kosten-Zähler in USD, `null` wenn keine Kosten-Metrik da war. */
  kostenUsd: number | null;
  /**
   * Die tatsächlich gefundenen Metriknamen.
   *
   * Absicht (§7): Dieser Parser ist gegen die Prometheus-Textformat-SPEZIFIKATION
   * gebaut, nicht gegen eine gesehene Ausgabe — beim Bau war der Export nicht
   * aktiviert (die Env-Variable wartet auf David). Die Namensliste macht den
   * ersten realen Lauf selbst-belegend: wer sie im Snapshot sieht, weiss, worauf
   * die Zahlen beruhen, statt es zu glauben. Sie ist der eingebaute Auftrag,
   * die Annahme gegen die Wirklichkeit zu prüfen.
   */
  metriken: string[];
}

/** Eine Zeile im Prometheus-Textformat: `name{label="wert",…} 12.3 [ts]`. */
const PROM_ZEILE = /^([a-zA-Z_:][a-zA-Z0-9_:]*)(?:\{([^}]*)\})?[ \t]+([^ \t]+)(?:[ \t]+[0-9]+)?[ \t]*$/;

/** Label-Schlüssel, unter denen der Token-Typ auftreten kann. */
const TYP_LABEL = ['type', 'token_type', 'tokentype'];

/**
 * Parst den Prometheus-Text und verdichtet die `claude_code`-Zähler.
 *
 * ROBUST GEGEN NAMENS- UND LABEL-VARIANTEN, mit Absicht: Der OTel-Prometheus-
 * Exporter hängt je nach Version Einheiten- und `_total`-Suffixe an
 * (`claude_code_token_usage`, `…_tokens`, `…_tokens_total` sind alle plausibel),
 * und der Typ steht mal unter `type`, mal unter `token_type`. Statt einen Namen
 * zu raten und bei der nächsten Exporter-Version still 0 zu liefern, greift der
 * Parser auf SUBSTRING-Ebene (`claude_code` plus `token` bzw. `cost`) und
 * probiert mehrere Label-Schlüssel. Ein unbekanntes Typ-Label landet unter
 * «ohne_typ» — sichtbar, statt verschwiegen.
 *
 * `null` heisst «keine claude_code-Metrik gefunden», nicht «null Token». Der
 * Unterschied ist derselbe wie überall in dieser Datei (§8).
 */
export function parseTokenMetriken(text: string): TokenKennzahl | null {
  const jeTyp: Record<string, number> = {};
  const metriken = new Set<string>();
  let gesamt = 0;
  let kosten = 0;
  let kostenGesehen = false;

  for (const zeile of text.split('\n')) {
    const s = zeile.trim();
    if (!s || s.startsWith('#')) continue;
    const m = PROM_ZEILE.exec(s);
    if (!m) continue;
    const [, name, labelRoh, wertRoh] = m;
    if (!name.startsWith('claude_code')) continue;
    const wert = Number(wertRoh);
    // `NaN`/`+Inf` sind im Format zulässig, als Messwert aber unbrauchbar.
    if (!Number.isFinite(wert)) continue;

    const labels = parseLabels(labelRoh ?? '');
    if (/token/.test(name)) {
      metriken.add(name);
      gesamt += wert;
      const typ = TYP_LABEL.map((k) => labels[k]).find((v) => v !== undefined) ?? 'ohne_typ';
      jeTyp[typ] = (jeTyp[typ] ?? 0) + wert;
    } else if (/cost/.test(name)) {
      metriken.add(name);
      kosten += wert;
      kostenGesehen = true;
    }
  }

  if (metriken.size === 0) return null;
  const sortiert: Record<string, number> = {};
  for (const k of Object.keys(jeTyp).sort()) sortiert[k] = runde(jeTyp[k]);
  return {
    gesamt: runde(gesamt),
    jeTyp: sortiert,
    kostenUsd: kostenGesehen ? runde(kosten) : null,
    metriken: [...metriken].sort(),
  };
}

/** `a="1",b="x\"y"` → Objekt (Schlüssel kleingeschrieben). Escape-fest. */
function parseLabels(roh: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of roh.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"((?:[^"\\]|\\.)*)"/g)) {
    out[m[1].toLowerCase()] = m[2].replace(/\\(.)/g, '$1');
  }
  return out;
}

// ──────────────────────────────── Flaky-Zähler ────────────────────────────────

/**
 * Zählt Specs mit mindestens einem Wiederholungs-Versuch (`retry > 0`) im
 * Playwright-JSON-Report. Der Report ist ein CI-Artefakt und lokal meist nicht
 * vorhanden — fehlt er, gibt der Sammler `null` aus und vermerkt den Ausfall;
 * eine 0 an dieser Stelle behauptete «keine Flakes gemessen» als «keine Flakes»
 * (§8: nicht wissen ist nicht dasselbe wie null).
 */
export function zaehleFlakySpecs(report: unknown): number {
  let treffer = 0;
  const suiten = (s: unknown): void => {
    const o = s as { suites?: unknown[]; specs?: unknown[] } | null;
    if (!o || typeof o !== 'object') return;
    for (const spec of o.specs ?? []) {
      const sp = spec as { tests?: { results?: { retry?: number }[] }[] };
      const wiederholt = (sp.tests ?? []).some((t) => (t.results ?? []).some((r) => (r.retry ?? 0) > 0));
      if (wiederholt) treffer++;
    }
    for (const kind of o.suites ?? []) suiten(kind);
  };
  const wurzel = report as { suites?: unknown[] } | null;
  for (const s of wurzel?.suites ?? []) suiten(s);
  return treffer;
}

// ──────────────────────────────── Zeitreihe ────────────────────────────────

/**
 * Ein Messpunkt.
 *
 * **Definitions-Bruch am 7.8.2026 — beim Lesen der Reihe zu beachten.** Die
 * Snapshots 1–3 entstanden vor der Gegenprüfung und tragen deshalb zwei Werte
 * nach überholten Definitionen:
 *
 *   * `ci.failureRate` zählte abgebrochene Läufe als Ausfall (46 % statt 23 %);
 *     `ci.verdikte` und `ci.cancelledRate` fehlen dort ganz — daran sind alte
 *     Snapshots erkennbar, und ein Verlaufsvergleich der Ausfallquote über
 *     diesen Bruch hinweg ist unzulässig.
 *   * `fKlassen` zählte Reparaturdaten als Vorfälle (F2e=2 statt 1, F3=1 statt 0).
 *
 * Die alten Werte werden NICHT nachträglich korrigiert: eine Messreihe, die man
 * rückwirkend überschreibt, belegt nichts mehr. Der Bruch ist stattdessen hier
 * und im Dossier `bibliothek/betrieb/entregulierung-2026-08-07.md` vermerkt.
 */
export interface Snapshot {
  erhobenAm: string;
  headCommit: string;
  torRot: { seitLetztem: TorAggregat; kumuliert: TorAggregat };
  ci: CiKennzahl | null;
  /**
   * Zwei Sichten auf dieselbe Heuristik: `alle` über jede geänderte Datei (die
   * rohe Spec-Grösse), `handschrift` nur über handgeschriebenen Quelltext.
   * Begründung der Doppelung: `istHandschrift`. Angezeigt wird `handschrift`,
   * gespeichert werden beide — wer die Filterung anzweifelt, findet die
   * ungefilterte Zahl unverändert daneben (§8).
   */
  rework: { alle: ReworkKennzahl; handschrift: ReworkKennzahl } | null;
  flaky: { specs: number } | null;
  /**
   * Token- und Kostenverbrauch aus dem lokalen OTel-Export. `null`, solange der
   * Export nicht aktiviert ist (Env-Variable, wartet auf David) — dann steht der
   * Grund in `ausfaelle`. Snapshots vor dem 7.8.2026 kennen das Feld nicht.
   */
  tokens: TokenKennzahl | null;
  fKlassen: Record<string, number>;
  /**
   * Jules-/Gemini-Kennzahlen (QS-FREMDAGENTEN, Schema 3). Pflichtfeld wie
   * `fKlassen`: das Objekt selbst fehlt nie, seine beiden Quellen dürfen
   * `null` sein (nicht erhoben — `gh`/Netz fehlt bzw. die Fahrplan-Datei ist
   * nicht lesbar), dann steht der Grund in `ausfaelle`.
   */
  fremdagenten: FremdagentenBlock;
  /** Namen der ausgefallenen Quellen — Degradations-Muster wie `sammleLage()`. */
  ausfaelle: string[];
}

export interface Zeitreihe {
  _generiert: string;
  schema: number;
  snapshots: Snapshot[];
}

/** Leere, aber schema-valide Zeitreihe (erster Lauf). */
export function leereZeitreihe(): Zeitreihe {
  return { _generiert: GENERIERT_MARKE, schema: SCHEMA_VERSION, snapshots: [] };
}

/**
 * Zeitstempel-Form: **nur UTC mit `Z`**, keine Zonen-Offsets.
 *
 * Befund der Gegenprüfung 7.8.2026: Die erste Fassung liess `+02:00` &c. zu,
 * verglich die Stempel aber lexikografisch (`a > b` auf Strings). Für zwei
 * Stempel verschiedener Zone ist das schlicht falsch — `2026-08-07T09:00:00Z`
 * ist SPÄTER als `2026-08-07T10:30:00+02:00`, die Zeichenkette sagt das
 * Gegenteil. Betroffen wären die Chronologie-Prüfung hier und der
 * Watermark-Schnitt in `aggregiereTore`.
 *
 * Von zwei möglichen Reparaturen — `Date.parse`-Vergleich oder Offsets
 * verbieten — ist die zweite die tragfähigere: der Sammler schreibt
 * ausschliesslich `toISOString()` (immer `Z`), `gate.sh` ebenso. Ein Offset
 * könnte also nur von Hand hineinkommen — und Handschrift ist in dieser Datei
 * ohnehin verboten (Generat-Marke). Ein enges Format, das die Reihenfolge
 * lexikografisch entscheidbar macht, ist dem Nachrüsten von Zeitzonen-Arithmetik
 * an vier Vergleichsstellen vorzuziehen.
 */
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const SHA_RE = /^[0-9a-f]{7,40}$/;

/**
 * Schema-Prüfung der Zeitreihe — die Regel hinter `check:plan`.
 *
 * Liefert die Beanstandungen als Liste; leer heisst «in Ordnung». Wird
 * `roh === null` übergeben (Datei nicht vorhanden), ist das ausdrücklich KEIN
 * Fehler: die Messreihe ist ein Werkzeug, kein Pflichtbestand — ein frisch
 * geklonter Baum ohne sie muss grün sein.
 *
 * Geprüft wird die FORM, nie der Inhalt: Marke vorhanden, Pflichtfelder da,
 * Zeitstempel echt aufsteigend. Ein Tor über die WERTE (etwa «Failure-Rate darf
 * nicht steigen») wäre der Punkt, an dem die Messung anfinge, den Bau zu
 * steuern, statt ihn zu beschreiben.
 *
 * **Die Prüfung deckt, was die Leser voraussetzen** — Befund der Gegenprüfung
 * 7.8.2026: Eine Datei ohne `fKlassen` galt als schema-valide, `check:plan`
 * blieb grün, und `retro:17` starb an `Object.keys(undefined)`. Ein Schema-Tor,
 * das weniger prüft als seine Konsumenten annehmen, verlagert den Fehler bloss
 * von der Prüfung in den Betrieb. Darum sind seither ALLE Snapshot-Felder
 * Pflicht — `ci`, `rework` und `flaky` dürfen `null` sein (das ist ihre
 * Ausfall-Semantik), aber nicht fehlen.
 */
export function pruefeZeitreihe(roh: string | null): string[] {
  if (roh === null) return [];
  const fehler: string[] = [];
  let daten: unknown;
  try {
    daten = JSON.parse(roh);
  } catch (e) {
    return [`${ZEITREIHE_DATEI} ist kein gültiges JSON — ${(e as Error).message}`];
  }
  const z = daten as Partial<Zeitreihe> | null;
  if (!z || typeof z !== 'object' || Array.isArray(z)) {
    return [`${ZEITREIHE_DATEI}: Wurzel ist kein Objekt`];
  }
  if (z._generiert !== GENERIERT_MARKE) {
    fehler.push(
      `${ZEITREIHE_DATEI}: Feld "_generiert" fehlt oder weicht ab — erwartet wörtlich «${GENERIERT_MARKE}» ` +
        `(die Datei ist eine Projektion von \`npm run selbstopt:erheben\`, keine Handschrift)`,
    );
  }
  if (typeof z.schema !== 'number') {
    fehler.push(`${ZEITREIHE_DATEI}: Feld "schema" fehlt oder ist keine Zahl`);
  }
  if (!Array.isArray(z.snapshots)) {
    fehler.push(`${ZEITREIHE_DATEI}: Feld "snapshots" fehlt oder ist keine Liste`);
    return fehler;
  }

  let vorher: string | null = null;
  z.snapshots.forEach((s, i) => {
    const wo = `${ZEITREIHE_DATEI}[${i}]`;
    const sn = s as Partial<Snapshot> | null;
    if (!sn || typeof sn !== 'object') {
      fehler.push(`${wo}: Snapshot ist kein Objekt`);
      return;
    }
    if (typeof sn.erhobenAm !== 'string' || !ISO_RE.test(sn.erhobenAm) || Number.isNaN(Date.parse(sn.erhobenAm))) {
      fehler.push(`${wo}: "erhobenAm" fehlt oder ist kein ISO-Zeitpunkt (${String(sn.erhobenAm)})`);
    } else {
      if (vorher !== null && !(sn.erhobenAm > vorher)) {
        fehler.push(`${wo}: "erhobenAm" ${sn.erhobenAm} ist nicht später als der vorige Snapshot (${vorher}) — Snapshots müssen chronologisch aufsteigen`);
      }
      vorher = sn.erhobenAm;
    }
    if (typeof sn.headCommit !== 'string' || !SHA_RE.test(sn.headCommit)) {
      fehler.push(`${wo}: "headCommit" fehlt oder ist kein Commit-SHA (${String(sn.headCommit)})`);
    }
    const tr = sn.torRot as Snapshot['torRot'] | undefined;
    if (!tr || typeof tr !== 'object' || !istAggregat(tr.seitLetztem) || !istAggregat(tr.kumuliert)) {
      fehler.push(`${wo}: "torRot" braucht die Aggregate "seitLetztem" und "kumuliert" (je gesamt/rot/je)`);
    }
    if (!Array.isArray(sn.ausfaelle)) {
      fehler.push(`${wo}: "ausfaelle" fehlt oder ist keine Liste`);
    }
    // `fKlassen` ist Pflicht und muss ein Zahlen-Register sein: `retro:17`
    // iteriert darüber (Object.keys) und rechnet mit den Werten.
    if (!istZahlenRegister(sn.fKlassen)) {
      fehler.push(`${wo}: "fKlassen" fehlt oder ist kein Register Klasse→Zahl`);
    }
    const fa = sn.fremdagenten as Partial<FremdagentenBlock> | undefined;
    if (fa === undefined) {
      fehler.push(`${wo}: "fremdagenten" fehlt — bei nicht erhobener Quelle gehören die Teilfelder ausdrücklich null hierher`);
    } else if (!fa || typeof fa !== 'object') {
      fehler.push(`${wo}: "fremdagenten" ist kein Objekt`);
    } else {
      if (fa.jules !== null && !istJulesMessung(fa.jules)) {
        fehler.push(`${wo}: "fremdagenten.jules" ist weder null noch eine valide Jules-Messung`);
      }
      if (fa.gemini !== null && !istGeminiMessung(fa.gemini)) {
        fehler.push(`${wo}: "fremdagenten.gemini" ist weder null noch eine valide Gemini-Messung`);
      }
      if (fa.claude_token_pro_schritt !== null) {
        fehler.push(`${wo}: "fremdagenten.claude_token_pro_schritt" muss null sein (noch keine automatische Quelle)`);
      }
    }
    // Die vier Ausfall-Felder: `null` ist zulässig (Quelle nicht erhoben),
    // Fehlen nicht. Der Unterschied ist der ganze Punkt — «nicht gemessen»
    // muss im Artefakt stehen und darf nicht durch Abwesenheit ausgedrückt
    // werden, sonst liest jeder Konsument sie als 0 oder stürzt ab.
    for (const feld of ['ci', 'rework', 'flaky', 'tokens'] as const) {
      const w = sn[feld];
      if (w === undefined) {
        fehler.push(`${wo}: "${feld}" fehlt — bei nicht erhobener Quelle gehört ausdrücklich null hierher`);
      } else if (w !== null && typeof w !== 'object') {
        fehler.push(`${wo}: "${feld}" ist weder null noch ein Objekt (${typeof w})`);
      }
    }
  });

  return fehler;
}

function istAggregat(a: unknown): a is TorAggregat {
  const o = a as Partial<TorAggregat> | null;
  return !!o && typeof o === 'object' && typeof o.gesamt === 'number' && typeof o.rot === 'number' && !!o.je && typeof o.je === 'object';
}

function istZahlenRegister(a: unknown): a is Record<string, number> {
  if (!a || typeof a !== 'object' || Array.isArray(a)) return false;
  return Object.values(a as Record<string, unknown>).every((v) => typeof v === 'number');
}

function istJulesMessung(a: unknown): a is JulesMessung {
  const o = a as Partial<JulesMessung> | null;
  return (
    !!o &&
    typeof o === 'object' &&
    typeof o.prs_gemerged_7d === 'number' &&
    typeof o.prs_geschlossen_7d === 'number' &&
    (o.proben_7d === null || typeof o.proben_7d === 'number') &&
    (o.entwurf_antworten_7d === null || typeof o.entwurf_antworten_7d === 'number') &&
    (o.prs_geschlossen_nummern === null ||
      (Array.isArray(o.prs_geschlossen_nummern) && o.prs_geschlossen_nummern.every((n) => typeof n === 'number'))) &&
    (o.median_dauer_min === null || typeof o.median_dauer_min === 'number') &&
    typeof o.tickets_24h === 'number' &&
    typeof o.alarm === 'boolean'
  );
}

function istGeminiMessung(a: unknown): a is GeminiMessung {
  const o = a as Partial<GeminiMessung> | null;
  return (
    !!o &&
    typeof o === 'object' &&
    typeof o.diskrepanz_laeufe === 'number' &&
    typeof o.diskrepanz_echt === 'number' &&
    typeof o.diskrepanz_schein === 'number' &&
    typeof o.zweitblick_durchgaenge === 'number' &&
    typeof o.kontingent_ereignisse === 'number'
  );
}

/** Letzter Snapshot oder `null` — die Anzeige-Seiten fragen nur danach. */
export function letzterSnapshot(z: Zeitreihe | null): Snapshot | null {
  if (!z || !Array.isArray(z.snapshots) || z.snapshots.length === 0) return null;
  return z.snapshots[z.snapshots.length - 1];
}

/** Prozent-Text einer Quote, oder «—». Eine Formatierung, vier Anzeigeorte (§5). */
export function quoteText(x: number | null | undefined): string {
  return typeof x === 'number' ? `${(x * 100).toFixed(0)} %` : '—';
}
