// ─── Der Fassungsvergleich am Artikel: Auswahl + Wort-Diff (rein) ────────────
//
// W2·6c-ENTSTEHUNG-SYNOPSE-LESER (FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.5 (3)).
// Die Daten liegen seit E5/E6 (PR #794); diese Datei ist die SICHT darauf — sie
// beantwortet zwei Fragen und sonst keine:
//
//   (1) WELCHE Alt-Fassung gehört zu diesem Punkt der Fassungsleiste, und was
//       ist ihr «Neu»?
//   (2) WO genau unterscheiden sich die beiden Wortlaute?
//
// §3 Schichtentrennung: reine Funktionen, kein DOM, kein Fetch, kein Zustand.
// §2 Determinismus: gleiche Eingabe → gleiche Ausgabe; keine Uhr, kein Zufall,
// keine Schätzung. Die Darstellung (zwei Spalten, Hervorhebung) sitzt in
// `components/entstehung/SynopseKarte.tsx`.
//
// ── WARUM «NEU» NICHT EINFACH DER GELTENDE TEXT IST (§1) ─────────────────────
// Der Shard speichert je Konsolidierungs-Schritt nur die ALT-Fassung (§11.6 —
// halbiert das Volumen, die Neu-Fassung liegt ohnehin vor). Naheliegend wäre,
// jedem Alt-Block den GELTENDEN Wortlaut gegenüberzustellen. Das wäre bei jedem
// Artikel falsch, der nach diesem Stand nochmals geändert wurde: die Synopse
// schriebe dem Änderungserlass von 2021 die Wörter zu, die das Parlament 2024
// eingefügt hat. «Neu» ist darum die Alt-Fassung des NÄCHSTEN Schritts, der
// denselben Artikel anfasst — und erst wenn es keinen mehr gibt, der geltende
// Wortlaut aus dem Korpus.
//
// ── WARUM DER SCHLÜSSEL DAS STAND-DATUM IST ─────────────────────────────────
// §11.6 nennt als Ereignis-Schlüssel «datum + oc-ELI», nie den Listenindex. Für
// die AUSWAHL genügt das Datum: je Schritt gibt es genau ein `bis`, und ein
// Artikel kommt je Schritt genau einmal vor — das Datum ist also schon eindeutig.
// Der oc dient als GEGENPROBE: gemessen 11.9.2026 über alle 186 Shards tragen
// 3484 Alt-Blöcke den Zustand «belegt», davon decken sich 3479 (99,86 %) mit dem
// oc der Fussnote am selben Datum. Die 5 Ausreisser und die 122 bekannten Fälle
// «zwei Erlasse am selben Datum im selben Artikel» sind kein Grund, den Block zu
// verschweigen — sie sind ein Grund, die Karte sagen zu lassen, dass der
// Unterschied den ganzen STAND betrifft und nicht zwingend diesen einen Erlass
// (§8, Flag `mehrdeutig`).
//
// GRENZE (Gegenprüfung PR #796): Identität ist das AMTLICHE Etikett
// (`schluessel` — Absatz + Listen-Marke), nie Textähnlichkeit — wechselt bei
// sonst identischem Wortlaut nur die Ziffer (z. B. Abs. 2 → Abs. 1), zeigt die
// Synopse dokumentiert Streichung + Einfügung statt «gleich».

import { istAufgehoben } from '../normtext/darstellung';
import type { SynopseArtikel, SynopseBlock, SynopseSchritt, SynopseShard, SynopseZustand } from './synopse';
import { SYNOPSE_FENSTER_AB } from './synopse';
import { vergleichsform } from './normalisierung';

// Rückwärtskompatibler Re-Export (Profil `entstehung-norm/3`, Befund #796): die EINE
// Vergleichsform lebt jetzt in `normalisierung.ts` — von hier importiert Generator UND
// Leser. Weiterhin von hier exportiert, damit bestehende Importe (Tests, Komponenten)
// nicht anfassen müssen (§5: genau ein Ort für die Definition, nicht für den Zugriff).
export { vergleichsform };

// ═══ 1 · Der geltende Wortlaut in Synopse-Gestalt ════════════════════════════

