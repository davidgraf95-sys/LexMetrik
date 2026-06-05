# StPO-Zuständigkeiten — Regelwerk (Deep Research)

**Erstellt:** 5.6.2026 · **Wortlaut-Quelle:** Fedlex SR 312.0, Stand 1.1.2024
(Cache /tmp/stpo.html) · **Abrufdatum: 5.6.2026**
**Status: Arbeitsgrundlage für den Rechtsweg «Straf» — NICHT abgenommen.
BGE/BStGer-Zitate teils aus Vor-StPO-Zeit bzw. Beschwerdekammer-Praxis,
vor Verwendung rückverifizieren (im Bericht je gekennzeichnet).**

## TEIL 1 — Sachlich/funktionell (Art. 12–28) + Verfahrensarten

_(Bericht ausstehend — wird hier ergänzt.)_

---

# StPO-Zuständigkeiten Teil 2 — Örtlicher Gerichtsstand (Art. 31–42 StPO)

**Quelle:** Fedlex SR 312.0, Schweizerische Strafprozessordnung, Stand am 1. Januar 2024 (lokaler Cache `/tmp/stpo.html`, geltende Konsolidierung). Abrufdatum 5.6.2026. Wortlaut verbatim verifiziert.
**Systematische Stellung:** 1. Titel, 2. Kapitel «Gerichtsstand» (Art. 31–42), unterteilt in 1. Abschnitt «Grundsätze» (31–37), 2. Abschnitt «Besondere Gerichtsstände» (38) und 3. Abschnitt «Verfahren» (39–42). Dem **sachlichen** Bezug nach setzt das ganze Kapitel die Verneinung der **Bundesgerichtsbarkeit** (Art. 23/24) bzw. die kantonale Strafhoheit voraus — die örtliche Frage ist nachgelagert.

**Hinweis zur Belegbarkeit:** Die zitierte Rechtsprechung beruht überwiegend auf publizierten Entscheiden der **Beschwerdekammer des Bundesstrafgerichts** (BStGer, Sammlung «TPF»/Geschäftsnummern BG.xxxx) sowie auf BGE/BGer. Wo kein BGE direkt einschlägig ist, ist auf Sekundärliteratur (BSK StPO / Kommentar Schmid-Jositsch) verwiesen. BStGer-Entscheide sind **nicht** als BGE markiert; sie sind als solche gekennzeichnet, weil die Gerichtsstandskonflikte zwischen Kantonen seit 2011 abschliessend vom BStGer (Art. 40 Abs. 2) entschieden werden.

---

## Art. 31 — Gerichtsstand des Tatortes (Grundsatz)

**(1) Wortlaut-Kern**
- Abs. 1: Zuständig sind die Behörden des Ortes, **an dem die Tat verübt worden ist** (Begehungsort/Handlungsort). Liegt **nur der Erfolgsort** in der Schweiz, sind dessen Behörden zuständig.
- Abs. 2: Bei **Tat an mehreren Orten** oder **Erfolg an mehreren Orten** → Behörden des Ortes, an dem **zuerst Verfolgungshandlungen** vorgenommen worden sind.
- Abs. 3: Mehrere Verbrechen/Vergehen/Übertretungen **am selben Ort** durch dieselbe beschuldigte Person → Verfahren werden **vereint**.

**(2) Regel/Prüfreihenfolge**
1. Primär: **Begehungsort** (Ort der Tathandlung) = ordentlicher Gerichtsstand.
2. Subsidiär: Liegt nur der **Erfolgsort** in der Schweiz → Erfolgsort (Ubiquitätsprinzip, abgeleitet von Art. 8 StGB).
3. Bei Mehrheit von Begehungs-/Erfolgsorten greift das **Prioritätsprinzip** (Abs. 2): forum praeventionis — wo **zuerst** eine Verfolgungshandlung (erste prozessuale Untersuchungshandlung gegen eine bestimmte Person, z.B. Einvernahme, Hausdurchsuchung, Vorführungsbefehl) erfolgte.
4. Abs. 3: Konzentration mehrerer gleichortiger Delikte derselben Person.

**(3) Abgrenzung**
- Gegen Art. 32: greift erst, wenn Tatort **in der Schweiz** überhaupt feststellbar; Auslands-/ungewisser Tatort → Art. 32.
- Gegen Art. 34: Art. 31 Abs. 3 betrifft **mehrere Taten am selben Ort**; Art. 34 die **mehreren Taten an verschiedenen Orten** (dann «schwerste Tat»).
- «Verfolgungshandlung» ist enger als blosse Anzeige/Strafantrag: erforderlich ist eine nach aussen tretende Untersuchungshandlung der Behörde.

