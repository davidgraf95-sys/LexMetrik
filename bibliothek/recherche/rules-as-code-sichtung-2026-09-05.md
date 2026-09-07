# Rules-as-Code-Sichtung 5.9.2026 — OpenFisca-Aotearoa und Catala gegen unsere Tarif-Stammdaten

**Erstellt:** 5.9.2026, Auftrag David («schau dir mal dieses repo an» → openfisca-aotearoa; «können wir etwas direkt verwenden?»; «schau mal wie unsere tarife heute aussehen»; «schau dir auch das an» → catala; «leg den bibliothek-eintrag und den roadmap-schritt an»). Drei read-only-Sichtungen durch Unteragenten (Opus), Klone nur im Session-Scratchpad, LexMetrik-Code unberührt.
**Status:** ERSTRECHERCHE (Repo-Sichtung + GitHub-API-Metadaten, Stand 5.9.2026; Lizenz-Einordnungen sind Einschätzungen, keine Rechtsauskunft; keine fachliche Abnahme nötig, da kein Rechtsinhalt).
**Quellen:**
- github.com/BetterRules/openfisca-aotearoa — Klon `--depth 50`, GitHub-API, Abruf 5.9.2026; Lizenz AGPL-3.0 (`LICENSE`).
- github.com/CatalaLang/catala — Klon `--depth 50`, GitHub-API, Abruf 5.9.2026; Lizenz Apache-2.0 (`LICENSE.txt`, `deps/dates-calc/LICENSE.txt`).
- catala-lang.org, book.catala-lang.org (Tutorial «Conditionals & exceptions»), inria.fr/en/catala-software-dgfip-cnaf — Abruf 5.9.2026.
- openfisca.org (Länderpakete), winterkongress.ch/2026/talks/mit_law_as_code_zum_proaktiven_fairen_und_effizienten_staat/ (Florin Hasler, Aufzeichnung media.ccc.de/v/dgwk2026-56540), bk.admin.ch/de/gesetzestechnik — Abruf 5.9.2026.
- LexMetrik-Bestand: `src/data/tarif/*.ts`, `src/lib/tarif/staffel.ts`, `src/lib/gebvKosten.ts`, `src/lib/erbteilung.ts`, `src/lib/gewaehrleistung.ts`, `src/lib/verjaehrung.ts`, `scripts/gegenpruefung/kern.ts`, `bibliothek/register/parameter-verfall.md` — Stand main 5.9.2026 (d9671d015).

---

## 0. Ergebnis in fünf Sätzen

Beide Fremdprojekte modellieren Recht als ausführbare Regeln mit Norm-Anker je Regel; ihr Code ist für uns unbrauchbar (Python bzw. OCaml, NZ-/FR-Recht), ihre Konventionen sind es nicht. Direkt verwendbar ist wegen AGPL nichts aus OpenFisca; aus Catala (Apache-2.0) ist die formal spezifizierte Datumsarithmetik `dates-calc` mit Namensnennung als Vorbild übernehmbar. Unsere Tarif-Stammdaten tragen Norm-Anker, Quelle und Stand bereits als Datenfelder je Eintrag — das ist die Hälfte des OpenFisca-Musters. Es fehlen die Zeitachse (eine Fassung je Tarif, Revision = Überschreiben, Altfall nicht nachrechenbar) und ein maschinenlesbares Stand-Datum (heute Anzeigetext in vier Formaten), weshalb kein Tor Tarifzahlen auf Drift prüfen kann. Der nächste sinnvolle Schritt ist deshalb nicht ein Zeitreihen-Schema, sondern `stand` maschinenlesbar plus ein Tarif-Drift-Tor; die Zeitachse folgt erst, wenn die Engines einen Stichtag als Eingabe kennen.

## 1. OpenFisca-Aotearoa (Neuseeland)

