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
 *
 * M13: erfasst auch die Schlusstitel-/UeB-Divisionen (`<article id="disp_uN/art_*">`,
 * gewickelt in `<div id="dispositions">`). Die Überschriften-Erfassung (h1/h2/
 * div.heading + section-heading-footnote) gilt dort unverändert; nur die ID-Regex
 * öffnet das disp-Anker-Schema. Der Sidecar-Schlüssel wird über ankerZuToken
 * IDENTISCH zum Snapshot-`artikel`-Token gebildet (sonst bräche der Join).
 */

import { ankerZuToken } from './extrahiere-fedlex.ts';

export interface ArtikelStruktur {
  /** Amtliche Gliederung von aussen nach innen (Teil → Titel → Abschnitt …). */
  gliederung: Array<{ ebene: number; label: string }>;
  /** Marginalien-Kette (Randtitel) von aussen nach innen. */
  marginalie: string[];
  /** Fussnoten, die an einer Überschrift/einem Randtitel über diesem Artikel
   *  hängen (section-heading-footnote) — am ERSTEN Artikel unter der Überschrift.
   *  G11: die ASSOZIATION zur konkreten Überschrift (label + kind) bleibt erhalten,
   *  damit der Marker am richtigen Sektions-/Randtitel-Kopf gesetzt werden kann
   *  (statt anonym auf Artikelebene zu fallen). */
  randtitelFn?: Array<{ fnId: string; label: string; kind: 'g' | 'm' }>;
}

const TAG = /<(\/?)(div|article|h[1-6])\b([^>]*)>/gi;
const CLASS = /\bclass="([^"]*)"/i;
// M13: Haupttext-Artikel «art_…» ODER Schlusstitel-/UeB-Artikel «disp_uN/art_…».
// Strukturelle Anker (disp_u1/chap_1, …/lvl_A) tragen kein «art_» → ausgeschlossen.
const ID = /\bid="((?:disp_u\d+\/)?art_[^"]+)"/i;

function hatKlasse(attrs: string, name: string): boolean {
  const m = attrs.match(CLASS);
  return m ? m[1].split(/\s+/).includes(name) : false;
}

function reinText(html: string): string {
  return html
    // Fussnoten-<sup> (mit <a>-Anker ODER Zahl) entfernen — sie kleben sonst als
    // Ziffern am Titel («Zehnter Titel:119 …»). ABER Ordinal-Suffixe «bis/ter …»
    // (<sup>bis</sup>, reine Buchstaben) BLEIBEN — sie gehören zum Titel
    // («Zweiter Titel» + «bis» = «Zweiter Titelbis», Art. 89a ff. ZGB).
    .replace(/<sup\b[^>]*>(?:(?!<\/sup>)[\s\S])*?<\/sup>/gi, (m) => (/(<a\b|\d)/i.test(m) ? '' : m))
    .replace(/<a\b[^>]*class="[^"]*footnote[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Sachtitel aus einer Artikel-eigenen h6-Überschrift (BV/ZPO/StPO-Manier:
// «Art. 5 Grundsätze rechtsstaatlichen Handelns»). Fedlex setzt die ARTIKEL-
// NUMMER in <b>/<i> und Fussnoten in <sup>; der verbleibende Klartext ist der
// Sachtitel. Robuster als Text-Parsing: behält lowercase-Initialen
// («b»+«undesrechtliche»), Enumeratoren («b. Bei- und Austritt») und Titel
// nach kombinierten Nummern, verwirft aber reine Nummern-Fortsetzungen
// («Art. 370 und 371» → bleibt «und» → kein Titel) und «…»-Platzhalter.
function artikelSachtitel(roh: string): string | null {
  const titel = reinText(
    roh
      .replace(/<sup\b[\s\S]*?<\/sup>/gi, '')   // Fussnoten-Marker
      .replace(/<b\b[^>]*>[\s\S]*?<\/b>/gi, '') // Artikelnummer (fett)
      .replace(/<i\b[^>]*>[\s\S]*?<\/i>/gi, ''), // Nummern-Suffix (kursiv)
  );
  if (!titel || /^(?:und|et|…|\.\.\.|[–-])$/i.test(titel)) return null;
  return titel;
}

interface Knoten { iscollaps: boolean; pushed: boolean }
interface Ktx { kind: 'g' | 'm'; ebene: number; label: string; fnIds: string[]; attached: boolean }

/** Extrahiert je Artikel-Token die Gliederung + Marginalie aus Fedlex-HTML. */
export function extrahiereStruktur(html: string): Record<string, ArtikelStruktur> {
  const result: Record<string, ArtikelStruktur> = {};
  const divstack: Knoten[] = [];
  const context: Ktx[] = [];
  let pending: Ktx | null = null;
  let cap: { start: number; tag: string } | null = null;
  let artId: string | null = null; // aktuell offener Artikel (für die fusionierte h6-Marginalie)

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
            // Section-heading-Fussnoten: am ERSTEN Artikel unter der Überschrift
            // anhängen (Vorfahren mit noch nicht zugeordneten fnIds). G11: jede
            // fnId behält ihr Quell-Heading (label + kind), damit der Marker später
            // am richtigen Kopf gesetzt werden kann.
            const rfn: Array<{ fnId: string; label: string; kind: 'g' | 'm' }> = [];
            for (const c of context) {
              if (c.fnIds.length && !c.attached) {
                for (const fnId of c.fnIds) rfn.push({ fnId, label: c.label, kind: c.kind });
                c.attached = true;
              }
            }
            artId = ankerZuToken(id[1]);
            result[artId] = {
              gliederung: context.filter((c) => c.kind === 'g').map((c) => ({ ebene: c.ebene, label: c.label })),
              marginalie: context.filter((c) => c.kind === 'm').map((c) => c.label),
              ...(rfn.length ? { randtitelFn: rfn } : {}),
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
      const roh = html.slice(cap.start, m.index);
      const label = reinText(roh);
      // Fussnoten-Marker AN der Überschrift (vor dem Strippen) erfassen.
      const fnIds = [...roh.matchAll(/href="#(fn-[^"]+)"/gi)].map((x) => x[1]);
      cap = null;
      const hm = /^h([1-6])$/.exec(tag);
      if (label && !/^(Art\.|§)\s/.test(label)) {
        if (hm && Number(hm[1]) < 6) pending = { kind: 'g', ebene: Number(hm[1]), label, fnIds, attached: false };
        else if (!hm) pending = { kind: 'm', ebene: 0, label, fnIds, attached: false };
        else pending = null;
      } else {
        // Artikel-eigene h6-Überschrift («Art. N <Sachtitel>», BV/ZPO/StPO-Manier):
        // den Sachtitel strukturell aus dem h6-Markup ziehen und als Marginalie
        // dieses Artikels erfassen — nur wenn er sonst keine div.heading-Kontext-
        // Marginalie hat (OR/ZGB unberührt: deren h6 = nur «Art. N» → kein Titel).
        if (hm && Number(hm[1]) === 6 && artId && result[artId]?.marginalie.length === 0) {
          const titel = artikelSachtitel(roh);
          if (titel) result[artId].marginalie = [titel];
        }
        pending = null;
      }
    }
    if (tag === 'article') artId = null;
    if ((tag === 'div' || tag === 'article') && divstack.length) {
      const knoten = divstack.pop()!;
      if (knoten.pushed && context.length) context.pop();
    }
  }
  return result;
}
