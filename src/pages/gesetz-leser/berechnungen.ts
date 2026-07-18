// QS-TOK/P5 (T14 Stufe 1): reine Berechnungs-/Helfer-Logik des Gesetz-Lesers,
// aus dem inhalt.tsx-Monolithen in eine Geschwister-Datei ausgelagert (§6 Ziff. 6,
// verhaltensneutral). Ausgelagert wird NUR Zustands-freie Rechenlogik — alle React-
// Hooks, Effekte und das Rendering bleiben in inhalt.tsx. Die useMemo-Rümpfe rufen
// diese Funktionen mit denselben Deps auf (byte-gleiche Ableitung, golden + e2e).
import type { RefObject } from 'react';
import type { Sektion } from '../../lib/normtext/browse';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { romanFrei } from './helpers';

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
// (`lvl_*`, LugÜ) sowie Erklärungs-/Geltungsbereichs-Token (`decl_*`/`scope_*`,
// PR #195: Schweizer Erklärungen zu Staatsverträgen) — steuert die abgesetzte
// Anhang-Block-Darstellung (ArtikelLeser istAnhang) und das Unterdrücken des
// «Bereich»-Badges reiner Anhang-Sektionen. Modul-Ebene (referenzstabil, §15/4).
// Namespaces aus M13 (annex-Extraktion) + Anhang-Scanner (scope_|decl_).
export function istAnhangToken(token: string): boolean {
  return /^(annex|lvl|decl|scope)_/i.test(token);
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

// ─── W2·5d U-POSITION (A2): per-Artikel-Höhenschätzung ──────────────────────
//
// Wurzel des Scrollbalken-Bugs (David 5.7.2026): die Artikel-Knoten tragen
// `content-visibility:auto` mit EINEM flachen `contain-intrinsic-size: auto 320px`
// (index.css) — ein 40-Absatz-Artikel (z. B. OR Art. 336c-Kontext) und ein
// Einzeiler reservieren beide 320px Platzhalter-Höhe. Die Summe der Platzhalter
// (= die Dokumenthöhe VOR dem Rendern) weicht dadurch stark von der echten Höhe
// ab → der Scrollbalken ist nicht proportional («Daumen ganz nach unten = nur
// Gesetzes-Mitte», und die Höhe wächst beim Durchscrollen nach).
//
// Fix (§15-treu, KEIN Logikverlust): jeder Artikel bekommt eine DETERMINISTISCH
// aus seinem Snapshot geschätzte Platzhalter-Höhe (inline `contain-intrinsic-size`,
// überschreibt den 320px-Default der `.nt-art-cv`-Klasse). `content-visibility:auto`
// BLEIBT — Off-Screen-Artikel überspringen weiterhin Layout/Paint, jeder Knoten
// bleibt im DOM (Ctrl+F/Anker/Screenreader/Druck unberührt). Nur der Platzhalter-
// Schätzwert wird von einer Konstante auf eine inhalts-proportionale Zahl gehoben →
// die Summe (Dokumenthöhe) trifft die Realität deutlich besser, der Scrollbalken
// wird proportional. Sobald ein Artikel EINMAL gerendert wurde, merkt sich der
// Browser über das `auto`-Schlüsselwort ohnehin die ECHTE Höhe (kein Springen).
//
// Reine Darstellung (§3) + rein deterministisch (§2): Funktion nur des Snapshots,
// keine DOM-/Zeitzugriffe → unit-testbar. Golden/Prerender unberührt (der
// String-Builder `erlassVolltextHtml` emittiert kein `nt-art-cv` — die
// content-visibility-Optimierung existiert nur im Client-Reader).
//
// Kalibrierung: Lesespalte `max-w-normtext` (≈ 42rem ≈ 672px, E6/A37), Serif-Body
// ~18px × 1.65 ≈ 30px/Zeile, ~71 Zeichen je Lesezeile. Der Zeilen-Teiler unten (68)
// bleibt bewusst knapper als die reale ~71-ch-Zeile → die Schätzung fällt eher etwas
// zu HOCH aus (mehr angenommene Zeilen) = die gewünschte konservative Richtung
// («echte Höhe ≤ Schätzung»). Die Konstanten müssen nicht
// pixelgenau sein — für einen proportionalen Balken zählt das VERHÄLTNIS der
// Artikel zueinander. Bewusst leicht grosszügig (echte Höhe ≤ Schätzung), damit
// die Höhe beim Rendern eher schrumpft (Daumen kriecht hoch) als „wegläuft".
export const A2_HOEHE_FALLBACK = 320; // = index.css-Default; Schätzung ohne Blöcke
function textZeilen(text: string | undefined, proZeile = 68): number {
  return Math.max(1, Math.ceil((text?.length ?? 0) / proZeile));
}
export function schaetzeArtikelHoehe(e: NormSnapshot): number {
  const ZEILE = 30;        // px je Fliesstext-Zeile
  let h = 104;             // Artikelkopf: «Art. N» + Trenner (border-t + pt-7 mt-7) + Basisabstand
  if (e.titel) h += 30;    // amtlicher Randtitel/Sachüberschrift (eine Zeile)
  for (const b of e.bloecke) {
    // M13-Annex-Zwischenüberschrift (titel = Heading-Tiefe): kompakte Titelzeile.
    if (b.titel) { h += 40; continue; }
    h += textZeilen(b.text) * ZEILE + 10;       // Absatz + Abstand (space-y-5 ≈ 10px)
    for (const it of b.items ?? []) h += textZeilen(it.text, 62) * (ZEILE - 2) + 4; // lit./Ziff.
    if (b.tabelle) h += b.tabelle.length * 28 + 14;                                  // Füllpunkt-Tarif
    if (b.mehrspaltig) h += (b.mehrspaltig.zeilen.length + 1) * 30 + 14;             // Mehrspalten-Tabelle inkl. Kopf
  }
  return Math.max(120, Math.round(h));
}
