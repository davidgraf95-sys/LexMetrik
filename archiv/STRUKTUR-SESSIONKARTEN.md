# Archiv — rotierte STRUKTUR.md-Session-Karten

**Angelegt 11.6.2026** (FAHRPLAN-TOKEN-DISZIPLIN.md T-4): STRUKTUR.md wird in
jeder Session und jedem Subagenten gelesen; abgeschlossene Session-Karten
wandern darum BYTE-GENAU hierhin (Inhalt unverändert, nur verschoben).
Reihenfolge wie in STRUKTUR.md vor der Rotation (neueste zuerst). Künftige
Rotationen hängen NEUE Blöcke direkt unter diesem Kopf an.

---

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

## Session 10.6.2026 abends — STRUKTUR-UMBAU S-1–S-6 (Auftrag David)

**`FAHRPLAN-STRUKTUR-UMBAU.md` komplett umgesetzt** (10 Commits ab
`f7bbf07`; jede Etappe golden-gegated 87/87 byte-gleich): **S-1**
Deckblatt-Kacheln ganz klickbar (gestreckter Klickbereich, Direktlinks
separat) · **S-3** Zuständigkeit VIERTEILIG — Zivilprozess · Vollstreckung
(SchKG) · Strafverfahren · Verwaltungsverfahren (geplant, ehrlich) als
eigene Felder (`lib/zustaendigkeitKategorie.ts`; Kopf-Titel je Rechtsweg
via titelOverride; übersteuert E2-Konsolidierung; Zähler 33/29) · **S-2**
Vorlagen in FÜNF Gruppen (Behördeneingaben [Rubriken: Klagen allgemein =
Schlichtungsgesuch/vereinfacht/ordentlich (neu, geplant) · Klagen
besondere Konstellationen nach klageGebiet · Gesuche & sonstige Eingaben]
· Verträge · Einseitige Willenserklärungen [vorher korrespondenz; +
Vollmacht] · Gesellschaftsrecht · Vorsorge & Nachlass;
`lib/vorlagenKategorie.ts`) · **S-6** Gebühren zweigeteilt
prozessual/materiell + Hilfsrechner (`lib/gebuehrenKategorie.ts`, beide
Rubriken explizite Listen) · **S-5a** EINFACHER Fristenrechner zuoberst im
Tagerechner (Datum · Frist · Ferien-Wahl keine/ZPO/SchKG; reine
Engine-Komposition, Annahmen offen; `EinfacheFristForm.tsx`) · **S-5b**
Fristen-Kategorie prozessual (zpo/schkg) / materiell (5 Regimes) ·
**S-5c FRISTENSPIEGEL AUFGELÖST** — Ereignis-Blöcke
(`EreignisFristenSektion`, ex-FristenspiegelForm) leben in den
Fach-Rechnern (ZPO: Zivilentscheid+Klagebewilligung · SchKG:
Zahlungsbefehl · Erbrecht: Erbgang · Kündigung: 336b mit
Live-Beendigungs-Vorgabe via onBeendigung · Mietrecht zeigt 273-Fristen
selbst); `/rechner/fristenspiegel` = Redirect mit Query-Weiterreichung
(`FristenspiegelRedirect.tsx`; lib/fristenspiegel-Engines + Tests
UNVERÄNDERT) · **S-4** Zuständigkeit→Vorlagen-Sprung: SG-Brücke auf ALLE
Kantone (Kanton/PLZ/Gemeinde als Schlüssel → Vorlage setzt Adresse der
zuständigen Stelle als Adressat, `sgPrefillOrt`/`SgBehoerdenWahl`-
Startwerte); geteilter `VorlagenSprung`-Block in SchKG-/Straf-Rechtsweg.
**Bug-Check §9 (3 Lupen Code/Empirie/fachlich): 0 HOCH, 5 MITTEL + 6
NIEDRIG — alle gefixt** (`ce30b37`; Empirie: 10 Konstellationen
handgerechnet, 6/6 FSP-Round-Trips, Sweep 14'448 Komb.). Abnahme David
offen: Gruppen-/Rubrik-Zuordnungen S-2, prozessual/materiell S-5b/S-6
(Wackelkandidaten im Lupen-Bericht), WARUM-Sätze, Verwaltungs-Engine-
Priorität.

## Session 10.6.2026 nachmittags — Fristen-Einheit FE-1–FE-6 (DEPLOYED)

**Deployed + gepusht bis `a7adb98`** (Davids Ja «bug check und push und
deploy»; Asset-Hash live=lokal ✓, 7 Routen 200; **erster gelungener Push
seit dem PAT-Blocker: origin/main = a7adb98, 62 Commits** — CI-/Normen-
Monitor-Erstlauf auf GitHub noch zu verifizieren, Repo privat). Inhalt:
FAHRPLAN-FRISTEN-EINHEIT FE-1–FE-6 komplett — EIN Fristenrechner-Erlebnis:
Fristen-Kategorie mit zwei Haupteinstiegen + «Eigenes Regime»-Zeilen
(lib/fristenKategorie.ts; WARUM-Sätze = fachliche Aussagen, **Abnahme
David offen**) · Regime-Frage mit Weiche (Betreibungssache → Zivilgericht/
ZPO → sonst Allgemein; ehrliche Zeile «Nicht abgebildet: StPO/VwVG/BGG») ·
Preset-Such-Index über alle Regimes (lib/presetIndex.ts, 69 Einträge,
Round-Trip-getestet; SCHKG_LINK_SPEC geteilt in rechnerPermalinks.ts,
fristnatur-Sechserliste als deklarierter Fix) · Abzweigungen in beide
Richtungen · Mietrecht-Eckdaten auf EckdatenKachel (byte-identisch) ·
Goldliste +7. §9-Bug-Check (3 Agents) fixte 2 HOCH (Teilen-Klick
remountete die Tagerechner-Form; Weiche schickte StPO/VwVG/BGG-Fristen in
den ZPO-Stillstand). Details: FAHRPLAN-FRISTEN-EINHEIT.md.

**Voll-Audit 5.6.2026** (4 parallele Agenten: Engines, Vorlagen, UI, Daten/Infra):
Fixes `21446ac`…`b8c9312` — PDF-Freitext-Datumsverdrehung (H1), Block-
Seitenüberlauf (H2), Testament-Quoten, PV-R6-Normalisierung, Mietvertrag-G3,
sperrfristen-Union bei Nichtigkeit, tsconfig strict, fedlex-Kombi-Anker.
Offen (UX-Politur, kein Output-Fehler): stabile Keys in 7 Listen-Editoren.

**Stand:** 5. Juni 2026 — deployed bis `1a69a93` (… + Katalog-Ausbau
Free/Pro 111 Karten, Vorlagen 5+6 Arbeits-/Mietvertrag, Formatvorlagen-
Renderer, Tagerechner; Bug-Check: 2 Review-Agents, 1 HOCH-Befund
Toggle-Kopplung gefixt).
**Produktion:** https://lexmetrik.vercel.app (Vercel-Projekt `lexmetrik`;
`legal-calc.vercel.app` = 308-Redirect). Marke: **LexMetrik** (grosses M).

