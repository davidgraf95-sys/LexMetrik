# Arbeitsvertrag — Untertypen & Detailgrade (P1 Vertrags-Varianten)

**Stand:** 14.6.2026 · OR (SR 220), Konsolidierung 20260101, Fedlex-Cache
verbatim. **Status:** Erstrecherche, am Cache verifiziert (Anker 344–354
27/27 OK); fachliche Abnahme durch David ausstehend (bewusst zurückgestellt,
Ausbau-Direktive 14.6.2026 — Bau auf `entwurf`-Niveau).

**Zweck:** Norm-verifizierte Grundlage für den AV-Vollausbau (FAHRPLAN-
VERTRAGS-VARIANTEN P1): Detailgrad einfach/standard/experte + regime-treue
Untertypen Einzel / Kader / Lehrvertrag / Handelsreisender / Heimarbeit.

**Quelle + Stand (§11 Ziff. 1):** OR (SR 220), konsolidierte Fassung
20260101, Fedlex-Filestore-HTML (ELI `cc/27/317_321_377`, html-4), abgerufen
14.6.2026; Anker-Inventar `art_344`…`art_354` vollständig vorhanden
(Cache-Prüfung 27/27 OK). Die Wortlaute unten sind aus diesem Cache verbatim
extrahiert. ArG (SR 822.11) Art. 3 lit. d für die Kader-Ausnahme.

**Abnahme-Status (§11 Ziff. 5):** Erstrecherche, am Cache verifiziert; fachliche
Abnahme durch David ausstehend (bewusst zurückgestellt, vgl. Ausbau-Direktive
14.6.2026 — Bau auf `entwurf`-Niveau).

---

## 1 · Regime-Architektur (Entscheid §4)

Die fünf Untertypen sind NICHT ein Schema mit Sammel-Weiche, sondern:

- **Einzel + Kader** = dasselbe OR-Regime (Art. 319 ff. = Einzelarbeitsvertrag);
  Kader ist eine inhaltliche Ausbau-Variante (mehr Module), kein eigenes
  Regime → bleibt im Schema `arbeitsvertrag.ts`, gesteuert über `untertyp` +
  `detailgrad` (includeIf-gegatete Zusatz-Bausteine). Golden-neutral für
  `einzel`+`standard`.
- **Lehrvertrag (344–346a)**, **Handelsreisendenvertrag (347–350a)**,
  **Heimarbeitsvertrag (351–354)** = je ein **distinktes Sonderregime** der
  «besonderen Einzelarbeitsverträge». Auf sie sind die allgemeinen
  Bestimmungen (319 ff.) nur subsidiär anwendbar; sie haben eigene zwingende
  Pflichtinhalte, Form- und Kündigungsregeln. Darum **eigene Schemas**
  (`lehrvertrag.ts`, `handelsreisendenvertrag.ts`, `heimarbeitsvertrag.ts`),
  je mit eigener Antworten-Struktur, Gates und Tests. Die AV-Seite dispatcht
  über `untertyp` auf das richtige Schema. EINE Katalog-Karte bleibt.

Begründung: §1 (lieber Duplikat als kollabierende Abstraktion) + §4 (Regimes
einzeln testbar, keine Querwirkung). Geteilt wird nur fachneutrale
Infrastruktur (engine, format, datum/CHF, Detailgrad-Mechanik, VariantenKopf).

---

## 2 · Lehrvertrag — Art. 344–346a OR (Sonderregime)

**Begriff (344):** Arbeitgeber bildet die lernende Person für eine bestimmte
Berufstätigkeit fachgemäss; lernende Person leistet dafür Arbeit.

**Form & Pflichtinhalt (344a) — ZWINGEND:**
- Abs. 1: **Schriftform = Gültigkeitsvoraussetzung** → `ausgabeArt` muss die
  Unterschrift erzwingen; rein mündlich nichtig. (Anders als beim formfreien
  Einzelvertrag.)
