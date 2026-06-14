# FAHRPLAN PRODUKTAUSBAU & BURGGRABEN (Stand 14.6.2026)

## Kopf: Ziel, Maßstäbe, Nicht-Ziele

**Ziel (Direktive David 14.6.2026, STRATEGIE-PLATTFORM §0).** Bis zu den ersten Kanzleigesprächen (in einigen Monaten) ist das Ziel maximaler Produktausbau zu einem *imposanten Produkt mit Burggraben* — kein simples Werkzeug, das ohnehin schon existiert. Nicht Breite an Trivialem, sondern Tiefe und schwer kopierbare Datenassets.

**Die drei Maßstäbe (jeder Bau-Entscheid wird daran gemessen).**
1. **Praxistauglichkeit** — taugt es für den realen Kanzleialltag.
2. **Skalierbarkeit der Bau-Architektur** — trägt der Rahmen weiteres Wachstum, ohne pro Schritt teurer zu werden.
3. **Fachliche Tiefe** — Differenzierung durch Tiefe/Abdeckung/Verifikation, nicht durch Menge an Trivialem.

**Burggraben-Quellen (STRATEGIE-PLATTFORM §0).** Nicht der Code (in Wochen kopierbar), sondern: (B) Datenassets (26-Kantone-Schichten, Tarif-Staffeln, Behörden-Registries), (C) Verifikations-Prozess (Norm-Anker, Golden-Protokoll, Verfallspflege), (D) die fachkundige Abnahme. Die Frist-Alleinstellung ist falsifiziert (legaldeadline.ch u.a.) — Fristen tragen den Moat nur über Tiefe (Fristbeginn, Regime-Treue), nicht als weiterer Gratis-Rechner.

**Nicht-Ziele in diesem Plan (bewusst draußen).**
- **Abnahme-Welle / Nutzer-Validierung** — bewusst zurückgestellt (Direktive). Golden-Gates bleiben als CI-Hygiene aktiv; die formale `verified`/geprüft-Abnahme ist *nicht* der Treiber dieses Plans, mit einer Ausnahme (Feiertags-Verifikation, weil sie ein konkretes Datenasset härtet).
- **Markt-Themen** — Hosting, Zahlung, Login, Auth/Billing, SaaS-Mehrmandanten. Außerhalb.
- **Mengen-Strategie „1000 Vorlagen"** — Menge ist kein Moat. Die kombinatorische Vorlagen-Maschine (Detailgrad×Untertyp×Modul-Sweep, Seiten-Rollout) wird *nicht* zum Selbstzweck ausgebaut; nur der Teil, der bestehende Tiefe vor stillem Verrotten schützt, wird gebaut.

**Leitprinzip der Reihenfolge (aus der Moat- und Solo-Kritik).** Eine Säule zu Ende führen, bevor die nächste beginnt. Nie mehr als *ein* 26-kantonales Datenasset gleichzeitig offen. Imposant × verteidigbar zuerst. Rahmen vor Inhalt (CLAUDE.md §10), jeder verhaltensändernde Schritt golden-gegated (§6).

---

## Das Rückgrat und die Säulen

