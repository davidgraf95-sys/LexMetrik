# Änderungshistorie / Amtliche Sammlung — Fedlex-Portfolio Paket 5 (W2·6-REV)

**Ausführungsbeleg §11 · 10.7.2026 · Opus-Bau-Session · Branch `feat/fedlex-p5-historie`.**
**Stand:** 10.7.2026. **Status:** ZWEIFACH GEPRÜFT (Erstrecherche + adversariale
Gegenprüfung, §5); fachliche Abnahme durch David offen.

Je Bund-Volltext-Erlass eine «Änderungen / Revisionen»-Timeline: welche AS/RO-Änderungs-
erlasse (`eli/oc`) haben das Gesetz wann geändert. Schwester zu Paket 2 (Botschaften =
Genese-*Absicht*, AS-Erlass = *tatsächliche* Änderung); beide im selben Norm-Kontext-Bus
(`KontextPanel`, Bridge B1) — kein Silo.

## 1. Quelle + Stand

- **Endpunkt:** Fedlex-SPARQL `https://fedlex.data.admin.ch/sparqlendpoint` (POST,
  `application/x-www-form-urlencoded`, `Accept: application/sparql-results+json`), über den
  geteilten `scripts/fedlex-sparql.ts` (VALUES-Batching, kein UNION — §0c-Fallen).
- **Abgerufen:** 2026-07-10. Rohantworten persistiert je Erlass in
  `bibliothek/normtext/revisionen-raw/<KEY>.json` (`{sr, korpusStand, bBindings, aStaende}`) —
  Parser-Bug ⇒ Re-Parse aus Raw, nie Re-Crawl (§11). Determinismus-Tor `check:revisionen`
  baut das Sidecar aus Raw neu und vergleicht byte-gleich.
- **Grundmenge:** 218 Bund-Volltext-Erlasse (`register.json`, `ebene==bund && status==snapshot`,
  alle mit `sr`).

### POC-Befund (Finding 6, VOR Aufwand-Freigabe erhoben, korpusweit)
Die Spec-OPTIONALs `jolux:historicalId` (RO-Fundstelle) und `jolux:botschaftDate` liefern am
oc-Knoten **NICHTS** (0/7 an DSG, korpusweit leer — live verifiziert). Deshalb bewusst abweichend:
- **RO/AS-Fundstelle** deterministisch aus der oc-URI abgeleitet: `eli/oc/<jahr>/<num>` →
  «AS <jahr> <num>» (gegen `sequenceInTheYearOfPublication`+`publicationDate` gegengeprüft:
  deckungsgleich; Alt-AS-Band-Nummerierung `oc/63/837…` → «AS 63 837»). Füllrate **100 %** (3107/3108).
- **Botschafts-Join** über die von Paket 2 persistierten `ocUris` (`revision.ocUri ∈
  botschaft.ocUris → botschaftKey`), NICHT über `botschaftDate`.

**Korpus-Füllraten (3108 Änderungs-Einträge):** dateDocument 100 % · titelDe/Fr/It je 100 % ·
roFundstelle 100 % (−1 Einzelfall) · botschaftKey 15,3 % (477) · nichtKonsolidiert 1,1 % (35).
Erlasse mit ≥1 Änderung 218/218 · Sammelerlass-Marker 1942 · künftig-in-Kraft 88.
**Determinismus:** zwei Live-Läufe byte-identisch.

## 2. Regel (deterministisch, Eingabe → Ausgabe)

- **Pfad (b) — Timeline (die «wann wurde was geändert»-Liste):** oc-Erlasse über die
  SR-Taxonomie: `?tax skos:notation "<SR>"^^<…id-systematique>` (TYPISIERT, sonst Timeout);
  `?oc jolux:classifiedByTaxonomyEntry ?tax ; jolux:legalResourceFamilyType <…resource-family/oc>
  ; jolux:dateEntryInForce ?dateForce`. `resource-family/oc` filtert die `cc`-Abstract-Dubletten;
  Sprachen (isRealizedBy DEU/FRA/ITA) kollabieren über die Gruppierung nach `?oc`; je oc das
  **früheste** `dateEntryInForce` (deterministisch, reihenfolge-unabhängig).
