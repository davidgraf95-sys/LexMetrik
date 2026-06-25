// ─── SEO-Metadaten + Volltext-HTML für Detail-Seiten (W1.1, 25.6.2026) ──────
//
// Dossier: docs/ssg-diagnose.md
// Auftrag: FAHRPLAN-SEO-A11Y-GOVERNANCE.md (W1.1–W1.3 — Detailseiten indexierbar).
//
// SSR-/build-safe: KEIN fetch, KEIN window, KEIN Date.now(). Das Prerender-
// Skript (scripts/prerender.ts) liest die Manifeste + Snapshot-Dateien vom
// Dateisystem und ruft diese reinen Funktionen. Erzeugt indexierbares HTML für
// /gesetze/:ebene/:key und /rechtsprechung/:key — React ERSETZT es clientseitig
// (render-then-replace, kein hydrate, s. docs/ssg-diagnose.md §5), deshalb darf
// das HTML den React-Output nicht matchen; es ist reiner Crawler-/First-Paint-
// Inhalt.
//
// §7/§8: Titel/Meta/JSON-LD NUR aus Strukturfeldern der Manifeste. Der Volltext
// stammt WÖRTLICH aus dem Snapshot (dieselbe kanonische Quelle, die der Reader
// fetcht — keine zweite Wahrheit). KEINE kuratierten Beschreibungen, KEINE
// Geltungsaussage: schema.org legislationLegalForce/legislationDate bleiben aus
// (snapshot ≠ in Kraft — TODO(David), Welle ab 1.12.2026).

import { SITE_URL, type RouteMetadaten } from './seo';
import { GEBIET_LABEL } from './normtext/register';
import type { BrowseErlass } from './normtext/browse-typen';
import type { NormSnapshotDatei } from './normtext/typen';
import type { BrowseEntscheid } from './rechtsprechung/register';
import type { EntscheidSnapshot } from './rechtsprechung/typen';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** sprache-Code → BCP-47 für inLanguage (mechanisch, keine Annahme). */
function inSprache(s: string): string {
  return s === 'de' ? 'de-CH' : s === 'fr' ? 'fr-CH' : s === 'it' ? 'it-CH' : s;
}

// ─── Pfade ─────────────────────────────────────────────────────────────────
// encodeURIComponent lässt A-Za-z0-9 und _ . - ! ~ * ' ( ) unberührt; Bund-Keys
// (UPPERCASE/_/Ziffern) bleiben damit identisch, Sonderzeichen (kantonale Keys
// mit Leerzeichen) werden korrekt prozentkodiert — Pfad == sitemap-loc ==
// canonical == Dateiname-Basis, durchgehend eine Form.

export function erlassDetailPfad(e: Pick<BrowseErlass, 'ebene' | 'key'>): string {
  return `/gesetze/${e.ebene}/${encodeURIComponent(e.key)}`;
}

export function entscheidDetailPfad(e: Pick<BrowseEntscheid, 'key'>): string {
  return `/rechtsprechung/${encodeURIComponent(e.key)}`;
}

// ─── Metadaten (mechanisches Template, kein Rechtstext §7) ───────────────────

export function metaFuerErlass(e: BrowseErlass): RouteMetadaten {
  const pfad = erlassDetailPfad(e);
  const srTeil = e.sr ? `, SR ${e.sr}` : '';
  return {
    pfad,
    titel: `${e.titel} (${e.kuerzel}${srTeil}) — LexMetrik`,
    beschreibung:
      `Volltext von ${e.kuerzel}${e.sr ? ` (SR ${e.sr})` : ''} – ${e.titel}. ` +
      `Stand ${e.stand}, mit Live-Link zur amtlichen Fassung. ` +
      `Massgeblich ist die amtliche Quelle; keine Rechtsberatung.`,
    canonical: SITE_URL + pfad,
  };
}

