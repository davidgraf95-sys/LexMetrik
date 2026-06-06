# Konzept-Dossier — Fristenspiegel (EIN Ereignis → ALLE parallelen Fristen)

**Erstellt:** 6.6.2026 · **Bearbeiter:** Recherche-/Konzept-Agent (LexMetrik)
**Auftrag:** FAHRPLAN-PRAXIS Etappe 3.1 (David). Konzept ZUERST (§10/§11),
danach generischer Rahmen, dann Andocken je Rechtsgebiet.
**Status:** Erstrecherche / Konzept. **Fachliche Abnahme durch David ausstehend
(§7).** Dieses Dossier ändert KEINE Engine und KEINEN Rechner; es ist die
Bau-Vorbereitung für den «Fristenspiegel».

**Wortlaut-Quellen (Fedlex-Caches, abgerufen 6.6.2026, Anker `id="art_NNN"`):**
`/tmp/zpo.html` (SR 272, Stand 1.1.2025) · `/tmp/schkg.html` (SR 281.1) ·
`/tmp/or.html` (SR 220) · `/tmp/stpo.html` (SR 312.0, Stand 1.1.2024) ·
`/tmp/bgg.html` (SR 173.110) · `/tmp/zgb.html` (SR 210, Stand 1.1.2026).
Alle tragenden Artikel unten sind am Cache **verbatim verifiziert** (§7).

---

## 0. Leitidee und Abgrenzung

Der Praxis-Klassiker: EIN auslösendes Ereignis (eine Zustellung, ein Zugang,
ein Todesfall) startet GLEICHZEITIG mehrere Fristen mit unterschiedlicher
Länge, Natur, Stillstand-Behandlung und Adressat. Der Fristenspiegel zeigt sie
auf einen Blick.

**Architektur-Kernsatz (§5, nicht verhandelbar):** Der Fristenspiegel rechnet
NICHTS selbst. Er ist ein **Orchestrierer**, der je Frist die BEREITS
BESTEHENDE Engine bzw. das bestehende Preset aufruft und die Resultate
tabelliert. Jede Fristlänge, jeder Stillstand, jede Weiche lebt weiterhin an
genau einer Stelle (§3/§4). Das ist zugleich die §2-Garantie: Determinismus
erbt der Spiegel von den Engines.

**Was der Spiegel NICHT ist:** keine neue Rechtslogik, keine Heuristik
(«welches Ereignis liegt wohl vor»), keine Schätzung. Die QUALIFIKATION des
Ereignisses (begründeter vs. nur im Dispositiv eröffneter Entscheid;
Streitwert; summarisch/ordentlich; gesetzliche/eingesetzte Erbin) bleibt
Nutzer-Eingabe und wird als Weiche/Warnung offengelegt (§8).

---

## A. EREIGNIS-KATALOG

Konfidenz-Legende: **[V]** Wortlaut am Cache verifiziert · **[V-h.L.]**
verifiziert + von herrschender Lehre/BGE gestützt (Sekundärquelle) ·
**[?]** offen / Verifikations-TODO.

Spalten je Frist: Norm · Länge · Stillstand · Fristnatur · Quelle (welche
bestehende Engine/Preset rechnet sie HEUTE) · Bedingung/Weiche.

---

### A.1 — Zustellung erstinstanzlicher Zivilentscheid (begründet)

**Auslöser-Datum:** Zustellung des **begründeten** Entscheids (bzw.
nachträgliche Zustellung der Begründung, Art. 239 ZPO). Der Spiegel braucht
eine Weiche: nur Dispositiv eröffnet → zuerst Begründung verlangen (10 T.,
Art. 239 II), erst dann laufen Berufung/Beschwerde.

| Frist | Norm | Länge | Stillstand | Natur | Quelle (heute) | Weiche/Bedingung |
|---|---|---|---|---|---|---|
| Berufung | Art. 311 I ZPO **[V]** | 30 T. | Art. 145 (greift) | gesetzlich | `zpoPresets` key `berufung` | Streitwert ≥ 10 000 ODER nicht vermögensrechtlich; ordentliches/vereinf. Verfahren |
| Berufung summarisch | Art. 314 I ZPO **[V]** | 10 T. | **KEIN** (Art. 145 II b) | gesetzlich | `zpoPresets` key `berufung_summar` | Entscheid im summarischen Verfahren |
| Berufung familienr. Summarsache | Art. 314 II ZPO **[V]** | 30 T. | Art. 145 (Einzelfall) | gesetzlich | `zpoPresets` key `berufung_familienrecht` | Streitigkeit nach Art. 271/276/302/305 ZPO |
| Beschwerde | Art. 321 I ZPO **[V]** | 30 T. | Art. 145 (greift) | gesetzlich | `zpoPresets` key `beschwerde` | wenn Berufung nicht statthaft (Streitwert < 10 000, nicht berufungsfähig) |
| Beschwerde summarisch / andere erstinstanzl. | Art. 321 II ZPO **[V]** | 10 T. | **KEIN** (summarisch) | gesetzlich | `zpoPresets` key `beschwerde_summar` | summarischer Entscheid / prozessleitende Verfügung |
| Begründung verlangen | Art. 239 II ZPO **[V]** | 10 T. | Art. 145 (greift) | gesetzlich | `zpoPresets` key `begruendung` | NUR wenn bloss Dispositiv eröffnet (Vorstufe!) |
| Anschlussberufung | Art. 313 i.V.m. 312 II ZPO **[V]** | 30 T. (= Berufungsantwortfrist) | wie Berufung | gesetzlich | `zpoPresets` key `anschlussberufung` (30 T.) | **andere Triggerung** — siehe §D-Hinweis |
| BGer-Beschwerde (Folgestufe) | Art. 100 I BGG **[V]** | 30 T. | Art. 46 BGG (eigener Kalender!) | gesetzlich | `zpoPresets` key `schied_bger` (Hinweis) / `bgg-beschwerde-engine` [geplant] | erst NACH kantonalem Endentscheid — **NICHT im selben Spiegel** |

