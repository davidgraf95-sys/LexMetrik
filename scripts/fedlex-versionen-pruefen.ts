// ─── Fedlex-Versions-Monitoring: erkennen, wenn gepinnte Stände veralten ────
//
// fedlex-cache.sh prüft nur, ob die GEPINNTEN Konsolidierungen abrufbar sind
// und die Pflicht-Anker enthalten — es erkennt NICHT, wenn Fedlex eine
// neuere (oder angekündigte künftige) Konsolidierung publiziert hat.
// Dieses Skript schliesst die Lücke per SPARQL (amtlicher Endpoint):
//
//   je gepinntem ELI alle jolux:Consolidation-Daten (dateApplicability)
//   → neueste GELTENDE Konsolidierung (≤ heute)  vs.  gepinnter Stand
//   → ANGEKÜNDIGTE künftige Fassungen (> heute) als Vorwarnung
//
// SSoT §5: Die Liste der Gesetze/Pins wird aus scripts/fedlex-cache.sh
// geparst — sie wird hier NICHT dupliziert.
//
//   npm run check:fedlex-versionen
//
// Exit 1 → mindestens ein Pin ist ÜBERHOLT (neuere geltende Konsolidierung
//          existiert): Caches neu pinnen, Anker/Wortlaute neu verifizieren
//          (§7), Quellen-Register nachführen.
// Exit 0 → alle Pins aktuell; künftige Fassungen nur als HINWEIS.
// Exit 2 → Endpoint/Netz-Fehler (keine Aussage möglich).
// SSoT §5: die Pin-Liste wird aus scripts/fedlex-cache.sh geparst — die
// Parse-Logik liegt einmal in scripts/fedlex-pins.ts (auch vom Gegenprüfungs-Tor genutzt).
import { lesePins, lesePinsVoll, type Pin } from './fedlex-pins';
import { loeseHtmlManifeste } from './fedlex-manifest';
import { PDF_EMBED_QUELLEN } from '../src/lib/normtext/pdf-embed.ts';

const ENDPOINT = 'https://fedlex.data.admin.ch/sparqlendpoint';

// P1-b (QS-CURRENCY): die 'pdf-embed'-Erlasse (EMRK, NYÜ) waren im Versions-
// Monitoring strukturell blind — check:fedlex-versionen sah nur lesePins()
// (cache.sh). Zweite Quelle additiv aus PDF_EMBED_QUELLEN (trägt eli+kons als
// YYYYMMDD) in dieselbe SPARQL-Currency-Prüfung mergen; die Filestore-Integrität
// bleibt zusätzlich in check:pdf(-netz). lesePins()-Signatur unverändert
// (auch vom Gegenprüfungs-Tor genutzt).
function lesePdfEmbedPins(): Pin[] {
  return PDF_EMBED_QUELLEN.map((q) => ({
    name: `${q.key.toLowerCase()} [pdf-embed]`,
    eli: q.eli,
    kons: `${q.kons.slice(0, 4)}-${q.kons.slice(4, 6)}-${q.kons.slice(6, 8)}`,
  }));
}

