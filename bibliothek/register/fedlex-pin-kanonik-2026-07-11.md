# Fedlex-Pin-Kanonik (P1-a/b Querschnitts-Wurzel) — 11.7.2026

**Einheit:** Fedlex-Portfolio Paket 1 · P1-a/b «Pin-Kanonik/Currency-Wurzel»
(Risikopfad). Branch `fix/fedlex-p1ab-pin-kanonik`. Trailer `Roadmap: W2·6`.

## Befund (Wurzel)

`scripts/fedlex-cache.sh` dockte bei **166 von 227** Pins an die **nicht-kanonische
Alias-URL** an: für `html-N`-Feld `0` baute das Skript `…/de/html/…-de-html.html`
(ohne `-N`-Revisions-Suffix). Diese Alias-URL ist NICHT die von Fedlex registrierte
Manifestation. Sie lieferte je Erlass:

- **content-äquivalentes HTML** (harmlos — Mehrheit), ODER
- einen **Alt-Generations-Dump** (überholte Revision derselben Konsolidierung —
  z. B. OR mit fehlenden Kommata + Fremdsprach-Leak «2 e 3» statt «2 und 3»), ODER
- eine **Soft-404-«Casemates»-Angular-Shell** (HTTP 200, kein Normtext →
  «Sidecars ohne Erlassdatum»).

Die alte 1–5-Fallback-Heuristik in `cache.sh` konnte die echten kanonischen
Revisions-N gar nicht erreichen (`kov`/`ssv`/`kkv_finma`=14, `chemrrv`=26,
`finma_gebv`=17, `mwstv`=11, …) und akzeptierte im Zweifel eine falsche Revision.

## Massnahme

1. **Kanonik-Auflösung** (`scripts/fedlex-manifest.ts`, `loeseHtmlManifeste`):
   je (eli, kons) via SPARQL `isRealizedBy(DEU) → isEmbodiedBy(userFormat=html) →
   isExemplifiedBy` die registrierte html-Datei lesen, `-N` daraus extrahieren
   (`nAusUrl`) — dieselbe Kanonik wie U-PDF (#189) / Paket 4. Deterministisch, je
   (eli, Datum) genau EINE Manifestation (COUNT-verifiziert).
2. **Re-Pin** (`scripts/fedlex-repin-kanonik.ts`): das 4. Pipe-Feld jeder
   betroffenen `cache.sh`-Zeile byte-genau auf das kanonische N gehoben — **166
   Pins**. Kein anderes Feld berührt. `bash scripts/fedlex-cache.sh` danach:
   **227 OK, 0 FEHLER** (jede kanonische URL liefert Normtext + Pflicht-Anker +
   korrekte SR).
3. **Regeneration** aus der kanonischen Fassung (`normtext -- --nur=bund
   --erlass=<104>` + `normtext:struktur` + `normtext:register`): nur wo der Diff
   AMTLICH vom alten Dump abweicht; reine Datum-Churn zurückgesetzt (Commit-
   Hygiene). **KEIN Parser/Extraktor-Eingriff** — einzige Variable = Quell-URL
   (Alias → kanonisch); jeder Text-Diff ist damit amtlich, nie Extraktions-Artefakt.
4. **Kanonik-Arbiter** (`check:fedlex-versionen` erweitert): prüft je Pin
   `gepinntes html-N == isExemplifiedBy-N` und exit 1 bei Drift. Negativ-getestet
   (mwstg 3→0 ⇒ NICHT-KANONISCH, exit 1). Dauer-Tor gegen Rückfall.
5. **cache.sh-Härtung**: explizite Casemates-Shell-Sonde (Body, nicht Status) +
   Anker-Count-Sonde (`id="art_/annex_/lvl_"` > 0).
6. **struktur-run-Härtung**: «0 übersprungen»-Pflichtkontrolle — fehlender/leerer
   Cache ist jetzt HARTER Fehler (exit 1) statt stillem `continue`; Caches werden
   vor dem Lauf via `fedlex-cache.sh` sichergestellt.

## Diff-Klassifikation (amtlich vs. extraktion) — deklariert

- **Snapshots geändert (real, ohne Datum-Churn): 104** von 227.
- **Struktur-Sidecars geändert (real): 130** (Fussnoten/Kopf/Randtitel/Gliederung
  driften auch, wenn der Snapshot-Text sha-stabil ist).
- **Artikel-Inventar-Delta:** 10 Erlasse **+Artikel** (Soft-404-Heilung: der
  Alias lieferte eine Shell/Teil-Dump; kanonisch vollständig — AIG +10, VEV +6,
  JSTG +5, …), 85 Erlasse **nur Text-/Fussnoten-Drift** (Alt-Dump-Revision), 9
  Erlasse **−`lvl_`-Struktur-Token** (z. B. UNO_PAKT_II −4 `lvl_d4e*`).
- **Kein Norm-Verlust:** die «−Artikel»-Fälle betreffen ausschliesslich
  `lvl_`-Gliederungs-Marker (Struktur), **kein `art_`-Token** verschwindet.
  Belegt durch Token-Set-Diff je Erlass; `check:struktur-konsistenz` grün
  (227 konsistent).
- **Klassifikation:** alle Diffs = **AMTLICH** (Quell-URL alias→kanonisch, kein
  Parser-Eingriff). Musterbeleg OR (Kronjuwel, html-4→html-12): alter Alias-Dump
  trug Textkorruption («Mietzinse die künftig fällig werden» ohne Kommata; «2 e 3»
  Italienisch-Leak) — kanonisch html-12 korrekt. Das ist eine geheilte
  Korruption, kein neuer Fehler.

## Gegenprüfung

Unabhängiger Zweitdurchgang (frischer Opus-Kontext, Skills gegenpruefung +
scraping-swiss-official-sources) gegen Fedlex LIVE: OR (Kronjuwel), UNO_PAKT_II
(lvl-Reduktion), GFK/LUGUE (Soft-404-Heilung), DBG (Fussnoten-Drift). Verdikt:
siehe Commit-Trailer / `bibliothek/.gegenpruefung-pending`.

## Neue/erweiterte Werkzeuge

- `scripts/fedlex-manifest.ts` — `loeseHtmlManifeste`, `nAusUrl` (kanonische
  html-Manifestation, geteilt).
- `scripts/fedlex-pins.ts` — `lesePinsVoll()` (volles 6-Feld-Format; `lesePins()`
  Signatur unverändert, SSoT bleibt cache.sh).
- `scripts/fedlex-repin-kanonik.ts` — Re-Pin-Generator (Dry-Run/`--write`).
- `scripts/fedlex-manifest-audit.ts` — Audit MISMATCH/UNRESOLVED/OK.
- `check:fedlex-versionen` — Kanonik-Arbiter (Dauer-Tor).
- Selbsttests in `src/tests/fedlex-pins.test.ts` (lesePinsVoll + nAusUrl).
