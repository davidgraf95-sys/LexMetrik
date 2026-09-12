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

## 6b Nachtrag 11.9.2026 — Profil `/1` durchgefallen, `/2` gelandet

Die Gegenprüfung zu PR #794 zog eine **eigene Stichprobe n = 13** — disjunkt zu der oben
dokumentierten und **nur auf `ohne_ereignis`-Blöcken**, also der Klasse ohne doppelte
Belegung. Ergebnis: **11/13 = 84,6 %, unter der Schwelle.** Zwei Falschtreffer, beide
Artefakte der Fedlex-KONVERSION, beide von `/1` nicht erfasst:

| Fall | Beobachtung im Roh-XML | Klasse |
|---|---|---|
| AHVG Art. 10 Abs. 2bis, 2021-01-01 → 2022-01-01 | `<num>2bis</num><content>Die …` wird zu `<num>2b</num><content><sup>is</sup> Die …` | Elementgrenze wandert durch das Ordnungs-Suffix |
| ARG Art. 12, 2021-01-01 → 2023-09-01 | `<p>… überschritten werden</p><blockList>` wird zu `<listIntroduction>… überschritten werden:</listIntroduction>` | Satz + Liste wird Einleitung + Liste |

Die Nachprüfung fand zwei weitere Fälle derselben zwei Klassen (eigene Stichprobe n = 13
auf `ohne_ereignis`, 13 andere Erlasse): **EMRK Art. 44** (`… wird endgültig,</p><blockList>`
→ `<listIntroduction>… wird endgültig:</listIntroduction>`) und **UNO_PAKT_II Art. 24**
(`<content><p>(l)  Jedes Kind …` → `<num>(1)</num><content><p>Jedes Kind …`: Etikett wandert
aus dem Text in ein eigenes Element und die Glyphe «l» wird zur Eins).

**Profil `entstehung-norm/2`** (die Fassung `/1` ist nie gelandet, es gibt keinen Bestand,
den die neue Nummer entwerten könnte):

1. **Aller Leerraum fällt fürs Matching weg.** Trägt die ganze Klasse «Elementgrenze wandert
   durch ein Etikett» — ohne eine offene Grammatik für «bis/ter/quater/…» (§2). Ein
   Unterschied, der nur aus Leerraum besteht, ist nie eine Gesetzesänderung.
2. **Bindestrich-Varianten** (U+2010/U+2011/U+2012/U+2013) auf «-». Der Gedankenstrich
   U+2014 bleibt unangetastet — er ist Interpunktion.
3. **Satzzeichen unmittelbar vor einer Aufzählung** (am Ende einer `listIntroduction` und am
   Ende eines `<p>` direkt vor einem `<blockList>`) fallen fürs Matching weg. Nur an dieser
   Elementgrenze, nie im Fliesstext — ein Komma in einer Aufzählung kann den Sinn tragen (§1).
4. **Absatz-Etikett in Klammerform** am Blockanfang (`<num>(1)</num>` bzw. führendes «(1)» im
   Text) fällt weg — eng gefasst auf höchstens vier alphanumerische Zeichen, damit
   «(Aufgehoben)» stehen bleibt, und nur am Blockanfang, damit ein Querverweis «(2)» mitten
   im Satz stehen bleibt.
5. Unverändert aus `/1`: unsichtbare Codepunkte, Auslassungspunkte `...` → `…`, NFC.

**Der gespeicherte Wortlaut ist von alledem unberührt** — die Regeln entscheiden allein über
«geändert ja/nein» (Muster `soufien-lex.md`: normalisieren fürs Matching, nie für die Ablage).

**Nachweis, dass `/2` nicht übersieht, was es soll:** AHVG Art. 10 im Folgeschritt
2022-01-01 → 2023-01-01 meldet weiterhin die echte Änderung (Mindestbeitrag 413 → 422 Fr.,
zweimal im Artikel), obwohl derselbe Absatz 2bis im selben Schritt sein Etikett zurücktauscht.

**Neue Stichprobe n = 13 nach `/2`**, gezogen mit
`npm run entstehung:synopse-stichprobe -- --n=13 --ohne=<26 bereits geprüfte Erlasse>`,
also **disjunkt zu beiden früheren Stichproben**, 13 verschiedene Erlasse, ausschliesslich
`ohne_ereignis`-Blöcke (Grundgesamtheit 654):

