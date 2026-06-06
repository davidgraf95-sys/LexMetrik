# Arbeitsrecht-Vorlagen — Recherche-Dossier (Cluster Beendigung & Dokumente)

**Erstellt:** 6.6.2026 · **Wortlaut-Quelle:** Fedlex SR 220 (OR),
Cache `/tmp/or.html`, Konsolidierungsstand empirisch **«1.1.2026»**,
Anker-Format `id="art_X"` bzw. `id="art_X_y"` (sprachunabhängig, §7).
**Abrufdatum:** 6.6.2026.
**Status: ENTWURF / Recherche** — Wortlaut-Anker der Kernnormen empirisch
gegen den Cache geprüft (335, 335a, 335b, 335c, 336, 336a, 336b, 336c, 337,
330a, 341, 324: alle gefunden, Wortlaut-Kern verbatim entnommen). BGE-/AVIG-/
ALV-Hinweise sind **[zu verifizieren]** (Sekundärquellen, nicht im OR-Cache).
Fachliche Abnahme durch David ausstehend (§7); keine Rechtsberatung (§8).

**Bauform-Referenz:** `src/lib/vorlagen/arbeitsvertrag.ts` (Schema-Matrix
`VorlageSchema`, `pruefeAvGates` → `{blocker, warnungen, hinweise}`,
`assemble` aus `engine.ts`). Format-Typen: `verfuegung | vertrag | eingabe`;
`ausgabeArt: abschrift | entwurf | fertig` (Form-Gate, §8).
Live-Rechner zum Einbinden: `src/lib/kuendigungsfrist.ts`
(`berechneKuendigungsfrist`) und `src/lib/sperrfristen.ts`
(`berechneSperrfristen`) — beide rein/deterministisch, liefern
`beendigungISO`, `gehemmtTage`, `status: 'ok'|'nichtig'`.

**Verifikations-TODOs (gesammelt):**
- [ ] BGE 137 III 303 u.a. zu Zugang/Empfangstheorie (eingeschriebener Brief,
      Abholfrist 7 Tage) — [zu verifizieren]
- [ ] Art. 30 Abs. 1 lit. a/c AVIG (Einstelltage bei selbstverschuldeter
      Arbeitslosigkeit / Aufhebungsvereinbarung) — Fedlex SR 837.0, nicht im
      OR-Cache [zu verifizieren]
- [ ] BGE 118 II 58 / 110 II 168 zur Saldoklausel-/Verzichts-Schranke
      Art. 341 OR — [zu verifizieren]
- [ ] Zeugnis-Praxis (Wahrheit + Wohlwollen, Geheimcode-Verbot):
      BGE 136 III 510, BGer 4A_117/2007 — [zu verifizieren]
- [ ] Begründungspflicht 335 Abs. 2 / 337 Abs. 1: nur **auf Verlangen**,
      Form schriftlich — Wortlaut bestätigt (siehe unten).

**Quellenlage Kernwortlaut (verbatim aus Cache, 6.6.2026):**
- **Art. 335 Abs. 1 OR:** «Ein unbefristetes Arbeitsverhältnis kann von jeder
  Vertragspartei gekündigt werden.»
- **Art. 335 Abs. 2 OR:** «Der Kündigende muss die Kündigung schriftlich
  begründen, wenn die andere Partei dies verlangt.» → **Begründung nur auf
  Verlangen; KEINE gesetzliche Schriftform der Kündigung selbst.**
- **Art. 335a Abs. 1 OR:** Parität; widersprechende Abrede → längere Frist.
- **Art. 336b OR:** Einsprache **bis Ende Kündigungsfrist schriftlich**;
  Klage binnen **180 Tagen** nach Beendigung, sonst Verwirkung.
- **Art. 336a Abs. 2 OR:** Entschädigung max. **6 Monatslöhne**.
- **Art. 337 Abs. 1 OR:** fristlose Auflösung aus wichtigem Grund jederzeit;
  schriftliche Begründung **nur auf Verlangen**.
- **Art. 330a Abs. 1 OR:** Zeugnis jederzeit (Art/Dauer/Leistung/Verhalten);
  **Abs. 2:** auf besonderes Verlangen nur Art/Dauer (Arbeitsbestätigung).
