# SHK-Abgleich Arbeitsrecht — Art. 324a/324b/335c/336c OR gegen die Engines

**Erstellt:** 10.6.2026, Auftrag David (Wissens-Verwertung Ablage «Legal Calc Knowledge»):
fachlicher Abgleich des Stämpfli-Handkommentars gegen `lohnfortzahlung.ts`,
`kuendigungsfrist.ts`, `sperrfristen.ts`.
**Status:** ERSTRECHERCHE

**Quellen:**

| Quelle | Art | Stand/Abruf |
|---|---|---|
| SHK Arbeitsvertrag (Etter/Facincani/Sutter Hrsg.), Stämpfli 2021, ISBN 978-3-7272-3510-8: Art. 324a (von Zedtzwitz/Keller, S. 213–238), Art. 324b (dies., S. 239–241), Art. 335c (Facincani/Bazzell, S. 568–572), Art. 336c (Facincani/Bazzell, S. 659–668) | **PRIVAT, lokale Kopie** `bibliothek/quellen/legal-calc-knowledge/Lohnfortzahlung Kündigung/` (4 PDFs, gitignored) — reine **Praxis-Schicht** (S3), kein amtlicher Beleg | Ausgabe 2021; gelesen 10.6.2026 |
| OR (SR 220) Art. 324a/b, 335a–c, 336c — amtlicher Wortlaut-Beleg | Fedlex-Cache gemäss `register/quellen-register.md` (`/tmp/or.html`, konsolidiert 20260101) | siehe `recherche/arbeitsrecht-rechner.md` |

**Wichtig (S3):** Alle Regel-Formulierungen unten sind **eigene Destillate**, keine
Wortlaut-Übernahmen aus dem Kommentar. Der SHK belegt die *Praxis-Lesart*; Norm-Beleg
bleibt der Fedlex-Cache. **Achtung Quellen-Stand:** SHK 2021 kommentiert den
OR-Stand 2021 — die seitherigen Tatbestände in Art. 336c Abs. 1 (lit. cbis ab 1.7.2021;
lit. cter/cquater/cquinquies ab 1.1.2024) sind darin **nicht** enthalten (→ §5 Negativbefunde).

**INDEX-Hinweis:** Auftrag verbietet Änderungen an INDEX-Dateien — der Eintrag in
`bibliothek/INDEX.md` (S7) ist **nachzuholen** (offen, deklariert).

---

## §1 Art. 324a/324b OR — Lohnfortzahlung (`src/lib/lohnfortzahlung.ts`)

### 1.1 Anspruchsvoraussetzungen (Abs. 1)

| # | Regel (Eingabe → Ausgabe) | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 1 | Arbeitsverhältnis > 3 Monate gedauert ODER für > 3 Monate eingegangen → Anspruch; Berechnung ab Tag der **Arbeitsaufnahme** (BGE 131 III 623) | 324a N 40 (S. 228) | Engine korrekt (`lohnfortzahlung.ts:135–174`; Annahme «Vertragsbeginn = Arbeitsaufnahme» Z. 91) |
| 2 | Befristet fest > 3 Monate → Anspruch ab dem **ersten Tag** | 324a N 41 | Engine korrekt (`lohnfortzahlung.ts:143–145`, Input `befristetFest`; UI-Prämisse: Flag nur bei Befristung > 3 Mte. setzen — befristet ≤ 3 Mte. = nie ein Anspruch, N 41) |
| 3 | Unbefristet mit Kündigungsfrist > 3 Monate → Anspruch ab dem ersten Tag | 324a N 42 | Engine korrekt (`lohnfortzahlung.ts:146–148`) |
| 4 | Unbefristet mit Kündigungsfrist ≤ 3 Monate → Anspruch erst **ab dem ersten Tag des vierten Monats**; beginnt die Verhinderung vorher, ist bis dahin kein Lohn geschuldet | 324a N 43 (S. 228 f.) | Engine korrekt (`datumsUtils.ts:38–45` `dauerUeberDreiMonate`, inkl. Grenztag; Bug-Check-Fix 10.6.2026) |
| 5 | Karenzfrist nur **einmal** je Arbeitgeberin: Lehrzeit, Praktikum, aufeinanderfolgende befristete Verträge anrechnen; **Temporär-Vorzeit beim Einsatzbetrieb nicht** | 324a N 44 (S. 229) | Engine korrekt (`lohnfortzahlung.ts:135–136`, Input `anrechenbareVordienstzeitMonate`; Temporär-Ausschluss ist Eingabe-Verantwortung — als Annahme dokumentiert) |
| 6 | Verschulden: nur Vorsatz/Eventualvorsatz bzw. grobes, offensichtliches Fehlverhalten schliesst den Anspruch aus (SHK: gänzlicher Wegfall, keine blosse Kürzung); riskante Sportarten allein ≠ Verschulden | 324a N 35–37 (S. 227 f.) | Engine korrekt als deklarierte Annahme (`lohnfortzahlung.ts:336`) — kein Rechenpfad, bewusst Sachverhaltsfrage |
| 7 | Bei Schwangerschaft, öffentlichem Amt und Erfüllung gesetzlicher Pflichten ist Schuldlosigkeit **keine** Voraussetzung | 324a N 39 (S. 228) | Engine korrekt (`lohnfortzahlung.ts:336`) |
| 8 | Amts-Entschädigung ist auf die Lohnfortzahlung anzurechnen | 324a N 30 (S. 226) | Engine korrekt (`lohnfortzahlung.ts:368–374`, Hinweis-Schritt) |

