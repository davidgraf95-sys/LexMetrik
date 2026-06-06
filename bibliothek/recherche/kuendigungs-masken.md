# Kündigungen — Masken-Spezifikation (Wizard-Baufertig)

**Erstellt:** 6.6.2026 · **Autor:** Recherche-Agent (Sidequest David)
**Zweck:** Diese Datei ist die **Bauspezifikation**, aus der die Wizard-Masken
der Kündigungs-Familie direkt umgesetzt werden können — Feldkatalog,
Schritte, Bausteine (mit Platzhaltern), Gates/Blocker, Engine-Verzahnung,
`ausgabeArt`/Banner. Sie **vertieft** das Recherche-Dossier
`arbeitsrecht-vorlagen.md` (Vorlagen 1/2) auf Maskenebene und ergänzt
Mietrecht- und Allgemein-Kündigungen.

**Wortlaut-Quelle OR:** Fedlex SR 220, Cache `/tmp/or.html`,
Konsolidierung «1.1.2026», Anker-Format `id="art_266_l"` /
`id="art_404"` (sprachunabhängig, §7). **Abrufdatum 6.6.2026.**
**VVG:** Web-Recherche 6.6.2026 (Stand rev. VVG, in Kraft 1.1.2022).

**Status: ENTWURF / Recherche.** Fachliche Abnahme durch David ausstehend
(§7). Keine Rechtsberatung (§8).

**Bauform-Referenzen (gelesen, nicht dupliziert):**
- `src/lib/vorlagen/engine.ts` — `VorlageSchema` (`format`, `ausgabeArt`,
  `bausteine[]` mit `includeIf`/`rolle`/`norm`/`begruendung`/`hinweis`),
  `Bedingung` (`eq|in|nichtLeer|and|or|not`), `assemble()`. Platzhalter
  `{{feld}}`; Fragmente auf «…Satz»/«…Zeile» verschwinden leer ersatzlos,
  sonst erscheint «________».
- `src/lib/vorlagen/arbeitsvertrag.ts` + `src/pages/VorlageArbeitsvertrag.tsx`
  — Muster für Antworten-Typ, `AV_DEFAULTS`, `pruefe…Gates → {blocker,
  warnungen, hinweise}`, SCHRITTE-Array, `…Zusammenstellen()` (abgeleitete
  Felder), Form-Gate-Sektion + `ExportLeiste`.
- `src/components/vorlagen/wizard.tsx` — `VorlagenWizardRahmen`,
  `VorschauPanel`, `ExportLeiste` (PDF/DOCX lazy), Absatz-Rollen
  (`absender|adressat|datumzeile|betreff|parteien|schlussformel|unterschrift`).
- **Live-Engines** (rein/deterministisch, nicht neu schreiben — §3/§5):
  - `src/lib/kuendigungsfrist.ts` `berechneKuendigungsfrist(KuendigungsfristInput)`
    → `{ergebnis, beendigungsdatum, istProbezeit, fristMonate}`.
  - `src/lib/sperrfristen.ts` `berechneSperrfristen(SperrfristenInput)`
    → `{status:'ok'|'nichtig', beendigungISO, gehemmtTage,
    fruehesteNeueKuendigungISO, sperrIntervalle, sperrtage}`.
  - `src/lib/mietrecht.ts` `berechneMietkuendigung(MietInput)`
    → `{status:'ok'|'nichtig', endterminISO, spaetesterZugang,
    verfehlterTermin, zahlungsfristEnde, anfechtungBis, erstreckungBis}`.
    **Wichtig:** Die Mietengine prüft Form/Nichtigkeit (266l–266o) bereits
    intern — die Maske mappt nur die Felder und übernimmt den Blocker.

**Verifikations-TODOs (gesammelt, siehe je Maske):**
- [ ] BGE 137 III 303 / 137 III 208 / 140 III 244 — Zugang/Empfangstheorie,
      eingeschriebener Brief, Abholfrist 7 Tage. (Mietengine zitiert 137 III 208
      / 140 III 244 bereits; arbeitsrechtl. Pendant 137 III 303 [zu verifizieren].)
- [ ] **Art. 35b VVG** exakter Wortlaut (ausserordentliche Kündigung, wichtiger
      Grund) — nur sinngemäss bestätigt; Fedlex-Wortlaut nachtragen.
- [ ] **Halbzwingend/zwingend-Klassifikation Art. 35a–35c VVG** (Art. 97/98 VVG):
      35a wird als für beide Parteien geltend bestätigt; ob Abweichung nur
      zugunsten VN zulässig ist [zu verifizieren].
- [ ] VVG-Sonderfälle Lebensversicherung (ausgenommen vom ordentlichen Recht?)
      und Krankenzusatz/Kollektiv-KTG (Art. 35c: Nichtigkeit von Klauseln, die
      laufende Leistungen bei Vertragsende beschränken) — Wortlaut prüfen.
- [ ] Art. 264 OR Nachmieter «zumutbar/zahlungsfähig/bereit zu gleichen
      Bedingungen» — Wortlaut verbatim entnommen (siehe unten); Praxis zur
      angemessenen Such-/Prüffrist des Vermieters [zu verifizieren].

**Quellenlage Kernwortlaut (verbatim aus Cache `/tmp/or.html`, 6.6.2026):**
- **Art. 266l OR** — Abs. 1: «Vermieter und Mieter von Wohn- und
  Geschäftsräumen müssen schriftlich kündigen.» Abs. 2: «Der Vermieter muss
  mit einem Formular kündigen, das vom Kanton genehmigt ist und das angibt,
  wie der Mieter vorzugehen hat, wenn er die Kündigung anfechten oder eine
  Erstreckung des Mietverhältnisses verlangen will.»