**Wortlaut-Belege:**
- Art. 311 I ZPO **[V]**: «Die Berufung ist bei der Rechtsmittelinstanz innert
  30 Tagen seit Zustellung des begründeten Entscheides … schriftlich und
  begründet einzureichen.»
- Art. 314 ZPO **[V]**: Abs. 1 «Gegen einen im summarischen Verfahren
  ergangenen Entscheid beträgt die Frist zur Einreichung der Berufung und zur
  Berufungsantwort je zehn Tage. Die Anschlussberufung ist unzulässig.» Abs. 2
  «Bei familienrechtlichen Streitigkeiten nach den Artikeln 271, 276, 302 und
  305 beträgt die Frist … je 30 Tage. Die Anschlussberufung ist zulässig.»
- Art. 321 ZPO **[V]**: Abs. 1 «… innert 30 Tagen seit der Zustellung des
  begründeten Entscheides …»; Abs. 2 «Wird ein im summarischen Verfahren
  ergangener Entscheid oder werden andere erstinstanzliche Entscheide und
  prozessleitende Verfügungen angefochten, so beträgt die Beschwerdefrist zehn
  Tage …»; Abs. 4 «Gegen Rechtsverzögerung kann jederzeit Beschwerde …».
- Art. 145 ZPO **[V]**: Abs. 1 Stillstand-Daten (Ostern / 15.7.–15.8. /
  18.12.–2.1.); Abs. 2 «Dieser Fristenstillstand gilt nicht für: a. das
  Schlichtungsverfahren; b. das summarische Verfahren.»; Abs. 4 (relevant für
  A.2!) «Die Bestimmungen dieses Gesetzes über den Stillstand der Fristen sind
  für alle Klagen nach dem SchKG, die vor einem Gericht einzureichen sind,
  anwendbar.»
- Art. 239 II ZPO **[V]**: «Eine schriftliche Begründung ist nachzuliefern,
  wenn eine Partei dies innert zehn Tagen seit der Eröffnung … verlangt. Wird
  keine Begründung verlangt, so gilt dies als Verzicht auf die Anfechtung …».
- Art. 313 ZPO **[V]**: «Die Gegenpartei kann in der Berufungsantwort
  Anschlussberufung erheben.» → **eigenständige Fristlänge fehlt im Wortlaut**;
  die Frist ist die 30-tägige Berufungsantwortfrist (Art. 312 II) und läuft
  ab Zustellung der Berufung an die Gegenpartei, **nicht** ab Urteilszustellung.

**§5-Befund:** Alle ZPO-Fristen dieses Ereignisses sind im Preset-Katalog
`src/lib/zpoPresets.ts` bereits vorhanden und werden von der ZPO-Fristen-Engine
(über `ZPO_LINK_SPEC` adressierbar) gerechnet. **NICHTS fehlt** ausser der
Bündelung. Konfidenz hoch **[V]**.

---

### A.2 — Zustellung des Zahlungsbefehls (SchKG)

**Auslöser-Datum:** Zustellung des Zahlungsbefehls.

| Frist | Norm | Länge | Stillstand | Natur | Quelle (heute) | Weiche/Bedingung |
|---|---|---|---|---|---|---|
| Rechtsvorschlag | Art. 74 I SchKG **[V]** | 10 T. | Betreibungsferien (Art. 56/63) | Frist | `schkgPresets` key `rechtsvorschlag` (`modus: schkg_betreibungsferien`) | Schuldner will bestreiten |
| Fortsetzungsbegehren — Wartefrist | Art. 88 I SchKG **[V]** | frühestens 20 T. | Betreibungsferien | (Wartefrist) | `schkgPresets` key `fortsetzungsbegehren` (`wartefrist`) | NUR wenn kein RV/keine Einstellung |
| Fortsetzungsbegehren — Verwirkung | Art. 88 II SchKG **[V]** | spätestens 1 Jahr | Betreibungsferien + Hemmung Art. 88 II Satz 2 | Verwirkung | `schkgPresets` key `fortsetzungsbegehren` (`verwirkung`, `hemmungMoeglich`) | Hemmung bei rechtsvorschlagsbedingtem Verfahren |
| (Folge bei RV) Rechtsöffnung/Aberkennung 20 T. | Art. 83 II SchKG **[V]** | 20 T. | **ZPO-Stillstand** Art. 145 IV | Verwirkung | `schkgPresets` key `aberkennungsklage` (`modus: zpo_stillstand`) | erst NACH prov. Rechtsöffnung — Folgestufe |

**Wortlaut-Belege:**
- Art. 74 I SchKG **[V]**: «Will der Betriebene Rechtsvorschlag erheben, so hat
  er dies sofort dem Überbringer des Zahlungsbefehls oder innert zehn Tagen
  nach der Zustellung dem Betreibungsamt … zu erklären.»
- Art. 88 SchKG **[V]**: Abs. 1 «… so kann der Gläubiger frühestens 20 Tage
  nach der Zustellung des Zahlungsbefehls das Fortsetzungsbegehren stellen.»
  Abs. 2 «Dieses Recht erlischt ein Jahr nach der Zustellung des
  Zahlungsbefehls. Ist Rechtsvorschlag erhoben worden, so steht diese Frist
  zwischen der Einleitung und der Erledigung eines dadurch veranlassten
  Gerichts- oder Verwaltungsverfahrens still.» → **Das Dual-Muster
  Wartefrist/Verwirkung existiert bereits im Preset.**

