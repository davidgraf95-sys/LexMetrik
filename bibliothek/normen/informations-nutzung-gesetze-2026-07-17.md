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

## Zweitprüfung 17.7.2026 (adversarial, 2 Linsen)

> **Herkunft:** David 17.7.2026 «überprüfe nochmals fundiert». Zwei gegenläufige
> Linsen **on top** der Erstrecherche:
> **Linse 1 = Voll-Zensus des AKN-XML** (81 Element-Typen / 123 Attribut-Typen,
> **kein Sampling** — jedes Vorkommen im Korpus gezählt);
> **Linse 2 = Ökosystem/Triplestore** (live SPARQL gegen den Fedlex-Triplestore
> + AS/AKN-Endpunkte, 17.7.2026).
> Alle Zeilen hier sind **additiv**; die Erst-Katalog-Einträge oben bleiben als
> Audit-Spur unverändert, Korrekturen stehen hier **explizit**.

### Linse 1 — Voll-Zensus XML: Datei-Ebene substanziell vollständig

**Verdikt Linse 1:** auf Datei-Ebene **kein bewiesener Inhaltsverlust** — der
Normtext-Körper ist erschöpfend genutzt (bestätigt das Erst-Verdikt). Ergebnis:
ein neuer Verifikations-Kandidat, zwei benigne Notizen, drei Korrekturen.

#### G-TAB · Layout- vs. Datentabellen nicht diskriminiert (MITTEL — zuerst VERIFIZIEREN)

- **Quelle + Stand:** Fedlex AKN-XML je Erlass (Voll-Zensus 17.7.2026). Fedlex
  markiert **Layout-Tabellen** explizit (`table@fedlex:function="layout"`, **26×**
  im Korpus); **Datentabellen** tragen `border="1"` (**69×**) als Daten-Signal.
- **Befund (deterministisch):** unsere Tabellen-Extraktion (`extrahiere-fedlex.ts`)
  hat **keinen Diskriminator** zwischen Layout- und Datentabelle → eine reine
  Layout-Tabelle könnte fälschlich als **Datengitter** rendern.
- **Geltungsbereich + Ausnahmen:** Bund. **Verifikations-Kandidat: VTS**
  (46 `border`-Tabellen) — dort zuerst prüfen, ob Layout-Tabellen als Gitter
  durchschlagen. Kanton: keine AKN-Tabellen-Struktur (Tier 3).
