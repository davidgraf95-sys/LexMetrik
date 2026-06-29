# Gesetzesdarstellung Bund — Master-Fahrplan (Reader-Darstellungs-Sweep)

> **Stand 29.6.2026.** Konsolidierte QA-Sammlung David (eine Session) über die **Darstellung
> der Bund-Gesetze im Reader** — 11 Defekt-/Ausbau-Punkte + eine Architektur-Leitlinie, plus ein
> vollständig erarbeitetes **Tabellen-Regelwerk** (ultracode) und dessen seitenweiten Bund-Umsetzungsplan.
> Dieser Fahrplan ist die **Detailquelle (das «Wie»)**; der Steuer-Slot steht in `ROADMAP.md`
> (Welle 2 · Reader), Layout-/a11y-Regeln in `DESIGN-REGLEMENT-NORMTEXT.md`, Tabellen-Umsetzung
> quer in `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`, Popover in `FAHRPLAN-GESETZESTEXT-POPUP.md`.

---

## ▶ Ausführungs-Protokoll (für jede künftige Bau-Session)

1. **Lies zuerst** `CLAUDE.md` §1–§12, `STRUKTUR.md` (Ist-Stand) und dieses File ganz.
2. **Nimm den obersten offenen Milestone** des aktuell freigegebenen **Batch** (Reihenfolge unten),
   dessen Abhängigkeiten erfüllt sind. **Batch A (Extraktor/Pipeline) zuerst** — er ist konfliktfrei.
   **Batch B (Render) zuletzt** und **abgestimmt mit dem Split-View-Agenten** (`.claude-worktrees/split-view-a`,
   berührt dieselbe `ArtikelBody.tsx`).
3. **Bau in eigenem Worktree** (`feat/normtext-gesetzesdarstellung-bund` bzw. für Tabellen
   `feat/normtext-tabellen-kanonisch`), getrennt von `split-view-a` und `feat/normtext-bund-de`.
   Nicht direkt auf `main` (Direkt-Push geblockt).
4. **Disziplin = Abschnitt «Bau-Methodik» unten** (TDD, strukturerhaltend, golden-gegated, doppelt
   verifizieren). **Verhaltensändernd ⇒ golden byte-gleich + §6.3-Deklaration.**
5. **Markiere erledigt** (Häkchen + Datum hier), zieh die Session-Karte in `STRUKTUR.md` nach.
   **Push/Deploy nicht selbst** — sammeln fürs Batch-Deploy-Fenster; `/deploy-check`-Ritual auf Davids Ja.

---

## L0 · Architektur-Leitlinie (Kopf über allen Punkten)

**Extraktor strukturerhaltend härten statt pro Gesetz patchen.** Die Fedlex-HTML-Struktur ist die
Quelle der Wahrheit und **empirisch einheitlich** (ein XSLT-Generator «legi4ch/c-moria»; siehe
Struktur-Referenz unten). Die Pipeline soll Fedlex-Semantik **treu erhalten** (Tabellen/`colspan`,
Fussnoten-Bezüge, Aufhebungs-Marker, Randtitel-/Gliederungs-Gruppierung, gesetzesübergreifende
Verweise, stabile Anker) statt sie beim Plätten ins reduzierte Snapshot-Schema zu verlieren.
**Jede Defektklasse wird EINMAL in der gemeinsamen Pipeline (Extraktor + Renderer) gelöst → gilt für
alle Bund-Erlasse.** Symptom-Flicken an Einzelartikeln ist nur Notnagel. Alle Punkte 1–11 sind
**Instanzen** dieser Leitlinie.

**Scope durchgehend:** **zuerst nur Bund** (Fedlex-Extraktor `extrahiere-fedlex.ts`). Kantonale
Adapter unberührt. **Der Renderer bleibt abwärtskompatibel** — alte Kanton-`{kopf,zeilen}`/Altschema
dürfen nicht brechen. Kanton-Nachzug = separates Folge-Arbeitspaket nach Bund-Abnahme.

---

## Struktur-Referenz Fedlex-HTML (verifiziert 29.6.2026 — nicht neu recherchieren)

Aus echtem Filestore-HTML von BV, ZGB, OR, StGB, DBG, MWSTG, GebV SchKG, VwVG, ATSG, RPG +
Code-Evidenz des Extraktors. **Einheitliches Template** (Verordnung wie Gesetz identisch);
Abweichungen nur (a) inhaltsgetrieben und (b) generations-/jahrgangsbedingt.

- **⚠️ Filestore-Falle:** Die Fedlex-ELI-Seiten (`fedlex.admin.ch/eli/...`) sind eine **Angular-SPA** —
  `curl`/`WebFetch` darauf liefert nur die leere Shell, **keinen Gesetzestext**. Echten konsolidierten
  Volltext nur über das **Filestore**, dessen URL per **SPARQL** (`fedlex.data.admin.ch/sparqlendpoint`,
  über `jolux:isMemberOf` → neueste `dateApplicability` → DEU-Expression → `userFormat=.../html`)
  aufzulösen ist. Der bestehende Extraktor zieht aus `scripts/fedlex-cache.sh` (`/tmp/<key>.html`).
- **Artikel:** `<article id="art_X">` + Alt-Anker `<a name="aX">`; Nummer-Zeile `<h6 class="heading">`
  mit Selbstlink `<a href="#art_X"><b>Art. X</b></a>`; Körper in `<div class="collapseable">`.
  Bereich-IDs mit Unterstrich (`art_349_358`), Zusätze `art_10a`/`art_12_a`/`_bis`.
- **Absätze:** `<p class="absatz …">`, Absatznummer als führendes `<sup>1</sup>&nbsp;` (kein eigenes
  Feld). Ältere Fassungen ohne `man-space-*`-Klasse → **token-basiert prüfen** (`class` *enthält* «absatz»).
- **Listen/lit./Ziff.:** Definitionslisten `<dl><dt>a. </dt><dd>…</dd></dl>`, Marke im `<dt>`.
  Verschachtelung (lit.→Ziff. und umgekehrt) kommt vor → balanciertes `<dl>`/`<dd>`-Ende.
- **Randtitel/Gliederung (P3):** verschachtelte `<section id=".../lvl_…">` mit
  `<div class="heading" role="heading" aria-level="N">`; Pfad-ID + `aria-level` = exakte Gruppierung.
  **OR nutzt `part_`** als Wurzel-Präfix statt `tit_`. Artikel-Sachtitel teils inline im `<h6>`
  (BV/ZPO/StPO/Verordnungen), bei OR/ZGB nur `Art. N` + separater Section-Randtitel.
- **Fussnoten (P1/P2):** Marker `<sup><a href="#fn-HASH" id="fnbck-HASH">N</a></sup>`; Definition
  `<div class="footnotes"><p id="fn-HASH">…</p></div>` **lokal im `collapseable` des Bezugsblocks**
  → Zuordnung über DOM-Verschachtelung eindeutig. **Präambel-Fussnoten** liegen im `<div id="preamble">`
  → in der Quelle korrekt der Präambel zugeordnet (Extraktor verliert das).
- **Aufgehobene Artikel (P2/P9):** Körper enthält **nur** `<div class="footnotes">`, **kein**
  `<p class="absatz">`; das Wort «Aufgehoben» steht **ausschliesslich im Fussnotentext**
  («Aufgehoben durch …»). Kein eigenes repealed-Attribut. Erkennung: leerer Körper ohne `absatz`
  (+ ggf. Bereich-ID). Neuere Fassungen zusätzlich `class="absatzkurs man-font-style-italic"`.
- **Verweise (P6/P11):** **intern** = `href="#art_…"`/`#fn-…`; **extern** = absolute URL +
  `target="_blank"`, meist ELI (`/eli/cc/…`=SR-Gesetz, `/eli/oc/…`=AS, `/eli/fga|fla/…`=BBl).
  Neuere Fassungen tragen **maschinenlesbares `data-rs`** am SR-Verweis (StGB 92×, DBG 43×); ältere
  (MWSTG, ATSG) **kein `data-rs`** → ELI aus `href` als Fallback. **→ Auflösung über ELI/`data-rs`,
  nie Text-Heuristik** (das ist der Fix für den falschen ZGB→BVG-Verweis).
- **Tabellen (P10):** echte `<table border="1">`, in `<p><div class="table">…</table></div></p>`
  geschachtelt (formal ungültig — Parser-Falle). **Zwei Markup-Welten:** (A) `<th>`-Kopf —
  bei GebV SchKG Art. 20 trägt **nur der Kopf** `colspan="3"` (2 `<th>` → physisch 6 Spalten),
  die 6 Datenzellen sind nackte `<td>` **ohne colspan** → der th-Pfad ignorierte colspan → Kopf 2 ≠
  Zeile 6 = zerrissen. (B) `<td class="man-template-tab-kpf">`-Kopf mit colspan auf Kopf UND Daten
  (Art. 30). Betragsspalte rechtsbündig via `man-template-tab-krpr-r`. **Tausendertrenner = `&nbsp;`**
  in der Zahl (`1&nbsp;000`); Beträge `10.–`/`25.–` (Gedankenstrich «–»). Kein `rowspan`.

