# Erlassnamen-Positivliste und Kürzel-Schreibweisen — Messung und Bau 1.9.2026

**Erstellt:** 1.9.2026 — Anlass: `W2·20-VERWEIS-SCHAERFE`, Einheiten V-7 (Erlassnamen-
Positivliste) und V-8 (amtliche Kürzel-Schreibweisen), Folge der Bestandsmessung vom
31.8.2026 (`verweis-inventar-messung-2026-08-31.md`).
**Status:** BAU-MESSUNG — technisch belegt (V-1-Tor-Artefakt vorher/nachher), fachliche
Abnahme der kuratierten Tabellen durch David offen.

**Quelle/Stand:** V-1-Tor `check:verweis-inventar` auf main `70002a287` (vorher) und auf
`feat/w2-20-verweis-schaerfe` (nachher), 1 479 Snapshot-Erlasse, 34 4xx Verweis-Stellen;
Belege der Tabellen-Einträge: Bund-Register `public/normtext/register.json` (Fedlex-Titel
mit `quelleUrl`/`stand`) bzw. FEDLEX-URL des Ziels (`src/lib/fedlex/tabelle.ts`).
**Anlass:** Fahrplan `fahrplaene/FAHRPLAN-VERWEIS-SCHAERFE.md` §1 V-7; Zielbild David
1.9.2026 (bester Gesetzesdarsteller).

## Regel (deterministisch)

| Signal | Tabelle (`src/lib/fedlex/positivliste.ts`) | Geltung | Beleg-Wächter |
|---|---|---|---|
| `Art. N … des <Kurztitel-Genitiv>` («des Bankengesetzes») | `GENITIV_EINTRAEGE` (86) | `alle` oder `bund` je Eintrag | Kurztitel ⊂ Register-Titel, sonst FEDLEX-URL |
| `Art. N … des Bundesgesetzes [vom D. Monat JJJJ] über <Titel>` | `TITEL_EINTRAEGE`, Kopf `Bundesgesetzes` (80) | `alle` (kein Kanton erlässt ein Bundesgesetz) | Kopf + Fragment = Register-Titel (ohne Klammer/Datum) |
| `Art. N … der Verordnung [vom …] über <Titel>` | `TITEL_EINTRAEGE`, Kopf `Verordnung` (58) | `bund` (kantonale «Verordnung über …» möglich) | dito |
| `Art. N BankG` / `… des FinfraG` (amtliche Schreibweise) | `KUERZEL_SCHREIBWEISEN` (24) | überall (Kürzel ist eindeutig) | Schreibweise in der Titel-Klammer des Registers |

Zusatzregeln (alle im Parser `fremdRoutingFormB` / `artikelnPluralVerweise`):
1. **Klammer-Nachprüfung:** folgt dem Namen — auch hinter einem Datum — eine Klammer, muss
   sie DASSELBE Gesetz nennen; sonst kein Link (BE-154.21 «des Datenschutzgesetzes vom
   19. Februar 1986 (KDSG)» sprang auf main auf das Bundes-DSG).
2. **Ebene:** `NormText` leitet sie aus dem Basispfad ab (`/gesetze/kanton/…` ⇒ kanton);
   Einträge mit Geltung `bund` lösen dort nicht auf. Default des Parsers ist `bund`.
3. **Selbstzitat:** nennt der Titel den GELESENEN Erlass, entsteht kein Fremd-Chip
   (6 Stellen, alle Altrecht — V-5-Zeit-Kante).
4. Kandidaten ohne FEDLEX-Ziel bleiben Text (Gaststaatgesetz 28 Stellen, Nachrichten-
   dienstgesetz 13, Revisionsaufsichtsgesetz 13, Zollgesetz 7, Subventionsgesetz 9 …).

## Kernbefunde (Messung vor dem Bau, main 70002a287)

1. **des/der-Guard-Rest** nach Form-B-Routing: 1 516 Bund- und 795 Kanton-Stellen; Köpfe
   dominiert von datierten Volltiteln («des Bundesgesetzes vom 20. Dezember 1946 über …»),
   Kurztiteln ohne Klammer (Gaststaat-, Bankengesetz …) und unauflösbaren Generika («des
   Gesetzes» 169, «der Verordnung (EU) …» 99).