- **Art. 266m OR** — Abs. 1: «Dient die gemietete Sache als Wohnung der
  Familie, kann ein Ehegatte den Mietvertrag nur mit der ausdrücklichen
  Zustimmung des anderen kündigen.» Abs. 3: «Die gleiche Regelung gilt bei
  eingetragenen Partnerschaften sinngemäss.» (→ MIETER-Kündigung!)
- **Art. 266n OR** — Vermieterkündigung + Zahlungsfrist-Androhung (257d)
  «separat zuzustellen» an Mieter UND Ehegatte/eingetr. Partner/in.
- **Art. 266o OR** — Nichtigkeit der Kündigung bei Formverstoss (Titelzeile;
  von der Mietengine als `status:'nichtig'` umgesetzt).
- **Art. 266e OR** — «Bei der Miete von möblierten Zimmern und von gesondert
  vermieteten Einstellplätzen oder ähnlichen Einrichtungen können die Parteien
  mit einer Frist von zwei Wochen auf Ende einer einmonatigen Mietdauer
  kündigen.»
- **Art. 264 OR** — Abs. 1: Rückgabe ohne Frist/Termin befreit nur, wenn der
  Mieter «einen für den Vermieter zumutbaren neuen Mieter vorschlägt; dieser
  muss zahlungsfähig und bereit sein, den Mietvertrag zu den gleichen
  Bedingungen zu übernehmen». Abs. 2: sonst Mietzins bis zum Zeitpunkt, in dem
  das Verhältnis ordentlich enden könnte. Abs. 3: Anrechnung ersparter Auslagen
  und anderweitigen Gewinns.
- **Art. 318 OR** — «Ein Darlehen, für dessen Rückzahlung weder ein bestimmter
  Termin noch eine Kündigungsfrist noch der Verfall auf beliebige Aufforderung
  hin vereinbart wurde, ist innerhalb sechs Wochen von der ersten Aufforderung
  an zurückzubezahlen.»
- **Art. 404 OR** — Abs. 1: «Der Auftrag kann von jedem Teile jederzeit
  widerrufen oder gekündigt werden.» Abs. 2: «Erfolgt dies jedoch zur Unzeit,
  so ist der zurücktretende Teil zum Ersatze des dem anderen verursachten
  Schadens verpflichtet.»
- **Art. 35a VVG (rev., Web 6.6.2026):** Vertrag — auch bei längerer Dauer
  (Laufzeit > 3 Jahre) — kündbar «auf das Ende des dritten oder jedes folgenden
  Jahres» mit **3 Monaten Frist**, schriftlich/textnachweisbar; **gleiche
  Fristen für beide Parteien**; frühere Kündbarkeit vereinbar.

---

## Methodischer Befund: Wo §2/§8 die Grenze zieht

Alle hier behandelten Kündigungen sind **formfrei** oder unterliegen einer
**Schriftform** (Mietsache Wohn-/Geschäftsraum: 266l Abs. 1; VVG: schriftlich
oder textnachweisbar). Schriftform ist ein **Faktum** (Brief unterschreiben),
kein generierbarer Inhalt → die Masken liefern ein konsistentes, risikoarmes
Muster + korrekte Rechtsfolgen + Live-Engine-Termine. **Voll deterministisch**
baubar: AN-, AG-, Mieter-Kündigung, Allgemeine Vertragskündigung mit Presets.
**§8-Grenze:** VERMIETER-Kündigung Wohn-/Geschäftsraum ist **keine Vollvorlage**
(amtliches kantonales Formular zwingend, 266l Abs. 2) → nur Checkliste +
Verweis. Begründungen (Pflichtverletzung, wichtiger Grund) bleiben überall
Nutzer-Freitext (Würdigung, §2).

---

# Geteilte Module der Familie (§10) — ZUERST bauen

Diese Bausteine/Felder wiederholen sich in jeder Maske und sollten als
**gemeinsame Schema-Fragmente** (nicht als Kopien) angelegt werden. Sie liegen
in der **Darstellungs-/Schema-Schicht**, enthalten keine Rechtsregeln (§3).

**M1 — Absender-Block** (`rolle:'absender'`): Name/Firma + Adresse der
kündigenden Partei. Antworten-Felder `absenderName`, `absenderAdresse`;
abgeleitet `{{absenderBlock}}` = `[name, adresse].filter(Boolean).join('\n')`.

**M2 — Adressat-Block** (`rolle:'adressat'`): Gegenpartei (Empfänger).
Felder `adressatName`, `adressatAdresse`; `{{adressatBlock}}`.

**M3 — Ort/Datum-Zeile** (`rolle:'datumzeile'`): Text rechtsbündig,
`{{ort}}, {{datumFmt}}` (Erklärungsdatum; `fmtDatumLang`).

**M4 — Betreff** (`rolle:'betreff'`, fett + Haarlinie): maskenspezifisch
(«Kündigung des Arbeitsverhältnisses» etc.).

**M5 — Zugangs-/Beweis-Hinweis** (Hinweis-Baustein, kein Brieftext):
«Massgebend ist der **Zugang** beim Empfänger (Empfangstheorie), nicht das
Absendedatum. Empfehlung: eingeschrieben **und** A-Post (Beweis + zeitnaher
Zugang). Bei eingeschrieben gilt der Zugang i. d. R. mit Abholung bzw. am
Folgetag der Abholungseinladung — die zivilprozessuale 7-Tage-Zustellfiktion
gilt im materiellen Recht NICHT.» (Wortlaut deckungsgleich mit dem
Rechenweg-Annahmetext der Mietengine — SSoT, §5; arbeitsrechtl. Variante
spiegelt `kuendigungsfrist.ts`-`annahmen`.)

