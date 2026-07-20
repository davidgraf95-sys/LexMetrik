# FAHRPLAN-RECHTSPRECHUNG.md

> **Status: Entwurf / Strang-0-Konsolidierung.** Dieses Dokument führt fünf parallel entworfene Design-Stränge zu **einem** verbindlichen Umsetzungsplan zusammen. Die Stränge widersprachen sich an load-bearing Stellen (Statusmodell, Schema, Routenwort, CLI-Flag, sync/async-Brücke). Hier ist jede dieser Entscheidungen **einmal** getroffen — sie sind verbindlich, abweichende Formulierungen aus den Einzel-Strängen sind ungültig. Vor der ersten Codezeile gilt Abschnitt 0.

---

## 0. Strang-0: verbindliche Vor-Entscheidungen (zuerst lesen)

Die adversarialen Reviews fanden, dass die Stränge nicht ein, sondern fünf Entwürfe sind. Bevor irgendwer Code schreibt, gelten diese **kanonischen** Festlegungen. Sie lösen die Konflikte M1/M4/M12 (Review architektur), M1/M12 (recht-ehrlichkeit), M1/M2/M12 (realismus).

| Frage | Kanonische Entscheidung | Verworfene Varianten |
|---|---|---|
| Inhaltszweig | **Eigener Baum `public/rechtsprechung/`**, kein `ebene:'bge'` ins Gesetzes-Register | `ebene:'bge'`/`'rechtsprechung'` in den Gesetzes-Union quetschen |
| Typ-Ort | **`src/lib/rechtsprechung/`** (`typen.ts`, `register.ts`, `browse-typen.ts`, `systematik.ts`, `browse.ts`) | `src/lib/normtext/entscheid-typen.ts` |
| Diskriminator | **`gericht` + `kanton`** (kein `ebene` auf Entscheid-Objekten) | `BrowseEntscheid.ebene: 'bund'\|'kanton'`; `ebene:'rechtsprechung'` |
| Routenwort | **`/rechtsprechung`** + `/rechtsprechung/:key` | `/entscheide` |
| Generator-Flag | **`--nur=entscheide`** mit `--gericht=` / `--kanton=` | `--nur=bge` |
| Golden-Datei | **`golden/rechtsprechung-snapshot.json`**, Namespace-Präfix **`rsp/`** | Mischen in `golden/normtext-snapshot.json`; Präfix `bge/` |
| SHA-Funktion | **Eigene `sha256EntscheidBloecke()`** (nur `text`+`items`), **kein** Reuse der privaten `sha256Bloecke` | „1:1-Reuse von `sha256Bloecke`" |
| Statusmodell | **Zwei orthogonale Felder**: `bestand: 'snapshot' \| 'nur-live-link'` (technisch) **und** `kuratierung: 'maschinell' \| 'geprüft'` (fachlich, Default `'maschinell'`) | Einzel-Enum mit Wert `'snapshot'` (suggeriert „geprüft", §8-Bruch); Einzel-Enum mit `'entwurf'` (vermischt Text-Verlässlichkeit und Kuratierungs-Status) |
| Interne Verlinkungs-Brücke | **Build-time generiertes statisches `Set<string>`** (`erfasste-keys.generated.ts`), synchron konsultiert | „Async Manifest-Lookup" in `rechtsprechungUrl` (bricht sync-Natur) |
| Norm-Achse für Index/Werkzeuge | **Register-`key`** (`'OR'`, `'GEBV_SCHKG'`), via deklariertem Mapping aus `statutes`-Kürzel | `kuerzel` bzw. ungemapptes `statutes`-Kürzel |
| Dedupe BGer↔BGE | **P0-Pflichtmechanik im Manifest-Generator**, nicht Risiko | „später/Adapter-Logik" |
| `vergleiche()` in `browse-manifest.ts:116` | **Nicht anfassen** — eigener Baum wird von `baueBrowseManifest` nie gescannt (verifiziert: scannt nur `bund/`+`kanton/`) | „`vergleiche` für CH/bge ändern" (Phantom-Bug, Strang D) |

**Begründung der Trennung (verifiziert gegen Live-Code 2026-06-23):** `baueBrowseManifest` (`scripts/normtext/browse-manifest.ts:128-150`) scannt ausschließlich `join(basis,'bund')` und `join(basis,'kanton')`. Ein separater Baum `public/rechtsprechung/` löst weder das Orphan-Tor (`:138`) noch `vergleiche()` (`:116`) aus. `rechtsprechungUrl`/`RechtsprechungText` sind web-only (kein Golden-/PDF-Pfad). Damit bleibt die **Golden-Byte-Gleichheit aller bestehenden Gesetze strukturell gewahrt**: keine Änderung an `typen.ts`/`register.ts`/`browse-typen.ts`/bestehenden Snapshots. Das ist die schwerste Risikoklasse, sauber vermieden.

---

## 1. Ziel & Verdikt

### Ziel
Integration von **Rechtsprechung** (Bundesgericht zuerst, kantonale Gerichte gestaffelt) als eigenständige, browsbare Inhaltsrubrik in LexMetrik — verzahnt mit dem bestehenden Gesetzes-Volltext und den Rechnern/Vorlagen.

### Zwei übergeordnete Produktziele (binden jeden Abschnitt)
1. **Bessere Übersicht als entscheidsuche.ch.** entscheidsuche ist eine rohe Volltext-Suchmaschine (flache Trefferliste, Roh-PDF/HTML, keine Verzahnung, keine kuratierte Navigation). LexMetriks Mehrwert: (a) kuratierte Sachgebiets-/Themen-Navigation + Leitentscheide/Regeste-first statt flacher Liste; (b) exzellenter Reader (Regeste/Sachverhalt/Erwägungen/Dispositiv, Erwägungs-Zitat, mobil sauber); (c) **tiefe Verzahnung** Entscheid↔Norm↔Werkzeug. Abschnitt 2 + 8 lösen das ein.
2. **Kantone von Anfang an mittragen.** Nicht nur Bundesgericht. Beide Quellen liefern Bund + 26 Kantone im selben Format (OpenCaseLaw `court`+`canton`; entscheidsuche `Spider`+`canton`). Die kantonale Erweiterung ist primär Mengen-/Kuratierungs-/Taxonomie-Frage, **kein neues Datenformat**. Schema (Abschnitt 5) und Adapter (Abschnitt 6) tragen Bund UND Kanton ab Tag 1; gebaut wird gestaffelt (Abschnitt 10).

### Verdikt: technisch günstig im Datenpfad — der Aufwand liegt woanders
- **Günstig:** Der Adapter ist der **einfachste browserlose Fall im Repo** — OpenCaseLaw liefert Struktur/Regeste/Citations als JSON (kein Headless-Browser, kein PDF-OCR). CORS offen (`access-control-allow-origin: *`, verifiziert), kein Auth, Daten CC0.
- **Der echte Aufwand:**
  1. **Konsolidierung** (Abschnitt 0) — sonst bauen Generator und Reader aneinander vorbei.
  2. **Kuratierung** (Sachgebiets-Zuordnung, Leitentscheid-Auswahl) — der eigentliche Übersichts-Mehrwert, teils abnahmepflichtig.
  3. **Excerpt-Auflösung** (`/erwaegung` pro Absatz) — Request-Last, zwingt P0 klein.
  4. **Verzahnungs-Veredelung** (Norm↔Entscheid als geprüftes Präjudiz-Verhältnis) — fällt unter Davids Fachabnahme.

### Bezug zu den Daueranweisungen
- **Ausbau-Direktive (14.6.2026):** maximaler Ausbau zu imposantem/tiefem/skalierbarem Produkt + Burggraben. Rechtsprechung ist genau das — die Verzahnung ist der Burggraben.
- **Abnahme-Zeitsperre bis 1.12.2026:** David hat bis dahin keine Fachzeit. Der **gemeinfreie Urteilstext** (Art. 5 URG) braucht keine Fachabnahme — er ist per Definition korrekt (amtlicher Wortlaut) und durch das Drift-Tor gesichert. Was Abnahme braucht (Norm↔Entscheid-Präjudiz, Feinkuratierung der Sachgebiete), läuft sichtbar mit `kuratierung:'maschinell'` und blockiert den Rest nicht (Strang A/B der `FAHRPLAN-LERNPHASE-2026.md`; abnahmepflichtige Teile in Strang C / Fristen-Warteschlange).

---

## 2. Warum besser als entscheidsuche.ch

| Dimension | entscheidsuche.ch | LexMetrik (dieser Fahrplan) | Wodurch konkret |
|---|---|---|---|
| Einstieg | Suchfeld, sonst nichts | Kuratierte Landing `/rechtsprechung`: Sachgebiete + Leitentscheide ohne Sucheingabe | `SachgebietKacheln` + Leitentscheide-first (Abschnitt 7) |
| Navigation | Flache Trefferliste | Sachgebiet × Gericht/Kanton × Leitcharakter | `sachgebiet`/`thema`/`leitcharakter` im Manifest (Abschnitt 5) |
| Leitsatz | Roh, vermischt | Regeste-first als Kartentext (`<br>`/`\n` normalisiert) | `EntscheidKarte` mit Regeste (Abschnitt 7) |
| Lesesicht | Roh-PDF/HTML, keine Sprungmarken | Gegliederter Reader (Regeste/Sachverhalt/Erwägungen/Dispositiv) + sticky Sprung-Navi + erwägungsgenaues Zitat | `EntscheidLeser` (Abschnitt 7) |
| Norm-Bezug | unmöglich (reine FTS) | „Rechtsprechung zu Art. X" am Lese-Ort + Norm-Chips auf der Karte | `norm-index.json` aus `statutes[]` (Abschnitt 8) |
| Werkzeug-Bezug | keiner | „Passende Rechner/Vorlagen" zum Entscheid (transitiv über Normen) | `werkzeugeFuerEntscheid()` (Abschnitt 8) |
| Mobil | mäßig | mobil-saubere Karten/Reader (Daueranweisung Lesbarkeit) | Abschnitt 7 + e2e-Mobil-Check (Abschnitt 9) |

**Volltext-Recall (Update Preflight 23.6.2026 — R3 GELÖST):** Ursprünglich als Scope-Grenze geführt. Der Live-Preflight belegt nun: entscheidsuche `_search.php` sendet volle CORS-Header (OPTIONS→200, `access-control-allow-origin: *`, `allow-methods POST,GET,OPTIONS`, `allow-headers *`; echter POST liefert ES-JSON, `took:18ms`). Die **Live-Volltextsuche (Stufe B) ist damit im statischen Frontend baubar — ohne Backend**. LexMetrik kann also **kuratierte Übersicht + Verzahnung UND Volltext-Recall** bieten (auf letzterer Achse mit entscheidsuche gleichziehen, auf den ersten beiden überlegen). Verbleibende ehrliche Vorbehalte: Rate-Limits/„be kind to server" (Drosselung + Debounce), Attribution erbeten, ES-Query/Feld-Mapping noch zu bauen. OpenCaseLaw-FTS (30–106 s) bleibt aus dem Live-Pfad ausgeschlossen.

---

## 3. Datenquellen-Entscheid

### Primär: OpenCaseLaw REST (verifiziert live 2026-06-23)
- **Basis:** `https://mcp.opencaselaw.ch/api` (ohne `/api` → 404; `api.opencaselaw.ch` existiert nicht).
- **Auth:** keine. **CORS:** `access-control-allow-origin: *` → direkter Browser-Zugriff möglich.
- **Korpus:** 990k+ Entscheide, `bger` 191'304 (1986–2026). Alle 26 Kantone + Bundesgerichte über `court`+`canton`.
- **Relevante Routen:** `/decisions/{id}?full_text=true`, `/structure/{id}` (Bund only!), `/regeste/{id}`, `/erwaegung/{id}/{e_number}`, `/citations/{id}`, `/atom/{court}.xml`, `/courts`.
- **Lizenz:** Daten **CC0-1.0** (doppelt belegt), Code MIT. Scholarship-Teil teils CC-BY — **ziehen wir nicht**.

### Fallback/Zweitquelle: entscheidsuche.ch (verifiziert gegen offizielle API-PDF)
- **Frische-Kanal:** `GET /docs/Index/<Spider>/last` (~400 KB, schlank). **Nie** `Jobs/.../last` (>44 MB).
- **Dokument:** `<stamm>.json` + `.html` (BGer hat in Stichprobe **kein** `.pdf` → immer `.html`).
- **Such-API:** `POST /_search.php` (ES-DSL), 13 ms — aber **CORS unbestätigt** (siehe Abschnitt 11 R3).
- **Leitentscheid-Erkennung:** Spider-Präfix `CH_BGE` **+** Feld `Abstract` (NICHT über aza/atf-Strings).
- **Lizenz:** freie/kommerzielle Nutzung; Attribution + Spende **erbeten, nicht erzwungen**.

### Rolle der Quellen
- **Build-time (Snapshot):** OpenCaseLaw für Struktur/Regeste/Citations; entscheidsuche als Adapter-Fallback bei OCL-Ausfall.
- **Volltextsuche (später):** entscheidsuche-ES (falls CORS), nie OpenCaseLaw-FTS (Latenz).
- **Backfill:** HuggingFace `voilaj/swiss-caselaw` Parquet (CC0) — **seit QS-DATA der reguläre Massen-Kanal in die DB (E3, `FAHRPLAN-DATENHALTUNG.md`)**, nicht mehr nur Einmal-Pfad.

### Recht (Art. 5 URG) — verbindliche Linie (Review M11)
Die Lizenz-Begründung im Produkt stützt sich auf **Art. 5 Abs. 1 lit. a URG** (amtliche Entscheidungen gemeinfrei), **nicht** auf „OpenCaseLaw sagt CC0". CC0 ist die Aggregator-Zusage; die Rechtsquelle für den Wortlaut ist URG Art. 5. Die **amtliche Regeste** ist eine Graustufe (vom Gericht verfasst; herrschende, aber nicht zweifelsfreie Lehre wertet sie als Art.-5-Teil) → konservativ behandeln: anzeigen mit Quellennennung + amtlichem Live-Link, nicht als eigene LexMetrik-Leistung framen. Die Rechtsfrage „Attribution nötig?" gehört in die Abnahme-Warteschlange (nach 1.12.2026). **Keine De-Anonymisierung, kein Personen-Index, keine Klarnamen-FTS** (Abschnitt 9, als Invariante verankert).

---

## 4. Architektur-Andockpunkte

### Bestehende Gesetze-Komponente → Rechtsprechungs-Pendant

| Gesetze (bestehend) | Rechtsprechung (neu/wiederverwendet) | file_path:Zeile |
|---|---|---|
| `register.ts` `ERLASS_REGISTER` | `rechtsprechung/register.ts` `EntscheidRegistereintrag` (neu, separat) | `src/lib/normtext/register.ts:25` |
| `typen.ts` `NormSnapshot` | `rechtsprechung/typen.ts` `EntscheidSnapshot` (neu, schmaler Typ) | `src/lib/normtext/typen.ts:3` |
| `browse-typen.ts` `BrowseErlass` | `rechtsprechung/browse-typen.ts` `BrowseEntscheid` (neu) | `src/lib/normtext/browse-typen.ts:8` |
| `browse-manifest.ts` `baueBrowseManifest` | `rechtsprechung/entscheid-manifest.ts` `baueEntscheidManifest` (neu) | `scripts/normtext/browse-manifest.ts:128` |
| `--nur=zh`-Block | `--nur=entscheide`-Block (neu, nach Muster `--nur=kanton` wegen `istErsetzbar`-Schutz) | `scripts/normtext-snapshot.ts:693`/`:816-822` |
| `sha256Bloecke` (privat) | **eigene** `sha256EntscheidBloecke` (neu) | `scripts/normtext-snapshot.ts:140` |
| `check-drift.ts` | `check-entscheide.ts` (neu) | `scripts/normtext/check-drift.ts:99/159/264` |
| `systematik.ts` `KANTON_RUBRIKEN` | `rechtsprechung/systematik.ts` `SACHGEBIETE`/Gerichts-Hierarchie (neu) | `src/lib/normtext/systematik.ts:104` |
| `browse.ts` `ladeErlass`/`filtern` | `rechtsprechung/browse.ts` `ladeEntscheid`/`filterEntscheide` (neu, Muster geteilt) | `src/lib/normtext/browse.ts:28/79` |
| `Gesetze.tsx` | `Rechtsprechung.tsx` (neu, Gerüst kopiert) | `src/pages/Gesetze.tsx` |
| `GesetzLeser.tsx` | `EntscheidLeser.tsx` (neu, vereinfacht) | `src/pages/GesetzLeser.tsx:216` |
| `ErlassKarte.tsx` | `EntscheidKarte.tsx` (neu — NICHT `ErlassKarte` wiederverwenden) | `src/components/normtext/ErlassKarte.tsx` |
| `ArtikelBody` | `EntscheidBody.tsx` (neu, schlank) | `src/components/normtext/ArtikelBody.tsx:258` |
| `NormText` (Inline-Linker) | **1:1 wiederverwendet** | `src/components/NormText.tsx:84` |
| `SchweizKarte` | **1:1 wiederverwendet** | `src/components/SchweizKarte.tsx` |
| `werkzeugeFuer` | `werkzeugeFuerEntscheid` (additiv, baut darauf) | `src/lib/normtext/werkzeuge.ts:37` |

### Neue Dateien
- `src/lib/rechtsprechung/{typen,register,browse-typen,browse,systematik}.ts`
- `src/lib/rechtsprechung/erfasste-keys.generated.ts` (Generator-Output, statisch importierbares `Set`)
- `scripts/normtext/adapter-entscheide.ts` (OCL + esuche, ein Adapter Bund+Kanton)
- `scripts/normtext/inventar-entscheide.ts` (Atom-Feed/Index-Enumeration, Frische)
- `scripts/normtext/backfill-entscheide.ts` (Parquet-Bulk, getrennter Pfad)
- `scripts/normtext/entscheid-manifest.ts` (`baueEntscheidManifest`, inkl. Dedupe)
- `scripts/normtext/sha-entscheide.ts` (`sha256EntscheidBloecke`)
- `scripts/normtext/check-entscheide.ts` (Gates)
- `src/pages/{Rechtsprechung,EntscheidLeser}.tsx`
- `src/components/rechtsprechung/{EntscheidKarte,EntscheidZeile,EntscheidFilter,EntscheidBody,SachgebietKacheln}.tsx`
- `public/rechtsprechung/{register.json, regesten/<band>.json, bund/<gericht>/<key>.json, kanton/<KT>/<gericht>/<key>.json}`
- `public/rechtsprechung/norm-index.json`
- `golden/rechtsprechung-snapshot.json`
- `src/tests/{entscheid-register,entscheid-adapter}.test.ts`
- `tests/e2e/rechtsprechung.spec.ts`
- `.github/workflows/rechtsprechung-sync.yml`

### Geänderte Dateien (file_path:Zeile)
- `src/App.tsx:120` — Routen `/rechtsprechung` + `/rechtsprechung/:key` + lazy import.
- `src/lib/seo.ts:104` (`prerenderRouten`) — `/rechtsprechung` registrieren (+ `metaFuerPfad`/`jsonLdFuerPfad`).
- `scripts/prerender.ts:37` — `ERWARTETE_ROUTEN` von `53` auf `54` (im selben Commit, Tor sonst rot).
- `src/lib/bge.ts:42` (`rechtsprechungUrl`) — interner `/rechtsprechung/<key>`-Link via synchronem `ERFASST.has(key)`, externer Fallback.
- `scripts/normtext-snapshot.ts:693ff` — `--nur=entscheide`-Block + neue Helfer `leseListe()`/`gehoertZuFilter()` (existieren **nicht**, Review M4 → neu schreiben).
- `package.json:15/16` — `check:entscheide` in `check`, `check:entscheide-netz` in `check:netz`.
- (Nav-Definition der App-Shell) — Top-Level-Eintrag „Rechtsprechung".
- **Nicht** geändert: `browse-manifest.ts:116` (`vergleiche`), `normtext-register.test.ts`, `typen.ts`/`register.ts`/`browse-typen.ts` der Gesetze, `gate.sh` (ruft nur `check`).

---

## 5. Datenschema

Verbindliche Typen, **eine** Definition, von Generator und Reader importiert. Eigener schmaler Typ — `NormSnapshot` wird nicht überladen (Felder `artikel`/`fassungsToken`=Konsolidierung würden bei Entscheiden lügen).

```ts
// src/lib/rechtsprechung/typen.ts  (NEU — die EINE Quelle)

export type EntscheidSprache = 'de' | 'fr' | 'it' | 'rm';   // OCL language; einmal definiert (Review M10)
export type Entscheidquelle = 'opencaselaw' | 'entscheidsuche';

/** Zwei orthogonale Status-Achsen (Strang-0; löst Review M1/M12). */
export type Bestandstatus   = 'snapshot' | 'nur-live-link'; // technisch: gespiegelt vs. nur Verweis
export type Kuratierungsstatus = 'maschinell' | 'geprüft';  // fachlich; 'geprüft' NUR via abnahme-Skill

export type Leitcharakter = 'leitentscheid' | 'routine';
export type Gerichtstyp =
  | 'bundesgericht' | 'bundesverwaltungsgericht' | 'bundesstrafgericht'
  | 'bundespatentgericht' | 'kantonal';

/** Abschnitt folgt der amtlichen Gliederung (OCL /structure). */
export type Abschnittstyp = 'regeste' | 'sachverhalt' | 'erwaegung' | 'dispositiv';

/** Block formgleich zu NormSnapshot.bloecke bei text/items (Renderer-Reuse),
 *  aber 'marke' (Erwägungsziffer 'E. 3.2') statt 'absatz' (Gesetzes-Absatz). */
export interface EntscheidBlock {
  marke: string | null;   // 'E. 1', 'E. 3.2.1'; null bei Sachverhalt/Dispositiv-Fliesstext
  tiefe?: number;         // OCL erwaegungen_paragraphs[].depth → Einrückung
  text: string;
  items?: Array<{ marke: string; text: string }>;
}
export interface EntscheidAbschnitt { typ: Abschnittstyp; bloecke: EntscheidBlock[]; }

/** Regeste lizenz-getrennt vom gemeinfreien Urteilstext. */
export interface EntscheidRegeste {
  text: string;            // ⚠ roh gemischt <br>+\n → vor Anzeige normalisieren (s.u.)
  quelle: Entscheidquelle;
  /** Rechtsgrundlage: Art. 5 URG; CC0 nur Aggregator-Hinweis (Review M11). */
  attributionPflicht: boolean; // true nur, wenn Regeste ausschliesslich aus entscheidsuche
}

export interface EntscheidSnapshot {
  /** Kanonischer, dateisicherer Key. Bund: 'bund/BGer/1C_733_2025' | 'bund/BGE/145_III_72'.
   *  Kanton: 'kanton/ZH/OGer/LB230012'. Slashes → Verzeichnisebenen. */
  id: string;

  // ── Identität (selbsttragend; §7-Provenienz) ──
  gericht: string;        // OCL court: 'bger','zh_obergericht' / esuche Spider-lowercase
  kanton: string;         // OCL canton: 'CH' | 'ZH' …  (ACHTUNG: Bund = 'CH', nicht leer)
  gerichtName: string;    // OCL court_name
  gerichtstyp: Gerichtstyp;
  abteilung: string | null; // OCL chamber
  nummer: string;         // OCL docket_number '1C_733/2025' ODER Bandstelle
  bgeReferenz: string | null; // 'BGE 145 III 72'
  zitierung: string;      // OCL citation_string_de
  datum: string;          // OCL decision_date 'YYYY-MM-DD'
  sprache: EntscheidSprache;
  leitcharakter: Leitcharakter;

  // ── Inhalt ──
  regeste: EntscheidRegeste | null;       // null bei aza-Urteilen (legitim)
  abschnitte: EntscheidAbschnitt[];       // sachverhalt / erwaegung / dispositiv
  dispositivOrders: string[];             // OCL dispositiv_orders

  // ── Verzahnung ──
  zitierteNormen: string[];               // OCL statutes[] (Roh-Drittextraktion, NICHT verifiziert)
  normKeys: string[];                     // normalisiert auf Register-key, build-time (Abschnitt 8.1)
  zitierteEntscheide: string[];           // OCL cited_decisions (JSON-STRING → JSON.parse!)

  // ── Status (zwei Achsen) ──
  bestand: Bestandstatus;
  kuratierung: Kuratierungsstatus;        // Default 'maschinell' bis Abnahme

  // ── Provenienz / Drift ──
  quelle: Entscheidquelle;
  quelleUrl: string;                      // amtliche Live-URL (bger.ch)
  abgerufen: string;                      // ISO
  fassungsToken: string;                  // OCL content_hash (Verfügbarkeits-/Identitäts-Token)
  sha: string;                            // sha256EntscheidBloecke(abschnitte) — Golden-Anker
}

export interface EntscheidSnapshotDatei { erzeugt: string; eintraege: EntscheidSnapshot[]; }
```

```ts
// src/lib/rechtsprechung/register.ts + browse-typen.ts (Auszug)
import type { Rechtsgebiet } from '../normtext/register'; // Sachgebiets-Achse wiederverwenden (Verzahnung)

export interface EntscheidRegistereintrag {
  key: string;            // == id-Stamm ohne .json
  gerichtstyp: Gerichtstyp;
  gericht: string;
  kanton: string;         // 'CH' für Bund
  nummer: string;
  bgeReferenz: string | null;
  datum: string;
  leitcharakter: Leitcharakter;
  /** Kuratiertes Sachgebiet (DEKLARIERT, nie aus legal_area geraten). Register-Achse für Verzahnung. */
  sachgebiet: Rechtsgebiet;
  thema?: string;         // feinere Themen-Nav 'mietrecht/kuendigung'
  sprache: EntscheidSprache;
  rang: number;
  bestand: Bestandstatus;
  kuratierung: Kuratierungsstatus;
  quelle: Entscheidquelle;
  quelleUrl: string;
}

export interface BrowseEntscheid {            // KEIN 'ebene'-Feld (Review M4)
  key: string; gericht: string; gerichtName: string; gerichtstyp: Gerichtstyp;
  kanton: string; nummer: string; bgeReferenz: string | null; datum: string;
  zitierung: string; leitcharakter: Leitcharakter; regesteVorhanden: boolean;
  regesteKurz: string | null;                  // normalisiert, gekappt; null bei aza
  sachgebiet: Rechtsgebiet; thema: string | null; sprache: EntscheidSprache;
  normKeys: string[];                          // Register-keys → Norm-Facette
  rang: number; bestand: Bestandstatus; kuratierung: Kuratierungsstatus;
  datei: string | null; quelle: Entscheidquelle; quelleUrl: string; fassungsToken: string;
}
export interface EntscheidManifest { erzeugt: string; entscheide: BrowseEntscheid[]; }
```

**Normalisierung Regeste (Bug-Klasse, unit-getestet):**
```ts
export function normalisiereRegeste(roh: string): string {
  return roh.replace(/<br\s*\/?>/gi, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
```

**Mapping aus OpenCaseLaw (`/structure`, RECON A §2b):**
- `.regeste` → `regeste` (Lizenz-getrennt).
- `.sachverhalt_excerpt` + Vollabruf → Abschnitt `typ:'sachverhalt'`, ein Block `marke:null`.
- `.erwaegungen_paragraphs[]` → Abschnitt `typ:'erwaegung'`, je Paragraph Block `marke:'E. '+e_number`, `tiefe:depth`. **Vollabsatz via `/erwaegung/{id}/{e_number}` — Excerpts ersetzen** (sonst speichern wir gekürzten Text und lügen über Vollständigkeit).
- `.dispositiv`/`.dispositiv_orders` → `typ:'dispositiv'`.

**Golden-Neutralität:** `EntscheidBlock`/`EntscheidSnapshot` sind neue Typen; `NormSnapshot.bloecke` bleibt byte-identisch. `sha256EntscheidBloecke` ist eigenständig (hasht nur `text`+`items`) — **kein** Eingriff in die private `sha256Bloecke`, also kein Risiko für Gesetzes-SHAs (Review M1/M3/M10).

**Verhältnis zum bestehenden `VERIFIKATION`-Register (Review M5):** `src/data/verifikation.ts` bleibt die kuratierte **fachliche Aussagen-Schicht** (was ein Entscheid zu Norm X aussagt, abnahmepflichtig, alle `verifiziert:false`). `rechtsprechung/register.json` ist die **Volltext-/Browse-Schicht** (gemeinfreier Text, `kuratierung:'maschinell'`). Der Reader zeigt beide getrennt etikettiert. Die interne Verlinkung (Abschnitt 8.5) darf einen `VERIFIKATION`-Eintrag **nicht** stillschweigend durch einen Snapshot ohne Kernaussage ersetzen — wenn ein zitiertes Aktenzeichen sowohl in `VERIFIKATION` (mit `aussage`) als auch als Snapshot existiert, führt der interne Link in den Reader, aber die `aussage` aus `VERIFIKATION` bleibt sichtbar, wo sie heute steht.

---

## 6. Daten-Pipeline & Currency/Drift

### 6.1 EIN Adapter, zwei Quellen, Bund+Kanton
`scripts/normtext/adapter-entscheide.ts` — reines `fetch` + JSON-Parse, kein Browser, kein OCR. Profile sind **Quellen**, nicht Kantone (Format pro Quelle identisch über alle Gerichte).

```ts
export async function holeEntscheidOCL(decisionId: string, abgerufen: string): Promise<EntscheidSnapshot>;
export async function holeEntscheidEsuche(esucheId: string, abgerufen: string): Promise<EntscheidSnapshot>;
export async function holeEntscheid(decisionId: string, abgerufen: string): Promise<EntscheidSnapshot> {
  try { return await holeEntscheidOCL(decisionId, abgerufen); }
  catch { /* esuche-ID ableiten, Fallback; bei Doppel-Fehlschlag: bestand='nur-live-link' */ }
}
```

**OCL-Abrufkette (korrigiert um Excerpt-Falle):** 1) `/decisions/{id}?full_text=true` (Metadaten, `statutes`, `cited_decisions`, `content_hash`); 2) `/structure/{id}` (Gliederung); 3) **pro Erwägung** `/erwaegung/{id}/{e_number}?paragraph_excerpt_chars=0` (Vollabsatz); 4) `/regeste/{id}` (+ `normalisiereRegeste`).

