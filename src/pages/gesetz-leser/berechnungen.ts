// QS-TOK/P5 (T14 Stufe 1): reine Berechnungs-/Helfer-Logik des Gesetz-Lesers,
// aus dem inhalt.tsx-Monolithen in eine Geschwister-Datei ausgelagert (§6 Ziff. 6,
// verhaltensneutral). Ausgelagert wird NUR Zustands-freie Rechenlogik — alle React-
// Hooks, Effekte und das Rendering bleiben in inhalt.tsx. Die useMemo-Rümpfe rufen
// diese Funktionen mit denselben Deps auf (byte-gleiche Ableitung, golden + e2e).
import type { RefObject } from 'react';
import { trenneAenderungshistorie, labelMitBereich } from '../../lib/normtext/darstellung';
import type { Sektion, StrukturMap } from '../../lib/normtext/browse';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { formatiereDatum, romanFrei } from './helpers';

// ─── Pane-Scoping-Helfer (B-2.5) — MODUL-Ebene = referenzstabil ────────────
// Bewusst KEIN React Compiler im Projekt → in-Komponente definierte Funktionen
// hätten je Render neue Identität und würden Effekte (IntersectionObserver,
// Hash-Sprung) bei jedem Render neu auslösen (Re-Render-/Scroll-Schleife). Als
// Modulfunktionen sind sie stabil und nicht Teil der Effect-Deps (nur die
// Primitiven `imPane` + die Ref `wurzel` zählen).
export function paneRoot(imPane: boolean, wurzel: RefObject<HTMLElement | null> | null): HTMLElement | null {
  return imPane ? wurzel?.current ?? null : null;
}
// W2·5d G3b (③/⑤): Anhang- (`annex_*`) bzw. Staatsvertrags-Protokoll-Token
// (`lvl_*`, LugÜ) — steuert die abgesetzte Anhang-Block-Darstellung (ArtikelLeser
// istAnhang) und das Unterdrücken des «Bereich»-Badges reiner Anhang-Sektionen.
// Modul-Ebene (referenzstabil, §15/4). Namespaces aus M13 (annex-Extraktion).
export function istAnhangToken(token: string): boolean {
  return /^(annex|lvl)_/i.test(token);
}
export function findeArt(root: HTMLElement | null, token: string): HTMLElement | null {
  if (!root) return document.getElementById(`art-${token}`);
  // CSS.escape: ein präparierter #hash-Token (z. B. mit «"]») darf den Selektor
  // nicht sprengen. getElementById (document-Pfad) ist ohnehin selektor-frei.
  const id = `art-${token}`;
  return root.querySelector(`#${typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id}`);
}

// Dokument-Position (Index des ersten enthaltenen Artikels) je Sektion — EINMAL
// bottom-up berechnet, damit renderSektion die Kinder + direkten Artikel eines
// Knotens in Dokument-Reihenfolge mischen kann, ohne pro Scroll-Render erneut den
// Teilbaum zu durchlaufen (6b: Knoten tragen seit der Randtitel-Promotion oft
// beides). Reine Darstellung (§3).
export function berechneSekPos(sektionen: Sektion[], eintraege: NormSnapshot[] | null): Map<string, number> {
  const pos = new Map<string, number>();
  const artPos = new Map<string, number>();
  (eintraege ?? []).forEach((e, i) => artPos.set(e.artikel, i));
  const walk = (s: Sektion): number => {
    let min = Infinity;
    for (const a of s.artikel) min = Math.min(min, artPos.get(a.artikel) ?? Infinity);
    for (const k of s.kinder) min = Math.min(min, walk(k));
    pos.set(s.id, min);
    return min;
  };
  for (const s of sektionen) walk(s);
  return pos;
}

