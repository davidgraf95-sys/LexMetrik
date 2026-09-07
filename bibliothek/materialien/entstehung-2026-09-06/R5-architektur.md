# R5 — Architektur-Plan «Entstehung am Artikel» (E1–E6), READ-ONLY, 6.9.2026

Grundlage: `fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md:73-200` (§11), Archiv §2
(`archiv/fahrplaene/FAHRPLAN-MATERIALIEN-VERZAHNUNG.md:29-109`), `.claude/rules/schichtentrennung.md`,
`.claude/skills/perf/SKILL.md`. Zeilenangaben = Stand `e2832e288`. **Kein Code geschrieben.**

## 0. Leitbefund, der die Spec korrigiert (§7: abweichend umsetzen + offenlegen)

§11.3 deklariert «Artikel → Änderung (Datum, oc-ELI, fga-ELI, Absatz/Buchstabe)» als **neu**
(Fahrplan:99, «mitführen statt verwerfen»). Am Ist-Stand falsch: der **Historie-Shard existiert und trägt genau diese Felder bereits**.

Beleg `public/normtext/historie/OR.json`, Art. 14 (gelesen 6.9.2026): `{"giltSeit":"2017-01-01",
"ereignisse":[{"typ":"fassung","datum":"2017-01-01","quellen":[{"label":"AS 2016 4651","url":"…/eli/oc/2016/752"},
{"label":"BBl 2014 1001","url":"…/eli/fga/2014/171"}],"absatz":"2bis","item":null}]}` — Typ, Datum,
oc-ELI, **fga-ELI**, Absatz, lit./Ziff. Erzeuger `scripts/normtext/historie-generieren.ts`
(`gen:historie`/`check:historie`), Typen `src/lib/normtext/historie-parse.ts:41-71,299`, Loader
`src/lib/normtext/historie-laden.ts:22-30,38-70`; 209 Shards, grösster (OR) 367 KB roh = **13.7 KB
gzip** (gemessen). Folge: **E2 baut keinen zweiten Fussnoten-Parser** — er wäre die dritte Wahrheit
über «wann wurde Art. N geändert» (§5) neben `historie-parse.ts` und `revisionen-extrakt.ts`.

## A. Etappen je Etappe: erweiterte Dateien · neue Dateien · Typen · Tore · Whitelist/TABU

### E1 — Verfahrens-Ereignisse je Vorlage (Zeitstrahl «Am Erlass»)

- Erweitern: `scripts/materialien/botschaften-generieren.ts` — SPARQL-Kette Z. 8-20, reine
  Parse-Funktion `baueBotschaften` (ab Z. 89), Typ `BotschaftEintrag` Z. 49-71 (hat `projEli`,
  `ocUris`, `nummer`, leeres `artAnker` Z. 68); neu ein Feld `ereignisse` aus
  `jolux:draftHasLegislativeTask` + `type-projet` + `decisionDate` — dasselbe Feld in
  `botschaften.generated.ts` (415 Z.) und `botschaften.ts:19-33` (`BotschaftBezug`).
- Neu: **keine Datei** — kein zweiter Endpunkt (§11.6 «eine Erweiterung der Query»).
- Tor: `check:botschaften-netz` (`scripts/materialien/check-botschaften-netz.ts`) — die Signatur
  `intrinsischeSig` Z. 30-32 muss die Ereignis-Menge mitnehmen, sonst ist Ereignis-Drift unsichtbar
  (dasselbe Loch wie die 8-Key-Stichprobe, Kommentar Z. 11-17). Skizze:
  ```ts export type VerfahrensTyp = 'vernehmlassung'|'botschaft'|'beratung-nr'|'beratung-sr'
    |'schlussabstimmung'|'referendumsfrist'|'as'|'inkraft'; // type-projet → Etikett: FESTE Tabelle
  export interface VerfahrensEreignis { typ: VerfahrensTyp; datum: string; fga?: string; roh: string /* Audit */ } ```
