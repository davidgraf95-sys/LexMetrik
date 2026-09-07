/**
 * scripts/normtext/check-zh-randtitel.ts — «die ZH-Randtitel und die
 * ZH-Gliederung stehen so im amtlichen PDF» (Wächter zu R1).
 *
 * ANLASS (2.9.2026): Bis zur R1-Runde verwarf der ZH-Weg die Marginalienspalte
 * und die Gliederungs-Überschriften. Der Gegenprüfungs-Befund B2 zu PR #614
 * wies drei Randtitel namentlich nach («Im Allgemeinen» zu ZH-281 § 1,
 * «Auftrag» zu ZH-631.51 § 1, «Inkrafttreten» zu ZH-231.1 § 24) — geführt
 * wurden sie nirgends, `public/normtext/struktur/kanton/` enthielt 0 ZH-Dateien.
 * Mit den Sidecars entsteht ein neuer stiller Fehlerweg: ein Randtitel kann am
 * FALSCHEN § landen, ohne dass irgendein bestehendes Tor das sieht — die
 * Snapshots bleiben dabei byte-gleich, `check:zh-vollstaendigkeit` prüft nur
 * den Normtext, und Golden deckt `struktur/**` nicht ab.
 *
 * DIE PRÜFUNGEN
 *   [artefakt] 1. KEINE ERFINDUNG. Jeder Sidecar-Token steht im Snapshot.
 *   [artefakt] 2. FORM. Höchstens ein Randtitel je §, nie leer, nie nur
 *                 Interpunktion, nie länger als RANDTITEL_MAX_ZEICHEN.
 *   [artefakt] 3. KEIN NORMTEXT IN DER RANDSPALTE. Ein Randtitel, der selbst
 *                 ein §-/Art.-Kopf ist oder auf einem Trennstrich endet, ist
 *                 verrutschter Body-Text, keine Randnote.
 *   [artefakt] 4. GLIEDERUNG LÜCKENLOS. Die Ebenen eines Pfads sind 1..n.
 *   [artefakt] 5. MESSREIHE. Deckung je Erlass gegen die eingefrorene Tabelle
 *                 `zh-randtitel-deckung.json`. Fängt jede Regression, die die
 *                 Zahlen bewegt — auch die, die keine der Formprüfungen sieht.
 *   [pdf]      6. ZWEITLESUNG. Jeder Randtitel wird UNABHÄNGIG aus dem
 *                 Roh-PDF neu gehoben und wörtlich gegen das Sidecar gehalten.
 *
 * UNABHÄNGIGKEIT (§6.7 lit. d): Prüfung 6 teilt mit dem Produktionsweg keine
 * Zeile Code — nicht `istZhMarginalie`, nicht `sammleZhRandbloecke`, nicht
 * `baueZhSidecar`. Drei Modellentscheide teilt sie bewusst und deklariert:
 *   · dass die Randspalte an der SCHRIFTHÖHE hängt (hier <= 7.7 pt),
 *   · dass ein Randtitel auf der Grundlinie seines Kopfes steht,
 *   · dass ein Trennstrich am Zeilenende einen Umbruch auflöst, ein Binde-
 *     oder Ergänzungsstrich aber stehen bleibt.
 *   · dass eine Fragment-Lücke ab ~0.2 pt ein Leerzeichen ist (die Klassen
 *     liegen bei <= 0.07 und >= 0.39 pt, gemessen an allen 111 PDF).
 * Alles Übrige ist anders gebaut: die Body-Spalte über den MODUS der x-Werte
 * statt über deren Minimum, die Kopf-Erkennung über eine eigene, hier notierte
 * Form, die Zeilen- und Blockbildung in eigenem Code.
 *
 * AUFRUF
 *   npm run check:zh-randtitel                # Prüfungen 1-6 (Roh-PDF-Cache)
 *   npm run check:zh-randtitel -- --artefakt  # nur 1-5 (kein PDF, CI)
 *   npm run check:zh-randtitel -- 281         # nur dieser Erlass
 *
 * §2: deterministisch (kein Date.now, kein Math.random, kein Netz).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { sammleZhPdfInventar } from './inventar-kanton.ts';
import { leseCache } from './zh-pdf-cache.ts';

const argumente = process.argv.slice(2);
const nurArtefakt = argumente.includes('--artefakt');
const nurNummern = argumente.filter((a) => !a.startsWith('--'));

const SIDECARS = 'public/normtext/struktur/kanton';
const SNAPSHOTS = 'public/normtext/kanton';
const MESSREIHE = 'scripts/normtext/zh-randtitel-deckung.json';

/** Längster Randtitel im geprüften Bestand: 149 Zeichen (ZH-631.1, die
 *  Gesellschafts-Aufzählung). Der Deckel liegt bei 220 — er fängt den Fall
 *  «ein ganzer Absatz ist in die Randspalte gerutscht», ohne den amtlichen
 *  Bestand zu beschneiden. */