// Rank 4 (QS-PERF, §6.4): Sektions-Bereichslabel («Art. 1–10») + Artikelzahl
// EINMAL bottom-up vorberechnen — statt 2× O(Subtree) je Sektion je Scroll-Render
// (bisher rief renderSektion sekBereich(s) UND sammleArtikel(s).length je Knoten,
// jeweils den Teilbaum sammelnd). Deps [sektionen, artIndex] → nur bei echtem
// Gliederungs-/Index-Wechsel neu. Die Label-Logik ist byte-identisch zur früheren
// sekBereich/sammleArtikel (golden/struktur-konsistenz grün). Reine Darstellung (§3).
export function berechneSektionMeta(
  sektionen: Sektion[],
  artIndex: Map<string, number>,
): Map<string, { bereich: string | undefined; einzel: boolean; anhang: boolean }> {
  const meta = new Map<string, { bereich: string | undefined; einzel: boolean; anhang: boolean }>();
  const sammle = (s: Sektion): NormSnapshot[] => {
    const arts = [...s.artikel, ...s.kinder.flatMap(sammle)];
    // W2·5d G3b (③/⑤): reine Anhang-/Protokoll-Sektion (alle Einträge sind
    // `annex_*`/`lvl_*`). Für sie ist ein «Bereich»-Badge sinnlos (die Labels
    // sind Anhang-/Protokoll-Titel, keine Artikel-Spanne) → unterdrückt; die
    // Einträge rendern als abgesetzte Anhang-Blöcke (istAnhang).
    const anhang = arts.length > 0 && arts.every((a) => istAnhangToken(a.artikel));
    let bereich: string | undefined;
    if (arts.length > 0 && !anhang) {
      let erst = arts[0], letzt = arts[0];
      for (const a of arts) {
        const idx = artIndex.get(a.artikel) ?? 0;
        if (idx < (artIndex.get(erst.artikel) ?? 0)) erst = a;
        if (idx > (artIndex.get(letzt.artikel) ?? 0)) letzt = a;
      }
      bereich = erst === letzt
        ? erst.artikelLabel
        : `${erst.artikelLabel}–${letzt.artikelLabel.replace(/^(Art\.|§)\s*/, '')}`;
    }
    meta.set(s.id, { bereich, einzel: arts.length === 1, anhang });
    return arts;
  };
  sektionen.forEach(sammle);
  return meta;
}

// W2·5d G2b (Sticky Section-Kontextkopf): Sektions-ID → kompaktes Anzeige-Label
// (der beschreibende Teil ohne «Erster Titel:»-Aufzähler, wie im TOC). EINMAL
// bottom-up aus dem Gliederungsbaum; die Kopf-Zeile mappt aktivIds darüber (keine
// neue Scroll-Infra). Reine Darstellung (§3).
export function berechneSekLabelById(sektionen: Sektion[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (s: Sektion) => {
    const { rest } = romanFrei(s.label);
    map.set(s.id, rest || s.label);
    s.kinder.forEach(walk);
  };
  sektionen.forEach(walk);
  return map;
}

// Erlass als Gesamtheit herunterladen (client-seitig, reiner Text).
export function baueErlassText(
  erlass: BrowseErlass,
  eintraege: NormSnapshot[],
  struktur: StrukturMap | null,
  titelRedundant: boolean,
): string {
  const L: string[] = [
    titelRedundant ? erlass.kuerzel : `${erlass.kuerzel} — ${erlass.titel}`,
    [erlass.sr ? `SR ${erlass.sr}` : '', erlass.stand ? `Stand ${formatiereDatum(erlass.stand)}` : ''].filter(Boolean).join(' · '),
    `Quelle: ${erlass.quelleUrl}`,
    'Heruntergeladen aus LexMetrik — massgeblich ist die amtliche Fassung (Live-Link).',
    '',
  ];
  let prev: string[] = [];
  for (const e of eintraege) {
    const st = struktur?.[e.artikel];
    const gl = st?.gliederung ?? [];
    for (let i = 0; i < gl.length; i++) {
      if (gl[i].label !== prev[i]) L.push('', `${'#'.repeat(Math.min(gl[i].ebene, 4))} ${gl[i].label}`);
    }
    prev = gl.map((g) => g.label);
    const m = st?.marginalie ?? [];
    L.push('', `${labelMitBereich(e.artikelLabel, e.artikel)}${m.length ? `  [${m.join(' · ')}]` : ''}`);
    for (const b of e.bloecke) {
      // Eingemischte Änderungshistorie (verdoppelte Fussnoten-Nr) abtrennen.
      const { wortlaut, historie } = trenneAenderungshistorie(b.text);
      const txt = wortlaut.trim() ? wortlaut : historie ? '[aufgehoben]' : b.text;
      L.push(`${b.absatz ? `${b.absatz} ` : ''}${txt}`);
      for (const it of b.items ?? []) L.push(`    ${it.marke}. ${it.text}`);
      // Extrahierte Historie nur, wenn keine amtliche Sidecar-Fussnote da ist
      // (sonst Doppelung mit der Fussnoten-Schleife unten).
      if (historie && !(st?.fussnoten?.length)) L.push(`    — ${historie}`);
    }
    for (const f of st?.fussnoten ?? []) L.push(`  [${f.nr}] ${f.text}`);
  }
  return L.join('\n');
}
