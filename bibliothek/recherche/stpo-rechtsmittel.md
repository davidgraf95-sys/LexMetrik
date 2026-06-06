# Rechtsmittel der StPO — Recherche-Dossier (Rechtsmittelprüfungs-Engine + Fristen-Presets)

**Erstellt:** 6.6.2026 · **Autor:** Recherche-Agent (Auftrag David)
**Wortlaut-Quellen:**
- **StPO** SR 312.0 — Cache `/tmp/stpo.html`, konsolidierte Fassung
  **«Stand am 1. Januar 2024»** (ELI `cc/2010/267`, Konsolidierung
  `20240101`; Revision BG 17.6.2022, AS 2023 468, BBl 2019 6697, in Kraft
  seit 1.1.2024). Anker `id="art_X"` (z. B. `art_393`). Abrufdatum 6.6.2026.
- **BGG** SR 173.110 — Cache `/tmp/bgg.html` (Weiterzug ans BGer: Art. 78–81,
  90/92/93, 100, 46, 79). Abrufdatum 6.6.2026.

**Status: Arbeitsgrundlage — NICHT fachlich abgenommen (CLAUDE.md §7/§8).**
Alle Wortlaut-Zitate verbatim am Cache verifiziert. BGE-Leitlinien sind als
**[zu verifizieren]** markiert (kein Rechtsprechungs-Cache). **Keine Repo-Datei
geändert ausser diesem Dossier.**

**Quellenlage (eine Zeile):** StPO-Rechtsmittelrecht (9. Titel, Art. 379–415),
Einsprache-Strafbefehl (354–356), Haft-Rechtsmittel (222/233) und BGG-Weiterzug
sind am Cache vollständig erfasst; die StPO-Revision 1.1.2024 ist eingearbeitet
und betrifft im Rechtsmittelbereich **textlich**: Art. 222 (neu: nur die
verhaftete Person), Art. 388 (Nichteintreten durch Verfahrensleitung), Art. 397
Abs. 5 (6-Monats-Erledigungsfrist Beschwerde), Art. 408 Abs. 2 (12-Monats-Frist
Berufung), Art. 354 lit. abis/Abs. 1bis (Einsprache Privatklägerschaft), Art. 81
Abs. 1 Ziff. 3 BGG (StA-Beschwerderecht in Haftsachen ausgeschlossen).

**Vorarbeiten, auf die dieses Dossier aufbaut (statt zu duplizieren):**
- `bibliothek/recherche/strafrecht-cluster.md` **RECHNER 3** (StPO-Verfahrens-
  fristen): Fristmechanik Art. 89/90/91/94 dort bereits hergeleitet. Dieses
  Dossier ergänzt den **Rechtsmittel-Statthaftigkeits-Entscheidbaum** und die
  **vollständige Fristen-Preset-Tabelle**; die Fristarithmetik wird NICHT neu
  recherchiert, sondern referenziert.
- `bibliothek/normen/stpo-zustaendigkeit-regelwerk.md` Teil 1 (Behörden-/
  Gerichtskatalog Art. 12–28; Strafbefehl/Einsprache Art. 352–356): die
  funktionellen Instanzen (Beschwerdeinstanz, Berufungsgericht, ZMG) und das
  Strafbefehlsverfahren sind dort erfasst.
- `src/lib/zustaendigkeit.ts` → **`bestimmeRechtsmittel(input)`** als
  **Bauform-Vorbild** (kantonale Stufe + BGer-Stufe + `fristHinweis` +
  `normverweise`); `RechtsmittelErgebnis`-Struktur wird unten gespiegelt.
- `src/lib/strafZustaendigkeit.ts` als **Datenschicht-/Output-Vorbild**
  (`StrafNorm`/`StrafSchritt`/`StrafFrist`-Records, `weichen`/`warnungen`).
- `src/lib/fristenEngine.ts` (`OHNE_STILLSTAND`) + `src/lib/zpoPresets.ts`
  (Preset-Schema) als Wiederverwendungs-Bausteine.

**Verifikations-TODOs (Sammlung, vor `verified:true`/Deploy):**
- **V-0 (Stand nach 1.1.2024):** Cache ist 20240101. WebSearch 6.6.2026 ergab
  **keine** in Kraft getretene Schweizer Teilrevision der Art. 379–415 / 354–356
  / 222 / 89–94 zwischen 1.1.2024 und Juni 2026 (Treffer betrafen die deutsche
  StPO). Dennoch vor Deploy gegen Fedlex-Aktualstand prüfen.
- **V-1 (Art. 89 Abs. 2 — Streukorrektur):** Eine Sekundärquelle (legaldeadline/
  strafprozess.ch-Umfeld) behauptete, der Fristenstillstand gelte in der StPO
  «grundsätzlich, nicht jedoch in Haftverfahren». **Das ist FALSCH** — der
  Cache-Wortlaut Art. 89 Abs. 2 lautet vorbehaltlos «Im Strafverfahren gibt es
  keine Gerichtsferien» (kein Ausnahme-/Haft-Vorbehalt). **Massgebend bleibt der
  Primärtext (§7): KEIN Stillstand in der gesamten StPO** → `OHNE_STILLSTAND`
  für ALLE StPO-Fristen. (Die Verwechslung dürfte aus FL/DE-Recht stammen.)
- **V-2 (Haft-Beschwerde 222 rev. 2024):** Art. 222 ist per 1.1.2024 neu gefasst
  — «**Einzig die verhaftete Person**» kann Haftentscheide anfechten; das frühere
  StA-Anfechtungsrecht (BGE 137 IV 22, 87, 230) ist damit **entfallen**. Das
  spiegelt Art. 81 Abs. 1 Ziff. 3 BGG (StA-Beschwerde ans BGer in Haftsachen
  ausgeschlossen, rev. 2024). Vor Übernahme h.M./erste BGE zur neuen Fassung
  prüfen. [zu verifizieren]
- **V-3 (Art. 391 Abs. 2 Satz 2):** Reichweite der Ausnahme vom Verschlechte-
  rungsverbot («strengere Bestrafung aufgrund von Tatsachen, die dem erstinstanz-
  lichen Gericht nicht bekannt sein konnten») — BGE-Leitlinien sammeln. [zu verif.]
- **V-4 (Berufung nur «Urteile», Art. 398 Abs. 1):** Abgrenzung Urteil ↔
  verfahrensleitender/anderer Entscheid (→ Beschwerde) im Einzelfall; BGE zur
  Subsidiarität Beschwerde/Berufung (Art. 394 lit. a). [zu verifizieren]

---

## TEIL 1 — SYSTEMATIK (9. Titel, Art. 379–415 StPO)

Der 9. Titel kennt **drei Rechtsmittel**: **Beschwerde** (2. Kap., Art. 393–397),
**Berufung** (3. Kap., Art. 398–409) und **Revision** (4. Kap., Art. 410–415);
voran stehen die **Allgemeinen Bestimmungen** (1. Kap., Art. 379–392). Die
Einsprache gegen den Strafbefehl (Art. 354–356) steht **ausserhalb** des 9.
Titels (rechtsmittelähnlicher Behelf eigener Art, Teil 2).