---

## Die 11 Punkte (Milestones)

> Legende je Punkt: **Quelle** (Fedlex-Element) · **Root-Cause** · **Soll** · **Datei(en)** · **Gate** ·
> **Batch**. Alle `[OF]` (keine Davids-Fachzeit nötig), Scope zuerst Bund.

### M1 · Präambel-Fussnoten richtig zuordnen — Batch A
- [ ] **Quelle:** Fussnote im `<div id="preamble">` (BV). **Root-Cause:** Extraktor verliert das
  Präambel-Scoping → Fussnote landet bei Art. 1. **Soll:** Präambel-Fussnoten der Präambel zuordnen.
  **Datei:** `scripts/normtext/kopf-extrahiere.ts` / `fussnoten-extrahiere.ts`. **Gate:** Snapshot-Test
  BV-Präambel (Fussnote ≠ Art. 1).

### M2 · Fussnoten einheitlich erst auf Klick — Batch B (Render)
- [ ] **Quelle:** Aufhebungs-Text ist eine `<div class="footnotes">`. **Root-Cause:** bei aufgehobenen
  Artikeln wird die Aufhebungs-Fussnote dauerhaft gezeigt, sonst erst auf Klick. **Soll (Entscheid
  David 29.6.):** **alle** Fussnoten — inkl. der Aufhebungs-Zitatzeile «Aufgehoben durch … (AS …)» —
  click-to-reveal, einheitlich hinter dem Fussnoten-Schalter. **ABER** die **Statuszeile «· aufgehoben»
  bleibt immer sichtbar** (Artikelzustand, nicht Fussnote — versöhnt mit Reglement §4/28.6.). **Datei:**
  `ArtikelBody.tsx`. **Gate:** Render-Test (Status sichtbar, «Aufgehoben durch …» erst nach Klick).

### M3 · Randtitel-/Gruppierungslinien für jedes Gesetz + Umschalter — Batch B (Render)
- [ ] **Quelle:** `<section id=".../lvl_…">` + `aria-level` (OR: `part_`). **Root-Cause:** Linien heute
  nur bei manchen Gesetzen; keine Umschaltmöglichkeit. **Soll:** (a) Gruppierungslinien aus der
  Section-Schachtelung für **jedes Bund-Gesetz** ableiten; (b) **An/Aus-Umschalter pro Gesetz**
  (zustandslos). **Datei:** Struktur-Sidecar (`struktur-extrahiere.ts`, falls Info fehlt) +
  `ArtikelBody.tsx`/Reader. **Gate:** visuell (ZGB/OR-Parität) + Toggle-Test.

### M4 · Suche + Gliederung responsiv überarbeiten — Batch C
- [ ] **Root-Cause:** auf schmalem Viewport verdeckt die Gliederung das Suchfeld / die gefundenen
  Artikel. **Soll:** Zusammenspiel **Suche ↔ Gliederung ↔ Normtext je Breakpoint** neu durchdenken
  (Overlay/Drawer-Verhalten mobil). **Datei:** Reader-Shell / Such-/Gliederungs-Komponenten.
  **Gate:** Playwright-Breakpoints (Bash, nicht MCP). *Symptom-Beleg:* Screenshot 10:14:31.

### M5 · Gliederung + Suche kompakt zum Header — Batch C
- [ ] **Root-Cause:** Abstand/Ausrichtung lose, schliessen nicht kompakt an den Header an.
  **Soll:** bündig/kompakt zum Header. **Datei:** Reader-Layout. **Gate:** visuell. (Regel →
  `DESIGN-REGLEMENT-NORMTEXT.md`.)

### M6 · Verweis Art. 89a Abs. 6 ZGB → BVG korrekt auflösen — Batch A + D
- [ ] **Quelle:** ELI/`data-rs` am Verweis; intern `#` vs. extern ELI. **Root-Cause:** Auflösung per
  Text-Heuristik landet intern im ZGB statt im BVG. **Soll:** gesetzesübergreifende Verweise über
  **ELI/`data-rs`/href** auflösen (Fallback ELI aus href bei fehlendem `data-rs`). **Datei:**
  Norm-Resolver + Extraktor (Verweis-Erfassung). **Gate:** Test «Art. 89a VI ZGB → BVG»; mutmasslich
  ganze **Klasse** intern/extern-Fehlauflösung.

### M7 · Nach Suche abgeschnittenes Gesetz — Batch C
- [ ] **Root-Cause:** Sprung-/Scroll-Position nach Suche; Sticky-Header verdeckt den Treffer, Text
  wirkt oben abgeschnitten (Geistertext). **Soll:** korrektes Scroll-Offset unter den Sticky-Header.
  **Datei:** Reader-Scroll/Such-Logik. **Gate:** Repro-Test (Screenshot 10:14:31).

### M8 · Suchbegriff im Normtext hervorheben — Batch C
- [ ] **Root-Cause:** Treffer wird nicht markiert. **Soll:** gesuchtes Wort im Normtext hervorheben.
  **Datei:** Such-/Reader-Render. **Gate:** Test (Markup-Highlight bei Suche).

### M9 · Aufgehobene Artikel auf gleicher Ebene — Batch B (Render)
- [ ] **Quelle:** aufgehobener Artikel = leerer Körper + Aufhebungs-Fussnote. **Root-Cause:**
  Einrückung/Ausrichtung weicht von aktiven Artikeln ab. **Soll:** bündig auf gleicher Ebene.
  **Datei:** `ArtikelBody.tsx`. **Gate:** Render-Test (Art. 349–358/359 ZGB bündig zu Art. 348).

### M10 · Tabellendarstellung — Regelwerk + seitenweite Bund-Umsetzung — Batch A (Generator) + B (Render)
- [ ] **Status:** **Regelwerk T-A…T-F + Umsetzungsplan vollständig erarbeitet** (Anhang 1 + 2 unten).
  **Root-Cause:** `<th>`-colspan ignoriert → Kopf ≠ Zellzahl; **~60 Defekt-Blöcke / 28 Bund-Erlasse**
  (4 Klassen). **Soll:** rechteckiges, typisiertes `spalten`-Modell, colspan in beiden Markup-Varianten
  expandieren, Staffel-Spanne deterministisch zu **einer** lesbaren Zelle verdichten, harte Invariante
  **kopf == zellzahl**, wortlauttreu, im Zweifel Text-Fallback. **Dateien:** `extrahiere-fedlex.ts`,
  neues `scripts/normtext/tabelle-normalisieren.ts`, `src/lib/normtext/typen.ts`, `ArtikelBody.tsx`,
  28 Bund-Snapshots. **Gate:** neuer `check:tabellen`-Validator (blockierend, zuerst nur Bund) +
  golden byte-gleich + §6.3-Deklaration. **Detail = Anhang 1 (Regelwerk) + Anhang 2 (Plan); Umsetzung
  quer in `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`.**

### M11 · Verweis-Popup (Norm-Vorschau) + Artikel-Bezeichnung — Batch D
- [ ] **Quelle:** Popover-Infra besteht (`FAHRPLAN-GESETZESTEXT-POPUP.md`); `data-rs`/ELI + `<h6>`-Sachtitel.
  **Soll:** (a) bei einem gesetzesübergreifenden Verweis erscheint ein **Popup mit Norm-Vorschau**
  (Testfall: Art. 24 GebV SchKG → Art. 112/113 SchKG); (b) die Vorschau enthält die **Artikel-Bezeichnung**,
  z. B. **«Art. 113 SchKG – Nachträge»** (Sachtitel aus `<h6>`/Section). **Datei:** Popover-Pfad +
  Resolver (teilt M6). **Gate:** Test (Popup entsteht; Titel enthält Sachüberschrift).

---

## Ausführungs-Reihenfolge (Batches — Hebel × Sicherheit, konfliktfrei zuerst)

- **Batch A — Extraktor/Pipeline (konfliktfrei, golden-gegated, sofort startbar):**
  **M10-Generatorteil → M1 → M6-Datenteil.** Regeneriert nur betroffene Bund-Snapshots; `git diff --stat`-Wächter.
- **Batch B — Render (geteilt mit Split-View auf `ArtikelBody.tsx` → koordinieren/zuletzt):**
  **M10-Render → M2 → M9 → M3.**
