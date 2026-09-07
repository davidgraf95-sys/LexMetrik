/**
 * scripts/normtext/zh-sidecar.ts — die STRUKTUR-Schicht des ZH-PDF-Wegs:
 * serialisierte Textbasis + Randnoten → Gliederungspfad und Randtitel je §.
 *
 * ANLASS (R1, Auftrag David 2.9.2026, wörtlich: «achte bei zh auch darauf, dass
 * wir marginale extrahieren und in der gliederung darstellen»). Bis hierher
 * verwarf der ZH-Weg beides: die Marginalienspalte fiel in der Geometrie weg
 * (`istZhMarginalie`), die Gliederungs-Überschriften im Parser (GLIEDERUNG,
 * GLIEDERUNG_ZAEHLEND, GLIEDERUNG_ARABISCH werden dort mit `continue`
 * übersprungen). Beides ist kein Normtext — aber beides ist Navigation, und
 * der Leser hat für beides längst einen Vertrag: das Struktur-Sidecar
 * `public/normtext/struktur/<ebene>/<KEY>.json` mit `{gliederung, marginalie}`
 * je Artikel (`ladeStruktur` in src/lib/normtext/browse.ts).
 *
 * WARUM EIGENE DATEI und nicht im Adapter: Der Normtext-Pfad bleibt hier
 * unberührt. Diese Datei LIEST die Textbasis und schreibt NIE in den Snapshot;
 * ein Fehler hier kann keinen Gesetzestext verfälschen (§1). Die Kopf- und
 * Überschriften-MUSTER werden aus dem Adapter importiert, nicht kopiert (§5) —
 * es gibt genau eine Definition davon, was ein §-Kopf ist.
 *
 * §2: rein und deterministisch — kein Netz, kein FS, kein Date.now.
 */
import {
  PARAGRAF_KOPF,
  ARTIKEL_KOPF,
  GLIEDERUNG,
  GLIEDERUNG_ZAEHLEND,
  GLIEDERUNG_ARABISCH,
  TITEL_MARKER,
  SAMMEL_MARKER,
  type ZhMarker,
} from './adapter-zh-pdf.ts';
import type { ZhRandnote } from './zh-seitenmontage.ts';

/** Eine Gliederungsstufe im Pfad eines §. Deckungsgleich mit dem Bund-Sidecar
 *  (`scripts/normtext/struktur-run.ts`) — `eId` führt nur Fedlex. */
export interface ZhGliederungsstufe {
  ebene: number;
  label: string;
}

/** Was ein § im Sidecar trägt. Schema-gleich mit Bund und den 19 übrigen
 *  Kantonen (`public/normtext/struktur/**`). */
export interface ZhSidecarArtikel {
  gliederung: ZhGliederungsstufe[];
  /** Der Randtitel aus der Marginalienspalte. Ein Element oder keines — die
   *  Zürcher Loseblattsammlung setzt je Bestimmung genau eine Randnote. (Das
   *  Feld ist ein ARRAY, weil Fedlex dort die Rangkette «A. / I. / 1.» führt;
   *  `randtitelKnoten` im Leser wertet beide Formen aus.) */
  marginalie: string[];
}

/** Was ein Sidecar-Lauf über sich selbst berichtet — Grundlage der Messreihe
 *  und des Wächters. Nichts davon wird geschätzt (§8). */
export interface ZhSidecarBefund {
  artikel: Record<string, ZhSidecarArtikel>;
  /** Randnoten, die auf einer Zeile hingen, die KEIN §-Kopf war (Randtitel
   *  einer Gliederungs-Überschrift, Randnote im Schlussapparat) — verworfen. */
  randnotenOhneKopf: number;
  /** Randnoten, deren § bereits einen Randtitel trug (Umbruch über eine
   *  Seitengrenze hinweg) — der ZWEITE wird verworfen, nie überschrieben. */
  randnotenDoppelt: number;
  /** Gliederungs-Überschriften, die vor dem ersten § standen und darum keinen
   *  Träger haben (sie gelten trotzdem ab dem nächsten §). */
  titelVorErstemKopf: number;
}