**M6 — Unterschriften** (`rolle:'unterschrift'`): eine Linie (einseitige
Kündigung) bzw. zwei Linien (Vereinbarung / Familienwohnung-Zustimmung). Text
`{{ort}}, {{datumFmt}}\n\n___________________________\n{{absenderName}}`.

**M7 — Schlussformel** (`rolle:'schlussformel'`): «Freundliche Grüsse».

**M8 — gemeinsamer Banner-Baustein** «formfrei/Schriftform» (§8) +
DOCX-Freigabe: alle Kündigungen sind unterschreibbare Endprodukte →
`ausgabeArt:'fertig'`, DOCX **erlaubt** (keine Eigenhändigkeits-/
Beurkundungspflicht; anders als Testament). PDF immer.

**M9 — Engine-Adapter** (Darstellungsschicht): dünne Mapper
`AntwortenManuell → KuendigungsfristInput | SperrfristenInput | MietInput`.
KEINE Rechenregel, nur Feld-Umbenennung. Liegt in der Page (wie
`avZusammenstellen`), nicht in der Engine.

---

# Maske 1a — Kündigung Arbeitsverhältnis durch ARBEITNEHMER:in *(free, einfachst)*

**Format/Ausgabe:** `format:'eingabe'`, `ausgabeArt:'fertig'`. DOCX erlaubt.

## a) Feldkatalog

| Feld | Typ | Pflicht | Validierung | Default | speist |
|------|-----|---------|-------------|---------|--------|
| `absenderName` (AN) | text | ja | nicht leer | '' | M1, Unterschrift |
| `absenderAdresse` | text | ja | nicht leer | '' | M1 |
| `adressatName` (AG) | text | ja | nicht leer | '' | M2 |
| `adressatAdresse` | text | ja | nicht leer | '' | M2 |
| `vertragsbeginn` | datum | ja | ISO, ≤ heute | '' | Engine (Dienstjahr/Probezeit) |
| `zugangKuendigung` | datum | ja | ISO | '' | Engine (Stichtag), M3-Hinweis |
| `probezeit` | select(gesetzlich/vereinbart/keine) | ja | — | 'keine' | Engine `probezeitMonate` |
| `probezeitMonate` | number | wenn vereinbart | 1–3 | 1 | Engine |
| `fristQuelle` | select(gesetzlich/abweichend) | ja | — | 'gesetzlich' | Engine |
| `abweichendeFristMonate` | number | wenn abweichend | ≥1 | 3 | Engine |
| `abweichendeFristFormGueltig` | checkbox | wenn abweichend | — | false | Engine (sonst gesetzl. Frist) |
| `kuendigungsterminMonatsende` | checkbox | ja | — | true | Engine |
| `zeugnisVerlangen` | checkbox | nein | — | true | Baustein B-Zeugnis |
| `schlussabrechnungVerlangen` | checkbox | nein | — | true | Baustein B-Abrechnung |
| `ort` | text | ja | nicht leer | '' | M3, M6 |
| `datum` (Erklärung) | datum | ja | ISO | '' | M3, M6 |

## b) Schritte
1. **Parteien** (M1/M2: AN = Absender, AG = Adressat).
2. **Anstellung & Frist** (`vertragsbeginn`, `probezeit`, `fristQuelle`).
3. **Kündigungstermin** (`zugangKuendigung`, `kuendigungsterminMonatsende`) →
   Live-Vorschau Beendigungsdatum.
4. **Bitten** (Zeugnis, Schlussabrechnung — Checkboxen).
5. **Prüfen & Unterzeichnen** (M5-Hinweis, M8-Banner, `ort`/`datum`, Export).

## c) Bausteine (IDs · Norm · Bedingung)
- `K1_absender` (rolle absender) — M1. *immer.*
- `K1_adressat` (rolle adressat) — M2. *immer.*
- `K1_datumzeile` (rolle datumzeile) — M3. *immer.*
- `K1_betreff` (rolle betreff) «Kündigung des Arbeitsverhältnisses». *immer.*
- `K1_erklaerung` — «Hiermit kündige ich das Arbeitsverhältnis ordentlich
  und fristgerecht **per {{beendigungFmt}}**.» Norm Art. 335 Abs. 1 OR. *immer.*
  (Beendigungsdatum aus Engine — siehe e.)
- `K1_probezeit` — «(Die Kündigung erfolgt während der Probezeit; es gilt die
  7-tägige Frist, Art. 335b OR.)» `includeIf` Engine meldet `istProbezeit`.
- `K1_zeugnis` — «Ich bitte um Ausstellung eines qualifizierten
  Arbeitszeugnisses.» Norm Art. 330a OR. `includeIf zeugnisVerlangen=true`.
- `K1_abrechnung` — «Bitte stellen Sie mir die Schlussabrechnung (Lohn,
  anteiliger 13. ML, Feriensaldo, Überstunden) bis zum Austritt zu.»
  `includeIf schlussabrechnungVerlangen=true`.
- `K1_schluss` (schlussformel) — M7.
- `K1_unterschrift` (unterschrift) — M6 (eine Linie).

## d) Gates/Blocker
- **Keine harten Blocker.** Sperrfristen 336c gelten NICHT für
  AN-Kündigungen (so in `sperrfristen.ts`, C7) → kein Sperr-Pfad.
- **Pflichtfeld-Validierung** je Schritt (wie `fehlerImSchritt`).
- **Hinweis (kein Blocker):** wenn der Arbeitsvertrag vertragliche Schriftform
  vorsieht → Schriftform ist Gültigkeitsvoraussetzung (Banner M5/M8).
- **Hinweis:** «Freistellung/Ferienbezug nicht selbst verfügen — Sache des AG.»