- **Was:** Computational models of NZ legislation auf der OpenFisca-Engine. Ursprung 2018 Service Innovation Lab (Department of Internal Affairs), heute Freiwillige (BetterRules) — nicht mehr staatlich getragen.
- **Aktivität:** letzter Push 13.3.2025; 43 Stars, 25 Contributors, 24 offene Issues (älteste 2019), offene PRs bis August 2026 (#200/#201) — Beiträge kommen, werden kaum gemerged. Kein PyPI-Release.
- **Umfang:** 423 Variable-Klassen in 97 Dateien, 58 Parameter-YAMLs, 63 Test-YAMLs mit 312 Testfällen. Domänen: Social Security Act (214 Variablen), Income Tax (40), Student Allowance (24), ACC (19), Citizenship (13), Parental Leave (12), Rates Rebate (6) u. a. — Sozialleistungs- und Anspruchsrecht, kein Prozess-, Fristen- oder Kostenrecht.
- **Architektur:** Entities (`entities.py`; Kopfkommentar: Szenario-Rollen sind ausdrücklich *keine* Rechtsbegriffe), Variables mit `reference` = Deep-Link auf legislation.govt.nz (150 Dateien), Parameters als datierte Wertreihen, **keine** Reforms — Rechtsänderung ausschliesslich über datierte Formeln (`formula_2013_04_17` in `variables/acts/social_security/jobseeker_support/jobseeker_support.py`).
- **Parameter-Muster** (`parameters/social_security/income_test_1.yaml`): `metadata.reference` mit **Link je Änderungsdatum**, `brackets` mit `rate`/`threshold` je Datum — strukturell dasselbe Problem wie Schweizer Gerichtskosten-Staffeln.
- **Tests:** YAML-Fälle in Prosa («Someone earning 32103 with no dependants …») mit `period`, `input`, `output`, `absolute_error_margin`; Sollwert-Herkunft im Kopfkommentar (amtlicher DIA-Rechner). Zeitgeltung doppelt: je Rechtsstand eine Datei (`rates_rebates_2018/2019/2020.yaml`) plus **Zeitreihen-Test** `tests/rates_rebates/time.yaml` (konstanter Input 2010–2019, Erwartungswert je Jahr).
- **Beitragsregeln** (`CONTRIBUTING.md` Z. 170–176, 205–235): Link auf «latest» nur bei unveränderter Logik, sonst je Formel-Datum auf die damalige Fassung; lokale Variablen in Textreihenfolge des Gesetzes (`ssa16_1`, `ssa16_2_a`); **nicht codierte Teilnormen auskommentiert mit Begründung stehen lassen**.
- **Negativbefunde (S5):** kein Drift-/Link-Check (gemischte `…/67.0/…`- und `…/latest/…`-Links); die zentrale Rebate-Formel nennt als Quelle eine Excel-Tabelle (`variables/acts/rates_rebates/rates_rebates.py`: `reference = "Obtained from spreadsheet at Department Of Internal Affairs Innovation Lab"`); `reference = "TODO"` kommt vor. Empirischer Beleg dafür, was ohne CLAUDE.md §7 (d) passiert.
- **Lizenz AGPL-3.0:** gilt auch für YAML-Parameter. Nur Konventionen nachbauen, nie Dateien übernehmen.

## 2. Catala (Inria, Frankreich)

- **Was:** domänenspezifische Sprache, Gesetzestext und Regel in derselben Datei (Literate Programming), «Regel — Ausnahme» als Sprachkonstrukt (`label`/`exception`, `under condition … consequence equals …`, `doc/syntax/syntax_en.catala_en:176-201`); zwei anwendbare Regeln ohne Vorrang = Laufzeitfehler, kein stiller Gewinner.
- **Aktivität/Reife:** Version 1.2.1 (6.7.2026), Releases 1.0.0 (11/2025) bis 1.2.1, 2375 Stars, 51 Contributors, 79 offene Issues, letzter Push 4.9.2026. Träger Inria, mitfinanziert CNAF (`publiccode.yml:18-21`). **Widerspruch offen:** `publiccode.yml:40` behauptet Produktivnutzung DGFiP, `README.md:186-188` nennt den Compiler «yet unstable», Inria-Mitteilung spricht von zwei Proofs of Concept (CNAF, DGFiP, seit 6/2023). Belastbar: zwei Behördenpiloten; «produktiv» nur als Selbstauskunft — nicht als Referenz zitieren.
- **Zeitgeltung:** nicht eingebaut; Rechtsstände als zwei Definitionen mit gleichem Label und Datumsbedingung nebeneinander (Tutorial 2-2). Datumsarithmetik mehrdeutigkeitsbewusst: `date round down|up` als Scope-Einstellung (`syntax_en.catala_en:205`), `stdlib/date_en.catala_en:31-33` («`|2026-05-31| + 1 month` = 30.6. oder 1.7.»); ohne Rundungsentscheid Fehler statt geratenes Datum. Formale Spezifikation in `deps/dates-calc` (Apache-2.0).
- **Backends** (`compiler/driver.ml:1043,1151,1215,1256`): OCaml, Python, Java, C, Interpreter, LaTeX/HTML, JSON-Schema. **Kein JS/TS-Backend.** Web nur indirekt via js_of_ocaml (`compiler/plugins/api_web.ml`, `runtimes/jsoo/`, opam `catala-js`); npm `@catala-lang/french-law` 0.10.0 = eine JS-Datei von 5 410 172 Bytes mit einkompilierter OCaml-Laufzeit, keine TS-Typen.
- **Werkzeuge real:** Z3-Verifikation (`compiler/verification/z3backend.ml`, `plugins/proof.ml`) beweist «keine Regel anwendbar» / «zwei Regeln kollidieren» weg; Tests als `#[test]`-Scopes über alle Backends (`clerk test`); `--trace` Rechenweg inkl. gefeuertem Artikel; Erklärgraphen (`plugins/explain.ml`); VS-Code/LSP. **Kein** Legislation-Diff/Drift-Wächter (`catleg` ist ein separates Legifrance-Werkzeug).
- **Sprachen:** Syntax EN/FR/PL (`compiler/surface/lexer_*.cppo.ml`), **kein Deutsch**; Beispiele nur FR + ein australisches; nichts Schweizerisches.

## 3. Schweiz-Umfeld (Negativbefund S5)

Kein OpenFisca-Länderpaket Schweiz (openfisca.org, GitHub-Org). Kein Catala-Projekt CH. Belegt nur: Vortrag Hasler, Winterkongress 2026 («Law as Code» findet in der Schweiz wenig Beachtung, Verwaltungspilot geplant — Stand des Pilots ungeprüft) und die Datenseite (Bundeskanzlei publiziert AS/BBl/SR seit 2022 als XML). Kantonale/private RaC-Projekte CH: kein belastbarer Fund.

## 4. Unsere Tarif-Stammdaten heute (Ist, main 5.9.2026)

| Fundort | Datenform | Datum je Wert | Quelle je Wert | Revision | Mehr-Rechtsstand-Tests |
|---|---|---|---|---|---|
| `src/data/tarif/{gerichtskosten,schlichtung,parteientschaedigung,beurkundung,grundbuch,notariat-grundbuch,nicht-vermoegensrechtlich,bundesgericht}.ts` (~950 Einträge) | `Record<KantonCode, KantonalerTarif>`, Regel als typisierte Union | nur `stand` als **Anzeige-String** (≥4 Formate: `01.01.2024`, `1.1.2025`, `2026-06-16`, `2026 (konsolidiert)`); `gueltigAb`/`gueltigBis` im ganzen Repo 0 Treffer | ja: `quelleUrl` + `erlassNr` + `artikel` + `verifiziert` | Überschreiben in place, eine Fassung | nein |
| `src/lib/tarif/staffel.ts` | fachneutrales Auswerte-Primitiv | – | – | kennt keinen Rechtsstand-Parameter | nein |
| `src/lib/gebvKosten.ts`, `emissionsabgabe.ts`, `verzugszins.ts` | nackte Zahlen im Modul | nein | nur Kopfkommentar | Überschreiben | nein |
| `src/data/zustaendigkeitKosten.ts` | TS-Objekte, Quelle als Prosa | nein | nein | Überschreiben | nein |
| `src/data/likReihe.ts` | **echte Monats-Zeitreihe** (generiert), Tor `check:lik-frische` | ja | Reihe-global | Generator | n/a |
| SchKG-Existenzminimum | nicht vorhanden (Karte `existenzminimum` = `geplant`) | – | – | – | – |

**Rechtsstand-Wechsel im Rumpf:** `src/lib/erbteilung.ts:200` (`todesdatum >= '2023-01-01'`, ~10 Verzweigungen), `src/lib/gewaehrleistung.ts:71` (`REVISION = 2026-01-01`) — beide **mit** Mehr-Rechtsstand-Tests (`src/tests/erbteilung.test.ts`, `gewaehrleistung.test.ts`). `src/lib/verjaehrung.ts:547`: Revision 2020 (relative Frist 1→3 J.) nicht abgebildet, nur Nutzerwarnung.

**Drift-Prüfung:** für Normtext vorhanden (`check:normtext-netz`, `check:fedlex-versionen`, `check:zitate`, `check:frit-drift`, `check:stand-zukunft`, `fassungsToken`); für **Tarifzahlen kein Tor** — `src/data/tarif/**` ist nur Risikopfad für die Gegenprüfungspflicht (`scripts/gegenpruefung/kern.ts:201`). `check:verfall` liest das Register nur zeilenweise pauschal. **Präzedenz Blindflug:** SG GKV sGS 941.12 hing an Version 2808 (Stand 1.3.2012), amtlich galt seit 1.7.2026 Version 3863 — unbemerkt bis zur Handprüfung 13.8.2026 (Register).

**Roadmap-Bestand:** kein Schritt fordert datierte Tarif-Zeitreihen oder Rechnen auf historischem Rechtsstand. Nächstliegend: K-9 (Erlass→Werkzeug-Brücke Kanton: Inversion der `quelleUrl`s + Konsistenz-Tor — Verlinkung, nicht Zeitachse), STRATEGIE-PLATTFORM F2.3 (Verfalls-Gate maschinell).

## 5. Übertragbarkeit — Muster ohne Stack-Wechsel

| Muster | Herkunft | Schliesst bei uns | Kosten |
|---|---|---|---|
| **Stand maschinenlesbar** (ISO-Datum + Fassungs-/Nachtragskennung je Eintrag) | Vorbedingung für alles Weitere | Drift-Blindheit der 950 Tarife | klein, verhaltensneutral |
| **Tarif-Drift-Tor**: Stand je Eintrag gegen aktuelle Fassung der Quelle (LexWork `current_version`, Fedlex-Konsolidierungsdatum, ZH-ETag) | eigener Bestand (Normtext-Tore) — OpenFisca zeigt, was ohne passiert | §7 (d) für Tarifzahlen; SG-2808-Klasse | mittel; Quell-Adressierbarkeit je Kanton prüfen |
| **Wert-Zeitreihe je Tarif** `{ab, wert, quelle, stand}` | OpenFisca `income_test_1.yaml` | Altfall nachrechenbar; Revision ohne Überschreiben | gross: Engines brauchen Stichtag als Eingabe (UI-Feld «massgebender Zeitpunkt»), Golden-Beweis für «heute» |
| **Rechtsstand als Datumsbedingung neben der Regel** statt `if` im Rumpf | Catala (Label + Datumsbedingung), OpenFisca (`formula_<datum>`) | erbteilung/gewaehrleistung/verjaehrung-2020 | mittel; §1-konform (Duplikat vor Vermischung) |
| **Regel-Liste mit explizitem Vorrang + Kollisions-/Lücken-Test** (wirft bei zwei anwendbaren Regeln ohne Vorrang) | Catala Default-Logik, Z3-Beweis | Staffel-Lückenlosigkeit als Property-Test (→ `QS-CODE-PROP`), §6.7-tauglich | klein |
| **Zeitreihen-Golden** (ein Sachverhalt über alle Rechtsstände) | OpenFisca `tests/rates_rebates/time.yaml` | Revision sofort als Diff sichtbar | klein, sobald Zeitachse existiert |
| **Explizite Datumsrundung** bei Monatsarithmetik | Catala `dates-calc` (Apache-2.0, mit Namensnennung übernehmbar) | Fristen-Engine: implizite Monatsend-Semantik | klein; Prüfauftrag, ob unsere Fristen-Engine heute rät |
| **Rechenweg-Trace als Datenstruktur** (Regel, Artikel, Zwischenwert) | Catala `--trace`, `explain.ml` | Nachvollziehbarkeit in der UI (§8) | mittel |
| **Ungeregeltes sichtbar lassen** (Teilnormen in Textreihenfolge, nicht codierte auskommentiert mit Grund) | OpenFisca `CONTRIBUTING.md` Z. 230–233 | §8 im Code statt im Kopf | Konvention, null Code |

**Nicht übernehmen:** OpenFisca-Engine (Python, AGPL, Haushalts-Mikrosimulation), Catala als Sprache (OCaml-Werkzeugkette in CI, 5-MB-Bundle gegen §15, Bus-Faktor 1, Compiler-Version ausserhalb unserer Kontrolle für §6). Wiedervorlage Catala nur, falls ein natives JS/TS-Backend erscheint.

## 6. Bau-Vorschlag (Spec für den Roadmap-Schritt `W3-TARIF-STAND`)

Ziel: Tarif-Stammdaten werden maschinell auf Drift prüfbar, ohne Verhalten zu ändern.

1. **`stand` maschinenlesbar** — je Eintrag ISO-Datum (`standIso`) plus Fassungskennung der Quelle (Nachtrag/Version/ETag, je Portal); Anzeige-String bleibt als Projektion. Verhaltensneutral (Golden byte-gleich), Risikopfad `src/data/tarif/**` ⇒ Gegenprüfung Pflicht.
2. **Tor `check:tarif-drift`** — vergleicht je Eintrag die hinterlegte Fassungskennung mit der aktuellen der Quelle (Adapter je Portal: LexWork `current_version`, Fedlex-Konsolidierungsdatum, ZH-ETag/`Ordnr`). Rot-Beweis: SG-2808-Fall rekonstruieren. Nicht erreichbare Quellen = «unklar», nie grün.
3. **Verfallsregister** speist sich aus dem Tor statt aus Handzeilen (löst F2.3-Anteil «Tarife»).
4. **Grenzen:** keine Zeitachse, kein Stichtag in den Engines, keine Änderung an Tarifwerten. Die Zeitachse (`{ab, wert, quelle, stand}` + Stichtag-Eingabe + Zeitreihen-Golden) ist ein eigener Folgeschritt, dessen Vorfrage offen ist: bieten lexfind/zh.ch/belex frühere Fassungen stabil adressierbar an? (ungeprüft.)
5. Nebenprodukt-Kandidaten mit eigener Einordnung: Kollisions-/Lücken-Property-Test für Staffeln (→ `QS-CODE-PROP`), Datumsrundungs-Prüfauftrag Fristen-Engine, Rechtsstand-Weiche verjaehrung-2020 (fachlich, wartet auf David).

## 7. Offen / wartet auf David

- Verjährungsrevision 2020 als echte Rechtsstand-Weiche abbilden (fachlich §7) — heute nur Warnung.
- Ob die Zeitachse (Altfall-Rechnen) ein Produktziel ist; ohne Stichtag-Eingabe in der UI ist sie wertlos.
- Ob LexMetrik den Catala-Beleg-Widerspruch (Pilot vs. produktiv) irgendwo als Referenz braucht — Empfehlung: nein.

## 8. Repo-Suche «bestehende Ideen, die uns helfen» (5.9.2026, Gemini und Sonnet parallel)

**Auftrag David:** «suche auch nach sinnvollen ideen die bereits bestehen und uns helfen. verwende gemini für suche … vorallem repos usw». Gleicher Suchauftrag (neun Lücken A–I, Ausschlussliste der Sichtung vom 2.9.2026) parallel an Gemini (`agy`, gemini-3.1-pro-high, sandbox) und einen Sonnet-Recherche-Agenten; alle Repo-Metadaten danach von der Haupt-Session per `gh api repos/<owner>/<repo>` nachgeprüft (Abruf 5.9.2026). Messzeile: `fahrplaene/FAHRPLAN-FREMDAGENTEN.md` §5.

### 8.1 Rangliste (bereinigt, nur existierende Repos, Metadaten per API belegt)

| # | Fund | Lizenz · Stack · Aktivität | Lücke | Einordnung |
|---|---|---|---|---|
| 1 | **legalize-dev/legalize-ch** — 5 139 SR-Erlasse (DE) als Markdown, «jede Reform ein Commit» datiert auf `jolux:dateApplicability`, Quelle Fedlex-AKN-XML; Spec `legalize/SPEC.md` v0.4 (Frontmatter, `extra.history_from`) | Pipeline MIT (`legalize-pipeline`), Daten gemeinfrei · Python · Bootstrap 20.3./27.3.2026, letzter Push 23.6.2026, 7★; **unklar, ob laufend nachgeführt** | F, A (Fassungs-Zeitleiste) | **Direkt verwendbar als Vergleichsorakel, nur im Test:** Diff unseres Korpus gegen legalize-ch (fehlende SR-Nummern, abweichende Konsolidierungsdaten) — billiger Zweitblick auf §7 (d), nie als Quelle (§5: Fedlex bleibt die Wahrheit). Muster «Reform = Commit» für Schritt #17 der Sichtung 2.9. (Fassungs-Zeitleiste je Erlass). Historie erst ab ~2021, keine Kantone. |
| 2 | **gorules/zen** + npm `@gorules/zen-engine-wasm` 0.23.1 — Decision-Tables/JDM mit **replaybarem Trace je Entscheid**, React-Editor `@gorules/jdm-editor` | MIT · Rust, Wasm-Paket 1,8 MB unpacked (Stand 17.3.2026, hinkt Engine 2.0.2 hinterher) · Push 25.8.2026, 1 965★ | D, E, I | **Nur Muster** für die Trace-Datenstruktur (Regel → Eingabe → Ausgabe → Zwischenwerte). Als Engine ein Stack-Wechsel für die Rechenlogik (§4, §6-Golden über fremden Compiler) und 1,8 MB gegen §15. |
| 3 | **elite-libs/rules-machine** — JSON-Regeln mit Debug-Trace, TS-nativ, klein | BSD-3-Clause · TS · Push 21.4.2026, 56★, npm 1.1.4 | D, I | **Direkt einbindbar, aber nicht empfohlen:** unsere Engines sind Handcode je Rechtsgebiet; Wert liegt im Trace-Format als Vorbild für einen eigenen `rechenweg[]`-Rückgabewert. |
| 4 | **freelawproject/eyecite** (+ TS-Port `beshkenadze/eyecite-js`) — Tokenizer → Resolver → Annotator für Zitate | BSD-2 · Python (Port TS, 3★, Push 8/2025) · eyecite Push 5.9.2026, 273★ | G | Nur Muster (US-Zitierstil). Architektur-Vorbild für `zitat-extraktion.ts` (Trennung Erkennen/Auflösen/Annotieren, Konfidenz je Treffer). |
| 5 | **Lexpedite/blawx** — Blockly über s(CASP), defeasible Regeln mit Ausnahmen, Erklärungen, Szenario-Explorer | MIT · HTML/JS · Push 1.11.2024, 153★, laut Doku nicht produktionsreif | D, E | Nur Muster: wie Ausnahme-Hierarchien und «warum»-Erklärungen dem Nutzer gezeigt werden. |
| 6 | **rjsf-team/react-jsonschema-form** — Formulare aus JSON-Schema | Apache-2.0 · TS · Push 4.9.2026, 15 889★ | I | Direkt verwendbar, **aber §10:** Wizard-Rahmen existiert; nur bei einem Bedarf, den der Rahmen nicht trägt. |
| 7 | **bundestag/gesetze-tools** (LGPL-3.0, Push 4.5.2026, 135★) · **nfelger/gesetze-aus-dem-internet** (Apache-2.0, Push 15.1.2026, 23★) · **openlegaldata/oldp** (MIT, Django, Push 30.8.2026, 154★) | DE-Spiegel/Plattformen | F, H | Nur Muster (DE, Server-Stacks). gesetze-tools = Git-Pipeline-Vorbild wie legalize. |
| 8 | **laws-africa/bluebell** (GPL-3.0, Push 13.7.2026, 23★) · **laws-africa/indigo** (Push 4.9.2026, 77★, Lizenz im API-Feld NOASSERTION — manuell prüfen) | AKN-3-Parser / Point-in-time-Konsolidierungsplattform | F | Nur Muster; wir parsen Fedlex-AKN bereits. Indigo als Vorbild für Fassungs-Navigation (Point-in-time) — Lizenz vor jeder Vertiefung klären. |
| 9 | **MLanguage/mlang** (GPL-3.0, Push 20.1.2026, 203★) · **CatalaLang/catleg** (Apache-2.0, Push 2.6.2026, 5★) | amtlicher FR-Steueralgorithmus als Compiler / Legifrance-Werkzeug | B, H | Nur Muster: Beleg, dass eine Verwaltung ihren Rechenalgorithmus offen versioniert. |
| 10 | **smucclaw/l4-ide** (Haskell, Lizenz NOASSERTION, Push 15.7.2026, 37★) | kontrollierte natürliche Sprache für Rechtsregeln | B, E | Ansehen, Lizenz ungeklärt, kleine Basis. |
| 11 | **nicia-ai/typegraph** (MIT, TS, Push 5.9.2026, 79★) — bitemporale Lesesemantik («wann galt es» vs. «wann eingetragen») | I, A | Muster für die Zeitachsen-Typen des Folgeschritts zu `W3-TARIF-STAND`, mehr nicht. |
| 12 | **worldwidelaw/legal-sources** (AGPL-3.0, Python, Push 3.8.2026, 365★) — 900+ Scraper | H | Nur nachschlagen, ob dort kantonale CH-Portale erschlossen sind (nicht geprüft); AGPL ⇒ nie Code. |

**Ignorieren (mit Grund):** `PBaumfalk/Saldenwerk` (MIT, 1★, Hobby-RVG), `mlobo2012/Germany-SMB-Legal-Plugin` (keine Lizenz, LLM-Tools), `ralphhanna/dmn-engine` (Push 2020), `jurisdatum/lgu-mcp-ts` (archiviert), `BobPritchett/edtf-ts` (1★; date-fns-Intervalle reichen), `SimmonsRitchie/business-days-js` (5★, Push 2024; eigene Feiertagslogik in `src/lib/fristenEngine.ts`/`datumsUtils.ts` vorhanden), `Tochemey/business-date-checker` und `laws-africa/slaw` (archiviert), `freetrade-io/ts-business-time` (keine Lizenz, 2021), `adrianlerer/LegalGapDB` (0★, keine Lizenz), `lavis-nlp/german-legal-reference-parser` (keine Lizenz, Push 2023), `it-at-m/xjustiz` (Java-Schemas DE, 2★).

### 8.2 Negativbefunde (S5)

- Kein offenes Repo mit Schweizer Tarif-/Schwellen-Zeitreihe und Drift-Tor (Lücke A) — `W3-TARIF-STAND` bleibt Eigenbau.
- Kein offener Fristenrechner CH (frist.ch, legaldeadline.ch, fristenrechner.ch sind geschlossen) und kein offener DE-RVG/GKG-Rechner mit Lizenz — Lücke C/H ohne Baustein.
- Kein Zitat-Parser für BGE/ZPO-Zitierstil (Lücke G); eyecite ist US.
- Rules-as-Code-Programme AU/NZ/NL/UK: nur Whitepaper und Blogposts, kein offenes Engine-Repo (NSW verweist auf OpenFisca).
- Kein produktreifes Beweis-/Property-Werkzeug für Regel-Kollisionen ausserhalb Catala/Z3 (Lücke E) — bleibt Property-Test im eigenen Bestand (`QS-CODE-PROP`).

### 8.3 Konsequenz

Ein einziger Fund ist ohne Umweg nützlich: **legalize-ch als Test-Orakel** gegen unseren Bund-Korpus (Abgleich SR-Bestand und Konsolidierungsdaten; Kandidat als `- [ ]`-Zeile unter `QS-KORPUS` oder als Nebenprodukt von `W3-TARIF-STAND`, kein eigener Schritt). Alles andere sind Muster, die in §5 dieser Datei bereits stehen (Trace-Struktur, Rechtsstand neben der Regel, Zitat-Pipeline-Trennung). Kein Bau ausgelöst.