/** Die Block-Gestalt des Korpus (Ausschnitt aus `NormSnapshot`, §3: nur lesen). */
export interface KorpusBlock {
  absatz: string | null;
  text: string;
  items?: Array<{ marke: string; text: string; tiefe?: number }>;
}

/**
 * Projiziert den geltenden Wortlaut eines Artikels in die Tupel-Gestalt der
 * Synopse-Shards (`[absatz, num, text]`).
 *
 * KEINE ZWEITE WAHRHEIT (§5): hier wird nichts gespeichert und nichts gepflegt —
 * die Funktion liest die Blöcke, die der Leser ohnehin anzeigt, und ordnet sie
 * so an, dass der Diff beide Seiten gleich behandeln kann. Tabellen-Blöcke
 * (`tabelle`, `mehrspaltig`) haben in der Synopse keine Entsprechung und bleiben
 * darum weg; sie tragen keinen Fliesstext, den ein Wort-Diff vergleichen könnte.
 */
export function geltendeBloecke(bloecke: readonly KorpusBlock[] | undefined): SynopseBlock[] {
  const out: SynopseBlock[] = [];
  for (const b of bloecke ?? []) {
    const absatz = b.absatz ?? '';
    if (b.text.trim()) out.push([absatz, '', b.text]);
    for (const it of b.items ?? []) {
      if (it.text.trim()) out.push([absatz, it.marke, it.text]);
    }
  }
  return out;
}

// ═══ 2 · Auswahl: welcher Alt-Block gehört zu diesem Punkt? ══════════════════

/** Ein Alt/Neu-Paar samt seiner Herkunft. */
export interface SynopseTreffer {
  schritt: SynopseSchritt;
  artikel: SynopseArtikel;
  /** Wortlaut NACH diesem Schritt; `null` = der Artikel ist entfallen. */
  neu: SynopseBlock[] | null;
  /** Woher «neu» kommt — die Karte sagt es, statt es zu behaupten (§8). */
  neuHerkunft: 'folgestand' | 'geltend' | 'entfallen';
  /** Am selben Stand wirkten mehrere Änderungserlasse (oder der oc der Fussnote
   *  steht nicht in der Liste des Blocks) ⇒ der Unterschied ist dem EINEN Erlass
   *  nicht sicher zuzuordnen (§8). */
  mehrdeutig: boolean;
}

/** Die Lage an EINEM Punkt der Fassungsleiste — jede Möglichkeit benannt (§8). */
export type SynopseLage =
  /** Es gibt eine Gegenüberstellung. */
  | { art: 'vergleich'; treffer: SynopseTreffer }
  /** Der Stand liegt vor dem Fenster maschinenlesbarer Volltexte. */
  | { art: 'vor_fenster'; ab: string }
  /** Der Punkt trägt kein Datum — ohne Stand gibt es nichts zu vergleichen. */
  | { art: 'ohne_datum' }
  /** Konsolidierung ausgewertet, dieser Artikel darin ohne Wortlaut-Unterschied. */
  | { art: 'ohne_unterschied'; stand: string; konflikt: boolean }
  /** Zu diesem Datum liegt keine ausgewertete Konsolidierung vor. */
  | { art: 'kein_stand'; stand: string }
  /** Für diesen Erlass ist überhaupt keine Synopse erfasst. */
  | { art: 'kein_shard' };

/** Schritte aufsteigend nach `bis` — die Reihenfolge im Shard ist nicht zugesichert. */
function nachDatum(schritte: readonly SynopseSchritt[]): SynopseSchritt[] {
  return [...schritte].sort((a, b) => (a.bis < b.bis ? -1 : a.bis > b.bis ? 1 : 0));
}

/** Der Wortlaut NACH `schritt` für `token` (siehe Kopf: nie der geltende Text, wenn es einen Folgestand gibt). */
function neuNach(
  shard: SynopseShard,
  token: string,
  schritt: SynopseSchritt,
  artikel: SynopseArtikel,
  geltend: readonly SynopseBlock[],
): Pick<SynopseTreffer, 'neu' | 'neuHerkunft'> {
  for (const s of nachDatum(shard.schritte)) {
    if (s.bis <= schritt.bis) continue;
    const a = s.artikel.find((x) => x.token === token);
    if (a) return { neu: a.alt, neuHerkunft: 'folgestand' };
  }
  if (artikel.art === 'entfallen') return { neu: null, neuHerkunft: 'entfallen' };
  return { neu: [...geltend], neuHerkunft: 'geltend' };
}

