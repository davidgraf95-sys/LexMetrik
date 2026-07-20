# Spruchkörper-Extraktion (Richter-Filter, Fundament Block A)

**Stand:** 20.7.2026 · **Abnahme-Status:** Erstrecherche (NICHT durch David abgenommen, §11 Ziff. 5)
**Code:** `src/lib/rechtsprechung/besetzung.ts` (Parser/Kanon) · `scripts/rechtsprechung/bs-besetzung.ts` (BS-Schnitt)
**Tor:** `npm run check:besetzung` · **Tests:** `src/tests/besetzung.test.ts`, `src/tests/bs-besetzung-schnitt.test.ts`
**ROADMAP:** Querschnitt-/Schritt-ID `R-RICHTER` (Detail in `FAHRPLAN-RECHTSPRECHUNG.md §12`)

---

## 1 · Quelle + Stand

| Korpus | Quelle | Besetzungs-Herkunft | Stand |
|---|---|---|---|
| BS (3765) | Roh-Golden `bs-fiw-raw-golden-20260719` (Portal Gerichte BS) | Deckblatt-Block «Mitwirkende» bzw. Schluss-Signatur | Re-Parse 20.7.2026, **ohne Re-Crawl** |
| Bund (1298) | bestehende Snapshots (OCL/bger.ch) | Rubrum-Feld «Besetzung» (bereits isoliert) | unverändert, nur neu projiziert |

Rechtsgrundlage der namentlichen Nennung: Richter:innen und Gerichtsschreiber:innen
sind amtlich **namentlich** genannt (öffentlich, Art. 5 URG-frei). Parteien, Vertretung
und Gutachter sind **anonymisiert** (`C____`, «Dr. med. X»). Die Grenze ist in §3
als harte, testbare Invariante verankert.

## 2 · Regel (deterministisch, §2 — kein LLM)

**Schnitt (BS)** — nur der abgegrenzte Rubrum-Block, nie Fliesstext:
1. Form A «Mitwirkende»-Block: Label-Absatz, danach Namens-Absätze bis zum
   Terminator-Label (`Beteiligt*`, `Partei*`, `Privatkläger*`, `Gegenstand`, …)
   oder bis zum ersten `____`. Deckel 6 Absätze / 400 Zeichen.
2. Form B Schluss-Signatur (Einzelrichter ohne Deckblatt): Rollenzeile
   («Der Einzelrichter …») + folgender Namensabsatz, Ende bei «Rechtsmittelbelehrung».
3. Sonst: `null` — es wird **nichts** geraten (§8).

**Absatz-Naht** (Befund, siehe §5): Absatzgrenze → `, ` (Segment-Trenner), **ausser**
der Absatz endet offen (Titel `Dr.`/`Prof.`/`lic.`, Konjunktion `und`, Partikel `von`)
→ dann ` ` (der Name läuft weiter).

**Strukturierung (Parser, beide Korpora):**
1. NBSP/Whitespace normalisieren.
2. Gerichtsschreiber-Teil abtrennen (`Gerichtsschreiber(in)`, `Greffier/ère`,
   `Cancelliere`; auch vorangestellt, nachgestellt und in Doppelpunkt-Form).
3. Segmentieren an `,` `;` ` und ` ` et ` ` ed ` `&`.
4. Titel/Rollen-Nomen vom Segmentanfang strippen (repeatable) — **Titel sind nie
   Diskriminator**, auch `Dr. med.` nicht.
5. Rolle ernten: `(Vorsitz)`, `Präsident(in)`, `Einzelrichter`, `juge unique`,
   `Referent` → `vorsitz`; ohne Marker gilt der erste Richter als Vorsitz
   (amtliche Reihung nennt den Vorsitz zuerst).
6. Name tokenisieren (Partikel `de/van/von…` bleiben beim Nachnamen).
7. Kanon-Slug = `fold(nachname)[-fold(vorname)]` — **voller** Vorname, nicht Initial
   (Begründung §4).