- Whitelist `scripts/materialien/*`, `src/lib/materialien/botschaften*.ts`, Tests · TABU `public/normtext/**`, Leser-Dateien, jede UI.

### E2 — Artikel-Änderungskanten + Botschafts-Anker-Sidecar

- Erweitern: `scripts/normtext/historie-generieren.ts` + `src/lib/normtext/historie-parse.ts` — je
  Ereignis ein `botschaftKey?` (fga-ELI → `BOTSCHAFT-<jahr>-<nr>` über `keyAusFga`,
  `scripts/materialien/botschaften-generieren.ts:76-80`), **zur Bauzeit aufgelöst**, damit der Leser
  nicht zur Laufzeit gegen `register.json` (757 KB) mappen muss; dazu je Artikel ein Kopf mit
  Fassungszahl + `botschaft: boolean` (Grund unter B). `revisionen-extrakt.ts` bleibt unverändert.
- Neu: `scripts/materialien/anker-sidecars.ts` (BBl-HTML ≥ 2022 holen, `id="art_…"` extrahieren,
  `public/materialien/anker/<BOTSCHAFT-KEY>.json` schreiben; sha committet, HTML nie) ·
  `src/lib/materialien/anker.ts` (Lazy-Loader je Botschaft, Muster wörtlich
  `kanten-shard.ts:56-60` + `historie-laden.ts:38-58`) · `scripts/materialien/check-entstehung.ts` → `npm run check:entstehung`.
- Skizze:
  ```ts interface HistorieEreignis { /* bestehend, historie-parse.ts:56 */ botschaftKey?: string }
  export interface AnkerSidecar { botschaft: string; fga: string; sha: string; abgerufen: string; // NEU
    erlassKeys: string[]; anker: { eId: string; ueberschrift: string; quelle: 'amtlich'|'maschinell' }[]; } ```
- Whitelist: `scripts/normtext/historie-*.ts`, `scripts/materialien/*`, `src/lib/normtext/historie-parse.ts`,
  `src/lib/materialien/anker.ts`, `public/normtext/historie/**`, `public/materialien/anker/**`.
  TABU: `public/normtext/struktur/**` (36 MB, nur lesen — §11.5), `public/verzahnung/artikel-revisionen/**`
  (V1c-Vertrag des EntscheidLesers: `KontextPanel.tsx:274`, `EntscheidVerzahnung.tsx:88`), jede `.tsx`.

### E3 — Leser-UI

- Erweitern: `parts/ArtikelHistorie.tsx` (148 Z.) — Chip-Zeile Z. 100-121 wird zur Entstehungs-Zeile,
  die `<ol>`-Timeline Z. 128-146 zur Fassungsleiste + Änderungskarte; **kein zweites Bauteil daneben**
  (§5, sonst zwei «Fassung»-Zeilen). · `parts/ArtikelLeser.tsx:689-691` (Slot) und
  `berechnungen.ts:187-188` (`HIST_SLOT = 40`) nur, falls die Zeile über 24 px wächst — sonst wandern
  off-screen-Artikel (`ArtikelHistorie.tsx:16-24`: CLS 0.0227 statt 0.0002 unter 6×, 20.7.2026). ·
  `inhalt-zustand.tsx:117-133`: kein neuer Fetch, Anker-Loader erst NACH dem Klick. · Rückrichtung am
  Material in `components/kontext/KontextPanel.tsx` (792 Z., **an der Schlankheits-Grenze**).
- Neu: `parts/ArtikelEntstehung.tsx` NUR, wenn `ArtikelHistorie.tsx` sonst die 800-Zeilen-Schwelle
  von `check:schlankheit` reisst (Präzedenz `ArtikelKontextGruppe.tsx:22-24`).