## Session 7.6.2026 abends — Betreibungsamt-Finder (Auftrag David, ungepusht)

Auf Davids Frage zum EasyGov-Finder («kann ich das?») + «bau»: **Recherche-
Dossier** `behoerden/betreibungskreise-kantone.md` (52 Agents, je Kanton
adversarial: 10 Einheitsamt · 10 Bezirks-/Regional · 2 Gemeinde · 4 gemischt;
Negativbefund: kein offenes Bundes-Verzeichnis, EasyGov-Detail-API geschützt) ·
**Datenschicht** `data/betreibungsaemter.ts` (einheitsamt/kreise/verzeichnis,
§8) + `data/betreibung/` (Resolver + Gemeinde-Karten 8 Kt./981 Gemeinden,
gegen swisstopo-Register normalisiert; ZH-Städte → Stadtkreis-Listen 12/3) ·
**UI** SchKG-Rechner Sektion 3b (PLZ→Kanton+Gemeinde) + Amts-Anzeige in der
Forum-Karte (EasyGov bleibt Zweitweg). Extraktion per Workflow, Adress-
Stichproben durchwegs zeichengenau bestätigt. Bug-Check §9 (2 Agents): 1 HOCH
gefixt (3b-Ortshinweis folgt jetzt der Engine-Weiche — Grundpfand=Grundstücks-
ort, nicht Wohnsitz). **Etappen 1–3 FERTIG (Commits `bb3adba`…`ae8730f`):**
13 Kantone gemeindescharf (ZH/FR/SO/AR/GR/TG/TI/VD + ZG/UR/SZ; 130 Kreis-Ämter,
Karten 11 Kt.), 10 Einheitsämter direkt, BE/VS Dienststellen-Liste, **LU/AG/SG
bewusst Verzeichnis-Link (§8: keine belastbare amtliche Gesamtliste — LU
Verbands-Plattform/Fusionen, AG ~14/19 Kreise [Verbands-URL tot], SG
Negativbefund)**. 26 Akzeptanztests; Suite 1090. PFLEGE: ZH-Kreis-
Reorganisation in Vernehmlassung (Verfallsregister halbjährlich); BE «Avenir
Berne romande» (Moutier 1.1.2026); ZG-PDF Stand 2/2023.
**OFFEN: Davids fachliche Abnahme · Push/Deploy-Ja · Verbesserungspotential**
(siehe Memory/HANDLUNGSPLAN): LU/AG/SG-Vollerfassung wenn amtliche Liste
verfügbar; SG-Gemeinde-Vollerfassung (~75 dezentrale Adressen); PLZ-Feld
in 3b könnte die Gemeinde-Mehrdeutigkeit (mehrere Gemeinden je PLZ) als
Auswahl statt Hauptgemeinde-Default anbieten.