- **Art. 341 Abs. 1 OR:** kein Verzicht auf unabdingbare Forderungen während
  des Arbeitsverhältnisses **und eines Monats nach Beendigung**.
- **Art. 324 OR:** Annahmeverzug → Lohn bleibt geschuldet; Anrechnung von
  Erspartem / anderweitig Erworbenem / absichtlich Unterlassenem (Abs. 2).

---

## Methodischer Befund vorweg: Wo §2 die Grenze zieht

Die Kündigung ist **formfrei** (kein Schriftform-Erfordernis von Gesetzes
wegen). Eine Vorlage liefert also keinen Formzwang, sondern ein **konsistentes,
risikoarmes Muster** + die korrekten Rechtsfolgen-Bausteine + die Verzahnung
mit den Live-Rechnern. Drei Vorlagen sind **voll deterministisch** baubar
(1, 2, 6). Drei sind **Gerüst** mit Würdigungs-Platzhaltern, weil der
sachverhaltsabhängige Kern (Pflichtverletzung, Leistungsbeurteilung,
Annahmeverzugs-Berechnung im Einzelfall) **nicht** ohne Würdigung/Schätzung
formulierbar ist (3, 4, 5) — sonst Verstoss gegen §2.

---

## Priorisierte Bau-Reihenfolge

1. **Kündigung Arbeitnehmer** (S, free, geringstes Risiko) — Einstieg.
2. **Kündigung Arbeitgeber** (M, bindet beide Live-Rechner ein) — Flaggschiff.
3. **Aufhebungsvereinbarung** (M, voll baubar, aber 341/AVIG-Fallstricke).
4. **Verwarnung** (S, Gerüst).
5. **Freistellung** (M, Gerüst).
6. **Arbeitszeugnis** (L, nur Gerüst/Backlog — §2-Grenze am schärfsten).

---

# Vorlage 1 — Kündigung durch Arbeitnehmer  *(voll, free)*

**1) Nutzerfrage.** «Ich möchte selbst kündigen — wie schreibe ich das
korrekt und fristgerecht?»

**2) Normbasis + Form.** Art. 335 Abs. 1 OR (jederzeitiges Kündigungsrecht),
Art. 335b OR (Probezeit, 7 Tage), Art. 335c OR (Fristen/Termine), Art. 335a
(Parität). **Keine Formvorschrift** — Schriftform nur, wenn einzelvertraglich
vereinbart (dann Gültigkeitsvoraussetzung, deklarieren). Begründungspflicht
gibt es für den Arbeitnehmer faktisch nicht (335 Abs. 2 nur auf Verlangen der
Gegenseite; in der Praxis irrelevant). **Sperrfristen 336c gelten NICHT für
Arbeitnehmerkündigungen** (so bereits in `sperrfristen.ts` kodiert) — kein
Sperrfristen-Pfad nötig.
→ **`format: 'eingabe'`** (Rechtsschreiben: Absender/Adressat, Datum rechts,
Betreff fett; KEIN zentrierter Titel). **`ausgabeArt: 'fertig'`** (formfrei,
druckfertig, unterschreibbar). Banner: «Kündigung ist formfrei gültig;
Eigenhändigkeit nicht erforderlich. Empfehlung eingeschrieben (Beweis Zugang).»

**3) Baustein-Skizze.**
- *Pflicht:* Absender-Block (AN) · Adressat-Block (AG) · Ort/Datum-Zeile ·
  Betreff «Kündigung des Arbeitsverhältnisses» · Kündigungserklärung mit
  **Beendigungsdatum aus Live-Rechner** · Bitte um Zeugnis (Art. 330a) ·
  Bitte um Schlussabrechnung/Feriensaldo · Gruss · Unterschrift.
- *Optional/Gates:*
  - G1 Probezeit-Variante (`includeIf probezeit='gesetzlich|vereinbart'`):
    Text «7-Tage-Frist auf jeden Tag» statt Monatsende. Normanker 335b.
  - G2 Fristquelle: «gesetzlich» vs. «abweichend (schriftlich vereinbart)» —
    Hinweis Parität 335a (gleiche Frist beide Seiten).
  - G3 Hinweis (kein Blocker): «Freistellung/Ferienbezug nicht selbst
    verfügen — das ist Sache des AG.»

