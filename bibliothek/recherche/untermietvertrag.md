# Recherche-Dossier «Untermietvertrag» — Erweiterungs-Spezifikation der Mietvertrags-Vorlage

**Cluster:** Untermiete (Art. 262 OR) als Verzweigung von `mietvertrag.ts`
**Datum:** 6. Juni 2026
**Verfasser:** Recherche-Agent (für David, fachkundige Person)
**Status:** ENTWURF / Recherche — keine Engine geschrieben (Auftrag: nur dieses Dossier). Fachliche Abnahme durch David ausstehend (§7/§8). Keine Rechtsberatung.

## Quellenlage

- **OR** SR 220, Cache `/tmp/or.html` (Konsolidierung 1.1.2026). Anker empirisch
  geprüft und FOUND (Wortlaut byte-genau extrahiert): `art_262`, `art_263`,
  `art_257_e`, `art_257_f`, `art_266_e`, `art_270`, `art_266_l`, `art_291`.
- **Bestehende Bauform gelesen (nicht dupliziert):**
  `src/lib/vorlagen/mietvertrag.ts` (508 Z. — Schema/Bausteine/Gates/`objektTyp`-
  Weiche), `src/lib/vorlagen/engine.ts`-Muster (über
  `kuendigungs-masken.md` referenziert: `VorlageSchema`, `Bedingung`
  `eq|in|nichtLeer|and|or|not`, `assemble()`, «…Satz»-Fragmente verschwinden
  leer), `bibliothek/recherche/mietrecht-ausbau.md`,
  `bibliothek/recherche/kuendigungs-masken.md` (Maske 2a Mieterkündigung).
- **Praxis/BGE** Web (Juni 2026): BWO-Abstimmungsseite, gerichte-zh.ch
  (Untermiete-Voraussetzungen), mietrecht.ch, swissinfo (Abstimmung 24.11.2024).

---

## ⚠ RECHTSLAGE-ANKER: Die Untermiete-Revision ist NICHT in Kraft

**Verifiziert (Cache + Web, 6.6.2026):** Art. 262 OR gilt unverändert in der
**geltenden/alten Fassung** (Cache-Wortlaut unten). Die parlamentarische Vorlage
zur **Verschärfung der Untermiete** (15.455; schriftliches Gesuch + schriftliche
Zustimmung zwingend, Verweigerung u. a. bei Befristung über **2 Jahre**,
erleichterte Kündigung 30 Tage nach Mahnung) wurde in der **Volksabstimmung vom
24. November 2024 ABGELEHNT** (mit der zweiten mietrechtlichen Vorlage
«Eigenbedarf»). Sie ist **nie in Kraft getreten.**

**Konsequenz für die Vorlage (Verwechslungsgefahr in Sekundärquellen!):** Es
gilt KEINE Schriftform-Pflicht für die Zustimmung, KEINE 2-Jahres-Grenze, KEINE
erweiterten Verweigerungsgründe. Sekundärquellen aus 2023/2024, die diese Punkte
als künftiges Recht beschreiben, dürfen NICHT als geltendes Recht übernommen
werden. Im Dossier/Schema als Disclosure dokumentieren («gescheiterte Revision —
nicht in Kraft»). Quelle: BWO «Volksabstimmung vom 24. November 2024 über zwei
mietrechtliche Vorlagen»; swissinfo «Mietrecht: Beide Vorlagen erleiden
Schiffbruch».

---

## 1. NORMBASIS (geltendes Recht)

### 1.1 Art. 262 OR — Untermiete (Cache-Wortlaut, byte-genau)

> **Art. 262**
> ¹ Der Mieter kann die Sache mit Zustimmung des Vermieters ganz oder teilweise
> untervermieten.
> ² Der Vermieter kann die Zustimmung nur verweigern, wenn:
> a. der Mieter sich weigert, dem Vermieter die Bedingungen der Untermiete
>    bekanntzugeben;
> b. die Bedingungen der Untermiete im Vergleich zu denjenigen des
>    Hauptmietvertrags missbräuchlich sind;
> c. dem Vermieter aus der Untermiete wesentliche Nachteile entstehen.
> ³ Der Mieter haftet dem Vermieter dafür, dass der Untermieter die Sache nicht
> anders gebraucht, als es ihm selbst gestattet ist. Der Vermieter kann den
> Untermieter unmittelbar dazu anhalten.