/**
 * Die Lage an einem Fassungspunkt.
 *
 * @param shard   geladener Shard des Erlasses; `null` = keiner vorhanden.
 * @param token   roher Korpus-Token des Artikels («336_c»).
 * @param datum   Stand-Datum des Ereignisses (ISO) oder null.
 * @param ocs     oc-Kurzformen der Fussnote dieses Ereignisses (Gegenprobe).
 * @param geltend geltender Wortlaut (`geltendeBloecke`).
 */
export function lageFuerEreignis(
  shard: SynopseShard | null | undefined,
  token: string,
  datum: string | null | undefined,
  ocs: readonly string[],
  geltend: readonly SynopseBlock[],
): SynopseLage {
  if (!datum) return { art: 'ohne_datum' };
  if (!shard) return { art: 'kein_shard' };
  if (datum < (shard.fensterAb || SYNOPSE_FENSTER_AB)) {
    return { art: 'vor_fenster', ab: shard.fensterAb || SYNOPSE_FENSTER_AB };
  }
  const schritt = shard.schritte.find((s) => s.bis === datum);
  if (!schritt) return { art: 'kein_stand', stand: datum };
  const artikel = schritt.artikel.find((a) => a.token === token);
  if (!artikel) {
    return {
      art: 'ohne_unterschied',
      stand: datum,
      konflikt: (schritt.ereignisOhneAenderung ?? []).includes(token),
    };
  }
  const liste = artikel.oc ?? [];
  const mehrdeutig = liste.length > 1 || (liste.length > 0 && ocs.length > 0 && !ocs.some((o) => liste.includes(o)));
  return {
    art: 'vergleich',
    treffer: { schritt, artikel, mehrdeutig, ...neuNach(shard, token, schritt, artikel, geltend) },
  };
}

/**
 * Die Alt-Blöcke dieses Artikels OHNE Fussnoten-Ereignis (§11.6 `validity_conflict`).
 *
 * SIE HÄNGEN AN KEINEM PUNKT — und darum stehen sie in der Karte als eigener
 * Abschnitt. Gemessen 11.9.2026 über alle 186 Shards: 1175 Alt-Blöcke tragen
 * `ohne_ereignis`, und KEIN EINZIGER von ihnen fällt auf ein Datum, an dem die
 * Fussnoten-Historie desselben Artikels ein Ereignis führt (0 von 1175; 450
 * betreffen Artikel ganz ohne Historie-Eintrag, 725 einen Eintrag ohne Ereignis
 * an diesem Datum). Hätte man sie an die Punkte gehängt, wäre der Zustand
 * unerreichbar gewesen — eine Anzeige, die nicht erscheinen kann, ist wie ein
 * Tor, das nicht scheitern kann (§6.7): sie täuscht Deckung vor.
 */
export function ohneEreignisFuerArtikel(
  shard: SynopseShard | null | undefined,
  token: string,
  geltend: readonly SynopseBlock[],
): SynopseTreffer[] {
  if (!shard) return [];
  const out: SynopseTreffer[] = [];
  for (const schritt of shard.schritte) {
    for (const artikel of schritt.artikel) {
      if (artikel.token !== token || artikel.zustand !== 'ohne_ereignis') continue;
      out.push({ schritt, artikel, mehrdeutig: false, ...neuNach(shard, token, schritt, artikel, geltend) });
    }
  }
  return out.sort((a, b) => (a.schritt.bis < b.schritt.bis ? 1 : -1));
}

// ═══ 3 · Der Diff ════════════════════════════════════════════════════════════

/** Ein Stück Wortlaut mit seiner Rolle im Vergleich. */
export type DiffMarke = 'gleich' | 'weg' | 'neu';
export interface DiffStueck { marke: DiffMarke; text: string }

