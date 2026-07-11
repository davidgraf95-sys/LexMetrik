# LexWork-Kantons-API — empirisches 19-Kantone-Verdikt (POC/Mess-Phase)

**Erstellt:** 11.7.2026 — Auftrag David «go zu allem» (10.7.), OpenCaseLaw-Baustein 1
(LexWork-Kantons-API, Ranking-Spitze aus `FAHRPLAN-OPENCASELAW-QUELLEN.md`). Diese
Datei ist die verlangte **POC/Mess-Phase** (§7 «Quell-Wahl empirisch erheben, Wechsel
erst messen»): jeder der 19 LexWork-Kantone **live gegen sein amtliches Portal**
verifiziert (read-only GET), bevor gebaut wird.

**Status:** ZWEIFACH GEPRÜFT — Erstrecherche (Live-Sweep 19 Kantone) + unabhängige
Gegenprüfung (SO-Artikel zeichenweise gegen amtliches `xhtml_tol`, AR-Future-Version-
Negativfall, BS-abrogated-Negativfall). Nicht durch David abgenommen (§8).

## Kernbefund (Leitsatz zuerst)

**Baustein 1 ist bereits gebaut und live — kein Neubau nötig.** Die kantonale
LexWork-Pipeline existiert produktiv: browserloser TS-Adapter
`scripts/normtext/adapter-lexwork.ts` (fetch + strukturierte Extraktion, Drift-Token
`version_uid`), Discovery `lexfind-discovery.ts` (host-agnostische Pfad-Signatur, keine
Host-Whitelist), 1 232 Kantons-Snapshots in `public/normtext/kanton/` über alle 26
Kantone, Drift-Tor `check:normtext-netz` (`check-drift.ts` Prüfung 3: `version_uid` vs.
Snapshot-`fassungsToken`). Ein Nachbau würde §1/§6 verletzen (Golden-Churn auf 1 232
Snapshots) und ist damit **verworfen**. Der Mehrwert dieser Session ist die
**empirische Bestätigung** der Quelle über alle 19 Kantone plus **ein echter
Currency-Befund (GL)**.

## Quellen (amtliche Portale, Abruf 11.7.2026)

Zwei identische Endpunkte je Host (LexWork/clex/OrdoLex-Familie):
- Liste: `GET https://{host}/api/{lang}/texts_of_law/lightweight_index`
- Volltext (vom Adapter genutzt): `GET https://{host}/api/{lang}/texts_of_law/{lawId}`
  → `text_of_law.selected_version.xhtml_tol` (+ `version_uid` Drift-Token)
- Alternativ-Endpunkt: `…/texts_of_law/{lawId}/show_as_json` → `json_content`-Baum
- SPA-Erkennung: `GET /api/manifest.json`

## Verdikt-Tabelle — 19 LexWork-Kantone (live 11.7.2026)

| Kt | Amtlicher Host (Abruf-Ziel) | Lang | Index | version_uid | xhtml_tol / article-div | Verdikt |
|----|------------------------------|------|-------|-------------|--------------------------|---------|
| AG | gesetzessammlungen.ag.ch | de | 471 | ja | ja / ja | **nutzbar** |
| AI | ai.clex.ch | de | 421 | ja | ja / ja | **nutzbar** |
| AR | ar.clex.ch | de | 332 | ja | ja / ja | **nutzbar** |
| BE | www.belex.sites.be.ch | de | 704 | ja | ja / ja | **nutzbar** |
| BL | bl.clex.ch | de | 860 | ja | ja / ja | **nutzbar** |
| BS | www.gesetzessammlung.bs.ch | de | 911 | ja | ja / ja | **nutzbar** |
| FR | fr.clex.ch → bdlf.fr.ch | fr | 813 | ja | ja / ja | **nutzbar** |
| GL | gl.clex.ch → **gesetze.gl.ch** | de | 487 | — | **xhtml_tol-Endpunkt tot** | **teilweise** (s. u.) |
| GR | www.gr-lex.gr.ch | de | 419 | ja | ja / ja | **nutzbar** |
| LU | srl.lu.ch | de | 630 | ja | ja / ja | **nutzbar** |
| NW | nw.clex.ch → gesetze.nw.ch | de | 400 | ja | ja / ja | **nutzbar** |
| OW | ow.clex.ch → gdb.ow.ch | de | 516 | ja | ja / ja | **nutzbar** |
| SG | www.gesetzessammlung.sg.ch | de | 731 | ja | ja / ja | **nutzbar** |
| SH | sh.clex.ch → rechtsbuch.sh.ch | de | 431 | ja | ja / ja | **nutzbar** |
| SO | bgs.so.ch | de | 539 | ja | ja / ja | **nutzbar** |
| TG | www.rechtsbuch.tg.ch | de | 460 | ja | ja / ja | **nutzbar** |
| UR | rechtsbuch.ur.ch | de | 377 | ja | ja / ja | **nutzbar** |
| VS | vs.clex.ch → lex.vs.ch | de | 689 | ja | ja / ja | **nutzbar** |
| ZG | zg.clex.ch → **bgs.zg.ch** | de | 681 | ja | ja / ja | **nutzbar** |

