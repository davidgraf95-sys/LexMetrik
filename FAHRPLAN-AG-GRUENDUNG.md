# Fahrplan: Komplett-Überarbeitung AG-Gründungsmaske (Auftrag David 7.6.2026)

**Auftrag:** «AG-Gründungsmaske komplett überarbeiten» auf Basis des
Original-Materials `~/Desktop/Legal Calc Knowledge/Gründung AG` (amtliche
Suite HRegA/Notariate ZH). **Material-Dossier mit allen Deltas D1–D24:**
`bibliothek/recherche/ag-gruendung-amtliche-vorlagen.md` (§11-Ablage).

**Ist-Stand:** Erstausbau `fb0b2f1`/9b (Bargründung CHF, Namenaktien,
globale Teilliberierung; Statuten kurz; Blocker für qualifiziert/
Fremdwährung/Inhaberaktien). Deployed bis `7a72e91`.

**Grundsätze für alle Etappen:** Wortlaut-Massstab bleibt der OR-Cache
1.1.2026, ZH-Muster = Formulierungs-Usanz (§7; Wortlaut-Dossier Teil 0).
Änderungen an BESTEHENDEN Baustein-Texten sind fachliche Änderungen →
eigener, deklarierter Commit je Etappe (§6 Ziff. 3); neue Engine-Hinweise
in den Konventions-Test (Maximal-Kombinationen!), Halbgeviert/U+2019.
Tore je Etappe: `npx tsc -b` · `npm test` · `npm run lint; echo $?`
(volle Ausgabe) · Build · `golden-outputs vergleich` (ohne Pipe!) ·
`norm-zitate-pruefen` · Bug-Check §9 (2 unabhängige Agents) vor
Etappen-Abschluss. Push/Deploy nur nach Davids Ja.

---

## Etappe 0 — Korrektheits-Abgleich des Bestands am Original (zuerst!)

Die bisherigen Bausteine entstanden aus Web-Parsings; jetzt liegen die
Originale vor. Kein Funktionsausbau, nur Präzisierung:

- [x] 0.1 **Singular-Urkunde** (D1): Numerus-Weiche bei genau einer
  Gründerin/einem Gründer — Urkunde 3.5 als Wortlaut-Referenz
  («gründe ich», «Ich stelle fest», ein Unterschriftsblock).
  Gleiches Muster prüfen für: Wahlannahme-Adressat, Opting-out-Satz
  («Der Gründer erklärt …»).
- [x] 0.2 **VR-Protokoll formalia-fest** (D13/D14): Felder Sitzungs-Beginn/
  -Ende (Uhrzeit), Abwesende (Anzahl-Feststellung), Feststellungssatz
  Einladung; Zeichnungsarten erweitern um `ohne` («ohne
  Zeichnungsberechtigung») und `kollektivprokura` (weitere
  Vertretungen) — Typ ist mit der GmbH geteilt (fachneutral), GmbH
  golden-byte-identisch halten oder Erweiterung nur AG-seitig labeln.
- [x] 0.3 **634b-Satz schärfen** (D6 Teil 2): «… die restliche und
  vollständige Leistung seiner Einlage im Sinne von Art. 634b OR sofort
  zu erbringen» (ZH verbatim; bisher ohne «sofort»/Normzitat im Satz).
- [x] 0.4 **Nachtragsvollmacht ZH-konform** (D10): optional + EINE benannte
  Person mit vollen Personalien (Feld), statt pauschal jeder
  Gründer/VR; Default AUS (ZH: «Auf Verlangen der Gründer»).
- [x] 0.5 **Statuten kurz ergänzen** (D19): Geschäftsjahr-Artikel
  (Beginn/Ende, Art. 957 ff.; «erstmals am» optional) +
  Beschlussfassungsarten-Artikel (vor Ort/hybrid/virtuell + schriftliche
  Beschlussfassung Art. 701 Abs. 3 OR) — beide in der amtlichen
  KURZ-Vorlage enthalten.
