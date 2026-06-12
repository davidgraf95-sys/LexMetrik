# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Dokument-Ordnung im Root (Aufräumung 10.6.2026, Auftrag David):** Im Root
liegen nur AKTIVE Steuerungsdokumente — CLAUDE/README/STRUKTUR/HANDLUNGSPLAN,
Projekt- und Strategie-Papiere (PROJEKTBESCHRIEB, STRATEGIE-PLATTFORM,
WACHSTUM-REGLEMENT, BETRIEB, KATALOG-ROADMAP, ABNAHME-AG-BAUSTEINE) und die
laufenden Fahrpläne (GRUNDLAGEN, DESIGN, VEREINHEITLICHUNG, AG-/GMBH-
GRUENDUNG). Abgeschlossene Fahrpläne und historische Dokumente liegen in
**`archiv/`** (Index: `archiv/README.md`; Dateinamen unverändert, damit
Verweise in Code-Kommentaren per grep auffindbar bleiben). Wissens-Quellen
(PDF/DOCX, gitignored) in `bibliothek/quellen/` (`SICHTUNG.md`).

**Pflegeregel Session-Karten (Token-Disziplin 11.6.2026):** Dieses Dokument
wird in jeder Session und jedem Subagenten gelesen — Karten abgeschlossener
Sessions (älter als ~2 Arbeitstage) wandern darum BYTE-GENAU nach
`archiv/STRUKTUR-SESSIONKARTEN.md` (neue Blöcke oben anhängen); hier bleibt
der Verweis-Abschnitt. Offene Abnahmen sind davon unberührt (Spiegel:
`HANDLUNGSPLAN.md`).

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
**Push + Deploy: von David beauftragt — Vollzug siehe BETRIEB/Deploy-
Protokoll dieser Session.**

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

## Session 11.6.2026 früher Abend — durchblick.nl-Sichtung + KVG-Preset Krankenkasse (Entscheid David, ungepusht)

**(1) Konkurrenz-Sichtung** (`9c007af`): Sieben Offline-Rechner-ZIPs von
David geprüft — KEINE Übernahme (Gerichtskosten = Zürcher Basistabelle ×
geschätzte Kantons-Multiplikatoren, Anwaltskosten «10-15% of Streitwert»:
§2-Gegenmodell; wo seriös, ist der eigene Bestand stärker; fremdes Werk).
Befund in bibliothek/recherche/durchblick-nl-sichtung.md; bestätigt
Nachfrage für `prozesskosten` (Roadmap Prio 1, Entscheid offen).
**(2) KVG-Preset «Krankenkasse (Grundversicherung)»** in Maske 3
(`5790fc2`, Entscheid David nach Befund-Optionen): §7-Recherche zuerst —
KVG/KVV am Filestore 20260101 zeichengenau (beide OHNE -N-Suffix, neuere
Daten nur SPA-Shell; Dossier kvg-grundversicherung-kuendigung.md,
Quellen-Register + fedlex-cache.sh erweitert). Drei regime-treue Pfade:
Prämienmitteilung (Art. 7 Abs. 2 KVG, 30.-November-Fall) · ordentlich
Semesterende (Abs. 1) · Jahresende bei besonderer Form (Art. 94 Abs. 2/
100 Abs. 3 KVV); Nahtlos-Klausel (Abs. 5) in jedem Brief. Gates:
Ausstands-Sperre 64a Abs. 6 als Warnung, Termin-Hinweise, Koppelungsverbot
Abs. 7/8. Schema 1.0.0→1.1.0 deklariert; kein Golden-Fall betroffen
(IDENTISCH 104). norm-zitate-pruefen.ts neu mit kuendigungAllgemein.ts +
VVG/KVG/KVV (616 Zitate, 0 Befunde). Tore: gate voll GRÜN; empirisch im
Dev-Server verifiziert (Playwright: Kachel, Norm-Pill-Link, Vorschau-
Umschaltung). **Abnahme Art. 7 KVG durch David offen (verified: false).**
**10 Commits ungepusht — Push/Deploy nur auf frisches Ja (§9).**

## Session 11.6.2026 später Nachmittag — Token-Disziplin (Aufträge David, ungepusht)