### A · Allgemeine Bestimmungen (Art. 379–392)

**Art. 379 — Anwendbare Vorschriften** (verbatim):
> «Das Rechtsmittelverfahren richtet sich sinngemäss nach den allgemeinen
> Bestimmungen dieses Gesetzes, soweit dieser Titel keine besonderen
> Bestimmungen enthält.»

**Art. 380 — Endgültige/nicht anfechtbare Entscheide:**
> «Bezeichnet dieses Gesetz einen Entscheid als endgültig oder nicht anfechtbar,
> so ist dagegen kein Rechtsmittel nach diesem Gesetz zulässig.»
→ Engine-Weiche: Bei ausdrücklich «endgültig» bezeichneten Entscheiden (z. B.
Art. 233 Haftentlassung im Berufungsverfahren; Art. 362 Abs. 3 Rückweisung
abgekürztes Verfahren) **kein** Rechtsmittel.

**Art. 381 — Legitimation der Staatsanwaltschaft:**
> «¹ Die Staatsanwaltschaft kann ein Rechtsmittel zugunsten oder zuungunsten der
> beschuldigten oder verurteilten Person ergreifen. ² Sehen Bund oder Kantone
> eine Ober- oder Generalstaatsanwaltschaft vor, so bestimmen sie, welche
> Staatsanwaltschaft berechtigt ist … ³ Sie regeln, welche Behörden im
> Übertretungsstrafverfahren Rechtsmittel ergreifen können.»
(Abs. 4 **aufgehoben** per 1.1.2024.)

**Art. 382 — Legitimation der übrigen Parteien** (Kernnorm!):
> «¹ Jede Partei, die ein **rechtlich geschütztes Interesse** an der Aufhebung
> oder Änderung eines Entscheides hat, kann ein Rechtsmittel ergreifen.
> ² Die **Privatklägerschaft kann einen Entscheid hinsichtlich der
> ausgesprochenen Sanktion nicht anfechten.** ³ Nach dem Tode der beschuldigten
> oder verurteilten Person oder der Privatklägerschaft können die Angehörigen
> (Art. 110 Abs. 1 StGB) in der Reihenfolge der Erbberechtigung ein Rechtsmittel
> ergreifen …»
→ **Legitimations-Gate der Engine** (zusammen mit 381): Eingabe «wer ficht an»
∈ {beschuldigte_person, privatklaegerschaft, staatsanwaltschaft, weitere_partei,
angehoerige}. Bei `privatklaegerschaft` + Anfechtungsziel = Sanktion → **Hard-Stop**
(Abs. 2). Das «rechtlich geschützte Interesse» ist **Tatfrage** → als Gate/Hinweis,
nicht automatisch (§2/§8).

**Art. 383 — Sicherheitsleistung:** VL der Rechtsmittelinstanz kann der
Privatklägerschaft Sicherheit auferlegen (Frist; Art. 136 vorbehalten); ohne
fristgerechte Leistung Nichteintreten.

**Art. 384 — Fristbeginn** (Anknüpfungsereignis je Rechtsmittel!):
> «Die Rechtsmittelfrist beginnt: a. im Falle eines **Urteils**: mit der
> **Aushändigung oder Zustellung des schriftlichen Dispositivs**; b. bei andern
> Entscheiden: mit der **Zustellung des Entscheides**; c. bei einer nicht
> schriftlich eröffneten Verfahrenshandlung: mit der **Kenntnisnahme**.»
→ **Wichtig für Preset-Trigger:** Art. 384 lit. a (Dispositiv) ist der Auslöser
der **Berufungs-ANMELDUNG** (Art. 399 Abs. 1, 10 T.); die 20-Tage-Erklärung
(Art. 399 Abs. 3) hängt dagegen an der **Zustellung des begründeten Urteils** —
zwei verschiedene Trigger, sauber trennen.

**Art. 385 — Begründung und Form:** Wo Begründung verlangt ist, genaue Angabe
von (a) angefochtenen Punkten, (b) Gründen, (c) Beweismitteln; bei Mängeln kurze
Nachfrist, sonst Nichteintreten. **Abs. 3: Die unrichtige Bezeichnung eines
Rechtsmittels beeinträchtigt seine Gültigkeit nicht** (→ Engine-Hinweis statt
Fallstrick).

**Art. 386 — Verzicht und Rückzug:** Verzicht nach Eröffnung durch Erklärung
(schriftlich/mündlich) gegenüber der entscheidenden Behörde; Rückzug bei
mündlichem Verfahren bis Abschluss Parteiverhandlungen, bei schriftlichem bis
Abschluss Schriftenwechsel. **Abs. 3: Verzicht/Rückzug endgültig** (ausser
Täuschung/Straftat/unrichtige behördliche Auskunft).

**Art. 387 — Aufschiebende Wirkung** (verbatim):
> «Rechtsmittel haben **keine aufschiebende Wirkung**; vorbehalten bleiben
> abweichende Bestimmungen dieses Gesetzes oder Anordnungen der Verfahrensleitung
> der Rechtsmittelinstanz.»
→ **Engine-Ausgabe «aufschiebende Wirkung»:** Default NEIN. **Ausnahme: Berufung**
hat im Umfang der Anfechtung aufschiebende Wirkung (Art. 402, s. u.).

**Art. 388 — Zuständigkeit der VL für verfahrensleitende/vorsorgliche Massnahmen
sowie Nichteintretensentscheide** (Fassung 1.1.2024): VL trifft notwendige
unaufschiebbare Massnahmen (u. a. Haft anordnen, amtliche Verteidigung); **neu
Abs. 2:** sie entscheidet allein über Nichteintreten auf (a) offensichtlich
unzulässige, (b) offensichtlich ungenügend begründete, (c) querulatorische/
rechtsmissbräuchliche Rechtsmittel.

**Art. 389 — Beweisergänzungen:** Rechtsmittelverfahren beruht auf den im
Vorverfahren/erstinstanzlich erhobenen Beweisen; Wiederholung nur bei
Beweisvorschriftsverletzung/Unvollständigkeit/Unzuverlässigkeit.

**Art. 390 — Schriftliches Verfahren:** Rechtsmittelschrift; Zustellung an
andere Parteien/Vorinstanz; ggf. zweiter Schriftenwechsel; Entscheid auf
Zirkularweg/nicht öffentlicher Beratung; Verhandlung fakultativ.

**Art. 391 — Entscheid (Verschlechterungsverbot!):**
> «¹ Die Rechtsmittelinstanz ist nicht gebunden an a. die Begründungen … b. die
> Anträge der Parteien, ausser bei Zivilklagen. ² Sie darf Entscheide **nicht
> zum Nachteil der beschuldigten oder verurteilten Person abändern, wenn das
> Rechtsmittel nur zu deren Gunsten ergriffen worden ist** (reformatio in
> peius). Vorbehalten bleibt eine strengere Bestrafung aufgrund von Tatsachen,
> die dem erstinstanzlichen Gericht nicht bekannt sein konnten. ³ Sie darf
> Entscheide im Zivilpunkt nicht zum Nachteil der Privatklägerschaft abändern,
> wenn nur von dieser ein Rechtsmittel ergriffen worden ist.»
→ **Engine-Ausgabe «Verschlechterungsverbot»:** greift, wenn das Rechtsmittel
**nur zugunsten** der beschuldigten Person ergriffen wurde (Eingabe-Flag
`nur_zugunsten_beschuldigte`). Ausnahme Satz 2 = **Tatfrage/Hinweis**, nicht
automatisch (V-3).

