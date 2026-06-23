# FAHRPLAN — Basel-Stadt als Vorbildkanton (beste Gesetzesseite im Netz)

**Erstellt:** 23.6.2026 (Auftrag David: BS fundiert über alle Aspekte prüfen + nützlicher machen, «beste Seite im Netz»; Methode: ultracode-Workflow bs-vorbildkanton-audit, 53 Agenten, 8 Dimensionen, adversarial verifiziert). **Status: AKTIVE DIREKTIVE.** BS-Fixes im Extraktor/Systematik wirken korpusweit (alle Tier-A-Kantone), darum zuerst hier perfektionieren.

## Bestätigte Befunde (43, adversarial verifiziert)

1. **[HOCH · mittel · bug]** (daten-treue) Aufgehobene Artikel werden vollständig verschluckt (Nummerierung reisst, Artikel scheint nicht zu existieren)
2. **[HOCH · mittel · bug]** (daten-treue) paragraph_post / text_content_post-Inhalte werden komplett verschluckt (substantielle Normtexte gehen verloren)
3. **[HOCH · klein · luecke]** (abdeckung) 51 in Kraft stehende BS-Erlasse sind komplett unsichtbar (kein Eintrag, kein Live-Link) — stille Auslassung verletzt §8
4. **[HOCH · mittel · bug]** (gruppierung) Gemeinderecht-Erlasse (BaB/BeB/BeE/RiB/RiE) werden komplett falsch einsortiert — Buchstaben-Präfix wird weggeworfen
5. **[HOCH · gross · luecke]** (reader-ux) Keine Gliederung/TOC für 854 von 859 BS-Gesetzen (inkl. 281-Artikel-Steuergesetz)
6. **[HOCH · mittel · verbesserung]** (reader-ux) Einkommenssteuer-Tarif (§ 36 StG) erscheint als Textwand statt Tabelle
7. **[HOCH · gross · luecke]** (best-in-net) Keine Versionsgeschichte / Zeitreise (frühere Fassungen + Versionen vergleichen)
8. **[HOCH · mittel · bug]** (best-in-net) 129 BS-Erlasse zeigen statt Titel nur «KÜRZEL (SR-Nr.)» — degradierte Anzeige
9. **[MITTEL · mittel · luecke]** (daten-treue) Randtitel (article_title) wird bei JEDEM Artikel weggeworfen
10. **[MITTEL · klein · bug]** (daten-treue) Aufgehobene Aufzählungs-Buchstaben (lit.) werden gelöscht → Lücke in der lit.-Reihe (z.B. §35 StG: a,b,c,d,e,f,h ohne g)
11. **[MITTEL · mittel · bug]** (daten-treue) Absatz-interne Zwischenüberschriften ('a) Spital', 'b) Pflegeheim') werden fälschlich als lit.-Aufzählung interpretiert
12. **[MITTEL · mittel · luecke]** (abdeckung) Lücke ist dynamisch und unbeobachtet — kein Drift-Tor erfasst neu hinzugekommene/weggefallene BS-Erlasse
13. **[MITTEL · klein · bug]** (gruppierung) Zwei Gemeinde-Roots (BeB, RiB) erscheinen als Geister-/Leersektionen bzw. fehlen ganz
14. **[MITTEL · mittel · verbesserung]** (overview-ux) Schweizkarte verdrängt die eigentliche Gesetzesliste unter den Fold (Desktop ~500px, Mobil ein ganzer Screen)
15. **[MITTEL · mittel · verbesserung]** (overview-ux) Karte und 26-Karten-Raster sind redundant — zwei Kantonswähler übereinander
16. **[MITTEL · klein · bug]** (overview-ux) Sektionstitel werden auf Mobil abgeschnitten — schlechte Scannbarkeit der 2-Ebenen-Gliederung
17. **[MITTEL · klein · verbesserung]** (reader-ux) In-Gesetz-Suche markiert den Treffer-Begriff nicht im Text
18. **[MITTEL · klein · bug]** (reader-ux) Doppelter Erlasstitel im Reader-Kopf («Advokaturgesetz — Advokaturgesetz (291.100)»)
19. **[MITTEL · mittel · luecke]** (nuetzlichkeit) Globale Kopf-Suche indexiert die Gesetze NICHT — Anwältin tippt Gesetzesnamen ins prominenteste Feld und bekommt nichts
20. **[MITTEL · klein · luecke]** (nuetzlichkeit) Suche ist nicht auf den gewählten Kanton eingrenzbar — auf der BS-Seite kommen immer Bund+alle Kantone
21. **[MITTEL · klein · luecke]** (nuetzlichkeit) Kantonale Erlass-Liste zeigt weder Artikelzahl noch Stand-Datum — beides ist im Manifest vorhanden und wird in der Kartenansicht sogar genutzt
22. **[MITTEL · mittel · luecke]** (nuetzlichkeit) Kein Verlauf («zuletzt geöffnet») und keine Favoriten — eine Anwältin verliert ihren Wiedereinstieg in 859 Erlasse
23. **[MITTEL · mittel · bug]** (best-in-net) 406 Erlasse: voller Langtitel steckt im Kürzel-Feld (overflow-/Scan-Problem)
24. **[MITTEL · mittel · luecke]** (best-in-net) Keine Marginalien (Sachtitel) pro Paragraph bei kantonalen Erlassen
25. **[MITTEL · mittel · luecke]** (best-in-net) Keine echte Volltextsuche INNERHALB der Übersicht über alle BS-Artikel
26. **[MITTEL · klein · bug]** (a11y-perf-honesty) SR-Nummern (text-ink-400) verfehlen WCAG-AA-Kontrast — 859 Knoten in der BS-Ansicht
27. **[MITTEL · klein · luecke]** (a11y-perf-honesty) axe-Tor deckt die Gesetze-Seite gar nicht ab — Kontrastfehler kann ungebremst deployen
28. **[MITTEL · gross · luecke]** (a11y-perf-honesty) §8-Statusmodell (entwurf/geprüft/geplant) existiert in der Gesetzessammlung NICHT — alle 859 BS-Erlasse sind ununterscheidbar 'snapshot'
29. **[MITTEL · mittel · luecke]** (a11y-perf-honesty) confidence.json (einziges objektives Qualitätssignal) deckt nur 5 von 859 BS-Erlassen ab und wird nirgends im UI genutzt
30. **[NIEDRIG · klein · verbesserung]** (abdeckung) Prominenz-Einordnung: die 51 fehlenden Erlasse sind fast durchweg Randmaterie, kein Kern-Statut betroffen — Schwere dadurch begrenzt
31. **[NIEDRIG · klein · bug]** (gruppierung) Sortierung mischt Kantons- und Gemeinde-Erlasse rein numerisch und truncatet mehrteilige Nummern
32. **[NIEDRIG · mittel · verbesserung]** (overview-ux) Kartenfarbe ist rein dekorativ und verschleiert, dass nur BS real ausgebaut ist (859 vs. 2-7 bei allen anderen)
33. **[NIEDRIG · mittel · luecke]** (overview-ux) Kein «Stand»/Datum und kein Status auf der Übersicht — Intro verspricht «mit Stand», die Übersicht hält es nicht
34. **[NIEDRIG · mittel · verbesserung]** (overview-ux) Sehr ungleiche Sektionsfüllung in BS — grosse Blöcke (213/137/121) ohne Vorab-Untergliederung, Mini-Sektionen (BaB 5, RiE 4) gleichrangig
35. **[NIEDRIG · klein · bug]** (reader-ux) Horizontaler Überlauf auf Mobil (~25 px) im Steuergesetz-Reader
36. **[NIEDRIG · mittel · verbesserung]** (reader-ux) Alle Artikel werden eager gerendert (keine Virtualisierung) — träge bei Lang-Gesetzen
37. **[NIEDRIG · mittel · luecke]** (nuetzlichkeit) Keine Unterscheidung Gesetz vs. Verordnung/Vertrag/Ordnung als Filter — nur eine Titel-Regex, die bei BS grob versagt
38. **[NIEDRIG · klein · verbesserung]** (nuetzlichkeit) Redundanter Titel: «Advokaturgesetz — Advokaturgesetz (291.100)» — bei 735 von 859 BS-Erlassen ist der Titel nur Kürzel + SR-Nr.
39. **[NIEDRIG · klein · verbesserung]** (nuetzlichkeit) Reader-Header zeigt für jeden BS-Erlass dieselbe Rubrik «Öffentliches Recht» — die Anzeige ist nichtssagend
40. **[NIEDRIG · klein · verbesserung]** (best-in-net) Kein amtlicher PDF-Download — nur selbst erzeugter Plain-Text
41. **[NIEDRIG · klein · verbesserung]** (best-in-net) Erlass-Metadaten (Stand, In-Kraft-Datum) in der Listenansicht nicht sichtbar
42. **[NIEDRIG · klein · verbesserung]** (a11y-perf-honesty) 26 Kanton-Schnellwechsel-Knöpfe haben als Screenreader-Namen nur das 2-Buchstaben-Kürzel
43. **[NIEDRIG · mittel · verbesserung]** (a11y-perf-honesty) register.json wird mit must-revalidate/max-age=0 und ungeteilt (alle 26 Kantone) ausgeliefert