export function metaFuerEntscheid(e: BrowseEntscheid): RouteMetadaten {
  const pfad = entscheidDetailPfad(e);
  const bge = e.bgeReferenz ? ` (${e.bgeReferenz})` : '';
  return {
    pfad,
    titel: `${e.zitierung}${bge} — LexMetrik`,
    beschreibung:
      `${e.gerichtName}: ${e.zitierung}${bge}, ${e.datum}. ` +
      `Entscheid im Volltext auf LexMetrik, mit den zitierten Normen verzahnt und ` +
      `Live-Link zur amtlichen Fassung. Keine Rechtsberatung.`,
    canonical: SITE_URL + pfad,
  };
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────
// Erlass: schema.org Legislation + BreadcrumbList. NUR Identitätsfelder
// (legislationIdentifier = SR, name, alternateName, inLanguage, url) — KEINE
// legislationLegalForce/legislationDate (Geltungsaussage = TODO(David)).
// Entscheid: NUR BreadcrumbList — schema.org hat keinen validen Gerichtsentscheid-
// Typ; nichts erfinden (§8). Reicher Kopf + Meta tragen die Indexierung.

function breadcrumb(stufen: Array<{ name: string; pfad: string }>): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: stufen.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.name,
      item: SITE_URL + s.pfad,
    })),
  };
}

export function jsonLdFuerErlass(e: BrowseErlass): object {
  const pfad = erlassDetailPfad(e);
  const legislation: Record<string, unknown> = {
    '@type': 'Legislation',
    name: e.titel,
    alternateName: e.kuerzel,
    inLanguage: inSprache(e.sprache),
    url: SITE_URL + pfad,
    isPartOf: { '@type': 'WebSite', name: 'LexMetrik', url: `${SITE_URL}/` },
  };
  if (e.sr) legislation.legislationIdentifier = e.sr;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      legislation,
      breadcrumb([
        { name: 'Gesetze', pfad: '/gesetze' },
        { name: GEBIET_LABEL[e.rechtsgebiet], pfad: '/gesetze' },
        { name: e.kuerzel, pfad },
      ]),
    ],
  };
}

export function jsonLdFuerEntscheid(e: BrowseEntscheid): object {
  const pfad = entscheidDetailPfad(e);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        { name: 'Rechtsprechung', pfad: '/rechtsprechung' },
        { name: e.gerichtName, pfad: '/rechtsprechung' },
        { name: e.nummer, pfad },
      ]),
    ],
  };
}

// ─── Volltext-HTML (wörtlich aus dem Snapshot) ───────────────────────────────

function bloeckeHtml(
  bloecke: NormSnapshotDatei['eintraege'][number]['bloecke'],
): string {
  let out = '';
  for (const b of bloecke) {
    const marke = b.absatz ? `<sup>${esc(b.absatz)}</sup> ` : '';
    if (b.text) out += `<p>${marke}${esc(b.text)}</p>`;
    else if (b.absatz) out += `<p>${marke}</p>`;
    if (b.items?.length) {
      out += '<ul>' + b.items.map((i) => `<li><b>${esc(i.marke)}</b> ${esc(i.text)}</li>`).join('') + '</ul>';
    }
    if (b.tabelle?.length) {
      out +=
        '<table><tbody>' +
        b.tabelle.map((z) => `<tr><td>${esc(z.beschreibung)}</td><td>${esc(z.betrag)}</td></tr>`).join('') +
        '</tbody></table>';
    }
    if (b.mehrspaltig?.zeilen.length) {
      const kopf = b.mehrspaltig.kopf?.length
        ? '<thead><tr>' + b.mehrspaltig.kopf.map((k) => `<th>${esc(k)}</th>`).join('') + '</tr></thead>'
        : '';
      const zeilen = b.mehrspaltig.zeilen
        .map((z) => '<tr>' + z.map((c) => `<td>${esc(c)}</td>`).join('') + '</tr>')
        .join('');
      out += `<table>${kopf}<tbody>${zeilen}</tbody></table>`;
    }
  }
  return out;
}