**Art. 392 — Ausdehnung gutheissender Rechtsmittelentscheide:** Wirkung auch
zugunsten nicht anfechtender Mitbeschuldigter, wenn der Sachverhalt anders
beurteilt wird und die Erwägungen auch für sie zutreffen.

### B · BESCHWERDE (Art. 393–397)

**Art. 393 — Zulässigkeit und Beschwerdegründe** (Anfechtungsobjekt-Katalog!):
> «¹ Die Beschwerde ist zulässig gegen: a. die **Verfügungen und die
> Verfahrenshandlungen von Polizei, Staatsanwaltschaft und Übertretungsstraf-
> behörden**; b. die **Verfügungen und Beschlüsse sowie die Verfahrenshandlungen
> der erstinstanzlichen Gerichte; ausgenommen sind verfahrensleitende
> Entscheide**; c. die **Entscheide des Zwangsmassnahmengerichts** in den in
> diesem Gesetz vorgesehenen Fällen. ² Mit der Beschwerde können gerügt werden:
> a. **Rechtsverletzungen**, einschliesslich Überschreitung und Missbrauch des
> Ermessens, Rechtsverweigerung und Rechtsverzögerung; b. die **unvollständige
> oder unrichtige Feststellung des Sachverhalts**; c. **Unangemessenheit**.»
→ **Volle Kognition** (Recht + Sachverhalt + Angemessenheit). Anfechtungsobjekte:
Verfügungen/Verfahrenshandlungen StA/Polizei/Übertretungsstrafbehörde,
nicht-verfahrensleitende Entscheide erstinstanzlicher Gerichte, ZMG-Entscheide.
**Typische Beschwerde-Objekte:** Einstellungsverfügung (Art. 322 Abs. 2),
Nichtanhandnahme (Art. 310 Abs. 2) — beides ausdrücklich der Beschwerde
unterstellt.

**Art. 394 — Ausschluss der Beschwerde** (Subsidiarität!):
> «Die Beschwerde ist nicht zulässig: a. **wenn die Berufung möglich ist**;
> b. gegen die Ablehnung von Beweisanträgen durch die StA oder die
> Übertretungsstrafbehörde, wenn der Antrag ohne Rechtsnachteil vor dem
> erstinstanzlichen Gericht wiederholt werden kann.»
→ **Engine-Routing-Regel:** Berufung verdrängt Beschwerde (lit. a). Endurteile
erstinstanzlicher Gerichte → Berufung; verfahrensleitende/andere Entscheide,
Vorverfahrensakte → Beschwerde.

**Art. 395 — Kollegialgericht als Beschwerdeinstanz:** VL allein bei (a) nur
Übertretungen; (b) wirtschaftliche Nebenfolgen bei strittigem Betrag ≤ CHF 5000.

**Art. 396 — Form und Frist** (verbatim):
> «¹ Die Beschwerde gegen schriftlich oder mündlich eröffnete Entscheide ist
> innert **10 Tagen schriftlich und begründet** bei der Beschwerdeinstanz
> einzureichen. ² Beschwerden wegen **Rechtsverweigerung oder Rechtsverzögerung
> sind an keine Frist gebunden.**»

**Art. 397 — Verfahren und Entscheid:** schriftliches Verfahren; bei
Gutheissung neuer Entscheid oder Rückweisung; bei Gutheissung gegen
Einstellung Weisungen möglich; **neu Abs. 5 (1.1.2024): Entscheid innert
6 Monaten** (Ordnungsfrist).

**Instanz:** kantonal die **Beschwerdeinstanz** (Art. 20; kann dem
Berufungsgericht übertragen sein, Art. 20 Abs. 2). Im Bund: **Beschwerdekammer
des Bundesstrafgerichts** (StBOG; Querverweis `bibliothek/behoerden/
gerichte-bund.md`).

### C · BERUFUNG (Art. 398–409)

**Art. 398 — Zulässigkeit und Berufungsgründe** (Objekt nur Urteile!):
> «¹ Die Berufung ist zulässig gegen **Urteile erstinstanzlicher Gerichte**, mit
> denen das Verfahren ganz oder teilweise abgeschlossen worden ist, sowie gegen
> **selbstständige nachträgliche Entscheide** des Gerichts und gegen
> **selbstständige Einziehungsentscheide.** ² Das Berufungsgericht kann das
> Urteil in allen angefochtenen Punkten umfassend überprüfen. ³ Mit der Berufung
> können gerügt werden: a. Rechtsverletzungen …; b. die unvollständige oder
> unrichtige Feststellung des Sachverhalts; c. Unangemessenheit. ⁴ **Bildeten
> ausschliesslich Übertretungen Gegenstand** des erstinstanzlichen Haupt-
> verfahrens, so kann mit der Berufung nur geltend gemacht werden, das Urteil
> sei **rechtsfehlerhaft** oder die Feststellung des Sachverhalts sei
> **offensichtlich unrichtig** oder beruhe auf einer Rechtsverletzung. **Neue
> Behauptungen und Beweise können nicht vorgebracht werden.** ⁵ Beschränkt sich
> die Berufung auf den Zivilpunkt … [ZPO am Gerichtsstand].»
→ **Übertretungs-Kognitionsbeschränkung (Abs. 4!):** Engine-Ausgabe «Kognition»
bei `nur_uebertretung=true` → **eingeschränkt** (nur Rechtsfehler/Willkür, kein
Novenrecht); sonst **volle Kognition** (Abs. 2/3).

**Art. 399 — Anmeldung der Berufung und Berufungserklärung** (ZWEI Fristen,
zwei Trigger — verbatim):
> «¹ Die Berufung ist dem **erstinstanzlichen Gericht** innert **10 Tagen seit
> Eröffnung des Urteils** schriftlich oder mündlich zu Protokoll **anzumelden.**
> ² Das erstinstanzliche Gericht übermittelt die Anmeldung nach Ausfertigung des
> begründeten Urteils … dem Berufungsgericht. ³ Die Partei … reicht dem
> **Berufungsgericht** innert **20 Tagen seit der Zustellung des begründeten
> Urteils** eine schriftliche **Berufungserklärung** ein. Sie hat darin
> anzugeben: a. ob sie das Urteil vollumfänglich oder nur in Teilen anficht;
> b. welche Abänderungen … verlangt; c. welche Beweisanträge. ⁴ Wer nur Teile
> anficht, hat verbindlich anzugeben, auf welche Teile sich die Berufung
> beschränkt: a. Schuldpunkt …; b. Bemessung der Strafe; c. Anordnung von
> Massnahmen; d. Zivilanspruch …; e. Nebenfolgen; f. Kosten-, Entschädigungs-
> und Genugtuungsfolgen; g. nachträgliche richterliche Entscheidungen.»
→ **Trigger-Trennung (Preset-kritisch):**
  - **Anmeldung:** 10 Tage **ab Eröffnung des Urteils** (= Dispositiv,
    Art. 384 lit. a) → an das **erstinstanzliche Gericht**.
  - **Erklärung:** 20 Tage **ab Zustellung des begründeten Urteils** → an das
    **Berufungsgericht**. Zwei verkettete Fristen, **verschiedene Auslöser**.

