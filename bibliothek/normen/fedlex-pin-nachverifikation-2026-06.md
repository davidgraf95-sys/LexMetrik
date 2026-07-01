# Fedlex-Pin-Nachverifikation Juni 2026 (SchKG · StPO · VwVG · VMWG · BGG + Voraus-Check StGB/ZGB/ZPO)

**Erstellt:** 7.6.2026 · **Status:** zweifach geprüft (je Gesetz ein
Diff-Agent am Filestore-Original; Art. 19/19a VMWG zusätzlich von der
Hauptsession am Cache nachextrahiert) · **Anlass:** Erstlauf
`scripts/fedlex-versionen-pruefen.ts` (SPARQL) meldete 5 überholte Pins.

**Methode (§7):** Je Gesetz beide Konsolidierungen vom Filestore geladen,
ALLE vom Code zitierten Artikel (grep src/ + Pflicht-Anker + fedlex.ts)
abschnittsweise extrahiert (id="art_X" bis Folge-Anker), normalisiert,
Wort für Wort gedifft; Fussnoten-Umnummerierungen als Rauschen aussortiert;
zugrunde liegende Erlasse aus den Fedlex-Fussnoten/AS belegt.

## Ergebnis-Übersicht (Eingabe → Ausgabe)

| Gesetz | Pin alt → neu | Auslöser-Erlass | Materiell geänderte Artikel | Schnittmenge mit Code | Folge |
|---|---|---|---|---|---|
| SchKG | 20250101 → **20260101** (html-1) | BG missbräuchlicher Konkurs (AS 2023 628; Textnachführung erst in Kons. 2026) | Art. 230 (Frist 10→20 T.), neu Art. 222a | **leer** (230/222a nicht verdrahtet); 66 zitierte Artikel body-identisch | Re-Pin vollzogen; Anker +88/+166 |
| StPO | 20240101 → **20250401** (html-1) | AS 2025 178 (USG-Folge, nur Art. 269) | Art. 393 I lit. c (Sexualstrafrecht-Rev., AS 2024 27): «in den vorgesehenen Fällen» → «sofern dieses Gesetz sie nicht als endgültig bezeichnet» | Art. 393 nur als Fundstelle in strafRechtsmittel (kein Volltext) — Logik (10-T.-Beschwerde Art. 396) unberührt | Re-Pin vollzogen |
| VwVG | 20210101 → **20220701** (html-1) | AS 2022 289 (EGMR-Revision Art. 66 II lit. d) | Art. 66 II lit. d | **leer**; Art. 11/20 byte-identisch | Re-Pin vollzogen; Kons. 20270101 existiert, HTML leer — nicht pinnen |
| VMWG | 20250101 → **20251001** (**n=0**, Datei ohne «-N»-Suffix!) | **V vom 21.3.2025, AS 2025 191** | Art. 19 II (Staffel-Satz herausgelöst) + III (Formular-Inhalte Referenzzins/LIK) · **Art. 19a NEU** (Staffel-Mitteilung, schriftlich, 4 Monate) | mietvertrag.ts zitiert die Staffel-Regel als «Art. 19 Abs. 2» → Fundstelle neu **Art. 19a** (deklarierte fachliche Korrektur); Art. 16/17 **byte-identisch** → Teuerungs-Engine unberührt; teuerung.ts «Art. 19 Abs. 2» (Index-Bekanntgabe) bleibt KORREKT | Re-Pin vollzogen; «SPA-Shell»-Irrtum 5.6. aufgelöst |
| BGG | 20250101 → **20260401** (html-1) | **AS 2026 99** (BG 26.9.2025, energierechtl. Beschleunigungserlass, Anhang Ziff. 1) | Art. 83 lit. z-bis/z-ter, Art. 117 II, Art. 132b (alles Wasserkraft-Konzessionen) | **leer** — alle engine-tragenden Artikel (45–47, 51, 74, 75, 92 f., 98, 100, 113 ff.) wortidentisch | Re-Pin vollzogen. **NICHT die «kleine BGG-Revision»** (Botschaft 5.12.2025) — Monitoring bleibt offen! |

## Voraus-Check angekündigter Fassungen (Stand 7.6.2026)

| Gesetz | Inkrafttreten | Erlass | Betroffene Artikel | Code betroffen? | Aufgabe am Stichtag |
|---|---|---|---|---|---|
| StGB | **12.6.2026** | AS 2026 231 (Eurodac/Schengen) | Art. 354, 357 (Datenaustausch) | **Nein** (30/31, 97 ff., 109, 333 byte-identisch geprüft) | ~~Nur Re-Pin auf 20260612; Datei liegt als **No-Suffix** → n=0~~ **VOLLZOGEN 12.6.2026, s. Nachtrag** |
| ZGB | **1.7.2026** | AS 2026 94 (gewaltfreie Erziehung: 302/302a) + AS 2026 16 (Besitzesschutz: 926 ff.) | 302, 302a neu, 429, 926 ff. | **Nein** (Erbrecht/Vorsorge/Pflichtteile byte-identisch geprüft) | Nur Re-Pin auf 20260701 (html-1, bereits abrufbar) |
| ZPO | **1.7.2026** | AS 2026 16 Ziff. II (Besitzesschutz) | **Art. 260a/260b NEU** (summarischer Besitzesschutz, 10-T.-Einsprache), 248/250/257/260/290 angepasst | **Nein** (Fristen 142–148, 314, 321, Zuständigkeit 2–94a byte-identisch geprüft) | Re-Pin auf 20260701 (**No-Suffix** → n=0). Backlog-Kandidat: Besitzesschutz-Verfahren 260a/b als künftiges Zuständigkeits-/Fristen-Szenario |

