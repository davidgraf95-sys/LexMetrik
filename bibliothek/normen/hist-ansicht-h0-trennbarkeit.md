# H0-Verdikt: Trennbarkeit Änderungsvermerk ↔ Verweis in den Korpus-Fussnoten (W2·5i)

**Erstellt:** 25.7.2026 · Anlass: ROADMAP-Schritt `W2·5i-HIST-ANSICHT`, zwingende
Vorstufe H0 nach `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` §7.3 («Trennbarkeit messen,
bevor gebaut wird»); Intake David 20.7.2026 (#27).
**Status:** **GEGENGEPRÜFT** *(Messung + Hand-Labelung Fable 5 und korpusweiter
Risiko-Signal-Scan als interner Zweitdurchgang; der unabhängige adversariale
Durchgang über den H1-Klassifikator liegt seit 26.7.2026 vor — Verdikt bestanden
mit sechs Befunden, alle umgesetzt: **Ziff. 8**)*. **Fachliche Abnahme David
steht weiterhin aus** (inkl. ZITAT-Entscheid, Ziff. 7.5).
**Quellen:** Eigener Korpus `public/normtext/struktur/{bund,kanton}` (generator-
erzeugt aus den gepinnten Fedlex-Konsolidierungen bzw. der LexWork-API; Stand der
Sidecars im Repo, gelesen 25.7.2026). Kein externer Abruf nötig — gemessen wird
die eigene Datenlage. Werkzeug: `scripts/analyse/hist-h0.ts` (deterministisch,
Seed 20260725); gelabelte Stichprobe:
`docs/ux-audit-2026-07/hist-h0/stichprobe-300-gelabelt.json`.

## 1 · Verdikt

**H0 BESTANDEN — der Umschalter «Änderungshistorie: aus / als Fussnoten /
als Chronologie» darf gebaut werden (H1).** Die sicherheitskritische
Fehlerrichtung (echte Substanz würde als Änderungsvermerk ausgeblendet) liegt
empirisch bei **≈ 0.01–0.05 %**, zwei Grössenordnungen unter der 5 %-Schwelle
der Verdikt-Regel (V2 §7.3). Die Grauzone existiert, ist aber klein (~1–3 %)
und maschinell **erkennbar** — sie bleibt in jeder Ansicht sichtbar.

## 2 · Korpuszahlen (deterministischer Klassifikator, 25.7.2026)

37'849 Fussnoten in 227 Bund- + 1'189 Kanton-Sidecars, fünf Klassen:

| Teil | n | AENDERUNG | VERWEIS | GRAUZONE | ZITAT | UNKLAR |
|---|---:|---:|---:|---:|---:|---:|
| gesamt | 37'849 | 25'367 (67.0 %) | 10'329 (27.3 %) | 424 (1.1 %) | 658 (1.7 %) | 1'071 (2.8 %) |
| Bund | 31'786 | 24'693 (77.7 %) | 5'756 (18.1 %) | 292 (0.9 %) | 632 (2.0 %) | 413 (1.3 %) |
| Kanton | 6'063 | 674 (11.1 %) | 4'573 (75.4 %) | 132 (2.2 %) | 26 (0.4 %) | 658 (10.9 %) |

Klassen-Semantik: **AENDERUNG** = reine Revisionsprosa (einzige ausblendbare
Klasse) · **VERWEIS** = echter Verweis/Substanz · **GRAUZONE** = Revisions-
vermerk MIT Leser-Redirect («Siehe auch die SchlB…», «Heute: …», Aufhebung mit
Nachfolger) · **ZITAT** = reine Publikationsnachweise (BBl-Botschaft,
«[AS …]»-Fassungsketten) · **UNKLAR** = keine Regel greift. VERWEIS, GRAUZONE,
ZITAT und UNKLAR bleiben in **jeder** Ansicht sichtbar (konservativ, §15).

**Konsistenzprobe gegen die Intake-Messung (20.7.2026, OR 778/77):** der
Klassifikator misst am OR 789 AENDERUNG / 75 VERWEIS / 33 GRAUZONE / 23 ZITAT /
13 UNKLAR — deckungsgleich mit dem Intake-Befund.

**Leitplanken-Befund «nie aus einem Beispiel aufs Ganze»:** das OR (und der Bund
insgesamt, 77.7 %) ist NICHT repräsentativ — im Kanton sind nur 11.1 % der
Fussnoten Änderungsvermerke, 75.4 % echte Verweise. Der Umschalter entfaltet
seinen Nutzen fast vollständig auf der Bund-Fläche; kantonal ändert «aus» wenig.

## 3 · Präzision/Recall (Hand-Labelung, stratifizierte Stichprobe n=300)

Geseedete Stichprobe (Seed 20260725, 60 je Klassifikator-Klasse), jede Fussnote
von Hand gelesen und gelabelt (Label-Raum inkl. SUBSTANZ = Substanz-Notiz, die
weder Verweis noch Historie ist):

| Klassifikator-Klasse | Präzision | Fehlklassifikationen (alle UNGEFÄHRLICH — bleiben sichtbar) |
|---|---|---|
| AENDERUNG | **60/60 = 100 %** | keine — **0 Substanz-Fälle unter den Ausblendbaren** |
| VERWEIS | 55/60 = 91.7 % | 3× BS-Umbenennungs-Revisionsprosa, 1× «Jetzt:»-Grauzone, 1× Substanz-Notiz |
| GRAUZONE | 60/60 = 100 % | keine |
| ZITAT | 54/60 = 90.0 % | 6× Grauzone («Siehe heute …»/«entsprechen heute …» nach [AS]-Kette) |
| UNKLAR (Rest) | — | wahre Labels: 19× Historie · 24× Verweis · 8× Grauzone · 2× Zitat · 7× Substanz |

**Sicherheitsmetrik (die einzige, die §15 berührt): Substanz → AENDERUNG.**
Stichprobe: **0/60**. Weil 60 Fälle allein nur eine Obergrenze von ~4.9 %
belegen (Dreier-Regel), zusätzlich ein **korpusweiter Risiko-Signal-Scan über
alle 25'367** als AENDERUNG klassifizierten Fussnoten (Signale: URL,
«abgedruckt/einsehbar/abrufbar», «entspricht», «nie in Kraft», «jetzt»,
«nicht veröffentlicht», «bezogen werden» u. a.): **27 Treffer**, davon nach
Einzeldurchsicht:

