# Register — Bemessungskriterien kantonaler Prozesskosten-Tarife (I4)

**Erstellt:** 1.7.2026 · **Quelle der Erhebung:** parallele Recherche-Agenten
(je Kanton beide Erlasse — Gerichtskosten + Parteientschädigung — frisch am
amtlichen Erlass, meist über die `…/api/…/texts_of_law/…`-Variante der
kantonalen Erlasssammlungs-Portale bzw. amtliche PDF).
**Gegenstand je Eintrag:** die **Bemessungskriterien**, nach denen die Behörde
die konkrete Gebühr / das Honorar **innerhalb des Rahmens** festsetzt (bzw. den
Grundbetrag moduliert) — die allgemeine Bemessungsnorm, die dem in
`gerichtskosten.ts` / `parteientschaedigung.ts` zitierten Betrags-/Staffel-
Artikel meist **vorangeht oder ihn ergänzt**.
**Status:** Erstrecherche, amtlich belegt (Wortlaut je Eintrag); **fachliche
Abnahme David ausstehend (§7)** — nichts trägt `geprüft`. Die Kriterien werden
im Code als Anzeigefeld (`kriterien` / `kriterienNorm` auf `KantonalerTarif`,
[[typen.ts]]) getragen; die Engine liest sie NICHT (golden byte-gleich), die UI
zeigt sie nur, wenn das Ergebnis eine **Spanne** ist (§8).
**Bundesrechtliche Grundlage:** Art. 96 ZPO (kantonale Tarife); Ermessens-
Kernkriterien kantonsübergreifend: Streitwert/Interesse · Bedeutung der Sache ·
tatsächliche/rechtliche Schwierigkeit · Umfang/Arbeitsaufwand · Zeitaufwand ·
teils wirtschaftliche Verhältnisse der Parteien.

**Wichtiger Strukturbefund:** In der Mehrzahl der Kantone ist die zitierte Norm
NUR die Streitwert-/Betragsstaffel; die eigentliche Kriteriennorm ist eine
allgemeine Bestimmung desselben Erlasses (bzw. bei UR eine übergeordnete
Verordnung). Diese ist je Eintrag als `Bemessungsnorm` ausgewiesen.

**Metadaten-Korrekturen an bestehenden Daten (§7, in dieser Session mit-
vollzogen):**
- AR pe — bGS 145.53 heisst amtlich **«Verordnung über den Anwaltstarif»** (Daten trugen «Honorarordnung»).
- ZG pe — BGS 163.4 heisst amtlich **«Verordnung über den Anwaltstarif (AnwT)»** (Daten trugen «V. über die Anwaltskosten»).
- JU gk — RSJU 176.511 heisst amtlich **«Décret fixant les émoluments judiciaires»** (Daten trugen «Décret fixant le tarif des frais judiciaires»).
- JU pe — RSJU 188.61 heisst amtlich **«Ordonnance fixant le tarif des honoraires d'avocat»** (Daten trugen «Décret fixant le tarif des dépens»).

**Adversariale Gegenprüfung (1.7.2026, 2 unabhängige Opus-Agenten, QS-GP):**
13 Stichproben (7 mittel-Confidence + 4 Titel-Korrekturen + 3 hoch-Confidence-Kontrollen) unabhängig am Volltext refutiert.
- **1 Fund korrigiert:** OW pe — Norm war falsch (Art. 4a → **Art. 32 GebOR**, s. u.).
- **Bestätigt (mittel → hoch hochgestuft):** SZ gk (§ 3 Abs. 2 verbatim), AI gk (Art. 2 Abs. 1 verbatim), AG pe (§§ 6/7 belegt), UR pe (Übertragung via Art. 2 GGebR textlich fest, nicht nur sinngemäss), BE pe (Kriterien über Art. 9 + mitzitierten Art. 5 Abs. 2 gedeckt), ZH gk (§ 2 verbatim).
- **Bestätigt (Kontrollen):** BS gk (§ 2 Abs. 1 GGR), VS gk (Art. 13 LTar), alle 4 Titel-Korrekturen (AR/ZG/JU gk/JU pe).
- **Rest-Flag:** TG pe — Kriterien in § 2 belegt, aber die Erlass-Abkürzung «HonTV» (RB 176.31) könnte amtlich «Anwaltstarif in Zivil- und Strafsachen (AnwT)» heissen; **erlassName-Frage für Davids Abnahme offen** (Wert nicht auf Einzel-Agent-Basis überschrieben; kriterienNorm konsistent mit bestehendem erlassName belassen).

**Verbleibende Confidence-Notiz:**
- **GR gk — KEINE Kriterien im Erlass (VGZ arbeitet mit Pauschalen/Rahmen); Feld bleibt leer, UI fällt auf die generische Ermessenszeile zurück (§8).**

---

## Deutschschweiz — Gerichtskosten (gk)

### ZH — Bemessungsnorm § 2 GebV OG (Erhöhung § 4 Abs. 2) · confidence mittel
- Kriterien: Streitwert bzw. tatsächliches Streitinteresse · Zeitaufwand des Gerichts · Schwierigkeit des Falls
- Wortlaut: «Die Grundlage für die Festsetzung der Gebühr bilden der Streitwert bzw. das tatsächliche Streitinteresse, der Zeitaufwand des Gerichts und die Schwierigkeit des Falls.» (§ 4 Abs. 2: Erhöhung/Ermässigung bis ⅓, ausnahmsweise aufs Doppelte).
- Quelle: zhlex LS 211.11 (amtl. PDF 211.11_8.9.10_87) · zitierte Betragsnorm § 4 Abs. 1.