- [x] 0.6 **Wahlannahme Revisionsstelle** (D15): bei `!optingOut` je
  Revisionsstelle eine Erklärung in die Mappe (Checkliste kennt
  `wahlannahme-rs` bereits — nur Dokument fehlt).
- [x] 0.7 **HR-Anmeldung ergänzen** (D17): Beilagen-Zeile «Ausweiskopien
  aller einzutragenden Personen (Art. 24a HRegV, nicht öffentlich, lose
  beilegen)»; Hinweis «Anmeldung zwingend auf Deutsch»;
  Vollmacht-Drittperson-Hinweis (Kopie genügt).
- [x] 0.8 Bug-Check §9 über Etappe 0; Golden-Stand NEU schreiben
  (deklarierte fachliche Änderungen).

## Etappe 1 — Statuten-Stufen kurz/lang (D18)

- [x] 1.1 Schalter `statutenUmfang: 'kurz' | 'lang'`; lang = amtlicher
  Volltext als Baustein-Katalog (GV-Befugnisse rev. inkl.
  Zwischendividende/Kapitalreserve-Rückzahlung · Einberufung/
  Traktandierung 20 T./10 %/5 % · Tagungsort/Ausland · virtuelle GV ·
  Vorsitz/Protokoll · Zirkular-/Erwahrungsprotokoll GV+VR ·
  Stimmrecht/Vertretung · Beschlussfassung + 704-Katalog (mit
  Stichentscheid-Option, GL ja/SG nein) · VR-Artikel (Wahl 3 J.,
  Konstituierung, Sitzungen, Auskunft 715a, Aufgaben 716a, Delegation,
  718 IV) · Revisions-Artikel · Aktienzertifikate · Zerlegung/
  Zusammenlegung · Aktienbuch · Reserven · Auflösung/Liquidation).
  Jeder Baustein einzeln am OR-Cache verifiziert (Norm-Anker!).
- [x] 1.2 Konsistenz: Kurz-Bausteine = Teilmenge (ein Katalog, Stufen-Flag
  je Baustein — §5, keine Doppeltexte).
- [~] 1.3 ZURÜCKGESTELLT (Befund beim Bau 7.6.2026): Die ZH-Langvorlage
  kennt KEINE GV-Präsidentenwahl-Variante (Selbstkonstituierung verbatim,
  712 II) — Variante erst nötig, wenn eine Nicht-ZH-Vorlage sie verlangt.
  Stichentscheid GV ist im Lang-Katalog enthalten (ZH verbatim, ASL37);
  Abwahl-Option = Davids Abnahme-Entscheid. «Geschäftsjahr erstmals am»
  (Lang-Vorlage) ebenfalls zurückgestellt (geteilter AS15-Baustein).
- [x] 1.4 Tests: Goldwerte je Stufe/Klausel-Kombination; Bug-Check §9.

## Etappe 2 — Qualifizierte Gründung (D3, D4, D5) — grösster Nutzen

- [x] 2.1 Eingabe-Modell: `einlageArt`-Erweiterung je Gründer-Tranche
  (bar / sacheinlage / sacheinlageVerrechnung / sachuebernahmeKombi),
  Sacheinlage-Objekte (Bezeichnung, Inventarlisten-/Bilanz-Datum, Wert,
  Grundstück-Flag, Empfänger-Aktien, Gutschrift, bei Geschäft:
  CHE-Nr./Aktiven/Passiven/Kaufpreis/Rückwirkungsdatum) — getrennt von
  der GmbH (§4).
- [x] 2.2 Urkunden-Varianten Ziff. IV nach 3.3 (kombinierbar mit bar!),
  inkl. Grundstücks-Weiche («sofort verfügen» vs. «bedingungsloser
  Anspruch auf Eintragung in das Grundbuch»), besondere Vorteile als
  Zusatz-Variante; Statuten-Pflichtklauseln 634 IV / 634a III
  automatisch erzeugen (Gegenstand/Bewertung/Einleger/Aktien).