---

All key locations confirmed. Here is the synthesized plan.

---

# UMSETZUNGSPLAN — Basel-Stadt zur besten Gesetzesseite im Netz

## TOP-5 (höchster Nutzen zuerst)

1. **Aufgehobene Artikel + paragraph_post + Randtitel im Extraktor heilen** (3 Datentreue-Bugs, ein Generator-Lauf) — der grösste Glaubwürdigkeits-Hebel: heute fehlen ganze §§, substanzielle Normtexte (z.B. Vermögensobergrenze Fr. 1'000'000 in §8a KVO) und alle amtlichen Randtitel.
2. **Gemeinderecht-Systematik (BaB/BeB/BeE/RiB/RiE) präfix-bewahrend indizieren** — 152 von 162 Erlassen sind falsch einsortiert, 2 Roots unsichtbar; ~19 % des Korpus systematisch fehlsortiert im Kern-Feature.
3. **Marginalien + §-Sprung-TOC für alle 859 BS-Erlasse** — 281-Artikel-StG ist heute nur per Scrollen benutzbar; amtliche Referenz zeigt «§ 1 Gegenstand» überall.
4. **Globale Kopf-Suche + kantonsweite Volltextsuche** — Anwältin tippt Gesetzesnamen ins prominenteste Feld und bekommt nichts; übergreifende Volltextsuche wäre DAS Alleinstellungsmerkmal (Daten liegen lokal vor).
5. **51 unsichtbare Erlasse als nur-live-link surfacen + Versionsgeschichte-Deeplink** — §8-Ehrlichkeit (still verschwundene Erlasse) und der grösste Funktionsabstand zur amtlichen Seite (Stichtagsfassung).

---

## 1) SOFORT-FIXES (Bugs / §8-Lücken)

Diese sind klein und teils im selben Generator-Lauf erledigt. Reihenfolge nach Aufwand/Risiko.

**S1 — Aufgehobene Artikel nicht mehr verschlucken** (hoch / mittel)
`scripts/normtext/adapter-lexwork.ts:135` (`if (parsed.bloecke.length === 0) continue;`): wenn `bloecke` leer, aber Artikel-Header existiert, Eintrag mit `status:'aufgehoben'` bzw. leerem Block emittieren statt droppen. `ArtikelBody.tsx:351` rendert leere Blöcke bereits als gedämpftes «aufgehoben» — kein UI-Eingriff nötig. Regressionsfall: 410.100 §6–§30, 153.100 §53. **87/1260 betroffen.**

**S2 — paragraph_post / text_content_post einlesen** (hoch / mittel)
`adapter-lexwork.ts` `parseSegment` (~Z.270): `paragraph_post`/`text_content_post` als Folge-Absatz/Fortsetzung behandeln (0 Treffer für `_post` heute). Regressionsfall fest in den Treue-Test: **834.410 §8a — Fr. 1'000'000-Vermögensgrenze, 360-Pflegetage-Verlängerung, ausserkantonal-Klausel.**

**S3 — Aufgehobene lit.-Buchstaben behalten** (mittel / klein)
`adapter-lexwork.ts:314` (`if (marke && text)`): bei leerem Body + vorhandener Marke ein item mit `aufgehoben`-Flag erzeugen (NICHT Text «Aufgehoben.» fabrizieren — zweite Wahrheit). Regressionsfälle: 640.100 §35 (lit. g), 832.710 §14 (lit. b).