const RANDTITEL_MAX_ZEICHEN = 220;

/** Ein §-/Art.-Kopf am Anfang eines RANDTITELS ist immer ein Fehler: die
 *  Randspalte trägt Sachtitel, nie Normtext-Köpfe. Bewusst eigene, engere Form
 *  als PARAGRAF_KOPF (Prüfung 3 soll den verrutschten Body finden, nicht die
 *  Norm-Zitate «b. Der nach § 40 fehlbaren Gemeinde», die MITTEN im Titel
 *  stehen dürfen). */
const KOPF_AM_ANFANG = /^(?:§\s*\d+|Art\.\s*\d+)\s*[.\s]/;
/** Ab welcher Fragment-Lücke (pt) die Zweitlesung ein Leerzeichen annimmt.
 *  Eigener Wert, aus derselben Messung wie der Produktionsweg gewählt, aber am
 *  anderen Ende des leeren Bandes: dort 0.25, hier 0.2 (Klebung <= 0.07,
 *  Wortlücke >= 0.39). Ein Fehler, der die Schwelle über 0.39 oder unter 0.07
 *  schöbe, wird von beiden Seiten gefangen. */
const ZWEIT_LUECKE_PT = 0.2;


interface SidecarArtikel {
  gliederung: { ebene: number; label: string }[];
  marginalie: string[];
}
interface SidecarDatei {
  artikel: Record<string, SidecarArtikel>;
}
interface SnapshotDatei {
  eintraege: { artikel: string }[];
}
interface Messwert {
  paragrafen: number;
  randtitel: number;
  gliederung: number;
}

const fehler: string[] = [];
const melde = (s: string): void => {
  fehler.push(s);
  console.error(`  FEHLER  ${s}`);
};

const messreihe: Record<string, Messwert> = existsSync(MESSREIHE)
  ? (JSON.parse(readFileSync(MESSREIHE, 'utf8')) as Record<string, Messwert>)
  : {};
const gemessen: Record<string, Messwert> = {};

// ── Die zu prüfenden Erlasse: alle ZH-Sidecars ──────────────────────────────
const inventar = new Map<string, string>(); // «281» → registryUrl
for (const g of sammleZhPdfInventar()) {
  const nr = (g.erlassNr || '').replace(/^LS\s*/, '').trim();
  if (nr) inventar.set(nr, g.quelleUrl);
}

let geprueft = 0;
let randtitelGesamt = 0;
let zweitGleich = 0;
let zweitGeprueft = 0;

