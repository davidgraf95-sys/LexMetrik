# LegalCalc — Juristisches Review-Dokument

**Gegenstand:** Vollständige Aufstellung der implementierten Berechnungsregeln mit Normverweisen
**Anwendung:** Swiss Legal Calc — Arbeitsrecht (Fristen & Lohnfortzahlung), Modul 1
**Stand:** 2026-06-03 (nach materiell-rechtlichem Umbau gemäss SHK-Abgleich, Commit `4bd1d9d`)
**Quelle:** Source-Code-Analyse von `src/lib/*.ts`, `src/data/*.ts`, `src/types/legal.ts`
**Grundlage:** Art. 324a/b, 335a/b/c, 336c, 362 und neu Art. 77 OR sowie SHK Stämpflis Handkommentar zum Arbeitsvertrag (Etter/Facincani/Sutter, 2021).

> ⚠️ **Charakter des Tools:** Automatisierte **Orientierungsberechnung**, keine Rechtsberatung. Massgeblich sind GAV, Einzelvertrag, Versicherungspolice und der konkrete Sachverhalt; abweichende Regelungen gehen vor.

> **Normentreue:** Fest verdrahtet sind ausschliesslich Art. 324a/b, 335a/b/c, 336c, 362 **und Art. 77 OR**. Jeder BGE/BGer-Verweis trägt `verifiziert: false` (zentral in `src/data/verifikation.ts`). Materiell-rechtliche Verhaltensänderungen tragen `// VERIFY:`-Kommentare im Code.

---

## Inhaltsverzeichnis