**S4 — Absatz-Zwischentitel nicht als lit. fehldeuten** (mittel / mittel)
`adapter-lexwork.ts` `spaltInline`/`INLINE_MARKE` (Z.178/190): kurzer markierter Text gefolgt von markenlosem Langtext = Absatz-Zwischentitel, nicht lit.-item. Robuste Variante (NICHT reine ≥2-Marken-Schwelle, die §8a Abs.1/2 nicht heilt). Regressionsfall: 834.410 §8a a) Spital / b) Pflegeheim / c) Beitragshöhe.

**S5 — Gemeinde-Präfix im Systematik-Index bewahren** (hoch / mittel)
`scripts/normtext/kanton-systematik-run.ts:62/76` und `src/lib/normtext/systematik.ts:121/134`: `nurZiffern()` durch präfix-bewahrende Normalisierung ersetzen (Namespace-Schlüssel z.B. `BaB#152110`), Längster-Präfix-Match nur innerhalb des Namespaces. Erlasse ohne Präfix bleiben rein numerisch (Determinismus §2 gewahrt). Behebt zugleich **S6 automatisch** (BeB/RiB leer → wieder befüllt). Verifikation: Simulation → Ziel 162/162 im korrekten Root.

**S6 — Geister-Roots BeB/RiB** (mittel / klein) — durch S5 erledigt. Optional: amtlich vorhandene, aber leere Roots dezent als «(keine Erlasse importiert)» zeigen statt ausblenden (§8).

**S7 — srNum-Sortierung** (niedrig / klein)
`Gesetze.tsx:189`: `parseFloat(...)` durch (a) Präfix-Namespace + (b) stufenweisen Tupel-Vergleich (split an `.`) ersetzen. Grösstenteils durch S5 miterledigt.

**S8 — Doppel-Titel im Reader-Kopf** (mittel / klein)
`GesetzLeser.tsx:523` und `:452` (Download): `— {titel}` weglassen, wenn `titel` ohne `(NR)`-Suffix == `kuerzel`. Behebt «Advokaturgesetz — Advokaturgesetz (291.100)» bei 584/859 Erlassen.

**S9 — 129 degradierte Titel «KÜRZEL (SR)»** (hoch / mittel)
`scripts/normtext-snapshot.ts:195-198` `erlassBezeichnung`: `basis = abkuerzung.trim() || erlassName` verwirft den Volltitel sobald eine Abkürzung existiert. Fix: `tol.title` (liegt im Adapter Z.462 bereits vor) als `titel` übernehmen, `abbreviation` separat als `kuerzel`. Behebt 129 leere Titel + die ~406 Langtitel-im-kuerzel-Fälle. Neugenerierung aller BS-Snapshots.

