// scripts/zustaendigkeit/be-sprengel-pruefung.ts — die Invarianten der BE-Sprengel-Tabelle.
//
// Reine Prüffunktion ohne Netz und ohne Geodaten, geteilt vom Tor
// `check:be-sprengel` (scripts/zustaendigkeit/check-be-sprengel.ts) und vom
// PR-CI-Test src/tests/beSprengel.test.ts — eine Quelle für beide (§5).
// Fünf Beweise, jeder einzeln rot zu bekommen (CLAUDE.md §6.7):
//   (A) Form      — §7-Pflichtmerkmale: Stand, Abrufdatum, Lizenz, Live-Links, Normbasis.
//   (B) Schlüssel — jede BFS-Nummer genau einmal, jeder Name genau einmal,
//                   Namen- und Gemeinde-Menge deckungsgleich, Indizes im Bereich.
//   (C) Deckung   — die Gemeindemenge ist IDENTISCH mit den BE-Gemeinden des
//                   amtlichen swisstopo-PLZ-Verzeichnisses (unabhängige Quelle
//                   im Repo). Eine fehlende Gemeinde ist eine stille Lücke (§8).
//   (D) Einklang  — die Vierteilung stimmt Gemeinde für Gemeinde mit dem
//                   bestehenden BE-Schlichtungsregister überein (Art. 80 Abs. 2
//                   GSOG: dieselbe Verwaltungsregion trägt beide Sprengel).
//                   Keine Kreuzprüfung gegen sich selbst: das Register stammt
//                   aus einem anderen Generator und einer anderen Quelle.
//   (E) Deckel    — Artefaktgrösse; die Tabelle wird lazy geladen und darf die
//                   Auslieferung nicht unbemerkt aufblähen (§15).

import { readFileSync, statSync } from 'node:fs';

const ARTEFAKT = 'src/data/zustaendigkeit/beSprengel.json';
const REGISTER = 'src/data/schlichtung/aemterKantone.json';
const PLZ = 'src/data/plz/plzVerzeichnis.json';
/** Deckel roh (ungezippt). Stand 12.9.2026: 19 KB bei 334 Gemeinden. */
const DECKEL_BYTES = 48 * 1024;

const lies = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;

interface Anschrift { adresse: string; plzOrt: string }
interface Gericht { region: string; name: string; nameFr: string | null; aussenstelle: string | null; zivil: Anschrift; straf: Anschrift; url: string | null }
interface Sta { region: string; name: string; adresse: string; plzOrt: string }
interface Artefakt {
  stand: string;
  quelle: Record<string, unknown> & { datensaetze?: { code: string; detail: string; bezug: string }[] };
  gerichte: Gericht[];
  staatsanwaltschaften: Sta[];
  gemeinden: Record<string, [number, number]>;
  namen: Record<string, number>;
  kreise: Record<string, number>;
}

export interface BeSprengelBefund {
  fehler: string[];
  gemeinden: number;
  standorte: number;
  regionen: number;
  staatsanwaltschaften: number;
  kreise: number;
  deckungPlz: number;
  bytes: number;
  stand: string;
  abgerufen: string;
  deckelBytes: number;
}

