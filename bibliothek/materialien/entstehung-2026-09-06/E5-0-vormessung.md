# E5.0 — Vor-Messung der Synopse (11.9.2026)

**Auftrag:** FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.7, Etappe E5.0 — «Vor-Messung an 5–8
weiteren Erlassen (Volumen, Falschtreffer nach Normalisierung); zwei Speicherformen
messen». Anlass ist R2 §9: das dort gemessene q = 10,9 % ruht auf **12 Schritten in 2
Erlassen** (OR, ZPO); eine Deckel-Festlegung darauf wäre eine Einzelwert-Zuschreibung
(Dispatch-§0 Ziff. 3).

**Werkzeug:** `npm run entstehung:synopse-messung -- --datum=2026-09-11 --erlasse=…`
(`scripts/entstehung/synopse-messung.ts`, reine Logik in `scripts/entstehung/synopse.ts`).
**Quelle:** Fedlex SPARQL (`isMemberOf` + `dateApplicability` + `isExemplifiedBy`, DE,
`user-format/xml`) und der Filestore; Abruf 11.9.2026, 68 Konsolidierungs-Schritte über
8 Erlasse, Roh-XML ausserhalb des Repos zwischengespeichert.

## 1 Auswahl

8 Erlasse, bewusst über die Grössenordnungen gestreut und **disjunkt zu R2** (dort OR und
ZPO): ZGB 1277 Art. · STPO 480 · STGB 477 · SCHKG 404 · VTS 292 · AVIV 215 · NHG 70 ·
UVPV 32.

## 2 Messtabelle (Abruf 11.9.2026, Fenster ab 1.1.2021)

| Erlass | XML-Stände ab 2021 | Schritte | Textmasse | roh «geändert» | normalisiert «geändert» | Rauschanteil | Form A (nur Alt je Schritt) | Form B (Zustände je eId) | q = A/Textmasse |
|---|---|---|---|---|---|---|---|---|---|
| ZGB | 10 | 9 | 453 KB | 1998 | 58 | 97,1 % | 45,9 KB | 82,7 KB | 10,1 % |
| STPO | 10 | 9 | 211 KB | 566 | 80 | 85,9 % | 78,4 KB | 138,7 KB | 37,1 % |
| STGB | 17 | 16 | 227 KB | 720 | 142 | 80,3 % | 150,9 KB | 242,7 KB | 66,5 % |
| SCHKG | 5 | 4 | 166 KB | 725 | 13 | 98,2 % | 8,2 KB | 18,1 KB | 5,0 % |
| VTS | 15 | 14 | 244 KB | 776 | 134 | 82,7 % | 197,0 KB | 348,2 KB | 80,7 % |
| AVIV | 15 | 14 | 88 KB | 540 | 115 | 78,7 % | 75,8 KB | 131,9 KB | 86,0 % |
| NHG | 2 | 1 | 29 KB | 69 | 2 | 97,1 % | 1,5 KB | 3,7 KB | 5,4 % |
| UVPV | 2 | 1 | 12 KB | 2 | 1 | 50,0 % | 1,0 KB | 2,3 KB | 8,5 % |
| **Summe** | **76** | **68** | **1430 KB** | **5396** | **545** | **89,9 %** | **558,8 KB** | **968,1 KB** | — |

- **31 839 stabile eId-Vergleiche.** Unnormalisiert melden **16,9 %** davon eine Änderung,
  nach Normalisierung **1,7 %** — das Rauschen beträgt 89,9 % der Roh-Meldungen. R2 hatte
  36 % Roh-Falschtreffer am **HTML** gemessen; am AKN-XML sind es 16,9 %, weil das XML den
  Fussnoten-Apparat sauber abgrenzt (`<authorialNote>`). Die Grössenordnung ist bestätigt.
- **q je Schritt (nur Alt) = 3,74 %** der Textmasse (558,8 KB / 14 961 KB·Schritte).
  R2 mass 10,9 % für **alt+neu**, also ≈ 5,5 % nur-Alt — dieselbe Grössenordnung, hier
  über 8 statt 2 Erlasse und 68 statt 12 Schritte.
- Die Spalte «q = A/Textmasse» ist **kein** Steuerungswert: sie multipliziert q mit der Zahl
  der Schritte und wird bei häufig revidierten Verordnungen (AVIV 86 %, VTS 81 %) erwartbar
  gross. Massgeblich ist q **je Schritt**.

## 3 Korpusweite Hochrechnung (SPARQL-Vollzählung, ohne Abruf)

