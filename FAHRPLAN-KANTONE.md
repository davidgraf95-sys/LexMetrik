# FAHRPLAN — Kantonale Gesetze & Darstellung (Ultracode-Synthese 12.7.2026)

> **ROADMAP-Schritt:** `W2·13-KANTONE` (Welle 2, hinter den laufenden Reader-/Verzahnungs-Strängen).
> **Auftrag David 12.7.2026 (wörtlich):** «recherche mit ultracode zu kantonalen gesetze und
> deren darstellung und setze befunde um».
> **Quelle:** Ultracode-Recherche 12.7.2026 — 44 Befunde **F1–F44** (Register-/Korpus-Zählungen ·
> Live-Abgleiche gegen Amtsquellen bgs.zg.ch/bgs.so.ch/ar.clex.ch · Playwright-Proben gegen Prod ·
> Code-Lektüre Reader/Suche/Adapter) plus 3 adversariale Kritik-Linsen: **regel-treue** (42
> Verdikte, 0 Streichfälle, 1 Massnahme ersetzt, 5 Bündelungen), **beleg-haerte** (10 Befunde
> selbst re-verifiziert, davon 4 live an der Amtsquelle; 4 Korrekturen), **praxis-roi**
> (8 Repo-Spot-Checks, alle bestätigt; Bündelung + Priorisierung).
> Dieses Dokument ist die **Synthese**: Verdikt-gefilterte Befunde, zu Bau-Einheiten gebündelt
> (§14.2), **sofort baubare Einheiten zuerst** (kantons-einzelne Fixes, Display-/UI-Schicht),
> **gegatete 26×-Einheiten klar dahinter** (Slot durch E3/W2·6-DATA belegt). Verworfenes steht
> explizit mit Grund (§Z), Beleg-Qualität in §B, Korrekturen aus den Kritiken in §K.
>
> **Bilanz:** 44 Befunde → Dubletten-Merges (F43≡F6 · F15≈F8 · F27 zerfällt in F9/F11 + Rest-Item)
> → **41 netto** → **39 übernommen** (davon 7 mit korrigierter/verschärfter Massnahme aus den
> Kritiken) · **1 Massnahme ersetzt** (F10-Client-Kanton-Index → F35/F36, Arbiter-Entscheid) ·
> **1 Positivbefund ohne Aktion** (F34 Mobil/§-Weiche = Verifikations-Baseline).
> Kein Befund verlangt Headless-Scraping; keiner verletzt den OCL-Schema-Entscheid (11.7.:
> kein korpusweiter json_content-Wechsel).

---

## §0 · Verbindliche Prozess-Regeln (gelten für JEDE Einheit dieses Plans)

1. **G1 — Amtsquellen-only (§7 + Lizenz-Leitplanke).** Texte/Metadaten/PDF ausschliesslich von
   den amtlichen Kantonsportalen (bgs.*, *.clex.ch, gesetzessammlung.bs.ch, m3.ti.ch, sz.ch,
   zh.ch, VD BLV …). **lexfind.ch nur als Fakten-/Lücken-Signal** (Enumeration, Versions-Heuristik),
   nie als Text-/PDF-Quelle, nie Aggregator-Dateien einbacken. Quell-Menü **je Kanton empirisch**
   erheben (Daueranweisung; GL-Lektion `/app/` vs `/api/` — Content-Type prüfen, Angular-Shells
   erkennen). **Headless ist KEIN zulässiger Fallback** — bietet ein Portal nur JS-gerendertes
   HTML: strukturierte Endpunkte/PDF oder Verzicht.
2. **G2 — 26×-Slot-Regel (Leitprinzip 4).** Der Slot ist durch **E3 (W2·6-DATA)** belegt. Nie
   zwei 26-Kantone-Massenläufe parallel. **Kantons-einzelne Fixes und Display-/UI-Schicht sind
   frei**; jeder korpusnahe Lauf (≥ ~3 Kantone Regeneration, 26-Kantone-Läufer, Vollkorpus-Import)
   ist eine **gegatete Einheit** (§1-B) — nur vorbereiten, nicht starten. Sequenzielle
   Kantons-Tranchen dürfen nicht als Schlupfloch für einen faktischen Vollkorpuslauf dienen
   (regel-treue-Auflage zu F1/F4). Sonderfall: ein **BS-Neulauf (859 Erlasse)** ist formal 1 Kanton,
   faktisch ein Massenzugriff auf einen Amts-Host → Tranchen + Rate-Limit + eigene Bau-Einheit.
3. **G3 — Gegenprüfungs-Pflicht (Skill `gegenpruefung`, Tor `check:gegenpruefung`).** Zwingend
   bei allen Tarif-/Extraktions-Risikopfaden dieses Plans: **K-4, K-6, K-7, K-14** sowie jeder
   Regeneration eines Tarif-Belegs (FR-261.16/8428, SG-2935/3849, TI-Gerichtskosten, SZ-Notariat,
   ZH-AnwGebV, VD-Notariat/Steuer, GL-Gebührentarif). Quittung `npm run gegenpruefung:ok`,
   Trailer `Gegenpruefung:` am Commit. PDF-Extraktion zusätzlich mit **pdfplumber-Gegenprobe**
   (nicht-lasttragend, s. W3·12-Werkzeug-Fund B3).