**4) §2-Beurteilung.** **Volle Vorlage.** Kein Würdigungsanteil; das einzige
Rechenelement (Beendigungsdatum) liefert `berechneKuendigungsfrist`
deterministisch.

**5) Datenbedarf.** Parteien (Name/Adresse AG+AN), Vertragsbeginn (ISO),
gewünschtes/heutiges Erklärungsdatum, Probezeit ja/nein + Dauer,
Fristquelle (gesetzlich/abweichend + Monate + Schriftform bestätigt),
Kündigungstermin Monatsende (Default true), Ort.
→ Mapping auf `KuendigungsfristInput`: `kuendigendePartei:'arbeitnehmer'`,
`vertragsbeginn`, `zugangKuendigung` (= angenommener Zugang),
`probezeitMonate`, `abweichendeFristMonate`, `abweichendeFristFormGueltig`,
`kuendigungsterminMonatsende`.

**6) Fallstricke.**
- Zugang ist massgebend, nicht Absendedatum (Zugangsprinzip — bereits in den
  `annahmen` von `kuendigungsfrist.ts`). Vorlage muss klar sagen: Beendigung
  = ab Zugang gerechnet; eingeschrieben → Zugang ggf. erst mit Abholung
  (Abholfrist 7 Tage, BGE 137 III 303 **[zu verifizieren]**).
- Stillschweigend vereinbarte Schriftform: wenn der Arbeitsvertrag Schriftform
  für Kündigungen vorschreibt, ist sie Gültigkeitsvoraussetzung → Banner.

**7) Aufwand: S.** Wiederverwendung: `engine.ts` (Schema/assemble),
`kuendigungsfrist.ts` (Beendigungsdatum), `datum.ts` (fmt). Free-Tier.

---

# Vorlage 2 — Kündigung durch Arbeitgeber  *(voll, Flaggschiff)*

**1) Nutzerfrage.** «Ich muss einer Mitarbeiterin/einem Mitarbeiter ordentlich
kündigen — fristgerecht, ohne in eine Sperrfrist zu laufen, und formal
sauber.»

**2) Normbasis + Form.** Art. 335 Abs. 1/2 (Kündigung + Begründung **nur auf
Verlangen**), 335a (Parität), 335b (Probezeit), 335c (Fristen/Termine),
**336c (Kündigung zur Unzeit / Sperrfristen)**, 336/336a/336b (Missbrauch —
als Warnhinweis, nicht als Baustein). **Keine gesetzliche Schriftform** —
aber für den Arbeitgeber faktisch zwingend zu Beweiszwecken; einzelvertragl./
GAV-Schriftform als Gültigkeitsvoraussetzung beachten.
→ **`format: 'eingabe'`**, **`ausgabeArt: 'fertig'`**. Banner-Empfehlung:
«Kündigung formfrei gültig; schriftlich + eingeschrieben dringend empfohlen
(Zugangs- und Sperrfrist-Beweis). Begründung NUR auf Verlangen schriftlich
nachzuliefern (Art. 335 Abs. 2 OR) — vorsorglich keine Gründe ins
Kündigungsschreiben, um spätere Festlegung zu vermeiden.»

**3) Baustein-Skizze.**
- *Pflicht:* AG-Block · AN-Block · Ort/Datum · Betreff «Kündigung des
  Arbeitsverhältnisses» · Kündigungserklärung **mit Beendigungsdatum aus
  `berechneKuendigungsfrist`** · Hinweis Lohn-/Ferien-/Überstunden-Abrechnung
  bis Beendigung · Rückgabe Arbeitsmittel · Zeugnis-Zusage (330a) · Gruss ·
  Unterschrift (zeichnungsberechtigte Person).