### BE — Bemessungsnorm Art. 5 VKD · confidence hoch
- Kriterien: gesamter Zeit- und Arbeitsaufwand · Bedeutung des Geschäfts · wirtschaftliche Leistungsfähigkeit der Kostenpflichtigen
- Wortlaut: «Wo das Dekret einen Rahmen festlegt, bemessen sich die Verfahrenskosten und Verwaltungsgebühren nach dem gesamten Zeit- und Arbeitsaufwand, der Bedeutung des Geschäfts sowie der wirtschaftlichen Leistungsfähigkeit der Kostenpflichtigen.»
- Quelle: belex BSG 161.12 (/api) · zitierte Betragsnorm Art. 36.

### LU — Bemessungsnorm § 1 Abs. 1 JusKV · confidence hoch
- Kriterien: Umfang, Bedeutung und Schwierigkeit der Streitsache · Umfang der Prozesshandlungen · Zeitaufwand für die Verfahrenserledigung · Interessen an der Beurteilung
- Wortlaut: «Innerhalb des vorgegebenen Rahmens bemisst sich die Gebühr nach Umfang, Bedeutung und Schwierigkeit der Streitsache, nach dem Umfang der Prozesshandlungen, nach dem Zeitaufwand für die Verfahrenserledigung und den Interessen an der Beurteilung der Streitsache.»
- Quelle: srl.lu.ch SRL 265 (/api) · zitierte Betragsnorm § 5.

### UR — Bemessungsnorm Art. 3 GGebV (RB 2.3231) i.V.m. Art. 2 GGebR · confidence hoch
- Kriterien: Aufwand der Gerichtsbehörde · Anzahl der Verhandlungen · Umfang der Beweisführung · Schwierigkeit von Sachverhalt und Rechtsfragen
- Wortlaut: «Innerhalb des Gebührenrahmens ist die einzelne Gebühr nach dem Aufwand der Gerichtsbehörde festzulegen. Dieser hängt namentlich ab von der Anzahl der Verhandlungen, dem Umfang der Beweisführung sowie der Schwierigkeit des Sachverhalts und der Rechtsfragen.»
- Quelle: rechtsbuch.ur.ch RB 2.3231 (/api) · zitierte Betragsnorm Art. 5/6 GGebR (RB 2.3232).

### SZ — Bemessungsnorm § 3 Abs. 2 GebO · confidence mittel
- Kriterien: Bedeutung der Sache · Zeitaufwand (Ansatz max. Fr. 180/Std.)
- Wortlaut: «Besteht ein Mindest- und Höchstansatz, so ist die Gebühr für den Einzelfall nach der Bedeutung der Sache und nach Zeitaufwand festzusetzen. Dabei darf für die Berechnung des Zeitaufwandes ein Ansatz von Fr. 180.-- für die Stunde nicht überschritten werden.»
- Quelle: SRSZ 173.111 (amtl. PDF) · zitierte Betragsnorm § 33.

### OW — Bemessungsnorm Art. 4a GebOR · confidence hoch
- Kriterien: persönliche und wirtschaftliche Bedeutung der Sache · Schwierigkeit der Sache · Umfang · Zeitaufwand
- Wortlaut: «Massgebend für die Festsetzung der Gerichtsgebühr innerhalb der in dieser Verordnung vorgesehenen Mindest- und Höchstsätze sind die persönliche und wirtschaftliche Bedeutung der Sache für die Partei, die Schwierigkeit der Sache, der Umfang sowie der Zeitaufwand.»
- Quelle: gdb.ow.ch GDB 134.15 (/api) · zitierte Betragsnorm Art. 12 (bzw. Art. 9).

### NW — Bemessungsnorm Art. 7 Abs. 1 PKoG (zugleich zitiert) · confidence hoch
- Kriterien: persönliche und wirtschaftliche Bedeutung der Sache · Schwierigkeit der Sache · Umfang der Prozesshandlungen · Zeitaufwand für die Verfahrenserledigung
- Wortlaut: «Die Entscheidgebühren des Kantonsgerichts bemessen sich nach der persönlichen und wirtschaftlichen Bedeutung der Sache für die Partei, der Schwierigkeit der Sache, dem Umfang der Prozesshandlungen und nach dem Zeitaufwand für die Verfahrenserledigung.»
- Quelle: gesetze.nw.ch NG 261.2 (/api) · zitierte Norm = Art. 7.

### GL — Bemessungsnorm Art. 1 Abs. 1 Zivil-/Strafprozesskostenverordnung · confidence hoch
- Kriterien: Streitwert bzw. sonstiges Interesse an der Beurteilung · erforderlicher Zeit- und Verwaltungsaufwand
- Wortlaut: «Die Kosten für das Schlichtungsverfahren und den Entscheid (Entscheidgebühr) bemessen sich nach dem Streitwert oder dem sonstigen Interesse der Parteien an der Beurteilung der Angelegenheit sowie nach dem erforderlichen Zeit- und Verwaltungsaufwand.»
- Quelle: gesetze.gl.ch GS III A/5 (/api) · zitierte Betragsnorm Art. 3.