## Session 7.6.2026 nachts — Plan 9b VOLLDOKUMENTE Gründung (Aufträge David, ungepusht)

**Wortlaut-Dossier** `recherche/gruendungsdokumente-wortlaute.md` (4 Muster-
Sweeps: EHRA/ZH/SG/GL + Zeichnungs-/Erklärungs-/Anmeldemuster, alles lokal
geparst; Norm-Kerne am OR-Cache 1.1.2026 — Anweisung David: NEUSTES Recht;
§7-Korrektur: Art. 806b OR gilt weiter, gmbh-gruendung.md berichtigt). ·
**GmbH-Dokumentmappe** (`lib/vorlagen/gruendungGmbhDokumente.ts` + Komponente):
Statuten + Errichtungsakt als ENTWURF-Gate (§8), Wahlannahme/Domizil/
Beschlüsse/HR-Anmeldung druckfertig; Dokument-Auslöser aus
gruendungsunterlagen.ts (§5); Gates 773/774/777 II/795 II; Erstausbau nur
Bargründung CHF (ehrlich gesperrt sonst). · **AG-Dokumentmappe** analog
(`gruendungAgDokumente.ts`): VR-Protokoll als Pflichtbeleg, Teilliberierung
632 (≥ 20 %/≥ 50k-Gates), Vinkulierungs-/701d-Klauseln. **PERFEKTIONS-
PROGRAMM 7.6.2026 ABGESCHLOSSEN** (Auftrag David; Detail
FAHRPLAN-AG-GRUENDUNG.md, alle Normen am OR-/HRegV-Cache): Stufe-2-
Kombinationen frei (qualifiziert+FW in Kapitalwährung · Agio voll bei
Teilliberierung · Wert-Gates auf Ausgabebetrag · gemischte
Teilliberierung) · Inhaberaktien-Weiche (622 1bis/2bis, Gates 683/685a) ·
Statuten-Zusatzklauseln (Schiedsklausel 697n, Kapitalband 653s ff.,
bedingtes Kapital 653 ff., Stichentscheid-Abwahl, erstes GJ) ·
Unterschriftenblatt (Art. 21 HRegV) in jeder Mappe · ZIP-Sammeldownload
(PDF+DOCX, fflate) · localStorage-Persistenz mit Hydration-Guards ·
Vorschau-Wahl/Musterdaten/Schritt-Feldmarkierung · Notariatsgebühren
kantonsabhängig (lib/notariatsgebuehrenGruendung.ts, ZH/BE/LU/SG/BS
deterministisch, AG nach Aufwand; Dossier kosten/) · Abnahme-Dossier
ABNAHME-AG-BAUSTEINE.md (scripts/abnahme-ag.ts, 194 Bausteine, 13
Schemas — Davids Wort-für-Wort-Abnahme) · Kantonsvergleich SG/GL
(kantonsneutral bestätigt) · HR-Ämter-Adressdossier 26 Kt. Sweep-Stufe-
2-Strang (3264 AG-Komb., Exit-Fix) + Golden 87. Sammel-Bug-Check §9:
2 MITTEL gefixt, 0 HOCH. OFFEN: Stimmrechts-/Vorzugsaktien/PS
(Zwei-Kategorien-Kapitalmodell, Davids Entscheid) · arithmetische
Sweep-Geld-Invariante · Erstrecherche-Verifikationen Notariatstarife. · **Notariate je Kanton** (Auftrag David): Dossier
`behoerden/notariate-kantone.md` + Stammdaten `lib/notariate.ts` + Link-Box
in beiden Masken (SH-Sonderregel: HRegA beurkundet; UR/AI/BL «ohne Gewähr»).
· **Bug-Check §9 bestanden:** Code-Agent (2304 Kombinationen empirisch,
0 HOCH) + Jurist-Agent (1 HOCH: 805-V-Ziff.-2bis-Anker → 701d, gefixt;
M-Befunde eingearbeitet: Wahlannahme-Index-IDs, 626-Ziff.-3-Einlagebetrag,
Begründungs-Klarstellungen, CHF-Placeholder). Tests 975 grün (+22 neu),
tsc/Lint/Build sauber. Katalog: beide Gründungs-Karten neu mit
output pdf+docx. · **Kapitalerhöhung 9c GEBAUT** (gleiche Nacht): Dossier
`recherche/kapitalerhoehung-wortlaute.md` + Maske
`/vorlagen/kapitalerhoehung` (AG/GmbH-Schalter; Beschluss-/Feststellungs-
Urkunden ENTWURF, Zeichnungsscheine/Bericht/Anmeldung fertig;
6-Monats-Verfalls-Gates; 781-Verweisketten; Katalog 35). Bug-Check §9:
2 Agents, 0 HOCH, M/N-Befunde eingearbeitet; 985 Tests grün.

