/**
 * scripts/normtext/zh-sammelkopf.ts — Sammel-Aufhebungsköpfe der Zürcher
 * Loseblattsammlung: erkennen («§§ 66–69.») und in §-Tokens expandieren.
 *
 * ANLASS (Bug B-2, Gegenprüfung Runde 2, 31.8.2026): Die Zürcher Sammlung fasst
 * benachbarte aufgehobene Bestimmungen zu EINEM Kopf zusammen. `PARAGRAF_KOPF`
 * schliesst «§§» ausdrücklich aus, also war die Zeile für den Adapter
 * gewöhnlicher Text: sie klebte am Vorgänger-§ (26 kontaminierte Blöcke, 6 davon
 * NUR aus Fremdmaterial) und die genannten §§ fehlten ersatzlos — allein in
 * ZH-230 u. a. 58–63, 66–69, 73–116, 117 a–117 m, 137bis–167, 253–255.
 *
 * Eigene Datei, weil `adapter-zh-pdf.ts` an der §6.6-Schwelle steht (splitten
 * statt Baseline mitwachsen lassen) — und weil die Expansion reine, gegen
 * echte Kopfzeilen testbare Arithmetik ohne PDF-Bezug ist.
 *
 * §2: rein und deterministisch (kein Netz, kein FS, kein Date.now).
 */

/** Marker, mit dem serialisiereZhZeilen einen Sammel-Aufhebungskopf in der
 *  Textbasis kennzeichnet. Er trägt die GEOMETRISCHE Aussage (Kopf-Einzug), die
 *  im reinen Text nicht mehr sichtbar wäre, in den Parser — ohne ihn liesse sich
 *  «§§ 66–69.» (Kopf) nicht von «Vorbehalten bleiben §§ 23–23 b und 35 b.»
 *  (Satzende, ZH-331 § 17) unterscheiden. Die Zeichenfolge kommt im
 *  PDF-Textlayer nicht vor. */
export const SAMMEL_MARKER = '⟦SAMMEL⟧';

/**
 * Sammel-Aufhebungskopf: «§§» + reine Nennungsliste von §-Nummern + Schlusspunkt,
 * NICHTS sonst. Belegte Formen im Bestand: «§§ N–M.», «§§ N und M.»,
 * «§§ N−M.» (U+2212, ZH-700.1!), «§§ N a–N m.», «§§ Nbis–M.»,
 * «§§ Nbis–Nquater.», «§§ N–M a.», «§§ N a und M.».
 *
 * ZÄHLWEISE — beide Zahlen sind richtig, sie zählen Verschiedenes
 * (Klarstellung Fix-Runde 3; der Commit-Body der Runde 2 nannte «38», die
 * Gegenprüfung zählte «41», und beide Angaben blieben unerklärt nebeneinander):
 *   · **41 Sammelköpfe in 7 Erlassen** — Zeilen, die BEIDE Bedingungen
 *     erfüllen (Kopf-Einzug UND Textgestalt) und darum expandiert werden.
 *     Verteilung: ZH-230 25 · ZH-700.1 7 · ZH-175.2 3 · ZH-211.1 2 ·
 *     ZH-631.1 2 · ZH-177.10 1 · ZH-631.11 1.
 *   · **42 Zeilen der blossen Textgestalt** (ohne Einzugsprüfung) — die eine
 *     überzählige ist genau das Satzende «Vorbehalten bleiben §§ 23–23 b und
 *     35 b.» (ZH-331 § 17), das der Einzug korrekt aussortiert.
 *   · **38** war die Zahl der Köpfe VOR dem Nachzug der Suffix-Formen (die
 *     drei «§§ Nbis–…»-Köpfe in ZH-230 kamen erst mit der lat.-Suffix-Zuordnung
 *     dazu) — sie beschreibt einen früheren Stand, nicht den heutigen.
 * Gemessen offline aus dem Roh-PDF-Cache über alle 24 ZH-PDF.
 *
 * Die Textform allein reicht NICHT: «§§ 23–23 b und 35 b.» (ZH-331) hat exakt
 * dieselbe Gestalt, ist aber das Ende eines Satzes («Vorbehalten bleiben …»).
 * Erst der Kopf-Einzug trennt beide (s. KOPF_EINZUG_PT).
 */
export const SAMMEL_NUMMER = String.raw`\d+\s*[a-z]?\s*(?:bis|ter|quater|quinquies)?`;
export const SAMMEL_ZEILE = new RegExp(
  String.raw`^§§\s*${SAMMEL_NUMMER}(?:\s*[–—−-]\s*${SAMMEL_NUMMER}|\s*,\s*${SAMMEL_NUMMER}|\s+und\s+${SAMMEL_NUMMER})+\s*\.$`,
);

/** Eine §-Nennung im Sammelkopf, zerlegt in die drei Token-Bestandteile. */
interface SammelGrenze {
  zahl: number;
  buchstabe: string;
  suffix: string;
}