for (const [nr, registryUrl] of [...inventar.entries()].sort((a, b) => a[0].localeCompare(b[0], 'de'))) {
  if (nurNummern.length > 0 && !nurNummern.includes(nr)) continue;
  const key = `ZH-${nr}`;
  const scPfad = join(SIDECARS, `${key}.json`);
  if (!existsSync(scPfad)) continue;
  const sc = JSON.parse(readFileSync(scPfad, 'utf8')) as SidecarDatei;
  geprueft++;

  // ── Prüfung 1: keine Erfindung ────────────────────────────────────────────
  const snapPfad = join(SNAPSHOTS, `${key}.json`);
  if (!existsSync(snapPfad)) {
    melde(`${key}: Sidecar ohne Snapshot — der Erlass ist nicht im Bestand.`);
    continue;
  }
  const snap = JSON.parse(readFileSync(snapPfad, 'utf8')) as SnapshotDatei;
  const bestand = new Set(snap.eintraege.map((e) => e.artikel));
  for (const token of Object.keys(sc.artikel)) {
    if (!bestand.has(token)) melde(`${key} § ${token}: im Sidecar, aber NICHT im Snapshot.`);
  }

  let mitRand = 0;
  let mitGl = 0;
  for (const [token, a] of Object.entries(sc.artikel)) {
    // ── Prüfung 2: Form ─────────────────────────────────────────────────────
    if (a.marginalie.length > 1) {
      melde(`${key} § ${token}: ${a.marginalie.length} Randtitel — je § ist höchstens einer zulässig.`);
    }
    for (const m of a.marginalie) {
      if (m.trim() === '') melde(`${key} § ${token}: leerer Randtitel.`);
      else if (!/[A-Za-zÄÖÜäöü]/.test(m)) melde(`${key} § ${token}: Randtitel ohne Buchstaben (${JSON.stringify(m)}).`);
      else if (m.length > RANDTITEL_MAX_ZEICHEN) {
        melde(`${key} § ${token}: Randtitel ${m.length} Zeichen > ${RANDTITEL_MAX_ZEICHEN} — verrutschter Body-Text? ${JSON.stringify(m.slice(0, 60))}…`);
      }
      // ── Prüfung 3: kein Normtext in der Randspalte ────────────────────────
      if (KOPF_AM_ANFANG.test(m)) {
        melde(`${key} § ${token}: Randtitel beginnt mit einem §-/Art.-Kopf (${JSON.stringify(m.slice(0, 40))}) — Body-Text in der Randspalte.`);
      }
      if (/[-‐‑­]$/.test(m)) {
        melde(`${key} § ${token}: Randtitel endet auf einem Trennstrich (${JSON.stringify(m.slice(-24))}) — abgeschnittener Umbruch.`);
      }
      if (m !== m.trim() || /\s{2,}/.test(m)) {
        melde(`${key} § ${token}: Randtitel mit ungeputztem Weissraum (${JSON.stringify(m)}).`);
      }
    }
    if (a.marginalie.length > 0) mitRand++;

    // ── Prüfung 4: Gliederung lückenlos ─────────────────────────────────────
    if (a.gliederung.length > 0) {
      mitGl++;
      a.gliederung.forEach((g, i) => {
        if (g.ebene !== i + 1) {
          melde(`${key} § ${token}: Gliederungsebene ${g.ebene} an Position ${i + 1} — der Pfad muss 1..n zählen.`);
        }
        if (g.label.trim() === '') melde(`${key} § ${token}: leeres Gliederungs-Label auf Ebene ${g.ebene}.`);
      });
    }
  }
  randtitelGesamt += mitRand;
  gemessen[key] = { paragrafen: bestand.size, randtitel: mitRand, gliederung: mitGl };

  // ── Prüfung 5: Messreihe ──────────────────────────────────────────────────
  const soll = messreihe[key];
  if (!soll) {
    melde(`${key}: keine Messreihe hinterlegt — 'npm run normtext:struktur-zh -- --datum=… --messreihe' schreibt sie.`);
  } else {
    for (const feld of ['paragrafen', 'randtitel', 'gliederung'] as const) {
      if (soll[feld] !== gemessen[key][feld]) {
        melde(`${key}: ${feld} ${gemessen[key][feld]} statt ${soll[feld]} (Messreihe). Absicht? Dann Messreihe mitregenerieren.`);
      }
    }
  }

  if (nurArtefakt) continue;

  // ── Prüfung 6: unabhängige Zweitlesung aus dem Roh-PDF ────────────────────
  const quelle = leseCache(registryUrl);
  if (!quelle) {
    melde(`${key}: Roh-PDF-Cache leer — 'npm run zh:cache' füllt ihn (oder --artefakt nutzen).`);
    continue;
  }
  const zweit = await zweitlesungRandtitel(quelle.bytes.slice());
  for (const [token, a] of Object.entries(sc.artikel)) {
    const meins = a.marginalie[0];
    if (meins === undefined) continue;
    const seins = zweit.get(token);
    zweitGeprueft++;
    if (seins === undefined) {
      melde(`${key} § ${token}: Zweitlesung findet KEINEN Randtitel, das Sidecar führt ${JSON.stringify(meins)}.`);
      continue;
    }
    if (vergleichbar(seins) !== vergleichbar(meins)) {
      melde(`${key} § ${token}: Sidecar ${JSON.stringify(meins)} ≠ Zweitlesung ${JSON.stringify(seins)}.`);
      continue;
    }
    zweitGleich++;
  }
}

for (const k of Object.keys(messreihe)) {
  if (nurNummern.length === 0 && !(k in gemessen)) {
    melde(`${k}: in der Messreihe geführt, aber kein Sidecar vorhanden.`);
  }
}

