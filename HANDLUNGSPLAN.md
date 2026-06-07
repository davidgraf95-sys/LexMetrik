# Handlungsplan (Stand 6.6.2026 spätabends — 2. Fassung, auf Auftrag David)

Priorisiertes weiteres Vorgehen nach der Abend-Session (Art.-63-Fixes ·
Feiertage-Doppelcheck · Katalog-Split · Rechtsmittel-Fahrplan · Bibliothek
komplett · Gesamt-Check durch 2 unabhängige Review-Agents bestanden).
Gepflegt wird dieser Plan NUR hier; erledigte Punkte durchstreichen oder
löschen, Stand in STRUKTUR.md spiegeln.

## A · Entscheide, die nur David treffen kann (blockieren anderes)

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
   **Offen daraus (nicht beauftragt):** M-7 Permalink plausibilisiert
   Sub-Felder nicht gegen Streitsache (latent, Input-Gates fangen es heute) ·
   M-8 PDF/Aktenzeichen/Teilen fehlen im Rechtsmittel-/SchKG-/Straf-Zweig ·
   NIEDRIG-Befunde (Art.-40-Zitatschärfe Straf, Erbschaft+Pfand-Text,
   Widerspruch-Fahrplantext grundstueck, toter Engine-Aufruf
   StrafZustaendigkeitTeil, rmFamilienSummarsache ohne Streitsachen-Check) ·
   Testlücken: rueckforderung/feststellung (SchKG) ohne Akzeptanztest,
   Straf-Kaskade wohnsitz/auslieferung/Default ungetestet.
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
6. **Untermietvertrag** — Spezifikation `recherche/untermietvertrag.md`
   (baufertig; Weiche in mietvertrag.ts existiert schon).
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
    ist BS-betitelt unabhängig vom Kanton (vorbestehend) · ungenutzte
    @fontsource/fraunces-Dependency entfernen.
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
