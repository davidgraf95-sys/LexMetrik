# FAHRPLAN — Prozesskosten-Cockpit (Vertiefung & Ausbau)

**Anlass:** Direktive David (14.6.2026) — den Prozesskostenrechner (P1-Hauptmoat,
bereits live auf lexmetrik.vercel.app) „insgesamt noch viel vertiefen und
umfangreicher gestalten". Ziel: das umfassendste, amtlich belegte und
deterministische Prozesskosten-Werkzeug für die Schweizer Kanzlei — kein
Tarif-Lookup, sondern ein **Kostenrisiko-Cockpit** über die volle Matrix.

**Disziplin:** jede Etappe §7 (amtlich verifiziert, mit Link) · §2/§8 (Ermessen
= Spanne + Kriterien, kein erfundener Punktwert) · §6 (Gate grün, golden) · §9
(Bug-Check + Deploy nur auf Davids frisches Ja). Engine bleibt dünner Lader über
`lib/tarif/staffel` + kantonaler Datenschicht; keine Rechtslogik in der UI (§3).

## Die Zielmatrix
**Kanton × Verfahrensart × Spruchkörper/Instanz × Materie → Gerichtskosten +
Parteientschädigung + Kostenrisiko**, je mit amtlichem Tarif-Link, Stand,
Ermessenskriterien und Norm (ZPO + kantonal).

- **Verfahrensart:** Schlichtung · vereinfacht · ordentlich · summarisch
- **Spruchkörper/Instanz:** erstinstanzlich (Einzel-/Kollegialgericht) ·
  **Handelsgericht** (ZH/BE/AG/SG = einzige Instanz → BGer) · weitere
  einzige-Instanz/Direktklage (Art. 5/6/8 ZPO) · **Rechtsmittel** (Berufung/
  Beschwerde, obere kantonale Instanz) · Bundesgericht (Verknüpfung BGG-Rechner)
- **Materie:** für Kostenlosigkeit (Art. 113/114 ZPO) + Sondertarife

## Etappen

**I1 — Basis (FERTIG, live):** erstinstanzliche Entscheidgebühr + Grund-
Parteientschädigung aller 26 Kantone (amtlich doppelt verifiziert), Art. 113/114-
Kostenlos-Vorschalter, Schlichtungspauschale ehrlich offengelegt, interkantonale
Vergleichstabelle. Engine `lib/prozesskosten.ts`, Rechner `/rechner/prozesskosten`.

**I2 — Verfahrensart & Instanz (Recherche läuft, `wbqdyap3x`):**
- Schlichtungsgebühren je Kanton (Art. 95 II lit. a; oft Bruchteil der GK).
- Reduktionsfaktoren vereinfacht/summarisch (GK + Parteientschädigung).
- Rechtsmittelgebühren obere kantonale Instanz (Berufung/Beschwerde).
Modelliert als **Modifikatoren** auf den verifizierten Basistarif (Faktor-Spanne
bei Ermessen). Engine: `verfahren` + `instanz` als Eingaben.

**I3 — Handelsgericht & besondere Konstellationen:** ZH/BE/AG/SG Handelsgericht
(einzige Instanz, Tarif-Spezifika gezielt verifiziert, Instanzweg → BGer);
Art. 5/6/8-ZPO-Konstellationen, wo kostenrelevant.

**I4 — Ermessenskriterien:** je Tarif die Bemessungskriterien der kantonalen
Norm (z. B. § 2 GGR BS: Bedeutung/Zeitaufwand/Komplexität/Streitwert) als
`kriterien`-Feld; Anzeige immer dann, wenn das Ergebnis eine Spanne ist (§8).

**I5 — Kostenrisiko (Art. 106–109 ZPO):** Verteilung nach Obsiegensquote →
„Wenn Sie zu X % obsiegen": eigene + zugesprochene/zu tragende Gerichtskosten
und Parteientschädigung. Macht aus dem Tariflook-up den eigentlichen
Kostenrisiko-Rechner. Rein bundesrechtlich/deterministisch (vor §7-Verifikation).

**I6 — Vollständigkeit der Kostenposten (Art. 95/98):** Kostenvorschuss (½ GK,
Art. 98), MwSt auf Parteientschädigung (Hinweis/Schalter), Auslagen/Beweis-/
Übersetzungs-/Kindesvertretungskosten (Art. 95 II c–e, als Hinweis, nicht
beziffert), unentgeltliche Rechtspflege (Art. 117 ff., Hinweis).

**I7 — Instanz-Akkumulation:** Gesamt-Kostenrisiko über den Instanzenzug
(Schlichtung → 1. Instanz → Rechtsmittel → BGer), summiert.

**I8 — Mandatstauglichkeit:** PDF-Export der Kostenschätzung mit Aktenzeichen/
Parteien (mandatstauglicher Output, §G3); Permalink (schon vorhanden) erweitern.

**I9 — Weitere Tarif-Assets (Burggraben):** Notariats-/Grundbuchgebühren,
GebV-SchKG-Verknüpfung (bestehender Betreibungskosten-Rechner), Schlichtungs-
kosten-Sonderfälle — wo deterministisch und praxisrelevant.

## Reihenfolge
I2 (sobald Recherche zurück) → I4 (Kriterien, mit I2) → I3 (Handelsgericht) →
I5 (Kostenrisiko, eigene §7-Grundlage Art. 106 ff.) → I6 → I7 → I8 → I9.
Je Etappe: Gate grün, §9-Bug-Check, Deploy auf frisches Ja. Nichts trägt
`geprüft` bis zu Davids Wort-für-Wort-Abnahme (§7/§8).