### ZG — Bemessungsnorm § 3 Abs. 1 KoV OG · confidence hoch
- Kriterien: Streitwert bzw. tatsächliches Streitinteresse · Bedeutung des Falls · Zeitaufwand · Schwierigkeit des Falls
- Wortlaut: «Grundlage für die Festsetzung der Gebühr bilden: a) der Streitwert bzw. das tatsächliche Streitinteresse in Zivilverfahren; b) die Bedeutung des Falls; c) der Zeitaufwand und die Schwierigkeit des Falls.»
- Quelle: bgs.zg.ch BGS 161.7 (/api) · zitierte Betragsnorm § 11 Abs. 1.

### SO — Bemessungsnorm § 3 Abs. 1 GT · confidence hoch
- Kriterien: Zeit- und Arbeitsaufwand · Bedeutung des Geschäftes · Interesse an der Verrichtung · wirtschaftliche Leistungsfähigkeit des Gebührenpflichtigen
- Wortlaut: «Innerhalb eines Gebührenrahmens sind die Gebühren nach dem Zeit- und Arbeitsaufwand, nach der Bedeutung des Geschäftes, nach dem Interesse an der Verrichtung sowie nach der wirtschaftlichen Leistungsfähigkeit des Gebührenpflichtigen zu bemessen.»
- Quelle: bgs.so.ch BGS 615.11 (/api) · zitierte Betragsnorm § 145.

### BS — Bemessungsnorm § 2 Abs. 1 GGR · confidence hoch
- Kriterien: Bedeutung des Falles · Zeitaufwand des Gerichts · tatsächliche und rechtliche Komplexität · Streitwert bzw. tatsächliches Streitinteresse
- Wortlaut: «Grundlage für die Bemessung der Gebühr innerhalb des … Rahmens bilden a) die Bedeutung des Falles, b) der Zeitaufwand des Gerichts, c) die tatsächliche und rechtliche Komplexität des Falles sowie d) in Zivilsachen und Verwaltungsgerichtssachen vorwiegend vermögensrechtlicher Natur: der Streitwert bzw. das tatsächliche Streitinteresse.»
- Quelle: gesetzessammlung.bs.ch SG 154.810 (/api) · zitierte Betragsnorm § 5.

### BL — Bemessungsnorm § 3 GebT · confidence hoch
- Kriterien: Streitwert · Bedeutung der Streitsache · Schwierigkeit des Falles · Arbeits- und Zeitaufwand
- Wortlaut: «Wo ein Gebührenrahmen … vorgesehen ist, setzt das zuständige Gericht die Gebühr im konkreten Fall nach dem Streitwert und der Bedeutung der Streitsache fest. Es berücksichtigt ferner die Schwierigkeit des Falles sowie den Arbeits- und Zeitaufwand.» (Abs. 2: Erhöhung bis Doppeltes bei umfangreichem Aktenmaterial / Komplexität / hohem Streitwert.)
- Quelle: bl.clex.ch SGS 170.31 · zitierte Betragsnorm § 8 Abs. 1 lit. f.

### SH — Bemessungsnorm Art. 81 Abs. 1 JG · confidence hoch
- Kriterien: Streitwert · Aufwand der Justizbehörden · Schwierigkeit des Falls
- Wortlaut: «Grundlage für die Festsetzung der Gebühren bilden der Streitwert, der Aufwand der Justizbehörden und die Schwierigkeit des Falls.»
- Quelle: rechtsbuch.sh.ch SHR 173.200 (amtl. PDF) · zitierte Betragsnorm Art. 83.

### AR — Bemessungsnorm Art. 4 Abs. 1 Gebührenordnung (bGS 233.3) · confidence hoch
- Kriterien: Bedeutung des Geschäfts · Grösse des Zeitaufwands · Einkommens- und Vermögensverhältnisse der Parteien · Art der Prozessführung
- Wortlaut: «Bestehen für eine Entscheidgebühr ein Mindest- und ein Höchstansatz, so ist sie nach der Bedeutung des Geschäfts, der Grösse des Zeitaufwands, den Einkommens- und Vermögensverhältnissen der Parteien und der Art ihrer Prozessführung zu bemessen.»
- Quelle: ar.clex.ch bGS 233.3 (/api) · zitierte Betragsnorm Art. 17 (Erhöhung Art. 20).

### AI — Bemessungsnorm Art. 2 Abs. 1 GGV · confidence mittel
- Kriterien: Art der Sache · finanzielle Interessen · Umtriebe (Aufwand) · Vermögensverhältnisse des Kostenpflichtigen · Art der Prozessführung
- Wortlaut: Art. 2 Abs. 1 nennt «Art, finanzielle Interessen, Umtriebe, Vermögensverhältnisse des Kostenpflichtigen und Prozessführung» (Erhöhung nach Streitwert Art. 15).
- Quelle: ai.clex.ch GS 173.810 · zitierte Betragsnorm Art. 11.

### SG — Bemessungsnorm Art. 4 Abs. 2 GKV · confidence hoch
- Kriterien: Art des Falls · finanzielle Interessen der Beteiligten · Umtriebe · finanzielle Verhältnisse des Kostenpflichtigen · Art der Prozessführung
- Wortlaut: «Enthält dieser Erlass einen Mindest- und einen Höchstansatz, werden bei der Gebührenbemessung berücksichtigt: a) die Art des Falls; b) die finanziellen Interessen der Beteiligten; c) die Umtriebe; d) die finanziellen Verhältnisse des oder der Kostenpflichtigen; e) die Art der Prozessführung der Beteiligten.» (Erhöhung bis Vierfaches Art. 6.)
- Quelle: gesetzessammlung.sg.ch sGS 941.12 (amtl. PDF nGS 46-42) · zitierte Betragsnorm Art. 10/11.