| # | Fall | Befund |
|---|---|---|
| 1 | AIG art_103a 2021-10-02→2022-05-01 | echt: Artikel vollständig ersetzt (Grenzkontrolle → Informationssystem Einreiseverweigerungen) |
| 2 | AVO art_186 2023-01-23→2024-01-01 | echt: neuer Regelungsgegenstand (Sitz/Wohnsitz statt finanzielle Sicherheiten) |
| 3 | BETMKV art_10 2022-01-01→2022-08-01 | echt: «das Institut» → «die Swissmedic» |
| 4 | BVV_2 art_3a 2022-01-01→2023-01-01 | echt: Grenzbeträge 21 510 → 22 050 und 358 → 367 Franken |
| 5 | CO2_GESETZ art_48b 2022-01-01→2025-01-01 | echt: «im Inland» → «in der Schweiz» |
| 6 | EPV art_64c 2021-02-04→2021-03-01 | echt: eine Pauschale wird zu einer Liste zweier Pauschalen |
| 7 | ERV art_79 2024-01-01→2025-01-01 | echt: Artikel aufgehoben |
| 8 | IVG art_68quater 2021-07-01→2022-01-01 | echt: «Bundesamt» → «BSV» |
| 9 | KKV art_129a 2022-01-01→2024-03-01 | echt: «des Gesetzes» → «KAG» |
| 10 | LSV art_37a 2021-07-01→2023-11-01 | echt: «Bundesamt für Umwelt» → «BAFU» |
| 11 | MVV art_28a 2024-01-01→2025-01-01 | echt: Prämie 43 → 45 Franken |
| 12 | URV art_20b 2022-01-01→2025-07-01 | echt: Absatz umformuliert (Behörde handelt → Betroffener beantragt) |
| 13 | VVEA art_15 2023-09-26→2024-01-01 | echt: Verweis Anhang 2.6 Ziff. 2.2.4 → 2.2.2.2 |

**13/13 = 100 % echte Abweichungen im amtlichen Wortlaut** (Schwelle ≥ 90 %). Alle 13 ohne
Fussnoten-Ereignis am Stand-Datum — das belegt zugleich den Befund aus §5: der amtliche
Fussnoten-Apparat weist Behördenumbenennungen, eingeführte Abkürzungen, Betragsanpassungen
und Verweis-Korrekturen nicht durchgängig aus.

**Wirkung auf die Zahlen:** 4770 → **4659 Alt-Blöcke** (111 Falschtreffer weniger, −2,3 %),
davon `ohne_ereignis` 1286 → **1175**; Deckel 6739,2 → **6580,1 KB / 8192,0 KB (80 %)**.

## 7 Entscheid

**BAU.** Alle drei Bedingungen des Auftrags sind erfüllt: Stichprobe 15/15 = 100 % ≥ 90 %,
Volumen-Prognose 3,1 MB gegen einen Deckel von 8 MB, grösster Erlass 407 KB gegen 2 MB.
Kein Umfangs-Rückbau nötig, keine Offenlegung nach §7 erforderlich. Speicherform A.

**Offen geblieben (unverändert aus R2 §9):** ob Fedlex den *Wortlaut* alter
Konsolidierungen nachträglich korrigiert, ist mit einem Stichtag nicht entscheidbar —
genau dafür führt der Shard je Stand den Quell-`sha`, und `check:entstehung` verweigert
eine Shard-Änderung ohne Quell-Hash-Änderung.

## 8 Nachtrag 11.9.2026 — Befund #796: Generator und Leser trugen zwei Normalisierungen, Profil `entstehung-norm/3`

**Befund (Bauer #796):** der Generator (`normalisiere()`, `flachText()` in
`scripts/entstehung/synopse.ts`) und der Leser (`vergleichsform()` in
`src/lib/entstehung/synopse-diff.ts`) trugen bis Profil `/2` je eine EIGENE
Zeichen- und Struktur-Normalisierung. Gemessen (Stand vor dem Fix, 11.9.2026,
über alle 186 Synopse-Shards): **70 gespeicherte Alt-Blöcke** (36/3484
`belegt`, 34/999 `ohne_ereignis`) zeigten dem Leser «kein Unterschied
erkennbar», obwohl der Generator sie als «geändert» ablegte — Rot-Beweis: ein
neu gebauter Leer-Diff-Wächter in `check:entstehung` fand diese 70 Fälle exakt
(Kommando `npm run check:entstehung` gegen die unregenerierten Profil-`/2`-
Artefakte).

**Ursachen, je Klasse (empirisch, nicht die Zeichentabellen allein):**

