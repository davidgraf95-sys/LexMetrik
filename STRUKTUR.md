# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/HANDLUNGSPLAN,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP, ABNAHME-AG-BAUSTEINE) und die
laufenden Fahrpläne (GRUNDLAGEN, AG-/GMBH-GRUENDUNG, BGER-RECHTSWEG,
VORLAGEN-AUSBAU, VERTRAGS-VARIANTEN, FUNDAMENT-UMBAU). Abgeschlossene
Fahrpläne (DESIGN, RECHNER-DESIGN, VEREINHEITLICHUNG, TOKEN-DISZIPLIN — ins
Archiv 13.6.2026) und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026):** Dieses Dokument
wird in jeder Session und jedem Subagenten gelesen — Karten abgeschlossener
Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU nach
`archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt
der Verweis-Abschnitt. Offene Abnahmen sind davon unberührt (Spiegel:
`HANDLUNGSPLAN.md`).

## Session 14.6.2026 — Ausbau-Direktive + Ultra-Fahrplan PRODUKTAUSBAU & BURGGRABEN

**Neue aktive Direktive David (14.6.2026):** Bis zu den ersten Kanzleigesprächen
(Monate weg) ist das Ziel maximaler Produktausbau zu einem *imposanten Produkt
mit Burggraben* — Maßstäbe Praxistauglichkeit · Skalierbarkeit · fachliche Tiefe.
**Abnahme-Welle/Validierung bewusst zurückgestellt** (nicht mehr proaktiv
treiben). Verankert: `STRATEGIE-PLATTFORM.md` (Kopf-Block) + Memory
`lexmetrik-ausbau-direktive`.

**Neuer Fahrplan `FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN.md`** (Ultra-Workflow, 16
Agenten: 5 Bestandsleser → 4 Säulen-Designs inkl. 3-Wege-Panel für die
Fall-Kontext-Säule → 3 adversariale Kritiker [Solo-Machbarkeit · CLAUDE.md-Treue
§1–§6 · Moat/Imposanz] → Synthese). Kern: **P0** Schema-Registry + Drift-Guards
(Bau-Hygiene, §6-verhaltensneutral) · **P1 Hauptmoat** Prozesskostenrechner
26/26 (deterministische Tarif-Staffeln statt Prosa; Verfallsregister VOR
30.6.2026 wegen SG GKV-Ablauf) · **P2** schlankes Fall-Kontext-Rückgrat
(URL-Transport, kein Cockpit) · **P3** fachliche Spitze (Zustellfiktion +
kant. Gerichtsferien + Feiertags-Verifikation) · **P4** opportunistisch.

**Umsetzung begonnen (14.6.2026): P0/C1 GEBAUT (ungepusht).**
`src/lib/vorlagen/registry.ts` = SSOT über die Menge aller 28 gebauten Vorlagen
(25 Einzel-Schemas + 3 Dokumentmappen AG/GmbH/KE); referenziert die echten
Modul-Exporte (Schema-Objekt, `zusammenstellen`/Mappe-Builder, `DEFAULTS`,
optionale Gate-Prüfung), deklariert nichts neu (§5/§1). Drift-Guard
`src/tests/vorlagenRegistry.test.ts`: Bijektion Registry↔Katalog-`schemaId`,
`schema.id === schemaId`, Karte+Route je schemaId, Identitäts-Guard gegen die
`kv`-Namenskollision (klageVereinfacht vs. kuendigungAllgemein). §6: Gate voll
grün, golden byte-gleich (verhaltensneutral; Registry wird von Golden/Engines
nicht importiert). Test-/Skript-Modul (nicht aus UI importieren — Bundle).
C1b (golden-outputs aus Registry) bewusst zurückgestellt (niedriger Wert,
hohe Byte-Fragilität) · C4 offen.

**P1 Hauptmoat begonnen — B-P0a GEBAUT (ungepusht):** `src/lib/tarif/staffel.ts`
= fachneutrales, deterministisches Tarif-Staffel-Primitiv (§2/§4 Infrastruktur,
kein Recht). Diskriminierte Regel-Union `fix · sockel_prozent · promille ·
staffel_inklusiv · staffel_exklusiv · rahmen · formel_extern`; Bandgrenzen
explizit typisiert (inklusiv/exklusiv, §1); `rahmen`/`formel_extern` tragen
KEINEN Betrag (Ergebnis-Union zwingt ehrlichen Rahmen, §2/§8). Test
`tarifStaffel.test.ts` (11) inkl. **Charakterisierung gegen die gebvKosten-
Pfändungsstaffel** (Art. 20 GebV SchKG) → spätere byte-gleiche Ablösung möglich.
Gate voll grün. OFFEN P1: B-P0b Verfallsregister+CI (VOR 30.6.2026, SG GKV) ·
B-P1 Gerichtskosten-Datenschicht je Kanton (§7-Recherche, Pilot ZH zuerst) ·
B-P2 sichtbarer Prozesskostenrechner. Push/Deploy nur auf frisches Ja.

## Session 13.6.2026 (Abend) — FUNDAMENT-UMBAU Phasen 0/1a/4 + Bug-Check (Auftrag David «mache fertig … nochmals bug check»)

**Architektur-Umbau nach `FAHRPLAN-FUNDAMENT-UMBAU.md` (abgenommen), je Gate
voll grün, golden/prerender byte-bewiesen, ungepusht (6 Commits `223fcae`..
`fc5ec96`):**
(1) **Phase 0 — Doku-Hygiene/Tooling (`4bcb5b7`):** sieben 11.6.-Session-Karten
byte-genau rotiert (STRUKTUR 803→619 Z.); DESIGN/RECHNER-DESIGN/
VEREINHEITLICHUNG/TOKEN-DISZIPLIN ins `archiv/` (alle 0 offene Etappen);
`requirements.txt` für den einzigen Python-Lauf. GRUNDLAGEN (8 offene Posten,
Nordstern) + AG-/GMBH-GRUENDUNG + BGER-RECHTSWEG bewusst im Root.
(2) **Phase 1a — Routen-SSOT (`f33ec88`/`11155bb`, Thema B):** neues
`src/routesManifest.ts` (44 Karten-Routen, Pfad→Lazy), App.tsx rendert
`ROUTEN_MANIFEST.map` (−89 Z.), `seo.ts katalogRouten()` als Single Source,
Gating-Test `routenManifest.test.ts` (Manifest === Katalog beide Richtungen).
§5-Verstoß (doppelte Pfad-Existenz App.tsx↔Katalog) geheilt. Beweis: build →
49 Routen, sitemap byte-gleich (Hash `67e8bed3`), Code-Splitting unverändert.
(3) **Phase 4 — §7-Abnahme-Dossiers (`ddac5dd`, Thema C):** generischer
`scripts/abnahmeDossier.ts`; AG-Dossier byte-identisch; additive
`GMBH_ALLE_SCHEMAS`; `scripts/abnahme-dossiers.ts` erzeugt 26 Dossiers (GmbH +
25 Vorlagen, 432 Bausteine) nach `abnahme/dossiers/` → Wortlaut-Abnahme aller
Gebiete ohne TS-Lesen (bisher nur AG).
(4) **Bug-Check (§9, `fc5ec96`):** 4-Dimensionen-Multi-Agent + adversariale
Verifikation über das Delta; 3 bestätigt (alle niedrig/mittel, KEINE
Rechtslogik): AG-Konsolenzahl wiederhergestellt + `KV_SCHEMA`→`KLAGE_V_SCHEMA`
(klageVereinfacht, §5-Namensfalle) gefixt; Verifikationsstand-Drift (vor-
bestehend) offen. Deploy-Urteil: keine Blocker.

(5) **Thema A — generische `VorlagenSeite` + Pilot (`325ccc1`):**
`src/components/vorlagen/VorlagenSeite.tsx` übernimmt die fehleranfällige
Orchestrierung (useWizardState, useMemo, pruefen-Scaffold, DOCX-Gate,
VorschauPanel); `seiteHelfer.ts` (istIsoDatum/docxAktiv, Schritt-2-Dedup).
Pilot **Forderungsabtretung** umgestellt — §6-Beweis: golden 166 byte-gleich +
**Playwright-DOM byte-identisch über alle 3 Schritte + bedingtes Feld**; Logik-
Check: src/lib unberührt, Sweep 14448 ohne Widerspruch. Opt-in; seiten-
spezifisches JSX bleibt in der Config (§1).

(6) **Thema A — Rollout (`6a2c538`, `c175d4c`):** Verjährungsverzicht,
Nichtbekanntgabe + Mahnung auf `VorlagenSeite` umgestellt — **4 lineare Seiten
gesamt: FA/VV/NB/Mahnung**. VorlagenSeite opt-in erweitert: `zeigeWarnungen`
(gates.warnungen) · `fehlerEingabe(a,schritt,gates)` · `blockerImLetztenSchritt`
(Mahnung false). §6 je Seite: gate grün, golden byte-gleich, Playwright-DOM
byte-identisch (alle Schritte/bedingte Felder/Mahnung beide Varianten) v/n.

(7) **Grundsatz David «kein Eingabefehler im leeren Zustand» (`05c1899`,
`2d69e8a`):** Fehlerbox erst nach erster Eingabe («berührt»). Wizards zentral im
`VorlagenWizardRahmen`; Rechner-Forms via internem `BeruehrtContext` +
layout-transparentem `BeruehrtRahmen` (display:contents) in `ui.tsx`, 11 Forms
umschlossen. «Weiter» bleibt bei leeren Pflichtfeldern gesperrt. golden byte-
gleich (Rechtslogik unberührt), Playwright-verifiziert. Memory:
[[formulare-kein-fehler-vor-eingabe]]. Die meisten Rechner haben ohnehin
Beispiel-Defaults (keine sichtbare Änderung) — betraf v.a. die Wizards.

**NICHT umgesetzt (bewusst, §1/Konflikt-Register):** Rollout `VorlagenSeite`
auf weitere Seiten — VariantenKopf-/Mehrschritt-/eigenes-Gate-Seiten bleiben
handgeschrieben); Phase 5 Verbatim-Hebung (Gefahrenzone), Persistenz-/i18n-
Features; David-Entscheide (Server-Sync, fr/it-Inhalt, LIK Python→TS). TODO:
Drift-Guard `check:abnahme` (Dossiers regenerieren + git diff). Push/Deploy nur
auf frisches Ja (§9).

## Session 13.6.2026 — V3 Vertrags-Grundtypen KOMPLETT + Verwaltungs-/BGG-Stillstand (GO David «weitermachen mit bau» + eingeschobener Auftrag)

**FAHRPLAN-VORLAGEN-AUSBAU V3 ist mit 4/4 Grundtypen FERTIG** (je eigener
Commit, je Gate GRÜN + Build prerendered):
(1) **Auftrag/Dienstleistungsvertrag** `41dccc3` — Art. 394 ff. OR;
Gegenstands-Module allgemein/Beratung/Treuhand/Inkasso, Vergütungsweiche;
Kern-Offenlegung zwingendes Auflösungsrecht Art. 404. (2) **Werkvertrag**
`704aa85` — Art. 363 ff. OR; Weiche beweglich/unbeweglich → Rügefrist
(60 Tage zwingend, Art. 367 Abs. 1bis) und Verjährung (2/5 J, Art. 371);
Festpreis/Aufwand; Brücke zum Gewährleistungs-Rechner; Rücktritt Art. 377.
(3) **Geheimhaltungsvereinbarung/NDA** `5aa4b62` — Innominat (Art. 19 OR);
einseitig/gegenseitig + Konventionalstrafe (Art. 160/161/163, richterliche
Herabsetzung offengelegt). (4) **Konkubinatsvertrag** `d081391` — Art. 19
OR / Art. 646/650/651 ZGB / Art. 530/548/549 OR; Module Wohnen/Kosten/
Inventar/einfache Gesellschaft/Auflösung; kein gesetzliches Konkubinats-
recht + Kindesbelange nach Gesetz offengelegt. Endstand: Zähler 47 gebaut/
43 sichtbar, Golden 159, Routen 49.

**EINGESCHOBENER AUFTRAG David («baue parallel den Verwaltungs-Stillstand
Art. 22a VwVG und den BGG-Stillstand Art. 46 BGG im fristenrechner»):**
neue Engine `lib/bggVwvgFristen.ts` (reine Kompositions-Schicht über
fristenEngine) + zwei Ferien-Optionen im EinfacheFristForm. Beide Regimes
teilen die drei Stillstandsperioden (Ostern ±7 · 15.7.–15.8. · 18.12.–2.1.)
und den Ruhen-Mechanismus mit der ZPO (golden-bewiesen periodengleich);
regime-treu erhalten (kein Kollaps, §4): Geltung NUR für nach Tagen
bestimmte Fristen (Wochen/Monate/Jahre ruhen NICHT — anders als ZPO 145),
Abs.-2-Ausnahmen je Regime verschieden (VwVG 2 / BGG 5), Werktag-
verschiebung Art. 20 III VwVG / 45 I BGG. Empirie handgerechnet
(10.9./11.1.2027/11.5.). Dossier `bibliothek/recherche/stillstand-vwvg-
bgg.md` (§11). Alle V0-Anker am Filestore-Cache verifiziert (OR/ZGB
20260101, VwVG 20220701, BGG 20260401; check:zitate 0 Befunde).

OFFENE FOLGEPOSTEN: fachliche Abnahme der V3-Vorlagen + des Stillstand-
Wortlauts durch David · V4 (Detailgrad-Schalter) · V5 ff. Ungepusht;
Push/Deploy nur auf frisches Ja (§9).

## Session 13.6.2026 (Nacht) — V2-Rest KOMPLETT: Zession · Fristerstreckung · Nichtbekanntgabe (GO David «arbeite einfach»)

**FAHRPLAN-VORLAGEN-AUSBAU V2 ist mit 4/4 Vorlagen FERTIG** (je eigener
Commit, je Gate GRÜN + Build prerendered + Playwright-Sichtcheck):
(1) **Abtretungserklärung (Zession)** `5d4ccf8` — Art. 164/165/167/170 OR
verbatim am 20260101-Cache; Schriftform-Unterschrift Zedentin, optionale
Gegenzeichnung, Zinsen-Klarstellung (170 III nur Vermutung), Hinweise
Abtretungsverbot/Anzeige/Verpflichtungsgeschäft. (2) **Fristerstreckungs-
gesuch** `fd10ff1` — Art. 143/144/148 ZPO; Frist-Art-Weiche (gesetzlich =
Blocker mit 148-Hinweis), Gesuch nach Fristende = Blocker, letzter Tag =
143-I-Warnung; Begründung Maske/Platzhalter; ThemenEinstieg am
ZPO-Fristen-Rechner. (3) **Nichtbekanntgabe Betreibung** `3d1fc99` —
Art. 8a III lit. d SchKG in der NEUEN Fassung seit 1.1.2026 (AS 2025 522)
verifiziert ([VF] der Analyse aufgelöst); Rechtsvorschlag-Pflicht,
3-Monats-Schwelle mit konkretem frühestem Gesuchstag (Klemmfall 30.11.
handgerechnet), ehrliche Wieder-Bekanntgabe-Offenlegung; ThemenEinstieg
am SchKG-Fristen-Rechner. Endstand: Zähler 43 gebaut/39 sichtbar,
Golden 134, Routen 45. OFFENE FOLGEPOSTEN: Prefill-Brücke zpo-fristen→
Fristerstreckung · SchKG-Anliegen «Nichtbekanntgabe» für den
VorlagenSprung (Entscheid David). Ungepusht; Push/Deploy nur auf
frisches Ja (§9).

## Session 12.6.2026 (spät) — Pauschal-Abnahme Wortlaute (David) + V2-Fortsetzung

**Pauschal-Abnahme David («alles abgenommen»), Protokoll
`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`:** Wortlaute
geo.admin-Datenschutz-Absatz + «Beim Bund nachschlagen» · Zefix-Absatz ·
KVG-Preset Maske 3 · TI-Miete-Texte · FE-1-WARUM/FE-2-Weiche ·
Mahnung-Bausteine · BGer-Hinweise inkl. Eheschutz-V-1 — sowie die
**P1-Priorisierung der Wettbewerbsanalyse** (V2-Rest/V3 ff. freigegeben).
NICHT umfasst (bleibt offen): Karten-«geprüft»-Hebungen (brauchen
Karten-Verdikt + Referenzfall-Protokoll; Paket Tagerechner liegt in
`.scratch/`), Teil D, Praxis-Rang-Kuratierung, Anliegen-Liste, übrige
Dossiers. Status-Stellen nachgeführt (Datenschutz.tsx-Kommentare,
Dossier-/INDEX-Zeilen, FAHRPLAN-VORLAGEN-AUSBAU, HANDLUNGSPLAN A.3/A.4);
Datenschutz-Seite als GANZE bleibt Entwurf (Platzhalter Ziff. 1/4).

## Session 12.6.2026 (abends) — StGB-Re-Pin vollzogen (Verfallsregister-Termin)

Der am 12.6.2026 fällige, terminierte **StGB-Re-Pin (AS 2026 231) ist
VOLLZOGEN:** `fedlex-cache.sh` neu `20260612|0` (No-Suffix wie im
Voraus-Check vorausgesagt). Empirie am Stichtag: Anker-Inventar 477/477
identisch; alle 7 engine-zitierten Pflicht-Anker normtext-identisch zu
20260101 (Diffs nur Fussnoten-IDs); materiell geändert NUR Art. 354/357
(Eurodac/Schengen-Datenaustausch, nicht verdrahtet). Nachgeführt:
Quellen-Register, Verfallsregister (nächster Stichtag 1.7.2026 ZGB/ZPO),
Dossier-Nachtrag `fedlex-pin-nachverifikation-2026-06.md`. Tore:
`check:caches` → `check:zitate` (616 Zitate, 0 Befunde) → `check:verfall`
(StGB-Meldung weg) grün. Kein Engine-Code berührt. Ungepusht; Push/Deploy
nur auf frisches Ja (§9). In 45-Tage-Vorschau weiter: ZGB/ZPO-Re-Pin +
Streitwert-Formeln 1.7. · SG GKV 30.6.

## Session 12.6.2026 (Fortsetzung) — TI-Miete gemeindescharf + vertiefter §9-Bug-Check (Auftrag David: «tessin vertiefung, bug check, push, deploy»)

**(1) TI-Miete VERDRAHTET** (`6cf5802`) — der LETZTE Kanton ohne
Miete-Auto-Auflösung ist geschlossen (12/12 Register + 13 zentral +
NE-Wahl): Zuordnung amtlich doppelt belegt (Art. 5 LALoc RL/TI 3.3.2.1.4
+ amtliche Località-Suche locazione, **168/168 einzeln abgefragt**);
Praxis-Quelle geht dem 2005er-Wortlaut vor (Ex-Sonvico → n. 4, Claro →
n. 11). 97 Gemeinden eindeutig (TI_MIETE, Dossier §51 + Patch-Generator)
+ 3 Mehr-Uffici-Gemeinden via Ortsteil-Wahl (Lugano n. 3/4 · Bellinzona
n. 9/10/11 · Val Mara n. 5/2). Stammdaten-KORREKTUR Agno: Contrada
Nuova 3. 8 Selektor-Optionen = kantonale CMS-Lücken, über Mutter-
gemeinden geschlossen; Giudicature-Lücken (Ambrì/Pianezzo/S. Antonio/
Torre) am 12.6. nachgefasst: beim Kanton unverändert offen.
**(2) VERTIEFTER §9-BUG-CHECK (Auftrag David), 6 unabhängige Lupen**
(Code · fachlich mit ~45 amtlichen Gegen-Abfragen · Empirie/E2E ·
Daten-Integrität über ALLE Indizes · Integration/SSG · Edge-Cases mit
echten Aufruf-Batteries): **1 HOCH + 5 MITTEL + 7 NIEDRIG, alle
relevanten GEFIXT** (`4bc80e8`): HOCH TI-Miete-Ortsteil-Meldung sass im
unerreichbaren verzeichnis-Zweig (3 Lupen übereinstimmend; jetzt im
liste-Zweig, empirisch verifiziert) · kreisIdx jetzt geschlüsselt
(stale Wahl reiste in neue Liste: 8044→8050 meldete 0.2-%-Amt) ·
kantonFest-Guard in PlzGemeindeWahl (kantonsfremde Strassen-Auflösung
wird offengelegt) · Bund-Übernahme leert ZH-Strasse · Apostroph
U+2019↔ASCII + ALL-CAPS-«STR.» in strassenKandidaten (~1'300
Romandie-Strassen) · Versatz-PLZ ohne Index blenden das Strassenfeld
aus · FL-404-Meldung · KVG-64a-Warnung um Kinder-Ausnahme präzisiert
(deklariert, Fedlex wörtlich). Bestanden u. a.: SSG-Tore/Chunks sauber
(Daten nur lazy), PDF-Kette §5, CSP, alle Daten-Invarianten exakt,
0 Falschtreffer/0 Exceptions in allen Edge-Batteries, ti.ch/WFS/Fedlex-
Stichproben deckungsgleich. **OFFEN dokumentiert:** SZ ordentlich 26/30
(Alpthal/Lauerz/Steinerberg/Wangen fehlen quellbedingt — SZ-Vermittler-
Erhebung als Kandidat; SZ_MIETE deckt 30). Tore: gate voll GRÜN.
**PUSH + DEPLOY VOLLZOGEN (12.6.2026): origin/main = Prod = `7ff7315`**
(dpl_CWUebRfaqtCdhzraMDHJYr9qXpuu, /tmp-HEAD-Worktree, Hash live=lokal
index-B8c9RHkx, 8/8 Kernrouten 200, CI grün). **CSP-Klicktest auf Prod
BESTANDEN:** Bundes-Adresssuche live (Limmatstrasse 152 → 8005/Zürich/ZH
übernommen, 0 CSP-Fehler — connect-src api3.geo.admin.ch wirkt);
ZH-Kreis-Automatik auf Prod verifiziert. **Verfallsregister meldet
fällig: StGB-Re-Pin 12.6.2026 (AS 2026 231) — nächste Session.**

## Session 12.6.2026 — ZH-Kreis-Automatik + Adress-Ausbau Stufen 1–3 (Entscheide David, ungepusht)

**(0) Verifikationsfrage David beantwortet** (`8842bfd`): Stadt-Zürcher
PLZ sind **NICHT kreisscharf** (16/30 mehrkreisig; amtliche
Gebäudeadressen Stadt ZH, 56'666 real) — dank Ämter-Paarung sind 19 PLZ
amts-eindeutig → **Kreis-Automatik**: eindeutige PLZ lösen das
Kreis-Friedensrichteramt automatisch, mehrdeutige zeigen die
eingegrenzte Wahl mit Adressenanteil (dominant vorausgewählt), Postfach
→ Sechser-Wahl. Generator `zh-kreise-generieren.ts` → zuerichPlzKreise.
**(1) Stufe 1** (`0ec3a5d`): Strasse (+ Nr.) → Kreis-Amt offline
(`zhStrassen.json`, 1'984 Strassen, 58 amts-übergreifende per
Hausnummer; 26 KB gz); Vorrang Strasse → PLZ → Wahl, beide UIs.
**(2) Stufe 2** (`3bd6a9a`): schweizweit Strasse (+ Nr.) → Gemeinde bei
den 1'213 gemeinde-mehrdeutigen PLZ (47.4 % aller Adressen) — swisstopo
Gebäudeadressverzeichnis (3.24 Mio real) → `strassenVerzeichnis.json` +
`strassenNummern.json` (91'218 eindeutige Strassen, 1'425 Grenzstrassen
per Nummer; ~0.56 MB gz, eigene Lazy-Chunks); wirkt in PlzGemeindeWahl
(alle Eltern-UIs); kantonsübergreifend belegt (4052 Birswaldweg →
Münchenstein BL). Lint-Härtung `cb917b6` (PLZ-geschlüsselter Zustand).
**(3) Stufe 3** (`10ce93d`): `AdresseBundSuche` (§10) — Freitext-Adresse
über die Bundes-API (geo.admin.ch SearchServer + GWR-Detail) NUR auf
Klick, **permanenter Übermittlungs-Hinweis** + Offline-Alternative
benannt (Anweisung David); kantonsfremde Treffer offengelegt statt
übernommen; CSP + api3.geo.admin.ch (nur am echten Vercel prüfbar);
/datenschutz-Absatz ENTWURF. Empirie: Playwright beide UIs inkl.
Live-API (Bundesplatz 3 Bern → 3011/Bern/BE); 8044-Lehrstück
(Gockhausen→Dübendorf): Kreis-UI korrekt erst nach Gemeinde-Wahl.
Dossiers: gebaeudeadressverzeichnis-adressaufloesung.md (+ Verfalls-
Kandidat Re-Generierung 1.10.2026) · ZH-Vollerfassung Nachträge.
**OFFEN für David:** Wortlaut-Abnahmen (Datenschutz-geo.admin-Absatz,
«Beim Bund nachschlagen», Hinweis-Texte) · Verfallsregister-Eintrag
1.10.2026 entscheiden. Tore: gate voll GRÜN, Build 38/38.
**16 Commits ungepusht — Push/Deploy nur auf frisches Ja (§9).**

## Ältere Session-Karten und Chroniken — rotiert ins Archiv

Verbatim verschoben nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(FAHRPLAN-TOKEN-DISZIPLIN.md T-4): **13.6.2026** alle sieben 11.6.-Karten
(früher Abend · später Nachmittag · abends · nachmittags · vormittags ·
über Nacht · Tag «Schlichtung fertig + Vollerhebungen») · **11.6.2026**
Sessions 10.6. abends (STRUKTUR-UMBAU S-1–S-6) und nachmittags
(Fristen-Einheit FE-1–FE-6) · 7.6. abends (Betreibungsamt-Finder) und
nachts (Plan 9b Volldokumente) · 6.6. abends und nachmittags ·
Verschlankung 5.6.2026 · Session-Abschluss 6.6.2026.

## Verifikationsstand (eine Zeile)

Stand 11.6.2026: Build + 38 Prerender-Routen ✓ · Lint 0/0 ✓ · Suite 1404
grün + 2 skipped (78 Dateien) ✓ · tsc STRICT · Golden 104/104 byte-gleich ✓
· Logik-Sweep 14'448 Kombinationen ✓ — Workflow: **`npm run gate`** (bzw.
`gate:schnell` pro Iteration; leise bei Grün, volle Ausgabe nur für rote
Tore, CLAUDE.md §6 Ziff. 1/5); `npm run check` für die Offline-Checks,
`npm run check:netz` für Fedlex; vor Deploys unabhängige Review-Agents
(Skill `deploy-check`).

**Informationsbibliothek: `bibliothek/INDEX.md`** — Quellen-Register
(verifizierte Fedlex-Stände inkl. ZPO-Revision 2025), Parameter-
Verfallsregister, Recherche-Dossiers (Schlichtungsbehörden 26 Kantone),
ZPO-Normtexte für die Zuständigkeitsengine.

**Zuständigkeitsengine (`src/lib/zustaendigkeit.ts`, Phase 1 — entwurf):**
Bundesrechtsschicht nach ZUSTAENDIGKEIT-AUFTRAG.md (Spezifikation im
Repo-Root): Verfahrensart (Art. 243 inkl. Abs.-3-Vorbehalt), Schlichtung
(197–200), Entscheidkompetenz (210/212, Revision 2025: 10'000),
Gerichtsstände (10/32–35), HG-/Direktklage-Weichen (6/8). 30 Tests mit
beidseitigen Schwellen-Grenzwerten. **Phase 2 erledigt:** Kantonsschicht
`data/zustaendigkeitKantone.ts` (BS-Pilot, Stellen-Auflösung über
behoerden.ts, GOG-Schwelle bewusst null/offen) + SG_SCHWELLEN beziehen
die Zuständigkeits-Schwellen aus ZPO_SCHWELLEN (SSoT §5, golden-bewiesen
byte-gleich). **Phase 3 erledigt:** /rechner/zustaendigkeit (Form §3-rein,
Eckdaten-Tiles, Stelle mit Adresse/Quelle, Weichen offen, PDF-Bericht);
Katalogkarte `zustaendigkeit` (pro/entwurf) ersetzt die drei geplanten
Karten gerichtsstand/verfahrensart/schlichtung. **Phase 4 erledigt:**
Prefill-CTA → Schlichtungsgesuch BS (sgPrefillKodieren/Lesen; nur bei
ordentlicher Behörde + erfasster Stelle; Golden byte-gleich) — MVP
end-to-end. OFFEN: weitere Kantone (nach Dossier-Abnahme), weitere
Ziel-Vorlagen. Davids fachliche Abnahme steht aus.

## Informationsarchitektur (Stand EINE Hauptseite 7.6.2026)

**EINE Hauptseite (FAHRPLAN-EINE-HAUPTSEITE.md, Auftrag David 7.6.2026 —
hebt die Free/Pro-Zweiteilung vom 5.6. wieder auf):** `/` trägt den
VOLLSTÄNDIGEN Katalog (Gebiets-Kacheln, Suche `?q=`, Panel `?gebiet=`,
Anliegen-Zeile, «Zuletzt verwendet») hinter einem kompakten Hero
(Free-Nutzen-Headline in h2-Höhe; Kennzahlen OHNE Preisaussage bis
Monetarisierungs-Entscheid G1). Davor eine kuratierte Chip-Zeile
**«Häufig gebraucht»** (`lib/haeufigGebraucht.ts`, Nachfolger der
Free-Kachelwand-Kuratierung; nur Verfügbare erscheinen). `tier`-Feld,
`PAYWALL_ACTIVE`, `lib/proSession.ts` (Pseudo-Login) und der
Header-Pro-Button sind ENTFERNT (D-3; Stand vor dem Rückbau: Git-Historie
bis `2e80daf`). `/pro`, `/fachpersonen`, `/rechner` → DAUERHAFTE Redirects
auf `/` mit erhaltenem Suchstring (Permalink-/.ics-Link-Erbe). Mobil erbt
die Hauptseite den vorbestehenden 390px-Overflow des Katalogs
(FAHRPLAN-DESIGN Etappe 4, offener Strang).

**Katalog-Gliederung: primär nach RECHTSGEBIET** (17 kanonische Sektionen
in fester Auftrags-Reihenfolge, `RECHTSGEBIET_SEKTIONEN`), darunter je die
Untergruppen **Rechner** und **Vorlagen** (nur nicht-leere). Output-Typ
(Rechner) und Dokument-Typ (Vorlagen) sind FILTER; Rechtsbereich-Filter und
Suche bleiben. **Der frühere Modus-Umschalter (Primärweiche Rechner |
Vorlagen) ist damit abgelöst und entfernt**; `?modus=`-Links bleiben
harmlos; die Alt-Gliederungen ('art'/'bereich') sind aus dem Code
entfernt. Header = Zwei-Zonen (Logo links, Aktionscluster rechts:
Sprache · Methodik — Pro-Button entfernt 7.6.2026, Methodik seither auch
mobil), Mitte leer; Utility-Bar nur Pflichthinweis rechts, mobil
ausgeblendet.

**Design-Tokens (Feinschliff 5.6.2026, single source tailwind.config +
index.css):** Typo-Skala GESCHLOSSEN — micro 11 · overline 11 · xs 12 ·
body-s 14 · base 16 · body-l 18 · h3 20 · h2 25.6 (auch Ergebnis-Hauptwerte
mit `leading-none`) · h1 32 · display 36/44 (Heroes). **`text-sm`/`text-lg`
sind verboten** (Tailwind-lh weicht ab; body-s/body-l verwenden). Radien
komplett tokenisiert (--radius-sm…2xl). Status-Hintergründe nach EINEM
Rezept (`color-mix --status-tint 10%` auf Papier; AA geprüft). Motion:
--dur-fast/base/slow + --ease, Default-Easing global. Komponenten-Anatomie:
`lc-tile` (Ergebnis-Kachel) · `lc-notice[-warn|-danger]` eigenständig (kein
Inline-Padding!) · `lc-btn-sm` (36px) · disabled steckt in den
lc-btn-Klassen (keine disabled:-Utilities) · ein Aktions-Akzent
(lc-btn-primary; lc-btn-brass entfernt).

**Layout:** Inhaltsspalte einheitlich `max-w-content` = **70rem (~1120px)**
(Token in tailwind.config); 8-px-Skala `--space-1…24`, `--control-h` 44px,
`--pill-h` 36px. Hero text-geführt einspaltig (keine Deko-Grafik, bewusst
nicht animiert), Untertext ≤ 58ch; Determinismus-Claim genau EINMAL (Hero).
Kartenraster `repeat(auto-fill, minmax(340px, 1fr))`; Titel ohne Silben-
trennung (`text-balance`); Pills im Inhaltsblock, nur CTA per `mt-auto`
unten. Keine Ziffern in Sektionsköpfen/Sidebar (konsistent nirgends).

**Pro-Katalog = KACHEL-KATALOG (Umbau 6.6.2026 nachts, Live-Auftrag David;
Roadmap + Entscheide: FAHRPLAN-KATALOG-UI.md):** Die 17 Rechtsgebiete sind
kompakte Kacheln unter den 5 Obergruppen (Name · Zähler «X verfügbar · Y in
Vorbereitung» · verfügbare Werkzeug-Titel, geklemmt). Klick öffnet das
Gebiet als Panel in voller Breite unter der Kachel-Zeile (`?gebiet=` in der
URL, teilbar; nur ein Panel zugleich); die Disclosure-Sektionen samt
Scrollspy sind entfernt. Darüber: Anliegen-Zeile (lib/anliegen.ts, 8
situative Einstiege — ENTWURF, Abnahme David offen) + «Zuletzt verwendet».

**Suche:** EIN kompaktes Suchfeld in der Katalog-Seitenleiste (Desktop)
bzw. im Filter-Drawer (mobil) — filtert den Katalog live. Die frühere
⌘K-Befehlspalette ist entfernt (Entscheid David 5.6.2026). Seit 6.6.2026:
Suche/Filter aktiv → flache, gerankte Trefferliste statt Kacheln (Rang:
Titel > Keyword exakt > Keyword > Norm > Gebiet; lib/katalogSuche.ts —
dieselbe Logik testet die Suchbegriff-Goldliste katalogSuche.test.ts,
48 Paare Laie/Fach/Norm); `?q=` in der URL; «/» fokussiert das Feld;
Keywords kompakt verglichen wie Normen («Art.311» = «311 ZPO»).
Metadaten-Inventur: `npx vite-node scripts/katalog-inventur.ts`.

**Sprachen:** Umschalter sichtbar (Header); EN/FR/IT «in Bearbeitung» mit
DE-Fallback + persistentem Banner; KEINE maschinelle Übersetzung (fachkundige
Person später). `<html lang>` folgt der Locale; Fedlex-Links ebenfalls
(fr/it amtlich — Anker stichprobenverifiziert sprachunabhängig; en → de).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (oranger Top-Rand `--warn-500` + Outline-Badge «Entwurf»
(`.lc-badge-entwurf`), Tooltip «erstellt, fachlich noch nicht geprüft»;
dazu EINE Status-Legende über der Startseiten-Kachelwand statt lauter
Einzel-Badges — Design-Review 6.6.2026, Freigabe David) = gebaut, ungeprüft ·
`geprüft` (Goldrand, KEIN Wort-Badge) = fachlich geprüft — **aktuell
nirgends vergeben** · `geplant` (gedämpft, AA-konform ohne Opacity) =
«In Vorbereitung», ohne Norm-Pills/Artikel-/Tagesangaben.
**Alle NormRefs tragen `verified: false`**, bis David sie fachkundig gegen
Fedlex prüft (Anker selbst sind build-verifiziert, Format `art_335_c`).
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.
Status-Filter heisst «Nur verfügbare» (= nicht geplant).

## Katalog (Quelle: src/lib/startseiteConfig.ts — Single Source of Truth)

**111 Einträge: 64 Rechner + 47 Vorlagen** (Katalog-Ausbau 5.6.2026: +59
geplante Karten gemäss KATALOG-ROADMAP.md; Soll-Inventar dort gepflegt).
Felder: modus, art, rechtsgebiet (kanonisch, 17 Werte),
**rechtsbereich** (privat/oeffentlich/straf/uebergreifend), status, norms
(NormRef mit verified), href, schemaId/formvorschrift/output (Vorlagen),
szenarien (konsolidierte Rechner), related (modusübergreifend), keywords
(**tier entfernt 7.6.2026**, FAHRPLAN-EINE-HAUPTSEITE). VorlageArt um
**korrespondenz** («Schreiben & Erklärungen») erweitert. Neue geplante
Karten: norms [], kein href, neutrale Beschreibungen (Normentreue);
Roadmap-«[Gerüst]» als «Strukturiertes Gerüst …» im Text.

**Konsolidierung (43→34):** 9 Einzelkarten absorbiert — Klagebewilligung +
Fristwiederherstellung → ZPO-Fristen; Rechtsöffnung/Aberkennung/Kollokation
+ Arrest → SchKG-Phasen; missbräuchl. Kündigung + Massenentlassung →
«Arbeitsrecht — Fristen»; Miet-Anfechtung → «Mietrecht — Fristen»;
Verzugszins-vertieft → Verzugszins; SV-Leistungsverwirkung → ATSG-Karte.
`RechnerCard.szenarien` zeigt abgedeckte/geplante Szenarien auf der Karte.

**Spät-Session 7.6.2026 (Kurzspiegel; Details HANDLUNGSPLAN.md A.0):**
Daueranweisungen §0 Mehrwert-Test + §0a Perfektion-vor-Neubau · Roadmap
−7 geplante Karten (verifiziert) · AG-Programm fertig inkl. Notariats-
tarif-Korrekturen (ZH-Rahmen 123! SG floor!) · Startseite: leere Gebiete
als «In Vorbereitung»-Zeile, Rubrik einzeilig · Vereinheitlichung Runde 1
(Tagerechner-Hash/geteilter Teilen-Button, 7 Titel-Paare + Invariante) ·
Dossiers neu: gmbh-deltas-g0, gmbh-qualifizierte-gruendung,
ag-kapitalkategorien (Bau gesperrt), BGerR-Verifikation (35/35a-Split).

**Konsolidierung Runde 2 (7.6.2026, FAHRPLAN-KATALOG-KONSOLIDIERUNG,
Auftrag David «simplifizieren — ein Einstieg pro Rechtsfrage»):** Katalog
gesamt 115→112, verfügbar 35→32 gebaut, davon **28 sichtbar**. (a) GELÖSCHT
die 3 reinen Hash-Deep-Link-Karten: untermietvertrag → Karte «Mietvertrag
(Wohnen · Geschäft · Untermiete)»; schkg-/straf-zustaendigkeit → EINE Karte
«Zuständigkeit (Zivilprozess · Betreibung · Strafverfahren)» mit szenarien
(kehrt den Katalog-Split vom 6.6. um — Davids Delegation 7.6.). (b) NEU
`imKatalog:false` (BaseItem) + `KATALOG_KARTEN`: die 4 Kündigungs-Masken
(AN/AG/Mieter/Vermieter-Checkliste) behalten ihre Karten als SSoT der
Masken-Seiten (`karte(id)`!), erscheinen aber nicht mehr im Register/Suche —
ihre Auffindbarkeit tragen die Themen-Einstiege «Kündigung & Fristen im
Arbeitsverhältnis» (ex «Arbeitsrecht – Fristen») und «… im Mietverhältnis»
(ex «Mietrecht – Fristen»), deren Rechner-Seiten die Masken direkt verlinken.
(c) Kachel-Overline zeigt jetzt `Gebiet · Rechner/Vorlage` (Funktions-
Kennzeichen, EIN Template-Literal wegen SSR-Marker). Ausdrücklich NICHT
gemergt: GmbH-/AG-Gründung (zwei Werkzeuge, echte Rechtsform-Entscheidung),
Tagerechner↔ZPO/SchKG (gewollter Laien-/Fach-Doppeleinstieg), Rechner↔
Vorlage-Paare (§5: eine Engine, zwei Ausgabeformen). Goldliste deklariert
nachgezogen (misst jetzt KATALOG_KARTEN); Davids Abnahme der neuen
Titel-Wortlaute offen.

**Gliederung (seit Katalog-Ausbau):** beide Seiten = Rechtsgebiet-Sektionen
(GebietSektion, feste §4-Reihenfolge OHNE Relevanz-Sortierung) mit
Untergruppen Rechner/Vorlagen; innerhalb der Gruppen verfügbare vor
geplanten (sortiereKarten). Filter: Status («Nur verfügbare») · auf /pro
zusätzlich Rechtsbereich · Output-Typ (Rechner) · Dokument-Typ (Vorlagen);
Suche in der Seitenleiste. Grenzfall Vorlage «Einsprache»: straf
(Strafbefehl häufiger), Verwaltungsbefehl via Keywords.

## Rechner (Engines in src/lib/, alle rein/deterministisch, kein LLM)

Gebaut (entwurf): zpo-fristen, schkg-fristen, kuendigung-sperrfristen
(inkl. **Sperrtage-Zähler**: Kontingent 30/90/180 je DJ, beansprucht nach
Art.-77-Zählung, verbleibend, Rückfall-Zeilen — Komponente
SperrtageZaehler, auch in der kombinierten Ansicht), mietrecht,
verjaehrung (Zwei-Fristen, Stillstand-Union), gewaehrleistung (Zwei-Regime
1.1.2026), verzugszins (Segmente, Art. 85-Anrechnung), lohnfortzahlung
(Skalen; Engine-Guard AUF 1–100 %), erbteilung, **allgemeineFrist**
(Free-Tagerechner, Auftrag 5.6.2026: dünne Engine auf fristenEngine/
zpoFeiertage — dies a quo IDENTISCH zu zpoFristen, Systemtest AF-14;
getrennte Wochenend-/Feiertags-Toggles, Tage-zwischen-Hilfsmittel;
SR 173.110.3 als Gesetzes-Seiten-Pill, ELI SPARQL-verifiziert).
Feiertage algorithmisch (Computus) — keine Jahres-Klippe.

## Vorlagen-Plattform (src/lib/vorlagen/)

Generische Engine: `assemble(schema, antworten)` rein/deterministisch
(Bedingungs-Algebra eq/in/nichtLeer/and/or/not; wiederholeUeber; nummeriert
mit Leerlisten-Guard; Interpolation; Bausteinprotokoll). Renderer aus EINER
Quelle: vorlagenPdf (jsPDF, Banner-API, WinAnsi-Sicherung) + vorlagenDocx
(docx-Lib, lazy geladen, Word-Formatvorlagen; XLSX architektonisch
vorbereitet, nirgends ausgeliefert). Geteilte Wizard-UI:
components/vorlagen/ui.tsx (Field, NormLink locale-bewusst, Stepper).

**8 gebaute Vorlagen (alle entwurf):**
1. **Testament** (/vorlagen/testament) — eigenhändig: Abschreib-Mustertext,
   Pflichtteils-Panel, Gates 467/505/481/472. KEIN DOCX (Eigenhändigkeit).
2. **Patientenverfügung** (/vorlagen/patientenverfuegung) — Schriftform;
   Konsistenz-Engine R1/R2, harter Sterbehilfe-Block R6 (Art. 114/115 StGB);
   PDF + DOCX (Pilot Mehrformat).
3. **Vorsorgeauftrag** (/vorlagen/vorsorgeauftrag) — formMode-Weiche
   eigenhändig (Mustertext) / beurkundet (Entwurf, DOCX nur hier);
   Eligibility-Gate Art. 13; Grundstück-Sondervollmacht erzwungen.
4. **Schlichtungsgesuch Basel-Stadt** (/vorlagen/schlichtungsgesuch-bs,
   tier experte) — Routing mit Stopp-Karten (Miete/GlG → eigene Stellen,
   Art. 198), Mängelliste mit Schritt-Sprung, SG_SCHWELLEN hart codiert,
   Behörden-Stammdaten BS, Form-Gate (Exemplare = 1+Beklagte), PDF+DOCX,
   BEWUSST ohne localStorage (Anweisung); 12 Akzeptanztests.
5. **Einzelarbeitsvertrag** (/vorlagen/arbeitsvertrag) — ERSTE Vorlage auf
   dem generischen Wizard-Rahmen. Grundlage: normverifiziertes Gutachten
   Art. 319 ff. OR (5.6.2026); Validierungskern = Matrix absolut/relativ
   zwingend (Art. 361/362) + Schriftform-Klauseln (durch beidseitige
   Unterschrift erfüllt) + Disclosure (BGE 145 III 365, 149 III 202,
   129 III 276). Harte Gates: Probezeit ≤ 3 Mte, Frist ≥ 1 Mt (bei
   Befristung neutralisiert), Ferien ≥ 4/5 Wochen, Ferienabgeltung bei
   Vollzeit gesperrt, KV nur mit Ort/Zeit/Gegenstand + Einblicks-
   Bestätigung. Kantonale Mindestlöhne als DATIERTE Parameter
   (AV_MINDESTLOEHNE, jährlich verifikationspflichtig!). ArG in fedlex.ts
   ergänzt (Anker art_9/12/13/46 empirisch verifiziert). PDF+DOCX;
   16 Akzeptanztests. Deklarierte Gutachten-Abweichung: einheitliche
   Frist < Staffel zulässig per Art. 335c Abs. 2 (Hinweis statt Verbot).
6. **Mietvertrag Wohn-/Geschäftsräume** (/vorlagen/mietvertrag, Karte
   mietvertrag-wohnen) — Gutachten Art. 253 ff. OR/VMWG (5.6.2026).
   Zentrale Weiche objektTyp + Kanton. Gates: Kaution ≤ 3 Monatszinse
   (nur Wohnraum), Fristen 3/6 Mte, Index ≥ 5 J/LIK + Staffel ≥ 3 J
   (beide am Fedlex-WORTLAUT verifiziert), NK-Einzelausweis, MWST nur
   Geschäftsraum. DATIERTE Parameter: Referenzzins 1.25 % (1.6.2026,
   quartalsweise!), MWST 8.1 %, Formularpflicht-Kantone (BWO 4.2.2026,
   BE-Diskrepanz offengelegt, dynamisch per 1.11.). PDF+DOCX; 14 Tests.
7. **Vollmacht** (/vorlagen/vollmacht, Karte `vollmacht`) — EINE Maske mit
   Typ-Schalter Anwalts-/General-/Spezialvollmacht (Entscheid David
   5.6.2026 statt zweier Vorlagen; Grundlagen-Bericht «Vollmachten»,
   Downloads). Formfrei (Art. 11 OR) → ausgabeArt `fertig`, PDF+DOCX.
   Gemeinsamer OR-AT-Kern (Parteien natürlich/juristisch, mehrere
   Bevollmächtigte einzeln/gemeinsam, Substitution, Widerruf Art. 34,
   Befristung, transmortale Klausel Art. 35); besondere Ermächtigungen
   als Katalog wortlautnah zu Art. 396 Abs. 3 OR. Deterministische
   Form-Gates: Bürgschaft = SPERRE (Art. 493 Abs. 6 OR), Grundstück =
   Warnung (Art. 216 OR / Art. 86 GBV / Formfrage offen BGE 112 II 330),
   Bank = bankeigene Formulare, Prozess-Bereich = Art. 68 ZPO-Warnung,
   Vorsorgefall = Weiche zu Vorsorgeauftrag/PV (Gesundheits-Bereich
   bewusst NICHT wählbar). Ersetzt die geplanten Karten generalvollmacht/
   bankvollmacht. StPO/VwVG in fedlex.ts ergänzt (Anker art_129/art_11
   empirisch verifiziert). 20 Akzeptanztests.
8. **Klage im vereinfachten Verfahren – BS** (/vorlagen/klage-vereinfacht,
   Karte `klage-vereinfacht`) — zweite BS-Eingabe der SG-Familie
   (normverifizierter Auftrag 5.6.2026). Deterministisches BS-Routing:
   Arbeit ≤30k → Arbeitsgericht (§§ 73 f. GOG), GlG/Mitwirkung →
   Dreiergericht, Gewaltschutz/DSG/Miete-Kern → Einzelgericht (§ 71 GOG);
   ehrliche Stopps (>30k ohne Abs.-2-Materie → ordentlich; Arbeit >30k →
   § 73 Abs. 2-Hinweis; KVG-Zusatz → Sozialversicherungsgericht).
   Schwellen aus ZPO_SCHWELLEN (SSoT); Klagefrist Art. 209 Abs. 3/4 über
   die zpoFristen-Engine ('klagefrist_klagebewilligung', Gerichtsferien).
   ABWEICHUNG vom Auftrag offengelegt: Art. 114 ZPO kennt KEINE Miete-
   Position (lit. d = Mitwirkungsgesetz) → Miete im Entscheidverfahren
   nicht kostenfrei. Begründung = freiwilliger strukturierter Platzhalter
   (Behauptungs-Liste + Beweismittel) mit Verzichts-Baustein (Art. 245
   Abs. 1); Begehren beziffert/unbeziffert (Art. 84/85), Rechtsöffnungs-
   Antrag, Beilagen-Automatik (KB/Ausnahme/Vollmacht/Urkunden), Doppel-
   Hinweis Art. 131. SG-Parteitypen wiederverwendet (parteiZeilen & Co.
   exportiert). PDF+DOCX, ohne localStorage (wie SG). 20 Akzeptanztests.

Wizards 1–3 und 7 mit localStorage (`lexmetrik.vorlage.*.v1`, Hydration
array-gesichert); Vorschau als Funktionsaufruf (kein Remount). Eingaben
(4, 8) bewusst OHNE localStorage.

## PDF-Rechenbericht (src/lib/pdf/)

**Abend-Paket (5.6.2026):** Formulierungskonventionen (lib/konventionen.ts
SSoT + Linter-Test über echte Textausgabe; — → – plattformweit, «5 %»,
SG-Floskeln, Golden-Diff programmatisch als rein konventionell bewiesen).
Free-KACHELWAND (flach, FREE_REIHENFOLGE, Hero neu «Schweizer Recht,
berechenbar.»; Katalog.tsx pro-only). Versimplung: ui/Tabs + ui/
SelectionGrid (14+3 Stellen entdoppelt, SSR-byte-identisch), chf()
kanonisch, tote Katalog-Props raus (netto −175 Z.). Pro: Sektionen
starten EINGEKLAPPT, Zivilprozess & Vollstreckung zuerst. KOMBINIERTER
FRISTENRECHNER free (/rechner/tagerechner: Verfahrens-Tabs Allgemein/
ZPO/SchKG → bestehende Forms; §4 unangetastet; Trennungs-Querschnitt-
Test). Mobile-Check: Tabs-Overflow gefixt (overflow-x-auto), Grids
mobil-Basis. PROJEKTBESCHRIEB.md neu geschrieben.

**Pro-Katalog-Umbau (5.6.2026, Auftrag):** Tabs Verfügbar(17)/Gesamt(111)
(?ansicht=, Default Verfügbar), juristische Obergruppen als Super-Trenner
(lib/rechtsbereichGruppen.ts, 5er-Modell, 4er-Fallback per GRUPPEN_MODELL),
gruppierte Scrollspy-Seitenleiste (Rechtsbereich-Filter+Direkteinstieg
entfernt), Schnellzugriff ★Favoriten+Zuletzt (lib/schnellzugriff.ts,
localStorage, Stern nie auf geplant), istVerfuegbar()-Prädikat, Hero «17
sofort verfügbar». Free unverändert. BetragsFeld: Tausender-Apostroph in
22 CHF-Feldern. Visual-Checks (2 Agenten) GRÜN; P1–P3 gefixt.

**Teuerungsrechner (5.6.2026, /rechner/teuerung, Free):** LIK-Indexierung
mit amtlicher BFS-Reihe (src/data/likReihe.ts, generiert via scripts/
lik-reihe-generieren.py aus cc-d-05.02.08; 10 Originalbasen 1966–Mai 2026;
OPEN-BY). Basis-AUTO wie BFS-Rechner; Modi Indexmiete (Art. 17 VMWG
wortlaut-verifiziert, Senkungspflicht)/Unterhalt (286/128 ZGB)/generisch.
VMWG neu in fedlex.ts. MONATLICHE PFLEGE: Reihe nach BFS-Publikation
regenerieren. Eingaben: Behörden-Registry +Miete/Diskriminierung BS
(Staatskalender 5.6.2026); SG-Forum-Häkchen entfernt (Kantonswahl).

**Logik-Nachrechnung + Versimplung (5.6.2026):** 4 Cluster unabhängig vom
Code aus dem Gesetz nachgerechnet (100+ Handfälle, 6912er-Erbrecht-Gitter,
576er-ZPO≡Allgemein-Gitter): KEINE Berechnungsfehler. Offen für Davids
Entscheid: Sperrtage-ANZEIGE-Konvention (beansprucht Art.-77 vs.
Kalendertage; Endtermine identisch). Versimplung golden-bewiesen
(scripts/golden-outputs.ts, 53 Fälle byte-gleich): naechsterWerktag/
dauerTageInklusiv kanonisch, fmt/iso ×7 dedupliziert, Vorlagen-Helfer
zentral, Rückwärts-Spiegelung direkt.

**Tagerechner-P1 (5.6.2026, Auftrag «Verbesserung Fristenrechner»):**
Rückwärtsmodus (spätester Handlungstag; Verschiebung defensiv «keine»,
Vorverlegung nur mit Ungeklärt-Vorbehalt), Zustell-Helfer (rein informativ:
7-Tage-Fiktion, A-Post Plus Art. 142 Abs. 1bis ZPO), .ics-Export (RFC-5545
inkl. Folding, deterministisch) + Permalink (validiert), Validierung/A11y;
BGE 150 III 367 nachgeführt. AV/MV-Schemas: v1.1.0 (Vertiefungs-Gutachten).
Golden-Output-Protokoll: scripts/golden-outputs.ts (53 Fälle, vergleich-Modus).

**Formatvorlagen-SSoT (5.6.2026, `formatvorlagen.ts` — drei Grundlagen-
Berichte):** Typografie je Format + AUSGABE_REGELN je AusgabeArt
(abschrift = DOCX hart gesperrt · entwurf = PDF-Wasserzeichen «ENTWURF»
[VA beurkundet] · fertig). Eingaben mit Korrekturrand 3.5 cm rechts,
Anrede/Schlussformel/«im Doppel» (Rollen anrede/schlussformel);
Verträge mit Ausfertigungs-Vermerk + QES-Hinweis (Art. 14 Abs. 2bis OR).
Pro-SITZUNG (lib/proSession.ts): Pro betreten = eingeloggt (localStorage,
Reload-fest, «/»→/pro), Header «Ausloggen»; Andockpunkt Zahlungs-Gate (System offen).
Einzeilen-Heros Free+Pro; Gebiets-Titel in Sans.

**Formatvorlagen der Vorlagen-Renderer (5.6.2026, Referenz-Layouts):**
Schemas deklarieren `format` (verfuegung·vertrag·eingabe) + Absatz-`rolle`n
(absender/adressat/datumzeile/betreff/rubrum/parteien/unterschrift); PDF,
DOCX UND Live-Vorschau interpretieren beide aus EINER Quelle. Arial/
Helvetica 11, Haarlinien unter Titel/Betreff, hängende Einzüge (1./–),
gezeichnete Unterschriftslinien, Fusszeile je Seite, Disclaimer 8pt am
Ende; Eingaben OHNE Dokumenttitel (Betreff trägt ihn), langes Datum.
Engine-Konvention: Platzhalter auf …Satz/…Zeile verschwinden leer
ersatzlos (sonst «________»-Vorschau-Strich). Visuell verifiziert via
`.scratch/pdf-beispiele.ts` + qlmanage-Thumbnails.

pdfModel (reines Block-Modell: kopf/hero/tabelle/schritt/hinweisbox/norm)
+ pdfRender mit **eingebetteten Markenschriften** (Fraunces/Geist/GeistMono
als Base64-TTF, ~0.4 MB NUR im lazy Klick-Chunk). Hero-Hauptkennzahl,
Eingaben-Tabelle (Mono rechtsbündig), unzerreissbare Schritte mit
klickbaren Norm-Pills (Vormessung inkl. Pill-Umbrüchen), sichtbare URLs,
Status «Berechnung vollständig». Verzugszins + Kündigung liefern hero.
Visuelle Prüfung: qlmanage-Thumbnails + Swift-PDFKit-Split.

## Oberste Ebene: vier Output-Typen

| Sektion (`art`) | Inhalt |
|---|---|
| Fristen (`frist`) | Prozessuale und materielle Fristen |
| Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

## Grossausbau 5./6.6.2026 — Zuständigkeits-Plattform (Kurzkarte)

**Drei Rechtswege live** im Zuständigkeitsrechner (je EIGENE Engine, §4):
- **Zivil** (`lib/zustaendigkeit.ts`): 9 Streitsachen · Fahrplan + kantonale
  Kosten-Rahmen (alle 26, `data/zustaendigkeitKosten.ts`) · Art.-113-Kosten-
  freiheit · konkrete Schlichtungsstelle aller 26 Kantone
  (`data/schlichtungsstellen.ts`) mit **PLZ→Gemeinde→Amt** gemeindescharf in
  ZH/AG/SG/TG/FR/ZG/AI (`data/schlichtung/*`, amtliches swisstopo/BFS-Register,
  Generator `scripts/plz-generieren.ts`) · **Handelsgerichte** ZH/BE/AG/SG ·
  **Rechtsmittel-Modus**: Berufung/Beschwerde-Weiche (308/319 ZPO) + obere
  Instanz aller 26 Kantone (`data/obereInstanzen.ts`) + BGer-Schwellen
  (Art. 74 BGG, BGG-Cache verifiziert).
- **SchKG** (`lib/schkgZustaendigkeit.ts`): Betreibungsort-Kaskade 46–55,
  11 Anliegen (Rechtsöffnung/Aberkennung/Widerspruch/Kollokation/Arrest/
  Konkurs/Aufsichtsbeschwerde) mit Verwirkungsfristen-Badges; Gebühr
  Zahlungsbefehl nach Art. 16 GebV SchKG (Stand 1.1.2022, 2026-Vorbehalt
  im Verfallsregister); BJ-Betreibungsämter-Verzeichnis verlinkt.
- **Straf** (`lib/strafZustaendigkeit.ts`): StPO-Decision-Tree (Spezialforen
  35–37 → Tatort 31 → Kaskade 32; Weichen 33/34/38/40/41/42); Anzeige-
  Fahrplan (301; Strafantrag 3 Mt., Art. 31 StGB); zentrale StA aller
  26 Kantone + Bundesanwaltschaft (`data/staatsanwaltschaften.ts`).

**Vorlage Schlichtungsgesuch kantonsübergreifend:** Behörden-Auflösung für
alle 26 Kantone (`components/vorlagen/SgBehoerdenWahl.tsx`; Adressat-Kette
Hand > BS-Registry > Recherche > Platzhalter). **UX-Programm** (9 Etappen-
Commits) + Design-Konsistenz-Sweep abgeschlossen. **Bibliothek:** 21 Dossiers
(4 Regelwerke ZPO/SchKG/StPO/Erbrecht; Behörden Zivil/Straf/Erbgang; Kosten)
— Status je Dossier in bibliothek/INDEX.md (SSoT-Karte dort).

## Offene Punkte (nächste Session)

1. **Fachliche Abnahme durch David** (er ist die «fachkundige Person»):
   **Erste Sichtung aller 4 Vorlagen am 5.6.2026 erfolgt** (Bausteine,
   Gates, Schwellen vorläufig für gut befunden). SEIN ENTSCHEID: **alles
   bleibt `entwurf` / `verified: false`** bis zur Wort-für-Wort-
   Detailüberarbeitung («wir überarbeiten alles später»). Erst danach
   NormRefs auf verified:true und Einträge einzeln auf «geprüft» (Goldrand).
2. **Seine Antworten ausstehend:** redundante Tageszählungs-Hinweise im
   Verzugszins-Bericht kürzen? · DOCX-Standardannahmen ok (Testament ohne,
   VA nur beurkundet)? · Bausteinprotokoll in PDF/DOCX-Exporte aufnehmen?
3. ~~Phase 4: Experten-Gating als Wrapper um /fachpersonen~~ → **entfällt
   ersatzlos** (Aufhebung der Free/Pro-Zweiteilung, Auftrag David
   7.6.2026); eine spätere Monetarisierung bekäme einen neuen,
   funktionsbezogenen Zuschnitt (STRATEGIE-PLATTFORM, Gate G1).
4. **Schlichtungsgesuch:** offene Verifikationen (kantonale §§ GOG/EG ZPO/
   GGR, PLZ 4001/4051, Art.-135-Randtitel) — in der UI offengelegt.
5. Kleineres: Detailseiten-Titel (calculators.ts) an neue Katalog-Titel
   angleichen? · Datepicker-Pfeiltasten (A11y-Kür) · Markenschriften auch
   für Vorlagen-PDFs · ggf. sichtbare Rechtsgebiet-Zwischentitel in den
   Untergruppen.
6. ~~Verschlankung Stufe 2~~ → **erledigt 5.6.2026** (generischer Rahmen
   in components/vorlagen/wizard.tsx, s. oben). Optional verbleibend:
   Form-Gate-Sektion (brass-Box mit Checkliste) als vierte geteilte
   Komponente — Texte sind je Vorlage fachlich verschieden, daher bewusst
   zurückgestellt.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur bei klar regelbasiertem, deterministischem Umfang — sonst
Widerspruch zu «feste Rechenregeln, keine Schätzung»: Konsumkredit-Widerruf
(Anwendungsbereich klären) · Schadenersatz/Genugtuung · Unterhalt ·
Tagessatz · Mietzinsherabsetzung · Konkurrenzverbot (alle wertend/Ermessen).
