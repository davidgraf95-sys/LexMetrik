/**
 * Fussnoten-Extraktor (Bund): liest die amtlichen Fussnoten je Artikel aus dem
 * Fedlex-Filestore-HTML — Änderungs-/Quellenhinweise («Fassung gemäss …, in Kraft
 * seit …», «Aufgehoben durch …») samt AS-/BBl-Verweisen und deren Links.
 *
 * Reine Präsentations-Anreicherung (§3): keine Normtext-Erzeugung, Snapshots
 * unberührt. Ergebnis fliesst in die Struktur-Sidecars (struktur-run.ts).
 *
 * HTML-Struktur (verifiziert or.html 17.6.2026):
 *  - Inline-Marker im Artikel: <sup><a href="#fn-XXX" id="fnbck-XXX">N</a></sup>
 *  - Definition: <div class="footnotes"><p id="fn-XXX"><sup><a href="#fnbck-XXX">N</a></sup>
 *    TEXT <a href="https://fedlex.data.admin.ch/eli/oc/…">AS …</a> …</p></div>
 *    (eli/oc = Amtliche Sammlung, eli/fga = Bundesblatt)
 */

import { findeDlEnde, findeDdEnde, ankerZuToken } from './extrahiere-fedlex';

export interface FnLink { label: string; url: string }
export interface Fussnote {
  nr: string; text: string; links: FnLink[];
  absatz?: string | null; item?: string | null;
  /** G11: geh\u00f6rt diese Fussnote zu einer \u00dcberschrift/einem Randtitel (section-
   *  heading-footnote), tr\u00e4gt `sektion` dessen Label \u2192 Marker am Sektions-Kopf. */
  sektion?: string;
}

// G15: Hervorhebungen (fett/kursiv) im Fussnotentext bleiben erhalten \u2014 Fedlex
// setzt AS-/BBl-/SR-Nummern in <b> und Verweise teils in <i>. <b>/<i> werden auf
// bare Tags normalisiert (Attribute weg) und behalten, alle anderen Tags fallen.
// fnTextMitLinks (Lesesicht) rendert daraus Rich-Text; die Link-Label-Erkennung
// und die SR-Erkennung (M11) strippen die Tags wieder, bleiben also robust.
function clean(s: string): string {
  return s
    .replace(/<sup\b[\s\S]*?<\/sup>/gi, '')
    .replace(/<(b|i)\b[^>]*>/gi, (_m, t: string) => `<${t.toLowerCase()}>`)
    .replace(/<\/(b|i)\s*>/gi, (_m, t: string) => `</${t.toLowerCase()}>`)
    .replace(/<(?!\/?[bi]>)[^>]*>/g, '')
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .replace(/<([bi])>\s*<\/\1>/gi, '') // leere Hervorhebungen (Fedlex-Artefakt)
    .trim();
}

/** Globale Fussnoten-Definitionen (id → {nr,text,links}) aus dem ganzen HTML —
 *  inkl. der «section-heading-footnote»-Definitionen. */
export function fnDefinitionen(html: string): Map<string, Fussnote> {
  const defs = new Map<string, Fussnote>();
  for (const m of html.matchAll(/<p[^>]*\bid="(fn-[^"]+)"[^>]*>([\s\S]*?)<\/p>/gi)) {
    const id = m[1];
    const roh = m[2];
    // FN-1: Nummer primär aus dem #fnbck-Back-Link (neue Fedlex-Generation, z. B.
    // OR/ZGB). 22 ältere Aspose-Dumps (VZG, ENTG, KOV, FZA, LugÜ …) tragen KEIN
    // fnbck, sondern definieren die Note als «<p id="fn-…"><sup>N</sup>TEXT» —
    // dann die führende <sup>-Ziffer als Fallback lesen (matcht 226/226 VZG). Der
    // Marker-<sup> wird ohnehin von clean() aus dem Text gestrippt (kein Zusatz-Strip).
    const nr = roh.match(/<a[^>]*href="#fnbck-[^"]*"[^>]*>(\d+[a-z]?)<\/a>/i)?.[1]
      ?? roh.match(/^\s*<sup[^>]*>(\d+[a-z]?)<\/sup>/i)?.[1]
      ?? '';
    // Links (AS/BBl etc.) vor dem Tag-Strippen sammeln.
    const links: FnLink[] = [];
    for (const a of roh.matchAll(/<a[^>]*\bhref="(https?:\/\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
      const label = clean(a[2]);
      if (label) links.push({ label, url: a[1] });
    }
    // Back-Marker (führende Nummer) vor dem Text entfernen, Rest als Text.
    const ohneBack = roh.replace(/<sup\b[^>]*>\s*<a[^>]*href="#fnbck-[^"]*"[\s\S]*?<\/sup>/i, '');
    defs.set(id, { nr, text: clean(ohneBack), links });
  }
  return defs;
}

