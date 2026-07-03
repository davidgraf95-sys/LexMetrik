// Abschnitts-Metadaten (Titel + Anker) — getrennt von der Komponente, damit die
// Komponentendatei nur Komponenten exportiert (react-refresh).

import type { Abschnittstyp, EntscheidAbschnitt, EntscheidBlock } from './typen';
import { fedlexLinkFuerArtikel, normVerweiseImText } from '../fedlex';

export const ABSCHNITT_TITEL: Record<Abschnittstyp, string> = {
  regeste: 'Regeste',
  sachverhalt: 'Sachverhalt',
  erwaegung: 'Erwägungen',
  dispositiv: 'Dispositiv',
};

/** Anker-Id eines Abschnitts (für die Sprung-Navigation). */
export function abschnittAnker(typ: Abschnittstyp): string {
  return `abschnitt-${typ}`;
}

// ─── Erwägungs-Gliederung + Anker (EINE Wahrheit, §5) ────────────────────────
//
// Die Anker-Ids der Erwägungen («e-2», «e-2-3-1») trägt der Reader (EntscheidBody)
// als teilbare Deep-Link-Ziele. Damit die Norm-Chip-Fundstellen-Suche (EntscheidLeser)
// EXAKT dieselben Ids trifft, lebt die Gruppier-/Anker-Regel hier einmal — beide
// Seiten konsumieren `gruppiereErwaegungen`. Reine, deterministische Helfer (§2/§3).

/** Zahl-Segmente einer Erwägungs-Marke: «E. 2.3.1» → [2,3,1]; markenlos → []. */
export function segmente(marke: string | null): number[] {
  const m = /(\d+(?:\.\d+)*)/.exec(marke ?? '');
  return m ? m[1].split('.').map(Number) : [];
}

/** Anker-Id einer Erwägungs-Marke: «E. 2.3.1» → «e-2-3-1». */
export function ankerFuer(marke: string): string {
  return marke.toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '');
}

export interface ErwSub {
  block: EntscheidBlock;
  /** Anker-Id des Unter-Blocks (leer bei markenlosen Erwägungen → kein Sprung-Ziel). */
  anker: string;
}
export interface ErwGruppe {
  /** Top-Ziffer (2 aus «E. 2.3.1»); 0 = markenlose Erwägung. */
  top: number;
  /** Kopf-Block der Gruppe («E. 2») oder null. */
  kopf: EntscheidBlock | null;
  /** Anker-Id des Kopfes («e-2»); leer bei markenlosen Gruppen. */
  kopfAnker: string;
  subs: ErwSub[];
}

/**
 * Gruppiert die Erwägungs-Blöcke nach Top-Ziffer und vergibt je Block seinen
 * stabilen Anker — die EINE Quelle der Erwägungs-Ankerbildung. Reihenfolge =
 * Dokument-Reihenfolge (Kopf vor seinen Unter-Erwägungen).
 */
export function gruppiereErwaegungen(bloecke: EntscheidBlock[]): ErwGruppe[] {
  const roh: { top: number; bloecke: EntscheidBlock[] }[] = [];
  for (const b of bloecke) {
    const top = segmente(b.marke)[0] ?? 0;
    const g = roh[roh.length - 1];
    if (!g || g.top !== top) roh.push({ top, bloecke: [b] });
    else g.bloecke.push(b);
  }
  return roh.map(({ top, bloecke: bl }) => {
    if (top === 0) {
      // Markenlose Erwägungen: reiner Fliesstext, KEINE Anker (kein «E. 0»).
      return { top, kopf: null, kopfAnker: '', subs: bl.map((block) => ({ block, anker: '' })) };
    }
    const erstesIstKopf = segmente(bl[0].marke).length === 1;
    const kopf = erstesIstKopf ? bl[0] : null;
    const subBloecke = erstesIstKopf ? bl.slice(1) : bl;
    const kopfAnker = `e-${top}`;
    const subs = subBloecke.map((block, i) => ({
      block,
      anker: block.marke ? ankerFuer(block.marke) : `${kopfAnker}-${i}`,
    }));
    return { top, kopf, kopfAnker, subs };
  });
}