### Nachtrag: StGB-Re-Pin VOLLZOGEN (12.6.2026)

Am Stichtag empirisch nachverifiziert und gepinnt (`scripts/fedlex-cache.sh`
neu `stgb|…|20260612|0|…`):

- Konsolidierung **20260612** liegt am Filestore als **No-Suffix** (n=0,
  wie vorausgesagt), HTTP 200, 983'987 B (alt 20260101/html-2: 981'366 B).
- **Anker-Inventar identisch:** 477/477 `art_`-IDs, keine neuen, keine
  entfallenen.
- Alle 7 engine-zitierten Pflicht-Anker (art_30, 97, 98, 101, 109, 333,
  389): **Normtext identisch** zu 20260101; verbleibende Byte-Diffs sind
  reine Fussnoten-ID-Umnummerierung (nicht-normativ, s. Geltungsbereich).
- Erwartungsgemäss materiell geändert NUR art_354 (+1'116 B) und art_357
  (+641 B) — Datenaustausch Eurodac/Schengen, nicht verdrahtet.
- `check:caches` + `check:zitate` danach grün; Verfallsregister-Zeile auf
  den nächsten Stichtag 1.7.2026 (ZGB/ZPO) gestellt.

### Nachtrag: ZGB + ZPO-Re-Pin VOLLZOGEN (1.7.2026)

Am Stichtag empirisch nachverifiziert (Byte-Diff der zitierten Anker alt↔neu,
Anker-Inventar, SPARQL-`dateApplicability`-Cross-Check), gepinnt UND die
Volltext-Snapshots gezielt regeneriert (`npm run normtext -- --nur=bund
--erlass=zgb,zpo`; Struktur-Sidecar + Browse-Manifest nachgezogen; Engine-golden
byte-gleich; adversariale QS-GP der neuen Artikel):

- **ZGB → `20260701` / html-1** (`zgb|…|20260701|1|…`). **FALLE:** unter
  `.../20260701/` liefern **beide** n=0 UND n=1 echtes HTML (1099 Anker, SR 210),
  aber **n=0 ist STALE** — ihm fehlt die AS-2026-94-Änderung an `art_302`
  (gewaltfreie Erziehung: neuer 2. Satz Abs. 1 + neuer Abs. 4). Nur **html-1**
  trägt sie; SPARQL bestätigt `-html-1.html` kanonisch. n=0 zu pinnen wäre ein
  stiller Regress. Alle 6 zitierten Anker byte-identisch; Inventar 1099→1099
  (art_302 Intra-Artikel, KEIN neuer Anker — Prognose art_302/302a insoweit falsch).
- **ZPO → `20260701` / No-Suffix (n=0)** (`zpo|…|20260701|0|…`; n≥1 = Casemates-
  SPA). Alle 14 zitierten Anker operativ byte-identisch; art_314 nur Fussnoten-
  Reklassifikation (Berufungsfristen 10/30 T. unverändert). **Neu: art_260a/260b**
  (summarischer Besitzesschutz, AS 2026 16 Ziff. II) in den Snapshot aufgenommen.
- SPARQL: die auf 2026-07-01 geltende Fassung ist für SR 210 + 272 exakt die
  20260701-Konsolidierung. `check:caches` (ZGB 6 / ZPO 14 Anker) + `check:zitate`
  (732 Zitate, 0 Befunde) + Voll-Gate grün. Register auf «VOLLZOGEN 1.7.2026»,
  nächste Prüfung Jan. 2027.

## Geltungsbereich & Ausnahmen

- Diffs decken die VOM CODE ZITIERTEN Artikel vollständig ab plus
  Anker-Mengen-Vergleich (neue/entfallene IDs) je Gesetz; NICHT geprüft:
  Wortlaut nicht zitierter Artikel (ausser Änderungs-Hotspots).
- Fussnoten-Umnummerierungen wurden als nicht-normativ behandelt.
- BGG Art. 80: trägt seit der Sexualstrafrechts-Revision (2024) eine
  Textfassung, die der alte Pin 20250101 noch nicht abbildete — die von der
  Engine genutzte Aussage ist nicht betroffen.

## Pflegebedarf (→ Verfallsregister nachgeführt)

- Re-Pin-Termine StGB 12.6.2026 (**vollzogen**, s. Nachtrag) · ZGB/ZPO
  1.7.2026 offen (reine Pins, keine Engine-Folgen — am Stichtag
  `check:caches`/`check:zitate` fahren).
- Gesetzgebungs-Monitoring «kleine BGG-Revision» läuft WEITER (durch den
  Energierechts-Re-Pin NICHT erledigt).
- VwVG-Konsolidierung 20270101 angekündigt (HTML noch leer) — der
  Versions-Monitor zeigt sie als HINWEIS.

## Abnahme-Status

Erstrecherche zweifach belegt (Diff-Agents + Stichproben-Nachextraktion);
fachliche Abnahme durch David ausstehend. Die mietvertrag.ts-Fundstellen-
Korrektur (19 II → 19a) ist eine deklarierte fachliche Änderung mit eigenem
Commit und Golden-Neuschrieb.

**Nebenbefund:** `_as2025630.pdf` im Repo-Root (abgelegt 6.6.2026) ist
FEHLBENANNT — Inhalt ist eine Vernehmlassungsantwort des Kantons Zug (2018)
zur GebV-SchKG-Revision, nicht die AS 2025 630. Für die C.13a-Prüfung
(GebV-Staffel 2022↔2026) ungeeignet; die Staffel ist ohnehin bereits am
Filestore-HTML 20260101 Wert für Wert verifiziert (gebv-schkg-kostenrechner.md).