**Art. 400 — Vorprüfung:** VL klärt Anfechtungsumfang; Kopie an andere Parteien;
**Abs. 3: andere Parteien können innert 20 Tagen** seit Empfang Nichteintreten
beantragen oder **Anschlussberufung** erklären.

**Art. 401 — Anschlussberufung:** sinngemäss nach Art. 399 Abs. 3/4; **nicht auf
den Umfang der Hauptberufung beschränkt** (ausser diese betrifft nur den
Zivilpunkt); **fällt dahin**, wenn die Hauptberufung zurückgezogen wird / darauf
nicht eingetreten wird.

**Art. 402 — Wirkung der Berufung** (Ausnahme zu 387!):
> «Die Berufung hat **im Umfang der Anfechtung aufschiebende Wirkung.**»

**Art. 403 — Eintreten:** schriftliches Eintretensverfahren bei
verspäteter/unzulässiger Anmeldung/Erklärung etc.

**Art. 404 — Umfang der Überprüfung:** nur angefochtene Punkte; zugunsten der
beschuldigten Person auch nicht angefochtene Punkte (Verhinderung gesetzwidriger/
unbilliger Entscheide).

**Art. 405 — Mündliches Verfahren** / **Art. 406 — Schriftliches Verfahren**
(zulässig u. a. bei nur Rechtsfragen, nur Zivilpunkt, nur Übertretungen ohne
Verbrechens-/Vergehensantrag, nur Kosten/Nebenfolgen, Massnahmen Art. 66–73 StGB;
mit Parteieinverständnis weiter).

**Art. 407 — Säumnis der Parteien:** Berufung/Anschlussberufung gilt als
**zurückgezogen** bei unentschuldigtem Fernbleiben/keiner schriftlichen Eingabe/
Nicht-Vorladbarkeit; Sonderregeln bei StA-/Privatklägerschafts-Berufung
(Abwesenheitsverfahren).

**Art. 408 — Neues Urteil:** ersetzt das erstinstanzliche; **neu Abs. 2
(1.1.2024): Entscheid innert 12 Monaten** (Ordnungsfrist).

**Art. 409 — Aufhebung und Rückweisung:** bei wesentlichen, nicht heilbaren
Mängeln Rückweisung zur neuen Hauptverhandlung; Bindung des erstinstanzlichen
Gerichts an die Rechtsauffassung.

**Instanz:** das **Berufungsgericht** (Art. 21 Abs. 1 lit. a). Bund:
**Berufungskammer des Bundesstrafgerichts**.

### D · REVISION (Art. 410–415)

**Art. 410 — Zulässigkeit und Revisionsgründe** (verbatim, gekürzt):
> «¹ Wer durch ein **rechtskräftiges Urteil, einen Strafbefehl, einen
> nachträglichen richterlichen Entscheid oder einen Entscheid im selbstständigen
> Massnahmenverfahren** beschwert ist, kann die Revision verlangen, wenn:
> a. **neue, vor dem Entscheid eingetretene Tatsachen oder neue Beweismittel**
> vorliegen, die geeignet sind, einen Freispruch, eine wesentlich mildere oder
> wesentlich strengere Bestrafung … oder eine Verurteilung der freigesprochenen
> Person herbeizuführen; b. der Entscheid **mit einem späteren Strafentscheid …
> in unverträglichem Widerspruch** steht; c. sich in einem anderen Strafverfahren
> erweist, dass durch eine **strafbare Handlung auf das Ergebnis eingewirkt**
> worden ist … ² Die Revision **wegen Verletzung der EMRK** kann verlangt
> werden, wenn a. der EGMR in einem endgültigen Urteil (Art. 44 EMRK) eine
> Verletzung festgestellt … hat; b. eine Entschädigung nicht geeignet ist …; und
> c. die Revision notwendig ist … ³ Die Revision **zugunsten** der verurteilten
> Person kann auch **nach Eintritt der Verjährung** verlangt werden. ⁴ Beschränkt
> sich die Revision auf Zivilansprüche … [ZPO].»

**Art. 411 — Form und Frist** (verbatim — teils fristlos!):
> «¹ Revisionsgesuche sind **schriftlich und begründet beim Berufungsgericht**
> einzureichen … ² Gesuche nach **Art. 410 Abs. 1 lit. b und Abs. 2** sind innert
> **90 Tagen nach Kenntnisnahme** des betreffenden Entscheids zu stellen. **In
> den übrigen Fällen sind Revisionsgesuche an keine Frist gebunden.**»
→ **Engine-Ausgabe «Frist»:** Revisionsgrund 410 Abs. 1 lit. b / Abs. 2 (EMRK)
→ **90 Tage relativ** ab Kenntnisnahme; lit. a (Noven) und lit. c → **unbefristet**
(ehrlich offenlegen, keine Frist erfinden, §8).

**Art. 412 — Vorprüfung und Eintreten** / **Art. 413 — Entscheid** (Abweisung
oder Aufhebung + Rückweisung/neuer Entscheid; vorläufige Sicherheitshaft
möglich, Abs. 4) / **Art. 414 — Neues Verfahren** / **Art. 415 — Folgen des
neuen Entscheids** (Anrechnung verbüsster Strafen; Rückerstattung; Veröffent-
lichung).

**Instanz:** das **Berufungsgericht** (Art. 21 Abs. 1 lit. b; Unvereinbarkeit
Berufung↔Revision Art. 21 Abs. 3).

---

## TEIL 2 — EINSPRACHE STRAFBEFEHL (Art. 354–356) + Abgrenzungen

**Rechtsnatur:** Die Einsprache ist **kein Rechtsmittel** des 9. Titels, sondern
ein **rechtsbehelfsähnlicher Behelf eigener Art** (kein Devolutiveffekt — die
StA bleibt zunächst Herrin; keine reformatio-Beschränkung des 9. Titels direkt
anwendbar, da kein Übergang an eine obere Instanz). Trotzdem in den Entscheidbaum
aufzunehmen, weil sie der praktisch häufigste «Rechtsbehelf» ist.

**Art. 354 — Einsprache** (verbatim, Fassung 1.1.2024):
> «¹ Gegen den Strafbefehl können bei der Staatsanwaltschaft innert **10 Tagen
> schriftlich** Einsprache erheben: a. die **beschuldigte Person**; abis. die
> **Privatklägerschaft**; b. weitere Betroffene; c. soweit vorgesehen die
> Ober-/Generalstaatsanwaltschaft … 1bis. **Die Privatklägerschaft kann einen
> Strafbefehl hinsichtlich der ausgesprochenen Sanktion nicht anfechten.**
> ² Die Einsprachen sind zu begründen; **ausgenommen ist die Einsprache der
> beschuldigten Person.** ³ Ohne gültige Einsprache wird der Strafbefehl zum
> **rechtskräftigen Urteil.**»
→ **Begründungspflicht:** alle ausser der beschuldigten Person (Abs. 2). Für die
Engine: `einsprache_begruendungspflicht = (legitimierter !== beschuldigte_person)`.
**Privatklägerschaft:** Einspracherecht (neu 2024) **ohne** Sanktionsanfechtung
(Abs. 1bis — spiegelt Art. 382 Abs. 2).