**(4) Rechtsprechung**
- BGE 76 IV 262 (Begriff Begehungsort/Erfolgsort, fortgeltend unter StPO).
- BStGer-Praxis zum Begriff der «ersten Verfolgungshandlung» als forum praeventionis (vgl. statt vieler BStGer BG.2011.x ff.; ferner Beschluss-Reihe TPF 2011 ff.).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 31 N 1 ff.; Schmid/Jositsch, Handbuch, N 433 ff.

**(5) Engine-Hinweis (Eingaben → forum)**
- Inputs: `begehungsort_kanton`, `erfolgsort_kanton`, `erfolg_nur_CH` (bool), `verfolgungshandlung_zuerst_kanton`, `mehrere_orte` (bool).
- Logik: `if !mehrere_orte → forum = begehungsort ?? (erfolg_nur_CH ? erfolgsort : null)`; `if mehrere_orte → forum = verfolgungshandlung_zuerst_kanton` (Prioritätsprinzip). Mehrere Taten **gleicher Ort** → Vereinigung (flag `vereinigung=true`).

---

## Art. 32 — Gerichtsstand bei Auslandstaten oder ungewissem Tatort

**(1) Wortlaut-Kern**
- Abs. 1: Tat im **Ausland** verübt **oder** Tatort **nicht ermittelbar** → Behörden des **Wohnsitzes oder gewöhnlichen Aufenthalts** der beschuldigten Person.
- Abs. 2: Kein Wohnsitz/Aufenthalt in der Schweiz → Behörden des **Heimatortes**; fehlt auch dieser → Behörden des Ortes, an dem die Person **angetroffen** worden ist (Ergreifungsort).
- Abs. 3: Fehlt ein Gerichtsstand nach Abs. 1/2 → Behörden des **Kantons, der die Auslieferung verlangt** hat.

**(2) Regel/Prüfreihenfolge — Kaskade**
**Wohnsitz/gewöhnlicher Aufenthalt → Heimatort → Ergreifungsort → auslieferungsersuchender Kanton.** Strikt subsidiär: jede nachfolgende Stufe nur, wenn die vorherige fehlt.

**(3) Abgrenzung**
- Voraussetzung: schweizerische Strafhoheit nach Art. 3–8 StGB besteht (Art. 32 regelt nur den **innerstaatlichen** örtlichen Anknüpfungspunkt, nicht die Frage **ob** die Schweiz zuständig ist).
- Gegen Art. 31: Art. 32 ist subsidiär — nur wenn **kein** inländischer Tatort feststellbar.
- Wohnsitzbegriff: zivilrechtlich (Art. 23 ZGB), gewöhnlicher Aufenthalt = tatsächlicher Lebensmittelpunkt.

