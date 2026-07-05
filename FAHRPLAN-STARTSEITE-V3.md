# FAHRPLAN-STARTSEITE-V3 — Startseiten-Neubau + Branding I2 (bau-fertige Spec)

> **Stand:** 3.7.2026 · **ROADMAP-Schritt:** W2·5c · **Status:** freigegeben zum autonomen Bau
> (Opus-Session, OHNE Rückfrage an David — Auftrag David 3.7.2026).
> **Entstehung:** Fable-Ultracode-Recherche (11 Agenten: 5 Recherche-Stränge, 2 unabhängige
> Vollkonzepte «A nüchtern-modern» / «B frischer», 4 adversariale Kritiken) + DMAD-Council
> (12 Agenten: 5 Berater mit distinkten Denkmethoden, 5 anonyme Peer-Reviews, Devil's Advocate
> gegen den Konsens, Chairman-Synthese). **Das Council-Verdikt ist BINDEND** — David hat die
> Design-Richtungs-Entscheidung ausdrücklich an den Council delegiert.
> **Dossier (Herleitung + volles Verdikt):** `bibliothek/recherche/startseite-v3-design.md`.
>
> **Davids Zielvorgabe (wörtlich, 3.7.2026):** «eine Einstiegsseite gewährleisten, die modular
> aufgebaut ist und einen einfachen Einstieg in die Funktionen von LexMetrik bietet … willkommend
> und einfach zu bedienen und schön und modern aussehen.» Scope-Entscheide David: Startseite +
> Einstiegs-Navigation; **I2 Branding-Neuausrichtung mitgebündelt**; Design-Rahmen entscheidet
> der Council.

---

## §0 · Das Verdikt: Hybrid «A-Basis + Brass-Hero» als Schalter-Liste (BINDEND)

Der Council hat erkannt: A vs. B war eine Schein-Dichotomie (~90 % Substanz identisch). Der
Entscheid ist eine Schalter-Liste — **jeder Schalter ist entschieden, die Bau-Session
verhandelt ihn nicht neu:**

| Schalter | Entscheid |
|---|---|
| Brass-Wash-Hero | **JA** — Hero-Fläche `bg-brass-100 rounded-2xl` (Bestands-Token), Dark-Mode über den vorhandenen `html.dark`-Token-Override; UniversalSuche IM Hero integriert. Dies ist die EINE Wärme-Dosis der Seite. **Dokumentierter Ein-Klassen-Fallback: `bg-surface`** (falls Kontrast-Messung oder Davids spätere Sichtung kippt). |
| Deko-SVG «Regalstruktur» | **NEIN** — Broschüren-Signal; das Token `--hero-deko` entfällt ersatzlos. |
| Token `text-display-xl` | **NEIN** — H1 im bestehenden `text-display` (mobil `text-h1`); das Reglement endet bewusst bei `display-l`. Keine neuen Typo-/Farb-Tokens. |
| ✓-Badges im Hero | **NEIN** — Vertrauens-Aussagen leben ausschliesslich als gescopter Satz im Vertrauens-Block, nie als Siegel/Badge. |
| Gruss-Zeile | **NEIN (kein Gruss-Wort)** — ruhige Datums-Overline «Donnerstag, 3. Juli 2026» bleibt; client-gerendert hinter fixer Zeilenhöhe, `suppressHydrationWarning` ehrlich im Code begründet (Build-Datum ≠ Client-Datum — die gegenteiligen Behauptungen beider Konzepte waren falsch). Scherzpool (~250 Phrasen) + tickende `setInterval`-Uhr gestrichen. |
| Gestaffeltes Reveal | **NEIN** — keine Stagger-Choreografie; der Hero liegt nie unter `opacity: 0` (LCP). Nur Feedback-Motion (Hover 120 ms, Panel 160 ms), `prefers-reduced-motion` respektiert. |
| Schnellrechner-Position | **VOR den Kacheln.** Reihenfolge der Seite: Hero+Suche → Schnellrechner → Rubrik-Kacheln (mit Gesetze-Direktzugriff-Chips) → Zuletzt verwendet → News → Vertrauens-Fuss/§8-Hinweis. Begründung: «Frist rechnen» ist der schärfste Kanzlei-Schmerz; Wiederkehrer-Effizienz schlägt Erstbesuchs-Inszenierung (Bloomberg/Westlaw-Analogie, 3 Council-Stimmen unabhängig). |
| Wärme-Dosis konkret | Einzige warme Fläche = Hero-Wash `bg-brass-100`; dazu Kachel-Hover mit Bestands-Akzent (brass-Kante wie `lc-chip`/`lc-tile`-Idiom). Abstände in der Bestandsskala, KEINE «Layout-Stufe gross». |
| Zuletzt verwendet | **JA** (ersetzt Favoriten), aber beim Erstbesuch wird die Sektion NICHT gerendert — localStorage wird synchron gelesen (kein async-Nachwachsen). §15-Auflösung siehe Modul #5. |
| Zeiterfassung | **Option A: Sektion auf `/rechner`, KEINE eigene Route.** Hält `ERWARTETE_ROUTEN` bei 57, vermeidet die Verschärfung der `seo.ts`/`prerender.ts`-Kollision mit dem SEO-A11Y-Strang; Komponente unverändert. Route später billig nachrüstbar, Rückbau wäre teurer. |

