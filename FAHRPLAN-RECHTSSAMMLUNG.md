# Rechtssammlung — Rubrik V «Gesetze» — Implementierungs-Fahrplan

> **Für agentische Worker:** ERFORDERLICHE SUB-SKILL: `superpowers:subagent-driven-development`
> (empfohlen) oder `superpowers:executing-plans`, Task für Task. Schritte nutzen
> Checkbox-Syntax (`- [ ]`). Vor jeder Struktur-Arbeit: `CLAUDE.md` §1–§12 und
> `STRUKTUR.md` lesen. Bei mehreren Sessions: §12 (Worktree-Isolation).
> Verwandter Fahrplan (Datengrundlage): `FAHRPLAN-GESETZESTEXT-POPUP.md` (Norm-
> Snapshot-System — diese Rubrik baut darauf auf, ersetzt es nicht).

**Stand: Entwurf 17.6.2026 (Ultra-Workflow, 8 Agenten: 4 Exploration → 3
Architektur-Linsen → Synthese; alle Datei-/Zeilen-Anker empirisch verifiziert).
Ergänzt um Deep-Research-Wettbewerbsvergleich (104 Agenten, ~15 Quellen,
adversarial verifiziert) — siehe Abschnitt «Recherche: Wettbewerb & übernommene
Ideen».**

---

## Ziel (Auftrag David 17.6.2026)

Eine neue UI-Rubrik **als Nummer 5 / «V.»** mit **Gesetzen**. Alle bisher
extrahierten Gesetze werden in übersichtlicher Form abgelegt und sind dem Nutzer
**in ihrer Gesamtheit** zugänglich. Verlangt:

1. **Darstellungsregeln** — wie Gesetze dargestellt werden (Übersicht + Lesesicht).
2. **Schnelle Navigation** zwischen *und* innerhalb der Gesetze.
3. **Speicher-/Bibliotheksregeln** — wie Gesetze abgelegt sind und werden.
4. **Sinnvolle Unterteilung** — Vorschlag David: Bund / Kanton, sowie Straf /
   öffentlich / privat usw.

**Endziel:** die **gesamte Rechtssammlung der Schweiz** (sicher Bund, wenn möglich
auch Kantone), mit optimierter Funktion und schöner Darstellung, maximale
Kanzlei-Praktikabilität. Da viele Gesetze laufend **revidiert** werden, ist ein
System für **einfache Wartung** mitzudenken.

---

## Architektur-Kern: der schlaue Weg (kein Brute-Force)

Die **Datengrundlage existiert bereits** (Norm-Snapshot-System, siehe
`FAHRPLAN-GESETZESTEXT-POPUP.md`): `public/normtext/bund/*.json` (27 Bundes-
gesetze, je Artikel Volltext + Stand + Quelle + Drift-Token) und
`public/normtext/kanton/*.json` (115 kantonale Erlass-Dateien). Bisher nur über
**Popover bei Zitaten** erreichbar — es fehlt eine **browsbare Gesamtsicht**.

Diese Rubrik liefert NICHT neue Daten, sondern eine **Browse-/Lese-Schicht**
darüber. Der kritische Neubau ist genau **eine** Datei: ein **handgepflegtes
Erlass-Register** als Single Source of Truth für Identität + Taxonomie.

### Drei-Schichten-Modell (Wartungs-Invariante)

> **Register ⊇ Snapshots ⊇ Browse-Manifest** — jede Diskrepanz ist ein Tor-Bruch,
> nie eine stille Lücke (§5/§8).

| Schicht | Datei | Rolle | Pflege |
|---|---|---|---|
| **Identität + Taxonomie** (NEU) | `src/lib/normtext/register.ts` | SSoT: welche Erlasse existieren, wie eingeordnet | **handgepflegt**, eine Zeile/Erlass |
| **Normtext** (bestehend) | `public/normtext/{bund,kanton}/*.json` | Volltext je Artikel | generiert, **byte-unverändert (§6)** |
| **Loader-Map** (bestehend) | `public/normtext/kanton/index.json` | quelleUrl→Datei (Popover-Loader) | generiert, unverändert |
| **Browse-Manifest** (NEU, generiert) | `public/normtext/register.json` | Register × Snapshots → Browse-Liste | **generiert, nie Hand-Edit** |

**Kernregel (§5/§7):** Das Register enthält **nur Metadaten**, nie Normtext.
Ableitbares (`stand`, `quelleUrl`, `artikelAnzahl`, `fassungsToken`) zieht der
Generator aus den Snapshots — wird **nicht** im Register dupliziert (sonst Drift).
Ausnahme: `status:'nur-live-link'`-Erlasse haben keinen Snapshot → für die sind
`stand`/`quelleUrl` im Register Pflicht (Generator bevorzugt Snapshot, fällt aufs
Register zurück).

| Naiver Weg | Schlauer Weg (dieser Plan) |
|---|---|
| Jedes Gesetz als eigene prerenderte Route | **Eine** SSG-Route `/gesetze`; Detail Client-lazy → `ERWARTETE_ROUTEN` 51 → **52**, stabil über *alle* künftigen Gesetze |
| Taxonomie automatisch raten | **Deklariert** im Register (eine Zeile/Erlass), gegated — keine maschinell-amtliche Klassifikation für Bund + 26 Kantone |
| Render-Code für Lesesicht neu schreiben | **`ArtikelBody` aus `NormPopover` extrahieren** → eine Darstellungswahrheit (§10) |
| Drift-System neu bauen | **Bestehendes** `check:normtext-netz` (version_uid/Konsolidierung) wiederverwenden |
| Volltext ins Bundle | Lazy-Fetch der statischen JSON (§3, wie Popover heute) |

---

## Rubrik V dockt sauber an — ohne Bruch der 4 Katalog-Gates

Die vier bestehenden Oberkategorien I–IV (`src/lib/oberkategorien.ts:13,17`:
Zuständigkeiten / Fristen / Gebühren / Vorlagen) sind **Katalogfilter** — jede
muss laut `src/tests/oberkategorien.test.ts` auf Katalogkarten zeigen. «Gesetze»
hat **keine** Katalogkarten und ist daher **keine** fünfte Oberkategorie, sondern
eine **eigenständige Nav-Sektion** mit eigener Route. Das «V.» ist reine
**Anzeige-Numerierung**.

