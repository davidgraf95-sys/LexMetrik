# Handlungsplan (Stand 7.6.2026 abends — 3. Fassung)

Priorisiertes weiteres Vorgehen. Gepflegt wird dieser Plan NUR hier;
erledigte Punkte durchstreichen oder löschen, Stand in STRUKTUR.md spiegeln.

> **ÜBERGEORDNET (Anweisung David 8.6.2026): `FAHRPLAN-GRUNDLAGEN.md`** —
> der vom Endziel (Kanzlei-Praxistauglichkeit) her umgebaute Plan mit den
> vier Grundlagen G1–G4 (Abdeckungskarte · Vertrauen · Arbeitsplatz ·
> Wachstum). Er steuert die Reihenfolge; dieser Handlungsplan bleibt das
> Detail-Backlog. B.18 (Roadmap-Triage) geht in G1 auf; A.2 (Markt-Themen)
> bleibt bewusst draussen; §0a gilt weiter.

## §0a · LEITPRINZIP PERFEKTION VOR NEUBAU (Daueranweisung David 7.6.2026 abends)

«Wir perfektionieren jetzt zuerst die bestehenden Engines und bauen
gerade nichts Neues.» Konkret: KEINE neuen Engines/Rechner/Vorlagen/
Features (auch nicht Zwei-Kategorien-Kapitalmodell AG-6, Mahnung,
Eheschutz/GlG, BGG-Stufe 2, GmbH-G-Programm) — bis David den Neubau
wieder öffnet. ERLAUBT bleibt alles, was Bestehendes besser macht:
Bug-Fixes, Härtungen/Invarianten, Verifikationen am Gesetz,
Vereinheitlichung der Rechner-Ausstattung, Dossier-/Recherche-Arbeit
(Bau-Vorwissen), Abnahme-Vorbereitung.

## §0 · LEITPRINZIP MEHRWERT-TEST (Daueranweisung David 7.6.2026 abends)

Gebaut/behalten wird nur, was **echten Mehrwert über die bestehenden
generischen Werkzeuge** liefert. Konkret für Fristen-Rechner: Hat ein
Rechtsgebiet KEIN eigenes Berechnungs-Regime (kein Stillstand, keine
Sonderunterbrechung, keine abweichende Berechnungs-/Zustellregel, keine
Spezial-Gates), deckt der allgemeine Tagerechner es bereits ab — die
geplante Karte wird GESTRICHEN oder als Preset/Hinweis in ein bestehendes
Werkzeug gefaltet (Beispiel David: StPO-Fristen ohne spezielle
Unterbrechung → Tagerechner genügt; Art. 89 Abs. 2 StPO kennt ja gerade
KEINE Gerichtsferien). Analog für Beträge/Vorlagen: kein eigener Einstieg
für etwas, das ein bestehendes Werkzeug mit einem Preset kann. Der Test
gilt VOR jedem Neubau und rückwirkend für die ~80 geplanten Karten
(→ Punkt B.18 Roadmap-Triage). Streichungen sind fachliche Entscheidungen:
Regime-Freiheit erst am Gesetz verifizieren, dann streichen und die
Begründung in KATALOG-ROADMAP.md festhalten.

## A · Entscheide, die nur David treffen kann (blockieren anderes)