- Tor: `e2e/gesetze-entstehung.e2e.ts` nach Muster `e2e/gesetze-historie-badge.e2e.ts:119-153`
  (CLS-Beobachter nur um den Toggle, Erwartung 0) und `e2e/leser-v3-kontext-cls.e2e.ts:101,138`.
- Whitelist: `src/pages/gesetz-leser/parts/*`, `src/components/kontext/*`, `e2e/*`.
  TABU: `src/lib/**`-Rechtslogik, jeder Generator, jedes `public/**`-Artefakt, `src/index.css` (s. E/3).

### E4 — Parlament (Curia Vista)

- Neu: `scripts/materialien/curia-holen.ts` (Fetch, Sprachfeld-Falle) + `curia-parse.ts` (rein/testbar,
  Trennung wie `botschaften-generieren.ts:22-23`), `bibliothek/register/curia-zustand.jsonl`
  (Zustandsträger, Archiv §2.3 Z. 78-88), `public/materialien/curia/<GESCHAEFT>.json`,
  `src/lib/materialien/curia.ts` (Loader). Tor `check:entstehung --curia` (Zustandsträger-Manifest +
  DE-Filter-Testfall). TABU: Voting-Endpunkt (4.8 Mio., §11.5 «nie ingestieren»).

### E5/E6 — Synopse + Entwurf/Beschluss-Diff

- Neu: `scripts/normtext/synopse-generieren.ts` · `src/lib/normtext/synopse.ts` (Loader) ·
  `public/normtext/synopse/<KEY>.json` · `daten/synopse-roh/` (gitignoriert). Zitat-Regime §7 a–d.
  Deckel (5 MB/Erlass, 25 MB gesamt) als Tor-Bedingung in `check:entstehung` (Begründung unter C).
  TABU: Deckel anheben statt Server-Pfad (§11.5 wörtlich).

## B. Die eingeklappte Zeile ohne Fetch und ohne CLS

**Heute schon im Speicher, wenn ein Artikel gerendert wird** (idle geladen, `src/pages/gesetz-leser/inhalt-zustand.tsx:117-133`, `beiLeerlauf`):

| Datum | Quelle | Feld |
|---|---|---|
| Fassungszahl | Historie-Shard `historie.ereignisse[]` (`historie-laden.ts:60-70`; Ladeort Z. 130-133) | ableitbar (Ereignisse mit `datum`) |
| «zuletzt 1.1.2024» · Erlass + AS/BBl-Link · Absatz/lit. | `giltSeit`, `ereignisse[].quellen[]` (oc+fga, §0), `.absatz`/`.item` | vorhanden |
| «zuletzt geändert» (2. Weg) | Revisions-Shard `revisionFuer` (`inhalt-zustand.tsx:130,140-146`) | vorhanden, redundant |

**Was fehlt** — genau zwei Dinge:
1. **«Botschaft» ja/nein.** Der fga-Link steht da; ob er zu einer erfassten Botschaft gehört, weiss
   heute nur `botschaftenFuer()` gegen `register.json` (`src/lib/materialien/botschaften.ts:82-97`,
   Budget 780 KB). ⇒ **Billigster Weg: Bauzeit** — `botschaftKey` je Ereignis in den Historie-Shard
   (E2). Kosten OR: 13.7 KB gzip + ~15 % ⇒ ~16 KB. Kein Fetch, kein Budget-Eintrag.
2. **«Praxis: keine Wegleitung».** Kommt aus dem Kanten-Shard, der **im Lesefluss nicht geladen
   wird**: `ladeKantenShard` läuft nur für die Seitenleiste (`artikelKontext.ts:146-148`); ihn dort zu
   laden kehrte den David-Entscheid 28.7.2026 um («Facetten aus = null Byte»,
   `inhalt-zustand.tsx:121-129`). ⇒ **Empfehlung: Praxis-Segment erst NACH dem Aufklappen nachladen**
   (Klick = Input ⇒ CLS-exkludiert); die Zahl steht schon in der Seitenleiste (`ArtikelKontextGruppe.tsx:75-79`).