**Kernbefunde:**
- **Zustimmung ist FORMFREI** (Abs. 1 sagt nur «mit Zustimmung», keine
  Schriftform). Schriftliche Einholung ist nur **Beweis**-empfehlung, nicht
  Gültigkeitsvoraussetzung. (Abgrenzung: Art. 263 OR — *Übertragung* an Dritten
  bei Geschäftsräumen — verlangt ausdrücklich «schriftliche Zustimmung»; das ist
  ein anderer Tatbestand, nicht Untermiete.)
- **Verweigerungsgründe Abs. 2 lit. a–c sind ABSCHLIESSEND.** Verweigert der
  Vermieter ohne einen dieser Gründe, kann der Mieter die Schlichtungsbehörde
  anrufen; die zu Unrecht verweigerte Zustimmung gilt nicht als erteilt, aber
  die Verweigerung ist unbeachtlich (gerichte-zh.ch).
- **Haftung Abs. 3:** Der Hauptmieter (= Untervermieter) haftet dem
  Hauptvermieter für vertragskonformen Gebrauch durch den Untermieter.
  **Direktanspruch** des Hauptvermieters gegen den Untermieter (Satz 2).

### 1.2 Verhältnis Untermiete ↔ Hauptmiete

Der **Untermietvertrag ist ein vollwertiger, eigenständiger Mietvertrag**
zwischen Hauptmieter (als **Untervermieter**) und **Untermieter**. → **Art. 253
ff. OR sind VOLL anwendbar** auf das Untermietverhältnis, insbesondere:
- **Kündigungsfristen/-termine** 266a ff. (für ganze Wohnung 3 Mt. / Geschäft
  6 Mt.; **möbliertes Zimmer 266e: 2 Wochen auf Ende einer einmonatigen
  Mietdauer** — Cache verifiziert, häufigster Untermiete-Fall!).
- **Kündigungsschutz** 271 ff. — gilt **auch** im Untermietverhältnis: der
  Untermieter kann eine Kündigung des Untervermieters als missbräuchlich
  anfechten und Erstreckung verlangen — **aber nur gegenüber dem Untervermieter**
  (seinem Vertragspartner), nicht gegen den Hauptvermieter (s. 1.4).
- **Amtliches Formular 266l Abs. 2** für die Kündigung **durch den
  Untervermieter** (Cache: Vermieterkündigung Wohn-/Geschäftsraum nur mit
  kantonalem Formular gültig, sonst nichtig 266o). → Der Untervermieter ist beim
  Kündigen «Vermieter» i. S. v. 266l! Gleiche §8-Grenze wie Maske 2b
  (kuendigungs-masken.md): LexMetrik liefert dafür keine Vollvorlage.
- **Anfangsmietzins-Formular 270 Abs. 2** (Cache verifiziert) — in
  Formularpflicht-Kantonen gilt die Pflicht **auch für den Untermietzins**
  (es ist ein neuer Mietvertrag über Wohnraum). → `MV_FORMULARPFLICHT`
  greift unverändert.
- **Kaution 257e** (Cache: max. 3 Monatszinse Wohnraum, Hinterlegung auf Namen
  des Untermieters) — der Untervermieter ist insoweit «Vermieter».
- **Mängelrechte, Hinterlegung** (259a ff.): der Untermieter hat sie gegen
  seinen Untervermieter.

### 1.3 Möblierte Zimmer (häufigster Untermiete-Fall)

Art. 266e OR (Cache): Bei möblierten Zimmern Kündigung mit **2 Wochen auf Ende
einer einmonatigen Mietdauer**. Dieser Kürzest-Termin ist bereits im
Mietkündigungs-Modell (`mietrecht.ts`, `objekt:'moebliertes_zimmer'`, vgl.
kuendigungs-masken.md Maske 2a) vorhanden und wird wiederverwendet.