- *Optional/Gates (mit Normanker):*
  - G1 **Sperrfristen-Integration** — bindet `berechneSperrfristen` ein:
    - `status === 'nichtig'` → **BLOCKER**: «Zugang fällt in Sperrfrist
      (Art. 336c Abs. 2 OR); Kündigung wäre nichtig. Frühestens am
      {`fruehesteNeueKuendigungISO`} wiederholen.» Vorlage NICHT freigeben.
    - `gehemmtTage > 0` → Warnung + Beendigungsdatum = `beendigungISO`
      (gehemmt+erstreckt) statt ungehemmt.
    - sonst Beendigungsdatum = `beendigungISO`.
  - G2 Probezeit-Variante (7 Tage, kein Sperrfristen-/Missbrauchsschutz im
    selben Mass; 335b).
  - G3 Befristung: ordentliche Kündigung ausgeschlossen (334) → Vorlage
    umschalten auf Hinweis «befristet, endet automatisch» (kein Kündigungs-
    schreiben nötig) ODER fristlose-Spur (eigene Vorlage 337, hier verlinken).
  - G4 Begründungs-Baustein **bewusst optional und leer per Default**
    (Hinweis: erst auf Verlangen, separat) — heikel: Festlegung erschwert
    spätere Verteidigung gegen Missbrauchsvorwurf.
- *Hinweise (Warnungen, keine Blocker):*
  - Missbrauchsschutz 336/336a: Entschädigung **max. 6 Monatslöhne**
    (336a Abs. 2); AN muss bis Ende Kündigungsfrist **schriftlich Einsprache**
    erheben (336b Abs. 1) und binnen **180 Tagen** klagen (336b Abs. 2).
  - Massenentlassung 335d ff. (Konsultationspflicht) — Hinweis ab Schwellen
    **[zu verifizieren: 335d Schwellenwerte]**, nicht im Cache geprüft.

**4) §2-Beurteilung.** **Volle Vorlage.** Alle Daten/Termine deterministisch;
die Sperrfrist-/Fristlogik liegt bereits regelbasiert vor. Würdigungsfreie
Bausteine. Der Begründungstext bleibt Nutzer-Freitext (kein generierter
Inhalt) → §2 gewahrt.

**5) Datenbedarf.** Parteien · Vertragsbeginn · angenommener **Zugang** der
Kündigung · Probezeit · Fristquelle (gesetzlich/abweichend + Schriftform/GAV)
· Kündigungstermin Monatsende · **Sperrereignisse** (Liste: Typ
[krankheit_unfall/schwangerschaft/militaer_zivil/hilfsaktion/betreuungsurlaub],
von/bis ISO, Rückfall-Verweis) → 1:1 `SperrfristenInput`. Zusätzlich:
zeichnungsberechtigte Person(en), Ort.

**6) Fallstricke.**
- **Nichtigkeit bei Sperrfrist** (336c Abs. 2): muss harter Blocker sein,
  nicht nur Warnung — sonst produziert die Vorlage eine unwirksame Kündigung.
- Begründung im Schreiben = strategischer Fehler (Festlegung); Default leer.
- Zugang/eingeschrieben: Abholfrist-Fiktion 7 Tage **[zu verifizieren
  BGE 137 III 303]**; Zustellung an Wohnadresse, nicht an Geschäftsadresse.
- Lohnfortzahlung 324a ≠ Sperrfrist 336c (verschiedene Dauern) — Warnung aus
  `sperrfristen.ts` übernehmen, nicht neu formulieren (§5 SSoT).

**7) Aufwand: M.** Wiederverwendung **hoch**: `kuendigungsfrist.ts` +
`sperrfristen.ts` LIVE eingebunden (kein Duplikat der Rechtslogik, §3/§5),
`engine.ts`, `datum.ts`. Dies ist die Vorlage, die den bestehenden Rechner-
Bestand am stärksten verwertet.

---

# Vorlage 6 — Aufhebungsvereinbarung  *(voll baubar, hohe Risikodichte)*

*(in der Bau-Reihenfolge vor 3/4/5 gezogen, weil voll deterministisch.)*

**1) Nutzerfrage.** «Wir wollen das Arbeitsverhältnis einvernehmlich beenden —
was muss rein, damit es hält und keine ALV-Nachteile entstehen?»

