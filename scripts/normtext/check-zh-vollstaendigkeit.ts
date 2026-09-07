/**
 * scripts/normtext/check-zh-vollstaendigkeit.ts — «der ZH-Snapshot enthält, was
 * im amtlichen PDF steht».
 *
 * ANLASS (31.8.2026, Runde 1): Die adversariale Gegenprüfung der ZH-Kern-
 * Tranche fand fünf Klassen von stillem Textverlust, die kein bestehendes Tor
 * sehen konnte. Alle Tore prüften bis dahin nur die INNERE Stimmigkeit des
 * Artefakts (Struktur, Parität, Manifest, Golden) oder die Erreichbarkeit der
 * Quelle. Keines hielt den Snapshot gegen das PDF.
 *
 * HÄRTUNG 1 (Runde 2): Prüfungen 4–7 gegen den COMMON MODE — die Zweitlesung
 * trug dieselben blinden Flecken wie der Adapter, die Mengengleichheit war
 * trügerisch grün.
 *
 * HÄRTUNG 2 (Runde 3, diese Fassung): Die ZWEITE Prüf-Linse hat elf Mutationen
 * gebaut, die auch nach Härtung 1 grün durchliefen. Sie zerfallen in fünf
 * Klassen, und jede bekommt hier ihre Prüfung:
 *
 *   · WERT AN DER FALSCHEN STELLE (M6b Tausch «1 050»↔«3 150», M6c 14 %→8 %,
 *     M6d Staffelgrenze). Prüfung 7 fragte nur «steht die Zahl IRGENDWO im
 *     PDF?» — bei einem Tausch innerhalb derselben Tabelle lautet die Antwort
 *     immer ja. NEU: Prüfung 7b bindet jede Zahl an ihre §-REGION und an ihre
 *     STELLE (Teilfolge-Vergleich, beidseitig).
 *   · TEXT WEG (M3 gelöschter Absatz, M11 `bloecke: []`, M12 Kappung ohne
 *     Trennstrich). NEU: Prüfung 7c, Zeichen-Deckungsgrad je §-Region.
 *   · ANHANG UNBEWACHT (M13, 40 gelöschte Tarif-Ziffern). `paragrafTokens`
 *     filterte jeden Token mit Punkt heraus — 118 von 150 ZH-243-Einträgen
 *     waren von KEINER Kopf-Prüfung erfasst. NEU: Prüfung 8, beidseitig exakt.
 *   · ERFINDUNG (M14 «§ 77 b» in einer Sammel-Spanne). Die Spannen-Nachsicht
 *     galt für jeden Eintrag; jetzt nur noch für den deklarierten Platzhalter.
 *   · KAPPUNGS-VARIANTEN (M9b U+2011, M9c Kappung nach einer Ziffer). Prüfung 3
 *     kannte nur Buchstabe + ASCII-Bindestrich.
 *   · lit.-SCHWELLE (M8a, ein gelöschtes lit. bei 99 % ≥ 95 %). Die Quote je
 *     ERLASS ist durch EXAKTE Deckung je § ersetzt — am geheilten Bestand
 *     0 Abweichungen in 2656 §§, also ohne eine einzige Ausnahme.
 *
 * DIE ELF PRÜFUNGEN
 *   1. §-/Art.-MENGE EXAKT, beidseitig.
 *   2. lit.-DECKUNG EXAKT je §.
 *   3. KEIN BLOCK ENDET AUF EINEM TRENNSTRICH (vier Codepoints).      [artefakt]
 *   4. §§-SAMMELKÖPFE — jeder genannte § steht im Snapshot.
 *   5. SUFFIX-ABSÄTZE («2bis») stehen im `absatz`-Feld ihres §.
 *   6. KEIN GLIEDERUNGSTITEL IM NORMTEXT.                             [artefakt]
 *   7. WERTE-WÄCHTER GLOBAL — jede Snapshot-Ziffernfolge steht im PDF.
 *   7b. ZAHLENFOLGE JE §-REGION, beidseitig und positionsgebunden.
 *   7c. ZEICHEN-DECKUNGSGRAD JE §-REGION (untere Schranke).
 *   8. ANHANG-PUNKT-ZIFFERN beidseitig exakt.
 *   9. EINHEITEN-EXPONENTEN («m²») je § beidseitig exakt (Runde 4, B1).
 *
 * UNABHÄNGIGKEIT (§6.7 lit. d): Die Zweitlesung teilt mit dem Produktions-
 * Adapter keine Zeile Code. Drei Modellentscheide teilt sie bewusst und
 * deklariert — die Body-Spalte, die Grenze zum Schlussapparat und (seit
 * Härtung 2) die Aussage «eine Überschrift steht in der Titel-Schrift».
 * Die Folgen des dritten sind im Kopf von `zh-zweitlesung.ts` ausgeschrieben:
 * die Regionen prüfen NICHT, ob Überschrift und Aufzählung richtig getrennt
 * wurden — das leisten Prüfung 6 und die beidseitigen Unit-Tests am Adapter.
 *
 * AUFRUF
 *   npm run check:zh-vollstaendigkeit                # Cache, sonst Netz
 *   npm run check:zh-vollstaendigkeit -- --offline   # NUR Roh-PDF-Cache
 *   npm run check:zh-vollstaendigkeit -- --netz      # Quelle frisch holen
 *   npm run check:zh-vollstaendigkeit -- --artefakt  # nur 3 + 6 (kein PDF)
 *   npm run check:zh-vollstaendigkeit -- 175.2       # nur dieser Erlass
 *
 * Netz-Disziplin: dieselbe Registry→OpenAttachment→PDF-Kette wie der Import,
 * seriell mit ~1 s Abstand, UA mit Kontaktadresse — und seit O1 nur dann,
 * wenn der Roh-PDF-Cache den Erlass nicht hat.
 *
 * §2: deterministisch (kein Date.now, kein Math.random).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { leseAttachmentUrl, loeseRedirect } from './adapter-zh-pdf.ts';
import { fetchMitWiederholung } from './netz-retry.ts';
import { holeZhQuelle, type CacheModus } from './zh-pdf-cache.ts';
import { leseZweit, GLIEDERUNG_IM_TEXT } from './zh-zweitlesung.ts';
import {
  eintragMass,
  exponentTokens,
  istPlatzhalterEintrag,
  istTeilfolge,
  pruefeZahlen,
  snapshotTexte,
  trennstrichEnden,
  zeichenQuote,
  ZAHLENFOLGE_AUSNAHMEN,
  ZEICHEN_MIN,
  type TorEintrag,
} from './zh-tor-regeln.ts';

/**
 * Snapshot-Verzeichnis. Über `ZH_SNAPSHOT_DIR` umlenkbar — NICHT als Feature,
 * sondern damit die Mutationsproben (§6.7: jede Prüfung einmal ROT zeigen) auf
 * einer KOPIE laufen können. Die Skill-Regel verbietet, Artefakte im Arbeitsbaum
 * zu mutieren und danach per `git checkout` zurückzuholen; eine Sandbox-Kopie
 * ist der vorgeschriebene Weg.
 */