- 12× «Bezeichnung gemäss **nicht veröffentlichtem** BRB …» → echte Historie ✓
- 4× BV-Volksabstimmungs-Historie ✓
- ~9× «Die Änderungen werden hier nicht abgedruckt.» (BS) → redaktioneller
  Grenzfall (Vollständigkeits-Hinweis; §8-freundlicher sichtbar zu lassen)
- **2 echte Substanz-Fehler:** `BS-780.100 §29` (Genehmigung des Bundesrats
  **unter Auslegungs-Vorbehalt** — materiell!) · `BS-953.900 §93` («kann bei der
  Direktion der BVB **eingesehen werden**» — Bezugsquelle).

Zusätzlich alle 732 «exotischen» AENDERUNG-Fälle ohne Publikations-/Organ-Anker
per Anfangsmuster-Inventar geprüft: dominiert von gutartigen Familien
(«Ursprünglich Art. …»-Umnummerierung, Redaktionskommissions-Berichtigungen,
«Softwarebedingte, redaktionelle Einfügung», Paarform-Vermerke) — keine
weiteren Substanz-Funde. **Empirische Fehlerrate: 2 klare (+9 grenzwertige)
von 25'367 ≈ 0.008 % (0.04 % inkl. Grenzfälle).**

**Recall der Historie-Erfassung ≈ 96.7 %** (Hochrechnung über die Strata:
~516 Historie-Fussnoten stecken in VERWEIS, ~341 in UNKLAR und bleiben als
Komfort-Rauschen sichtbar — kein Treue-Problem, nur entgangener Aufräum-Effekt).
Die Ansicht «aus» blendet damit **67 %** aller Fussnoten aus (Bund: 78 %).

## 4 · Die Grauzone (V2 §7.3 Ziff. 3)

Beziffert: 424 direkt erkannt (1.1 %) + hochgerechnet ~170 in VERWEIS, ~140 in
UNKLAR, ~65 in ZITAT → **gesamt ~800 ≈ 2.1 % des Korpus**. Typen:
Revisionsvermerk mit SchlB-/UeB-Zeiger (häufigster Fall, ~350×), «Heute: …»/
«Siehe heute …»-Nachführungen, Aufhebung mit Nachfolger-Angabe («Massgebend ist
jetzt … (SG …)»), Wert-Provenienz («Betrag gemäss …»). Alle Typen sind
regelbasiert **erkennbar**; sie werden nie ausgeblendet. Die Grauzone
verhindert den Bau also nicht — sie bestätigt nur, dass ein simples
«Fussnoten aus» (ohne Klassifikation) Substanz verlieren würde, genau wie der
Intake-Befund sagte.

## 5 · Auflagen für H1 (bindend aus dieser Messung)

