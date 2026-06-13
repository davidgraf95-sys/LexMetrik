# Abnahme-Dossier: Mahnung — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** `src/lib/vorlagen/mahnung.ts (MA_SCHEMA)`. **Generiert:**
`npx vite-node scripts/abnahme-dossiers.ts` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare `includeIf`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.


---

## Mahnung

Schema `mahnung` · Version 1.0.0 (Bauspezifikation or-vertragsvorlagen.md; OR-Wortlaute verifiziert 20260101) · Format eingabe · Ausgabe fertig

> **Disclaimer (Fusszeile):** Erstellt mit LexMetrik. Keine Rechtsberatung. Massgebend sind Vertrag und Gesetz; der Zugang beim Empfänger entscheidet. Mahnung ist keine Betreibung – für die Zwangsvollstreckung ist das Betreibungsbegehren der nächste Schritt.


### 1. `MA_absender`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** absender
- **Begründung (Protokoll):** Absenderin/Absender des Schreibens – immer enthalten.

**Wortlaut:**

> {{absenderBlock}}

### 2. `MA_adressat`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** adressat
- **Begründung (Protokoll):** Schuldnerin/Schuldner als Empfänger – immer enthalten.

**Wortlaut:**

> {{adressatBlock}}

### 3. `MA_datumzeile`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** datumzeile
- **Begründung (Protokoll):** Ort und Datum der Erklärung – immer enthalten.

**Wortlaut:**

> {{ort}}, {{datumFmt}}

### 4. `MA_betreff_zahlung`

- [ ] **abgenommen** (David)
- **Aufnahme:** variante = "zahlung"
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff der Zahlungs-Mahnung mit dem Rechtsgrund der Forderung.

**Wortlaut:**

> Mahnung – {{rechtsgrund}}

### 5. `MA_betreff_nachfrist`

- [ ] **abgenommen** (David)
- **Aufnahme:** variante = "nachfrist"
- **Layout-Rolle:** betreff
- **Begründung (Protokoll):** Betreff der Nachfristansetzung mit der Vertragsbezeichnung.

**Wortlaut:**

> Inverzugsetzung mit Nachfristansetzung – {{vertragBezeichnung}}

### 6. `MA_anrede`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** anrede
- **Begründung (Protokoll):** Anrede – immer enthalten.

**Wortlaut:**

> Sehr geehrte Damen und Herren

### 7. `MA_forderung`

- [ ] **abgenommen** (David)
- **Aufnahme:** variante = "zahlung"
- **Begründung (Protokoll):** Bestimmte Bezeichnung der Forderung (Betrag und Rechtsgrund) – Kern der Mahnung.

**Wortlaut:**

> Trotz Fälligkeit ist die folgende Forderung offen: CHF {{betragFmt}} aus {{rechtsgrund}}{{faelligSeitSatz}}.

### 8. `MA_verzug_mahnung`

- [ ] **abgenommen** (David)
- **Norm:** Art. 102 Abs. 1 OR
- **Aufnahme:** variante = "zahlung" UND NICHT (verfalltagVereinbart = true)
- **Begründung (Protokoll):** Verzugseintritt durch Mahnung bei fälliger Verbindlichkeit; der ausdrückliche Satz stellt klar, dass die Zahlungsfrist kein Zuwarten mit den Verzugsfolgen bedeutet (Konsistenz mit dem Verzugszins-Rechner: Zins ab Erhalt der Mahnung).

**Wortlaut:**

> Ich mahne Sie hiermit. Mit dem Zugang dieser Mahnung befinden Sie sich in Verzug (Art. 102 Abs. 1 OR).

### 9. `MA_verzug_verfalltag`

- [ ] **abgenommen** (David)
- **Norm:** Art. 102 Abs. 2 OR
- **Aufnahme:** variante = "zahlung" UND verfalltagVereinbart = true
- **Begründung (Protokoll):** Bei verabredetem Verfalltag tritt der Verzug mit dessen Ablauf ein – das Schreiben hält den bereits eingetretenen Verzug fest.

**Wortlaut:**

> Die Zahlung war auf den {{verfalltagFmt}} vereinbart. Sie befinden sich daher seit Ablauf dieses Tages in Verzug (Art. 102 Abs. 2 OR), ohne dass es einer Mahnung bedurft hätte.

### 10. `MA_zins_gesetzlich`

- [ ] **abgenommen** (David)
- **Norm:** Art. 104 Abs. 1 OR
- **Aufnahme:** variante = "zahlung" UND NICHT (zinsVertraglich = true)
- **Begründung (Protokoll):** Gesetzlicher Verzugszins von 5 % pro Jahr bei Geldschulden.

**Wortlaut:**

> Ab Verzugseintritt{{zinsSeitSatz}} schulden Sie Verzugszins von 5 % pro Jahr (Art. 104 Abs. 1 OR).