**S10 — SR-Nr-Kontrast (WCAG-AA)** (mittel / klein)
`Gesetze.tsx:170/244/415/417/419` + `Sidebar.tsx:91`: `text-ink-400` (#8B8B81, 3.15:1) → `text-ink-500` (#6E6E64, ~4.8:1). 859 Knoten, primäres Ordnungsmerkmal. Trivialster Hebel.

**S11 — axe-Tor auf /gesetze** (mittel / klein)
`e2e/a11y.e2e.ts`: zwei Prüfpunkte `gesetze-kanton-BS` (eingeklappt + «Alle aufklappen») und `gesetze-leser-BS`. Gatet S10 und künftige Regressionen — Grund, warum der Kontrastfehler nie auffiel.

**S12 — aria-label der 26 Kanton-Pills** (niedrig / klein)
`Gesetze.tsx:400`: `aria-label={KANTON_NAMEN[k] ?? k}` (bereits importiert Z.414).

**S13 — Mobile-Overflow im Reader (~25px)** (niedrig / klein)
`ArtikelBody.tsx:429` (Listen-Text-Span): `min-w-0` + `overflow-wrap:anywhere`/`hyphens`. Ursache lange Komposita in Aufzählungen (nicht der Hanging-Indent). Reader-Overflow-Case in `e2e/gesetze.e2e.ts` ergänzen.

---

## 2) NÜTZLICHKEITS-AUSBAU (nach Impact × Aufwand)

**N1 — Randtitel pro Artikel extrahieren** (hoch Impact / mittel) ⭐
`adapter-lexwork.ts` `parseSegment`: `<div class='article_title'><span class='title_text'>` (footnote-bereinigt) lesen; `LexArtikel`-Schema (Z.35-43) um `titel` erweitern. Bei praktisch JEDEM Artikel vorhanden und verloren — Grundlage für TOC/Suche. Sinnvoll im selben Lauf wie S1–S4.

**N2 — Marginalien für alle 859 BS-Erlasse** (hoch / mittel) ⭐
`scripts/normtext/struktur-lexwork.ts` extrahiert Marginalien bereits sauber (BS-291.400: 26/26), wurde nur auf 5-Erlass-Sample angewendet. Bulk-Lauf über alle 859 → bestehende `margAnzeige`-Logik (`GesetzLeser.tsx:280-291`) greift sofort. §7-Drift-Tor verdrahten.

**N3 — §-Sprung-TOC für gliederungslose Lang-Gesetze** (hoch / mittel) ⭐
Sofort wirksamer Minimal-Fallback, bis die echte Abschnitts-/Titelstruktur extrahiert wird (= gross): wenn kein struktur-File, generierte §-Sprungliste/§-Raster in `GesetzLeser.tsx` (sticky, neben `sektionen.length > 0`-Pfad Z.558). Macht das 281-Artikel-StG navigierbar.

**N4 — Globale Kopf-Suche indexiert Gesetze** (hoch / mittel) ⭐
`src/lib/katalogSuche.ts` indexiert nur Rechner/Vorlagen. Lazy Index-Adapter über Browse-Manifest (`register.json`), eigene Rubrik «Gesetze» in `HeaderSuche.tsx`, Sprung in Lesesicht `/gesetze/:ebene/:key`. Reine Index-/Darstellungsschicht (§3/§5).

**N5 — Kantonsweite Volltextsuche** (hoch / mittel-gross) ⭐
Vorgebauter, komprimierter Volltext-Index über BS-Snapshots (20,2 MB roh → nicht naiv client-laden). Treffer mit Erlass + § + Snippet, Deeplink `#art-…`. Stärkstes Alleinstellungsmerkmal vs. amtliche Seite. Querbegriffe wie «rechtliches Gehör» (0 Titel-Treffer) müssen gefunden werden.

**N6 — Suche auf gewählten Kanton eingrenzen** (mittel / klein)
`Gesetze.tsx:347-369`: bei `ebene==='kanton' && kanton` Default `filtern(...).filter(e => e.kanton === kanton)` + sichtbarer Umschalter «Nur Basel-Stadt / Alle». Bei «tarif» heute 78 % Fremdtreffer.

**N7 — Artikelzahl + Stand-Jahr in SysZeile** (mittel / klein)
`Gesetze.tsx:167-179`: `e.artikelAnzahl` + `e.stand` (Jahr) rechtsbündig/tabular, mobil ausblendbar. Daten liegen vor (in `ErlassKarte.tsx:29-31` bereits genutzt). Sehr alte Stände dezent markieren (BS mischt 1826–2026).

**N8 — Karte/Layout-Priorität auf /gesetze** (mittel / klein-mittel)
`Gesetze.tsx:377-387`: im kt-Modus grosse Karte durch Mini-Wappen-Chip in der Zurück-Leiste ersetzen (redundant, da BS gewählt); in «Alle» `max-h` + kompaktes Padding bzw. kollabierbar, damit Liste über dem Fold beginnt. Heute ~525px Desktop / ganzer Mobil-Screen.

**N9 — Karte/Raster-Redundanz auflösen** (mittel / mittel)
`Gesetze.tsx:380-387` + `431-445`: einen Wähler primär; Wappen-Raster zu kompakter A-Z-Zeile mit Zähler verdichten.

**N10 — Mobile Sektionstitel + Sektionskopf-Andeutung** (mittel / klein)
`Gesetze.tsx:234`: `truncate` → `line-clamp-2`/Umbruch (11/12 Top-Sektionen abgeschnitten); Zähler kleiner. Optional: «213 · 9 Untergruppen» im geschlossenen Kopf, Sprungindex/Warnung bei «Alle aufklappen» (17697px).

**N11 — Verlauf «zuletzt geöffnet» + Favoriten** (mittel / klein-mittel)
localStorage-Muster existiert (`src/components/start/Favoriten.tsx`). Chip-Reihe oben in Kanton-Ansicht + Stern je Erlass. Kein Backend (§3).

**N12 — Erlassart-Filter** (niedrig / mittel)
Strukturierte `erlassart` (Gesetz/Verordnung/Staatsvertrag/Konkordat/Tarif) im Generator aus Titel/SR-Systematik ableiten, Filter-Chips in Kanton-Ansicht. `rechtsgebiet` ist bei allen 859 = 'oeffentlich', unbrauchbar.

**N13 — Reader-Overline mit Sachgebiet** (niedrig / klein)
`GesetzLeser.tsx:521`: statt Einheits-«Öffentliches Recht» das Sachgebiet aus `systematik.ts` (`sachgruppe`/`topTitel`) zeigen. Verdrahtung liegt vor.

**N14 — Amtlicher PDF-Link + versionierter Permalink** (niedrig / klein)
`pdfUrl` (Adapter Z.466 `pdf_link_tol`) durch Snapshot → register.json reichen; im Reader-Header rendern. Kürzel-Display-Bereinigung (S8) inklusive.

**N15 — Render-Performance** (niedrig / klein-mittel)
`GesetzLeser.tsx:628`: Default «erster Pfad offen, Rest zu» nutzen (conditional mount Z.499 existiert bereits) statt 281 Artikel eager. `content-visibility:auto` als günstige Bremse für gliederungslose Lang-Gesetze. Nicht dringend.

**N16 — Cache-Header / register-Chunking** (niedrig / mittel)
`vercel.json`: `/normtext/(.*)` mit `stale-while-revalidate` bzw. content-hash + immutable. Chunking pro Kanton erst bei 5000+. Nicht dringend.

---

## 3) BEST-IN-NET-DIFFERENZIERER (was BS einzigartig stark macht)

**D1 — Versionsgeschichte / Zeitreise** (hoch / gross) — der grösste Funktionsabstand
Heute nur geltende Fassung (ein `stand`/`fassungsToken`). Amtliche Seite kann «Versionen vergleichen», «Chronologische Dokumente», Stichtagsfassung. Stufen:
- **Sofort (klein):** amtlichen Deeplink «Versionen vergleichen» je Erlass verlinken (zuverlässige Zwischenmassnahme — LexWork-Versions-API nicht verifiziert).
- **Mittelfristig (gross):** Versionsliste aus LexWork ziehen, Versions-Dropdown + Stichtagsfilter «geltende Fassung am …» in `GesetzLeser`. Kür: echter Text-Diff zweier Fassungen. Kernfrage jeder Kanzlei (altrechtliche Fälle/Übergangsrecht).

**D2 — Kantonsweite strukturierte Volltextsuche** (= N5)
Amtliche Seite + lexfind bieten das, aber LexMetrik hält den Volltext bereits **strukturiert** (§/lit.-genau, Deeplink, Snippet) — das schlägt die amtliche Trefferliste qualitativ. Mit N1/N2 (Randtitel/Marginalien) als Treffer-Kontext wird es überlegen.

**D3 — Datengetriebene Status-/Prüfstand-Ehrlichkeit (§8)** (hoch / gross)
Heute sind alle 859 BS-Erlasse ununterscheidbar `snapshot`; ein ungeprüfter Auto-Import sieht aus wie ein abgenommener. Schritte:
- `confidence.json` deckt nur 5/859 BS ab und wird in `src/` nie geladen. **confidence-Lauf** (`check-confidence.ts` existiert) auf alle 859 BS ausweiten, Ergebnis in `browse.ts` laden.
- Marker in SysZeile + Leser-Kopf: «automatisch importiert · fachlich nicht abgenommen» vs. «abgenommen». **Jetzt setzbar ohne Davids Fachzeit** (FAHRPLAN-LERNPHASE-2026 Strang A; Abnahme-Zeitsperre bis 1.12.2026). Sichtbar gemachte Unsicherheit statt weggeglättet = echter Vertrauensvorsprung gegenüber der amtlichen Seite, die diese Unterscheidung gar nicht macht.

**D4 — Ehrliche, vollständige Abdeckung mit Drift-Überwachung** (hoch / klein-mittel)
- 51 in Kraft stehende BS-Erlasse sind komplett unsichtbar. `scripts/normtext-snapshot.ts:261`-Zweig (heute `continue`): `status:'nur-live-link'`-Registereintrag emittieren (Mechanik existiert: `register.ts:23`, `browse-typen.ts:20-23`, `ErlassKarte.tsx:56`). **Achtung:** auch der `uebersprungen`-Pfad (Z.759-762) muss gleich behandelt werden, sonst bleibt die Lücke teils offen. Niedrig ranggewichten (Randmaterie), damit Kern-Statute nicht verwässern.
- **Abdeckungs-Drift-Tor:** `enumeriereKanton`-Sollzahl gegen Registereinträge in `check:netz` warnen + datierten Discovery-Snapshot ins Repo schreiben. Macht die wachsende Lücke (48→51) diffbar statt flüchtig auf der Konsole. Sobald nur-live-link greift, deckt es die Mengen-Drift grösstenteils ab.

**D5 — Steuertarif als echte Tabelle** (hoch / mittel) — Schaufenster-Differenzierer
§36 StG (Einkommenssteuer-Tarif A/B) ist Textwand. Vorschlag (b): `staffelZeilen` (`ArtikelBody.tsx:104-138`) um eng getriggertes BS-Muster «≥2 ‹Von/Über … bis … Franken: … je 100 Franken›» ergänzen — adversarialer Scan: trifft NUR §36, 0 False Positives, gefahrlos. Sauberer (§7) wäre Extraktion als `mehrspaltig`-Tabelle im Generator. Tarif-Lesbarkeit ist das Kernversprechen eines Steuergesetzes.

**D6 — In-Gesetz-Treffer-Highlighting** (mittel / klein)
`GesetzLeser.tsx`: Suchbegriff als `<mark>` (dezent brass) im gerenderten Artikel, koexistent mit Autolink/NormText (Highlight auf Text-Segmenten vor dem Verlinken). + «1 von N»-Sprung. Heute 0 `<mark>` trotz «15 Treffer».

---

### Empfohlene Ausführungs-Bündelung (minimiert Generator-Läufe)
- **Lauf A (ein Snapshot-Neulauf, deklarierte fachliche Änderung — sha/fassungsToken driften):** S1+S2+S3+S4+S9 + N1 + N14-Datenfeld + D5-Generator-Variante. Danach Drift-/Treue-Tests mit Regressionsfällen (410.100, 834.410 §8a, 640.100 §35).
- **Lauf B (Systematik):** S5+S6+S7.
- **Lauf C (Struktur-Bulk):** N2 + N3-Daten.
- **Reine UI/Test (kein Generator):** S8, S10–S13, N6–N13, N15, D6.
- **Daten+UI:** D1, D2/N5, D3, D4.


---

## Ultra-Check Gesetzesdarstellung (23.6.2026, 33 Befunde)

1. **[HOCH·mittel·vollstaendig]** BS-Tariftabellen rendern als flacher ·/—-Fliesstext statt als Tabelle (enumeration_tabular wird nicht strukturiert)
2. **[HOCH·gross·einheitlich]** Keine Gliederung/TOC für faktisch alle BS-Erlasse — Bund hat sie, Kanton nicht
3. **[HOCH·gross·uebersichtlich]** BS-Gesetze haben gar keine Gliederung/TOC — auch das Vorbild-Flaggschiff StG (292 Art.) wird strukturlos durchgescrollt
4. **[HOCH·mittel·nuetzlich]** Einkommenssteuer-Tarif StG § 36 ist eine Textwand statt einer Tarif-Tabelle
5. **[HOCH·mittel·nuetzlich]** Vermögenssteuer-Tarif StG § 50 zeigt rohe Tabellen-Trennzeichen (· und —) im Fliesstext
6. **[HOCH·klein·nuetzlich]** HTML-Entities &sup2; &sup3; &ge; &le; &acirc; u.a. erscheinen unaufgelöst im Normtext
7. **[HOCH·mittel·nuetzlich]** Reader-H1, Breadcrumb und Browser-Tab zeigen bei ~27 BS-Verträgen einen sinnlosen Titel-Fragmentsatz statt des Erlasstitels
8. **[HOCH·mittel·nuetzlich]** Interne Querverweise mit § werden nicht verlinkt (trifft 740 von 859 BS-Erlassen)
9. **[HOCH·mittel·nuetzlich]** Globale Kopf-Suche findet keine Gesetze (nur Rechner/Vorlagen-Katalog)
10. **[MITTEL·gross·vollstaendig]** Keine Abschnitts-/Gliederungsnavigation (gliederung) für 854 von 859 BS-Erlassen
11. **[MITTEL·klein·einheitlich]** «SR 111.100» für kantonale Erlasse — falsche Sammlungsbezeichnung (Bund-Label am Kanton)
12. **[MITTEL·mittel·einheitlich]** Absatz-Marker uneinheitlich: «Ziff. 2.1.» / «1. II» / «1.» statt schlichter Absatznummer
13. **[MITTEL·mittel·uebersichtlich]** Kein Running-Header / Standortpfad beim Scrollen — auf Mobil komplett orientierungslos
14. **[MITTEL·mittel·uebersichtlich]** StG zeigt verwaiste Unter-Randtitel (»a) Grundsatz«) ohne übergeordnete Überschrift
15. **[MITTEL·mittel·nuetzlich]** Gebühren-Tabellen mit Prosa-Vorlauf bleiben als Textwand (Gerichtsgebührenreglement § 29 u.a.)
16. **[MITTEL·mittel·nuetzlich]** Spaltenversatz in IWB-Gebührentarif-Tabelle (BS-772.430 § 3): Caption als Phantom-Spalte, Tarif-Nr. verrutscht
17. **[MITTEL·klein·uebersichtlich]** Vor/Zurück-Navigation am Erlass-Fuss läuft auf schmalem Viewport über den rechten Rand (abgeschnittener Link)
18. **[MITTEL·gross·nuetzlich]** Keine kantonsweite Volltext-Suche über Erlasse hinweg
19. **[NIEDRIG·klein·einheitlich]** Whole-repealed Artikel mal mit, mal ohne Randtitel — quellenbedingt, aber visuell uneinheitlich
20. **[NIEDRIG·klein·einheitlich]** Bestätigt einheitlich: «aufgehoben»-Darstellung über Absätze, lit./Ziff. und Ganz-Artikel
21. **[NIEDRIG·klein·einheitlich]** Bestätigt einheitlich: Tausendertrenner, lit./Ziff.-Marken und Reader-Kopf (Bund vs. Kanton)
22. **[NIEDRIG·klein·einheitlich]** Top-Sektionstitel «Erziehung Wissenschafts- und Kulturpflege» fehlen die Trennzeichen (Daten-Inkonsistenz, prominent)
23. **[NIEDRIG·klein·nuetzlich]** Gekürzte Erlass-Titel in der Systematik-Liste haben keinen title-Tooltip (Lese-Sackgasse)
24. **[NIEDRIG·klein·uebersichtlich]** Mobiler Top-Sektionstitel klemmt mehrteilige Namen unschön (line-clamp-2 schneidet «Organisation» ab)
25. **[NIEDRIG·klein·uebersichtlich]** Reader-Overline trägt für StG das überlange Top-Sachgebiet statt der treffenden Untergruppe
26. **[NIEDRIG·klein·uebersichtlich]** Mobile-Gliederungs-Umschalter erscheint nie, weil er an sektionen.length hängt
27. **[NIEDRIG·klein·nuetzlich]** Bestätigt gut: strukturierte mehrspaltig-Tabellen rendern sauber (Ausrichtung, Tausendertrenner, horizontales Scrollen)
28. **[NIEDRIG·klein·uebersichtlich]** Mobile-Overflow im Steuergesetz (BS-640.100) noch in PROD sichtbar — lokaler S13-Fix nicht deployt
29. **[NIEDRIG·klein·uebersichtlich]** Verwaiste temporäre e2e-Testdateien im Repo (frühere Sessions)
30. **[NIEDRIG·klein·nuetzlich]** Bestätigt gut: Suche, Suffix-Anker, Gemeinderecht-Reader, Aufgehoben-Marker, Übersichts-Titel
31. **[NIEDRIG·klein·nuetzlich]** Kein Erlassart-Filter (Gesetz / Verordnung) in der Kanton-Liste
32. **[NIEDRIG·klein·nuetzlich]** Amtlicher Quelle-Link enthält rohe Leerzeichen (162 BS-Erlasse) — fragil
33. **[NIEDRIG·mittel·nuetzlich]** Kein direkter amtlicher PDF-/Versions-Link je Erlass