**Ausdrücklich NICHT gebaut:** Deko-SVG, `--hero-deko`, `text-display-xl`, ✓-Badges, Gruss-Wort,
Scherzpool/Uhr, Verzahnungs-Slogan-Zeile (enthielt den Sachfehler «Schriftsatz»), gestaffeltes
Reveal, ⌘K-Palette, Route `/zeiterfassung`, Favoriten-Migration, Serif auf der Startseite, neue
Farb-/Typo-Tokens, Dossier/Accounts/Personalisierung (ausser localStorage-Zuletzt),
Rechtsgebiet×Aufgabe-Matrix auf «/» (lebt auf `/rechner`), Marketing-Elemente (Testimonials,
CTA-Buttons, Illustrationen/Fotos).

---

## §1 · Leitidee

Beim ersten Blick sieht eine Anwältin einen aufgeräumten Kanzlei-Schreibtisch mit einem einzigen
warmen Element: eine ruhige, warm hinterlegte Kopffläche, die in einem Satz sagt, was das
Werkzeug kann, mit dem Suchfeld als offensichtlichem erstem Zug. Direkt darunter der
Schnellrechner (der tägliche Handgriff), dann fünf Kacheln als vollständige Landkarte der
Sammlung. Nichts blinkt, nichts verkauft — jede Zeile benennt konkreten Nutzen, und genau diese
Präzision plus die eine warme Geste liest sich als «willkommend und modern», ohne Startup-Optik.

## §2 · Seitenaufbau

**Desktop ~1280 px** (Container `max-w-content` = 70 rem, zentriert — ersetzt den heutigen
tokenlosen `max-w-[58rem]`; Sektionsabstand `--space-16`):

```
┌ Topbar: Logo · HeaderSuche («/»- UND ⌘K-Shortcut, Norm-Sprung) · Theme ┐
│ Sidebar: Start·Gesetze·Rechtsprechung·Materialien·Rechner·Vorlagen │
├────────────────────────── main ──────────────────────────┤
│ ╔══ HERO: bg-brass-100 rounded-2xl, Innenraum p-6/p-8 ══╗ │
│ ║ Donnerstag, 3. Juli 2026            (overline, ink-500)║ │
│ ║ H1  Schweizer Recht nachschlagen,                      ║ │
│ ║     Fristen und Kosten berechnen     (text-display)    ║ │
│ ║ Subline (text-body-l, max-w-reading)                   ║ │
│ ║ ┌────────────────────────────────────────────────────┐ ║ │
│ ║ │ 🔍 UniversalSuche «Artikel, Entscheid, Rechner …» │ ║ │
│ ║ └────────────────────────────────────────────────────┘ ║ │
│ ╚════════════════════════════════════════════════════════╝ │
│ ── SCHNELLRECHNER ────────────────────────────────────────  │
│ Tabs Fristen·Gebühren·Zuständigkeit │ FristenKalender       │
│ ── ALLE BEREICHE ─────────────────────────────────────────  │
│ ┌─Gesetze──┐┌─Rechtspr.┐┌─Material.┐┌─Rechner──┐┌─Vorlagen─┐│
│ │Nutzensatz││Nutzensatz││Nutzensatz││Nutzensatz││Nutzensatz││
│ │+ Zähler  ││+ Zähler  ││          ││+ Zähler  ││+ Zähler  ││
│ └──────────┘└──────────┘└──────────┘└──────────┘└──────────┘│
│ Direktzugriff: [OR][ZGB][BV][StGB][ZPO][StPO][SchKG][DBG]   │
│ ── ZULETZT VERWENDET (nur wenn Einträge existieren) ──────  │
│ [Fristenrechner] [Art. 336c OR] …   (max 6 Chips, 1 Zeile)  │
│ ── NEUES VOM BUNDESGERICHT ───────────────────────────────  │
│ ▸ Entscheid-Streifen (min-h-modul-news)                     │
│ Vertrauens-Fuss: Methodik-Satz + Status-Satz + §8-Hinweis   │
└──────────────────────────────────────────────────────────────┘
```