- `OberkategorieId` bleibt **fix bei 4** → `oberkategorien.test.ts` und
  `routenManifest.test.ts` bleiben **unverändert grün**.
- Eingehängt wird über `SEKUNDAER_NAV` in `src/components/layout/Header.tsx:13`
  (rendert bereits Desktop Z. 150 **und** Mobile Z. 178 — keine weitere Nav-Änderung).
- **NICHT angefasst:** `oberkategorien.ts`, `routesManifest.ts`, `startseiteConfig.ts`.

---

## Datenmodell (Typen)

**`src/lib/normtext/register.ts`** (Logik-Schicht §3 — reine Daten + Typ):

```ts
export type Rechtsgebiet =
  | 'privat' | 'straf' | 'prozess'
  | 'oeffentlich' | 'schkg' | 'sozial-abgaben';   // 6 stabile Gebiete
export type Sprache = 'de' | 'fr' | 'it';
export type ErlassStatus = 'snapshot' | 'nur-live-link';

export interface ErlassRegistereintrag {
  key: string;             // == Snapshot-Datei-Stamm ohne .json: 'OR', 'BE-161.12', 'FR-130.11-de'
  ebene: 'bund' | 'kanton';
  kanton?: string;         // nur Kanton: 'BE'
  kuerzel: string;         // 'OR', 'GebV OG'
  titel: string;           // Volltitel
  sr?: string;             // Bund: '220'; Kanton: kant. Systematiknr. '161.12'
  rechtsgebiet: Rechtsgebiet;
  sprache: Sprache;        // explizit, nicht aus URL geraten
  rang: number;            // Sortiergewicht in (ebene, rechtsgebiet); Leitgesetze niedrig
  status: ErlassStatus;
  quelleUrl?: string;      // nur Pflicht bei status:'nur-live-link'
  stand?: string;          // nur Pflicht bei status:'nur-live-link'
}
export const ERLASS_REGISTER: ReadonlyArray<ErlassRegistereintrag> = [ /* ... */ ];
```

**`src/lib/normtext/browse-typen.ts`** (Browse-Manifest-Schema):

```ts
export interface BrowseErlass {
  key: string; ebene: 'bund'|'kanton'; kanton: string|null;
  kuerzel: string; titel: string; sr: string|null;
  rechtsgebiet: Rechtsgebiet; sprache: Sprache; rang: number; status: ErlassStatus;
  // ── abgeleitet aus Snapshot (NICHT im Register, §5) ──
  datei: string|null;          // 'bund/OR.json' | null bei nur-live-link
  artikelAnzahl: number;       // eintraege.length
  stand: string;               // max(eintraege[].stand) | Register-stand bei Fallback
  quelleUrl: string;           // Basis-URL ohne #anker
  fassungsToken: string;       // erster Eintrag — Drift-Anzeige in UI
}
export interface BrowseManifest { erzeugt: string; erlasse: BrowseErlass[]; }
```

Snapshot-Schema bleibt unverändert (verifiziert an `public/normtext/bund/OR.json`:
`{erzeugt, eintraege:[{id, ebene, quelle, erlass, artikel, artikelLabel,
bloecke:[{absatz,text}], stand, quelleUrl, abgerufen, fassungsToken, sha}]}`).

---

## Dateistruktur (Überblick)

| Datei | Verantwortung | Status |
|---|---|---|
| `src/components/normtext/ArtikelBody.tsx` | Extrahierte NormPopover-Render-Bausteine (Block/Item/aufgehoben/staffel/Datum) | NEU (P0) |
| `src/lib/normtext/register.ts` | Erlass-Register (Identität + Taxonomie, SSoT) | NEU (P1) |
| `src/lib/normtext/browse-typen.ts` | Browse-Manifest-Typen | NEU (P1) |
| `scripts/normtext/browse-manifest.ts` | Generator Register × Snapshots → `register.json` | NEU (P1) |
| `public/normtext/register.json` | Browse-Manifest (generiert) | NEU (P1) |
| `src/lib/normtext/browse.ts` | Client-Loader + Gruppierung + TOC-Bau | NEU (P2/P3) |
| `src/pages/Gesetze.tsx` | Browse-Übersicht (SSG) | NEU (P2) |
| `src/components/normtext/ErlassKarte.tsx` | Erlass-Karte in der Übersicht | NEU (P2) |
| `src/pages/GesetzLeser.tsx` | Einzel-Erlass-Reader (Client-lazy) | NEU (P3) |
| `src/components/normtext/GesetzTOC.tsx` | Sticky Sidebar-TOC | NEU (P3) |
| `src/tests/normtext-register.test.ts` | Konsistenz-Tore (Register⊇Snapshots⊇Manifest) | NEU (P1) |
| `scripts/normtext-snapshot.ts` | Aufruf `baueBrowseManifest()` nach `baueManifest()` | MOD (P1) |
| `src/components/NormPopover.tsx` | konsumiert `ArtikelBody`; Fuss «Im Gesetz öffnen ›» | MOD (P0/P3) |
| `src/components/layout/Header.tsx` | `SEKUNDAER_NAV += {to:'/gesetze'}` (Z. 13) | MOD (P2) |
| `src/App.tsx` | 2 lazy-Routen vor 404-Catch | MOD (P2/P3) |
| `src/lib/seo.ts` | `STATISCHE_SEITEN['/gesetze']` | MOD (P2) |
| `scripts/prerender.ts` | `ERWARTETE_ROUTEN` 51 → 52 (Z. 37) | MOD (P2) |
| `src/lib/normtext/typen.ts` | additiv `gliederung?` (NICHT in `sha`) | MOD (P4) |
| `bibliothek/normen/norm-vorschau-snapshot-system.md` | §11/§12-Regeln ergänzen | MOD (P4) |
| **NICHT angefasst (§6 SSoT):** `public/normtext/{bund,kanton}/*.json`, `kanton/index.json`, `fedlex.ts`, `oberkategorien.ts`, `routesManifest.ts`, `startseiteConfig.ts` | | — |

---

## ⚠️ Offene Entscheide für David (vor P1 zu bestätigen)

Empfehlung jeweils zuerst; bei Zustimmung wird der Plan unverändert ausgeführt.