**Feld-Fallen (Pflicht):** `cited_decisions` ist **JSON-String** → `JSON.parse` mit try/catch. `regeste` `<br>`+`\n` → normalisieren. `regeste:null` bei aza ist legitim. `marked_for_publication` teils `null` → Leitentscheid-Fallback über `id.startsWith('bge_')` / esuche `CH_BGE`+`Abstract`.

**Kanton über denselben Code:** Adapter unterscheidet Bund/Kanton nicht — `court`/`canton` fallen in die Felder. **Aber (Review M11):** `/structure` ist **Bund-only**. Für kantonale Entscheide gibt es nur `full_text` (Plaintext-Blob) oder esuche-HTML → der **gegliederte** Reader ist eine Bund-Eigenschaft. Kantonale Stufe bekommt entweder einfacheren Fliesstext-Reader (ehrlicher Marker) oder eine eigene Segmentierungs-Heuristik (expliziter Mehraufwand der Kanton-Stufe, Abschnitt 10). „Kein Nachbau" gilt für Schema/Typen, **nicht** für die Reader-Gliederung.

### 6.2 Generator-Modus `--nur=entscheide`
Eingefügt nach dem `--nur=kanton`-Block (`scripts/normtext-snapshot.ts:816ff`) — dessen `istErsetzbar()`-Schutz gegen stillen Golden-Verlust ist die richtige Vorlage, **nicht** die simplere ZH-Variante (Review M4). Neue Helfer `leseListe('--gericht=')` und `gehoertZuFilter()` schreiben (existieren nicht).