### 1.2 Dauer: 3 Wochen + Skalen (Abs. 2)

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 9 | 1. Dienstjahr: mindestens **3 Wochen** Lohn; danach «angemessene längere Zeit»; besondere Umstände praktisch ohne Bedeutung; Konkretisierung durch **Gerichtsskalen ab dem 2. DJ**, für Gerichte **nicht verbindlich** | 324a N 50 (S. 231 f.) | Engine korrekt (Skalen-Daten + Warnung `lohnfortzahlung.ts:96` und Skalen-Header `lohnfortzahlungSkalen.ts:5–10`) |
| 10 | **Basler Skala** (BS, BL): 1. DJ 3 Wochen · 2.–3. DJ 2 Monate · 4.–10. DJ 3 Monate · 11. DJ 4 Monate | SECO-Tabelle bei 324a N 50, S. 232 (Bildtabelle, nur bis 11. DJ) | Engine korrekt für DJ 1–11 (`lohnfortzahlungSkalen.ts:18–32`); Fortschreibung 12.–15. DJ = 4 Mte. etc. ist aus dieser Quelle **nicht belegt** — Engine warnt bei DJ > 11 (`lohnfortzahlung.ts:219–223`) ✓ |
| 11 | **Berner Skala** (BE, AG, OW, SG, West-CH): 1. DJ 3 Wochen · 2. DJ 1 Monat · 3.–4. DJ 2 Monate · 5.–9. DJ 3 Monate · 10.–11. DJ 4 Monate | ebd. | Engine korrekt für DJ 1–11 (`lohnfortzahlungSkalen.ts:34–52`); > 11. DJ nicht belegt (Warnung vorhanden) |
| 12 | **Zürcher Skala** (ZH, GR): 1. DJ 3 Wochen · 2. DJ 8 Wochen · ab 3. DJ je +1 Woche pro DJ (3. DJ 9 Wo … 11. DJ 17 Wo) | ebd. | Engine korrekt (`lohnfortzahlungSkalen.ts:54–72`, Formel DJ+6 Wochen ab DJ 3 deckungsgleich mit Tabelle bis 11. DJ) |
| 13 | Kantons-Zuordnung **belegt** nur für: BS/BL · BE/AG/OW/SG/West-CH · ZH/GR | ebd. (Spaltenköpfe der Tabelle) | Engine korrekt: `KANTONE_ZUORDNUNG_BELEGT` (`lohnfortzahlung.ts:29–33`) deckt exakt diese Menge (West-CH als GE/VD/VS/NE/JU/FR gelesen); alle übrigen Kantone erhalten den Annahme-Warnhinweis (`lohnfortzahlung.ts:180–184`) ✓ |
| 14 | Dienstjahr-Bestimmung: Zugehörigkeitsdauer; bei kurzem Unterbruch Fortsetzungs-Vermutung (BGE 115 V 111: 2 Monate; BGE 112 II 51: > 4 Jahre = neu) | 324a N 51 (S. 232 f.) | Engine: keine Unterbruchs-Logik (Eingabe-Verantwortung) — vertretbar, Negativ-Notiz §5.4 |

### 1.3 Mehrere Verhinderungen, Dienstjahreswechsel, Geldminimum

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 15 | Anspruch besteht **pro Dienstjahr**, nicht pro Verhinderung (BGer 4A_215/2011); mehrere Verhinderungen im selben DJ werden **ursachenunabhängig addiert** (anders als bei Art. 336c!) | 324a N 52 (S. 233) | **BEFUND (NIEDRIG):** Die Engine rechnet nur EINE Verhinderung; die Kumulierung steht als Annahme im Output (`lohnfortzahlung.ts:334`), ein bereits angebrauchtes DJ-Kontingent kann nicht eingegeben/abgezogen werden. Offengelegte Funktionslücke, kein falsches Resultat bei Einzel-Verhinderung. Ausbau-Kandidat: Input «im laufenden DJ bereits bezogene Lohnfortzahlungstage». |
| 16 | Ob Schwangerschafts-Verhinderung einen **eigenen** Zeitkredit hat, ist **umstritten** (SHK referiert beide Lager) | 324a N 52 a.E. | Engine nimmt keinen Sonderkredit an — mit der von SHK referierten h.L. (Portmann/Rudolph, Streiff/von Kaenel/Rudolph) vereinbar; nicht als Fehler zu werten. |
| 17 | Der Anspruch **erneuert sich je Dienstjahr**; reicht eine Verhinderung ins nächste DJ, können **beide Kredite** ausgeschöpft werden; ein aufgebrauchter Kredit **lebt am DJ-Beginn wieder auf** | 324a N 53 (S. 233) | Engine korrekt (`lohnfortzahlung.ts:268–313`, Schritt 6b: zweiter Kredit ab Jahrestag, auch wenn 1. Kredit aufgebraucht; sequenzielle Zuteilung als Annahme deklariert) |
| 18 | **Geld-, nicht Zeitminimum** (h.L.): bei Teil-Arbeitsunfähigkeit verlängert sich die Lohnfortzahlungspflicht entsprechend; bei Teilzeitpensen darf die Teil-AUF nicht allein der arbeitsfreien Zeit zugerechnet werden | 324a N 54 (S. 233 f.) | Engine korrekt (`lohnfortzahlung.ts:236–255`; Streckung `datumsUtils.ts:103–110`; Teilzeit-Hinweis Z. 247–249). Die kalendarische Streckung als Umsetzung des Geldminimums ist Praxis-Auslegung — Engine legt das offen (Warnung Z. 252–254) ✓ |
| 19 | Unterjähriger Austritt verkürzt die Skala-Dauer nicht; die Pflicht endet aber (vorbehältlich Abrede) **mit Beendigung des Arbeitsverhältnisses** (BGE 127 III 318) | 324a N 55 (S. 234) | **BEFUND (NIEDRIG):** Engine kennt kein Eingabefeld «Ende des Arbeitsverhältnisses» und kappt nur auf das Verhinderungs-Ende (`lohnfortzahlung.ts:308–312`). Bei gekündigtem/befristetem Verhältnis kann der ausgewiesene letzte Tag **nach** dem AV-Ende liegen. Ausbau-Kandidat: optionales Feld «AV endet am» mit Kappung. |
| 20 | Lohnausfallprinzip: geschuldet ist der hypothetische Lohn (Grundlohn, 13. ML, Zulagen, variable Teile nach Referenzperiode, zugesicherte Gratifikationen, geplante Überstunden); **Spesen nicht** (auch Pauschalspesen nur, soweit verdeckter Lohn) | 324a N 46–49 (S. 230 f.) | Engine korrekt (orientierender Schritt 7, `lohnfortzahlung.ts:317–331`) — Hinweis: das Lohnausfallprinzip selbst steht bei N 46; Engine-Zitat «N 47–49» ist um eine Randnote knapp, inhaltlich deckungsgleich (keine Korrektur nötig, bei Gelegenheit präzisieren). |