1. **Randvermerk-Scope** (51 der 70 Fälle): `flachText` verglich den GANZEN
   Artikel-Innenraum inklusive `<heading>`/`<subheading>` — ein Querverweis
   («(Art. 83 Abs. 1 Bst. i und o AVIG)» → «(Art. 83 Abs. 1bis AVIG)», wegen
   Umnummerierung an ANDERER Stelle des Erlasses) löste «geändert» aus, obwohl
   der Artikeltext (`bloecke`, alles was gespeichert und angezeigt wird)
   byte-gleich blieb. Beleg: AVIV Art. 109b, 2021-04-01 → 2021-07-01.
2. **Fussnote vor der Satzzeichen-Regel** (die restlichen 19 der 70, alle
   NBSP-Rauschen im Body als Nebeneffekt): eine `<authorialNote>`
   (Berichtigungs- bzw. «Fassung gemäss …»-Hinweis) schob sich in EINER
   Konsolidierungs-Generation zwischen ein Satzzeichen und
   `</listIntroduction>` — die Satzzeichen-Regel aus PR #794 griff nur in der
   fussnotenlosen Generation. Beleg: BGOE Art. 13, 2023-09-01 → 2023-11-01;
   VEV Art. 4, 2026-04-08 → 2026-06-12.
3. **Text nach einer Liste** (bei der Regenerierung neu aufgetreten, 18
   weitere Fälle): `zerlegeBloecke` kennt nach einer `<blockList>` nur
   `listIntroduction` + `item`, nie Text DANACH — ein Satz in einer
   Tabellenzelle nach der Liste trug in einem Fall sogar eine ECHTE Änderung
   (Kantonsliste um Bern/Luzern erweitert), landete aber in KEINER Generation
   in `bloecke`. Beleg: KLV Art. 12 Bst. e, 2021-11-04 → 2022-01-01.

**Fix (Profil `entstehung-norm/3`):** die Zeichen-Normalisierung lebt jetzt an
GENAU EINEM Ort (`src/lib/entstehung/normalisierung.ts`, `vergleichsform`),
von Generator UND Leser importiert; `flachText` ist auf den `<paragraph>`-Scope
beschränkt (Klasse 1); `vergleichsRoh()` entfernt `<authorialNote>` VOR der
Satzzeichen-Regel (Klasse 2) und ignoriert Text nach `</blockList>` (Klasse 3).
Die Gegenprobe aus PR #794 (ARG 12, EMRK 44, UNO_PAKT_II 24, AHVG 10
Elementgrenze UND die echte 413→422-Änderung im selben Schritt) ist jetzt ein
dauerhafter Unit-Test (`src/tests/entstehung-synopse.test.ts`), vorher nur ein
einmaliger Gegenprüfungs-Befund.

**Wirkung auf die Zahlen:** 4659 → **4529 Alt-Blöcke** (−130, −2,8 %), davon
`ohne_ereignis` 1175 → **1140**; Deckel 6580,1 → **6544,2 KB / 8192,0 KB
(80 %)**; Leer-Diff-Verletzungen 70 → **10** (−86 %).

**Offener Rest (10 Fälle, andere Fehlerklasse, NICHT Normalisierung):**
Token-Kontinuität über grosse Zeitspannen — `neuNach()`
(`src/lib/entstehung/synopse-diff.ts`) sucht den nächsten Schritt mit
DEMSELBEN Token, nicht die nächste WORTLAUT-Änderung. Fällt der Wortlaut nach
Jahren zufällig auf den Ausgangswert zurück (Beleg: AVIV Art. 57b — «… um
sechs Abrechnungsperioden …» @2021-07-01, wortgleich wieder @2025-11-01, erst
danach «… um zwölf …»), zeigt der Leser «kein Unterschied». Dieselbe Klasse
trifft `art: 'entfallen'`-Artikel noch deutlicher (CHEMRRV, zehn Token um den
2022-05-01 — dort bereits durch `leerDiffVerletzungen()` ausgefiltert, siehe
Docstring dort). Bewusst NICHT stillschweigend gelöst (§6.7): `check:entstehung`
bleibt für diese 10 Fälle rot, bis ein eigener Roadmap-Schritt `neuNach` um eine
Lineage-Regel über den Token hinaus ergänzt (z. B. `oc`/eId-Kontinuität statt
reiner Token-Gleichheit). Betroffen: AIG 93, ASYLG 6a, AVIV 57b/1a, OR 652d,
PARLG 13, VAM 51/76/77, ZSTV 17.