**(1) Quiet-on-Green Gate-Wrapper** (`ab1fdd6`/`8202aab`/`8c4e809`, Auftrag
AUFTRAG-gate-wrapper.md): `npm run gate` (Fünferkette) / `gate:schnell`
(tsc·vitest·golden, ~7 s) — bei Grün ein Einzeiler pro Tor, volle Ausgabe
NUR für rote Tore; §6 Ziff. 1 zeigt auf den Wrapper; Rot-Pfad empirisch
belegt. **(2) Token-Fahrplan** `FAHRPLAN-TOKEN-DISZIPLIN.md` («freie
Fahrt»): T-1 `npm run golden:diff -- <id>` = Fall-Diff statt 11'900-Zeilen-
JSON, dazu Schutz-Fund gefixt — unbekannte Argumente an `npm run golden`
überschrieben bisher STILL die Basis (`ffeb549`) · T-3 §6 Ziff. 5
Diagnose-Sparsamkeit (`776ecc5`) · T-4 STRUKTUR-Rotation 826→587 Zeilen,
Chronik byte-genau (Rekonstruktions-Assert) nach
archiv/STRUKTUR-SESSIONKARTEN.md, Pflegeregel im Kopf, Verifikationsstand-
Zeile aktualisiert (`e8d3802`) · T-2 Stop-Hook `gate-stopp.py`: fährt
gate:schnell nativ nach jeder Antwort, Grün = 0 Tokens, Rot blockiert
EINMAL mit voller Ausgabe; Anlage durch David selbst (Permission-Classifier
liess Hook-/Permission-Schreiben durch die Session zweimal nicht zu),
Empirie 4/4 Pfade (`e164491`). Kein Tor abgeschwächt. Beginn der Session:
READ-ONLY-Repo-Inspektionsbericht für das Loop-Setup (Plan-Datei).
**7 Commits ungepusht — Push/Deploy nur auf frisches Ja (§9).**

## Session 11.6.2026 abends — Klage-Befunde David: Instanz-Hinweis + Kopf-Layout (DEPLOYED)

**(1) «nimmt standardmässig obere kantonale Instanz» (`b06a823`):** Root
Cause war KEIN Datenfehler — in OW/NW/GL/ZG/SH/AR heisst die ERSTE Instanz
amtlich «Kantonsgericht» (Dossier gerichtsbehoerden-kantone.md Z. 12);
neues Feld `namensHinweis` in data/zivilgerichteErstinstanz.ts, KvGericht-
Wahl zeigt die Offenlegung als Warn-Notiz (wirkt KV+KO). TDD rot→grün.
**(2) «Adresse der klagenden Partei zuoberst» (`323430d`):** Entscheid
David per Vorschau-Auswahl: **Gericht zuoberst, Parteien+Vertretung nur im
Rubrum** — Absender-Bausteine in ALLEN drei Eingabe-Vorlagen entfernt
(SG BS = bewusstes Abnahme-Delta; Muster-Dossier-Punkt 1 damit überholt,
Wortlaut-Hoheit David). Golden vorl:sg/vorl:ko deklariert neu, 1 SG-Test-
Assertion deklariert umgestellt. Prod `323430d` live (Hash live=lokal,
Instanz-Hinweis ZG empirisch).

## Session 11.6.2026 nachmittags — SSG/SEO-Umbau DEPLOYED (Auftrag + Freigaben David)