## Session 6.6.2026 abends (`8652e6b`…`4781ca7`, Aufträge David — ungepusht)

**Art.-63-SchKG-Doppelfix** (fristenEngine.ts): (1) Fristende Sa/So unmittelbar
vor Betreibungsferien — Werktagsverschiebung führte IN die Ferien (Repro
13.7.2024 → 15.7. statt 6.8.); (2) Review-Befund M-1: 3. Werktag nach
Ferienende kann in separaten Rechtsstillstand fallen → Normalisierung jetzt
Schleife bis stabil. 5 Regressionstests, Wortlaut am Cache. ·
**Feiertage-Doppelcheck 26/26** gegen die BJ-Liste (eigenständig am PDF):
7 Korrekturen (LU-Berchtold, GL-Allerheiligen, GL/VS-Stephanstag,
JU-Pfingstmontag, FR-Empfängnis, AI-Mauritius), **bedingte Feiertage** als
`giltImJahr` (NE-Fn.-10, UR/AR/AI-Fn.-1/7/9), **Näfelser-Fahrt-Karwoche-
Regel** (2026: 9.4.!); 2 Alttests trugen die falsche Matrix (deklariert
korrigiert); Regelwerk `bibliothek/normen/feiertage-kantone-bj.md`. ·
**Katalog-Split Zuständigkeit:** eigene Gebiets-Einstiege schkg-/straf-
zustaendigkeit (Hash-Vorauswahl #schkg/#straf, Muster Kuendigung;
istVerfuegbar 21→23). · **Rechtsmittel-Fahrplan (Zivil):** bestimmeRechtsmittel
mit Objekt-/Verfahrens-/Vorinstanz-Weichen (308/319/314 Abs. 2 Rev. 2025!/
321/145 Abs. 2 lit. b ZPO · 74/75 Abs. 2/46 Abs. 2 lit. a/92 f./98/100 BGG),
strukturierte Fristen je Ebene (Tage + Stillstand), Weichen/Kognition
offengelegt; UI als 4-Schritte-Fahrplan; Grundlage Dossier
bgg-beschwerde-engine.md. · **CLAUDE.md §11** (Wissens-Ablage, Anweisung
David) + Bibliothek komplettiert (45 Dossiers/5 Ordner, BGG-Cache in
fedlex-cache.sh reproduzierbar gepinnt, Register nachgeführt). ·
**Neue Dossiers:** eheschutz-glg-zustaendigkeit (Art. 198 lit. a! 314 Abs. 2
30 T.!), bgg-beschwerde-engine (Decision-Tree A–F), feiertage-kantone-bj. ·
**Gesamt-Check:** 2 unabhängige Review-Agents (Code + juristische Hand-
rechnung am Wortlaut) — alle Punkte bestätigt, M-1 gefixt, N-1 im Backlog. ·
**HANDLUNGSPLAN.md** neu (priorisiertes Vorgehen A–D). Offen: Davids
Push-Ja (10 Commits), Abnahmen, Hosting/Zahlung.