**Mobil ~390 px** (eine Spalte, Sidebar im Drawer): Hero (H1 in `text-h1`, Suche volle Breite) →
Schnellrechner (Tabs, Kalender darunter) → Kacheln 1-spaltig als kompakte Zeilenform (Icon links,
Titel+Nutzensatz rechts) → Chips (max 2 Zeilen) → Zuletzt (1 Zeile, `overflow-x-auto`) → News →
Vertrauens-Fuss. **Kein horizontaler Overflow bei 390 px** (smoke.e2e-Tor; Grid-Basis
`grid-cols-1` setzen — bekannte Falle).

Above the fold Desktop: Hero + Suche + Schnellrechner-Kopf sichtbar.

## §3 · Modul-Liste (Verdikt über JEDES heutige Modul)

| # | Modul | Verdikt | Inhalt / Auflagen | Datenquelle | CLS (§15) |
|---|---|---|---|---|---|
| 1 | **Hero** (ersetzt `Begruessung.tsx`) | **UMBAUEN** | Datums-Overline (client, fixe Zeilenhöhe, `suppressHydrationWarning` mit Begründungskommentar) · H1 = Value Proposition · Subline · UniversalSuche integriert. KEIN Gruss-Wort, kein Scherzpool, keine Uhr, keine Badges, keine Deko. Fläche `bg-brass-100 rounded-2xl`, Fallback `bg-surface` dokumentiert | Texte aus `seo.ts` (§6) | Fläche statisch; Datum hinter fixer Höhe |
| 2 | **UniversalSuche** | **BEHALTEN, in Hero** | `role="search"` + `input[type=search]` ERHALTEN (a11y.e2e-Selektorpaar); Placeholder «Artikel, Entscheid, Rechner, Vorlage …»; Scope-Zeile `text-micro ink-500` «Durchsucht Gesetze, Rechtsprechung, Materialien, Rechner und Vorlagen» | `useUniversalSuche` (geteilt mit Topbar, §5) — **geteilter Knoten mit E2-Strang, s. §12** | Feld `--control-h` fix; Trefferpanel als Overlay (kein Shift) |
| 3 | **Schnellrechner** + FristenKalender | **BEHALTEN, Position 2** (vor Kacheln) | Muster unverändert (`minimal`-Prop); `lc-card` mit «Fristenlauf»-Text und Kalender-DOM ERHALTEN (schnellrechner-kalender.e2e koppelt tief daran); leeres Formular ohne Fehler (C2) | wie heute | Panel-Höhe = höchster Tab (wie heute) |
| 4 | **Rubrik-Kacheln** | **NEU** | 5 Link-Kacheln in Sidebar-Ordnung, je Icon (monolinear ≤20 px) · Titel · 1 Nutzen-Satz · Zähler. Zähler NUR mit Scope und NUR wo substanziell («228 Bundeserlasse im Volltext»; nur Volltext-Erlasse zählen; dünne Bestände wie Materialien OHNE Zähler). Zähler zur **Buildzeit** berechnet (Codegen + Drift-Tor, kein Register-Import in den Startseiten-Chunk, kein Client-Fetch). KEINE Verzahnungs-Slogan-Zeile | `navigation.ts::NAVIGATION` (eine Landkarte, §5) | statisch |
| 5 | **Zuletzt verwendet** | **NEU** (ersetzt Favoriten) | Auto-getrackte Chips der letzten 6 besuchten Katalog-/Gesetzes-/Entscheid-Routen, neueste zuerst, keine Kuration, kein Stern. Route-Listener schreibt `{route, titel, zeit}` nach `localStorage['lexmetrik-zuletzt']`. **Erstbesuch: Sektion wird NICHT gerendert** (localStorage synchron gelesen). §15-Auflösung: die Sektion liegt unter dem Fold (Position 4/6); der Einbau beim Client-Takeover ist per `check:perf-budget`-CLS-Schwelle + Screenshot-Serie zu VERIFIZIEREN, nicht anzunehmen — reisst die CLS-Schwelle, gilt der spezifizierte Fallback: Sektion IMMER mit `min-h-modul-zuletzt` reservieren (leer ohne Titel). Chips: harte 1-Zeilen-Kappung, @390 px `overflow-x-auto`. **Label-Auflösung** für Erlasse/Entscheide (nicht nur `KATALOG_KARTEN`) als eigenes Arbeitspaket beziffern — ohne Register-Import in den Startseiten-Chunk | neu `src/lib/zuletztVerwendet.ts` | `min-h-modul-zuletzt` (Token, 4.5 rem) als Fallback-Reservierung |
| 6 | **NewsHeader** | **BEHALTEN, Position 5** | Sektionstitel «Neues vom Bundesgericht». **Leerzustand-Doppelpfad FIXEN:** nie eine Seclabel-Überschrift über Leerraum — Titel + Höhen-Reservierung wandern INS Modul, das bei leerem Register komplett nichts rendert | `ladeEntscheidManifest()` (lazy) | `min-h-modul-news` = 12.5 rem (heutigen Arbitrary-Wert als Token benennen) |
| 7 | **Vertrauens-Fuss** | **NEU** (ersetzt verstreute Claims) | Methodik-Satz + Status-Satz + §8-Hinweis (`lc-notice`, `max-w-reading`); Wortlaut §6 | `seo.ts` | statisch |
| — | **Favoriten.tsx** | **STREICHEN** | verletzt Daueranweisung 5.6.; keine Migration von `localStorage['lexmetrik-favoriten']` (kuratiert ≠ zuletzt) | — | — |
| — | **Zeiterfassung.tsx** | **VERSCHIEBEN** | Komponente unverändert als Sektion «Werkzeuge» unten auf die `/rechner`-Übersicht; keine neue Route; `/rechner` gehört damit ins §12-Inventar dieses Schritts | wie heute | dort reservieren wie heute |
| — | **GesetzeRubrik.tsx** | **UMBAUEN → Direktzugriff-Chips** | 8 `lc-chip`-Links OR/ZGB/BV/StGB/ZPO/StPO/SchKG/DBG unter der Kachelreihe; das EIGENE Suchfeld der GesetzeRubrik wird gestrichen (§5-Doppelung zur UniversalSuche) | Chip-Liste aus `GesetzeRubrik.tsx` extrahieren | statisch |