### GR — gk: KEINE Kriteriennorm im Erlass (gefunden:false)
- Die VGZ (BR 320.210) arbeitet mit Pauschalen/Rahmen; einziges genanntes Modulationskriterium ist der «Aufwand» (Art. 1 Abs. 2 Reduktion, Art. 3 Abs. 2 Erhöhung bis Fr. 100'000). Keine allgemeine Kriterienaufzählung → **Feld bleibt leer**, UI fällt auf die generische Ermessenszeile zurück (§8).
- Quelle: gr-lex.gr.ch BR 320.210.

### AG — Bemessungsnorm § 5 Abs. 1 GebührD · confidence hoch
- Kriterien: angefallene Kosten (Aufwand) · Bedeutung der Sache
- Wortlaut: «Die … zuständige Gerichtsbehörde bemisst die Pauschale für das Schlichtungsverfahren beziehungsweise die Gebühr in Zivil-, Straf- und Verwaltungssachen innerhalb der festgesetzten Gebührenrahmen gemäss den angefallenen Kosten und der Bedeutung der Sache.»
- Quelle: gesetzessammlungen.ag.ch SAR 662.110 (/api) · zitierte Betragsnorm § 7 Abs. 1.

### TG — Bemessungsnorm § 3 Abs. 1 VGG · confidence hoch
- Kriterien: Aufwand der Behörde · Bedeutung des Falles · Vermögensverhältnisse der kostenpflichtigen Partei · Streitwert
- Wortlaut: «Die Verfahrensgebühr ist innerhalb des vorgesehenen Rahmens nach dem Aufwand der Behörde zu bemessen. Zu berücksichtigen sind die Bedeutung des Falles, die Vermögensverhältnisse der kostenpflichtigen Partei und der Streitwert.»
- Quelle: rechtsbuch.tg.ch RB 638.1 (/api) · zitierte Betragsnorm § 11 Abs. 1.

## Lateinische Schweiz — Gerichtskosten (gk)

### FR — Bemessungsnorm Art. 11 Abs. 2 RJ · confidence hoch
- Kriterien: Streitwert (valeur litigieuse) · Komplexität des Verfahrens (complexité) · wirtschaftliche Lage der kostenpflichtigen Partei (situation économique)
- Wortlaut: «Lorsque le tarif prévoit un émolument global variable, le montant en est arrêté … eu égard notamment à la valeur litigieuse, à la complexité de la procédure et à la situation économique de la partie amenée à payer les frais.»
- Quelle: bdlf.fr.ch RSF 130.11 (/api, en vigueur dès 01.12.2025) · zitierte Betragsnorm Art. 20/21.

### TI — Bemessungsnorm Art. 2 LTG · confidence hoch
- Kriterien: Streitwert (valore) · Natur der Sache (natura) · Komplexität (complessità)
- Wortlaut: «La tassa di giustizia è fissata in considerazione del valore, della natura e della complessità dell'atto o della causa.» (Abweichung bei offensichtlichem Missverhältnis, Abs. 2.)
- Quelle: ti.ch RL 178.200 (amtl. PDF) · zitierte Betragsnorm Art. 7.

### VD — Bemessungsnorm Art. 4 TFJC · confidence hoch
- Kriterien: Streitwert (valeur litigieuse) · Natur (nature) · Umfang (ampleur) · Schwierigkeit (difficulté)
- Wortlaut: «L'émolument forfaitaire de conciliation et de décision est fixé en fonction de la valeur litigieuse, de la nature, de l'ampleur et de la difficulté de la cause.» (Erhöhung bis Dreifaches Art. 6.)
- Quelle: lexfind.ch BLV 270.11.5 (amtl. PDF, Stand 01.09.2019) · zitierte Betragsnorm Art. 17/18.

### VS — Bemessungsnorm Art. 13 LTar · confidence hoch
- Kriterien: Streitwert (valeur litigieuse) · Umfang (ampleur) · Schwierigkeit (difficulté) · Prozessverhalten der Parteien (façon de procéder) · finanzielle Lage (situation financière)
- Wortlaut: «L'émolument est fixé en fonction de la valeur litigieuse, de l'ampleur et de la difficulté de la cause, de la façon de procéder des parties, ainsi que de leur situation financière.»
- Quelle: lex.vs.ch SR-VS 173.8 (/api) · zitierte Betragsnorm Art. 16. Amtlicher Titel «Loi fixant le tarif des frais et dépens …».

### NE — Bemessungsnorm Art. 6 LTFrais (i.V.m. Art. 12) · confidence hoch
- Kriterien: Beanspruchung der Behörde (mise à contribution) · Bedeutung der Sache (importance) · Schwierigkeiten (difficultés) · schriftliche Begründung (Art. 6 Abs. 2) · Streitwert (Art. 12)
- Wortlaut: «Lorsque le présent tarif laisse une marge d'appréciation à l'autorité, celle-ci fixe les frais à raison de sa mise à contribution, de l'importance de la cause et de ses difficultés. … elle a dû ou non motiver sa décision par écrit.»
- Quelle: rsn.ne.ch RSN 164.1 · zitierte Betragsnorm Art. 12.

### GE — Bemessungsnorm Art. 5 RTFMC · confidence hoch
- Kriterien: auf dem Spiel stehende Interessen (intérêts en jeu) · Komplexität (complexité) · Umfang des Verfahrens (ampleur) · Umfang der Arbeit (importance du travail) · Streitwert (Art. 17)
- Wortlaut: «Lorsque le présent règlement fixe un barème-cadre, les émoluments et les dépens sont arrêtés compte tenu, notamment, des intérêts en jeu, de la complexité de la cause, de l'ampleur de la procédure ou de l'importance du travail qu'elle a impliqué.» (Zuschlag bis Doppeltes Art. 6.)
- Quelle: silgeneve.ch rsGE E 1 05.10 · zitierte Betragsnorm Art. 17.

### JU — Bemessungsnorm Art. 4 Abs. 2 Décret fixant les émoluments judiciaires · confidence hoch
- Kriterien: erforderliche Zeit und Arbeit (temps et travail) · Bedeutung der Sache, namentlich Streitwert · Interesse für den Pflichtigen · Vorgehensweise (façon de procéder) · finanzielle Leistungsfähigkeit (capacité financière)
- Wortlaut: «… elle tient compte du temps et du travail requis, de l'importance de l'affaire, notamment de sa valeur litigieuse, de l'intérêt que présente l'opération pour le redevable ainsi que de la façon de procéder et de la capacité financière de celui-ci.»
- Quelle: rsju.jura.ch RSJU 176.511 (amtl. PDF) · zitierte Betragsnorm Art. 19. **Titelkorrektur** (s. oben).

---

## Parteientschädigung / Anwaltshonorar (pe)

### ZH — Bemessungsnorm § 2 AnwGebV (Modulation § 4 Abs. 2) · confidence mittel
- Kriterien: Streitwert bzw. tatsächliches Streitinteresse · Verantwortung des Anwalts · notwendiger Zeitaufwand · Schwierigkeit des Falls
- Wortlaut: «Die Grundlage für die Festsetzung der Gebühr bilden im Zivilprozess der Streitwert bzw. das tatsächliche Streitinteresse, die Verantwortung und der notwendige Zeitaufwand des Anwaltes sowie die Schwierigkeit des Falls.»
- Quelle: zhlex LS 215.3 (amtl. PDF 215.3_8.9.10_87) · zitierte Betragsnorm § 4 Abs. 1.

### BE — Bemessungs-/Modulationsnorm Art. 9 PKV (Grundhonorar Art. 5 streitwertbasiert) · confidence mittel
- Kriterien: besonderer Zeit- und Arbeitsaufwand · Schwierigkeit (Beweissammlung) · Umfang (Aktenmaterial/Briefwechsel) · bedeutende vermögensrechtliche Interessen (bei nicht bestimmbarem Streitwert)
- Wortlaut Art. 9: «Ein Zuschlag von bis zu 100 Prozent auf das Honorar wird gewährt bei Verfahren, die besonders viel Zeit und Arbeit beanspruchen, wie namentlich bei schwieriger und zeitraubender Sammlung … des Beweismaterials, bei grossem Aktenmaterial oder umfangreichem Briefwechsel.»
- Quelle: belex BSG 168.811 (/api) · zitierte Betragsnorm Art. 5.

### LU — Bemessungsnorm § 2 Abs. 1 JusKV · confidence hoch
- Kriterien: Umfang, Bedeutung und Schwierigkeit der Streitsache · Art der Vertretung · sachlich gebotener Zeitaufwand
- Wortlaut: «Innerhalb des vorgegebenen Rahmens bemisst sich die Gebühr nach Umfang, Bedeutung und Schwierigkeit der Streitsache, nach der Art der Vertretung sowie nach dem sachlich gebotenen Zeitaufwand für die Verfahrensführung.»
- Quelle: srl.lu.ch SRL 265 (/api) · zitierte Norm § 31 Abs. 1 (Prozentsatz 75–150 %).

### UR — Bemessungsnorm Art. 3 GGebV i.V.m. Art. 2 GGebR · confidence mittel
- Kriterien: Aufwand · Anzahl der Verhandlungen · Umfang der Beweisführung · Schwierigkeit von Sachverhalt und Rechtsfragen (sinngemäss auf die Anwaltsentschädigung übertragen)
- Quelle: rechtsbuch.ur.ch RB 2.3231 (/api) · zitierte Betragsnorm Art. 28 Abs. 1 GGebR.

### SZ — Bemessungsnorm § 2 Abs. 1 GebT für Rechtsanwälte · confidence hoch
- Kriterien: Wichtigkeit der Streitsache · Schwierigkeit · Umfang und Art der Arbeitsleistung · notwendiger Zeitaufwand
- Wortlaut: «Im Rahmen der … Mindest- und Höchstansätze ist die Vergütung nach der Wichtigkeit der Streitsache, ihrer Schwierigkeit, dem Umfang und der Art der Arbeitsleistung sowie dem notwendigen Zeitaufwand zu bemessen.»
- Quelle: SRSZ 280.411 (amtl. PDF) · zitierte Betragsnorm § 8.

### OW — Bemessungsnorm Art. 32 GebOR (Zuschläge Art. 41) · confidence hoch (adversarial korrigiert)
- Kriterien: persönliche und wirtschaftliche Bedeutung der Sache · Schwierigkeit der Sache · Umfang und Art der Arbeit · Zeitaufwand
- Wortlaut Art. 32: «Massgebend für die Festsetzung des Honorars … sind persönliche und wirtschaftliche Bedeutung der Sache für die Partei, die Schwierigkeit der Sache, der Umfang und die Art der Arbeit sowie der Zeitaufwand.»
- **Korrektur (adversariale Gegenprüfung 1.7.2026):** Die Erstrecherche hatte fälschlich Art. 4a GebOR zugeordnet — dieser gilt ausdrücklich nur für die «Gerichtsgebühr», nicht für das Anwaltshonorar. Die einschlägige Honorar-Bemessungsnorm ist **Art. 32 GebOR** (Zuschläge Art. 41). Daten korrigiert.
- Quelle: gdb.ow.ch GDB 134.15 (/api) · zitierte Betragsnorm Art. 35 Abs. 1.

### NW — Bemessungsnorm Art. 33 Abs. 1 PKoG · confidence hoch
- Kriterien: Bedeutung der Sache (persönlich und wirtschaftlich) · Schwierigkeit · Umfang und Art der Arbeit · Zeitaufwand
- Wortlaut: «Massgebend für die Festsetzung des Honorars … sind die Bedeutung der Sache für die Partei in persönlicher und wirtschaftlicher Hinsicht, die Schwierigkeit der Sache, der Umfang und die Art der Arbeit sowie der Zeitaufwand.»
- Quelle: gesetze.nw.ch NG 261.2 (/api) · zitierte Betragsnorm Art. 42.

### GL — Bemessungsnorm Art. 20 Abs. 1 EG ZPO · confidence hoch
- Kriterien: notwendiger Zeitaufwand · Streit- oder Interessenwert · Schwierigkeit des Falles
- Wortlaut: «Die Parteientschädigung bemisst sich nach dem notwendigen Zeitaufwand, dem Streit- oder Interessenwert und der Schwierigkeit des Falles.»
- Quelle: gesetze.gl.ch GS III C/1 (/api) · zitierte Norm = Art. 20.

### ZG — Bemessungsnorm § 2 AnwT (Modulation § 3 Abs. 3) · confidence hoch
- Kriterien: Schwierigkeit des Falls · Umfang und Art der angemessenen Bemühungen · Verantwortung · notwendiger Zeitaufwand
- Wortlaut § 2: «Innerhalb der … Grenzen sind die Honorare … nach der Schwierigkeit des Falls sowie nach dem Umfang und der Art der angemessenen Bemühungen festzulegen.» (§ 3 Abs. 3: ± ⅓ nach Verantwortung/Schwierigkeit/Zeitaufwand.)
- Quelle: bgs.zg.ch BGS 163.4 (/api) · zitierte Betragsnorm § 3. **Titelkorrektur** (s. oben).

### SO — Bemessungsnorm § 160 GT (i.V.m. § 3 analog) · confidence hoch
- Kriterien: erforderlicher Aufwand für sorgfältige und pflichtgemässe Vertretung · (analog § 3) Bedeutung des Geschäfts · Interesse · wirtschaftliche Leistungsfähigkeit
- Wortlaut § 160 Abs. 1: «Der Richter setzt die Kosten der berufsmässigen Vertretung … nach dem Aufwand fest, welcher für eine sorgfältige und pflichtgemässe Vertretung erforderlich ist.» (Abs. 2: § 3 analog anwendbar.)
- Quelle: bgs.so.ch BGS 615.11 (/api) · zitierte Norm = § 160.

### BS — Bemessungsnorm § 2 HoR · confidence hoch
- Kriterien: Umfang der Bemühungen · Bedeutung der Sache für die Parteien · Schwierigkeit (tatsächlich und rechtlich) · finanzielle Verhältnisse (in besonderen Fällen)
- Wortlaut: «Die Bemessung des Honorars richtet sich nach folgenden Grundsätzen: a) Umfang der Bemühungen; b) Bedeutung der Sache für die Parteien; c) Schwierigkeit in tatsächlicher und rechtlicher Hinsicht.» (Abs. 3: finanzielle Verhältnisse in besonderen Fällen; Abs. 2: auch für Mindest-/Höchstsätze massgebend.)
- Quelle: gesetzessammlung.bs.ch SG 291.400 (/api) · zitierte Betragsnorm § 5.