**Determinismus:** zweiter Generator-Lauf (identischer XML-Cache, ohne
`--parser-neu`) byte-gleich zum ersten — sha256 aller 186 Synopse-Shards und
des Quell-Registers identisch.

## 9 Nachtrag 12.9.2026 — Gegenprüfung PR #798 widerlegt Profil `/3`; Profil `entstehung-norm/4`

§8 bleibt als Beleg seines Datums unverändert stehen. Die Gegenprüfung zu
PR #798 hat zwei seiner Schlüsse widerlegt und einen dritten als Tor-Lücke
beanstandet; hier steht, was gemessen wurde, und nicht, was §8 hätte sagen
sollen.

**A1 — «Text nach einer Liste» war kein Rausch-Fall, sondern ein
Speicherverlust.** §8 Klasse 3 hat die Lücke in `zerlegeBloecke` richtig
BESCHRIEBEN, sie aber im Vergleich zugedeckt statt im Speicher geschlossen
(«Regel (c)»). Damit verschwanden vier ECHTE Wortlautänderungen von KLV
Art. 12 Bst. e — die Kantonsliste der Früherkennungsprogramme, an der die
Franchisebefreiung hängt (amtliche Konsolidierungen, Fedlex Filestore ELI
`cc/1995/4964_4964_4964`, abgerufen 12.9.2026):

| Schritt | Kantonsliste |
|---|---|
| 2021-11-04 → 2022-01-01 | «… Basel-Stadt, Freiburg, Genf …» → **«+ Bern, Luzern»** |
| 2022-10-01 → 2023-01-01 | → **«+ Basel-Landschaft»** |
| 2024-07-01 → 2025-01-01 | → **«+ Solothurn»** |
| 2026-05-11 → 2026-07-01 | → **«+ Glarus»** |

Gemessen am ganzen Korpus (12.9.2026): **651 Absätze je Stand** tragen
Fliesstext nach der letzten `<blockList>`; `<item>` ausserhalb einer
`<blockList>` gibt es **0**; verschachtelte `<blockList>` **4476** — deshalb
sucht `blockListBereiche()` balanciert, nicht nicht-gierig. `zerlegeBloecke`
speichert seither Vor-, Zwischen- und Nachlauftext; Regel (c) ist gestrichen;
`flachText` delegiert an `zerlegeBloecke` (ein Scope, §5).

**A2 — die Sachüberschrift gehört in den Vergleich, aber auch in den
Speicher.** §8 Klasse 1 hat `<heading>` zusammen mit dem `<subheading>`-
Randvermerk aus dem Vergleich genommen. Der Randvermerk ist Rauschen, die
Sachüberschrift nicht: **35 Schritte** ändern NUR den amtlichen Randtitel
(BVG Art. 33b «Erwerbstätigkeit nach dem ordentlichen Rentenalter» →
«… nach dem Referenzalter», 2023-01-01 → 2024-01-01, ELI
`cc/1983/797_797_797`; dazu STPO 55/431, HMG 41, HREGV 77, PARTG 10, AHVV 52a,
EPV 90, VAG 84, FINFRAG 41 …). Der Leser bekam dort «kein Unterschied
erkennbar» — eine falsche Auskunft über eine echte Änderung (§8 des
Reglements). Die enge Rausch-Regel ist gemessen: **2096 von 2096**
`<subheading>` im jüngsten Stand aller 186 Erlasse sind ein Klammer-
Querverweis auf die Delegationsnorm (acht davon mit amtlichen Schreibfehlern
in der Klammerung). Gespeichert wird seither BEIDES — `ueberschrift` (alt) und
`ueberschriftNeu` (neu) —, weil der geltende Korpus-Snapshot den Artikel-Titel
für Bundeserlasse fast nie führt (**7500 von 22 496** Artikeln stimmen überein,
die übrigen tragen im Korpus gar keinen Titel): ein Leser, der den neuen Titel
von dort holte, zeigte bei zwei Dritteln aller Artikel eine Titel-Streichung,
die es nie gab.

**A4 — der Leer-Diff-Wächter prüft `art: 'entfallen'` mit.** §8 hatte diese
Blöcke ausgefiltert; mit Profil `/3` waren 160 Blöcke gerade erst von
«geändert» zu «entfallen» gewechselt und damit aus dem Blick des Tors
verschwunden (§6.7). Ausgenommen bleibt nur der Fall ohne Folgeschritt
(`neu === null`) — dort sagt die Karte «Der Artikel ist mit diesem Stand
entfallen», und das IST der Unterschied.

