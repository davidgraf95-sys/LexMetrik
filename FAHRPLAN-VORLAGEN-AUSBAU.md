# FAHRPLAN VORLAGEN-AUSBAU — Verträge-Rahmen, P1-Vorlagen, Rechner-Erweiterungen

**Quelle:** Wettbewerbsanalyse 12.6.2026
(`bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md`,
Auftrag David `PROMPT-wettbewerbsanalyse.md`). **Stand: HANDLUNGSPLAN
ERSTELLT, NICHT begonnen** — jede Phase ist ein eigener, an Claude Code
übergebbarer Schritt; Davids P1-Abnahme der Analyse steht aus.

**Leitplanken (jede Phase):** Normentreue §7 (alle [VF]-Anker empirisch am
Fedlex-Cache, Unsicheres als `// VERIFY:`) · Determinismus §2 (kein LLM) ·
eine Engine pro Rechtsgebiet §4 (KEINE Fusion verschiedener Vertragstypen
in ein Schema; Varianten nur innerhalb desselben Typs) · SSoT §5 (Katalog
nur `startseiteConfig.ts`, Inhalt nur `src/lib/vorlagen/<schema>.ts`,
`ausgabeArt` NUR im Schema) · neue Einträge starten `geplant`, gebaut =
`entwurf`, NIE `geprüft` ohne Davids Abnahme · Form-Gate je Vorlage über
`ausgabeArt` (`fertig`/`abschrift`/`entwurf`) · Design R1–R12 bzw.
Wizard-Muster, neue Strings Halbgeviert/U+2019.

**Proof-Workflow vor JEDEM Commit (volle Ausgabe bei Rot):** `npx tsc -b` ·
`npm test` · `npm run golden:vergleich` · `npm run lint` · `npm run check`
(Routine grün: `npm run gate`). Golden-Erweiterungen (`npm run golden`) nur
mit Begründung im selben Commit. **Kein `git push`, kein Deploy ohne Davids
ausdrückliches frisches Ja (§9).**

**Reihenfolge-Begründung:** V1 zuerst (der Rubrik-Rahmen ist Voraussetzung,
damit neue Vorlagen sofort auffindbar einsortieren — Empfehlung des
Auftrags); dann V2 (kleinste P1-Vorlagen = schnelle Praxis-Treffer, testen
den BO-Baustein-Rahmen), dann V3 (Vertrags-Grundtypen, brauchen V1-Rubriken
4/7), dann V4 (Detailgrad-Schalter braucht gebaute Verträge als Pilot),
V5/V6 danach (Form-Weiche bzw. grosser Einzelposten), V7 unabhängig
(Rechner-Erweiterungen, jederzeit einschiebbar). Abhängigkeiten: V3→V1,
V4→V3 (Pilot Arbeitsvertrag geht schon nach V1), V5/V6→V1; V0 ist
Pflichtteil JEDER bauenden Phase.

---

## V0 (Pflicht-Vorschritt jeder Phase) — Normrecherche

Je Vorlage/Erweiterung VOR der Implementierung: Formvorschrift + zwingende
Schranken am Fedlex-Cache verbatim verifizieren (`scripts/fedlex-cache.sh`,
`check:caches` vor `check:zitate`); Ergebnis als §11-Dossier-Ergänzung in
`bibliothek/` (bestehendes Wettbewerbs-Dossier um Verifikations-Vermerke
[VF]→[V Datum] nachführen oder eigenes Bau-Dossier je Typ). Offene Anker
aus der Analyse u. a.: Art. 141 OR rev. (Verzichtsdauer) · Art. 165 I OR ·
Art. 493 OR (Weiche-Details) · Art. 634 II ZGB (Erbteilungs-Schriftform,
Quelle widersprach) · Art. 8a III lit. d SchKG · Art. 243 I OR ·
Art. 184 ZGB · Art. 530 ff. OR · Art. 9 DSG.

## V1 — Verträge-Rubriken + Form-Gate-Anzeige (Rahmen, Ziel C)