console.log(
  `\ncheck:zh-randtitel — ${geprueft} Sidecar(s) · ${randtitelGesamt} Randtitel` +
    (nurArtefakt
      ? ' · Prüfungen 1-5 (Artefakt)'
      : ` · Zweitlesung ${zweitGleich}/${zweitGeprueft} wörtlich gleich`),
);
if (fehler.length > 0) {
  console.error(`\n${fehler.length} Fehler.`);
  process.exit(1);
}
console.log('alles grün.');

// ══════════════════════════════════════════════════════════════════════════
// ZWEITLESUNG — eigenständig, teilt mit dem Produktionsweg keine Zeile Code.
// ══════════════════════════════════════════════════════════════════════════

/**
 * Weissraum-Klasse einebnen, BEVOR verglichen wird. Der Produktionsweg
 * REKONSTRUIERT das Leerzeichen aus der Fragment-Lücke (pdfjs liefert die
 * Fragmente an der Wortgrenze getrennt, das Zeichen selbst ist da nicht mehr
 * ablesbar) — ob im Druckbild ein normales oder ein geschütztes Leerzeichen
 * steht, kann er also gar nicht wissen. Der WORTLAUT wird verglichen, nicht die
 * Leerzeichen-Klasse; jede andere Abweichung bleibt sichtbar.
 */
function vergleichbar(s: string): string {
  return s.replace(/[\s\u00a0\u202f]+/g, ' ').trim();
}

interface RohStueck {
  x: number;
  y: number;
  h: number;
  w: number;
  s: string;
}


/**
 * Hebt die Randtitel eines ZH-PDF ein zweites Mal — mit einem anderen
 * Spalten-, Kopf- und Zuordnungsmodell als der Produktionsweg (s. Kopf).
 */