### BL — Bemessungsnorm § 9 (i.V.m. § 3 Abs. 1) Tarifordnung Anwältinnen/Anwälte · confidence hoch
- Kriterien: Verhältnis Streitwert / Bemühung / Bedeutung der Sache (§ 9) · Schwierigkeit · Bedeutung · Verantwortung · persönliche und finanzielle Verhältnisse (§ 3 Abs. 1)
- Wortlaut § 9: «Besteht zwischen Streitwert einerseits und Bemühung … und der Bedeutung der Sache andererseits ein offenbares Missverhältnis, so kann das Honorar angemessen herauf- oder herabgesetzt werden.»
- Quelle: bl.clex.ch SGS 178.112 · zitierte Betragsnorm § 7.

### SH — Bemessungsnorm Art. 86 JG · confidence hoch
- Kriterien: angemessener und für die Prozessführung erforderlicher Aufwand · üblicher Ansatz (ohne Erfolgszuschläge) · angemessenes Verhältnis zur Bedeutung der Sache
- Wortlaut Abs. 1: «Das Gericht setzt die Parteientschädigung … im Rahmen der geltenden Vorschriften nach Ermessen fest.» (Abs. 2 lit. a–d: üblicher Ansatz ohne Erfolgszuschlag; angemessener/erforderlicher Aufwand; Verhältnis zur Bedeutung; keine ungerechtfertigte Belastung der Gegenpartei.)
- Quelle: rechtsbuch.sh.ch SHR 173.200 (amtl. PDF) · zitierte Norm = Art. 86.

