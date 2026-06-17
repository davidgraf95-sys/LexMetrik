# Gesetzessammlung — Rubrik V (Erlass-Register, Browse-Manifest, Lesesicht)

**Erstellt:** 17.6.2026, Auftrag David («neue Rubrik im UI mit Gesetzen als Nr. 5/V;
alle extrahierten Gesetze übersichtlich, in ihrer Gesamtheit zugänglich; Regeln wie
dargestellt und wie in der Bibliothek gespeichert; schnelle Navigation; Unterteilung
Bund/Kanton × Straf/öffentlich/privat»). Dokumentiert die gebaute Browse-/Lese-Schicht
über dem Norm-Snapshot-System ([norm-vorschau-snapshot-system.md](norm-vorschau-snapshot-system.md))
als Wissensablage (§11) und die verbindlichen Speicher-/Darstellungsregeln.
**Status:** ERSTRECHERCHE (gebaut, gate-grün, browser-verifiziert; ein Architektur-
Workflow + Deep-Research-Wettbewerbsvergleich) · fachliche Abnahme David offen (§7) ·
Branch `feat/rechtssammlung`, ungepusht.

**Quellen:**

| Quelle | Art | Stand/Abruf |
|---|---|---|
| Datengrundlage: Norm-Snapshots `public/normtext/{bund,kanton}/*.json` | siehe [norm-vorschau-snapshot-system.md](norm-vorschau-snapshot-system.md) (ZWEIFACH GEPRÜFT) | wie dort gepinnt |
| `src/lib/fedlex.ts` (FEDLEX-ELI + SR-Nrn., empirisch verifiziert) | amtlich (Bund), abgeleitet | Konsolidierungen wie gepinnt |
| Wettbewerbs-/Ideen-Recherche (Fedlex, lexfind.ch, zhlex, dejure.org, Swisslex, legalis, legislation.gov.uk, Akoma-Ntoso, FlexSearch) | Best-Practice-Vergleich (Deep-Research, adversarial verifiziert) | Abruf 17.6.2026 |

---

## Was es ist

Eine browsbare **Gesetzessammlung** als eigene UI-Sektion «V · Gesetze» (`/gesetze`),
die den bereits extrahierten Volltext (27 Bundesgesetze + 113 kantonale Erlasse über
26 Kantone) **in Gesamtheit** zugänglich macht — Übersicht + Volltext-Lesesicht. Sie
liefert KEINE neuen Normdaten, sondern eine Browse-/Lese-Schicht über den Snapshots.

## Drei-Schichten-Modell (Wartungs-Invariante)

> **Register ⊇ Snapshots ⊇ Browse-Manifest** — jede Diskrepanz bricht ein Tor, nie
> als stille Lücke (§5/§8).

| Schicht | Datei | Rolle | Pflege |
|---|---|---|---|
| Identität + Taxonomie | `src/lib/normtext/register.ts` | SSoT: welche Erlasse, wie eingeordnet | **handgepflegt**, eine Zeile/Erlass |
| Normtext | `public/normtext/{bund,kanton}/*.json` | Volltext je Artikel | generiert, byte-unverändert (§6) |
| Loader-Map | `public/normtext/kanton/index.json` | quelleUrl→Datei (Popover) | generiert |
| Browse-Manifest | `public/normtext/register.json` | Register × Snapshots → Browse-Liste | **generiert** (`browse-manifest.ts`), nie Hand-Edit |

## Speicher-Regeln (wie Gesetze abgelegt sind/werden)

1. **Register enthält nur Metadaten, nie Normtext** (§5/§7). Ableitbares
   (`stand`/`quelleUrl`/`artikelAnzahl`/`fassungsToken`) zieht der Generator aus den
   Snapshots — nie im Register dupliziert (sonst Drift).
2. **Ein Erlass = eine Snapshot-Datei = ein Register-Key** (= Datei-Stamm, z.B. `OR`,
   `GEBV_SCHKG`, `BE-161.12`). Mehrsprachige Kantone (FR/VS) = getrennte Dateien
   `-de`/`-fr` → getrennte Einträge, `sprache` explizit.
3. **Bund deklariert** (`ERLASS_REGISTER`, 27 Einträge: key/kuerzel/titel/sr/rechtsgebiet/
   rang/fedlexKey, §7-verifiziert). **Kanton abgeleitet**: Kürzel/Titel/SR aus dem
   Snapshot-`erlass`-Feld + Dateinamen, Rechtsgebiet aus `KANTON_GEBIET` (Default
   `oeffentlich`, Override-Tabelle; Erstklassifikation, fall-für-fall verfeinerbar).
4. **Taxonomie deklariert, nicht heuristisch** (§2): 6 Sach-Achsen — `privat`, `straf`,
   `prozess`, `schkg`, `oeffentlich`, `sozial-abgaben`. Bund-Zuordnung im Register.
5. **Provenienz** bleibt SSoT in den Snapshots (§7-Zitat-Ausnahme: Stand + Quelle +
   Live-Link + Drift-Token).

## Darstellungs-Regeln (DESIGN-REGLEMENT-treu: nüchtern/kanzleihaft)