/** Volltext-HTML eines Erlasses: Kopf (Identität + Live-Link) + alle Artikel.
 *  Eine <h1>; Artikel als <article><h2>. */
export function erlassVolltextHtml(e: BrowseErlass, datei: NormSnapshotDatei): string {
  const srZeile = e.sr ? ` · SR ${esc(e.sr)}` : '';
  const kopf =
    `<header><nav aria-label="Brotkrumen"><a href="/gesetze">Gesetze</a> › ` +
    `<a href="/gesetze">${esc(GEBIET_LABEL[e.rechtsgebiet])}</a> › ${esc(e.kuerzel)}</nav>` +
    `<h1>${esc(e.kuerzel)} — ${esc(e.titel)}</h1>` +
    `<p>${esc(e.kuerzel)}${srZeile} · Stand ${esc(e.stand)} · ` +
    `<a href="${esc(e.quelleUrl)}" rel="nofollow noopener" target="_blank">amtliche Fassung (geltend)</a></p>` +
    `</header>`;
  const artikel = datei.eintraege
    .map((a) => {
      const titel = a.titel ? ` ${esc(a.titel)}` : '';
      return `<article><h2>${esc(a.artikelLabel)}${titel}</h2>${bloeckeHtml(a.bloecke)}</article>`;
    })
    .join('');
  return `<main>${kopf}<section>${artikel}</section></main>`;
}

const ABSCHNITT_LABEL: Record<string, string> = {
  regeste: 'Regeste',
  sachverhalt: 'Sachverhalt',
  erwaegung: 'Erwägungen',
  dispositiv: 'Dispositiv',
};

/** Volltext-HTML eines Entscheids: Kopf (Zitierung/Gericht/Live-Link) + Regeste
 *  (falls vorhanden) + Rubrum + Abschnitte. Eine <h1>. */
export function entscheidVolltextHtml(e: BrowseEntscheid, snap: EntscheidSnapshot): string {
  const bge = e.bgeReferenz ? ` · ${esc(e.bgeReferenz)}` : '';
  const kopf =
    `<header><nav aria-label="Brotkrumen"><a href="/rechtsprechung">Rechtsprechung</a> › ` +
    `<a href="/rechtsprechung">${esc(e.gerichtName)}</a> › ${esc(e.nummer)}</nav>` +
    `<h1>${esc(e.zitierung)}</h1>` +
    `<p>${esc(e.gerichtName)} · ${esc(e.datum)}${bge} · ${esc(GEBIET_LABEL[e.sachgebiet])} · ` +
    `<a href="${esc(e.quelleUrl)}" rel="nofollow noopener" target="_blank">amtliche Fassung</a></p>` +
    `</header>`;
  let inhalt = '';
  if (snap.regeste?.text) {
    inhalt += `<section><h2>Regeste</h2><p>${esc(snap.regeste.text)}</p></section>`;
  }
  if (snap.rubrum) {
    const r = snap.rubrum;
    const zeilen = [
      r.parteien ? `<p>${esc(r.parteien)}</p>` : '',
      r.gegenstand ? `<p>Gegenstand: ${esc(r.gegenstand)}</p>` : '',
      r.vorinstanz ? `<p>Vorinstanz: ${esc(r.vorinstanz)}</p>` : '',
    ].join('');
    if (zeilen) inhalt += `<section>${zeilen}</section>`;
  }
  for (const a of snap.abschnitte) {
    const bloecke = a.bloecke
      .map((b) => `<p>${b.marke ? `<b>${esc(b.marke)}</b> ` : ''}${esc(b.text)}</p>`)
      .join('');
    if (bloecke) inhalt += `<section><h2>${esc(ABSCHNITT_LABEL[a.typ] ?? a.typ)}</h2>${bloecke}</section>`;
  }
  return `<main>${kopf}${inhalt}</main>`;
}