1. **Naming der Rubrik.** → **«Gesetze»** (Header-Label, Route `/gesetze`,
   Numeral «V.» nur Anzeige). Davids Wort, kürzeste Nutzersicht, deckt Bund+Kanton.
   Sektions-lede nennt «Gesetze und Verordnungen». Verworfen: «Rechtssammlung»
   (länger), «Erlasse» (im Header sperriger).
2. **Scope.** → **Beide**: erschlossene Erlasse mit Snapshot **plus** fehlende als
   `nur-live-link`-Stub (zeigt ehrlich die Gesamtheit, §8; Stub = eine Register-
   Zeile, kein Recherche-Druck). UI unterscheidet klar (Lesesicht vs. nur Live-Link).
3. **Prerender.** → **Hybrid**: nur `/gesetze` SSG (crawlbar), Detail Client-lazy
   via SPA-Fallback → `ERWARTETE_ROUTEN` über alle künftigen Gesetze stabil bei +1.
4. **Mehrsprachigkeit (fr/it kantonal).** → **Abbilden wie gespeichert**: getrennte
   Dateien/Register-Einträge mit explizitem `sprache`, Sprach-Badge auf der Karte.
   Kein Übersetzungs-Layer.
5. **Reihenfolge.** → **Bund zuerst** (P1/P2), Kantone als inkrementell gegateter
   Schwanz (P5). Bund = eine Quelle, ein Adapter, niedrigstes Risiko.
6. **Taxonomie-Granularität.** → **6 Gebiete** (privat / straf / prozess / oeffentlich
   / schkg / sozial-abgaben). Im Register je Erlass editierbar und gegated.

---

## TAXONOMIE — Zuordnung der 27 Bundesgesetze (verifiziert gegen `ls public/normtext/bund/`)

| Gebiet | Bundesgesetze (Dateinamen) |
|---|---|
| **privat** | `OR`, `ZGB`, `VVG`, `URG`, `VMWG`, `GBV`, `HREGV`, `GEBV_HREG` |
| **straf** | `STGB` |
| **prozess** | `ZPO`, `STPO`, `BGG`, `BGERR`, `VWVG`, `JSTPO` |
| **schkg** | `SCHKG`, `GEBV_SCHKG` |
| **oeffentlich** | `SVG`, `BBG`, `BEWG`, `DSG` |
| **sozial-abgaben** | `STG`, `MWSTG`, `KVG`, `KVV`, `EOG`, `ARG` |

Grenzfälle pragmatisch (im Register editierbar): `HREGV`/`GEBV_HREG` zu privat
(OR-Nähe); `ARG` zu sozial-abgaben (Arbeitsschutz). Kantone: `rechtsgebiet` je
Erlass handgesetzt (überwiegend `oeffentlich`/`schkg`); MVP-Gruppierung **primär
nach Kanton**, sekundär nach Gebiet.

---

## DARSTELLUNGSREGELN (verbindlich, DESIGN-REGLEMENT-RECHNER.md-treu)

Durchgängig: nüchtern/kanzleihaft, **brass als einziger Akzent**, Paper-Flächen,
**benannte Skala** (kein `text-sm`/`text-lg`), Werte im `.num`-Schnitt, **keine
Favoriten** (nur «Zuletzt verwendet» optional später), h1 nur im Seitenkopf.
Leeres Suchfeld zeigt **keinen** Fehler (erst nach Eingabe).

**Übersicht `/gesetze`:**
- Kopf: `lc-overline` «V · Gesetze» + h1 «Schweizer Gesetzessammlung» + nüchterne
  lede («Volltext der verwiesenen Bundesgesetze und kantonalen Erlasse — geltende
  Fassung, mit Live-Link»).
- Zwei Tabs: **[Bund] [Kantone]**.
- Bund: Rechtsgebiet-Gruppen als `lc-overline`-Sektionen → Erlass-Karten-Grid.
- Kantone: 26er-Kürzel-Raster (aktiver brass-hervorgehoben) → Erlass-Liste des
  Kantons; Sprach-Badge de/fr/it auf mehrsprachigen Karten.
- `ErlassKarte`: Kürzel `.num`/`text-h3`; Titel `text-body-s` ink-700; Meta «SR
  220 · 1603 Artikel» `text-xs` ink-500; Stand als `lc-chip`; `.lc-card`
  border-line, kein Schatten-Overkill.
- `status:'nur-live-link'`: `lc-notice`-Tonalität «nur Live-Link», **kein** Link in
  die Lesesicht (ehrlich, §8).
- In-Seiten-Suchfeld **lokal** (filtert nach kürzel/titel/sr/kanton), **nicht** die
  Header-Suche (bleibt Katalog-Tool).

**Einzel-Gesetz-Lesesicht `/gesetze/:ebene/:key`:**
- Brotkrumen «V · Gesetze › Bund › Privatrecht › OR».
- `GesetzKopf`: h1 «OR — Obligationenrecht», Meta «SR 220 · Stand 01.01.2026»,
  Live-Link (`quelleUrl`). Kein h1 je Artikel.
- Lesespalte `max-width: 40rem`; Artikel via **`ArtikelBody`** (identisch zum
  Popover-Body — eine Darstellungswahrheit).
- Artikel-Kopf `lc-overline` + Anker-Icon bei hover (🔗 → `location.hash` + Clipboard).
- Aufgehobene Stellen gedämpft (`istAufgehoben`), Tarif-Staffeln via `staffelZeilen`,
  Datum `formatiereDatum`. Fuss: Stand · Live-Link · Disclaimer (wie NormPopover
  Z. 291–308).

**Navigation INNERHALB:**
- Sticky TOC `top-0 h-screen overflow-y-auto`; aktiver Eintrag via
  IntersectionObserver, brass-500 + `scale-rule-sm`.
- TOC-Klick → `scrollIntoView({block:'center'})`; Ziel-Artikel kurz `bg-brass-50
  border-l-4 brass-500` (~3 s Blink, gleicher Mechanismus wie `passusRef`).
- Lange Gesetze: Bänder «Art. 1–100», «101–200» (ausklappbar, reine Darstellung).
  TOC-Hinweis «Gliederung nach Artikelnummern; amtliche Systematik siehe Quelle» (§8).
- In-Gesetz-Suche: clientseitiger Filter über `artikelLabel` + Volltext der
  `bloecke`, Trefferzahl angezeigt.