**2) Normbasis + Form.** Vertragsfreiheit (Art. 115 OR Aufhebung durch
contrarius actus; Art. 320 Formfreiheit analog). **Schranke: Art. 341 Abs. 1
OR** — während des Arbeitsverhältnisses und **einen Monat** danach kein
Verzicht auf **unabdingbare** Forderungen. Folge: echte Aufhebungsverträge mit
gegenseitigem Nachgeben sind zulässig, **einseitiger Verzicht ohne
gleichwertige Gegenleistung ist nichtig** (Umgehungsschutz). **Keine
Formvorschrift** → `format: 'vertrag'`, `ausgabeArt: 'fertig'`.
Banner: «Formfrei gültig; Schriftform dringend empfohlen. Verzicht auf
unabdingbare Ansprüche nur bei echtem gegenseitigem Nachgeben wirksam
(Art. 341 OR). ALV-Folgen prüfen.»

**3) Baustein-Skizze.**
- *Pflicht:* Parteien · Aufhebungserklärung mit **Beendigungsdatum** ·
  Einhaltung mind. der ordentlichen Kündigungsfrist (ALV-Schutz, siehe G2) ·
  Lohn/Anteil 13. ML/Ferienabgeltung bis Beendigung · Rückgabe Arbeitsmittel ·
  Zeugnis (330a) · Schlussbestimmungen · Ort/Datum/beidseitige Unterschrift.
- *Optional/Gates:*
  - G1 **Saldoklausel** — nur als Baustein MIT 341-Vorbehalt: «erfasst keine
    unabdingbaren Ansprüche; Verzicht nur im Rahmen gegenseitigen Nachgebens».
    Reine «per Saldo aller Ansprüche»-Klausel ohne Gegenleistung → Warnung
    (teilnichtig, **[BGE 118 II 58 zu verifizieren]**).
  - G2 **ALV-Warnung (Art. 30 AVIG)** — wenn Beendigungsdatum die ordentliche
    Kündigungsfrist unterschreitet ODER Abgangsentschädigung vereinbart:
    Hinweis auf **Einstelltage / Wartezeit / Aufschub des ALV-Anspruchs**
    (selbstverschuldete Arbeitslosigkeit, Art. 30 Abs. 1 AVIG **[zu
    verifizieren, SR 837.0, nicht im OR-Cache]**). Kein Blocker, aber
    prominente Warnung — häufigster Praxisfehler.
  - G3 **Freiwilligkeit/Bedenkfrist** — Hinweis-Baustein: gerichtliche Praxis
    verlangt freie Willensbildung; Bedenkfrist empfohlen (kein gesetzliches
    Minimum) **[Praxis, zu verifizieren]**. Bei Unterzeichnung «unter Druck»
    Anfechtungsrisiko (Art. 21/23 ff. OR).
  - G4 Freistellung bis Beendigung (Verweis Vorlage 5) · Konkurrenzverbot-
    Schicksal (340c) · Abgangsentschädigung (Betrag, steuerlich).
- *Hinweis:* Bei wirtschaftlichem Übergewicht des AG prüfen Gerichte
  besonders streng (kein verdeckter Verzicht) — `hinweis` am Saldo-Baustein.

**4) §2-Beurteilung.** **Volle Vorlage** mit Warn-Gates. Inhalt ist
würdigungsfrei (feste Klauseln + parametrisierte Beträge/Daten); die
341-/AVIG-Risikobewertung ist eine **deterministische Schwellenprüfung**
(Beendigungsdatum vs. ordentliche Frist via `kuendigungsfrist.ts`), keine
Schätzung.

**5) Datenbedarf.** Parteien · Vertragsbeginn (für Frist-Vergleich) ·
vereinbartes Beendigungsdatum · Lohn (für 13.-ML-/Ferien-Pro-rata-Hinweis) ·
Ferienrestsaldo · Abgangsentschädigung ja/nein + Betrag · Freistellung ja/nein
· Saldoklausel ja/nein · Konkurrenzverbot bestehend ja/nein · Ort.

**6) Fallstricke.**
- **Art. 341-Verzichtsverbot** = der zentrale Stolperstein: Vorlage darf
  keine pauschale Verzichtsklausel ohne Gegenleistung als «sauber» verkaufen.
