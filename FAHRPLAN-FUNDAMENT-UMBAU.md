# FAHRPLAN-FUNDAMENT-UMBAU — Architektur-Außensicht & Umbauplan

> **Stand:** 13.6.2026 · **Charakter:** Vorschlag/Diskussionsgrundlage, noch
> **nicht** abgenommen. Kein Schritt wird ohne explizites Ja von David begonnen.
> **Erhebung:** Multi-Agent-Untersuchung („ultra") — 6 Themen-Agenten haben den
> echten Code gelesen (Datei-/Zeilenbelege unten), eine Synthese-Phase hat alles
> gegen die CLAUDE.md-Verfassung (§1–§12) geprüft, Konflikte markiert und die
> risikoärmste Reihenfolge bestimmt.
>
> **Leseweise:** Dieser Plan beschreibt einen *fundamentalen* Umbau aus der
> Perspektive „als sähe ich LexMetrik zum ersten Mal". Er ist bewusst
> selbstkritisch: drei Vorschläge werden **verworfen** bzw. an Davids Entscheid
> gebunden, weil ihr §6-Risiko den Nutzen übersteigt. Das ist Teil des Plans,
> kein Versehen.
>
> **Hinweis 3.7.2026 (Plan-Struktur-Council):** keine Gesamt-Restrukturierung/
> Sammel-Archivierung; Archivierung weiterhin nur einzeln per verify-then-archive
> (ROADMAP §Archiv-Kandidaten). Themen B–F dieses Fahrplans bleiben unberührt offen
> (B/C im T0b-Freigabe-Paket).

---

## 0. Kurzfassung (Executive Summary)

LexMetrik ist **kein Bastelprojekt**. Die Grundentscheidungen sind für ein
korrektheitskritisches Rechtstool richtig: rein deterministische Client-Engines
ohne LLM/Backend (Datenschutz fällt als Nebenprodukt ab), saubere
Schichtentrennung `lib/` ↔ `pages/`, Golden-Output-Tests, Fedlex-Verifikation,
scharfe CI. Der gesündeste Teil des Repos ist das Tooling/Tor-System — daran
ist **nichts** zu reparieren.

Die Umbauthemen zerfallen in **zwei Klassen**:

**Große Hebel, günstiges Risiko/Nutzen (Darstellungsschicht):**

1. **Datengetriebenes Routen-/Katalog-Register** — heilt einen *echten*
   §5-Verstoß (Pfad-Existenz steht doppelt in `App.tsx` **und** Katalog),
   macht ihn test-gegated statt build-time-überraschend. Risikoarm, mittlerer
   Aufwand, sofortiger Reibungsabbau bei jedem Karten-Zubau.
2. **Schema-getriebener Vorlagen-Rahmen** — der größte **Nordstern**-Hebel
   (neue Vorlage per Deklaration statt 100–200 kopierter Zeilen). Aber strikt
   **opt-in** für lineare Standard-Briefe, nur in `src/pages` + `src/components`.

**Kleinere Hebel / Strategie:**

3. **§7-Abnahme-Infrastruktur** (`rechtstext-daten`) — Wortlaut-Abnahme für
   alle Rechtsgebiete (heute nur AG). Ein echter Gefahrenschritt.
4. **Dokumentations-Hygiene** — risikoarmes Aufräumen einer *bereits
   beschlossenen* Hausordnung (T-4-Rotation, Archiv-Regel).
5. **Tooling-Konsolidierung** — Komfort ohne Korrektheitsproblem; lohnt nur den
   ersten (Doku-)Schritt.
6. **Kanzlei-Praxistauglichkeit (Persistenz/i18n)** — größter strategischer
   Hebel, aber **kein Code-Auftrag**: zwei Weichenstellungen, die David treffen
   muss.

**Der größte Verstoß, den der Plan aktiv heilt, ist der §5-Bruch der doppelten
Pfad-Existenz.** Der größte produktive Gewinn ist der Vorlagen-Rahmen.

---

## 1. Verfassungs-Verdikt (das Tor über allem)

> Der Gesamtplan hält **§1 (Korrektheit)** und **§3 (Schichtentrennung)**
> durchgehend ein — **sofern Reihenfolge und Guardrails strikt befolgt werden.**

Im Repo verifiziert (Grundlage dafür, dass Darstellungs-Refactorings überhaupt
§3-sauber möglich sind):

- `includeIf`, `pruefe*Gates` und **alle** Normtexte liegen ausschließlich in
  `src/lib/vorlagen/` — **kein Leck** in `src/pages`.
- Die Gate-Form `{ blocker, warnungen, hinweise }` ist über **22 lib-Dateien**
  einheitlich.
- Die Engine `src/lib/vorlagen/engine.ts` (214 Z.) enthält **keinen** Normtext.

**Drei §1-Wächter müssen aktiv bleiben:**

- (a) Vorlagen-Rahmen **nur opt-in** für lineare Standardfälle; keine
  `includeIf`-Spiegelung in die Config.
- (b) `rechtstext-daten` Schritt 3 (Verbatim-Hebung) nur **fragment-weise
  golden-gegated** — sonst sofort zurück.
- (c) Daten-File-Split und LIK-Python→TS-Portierung werden **verworfen** bzw.
  an Davids Entscheid gebunden, weil ihr §6-Risiko den Nutzen übersteigt.

---

## 2. Reihenfolge (Master-Ablauf, risikoärmst zuerst)

| Phase | Inhalt | Warum hier |
|---|---|---|
| **0 — Hausordnung & Vorlauf** (kein Code) | `doku-hygiene` Schritte 1–4 · `tooling-build` Schritt 1 | Reine `.md`/Metadatei-Bewegungen, kein Tor betroffen. Senkt sofort die Token-Last von `STRUKTUR.md`, die jeder Subagent liest. Sauberer Boden vor jedem Code-Umbau. |
| **1 — Geteilte Infrastruktur VOR Features (§10)** | `route-katalog-ssot` komplett · `vorlagen-rahmen` Schritte 1–3 | Beide bauen den Rahmen **verhaltensneutral**, bevor ein Feature ihn nutzt. Routen-Manifest heilt einen echten §5-Verstoß; Kreuzprüf-Test ist das Sicherheitsnetz **vor** dem Umbau. Rahmen-Schritte 1–3 sind Null-Verhaltens-Schritte (toter, tsc-geprüfter Code). |
| **2 — Pilot mit Golden+DOM-Beweis** | `vorlagen-rahmen` Schritt 4 (z. B. `VorlageNda`) | **Ein** Pilot, byte-gleicher `golden:vergleich` **plus** DOM-Snapshot der Schritte/Fehlertexte (Golden deckt nur `assemble`, **nicht** die UI-Fehlertexte). |
| **3 — Breiter Rollout, nur saubere Standardfälle** | `vorlagen-rahmen` Schritte 5–6 | Je Seite einzeln golden+DOM-gegated. Sonderseiten bleiben bewusst Duplikat (§1). |
| **4 — §7-Abnahme-Infrastruktur** | `rechtstext-daten` Schritte 1–2 (+ optional 4) | Reine Lese-Ableitungen, golden byte-gleich trivial. Wortlaut-Abnahme für alle Gebiete (heute AG-only). |
| **5 — Gefahrenzone & Strategie (nur mit explizitem Go)** | `rechtstext-daten` Schritt 3 · `praxis-persistenz-i18n` Schritte 1–3 · Entscheidungen 4–5 | Schritt 3 ändert den `assemble`-Pfad (hoch). Persistenz 1–2 sind ehrliche Features. fr/it- und Server-Weichen sind **Davids Entscheidungen**, keine Refactorings. |

**Kritische Sequenz-Bedingung (§12):** `route-katalog-ssot` und `vorlagen-rahmen`
**nicht** zeitgleich mit dem laut `STRUKTUR.md` aktiven
**FAHRPLAN-VORLAGEN-AUSBAU**-Karten-Zubau laufen lassen (Merge-Konflikt in
`App.tsx`/`startseiteConfig.ts`). Jeder Umbau in eigenem git-Worktree.

---

## 3. Guardrails (gelten für JEDEN Schritt)

1. **§6-Golden-Protokoll bei jedem Code-Schritt:** vorher `npm run gate` grün →
   Golden-Outputs festhalten → nachher `npm run golden:vergleich` **byte-gleich**.
   Ein Golden-Diff bei einem als verhaltensneutral deklarierten Schritt =
   **sofort zurückrollen**.
2. **Beim Vorlagen-Rahmen zusätzlich DOM-Snapshot-Vergleich** der Wizard-Schritte
   **und** der `fehlerImSchritt`-Fehlertexte — Golden deckt nur `assemble`, nicht
   die nutzersichtbaren UI-Validierungstexte.
3. **§12-Worktree-Isolation zwingend**, Commits mit explizitem Pathspec, kein
   fremder WIP.
4. **Nie angefasst:** `src/lib/` (Engines/Schemas/Gates/`includeIf`).
   `assemble()`-Ergebnisse müssen byte-identisch bleiben. `likReihe.ts` ist
   deterministische Rechtslogik-Eingabe.
5. **Tests bei Refactorings nicht anpassen (§6.3).** Neue Tests
   (`routenManifest.test.tsx`, Import-Normalisierung) sind erlaubt, aber als
   eigene **fachliche** Schritte ausgewiesen — kein heimliches Umschreiben.
6. **Opt-in, nicht erzwingen:** Vorlagen-Rahmen nur für lineare Standard-Briefe.
   Keine `includeIf`-Sichtbarkeit aus dem Schema in die Config spiegeln (§3).
7. **Keine Pfad→Komponenten-Auto-Ableitung per Namenskonvention** (4 belegte
   Gegenbeispiele); statische `import()`-Loader pro Manifest-Eintrag, sonst
   stilles Falschladen (§1-nah) und kaputtes Vite-Code-Splitting.

---

## 4. Themen im Detail

### Thema A — Schema-getriebener Vorlagen-Rahmen *(Aufwand: L · größter Nordstern-Hebel)*

**Ist-Zustand (belegt):** 29 `src/pages/Vorlage*.tsx`, davon 26 mit
`VorlagenWizardRahmen`. Trotz vorhandenem Unterbau
(`src/components/vorlagen/useWizardState.ts`, `wizard.tsx`, `ui.tsx`) ist die
**Pro-Seite-Orchestrierung fast wortgleich dupliziert**:
33× `useWizardState`-Aufruf, 25× `useMemo(...zusammenstellen)`, 19×
`useMemo(pruefe*Gates)`, 19× eine `fehlerImSchritt(i)`-Funktion, 26× ein
`const SCHRITTE = [...] as const`, **14× ein lokal kopiertes**
`const ISO = /^\d{4}-\d{2}-\d{2}$/`. Beleg-Seiten: `VorlageNda.tsx` Z.33–63,
`VorlageWerkvertrag.tsx` Z.45–73, `VorlageForderungsabtretung.tsx` Z.34–60,
`VorlageNichtbekanntgabe.tsx` Z.34–61 — identisches Schema. Das
DOCX-Gate `card?.modus === 'vorlage' && card.output?.includes('docx')` steht
**2× pro Seite**.

**Problem:** Jede neue Vorlage kostet ~30–60 Zeilen kopierter Boiler-Verdrahtung
(§10-Verstoß: Rahmen ist da, wird aber umgangen). Eine Korrektur muss in 14–26
Dateien nachgezogen werden — genau die Fehlerklasse, aus der der in `ui.tsx`
Z.40–42 dokumentierte NormPill-Locale-Bug entstand. Bremst den Nordstern
(schnelles, fehlerfreies Vorlagen-Hinzufügen).

**Zielbild:** Engine-Schema bleibt unverändert SSoT der Rechtslogik. Daneben eine
reine **Darstellungs-Deklaration** (`vorlageSeitenConfig`): Schritte, Feld-Typen
(text/textarea/datum/checkbox/toggle/betrag), Gate-/Bestätigungstexte, Banner,
Dateinamen. **Eine** generische `<VorlagenSeite config={…}/>` rendert alles. Neue
Standard-Vorlage = ein Schema-Verweis statt 100–200 kopierter Zeilen.
Sonderseiten (Gründungen, Klagen, Schlichtungsgesuch, Testament, alles mit
berechneten Live-Hinweisen) bleiben **handgeschrieben** — opt-in, nicht
erzwungen (§1).

**Schritte (alle §6-verhaltensneutral, Beweis je Schritt):**

1. Golden-Basis + Tor-Lauf festhalten; prüfen, dass `golden-outputs.ts` alle
   umzubauenden Vorlagen abdeckt. *(niedrig)*
2. Reine Helfer extrahieren: ISO-Regex + DOCX-Gate-Prädikat in **einen**
   benannten Darstellungs-Helfer — Bedingungen unverändert. Beweis:
   `golden:vergleich` byte-gleich, DOCX-Button erscheint exakt wie zuvor. *(niedrig)*
3. `VorlageSeitenConfig`-Typ + generische `<VorlagenSeite>` **neben** den Seiten
   bauen (noch von niemandem importiert → 0 Verhaltensänderung). *(niedrig)*
4. **Ein** Pilot (`VorlageNda`) umstellen. Beweis: `golden:vergleich` byte-gleich
   **+ DOM-Vergleich** der drei Schritte/Fehlertexte. *(mittel)*
5. Restliche lineare Standard-Briefe je 1 Commit (Werkvertrag, Forderungs­ab­tretung,
   Auftrag, Verjährungsverzicht …). Seiten mit Live-Hinweisen/Sonder-Props/Mappen
   **nicht**. *(mittel)*
6. Optionale Felder/Verzweigungen deklarativ abdecken (z. B. NDA-Richtungs-Toggle)
   — **nicht** die Engine-`includeIf`-Logik duplizieren. *(mittel)*

**Risiken:** Defaults/`SPEICHER_KEY` müssen 1:1 übernommen werden (sonst
Hydrations-Bruch). Generisches `fehlerImSchritt` könnte Fehlertext-Reihenfolge
ändern → **DOM-Vergleich Pflicht**, Golden allein reicht nicht. Versuchung,
`includeIf`-Sichtbarkeit in die Config zu ziehen → §3-Verstoß. Über-Abstraktion
drängt Sonderseiten ins Schema → §1-Risiko.

**§§:** Kern ist §3 (nur Darstellung), §5 (PDF/DOCX aus demselben `assemble`),
§6 (byte-Beweis), §10 (Rahmen vor Feature), §1 (Sonderseiten bleiben Duplikat).

---

### Thema B — Datengetriebenes Routen-/Katalog-Register *(Aufwand: M · risikoarm · heilt echten §5-Verstoß)*

**Ist-Zustand (belegt):** Eine neue Vorlage/ein neuer Rechner muss an
**mindestens 3 Stellen** eingetragen werden, plus 2 abgeleitete Zähler:
(1) Seitendatei; (2) `startseiteConfig.ts` (`href`, 47 Karten);
(3) `App.tsx` (165 Z.) mit **52 handgeschriebenen `lazy()`** Z.11–64 **und** 55
`<Route>`-Einträgen Z.101–158 — je Seite **doppelt**; (4) `prerender.ts` Z.33
`const ERWARTETE_ROUTEN = 49` (handgepflegter Zähler).

Differenzierung: Die Prerender-**Routenliste** ist bereits aus dem Katalog
abgeleitet (`seo.ts` `prerenderRouten()`/`kartenProPfad()`). Aber das Rendering
läuft durch die echte `<App/>`; fehlt dort eine `<Route>`, bricht erst der
Build-Zeit-404-Tor (`prerender.ts` Z.105–107). **Kein Unit-Test** kreuzprüft
`App.tsx`-Routen gegen den Katalog.

**Problem:** §5-Verstoß — Pfad-Existenz steht in `href` **und** in `<Route path>`.
Folgen: neue Karte ohne Route → 404 erst zur Build-Zeit; `ERWARTETE_ROUTEN`
driftet; 4 Eintragsstellen erhöhen die Fehlerquote.
**Aber:** die Pfad→Komponente-Zuordnung ist **keine** Katalog-Information und
**nicht** ableitbar — 4 Gegenbeispiele (`/rechner/betreibungskosten`→
`RechnerGebvKosten`, `/rechner/bgg-fristen`→`RechnerBgerRechtsweg`,
`/vorlagen/schlichtungsgesuch-bs`→`VorlageSchlichtungsgesuchBs`,
`/vorlagen/nichtbekanntgabe-betreibung`→`VorlageNichtbekanntgabe`). Auto-Magie
per Namenskonvention wäre ein §1-naher Fehler (stilles Falschladen).

**Zielbild:** `src/routesManifest.tsx` — pro Pfad **einmal** `{ pfad, lazy-Loader }`.
`App.tsx` erzeugt seine `<Route>`-Liste per `.map`. Manifest ist per Test
**gegen den Katalog gegated** (jeder `kartenProPfad()`-Pfad ↔ genau ein
Manifest-Eintrag) → Pfad-Existenz wieder allein im Katalog (§5). Code-Splitting
1:1 erhalten (statische `import()`). Sonderrouten (Redirects, `RechnerStub`,
statische Seiten, NotFound) bleiben explizit in `App.tsx`.

**Schritte (alle §6-verhaltensneutral):**

1. Golden-/Prerender-Basis + Routen-Inventar festhalten (49 OK-Zeilen, sitemap). *(niedrig)*
2. **Sicherheitsnetz-Test VOR Umbau:** `routenManifest.test.tsx` — jeder
   Katalog-Pfad rendert nicht-NotFound. Eigener deklarierter **fachlicher**
   Schritt (§6.3), grün gegen Ist-Stand. *(niedrig)*
3. Manifest-Datei anlegen (ungenutzt), Loader 1:1 aus `App.tsx` übernommen. *(niedrig)*
4. `App.tsx` auf `ROUTEN_MANIFEST.map(...)` umstellen; Sonderrouten explizit
   lassen. Beweis: identische 49 Prerender-Routen + byte-gleiche sitemap +
   unverändertes Chunk-Manifest. *(mittel)*
5. Manifest ↔ Katalog gaten; `ERWARTETE_ROUTEN`-Handzähler aus dem Katalog
   ableiten/durch Test redundant machen. *(niedrig)*

**Risiken:** Keine Namens-Auto-Ableitung (verboten, s. o.). Route-Reihenfolge:
`/rechner/:slug` (Stub) bleibt nach den konkreten Routen. Hash-Karten über
`pfadOhneHash` falten (sonst Phantomrouten). Vite-Chunk-Splitting durch
statische `import()` erhalten.

**§§:** Kern §5 (Existenz zurück in den Katalog), §3 (Manifest = erlaubte
Darstellungs-Zusatzinfo), §1 (keine Auto-Magie), §6.4 (nur Ladezeitpunkt).

---

### Thema C — §7-Abnahme-Infrastruktur / Rechtstext-Lesbarkeit *(Aufwand: M · ein Gefahrenschritt)*

**Ist-Zustand (belegt — Prämisse teilweise widerlegt):** Die Assemble-**Logik**
in `engine.ts` ist **sauber** und enthält **keinen** Normtext. Der Wortlaut lebt
als **Daten** in `VorlageSchema`-Objekten (`gruendungAgDokumente.ts`: 14 Schemas,
187 `text:`-Felder; GmbH 70; mietvertrag 25; arbeitsvertrag 29). Für die AG
existiert **bereits** ein Abnahme-Werkzeug: `scripts/abnahme-ag.ts` erzeugt
`ABNAHME-AG-BAUSTEINE.md` (lesbare Wortlaut-Dossiers, §5-treu als Ableitung
deklariert). David liest also für die AG schon heute Inhalt statt TypeScript.

**Zwei echte Schwachstellen:** (1) Das Abnahme-Werkzeug ist **AG-only** — GmbH,
Verträge, Klagen haben keine Lese-Oberfläche. (2) Verbatim-Wortlaut **leckt** aus
dem Schema in die Funktion `basisAntworten()` als Inline-Strings (z. B. Z.826
`stichentscheidSatz`, Z.556 Agio-Zusatz, Z.880–897) — diese Fragmente erscheinen
im Abnahme-Doc nur als Platzhalter, der Wortlaut bleibt unsichtbar.

**Zielbild:** Jeder Rechtsgebiets-File bekommt (wie die AG) ein deterministisches
`ABNAHME-<gebiet>-BAUSTEINE.md` aus **einem generischen** Generator. Verbatim aus
`basisAntworten()` wandert in den Schema-`text:`-Kanal. **Großes File-Splitting
wird bewusst NICHT gemacht** (kein Abnahme-Nutzen, Import-Zyklen-Risiko, §1).

**Schritte:**

1. `abnahme-ag.ts`-Markdown-Code in **generische** Funktion extrahieren
   (Registry + Titel → identischer Markdown). Beweis: AG-Dossier byte-gleich. *(niedrig)*
2. Dossiers für GmbH/mietvertrag/arbeitsvertrag/kapitalerhoehung erzeugen. Reine
   Leseartefakte, `golden:vergleich` byte-gleich. *(niedrig)*
3. **GEFAHRENZONE** — Inline-Verbatim aus `basisAntworten()` in den `text:`-Kanal
   heben, **je Fragment ein Commit**, `golden:diff` byte-gleich, sonst sofort
   zurück. Berechnete Werte bleiben in `basisAntworten` (Logik ≠ Wortlaut). *(hoch)*
4. *Optional:* `verified?: boolean` am Baustein-Typ (additiv, von `assemble`
   nicht gelesen → Golden byte-gleich). Nur falls David Schemas nach Abnahme
   markieren will. *(niedrig)*

**§§:** §7 (Abnahme durch Nicht-Programmierer), §5 (Dossiers = reine Ableitung),
§1 (kein riskantes File-Splitting), §6 (Schritt 3 fragment-weise gegated).

---

### Thema D — Dokumentations-Hygiene *(Aufwand: M · risikoarm · kein Code)*

**Ist-Zustand (belegt):** 21 `.md` im Root (6739 Z.). Lebende Referenz (bleibt):
CLAUDE, README, STRUKTUR, HANDLUNGSPLAN, Reglemente/Strategie. **Generiert
(nicht verschieben):** `ABNAHME-AG-BAUSTEINE.md` (`abnahme-ag.ts` Z.18 schreibt
fest ins Root). **Archiv-Kandidaten** (Status im Dokument belegt): 7 abgeschlossene
FAHRPLÄNE (DESIGN „ERLEDIGT", RECHNER-DESIGN „ABGENOMMEN 11.6.", VEREINHEITLICHUNG,
GRUNDLAGEN, TOKEN-DISZIPLIN, AG-/GMBH-GRUENDUNG). **Aktiv (bleibt):**
VORLAGEN-AUSBAU, VERTRAGS-VARIANTEN. Archiv-Infrastruktur existiert
(`archiv/README.md` + Index-Regel).

**Problem:** (1) `STRUKTUR.md` (52 KB/803 Z.) wird laut T-4 „in jeder Session und
jedem Subagenten gelesen" → ~13–15k Token pro Lesevorgang; die **beschlossene**
T-4-Karten-Rotation ist unvollständig umgesetzt (volle Karten vom 13./12.6. noch
drin). (2) 7 erledigte FAHRPLÄNE verwässern den Root.

**Schritte (kein Code, Beweis per byte-Diff + grep):**

1. `STRUKTUR.md` auf jüngste ~2 Arbeitstage kürzen — ältere Karten **byte-genau**
   nach `archiv/STRUKTUR-SESSIONKARTEN.md` (T-4 nachholen). Kopf Z.1–21 unangetastet.
2. 7 abgeschlossene FAHRPLÄNE per `git mv` ins `archiv/` (Dateiname unverändert,
   für grep).
3. `archiv/README.md`-Index um die verschobenen Pläne ergänzen.
4. Querverweise prüfen (grep auf kaputte relative Links); CLAUDE.md-Pointer auf
   STRUKTUR.md bleibt gültig.

**Bewusst NICHT:** `STRUKTUR.md` **nicht** in mehrere Dateien aufteilen
(CLAUDE.md §3/Z.3 nennt es als **den einen** Anlaufpunkt; Split zersplittert den
Pointer). `ABNAHME-AG-BAUSTEINE.md` nicht verschieben. Vor AG-/GMBH-Verschiebung:
offene David-Abnahmen im HANDLUNGSPLAN gespiegelt? (`archiv/README.md`-Regel).

**§§:** §3 (Pointer erhalten), §6 (keine `.ts` berührt, byte-Diff statt Golden),
§1 (kein Ist-Stand-Verlust), §12 (Pathspec-Commits). Holt eine **beschlossene**
Hausordnung nach, schafft keine neue Regel.

---

### Thema E — Tooling-/Skript-Konsolidierung *(Aufwand: S · Komfort, kein Korrektheitsproblem)*

**Ist-Zustand (belegt):** Drei Laufzeiten — 13 TS-Skripte (vite-node), 3 Bash,
**genau 1 Python**: `scripts/lik-reihe-generieren.py` (liest BFS-XLSX via
`openpyxl`, schreibt `src/data/likReihe.ts`; monatlicher manueller Lauf, in
keinem `package.json`/Gate/CI, `openpyxl` nirgends deklariert und lokal nicht
installiert). CI ist **scharf und vollständig**: `ci.yml` deckt jeden
gate-Befehl + e2e ab; `normen-monitor.yml` wacht wöchentlich über die Fedlex-Pins.
**Das ist der gesündeste Teil des Repos.**

**Problem:** Kein Korrektheitsproblem. Nur: drei Laufzeiten für **ein** Python-
Skript, das als einziger Generator aus der sonst einheitlichen TS-Konvention
ausschert, mit undeklarierter, nicht installierter Abhängigkeit.

**Schritte:**

1. **Empfohlen/minimal:** `requirements.txt` (`openpyxl`) + Pflegehinweis. Beseitigt
   die undeklarierte Abhängigkeit, ändert nichts. *(niedrig)*
2. Snapshot `likReihe.ts` (sha256) festhalten. *(niedrig)*
3. *Optional:* `lik-reihe-generieren.ts` (TS-XLSX-Reader), **byte-identische**
   Ausgabe gegen Snapshot beweisen. *(mittel)*
4. *Optional:* Python + `requirements.txt` entfernen — **erst nach** bewiesener
   Byte-Gleichheit. *(niedrig)*

**Ehrlich:** Voll-Konsolidierung lohnt nur, wenn die LIK-Pflege wiederkehrend
Reibung erzeugt; sonst bei Schritt 1 stehenbleiben. **Tore/Golden/CI werden
nicht angefasst.** → **Davids Entscheid** (s. Konflikt-Register).

**§§:** §6 (byte-Diff zwingend, `likReihe.ts` speist Teuerung/Verzugszins —
gekippte Zahl wäre §1-Bug), §5 (Single Source bleibt, nur Generator wechselt).

---

### Thema F — Kanzlei-Praxistauglichkeit: Persistenz & i18n *(Aufwand: M · großteils Davids Entscheidung)*

**Ist-Zustand (belegt):** **Persistenz** rein `localStorage` pro Browser
(`useWizardState.ts` Z.18–37; 18 distinct `lexmetrik.vorlage.*.v1`-Keys). **Kein**
Export/Import, **kein** Mandanten-/Stammdaten-Profil. **i18n** ist reines Gerüst
(`locale.tsx`, 63 Z.): `Locale = de|en|fr|it`, fr/it als `inBearbeitung:true`,
**kein** Übersetzungs-Lookup/`t()`. Einzige echte Wirkung: `fedlexLokalisiert()`
schreibt Norm-URLs um. **Engines:** Deutsch hart verdrahtet, ohne Locale-Parameter
— deutsche Klauseln/Normbezeichnungen als Inline-Strings über ~37 lib-Dateien.
§8 ist heute sauber (Umschalter zeigt ehrlich „in Bearbeitung").

**Problem:** Nordstern „Praxistauglichkeit" kollidiert: (1) `localStorage`/Browser
deckt Gerätewechsel, Zweitarbeitsplatz, Mandats-Wiederverwendung **nicht** ab;
Cache-Löschung vernichtet Arbeit kommentarlos. (2) fr/it ist Fassade — Mandanten
in Romandie/Tessin bekommen deutschen Vertrag; je mehr Vorlagen, desto teurer die
spätere Nachrüstung.

**Schritte:**

1. UI-Hinweis „nur dieser Browser" (§8, ehrlich). Bewusst **nicht**
   verhaltensneutral (sichtbarer Text), aber Engines unberührt → `golden:vergleich`
   byte-gleich. *(niedrig)*
2. Export/Import der Antworten als lokale JSON-Datei über den **bestehenden**
   `normalisieren()`-Pfad (kein zweiter Lade-Pfad, §5). Feature, eigener Schritt. *(niedrig)*
3. Norm-Bezeichnung im Schema sauber vom Klauseltext trennen (`norm`-Feld ist
   bereits da). Verhaltensneutraler i18n-Vorbau, **Golden-gegated**. *(mittel)*
4. **ENTSCHEIDUNG David:** local-only + JSON-Export, oder Account/Server-Sync? Bei
   Server gilt zwingend §2 — Server speichert **nur Blobs**, führt **nie**
   Engine-Logik aus.
5. **ENTSCHEIDUNG David:** ob/welche Vorlagen amtlich übersetzte fr/it-Klauseln
   bekommen (§7/§8: nur amtlich, **kein LLM**), in welcher Reihenfolge.

**Bewusst NICHT jetzt:** voller i18n-String-Katalog ohne amtliche Inhalte (toter
Rahmen, verleitet zu LLM-Befüllung → §7-Verstoß).

**§§:** §2 (Engines rein, Server nur Blob), §3 (1–2 nur Darstellung), §5 (ein
Lade-Pfad), §7/§8 (kein LLM, Ehrlichkeit bewahren).

---

## 5. Konflikt-Register (ehrliche Spannungen mit der Verfassung)

| Thema | §§ | Spannung | Empfehlung |
|---|---|---|---|
| Vorlagen-Rahmen: generisches `fehlerImSchritt` + `includeIf`-Sichtbarkeit in Config | §3/§1 | UI-Validierung ist erlaubt, eine Rechtsregel aus dem Schema-`includeIf` in der Darstellung nachzubauen wäre §3-Verstoß + Doppelpflege | **modifiziert umsetzen** |
| Vorlagen-Rahmen: Über-Abstraktion drängt Sonderseiten ins Schema | §1 | „Lieber Duplikat als verbogene Abstraktion" | **modifiziert umsetzen** (opt-in) |
| Routen-Manifest als zweite Pfad-Existenz-Quelle | §5 | Nur zulässig, wenn **test-gegated** gegen den Katalog und nur Pfad→Komponente tragend | **umsetzen** |
| Verbatim-Hebung aus `basisAntworten()` (Thema C/3) | §1 | FRAGMENT-Regex/Leerwert-Logik kann Output brechen; einziger Schutz = fragment-weiser `golden:diff` | **modifiziert umsetzen** |
| Große Daten-Files in Daten+Logik aufteilen | §1 | Prämisse trifft die saubere Engine nicht; Split = Import-Zyklen-Risiko ohne Abnahme-Nutzen | **verwerfen** |
| LIK Python→TS-Portierung | §1 | `openpyxl`-float vs. TS-Reader-Rundung könnte Zahl kippen; reiner Komfort gegen neue devDependency | **David entscheidet** |
| Voller i18n-Katalog / Server-Backend | §5/§2 | Toter Rahmen → LLM-Versuchung; Server → Versuchung serverseitiger Logik | **David entscheidet** |

---

## 6. Was bewusst NICHT umgebaut wird

- **Engines / `src/lib/`** — die Logikschicht ist sauber und bleibt unberührt.
- **Tore / Golden / CI** — vollständig und scharf; der gesündeste Repo-Teil.
- **Große Schema-Dateien aufsplitten** — verworfen (§1, kein Nutzen, Risiko).
- **`STRUKTUR.md` in Teildateien zerlegen** — verworfen (zersplittert den
  §3-Pointer); stattdessen die beschlossene Rotation nachholen.
- **fr/it per LLM füllen** — verboten (§7/§8).
- **Server-Persistenz „nebenbei"** — nur als bewusste Entscheidung Davids, und
  dann ausschließlich als Blob-Speicher (§2).

---

## 7. Nächster Schritt

Empfehlung: mit **Phase 0** (Doku-Hygiene + `requirements.txt`) beginnen — kein
Code, kein Risiko, sofortiger Token-Gewinn bei jedem Session-Start. Danach
**Phase 1** (Routen-Manifest zuerst, dann Vorlagen-Rahmen 1–3) im eigenen
Worktree, **nicht** parallel zum laufenden FAHRPLAN-VORLAGEN-AUSBAU.

> Dieser Plan ist eine Vorschlagsgrundlage. Welche Themen/Phasen tatsächlich
> umgesetzt werden, entscheidet David — Punkt für Punkt.