/** Wie eine Zeile der Synopse zu lesen ist. */
export type ZeilenArt = 'gleich' | 'geaendert' | 'entfernt' | 'eingefuegt';

/** Eine Zeile der Gegenüberstellung (ein Absatz, eine Ziffer, ein Buchstabe). */
export interface SynopseZeile {
  art: ZeilenArt;
  /** Absatz-Etikett der Zeile («1») — leer, wenn der Artikel keine Absätze führt. */
  absatz: string;
  /** Listen-Etikett («a.») — leer beim Einleitungssatz des Absatzes. */
  num: string;
  /** Linke Spalte; `null` = die Zeile gibt es links nicht. */
  alt: DiffStueck[] | null;
  /** Rechte Spalte; `null` = die Zeile gibt es rechts nicht. */
  neu: DiffStueck[] | null;
  /** Die Zeile ist der GANZE Artikel (die Stände zählen die Absätze verschieden,
   *  siehe `synopseZeilen`) — die Karte sagt das dazu (§8). */
  ganzerArtikel?: true;
}

/**
 * Ausrichtungs-Schlüssel eines Blocks: Absatz + normalisiertes Listen-Etikett.
 *
 * NORMALISIERT WIRD NUR FÜRS MATCHING, NIE FÜR DIE ANZEIGE (Muster
 * law.soufien.lu, `soufien-lex.md`; §11.6): die AKN-Konsolidierung schreibt
 * «a.», der Korpus-Adapter «a» — dieselbe amtliche Marke in zwei Schreibweisen.
 * Angezeigt wird trotzdem immer der Originalwert der jeweiligen Seite.
 */
function schluessel(b: SynopseBlock): string {
  const absatz = b[0].trim().toLowerCase();
  const num = b[1].trim().toLowerCase().replace(/[.)\]]+$/, '').replace(/\s+/g, '');
  return `${absatz}|${num}`;
}

/**
 * Verdichtet aufeinanderfolgende Blöcke OHNE amtliches Etikett zu einem Block.
 *
 * MESSUNG 11.9.2026, und darum gibt es diesen Schritt: bei Artikeln ohne
 * Absatz-Zählung (AHVG 87 — die Strafnorm als ein einziger Satzbogen) hält die
 * AKN-Konsolidierung EINEN Block, der Korpus-Adapter neun; beide Seiten sind
 * amtlich, sie zählen nur anders. Ohne Verdichtung trägt jeder dieser Blöcke
 * denselben leeren Schlüssel «|», die Ausrichtung paart den ersten und erklärt
 * die übrigen acht zu Einfügungen — der Leser sähe eine Änderung, die es nie
 * gegeben hat (§1: fachlich falsches Ergebnis). Wo ein Etikett steht (Absatz,
 * Buchstabe, Ziffer), ist die Identität amtlich und wird NIE verdichtet.
 */
function verdichte(bloecke: readonly SynopseBlock[]): SynopseBlock[] {
  const out: SynopseBlock[] = [];
  for (const b of bloecke) {
    const anonym = !b[0].trim() && !b[1].trim();
    const letzt = out[out.length - 1];
    if (anonym && letzt && !letzt[0].trim() && !letzt[1].trim()) {
      out[out.length - 1] = ['', '', `${letzt[2]}\n${b[2]}`];
    } else out.push(b);
  }
  return out;
}

/** Wörter samt ihrem nachfolgenden Trennraum — die Verkettung ergibt das Original. */
function woerter(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [];
}

/**
 * Die amtliche Marken-Grammatik: Zahl mit Zusatz («1», «1bis», «16c») oder ein
 * bis zwei Buchstaben mit Ordinal-Zusatz («a», «abis», «cquater»), je mit oder
 * ohne schliessenden Punkt. Sie ist eng gefasst, damit sie kein gewöhnliches
 * Wort erfasst: «Vertrag.» und «Vertrag» bleiben verschieden (§1 — ein
 * Satzende ist Wortlaut, kein Etikett).
 */
const MARKE_RE = /^(?:\d+[a-zäöü]*|[a-zäöü]{1,2}(?:bis|ter|quater|quinquies|sexies|septies|octies|novies|decies)?)[.)]?$/i;