## §4 · Modul-Registry (Davids «modular», FUNDAMENT-Vorleistung)

Neue Datei `src/lib/startseiteModule.tsx` — reine Darstellungs-Deklaration (§3), Katalog bleibt
`startseiteConfig.ts`, Rubriken bleiben `navigation.ts` (§5). **OHNE `sichtbar()`** — SSR-
Determinismus ist nicht garantierbar (Council-Auflage 3); Leerzustände gehören ins Modul:

```ts
export type StartModulId =
  | 'hero' | 'schnellrechner' | 'rubriken' | 'zuletzt' | 'news' | 'vertrauen';

export interface StartModul {
  id: StartModulId;
  /** Sektionstitel (Seclabel/H2); undefined = ohne Rubriktrenner (Hero) */
  titel?: string;
  /** MUSS beim Prerender synchron rendern (prerender.ts verbietet Suspense-Reste) — KEINE Lazy-Loader im Registry */
  Komponente: React.ComponentType;
  /** benanntes CLS-Token für async-/localStorage-Module */
  minHoeheKlasse?: string;
}

export const START_MODULE: readonly StartModul[] = [ /* Reihenfolge = §2 */ ];
```

`Startseite.tsx` schrumpft auf eine Map; Sektionstrenner (`Seclabel` als `<h2>`) und
`minHoeheKlasse` rendert der Rahmen. Ein neues Modul = eine Zeile. Ehrlich deklarieren: Für 6
statische Module ist das eine **bewusste Vorleistung** auf den FUNDAMENT-UMBAU-«Startseiten-
Modul-Rahmen», kein Selbstzweck — nicht weiter abstrahieren (keine Sichtbarkeits-/Layout-Logik
ins Registry ziehen).