### 1.4 Abgeltungslösung KTG (Abs. 4)

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 21 | Formgültigkeit: **schriftlich** bzw. GAV/NAV; die Abrede muss alle wesentlichen Punkte nennen (versicherter Lohn-%, Risiken, Leistungsdauer, Prämienfinanzierung, Karenzfrist); Verweis auf zugängliches Dokument genügt (BGE 131 III 623; 4A_98/2014) | 324a N 58 f. (S. 234 f.) | Engine korrekt (Warnung `lohnfortzahlung.ts:127`; Kriterium `schriftlichVereinbart` in `ktgIndikation`, Z. 53) |
| 22 | Gleichwertigkeit = abstrakter Gesamtvergleich, im Abrede-Zeitpunkt, je Arbeitnehmer individuell | 324a N 61 (S. 235) | Engine korrekt (Indikations-Text Z. 102–109: «abstrakter Gesamtvergleich im Einzelfall», unverbindliche Checkliste) |
| 23 | Sicher gleichwertig: Taggeld **80 %** während **720/730 Tagen**, Karenzfrist 2–3 Tage, Prämien **mind. hälftig** durch AG (4A_228/2017; 4A_98/2014; BGE 135 III 640) | 324a N 62 (S. 235 f.) | Engine korrekt (`ktgIndikation`, Z. 45–55: < 80 % / < 720 Tage / Prämienanteil < 50 % → «fraglich») |
| 24 | Karenzfristen **> 3 Tage in keinem Fall zulässig** (4A_98/2014) | 324a N 62, S. 236 | Engine korrekt (Z. 50, zitiert SHK N 62) |
| 25 | Formfehler: Abrede gilt dennoch, wenn sie für den AN im konkreten Fall **günstiger** ist (4A_517/2010); sonst gesetzliche Ordnung mit Anrechnung erbrachter Taggelder | 324a N 60 (S. 235) | Nicht abgebildet — Engine betritt den KTG-Pfad nur auf Nutzer-Erklärung «gleichwertige KTG vorhanden» und rechnet sonst die Skala; die Günstiger-Prüfung ist Rechtsanwendung im Einzelfall. Vertretbar; Negativ-Notiz §5.4. |

### 1.5 Art. 324b OR — Koordination obligatorische Versicherungen

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 26 | Befreiung des AG, wenn obligatorische Versicherung **mind. 4/5 (80 %)** des Lohns deckt (Abs. 1); sonst **Differenz bis 80 %** (Abs. 2); während **Wartezeit mind. 80 %** (Abs. 3) | 324b N 1–2, 6 (S. 240 f.) | Engine korrekt (Normverweise + Schritt 8, `lohnfortzahlung.ts:22–25, 339–374`) |
| 27 | Obligatorisch i.S.v. 324b: UVG, IVG, MVG, EOG (Dienst; Mutterschafts-EO **umstritten**). **Nicht**: ALV, Insolvenzentschädigung, AHV, KTG nach KVG/VVG | 324b N 4–5 (S. 240 f.) | Engine korrekt im abgedeckten Umfang (Unfall→UVG, Dienst→EO); KTG läuft richtig über Abs. 4/Abgeltung, nicht über 324b ✓ |
| 28 | Unfall: UVG-Taggeld 80 % ab dem **dritten Tag nach dem Unfalltag**; AG trägt **80 % für die 2 Karenztage** (Abs. 3); volle AG-Pflicht bei fehlender UVG-Deckung (z. B. < 8 Wochenstunden bei NBU) bzw. Differenz bei Lohn über UVG-Höchstbetrag | 324a N 11–12 (S. 219); 324b N 6 | Engine korrekt (Schritt 8 Unfall, `lohnfortzahlung.ts:341–351`, inkl. Warnung < 8 h / Höchstlohn). Der UVG-Höchstlohn (SHK 2021: 148 200 CHF) ist **nicht** als Zahl in der Engine — gut so (datierter Parameter, §6-Pflegebedarf nur falls je hartkodiert). |
| 29 | Schwangerschaft: Lohnfortzahlung im **gleichen Umfang** (Abs. 3); nach der Niederkunft EOG (80 %, max. 14 Wochen; 8-Wochen-Arbeitsverbot Art. 35a Abs. 3 ArG); Konstellationen mit fortdauernder AG-Pflicht (keine EOG-Versicherung, Aufschub, Differenz-Ausgleich) **umstritten** | 324a N 20–23 (S. 220–224) | Engine korrekt im Kern (Schritt 8 Schwangerschaft, `lohnfortzahlung.ts:360–367`); die umstrittenen Nach-Niederkunft-Konstellationen sind bewusst nicht gerechnet (Hinweistext verweist aufs EOG) — Negativ-Notiz §5.4. |