8. Alias-Tabelle (kuratiert) für belegte OCR-/Schreibvarianten.
9. Korpus-globaler Kanon-Pass: Initial-Slug → Vollname **nur bei Eindeutigkeit im
   selben Namensraum (Kanton/Bund)**, sonst eigener Eimer + Kollisions-Report.

## 3 · Geltungsbereich und Ausnahmen — Anonymisierungs-Grenze

Vier Schichten, alle getestet:

1. **Struktur:** gelesen wird nur der Besetzungs-Block; der Schnitt endet vor dem
   Parteien-Label.
2. **Harte Bremse:** der erste Absatz mit `_{2,}` beendet den Block.
3. **Guard je Segment:** `/_{2,}|\b[A-ZÄÖÜ]\.?_+/` → Segment wird verworfen
   (`leakErkannt`), nie als Richter geführt.
4. **Partei-Marker:** `vertreten durch`, `Advokat`, `Beschwerdeführer` … → verworfen.

**Bewusste Nicht-Ausnahme:** «Dr. med.» ist **kein** Ausschlusskriterium — im Korpus
sind 472 Besetzungen mit `Dr. med.` **Fachrichter** (Sozialversicherungsgericht).
Diskriminator ist Position + Abwesenheit des `____`-Tokens, nie der Titel.

**Leak-Scan-Ergebnis (korpusweit, alle 5093 Snapshots + beide Projektionen): 0.**

## 4 · Belegte Befunde, die den Bauplan korrigierten

| # | Bauplan-Annahme | Korpus-Befund | Folge |
|---|---|---|---|
| B1 | Hidden-Spans zerreissen Namen («Gelze r») → vor dem Lesen entfernen | Spans enthalten **Whitespace/Komma** und stehen **zwischen** Wörtern; Entfernen erzeugte 23 GLUE-Fehler («André Equeyund») | Spans werden als Text **behalten** |
| B2 | Slug = Nachname + **Initial** | Am Appellationsgericht amten **Patrizia Schmid** (150) UND **Patrick Schmid** (37) — `schmid-p` verschmilzt zwei reale Personen | Slug trägt den **vollen** Vornamen |
| B3 | Absatz = logische Einheit, `join(' ')` genügt | `<p>Marc Oser (Vorsitz)</p><p>Dr. iur. Manuel Kreis…</p>` → ein erfundener Richter «Oser Dr. iur. Manuel Kreis», Kreis verschwand | Absatzgrenze wird zum Trenner |
| B4 | Absatzgrenze ist **immer** Trenner (Folgeannahme aus B3) | `<p>Ass.-Prof. Dr.</p><p>Cordula Lötscher</p>` — der Umbruch trennt **doch** innerhalb eines Namens | Naht-Erkennung: offener Titel/Konjunktion/Partikel → kein Komma |

B4 ist der wichtigste: die naheliegende Korrektur von B3 war selbst wieder falsch
und hätte den Phantom-Richter «Dr.» erzeugt. Beide Richtungen brauchen Messung.

## 4a · Befunde der Gegenprüfung (20.7.2026) — Verdikt zuerst «widerlegt»

Die blinde Stichprobe (13 Entscheide, amtlicher Block VOR dem Vergleich notiert)
fand **zwei** Identitäts-Fehler; der anschliessende adversariale Korpus-Sweep über
sechs Anomalieklassen fand weitere. Alle behoben, alle mit Regressionstest:

| Fehlerklasse | Beispiel | Falsches Ergebnis | Ursache |
|---|---|---|---|
| Mehrfach-Initialen | `Dr. med. F. W. Eymann` | Nachname «W. Eymann», Slug `w-eymann-f` | nur die erste Initiale konsumiert |
| Anrede ≠ Initial | `lic. iur. M. Prack Hoenen` | `hoenen-prack` — Vorname weg, Nachname zerlegt | dt. Initial «M.» als frz. «Monsieur» gestrippt |
| Mittel-Initiale | `Christoph A. Spenlé` | `a-spenle-christoph` | Initiale rutschte in den Nachnamen |
| fehlendes Komma (amtlich) | `Dr. Olivier Steiner Dr. Claudius Gelzer` | eine erfundene Person, Gelzer verschwand | Titel mitten im Segment nicht als Grenze gewertet |
| Zustimmungs-Formel | `…, mit Zustimmung von Richterin Truttmann` | ganze Formel als Name | Phrase nicht gestrippt |
| Funktions-/Fachzusätze | `nebenamtliche Bundesrichterin …`, `chem.-ing. ETH …`, `Statthalter …`, `… Erster` | Zusatz im Nachnamen | in LEAD_STRIP/TRAIL nicht geführt |
| Amtstext-Artefakte | `MM les Juges…` (ohne Punkt), `Bunderichterin Hänni` (Typo), `P résidente` (gesperrt), `Stadelmann T.` | Phantom-Richter bzw. toter Zweit-Eimer | fehlende Toleranz |

**Wirkung:** distinkte Slugs 511 → **484** (27 Phantom-/Split-Eimer entfernt);
Anomalieklassen A/B/C/E/F danach **leer**. Übrig bleiben nur abgekürzte Vornamen
(«Th. Aeschbach», «St. Wullschleger») — amtliche Schreibweise, kein Fehler.

**Methoden-Lehre:** die erste, saubere Stichprobe (BS-Appellationsgericht) war
*nicht* repräsentativ — fast alle Zusatzbefunde lagen in den kleineren Korpora
(BGE/BVGer/bpatger/Zivilgericht). Eine Stichprobe über nur den grössten Korpus
hätte «bestanden» ergeben und die Fehler live gestellt.

## 5 · Messung der Absatz-Naht (Beleg für §2)

Über alle 3380 Mitwirkenden-Blöcke, `join(' ')` → naht-bewusst:

- **34** Richterlisten ändern sich, alle 34 lösen eine Verklebung auf
  (z. B. `schmid-lic-iur-christian-hoenen-patrizia` → `schmid-patrizia` + `hoenen-christian`).
- **0** neue Ein-Token-/Phantom-Nachnamen.
- Verbliebene kurze Nachnamen sind **echt**: `Ak` (Nujin Ak), `Hof` (Vladimir Hof).
- Zwei Folgedefekte, die erst durch die korrekte Trennung sichtbar wurden und
  mitbehoben sind: fehlende Terminator-Labels (`Privatklägerschaft`, `Beteiligter`)
  und gesperrt gesetztes «a. o.» (erzeugte den Phantom-Nachnamen «o»).

## 6 · Abdeckung (ehrliche Zahlen, §8)

| Gericht | mit Spruchkörper | ohne | Quote |
|---|---|---|---|
| bs_appellationsgericht | 2837 | 2 | 99.9 % |
| bge | 1212 | 47 | 96.3 % |
| bs_sozialversicherungsgericht | 875 | 49 | 94.7 % |
| bger | 21 | 3 | 87.5 % |
| bvger / bstger | 5 / 5 | 0 / 0 | 100 % |
| bpatger | 4 | 1 | 80.0 % |
| bs_zivilgericht | 2 | 0 | 100 % |
| ZH/BE/SG/AG/GR (je 6) | 0 | 6 | 0 % — **kein Besetzungs-Feld in der Quelle** |

BS-Schnitt-Herkunft: 3380 «Mitwirkende» · 334 Signatur · 51 ohne Block.
Die 51 (+ die kantonalen Stichproben) bleiben **ehrlich leer** — kein Feld, nie ein
leeres Array (§8).