- Abs. 2: Der Vertrag MUSS regeln: **Art und Dauer der beruflichen Bildung,
  Lohn, Probezeit, Arbeitszeit, Ferien** (fünf Pflichtpunkte = Pflicht-Felder
  + Pflicht-Bausteine, sonst Blocker).
- Abs. 3: **Probezeit 1–3 Monate**; fehlt eine Abrede → **3 Monate von
  Gesetzes wegen**. (Abweichend vom Einzelvertrag, wo 1 Monat Default ist.)
- Abs. 4: Verlängerung der Probezeit ausnahmsweise bis 6 Monate nur durch
  Abrede UND Zustimmung der kantonalen Behörde → Gate-Hinweis, kein
  Selbstläufer.
- Abs. 6: **Abreden, die die freie Berufswahl nach der Lehre beeinträchtigen,
  sind nichtig** → KEIN nachvertragliches Konkurrenzverbot beim Lehrvertrag
  (Blocker/Ausschluss).

**Pflichten lernende Person / gesetzl. Vertretung (345):** Lehrziel anstreben;
gesetzliche Vertretung unterstützt. → bei Minderjährigkeit Unterschrift der
gesetzlichen Vertretung vorsehen.

**Pflichten Arbeitgeber (345a) — ZWINGEND:**
- Abs. 1: Bildung unter Verantwortung einer geeigneten **Fachkraft**.
- Abs. 2: **Zeit für Berufsfachschule, überbetriebliche Kurse, Prüfungen ohne
  Lohnabzug** freigeben.
- Abs. 3: **bis zum vollendeten 20. Altersjahr ≥ 5 Wochen Ferien pro
  Lehrjahr** (deckt sich mit 329a für Jüngere, hier explizit pro Lehrjahr).
- Abs. 4: berufsfremde / Akkordarbeiten nur soweit berufsbezogen.

**Beendigung (346):**
- Abs. 1: **während Probezeit jederzeit, Frist 7 Tage.**
- Abs. 2: fristlose Auflösung aus wichtigem Grund (Art. 337) mit den
  benannten Fällen (fehlende Eignung Fachkraft; fehlende Anlagen/Gefährdung
  der lernenden Person — vorgängige Anhörung!; Bildung nicht zu Ende führbar).
- Nach der Probezeit: KEINE ordentliche Kündigung wie 335c — das Lehrverhältnis
  läuft auf die vereinbarte Dauer (befristet) und endet mit ihr; vorzeitige
  Auflösung nur fristlos (337) oder einvernehmlich. → Kündigungs-Baustein
  regime-eigen, NICHT der 335c-Baustein.

**Zeugnis (346a):** nach der Lehre Pflicht-Zeugnis (Berufstätigkeit + Dauer;
auf Verlangen auch Fähigkeiten/Leistungen/Verhalten).

**Bezug Berufsbildung:** BBG (SR 412.10) regelt die öffentlich-rechtliche
Seite (Lehrvertrag-Genehmigung durch kantonale Behörde, Art. 14 BBG) → als
Hinweis offenlegen (Genehmigungspflicht), nicht als OR-Norm zitieren.

---

## 3 · Handelsreisendenvertrag — Art. 347–350a OR (Sonderregime)

**Begriff (347):** Reisende(r) vermittelt/schliesst gegen Lohn Geschäfte
**ausserhalb der Geschäftsräume** auf Rechnung des Geschäftsinhabers ab.
Abs. 2: NICHT Handelsreisender, wer nicht vorwiegend reist, nur gelegentlich
tätig ist oder auf eigene Rechnung abschliesst (Abgrenzungs-Hinweis).

**Form & Pflichtinhalt (347a):**
- Abs. 1: **schriftlicher Vertrag** «soll» Bestimmungen enthalten über: a.
  Dauer/Beendigung; b. **Vollmachten** des Reisenden; c. **Entgelt +
  Auslagenersatz**; d. anwendbares Recht/Gerichtsstand, wenn eine Partei
  Wohnsitz im Ausland hat. (Soll-Vorschrift: fehlt der schriftliche Vertrag,
  greifen Gesetz + übliche Bedingungen — also Soll-Form, nicht
  Gültigkeitsform wie beim Lehrvertrag.)