## e) Engine-Verzahnung
`berechneKuendigungsfrist` mit `kuendigendePartei:'arbeitnehmer'`. Mapping:
`vertragsbeginn`, `zugangKuendigung`, `probezeitMonate` (0 wenn keine),
`abweichendeFristMonate`, `abweichendeFristFormGueltig`,
`kuendigungsterminMonatsende`. `beendigungsdatum → {{beendigungFmt}}`
(`formatDatum`). Vorschau zeigt `ergebnis.ergebnis` + Rechenweg.

## f) ausgabeArt/Banner/Versand
`fertig`. M8-Banner: «Kündigung ist formfrei gültig; Eigenhändigkeit nicht
erforderlich. Empfehlung: eingeschrieben (Zugangsbeweis).» PDF + DOCX.

## g) §2/Aufwand/TODO
**§2: volle Vorlage** (kein Würdigungsanteil). **Aufwand S.** Free-Tier.
TODO: Abholfrist-BGE [s. o.].

---

# Maske 1b — Kündigung Arbeitsverhältnis durch ARBEITGEBER:in *(Flaggschiff)*

**Format/Ausgabe:** `format:'eingabe'`, `ausgabeArt:'fertig'`. DOCX erlaubt.
Bindet **beide** Live-Engines ein.

## a) Feldkatalog

| Feld | Typ | Pflicht | Validierung | Default | speist |
|------|-----|---------|-------------|---------|--------|
| `absenderName` (AG) | text | ja | nicht leer | '' | M1 |
| `absenderAdresse` | text | ja | nicht leer | '' | M1 |
| `unterzeichner` | text | ja | nicht leer | '' | M6 (zeichnungsberechtigt) |
| `adressatName` (AN) | text | ja | nicht leer | '' | M2 |
| `adressatAdresse` | text | ja | nicht leer | '' | M2 (Wohnadresse!) |
| `vertragsbeginn` | datum | ja | ISO | '' | beide Engines |
| `zugangKuendigung` | datum | ja | ISO | '' | beide Engines, M5 |
| `probezeit` / `probezeitMonate` | select/number | ja/bedingt | 1–3 | keine/1 | Engines |
| `fristQuelle` / `abweichendeFristMonate` / `abweichendeFristFormGueltig` / `abweichendeFristQuelleGAV` | select/number/cb/cb | ja/bedingt | ≥1 | gesetzlich | Engines |
| `kuendigungsterminMonatsende` | checkbox | ja | — | true | Engines |
| `vaterschaftsurlaubResttage` | number | nein | ≥0 | 0 | `kuendigungsfrist` (335c Abs. 3) |
| `sperrereignisse[]` | Liste | nein | s. u. | [] | **`berechneSperrfristen`** |
| └ `typ` | select | ja | krankheit_unfall / schwangerschaft / mutterschaftsurlaub_verlaengert / zusatzurlaub_tod_elternteil / urlaub_tod_mutter / militaer_zivil / hilfsaktion / betreuungsurlaub | — | Engine |
| └ `von` / `bis` | datum | ja | ISO, bis≥von | — | Engine |
| └ `niederkunft` | datum | bedingt (schwangerschaft/cter) | ISO | — | Engine (berechnet 112-Tage-Ende) |
| └ `gleicheUrsacheWieEreignis` | number | nein | Index | — | Engine (Rückfall, kein neues Kontingent) |
| `begruendungAufnehmen` | checkbox | nein | — | **false** | Baustein (heikel!) |
| `begruendungText` | textarea | wenn oben true | — | '' | Baustein (Freitext) |
| `ort` / `datum` | text/datum | ja | — | '' | M3/M6 |

## b) Schritte
1. **Parteien** (AG/Unterzeichner; AN mit **Wohnadresse**-Hinweis).
2. **Anstellung & Frist** (`vertragsbeginn`, Probezeit, Fristquelle, GAV).
3. **Sperrfristen** (Liste `sperrereignisse` — Editor wie `SperrfristenInput`)
   → Live-Status (ok / gehemmt / **nichtig**).
4. **Kündigungstermin** (`zugangKuendigung`, Monatsende, Vaterschafts-Resttage).
5. **Begründung** (bewusst optional, Default leer + Warntext).
6. **Prüfen & Unterzeichnen** (Gates, M5/M8, Export).

## c) Bausteine
- `K2_absender`/`K2_adressat`/`K2_datumzeile`/`K2_betreff` — M1–M4.
- `K2_erklaerung` — «Hiermit kündigen wir das mit Ihnen bestehende
  Arbeitsverhältnis ordentlich **per {{beendigungFmt}}**.» Norm 335 Abs. 1.
  *Beendigung aus Sperrfristen-Engine* (gehemmt/erstreckt), siehe e.
- `K2_probezeit` — wie K1, `includeIf` Engine `istProbezeit`.
- `K2_freistellung` — **Textbaustein (optional)** «Wir stellen Sie ab
  {{freistellungAbFmt}} bis zum Austritt frei. Der Lohn wird bis zur Beendigung
  ausgerichtet; anderweitiger Erwerb wird nach Art. 324 OR angerechnet.»
  `includeIf freistellung=true`. (Verweis Vorlage 5; Ferienanrechnung NICHT
  berechnen — Würdigung, §2.)
- `K2_abrechnung` — Lohn/Ferien/Überstunden bis Beendigung; Rückgabe
  Arbeitsmittel; Zeugnis-Zusage (330a). *immer.*
- `K2_begruendung` — Freitext, `includeIf begruendungAufnehmen=true`.
- `K2_schluss`/`K2_unterschrift` — M7/M6 (Linie + `{{unterzeichner}}`).

