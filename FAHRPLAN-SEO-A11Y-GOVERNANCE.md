# FAHRPLAN — Webseite verbessern mit SEO / A11y / Skill-Governance (Stand 25.6.2026)

> Read-only erstellt. Andere Agenten arbeiten parallel im Repo `/Users/david/Developer/LexMetrik` — dieser Fahrplan ändert nichts, er ist Ablage-Dokument. Empfohlener Ablageort: neuer `FAHRPLAN-SEO-A11Y-GOVERNANCE.md` (dockt thematisch an `FAHRPLAN-LERNPHASE-2026.md` Strang B = Verifikations-/Infrastruktur an). Überschneidet sich nur mit `FAHRPLAN-RECHTSPRECHUNG.md` (W1.1 revidiert dessen Annahme „nicht prerenderbar" — siehe §9), dupliziert sonst keinen der 24 Root-Fahrpläne.

## 1. Kurz-Kontext & Nordstern

LexMetrik soll bei Schweizer Rechtsanfragen **besser auffindbar und zugänglicher** sein als `fedlex.admin.ch` und `entscheidsuche.ch` — durch die einzigartige Norm↔Entscheid↔Rechner-Triangulation, die keiner der beiden Konkurrenten hat. Der entscheidende Hebel ist heute ungenutzt: **1449 snapshot-Erlasse (218 Bund + 1231 kantonal) und 370 snapshot-Entscheide (340 BGer + 30 kantonal) = 1819 indexierbare Detail-URLs** sind für Suchmaschinen **unsichtbar** (nicht prerendert, nicht in der Sitemap, als `noindex`-`app.html`-Hülle ausgeliefert), während Fedlex/entscheidsuche jeden Erlass/Entscheid einzeln indexieren. Bis **1.12.2026** hat David (Jurist) keine Zeit für juristische Detail-Abnahme — deshalb priorisiert dieser Fahrplan alles, was **ohne seine Fachzeit** umsetzbar ist (reiner Technik-/Struktur-/Darstellungs-/Verifikations-Layer): das ist genau der grosse SEO-Hebel und der gesamte A11y-Strang. Inhaltliche Rechtsaussagen (FAQ-Texte, Themen-Hub-Einleitungen, Keyword-Schwerpunkte, kuratierte Snippet-Descriptions, Geltungsaussagen) werden als Gerüst mit `TODO(David)` vorbereitet und erst in der Welle ab 1.12.2026 befüllt.

## 2. IST-Stand kompakt

| Domain | Stärke | Grösste Lücke |
|---|---|---|
| **SEO-Infrastruktur** | Sauberes Build-Zeit-Prerender (`scripts/prerender.ts`), Single Source `src/lib/seo.ts` (title/description/og/canonical pro Route), strenge Drift-Tore, robots.txt + sitemap.xml generiert | `metaFuerPfad()` gibt für **alle** Detailpfade `null`; nur 56 von 1819 möglichen Detail-URLs in der Sitemap; Reader setzen Title erst per JS nach Fetch |
| **Rendering/Tech** | SSG ohne Hydration (render-then-replace → kein Mismatch), sauberes Code-Splitting, CSP-konforme `ld+json`-Mechanik | `/gesetze/:ebene/:key` + `/rechtsprechung/:key` laufen über SPA-Fallback → `vercel.json` rewritet `/(.*)` auf `/app` (= `noindex`-Hülle); `cleanUrls:true` + `trailingSlash:false` aktiv (relevant für W1.1-Pfadkonsistenz); `/normtext/*` hat Header-Block **ohne** `Cache-Control`, `/rechtsprechung/*` hat **gar keinen** Block (nur `/assets/*` ist gecacht); OR.json ~1.8 MB am Stück |
| **Strukturierte Daten** | JSON-LD WebSite/Organization auf `/`, WebApplication je Rechner/Vorlage | Kein Legislation/CourtDecision/Article/BreadcrumbList/FAQPage; kein lastmod; Twitter Cards + og:image fehlen ganz |
| **Inhalt/Positionierung** | Echter Burggraben: `werkzeuge.ts` mappt Erlass→Rechner/Vorlagen + Norm↔Entscheid-Verzahnung im Reader | 1819 Tiefen-Inhalte nicht indexiert; Rückverlinkung der indexierten Rechner-Seiten auf den Korpus fehlt; Kanton-Abdeckung unausgewogen |
| **Accessibility (WCAG 2.2)** | Vorhandenes axe-Tor `e2e/a11y.e2e.ts` (**9 Tests**, critical/serious-Gate); vorbildliche Landmarks/Skip-Link/Off-Canvas-Dialog/Resize-Griff; Dark-Mode durchdacht; `e2e/tastatur.e2e.ts` existiert (**2 Tests**, beide Kalender) | axe-Tor nur 9 Stichproben; `SchweizKarte.tsx`-Pfade `outline-none` (kein sichtbarer Fokus); Tarif-Tabellen als `<span>`-`display:table` ohne Tabellen-Semantik; Tastatur-e2e deckt nur Kalender ab |
| **Skill-Governance** | `legal-builder-hub` mit QA-/Trust-Pipeline vorhanden | Hub kostet ~1250 Token/Session + zieht US-MCP (Lawve_AI/Slack) → braucht Disziplin (nur in Wartungs-Sessions laden) |

## 3. Drei Massnahmen-Wellen (priorisiert)

> Spalte „David-Fachzeit?": **nein** = autonom umsetzbar vor 1.12.2026 · **ja** = juristische Abnahme nötig (Welle ab 1.12.2026, Gerüst vorab).

**Werkzeug-Realität (kritisch — vor Dispatch lesen):** In der Session sind **nur** folgende Skills/Tools vorhanden und sofort nutzbar: `accessibility-compliance:wcag-audit-patterns`, `accessibility-compliance:screen-reader-testing`, `superpowers:*`, `vercel:deploy` (+ `vercel:*`), `code-review`, `security-review`, `council-review` und **Playwright** (`mcp__plugin_playwright_playwright__browser_*`). Die unten genannten `seo-structure-architect`/`seo-meta-optimizer`/`seo-snippet-hunter`/`seo-keyword-strategist` sowie `accessibility-audit`/`ui-visual-validator` sind **NICHT installiert** — sie sind Kandidaten-Community-Skills, die erst über `legal-builder-hub` (mit `skills-qa`-Trust-Scan) zu beschaffen wären; **ihre Beschaffung ist selbst Welle-1-Vorarbeit (W1.0)**. Bis dahin: SEO-Mechanik über `superpowers:*` + Eigenentwicklung umsetzen, visuelle Prüfung über **Playwright** (= Ersatz für `ui-visual-validator`). Niemals gegen einen nicht-installierten Sub-Agenten dispatchen.
>
> **Modell-Hinweis:** Jeder via `superpowers:dispatching-parallel-agents` gespawnte Sub-Agent UND die `accessibility-compliance:*`-Skills defaulten ggf. auf Haiku → beim Dispatch **explizit `model: 'opus'`** setzen (Memory `immer-bestes-modell.md`). Für die noch nicht installierten seo-* Agenten gilt der Hinweis erst nach deren Beschaffung.

### Welle 1 — sofort & autonom (grösster Hebel, keine Fachzeit)

| # | Massnahme | Tool/Sub-Agent | Dateien/Routen | Wirkung | Aufwand | David? |
|---|---|---|---|---|---|---|
| W1.0 | **Werkzeug-Beschaffung**: über `legal-builder-hub` (`registry-browser`→`skill-installer`→`skills-qa`) prüfen, ob brauchbare `seo-*`/A11y-Community-Skills existieren; sonst mit vorhandenem Werkzeug arbeiten | `legal-builder-hub` (Trust-Scan) | — | Voraussetzung | S | nein |
| W1.1 | **Detailseiten prerendern + Sitemap-Index** (Haupthebel): `/gesetze/:ebene/:key` für `status==='snapshot'` (1449), `/rechtsprechung/:key` für `bestand==='snapshot'` (370); Rewrite so, dass prerenderte Pfade eigenes HTML statt `/app`-noindex liefern (auf `cleanUrls`/`trailingSlash` abstimmen, sonst greift `/(.*)→/app` trotzdem); Sitemap splitten. **LCP/INP-Mess-Tor inkl.** (siehe W1.11) | Eigenentwicklung + `superpowers:writing-plans`/`-tdd` (ersatzweise `seo-structure-architect`, falls in W1.0 beschafft) | `scripts/prerender.ts` (`ERWARTETE_ROUTEN`-Tor Z.37, Sitemap Z.143), `src/lib/seo.ts` (`prerenderRouten`/neue `detailRouten()`), `vercel.json` (Rewrite/cleanUrls), `public/normtext/register.json`, `public/rechtsprechung/register.json` | hoch | L | nein |
| W1.2 | **Per-Dokument Meta** für Reader: `metaFuerErlass()`/`metaFuerEntscheid()`. **Trennstrich: mechanische Template-Description (z.B. `titel + sr + rechtsgebiet`) = autonom; jede kuratierte/redaktionelle Description = `TODO(David)`** (rein konkatenierte Snippets sind schwach, alles darüber hinaus ist Rechtstext) | `seo-meta-optimizer` (falls beschafft) / sonst Eigenentwicklung | `src/lib/seo.ts`, `src/components/RouteMeta.tsx`, `src/pages/GesetzLeser.tsx` (Z.~313), `src/pages/EntscheidLeser.tsx` (Z.~105) | hoch | M | teils (kuratierte Desc = ja) |
| W1.3 | **JSON-LD für Recht**: Legislation + Article + BreadcrumbList + CourtDecision aus Registerfeldern. **`legislationLegalForce`/Geltungs-/„in Kraft"-Felder NICHT aus `status:snapshot` ableiten** (snapshot ≠ in Kraft) → als `TODO(David)` ausklammern; `description`-Feld wie W1.2 behandeln | `seo-structure-architect` (falls beschafft) + `council-review` zur Typwahl | `src/lib/seo.ts`, `src/lib/normtext/register.ts`, `public/normtext/register.json`, `public/rechtsprechung/register.json` | hoch | M | teils (Geltungsaussage = ja) |
| W1.4 | **lastmod**: aus `stand`/`datum` **nur wenn plausibel** — `stand` ist oft das uniforme Fedlex-Konsolidierungsdatum (z.B. `2026-01-01`), nicht echte Modifikationszeit; unplausibel-uniforme lastmods können GSC-Vertrauen schädigen. **Annahme/Risiko: im Zweifel lastmod weglassen statt irreführend setzen.** Entscheids-`datum` ist tragfähiger | Eigenentwicklung | `scripts/prerender.ts`, `public/normtext/register.json`, `scripts/fedlex-versionen-pruefen.ts` (Currency-Arbiter) | mittel | S | nein |
| W1.5 | **Thin-Content-Schutz**: `nur-live-link` (9)/`pdf-embed` (2)-Stubs bleiben `noindex`, nur `snapshot` indexieren | Eigenentwicklung + `superpowers:verification-before-completion` | `src/lib/normtext/register.ts`, `scripts/prerender.ts`, `src/lib/seo.ts` | mittel | S | nein |
| W1.6 | **Karten-Fokus-Bug**: `outline-none` auf `SchweizKarte`-Pfaden (Z.67) durch sichtbaren Fokus ersetzen (WCAG 2.4.7/2.4.11/1.4.11) — eng begrenzt (1 Komponente, `role/aria-*` Z.64–66 bereits korrekt) | `wcag-audit-patterns` + Playwright (Screenshot hell/dunkel) | `src/components/SchweizKarte.tsx`, `src/index.css` | mittel | S | nein |
| W1.7 | **axe-Tor ausweiten** (9→~16): /rechtsprechung, EntscheidLeser+Lesemodus-Dialog (Fokusfalle), mobile Nav-Schublade (`role=dialog`), /international+EU, Karte, Bund-Reader | `wcag-audit-patterns` + Playwright | `e2e/a11y.e2e.ts`, `playwright.config.ts`, `Rechtsprechung.tsx`/`EntscheidLeser.tsx`/`International.tsx`/`Shell.tsx` | hoch | M | nein |
| W1.8 | **Heading-Hierarchie voll-scannen** (axe `heading-order`+`page-has-heading-one` über alle Routen) | `wcag-audit-patterns` | `src/routesManifest.ts`, `e2e/a11y.e2e.ts`, `SeitenKopf.tsx`/`RechnerKopf.tsx` | niedrig | S | nein |
| W1.9 | **Cache-Header ergänzen**: `Cache-Control` in den vorhandenen `/normtext/*`-Block einfügen + neuen Block für `/rechtsprechung/*` (langes max-age, versioniert über `fassungsToken`) | `vercel:deploy` (Verifikation) | `vercel.json` | mittel | S | nein |
| W1.10 | **Twitter Cards + og:image** (statisch, aus vorhandenen og-Werten) | `seo-meta-optimizer` (falls beschafft) / Eigenentwicklung | `index.html`, `scripts/prerender.ts`, `src/lib/seo.ts` | mittel | S | nein |
| W1.11 | **CWV-Tor am Indexierungs-Hebel**: LCP/INP der neu prerenderten Detailseiten messen (besonders OR/ZGB ~1.8 MB → ohne Splitting 1.8-MB-Last genau auf den neu indexierten Seiten). Mindestens Messung in Welle 1, Splitting selbst in W2.7 | Playwright (LCP/TBT-Messung) | `scripts/gate.sh`, `src/pages/GesetzLeser.tsx`, `public/normtext/bund/OR.json` | hoch | M | nein |
| W1.12 | **Google Search Console einrichten**: Property `lexmetrik.vercel.app` verifizieren + Sitemap submitten (Voraussetzung für die Erfolgsmessung in §4; reine Domain-/Konsolen-Arbeit, keine Fachzeit) | `vercel:deploy` (DNS/Verifikations-TXT) | `index.html` (Meta-Verifikation) bzw. DNS | hoch | S | nein |

### Welle 2 — mittelfristig & autonom (Tiefe, Reihenfolge abwarten)

| # | Massnahme | Tool/Sub-Agent | Dateien/Routen | Wirkung | Aufwand | David? |
|---|---|---|---|---|---|---|
| W2.1 | **Rück-Verlinkung** Rechner/Vorlagen → Norm-Leaf (Link-Juice): `ERLASS_WERKZEUGE` invertieren, „Massgebende Normen"-Block. **Erst nach W1.1** (sonst Links ins Leere) | `seo-structure-architect` (falls beschafft) + `superpowers:test-driven-development` (Invertierungs-Test, kein toter Link) | `src/lib/normtext/werkzeuge.ts`, `src/pages/RechnerUebersicht.tsx`, `src/pages/VorlagenUebersicht.tsx` | mittel | M | nein |
| W2.2 | **Tarif-/Zahlen-Tabellen semantisch** (`role=table/row/columnheader` bzw. echtes `<table>`/`<th scope>`) — WCAG 1.3.1 + SEO-Doppelnutzen | `wcag-audit-patterns` + `screen-reader-testing` (Golden-Tests sichern Byte-Gleichheit) | `src/components/normtext/ArtikelBody.tsx`, `src/index.css` | hoch | M | nein |
| W2.3 | **Tastatur-e2e erweitern** (bestehendes `e2e/tastatur.e2e.ts`, 2 Kalender-Tests): zusätzlich Skip-Link, Sidebar-Drilldown, „/"-Suche, EntscheidFilter, Schubladen-Fokusfalle, Karte. **Erweiterung, keine Neuanlage** (sonst Kollision) | `screen-reader-testing` → Playwright-Keyboard-Tests | `e2e/tastatur.e2e.ts`, `Shell.tsx`, `Sidebar.tsx`, `EntscheidFilter.tsx`, `HeaderSuche.tsx`, `SchweizKarte.tsx` | mittel | M | nein |
| W2.4 | **`lang`-Korrektheit** (WCAG 3.1.1/3.1.2): `<html lang="de-CH">` sowie pro-Element-`lang` bei fr/it-Zitaten — reine A11y/Tech-Mechanik, **kein** fr/it-Content nötig (vom hreflang-Strang W3.7 getrennt) | `wcag-audit-patterns` | `index.html`, `src/components/locale.tsx`, `ArtikelBody.tsx`, `e2e/a11y.e2e.ts` | niedrig | S | nein |
| W2.5 | **Screenreader-Baseline** (VoiceOver/NVDA) als `bibliothek/`-Eintrag, Fails → neue Tor-Pruefpunkte | `screen-reader-testing` | `Sidebar.tsx`, `SchweizKarte.tsx`, `ArtikelBody.tsx`, `EntscheidLeser.tsx`, Ergebnis in `bibliothek/` | mittel | L | nein |
| W2.6 | **Touch-Target-Audit** der 36px-Controls (WCAG 2.5.8: 24px Pflicht erfüllt, 44px-Ziel prüfen) | `wcag-audit-patterns` + Playwright (`browser_resize 390`) | `src/index.css`, `EntscheidFilter.tsx`, `EntscheidLeser.tsx` | mittel | S | nein |
| W2.7 | **Kontrast/Dark-Mode** ganzheitlich messen (alle Rubriken, beide Modi); `LiveSuche`-Fokus auf Doppelring vereinheitlichen | `wcag-audit-patterns` + Playwright | `src/index.css`, `e2e/a11y.e2e.ts`, `InternationalRubriken.tsx`, `LiveSuche.tsx` | mittel | M | nein |
| W2.8 | **Payload-Splitting** grosser Erlasse (OR/ZGB) für LCP/INP — verhaltensneutral, adversarialer Vollständigkeits-Check Pflicht; verschärft W1.11-Messung | `superpowers:systematic-debugging` + Playwright (LCP/TBT) | `src/pages/GesetzLeser.tsx`, `src/lib/normtext/laden.ts`, `src/lib/normtext/browse.ts`, `public/normtext/bund/OR.json` | mittel | L | nein |

### Welle 3 — nach 1.12.2026 / braucht David-Fachzeit oder Marken-Entscheid

| # | Massnahme | Tool/Sub-Agent | Dateien/Routen | Wirkung | Aufwand | David? |
|---|---|---|---|---|---|---|
| W3.1 | **FAQPage** auf Rechner-Seiten (Frage/Antwort = Rechtsaussage). Mechanik in W1 vorbaubar (`TODO(David)`) | `seo-snippet-hunter` (falls beschafft) | `src/lib/seo.ts`, `RechnerVerzugszins.tsx`, `RechnerVerjaehrung.tsx`, `RechnerKuendigung.tsx`, `RechnerUebersicht.tsx` | hoch | M | **ja** |
| W3.2 | **Themen-Hub-Landingpages** (Norm+Rechner+Leitentscheide auf 1 URL). Gerüst+interne Links vorab, Einleitungstexte `TODO(David)` | `seo-keyword-strategist`+`seo-structure-architect` (falls beschafft) + `superpowers:brainstorming`/`writing-plans` | `src/lib/normtext/werkzeuge.ts`, `src/lib/seo.ts`, `scripts/prerender.ts` | hoch | L | **ja** |
| W3.3 | **Keyword-/Themen-Strategie** je Rubrik (juristische Begriffe) → speist W1.2/W3.2 | `seo-keyword-strategist` (falls beschafft) | `src/lib/seo.ts`, `src/lib/startseiteConfig.ts`, `Gesetze.tsx`, `Rechtsprechung.tsx` | mittel | M | **ja** |
| W3.4 | **Eigene Domain** statt `lexmetrik.vercel.app` (1 Konstante `SITE_URL` + DNS). **Erst nach W1-Indexaufbau** (sonst Canonical-Umzug mitten im Index; GSC-Property aus W1.12 dann auf neue Domain umziehen) | `vercel:deploy` / Domain-Verwaltung | `src/lib/seo.ts`, `vercel.json` | niedrig–mittel | S | **ja** (Domainwahl, nicht Fachrecht) |
| W3.5 | **„Use of Color"** — Links im Fliesstext ohne Unterstreichung (B-2-Markenentscheid) | `wcag-audit-patterns` + Playwright (Varianten als Screenshot) | `src/index.css`, `e2e/a11y.e2e.ts`, Fliesstext-Komponenten | mittel | S | **ja** (Design-Freigabe) |
| W3.6 | **Gedämpfte Marken-Kontraste** (ink-400 „aufgehoben", Zitiermarken, Sa/So-Kalender) anheben | `wcag-audit-patterns` + Playwright | `src/index.css`, `ArtikelBody.tsx`, `FristenKalender` | niedrig | S | **ja** (Design-Freigabe) |
| W3.7 | **hreflang-Alternates** für übersetzte URLs (fr/it). Nur echte Übersetzungs-URLs (sonst Soft-404); `lang`-Mechanik selbst ist bereits in W2.4 autonom erledigt | `seo-structure-architect` (falls beschafft) | `scripts/prerender.ts`, `src/lib/seo.ts`, `RouteMeta.tsx`, `index.html` | niedrig (heute) | S | **ja** (abhängig vom fr/it-Inhaltsentscheid) |

## 4. SEO-Strang (Detail)

**Verifizierter IST-Stand (read-only):** `src/lib/seo.ts` → `SITE_URL = 'https://lexmetrik.vercel.app'`, `metaFuerPfad()` gibt für alle Detailpfade `null`, `jsonLdFuerPfad()` nur WebSite/Organization (`/`) + WebApplication (Karten), Kommentar Z.~132 „KEINE FAQPage: keine FAQ-Inhalte". `scripts/prerender.ts` → hartes Tor `ERWARTETE_ROUTEN = 56`, Sitemap bewusst ohne lastmod, `app.html` mit `robots: noindex`. `vercel.json` → `cleanUrls:true`, `trailingSlash:false`, Rewrite `/(.*) → /app`, CSP `script-src 'self'` (JSON-LD muss `ld+json` bleiben); `Cache-Control` existiert **nur** unter `/assets/(.*)`, **nicht** unter `/normtext/*` (dort nur X-Frame-Options/CSP) und gar kein Block für `/rechtsprechung/*`. **Mengen verifiziert in den Registern:** 1460 Erlasse total → 1449 `snapshot` (218 bund + 1231 kantonal), 9 `nur-live-link`, 2 `pdf-embed`; 370 Entscheide total, alle `bestand:snapshot` (340 `bger` + 30 kantonale Gerichte). **= 1819 indexierbare Detail-URLs.** Register-Felder reichen für Legislation-JSON-LD + Meta **vollständig aus** (`key, ebene, kanton, kuerzel, titel, sr, rechtsgebiet, status, stand, quelleUrl, fassungsToken, artikelAnzahl` bzw. `gericht, gerichtName, nummer, bgeReferenz, datum, zitierung, sachgebiet, normKeys, bestand, quelleUrl`) — **Strukturwerte nichts zu erfinden; kuratierte Texte/Geltungsaussagen = `TODO(David)`.**

**Abhängigkeiten:**
1. **W1.0** (Werkzeug-Beschaffung/Klärung) vor jedem Dispatch.
2. **W1.1** ist Voraussetzung für W1.2/W1.3/W1.4/W1.5 und W2.1 — ohne prerenderte Detail-URLs greifen Meta/JSON-LD/lastmod/Backlinks ins Leere.
3. Innerhalb W1: W1.1+W1.4+W1.5 zusammen (Sitemap+Stubschutz), dann W1.2+W1.3 (pro-URL-Meta/Schema). W1.9/W1.10/W1.11/W1.12 unabhängig parallel.
4. **W3.4 (Domain) erst nach W1-Indexaufbau** (GSC-Property mitziehen).
5. **W3.1/W3.2-Gerüst** technisch in W1 mitbaubar (`TODO(David)`), Inhalt erst ab 1.12.2026.

**Build-Skalierungs-Gate (Annahme, vor W1.1-Rollout messen):** Prerender ist nur mit 56 Routen erprobt; bei 1819 Routen Laufzeit + `dist/`-Grösse messen (Sub-Agent fährt Prerender mit wachsender Routenzahl, Schwelle in `scripts/gate.sh`). **OOM ist bei statischem render-then-replace unwahrscheinlich** (kein SSR) — das reale Risiko ist Prerender-**Laufzeit** (jede Route lädt JSON + rendert) und `dist/`-Volumen, **nicht** Build-Timeout als Blocker. Erst wenn die Messung tatsächlich auffällige Laufzeit zeigt: `council-review` zu „voll-statisch vs. gestaffelt Top-N" — bei nur 1819 Routen vermutlich kein echter Tradeoff, also nicht vorschnell auslösen.

**Erfolgsmessung (autonom prüfbar):** `dist/sitemap-gesetze.xml`-`<loc>`-Count == Anzahl `status:snapshot`-Erlasse (1449); `curl` einer Detail-URL zeigt befülltes `#root` + korrekte `<title>` **ohne** `robots:noindex`; Google **Rich Results Test** je Reader-Typ fehlerfrei; `npm run gate` grün; nach Deploy via **der in W1.12 eingerichteten GSC-Property** Indexabdeckung-Sprung (56 → >1000). Ohne W1.12 ist die GSC-Messung nicht durchführbar.

## 5. A11y-Strang (Detail)

**Leitprinzip:** Der gesamte A11y-Strang (Welle 1+2) ist Darstellungs-/Test-Layer, braucht **keine** juristische Fachzeit → Strang B der `FAHRPLAN-LERNPHASE-2026.md`. Verifikation läuft über das **vorhandene** Playwright-Setup (`@axe-core/playwright` ist bereits Dependency) — kein neues Tooling, kein MCP-Screenshot (Memory-Regel „Werkzeuge zuerst prüfen"). Einzige David-Berührung: bewusste Marken-/Design-Entscheide (W3.5/W3.6) und der fr/it-Inhaltsentscheid (W3.7); die reine `lang`-Mechanik (W2.4) ist autonom.

**Konkrete Bugs/Lücken (verifiziert im Befund):**
- **W1.6 Karten-Fokus:** `SchweizKarte.tsx`-Pfade `className="outline-none"` (Z.67) überschreiben globalen `:focus-visible` (`index.css` Z.~131) → Fix via `focus-visible:stroke-brass-700` + erhöhte `strokeWidth`, Verifikation Screenshot hell **und** dunkel, Indikator-Kontrast ≥ 3:1, `aria-label`/`aria-pressed` (Z.64–66) bleiben angesagt. **Eng begrenzt (1 Komponente) → Wirkung „mittel" relativ zum 1819-Seiten-Haupthebel.**
- **W1.7 Tor-Löcher:** ungetestet sind genau die komplexesten Widgets (Lesemodus-Dialog mit Fokusfalle, mobile `role=dialog`-Schublade, Karte). Neue `test()`-Blöcke analog `axePruefen()`, Gate bleibt critical/serious, moderate/minor als Anhang.
- **W2.2 Tabellen:** `MehrspaltigeTabelle`/`TarifTabelle`/`StaffelTabelle` als `<span>`-`display:table` → Screenreader liest Fliesstext, Spaltenkopf-Bezug „Streitwert→Gebühr" verloren. Fix verhaltensneutral, Golden-Tests sichern sichtbaren Output, `browser_snapshot` prüft Accessibility-Tree. **SEO-Doppelnutzen.**

**SEO-Doppelnutzen (Koordination mit §4, gemeinsame Single Source, keine Doppelarbeit):** echte Tabellen-Semantik (W2.2) → besseres Google-Tabellenverständnis; saubere Heading-Hierarchie (W1.8) → Dokumentstruktur-Signal; Landmarks (`Shell.tsx` bereits gut) beim Detail-Prerender mitziehen; `lang` (W2.4) + hreflang (W3.7) = identische Infrastruktur. **A11y-Tor und Prerender-Drift-Tor gemeinsam erweitern**, damit jede neue prerenderte Reader-Route automatisch durch axe läuft.

## 6. Skill-Governance & Self-Audit-Rhythmus

**Einführungs-Pipeline für Community-Skills (5 Stufen über `legal-builder-hub`):**
0. **Bedarf statt Sammeln** — Skill nur bei konkretem offenem Recon-Punkt evaluieren, kein „auf Vorrat". (Genau das ist W1.0 für die noch nicht vorhandenen seo-*/A11y-Skills.)
1. **`registry-browser`** — nur gegen Allowlist suchen, volle `SKILL.md` (roh) anzeigen vor Install.
2. **`skill-installer` mit Trust-/Injection-Scan** — harte Ablehnung bei: Prompt-Injection-Mustern; Netzwerk-/Exfiltration (kritisch — Normtext-Korpus + unveröffentlichte Fahrpläne liegen im Repo); Schreib-/Löschbefehlen ausserhalb deklariertem Scope (nie `public/normtext` oder Golden-Tests); Skills, die Rechtsregeln „verbessern" wollen.
3. **`skills-qa` Ampel** — Ready/Some Concern/Material Concerns. **Verschärfung für LexMetrik:** jeder Skill, dessen Output Rechtsaussagen erzeugen *könnte*, wird unabhängig von der Ampel als **„braucht David-Fachzeit"** in die Welle ab 1.12.2026 verschoben. Bei gelb: adversarialer Gegen-Agent beim Erstlauf (Memory „immer doppelt verifizieren").
4. **Pflege** — `auto-updater` regelmässig, **nie** auto-anwenden (Diff + Freigabe); `disable` statt `uninstall` für ungenutzte Skills.

**Hub-Disziplin (aktivieren/deaktivieren):** `legal-builder-hub` kostet ~1250 Token/Session nur fürs Geladensein + zieht US-MCP (Lawve_AI/Slack, standardmässig **nicht** authentifiziert). **Aktivieren** nur in dedizierten Skill-Wartungs-Sessions (Install/Eval, monatlicher Audit, Cold-Start). **Nicht laden** bei normaler Produktarbeit (Import/Tarife/Vorlagen/Deploy). Skill-Verwaltung in kurze Batches bündeln (passt zu „autonom durchführen pro Batch").

**Monatlicher Self-Audit „Sichtbarkeit & Zugänglichkeit"** (ohne Fachzeit, Strang B; Kandidat für `schedule`-Cron mit Mensch-im-Diff):
1. A11y-Tor erweitern (`wcag-audit-patterns` + `e2e/a11y.e2e.ts`), reihum eine neue Rubrik.
2. SEO-Regression: Sitemap-URL-Zahl, `noindex`-Lecks (keine indexierbare Seite liefert `app.html`), Canonical/JSON-LD je Routentyp, GSC-Indexabdeckung (Property aus W1.12).
3. Registry-Sync: Hub kurz an, `auto-updater`+`registry-browser`, Diffs sichten, Hub wieder aus.
4. Befund als `bibliothek/`-Eintrag; neue Befunde → neue Tor-Pruefpunkte (selbstverstärkend).
5. Adversarialer Schlussdurchgang (Gegen-Agent prüft den Audit selbst).
Nie befüllt im Audit: FAQ-Texte, Hub-Einleitungen, Keyword-Schwerpunkte, kuratierte Descriptions, Geltungsaussagen (nur `TODO(David)`).

## 7. Arbeits-Playbook (Trigger-Sätze)

**Skill-Verwaltung:**
- „Wir machen jetzt eine **Skill-Wartungs-Session**" → Hub an; am Ende „**Hub wieder deaktivieren**".
- „**Browse** die Registries nach einem Skill für schema.org-Legislation-Markup bzw. SEO-Struktur" (`registry-browser`) — das ist W1.0.
- „**Installiere [skill]**, aber zeig mir vorher das skills-qa-Verdikt und den Injection-Scan" (`skill-installer`→`skills-qa`).
- „**Should I trust this skill?**" (`skills-qa`). · „**Check for updates**" (`auto-updater`, Diff+Freigabe). · „**Disable [skill]**".

**SEO (mit vorhandenem Werkzeug, oder nach sauberem Install eines seo-* Skills; gespawnte Sub-Agenten `model:opus` erzwingen):**
- „Entwirf die Prerender-Architektur für die Detailseiten inkl. Sitemap-Index und `vercel.json`-Rewrite (auf `cleanUrls`/`trailingSlash` abstimmen), sodass prerenderte Pfade nicht mehr auf `/app`-noindex gehen." (`superpowers:writing-plans` → Eigenentwicklung; ggf. `seo-structure-architect`, falls in W1.0 installiert) → danach `vercel:deploy` Preview + real prüfen, dass `/gesetze/bund/OR` kein `noindex` liefert.
- „Generiere title/description pro Erlass/Entscheid NUR aus Strukturdaten (mechanisches Template) — jede kuratierte Description bleibt `TODO(David)`."
- „Prüf die neuen JSON-LD-Objekte mit Playwright `browser_snapshot` auf Rich-Result-Eignung; `legislationLegalForce` bleibt ausgeklammert."
- „Leite Such-Intents je Rubrik ab" → **braucht David** → `TODO(David)`, Welle 3.
- „Richte die Search-Console-Property ein und submitte die Sitemap" (W1.12).

**A11y (vorhandenes Playwright + `accessibility-compliance:*`):**
- „`wcag-audit-patterns`: gib mir die WCAG-2.2-Kriterien + axe-Regelmapping für die mobile Nav-Schublade und den EntscheidLeser-Lesemodus-Dialog, dann ergänz Blöcke analog `axePruefen()` in `e2e/a11y.e2e.ts`."
- „`screen-reader-testing`: VoiceOver/NVDA-Durchlauf für Sidebar-Drilldown, SchweizKarte und ArtikelBody-Tabellen, Ergebnis als `bibliothek/`-Baseline."
- „Erweitere `e2e/tastatur.e2e.ts` (bestehende 2 Kalender-Tests) um Skip-Link/Sidebar/Suche/Karte — nicht neu anlegen."
- „Mach mit **Playwright** einen Screenshot der fokussierten SchweizKarte hell + dunkel" (`browser_take_screenshot`, `browser_resize 390` für Touch-Targets).

**Verbindliche Kette pro Repo-Änderung:** (1) `superpowers:brainstorming`→`writing-plans` bei neuer Mechanik → (2) ggf. Community-Skill (nur wenn in W1.0 installiert) liefert Entwurf, sonst Eigenentwicklung → (3) iterativer Bug-/Logik-Check + adversarialer Schluss → (4) `/code-review` → (5) `/security-review` zusätzlich, wenn Diff von frisch installiertem Skill stammt → (6) `superpowers:verification-before-completion` + Playwright + bei Routing/Build `vercel:deploy` Preview → (7) `/council` bei echtem Tradeoff (nur wenn die Build-Messung ihn belegt) → (8) Merge/Prod-Deploy **nur auf explizites Ja von David**.

## 8. Risiken & Kollisions-Hinweise

- **Paralleler Agent im Repo:** Ein anderer Agent arbeitet gleichzeitig in `/Users/david/Developer/LexMetrik`. Dieser Fahrplan ist read-only erstellt. **Vor jeder echten Umsetzung konkret prüfen, woran der andere Agent gerade arbeitet** — er fasst möglicherweise genau `register.json`/`seo.ts`/`prerender.ts`/`vercel.json` an, die meistgenutzten Dateien dieses Fahrplans. Nicht nur generisch `git status`, sondern aktive Branches/offene Diffs sichten, **eigenen Branch/Worktree** nehmen, nicht im selben Working Tree schreiben (Memory-Lektion „git/Parallel-Sessions").
- **Golden-schonend:** `public/normtext` + Golden-Tests sind tabu für strukturelle Umbauten; W2.2 (Tabellen-Semantik) und W2.8 (Payload-Splitting) sind **verhaltensneutral** zu halten — Golden-Snapshots des sichtbaren Outputs müssen byte-gleich bleiben, adversarialer Vollständigkeits-Check der Normtexte Pflicht.
- **Drift-Tore:** `scripts/prerender.ts` bricht bei <500 Zeichen, Inline-`<script>`, „Wird geladen", Routenzahl ≠ `ERWARTETE_ROUTEN`. Bei W1.1 muss das 56-Tor **dynamisch/zweistufig** werden (Katalog 56 + abgeleitete Detailmenge 1819), sonst bricht der Build — sauber, aber bewusst anzupassen.
- **<500-Zeichen-Tor × kurze Inhalte (unbedachte Interaktion):** Die Mindestlänge kann nicht nur bei Stubs (durch W1.5 gefiltert), sondern auch bei **kurzen snapshot-Entscheiden ohne Regeste** (`regesteVorhanden:false` im Register) brechen, wenn der Render-Output unter 500 Zeichen fällt. Vor W1.1-Rollout prüfen, Schwelle ggf. routentyp-abhängig machen oder solche Entscheide gesondert behandeln.
- **CSP:** `script-src 'self'` → JSON-LD muss nicht-ausführbarer `ld+json`-Block bleiben (Mechanik bereits gelöst in `prerender.ts`); neue JSON-LD-Branches dürfen kein Inline-`<script>` einführen.
- **Build-Skalierung (Annahme, nicht belegt):** 1819 Routen unerprobt → Laufzeit-/`dist/`-Messung vor Rollout; OOM unwahrscheinlich (statisches Render). Nicht als Blocker, sondern als Mess-Tor framen.
- **CWV-Regression genau am Hebel:** W1.1 liefert 1449 Erlass-Seiten aus, die jede beim ersten Render das JSON nachladen; OR/ZGB ~1.8 MB. LCP/INP-Mess-Tor an W1.1 hängen (W1.11), Splitting in W2.8.
- **lastmod-Datenqualität (Annahme/Risiko):** `stand` ist häufig das uniforme Fedlex-Konsolidierungsdatum, nicht echte Modifikationszeit — unplausibel-uniforme lastmods können GSC-Vertrauen schädigen; im Zweifel weglassen (W1.4).
- **Thin-Content-Strafe:** Stubs (`nur-live-link`/`pdf-embed`) dürfen **nicht** in die Leaf-Indexierung rutschen (W1.5 als Pflicht-Filter, `verification-before-completion`).
- **Domain-Umzug:** W3.4 nicht während des Index-Aufbaus → Canonical-Doppelindex-Risiko; GSC-Property aus W1.12 mit umziehen.
- **Sub-Agent-Modell:** gespawnte Sub-Agenten/`accessibility-compliance:*` defaulten ggf. auf Haiku → ohne explizites `model:'opus'` schlechtere Qualität (Memory-Daueranweisung). Für noch nicht installierte seo-* Agenten erst nach Beschaffung relevant.
- **US-MCP-Datenfluss:** Lawve_AI/Slack über `legal-builder-hub` standardmässig nicht authentifizieren — unveröffentlichter Korpus + Fahrpläne im Repo.
- **Phantom-Werkzeuge:** Die seo-*-Agenten und `accessibility-audit`/`ui-visual-validator` sind **nicht installiert** — nicht gegen sie dispatchen; `ui-visual-validator`-Aufgaben über Playwright erledigen (siehe §3-Werkzeug-Realität).
- **Keine erfundenen Rechtstexte:** alle Meta/JSON-LD/lastmod-Werte ausschliesslich aus den Registern; kuratierte Descriptions, `legislationLegalForce`/Geltungsaussagen und alles nicht mechanisch Ableitbare → `TODO(David)`, nicht erfinden.

## 9. Einordnung zu bestehenden FAHRPLAN-*.md (keine Dopplung)

- **Stand:** 24 `FAHRPLAN-*.md` im Repo-Root. Keiner adressiert SSG-Skalierung / Sitemap-Index / JSON-LD der **Erlass**-Detailseiten / A11y-Tor-Ausbau → neuer `FAHRPLAN-SEO-A11Y-GOVERNANCE.md`.
- **`FAHRPLAN-RECHTSPRECHUNG.md` (echte Überschneidung, kein leerer Bereich):** dieser Fahrplan adressiert Prerender/Sitemap/JSON-LD für `/rechtsprechung` und hält an mehreren Stellen (u.a. Z.~365/471, Prerender-Tor-Review M6/M7) fest, `/rechtsprechung/:key` sei „SPA-Fallback, Tausende Keys, nicht prerenderbar". **Das war eine Fehleinschätzung der Mengengrösse — es sind real nur 370 Keys**, Build-Skalierung damit ungefährlich. W1.1 **revidiert** diese Annahme bewusst (gefilterte snapshot-Menge). → In `FAHRPLAN-RECHTSPRECHUNG.md` als überholt markieren, **damit der Parallel-Agent nicht die alte Annahme weiterpflegt** (Kollisionsrisiko). „Dupliziert nichts" ist also präzise: „überschneidet sich mit RECHTSPRECHUNG.md und revidiert dessen Annahme".
- **Andockpunkt `FAHRPLAN-LERNPHASE-2026.md` (Strang B = Verifikations-/Infrastruktur):** der gesamte autonome Teil (Welle 1+2) gehört thematisch hierhin (ohne David-Fachzeit, vor 1.12.2026). Strang C (Fristen-Warteschlange) nimmt die Welle-3-Punkte mit `TODO(David)` auf.
- **`FAHRPLAN-RECHTSSAMMLUNG.md` / `GESETZE-IMPORT-3TIER.md`:** liefern den `status`-/`snapshot`-Begriff, auf dem W1.5 (Thin-Content-Filter) aufsetzt — referenzieren, nicht neu definieren.
- **`PRODUKTAUSBAU-BURGGRABEN.md`:** W2.1 (Rück-Verlinkung) + W3.2 (Themen-Hubs) zahlen direkt auf den Burggraben ein → dort als SEO-Sichtbarmachung der bestehenden Verzahnung verlinken.

## 10. Nachträge aus dem Optimierungs-Research 12.7.2026 (`FAHRPLAN-OPTIMIERUNG-2026-07.md` O-5)

Live-verifizierte, **echt neue** Posten (kein Duplikat zu W1–W3); Zone bleibt geparkt,
Einsortierung ohne Bau:

| ID | Was | Beleg (live 12.7.2026) | Aufwand |
|---|---|---|---|
| W2.1b | **Hub→Detail-Registerseiten**: prerenderte A–Z-/Registerseiten je Ebene/Kanton + Entscheid-Chronik + Verzahnungs-Links im prerenderten Detail-HTML (ERLASS_WERKZEUGE invertiert, normKeys Entscheid→Gesetz, Breadcrumb als echte `<a>`) — geht über W1.1/W2.1 hinaus (W2.1 = Rechner→Norm, nicht Hub→Detail) | Hubs `/gesetze`,`/rechtsprechung`,`/materialien`,`/abdeckung` enthalten im ausgelieferten HTML **0 Links** auf Detailseiten; ~3400 Detail-URLs hängen nur an der Sitemap (Orphan-Pages) | M |
| W1.5b | **Thin-Content-Schutz Materialien** (Analogon zu W1.5, das nur Gesetze deckt): Stubs unter Substanz-Schwelle noindex/aus der Sitemap, oder mechanische Anreicherung aus Registerfeldern | `/materialien/ESTV-KS-DBG-37`: 227 Zeichen Body, indexierbar, Article-Schema; sitemap-materialien = 1549 URLs (grösste Teil-Sitemap) | S |
| W1.3b | **JSON-LD-Anreicherung** (W1.3-Erweiterung, rein mechanisch aus Registern, W1.3-Trennstrich «kein Geltungs-Claim» gilt): Legislation + `sameAs`→Fedlex-ELI (quelleUrl im Register!), `legislationDate`/`dateModified` (stand), Jurisdiktion; Entscheidseiten erstmals mit Fach-Typ (heute nur BreadcrumbList trotz gericht/datum/zitierung/sachgebiet im Register) | Legislation-Knoten live nur name/alternateName/inLanguage/url/legislationIdentifier | S |
| W1.10b | **OG-Bilder per Typ/Dokument** (build-zeitlich, `scripts/og-bild.ts` existiert als Generator; Template mit Kürzel/SR-Nr. bzw. Aktenzeichen) — niedrigste Priorität, erst nach Index-Aufbau | og:image = ein statisches `/og.png` für alle 3400 Detailseiten, og:type überall `website` (og:title/description pro Dokument korrekt) | M |

Prioritätsvermerke aus demselben Research: **W1.12** (GSC) bleibt Freischalt-Posten —
`site:lexmetrik.vercel.app` liefert 0 Treffer, kein Verifikations-Tag; **W1.11/W2.8**
steigen in der Dringlichkeit (923 KB HTML auf `/gesetze/bund/OR` live, `cache-control
max-age=0` — CWV-Problem genau auf den Haupt-Keyword-Seiten, Schnitt QS-PERF); **W3.4**
(Domain) je früher vor Erstindex, desto billiger. Zwei ursprünglich hier verortete
Befunde sind als **Betriebs-Härtung** nach `FAHRPLAN-OPTIMIERUNG-2026-07.md` O-1
gewandert (nicht «reines SEO»): Soft-404-Rewrite-Ausnahmen + case-insensitiver
301-Redirect (`/gesetze/bund/or` → noindex-Shell ohne Redirect, live belegt).

## 11. Intake G-PRERENDER — Prerender-String-Builder ist verlustbehaftet (David 17.7.2026)

> **Herkunft:** Recherche «Informations-Nutzung der Gesetze» (Auftrag David
> 17.7.2026). **Detailquelle (§11):**
> `bibliothek/normen/informations-nutzung-gesetze-2026-07-17.md` (dort Tier 2).
> Hierher verortet, weil **SEO/§15-Fläche** — getrennte Einheit von den
> Extraktions-Kandidaten (§14 Ziff. 2).

- **Befund:** der Prerender-String-Builder `src/lib/seo-detail.ts` (`bloeckeHtml`,
  ~Z. 229–286) **droppt** Fussnoten, Verweis-Links, Bilder, Per-Artikel-Anker und
  tieferes Item-Nesting; React repariert das erst on-mount (render-then-replace).
  → Crawler + erstes Paint + Ctrl-F-vor-Mount sind verlustbehaftet.
- **Spannung §15:** mehr Prerender-Treue = mehr HTML-Gewicht auf genau den neu
  indexierten OR/ZGB-Seiten (~1.8 MB, W1.11-CWV-Tor). Jede Anreicherung braucht
  eine **explizite Logikverlust-/Geräte-Last-Bewertung** (§15) — Treue vor Tempo,
  aber begründet.
- **Abgrenzung:** verwandt mit W1.1/W2.1b (prerenderte Detail-Links), aber die
  **inhaltliche** Prerender-Treue (Fussnoten/Verweise/Bilder im ersten HTML) ist
  ein eigener Posten. **Umfang:** M. **🚧 Bau-GO ausstehend (David).**