## Session 6.6.2026 nachmittags (Audit-Fixes + Ausbau, `021c05a`…`3e08ef1`)

Auf Davids laufende Aufträge: **Backlog B1–B10 komplett gefixt** (336c-
Tatbestände cbis/cter/cquinquies + Niederkunfts-Berechnung; Wechselbetreibung
`modus:'kein'` Art. 56 Ziff. 2; JStPO-Checkbox; ErrorBoundary+Export-Catches;
KTG-Risiken; Fraunces self-host+CSP+Cache-Header; Adress-SSoT BS golden-
bewiesen; tageTotal; 137-II-Variante) · **PLZ-Fixes** (21 tote Lookup-Pfade
via namensKandidaten(); Hauptgemeinde per amtlichem Adressenanteil — 4052
zeigt Basel 97.7 %) · **NEU Erb-Fristen-Rechner** (/rechner/erb-fristen, 15
Tatbestände 521/533/567 ff., Karte entwurf, Zählung 21) · **NEU Straf-
Rechtsmittel** (lib/strafRechtsmittel.ts, dritte Eingangs-Gabelung im Straf-
Rechtsweg; 222 rev. 2024!) · **Strafgerichts-Adressen** (data/strafgerichte.ts
26/26, Berufung §5-projiziert aus obereInstanzen; BL amtlich Grenzacher-
strasse 8 Muttenz) · **Hero je Rechtsweg** · **Schlichtungsstellen-Direktlinks**
(48/85 WebFetch-verifiziert + UI) · **Behörden-Voll-Audit: 0 Adressfehler**,
7 tote URLs ersetzt, Betreibungsämter-Verzeichnis → EasyGov (alte BJ-URL 404) ·
**Tiefencheck Engine** (8'442 Fälle: Scheidung×Art.-8-Naht + behoerdeTyp-Gate
gefixt, alles übrige entwarnt) · **Art. 5 Abs. 2 ergänzt**, lit. e/g–i
vollständig · **Art.-114-Spiegelung** Entscheidverfahren (lit. a/c/g) ·
**Kosten nicht-vermögensrechtlich** 26/26 + Familie (14 Kantone) in Daten+UI ·
**NEU Untermietvertrag-Weiche** (Art. 262 GELTENDE Fassung — Revision in der
Volksabstimmung 24.11.2024 abgelehnt!; Hauptmiete golden byte-identisch) ·
**Zahlungssystem-Entscheid:** PayPal aus der Planung entfernt (System offen).
**Recherche:** 17 Dossiers in `bibliothek/recherche/` (12 Engine-Cluster +
StPO-Rechtsmittel, Strafbefehlsverfahren, Gebühren-nv, Kündigungs-Masken,
Untermietvertrag) + `strafgerichte-kantone.md`/`schlichtungsstellen-urls.md` —
alle Erstrecherche/einfach belegt, fachliche Abnahme ausstehend.
Konsolidierter Befund-Stand: `fundamentalanalyse-2026-06-06.md`. Offen für
David: Dienstjahr-Stichtag-Grundsatzfrage · TI-Agno-Adresse · Abnahmen.