**Navigation ZWISCHEN:**
- Footer: «‹ Vorheriges / Nächstes ›» (Reihenfolge aus `register.json`, gleiche
  Ebene) + «Zur Übersicht».
- «Verwandte»: gleiches `rechtsgebiet` → bis 3 Chip-Links (NormChip-Stil).
- **Popover-Brücke:** NormPopover-Fuss neu «Im Gesetz öffnen ›» →
  `/gesetze/{ebene}/{key}#art-{artikel}`.

---

## SPEICHER-/BIBLIOTHEKS-REGELN (§7/§11/§12)

- **Snapshot-Ablage unverändert** (§7-Ausnahme): Volltext + geltende Fassung +
  `stand` + `quelleUrl` + sichtbarer Live-Link + `fassungsToken`/`sha` Drift-Anker.
  Keine Hand-Edits — nur Generator (`npm run normtext`).
- **Erlass = eine Snapshot-Datei = ein Register-Key** (Datei-Stamm). Mehrsprachige
  Kantone = getrennte Dateien `-de`/`-fr` → getrennte Register-Einträge, `sprache`
  explizit.
- **Taxonomie deklariert, nicht heuristisch** (§2): `rechtsgebiet` handgesetzt;
  Tor erzwingt, dass jeder Snapshot einen Register-Eintrag mit gesetztem
  `rechtsgebiet` hat (kein stilles «sonstiges»).
- **Provenienz** bleibt SSoT in den Snapshots; Register spiegelt nur Identität.
- **Bibliothek-Dossier** (`bibliothek/normen/norm-vorschau-snapshot-system.md`,
  P4): (a) Register-Schema + Pflegeregel (eine Zeile/Erlass), (b) Ableitungskette
  Register → Generator → Snapshots → `register.json`, (c) 6-Gebiete-Taxonomie +
  Zuordnungsregel, (d) Sortier-/Darstellungsregeln (Ebene → Gebiet → Kanton →
  rang → key), (e) Status-Konvention `snapshot`/`nur-live-link`.

---

## WARTUNGS-/SKALIERUNGS-SYSTEM (Davids Kernanforderung)

**Neues Gesetz aufnehmen:**
1. EINE Zeile in `ERLASS_REGISTER`.
2. Bund: `fedlex-cache.sh`-Pin. Kanton: Tarif-/Quell-Zeile (Adapter existiert).
3. `npm run normtext -- --datum=$(date +%F)` → Snapshot + `register.json`.
4. `npm run gate` → Tore grün.

**Revidiertes Gesetz nachführen (automatisch erkannt):**
1. `check:normtext-netz` / `fedlex-versionen-pruefen.ts` meldet Drift → Build blockiert.
2. Pin/Konsolidierung aktualisieren → `npm run normtext` → neue `sha`/`stand` → grün.

**Prerender-Skalierung:** `ERWARTETE_ROUTEN` steigt um **genau 1**, stabil über
*alle* künftigen Gesetze — neue Erlasse ändern nur das Manifest, nicht die
Routenzahl. Das ist der wartungsentscheidende Punkt.

---

# PHASEN

## P0 — Render-Extraktion `ArtikelBody` (verhaltensneutral, RISIKOÄRMSTE ERSTE ETAPPE, §6)

Ziel: die Artikel-Render-Bausteine aus `NormPopover` in eine wiederverwendbare
Komponente ziehen, damit Popover **und** künftige Lesesicht eine
Darstellungswahrheit teilen (§10). **Kein UI-sichtbarer Effekt.**

- [ ] **Task 0.1 — Golden-Anker fixieren.** Vor jeder Änderung: Render-Snapshot
      von `NormPopover` für repräsentative Fälle festhalten (mehrere Absätze; `items`
      lit./Ziff.; aufgehobener Block `istAufgehoben`; Tarif-Staffel `staffelZeilen`;
      Datum `formatiereDatum`). Test `src/tests/ArtikelBody.test.tsx` als Failing-Test.
- [ ] **Task 0.2 — Extraktion.** `src/components/normtext/ArtikelBody.tsx` erhält
      die Block-/Item-/aufgehoben-/Staffel-/Datums-Render-Logik aus `NormPopover.tsx`
      (Z. ~242–290, Helfer `istAufgehoben`:35, `staffelZeilen`:49, `formatiereDatum`:90
      mitnehmen oder als geteilten Helfer auslagern). Props: ein `bloecke`-Array +
      optional `passus` (Highlight-Absatz).
- [ ] **Task 0.3 — `NormPopover` stellt um.** Popover-Body rendert `ArtikelBody`;
      Fuss (Stand/Live-Link/Disclaimer Z. 291–308) bleibt im Popover.
- [ ] **Task 0.4 — Tor.** `npm run gate` grün **und** `npm run golden:vergleich`
      byte-gleich; Playwright-Smoke: ein Popover öffnet identisch wie zuvor (Highlight,
      Stand, Live-Link). Eigener Commit (Pathspec).

## P1 — Erlass-Register + Browse-Generator (keine UI)

- [ ] **Task 1.1 — Typen.** `src/lib/normtext/register.ts` (Typen +
      `ERLASS_REGISTER`, vorerst **27 Bund** befüllt: `key`/`kuerzel`/`titel`/`sr` aus
      `fedlex.ts`-Kommentaren, **jeder gegen Fedlex §7-verifiziert**; `rechtsgebiet`
      laut Taxonomie-Tabelle; `status:'snapshot'`). `src/lib/normtext/browse-typen.ts`.
- [ ] **Task 1.2 — Generator.** `scripts/normtext/browse-manifest.ts` →
      `baueBrowseManifest()` (Muster wie bestehendes `kanton-manifest.ts`): scannt
      `public/normtext/{bund,kanton}/*.json`, joint mit `ERLASS_REGISTER`, leitet
      `artikelAnzahl`/`stand`/`quelleUrl`/`fassungsToken` aus den Snapshots ab,
      schreibt deterministisch sortiertes `public/normtext/register.json`. Aufruf in
      `scripts/normtext-snapshot.ts` direkt nach `baueManifest()`.
