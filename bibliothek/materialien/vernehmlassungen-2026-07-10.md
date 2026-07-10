# Vernehmlassungen — «Gesetzgebung in Arbeit» je Bund-Erlass (Paket 3, W3·11)

> §11-Ablage zum POC + Bau vom 10.7.2026 (Fedlex-Portfolio Paket 3, RISIKOPFAD Extraktion).
> Go David 10.7.2026 («go zu allem»; Reihenfolge 1→2→5→3→4, Pakete 1/2/5 gebaut).

## 0. POC-Verdikt (Phase 1, VOR Bau) — **MACHBAR**

Der Plan stufte Paket 3 als «Machbarkeit erst per POC» ein. Empirisch erhoben (§7 Quell-Wahl:
Format-Menü zuerst) am 10.7.2026 gegen den amtlichen Fedlex-SPARQL-Endpunkt:

| Kriterium | Ergebnis | Wert |
|---|---|---|
| Amtliche, strukturierte Quelle | ✅ | Fedlex-SPARQL-Graph (`jolux:Consultation`), **direkte** `foreseenImpactToLegalResource`-Kante zum Gesetz — einfacher als Paket 2 (kein oc-Umweg) |
| Deterministisch | ✅ | reine SPARQL-Kette, VALUES-Batching, 2 Läufe byte-identisch |
| Brauchbare Füllrate | ✅ | status 100 % · Titel DE/FR/IT je 100 % · fristStart/Ende 96,6 % · projEli 100 % |
| Join auf die Norm | ✅ | 173/218 Erlasse mit ≥1 Verfahren; 822 distinkte Consultations |
| Currency «laufend vs. abgeschlossen» | ✅ | amtliches Status-Vokabular `consultation-status/0..6` (kein Heuristik-Rateschritt) |
| Reichweite | ✅ | Frist-Jahre **2000–2026** (besser als Plan-Annahme «~ab 2006») |
| Laufzeit / Timeout-Risiko | ✅ | Voll-Lauf 218 SR in **1,6 s** (Batch 55), keine UNION-/STRSTARTS-Falle |

**Rest-POC (FAHRPLAN-Härtung a–d) verifiziert:**
- **(a) Voll-Lauf 218 SR:** 1269 Roh-Bindings → 822 distinkte Consultations, 1,6 s. Trefferverteilung
  Status 1→18 · 2→19 · 3→14 · 4→48 · 5→713 · 6→10 (kein Status 0 im Korpus).
- **(b) Status 0/1 ohne `cons-open`-Frist:** alle 18 «geplant» tragen keine Frist → im Datenmodell
  `fristStart/Ende` weggelassen (nicht leerer String); UI zeigt Status-Label statt «läuft bis …».
- **(c) `institutionInChargeOfTheEvent`-Label:** **korpusweit LEER (0 %)** — das Prädikat liefert am
  Consultation-Knoten nichts (Paket-5-Finding 6: OPTIONALs am Knoten können korpusweit leer sein).
  → eröffnende-Stelle-Hinweis fallen gelassen (nicht erfunden); generische Behörde `BUND` statt `BR`.
- **(d) Reichweite:** ältestes fristStart 2000, jüngstes 2026; proj-Jahr-Kodierungen `6000–6021`
  (Legacy) + `2021–2026` (modern) — deckt beide Schemata.

**Referenzfälle live reproduziert:** OR(220)→33 · DSG(235.1)→3 · MWSTG(641.20)→**14**.
*(Der FAHRPLAN-Härtungs-Vermerk nannte MWSTG→4; live 10.7. **zweifach** reproduziert = 14. Die
Plan-Zahl war überholt/vertippt — massgeblich ist der live-reproduzierte, tor-verankerte Wert 14.)*

## 1. Quelle + Stand

- **Amtliche Quelle:** Fedlex-SPARQL-Endpoint `https://fedlex.data.admin.ch/sparqlendpoint`
  (POST, `application/x-www-form-urlencoded`, `Accept: application/sparql-results+json`).
  Sicht-/Live-Link je Verfahren: `https://www.fedlex.admin.ch/eli/dl/proj/<jahr>/<nr>/cons_1/de`
  (Vernehmlassungs-Portal). **SPA-Shell-Falle:** 200 ≠ Inhalt — Existenz per SPARQL, nie HTTP-Status.
- **Nie** Dritt-Repo `droid-f/fedlex` (CC BY-NC-SA).
- **Abrufdatum / `stand` je Eintrag:** 10.7.2026 (Abfragedatum — Status ist **mutabel**, `stand` ist
  der Prüftag des Zustands-Snapshots, nicht ein Publikationsdatum).

## 2. Regel (deterministisch) — die direkte Consultation-Kette

Je SR (Grundmenge = 218 Bund-Volltext-Erlasse, `register.json` ebene=bund & status=snapshot):

```
?tax  skos:notation "<SR>"^^<…/notation-type/id-systematique>   # TYPISIERT (sonst Timeout)
?cc   jolux:classifiedByTaxonomyEntry ?tax .
?cons a jolux:Consultation ;
      jolux:foreseenImpactToLegalResource ?cc ;                 # DIREKTE Norm-Kante
      jolux:consultationStatus ?status .
OPTIONAL eventTitle (DE/FR/IT) · hasSubTask→ConsultationPhase (eventStartDate/eventEndDate)
```

