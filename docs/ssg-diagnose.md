# SSG-Diagnose — Ist-Zustand Rendering & SEO (Phase 0)

Auftrag David 11.6.2026 (`claude-code-auftrag-ssg-seo.md`): Die Website
liefert ohne JavaScript kein gerendertes HTML; Diagnose vor jedem Eingriff.
Stand: Commit `6ec817e`, 11.6.2026. **Dieses Dokument ändert nichts am Code.**

## 1. Technologie-Stack (Befund)

| Baustein | Ist |
| --- | --- |
| Bundler/Dev | Vite 8 (`vite.config.ts`), Build = `tsc -b && vite build` |
| Framework | React 19.2, reine SPA — **kein** Next.js, kein SSR-Server |
| Routing | react-router-dom **7.16 im Library-Modus** (`BrowserRouter` in `src/main.tsx`, `<Routes>` in `src/App.tsx`), Code-Splitting via `lazy()` pro Seite |
| Styling | Tailwind 3 + eigene Tokens (`index.css`), Fonts selbst gehostet (Geist) |
| State | lokaler React-State + localStorage (Speicherstände); kein globaler Store |
| Deployment | Vercel, statisches Hosting; `vercel.json`: SPA-Rewrite `/(.*) → /index.html`, strenge CSP (`script-src 'self'` — keine Inline-Scripts), Asset-Caching immutable |

## 2. Warum der Server kein HTML liefert

`index.html` enthält nur Meta-Tags und `<div id="root"></div>`; `main.tsx`
rendert per `createRoot` **vollständig im Browser**. Das gebaute
`dist/index.html` (23 Zeilen) ist die einzige HTML-Datei; jede Route wird per
Vercel-Rewrite auf diese leere Hülle umgebogen. Ohne JS-Ausführung sieht ein
Crawler/Preview-Bot also: globalen Titel, globale Description, leeres `<body>`.
Kein `useEffect`-Nachladen als Ursache — die Inhalte stehen synchron im
React-Baum, sie werden nur nie serverseitig serialisiert.

**Entscheidender Aktivposten:** Der Tor-Bestandteil `scripts/smoke-render.tsx`
rendert 28 Seiten bei jedem `npm run check` mit `react-dom/server.renderToString`
fehlerfrei (≥ 500 Zeichen). Die SSR-Tauglichkeit der Seiten ist also **bereits
gepflegte Repo-Konvention** (inkl. Lektion «zusammengesetzte Strings als EIN
Template-Literal»). Build-Zeit-Rendering ist damit kein Experiment, sondern
der nächste logische Schritt auf bestehender Grundlage.

## 3. Seiten-Inventar (öffentliche Routen, `src/App.tsx`)

**38 Inhalts-Routen**, alle mit sprechenden deutschen Slugs — die im Auftrag
verlangte «eine Route pro Rechner» **existiert bereits**:

- **15 Rechner** unter `/rechner/…`: kuendigung · zpo-fristen · verzugszins ·
  schkg-fristen · erbteilung · erb-fristen · mietrecht · verjaehrung ·
  gewaehrleistung · tagerechner · teuerung · zustaendigkeit · streitwert ·
  betreibungskosten · bgg-fristen
- **18 Vorlagen** unter `/vorlagen/…`: testament · patientenverfuegung ·
  vorsorgeauftrag · schlichtungsgesuch-bs · arbeitsvertrag · mietvertrag ·
  vollmacht · klage-vereinfacht · klage-ordentlich · kuendigung-arbeitnehmer ·
  kuendigung-arbeitgeber · kuendigung-mieter · kuendigung-vertrag ·
  kuendigung-vermieter · mahnung · gmbh-gruendung · ag-gruendung ·
  kapitalerhoehung
- **5 statische Seiten**: `/` · `/methodik` · `/ueber` · `/kontakt` ·
  `/datenschutz`
- **Redirects (dauerhaft, mit Query-Weiterreichung):** `/pro`,
  `/fachpersonen`, `/rechner` → `/`; `/rechner/fristenspiegel` → Fach-Rechner
- **Stub:** `/rechner/:slug` für geplante Katalog-Karten (Status `geplant`) —
  gehört NICHT in die Sitemap (dünner Inhalt), ggf. `noindex`