---

## §2 Art. 335c OR — Kündigungsfristen/-termine (`src/lib/kuendigungsfrist.ts`)

### 2.1 Fristen und Termine (Abs. 1)

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 30 | Frist nach Probezeit: **1. DJ → 1 Monat · 2.–9. DJ → 2 Monate · ab 10. DJ → 3 Monate**, je auf das **Ende eines Monats** | Normtext; 335c N 4 (S. 570) | Engine korrekt (`kuendigungsfrist.ts:94–101`) |
| 31 | Dienstjahre wie bei Art. 324a (Zugehörigkeit, Lehrzeit zählt, Kettenverträge zusammenrechnen) | 335c N 3 (S. 570) | Engine korrekt (gemeinsames `berechneDienstjahr`, `datumsUtils.ts:32–34`) |
| 32 | Massgebend für die Fristhöhe ist der **Zugang** der Kündigung (BGE 131 III 467); fällt das Fristende ins nächste DJ mit längerer Frist, ändert sich nichts | 335c N 5 (S. 570) | Engine korrekt (DJ-Stichtag = `zugangKuendigung`, Z. 92) |
| 33 | Monatsende-Termin ist **dispositiv**: Parteien können Kündigung auf jeden Tag vereinbaren | 335c N 6 (S. 570) | Engine korrekt (Input `kuendigungsterminMonatsende`, Z. 188–190) |
| 34 | Fristlauf: nach Probezeit beginnt die Frist mit dem auf den Zugang folgenden Monat bzw. ist **vom Endtermin zurückzurechnen** | 335c N 7 (S. 571) | Engine korrekt: `addMonths(zugang, frist)` + Monatsende ist arithmetisch deckungsgleich mit der Rückrechnung (geprüft an Zugang 1./15./31. eines Monats); Rückrechnung explizit in `sperrfristen.ts:482–502` |
| 35 | Zu lange Probezeit (> 3 Monate vereinbart): Kündigung im überschiessenden Teil → Frist **1 Monat** (BGE 131 III 467) | 335c N 10 (S. 571) | Engine korrekt im Ergebnis (Probezeit-Kappung auf 3 Monate Z. 59; danach greift 1. DJ = 1 Monat) |

### 2.2 Abweichende Fristen (Abs. 2)

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 36 | Abänderung nur durch **schriftliche Abrede, NAV oder GAV**; Schriftform = **Gültigkeitsvoraussetzung** | 335c N 8–9 (S. 571) | Engine korrekt (`abweichendeFristFormGueltig`-Gate, Z. 120–136: ohne Bestätigung gilt die gesetzliche Frist) |
| 37 | **Minimalfrist 1 Monat**; Unterschreitung (bis hin zur entfristeten Kündigung) **nur durch GAV und nur im 1. DJ**; Formvorschrift und Minimalfrist **beidseitig zwingend** | 335c N 8, 17 (S. 571 f.) | Engine korrekt (Z. 137–171: gültige Abrede ≥ 1 Monat gilt auch unter der gesetzlichen Frist; < 1 Monat nur bei `quelleGAV && dienstjahr === 1`, sonst Rückfall auf gesetzliche Frist). Rückfall-Höhe bei unzulässiger Verkürzung (gesetzliche Frist statt blosser Minimalfrist) ist im SHK nicht entschieden — Engine-Wahl vertretbar, offen markieren. |
| 38 | Parität (Art. 335a Abs. 1): gleiche Frist für beide Parteien | 335c i.V.m. 335a | Engine korrekt (Hinweis Z. 149) |

### 2.3 Abs. 3 — Verlängerung bei Vaterschaftsurlaub (SHK 2021; kein «Massenentlassungs-Abs. 3»)

Klärung der Auftrags-Frage: Der SHK 2021 kommentiert als Abs. 3 die **Verlängerung der
Kündigungsfrist um nicht bezogene Vaterschaftsurlaubstage** (Art. 329g; in Kraft 1.1.2021).
Einen Massenentlassungs-Absatz hat Art. 335c nicht und hatte ihn nie — die
Konsultations-/Anzeigepflichten stehen in Art. 335f/335g OR. Die Engine bildet
korrekt den Vaterschaftsurlaub-Absatz ab.

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 39 | Verlängerung **nur bei Arbeitgeber-Kündigung**; AN-Kündigung bleibt unberührt | 335c N 12 (S. 571 f.) | Engine korrekt (`kuendigungsfrist.ts:180–183`: Resttage nur bei `kuendigendePartei === 'arbeitgeber'`) |
| 40 | Massgeblicher Zeitpunkt für «nicht bezogen» = **Ende des Arbeitsverhältnisses** (auch wenn die Vaterschaft erst in der Kündigungsfrist eintritt); kein Ferienbezug anstelle der Verlängerung anordenbar | 335c N 14 (S. 572) | Engine korrekt im Input-Modell (Nutzer gibt Resttage per AV-Ende ein); Annahme-Text Z. 205–209 vorhanden |
| 41 | Die Verlängerung läuft **taggenau**; eine Erstreckung bis zum nächsten Monatsende gilt **nur bei entsprechender vertraglicher Abrede** (Analogie zu Art. 336c Abs. 3 als *Gestaltungsmöglichkeit* der Parteien — Umkehrschluss: von Gesetzes wegen keine Monatsende-Erstreckung) | 335c N 16 (S. 572) | **BEFUND (HOCH)** → §4 B1 |
| 42 | Kein zeitlicher Kündigungsschutz während des Vaterschaftsurlaubs; Kündigung *wegen* des Urlaubs wäre missbräuchlich (Art. 336 Abs. 1 lit. d), bleibt aber gültig | 335c N 13 f.; 336c N 28 | Engine korrekt (Annahme Z. 205–209; `sperrfristen.ts` kennt bewusst keinen Vaterschafts-Tatbestand) |