```ts
if (process.argv.includes('--nur=entscheide')) {
  const goldenIndex: Record<string,string> = {};
  const gerichtFilter = leseListe('--gericht=');   // 'BGer' → 'bger'
  const kantonFilter  = leseListe('--kanton=');
  const cov = await erzeugeEntscheidSnapshots(abgerufen, goldenIndex, { gerichtFilter, kantonFilter });
  // pro Entscheid: public/rechtsprechung/<id>.json (EntscheidSnapshotDatei)
  // sha256EntscheidBloecke() (eigen, NICHT sha256Bloecke)
  const manifest = baueEntscheidManifest(abgerufen);     // inkl. Dedupe (6.4)
  writeFileSync('public/rechtsprechung/register.json', JSON.stringify(manifest,null,2)+'\n','utf8');
  schreibeErfassteKeysGenerated(manifest);               // erfasste-keys.generated.ts (Abschnitt 8.5)
  schreibeNormIndex(manifest, goldenSnaps);              // norm-index.json (Abschnitt 8.1)
  // Golden mischen — eigener Namespace 'rsp/', mit istErsetzbar-Schutz:
  const bestand = JSON.parse(readFileSync('golden/rechtsprechung-snapshot.json','utf8'));
  const gemischt: Record<string,string> = {};
  for (const k of Object.keys(bestand)) if (!gehoertZuFilter(k, gerichtFilter, kantonFilter)) gemischt[k]=bestand[k];
  for (const k of Object.keys(goldenIndex)) gemischt[k]=goldenIndex[k];
  // sortiert nach golden/rechtsprechung-snapshot.json
  return;
}
```