## §5 · Design-Sprache

- **Typografie (nur Token-Skala):** Datums-Overline `lc-overline-soft` · H1 `text-display font-display` (Desktop) / `text-h1` (<640 px) · Subline `text-body-l text-ink-700` · Kachel-Titel `text-h3` · Kachel-Nutzen `text-body-s text-ink-700` · Zähler `text-micro num text-ink-500` · Sektionstitel `Seclabel` als `<h2>`. **Serif bleibt tabu** (F5).
- **Farbe:** ausschliesslich Bestand. Hero `bg-brass-100`; Brass sonst nur Links (`--accent-text`), Chip-Kante, Fokus (`--focus`). KEINE Status-Farben auf der Startseite. KEIN neues Farbtoken.
- **Neue Tokens (die einzigen zwei, `minHeight` in `tailwind.config.js`):** `min-h-modul-news: 12.5rem` · `min-h-modul-zeile`/`min-h-modul-zuletzt: 4.5rem`. Masse, keine Farben (hell = dunkel). **`tailwind.config.js` ist W3·14-Kollisionsdatei → §12-Koordination VOR dem Anfassen.**
- **Container:** Seite `max-w-content`; Fliesstext `max-w-reading`.
- **Abstände/Dichte:** Sektionen `--space-16`; Hero-Innenraum `p-6` (mobil) / `p-8` (Desktop); Kachel-Innenraum `p-5`, Gap `--space-4`. Mittlere Dichte — dichter als Marketing, luftiger als heute.
- **Kartenform:** Kacheln = `lc-tile`-Basis (bg-surface-raised, border-line, `rounded-xl`), ganze Fläche EIN Link; hover Border `line-strong` + Schatten sm→md (120 ms, `--ease`); focus-visible `outline: 2px solid var(--focus)`. Hover-Border trägt nie allein Bedeutung (Schatten + Cursor als Redundanz).
- **Bewegung:** nur Feedback (Hover 120 ms, Trefferpanel 160 ms); optional EIN `lc-reveal` auf den ganzen `main`; `prefers-reduced-motion` respektiert (Bestand). Keine Kachel-Stagger.
- **Dark-Mode:** vollständig über Token-Inversion; Gegenprobe-Pflichten in §8.

## §6 · Wortlaut / I2-Messaging (SSoT `seo.ts`)

**Council-Auflagen 1+2 überschreiben das Messaging der Konzepte:** kein Absolutum, kein
Status-Terminus «geprüft», «KI-frei» nie als Siegel. Verbindlicher Wortlaut (Feinschliff durch
die Bau-Session NUR innerhalb dieser Regeln; Anti-KI-Klang: keine Floskeln, max. eine
Dreierfigur pro Absatz, keine Gedankenstrich-Flut, kein «Entdecken Sie»):

> *(Overline)* Donnerstag, 3. Juli 2026
>
> **(H1 / `HERO_TITEL`)** Schweizer Recht nachschlagen, Fristen und Kosten berechnen
>
> *(Subline / `HERO_SUBLINE`)* Gesetze, Bundesgerichtsentscheide und amtliche Materialien in
> einem Werkzeug, dazu Rechner und Vorlagen — mit Norm, Link und Stand.
>
> *(Vertrauens-Fuss / `VERTRAUENS_SATZ` + `STATUS_SATZ`)* Kein Sprachmodell schätzt Ergebnisse:
> gerechnet wird nach festen Regeln, der Rechenweg ist offengelegt, Normen sind mit der
> amtlichen Sammlung verlinkt. Der Prüfstand jedes Eintrags ist ausgewiesen; noch nicht
> fachlich Abgenommenes ist als Entwurf gekennzeichnet.

- **SSoT-Architektur:** Neue Exporte in `src/lib/seo.ts`: `HERO_TITEL`, `HERO_SUBLINE`,
  `VERTRAUENS_SATZ`, `STATUS_SATZ`, `SITE_KURZFORM`; `SITE_TITEL`/`SITE_DESCRIPTION`/OG daraus
  abgeleitet. `index.html` (title/meta/og/twitter), `KatalogHinweis.tsx`, `Methodik.tsx`,
  `scripts/og-bild.ts` werden **Projektionen** (Build injiziert bzw. importiert). Neues Tor
  **`check:seo-index`** beweist Parität `seo.ts` ↔ `index.html` (in die `check`-Kette).