**§5-Befund:** Vollständig in `src/lib/schkgPresets.ts`. Das Dual
`wartefrist`/`verwirkung` von Art. 88 ist genau die Bauform, die der Spiegel
braucht (eine Preset-Zeile liefert ZWEI Spiegel-Zeilen). **NICHTS fehlt.**
Achtung Stillstand-Wechsel: RV/Fortsetzung folgen Betreibungsferien (Art. 56/63
SchKG), die Aberkennungsklage folgt seit 1.1.2025 dem ZPO-Stillstand (Art. 145
IV ZPO) — beides ist im Preset-`modus` bereits korrekt hinterlegt. Konfidenz
hoch **[V]**.

---

### A.3 — Zugang einer Arbeitgeber-Kündigung

**Auslöser-Datum:** Zugang der (ordentlichen) Kündigung beim Arbeitnehmer.
**Anker-Besonderheit:** Beide 336b-Fristen knüpfen am **Ende der
Kündigungsfrist** / der **Beendigung** an — nicht am Zugang. Dieses
Beendigungsdatum liefert bereits die `sperrfristen.ts`-Engine
(`beendigungISO`).

| Frist | Norm | Länge | Stillstand | Natur | Quelle (heute) | Weiche/Bedingung |
|---|---|---|---|---|---|---|
| Einsprache gg. Kündigung | Art. 336b I OR **[V]** | bis Ende Kündigungsfrist | — (materiell, kein ZPO-Stillstand) | Verwirkung | **fehlt als Preset** — Anker `beendigungISO` aus `sperrfristen.ts` | nur missbräuchliche/sachgrundlose Kündigung (Art. 336/336a) |
| Klage auf Entschädigung | Art. 336b II OR **[V]** | 180 T. **nach Beendigung** | — (materiell) | Verwirkung | **fehlt als Preset** — Basis `beendigungISO` + 180 T. (`allgemeineFrist.ts`) | nur wenn Einsprache gültig erfolgt ist (Gate!) |

**Wortlaut-Beleg Art. 336b OR [V]:** Abs. 1 «Wer gestützt auf Artikel 336 und
336a eine Entschädigung geltend machen will, muss gegen die Kündigung längstens
bis zum Ende der Kündigungsfrist beim Kündigenden schriftlich Einsprache
erheben.» Abs. 2 «Ist die Einsprache gültig erfolgt und einigen sich die
Parteien nicht …, so kann die Partei … ihren Anspruch auf Entschädigung geltend
machen. Wird nicht innert 180 Tagen nach Beendigung des Arbeitsverhältnisses
eine Klage anhängig gemacht, ist der Anspruch verwirkt.»

**§5-Befund (LÜCKE):** Die 336b-Fristen sind HEUTE in keinem Preset-Katalog;
das `arbeitsrecht-rechner.md`-Dossier listet «336b-Fristen» als geplanten
Quick-Win. ABER: das schwierige Datum (Ende Kündigungsfrist / Beendigung)
rechnet `sperrfristen.ts` (bzw. `kuendigungsfrist.ts`) bereits und gibt es als
`beendigungISO` aus. Der Spiegel kann das als **Anker** übernehmen und die zwei
336b-Fristen mit `allgemeineFrist.ts` (180 Tage; Einsprache = bis
Beendigungsdatum) draufrechnen. **Was fehlt:** zwei kleine Preset-Zeilen +
die Verkettung Anker→Frist. Konfidenz hoch **[V]**; Bauaufwand S.

> **Gate (§2-kritisch):** Art. 336b II setzt eine **gültig erfolgte Einsprache**
> voraus. Die 180-Tage-Klagefrist darf der Spiegel nur als BEDINGTE Zeile
> zeigen («läuft erst/nur, wenn fristgerecht Einsprache erhoben wurde») — sonst
> suggeriert er einen Anspruch, der ohne Einsprache verwirkt ist.

---

### A.4 — Zugang einer Vermieter-Kündigung

**Auslöser-Datum:** Empfang der Kündigung beim Mieter.

| Frist | Norm | Länge | Stillstand | Natur | Quelle (heute) | Weiche/Bedingung |
|---|---|---|---|---|---|---|
| Anfechtung der Kündigung | Art. 273 I OR **[V]** | 30 T. ab Empfang | — (materiell; Art. 78 OR Werktagsverschiebung) | Verwirkung | **`mietrecht.ts` liefert `anfechtungBis`** | nur Wohn-/Geschäftsräume; partei = Vermieter |
| Erstreckungsbegehren | Art. 273 II lit. a OR **[V]** | 30 T. ab Empfang (unbefristetes Verhältnis) | — (materiell) | Verwirkung | **`mietrecht.ts` liefert `erstreckungBis`** | ausgeschlossen bei Art. 257d/257f (Art. 272a) — Engine setzt `erstreckungBis` dann nicht |

**Wortlaut-Beleg Art. 273 OR [V]:** Abs. 1 «Will eine Partei die Kündigung
anfechten, so muss sie das Begehren innert 30 Tagen nach Empfang der Kündigung
der Schlichtungsbehörde einreichen.» Abs. 2 «Will der Mieter eine Erstreckung
… verlangen, so muss er das Begehren … einreichen: a. bei einem unbefristeten
Mietverhältnis innert 30 Tagen nach Empfang der Kündigung; b. bei einem
befristeten Mietverhältnis spätestens 60 Tage vor Ablauf der Vertragsdauer.»