**Ziel:** Sektion II skaliert: 7 Rubriken, Form-Gate auf der Karte sichtbar.
**Dateien:** `src/lib/vorlagenKategorie.ts` (VERTRAG_RUBRIKEN analog
EINGABE_RUBRIKEN) · `src/lib/startseiteConfig.ts` (`vertragRubrik`-Feld auf
allen `art:'vertrag'`-Karten) · `src/components/Katalog.tsx`
(VorlagenRegister: Rubrik-Block für Verträge, `<details>`-Mechanik ab >6
verfügbaren) · WerkzeugZeile-Vorlagenzweig: ausgabeArt-Mikrozeile (Quelle:
Schema-Lookup, kein neues Katalogfeld) · `src/tests/vorlagenKategorie.test.ts`
(Vollständigkeit: jeder vertrag-Eintrag hat Rubrik).
**Akzeptanz:** Golden byte-gleich (reine Darstellungs-Schicht §3/§6) · alle
bestehenden Verträge-Karten einer Rubrik zugeordnet · Vorlagen-Karten zeigen
druckfertig/Abschrift/Entwurf-Zeile (SSR-sicher: EIN Template-Literal) ·
e2e-Sichtprüfung Playwright · Test bricht bei Rubrik-loser Vertrags-Karte.
**Commit:** `feat(katalog): Verträge-Sektion in 7 Rubriken + ausgabeArt-Zeile auf Vorlagen-Karten (FAHRPLAN-VORLAGEN-AUSBAU V1)`

## V2 — Kleine P1-Erklärungen & Eingaben (4 Stück)

**Ziel:** Verjährungsverzicht · Forderungsabtretung · Fristerstreckungs-
gesuch · Löschungsgesuch Betreibungsregister — je EIN Schema, Status
`entwurf`.
**Dateien:** je `src/lib/vorlagen/<typ>.ts` (Schema, `ausgabeArt:'fertig'`,
`// Dossier:`-Kopf) · `startseiteConfig.ts` (4 Karten: 2× erklaerung, 2×
eingabe mit Rubrik gesuch_sonstige) · Wizard-Seiten nach bestehendem Muster
(`formatvorlagen.ts`/`vorlagen/engine.ts` unverändert) · ThemenEinstieg-
Verdrahtung: Verjährungsverzicht ↔ `verjaehrung`, Fristerstreckung ↔
`zpo-fristen` (Permalink-Spec zentral in `rechnerPermalinks.ts`),
Löschungsgesuch ↔ SchKG-Vorlagen-Sprung · Golden-Fälle je Vorlage +
norm-zitate-Prüfer + Konventionen-Test.
**Akzeptanz:** V0-Verifikate dokumentiert · `npm run gate` grün · Golden
NUR um neue Fälle erweitert (deklariert) · Zähler/Inventur-Test stimmig ·
Round-Trip der neuen Permalinks getestet.
**Commits (je Vorlage einer):** z. B. `feat(vorlagen): Verjährungsverzichtserklärung (Art. 141 OR verifiziert) — P1 Wettbewerbsanalyse (V2)`

## V3 — Vertrags-Grundtypen (Auftrag · Werkvertrag · NDA · Konkubinat)

**Ziel:** die vier P1-Verträge als Baustein-Wizards; Rubriken 4/7 werden
sichtbar.
**Dateien:** je `src/lib/vorlagen/<typ>.ts` + Karte (`art:'vertrag'`,
`vertragRubrik` 4/6/7) + Wizard; Werkvertrag: EckdatenKachel-Verweis auf
`gewaehrleistung` (R10) · Hydration-Guards für Wizard-Arrays (Pflicht).
**Akzeptanz:** wie V2; zusätzlich: KEINE geteilte Rechtsregel zwischen den
vier Schemas (§4 — gemeinsam nur engine/format-Infrastruktur).
**Commits:** je Typ einer, deutsch, mit Norm-Verweis.

## V4 — Detaillierungsgrad-Schalter (Pilot)