2. **Kasus-Lücke:** 601 Stellen «Art. N KÜRZEL» mit amtlicher Mischschreibung (FinfraG 139,
   BankG 110, AsylG 103, GSchG 51, BetmG 37, FamZG 36, GwG 30, JStG 24, PartG 16 …) blieben
   als unbekanntes Kürzel Text — die FEDLEX-Tabelle führt diese Keys in Grossbuchstaben.
3. **Falschlink auf main:** BE-154.21 Art. 21 «des Datenschutzgesetzes vom 19. Februar 1986
   (KDSG)» → Bundes-DSG (Genitiv-Map ohne Ebenen-Geltung). Kantonale Namensgleichheit im
   Register: AR-146.1 Datenschutzgesetz, BS-780.100 Umweltschutzgesetz, AR-814.0 Umwelt-
   und Gewässerschutzgesetz, AR-145.52/ZH-215.1 Anwaltsgesetz, BS-772.100 Energiegesetz,
   AR-931.1/BS-911.600 Waldgesetz, BS-162.100/ZH-177.10 Personalgesetz.
4. **198 falsche Self-Links:** «Artikel 71 Absatz 4 Buchstabe a des Bundesgesetzes vom
   20. Dezember 1946 über …» (ZGB) sprang auf ZGB Art. 71 — der des/der-Guard prüft den
   ROHEN Rest (V-6), der Passus verdeckt das «des». Alt/neu-Vergleich mit der main-Fassung
   des Parsers: 198 Stellen (titel 96 · genitiv 77 · klammer 25), 0 gegenläufig.

## Bilanz (V-1-Artefakt `messwerte/verweis-inventar.json`)

| | main 70002a287 | nach V-7/V-8 | Δ |
|---|---|---|---|
| Stellen | 34 439 | 34 494 | +55 (Form-B-Glieder) |
| SELF | 19 824 | 19 647 | −177 (falsche Self-Links) |
| FREMD | 4 900 | 6 048 | +1 148 |
| TEXT | 9 715 | 8 799 | −916 |
| art-desder-guard | 1 281 | 930 | −351 |
| art-m12-kuerzel | 1 572 | 991 | −581 (Kasus-Lücke) |
| n2b-glied / -genitiv / -titel | 672 / – / – | 343 / 663 / 347 | Klassen-Split nach Signal |
| plural-region-unterdrueckt | 865 | 537 | −328 |

Verlinkungsquote (SELF+FREMD)/Stellen: 71.8 % → 74.5 %. Kanton: 12 bisherige Kurztitel-
Links mit Geltung `bund` (BS Arbeitsgesetz 7, AR Umwelt-/Gewässerschutz 3, BS Berufsbildung
1, BE Datenschutz 1) werden Text — 1 davon belegt falsch, die übrigen namensgleich mit
einem kantonalen Erlass (§1: kein Link statt ein möglicherweise falscher).

## Geltung/Ausnahmen
Momentaufnahme 1.9.2026; Zahlen NICHT fortschreiben — das V-1-Tor trägt den Ist-Stand.
Nicht gebaut: kantonale Erlassnamen-Positivliste («§ N des Personalgesetzes», 916 Stellen
`paragraf-fremd-name`), «des Gesetzes»/«der Verordnung» ohne Titel (Trägergesetz-Kontext),
EU-Verordnungen, historische Titel (EOG «Erwerbsausfallentschädigung …», FamZG-Kurzform).

## Pflegebedarf
Neuer FEDLEX-Key ⇒ Kurztitel/Volltitel/Schreibweise in `positivliste.ts` nachziehen (Wächter
`src/tests/fedlex-positivliste.test.ts` verlangt den Register-Beleg); nach Korpus-Nachzug
V-1-Tor regenerieren.

## Abnahme-Status
Technisch belegt (Tor-Artefakt, Alt/neu-Diff, Rot-Beweise). Fachliche Abnahme der 11
URL-belegten Kurztitel (Versicherungsvertrags-, Unfallversicherungs-, Mehrwertsteuer-,
Datenschutz-, Berufsbildungs-, Verwaltungsverfahrens-, Schuldbetreibungs- und Konkurs-,
Verwaltungsstrafrechts-, Erwerbsersatz-, Urheberrechts-, Konsumkreditgesetz) und der
Geltungs-Einstufungen durch David offen; Gegenprüfungs-Liste im PR.