/**
 * Anker der ERSTEN Erwägung, deren Text den Ziel-Artikel zitiert (inkl. der
 * per «i.V.m.»-Kette propagierten Glieder, `normVerweiseImText`) — für den
 * Norm-Chip-Sprung im Entscheid-Kopf. Vergleich über die aufgelöste Fedlex-URL
 * (Artikel-Anker, gesetz-genau); Absatz-Feinheiten spielen keine Rolle.
 * Gibt null zurück, wenn keine Erwägung den Artikel im Text nennt (dann fällt
 * der Reader auf die Regeste zurück).
 */
export function ersteFundstelle(abschnitte: EntscheidAbschnitt[], zielArtikel: string): string | null {
  const zielUrl = fedlexLinkFuerArtikel(zielArtikel);
  if (!zielUrl) return null;
  const erw = abschnitte.find((a) => a.typ === 'erwaegung');
  if (!erw) return null;
  for (const g of gruppiereErwaegungen(erw.bloecke)) {
    // Kopf vor Unter-Blöcken = Dokument-Reihenfolge; nur Blöcke MIT Anker.
    const eintraege: { text: string; anker: string }[] = [];
    if (g.kopf && g.kopfAnker) eintraege.push({ text: g.kopf.text, anker: g.kopfAnker });
    for (const s of g.subs) if (s.anker) eintraege.push({ text: s.block.text, anker: s.anker });
    for (const e of eintraege) {
      if (normVerweiseImText(e.text).some((sp) => fedlexLinkFuerArtikel(sp.artikel) === zielUrl)) {
        return e.anker;
      }
    }
  }
  return null;
}

/**
 * Anker der ERSTEN Erwägung, deren Text den Suchtext wörtlich enthält
 * (whitespace-normalisiert) — für den in-Text-Sprung der «Zitierte Entscheide»-
 * Gruppe (V1.3, W2·7-VZUI): «BGE 144 II 486» → die Erwägung, die das Zitat
 * trägt. Dieselbe Gruppier-/Anker-Wahrheit wie ersteFundstelle (§5); reine,
 * deterministische Textsuche (§2). null = kein Vorkommen in den Erwägungen.
 */
export function ersteTextFundstelle(abschnitte: EntscheidAbschnitt[], suchtext: string): string | null {
  const norm = (s: string) => s.replace(/\s+/g, ' ');
  const ziel = norm(suchtext).trim();
  if (!ziel) return null;
  const erw = abschnitte.find((a) => a.typ === 'erwaegung');
  if (!erw) return null;
  for (const g of gruppiereErwaegungen(erw.bloecke)) {
    const eintraege: { text: string; anker: string }[] = [];
    if (g.kopf && g.kopfAnker) eintraege.push({ text: g.kopf.text, anker: g.kopfAnker });
    for (const s of g.subs) if (s.anker) eintraege.push({ text: s.block.text, anker: s.anker });
    for (const e of eintraege) {
      if (norm(e.text).includes(ziel)) return e.anker;
    }
  }
  return null;
}

/**
 * Map «zitierteNorm → Fundstellen-Anker | null» für alle genannten Normen eines
 * Entscheids. `null` = keine Erwägungs-Fundstelle (Chip springt zur Regeste).
 * Rein/deterministisch — im Reader memoisiert.
 */
export function fundstellenFuerNormen(
  abschnitte: EntscheidAbschnitt[],
  zitierteNormen: string[],
): Map<string, string | null> {
  const m = new Map<string, string | null>();
  for (const norm of zitierteNormen) {
    if (m.has(norm)) continue;
    m.set(norm, ersteFundstelle(abschnitte, norm));
  }
  return m;
}