/**
 * Die RANG-Klasse einer Gliederungs-Überschrift. Sie entscheidet allein, wie
 * tief die Stufe im Baum hängt — NIE der Wortlaut des Sachtitels.
 *
 * Die absolute Zahl ist bedeutungslos; massgeblich ist nur die ORDNUNG (welche
 * Klasse steht über welcher). Die hier festgehaltene Reihenfolge ist die der
 * schweizerischen Gesetzestechnik (Teil > Abteilung > Titel > Kapitel >
 * Abschnitt > Unterabschnitt) und danach die typografische Staffel der
 * Zürcher Sammlung (Grossbuchstabe > römisch > arabisch).
 *
 * WARUM NICHT «Reihenfolge des ersten Auftretens»: Das wäre selbstadaptiv und
 * damit von der Reihenfolge der Erlassteile abhängig — ein Erlass, dessen
 * erster Titel zufällig ein «A.» ist, bekäme sonst eine andere Hierarchie als
 * ein gleich gebauter, der mit «1. Teil:» beginnt. Die feste Ordnung ist
 * prüfbar; Abweichungen zählt `baueZhSidecar` und meldet sie, statt sie
 * stillschweigend einzuebnen (§8).
 */
const RANG: Record<string, number> = {
  Teil: 1,
  Abteilung: 2,
  Titel: 3,
  Kapitel: 4,
  Abschnitt: 5,
  Unterabschnitt: 6,
  Buchstabe: 7,
  Roemisch: 8,
  Arabisch: 9,
};

/** Das Gliederungswort einer zählenden Überschrift («2. Kapitel: …»). */
const ZAEHLEND_WORT =
  /^(?:\d+|[IVXLC]+|(?:Ers|Zwei|Drit|Vier|Fünf|Sechs|Sieb|Sieben|Ach|Neun|Zehn|Elf|Zwölf)ter)\.?\s+(Kapitel|Abschnitt|Unterabschnitt|Teil|Titel|Abteilung):/;

/** Römische statt lateinischer Zählung in der Buchstaben-Form («III. Bezirksrat»). */
const ROEMISCH = /^[IVXL]+\./;

/**
 * Die Rang-Klasse einer Zeile, oder null, wenn die Zeile keine
 * Gliederungs-Überschrift ist.
 *
 * `titelschrift` ist die typografische Tatsache aus der Geometrie (die Zeile
 * steht vollständig in der Titel-Schrift des Dokuments). Sie ist für die
 * ARABISCHE Form zwingend — «2. Aufgaben» ist vom Wortlaut her nicht von der
 * Aufzählungszeile «2. die Schulpflege,» zu unterscheiden (s. der
 * §1-KRITISCH-Block bei GLIEDERUNG_ARABISCH im Adapter).
 */
export function rangKlasse(zeile: string, titelschrift: boolean): string | null {
  const t = zeile.trim();
  const zaehlend = t.match(ZAEHLEND_WORT);
  if (zaehlend) return zaehlend[1];
  if (GLIEDERUNG_ZAEHLEND.test(t)) return 'Abschnitt'; // Gliederungswort erkannt, Gruppe nicht
  if (GLIEDERUNG.test(t)) return ROEMISCH.test(t) ? 'Roemisch' : 'Buchstabe';
  if (titelschrift && GLIEDERUNG_ARABISCH.test(t)) return 'Arabisch';
  return null;
}

