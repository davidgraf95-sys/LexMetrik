# FAHRPLAN VORLAGEN-AUSBAU — Verträge-Rahmen, P1-Vorlagen, Rechner-Erweiterungen

**Quelle:** Wettbewerbsanalyse 12.6.2026
(`bibliothek/recherche/wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md`,
Auftrag David `PROMPT-wettbewerbsanalyse.md`). **Stand: IN ARBEIT**
(Abarbeitungs-Stand am Dokumentende) — jede Phase ist ein eigener, an
Claude Code übergebbarer Schritt. Davids P1-Abnahme der Analyse ist am
12.6.2026 erfolgt (`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`).

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

## Aufträge David 12.6.2026 (im Chat, nach Plan-Erstellung — eingeschoben)

1. **GO erteilt** («weitermachen», dann «einfach weiterarbeiten bis du
   unbedingt meinen Input brauchst») — V1 ff. laufen; Push/Deploy bleibt
   gesperrt bis frisches Ja.
2. **Blanko-Download-Grundsatz (Daueranweisung):** JEDE Vorlage ist auch
   direkt herunterladbar, ohne etwas auszufüllen; wo Informationen fehlen,
   erscheint ein leeres Feld (Blanko-Striche). → eigener Rahmen-Schritt
   **V2b** vor den Musterklagen-Masken (§10); neue Vorlagen ab sofort
   blanko-fähig bauen (oderBlank-Konvention in der Zusammenstellung).
3. **Musterklagen-Rubrik + Masken (neue Phase V8):** weitere Rubrik mit
   Musterklagen analog `~/Desktop/LexMetrik Knowledge/Musterklagen
   Vertrags- und Haftplfichtrecht` und `…/Musterklagen im Familienrecht`,
   dann die entsprechenden Masken bauen. NUR Struktur aus den Quellen
   übernehmen (Urheberrechts-Lektion der Familienrecht-Bauspez.);
   Familienrecht-Bauspez. liegt: `bibliothek/recherche/familienrecht-
   klagen-vorlagen.md`. IA-Anker: Behördeneingaben-Rubrik
   `klage_besonders` (nach klageGebiet gruppiert) bzw. neue Rubrik gemäss
   Quellen-Zuschnitt.

## Abarbeitungs-Stand 12.6.2026 (Session «Wettbewerbsanalyse + Musterklagen», David abwesend)

ERLEDIGT + committet: **V1** (Verträge-Rubriken + formGate-Zeile, 8a78ee2) ·
**V2.1** Verjährungsverzicht (0b21767) · **V2b** Blanko-Download-Rahmen alle
Einzel-Wizards (270007c; Mappen offen) · **Musterklagen M1**: Scheidungsklage
unbegründet Art. 290 ZPO (b3ba2dc; Karte klage_besonders/Familienrecht).
WEITER ERLEDIGT (Fortsetzung): **Bd.-I-Struktur-Dossier** §§ 1–25 in
bibliothek/recherche/musterklagen-vertrag-haftpflicht-bd1.md (bdebf6d;
4 Struktur-Agents, NUR Struktur) · **Gemeinsames Scheidungsbegehren**
Art. 285/286 ZPO (00f7931) · **Eheschutzgesuch** Art. 175 ff. ZGB +
10 GEPLANT-Karten der Musterklagen-Rubrik (7175a01). Familienrecht-Masken
3/3 der ersten Welle gebaut (Scheidungsklage · Begehren · Eheschutz).
NÄCHSTE SCHRITTE (V8-Fortsetzung): Masken für die geplanten Karten nach
Davids Priorisierung — Kandidaten-Reihenfolge nach Dossier-Praxiswert:
Bauhandwerkerpfandrecht-Gesuch (4-Monats-Gate!) → Arbeit-Kündigungsklage
(Synergie 336b-Engine) → Werkmängel → VVG → Honorar → 158-ZPO →
Konkurrenzverbot → Personenschaden → Abänderung/Konkubinat. Dazu V2-Rest
(NDA, Zession, Fristerstreckung, 8a-SchKG-Löschung), V3–V7.
Push/Deploy weiter gesperrt (Davids frisches Ja).

## Abarbeitungs-Stand 13.6.2026 (Session «Pauschal-Abnahme + V2-Rest»)

