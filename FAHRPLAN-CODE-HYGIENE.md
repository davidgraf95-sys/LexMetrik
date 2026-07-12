# FAHRPLAN — Code- & Bibliothek-Hygiene (Ultracode-Synthese 12.7.2026)

> **ROADMAP-Schritt:** `W2·12-HYGIENE` (Welle 2, hinter den laufenden Reader-/Verzahnungs-Strängen).
> **Auftrag David 12.7.2026 (wörtlich):** «recherche mit ultracode zu allgemeiner optimierung
> von code und bibliothek und setze befunde um».
> **Quelle:** Ultracode-Recherche 12.7.2026 — 41 Befunde (Tot-Code-Scan mit Wortgrenzen-Grep über
> src+scripts+e2e+api · Duplikat-/SSOT-Analyse · madge-Zyklen · §6.6-Zeilen-Audit ·
> Bibliothek-/INDEX-Wahrheitsabgleich) plus 3 adversariale Kritik-Linsen (**regel-treue** ·
> **beleg-haerte** mit 13 Repo-Stichproben · **roi-buendlung** mit eigener Nachmessung).
> Dieses Dokument ist die **Synthese**: Verdikt-gefilterte Befunde, zu Bau-Einheiten
> gebündelt (§14.2), verhaltensneutrale Sweeps zuerst, Risikoreicheres gegated dahinter.
> Verworfenes steht explizit mit Grund (§Z), Beleg-Qualität je Befund in §B.
>
> **Bilanz:** 41 Befunde → nach Dubletten-Merges (B10≡B30 · B14≡B20 · B7+B29 fusioniert)
> **38 netto** → **30 übernommen** (davon 6 mit korrigierter Massnahme aus den Kritiken) ·
> **4 geteilt/abgewertet** (B9 nur Report-only · B11 nur Doku-Teil · B15 nur Kommentar ·
> B40 nur Kopf) · **2 verworfen** (B17 · B9-Vollausbau) · **2 gesperrt/eskaliert**
> (B11-Code-Teil ohne David · B40-Fachteil = eigener Currency-Slot).

---

## §0 · Verbindliche Prozess-Regeln (gelten für JEDE Einheit dieses Plans)

1. **G1 — Richtiger Beweis-Anker je Fläche.** «golden byte-gleich» beweist NUR Engine-/
   Vorlagen-Outputs. Für Tot-Code gilt: **tsc + Tests unangepasst + Build grün**. Für
   Katalog-/Record-Splits: **Vorher/Nachher-`JSON.stringify`-Vergleich** (Schlüssel-Reihenfolge!)
   als Commit-Beleg. Für UI-Splits: **e2e unangepasst** + Sichtprüfung. golden wird nur dort
   als Beweis zitiert, wo es die Fläche wirklich exerziert (H-6, H-7, H-9); überall sonst
   läuft es als Mitläufer-Tor, nie als Beweis-Behauptung. «golden grün» auf ungedeckter
   Fläche = falsche Sicherheit.
2. **G2 — PR-Ketten-Kollision.** Solange die Kette #164/#165 (Worktrees `lm-sz-nachzug`/
   `lm-u-kopf`, DIRTY-Kaskade) nicht abgeschlossen ist: **keine repo-weiten Churn-Massnahmen**
   (grosse Splits H-13, ESLint-Autofix `consistent-type-imports`, knip-Abbau-Chargen).
   Kleine, datei-lokale Einheiten sind ok. Vor JEDER Einheit: `git worktree list` +
   Datei-Abgleich gegen laufende Worktrees (§12).
3. **G3 — Gegenprüfungs-Pflicht (Skill `gegenpruefung`).** Zwingend bei H-6, H-7, H-9
   (Risikopfade `src/data/tarif`, `src/lib/tarif`, `src/lib/prozesskosten`-Nähe,
   `src/lib/vorlagen`) — Quittung via `npm run gegenpruefung:ok`, Trailer
   `Gegenpruefung:` am Commit. Das Tor `check:gegenpruefung` triggert auf diesen Globs ohnehin.
4. **Eine Beweisklasse pro PR.** Byte-/verhaltensneutral ≠ deklarierte Verhaltensänderung ≠
   Doku ≠ Risikopfad-mit-Gegenprüfung — nie mischen (§14.2). Insbesondere H-11-Commit-B
   (Eingabe-Toleranz) NIE in einem Aufräum-PR verstecken.
5. **Modell-Daueranweisung:** Bau = Opus (Default); mechanische/klar geschnittene Einheiten
   Sonnet (je Einheit vermerkt); Risikopfade IMMER Opus. `model`/`effort` in jedem
   Dispatch explizit.
6. **Nie Rechtsregel mitlöschen.** Jede Löschung/Verschiebung verhaltensneutral belegt
   (Referenz-Grep im Commit-Text); §1: lieber Duplikat als eine Abstraktion, die zwei
   Rechtsfälle gleich behandelt. Frische Zahlen am Bau-Tag erheben (Branch-Zählung,
   Skript-Inventar) — nicht aus diesem Audit abschreiben (zweimal ungenau: 16/17-Branches).

---

## §1 · Bau-Einheiten (Ausführungsreihenfolge = Tabellen-Reihenfolge)

### P0 — sofort, null Code-Risiko (~½ Session)