**Ort im Render-Baum: der bestehende, bereits reservierte Slot** `ArtikelLeser.tsx:689-691`
(`data-hist-slot`, `mt-4 min-h-beiwerk` = 16+24 px), im Lesefluss unter dem Artikel, nicht in der Seitenleiste. Gründe, alle belegt:
- Die Reserve steht **ab dem ersten Paint** und ist monoton (`ArtikelLeser.tsx:655-687`: sie folgt
  «Artikel trägt Fussnoten», nicht der Shard-Antwort) ⇒ der idle-Resolve **füllt**, er schiebt nicht.
  Der Schalter «Änderungsvermerke aus» blendet ihn aus (`src/index.css:684-690`) — die Zeile erbt die
  vorhandene Bedienung statt eines 4. Schalters; `data-such-meta` (`ArtikelLeser.tsx:689`) hält sie
  korrekt aus der Volltextsuche heraus (S8).
- **Virtualisierung: es gibt keine** — geprüft, nur `content-visibility:auto` +
  `contain-intrinsic-size` (`berechnungen.ts:119-148`; `parts/ArtikelIndex.tsx:23-34` «Virtualisierung
  weiterhin NICHT gebaut»); jeder Knoten bleibt im DOM ⇒ Ctrl+F, Anker, Druck unberührt (perf-Skill
  Bauregel 1). **Aber:** wächst der Slot über 40 px, muss `HIST_SLOT` (`berechnungen.ts:187`)
  mitwachsen, sonst laufen Scrollbalken-Proportion und Sprungziele (`inhalt-sprung.tsx:115`,
  `scrollAnker.ts:105`) auseinander ⇒ **Auflage E3: die zugeklappte Zeile bleibt EINZEILIG** (24 px),
  dann ändert sich an Geometrie und Toren nichts. Gliederung/Sprunglogik unberührt, solange die Zeile
  unter dem Wortlaut sitzt (§11.4 verbietet ein Element im Artikeltext ohnehin).

## C. Shard-Design

- **Synopse: Shard je Erlass, nicht Artikel-Bucket** (ein Erlass offen ⇒ 1 Fetch statt n); Schlüssel
  `eId + Konsolidierungsdatum`, nur geänderte Blöcke. Bucket-Split ab Grösse: Mechanik fertig in
  `src/lib/materialien/kanten-shard.ts:11-18,44-56` (Kopf + `buckets[]`) — wiederverwenden (§10).
- **Anker-Sidecar je Botschaft** (`public/materialien/anker/<key>.json`): Zugriffsrichtung
  Dokument→Artikel, nur beim Klick. **Curia-Zustandsträger** `bibliothek/register/curia-zustand.jsonl`,
  append-only, Weiche C (Archiv §2.3 Z. 81-84: Rebuild aus Manifest + Projektion + Snapshot, nie aus
  der Live-Quelle allein) — ohne neue Tabelle.
- **soft-law.db / `norm_referenzen`**: «keine neue Tabelle» stimmt, aber die Artikel↔Änderung-Kante
  landet gar nicht dort — sie lebt im Historie-Shard (Normtext-Seite), nicht in `norm_referenzen`
  (Archiv §2.1 Z. 43-60). Dabei bleiben; ein Nachtrag dort wäre dieselbe Fussnote zum zweiten Mal (§5).
- **`check:paritaet`** (`scripts/datenhaltung/check-paritaet.ts:1-5`) ingestiert
  `public/materialien/register.json` + `public/materialien/kanten/**` rekursiv
  (`ingest.ts:72-75,267-279`); `public/normtext/historie/**` ist **nicht** abgedeckt ⇒ neue
  Historie-Felder brechen das Tor nicht, sind aber auch nicht roundtrip-bewiesen. Anker-Sidecars
  deshalb **nicht** unter `kanten/` (fremdes Schema ⇒ rot): eigene Ingest-Klasse oder Lücke in
  `check:entstehung` benennen (**offen, Frage 2**).