### 2.4 Geltungsbereichs-Grenzen (nicht abgebildet, deklarieren)

Temporärarbeit in den ersten 6 Monaten (Art. 19 Abs. 4 AVG: 2 Tage bzw. 7 Tage,
**Arbeitstage**), Handelsreisende (Art. 350 OR), Heuervertrag (24 h) haben
Sonderfristen (SHK 335c N 2, S. 569 f.). Die Engine rechnet nur das OR-Normalregime —
als Geltungsbereichs-Vorbehalt in UI/Dossier führen (→ §5.4).

---

## §3 Art. 336c OR — Sperrfristen (`src/lib/sperrfristen.ts`)

### 3.1 Anwendungsvoraussetzungen

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 43 | Nur **Arbeitgeber-Kündigungen**; AN-Kündigung nie erfasst | Normtext; Systematik | Engine korrekt (`sperrfristen.ts:312–331`) |
| 44 | Nur **nach Ablauf der Probezeit**; massgebend ist der Zugang in der Probezeit (4A_124/2009); bei wegbedungener Probezeit Schutz ab Tag 1 | 336c N 5 (S. 663) | Engine korrekt (`sperrfristen.ts:337–354`; wegbedungene Probezeit via `probezeitMonate = 0` → `istInProbezeit` false, `kuendigungsfrist.ts:27–35`) |
| 45 | Sperrfrist ≠ Lohnfortzahlung: kein automatischer Lohnanspruch für die verlängerte Frist (BGE 115 V 437) | 336c N 2 (S. 661) | Engine korrekt (Warnung `sperrfristen.ts:428–430`) |
| 46 | Fristlose Kündigung bleibt während Sperrfristen möglich; Aufhebungsvertrag nicht erfasst (Umgehungsvorbehalt) | 336c N 6 (S. 663) | Ausserhalb des Engine-Zwecks (ordentliche Kündigung) — Negativ-Notiz §5.4 |

### 3.2 Tatbestände und Dauern (Abs. 1)

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 47 | **lit. a Militär-/Schutz-/Zivildienst:** Sperrfrist = Dienstdauer; dauert der Dienst **mehr als 11 Tage**, zusätzlich **4 Wochen davor und danach**; tatsächliche Verhältnisse massgebend; Kadervorkurs + Dienst = Einheit | 336c N 10 (S. 663 f.) | Engine korrekt (`sperrfristen.ts:234–252`: `dauerTage > 11` → ±28 Tage). Einheits-Regel = Eingabe-Verantwortung (ein Ereignis erfassen). |
| 48 | **lit. b Krankheit/Unfall** (ganz oder teilweise, unverschuldet): **30 Tage im 1. DJ · 90 Tage 2.–5. DJ · 180 Tage ab 6. DJ**; DJ wie bei 324a | Normtext; 336c N 18 (S. 665) | Engine korrekt (`sperrfristen.ts:69–70`) |
| 49 | Sperrfrist beginnt am ersten Verhinderungstag; **Anfangstag zählt bei der Fristberechnung nicht** (Art. 77 OR); **Kalendertage**, nicht Arbeitstage | 336c N 19 (S. 665) | Engine korrekt (`datumsUtils.ts:93–96` `sperrfristEnde` ohne −1; Zähler `sperrfristen.ts:410–414`) |
| 50 | Sperrfrist dauert höchstens so lange wie die **Verhinderung** | 336c N 18 | Engine korrekt (Kappung auf `bis`, `sperrfristen.ts:74–75`) |
| 51 | Kein Mindestgrad/keine Mindestdauer der AUF (Kurzabsenzen geschützt, 4D_6/2009); Ausnahmen: Geringfügigkeit ohne Stellensuche-Hindernis (BGE 128 III 212), **bloss arbeitsplatzbezogene** AUF | 336c N 14, 16 (S. 664 f.) | Sachverhaltsfragen vor der Eingabe — Engine-Annahme-Ebene, korrekt nicht gerechnet (§5.4) |
| 52 | **DJ-Wechsel zu längerer Sperrfrist, Fall 1:** läuft die (kürzere) Sperrfrist am DJ-Beginn noch, gilt die **längere Sperrfrist, gerechnet ab dem ersten AUF-Tag** (verstrichene Tage damit angerechnet) (BGE 133 III 517) | 336c N 20 (S. 665 f.) | Engine korrekt (`sperrfristen.ts:81–104`, nur Schwellen 1→2 und 5→6, `laeuftNoch`-Bedingung) |
| 53 | **DJ-Wechsel Fall 2:** endete die kürzere Sperrfrist schon **vor** dem DJ-Beginn, dauert aber die Verhinderung an UND läuft die unterbrochene Kündigungsfrist ins neue DJ hinein, wird die Frist **am DJ-Beginn erneut unterbrochen**; es beginnt die (neue) längere Sperrfrist, **unter Anrechnung** der im Vorjahr bezogenen Sperrtage (BGE 133 III 517 S. 525) | 336c N 20 (S. 665 f.) | **BEFUND (HOCH)** → §4 B2 |
| 54 | Kein DJ-Upgrade, wenn nur die nach Abs. 3 **erstreckte Zusatzfrist** ins neue DJ fällt | 336c N 20 | Engine korrekt (Upgrade-Logik hängt allein am Sperrfrist-Intervall, nicht an der Erstreckung) |
| 55 | **lit. c Schwangerschaft:** ganze Schwangerschaft + **16 Wochen nach der Niederkunft**; Beginn mit der Befruchtung (BGE 143 III 21); weder Kenntnis noch Mitteilung nötig | 336c N 23–24 (S. 666) | Engine korrekt (`sperrfristen.ts:117–144`: Niederkunft + 112 Tage; ohne Niederkunftsdatum ehrliche Übernahme der Eingabe) |
| 56 | **lit. d Hilfsaktion im Ausland** (von Bundesbehörde angeordnet, **mit Zustimmung des AG**): Sperrfrist = Dauer der Dienstleistung, unbegrenzt; Zustimmung unwiderruflich | 336c N 26 (S. 666 f.) | Engine korrekt (`sperrfristen.ts:254–261`); Zustimmung = Eingabe-Prämisse (deklarieren) |
| 57 | **Betreuungsurlaub** (Art. 329i): Schutz solange Anspruch, **längstens 6 Monate ab Beginn der Rahmenfrist** | 336c-Kommentar N 27 (S. 667) | Engine korrekt (`sperrfristen.ts:263–276`) — **NIEDRIG-Hinweis** §4 B5: `von` muss als *Rahmenfrist-Beginn* eingegeben werden, sonst Kappung zu spät. |
| 58 | Mehrere Tatbestände: jeder Grund eigene Sperrfrist, **kumulativ**; parallel laufende konsumieren sich; gleichartige Gründe **derselben Ursache** (Rückfall) lösen **keine neue** Sperrfrist aus («aucun lien», BGE 120 II 124) | 336c N 8 (S. 663) | Engine korrekt (Union `sperrfristen.ts:284–299, 504–512`; Rückfall-Pfad Z. 380–395) |
| 59 | Ausdehnung der Sperrfristen durch EAV/GAV zulässig (relativ zwingend, Art. 362) | 336c N 9, 35 (S. 663, 668) | Nicht abgebildet (kein Input für vertraglich längere Sperrfristen) — §5.4 |

