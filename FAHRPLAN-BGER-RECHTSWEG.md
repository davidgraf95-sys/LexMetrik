# Fahrplan BGer-Rechtsweg (Auftrag David 11.6.2026)

Auftrag: «mache eine recherche zu rechtswege ans bundesgericht und erstelle
handlungsplan wie du diese infos am besten in eine engine einbauen kannst
oder ob eigene engine gebaut wird und dann setze handlungsplan um.»

## Recherche-Befund (R-0, 11.6.2026 — Stufe Nachverifikation)

Die normative Grundlage liegt bereits zweifach vor und wurde heute am
aktuellen Cache-Stand nachgeprüft:

1. **`bibliothek/recherche/bgg-beschwerde-engine.md`** (6.6.2026): alle vier
   Beschwerdewege (Zivil Art. 72–77 · Straf Art. 78–81 · öffentlich-rechtlich
   Art. 82–89 Grundzüge · subsidiäre Verfassungsbeschwerde Art. 113–119),
   Streitwert Art. 51–53, Vorinstanzen Art. 75/80/86, Anfechtungsobjekte
   Art. 90–93, Fristen Art. 100 inkl. Sonderfristen, Stillstand Art. 46,
   Kognition Art. 95–99, aufschiebende Wirkung Art. 103 — verbatim am Cache.
   **Heute nachverifiziert am Stand 20260401** (zusätzlich zu den beim Re-Pin
   7.6. geprüften Artikeln): 72, 73, 77, 78–81, 51–53, 90–92, 103, 117, 119,
   42, 44, 47, 50 — wortidentisch bis auf **Art. 80 Abs. 2** (heute: «ein
   oberes Gericht oder ein Zwangsmassnahmengericht als einzige kantonale
   Instanz»; das Dossier zitierte die ältere Fassung) und **Art. 117 Abs. 2**
   (neu, Wasserkraft-Beschleunigung — nicht verdrahtungsrelevant).
2. **`bibliothek/behoerden/rechtsmittel-spruchkoerper-kantone.md` §3**
   (Nachverifikation 7.6.2026): BGer-Abteilungszuteilung **Art. 33/34 BGerR**
   (I./II. zivilrechtliche; **Rechtsöffnungs-Falle: Art. 33 lit. i** weist
   provisorische/definitive Rechtsöffnungen der I. Abteilung zu, übriges
   SchKG der II.), seit 1.2.2026 **zwei strafrechtliche Abteilungen
   Art. 35/35a** (AS 2025 856), Abgrenzung Art. 36 (Schwergewicht).
   **Heute umgesetzt: BGerR als Cache gepinnt** (`bgerr|cc/2006/834|20260201`,
   Art. 33/34/35/35a/36 zeichengenau bestätigt).
3. **SchKG-Anschluss:** Art. 19 SchKG verweist vollständig aufs BGG
   (am Cache bestätigt) — die 10-Tage-Frist folgt aus Art. 100 Abs. 2 lit. a
   BGG, die 5-Tage-Wechselbetreibungs-Frist aus Abs. 3 lit. a (je verifiziert).

**Nicht abgebildet (bewusst, ehrlich):** Klage als ursprüngliches Verfahren
(Art. 120 BGG, Bund/Kantone-Streitigkeiten — kein Kanzlei-Alltag), Revision/
Erläuterung gegen BGer-Urteile (Art. 121 ff.), vollständiger Art.-83-Katalog
(Verwaltungs-Phase; nur Grundzüge-Hinweis). Monitoring «kleine BGG-Revision»
(Botschaft 5.12.2025) bleibt im Verfallsregister.

## Architektur-Entscheid: EIGENE Engine + punktuelle Anschlüsse

**Entscheid: eigene Engine `src/lib/bgerRechtsweg.ts`** mit eigenem Einstieg
(hebt die geplante Karte **`bgg-fristen`** auf entwurf), KEIN Umbau der
bestehenden Engines. Begründung:

- **§4 (eine Engine pro Rechtsgebiet):** Das BGG ist ein eigenes
  Verfahrensregime QUER zu ZPO/SchKG/StPO. In `zustaendigkeit.ts` (ZPO-Pfad),
  `schkgZustaendigkeit.ts` oder `strafRechtsmittel.ts` eingebaut, entstünden
  Querwirkungen zwischen Rechtsgebieten; eigenständig ist es einzeln testbar.