/**
 * Sind zwei Wörter dasselbe Wort?
 *
 * Über die Vergleichsform hinaus gilt EINE zusätzliche Gleichsetzung, und zwar
 * dieselbe, die schon die Block-Ausrichtung kennt (`schluessel`): ein
 * LISTEN-ETIKETT ohne Punkt ist dasselbe Etikett wie mit Punkt. Die
 * AKN-Konsolidierung schreibt «a.», der Korpus-Adapter «a», das Bundesblatt
 * mal so mal so — und ein Diff, der daraus eine Streichung macht, streicht dem
 * Leser den Buchstaben durch, den das Parlament gar nicht angefasst hat (§1;
 * sichtbar geworden an der Entwurfs-Synopse zu DBG 5, 11.9.2026).
 *
 * Eng gefasst über `MARKE_RE`: «Vertrag.» und «Vertrag» bleiben verschieden.
 */
function gleichesWort(a: string, b: string): boolean {
  const x = vergleichsform(a);
  const y = vergleichsform(b);
  if (x === y) return true;
  if (!MARKE_RE.test(x) || !MARKE_RE.test(y)) return false;
  return x.replace(/[.)]$/, '') === y.replace(/[.)]$/, '');
}

/**
 * Längste gemeinsame Teilfolge als Index-Paare. Klassische DP-Tabelle, O(n·m) —
 * bei den hier auftretenden Grössen (Blöcke je Artikel, Wörter je Block) ist das
 * die schlichteste Fassung, die IMMER dasselbe Ergebnis liefert (§2). Die
 * Obergrenze zieht der Aufrufer, nicht diese Funktion.
 */
function lcs<T>(a: readonly T[], b: readonly T[], gleich: (x: T, y: T) => boolean): Array<[number, number]> {
  const n = a.length;
  const m = b.length;
  const d: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      d[i][j] = gleich(a[i], b[j]) ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
    }
  }
  const paare: Array<[number, number]> = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (gleich(a[i], b[j])) { paare.push([i, j]); i += 1; j += 1; }
    else if (d[i + 1][j] >= d[i][j + 1]) i += 1;
    else j += 1;
  }
  return paare;
}

/**
 * Ab wann ein Wort-Diff nicht mehr hilft (Absatz-Eskalation, §11.6).
 *
 * Unter dieser Ähnlichkeit ist ein Block neu geschrieben und nicht redigiert;
 * ein Wort-Diff zeigte dann ein Konfetti aus zufällig gleichen Artikeln und
 * Präpositionen und verdeckte genau das, was der Leser sehen will. Die Karte
 * stellt solche Blöcke als Ganzes gegenüber.
 */
export const AEHNLICH_MIN = 0.35;

/** Obergrenze für den Wort-Diff je Block; darüber wird eskaliert (§15: O(n·m)). */
export const WORT_DECKEL = 600;

/** Wort-Diff zweier Wortlaute. Verkettung der Stücke je Seite = das Original. */
export function wortDiff(alt: string, neu: string): { alt: DiffStueck[]; neu: DiffStueck[] } {
  const a = woerter(alt);
  const b = woerter(neu);
  if (a.length === 0 && b.length === 0) return { alt: [], neu: [] };
  if (a.length > WORT_DECKEL || b.length > WORT_DECKEL) return ganz(alt, neu);
  const paare = lcs(a, b, gleichesWort);
  const gemeinsam = paare.length;
  if (gemeinsam / Math.max(a.length, b.length) < AEHNLICH_MIN) return ganz(alt, neu);
  const links: DiffStueck[] = [];
  const rechts: DiffStueck[] = [];
  let i = 0;
  let j = 0;
  const schiebe = (liste: DiffStueck[], marke: DiffMarke, text: string) => {
    if (!text) return;
    const letzt = liste[liste.length - 1];
    if (letzt && letzt.marke === marke) letzt.text += text;
    else liste.push({ marke, text });
  };
  for (const [pi, pj] of paare) {
    while (i < pi) { schiebe(links, 'weg', a[i]); i += 1; }
    while (j < pj) { schiebe(rechts, 'neu', b[j]); j += 1; }
    schiebe(links, 'gleich', a[i]); schiebe(rechts, 'gleich', b[j]);
    i += 1; j += 1;
  }
  while (i < a.length) { schiebe(links, 'weg', a[i]); i += 1; }
  while (j < b.length) { schiebe(rechts, 'neu', b[j]); j += 1; }
  return { alt: links, neu: rechts };
}