## d) Gates/Blocker (Normanker)
- **G-NICHTIG (BLOCKER):** `berechneSperrfristen(...).status === 'nichtig'`
  → Export gesperrt. Text: «Zugang fällt in eine Sperrfrist (Art. 336c Abs. 2
  OR); die Kündigung wäre nichtig. Frühestens am
  **{{fruehesteNeueKuendigungISO}}** wiederholen.» (Engine liefert das Datum.)
- **G-GEHEMMT (Warnung, kein Blocker):** `gehemmtTage > 0` → Hinweis + das
  Beendigungsdatum stammt aus `beendigungISO` (gehemmt + auf Monatsende
  erstreckt), NICHT aus der ungehemmten Frist.
- **G-Befristung (Umschalter):** befristetes Verhältnis → keine ordentliche
  Kündigung (Art. 334); Maske weist auf «endet automatisch» bzw. fristlose
  Spur hin (kein Schreiben dieser Art). *Hier als Hinweis; Befristung ist in
  dieser Maske kein Eingabepfad — sonst eigene Maske.*
- **Warnungen (aus Engine übernehmen, §5):** 336c≠324a-Hinweis;
  Rückfall-Hinweis (BGE 120 II 124); Missbrauchsschutz 336/336a (Entschädigung
  max. 6 ML, 336a Abs. 2; Einsprache bis Fristende schriftlich + Klage 180 Tage,
  336b) als **Hinweis**, nicht Brieftext.
- **Begründungs-Warnung:** «Begründung NUR auf Verlangen schriftlich
  nachliefern (335 Abs. 2). Vorsorglich keine Gründe ins Schreiben —
  Festlegung erschwert die Verteidigung gegen einen Missbrauchsvorwurf.»

## e) Engine-Verzahnung
**`berechneSperrfristen`** ist die führende Engine (ruft intern
`berechneKuendigungsfrist`). Mapping → `SperrfristenInput`:
`kuendigendePartei:'arbeitgeber'`, `vertragsbeginn`, `zugangKuendigung`,
`probezeitMonate`, `abweichendeFristMonate`/`…FormGueltig`/`…QuelleGAV`,
`kuendigungsterminMonatsende`, `vaterschaftsurlaubResttage`,
`sperrereignisse[]` (1:1 `Sperrereignis`).
- `status==='nichtig'` → Blocker (kein `{{beendigungFmt}}`).
- sonst `{{beendigungFmt}} = formatDatum(parseISO(beendigungISO))`.
Vorschau: `sperrIntervalle`/`sperrtage` als Zeitstrahl (vorhandene UI nutzen).

## f) ausgabeArt/Banner/Versand
`fertig`. M8-Banner: «Formfrei gültig; **schriftlich + eingeschrieben dringend
empfohlen** (Zugangs- und Sperrfrist-Beweis). An die **Wohnadresse** zustellen.
Begründung nur auf Verlangen (335 II).» PDF + DOCX. M5-Zugangs-Hinweis.

## g) §2/Aufwand/TODO
**§2: volle Vorlage** (Termine deterministisch; Begründung = Freitext).
**Aufwand M** (höchste Engine-Wiederverwendung, kein Logik-Duplikat).
TODO: 335d-Schwellen (Massenentlassung) als Hinweis-Schwelle [zu verifizieren].

---

# Maske 2a — Kündigung MIETVERHÄLTNIS durch MIETER:in *(voll)*

**Format/Ausgabe:** `format:'eingabe'`, `ausgabeArt:'fertig'`. DOCX erlaubt.
Schriftform 266l Abs. 1 (Wohn-/Geschäftsraum) = Faktum (Brief unterschreiben).

## a) Feldkatalog

| Feld | Typ | Pflicht | Validierung | Default | speist |
|------|-----|---------|-------------|---------|--------|
| `absenderName` (Mieter) | text | ja | nicht leer | '' | M1, Unterschrift |
| `absenderAdresse` | text | ja | nicht leer | '' | M1 |
| `mitmieter[]` | Liste(text) | nein | — | [] | Mitunterzeichnung (mehrere Mieter) |
| `adressatName` (Vermieter/Verwaltung) | text | ja | nicht leer | '' | M2 |
| `adressatAdresse` | text | ja | nicht leer | '' | M2 |
| `mietobjektAdresse` | text | ja | nicht leer | '' | Betreff/Erklärung |
| `objekt` | select | ja | wohnung/geschaeftsraum/unbewegliche_sache/moebliertes_zimmer/bewegliche_sache | wohnung | **`berechneMietkuendigung`** |
| `kanton` | select(Kanton) | ja | — | — | Engine (Ortsgebrauch, 78 Feiertage) |
| `mietbeginn` | datum | bedingt | ISO | '' | Engine (gesetzl. Auffangregel/266e) |
| `zugang` | datum | ja | ISO | '' | Engine (Stichtag), M5 |
| `terminQuelle` | select | nein | vertraglich_monate/jedes_monatsende/ortsueblich/gesetzlich | ortsueblich | Engine |
| `vertragsTermineMonate[]` | multiselect 1–12 | wenn vertraglich | nicht leer | [] | Engine |
| `dezemberAusgeschlossen` | checkbox | nein | — | false | Engine |
| `vereinbarteFristMonate` | number | nein | ≥ Minimum | — | Engine (länger ok) |
| **`familienwohnung`** | checkbox | ja | — | false | **Gate 266m**, Engine |
| **`zustimmungEhegatte`** | checkbox | wenn familienwohnung | muss true | false | **BLOCKER 266m/266o** |
| `ehegatteName` | text | wenn familienwohnung | nicht leer | '' | 2. Unterschrift |
| `ausserterminlich` | checkbox | nein | — | false | Nachmieter-Pfad (264) |
| `nachmieterName` | text | wenn ausserterminlich | nicht leer | '' | Baustein 264 |
| `nachmieterZahlungsfaehig` | checkbox | wenn ausserterminlich | — | false | Hinweis 264 |
| `uebernahmeGleicheBedingungen` | checkbox | wenn ausserterminlich | — | false | Hinweis 264 |
| `rueckgabeWunschdatum` | datum | nein | ISO | '' | Übergabe-Baustein |
| `ort` / `datum` | text/datum | ja | — | '' | M3/M6 |