- [x] 2.3 Neue druckfertige Dokumente: **Sacheinlagevertrag** (einfach +
  Geschäft, ZH verbatim inkl. Rückwirkungsklausel) und
  **Gründungsbericht** (einfach + Geschäft, je Bilanzposten-Zeilen);
  Prüfungsbestätigung bleibt FREMDBELEG (zugelassener Revisor) —
  nur Checklisten-Zeile, kein Export.
- [x] 2.4 Gates: Bewertungs-Summen = gezeichnete Aktien-Gegenwerte;
  Verrechnung nur mit Forderungs-Betrag; Art.-181-IV-Hinweis;
  Lex-Koller-Frage 3 koppeln (Sacheinlage + Grundstück).
- [x] 2.5 Blocker `qualifiziert` entfernt; Checklisten-Weichen
  (sacheinlagevertrag/gruendungsbericht/pruefungsbestaetigung bestehen)
  mit der Mappe verknüpft. Bug-Check §9 mit juristischer Handrechnung
  (Agent 2 rechnet die Belegkette am Gesetz nach).

## Etappe 3 — Fremdwährung (D2) + Agio (D7) + Liberierung je Gründer (D6)

- [x] 3.1 Fremdwährung GBP/EUR/USD/JPY: Währungsfeld, Kurs-Satz verbatim
  (Devisenmittelkurs-Quelle als Eingabe), CHF-Äquivalenz-Gate
  ≥ 100'000, Statuten/Urkunde in Währung; Blocker entfällt.
- [x] 3.2 Agio: Ausgabebetrag-Feld (Default = Nennwert); Gate Ausgabebetrag
  ≥ Nennwert; Einlagen-/Feststellungs-Sätze auf Ausgabebetrag
  umgestellt (sie referenzieren ihn schon); Statuten unverändert
  (Agio kein Statuteninhalt).
- [x] 3.3 Teilliberierung je Gründer (a/b/c zu X %): pro-Gründer-Feld mit
  Gates 20 % je Aktie / gesamthaft 50'000 (CHF-Äquivalent bei
  Fremdwährung); UI-Default «alle gleich» (ein Feld, aufklappbar).
- [x] 3.4 Goldwerte für Kurs-/Agio-/Mischfälle; Bug-Check §9.

## Etappe 4 — Urkunden-Optionen + Nebendokumente

- [x] 4.1 **Wahlannahme in der Urkunde** (D8): Option je VR-Mitglied
  (anwesend → «welcher hiermit die Annahme erklärt» / Erklärung liegt
  vor → «dessen Annahmeerklärung vorliegt») → separate
  Wahlannahme-Dokumente entfallen entsprechend (Checklisten-Zeile
  passt sich an).
- [x] 4.2 **Konstituierung + Domizil in der Urkunde** (D9, Ziff. VII mit
  Vollzähligkeits-Bedingung) → VR-Protokoll entbehrlich; Domizil in
  der Urkunde weglassbar (dann nur Anmeldung).
- [x] 4.3 **Lex-Koller-Erklärung** als druckfertiges Dokument (D16):
  4 Ja/Nein-Erklärungen + Definitions-Fussnoten, Unterschrift EIN
  VR-Mitglied; ausgelöst durch `immobilienHauptzweck` (Checkliste
  `lex-koller` besteht); Bewilligungsbehörde kantonsoffen.
- [x] 4.4 **Gründungs-Nachtrag** (D11) als eigene kleine Vorlage
  (ENTWURF-Gate §8): Urkunden-Ziffer- und Statuten-Artikel-Änderung,
  Fortgeltungs-Klausel — Einstieg über die AG-Maske (Phase 3) und
  Katalog-Karte `geplant`→`entwurf`?  → Zuschnitt-Entscheid David
  (eigene Karte vs. Unterpunkt der Maske).
- [x] 4.5 Bug-Check §9.

## Etappe 5 — Info-Schicht (keine Engine-Logik)

- [x] 5.1 Phase-4-Hinweisblöcke (D20/D21): VR-Pflichten kompakt
  (Buchführung persönlich · 725/725b-Stufen · StGB 165/166) +
  Warnung private Register (nur HRA-Rechnung; Merkmale) — Quelle/Stand
  ausweisen.