- **`nichtKonsolidiert`** = true gdw. `dateEntryInForce > Korpus-Stand` (Pin-`kons` aus
  `scripts/fedlex-cache.sh`): in Kraft, aber noch nicht in den geltenden Snapshot konsolidiert
  (Finding 4, user-sichtbar — löst den Widerspruch «geändert am X neben Vor-Fassungs-Text»).
- **Pfad (a) — Sammelerlass-Cross-Check (§8-Ehrlichkeit):** Geltungsstände des **gepinnten**
  cc-Abstracts (`?cons jolux:isMemberOf <cc-abstract> ; jolux:dateApplicability ?date`) ohne
  passenden (b)-Erlass **ab 2000-01-01** → synthetischer Eintrag `art:'sammelerlass-marker'`
  «Änderung über einen Sammelerlass — siehe amtliche Sammlung», nie stille Lücke.
- **Botschafts-Join:** `botschaftKey` nur bei belegtem `ocUri`-Match, sonst weg (kein toter Link).

## 3. Geltungsbereich + Ausnahmen (ehrliche Grenzen, §8)

- **Mantel-/Sammelerlass-Lücke (strukturell):** Pfad (b) listet nur Erlasse, die **primär**
  unter dieser SR klassifiziert sind. Änderungen über Mantelerlasse anderer SR erscheinen NICHT
  als eigener (b)-Erlass — sie werden über den Pfad-(a)-Cross-Check als Marker sichtbar (nur als
  Datum, ohne Erlass-Identität; live geprüft: es gibt keine saubere `amends`-Kante in den Abstract).
- **Reichweite ~ab 2000:** Sammelerlass-Marker nur ab `MARKER_CUTOFF=2000-01-01` (dokumentierte
  Verlässlichkeits-Schwelle; frühere Konsolidierungsstände = Rauschen ohne Erlass-Identität). Die
  **primären** Änderungs-Erlasse (art='aenderung') reichen weiter zurück (DSG bis `oc/1993`).
- **Sammelerlass-Marker gegen den GEPINNTEN Abstract:** der Cross-Check sieht Geltungsstände nur
  im Leben des aktuellen Abstracts (bei Totalrevision der neue Abstract) — das deckt genau die
  user-relevanten *jüngeren* Sammelerlass-Änderungen ab; tiefe Historie trägt Pfad (b).
- **Quell-Quirk (verbatim erhalten, §1):** einzelne oc-Titel-Realisierungen haben in der amtlichen
  Quelle Kodierungsverluste (z. B. `œ`→∅ in einem FR-DSG-Titel; live gegen die Quelle bestätigt) —
  wird **nicht** fabriziert, sondern wie geliefert gespeichert.

## 4. Pflegebedarf

- **Drift-Tor `check:revisionen-netz`** (in `check:netz`): Stichprobe (DSG/MWSTG/OR/DBG) Pfad (b) +
  Cross-Check (a) live nachfahren, Sidecar-`sha` vs. committet — Drift = rot.
- **Übergangslösung bis E1:** der File-Sidecar ist Übergangslösung; Zielsenke ist ab E1 die Tabelle
  `erlass_fassungen` (FAHRPLAN-DATENHALTUNG §3; §5 «nie zwei Wahrheiten»). Beim E1-Flip wird nur der
  Writer umgehängt (`erlass_fassungen`), der Sidecar wird Projektion. Im Generator markiert.
- **Regenerieren:** `npm run normtext:revisionen -- --datum=$(date +%F)` (`--nur=DSG,OR` gezielt).

## 5. Abnahme-Status

Erstrecherche + **unabhängige adversariale Gegenprüfung** (Opus, frischer Kontext, gegen den
amtlichen Fedlex-SPARQL-Endpunkt + AS-Seiten): Verdikt **bestanden** (Stichproben, DSG-Referenzfall
Alt+Neu über die Totalrevision, Botschafts-Joins, Negativfall, Sammelerlass-Ehrlichkeit).
**Fachliche Abnahme durch David offen** (§8: maschinell zugeordnet, massgeblich bleibt die amtliche
Sammlung; im UI offengelegt).