## b) Schritte
1. **Parteien & Objekt** (M1/M2, `mietobjektAdresse`, `objekt`, `kanton`).
2. **Familienwohnung** (`familienwohnung` → falls ja: `zustimmungEhegatte`
   + `ehegatteName` → 2. Unterschrift). **Früh abfragen** (steuert Blocker).
3. **Termin & Frist** (`zugang`, `terminQuelle`, `mietbeginn`,
   `vereinbarteFristMonate`) → Live-Endtermin + spätester Zugang.
4. **Ausserterminlich?** (`ausserterminlich` → Nachmieter-Felder, 264).
5. **Übergabe** (`rueckgabeWunschdatum`, Hinweis-Bausteine).
6. **Prüfen & Unterzeichnen** (Gates, M5/M8, Export).

## c) Bausteine
- `M_absender`/`M_adressat`/`M_datumzeile` — M1–M3.
- `M_betreff` (betreff) «Kündigung des Mietverhältnisses — {{mietobjektAdresse}}».
- `M_erklaerung` — «Hiermit kündige ich das Mietverhältnis über die genannte
  Mietsache **ordentlich per {{endterminFmt}}**.» Norm Art. 266a/266c–e OR.
  (Endtermin aus Engine, e.)
- `M_familienwohnung_zustimmung` — «Als Wohnung der Familie wird diese
  Kündigung mit der **ausdrücklichen Zustimmung** des Ehegatten/der
  eingetragenen Partnerin/des eingetragenen Partners {{ehegatteName}}
  ausgesprochen (Art. 266m OR), der/die mitunterzeichnet.»
  `includeIf familienwohnung=true`.
- `M_ausserterminlich_264` — «Ich gebe die Mietsache vorzeitig zurück und
  schlage als zumutbaren, zahlungsfähigen Nachmieter vor, der den Vertrag zu
  den gleichen Bedingungen übernimmt: {{nachmieterName}}. Mit dessen Eintritt
  bin ich von meinen Verpflichtungen befreit (Art. 264 OR).»
  `includeIf ausserterminlich=true`.
- `M_uebergabe` — «Ich bitte um einen Termin für die Wohnungsübergabe /
  gemeinsame Erstellung des Übergabeprotokolls und die Rückgabe des Depots.»
  *immer (Hinweis-Baustein).*
- `M_schluss` (schlussformel) — M7.
- `M_unterschrift` (unterschrift) — eine Linie; **bei familienwohnung ZWEI**
  Linien (`{{absenderName}}` + `{{ehegatteName}}`), `wiederholeUeber` bzw.
  bedingter zweiter Baustein `M_unterschrift_ehegatte`
  `includeIf familienwohnung=true`.

## d) Gates/Blocker (Normanker)
- **G-FAMILIENWOHNUNG (BLOCKER, 266m Abs. 1 / 266o):** `familienwohnung=true`
  **und** `zustimmungEhegatte=false` → Export gesperrt. Die Mietengine setzt
  bei `partei:'mieter'` + `familienwohnung` + `zustimmungEhegatte===false`
  bereits `status:'nichtig'` (Maske übernimmt). **Befund:** Kündigung ohne
  Zustimmung ist nicht «schwebend unwirksam», sondern führt nach 266o zur
  **Nichtigkeit** — harter Blocker korrekt (so im Code). [verifiziert ggü.
  266m/266o Wortlaut + BGE 137 III 208, von der Engine zitiert].
- **G-Schriftform-Hinweis:** Wohn-/Geschäftsraum → Brief eigenhändig
  unterschreiben (266l Abs. 1). Faktum, kein Blocker (Export = unterschreibbar).
- **G-Termin verfehlt (Hinweis):** Engine liefert `verfehlterTermin` →
  «Die Kündigung ist nicht ungültig; sie wirkt auf den nächstmöglichen Termin
  ({{endterminFmt}}, Art. 266a Abs. 2 OR).»
- **G-264 (Hinweis):** Nachmieter muss **zumutbar, zahlungsfähig und bereit zu
  gleichen Bedingungen** sein; sonst Mietzins bis zum nächsten ordentlichen
  Termin (264 Abs. 2). Kein Blocker (Beurteilung beim Vermieter — §2).

## e) Engine-Verzahnung
**`berechneMietkuendigung`** mit `partei:'mieter'`,
`kuendigungsart:'ordentlich'`. Mapping → `MietInput`: `objekt`, `zugang`,
`kanton`, `terminQuelle`, `vertragsTermineMonate`, `dezemberAusgeschlossen`,
`mietbeginn`, `vereinbarteFristMonate`, `familienwohnung`, `zustimmungEhegatte`.
- `status==='nichtig'` → Blocker.
- sonst `{{endterminFmt}} = endtermin` (Engine liefert dd.MM.yyyy +
  `spaetesterZugang` + ggf. `verfehlterTermin`).
*Hinweis:* Anfechtung/Erstreckung (273) berechnet die Engine nur für die
**Vermieter**-Kündigung — beim Mieter irrelevant.

## f) ausgabeArt/Banner/Versand
`fertig`. M8-Banner: «Schriftform (Art. 266l Abs. 1 OR) — Brief unterschreiben;
bei Familienwohnung **beide** unterschreiben (266m). Eingeschrieben empfohlen
(Zugangsbeweis). Frist gewahrt mit **Zugang** spätestens {{spaetesterZugang}}.»
PDF + DOCX.