/** Extrahiert je Artikel-Token die Fussnoten (in Erst-Vorkommens-Reihenfolge). */
export function extrahiereFussnoten(html: string): Record<string, Fussnote[]> {
  const defs = fnDefinitionen(html);

  // 2) Je Artikel: Inline-Marker (#fn-…) in Dokumentreihenfolge auflösen und
  //    dem Absatz zuordnen, in dem der Marker steht. Absatz-Container =
  //    <p class="…absatz…">; dessen führendes <sup> ohne <a>-Kind und nur
  //    Ziffern/[a-z] ist die Absatznummer (gleiche Regel wie der Snapshot-
  //    Extraktor). Marker ausserhalb eines Absatz-<p> (Artikelkopf/Marginalie)
  //    → absatz: null (Artikelebene).
  const perArtikel: Record<string, Fussnote[]> = {};
  // Drop-Fix (M13): Haupttext-Artikel «art_…» UND Schlussbestimmungs-/UeB-Artikel
  // «disp_uN/art_…» (auch «disp_N/art_…» ohne «u», z. B. VZG). Die alte Regex
  // «id="art_…"» verfehlte die disp-IDs → deren Fussnoten-Marker fielen ganz weg
  // (17 VZG-Noten). ID-Schema + Token-Bildung IDENTISCH zu struktur-extrahiere.ts
  // (ankerZuToken), damit der Join in struktur-run.ts greift.
  for (const am of html.matchAll(/<article[^>]*\bid="((?:disp_u?\d+\/)?art_[^"]+)"[^>]*>([\s\S]*?)<\/article>/gi)) {
    const token = ankerZuToken(am[1]);
    const body = am[2];
    // fn-id → Absatznummer (erstes Vorkommen). Absatz-<p> UND <dl>-Aufzählungen
    // in DOKUMENTREIHENFOLGE durchgehen (gleiche Logik wie der Snapshot-Extraktor,
    // der die <dl> dem vorausgehenden Absatz als items anhängt): Marker in einer
    // <dl> gehören zum zuletzt gesehenen Absatz, nicht zur Artikelebene.
    const fnAbsatz = new Map<string, string | null>();
    const fnItem = new Map<string, string | null>(); // lit/Ziff-Marke des Items, in dem der Marker steht
    let letzterAbsatz: string | null = null;
    const setze = (id: string, item: string | null) => {
      if (!fnAbsatz.has(id)) { fnAbsatz.set(id, letzterAbsatz); fnItem.set(id, item); }
    };
    // C1-4: <dl> BALANCIERT (findeDlEnde/findeDdEnde) statt non-greedy — sonst
    // stoppte der Block am inneren </dl> verschachtelter Listen (lit. -> Ziff.) und
    // die Marker der Eltern-Items NACH der Unterliste fielen auf die Artikelebene.
    // Marker im <dt>+Einleitungstext gehoeren zu DIESER Marke; verschachtelte
    // Unterlisten werden rekursiv der tieferen Marke zugeordnet.
    const MARKE = /^([0-9]+(?:bis|ter|quater|quinquies)?[a-z]?|[a-z](?:bis|ter|quater|quinquies)?)\s*[.)]?/i;
    const walkDl = (dlInner: string): number => {
      const dtRe = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>/gi;
      let dm: RegExpExecArray | null;
      let paare = 0;
      while ((dm = dtRe.exec(dlInner)) !== null) {
        paare++;
        const ddStart = dtRe.lastIndex;
        const ddEnde = findeDdEnde(dlInner, ddStart);
        const ddRoh = dlInner.slice(ddStart, ddEnde);
        dtRe.lastIndex = ddEnde + '</dd>'.length;
        const markeRoh = dm[1].replace(/<sup[^>]*><a[\s\S]*?<\/a><\/sup>/gi, '')
          .replace(/<[^>]+>/g, '').replace(/&nbsp;|\u00a0/g, ' ').trim();
        const mk = markeRoh.match(MARKE);
        const item = mk ? mk[1].toLowerCase() : null;
        const subDlIdx = ddRoh.search(/<dl\b[^>]*>/i);
        const ddVorListe = subDlIdx >= 0 ? ddRoh.slice(0, subDlIdx) : ddRoh;
        for (const fm of (dm[1] + ddVorListe).matchAll(/\bhref="#(fn-[^"]+)"/gi)) setze(fm[1], item);
        if (subDlIdx >= 0) {
          const subEnde = findeDlEnde(ddRoh, subDlIdx);
          const subOpenLen = ddRoh.slice(subDlIdx).match(/^<dl\b[^>]*>/i)![0].length;
          walkDl(ddRoh.slice(subDlIdx + subOpenLen, subEnde - '</dl>'.length));
        }
      }
      return paare;
    };
    // Block-Walk in DOKUMENTREIHENFOLGE: <p ...absatz...> ODER balancierte <dl>.
    const blockStart = /<p[^>]*\bclass="[^"]*\babsatz\b[^"]*"[^>]*>|<dl\b[^>]*>/gi;
    let bm: RegExpExecArray | null;
    while ((bm = blockStart.exec(body)) !== null) {
      if (bm[0].toLowerCase().startsWith('<p')) {
        const pEnd = body.indexOf('</p>', blockStart.lastIndex);
        const seg = body.slice(blockStart.lastIndex, pEnd < 0 ? body.length : pEnd);
        const supM = seg.match(/^(?:\s|&nbsp;)*<sup(?:[^>]*)>([\s\S]*?)<\/sup>/i);
        letzterAbsatz = supM && !/<a[\s>]/i.test(supM[1]) && /^\d+(?:bis|ter|quater|quinquies)?[a-z]?$/.test(supM[1].trim())
          ? supM[1].trim() : null;
        for (const fm of seg.matchAll(/\bhref="#(fn-[^"]+)"/gi)) setze(fm[1], null);
        if (pEnd >= 0) blockStart.lastIndex = pEnd + '</p>'.length;
      } else {
        const dlEnde = findeDlEnde(body, bm.index);
        const dlInner = body.slice(bm.index + bm[0].length, dlEnde - '</dl>'.length);
        if (!walkDl(dlInner)) for (const fm of dlInner.matchAll(/\bhref="#(fn-[^"]+)"/gi)) setze(fm[1], null);
        blockStart.lastIndex = dlEnde;
      }
    }
    const gesehen = new Set<string>();
    const liste: Fussnote[] = [];
    for (const mm of body.matchAll(/\bhref="#(fn-[^"]+)"/gi)) {
      const id = mm[1];
      if (gesehen.has(id)) continue;
      gesehen.add(id);
      const def = defs.get(id);
      if (def) liste.push({ ...def, absatz: fnAbsatz.has(id) ? fnAbsatz.get(id)! : null, item: fnItem.get(id) ?? null });
    }
    if (liste.length) perArtikel[token] = liste;
  }
  return perArtikel;
}