4. **G4 — Harte Sequenz-Constraints.**
   - **F20 (Dehyphenation) VOR jedem FR/VS/AR-PDF-Nachzug** — sonst stille Regression
     («se - condaire»); Snapshots FR-8428/VS-1413 bleiben bis dahin gesperrt.
   - **F41 (Art.-Self-Link-Unterdrückung) VOR oder MIT F40** (§-Selbstverweise) — sonst fehlt der Ersatz.
   - **Adapter-Fixes VOR Regenerations-Welle:** K-7 (Range-Platzhalter) + K-8 (<p>-Struktur)
     mergen, DANN K-G1 fahren — sonst zweite Welle. F13-Betroffenheits-Rescan NACH K-G1.
   - **K-G1/K-G2/K-G3/K-G4/K-G5 erst nach E3-Slot-Freigabe** (Etikett-Übergabe per
     `plan:set`-Commit, check.ts 5b).
5. **G5 — Beweis-Anker je Fläche.** Reader-/Display-Fixes: **golden byte-gleich für Bund beweisen,
   nicht annehmen** (F24-Auflage) + e2e/DOM-Reihenfolge-Test. Adapter-Fixes: Unit-Test mit dem
   echten Quell-Markup (AR-133.1, VD-105539-Negativfälle) + Golden-Diff korpusweit **offline**
   (additiv beweisen). Jeder Snapshot-Nachzug mit eigenem **version_uid-Drift-Token**; jede
   Fassungs-Entscheidung **gegen die Amtsquelle** (nie nach Datei-Alter). Zahlen am Bau-Tag frisch
   erheben, nicht aus diesem Audit abschreiben.
6. **G6 — Modell-Daueranweisung.** Bau = Opus (Default), Risikopfade IMMER Opus + `effort: high`;
   mechanische Display-Einzeiler (K-1c) Sonnet zulässig. Fable orchestriert nur.
7. **G7 — Davids Fachzeit.** Nichts in diesem Plan blockiert auf David (Zeitsperre 1.12.2026).
   Empfohlene Touchpoints (nicht blockierend): Kantons-Priorisierung K-G5 (ZH→BE→VD→AG→SG→LU→GE
   als Vorschlag) · spätere Abnahme der K-12-Kern-Erlass-Liste (Abnahme-Warteschlange).
   Push/Deploy bleibt §9.

---

## §1-A · SOFORT BAUBARE EINHEITEN (slot-frei; Ausführungsreihenfolge = Tabellen-Reihenfolge)

### K-1 · Reader-Treue P0 *(F24 · F25 · F28 · F33 · F29-Display · F5)* — Aufwand M, reine Display-Schicht

Schwerste §1-Verstösse des Laufs, alle live belegt, alle ohne Slot/Fachzeit:

| Teil | Fix | Beweis |
|---|---|---|
| a | **F24 Lesereihenfolge** (404/917 Erlasse, AG-291.150: § 6 vor § 1): `inhalt.tsx:1220–1226` rendert `ohneGliederung` vor `sektionen` → dokumentlinear interleaven nach Original-Index der `eintraege`. **Korrektur beleg-haerte:** Auslöser ist fehlende ODER nur **einteilige** Marginalie (Ahnen-lose Artikel, § 9 «Bemessung» landet ebenfalls dort) — Fix muss beide Fälle interleaven. | Golden-Test DOM-Reihenfolge == Snapshot-Reihenfolge (AG-291.150 + 2–3 weitere); **Bund golden byte-gleich beweisen, nicht annehmen** |
| b | **F25 Doppel-Decode** (`GesetzLeser.tsx:6`, react-router v7 liefert dekodiert): `decodeURIComponent` entfernen → 3 tote GL-Erlasse wieder erreichbar. Die GL-**Key-Migration** (%-freie Kanonik) läuft separat in K-6d. | e2e-Tor: jeder Register-Key über `/gesetze/kanton/<encodeURIComponent(key)>` erreichbar |
| c | **F28 «SR»-Label** (`ErlassLeserKopf.tsx:37`): bei `ebene='kanton'` Präfix weg (SAR/LS/BLV/GS tragen ihr Kürzel selbst). Ein-Zeiler, höchste Glaubwürdigkeits-ROI. | Snapshot-Test |
| d | **F33 Titel-Dopplung AI** («GebT — GebT»): Kopf-Logik Dopplung unterdrücken, wenn titel ohne Klammerzusatz == kuerzel; `formatiereDatum` auch im Verweis-/Fallback-Pfad. Echter Fix (AI-Volltitel datenseitig) → K-12-Liste. | Sichtprüfung 4 AI-Erlasse |
| e | **F29 Fussnoten-Stern Display-Strip** (589 Randtitel/186 Erlasse): NUR trailing «␣*» in **Marginalien** strippen — NIE generell «*» im Normtext (amtlicher Fussnotenmarker, §1). Extraktorseitiger Nachzug → K-G3. | Fixture mit AG-291.150/BS-413.820-Marginalien |
| f | **F5 A14-Relevanz fr/it** (`relevanz.ts:82-110`, 39 Latin-Erlasse + AG 0/4 ohne Kategorie): Muster um émolument(s)/tarif des frais/tariffa/legge tributaria/Anwaltstarif/Dekret erweitern. | Fixture-Test mit den 106 echten Dünn-Kanton-Titeln (`relevanz.test.ts`) |