- **`check:perf-budget`** (`scripts/check-perf-budget.ts:99-127`) zählt eine **feste Dateiliste**
  (`DATEN_BUDGET`), keine Verzeichnisse; Historie-, Revisions-, Kanten-Shards fehlen darin ⇒
  Synopse-/Anker-Deckel eigens eintragen, sonst wachsen 15–20 MB unbewacht (§6.7). Empfehlung:
  grösster Synopse- + grösster Historie-Shard als je ein Eintrag (Muster der drei Bezugs-Shards
  Z. 118-127), Gesamt-Deckel in `check:entstehung`.

## D. Tore

**Reissen (vorher/nachher zeigen):** `check:historie` (jedes neue Shard-Feld ⇒ Drift; regenerieren
und committen) · `check:materialien` / `check:botschaften-netz` (E1, `intrinsischeSig` ergänzen) ·
`check:schlankheit` (Kandidaten `KontextPanel.tsx` 792 Z., `ArtikelHistorie.tsx`) · `check:zyklen`
(`src/lib/materialien/anker.ts` darf nicht aus `src/pages/**` importieren, Präzedenz
`artikelKontext.ts:41-44`). **`check:golden-normtext` muss byte-gleich bleiben**: der Prerender
emittiert kein Slot-Markup (`berechnungen.ts:137-139`) — rot heisst, eine Rechtsaussage ist in den
Prerender-Pfad gerutscht ⇒ Abbruch, nicht Test-Update (§6.3). **`check:gegenpruefung` pflichtig** für
E1/E2/E4/E5 (`scripts/normtext/**`, `scripts/materialien/**`, `public/normtext/**/*.json`,
`scripts/verzahnung/**` = Risiko-Pfade, `scripts/gegenpruefung/kern.ts:135,171-189`); E3 (nur
`.tsx`/`e2e`) ist **keiner**. `gen:zaehler` (`gen-startseite-zaehler.ts:67-68`), `check:paritaet`,
`check:tarif-drift`: unberührt. `check:plan` verlangt die drei `W2·6c-*`-Zeilen in `ROADMAP.md` —
**fehlen heute** (grep: nur der Fahrplan nennt sie).

**Neu `npm run check:entstehung`** (`scripts/materialien/check-entstehung.ts`), vier Zusicherungen:
(a) jede Fussnoten-oc eines Historie-Ereignisses ∈ SPARQL-Revisionsliste des Erlasses (§11.3) ·
(b) Anker-Sidecar-sha gegen BBl-HTML · (c) Mantel-Kanten tragen `quelle:'maschinell'` · (d) Deckel
5 MB/Erlass + 25 MB gesamt. **Rot-Beweis je Zusicherung (§6.7):** (a) eine `oc`-URL in einer
Shard-Kopie um eine Ziffer ändern ⇒ rot mit Erlass+Artikel namentlich · (b) ein sha-Byte kippen ·
(c) eine Mantel-Kante auf `amtlich` heben · (d) Deckel testweise auf 1 KB, Ist-Wert melden lassen.
Jeder Beweis vor dem Merge gezeigt und im PR zitiert.

**Landung (§12, seriell):** E1 → E2 → E3 → E4 → E5/E6. E1/E2 **nicht** parallel (beide fassen
`src/lib/materialien/botschaften*.ts` an); parallel: E4 neben E3 (disjunkte Dateien).

## E. Konflikte mit laufenden Strängen

