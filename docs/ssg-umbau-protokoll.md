# SSG-Umbau-Protokoll (Phase 2+3 des Auftrags vom 11.6.2026)

Diagnose und Zielpfad-Entscheid: `docs/ssg-diagnose.md` (Freigabe David im
Plan-Mode, 11.6.2026). Umsetzung auf Branch **`ssg-seo`** (§12: Worktree,
weil im Arbeitsverzeichnis eine Parallel-Session aktiv wurde).

## Was geändert wurde (Etappen E1–E5, je ein golden-gegateter Commit)

| Etappe | Commit | Inhalt |
| --- | --- | --- |
| E0 | `bdeec53` (main) | Diagnose committet; Basislinie alle Tore grün |
| E1 | `78ccfb6` (main) | `src/lib/seo.ts`: SITE_URL, `prerenderRouten()` (38 Routen aus dem Katalog §5), `metaFuerPfad()`; Inventur-Abschnitt href-Hygiene; 7 Tests |
| E2 | `e1d1bc5` (main) | `src/components/RouteMeta.tsx`: Head-Nachführung bei Client-Navigation (title/description/og/canonical) |
| E3 | `a29fbe6` | `src/entry-server.tsx` (react-dom/static `prerender` + StaticRouter um die echte App) + `scripts/prerender.ts` (38× `dist/<pfad>.html`, `app.html`-Fallback noindex, `sitemap.xml`, Drift-Tore) + Build-Integration; RouteMeta auf dynamischen Import (§6.4-Chunk-Fix) |
| E4 | `c846003` | JSON-LD statisch injiziert: WebApplication je Karten-Route, WebSite+Organization auf `/`; keine FAQPage (keine FAQ-Inhalte im Repo) |
| E5 | `3cf0ebc` | `vercel.json`: cleanUrls + trailingSlash:false + Fallback-Rewrite auf `/app.html`; robots.txt-Sitemap-Zeile aus SITE_URL generiert |

**Architektur in einem Satz:** Der bestehende Vite-Build bekommt einen
dritten Schritt, der jede öffentliche Route mit der echten App zu vollem
HTML rendert und Meta/JSON-LD aus `lib/seo.ts` injiziert; im Browser ersetzt
`createRoot().render()` (unverändertes `main.tsx`) die statische Hülle —
**kein Hydrate** (Begründung: localStorage-/Permalink-Initializer machen
echtes Hydrate strukturell mismatch-anfällig, s. Diagnose §5).

## Determinismus-Nachweis (Auftrag: «identisches Ergebnis vor/nach Umbau»)

1. **Engine-Ebene (alle Rechner):** `npm run golden:vergleich` nach JEDER
   Etappe **104/104 Fälle byte-gleich** — die Goldliste deckt sämtliche
   Engines mit konkreten durchgerechneten Fällen ab; `src/lib/` wurde nur
   additiv um `seo.ts` erweitert, keine Engine berührt.
2. **UI-Ebene (Stichprobe, 11.6.2026):** Verzugszins, Preset «Rechnung
   offen, 5%»: **Prod (vorher, lexmetrik.vercel.app)** und **prerenderter
   Stand (nachher, Worktree-Preview)** liefern identisch
   `Verzugszins: CHF 126.03 (5 % auf CHF 5'000.00 für 184 Tage).
   Total inkl. Kapital: CHF 5'126.03.` — je 0 Konsolenfehler.
3. **Suite/e2e:** 1365 Vitest grün · e2e 33/33 gegen das prerenderte dist ·
   Smoke alle Seiten · Chunk-Konsistenz-Sweep (alle referenzierten
   Asset-Hashes vorhanden).

Roh-HTML-Beleg: Prod liefert für `/rechner/verzugszins` heute 1430 Bytes
ohne Inhalt (leere Hülle, globaler Einheits-Titel); der neue Stand liefert
H1 «Verzugszins», individuellen `<title>`, Canonical, JSON-LD und den
gesamten Seitentext ohne JS-Ausführung.

## Verifikation am Vercel-Preview (OFFEN — braucht Deploy, §9 nur auf Ja)

curl-Matrix nach dem Preview-Deploy:
`/rechner/verzugszins` → 200 mit Inhalt · `/rechner/verzugszins/` → 308 →
200 · `/rechner/verzugszins.html` → 308 (cleanUrls) · `/pro` →
app.html-Hülle, Client-Redirect auf `/` · geplanter Stub-Slug →
app.html + noindex · `/sitemap.xml` + `/robots.txt` → 200 · CSP-Header
unverändert · Lighthouse-Vergleich (Erwartung: LCP deutlich besser, da
Inhalt im HTML).

## Offene TODO(David) — juristische/inhaltliche Entscheide, nichts erfunden

1. **Meta-Descriptions statische Seiten** (`/methodik`, `/ueber`,
   `/kontakt`, `/datenschutz`): tragen bis zur Abnahme die globale
   Site-Description. `TODO(David): Erklärtext juristisch verfassen`
   (Marker in `src/lib/seo.ts`).
2. **Doppelkarten-Titelwahl `/rechner/kuendigung`:** Override zeigt auf
   Karte `kuendigung-sperrfristen`; Alternative `lohnfortzahlung`
   (Marker in `src/lib/seo.ts`).
3. **og:image:** bewusst weggelassen (nur SVGs vorhanden, OG verlangt
   PNG/JPG; nichts erfinden). Folgeoption: `scripts/screenshots.ts` um
   ein 1200×630-`public/og.png` erweitern — Design-Entscheid.

## Folgeoptionen (dokumentiert, nicht umgesetzt)

- **hydrateRoot** statt render-then-replace: erst sinnvoll, wenn
  Interaktions-Latenz messbar stört; erfordert Zwei-Phasen-Strategie für
  localStorage/Permalink-Initializer und Mount-Defaults der 4
  Heute-Datum-Stellen.
- **Mehrsprachiges Prerender** (LocaleProvider existiert): eigener Schritt.
- **react-router Framework-Mode** (offizielles Prerender): Upgrade-Pfad
  bleibt offen, derzeit kein Bedarf.

## Domainwechsel

`SITE_URL` in `src/lib/seo.ts` ist der EINE Konfigurationswert: Canonical,
og:url, sitemap.xml und der robots-Sitemap-Verweis leiten alle daraus ab
(Auftrag Phase 3 Ziff. 6). `index.html` (statische og:url der Hülle) beim
Wechsel mitziehen.

## Wartungsregeln

- Neue Karte/Route: `href` in `startseiteConfig.ts` genügt — Prerender,
  Sitemap, Meta und JSON-LD folgen automatisch; den deklarierten
  Routen-Zähler in `scripts/prerender.ts` (38) im selben Commit nachführen
  (Drift-Tor bricht sonst den Build).
- Route ohne App.tsx-Eintrag bricht den Build (404-Marker-Tor) — gewollt.
- `npm run prerender` setzt ein frisches `vite build` voraus
  (Doppel-Prerender-Schutz wirft sonst).