- [x] 5.2 FINMA-Warnung (D23): deterministische Wortprüfung
  Firma/Zweck («Vermögensverwalter», «Trustee», «Verwalter von
  Kollektivvermögen», «Fondsleitung», «Wertpapierhaus», Bank).
- [x] 5.3 Übersetzungs-Hinweis (D24) bei fremdsprachigen Belegen
  (statischer Hinweis Phase 3).
- [x] 5.4 Erläuterungs-Hinweise aus 3.1 (Revisionsstellen-Anforderungen
  727b/727c/RAV 8 I) am Revisions-Feld.

## Ausserhalb des Zuschnitts (bewusst)

- Inhaberaktien-Volldokumente (Blocker bleibt; Nachweis-Pflicht 622 Ibis).
- Stimmrechts-/Vorzugsaktien, Partizipationsscheine, Kategorien-Vertreter
  im VR (Stufe 3; Statuten-Klausel-Kerne liegen in ag-gruendung.md 1.2).
- Kapitalband/bedingtes Kapital (eigenes Vorhaben, s. HANDLUNGSPLAN 9c).
- Unterschriftenbogen-Export (Beglaubigungs-Dokument der Ämter).

## GmbH-Spiegelung (nach AG-Abschluss prüfen, eigene Commits)

D1 (Singular-Urkunde!), D13 (Protokoll-Formalia), D10
(Nachtragsvollmacht), D17 (Anmeldungs-Ergänzungen), D20/D21
(Info-Schicht) treffen die GmbH-Maske analog — gleiche Befundlage,
getrennte Schemas (§4).

## Entscheide für David (blockieren einzelne Punkte, nicht den Start)

1. **Statuten-Default** kurz oder lang (Empfehlung: kurz, Schalter
   prominent)?
2. **Agio im Erstzuschnitt** (3.2) gewünscht oder Stufe 3? (Steuerfolge
   Emissionsabgabe-Hinweis besteht.)
3. **Nachtrag** (4.4) als eigene Katalog-Karte oder Unterpunkt der Maske?
4. **Liberierung je Gründer** (3.3) — UI-Mehraufwand vertretbar oder
   global belassen?

**STAND 7.6.2026 abends: ALLE Etappen GEBAUT** (Auftrag David «mach es
einfach ganz fertig» — Zuschnitt-Fragen mit den empfohlenen Defaults
aufgelöst: Statuten-Default kurz · Agio drin [nur Volliberierung] ·
Nachtrag als Mappen-Unterpunkt · Liberierung je Gründer drin). Zusätzlich
auf Davids Auftrag: **Wizard-Umbau** (6 Schritte, durchklickbar analog den
anderen Masken) mit **Sammel-Download** aller notwendigen Dokumente im
Schluss-Schritt (`7aacd4b`). Sammel-Bug-Check §9: Agent 2 (Wortlaut)
abgeschlossen — Befund 1 (Nicht-Gründer-VR-Gate) + 2 gefixt (`6c18fcd`);
Agent 1 (Empirie-Sweep) Befunde werden nachgeführt. NÄCHSTER SCHRITT
(Auftrag David): **GmbH-Maske analog** — gleiches Programm auf
gruendungGmbhDokumente.ts (Wizard, qualifizierte Gründung, Optionen,
Sammel-Download; GmbH-Spiegelungs-Liste unten beachten).

**STAND 7.6.2026 spätnachmittags — PERFEKTIONS-PROGRAMM (UEBERGABE-AG-
PERFEKTION.md, Auftrag David «mach alles») ABGEARBEITET:**

- **P6+P7** (`028522d`): Sammel-Download als EIN ZIP (fflate,
  gruendung-<firma-slug>.zip) + lokale Zwischenspeicherung
  (lexmetrik:ag-gruendung:v1, Hydration-Guards je Array-Feld,
  agGruendungHydration.test). Auf Davids Zusatzauftrag (`f4d71a1`):
  ZIP enthält je Dokument auch **Word (DOCX)** — vorlagenDocxDokument()
  als Blob-API spiegelbildlich zur PDF-API.
