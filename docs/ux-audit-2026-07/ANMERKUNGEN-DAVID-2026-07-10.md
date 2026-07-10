# Davids Anmerkungen zur Gesetzesdarstellung (Sammlung 10.7.2026)

Status: SAMMELN — Bau erst nach Davids ausdrücklichem Go, dann als Opus-Einheit(en).
Recherche-/Plan-Heimat: `FAHRPLAN-GESETZESDARSTELLUNG-V2.md` (Spec-Heimat, alle
Massnahmen/Einheiten/Sequenzen dort). Einordnung als A19–A25 in
`FAHRPLAN-GESETZES-UX.md §10`.

## Original-Wortlaut David (10.7.2026, wörtlich, nichts geglättet)

«ich will das du nochmals mit ultracode die gesetzesdarstellung anschaust und einen
plan für bessere und nützlichere darstellung erarbeitest. einbau erst mit meinem go.
jetzt nur recherche. eine auflistung von beispielhaften problemem ist:
https://lexmetrik.vercel.app/gesetze/bund/VZG dort sind fussnoten nicht verklinkt im
text. dann will ich das der kopf des gesetzes nützlicher wird und fussnoten anwahl etc
dort erscheint. bei bundesgerichtsentscheiden die verlinkt sind soll ebenfalls abwahl
möglich sein in rubrik ansicht. mit möglichkeit auswahl wie lange zurück bge angebeben
werde sollen ausserdem funktioniert das mit der liniengliederung prakitsch nicht.
präambeln haben auch keine verlinkten fussnoten. gerne auch noch mit mehr farben usw
arbeiten.. ich will einfach dass du die gesetzesdarstellung noch nützlicher fehlerfreier
und so machst.»

## Nachtrag-Entscheide David (gleicher Tag, Chat — verbindlich)

Diese vier Entscheide sind im selben Chat auf die Rückfragen/Empfehlungen der
Recherche gefallen und gelten als David-Entscheide 10.7.2026:

1. **Linien-Default-Umkehr: JA** — die tiefen Kodifikationen (ZGB/OR) erhalten im
   Auto-Default ihre EINE Gliederungslinie wieder (Umkehr der #161-Politik, die den
   Guide auf strukturTiefe ≥3 ganz ausschaltete). «deine Empfehlung» = JA.
   → Einheit A24 (L-3).
2. **Farbe nur Referenzschicht** — mehr Farbe ausschliesslich auf der Referenz-/
   Verzahnungsschicht (Chips/Badges/Kopf); der Normtext-Körper bleibt farbfrei.
   Konsequenz: Ton-Bänder im Lesefluss (L-4) ENTFALLEN.
   → Einheit A25 (C-1/C-2/C-3), Doktrin §4b.
3. **BGE auch mehr als 5 sichtbar** — die Sichtbarkeits-Kappung `LEITFAELLE_SICHTBAR`
   von 5 auf 10 anheben (Rest weiter hinter «+n weitere»). «auch mehr als fünf».
   → Einheit A23 (B-1/B-2).
4. **Wortgenaue Marker (FN-5/M14): später** — die wortgenaue Inline-Positionierung
   der Fussnoten-Marker bleibt deferiert (hinter QS-PERF/U-POSITION, separates
   David-Go vor Bau). Bis dahin steht der Marker am Absatz-/Item-Ende (bewusste
   Rest-Ungenauigkeit gegenüber Fedlex, auch bei OR/ZGB — gegenüber David
   ausgewiesen).

## Zuordnung der beispielhaften Probleme → Massnahmen (Detail in V2)

- **VZG-Fussnoten nicht verklinkt im Text** → FN-1 (+Drop-Fix `disp_*`) = A19; Wurzel
  = Alt-Definition-Form ohne `#fnbck`-Back-Links (~922 Fussnoten mit `nr=''`).
- **Kopf nützlicher + Fussnoten-Anwahl** → K-1/K-2 = A22 (im koordinierten Kopf-PR
  mit U-PDF).
- **BGE-Abwahl in Rubrik-Ansicht + «wie lange zurück»-Filter** → B-1/B-2 = A23
  (inkl. Kappung 5→10).
- **Liniengliederung «funktioniert praktisch nicht»** → L-1/L-2/L-3 = A24
  (Einzug-Cap, Guide-Kontrast, Auto-Default-Umkehr; L-4 entfällt per Entscheid 2).
- **Präambel-Fussnoten unverlinkt** → FN-2 (Extraktor) + FN-3 (Präambel-Marker,
  nach U-VERWEIS) = A20.
- **Mehr Farben** → C-1/C-2/C-3 = A25 (Referenzschicht, Normtext-Körper farbfrei).
- **Fehlerfreier/nützlicher (Querschnitt)** → FN-4 (Absatz-Zuordnung) = A21;
  Fedlex-Pin/Alias-Wurzel als eigener Slot in der offenen Fedlex-P1-a/b-Einheit.

## (weitere Anmerkungen folgen)