### 1.4 Ende der Hauptmiete → Schicksal der Untermiete (BGE/Praxis)

**Verifizierte Rechtslage (gerichte-zh.ch, mietrecht.ch, h. L.):**
- Endet die **Hauptmiete**, hat der **Untermieter KEINEN Anspruch, in den
  Hauptmietvertrag einzutreten** (kein gesetzlicher Parteiwechsel; ein
  schweizerisches Pendant zu § 565 BGB existiert NICHT). Ein solcher Anspruch
  kann auch im Untermietvertrag nicht zulasten des Hauptvermieters vereinbart
  werden.
- Der **Untermieter muss die Sache herausgeben**; der Hauptvermieter kann die
  Räumung über den Direktanspruch (262 III) bzw. nach Beendigung gegen den
  Untermieter durchsetzen.
- **Erstreckung:** Der Untermieter kann Erstreckung nur gegenüber **seinem**
  Vertragspartner (dem Untervermieter) verlangen (271 ff.); diese läuft aber
  faktisch ins Leere, sobald die Hauptmiete endet, weil der Untervermieter dem
  Untermieter den Gebrauch dann nicht mehr verschaffen kann.
- **Schadenersatz:** Kann der Untervermieter wegen Wegfalls der Hauptmiete dem
  Untermieter den Gebrauch nicht weiter gewähren, wird er gegenüber dem
  Untermieter **schadenersatzpflichtig** (Nichterfüllung des Untermietvertrags).
  → Das ist das zentrale Risiko, das der Warn-Baustein (3b) adressiert.
- **Automatische Endigung?** Die Beendigung der Hauptmiete beendet den
  Untermietvertrag **nicht automatisch** (rechtlich getrennte Verträge); der
  Untermietvertrag muss eigenständig (form-/fristgerecht) gekündigt werden.
  Eine Klausel «endet automatisch mit der Hauptmiete» (auflösende Bedingung) ist
  in ihrer Wirksamkeit umstritten und kann den zwingenden Kündigungsschutz des
  Untermieters unterlaufen → daher **kein** Auto-Endigungs-Baustein, sondern
  ein **Warn-Baustein** (s. 3b). **[zu verifizieren: BGE-Anker zur Zulässigkeit
  einer auflösenden Bedingung im Untermietvertrag — David vorlegen.]**

**[Verifikations-TODO BGE:]** Konkrete Leitentscheide zum Schicksal der
Untermiete bei Hauptmietende und zum (fehlenden) Erstreckungsanspruch gegen den
Hauptvermieter sind vor `verified:true` mit Aktenzeichen zu hinterlegen
(Kandidaten: BGE 119 II 353 zum Untermietzins; BGE 134 III 446 / 138 III 59 zur
Untermiete-Kündigung — s. §4).

---

## 2. MISSBRAUCHS-GRENZE (Art. 262 Abs. 2 lit. b)

### 2.1 Grundsatz (BGE 119 II 353)

Massstab: «Aus der Untervermietung darf **kein Gewinn** erzielt werden, der nicht
durch **Leistungen des Untervermieters** gerechtfertigt ist» (BGE 119 II 353,
zit. bei gerichte-zh.ch — **[Aktenzeichen am Originaltext zu verifizieren]**).
Bezugsgrösse ist der **anteilige Hauptmietzins** (bei Teiluntermiete pro rata
nach Fläche/Nutzung).

### 2.2 Zulässige Zuschläge (Mehrleistungen)

Der Untermietzins darf den (anteiligen) Hauptmietzins übersteigen, **soweit
Mehrleistungen** dies rechtfertigen:
- **Möblierung** (Möblierungszuschlag),
- **Nebenleistungen** (Strom/Internet/Reinigung/Wäsche inbegriffen),
- **Verwaltungsaufwand/Risiko** des Untervermieters (eng).