- **Batch C — Suche + Reader-Layout:** **M4 → M5 → M7 → M8.**
- **Batch D — Popover:** **M11 + M6-Renderteil.**

---

## Bau-Methodik (das «Wie», gilt für jeden Batch)

1. **Strukturerhaltend (L0).** Immer am genannten Fedlex-Element ansetzen (siehe Struktur-Referenz),
   nie am Einzelartikel flicken. Token-basierte Klassenprüfung (Whitespace-Dialekte!).
2. **TDD + reine Module (§3).** Logik in UI-freie, getestete Helfer (z. B. `tabelle-normalisieren.ts`);
   Fixtures/Goldtests **zuerst** (Leitfall Art. 20), dann Implementierung. Renderer = dumme Projektion.
3. **Feste Reihenfolge je verhaltensänderndem Schritt:** Golden-Schnappschuss sichern → Korpus-Report
   (rot-by-design) → Schema **additiv** → Generator-Helfer mit TDD → verdrahten → **einmal** regenerieren
   (nur betroffene Bund-Snapshots, `git diff --stat`-Wächter) → Render zuletzt → Validator scharf schalten.
4. **Wortlauttreue + Golden (§7/§6.3).** Nur amtliche Token konkatenieren, nie ändern/erfinden;
   `npm run gate` grün; verhaltensändernd ⇒ **golden byte-gleich + deklarierte §6.3-Änderung +
   Byte-Diff-Beweis**; `check:tabellen` blockierend (zuerst nur Bund, Kanton im Report-Modus).
5. **Doppelt verifizieren (Davids Direktive).** Adversariale Bug-Check-Agenten + Stichprobe je
   Defektklasse **visuell gegen die Fedlex-Quellseite** (Playwright **via Bash**, nicht MCP-Screenshot);
   bei Drift-Verdacht `check:fedlex-versionen` als Currency-Arbiter.
6. **Isolation + Koordination (§12).** Eigener Worktree; Generator-Teil läuft konfliktfrei vor,
   **Render-Teil (`ArtikelBody.tsx`) abgestimmt mit dem Split-View-Agenten** (wer zuerst merged, der
   andere rebaset — nicht blind parallel). Schema-Änderung **additiv**, damit der Split-View-Branch
   nicht durch einen Typbruch rot wird.
7. **Abschluss.** Häkchen + Datum hier, Session-Karte in `STRUKTUR.md`; **Push/Deploy nicht selbst** —
   fürs Batch-Fenster sammeln, `/deploy-check`-Ritual auf Davids Ja.

---

## Verifikations-Status (29.6.2026)
- Fedlex-Struktur-Konsistenz: **verifiziert** (4 Agenten über 10 Erlasse + Extraktor-Code-Evidenz).
- Tabellen-Regelwerk: **erarbeitet** (ultracode, 8 Agenten) — Anhang 1/2.
- **Noch NICHT gebaut.** Kein Produktionscode. Abnahme der Soll-Darstellung durch David erfolgt beim
  Bauen/Ausprobieren (nicht vorab «verified» setzen).

---

## Anhang 1 — TABELLEN-REGELWERK (kanonische SSoT, T-A…T-F)

> Erarbeitet per ultracode (8 Agenten), abgeglichen mit der verifizierten Filestore-HTML-Struktur.
> Übernahme: Abschnitte C/D/E → `DESIGN-REGLEMENT-NORMTEXT.md`; A/B/F → `FAHRPLAN-TARIF-TABELLEN-STUFE2.md`.

# REGELWERK — Tabellendarstellung in Gesetzen (Bund) — KANONISCHE SSoT

Konsolidiert aus 3 Entwürfen (extraktion-first, render-robust, schema-vertrag) + Diagnose-Korpus. Leitfall durchgehend: **Art. 20 GebV SchKG** (`public/normtext/bund/GEBV_SCHKG.json` eintraege[24]; Quell-HTML: Kopf 2× `<th colspan=3>`, Datenzeilen 6 colspan-lose `<td>`, Forderungs-Spanne über 5 Zellen `[präfix, von, spacer, "bis", bis]` + Gebühr als 6. Zelle). Geltende Reglements: §1 (im Zweifel Text), §2 (kein Raten), §3 (Render von Logik getrennt), §6 (Golden/Drift), §7 (Wortlauttreu), §8 (Ehrlichkeit), §13 (Design-Tokens).

## AUFGELÖSTE KONFLIKTE (explizit)

- **K1 — Wo geschieht die Span-Verdichtung? Generator, NICHT Renderer.** render-robust (R6/R7) wollte Verdichtung renderseitig, extraktion-first + schema-vertrag generatorseitig. **Entscheid: Generator** (§3 Schichtung, einzig gate-bar/golden-prüfbar). Faithfulness bleibt gewahrt, weil die `bereich`-Zelle nur eine deterministische Konkatenation **unveränderter amtlicher Token** ist (T-E2) und der Golden-Gate sie als deklarierte §6.3-Änderung dokumentiert (T-F2). Der Renderer bleibt dumme Projektion und *heilt nie*, sondern *degradiert nur* (T-E5).
- **K2 — colspan-Metadaten im Snapshot mitführen ODER auflösen? Auflösen + typisiertes Schema.** render-robust (R2) wollte `span` im JSON behalten. **Entscheid: schema-vertrag-Modell** — Generator löst colspan vollständig auf und legt ein typisiertes, rechteckiges `spalten`-Modell ab; kein `span`-Feld im Snapshot. Begründung: Ein „kluger" Renderer mit span-Logik kaschiert die Defektklasse, statt sie gate-bar zu heilen.
- **K3 — Fedlex-Gruppierung 3/3 vs. echte Semantik 5/1.** Ground Truth: Fedlex gruppiert visuell 3/3, die lesbare Soll-Form ist 5/1 (Forderung | Gebühr). **Entscheid: Verdichtung zu 2 Spalten (5/1) ist erlaubt** als deterministische Struktur-Abbildung amtlicher Token, nicht als geratene Spalten-Neudefinition; greift nur bei exakter Signatur (T-A6), sonst Rohraster/Fallback.
- **K4 — Defektmenge.** Naive Messung 32 (Klasse 1) maskiert 30 empty-padded Köpfe (Klasse 2). **Verbindlich: beide zählen**, wahre Zielmenge ~60 Blöcke → 0.

---

## (A) Extraktions-/Normalisierungs-Regeln
Ort: `scripts/normtext/extrahiere-fedlex.ts` (`parseFedlexTabelle` :402–443, `zeileMitColspan` :374–383, Branch-Gate `hatTh` :403).

- **T-A1 — Normalisierung gehört ausschließlich in den Generator.** Colspan-Auflösung, Phantomspalten-Entfernung, Span-Verdichtung und Breitenabgleich finden im Extraktor statt; der Renderer empfängt ein bereits rechteckiges, typisiertes Modell. *Begründung:* §3-Schichtentrennung, nur der Snapshot ist golden-gate-bar (K1).
- **T-A2 — colspan IMMER lesen und expandieren, in beiden Markup-Varianten.** `zeileMitColspan` läuft auf Kopf UND Daten jeder `<tr>`, egal ob `<th>` (Art. 20) oder `<td class=tab-kpf>` (Art. 30). *Begründung:* Variante (A) ruft die Expansion heute nie auf (:411/:416) und erzeugt so kopf=2 vs. zeilen=6.
- **T-A3 — `hatTh` darf NICHT über colspan-Ignorieren entscheiden.** Die `<th>`/`<td>`-Unterscheidung dient nur noch der Kopf-Erkennung, nie der colspan-Behandlung. *Begründung:* Die Annahme „bei `<th>` tragen Kopf UND Daten dieselben colspan" (BVG-Stil) ist bei Art. 20 falsifiziert — dort trägt **nur** der Kopf colspan.
- **T-A4 — Kopf robust über drei Marker erkennen.** Kopfzeile = enthält `<th>` ODER jede nicht-leere Zelle trägt `man-template-tab-kpf`/`-kpf-r`; beide Wege liefern denselben kanonischen Kopf. *Begründung:* Fedlex nutzt zwei Markup-Welten (Art. 20 vs. Art. 30), beide müssen rechteckig konvergieren.
- **T-A5 — Mehrere Kopfzeilen spaltenweise verbinden, Schrägstrich-Literale nicht splitten.** Bei zwei Kopf-`<tr>` werden je Spalte die nicht-leeren Texte mit Leerzeichen verbunden; „Forderung/Franken" bleibt EIN Zellwert. *Begründung:* §8/G19 — obere Kopfzeile darf nicht verloren gehen, „/Franken" ist Literaltext, keine zweite Spalte.
- **T-A6 — Staffel-Spanne nach abgeschlossener Grammatik zu EINER `bereich`-Zelle verdichten.** Nur diese exakten Signaturen werden zusammengefasst, sonst keine Verdichtung: `["","",*,"bis",bis]`→„bis {bis}"; `["über",von,*,"bis",bis]`→„über {von} bis {bis}"; `["über",von,*,"",""]`→„über {von}". *Begründung (Art. 20):* row1→„bis 100", row2→„über 100 bis 500", row7→„über 1 000 000"; bei Nicht-Treffer lieber Rohraster als Raten (§2).
- **T-A7 — Phantom-/Spacer-Spalten generatorseitig streichen.** Eine Spalte, die in Kopf UND allen Datenzeilen `""` ist, wird aus Modell entfernt. *Begründung:* Art. 20 Spalte 2 (immer leer) erzeugt sonst eine `px-3`-gepolsterte Leerspalte (Defektklasse 3, 8 Blöcke); bei T-A6 entfällt sie ohnehin.
- **T-A8 — rowspan / verschachtelte `<table>` werden NICHT zerlegt → Fallback.** Findet der Generator rowspan oder eine Zell-`<table>`, degradiert er nach T-E4 plus Telemetrie. *Begründung:* §2 — das flache `string[][]`-Modell deckt bewusst kein Zell-Merge; Raten verboten.
- **T-A9 — Gleiche Klasse, gleiche Regel.** T-A2–A7 gelten identisch für die strukturgleichen Spannen GEBV Art. 16/19/30/37/48, AHVV Art. 21/52, IVV Art. 1bis, EOV Art. 36, DBG Art. 36. *Begründung:* Art. 20 ist Prototyp von ~30 Blöcken, kein Einzelfall.

