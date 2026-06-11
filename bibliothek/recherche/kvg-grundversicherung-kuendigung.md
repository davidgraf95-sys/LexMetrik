# KVG-Grundversicherung: Kündigung/Versichererwechsel (Preset Maske 3)

**Erstellt:** 11.6.2026 · **Anlass:** Konkurrenz-Sichtung durchblick.nl, Entscheid David «KVG-Lücke schliessen» · **Status: ERSTRECHERCHE — fachliche Abnahme durch David ausstehend (CLAUDE.md §7/§8).**

**Zweck:** Bauspezifikation für das Preset «Krankenkasse (Grundversicherung)»
in der allgemeinen Vertrags-Kündigungsmaske (`src/lib/vorlagen/kuendigungAllgemein.ts`).
Fundort der Lücke: Konkurrenz-Sichtung durchblick.nl (11.6.2026, siehe
[durchblick-nl-sichtung.md](durchblick-nl-sichtung.md)) — deren Kündigungsrechner
führt «Krankenkasse Grundversicherung (30. November)», LexMetrik deckte bisher
nur die VVG-Zusatzversicherung ab.

## 1. Quelle + Stand (§7, empirisch am Filestore-HTML verifiziert 11.6.2026)

| Erlass | SR | ELI | Konsolidierung | Geprüfte Anker |
|---|---|---|---|---|
| KVG | 832.10 | cc/1995/1328_1328_1328 | **20260101** (neuste echte; 202602–202606 liefern nur die 9-kB-SPA-Shell) — Datei OHNE «-N»-Suffix (n=0) | art_7, art_62, art_64_a |
| KVV | 832.102 | cc/1995/3867_3867_3867 | **20260101** — Datei OHNE «-N»-Suffix (n=0) | art_94, art_99, art_100 |

Wortlaute zeichengenau gelesen (Auszüge unten); `verified: true` der Norm-Pills
bleibt bis zur fachlichen Abnahme durch David offen (§7).

## 2. Regeln deterministisch (Eingabe → Ausgabe)

**R1 — Ordentliche Kündigung (Art. 7 Abs. 1 KVG):**
Eingabe: keine besondere Versicherungsform → Kündigung mit **3-monatiger Frist
auf Ende eines Kalendersemesters** (30. Juni / 31. Dezember). Zugang beim
Versicherer somit bis 31. März bzw. 30. September.
Wortlaut: «Die versicherte Person kann unter Einhaltung einer dreimonatigen
Kündigungsfrist den Versicherer auf das Ende eines Kalendersemesters wechseln.»

**R2 — Kündigung auf Prämienmitteilung (Art. 7 Abs. 2 KVG):**
Eingabe: neue Prämie mitgeteilt → Kündigung mit **1-monatiger Frist auf das
Ende des Monats, der der Gültigkeit der neuen Prämie vorangeht**. Praxisfall
Prämiengültigkeit 1. Januar → Kündigung auf 31. Dezember, **Zugang bis
30. November**. Der Versicherer muss die neuen, vom BAG genehmigten Prämien
mindestens zwei Monate im Voraus mitteilen und auf das Wechselrecht hinweisen.

**R3 — Besondere Versicherungsformen (Art. 62 KVG i. V. m. KVV):**
Eingabe: wählbare Franchise (Art. 93 ff. KVV) ODER eingeschränkte Wahl der
Leistungserbringer/HMO (Art. 99 ff. KVV) → Wechsel zu einem anderen Versicherer
nur **auf das Ende eines Kalenderjahres**, unter Einhaltung der Fristen nach
Art. 7 Abs. 1 und 2 KVG.
Wortlaute (je Fassung AS 2024 697, in Kraft 1.1.2025): Art. 94 Abs. 2 KVV
(«Der Wechsel zu einer tieferen Franchise, in eine Bonusversicherung oder zu
einem anderen Versicherer ist unter Einhaltung der in Artikel 7 Absätze 1
und 2 KVG festgesetzten Kündigungsfristen auf das Ende eines Kalenderjahres
möglich.») · Art. 100 Abs. 3 KVV (sinngleich für eingeschränkte Wahl).
Vorbehalt: Wechsel während des Jahres nach Art. 7 Abs. 2–4 KVG bleibt möglich
(Art. 94 Abs. 3, Art. 100 Abs. 4 KVV) — die gewählte Franchise wird beim
neuen Versicherer behalten, sofern er die Form führt.

**R4 — Wechselsperre bei Ausständen (Art. 64a Abs. 6 KVG):**
Eingabe: ausstehende Prämien, Kostenbeteiligungen, Verzugszinse oder
Betreibungskosten → **kein Versichererwechsel**, bis vollständig bezahlt
(«In Abweichung von Artikel 7 kann die säumige versicherte Person den
Versicherer nicht wechseln, solange …»). Kinder: kein Wechsel bei Ausständen
für sie; wer NUR Ausstände für Kinder hat, darf selbst trotzdem wechseln.
Vorbehalten bleiben Art. 7 Abs. 3 und 4 KVG (Wohnort-/Stellenwechsel,
Bewilligungsentzug).

**R5 — Nahtloser Wechsel (Art. 7 Abs. 5 KVG):**
Das Versicherungsverhältnis endet beim bisherigen Versicherer **erst, wenn ihm
der neue Versicherer die Aufnahme ohne Unterbrechung des Versicherungsschutzes
mitgeteilt hat** (Versicherungspflicht kennt keine Lücke; unterlassene
Mitteilung → Schadenersatz durch den neuen Versicherer).

**R6 — Koppelungsverbot Zusatzversicherungen (Art. 7 Abs. 7/8 KVG):**
Der bisherige Versicherer darf beim Wechsel weder die Kündigung der bei ihm
laufenden Zusatzversicherungen (Art. 2 Abs. 2 KVAG) erzwingen noch diese
allein wegen des Grundversicherungs-Wechsels kündigen. Zusatzversicherungen
kündigen sich separat nach VVG (Preset «Versicherung (VVG)» der Maske).

## 3. Geltungsbereich und Ausnahmen

- Gilt für die obligatorische Krankenpflegeversicherung (OKP) nach KVG —
  NICHT für VVG-Zusatzversicherungen (eigenes Preset, Art. 35a VVG).
- Sonderfälle Art. 7 Abs. 3/4 KVG (Wohnortwechsel/Stellenwechsel,
  Bewilligungsentzug des Versicherers): Ende von Gesetzes wegen, kein
  Kündigungsschreiben dieser Art nötig — in der Maske nur als Hinweis,
  kein eigener Dokumentpfad.
- Die Maske berechnet KEINE konkreten Kalenderdaten (kein `Date.now()`, §2);
  sie nennt die gesetzliche Terminregel und übernimmt einen optionalen
  Wunschtermin der nutzenden Person unverändert.

## 4. Pflegebedarf

- KVV Art. 94/100 in der Fassung **AS 2024 697 (1.1.2025)** — bei künftigen
  KVV-Revisionen Wortlaut neu prüfen; kein datierter Parameter, darum kein
  Eintrag im Parameter-Verfallsregister (normale §7-Nachverifikation bei
  Re-Pin genügt).
- KVG-Konsolidierungen nach 20260101 beim nächsten Cache-Re-Pin prüfen
  (`scripts/fedlex-cache.sh`, Einträge kvg/kvv).

## 5. Abnahme-Status

**Erstrecherche** (11.6.2026, zeichengenau am Filestore-HTML; einfacher
Durchgang). Fachliche Abnahme durch David: **offen** — Norm-Pills bleiben
`verified: false`, Karte bleibt `entwurf`.