- **`bestimmeRechtsmittel` bleibt unangetastet** (sein ZPO→BGer-Zivilpfad ist
  korrekt, golden-geschützt und bleibt der Fahrplan im Zuständigkeits-Trio).
  Er erhält nur **additiv** die Abteilungs-Auskunft (HANDLUNGSPLAN B.5a) und
  einen Verweis auf den neuen Rechner.
- **Geteilt wird nur fachneutrale Infrastruktur** (§4): Datums-Arithmetik
  `fristenEngine.ts` (fristendeTage/normalisiereEnde) und die
  Stillstands-Perioden-Daten (Art. 46 Abs. 1 BGG ist datumsgleich mit
  Art. 145 Abs. 1 ZPO; die BGG-Strategie wird als EIGENES Regime deklariert,
  keine Kollabierung).
- Karte **`rechtsmittelpruefung`** bleibt geplant (ihr kantonaler Teil lebt
  im Zuständigkeits-Rechner; ihre BGer-Hälfte deckt der neue Einstieg).

## Etappen

- **R-0 Nachverifikation + BGerR-Pin** ✓ (siehe oben).
- **R-1 Engine `src/lib/bgerRechtsweg.ts`:** Decision-Tree des Dossiers
  (Stufen A–F) deterministisch: Beschwerdetyp + Hard-Stops (Art. 73/79) ·
  Statthaftigkeit nach Objekt (Art. 90–93, Verwirkungs-Warnung Art. 92) ·
  Zivil-Zulässigkeit (Art. 74 Abs. 1 lit. a/b; Abs. 2 lit. a–e einzeln,
  inkl. SchKG-Aufsicht/Konkursrichter; Schiedsgericht Art. 77 mit
  Sonderregime-Hinweis Abs. 2) · Streitwert-Hinweise Art. 51 Abs. 3/4
  (Nebenrechte; 20×-Kapitalisierung als optionaler deterministischer Helfer;
  Ermessens-Festsetzung Abs. 2 offengelegt) · subsidiäre Verfassungsbeschwerde
  (Art. 113/116/117/119 inkl. «gleiche Rechtsschrift») · Frist (Art. 100
  Abs. 1/2/3/7 je Materie) + Stillstand (Art. 46 Abs. 1/2) + konkretes
  Fristende bei erfasster Eröffnung (Art. 44 Abs. 1/45; Kanton für die
  Werktagsregel) · Abteilung (Art. 33/34/35/35a BGerR; Straf nur
  informativ — Zuteilung Art. 36 nach Schwergewicht) · Kognition/Noven/
  aufschiebende Wirkung als Hinweise (Art. 95–99/103) · Eheschutz-Weiche als
  WARNUNG (BGE 133 III 393, Sekundärquelle — Dossier V-1). Tests:
  Akzeptanz + Grenzwerte + Konventionen-Maximalkombis + norm-zitate-Prüfer.
- **R-2 Rechner-Seite `/rechner/bgg-fristen`** nach DESIGN-REGLEMENT R1–R12
  (ErgebnisBlock, Export PDF→ICS→Teilen) · Karte `bgg-fristen` geplant→entwurf
  (Norm-Pills, related) · FristenRegister: neue prozessuale Zeile mit
  WARUM-Satz (FE-1-Struktur) · Golden-Fälle.
- **R-3 Anschlüsse (je deklariert, additive Texte):**
  a) `bestimmeRechtsmittel`: Abteilungs-Auskunft nach Streitsache (B.5a) +
  Verweis auf den Rechner; b) `strafRechtsmittel.BGER_HINWEIS`: Privatkläger-
  Bedingung (Art. 81 Abs. 1 lit. b Ziff. 5), Art.-79-Ausnahme, zwei
  Abteilungen seit 1.2.2026; c) SchKG-Fristen-Seite: Hinweis Weiterzug
  Aufsichtsbeschwerde 10 T./Wechsel 5 T.; d) `presetIndex`: Such-Einträge.
- **R-4 Doku:** Dossier-Nachtrag (Nachverifikation + Art. 80-Fassung),
  INDEX/engine-map, STRUKTUR/HANDLUNGSPLAN-Spiegel, Verfallsregister-Eintrag
  (BGG-Revision-Monitoring besteht schon — prüfen).

Tore je Etappe (§6): tsc · Lint · Suite · Golden (neue Fälle deklariert) ·
check:zitate · Build. Status bleibt `entwurf`; §7-Abnahme durch David steht
aus (insb. Eheschutz-Weiche V-1 und die WARUM-/Hinweis-Texte).