## Verschlankung 5.6.2026 (verhaltensneutral, Review ohne Befunde)

**Code-Splitting:** Alle Routen `React.lazy` (App.tsx, Suspense in der
Shell); jsPDF wird erst beim PDF-Klick geladen (dynamic import, Muster wie
DOCX). Hauptbundle **1'187 → 230 kB** (gzip 349 → 71); jede Seite eigener
Chunk. Banner-Texte/-Typ dafür nach `lib/vorlagen/banner.ts` gelöst
(vorlagenPdf re-exportiert).

**Geteilte Wizard-Infrastruktur** (für die Skalierung auf 50+ Vorlagen):
`components/vorlagen/useWizardState.ts` (Antworten + optionale
localStorage-Sicherung mit `normalisieren`-Callback, Schritt, Gate-,
Kopier-State; ohne `speicherKey` garantiert storage-frei → Schlichtung BS)
· `lib/vorlagen/vorlagenText.ts` (`dokumentAlsText` — dritter Renderer
neben PDF/DOCX aus derselben Quelle) · `Field`/`Stepper`/`inputCls` überall
aus `components/vorlagen/ui.tsx` (10 lokale Kopien entfernt; Typografie auf
body-s-Label/xs-Hint vereinheitlicht) · `lib/kantone.ts` (zentrale
KANTONE-Liste, amtliche Reihenfolge; bewusst abweichende Listen blieben
lokal).

**Generischer Wizard-Rahmen** (`components/vorlagen/wizard.tsx`):
`VorlagenWizardRahmen` (Kopf mit Rückweg/Normen/Badge/Speicher-Fussnote,
Stepper, zweispaltiges Layout, Fehlerbox, Zurück/Weiter; `weiterDeaktiviert`
überschreibbar für Stopp-Karten) · `VorschauPanel` (Live-«Papier» +
Bausteinprotokoll; `kompakt`, `extra`-Slot z. B. Pflichtteile,
`nichtAufgenommen`-Liste) · `ExportLeiste` (PDF/DOCX lazy + Kopieren;
DOCX nur wo Formvorschrift es zulässt). **Eine neue Vorlage liefert nur
noch: Schema (lib/vorlagen/), SCHRITTE, fehlerImSchritt, Schritt-Inhalte,
Gates-Anzeige im Prüfen-Schritt und die Rahmen-Props.** Die 4 Seiten sind
323–479 LOC (vorher 451–587). Session-Bilanz: −585 LOC netto, Hauptbundle
−80 %; alles verhaltensneutral (2 unabhängige Reviews ohne Befunde,
SSR-Smoke aller Seiten, Tests/Lint unverändert grün).

## Session-Abschluss 6.6.2026 (deployed bis e97f63b)

PLZ→Stelle: 8 Kantone gemeindescharf + BE/NE/JU zentral; SO/VS/TI/AR
ehrlich Verzeichnis (Gemeinde-/Circolo-Organe). Eingangs-Gabelung
Einleitung/Rechtsmittel. Gerichtsgebühren-Tiefenerfassung 26/26
(bibliothek/kosten/gerichtskosten-kantone.md; SH→JG 173.200 korrigiert).
Erlass-Links 52/52 in der UI. Verwaltungsbehörden-Dossier 26/26
zweifach geprüft. Adress-Gesamtprüfung (4 Pakete, ~450 Adressen):
7 Korrekturen eingearbeitet (u. a. AG-HG Vorstadt 40, BE-GenStA
Nordring 8, GR-VGer Grabenstrasse 30). Norm-Doppelcheck Stufe 1+2
abgeschlossen (Art.-5-lit.-d-Alternative, 112 IV Kann). Werkzeuge neu:
scripts/logik-sweep.ts · scripts/norm-zitate-pruefen.ts.