**Art. 355 — Verfahren bei Einsprache:** StA nimmt weitere Beweise ab; **Abs. 2:
unentschuldigtes Fernbleiben von der Einvernahme → Einsprache gilt als
zurückgezogen** (Rückzugsfiktion); danach 4 Optionen (festhalten / einstellen /
neuer Strafbefehl / Anklage).

**Art. 356 — Verfahren vor dem erstinstanzlichen Gericht:** bei Festhalten
Überweisung; Strafbefehl = Anklageschrift; Gericht prüft Gültigkeit;
**Abs. 4: unentschuldigtes Fernbleiben in der HV → Rückzugsfiktion**; Abs. 6
schriftliches Verfahren bei nur Kosten-/Nebenfolgen-Einsprache.

**Abgrenzung Einsprache ↔ Beschwerde/Berufung:** Strafbefehl → **Einsprache**
(nicht Berufung/Beschwerde). Erst der nach Festhalten ergehende **Urteils-Spruch
des erstinstanzlichen Gerichts** (Art. 356) ist dann **berufungsfähig** (Art. 398).
**Übertretungsstrafverfahren (Art. 357):** Verwaltungsbehörde mit StA-Befugnissen;
Verfahren sinngemäss nach Strafbefehlsverfahren → ebenfalls **Einsprache** gegen
den Übertretungs-Strafbefehl (10 Tage, Art. 354 i. V. m. 357 Abs. 2).

**ABER: Haft-Entscheide des ZMG — Sonderweg, KEIN ordentliches Rechtsmittel des
9. Titels.** Siehe Teil 2bis.

### 2bis · Haft-Rechtsmittel (Art. 222 / 233) — Revision 1.1.2024 (V-2!)

**Art. 222 — Rechtsmittel** (verbatim, **NEU per 1.1.2024**):
> «**Einzig die verhaftete Person** kann Entscheide über die Anordnung, die
> Verlängerung und die Aufhebung der Untersuchungs- oder Sicherheitshaft bei der
> **Beschwerdeinstanz** anfechten. **Vorbehalten bleibt Artikel 233.**»
→ **Befund:** Das frühere Anfechtungsrecht der StA gegen Haftentscheide ist
**entfallen** (alte BGE 137 IV 22/87/230 zur StA-Beschwerde überholt). Engine:
bei `entscheidtyp = zmg_haftentscheid` ist **nur** die verhaftete Person
legitimiert; Rechtsmittel = **Beschwerde** an die Beschwerdeinstanz (Frist 10 T.,
Art. 396 — Haft ist «in diesem Gesetz vorgesehener Fall» i. S. v. Art. 393
Abs. 1 lit. c). **[V-2 zu verifizieren]**

**Art. 233 — Haftentlassungsgesuch während Berufungsverfahren** (verbatim):
> «Die Verfahrensleitung des Berufungsgerichts entscheidet über Haftentlassungs-
> gesuche innert **5 Tagen**; dieser Entscheid ist **nicht anfechtbar.**»
→ Engine: `endgueltig=true` (Art. 380) → kein StPO-Rechtsmittel; nächste Stufe
nur BGG (Zwangsmassnahme, Art. 78 ff. — Frist 30 T., Art. 100).

---

## TEIL 3 — WEITERZUG ANS BUNDESGERICHT (Beschwerde in Strafsachen, Art. 78 ff. BGG)

**Art. 78 — Grundsatz:** «Das Bundesgericht beurteilt Beschwerden gegen
Entscheide **in Strafsachen**.» Abs. 2: auch Zivilansprüche (zusammen mit der
Strafsache) und Vollzug von Strafen/Massnahmen.

**Art. 80 — Vorinstanzen** (Anfechtbarkeit):
> «¹ Die Beschwerde ist zulässig gegen Entscheide **letzter kantonaler
> Instanzen** und gegen Entscheide der **Beschwerdekammer und der Berufungskammer
> des Bundesstrafgerichts.** ² Die Kantone setzen als letzte kantonale Instanzen
> **obere Gerichte** ein … Ausgenommen die Fälle, in denen nach StPO ein
> Zwangsmassnahmengericht oder ein anderes Gericht als einzige kantonale Instanz
> entscheidet.»
→ **Engine-Gate:** BGer setzt **letztinstanzlich kantonalen** Entscheid voraus
(in der Regel des Berufungsgerichts bzw. der Beschwerdeinstanz). **KEINE
Streitwertgrenze** im Strafrecht (anders als Zivil).

**Art. 81 — Beschwerderecht** (verbatim, Auszug, Fassung 1.1.2024):
> «¹ Zur Beschwerde … berechtigt, wer: a. vor der Vorinstanz am Verfahren
> teilgenommen … hat; und b. ein **rechtlich geschütztes Interesse** … hat,
> insbesondere: 1. die beschuldigte Person, 2. ihr gesetzlicher Vertreter,
> **3. die Staatsanwaltschaft, ausser bei Entscheiden über die Anordnung, die
> Verlängerung und die Aufhebung der Untersuchungs- und Sicherheitshaft**,
> … 5. die Privatklägerschaft, **wenn der angefochtene Entscheid sich auf die
> Beurteilung ihrer Zivilansprüche auswirken kann**, 6. die Person, die den
> Strafantrag stellt, soweit es um das Strafantragsrecht als solches geht …»
→ **Bestätigung V-2:** StA kann Haftentscheide **auch beim BGer nicht** anfechten
(Ziff. 3, rev. 2024 — kohärent mit Art. 222 StPO). **Privatklägerschaft** nur bei
Auswirkung auf Zivilansprüche (Ziff. 5).

**Art. 90 — Endentscheide:** Beschwerde gegen verfahrensabschliessende
Entscheide. **Art. 92 — Vor-/Zwischenentscheide über Zuständigkeit/Ausstand**
(selbständig anfechtbar; später nicht mehr). **Art. 93 — andere Vor-/
Zwischenentscheide:** nur bei (a) nicht wieder gutzumachendem Nachteil oder
(b) sofortigem Endentscheid mit Aufwandersparnis. **Art. 79 — Ausnahme:**
Beschwerde gegen Entscheide der Beschwerdekammer BStGer **unzulässig**, soweit
nicht Zwangsmassnahmen.

**Art. 100 Abs. 1 — Frist:** «innert **30 Tagen** nach der Eröffnung der
vollständigen Ausfertigung». Abs. 7: Rechtsverweigerung/-verzögerung **jederzeit**.