1. **`feat/w2-24-r4-leser` — der harte Konflikt:** der Branch **verschiebt den `data-hist-slot`**
   (gemessen `git diff main...feat/w2-24-r4-leser -- .../ArtikelLeser.tsx`: entfernt Z. 227-229 =
   heutiger Slot, fügt Z. 56-60 den Slot mit Bedingung `histInRand` ein, Kommentar «Verlagert wird
   der SLOT samt `data-hist-slot`, nicht sein Inhalt»). E3 baut auf genau diesen Slot ⇒ **E3 erst
   nach r4-leser**, sonst Handauflösung eines Konflikts in der CLS-tragenden Zeile (§1).
2. **`feat/w2-24-r6`** fasst als einziger `parts/ArtikelHistorie.tsx` **und** `inhalt-hooks.tsx` an ⇒
   zweiter Blocker für E3. **Alle neun W2·24-Branches** fassen `src/index.css` an ⇒ E3 ändert kein css.
3. **W2·5l M15/M16:** §11.6 erklärt M15 und den M16-Datenanteil für **absorbiert** — in `ROADMAP.md`
   heute nicht markiert, sonst baut jemand dasselbe zweimal (**offen**).
4. **W2·7-VZUI / QS-PERF Register-Schnitt:** `register.json` bei 757 KB gegen 780 KB Budget
   (`scripts/check-perf-budget.ts:96-98`, 97 %) ⇒ die Entstehung fasst `register.json` nicht an —
   dafür die Bauzeit-Auflösung `botschaftKey` (B/1).
5. **W2·5n Bund-Vollabdeckung:** jeder neue Bund-Erlass erzeugt automatisch einen Historie- und
   künftig einen Synopse-Shard ⇒ der 25-MB-Deckel wächst mit dem Korpus und gehört mit Ist-Wert in
   `check:entstehung`, nicht als stiller Grenzwert.

**Entkopplung:** E1/E2/E4/E5 berühren **keine einzige** Datei der W2·24-Branches (Schnittmenge leer,
geprüft mit `git diff --name-only main...<branch>`) ⇒ **Daten-Etappen sofort und parallel zu W2·24;
nur E3 wartet** — deckt sich mit der Fahrplan-Empfehlung (Z. 195).

## F. Aufwand, Reihenfolge, offene Fragen

| E | Sessions | gegenüber §11.6 |
|---|---|---|
| E1 | 1–2 | wie Fahrplan |
| E2 | **2–3 statt 4–5** | Historie-Shard trägt oc/fga/Absatz bereits (§0); Rest = `botschaftKey` + Anker |
| E3 | 2–3 | Slot + CLS-Mechanik existieren; Wartezeit auf W2·24 nicht eingerechnet |
| E4 | 3 | wie Fahrplan |
| E5 | 5–7 | Deckel ist das Risiko, nicht der Parser |
| E6 | 3–4 | nach E5 billiger (gleiche Shard-Mechanik) |

**Reihenfolge:** E1 → E2 (parallel zu W2·24) → **E3 nach r4-leser + r6** → E4 → E5 → E6.

**Offene Architekturfragen:** (1) Praxis-Segment im Lesefluss = Kanten-Shard-Fetch für jeden Leser —
Zeile wörtlich bauen oder Praxis erst nach dem Aufklappen? (Empfehlung: nach dem Aufklappen.) ·
(2) Anker-Sidecars in die `check:paritaet`-Ingest aufnehmen oder die Lücke in `check:entstehung`
benennen? · (3) `check:perf-budget`: Einzel-Einträge oder Verzeichnis-Deckel (heute nur Einzeldateien,
Z. 99-127)? · (4) wird `public/verzahnung/artikel-revisionen/**` (1.1 MB) nach E2 redundant? Er wäre
dann Teilmenge des Historie-Shards, aber der EntscheidLeser hängt daran (`KontextPanel.tsx:274`,
`EntscheidVerzahnung.tsx:88`) — Rückbau erst nach eigener Messung. · (5) Wer legt die drei
`W2·6c-*`-ROADMAP-Zeilen an, und werden M15/M16 dort als «absorbiert» markiert?