**Richtwert (Praxis, [zu verifizieren]):** In der Lehre/Schlichtungspraxis wird
ein Aufschlag von **rund 50 %** über den anteiligen Hauptmietzins als Grenze
genannt, ab der ohne nachgewiesene Mehrleistungen/Investitionen Missbräuchlichkeit
indiziert ist (mietrecht.ch). **Kein gesetzlicher Prozentsatz** — Tat-/
Ermessensfrage der Schlichtungsbehörde. → Im Schema **nicht** als harte
Rechenregel, sondern als **Begründungs-/Warn-Gate** abbilden (§2: keine
Schätzung). Der zulässige Möblierungszuschlag selbst ist nicht deterministisch
herleitbar (Einzelfall, Zeitwert des Mobiliars) → reines Eingabe-/Hinweisfeld.

### 2.3 Rechtsfolgen unbewilligter/missbräuchlicher Untermiete (Art. 257f Abs. 3)

Cache-Wortlaut Art. 257f Abs. 3: Verletzt der Mieter trotz **schriftlicher
Mahnung** weiter seine Pflicht zu Sorgfalt/Rücksichtnahme, so dass die Fortsetzung
unzumutbar wird, kann der Vermieter «bei Wohn- und Geschäftsräumen mit einer
Frist von **mindestens 30 Tagen auf Ende eines Monats**» kündigen.

**Voraussetzungen-Kette (BGE 134 III 446 / 138 III 59 — [zu verifizieren]):**
unbewilligte bzw. rechtsmissbräuchliche Untermiete (z. B. dauerhafte
Vollüberlassung **ohne Rückkehrabsicht** = faktischer Mieterwechsel →
Rechtsmissbrauch) → **schriftliche Abmahnung** des Hauptmieters durch den
Hauptvermieter → Fortsetzung trotz Abmahnung → **ausserordentliche Kündigung
257f Abs. 3**. Bei diesem schweren Verstoss tritt das Unzumutbarkeits-
Erfordernis in den Hintergrund, wird aber nicht vollständig aufgegeben (BGE
134 III 446). → Das begründet das **Zustimmungs-Gate** (3c): fehlende Zustimmung
ist für den Hauptmieter ein reales Kündigungs-/Auflösungsrisiko.

---

## 3. SPEZIFIKATION — ERWEITERUNG von `mietvertrag.ts`

**Leitprinzip (§1/§6/§10):** Die bestehende Vorlage bleibt **unverändert das
Default-Verhalten**. Neue Weiche

```ts
mietverhaeltnis: 'hauptmiete' | 'untermiete'   // Default 'hauptmiete'
```

Bei `'hauptmiete'` (Default) liefert die Vorlage **byte-identisch** das heutige
Ergebnis (Golden-Output-Pflicht nach §6). Alle Untermiete-Logik hängt an
`includeIf {feld:'mietverhaeltnis', eq:'untermiete'}` bzw. an abgeleiteten Feldern.
Die `objektTyp`-Weiche (`wohnung|geschaeftsraum`) läuft **orthogonal** weiter
(Untermiete gibt es für beide, s. 3f).

### 3a) Feldkatalog — NUR Zusatz-/geänderte Felder

| Feld | Typ | Pflicht (wenn Untermiete) | speist |
|------|-----|---------|--------|
| `mietverhaeltnis` | select(hauptmiete/untermiete) | ja | Master-Weiche, alle Bausteine/Gates |
| **Hauptmietvertrag-Referenz** | | | |
| `hmVermieterName` | text | ja | Präambel-Baustein U01 |
| `hmDatum` | datum | nein | U01 (Hauptvertrag vom …) |
| `hmMietzinsCHF` | text(CHF) | ja | U01 + Missbrauchs-Gate |
| `hmObjektUmfang` | text | nein | U01 (Beschrieb Hauptmietsache) |
| **Zustimmungsstatus** | | | |
| `zustimmungStatus` | select(schriftlich/muendlich/angefragt/nicht_angefragt) | ja | Zustimmungs-Baustein U02 + Gate G-Z |
| `zustimmungDatum` | datum | nein | U02 |
| **Untermietzins / Mehrleistung** | | | |
| (`mietzinsNettoCHF` bestehend) | — | — | dient hier als **Untermietzins** |
| `untermieteUmfang` | select(ganz/teilweise) | ja | U-Objekt-Baustein, Missbrauchs-Bezug |
| `untermieteZimmerBeschrieb` | text | wenn teilweise | U-Objekt (welche Räume/Mitbenutzung) |
| `mehrleistungBegruendung` | textarea | wenn Untermietzins > anteiliger HM-Zins | U-Mietzins-Baustein + Gate G-M |
| `moebliert` | checkbox | nein | aktiviert 266e-Hinweis (2-Wochen-Frist) |
| **Befristung** (bestehende `befristet`/`befristetBis` wiederverwenden) | — | — | M03_*-Bausteine laufen mit |