**Art. 46 — Stillstand (BGG-Ferien!):** anders als die StPO kennt das **BGG**
einen Fristenstillstand (Ostern; 15.7.–15.8.; 18.12.–2.1.) — **gilt aber nicht**
in Verfahren betr. aufschiebende Wirkung/vorsorgliche Massnahmen (Abs. 2 lit. a;
relevant für **Haftbeschwerden** ans BGer → kein Stillstand). → **Wichtige
Schnittstelle:** Auf der kantonalen StPO-Ebene NIE Stillstand; auf der
BGer-Ebene DOCH (ausser Haft/vorsorgliche Massnahmen). Engine-`fristHinweis` muss
beide Regime trennen (vgl. `bestimmeRechtsmittel`-`fristHinweis` im Zivilrecht).

---

## TEIL 4 — ENTSCHEIDBAUM-SKIZZE für die Engine `bestimmeStrafRechtsmittel`

### Eingaben (Input-Struktur, gespiegelt an `StrafInput`/`ZustaendigkeitInput`)

```
entscheidtyp:
  | 'urteil_erstinstanz'         // → Berufung (Art. 398/399)
  | 'verfahrensleitend_gericht'  // → kein Rechtsmittel (393 Abs. 1 lit. b a. E.)
  | 'anderer_entscheid_gericht'  // Beschluss/Verfügung erstinstanzl. → Beschwerde
  | 'verfuegung_sta_polizei'     // Vorverfahren (inkl. Einstellung/Nichtanhandn.) → Beschwerde
  | 'strafbefehl'                // → Einsprache (354)
  | 'zmg_haftentscheid'          // → Beschwerde, nur verhaftete Person (222)
  | 'zmg_andere_zwangsmassnahme' // → Beschwerde (393 Abs. 1 lit. c)
  | 'rechtskraeftiges_urteil'    // → Revision (410)
  | 'rechtsverweigerung'         // → Beschwerde fristlos (396 Abs. 2)
wer_ficht_an: 'beschuldigte_person' | 'privatklaegerschaft' | 'staatsanwaltschaft'
            | 'weitere_partei' | 'angehoerige'          // Legitimation 381/382/354
anfechtungsziel: 'umfassend' | 'nur_sanktion' | 'nur_zivilpunkt' | 'nur_kosten' // 382 Abs. 2!
uebertretung: boolean            // Kognitionsbeschränkung Berufung (398 Abs. 4)
nur_zugunsten_beschuldigte: boolean   // reformatio in peius (391 Abs. 2)
revisionsgrund?: 'noven_a' | 'widerspruch_b' | 'straftat_c' | 'emrk'   // → Frist 411
gerichtsbarkeit: 'kantonal' | 'bund'  // Instanz-Bezeichnung (Querverweis Bund-Dossier)
```

### Decision Tree (Statthaftigkeit → Frist/Trigger → Instanz → Kognition → Besonderheiten)

```
0 · LEGITIMATION (Gate, vor allem anderen):
    wer_ficht_an = privatklaegerschaft  &&  anfechtungsziel = nur_sanktion
        → HARD-STOP «Privatklägerschaft kann die Sanktion nicht anfechten» (382 II / 354 Ibis)
    wer_ficht_an = staatsanwaltschaft  &&  entscheidtyp = zmg_haftentscheid
        → HARD-STOP «StA nicht legitimiert in Haftsachen» (222 / 81 I Z. 3 BGG, rev. 2024)
    «rechtlich geschütztes Interesse» (382 I) = WEICHE/Gate (Tatfrage, §8)

1 · entscheidtyp = strafbefehl
        → EINSPRACHE bei der StA, 10 Tage ab Zustellung (354 I)
          Begründungspflicht = (wer_ficht_an != beschuldigte_person) (354 II)
          Besonderheit: Rückzugsfiktion bei Säumnis (355 II / 356 IV); kein Devolutiveffekt

2 · entscheidtyp = rechtsverweigerung / rechtsverzögerung
        → BESCHWERDE, FRISTLOS (396 II); Instanz Beschwerdeinstanz

3 · entscheidtyp = rechtskraeftiges_urteil (oder Strafbefehl/nachträgl. Entscheid)
        → REVISION beim Berufungsgericht (410/411)
          Frist: revisionsgrund ∈ {widerspruch_b, emrk} → 90 Tage ab Kenntnisnahme (411 II)
                 revisionsgrund ∈ {noven_a, straftat_c} → UNBEFRISTET (411 II Satz 2)
          Besonderheit: zugunsten auch nach Verjährung (410 III)

4 · entscheidtyp = urteil_erstinstanz
        → BERUFUNG (398 I).  ABER 394 lit. a: Berufung verdrängt Beschwerde.
          Frist 1 (ANMELDUNG): 10 Tage ab Eröffnung des Urteils/Dispositivs (399 I; 384 lit. a)
                                an das ERSTINSTANZLICHE Gericht
          Frist 2 (ERKLÄRUNG): 20 Tage ab Zustellung des BEGRÜNDETEN Urteils (399 III)
                                an das BERUFUNGSGERICHT
          Kognition: uebertretung ? eingeschränkt (398 IV, kein Novenrecht) : voll (398 II/III)
          Besonderheit: aufschiebende Wirkung im Anfechtungsumfang (402);
                        Anschlussberufung 20 Tage (400 III / 401); reformatio in peius (391 II)

5 · entscheidtyp ∈ {verfuegung_sta_polizei, anderer_entscheid_gericht,
                    zmg_haftentscheid, zmg_andere_zwangsmassnahme}
        → BESCHWERDE (393 I lit. a/b/c), 10 Tage ab Eröffnung (396 I)
          Instanz: Beschwerdeinstanz (Bund: Beschwerdekammer BStGer)
          Kognition: voll (393 II: Recht + Sachverhalt + Angemessenheit)
          zmg_haftentscheid: nur verhaftete Person (222) [V-2]
          verfahrensleitend_gericht → NICHT anfechtbar (393 I lit. b a. E.)

6 · WEITERZUG BGer (nachgelagert, immer als Hinweis):
        letztinstanzlich kantonaler Endentscheid (80) → Beschwerde in Strafsachen
        (78 ff.), 30 Tage (100 I), KEINE Streitwertgrenze; Legitimation 81;
        Vor-/Zwischenentscheide nur 92/93; BGG-Stillstand 46 (NICHT bei Haft)
```

### Konstellationstabelle (Zeilen-Tabelle wie im Zuständigkeits-Regelwerk)