Charakter der Seiten: Jede Rechner-/Vorlagen-Seite ist **statische Hülle +
interaktives Formular in einem React-Baum** — Kopf, Rückverweis,
Ereignis-Sektion, ThemenEinstieg, Rechtsinfo (R6) und Fedlex-Norm-Pills sind
reiner Text/Links (SSG-tauglich); das Formular (Eingaben → Engine → Ergebnis)
braucht Hydration. Erklärtexte und Normverweise liegen in den Seiten
selbst bzw. kommen aus `startseiteConfig.ts` (Katalog: Titel, Kurzbeschrieb,
Normen, Status je Karte — **Single Source §5, ideale Metadaten-Quelle**).

## 4. SEO-Bausteine (Ist)

| Baustein | Befund |
| --- | --- |
| Titel/Description pro Route | **FEHLT komplett** — kein einziges `document.title` im Code; alle 38 Routen teilen den globalen Titel aus `index.html` (Duplikat-Titel über die ganze Site) |
| OG-Tags | global in `index.html` (de_CH), aber `og:url` zeigt für jede Route auf `/`; **kein `og:image`** |
| Canonical | fehlt |
| `sitemap.xml` | fehlt |
| `robots.txt` | vorhanden (`public/robots.txt`): `Allow: /` ohne Sitemap-Verweis |
| JSON-LD | fehlt (CSP-Hinweis: `application/ld+json` ist nicht-ausführbar, von `script-src 'self'` nicht betroffen) |
| Interne Verlinkung | **stark**: Startseiten-Katalog verlinkt alle Karten; Rechner verlinken verwandte Rechner (ThemenEinstieg, Abzweigungen, Rückverweise, VorlagenSprung) |

## 5. Risiken/Nebenbedingungen für einen SSG-Umbau

1. **Heute-Datum-Defaults (Hydrations-Mismatch):** 6 Dateien initialisieren
   State mit `new Date()` (`DatumsFeld.tsx`, `VerzugszinsForm`,
   `EinfacheFristForm`, `VerjaehrungForm`, `GewaehrleistungForm`,
   `VorlageAgGruendung`) — beim Prerender entsteht das Build-Datum im HTML,
   beim Hydrieren das Besuchs-Datum. Muss in Phase 2 gezielt behandelt
   werden (Lösungsoptionen dort; KEINE Engine-Änderung nötig — betrifft nur
   Formular-Startwerte, §3 Darstellungsschicht).
2. **localStorage-Hydration:** Speicherstände werden in Initializern gelesen;
   im Node-Smoke laufen die Seiten bereits ohne localStorage — Guards
   existieren, beim Hydrieren gilt dieselbe Mismatch-Sorgfalt.
3. **CSP `script-src 'self'`:** verbietet Inline-Hydrations-Scripts mancher
   Frameworks (z. B. Astro-Insel-Bootstrap); Lösung muss mit externen
   Bundles auskommen (Ist-Muster) oder die CSP um Hashes erweitern.
4. **Werkzeugkette hängt an Vite:** golden, smoke, sweep, Inventur, Verfall,
   Zitate-Prüfer laufen alle über `vite-node`; Vitest + Playwright ebenso.
   Ein Framework-Wechsel (Next/Astro) müsste diese Tor-Infrastruktur
   mitziehen — hohes §6-Risiko ohne fachlichen Gewinn.
5. **Vercel-Rewrite-Ordnung:** Statische Dateien gewinnen vor `rewrites`;
   beim Prerender müssen `/rechner/verzugszins` → `…/index.html`-Auflösung
   (cleanUrls/trailingSlash) und der SPA-Fallback für Stub-/Unbekannt-Routen
   sauber konfiguriert werden.
6. **Sprache:** `LocaleProvider` existiert (de als Standard); Prerender
   erfolgt in de — mehrsprachiges SSG wäre ein eigener, späterer Schritt.

## 6. Befund (Kurzfassung)

Reine Vite-SPA ohne jegliches Routen-SEO; der Schaden ist real (Crawler,
Link-Previews und KI-Assistenten sehen eine leere Hülle mit Einheits-Titel).
Gleichzeitig ist die Ausgangslage ungewöhnlich gut: Routen-pro-Rechner,
SSR-sichere Seiten (tor-geprüft), Katalog als Metadaten-Single-Source und
starke interne Verlinkung existieren schon. Es fehlt «nur» die Build-Zeit-
Serialisierung + Metadaten-Schicht — kein Framework-Defizit.

→ Empfehlung und Zielpfad-Vergleich: Phase-1-Entscheidvorlage (Chat bzw.
`docs/ssg-umbau-protokoll.md` nach Freigabe).