const SNAPSHOT_DIR = process.env.ZH_SNAPSHOT_DIR ?? 'public/normtext/kanton';
const UA = 'LexMetrik-Import/1.0 (kontakt: david.graf95@gmail.com)';
const ABSTAND_MS = 1100;

// ── Snapshot-Seite ───────────────────────────────────────────────────────────

function ladeSnapshot(pfad: string): { eintraege: TorEintrag[] } {
  return JSON.parse(readFileSync(pfad, 'utf8')) as { eintraege: TorEintrag[] };
}

/** §-/Art.-Einträge (ohne Anhang-Ziffern — die prüft Prüfung 8). */
function paragrafTokens(eintraege: TorEintrag[]): string[] {
  return eintraege
    .map((e) => String(e.artikel ?? ''))
    .filter((t) => t !== '' && !t.includes('.') && !t.startsWith('anhang_'));
}

/** Anhang-Einträge mit Punkt-Ziffer («1.2.1») — die ZH-243-Klasse (M13). */
function anhangZifferTokens(eintraege: TorEintrag[]): string[] {
  return eintraege.map((e) => String(e.artikel ?? '')).filter((t) => /^\d+(?:\.\d+)+$/.test(t));
}

function litPositionenJeToken(eintraege: TorEintrag[]): Record<string, number> {
  const raus: Record<string, number> = {};
  for (const e of eintraege) {
    const t = String(e.artikel ?? '');
    let n = 0;
    for (const b of e.bloecke ?? []) {
      for (const i of b.items ?? []) {
        if (typeof i.marke === 'string' && /^[a-z]$/.test(i.marke)) n++;
      }
    }
    if (n > 0) raus[t] = (raus[t] ?? 0) + n;
  }
  return raus;
}

