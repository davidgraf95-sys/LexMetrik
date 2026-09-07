// ─── check:verweis-inventar — Verweis-Inventar des Normtext-Korpus (V-1) ─────
//
// Anlass: Auftrag David 31.8.2026 (Verweis-Schärfe), Fahrplan
// `fahrplaene/FAHRPLAN-VERWEIS-SCHAERFE.md` §1 · V-1. Bis hierher existierte
// KEINE Messung, wie viele Verweis-Stellen der Korpus trägt und wie sie
// aufgelöst werden — die einzigen Zahlen standen als Kommentar in
// `NormText.tsx` (F41: «199 Self-Links») und in einem datierten Messbericht
// (`bibliothek/normtext/verweis-inventar-messung-2026-08-31.md`). Kommentar-
// Zahlen altern still; dieses Tor ersetzt sie durch ein reproduzierbares,
// committetes Artefakt (`messwerte/verweis-inventar.json`).
//
// WAS GEMESSEN WIRD. Je Formklasse (= eine Stelle im Entscheidbaum, an der
// über Link/kein-Link entschieden wird): Zahl der Stellen, Zahl der Erlasse,
// der Entscheid (SELF / FREMD / TEXT) und die Zahl der Stellen mit explizitem
// SELBSTMARKER («dieses Gesetzes», «des vorliegenden Gesetzes» …). Dazu zwei
// Sonderlisten: tote Selbstziele (Selbstmarker-Verweis auf eine Bestimmung,
// die es im Erlass nicht gibt) und Zeit-Kanten-Stellen (Selbstmarker in
// Übergangs-/Altrecht-Kontext; nur Zählung, siehe V-5).
//
// ─── TRANSKRIPTION (§8-Offenlegung, bindend lesen) ──────────────────────────
//
// Die produktive Entscheidkette lebt in `restMitIntern` / `selbstSpanSprung`
// (`src/components/NormText.tsx`) und in `etabliertFremdgesetz`
// (`src/components/normtext/ArtikelBody.tsx`). Alle drei sind React-interne,
// NICHT exportierte Funktionen. Das Tor arbeitet darum mit einer
// TRANSKRIPTION der Guards, nicht mit dem Original — sie steht in
// `scripts/verweis-inventar-transkription.ts` (§6.6-Trennung: dort WAS die
// Produktion tut, hier WIE gemessen und verglichen wird):
//
//   · Die ERKENNER sind die echten Produktions-Funktionen (importiert):
//     normVerweiseImText, fremdgesetzNachArtikel, fremdRoutingFormB,
//     artikelnPluralVerweise, chapeauZielFremdgesetz, erkenneFedlexGesetz —
//     keine zweite Regex-Wahrheit über das, was ein Verweis IST (§5).
//   · Die GUARDS (ART_INTERN, PARAGRAF_INTERN, PARAGRAF_ANHANG,
//     PARAGRAF_FREMD_GROSS/-NAME, des/der-Guard, M12, SELBST_MARKER,
//     nenntEigenesKuerzel, normRef, kuerzelKanon, etabliertFremdgesetz) sind
//     als Zeichenketten transkribiert.
//   · Diese Zeichenketten sind zugleich (a) der Vergleichs-Massstab des
//     Wächters gegen den Quelltext UND (b) die Quelle der compilierten
//     RegExp (`re()`). Eine Transkription, die vom Original abweicht,
//     kann darum nicht still danebenliegen — sie reisst den Wächter.
//   · Zusätzlich hält das Artefakt den SHA-256 von `NormText.tsx`. Ändert
//     jemand die Datei (auch die Entscheid-REIHENFOLGE, die kein Literal-
//     Vergleich sieht), wird das Tor rot und verlangt eine bewusste
//     Regeneration der Basislinie.
//
// GRENZEN (§8, nicht wegglätten):
//   · Gemessen wird die Transkription, nicht das React-Rendering.
//   · Text-Umfang = `bloecke[].text` und `bloecke[].items[].text` aller
//     Snapshots. Präambel/Ingress (ErlassKopfBlock), Tabellen- und Bild-
//     Sonderpfade sind NICHT enthalten. (Der Messbericht vom 31.8.2026 mass
//     nur die BLOCK-Texte — daher dort 24 489 statt 34 058 Stellen; sein
//     datierter Befund bleibt unangetastet, hier steht der weitere Umfang.)
//   · Der Kontext ist der des Lesers (`useInternRefs`): tokenMap aus den
//     Snapshot-Artikeln, `paragrafDesigniert` aus GRUNDART_SEED,
//     `eigenesKuerzel` aus dem Register-Key, `registerKuerzel` aus dem
//     Register-Feld `kuerzel`. Der Chapeau-Kontext (M6/M6-D, ArtikelBody) ist
//     für Items nachgebildet.
//   · Die Spalte `selbstmarker` zählt seit V-2 (Commit 967870b41) exakt die
//     Stellen, an denen `selbstSignalAmZitat` greift — der frühere EIGENE
//     Detektor dieses Tors ist ersetzt (§5, keine zweite Wahrheit). Er läuft
//     nur an SINGULÄREN «Art. N»/«§ N»-Stellen, nicht an Plural-Regionen.
//   · Zeit-Kante = Kontext-INDIZ (Randtitel «Übergangs…» bzw. Altrecht-Wendung
//     im Block), keine rechtliche Klassifikation.
//
// BASISLINIEN-MODELL (Vorbild `check:ui-normzitate`): das Artefakt ist
// committet; das Tor rechnet neu und vergleicht. Jede Abweichung ist ROT.
// Bewusste Änderungen (Korpus-Nachzug, Erkenner-Umbau, V-2/V-3) regenerieren
// das Artefakt IM SELBEN Commit:
//
//   npm run check:verweis-inventar -- --schreiben
//
// Determinismus (§2): keine Zeitstempel im Artefakt, stabile Sortierung
// (Klassen alphabetisch, Sonderlisten nach Fundstelle).
//
// Scheiterns-Fähigkeit (§6.7): ein Selbsttest jagt bei JEDEM Lauf ein Dutzend
// synthetischer Texte durch dieselbe Pipeline — je einen pro Weiche, die drei
// V-2-Ziele eingeschlossen — und prüft die erwartete Klassenzuordnung; stimmt
// eine nicht, bricht das Tor sich selbst ab.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { relative } from 'node:path';
import { waechterGuards } from './verweis-inventar-transkription';
// Die Mess-Maschine (Korpus-Lauf, Aggregation, Sonderlisten, Selbsttest) steht
// in `verweis-inventar-messung.ts` — hier lebt nur das Tor: CLI, Wächter,
// Basislinien-Vergleich, Bericht (§6.6-Trennung, 31.8.2026).
import {
  ARTEFAKT_PFAD, WURZEL, berechne, selbsttest, type Artefakt, type TotesZiel,
} from './verweis-inventar-messung';