**§5-Befund (BESTE Verzahnung):** `src/lib/mietrecht.ts` liefert in
`abschluss()` BEIDE Daten bereits fertig berechnet — `anfechtungBis` und
`erstreckungBis` (nur gesetzt, wenn `istRaum && partei === 'vermieter'`; bei
Art. 257d/257f-Pfaden ist `erstreckungBis` korrekt unterdrückt, Art. 272a).
Hier ist der Spiegel ein reiner **Konsument** des MietErgebnis-Objekts —
keinerlei neue Rechnung. Konfidenz hoch **[V]**.

> Hinweis befristetes Verhältnis: Art. 273 II lit. b (Erstreckung «spätestens
> 60 Tage vor Ablauf der Vertragsdauer») ist eine RÜCKWÄRTS-Frist und in
> `mietrecht.ts` nicht abgebildet (Engine unterstellt unbefristetes
> Verhältnis). Im Spiegel als Weiche/Warnung, nicht als berechnete Zeile. **[V]**

---

### A.5 — Eröffnung Strafbefehl

**Auslöser-Datum:** Zustellung/Eröffnung des Strafbefehls.

| Frist | Norm | Länge | Stillstand | Natur | Quelle (heute) | Weiche/Bedingung |
|---|---|---|---|---|---|---|
| Einsprache | Art. 354 I StPO **[V]** | 10 T. | **KEIN** (Art. 89 II StPO — keine Gerichtsferien) | (Einsprache; Verwirkung) | `strafRechtsmittel.ts` `bestimmeStrafRechtsmittel({entscheidTyp:'strafbefehl'})` → `fristen[]` | Privatklägerschaft: nicht gegen Sanktion (Art. 354 Ibis/II) |

**Wortlaut-Beleg Art. 354 StPO [V]:** Abs. 1 «Gegen den Strafbefehl können bei
der Staatsanwaltschaft innert 10 Tagen schriftlich Einsprache erheben: a. die
beschuldigte Person; a. die Privatklägerschaft; …». Abs. 2 «Die
Privatklägerschaft kann einen Strafbefehl hinsichtlich der ausgesprochenen
Sanktion nicht anfechten.» Abs. 3 «Die Einsprachen sind zu begründen;
ausgenommen ist die Einsprache der beschuldigten Person.»

**§5-Befund:** Die Frist liefert `strafRechtsmittel.ts` als `StrafFrist`
(`'10 Tage ab Zustellung des Strafbefehls'`, `Art. 354 Abs. 1 StPO`,
`kritisch:true`). Die Engine gibt **kein berechnetes Datum** zurück, nur die
Fristbeschreibung als Text — für den Spiegel muss die 10-Tage-Frist mit
`allgemeineFrist.ts` (Modus «kein Stillstand») auf das Eröffnungsdatum
gerechnet werden. **Single-Frist-Ereignis** (nur eine Zeile) — Grenzfall für
einen «Spiegel», eher Kandidat für den einfachen Frist-Direktlink. Konfidenz
hoch **[V]**.

---

### A.6 — Kenntnis des Erbgangs / Todesfall

**Auslöser-Datum:** je nach Tatbestand verschieden (Kenntnis vom Tod;
amtliche Mitteilung; Eröffnung der Verfügung; Tod). **Mehrere Trigger im
selben Ereignis** — der Spiegel braucht hier differenzierte Datumsfelder.

| Frist | Norm | Länge | Stillstand | Natur | Quelle (heute) | Weiche/Bedingung |
|---|---|---|---|---|---|---|
| Ausschlagung (gesetzl. Erbe) | Art. 567 II ZGB **[V]** | 3 Mt. ab Kenntnis vom Tod | — (materiell, keine Ferien) | Verwirkung | `erbFristen.ts` key `ausschlagung_gesetzlich` | gesetzlicher Erbe |
| Ausschlagung (eingesetzt) | Art. 567 II ZGB **[V]** | 3 Mt. ab amtl. Mitteilung | — | Verwirkung | `erbFristen.ts` key `ausschlagung_eingesetzt` | eingesetzter Erbe |
| Begehren öffentliches Inventar | Art. 580 II ZGB **[V]** | 1 Mt. | — | Verwirkung | `erbFristen.ts` key `oeff_inventar_begehren` | gleicher Fristbeginn wie Ausschlagung |
| Erklärung nach öff. Inventar | Art. 587 I ZGB **[V]** | 1 Mt. | — | Frist (erstreckbar 587 II) | `erbFristen.ts` key `erklaerung_nach_inventar` | nach Inventar-Abschluss (anderer Trigger!) |
| Ungültigkeitsklage relativ | Art. 521 I ZGB **[V]** | 1 Jahr ab Kenntnis | — | Verjährung | `erbFristen.ts` key `ungueltigkeit_relativ` | Kenntnis Verfügung + Grund |
| Ungültigkeitsklage absolut | Art. 521 I ZGB **[V]** | 10 Jahre ab Eröffnung | — | Verjährung | `erbFristen.ts` key `ungueltigkeit_absolut` | — |
| Herabsetzung relativ | Art. 533 I ZGB **[V]** | 1 Jahr ab Kenntnis Verletzung | — | Verjährung | `erbFristen.ts` key `herabsetzung_relativ` | — |
| Herabsetzung absolut | Art. 533 I ZGB **[V]** | 10 Jahre | — | Verjährung | `erbFristen.ts` keys `herabsetzung_absolut_*` | letztwillig/lebzeitig-Weiche |

**Wortlaut-Belege:**
- Art. 567 ZGB **[V]**: Abs. 1 «Die Frist zur Ausschlagung beträgt drei
  Monate.» Abs. 2 «Sie beginnt für die gesetzlichen Erben … mit dem Zeitpunkte,
  da ihnen der Tod des Erblassers bekannt geworden, und für die eingesetzten
  Erben mit dem Zeitpunkte, da ihnen die amtliche Mitteilung … zugekommen ist.»