> **STATUS-NACHTRAG A42 (16.7.2026, Reader-Treue Ingress/Gliederung/Marginalien/Fussnoten — gebaut, ✅):**
> Davids Referenzfall BS-154.100 «keine marginalen/keinen ingress/keine gliederung/keine fussnoten;
> ingress soll analog PDF verlinkt sein». **Root-Cause = Extraktor-Drop, KEINE Manifestations-Lücke:**
> die LexWork-API (`xhtml_tol`) enthält alle vier Ebenen. Fix in der richtigen Schicht (Struktur-Generator,
> `struktur-lexwork.ts`/`struktur-kanton-run.ts`), Ausgabe-Schema deckungsgleich zum Bund-Sidecar →
> Reader-Mechanik (ErlassKopfBlock/ArtikelBody-FnRef/baueGliederungsbaum) rendert Kanton wie Bund, 0 Renderer-Umbau.
> Gelöst: (1) **Gliederung** — Klassen-Reihenfolge `level_N title` (BS) zusätzlich zu `title level_N` (BE);
> (2) **Ingress/Kopf** — `extrahiereKopfLexWork` (Erlassformel autor/ingress/verb + Kopf-Fussnoten);
> (3) **Fussnoten** — `<div class='footnotes'>`-Apparat + Marker→Absatz, je Artikel + am Kopf;
> (4) **Ingress-/Fussnoten-Verlinkung** — `FnLink.intern` (Generator löst gehaltene Erlasse intern auf:
> kantonal `<KT>-<nr>` bei gleichem Amts-Host, Bund `db.clex.ch/link/Bund/<SR>` via Register; sonst amtlicher
> Fallback §8). **Nebenfixes (Gegenprüfungs-Befund):** `<strong>*</strong>`-Änderungsmarker + `&hellip;`-Platzhalter
> werden aus Marginalie/Token verworfen (kein fabrizierter `…`/`*`-Randtitel; kein Token-Drop «103 *»≠«103»).
> **Regeneriert (§3-Präsentation, bereits importierte Erlasse):** BS 850 + BE 5 Sidecars. **Residuen (Backlog, alle
> vorbestehend + orthogonal, von der Gegenprüfung bestätigt — KEIN Regress dieses Fixes):**
> (a) übrige LexWork-Kantone (AR 266 + ~22 kleine) = gegatete Folge-Tranche → **K-G3**;
> (b) **Suffix-Token-Mismatch (eigene Bau-Einheit empfohlen):** der Struktur-Extraktor bildet «131a»/«2bis», der
> Snapshot/Konsistenz-Tor erwartet die Unterstrich-Form «131_a»/«2_bis» → suffigierte Artikel werden gefiltert;
> bei stark novellierten Erlassen ~30 % Deckungsverlust (BS-410.100: 156/221 Tokens). Fix = Token-Normalisierung
> analog `adapter-lexwork` (identisch in HEAD~1, hier bewusst NICHT mitgezogen — §14.2 nicht über-bündeln);
> (c) **FR/IT-Latenz:** `clean()` kollabiert Whitespace (schmales NBSP U+202F vor `; : ! ?`) — für die 855
> deutschsprachigen BS/BE-Sidecars folgenlos, aber vor einem Romandie-Lauf (K-G3) zu härten (scraping-Skill:
> NBSP/schmales NBSP verbatim);
> (d) 9 `RiE`/`BeE`-Erlasse mit Leerzeichen im Key sind über die API nicht fetchbar (Discovery-/Import-Bug).
> Beweis: Unit-Tests (real BS-Markup, beide Klassenfolgen, Platzhalter/Stern), `fnTextMitLinks`-intern-Test,
> Screenshots vorher(Prod)/nachher Desktop+Mobil gegen amtliches PDF, adversariale Gegenprüfung Opus bestanden.

### K-2 · §8-Ehrlichkeit UI *(F26-UI · F37 · F44 · F27-Rest · F43-Hinweis · F36-Hinweis)* — Aufwand S/M, reine Anzeige

- **a — F26-UI Currency-Chip zweistufig:** mit Beleg «geltend geprüft am …», ohne Beleg
  **«Snapshot vom … — Geltung ungeprüft»** (heute behauptet der Chip bei ZH-215.3, Stand 2011,
  unbelegt Geltung). Der 26-Kantone-Prüf-Läufer selbst = K-G2.
- **b — F37 KontextPanel:** bei `ebene='kanton'` Hinweis «Verknüpfungen zu Entscheiden/Materialien
  sind für kantonale Erlasse noch nicht erfasst» statt nackter 0-Gruppen (Kanten-Aufbau = K-9/K-14).
