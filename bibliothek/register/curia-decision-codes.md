# Curia Vista — `Voting.Decision`-Codes (geprüfte Tabelle)

**Erstellt:** 11.9.2026, Auftrag David 11.9.2026 (`W2·6c-ENTSTEHUNG-DATEN`, Etappe E4;
FAHRPLAN-MATERIALIEN-VERZAHNUNG §11.6, Kritik A18).
**Status:** zweifach geprüft (je Code eine eigene Live-Abfrage; Gegenprobe der
Nicht-Existenz für 0, 9, 10).

**Quelle:** `https://ws.parlament.ch/odata.svc/Voting` (OData v3), Abruf **11.9.2026**.
Nutzungsauflage: «Die Daten dürfen nur mit Angabe der Quelle ‹Parlamentsdienste der
Bundesversammlung, Bern› verwendet werden» / «Die Daten dürfen inhaltlich nicht
verändert werden.»

## Warum diese Tabelle von Hand belegt ist

`$metadata` deklariert für `Decision` **kein Enum** (130 112 Bytes durchgesehen, R4 §1a) —
das Feld ist ein blosser `Int32`. Ein Programm, das die Codes rät oder unbekannte Werte in
einen Sammeltopf wirft, verfälscht das Stimmenverhältnis: Code 3 ist «Enthaltung», Code 4
«Anwesend» — beides wäre als «Nein» oder als «nicht teilgenommen» falsch.

Deshalb: **feste Tabelle, unbekannter Code ⇒ ROT** (`scripts/entstehung/curia.ts`,
`aggregiereStimmen`). Die Tabelle hier und die im Code sind dieselbe Liste; sie wird
nur zusammen nachgeführt.

## Erhebungsmethode (reproduzierbar)

Je Code eine eigene Abfrage, die genau eine Zeile zieht — der zurückgelieferte
`DecisionText` ist die amtliche Beschriftung:

```
GET https://ws.parlament.ch/odata.svc/Voting
    ?$filter=Decision eq <N> and Language eq 'DE'
    &$select=Decision,DecisionText
    &$top=1
    &$format=json
```

`$select` nennt genau zwei Felder. **Es wird nie ein Personenfeld abgefragt**
(`FirstName`, `LastName`, `PersonNumber`, `ParlGroupCode`, `Canton`) — die Einzelstimmen
verlassen den Endpunkt gar nicht erst in identifizierbarer Form (§11.8, Entscheid David
11.9.2026 Nr. 2).

## Tabelle (Abruf 11.9.2026)

| Code | Amtlicher `DecisionText` (DE, wörtlich) | Feld im Aggregat |
|---|---|---|
| 1 | Ja | `ja` |
| 2 | Nein | `nein` |
| 3 | Enthaltung | `enthaltung` |
| 4 | Anwesend | `anwesend` |
| 5 | Hat nicht teilgenommen | `nichtTeilgenommen` |
| 6 | Entschuldigt gemäss Art. 57 Abs. 4 | `entschuldigt` |
| 7 | Die Präsidentin/der Präsident stimmt nicht | `praesidiumStimmtNicht` |
| 8 | Demissioniert | `demissioniert` |

**Nicht vorhanden** (Abfrage lieferte null Zeilen): **0, 9, 10**.

Damit ist der offene Punkt 2 aus `bibliothek/materialien/entstehung-2026-09-06/R4-curia-tiefenprobe.md`
(«Exakte `Voting.Decision`-Codeliste — nur 5 Werte empirisch») geschlossen: R4 kannte
1, 2, 5, 6, 7; **3 (Enthaltung), 4 (Anwesend) und 8 (Demissioniert) kommen hinzu.**
R4s Befund bleibt als datierte Stichprobe stehen und wird ERGÄNZT, nicht nachgeführt.

## Gegenprobe an einem Realfall

DSG-Totalrevision (17.059), Schlussabstimmung Vorlage 3, 25.9.2020, Nationalrat:
Ja 141 · Nein 54 · Enthaltung 1 · nicht teilgenommen 2 · entschuldigt 1 ·
Präsidium stimmt nicht 1 = **200 Zeilen** (= Sitze des Nationalrats).
Die Summenprobe `Σ Felder == total` läuft als Zusicherung im Tor `check:entstehung`.

## Pflegebedarf

Nachführen, sobald der Generator einen unbekannten Code meldet (er bricht dann ab).
Nie stillschweigend erweitern: erst die Live-Abfrage oben, dann Code UND diese Datei.

## Grenzen (§8)

- `Voting` trägt **kein `Council`-Feld** (R4 §1a). Der Rat wird ausschliesslich über die
  Zeilenzahl plausibilisiert (150–200 ⇒ Nationalrat); sonst steht `rat: null`. Ein
  Ständerats-Aggregat wird nie behauptet — Entscheid David 11.9.2026 Nr. 3.
- `Vote`/`Voting` tragen **kein `Modified`** — kein Delta-Sync, nur Vollabgleich.