---

## (B) Daten-Schema / Invarianten
Ort: `src/lib/normtext/typen.ts:42-50`.

- **T-B1 — Kanonisches Modell mit explizitem Spalten-Vektor.** `mehrspaltig` wird zu `{ spalten: Array<{typ:'bereich'|'zahl'|'text'|'betrag'; titel:string}>, zeilen: string[][] }`; `N = spalten.length` ist die **einzige** Quelle der Spaltenzahl. *Begründung:* Ersetzt die Bug-Heuristik `Math.max(...)` (`ArtikelBody.tsx:220`), die bei Art. 20 N=6 aus 2 logischen Köpfen erzeugt.
- **T-B2 — Kern-Aritäts-Invariante.** Für jeden emittierten Block gilt zwingend `spalten.length === N` und `∀i: zeilen[i].length === N`. *Begründung:* Genau dieser Bruch (Art. 20: Kopf 2 ≠ Zeile 6) erzeugt die Fehlausrichtung; rechteckiges Raster macht Renderer-Verschiebung unmöglich. **Nicht verhandelbar.**
- **T-B3 — Auffüllen/Trimmen nur generatorseitig, nie im Renderer.** Jede Breitenanpassung geschieht beim Modellbau; das Renderer-`padZeile` (`:221-225/247`) entfällt. *Begründung:* Renderer-Padding maskiert den Aritätsbruch und verschiebt den Kopf, statt zu heilen.
- **T-B4 — Spaltentyp ist fix und steuert Ausrichtung+Format.** `text`=links/keine Zahl-Formatierung; `zahl`=rechts/Tausender/keine Währung; `betrag`=rechts/Tausender/Währungsform `.–`; `bereich`=links/keine Umsortierung/trägt verdichtete Spanne. *Begründung:* Ersetzt die quellabhängig fragile Inhalts-Heuristik `spalteNumerisch` (S4: eine Staffel ganz <1 000 kippt links).
- **T-B5 — `tabelle` ist Kurzform von T-B1, nie zweite Wahrheit.** `tabelle` (2-spaltig Beschreibung|Betrag) bleibt als Alias für `spalten:[{text},{betrag}]` zulässig, erfüllt aber dieselben Invarianten; im Bund-Korpus ungenutzt (0 Blöcke), Neubau bevorzugt `spalten`. *Begründung:* §5/§10 — ein Tabellenbegriff.
- **T-B6 — Genau ein Tabellenfeld pro Block.** Ein Block trägt `mehrspaltig` ODER `tabelle`, nie beide; `items`/`text` daneben erlaubt (Vortext leer bei tabellisiertem Block). *Begründung:* verhindert konkurrierende Render-Pfade mit widersprüchlichem Inhalt.

---

## (C) Render-/Layout-Regeln
Ort: `src/components/normtext/ArtikelBody.tsx` (`MehrspaltigeTabelle` :219-272, Eintritt :380).

- **T-C1 — Renderer ist dumme Projektion von `N = spalten.length`.** Spaltenzahl, Ausrichtung und Kopf kommen aus dem Modell; keine Heuristik in der View. *Begründung:* §3; verhindert Wiederholung von `:220`.
- **T-C2 — Ausrichtung folgt dem Spaltentyp, einheitlich für Kopf + alle Zellen.** `text`/`bereich` links, `zahl`/`betrag` rechts; nie pro physischer Teilzelle. *Begründung:* beseitigt das zellweise Alternieren „über links / 500 rechts / bis links" innerhalb der Forderungs-Spanne (S3).
- **T-C3 — Zahlkolonnen mit `tabular-nums`.** `zahl`/`betrag`-Spalten setzen `font-variant-numeric:tabular-nums`. *Begründung:* Gebühren „10.– / 25.– / 400.–" fluchten stellenrichtig.
- **T-C4 — Tausendertrenner & Währung sind reine Renderer-Anzeige, nie im Snapshot.** `gruppiereTausender` (`:264`) macht „1 000"→„1'000" zur Anzeige; Snapshot behält „1 000" (geschütztes Leerzeichen) und „10.–" (en-dash) byte-treu. *Begründung:* §7 — maßgeblich ist die amtliche Quelle.
- **T-C5 — Tausender-Gruppierung nur in `zahl`/`betrag`, nicht über jede Zelle.** Typgesteuert statt heute global (`:259-263`). *Begründung:* verhindert Fehlgruppierung von Jahr/Referenz-Zahlen.
- **T-C6 — Kopf visuell + semantisch abgesetzt, nur über Tokens.** Kopfzeile mit `bg-paper-sunken/40`, `font-medium`, `role="columnheader"`; keine Magic-Numbers/Ad-hoc-Farben. *Begründung:* §13 — Kopf muss als Kopf erkennbar sein, nicht als erste Datenzeile.
- **T-C7 — Einzelne Leerzelle bleibt erhalten, nur ganze Leerspalten entfallen.** Eine in nur manchen Zeilen leere Zelle (Matrix-Eckzelle AHVV Art. 56bis `["","0"…"11"]`, fehlendes „über" in „bis 100") bleibt `""`. *Begründung:* §1 — teils leere Spalte kann bedeutungstragend sein; nur die nachweislich vollständig leere ist Artefakt (T-A7).

---

## (D) Responsive & a11y