- **c — F44 Abdeckungs-Kontextzeile** in der Kanton-Ansicht: «n von ~N Erlassen der kantonalen
  Sammlung erfasst» + Link amtliche Sammlung + /abdeckung. **N nur ausweisen, wo empirisch belegt**
  (Enumerations-Fakt mit Datum dokumentieren), sonst weglassen — bindend.
- **d — F27-Rest:** leere `stand`-Felder (VD-106879/128150) → ehrlicher Kopf **«Stand unbekannt»**
  statt stiller Auslassung; Quell-Nachtrag beim VD-Durchgang K-7.
- **e — F43-Hinweis:** bei den 7 Kantonen ohne Systematik-Baum Hinweiszeile «amtliche Systematik
  folgt» statt nur «Nicht systematisiert» (Daten-Nachzug = K-13).
- **f — F36-Hinweis:** Online-Suchgruppe präzisieren «durchsucht Bund + Kanton, nur online».

### K-3 · Suche: Kanton-Treffer auf richtige Ebene *(F35 · F36)* — Aufwand S — **ersetzt F10**

- **F35:** Edge-DTO um `ebene` (+`kanton`) erweitern (`SQL_ARTIKEL_TREFFER` joint `erlasse` schon —
  `e.ebene` mitselektieren; `suche-kern.ts` + `api/suche.ts` + `onlineVolltext.ts`-DTO);
  `artikelTrefferHref` = `/gesetze/${ebene}/…`; Kanton-Marke am Treffer. Falschen Scope-Kommentar
  (`onlineVolltext.ts:83` «E2-hot-Scope = NUR Bund» — empirisch widerlegt) korrigieren (§8-Doku).
  Defense-in-depth: Reader redirectet bei `erlass.ebene ≠ URL-ebene` kanonisch (analog
  N0b-Case-Redirect, golden-neutral).
- **F36 (Arbiter über F10):** KEIN Client-Kanton-Index (K10/§15.3: würde den 17,7-MB-Index grob
  verdoppeln). Die Hot-FTS enthält die 30 420 Kanton-Artikel bereits — der Href-Fix schaltet die
  vorhandene Kanton-Volltextsuche frei. Optional, nachrangig: `kt:`-Filter in der Edge-Query.
- **Deploy-Hinweis:** `api/suche`-Änderung geht erst mit Davids §9-Ja live.

### K-4 · Einzel-Nachzüge Stand/Currency *(F14 · F9 + SO-Lektion)* — Aufwand S — **Risikopfad: Opus + gegenpruefung**

- **a — F14 ZG-161.7 nachziehen** (P0: seit 1.7. wird überholtes Recht serviert; live verifiziert
  version_uid `29bc3555…` ≠ Snapshot-Token `0129f9eb…`). Einzel-Nachzug mit frischem Drift-Token.
- **b — F9 SZ-213.512 (Stand 2027-02-01):** an der Amtsquelle sz.ch klären — **geltende** Fassung
  pinnen (§7 Build-Regel 3: künftige Fassungen nie verlinken) oder Stand-Parsefehler fixen.
- **c — Invariante «stand ≤ Generierungsdatum»** ins Offline-Tor `check:normtext` — fängt die
  ganze Klasse, egal ob Quirk oder echte Zukunfts-Fassung.
- **d — SO-Lektion (beleg-haerte-Korrektur 2):** bei SO-614.11 ist live version_uid ==
  Snapshot-Token — **das Drift-Tor kann die Platzhalter-Drop-Klasse prinzipiell nie melden.**
  Deshalb zusätzliche Netz-Tor-Invariante vorbereiten: «Artikel-Divs der Quelle == Einträge des
  Snapshots» (Stichproben-Modus; Voll-Lauf = K-G1/K-G2-Fläche).
- **e — Betriebs-Rhythmus klären:** läuft `check:normtext-netz`/`check-drift.ts` je Cron? Der
  1.-Juli-Schub ist der klassische Sammel-Stichtag (→ K-G2).

### K-5 · NormText-Verweise Kanton *(F41 → F40 → F42)* — Aufwand M, EINE Einheit (gleiche Datei), golden-neutral

1. **F41 zuerst (PLAUSIBEL, ~196 Stellen obere Schranke, Klasse im Code belegt):** in
   §-designierten Erlassen bare-«Art. N»-**Self-Sprung komplett unterdrücken** (Self ist dort
   immer «§»; Belegstellen BS-427.800 art_1, SO-615.11 art_12 als Regressionstests). Der Fix darf
   **NICHT** stattdessen automatisch auf Bundesrecht verlinken (Konvention = Indiz, kein Beweis —
   lieber kein Link, §1). Zusätzlich des/der-Guard passus-tolerant machen.
2. **F40 danach:** «§ N»-Selbstverweise verlinken (2 840 Artikel; RE analog `RE_PARAGRAF` aus der
   Tarif-Domäne, nur aktiv wenn Erlass §-designiert, Auflösung über bestehende tokenMap; Fremd-§
   mit Gesetzesnamen/Kürzel unterdrücken — bei Ambiguität wie «§ 18 StG» **kein Link**).
3. **F42 nachrangig:** Kanton→Kanton-Verweise per Sammlungsnummer (SAR/bGS/BR/LS/sGS …,
   **kantons-gescoped**, Register-Lookup, Chip NUR bei existierendem Snapshot, sonst Text —
   nie toter Link). Reader-Pass, kein Korpus-Rebuild.