**Ein Nebenbefund, der aus A1 folgt:** die fünf Ausnahmen des Profils `/3`
(KLV 13, KLV 12_b, KLV 12_a ×2, VTS 136) waren **keine**
Token-Kontinuitäts-Fälle, wie §8 vermutete — sie sind mit dem
Speicher-Fix erledigt. Die Diagnose «Lineage» war für sie falsch.

**Neuer Stand (12.9.2026, Profil `/4`):** 4651 Alt-Blöcke (Profil `/3`: 4529),
davon 1176 `ohne_ereignis`; 326 `entfallen`; 522 Blöcke mit geänderter
Sachüberschrift, davon 31 ohne Wortlaut-Unterschied (Leser-Zustand «nur die
Sachüberschrift wurde geändert»); Deckel 6716,1 KB / 8192,0 KB (82 %);
Leer-Diff-Verletzungen **0 offen**.

**Offener Rest — 11 befristete Ausnahmen
(`bibliothek/register/entstehung-leerdiff-ausnahmen.json`, Ablauf 2026-10-12):**

1. **CHEMRRV 4/7/8/9/10/11/12/16/18/20 @2022-05-01 — defekte Quell-Struktur,
   NICHT Lineage.** Die amtliche Konsolidierung vom 2022-05-01 (und
   2022-10-01) führt im Artikelbaum nur `<article eId="art_1..art_3">`; die
   Artikel 4–24 stehen in derselben 685-KB-Datei als
   `<mod eId="annex_1_a/mod_uN"><quotedStructure>` eines Anhangs, ab
   2022-10-06 wieder als 27 reguläre `<article>` (gemessen 12.9.2026 am
   Filestore-XML, ELI `cc/2005/478`). Der Generator bucht sie darum als
   «entfallen» und später als neu eingefügt, obwohl sie nie aufgehoben waren.
2. **AVIV 57b @2021-07-01 — echte Token-Kontinuität**, wie in §8 beschrieben.

Beide Klassen brauchen dieselbe Wurzel: eine **Lineage-Regel über die ganze
Stände-Kette** statt des nächsten Token-Treffers in `neuNach()` — eine eId, die
in EINEM Stand fehlt und danach unverändert zurückkehrt, ist eine strukturelle
Lücke der Quelle und keine Aufhebung. Eigener Bauschritt; in PR #798 bewusst
nicht mitgebaut (§6.7: ein Tor, das den eigenen Befund wegfiltert, ist
gefährlicher als keines).

**Determinismus:** dritter Generator-Lauf aus demselben XML-Cache byte-gleich
zum zweiten — alle 186 Synopse-Shards identisch; einziger Unterschied ist der
Provenienz-Vermerk `parserAenderung` im Quell-Register, den nur der
ändernde Lauf schreibt (§7d).

## 10 Nachtrag 12.9.2026 (zweiter) — Neuprüfung PR #798, Auflage A5: die erfundene Änderung

§9 bleibt unverändert stehen; seine Zahlen (4651 Alt-Blöcke, 1176 `ohne_ereignis`,
Deckel 6716,1 KB, 31 Nur-Titel-Fälle) gelten für den Stand VOR dieser Auflage.

**Befund der Neuprüfung:** A1–A4 bestätigt (Vollerhebung: keine echte Änderung
verloren), aber Profil `/4` buchte **Phantom-Änderungen** — Schritte, in denen die
amtliche Fassung Zeichen für Zeichen dieselbe ist und nur die Fedlex-Generation die
Elementgrenzen anders setzt. Zwei Wurzeln, beide am Roh-XML belegt (abgerufen
12.9.2026):

1. **Das Absatz-Etikett kam aus einem Listenpunkt.** `zerlegeAbsatz` nahm das ERSTE
   `<num>` des ganzen Absatzes. Führt eine Generation die Absatz-Ziffer im TEXT statt
   als Element (MWSTG Art. 97, Stand 2023-09-01: der ganze Artikel ist EIN
   `<paragraph eId="art_97/para">` mit «1 Die Busse …» und «2 Bei erschwerenden
   Umständen …» im Fliesstext), hat der Absatz gar kein eigenes `<num>` — der Block
   bekam das Etikett «a.» eines Listenpunkts weiter unten, und dieser Listenpunkt
   verlor sein eigenes, weil dieselbe Regel das `<num>` aus dem Rumpf strich. Neu:
   `absatzKopf()` liest nur das `<num>` VOR dem Inhalt und entfernt genau dieses.