**18/19 voll nutzbar**, 1/19 teilweise (GL). Alle Zahlen = live-`lightweight_index`-Erlasszählung.

### Determinismus-relevante Beobachtungen (§11.2)

- **Host-Redirects sind Normalfall, nie hardcoden.** 7 Kantone leiten den
  `*.clex.ch`/alten Host per 301 auf einen neuen amtlichen Host um (FR, GL, NW, OW,
  SH, VS, ZG). Der Adapter/Discovery folgt der `original_url` aus LexFind bzw. dem
  Redirect — die host-agnostische Pfad-Signatur (`STRUKTUR_APP`/`STRUKTUR_DATA` in
  `lexfind-discovery.ts`) trägt das korrekt. Bestätigt die FAHRPLAN-Warnung «Hosts
  nicht hardcoden».
- **`version_uid` als Drift-Token bei 18/19 vorhanden** → `check:normtext-netz`
  Prüfung 3 greift für alle nutzbaren Kantone.
- **`json_content` (show_as_json-Baum) ist NICHT im `texts_of_law/{id}`-Body**
  (überall `jsonContent: nein`) — er kommt nur über den separaten
  `/show_as_json`-Endpunkt. Der Adapter nutzt heute `xhtml_tol` (Regex-geparst,
  Fussnoten gestrippt, NBSP kollabiert). Der reichere `json_content`-Pfad (Fussnoten
  separat, NBSP verbatim) bleibt der **offene SCHEMA-ENTSCHEID David** aus der
  FAHRPLAN-Gap-Analyse (a in-place-Upgrade mit Golden-Churn / b nur neue Kantone /
  c nur saubereres Parsing) — hier NICHT entschieden, weil Golden-Churn + Pflicht-
  Gegenprüfung auf 1 232 Snapshots.

## GL — Currency-Befund (teilweise nutzbar)

**Glarus ist auf `gesetze.gl.ch` migriert (gl.clex.ch → 301).** Der
`lightweight_index` antwortet dort (487 Erlasse, JSON), aber der vom Adapter genutzte
`GET …/texts_of_law/{lawId}`-Endpunkt liefert für die bisher gültige `lawId`-Form
(systematische Nummer, z. B. `III B/7/1`, und interne numerische `id`) einen
**Soft-404 (HTTP 200/404, `text/html` = Angular-Shell, kein `text_of_law`)**. Nur der
**`/show_as_json`-Endpunkt** antwortet auf `gesetze.gl.ch` weiter mit
`application/json`.

**Folge:** Die 5 GL-Snapshots (`public/normtext/kanton/GL-*.json`) können vom
**heutigen** Adapter-Pfad (`xhtml_tol`) **nicht refresht** werden; `check:normtext-netz`
meldet GL als Netz-Warnung/Drift. **Alle anderen 6 migrierten Hosts (FR/NW/OW/SH/VS/ZG)
servieren `texts_of_law/{id}` mit `xhtml_tol` weiterhin normal** — der Bruch ist
**GL-spezifisch**, keine Familien-weite Migration.

**Einordnung:** Das ist das erste empirische Argument **für** den `json_content`-
Upgrade-Pfad (Option c der Gap-Analyse) — auf `gesetze.gl.ch` ist `show_as_json` der
einzig lebende strukturierte Endpunkt. **Kein Fix in dieser Session** (Snapshot-Pfad =
Risiko, Golden-Churn, Pflicht-Gegenprüfung, David-Schema-Entscheid). → Follow-up-
Kandidat (unten).

## Gegenprüfung (unabhängiger Durchgang, 11.7.2026)

Amtliche Quelle je Fall **in dieser Prüfsession geöffnet**; Sollwert aus der Quelle
notiert, **dann** mit der Adapter-Ausgabe verglichen (Skill `gegenpruefung`).