- **`projEli`** steckt in der cons-URI selbst (`eli/dl/proj/{jahr}/{nr}/cons_N`) — kein Zusatz-Join.
- **`key`** = `VERN-{jahr}-{nr}` (cons_1); weitere Phasen `cons_2+` tragen den Suffix (kein Kollaps).
  Legacy `VERN-6006-36` (VDSG) unverändert.
- **Status-Enum** (1:1 vom Vokabular): 0 in-vorbereitung · 1 geplant · 2 **laufend** ·
  3 abgeschlossen-stellungnahmen · 4 abgeschlossen-bericht · 5 abgeschlossen · 6 zurueckgezogen.
- **Determinismus (§2):** VALUES-Batch 55, Batch-Reihenfolge = Eingabe; Sortierung total
  (Status-Priorität → Fristende absteigend → key); zwei Läufe byte-identisch verifiziert.

## 3. Geltungsbereich, Füllraten, Ehrlichkeit (§8)

- **822 Verfahren** über 218 SR; **173/218** Erlasse mit ≥1 Verfahren; 217 Mantelvorlagen (mehrere
  `normKeys`). Status im Bau: abgeschlossen 713 · abgeschlossen-bericht 48 · **laufend 19** ·
  geplant 18 · abgeschlossen-stellungnahmen 14 · zurueckgezogen 10.
- **Zuordnungs-Grobheit (Randfall, ehrlich markiert):** `foreseenImpactToLegalResource` zeigt auf die
  unter dem SR klassifizierte Ressource. Eine Verordnungs-Vernehmlassung (z. B. VDSG `VERN-6006-36`)
  hängt am DSG-cc (235.1) → erscheint unter DSG. Das ist **amtlich-graph-korrekt, aber grob**: der
  UI-/Eintrags-`hinweis` sagt «kann bei Mantelvorlagen grob sein, massgeblich bleibt die amtliche
  Quelle» — nie «amtlich bestätigt zugehörig».
- **Currency (Hauptrisiko):** Status veraltet. Zwei Schutzschichten: (1) Netz-Tor
  `check:vernehmlassungen-netz` (Currency-Arbiter, in `check:netz`) fährt die Stichprobe live nach,
  Statuswechsel/Fristverlängerung = ROT. (2) **Offline-Assertion** in `check:materialien`:
  `status==='laufend' && fristEnde < heute ⇒ rot` (gegen den echten heutigen Tag, nicht gegen das
  mit-alternde `stand`) — der belastbare Schutz, da `check:netz` nicht im Default-`gate` läuft.

## 4. Datenmodell + Andockung

Je Eintrag (`MaterialRegistereintrag`, behoerde `BUND`, doktyp `vernehmlassung`, status `nur-live-link`):
`titel`(+`titelFr`/`titelIt`), `quelleUrl`(cons-Portal), `stand`(Abfragedatum), `normKeys`(auto),
`vernehmlassung: { status, fristStart?, fristEnde?, projEli }`. `sha` (Drift-Token) über
Status+Frist+normKeys+Titel — **nicht** über `stand` (sonst Tages-Churn).

- **Ingest:** über den bestehenden Merge-Pfad `ALLE_MATERIALIEN = MATERIAL_REGISTER + BOTSCHAFTEN +
  VERNEHMLASSUNGEN` (Paket 2 hat den generierten-Materialien-Pfad + `ingestMaterialien`-Äquivalent
  schon gebaut → kein eigener Ingest nötig). Projektion in `register.json` byte-parität-gegated
  (`check:paritaet`).
- **UI (Norm-Kontext-Bus, Bridge B1):** Abschnitt **«Gesetzgebung in Arbeit»** in
  `KontextPanel.tsx` (`vernehmlassungenFuer`), laufende zuerst, «läuft bis {Frist}» prominent;
  DE/FR/IT; §8-Marker; Fehlerzustand ≠ Leer; Reichweiten-Hinweis. **Laufend-Badge im Reader-Kopf
  (`src/pages/gesetz-leser/parts.tsx`) bewusst NICHT gebaut** — Datei war in dieser Bau-Einheit
  TABU (Parallel-Session-Kollision, §12); nachzuziehen, wenn der gesetz-leser frei ist.
- **Übergangslösung bis E1:** Datei-Projektion (`register.json`). **Zukunfts-Senke E6b**
  (`FAHRPLAN-DATENHALTUNG.md §3`): Tabelle `materialien(…)` + additive Spalten
  `vern_status/frist_start/frist_ende/proj_eli`.

## 5. Pflegebedarf / Abnahme-Status

- **Pflegebedarf:** Status mutabel → regelmässig `npm run materialien:vernehmlassungen -- --datum=$(date +%F)`
  + `npm run materialien -- --datum=…` neu laufen (Netz-Tor + Offline-Assertion erzwingen Aktualität).
- **Abnahme:** Erstrecherche + adversariale Gegenprüfung (10.7.2026). Fachlich **nicht** durch David
  abgenommen (Zeitsperre bis 1.12.2026); alle Einträge tragen den «maschinell, fachlich nicht
  geprüft»-Marker (§8).
