# Curia Vista / ws.parlament.ch — Tiefenprobe R4 (Etappe E4 «Parlament»)

Alle Abfragen live per `curl` am 6.9.2026 gegen `https://ws.parlament.ch/odata.svc/`
(OData v3, `$format=json`), Abstand ≥0.4s/Request. Rohdateien in diesem Ordner:
`metadata.xml`, `business_*.json`, `resolution_*.json`, `objective_*.json`,
`vote_*.json`, `bill_15434.json`, `preconsult_17059.json`, `coverage2.tsv`,
`resolution_coverage.tsv`, `curia-nummern.txt` (385 eindeutige Curia-Nrn. aus
`botschaften.generated.ts`, Feld `nummer`).

## 0. Curia-Nummern aus dem Repo

`grep -o 'nummer: "[0-9]\{2\}\.[0-9]\{3\}"'` über `botschaften.generated.ts`
→ **385 eindeutige Nummern** (nicht 400/401 wie angenommen; Datei hat 415
Einträge, einige Nummern mehrfach bei mehreren Erlassen/normKeys).

## 1. Vollprobe — 3 Geschäfte

| Geschäft | Curia-Nr. | Fund |
|---|---|---|
| DSG-Totalrevision | **17.059** | direkt aus botschaften.generated.ts |
| ZPO-Revision (BBl 2020 2697) | **20.026** | `ZPO.json` → BBl 2020 2697 = `fga/2020/653` → Zeile 81 |
| Pa.Iv. Taggelder hinterlassener Elternteil (BBl 2022 2515) | **15.434** | **nicht 21/22.xxx wie vermutet** — Live-Query `Objective?$filter=PublicationYear eq '2022' and PublicationNumber eq '2515'` → `BusinessShortNumber:"15.434"`, Typ "Parlamentarische Initiative", Titel "Mutterschaftsurlaub für hinterbliebene Väter" (2015 eingereicht, BBl 2022 2515 ist der spätere Kommissionsbericht) |

### 1a Feldbefunde (`$metadata`, 130'112 Bytes)

- **`Vote`** (17 Felder): u.a. `BusinessShortNumber, BillNumber, Subject,
  SessionName, MeaningYes, MeaningNo, VoteEnd`. **Kein Yes/No/Abstain-
  Zähler, kein `VoteType`, kein `Council`-Feld.**
- **`Voting`** (27 Felder): Personenebene, `Decision`(Int32)+`DecisionText`,
  `Canton`, `ParlGroupCode`. **Auch hier kein `Council`-Feld.**
- **`Resolution`** (19 Felder): `ResolutionDate, ResolutionText, Council,
  CouncilName, CommitteeName, IdBill, Modified`. **Kein
  `BusinessShortNumber`/`BusinessNumber`** — Live-Test bestätigt Fehler
  "Could not find a property named 'BusinessNumber'"; Join nur über
  `Bill?$filter=BusinessShortNumber eq '…'` → `IdBill` (Guid).
- **`Objective`**: wie Vorbericht, **zusätzlich `Modified`** bestätigt.
- **`Preconsultation`**(19), **`Rapporteur`**(11), **`Committee`**(17),
  **`Business`**(43), **`Bill`**(17) — alle mit `Modified`.

### 1b Beispiel 17.059 (DSG)

`Business`: Status "Erledigt", `SubmittedBy:null`, `FirstCouncil1Name:
"Nationalrat"`. **Grösse: 53'866 Bytes für 1 Datensatz** (Volltextfelder
Description/Proceedings/DraftText gefüllt) — deutlich über der
Planannahme "~5 KB je Geschäft". `Preconsultation`: 8 Zeilen. `Rapporteur`:
14 Zeilen. `Resolution` (Bill 1, 5 Zeilen): NR 18.6.18 "Beschluss
abweichend" → SR 11.9.18 "Abweichung" → NR 17.9.18 "Zustimmung" → **SR
28.9.18 "Annahme in der Schlussabstimmung"** → **NR 28.9.18 dito**; FR
korrekt "Adoption (vote final)" (Sprachfilter funktioniert hier, anders
als bei `Vote.Subject`, s. §2). `Objective` (9 Zeilen): 4× Entwurf (BBl
2017), 2× Schlussabstimmungstext (BBl 2018 + Referendumsfrist), 1× AS
2019 625, 1× weiterer Schlussabstimmungstext (BBl 2020 7639, Frist 2021).
`Vote` gesamt: **69 Zeilen** über 5 Sessionen/3 Bills.