- **Meta-Description** (≤155 Zeichen) aus demselben Material; Kachel-Nutzensätze folgen
  denselben Regeln (Verbot «geprüfte Bausteine» → z. B. «Verträge und Eingaben aus Bausteinen
  mit Normbezug»).
- `seo.test.ts:81` («Feste Regeln statt Sprachmodell») wird **bewusst** auf den neuen Satz
  umgestellt — im PR als fachliche Änderung deklarieren (§6.3). **✅ erledigt (S1, PR #106,
  3.7.2026):** Erwartung prüft seit dieser Fassung `og-Text ... 'nach festen Regeln'`.
- Doku-Wording (ROADMAP/PROJEKTBESCHRIEB «deterministisch statt KI-geschätzt») separat
  nachziehen (kein Blocker). **✅ erledigt (5.7.2026, W2·5c-Rest):** ROADMAP/STRUKTUR-Marker
  aufgelöst, `Methodik.tsx`-Abschnittstitel «Feste Regeln statt Sprachmodell» (dort noch
  hartkodiert, keine SSoT-Anbindung) auf «Deterministisch gerechnet statt KI-geschätzt»
  umgestellt.

## §7 · Einstiegs-Navigation

- **Sidebar (I1):** `navigation.ts::NAVIGATION` umsortieren auf **Start → Gesetze →
  Rechtsprechung → Materialien → Rechner → Vorlagen** (reiner Array-Tausch ~Z. 167–176).
  Nebenwirkungen: `navigation.test.ts`, Prerender-/Sitemap-Reihenfolge — nachziehen.
- **Konsistenz:** Rubrik-Kacheln iterieren über dasselbe `NAVIGATION`-Array (ohne «Start») —
  eine Landkarte, eine Ordnung.
- **Topbar:** `HeaderSuche` trägt den «/»-Shortcut (tastatur.e2e). Zwei sichtbare
  Suchfelder auf «/» sind akzeptiert (gleicher Hook, ein Suchweg).
  > **DEKLARIERTE SPEC-ÄNDERUNG (U-SUCHE / A5, David-Entscheid 5.7.2026 — ausgeführt
  > W2·5d):** Der ursprüngliche Satz «`HeaderSuche` bleibt UNVERÄNDERT … **KEINE
  > ⌘K-Palette**» ist überholt. Die frühere ⌘K-Befehls-/Sprung-Palette ist
  > **entfallen**; ihr Norm-Sprung-Parser (`normQuery.ts`) sitzt jetzt IN der
  > `HeaderSuche` (Norm erkannt ⇒ Direkt-Sprung als oberster Treffer, Enter springt).
  > **⌘K/Ctrl-K fokussiert nun die HeaderSuche** (die «/»-Koexistenz bleibt,
  > `tastatur.e2e` grün). Details: `FAHRPLAN-GESETZES-UX.md` §10 U-SUCHE.

## §8 · A11y & Kontrast (Nachweis VOR Merge, nicht Behauptung)

- **Landmarks:** `header`/`nav`/`main`; Suche als `section[role="search"]` mit
  `input[type=search]` (exakt das a11y.e2e-Selektorpaar); betitelte Sektionen
  `<section aria-labelledby>` auf ihre `<h2>`.
- **Heading-Order:** genau ein `<h1>`, dann `<h2>` je Sektion, Kachel-Titel `<h3>` — keine Sprünge.
- **Fokus-Reihenfolge:** Skip-Link → Topbar → Sidebar → main: UniversalSuche-Input →
  Schnellrechner-Tabs (ARIA-Tabs, Pfeiltasten) → 5 Kacheln (je EIN Tabstop) → Chips →
  Zuletzt-Chips → News-Links → Fuss-Link. Hero-Fläche selbst nicht fokussierbar.
- **Kontrast-MESSUNG vor Merge (Auflage 8), hell UND dunkel, Werte im PR dokumentiert:**
  `ink-900` auf `brass-100` · `ink-700` auf `brass-100` · `brass-700`-Links auf `brass-100` ·
  Fokus-Outline gegen `brass-100` · Input-Border auf `brass-100` (≥3:1 Nicht-Text) ·
  Kachel-Paare auf `surface-raised` (Bestand, stichprobenartig). Bei Unterschreitung:
  Ausweichregeln (dunklere Tinte, Input auf `bg-surface`-Insel) — reicht das nicht, greift der
  Ein-Klassen-Fallback `bg-surface` für den Hero.