/** Block als Ganzes gegenübergestellt (Eskalation). */
function ganz(alt: string, neu: string): { alt: DiffStueck[]; neu: DiffStueck[] } {
  return {
    alt: alt ? [{ marke: 'weg', text: alt }] : [],
    neu: neu ? [{ marke: 'neu', text: neu }] : [],
  };
}

/**
 * Die Gegenüberstellung zweier Wortlaute, Zeile für Zeile.
 *
 * Erst werden die BLÖCKE ausgerichtet (Absatz + Listen-Etikett — die amtliche
 * Identität, nie eine Textähnlichkeit), dann innerhalb jedes Paars die WÖRTER.
 * Genau diese Reihenfolge verlangt §11.6: Identität über die amtlichen Etiketten,
 * Text-Vergleich erst darunter.
 */
export function synopseZeilen(
  roheAlt: readonly SynopseBlock[],
  roheNeu: readonly SynopseBlock[],
): SynopseZeile[] {
  const alt = verdichte(roheAlt);
  const neu = verdichte(roheNeu);
  // ── Wenn eine Seite gar keine Etiketten führt (gemessen 11.9.2026: 367 von
  //    4614 Vergleichen, 8 %) ────────────────────────────────────────────────
  // Beispiel AHVG 103: die Alt-Fassung zählt «Abs. 1», «Abs. 1bis» mit Buchstaben
  // und Ziffern, die geltende Fassung ist EIN Absatz ohne Zählung — Fedlex lässt
  // die Absatznummer weg, sobald ein Artikel nur noch einen Absatz hat. Zeile für
  // Zeile ausgerichtet fände die Paarung nichts wieder und stellte die ganze
  // Alt-Fassung als «entfernt» neben eine ganz «eingefügte» Neu-Fassung — formal
  // richtig, für den Leser aber nutzlos. Der Vergleich läuft darum über den
  // ganzen Artikel; die Karte benennt das (`ganzerArtikel`), und die Etiketten
  // der gegliederten Seite stehen weiterhin in der amtlichen Fassung, auf die
  // der Zitat-Fuss verlinkt (§7c). Der Wortlaut selbst bleibt unangetastet —
  // gejoint werden nur die Blöcke, nie ein Etikett hineingeschrieben (§7).
  const anonym = (b: SynopseBlock) => !b[0].trim() && !b[1].trim();
  const nurEiner = (s: SynopseBlock[], t: SynopseBlock[]) => s.length === 1 && anonym(s[0]) && t.some((b) => !anonym(b));
  if (nurEiner(alt, neu) || nurEiner(neu, alt)) {
    const d = wortDiff(alt.map((b) => b[2]).join('\n'), neu.map((b) => b[2]).join('\n'));
    return [{ art: 'geaendert', absatz: '', num: '', alt: d.alt, neu: d.neu, ganzerArtikel: true }];
  }
  const paare = lcs(alt, neu, (x, y) => schluessel(x) === schluessel(y));
  const zeilen: SynopseZeile[] = [];
  let i = 0;
  let j = 0;
  const entfernt = (b: SynopseBlock) => zeilen.push({
    art: 'entfernt', absatz: b[0], num: b[1], alt: [{ marke: 'weg', text: b[2] }], neu: null,
  });
  const eingefuegt = (b: SynopseBlock) => zeilen.push({
    art: 'eingefuegt', absatz: b[0], num: b[1], alt: null, neu: [{ marke: 'neu', text: b[2] }],
  });
  for (const [pi, pj] of paare) {
    while (i < pi) { entfernt(alt[i]); i += 1; }
    while (j < pj) { eingefuegt(neu[j]); j += 1; }
    const a = alt[i];
    const b = neu[j];
    // Der Korpus hält für aufgehobene Stellen «…» bzw. «Aufgehoben» (Regel
    // `istAufgehoben`, EINE Quelle — `lib/normtext/darstellung.ts`). Ein Paar
    // «Wortlaut → Aufhebungs-Platzhalter» ist keine Textänderung, sondern eine
    // Streichung, und genau das sagt die Zeile dann (§8: der Leser soll nicht
    // raten, was «…» bedeutet).
    const altTot = istAufgehoben(a[2]);
    const neuTot = istAufgehoben(b[2]);
    if (altTot !== neuTot) {
      zeilen.push(neuTot
        ? { art: 'entfernt', absatz: a[0], num: a[1], alt: [{ marke: 'weg', text: a[2] }], neu: null }
        : { art: 'eingefuegt', absatz: b[0], num: b[1], alt: null, neu: [{ marke: 'neu', text: b[2] }] });
    } else if (vergleichsform(a[2]) === vergleichsform(b[2]) || (altTot && neuTot)) {
      zeilen.push({ art: 'gleich', absatz: b[0], num: b[1], alt: [{ marke: 'gleich', text: a[2] }], neu: [{ marke: 'gleich', text: b[2] }] });
    } else {
      const d = wortDiff(a[2], b[2]);
      zeilen.push({ art: 'geaendert', absatz: b[0], num: b[1] || a[1], alt: d.alt, neu: d.neu });
    }
    i += 1; j += 1;
  }
  while (i < alt.length) { entfernt(alt[i]); i += 1; }
  while (j < neu.length) { eingefuegt(neu[j]); j += 1; }
  return zeilen;
}