Hinweis: Parteien-Felder werden **umgedeutet**, nicht neu angelegt (s. 3d):
`vermieterName/-Adresse` = **Untervermieter** (= Hauptmieter), `mieterName/-Adresse`
= **Untermieter**.

### 3b) Neue BAUSTEINE (Platzhalter wie engine.ts; nur bei Untermiete)

- **U01_praeambel** (`includeIf mietverhaeltnis=untermiete`, vor M02_objekt):
  «Der Untervermieter ist Mieter der Hauptmietsache gemäss Hauptmietvertrag mit
  **{{hmVermieterName}}**{{hmDatumSatz}} (Hauptmietzins CHF {{hmMietzinsFmt}}).
  Mit diesem Vertrag vermietet er die Sache ganz/teilweise unter (Art. 262 OR).»
  Norm 262.
- **U02_zustimmung** (`includeIf mietverhaeltnis=untermiete`):
  Text variiert nach `zustimmungStatus`:
  - *schriftlich/mündlich:* «Der Hauptvermieter hat der Untervermietung
    zugestimmt{{zustimmungDatumSatz}} (Art. 262 Abs. 1 OR). Die Zustimmung ist
    formfrei gültig; ihre schriftliche Festhaltung dient dem Beweis.»
  - *angefragt/nicht_angefragt:* (kein zustimmender Text — stattdessen greift
    Gate G-Z, s. 3c). Norm 262 Abs. 1.
- **U03_gebrauch_haftung** (`includeIf mietverhaeltnis=untermiete`, ergänzt/ersetzt
  Untermiete-Passage in M08_gebrauch): «Der Untermieter darf die Sache nur in dem
  Umfang gebrauchen, der dem Untervermieter nach dem Hauptmietvertrag gestattet
  ist. Der Untervermieter haftet dem Hauptvermieter für den vertragskonformen
  Gebrauch; der Hauptvermieter kann den Untermieter unmittelbar dazu anhalten
  (Art. 262 Abs. 3 OR).» Norm 262 Abs. 3.
- **U04_endigungskopplung (WARN-Baustein)** (`includeIf mietverhaeltnis=untermiete`):
  «**Hinweis:** Endet der Hauptmietvertrag, kann der Untervermieter dem
  Untermieter den weiteren Gebrauch nicht mehr verschaffen; der Untermieter hat
  **keinen Anspruch, in den Hauptmietvertrag einzutreten** und keinen
  Erstreckungsanspruch gegen den Hauptvermieter. Dieser Untermietvertrag endet
  dadurch jedoch **nicht automatisch**; er ist eigenständig form- und
  fristgerecht zu kündigen (Art. 266a ff./266l OR). Der Untervermieter kann
  gegenüber dem Untermieter schadenersatzpflichtig werden.» **Rechtlich KEINE
  auflösende Wirkung** — bewusst nur Warnung (s. 1.4). Norm 262/266a.
- **U05_untervermieter_pflichten** (optional): Verweis auf Mängelrechte/Übergabe
  (laufen über bestehende Bausteine, s. 3d).

### 3c) GATES (deterministisch, in `pruefeMvGates` analog G1–G9)

