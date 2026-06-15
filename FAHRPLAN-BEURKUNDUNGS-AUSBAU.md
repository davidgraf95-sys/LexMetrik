# FAHRPLAN — Beurkundungskosten-Ausbau (Notariatsrechner erweitern)

**Anlass / Direktive David (15.6.2026):** «Der Notariatsrechner soll noch extrem
ausgebaut werden auf Testament, Dienstbarkeiten, Gründungen, Stiftungsurkunde,
Bürgschaften und alles weitere, das man beurkunden lässt.» **David will, dass
das eine NEUE Session macht** — dieser Fahrplan ist die Arbeitsanweisung dafür.

**Ausgangslage:** Der Rechner `/rechner/notariat-grundbuch` (Engine
`src/lib/notariatGrundbuch.ts`, Daten `src/data/tarif/notariat-grundbuch.ts`,
Form `NotariatGrundbuchForm.tsx`) deckt heute NUR den **Grundstückkauf** ab
(Beurkundung + Grundbuch + Grundpfand + Handänderungssteuer, 26 Kt, doppelt
verifiziert). Ziel: Ausbau zu einem **allgemeinen Beurkundungskosten-Rechner**
über alle öffentlich beurkundbaren Rechtsgeschäfte.

## 1. Geschäftsart-Dimension (neuer Hauptschalter)

Mindestens diese Geschäftsarten, je mit Bemessungsbasis (Geschäftswert) und
Tarif-Charakter:

| Geschäftsart | Bemessungswert | Charakter |
|---|---|---|
| Grundstückkauf (bestehend) | Kaufpreis | wertbasiert (vorhanden) |
| Dienstbarkeit / Grunddienstbarkeit / Nutzniessung / Wohnrecht | Wert des Rechts (kapitalisiert) | wertbasiert |
| Bürgschaft | Bürgschaftssumme | wertbasiert |
| Schuldanerkennung / Darlehensvertrag öff. | Forderungs-/Darlehenssumme | wertbasiert |
| Schenkung (beurkundungspflichtig) | Zuwendungswert | wertbasiert |
| Erbvertrag | betroffenes Vermögen / Nachlasswert | wertbasiert (teils Sondersatz) |
| Ehevertrag / Vermögensvertrag | betroffenes Vermögen | wertbasiert (teils Sondersatz) |
| Testament (öffentliche letztwillige Verfügung) | Nachlasswert ODER fix/aufwand | **gemischt** (viele Kt fix/aufwand) |
| AG-Gründung | Aktienkapital (+ Agio) | wertbasiert (Teil-Dossier vorhanden: `notariatstarife-gruendung-kantone.md`) |
| GmbH-Gründung | Stammkapital | wertbasiert |
| Stiftungsurkunde | Stiftungsvermögen | wertbasiert |
| Verein/Statuten (soweit beurkundet) | — | fix/aufwand |
| Vorsorgeauftrag (öffentliche Beurkundung) | — | fix/aufwand |
| Vollmacht / Beglaubigung | — | fix/aufwand |
| «alles weitere»: Kapitalerhöhung, Fusion/Spaltung, Sacheinlage, Eintragung Eigentumsvorbehalt … | je Vorgang | wertbasiert/aufwand |

**Wichtig fachlich:** In den meisten Kantonen ist der Notariatstarif ein
GENEREller wertbasierter Promille-/Staffeltarif auf den «Geschäftswert»; die
Geschäftsart bestimmt v. a., WAS der Geschäftswert ist. Einzelne Geschäfte haben
Sondersätze/Minima (Testament, Erbvertrag, Ehevertrag) oder sind nicht
vermögensrechtlich (Vollmacht, Vorsorgeauftrag → fix/aufwand). DAS ist je Kanton
zu verifizieren (nicht pauschal annehmen).

## 2. Architektur (additiv, §4/§10)