- **Übersicht `/gesetze`:** Kopf (`SeitenKopf`, Overline «Rubrik V · Gesetze»), Tabs
  **[Bund] [Kantone]**, lokale Suche (Kürzel/Titel/SR/Kanton; leer = alles, kein Fehler
  vor Eingabe). Bund nach Rechtsgebiet gruppiert, Kanton nach 26er-Kürzelraster
  (Schnellfilter) → Erlass-Liste. `ErlassKarte`: Kürzel (`font-display`/`text-h3`),
  Titel klein, Meta «SR · N Artikel», Stand-Chip. `nur-live-link`-Erlasse: kein interner
  Reader, nur amtlicher Link (ehrlich, §8).
- **Lesesicht `/gesetze/:ebene/:key`:** Brotkrumen, Kopf (Kürzel — Volltitel, SR · N
  Artikel · Stand · ↗ geltende Fassung, Snapshot-Disclaimer), In-Gesetz-Suche
  (Artikel + Wortlaut). Reading-Spalte `max-w-[42rem]`. Artikel via geteilter
  `ArtikelBody`-Komponente (= identisch zum Popover, eine Darstellungswahrheit §10);
  je Artikel Anker `#art-{token}` + Zitat-/Permalink-Kopieren.
- **Navigation INNERHALB:** Sticky-TOC (`GesetzTOC`) mit Scrollspy (aktives Band via
  IntersectionObserver); **zuklappbare Artikel-Bänder** (`<details>`, Default offen,
  «Alle ein-/aufklappen»); Hash-Sprung öffnet Band + scrollt + Messing-Blink. Bis echte
  amtliche Gliederung in den Snapshots liegt (Backlog), sind die Bänder Nummernbereiche
  (`Art. N – Art. M`, Grösse 40).
- **Navigation ZWISCHEN:** Vor/Zurück (Manifest-Reihenfolge, gleiche Ebene),
  «Verwandt» (gleiches Rechtsgebiet, bis 3), «Zur Übersicht».
- **Querverweis-Verlinkung (D2):** Im Reader läuft der Artikel-Wortlaut durch den
  bestehenden Inline-Linker `NormText` (Normen) + `RechtsprechungText` (BGE/BGer) →
  zitierte Normen/Urteile klickbar. **Opt-in** (`ArtikelBody autolink`) — im Popover
  AUS, damit dessen Ausgabe byte-gleich bleibt (golden, §6).
- **Popover-Brücke (D1-nah):** Norm-Popover-Fuss «Im Gesetz öffnen ›» →
  `/gesetze/{ebene}/{key}#art-{token}` (Reader-Key aus der Snapshot-`id` abgeleitet).

## Routing / SSG-Skalierung

Rubrik V ist eine eigenständige **Nav-Sektion** (`SEKUNDAER_NAV` im Header), KEINE
fünfte Katalog-Oberkategorie — `oberkategorien.ts`/`routesManifest.ts`/`startseiteConfig.ts`
unberührt, die 4 Katalog-Gates bleiben grün. Nur `/gesetze` wird prerendert
(`ERWARTETE_ROUTEN` 51→52), die Lesesicht `/gesetze/:ebene/:key` ist Client-lazy
(SPA-Fallback via `vercel.json`-Rewrite). **Die Routenzahl steigt um genau 1, stabil
über alle künftigen Gesetze** — der wartungsentscheidende Punkt.

## Wartung (neues/revidiertes Gesetz)

- **Neu aufnehmen:** EINE Zeile in `ERLASS_REGISTER` (Bund) bzw. Tarif-/Quell-Zeile
  (Kanton, Adapter existiert) → `npm run normtext -- --datum=$(date +%F)` (oder nur
  `npm run normtext:register` für das Manifest aus vorhandenen Snapshots) → `npm run gate`.
- **Revidiert:** `check:normtext-netz` / `fedlex-versionen-pruefen.ts` meldet Drift →
  Pin/Konsolidierung aktualisieren → neu generieren → grün.

## Tore (`src/tests/normtext-register.test.ts`, offline, im gate)

1. Register ⊇ Bund-Snapshots (keine Waise, kein Phantom). 2. Taxonomie vollständig
(gültiges Gebiet, Titel/Kürzel gesetzt, Bund-SR Pflicht). 3. `fedlex.ts` ↔ Register
synchron (genau die FEDLEX-Schlüssel). 4. key↔Ebene↔Dateiname. 5. Manifest
deterministisch. 6. Manifest ⊇ alle Snapshots; `nur-live-link` ⇒ quelleUrl+stand.
7. Committetes `register.json` == frisch gebaut (kein Drift). Dazu Helfer-Tests
(`normtext-browse.test.ts`, `ArtikelBody.test.tsx`, `passusZiel`-Extraktion golden).

## Differenzierung (aus Wettbewerbsrecherche)