// ── Netz / Cache ─────────────────────────────────────────────────────────────

const schlaf = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function hole(url: string): Promise<Response> {
  await schlaf(ABSTAND_MS);
  return fetchMitWiederholung(url, { headers: { 'User-Agent': UA } });
}

// ── Lauf ─────────────────────────────────────────────────────────────────────

const argumente = process.argv.slice(2);
const nurArtefakt = argumente.includes('--artefakt');
const modus: CacheModus = argumente.includes('--netz')
  ? 'netz'
  : argumente.includes('--offline')
    ? 'offline'
    : 'auto';
const nurNummern = argumente.filter((a) => !a.startsWith('--'));

const dateien = readdirSync(SNAPSHOT_DIR)
  .filter((f) => f.startsWith('ZH-') && f.endsWith('.json'))
  .filter((f) => nurNummern.length === 0 || nurNummern.includes(f.slice(3, -5)))
  .sort();

if (dateien.length === 0) {
  console.error(`check:zh-vollstaendigkeit: keine Snapshots in ${SNAPSHOT_DIR}`);
  process.exit(1);
}

let fehler = 0;
console.log(
  `check:zh-vollstaendigkeit — ${dateien.length} Erlass(e)` +
    (nurArtefakt
      ? ' (--artefakt: nur Trennstrich- und Gliederungstitel-Prüfung, kein PDF)'
      : ` (PDF-Quelle: ${modus})`),
);