### 3.3 Rechtsfolgen (Abs. 2 und 3)

| # | Regel | SHK-Fundstelle | Verdikt |
|---|---|---|---|
| 60 | Zugang der Kündigung **in** der Sperrfrist → **nichtig** (BGE 113 II 259); Arbeitsverhältnis dauert fort; Kündigung ist nach Ablauf der Sperrfrist zu **wiederholen** (BGE 128 III 212) | 336c N 31–32 (S. 667 f.) | Engine korrekt (`sperrfristen.ts:432–475`, inkl. Vereinigung anschliessender Sperrfristen für den «frühestens»-Hinweis) |
| 61 | Kündigung **vor** der Sperrfrist, Frist noch nicht abgelaufen → **Stillstand/Unterbruch** der Kündigungsfrist, Fortsetzung nach Ende der Sperrfrist bzw. der Arbeitsunfähigkeit (BGE 121 III 107) | 336c N 33 (S. 668) | Engine korrekt (Hemmungs-Pfad mit Fixpunkt-Iteration, `sperrfristen.ts:504–562`: erneute Hemmung durch neue Sperrfrist in der verlängerten Frist — von Abs. 2 gedeckt) |
| 62 | Hemmbar ist die **vom Endtermin zurückgerechnete** Kündigungsfrist (BGE 134 III 354; BGE 115 V 437; **a.M.** BGE 131 III 467: Lauf ab Zustellung); Sperrgrund zwischen Zugang und Fristbeginn hemmt **nicht** | 336c N 7, 33 (S. 663, 668) | Engine korrekt (h.L./Rückrechnung umgesetzt, a.M. offengelegt: `sperrfristen.ts:482–502`) |
| 63 | **Abs. 3:** fällt das Ende der fortgesetzten Frist nicht auf den Endtermin (z. B. Monatsende), **Verlängerung bis zum nächstfolgenden Endtermin** | Normtext; 336c N 34 | Engine korrekt (`sperrfristen.ts:564–587`; ohne vereinbarten Endtermin keine Erstreckung ✓) |
| 64 | Neue Arbeitsunfähigkeit **in der Erstreckungsphase** (Zusatzfrist) löst **keine neue Sperrfrist** aus (BGE 124 III 474) | 336c N 34 (S. 668) | Engine korrekt (Hemmungs-Fenster endet mit der verlängerten Frist, Erstreckung bleibt aussen vor; Hinweistext Z. 577–587) |
| 65 | Nach Arbeitsfähigkeit muss der AN die Arbeit wieder anbieten, auch ohne Kenntnis der Verlängerung (BGE 115 V 437) | 336c N 34 | Hinweis-Ebene, nicht Rechen-Gegenstand — §5.4 |
| 66 | Wegbedingung der Abs.-3-Erstreckung (trotz vereinbartem Endtermin) unzulässig (SHK-These) | 336c N 36 (S. 668) | Engine konsistent: `kuendigungsterminMonatsende=false` modelliert «kein Endtermin vereinbart» (dann gibt es nichts zu erstrecken), nicht eine Wegbedingung der Erstreckung ✓ |

---

## §4 Befunde (konsolidiert)

### B1 — HOCH: 335c Abs. 3, Vaterschafts-Verlängerung wird vom Monatsende-Termin verschluckt

**Fundstelle Code:** `src/lib/kuendigungsfrist.ts:176–190`.
**Fundstelle Kommentar:** SHK 335c N 16 (S. 572).

