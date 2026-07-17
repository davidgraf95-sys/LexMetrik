# Informations-Nutzung der Gesetze — Lücken-Katalog (Bund + Kanton)

**Erstellt:** 17.7.2026 · **Stand:** 17.7.2026 (empirisch am Korpus verifiziert).
**Status:** Erstrecherche · Bau-GO je Kandidat ausstehend (David) — Extraktion = Risikopfad.

> **Auftrag David 17.7.2026:** «untersuche, ob wir wirklich alle Informationen
> aus unseren Gesetzen verwenden». Diese Liste ist die geordnete Ablage der
> Recherche nach **CLAUDE.md §11**. Handlungsreife Lücken sind zusätzlich als
> FAHRPLAN-Intake verortet (§14) — siehe Abschnitt «Verortung» am Schluss.
> Detailquelle für die dortigen Bau-Kandidaten ist **dieses Dokument**.

## Methodik

- **Zwei Miner, gegenläufig** (17.7.2026, empirisch am Cache/Repo verifiziert):
  - **Miner «Quelle»** — was liefert Fedlex überhaupt an strukturierter
    Information (AKN-XML `<akomaNtoso>` + gerendertes HTML je Erlass)?
  - **Miner «Pipeline»** — was extrahieren, speichern und zeigen **wir**
    (`scripts/normtext/*`, `public/normtext/**`, Reader/Popover)?
  - Gemeldet wird nur, wo **Quelle > Pipeline** (verworfene Information) —
    nicht, was die Quelle gar nicht hat.
- **Korpus:** 227 Bund-Erlasse (Fussnoten-Sidecars 227/227) + 1232 kantonale
  Snapshots (LexWork). Bund = AKN-XML + HTML; Kanton = nur gerendertes HTML,
  strukturell dünner (kein AKN, kein FRBR — siehe Tier 3).

## Verdikt

Der **Normtext-KÖRPER des Bundes ist nahezu erschöpfend genutzt.** Artikel,
Absätze, Aufzählungs-`items`, Marginalien/Randtitel, Gliederung, Fussnoten-Body,
Tabellen (ein- und mehrspaltig), Bilder, Anhänge (`annex_*`), Schlusstitel/UeB
(`disp_*`), Präambel/Ingress und Provenienz sind erfasst, gespeichert **und**
gezeigt (Ergebnis der M1–M13-Welle, `norm-vorschau-snapshot-system.md`).

Die **systematischen Lücken liegen nicht im Fliesstext**, sondern in
**(a) relationaler** Metadaten (amtlich verlinkte externe Verweise),
**(b) temporaler** Metadaten (artikel-genaue In-Kraft-/Änderungshistorie) und
**(c) der Such-Abdeckung** (Index lässt Fussnoten/Tabellen aus). Das sind die
drei handlungsreifen Tier-1-Kandidaten.

Alle Zeilen hier: **Abnahme-Status = Erstrecherche** (17.7.2026). Übernahme in
die Pipeline erst nach David-Bau-GO — Extraktion ist Risikopfad (§1/§14 Ziff. 4).

---

## Tier 1 — handlungsreif, hoher Wert

### G-REF · Externe amtliche Verweise werden verworfen

- **Quelle + Stand:** Fedlex AKN-XML/HTML je Erlass (current consolidation,
  Cache `scripts/fedlex-cache.sh`, Stand 17.7.2026). Die Quelle liefert
  **maschinen-auflösbare** Verweise als Inline-Anker:
  `<ref fedlex:rs="943.03" fedlex:rs-uri="…/eli/cc/…">` (SR → **anderer** Erlass;
  Bsp. OR 79× belegt) sowie AS-/BBl-Verweise (`eli/oc` 1260×, `eli/fga` 976×,
  überwiegend in Fussnoten).
- **Befund (deterministisch):** `entferneTags` in
  `scripts/normtext/extrahiere-fedlex.ts` (Region ~Z. 767–777, Regex
  `/<[^>]+>/g` gegen `INLINE_STRIP_TAGS`) **strippt ALLE Inline-`<a>`/`<ref>`
  restlos** → sowohl der `href` (ELI-Deep-Link) als auch die Zielidentität
  gehen verloren. Der Reader leitet Verweise danach nur noch **heuristisch**
  re-derived (`passus.ts`), und das **nur erlass-genau** (Chip springt auf den
  Erlass, nicht auf den Artikel).
- **Geltungsbereich + Ausnahmen — WICHTIG richtiggestellt:**
  **INTERNE** Artikel-zu-Artikel-Verweise existieren in der Quelle **NICHT als
  Daten** (0 interne Kanten im Body — bestätigt an OR: 0/3724 Body-Hrefs, siehe
  FAHRPLAN-NORMTEXT §Quell-Architektur). Dort ist die Heuristik der **einzige**
  Weg und **keine** Lücke. Die Lücke betrifft **ausschliesslich die externen,
  amtlich verlinkten** Verweise (SR→SR, AS, BBl). Kanton: keine ELI-Anker
  (Tier 3).