---

Hier ist der priorisierte Fixplan als Chefarchitekt. Ich habe die 30 bestätigten Befunde nach Impact×Aufwand und den vier Kriterien synthetisiert. Eine Erkenntnis vorab strukturiert alles: **die Hälfte der schweren Befunde hat eine gemeinsame Wurzel** (Tarif-Tabellen-Flattening + fehlende Gliederung), und zwei winzige Datei-Edits räumen die sichtbarsten Schäden weg.

---

# TOP-7 (höchster Nutzen zuerst)

**T1 — HTML-Entities dekodieren (`&sup2;`/`&ge;`/`&le;`/`&acirc;`)**
Höchstes Impact/Aufwand-Verhältnis überhaupt: kleinster Fix (eine Datei), korrigiert 438+ sichtbare Vorkommen, und die `&ge;/&le;`-Leaks verfälschen Tarif-SCHWELLEN (inhaltlich irreführend, nicht nur kosmetisch).
Weg: `scripts/normtext/html-entities.ts` → `NAMED_ENTITIES` ergänzen (`&sup1/2/3`, `&ge`→≥, `&le`→≤, `&acirc/&Acirc`, `&mu`, `&plusmn`, `&divide`, `&not`, `&reg`, `&frasl`, `&eta`); danach `npm run normtext` (§7: nie von Hand editieren); Regressionstest in `src/tests/normtext-entities.test.ts`. Aufwand: klein.