- **Datenschicht erweitern:** je Kanton + je Geschäftsart die einschlägige
  Tarif-Regel (Artikel/§ im kantonalen Notariatstarif) — wo ein genereller
  Wert-Promille gilt, diesen wiederverwenden; wo Sondersätze/Fixgebühren/Aufwand
  gelten, eigene Regel (`promille`/`staffel_*`/`rahmen`/`fix`/`formel_extern`).
  Struktur z. B. `BEURKUNDUNG[geschaeftsart][kanton]` oder eine Matrix mit
  Verweis auf den generellen Wert-Tarif als Default.
- **Engine** `notariatGrundbuch.ts` (ggf. umbenennen/erweitern zu
  `beurkundungskosten.ts`): Eingabe `{ geschaeftsart, kanton, geschaeftswertCHF, … }`;
  reine deterministische Auswertung über `tarif/staffel`. §2/§8: Sondersätze als
  Spanne, Aufwand-/Verhandlungstarife als `rahmen`/«nach Vereinbarung».
- **UI:** Geschäftsart-Vorschalter (gruppiert: Immobilien · Familie & Nachlass ·
  Gesellschaft/Stiftung · Sicherungsgeschäfte · Übriges), Wert-Feld mit
  art-spezifischem Label/Hinweis; interkantonaler Vergleich, PDF, Permalink wie
  bisher. Grundstückkauf bleibt als eine Geschäftsart erhalten (keine Regression).

## 3. Deep Research (je Wert amtliche Quelle — Daueranweisung David)

Pro Kanton (26) und Geschäftsart die kantonale Notariatstarif-Bestimmung
erheben: Erlass + Artikel/§ + Regel (Promille/Staffel/Fix/Aufwand) + Min/Max +
Stand + amtliche URL. Vorgehen wie beim Grundstückkauf: **Cluster-Fan-out**
(5 Cluster) + **unabhängiger Doppelcheck-Pass** am Originaltext + adversarialer
Engine-Review. Ergebnis in `bibliothek/kosten/beurkundungstarife-kantone.md`
(+ INDEX). Bestehendes Teil-Dossier `notariatstarife-gruendung-kantone.md`
(AG-Gründung, 6 Kt) integrieren/erweitern.

## 4. Verifikation & Disziplin

- §2 Determinismus · §8 Ehrlichkeit (Sondersätze = Spanne, Aufwand = «nach
  Vereinbarung», freies Notariat zzgl. MwSt) · §7 amtlich verifizieren, nichts
  `geprüft` ohne David · §6 Gate grün + golden byte-gleich je Etappe.
- **Doppelt verifizieren** (Recherche-Pass + unabhängiger Doppelcheck), wie David
  durchgehend verlangt.
- PDF: kantonale Erlasse/Verordnungen verlinken (Mechanismus `Normverweis.url`
  ist seit 15.6.2026 vorhanden — quelle.quelleUrl durchreichen). Gilt für alle.
- §9: Push/Deploy nur auf Davids frisches Ja.

## 5. Etappen (Vorschlag für die neue Session)

- **B-1:** Geschäftsart-Taxonomie + Bemessungsbasis je Art festlegen (Brainstorm
  mit David nicht nötig — Liste oben; bei Unklarheit Fall-für-Fall vorlegen).
- **B-2:** Deep-Research-Fan-out (26 Kt × Geschäftsarten) → Dossier.
- **B-3:** Datenschicht-Matrix codieren (amtliche Quelle je Wert).
- **B-4:** Engine + UI (Geschäftsart-Dimension), Grundstückkauf migrieren ohne Regression.
- **B-5:** Doppelcheck + adversarialer Review + Sweep + Gate.
- **B-6:** STRUKTUR/INDEX nachführen; Push/Deploy auf Davids Ja.

**Startpunkt für die neue Session:** dieses Dokument + der bestehende
Grundstückkauf-Rechner als Vorlage; Daueranweisungen (amtliche Quelle je Wert,
doppelt verifizieren) gelten.