/** Prüft das committete Artefakt. Leere Fehlerliste = grün. */
export function pruefeBeSprengel(): BeSprengelBefund {
  const fehler: string[] = [];
  const a = lies<Artefakt>(ARTEFAKT);


  // ─── (A) Form ───────────────────────────────────────────────────────────────
  const datum = /^\d{4}-\d{2}-\d{2}$/;
  if (!datum.test(a.stand)) fehler.push(`(A) stand «${a.stand}» ist kein ISO-Datum.`);
  for (const feld of ['herausgeber', 'lizenz', 'lizenzUrl', 'normbasis', 'normUrl', 'uebersichtGerichte', 'uebersichtStaatsanwaltschaft'] as const) {
    if (typeof a.quelle[feld] !== 'string' || (a.quelle[feld] as string).trim() === '') fehler.push(`(A) quelle.${feld} fehlt — §7-Pflichtmerkmal.`);
  }
  if (typeof a.quelle.abgerufen !== 'string' || !datum.test(a.quelle.abgerufen)) fehler.push('(A) quelle.abgerufen fehlt oder ist kein ISO-Datum.');
  for (const [feld, wert] of Object.entries(a.quelle)) {
    if (typeof wert === 'string' && /^http/.test(wert) && !wert.startsWith('https://')) fehler.push(`(A) quelle.${feld} ist kein https-Link.`);
  }
  if (!Array.isArray(a.quelle.datensaetze) || a.quelle.datensaetze.length !== 3) {
    fehler.push('(A) quelle.datensaetze nennt nicht die drei Quell-Datensätze (ADMRG, ADMRSA, GRENZ5).');
  } else {
    for (const d of a.quelle.datensaetze) {
      if (!d.detail.startsWith('https://') || !d.bezug.startsWith('https://')) fehler.push(`(A) Datensatz ${d.code} ohne https-Live-Link.`);
    }
  }
  if (a.staatsanwaltschaften.length !== 4) fehler.push(`(A) ${a.staatsanwaltschaften.length} regionale Staatsanwaltschaften — Art. 92 Abs. 1 GSOG nennt vier.`);
  const regionen = new Set(a.gerichte.map((g) => g.region));
  if (regionen.size !== 4) fehler.push(`(A) ${regionen.size} Gerichtsregionen — Art. 80 Abs. 1 GSOG nennt vier.`);

  // ─── (B) Schlüssel ──────────────────────────────────────────────────────────
  const bfsAusNamen = new Map<number, string[]>();
  for (const [n, b] of Object.entries(a.namen)) bfsAusNamen.set(b, [...(bfsAusNamen.get(b) ?? []), n]);
  for (const [b, n] of bfsAusNamen) if (n.length !== 1) fehler.push(`(B) BFS ${b} trägt ${n.length} Namen: ${n.join(', ')}.`);
  for (const [b, paar] of Object.entries(a.gemeinden)) {
    if (!/^\d+$/.test(b)) fehler.push(`(B) «${b}» ist keine BFS-Nummer.`);
    if (!Array.isArray(paar) || paar.length !== 2) { fehler.push(`(B) Eintrag ${b} ist kein [Gericht, Staatsanwaltschaft]-Paar.`); continue; }
    if (paar[0] < 0 || paar[0] >= a.gerichte.length) fehler.push(`(B) Eintrag ${b}: Gerichtsindex ${paar[0]} ausserhalb 0…${a.gerichte.length - 1}.`);
    if (paar[1] < 0 || paar[1] >= a.staatsanwaltschaften.length) fehler.push(`(B) Eintrag ${b}: Staatsanwaltschafts-Index ${paar[1]} ausserhalb 0…${a.staatsanwaltschaften.length - 1}.`);
    if (!bfsAusNamen.has(Number(b))) fehler.push(`(B) BFS ${b} hat keinen Gemeindenamen.`);
  }
  for (const b of bfsAusNamen.keys()) if (a.gemeinden[String(b)] === undefined) fehler.push(`(B) Gemeindename zu BFS ${b} ohne Sprengel-Eintrag.`);
  for (const [k, g] of Object.entries(a.kreise)) {
    if (g < 0 || g >= a.gerichte.length) fehler.push(`(B) Verwaltungskreis ${k}: Gerichtsindex ${g} ausserhalb des Bereichs.`);
  }

  // ─── (C) Deckung gegen das amtliche PLZ-Verzeichnis ─────────────────────────
  const plz = lies<Record<string, [string, string, number][]>>(PLZ);
  const beAusPlz = new Set<string>();
  for (const eintraege of Object.values(plz)) for (const [gem, kt] of eintraege) if (kt === 'BE') beAusPlz.add(gem);
  const beAusTabelle = new Set(Object.keys(a.namen));
  const fehlend = [...beAusPlz].filter((g) => !beAusTabelle.has(g)).sort();
  const ueberzaehlig = [...beAusTabelle].filter((g) => !beAusPlz.has(g)).sort();
  if (fehlend.length > 0) fehler.push(`(C) ${fehlend.length} BE-Gemeinde(n) des PLZ-Verzeichnisses fehlen in der Sprengel-Tabelle: ${fehlend.slice(0, 8).join(', ')}${fehlend.length > 8 ? ' …' : ''}.`);
  if (ueberzaehlig.length > 0) fehler.push(`(C) ${ueberzaehlig.length} Gemeinde(n) der Sprengel-Tabelle kennt das PLZ-Verzeichnis nicht: ${ueberzaehlig.slice(0, 8).join(', ')}${ueberzaehlig.length > 8 ? ' …' : ''}.`);

  // ─── (D) Einklang mit dem BE-Schlichtungsregister ───────────────────────────
  interface RegisterKanton { aemter: { name: string }[]; gemeinden: Record<string, number> }
  const register = lies<Record<string, RegisterKanton>>(REGISTER).BE;
  if (register === undefined) {
    fehler.push('(D) aemterKantone.json führt keinen BE-Eintrag mehr — die Gegenprobe wäre blind.');
  } else {
    const regionDesAmts = register.aemter.map((x) => x.name.replace(/^Schlichtungsbehörde\s+/, ''));
    let abweichungen = 0;
    const beispiele: string[] = [];
    for (const [name, bfs] of Object.entries(a.namen)) {
      const idx = register.gemeinden[name];
      if (idx === undefined) { abweichungen++; if (beispiele.length < 6) beispiele.push(`${name}: im Register unbekannt`); continue; }
      const erwartet = regionDesAmts[idx];
      const paar = a.gemeinden[String(bfs)];
      const gericht = a.gerichte[paar[0]];
      const sta = a.staatsanwaltschaften[paar[1]];
      if (gericht.region !== erwartet || sta.region !== erwartet) {
        abweichungen++;
        if (beispiele.length < 6) beispiele.push(`${name}: Register «${erwartet}», Gericht «${gericht.region}», StA «${sta.region}»`);
      }
    }
    const nurRegister = Object.keys(register.gemeinden).filter((n) => a.namen[n] === undefined);
    if (nurRegister.length > 0) { abweichungen += nurRegister.length; beispiele.push(`nur im Register: ${nurRegister.slice(0, 6).join(', ')}`); }
    if (abweichungen > 0) fehler.push(`(D) ${abweichungen} Abweichung(en) zwischen Sprengel-Tabelle und BE-Schlichtungsregister — ${beispiele.join(' · ')}.`);
  }

  // ─── (E) Deckel ─────────────────────────────────────────────────────────────
  const bytes = statSync(ARTEFAKT).size;
  if (bytes > DECKEL_BYTES) fehler.push(`(E) ${ARTEFAKT} ist ${(bytes / 1024).toFixed(1)} KB > Deckel ${(DECKEL_BYTES / 1024).toFixed(0)} KB.`);

  return {
    fehler,
    gemeinden: Object.keys(a.gemeinden).length,
    standorte: a.gerichte.length,
    regionen: regionen.size,
    staatsanwaltschaften: a.staatsanwaltschaften.length,
    kreise: Object.keys(a.kreise).length,
    deckungPlz: beAusPlz.size,
    bytes,
    stand: a.stand,
    abgerufen: String(a.quelle.abgerufen),
    deckelBytes: DECKEL_BYTES,
  };
}