### 1c 20.026 und 15.434 — kompakt

- **20.026**: `Business` 27'770 Bytes. `Vote` gesamt 51 Zeilen.
  Schlussabstimmung `Vote ID 30268` Subject `"Schlussabstimmung"`
  (Frühjahrssession 2023), 200 Voting-Zeilen. `Resolution` zeigt "Antrag
  der Einigungskonferenz" (Differenzbereinigung).
- **15.434**: `Business` 12'225 Bytes, `SubmittedBy:"Kessler Margrit"`
  (bei Pa.Iv. gefüllt, anders als BR-Geschäfte). `Objective` (4 Zeilen):
  Bericht BBl 2022 2515, Entwurf BBl 2022 2516, BR-Stellungnahme BBl 2022
  2742, Schlussabstimmungstext BBl 2023 783 (Frist 6.7.2023). `Resolution`:
  Schlussabstimmung beider Räte 17.3.2023. `Vote` 6 Zeilen, Schlussvote
  `ID 30267`.

## 2. Schlussabstimmung — Identifikation & Stimmenverhältnis (Kernfrage)

**Planannahme teils falsifiziert:**

1. **`Vote.Subject` ist nicht sprachrein**: trotz `Language eq 'DE'` liefert
   das Feld FR ("Vote final"/"Vote sur l'ensemble"), IT ("Votazione sul
   complesso") oder DE ("Schlussabstimmung") gemischt über dieselbe
   Geschäftshistorie (belegt an 17.059, 5 Sessionen). Reiner Match auf ein
   Sprachmuster reicht nicht — nötig: Muster
   `Schlussabstimmung|Vote final|Votazione finale`, mit Fallback auf
   `Resolution.ResolutionText` (dort **funktioniert** der Sprachfilter,
   DE/FR live gegengeprüft).
2. **Kein `VoteType`-Feld** (metadata-geprüft) — nur Text-Heuristik.
3. **Vote/Voting sind NATIONALRAT-ONLY für die Stimmenzahl.** Alle 6
   getesteten Schlussabstimmungs-IDs (17.059: 21464/21465/25260; 20.026:
   30268; 15.434: 30267 — plus 25260) liefern `Voting/$count` **konstant
   199–200**, nie ~46. `Voting` hat kein `Council`-Feld; Zeilenzahl ist das
   einzige Unterscheidungsmerkmal und zeigt durchgängig auf NR. **Keine
   SR-Schlussabstimmung mit Einzelstimmen in dieser Stichprobe gefunden**
   (offen: Ständerat evtl. erst seit ~2022 elektronisch, nicht
   abschliessend datiert). → Zahlenmässiges Verhältnis ist **nur für den
   Nationalrat** deterministisch holbar; für den Ständerat liefert
   `Resolution.ResolutionText` nur das Ergebnis (angenommen/abgelehnt),
   keine Zahlen — SR-Zahlen bräuchten das Amtliche Bulletin (`Transcript`)
   oder externe Quellen.
4. **Requests je Geschäft sind niedrig, nicht ~200:** Seitengrösse 1000 >
   ~200 Voting-Zeilen, also **1 Request liefert alle Einzelstimmen einer
   Schlussabstimmung**. Ablauf: (a) 1 Request `Vote?$filter=
   BusinessShortNumber eq 'X'` (Text-Match auf "Schlussabstimmung"-Subject);
   (b) 1 Request `Voting?$filter=IdVote eq <ID>` → ~200 Zeilen, Aggregation
   selbst im Code aus `Decision`-Codes (`1=Ja,2=Nein,5=Hat nicht
   teilgenommen,6=Entschuldigt,7=Präsidium stimmt nicht` — empirisch aus
   einer Stichprobe, **keine Enum-Deklaration in `$metadata` gefunden**).
   **Macher-Fazit: 2 Requests je Geschäft für NR-Zahlen; 0 zusätzliche
   Requests für das reine Ratsergebnis beider Räte (steckt in `Resolution`,
   selber Zug wie Kommission/Rapporteur).**

## 3. Join Curia → Fedlex

Alle 3 Fälle zeigen **Jahres-/Zeitkonsistenz, aber keine Nummerngleichheit**
zwischen `Objective`-AS/BBl-Koordinaten und den `ocUris`/BBl-Feldern in
botschaften.generated.ts (z.B. 17.059: Objective "AS 2019 625" vs.
`ocUris:["oc/2019/111","oc/2022/491"]`; 20.026: "BBl 2023 786" vs. Repo
"oc/2023/491"; 15.434: "BBl 2023 783" konsistent zur Zeitfolge Bericht 2022
→ Schlussabstimmung 2023). Bestätigt Vorbericht: **Join läuft über
Typ+Jahr, nicht über identische Nummer** — exakte 1:1-Auflösung in keinem
der 3 Fälle gefunden, **offen**.

## 4. Abdeckung (Stichprobe n=60 von 385, `coverage2.tsv`)

- **`Business` vorhanden:** 60/60 = **100 %**.
- **`Vote` (≥1 Zeile):** 55/60 = **91.7 %** (Median 5.5, Mittel 14.2, Max
  120 Zeilen). 5 Geschäfte ohne jede `Vote`-Zeile (z.B. 01.025, 01.069,
  01.065, 00.060, 06.057) — vermutlich stillschweigend erledigt oder ältere
  Geschäfte ohne digitalisierte Abstimmung.
- **`Resolution` (≥1 Zeile), n=15** (naiver Join nur über **ersten**
  `Bill`): 6/15 = 40 % — **methodisch verzerrt**: die 4 geprüften
  Nulltreffer haben identischen Typ/Status wie Treffer, Nulltreffer
  wahrscheinlich Artefakt der Bill-0-Auswahl statt Bill 1. **Echte
  Abdeckung nicht abschliessend gemessen** — Produktivlauf muss über
  **alle** `Bill`-IDs iterieren.

## 5. Mutabilität / Drift

- **`Modified` vorhanden bei** `Business, Bill, Resolution, Committee,
  Rapporteur, Preconsultation, Objective` — **fehlt bei `Vote`/`Voting`**
  (17/27 Felder je vollständig aufgelistet, keins "Modified"). Für Vote/
  Voting kein Delta-Sync über Zeitstempel möglich; da Abstimmungen
  historisch unveränderlich sind, unkritisch (volle Neuabfrage je
  Geschäft reicht).
- **Beobachtung:** `Business`(17.059) und `Objective`(15.434) trugen
  **denselben `Modified`-Zeitstempel 10.2.2026** trotz völlig
  verschiedener Geschäfte — Indiz für eine **systemweite Migration/
  Reindex am 10.2.2026**, nicht individuelle Edits. Ein naiver
  "`Modified` > letzter Lauf"-Delta liefe nach so einem Ereignis leer
  (Vollimport nötig) — **nicht abschliessend verifiziert, ob Einzelfall**.
- **Inhaltliche Drift:** `Objective` bekommt nachträglich neue Zeilen
  (17.059: zweiter Schlussabstimmungstext BBl 2020 7639, zwei Jahre nach
  der ersten 2018er-Zeile — vermutlich Nachführung eines Anhang-Erlasses).
- **Rate-Limit:** ~140 Requests in dieser Session, ≤2/s, keine 429/503,
  keine Rate-Limit-Header — konsistent mit Vorbericht.

## 6. Lizenz (Zitat, aus Vorbericht, für R4 erneut bestätigt, Abruf 6.9.2026)

> "Die Daten dürfen nur mit Angabe der Quelle «Parlamentsdienste der
> Bundesversammlung, Bern» verwendet werden." / "Die Daten dürfen inhaltlich
> nicht verändert werden."

UI-Pflicht: (a) sichtbare Quellenangabe "Parlamentsdienste der
Bundesversammlung, Bern", (b) Abrufdatum dokumentiert, (c) keine
inhaltliche Änderung übernommener Textfelder (`ResolutionText`/`Subject`/
`Title` unverändert zitieren). Deckt sich mit §7-Zitat-Ausnahme.

## Offene Punkte

1. Ob eine SR-Schlussabstimmung mit Einzelstimmen (~46 Zeilen) je in
   `Vote`/`Voting` vorkommt (6 Stichproben: nie).
2. Exakte `Voting.Decision`-Codeliste (nur 5 Werte empirisch, keine Enum
   in `$metadata`).
3. Ob der `Modified`-Gleichstand 10.2.2026 einmalig war oder Dauerzustand.
4. Echte `Resolution`-Abdeckung übers Portfolio (Fix: alle `Bill`-IDs).
5. Exakte AS/BBl-Nummer ↔ Fedlex-oc-ELI-Übereinstimmung (nur
   Jahreskonsistenz gezeigt).