1. [Modul A — Lohnfortzahlung (Art. 324a OR)](#modul-a)
2. [Modul B — Kündigungsfrist (Art. 335a–c OR)](#modul-b)
3. [Modul C — Sperrfristen (Art. 336c OR)](#modul-c)
4. [Querschnittsregeln & Zählkonventionen](#querschnitt)
5. [Lohnfortzahlungsskalen (kantonale Gerichtspraxis)](#skalen)
6. [Normverweis-Register](#normverweise)
7. [Verifikations-Register (Rechtsprechung)](#verifikation)
8. [Testabdeckung (§7)](#tests)
9. [Juristische Prüfpunkte / Vorbehalte](#pruefpunkte)
10. [Änderungsprotokoll gegenüber dem alten Stand](#changelog)

---

<a name="modul-a"></a>
## 1. Modul A — Lohnfortzahlung (Art. 324a OR)

**Datei:** `src/lib/lohnfortzahlung.ts`
**Stichtag (Dienstjahr):** Beginn der Arbeitsverhinderung.

### Grundannahmen (fest verdrahtet)

- Unverschuldete Verhinderung (Krankheit, Unfall, Schwangerschaft o.ä.).
- **Vertragsbeginn = tatsächliche Arbeitsaufnahme** (Karenzfrist ab Arbeitsaufnahme, SHK N 40).
- Kein GAV mit abweichender Regelung unterstellt; keine Karenztage; Skala-Kontingent pro Dienstjahr.

### Regel A.0 — KTG-Gleichwertigkeitsprüfung mit Checkliste (§2.6)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 4 OR; Art. 324b OR; Art. 362 OR |
| **Bedingung** | `ktgGleichwertigVorhanden === true` |
| **Rechtsfolge** | KTG-Regime tritt an die Stelle der gesetzlichen Skala (Status `ktg_regime`). |
| **Checkliste** | Optionale Kriterien (`ktgKriterien`): Taggeld ≥ 80 %, Leistungsdauer ≥ 720 Tage, Karenz ≤ 3 Tage, AG-Prämienanteil ≥ 50 %, Risiken, Schriftform → strukturierte **Gleichwertigkeits-Indikation** (Orientierung). Karenz > 3 Tage: „in keinem Fall zulässig" (SHK N 62). |
| **Formelle Anforderung** | Wirksam nur schriftlich / in GAV-NAV mit allen wesentlichen Punkten (Art. 324a Abs. 4 OR, SHK N 57–59). |
| **Rechtsprechung** | BGE 135 III 640 — *nicht verifiziert* |

### Regel A.1 — Anspruchsvoraussetzung, differenziert (§2.2)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 1 OR; BGE 131 III 623 (*nicht verifiziert*) |
| **Vordienstzeit** | `anrechenbareVordienstzeitMonate` verschiebt den Karenzbeginn nach vorne (SHK N 44). |

| Konstellation | Rechtsfolge |
|---|---|
| `befristetFest` (feste Dauer > 3 Mt.) | Anspruch **ab Tag 1** (SHK N 41) |
| `vereinbarteKuendigungsfristMonate > 3` | Anspruch **ab Tag 1** (SHK N 42) |
| sonst, Dauer > 3 Monate | Anspruch besteht |
| sonst, Dauer ≤ 3 Monate | **kein Lohn** bis Ablauf 3 Monate; Anspruch erst ab 1. Tag des 4. Monats (BGE 131 III 623) → Status `kein_anspruch` |

### Regel A.2 — Skala-Zuordnung nach Kanton (§2.5)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR |
| **Implementierung** | `skaleFuerKanton(kanton)` → Basler / Zürcher / Berner Skala |
| **Zuordnungs-Vorbehalt** | Nur BS/BL, ZH/GR und die SHK-Berner-Kantone (BE/AG/OW/SG + Westschweiz) sind aus der SECO-/SHK-Tabelle **belegt**; alle übrigen (SH, TG, ZG, …) erzeugen eine Warnung „nicht aus der vorliegenden Quelle belegt". |
| **Sonderwarnung** | ZG, GR: Zuordnung uneinheitlich. |

### Regel A.3 — Dienstjahr & A.4 — Skala ablesen (§2.4)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR |
| **Dienstjahr** | `vollendete Jahre + 1` (Stichtag = Verhinderungsbeginn) |
| **Wortlaut** | 1. DJ: **„mindestens 3 Wochen"** (nicht „genau"); Skalenwert als **Regelmass / nicht gerichtsverbindlich** (SHK N 50). |
| **DJ > 11** | Fortschreibung aus der Quelle **nicht belegt** → Warnung `verifiziert: false`. |

### Regel A.5 — Teilarbeitsunfähigkeit = Geldminimum (§2.3)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR; SHK N 54 |
| **Dogmatik** | Art. 324a OR gewährt ein **Geld-, kein Zeitminimum**: bei Teil-AUF verlängert sich die Pflicht entsprechend. |
| **Formel** | `effektiveDauer = Skala-Dauer ÷ (AUF%/100)` (kalendarische Streckung; vertretbare Praxis-Auslegung). |
| **Teilzeit** | `pensumProzent` und `arbeitsunfaehigkeitProzent` sind **getrennte Grössen**; AUF bezieht sich auf die geschuldete Arbeitsleistung. |
| **Ausgabe** | CHF-Lohnkredit als primäre Grösse, Kalenderdauer als abgeleitete Hilfsgrösse. |

### Regel A.6 — Enddatum 1. Kredit & A.6b — zweiter Kredit (§2.1)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 2 OR; SHK N 53; BGer 4A_215/2011 (*nicht verifiziert*) |
| **1. Kredit** | `erstesEnde = Verhinderungsbeginn + effektiveDauer − 1 Tag` (Lohn ab Tag 1 inklusiv). |
| **Zweiter Kredit (DJ-übergreifend)** | Wenn `verhinderungEnde` über den Jahrestag reicht: frischer Kredit des Folge-Dienstjahres ab Jahrestag (`zweitesEnde`). Beide Kredite werden **sequenziell** zugeteilt; der Anspruch lebt am Jahrestag wieder auf, auch wenn der alte Kredit aufgebraucht war. |
| **Kappung** | Lohnfortzahlung endet spätestens mit `verhinderungEnde` (Lohnausfallprinzip). |

### Regel A.7 — Lohnbasis / Geldminimum CHF (§2.7)

| | |
|---|---|
| **Norm** | Art. 324a Abs. 1 OR; Lohnausfallprinzip (SHK N 47–49) |
| **Bedingung** | `monatslohnBrutto > 0` |
| **Berechnung** | Tagesansatz = Monatslohn/30; Geldminimum = Skala-Dauer (Tage) × Tagesansatz. |
| **Massgeblicher Lohn** | Grundlohn, 13. Monatslohn (anteilig, opt. `dreizehnterMonatslohn`), regelmässige Zulagen, variable Bestandteile (Durchschnitt); **keine** echten Spesen. |

**Normverweise (Ergebnis):** Art. 324a Abs. 1, 2, 3, 4 OR; Art. 362 OR

---

<a name="modul-b"></a>
## 2. Modul B — Kündigungsfrist (Art. 335a–c OR)

**Datei:** `src/lib/kuendigungsfrist.ts`
**Stichtag:** Zugang der Kündigung (Zugangsprinzip, BGE 134 III 354 *nicht verifiziert*).

### Regel B.1 — Probezeit (vorwärts ab Zugang)

| | |
|---|---|
| **Norm** | Art. 335b OR |
| **Clamping** | `probezeitMonate` auf 0–3 begrenzt |
| **Rechtsfolge** | Frist **7 Tage** ab Zugang (vorwärts), kein Monatsendtermin, keine Sperrfristen. |

### Regel B.2 — Gesetzliche Frist nach Dienstjahr

| Dienstjahr | Frist |
|---|---|
| 1. DJ (≤ 1) | 1 Monat |
| 2.–9. DJ (≤ 9) | 2 Monate |
| ab 10. DJ | 3 Monate |

Frist endet im höheren DJ → bleibt bei der Frist des Zugangs-DJ (Art. 335c Abs. 1 OR).

### Regel B.3 — Abweichende Frist (§3.2 — `max()` entfernt)

**Norm:** Art. 335c Abs. 2 OR; Parität Art. 335a OR. **Logik:**

| Bedingung | Ergebnis |
|---|---|
| keine abweichende Frist | gesetzliche Frist |
| **Schriftform/GAV nicht bestätigt** (`!formGueltig`) | gesetzliche Frist + Warnung (Abrede unwirksam) |
| abweichend **≥ 1 Monat**, formgültig | gilt — **auch wenn kürzer** als gesetzlich |
| abweichend **< 1 Monat**, GAV **und** 1. DJ | gilt (zulässige Verkürzung) |
| abweichend **< 1 Monat** sonst | unzulässig → gesetzliche Mindestfrist + Warnung |

> Der frühere „zu verifizieren"-Marker für Art. 335c Abs. 2 OR ist **entfernt** (Wortlaut liegt vor).

### Regel B.4 — Fristberechnung, Endtermin & Vaterschaftsurlaub (§3.4)

| | |
|---|---|
| **Norm** | Art. 335c Abs. 1 OR; Abs. 3 OR (Vaterschaftsurlaub) |
| **Frist laufend** | `Zugang + fristMonate` |
| **Vaterschaftsurlaub** | nur Arbeitgeberkündigung: `+ vaterschaftsurlaubResttage` Tage (`// VERIFY` Tagesberechnung). Kein zeitlicher Kündigungsschutz während des Urlaubs, aber Fristverlängerung. |
| **Monatsendtermin** | ggf. `endOfMonth`. |

**Normverweise (Ergebnis):** Art. 335a, 335b, 335c OR

---

<a name="modul-c"></a>
## 3. Modul C — Sperrfristen (Art. 336c OR)

**Datei:** `src/lib/sperrfristen.ts` (baut auf Modul B auf).

### Regel C.0 — Anwendungsausschlüsse

| Konstellation | Rechtsfolge |
|---|---|
| Arbeitnehmerkündigung | keine Sperrfristen/Hemmung; Kündigung bleibt gültig |
| Probezeit | Art. 336c gilt nicht; Beendigung nach 7-Tages-Frist |
| keine Sperrereignisse | keine Hemmung |

### Regel C.1 — Sperrfrist-Intervalle (§1.2 Art. 77 OR: Anfangstag zählt nicht)

**Norm:** Art. 336c Abs. 1 OR i.V.m. Art. 77 OR

| Typ | Dauer | Formel |
|---|---|---|
| `krankheit_unfall` | 1. DJ 30 / 2.–5. DJ 90 / ab 6. DJ 180 Tage | `Ende = min(bis, von + maxTage)` (**kein −1**) |
| `schwangerschaft` | Schwangerschaft + 16 Wochen (112 Tage) | Intervall durch Nutzer (BGE 143 III 21 *n. v.*) |
| `militaer_zivil` | Dienst; bei > 11 Tagen ± 4 Wochen (28 Tage) | `von−28 … bis+28` |
| `hilfsaktion` (lit. d) | Dauer der Dienstleistung | Intervall |

#### Sonderregel C5 — Dienstjahreswechsel in der Sperrfrist (§1.5)

**Norm:** Art. 336c Abs. 1 OR; BGE 133 III 517 (*nicht verifiziert*).
Läuft beim Übergang **1.→2. DJ** (30→90) oder **5.→6. DJ** (90→180) die Sperrfrist **noch**, wird die längere Sperrfrist **ab dem ersten AUF-Tag** berechnet (`von + neueMaxTage`); alte Tage sind dadurch automatisch angerechnet. Endet die kürzere Frist vor dem Jahrestag → **keine** Verlängerung.

### Regel C.1b — Kumulation & Rückfall (§1.3)

- Mehrere Sperrgründe **kumulieren**; parallele Sperren werden per **Union** zusammengefasst (keine Doppelzählung).
- `gleicheUrsacheWieEreignis` gesetzt → **Rückfall derselben Ursache**: keine eigene Sperrfrist (BGE 120 II 124 *n. v.*).

### Regel C2 — Kündigung *während* Sperrfrist → NICHTIG

| | |
|---|---|
| **Norm** | Art. 336c Abs. 2 OR |
| **Stichtag** | **Zugang** der Kündigung in einem Intervall → Status `nichtig`. |

### Regel C3 — Hemmung nach Rückrechnungsprinzip (§1.1)

| | |
|---|---|
| **Norm** | Art. 335c Abs. 1 i.V.m. Art. 336c Abs. 2 OR; BGE 134 III 354 / 115 V 437 (h.L.), a.M. BGE 131 III 467 — alle *nicht verifiziert* |
| **Fenster** | `[Endtermin − Frist, Endtermin]` (rückgerechnet), **nicht** `[Zugang, …]`. `// VERIFY` Rückrechnung Fristbeginn. |
| **Berechnung** | Union der Sperrintervalle ∩ Fenster = `totalHemmungTage`. Sperrgrund zwischen Zugang und Fristbeginn → **keine** Hemmung. |
| **Wirkung** | `beendigungNachHemmung = Endtermin + totalHemmungTage`. |

### Regel C4 — Erstreckung auf Endtermin (§1.4)

| | |
|---|---|
| **Norm** | Art. 336c Abs. 3 OR; BGE 124 III 474 (*nicht verifiziert*) |
| **Wirkung** | Bei Monatsendtermin Erstreckung auf `endOfMonth`. Ereignisse in der Erstreckungsphase (nach Endtermin) liegen ausserhalb des Fensters → automatisch **ignoriert**. |

**Normverweise (Ergebnis):** Art. 336c Abs. 1–3 OR; Art. 335c Abs. 1 OR + Modul B

---

<a name="querschnitt"></a>
## 4. Querschnittsregeln & Zählkonventionen (§4)

**Datei:** `src/lib/datumsUtils.ts`

| Regel | Formel |
|---|---|
| **Dienstjahr** | `differenceInYears + 1` (identisch für Art. 324a/335c/336c) |
| **> 3 Monate** | `diffMonths > 3` oder (`=== 3` und Tagesrest `> 0`) |
| **Sperrfrist-Ende (Art. 77)** | `sperrfristEnde(beginn, tage) = beginn + tage` — **Anfangstag zählt nicht** |
| **Lohnfortzahlung-Ende** | `letzterTagLohnfortzahlung = beginn + Dauer − 1` — **Anfangstag zählt mit** |

> ⚠️ **Bewusst unterschiedliche Zählweisen** (§4.2): Art. 324a (Lohn ab erstem Tag inkl.) und Art. 336c i.V.m. Art. 77 (Anfangstag der Sperrfrist zählt nicht). Im Code dokumentiert — **nicht vereinheitlichen**.

---

<a name="skalen"></a>
## 5. Lohnfortzahlungsskalen (kantonale Gerichtspraxis)

**Datei:** `src/data/lohnfortzahlungSkalen.ts`

> ⚠️ Gerichtspraxis, **nicht gerichtsverbindlich** (SHK N 50). Zuordnung nur für die in der SECO-/SHK-Tabelle genannten Kantone belegt; Fortschreibung > 11. DJ aus der Quelle nicht belegt.

### Basler Skala — BS, BL
| Dienstjahr | Dauer |
|---|---|
| 1. | 3 Wochen |
| 2.–3. | 2 Monate |
| 4.–10. | 3 Monate |
| 11.–15. | 4 Monate |
| 16.–20. | 5 Monate |
| ab 21. | 6 Monate |

### Zürcher Skala — ZH, GR (belegt) · SH, TG, ZG ⚠ (Annahme)
| Dienstjahr | Dauer |
|---|---|
| 1. | 3 Wochen |
| 2. | 8 Wochen |
| ab 3. | +1 Woche/Jahr (9, 10, 11 …), bis 52. DJ |

### Berner Skala — BE, AG, OW, SG, Westschweiz (belegt) · übrige (Annahme)
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
## 6. Normverweis-Register (fest verdrahtet)

| Artikel | Inhalt | Verwendung |
|---|---|---|
| Art. 324a Abs. 1 OR | Anspruch, > 3 Monate, Lohnausfallprinzip | A.1, A.7 |
| Art. 324a Abs. 2 OR | mindestens 3 Wochen / angemessen länger | A.2–A.6 |
| Art. 324a Abs. 3 OR | Schwangerschaft gleicher Umfang | A (Ergebnis) |
| Art. 324a Abs. 4 OR | abweichende, gleichwertige Regelung | A.0 |
| Art. 324b OR | Koordination Sozialversicherung (KTG/UVG) | A.0 |
| Art. 335a OR | Parität der Kündigungsfristen | B.1, B.3 |
| Art. 335b OR | Probezeit, 7-Tage-Frist | B.1, C.0 |
| Art. 335c Abs. 1 OR | 1/2/3 Monate je DJ, Monatsende, Rückrechnung | B.2, C3 |
| Art. 335c Abs. 2 OR | Abänderung; < 1 Monat nur GAV & 1. DJ | B.3 |
| Art. 335c Abs. 3 OR | Verlängerung bei Vaterschaftsurlaub | B.4 |
| Art. 336c Abs. 1 OR | Sperrfristtatbestände | C.0, C.1 |
| Art. 336c Abs. 2 OR | Nichtigkeit / Hemmung | C2, C3 |
| Art. 336c Abs. 3 OR | Erstreckung auf Endtermin | C4 |
| **Art. 77 OR** | Fristberechnung, Anfangstag zählt nicht | C.1 (§1.2) |
| Art. 362 OR | relativ zwingendes Recht | A.0, A (Ergebnis) |

---

<a name="verifikation"></a>
## 7. Verifikations-Register (`src/data/verifikation.ts`)

Zentrale Quelle aller Aktenzeichen; kein Aktenzeichen ohne Eintrag. **Alle `verifiziert: false`** bis Einzelprüfung.

| ID | Aktenzeichen | Aussage |
|---|---|---|
| BGE_131_III_623 | BGE 131 III 623 | Karenzfrist/Anspruch ab 4. Monat bei KF ≤ 3 Mt. |
| BGer_4A_215_2011 | BGer 4A_215/2011 | Anspruch erneuert sich pro Dienstjahr |
| BGE_135_III_640 | BGE 135 III 640 | KTG-Gleichwertigkeitsmassstab |
| BGE_131_III_467 | BGE 131 III 467 | Zugang / Gegenmeinung Fristbeginn |
| BGE_134_III_354 | BGE 134 III 354 | Zugangsprinzip / Rückrechnung |
| BGE_115_V_437 | BGE 115 V 437 | Rückrechnung; Abgrenzung Hemmung ↔ Lohn |
| BGE_133_III_517 | BGE 133 III 517 | DJ-Wechsel in Sperrfrist |
| BGE_124_III_474 | BGE 124 III 474 | Erstreckungsphase, keine neue Sperrfrist |
| BGE_120_II_124 | BGE 120 II 124 | Rückfall gleiche Ursache «aucun lien» |
| BGE_143_III_21 | BGE 143 III 21 | Schwangerschaftsbeginn als Anfangstag |

---

<a name="tests"></a>
## 8. Testabdeckung (§7) — 41 Tests grün

| Datei | Abdeckung |
|---|---|
| `src/tests/sperrfristen.test.ts` | §7.1–9: Rückrechnung, Art. 77, Union, Rückfall, C5, Nichtigkeit, AN-Kündigung, Erstreckung |
| `src/tests/lohnfortzahlung.test.ts` | §7.10–16: zwei Kredite, Anspruch-Aufleben, KF ≤ 3 Mt., befristet, Teil-AUF, Teilzeit, DJ > 11 |
| `src/tests/kuendigungsfrist.test.ts` | §7.17–20: kürzere Frist gültig, Verkürzung < 1 Mt., Probezeit, höheres DJ |
| `src/tests/querschnitt.test.ts` | §7.21–22: Schaltjahr, getrennte Zählkonventionen |

---

<a name="pruefpunkte"></a>
## 9. Juristische Prüfpunkte / Vorbehalte (`// VERIFY` & `verifiziert: false`)

1. **Rückrechnung Fristbeginn** (C3): Endtermin − Frist; abweichende Lehre (BGE 131 III 467) offengelegt.
2. **Vaterschaftsurlaub-Tagesberechnung** (B.4, Art. 335c Abs. 3 OR).
3. **C5-Erweiterung** (BGE 133 III 517) und **Rückfall** (BGE 120 II 124) — Rechtsfrage im Einzelfall.
4. **Schwangerschaftsbeginn** als Anfangstag (BGE 143 III 21).
5. **Skalen**: nicht gerichtsverbindlich; Kantonszuordnung über belegte Kantone hinaus = Annahme; DJ > 11 nicht belegt.
6. **Budget-/Geldminimum-Streckung** bei Teil-AUF = vertretbare Auslegung.
7. **KTG-Gleichwertigkeit** = abstrakter Gesamtvergleich im Einzelfall.
8. **Sämtliche BGE/BGer** tragen `verifiziert: false`.

---

<a name="changelog"></a>
## 10. Änderungsprotokoll gegenüber dem alten Stand

| Bereich | Alt | Neu |
|---|---|---|
| C-Hemmung | Vorwärtsfenster ab Zugang | **Rückrechnung** vom Endtermin (§1.1) |
| C-Sperrfrist-Ende | `von + Tage − 1` | `von + Tage` (Art. 77 OR, §1.2) |
| C-Kumulation | Einzelschnitt (Doppelzählung möglich) | **Union**; Rückfall ohne neue Frist (§1.3) |
| C5 | `Jahrestag + Rest − 1` | längere Frist **ab erstem AUF-Tag** (§1.5) |
| A-Teil-AUF | Budget-Modell (Zeit) | **Geldminimum**, Pensum/AUF getrennt (§2.3) |
| A-DJ-übergreifend | nur 1 Kredit | **zwei Kredite** via `verhinderungEnde` (§2.1) |
| A-Anspruch | reine 3-Monats-Schwelle | differenziert (befristet/KF/Vordienstzeit, §2.2) |
| B-abweichende Frist | `max(abw., gesetzl.)` | sauber: ≥ 1 Mt. gilt, GAV-Sonderfall (§3.2) |
| B-Vaterschaft | — | Verlängerung Art. 335c Abs. 3 OR (§3.4) |
| Infrastruktur | hartcodierte Aktenzeichen | zentrales `verifikation.ts` (§5.3); Art. 77 OR fest verdrahtet |

---

*Erstellt durch Source-Code-Analyse (Commit `4bd1d9d`). Ersetzt keine juristische Prüfung der Anwendung.*