Beim Norm-Rohtext sind Fedlex/lexfind umfassend und versioniert — dort wird nicht
konkurriert. Vorsprung = **Verknüpfungsschicht** (D2 Querverweise/Rechtsprechung pro
Artikel, dejure-Niveau, für CH bisher nur kommerziell), **D1 Norm↔Werkzeug** (aus dem
Artikel zum passenden Rechner — einzigartig, Backlog) und **D3 einheitliche Bund+26-
Kantone-Lese-UX**. Bewusst NICHT im Scope: Versions-Historie/point-in-time (dorthin
verlinken, §8). Daten-Upgrade-Backlog: Fedlex-SPARQL (LOD/ELI) statt HTML-Scraping.

## AUSBAU 17./18.6.2026 — Display «Richtung A» + Struktur/Fussnoten/Stubs/D1 (ERLEDIGT)

Grosse Iteration mit David (Display live durchgearbeitet). Stand: gate-grün, e2e 4/4,
**adversarial bug-/logik-geprüft (7 Agenten) → solide** (1 echter Bug behoben). Ungepusht.

**Reader = «Richtung A»** (David gewählt; Serif fürs Lesen, Sans für UI): Source-Serif-4-
Lesespalte ~66 Z./Zeile · **amtliche Gliederung Teil/Titel/Abschnitt benannt, Fedlex-analog
auf jeder Stufe einklappbar (TOC↔Fliesstext synchron, geteilter `offen`-Zustand)** · sticky
Breadcrumb-Scrollspy · **Randtitel/Marginalien in echter rechter Marge, entdoppelt** (nur neue
Stufen je Artikel) · **amtliche Fussnoten am Artikelfuss** (Eingefügt/Aufgehoben/Fassung gemäss,
AS/BBl klickbar) · Artikelnummer ruhig links auf Grundlinie · **Absatz/lit./Ziff. = Ein-Klick-
Zitate** · Artikel- UND Absatz-Hover-Zoom · Tab-Titel «Kürzel (Kurztitel)» · **«⬇ Herunterladen»**
(ganzer Erlass als Textdatei, client-seitig) · globale Suche (Bund+Kantone, inkl. Stubs).

**Daten-Pipeline (Sidecars, Snapshots/Golden UNBERÜHRT):**
- `public/normtext/struktur/{bund,kanton}/<KEY>.json` = `{erzeugt, artikel:{token:{gliederung[],marginalie[],fussnoten?[]}}}`.
- Extraktoren: `struktur-extrahiere.ts` (Fedlex-HTML, div/article-Nesting-Walker, nur div/article auf dem Stack) · `fussnoten-extrahiere.ts` (Fedlex, Marker #fn→Def, AS=eli/oc, BBl=eli/fga) · `struktur-lexwork.ts` (LexWork xhtml_tol, FLACH `div.title.level_N` + `div.article`).
- Runner/Befehle: `npm run normtext:struktur -- --datum=…` (Bund, **offline** aus /tmp-Cache; braucht `bash scripts/fedlex-cache.sh`) · `npm run normtext:struktur-kanton -- --datum=…` (Kanton, **Netz** LexWork-API, Parallelität 6) · `npm run normtext:bund-stubs -- --datum=…` (Stubs via Fedlex-SPARQL) · danach `npm run normtext:register` (Manifest).

**Kantone — Plattform-Adapter-Design (Davids «effizient/wartungsarm»):** NICHT 26 Regeln,
sondern Adapter pro Plattform. **LexWork = EIN Adapter deckt 73/113 Erlasse** (volle Struktur).
40 Nicht-LexWork (Romandie GE/NE/JU, TI, ZH-zhlex SPA-only, SZ, lexfind-PDF) → **ehrlicher
flacher Fallback** (gleicher Reader ohne Baum, §8). LexFind 2.0 selbst kapituliert (nur PDF,
LEGES 2020) — wir machen es besser via einheitliches Ziel-Modell.

**Bund-Breite:** 27 Volltext + **30 verifizierte `nur-live-link`-Stubs** (`bund-stubs.generated.ts`,
SPARQL-Titel bestätigt SR = Sanity-Check) = 57 Bund. Volltext zuerst (rang), Stubs (rang 90) danach.

**D1 Norm↔Werkzeug-Brücke** (`werkzeuge.ts`): deklarierte Erlass→Katalog-Karten-Zuordnung,
Karte liefert Titel+href zur Laufzeit (SSoT startseiteConfig), nicht-verfügbare/unbekannte IDs
ausgeblendet (kein toter Link). Reader-Box «Passende Werkzeuge». **Einzigartig** (Rechner+Normtext
unter einem Dach).

## Offene Punkte / Backlog (nach Ausbau)

- Nicht-LexWork-Kantonsstruktur bleibt flacher Fallback (Romandie/TI/ZH/SZ — niedrige Priorität;
  keine strukturierte Quelle → kein fragiler Einzelparser).
- Kantonale Fussnoten (LexWork-Markup; Marker-Zuordnung war fehlerhaft → zurückgenommen).
- Artikel-Themen-Suche (über Marginalien) statt nur Erlass-Suche · kantonale Werkzeug-Brücke.
- B3 (kosmetisch, 0/73 ausgelöst): LexWork-Sparse-Array bei Level-Sprung — bei Bedarf Level-Stack.
- Deploy nur auf Davids frisches Ja (§9). Fahrplan: `FAHRPLAN-RECHTSSAMMLUNG.md`.