**Das Rückgrat ist Säule A (Fall-Kontext) — aber in disziplinierter, abgespeckter Form.** Der Fall-Kontext ist das, was die einzelnen Werkzeuge zu einem durchgängigen Produkt verkettet (Maßstab 1 + §0 „Durchgängigkeit"). ABER: Die Moat-Kritik ist hier bindend — der *volle* FallAkte-/Adapter-/Workspace-Aufbau ist Standard-SaaS-Architektur und für sich kein Burggraben; das sichtbare Cockpit findet seine richtige Form erst nach echtem Nutzerfeedback. Deshalb:

- Gebaut wird in diesem Halbjahr **nur das schlanke Rückgrat** (Schema-Kern + Codec-Block + wenige Adapter + URL-Transport zwischen den Rechnern, die ohnehin gebaut werden). Es verkettet die Datenassets der anderen Säulen und macht sie erlebbar.
- Der **Workspace/Cockpit/localStorage-Aufsatz (A-E4/E5) ist zurückgestellt** bis nach den Kanzleigesprächen. Adapter-Vollausbau (N+M) baut man, wenn N×M weh tut — bei drei gekoppelten Werkzeugen tut es das noch nicht.

Die anderen Säulen hängen am Rückgrat:
- **Säule B (Tarif-Staffeln)** = der Hauptmoat. Liefert den ersten unbestreitbar imposanten Rechner (Prozesskosten 26/26). Das Rückgrat verkettet Zuständigkeit → Streitwert → Prozesskosten.
- **Säule D (fachliche Tiefe)** = die fachliche Spitze, aber nur die zwei wirklich tiefen Elemente (Zustellfiktion, kantonale Gerichtsferien) plus der Feiertags-Blocker-Abbau. Die Matrix-Auffüllung (weitere Fristenregime) ist *opportunistisch*, nicht Selbstzweck.
- **Säule C (Meta-Werkzeuge)** = kein Moat, sondern Bau-Hygiene. Nur der Teil, der Tiefe vor Verrotten schützt (Registry + Drift-Guards), wird vorgezogen; der Mengen-Sweep bleibt nachrangig.

---

## Phasenübersicht und Abhängigkeiten

```
P0  Skalierungs-Rahmen (C1+C4)        ── kein Datenasset, macht alles Spätere billiger
      │
P1  HAUPTMOAT: Prozesskosten 26/26    ── Säule B (P0-Primitiv → Gerichtskosten → Kostenrisiko)
      │   (Verfallsregister-Skript VOR 30.6.2026)
P2  Rückgrat schlank (A-E0..E3)       ── verkettet Zuständigkeit→Streitwert→Prozesskosten→ZPO-Fristen
      │
P3  Fachliche Spitze (D-1.4, D-1.1, D-1.3)  ── Blocker-Abbau + Zustellfiktion + kant. Gerichtsferien
      │
P4  (opportunistisch / nach Bedarf)   ── D-Matrix-Auffüllung, C-Mengen-Sweep, Säule-A-Cockpit
```

Abhängigkeiten: P1 braucht das Staffel-Primitiv aus seiner eigenen P0-Unteretappe; P2 braucht die Rechner aus P1 als Andockpunkte; P3-1.3 ist erst zulässig, wenn das B-Datenasset (P1) *fertig und stabil* ist (Regel: nie zwei 26×-Schichten gleichzeitig offen).

---

## P0 — Skalierungs-Rahmen (Säule C, reduziert)

**Was.** Zentrale Schema-Registry + Drift-Guards. Nur C1 und C4 aus dem C-Entwurf; C2/C3/C5/C6 (Varianten-Achsen, Mengen-Sweep, Seiten-Rollout, Untertyp-Dispatcher) sind zurückgestellt (P4).

**Warum (Maßstab 2 + 3).** Heute wird jedes der 39 Schemas namentlich in 3+ Dateien importiert (golden-outputs.ts ~593 Z., formGate.test.ts, vorlagenRender.test.ts); es gibt keine SSoT über die Schema-MENGE. Das ist der reale Engpass und zugleich das Risiko, dass Tiefe still verrottet (vergessene Karte/Route/Golden). C1+C4 heilt den §5-Bruch Katalog↔Schema und schützt jeden weiteren Zubau — ohne 26×-Recherche, ohne UI-Wette. Das ist der ehrlichste „erst Rahmen" (§10) und der einzige C-Teil, der Maßstab 3 (Qualität) statt Maßstab-Menge bedient.

**Etappen.**

- **C1 — Schema-Registry** (`src/lib/vorlagen/registry.ts`). Ein `VorlagenEintrag` pro Vorlage. **Prinzipien-Korrektur (bindend, Kritik 2 C-§5):** Die Registry *referenziert* die im Schema-Modul exportierten `defaults`/`zusammenstellen`/`pruefeGates` — sie deklariert sie NICHT neu. Sonst entstünde eine zweite Wahrheit (§5-Schaden statt -Gewinn). `goldenFaelle` wandern aus golden-outputs.ts hierher und tragen `herkunft: 'kuratiert' | 'sweep'`.
  - *§6-verhaltensneutral:* golden-outputs.ts importiert die Registry und erzeugt die Vorlagen-Fälle daraus statt aus 40 Einzelimporten.
  - *Akzeptanzbeweis:* `npm run golden:vergleich` byte-gleich zum committeten Stand. **Zusatz-Test (bindend):** Referenzgleichheit `eintrag.zusammenstellen === schemaModul.zusammenstellen` — verbietet Logik-Duplikate strukturell (Golden-Gleichheit allein fängt Kopien nicht).
  - *Aufwand:* ~1 Session.

- **C4 — Drift-Guards** (`src/tests/`). Kreuzprüfung mechanisch: (a) jede `VorlageCard` mit `schemaId` ↔ genau ein Registry-Eintrag; (b) jeder Eintrag ↔ Route im routesManifest; (c) formGate.test.ts zieht seine Schema-Liste aus der Registry; (d) jeder Eintrag hat ≥1 *kuratierten* goldenFall.
  - *Akzeptanzbeweis:* absichtlich vergessene Karte/Route/Golden bricht den jeweiligen Test (Negativ-Probe im Commit dokumentiert).
  - *Aufwand:* ~0.5–1 Session.

**Tabu in P0.** Kein Mengen-Sweep (C3), kein Seiten-Rollout (C5). Die „1000 Vorlagen"-Maschine wird hier *nicht* beschleunigt.

---

## P1 — HAUPTMOAT: Prozesskostenrechner 26/26 (Säule B)

**Was.** Deterministischer, verifizierter, verfallsgepflegter Prozesskostenrechner über alle 26 Kantone. Das ist das imposanteste, am wenigsten kopierbare Einzelprodukt des Plans (Moat-Kritik bestätigt: einziger unbestreitbarer Burggraben).

**Warum (alle drei Maßstäbe).** Die heutige Kostenschicht ist *erzählend, nicht rechnend* (`zustaendigkeitKosten.ts` speichert Prosa wie „CHF 3'150 + 8 % über CHF 20'000"). Der Burggraben entsteht durch die Überführung in deterministische Staffel-Arithmetik je Kanton: die Ränder (Sockel, Deckel, Bandgrenzen, Mindest-/Höchstgebühr, Reduktions-/Erhöhungsklauseln) sind in Prosa unsichtbar und kantonweise verschieden — eine vollständige, golden-getestete, verfallsgepflegte Belegung ist die 3–6-Monats-Nachbauhürde aus §0(B). Andockbar an die bestehenden Engines `zustaendigkeit.ts` und `streitwert.ts` (§10, max. Hebel auf vorhandener Infrastruktur).

**Solo-Kürzung (bindend, Kritik 1).** Gebaut wird in P1 **nur Gerichtskosten** (Rang 1). Parteientschädigung/Anwaltstarif (Rang 2), Notariat/Grundbuch (Rang 4), Schlichtungs-Eigenausbau (Rang 5) sind **gestrichen für dieses Halbjahr** — der teuerste, wertärmste Teil (Ermessens-Rahmen-Recherche pro Kanton, niedrigster Wert-pro-Stunde). Damit fällt das „Kostenrisiko-Total"-Szenario vorerst weg; bewusst. Was bleibt, ist der deterministische Gerichtskosten-Rechner.

**Realismus-Korrektur Aufwand (Kritik 1).** Tarif-Recherche ist real ~1–2 h pro Kanton (Fassung identifizieren, Bänder samt Sockel/Deckel übersetzen, mit drei Stützstellen rückrechnen), nicht 20–25 min. Dieser Teil ist nicht delegierbar (§2/§7). Deshalb gilt:

**Staffelungs-Korrektur (bindend).** Gerichtskosten wird zuerst nur für die Kantone gebaut, deren Tarif eine *echte rechnende Staffel* ist (`staffel`/`sockel_prozent`). Ermessens-/einkommensabhängige Kantone bekommen ehrlich `rahmen`/„nach Ermessen der Behörde" (kein erfundener Punktwert, §2/§8) und werden später nachgezogen. Ein deterministischer Gerichtskosten-Rechner für die sauber staffelbaren Kantone ist schon ein Moat-Beweis.

**Etappen.**

- **B-P0a — Staffel-Primitiv** (`src/lib/tarif/staffel.ts`). Fachneutrale, reine Arithmetik über deklarierte Regeltypen: `fix | sockel_prozent | staffel | promille | rahmen | formel_extern`. KEINE Rechtslogik, nur Auswertung.
  - **Prinzipien-Korrektur (bindend, Kritik 2 B-§2):** `rahmen`/`formel_extern` geben `deterministisch: false` und tragen das `betrag`-Feld *typseitig gar nicht* (diskriminierte Union) — die UI kann keine Scheinzahl saugen.
  - **Prinzipien-Korrektur (bindend, Kritik 2 B-§6):** Bandgrenzen-Semantik (inklusiv/exklusiv, Überschuss) muss *vor* jeder GebV-Vereinheitlichung durch einen Charakterisierungs-Test festgenagelt sein. Lieber zwei Bandtypen (`staffel_inklusiv`/`staffel_exklusiv`) als eine Abstraktion, die einen Frankenbetrag um einen Rappen verschiebt (§1 vor §6).
  - *Akzeptanzbeweis:* Golden-Test des Primitivs an Bandgrenzen; Disjunktheit der Regeltypen.
  - *Aufwand:* Code ~6 h + Test ~3 h.

- **B-P0b — Verfallsregister + CI-Gate** (`scripts/tarifVerfallCheck.ts`). Jeder Datensatz trägt strukturiertes Frontmatter (`stand`, `erlass`, `quelleUrl`, `verfaellt?`, `verifiziert`). Skript bricht CI ab bei Überschreitung.
  - **Dringend:** Muss *vor* dem 30.6.2026 stehen (SG GKV 941.12 läuft ab, Inventar bestätigt). Das Verfallsregister ist das beste einzelne Moat-Element (Asset von „einmal kopierbar" zu „dauernd gepflegt").
  - *Akzeptanzbeweis:* `npm run check:tarif-verfall` rot bei einem künstlich auf gestern gesetzten `verfaellt`.
  - *Aufwand:* ~4 h.

- **B-P1 — Gerichtskosten-Datenschicht + Engine.** Datenschicht `src/data/tarif/gerichtskosten/<KT>.ts` (eine Datei je Kanton, eigener Erlass-Anker).
  - **Prinzipien-Korrektur (bindend, Kritik 2 B-§4 — gefährlichster Punkt):** Die kantonale Datei deklariert die Regel-AUSWAHL selbst (welche `TarifRegel` für welches Verfahren/welche Materie in DIESEM Kanton gilt). Die Engine `gerichtskosten.ts` ist ein **dünner Lader** — lädt die kantonale Deklaration und ruft `auswertenStaffel`. KEINE zentrale Verfahrens-/Materie-Dispatch-Logik (das wäre Regime-Kollaps über Kantone, §4). `KantonKosten` führt bereits regime-getrennte Felder (`nichtVermoegensrechtlich`, `familie`) — daran anschließen, nicht kollabieren.
  - Kostenfreiheit Art. 113/114 ZPO als Engine-Vorschalter.
  - *Aufwand:* Recherche (nur staffelbare Kantone) + Code + Engine ~ je nach Kantonszahl; rechnen mit real ~1–2 h Recherche je erfasstem Kanton.

- **B-P1-SSoT — Prosa-Migration.** **Prinzipien-Korrektur (bindend, Kritik 2 B-§6, §8):** Die Ableitung `KostenRahmen.text` aus der neuen Datenschicht ist KEIN byte-gleicher §6-Schritt — die heutigen Strings sind heterogen formuliert, eine Formatierungsfunktion reproduziert sie nicht byte-gleich. Daher: neue Datenschicht **additiv neben** der Prosa aufbauen; Prosa erst ablösen, wenn die abgeleitete Ansicht fachlich abgenommen ist. Jede inhaltliche Abweichung (auch: alte Prosa war falsch) wird als §8-Befund dokumentiert. Den Schritt nicht als „verhaltensneutral" etikettieren.

- **B-P2 — Sichtbarer Rechner** (neue Seite `prozesskosten`, Katalog `startseiteConfig.ts`). Eingang: Kanton · Streitwert · Verfahrensart · vermögensrechtlich · (Schlichtung erforderlich) · (Obsiegensquote). Ausgang deterministisch + ehrlich: exakter Betrag wo `staffel`/`sockel_prozent`, Band wo `rahmen`, je mit Rechenschritten, Erlass-Anker, Stand, Verifikations-Status.
  - *Akzeptanzbeweis:* Golden-Fälle Streitwert 5'000 / 50'000 / 500'000 je Kanton; Playwright-Smoke der Seite; `check:zitate` für die Erlass-Anker.
  - *Aufwand:* UI + Verdrahtung ~8 h.

**Tabu in P1.** Keine Parteientschädigung, kein Notariat/Grundbuch, keine Schlichtungs-Eigenerfassung. Ziel: *alle 26 Kantone Gerichtskosten* mit `verifiziert: 'doppelt'` für die staffelbaren, ehrlichem `rahmen` für die Ermessens-Kantone — eine fertige Sache, nicht fünf halbe.

---

## P2 — Rückgrat schlank (Säule A, ohne Cockpit)

**Was.** Schema-Kern für den Fall-Kontext + Adapter-Konvention + URL-Transport zwischen genau den Rechnern, die P1 sichtbar gemacht hat (Zuständigkeit → Streitwert → Prozesskosten → ZPO-Fristen). A-E0 bis A-E3 aus dem Säulen-A-Entwurf. **A-E4/E5 (Workspace, Cockpit, localStorage, Vorlagen-Parteien-Prefill) zurückgestellt** (Moat- + Solo-Kritik: größte UI-Wette, kein eigener Moat, richtige Form erst nach Nutzerfeedback).

**Warum (Maßstab 1 + 2).** Verkettung ist der erlebbare Teil der Durchgängigkeit (§0): einmal Kanton + Streitwert + Materie eingeben, der nächste Rechner sieht denselben Kontext. Beendet zugleich die real verifizierte Vierfachung `streitwertCHF`/`streitwert`/`sw`/`s` (§5-Gewinn).

**Etappen.**

- **A-E0 — Schema-Kern** (`src/lib/fallakte.ts`). Typen + `FALLAKTE_SPEC` über den bestehenden `permalink.ts`-Codec mit eigenem **Präfix-Schlüsselraum** (`c_`, disjunkt zu den bestehenden Kurz-Keys). KEINE Felder `verfahren`/`fristnatur`/`rechtsweg`/`forum`.
  - **Prinzipien-Korrektur (bindend, Kritik 2 A-§1, KRITISCH):** Die §1-Invariante ist zweiteilig: (a) kein Fall-Schritt speichert ein Rechenergebnis, nur Permalinks; (b) ein FallAkte-Sachfeld trägt nur eine *rechtlich eindeutige* Größe. Mehrdeutige Beträge (Streitwert ZPO vs. Forderung SchKG vs. Beschwerdewert BGG) werden NICHT kanonisiert — sie bleiben rechnerspezifisch. Sonst behandelt ein gemeinsames `betragCHF` zwei rechtlich verschiedene Größen gleich (§1-Bruch).
  - *Akzeptanzbeweis:* Round-Trip-Golden (kodieren→lesen idempotent, Ungültiges verworfen) + Disjunktheits-Test des `c_`-Raums gegen *alle* bestehenden Spec-Params **und** gegen die hand-gerollten Lang-Keys von `koPrefill` (`streitwert`/`kanton`/`kb`, Kritik 2 A-§6). Alle bestehenden Link-/ICS-Golden unverändert.
  - *Aufwand:* ~1 Tag.

- **A-E1 — Adapter-Konvention + erstes Paar.** `FallAkteAdapter<TInput>`. Adapter Zuständigkeit→FallAkte (export) und FallAkte→Klage-Antworten (import).
  - **Prinzipien-Korrektur (bindend, Kritik 1 + 2 A-§4/§3):** Jeder `import`-Adapter interpretiert jede Betrags-/Datumsgröße explizit regime-korrekt (reines Feld-Mapping mit dokumentierter Regime-Annahme), reicht nie 1:1 durch. **Maschineller Guard:** Import-Lint auf Adapter-Pfade — Adapter dürfen nur Feld-Zuweisung + Typkonversion enthalten, KEINE Importe aus Engine-Rechenkernen, keine Rechtsfolge-Verzweigung (§3 erzwungen, nicht erhofft).
  - **`koPrefillKodieren/Lesen` wird NICHT angefasst** (Kritik 1 + 2 A-§6): hand-gerollte URL, byte-Gleich-Risiko. Der Adapter-Weg wird erst an einem *neuen* Rechnerpaar produktiv; kein zweiter paralleler Prefill-Weg für dasselbe Vorlagen-Paar.
  - *Akzeptanzbeweis:* Mapper-Unit-Test; Bestands-Golden byte-gleich.
  - *Aufwand:* ~0.5 Tag.

- **A-E2 — URL-Transport zwischen Piloten.** `VorlagenSprung.tsx` + „passende Fristen"-Sprünge hängen optionalen `c_`-Block an. Pilot-Forms lesen ihn beim Mount als *schwachen* Default. Priorität streng: rechnerspezifische Spec > FallAkte > Default.
  - *Akzeptanzbeweis:* Link OHNE `c_` → byte-identischer State (Neutralitätstest, §6). Link mit `c_k=ZH` belegt Kanton nur vor, wenn `k` fehlt (Prioritätstest). Bestehende Form-Tests grün.
  - *Aufwand:* ~0.5 Tag.

- **A-E3 — Adapter-Rollout (nur export, nur die P1-Kette).** Adapter für Streitwert und ZPO-Fristen; `sw↔s`-Bruch zentral im jeweiligen Adapter überbrückt. Je Engine ein Round-Trip-Test.
  - *Akzeptanzbeweis:* je Engine ein Mapper-Test; alle Bestands-Golden unverändert.
  - *Aufwand:* ~0.5–1 Tag.

**Tabu in P2.** Kein `FallProvider`, kein `/fall`-Cockpit, kein localStorage, kein Vorlagen-Parteien-Prefill. Das Rückgrat bleibt URL-getragen und unsichtbar-funktional, bis mehr als drei gekoppelte Werkzeuge die Adapter-Maschine rechtfertigen.

---

## P3 — Fachliche Spitze (Säule D, nur die tiefen Elemente)

**Was.** Genau drei Etappen: der Feiertags-Blocker-Abbau, die Zustellfiktions-Engine, die kantonale Gerichtsferien-Datenschicht. Die übrigen D-Etappen (Fristwiederherstellung, BGG-Beschwerde, ATSG, Verjährungs-Spezialregime, Übergangsrecht, StPO-Engine) sind **Matrix-Auffüllung** und wandern nach P4 (opportunistisch).

**Warum (Maßstab 3).** Ein generisches Tool rechnet „Datum + n Tage". Die hier gebaute Tiefe ist gerade das, was solche Tools strukturell nicht abbilden: Fristbeginn (Zustellfiktion), regime-treue Verzweigung, 26-kantonale Datenschicht. Das sind die einzigen D-Elemente mit echter Verteidigbarkeit pro Stunde (Moat-Kritik).

**Reihenfolge-Regel (bindend, Kritik 1).** D-1.3 (kantonale Gerichtsferien = drittes 26×-Datenasset) startet erst, wenn das B-Datenasset (P1) fertig und stabil ist. Nie zwei kantonale Datenschichten gleichzeitig offen.

**Etappen.**

- **D-1.4 — Feiertags-Matrix verifizieren** (Blocker-Abbau, Rang 1). Die Matrix ist algorithmisch sauber (`giltImJahr`-Ersatzruhetag-Logik), aber gegen BJ-Liste Stand 2011 verankert.
  - **Prinzipien-Korrektur (bindend, Kritik 2 D-§6, KRITISCH):** Die Matrix ist Datenbasis von ZPO/SchKG/BGG/VwVG/Verjährung — jede Korrektur verschiebt potenziell Fristenden in fünf Engines. Daher Datensatz-für-Datensatz mit vollständigem Golden-Regressionslauf über ALLE fünf Engines. Jede Verschiebung eines bestehenden Golden-Outputs ist eine *fachliche Korrektur mit Begründung* (§6 Pkt. 3, §8), NIE ein stiller Golden-Neuschrieb.
  - *Akzeptanzbeweis:* je Kanton Erlass-Anker (`check:zitate`); 5-Engine-Golden-Lauf grün oder dokumentierte Korrektur.
  - *Aufwand:* Recherche ~9 h + Korrektur/Regression ~5 h. (Realismus-Vorbehalt: ggf. mehr.) **Nur bauen, wenn Abnahme-Reife der Fristenfamilie vor den Gesprächen wirklich gebraucht wird** — sonst auch dies opportunistisch (Kritik 1).

- **D-1.1 — Zustellfiktions-Engine** (die imposanteste Einzelvertiefung). Bestimmt den `dies a quo` aus dem Zustellereignis, regime-treu.
  - **Prinzipien-Korrektur (bindend, Kritik 2 D-§1/§4, größte Verschmelzungsgefahr):** NICHT als eine Engine mit gemeinsamem 7-Tage-Kern + Ausnahmen bauen. SchKG ist strikt zu trennen (kennt keine generelle Zustellfiktion; Sonderregeln Art. 64 ff./66). Geteilte Mechanik für ZPO/VwVG/BGG/StPO nur, wenn vorab *fachlich verifiziert* ist, dass Fristbeginn und 7-Tage-Lauf wirklich identisch sind (nicht bloß ähnlich) — das ist eine fachliche Feststellung vor dem Bau, keine Bau-Annahme (§1: lieber Duplikat als falsche Abstraktion).
  - **§2/§8:** Die Voraussetzung „musste mit Zustellung rechnen" (BGE 138 III 225) wird NICHT automatisch bejaht/verneint, sondern als offengelegte Annahme + Warnung ausgegeben.
  - **§3-Verdrahtung:** Die UI sammelt nur Eingaben und zeigt das Engine-Ergebnis; die Auswahl „welche Fiktionsnorm" trifft die Engine anhand eines expliziten Eingabefeldes, nie die Komponente.
  - *Norm-To-do (§7, Fedlex-Filestore, Anker `art_xxx`):* ZPO 138 · StPO 85 · VwVG 20 · BGG 44 · SchKG 64/66; BGE 138 III 225, 127 I 31 in `verifikation.ts`.
  - *Akzeptanzbeweis:* Golden-Fälle je Regime + abgeholt/nicht-abgeholt; `check:zitate` für die Anker.
  - *Aufwand:* Engine ~5 h + Norm-Verifikation ~4 h + Golden/Test ~3 h + Verdrahtung ~3 h.

- **D-1.3 — Kantonale Gerichtsferien-Datenschicht** (reiner Datenasset-Burggraben; erst nach P1-Stabilität). Optionale Schicht über `stillstandsperioden`: kennt ein Kanton im kantonalen Verfahrensrecht (VRPG/Justizgesetz) eigene/zusätzliche Gerichtsferien.
  - **§4:** je Kanton eigene Deklaration, kein Kollaps; nutzt die bestehende `Stillstand`-Strategie in `fristenEngine.ts`, kein neuer Kern (§6).
  - *Akzeptanzbeweis:* je Kanton Erlass-Anker; Golden-Regression der betroffenen Engines.
  - *Aufwand:* Recherche real ~1 h × erfasste Kantone + Datenschicht/Test. (Realismus: dies ist die teuerste P3-Etappe — bei Zeitdruck Teilmenge der Kantone, ehrlich gekennzeichnet, §8.)

**Tabu in P3.** Keine zweite kantonale Datenfront parallel zu D-1.3. Keine „6-Regime-Matrix komplett"-Verlockung (StPO-Engine etc.) — das ist Vollständigkeits-Fetisch, kein Imposanz-Treiber.

---

## P4 — Opportunistisch / nach den Gesprächen (nur auf konkreten Anlass)

Diese Etappen werden **nicht als Selbstzweck** gebaut, sondern nur, wenn ein konkretes Mandat, ein Kanzleigespräch oder ein gehärtetes Vorgänger-Asset sie verlangt. Reihenfolge offen.

- **D-Matrix-Auffüllung:** Fristwiederherstellung (D-1.2), BGG-Beschwerdefristen (D-3.1), ATSG (D-3.2), Verjährungs-Spezialregime + Übergangsrecht (D-2.1/2.2), StPO-Fristen-Engine (D-4.1). Je eine Kompositionsschicht über der bestehenden Engine; einzeln dünn, daher nachrangig. Bei Bau: StPO mit `OHNE_STILLSTAND` als *echtem* Strategiewert (nicht leere Stillstandsliste — sonst subtiler §4-Kollaps, Kritik 2 D-§3); Art.-60-Abs.-2-OR→StGB-97 mit Band wo Strafrahmen auslegungsbedürftig (§2, kein „in der Regel").
- **Säule B Erweiterung:** Parteientschädigung/Anwaltstarif (ehrliche Bänder), Notariat/Grundbuch (eigener Folge-Plan, `promille`-Regel, Amts-/freies Notariat strikt getrennt §4), GebV-SchKG-Vereinheitlichung. **Bindend (Kritik 2 B-§6):** `gebvKosten.ts` hat bereits einen lokalen `staffel()`-Helfer — „auf Primitiv heben" braucht zuerst einen Charakterisierungs-Test der alten Bandgrenzen-Semantik; bei Nicht-Deckung NICHT vereinheitlichen (§1 vor §6).
- **Säule C Mengen-Teil:** Varianten-Achsen (C2), Golden-Sweep (C3), VorlagenSeite-Rollout (C5), Untertyp-Dispatcher (C6). **Bindend, falls je gebaut (Kritik 2 C-§1/§6):** Sweep nur über *kohärente* Kombinationen; kuratierte Rechtskanten bleiben `herkunft: 'kuratiert'` markiert und werden nie von Sweep-Fällen verdrängt; neu eingefrorene Varianten brauchen fachliche Abnahme (§8); Untertyp→Schema-Map in `src/lib`, nicht in der UI (§3). Erst wenn die ersten ~50 Vorlagen doppelt verifiziert sind — Menge vor Qualität ist hier verboten.
- **Säule A Aufsatz:** Workspace/Cockpit/localStorage (A-E4) + Vorlagen-Parteien-Prefill (A-E5). Erst nach echtem Nutzerfeedback (richtige Form unbekannt bis dahin).

---

## Tabu / Vorsicht (was NICHT zu bauen ist)

- **Kein zweites 26×-Datenasset parallel.** Immer nur eine kantonale Datenschicht gleichzeitig offen (sonst drei je halbfertige Tabellen — Kritik 1).
- **Keine „1000 Vorlagen"-Mengenmaschine als Selbstzweck.** Menge ist kein Moat; sie macht Anwälte misstrauisch. 50 tiefe, doppelt verifizierte Vorlagen schlagen 1000 kombinatorische (Kritik 3).
- **Kein Cockpit/localStorage/Adapter-Vollausbau ohne Nutzerfeedback.** Premature abstraction; Form findet sich erst nach den Gesprächen (Kritik 1 + 3).
- **`koPrefillKodieren/Lesen` nicht anfassen.** Hand-gerollte URL, byte-Gleich-Risiko; kein zweiter Prefill-Weg (Kritik 2 A-§6).
- **Kein erfundener Punktwert bei Ermessens-/einkommensabhängigen Tarifen und unklaren Strafrahmen.** `rahmen`/`formel_extern`/Band, `deterministisch: false` (§2/§8).
- **Kein §6-Etikettenschwindel.** „Verhaltensneutral" nur mit vorliegendem byte-gleichem Golden-Beweis. Die drei Stolperstellen (GebV-Vereinheitlichung, Prosa→abgeleitete Ansicht, Feiertags-Verifikation) sind KEINE byte-gleichen Schritte — ehrlich als fachliche Änderung mit Begründung + Abnahme deklarieren; Charakterisierungs-Test vor jeder Vereinheitlichung (Kritik 2, Querschnitt).
- **Keine zentrale Regel-Dispatch-Engine über Kantone.** Kantonale Datei deklariert die Regelauswahl selbst; Engine ist dünner Lader (§4, Kritik 2 B-§4).
- **Keine Kanonisierung mehrdeutiger Sachgrößen.** Vor jeder Vereinheitlichung: „bedeutet dieses Feld in allen betroffenen Regimen GENAU dasselbe?" — wenn nein: trennen, nicht abstrahieren (§1, Kritik 2 Querschnitt).
- **Keine Rechtslogik in UI/Aggregator/Adapter.** Maschinell erzwingen (Import-Lint auf Adapter, Referenzgleichheits-Test auf Registry, Map in `src/lib`) — nicht per Review-Disziplin erhoffen (§3/§5, Kritik 2 Querschnitt).

---

## Erste konkrete Etappe (Start der nächsten Session)

**P0 / C1 — Schema-Registry.** Kleinster verhaltensneutraler Schnitt, byte-gleich beweisbar, Voraussetzung für die Drift-Guards. Konkret:

1. `src/lib/vorlagen/registry.ts` anlegen: `VorlagenEintrag`-Interface (`cardId`, `schema`, **referenzierte** `defaults`/`zusammenstellen`/`pruefeGates` aus dem jeweiligen Schema-Modul, `goldenFaelle` mit `herkunft`). Pro bestehender Vorlage ein Eintrag.
2. `scripts/golden-outputs.ts` umstellen: Vorlagen-Fälle aus `VORLAGEN_REGISTRY` erzeugen statt aus den ~40 Einzelimporten.
3. *Akzeptanzbeweis ausführen:* `npm run golden:vergleich` muss byte-gleich zum committeten Stand sein. Zusätzlich den Referenzgleichheits-Test schreiben (`eintrag.zusammenstellen === schemaModul.zusammenstellen`) und grün sehen.
4. Erst danach C4 (Drift-Guards) in eigener Etappe.

Damit beginnt der Plan mit reiner Bau-Hygiene ohne Recherche-Schwanz, ohne UI-Wette und ohne Datenasset-Risiko — und schützt jeden weiteren Schritt der Phasen P1–P3.

---

## Aufwands-Ehrlichkeit (Solo, einige Monate)

Die summierten Säulen-Entwürfe (~300–400 h über vier Fronten) sind für eine Person über wenige Monate dreifach überladen. Dieser Plan ist die disziplinierte Reduktion: **eine fertige Datentiefe (P1), ein schlankes Rückgrat (P2), zwei bis drei fachliche Spitzen (P3), Bau-Hygiene im Hintergrund (P0)** — alles andere opportunistisch (P4). Imposanz entsteht durch eine zu Ende gebaute, schwer kopierbare Sache plus einen billigen Verkettungs-Pfad, der sie erlebbar macht — nicht durch vier zu 60 % fertige Säulen.