**Auftrag `claude-code-auftrag-ssg-seo.md` komplett umgesetzt und LIVE**
(Push origin/main = `58eaa7c`, Prod lexmetrik.vercel.app, Asset-Hash
live=lokal, LCP 184 ms): Build-Zeit-Prerender im bestehenden Vite-Setup —
alle **38 öffentlichen Routen liefern volles HTML ohne JS** mit
individuellem Titel/Description/Canonical/OG + JSON-LD (WebApplication je
Karte, WebSite+Organization auf /), `sitemap.xml` (38 URLs) + robots-
Verweis. Architektur: `lib/seo.ts` (§5-Quelle, SITE_URL = EINZIGER
Domainwechsel-Wert) · `entry-server.tsx` ZWEI-PASS (prerender wärmt
lazy-Caches, renderToString liefert script-freies HTML — Reacts
$RC-Suspense-Scripts kollidierten mit der CSP, Prod-Befund gefixt
`58eaa7c`) · `scripts/prerender.ts` als dritter Build-Schritt mit
Drift-Toren (404/Stub/Script/Fallback/Zähler 38) · `RouteMeta` führt den
Head bei SPA-Navigation nach · flache `<pfad>.html` + vercel.json
cleanUrls/trailingSlash:false/Fallback-Rewrite `/app` (noindex-Hülle).
`main.tsx` UNVERÄNDERT (render-then-replace statt Hydrate — Begründung
docs/ssg-diagnose.md). Doku: `docs/ssg-diagnose.md` + 
`docs/ssg-umbau-protokoll.md`. **§9-Bug-Check** (6 Strang-Finder × 2
adversariale Lupen über a7adb98..HEAD): 10 bestätigte Befunde, ALLE
gefixt (`9858c14`, `687fe58`) — darunter 2× MITTEL BGer (kantonale
Stimmrechtssachen ohne Stillstand Art. 46 II lit. c als neuer Sonderfall;
Art.-98-Warnung nicht bei Haftsachen) + Permalink-Nachzug + KV-Platzhalter-
Beilagen-Leak + 3× §3-Defense-in-depth. §12-Vorfall: Parallel-Session
(Schlichtung) erzwang Worktree-Etappen E3–E6 (Branch ssg-seo, gemergt
`1e1a44a`). **Zefix-UID Z1/Z1b DEPLOYED (gleiche Session, Push `8c691f3`):**
UID-Feld (lib/uid.ts: eCH-0097-Prüfziffer, rein §2) + ZefixSuche-Baustein
(ERSTER externer Request des Produkts, NUR auf Klick; CSP connect-src +
zefix.ch; Datenschutz-Offenlegung Abschnitt 2 — Wortlaut-Abnahme offen)
in den Behördeneingaben (ParteiEditor KV/KO + Schlichtungsgesuch BS);
Suche per Firma ODER UID, Übernahme füllt Firma/UID/Strasse/PLZ/Ort aus
dem Register (Detail-API; Dossier bibliothek/recherche/zefix-api.md).
Prod-verifiziert (UID-only → Migros + Limmatstrasse 152, 0 CSP-Fehler).
OFFEN Z2: Rollout auf Verträge/Kündigungen/Mahnung/Vollmacht/Gründungen.
OFFEN: fachliche Abnahme der §7-Abweichungen (Stimmrechts-
Sonderfall, Art.-98-Gate, Mahnungs-Blocker) · TODO(David): statische
Meta-Descriptions, Kündigung-Titelwahl, og:image · **iCloud synct das
Repo und legt Konfliktkopien in dist/ an (empirisch belegt) — Repo aus
dem Sync nehmen oder dist/.nosync setzen** · Zefix-UID-Feld mit
Auto-Lookup für juristische Personen (Entscheid David, nächste Etappe).

## Session 11.6.2026 vormittags — Abnahme Design · Mahnung · BGer-Rechtsweg · Trio-Nachzug (Aufträge David)

> **GEPUSHT + DEPLOYED 11.6.2026 mittags (Ja David «bug check push und
> deploy»): origin/main = `91dde33`, Prod-Deploy
> `dpl_3uCHqYuNGrD1etvWCLSDyN4fWQMx` via /tmp-HEAD-Worktree; Asset-Hash
> live = lokal (`index-BG0IjHoG.js`), 8/8 Kernrouten 200 (inkl. neu
> /rechner/bgg-fristen + /vorlagen/mahnung). §9-Bug-Check: 3 unabhängige
> Lupen über das 17-Commit-Delta, 0 HOCH, 9 MITTEL + 6 NIEDRIG alle
> gefixt (`cf16b9b` — u. a. Art. 93 lit. b kumulativ, Art. 51 lit. a/b/c
> je Objekt, Art. 103 Abs. 2 vollständig, verwaistes vorsorglich-Flag
> SchKG-Aufsicht, Render-Crash bei ungültigem Speicher-ISO);
> Empirie-Lupe 173/173 Konstellationen handgerechnet. Dazu (5) BGG in
> die drei Rechtsmittel-Fahrpläne verdrahtet (`2cfeff8`, Auftrag David):
> Zivil-Schritt 4 zeigt Abteilung + Prefill-Brücke in den BGer-Rechner;
> SchKG-Beschwerdeweg/Rechtsöffnungs-Falle + Straf je mit Brücke
> (BGER_LINK_SPEC zentral in rechnerPermalinks.ts). Der spätere
> SO/NE/BL/VS-Stand der Parallel-Session (`40fb888`) ist NICHT in diesem
> Deploy.**