**Pflichten Reisende(r) (348):** Kundschaft wie vorgeschrieben besuchen; ohne
schriftliche Bewilligung kein Eigen-/Drittgeschäft (Konkurrenzunterlassung
während des Verhältnisses); Preise/Bedingungen einhalten; **Bericht- und
Übermittlungspflicht**.

**Delkredere (348a) — zwingende Schranke:**
- Abs. 1: Abreden über Einstehen für Kundenzahlung **grundsätzlich nichtig**.
- Abs. 2: bei Privatkundengeschäft schriftlich Haftung **höchstens ¼ des
  Schadens je Geschäft** zulässig, NUR gegen angemessene **Delkredere-
  Provision**.

**Vollmacht (348b):** Default = nur **Vermittlung**; Abschlussvollmacht nur bei
schriftlicher Abrede; selbst dann ohne Sondervollmacht **keine Inkasso-/
Stundungsbefugnis**.

**Gebiet/Kundenkreis & Provision (349, 349a–b):**
- 349: zugewiesenes Gebiet/Kundenkreis = grundsätzlich Ausschliesslichkeit
  (Arbeitgeber darf dort dennoch selbst abschliessen); einseitige Änderung des
  Gebiets nur bei begründetem Anlass, Entschädigung vorbehalten.
- 349a: **Lohn = festes Gehalt mit/ohne Provision**; reine/überwiegende
  Provision nur schriftlich UND wenn sie ein **angemessenes Entgelt** ergibt;
  Probezeit (max. 2 Monate) Lohn frei vereinbar.
- 349b: ausschliessliches Gebiet → Provision auf ALLEN dort abgeschlossenen
  Geschäften (auch denen des Arbeitgebers); sonst nur auf eigenen.

**Lohn bei Verhinderung (349c):** unverschuldete Reiseverhinderung mit
Lohnanspruch → festes Gehalt + angemessene Provisions-Ausfallentschädigung;
Sonderregeln bei Provision < ⅕ des Lohnes.

**Auslagenersatz (349d) — zwingend:** mehrere Arbeitgeber → Kopfteil; **Abrede,
Auslagen seien im Gehalt/in der Provision eingeschlossen, ist nichtig.**

**Retentionsrecht (349e):** an beweglichen Sachen, Wertpapieren, Inkasso-
Zahlungen zur Sicherung fälliger (bei Zahlungsunfähigkeit auch nicht fälliger)
Lohnforderungen; NICHT an Fahrausweisen, Preistarifen, Kundenverzeichnissen.

**Saison-Kündigung (350):** Provision ≥ ⅕ des Lohnes UND erhebliche
saisonale Schwankung → Kündigung während der Saison nur auf Ende des **zweiten
auf die Kündigung folgenden Monats** (beidseits).

**Beendigung (350a):** Provision auf allen bis zur Beendigung
abgeschlossenen/vermittelten Geschäften + eingehenden Bestellungen; Rückgabe
der Unterlagen (Muster, Tarife, Kundenverzeichnisse), Retentionsrecht
vorbehalten.

---

## 4 · Heimarbeitsvertrag — Art. 351–354 OR (Sonderregime)

**Begriff (351):** Heimarbeitnehmer führt in seiner Wohnung / einem selbst
bestimmten Arbeitsraum allein oder mit Familienangehörigen **Arbeiten im Lohn**
für den Arbeitgeber aus. (Begleitend: Heimarbeitsgesetz HArG SR 822.31 —
öffentlich-rechtlich, als Hinweis.)

**Bekanntgabe vor Arbeitsausgabe (351a) — Form:** vor jeder Arbeitsausgabe die
erheblichen Bedingungen bekanntgeben, **schriftlich** Material-Entschädigung
und **Lohn**; fehlt die schriftliche Angabe → übliche Bedingungen.