### AR — Bemessungsnorm Art. 11 V. über den Anwaltstarif (bGS 145.53) · confidence hoch
- Kriterien: grundsätzliche Bedeutung und Schwierigkeit des Falles · wirtschaftliche Verhältnisse der Beteiligten · notwendiger Zeitaufwand · Vertretung mehrerer Parteien · ausserordentliche vorprozessuale Bemühungen
- Wortlaut Abs. 2: «Als besondere Umstände kommen namentlich in Betracht: a) die grundsätzliche Bedeutung und die Schwierigkeit eines Falles, b) die wirtschaftlichen Verhältnisse der Beteiligten, c) der notwendige Zeitaufwand, d) die Vertretung mehrerer Parteien, e) ausserordentliche vorprozessuale Bemühungen.» (Abs. 1: ± ¼ vom mittleren Honorar.)
- Quelle: ar.clex.ch bGS 145.53 · zitierte Betragsnorm Art. 9. **Titelkorrektur** (s. oben).

### AI — Bemessungsnorm Art. 13 Abs. 1 AnwHV · confidence hoch
- Kriterien: grundsätzliche Bedeutung und Schwierigkeit des Falles · wirtschaftliche Verhältnisse der Beteiligten · notwendiger Zeitaufwand · Vertretung mehrerer Parteien · ausserordentliche vorprozessuale Bemühungen
- Wortlaut: «… um bis zu 25 % … zur Berücksichtigung besonderer Umstände, namentlich der grundsätzlichen Bedeutung und der Schwierigkeit des Falles, der wirtschaftlichen Verhältnisse der Beteiligten, des notwendigen Zeitaufwands, der Vertretung mehrerer Parteien und ausserordentlicher vorprozessualer Bemühungen.»
- Quelle: ai.clex.ch GS 177.410 · zitierte Betragsnorm Art. 9/10.