**(4) Rechtsprechung**
- BStGer-Praxis zur Kaskade Wohnsitz/Aufenthalt/Heimat/Ergreifung (BG.20xx-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 32; Schmid/Jositsch, N 444 ff.

**(5) Engine-Hinweis**
- Inputs: `tat_im_ausland` (bool), `tatort_ermittelbar` (bool), `wohnsitz_kanton`, `gewoehnlicher_aufenthalt_kanton`, `heimatort_kanton`, `ergreifungsort_kanton`, `auslieferung_verlangt_kanton`.
- Logik (Kaskade, erstes nicht-leeres gewinnt): `forum = wohnsitz ?? aufenthalt ?? heimatort ?? ergreifungsort ?? auslieferungskanton`. Trigger nur wenn `tat_im_ausland || !tatort_ermittelbar`.

---

## Art. 33 — Gerichtsstand im Falle mehrerer Beteiligter

**(1) Wortlaut-Kern**
- Abs. 1: **Teilnehmer** (Anstifter, Gehilfen) werden von denselben Behörden verfolgt/beurteilt wie der/die **Täter** (Akzessorietät des Gerichtsstands → Forum der Haupttäterschaft).
- Abs. 2: Tat von **mehreren Mittätern** → Behörden des Ortes, an dem **zuerst Verfolgungshandlungen** vorgenommen worden sind (Prioritätsprinzip).

**(2) Regel/Prüfreihenfolge**
1. **Teilnahme** (akzessorisch): Gerichtsstand folgt dem Forum des **Täters** (zuerst Täterforum nach Art. 31/34 bestimmen, dann Teilnehmer dort).
2. **Mittäterschaft**: kein Haupttäter-Anker → **forum praeventionis** (erste Verfolgungshandlung).

**(3) Abgrenzung**
- Unterscheidung Teilnehmer (Abs. 1, akzessorisch) vs. Mittäter (Abs. 2, Prioritätsprinzip) entscheidend.
- Zusammenspiel mit Art. 34: hat **ein** Mittäter zugleich mehrere Taten an verschiedenen Orten begangen, ist erst dessen Forum nach Art. 34 (schwerste Tat) zu bestimmen, dann ziehen die übrigen Beteiligten nach.
- «Mehrere Beteiligte» überlagert oft Art. 34 (mehrere Taten); Praxis: Anknüpfung an die schwerste Tat des Hauptbeteiligten kombiniert mit Prioritätsprinzip.

**(4) Rechtsprechung**
- BGE 121 IV 224 (Gerichtsstand bei Mittäterschaft/Teilnahme, fortgeltende Grundsätze).
- BGE 109 IV 56 (Anknüpfung Teilnehmer an Täterforum).
- BStGer-Praxis zur Kombination Art. 33/34.
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 33.

**(5) Engine-Hinweis**
- Inputs: `rolle` (taeter | teilnehmer | mittaeter), `taeter_forum_kanton`, `verfolgungshandlung_zuerst_kanton`.
- Logik: `if rolle==teilnehmer → forum = taeter_forum`; `if rolle==mittaeter (kein Haupttäter) → forum = verfolgungshandlung_zuerst_kanton`. Vorlauf: Täterforum via Art. 31/34 berechnen.

---

## Art. 34 — Gerichtsstand bei mehreren an verschiedenen Orten verübten Straftaten

**(1) Wortlaut-Kern**
- Abs. 1: Mehrere Taten **verschiedener Orte** durch dieselbe Person → für **sämtliche** Taten zuständig die Behörden des Ortes der **mit der schwersten Strafe bedrohten Tat**. Bei **gleicher Strafdrohung** → Ort der **zuerst** vorgenommenen Verfolgungshandlung.
- Abs. 2: Ist im Zeitpunkt des Gerichtsstandsverfahrens (Art. 39–42) in einem beteiligten Kanton wegen einer Tat **schon Anklage erhoben** → Verfahren werden **getrennt** geführt.
- Abs. 3: Mehrere gleichartige Strafen durch verschiedene Gerichte → das Gericht der **schwersten Strafe** setzt auf Gesuch eine **Gesamtstrafe** fest (materiell, Art. 49 StGB).

**(2) Regel/Prüfreihenfolge**
1. Identifiziere die **abstrakt schwerste Strafdrohung** (Strafrahmen-Obergrenze des jeweiligen Tatbestands, **abstrakt**, nicht konkret) → Forum dort.
2. **Tie-Break** bei gleicher Strafdrohung: **Prioritätsprinzip** (erste Verfolgungshandlung).
3. Schranke (Abs. 2): bereits **erhobene Anklage** in einem Kanton sperrt die Vereinigung → Trennung.

**(3) Abgrenzung**
- Gegen Art. 31 Abs. 3: dort **gleicher** Ort; hier **verschiedene** Orte.
- «Schwerste Strafe» = **abstrakte** Strafdrohung des Delikts (Verbrechen > Vergehen > Übertretung; bei gleicher Kategorie höhere Strafrahmenobergrenze), gefestigte Praxis.
- Abs. 3 ist **materielles** Gesamtstrafrecht (nicht eigentlicher Gerichtsstand), aber im Kapitel verortet.

**(4) Rechtsprechung**
- BGE 76 IV 264 / BGE 71 IV 56 (Anknüpfung an abstrakt schwerste Strafdrohung — tradiert).
- BStGer-Praxis BG-Reihe zum «forum der schwersten Tat» und zur Anklageerhebungs-Schranke (Abs. 2).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 34; Schmid/Jositsch, N 449 ff.

**(5) Engine-Hinweis**
- Inputs: Liste `taten[]` mit `{ort_kanton, strafdrohung_max}`, `verfolgungshandlung_zuerst_kanton`, `anklage_erhoben_kanton` (optional).
- Logik: `schwerste = max(taten, key=strafdrohung_max)`; `if mehrere mit gleicher max → forum = verfolgungshandlung_zuerst_kanton, else forum = schwerste.ort`. `if anklage_erhoben → flag trennung=true` (keine Vereinigung).

---

## Art. 35 — Gerichtsstand bei Medienstraftaten

**(1) Wortlaut-Kern**
- Abs. 1: In der Schweiz begangene Tat nach **Art. 28 StGB** → Behörden am **Sitz des Medienunternehmens**.
- Abs. 2: Autor **bekannt** und mit Wohnsitz/gewöhnlichem Aufenthalt in der Schweiz → **auch** dessen Wohnsitz-/Aufenthaltsbehörden zuständig; Verfahren dort, wo **zuerst** Verfolgungshandlungen erfolgten. Bei **Antragsdelikten** wählt die antragstellende Person zwischen den beiden Gerichtsständen.
- Abs. 3: Kein Forum nach Abs. 1/2 → **Verbreitungsort**; bei mehreren Verbreitungsorten → **forum praeventionis**.

**(2) Regel/Prüfreihenfolge**
1. Primär: **Sitz Medienunternehmen** (Abs. 1).
2. Alternativ (kumulativ) bei bekanntem inländischem Autor: dessen Wohnsitz/Aufenthalt; Konkretisierung via Prioritätsprinzip; bei Antragsdelikten **Wahlrecht** des Antragstellers.
3. Subsidiär: **Verbreitungsort** (Abs. 3), bei Mehrheit Prioritätsprinzip.

**(3) Abgrenzung**
- Spezialforum gegenüber Art. 31 (Tatort), das den diffusen Erfolgsort bei Medien durch Sitz/Verbreitung ersetzt.
- Verzahnung mit dem materiellen Medienstrafrecht (Art. 28 StGB, Kaskadenhaftung Autor → verantwortliche Redaktion → Verlag).

**(4) Rechtsprechung**
- BStGer-Praxis zum Medien-Gerichtsstand (BG-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 35; Riklin, Medienstrafrecht.

**(5) Engine-Hinweis**
- Inputs: `medienunternehmen_sitz_kanton`, `autor_bekannt` (bool), `autor_wohnsitz_kanton`, `antragsdelikt` (bool), `verbreitungsort_kanton`, `verfolgungshandlung_zuerst_kanton`.
- Logik: `forum_set = [sitz]`; `if autor_bekannt && autor_wohnsitz_CH → forum_set += autor_wohnsitz`; `if antragsdelikt → wahlrecht=true (Antragsteller wählt)`; `if forum_set leer → forum = verbreitungsort` (bei Mehrheit `verfolgungshandlung_zuerst`).

---

## Art. 36 — Gerichtsstand bei Betreibungs-/Konkursdelikten und Unternehmensverfahren

**(1) Wortlaut-Kern**
- Abs. 1: SchKG-Delikte nach **Art. 163–171 StGB** → Behörden am **Wohnsitz, gewöhnlichen Aufenthalt oder Sitz des Schuldners**.
- Abs. 2: Strafverfahren **gegen das Unternehmen** nach **Art. 102 StGB** → Behörden am **Sitz des Unternehmens**; ebenso, wenn sich das Verfahren wegen desselben Sachverhalts **auch gegen eine für das Unternehmen handelnde Person** richtet.
- Abs. 3: Fehlt ein Forum nach Abs. 1/2 → Bestimmung nach **Art. 31–35**.

**(2) Regel/Prüfreihenfolge**
1. SchKG-Delikt (163–171 StGB) → **Schuldner-Anknüpfung** (Wohnsitz/Aufenthalt/Sitz).
2. Unternehmensstrafe (Art. 102 StGB) → **Unternehmenssitz** (mit Sog-Wirkung auf die natürliche Person bei Sachverhaltsidentität).
3. Auffang: zurück zu Art. 31–35.

**(3) Abgrenzung**
- Spezialforum, das die häufig diffuse Tatortbestimmung bei Vermögens-/SchKG-Delikten durch die **Sitz-/Schuldneranknüpfung** ersetzt.
- Abs. 2 schafft eine **Konzentration** beim Unternehmenssitz, um Parallelverfahren (Unternehmen + handelnde Person) zu bündeln.

**(4) Rechtsprechung**
- BStGer-Praxis zum SchKG-Gerichtsstand und zur Sitzanknüpfung Art. 102 StGB (BG-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 36.

**(5) Engine-Hinweis**
- Inputs: `deliktstyp` (schkg_163_171 | unternehmen_102 | other), `schuldner_sitz_kanton`, `unternehmen_sitz_kanton`, `gleicher_sachverhalt_natuerliche_person` (bool).
- Logik: `if schkg → forum = schuldner_sitz`; `if unternehmen_102 → forum = unternehmen_sitz (Sog auch für nat. Person bei gleichem SV)`; `else → fallthrough Art.31–35`.

---

## Art. 37 — Gerichtsstand bei selbstständigen Einziehungen

**(1) Wortlaut-Kern**
- Abs. 1: Selbstständige Einziehungen (**Art. 376–378 StPO**) → Ort, an dem sich die **einzuziehenden Gegenstände/Vermögenswerte befinden** (Belegenheitsort).
- Abs. 2: Gegenstände/Werte in **mehreren Kantonen** und aufgrund **gleicher Straftat/Täterschaft** im Zusammenhang → Behörden des Ortes, an dem das **Einziehungsverfahren zuerst eröffnet** worden ist.

**(2) Regel/Prüfreihenfolge**
1. **Belegenheitsort** der Gegenstände/Vermögenswerte.
2. Bei Streuung über mehrere Kantone mit Konnex → **forum praeventionis** (erste Verfahrenseröffnung).

**(3) Abgrenzung**
- Betrifft nur die **selbstständige** (objektive) Einziehung ohne Hauptverfahren gegen eine Person; bei **akzessorischer** Einziehung folgt der Gerichtsstand dem Hauptverfahren (Art. 31 ff.).

**(4) Rechtsprechung**
- BStGer-Praxis zum Belegenheitsforum (BG-Reihe).
- Sekundär: BSK StPO–Baumann/Bommer; Schmid/Jositsch zu Art. 376 ff.

**(5) Engine-Hinweis**
- Inputs: `selbststaendige_einziehung` (bool), `belegenheit_kanton[]`, `eroeffnung_zuerst_kanton`.
- Logik: `if !selbststaendige → folgt Hauptverfahren`; `else → forum = (belegenheit.length==1 ? belegenheit[0] : eroeffnung_zuerst_kanton)`.

---

## Art. 38 — Bestimmung eines abweichenden Gerichtsstands (Vereinbarung/Überweisung)

**(1) Wortlaut-Kern**
- Abs. 1: Die **Staatsanwaltschaften** können untereinander einen **anderen** als den Art. 31–37-Gerichtsstand **vereinbaren**, wenn der **Schwerpunkt der deliktischen Tätigkeit** oder die **persönlichen Verhältnisse** der beschuldigten Person es erfordern **oder andere triftige Gründe** vorliegen.
- Abs. 2: Zur **Wahrung der Verfahrensrechte** einer Partei kann die **Beschwerdeinstanz des Kantons** — auf Antrag oder von Amtes wegen — **nach Anklageerhebung** die Beurteilung abweichend einem **andern sachlich zuständigen erstinstanzlichen Gericht desselben Kantons** überweisen.

**(2) Regel/Prüfreihenfolge**
1. **Konsensueller** abweichender Gerichtsstand (Abs. 1): StA-StA-Vereinbarung, an materielle Voraussetzungen geknüpft (Schwerpunkt/persönliche Verhältnisse/triftige Gründe).
2. **Intra-kantonale** Überweisung (Abs. 2): durch Beschwerdeinstanz, nach Anklage, nur an **anderes Gericht desselben Kantons**.

**(3) Abgrenzung**
- Abs. 1 = **interkantonal/StA-Ebene**, Disposition über den ordentlichen Gerichtsstand (innerhalb der gesetzlichen Voraussetzungen).
- Abs. 2 = **innerkantonal/Gerichtsebene** nach Anklage.
- Pendant Art. 40 Abs. 3: dieselben materiellen Gründe (Schwerpunkt/persönliche Verhältnisse/triftige Gründe) gelten für die **autoritative** Festlegung durch die Konfliktbehörde.
- Schranke Art. 42 Abs. 3: ein nach Art. 38 festgelegter Gerichtsstand ist nur aus **neuen wichtigen Gründen** und nur **vor Anklageerhebung** änderbar.

**(4) Rechtsprechung**
- BStGer-Praxis zur Auslegung von «triftigen Gründen» und «Schwerpunkt der deliktischen Tätigkeit» (BG-Reihe; analog zu Art. 40 Abs. 3).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 38.

**(5) Engine-Hinweis**
- Inputs: `sta_vereinbarung` (bool), `vereinbarter_kanton`, `grund` (schwerpunkt | persoenliche_verhaeltnisse | triftig), `nach_anklage_intrakantonal` (bool).
- Logik: `if sta_vereinbarung && grund∈{…} → forum = vereinbarter_kanton (override Art.31–37)`. Markiere als **dispositiv**; Sperre via Art. 42 Abs. 3.

---

## Art. 39 — Prüfung der Zuständigkeit und Einigung

**(1) Wortlaut-Kern**
- Abs. 1: Strafbehörden prüfen ihre Zuständigkeit **von Amtes wegen** und leiten den Fall nötigenfalls weiter.
- Abs. 2: Erscheinen mehrere Behörden örtlich zuständig → beteiligte Staatsanwaltschaften **informieren sich unverzüglich** über die wesentlichen Elemente und bemühen sich um **rasche Einigung**.

**(2) Regel/Prüfreihenfolge**
1. **Amtswegige** Zuständigkeitsprüfung jeder Behörde.
2. Bei Konkurrenz: **Einigungsverfahren** zwischen den StA (informeller, primärer Konfliktlösungsmechanismus **vor** Art. 40).

**(3) Abgrenzung**
- Art. 39 ist die **Vorstufe** zum förmlichen Konfliktentscheid (Art. 40): Erst Einigungsversuch, dann Anrufung der Konfliktbehörde.
- Entscheid nach Art. 39 Abs. 2 ist von den Parteien gemäss **Art. 41 Abs. 2** anfechtbar.

**(4) Rechtsprechung**
- BStGer-Praxis zur Pflicht des unverzüglichen Meinungsaustauschs (BG-Reihe).
- Sekundär: BSK StPO–Schweri/Bänziger-Nachfolge; Schmid/Jositsch.

**(5) Engine-Hinweis**
- Verfahrensschritt, kein Forum-Rechner. Inputs: `mehrere_zustaendig` (bool) → `trigger einigungsverfahren`. Output-Flag `einigung_versucht` als Vorbedingung für Art. 40.

---

## Art. 40 — Gerichtsstandskonflikte (Konflikt-Entscheid)

**(1) Wortlaut-Kern**
- Abs. 1: Streit **innerhalb desselben Kantons** → Entscheid durch **Ober- oder Generalstaatsanwaltschaft**, mangels solcher durch die **Beschwerdeinstanz** des Kantons.
- Abs. 2: Können sich Behörden **verschiedener Kantone** nicht einigen → die StA des **zuerst befassten** Kantons unterbreitet die Frage **unverzüglich, in jedem Fall vor Anklageerhebung**, dem **Bundesstrafgericht** zum Entscheid.
- Abs. 3: Die Konfliktbehörde kann einen **abweichenden** Gerichtsstand (statt Art. 31–37) festlegen — bei **Schwerpunkt** der deliktischen Tätigkeit, **persönlichen Verhältnissen** oder **anderen triftigen Gründen**.

**(2) Regel/Prüfreihenfolge**
1. **Intra-kantonaler** Konflikt → Ober-/Generalstaatsanwaltschaft (subsidiär Beschwerdeinstanz).
2. **Inter-kantonaler** Konflikt → **Beschwerdekammer BStGer** (Anrufung durch zuerst befassten Kanton, zwingend vor Anklage).
3. Materiell: Konfliktbehörde wendet Art. 31–37 an, kann aber nach Abs. 3 (= Pendant zu Art. 38 Abs. 1) **abweichen**.

**(3) Abgrenzung**
- Forum für **Behörden**streit; die **Partei**anfechtung folgt aus Art. 41.
- Zeitliche Schranke: **vor Anklageerhebung** (forum prorogatum nachher gesperrt; vgl. Art. 42 Abs. 3).
- Zuständigkeit BStGer (Art. 40 Abs. 2) i.V.m. Art. 37 Abs. 2 lit. b StBOG.

**(4) Rechtsprechung**
- Gefestigte BStGer-Beschwerdekammer-Praxis (BG-Geschäftsnummern) zur interkantonalen Gerichtsstandsfestlegung; Massstab «triftige Gründe» / «Schwerpunkt».
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 40; Schmid/Jositsch, N 460 ff.

**(5) Engine-Hinweis**
- Inputs: `konflikt_intra_kanton` (bool), `zuerst_befasst_kanton`, `abweichungsgrund`.
- Logik: `if intra → konfliktbehörde = Ober-/Generalstaatsanwaltschaft (else Beschwerdeinstanz)`; `if inter → konfliktbehörde = BStGer, antragspflichtig = zuerst_befasst_kanton, frist = vor_anklage`. Möglicher Override-Forum wie Art. 38 Abs. 1.

---

## Art. 41 — Anfechtung des Gerichtsstands durch die Parteien

**(1) Wortlaut-Kern**
- Abs. 1: Will eine Partei die Zuständigkeit anfechten, hat sie der befassten Behörde **unverzüglich** die **Überweisung** an die zuständige Behörde zu **beantragen**.
- Abs. 2: Gegen die StA-Entscheidung über den Gerichtsstand (**Art. 39 Abs. 2**) können die Parteien **innert 10 Tagen** bei der nach **Art. 40** zuständigen Behörde **Beschwerde** führen. Bei **vereinbartem** abweichendem Gerichtsstand (Art. 38 Abs. 1) steht die Beschwerde **nur jener Partei** offen, deren Antrag nach Abs. 1 **abgewiesen** wurde.

**(2) Regel/Prüfreihenfolge**
1. Zuerst **Überweisungsantrag** an die befasste Behörde (Abs. 1).
2. Bei Abweisung/StA-Entscheid → **Beschwerde innert 10 Tagen** an die Konfliktbehörde (Art. 40).
3. Bei vereinbartem Forum (Art. 38 Abs. 1): **eingeschränkte** Legitimation (nur die unterlegene Partei).

**(3) Abgrenzung**
- Art. 41 = **Partei**rechtsmittel; Art. 40 = **Behörden**konflikt. Beide münden in die gleiche Konfliktbehörde.
- Frist (10 Tage) ist Verwirkungsfrist.

**(4) Rechtsprechung**
- BStGer-Praxis zur Legitimation und 10-Tages-Frist (BG-Reihe).
- BGE 138 IV 214 (Anfechtung des Gerichtsstands / Beschwerdebefugnis im Gerichtsstandsverfahren — einschlägige BGer-Praxis).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 41.

**(5) Engine-Hinweis**
- Inputs: `partei_anfechtung` (bool), `ueberweisungsantrag_gestellt` (bool), `frist_tage=10`, `vereinbarter_gerichtsstand` (bool), `antrag_abgewiesen` (bool).
- Logik: Verfahrensvalidierung — `beschwerde_zulaessig = ueberweisungsantrag_gestellt && (!vereinbarter_gerichtsstand || antrag_abgewiesen) && innerhalb_frist`.

---

## Art. 42 — Gemeinsame Bestimmungen (Festhalten am bestimmten Forum)

**(1) Wortlaut-Kern**
- Abs. 1: Bis zur **verbindlichen** Gerichtsstandsbestimmung trifft die **zuerst befasste** Behörde die **unaufschiebbaren Massnahmen**; nötigenfalls bezeichnet die Konfliktbehörde die vorläufig zuständige Behörde.
- Abs. 2: **Verhaftete** Personen werden anderen Kantonen erst **nach** verbindlicher Zuständigkeitsbestimmung zugeführt.
- Abs. 3: Ein nach **Art. 38–41** festgelegter Gerichtsstand kann **nur aus neuen wichtigen Gründen** und **nur vor Anklageerhebung** geändert werden (**Perpetuatio fori**).

**(2) Regel/Prüfreihenfolge**
1. **Provisorische Zuständigkeit** (zuerst befasste Behörde) für Dringliches.
2. **Haftüberführung** erst nach Verbindlichkeit.
3. **Festhaltegrundsatz** (Abs. 3): einmal bestimmtes Forum bleibt; Änderung nur ausnahmsweise (neue wichtige Gründe) und nur vor Anklage.

**(3) Abgrenzung**
- Abs. 3 ist die zentrale **Stabilitätsregel** (perpetuatio fori): zementiert das nach Art. 38–41 festgelegte Forum und korrespondiert mit der Zeitschranke «vor Anklageerhebung» in Art. 40 Abs. 2.

**(4) Rechtsprechung**
- BStGer-Praxis zur perpetuatio fori und zum Massstab «neue wichtige Gründe» (BG-Reihe).
- Sekundär: BSK StPO–Bartetzko/Fingerhuth, Art. 42; Schmid/Jositsch, N 465 ff.

**(5) Engine-Hinweis**
- Inputs: `forum_verbindlich_bestimmt` (bool), `nach_art_38_41` (bool), `neue_wichtige_gruende` (bool), `vor_anklage` (bool).
- Logik: `aenderung_zulaessig = nach_art_38_41 && neue_wichtige_gruende && vor_anklage`. Lock-Flag `perpetuatio_fori=true` nach verbindlicher Bestimmung.

---

## Engine-Synthese — Prüfreihenfolge (Decision Tree)

```
STUFE 0  Sachliche Zuständigkeit: Bundesgerichtsbarkeit (Art. 23/24)?
         JA → Bund/BStGer (örtliche Frage Art. 31 ff. NICHT prüfen).
         NEIN → kantonal, weiter Stufe 1.
STUFE 1  Spezialforum einschlägig?
         Medien (Art. 28 StGB)        → Art. 35
         SchKG 163–171 / Untern. 102  → Art. 36
         selbstständige Einziehung    → Art. 37
         sonst → Stufe 2.
STUFE 2  Grundforum Tatort (Art. 31):
         Tatort CH feststellbar?  JA → Begehungsort (bzw. nur-Erfolgsort);
                                       mehrere Orte → Prioritätsprinzip (erste Verfolgungshandlung).
                                  NEIN/Ausland → Art. 32 Kaskade
                                       (Wohnsitz→Heimat→Ergreifung→Auslieferungskanton).
STUFE 3  Mehrere Beteiligte (Art. 33): Teilnehmer→Täterforum; Mittäter→Prioritätsprinzip.
STUFE 4  Mehrere Taten versch. Orte (Art. 34): Forum der SCHWERSTEN Tat;
         gleichschwer → Prioritätsprinzip; Anklage erhoben → Trennung.
STUFE 5  Abweichung (Art. 38): StA-Vereinbarung (Schwerpunkt/pers. Verh./triftige Gründe).
STUFE 6  Konflikt (Art. 39 Einigung → Art. 40 Entscheid):
         intra-kantonal → Ober-/Generalstaatsanwaltschaft;
         inter-kantonal → BStGer-Beschwerdekammer (vor Anklage).
STUFE 7  Partei-Anfechtung (Art. 41): Überweisungsantrag → Beschwerde 10 Tage.
STUFE 8  Lock (Art. 42): perpetuatio fori; Änderung nur neue wichtige Gründe + vor Anklage.
```

## Konstellations-Tabelle (Konstellation → Forum → Norm)

| # | Konstellation | Forum-Ergebnis | Norm |
|---|---|---|---|
| 1 | Eine Tat, ein inländischer Begehungsort | Begehungsort | Art. 31 I |
| 2 | Nur Erfolgsort in der Schweiz | Erfolgsort | Art. 31 I S. 2 |
| 3 | Tat/Erfolg an mehreren Orten | Ort der **ersten Verfolgungshandlung** (Prioritätsprinzip) | Art. 31 II |
| 4 | Mehrere Delikte am **selben** Ort | Vereinigung am Tatort | Art. 31 III |
| 5 | Tat im Ausland / Tatort ungewiss | Wohnsitz→Heimatort→Ergreifungsort→Auslieferungskanton (Kaskade) | Art. 32 |
| 6 | Teilnehmer (Anstifter/Gehilfe) | Forum der **Täterschaft** (akzessorisch) | Art. 33 I |
| 7 | Mehrere Mittäter | Ort der **ersten Verfolgungshandlung** | Art. 33 II |
| 8 | Eine Person, mehrere Taten an versch. Orten | Ort der **schwersten Tat**; gleichschwer → Prioritätsprinzip | Art. 34 I |
| 9 | …aber Anklage in einem Kanton schon erhoben | **Getrennte** Verfahren | Art. 34 II |
| 10 | Medienstraftat (Art. 28 StGB) | **Sitz Medienunternehmen** (alt. Autor-Wohnsitz; subsidiär Verbreitungsort) | Art. 35 |
| 11 | SchKG-Delikt (163–171 StGB) | Wohnsitz/Aufenthalt/**Sitz des Schuldners** | Art. 36 I |
| 12 | Unternehmensstrafverfahren (Art. 102 StGB) | **Sitz des Unternehmens** (Sog auf nat. Person) | Art. 36 II |
| 13 | Selbstständige Einziehung | **Belegenheitsort**; mehrkantonal → erste Verfahrenseröffnung | Art. 37 |
| 14 | StA vereinbaren abweichendes Forum | **Vereinbarter** Kanton (Schwerpunkt/pers. Verh./triftige Gründe) | Art. 38 I |
| 15 | Innerkantonale Überweisung nach Anklage | Anderes Gericht **desselben** Kantons | Art. 38 II |
| 16 | Mehrere Behörden zuständig (Vorstufe) | Einigungsverfahren der StA | Art. 39 II |
| 17 | Konflikt **innerhalb** eines Kantons | Ober-/Generalstaatsanwaltschaft (subs. Beschwerdeinstanz) | Art. 40 I |
| 18 | Konflikt **zwischen** Kantonen | **BStGer-Beschwerdekammer** (zuerst befasster Kanton ruft an, vor Anklage) | Art. 40 II |
| 19 | Konfliktbehörde legt abweichendes Forum fest | Abweichung wie Art. 38 I | Art. 40 III |
| 20 | Partei ficht Gerichtsstand an | Überweisungsantrag → Beschwerde **10 Tage** an Art.-40-Behörde | Art. 41 |
| 21 | Unaufschiebbare Massnahmen vor Bestimmung | **Zuerst befasste** Behörde | Art. 42 I |
| 22 | Forum bereits festgelegt (Art. 38–41) | **Festhalten** (perpetuatio fori); Änderung nur neue wichtige Gründe + vor Anklage | Art. 42 III |

---

### Quervalidierung Prioritätsprinzip («forum praeventionis»)
Das Prinzip «zuerst Verfolgungshandlungen vorgenommen» kehrt als Tie-Break/Anknüpfung in **Art. 31 II, 33 II, 34 I S. 2, 35 II/III, 37 II** wieder — die Engine sollte es als **eine** wiederverwendbare Funktion `forum_praeventionis(kantone[])` modellieren.

### Wichtige Engine-Vorbedingung
Die **abstrakte Strafdrohung** (Art. 34) ist aus dem jeweiligen StGB-Tatbestand abzuleiten (Strafrahmen-Obergrenze), **nicht** aus der konkret zu erwartenden Strafe — dies ist die häufigste Fehlerquelle und sollte als Datenfeld `strafdrohung_max` (Monate/Jahre Freiheitsstrafe bzw. Kategorie) je Delikt geführt werden.

---

**Belegbarkeits-Caveat:** Die mit Geschäftsnummer-Reihen («BG-Reihe») bezeichneten BStGer-Entscheide sind als Spruchpraxis der Beschwerdekammer gekennzeichnet, nicht als amtlich publizierte BGE. Die explizit genannten BGE (76 IV 262/264, 71 IV 56, 109 IV 56, 121 IV 224, 138 IV 214) stammen teils aus der Zeit vor der StPO (aBStP), gelten aber für die Begriffe Begehungs-/Erfolgsort, abstrakte Strafdrohung und Teilnehmer-Akzessorietät als fortwirkend; vor Übernahme in das Repo-Regelwerk sollten sie gegen die aktuelle Fedlex-/BGer-Datenbank punktuell rückverifiziert werden (kein Online-Abruf im Rahmen dieses Auftrags). Der **Wortlaut der Art. 31–42** ist hingegen verbatim aus der geltenden Konsolidierung (Stand 1.1.2024) verifiziert.
