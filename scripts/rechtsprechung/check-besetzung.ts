// ─── Tor «check:besetzung» — Spruchkörper-Projektion prüfen ──────────────────
//
// Prüft die committeten Projektionen (public/rechtsprechung/register.json +
// richter.json) gegen die Snapshots. Vier Klassen:
//
//  G1 LEAK (HART)      — kein Slug/Anzeigename trägt ein Anonymisierungs-Token.
//                        Eine anonymisierte Partei/ein Gutachter darf NIE als
//                        Richter erscheinen; korpusweit muss das 0 ergeben.
//  G2 KONSISTENZ (HART)— jeder im Manifest referenzierte Slug existiert im
//                        Richter-Register; jede Rolle ist gültig.
//  G3 DETERMINISMUS    — die Projektion aus den Snapshots reproduziert das
//        (HART)          committete Manifest exakt (Parser + Kanon-Pass stabil).
//  G4 ABDECKUNG        — Report mit Mindestschwellen je Korpus (kein Stillstand
//        (SCHWELLE)      unbemerkt); ehrliche Zahlen, nichts Fabriziertes (§8).
//
// Zusätzlich: Fidelity-Stichprobe (extrahierte Nachnamen MÜSSEN im amtlichen
// Freitext vorkommen) und der Kollisions-Report als Artefakt.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { EntscheidManifest, RichterRegister } from '../../src/lib/rechtsprechung/register';
import { ladeBestandSnapshots, keyVon } from '../normtext/entscheide-schreiben';
import {
  parseBesetzung, kanonisiere, istAnonymisiert, fold, type KanonEintrag,
} from '../../src/lib/rechtsprechung/besetzung';
import { besetzungsTeile } from '../../src/lib/rechtsprechung/besetzung-verlinkung';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public', 'rechtsprechung');
const fehler: string[] = [];
const warnung: string[] = [];

function lies<T>(datei: string): T | null {
  const p = join(PUB, datei);
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : null;
}

const manifest = lies<EntscheidManifest>('register.json');
const richterReg = lies<RichterRegister>('richter.json');
if (!manifest) { console.error('[check:besetzung] register.json fehlt.'); process.exit(1); }
if (!richterReg) { console.error('[check:besetzung] richter.json fehlt.'); process.exit(1); }

// ── G1 Leak-Scan (hart) ──
let geprueft = 0;
for (const [slug, e] of Object.entries(richterReg.richter)) {
  geprueft++;
  if (slug.includes('_') || istAnonymisiert(slug)) fehler.push(`G1 LEAK: Slug «${slug}» trägt ein Anonymisierungs-Token.`);
  if (e.name.includes('_') || istAnonymisiert(e.name)) fehler.push(`G1 LEAK: Anzeigename «${e.name}» (Slug ${slug}) trägt ein Anonymisierungs-Token.`);
}
for (const e of manifest.entscheide) {
  for (const r of e.richter ?? []) {
    if (r.s.includes('_') || istAnonymisiert(r.s)) fehler.push(`G1 LEAK: ${e.key} → Slug «${r.s}».`);
  }
}

// ── G1b PHANTOM-SCAN (hart) — Rollenwort/Fragment als Person ──────────────────
// Die Fidelity-Prüfung unten ist EINSEITIG (Nachname muss im Freitext vorkommen)
// und kann diese Klasse strukturell nicht finden: «présidant», «unica», «federali»,
// «II» und «Keller» stehen alle wörtlich im amtlichen Freitext — 11 erfundene
// Amtsträger:innen passierten das Tor grün (Befund Gegenprüfung 20.7.2026).
// Ein Nachname, der ein Rollen-/Funktionswort IST, ist nie eine Person.
const ROLLENWORT =
  /^(?:pr[ée]sid(?:ent|ant)[esn]*|vorsitz(?:ende[rn]?)?|unic[ao]|uniques?|juges?|giudici?|richter(?:in)?|f[ée]d[ée]ra(?:l|le|les|ux)|federal[ie]|p[ée]na(?:l|le|les|ux)|penal[ie]|greffi[eè]re?|cancellier[ea]|gerichtsschreiber(?:in)?|referent(?:in)?|mitglied|besetzung|approbation|approvazione|zustimmung|einzelrichter(?:in)?|I{1,3})$/i;