| # | Entscheidtyp | Statthaftes Rechtsmittel | Frist · Trigger | Instanz | Kognition | Besonderheiten |
|---|---|---|---|---|---|---|
| 1 | Urteil erstinstanzl. Gericht | **Berufung** | 10 T. Anmeldung ab Urteilseröffnung (399 I) **+** 20 T. Erklärung ab Zustellung begründetes Urteil (399 III) | erstinstanzl. Gericht (Anmeldung) → Berufungsgericht (Erklärung) | voll (398 II/III); **Übertretung: eingeschränkt** (398 IV) | aufschiebende Wirkung (402); Anschlussberufung (401); reformatio in peius (391 II) |
| 2 | Übertretungs-Urteil erstinstanzl. | **Berufung** | wie #1 | wie #1 | **nur Rechtsfehler/Willkür, kein Novenrecht** (398 IV) | — |
| 3 | Verfügung/Verfahrenshandlung StA/Polizei (inkl. **Einstellung 322, Nichtanhandnahme 310**) | **Beschwerde** | 10 T. ab Eröffnung (396 I) | Beschwerdeinstanz | voll (393 II) | keine aufschiebende Wirkung (387) |
| 4 | Beschluss/Verfügung erstinstanzl. Gericht (nicht verfahrensleitend) | **Beschwerde** | 10 T. (396 I) | Beschwerdeinstanz | voll | 394 lit. a beachten (Berufung verdrängt) |
| 5 | **Verfahrensleitender** Entscheid des Gerichts | **kein** Rechtsmittel | — | — | — | 393 I lit. b a. E. (ggf. mit Endentscheid) |
| 6 | ZMG-Haftentscheid (Anordnung/Verlängerung/Aufhebung U-/Sicherheitshaft) | **Beschwerde** | 10 T. (396 I) | Beschwerdeinstanz | voll | **nur verhaftete Person** (222, rev. 2024) [V-2] |
| 7 | Haftentlassung im Berufungsverfahren (233) | **kein** StPO-Rechtsmittel (endgültig) | — | — | — | nur BGer (Zwangsmassnahme, 78 ff.) |
| 8 | Strafbefehl (StA) | **Einsprache** | 10 T. ab Zustellung (354 I) | StA (kein Devolutiveffekt) | — | Begründung ausser beschuldigte Person (354 II); Rückzugsfiktion (355 II/356 IV); Privatkläger ohne Sanktion (354 Ibis) |
| 9 | Übertretungs-Strafbefehl (Verwaltungsbehörde) | **Einsprache** | 10 T. (354 i. V. m. 357 II) | Übertretungsstrafbehörde | — | wie #8 |
| 10 | Rechtskräftiges Urteil/Strafbefehl/nachträgl. Entscheid | **Revision** | 90 T. (410 I lit. b / II) **oder unbefristet** (410 I lit. a/c) | Berufungsgericht | — | zugunsten auch nach Verjährung (410 III) |
| 11 | Rechtsverweigerung/-verzögerung | **Beschwerde** | **fristlos** (396 II) | Beschwerdeinstanz | voll | — |
| 12 | Letztinstanzl. kantonaler Endentscheid | **Beschwerde in Strafsachen BGer** | 30 T. (100 I BGG) | Bundesgericht | Rechtsfragen (95 ff. BGG) | keine Streitwertgrenze; Legitimation 81; BGG-Stillstand 46 (nicht Haft) |

---

## TEIL 5 — FRISTEN-TABELLE für Presets (analog `zpoPresets.ts`)

**Gemeinsame Fristmechanik (alle StPO-Fristen):** Beginn **Folgetag** des
auslösenden Ereignisses (Art. 90 Abs. 1); Ende auf Sa/So/Feiertag →
**nächstfolgender Werktag** (Art. 90 Abs. 2), **massgebend der Kanton von
Wohnsitz/Sitz der Partei bzw. des Rechtsbeistands** (Art. 90 Abs. 2 Satz 3 —
NICHT der Behördensitz!). **KEIN Gerichtsferien-Stillstand** (Art. 89 Abs. 2 —
ohne Vorbehalt, V-1). **Wiederherstellung** bei unverschuldeter Säumnis: Gesuch
innert 30 Tagen nach Wegfall des Säumnisgrundes + Handlung nachholen (Art. 94).
Postaufgabe/Anstaltsleitung am letzten Tag genügt (Art. 91).

| key | label | Norm | Länge | Trigger (dies a quo) | Fristnatur | Hinweis |
|---|---|---|---|---|---|---|
| `beschwerde` | Beschwerde | Art. 396 Abs. 1 StPO | 10 Tage | Eröffnung/Zustellung des Entscheids (384 lit. b) | gesetzlich, nicht erstreckbar (89 I) | schriftlich + begründet bei Beschwerdeinstanz |
| `beschwerde_rechtsverweigerung` | Beschwerde Rechtsverweigerung/-verzögerung | Art. 396 Abs. 2 StPO | — (fristlos) | jederzeit | — | keine Frist — Engine darf KEINE Frist berechnen |
| `berufung_anmeldung` | Berufung – Anmeldung | Art. 399 Abs. 1 StPO | 10 Tage | **Eröffnung des Urteils/Dispositivs** (384 lit. a) | gesetzlich | an erstinstanzliches Gericht, schriftl. oder mündl. zu Protokoll |
| `berufung_erklaerung` | Berufung – Berufungserklärung | Art. 399 Abs. 3 StPO | 20 Tage | **Zustellung des begründeten Urteils** | gesetzlich | an Berufungsgericht; Pflichtangaben (399 III a–c, IV) |
| `anschlussberufung` | Anschlussberufung | Art. 400 Abs. 3 / 401 StPO | 20 Tage | Empfang der Berufungserklärung | gesetzlich | fällt mit Hauptberufung dahin (401 III) |
| `revision_90` | Revision (relativ) | Art. 411 Abs. 2 StPO | 90 Tage | Kenntnisnahme (nur 410 I lit. b / Abs. 2 EMRK) | gesetzlich | übrige Gründe (410 I lit. a/c): **unbefristet** |
| `revision_unbefristet` | Revision (Noven/Straftat) | Art. 411 Abs. 2 Satz 2 StPO | — (unbefristet) | — | — | keine Frist; zugunsten auch nach Verjährung (410 III) |
| `einsprache_strafbefehl` | Einsprache Strafbefehl | Art. 354 Abs. 1 StPO | 10 Tage | Zustellung des Strafbefehls | gesetzlich | begründen ausser beschuldigte Person (354 II) |
| `haft_beschwerde` | Beschwerde Haftentscheid ZMG | Art. 222 i. V. m. 396 I StPO | 10 Tage | Eröffnung des Haftentscheids | gesetzlich | **nur verhaftete Person** (222, rev. 2024) [V-2] |
| `haftentlassung_berufung` | Haftentlassung Berufungsgericht | Art. 233 StPO | — | — | — | Entscheid innert 5 T., **nicht anfechtbar** |
| `wiederherstellung` | Fristwiederherstellung | Art. 94 Abs. 2 StPO | 30 Tage | Wegfall des Säumnisgrundes | gesetzlich | Handlung gleichzeitig nachholen |
| `bger_strafsachen` | Beschwerde in Strafsachen BGer | Art. 100 Abs. 1 BGG | 30 Tage | Eröffnung der vollständigen Ausfertigung | gesetzlich | **BGG-Stillstand Art. 46** (nicht bei Haft/vorsorgl. Massnahmen) |

**Ordnungsfristen der Behörden (nicht Parteifristen, nur als Hinweis):**
Beschwerde-Erledigung 6 Monate (397 V), Berufungs-Urteil 12 Monate (408 II),
ZMG-Haftentscheid 48 h (226 I), Haftentlassung Berufungsgericht 5 Tage (233).

---

## TEIL 6 — §2-Beurteilung · Wiederverwendung · Aufwand · Bau-Reihenfolge

### §2-Beurteilung (Determinismus)

- **§2-rein (feste Regel):** Statthaftigkeits-Routing (Entscheidtyp →
  Rechtsmittel), Fristlängen/-trigger, Instanz-Zuordnung, Kognitions-Stufe,
  reformatio-in-peius-Flag, aufschiebende-Wirkung-Flag, Revisionsgrund → Frist.
  Alles deterministisch aus den Eingaben ableitbar.