async function frageKonsolidierungen(pins: Pin[]): Promise<Map<string, string[]>> {
  const werte = pins.map((p) => `<https://fedlex.data.admin.ch/eli/${p.eli}>`).join(' ');
  const query = `
PREFIX jolux: <http://data.legilux.public.lu/resource/ontology/jolux#>
SELECT ?abstract ?date WHERE {
  VALUES ?abstract { ${werte} }
  ?c jolux:isMemberOf ?abstract ; jolux:dateApplicability ?date .
}`;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/sparql-results+json',
    },
    body: `query=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`SPARQL-Endpoint antwortet ${res.status}`);
  const json = (await res.json()) as {
    results: { bindings: { abstract: { value: string }; date: { value: string } }[] };
  };
  const map = new Map<string, string[]>();
  for (const b of json.results.bindings) {
    const eli = b.abstract.value.replace('https://fedlex.data.admin.ch/eli/', '');
    const liste = map.get(eli) ?? [];
    liste.push(b.date.value.slice(0, 10));
    map.set(eli, liste);
  }
  for (const liste of map.values()) liste.sort();
  return map;
}

// ─── Lauf ────────────────────────────────────────────────────────────────────
const cachePins = lesePins();
if (cachePins.length === 0) {
  console.error('FEHLER: keine EINTRAEGE in scripts/fedlex-cache.sh gefunden (Format geändert?).');
  process.exit(2);
}
// cache.sh-Pins UND PDF-Embed-Pins gemeinsam prüfen (DoD: beide Pin-Quellen).
const pins = [...cachePins, ...lesePdfEmbedPins()];

const jetzt = new Date();
const heute = `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, '0')}-${String(jetzt.getDate()).padStart(2, '0')}`;

let konsolidierungen: Map<string, string[]>;
try {
  konsolidierungen = await frageKonsolidierungen(pins);
} catch (e) {
  console.error(`FEHLER: Fedlex-SPARQL nicht erreichbar (${e instanceof Error ? e.message : e}) — keine Aussage möglich.`);
  process.exit(2);
}

let ueberholt = 0;
let angekuendigt = 0;

console.log(`Fedlex-Versions-Monitoring: ${pins.length} gepinnte Gesetze (${cachePins.length} cache.sh + ${pins.length - cachePins.length} pdf-embed; heute: ${heute})\n`);
for (const pin of pins) {
  const daten = konsolidierungen.get(pin.eli);
  if (!daten || daten.length === 0) {
    // Kein Treffer kann auch heissen: ELI-Schreibweise weicht ab → laut melden.
    console.log(`FEHLER     ${pin.name}: keine Konsolidierungen via SPARQL gefunden (ELI ${pin.eli} prüfen!)`);
    ueberholt++;
    continue;
  }
  const geltend = daten.filter((d) => d <= heute);
  const kuenftig = daten.filter((d) => d > heute);
  const neuesteGeltende = geltend[geltend.length - 1] ?? '(keine)';

  if (neuesteGeltende > pin.kons) {
    console.log(`ÜBERHOLT   ${pin.name}: gepinnt ${pin.kons}, geltend ist ${neuesteGeltende} → neu pinnen + §7-Verifikation!`);
    ueberholt++;
  } else if (kuenftig.length > 0) {
    console.log(`HINWEIS    ${pin.name}: gepinnt ${pin.kons} (aktuell) — künftige Fassung(en) angekündigt: ${kuenftig.join(', ')}`);
    angekuendigt++;
  } else {
    console.log(`OK         ${pin.name}: gepinnt ${pin.kons} = neueste Konsolidierung`);
  }
}

// ─── P1-a/b Kanonik-Arbiter: gepinntes html-N == kanonische isExemplifiedBy ──
// Der Datums-Check oben erkennt eine NEUERE Konsolidierung, aber NICHT, wenn ein
// Pin auf einer nicht-kanonischen html-Manifestation (Alias-URL / veraltete
// Revision) desselben Datums klebt (Querschnitts-Wurzel: Alt-Generations-Dumps
// + Soft-404-Shells). Darum je cache.sh-Pin das kanonische html-N via
// isExemplifiedBy auflösen und gegen das gepinnte n prüfen. Fedlex re-issued
// dieselbe Konsolidierung (Fussnoten/Soft-Hyphen), das -N inkrementiert → ein
// Pin unter der neuesten Revision ist die einzige treue Fassung (§7).
const vollPins = lesePinsVoll();
let unkanonisch = 0;
try {
  const manifeste = await loeseHtmlManifeste(vollPins);
  console.log('\n── Kanonik-Arbiter (html-N vs. isExemplifiedBy) ──');
  for (const p of vollPins) {
    const b = manifeste.get(p.name);
    if (!b || b.n === null) continue; // keine html-Manifestation → Alias+Sonde, s. cache.sh
    if (b.n !== p.n) {
      console.log(`NICHT-KANONISCH  ${p.name}: gepinnt html-${p.n}, kanonisch html-${b.n} (${b.file}) → re-pinnen (fedlex-repin-kanonik.ts) + regenerieren!`);
      unkanonisch++;
    }
  }
  if (unkanonisch === 0) console.log('Alle Pins docken an der kanonischen html-Manifestation (isExemplifiedBy).');
} catch (e) {
  console.error(`FEHLER: Kanonik-Auflösung (isExemplifiedBy) nicht möglich (${e instanceof Error ? e.message : e}).`);
  process.exit(2);
}

console.log('');
if (ueberholt > 0 || unkanonisch > 0) {
  if (ueberholt > 0) console.log(`${ueberholt} Pin(s) überholt oder unauffindbar — Caches/Quellen-Register nachführen, betroffene Anker und Wortlaute neu verifizieren (§7).`);
  if (unkanonisch > 0) console.log(`${unkanonisch} Pin(s) nicht-kanonisch (html-N ≠ isExemplifiedBy) — Alias-/Alt-Revisions-Wurzel: re-pinnen + Snapshots/Struktur regenerieren.`);
  process.exit(1);
}
if (angekuendigt > 0) {
  console.log(`Alle Pins aktuell. ${angekuendigt} Gesetz(e) mit ANGEKÜNDIGTEN künftigen Fassungen — Inkrafttreten im Verfallsregister/Gesetzgebungs-Monitoring einplanen.`);
} else {
  console.log('Alle Pins aktuell, keine künftigen Fassungen angekündigt.');
}