## g) §2/Aufwand/TODO
**§2: volle Vorlage.** **Aufwand M** (Mietengine + Familienwohnung-Pfad +
264-Bausteine). TODO: Praxis zur Nachmieter-Prüffrist [zu verifizieren].

---

# Maske 2b — Kündigung MIETVERHÄLTNIS durch VERMIETER:in *(KEINE Vollvorlage — §8)*

**Begründung (266l Abs. 2):** Die Vermieterkündigung von Wohn-/Geschäftsräumen
ist **nur mit dem vom Kanton genehmigten amtlichen Formular** gültig; ein frei
formuliertes Schreiben ist **nichtig** (266o). LexMetrik kann das amtliche
Formular weder ersetzen noch deterministisch nachbilden (kantonal verschieden,
mit Rechtsmittelbelehrung) → **§8: keine Vollvorlage**, nur **Checkliste +
Verweis** auf das kantonale Formular.

## Lieferung: Checkliste-Karte (kein Dokument-Export)
- **Amtliches Formular** des Kantons {{kanton}} verwenden (266l Abs. 2) —
  Link/Bezug auf kantonale Schlichtungsbehörde/Formularstelle.
- **Familienwohnung:** Kündigung + Zahlungsfrist-Androhung **separat** an
  Mieter UND Ehegatte/eingetr. Partner:in zustellen (266n); Verstoss →
  Nichtigkeit (266o).
- **Termin/Frist** kann die Engine **als Auskunft** liefern
  (`berechneMietkuendigung` `partei:'vermieter'`): Endtermin, spätester
  Zugang, Anfechtungs-/Erstreckungsfristen (273) — als **Information**, nicht
  als Dokument.
- **Begründung auf Verlangen** (271 ff., Anfechtbarkeit Missbrauch) — Hinweis.
- Bei `partei:'vermieter'` + `amtlichesFormular:false` liefert die Engine
  bereits `status:'nichtig'` → die Checkliste zeigt diesen Blocker prominent.

**§2/Aufwand:** Reine Checkliste/Info-Verzahnung. **Aufwand S.** Ehrliche
§8-Offenlegung statt Schein-Vorlage.

---

# Maske 3 — Allgemeine Vertragskündigung (Dauerschuldverhältnisse) *(generisch + Presets)*

**Format/Ausgabe:** `format:'eingabe'`, `ausgabeArt:'fertig'`. DOCX erlaubt.
**Kernidee:** EINE generische Maske (Vertrag/Kundennummer/Termin/Frist) +
**Preset-Auswahl**, die Norm-Anker, Default-Frist und Hinweise setzt. KEINE
Fristberechnung erfinden, wo kein Spezialgesetz greift (§2 — ehrlich).

## a) Feldkatalog (generisch)

| Feld | Typ | Pflicht | Validierung | Default | speist |
|------|-----|---------|-------------|---------|--------|
| `preset` | select | ja | versicherung/darlehen/auftrag/miete_moebliert/arbeitsvertrag/abo_telecom/generisch | generisch | steuert Bausteine/Hinweise |
| `absenderName` / `absenderAdresse` | text | ja | nicht leer | '' | M1 |
| `adressatName` / `adressatAdresse` | text | ja | nicht leer | '' | M2 |
| `vertragsBezeichnung` | text | ja | nicht leer | '' | Betreff/Erklärung |
| `vertragsnummer` | text | nein | — | '' | Betreff |
| `vertragsbeginn` | datum | bedingt (Preset) | ISO | '' | Hinweis Mindestdauer |
| `kuendigungsterminWunsch` | datum | nein | ISO | '' | Erklärung |
| `aufNaechstmoeglich` | checkbox | ja | — | true | Erklärung («auf den nächstmöglichen Termin») |
| `zugang` | datum | ja | ISO | '' | M5 |
| `ort` / `datum` | text/datum | ja | — | '' | M3/M6 |

**Preset-Zusatzfelder** (bedingt):
- *versicherung:* `vertragsdauerUeber3Jahre` (cb), `policennummer` (text).
- *darlehen:* `aufforderungDatum` (datum) — 6-Wochen-Frist ab erster
  Aufforderung (318).
- *auftrag:* `zurUnzeitHinweis` (cb, nur Hinweis).
- *miete_moebliert:* → **verweist** auf Maske 2a `objekt:moebliertes_zimmer`
  (266e) statt eigener Rechnung.

## b) Schritte
1. **Vertragstyp** (`preset`) — setzt Norm-Anker/Hinweise.
2. **Parteien** (M1/M2).
3. **Vertrag** (`vertragsBezeichnung`, `vertragsnummer`, Preset-Felder).
4. **Termin** (`kuendigungsterminWunsch` / `aufNaechstmoeglich`, `zugang`).
5. **Prüfen & Unterzeichnen** (Preset-Hinweise, M5/M8, Export).

## c) Bausteine
- `V_absender`/`V_adressat`/`V_datumzeile`/`V_betreff` — M1–M4
  («Kündigung — {{vertragsBezeichnung}}{{vertragsnummerSatz}}»).
- `V_erklaerung_generisch` — «Hiermit kündige ich den genannten Vertrag
  {{terminSatz}} unter Einhaltung der vertraglichen/gesetzlichen Frist.»
  `includeIf preset=generisch`. *§2: keine erfundene Frist.*
- `V_versicherung` — «Ich kündige den Versicherungsvertrag (Police
  {{policennummer}}) ordentlich **auf das Ende des dritten bzw. des laufenden
  Versicherungsjahres** unter Einhaltung der dreimonatigen Frist (Art. 35a
  VVG).» `includeIf preset=versicherung`. Norm Art. 35a VVG.