- [ ] **Task 1.3 — Konsistenz-Tore** `src/tests/normtext-register.test.ts` (offline,
      im `gate`):
      1. **Register ⊇ Snapshots ⊇ Manifest** — jeder `snapshot`-Key hat Datei mit
         `eintraege.length>0`; jede Snapshot-Datei hat Register-Eintrag (keine Waise);
         `register.json`-Keys == Snapshot-Keys.
      2. **Taxonomie vollständig** — jeder Eintrag `rechtsgebiet ∈ Rechtsgebiet`,
         `titel` nicht leer, `sr` bei Bund gesetzt.
      3. **fedlex.ts ↔ Register** — jeder FEDLEX-Key hat Bund-Register-Eintrag mit
         passendem `kuerzel`.
      4. **key ↔ ebene ↔ Dateiname** — key ohne `-`-Präfix ⇒ bund; `<KT>-…` ⇒ kanton
         ∧ `kanton===<KT>`.
      5. **Determinismus** — `register.json` zweimal bauen ⇒ byte-gleich.
      6. **`nur-live-link` ⇒ `quelleUrl`+`stand` Pflicht**, keine Datei erwartet.
      7. **Golden unberührt** — Generator schreibt nur `register.json`, nie in
         `bund/`/`kanton/`; `golden:vergleich` byte-gleich.
- [ ] **Task 1.4 — Lauf + Commit.** `npm run normtext` → `register.json` erzeugt;
      Stichprobe gegen Fedlex (doppelt verifizieren). `npm run gate` grün. Commit.

## P2 — Übersicht `/gesetze` (SSG, sichtbarer Wert)

- [ ] **Task 2.1 — Client-Loader.** `src/lib/normtext/browse.ts` —
      `ladeBrowseManifest()` (Promise-Cache wie `laden.ts`), `gruppiereNachGebiet()`.
- [ ] **Task 2.2 — Komponenten.** `src/components/normtext/ErlassKarte.tsx`,
      `src/pages/Gesetze.tsx` (Tabs Bund/Kantone, Rechtsgebiet-Gruppen, 26er-Raster,
      lokales Suchfeld) — Darstellungsregeln oben, DESIGN-REGLEMENT-treu.
- [ ] **Task 2.3 — Einhängung.** `Header.tsx:13` `SEKUNDAER_NAV +=
      {to:'/gesetze', label:'Gesetze'}`; `App.tsx` lazy-Route `/gesetze` vor
      404-Catch; `seo.ts` `STATISCHE_SEITEN['/gesetze']`; `scripts/prerender.ts:37`
      `ERWARTETE_ROUTEN` 51 → 52 (im selben Commit).
- [ ] **Task 2.4 — Register-Breite Bund komplett, Kanton-Stubs.** Restliche
      kantonale Erlasse (115) ins Register (primär nach Kanton; `rechtsgebiet`
      handgesetzt). Tore grün.
- [ ] **Task 2.5 — Verifikation.** `npm run gate` + `npm run build` (52 Routen
      prerendert, `register.json` **nicht** im JS-Bundle, §3); Playwright-Smoke
      Übersicht (Tabs, Filter, 0 Console-Fehler). Deploy auf frisches Ja (§9).

## P3 — Lesesicht `/gesetze/:ebene/:key` (Client-lazy)

- [ ] **Task 3.1 — TOC-Bau** `browse.ts` `baueTOC(snapshotDatei)` (flach aus
      `eintraege[].artikelLabel`, Nummern-Bänder).
- [ ] **Task 3.2 — Reader.** `src/pages/GesetzLeser.tsx` (lädt Snapshot via
      `laden.ts`, rendert Artikel mit `ArtikelBody`) + `GesetzTOC.tsx` (Sticky,
      IntersectionObserver). Sprung/Highlight/In-Gesetz-Suche, Inter-Gesetz-Nav
      (vor/zurück/verwandte/Übersicht). `App.tsx` lazy-Route `/gesetze/:ebene/:key`
      (SPA-Fallback, **keine** Prerender-Route).
- [ ] **Task 3.3 — Popover-Brücke.** `NormPopover`-Fuss «Im Gesetz öffnen ›» →
      `/gesetze/{ebene}/{key}#art-{artikel}`; Reader liest Hash, scrollt + markiert.
      `golden:vergleich` byte-gleich (Popover-Body unverändert).
- [ ] **Task 3.5 — Verknüpfungsschicht im Reader (Differenzierung D2, deckt O5).**
      Artikel-Volltext im Reader durch die **bestehenden** Auto-Linker führen:
      `NormText` (zitierte Normen → Popover/Reader-Link) **und** `RechtsprechungText`
      (BGE/BGer → Link). Folge: jede im Gesetzestext genannte Norm/jedes Urteil wird
      klickbar — die Schicht, die Fedlex/lexfind **nicht** bieten. Screen-only, PDF/
      Golden unberührt (`golden:vergleich` byte-gleich). Kantonale «§ N» soweit über
      den Erlass-Kontext des aktuellen Gesetzes auflösbar (Register liefert Kanton).
- [ ] **Task 3.6 — Zitieren & Permalink je Artikel (dejure/Swisslex-Muster).** Pro
      Artikel: (a) **Copy-Citation** «Art. X [Abs. Y] ERLASS» (formatiert, ein Klick),
      (b) **Permalink** `…/gesetze/{ebene}/{key}#art-{token}` kopieren, (c) optional
      Sub-Artikel-Marke (Absatz/Ziff.) per Hover/Shift als Zitiervorschlag. Reine
      Darstellung; keine Engine/Logik.
- [ ] **Task 3.7 — Verifikation.** `gate` + Playwright (OR öffnen, TOC-Sprung,
      In-Gesetz-Suche, «Im Gesetz öffnen» aus Rechner-Popover, Klick auf inline-
      verlinkte Norm im Artikeltext, Copy-Citation). Deploy auf frisches Ja (§9).

## P4 — Globale Volltextsuche & Norm↔Werkzeug-Brücke (Differenzierung)

Aus der Recherche: facettierte Volltextsuche (lexfind-Niveau) + die LexMetrik-
Alleinstellung Norm↔Rechner (D1).

- [ ] **Task 4.1 — Such-Index (clientseitig).** FlexSearch (browser-only, kein
      Server) über die Register-Einträge **und** Artikel-Volltexte (`artikelLabel` +
      `bloecke`-Text). Index **lazy** aus den Snapshots/`register.json` gebaut, **nie**
      ins Haupt-Bundle (§3). Bibliotheks-Notiz zur Index-Strategie.
