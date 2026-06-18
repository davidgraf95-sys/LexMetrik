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
/** Kuratierter Social-Share-Text der Startseite (wörtlich aus index.html
 *  og:description — dort bewusst kürzer als die meta description). */
export const SITE_OG_DESCRIPTION =
  'Fristen, Beträge und Zuständigkeiten transparent berechnet; Rechtsdokumente aus geprüften Bausteinen zusammengestellt. Feste Regeln statt Sprachmodell.';

export interface RouteMetadaten {
  pfad: string;          // z. B. '/rechner/verzugszins'
  titel: string;         // kompletter <title>-Inhalt
  beschreibung: string;  // meta description; auch og:description, wenn kein eigener og-Text
  /** Eigener Social-Share-Text (og:description), wo einer GEPFLEGT ist —
   *  Bug-Check 11.6.2026: die Startseite hat in index.html einen kuratierten,
   *  kürzeren og-Text, den das Prerender nicht überschreiben darf. */
  ogBeschreibung?: string;
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

// Statische Seiten: Titel nach EINEM Schema «… — LexMetrik». Beschreibungen je
// Seite individuell (Freigabe David 15.6.2026) — faktisch aus dem vorhandenen
// Seitentext destilliert, keine neuen Rechtsaussagen; Datenschutz bleibt ehrlich
// als Entwurf gekennzeichnet.
const STATISCHE_SEITEN: Record<string, { titel: string; beschreibung: string; ogBeschreibung?: string }> = {
  '/': { titel: SITE_TITEL, beschreibung: SITE_DESCRIPTION, ogBeschreibung: SITE_OG_DESCRIPTION },
  '/gesetze': { titel: 'Schweizer Gesetzessammlung — LexMetrik', beschreibung: 'Volltext der in LexMetrik verwendeten Bundesgesetze und kantonalen Erlasse — geltende Fassung, mit Stand und amtlichem Live-Link. Schnelle Navigation zwischen und innerhalb der Gesetze.' },
  '/methodik': { titel: 'Wie LexMetrik rechnet — LexMetrik', beschreibung: 'Wie LexMetrik Fristen, Beträge und Quoten herleitet: feste Regeln statt Sprachmodell, jeder Schritt nachvollziehbar, jede Norm mit der amtlichen Sammlung verlinkt.' },
  '/ueber': { titel: 'Über — LexMetrik', beschreibung: 'Warum es LexMetrik gibt — entstanden bei der Vorbereitung auf die Anwaltsprüfung: überprüfbare, normtreue Rechtsberechnung statt Black Box.' },
  '/kontakt': { titel: 'Kontakt aufnehmen — LexMetrik', beschreibung: 'Fragen, Korrekturen zu einer Berechnung oder einem Baustein, Vorschläge für neue Rechner und Vorlagen — Hinweise auf Fehler sind besonders willkommen.' },
  '/datenschutz': { titel: 'Datenschutzerklärung — LexMetrik', beschreibung: 'Datenschutzerklärung von LexMetrik (Entwurf). Die Eingaben verlassen den Browser nicht — Berechnung und Dokumenterstellung laufen lokal im Gerät.' },
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
/** Katalog-gestützte Routen: ein hash-loser Pfad je verfügbarer Karte.
 *  Single Source (§5) für das Routen-Manifest (src/routesManifest.tsx) und
 *  dessen Gating-Test — App.tsx leitet seine Karten-<Route>s daraus ab, statt
 *  die Pfad-Existenz ein zweites Mal von Hand zu führen. */
export function katalogRouten(): string[] {
  return [...kartenProPfad().keys()];
}

export function prerenderRouten(): string[] {
  return [...Object.keys(STATISCHE_SEITEN), ...katalogRouten()];
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

// ─── JSON-LD (SSG-Etappe E4) ───────────────────────────────────────────────
// Pro Karten-Route ein WebApplication-Objekt — Felder NUR aus Vorhandenem
// (Karte + SITE_URL); isAccessibleForFree ist faktisch korrekt (Free/Pro-
// Zweiteilung aufgehoben, s. startseiteConfig.ts). KEINE FAQPage: im Repo
// existieren keine FAQ-Inhalte (nichts erfinden). Kein aggregateRating/
// offers — keine Daten erfinden, auch wenn Google dann kein Rich Result
// zeigt. Startseite: WebSite + Organization.

export function jsonLdFuerPfad(pfad: string): object | null {
  if (pfad === '/') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'LexMetrik',
          url: `${SITE_URL}/`,
          description: SITE_DESCRIPTION,
          inLanguage: 'de-CH',
        },
        { '@type': 'Organization', name: 'LexMetrik', url: `${SITE_URL}/` },
      ],
    };
  }
  const meta = metaFuerPfad(pfad);
  if (!meta?.karte) return null; // statische Seiten ausser «/»: kein JSON-LD
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: meta.karte.title,
    description: meta.beschreibung,
    url: meta.canonical,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    inLanguage: 'de-CH',
    publisher: { '@type': 'Organization', name: 'LexMetrik', url: `${SITE_URL}/` },
  };
}
