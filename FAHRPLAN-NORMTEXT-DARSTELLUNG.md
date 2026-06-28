# Fahrplan — Gesetzesdarstellung Bund/DE (Normtext-Umbau)

> **Stand 28.6.2026.** Konsolidierter Masterplan (ultracode: 5 Oberflächen-Karten → 3 unabhängige
> Cluster-Strategien → Synthese). Deckt Davids 12 Punch-Punkte + 33 Audit-Lücken
> (`AUDIT-FEDLEX-DARSTELLUNG-2026-06-28.md`). **Scope: Bund, DE.** Kein Deploy (bauen+gaten),
> isolierter Worktree `feat/normtext-bund-de`. Regelwerk: `DESIGN-REGLEMENT-NORMTEXT.md`.

## Leitsatz (L0)

L0 steuert die Tiefe: zuerst was die Norm fundierter/korrekter/vollstaendiger macht (Fedlex = Untergrenze), dann Nutzen-Vorsprung (interne Verlinkung, lueckenloser TOC, ruhige Aufgehoben-Darstellung), zuletzt Kosmetik. Vier Architektur-Saeulen aus den drei deckungsgleichen Strategien + fuenf Karten: (1) ZWEI Golden-Welten strikt trennen — golden/lexmetrik-golden.json (Engine, TABU, muss im GANZEN Batch byte-gleich bleiben = Beweis Rechtslogik unberuehrt; bricht er, ist man versehentlich in eine Engine gelaufen -> STOPP) vs. golden/normtext-snapshot.json (Daten-Index, wird bewusst regeneriert+adversarial neu gesegnet, self-consistent sha, kein externer Erwartungswert). (2) Sidecar-first: golden-NEUTRALE Anreicherungen (Ingress/Kopf, Fussnoten-Inhalt G15, spaeter Wort-Offsets G14) als Sidecar -> Snapshot-Index byte-gleich; nur echter Normtext-Zuwachs (Verschachtelungstiefe, Tabellen-Koepfe, Bilder, doppelte-ID) bricht den Daten-Index bewusst. (3) GENAU EINE Daten-Re-Segnung am B1-Ende: alle golden-brechenden Cluster (M6/M7/M8/M9) sind ein BEGRENZTER, in einem Durchgang adversarial ueberblickbarer Block, der bestehende Artikel MODIFIZIERT — disp/annex (M13, additiv, hunderte NEUE Eintraege, eigener Token-Namespace, Schema-Strahlung) trifft DISJUNKTE Daten und gehoert in einen eigenen B2-Re-Bless. (4) §1-Vorrang: G8 (falsche Zitate, M6) und der Resolver (#10/#11, M11/M12, plausibel-FALSCHE Links schlimmer als tote) bekommen die tiefste adversariale Sorgfalt und sind der eigentliche Grund fuer die EINE vorsichtige Re-Segnung. Empirische Auftragskorrektur (Resolver-Karte, or.html: 0/3724 Body-Hrefs): #11 ist KEIN Extraktor-Fix sondern Resolver-Bug (NORM_IM_TEXT matcht 'Artikel' nicht + tokenMap nur Self-Erlass); den im Auftrag skizzierten Block-links[]-Umbau NICHT bauen. Geteilte Wurzeln werden je EIN Cluster: randtitelKnoten (#4 TOC + #6 Striche + G11), parseFedlexTabelle (#12 + spaeter Annex-Tabellen G18), entferneTags/entferneFussnotenSups (Bilder + spaeter Wort-Offsets), istAufgehoben (#3 Accordion + Inline). Kein Deploy (bauen+gaten), isolierter Worktree feat/normtext-bund-de (existiert noch nicht -> erst anlegen, eigener npm ci).

## David-Entscheide (28.6.)

- **Batch-Grenze:** Schlusstitel/Anhänge (M13) + wortgenaue Fussnoten (M14) = eigener B2-Pass nach B1-Abnahme (bestätigt).
- **Änderungsstatus je Bestimmung (G17, 53%):** bleibt hinter dem Fussnoten-Schalter (ruhiges Schriftbild).
- **Verweis #11:** jetzt nur falsche Selbstverweise stoppen; VO→Trägergesetz-Routing als separate verifizierte Datenaufgabe.
- **Tabellen #12:** minimal colspan→Kopf-Padding bauen (trotz Audit-'widerlegt'), keine volle rowspan-Logik.
- Selbst entschieden: #9-Abstand → auf Fedlex-Ist vereinheitlichen; SR-Verweis bei Stand-Mismatch → intern + Stand-Marker; G3 → exakter Fedlex-Titel + Kurztitel-Alias.

## Sicherheits-Architektur (Golden)

- Zwei Golden-Welten verwechseln: golden/lexmetrik-golden.json (Engine) ist TABU und muss im GANZEN Batch byte-gleich bleiben (golden:vergleich = IDENTISCH = Beweis Rechtslogik unberuehrt). Bricht er, hat man versehentlich eine Engine getroffen -> sofort STOPP, NICHT das Tor aufweichen. golden/normtext-snapshot.json (Daten-Index) wird dagegen bewusst regeneriert (self-consistent sha, kein externer Erwartungswert).
- §1: G8 (M6) erzeugt FALSCHE ZITATE in >=20 Artikeln — Tiefe wird heute geraten. parseDefinitionsListe UND walkDl muessen die Tiefe konsistent fuehren (gemeinsame MARKE-Regex), sonst driften Marker-Zuordnung und Zitat auseinander; Lese-Schicht synchron umstellen. Adversariale Zitat-Korrektheits-Pruefung vor allem anderen.
- §1/§8: Resolver-Blast-Radius (M12) — NORM_IM_TEXT/fedlex.ts geteilt von NormText, KantonNormText, Verweis-Chips, bundRef, norm-zitate-pruefen UND Vorlagen/Tarif-Fliesstext. Die 'Artikel'-Erweiterung kann site-weit ueber-triggern und Engine-Golden treffen; plausibel-FALSCHE interne Links (BGerR->sich selbst statt BGG) sind schlimmer als tote. Zuletzt bauen, adversarialer Ueber-Trigger-Check, Traegergesetz muss nach §8 auf Fedlex-Fallback degradieren.

## B1 — jetzt

**Bau-Reihenfolge:** M0 → M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10 → M11 → M12

### M0 · DESIGN-REGLEMENT-NORMTEXT.md (Querschnitt-Governance)
- umfasst: Querschnitt / - | Ebene: doku | Tiefe: standard | Aufwand: S | dep: -
- Tiefe-Begründung: Reine Doku, aber muss als verbindlicher Massstab fuer JEDE bewusste Daten-Re-Segnung taugen (§6.2/.3-Begruendungsbasis) — nicht minimal, weil zu schwammig = Cluster verletzen sie unbemerkt; nicht tief, kein Schema-Werk.
- Risiko: Kein Code-Risiko. Einziges Risiko: Regelwerk zu vage -> Re-Segnung ohne dokumentierte Regel.
- Gating: Kein Tor; Inhaltsreview. Unter DESIGN-REGLEMENT.md-Dach (§13) einhaengen. MUSS vor der ersten bewussten Neu-Segnung stehen. Inhalt: §1 Wortlaut nie aendern nur Darstellung normalisieren, §5 EINE Quelle (Snapshot+Sidecar), §7 Golden-Regel (Engine byte-gleich / Daten bewusst neu segnen + adversarial).

### M1 · App-Shell UI-Bugs: Tabliste-Anchor (#7) + Header-Suche intern scrollbar (#8)
- umfasst: #7, #8 / - | Ebene: ui | Tiefe: minimal | Aufwand: S | dep: -
- Tiefe-Begründung: Zwei isolierte CSS/Positionierungs-Bugs ausserhalb gesetz-leser, kein juristischer Gehalt, kein Daten-/Golden-Bezug. Aufwaermer.
- Risiko: Klein, isoliert. #8: nur Header-Pfad kappen (Hero-Pfad ungekappt); bei strenger Token-Policy Mass-Skala-Token statt arbitrary calc (§13).
- Gating: #7 ReiterUebersicht.tsx:132 (fixed top-16 right-2 -> triggerRef.getBoundingClientRect(), Muster FnRef.positioniere ArtikelBody.tsx:52-59 wiederverwenden). #8 HeaderSuche.tsx:113 (max-h+overflow-y-auto+overscroll-contain). tsc+lint; Prerender pruefen; visuell mobil (Playwright via Bash).

### M2 · Fliesstext-Einzug vereinheitlichen (#5)
- umfasst: #5 / - | Ebene: renderer | Tiefe: minimal | Aufwand: S | dep: -
- Tiefe-Begründung: Genau EINE Code-Stelle (ArtikelBody.tsx:358, -indent-9 bei Absatz-Nr vs -indent-4 bei absatz=null). Reine className-Logik, Popover-Pfad unberuehrt -> byte-gleich.
- Risiko: Klein. Achtung bewusster Alt-Grund (erste Zeile reicht sonst zu weit zurueck) -> neue Regel muss BEIDE Absatztypen visuell buendig zeigen, an ZGB/OR gegenpruefen.
- Gating: ArtikelBody.test.tsx; golden:vergleich byte-gleich (Reader nicht im Engine-Golden-Pfad); Playwright-Sichtpruefung.

### M3 · TOC alle Randtitel inkl. Blatt-Knoten (#4) + Gruppierungs-Striche vereinheitlichen (#6) + Sektions-Fussnotenmarker (G11)
- umfasst: #4, #6 / G11 | Ebene: renderer | Tiefe: standard | Aufwand: M | dep: -
- Tiefe-Begründung: GETEILTE WURZEL randtitelKnoten (darstellung.ts:78-87, ahnen vs blatt) speist baueGliederungsbaum (TOC) UND margAnzeige (Fliesstext-Ueberschrift) zugleich -> standard, nicht minimal: betrifft JEDEN Bund-Erlass-TOC. #4 hat echten Nav-Nutzen (lueckenlos = wo wir Fedlex uebertreffen), #6 faellt aus derselben Wurzel ab, G11 ist nur Wiring (randtitelFnIds existiert in struktur-extrahiere.ts:27, fehlt im browse.ts-Interface + SektionKopf).
- Risiko: Mittel: baueGliederungsbaum zentral. Vorsicht — randtitelKnoten wirkt auf TOC + Fliesstext-Ueberschriften gleichzeitig; Blatt-Randtitel im TOC NICHT mit der Artikel-eigenen Sachueberschrift doppeln.
- Gating: rubrumKinder.test.ts, normtext-struktur-marginalie.test.ts, darstellung.test.ts; golden:vergleich byte-gleich erwartet (reiner Renderer); ZGB/OR-TOC visuell gegenverifizieren. G11-Wiring braucht kein Re-Bless.

### M4 · Aufgehobene Artikel: amtliche Aufhebungsnotiz erhalten + schlicht statt Accordion (#3) + Default-Sichtbarkeit (G16/G17)
- umfasst: #3 / G16, G17 | Ebene: renderer | Tiefe: standard | Aufwand: M | dep: -
- Tiefe-Begründung: Substanz nicht Kosmetik: Aufhebungsnotiz ist amtlicher Inhalt (G16, 1294 Art/153 Erlasse) — heute nur '...'/aufgehoben = Info-Verlust vs Fedlex. Geteilte Wurzel istAufgehoben/artikelGanzAufgehoben (darstellung.ts:228-254) speist Accordion (parts.tsx:33,43) UND Inline-aufgehoben (ArtikelBody.tsx:392,484). Reiner Renderer, Daten vorhanden.
- Risiko: Mittel: Default-Verhalten fuer 1294/153 Erlasse. Notiz-Text muss aus bestehender Historie/Sidecar-Fussnoten kommen, Wortlaut nie erfinden (§1). G17 (53% Bestimmungen) nicht versehentlich vollen Fussnoten-Apparat default einschalten (Audit: 'default aus ist ok').
- Gating: darstellung.test.ts, ArtikelBody.test.tsx; golden:vergleich byte-gleich; an aufgehobenen ZGB/OR-Artikeln visuell pruefen. G17-Default-Entscheid = David-Frage.

### M5 · Erlass-Kopf: Erlassdatum + Ingress/Erlassformel + BV-Praeambel + Kopf-/Titel-Fussnoten + amtlicher Titel (Sidecar)
- umfasst: #1 / G1,G2,G3,G4,G5,G6,G12 | Ebene: beides | Tiefe: tief | Aufwand: M | dep: -
- Tiefe-Begründung: Hoechster Fundiertheits-Hebel des renderer-nahen Teils: Ingress = Rechtsgrundlage/Delegationsnorm, zu 100% der 218 Erlasse verworfen (Extraktor startet erst bei <article>). Neue extrahiereKopf(html) liest <div id=preface>/<div id=preamble> (feste Klassen erlassdatum/man-template-autor/ingress/man-template-verb), BV-Sonderfall G6 (materieller Praeambeltext, kein verb) klassenbasiert separat; Fussnoten ueber bestehendes fnDefinitionen.
- Risiko: Mittel: additiv/rueckwaertskompatibel (Feld optional, auch Kanton-Pfad). Als SIDECAR speichern -> Snapshot-Index BYTE-GLEICH, kein Re-Bless. Vollstaendigkeitstest muss preface/preamble tolerieren. Render-Slot in BEIDEN Header-Pfaden (inhalt.tsx:663-690 Volltext + :444-485 pdf-embed). G3 amtlicher Titel = David-Frage (Alias erhalten?).
- Gating: Sidecar -> golden:vergleich byte-gleich; check:vollstaendigkeit tolerant anpassen; neuer Kopf-Slot-Render-Test; ZGB/OR/BV manuell gegen Fedlex.

### M6 · §1-KRITISCH: Aufzaehlungs-Verschachtelungstiefe explizit fuehren — falsche Zitate beheben (G8/G9)
- umfasst: - / G8, G9 | Ebene: extraktion | Tiefe: tief | Aufwand: M | dep: -
- Tiefe-Begründung: Nach L0 die HOECHSTE Einzelprioritaet: flaches items[]-Modell laesst die Lese-/Zitier-Schicht (ArtikelBody litZiff) die Tiefe aus dem Markentyp RATEN -> falsche amtliche Zitate (>=20 Artikel) = Rechtsfehler. parseDefinitionsListe (extrahiere-fedlex.ts:227-298) kennt die echte Tiefe via Rekursion :294, verwirft sie beim flachen Push. SOLL: explizites tiefe-Feld, Lese-Schicht raet nicht mehr. G9 roem. (i)(ii)(iii) (~17).
- Risiko: Hoch fachlich: items-Struktur fliesst in sha256Bloecke (snapshot.ts) -> Daten-Index bricht (Teil der EINEN B1-Re-Segnung). walkDl (fussnoten-extrahiere.ts:82) muss dieselbe Tiefe konsistent fuehren (§5 gemeinsame MARKE-Regex zentralisieren), sonst driften Marker-Zuordnung und Zitat auseinander. Lese-Schicht synchron umstellen.
- Gating: normtext-fedlex.test.ts + neue Tiefe-Assertions; adversariale Gegenpruefung der >=20 betroffenen Artikel auf Zitat-Korrektheit gegen Fedlex. Engine-Golden MUSS byte-gleich bleiben.

### M7 · Artikel-interne Tabellen: td-Koepfe + mehrzeilige Koepfe + colspan-Padding (#12, G19/G20)
- umfasst: #12 / G19, G20 | Ebene: extraktion | Tiefe: standard | Aufwand: M | dep: -
- Tiefe-Begründung: Substanz (falsche Tabelle = falsche Gebuehr) aber gut isoliert, Renderer schon robust. EINE Funktion parseFedlexTabelle (extrahiere-fedlex.ts:328-345) erkennt Kopf nur via <th>; Fedlex nutzt td>p.man-template-tab-kpf (G20 Kopf als Datenzeile), mehrere kpf-Zeilen (G19 obere verloren). Empirisch GebV SchKG art_30: colspan ignoriert -> Kopf 2 vs Daten 6 Zellen verschoben.
- Risiko: Mittel: parseFedlexTabelle geteilt von ALLEN Tarif-Tabellen (AHVV/BVG/EOV/IVV) -> veraenderte Zell-Aufteilung kann Tausender-/Numerik-Heuristik im Renderer umschalten. WIDERSPRUCH zur '9-widerlegt'-Liste: dort 'colspan ignoriert' als false-positive verworfen, GebV beweist colspan->Padding ZWINGEND -> David-Frage. G18 Anhang-Tabellen NICHT hier (-> M13). G19/G20-Kopf-Padding bricht Daten-Index fuer kpf-Erlasse (Teil der EINEN B1-Re-Segnung).
- Gating: mehrspaltige-tabelle.test.ts + mehrspaltig-sha.test.ts deklariert anpassen; GebV SchKG art_30 + AHVV/BVG adversarial; Renderer MehrspaltigeTabelle NICHT anfassen.

### M8 · Bilder/Pictogramme + math. Formeln (als Bild) + standalone man-template-Paragraphen erhalten (G21/G22/G23)
- umfasst: - / G21, G22, G23 | Ebene: beides | Tiefe: standard | Aufwand: M | dep: -
- Tiefe-Begründung: Materieller Info-Verlust: entferneTags (extrahiere-fedlex.ts:353) wirft <img> weg -> Pictogramme (~21 Erlasse SSV/VTS/ChemV) UND Formeln (Fedlex liefert als Bild: KKG-Zinsformel, DBG Art.22, AVO) restlos verloren. G23: standalone <p class=man-template-*> ohne dl/absatz-Klasse trifft keine Block-Alternative (:91) -> gedroppt (~23 Erlasse). Substanz, daher B1 (Info-Verlust > Kosmetik), aber kein Schema-Strahlen wie M13 -> standard.
- Risiko: Mittel: neue Block-Typen ({bild:{url,alt}}) brechen Daten-Index (Teil der EINEN B1-Re-Segnung); neuer kleiner Bild-Render-Slot in ArtikelBody. EINZIGE B1-Stelle mit externer Abhaengigkeit: Fedlex-Filestore-URL (relativ->absolut) muss stabil/gepinnt sein, sonst tote Bilder. ESCAPE-HATCH: falls URL-Aufloesung instabil -> G21/G22 nach B2 verschieben, G23 (rein lokal, trivial) bleibt B1. G22 bleibt Bild (kein OCR/LaTeX) — ehrlich so dokumentieren. G23 adversarial gegen Ueber-Matchen (nicht tab-kpf-p doppeln).
- Gating: ArtikelBody.test.tsx neuer Bild-Slot; Stichprobe KKG/DBG/SSV gegen Fedlex; Bild-URL-Erreichbarkeit pruefen.

### M9 · Doppelte art_id: zweiten Artikel erhalten (KKV) (G7)
- umfasst: - / G7 | Ebene: extraktion | Tiefe: minimal | Aufwand: S | dep: -
- Tiefe-Begründung: Genau 1 Fall (KKV): alleArtikelTokens dedupt 'erster gewinnt' (:375), 2. <article> mit kollidierendem art_<token> verloren. SOLL: beide fuehren (Suffix art_N__2). Mechanisch, billig.
- Risiko: Niedrig, lokal (1 Erlass): 1 neuer Snapshot-Eintrag -> Daten-Index bricht minimal (Teil der EINEN B1-Re-Segnung). Suffix-Schema darf Anker/Routing/Verweise nicht brechen.
- Gating: check:vollstaendigkeit; KKV manuell pruefen (Anker konsistent).

### M10 · Fussnoten: Abstand wie Fedlex (#9) + Hervorhebungen (fett/kursiv) im Fussnotentext erhalten (G15)
- umfasst: #9 / G15 | Ebene: beides | Tiefe: standard | Aufwand: M | dep: -
- Tiefe-Begründung: Gemischt: #9-Abstand (Art.56 ZGB MIT vs Art.69a OHNE) ist datengetrieben (Sidecar-Fn vs Historie-Fallback, parts.tsx:37) -> reiner Renderer (S). G15 ist Substanz: clean() (fussnoten-extrahiere.ts:21) strippt <b>/<i> -> erhalten + fnTextMitLinks rendert reich statt plain. Dieser tag-bewusste clean() ist die VORSTUFE fuer M14/G14. G14 (Wort-genaue Position, ~1121) bewusst NICHT hier.
- Risiko: Niedrig-mittel: G15 minimaler Extraktor-Eingriff, aendert Sidecar-Fussnotentext (Sidecar -> Snapshot-Index byte-neutral); #9 reiner Renderer. Fedlex-Soll-Abstand mit David klaeren (Art.56 oder Art.69a Variante).
- Gating: Sidecar-Regen golden-neutral; ArtikelBody.test.tsx + Fussnoten-Render-Test; Art.56/69a ZGB visuell gegen Fedlex.

### M11 · Resolver A: SR-Verweis in Fussnoten -> intern auf LexMetrik-Erlass statt immer Fedlex (#10)
- umfasst: #10 / - | Ebene: resolver | Tiefe: standard | Aufwand: S | dep: -
- Tiefe-Begründung: Burggraben-Nutzen bei niedrigem Risiko — Datenmodell EXISTIERT (fussnoten-extrahiere.ts:41 sammelt FnLink{label,url} mit echtem eli/cc-Ziel). fnTextMitLinks (helpers.tsx:35) leitet heute HART nach Fedlex. SOLL: reverse-Resolver eliCc/SR->ErlassKey ABGELEITET aus ERLASS_REGISTER (KEINE Handtabelle, driftet sonst); Treffer mit status snapshot/pdf-embed -> /gesetze/bund/<KEY>, sonst Fedlex-Fallback (§8).
- Risiko: Niedrig: reine Darstellungsschicht, Fussnoten nicht in Golden/PDF + default per Schalter aus. eli/cc-Pfad-Normalisierung sorgfaeltig (Muster SNAPSHOT_QUELLE bundRef.ts:26). Stand-Mismatch bis Versionierung (#2/B3): intern verlinkter SR-Erlass koennte anderen Stand zeigen -> David-Frage (intern + Stand kennzeichnen vs Fedlex-Fallback).
- Gating: normText/Resolver-Unit-Tests; golden:vergleich byte-gleich. Kein Re-Bless.

### M12 · Resolver B: Body 'Artikel N' korrekt parsen (Selbstverweis-Verwechslung) + VO->Traegergesetz (#11, 'grober Fehler ueberall Bund')
- umfasst: #11 / G7-nah | Ebene: resolver | Tiefe: tief | Aufwand: L | dep: -
- Tiefe-Begründung: §1/§8-kritisch: plausibel-FALSCHE Links schlimmer als tote (verifiziert BGerR: 7/35 'Artikel N' faelschlich auf BGerR selbst statt BGG/VG). EMPIRISCHE KORREKTUR: KEIN Extraktor-Fix (or.html 0/3724 Body-Hrefs). Zwei Bugs: NORM_IM_TEXT (fedlex.ts:406) matcht nur 'Art.' nicht 'Artikel'; ART_INTERN/tokenMap (NormText.tsx:56, inhalt.tsx:276) baut Token nur aus DEMSELBEN Erlass -> Selbstverweis. SOLL: 'Art(?:.|ikel)' (greift bestehender korrekter Chip-Pfad), bare 'Artikel N' nur self wenn kein Kuerzel folgt, VO-Traegergesetz via register.ts-Metadatum.
- Risiko: HOCH: fedlex.ts/NORM_IM_TEXT geteilte Stelle (NormText, KantonNormText:52, parts.tsx:80-Chips, bundRef, Tests + Vorlagen/Tarif-Fliesstext) -> 'Artikel'-Erweiterung kann site-weit ueber-triggern (Blast-Radius), koennte Engine-Golden treffen. VORSICHTIGSTER Cluster, ZULETZT bauen. Traegergesetz-Metadatei manuell/potenziell unvollstaendig -> muss nach §8 sauber auf Fedlex-Fallback degradieren, nie auf falschen Erlass.
- Gating: norm-zitate-pruefen.ts + normText.test.tsx (Re-Baseline deklariert); golden:vergleich MUSS byte-gleich bleiben (bricht er -> fedlex.ts uebertriggert in Engine -> STOPP); BGerR->BGG/VG manuell + adversarialer Ueber-Trigger-Check site-weit.

## B2 — eigener Pass direkt nach B1

### M13 · Schlusstitel/UeB/Anhaenge lesbar machen: disp+annex-Pfad, Schema, Render-Slot, Anhang-Tabellen, deren Fussnoten (grosser Daten-Pass)
- umfasst: - / G10,G13,G18,G24,G25,G26,G27 | Ebene: beides | Tiefe: tief | Aufwand: XL | dep: M7
- Tiefe-Begründung: GROESSTER reiner Fundiertheits-Sprung ueberhaupt (ZGB ist ohne Schlusstitel 178 Art. + OR 83 schlicht unvollstaendig; 277 UeB-Art/62 Erlasse, 150 Anhang-Sektionen/121 Erlasse). Gemeinsame Wurzel 'liest nur art_' (alleArtikelTokens digit-only :370 + Regex :53 + fussnoten:63): disp_u1/art_* und annex_* sind echte <article> mit Praefix-ID. EHRLICH zu L0: B2 NUR aus Risiko-/Verifizierbarkeitsgruenden, NICHT weil weniger wert — als ALLERERSTER B2-Schritt unmittelbar nach B1-Abnahme.
- Risiko: HOCH/XL: erzwingt NEUE Schema-Dimension NormSnapshotDatei.anhaenge[] (eigener Token-Namespace st_/anhang_) die in vollstaendigkeit-logik.ts, check-drift.ts, sha256Bloecke, browse-typen.ts ausstrahlt. EIGENTLICHE FALLE = Token-Kollision disp_u1/art_1 vs art_1 (ohne eigenen id-Raum ueberschreibt Schlusstitel-Art.1 den Haupttext = stiller Daten-Verlust). MIT ABSTAND groesster neuer Golden-Segment (ZGB +178 etc.) -> eigene Re-Bless-Welle, disjunkt von B1. G18 (Annex-Tabellen) huckepack auf parseFedlexTabelle (M7), G13 (disp-Fussnoten) + G27 (Render-Slot) hierher. struktur-extrahiere.ts = Andockpunkt fuer Ueberschriften (sieht <h*> schon).
- Gating: EIGENER Re-Bless-Pass (npm run normtext + normtext:struktur), getrennt vom B1-Block; check:vollstaendigkeit + check:normtext erweitern; gestaffelt (B2a Schema+ZGB/OR-Pilot byte-fuer-byte vs Fedlex -> B2b G18-Annex-Tabellen -> B2c Rest 62/121); browse-Manifest artikelAnzahl konsistent.

### M14 · Fussnoten-Marker an exakter Wortposition statt Absatz-/Item-Ende (G14)
- umfasst: #9-Rest / G14 | Ebene: beides | Tiefe: minimal | Aufwand: L | dep: M10
- Tiefe-Begründung: Bewusst niedrige L0-Tiefe trotz hohem Aufwand: G14 ist reine DARSTELLUNG (Marker am exakten Wort vs Absatz-Ende, ~1121 Faelle ZGB/OR/BV/AHVG/ARGV1) — KEIN Info-Verlust, der Inhalt ist da. Von #10/#11 ENTKOPPELT (Resolver-Karte: Body hat keine Hrefs) -> kein Grund es in B1 zu zwingen. Baut auf dem tag-bewussten clean() aus M10/G15 auf.
- Risiko: Hoch im Aufwand, niedrig im Nutzen: ~1121 Marker neu positionieren; braucht tag-bewussten Serialisierer (Ersatz fuer entferneFussnotenSups:36, der heute Marker samt Position LOESCHT). Als SIDECAR (Wort-Offsets separat) -> Snapshot-Index byte-gleich. Falsche Position = sichtbarer Amtstreue-Fehler -> eigener adversarialer Pass, erst lohnend wenn B1-Substanz steht.
- Gating: Sidecar-Variante haelt golden; eigener Wort-Position-Check; FnRef-Render-Test; visuelle Stichprobe ZGB Art.56/OR.

### M15 · Sprachverfuegbarkeit DE/FR/IT erfassen + verlinken (G29)
- umfasst: - / G29 | Ebene: beides | Tiefe: standard | Aufwand: M | dep: M5
- Tiefe-Begründung: Vom Auftrag explizit dem spaeteren FR/IT-Batch zugeordnet; ausserhalb des DE-only-Scope. Hier nur als Platzhalter im Plan.
- Risiko: Mittel: Sprach-Datenmodell + Fedlex-Sprachvarianten-Abruf; gehoert in die Mehrsprachen-Welle, nicht DE-only B1.
- Gating: Eigener FR/IT-Batch; nicht in B1.

## B3 — später (Punkt 2 / FR-IT)

### M16 · Geltungsstaende / historische+kuenftige Fassungen + datierter Deep-Link + ELI-Point-in-Time + Renderer-Signal (Punkt 2)
- umfasst: #2 / G28,G30,G31,G32,G33 | Ebene: beides | Tiefe: tief | Aufwand: XL | dep: M5,M13
- Tiefe-Begründung: Eigene Initiative #2 (ausdruecklich auf 'Versionierung' verschoben): nur EIN Stand (G30), generische ELI statt datierter Deep-Link (G31), keine kuenftigen Fassungen (G32), Renderer signalisiert nicht dass weitere existieren (G33), keine Point-in-Time-Pinnung (G28, 1460 Eintraege). Eigenes Mehrfassungs-Datenmodell.
- Risiko: Hoch: Mehrfassungs-Datenmodell + Fedlex-Historik-Abruf; beruehrt quelleUrl/fassungsToken/Drift-Tor grundlegend. Erst sinnvoll wenn Kopf (M5) + Struktur (M13) stehen.
- Gating: Eigener Batch; check:fedlex-versionen als Currency-Arbiter; eigene Tor-/Drift-Erweiterung; nicht in B1/B2.

## Empfohlene Batch-Grenze (Begründung)

B1 (JETZT, EIN Worktree, GENAU EINE Daten-Re-Segnung am Ende) = M0-M12: die Doku, die zwei UI-Bugs, alle golden-STABILEN Renderer-Quickwins (#5/#4/#6/#3), die golden-NEUTRALEN Sidecar-Anreicherungen (Kopf/Ingress #1, Fussnoten-Inhalt G15) UND der BEGRENZTE golden-brechende Block der BESTEHENDE Artikel MODIFIZIERT (Verschachtelung G8/G9, Tabellen-Koepfe G19/G20, Bilder/man-template G21/G22/G23, doppelte-ID G7) + der Resolver (#10/#11). Diese teilen sich GENAU EINE bewusste Normtext-Neu-Segnung und bleiben in einem Durchgang adversarial ueberblickbar; Engine-Golden bleibt byte-gleich als Beweis der Rechtslogik-Unberuehrtheit.

BEWUSST NICHT in B1 — die schweren Struktur-Regionen als EIGENER grosser Daten-Pass B2 (M13 Schlusstitel/UeB/Anhaenge + M14 Wort-genaue Fussnoten): JA, klare Empfehlung B2, mit Begruendung. M13 (G24-G27) ist der EINZIGE Cluster, der (a) eine NEUE Schema-Dimension erzwingt (nicht-Artikel-Eintraege mit eigenem Token-Namespace st_/anhang_), die in 6+ Dateien + Tore (vollstaendigkeit-logik, check-drift, sha256Bloecke, browse-typen) ausstrahlt; (b) den mit Abstand groessten ADDITIVEN Re-Bless erzeugt (allein ZGB +178 Art., dazu 277 UeB-Art + 150 Anhang-Sektionen — hunderte NEUE Eintraege); (c) seine eigentliche Schwierigkeit NICHT im Parsen hat, sondern in der Token-Kollision disp_u1/art_1 vs art_1 (ohne eigenen id-Raum stiller Daten-Verlust), die ungeteilte, gestaffelte adversariale Verifikation verlangt (Pilot ZGB/OR -> Rest 62/121). Es mit B1 zu buendeln wuerde die Verifizierbarkeit der EINEN B1-Re-Segnung sprengen. Entscheidend: M13 ist ADDITIV (neue Eintraege) und trifft damit DISJUNKTE Daten gegenueber dem MODIFIZIERENDEN B1-Block -> die zwei Re-Segnungen interferieren minimal, der Schnitt ist sauber: B1 = alles innerhalb des bestehenden Artikel-Schemas; B2 = der zweite Extraktionspfad ausserhalb von <article>. NICHT der Netz-Bezug ist der Trennfaktor (HTML liegt fuer alle Erlasse inkl. Anhaengen in /tmp gecacht; fedlex-cache.sh re-fetcht nur Fehlendes), sondern Schema-Blast-Radius + Golden-Segment-Groesse + adversariale Ueberblickbarkeit. EHRLICH zu L0: M13 ist der GROESSTE Fundiertheits-Sprung (ZGB unvollstaendig ohne Schlusstitel) — B2 nur aus Risiko/Verifizierbarkeit, daher als ALLERERSTER B2-Schritt unmittelbar nach B1-Abnahme. M14 (G14, ~1121 Marker) ist von #10/#11 entkoppelt und reine Darstellung (kein Info-Verlust) -> eigener adversarialer Sidecar-Pass in B2, baut auf dem tag-bewussten clean() aus M10/G15 auf.

B3 = M15 (FR/IT G29) + M16 (Versionierung #2, G28/G30-33) — eigene Initiativen ausserhalb dieser Arbeit. ESCAPE-HATCH in B1: nur M8 hat eine externe Abhaengigkeit (Fedlex-Filestore-Bild-URL); falls deren Aufloesung instabil, wandern G21/G22 nach B2 (huckepack auf M13s Render-Slot-Infra), G23 (rein lokal) bleibt B1.