- **T-D1 — Horizontale Scroll-Kapsel statt Spaltenquetschen.** Tabelle in `overflow-x-auto` (`:239`); auf schmalem Viewport seitlich scrollen, nie umbrechend zerquetschen. *Begründung:* nach T-A6 hat Art. 20 nur 2 Spalten → passt meist ohne Scroll; Lesbarkeits-Direktive.
- **T-D2 — Zahlspalten nicht umbrechen.** `zahl`/`betrag`-Zellen `whitespace-nowrap`. *Begründung:* „1'000'000" / „400.–" dürfen nicht mitten in der Zahl umbrechen (vgl. Lektion „zerrissene Abkürzungen").
- **T-D3 — Optionale Stack-/Kartenansicht nur mit korrektem Kopf-Bezug.** Bei gestapelter Mobil-Darstellung trägt jede Wertzeile ihr `spalten[i].titel`-Label. *Begründung:* Stack ohne Kopfbezug reproduziert die Leitfall-Verschiebung im Kleinen.
- **T-D4 — Vollständige, aritäts-konsistente ARIA-Semantik.** `role="table"/row/columnheader/cell`; je Datenzeile genau `N` `cell` zu `N` `columnheader` (folgt aus T-B2); Scroll-Wrapper `role="group" tabIndex=0 aria-label`. *Begründung:* Art. 20 (2 Header/6 Zellen) liest heute „Gebühr/Franken: 500" falsch vor.
- **T-D5 — Verdichtete Spanne ist eine `cell`.** Nach T-A6 liest der Screenreader „über 100 bis 500, 25.–", nicht „über, 100, leer, bis, 500, 25.–". *Begründung:* das zerstreute 6-Zellen-Raster ist auch akustisch zerrissen.
- **T-D6 — Headerless (`spalten` mit `titel:''`) ohne `columnheader`-Rollen, aber mit Tabellensemantik.** Phantomspalten (T-A7) erzeugen keine leeren `cell`-Knoten. *Begründung:* §13/WCAG; keine bedeutungslose „Spalte 3 von 6"-Ansage.
- **T-D7 — Kontrast & Fokus über Tokens.** Trennlinien `border-line`, Kopf-Hintergrund + Fokus-Outline ≥ 3:1 in Hell und Dunkel. *Begründung:* §13/F — Fokus über Outline, nicht Farbe allein.

---

## (E) §7-Faithfulness & §1-Fallback
Fallback-Helfer: `src/lib/normtext/darstellung.ts:250-257`.

- **T-E1 — Wortlaut-Invariante je Zelle.** Der gespeicherte String ist exakt der amtliche Zellinhalt bzw. die deterministisch zusammengesetzte Spanne (T-A6); kein erfundenes/umformuliertes Wort, kein „CHF"/„bis und mit". *Begründung:* §7 — Snapshot bleibt golden-byte-gleich gegen Fedlex bewertbar.
- **T-E2 — Verdichtung ist rein konkatenierend und verlustfrei.** Nur vorhandene amtliche Token (100, 500, 1 000 000, „über", „bis", 25.–) in Lesereihenfolge mit Leerzeichen verbunden; nur Spacer-Zelle und das Wort „bis" verschmelzen lesbar. *Begründung:* §7 — Beträge bleiben byte-identisch enthalten, nur die Rasterung ändert sich (löst K1).
- **T-E3 — Anzeige ≠ Wert.** Tausender-Apostroph und Währungsdarstellung sind Renderer-Layer (T-C4), nie Snapshot. *Begründung:* §7 — Formatierung darf den gespeicherten amtlichen Wert nicht überschreiben.
- **T-E4 — Definierte Degradations-Kaskade Tabelle → Fliesstext.** Lässt sich T-B2 nicht herstellen (Aritätsbruch nach Expansion, unbekannte Span-Signatur, rowspan/Verschachtelung), legt der Generator KEIN `mehrspaltig` ab, sondern Text-/`items`-Block mit Hinweis auf den amtlichen Quell-Link. *Begründung:* §1 „im Zweifel als Text"; heute rendert `mehrspaltig` immer ein Gitter sobald `zeilen.length>0` (`:380`), ohne Fallback.
- **T-E5 — Renderer verteidigt defensiv, heilt aber nie.** Empfängt der Renderer trotz Gate einen aritätsverletzenden Block, rendert er ihn als linearen Text/Liste (verlustfrei, alle Werte in Quellreihenfolge), wirft keinen Fehler, ist deterministisch — und füllt nie selbst auf. *Begründung:* §3-Robustheit (Minderheitssicht render-robust eingefaltet), ohne die Generator-Heilung zu verlagern.
- **T-E6 — Niemals eine T-B2-verletzende Tabelle ablegen; Fallback ist ehrlich, nicht stumm.** Beim Degradieren wird in der UI offengelegt, dass die Tabelle als Text wiedergegeben ist und die amtliche Rasterform unter dem Quell-Link steht; `TarifTabelle`/`StaffelTabelle` werden NICHT als verdeckter Fallback zweckentfremdet. *Begründung:* §8 — keine weggeglättete Unsicherheit; beide Ersatzformen können die Spanne nicht abbilden (S6).
- **T-E7 — Empty-padded Köpfe sind Defekt, nicht „ok".** Ein Kopf mit ≥1 Leerstring zwischen/nach Captions (`["Streitwert/Franken","","","","Gebühr/Franken",""]`) MUSS aus echtem colspan rekonstruiert (T-A2) oder zur 2-Spalten-Form verdichtet (T-A6) werden. *Begründung:* Defektklasse 2 (30 Blöcke) ist dieselbe verlorene colspan-Gruppierung wie Art. 20, nur von der naiven Messung maskiert.

---

## (F) Tests / Gates
Ort: `src/tests/normtext-fedlex.test.ts` (M7 :206-235, falsche Annahme :268-274), `mehrspaltige-tabelle*.test`, `ArtikelBody.test.tsx`; Validator in `check:normtext`.

- **T-F1 — Snapshot-Validator als blockierendes Gate (`check:normtext`).** Iteriert alle `public/normtext/**.json`, jeden Tabellenblock, asserted: (1) `spalten` vorhanden, `N≥1`; (2) **`∀i: zeilen[i].length === N`**; (3) `typ ∈ {bereich,zahl,text,betrag}`; (4) keine vollständig leere Spalte; (5) kein unverdichteter `bereich`-Rest („über"/„bis" als isolierte Einzelzelle). Bruch = rot, Build stoppt. *Begründung:* genau hier wird „immer richtig" erzwungen; Art. 20 (2 vs. 6) fiele heute durch.
- **T-F2 — Golden-/Drift-Gate byte-gleich, Verdichtung als deklarierte §6.3-Änderung.** Vor Umbau Golden festhalten; unveränderte Tabellen bleiben byte-identisch, geänderte (Art. 20 & Klasse) zeigen genau die neue kanonische Form als deklarierte fachliche Änderung, nicht stiller Drift; `npm run golden:vergleich` im Gate. *Begründung:* §6/§7 — Werttreue beweisen (löst K1-Faithfulness).
- **T-F3 — Korpus-Invariante über alle Bund-Snapshots.** Test über 78 Blöcke/28 Dateien: 0 Aritätsbrüche UND 0 empty-padded Span-Verlust-Köpfe (Defektklassen 1a=5, 1b=27, 2=30). *Begründung:* macht die wahre Defektmenge (~60, nicht 5) messbar und verhindert Rückfall (K4).
- **T-F4 — Art.-20-Goldtest positiv fixiert (Leitfall).** `extrahiereArtikel(GEBV_ART_20,'20')` ⇒ `spalten:[{bereich,'Forderung/Franken'},{betrag,'Gebühr/Franken'}]`, `zeilen:[['bis 100','10.–'],['über 100 bis 500','25.–'],…,['über 1 000 000','400.–']]`; der alte `:206-235`-Erwartungswert (leer-gepaddeter 6-Spalten-Kopf) wird ersetzt. *Begründung:* der heutige M7-Test zementiert exakt Defektklasse 2 — er ist Teil des Bugs.
- **T-F5 — Fixtures pro Markup-Variante und Span-Signatur.** (i) Art. 20 `<th colspan=3>` + nackte `<td>`; (ii) Art. 30 `<td class=tab-kpf colspan>`; (iii) BVG-Form (Kopf+Daten gleiche colspan) → unverändert byte-gleich; (iv) ragged/unbekannte Signatur → Fallback; plus Einzel-Unit `["über","100","","bis","500"]`→„über 100 bis 500", Nicht-Treffer → keine Verdichtung. *Begründung:* die falsche Annahme war in `:268-274` zementiert; jetzt beide Markup-Welten + Fallback gesichert.
- **T-F6 — Render-Invariante als Unit-Test.** `MehrspaltigeTabelle` rendert genau `N` `columnheader` und je Zeile `N` `cell`; bei künstlich gebrochener Arität den Fallback, kein 6-Zell-Gitter; Lint/Test verbietet `Math.max(...zeilen.map(z=>z.length))` (`:220`). *Begründung:* sperrt die Renderer-Selbstheilung (`padZeile`) dauerhaft.
- **T-F7 — Werttreue-Assertion in jedem Tabellentest.** Jeder Fixture-Test prüft, dass alle Quell-Beträge (100, 500, 1 000 000, 10.–, 25.–, 400.–) als unveränderte Teilstrings im Output vorhanden sind. *Begründung:* §7 — „Struktur reparieren" darf nie zu „Wert verändern" entgleiten.
- **T-F8 — Logik in UI-freien, getesteten Modulen (§3).** colspan-Expansion + Span-Erkennung in `scripts/normtext/*` bzw. reiner Funktion; `ArtikelBody.tsx` konsumiert nur das kanonische Modell. *Begründung:* erlaubt DOM-freie Unit-Tests und verhindert versteckte View-Heuristiken.
- **T-F9 — a11y-/Kontrast-Snapshot im Gate.** Ein Render-Test prüft pro Tabellentyp ARIA-Rollen-Vollständigkeit (T-D4), Kopf↔Zelle-Zuordnung des Leitfalls und Tokens-Herkunft der Ausrichtungs-/Kontrast-Klassen. *Begründung:* verhindert, dass eine spätere Stiländerung Semantik oder Lesbarkeit still bricht.

---

## AKZEPTANZKRITERIEN (eine Tabelle ist korrekt dargestellt, wenn:)

1. **Rechteckig:** `spalten.length === N` und jede Datenzeile hat exakt `N` Zellen (T-B2) — visuell genau so viele Spalten wie Kopf-Captions.
2. **Kopf sitzt richtig:** Jede Caption steht über ihren Daten; bei Art. 20 steht „Forderung/Franken" über den Spannen und „Gebühr/Franken" über den Beträgen — kein 4-Spalten-Versatz, keine kopflose Betragsspalte.
3. **Spanne ist eine Zelle:** „über 100 bis 500" erscheint als EIN linksbündiger Wert; „25.–" rechtsbündig in eigener Betragsspalte; keine Phantom-Leerspalte.
4. **Ausrichtung einheitlich pro Spalte:** Text/Bereich links, Zahl/Betrag rechts mit `tabular-nums`; kein zellweises Alternieren.
5. **Werttreu:** Alle amtlichen Beträge/Wörter byte-identisch vorhanden; Tausender-Apostroph/Währung nur Anzeige, Snapshot golden-byte-gleich.
6. **Screenreader korrekt:** Liest „Forderung/Franken: über 100 bis 500; Gebühr/Franken: 25.–" — nicht „Gebühr/Franken: 500".
7. **Mobil:** Seitlich scrollbar, Zahlen brechen nicht um; Stack-Ansicht (falls genutzt) mit korrektem Label.
8. **Gate grün:** `check:normtext`-Validator findet 0 Aritätsbrüche, 0 empty-padded Köpfe, 0 unverdichtete Span-Reste über den gesamten Bund-Korpus; im Zweifel sauberer Text-Fallback statt zerrissenes Gitter.

## ABGEDECKTE DEFEKTKLASSEN (aus Inventar, 78 Blöcke / 28 Dateien)

- **Klasse 1a — Kopf vorhanden, weniger Captions als Zellen (5):** GEBV Art. 16/20, AHVV Art. 28, GEBV Art. 37 (ragged), VTS Art. 94. → T-A2/T-A6/T-B2.
- **Klasse 1b — Headerless `kopf:[]` (27):** FZA Art. 10 (6×), ASYLV2 Art. 22/26/68, VRV, SSV, VTS, VZV, IVV Art. 90, BUEV. → T-B1 (`titel:''` bewusst)/T-D6/T-E4.
- **Klasse 2 — Empty-padded Kopf, von naiver Messung maskiert (30):** GEBV Art. 19/30/45/48, DBG Art. 36, AHVV Art. 21/52, EOV Art. 36, IVV Art. 1bis, VFV Art. 13b, BVG Art. 95. → T-A2/T-A6/T-E7/T-F3.
- **Klasse 3 — Vollständig leere Spacer-Spalte (8):** GEBV Art. 16/19/20/30/37/48, VGKE Art. 4, VTS Art. 94. → T-A7.
- **Klasse 4 — Spannen-Signatur „über/bis als Einzelzellen" (5 GEBV + strukturgleich AHVV/IVV/EOV/DBG):** → T-A6/T-A9/T-D5.
- **Render-Schwachstellen S1–S6:** S1 keine colspan-Logik → T-A2/T-B1; S2 Phantomspalte → T-A7; S3 zellweise Ausrichtung → T-C2; S4 Tausender-Heuristik fragil → T-B4; S5 kein Aritätsschutz → T-B2/T-F1; S6 keine Ersatzform → T-E4/T-E6.
- **Gegenstandslos im Bund-Korpus (Nachweis, kein Fix nötig):** fehlende Tausendertrenner = 0, verklebte Zahl/Buchstabe = 0, colspan-Reste in `tabelle` = 0 (Feld ungenutzt). Bleiben durch T-F1/T-F3 überwacht.

Übernahme nach `DESIGN-REGLEMENT-NORMTEXT.md` (Abschnitte C/D/E) und `FAHRPLAN-TARIF-TABELLEN-STUFE2.md` (Abschnitte A/B/F als Umsetzungs-/Test-Reihenfolge). Schlüsseldateien: `scripts/normtext/extrahiere-fedlex.ts` (A), `src/lib/normtext/typen.ts` (B), `src/components/normtext/ArtikelBody.tsx` (C/D), `src/lib/normtext/darstellung.ts` (E), `src/tests/normtext-fedlex.test.ts` + `check:normtext` (F).
---

## Anhang 2 — SEITENWEITER BUND-UMSETZUNGSPLAN (Tabellen)

I have verified all the key facts. Here is the plan.

---

# SEITENWEITER UMSETZUNGSPLAN — Tabellendarstellung Bund (Regelwerk A–F)

## Verifizierte Ausgangslage (Befund, nicht Annahme)

- **218 Bund-Snapshots** in `public/normtext/bund/*.json`; davon **28 mit `mehrspaltig`-Block**: AHVV, AHVG, ASYLV2, BPV, BUEV, BVG, BV, CHEMRRV, BVV_2, DBG, ELG, ELV, EOV, FZG, GEBV_SCHKG, FZA, GSCHG, IVG, IVV, KLV, KVV, NBV, SSV, VFV, VRV, VTS, VGKE, VZV. **Nur diese 28 Erlasse sind regenerations-relevant.** Feld `tabelle` (Stufe 1) ist im Bund-Korpus ungenutzt (Befund deckt sich mit T-B5).
- **Schema heute** (`src/lib/normtext/typen.ts:46-49`): `tabelle?: {beschreibung,betrag}[]` und `mehrspaltig?: {kopf?: string[]; zeilen: string[][]}`. **Kein `spalten`-Vektor, kein `typ`.** → T-B1 ist ein echtes Schema-Upgrade.
- **Extraktor** ist `scripts/normtext/extrahiere-fedlex.ts`; `parseFedlexTabelle` (:402-443), `zeileMitColspan` (:374-383), Branch-Gate `hatTh` (:403). Variante (A) `<th>` ruft `zeileMitColspan` **nie** auf (Bug T-A2); Variante (B) `tab-kpf` paddet bereits per colspan. Es gibt **keine** Span-Verdichtung und **keine** Phantomspalten-Streichung.
- **Renderer** `MehrspaltigeTabelle` (`ArtikelBody.tsx:219-272`) nutzt `Math.max(kopf?.length, ...zeilen.map(z=>z.length))` (:220) + `padZeile` (:221-225) + Inhalts-Heuristik `istNumerischeZelle`/`spalteNumerisch` — exakt die in C/S beschriebenen Schwachstellen.
- **Snapshot-Generator**: `npm run normtext -- --datum=$(date +%F)` (`scripts/normtext-snapshot.ts`), liest gecachte Fedlex-HTMLs aus `scripts/fedlex-cache.sh` (`/tmp/<key>.html`). `extrahiereArtikel` aus `extrahiere-fedlex.ts` ist die Engine. Es gibt **keinen `--nur`-Filter im Generator selbst** — Filter-Mechanik muss verifiziert/ergänzt werden (siehe §3).
- **Golden-Lage (wichtig):** `npm run golden:vergleich` (`scripts/golden-outputs.ts`) gated **Rechner/Vorlagen**, NICHT die Normtext-Snapshots. Die Byte-Treue der Snapshots wird über das **`sha`-Feld je Snapshot + git-Diff** gesichert; `check:normtext` (`scripts/normtext/check-drift.ts`) prüft nur `fassungsToken`/Vollständigkeit, **nicht** Tabellen-Arität. → Der T-F1-Validator ist **neu** zu bauen.
- **Gate-Kette**: `npm run gate` = `tsc -b` · `vitest` · `golden:vergleich` · (voll: `lint` · `check`). `check` enthält `check:normtext` + `check:smoke`.
- **Worktrees aktiv:** Haupt-Repo `/Users/david/Developer/LexMetrik` auf `main`; `.lexmetrik-wt` auf `feat/normtext-bund-de`; **`.claude-worktrees/split-view-a` auf `feat/split-view-strang-a`** — der Parallel-Agent berührt mit hoher Wahrscheinlichkeit `ArtikelBody.tsx`. Kollisionsrisiko bestätigt.

---

## 1. Datei-Ebene (Generator vs. reine Render-Änderung)

**A — Schema (Vertrag, beide Schichten):**
- `src/lib/normtext/typen.ts` — `mehrspaltig` zu T-B1-Modell erweitern: `{ spalten: {typ:'bereich'|'zahl'|'text'|'betrag'; titel:string}[]; zeilen: string[][] }`. **Migrations-Politik wählen:** Variante 1 (sauber) ersetzt `{kopf,zeilen}`; Variante 2 (additiv) führt `spalten` neu ein und lässt `kopf?` als Deprecated-Alias bis alle 28 regeneriert sind. **Empfehlung: additiv mit hartem Validator**, damit Render+Snapshot nie gleichzeitig brechen.

**B — Generator-Änderung (regeneriert Snapshots, golden-relevant):**
- `scripts/normtext/extrahiere-fedlex.ts` — Kern. `parseFedlexTabelle` + `zeileMitColspan` + neue reine Funktionen für: colspan-Expansion in BEIDEN Varianten (T-A2/A3), Mehrfach-Kopf-Merge + Schrägstrich-Schutz (T-A4/A5), Span-Verdichtung nach abgeschlossener Grammatik (T-A6), Phantomspalten-Streichung (T-A7), Typ-Inferenz pro Spalte (T-B4), rowspan/nested-table → Fallback (T-A8/T-E4). **Diese Logik in UI-freie, einzeln testbare Helfer auslagern** (T-F8) — z.B. neues Modul `scripts/normtext/tabelle-normalisieren.ts`, von `extrahiere-fedlex.ts` konsumiert.
- `src/lib/normtext/darstellung.ts` (:250-257) — Degradations-Helfer für T-E4/T-E6 (Tabelle→Text/`items` mit Quell-Link-Hinweis), falls dort die Fallback-Form lebt.

**C — Reine Render-Änderung (kein Snapshot-Touch):**
- `src/components/normtext/ArtikelBody.tsx` — `MehrspaltigeTabelle` auf dumme Projektion umbauen: `N = spalten.length` (T-C1), Ausrichtung typgesteuert (T-C2/B4), `tabular-nums` nur `zahl`/`betrag` (T-C3/C5), `gruppiereTausender` nur in `zahl`/`betrag` (T-C4/C5), `padZeile`+`Math.max`+`spalteNumerisch` **entfernen** (T-B3/F6), defensiver Linear-Fallback bei Aritätsbruch (T-E5), ARIA nach T-D4/D5/D6, `overflow-x-auto`/`whitespace-nowrap` (T-D1/D2). `TarifTabelle`/`StaffelTabelle` NICHT als Fallback zweckentfremden (T-E6).

**D — Tests/Gates:**
- `src/tests/normtext-fedlex.test.ts` (M7 :206-235 + falsche Annahme :268-274 ersetzen), `src/tests/mehrspaltige-tabelle.test.ts`, `mehrspaltige-tabelle-render.test.tsx`, `ArtikelBody.test.tsx`, `tarif-tabelle.test.ts`.
- **Neu:** Validator-Skript `scripts/normtext/check-tabellen.ts` + npm-Script `check:tabellen`, eingehängt in die `check`-Kette (T-F1).

---

## 2. Reihenfolge (kleinste sichere Schritte zuerst; Render-only vor Snapshot-Regen)

> Leitprinzip: erst nicht-brechende Vorarbeit, dann Schema, dann Generator-Logik mit TDD, dann EINMAL regenerieren, dann Render, zuletzt Gate-Verschärfung. Render-Umbau wird **vor** dem Schreiben der neuen Snapshots fertig getestet (gegen Fixtures), aber **nach** dem Schema-Upgrade aktiviert.

1. **Golden-Schnappschuss sichern** (vor jeder Änderung): aktuellen Stand der 28 betroffenen Snapshots committen/markieren als Baseline für den Byte-Diff (§4).
2. **Korpus-Inventar-Test (rot-by-design)** `T-F3` schreiben: zählt über alle 218 Bund-Snapshots Aritätsbrüche + empty-padded Köpfe + unverdichtete Span-Reste. Dokumentiert die wahre Defektmenge (~60), läuft zunächst nur als Report (nicht im Gate), macht Fortschritt messbar.
3. **Schema T-B1** in `typen.ts` additiv einführen (`spalten` optional neben `kopf`). tsc grün, noch kein Verhaltenswechsel.
4. **Generator-Helfer mit TDD** (`tabelle-normalisieren.ts`): Unit-Fixtures pro Markup-Variante + Span-Signatur (T-F5) ZUERST, dann Implementierung T-A2–A9/T-B2/B4/E4. Reine Funktionen, DOM-frei (T-F8). Leitfall Art. 20 als Goldtest T-F4.
5. **`extrahiere-fedlex.ts` verdrahten**: neue Helfer einhängen, `extrahiereArtikel` emittiert `spalten`-Modell. M7-Tests (:206-235/:268-274) auf neue kanonische Form umschreiben (Art. 30 → 2-Spalten-Verdichtung; BVG-`<th>`-Regression bleibt byte-gleich, T-F5(iii)).
6. **Renderer-Umbau** `MehrspaltigeTabelle` (Render-only, kein Snapshot): konsumiert `spalten`-Modell, Fallback für Alt-`{kopf,zeilen}` solange noch nicht alle regeneriert. Render-Tests T-F6/F9.
7. **EINMAL regenerieren** (§3) — nur die 28 Erlasse.
8. **Validator `check:tabellen` T-F1 in `check`-Kette aktivieren** (blockierend) + `kopf?`-Deprecated-Alias entfernen (Schema-Variante 1 finalisieren).
9. **Voll-Gate** `npm run gate` + adversariale Stichprobe gg. Fedlex (§4).

---

## 3. Regenerations-Strategie

- **Befehl:** `npm run normtext -- --datum=$(date +%F)` (mit vorab `bash scripts/fedlex-cache.sh`, damit `/tmp/<key>.html` frisch/vorhanden ist — sonst werden Erlasse stillschweigend übersprungen). Datum kommt aus der Shell (§2, kein `new Date()`).
- **Scope-Eingrenzung:** Der Generator hat heute **keinen** `--nur`-Filter (verifiziert: `normtext-snapshot.ts` iteriert über die Erlass-Map). Optionen, in Reihenfolge der Sicherheit:
  - (a) **Bevorzugt:** kleinen `--nur=<KEY,KEY,…>`-Filter im Generator ergänzen (analog zum bekannten Muster aus dem Volltext-Ausbau) und nur die **28 mehrspaltig-Erlasse** regenerieren. Das hält den Diff minimal und macht den Byte-Vergleich trivial.
  - (b) Falls Filter zu riskant: **alle 218 regenerieren**, dann per `git diff --stat` verifizieren, dass sich **ausschliesslich** die 28 mehrspaltig-Dateien geändert haben (jede Nicht-28-Datei im Diff = Regression-Alarm, sofort stoppen). Der `sha`-Feld-Wechsel ist erwartet nur in den 28.
- **Determinismus:** Generierung ist reine Funktion der gecachten HTMLs → reproduzierbar; sortierte Token-Ausgabe diff-freundlich (vgl. `struktur-run.ts`).
- **Hinweis Sidecars:** `npm run normtext:struktur` betrifft nur Gliederungs-Sidecars (golden-neutral) — **nicht** Teil dieses Umbaus.

---

## 4. GOLDEN-GATING / Beweis kein Normtext-Verlust

1. **Erwarteter Diff = nur Tabellenblöcke der 28 Erlasse.** Nach Regen: `git diff --stat public/normtext/bund/` muss exakt ⊆ der 28-Liste sein. Pro Datei `git diff` und manuell bestätigen, dass sich **nur** der/die `mehrspaltig`-Block(e) + `sha` geändert haben, kein `text`/`absatz`/`items`-Block.
2. **Werttreue-Beweis (T-E2/F7):** Für jede geänderte Tabelle scripted prüfen, dass jeder amtliche Token (Beträge `10.–/25.–/…/400.–`, Schwellen `100/500/1 000 000`, Wörter `über`/`bis`) als unveränderter Teilstring im neuen Block weiter vorhanden ist. Verdichtung darf nur Spacer-Zellen + das Wort „bis" lesbar verschmelzen, nichts streichen.
3. **Aritäts-Validator `check:tabellen` (T-F1):** 0 Aritätsbrüche, 0 empty-padded Köpfe, 0 unverdichtete Span-Reste über **alle 218** Bund-Snapshots; blockierend in `npm run check`.
4. **Gate-Kette:** `npm run gate` (tsc · vitest · golden:vergleich · lint · check). `golden:vergleich` muss grün bleiben (Rechner/Vorlagen unberührt — Beweis, dass der Umbau seitlich nichts brach).
5. **Adversariale Stichprobe gg. Fedlex** (Direktive „doppelt verifizieren"): mind. je 1 Fall pro Defektklasse — Art. 20 (1a/3/4), Art. 30 (2, Variante B), eine headerless FZA-Zeile (1b), eine BVG-`<th>`-Tabelle (Regression byte-gleich). Render via Playwright-im-Repo (nicht MCP-Screenshot) visuell gegen die Fedlex-Quellseite prüfen: Kopf sitzt, Spanne = 1 Zelle, Ausrichtung pro Spalte, mobil scrollbar.
6. **§6.3-Deklaration (wörtlich in Commit-Message):** „Deklarierte fachliche Änderung (§6.3): Tabellen-Snapshots der 28 Bund-Erlasse mit `mehrspaltig`-Block werden vom defekten Raster (colspan-Verlust → Kopf/Daten-Aritätsbruch, empty-padded Köpfe, Spacer-Spalten) auf das kanonische rechteckige `spalten`-Modell (T-B1) umgestellt. Die `bereich`-Zelle ist eine deterministische, verlustfreie Konkatenation unveränderter amtlicher Token (T-E2); kein Wert wird geändert, hinzugefügt oder entfernt. Tausendertrenner/Währung bleiben reine Anzeige-Formatierung (T-C4/E3). `sha`-Neuberechnung in genau diesen 28 Dateien erwartet; alle übrigen 190 Snapshots byte-identisch."

---

## 5. Tests neu/erweitert

- **T-F4 (Leitfall, Pflicht):** `extrahiereArtikel(GEBV_ART_20,'20')` ⇒ `spalten:[{bereich,'Forderung/Franken'},{betrag,'Gebühr/Franken'}]`, `zeilen:[['bis 100','10.–'],['über 100 bis 500','25.–'],…,['über 1 000 000','400.–']]`. Ersetzt die heutige Erwartung im Snapshot (aktuell 6-spaltiges Roh-Raster).
- **T-F1 Validator-Test** `check:tabellen`: Invarianten (1) `spalten` vorhanden `N≥1`; (2) `∀i zeilen[i].length===N`; (3) `typ ∈ {bereich,zahl,text,betrag}`; (4) keine voll-leere Spalte; (5) kein isolierter „über"/„bis"-Rest. **Nicht verhandelbar: Tor kopf-Captions == Zellzahl (T-B2).**
- **T-F5 Fixtures** je Variante: (i) Art. 20 `<th colspan=3>`+nackte `<td>`; (ii) Art. 30 `<td.tab-kpf colspan>`; (iii) BVG-`<th>` Kopf+Daten gleiche colspan → byte-gleich; (iv) ragged/unbekannte Signatur → Fallback. Plus Unit `["über","100","","bis","500"]`→„über 100 bis 500"; Nicht-Treffer → keine Verdichtung.
- **M7-Tests umschreiben** (`normtext-fedlex.test.ts` :206-235 + :268-274): zementieren heute Defektklasse 2 — sind Teil des Bugs, müssen auf die kanonische Form umgestellt werden.
- **T-F6 Render-Invariante** (`mehrspaltige-tabelle-render.test.tsx` / `ArtikelBody.test.tsx`): genau `N` `columnheader` + je Zeile `N` `cell`; bei künstlich gebrochener Arität → Fallback, kein Gitter; Lint/Test verbietet `Math.max(...zeilen.map(z=>z.length))`.
- **T-F7 Werttreue** in jedem Tabellentest; **T-F9 a11y/Kontrast-Snapshot** (ARIA-Rollen-Vollständigkeit, Kopf↔Zelle-Zuordnung Leitfall, Token-Herkunft der Klassen).
- **T-F3 Korpus-Invariante** über 218 Dateien als Report → später blockierend.

---

## 6. RISIKEN + Worktree-Isolation

**Bestätigter Konflikt:** Der Split-View-Agent in `.claude-worktrees/split-view-a` (Branch `feat/split-view-strang-a`) berührt mit hoher Wahrscheinlichkeit `src/components/normtext/ArtikelBody.tsx` — genau die Datei des Render-Umbaus (C/D). Paralleles Editieren = harter Merge-Konflikt + Risiko gegenseitiger Bug-Reintroduktion.

**Empfehlung:**
1. **Eigener Worktree/Branch** für diesen Umbau (z.B. `feat/normtext-tabellen-kanonisch`), **getrennt** von `split-view-a` und von `feat/normtext-bund-de` (`.lexmetrik-wt`). Nicht auf `main` direkt (Direkt-Push ohnehin geblockt, vgl. PR #50).
2. **`ArtikelBody.tsx`-Koordination:** Vor Render-Umbau klären, welche Region der Split-View-Agent anfasst. Wenn er Layout/Split betrifft und wir nur `MehrspaltigeTabelle` (:219-272) — **Konflikt auf Funktionsebene begrenzbar**, aber denselben Patch nicht doppelt. Wer zuerst merged, der andere rebaset. **Reihenfolge abstimmen, nicht blind parallel mergen.**
3. **Generator/Extraktor (`extrahiere-fedlex.ts`, neue `tabelle-normalisieren.ts`, `typen.ts`, Snapshots)** sind **nicht** im Split-View-Scope → dort kein Konflikt, dieser Teil kann unabhängig vorlaufen. **Render-Umbau zuletzt** und in enger Abstimmung, um das geteilte File minimal-invasiv zu treffen.
4. **Schema-Risiko:** `typen.ts`-Änderung ist quergeschnitten. Additiv (`spalten` optional) statt Big-Bang, damit der Split-View-Branch nicht durch einen Typbruch rot wird.
5. **Regen-Risiko:** ohne `--nur`-Filter ungewollte Diffs in den anderen 190 Dateien (z.B. wenn der Cache zwischenzeitlich aktualisiert wurde → Fassungsdrift vermischt sich mit dem Tabellen-Umbau). Mitigation: Filter (a) oder strikter `git diff --stat`-Check (b) **vor** Commit; bei Drift-Verdacht `check:fedlex-versionen` als Currency-Arbiter.
6. **Faithfulness-Risiko (§7):** Verdichtungs-Grammatik muss bei jeder Nicht-Treffer-Signatur degradieren statt raten (T-A6/E4) — sonst stille Wert-Erfindung. Gate durch T-F5(iv) + T-F7.

---

## 7. Scope „zuerst nur Bund (Kanton später)"

- **Generator-Pfad eingegrenzt:** Der Umbau betrifft ausschliesslich den **Fedlex**-Extraktor `extrahiere-fedlex.ts`. Die Kanton-Adapter (`adapter-pdf.ts`, `adapter-htm.ts`, `adapter-lexwork.ts`, `adapter-zh-pdf.ts`, `mehrspaltige-tabelle.ts`) bleiben **unberührt** — Kanton-Snapshots werden in diesem Umbau **nicht** regeneriert.
- **Schema gilt aber global:** Das T-B1-`spalten`-Modell in `typen.ts` und der Renderer `MehrspaltigeTabelle` werden von Bund UND Kanton geteilt. → **Renderer muss Alt-`{kopf,zeilen}` (noch nicht migrierte Kanton-Snapshots) defensiv weiter rendern** (T-E5-Linearfallback bzw. Kompat-Pfad), sonst brechen Kanton-Tabellen sofort. Das ist die zentrale Scope-Bedingung: **Render abwärtskompatibel, Generator nur Bund.**
- **Validator-Scope:** `check:tabellen` (T-F1) zunächst **nur auf `public/normtext/bund/**`** blockierend; Kanton-Snapshots im Report-Modus (warnend), bis ihr Generator-Pfad nachgezogen wird. Verhindert, dass nicht-migrierte Kanton-Tabellen den Build rot färben.
- **Folge-Arbeitspaket (separat):** Kanton-Adapter auf dasselbe kanonische Modell heben + Validator dort scharf schalten — eigener Plan, nach Bund-Abnahme.

---

**Schlüsseldateien (alle absolut):**
- Schema: `/Users/david/Developer/LexMetrik/src/lib/normtext/typen.ts`
- Generator: `/Users/david/Developer/LexMetrik/scripts/normtext/extrahiere-fedlex.ts` (+ neues `/Users/david/Developer/LexMetrik/scripts/normtext/tabelle-normalisieren.ts`)
- Fallback-Helfer: `/Users/david/Developer/LexMetrik/src/lib/normtext/darstellung.ts`
- Render: `/Users/david/Developer/LexMetrik/src/components/normtext/ArtikelBody.tsx`
- Orchestrator: `/Users/david/Developer/LexMetrik/scripts/normtext-snapshot.ts`
- Tests: `/Users/david/Developer/LexMetrik/src/tests/normtext-fedlex.test.ts`, `.../mehrspaltige-tabelle.test.ts`, `.../mehrspaltige-tabelle-render.test.tsx`, `.../ArtikelBody.test.tsx`, `.../tarif-tabelle.test.ts`
- Neues Gate: `/Users/david/Developer/LexMetrik/scripts/normtext/check-tabellen.ts` (npm `check:tabellen`, in `check`-Kette)
- Leitfall-Snapshot: `/Users/david/Developer/LexMetrik/public/normtext/bund/GEBV_SCHKG.json` (eintraege[24] = Art. 20)
- Gate: `/Users/david/Developer/LexMetrik/scripts/gate.sh`