- **G-Z — Zustimmung (WARNUNG, kein Blocker — begründet):**
  `mietverhaeltnis=untermiete` UND `zustimmungStatus ∈ {angefragt, nicht_angefragt}`
  → **dicke Warnung**, **kein** harter Blocker. **Begründung:** Die Untermiete
  ist auch ohne (noch) erteilte Zustimmung zivilrechtlich **nicht nichtig**; das
  Risiko ist die **ausserordentliche Kündigung des Hauptmietvertrags nach
  vorheriger schriftlicher Abmahnung** (Art. 257f Abs. 3 OR; BGE 134 III 446).
  Ein Blocker wäre fachlich falsch (Vertrag ist gültig), würde aber das reale
  Risiko verschweigen → starke Warnung mit Normhinweis ist das korrekte Mittel
  (§8). Text: «Ohne Zustimmung des Hauptvermieters riskiert der Untervermieter
  nach schriftlicher Abmahnung die ausserordentliche Kündigung des
  Hauptmietvertrags (Art. 257f Abs. 3 OR; BGE 134 III 446 — zu verifizieren).
  Zustimmung vor Bezug einholen; sie ist formfrei, aber beweishalber schriftlich
  festzuhalten. Verweigerung ist nur aus den Gründen von Art. 262 Abs. 2 OR
  zulässig.»
- **G-M — Missbräuchlicher Untermietzins (WARNUNG/Gate):**
  Wenn `mietzinsNettoCHF` (= Untermietzins) **>** anteiliger Hauptmietzins
  (`hmMietzinsCHF`, bei `untermieteUmfang=ganz` voll, bei `teilweise` als
  Vergleichsgrösse mit Hinweis «anteilig zu bestimmen») **und**
  `mehrleistungBegruendung` leer → Warnung: «Der Untermietzins liegt über dem
  (anteiligen) Hauptmietzins. Ein Aufschlag ist nur zulässig, soweit ihn
  **Mehrleistungen** (Möblierung, Nebenleistungen) rechtfertigen (Art. 262
  Abs. 2 lit. b OR; BGE 119 II 353). Ohne solche Begründung ist der
  Untermietzins missbräuchlich und der Hauptvermieter kann die Zustimmung
  verweigern; Richtwert der Praxis: Aufschläge über rund 50 % gelten ohne
  Investitionen/Mehrleistungen als missbräuchlich — kein gesetzlicher Satz, zu
  verifizieren.» Wird `mehrleistungBegruendung` ausgefüllt → Warnung entfällt,
  Begründung erscheint im Baustein. **§2:** Kein automatisch berechneter
  zulässiger Höchstzins (Ermessen) — nur Vergleich + Begründungspflicht.
- **objektTyp-Interaktion:** Bei `objektTyp=geschaeftsraum` + Untermiete gilt
  Art. 262 ebenso (Cache: 262 steht im allgemeinen Mietteil, gilt für Wohn- und
  Geschäftsräume). **Abgrenzungs-Hinweis (kein Gate):** Die *Übertragung* des
  Geschäftsmietverhältnisses auf einen Dritten (Art. 263 OR, schriftliche
  Zustimmung, Parteiwechsel) ist **etwas anderes** als Untermiete — nicht
  vermischen. **Pacht (Art. 291 OR — Unterpacht/Vermietung durch den Pächter)
  AUSKLAMMERN:** anderer Tatbestand (Pachtrecht), nicht von dieser Vorlage
  abgedeckt — Hinweis «für Pacht/Unterpacht (Art. 291 OR) nicht geeignet».

### 3d) Bestehende Bausteine, die UNVERÄNDERT mitlaufen — und nötige Parametrisierung «Vermieter/Mieter» → «Untervermieter/Untermieter»

Mitlaufend **ohne inhaltliche Änderung** (nur Rollen-Beschriftung):
- **M06_kaution (257e)** — Untervermieter ist «Vermieter»; max. 3 Monatszinse
  Wohnraum gilt (G1 unverändert).