0. **Stand 7.6.2026 abends:** gepusht bis `4b5b9c3` (71 Commits, Token-Frage
   gelöst — neues PAT im Keychain); danach lokal: Deploy-Bug-Check über das
   Delta (35 Kandidaten → 14 Verifizierer) mit **2 HOCH-Fixes `0096c8d`
   (BEIDE Zeitzonen-Datums-Bugs, feuerten auch in Europe/Zurich:
   keVerfallDatum einen Tag falsch IM DOKUMENT; Kapitalband-5-J-Gate)** +
   ICS-UID-Kollision + Footer-Free/Pro-Leichen + Redirect-Tests ·
   **Katalog-Konsolidierung `357527b`** («ein Einstieg pro Rechtsfrage»,
   Auftrag David: 35→28 sichtbare Karten, imKatalog:false-Mechanik,
   FAHRPLAN-KATALOG-KONSOLIDIERUNG.md §6) · GmbH-Programm GESTARTET
   (FAHRPLAN-GMBH-GRUENDUNG.md G0–G7, war ausdrücklich eingereiht).
   **Session-Abschluss 7.6.2026 spätabends:** AG-Programm FERTIG
   (Geld-Invariante AG-G1–G3 · FINMA→Engine · ZIP-Guard/Strich-Nummerierung ·
   B4-Vinkulierung 685b I+V · P11-Nachverifikation: **ZH-Rahmen war veraltet
   [Nachtrag 123: max 4'000!], SG floor verdrahtet [deklariert, Abnahme],
   Agio-Basis 4 Kantone belegt** · UR/AI/BL-Links · Abnahme-Dossier
   regeneriert). §0-Triage: −7 Karten verifiziert (inkl. MSchG 31:
   monatsbestimmt, KEIN 22a-Stillstand); steuer-verjaehrung bleibt (DBG
   120/121 Eigen-Regime); BGerR verifiziert (cc/2006/834 @1.2.2026,
   **Straf-Split 35/35a neu**, Rechtsöffnung→I. Abt. bestätigt) → B.5a
   bau-bereit nach Abnahme. §0a-GESPERRT (Dossiers liegen): Zwei-Kategorien-
   Kapitalmodell · GmbH G1–G7. V-Runde 1: Tagerechner (geteilter Teilen-
   Button + Tab im Hash) · 7 Titel-Paare + Drift-Invariante. V OFFEN:
   Fristenspiegel-PDF · Kombi-Tab · CHF-Formatter (nur mit Golden).
   ~19 Commits ungepusht; Push/Deploy auf Davids Ja.
1. ~~Push + DEPLOY-Ja~~ → **DEPLOYED 7.6.2026** (Davids Ja «bug check und
   dann deploy»): gesamter Stand `c24c761..2a3a6b2` (62 Commits — Praxis-
   Etappen 1–3 inkl. Fristenspiegel · Katalog-UI/Kacheln/Suche/BGE ·
   8 Zuständigkeits-Fixes + B-1/B-2 · Streitwert · Betreibungskosten ·
   Gründungs-Masken GmbH/AG · Design-Review) gepusht und auf
   lexmetrik.vercel.app produktiv (Build Ready, Routen-Stichproben 200).
   **Deploy-Bug-Check §9 davor:** Workflow mit 6 Strang-Reviewern (jeder
   Befund 2× adversarial verifiziert) + Einzel-Review Betreibungskosten →
   7 bestätigte Befunde gefixt (`2a3a6b2`, 1 HOCH: hartcodierte
   Art.-142-Abs.-1-Zitierung im Begründungs-Absatz), 3 Roh-Befunde
   adversarial verworfen; Tore: 953 Tests · Sweep 11'184 · Golden 65×
   byte-gleich · 341 Zitate · Smoke.
2. **Hosting & Zahlungsmittel (vor Login-/Pro-Phase):** Migration zu CH-Host
   (Empfehlung Infomaniak), Domain **lexmetrik.ch früh registrieren**;
   Zahlungssystem offen (PayPal raus) — Payrexx/Datatrans/TWINT prüfen.
3. **Fachliche Abnahmen** (alles bleibt `entwurf`/`verified:false` bis
   Wort-für-Wort-Durchgang — Davids Entscheid 5.6.2026): 8 Vorlagen,
   NormRefs, 19 Recherche-Dossiers (neu dazu: Eheschutz/GlG, BGG-Beschwerde,
   Feiertags-Matrix `normen/feiertage-kantone-bj.md`).
4. **Offene Grundsatzfragen** (gesammelt): Dienstjahr-Stichtag Kündigungsfrist
   (Zugang [Ist] vs. Beendigung) · Sperrtage-ANZEIGE-Konvention ·
   3 Export-Antworten (Verzugszins-Hinweis kürzen? DOCX-Standardannahmen?
   Bausteinprotokoll in Exporte?) · BGG-Dossier «Offene Fragen» 1–7 (V-1
   Eheschutz-Warnung ist seit 6.6.2026 als WARNUNG verdrahtet — Abnahme) ·
   **GebV-SchKG-Promille-Rundung** (Deploy-Bug-Check 7.6.2026: 2 ‰/5 ‰
   jetzt nach Hauskonvention auf 0.01 gerundet [round2]; ob amtlich 0.05
   gälte, ist Fachfrage — GebV nennt keine Regel).

## B · Baufertig spezifiziert (Reihenfolge = Empfehlung)

4a. ~~Zuständigkeits-Wizard~~ → **LIVE** (`a64c5ab`, Logik-Check bestanden)
   inkl. Vorlagen-Verweis am Fahrplan-Ende (`518f996`, auch für geplante
   Vorlagen). ~~Offen daraus (NIEDRIG): UX-Hinweis im leeren Ergebnis-Schritt~~
   (bestätigt behoben, Bug-Check 6.6.2026); Prefill-Brücke klage-vereinfacht
   existiert, ist aber seit K-2 auf BS begrenzt (korrekt).

4b. **Bug-Check Zuständigkeitsrechner über ALLE Funktionsvarianten**
   (6.6.2026 spätabends, Auftrag David; 5 unabhängige Review-Agents, ~71'000
   empirische Kombinationen, Normen am Fedlex-Cache verifiziert) → **8 Fixes
   committet**: K-1 Familien-Summarsache verlängerte fälschlich die
   BESCHWERDE-Frist auf 30 T. (`febbed6`) · K-2 klage-vereinfacht-Verweis
   BS-begrenzt (`b535553`) · M-1 Art.-93-Vorbehalt prozessleitende Verfügung
   (`9e12ef1`) · M-2 HG-Weiche gesellschaft Art. 6 IV lit. b (`c5b05ba`) ·
   M-3 IP nicht-vermögensrechtlich ehrlich (`7718bc6`) · M-4 Widerspruch-
   Frist-Norm differenziert (`280365f`) · M-5 Art.-39-Warnung Konkursbegehren
   (`0256d13`) · M-6 StPO-Beschwerdefrist als Frist-Objekt (`6e1acb6`).
   **Triage 10.6.2026 (FAHRPLAN-GRUNDLAGEN G2/A3, alle 6 am Code verifiziert):**
   ~~M-7 Permalink-Sub-Felder~~ GEFIXT (nur bei passender Streitsache/Instanz
   in den State übernommen) · ~~rmFamilienSummarsache ohne Streitsachen-Check~~
   GEFIXT als deklarierte fachliche Änderung: Art. 314 Abs. 2 ZPO (Wortlaut
   verifiziert: nur Streitigkeiten nach 271/276/302/305) greift nur noch bei
   plausibler Streitsache (scheidung/geldforderung); sonst fristsichere
   10 Tage + erklärende Weiche — auch im Fristenspiegel (familienWirksam
   statt Roh-Flag; widersprüchliches mietOderArbeit+Familien-Flag → Abs. 1) ·
   ~~toter Engine-Aufruf StrafZustaendigkeitTeil~~ FALSIFIZIERT (Ergebnis
   wird vollständig genutzt) · ~~Testlücken rueckforderung/feststellung +
   Straf-Kaskade-Default~~ waren bereits geschlossen (verifiziert).
   **WEITER OFFEN (je «klein», Output-wirksam → Wortlaut-Verifikation +
   Golden-Deklaration nötig):** Art.-40/41-StPO-Zitatschärfe in der
   Gerichtsstands-Weiche (strafZustaendigkeit.ts:138) · Erbschaft+Pfand-
   Kombination ohne Vorrang-Klärung (schkgZustaendigkeit.ts, Art. 49 vs.
   51) · Widerspruch-Fahrplantext ignoriert grundstueck-Konstellation
   (Parteirollen nach Grundbuch-Eintrag, Art. 109 Abs. 3 / 107 f. SchKG).
   M-8 PDF/Aktenzeichen/Teilen → FAHRPLAN-GRUNDLAGEN G3.1.
   Repro-Skripte in `.scratch/review-*`.

5. ~~Kündigungs-Masken~~ → **FAMILIE KOMPLETT** (6.6.2026 nachts, je mit
   Bug-Check): 1a AN free `9165094` · 1b AG Sperrfristen-Blocker `1714319`
   · 2a Mieter Familienwohnung-Blocker `c5a1bc7` · 3 Vertrag/Presets mit
   verifizierten VVG-Wortlauten `9a33c65` · 2b Vermieter-CHECKLISTE
   (§8-Grenze, kein Export) `0af1215`. Katalog 28 verfügbare Einträge.
5a. **Rechtsmittel-Spruchkörper** ✅ verdrahtet `e749583` (nur belegte:
   VD nach Rechtsmittel-Typ; GE/TI/NE/JU ein Spruchkörper; Rest ehrlich
   offen). OFFEN daraus: ZG-Beschwerde-Schnitt bestätigen · BGer-
   Abteilungsregel (Art. 33/34 BGerR) am Fedlex-Wortlaut verifizieren,
   dann in bestimmeRechtsmittel (Dossier §3, Rechtsöffnungs-Falle!).
6. ~~Untermietvertrag~~ → **GEBAUT** (6.6.2026, Weiche in mietvertrag.ts +
   Katalog-Einstieg; 7.6. abends in die Mietvertrags-Karte KONSOLIDIERT).
7. **Eheschutz + GlG in der Zuständigkeits-Engine** — Dossier
   `recherche/eheschutz-glg-zustaendigkeit.md`: 4. Verfahrensart
   `summarisch`, Streitsache Eheschutz (Art. 23/198 lit. a/271/314 Abs. 2),
   GlG-Verwaltungsweg-Hard-Stop (Art. 13 GlG).
8. **BGG-Ausbau Stufe 2** — aus `recherche/bgg-beschwerde-engine.md` noch
   nicht verdrahtet: Sonderfristen Art. 100 Abs. 2/3 (SchKG-Aufsicht 10 T.,
   Wechsel 5 T.), Streitwertberechnung Art. 51 (Kapitalisierung 20×),
   Schiedsgericht Art. 77, Anschluss an den SchKG-Rechtsweg.
9. **Quick-Wins** (recherche/INDEX-Priorisierung) — 3 von 4 GEBAUT 7.6.2026:
   ~~Streitwert-Rechner~~ → `/rechner/streitwert` (`80c78e4`, Art. 91–94a
   inkl. Teilklage Rev. 2025; Ermessen nie geschätzt) ·
   ~~GebV-SchKG-Kostenrechner~~ → `/rechner/betreibungskosten` (`b86c8b9`,
   nach Tiefenrecherche: Dossier gebv-schkg-kostenrechner.md, Tarif Wert
   für Wert am 1.1.2026-Stand verifiziert; AS-2025-630/522-Aufklärung) ·
   ~~336b-Fristen~~ → im Fristenspiegel A.3 (Anker beendigungISO,
   §2-Gate; `54c585b`) — eigener Rechner nur noch bei Bedarf ·
   OFFEN: Vorlage «Mahnung» (free; or-vertragsvorlagen.md baufertig).
9a. ~~Gründungs-Masken GmbH/AG~~ → **GEBAUT** (6./7.6.2026, Auftrag David;
   `fb0b2f1`): Checklisten nach 2b-Muster (§8: Beurkundungszwang → kein
   Export) auf 3 neuen Recherche-Dossiers (gesellschaftsgruendung ·
   gmbh-gruendung · ag-gruendung; 3 Deep-Research-Workflows + Notariats-
   Sweep, Kernzahlen am Cache verbatim — inkl. neu gepinnter Caches
   HRegV/GebV-HReg/StG). Bug-Check §9 durch 2 unabhängige Agents
   bestanden (0 HOCH; eingearbeitet: M-1 «abschliessend» nur
   registerrechtlich, M-2 lit. f als Weiche, U+2019-Apostroph,
   Halbgeviert + Konventions-Test-Lücke). Katalog **33 verfügbar**.
9b. ~~AUSBAUSTUFE Gründung~~ → **GEBAUT GmbH + AG** (7.6.2026 nachts,
   Aufträge David inkl. «neustes Recht» + Notariats-Links): Wortlaut-Dossier
   `recherche/gruendungsdokumente-wortlaute.md` (Rechtsstand-Verifikation
   OR 1.1.2026; §7-Korrektur: Art. 806b OR gilt weiter) · Dokumentmappen
   GmbH/AG (`lib/vorlagen/gruendungGmbh|AgDokumente.ts`): Statuten +
   Errichtungsakt als ENTWURF (§8), Erklärungen/Beschlüsse/VR-Protokoll/
   HR-Anmeldung druckfertig; Erstausbau Bargründung CHF (AG: Namenaktien,
   Teilliberierung 632 mit 20-%-/50k-Gates) · Notariate 26 Kantone
   (`behoerden/notariate-kantone.md` + `lib/notariate.ts` + Link-Box in
   beiden Masken; SH: HRegA beurkundet selbst) · Bug-Check §9: 2 Agents
   (2304 Kombinationen empirisch / juristischer Wortlaut-Abgleich),
   1 HOCH (805-V-Anker → 701d) + 5 M/N-Befunde gefixt; 975 Tests grün.
   OFFEN daraus: ~~qualifizierte Gründung/Fremdwährung/Agio = Stufe 2~~ →
   **9b-AG NEU (Auftrag David 7.6.2026): Komplett-Überarbeitung der
   AG-Maske** auf Basis der Original-Suite HRegA/Notariate ZH
   (`~/Desktop/Legal Calc Knowledge/Gründung AG`; Dossier
   `bibliothek/recherche/ag-gruendung-amtliche-vorlagen.md`, Deltas
   D1–D24). Etappenplan: **FAHRPLAN-AG-GRUENDUNG.md** (Repo-Root) —
   0 Korrektheits-Abgleich (Singular-Urkunde! Protokoll-Formalia,
   Wahlannahme RS) · 1 Statuten kurz/lang · 2 qualifizierte Gründung
   (Sacheinlagevertrag + Gründungsbericht druckfertig) · 3 Fremdwährung/
   Agio/Liberierung je Gründer · 4 Urkunden-Optionen + Lex-Koller +
   Nachtrag · 5 Info-Schicht; danach GmbH-Spiegelung. 4 Zuschnitt-Fragen
   an David im Fahrplan. Weiter offen: UR/AI/BL-Notariats-Links
   verifizieren · Notariats-Listen-PDFs datiert → Verfallsregister.
9c. ~~Kapitalerhöhung AG/GmbH~~ → **GEBAUT** (7.6.2026 nachts, Anweisung
   David «mit research und allem»): Dossier
   `recherche/kapitalerhoehung-wortlaute.md` (OR 650–653v/781 verbatim;
   ZH/SG-Mustersuiten 16 Dok.; 651/652 III/652a/653h aufgehoben;
   Negativbefund: kein amtl. KE-Anmeldeformular) · EINE Maske
   `/vorlagen/kapitalerhoehung` mit Rechtsform-Schalter
   (`lib/vorlagen/kapitalerhoehung.ts`): GV-/GsV-Beschluss +
   VR-/GF-Feststellungen/Statutenänderung als ENTWURF (650 II/652g II,
   §8), Zeichnungsscheine je Person (777a-II-Hinweis nur für
   Neu-Gesellschafter, 781 III; Befristungs-Klausel als Usanz
   offengelegt), Kapitalerhöhungsbericht, HR-Anmeldung mit
   46/74-II-Beilagen · 6-Monats-Verfalls-Gates · Katalog 34→35 ·
   Bug-Check §9: 2 Agents (4'608 Kombinationen / Wortlaut-Abgleich),
   0 HOCH; eingearbeitet: M-Befunde (Einzel-Zeichnungs-Ganzzahl-Gate,
   ZH/SG-Quellen-Präzisierung, 805-Abs.-3-Anker, Konventionalstrafen-
   Kategorie, 777a-Header-Kopplung); 985 Tests grün. OFFEN (Stufe 2):
   qualifizierte Erhöhung (Sach/Verrechnung/652d) · Bezugsrechts-Entzug ·
   Kapitalband/bedingtes Kapital (653t/653b-Kataloge liegen verbatim) ·
   Kapitalherabsetzung (SHAB-Gläubigerruf) als eigenes Vorhaben.
9d. **ULTRA-REVIEW kompletter Code → ALLE 16 Befunde gefixt** (`4b8e0e5`,
   Auftrag David 7.6.2026 morgens; Cloud-Ultra scheiterte am Session-cwd):
   lokaler Multi-Agent-Workflow — 12 Finder (jur.+tech. Linsen über alle
   Subsysteme) + 3 Skeptiker je Befund, 63 Agents; 17 Roh → 16 bestätigt,
   1 adversarial verworfen. 2 HOCH: LinkTeilen verlor den URL-Hash
   (Tab-/Rechtsweg-Weiche) · engine.ts nummerierte bei wiederholeUeber
   nur das erste Element (Rechtsbegehren!). 4 MITTEL: Direktklage →
   74 II lit. b BGG streitwertUNabhängig · Nutzer-Unterstriche wurden in
   PDF/DOCX zur Unterschriftslinie (schemaStriche-Lizenz, §5) ·
   GmbH-Vorsitz-Beilage trotz 71 II HRegV · Katalogsuche blind für
   ue/ae/oe. 4 NIEDRIG: BGer-10-T.-Frist SchKG-Aufsicht (100 II lit. a) ·
   istISO-Kalenderprüfung · SchKG-Regime-Anzeige=Engine-Input ·
   Erbteilungs-CHF in die Engine (§3). 6 Testlücken geschlossen (11 neue
   gesetzeshergeleitete Tests; Golden 65→79). Schlussstand 1005 Tests ·
   Golden byte-gleich · Lint/Build sauber. (Separater /code-review der
   Parallel-Session: `7a72e91` #1–#8 — kein Überschnitt.)

9e. **/simplify-Runde + ALLE Folge-Befunde gefixt** (`d2da341` + `0e0e86c`,
   Auftrag David 7.6.2026 mittags): 4 Cleanup-Agents (Reuse/Simplification/
   Efficiency/Altitude) über den Review-Diff → 5 Fixes (Striche-Lizenz als
   EIN Engine-Boolean statt 3 ODER-Kopien + mutable PDF-Closure ·
   ganzePositive() in der zahl-Familie · Vorsitz-Entbehrlichkeit als
   Beleg-Attribut an der SSoT statt id-Sonderliste · Katalogsuche
   Ein-Regex-Faltung + WeakMap-Cache + Sort ohne Doppel-Rang ·
   SchKG-aktiverOverride). Danach «fixe alle Befunde»: istGueltigesISO →
   datumsUtils (Bonus: 4. nur-Format-Kopie in FristenspiegelForm) ·
   notariate.urlBelegt (≠ §7-verified) · keVerfallDatum() berechnet
   («spätestens am …» in Urkunde + UI, 77 I Ziff. 3) · AG-Stück-Gates inkl.
   per-Gründer · Label-Spread · nummeriereUeberschriftenAlsArtikel in der
   Engine · geteilter Mappen-Rahmen Dokumentmappe.tsx (§10-Rahmen für die
   3 Mappen-UIs).

9f. **Bibliothek: Audit + Nützlichkeit + MINDESTSTANDARDS** (`99325d9`,
   `837121b`, `379e8e7`, Auftrag David 7.6.2026): Audit (5 INDEX-Lücken,
   6 nie registrierte Verfalls-Kandidaten, veraltete Zählungen, 1 überholter
   Plan-Dateiname) → behoben; NEU: bibliothek/muster/ (51 amtliche Vorlagen
   verbatim + MANIFEST mit URLs/Ständen — vorher nur flüchtig in /tmp) ·
   register/engine-map.md (Modul → Dossiers → Status) ·
   **bibliothek/STANDARDS.md S1–S10** + scripts/bibliothek-check.sh
   (Exit 1, Teil §9-Bug-Check; Erstlauf fand 14 Verstösse → alle behoben,
   darunter: StGB + GebV SchKG waren NIE gepinnt → fedlex-cache.sh-Pins
   ergänzt [GebV SchKG: Filestore-Datei ohne -N-Suffix, Skript-Modus n=0],
   Quellen-Register um HRegV/GebV-HReg/StG/GebV-SchKG/StGB nachgeführt,
   S8-Korrektur «nur signiert»-Irrtum). Verknüpfungs-Check beidseitig:
   Code↔Bibliothek 34+70 Pfade, 0 kaputt.

18. **Roadmap-Triage nach §0-Mehrwert-Test** (NEU, Daueranweisung David
   7.6.2026): alle ~80 geplanten Karten dreiteilen — (a) KEIN eigenes
   Regime → streichen/falten (Erstkandidaten zu verifizieren: Straf-
   Fristen [Art. 89 II StPO: keine Gerichtsferien — was bleibt, sind
   Strafantrag 31 StGB + Verjährung als EIGENE Regime], Verwaltungs-/
   Steuer-Fristen je nach VwVG-Stillstand Art. 22a, Datenschutz-/
   Ausländerrecht-Fristen, Marken-Widerspruch) · (b) echter Mehrwert →
   bleibt · (c) unklar → Regime-Recherche vor Bau. Ergebnis in
   KATALOG-ROADMAP.md mit Begründung je Streichung.

## C · Pflege & Termine (Verfallsregister: `bibliothek/register/parameter-verfall.md`)

10. **30.6.2026** — SG-GKV-Divergenz prüfen (Erinnerung existiert bereits).
11. **Anfang Sept. 2026** — Referenzzins (quartalsweise).
12. **1.11.2026** — BE-Formularpflicht (dynamisch).
13. **Vor Mietvertrags-Abnahme** — VMWG-Art.-19a-Diskrepanz am Original klären.
13a. **Vor SchKG-Abnahme** — GebV-SchKG-Revision AS 2025 630 (in Kraft
    1.1.2026, nur signiertes PDF verfügbar) gegen die verdrahtete Staffel
    Stand 1.1.2022 prüfen (Befund Bug-Check 6.6.2026; Vorbehalt steht im
    Code-Kommentar und als UI-Hinweis).
14. **Feiertage:** je Kanton gegen geltendes kantonales Recht, bevor ein
    Fristen-Eintrag auf «geprüft» geht (BJ-Liste = Stand 2011; Matrix-Dossier
    ist die Arbeitsgrundlage).

## D · Klein-Backlog (NIEDRIG, gelegentlich)

15. Review-Befund N-1: Direktklage-Eingabe (Art. 8 ZPO) unter CHF 100'000
    plausibilisieren (Hinweis statt stiller Akzeptanz).
15a. Logik-Check 6.6. spätabends: leerer Ergebnis-Schritt im Wizard ohne
    Hinweis (Streitwert nachträglich geleert) · klage-vereinfacht-Verweis
    ist BS-betitelt unabhängig vom Kanton (vorbestehend) ·
    ~~Fraunces-Dependency~~ (entfernt 7.6.).
15b. Bug-Check 7.6. abends, begründet zurückgestellt: ZIP-Loop ohne
    per-Dokument-Guard (abschrift latent) · engine.ts nummeriert VOR
    Strich-Erkennung (kein Schema betroffen, latent) · FINMA-Begriffsliste
    UI→Engine-Schicht (wird mit GmbH-G5 erledigt) · 4× MONATE-Array →
    eine lib-Konstante · tote SEKTIONEN-Exports/onOeffnen-Prop ·
    ISO-Handrollen in 2 Monitoring-Skripten. Für Abnahme notiert:
    SG-Notariatstarif sagt «volle» weitere 100k, Code zählt ceil.
16. Stabile Keys in 7 Listen-Editoren (Voll-Audit 5.6.) · Datepicker-
    Pfeiltasten (A11y) · Markenschriften in Vorlagen-PDFs ·
    Detailseiten-Titel an Katalog-Titel angleichen.
16a. /code-review 7.6.2026, zurückgestellte Cleanup-Findings: restliche
    Norm-Chip-Kopien auf den geteilten NormLink konsolidieren
    (ErgebnisAnzeige.NormChip, RechnerKopf-Inline — Fristenspiegel ist
    umgestellt) · CHF-Formatter parametrisieren (chf(n, dezimalen) als
    SSoT; streitwert.ts/gebvKosten.ts/vorlagen-datum.ts — NUR mit
    Golden-Protokoll, Engine-Textausgaben!) · Gründungs-Seiten-Rahmen
    (GmbH/AG) teilen, sobald der Dokumentmappen-Ausbau stabil ist.
17. Phase 4 Experten-Gating (Header-Button als Andockpunkt) — hängt an A.2.