## §9 · Verbindliche Bau-Auflagen (Council, vollständig — Checkliste)

1. **Status-Wording §8-ehrlich:** kein «jede Angabe …»-Absolutum; «geprüfte Bausteine» VERBOTEN
   (reservierter Status-Terminus); Status-Satz im Vertrauens-Fuss (§6); «Ohne KI» nur gescopt,
   nie als Siegel.
2. **Wording-Fixes:** H1 gemäss §6; Verzahnungs-Slogan ersatzlos; Zähler nur mit Scope, nur
   Volltext zählen, dünne Bestände ohne Zähler; Anti-KI-Klang-Regeln (§6).
3. **`sichtbar()` existiert nicht** im Registry (§4); Leerzustände im Modul.
4. **NewsHeader-Leerzustand-Doppelpfad fixen** (§3 #6).
5. **Zuletzt-Chips:** 1-Zeilen-Kappung + `overflow-x-auto` @390 px; Erstbesuch-Regel + CLS-
   Verifikation + Fallback-Reservierung (§3 #5); Label-Auflösung als beziffertes Arbeitspaket.
6. **`seo.test.ts:81`** als bewusste fachliche Änderung im PR deklarieren.
7. **Kollisionsprüfung VOR Baustart** (§12) — `tailwind.config.js` (W3·14), `seo.ts`/
   `prerender.ts` (SEO-A11Y), Topbar/UniversalSuche (E2-Suche); `/rechner` im §12-Inventar.
8. **Kontrast-Messung vor Merge** (§8).
9. **Bausequenz erzwungen** (§10) — Plumbing zuerst, Hero-Visualschicht ZULETZT.
10. **Pflicht-Screenshot-Serie** (Desktop 1280 / Mobil 390, hell/dunkel, je Modulzustand inkl.
    Leerzustände) + **Abnahme-Mappe** für Davids spätere Sichtung (Zeitsperre: Abnahme nicht
    drängen). Auf `scripts/screenshots.ts` aufsetzen (Playwright via Bash, NICHT MCP);
    Ausgabe-Pfad gitignored.

## §10 · Bausequenz (erzwungen; jeder Schritt eigener PR, Tore grün, golden byte-gleich)

| Schritt | Inhalt | Warum hier |
|---|---|---|
| **0 · Baseline** | Screenshot-Serie der HEUTIGEN Startseite (1280/390, hell/dunkel); Ist-Snapshot `seo.test.ts:81`, `ERWARTETE_ROUTEN`, `tailwind.config.js` notieren | First-Paint-Diff-Beweis (§11) braucht das Vorher |
| **1 · Messaging-SSoT** *(eigener gegateter PR)* | `seo.ts`-Exporte + Projektionen (`index.html`, `KatalogHinweis`, `Methodik`, `og-bild`) + Tor `check:seo-index` + `seo.test.ts`-Umstellung | grösster, richtungs-unabhängiger Brocken; I2 wirkt sofort site-weit |
| **2 · Plumbing** | `navigation.ts`-Tausch (I1) + Registry (§4) + `ZuletztVerwendet` (Tracker+Modul) + Favoriten-Streichung + Zeiterfassung → `/rechner` + Container-Bereinigung + die 2 Tokens | richtungs-unabhängig; enthält die Favoriten-Politik-Korrektur |
| **3 · Bestätigte Bugs** | NewsHeader-Leerzustand-Doppelpfad · Zuletzt-Chip-Overflow @390 | von zwei unabhängigen Kritiken gefunden = real |
| **4 · Layout & Module** | Neukomposition nach §2/§3 (Schnellrechner hoch, Kacheln, Chips, Fuss), Hero noch auf `bg-surface` | Layout beweisen, bevor die Wärme kommt |
| **5 · Hero-Visualschicht ZULETZT** | `bg-brass-100`-Wash + Kontrast-Messprotokoll + finale Screenshot-Serie + Abnahme-Mappe | kleinster, reversibelster Layer; Ein-Klassen-Fallback dokumentiert |

DoD je Schritt: `npm run gate` grün · golden byte-gleich (Startseite berührt keine Engine — jede
Golden-Abweichung ist ein Fehler) · e2e-Flächen grün (`smoke`/`a11y`/`tastatur`/
`schnellrechner-kalender` — Selektoren/DOM-Anker gemäss §3 erhalten) · `ERWARTETE_ROUTEN` = 57
unverändert · Screenshot-Nachweis mobil/dunkel (Daueranweisung Lesbarkeit) · STRUKTUR-Karte.
PR-Konvention: Trailer `Roadmap: W2·5c`; Wording-/Daten-Anteile mit `Gegenpruefung:`-Trailer
gemäss Tor (reine Darstellung → i. d. R. `n/a`, das Tor entscheidet).

## §11 · Verifikation («How to verify», Council)

1. **Kontrast-Protokoll** im PR (gemessen, nicht behauptet) — §8-Paare hell+dunkel.
2. **First-Paint-Diff:** Screenshot vorher/nachher nebeneinander — der Unterschied (Wash +
   Kachel-Landkarte + neue H1) muss OHNE Erklärung sichtbar sein. Das ist das operationalisierte
   «willkommend/schön/modern»-Kriterium und Inhalt der Abnahme-Mappe.
3. **Outside-View-Budget:** Referenzklasse «Hero-Redesign + Token + Messaging-SSoT» läuft
   1,5–3× über Selbstschätzung (hier bereits eingetreten: beide Konzept-Eigenschätzungen wurden
   von den eigenen Gegenprüfungen nach oben korrigiert). **Budget: 3–4 fokussierte Sessions,
   davon eine NUR für Schritt 1.** Läuft Schritt 1 darüber hinaus → Schnitt weiter verkleinern,
   NICHT den Hero vorziehen.
4. **CLS:** `check:perf-budget`-Schwellen auf «/» bleiben grün; Zuletzt-Einbau-Verhalten
   empirisch geprüft (§3 #5).

## §12 · Kollisionen & Koordination (§12 CLAUDE.md — VOR Baustart prüfen)

- **Kollisionsdateien dieses Schritts:** `src/pages/Startseite.tsx`, `src/components/start/**`,
  `src/lib/navigation.ts`, `src/lib/seo.ts`, `index.html`, `src/App.tsx` (nur falls nötig),
  `src/components/layout/Topbar.tsx` (möglichst NICHT anfassen), `tailwind.config.js`,
  `scripts/prerender.ts` (möglichst nicht), `src/pages/`-Rechner-Übersicht (`/rechner`,
  Zeiterfassung-Einbau), `scripts/og-bild.ts`, e2e-Specs.
- **W3·14 Split-View** teilt `tailwind.config.js`/`Topbar.tsx`/`App.tsx` → nie parallel; vor
  Baustart `gh pr list --state open` + Worktree-Sichtung.
- **SEO-A11Y-Strang** teilt `seo.ts`/`prerender.ts` → harte Sequenzierung (Datei-Eigentümer
  klären), nie parallel.
- **E2-Suche (QS-DATA-Session, 3.7.):** `universalSuche` bekommt eine Turso-Treffergruppe
  (bleibt in `src/lib/suche/**` + Treffer-Render-Komponente). `Topbar.tsx` + UniversalSuche-/
  Treffer-Komponente sind **geteilte Knoten** — vor dem Anfassen Datei-Eigentümerschaft mit dem
  E2-Strang klären bzw. dahinter serialisieren.
- **Merge-Hygiene:** vor jedem PR auf frisches `origin/main` rebasen (ROADMAP/STRUKTUR werden
  von mehreren PRs berührt); Auto-Merge + Required-Checks sind aktiv (`gh pr merge --auto
  --merge`). **Secrets nie stagen** (`daten/turso-token.txt`, `.env.local` — bewusst untracked).
- Eigener Worktree Pflicht (`worktree: ja` am ROADMAP-Schritt); Commits nur mit Pathspec.

## §13 · Offene Punkte NACH diesem Schritt (nicht Teil des Baus)

- Davids Sichtung der Abnahme-Mappe (Zeitsperre beachten — nicht drängen; Fallback-Schalter
  dokumentiert lassen).
- Kanton-Volltext im Suchindex (W2·5-Rest, unabhängig).
- ⌘K-Palette: bewusst vertagt (Trust-Abwägung, Council-Stoff bei Bedarf).
- «Zuletzt verwendet» auf weiteren Flächen (z. B. `/rechner`) — erst nach Bewährung auf «/».