/**
 * Baut aus der serialisierten Textbasis und den geometrisch gewonnenen
 * Randnoten das Struktur-Sidecar eines ZH-Erlasses.
 *
 * `marker` sagt, ob der Erlass in §§ oder in Artikeln zählt — dieselbe, EINMAL
 * je Erlass erhobene Aussage, die auch der Normtext-Parser verwendet
 * (`erkenneZhMarker`), damit Sidecar und Snapshot nie unterschiedliche Tokens
 * führen.
 *
 * Zuordnung des Randtitels: Die Geometrie hat ihn an den Index einer TEXTZEILE
 * gehängt (dieselbe Grundlinie). Ob diese Zeile ein §-Kopf ist, weiss allein
 * das Kopf-Muster — steht der Randtitel auf einer anderen Zeile, FÄLLT ER WEG
 * und wird gezählt (§8: eine ausgewiesene Lücke ist ehrlich, eine geratene
 * Zuordnung nicht).
 */
export function baueZhSidecar(
  text: string,
  randnoten: ZhRandnote[],
  marker: ZhMarker,
): ZhSidecarBefund {
  const KOPF_MUSTER = marker === 'artikel' ? ARTIKEL_KOPF : PARAGRAF_KOPF;
  const randNachZeile = new Map<number, string>();
  for (const rn of randnoten) if (!randNachZeile.has(rn.zeilenIndex)) randNachZeile.set(rn.zeilenIndex, rn.text);

  const artikel: Record<string, ZhSidecarArtikel> = {};
  const befund: ZhSidecarBefund = {
    artikel,
    randnotenOhneKopf: 0,
    randnotenDoppelt: 0,
    titelVorErstemKopf: 0,
  };

  // Der Gliederungs-STAPEL: der Pfad von der äussersten Stufe bis zur aktuell
  // offenen. Eine neue Überschrift schliesst alle Stufen gleichen oder tieferen
  // Rangs und legt sich darauf.
  const stapel: { rang: number; label: string }[] = [];
  let ersterKopfGesehen = false;

  const zeilen = text.split('\n');
  for (let i = 0; i < zeilen.length; i++) {
    let zeile = zeilen[i];
    const titelschrift = zeile.startsWith(TITEL_MARKER);
    if (titelschrift) zeile = zeile.slice(TITEL_MARKER.length);
    if (zeile.startsWith(SAMMEL_MARKER)) zeile = zeile.slice(SAMMEL_MARKER.length);
    const t = zeile.trim();
    if (t === '') continue;

    const kopf = t.match(KOPF_MUSTER);
    if (kopf) {
      ersterKopfGesehen = true;
      const token = [kopf[1], kopf[2], kopf[3]].filter(Boolean).map((x) => x.toLowerCase()).join('_');
      const rand = randNachZeile.get(i);
      if (token in artikel) {
        // Zweiter Kopf mit demselben Token (Wiedereröffnung nach Sammelkopf,
        // zweite Zählung im Schlussapparat): der ERSTE gilt, wie im Parser.
        if (rand !== undefined) befund.randnotenDoppelt++;
        continue;
      }
      artikel[token] = {
        gliederung: stapel.map((s, k) => ({ ebene: k + 1, label: s.label })),
        marginalie: rand !== undefined ? [rand] : [],
      };
      continue;
    }

    const klasse = rangKlasse(t, titelschrift);
    if (klasse !== null) {
      if (!ersterKopfGesehen) befund.titelVorErstemKopf++;
      const rang = RANG[klasse];
      while (stapel.length > 0 && stapel[stapel.length - 1].rang >= rang) stapel.pop();
      stapel.push({ rang, label: t });
      continue;
    }

  }

  // Verworfene Randnoten = alles, was am Ende an keinem § hängt. Bewusst als
  // Differenz und nicht als Zähler in der Schleife: so kann die Zahl nicht
  // dadurch zu klein werden, dass eine Zeilenrolle vergessen wurde (§8).
  let zugeordnet = 0;
  for (const a of Object.values(artikel)) if (a.marginalie.length > 0) zugeordnet++;
  befund.randnotenOhneKopf = Math.max(0, randnoten.length - zugeordnet - befund.randnotenDoppelt);

  return befund;
}