### 6.3 Enumeration: Frische vs. Backfill (getrennt)
- **Frische (Cron):** `inventar-entscheide.ts` zieht Atom-Feed `GET /atom/{court}.xml` (50 neueste; `decision_id` aus `<id>` nach `/entscheid/`). Delta gegen vorhandene Dateien → nur fehlende holen. esuche-Fallback: `Index/<Spider>/last` (`new`-Keys). Filter-Requests ~1 s.
- **Backfill (Einmal, lokal, NICHT im CI):** `backfill-entscheide.ts` aus HF-Parquet (CC0). Filtert lokal Leitentscheide + Sachgebiet. **Nie OpenCaseLaw-FTS** (30–106 s).

### 6.4 Dedupe BGer↔BGE — P0-Pflichtmechanik (Review M9/M12)
Im `baueEntscheidManifest` (nicht „später"): existiert eine `bge_reference`/`bge_*`-Bandstelle, ist **der BGE-Eintrag kanonisch** (trägt Regeste); der `bger_<docket>`-Routine-Eintrag wird als **Aktenzeichen-Alias** in dessen Eintrag gemergt, nicht separat gelistet. Citation-Graph-Verweise auf den verlierenden Key werden beim Materialisieren auf den kanonischen umgeschrieben. Match über `bgeReferenz`/`nummer`. Unit-Test Pflicht.

### 6.5 Mengen-Budget — konsistent (Review M8)
`public/normtext` liegt bei 36 MB. Blindes Speichern (991k × 24 KB ≈ 24 GB) ausgeschlossen.

| Stufe | Inhalt | Speicherung | Budget |
|---|---|---|---|
| P0 | kuratierte Leitentscheide zu Rechtsgebieten mit Gesetzen/Rechnern | Volltext-Snapshot, **Einzeldateien** | Teil des Volltext-Budgets |
| P1 | restliche BGE-Leitentscheide (~21k Bandstellen) | **Regeste gebündelt** in `regesten/<band>.json`, **kein** Volltext | eigenes Index-Budget |
| P2 | jüngste N Monate aza | Metadaten+Regeste-Index, Volltext on-demand-Marker | Index-Budget |
| P3+ | kantonale Leit-/Obergerichtsentscheide | wie P1 | Index-Budget |

**Verbindlich:** P1-Regesten **nicht** als 21k Einzeldateien (Git-/Deploy-Last, Review M8), sondern gebündelt pro Band. **Zweigeteiltes Budget-Tor** in `check:entscheide`: Volltext-Budget (P0-Einzeldateien) und Index-Budget (Regesten/Manifest) je mit eigener, **empirisch kalibrierter** Schwelle (vor Umsetzung tatsächliche Größe messen, nicht „20-25 MB" raten). Überschreitung = Exit 1.

**Nachtrag QS-DATA (2.7.2026):** Das Stufen-/Budget-Modell begrenzt weiterhin die **committete Projektion** (`public/rechtsprechung/`), ist aber **nicht mehr die Obergrenze des Korpus**: die Masse (P1–P3+) lebt im DB-Artefakt und wird on-demand/per Edge geliefert (`FAHRPLAN-DATENHALTUNG.md` E2/E3). `BUDGET_MB` bleibt Tor für das Schaufenster.

**Nachtrag Budget (19.7.2026):** `BUDGET_MB` 200 → **1024 MB** (David 19.7.2026, «1 GB für Kantons-Vollimporte») — erste Nutzung: BS-Tranche des P3+-Slices (Vollimport seit 2022, ~3'765 Dokumente vom amtlichen Portal; Detail `FAHRPLAN-KANTONALE-ENTSCHEIDE.md` §8 + `bibliothek/register/BS-RECHTSPRECHUNG-QUELLE-2026-07.md`).

### 6.6 Currency/Drift-Gate (ehrlich)
Ein ergangener Entscheid ändert seinen Text nie — **kein** Konsolidierungs-Drift. `fassungsToken = content_hash` ist ein **Inhalts-/Verfügbarkeits-Fingerabdruck**, kein „Fassungsstand". Neue Prüfungen in `check-entscheide.ts`:
- **Offline:** Register⊇Snapshots (Orphan-Tor, eigener Namespace); Provenienz vollständig (`datum`/`quelleUrl`/`quelle`/`fassungsToken`); `sha`==`sha256EntscheidBloecke(abschnitte)`; Budget-Tor (6.5); Lizenz-Defensive (nie aus `/scholarship/*`).
- **Netz (`--netz`, Stichprobe, kein Vollscan):** Re-Fetch `content_hash` vs. gespeichertem `fassungsToken`. **Mismatch = Report/Warnung** (kann legitime Nachträglich-Anonymisierung sein), **kein Hard-Fail**; **Hard-Fail nur bei HTTP 404/Permalink-Bruch** (Review M16). Plus Frische-Nudge aus Atom-Feed („N neue Leitentscheide").

---

## 7. UI: Übersicht / Routing / Reader / Filter

### 7.1 Routen (`src/App.tsx:120`)
```tsx
<Route path="/rechtsprechung" element={<Rechtsprechung />} />
<Route path="/rechtsprechung/:key" element={<EntscheidLeser />} />
```
`/rechtsprechung` prerendert (in `prerenderRouten` registrieren, `ERWARTETE_ROUTEN`→54). `/rechtsprechung/:key` SPA-Fallback (Tausende Keys, nicht prerenderbar). `:key` = URL-sichere id.

### 7.2 `Rechtsprechung.tsx` — kuratierte Übersicht (keine flache Liste)
Gerüst aus `Gesetze.tsx`, Achse Sachgebiet × Gericht/Kanton × Leitcharakter:
- **A. Segment Bund / Kantone** (kopiert `Gesetze.tsx:15-37`). Beide ab Tag 1 sichtbar (Ziel 2).
- **B. `SachgebietKacheln`** — Grid mit Treffer-Count je Sachgebiet (das Kern-Differenzierungsmerkmal).
- **C. Leitentscheide-first** — `EntscheidKarte`, `leitcharakter==='leitentscheid'`, `datum desc`, Regeste als Kartentext.
- **D. `SchweizKarte`** (1:1) im Kanton-Segment → Klick filtert `kanton`.
- **E. `EntscheidFilter`** — Client-Filter über das Manifest (kein FTS): `q`, `datumVon/Bis`, `sachgebiet`, `gericht`, `kanton`, `nurLeitentscheide`, `sprache`. Logik `filterEntscheide()` (Muster `browse.ts:79`).
- **F. Trefferliste** — Karten (Leitentscheide) + kompakte `EntscheidZeile` (Routine).

### 7.3 `EntscheidKarte.tsx` (neu — nicht `ErlassKarte`)
Eigene Karte (SR/Artikelzahl wären falsch), gleiche `lc-card`-Optik: BGE-Fundstelle/Aktenzeichen prominent, `Leitentscheid`-Badge, Sprach-Badge, Regeste (`line-clamp-3`, mobil) oder Titel-Fallback, Gerichtsname, `StandChip` (aus `ErlassKarte.tsx:9-14` exportieren), **Norm-Chips** (`normKeys.slice(0,3)` — sichtbarer Verzahnungs-Vorteil). Bei `kuratierung:'maschinell'` ein dezentes „maschinell erfasst"-Badge.

### 7.4 `EntscheidLeser.tsx` — Reader mit Sprung-Navigation
Schlanker als `GesetzLeser` (kein TOC-Baum/Scroll-Spy/Marginalien). Lädt `ladeEntscheid(key)`. Layout: SeitenKopf (Nummer/Gericht/Datum/Badge) → sticky Sprung-Navi `[Regeste][Sachverhalt][Erwägungen][Dispositiv]` (mobil horizontaler Chip-Streifen) → vier Abschnitte → Fußzeile (amtlicher Live-Link „massgebliche Fassung", `abgerufen`, Art.-5-URG-Hinweis, ggf. esuche-Attribution).

**`EntscheidBody`** rendert je Abschnitt; Erwägungen je Block mit **`<NormText text={block.text} />`** — der zentrale Verzahnungs-Hebel ohne neuen Linker-Code (verlinkt Bund-Normen zu NormChip-Popover, querzitierte Entscheide via `RechtsprechungText`). **Erwägungsgenaues Zitat** (Muster `GesetzLeser.tsx:120-126`): Zitat-String `${bgeReferenz ?? nummer} E. ${marke}`, Anker `#e-${marke}`.

**Ehrliche Marker:** Bei fehlender Regeste „keine amtliche Regeste" statt leer. Bei kantonalem Fliesstext-Reader (kein `/structure`) sichtbarer Hinweis statt vorgetäuschter Gliederung.

### 7.5 Navigation
Eigene Top-Level-Rubrik **„Rechtsprechung"** (gleichrangig zu „Gesetze", nicht untergeordneter Tab) — Ziel 2 verlangt Bund+Kanton direkt sichtbar. Bund/Kanton-Segmentierung lebt innerhalb der Rubrik.

---

## 8. Verknüpfung Entscheid↔Norm↔Werkzeug & Suche (Burggraben)

Architektur-Grundsatz: alle Zuordnungen **build-time deterministisch** aus verifizierten Feldern (`statutes`, `/citations`) zu statischem JSON. Keine LLM-Zuordnung, keine Laufzeit-API im Produktpfad.

### 8.1 Norm → Entscheid: `norm-index.json`
`statutes: string[]` (z.B. `["Art. 32 Abs. 2 BGG"]`) wird build-time invertiert.

**Normalisierung (Review M2/M3 — korrigiert):** `statutes`-Eintrag → über `erkenneFedlexGesetz()` (`fedlex.ts:182`, exportiert) zu einem `FedlexGesetz`-Key, dann über eine **deklarierte, getestete Mapping-Tabelle `FedlexGesetz → Register-key`** auf den kanonischen **Register-`key`** (`'OR'`, `'GEBV_SCHKG'`). Abs./lit. werden **auf Artikel-Ebene gekappt** (sonst tote Sprungziele). Nicht auflösbar → kein Index-Eintrag (nie falsche Zuordnung). Die Annahme „`statutes`-Kürzel == Register-key" ist **falsch** für Nicht-Trivial-Kürzel — das Mapping ist Pflicht. Gate: jeder im Index verwendete Norm-Key existiert im Register.

```ts
export interface EntscheidRef {
  key: string; zitierung: string; regesteKurz: string; datum: string;
  leitcharakter: Leitcharakter; gericht: string; kanton: string;
}
export interface NormEntscheidIndex {
  erzeugt: string;
  proNorm: Record<string, EntscheidRef[]>;   // Schlüssel = `${registerKey}/${artikel}`, z.B. 'BGG/32'
}
```
Sortierung je Norm: Leitentscheide zuerst, dann `mention_count` (Citation-Graph), dann `datum desc`. Kappung Top-12 (Datei-Schlankheit); bei kantonaler Ausweitung ggf. pro Gesetz splitten + lazy.

**UI-Andock:** `rechtsprechungFuer(idx, erlass.key, art.artikel)` (NICHT `kuerzel`) in `GesetzLeser` neben `werkzeugeFuer(erlass.key)` (`:539`) → „Rechtsprechung zu Art. X"-Sektion. Leeres Resultat → keine Sektion rendern. **Status `kuratierung:'maschinell'`** sichtbar (es ist Roh-Extraktion, kein geprüftes Präjudiz — Review M4: das Wort „verifiziert" für `statutes` ist falsch).

### 8.1a Intake G-VOLLTEXT-VERZ — Index zusätzlich aus Entscheid-Volltext speisen (Zweitprüfung 17.7.2026)

> **Herkunft:** Recherche «Informations-Nutzung der Gesetze», Zweitprüfung David
> 17.7.2026 (Kanten-Analyse). **Detailquelle (§11):**
> `bibliothek/normen/informations-nutzung-gesetze-2026-07-17.md`. Eigene Bau-Einheit
> (Design + GP), **nicht** in den bestehenden `statutes`-Pfad eingefaltet.

- **Quelle + Stand:** eigener OCL-Bestand + F2-Zitat-Analyse (17.7.2026).
- **Befund (deterministisch):** der `norm-index` speist sich heute aus
  OCL-**`statutes[]`** (bereits atomisiert; **F2-Delta = 0**, exhaustiv bewiesen —
  der Produktions-Feed ist F2-konform, kein «Kanten-Regen» mehr offen). Die
  **+2931 F2-Zitat-Gewinne** liegen im **Entscheid-VOLLTEXT/Regesten**, die den
  Index **nicht** speisen.
- **Bau:** den Index (zusätzlich) aus dem Volltext speisen — **eigenes Design +
  Gegenprüfung**, Determinismus je Build.
- **Geltungsbereich + Grenze (R2):** Volltext-Treffer sind **Roh-Erwähnung**, kein
  geprüftes «einschlägig» → nur als **«auch erwähnt»-Klasse** (`kuratierung:
  'maschinell'`), **nie** als verifiziert (vgl. §11 R2). Kantonale Norm-Auflösung
  separat (§8.2).
- **Umfang:** M (eigene Einheit). **Abnahme-Status:** Zweitprüfung (17.7.2026),
  Bau-GO ausstehend.

### 8.2 Entscheid → Norm: bestehende Maschinerie
`<NormText>` im Erwägungstext + „Angewandte Normen"-Sektion aus `statutes`. **Ehrliche Grenze (Review M3):** `NormText`/`fedlexLinkFuerArtikel` löst **nur Bundesrecht** auf. Kantonale Entscheide, die kantonale Normen zitieren, werden von `NormText` **nicht** verlinkt — die „Verzahnung ohne neuen Code" trägt P0 nur für Bund-Normen. Für kantonale Norm-Auflösung braucht es einen kantonskontext-fähigen Resolver (spätere Stufe, nicht „null Code"). Bund-Norm↔Kanton-Entscheid funktioniert (kantonaler Entscheid, der Bundesnormen zitiert, erscheint korrekt unter `OR/271` neben dem BGE).

### 8.3 Entscheid → Werkzeug (transitiv, deterministisch)
```ts
export function werkzeugeFuerEntscheid(normKeys: string[]): Werkzeug[] {
  const seen = new Set<string>(); const out: Werkzeug[] = [];
  for (const k of normKeys)            // normKeys = Register-keys (8.1), NICHT statutes-Kürzel
    for (const w of werkzeugeFuer(k))  // erbt istVerfuegbar (nie toter Link)
      if (!seen.has(w.id)) { seen.add(w.id); out.push(w); }
  return out;
}
```
**Vorbehalt (Review M12):** Erlass-Granularität ist grob (ein Strafurteil, das beiläufig Art. 41 OR zitiert, zöge alle OR-Werkzeuge). Daher als **„auch relevant"-Klasse** mit `kuratierung:'maschinell'` markieren, nicht als kuratierte Empfehlung — oder erst P2 nach Abnahme.

### 8.4 Suche — 3-Stufen nach Latenz-Befund
- **Stufe A (P0/P1):** Client-Filter über das erfasste Manifest (`filterEntscheide`) + Taxonomie-Navigation. Offline, schnell, deterministisch. **Das allein schlägt entscheidsuche bei der Übersicht.**
- **Stufe B (P1, CORS BESTÄTIGT 23.6.2026):** entscheidsuche `_search.php` live aus dem Browser durchgereicht (Preflight: OPTIONS→200, `allow-origin: *`, `allow-methods POST,GET,OPTIONS`, `allow-headers: *`; POST liefert ES-JSON in ~18 ms). Im statischen Frontend baubar, **kein Backend nötig**. Auflagen: Selbstdrosselung + Eingabe-Debounce (esuche „be kind to server"), Quellennennung sichtbar, ES-Query/Feld-Mapping definieren. Bei künftigem Header-Wegfall greift der Frische-/Suche-Monitor (Stufe A bleibt als Offline-Fallback immer da).
- **Stufe C (ENTSCHIEDEN 2.7.2026 → QS-DATA):** eigene **Edge-Suche über das DB-Artefakt** (FTS5, `FAHRPLAN-DATENHALTUNG.md` E2); Stufe A bleibt Offline-Fallback, Stufe B bleibt Zweitkanal.

**Verbindlich:** OpenCaseLaw-FTS (`q=`) nie im Live-Produktpfad. Scope-Grenze (Abschnitt 2): Anspruch ist kuratierte Übersicht + Verzahnung, nicht Volltext-Recall.

### 8.5 Interne Verlinkungs-Brücke (sync, Review M2/M6 — korrigiert)
`rechtsprechungUrl`/`RechtsprechungText`/`NormText` sind **synchron + pure**. Ein async Manifest-Lookup würde jeden Inline-Link im Produkt async machen (massiver Eingriff, Render-Risiko). **Lösung:** Generator schreibt `src/lib/rechtsprechung/erfasste-keys.generated.ts`:
```ts
export const ERFASST: ReadonlySet<string> = new Set([/* alle kanonischen keys */]);
```
`rechtsprechungUrl` (`bge.ts:42`) konsultiert es synchron:
```ts
// nach Mustererkennung:
if (ERFASST.has(key)) return { url: `/rechtsprechung/${key}`, intern: true };
return /* bisheriger externer bger.ch-Link, verhaltensneutral für nicht-erfasste */;
```
Kein fetch, kein Flackern, golden-neutral für nicht-erfasste Zitate. Golden-/PDF-Pfade nutzen `RechtsprechungText` nicht (web-only) → kein Golden-Drift; trotzdem per Test absichern, dass jede bestehende nicht-erfasste Inline-Zitatstelle exakt das heutige externe Verhalten behält.

### 8.6 Kantons-Tragfähigkeit der Verzahnung (Review M15)
`norm-index.json` füllt P0 nur **Bundesnorm-Buckets** — auch mit kantonalen Entscheiden, die Bundesnormen zitieren (wertvoll, machbar). Kantonalnorm-Buckets sind spätere Stufe (abhängig vom kantonalen Norm-Resolver, 8.2). „Fundament steht" bleibt wahr, ohne einen nicht-vorhandenen Resolver vorzutäuschen.

---

## 9. Governance: Status / Recht / Tore / Wartung

### 9.1 Status & Recht in der UI
Jeder Reader zeigt sichtbar: Datum (`StandChip`), amtlicher Live-Link, Quellennennung („Daten: OpenCaseLaw" bzw. „Quelle: entscheidsuche.ch" bei `attributionPflicht`), Art.-5-URG-Gemeinfrei-Hinweis, Disclaimer „Keine Rechtsberatung, massgeblich ist die amtliche Fassung", Status-Badge. **`kuratierung:'geprüft'` nie automatisch** — nur via `abnahme`-Skill (§7). Der gemeinfreie **Text** ist verlässlich; das Badge markiert ausschließlich die **kuratierte Schicht** (Sachgebiet, Leitentscheid-Auswahl, Norm-Zuordnung).

### 9.2 Anonymisierung — als Invariante verankert (Review M9/M13)
Wir spiegeln nur die **bereits anonymisierte amtliche Fassung**, bauen **keinen Personen-Index, keine Klarnamen-FTS**. Testbare Invariante: kein Personen-/Namens-Feld im Schema; `check:entscheide` flaggt einfache Klarnamen-/Adress-Heuristiken (false-positive-tolerant, **kein** Hard-Fail → manueller Review-Trigger). Vor kantonaler Ausweitung Stichprobe Pflicht (abnahmepflichtig, da Kantone uneinheitlicher anonymisieren). Die schwammige „faktische Re-Identifikation"-Formel ist nicht prüfbar → ersetzt durch diese konkrete Invariante.

### 9.3 Tore (`package.json`)
```jsonc
"check:entscheide":      "vite-node scripts/normtext/check-entscheide.ts",
"check:entscheide-netz": "vite-node scripts/normtext/check-entscheide.ts -- --netz"
```
`check:entscheide` in `check` (offline, läuft im `gate`/CI automatisch — `gate.sh` ruft nur `check`, **kein** gate.sh-Edit). `check:entscheide-netz` in `check:netz` (wöchentlicher Monitor).

**Pflicht-Tore:** Register⊇Snapshots (eigenes Tor, `src/tests/entscheid-register.test.ts` — **nicht** `normtext-register.test.ts` aufweichen); Norm-Index-Keys ⊆ Register (8.1); zweigeteiltes Budget-Tor (6.5); Dedupe-Unit-Test (6.4); Provenienz vollständig; `sha`-Konsistenz; Lizenz-Defensive.

**Prerender-Tor (Review M6/M7):** `ERWARTETE_ROUTEN` (`scripts/prerender.ts:37`) im selben Commit von 53→54; `/rechtsprechung` in `prerenderRouten`/`metaFuerPfad`/`jsonLdFuerPfad` (`seo.ts`); `/rechtsprechung/:key` als SPA-Fallback ausschließen. Sonst bricht `build`.

### 9.4 Unit-/e2e-Tests
- `entscheid-adapter.test.ts` (Fixtures = echte API-Antworten, kein Netz): `normalisiereRegeste`; `cited_decisions` JSON-String-Parse + Garbage-Toleranz; ID-Doppel-Namespace; Leitentscheid-Erkennung beider Quellen; **Dedupe** (BGE gewinnt); `sha256EntscheidBloecke`-Regression; `regeste:null` ehrlich.
- `rechtsprechung.spec.ts` (Playwright + axe + Mobil-Viewport): `/rechtsprechung` lädt, Sachgebiets-Nav klickbar; Reader zeigt Gliederung, **kein roher `<br>`/HTML-Leak**; Badge/Live-Link/Disclaimer sichtbar; `NormText`-Popover klickbar.

### 9.5 Wartung (`.github/workflows/rechtsprechung-sync.yml`)
Eigener Workflow (nicht in `normen-monitor.yml`): täglich `npm run normtext -- --nur=entscheide --datum=$(date +%F)` (Atom-Delta) → `check:entscheide` → `check:entscheide-netz` (gedrosselt) → bei Diff **Auto-PR, kein Auto-Merge/Deploy** (§9). Drosselung ≤1–2 req/s (esuche „be kind"), hoher Timeout (≥120 s). **Erst-Backfill von P0 läuft lokal, nicht im CI** (Request-Last, Abschnitt 11 R5).

### 9.6 Deploy-Ritual (`deploy-check`-Skill)
Tore laufen automatisch (in `check` eingehängt) + e2e. Bug-Check-Agents auf das Delta, Fokus auf bekannte Bug-Klassen (HTML-Leak in Regeste, zerrissene Aktenzeichen, falsche Leitentscheid-Erkennung, Tabellen-Drop, mobile Lesbarkeit). **Adversariale Agents Pflicht** (fingen real Tabellen-Drop/Leak/bis-ter-Verlust). Playwright-Screenshot der Live-Routen via Bash (nicht MCP). STRUKTUR.md nachziehen.

---

## 10. Etappierung P0→Pn

**Bau-Reihenfolge (Review M15):** Schema → Adapter → Reader → Index → Gates/Cron. Der Burggraben (Norm-Index) hängt an `statutes`-Qualität, die abnahmepflichtig ist → läuft als `maschinell`, blockiert nichts.

### P0 — Fundament + Bund-Leitentscheide (OHNE Davids Fachzeit)
**Inhalt:** Strang-0-Entscheidungen festgeschrieben; `rechtsprechung/`-Typen; `sha256EntscheidBloecke`; Adapter (OCL + esuche-Fallback); `--nur=entscheide`; **kleine Startmenge ~50–150 kuratierte BGE-Leitentscheide** (Review M5/M13 — bewusst klein wegen Excerpt-Request-Last); Dedupe; Manifest + `register.json` + `erfasste-keys.generated.ts`; Übersicht + Reader + interner Link-`Set`; Gates (Register/Budget/sha/Provenienz/Anonymisierungs-Heuristik); Prerender-Zähler.
**DoD:** `gate` grün inkl. `check:entscheide`; e2e grün (Routen, kein HTML-Leak, Badges); P0-Entscheide im Reader mit Gliederung + `NormText`-Verzahnung; alle `kuratierung:'maschinell'`; Mengen-Budget eingehalten; Live-Screenshot mobil verifiziert.
**Ohne Fachzeit:** ja — gemeinfreier Text (Art. 5), Sachgebiet maschinell aus `legal_area`+Leitnormen vorbefüllt (`maschinell`).

### P1 — Verzahnung breit + Regeste-Index
**Inhalt:** `norm-index.json` über alle erfassten Entscheide (Bundesnorm-Buckets), „Rechtsprechung zu Art. X" im `GesetzLeser`; `werkzeugeFuerEntscheid` als „auch relevant"-Klasse; restliche BGE-Regesten gebündelt (`regesten/<band>.json`); CORS-Preflight für Stufe-B-Suche (nur wenn grün, sonst gestrichen).
**DoD:** Norm-Index-Keys ⊆ Register (Tor grün); „Rechtsprechung zu Art. X" erscheint, leer→keine Sektion; alles `maschinell` sichtbar; Budget-Index-Tor grün.
**Ohne Fachzeit:** ja, mit sichtbarem `maschinell`-Status. **Abnahmepflichtig (nach 1.12.2026, Fristen-Warteschlange):** Norm↔Entscheid als geprüftes Präjudiz; Feinkuratierung Sachgebiete/Leitentscheide.

### P2 — jüngste aza + Suche
**Inhalt:** jüngste N Monate `bger` als Metadaten+Regeste-Index (Volltext on-demand-Marker, ehrlich „live"); Stufe-B-Suche (falls CORS) oder Stufe-C-Vorbereitung.
**DoD:** Frische-Cron stabil; Suche markiert ehrlich (extern/erfasst).

### P3+ — Kantone (gestaffelt)
*(Mengen-seitig durch QS-DATA entsperrt — Grenze ist nicht mehr `public/`-Budget, sondern der 26×-Slot + Kuratierung; Senke = DB, `FAHRPLAN-DATENHALTUNG.md`.)*
**Inhalt:** je Kanton Gerichts-Codes; Schema/Adapter/Manifest tragen ohne Nachbau. **Mehraufwand explizit:** kein `/structure` für Kanton → einfacherer Fliesstext-Reader oder Segmentierungs-Heuristik; kantonaler Norm-Resolver für Kantonalnorm-Buckets; Anonymisierungs-Stichprobe vor Ausweitung (abnahmepflichtig).
**DoD:** je Kanton-Tranche eigenes grünes Tor; Reader-Grenze (Bund=gegliedert, Kanton=Fliesstext) ehrlich markiert.

---

## 11. Offene Risiken & Annahmen

- **R1 — OCL Single-Maintainer (© Jonas Hertner).** Frische-Pfad hängt primär an einem Dienst. Mitigation: esuche-Fallback im Adapter; P0-Volltexte als Snapshot gespeichert (überleben Ausfall); Laufzeit liest nur statisches `public/` (kein Laufzeit-Call — **on-demand-Volltext wird NICHT als stiller Normalpfad gebaut**, Review M8: nur als bewusst markierte „live"-Ausbaustufe mit Lade-/Fehlerzustand). Restrisiko für P2-on-demand.
- **R2 — `statutes`-Qualität ist die Achillesferse.** Empirisch belegt, Vollständigkeit/Fehlerrate **nicht verifiziert** (RECON A explizit). Ein angewandter, aber nicht gelisteter Artikel fehlt im Index. Nur `statutes` als „einschlägig" werten; Volltext-Treffer höchstens separate „auch erwähnt"-Klasse. Bis Abnahme `kuratierung:'maschinell'`, **nie** „verifiziert" (Review M4).
- **R3 — entscheidsuche `_search.php` CORS — GELÖST (Preflight 23.6.2026).** Empirisch bestätigt: OPTIONS-Preflight→200 mit `access-control-allow-origin: *`, `access-control-allow-methods: POST, GET, OPTIONS`, `access-control-allow-headers: *`; echter JSON-POST liefert ES-Treffer (`took:18ms`, >10'000 hits). docs-Index + OpenCaseLaw (`/courts`,`/atom`) ebenfalls CORS-offen. **Stufe-B-Live-Volltextsuche ist im statischen Frontend baubar, kein Backend-Architektursprung.** Restvorbehalt: Header sind nicht vertraglich garantiert (könnten wegfallen) → Stufe A (Offline-Manifest-Filter) bleibt immer als Fallback; Rate-Limits empirisch unauffällig, aber nicht zugesichert (Drosselung Pflicht).
- **R4 — `/structure` ist Bund-only.** Der gegliederte Reader ist eine Bund-Eigenschaft; Kantone brauchen Fliesstext-Reader oder Segmentierungs-Heuristik. „Kein Nachbau" gilt nur für Schema/Typen (Review M11).
- **R5 — Excerpt-Auflösung teuer.** ~15–30 `/erwaegung`-Calls/Entscheid + 4 weitere → P0(150) grob 3.000–5.000 Requests, @1 req/s mehrstündig. P0 klein halten; Erst-Backfill lokal, nicht im 6-h-CI-Cron. Parquet-`full_text` + `/structure`-Absatzgrenzen als Schnitt-Anker prüfen (deterministisch statt Heuristik) — falls P0 doch größer.
- **R6 — Sachgebiets-Kuratierung = der Übersichts-Mehrwert, teils abnahmepflichtig.** `legal_area` (`public`) ist zu grob für die 6 `Rechtsgebiet`-Achsen (kein `schkg`/`prozess`/`sozial-abgaben`). Zweistufig: (a) grober maschineller Default aus `legal_area`+Leitnormen (`maschinell`, baubar) — darauf gründet der „bessere Übersicht"-Anspruch; (b) Feinkuratierung abnahmepflichtig. Anspruch auf Stufe (a) gründen, nicht (b) versprechen.
- **R7 — Regeste-Lizenz nicht zweifelsfrei.** Amtliche Regeste als Art.-5-Teil ist herrschende, nicht unbestrittene Lehre. Bei Zweifel im Einzelfall Regeste nur als Live-Link. Rechtsfrage in Abnahme-Warteschlange. CC0 ist Aggregator-Zusage, nicht Rechtsquelle (Review M11).
- **R8 — Regeste bei jüngeren aza `null`.** Leitentscheid-Browsing trägt v.a. für `bge_*`-Bandstellen; junge Urteile ohne Leitsatz → Reader zeigt Sachverhalt/Dispositiv, ehrlich ausweisen.
- **R9 — Rate-Limits unbekannt** (beide Quellen, nur empirisch unauffällig). Selbstdrosselung ≤1–2 req/s + Atom-Delta statt Vollscan + Cache. Nicht garantiert lastfest.
- **R10 — Drift-Heuristik „geschwärzt vs. Permalink kaputt"** nicht trennscharf → Mismatch = Warnung, Hard-Fail nur bei 404 (Review M16).
- **R11 — Verhältnis `VERIFIKATION` ↔ Snapshot-Register** muss beim Bau diszipliniert eingehalten werden (Abschnitt 5): zwei getrennte Schichten, interner Link ersetzt keine fachliche `aussage` (Review M5).

**Annahmen, die Recon NICHT verifizieren konnte:** harte Rate-Limit-Schwellen; ob OCL `regeste` für aza je nachgepflegt wird; FTS-Latenz-Stabilität unter Last; CORS von `_search.php`; vollständige Anonymisierung (nur Stichprobe möglich); ob `bger` nie PDF hat (nur 3 Stichproben 404).

---

**Relevante Pfade (verifiziert 2026-06-23):** `scripts/normtext-snapshot.ts:140` (`sha256Bloecke` privat), `:693`/`:816-822` (Misch-Muster); `scripts/normtext/browse-manifest.ts:116`/`:128-150` (`vergleiche`/nur bund+kanton-Scan); `src/lib/bge.ts:42` (`rechtsprechungUrl` sync); `src/components/NormText.tsx:84` (sync, nur Bund-Normen); `src/lib/normtext/werkzeuge.ts:13/37` (keyt auf Register-key); `src/lib/fedlex.ts:182` (`erkenneFedlexGesetz` exportiert); `scripts/prerender.ts:37` (`ERWARTETE_ROUTEN=53`); `src/lib/seo.ts:104` (`prerenderRouten`); `package.json:15-16` (`check`/`check:netz`); `src/data/verifikation.ts` (bestehende Aktenzeichen-SSoT).

---

## 12. `R-RICHTER` — Richter-/Spruchkörper-Filter

*Detailquelle zum ROADMAP-Schritt «Richter-/Spruchkörper-Filter — Fundament»
(Welle 2 · Rechtsprechungs-Übersicht). Kein zweiter Einstieg — Einstieg ist die
`ROADMAP.md` (§14 Ziff. 1).*

**Auftrag (David 20.7.2026):** Die Rechtsprechung soll nach Richter:in filterbar
sein. Praxiswert: wer vor einer bestimmten Kammer auftritt, will deren bisherige
Entscheide sehen.

### 12.1 Datenmodell

| Ort | Feld | Rolle |
|---|---|---|
| Snapshot | `rubrum.besetzung: string \| null` | **SSoT**, amtlicher Freitext (unverändert, human-lesbar) |
| Manifest | `BrowseEntscheid.richter?: {s,r}[]` | Projektion: Kanon-Slug + Rolle; Client filtert danach |
| `public/rechtsprechung/richter.json` | `{[slug]: {name, count}}` | Slug → Anzeigename + Trefferzahl (lazy für Labels) |

Kurzschlüssel `s`/`r`, weil das Manifest bereits ~7,5 MB wiegt (§15); der
Anzeigename steht **einmal** je Slug, nicht bis zu 700× im Manifest.
Rollen: `vorsitz` · `mitglied` · `gerichtsschreiber`.

### 12.2 Anonymisierungs-Grenze (Invariante, verschärft §9.2)

Richter:innen/Gerichtsschreiber:innen sind amtlich **namentlich** (Art. 5 URG-frei);
Parteien/Gutachter sind **anonymisiert**. Vier Schichten: (1) nur der abgegrenzte
Rubrum-Block wird gelesen, nie Fliesstext; (2) harte `____`-Bremse im Schnitt;
(3) Guard je Segment im Parser; (4) Partei-/Vertreter-Marker verwerfen.
**«Dr. med.» ist KEIN Ausschluss** — 472 Besetzungen tragen ihn als Fachrichter.
Tor-Anforderung: Leak-Scan korpusweit **0**.

### 12.3 Tore

`check:besetzung` (in `check:seriell`, nach `check:bs-entscheide`):
- **G1 Leak (hart)** — kein Slug/Anzeigename mit Anonymisierungs-Token.
- **G2 Konsistenz (hart)** — jeder Manifest-Slug existiert im Register, Rollen gültig.
- **G3 Determinismus (hart)** — Projektion aus den Snapshots reproduziert das
  committete Manifest exakt; **plus Anti-Vakuum-Assertion** (das Tor muss ≥95 % der
  Einträge tatsächlich verglichen haben, sonst ist der Nachweis wertlos → rot).
- **G4 Abdeckung (Schwelle)** — BS ≥ 95 %, Bund ≥ 90 %; echte Zahlen, nichts fabriziert.
- **Fidelity-Stichprobe** — extrahierte Nachnamen müssen im amtlichen Freitext stehen.
- **Kollisions-Report** (WARN) — false-merge + false-split in beide Richtungen.

### 12.4 Scope-Schnitt

**Block A (Daten/Risiko, erledigt):** Schnitt, Parser/Kanon, Projektionen, Tor,
Re-Parse ohne Re-Crawl, Dossier.
**Block B (offen, reines UI):** `EntscheidFilterWerte.richter`, `filterEntscheide`-Zweig,
`richterHaeufigkeit` (cross-gefiltert, R15), Combobox statt Chip-Band (~208 Namen),
`?richter`-URL-Achse, e2e + axe + `check:perf-budget`.
**Später:** Gerichtsschreiber:in als eigene Achse (Daten liegen bereits vor),
Spruchkörper-Anzeige im Reader, Richter-Profilseite, weitere Kantone (erben das Muster).

### 12.5 Übergabe-Kontrakt A → B

```ts
// src/lib/rechtsprechung/register.ts
export type RichterRolle = 'vorsitz' | 'mitglied' | 'gerichtsschreiber';
export interface RichterRef { s: string; r: RichterRolle }
export interface BrowseEntscheid { /* … */ richter?: RichterRef[] }
export interface RichterRegister { erzeugt: string; richter: Record<string, { name: string; count: number }> }
```
`count` zählt **nur** die Mitwirkung als Richter:in — ein Slug mit `count: 0` ist
reine:r Gerichtsschreiber:in und gehört **nicht** in die Richter-Facette (§8).
Entscheide ohne erfassbare Besetzung tragen **kein** `richter`-Feld (nie ein leeres
Array) — sie sind unter «Besetzung unbekannt» ehrlich auszuweisen, nicht als Treffer.

### 12.6 Belegte Bauplan-Korrekturen

Vier Annahmen des ursprünglichen Bauplans waren am Korpus widerlegt (Hidden-Spans
kleben statt zu zerreissen · Initial-Slug verschmilzt Patrizia/Patrick Schmid ·
Absatzgrenze ist ein Trenner · sie ist es aber **nicht immer**). Messungen,
Gegenproben und Zahlen: `bibliothek/rechtsprechung/besetzung-extraktion-2026-07-20.md`.