230 der 238 Bund-Erlasse haben eine ableitbare cc-ELI; **187 Erlasse tragen ≥ 1
Konsolidierungs-Schritt ab 2021**, zusammen **1006 Schritte** (R2 schätzte 1142 aus der
HTML-Zählung — die XML-Zählung ist die massgebliche, weil das XML die Diff-Eingabe ist).
Σ(Schritte × Textmasse) = 82,5 MB·Schritte.

| Form | Rechnung | Prognose roh |
|---|---|---|
| **A — nur Alt-Block je Diff-Schritt** | 82,5 MB × 3,74 % | **≈ 3,1 MB** |
| B — distinkte Textzustände je eId + Gültigkeitsintervalle | A × 1,73 | ≈ 5,3 MB |

Grösste Einzel-Erlasse in Form A: OR ≈ 407 KB · CHEMRRV ≈ 205 KB · ZGB ≈ 171 KB ·
STGB ≈ 153 KB · VTS ≈ 144 KB. **Der Erlass-Deckel von 2 MB hat rund fünffache Reserve,
der Gesamt-Deckel von 8 MB rund zweieinhalbfache** — auch mit JSON-Gerüst.
Vollauf: **1193 XML-Abrufe** (1006 Schritte + 187 Erst-Stände).

## 4 Speicherform: Entscheid für Form A

Form B (Lex D53) kostet das 1,73-Fache und kauft dafür «jede Fassung im Browser
zusammensetzbar». Das Repo hält den **geltenden** Text bereits als Snapshot (§5); die
Neu-Fassung eines Schritts ist die Alt-Fassung des Folgeschritts. Form B würde also den
geltenden Text ein zweites Mal halten — eine zweite Wahrheit ohne Zugewinn für die Frage,
die die Synopse beantwortet («was stand vorher hier?»). **Form A**, wie §11.6/A6 vorsah;
die Messung bestätigt die Vorentscheidung, statt sie zu ersetzen.

## 5 Stichprobe n = 15 gegen die amtlichen Stände

Deterministisch jeder 36. Fall der 545 gemeldeten Änderungen, geprüft gegen den Wortlaut
beider amtlicher Konsolidierungen und gegen das Fussnoten-Ereignis am Stand-Datum
(`public/normtext/historie/<ERLASS>.json`).

| # | Erlass · eId · Schritt | Befund | Fussnoten-Ereignis am Ziel-Stand |
|---|---|---|---|
| 1 | ZGB art_48 · 2021-01-01→2022-01-01 | echt: «Versichertennummer» → «AHV-Nummer» | `ausdruck` (AS 2021 758) |
| 2 | ZGB art_45_a · 2023-01-23→2023-09-01 | echt: Datenschutz-Fassung, Satz erweitert | `fassung` (AS 2022 491) |
| 3 | STPO art_261 · 2023-07-01→2023-08-01 | echt: Aufbewahrungsfrist neu gefasst | `fassung` (AS 2023 309) |
| 4 | STPO art_318 · 2023-08-01→2024-01-01 | echt: Abs. 1bis eingefügt | `eingefuegt` + `fassung` (AS 2023 468) |
| 5 | STGB art_123 · 2022-01-01→2022-06-01 | echt: «gemeinsamem» → «gemeinsamen» (Berichtigung) | **keines** ⇒ `ohne_ereignis` |
| 6 | STGB art_173 · 2023-01-23→2023-07-01 | echt: «der Richter» → «das Gericht» | **keines** ⇒ `ohne_ereignis` |
| 7 | STGB art_303 · 2023-01-23→2023-07-01 | echt: Strafrahmen 3 → 5 Jahre / 3 Jahre → 1 Jahr | `fassung` (AS 2023 259) |
| 8 | STGB art_65 · 2023-12-06→2024-01-01 | echt: «Wiederaufnahme» → «Revision (Art. 410−415 StPO)» | `fassung` (AS 2023 468) |
| 9 | SCHKG art_11 · 2024-07-01→2025-01-01 | echt: Absätze eingefügt (Anzeigerecht) | `eingefuegt` ×2 + `fassung` (AS 2023 628) |
| 10 | VTS art_11 · 2023-07-15→2024-04-01 | echt: Aufzählung um «Küche … Kontrollraum» erweitert | `fassung` (AS 2024 30) |
| 11 | VTS art_4 · 2023-07-15→2024-04-01 | echt: Übergangsrecht umfassend neu | `fassung` + 2× `eingefuegt` (AS 2024 30) |
| 12 | VTS art_41 · 2025-04-01→2025-05-01 | echt: Verweis auf Art. 17 Abs. 1 TGV ergänzt | `ausdruck` (AS 2025 70) |
| 13 | AVIV art_119_a · 2021-04-01→2021-07-01 | echt: aufgehoben, Text → «…» | `aufgehoben` (AS 2021 339) |
| 14 | AVIV art_77 · 2021-04-01→2021-07-01 | echt: Antragsverfahren neu gefasst | 4× `fassung` (AS 2021 339) |
| 15 | AVIV art_111_b · 2025-11-01→2026-01-01 | echt: «Kasse» → «Arbeitslosenkasse» | **keines** ⇒ `ohne_ereignis` |