- **ALV-Einstelltage (Art. 30 AVIG)**: Aufhebung kann als selbstverschuldet
  gelten → Einstelltage; Unterschreitung der Kündigungsfrist → Aufschub
  («Lohnersatz für die fiktive Kündigungsfrist» — Anrechnung durch ALV)
  **[zu verifizieren]**.
- Sperrfristen-Umgehung: Aufhebung während einer Sperrfrist (336c) ist
  zulässig, wenn echter Vergleich — aber Warnung, wenn faktisch erzwungen.

**7) Aufwand: M.** Wiederverwendung: `engine.ts`, `kuendigungsfrist.ts`
(Frist-Vergleich für ALV-/341-Warnung), `datum.ts`. AVIG-Daten neu (kein
bestehender AVIG-Rechner) → ggf. eigener Mini-Parameterblock, aber als
**Hinweis** ohne Tagesberechnung (sonst Schätzung → §2).

---

# Vorlage 4 — Verwarnung  *(Gerüst)*

**1) Nutzerfrage.** «Wie verwarne ich rechtssicher als Vorstufe zu einer
allfälligen fristlosen Kündigung?»

**2) Normbasis + Form.** Keine eigene Normbasis; funktional Vorstufe zu
Art. 337 OR (wichtiger Grund). Die Verwarnung dokumentiert die Pflicht-
verletzung und die **Androhung** der Konsequenz — Voraussetzung dafür, dass
eine spätere fristlose Kündigung bei weniger gravierenden Verstössen als
gerechtfertigt gilt (Abmahnungserfordernis, Praxis zu 337
**[zu verifizieren]**). **Keine Formvorschrift** → `format: 'eingabe'`,
`ausgabeArt: 'fertig'`. Banner: «Formfrei; schriftlich + Zustellnachweis
dringend empfohlen (Beweis für spätere fristlose Kündigung).»

**3) Baustein-Skizze.**
- *Pflicht:* AG-Block · AN-Block · Ort/Datum · Betreff «Verwarnung» ·
  **[Würdigungs-Platzhalter: konkrete Pflichtverletzung, Datum, Beleg]** ·
  Verweis auf verletzte Vertrags-/Weisungspflicht (321a) · **Androhung der
  Konsequenz** (bei Wiederholung fristlose Kündigung 337) · Aufforderung zur
  künftigen Vertragstreue · Unterschrift.
- *Gates:* keine echten Rechts-Gates; nur Pflichtfeld-Validierung
  (Pflichtverletzung darf nicht leer sein).

**4) §2-Beurteilung.** **Gerüst mit Würdigungs-Platzhalter.** Der Kern
(welche Verletzung, wie schwer) ist sachverhaltsabhängige Würdigung →
**Nutzer-Freitext**, kein generierter Inhalt. Das deterministische Gerüst
(Adressierung, Androhungs-Baustein, Normrahmen) ist baubar. Volle
Automatisierung der Bewertung «genügt diese Verwarnung für 337?» wäre
Schätzung → **Backlog/ausgeschlossen**.

**5) Datenbedarf.** Parteien · Datum · Pflichtverletzung (Freitext) ·
verletzte Pflicht (Auswahl/Freitext) · angedrohte Konsequenz (Default:
fristlose Kündigung) · Frist zur Besserung (optional).

**6) Fallstricke.** Verwarnung ≠ Garantie für spätere 337-Wirksamkeit
(Verhältnismässigkeit; bei schweren Verstössen keine Abmahnung nötig)
**[zu verifizieren]**. Zu vage Verwarnung («Verhalten verbessern») nützt
nichts — Konkretheit ist entscheidend → Hinweis im UI.

**7) Aufwand: S.** Wiederverwendung: `engine.ts`, `datum.ts`. Keine
Rechner-Einbindung.

---

# Vorlage 5 — Freistellung  *(Gerüst)*

**1) Nutzerfrage.** «Ich stelle die gekündigte Person bis zum Austritt frei —
was gilt für Lohn, Ferien, Überstunden und Konkurrenzverbot?»

