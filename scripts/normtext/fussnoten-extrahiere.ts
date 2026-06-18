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

export interface FnLink { label: string; url: string }
export interface Fussnote { nr: string; text: string; links: FnLink[]; absatz?: string | null }

function clean(s: string): string {
  return s
    .replace(/<sup\b[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|\u00a0/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extrahiert je Artikel-Token die Fussnoten (in Erst-Vorkommens-Reihenfolge). */
export function extrahiereFussnoten(html: string): Record<string, Fussnote[]> {
  // 1) Globale Definitionen: id → Fussnote
  const defs = new Map<string, Fussnote>();
  for (const m of html.matchAll(/<p[^>]*\bid="(fn-[^"]+)"[^>]*>([\s\S]*?)<\/p>/gi)) {
    const id = m[1];
    const roh = m[2];
    const nr = roh.match(/<a[^>]*href="#fnbck-[^"]*"[^>]*>(\d+[a-z]?)<\/a>/i)?.[1] ?? '';
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

  // 2) Je Artikel: Inline-Marker (#fn-…) in Dokumentreihenfolge auflösen und
  //    dem Absatz zuordnen, in dem der Marker steht. Absatz-Container =
  //    <p class="…absatz…">; dessen führendes <sup> ohne <a>-Kind und nur
  //    Ziffern/[a-z] ist die Absatznummer (gleiche Regel wie der Snapshot-
  //    Extraktor). Marker ausserhalb eines Absatz-<p> (Artikelkopf/Marginalie)
  //    → absatz: null (Artikelebene).
  const perArtikel: Record<string, Fussnote[]> = {};
  for (const am of html.matchAll(/<article[^>]*\bid="art_([^"]+)"[^>]*>([\s\S]*?)<\/article>/gi)) {
    const token = am[1];
    const body = am[2];
    // fn-id → Absatznummer (erstes Vorkommen). Absatz-<p> UND <dl>-Aufzählungen
    // in DOKUMENTREIHENFOLGE durchgehen (gleiche Logik wie der Snapshot-Extraktor,
    // der die <dl> dem vorausgehenden Absatz als items anhängt): Marker in einer
    // <dl> gehören zum zuletzt gesehenen Absatz, nicht zur Artikelebene.
    const fnAbsatz = new Map<string, string | null>();
    let letzterAbsatz: string | null = null;
    const blockRe = /<p[^>]*\bclass="[^"]*\babsatz\b[^"]*"[^>]*>([\s\S]*?)<\/p>|<dl[^>]*>([\s\S]*?)<\/dl>/gi;
    for (const m of body.matchAll(blockRe)) {
      let seg: string;
      if (m[1] !== undefined) {
        seg = m[1];
        const supM = seg.match(/^(?:\s|&nbsp;)*<sup(?:[^>]*)>([\s\S]*?)<\/sup>/i);
        letzterAbsatz = supM && !/<a[\s>]/i.test(supM[1]) && /^\d+[a-z]?$/.test(supM[1].trim())
          ? supM[1].trim() : null;
      } else {
        seg = m[2]; // <dl> → dem letzten Absatz zuordnen
      }
      for (const fm of seg.matchAll(/\bhref="#(fn-[^"]+)"/gi)) {
        if (!fnAbsatz.has(fm[1])) fnAbsatz.set(fm[1], letzterAbsatz);
      }
    }
    const gesehen = new Set<string>();
    const liste: Fussnote[] = [];
    for (const mm of body.matchAll(/\bhref="#(fn-[^"]+)"/gi)) {
      const id = mm[1];
      if (gesehen.has(id)) continue;
      gesehen.add(id);
      const def = defs.get(id);
      if (def) liste.push({ ...def, absatz: fnAbsatz.has(id) ? fnAbsatz.get(id)! : null });
    }
    if (liste.length) perArtikel[token] = liste;
  }
  return perArtikel;
}