**Trefferquote 15/15 = 100 % echte Abweichungen im amtlichen Wortlaut** (Schwelle des
Auftrags: ≥ 90 %). **11/15 = 73 %** sind zusätzlich durch eine Fussnote am selben
Stand-Datum belegt; die vier übrigen sind echte Textänderungen **ohne** Fussnote
(Berichtigungen, Terminologie-Nachführungen) — sie bekommen den Zustand `ohne_ereignis`
und werden angezeigt, nie still aufgelöst (§8, §11.6 `validity_conflict`).

## 6 Drei Rausch-Quellen, erst durch diese Messung belegt

Die erste Fassung des Normalisierungs-Profils meldete **636** Änderungen; 91 davon waren
Artefakt-Rauschen. Die Stichprobe der ersten Runde (n = 12) traf zwei davon — Trefferquote
**9/12 = 75 %, unter der Schwelle**. Die drei Ursachen, je mit Fundstelle:

1. **Fedlex-Migrations-Platzhalter.** `<placeholder fedlex:message="E40S10-TAB">[tab]</placeholder>`
   steht in einer Artefakt-Generation und in der nächsten nicht mehr (592 Vorkommen im
   Messkorpus). Beleg: AVIV Art. 120a Bst. b, 2024-08-01→2025-08-01 — alt
   `<num>[tab]</num><p>b. AHV-Nummer …</p>`, neu `<num>b. </num><p>AHV-Nummer …</p>`,
   Wortlaut identisch, keine Fussnote. ⇒ Platzhalter mitsamt Inhalt entfernen, **und** den
   Vergleich auf den **flachen** Artikeltext stellen statt auf die Blockstruktur: wandert
   ein Listen-Etikett vom `<num>` ins `<p>`, ändert sich der Baum, nicht das Gesetz.
2. **Auslassungspunkte.** Derselbe amtliche Text einmal `...`, einmal `…`. Beleg: ZGB
   Art. 107 Ziff. 4, 2021-01-01→2022-01-01 — einzige Abweichung, keine Fussnote.
3. **Angekündigte, textlose Hülsen.** Ein Artikel steht im alten Stand nur als
   `<num>Art. 222q</num>` mit der Fussnote «Tritt am 1. April 2024 in Kraft.» und bekommt
   erst im neuen Stand Text. Beleg: VTS Art. 222q, 2023-07-15→2024-04-01. Das ist kein
   geänderter, sondern ein **eingefügter** Artikel; ein leerer Alt-Block wäre eine Synopse
   gegen nichts. ⇒ leere Alt-Fassung ⇒ Klasse «nur im neuen Stand».

Dazu `NFC`-Kanonisierung (Umlaut-Komposition wandert zwischen Generationen). Das Profil
heisst damit abschliessend **`entstehung-norm/1`** und wird nie mehr editiert; eine
Verbesserung heisst `/2` und entsteht daneben (Muster `soufien-lex.md`).

**§2b — Belege altern nicht:** R2 mass am 6.9.2026 am HTML 36 % Roh-Falschtreffer und
1142 Diff-Schritte. Diese Werte bleiben stehen. **Ergänzend** gemessen 11.9.2026 am
AKN-XML: 16,9 % Roh-Falschtreffer und 1006 Schritte. Kein Widerspruch — andere
Diff-Eingabe (XML statt HTML) und andere Zählgrundlage (XML- statt HTML-Stände).

## 7 Entscheid

**BAU.** Alle drei Bedingungen des Auftrags sind erfüllt: Stichprobe 15/15 = 100 % ≥ 90 %,
Volumen-Prognose 3,1 MB gegen einen Deckel von 8 MB, grösster Erlass 407 KB gegen 2 MB.
Kein Umfangs-Rückbau nötig, keine Offenlegung nach §7 erforderlich. Speicherform A.

**Offen geblieben (unverändert aus R2 §9):** ob Fedlex den *Wortlaut* alter
Konsolidierungen nachträglich korrigiert, ist mit einem Stichtag nicht entscheidbar —
genau dafür führt der Shard je Stand den Quell-`sha`, und `check:entstehung` verweigert
eine Shard-Änderung ohne Quell-Hash-Änderung.