**(1) Design-Abnahme:** `abnahme/design-2026-06/RECHNER-EINHEIT.md` E-1–E-5
durch David ABGENOMMEN (ohne Auflagen, `0b83423`) — R1–R12 verbindlich.
**(2) Vorlage Mahnung & Inverzugsetzung** (`c2a0572`, Quick-Win B.9 — damit
alle 4 Quick-Wins gebaut): EINE Maske `/vorlagen/mahnung`, Varianten
Zahlungs-Mahnung (Art. 102 Abs. 1/104 OR; Verzug AB ZUGANG ausdrücklich,
§5-konsistent mit verzugszins.ts; Verfalltag-Weiche 102 II mit Zins ab
Folgetag; G-Mahngebühren) ↔ Nachfristansetzung (Art. 107, Wahlrechts-
Vorbehalt; Entscheid 7.6.: Inverzugsetzung = Variante). OR-Wortlaute
102/104/107/108 am Cache verifiziert; Katalog 35/31.
**(3) BGer-Rechtsweg** (`f443dd5`, Auftrag «recherche … handlungsplan …
umsetzen»; `FAHRPLAN-BGER-RECHTSWEG.md`): EIGENE Engine
`lib/bgerRechtsweg.ts` (§4-Entscheid: BGG-Regime quer zu ZPO/SchKG/StPO;
bestimmeRechtsmittel unangetastet) + Rechner `/rechner/bgg-fristen`
(Karte bgg-fristen entwurf; 3. prozessuales Fristen-Regime; Katalog 36/32).
Dossier am Cache 20260401 nachverifiziert; **BGerR neu gepinnt**
(Art. 33/34/35/35a/36 zeichengenau; Rechtsöffnungs-Falle 33 lit. i;
2 Straf-Abteilungen seit 1.2.2026). Alle 4 Beschwerdewege, Fristen-Matrix
30/10/5/3/jederzeit + Stillstand 46 inkl. aller Abs.-2-Ausnahmen +
konkretes Fristende (Kantons-Werktagsregel 45 II), Art. 74-Schwellen mit
Abs.-2-Ausnahmen, subsidiäre VB, Eheschutz NUR als Warnung (V-1).
Anschlüsse additiv: bestimmeRechtsmittel.bgerAbteilung (B.5a),
strafRechtsmittel-Hinweis präzisiert. Golden 104 (deklariert +10 / 2).
**(4) Trio-ErgebnisBlock-Nachzug** (`4e6d4b1`, E-4): 5 Hand-Wrapper auf den
geteilten Rahmen, Golden byte-gleich, e2e 33/33.
OFFEN: fachliche Abnahme (Mahnungs-Bausteine; BGer: Eheschutz-Weiche +
Hinweis-Texte + 7 Dossier-Fragen-Antworten als Vorschlag) · Push/Deploy
nur auf frisches Ja.

## Session 11.6.2026 über Nacht — Rechner-Design-Vereinheitlichung D1–D6 (Auftrag David, ungepusht)

Regelwerk **`DESIGN-REGLEMENT-RECHNER.md` (R1–R12)**: verbindlicher Aufbau
jeder Rechner-Seite (Kopf → Rückverweis → Werkzeug-Karte → Ereignis-Sektion →
Themen-Einstieg) und jedes Formulars (Disclaimer → Preset → Eingaben →
Erweitert → FehlerBox → Ergebnisblock), Ergebnisblock-Skelett (Eckdaten mit
Akzent auf dem massgeblichen Wert → ErgebnisAnzeige → Kalender/Timeline →
Begründung → Aktenzeichen → Export-Zeile PDF→ICS→Teilen → Quellen-Mikrozeile),
Rechtsinfo-Hierarchie (R6) und abschliessende Ausnahmen (R12). Umsetzung über
alle 16 ergebnistragenden Formulare (`FAHRPLAN-RECHNER-DESIGN.md`, Commits
`2cd3791`/`ff5bbb4`/`fcd2c38`): neue §10-Bausteine **`ErgebnisBlock`**
(id · lc-reveal · EINE aria-live-Region · ErgebnisSprung · LiveHeader) und
**`ThemenEinstieg`**; EckdatenKachel mit `akzent`-Prop; Doppel-aria-live der
ErgebnisAnzeige aufgelöst. §6-Beweis: Golden 88/88 byte-gleich · e2e 33/33 ·
smoke ok. Abnahme-Grundlage mit Screenshots vorher/nachher + Entscheid-Posten
E-1–E-5: `abnahme/design-2026-06/RECHNER-EINHEIT.md` — **ABGENOMMEN durch
David 11.6.2026 ohne Auflagen** (R1–R12 verbindlich, Trio-Nachzug
freigegeben). Zuständigkeits-Trio bereits regelkonform (Referenzmuster);
dessen rein kosmetische ErgebnisBlock-Adoption war §12-zurückgestellt,
Nachzug seit der Abnahme freigegeben.