// ─── 7 · Lauf ───────────────────────────────────────────────────────────────

const schreiben = process.argv.includes('--schreiben');

const guardFehler = waechterGuards();
if (guardFehler.length > 0) {
  console.error(
    'check:verweis-inventar ROT — die transkribierten Guards weichen vom Quelltext ab.\n'
    + 'Das Tor misst dann etwas anderes als die Produktion tut. Transkription in\n'
    + 'scripts/verweis-inventar-transkription.ts nachziehen UND Basislinie neu schreiben:',
  );
  for (const f of guardFehler) console.error(`  · ${f}`);
  process.exit(1);
}

selbsttest();

const ist = berechne();
const alsText = `${JSON.stringify(ist, null, 2)}\n`;

if (schreiben) {
  writeFileSync(ARTEFAKT_PFAD, alsText);
  console.log(
    `Basislinie geschrieben: ${ist.gesamt.stellen} Stellen · ${ist.klassen.length} Klassen · `
    + `${ist.toteSelbstziele.length} tote Selbstziele → ${relative(WURZEL, ARTEFAKT_PFAD)}`,
  );
  process.exit(0);
}

if (!existsSync(ARTEFAKT_PFAD)) {
  console.error(
    `check:verweis-inventar ROT — Basislinie fehlt (${relative(WURZEL, ARTEFAKT_PFAD)}).\n`
    + '  Erzeugen: npm run check:verweis-inventar -- --schreiben',
  );
  process.exit(1);
}

const soll = JSON.parse(readFileSync(ARTEFAKT_PFAD, 'utf8')) as Artefakt;