for (const datei of dateien) {
  const nr = datei.slice(3, -5);
  const { eintraege } = ladeSnapshot(join(SNAPSHOT_DIR, datei));
  const probleme: string[] = [];

  // 3. Trennstrich-Enden (immer, ohne PDF).
  const abgeschnitten = trennstrichEnden(eintraege);
  if (abgeschnitten.length > 0) {
    probleme.push(
      `${abgeschnitten.length} Block/item endet auf Trennstrich (abgeschnittener Satz): ${[...new Set(abgeschnitten)].slice(0, 6).join(', ')}`,
    );
  }

  // 6. Gliederungstitel im Normtext (immer, ohne PDF) — harter Fehler.
  const gliederungsLeck: string[] = [];
  for (const { label, text } of snapshotTexte(eintraege)) {
    if (GLIEDERUNG_IM_TEXT.test(text)) gliederungsLeck.push(label);
  }
  if (gliederungsLeck.length > 0) {
    probleme.push(
      `${gliederungsLeck.length} Block/item trägt einen Gliederungstitel im Normtext ` +
        `(«N. Kapitel:/Abschnitt:/Teil:/Titel:»): ${[...new Set(gliederungsLeck)].slice(0, 6).join(', ')}`,
    );
  }

  let zusatz = '';
  if (!nurArtefakt) {
    const url = String(eintraege[0]?.quelleUrl ?? '');
    try {
      const quelle = await holeZhQuelle(
        url,
        { hole, leseAttachmentUrl, loeseRedirect },
        modus,
      );
      const zweit = await leseZweit(quelle.bytes.slice());

      // 1. §-/Art.-Menge exakt (beidseitig).
      const imSnapshot = new Set(paragrafTokens(eintraege));
      const imPdf = new Set([...zweit.koepfe, ...zweit.sammelTokens]);
      const jeToken = new Map(eintraege.map((e) => [String(e.artikel ?? ''), e]));
      // Innerhalb einer genannten Sammel-Spanne darf der Snapshot mehr führen,
      // als die konservative Zweitlesung auszählt — aber NUR den deklarierten
      // Platzhalter (Härtung 2, Befund M14: ein erfundener § MIT Wortlaut ging
      // vorher als «Spannen-Auffüllung» durch).
      const alsAuffuellungErlaubt = (t: string): boolean => {
        const n = Number(t.split('_')[0]);
        if (!Number.isFinite(n)) return false;
        if (!zweit.sammelSpannen.some((s) => n >= s.von && n <= s.bis)) return false;
        const e = jeToken.get(t);
        return e !== undefined && istPlatzhalterEintrag(e);
      };
      const fehlt = [...imPdf].filter((t) => !imSnapshot.has(t));
      const zuviel = [...imSnapshot].filter((t) => !imPdf.has(t) && !alsAuffuellungErlaubt(t));
      if (fehlt.length > 0) {
        probleme.push(`${fehlt.length} Kopf/Köpfe im PDF, aber NICHT im Snapshot: ${fehlt.slice(0, 10).join(', ')}`);
      }
      if (zuviel.length > 0) {
        probleme.push(`${zuviel.length} Eintrag/Einträge im Snapshot ohne Kopf im PDF: ${zuviel.slice(0, 10).join(', ')}`);
      }

      // 2. lit.-Deckung EXAKT je § (M8a: die Erlass-Quote deckte ein einzelnes
      //    gelöschtes lit. zu — 99 % lagen über der Schwelle von 95 %).
      const litSnap = litPositionenJeToken(eintraege);
      const litAbweichung: string[] = [];
      for (const t of new Set([...Object.keys(litSnap), ...Object.keys(zweit.litJeKopf)])) {
        const ist = litSnap[t] ?? 0;
        const soll = zweit.litJeKopf[t] ?? 0;
        if (ist !== soll) litAbweichung.push(`§${t.replace(/_/g, '')} ${ist}/${soll}`);
      }
      if (litAbweichung.length > 0) {
        probleme.push(
          `${litAbweichung.length} § mit abweichender lit.-Zahl (Snapshot/PDF): ` +
            `${litAbweichung.slice(0, 10).join(', ')}`,
        );
      }

      // 4. §§-Sammelköpfe: jeder genannte § muss im Snapshot stehen.
      const alleTokens = new Set(eintraege.map((e) => String(e.artikel ?? '')));
      const sammelFehlt = zweit.sammelTokens.filter((t) => !alleTokens.has(t));
      if (sammelFehlt.length > 0) {
        probleme.push(
          `${sammelFehlt.length} § aus einem «§§ …»-Sammelkopf fehlt im Snapshot: ` +
            `${sammelFehlt.slice(0, 12).join(', ')}`,
        );
      }

      // 5. Suffix-Absätze je § gegen die absatz-Felder halten.
      const absatzImSnapshot = new Map<string, Set<string>>();
      for (const e of eintraege) {
        const t = String(e.artikel ?? '');
        const menge = absatzImSnapshot.get(t) ?? new Set<string>();
        for (const b of e.bloecke ?? []) {
          if (typeof b.absatz === 'string') menge.add(b.absatz);
        }
        absatzImSnapshot.set(t, menge);
      }
      const suffixFehlt: string[] = [];
      for (const [tok, nummern] of Object.entries(zweit.suffixAbsaetze)) {
        for (const n of nummern) {
          if (!absatzImSnapshot.get(tok)?.has(n)) suffixFehlt.push(`${tok}/${n}`);
        }
      }
      if (suffixFehlt.length > 0) {
        probleme.push(
          `${suffixFehlt.length} Absatz mit lat. Suffix im PDF, aber nicht im Snapshot ` +
            `(§/Absatz): ${suffixFehlt.slice(0, 10).join(', ')}`,
        );
      }

      // 7. Werte-Wächter GLOBAL: keine Ziffernfolge, die das PDF nirgends trägt.
      const erfunden: string[] = [];
      for (const { label, text } of snapshotTexte(eintraege)) {
        for (const z of text.match(/\d+/g) ?? []) {
          if (!zweit.zahlen.has(z)) erfunden.push(`${label}: «${z}»`);
        }
      }
      if (erfunden.length > 0) {
        probleme.push(
          `${erfunden.length} Zahl(en) im Snapshot ohne Entsprechung im PDF-Textlayer: ` +
            `${[...new Set(erfunden)].slice(0, 8).join(' · ')}`,
        );
      }

      // 7b/7c. Je §-REGION: Zahlenfolge positionsgebunden + Zeichen-Deckung.
      const folgeBruch: string[] = [];
      const zusatzZahlen: string[] = [];
      const zuWenigText: string[] = [];
      let geprüfteRegionen = 0;
      for (const e of eintraege) {
        const t = String(e.artikel ?? '');
        const region = zweit.regionen[t];
        if (!region) continue; // Anhang-Ziffern u. Ä. → Prüfung 8
        geprüfteRegionen++;
        const label = String(e.artikelLabel ?? t);
        const mass = eintragMass(e.bloecke ?? []);
        const erlaubt = ZAHLENFOLGE_AUSNAHMEN[`ZH-${nr}/${t}`] ?? 0;
        const befund = pruefeZahlen(mass.zahlen, region.zahlen, erlaubt);
        if (befund.folgeGebrochen) {
          // Die erste abweichende Stelle nennen — sonst sucht der Leser selbst.
          let i = 0;
          while (i < region.zahlen.length && istTeilfolge(region.zahlen.slice(0, i + 1), mass.zahlen)) i++;
          folgeBruch.push(`${label} bei «${region.zahlen[i] ?? '?'}» (Stelle ${i + 1} von ${region.zahlen.length})`);
        }
        if (befund.zusatz > 0) {
          zusatzZahlen.push(`${label} +${befund.zusatz}${erlaubt > 0 ? ` (erlaubt ${erlaubt})` : ''}`);
        }
        const q = zeichenQuote(mass.zeichen, region.zeichen);
        if (q !== null && q < ZEICHEN_MIN) {
          zuWenigText.push(`${label} ${(q * 100).toFixed(0)} % (${mass.zeichen}/${region.zeichen})`);
        }
      }
      if (folgeBruch.length > 0) {
        probleme.push(
          `${folgeBruch.length} § mit gebrochener Zahlenfolge (PDF-Wert fehlt oder steht ` +
            `an anderer Stelle): ${folgeBruch.slice(0, 8).join(' · ')}`,
        );
      }
      if (zusatzZahlen.length > 0) {
        probleme.push(
          `${zusatzZahlen.length} § trägt mehr Zahlen als seine PDF-Region: ` +
            `${zusatzZahlen.slice(0, 8).join(' · ')}`,
        );
      }
      if (zuWenigText.length > 0) {
        probleme.push(
          `${zuWenigText.length} § unter dem Zeichen-Deckungsgrad ${(ZEICHEN_MIN * 100).toFixed(0)} %: ` +
            `${zuWenigText.slice(0, 8).join(' · ')}`,
        );
      }

      // 8. Anhang-Punkt-Ziffern beidseitig exakt (M13). Nur wenn der Anhang
      //    überhaupt erfasst ist: wo er eine deklarierte Lücke ist
      //    (kanton-luecken.json), gibt es nichts zu vergleichen.
      const anhangSnap = anhangZifferTokens(eintraege);
      if (anhangSnap.length > 0 || zweit.anhangZiffern.length > 0) {
        if (anhangSnap.length > 0) {
          const anhangFehlt = zweit.anhangZiffern.filter((t) => !anhangSnap.includes(t));
          const anhangZuviel = anhangSnap.filter((t) => !zweit.anhangZiffern.includes(t));
          if (anhangFehlt.length > 0) {
            probleme.push(
              `${anhangFehlt.length} Anhang-Ziffer im PDF, aber NICHT im Snapshot: ` +
                `${anhangFehlt.slice(0, 12).join(', ')}`,
            );
          }
          if (anhangZuviel.length > 0) {
            probleme.push(
              `${anhangZuviel.length} Anhang-Ziffer im Snapshot ohne Entsprechung im PDF: ` +
                `${anhangZuviel.slice(0, 12).join(', ')}`,
            );
          }
        }
      }

      // 9. Einheiten-Exponenten je § beidseitig exakt (Befund B1, Runde 4):
      //    ein fehlendes «²» ist eine Wertveränderung (Fläche → Länge), ein
      //    zusätzliches eine Erfindung. Verglichen wird die MULTIMENGE je § —
      //    die Zweitlesung erhebt die Exponenten unabhängig (Fragment-Ordnung
      //    statt Wort-Lücken-Geometrie, s. zh-zweitlesung.ts).
      const expSnap = new Map<string, string[]>();
      for (const e of eintraege) {
        const t = String(e.artikel ?? '');
        const liste = exponentTokens(e.bloecke ?? []);
        if (liste.length > 0) expSnap.set(t, [...(expSnap.get(t) ?? []), ...liste]);
      }
      const expAbweichung: string[] = [];
      for (const t of new Set([...expSnap.keys(), ...Object.keys(zweit.einheitenExponenten)])) {
        const ist = [...(expSnap.get(t) ?? [])].sort().join('+');
        const soll = [...(zweit.einheitenExponenten[t] ?? [])].sort().join('+');
        if (ist !== soll) {
          expAbweichung.push(`§${t.replace(/_/g, ' ')} Snapshot [${ist || '—'}] / PDF [${soll || '—'}]`);
        }
      }
      if (expAbweichung.length > 0) {
        probleme.push(
          `${expAbweichung.length} § mit abweichenden Einheiten-Exponenten (m²/m³): ` +
            `${expAbweichung.slice(0, 8).join(' · ')}`,
        );
      }

      const suffixGesamt = Object.values(zweit.suffixAbsaetze).reduce((n, l) => n + l.length, 0);
      const expGesamt = Object.values(zweit.einheitenExponenten).reduce((n, l) => n + l.length, 0);
      zusatz =
        ` · ${imPdf.size} Köpfe · lit. exakt` +
        ` · ${zweit.absatzKandidaten} Absatz-Hochzahlen (${suffixGesamt} mit lat. Suffix)` +
        ` · ${zweit.sammelTokens.length} §§ aus Sammelköpfen · ${geprüfteRegionen} Regionen` +
        ` · ${zweit.anhangZiffern.length} Anhang-Ziffern · ${expGesamt} Einheiten-Exponenten` +
        `${quelle.ausCache ? ' · Cache' : ' · Netz'}`;
    } catch (e) {
      probleme.push(`Quelle nicht lesbar: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (probleme.length > 0) {
    fehler++;
    console.error(`  FEHLER ZH-${nr}`);
    for (const p of probleme) console.error(`      ${p}`);
  } else {
    console.log(`  ok    ZH-${nr.padEnd(9)} ${eintraege.length} Einträge${zusatz}`);
  }
}

console.log(`\ncheck:zh-vollstaendigkeit: ${dateien.length} Erlass(e), ${fehler} mit Befund.`);
if (fehler > 0) process.exit(1);