#### H-1 · Bibliothek-Wahrheits-Sweep *(Befunde B32 · B34 · B35 · B36 · B38 · B39 · B41 · B40-Kopf · B19/B11-Memory-Austrag · B31-Konvention)*
- **Kern:** aktive Falsch-Wahrheiten in der Bibliothek beseitigen, die Sessions fehlleiten.
  Priorität 1 = **B32 SH-Schlichtungsgebühr** (§5/S8-Verstoss: Dossier sagt «OFFEN, kodiert
  50–300», Engine trägt seit 16.6. den freigegebenen Wert 100–1000): S8-Korrekturvermerk in
  `bibliothek/normen/kantonale-tarif-zitat-befunde.md` (Befund 3 + Zusammenfassungstabelle)
  — **mit Beleg-Zitat** (Code-Kommentar `schlichtung.ts` Z. 131 «Korrektur 16.6.2026, §7,
  fachl. freigegeben David» + Commit-Hash), nicht nur Behauptung; dritte Fundstelle ist
  `src/data/zustaendigkeitKosten.ts:141` (Pfad-Korrektur beleg-haerte). `bibliothek/INDEX.md:185`
  nachziehen. Priorität 2 = **B39 recherche/INDEX-Pauschale** «Nichts davon ist umgesetzt»
  (Doppelbau-Risiko) ersetzen durch «Status je Dossier in der Tabelle; GEBAUT-Vermerke beachten».
  Dazu: B34 INDEX-Kopf/Baum (zählerfreie Formulierung, normtext/+seo/ ergänzen) · B35 vier
  geparkte register-Einträge in die register-Tabelle einsortieren · B38 Root-Alt-Audits
  `AUDIT-TARIF-2026-06-17.md`/`AUDIT-BUGS-2026-06-19.md` nach `register/` + INDEX-Zeile mit
  ehrlichem Status «A-Befunde OFFEN (Entscheid David 17.6.)», Memory-Pfadverweis nachziehen ·
  B41 golden-Zähler «53» → Verweis auf `golden/lexmetrik-golden.json` (209) · B40-Kopf
  Verfallsregister-Stand-Datum · B37-Vorbereitung: INDEX-Kurzregel «hartkodierte Bestands-
  zahlen nur generator-gepflegt» · B31 Fassaden-Muster (Split + `export *` mit
  Byte-Identitäts-Beweis) als 1-Absatz-Konvention in CLAUDE.md §6 Ziff. 6 · Memory-Austrag
  B19 (P3 geschlossen-bewusst) + B11-Teil-1 (SG-60.13-Rest ERLEDIGT seit QS-GP 2.7.,
  `beurkundung.ts:322/343` Tranchen-Floor).
- **Fläche:** `bibliothek/**` (nur .md) · `CLAUDE.md` · Memory `lexmetrik-engine-synergien.md`.
- **Beweis:** reine Doku; `check:bibliothek` grün. **Aufwand S · Sonnet** (B32-Vermerk:
  Opus-Spot-Check der Beleg-Zitate).

#### H-2 · bibliothek-check-Scope dichtmachen *(B37)*
- **Kern:** `scripts/bibliothek-check.sh` prüft S1/S7 nicht für `materialien/`, `normtext/`,
  `seo/` und Root-Dateien — Ordnerlisten in beiden Loops (Z. 16/33) erweitern, S1-Ordnerliste
  in `bibliothek/STANDARDS.md` nachziehen. **Reihenfolge zwingend:** erst Report-Lauf,
  Neu-Verstösse im selben Commit fixen, DANN erst das erweiterte Gate scharf — nie ein rotes
  Tor auf unbereinigtem Bestand.
- **Fläche:** `scripts/bibliothek-check.sh` · `bibliothek/STANDARDS.md` (+ etwaige Verstoss-Fixes).
- **Beweis:** Prüfskript, verhaltensneutral; Gate grün. **Aufwand S · Sonnet.** Läuft NACH H-1.