**2) Normbasis + Form.** Keine spezifische Norm; dogmatisch **Annahmeverzug
des Arbeitgebers, Art. 324 OR**: bei Freistellung bleibt der Lohn geschuldet
(Abs. 1); der AN muss sich anrechnen lassen, was er erspart oder anderweitig
erwirbt bzw. absichtlich zu erwerben unterlässt (Abs. 2). **Keine
Formvorschrift** → `format: 'eingabe'` (Freistellungserklärung/-brief),
`ausgabeArt: 'fertig'`.

**3) Baustein-Skizze.**
- *Pflicht:* Parteien · Bezug auf erfolgte Kündigung + Beendigungsdatum ·
  Freistellungserklärung ab Datum X bis Beendigung · **Lohnfortzahlung
  während Freistellung (324)** · Anrechnung anderweitigen Erwerbs (324 Abs. 2)
  · Unterschrift.
- *Optional/Gates:*
  - G1 **Ferienbezug-Anrechnung**: Ferien gelten während Freistellung nur als
    bezogen, wenn das Verhältnis von Freistellungsdauer zu Ferienanspruch
    angemessen ist (Praxis-Faustregel ca. **[BGE 4A_319/2019 / 128 III 271,
    Verhältnis Restdauer zu Ferien — zu verifizieren]**). →
    **Würdigungs-Platzhalter**: konkrete Ferienverrechnung NICHT automatisch
    berechnen (Verhältnismässigkeits-Würdigung). Nur Hinweis + Feld für
    vereinbarten Ferienbezug.
  - G2 **Überstunden-Kompensation** während Freistellung (Vereinbarung).
  - G3 **Konkurrenzverbot-Wirkung**: Freistellung lässt Treuepflicht
    bestehen; Konkurrenzverbot bleibt grundsätzlich bestehen, kann aber bei
    Verzicht des AG dahinfallen (340c) — Hinweis.
  - G4 unwiderruflich/widerruflich (Anrechnung von Ersatzeinkommen praktisch
    nur bei unwiderruflicher Freistellung relevant) **[zu verifizieren]**.

**4) §2-Beurteilung.** **Gerüst.** Der Rahmen (Erklärung, Lohn, Anrechnung)
ist deterministisch; die **Ferienanrechnungs-Quote** ist eine
Verhältnismässigkeits-Würdigung → Platzhalter/Hinweis, **keine** Berechnung
(sonst Schätzung, §2). Eine spätere präzise Ferien-Anrechnungs-Engine wäre
Backlog (nur wenn klare Faustregel zementierbar).

**5) Datenbedarf.** Parteien · Beendigungsdatum (aus Kündigung) ·
Freistellungsbeginn · Lohn · Ferienrestsaldo · Überstundensaldo ·
Konkurrenzverbot ja/nein · widerruflich ja/nein.

**6) Fallstricke.** Anrechnung 324 Abs. 2 nur bei tatsächlich/absichtlich
unterlassenem Erwerb; pauschale Anrechnung unzulässig. Ferien können bei zu
kurzer Restdauer **nicht** vollständig als bezogen gelten **[zu verifizieren]**.

**7) Aufwand: M.** Wiederverwendung: `engine.ts`, `datum.ts`; optional
Beendigungsdatum-Übernahme aus `kuendigungsfrist.ts`.

---

# Vorlage 3 — Arbeitszeugnis  *(nur Gerüst / Backlog — §2-Grenzfall)*

**1) Nutzerfrage.** «Ich brauche ein Voll- oder Zwischenzeugnis / eine
Arbeitsbestätigung.»

**2) Normbasis + Form.** Art. 330a OR. **Abs. 1:** Vollzeugnis (Art, Dauer,
Leistung, Verhalten); Anspruch **jederzeit** (→ auch Zwischenzeugnis).
**Abs. 2:** auf besonderes Verlangen einfache **Arbeitsbestätigung** (nur Art
+ Dauer). **Keine Formvorschrift** → `format: 'eingabe'`/Dokument,
`ausgabeArt: 'fertig'`.