- **Pflegebedarf:** nein (strukturell); falls Fix → golden-Re-Bless des Snapshots.
- **Wert:** mittel. **Aufwand:** zuerst **Verifikation (S)**, Fix nur falls bestätigt.
- **Abnahme-Status:** Zweitprüfung (17.7.2026) — **Verifikation ausstehend, erst
  VERIFIZIEREN, dann ggf. fixen.** Home: `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Intake.

> **G-TAB verifiziert 18.7.2026 — Verdikt A, kein Defekt.** Kein Garbling nachweisbar,
> der fehlende Diskriminator ist für den heutigen Korpus folgenlos. **(1)** Wir
> extrahieren aus der Fedlex-**HTML**-Manifestation, nicht aus dem XML — dort
> **überlebt `fedlex:function="layout"` NICHT** (0 `function`-Tokens im HTML). Der
> Diskriminator erscheint im HTML nur als An-/Abwesenheit von **`border="1"` = das
> Daten-Signal** (VTS-HTML: 70 `<table>` = 46 `border="1"` + 24 ohne `border`; deckt
> sich exakt mit dem XML 46 + 24 `function="layout"`). **(2)** Layout-Tabellen nur in
> **VTS (24) + SSV (2)**; OR/ZGB/MWSTG/BVV2 = 0 → gegenstandslos. **(3)** Obwohl der
> Extraktor den Diskriminator nicht kennt, verhindern **drei bestehende Mechanismen**
> Garbling: **Bild-Splitting** (Bilder werden als eigene `bild`-Blöcke herausgelöst,
> nie Gitter-Zellen; 18/24 VTS-Layout-Tabellen sind Bild+Text) · **Leerspalten-
> Streichung T-A7** (`tabelle-normalisieren.ts`, entfernt leere Spacer-Spalten) ·
> **defensiver Reader-Pfad** (`ArtikelBody.tsx`/`KanonischeTabelle` T-E5: 1-Spalten-
> Tabelle → einzelne umrahmte Textzelle, aritätsverletzende Zeile → lineare
> verlustfreie Darstellung statt verschobenem Gitter). Rest-Inhalt ist echt (genuine
> Spaltendaten wie VTS art_135 Abmessungen / SSV-Signal-Masse, oder beschreibender
> Fliesstext, oder Signal-Verweis-Captions). **Belegquelle:** committete Bestands-JSONs
> `public/normtext/bund/VTS.json` + `SSV.json` (tatsächliche Extraktor-Ausgabe) +
> Render-Komponente; deterministische Ausgabe + Render-Pfad sind dispositiv, kein
> Screenshot nötig. Stichproben VTS/SSV **treu**. — **Rest-Beobachtung (kein Defekt,
> Kosmetik-Backlog):** Illustrations-Legenden in 1-Zellen-Rahmen gewickelt, SSV-Signal-
> Index als gepolstertes Gitter statt Liste — beides treu und lesbar, nur nicht ideal;
> kein Garbling → kein Fix-Trigger (Stufe 2 nicht ausgelöst).

**Notizen Linse 1 (NIEDRIG, kein Kandidat):**

- **Emphasis-Schema fehlt:** kein Feld für `i`/`b`/`inline@name` → der **Inhalt
  überlebt**, nur die **Auszeichnung** geht verloren (Fachterm-Kursiv «Private
  Equity» rendert ungekursivt; 1× `man-color-00B050`). Benigne.
- **SVG-Innentext gestrippt**, aber die Beispiel-Wörter stehen **parallel in der
  Prosa** → kein Inhaltsverlust (benigne).

**Korrekturen am Erst-Katalog (Linse 1):**

1. **`rowspan` kommt im Korpus 0× vor** → jede Erst-Annahme, mehrspaltige
   Tabellen trügen `rowspan`-Zellen, ist **gegenstandslos** (Über-Behauptung
   richtiggestellt).
2. **Struktur-Vokabular ist breiter als katalogisiert:** neben den gelisteten
   Containern existieren `section`/`subchapter`/`listIntroduction`/`intro` —
   **alle vom Parser gehandhabt**, kein Verlust; der Erst-Katalog nennt nur eine
   Teilmenge der real vorkommenden Container-Typen.
3. **Bild-`alt` präzisiert:** die **Quelle** hat **0 `alt`** (bestätigt Tier 3),
   aber **unser Extraktor erzeugt 448 `alt`-Werte** (271 generisch, der Rest
   echte SSV-Signalnamen). Damit ist die Erst-Annahme «Bild-`alt` weglassen,
   0 vorhanden» zu präzisieren: **0 in der Quelle, 448 selbst-erzeugt** (nicht
   «weggelassen»); die echten SSV-Signalnamen sind genau das Material, das
   **G-SUCH** als indexierbares Bild-`alt`-Feld einsammelt.

### Linse 2 — Ökosystem/Triplestore: hier liegen die echten Lücken

**Verdikt Linse 2:** die Datei ist voll, aber das **Ökosystem** um den Erlass
(Triplestore-Relationen, AS-enacted-XML, Sprach-/Alias-Matrix) ist ungenutzt.
Fünf neue Kandidaten + out-of-scope-Notizen.

#### G-AUFH · `dateNoLongerInForce` wird nirgends geprüft (HOCH — Korrektheits-Bug, kleiner Fix)

- **Quelle + Stand:** Fedlex-Triplestore, `jolux:dateNoLongerInForce` am Erlass
  (live SPARQL 17.7.2026).
- **Befund (deterministisch):** die Wiedervorlage-/Frische-Prüfung
  (`scripts/fedlex-versionen-pruefen.ts:107-119`) filtert nur geltende vs. künftige
  **Konsolidierungen** und meldet die neueste geltende als «OK» — sie prüft
  **`dateNoLongerInForce` nicht**. Folge: ein **ganz aufgehobener** Erlass bliebe
  still «geltend geprüft» (Verstoss **§7/§8**; das Skill-Recipe
  `scraping-swiss-official-sources` fordert diesen Check **explizit**).
- **Geltungsbereich + Ausnahmen:** Bund; alle gepinnten Erlasse.
- **Pflegebedarf:** Check an den Drift-Zyklus koppeln (`check:fedlex-versionen`
  als Arbiter); Aufhebungs-Datum = datierter Parameter (Verfallsregister).
- **Wert:** hoch (Korrektheit/Haftung). **Aufwand:** **klein** (ein zusätzlicher
  Query-Filter + Alarm-Zweig).
- **Abnahme-Status:** Zweitprüfung (17.7.2026). **David-GO liegt vor** («setze
  befunde um») → **als NÄCHSTE Bau-Einheit markiert.** Home:
  `FAHRPLAN-OPTIMIERUNG-2026-07.md` §O-2 (Frische-Automatik).

#### G-RSS · STALE-PENDING-Fenster + amtlicher RSS-OC-Feed ungenutzt (MITTEL)

- **Quelle + Stand:** amtlicher RSS-Feed `api/rss-oc-de.xml` (Amtliche Sammlung,
  live verifiziert 17.7.2026, **50 Items**).
- **Befund (deterministisch):** die **Konsolidierung hinkt der AS um Tage–Wochen
  nach** (STALE-PENDING-Fenster). O-2 pollt heute nur **gepinnte** Erlasse (Stärke:
  es sieht das Zukunfts-Signal künftiger `dateApplicability`), **abonniert aber
  den RSS-OC-Feed nicht** — der auch **brandneue** Erlasse deckt, die noch gar
  keinen Pin haben.
- **Geltungsbereich + Ausnahmen:** Bund.
- **Pflegebedarf:** Feed-Abo im Wochen-Monitor; neue OC-Einträge → Issue/PR.
- **Wert:** mittel (schliesst das Detektions-Loch für neue/noch-nicht-konsolidierte
  Erlasse). **Aufwand:** S–M.
- **Abnahme-Status:** Zweitprüfung (17.7.2026). Home:
  `FAHRPLAN-OPTIMIERUNG-2026-07.md` §O-2 (ergänzt O-2).

#### G-ASXML · AS-enacted-AKN-XML = diff-genaue Änderungstexte (MITTEL-HOCH, Feature, baulastig)

- **Quelle + Stand:** AS-enacted-Erlasse als **AKN-XML** mit `<mod>`/
  `quotedStructure` (live verifiziert `eli/oc/2026/393`: **33 `mod` / 66
  `quotedStructure`**, 17.7.2026).
- **Befund (deterministisch):** das enacted-XML enthält die **wörtlichen
  Änderungstexte je Artikel** (was genau eingefügt/ersetzt/aufgehoben wurde) —
  hebt **G-HIST** von «**wann** geändert» auf «**was** geändert».
- **Geltungsbereich + Ausnahmen:** Bund, **nur neuere AS**. **Grenze: Alt-AS
  liegt nur als PDF** vor (kein enacted-XML) → kein diff-genauer Text.
- **Pflegebedarf:** Extraktions-Risikopfad (Diff-Text = Haftung); golden-Pflicht.
- **Wert:** mittel-hoch (Point-in-Time **mit Wortlaut**). **Aufwand:** L (Feature,
  eigenes Design + GP). **Einordnung: G-HIST-Erweiterungsstufe.**
- **Abnahme-Status:** Zweitprüfung (17.7.2026). Home:
  `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Intake (bei G-HIST).