#### H-3 · Git-Hygiene: gemergte Branches + Worktrees *(B10≡B30, dedupliziert)*
- **Kern:** `git branch --merged main` liefert 17 Zeilen INKL. `main` = **16 gemergte
  Feature-Branches** (Zahl am Bau-Tag frisch erheben); 26 Worktrees, viele zu genau diesen
  Branches. Je Branch: Worktree-Status prüfen (**`git -C <pfad> status` — WIP-Guard §12,
  auch bei «merged» kann uncommitteter Stand liegen**; Beleg-Korrektur: `feat/bge-bis-2020`
  erscheint in `--merged`, der Worktree kann trotzdem WIP tragen), dann `git worktree remove`
  + `git branch -d` (nur `-d`, nie `-D`). **TABU: `lm-sz-nachzug`/`lm-u-kopf`** (#164/#165)
  und alle Worktrees laufender Sessions. Ungemergte Branches nur inventarisieren.
- **Fläche:** lokale git-Verwaltung, kein Quellcode.
- **Beweis:** kein Code-Verhalten; Inventar-Liste vorher/nachher im Commit-/PR-Text.
  **Aufwand S · Sonnet.**

### P1 — verhaltensneutraler Code (~1 Session)

#### H-4 · Tot-Sweep src *(B1 · B3 · B4 · B5 · B6 · B8)*
- **Kern:** belegte 0-Referenz-Exporte entfernen (beleg-haerte: alle Stichproben bestätigt):
  - **B1:** `internerRechtsprechungLink` (`src/lib/bge.ts:80`; Folge-Typ `RechtsprechungsLink`
    mitprüfen) · `_leereRevisionCache` (`artikel-revisionen.ts:138`; im Commit als **bewusst
    entfernt, nie test-genutzt** ausweisen — Geschwister-Seams `_leereShardCache`/
    `_leereKantenShardCache` SIND test-genutzt und bleiben; niemand soll «Symmetrie reparieren») ·
    `vergissAnker` (`scrollAnker.ts:39`).
  - **B3:** `src/lib/haeufigGebraucht.ts` komplett + describe-Block
    `startseiteConfig.test.ts:280–296` (Test prüft ausschliesslich das tote Modul — kein
    §6.3-Verstoss). Commit-Offenlegung: «David-Auftrag 7.6., abgelöst durch Startseite V2/V3;
    bei V3-Abnahme-Veto via git-Historie wiederherstellbar» (V3-Abnahme steht noch aus).
  - **B4:** `src/components/RechnerKarte.tsx` + nur die RechnerKarte-Assertions in
    `katalog.test.tsx`. **Pflicht-Vorcheck** (nicht «kurz»): `FAHRPLAN-STARTSEITE-V3.md`
    (Rest: Zuletzt-Titel) auf geplante Wiederverwendung prüfen, Negativ-Beleg in den Commit.
  - **B5:** `browse.ts`: `gruppiereNachGebiet`/`baueBaender`/`bandFuerToken` + `interface Band`
    + zugehörige Testfälle; genutzte Nachbarn (`gruppiereNachKanton`, `filtern`, Lade-Funktionen)
    unangetastet.
  - **B6 (EIGENER Commit, Planungs-Semantik):** `ZIEL_DOKUMENTE`+`fortschrittProzent`
    (`variantenInventar.ts`) + Test-Assertions — referenziert Davids gestrichenes
    1000er-Ziel (16.6.2026, Memory Vertrags-Varianten); Inventar + Zähl-Funktionen bleiben
    (Drift-Wächter). Der Test assertet hartkodiert `17` und bräche bei jedem Inventar-Zuwachs
    — Entfernung ist Gewinn.
  - **B8:** `src/lib/konventionen.ts` NICHT löschen, NICHT verschieben — Kopfkommentar
    «bewusstes Test-only-QA-Werkzeug (lintet generierte Texte); 3 Test-Konsumenten» (billigste
    Variante; Move würde 3 Import-Pfade ohne Zusatznutzen anfassen).
- **Beweis (G1):** tsc + Tests unangepasst (ausser deklarierte Tot-Test-Löschungen) + Build;
  golden als Mitläufer. **Aufwand S · Sonnet.**

#### H-5 · Skript-Inventar-Durchgang scripts/ *(B2 · B7+B29 fusioniert · Beifang B9-Report-only)*
- **Kern:** EIN Inventar-Durchgang über `scripts/` (B7 und B29 überlappen: ti-miete,
  fedlex-manifest-audit, linien-korpus-verteilung, screenshots — nie doppelt behandeln):
  - **B2:** `alleErlassFassungen` (`erlass-rows.ts:181`) und `shaBotschaft`
    (`botschaften-generieren.ts:186`): **ZUERST** FAHRPLAN-/Dossier-Check (Botschaften-Pipeline
    erst am 10.7. gebaut — «tot nach 2 Tagen» ist schwache Evidenz; E4-Strecke steht bevor).
    Existiert ein Fahrplan-Anker → behalten mit TODO-Verweis auf den konkreten Schritt;
    existiert keiner → löschen mit **FAHRPLAN-Negativ-Beleg im Commit** (TODO ohne Anker
    ist selbst Drift).
  - **B7:** ~12 abgeschlossene Einmal-/POC-Skripte (Kopf sagt selbst «einmalig»/«POC» —
    Bestand am Bau-Tag nachzählen) nach **`scripts/archiv/` VERSCHIEBEN, nicht löschen**
    (Einmal-Generatoren sind Reproduzierbarkeits-Beweise für Datenstände, §11-nah), je mit
    1-Zeilen-Verweis auf den Ausführungs-Beleg. **AUSNAHMEN bleiben:** `p3-drop-inventar.ts`
    (P3 nur deferiert, ROADMAP-referenziert), `lexfind-discovery-run.ts` (wiederverwendbares
    Discovery-Werkzeug), `screenshots.ts` (manuelles Werkzeug, WERKZEUG-VERDRAHTUNG.md).
  - **B29:** Dreiteilung der 18 unverdrahteten Top-Level-Skripte: (a) echte Pflege-Generatoren
    als npm-Scripts verdrahten (`gen:plz`, `gen:strassen`, `abnahme:dossiers` …) ·
    (b) Einmal-Generatoren → `scripts/archiv/` bzw. `scripts/generatoren/` mit 5-Zeilen-
    README-Index · (c) Bibliotheksmodule (verfall-parse, abnahmeDossier, fedlex-pins — von
    anderen Skripten importiert) unangetastet. Der abnahme-dossiers-Drift-Guard
    (TODO im Kopf: regenerieren + `git diff --exit-code`) nur wenn Regeneration <60 s, und
    dann als **eigener kleiner PR** (neues rotes Tor = sichtbar deklarierte CI-Änderung).
  - **Beifang B9 (Report-only):** knip ODER ts-prune mit Vite-/Playwright-freundlicher Konfig
    (Einstiege main.tsx/entry-server/scripts-CLIs/vite-alias html2canvas-stub; Test-Seams
    `_leere*Cache` + CLI-Doppelrollen-Skripte als Entrypoints/ignoriert) als
    `npm run check:tot` **NUR Report, KEIN rotes Tor** — ~600 der 654 Funde sind
    `export type` ohne Laufzeit-/Korrektheitskosten; Chargen-Abbau ist Token-Verbrennung
    (roi-Verdikt). Tor-Frage frühestens nach stabilem Null-Stand UND nach G2 neu bewerten.
- **Fläche:** `scripts/**` · `package.json`; kein Prod-Code.
- **Beweis:** kein golden nötig; betroffene npm-Scripts je 1× lauffähig belegt.
  **Aufwand M · Sonnet.**

#### H-6 · Kanton-Typ/KANTONE-Konsolidierung *(B12)*
- **Kern:** `src/data/tarif/typen.ts`: `export type KantonCode = Kanton` (Alias auf
  `types/legal.ts`) + `KANTONE` aus `lib/kantone.ts` re-exportieren statt neu deklarieren
  (beide Listen wertgleich in amtlicher Reihenfolge verifiziert; TS-Union-Reihenfolge
  irrelevant). Keine Konsumenten-Änderung (Namen bleiben, 24 KantonCode- + 111
  legal-Importe unberührt). **Auflagen (regel-treue):** (a) `lib/kantone.ts` exportiert
  MUTABLES `Kanton[]` → vor Instanz-Teilung grep auf Mutationen (`.sort(`/`.push(` auf
  KANTONE); Re-Export in typen.ts als `readonly Kanton[]` (bestehender readonly-Vertrag der
  Tarif-Konsumenten bleibt), besser beide Seiten `readonly`/`Object.freeze`; (b) Kommentar in
  kantone.ts über bewusst abweichende LOKALE Listen (KombinierteAnsicht, LohnfortzahlungForm,
  Vorsorgeauftrag) erhalten — diese NICHT mitkonsolidieren. Kein neuer Zyklus (data→lib
  existiert schon).
- **Beweis:** tsc + Tests unangepasst + golden byte-gleich (Engine-Fläche real gedeckt).
  Gegenprüfung: Tor triggert auf `src/data/tarif/**` → Quittung mitführen (G3).
  **Aufwand S · Opus** (Risikopfad-Berührung).

#### H-7 · SG-GebT-60.13-Staffel-Generator *(B16)*
- **Kern:** das 5× wörtlich duplizierte 183-Bänder-Literal in `src/data/tarif/beurkundung.ts`
  (Z. 266/294/322/343/523, alle DERSELBE Erlass GebT sGS 821.5 Nr. 60.13 → regime-GLEICH
  i.S.v. §1/§4) durch datei-lokalen Generator ersetzen. **Massnahme-Korrektur (beide
  Kritiken):** Generator MUSS Bänder-Anzahl UND Kappe parametrieren —
  `sg6013Baender(anzahl, kappeChf)` — sonst ist die 45-Bänder/3'850-Stiftungs-Variante
  (Z. 367) nicht **struktur-gleich** reproduzierbar (183 Bänder mit Kappe 3850 wären
  verhaltens-, aber nicht array-gleich). Nur das Array teilen — `hinweis`/`artikel`-Felder
  und die fachlichen Unterschiede (Bemessungsgrundlage, Halbierung) bleiben je Stelle
  unangetastet. Einziger Befund mit **belegtem Drift-Vorfall** (QS-GP 2.7. musste 5 Stellen
  synchron anfassen) → beste Fehlerrisiko-Senkung pro Zeile.
- **Beweis:** Beurkundungs-/Paritätstests unangepasst grün (AG-Gründung-Parität, 10'032
  Vergleiche, als Haupttor) + golden + **gegenpruefung-Quittung (G3, Risikopfad
  `src/data/tarif`)**. **Aufwand S · Opus.**

#### H-8 · Import-Zyklen auflösen + Gate *(B21 → B22 → B23, Reihenfolge zwingend)*
- **Kern:**
  1. **B21 (Wert-Zyklus, echtes Laufzeit-Risiko):** `NormChip` aus `vorlagen/ui.tsx` in
     eigene Datei `src/components/vorlagen/NormChip.tsx` (reiner Move, exakt gleicher
     Export-Name/Props, keine Gelegenheits-Umbenennung) — löst beide Komponenten-Zyklen
     (NormText → ui → NormPopover → ArtikelBody → NormText).
  2. **B22 (Typ-Zyklen):** `ErlassRegistereintrag`/`Rechtsgebiet`/`Grundart`/`ErlassTyp` →
     `src/lib/normtext/register-typen.ts`; `register.ts` re-exportiert mit
     **`export type { … }`** (isolatedModules — nie Wert-Import erzeugen). `OclParagraph` →
     `scripts/normtext/adapter-typen.ts`. **Achtung:** `bund-stubs.generated.ts`/
     `grundart.generated.ts` NIE von Hand editieren — Generator-Template anpassen, sonst
     überschreibt der nächste Lauf den Fix.
  3. **B23 (Gate, erst NACH 1+2):** `check:zyklen` = `npx madge --circular --extensions
     ts,tsx src` (~1,5 s), auf 0 kalibriert, in `check:seriell` — nie ein rotes Tor am Tag 1.
- **Abgespalten (G2):** ESLint `@typescript-eslint/consistent-type-imports` = repo-weiter
  Autofix-Churn → erst nach PR-Kette #164/#165, zunächst warn-only.
- **Beweis:** madge-Diff vorher/nachher + tsc + Tests/e2e unangepasst (G1: golden für den
  Komponenten-Move irrelevant; für register.ts-Fläche golden als Mitläufer).
  **Aufwand S · Sonnet.**

### P2 — Risikopfade gegated + deklarierte Änderungen

#### H-9 · Format-/Parse-SSOT `src/lib/format.ts` *(B14≡B20 · Beifang B18 · B15 nur Kommentare)*
- **Kern:** neutrales `src/lib/format.ts` als Heimat der fachneutralen Formatter
  (Duplikat-Ursache ist strukturell: `vorlagen/` ist Risikopfad-Namespace, darum kopieren
  Engine-Dateien lieber lokal). `vorlagen/datum.ts` re-exportiert unverändert — kein
  Konsument bricht. Die 6 byte-identischen `chfGanz`-Reimplementationen ersetzen
  (`staffel.ts:124`, `prozesskosten.ts:621/784`, `notariatGrundbuch.ts:138/160`).
  **Korrekturen (beide Kritiken):** `prozesskosten.ts:783` `f` ist NICHT identisch
  (nullable-Wrapper) → als Wrapper um `chfGanz` belassen, nicht ersetzen. Der Kommentar über
  `chfGanz` («BEWUSST verschieden von `chf` [zwei Dezimalen] — nicht zusammenführen, §1»)
  **wandert mit**; `chf` und `chfGanz` bleiben getrennte Exporte. · **Beifang B18:** nur die
  KONSTANTE `export const ISO_DATUM_RE` in `datumsUtils.ts` zentralisieren, Kopien nur in
  ohnehin offenen Dateien ersetzen — **NIE auf `istGueltigesISO` umstellen**
  (Regex akzeptiert 2026-02-30; Umstellung wäre Verhaltensänderung). · **B15 (abgewertet):**
  die ~6 lokalen Schweizer-Zahl-Parser (`lohnZahl`, `num` …) NICHT mergen — Kommentar
  «bewusst lokal, Randsemantik [leer→NaN vs. null] verschieden von `vorlagen/datum.zahl`»
  je Stelle; Merge nur als optionaler Beifang, wo Äquivalenz trivial schriftlich belegbar
  (z. B. `num(x) > 0` ≡ `(zahl(x) ?? 0) > 0`) — §1: lieber Duplikat. · Danach
  Konventionszeile in CLAUDE.md/engine-map: «Formatter-Heimat = `lib/format.ts`».
- **Beweis:** golden byte-gleich (Fläche real gedeckt) + Tests unangepasst +
  **gegenpruefung-Quittung (G3: tarif/prozesskosten/vorlagen)**. **Aufwand M · Opus.**

#### H-10 · §6.6 billig: Gesetze.tsx + Startseiten-Kataloge *(B27 · B26)*
- **Kern:** **B27:** `Gesetze.tsx` (846 Z., 10 bereits abgegrenzte lokale Komponenten):
  BundSystematik/KantonSystematik/KantonAuswahl(+Kachel) als reiner Move nach
  `src/pages/gesetze-teile/`, Props unverändert, Ziel <500 Z. — billigster §6.6-Fix. ·
  **B26:** `startseiteVorlagen.ts` (1148 Z.) + `startseiteKarten.ts` (890 Z.) entlang der
  vorhandenen Rubrik-Blöcke in je 2–3 Teilmodule, im bisherigen Modul per Spread
  zusammengeführt (Spread-Reihenfolge = Original-Key-Reihenfolge).
- **Beweis (G1):** B27 e2e-Gesetze unangepasst; B26 **Vorher/Nachher-
  `JSON.stringify(VORLAGEN/KARTEN)`-Vergleich** als Commit-Beleg (golden deckt
  Startseiten-Records nicht). **Aufwand S · Sonnet.**

#### H-11 · zahl()-Eingabe-Parser: Entdopplung + deklarierte Harmonisierung *(B13, EIGENER PR, 2 Commits)*
- **Kern:** 7 copy-paste-Parser in `src/components/forms/` mit realer Drift (verifiziert):
  (a) mit `n>=0`-Guard (Grundbuch/Beurkundung/NotariatGrundbuch), (b) ohne Guard
  (Prozesskosten/Streitwert/GebvKosten), (c) BgerRechtsweg als EINZIGER Apostroph-tolerant
  **und mit Rückgabe `number|null` statt `number|undefined`** (Beleg-Härte-Präzisierung —
  nachgelagerte `=== undefined`-Logik je Aufrufstelle beachten/mappen).
  - **Commit A (verhaltensneutral):** geteilter Helfer `src/components/forms/eingabe.ts`,
    alle drei Varianten EXAKT parametriert (Guard, Toleranz, Rückgabe-Konvention) — Verhalten
    je Formular byte-gleich.
  - **Commit B (deklarierte UI-Änderung):** Apostroph/Leerzeichen-Toleranz für alle 7
    harmonisieren (nach oben = mehr akzeptierte Eingaben; «1'000'000» rechnet dann überall
    statt nur im BGer-Rechner). Keine Rechtslogik, aber NICHT §6-neutral → sichtbar
    deklariert, Autonom-Modus deckt es nur offen ausgewiesen. Guard-Unterschiede (a)/(b)
    exakt beibehalten.
- **Beweis:** Commit A: tsc + Tests/e2e unangepasst. Commit B: e2e-Beleg der neuen
  Eingaben + Formulare-Grundsatz (kein Fehler vor Eingabe) unangetastet.
  **Aufwand S · Opus** (Formular-Semantik).

#### H-12 · Vorlagen-Schema-Konventionstest *(B28 — Verifikations-Infrastruktur, LERNPHASE Strang B)*
- **Kern:** zentrales `ALLE_VORLAGEN_SCHEMAS`-Register (analog `AG_ALLE_SCHEMAS`;
  `scripts/abnahme-dossiers.ts` listet de facto schon — dort abschreiben) + EIN
  Konventionen-Test über ALLE ~52 Module: Baustein-IDs eindeutig · Gates auflösbar ·
  `ausgabeArt` gültig · `assemble()` wirft nicht **mit gate-erfüllenden Defaults**
  (roi-Korrektur: Gates dürfen legitim werfen — nicht blind mit leeren Defaults testen).
  KEINE fachlichen Assertions je Vorlage (bleibt Davids Abnahme, §1/Zeitsperre). Register in
  Test-/Script-Land halten (kein Produktions-Bundle-Gewicht).
- **Beweis:** neue Prüflogik, golden byte-gleich unberührt; Trailer
  `Gegenpruefung: n/a — reine Prüflogik` falls das Tor auf `src/lib/vorlagen`-Berührung
  triggert (nur Test-Register, keine Inhaltsänderung). **Aufwand M · Opus.**

### P3 — grosse Splits + Rekonstruktions-Doku (NACH Abschluss PR-Kette #164/#165, G2)

#### H-13 · §6.6 gross: ZustaendigkeitForm → gesetz-leser/inhalt.tsx *(B25 zuerst, dann B24 gedeckelt)*
- **Kern:** **B25:** `ZustaendigkeitForm.tsx` (1093 Z., Logik schon in
  `useZustaendigkeitForm.ts`): Schritt-JSX in Teil-Komponenten nach dem Ordner-Muster
  (StrafZustaendigkeitTeil/SchkgZustaendigkeitTeil); Engine `zustaendigkeit.ts` bleibt §4-tabu.
  **B24:** `inhalt.tsx` (1243 Z., 14 return-Stellen): NUR reine JSX-Blöcke nach `parts/`
  (Kandidaten: Portal-/Menü-Overlays, Fusszeile, Leitfall-Leiste), **Ziel <800 Z. genügt —
  keine Vollzerlegung** (jede weitere Extraktion kauft Token-Ersparnis mit realem
  Hook-Reihenfolge-Risiko). **Leitplanken (Memory React-Compiler-aus):** Compiler ist NICHT
  aktiv — extrahierte Kind-Komponenten ändern Re-Render-Granularität; keine
  ref.current-lesenden Helfer in neue Komponenten-Körper; die 14 Early-Returns exakt in
  Reihenfolge erhalten. Kollisions-Precheck: `inhalt.tsx`/`parts.tsx` sind Kollisionsfläche
  von W2·5b/W2·5d — Worktree-Abgleich zwingend.
- **Beweis (G1):** B25 `zustaendigkeit.test.ts` (766 Z.) unangepasst + e2e; B24 e2e-Suite (89)
  + golden (Reader-Fläche) + manuelle Sichtprüfung. **Aufwand M+M · Opus.**

#### H-14 · engine-map-Nachführung *(B33)*
- **Kern:** `bibliothek/register/engine-map.md` (stale seit 11.6.): je neue Modul-Familie
  seit 11.6. eine Zeile (Normtext-Pipeline/Gesetze-Rubrik · Rechtsprechungs-Korpus +
  entscheide-Adapter · `src/lib/materialien/` · Prozesskosten-Kriterien I4 · Botschaften/
  Revisionen/Vernehmlassungen/Staatsverträge), den unformatieren bger-Commit-Blob auf eine
  Tabellenzeile destillieren. **Auflage:** Destillat erfindet keine Status-Behauptungen —
  Quelle je Zeile nennen (INDEX-Eintrag/STRUKTUR-Karte).
- **Beweis:** read-only-Doku. **Aufwand M · Opus** (Rekonstruktions-Rechercheanteil —
  nicht in den mechanischen H-1-Sweep mischen).

---

## §Z · Verworfen / Gesperrt / Eskaliert (explizit, mit Grund)

| Posten | Verdikt | Grund |
|---|---|---|
| **B9 Vollausbau** (knip als rotes Tor + Chargen-Abbau ~650 Exporte) | **VERWORFEN** | ~600/654 sind `export type` — weder Bundle- noch Korrektheitskosten; 28-Checks-Kette schon lang; hohes False-Positive-Risiko (Vite-Alias, generated, Test-Seams, CLI-Doppelrollen). Nur Report-only-Beifang in H-5; Tor-Frage nach Null-Stand + G2 neu bewerten. |
| **B15 Parse-Idiom-Merge** (~6 Stellen Vorlagen/Formulare) | **ABGEWERTET auf Kommentar** | Äquivalenz-Beweis je Stelle im Risikopfad Vorlagen teurer als das Duplikat je kosten wird; §1 «lieber Duplikat». Kommentar-Kennzeichnung in H-9; Merge nur als trivial belegbarer Beifang. |
| **B17 postenText/ngPostenText** | **VERWORFEN (belassen)** | 2 Aufrufer, 2 Parameter-Achsen + 2 echte Verhaltensunterschiede (von===bis-Kollaps, Fallback-Wortlaute) → Abstraktion komplexer als die zwei Kopien; fasst 2 Risikopfad-Dateien für ~10 Zeilen an. Höchstens Querverweis-Kommentar. |
| **B11 Code-Teil** (Alt-Engine `notariatsgebuehrenGruendung.ts` ablösen) | **GESPERRT ohne David** | Bewusste fachliche Rest-Divergenz BE > 20 Mio ('offen' vs. 20-Mio-Stufe; Memory Offene-Tarif-Punkte führt sie als bewusst offen) — §4 verlangt regime-treuen fachlichen Entscheid = Davids Fachzeit → kollidiert mit Abnahme-Zeitsperre (1.12.). Paritätstest (10'032 Vergleiche) gated Drift bereits; Schaden des Wartens ≈ 0. **In die Entscheid-Queue für David** (Entscheidungsvorlage: welches BE>20-Mio-Verhalten überlebt). Doku-Teil (Memory-Austrag) läuft in H-1. |
| **B40 Fachteil** (NE-Umzugsprüfung + 10 Fedlex-Wiedervorlagen per 1.8.) | **SCOPE-FREMD, eskaliert** | Currency-Fachpflege, nicht Code-/Bibliothek-Optimierung; re-pin kollidiert mit «Gesetze-Update RUHT bis David-Freigabe» + offenem P1-a/b. → eigener Currency-Slot (P1-Rhythmus, `gen:fedlex-wiedervorlage`), geführt unter ROADMAP «Pflege & Termine». **NE-Prüfung (ne.ch, read-only) ist per 12.7. FÄLLIG** — als eigenständiges TODO an den Orchestrator gemeldet; bei Ausführung Skill `scraping-swiss-official-sources` laden. Kopf-Datum läuft in H-1. |
| **inhalt.tsx-Vollzerlegung** | **VERWORFEN** | Ziel <800 Z. genügt; weitere Extraktion = Hook-Reihenfolge-Risiko ohne Korrektheitsgewinn (H-13-Deckel). |
| **ESLint `consistent-type-imports` als Autofix-Sweep** | **DEFERIERT (G2)** | Repo-weiter Churn kollidiert mit PR-Kette #164/#165; danach warn-only einführen (H-8-Nachtrag). |
| **konventionen.ts-Move nach tests/helfer** | **VERWORFEN (Kommentar-Variante)** | Move = 3 Import-Pfad-Edits ohne Zusatznutzen; Kopfkommentar + knip-Whitelist erreichen dasselbe (H-4/B8). |
| **Löschen der Einmal-Skripte** | **VERWORFEN (Archiv-Move)** | Einmal-Generatoren = Reproduzierbarkeits-Beweise für Datenstände (§11-nah); Daueranweisung verlangt «verhaltensneutral belegt» → `scripts/archiv/` + Beleg-Zeile (H-5). |

---

## §B · Beleg-Qualität je Befund (Kritik-Durchgang beleg-haerte: 13 Repo-Stichproben, alle Greps/Reads selbst ausgeführt; 12 voll bestätigt · 1 teilkorrigiert · 0 erfunden)

| Befund | Beleg | Anmerkung |
|---|---|---|
| B1 tote src-Exporte | **BESTÄTIGT (Stichprobe), hoch** | je exakt 1 Treffer = Deklaration; Seam-Asymmetrie verifiziert |
| B2 tote scripts-Exporte | **BESTÄTIGT (Stichprobe), hoch** | ABER Absichts-Frage offen (Pipeline 2 Tage alt) → FAHRPLAN-Check Pflicht (H-5) |
| B3 haeufigGebraucht | **BESTÄTIGT (Stichprobe), hoch** | nur Test-Konsument Z. 280–296 |
| B4 RechnerKarte | **BESTÄTIGT (Stichprobe), hoch** | nur katalog.test.tsx:9/221 |
| B5 browse.ts | **BESTÄTIGT (Stichprobe), hoch** | Trennlinie zu genutzten Nachbarn stimmt |
| B6 variantenInventar | **BESTÄTIGT (Stichprobe)** | deckt sich mit David-Entscheid 16.6. |
| B7 Einmal-Skripte | plausibel, nicht stichprobiert | Bestand am Bau-Tag nachzählen (Zähl-Ungenauigkeit in dieser Charge 2×) |
| B8 konventionen.ts | **BESTÄTIGT (Stichprobe), hoch** | genau 3 Test-Importer |
| B9 654 Über-Exporte | plausibel, Zählung ungeprüft | vor jeder Tor-Entscheidung eigene Nachzählung |
| B10≡B30 Branches | **TEILKORRIGIERT** | real **16** gemergte Feature-Branches (17 Zeilen inkl. `main`); `feat/bge-bis-2020` erscheint in `--merged` (Falschdetail in B10); Pfadangaben widersprüchlich → frisch inventarisieren |
| B11 Alt-Engine live | **BESTÄTIGT (Stichprobe)** | schritte-dokumente.tsx:4/88; SG-60.13-Rest ERLEDIGT (Z. 322/343 QS-GP-Kommentar 2.7.) |
| B12 Kanton-Doppel | **BESTÄTIGT (Stichprobe), hoch** | beide Listen Wert für Wert verglichen; lokale Abweich-Listen bewusst (nicht anfassen) |
| B13 zahl() 7× | **BESTÄTIGT (Stichprobe), hoch** | + Präzisierung: BgerRechtsweg `number\|null` vs. `number\|undefined` |
| B14≡B20 chfGanz | **BESTÄTIGT (Stichprobe), hoch** | + prozesskosten:783 NICHT identisch (nullable-Wrapper); chf/chfGanz-Trennkommentar wandert mit |
| B15 Parse-Idiom | plausibel, nicht stichprobiert | Massnahme ohnehin auf Kommentar abgewertet |
| B16 SG-60.13 5× | **BESTÄTIGT (Stichprobe), hoch** | + Generator braucht Anzahl-UND-Kappe-Parameter |
| B17–B29 (übrige Code) | plausibel, nicht stichprobiert | B21 Wert-Zyklus zusätzlich **BESTÄTIGT (Stichprobe), hoch** (Kette Zeile für Zeile) |
| B31 Barrel-Positiv | plausibel | Konvention festhalten genügt |
| B32 SH-Doppel-Wahrheit | **BESTÄTIGT (Stichprobe), hoch** | + Pfad-Korrektur: dritte Fundstelle `src/data/zustaendigkeitKosten.ts:141` |
| B33–B41 (Bibliothek) | plausibel, nicht stichprobiert | reine Doku-Fläche, Fehlerrisiko der Umsetzung gering; Zahlen am Bau-Tag frisch erheben |

---

## §S · Status-Log

- **12.7.2026:** Plan erstellt (Ultracode-Recherche + 3 Kritik-Linsen), ROADMAP-Schritt
  `W2·12-HYGIENE` angelegt. Noch keine Einheit gebaut. Nächster Schritt: H-1.
- **12.7.2026 (H-1 ✅, Worktree `lm-h1`, Branch `chore/h1-bibliothek`):**
  Bibliothek-Wahrheits-Sweep gebaut, 6 Pathspec-Commits. B32 (Prio 1, SH-
  Schlichtungsgebühr) behoben nachgezogen mit Beleg-Zitat + Commit-Hash
  `b7587a51` + dritter Fundstelle `zustaendigkeitKosten.ts:141`; B34/B35/B38/
  B41/B37-Vorbereitung (INDEX-Wahrheit/-Struktur); B39 (recherche-INDEX-
  Pauschale); B40-Kopf (Verfallsregister-Stand); B31 (Fassaden-Muster-
  Konvention CLAUDE.md §6 Ziff. 6); Memory-Austrag B19+B11-Teil-1. B36 ohne
  eigene Kern-Beschreibung im Plan — durch den INDEX-Wahrheitssweep
  mitabgedeckt (Nachtrag für die nächste Synthese-Revision). `npm run gate`
  GRÜN, `check:bibliothek` grün, Gegenprüfung n/a (reine Doku). Nächster
  Schritt: H-2 (läuft zwingend NACH H-1, §0 Regel 2).
- **12.7.2026 (H-2 ✅, Worktree `lm-h2`, Branch `chore/h2-bibliothek-check`):**
  bibliothek-check-Scope dichtgemacht (B37). `scripts/bibliothek-check.sh`:
  S7.1-Loop (Haupt-INDEX-Zeile) UND S1-Loop (Pflichtkopf) auf `materialien/`,
  `normtext/`, `seo/` erweitert; S7.1 zusätzlich generisch auf lose Root-`*.md`
  (INDEX.md selbst ausgenommen) — S1 bewusst NICHT auf Root, da INDEX.md/
  STANDARDS.md Meta-/Regeldokumente sind, keine Fach-Dossiers (Root ist seit
  H-1/B38 ohnehin leer von Streu-Dateien). `bibliothek/STANDARDS.md` S1-
  Ordnerliste nachgezogen. Reihenfolge zwingend eingehalten: erst Report-Lauf
  gegen den erweiterten Scope, 3 echte Neu-Verstösse gefunden
  (`materialien/vernehmlassungen-2026-07-10.md` + `normtext/revisionen-
  2026-07-10.md` ohne S1-tauglicher **Stand**/**Status**-Zeile,
  `seo/cwv-baseline.md` ohne **Status**-Zeile) und im selben Commit behoben,
  DANN erst das erweiterte Gate exit-1-scharf. Negativ-Beweis lokal geführt
  (Test-Datei in `seo/` ohne Kopf/INDEX-Zeile bricht das Gate, Entfernen
  macht wieder grün). `npm run gate` GRÜN, `check:bibliothek` grün,
  Gegenprüfung n/a (Prüf-Infrastruktur). Nächster Schritt: H-3.
- **12.7.2026: H-4 ✅** Tot-Sweep src (B1/B3/B4/B5/B6/B8), je Posten eigener Commit
  (Branch `chore/h4-tot-sweep`): B1 `internerRechtsprechungLink`+`_leereRevisionCache`+
  `vergissAnker` entfernt (Geschwister-Seams `_leereShardCache`/`_leereKantenShardCache`
  bewusst unangetastet) · B3 `haeufigGebraucht.ts` + Test komplett weg · B4 `RechnerKarte.tsx`
  + Assertions weg (Vorcheck FAHRPLAN-STARTSEITE-V3.md: kein Wiederverwendungs-Treffer) ·
  B5 `browse.ts`: `gruppiereNachGebiet`/`baueBaender`/`bandFuerToken`/`interface Band`/
  `GebietGruppe` weg, genutzte Nachbarn unangetastet · B6 (eigener Commit) `ZIEL_DOKUMENTE`/
  `fortschrittProzent` weg (Davids gestrichenes 1000er-Ziel) · B8 `konventionen.ts` NICHT
  verschoben, nur Kopfkommentar. Beweis G1 (tsc+vitest+golden+lint grün, `npm run gate` voll
  grün); Gegenprüfung für die beiden Risiko-Dateien (browse.ts/variantenInventar.ts)
  unabhängig als reine Diff-Verifikation gefahren (nur `-`-Zeilen, kein Norm-/Tarif-Wert
  berührt) und quittiert. Nächster Schritt: H-5.