- `V_darlehen` — «Ich kündige das Darlehen und fordere zur Rückzahlung auf;
  die Rückzahlung hat innert **sechs Wochen** seit dieser Aufforderung zu
  erfolgen (Art. 318 OR).» `includeIf preset=darlehen`. Norm 318.
- `V_auftrag` — «Ich widerrufe/kündige den Auftrag mit sofortiger Wirkung
  (Art. 404 Abs. 1 OR — jederzeit zulässig).» `includeIf preset=auftrag`.
  Norm 404.
- `V_abo_telecom` — «Ich kündige das Abonnement/den Vertrag auf den
  nächstmöglichen Termin gemäss den vereinbarten AGB.»
  `includeIf preset=abo_telecom`. (Kein Spezialgesetz — ehrlich, nur
  OR-Grundsätze.)
- `V_schluss`/`V_unterschrift` — M7/M6.

## d) Gates/Blocker & Preset-Hinweise (Normanker)
- **versicherung (Hinweis, kein Blocker):** Ordentliches Recht nur bei
  Vertragsdauer **> 3 Jahre**; vorher kündbar nur, wenn vereinbart, oder
  ausserordentlich aus **wichtigem Grund (Art. 35b VVG)**. Wenn
  `vertragsdauerUeber3Jahre=false` **und** Wunschtermin vor Ablauf der
  Mindestdauer → Hinweis «ordentliche Kündigung evtl. noch nicht möglich».
  Lebensversicherung ggf. ausgenommen; Krankenzusatz/Kollektiv-KTG: laufende
  Leistungen geschützt (Art. 35c VVG) [zu verifizieren].
- **darlehen (Hinweis):** Ohne vereinbarten Termin/Frist gilt die
  6-Wochen-Frist ab **erster Aufforderung** (318); mit vereinbarter Frist
  gilt diese.
- **auftrag (Warnung):** Kündigung **zur Unzeit** → Schadenersatzpflicht
  (404 Abs. 2). Echte Auftragsverhältnisse: 404 ist (h. L.) zwingend
  unverzichtbar [zu verifizieren].
- **arbeitsvertrag:** → **verweist auf Maske 1a/1b** (kein eigener Pfad).
- **miete_moebliert:** → **verweist auf Maske 2a** (266e).
- **abo_telecom (ehrlich):** Kein Spezialgesetz; massgeblich sind AGB +
  OR-Grundsätze. Keine berechnete Frist.

## e) Engine-Verzahnung
**Keine** neue Engine. `darlehen`: optional 6-Wochen-Datum aus
`aufforderungDatum + 42 Tage` (reine Datums-Arithmetik via `datumsUtils`,
keine Rechtsregel-Engine). `miete_moebliert` ruft `berechneMietkuendigung`
(Verweis auf Maske 2a). Sonst nur statische Norm-Anker.

## f) ausgabeArt/Banner/Versand
`fertig`. M8-Banner je Preset: VVG «schriftlich/textnachweisbar, 3-Monats-Frist,
Police angeben»; allgemein «eingeschrieben empfohlen, Zugang massgeblich».
PDF + DOCX.

## g) §2/Aufwand/TODO
**§2: volle Vorlage** für generisch/darlehen/auftrag/abo; versicherung mit
Hinweis-Gate (deterministische Schwellenprüfung Vertragsdauer). **Aufwand M.**
TODO: Art. 35b-Wortlaut + 35a/c-Zwingend-Klassifikation + Lebensvers.-Ausnahme
[alle zu verifizieren].

---

# Zusammenfassende Bau-Matrix

| # | Maske | format | ausgabeArt | §2 | Aufwand | Engine |
|---|-------|--------|-----------|----|---------|--------|
| 1a | Kündigung AN | eingabe | fertig | voll | S | kuendigungsfrist |
| 1b | Kündigung AG | eingabe | fertig | voll | M | sperrfristen (+ kuendigungsfrist intern) LIVE |
| 2a | Miete Mieter | eingabe | fertig | voll | M | mietrecht (partei mieter) LIVE |
| 2b | Miete Vermieter | — (Checkliste) | — | §8-Grenze | S | mietrecht nur als Info |
| 3 | Allgemein + Presets | eingabe | fertig | voll (Vers. Hinweis-Gate) | M | keine (Darlehen: Datums-Arithmetik) |

## Priorisierte Bau-Reihenfolge
1. **Geteilte Module M1–M9 bauen** (Schema-Fragmente; verhaltensneutral, §6/§10).
2. **Maske 1a** (free, kleinste, validiert M1–M9 + `kuendigungsfrist`).
3. **Maske 1b** (Flaggschiff; Sperrfristen-Blocker hart; höchste Wiederverwendung).
4. **Maske 2a** (Familienwohnung-Blocker + 264-Pfad; Mietengine).
5. **Maske 3** (generisch + Presets; geringes Engine-Risiko, VVG-TODOs offen).
6. **Maske 2b** (Checkliste; ehrliche §8-Grenze, schnell).

**Kern-Sicherheitsregeln (nicht verhandelbar):**
- 1b: Sperrfristen-`nichtig` = **harter Blocker** (sonst unwirksame Kündigung).
- 2a: Familienwohnung ohne 2. Unterschrift = **harter Blocker** (266m/266o
  Nichtigkeit) — von der Mietengine bereits als `nichtig` geliefert.
- 2b: niemals eine Vermieter-«Vollvorlage» exportieren (266l Abs. 2).
- 3/versicherung: keine erfundene Frist; VVG-Wortlaut/Zwingend-Status
  vor Produktivschaltung verifizieren.