**Distinkte Personen nach Normalisierung: 484 Slugs** — davon **183** mit
Richter-Mitwirkung, **301** reine Gerichtsschreiber:innen (`count: 0`, gehören
nicht in die Richter-Facette).
Rollen-Nennungen: 4963 Vorsitz · 9887 Mitglied · 4625 Gerichtsschreiber (19475).

*(Vor der Gegenprüfung waren es 511 Slugs — die 27 zusätzlichen waren Phantom-
und Split-Eimer aus den in §4a beschriebenen Fehlerklassen.)*

## 7 · Kollisions-Report (Pflege-Bedarf)

Das Tor gibt beide Fehlerrichtungen aus. Stand 20.7.2026 — **7 Zeilen, alle gesichtet:**

**False-Split-Kandidaten → per Alias zusammengeführt** (Aufnahmekriterium: identischer
Name bis auf einen Zeichendreher, dasselbe Gericht, stark asymmetrisches Auftreten —
das Muster eines Erfassungsfehlers, nicht zweier Amtsträger):

| Variante | Kanon | Verhältnis |
|---|---|---|
| `hoenen-christan` | `hoenen-christian` | 1 : 517 |
| `mabillard-roman` | `mabillard-ramon` | 1 : 182 |
| `steiner-oliver` | `steiner-olivier` | 1 : 389 |
| `zingg-denis` | `zingg-dennis` | 1 : 51 |
| `wullschleger-st` | `wullschleger-stephan` | 1 : 691 |
| `turnherr-keller-daniela`, `thurnherrr-keller-daniela` | `thurnherr-keller-daniela` | 1+2 : 160 |
| `dellena-anja` | `dillena-anja` | 1 : 137 |
| `gutmanns-bauer-heidrun` | `gutmannsbauer-heidrun` | 1 : 107 |
| «Van de Graaf» / «van de Graaf» | `van-de-graaf` | 1 : 138 (nur Gross-/Kleinschreibung) |

**False-Merge-Schutz (bewusst NICHT zusammengeführt):** `schmid-p` (Initial) passt auf
**Patrick** und **Patrizia** → bleibt eigener Eimer, wird nicht zugeordnet (§8).
Ebenfalls getrennt gelassen: `bollinger`/`zollinger`, `braun`/`brun`,
`ramelli`/`raselli`, `trutmann`/`truttmann`, `christ-e`/`christ-l`,
`meier-a`/`meyer-a`, `steiner-j`/`steiner-s` — verschiedene Personen.

## 8 · Pflegebedarf (Verfallsregister-Kandidaten)

1. **Alias-Tabelle** ist kuratiert und wächst mit dem Korpus — bei jedem neuen
   Kanton/Import den Kollisions-Report sichten, **nie blind** aliasieren.
2. **`schmid-p`** bleibt unaufgelöst, bis die Quelle den Vornamen ausschreibt.
3. **Nur-Nachname-Korpora (BGE/BGer)** werden bewusst **nicht** mit den kantonalen
   Vornamen-Eimern verschmolzen — das wäre eine Vermutung über Personenidentität
   quer durch die Instanzen. Folge: ein:e Bundesrichter:in erscheint als eigener
   Slug (`gross`, `thomi-g`), auch wenn dieselbe Person kantonal geführt wird.
4. **Gerichtsschreiber:innen** sind erfasst (Rolle + Register), aber noch **keine
   eigene Filter-Achse** — bewusste Scope-Grenze (Block B / spätere Politur).

## 9 · Abnahme-Status

**Erstrecherche.** Maschinell belegt sind: Leak-Scan 0, Fidelity-Stichprobe
818/818 Nachnamen im amtlichen Freitext, Determinismus 4961/4961 Einträge
reproduziert, §6-Byte-Gleichheit von `abschnitte`/`sha`. **Nicht** belegt ist die
fachliche Richtigkeit der Alias-Zusammenführungen und der Rollen-Zuordnung im
Einzelfall — das ist Davids Abnahme (§7/§11 Ziff. 5), nicht die des Bau-Agenten.