#### G-LANG · Sprachfassungs-Matrix ungenutzt (MITTEL, quasi gratis)

- **Quelle + Stand:** Fedlex `jolux:isRealizedBy` → Sprach-Realisierungen
  (OR: de/fr/it/en/rm), live SPARQL 17.7.2026. `isRealizedBy` ist im Repo bereits
  in anderen Generatoren verwendet (z.B. `revisionen-generieren.ts`,
  `botschaften-generieren.ts`).
- **Befund (deterministisch):** die Sprachfassungs-Matrix ist ungenutzt; **die
  `eId`-Anker sind sprachunabhängig** → **FR/IT-Live-Deep-Links** wären fast zum
  Nulltarif zu erzeugen (gleicher Anker, andere Sprach-Manifestation).
- **Geltungsbereich + Ausnahmen:** Bund (DE-only-Scope bleibt für Volltext, §M15);
  hier nur **Live-Link** in die amtliche FR/IT-Fassung, kein Import.
- **Pflegebedarf:** gering (URL-Ableitung, kein Snapshot).
- **Wert:** mittel (mehrsprachige Kanzlei). **Aufwand:** S (quasi gratis).
- **Abnahme-Status:** Zweitprüfung (17.7.2026). **Home = Querverweis auf
  `FAHRPLAN-GESETZES-UX.md` §12 (EID-2, PR #280)** — dort als Erweiterung
  vermerken (die `eId`-Container-Arbeit ist der natürliche Träger).

#### G-ALIAS · amtliches `titleShort` + Deskriptoren-Thesaurus als Abgleich-Quelle (NIEDRIG-MITTEL, Tor)

- **Quelle + Stand:** Fedlex `jolux:titleShort` (amtliches Kürzel, z.B. CO/CC)
  + Deskriptoren-Thesaurus (`legal-taxonomy`, **~90 mehrsprachige Schlagworte je
  Erlass**), live SPARQL 17.7.2026.
- **Befund (deterministisch):** unsere FR/IT-Kürzel-Aliasse sind **hand-gepflegt**;
  es gibt eine **amtliche** Quelle für Kürzel + Schlagworte → ein **Abgleich-Tor
  «Aliasse ⊆/≙ amtlich»** würde Hand-Pflege gegen die Amtsquelle härten.
- **Geltungsbereich + Ausnahmen:** Bund. Die **eigene funktionale Systematik
  bleibt** — die amtliche Taxonomie dient nur als **Abgleich-/Thesaurus-Quelle**,
  nicht als Ersatz.
- **Pflegebedarf:** Tor im Drift-Zyklus; amtliche Kürzel/Schlagworte sind selbst
  pflegebedürftig (Quell-Drift).
- **Wert:** niedrig-mittel (Härtung, kein neues Feature). **Aufwand:** S.
- **Abnahme-Status:** Zweitprüfung (17.7.2026). Home = Querverweis auf
  `FAHRPLAN-GESETZES-UX.md` §12 (nahe G-LANG/EID) — dort als Härtungs-Tor vermerken.

**Out-of-scope-Notizen Linse 2 (dokumentiert, kein Kandidat):**

- **Historische Konsolidierungen Point-in-Time** (~100 OR-Fassungen zurück bis
  1912) — grosser Bestand; **Caveat: 100 evtl. Row-Cap** der SPARQL-Antwort, also
  ggf. mehr. Interessant für G-HIST/M16, aber eigener grosser Posten.
- **BBl-Volltexte** — bewusst weiterhin **nur Live-Link** (kein Import).
- **Funktionale eigene Systematik bleibt** — die amtliche Taxonomie kommt nur als
  Abgleich-/Thesaurus-Quelle in Frage (siehe G-ALIAS).

### Kanten-Analyse (17.7.2026)

#### G-VOLLTEXT-VERZ · norm-index nur aus `statutes[]`, nicht aus Volltext (MITTEL — eigenes Design nötig)

- **Quelle + Stand:** eigener OCL-Bestand + F2-Zitat-Analyse (17.7.2026).
- **Befund (deterministisch):** der `norm-index` speist sich aus
  OCL-**`statutes[]`** (bereits atomisiert; **F2-Delta = 0**, exhaustiv bewiesen —
  der Produktions-Feed ist F2-konform). Die **+2931 F2-Zitat-Gewinne** liegen im
  **Entscheid-VOLLTEXT/Regesten**, die den Index **nicht** speisen.
- **Geltungsbereich + Ausnahmen:** Rechtsprechungs-Achse (Bund; kantonale
  Norm-Auflösung separat, vgl. FAHRPLAN-RECHTSPRECHUNG §8.2). Grenze: Volltext-
  Treffer sind **Roh-Erwähnung**, nicht geprüftes «einschlägig» (R2) → nur als
  «auch erwähnt»-Klasse, nie als verifiziert.
- **Pflegebedarf:** eigenes Design + Gegenprüfung; Determinismus je Build.
- **Wert:** mittel (mehr Norm→Entscheid-Kanten). **Aufwand:** eigene Einheit mit
  Design + GP. **Home: `FAHRPLAN-RECHTSPRECHUNG.md` §8.1.**
- **Abnahme-Status:** Zweitprüfung (17.7.2026).
- **Nebenbefund (Korrektur einer alten Erwartung):** die frühere «Kanten-Regen
  nach #254»-Erwartung (norm-index/Zitat-Kanten additiv nachziehen) ist
  **erledigt/gegenstandslos** — der Produktions-Feed ist bereits **F2-konform**
  (Beweis 17.7.2026). Im NORMTEXT-Intake vermerkt.

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

**Zweitprüfung 17.7.2026 — neue Kandidaten (adversarial, 2 Linsen):**

| Kandidat | Klasse | Home | Priorität / Status |
|---|---|---|---|
| **G-AUFH** | Korrektheits-Bug (kleiner Fix) | `FAHRPLAN-OPTIMIERUNG-2026-07.md` §O-2 | **HOCH — NÄCHSTE Bau-Einheit (David-GO liegt vor)** |
| **G-ASXML** | Extraktions-Risikopfad (Feature) | `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Intake (bei G-HIST) | MITTEL-HOCH · G-HIST-Erweiterungsstufe |
| **G-VOLLTEXT-VERZ** | Index (eigenes Design + GP) | `FAHRPLAN-RECHTSPRECHUNG.md` §8.1 | MITTEL |
| **G-RSS** | Frische/Detektion | `FAHRPLAN-OPTIMIERUNG-2026-07.md` §O-2 | MITTEL |
| **G-TAB** | Extraktion (zuerst verifizieren) | `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` §Intake | MITTEL · Verifikation zuerst |
| **G-LANG** | Feature (quasi gratis) | `FAHRPLAN-GESETZES-UX.md` §12 (EID-2, PR #280) — Querverweis | MITTEL |
| **G-ALIAS** | Härtungs-Tor | `FAHRPLAN-GESETZES-UX.md` §12 (nahe G-LANG) — Querverweis | NIEDRIG-MITTEL |

> **Hinweis Home-Verortung:** die EID-Section `FAHRPLAN-GESETZES-UX.md` §12
> (EID-1/2/3) entsteht mit **PR #280** und liegt **noch nicht auf diesem Branch** —
> G-LANG/G-ALIAS sind daher als **Querverweis** geführt (dort als Erweiterung zu
> vermerken, sobald #280 gemergt), nicht als eigener Intake-Block hier.

**David-Bau-GO je Kandidat ausstehend** — Extraktion = Risikopfad, adversariale
Gegenprüfung Pflicht (`QS-GP`), golden byte-gleich (§6). **Ausnahme G-AUFH:**
David-GO liegt vor («setze befunde um») → als nächste Bau-Einheit markiert.