Die Engine addiert die nicht bezogenen Urlaubstage **vor** der Monatsende-Erstreckung:
`fristLaufende = zugang + Monate + Resttage`, danach `letzterTag(Monat)`. Zwei Fehlerbilder:

1. **Verlängerung geht unter:** Zugang 15.3., 1 Monat, 10 Resttage → 15.4. + 10 = 25.4. →
   Monatsende **30.4.** — identisch mit dem Ergebnis OHNE Resttage. Die gesetzlich
   zwingende Verlängerung (Abs. 3 ist teilzwingend, SHK N 17) hat keinerlei Wirkung.
2. **Falsche Richtung der Erstreckung:** Nach SHK N 16 läuft die Verlängerung von Gesetzes
   wegen **taggenau über den ordentlichen Endtermin hinaus**; nur eine vertragliche Abrede
   kann zusätzlich «bis zum nächsten Monatsende» (Analogie Art. 336c Abs. 3) vorsehen.

**Soll-Regel (decision-tree):**
`ordentlicheBeendigung = Monatsende(zugang + Fristmonate)` (bzw. taggenau ohne Termin)
→ `beendigung = ordentlicheBeendigung + Resttage` (taggenau);
optionale Variante «vertragliche Monatsende-Analogie» = zusätzliche Erstreckung
auf das nächste Monatsende (nur auf ausdrückliche Eingabe).
**Folgewirkung:** `sperrfristen.ts:482` (Rückrechnung ab `kb.beendigungsdatum`) übernimmt
den Fehler in den Sperrfristen-Rechner. Korrektur nur als deklarierte fachliche Änderung (§6 Ziff. 3).

**UMGESETZT 10.6.2026 (Ja David, deklarierte fachliche Änderung):** Resttage
laufen taggenau über den ordentlichen Endtermin hinaus (`kuendigungsfrist.ts`,
neues Rückgabefeld `ordentlichesEndeDatum`); Sperrfristen-Rückrechnung bleibt
am ordentlichen Endtermin verankert. Tests: 5 neue Fälle + nachgeführte
Vorlagen-Erwartung (`kuendigungArbeitgeber.test.ts`, alt 31.7. → neu 20.7.).
Die optionale vertragliche Monatsende-Analogie ist NICHT gebaut, nur als
Annahme offengelegt (§8).

### B2 — HOCH: 336c Abs. 1 lit. b, zweite Konstellation von BGE 133 III 517 fehlt

**Fundstelle Code:** `src/lib/sperrfristen.ts:81–104` (`laeuftNoch`-Bedingung).
**Fundstelle Kommentar:** SHK 336c N 20 (S. 665 f.), BGE 133 III 517 S. 525.

Implementiert ist nur Fall 1 (kürzere Sperrfrist läuft am Dienstjahres-Beginn noch →
längere Sperrfrist ab erstem AUF-Tag). Fehlt: **Fall 2** — die kürzere Sperrfrist ist
**vor** dem DJ-Beginn abgelaufen, die Arbeitsunfähigkeit dauert an, und die unterbrochene
Kündigungsfrist läuft ins neue DJ hinein. Dann wird die Kündigungsfrist am DJ-Beginn
**erneut unterbrochen**; es gilt die längere Sperrfrist unter **Anrechnung** der bezogenen Tage
(Beispiel: 1.→2. DJ: 30 Tage bezogen → ab Jahrestag bis zu 60 weitere Sperrtage,
solange die AUF andauert). Die Engine liefert in dieser Konstellation ein **zu frühes
Beendigungsdatum** (bis zu 60 bzw. 90 Tage Hemmung fehlen).

**Soll-Regel (decision-tree):** WENN DJ(AUF-Beginn) ∈ {1, 5} UND AUF-Ende ≥ Jahrestag
UND kürzere Sperrfrist endete < Jahrestag UND (gehemmte) Kündigungsfrist läuft am Jahrestag
noch → zusätzliches Sperr-Intervall ab Jahrestag, Dauer = (90−30) bzw. (180−90) Tage
(Art.-77-Zählung), gekappt auf das AUF-Ende. Nur im Hemmungspfad relevant (bei Zugang in
einer Sperrfrist gilt ohnehin Nichtigkeit). Achtung Wechselwirkung mit der
Fixpunkt-Schleife (Z. 514–523): Bedingung «Frist läuft am Jahrestag noch» ist iterativ.

**UMGESETZT 10.6.2026 (Ja David, deklarierte fachliche Änderung):**
Wiederaufleben-Kandidat (`folgeKandidat`) ab Jahrestag, Zusatztage = Kontingent-
Differenz, gekappt aufs AUF-Ende; läuft in der Fixpunkt-Union mit (wirkungslos,
wenn die gehemmte Frist den Jahrestag nicht erreicht — genau die Soll-Bedingung,
iterativ). Sperrtage-Zähler rechnet bezogene Tage an (Kontingent neues DJ).
Zugang IM Wiederaufleben-Intervall: Nichtigkeit höchstrichterlich offen →
Warnung statt Verdikt (§8). Tests: 4 neue Fälle (1.→2. DJ 61 Hemmungstage,
5.→6. DJ 91, Gate AUF-Ende vor Jahrestag, Zugang-Warnung).

### B3 — NIEDRIG: 324a, mehrere Verhinderungen im selben Dienstjahr nicht verrechenbar

SHK 324a N 52: Kontingent gilt pro DJ, Absenzen sind zu addieren. Engine
(`lohnfortzahlung.ts`, Input-Modell) rechnet eine Einzel-Verhinderung mit vollem
Kredit und deklariert die Kumulierung nur als Annahme (Z. 334). Bei vorbestehenden
Absenzen im selben DJ weist sie zu viel aus. Ausbau: Eingabefeld «bereits bezogene Tage im DJ».

