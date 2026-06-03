# LegalCalc — Juristisches Review-Dokument

**Gegenstand:** Vollständige Aufstellung der implementierten Berechnungsregeln mit Normverweisen
**Anwendung:** Swiss Legal Calc — Arbeitsrecht (Fristen & Lohnfortzahlung)
**Stand:** 2026-06-03
**Quelle:** Source-Code-Analyse von `src/lib/*.ts` und `src/data/lohnfortzahlungSkalen.ts`

> ⚠️ **Charakter des Tools:** Automatisierte **Orientierungsberechnung**, keine Rechtsberatung. Abweichende GAV-, Vertrags- oder Versicherungslösungen, der genaue Sachverhalt sowie alle Norm- und Rechtsprechungsverweise sind im Einzelfall zu prüfen.

---

## Inhaltsverzeichnis

1. [Modul A — Lohnfortzahlung (Art. 324a OR)](#modul-a)
2. [Modul B — Kündigungsfrist (Art. 335a–c OR)](#modul-b)
3. [Modul C — Sperrfristen (Art. 336c OR)](#modul-c)
4. [Querschnittsregeln (Dienstjahr, Fristen, Datumsarithmetik)](#querschnitt)
5. [Lohnfortzahlungsskalen (kantonale Gerichtspraxis)](#skalen)
6. [Normverweis-Register](#normverweise)
7. [Rechtsprechungsverweise (Verifikationsstatus)](#rechtsprechung)
8. [Juristische Prüfpunkte / Vorbehalte](#pruefpunkte)

---

<a name="modul-a"></a>
## 1. Modul A — Lohnfortzahlung (Art. 324a OR)

**Datei:** `src/lib/lohnfortzahlung.ts`
**Zweck:** Dauer der Lohnfortzahlung bei unverschuldeter Arbeitsverhinderung (Krankheit, Unfall, Schwangerschaft).
**Stichtag (Dienstjahr-Bestimmung):** Beginn der Arbeitsverhinderung.

### Grundannahmen (fest verdrahtet)

- Unverschuldete Verhinderung (Krankheit, Unfall, Schwangerschaft o.ä.).
- Kein GAV mit abweichender Regelung unterstellt.
- Keine Karenztage: Lohnfortzahlung ab dem ersten Tag der Verhinderung.
- Mehrere Absenzen im gleichen Dienstjahr werden kumuliert; das Skala-Kontingent gilt **pro Dienstjahr**.

### Regel A.0 — KTG-Gleichwertigkeitsprüfung

| | |
|---|---|
| **Norm** | Art. 324a Abs. 4 OR; Art. 324b OR; Art. 362 OR |
| **Bedingung** | `ktgGleichwertigVorhanden === true` |
| **Rechtsfolge** | KTG-Regime tritt **an die Stelle** der gesetzlichen Skala. Status `ktg_regime`. Anspruch ergibt sich aus der Versicherungspolice; gesetzliche Skala (Art. 324a OR) findet **keine** Anwendung. |
| **Faustregel (Rechtsprechung)** | Taggeld ≥ 80 % des Lohnes während max. 720 Tagen innert 900 Tagen, hälftige Prämienteilung, wenige Karenztage. |
| **Rechtsprechung** | BGE 135 III 640 (Gleichwertigkeitsmassstab) — *nicht verifiziert* |

### Regel A.1 — Anspruchsvoraussetzung (3-Monats-Schwelle)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 1 OR |
| **Bedingung** | Arbeitsverhältnis dauert **mehr als 3 Monate** (Vertragsbeginn → Verhinderungsbeginn) |
| **Implementierung** | `dauerUeberDreiMonate(vb, vhb)`: `differenceInMonths > 3` **oder** (`=== 3` **und** Tagesrest `> 0`) |
| **Rechtsfolge bei Nichterfüllung** | Status `kein_anspruch`, kein Anspruch nach Art. 324a OR |
| **Hinweis** | Bei vertraglich fester Dauer > 3 Monate genügt dies für den Anspruch auch ohne Ablauf der Zeit (als Warnung ausgegeben, nicht automatisch berechnet). |

### Regel A.2 — Skala-Zuordnung nach Kanton

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR («angemessen längere Zeit») |
| **Implementierung** | `skaleFuerKanton(kanton)` → Basler / Zürcher / Berner Skala (siehe [§5](#skalen)) |
| **Sonderwarnung** | Kantone **ZG, GR**: Zuordnung zur Zürcher Skala uneinheitlich → Warnhinweis |
| **Fallback** | Unbekannter Kanton → Berner Skala als Näherung + Warnung |

### Regel A.3 — Dienstjahr-Ermittlung

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR |
| **Stichtag** | Beginn der Verhinderung |
| **Formel** | `vollendete Jahre + 1` (siehe [§4](#querschnitt)) |

### Regel A.4 — Skala-Dauer ablesen

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR |
| **Implementierung** | `dauerAusSkala(skala, dienstjahr)`: erster Eintrag mit `dienstjahrVon ≤ DJ ≤ dienstjahrBis` (oder `dienstjahrBis === null` = unbeschränkt) |
| **Fehlerfall** | Kein passender Eintrag → Status `kein_anspruch`, manuelle Prüfung |
| **Charakter** | **GERICHTSPRAXIS**, vor Produktiveinsatz zu verifizieren |

### Regel A.5 — Teilarbeitsunfähigkeit (Budget-Modell)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR |
| **Bedingung** | `arbeitsunfaehigkeitProzent < 100` |
| **Formel** | `effektiveDauer = Skala-Dauer ÷ (AUF% / 100)`, gerundet (`Math.round`) — z.B. 50 % → ×2 |
| **Modell** | Das Lohn-**Budget** (volle Skala-Dauer zu 100 % Lohn) wird über die gestreckte kalendarische Periode aufgebraucht. |
| **Vorbehalt** | Kalendarische Streckung ist eine **vertretbare Praxis-Auslegung**, im Einzelfall zu prüfen (Warnung). |

### Regel A.6 — Enddatum (letzter bezahlter Tag)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR |
| **Formel** | `letzterTag = Verhinderungsbeginn + effektiveDauer − 1 Tag` (Starttag inklusiv, kalendarisch) |
| **Beispiel** | 3 Wochen ab 01.01. → +3 Wochen = 22.01. → −1 = **21.01.** |

### Regel A.7 — Lohnbasis (optional, orientierend)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 1 OR |
| **Bedingung** | `monatslohnBrutto != null` |
| **Formel** | Tagesansatz = `Monatslohn / 30` (Monat = 30 Tage) |
| **Massgeblich** | Vertraglicher Bruttolohn inkl. 13. Monatslohn (anteilig) und regelmässiger Zulagen; bei schwankendem Lohn 12-Monats-Durchschnitt. |

**Normverweise (Ergebnis):** Art. 324a Abs. 1, Abs. 2, Abs. 4 OR; Art. 362 OR

---

<a name="modul-b"></a>
## 2. Modul B — Kündigungsfrist (Art. 335a–c OR)

**Datei:** `src/lib/kuendigungsfrist.ts`
**Stichtag (Dienstjahr-Bestimmung):** Zugang der Kündigung beim Empfänger (**Zugangsprinzip**).

### Grundannahmen (fest verdrahtet)

- Massgebend ist der **Zugang** der Kündigung beim Empfänger, nicht das Absendedatum.
- Kündigungstermin: Monatsende (default) **oder** freies Datum, je nach Eingabe.

### Regel B.1 — Probezeit

| | |
|---|---|
| **Norm** | Art. 335b OR |
| **Clamping** | `probezeitMonate` wird auf **0–3 Monate** begrenzt (`Math.min(Math.max(x,0),3)`) |
| **In Probezeit?** | `Zugang ≤ Vertragsbeginn + probezeitMonate` (inklusiv) |
| **Rechtsfolge** | Frist **7 Tage** ab Zugang → `Beendigung = Zugang + 7 Tage`. Kein Monatsendtermin, **keine** Sperrfristen. |
| **Normverweise** | Art. 335b OR, Art. 335a OR |

### Regel B.2 — Gesetzliche Kündigungsfrist nach Dienstjahr

| | |
|---|---|
| **Norm** | Art. 335c OR |
| **Stichtag** | Zugang der Kündigung |

| Dienstjahr | Gesetzliche Frist |
|---|---|
| 1. DJ (DJ ≤ 1) | **1 Monat** |
| 2.–9. DJ (DJ ≤ 9) | **2 Monate** |
| ab 10. DJ | **3 Monate** |

| | |
|---|---|
| **Rechtsprechung** | BGE 134 III 354 (Zugangs-/Empfangsprinzip) — *nicht verifiziert* |

### Regel B.3 — Abweichende Frist & Parität

| | |
|---|---|
| **Norm** | Art. 335a OR (Parität); Art. 335c OR |
| **Bedingung** | `abweichendeFristMonate != null` |
| **Regel** | `fristMonate = max(abweichendeFrist, gesetzlicheFrist)` — es gilt die **längere** Frist |
| **Warnung bei Unterschreitung** | Liegt die abweichende Frist unter der gesetzlichen Mindestfrist, gilt die gesetzliche. Verkürzung unter 1 Monat nur im 1. DJ und nur durch GAV (Art. 335c OR; *genaue Absatznummer zu verifizieren*). |

### Regel B.4 — Fristberechnung & Endtermin

| | |
|---|---|
| **Norm** | Art. 335c OR |
| **Frist laufend** | `fristLaufende = Zugang + fristMonate` (Kalendermonate) |
| **Bei Monatsendtermin** | `Beendigung = letzter Tag des Monats von fristLaufende` (`endOfMonth`) |
| **Ohne Monatsendtermin** | `Beendigung = fristLaufende` |

**Normverweise (Ergebnis):** Art. 335a OR, Art. 335b OR, Art. 335c OR

---

<a name="modul-c"></a>
## 3. Modul C — Sperrfristen (Art. 336c OR)

**Datei:** `src/lib/sperrfristen.ts`
**Baut auf Modul B auf** (ruft `berechneKuendigungsfrist` intern auf).

### Regel C.0 — Anwendungsausschlüsse

| Konstellation | Rechtsfolge | Norm |
|---|---|---|
| **Arbeitnehmerkündigung** (C7) | Art. 336c OR gilt **nur** für Arbeitgeberkündigungen → keine Sperrfristen, keine Hemmung; Kündigung bleibt gültig | Art. 336c Abs. 1 OR |
| **Probezeit** | Art. 336c OR gilt nicht in der Probezeit → Beendigung nach 7-Tages-Frist | Art. 336c Abs. 1 OR, Art. 335b OR |
| **Keine Sperrereignisse** | Keine Hemmung → ordentliche Beendigung aus Modul B | Art. 336c Abs. 1 OR |

### Regel C.1 — Sperrfrist-Intervalle je Ereignistyp

**Norm:** Art. 336c Abs. 1 OR

| Typ | Sperrfrist-Dauer | Implementierung |
|---|---|---|
| **`krankheit_unfall`** | 1. DJ: **30 Tage**; 2.–5. DJ: **90 Tage**; ab 6. DJ: **180 Tage** | Begrenzt durch tatsächliches Ende der Verhinderung (`bis`). Dienstjahr am Beginn der Verhinderung. |
| **`schwangerschaft`** | Gesamte Schwangerschaft **+ 16 Wochen (112 Tage)** nach Niederkunft | Intervall `von`–`bis` durch Nutzer angegeben |
| **`militaer_zivil`** | Dienstdauer; bei **> 11 Tagen** zusätzlich **je 4 Wochen (28 Tage) davor und danach** | `≤ 11 Tage`: nur Dienstdauer |
| **`hilfsaktion`** (lit. d) | Dauer der Dienstleistung | Intervall `von`–`bis` |

#### Sonderregel C5 — Dienstjahreswechsel innerhalb der Sperrfrist (nur Krankheit/Unfall)

Fällt der **Jahrestag** für den Übergang **1.→2. DJ** (30→90 Tage) oder **5.→6. DJ** (90→180 Tage) in eine laufende Sperrfrist, wird die Sperrfrist auf das längere Kontingent erweitert:

```
bereitsVerstrichen = Jahrestag − Verhinderungsbeginn
verbleibend        = neueMaxTage − bereitsVerstrichen
erweitertesEnde    = Jahrestag + verbleibend − 1   (gekappt durch tatsächliches "bis")
```

### Regel C2 — Kündigung *während* Sperrfrist → NICHTIG

| | |
|---|---|
| **Norm** | Art. 336c Abs. 2 OR |
| **Bedingung** | Zugang fällt in ein Sperrfrist-Intervall (`istInIntervall`) |
| **Rechtsfolge** | Status `nichtig`. Kündigung muss nach Ablauf der Sperrfrist mit ordentlicher Frist **wiederholt** werden. |

### Regel C3 — Hemmung der laufenden Kündigungsfrist

| | |
|---|---|
| **Norm** | Art. 336c Abs. 2 OR |
| **Bedingung** | Sperrfrist überschneidet die Kündigungsfrist `[Zugang, Beendigung]` |
| **Berechnung** | Pro Ereignis `intervallSchnittTage` (inkl. beider Endpunkte); Summe = `totalHemmungTage` |
| **Wirkung** | `beendigungNachHemmung = Beendigung + totalHemmungTage` |
| **Kein Schnitt** | Status `ok`, keine Hemmung |

### Regel C4 — Erstreckung auf Kündigungstermin

| | |
|---|---|
| **Norm** | Art. 336c Abs. 3 OR |
| **Bedingung** | `kuendigungsterminMonatsende === true` **und** `beendigungNachHemmung` ist nicht bereits Monatsende |
| **Wirkung** | Erstreckung auf das **Monatsende** (`endOfMonth`) |

**Normverweise (Ergebnis):** Art. 336c Abs. 1, Abs. 2, Abs. 3 OR + Normverweise Modul B

---

<a name="querschnitt"></a>
## 4. Querschnittsregeln

**Datei:** `src/lib/datumsUtils.ts`

| Regel | Formel | Verwendung |
|---|---|---|
| **Dienstjahr** | `differenceInYears(stichtag, vertragsbeginn) + 1` | Module A, B, C |
| **> 3 Monate** | `diffMonths > 3` **oder** (`=== 3` **und** Tagesrest `> 0`) | Anspruch Modul A |
| **Skala-Enddatum** | `start + Dauer − 1 Tag` (Starttag inklusiv) | Modul A |
| **Teil-AUF-Skalierung** | `anzahl × (100 / AUF%)`, `Math.round` | Modul A |
| **Intervallschnitt** | überlappende Tage inkl. beider Endpunkte | Modul C Hemmung |
| **Monatsende** | `endOfMonth(d)` | Module B, C |

> **Hinweis Dienstjahr:** Beginn 01.01.2020, Stichtag 01.01.2021 → 1 vollendetes Jahr → **2. Dienstjahr**.

---

<a name="skalen"></a>
## 5. Lohnfortzahlungsskalen (kantonale Gerichtspraxis)

**Datei:** `src/data/lohnfortzahlungSkalen.ts`

> ⚠️ **Diese Werte sind GERICHTSPRAXIS** zur Konkretisierung von Art. 324a Abs. 2 OR («angemessen längere Zeit»), **keine Gesetzesnormen**. Alle Einträge sind als «zu verifizieren» zu behandeln und vor Produktiveinsatz gegen die aktuelle kantonale Praxis abzugleichen.

### Basler Skala — Kantone BS, BL

| Dienstjahr | Dauer |
|---|---|
| 1. | 3 Wochen |
| 2.–3. | 2 Monate |
| 4.–10. | 3 Monate |
| 11.–15. | 4 Monate |
| 16.–20. | 5 Monate |
| ab 21. | 6 Monate |

### Zürcher Skala — Kantone ZH, SH, TG, ZG ⚠, GR ⚠

| Dienstjahr | Dauer |
|---|---|
| 1. | 3 Wochen |
| 2. | 8 Wochen |
| ab 3. | +1 Woche je weiteres DJ (9, 10, 11 … Wochen), hinterlegt bis 52. DJ |

> ⚠️ ZG/GR: Zuordnung zur Zürcher Skala in der Praxis uneinheitlich → separater Warnhinweis.

### Berner Skala — Restkantone (BE, AG, AI, AR, FR, GE, GL, JU, LU, NE, NW, OW, SG, SO, SZ, TI, UR, VD, VS)

| Dienstjahr | Dauer |
|---|---|
| 1. | 3 Wochen |
| 2. | 1 Monat |
| 3.–4. | 2 Monate |
| 5.–9. | 3 Monate |
| 10.–11. | 4 Monate |
| 12.–16. | 5 Monate |
| ab 17. | 6 Monate |

---

<a name="normverweise"></a>
## 6. Normverweis-Register

| Artikel | Bemerkung | Verwendet in |
|---|---|---|
| Art. 324a Abs. 1 OR | Anspruchsvoraussetzung | A.1, A.7 |
| Art. 324a Abs. 2 OR | Dauer «angemessen länger» | A.2–A.6 |
| Art. 324a Abs. 4 OR | Abweichende (gleichwertige) Regelung | A.0 |
| Art. 324b OR | Krankentaggeldversicherung | A.0 |
| Art. 335a OR | Parität der Kündigungsfristen | B.1, B.3 |
| Art. 335b OR | Probezeit | B.1, C.0 |
| Art. 335c OR | Kündigungsfristen und -termine | B.2–B.4 |
| Art. 336c Abs. 1 OR | Sperrfristen-Tatbestände | C.0, C.1 |
| Art. 336c Abs. 2 OR | Nichtigkeit / Hemmung | C2, C3 |
| Art. 336c Abs. 3 OR | Erstreckung auf Kündigungstermin | C4 |
| Art. 362 OR | Relativ zwingendes Recht | A.0, A (Ergebnis) |

---

<a name="rechtsprechung"></a>
## 7. Rechtsprechungsverweise (Verifikationsstatus)

| Aktenzeichen | Aussage | Verifiziert |
|---|---|---|
| BGE 135 III 640 | Gleichwertigkeitsmassstab bei Krankentaggeldversicherung | ❌ nein |
| BGE 134 III 354 | Massgeblich ist der Zugang der Kündigung beim Empfänger (Zugangs-/Empfangsprinzip) | ❌ nein |

> Alle Rechtsprechungsverweise tragen das Flag `verifiziert: false` und werden in der UI mit Verifikations-Vorbehalt angezeigt. **Vor Produktiveinsatz zu prüfen.**

---

<a name="pruefpunkte"></a>
## 8. Juristische Prüfpunkte / Vorbehalte

Die folgenden Punkte sind im Code als Annahmen/Warnungen markiert und sollten vor produktivem Einsatz juristisch verifiziert werden:

1. **Lohnfortzahlungsskalen** — durchgehend Gerichtspraxis, keine Gesetzesnormen; gegen aktuelle kantonale Praxis abzugleichen.
2. **ZG / GR** — Zuordnung zur Zürcher Skala uneinheitlich.
3. **Budget-Modell bei Teil-AUF** — kalendarische Streckung ist eine vertretbare, aber nicht zwingende Auslegung.
4. **Art. 335c OR, Verkürzung unter 1 Monat** — genaue Absatznummer im Code als „zu verifizieren" markiert.
5. **C5 Dienstjahreswechsel in der Sperrfrist** — Berechnung der Erweiterung; rechtlich im Einzelfall prüfen.
6. **Rückfall derselbe Krankheit/Unfall** — löst laut Code keine neue Sperrfrist aus (Rechtsprechung, zu verifizieren).
7. **Unabhängigkeit Sperrfrist ↔ Lohnfortzahlung** — Hemmung verlängert die Kündigungsfrist, bestimmt aber **nicht** die Dauer der Lohnfortzahlung.
8. **KTG-Gleichwertigkeit** — im Einzelfall zu prüfen (Leistungsdauer, -höhe, Karenztage, Prämienteilung).
9. **Rechtsprechungsverweise** — sämtlich `verifiziert: false`.

---

*Erstellt durch Source-Code-Analyse. Dieses Dokument ersetzt keine juristische Prüfung der Anwendung.*