- Art. 580 II ZGB **[V]**: «Das Begehren muss binnen Monatsfrist in der
  gleichen Form wie die Ausschlagung bei der zuständigen Behörde angebracht
  werden.» Abs. 3 «Wird es von einem der Erben gestellt, so gilt es auch für
  die übrigen.»
- Art. 521 I ZGB **[V]**: «Die Ungültigkeitsklage verjährt mit Ablauf eines
  Jahres … da der Kläger von der Verfügung und dem Ungültigkeitsgrund Kenntnis
  erhalten hat, und in jedem Falle mit Ablauf von zehn Jahren, vom Tage der
  Eröffnung der Verfügung an gerechnet.»
- Art. 533 I ZGB **[V]**: «Die Herabsetzungsklage verjährt mit Ablauf eines
  Jahres … da die Erben von der Verletzung ihrer Rechte Kenntnis erhalten
  haben, und in jedem Fall mit Ablauf von zehn Jahren …».

**§5-Befund:** Vollständig im `ERB_FRISTEN`-Katalog (`src/lib/erbFristen.ts`),
gerechnet über `berechneErbFrist` (das wiederum `allgemeineFrist.ts` nutzt).
**NICHTS fehlt.** Besonderheit für den Spiegel: dieses Ereignis hat **mehrere
verschiedene Trigger-Daten** (Tod, amtliche Mitteilung, Eröffnung, Kenntnis der
Verletzung) — der Spiegel muss pro Frist das richtige Trigger-Feld füttern,
nicht ein einziges Ereignisdatum. Konfidenz hoch **[V]**.

---

### A.7 — Zustellung Klagebewilligung

**Auslöser-Datum:** Eröffnung/Zustellung der Klagebewilligung.

| Frist | Norm | Länge | Stillstand | Natur | Quelle (heute) | Weiche/Bedingung |
|---|---|---|---|---|---|---|
| Klagefrist allgemein | Art. 209 III ZPO **[V]** | 3 Monate | Schlichtungs-Ausnahme str. (Art. 145 II a) | gesetzlich | `zpoPresets` key `klagebewilligung` | Regelfall |
| Klagefrist Miete/Pacht | Art. 209 IV ZPO **[V]** | 30 T. | wie oben | gesetzlich | `zpoPresets` key `klagefrist_miete` | Wohn-/Geschäftsräume, landw. Pacht |

**Wortlaut-Beleg Art. 209 ZPO [V]:** Abs. 3 «Nach Eröffnung berechtigt die
Klagebewilligung während dreier Monate zur Einreichung der Klage beim
Gericht.» Abs. 4 «In Streitigkeiten aus Miete und Pacht von Wohn- und
Geschäftsräumen sowie aus landwirtschaftlicher Pacht beträgt die Klagefrist
30 Tage.»

**§5-Befund:** Beide Presets vorhanden (`zpoPresets`). **NICHTS fehlt.**
Konfidenz hoch **[V]**. (Stillstand-Behandlung der Prosekutionsfrist nicht
abschliessend geklärt — Preset-Hinweis bereits hinterlegt **[?]**.)

---

### A — Gesamtbefund §5

| Ereignis | Fristen total | heute schon gerechnet | LÜCKE |
|---|---|---|---|
| A.1 Zivilentscheid | 8 (inkl. BGer-Folgestufe) | 7 (zpoPresets) | nur Bündelung; Anschlussberufung anderer Trigger |
| A.2 Zahlungsbefehl | 3–4 | alle (schkgPresets, Dual) | keine |
| A.3 AG-Kündigung | 2 | Anker `beendigungISO` ✓; Fristen selbst nein | **2 Preset-Zeilen + Verkettung** |
| A.4 Vermieter-Kündigung | 2 | beide (mietrecht.ts `anfechtungBis`/`erstreckungBis`) | keine |
| A.5 Strafbefehl | 1 | Frist als Text (strafRechtsmittel.ts), Datum nein | Datum draufrechnen (allgemeineFrist) |
| A.6 Erbgang | 8+ | alle (erbFristen.ts) | keine; Multi-Trigger-Eingabe |
| A.7 Klagebewilligung | 2 | beide (zpoPresets) | keine |

**Kernbefund:** 6 von 7 Ereignissen sind bereits zu (fast) 100 % von
bestehenden Engines/Presets abgedeckt. Echte Rechtslogik-Lücke nur bei A.3
(zwei kleine 336b-Preset-Zeilen). Der Fristenspiegel ist damit ganz überwiegend
**Darstellungs-/Orchestrierungsarbeit (§3)** — passt exakt zum FAHRPLAN-PRAXIS
(«kein neuer Rechtsinhalt»).

---

## B. DATENMODELL-VORSCHLAG (deterministisch, §2)

Ziel: Eine deklarative `FristenspiegelDef` je Ereignis, die NUR beschreibt,
WELCHE bestehende Engine/Preset mit WELCHEM Trigger-Datum aufzurufen ist. Der
Rahmen rechnet nichts; er ruft auf und tabelliert.