- **M04/M04b Nebenkosten (257a)**, **M06b Zahlungsverzug (257d)**,
  **M07 Unterhalt/Mängel (256)**, **M12 Kündigung (266l ff.)**,
  **M13 Rückgabe (267)** — alle gelten im Untermietverhältnis voll.
- **M03_* Beginn/Dauer/Befristung**, **M14/M15 Schluss/Unterschriften.**

**Parametrisierung nötig (Darstellungsschicht, §3 — kein Logikeingriff):** Wo
die Bausteintexte und Unterschriftslabels «Vermieter»/«Mieter» nennen, müssen
sie bei `mietverhaeltnis=untermiete` als **«Untervermieter»/«Untermieter»**
erscheinen. Umsetzung **ohne** Duplikat der Bausteine: ein abgeleitetes
Rollen-Vokabular in `mvZusammenstellen` (z. B. `{{rolleV}}`/`{{rolleM}}` =
'Vermieter'/'Mieter' bzw. 'Untervermieter'/'Untermieter') und die fixen Labels
in M01_parteien / M15_unterschriften / Disclaimer entsprechend über Platzhalter
führen. **§6-Pflicht:** Da heute Klartext «Vermieter» in den Bausteinen steht,
ist die Umstellung auf `{{rolleV}}` ein verhaltensneutraler Schritt **nur** für
den Hauptmiete-Default (Golden-Output identisch), bevor die Untermiete-Werte
gesetzt werden.

**Inhaltlich angepasst** bei Untermiete:
- **M08_gebrauch:** Die bestehende Untermiete-Passage («Untervermietung bedarf
  der Zustimmung …») ist für den **Hauptmietvertrag** geschrieben (Mieter darf
  untervermieten). Im **Unter**mietvertrag wird sie durch U03 (262 III, Haftung
  nach oben) ersetzt bzw. um die Weitergabe-an-Dritte-Frage ergänzt
  (Unter-Untermiete praktisch selten — als Zustimmungsvorbehalt belassen).
- **M02_objekt:** ergänzt um `untermieteUmfang`/`untermieteZimmerBeschrieb`
  (teilweise: welche Räume, welche Mitbenutzung Küche/Bad).

### 3e) ausgabeArt / Hinweise

- **`format:'vertrag'`** (wie Hauptmiete), Ausgabe **fertig** (unterschreibbares
  Endprodukt; Untermietvertrag ist formfrei gültig, beidseitige Unterschrift
  erfüllt die Schriftform der allfälligen Index-/Staffel-Klauseln). PDF + DOCX
  wie Hauptmiete.
- **Disclaimer-Zusatz Untermiete:** (i) Zustimmung des Hauptvermieters ist
  formfrei, aber dringend einzuholen/zu dokumentieren; (ii) **Formularpflicht-
  Kantone (Art. 270 Abs. 2 OR) gelten AUCH für den Untermietzins** — in BS/BE/FR/
  GE/LU/ZG/ZH (ganz) bzw. NE/VD (teilw.) ist der Anfang**untermiet**zins mit dem
  amtlichen Formular mitzuteilen, sonst nichtig (`MV_FORMULARPFLICHT`
  wiederverwenden); (iii) Kündigung **durch den Untervermieter** braucht das
  amtliche Formular (266l Abs. 2) → §8-Grenze wie Maske 2b; (iv) Hinweis auf die
  **gescheiterte Revision** (nicht in Kraft, s. Rechtslage-Anker).

### 3f) objektTyp × mietverhaeltnis — Matrix

| objektTyp ↓ / mietverhaeltnis → | hauptmiete (Default) | untermiete |
|---|---|---|
| wohnung | heutige Vorlage (unverändert) | + U01–U04, G-Z/G-M, 270/257e/266e gelten |
| geschaeftsraum | heutige Vorlage (unverändert) | 262 gilt ebenso; Abgrenzung 263 (Übertragung) als Hinweis |
| (Pacht 291) | — nicht abgedeckt — | — ausgeklammert (Hinweis) |

---

## 4. §2-Beurteilung, Aufwand, Verifikations-TODOs, Bau-Reihenfolge