/** Trägt die Gegenüberstellung überhaupt einen Unterschied? (§8: nie «geändert» behaupten, wo nichts steht.) */
export function hatUnterschied(zeilen: readonly SynopseZeile[]): boolean {
  return zeilen.some((z) => z.art !== 'gleich');
}

/** Ein gespeicherter Alt-Block, der nach der Leser-Vergleichsform «kein Unterschied» zeigt (§5). */
export interface SynopseLeerDiff {
  token: string;
  stand: string;
  zustand: SynopseZustand;
}

/**
 * Rot-Beweis-Grundlage von `check:entstehung` (Befund Bauer #796, 11.9.2026):
 * prüft ALLE gespeicherten Alt-Blöcke eines Shards (`belegt` UND `ohne_ereignis`)
 * mit GENAU DER Vergleichsform, die der Leser für die Anzeige verwendet
 * (`synopseZeilen`/`hatUnterschied`, dieselbe `vergleichsform` wie der Generator).
 * Kein gespeicherter Block darf danach leer-diffen — sonst speichert der Generator
 * eine «Änderung», die niemand sehen kann (§1, §5: zwei Normalisierungen wären
 * zwei Wahrheiten). `geltendFuerToken` liefert den geltenden Korpus-Wortlaut für
 * den Fall, dass ein Alt-Block der letzte Schritt vor dem geltenden Stand ist.
 *
 * `art: 'entfallen'` ABSICHTLICH AUSSER ACHT: Gemessen 11.9.2026 (CHEMRRV, zehn
 * Artikel-Token um den 2022-05-01 herum) sucht `neuNach` bei einem entfallenen
 * Artikel weiterhin über ALLE Folgeschritte nach dem GLEICHEN Token — findet ein
 * numerisch späterer, sachlich unverwandter Artikel zufällig (oder durch eine
 * spätere Rück-Umnummerierung) denselben Token, wird dessen Wortlaut als «Neu»
 * gegen das entfallene Original gestellt. Das ist eine TOKEN-KONTINUITÄTS-Frage
 * (gehört ein Artikel, der Jahre später unter derselben Nummer wieder auftaucht,
 * zur selben Norm-Linie?), keine Normalisierungs-Lücke — anderer Fehlerklasse,
 * eigener Befund, hier bewusst nicht mitgelöst (§1: dieses Tor bewacht «zwei
 * Normalisierungen», nicht Token-Identität über grosse Zeiträume).
 *
 * OFFENER REST (Nachtrag 11.9.2026, NICHT ausgefiltert): dieselbe
 * Token-Kontinuitäts-Frage trifft auch `art: 'geaendert'`-Blöcke, wenn derselbe
 * Wortlaut nach einem grossen Zeitsprung zufällig wiederkehrt, OHNE dass der
 * Artikel zwischendurch `entfallen` war — Beleg AVIV Art. 57b: Alt @2021-07-01
 * lautet «… um sechs Abrechnungsperioden …», die nächste erfasste Berührung
 * desselben Tokens (@2025-11-01, über vier Jahre später) lautet WORTGLEICH
 * «… um sechs …», bevor sie zu «… um zwölf …» wechselt. `neuNach` findet den
 * nächsten Token-Treffer, nicht die nächste WORTLAUT-Änderung — für diese
 * verbleibenden Fälle (gemessen 11.9.2026: 10, u. a. AIG 93, ASYLG 6a, AVIV
 * 57b/1a, OR 652d, PARLG 13, VAM 51/76/77, ZSTV 17) bleibt das Tor ABSICHTLICH
 * rot: sie werden HIER NICHT stillschweigend ausgefiltert, weil das dieselbe
 * «Zwei-Wahrheiten»-Täuschung wäre, die dieses Tor gerade verhindern soll (§6.7
 * — ein Tor, das den eigenen Befund wegfiltert, ist gefährlicher als keines).
 * Der Fix gehört in `neuNach` selbst (eine Lineage-Regel über den Token hinaus,
 * z. B. via `oc`/eId-Kontinuität) — eigener Roadmap-Schritt, hier nicht gebaut.
 */