- [ ] **Task 4.2 — Such-UI auf `/gesetze`.** Facetten **Bund/Kanton × Rechtsgebiet**
      (Multi-Select, «Alle/Aufheben») + Volltext-Treffer mit Snippet + Sprung zum
      Artikel im Reader. Nüchtern/kanzleihaft; leeres Feld zeigt keinen Fehler.
- [ ] **Task 4.3 — Norm↔Werkzeug-Brücke (D1, einzigartig).** Im Reader-Artikel und
      auf der Erlass-Karte: «Passende Rechner/Vorlagen» aus dem Katalog ableiten
      (`startseiteConfig`-Karten, deren verifizierte `norms`/`normenReferenzen` den
      Artikel/Erlass nennen). Umkehrung des bestehenden Norm-Pills-Bezugs — eine
      Verknüpfung, die **kein** Wettbewerber hat. SSoT bleibt der Katalog (§5).
- [ ] **Task 4.4 — Verifikation.** `gate` + Playwright (Suche mit Facetten, Treffer-
      Sprung, Norm→Rechner-Link). Bundle-Disziplin prüfen (Index nicht im Haupt-
      Bundle). Deploy auf frisches Ja.

## P5 — Echte Gliederung/TOC + Doku

- [ ] **Task 5.1 — `gliederung?` additiv** in `src/lib/normtext/typen.ts`
      (`{ebene:number; label:string}[]`), **NICHT** in die `sha`-Berechnung (`sha`
      bleibt `text+items` → Golden byte-gleich).
- [ ] **Task 5.2 — Extraktion** `<part_>/<section>`-Gliederung in
      `extrahiere-fedlex.ts` für die Top-5-Gesetze (OR/ZGB/StGB/ZPO/SchKG);
      `GesetzTOC` nutzt sie statt flacher Bänder, wo vorhanden.
- [ ] **Task 5.3 — Bibliothek-Dossier** ergänzen (Regeln a–e oben + Such-Index +
      Verknüpfungsschicht), `INDEX.md`-Eintrag.

## P6 — Breitenausbau (Bund-vor-Kanton, inkrementell gegated)

- [ ] **Task 6.1 — Bund vollständig** — alle praxisrelevanten Bundesgesetze als
      Register-Einträge + Snapshots (eine Quelle, niedrigstes Risiko).
- [ ] **Task 6.2 — Kantone inkrementell** — je Kanton/Erlass eine Register-Zeile +
      Snapshot via bestehende Adapter; `nur-live-link`-Stubs für nicht erschliessbare
      PDFs (ehrlich, §8). Jede Welle eigen-gegated (Tore P1) + Deploy auf Ja.

---

## Recherche: Wettbewerb & übernommene Ideen (Deep-Research 17.6.2026)

Vor dem Bau (Auftrag David) Internet-Recherche + Konkurrenzvergleich (104 Agenten,
~15 Quellen, adversarial verifiziert). Alle Kernbefunde `high`-Konfidenz. Quellen
u. a.: fedlex.admin.ch + fedlex.data.admin.ch (SPARQL/ELI), lexfind.ch, zh.ch/zhlex,
legislation.gov.uk, dejure.org, swisslex.ch, legalis.ch, lawsearch.weblaw.ch,
Akoma-Ntoso (OASIS LegalDocML), FlexSearch.

### Konkurrenz — wer kann was

| Produkt | Stärke | Lücke, die wir nutzen |
|---|---|---|
| **Fedlex** (amtlich Bund) | Vollständig, ELI-Permalinks mit `?version=YYYYMMDD`, point-in-time, SPARQL-LOD-Backend | Nur Bund; keine Querverweis-/Rechtsprechungs-Schicht; sperrige Lese-UX; keine Kanzlei-Werkzeuge |
| **lexfind.ch** (amtl. Meta, alle 26 Kt.) | Einheitliche Bund+Kantone-Sicht, **alle Versionen seit Mai 2006**, facettierte Suche (Bund/Kanton, Kategorie, 11 Rechtsgebiete) | Reine Sammlung, keine Verknüpfung/Doktrin, kein Werkzeug-Kontext |
| **ZH-Lex / kant. Sammlungen** | Dual systematisch (LS, 14 Sachgebiete) + chronologisch (OS), Historie bis 1999/1803 | Pro Kanton isoliert, kein Cross-Linking |
| **dejure.org** (DE, gratis) | **Pro Norm Querverweise + Rechtsprechungs-Sektion**; Sub-Artikel-Zitierung per Shift-Hover («§ 32 Abs. 4 Satz 1 Nr. 3») | Deutschland; keine CH-Erlasse |
| **Swisslex / legalis / Weblaw** (kommerziell) | Norm↔Kommentar↔Urteil-Brücken, interaktives Sticky-TOC, zitierfähiges Kopieren, PDF mit Links, semantische Suche | Bezahlschranke, schwer, kein freies Browsing |
| **legislation.gov.uk** | «Timeline of Changes», Trennung *Original* (as enacted) vs. *Latest* (konsolidiert), prospektive Fassungen | UK |

### Übernommene Muster (in die Phasen eingearbeitet)

1. **Facettierte Volltextsuche, clientseitig** (FlexSearch, läuft browser-only, kein
   Server) über *alle* Erlasse mit Filtern **Bund/Kanton × Rechtsgebiet** — wie
   lexfind, aber in unserer App. → **neue Phase P4**.
2. **Querverweis-/Rechtsprechungs-Verlinkung pro Artikel** = das stärkste
   Differenzierungsmerkmal (dejure/legalis/Swisslex). Bei uns **billig**, weil die
   Bausteine existieren: `NormText` (Inline-Norm-Linker) + `RechtsprechungText`
   (BGE/BGer). Artikel-Volltext im Reader durch beide führen → jede zitierte Norm/
   jedes Urteil wird klickbar. → **P3, Task 3.5** (deckt sich mit O5).
3. **Sticky-TOC mit Scrollspy** (Swisslex) — bereits im Plan (P3, IntersectionObserver).
4. **Sub-Artikel-Zitiervorschlag + Copy-Citation + Permalink** (dejure Shift-Hover,
   Swisslex zitierfähiges Kopieren): pro Artikel «Art. X Abs. Y ERLASS» kopieren +
   Permalink `…#art-X`. → **P3, Task 3.6**.