1. **Nur AENDERUNG ist ausblendbar.** VERWEIS/GRAUZONE/ZITAT/UNKLAR bleiben in
   jeder der drei Ansichten sichtbar — UNKLAR-Rest (2.8 %) ist der bezahlte
   Preis für Konservativität, kein Bug.
2. **Die 2 bekannten Substanz-Fehler vor dem H1-Merge in die Regeln aufnehmen**
   (Signale «unter dem Vorbehalt», «eingesehen werden») und die BS-Familie
   «… werden hier nicht abgedruckt» explizit zu SUBSTANZ routen.
3. Wandert der Klassifikator in die Generator-/Registerschicht
   (`scripts/normtext/`, Sidecar-Feld), ist das ein **Risiko-Pfad**:
   `check:gegenpruefung` Pflicht + golden-Deklaration; die Klassifikation wird
   dann EINMAL build-seitig berechnet (kein Client-Regex-Lauf, §15.3).
4. Fassungs-Fundament nach V2 §7.4 (i)–(iii) gilt für die H1-Arbeit.
5. ZITAT (1.7 %, v. a. Botschafts-/[AS]-Ketten) ist ein **David-Entscheid** in
   H1: sichtbar lassen (Empfehlung, da Provenienz) oder zur Historie schlagen.

## 6 · Negativbefund (S5)

Es existiert im Repo **keine** vorbestehende Fussnoten-Klassifikation
(weder Feld im Sidecar noch Code); die Intake-Zahl 778/77 war eine
Ad-hoc-Messung ohne persistierte Regeln. Diese Datei + `scripts/analyse/hist-h0.ts`
sind jetzt die reproduzierbare Referenz.

*(Der Negativbefund ist mit H1 überholt — siehe Ziff. 7: die Klassifikation ist
jetzt persistiert. Er bleibt als Zustandsbeschreibung VOR dem Bau stehen.)*

---

## 7 · H1-Nachtrag: Umsetzung der Auflagen (26.7.2026)

**Quelle/Stand:** eigener Korpus `public/normtext/struktur/{bund,kanton}`, gemessen
26.7.2026 am regenerierten Bestand. **Abnahme-Status:** gebaut + Tore grün;
**fachliche Abnahme David offen**, adversariale Gegenprüfung des Risiko-Pfads
offen (Auflage 3, s. u.).

### 7.1 Wo die Regeln jetzt leben (Auflage 3)

Die Regeln sind aus dem Messwerkzeug in die Generator-Schicht **gehoben**, nicht
kopiert: `scripts/normtext/fussnoten-klassifikation.ts` ist die eine Quelle;
`scripts/analyse/hist-h0.ts` importiert sie und bleibt reine Messung (§5).
`scripts/normtext/struktur-run.ts` berechnet die Klasse **einmal build-seitig**
und schreibt sie als kompaktes Feld `kl` (`'A'|'V'|'G'|'Z'|'U'`) an jede Fussnote
— kein Client-Regex-Lauf über 37'849 Fussnoten (§15.3).

**Deterministische Regel (Eingabe → Ausgabe):** roher Fussnotentext → Tags
gestrippt/Whitespace normalisiert → erste greifende Regel in fester Reihenfolge
gewinnt → Klasse. Gleiche Eingabe ⇒ gleiche Ausgabe, keine Heuristik (§2).

### 7.2 Auflage 2 umgesetzt — und was sie am Bestand bewirkt

| Signal | Ziel-Klasse | Begründung |
|---|---|---|
| `unter dem Vorbehalt` | **VERWEIS** | BS-780.100 § 29: Genehmigung unter **Auslegungs**-Vorbehalt = geltende materielle Vorgabe |
| `eingesehen werden` | **VERWEIS** | BS-953.900 § 93: Bezugsquelle eines nicht abgedruckten Texts = einziger Leserweg |
| `nicht abgedruckt` | **GRAUZONE** | BS-Familie: Vollständigkeits-Hinweis «hier fehlt Text» — §8-relevant, aber kein Verweis |

Die Riegel stehen **vor** dem Revisionsprosa-Test; sonst gewinnt `REV_START`
(«Die Änderungen …») und der Fall landet wieder in `A`.

**Abgrenzung (bewusst eng):** `unter dem Vorbehalt` fängt NICHT
«unter Vorbehalt des unbenützten Ablaufs der Referendumsfrist» (AR-822.41 § 28) —
das ist reine Inkraftsetzungs-Prosa. Eine weite Fassung hätte massenhaft Historie
in die nicht-ausblendbaren Klassen verschoben und den Umschalter entwertet.