**Ziel:** «einfach ↔ ausführlich» als Wizard-Kopf-Schalter; Pilot
Arbeitsvertrag + Mietvertrag.
**Dateien:** `src/lib/vorlagen/arbeitsvertrag.ts`/`mietvertrag*.ts`
(ausführlich-Bausteine als zusätzliche `includeIf`; bestehende Bausteine
UNVERÄNDERT) · Wizard-Kopf-Komponente (geteilt, §10) · Golden: je Stufe
ein Fall — Basis-Stufe MUSS byte-gleich zum heutigen Output sein (Beweis,
dass der Schalter additiv ist).
**Akzeptanz:** Golden Basis byte-gleich · neue ausführlich-Fälle deklariert
· kein Katalog-Eintrag dazugekommen.
**Commit:** `feat(vorlagen): Detailgrad einfach/ausführlich für Arbeits- und Mietvertrag — additive includeIf-Bausteine, Basis golden-bewiesen (V4)`

## V5 — Form-Weichen-Vorlagen (P2-Start: Bürgschaft, Ehevertrag)

**Ziel:** ausgabeArt dynamisch aus Eingaben: Bürgschaft (Betrag/Personentyp
→ fertig↔entwurf, Art. 493 OR) · Ehevertrag (4 Güterstands-Varianten,
immer `entwurf`).
**Voraussetzung:** Engine-Unterstützung für eingabeabhängige ausgabeArt
prüfen — falls `engine.ts` sie nicht kennt, ZUERST verhaltensneutraler
Rahmen-Schritt (§10, golden-gegated), dann die Vorlagen.
**Akzeptanz:** Weiche empirisch je Pfad getestet (Golden-Fall pro Zweig);
§8: Entwurf-Zweig mit Wasserzeichen + Beurkundungs-Hinweis.
**Commit:** `feat(vorlagen): Bürgschaft mit Art.-493-Form-Weiche (ausgabeArt aus Eingaben) + Ehevertrag-Entwürfe (V5)`

## V6 — Aktionärbindungsvertrag (grosser Einzelposten, Sektion IV)

**Ziel:** ABV-Wizard mit Modulen Vorkauf/Stimmbindung/Mitverkauf/
Konkurrenzverbot; Karte `art:'gesellschaft'`.
**Akzeptanz:** wie V3; Verweis-Brücken zu ag-gruendung/Statuten-Mappe.
**Commit:** `feat(vorlagen): Aktionärbindungsvertrag — Baustein-Wizard Gesellschaftsrecht (V6)`

## V7 — Rechner-Erweiterungen (unabhängig einschiebbar)

**Ziel:** (a) Mittlerer-Verfall-Option im `verzugszins` · (b) Ferienlohn-
Funktion in den künftigen Ferien-Rechner (NUR falls David die ROADMAP-
Ferien-Karte freigibt) · (c) Nettorendite-Modul in `mietzinsanpassung`
(NUR mit deren Bau, ROADMAP Lücken-Rang 6).
**Dateien:** (a) `src/lib/verzugszins.ts` + Form (additiv; bestehende
Zweige golden-bewiesen unverändert).
**Akzeptanz:** Handrechnungs-Empirie je neuer Funktion; Golden additiv.
**Commit (a):** `feat(verzugszins): Option mittlerer Verfall — Praxis-Vereinfachung, exakte Methode unverändert (V7a)`

---

## Davids Entscheide vor Start (Entscheidvorlage)

1. P1-Listen (Dossier Abschn. 5) abnehmen/kürzen — insbesondere Reihenfolge
   V2 vor V3.
2. Teil-D-Neuzugänge: Bussenkatalog-Rechner · Baumabstand kantonal ·
   Liquidations-Mappe AG/GmbH (P2) — je rein/Hinweis/raus.
3. Ziel-C-Konzept (Dossier Abschn. 6): Rubriken-Schnitt, ausgabeArt-Zeile,
   Detailgrad-Pilot — Abnahme als Design-Entscheid (analog RECHNER-EINHEIT).
4. Arbeitszeugnis endgültig ✗ (Quellbefund stützt den Teil-D-Vorschlag).