const SUFFIX_LEITER = ['bis', 'ter', 'quater', 'quinquies'] as const;

/** Obergrenze einer expandierten Zahlenreihe. Der grösste echte Bereich im
 *  Bestand ist «§§ 177–198» (22); 100 lässt jede plausible Aufhebung zu und
 *  fängt eine Fehl-Lesung («§§ 3–4000») als Protokoll-Fehler statt als 4000
 *  erfundene Platzhalter. */
const SAMMEL_MAX_SPANNE = 100;

function leseSammelGrenze(roh: string): SammelGrenze | null {
  const m = roh.trim().match(/^(\d+)\s*([a-z])?\s*(bis|ter|quater|quinquies)?$/);
  if (!m) return null;
  return { zahl: Number(m[1]), buchstabe: m[2] ?? '', suffix: m[3] ?? '' };
}

function sammelToken(g: SammelGrenze): string {
  return [String(g.zahl), g.buchstabe, g.suffix].filter(Boolean).join('_');
}

/**
 * Expandiert die §-Nennungsliste eines Sammel-Aufhebungskopfs in Tokens.
 *
 * `exakt: false` heisst: der Bereich ist NICHT lückenlos ableitbar (gemischte
 * Grenzen wie «74–80 d» oder «137bis–144»). Dann werden nur die sicher
 * enthaltenen Nummern emittiert — die genannten Grenzen und die vollen Zahlen
 * dazwischen — und der Aufrufer schreibt eine Protokoll-Zeile. Geraten wird
 * NIE: ob zwischen § 80 und § 80 d noch §§ 80 a–80 c stehen, sagt der Kopf
 * nicht, und ein erfundener Platzhalter wäre eine zweite Wahrheit (§5/§8).
 */
export function expandiereSammelbereich(liste: string): {
  tokens: string[];
  exakt: boolean;
} {
  const tokens: string[] = [];
  let exakt = true;
  const fuegeHinzu = (t: string): void => {
    if (t && !tokens.includes(t)) tokens.push(t);
  };

  for (const teil of liste.split(/\s*,\s*|\s+und\s+/)) {
    const stueck = teil.trim();
    if (stueck === '') continue;
    const bereich = stueck.split(/\s*[–—−-]\s*/);
    if (bereich.length === 1) {
      const g = leseSammelGrenze(bereich[0]);
      if (!g) return { tokens, exakt: false };
      fuegeHinzu(sammelToken(g));
      continue;
    }
    if (bereich.length !== 2) return { tokens, exakt: false };
    const von = leseSammelGrenze(bereich[0]);
    const bis = leseSammelGrenze(bereich[1]);
    if (!von || !bis) return { tokens, exakt: false };

    // (a) Reine Zahlenspanne «66–69».
    const beidePlain = !von.buchstabe && !von.suffix && !bis.buchstabe && !bis.suffix;
    if (beidePlain && bis.zahl >= von.zahl) {
      if (bis.zahl - von.zahl > SAMMEL_MAX_SPANNE) return { tokens, exakt: false };
      for (let n = von.zahl; n <= bis.zahl; n++) fuegeHinzu(String(n));
      continue;
    }
    // (b) Buchstabenspanne an derselben Zahl «117 a–117 m».
    if (
      von.zahl === bis.zahl &&
      von.buchstabe && bis.buchstabe && !von.suffix && !bis.suffix &&
      bis.buchstabe >= von.buchstabe
    ) {
      for (let c = von.buchstabe.charCodeAt(0); c <= bis.buchstabe.charCodeAt(0); c++) {
        fuegeHinzu(`${von.zahl}_${String.fromCharCode(c)}`);
      }
      continue;
    }
    // (c) Lat. Suffix-Leiter an derselben Zahl «235bis–235quater».
    if (von.zahl === bis.zahl && !von.buchstabe && !bis.buchstabe && bis.suffix) {
      const abIdx = von.suffix ? SUFFIX_LEITER.indexOf(von.suffix as never) : -1;
      const bisIdx = SUFFIX_LEITER.indexOf(bis.suffix as never);
      if (abIdx >= -1 && bisIdx >= abIdx) {
        if (abIdx === -1) fuegeHinzu(String(von.zahl));
        for (let i = Math.max(abIdx, 0); i <= bisIdx; i++) {
          fuegeHinzu(`${von.zahl}_${SUFFIX_LEITER[i]}`);
        }
        continue;
      }
    }
    // (d) Gemischte Grenzen: nur das sicher Enthaltene, dann Protokoll.
    exakt = false;
    fuegeHinzu(sammelToken(von));
    const plainVon = von.buchstabe || von.suffix ? von.zahl + 1 : von.zahl;
    if (bis.zahl - plainVon <= SAMMEL_MAX_SPANNE) {
      for (let n = plainVon; n <= bis.zahl; n++) fuegeHinzu(String(n));
    }
    fuegeHinzu(sammelToken(bis));
  }
  return { tokens, exakt };
}