### 11. `MA_zins_vertraglich`

- [ ] **abgenommen** (David)
- **Norm:** Art. 104 Abs. 2 OR
- **Aufnahme:** variante = "zahlung" UND zinsVertraglich = true
- **Begründung (Protokoll):** Vertraglich höhere Zinsen können auch während des Verzugs gefordert werden.

**Wortlaut:**

> Ab Verzugseintritt{{zinsSeitSatz}} schulden Sie den vertraglich vereinbarten Verzugszins von {{zinssatzProzent}} % pro Jahr (Art. 104 Abs. 2 OR).

### 12. `MA_zahlungsaufforderung`

- [ ] **abgenommen** (David)
- **Aufnahme:** variante = "zahlung"
- **Begründung (Protokoll):** Zahlungsaufforderung mit gesetzter Frist – die Frist ist eine Praxis-Wahl, keine gesetzliche Vorgabe.

**Wortlaut:**

> Ich fordere Sie auf, den offenen Betrag {{zahlungsfristSatz}} seit Erhalt dieses Schreibens zu bezahlen{{zahlungsverbindungSatz}}.

### 13. `MA_mahngebuehr`

- [ ] **abgenommen** (David)
- **Aufnahme:** variante = "zahlung" UND mahngebuehrErfassen = true UND mahngebuehrVertraglich = true UND mahngebuehr nicht leer
- **Begründung (Protokoll):** Mahngebühr NUR bei bestätigter vertraglicher Grundlage – von Gesetzes wegen besteht kein Anspruch (nur Verzugszins, Art. 104 OR).

**Wortlaut:**

> Zusätzlich verrechne ich Ihnen die vertraglich vereinbarte Mahngebühr von CHF {{mahngebuehrFmt}}.

### 14. `MA_betreibung`

- [ ] **abgenommen** (David)
- **Aufnahme:** variante = "zahlung" UND betreibungAndrohen = true
- **Begründung (Protokoll):** Ankündigung des nächsten Vollstreckungsschritts (optional) – die Mahnung selbst ist keine Betreibung.

**Wortlaut:**

> Nach unbenutztem Ablauf der Frist behalte ich mir vor, ohne weitere Mitteilung die Betreibung einzuleiten.

### 15. `MA_nf_leistung`

- [ ] **abgenommen** (David)
- **Aufnahme:** variante = "nachfrist"
- **Begründung (Protokoll):** Bestimmte Bezeichnung der geschuldeten Leistung aus dem zweiseitigen Vertrag.

**Wortlaut:**

> Aus {{vertragBezeichnung}} schulden Sie mir die folgende Leistung: {{leistungBeschrieb}}. Diese Leistung ist fällig{{nfSeitSatz}} und bis heute nicht erbracht.

### 16. `MA_nf_nachfrist`

- [ ] **abgenommen** (David)
- **Norm:** Art. 107 Abs. 1 OR
- **Aufnahme:** variante = "nachfrist"
- **Begründung (Protokoll):** Mahnung und Nachfristansetzung verbunden – Art. 107 setzt Verzug voraus; die Verbindung beider Erklärungen in einem Schreiben ist zulässig und praxisüblich.

**Wortlaut:**

> Ich mahne Sie hiermit (Art. 102 Abs. 1 OR) und setze Ihnen für die nachträgliche Erfüllung eine Nachfrist {{nachfristSatz}} seit Erhalt dieses Schreibens an (Art. 107 Abs. 1 OR).

### 17. `MA_nf_wahlrechte`

- [ ] **abgenommen** (David)
- **Norm:** Art. 107 Abs. 2 OR
- **Aufnahme:** variante = "nachfrist"
- **Begründung (Protokoll):** Ankündigung der Wahlrechte – Verzicht/Rücktritt verlangen nach Fristablauf eine unverzügliche Erklärung (in der UI offengelegt).

**Wortlaut:**

> Nach unbenutztem Ablauf dieser Frist behalte ich mir vor, auf die nachträgliche Leistung zu verzichten und Ersatz des aus der Nichterfüllung entstandenen Schadens zu verlangen oder vom Vertrag zurückzutreten (Art. 107 Abs. 2 OR).

### 18. `MA_schluss`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** schlussformel
- **Begründung (Protokoll):** Schlussformel – immer enthalten.

**Wortlaut:**

> Freundliche Grüsse

### 19. `MA_unterschrift`

- [ ] **abgenommen** (David)
- **Aufnahme:** immer
- **Layout-Rolle:** unterschrift
- **Begründung (Protokoll):** Unterschrift der Gläubigerin/des Gläubigers.

**Wortlaut:**

> ___________________________
> {{absenderName}}

---

**Summe:** 19 Bausteine in 1 Schemas.