1. **SO 111.1 Art. 1 (aktiv) — bestanden.** Amtliches `xhtml_tol` (bgs.so.ch):
   Randtitel «Der Kanton als Stand der Eidgenossenschaft», Abs. 1 «Der Kanton
   Solothurn ist ein eigenständiger Gliedstaat der Schweizerischen Eidgenossenschaft.»,
   Abs. 2 «Er beteiligt sich aktiv an der Gestaltung der Eidgenossenschaft und erfüllt
   die ihm durch Verfassung und Gesetz übertragenen Aufgaben.» → Adapter-Ausgabe
   **zeichengleich** (Entities `&auml;`/`&uuml;` dekodiert, kein Drop, kein Fussnoten-
   Leak). `stand` 2025-08-01 = «in Kraft seit: 01.08.2025» ✓; 152 Artikel; `version_uid`
   vorhanden.
2. **AR 111.1 (future_versions:1) — bestanden (Negativfall Future).** Trotz
   vorhandener künftiger Fassung liefert der Adapter `stand` 2023-11-26 (≤ heute) — die
   **geltende**, nicht die künftige Fassung (§7 Build-Regel 3). Keine future-dated
   Version fälschlich ausgeliefert.
3. **BS 153.100 art_53 (aufgehoben) — bestanden (Negativfall Abrogated).** Der
   aufgehobene, umnummerierte Artikel bleibt als Eintrag mit **einem leeren Block**
   erhalten (Adapter S1) — nicht gedroppt, **kein** fabrizierter «Aufgehoben.»-Text
   (§7). Numerierung reisst nicht. Snapshot trägt volle Provenienz (`stand`,
   `quelleUrl`, `fassungsToken`, `sha` = §7 (a)–(d)).

**Verdikt: bestanden.** Da diese Session **keinen** Risiko-Pfad ändert (kein neuer
Extraktions-/Snapshot-Code, nur Dokumentation), entsteht **kein neuer** zu
zertifizierender Diff — der Durchgang ist Validierung der bereits live erzeugten Daten,
kein `gegenpruefung:ok`-Token nötig (`check:gegenpruefung` trippt nur auf Risiko-Datei-
Diffs).

## Geltungsbereich und Ausnahmen (§11.3)

- **19 LexWork-Kantone** (diese Tabelle). Die übrigen 7 laufen über andere Adapter:
  ZH (`adapter-zh-pdf.ts`), SZ/TI/VD/JU (`adapter-pdf.ts`), GE/NE (HTM/SIL,
  `adapter-htm.ts`) — nicht Gegenstand dieses LexWork-POC.
- **Sprache:** 18× `de`, FR `fr`. `it` deckt `holeLexWork` bewusst nicht ab (TI läuft
  über den PDF-Pfad).
- **Bekannte quellseitige Grenzen** (aus FAHRPLAN, hier nicht neu vermessen): echte
  2D-Matrix-Tabellen (colspan/rowspan) noch nicht beobachtet; FR/IT-Artikelbaum nur
  flach geprüft.

## Pflegebedarf (§11.4)

- **GL-Currency:** `gesetze.gl.ch` serviert `xhtml_tol` nicht mehr → GL-Snapshots
  driften. **Datiert:** Befund 11.7.2026. **Verfallsregister-Kandidat.**
- **Redirect-Drift generell:** Weitere `*.clex.ch`-Hosts können migrieren; die
  Discovery fängt Redirects, aber ein GL-artiger Endpunkt-Wegfall braucht den
  `json_content`-Pfad. Periodische Re-Discovery bleibt nötig.

## Abnahme-Status (§11.5)

ZWEIFACH GEPRÜFT (Live-Sweep + unabhängige Gegenprüfung, 11.7.2026). Nicht durch David
abgenommen.

## Empfohlene Follow-ups (nicht in dieser Session gebaut)

1. **GL-`json_content`-Andockung** — GL über `/show_as_json` erschliessen (der einzig
   lebende strukturierte Endpunkt auf `gesetze.gl.ch`). Berührt Snapshot-Pfad → eigener
   Risiko-Schritt mit Pflicht-Gegenprüfung; koppelt an den David-SCHEMA-ENTSCHEID.
2. **SCHEMA-ENTSCHEID David** (Gap-Analyse a/b/c): `json_content` (Fussnoten+NBSP) vs.
   heutiges `xhtml_tol` — Fidelity-Gewinn gegen Golden-Churn auf 1 232 Snapshots.
