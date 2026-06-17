/**
 * Struktur-Extraktor (Bund): liest die amtliche GLIEDERUNG (Teil/Abteilung →
 * Titel → Abschnitt …) und die ARTIKEL-MARGINALIEN (Randtitel «A. / I. / 1. / a.»)
 * aus einem konsolidierten Fedlex-Filestore-HTML — je Artikel-Token.
 *
 * Reine Präsentations-Anreicherung (§3): erzeugt KEINEN Normtext, ändert die
 * Snapshots NICHT. Ergebnis landet als Sidecar (public/normtext/struktur/…),
 * das der Reader dazulädt. Golden/Generator bleiben unberührt.
 *
 * Verfahren (verifiziert an or.html, 17.6.2026): linearer Token-Lauf über
 * div/article-Öffnungen+Schliessungen (collapseable-Verschachtelung) plus
 * Überschrift-Erfassung. Jede <hN class="heading"> (N<6) ist eine Gliederungs-
 * stufe, jede <div class="heading"> eine Marginalien-stufe; beide «besitzen» die
 * unmittelbar folgende <div class="collapseable">, deren Inhalt (inkl. Artikel)
 * unter ihnen liegt. Ein Stack aus div/article (nur diese zählen fürs Nesting)
 * hält den aktuellen Gliederungs-/Marginalien-Kontext je Artikel.
 */

export interface ArtikelStruktur {
  /** Amtliche Gliederung von aussen nach innen (Teil → Titel → Abschnitt …). */
  gliederung: Array<{ ebene: number; label: string }>;
  /** Marginalien-Kette (Randtitel) von aussen nach innen. */
  marginalie: string[];
}

const TAG = /<(\/?)(div|article|h[1-6])\b([^>]*)>/gi;
const CLASS = /\bclass="([^"]*)"/i;
const ID = /\bid="(art_[^"]+)"/i;

function hatKlasse(attrs: string, name: string): boolean {
  const m = attrs.match(CLASS);
  return m ? m[1].split(/\s+/).includes(name) : false;
}

function reinText(html: string): string {
  return html
    // Fussnoten (<sup>…</sup> und footnote-Anker) entfernen — sie kleben sonst
    // als Ziffern am Überschrift-Text («Zehnter Titel:119 …»).
    .replace(/<sup\b[\s\S]*?<\/sup>/gi, '')
    .replace(/<a\b[^>]*class="[^"]*footnote[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Knoten { iscollaps: boolean; pushed: boolean }
interface Ktx { kind: 'g' | 'm'; ebene: number; label: string }

/** Extrahiert je Artikel-Token die Gliederung + Marginalie aus Fedlex-HTML. */
export function extrahiereStruktur(html: string): Record<string, ArtikelStruktur> {
  const result: Record<string, ArtikelStruktur> = {};
  const divstack: Knoten[] = [];
  const context: Ktx[] = [];
  let pending: Ktx | null = null;
  let cap: { start: number; tag: string } | null = null;

  for (const m of html.matchAll(TAG)) {
    const ist_close = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3] ?? '';
    const ende = (m.index ?? 0) + m[0].length;

    if (!ist_close) {
      const istHeading = hatKlasse(attrs, 'heading');
      if (/^h[1-6]$/.test(tag) && istHeading) {
        cap = { start: ende, tag }; // h nicht auf den div-Stack
        continue;
      }
      if (tag === 'div' || tag === 'article') {
        if (tag === 'article') {
          const id = attrs.match(ID);
          if (id) {
            result[id[1].slice(4)] = {
              gliederung: context.filter((c) => c.kind === 'g').map((c) => ({ ebene: c.ebene, label: c.label })),
              marginalie: context.filter((c) => c.kind === 'm').map((c) => c.label),
            };
          }
        }
        if (istHeading) cap = { start: ende, tag: 'div' };
        const knoten: Knoten = { iscollaps: hatKlasse(attrs, 'collapseable'), pushed: false };
        if (knoten.iscollaps && pending) { context.push(pending); knoten.pushed = true; pending = null; }
        divstack.push(knoten);
      }
      continue;
    }

    // Schliess-Tag
    if (cap && tag === cap.tag) {
      const label = reinText(html.slice(cap.start, m.index));
      cap = null;
      const hm = /^h([1-6])$/.exec(tag);
      if (label && !/^(Art\.|§)\s/.test(label)) {
        if (hm && Number(hm[1]) < 6) pending = { kind: 'g', ebene: Number(hm[1]), label };
        else if (!hm) pending = { kind: 'm', ebene: 0, label };
        else pending = null;
      } else {
        pending = null;
      }
    }
    if ((tag === 'div' || tag === 'article') && divstack.length) {
      const knoten = divstack.pop()!;
      if (knoten.pushed && context.length) context.pop();
    }
  }
  return result;
}