### B4 — NIEDRIG: 324a, keine Kappung auf das Ende des Arbeitsverhältnisses

SHK 324a N 55 (BGE 127 III 318): Pflicht endet mit Beendigung des AV. Kein Eingabefeld,
keine Kappung (`lohnfortzahlung.ts:308–312` kappt nur aufs Verhinderungs-Ende).
Ausbau: optionales Feld «AV-Ende» + Kappung + Hinweis auf abweichende (KTG-)Nachdeckung.

### B5 — NIEDRIG: Betreuungsurlaub-Kappung hängt an Eingabe-Semantik

`sperrfristen.ts:263–276` kappt auf `von + 6 Monate`; die 6 Monate laufen ab Beginn der
**Rahmenfrist** (Art. 329i), nicht zwingend ab Urlaubsbeginn. UI/Label muss «Beginn der
Rahmenfrist» verlangen, sonst Kappung zu spät.

### B6 — NIEDRIG: Terminologie «Vaterschaftsurlaub» (Pflege, nicht SHK-Widerspruch)

SHK 2021 und Engine sagen «Vaterschaftsurlaub»; seit 1.1.2024 heisst der Urlaub nach
Art. 329g «Urlaub des andern Elternteils» (Verweis in 335c Abs. 3 entsprechend angepasst).
Gegen den Fedlex-Cache 20260101 zu prüfen und Labels/`N_335c_3`-Bemerkung nachzuführen
(`kuendigungsfrist.ts:17`). Rechenregel unverändert.

---

## §5 Negativbefunde (S5)

1. **SHK 2021 enthält die neuen 336c-Tatbestände NICHT:** lit. cbis (verlängerter
   Mutterschaftsurlaub, ab 1.7.2021), lit. cter/cquater/cquinquies (Tod eines Elternteils
   usw., ab 1.1.2024) fehlen im kommentierten Normtext (S. 659 f.) vollständig. Die
   Engine-Pfade `mutterschaftsurlaub_verlaengert`, `zusatzurlaub_tod_elternteil`,
   `urlaub_tod_mutter` (`sperrfristen.ts:146–232`) sind mit dieser Quelle **nicht
   verifizierbar** — Beleg bleibt der Fedlex-Cache + künftige Kommentar-Auflage.
2. **Skalen über das 11. Dienstjahr hinaus:** Die SECO-Tabelle im SHK (S. 232) endet beim
   11. DJ. Die Fortschreibungen der Engine (Basler 12.–21.+, Berner 12.–17.+, Zürcher
   +1 Woche/DJ bis DJ 52) sind aus dieser Quelle **nicht belegt** — die bestehende
   Engine-Warnung (`lohnfortzahlung.ts:219–223`) bleibt nötig.
3. **Kein «Massenentlassungs-Abs. 3» in Art. 335c:** existiert nicht (weder SHK 2021 noch
   geltender Normtext); Massenentlassung = Art. 335d–k (separates Dossier
   `recherche/arbeitsrecht-rechner.md`, Rechner 7).
4. **Bewusst nicht gerechnete Sachverhalts-/Randfragen** (im SHK behandelt, in den Engines
   Annahme- oder UI-Ebene): Unterbruch des Dienstverhältnisses bei der DJ-Zählung (324a
   N 51) · Günstigkeits-Heilung formungültiger Abgeltungsabreden (324a N 60) · umstrittene
   Lohnfortzahlung nach Niederkunft (Ausgleichspflicht/EOG-Lücken, 324a N 22–23) ·
   arbeitsplatzbezogene AUF und Geringfügigkeit (336c N 14) · Quarantäne (336c N 15,
   Lehre gespalten, SHK verneint) · fristlose Kündigung/Aufhebungsvertrag (336c N 6) ·
   vertraglich verlängerte Sperrfristen (336c N 9/35) · Temporärarbeit/Handelsreisende/
   Heuervertrag (335c N 2) · Arbeitsangebot nach Genesung (336c N 34). Kein Engine-Fehler;
   wo nutzerrelevant, gehören sie als Annahmen/Warnungen in die UI-Texte (grossteils vorhanden).

---

## §6 Pflegebedarf / nächste Schritte

1. **B1 und B2 fixen** — beides fachliche Änderungen (CLAUDE.md §6 Ziff. 3): eigener,
   deklarierter Schritt mit Referenzfällen (B1: Zugang 15.3./1 Monat/10 Resttage → soll
   10.5.; B2: VB 1.9., AUF ab 1.2. andauernd, Kündigung Januar → zusätzliche Hemmung ab 1.9.).
2. B3/B4 als Ausbau-Kandidaten in die Rechner-Planung; B5/B6 als Label-/Textpflege.
3. INDEX-Eintrag für dieses Dossier nachholen (S7; im Auftrag gesperrt).
4. Datierte Parameter: keine neu einzutragen — UVG-Höchstlohn/EO-Ansätze stehen bewusst
   nicht als Zahlen in den Engines (nur SHK-Stand-2021-Nennungen hier im Dossier).
5. Hochstufung auf ZWEIFACH GEPRÜFT: adversarialer Durchgang gegen Fedlex-Cache +
   BGE-Volltexte (133 III 517, 131 III 623, 124 III 474, 120 II 124, 143 III 21).

**Bilanz:** 66 Regeln geprüft · 58 Engine-korrekt · 2 HOCH (B1, B2) · 4 NIEDRIG (B3–B6) ·
2 vertretbare Auslegungen offen markiert (Rückfall-Höhe bei unzulässiger Fristverkürzung,
§2.2 Nr. 37; kalendarische Streckung des Geldminimums, §1.3 Nr. 18).