- **Pflegebedarf:** Zitationsgraph-Kanten sind selbst Haftung — tote/aufgehobene
  ELI müssen behandelt werden; Kanten an den Drift-Zyklus koppeln
  (`check:fedlex-versionen` als Arbiter). Datiert: nein (strukturell).
- **Wert:** hoch. Echter Zitationsgraph zu anderen Erlassen (Burggraben-Feature,
  «Geschwister von M12»/Phase 1) + amtliche Provenienz-Deep-Links in Fussnoten.
- **Aufwand:** **M–L** (Extraktions-Risikopfad: Ziel lesen statt raten, Anker
  auflösen, golden-Re-Bless; Verweis-Chips als Feature = Phase-1-Arbeit).
- **Abnahme-Status:** Erstrecherche (17.7.2026).

### G-HIST · Artikel-genaue In-Kraft-/Änderungshistorie bleibt unstrukturiert

- **Quelle + Stand:** Fedlex konsolidiertes AKN-XML (17.7.2026). Das
  konsolidierte XML enthält **KEIN** `<lifecycle>`/`<temporalGroup>`. Die
  **artikel-genaue** Historie steht ausschliesslich als **Fussnoten-Prosa** in
  `<authorialNote>`: «Eingefügt durch …, in Kraft seit 1. Juli 1991» /
  «Aufgehoben durch … mit Wirkung seit …».
- **Befund (deterministisch):** Diese Fussnoten **speichern wir bereits**
  (`scripts/normtext/fussnoten-extrahiere.ts`, 227/227 Sidecars) — aber
  **unstrukturiert** (Freitext). Wir führen zudem nur **EIN** Ur-Inkrafttreten
  **je Erlass** (`scripts/normtext/inkrafttreten-generieren.ts`, ~Z. 16–22:
  SPARQL `jolux:dateEntryInForce` am Abstract-ELI = kanonisches Ur-Datum des
  Erlasses, bewusst nicht der Konsolidierung).
- **Lücke:** die **bereits gespeicherte** Fussnoten-Prosa in eine strukturierte
  **Per-Artikel-Timeline** parsen → Point-in-Time «seit wann gilt **dieser**
  Artikel», Aufhebungs-Datum je Artikel.
- **Geltungsbereich + Ausnahmen:** Bund. Nicht jeder Artikel trägt eine
  Historie-Fussnote (Ur-Bestand ohne Änderung → Fallback = Erlass-Ur-Datum).
  Kanton: LexWork trägt kein vom Beschluss-/Versionsdatum unterscheidbares
  Ur-Inkrafttreten (Tier 3).
- **Pflegebedarf:** Datums-Parameter je Artikel → Determinismus-/Golden-Pflicht,
  an den Drift-Zyklus koppeln. Datiert: ja (Kandidat Verfallsregister, sobald
  Übernahme).
- **Wert:** hoch (Point-in-Time-Recht = Kern-Differenzierung, «Drift wird zum
  Feature», entspricht M16). **Aufwand:** **L** (Prosa-Parser über 227 Erlasse,
  Risikopfad, gestaffelte Gegenprüfung).
- **Abnahme-Status:** Erstrecherche (17.7.2026).

### G-SUCH · Suchindex ignoriert Fussnoten + Tabellen

- **Quelle + Stand:** eigener Snapshot-Bestand `public/normtext/**` (17.7.2026).
- **Befund (deterministisch):** `scripts/such-index-generieren.ts`
  (`artikelText`, ~Z. 26–33 + Aufbau-Loop ~Z. 92–100) indexiert **nur**
  `b.text` + `items.text` + primäre/nachrangige Marginalie + Gliederung.
  **Omittiert:** Fussnoten-Text, Tabellenzellen (`mehrspaltig`),
  Füllpunkt-Tabelle (`tabelle`), `grundlage` (Delegationsnorm-Template),
  Bild-`alt`.
- **Wirkung:** die **Korpus-Suche** (FlexSearch) findet keinen Text, der nur in
  Tabellen oder Fussnoten steht. **In-Page-Ctrl+F ist unberührt** (rendert über
  den vollen DOM, §15). Kleiner Schnitt.
- **Geltungsbereich + Ausnahmen:** Bund + Kanton (derselbe Index-Generator).
- **Pflegebedarf:** gering; Index ist Build-Artefakt, golden-neutral gegenüber
  der Engine. Bezug: Eval-Harness #251 (Umgangssprache-Recall 0.118) misst genau
  solche Recall-Lücken.
- **Wert:** mittel. **Aufwand:** **S** (reine Index-Erweiterung, kein
  Extraktions-Risikopfad — separate Einheit von G-REF/G-HIST).
- **Abnahme-Status:** Erstrecherche (17.7.2026).

---

## Tier 2 — mittel / teils schon geplant

### G-EID · Gliederungs-Container-eIds werden verworfen — QUERVERWEIS

- Heute speichern wir nur **Labels** (`scripts/normtext/struktur-extrahiere.ts`,
  ~Z. 29: `{ ebene, label }`), die Container-**eIds** der Gliederung werden
  verworfen.