### K-6 · Quellen-Hygiene: lexfind→amtlich + Dedupe *(F7 · F8+F15 · F11/#189 · F25-Keys · F22)* — Aufwand M — **Risikopfad: Opus + gegenpruefung**

Behebt den einzigen **bestehenden §7-/Lizenz-Verstoss im Korpus** (9 Snapshots mit
lexfind-quelleUrl: VD 7 · SZ 1 · TI 1), gebündelt als eine Bau-Einheit, pro Kanton eine Tranche:

- **a — F7 Dedupe-/Eindeutigkeits-Invariante** als Tor im browse-manifest: kanton + amtliche
  Systematiknummer eindeutig, lawId-Normalisierung vor Key-Bildung. Kanonik-Entscheid je Paar
  **gegen die Amtsquelle** (welche Fassung gilt?), nie nach Datei-Alter. **SG-2935/3849 ist KEIN
  Duplikat**, sondern Titel-Kollision zweier Erlasse → nichts löschen, nur Titel disambiguieren (§1).
  Paare: FR-261.16/FR-8428 · GL-Encoding-Zwillinge · TI-ti-125101/137.
- **b — F8+F15 lexfind-Umzug:** TI-ti-125101 (Stand 2010, 16 Jahre stale, Duplikat von TI-ti-137
  RL 178.200) entfernen/konsolidieren; die 9 lexfind-Quellen auf amtliche Portale umziehen
  (VD BLV, m3.ti.ch, sz.ch — **SZ-82040 mitprüfen**), je eigenes Drift-Token. Systemisch: für
  versions-gepinnte tolv-URLs misst quelleHash nichts (ewig gleiche Bytes) — Drift-Referenz auf
  amtliche Versionsinfo verankern; lexfind-API-Abgleich nur als **Heuristik-Signal** (G1).