### §2-Beurteilung (Determinismus)
- **Voll deterministisch baubar:** Weiche, Bausteine, Rollen-Parametrisierung,
  Formularpflicht-/266e-/257e-Hinweise (alles regelbasiert, wiederverwendete
  Daten/Engines). ✅
- **G-Z (Zustimmung):** deterministische Statusprüfung → Warnung. ✅ (Blocker
  bewusst NICHT, da Vertrag gültig — s. 3c.)
- **G-M (Untermietzins):** deterministischer **Vergleich** (Untermietzins vs.
  HM-Zins) + Begründungspflicht. **Nicht** deterministisch: der zulässige
  Zuschlag/Höchstzins (Ermessen, Zeitwert Mobiliar) → Eingabe-/Warnfeld, kein
  gerechneter Wert (§2/§8).
- **Erstreckungs-/Härteabwägung** des Untermieters: Ermessen → nicht berechnen,
  nur Rechtslage anzeigen (konsistent mit mietrecht-ausbau.md §2.5).

### Aufwand
- Weiche + neue Bausteine + Gates G-Z/G-M: **M.**
- Rollen-Parametrisierung der bestehenden Bausteine (verhaltensneutraler §6-Schritt
  zuerst): **S–M.**
- Wiederverwendung: `MV_FORMULARPFLICHT`, `MV_PARAMETER`, Kautions-/NK-/
  Kündigungs-Bausteine, `mietrecht.ts` (266e/266l für die Kündigungs-Seite),
  Wizard-Rahmen — **kein** neues Logik-Duplikat (§4/§10).

### Verifikations-TODOs (vor `verified:true` durch David)
1. **BGE 119 II 353** (Untermietzins-Gewinnverbot) — Aktenzeichen/Wortlaut am
   Original prüfen.
2. **BGE 134 III 446** (ausserordentliche Kündigung 257f III bei
   unbewilligter/rechtsmissbräuchlicher Untermiete; Unzumutbarkeit tritt
   zurück) — verifizieren; ergänzend **BGE 138 III 59** (Untermiete/Kündigung,
   Rückkehrabsicht) und **BGE 134 III 300** prüfen.
3. **Schicksal der Untermiete bei Hauptmietende** (kein Eintritt, kein
   Erstreckungsanspruch gegen Hauptvermieter, Schadenersatz des Untervermieters)
   — Schweizer Leitentscheid mit Aktenzeichen hinterlegen (die obigen Web-Quellen
   mischen teils DE-Recht §565 BGB — **nur Schweizer Quellen verwenden**).
4. **Auflösende Bedingung «endet mit Hauptmiete»** — Zulässigkeit/Grenzen
   (Umgehung Kündigungsschutz) mit BGE belegen; bis dahin nur Warn-Baustein U04
   (keine Auto-Endigung).
5. **Praxis-Richtwert ~50 % Zuschlag** — als Praxis, nicht Gesetz, deklariert;
   Schlichtungs-/Lehre-Beleg sichern.
6. **Rechtslage-Anker bestätigt:** Revision 15.455 in Volksabstimmung 24.11.2024
   abgelehnt — verifiziert (BWO/swissinfo). Im Code-Kommentar dokumentieren.

### Bau-Reihenfolge
1. **§6-Vorbereitung:** Rollen-Vokabular (`{{rolleV}}`/`{{rolleM}}`) einführen,
   Golden-Output Hauptmiete identisch beweisen.
2. **Weiche `mietverhaeltnis`** + Defaults (Hauptmiete unverändert).
3. **Felder 3a** + abgeleitete Felder in `mvZusammenstellen`.
4. **Bausteine U01–U04** (`includeIf untermiete`).
5. **Gates G-Z, G-M** in `pruefeMvGates`.
6. **Disclosures 3e** (Formularpflicht-Untermietzins, 266l-Untervermieter-
   Kündigung, gescheiterte Revision).
7. Wizard-Seite (Darstellung) + Regressionstests; danach David-Abnahme (§7/§8).