**3) Baustein-Skizze.**
- *Voll deterministisch baubar (Arbeitsbestätigung, 330a Abs. 2):* Briefkopf
  AG · «bestätigt, dass {Name} vom {Beginn} bis {Ende} als {Funktion}
  beschäftigt war» · Ort/Datum/Unterschrift. → **diese Teil-Variante ist
  vollwertig baubar.**
- *Vollzeugnis (330a Abs. 1):* Rahmen baubar (Personalien, Funktion,
  Aufgabenliste, Dauer, Austrittsgrund neutral, Schlussformel), aber
  **Leistungs- und Verhaltensbeurteilung = Würdigung**.

**4) §2-Beurteilung.**
- **Arbeitsbestätigung: volle Vorlage** (würdigungsfrei).
- **Vollzeugnis: Gerüst mit Würdigungs-Platzhaltern; Beurteilungs-Text als
  Nutzer-Freitext.** LexMetrik generiert **KEINE** Bewertungsformulierungen —
  das wäre genau die Würdigung/Schätzung, die §2 ausschliesst, und zugleich
  rechtlich heikel (Spannungsfeld **Wahrheit + Wohlwollen**, BGE 136 III 510
  **[zu verifizieren]**; **Geheimcode-Verbot**: codierte Formulierungen sind
  unzulässig, BGer 4A_117/2007 **[zu verifizieren]**). Ein Bausteinkatalog
  fertiger Wertungssätze («stets zu unserer vollsten Zufriedenheit») wäre
  eine versteckte Wertungs-Engine → **abgelehnt**. Höchstens neutrale
  Struktur-Bausteine + Freitextfelder + Hinweise zur Praxis.
- Volle Zeugnis-Generierung → **Backlog/ausgeschlossen**.

**5) Datenbedarf.** AG-Block · Name/Geburtsdatum AN · Funktion · Beginn/Ende ·
Aufgabenliste (Freitext) · [Vollzeugnis: Leistungs-/Verhaltenstext Freitext] ·
Austrittsgrund · Zeugnistyp (Bestätigung / Zwischen- / Vollzeugnis) ·
Ort/Datum.

**6) Fallstricke.** Wahrheit vor Wohlwollen, aber wohlwollend formuliert;
keine codierten Botschaften; Zwischenzeugnis im Präsens, Vollzeugnis im
Präteritum; vollständig (keine auffälligen Auslassungen) **[zu verifizieren]**.

**7) Aufwand: L** (Vollzeugnis) / **S** (Arbeitsbestätigung). Empfehlung:
**nur Arbeitsbestätigung jetzt bauen**, Vollzeugnis als dokumentiertes
Backlog (§2-Grenze offengelegt, §8). Wiederverwendung: `engine.ts`,
`datum.ts`.

---

## Zusammenfassende Bau-Matrix

| # | Vorlage | format | ausgabeArt | §2 | Aufwand | Rechner-Einbindung |
|---|---------|--------|-----------|-----|---------|--------------------|
| 1 | Kündigung Arbeitnehmer | eingabe | fertig | voll | S | kuendigungsfrist |
| 2 | Kündigung Arbeitgeber | eingabe | fertig | voll | M | kuendigungsfrist + sperrfristen (LIVE) |
| 6 | Aufhebungsvereinbarung | vertrag | fertig | voll (+Warn-Gates) | M | kuendigungsfrist (Frist-Vergleich) |
| 4 | Verwarnung | eingabe | fertig | Gerüst | S | — |
| 5 | Freistellung | eingabe | fertig | Gerüst | M | (kuendigungsfrist optional) |
| 3 | Arbeitszeugnis | eingabe | fertig | Bestätigung voll / Vollzeugnis Backlog | S/L | — |

**Kernempfehlung:** Zuerst 1 → 2 → 6 bauen (alle voll deterministisch, Vorlage
2 verwertet beide bestehenden Live-Rechner ohne Duplizierung der Rechtslogik,
§3/§5). 4/5 als Gerüste mit klar deklarierten Würdigungs-Platzhaltern. Beim
Zeugnis nur die Arbeitsbestätigung jetzt, Vollzeugnis dokumentiert ins Backlog
(§2/§8). Sperrfrist-Nichtigkeit in Vorlage 2 MUSS harter Blocker sein.