- **c — F11/#189 PDF-Links miterheben:** beim selben Quellen-Umzug die amtlichen PDF-Aktionen der
  47 Erlasse ohne pdfUrl nachziehen (JU 7 · VD 7 · TI 5 · GE/NE/SZ 4 …) — nur amtliche Portale,
  nie lexfind-PDF (§14.2-Bündelung mit #189).
- **d — F25 GL-Key-Migration:** %-freie Kanonik (z. B. `GL-III-B.7.1`), **atomar** (Dateien +
  Register + alle Tarif-Hinweis-Links); Duplikat-Zwilling fällt per a weg. Gegenprüfung: kein
  Tarif-Zitat zeigt ins Leere. **Korrektur:** betroffener Erlass = Gebührentarif nach **ZGB**
  («Gebühren im Zivilrecht»), nicht «ZG».
- **e — F22 TI-Profil im selben TI-Durchgang:** «[N]»-Absatz-Marker als Splitter parsen
  (absatz-Feld füllen, Marker aus dem Text), Randtitel-Abgrenzung (F18) — **nie Absatznummern
  erfinden, wo kein Marker steht** (§1). TI-Neufassung von m3.ti.ch. Einmal regenerieren statt zweimal.

### K-7 · PDF-Werkstatt VD/SZ/ZH + Range-Platzhalter *(F20 GATE · F17a+F18 · F16 · F19 · F23 · F13)* — Aufwand M — **Risikopfad: Opus + gegenpruefung + pdfplumber-Gegenprobe**

- **a — F20 Dehyphenation ZUERST (hartes Gate, G4):** Zeilenend-«-» + Kleinbuchstaben-Fortsetzung
  → join ohne Leerzeichen; echte Bindestriche via Kontext schützen — **VD-105539 mit 51 echten
  Quell-Bindestrichen als Negativ-Fixture.** Erst danach FR-8428/VS-1413 (heute sauber!) für
  Nachzüge freigeben.
- **b — F17a Trailing-Cut + F18:** Dokumentende-Schnitt im VD-Profil (Revisionsapparat/
  Publikations-Furniture nach letztem echtem Absatz; Klasse eng: nur VD-106879 Art. 81 +
  VD-128150 Art. 34). **§1-Auflage: nur nachweislichen Nicht-Normtext schneiden — das Barème ist
  normativ und darf NIE stillschweigend wegfallen;** bis zur layout-bewussten Extraktion (K-G4)
  als explizit markierter Anhang quarantänisieren («Anhang nicht strukturiert erfasst» +
  amtlicher PDF-Link). TI-Randtitel dem Folge-Artikel zuschlagen.
- **c — F16 VD-210344:** Artikelkopf-Erkennung (Randtitel-Zeile vs. «Art. N»-Kopf, Geometrie-
  Orakel analog #162) → Art. 4–6 wiederherstellen, einzeln regenerieren.
- **d — F19 SZ-280.411:** Zeilen-Fragmente vor Konkatenation strikt nach x sortieren (stabil,
  Toleranzband); drei bekannte Stellen als Fixture; einzeln regenerieren.
- **e — F23 ZH-215.3 Zeile 1:** Kopfzeilen-Zelle «bis 5 000 | 25% des Streitwertes … | —» im
  x-Spalten-Splitter; gegen amtliches notes.zh.ch-PDF verifizieren; einzeln regenerieren.
  Zugleich Fahrplan-Anker «100001250» als **erledigt** markieren (Geister-Backlog vermeiden).
- **f — F13 Range-Platzhalter (LexWork-Adapter):** «N–M»-Nummern als EINEN Platzhalter-Eintrag
  «Art. 2–4» mit leerem Block emittieren — **keinen «Aufgehoben.»-Text fabrizieren** (§7).
  Unit-Test mit dem echten AR-133.1-Markup. Betroffenheits-Rescan NACH K-G1.

### K-8 · xhtml-<p>-Strukturerhalt *(F21)* — Aufwand M

`parseSegment` in `adapter-lexwork.ts`: <p>-Grenzen innerhalb eines paragraph-Divs erhalten
(eigene Zeile/Unterblock bzw. items-Array bei Spiegelstrich-Mustern) statt Space-Join — belegt
BS-154.123 Handgelübde, 32 Stellen/19 Dateien, Dunkelziffer höher. Auflagen: Schema **nur additiv**
(Reader-Fallback, kein Bruch); **Golden-Diff korpusweit offline** (additiv beweisen), nicht nur
über die 19 bekannten; Regeneration kantonsweise in Tranchen — **> 2 Kantone → in K-G1 einhängen.**

### K-9 · Erlass→Werkzeug-Brücke Kanton *(F38)* — Aufwand M, reine Metadaten, kein Slot

Build-Zeit-Inversion der Tarif-quelleUrls zu `KANTON_ERLASS_WERKZEUGE` (Register ist per quelleUrl
gekeyt, Tarif-Daten tragen dieselben URLs): Mapping **nur bei exaktem quelleUrl-Match, nie fuzzy**;
Konsistenz-Tor gegen Katalog-Karten + Register (kein toter Link); `werkzeugeFuerNorm` um
Kanton-Zweig erweitern. Bester Burggraben-ROI der M-Klasse: die Erlass-Seite des Anwaltstarifs AG
verlinkt endlich den Anwaltstarif-Rechner.

### K-10 · AR-Sidecar-Batch *(F30-AR)* — Aufwand M, **1 Kanton = slot-frei**

263 der 314 fehlenden Struktur-Sidecars sind AR. Kapitel-/Abschnitts-Überschriften aus dem
xhtml_tol (h-Elemente vorhanden) extrahieren — **nur amtliche Überschriften übernehmen, keine
Ebenen erfinden, wo die Quelle flach ist** (§1/§8). Einzel-Erlass-POC vor dem Batch. Der
26-Kantone-Rest (897 flache Sidecars) = K-G3.

### K-11 · Kanton-Reader-Performance profilieren *(F32, PLAUSIBEL)* — Aufwand M, erst messen

Intermittierend 50 s bis zum ersten Artikel (reproduziert, Ursache unbewiesen — **nichts «fixen»
vor dem Profil**). Client-seitig profilieren, was zwischen Snapshot-Fetch (200/ms) und erstem
Render blockiert; Verdacht Marginalien-/Sektions-Effekt-Kaskade + **React-Compiler-Falle explizit
mitprüfen** (Compiler ist AUS, Memory). `check:perf-budget` um den Kanton-Leserpfad erweitern
(FAHRPLAN-PERFORMANCE). §15: Treue vor Tempo.

### K-12 · Reports & kuratierte Listen *(F3-Report · F4-Liste · F33-Daten)* — Aufwand S/M, lesend/planend

- **a — F3 Differenz-Report BS/AR:** LexFind-Enumeration (Fakten-Signal, G1) vs. register.json —
  Werkzeug `lexfind-discovery.ts` existiert; Report mit Datum als Check ausweisbar. Der **Nachzug**
  (AR ~70, BS ~55 fehlende) = je 1 Kanton frei, **AR-PDF-Anteile erst nach K-7a (F20-Gate)**;
  BS-Nachzug beachtet G2-Sonderfall.
- **b — F4 Kern-Erlass-Liste je Kanton** (KV, EG ZGB, GOG, VRG, StG, PBG/BauG): Liste **maschinell
  vorschlagen** (reine Planung, kein Fetch — sofort frei), Abnahme in die Abnahme-Warteschlange
  (Zeitsperre-kompatibel). Einhängen als zweite Inventar-Quelle in `inventar-kanton.ts` = Teil K-G5.
- **c — F33-Datenteil:** AI-Registereinträge mit amtlichen Volltiteln nachziehen (1 Kanton, frei).

### K-13 · Systematik-Bäume 7 Kantone *(F6≡F43)* — Aufwand M, kantons-einzeln frei

ZH, GE, VD, TI, SZ, NE, JU fehlen in `kanton-systematik.json` (19/26). Quell-Erhebung **je Kanton
empirisch** (JU-Lektion: rsju.jura.ch/api liefert HTML-Shell — Endpunkt-Menü messen, nicht raten;
VD BLV-Nummernbaum, TI RL-Systematik, ZH LS-Systematik sind publiziert), browserlos, Metadaten von
der Amtsquelle; als Generator-Zweige in `kanton-systematik-run.ts`. Bis dahin K-2e-Hinweis.

### K-14 · Kantonales Zitat-Vokabular POC *(F39)* — Aufwand L — **Risikopfad: Opus + gegenpruefung**

Entscheid-normKeys sind heute Bund-only → Kanton-Norm→Entscheid-Kanten strukturell unmöglich.
POC über die vorhandenen 5 Gerichts-Kantone × 6 Entscheide (GR/BE/ZH/SG/AG): Sammlungs-Zitierweisen
(«BR 320.100», «§ 18 StG/AG») deterministisch auf Register-Keys mappen — **nur exakte
Sammlungsnummer-Matches, kein Kürzel-Raten** (§1). **OCL-Schema-Entscheid beachten:** additiver
Extraktions-Pass, bestehende normKeys nur ergänzen, kein json_content-Wechsel.

---

## §1-B · GEGATETE EINHEITEN (26×-Slot durch E3 belegt — ausgewiesen, NICHT starten)

> Slot-Übergabe nur per explizitem `plan:set <id> slot=inhaber`-Commit (check.ts 5b). Die
> Slot-Kette in `ROADMAP.md` führt bereits `W3·12 (Kanton-Gesetze)` hinter E3 — K-G5 hängt dort ein.

### K-G1 · Regenerations-Welle pre-S1 *(F12 · F13-Rescan · F29-Extraktor-Anteil)* — 93 Snapshots / 23 Kantone

Aufgehoben-Platzhalter-Drop: 93 Snapshots erzeugt VOR dem S1-Fix (19.–22.6.) droppen amtliche
«§ N *»-Platzhalter (SO-614.11: 347 Quelle vs. 324 Snapshot, live verifiziert) → stille
Nummerierungssprünge. **Kein Code-Diff nötig, nur Regeneration** — aber 23 Kantone = Massenlauf.
- **Vorab frei:** SO-614.11 als Einzel-POC (belegt den Fix) · Kanzlei-Kantone-Tranchen einzeln
  (AG/LU/SO/ZG) decken den meisten Nutzen.
- **Reihenfolge (G4):** K-7f (Range) + K-8 (<p>) mergen, DANN Welle — sonst zweite Welle.
  F13-Betroffenheits-Rescan danach. F29-Extraktor-Strip in dieselbe Welle einlegen (kein eigener Lauf).
- **Drift-Tor-Blindstelle (§K-2):** version_uid identisch → Klasse ist per Drift nie meldbar;
  Vollständigkeits-Invariante aus K-4d gehört als Tor in diese Welle.

### K-G2 · Currency-/Juli-Drift-Läufer Kanton *(F26-Läufer · F14-Sammellauf)* — EIN Läufer, 26 Kantone

Kanton-Currency-Sidecar aus LexWork-version_uid-Abgleich (analog Fedlex-P1-d) speist den
K-2a-Chip mit echtem Prüfdatum; zugleich Juli-Drift-Lauf über alle version_uid-Quellen (1.7. =
Sammel-Stichtag, ZG war mutmasslich nicht allein). Dedupe-Invariante (K-6a) läuft als Tor mit.
Betriebs-Rhythmus (Cron) definieren — Messung ist lesend und vorab zulässig, der **Nachzug** vieler
Kantone ist die gegatete Fläche.

### K-G3 · Gliederungs-Extraktion korpusweit *(F30-Rest · F29-Extraktor)* — 897 flache Sidecars, 26 Kantone

h-Überschriften aus xhtml_tol in Struktur-Sidecars (nur amtliche Ebenen, G-Auflage wie K-10).
AR (K-10) und Einzel-Kanton-POCs laufen vorab frei; der 26-Kantone-Lauf wartet auf den Slot.

### K-G4 · Tabellen-Regelwerk Kanton + Barème layout-bewusst *(F31 · F17b)* — Aufwand L

Nur 3/1232 Snapshots tragen Tabellen-Blöcke — bei einem Tarif-Korpus. Bund-M10-Regelwerk
wiederverwenden; Barème VD-106879 layout-bewusst (x-Spalten analog `extrahiereZhAnhangSpalten`);
Änderungshistorien-/Inkrafttretens-Noise als Nicht-Normtext filtern; Items-Marken-Dedup (GL).
Tabellen-Blöcke **nur additiv** ins Schema. Kantonsweise; **BS-Neulauf 859 = G2-Sonderfall**
(Tranchen + Rate-Limit + eigene Einheit). Nicht vor K-7 beginnen. Jede Tranche: Opus + gegenpruefung.

### K-G5 · Vollkorpus-Ausbau Kantone *(F1 · F2 · F4-Import · F3-Nachzug-Rest · F6-Rest)* — Aufwand L, = Zubringer zu `W3·12`

«26 Kantone abgedeckt» ist nur titel-tief wahr (BS+AR = 91,4 %, ZH 3/~940 ≈ 0,3 %). Ausbau ist
**dieselbe Bau-Fläche wie `W3·12` (Kanton-Gesetze-Bündel, FAHRPLAN-GESETZE-IMPORT-3TIER.md)** —
dort einhängen, kein Parallel-Schritt (§14.3). Dieser Plan liefert dem Bündel:
- **Priorisierung nach Praxisrelevanz:** ZH → BE → VD → AG → SG → LU → GE (David-Touchpoint
  empfohlen, nicht blockierend). **ZH = grösster Einzelhebel**, braucht neuen Adapter
  (www.zh.ch/zhlex ist kein LexWork-Host): §7-Quell-Menü empirisch, POC vor Migration, GL-Lektion,
  **kein Headless** (G1).
- **Kern-Erlass-Quelle:** K-12b-Liste als zweite Inventar-Quelle neben den Tarif-Zitaten in
  `inventar-kanton.ts`.
- **Auflage regel-treue:** auch sequenziell-kantonsweise ist der 24-Kantone-Ausbau faktisch ein
  26×-Asset → als Bau-Einheit hinter der E3-Slot-Freigabe führen; je Kanton eigener Import mit
  Drift-Token je Snapshot; LexFind nur Enumerations-Signal.

---

## §Z · Verworfenes (explizit, mit Grund)

| Verworfen | Grund |
|---|---|
| **F10-Massnahme: Client-Kanton-Suchindex-Shards** | Frontal-Kollision mit F36/K10/§15.3 (Index-Verdopplung ~+4 MB gzip). Arbiter = F36: Hot-FTS enthält Kanton bereits, K-3 schaltet sie frei. Allenfalls später BS/AR-Shard als **gemessener** POC. |
| **Headless-Fallback für ZH/Latin-Portale** | G1: nur strukturierte Endpunkte/PDF oder Verzicht — browserlos ist Leitplanke, nicht Präferenz. |
| **Auto-Link bare «Art. N» → Bundesrecht in §-Erlassen** | Konvention ist Indiz, kein Beweis — §1: Unterdrückung statt Raten (K-5). |
| **«Aufgehoben.»-Text für Range-Platzhalter fabrizieren** | §7: nur amtlichen Wortlaut emittieren — leerer Platzhalter-Block mit Label (K-7f). |
| **Barème per Trailing-Cut stillschweigend mitschneiden** | Barème ist normativer Inhalt — Quarantäne-Anhang + amtlicher PDF-Link bis K-G4 (K-7b). |
| **SG-2935/3849 als Duplikat löschen** | Titel-Kollision zweier VERSCHIEDENER Erlasse — nur disambiguieren (K-6a). |
| **F34: Aktion bei Mobil-Layout/§-Weiche** | Positivbefund — als Verifikations-Baseline nutzen (Screenshots /tmp/kanton-audit/). |

## §K · Korrekturen aus den Kritik-Linsen (in die Einheiten eingearbeitet)

1. **GL-Tippfehler:** betroffen ist der Gebührentarif nach **ZGB** («Gebühren im Zivilrecht»),
   nicht «ZG» (→ K-6d).
2. **SO-Verschärfung:** live version_uid == Snapshot-Token → **Drift-Tor strukturell blind** für
   die Platzhalter-Drop-Klasse; eigener Trigger nötig (→ K-4d, K-G1).
3. **F24-Präzisierung:** Auslöser = fehlende **oder einteilige** Marginalie (Ahnen-lose Artikel);
   Fix interleavt beide Fälle (→ K-1a).
4. **Als PLAUSIBEL geführt (nicht hart):** LexFind-Seitenzahlen (ZH/SG/AI/BS/AR-Soll),
   404/917-Zählung, Prod-Playwright-Timings (F32), lexfind-tolv-125116-Detail, F41 ~196 (obere
   Schranke). Am Bau-Tag frisch erheben (G5).

## §B · Beleg-Qualität (Kurzreferenz)

- **Hart, selbst re-verifiziert (beleg-haerte, 12.7.):** F1-Zählung (1231/859/266) · F14 ZG live ·
  F12/SO live (347 vs. 324) · F13/AR live (Range-Span im Quell-Markup) · F9 SZ-2027 · F15/F7 TI-
  Duplikat (RL 178.200 beidseitig) + check-drift-Mechanik · F25 Doppel-Decode (Code) · F24
  (Laufzeit-Simulation baueGliederungsbaum) · F35 (drei Code-Belege) · F26 (227/0) · F28 (Code).
- **Hart, Repo-Spot-Checks (praxis-roi):** F25 · F28 · F35 · F24 · F36-Basis (artikel-bund.json) ·
  F26 · F6 (19/26) · F9 · F5.
- **PLAUSIBEL:** s. §K-4 sowie F32 (Ursache), F41 (Simulation).

## §S · Sequenz-Übersicht (Kurzform)

```
SOFORT:   K-1 → K-2 → K-3 → K-4 → K-5 → K-6 → K-7 → K-8 → K-9 → K-10 → K-11 → K-12 → K-13 → K-14
          (K-7a F20-Gate blockiert jeden FR/VS/AR-PDF-Nachzug; K-5: F41 vor F40)
GEGATET:  [E3-Slot-Freigabe] → K-G1 (nach K-7f+K-8) → K-G2 → K-G3 → K-G4 (nach K-7) → K-G5 (= W3·12)
```