**T2 — Kaputte Reader-Titel bei ~27 BS-Verträgen (H1/Tab/Breadcrumb = Satzfragment)**
Der sichtbarste Identitätstext zeigt mid-sentence-Fragmente wie „b) den Betrieb der Hafenbahn…" statt des Erlasstitels — direkt im Vorbildkanton, im register.json eingefroren.
Weg: `scripts/normtext/browse-manifest.ts` `identitaetAusErlass()` (Z.56-69) härten: Last-Comma-Split nur akzeptieren, wenn der Tail kürzel-typisch ist (kurz/ein Wort/Grossbuchstaben-Abk.) UND nicht klein bzw. „x)" beginnt — sonst `kuerzel=titel=voller String`. **Wichtig:** auch grossgeschriebene Fragmente abdecken (BS-955.700/952.820/428.100), die die Lowercase-Heuristik verpasst. Reader robust gegen `kuerzel==titel`. Manifest neu generieren. Aufwand: mittel.

**T3 — Tarif-Tabellen rendern (StG §36/§50, GGR §29) — die gemeinsame Tabellen-Wurzel**
Bündelt 5 schwere Befunde: StG §36 Einkommenssteuer (Textwand), §50 Vermögenssteuer (rohe `·`/`—` im Lesetext = „kaputt"-Eindruck), §39/§131, GGR-Gebühren, IWB. Häufigste Nachschlage-Operation eines Steuergesetzes, namentlicher Prüfpunkt.
Weg (zweistufig):
- Sauber (§7-konform): in `scripts/normtext/mehrspaltige-tabelle.ts` `zerlegeZelle()`/`extrahiereMehrspaltig()` (Z.15-42) einen eng getriggerten Tarif-Band-Pfad ergänzen: label-lose Zellen positionsbasiert als Spalten zulassen, wenn ≥2 Zeilen STABIL gleiche `·`-Zellzahl haben; `TARIF_NR_RE` um buchstaben-suffigierte Positionen (`4.a)`, `ca)`) erweitern; Prosa-Vorlauf vor erster Tarif-Nr. als Caption abtrennen. Dann greift `MehrspaltigeTabelle` automatisch.
- Sofort-Auffangnetz (ohne Re-Generierung): `staffelZeilen()` (`ArtikelBody.tsx` Z.104-139) um case-insensitives `(Von|Über)`-Band + **Em-Dash U+2014** (nicht nur En-Dash U+2013) erweitern, damit nie rohe `·`/`—` im Lesetext stehen.
- Adversarial gegen die 31-37 Fundstellen prüfen (keine normalen Absätze zerschneiden), dann `npm run normtext`. Aufwand: mittel.

**T4 — Gliederung/TOC für BS füllen (StG & alle Erlasse) — Bund hat sie, Kanton nicht**
Bündelt 5 Befunde (Hauptlücke + Stilbruch + verwaiste Unter-Randtitel + Running-Header + Mobile-Toggle). BS-Flaggschiff StG (292 Art.) wird strukturlos durchgescrollt; KEIN BS-Erlass bekommt TOC, während OR 158 Sektionen zeigt. Die TOC-Infrastruktur (`baueGliederungsbaum`, Scroll-Spy, `aktivIds`/`pfadZu`) steht komplett — es fehlen nur die `gliederung`-Daten.
Weg: **Kern-Korrektur am Vorbefund** — kein Neubau nötig: `scripts/normtext/struktur-kanton-run.ts` (npm `normtext:struktur-kanton`) iteriert bereits alle BS-Snapshots und `extrahiereStrukturLexWork` liefert verifiziert non-empty `gliederung` für alle 292 StG-Tokens. Der Fix ist im Kern ein **RE-RUN** + Klärung, warum bisher nur 5 BS-Sidecars (alle mit leerer `gliederung`) erzeugt wurden (Coverage-/Lauflücke, keine Capability-Lücke). Danach greifen TOC-Spalte, Inline-Sektionen, Scroll-Spy und die a)/b)-Randtitel bekommen ihren Eltern-Kontext automatisch. Aufwand: realistisch klein-mittel (nach Vorbefund-Korrektur, nicht „gross").

**T5 — Globale Kopf-Suche + interne §-Verlinkung (Auffindbarkeit & Verzahnung)**
Zwei Verzahnungs-Lücken, beide mit bereits vorhandener Infrastruktur, hoher Praxisnutzen:
- Kopf-Suche (`HeaderSuche.tsx` Z.14-16) durchsucht nur den Rechner/Vorlagen-Katalog, NICHT die 859+ Gesetze. „Advokaturgesetz"/„291.100" findet nichts. Weg: bei Eingabe zusätzlich `ladeBrowseManifest` über `filtern()` durchsuchen, Top-Treffer als Deeplinks `/gesetze/<ebene>/<key>`. Daten + Filter existieren — nur Verdrahtung in der Shell.
- §-Querverweise (`NormText.tsx` ART_INTERN Z.52-57) matchen nur „Art."; 4104 „§ N"-Verweise in 740 BS-Erlassen sind toter Text. Weg: `§ N` (inkl. Suffix `§ 12a`) als INTERNEN Selbstbezug gegen die vorhandene `tokenMap` auflösen (kein Fremd-Erlass-Risiko; nicht aufgelöste § bleiben Text → §8). 3421/4104 würden klickbar. Aufwand je: mittel.

**T6 — „SR"-Label am Kanton korrigieren (`sammlungsLabel`)**
Fachlich falsch: „SR 111.100" auf der BS-Verfassung („SR" = Bundessammlung). Betrifft 697 BS- / 963 kantonale Erlasse, plus Doppel-Defekt „SR BaB 111.100" bei 162 Präfix-tragenden.
Weg: Helper `sammlungsLabel(erlass)` an beiden Stellen (`GesetzLeser.tsx` Z.566 Header + Z.493 Download): Bund→„SR", Kanton→ohne „SR" bzw. neutral „Nr."; **vorhandenes sr-Präfix (BaB/RiE) respektieren**, nicht blind „SG" voranstellen. Aufwand: klein.