- **P15** (`e91a331`): Abnahme-Registry AG_ALLE_SCHEMAS +
  scripts/abnahme-ag.ts → ABNAHME-AG-BAUSTEINE.md (Wort-für-Wort-Abnahme
  David; nach Engine-Änderungen neu generieren).
- **P1 Stufe-2-Kombinationen** (`0b4d5e7`, deklarierte fachliche
  Änderungen, alle am OR-Cache 1.1.2026): qualifiziert+Fremdwährung
  (Beträge in Kapitalwährung, Kurs-Basis = geleistete Einlagen GESAMT) ·
  Agio+Teilliberierung (Agio VOLL, nur Nennwert-Teil teilliberierbar;
  AE07x) · qualifiziert+Agio (Wert-Gates auf AUSGABEBETRAG, 629 II
  Ziff. 2) · gemischte Teilliberierung (globaler Grad auf Bar-Aktien,
  Sach-/Verrechnungsaktien gelten voll; AE07g_teil; individuelle Grade
  qualifiziert weiter gesperrt — Zuordnung nicht eindeutig).
- **P2 Inhaberaktien** (`795a17e`): Weiche statt Sperre — 622 Abs.
  1bis-Erklärung (Bucheffekten+Verwahrungsstelle ODER Kotierung),
  HR-Eintrag 622 Abs. 2bis in der Anmeldung, {{aktienArt}} an 12
  Stellen; Gates: Volliberierung (683!), keine Vinkulierung (685a),
  Kurzfassung (ZH-Lang ist Namenaktien-spezifisch).
- **P3 Statuten-Zusatzklauseln** (`2d44c0c`): Schiedsklausel 697n (+
  Anmeldungs-Verweis 45 I lit. u HRegV) · Kapitalband 653s ff. (zwei
  Varianten, Gates ±½/5 Jahre/Opting-out-Schranke 653s IV) · bedingtes
  Kapital 653 ff. (Gates ½-Schranke 653a I, Nennwert-Vielfaches,
  Kreis-Pflicht) · Stichentscheid-GV-Abwahl (Lang; SG-Default B8) ·
  «Erstes Geschäftsjahr endet am». **OFFEN (deklariert):**
  Stimmrechtsaktien 693 / Vorzugsaktien 654 / Partizipationsscheine 656a
  brauchen ein Zwei-Kategorien-Kapitalmodell durch Zeichnung/Liberierung/
  Urkunde — eigener Ausbauschritt, Davids Entscheid.
- **P4 Unterschriftenblatt** (`0bbd77b`): neues Mappen-Dokument
  (Haus-Fassung, Art. 21 HRegV-Modalitäten); Golden-Stand deklariert neu.
- **P5 Kantonsvergleich SG/GL** (`edbc227`): Dossier
  ag-gruendung-kantonsvergleich-sg-gl.md — Haus-Bausteine tragen
  kantonsneutral; optionale Schärfungen B4/E2/W1/D2 offen.
- **P8–P10** (`e6fcbe9`): Vorschau-Dokument-Dropdown · Musterdaten-Knopf
  (Golden-Fall gemischt-qualifiziert) · rote Schritt-Sektionen mit den
  eigenen Blockern (Bereichs-Tags der Engine).
- **QS** (`ea1e8c3`): logik-sweep Stufe-2-Strang (AG-S1–S10, 3264
  AG-Komb.) + Sweep-Exit-Fix (Verletzungen brachen das Tor bisher NICHT)
  + 3 neue Golden-Fälle (87).
- **P11 Notariatstarife** + **Sammel-Bug-Check §9 (2 Agents)**: laufen —
  Befunde werden hier nachgetragen.

**Empfohlene Reihenfolge = Etappen-Nummern.** Etappe 0 ist
Korrektheits-Pflicht vor jedem Ausbau (§1); Etappe 2 bringt den grössten
fachlichen Mehrwert (qualifizierte Gründung ist die häufigste reale
Variante nach bar). Erledigtes hier abhaken/durchstreichen; Stand in
STRUKTUR.md + HANDLUNGSPLAN.md (9b-AG) spiegeln.