- **WEICHEN/Gates (Tatfrage/Subsumtion, §8 — NICHT automatisch):**
  «rechtlich geschütztes Interesse» (382 I), Abgrenzung Urteil ↔ verfahrens-
  leitend/anderer Entscheid (398/393/394), Reichweite der reformatio-Ausnahme
  (391 II Satz 2), «wesentlich mildere/strengere» Bestrafung bei Revision (410
  I lit. a). Diese als Ja/Nein-Gate an die fachkundige Person.

### Wiederverwendung (geteilte Bausteine, KEINE Fusion — §1/§4)

- **`bestimmeRechtsmittel` (zustaendigkeit.ts) als Bauform-Vorbild:**
  Output-Struktur spiegeln → `StrafRechtsmittelErgebnis { rechtsmittel,
  rechtsmittelText, frist, fristTrigger, instanz, kognition, aufschiebendeWirkung,
  reformatioInPeius, bger, bgerText, fristHinweis, normverweise, weichen,
  warnungen }`. `RechtsmittelErgebnis`-Bauform übernehmen, **eigene Engine-Datei**
  `src/lib/strafRechtsmittel.ts` (keine Fusion mit der Zivil-Engine).
- **Datenschicht/Records:** `StrafNorm`/`StrafSchritt`/`StrafFrist` aus
  `strafZustaendigkeit.ts` direkt wiederverwenden (gleiches Output-Vokabular).
- **Fristberechnung:** `fristenEngine` mit **`OHNE_STILLSTAND`** für ALLE
  Fristen (V-1!); Feiertage `src/data/zpoFeiertage.ts`, aber **Kantons-
  Anknüpfung = Partei-/Vertreter-Wohnsitz** (Art. 90 Abs. 2 Satz 3), nicht
  Gerichtsort — eigenes Eingabefeld (wie in `strafrecht-cluster.md` R3 erkannt).
  → Eine schlanke `stpoFristen.ts` (analog R3) bildet die Fristen, der
  Rechtsmittel-Rechner liefert nur das Preset (Trigger + Länge).
- **Preset-Schema:** `zpoPresets.ts`-Muster (key/label/norm/einheit/laenge/
  fristnatur/hinweis) → `stpoRechtsmittelPresets.ts`; Phasen statt ZPO-Phasen:
  {einsprache, beschwerde, berufung, revision, haft, bger, wiederherstellung}.
- **Bund-Spruchkörper** (Beschwerdekammer/Berufungskammer BStGer): Querverweis
  `bibliothek/behoerden/gerichte-bund.md` (SSoT, §5) — nicht hartkodieren.

### Aufwand

- **`strafRechtsmittel.ts` (Statthaftigkeits-Engine):** **Aufwand M.** Reines
  Routing + Output-Records; kleine verifizierte Konstellationstabelle (12 Zeilen
  oben). Logik trivial, Sorgfalt liegt in den Gates/Weichen.
- **`stpoRechtsmittelPresets.ts` + Anbindung an `stpoFristen.ts`:** **Aufwand S**,
  sofern `stpoFristen.ts` (R3) bereits gebaut ist; sonst R3 zuerst (Aufwand M).
- **BGer-Stufe:** **Aufwand S** (analog `bestimmeRechtsmittel`-BGer-Block; keine
  Streitwertgrenze → einfacher als Zivil).

### Priorisierte Bau-Reihenfolge (Empfehlung)

1. **`stpoFristen.ts` + StPO-Feiertags-Anknüpfung** (Fundament; R3 aus
   `strafrecht-cluster.md`). `OHNE_STILLSTAND`, Partei-Kanton. Aufwand M.
2. **`stpoRechtsmittelPresets.ts`** (Fristen-Tabelle Teil 5; koppelt an #1).
   Höchster Sofortnutzen (Einsprache/Berufung/Beschwerde-Fristen). Aufwand S.
3. **`strafRechtsmittel.ts`** (Statthaftigkeits-Engine, Decision Tree Teil 4 +
   BGer-Stufe). Aufwand M.
4. **UI-Anbindung** im bestehenden Rechner-Form-Muster (Legitimations-Gate
   prominent; reformatio in peius / aufschiebende Wirkung / kein Stillstand als
   Warn-Pills, §8).

**Wiederverwendungs-Karte:** `bestimmeRechtsmittel`-Bauform (Output) ·
`StrafNorm`/`StrafFrist`-Records (`strafZustaendigkeit.ts`) · `fristenEngine`+
`OHNE_STILLSTAND` · `zpoFeiertage` (Partei-Kanton!) · `zpoPresets`-Schema ·
Bund-Dossier (Querverweis). **Eigene Engines (§1/§4):** `strafRechtsmittel.ts`,
`stpoFristen.ts` — eigener Stillstand-Verzicht und Kantons-Anknüpfungspunkt
vertragen keine Fusion mit den Zivil-Engines.

---

## Belege / Quellen

- **Wortlaut (primär):** Fedlex-Cache `/tmp/stpo.html`, Konsolidierung 20240101
  (SR 312.0), Anker `art_89`–`art_94`, `art_222`, `art_233`, `art_354`–`art_356`,
  `art_379`–`art_415` — verbatim extrahiert 6.6.2026. BGG `/tmp/bgg.html`
  (SR 173.110): `art_46`, `art_78`–`art_81`, `art_90`, `art_92`, `art_93`,
  `art_100`.
- **Revision 1.1.2024 (AS 2023 468; BG 17.6.2022; BBl 2019 6697):** im Cache
  belegte Fussnoten zu Art. 222, 354, 381 (Abs. 4 aufgehoben), 388, 397 Abs. 5,
  408 Abs. 2; BGG Art. 81 Abs. 1 Ziff. 3.
- **WebSearch 6.6.2026 (V-0):** keine in Kraft getretene Schweizer Teilrevision
  der erfassten Artikel zwischen 1.1.2024 und Juni 2026 gefunden (Treffer
  betrafen deutsche StPO / laufende DE-Reformkommission). Eine Sekundärquelle
  zum Fristenstillstand wurde am Primärtext **widerlegt** (V-1, Art. 89 Abs. 2).
- **BGE:** Keine Rechtsprechung aus Primärquelle gegengeprüft; reformatio-in-
  peius-Ausnahme (391 II), Subsidiarität Beschwerde/Berufung (394 lit. a), neue
  Haft-Rechtsmittelordnung (222 rev. 2024) vor Engine-Übernahme nachrecherchieren
  (V-2/V-3/V-4).

**Hinweis zur Belastbarkeit (§7/§8):** Alle Wortlaut-Kerne sind verbatim am
Cache. Mehrere Tatbestände (rechtlich geschütztes Interesse, Urteil ↔
verfahrensleitend, reformatio-Ausnahme) verlangen juristische Subsumtion → in der
Engine als Ja/Nein-Gate, nicht automatisch. **`verified: true` / Status
«geprüft» setzt Davids Abnahme voraus.** **Keine Repo-Datei wurde geändert ausser
diesem Dossier.**