5. **Stabile Tiefenlinks** je Artikel/Absatz (ELI-Geist): Anker `#art-{token}`,
   später `#art-{token}-abs-{n}`. → P3 (vorhanden) + P3.6.
6. **Stand/Provenienz prominent** (alle führenden Sammlungen) — bereits §7-Pflicht.

### Differenzierung gegenüber Fedlex/lexfind (ausdrücklich)

Der Rohtext ist bei den amtlichen Quellen umfassend und versioniert — **dort
konkurrieren wir nicht**. Unser Vorsprung liegt in der **Verknüpfungsschicht**, die
amtliche Portale nicht liefern, plus zwei LexMetrik-Alleinstellungen:

- **D1 — Norm ↔ Werkzeug-Brücke (einzigartig):** Aus einem Artikel direkt zum
  einschlägigen LexMetrik-Rechner/zur Vorlage springen (z. B. Art. 335c OR →
  Kündigungsfristen-Rechner). Das hat **kein** Wettbewerber, weil keiner Rechner +
  Normtext unter einem Dach führt. → P4/Task (`normenReferenzen`-Rückbezug).
- **D2 — dichte Querverweise + Rechtsprechung pro Artikel** (dejure-Niveau, für CH
  bisher nur kommerziell hinter Swisslex/legalis). → P3.5.
- **D3 — einheitliche Bund + 26 Kantone in EINER Lese-/Such-UX** mit überlegener
  Typografie/Navigation (Sticky-TOC, Sub-Artikel-Permalinks, Copy-Citation).

### Bewusst NICHT im Scope (ehrlich, §8 — Lücke benennen statt vortäuschen)

- **Versions-Historie / point-in-time / Synopse alt-neu:** Wir speichern nur die
  **geltende Fassung** (Snapshot). Fedlex/lexfind decken Historie umfassend ab → wir
  **verlinken** dorthin, statt sie nachzubauen. `future_versions` (LexWork liefert sie)
  als dezente Vorab-Warnung möglich, aber keine Timeline. Begründung: enormer
  Datenmehraufwand für ein Feature, das die amtliche Quelle gratis besser macht.
- **Semantische Suche** (Weblaw): optional, später; FlexSearch-Volltext genügt fürs MVP.

### Daten-Upgrade-Option (Backlog, ersetzt nichts Bestehendes)

**Fedlex-SPARQL-Endpoint** (fedlex.data.admin.ch, JOLux/FRBR, ELI-URIs, JSON) erlaubt
**programmatische Bulk-Extraktion** des Bundesrechts statt HTML-Scraping — sauberer
für Vollabdeckung *und* Versionsdaten. Reift den Generator (vgl. O6), aber kein MVP:
das bestehende `fedlex-cache.sh`-HTML-Verfahren funktioniert. → Recherche-Backlog,
eigenes §11-Dossier wenn angefasst.

### Offene Recherche-Fragen (vor Breitenausbau zu klären)

- Bieten kantonale Sammlungen (lexfind/clex/zhlex) maschinenlesbare Bulk-Extraktion
  (API/ELI), oder bleibt es beim bestehenden Adapter-Weg? Lizenz-/Nutzungsbedingungen?
- Welche **Norm↔Rechtsprechung-Quelle** (BGE/BGer, kant. Urteile) ist pro Artikel
  beschaffbar — für die dejure-artige Schicht (D2)? Granularität?
- Kommentar-/Doktrin-Quellen **ohne** kommerzielle Lizenz für eine Norm↔Kommentar-
  Brücke?

---

## Optimierungspotenzial am bestehenden System (Auftrag David 17.6.2026)

Die Exploration hat am heutigen Norm-Snapshot-System mehrere Schwachstellen
aufgedeckt. Diese Rubrik ist der natürliche Anlass, sie zu beheben — manche fallen
ohnehin in die Phasen, andere sind als Backlog markiert (Mehrwert ohne MVP-Risiko).

**Direkt in diesem Fahrplan gelöst (Nebennutzen über die Rubrik hinaus):**

- **O1 — Kein Bund-Meta-Index, Snapshots punkt-optimiert (befund: `bund/index.json`
  fehlt).** Heute muss jede Browse-Information je Datei einzeln geholt werden; es
  gibt keine strukturierte Erlass-Registry. → `register.json` (P1) schliesst das
  und beschleunigt auch den **bestehenden Popover-Loader** (gezielter statt rate-
  basiert). *Folgt aus P1.*
- **O2 — `fedlex.ts` trägt SR-Nummern + Titel nur als Kommentare** (nicht maschinen-
  lesbar). → Das Register hebt Bund-Identität (`sr`/`titel`/`kuerzel`) zu
  **strukturierten Daten**; Tor 3 (fedlex.ts ↔ Register) hält beide synchron und
  macht das **Zwei-SSoT-Risiko** gated statt latent. *Folgt aus P1/Tor 3.*
- **O3 — Render-Logik in `NormPopover` nicht wiederverwendbar.** → `ArtikelBody`-
  Extraktion (P0) entdoppelt die Darstellung für Popover **und** Lesesicht (§10) —
  eine Darstellungswahrheit, golden-bewiesen. *= P0.*
- **O4 — Drift-Erkennung lückenhaft / teils «manuelle Entdeckung»** (befund: heute
  nur gepinnte/zufällig zitierte Erlasse im SPARQL-Check; Revision wird teils erst
  gemeldet, wenn ein Anwender stolpert). → Das Register ist die **vollständige**
  Bund-Liste; `check-drift.ts` läuft künftig flächendeckend gegen **alle**
  Register-Bund-Erlasse statt nur die zufällig vorhandenen. *Erweiterung in P1
  (Netz-Tor) — siehe Wartungs-System.*

**Synergie-Backlog (eigener, gegateter Schritt nach MVP — hoher Hebel):**

- **O5 — Inline-Linker `NormText` erreicht kantonale Verweise nicht (~60 % der
  «§ N»-Nennungen unauflösbar, siehe `FAHRPLAN-GESETZESTEXT-POPUP.md`).** Das
  Register kennt je Kanton/Erlass den Kontext. Ein **register-gestützter kantonaler
  Resolver** könnte deutlich mehr Inline-Normen klickbar machen → direkter Mehrwert
  für *alle* Rechner/Vorlagen, nicht nur die Rubrik. *Backlog P5+.*