```ts
// src/lib/fristenspiegel/typen.ts (Vorschlag — noch nicht gebaut)

export type SpiegelQuelle =
  // direkt aus einem Engine-Ergebnisfeld (kein erneutes Rechnen):
  | { art: 'engineFeld'; engine: 'mietrecht' | 'sperrfristen';
      feld: string /* z.B. 'anfechtungBis' | 'beendigungISO' */ }
  // über ein bestehendes Preset + allgemeineFrist (die Engine, die das
  // Preset ohnehin verwendet):
  | { art: 'preset'; katalog: 'zpo' | 'schkg' | 'erb'; key: string }
  // reine Fristlänge auf einem Trigger (nur wo kein Preset existiert, z.B.
  // 336b II 180 Tage / Strafbefehl 10 Tage):
  | { art: 'fristLaenge'; laenge: number; einheit: 'tage'|'monate'|'jahre';
      stillstand: 'kein' | 'zpo_145' };

export type SpiegelFrist = {
  key: string;
  label: string;
  normRef: string;            // exakter Norm-Anker (Anzeige als Pill)
  quelle: SpiegelQuelle;      // ← §5: zeigt auf BESTEHENDE Rechtslogik
  triggerFeld: string;        // welches Kontext-Datum füttert die Frist
  fristnatur: 'gesetzlich' | 'gerichtlich' | 'verwirkung' | 'verjaehrung'
            | 'wartefrist' | 'klagefrist' | 'ordnungsfrist';
  stillstandRegime: 'zpo_145' | 'schkg_ferien' | 'kein' | 'bgg_46' | 'mat_kein';
  bedingung?: string;         // Weiche/Gate als Klartext (§8), z.B.
                              // 'nur wenn fristgerecht Einsprache erhoben'
  folgestufe?: boolean;       // true = nicht parallel, sondern nachgelagert
                              // (z.B. BGer nach kantonalem Entscheid)
};

export type KontextFrage = {
  feld: string;
  label: string;
  typ: 'datum' | 'auswahl' | 'bool';
  optionen?: { code: string; label: string }[];
  // steuert, welche Fristen überhaupt erscheinen:
  schaltetFristen?: (wert: unknown) => 'an' | 'aus' | 'unveraendert';
};

export type FristenspiegelDef = {
  ereignisTyp: string;        // 'zivilentscheid' | 'zahlungsbefehl' | ...
  label: string;
  ereignisDatumLabel: string; // z.B. 'Zustellung des begründeten Entscheids'
  kontextFragen: KontextFrage[];   // Verfahrensart, Streitwert-Weiche, Kanton …
  fristen: SpiegelFrist[];
};
```

**§2-Determinismus:** Jede Zeile leitet ihr Datum aus (a) einem Trigger-Datum
(Nutzereingabe) und (b) einer bestehenden, reinen Engine ab. Kein `Date.now()`,
keine Heuristik. Die `bedingung`/`schaltetFristen`-Logik ist rein regelbasiert
(Streitwert ≥ 10 000 → Berufung statt Beschwerde; summarisch → 10 statt 30 T.).

**Beispiel-Def A.4 (Vermieter-Kündigung) — reiner Konsument:**

```ts
{
  ereignisTyp: 'vermieterkuendigung',
  label: 'Zugang einer Vermieter-Kündigung',
  ereignisDatumLabel: 'Empfang der Kündigung',
  kontextFragen: [
    { feld: 'objekt', label: 'Mietobjekt', typ: 'auswahl', optionen: [...] },
    { feld: 'kanton', label: 'Kanton (Art. 78 OR)', typ: 'auswahl', optionen: [...] },
    { feld: 'kuendigungsart', label: 'Kündigungsgrund', typ: 'auswahl', optionen: [...] },
  ],
  fristen: [
    { key: 'anfechtung', label: 'Anfechtung bei der Schlichtungsbehörde',
      normRef: 'Art. 273 Abs. 1 OR',
      quelle: { art: 'engineFeld', engine: 'mietrecht', feld: 'anfechtungBis' },
      triggerFeld: 'zugang', fristnatur: 'verwirkung', stillstandRegime: 'mat_kein' },
    { key: 'erstreckung', label: 'Erstreckungsbegehren',
      normRef: 'Art. 273 Abs. 2 lit. a OR',
      quelle: { art: 'engineFeld', engine: 'mietrecht', feld: 'erstreckungBis' },
      triggerFeld: 'zugang', fristnatur: 'verwirkung', stillstandRegime: 'mat_kein',
      bedingung: 'entfällt bei Kündigung nach Art. 257d/257f OR (Art. 272a)' },
  ],
}
```
Hier ruft der Rahmen `berechneMietkuendigung(input)` GENAU EINMAL auf und liest
`anfechtungBis`/`erstreckungBis` — ist `erstreckungBis` undefined (Art. 272a),
zeigt der Spiegel die Zeile als «ausgeschlossen» statt mit Datum. **Null neue
Rechnung.**

### B.2 — Sammel-.ics (Erweiterung von `lib/icsExport.ts`)

`icsFuerFrist()` erzeugt heute EIN VCALENDAR mit EINEM VEVENT. Erweiterung
verhaltensneutral (§6) durch eine neue Funktion, die mehrere VEVENT-Blöcke in
EIN VCALENDAR faltet — die bestehende `icsFuerFrist` bleibt unangetastet:

```ts
// Skizze — neue Export-Funktion neben icsFuerFrist (gleiche Falt-/Esc-Logik):
export function icsSammel(eintraege: {
  titel: string; endISO: string; beschreibung?: string; vorfristTage?: number;
}[]): string {
  // 1× BEGIN:VCALENDAR / VERSION / PRODID / CALSCALE
  // n× VEVENT (UID je aus endISO+titel — deterministisch, kein Date.now())
  // 1× END:VCALENDAR
  // Falt-Funktion (RFC 5545 §3.1) wie gehabt wiederverwenden.
}
```
Determinismus bleibt (UID/DTSTAMP aus dem Fristdatum). Der Spiegel sammelt
alle berechneten `{titel, endISO}` und bietet einen Knopf «Alle Fristen als
Kalender (.ics)» — pro Zeile zusätzlich der bestehende Einzel-.ics-Knopf.