2. **Das Ordnungs-Suffix wandert über die Grenze `<num>`/Text.** GEBV_SchKG Art. 9
   Abs. 1bis steht 2022-01-01 als `<num>1</num><p><sup>bis</sup> Erfordert …`, 2026-01-01
   als `<num>1<sup>bis</sup></num><p> Erfordert …`; dieselbe Klasse in der
   `listIntroduction` (KLV Art. 7 Abs. 2bis) und im Fliesstext (VRV Art. 67 Abs. 1quater).
   Die A2-Regel «Absatz-Etikett nur beim Wechsel» unterdrückte das Etikett «1» der
   alten Fassung, weil der Absatz davor dasselbe trug — der Vergleich sah ein «1»
   Unterschied. Neu setzt `vergleichsFolge()` das Etikett **genau einmal je Absatz**, so
   wie es im XML steht. Das `xmlns:mig`-Attribut, das dieselben Stellen markiert, ist
   für den Vergleich folgenlos (`reinerText` entfernt Tags samt Attributen).
3. **Nachzügler derselben Familie:** BVV 2 Art. 55 (2024-01-01 → 2025-01-01) setzt die
   Aufzählung einmal als `<blockList>`, einmal als Folge gewöhnlicher `<p>` mit dem
   Buchstaben im Text; die Satzzeichen-Regel (a) nahm den Doppelpunkt nur auf der
   Listen-Seite weg. Regel (a2) tut das jetzt auch vor der ERSTEN Aufzählungsmarke in
   Textform — und nur dort (die erste, zu gierige Fassung strich auch die Strichpunkte
   zwischen den Punkten; beide Grenzen stehen als Unit-Test).

**Tor-Lücke und ihr Schluss:** Der Leer-Diff-Wächter fragt «zeigt der Leser zu wenig?»
und kann die erfundene Änderung nicht sehen — dort unterscheiden sich die gespeicherten
Blöcke ja wirklich, nur in der Struktur. Neu ist `phantomVerletzungen()` der zweite Ast
desselben Wächters: Alt und Neu nach der gemeinsamen, leerraum-blinden Vergleichsform
identisch UND Titel-Paar gleich ⇒ rot. Rot-Beweis am Bestand: gegen die Artefakte aus
`ba3e52470` meldete der Ast vier Fälle (FDV 36 @2022-07-01 und @2023-01-01, HMG 67
@2025-01-01, VRV 67 @2025-07-01); die übrigen vergleicht der Leser gegen den
Korpus-Snapshot und sind für diesen Ast unerreichbar — darum sitzt der eigentliche Fix
im Generator. Eine ECHTE Absatz-Umbenennung (Abs. 2 → Abs. 1 bei gleichem Wortlaut)
bleibt gebucht und wird nie als Phantom gemeldet; auch das steht als Test.

**Vollerhebung gegen `ba3e52470` (jeder Alt-Block, keine Stichprobe):** 10 Blöcke
entfallen, 0 neu — BVV_2 55 @2025-01-01, FDV 36 @2022-07-01 und @2023-01-01,
GEBV_SCHKG 9 @2026-01-01, HMG 9 und 67 @2025-01-01, KLV 7 @2025-07-01, MWSTG 97
@2024-01-01, STHG 25 @2023-01-01, VRV 67 @2025-07-01. Alle zehn sind amtlich wortgleich,
unabhängig gemessen am sichtbaren Artikeltext (Tag-Strip über den ganzen Artikel — das
Verfahren des Profils `/3` —, leerraum-blind verglichen): 10/10 identisch. Dazu tragen
**330 Blöcke korrigierte Etiketten** (AHVG 49b, AHVV 7/125/133/55bis …): das aus einem
Listenpunkt gezogene «a.» ist weg, die Listenpunkte haben ihr amtliches Etikett zurück.

**Stand nach A5:** 4641 Alt-Blöcke, 1166 `ohne_ereignis`, 522 Blöcke mit geändertem
Randtitel (33 davon ohne Wortlaut-Unterschied), Deckel 6684,2 KB / 8192,0 KB (82 %),
0 offene Leer-Diff- und 0 offene Phantom-Verletzungen, 11 befristete Ausnahmen
unverändert. Determinismus: zweiter Lauf aus demselben XML-Cache byte-gleich (einzige
Differenz der Provenienz-Vermerk `parserAenderung`, den nur der ändernde Lauf schreibt).