- **O6 — Generator-Steuerung verstreut** (`fedlex-cache.sh` + Tarif-Tabellen tragen
  ELI/Konsolidierung/lawId/pdfProfil). Mittelfristig ins Register als deklaratives
  `bezug`-Feld heben → **ein** Steuerpult für Aufnahme + Pflege («eine Zeile pro
  Gesetz» wird wörtlich wahr). Bewusst **nicht im MVP** (vergrößert P1, riskiert
  Golden); separater verhaltensneutraler Refactor nach §6. *Backlog.*
- **O7 — Abdeckungs-Lücken werden heute nicht sichtbar** (Stand 17.6.: 219/253
  Tarif-Quellen mit Volltext; 11 PDF-/Ziffer-Quellen offen). Die Browse-Übersicht
  macht Lücken **sichtbar** (`nur-live-link`-Stubs, §8) — das ist selbst ein
  Steuerungsinstrument für die Vervollständigung. Optional: ein
  `npm run normtext:abdeckung`-Report (Erlasse mit/ohne Volltext). *Teilweise P2
  (sichtbar), Report = Backlog.*
- **O8 — `KATEGORIE_NAV` vs. `SEKUNDAER_NAV` doppelt im Header** (befund Z. 693).
  Geringfügig; eine einheitliche Nav-Datenstruktur wäre sauberer, aber kein
  Korrektheits- oder Praxis-Gewinn. *Niedrige Priorität, nur falls die Nav ohnehin
  angefasst wird.*

Diese Optimierungen sind **opportunistisch** (§4-Direktive Skalierbarkeit/Tiefe):
O1–O4 kommen gratis mit der Rubrik, O5–O7 sind eigenständige Hebel mit Burggraben-
Charakter (bessere Verknüpfung + Datenabdeckung), O8 ist Kosmetik.

---

## Risiko-Register

| Risiko | Wirkung | Gegenmassnahme |
|---|---|---|
| Golden-Bruch bei `ArtikelBody`-Extraktion | NormPopover-Output ändert sich still | P0 zuerst, eigener Commit, Golden byte-gleich (§6) |
| Register driftet gegen Snapshots | tote/unklassifizierte Browse-Einträge | Tor 1 (Register⊇Snapshots⊇Manifest) hart gegated |
| Zwei Bund-SSoT (`fedlex.ts` + Register) divergieren | falsche URL/Titel | Tor 3 (fedlex.ts ↔ Register) |
| Prerender-Explosion bei Hunderten Erlassen | Build-/Git-Aufblähung | nur `/gesetze` SSG; Detail SPA-Fallback; `ERWARTETE_ROUTEN` +1 stabil |
| `OR.json` ~1,5 MB im Browser | langsamer Reader-Erstaufruf | lazy, nur auf Klick, HTTP-gecacht; Daten **nie** im JS-Bundle (§3/§7) |
| TOC ohne amtliche Systematik (MVP) | Nutzer erwartet echte Gliederung | Nummern-Bänder + ehrlicher Hinweis (§8); P4 rüstet Top-5 nach |
| `gliederung` in `sha` aufgenommen | Drift bei jedem TOC-Wechsel | `sha` bleibt `text+items`; `gliederung` separat |
| Urheberrecht Volltext | Rechtsrisiko | CH amtliche Texte gemeinfrei (URG Art. 5); §7-Ausnahme deckt Speicherung |
| Manifest >500 KB bei Tausenden | langsamer Übersichts-Load | Generator splittet deterministisch nach Ebene (`register-bund.json`/`-kanton.json`) ab Schwelle |
| FlexSearch-Index im Haupt-Bundle (P4) | Bundle-Aufblähung, §3-Bruch | Index lazy aus Snapshots gebaut, eigener Chunk; Bundle-Tor in Task 4.4 |
| Cross-Ref-Autolinker (P3.5) ändert Reader-Text | falsche/tote Links, Golden-Drift | screen-only, bestehende `NormText`/`RechtsprechungText` (erprobt); nicht-auflösbare Nennungen bleiben Text (§8); `golden:vergleich` byte-gleich |
| Versions-Historie wird erwartet, fehlt | Nutzer vermisst point-in-time | bewusster Scope-Ausschluss, ehrlich offengelegt + Live-Link zu Fedlex/lexfind (§8) |

---

## Selbst-Review (gegen den Auftrag gegengelesen)

- **«neue Rubrik als Nummer 5 / V.»** → Nav-Sektion `SEKUNDAER_NAV` + Numeral «V.»
  Anzeige; 4 Katalog-Gates unberührt. ✓
- **«alle bisher extrahierten Gesetze, in ihrer Gesamtheit»** → Register über alle
  27 Bund + 115 Kanton-Snapshots; Browse-Übersicht + Lesesicht. ✓
- **«Darstellungsregeln»** → Abschnitt DARSTELLUNGSREGELN, je UI-Element. ✓
- **«schnelle Navigation zwischen + innerhalb»** → Sticky-TOC + Sprung/Highlight +
  In-Gesetz-Suche (innerhalb); vor/zurück/verwandte/Übersicht + Popover-Brücke
  (zwischen). ✓
- **«Regeln wie in der Bibliothek gespeichert»** → SPEICHER-/BIBLIOTHEKS-REGELN +
  Dossier P4. ✓
- **«Unterteilung Bund/Kanton, Straf/öff/privat»** → Ebene × 6 Rechtsgebiete,
  konkrete Bund-Zuordnung. ✓
- **«gesamte Rechtssammlung, einfache Wartung, Revisionen»** → Register-Zeile +
  Generator + bestehendes Drift-Tor; Routenzahl skaliert nicht. ✓
- **«Internet nach Ideen durchsuchen + Konkurrenz vergleichen»** → Deep-Research-
  Abschnitt: 6 übernommene Muster (facettierte Suche, Querverweis-/Rechtsprechungs-
  Schicht, Sticky-TOC, Copy-Citation, Tiefenlinks, Stand-Provenienz) + 3
  Differenzierungen (D1 Norm↔Werkzeug einzigartig, D2 dichte Verweise/Rechtsprechung,
  D3 einheitliche Bund+Kantone-UX) + ehrliche Scope-Grenzen (keine Versions-Historie
  — dorthin verlinken). ✓