## Ältere Session-Karten und Chroniken — rotiert ins Archiv

Verbatim verschoben nach `archiv/STRUKTUR-SESSIONKARTEN.md`
(FAHRPLAN-TOKEN-DISZIPLIN.md T-4, 11.6.2026): Sessions 10.6. abends
(STRUKTUR-UMBAU S-1–S-6) und nachmittags (Fristen-Einheit FE-1–FE-6) ·
7.6. abends (Betreibungsamt-Finder) und nachts (Plan 9b Volldokumente) ·
6.6. abends und nachmittags · Verschlankung 5.6.2026 ·
Session-Abschluss 6.6.2026.

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

## Session-Karte 11.6.2026 (Tag, Session «Schlichtung fertig + Vollerhebungen»)

**Schlichtungs-Matrix komplett (alle 26 Kantone, alle drei Typen):**
- **VD** (de677e0): Streitwert-Weiche Art. 41 CDPJ (JdP <10k · Präsident TA 10–30k · TA >30–100k · Chambre patrimoniale >100k; LOJV/AAJTJ wörtlich) + Arbeitskaskade LJT (prud'hommes ≤30k) + GlG; 9 JdP + 4 TA + Chambre verdrahtet (300/300 Gemeinden).
- **TI** (f306f6e): amtliche Località-Suche vollerhoben — Circoli Ticino/Giubiasco existieren amtlich nicht mehr; 38 Circoli, 97 Gemeinden auto + Ortsteil-Wahl Lugano/Lema/Tresa (ZH-Kreis-Mechanismus wiederverwendet).
- **SO** (45d31fe): § 5/§ 10-GO-Weiche («gleiche Gemeinde?» → Friedensrichter, sonst AGP-Auto 104/104); GlG-Eigenstelle §§ 34bis (40fb888).
- **VS** (5d31de9): alle 122 Gemeindeverwaltungen einzeln erhoben (Juge-de-commune-Anlaufstellen; Blatten c/o Wiler).
- **Miete** (d836a20, 1b5faae): 11 Auto-Register (ZH/BE/SO/JU/VD/FR/GR/SZ/AG/SG/TG — 147 Stellen, 1'215 Zuordnungen; FR-Korrektur: 3 Kommissionen statt je Bezirk; TG 80/80 kommunal; Moutier→Delémont) + 13 zentral + NE-Wahl; **TI einziger ohne Auto (Gebiete amtlich nicht gemeindescharf)**.
- **GlG** (92b5a50): alle 26 wörtlich am Erlass — 22 konkrete Stellen (BE-Konzentration Fünferbesetzung · GE gekreuzte Parität · ZG SB Arbeitsrecht), Fallback nur UR/OW/NW/GL.
- Generator: XX-MIETE-Register + generischer BFS-Level-2-Join + Parser-Härtung (Folge-Befund zu B1: ALT-Sektionen hätten AI korrumpiert).

**Ausserdem:** Begründungs-Wahl Maske/Platzhalter in Klage ordentlich/vereinfacht + SG (58f17e7) · Dossier Klageschrift-Gliederung (84f5e31; Davids Triade bestätigt, 2 Schnitt-Varianten) · Handeingabe-Kacheln entzerrt (7c5bfd3) · 3 Bug-Check-Lupen-Runden, alle Befunde gefixt (u. a. TG-Quell-Tippfehler Felben-Wellhausen, stale-Adressat-Härtungen).

**OFFEN (Merkpunkte David):** TI vertiefen (Miete-Uffici gemeindescharf; Anfrage/Karten-Erhebung) · ZH Stadt: Kreis→Schlichtungsstelle AUTOMATISCH (statt Dropdown; PLZ→Kreis-Quelle erheben) · Abnahme-Welle (Lunch; Paket Tagerechner in .scratch/) · Gliederungs-Entscheide O07/V1-V2/K08 · Teil D. ~16 Session-Commits ungepusht — Push/Deploy nur auf frisches Ja.