---

## C. UI-RAHMEN-SKIZZE (§10)

**Flow:** Ereignis wählen → 1 Ereignisdatum + minimale Kontextfragen →
Tabelle aller parallelen Fristen.

```
┌─────────────────────────────────────────────────────────────┐
│ Fristenspiegel                                                │
│ Ereignis: [▼ Zustellung Zivilentscheid (begründet)        ]  │
│ Ereignisdatum: [ 06.06.2026 ] (Heute-Knopf)  Kanton: [▼ ZH]  │
│ Verfahren: [▼ ordentlich]   Streitwert: ( ) <10k  (•) ≥10k   │
│ ( ) nur Dispositiv eröffnet → zuerst Begründung verlangen     │
├──────────────────────┬──────────┬─────────┬────────┬─────────┤
│ Frist                │ Ende     │ Natur   │ Norm   │ .ics    │
├──────────────────────┼──────────┼─────────┼────────┼─────────┤
│ Berufung             │ 07.07.26 │ [gesetzl]│[311 I] │  [📅]   │
│ Anschlussberufung*   │ s. Hinw. │ [gesetzl]│[313]   │   —     │
│ Begründung verlangen │ (n/a)    │ [gesetzl]│[239 II]│   —     │
│ … (Beschwerde nur falls Streitwert <10k …)                   │
├──────────────────────┴──────────┴─────────┴────────┴─────────┤
│ [ Alle als Kalender (.ics) ]   [ Permalink kopieren ]        │
│ Hinweise/Weichen: Stillstand Art.145 berücksichtigt; …       │
└──────────────────────────────────────────────────────────────┘
```

- **Natur-Badge** + **Norm-Pill**: bestehende UI-Bausteine (`ui.tsx`).
- **Je-Zeile-.ics** + **Sammel-.ics** (B.2).
- **Permalink**: neue Spec in `rechnerPermalinks.ts` (Felder: ereignisTyp +
  Ereignisdatum + Kontextwerte). Wiederverwendung des `permalink.ts`-Codecs —
  kein neues Codec.
- **Folgestufen** (BGer, Aberkennung) optisch ABGESETZT («erst nach …»), nicht
  als parallele Zeile (sonst falscher Eindruck gleichzeitig laufender Fristen).

### C — Verortung im Katalog: Empfehlung

**Empfehlung: eigener Rechner `/rechner/fristenspiegel` als WERKZEUG**, mit
Prefill-Brücken (Etappe 2.1-Muster) aus den bestehenden Rechnern.

Begründung:
1. **§10/§5:** Ein eigener Rahmen orchestriert ereignisübergreifend (Zivil +
   SchKG + Miete + Erb + Straf) — ein «Modul je Rechner» müsste die Logik n-mal
   einhängen und brächte Querverdrahtung zwischen Rechtsgebieten (§4-Risiko).
2. **Praxis-Realität:** Der Anwalt denkt vom EREIGNIS her («heute ist das Urteil
   gekommen»), nicht vom Rechner. Ein Werkzeug-Einstieg «Was wurde mir
   zugestellt?» trifft den Arbeitsweg.
3. **Brücken statt Doppelbau:** Wo ein Rechner schon das Ereignis kennt (z.B.
   Mietrechner hat `anfechtungBis`/`erstreckungBis`, Kündigungsrechner hat
   `beendigungISO`), kann er einen «In den Fristenspiegel»-Link mit Prefill
   anbieten — Spec liegt in `rechnerPermalinks.ts`. Umgekehrt verlinkt der
   Spiegel je Zeile tief in den jeweiligen Fachrechner (vorbefüllt) für den
   vollständigen Rechenweg/Begründungsabsatz.

Gegen «Modul je Rechner»: würde den Spiegel rechtsgebietsweise zersplittern,
die Sammel-.ics/Permalink-Logik vervielfachen und §4 (keine Querwirkung)
gefährden.

---

## D. §2-BEURTEILUNG je Ereignis + TODOs + Bau-Reihenfolge

### D.1 Deterministisch vs. Weiche/Warnung

| Ereignis | Deterministisch (Engine rechnet) | Weiche (Nutzer-Eingabe/Gate) | Warnung |
|---|---|---|---|
| A.1 Zivilentscheid | Fristlängen + Stillstand (zpoPresets) | Streitwert ≥/<10k; summarisch?; nur Dispositiv? | Anschlussberufung läuft ab Berufungs-Zustellung, NICHT Urteil |
| A.2 Zahlungsbefehl | RV/Fortsetzung (Dual) inkl. Ferien | RV erhoben? (schaltet Folgestufe) | Stillstand-Wechsel Ferien→ZPO bei Klagen (Art.145 IV) |
| A.3 AG-Kündigung | Beendigungsdatum (sperrfristen) + 180 T. | Missbräuchlichkeit; **Einsprache gültig?** | 336b II nur bei gültiger Einsprache (Gate) |
| A.4 Vermieter-Kündigung | `anfechtungBis`/`erstreckungBis` (mietrecht) | Kündigungsart (257d/f → keine Erstreckung) | befristetes Verhältnis: 60-Tage-Rückwärtsfrist nicht abgebildet |
| A.5 Strafbefehl | 10 T. ohne Stillstand | wer ficht an (Privatkläger/Sanktion) | keine Gerichtsferien (Art. 89 II StPO) |
| A.6 Erbgang | alle Fristlängen (erbFristen) | gesetzl./eingesetzt; Trigger-Qualifikation | Multi-Trigger; Behörde kantonal; Einrede unbefristet |
| A.7 Klagebewilligung | 3 Mt. / 30 T. (zpoPresets) | Miete/Pacht? | Prosekutions-Stillstand nicht abschliessend geklärt |