**T7 — Mobile-Layout-Overflow beheben + S13-Fix deployen**
Drei zusammenhängende Layout-Befunde, alle klein, alle auf der Aushänge-BS-Verfassung sichtbar:
- Vor/Zurück-Nav am Erlassfuss (`GesetzLeser.tsx` Z.672-676) erzeugt bei 360px 32px H-Overflow (ungekürzte volle kuerzel). Weg: `truncate min-w-0 max-w-[45%]` + `title=` oder `flex-col` auf schmal. Synergie mit T2 (kürzere kuerzel).
- Item-Text-Overflow im StG (§66 lit. d) ist in PROD noch sichtbar, weil der bereits committete S13-Fix (`ArtikelBody.tsx` Z.429) nicht deployt ist → nach §9 David-Freigabe ausrollen.
- Quelle-URL mit rohem Leerzeichen (162 BS-Erlasse, BeE/RiE) bricht beim Kopieren/Download. Weg: `encodeURIComponent` auf den Pfadteil in `kanton-discovery-quellen.ts:64` (oder defensiv beim Rendern → wirkt sofort auf Download-Text Z.494). Aufwand: klein.

---

# 1) SOFORT-FIXES (Bugs/Logik/Inkonsistenzen)

| # | Befund | Datei/Stelle | Aufwand |
|---|--------|--------------|---------|
| S1 | **Entities `&sup2;/&ge;/&le;/&acirc;`** unaufgelöst (438+×; Tarif-Schwellen betroffen) | `scripts/normtext/html-entities.ts` NAMED_ENTITIES + `npm run normtext` | klein |
| S2 | **Kaputte Reader-H1/Tab** bei ~27 BS-Verträgen (Satzfragment) | `scripts/normtext/browse-manifest.ts` `identitaetAusErlass()` Z.56-69 + Regenerierung | mittel |
| S3 | **`·`/`—`-Rohtrenner im Lesetext** (StG §50, IWB) | `mehrspaltige-tabelle.ts` `zerlegeZelle` Z.25-43 / Fallback `staffelZeilen` Em-Dash | mittel |
| S4 | **IWB-Spaltenversatz** (Caption als Phantom-Spalte, §3+§4) | `adapter-lexwork.ts` Caption→Vortext trennen, Tarif-Nr. in Spalte 0 | mittel |
| S5 | **„SR"-Label am Kanton** + Doppel-Präfix „SR BaB" | `GesetzLeser.tsx` Z.566/Z.493, Helper `sammlungsLabel()` | klein |
| S6 | **Absatz-Marker uneinheitlich** („Ziff. 2.1.", „1. II"+Body-Doppelung, „1.") 16 Dateien | Extraktor heilen + defensiv `darstellung.ts` `absatzMarke()` Z.83-90 (`\d+\.`→`\d+`; nicht-num. nicht als Nummer) | mittel |
| S7 | **Quelle-URL roher Space** (162 BS, bricht Copy/Download) | `kanton-discovery-quellen.ts:64` `encodeURIComponent` | klein |
| S8 | **Systematik-Titel ohne Trenner** „Erziehung Wissenschafts- und Kulturpflege" | im Systematik-Adapter/Mapping → „Erziehung · Wissenschaft · Kultur"; neu generieren (nicht JSON von Hand) | klein |
| S9 | **Mobile-Toggle-Kopplung** an `sektionen.length` (greift nach T4-Daten-Fix) | `GesetzLeser.tsx` Z.599/601-603/643 — beim Daten-Fix mitprüfen | klein |
| S10 | **Verwaiste `_tmp_*.e2e.ts`** (testMatch sammelt sie ein) — Evidenz veraltet, Kern real: `rm e2e/_tmp_aufgehoben.e2e.ts` + testMatch `!**/_tmp_*` | `playwright.config.ts` | klein |

---

# 2) FORMATIERUNG & ÜBERSICHT (konkrete UI-Schritte)

- **F1 — Gliederung/TOC für BS füllen** (= T4): `normtext:struktur-kanton` RE-RUN; danach erscheinen TOC-Spalte, Inline-Sektionen, Scroll-Spy. Andockpunkt `struktur-lexwork.ts:52` / `struktur-kanton-run.ts`.
- **F2 — Running-Header/Breadcrumb beim Scrollen**: in die sticky Suchleiste (`GesetzLeser.tsx` Z.641-654) gekürzten Gliederungspfad aus vorhandenem `aktivIds`+`pfadZu` einblenden; mobil als einzige Standortquelle. Greift automatisch sobald F1 Daten liefert.
- **F3 — Reader-Overline kürzen**: bei vorhandener Untergruppe `subTitel` („64 Allgemeine Steuern") statt langem Top-Compound zeigen — `GesetzLeser.tsx` `overlineGebiet` Z.463-471 (nur wenn `sub` nicht-leer).
- **F4 — Nav-Overflow am Fuss** (= T7): `truncate min-w-0 max-w-[45%]`/`flex-col`, `GesetzLeser.tsx` Z.672-676.
- **F5 — title-Tooltip auf gekürzten Titeln**: `title={e.titel}` an `Gesetze.tsx:184` (SysZeile) und `ErlassKarte.tsx:44` (`kuerzel — titel`). Layout-/a11y-neutral, ein Attribut.
- **F6 — Mobile Top-Sektionstitel** verwaister `·`: `line-clamp-3` auf Mobil oder schmalere Nummernspalte, `Gesetze.tsx:256`.
- **F7 — Aufgehobene-Artikel-Randtitel** (70/962 uneinheitlich): quellentreu belassen ist vertretbar (§7) — **Entscheid David** vor Vereinheitlichung einholen, nicht eigenmächtig ausgrauen.

---

# 3) NÜTZLICHKEIT / DIFFERENZIERER (Funktionslücken)

- **N1 — Globale Kopf-Suche über Gesetze** (= T5a): `HeaderSuche.tsx` Z.14-16. Grösste Auffindbarkeits-Reibung; Daten+Filter vorhanden.
- **N2 — Interne §-Verlinkung** (= T5b): `NormText.tsx` ART_INTERN Z.52-57; 4104 tote „§ N" → klickbar via `tokenMap`.
- **N3 — Kantonsweite Volltext-Suche**: Build-Zeit-Index (minisearch/lunr) pro Kanton, clientseitig, statik-konform (§2); BS als Pilot. Aufwand: gross — nach N1/N2 priorisieren.
- **N4 — Amtlicher PDF-/Versions-Link je Erlass**: `meta.pdfUrl` wird in `adapter-lexwork.ts:606` bereits gefetcht (`pdf_link_tol`), nur nicht ins register persistiert → ins `register.json` schreiben + Chip „↗ Amtliches PDF" neben „geltende Fassung" (`GesetzLeser.tsx` Z.571). Datenseitig fast gratis. Aufwand: mittel.
- **N5 — Erlassart-Filter (Gesetz/Verordnung)**: leichter Toggle in `KantonSystematik`-Kopfzeile mit bestehender `istVerordnung()` (`Gesetze.tsx` Z.50); würde BS-Liste ~halbieren. Komfort, nachrangig. Aufwand: klein.

---

# Bestätigt gut (keine Massnahme, als Regressions-Baseline halten)

- **„aufgehoben"-Darstellung** über Absatz/lit./Ziff./Ganz-Artikel konsistent gedämpft, 0 Falsch-Positive (`ArtikelBody.tsx` Z.82-92) — Referenzmuster für andere Kantone.
- **`mehrspaltig`-Tabellen-Rendering solide** (Ausrichtung, tabular-nums, Tausendertrenner, overflow-x-auto) — das Fundament steht, T3 muss nur Inhalte zuleiten.
- **Tausendertrenner** (Geld-kontextsensitiv, Jahre ungruppiert), **lit./Ziff.-Ableitung**, **Reader-Kopf Bund/Kanton strukturgleich**, **titelRedundant**. (Nebenbefund ausserhalb BS: Overline labelt Bundes-VO hart als „Bundesgesetz" `GesetzLeser.tsx` Z.561 — real, aber nicht BS-Fokus.)
- **Suche/Suffix-Anker/Gemeinderecht-Reader** edge-case-fest.

---

# Architekten-Empfehlung zur Reihenfolge

**Welle 1 (ein Tag, sichtbarster Gewinn):** S1+S5+S7+S8+F5+F6 — alles kleine Edits, die die meisten sichtbaren Schäden im Vorbildkanton wegräumen. Dann T4-RE-RUN (F1), da er die grösste Übersichtslücke schliesst und F2/N-Randtitel-Kontext mitzieht.
**Welle 2:** S2 (kaputte Titel) + T3 (Tarif-Tabellen) — beide mittel, beide schwere/sichtbare Mängel mit gemeinsamer Tabellen-Wurzel.
**Welle 3:** N1+N2 (Verzahnung/Auffindbarkeit) + N4 (PDF-Link, fast gratis).
**Welle 4:** N3 (Volltext-Index) als grösserer Differenzierer.

Kritischer Hebel: **T4 ist kein „gross"-Neubau** wie zwei Vorbefunde behaupteten — der Kanton-Struktur-Runner existiert und funktioniert auf BS-LexWork bereits; der Fix ist primär ein Lauf + Coverage-Klärung. Das verschiebt die grösste Übersichtslücke von „teuer/später" nach „früh/billig". Vor jedem Deploy: Topologie-Check (Memory-Lektion) + §9 David-Freigabe.