// Anzeigenamen-Hygiene: was hier greift, ist Extraktions-Rauschen, kein Name.
const NAME_MUELL: readonly (readonly [RegExp, string])[] = [
  [/[\d_]/, 'Ziffer oder Underscore im Namen (Aktenzeichen-Kontamination?)'],
  [/[-–]\s*$/, 'hängender Bindestrich (Zeilenumbruch mitten im Namen?)'],
  [/^\s*[-–]/, 'führender Bindestrich'],
  [/\b(?:Dr|Prof|lic|iur|med|phil|oec|MLaw|BLaw|Dipl|PD)\b\.?/, 'Titelrest im Namen'],
];
// Kleingeschriebene Namensanfänge sind NUR als echte Partikel zulässig.
const PARTIKEL_START = /^(?:de|di|du|da|dal|del|della|dello|des|van|von|vom|zu|zur|ten|ter|le|la|d')\s/;
for (const [slug, e] of Object.entries(richterReg.richter)) {
  const nach = slug.split('-')[0];
  if (ROLLENWORT.test(nach) || ROLLENWORT.test(e.name)) {
    fehler.push(`G1b PHANTOM: Slug «${slug}» / Name «${e.name}» ist ein Rollen-/Funktionswort, keine Person.`);
  }
  for (const [re, was] of NAME_MUELL) {
    if (re.test(e.name)) fehler.push(`G1b PHANTOM: «${e.name}» (${slug}) — ${was}.`);
  }
  if (/^[a-zäöüéèàß]/.test(e.name) && !PARTIKEL_START.test(e.name)) {
    fehler.push(`G1b PHANTOM: «${e.name}» (${slug}) beginnt klein und trägt kein Namenspartikel.`);
  }
}

// ── G2 Konsistenz (hart) ──
const ROLLEN = new Set(['vorsitz', 'mitglied', 'gerichtsschreiber']);
let mitRichter = 0;
for (const e of manifest.entscheide) {
  if (!e.richter) continue;
  if (!e.richter.length) { fehler.push(`G2: ${e.key} trägt ein LEERES richter[] (statt gar keines, §8).`); continue; }
  mitRichter++;
  for (const r of e.richter) {
    if (!ROLLEN.has(r.r)) fehler.push(`G2: ${e.key} → unbekannte Rolle «${r.r}».`);
    if (!(r.s in richterReg.richter)) fehler.push(`G2: ${e.key} → Slug «${r.s}» fehlt im Richter-Register.`);
  }
  // G2b ROLLEN-KARDINALITÄT (hart): ein Spruchkörper hat HÖCHSTENS einen Vorsitz.
  // Fehlte bisher ganz — «Referent» galt als Vorsitz-Marker, zwei bpatger-Entscheide
  // trugen dadurch zwei Vorsitzende und das Tor blieb grün.
  const vorsitze = e.richter.filter((r) => r.r === 'vorsitz');
  if (vorsitze.length > 1) {
    fehler.push(`G2b KARDINALITÄT: ${e.key} trägt ${vorsitze.length} Vorsitzende (${vorsitze.map((v) => v.s).join(', ')}) — ein Spruchkörper hat einen.`);
  }
  // G2c: derselbe Slug zweimal im selben Entscheid ⇒ zwei Personen teilen einen
  // Eimer (Bundesrichter Seiler ↔ Gerichtsschreiber Seiler). Kein Blocker — an
  // Nur-Nachname-Gerichten nicht auflösbar —, aber nie stillschweigend.
  const slugs = e.richter.map((r) => r.s);
  if (new Set(slugs).size !== slugs.length) {
    warnung.push(`SLUG-KOLLISION — ${e.key}: ${slugs.join(', ')} (gleicher Nachname in zwei Rollen; Identität ungeklärt, §8).`);
  }
}

// ── G3 Determinismus: Projektion aus den Snapshots reproduzieren ──
const snaps = ladeBestandSnapshots(ROOT);
const rohProKey = new Map<string, ReturnType<typeof parseBesetzung>['richter']>();
const kanonInput: KanonEintrag[] = [];
const raumVon = new Map<string, string>();
const freitextVon = new Map<string, string>();
for (const s of snaps) {
  // MUSS dieselbe Schlüssel-Funktion sein wie im Generator. Die erste Fassung nahm
  // `s.id` — das trifft den Manifest-Key nie, also lief G3 über eine LEERE
  // Schnittmenge und meldete «0 Abweichungen» grün, ohne irgendetwas zu prüfen.
  // Ein Tor, das nicht scheitern KANN, ist gefährlicher als keines; darum unten
  // zusätzlich die Mindestdeckungs-Assertion.
  const key = keyVon(s).key;
  raumVon.set(key, s.kanton);
  const ft = s.rubrum?.besetzung ?? null;
  if (!ft) continue;
  freitextVon.set(key, ft);
  const res = parseBesetzung(ft, { gericht: s.gericht });
  if (!res.richter.length) continue;
  rohProKey.set(key, res.richter);
  for (const r of res.richter) {
    kanonInput.push({ slug: r.slug, nachSlug: r.nachSlug, givenSlug: r.givenSlug, givenAbk: r.givenAbk, name: r.name, raum: s.kanton });
  }
}
const kanon = kanonisiere(kanonInput);

// Manifest-keys sind nicht zwingend die Snapshot-ids — über die Schnittmenge prüfen.
const manifestByKey = new Map(manifest.entscheide.map((e) => [e.key, e]));
let verglichen = 0, abweichungen = 0;
for (const [key, roh] of rohProKey) {
  const e = manifestByKey.get(key);
  if (!e) continue;
  verglichen++;
  const erwartet = roh.map((r) => `${kanon.map.get(`${raumVon.get(key)}|${r.slug}`) ?? r.slug}:${r.rolle}`).join(',');
  const ist = (e.richter ?? []).map((r) => `${r.s}:${r.r}`).join(',');
  if (erwartet !== ist) {
    abweichungen++;
    if (abweichungen <= 5) fehler.push(`G3 DRIFT: ${key}\n     Snapshot→Projektion: ${erwartet}\n     im Manifest:         ${ist}`);
  }
}
if (abweichungen > 5) fehler.push(`G3 DRIFT: … und ${abweichungen - 5} weitere.`);

// Selbstprüfung des Tors (Anti-Vakuum): G3 ist nur dann eine Aussage, wenn es
// tatsächlich Einträge verglichen hat. Deckt der Vergleich nicht die grosse Mehrheit
// der Entscheide mit Spruchkörper ab, stimmt die Schlüssel-Bildung nicht mehr mit
// dem Generator überein — das ist ein Tor-Defekt und muss ROT sein, nicht still grün.
const G3_MINDEST = 0.95;
if (verglichen < mitRichter * G3_MINDEST) {
  fehler.push(
    `G3 VAKUUM: nur ${verglichen} von ${mitRichter} Einträgen mit Spruchkörper verglichen `
    + `(< ${(G3_MINDEST * 100).toFixed(0)} %). Die Schlüssel-Bildung weicht vom Generator ab — `
    + `der Determinismus-Nachweis wäre wertlos.`,
  );
}

// ── Fidelity-Stichprobe: Nachname muss im amtlichen Freitext stehen ──
// Deterministische Auswahl (jeder n-te Schlüssel), damit der Lauf reproduzierbar ist.
// VOLLPRÜFUNG statt Stichprobe: die frühere Fassung prüfte jeden n-ten Schlüssel
// (~200 von 4961 = 4 %) — bei einem Lauf von wenigen Sekunden ist das eine
// Selbstbeschränkung ohne Gegenwert. Ein Fehler in den übrigen 96 % blieb unsichtbar.
const keys = [...rohProKey.keys()].sort();
let stichprobe = 0, treffer = 0;
for (const key of keys) {
  const ft = fold(freitextVon.get(key) ?? '');
  for (const r of rohProKey.get(key)!) {
    stichprobe++;
    // Der gefaltete Nachname muss als Teilkette im gefalteten Freitext vorkommen.
    if (ft.includes(r.nachSlug)) treffer++;
    else fehler.push(`FIDELITY: ${key} → «${r.name}» (${r.nachSlug}) steht nicht im amtlichen Freitext.`);
  }
}

// ── Fremdmuster im Besetzungs-Freitext (Rubrum-Grenze) ──
// Der Schnitt darf nur den Spruchkörper liefern. Ein Aktenzeichen im Feld ist eine
// Grenzverletzung — und war real folgenschwer: BGE 151 IV 175 trug «… Kropf.
// 7B_950/2024et», das ziffernhaltige Segment fiel in den «kein sicherer Name»-Zweig
// und die Gerichtsschreiberin verschwand komplett. Kein Tor prüfte darauf.
const AKTENZEICHEN = /\b\d[A-Za-z]?_\d+\/\d{4}/;
for (const [key, ft] of freitextVon) {
  if (AKTENZEICHEN.test(ft)) {
    fehler.push(`RUBRUM-GRENZE: ${key} → Aktenzeichen im besetzung-Feld: «${ft.slice(-60)}».`);
  }
}

// ── G5 VERLINKUNG (HART) — die Reader-Links zeigen auf die richtige Person ──
//
// Der Entscheid-Leser macht die Besetzung klickbar. Die Zuordnung Freitext-Name →
// Kanon-Slug läuft POSITIONELL (Position i des Parser-Ergebnisses ↔ Position i von
// `BrowseEntscheid.richter`) und ist damit an eine Annahme gebunden, die kein
// Laufzeit-Guard vollständig prüfen kann: dass Manifest und Parser dieselbe
// Personen-Reihenfolge tragen. Ein Laufzeit-Guard sieht nur Anzahl und Rollen —
// verschöbe eine Drift die PERSON an Position i, ohne Anzahl/Rollenfolge zu ändern,
// würde still auf die falsche Person verlinkt (Befund Gegenprüfung 20.7.2026, die
// teuerste Fehlklasse überhaupt, vgl. die 11 erfundenen Amtsträger:innen aus #310).
//
// ARBEITSTEILUNG mit G3, damit hier kein Schein-Tor entsteht:
//   · Die PERSONEN-IDENTITÄT an Position i prüft **G3** — es vergleicht die aus den
//     Snapshots neu berechnete Projektion (Parser + Kanon-Pass) mit der committeten
//     Manifest-Liste, geordnet und vollständig. Ein vertauschter oder verschobener
//     Slug im Manifest ändert diese Zeichenkette und macht G3 rot. Solange G3 grün
//     ist, IST die positionelle Annahme des Readers bewiesen.
//   · G5 prüft die Schicht darüber: was der Reader aus dieser Liste tatsächlich
//     rendert. (Ein Versuch, die Identität hier ein zweites Mal zu prüfen, wäre
//     tautologisch — Linktext und Parser-Name stammen aus derselben Quelle und
//     können nie auseinanderfallen. Empirisch bestätigt 20.7.2026: eine simulierte
//     Slug-Vertauschung im Manifest lief durch eine solche Prüfung glatt hindurch,
//     während G3 sie fängt. Ein Tor, das nicht scheitern kann, ist gefährlicher als
//     keines — siehe die G3-VAKUUM-Notiz oben.)
//
// Geprüft wird also, was der Reader TATSÄCHLICH rendert:
//  (a) die verlinkten Textstellen sind genau die richterlichen Mitwirkenden,
//      in Reihenfolge, mit exakt den Slugs des Manifests;
//  (b) kein Gerichtsschreiber-Slug wird je verlinkt (die Facette führt ihn nicht,
//      der Link liefe ins Leere);
//  (c) der amtliche Wortlaut bleibt byte-genau erhalten (Konkatenation der Teile).
let verlinkGeprueft = 0, verlinkFehler = 0, verlinkte = 0;
for (const key of rohProKey.keys()) {
  const e = manifestByKey.get(key);
  const ft = freitextVon.get(key);
  if (!e || !ft) continue;
  verlinkGeprueft++;
  const teile = besetzungsTeile(ft, e.gericht, e.richter);
  const melde = (grund: string) => {
    verlinkFehler++;
    if (verlinkFehler <= 5) fehler.push(`G5 VERLINKUNG: ${key} — ${grund}`);
  };
  // (c) Wortlaut-Treue: die Teile ergeben lückenlos den amtlichen Freitext.
  if (teile.map((t) => t.text).join('') !== ft) { melde('Konkatenation ≠ amtlicher Freitext.'); continue; }
  // (a)+(b) Soll = die Nicht-GS-Refs des Manifests, in Reihenfolge.
  const soll = (e.richter ?? []).filter((r) => r.r !== 'gerichtsschreiber').map((r) => r.s);
  const ist = teile.filter((t) => t.slug).map((t) => t.slug!);
  if (ist.join(',') !== soll.join(',')) {
    melde(`verlinkte Slugs ≠ richterliche Manifest-Refs.\n     verlinkt: ${ist.join(',') || '(keine)'}\n     erwartet: ${soll.join(',') || '(keine)'}`);
    continue;
  }
  verlinkte += ist.length;
}
if (verlinkFehler > 5) fehler.push(`G5 VERLINKUNG: … und ${verlinkFehler - 5} weitere.`);
// Anti-Vakuum (wie G3): ein Tor, das nichts geprüft hat, ist keine Aussage.
if (verlinkGeprueft < mitRichter * G3_MINDEST) {
  fehler.push(
    `G5 VAKUUM: nur ${verlinkGeprueft} von ${mitRichter} Einträgen auf Verlinkung geprüft `
    + `(< ${(G3_MINDEST * 100).toFixed(0)} %) — der Nachweis wäre wertlos.`,
  );
}

// ── G4 Abdeckung (Schwellen) ──
const proKorpus = new Map<string, { mit: number; total: number }>();
for (const e of manifest.entscheide) {
  if (e.datei === null) continue;   // Verweis-Einträge tragen keine eigene Besetzung
  const k = e.gerichtstyp === 'kantonal' ? `${e.kanton}` : 'Bund';
  const v = proKorpus.get(k) ?? { mit: 0, total: 0 };
  proKorpus.set(k, v);
  v.total++;
  if (e.richter?.length) v.mit++;
}
const SCHWELLE: Record<string, number> = { BS: 95, Bund: 90 };
for (const [k, v] of proKorpus) {
  const quote = v.total ? (v.mit / v.total) * 100 : 0;
  const min = SCHWELLE[k];
  const zeile = `${k}: ${v.mit}/${v.total} (${quote.toFixed(1)} %)`;
  if (min !== undefined && quote < min) fehler.push(`G4 ABDECKUNG unter Schwelle — ${zeile}, erwartet ≥ ${min} %.`);
  else console.log(`[check:besetzung]   ${zeile}${min !== undefined ? ` (Schwelle ≥ ${min} %)` : ''}`);
}

// ── Kollisions-Report (WARN) ──
for (const z of kanon.kollisionen) warnung.push(z);

// ── Ausgabe ──
console.log(`[check:besetzung] Register: ${geprueft} Slugs · Manifest: ${mitRichter} Entscheide mit Spruchkörper`);
console.log(`[check:besetzung] Determinismus: ${verglichen} Einträge verglichen, ${abweichungen} Abweichungen`);
console.log(`[check:besetzung] Fidelity-Stichprobe: ${treffer}/${stichprobe} Nachnamen im amtlichen Freitext belegt`);
console.log(`[check:besetzung] Verlinkung: ${verlinkGeprueft} Rubra geprüft, ${verlinkte} Links, ${verlinkFehler} Fehlzuordnungen`);
if (warnung.length) {
  console.log(`[check:besetzung] Kollisions-Report (${warnung.length}) — Sichtung, kein Blocker:`);
  for (const w of warnung) console.log(`    · ${w}`);
}
if (fehler.length) {
  console.error(`\n[check:besetzung] ROT — ${fehler.length} Befund(e):`);
  for (const f of fehler) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('[check:besetzung] GRÜN — kein Anonymisierungs-Leck, Projektion deterministisch, Abdeckung über Schwelle.');