**Pflichten Heimarbeitnehmer (352, 352a):** rechtzeitig beginnen, fristgerecht
fertigstellen, abliefern; **unentgeltliche Verbesserung** bei verschuldeten
Mängeln; Material/Geräte sorgfältig behandeln, Rechenschaft, Rest/Geräte
zurückgeben; Mängel am Material sofort melden und Weisung abwarten; Haftung
bei schuldhaftem Verderben **höchstens Selbstkosten**.

**Prüfung/Abnahme (353):** Arbeitgeber prüft nach Ablieferung, **Mängel
spätestens innert einer Woche** anzeigen; sonst gilt die Arbeit als
abgenommen.

**Lohn (353a) & Lohn bei Verhinderung/Annahmeverzug (353b):**
- 353a: ununterbrochener Dienst → Lohn **halbmonatlich** (oder mit Zustimmung
  Monatsende); sonst bei Ablieferung; **schriftliche Abrechnung** mit Grund
  für Abzüge.
- 353b: ununterbrochener Dienst → Lohnpflicht nach **324/324a** bei
  Annahmeverzug bzw. unverschuldeter Verhinderung; in den anderen Fällen
  keine solche Pflicht.

**Dauer/Probe (354):** Probearbeit → Verhältnis auf bestimmte Zeit zur Probe;
ununterbrochener Dienst → **unbefristet** vermutet, sonst befristet (sofern
nichts anderes vereinbart).

---

## 5 · Detailgrad-Matrix (Einzel/Kader — §11 Ziff. 2 deterministisch)

| Modul | einfach | standard | experte | Norm |
|---|---|---|---|---|
| Parteien, Funktion, Ort/Pensum, Probezeit, Lohn, Ferien, Lohnfortzahlung, Kündigung, Schluss, Unterschrift | ✓ | ✓ | ✓ | 319 ff. |
| Überstunden, Spesen, GAV (bedingt) | ✓ | ✓ | ✓ | 321c/327a/356 f. |
| Treue-/Geheimhaltung (deklaratorisch), Datenschutz | – | ✓ | ✓ | 321a/328b |
| IP / Arbeitsergebnisse / Erfindungen | – | – | ✓ | 332 OR, 17 URG |
| Nebenbeschäftigung / Konkurrenz während AV | – | – | ✓ | 321a III |
| Anwendbares Recht & Gerichtsstand (Vorbehalt zwingend Art. 34 ZPO) | – | – | ✓ | 34 ZPO |
| **Kader:** leitende Stellung / ArG-Ausnahme | (untertyp=kader) | | | 3 lit. d ArG |
| **Kader:** variable Vergütung / Bonus-Abgrenzung | (untertyp=kader, ab standard) | | | 322d |
| **Kader:** Freistellung bei Kündigung | (untertyp=kader, experte) | | | 335 ff. |

`standard`+`einzel` = heutiger Output byte-genau (Golden-Invariante §6).
`einfach` blendet die rein deklaratorischen Klauseln (Treuepflicht-Wiedergabe,
Datenschutz) aus — entfernt KEINE Rechte, da Art. 321a/328b ohnehin gelten.

**Wichtig (ArG-Ausnahme Kader):** Art. 3 lit. d ArG nimmt nur die **höhere
leitende Tätigkeit** von den Arbeits-/Ruhezeitvorschriften aus; die Klausel
ist deklaratorisch und ändert die OR-Lohn-/Ferien-/Kündigungsregeln NICHT
(offenlegen, nicht suggerieren, Kader hätten weniger zwingenden Schutz).

---

## 6 · Pflegebedarf (§11 Ziff. 4)
- OR-Konsolidierung 20260101 → bei neuer SR-220-Fassung Anker + Wortlaute
  nachführen (fedlex-cache.sh `or`).
- Kantonale Lehrvertrags-Genehmigung (BBG 14): Verfahren kantonal — nur als
  Hinweis, kein Parameter.
- ArG Art. 3 lit. d: Auslegung «höhere leitende Stellung» ist Gerichtspraxis →
  als Hinweis, kein Automatismus.