console.log(
  `check:verweis-inventar — ${ist.korpus.erlasse} Erlasse · ${ist.korpus.eintraege} Bestimmungen · `
  + `${ist.gesamt.stellen} Verweis-Stellen (SELF ${ist.gesamt.self} · FREMD ${ist.gesamt.fremd} · `
  + `TEXT ${ist.gesamt.text}) · Selbstmarker ${ist.gesamt.selbstmarker} · `
  + `tote Selbstziele ${ist.toteSelbstziele.length} · Zeit-Kanten ${ist.zeitKanten.stellen}`,
);

const abweichungen: string[] = [];
if (soll._quellen?.normTextSha256 !== ist._quellen.normTextSha256) {
  abweichungen.push(
    `NormText.tsx hat sich geändert (SHA-256 ${String(soll._quellen?.normTextSha256).slice(0, 12)} → `
    + `${ist._quellen.normTextSha256.slice(0, 12)}). ZUERST die Transkription `
    + '(scripts/verweis-inventar-transkription.ts) gegen die NEUE Entscheidkette prüfen — ein '
    + 'zugefügter oder umgestellter Guard ändert '
    + 'die Auflösung, ohne ein Literal zu entfernen, und wäre für den Literal-Wächter unsichtbar. '
    + 'ERST danach die Basislinie neu schreiben; ein blosses Regenerieren macht das Tor grün über '
    + 'eine Messung, die die Produktion nicht mehr abbildet.',
  );
}
const zeileSoll = new Map((soll.klassen ?? []).map((z) => [z.klasse, z]));
for (const z of ist.klassen) {
  const s = zeileSoll.get(z.klasse);
  if (!s) { abweichungen.push(`Klasse «${z.klasse}» ist NEU (${z.stellen} Stellen).`); continue; }
  if (s.stellen !== z.stellen || s.erlasse !== z.erlasse || s.selbstmarker !== z.selbstmarker) {
    abweichungen.push(
      `${z.klasse}: Stellen ${s.stellen} → ${z.stellen} · Erlasse ${s.erlasse} → ${z.erlasse} · `
      + `Selbstmarker ${s.selbstmarker} → ${z.selbstmarker}`,
    );
  }
}
for (const z of soll.klassen ?? []) {
  if (!ist.klassen.some((k) => k.klasse === z.klasse)) abweichungen.push(`Klasse «${z.klasse}» ist WEGGEFALLEN.`);
}
for (const feld of ['erlasse', 'eintraege', 'texte'] as const) {
  if (soll.korpus?.[feld] !== ist.korpus[feld]) {
    abweichungen.push(`korpus.${feld}: ${soll.korpus?.[feld]} → ${ist.korpus[feld]}`);
  }
}
const schluessel = (t: TotesZiel) => `${t.fundstelle}|${t.bestimmung}`;
const sollTot = new Set((soll.toteSelbstziele ?? []).map(schluessel));
const istTot = new Set(ist.toteSelbstziele.map(schluessel));
for (const t of ist.toteSelbstziele) if (!sollTot.has(schluessel(t))) abweichungen.push(`Totes Selbstziel NEU: ${schluessel(t)}`);
for (const k of sollTot) if (!istTot.has(k)) abweichungen.push(`Totes Selbstziel BEHOBEN: ${k} (Basislinie nachziehen)`);
for (const feld of ['stellen', 'erlasse', 'uebergangsTitel', 'altrechtBlock'] as const) {
  if (soll.zeitKanten?.[feld] !== ist.zeitKanten[feld]) {
    abweichungen.push(`zeitKanten.${feld}: ${soll.zeitKanten?.[feld]} → ${ist.zeitKanten[feld]}`);
  }
}

if (abweichungen.length > 0) {
  console.error(`check:verweis-inventar ROT — ${abweichungen.length} Abweichung(en) gegen die Basislinie:`);
  for (const a of abweichungen) console.error(`  · ${a}`);
  console.error(
    '\n  Bewusste Änderung? Basislinie IM SELBEN Commit regenerieren:\n'
    + '    npm run check:verweis-inventar -- --schreiben',
  );
  process.exit(1);
}

console.log('check:verweis-inventar GRÜN — Inventar deckungsgleich mit der Basislinie.');