### SG — Bemessungsnorm Art. 17 Abs. 1 HonO · confidence hoch
- Kriterien: grundsätzliche Bedeutung des Falles · Schwierigkeit · wirtschaftliche Verhältnisse der Beteiligten · Art und Umfang der notwendigen Bemühungen · Vertretung mehrerer Parteien · ausserordentliche vorprozessuale Bemühungen
- Wortlaut: «Das mittlere Honorar kann zur Berücksichtigung besonderer Umstände, namentlich der grundsätzlichen Bedeutung und der Schwierigkeit des Falles, der wirtschaftlichen Verhältnisse der Beteiligten, von Art und Umfang der notwendigen Bemühungen, der Vertretung mehrerer Parteien und ausserordentlicher vorprozessualer Bemühungen, um bis zu 50 Prozent unter- oder überschritten werden.»
- Quelle: gesetzessammlung.sg.ch sGS 963.75 (/api) · zitierte Betragsnorm Art. 14 (mittleres Honorar).

### GR — Bemessungsnorm Art. 2 i.V.m. Art. 3 HV · confidence hoch
- Kriterien: Ermessen der urteilenden Instanz · üblicher Stundenansatz (210–270 Fr.) · Angemessenheit und Erforderlichkeit des Aufwands · Interessenwertzuschlag nach Streitwert
- Wortlaut Art. 2 Abs. 1: «Die urteilende Instanz setzt die Parteientschädigung der obsiegenden Partei nach Ermessen fest.» (Abs. 2: massgeblicher in Rechnung gestellter Betrag; Art. 3 Abs. 1: üblicher Stundenansatz 210–270 Fr.)
- Quelle: gr-lex.gr.ch BR 310.250 (/api) · zitierte Betragsnorm Art. 2/3.

### AG — Bemessungsnorm §§ 6/7 AnwT (Zu-/Abschläge; Grundentschädigung § 3) · confidence mittel
- Kriterien: Zahl der Rechtsschriften und Verhandlungen · Umfang des Aktenmaterials · besondere Schwierigkeit · Mehrvertretung · Umfang der Beweiserhebung (Reduktion bis 50 % bei geringem Aufwand)
- Wortlaut § 6 Abs. 3: «Für zusätzliche Rechtsschriften und Verhandlungen erhöht sich die Grundentschädigung um je 5–30 %.» § 7 Abs. 2: «Erfordert ein Verfahren nur geringe Aufwendungen, vermindert sich die Entschädigung … um bis zu 50 %.»
- Quelle: gesetzessammlungen.ag.ch SAR 291.150 (/api) · zitierte Betragsnorm § 3 Abs. 1.

### TG — Bemessungsnorm § 2 HonTV · confidence hoch
- Kriterien: Streitwert (bei bestimmtem/bestimmbarem Streitwert) · notwendiger Zeitaufwand (familien-/nicht vermögensrechtlich, Strafsachen) · Bedeutung der Sache für die Parteien · Schwierigkeit (tatsächlich/rechtlich)
- Wortlaut § 2 Abs. 2: «Bei der Bemessung des Honorars sind auch die Bedeutung der Sache für die Parteien und die Schwierigkeit der Sache in tatsächlicher oder rechtlicher Hinsicht angemessen zu berücksichtigen.»
- Quelle: rechtsbuch.tg.ch RB 176.31 (/api) · zitierte Betragsnorm § 5.