**Wirkung, gemessen:** genau **13** Fussnoten verlassen AENDERUNG (12× «nicht
abgedruckt» + 1× «unter dem Vorbehalt»), **alle kantonal**. Korpus-Delta gegen
Ziff. 2: AENDERUNG 25'367 → **25'354**, Kanton 674 → **661**. Die Bund-Fläche
(24'693) ist von Auflage 2 **nicht** betroffen.

### 7.3 Regeneriert wurde NUR Bund (bewusst)

227 Bund-Sidecars, 31'786 Fussnoten. Verteilung nach der Regeneration
(**Endstand nach den Gegenprüfungs-Nachträgen B1/B3**, s. Ziff. 8):

| | A | V | G | Z | U |
|---|---:|---:|---:|---:|---:|
| Bund (31'786) | **24'631 (77.5 %)** | 5'759 (18.1 %) | **354 (1.1 %)** | 632 (2.0 %) | 410 (1.3 %) |

*(Zwischenstand vor B1/B3 war A 24'693 / G 292 — die 62 Befristungs- und
«Laut Ziff.»-Fälle sind aus A nach G gewandert.)*

Kanton bleibt **ohne** `kl` (1'189 Sidecars): dort sind nur 11.1 % der Fussnoten
Historie, der Nutzen liegt auf der Bund-Fläche. Eine Fussnote **ohne** `kl` gilt
im Reader als unklassifiziert und bleibt in **jeder** Ansicht sichtbar — die
fehlende Klasse blendet also nie etwas aus (konservativ, §8).

**Additivitäts-Beweis** — `npm run normtext:sidecar-differ` (Quelle
`scripts/normtext/check-sidecar-differ.ts`). **Was das ist, genau:** ein
**Einmalbeweis-Skript, manuell gefahren** — KEIN Dauer-Tor. Es hängt nicht in
`npm run gate`/`run-parallel` und läuft nicht in CI, weil es einen VORZUSTAND
braucht, den nur der Mensch benennen kann (welcher git-Ref ist «alt»?). Es
beweist eine konkrete Regeneration, nicht eine Invariante. *(Formulierung
präzisiert nach Gegenprüfungs-Befund B6 — vorher stand hier «Tor», was mehr
versprach als da ist.)*

Verfahren: alt↔neu strukturell verglichen; erlaubt sind ausschliesslich
`erzeugt`, neu hinzugefügte `…/fussnoten/N/kl` und — nur mit ausdrücklicher
Richtungs-Whitelist `--kl-wechsel=A-G` — geänderte `kl`-WERTE, die einzeln mit
Erlass/Artikel/fn-Nr ausgewiesen werden. Die Whitelist ist bewusst
**richtungsgebunden**: eine Regeländerung, die Fussnoten NACH `A` schiebt (= neu
ausblendbar macht), ist die sicherheitskritische Richtung und wird rot, auch wenn
im selben Lauf erwünschte A→G-Wechsel stattfinden (einmal gezeigt mit
`--kl-wechsel=G-A` → 62 Verstösse, Exit 1).

Ergebnis Lauf 1 (Klasse neu): 227 Dateien, 31'786 neue `kl`, **0 unerlaubte
Abweichungen**, 0 `erzeugt`-Änderungen. Ergebnis Lauf 2 (nach B1/B3): **62
Klassenwechsel A→G, sonst 0 Abweichungen**. Beide Läufe: alle Bestandsfelder
inkl. der FN-5/M14-Offsets `pos{b,it,o,l}` byte-identisch. Gegenproben im Skript:
jede Fussnote MUSS ein gültiges `kl` tragen und die Bilanz «alt trug N + neu
ergänzt M == alle Fussnoten» muss aufgehen (sonst wäre ein No-op-Lauf grün,
§6.7); einmal rot gezeigt mit verschobenem `pos.o`, geändertem Text und
gelöschtem `kl`.

### 7.4 Auflage 1 in der UI: was ausblendbar ist

*(Nachgezogen S1, 17.8.2026 — Stand des gebauten Reader-Codes. Der Absatz sprach
von DREI Ansichten und von ZWEI Trägern; beides stimmt nicht mehr. Die Auflage 1
selbst ist unverändert, nur ihre Umsetzung ist es nicht.)*

Ausgeblendet wird ausschliesslich `[data-fn-klasse="A"]` — der Attribut-Selektor
greift nur bei exakt `A`. V/G/Z/U **und** alles ohne Klasse bleiben in **beiden
Stellungen** sichtbar.

**Zwei Änderungen gegenüber der Erstfassung:**

1. **Zwei Stellungen statt drei Ansichten.** Der Schalter ist mit dem
   Optionen-Rückbau S1 (Entscheid David F1, 16.8.2026) zweiwertig geworden
   («Änderungsvermerke: an | aus»); die dritte Ansicht «als Chronologie» ist
   ersatzlos gestrichen. Der letzte Satz der Erstfassung — der `<p id="fn-…">`-
   Quellblock bleibt im DOM, «weshalb das Marker-Popover auch in der
   Chronologie-Ansicht trägt» — gilt sachlich weiter (der Block bleibt im DOM,
   das Popover trägt in beiden Stellungen), nur den benannten Modus gibt es nicht
   mehr.

2. **DREI Träger, nicht zwei.** «`display:none` trifft nur Marker-Ziffern und
   Apparat-Zeilen» war ab S1 unvollständig. Der Schalter blendet aus (`index.css`,
   alle Regeln auf `.lc-leser` gescopt):

   | Träger | Was | Seit |
   |---|---|---|
   | `[data-fn-klasse="A"]` | Marker-Ziffer am Wort | W2·5i |
   | `[data-fn-apparat]` ohne Nicht-A-Kind | die Apparat-Zeile am Artikelfuss | W2·5i |
   | **`[data-hist-slot]`** | die **«Fassung»-Overline/Zeitleiste** am Artikelfuss (`ArtikelLeser.tsx`) | **S1** |

   Der dritte Träger kam mit S1 dazu (Befund K4): bis dahin hing die
   Fassungs-Zeile an gar keinem Schalter und blieb bei «aus» als einzige
   Historie-Spur im Lesetext stehen. Ausgeblendet wird der SLOT, nicht nur die
   Zeile darin — sonst bliebe seine reservierte Höhe (`mt-4 min-h-beiwerk` =
   16 + 24 px) als Phantom-Lücke unter jedem Artikel zurück.

**Unverändert:** kein Substanz-Träger ist erfasst; der Normtext ist von keiner
Regel betroffen und bleibt sichtbar, durchsuchbar und im Ausdruck (R9/§8). Alle
Regeln arbeiten mit `display:none` auf Beiwerk, der DOM bleibt vollständig.

**Folgeauflage aus S1-Nachzug (17.8.2026, §8):** weil «aus» auf einem Erlass ohne
`kl:'A'` und ohne Fassungs-Zeile GAR NICHTS ausblendet, wird der Schalter dort
nicht mehr angeboten. Gemessen über den ganzen Korpus: 1217 von 1420 Erlassen
tragen keine `kl:'A'`-Fussnote; von diesen haben 6 einen Historie-Shard und
genau 2 (MONTREAL, PVUE) darin Einträge — nur dort wirkt der Schalter noch über
den dritten Träger. Regel und Belege:
`src/pages/gesetz-leser/berechnungen.ts` (`bieteAenderungsvermerkeSchalter`) +
`src/tests/aenderungsvermerke-schalter.test.ts`.

### 7.4a Nachtrag 17.8.2026 abends — EIN Träger statt drei (Entscheid David)

*(Ersetzt die Träger-Tabelle in 7.4. Die Auflage 1 selbst ist unverändert — sie
wird jetzt sogar strenger erfüllt als zuvor.)*

**Anlass, wörtlich:** «wenn änderungsvermerke abgewählt wird dann verschwinden
auch fussnoten.» Der Befund trifft zu. Gemessen 17.8.2026 @1440 in der Stellung
Fussnoten = an · Änderungsvermerke = aus:

| Erlass | Apparat-Einträge sichtbar | Marker sichtbar | Apparat-Kästen |
|---|---|---|---|
| StPO | 285 → **98** | 285 → **105** | 135 → 56 |
| ZGB | 809 → **90** | 809 → **173** | 531 → 105 |

Die Ursache liegt in der Klassenverteilung, nicht im Selektor: `kl:'A'` ist beim
Bundesrecht die **Regel**, nicht der Sonderfall (ZGB 719 von 809 Einträgen). Ein
Schalter, der «alle A-Fussnoten» ausblendet, blendet damit faktisch den
**amtlichen Fussnoten-Apparat** aus — und war so ein zweiter, versteckter
Fussnoten-Schalter. Das ist §8-widrig: die Beschriftung sagt «Änderungsvermerke»,
die Wirkung war «Fussnoten».

**Entscheid David 17.8.2026: Fussnoten unabhängig von Änderungsvermerken.** Zwei
Schalter, zwei **disjunkte** Flächen:

| Schalter | Fläche | Träger |
|---|---|---|
| Fussnoten | Marker **und** Apparat, **alle** Klassen (auch `kl:'A'`) | `[data-fn-ref]` · `[data-fn-marker]` · `[data-fn-apparat]` |
| Änderungsvermerke | **nur** die abgeleitete Fassungs-Zeile | `[data-hist-slot]` |

Die beiden Regeln auf `[data-fn-klasse="A"]` und auf den A-only-Apparat sind
**ersatzlos entfallen** (`index.css`). Der dritte Träger aus 7.4 ist damit der
**einzige**; die A-Fussnote bleibt vollständig abwählbar, nur über den Schalter,
dem sie sachlich gehört.

**Warum die Auflage 1 dadurch strenger erfüllt ist:** sie verlangte, dass V, G, Z,
U und alles ohne Klasse vom Vermerke-Schalter unberührt bleiben. Das gilt jetzt
für **jede** Klasse — der Schalter fasst den Fussnoten-Apparat überhaupt nicht
mehr an. Die Sicherheitsrichtung ist unverändert einseitig: nie amtliche Substanz
hinter einer Beschriftung verstecken, die etwas anderes verspricht.

**Gilt in beiden Hüllen.** Die Regeln hängen an `.lc-leser`, nicht am V3-Flag.
Den Schalter in V1 gekoppelt zu lassen hiesse, dasselbe Steuerelement mit zwei
Bedeutungen zu führen (§5).

**Die Anbieten-Regel bleibt unverändert — gemessen, nicht geschlossen.** Nach der
Entkopplung beschreibt die `kl:'A'`-Bedingung in `bieteAenderungsvermerkeSchalter`
keine Wirkung mehr; sie kann nur noch überanbieten. Gemessen über alle 1420
Struktur-Sidecars gegen alle 209 Historie-Shards (205 mit Einträgen), 17.8.2026:

| Fall | Anzahl |
|---|---|
| `kl:'A'` > 0 **und** Fassungszeile | 203 → Schalter wirksam |
| `kl:'A'` > 0 **ohne** Fassungszeile | **0** → gäbe einen toten Schalter |
| `kl:'A'` = 0 **mit** Fassungszeile | 2 (MONTREAL, PVUE) |

{203} ∪ {2} ist genau die Menge der 205 Shards mit Einträgen — die Redundanz ist
heute vollständig gedeckt und bleibt darum stehen (§1). Der Tag, an dem ein
Erlass mit `kl:'A'` ohne Historie-Einträge dazukommt, ist der Tag, an dem sie
fallen muss; Wächter dafür ist `src/tests/aenderungsvermerke-schalter.test.ts`
(«Ä68: kein Erlass trägt kl:A ohne Fassungszeile»), der dann rot wird und den
Erlass benennt.

**Belege:** `src/index.css` (Regel-Block Ä68) · `e2e/hist-ansicht-w25i.e2e.ts`
(A-Zusicherungen umgekehrt, je zweiseitig, plus 2×2-Matrix über Bund und Kanton) ·
`e2e/leser-optionen.e2e.ts` (Ä69). Rot-Beweis am Vorzustand gesehen: «Vermerke=aus
nimmt Apparat-Zeilen mit — Expected 29, Received 8» (BGBM).

### 7.5 Auflage 5 (ZITAT) — bleibt David-Entscheid

`Z` (632 Fussnoten im Bund, 2.0 %) ist **sichtbar** gelassen = die Empfehlung aus
Ziff. 5 (Provenienz). **Nicht** entschieden, nur umgesetzt-wie-empfohlen: der
finale ZITAT-Entscheid liegt bei David. Umschalten wäre ein Ein-Zeichen-Eingriff
in `klassifiziere()` (ZITAT → AENDERUNG) plus Regeneration — die Stelle ist im
Regel-Modul als solche kommentiert.

### 7.6 Pflegebedarf

Ändert Fedlex den Wortlaut seiner Revisionsvermerke, wandern Fälle nach `U`
(sichtbar, harmlos) — nie automatisch nach `A`. Neue Auflage-2-Fälle gehören in
`SUBSTANZ_VERWEIS`/`VOLLSTAENDIGKEIT` **mit** Unit-Test-Fixture im amtlichen
Wortlaut (`src/tests/fussnoten-klassifikation.test.ts`). Nach jeder Regeländerung:
`npx vite-node scripts/analyse/hist-h0.ts` (Korpuszahlen) + Regeneration +
Differ-Beweis.

### 7.7 Was offen bleibt

- **Fachliche Abnahme David** (§7/§8) — inkl. ZITAT-Entscheid (7.5).
- **Kopf-Fussnoten** folgen der Wahl bewusst nicht (keine Chronologie-Ersatz-
  darstellung für den Erlass-Kopf; Begründung am Fundort in `ErlassKopfBlock.tsx`).
- Der **Recall**-Rest aus Ziff. 3 (~96.7 %) ist unverändert: Historie in `V`/`U`
  bleibt als Komfort-Rauschen sichtbar — kein Treue-Problem.

---

## 8 · Adversariale Gegenprüfung des H1-Baus (26.7.2026) — Befunde und Umsetzung

**Verdikt: bestanden**, mit sechs Befunden. H0-Auflage 3 (Risiko-Pfad → unabhängige
Gegenprüfung) ist damit erfüllt; der Bau-Auftrag hat NICHT selbst quittiert.

### 8.1 B1 (MITTEL, §1/§8) — Befristungen sind vorwärts gerichtet

**Befund:** 62 Bund-Fussnoten tragen ein Geltungs-**ENDdatum**, davon 27 mit
Enddatum ≥ 2026 (laufende Befristungen). Beispiele: `ASYLG 95a` fn 300 («Art. 95a
Abs. 1 Bst. a **gilt bis 31. Dez. 2027**»), `KVG 37` fn 116/117 («**in Kraft vom**
18. März 2023 **bis zum** 31. Dez. 2027»), `VTS 95` fn 438 («bis zum 31. Dez. 2030,
ab dem 1. Juli 2026 unbefristet»). Alle waren `A` = ausblendbar. Eine laufende
Befristung ist materiell erheblich und weist in die Zukunft — sie darf in «aus»
nicht verschwinden.

**Regel (deterministisch, Eingabe → Ausgabe):** enthält der Fussnotentext eines
der am Bestand erhobenen Befristungs-Muster, ist die Klasse `GRAUZONE`
(Revisionsvermerk MIT geltender Information), nicht `VERWEIS`:

| Muster | Belegfall |
|---|---|
| `gilt`/`gelten`/`gültig` + `bis` | ASYLG 95a fn 300 |
| `in Kraft vom` … (≤ 60 Zeichen) … `bis` | KVG 37 fn 116/117 · 58× häufigster Fall |
| `in Kraft bis` | EPV 93 fn 34 |
| `befristet bis` | — |
| `bis zum Inkrafttreten` | ZGB 89a fn 136 |

**§2-KRITISCH — warum NICHT nach «heute» unterschieden wird.** Naheliegend wäre,
nur noch laufende Befristungen (Enddatum ≥ heute) zu schützen. Das wäre ein
`Date.now()` in der Klassifikationslogik: dieselbe Fussnote fiele je nach
Build-Tag in eine andere Klasse, das Sidecar wäre nicht reproduzierbar und der
Differ-Beweis wertlos. **Alle Befristungs-Vermerke — auch längst abgelaufene —
werden `GRAUZONE`.** Determinismus vor Feinheit; der Preis sind ~35 historische
Befristungen, die sichtbar bleiben (Lesekomfort, kein Treue-Problem). Eigener
Unit-Test sichert, dass abgelaufen und laufend GLEICH klassifiziert werden.

**Bewusst NICHT in der Regel:** ein blosses `bis zum` (fängt reine Historie wie
`KVV 136` fn 518) und `verlängert bis` (die 5 Treffer — `FZA 10` — sind bereits
`U` und damit ohnehin sichtbar; die Regel gewänne nichts und würde nur breiter).

### 8.2 B3 (MITTEL-NIEDRIG) — operative Anordnung in «Laut Ziff. …»

`AVIV 51a` fn 168: «… **Laut Ziff. II kann die Karenzfrist** von zwei Wochen nach
Abs. 4 bereits vor dem Inkrafttreten dieser Änd. zu laufen beginnen, sofern die
Kurzarbeit vorangemeldet worden ist.» Eine operative Fristenlauf-Regel im
Fussnotengewand. Regel: `Laut Ziff.` → `GRAUZONE` (im Bestand 1 Treffer, einzeln
geprüft — das Muster führt ausschliesslich solche Anordnungen ein).

### 8.3 Wirkung am Bestand (gemessen, nicht geschätzt)

**62 Fussnoten wechseln `A` → `G`** (61 Befristung + 1 «Laut Ziff.»), verteilt auf
36 Erlasse. Bund: AENDERUNG 24'693 → **24'631**, GRAUZONE 292 → **354**; V/Z/U
unverändert. Der Differ-Lauf weist jede Änderung einzeln mit Erlass/Artikel/fn-Nr
aus. Kanton bleibt unberührt (kein `kl`).

### 8.4 B4/B5/B6 (NIEDRIG) — mitgenommen

- **B4:** die Chronologie-Zeile nennt jetzt die **Fussnoten-Nummer**; ohne sie war
  der Marker im Wortlaut (²⁷) keinem Eintrag zuzuordnen. Das Datum trägt zusätzlich
  `data-hist-datum="<ISO>"` (Sortierschlüssel maschinell prüfbar).
- **B5:** der e2e deckt jetzt auch je einen **`G`- und `U`-Sichtbarkeitsfall** ab
  (`ELG` Art. 10: fn 34 = A · fn 35 = U · fn 41 = G auf EINEM Artikel). Verbreitert
  jemand später den CSS-Selektor auf `[data-fn-klasse]`, wird das rot.
- **B6:** die Formulierung «Tor» für `check-sidecar-differ.ts` ist korrigiert und
  das Skript als `npm run normtext:sidecar-differ` verankert (Ziff. 7.3).

### 8.5 B2 — von einer anderen Session gefixt (PR #376, auf main)

Der Gegenprüfungs-Befund **B2** («in Kraft vom X bis zum Y» ergab kein
Revisionsdatum) wurde parallel in `src/lib/verzahnung/revisionen-extrakt.ts`
behoben (PR #376, Squash `d8fcb0e6`): Trigger `in Kraft vom` (massgeblich das
**Anfangs**-Datum), Jahr-Ellipse «vom 21. März bis zum 20. Sept. 2020» und ein
Fremd-Adressierungs-Wächter `ART_PRAEFIX_RE` («Art. 40c in Kraft vom …» in einer
Gliederungstitel-Fussnote datiert Art. 40c, nicht den Host).

**Merge-Auflösung (26.7.2026):** #376 änderte genau die Schleife, die dieser
Schritt zuvor als `extrahiereFussnotenRevision(text, hostToken?)` herausgezogen
hatte. Aufgelöst wurde **vereinend**: die vollständige #376-Semantik (drei
Trigger, Ellipse-Vorrang, Wächter, `rest`-basierte AS-Suche) lebt jetzt IM
Helfer; `extrahiereArtikelRevision` ist das Maximum darüber und reicht
`hostToken` durch. Nichts von #376 ging verloren — dessen 48 neue Tests laufen
unverändert grün.

**Wirkung auf DIESE Ansicht: keine — und das ist nicht offensichtlich.**
Befund B1 (Ziff. 8.1) hat dieselbe Fussnoten-Familie bereits aus `A` nach `G`
verschoben, und die Chronologie listet ausschliesslich `A`. Gemessen am Bestand:
von den **58** Fussnoten, die durch #376 neu ein Datum erhalten, sind **0 in
Klasse A** und alle 58 in `G`. #376 nützt damit der Revisions-/Leitfall-Schicht,
nicht der Chronologie.

| Klasse | n | ohne Datum vorher | ohne Datum jetzt |
|---|---:|---:|---:|
| A (= die Chronologie) | 24'479 | 586 (2.39 %) | **586 (2.39 %)** |
| G | 354 | 109 (30.79 %) | **51 (14.41 %)** |
| A + G | 24'833 | 695 (2.80 %) | **637 (2.57 %)** |

Kein Chronologie-Test war also sachlich überholt. Drei Zusicherungen halten das
Zusammenspiel dennoch fest (`src/tests/hist-chronologie.test.ts`): die Familie
steht als `G` nicht in der Liste · wäre sie `A`, trüge sie das **Anfangs**-Datum
(2025-01-01, nicht 2033-12-31) · die Jahr-Ellipse ergibt 2020-03-21, nicht
2020-09-20. Der Reader reicht `hostToken` an den Extrakt durch, damit die
Chronologie-Daten mit den Revisions-Shards übereinstimmen (EINE Wahrheit, §5).

### 8.6 Nebenbefund beim Einbau (eigene Beobachtung, kein Gegenprüfungs-Befund)

Zwei Fallen, die beim Umsetzen selbst zuschlugen und darum hier stehen:

1. Ein `[^.]`-Fenster hinter «in Kraft vom» matchte **0 von 58** Fällen — deutsche
   Datumsabkürzungen («1. Jan. 2025») enthalten Punkte. Regeln über amtlichen
   Datumstext dürfen `.` nicht ausschliessen.
2. `--kl-wechsel=A>G` wird von der Shell als **Umleitung** gelesen; der Lauf
   startete mit leerer Whitelist und meldete 62 «unerlaubte» Abweichungen (plus
   eine Streudatei `G`). Der Parser akzeptiert jetzt auch `A-G`/`A:G`.
3. `innerText` liefert unter `content-visibility: auto` für nicht gerenderte
   Teilbäume **einen leeren String** — eine `not.toContain`-Zusicherung darauf ist
   still immer wahr. Im e2e steht darum `textContent` plus eine Längen-Vorprobe.