- **Bereits verortet** als **FAHRPLAN-GESETZES-UX §12 (EID-1/2/3, PR #280)** —
  hier **nur Querverweis, nicht doppelt anlegen.** Aufwand dort geführt.

### G-PRERENDER · Prerender-String-Builder lässt Information fallen (§15-Spannung)

- **Befund:** `src/lib/seo-detail.ts` (`bloeckeHtml`, ~Z. 229–286) baut das
  Prerender-HTML und **droppt** Fussnoten, Verweis-Links, Bilder,
  Per-Artikel-Anker und tieferes Item-Nesting; React repariert on-mount
  (render-then-replace).
- **Wirkung:** Crawler + erstes Paint + Ctrl-F-vor-Mount sind verlustbehaftet.
- **Einordnung:** **getrennte Einheit — SEO/§15**, kein Extraktions-Risikopfad.
  Braucht eine explizite **§15-Treue-Bewertung** (Logikverlust vs. Geräte-Last)
  vor jedem Bau. Home: SEO/A11y-Strang. **Aufwand:** M.

### G-ANNEX-META · Anhänge tragen eigene In-Kraft-Daten

- **Befund:** jeder `<doc name="annex">` in `<act>/<components>/<component>`
  trägt einen **EIGENEN FRBR-Block** (eigenes `dateEntryInForce` /
  `dateApplicability`) → ein Anhang kann eine **abweichende Geltung** haben. Wir
  kollabieren das möglicherweise auf Erlass-Ebene.
- **To do:** verifizieren, ob unsere `annex_*`-Extraktion (M13-Annex) den
  Anhang-eigenen Stand verliert; ggf. **je-Anhang-Stand** führen.
- **Einordnung:** Extraktions-Risikopfad, Home = FAHRPLAN-NORMTEXT (M13/M16-Nähe).
  **Aufwand:** M (zuerst Verifikation).

### G-FORMEL-FLAG · `formel:true` wird nie gesetzt

- **Befund:** das Flag `formel` wird nie gesetzt (`extrahiere-fedlex.ts`) →
  Formeln rendern als generische «Amtliche Abbildung» statt «Formel».
- **Einordnung:** **kosmetisch**, Home = FAHRPLAN-NORMTEXT (M8-Nähe, Bilder/
  Formeln). **Aufwand:** S.

---

## Tier 3 — Quell-Grenze / bewusst deferiert (nur auflisten)

- **Formel-/Bild-SEMANTIK:** die Quelle hat **0 alt-Text, 0 MathML** — die
  inhaltliche Bedeutung von Piktogrammen/Formeln ist nur per OCR/Bildverständnis
  gewinnbar. **Echte Quell-Grenze**, nicht unsere Lücke.
- **DE/FR/IT:** DE-only-Scope (FAHRPLAN-NORMTEXT §M15) — bewusst deferiert.
- **LugÜ-Protokolle:** Staatsvertrags-Protokolle `lvl_*/art_*` (röm.
  Nummerierung) — M13-Rest.
- **FN-5 / wortgenaue Marker-Position:** deferiert (grosser Golden-Diff), hinter
  QS-PERF/U-POSITION (FAHRPLAN-GESETZES-UX; M14/G14).
- **Sektions-/Anhang-Fussnoten ohne `art_`-Ziel:** Backlog.
- **Kantonal-Asymmetrie:** LexWork-Quelle ist strukturell dünner — **kein AKN,
  kein FRBR, keine Tabellen-Struktur**; die weitergehenden lexfind-API-Endpunkte
  sind unverifiziert/404. Damit sind G-REF/G-HIST/G-ANNEX-META auf Kanton **nicht
  anwendbar** (Quell-Grenze).

---

## Verortung (FAHRPLAN-Intake, §14)

Handlungsreife Tier-1-Lücken sind als benannte Bau-Kandidaten intaked — nicht
über-gebündelt (verschiedene Risiko-Klassen bleiben getrennt):

| Kandidat | Klasse | Home | ROADMAP-Anker |
|---|---|---|---|
| **G-REF** | Extraktions-Risikopfad | `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Intake | Bündel N / Phase 1 (ELI-Zitations-Graph) |
| **G-HIST** | Extraktions-Risikopfad | `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Intake | Bündel N / M16 (Point-in-Time) |
| **G-SUCH** | Index (kein Risikopfad) | `FAHRPLAN-UI-NAVIGATION.md` (Suchindex/S4) | §R Bau-Reihenfolge |
| G-ANNEX-META / G-FORMEL-FLAG | Extraktion (Tier 2) | `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Intake | — |
| G-PRERENDER | SEO/§15 (getrennt) | `FAHRPLAN-SEO-A11Y-GOVERNANCE.md` | — |
| G-EID | (schon intaked) | `FAHRPLAN-GESETZES-UX.md` §12 (PR #280) | — |

**David-Bau-GO je Kandidat ausstehend** — Extraktion = Risikopfad, adversariale
Gegenprüfung Pflicht (`QS-GP`), golden byte-gleich (§6).