export function leerDiffVerletzungen(
  shard: SynopseShard,
  geltendFuerToken: (token: string) => readonly SynopseBlock[],
): SynopseLeerDiff[] {
  const out: SynopseLeerDiff[] = [];
  for (const schritt of shard.schritte) {
    for (const artikel of schritt.artikel) {
      if (artikel.zustand !== 'belegt' && artikel.zustand !== 'ohne_ereignis') continue;
      if (artikel.art === 'entfallen') continue;
      if (!artikel.token) continue;
      const { neu } = neuNach(shard, artikel.token, schritt, artikel, geltendFuerToken(artikel.token));
      if (neu === null) continue;
      if (!hatUnterschied(synopseZeilen(artikel.alt, neu))) {
        out.push({ token: artikel.token, stand: schritt.bis, zustand: artikel.zustand });
      }
    }
  }
  return out;
}

// ═══ 4 · Entwurf ↔ Beschluss (E6) ════════════════════════════════════════════

/**
 * Artikel-Token aus einem Bundesblatt-Artikelkopf («Art. 107 Abs. 3» → «107»,
 * «Art. 68novies …» → «68_novies»).
 *
 * DER JOIN LÄUFT ÜBER DAS LABEL, nicht über die `mod_uN`-id (`synopse-entwurf.ts`:
 * ein id-Abgleich ordnete gemessen 7 von 41 Artikeln falsch zu). Hier wird aus dem
 * Label nur die ARTIKELNUMMER gelesen und in die Korpus-Schreibweise gebracht;
 * alles dahinter (Absatz-Aufzählung, Sachtitel) bleibt unangetastet, weil es
 * keine maschinenlesbare Grammatik dafür gibt (§2 — lieber kein Treffer als ein
 * falscher). `null` = kein Artikelkopf (Gliederungstitel, Übergangsbestimmung).
 */
export function tokenAusLabel(label: string): string | null {
  // KEIN Leerraum zwischen Zahl und Zusatz: «Art. 13a» ist ein Artikel, «Art. 13
  // Abs. 2» ist Artikel 13. Genau diese Lücke hat der erste Entwurf zugelassen
  // und daraufhin «Art. 107 Abs. 3» als Artikel «107_abs» gelesen (Messung
  // 11.9.2026: 31 von 126 Labels falsch); der Fall steht im Unit-Test.
  const t = label.match(/^\s*Art(?:\.|ikel)\s*(\d+)([a-zäöü]*)/i);
  if (!t) return null;
  const zusatz = t[2].toLowerCase();
  return zusatz ? `${t[1]}_${zusatz}` : t[1];
}