### FR — Bemessungsnorm Art. 63 RJ · confidence hoch
- Kriterien: Art des Verfahrens (nature) · Schwierigkeit (difficulté) · Umfang (ampleur) · notwendiger Arbeitsaufwand · wirtschaftliches Interesse und Lage der Parteien (bei Detailfestsetzung: erforderliche Zeit, auf dem Spiel stehende Interessen)
- Wortlaut Abs. 2: «… l'autorité tiendra compte notamment de la nature, de la difficulté et de l'ampleur de la procédure et du travail nécessaire de l'avocat … ainsi que de l'intérêt et de la situation économiques des parties.»
- Quelle: bdlf.fr.ch RSF 130.11 (/api) · zitierte Betragsnorm Art. 64–66.

### TI — Bemessungsnorm Art. 11 Abs. 5 (RL 178.310) · confidence hoch
- Kriterien: Bedeutung des Streits (importanza) · Schwierigkeit (difficoltà) · Umfang der Arbeit (ampiezza) · aufgewendete Zeit (tempo) · Verlauf des Mandats (svolgimento)
- Wortlaut: «Le ripetibili sono fissate, entro i limiti … secondo l'importanza della lite, le sue difficoltà, l'ampiezza del lavoro e il tempo impiegato dall'avvocato, avuto riguardo dello svolgimento del patrocinio.»
- Quelle: ti.ch RL 178.310 (amtl. PDF) · zitierte Norm = Art. 11 (cpv. 1 Tabelle / cpv. 5 Kriterien).

### VD — Bemessungsnorm Art. 3 Abs. 2 TDC · confidence hoch
- Kriterien: Bedeutung der Sache (importance) · Schwierigkeiten (difficultés) · Umfang der Arbeit (ampleur du travail) · aufgewendete Zeit (temps consacré)
- Wortlaut: «… le défraiement est fixé … en considération de l'importance de la cause, de ses difficultés, de l'ampleur du travail et du temps consacré par l'avocat ou l'agent d'affaires breveté.»
- Quelle: lexfind.ch BLV 270.11.6 (amtl. PDF, Stand 01.05.2019) · zitierte Betragsnorm Art. 4.

### VS — Bemessungsnorm Art. 27 Abs. 1 LTar · confidence hoch
- Kriterien: Natur und Bedeutung der Sache · Schwierigkeiten · Umfang der Arbeit · sinnvoll aufgewendete Zeit · finanzielle Lage der Partei
- Wortlaut: «Les honoraires sont fixés entre un minimum et un maximum … d'après la nature et l'importance de la cause, ses difficultés, l'ampleur du travail, le temps utilement consacré par le conseil juridique, et la situation financière de la partie.»
- Quelle: lex.vs.ch SR-VS 173.8 (/api) · zitierte Betragsnorm Art. 32.

### NE — Bemessungsnorm Art. 58 LTFrais · confidence hoch
- Kriterien: Streitwert · erforderliche Zeit · Natur und Bedeutung · Schwierigkeit · erzieltes Ergebnis · übernommene Verantwortung
- Wortlaut Abs. 2: «Ils sont fixés … en fonction du temps nécessaire à la cause, de sa nature, de son importance, de sa difficulté, du résultat obtenu ainsi que de la responsabilité encourue par le représentant.»
- Quelle: rsn.ne.ch RSN 164.1 · zitierte Betragsnorm Art. 59.

### GE — Bemessungsnorm Art. 84 RTFMC (Modulation ±10 % Art. 85) · confidence hoch
- Kriterien: Streitwert (proportionnel) · Bedeutung der Sache (importance) · Schwierigkeiten (difficultés) · Umfang der Arbeit (ampleur du travail) · aufgewendete Zeit (temps employé)
- Wortlaut Art. 84: «Le défraiement … est … proportionnel à la valeur litigieuse. … il est fixé d'après l'importance de la cause, ses difficultés, l'ampleur du travail et le temps employé.»
- Quelle: silgeneve.ch rsGE E 1 05.10 · zitierte Norm = Art. 84/85.

### JU — Bemessungsnorm Art. 8 Abs. 1 (i.V.m. Art. 13) Ordonnance honoraires d'avocat · confidence hoch
- Kriterien: Art der Sache (nature) · Bedeutung (Streitwert) · Schwierigkeit (tatsächlich/rechtlich) · übernommene Verantwortung · Arbeit des Anwalts (Zuschlag bis 75 % bei ausserordentlichem Aufwand, Art. 13 Abs. 2)
- Wortlaut Art. 8: «… la nature de la cause; l'importance de la cause, notamment … sa valeur litigieuse …; la difficulté en fait et en droit; la responsabilité que l'avocat a assumée; le travail de l'avocat; le contenu de la note d'honoraires …»
- Quelle: rsju.jura.ch RSJU 188.61 (amtl. PDF) · zitierte Betragsnorm Art. 7 (Stundenansatz). **Titelkorrektur** (s. oben).

---

## Pflegebedarf
- Kriterien sind datierte Normtexte → Kandidaten fürs Verfallsregister nur bei
  Norm-Revision; primär über `check:*`-Drift der Basistarife mitgezogen.
- Bei fachlicher Abnahme (David, ab Feb 2027): die 7 mittel-Confidence-Einträge
  (SZ gk, OW pe, AI gk, AG pe, UR pe, BE pe, ZH gk/pe) zeichengenau am Volltext
  gegenlesen; GR gk erneut prüfen, ob eine Kriteriennorm nachträglich ergänzt
  wurde.