P1-Priorisierung durch David ABGENOMMEN 12.6.2026 («alles abgenommen»,
`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`). **V2 KOMPLETT
(4/4):** Verjährungsverzicht (0b21767) · **Abtretungserklärung/Zession**
Art. 164/165/167/170 OR (5d4ccf8) · **Fristerstreckungsgesuch** Art.
143/144/148 ZPO mit Frist-Art-Weiche + Vor-Fristablauf-Gates (fd10ff1) ·
**Nichtbekanntgabe Betreibung** Art. 8a III lit. d SchKG, Fassung
1.1.2026 (AS 2025 522) am Cache verifiziert, 3-Monats-Schwelle
deterministisch (3d1fc99). NDA gehört zu V3 (Vertrags-Grundtyp).
OFFENE FOLGEPOSTEN aus V2: (a) Ergebnis-Prefill-Brücke zpo-fristen →
Fristerstreckung (laufende Frist reist mit, G3); (b) VorlagenSprung im
SchKG-Zuständigkeits-Rechner bräuchte ein neues Anliegen «Löschung/
Nichtbekanntgabe» (Engine-Änderung, Entscheid David). NÄCHSTE PHASEN:
V3 (Auftrag · Werkvertrag · NDA · Konkubinat) → V4 ff.; parallel V8 nach
Priorisierung. Push/Deploy weiter gesperrt (Davids frisches Ja).

## Abarbeitungs-Stand 13.6.2026 (Session «V3 + Verwaltungs-/BGG-Stillstand»)

**V3 KOMPLETT (4/4 Grundtypen, je eigener Commit, Gate je GRÜN):**
**Auftrag** `41dccc3` (Art. 394 ff. OR; Module Beratung/Treuhand/Inkasso;
Auflösungsrecht Art. 404 offengelegt) · **Werkvertrag** `704aa85`
(Art. 363 ff. OR; Weiche beweglich/unbeweglich → Rügefrist 60 T zwingend
Art. 367 Abs. 1bis + Verjährung 2/5 J Art. 371; Brücke Gewährleistungs-
Rechner; Rücktritt Art. 377) · **NDA** `5aa4b62` (Innominat Art. 19 OR;
einseitig/gegenseitig + Konventionalstrafe Art. 160/161/163, Herabsetzung
163 III offengelegt) · **Konkubinat** `d081391` (Art. 19 OR / 646/650/651
ZGB / 530/548/549 OR; Module Wohnen/Kosten/Inventar/einfache Gesellschaft/
Auflösung; kein gesetzliches Konkubinatsrecht + Kindesbelange nach Gesetz
offengelegt). Alle V0-Anker am Cache verifiziert, check:zitate 0 Befunde.
Endstand: 47 gebaut/43 sichtbar, Golden 159, Routen 49.

**EINGESCHOBEN (Auftrag David im Chat):** Verwaltungs-Stillstand
(Art. 22a VwVG) + BGG-Stillstand (Art. 46 BGG) im einfachen Fristenrechner
— neue Engine `lib/bggVwvgFristen.ts`, Dossier `bibliothek/recherche/
stillstand-vwvg-bgg.md`. Gilt NUR für nach Tagen bestimmte Fristen;
Abs.-2-Ausnahmen je Regime; periodengleich zur ZPO (golden-bewiesen).

NÄCHSTE PHASEN: V4 (Detailgrad-Schalter, Pilot Arbeits-/Mietvertrag) ·
V5 (Form-Weichen Bürgschaft/Ehevertrag) · V6 (ABV) · V7 (Rechner-
Erweiterungen) · V8 (Musterklagen-Masken). Fachliche Abnahmen der
V3-Vorlagen + Stillstand-Wortlaut offen. Push/Deploy gesperrt (frisches Ja).

## Davids Entscheide vor Start (Entscheidvorlage)

1. ~~P1-Listen (Dossier Abschn. 5) abnehmen/kürzen — insbesondere Reihenfolge
   V2 vor V3.~~ ERLEDIGT: P1 abgenommen 12.6.2026 (Pauschal-Abnahme).
2. Teil-D-Neuzugänge: Bussenkatalog-Rechner · Baumabstand kantonal ·
   Liquidations-Mappe AG/GmbH (P2) — je rein/Hinweis/raus.
3. Ziel-C-Konzept (Dossier Abschn. 6): Rubriken-Schnitt, ausgabeArt-Zeile,
   Detailgrad-Pilot — Abnahme als Design-Entscheid (analog RECHNER-EINHEIT).
4. Arbeitszeugnis endgültig ✗ (Quellbefund stützt den Teil-D-Vorschlag).
