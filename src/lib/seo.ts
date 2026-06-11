// ─── SEO-/Prerender-Metadaten (SSG-Auftrag David 11.6.2026) ────────────────
//
// Dossier: docs/ssg-diagnose.md
//
// Eine Quelle für alles Routen-SEO (§5): das Prerender-Skript
// (scripts/prerender.tsx) injiziert diese Werte beim Build ins statische
// HTML, RouteMeta.tsx führt sie bei Client-Navigation im Browser nach.
// Titel und Beschreibungen kommen WÖRTLICH aus startseiteConfig.ts
// (geprüfte Karten-Inhalte) — hier wird kein Rechtstext formuliert
// (Auftrags-Regel 2: fehlender Text → TODO(David), nie selbst verfassen).

import { ALLE_KARTEN, istVerfuegbar, type CatalogItem } from './startseiteConfig';

/** Kanonischer Ursprung OHNE Slash am Ende. Der spätere Wechsel auf eine
 *  eigene Domain ist GENAU dieser eine Konfigurationswert (Auftrag Phase 3
 *  Ziff. 6) — Canonical, og:url und sitemap.xml leiten alle hieraus ab. */
export const SITE_URL = 'https://lexmetrik.vercel.app';

/** Globaler Titel/Description (wörtlich aus index.html, dort gepflegt seit
 *  der Einführung; index.html bleibt die Quelle für die Startseite). */
export const SITE_TITEL = 'LexMetrik — Schweizer Recht: berechnen und erstellen';
export const SITE_DESCRIPTION =
  'LexMetrik rechnet Fristen, Beträge und Quoten nach Schweizer Recht und stellt Rechtsdokumente aus geprüften Textbausteinen zusammen — regelbasiert, nachvollziehbar, jede Norm direkt mit dem Gesetzestext verlinkt. Keine Rechtsberatung.';

export interface RouteMetadaten {
  pfad: string;          // z. B. '/rechner/verzugszins'
  titel: string;         // kompletter <title>-Inhalt
  beschreibung: string;  // meta description / og:description
  canonical: string;     // absolute URL (SITE_URL + pfad)
  /** Karte, aus der Titel/Beschreibung stammen (statische Seiten: undefined). */
  karte?: CatalogItem;
}

// Mehrere Karten teilen sich eine Route (Hash-Sprungmarken). Gewinner ist die
// Karte OHNE Hash im href; wo alle Karten einen Hash tragen, entscheidet
// dieser Override. TODO(David): Titelwahl der Doppelkarte /rechner/kuendigung
// abnehmen (Alternative: Karte 'lohnfortzahlung').
const DOPPELKARTEN_OVERRIDE: Record<string, string> = {
  '/rechner/kuendigung': 'kuendigung-sperrfristen',
};

// Statische Seiten: Titel = vorhandene H1-Formulierung der Seite (keine neuen
// Texte). Beschreibung: noch keine individuellen, juristisch abgenommenen
// Texte vorhanden → Rückfall auf SITE_DESCRIPTION.
// TODO(David): Erklärtext juristisch verfassen (je eine Meta-Description für
// /methodik, /ueber, /kontakt, /datenschutz — bis dahin globale Description).
const STATISCHE_SEITEN: Record<string, { titel: string; beschreibung: string }> = {
  '/': { titel: SITE_TITEL, beschreibung: SITE_DESCRIPTION },
  '/methodik': { titel: 'Wie LexMetrik rechnet — LexMetrik', beschreibung: SITE_DESCRIPTION },
  '/ueber': { titel: 'Über LexMetrik', beschreibung: SITE_DESCRIPTION },
  '/kontakt': { titel: 'Kontakt aufnehmen — LexMetrik', beschreibung: SITE_DESCRIPTION },
  '/datenschutz': { titel: 'Datenschutzerklärung — LexMetrik', beschreibung: SITE_DESCRIPTION },
};

/** href → Pfad ohne Hash-Sprungmarke. */
function pfadOhneHash(href: string): string {
  const i = href.indexOf('#');
  return i === -1 ? href : href.slice(0, i);
}

/** Routen-Pfad → Karte, deren Titel/Beschreibung die Seite vertritt.
 *  Reihenfolge: Override → hash-loser href → Katalogreihenfolge. */
function kartenProPfad(): Map<string, CatalogItem> {
  const proPfad = new Map<string, CatalogItem>();
  for (const k of ALLE_KARTEN.filter(istVerfuegbar)) {
    if (!k.href) continue; // verfügbar, aber ohne eigene Seite (defensiv)
    const pfad = pfadOhneHash(k.href);
    const override = DOPPELKARTEN_OVERRIDE[pfad];
    if (override) {
      // Override-Karte gewinnt; bis sie kommt, hält ein Platzhalter den Pfad
      if (k.id === override) proPfad.set(pfad, k);
      else if (!proPfad.has(pfad)) proPfad.set(pfad, k);
      continue;
    }
    const bisher = proPfad.get(pfad);
    if (!bisher) { proPfad.set(pfad, k); continue; }
    // hash-loser href schlägt Hash-Karte; sonst bleibt die erste (Katalogreihenfolge)
    if (bisher.href !== pfad && k.href === pfad) proPfad.set(pfad, k);
  }
  return proPfad;
}

/** Alle Prerender-Routen: statische Seiten + ein Pfad je verfügbarer Karte.
 *  Geplante Karten (kein href), Redirect-Routen (/pro, /fachpersonen,
 *  /rechner, /rechner/fristenspiegel) und der Stub /rechner/:slug stehen nie
 *  im Katalog und sind damit automatisch ausgeschlossen. */
export function prerenderRouten(): string[] {
  return [...Object.keys(STATISCHE_SEITEN), ...kartenProPfad().keys()];
}

/** Metadaten für einen Routen-Pfad; unbekannte Pfade → null (Aufrufer
 *  entscheidet: Prerender bricht ab, RouteMeta lässt den Head unverändert). */
export function metaFuerPfad(pfad: string): RouteMetadaten | null {
  const statisch = STATISCHE_SEITEN[pfad];
  const canonical = SITE_URL + pfad;
  if (statisch) return { pfad, ...statisch, canonical };
  const karte = kartenProPfad().get(pfad);
  if (!karte) return null;
  return {
    pfad,
    titel: `${karte.title} — LexMetrik`,
    beschreibung: karte.description,
    canonical,
    karte,
  };
}