async function zweitlesungRandtitel(bytes: Uint8Array): Promise<Map<string, string>> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: bytes, useSystemFonts: true }).promise;
  const ergebnis = new Map<string, string>();

  for (let p = 1; p <= doc.numPages; p++) {
    const seite = await doc.getPage(p);
    const inhalt = await seite.getTextContent();
    const stuecke: RohStueck[] = [];
    for (const it of inhalt.items) {
      const i = it as { str: string; transform: number[]; height?: number };
      if (!i.str || i.str.trim() === '') continue;
      const y = i.transform[5];
      if (y < 60 || y > 530) continue; // Kopf-/Fussband
      const h = i.height ?? 9;
      if (h >= 11) continue; // Erlasstitel
      stuecke.push({ x: i.transform[4], y, h, w: (i as { width?: number }).width ?? 0, s: i.str });
    }
    const body = stuecke.filter((s) => s.h >= 8.7);
    if (body.length === 0) continue;

    // ANDERES SPALTEN-MODELL: der MODUS der Body-x — die x-Position, an der die
    // meisten Body-Fragmente beginnen, also der linke Rand des Satzspiegels.
    // Der Produktionsweg nimmt das MINIMUM.
    //
    // WARUM NICHT DER MEDIAN (erster Versuch, 2.9.2026 verworfen): auf
    // Tabellenseiten zieht die eingerückte Spalte den Median weit nach rechts
    // (ZH-631.11 S. 5: min 53.8, Modus 54, Median 161.6) — das Randfenster
    // rutschte mit und verlor die sechs Randtitel der §§ 22-27. Der Modus ist
    // über alle Seiten stabil (Modus = min ± 0.2 in jedem gemessenen Fall).
    const zaehler = new Map<number, number>();
    for (const b of body) {
      const k = Math.round(b.x);
      zaehler.set(k, (zaehler.get(k) ?? 0) + 1);
    }
    let modus = 0;
    let beste = -1;
    for (const [x, n] of [...zaehler.entries()].sort((a, b) => a[0] - b[0])) {
      if (n > beste) {
        beste = n;
        modus = x;
      }
    }
    const istRand = (s: RohStueck): boolean =>
      s.h <= 7.7 && s.h > 7.0 && (s.x < modus - 3 || s.x > modus + 250);

    // Randspalten-Zeilen. Die SICHEREN Stuecke zuerst (Randnoten-Grundschrift),
    // danach die Hochstellungen — aber nur solche, die im x-Fenster der schon
    // gefundenen Randspalte UND in Grundlinien-Naehe einer sicheren Zeile
    // liegen. Anders konstruiert als der Produktionsweg (der die Hochstellung
    // ueber eine reine Δy-Regel an die naechste Zeile darunter haengt), und
    // noetig aus demselben Grund: der lateinische Suffix «314a^bis» (ZH-232.35
    // § 7) steht auf eigener, hoeherer Grundlinie.
    const sicher = stuecke.filter(istRand);
    const randZeilen = new Map<number, RohStueck[]>();
    for (const s of sicher) {
      const k = Math.round(s.y);
      const liste = randZeilen.get(k);
      if (liste) liste.push(s);
      else randZeilen.set(k, [s]);
    }
    if (sicher.length > 0) {
      const randMinX = Math.min(...sicher.map((s) => s.x));
      const randMaxX = Math.max(...sicher.map((s) => s.x + s.w));
      const sichereY = [...randZeilen.keys()];
      for (const s of stuecke) {
        if (s.h > 7.0) continue;
        if (/^[\s,\d]+$/.test(s.s)) continue; // Fussnoten-Verweis, kein Titel
        if (s.x < randMinX - 2 || s.x > randMaxX + 40) continue;
        const traeger = sichereY
          .filter((y) => Math.round(s.y) - y > 0 && Math.round(s.y) - y <= 5)
          .sort((a, b) => b - a)[0];
        if (traeger === undefined) continue;
        randZeilen.get(traeger)!.push(s);
      }
    }
    // Body-Zeilen, und welche davon ein Kopf ist
    const bodyZeilen = new Map<number, RohStueck[]>();
    for (const s of stuecke.filter((x) => x.h >= 8.7)) {
      const k = Math.round(s.y);
      const liste = bodyZeilen.get(k);
      if (liste) liste.push(s);
      else bodyZeilen.set(k, [s]);
    }
    const koepfe = new Map<number, string>();
    for (const [y, gr] of bodyZeilen) {
      const txt = gr
        .sort((a, b) => a.x - b.x)
        .map((s) => s.s)
        .join('')
        .trim();
      // EIGENE Kopf-Form (nicht PARAGRAF_KOPF/ARTIKEL_KOPF importiert).
      const m = txt.match(/^(?:§\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?\s*\.|Art\.\s*(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?)/);
      if (!m) continue;
      const teile = [m[1] ?? m[4], m[2] ?? m[5], m[3] ?? m[6]].filter(Boolean) as string[];
      koepfe.set(y, teile.map((t) => t.toLowerCase()).join('_'));
    }
    if (koepfe.size === 0 || randZeilen.size === 0) continue;

    const sortiert = [...randZeilen.keys()].sort((a, b) => b - a);
    const zeilenText = (y: number): string => {
      const gr = randZeilen.get(y)!.sort((a, b) => a.x - b.x);
      let out = '';
      let ende: number | null = null;
      for (const s of gr) {
        if (ende !== null && s.x - ende >= ZWEIT_LUECKE_PT && !/^[.,;:!?)\]]/.test(s.s)) out += ' ';
        out += s.s;
        ende = s.x + s.w;
      }
      return out.replace(/\s+/g, ' ').trim();
    };

    // Blöcke: Zeilenabstand <= 12 pt gehört zusammen.
    let lauf: number[] = [];
    const bloecke: number[][] = [];
    for (const y of sortiert) {
      if (lauf.length === 0 || lauf[lauf.length - 1] - y <= 12) lauf.push(y);
      else {
        bloecke.push(lauf);
        lauf = [y];
      }
    }
    if (lauf.length > 0) bloecke.push(lauf);

    for (const bl of bloecke) {
      const anker = bl[0];
      let treffer: number | null = null;
      for (const y of koepfe.keys()) {
        if (Math.abs(y - anker) <= 2 && (treffer === null || Math.abs(y - anker) < Math.abs(treffer - anker))) {
          treffer = y;
        }
      }
      if (treffer === null) continue;
      let txt = '';
      for (const y of bl) {
        const teil = zeilenText(y);
        if (teil === '' || /^[\s,\d]+$/.test(teil)) continue;
        if (txt === '') txt = teil;
        else if (!/[-‐‑­]$/.test(txt)) txt = `${txt} ${teil}`;
        else if (/^\p{Lu}/u.test(teil)) txt = txt + teil; // Bindestrich im Kompositum
        else if (/^(?:und|oder|bzw\.|sowie|wie|beziehungsweise)\b/.test(teil)) txt = `${txt} ${teil}`;
        else txt = txt.slice(0, -1) + teil; // Trennstrich
      }
      if (txt === '') continue;
      const token = koepfe.get(treffer)!;
      if (!ergebnis.has(token)) ergebnis.set(token, txt);
    }
  }
  return ergebnis;
}
