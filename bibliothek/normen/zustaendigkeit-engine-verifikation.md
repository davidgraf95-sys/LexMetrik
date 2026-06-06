# Verifikations-Dossier — `src/lib/zustaendigkeit.ts` (Deep-Research 6.6.2026)

**Gegenstand:** Sämtliche Norm-Behauptungen der ZPO-Zuständigkeits-Engine
(838 Zeilen: `bestimmeZustaendigkeit` + `bestimmeRechtsmittel`), zerlegt in
37 Behauptungs-Cluster und gegen die amtlichen Quellen geprüft.

**Quellen + Stand (§7, abgerufen 6.6.2026):**
- ZPO SR 272, Fedlex-Filestore-HTML, Konsolidierung **20250101**
  (`eli/cc/2010/262/20250101/de/html/…html-4.html`) — **bestätigt: keine
  neuere in Kraft stehende Fassung berührt die geprüften Artikel** (2026-Treffer
  waren deutsche ZPO bzw. SchKG-Punktänderung; «20.4.2026» = Fedlex-UI-Artefakt).
- BGG SR 173.110, Filestore-HTML, Konsolidierung **20250101** — die «kleine
  BGG-Revision» ist Stand 6.6.2026 NICHT in Kraft (Botschaft 5.12.2025,
  parlamentarisches Stadium; Quelle bj.admin.ch). → Verfallsregister-Kandidat.
- Revision 1.1.2025: AS 2023 491 · BBl 2023 786 · bj.admin.ch (Inkraftsetzung
  6.9.2023 per 1.1.2025).
- Wo der Filestore-Fetch truncierte (Art. 197/198/200/202, 243): wortgetreue
  Spiegel swissrights.ch / bger.li / app.zpo-cpc.ch, mehrfach deckungsgleich
  (als Spiegel gekennzeichnet, formal Sekundärquelle).
- BGE 133 III 393: DFR-Spiegel servat.unibe.ch + bger.ch.

**Methode:** (1) Deep-Research-Harness, 102 Agents: 5 Suchwinkel → 20 Quellen →
83 extrahierte Claims → 25 adversarial verifiziert (je 3 unabhängige
Widerlegungs-Voten) — **25/25 bestätigt, 0 widerlegt**, Schwerpunkt
revisionskritische Behauptungen. (2) Die von der Harness selbst offengelegte
Abdeckungslücke (örtliche Gerichtsstände, Art.-5-Katalog, BGG-Block) mit drei
gezielten Verifikations-Agents direkt am Filestore-HTML geschlossen.

---

## Gesamtbefund

**Kein einziger fristen- oder ergebnisverfälschender Fehler in der Engine.**
Alle Schwellen, Fristen, lit.-Zuordnungen und Revisions-Behauptungen halten dem
Wortlaut stand — einschliesslich der heiklen Punkte:

| Geprüft | Befund |
|---|---|
| `ZPO_SCHWELLEN` 30'000 / 10'000 / 2'000 / 100'000 / 30'000 / 100'000 | alle wortlautgenau (243 I · 210 I c [rev. 2025, vorher 5'000] · 212 I · 199 I · 6 II b · 8 I) |
| `RECHTSMITTEL_SCHWELLEN` 10'000 / 15'000 / 30'000 | wortlautgenau (308 II ZPO · 74 I a/b BGG) |
| Art. 314 Abs. 2 (K-1-Fix) | **bestätigt:** steht im Berufungskapitel, «Frist zur Einreichung der Berufung und der Berufungsantwort je 30 Tage»; Art. 321 kennt KEINE Familien-Ausnahme → Beschwerde bleibt 10 Tage. Anschlussberufung zulässig. |
| Art. 199 Abs. 3 (neu 2025) | bestätigt; Nuance: «kann … direkt einreichen» = Option, kein Verbot der Schlichtung — Engine-Framing («Klage direkt beim Gericht») korrekt |
| Art. 5 Abs. 1 lit.-Katalog (H1-Fix) | **jeder Buchstabe einzeln bestätigt:** nur lit. d (UWG: >30'000 ODER Bundes-Klagerecht) und lit. f (Bund: NUR >30'000, keine Alternative) bedingt; a–c, e, g–i unbedingt. Abs. 2 (vorsorgl. Massnahmen vor Rechtshängigkeit) bestätigt |
| Art. 6 Abs. 2 (rev. 2025) | kumulativ a–d bestätigt inkl. landwirtschaftlicher Pacht in lit. d; Abs. 3 Klägerwahlrecht bestätigt; HG real nur ZH/BE/AG/SG bestätigt |
| Örtliche Gerichtsstände (10/23/28/31–40/20/17/18/35/9/2/62/64) | alle bestätigt, inkl. Geschädigten-Forum Art. 36 («geschädigte Person» im Wortlaut), Art. 38a zwingend, Art. 20 lit. d DSG, Art. 28 I ohne «zwingend» (Engine: dispositiv — korrekt) |
| Art. 145 / 142 III ZPO · 46 / 45 / 47 / 100 / 51 / 92 / 93 / 98 / 75 II / 113 ff. BGG | alle wortlautgenau; 75 II c «Zustimmung aller Parteien»; 117 verweist auf 100 → gleiche 30-Tage-Frist für subsidiäre Verfassungsbeschwerde |
| BGE 133 III 393 | Regeste bestätigt: Eheschutz = vorsorgliche Massnahme i.S.v. Art. 98 BGG (E. 5) |

## Befunde (Abweichungen / Lücken)

### B-1 · ERGEBNISRELEVANT: Art. 113 Abs. 2 lit. g ZPO — DSG-Kostenfreiheit der SCHLICHTUNG fehlt
- **Wortlaut:** Art. 113 Abs. 2 zählt lit. a–g; **lit. g: Streitigkeiten nach dem
  DSG** (eingefügt mit nDSG). Engine-Kommentar (Z. 144–147) nennt nur GlG/Miete/
  Arbeit und klammert «BehiG/MitwG/KVG-Zusatz» aus — **DSG fehlt in beiden Listen**,
  obwohl `persoenlichkeitUnterfall: 'datenschutz'` eine abgebildete Streitsache ist.
- **Wirkung:** Für Datenschutz-Klagen meldet die Engine `kostenlos: false`
  (Z. 408–418 hat keinen datenschutz-Zweig) — falsches Negativ. Die Engine weist
  die DSG-Kostenfreiheit des ENTSCHEIDverfahrens (114 lit. g) korrekt aus, die der
  Schlichtung nicht → in sich inkonsistent.
- **Deterministische Regel:** `streitsache=persoenlichkeit ∧ unterfall=datenschutz ∧
  schlichtung obligatorisch → kostenlos: true, Grund «Art. 113 Abs. 2 lit. g ZPO»`.
- **Status: UMGESETZT 6.6.2026 (Freigabe David):** datenschutz-Zweig in
  `kostenlosGrund` + Kommentar-Korrektur (`zustaendigkeit.ts`), neuer Test
  (DSG ✓ lit. g · verletzung/gegendarstellung ✗ · gewaltschutz ohne Schlichtung ·
  Art.-114-Spiegel unverändert). Suite 939/939 grün, tsc/lint/build 0.

### B-2 · LÜCKE (Weiche fehlt): Art. 6 Abs. 4 lit. c ZPO — internationale Handelsstreitigkeiten (neu 1.1.2025)
- **Wortlaut:** Kantone können das HG zusätzlich zuständig erklären, wenn kumulativ:
  geschäftliche Tätigkeit mind. einer Partei · Streitwert ≥ 100'000 · Zustimmung
  der Parteien · mind. eine Partei mit Wohnsitz/gewöhnlichem Aufenthalt/Sitz im
  Ausland (Grundlage der «international commercial courts», ZH/GE-Projekte).
- **Wirkung:** Engine erwähnt Abs. 4 lit. a (Z. 342) und lit. b (Z. 319–320),
  lit. c nirgends. Keine falsche Aussage, aber eine seit 1.1.2025 bestehende
  HG-Option wird bei Auslandsbezug nicht als Weiche offengelegt (§8).
- **Status: UMGESETZT 6.6.2026 (Freigabe David, Engine-Prüfauftrag):** Weiche
  bei HG-fähiger Streitsache + geschäftlicher Tätigkeit + Auslandsbezug +
  SW ≥ 100'000 (`ZPO_SCHWELLEN.HG_INTERNATIONAL_MIN`, eigene Konstante neben
  `DIREKTKLAGE_MIN` — gleicher Betrag, verschiedene Rechtsregeln, §1).
  Zustimmung/Auslands-Detail als nicht subsumierbar offengelegt (§8); ob
  Abs. 4 lit. c die Abs.-2-lit.-d-Schutzmaterien erfasst, wird bewusst NICHT
  behauptet (Weiche nur geldforderung/gesellschaft). 8 Testproben.

### B-3 · KOSMETISCH (keine Code-Änderung nötig)
- Art. 9 II: Engine-Paraphrase mit anderer Satzstellung («Die Parteien können …»
  vs. amtlich «Von einem zwingenden Gerichtsstand können die Parteien nicht
  abweichen») — sinngleich.
- Art. 17 I: «im Zweifel ausschliesslich» ist Rechtsfolgen-Formel, nicht
  Wortlaut-Zitat — Rechtsfolge korrekt.
- Art. 38 II: amtlich «nationaler Garantiefonds» (Engine erwähnt Abs. 2 nicht —
  nur falls je ergänzt relevant).
- Art. 92 BGG: amtlich «Ausstandsbegehren» (Engine: «Ausstand») — inhaltsgleich.
- Art. 74 Abs. 2 BGG hat zusätzlich lit. c–e (SchKG-Aufsicht, Konkurs-/Nachlass-
  richter, BPatGer) — für die abgebildeten Streitsachen ohne Belang.
- Art. 35 Abs. 1: landwirtschaftliche Pacht = eigener lit. c (Miete Wohn-/Geschäft
  = lit. b, Arbeit = lit. d — Engine zitiert b/d korrekt; landw. Pacht nicht
  abgebildet).
- Art. 6 hat zudem Abs. 5 (vorsorgl. Massnahmen, analog 5 II) und Abs. 6
  (Streitgenossenschaft) — von der Engine nicht behauptet, nur Vollständigkeits-Notiz.

## Pflegebedarf (→ Verfallsregister-Kandidaten)
- **BGG-Revision (klein):** Botschaft 5.12.2025 im Parlament — bei Inkrafttreten
  Art. 74/100/46 neu prüfen.
- Handelsgerichts-Bestand ZH/BE/AG/SG: Tatsachenbehauptung mit Stand 6.6.2026;
  bei Errichtung internationaler Spruchkörper (Art. 6 Abs. 4 lit. c) nachführen.

## Abnahme-Status
- Revisionskritische Kernbehauptungen (Schwellen, 314 II, 199 III, 143 Abs. 1bis,
  6 II, 145): **zweifach geprüft** (Erstrecherche + adversarialer 3-0-Durchgang).
- Blöcke örtliche Gerichtsstände / Art.-5-Katalog / BGG / BGE 133 III 393:
  **einfach belegt** (je ein Verifikations-Agent am amtlichen Filestore-HTML).
- Befunde B-1 und B-2: **durch David freigegeben und umgesetzt** (6.6.2026,
  s. oben). `verified`-Flags der Engine bleiben unverändert (§7/§13).
- Engine-Nachprüfung 6.6.2026 (nach Parallel-Fixes M-1/M-2/M-3): alle drei
  konsistent mit dem Verifikationsbestand (M-2 zitiert Abs. 4 lit. b verbatim
  wie hier bestätigt); kosmetische B-3-Punkte bewusst ohne Code-Änderung
  (Paraphrasen, keine Zitat-Behauptungen).