### D.2 Verifikations-TODOs (vor `verified:true`)
1. **[?]** Anschlussberufung-Trigger im Spiegel: bestätigen, dass die
   30-Tage-Frist (Art. 312 II) ab Zustellung der Berufung an die Gegenpartei
   läuft (nicht ab Urteilszustellung) — h.L., am Wortlaut bestätigt; im Spiegel
   als «andere Triggerung»-Hinweis statt parallele Zeile.
2. **[?]** Stillstand-Anwendbarkeit bei Art. 314 II (familienr. Summarsache) —
   Preset-Hinweis vermerkt «Einzelfall»; im Spiegel ehrlich offenlegen.
3. **[?]** 336b I «bis Ende Kündigungsfrist»: prüfen, ob als Datum
   (= `beendigungISO`) oder als Ereignis «letzter Tag der Frist» darzustellen
   ist; Verwirkungscharakter h.L.
4. **[?]** Prosekutionsfrist-Stillstand (Art. 209/263 ZPO) — bestehender
   Preset-Vorbehalt übernehmen.
5. **[V→Abnahme]** Alle in A zitierten Wortlaute am Cache verifiziert; die
   **fachliche** Abnahme (status «geprüft») bleibt David vorbehalten (§7).

### D.3 Bau-Reihenfolge (Pilot-Empfehlung)

1. **RAHMEN ZUERST (§10, verhaltensneutral §6):** `FristenspiegelDef`-Typen +
   Orchestrierer (ruft bestehende Engines/Presets, rechnet selbst nichts) +
   `icsSammel()` (neben `icsFuerFrist`, §6) + Permalink-Spec. Golden-Test:
   Spiegel-Datum je Zeile == direktes Engine-Resultat (Beweis «keine zweite
   Rechnung»).
2. **PILOT: A.4 Vermieter-Kündigung.** Begründung: `mietrecht.ts` liefert BEIDE
   Daten fertig (`anfechtungBis`/`erstreckungBis`) → reiner Konsument, null
   Rechtslogik, validiert den «engineFeld»-Quelltyp am risikoärmsten Fall.
   Zweitbester Pilot wäre A.6 (erbFristen, sauberer Preset-Katalog) — aber
   Multi-Trigger macht ihn komplexer.
3. **A.1 Zivilentscheid** (höchste Praxisrelevanz; validiert «preset»-Quelltyp +
   Streitwert/summarisch-Weichen + Folgestufe BGer).
4. **A.2 Zahlungsbefehl** (validiert Dual Wartefrist/Verwirkung als ZWEI Zeilen
   aus EINEM Preset).
5. **A.6 Erbgang / A.7 Klagebewilligung** (reine Preset-Konsumenten).
6. **A.3 AG-Kündigung** zuletzt — als einziges mit echter (kleiner)
   Logik-Lücke (2× 336b-Preset + Einsprache-Gate). Vorher die 336b-Fristen als
   Preset im Arbeitsrecht-Quick-Win bauen, dann andocken.
7. **A.5 Strafbefehl** optional — Single-Frist, eher Direktlink als «Spiegel».

---

## Quellenregister

| Norm | Cache | Anker | Konfidenz |
|---|---|---|---|
| Art. 311, 312, 313, 314, 321 ZPO | /tmp/zpo.html | art_311 … art_321 | [V] |
| Art. 145, 146 ZPO (Stillstand) | /tmp/zpo.html | art_145 | [V] |
| Art. 209 ZPO (Klagebewilligung III/IV) | /tmp/zpo.html | art_209 | [V] |
| Art. 239 ZPO (Begründung verlangen) | /tmp/zpo.html | art_239 | [V] |
| Art. 74, 88 SchKG | /tmp/schkg.html | art_74, art_88 | [V] |
| Art. 273 OR (Anfechtung/Erstreckung) | /tmp/or.html | art_273 | [V] |
| Art. 336b OR (Einsprache/Klage 180 T.) | /tmp/or.html | art_336_b | [V] |
| Art. 354 StPO (Einsprache Strafbefehl) | /tmp/stpo.html | art_354 | [V] |
| Art. 100, 46 BGG | /tmp/bgg.html | art_100, art_46 | [V] |
| Art. 567, 580, 521, 533 ZGB | /tmp/zgb.html | art_567 … art_533 | [V] |

**Engine-/Preset-Register (bestehender Code, §5-Quellen des Spiegels):**
- `src/lib/zpoPresets.ts` — A.1, A.7 (Berufung/Beschwerde/Begründung/
  Anschlussberufung/Klagebewilligung).
- `src/lib/schkgPresets.ts` — A.2 (Rechtsvorschlag, Fortsetzungsbegehren-Dual).
- `src/lib/mietrecht.ts` — A.4 (`anfechtungBis`, `erstreckungBis`).
- `src/lib/sperrfristen.ts` (+ `kuendigungsfrist.ts`) — A.3 Anker
  (`beendigungISO`).
- `src/lib/erbFristen.ts` (`ERB_FRISTEN`) — A.6.
- `src/lib/strafRechtsmittel.ts` — A.5 (Fristbeschreibung).
- `src/lib/allgemeineFrist.ts` — Datums-Arithmetik (180 T. / 10 T. wo kein
  Preset).
- `src/lib/icsExport.ts` — Basis für `icsSammel()` (B.2).
- `src/lib/permalink.ts` + `src/lib/rechnerPermalinks.ts` — Brücken/Permalink.

**Status:** Erstrecherche/Konzept. Wortlaute verifiziert (§7), fachliche
Abnahme durch David ausstehend. Keine Engine geändert; reine Bau-Vorbereitung.
