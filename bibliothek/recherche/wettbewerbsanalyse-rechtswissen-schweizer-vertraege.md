# Wettbewerbsanalyse rechtswissen.ch + schweizer-vertraege.ch — übernehmbare Rechner & Vorlagen, Verträge-Darstellung

**Erstellt:** 12.6.2026, Auftrag David (`PROMPT-wettbewerbsanalyse.md`).

**Auftrag David 12.6.2026** (`PROMPT-wettbewerbsanalyse.md`): Ziele A (Rechner-
Kandidaten) · B (Vorlagen-Kandidaten) · C (Darstellungskonzept Verträge-
Sektion) · D (Handlungsplan, separat als `FAHRPLAN-VORLAGEN-AUSBAU.md`).
**Status: Erstrecherche (Claude); P1-Priorisierung + Bucket-Einordnung
durch David ABGENOMMEN 12.6.2026
(`abnahme/wortlaute-2026-06/PAUSCHALABNAHME-2026-06-12.md`).**

**Quellen + Stand (§11 Ziff. 1):**
- rechtswissen.ch — Vollinventar 12.6.2026, 33 Seiten direkt gelesen
  (`/tools/`, `/tools/basic-tools/`, `/vorlagen/` + alle Unterseiten);
  Einschränkung: Abo-geschützte Tools und JS-Widgets nur nach öffentlicher
  Beschreibung; `/vorlagen/vertraege/` lädt die Auswahl als JS-Komponente
  (sichtbar nur Kaufvertrag).
- schweizer-vertraege.ch — Vollinventar 12.6.2026 (siehe Abschnitt 2).
- LexMetrik-Ist-Stand: `startseiteConfig.ts` (105 Karten: 32 gebaut als
  `entwurf`, 73 geplant, 0 geprüft) + `KATALOG-ROADMAP.md` (inkl. Teil D)
  + `vorlagenKategorie.ts`, Inventur 12.6.2026.

**Normentreue:** Artikel ohne Marker = sicher bekannt; **[VF]** = zu
verifizieren (Fedlex) vor Bau. Normen, die nur die Quell-Seite nennt, sind
als solche gekennzeichnet und gelten NICHT als verifiziert.

---

## 1 · Kurzbefund je Quelle

1. **rechtswissen.ch** — Self-Service-Portal (Abo ab CHF 10.–/Mt.) mit
   ~21 Rechnern (Kern deterministisch, mehrere Schätz-/Ermessens-Tools),
   2 expliziten KI-Features (ChatGPT-Chatbot, KI-Briefgenerator = Bucket D)
   und ~26 Vorlagen (6 Kündigungs-Generatoren, 4 Musterbriefe,
   26 Word-Downloads in 4 Gruppen); Überschneidung mit LexMetrik gross,
   aber ein Dutzend echte Lücken-Kandidaten.
2. **schweizer-vertraege.ch** (WEKA Business Media AG) — reiner
   Word-Download-Shop: **424 kostenpflichtige Dokumenttypen** (CHF 20–150,
   keine Gratis-Vorlagen, 392× Word, 32× ZIP-Paket) in 15 Kategorien;
   viele Nahe-Duplikate (z. B. 30+ Arbeitsvertrags-Varianten, 12
   Arbeitszeugnis-Varianten, 14 Dienstbarkeiten); 88 Detailseiten mit
   Formvorschrift-Hinweis; KEIN Generator, KEINE Rechner, kein KI-Feature —
   relevant ausschliesslich für Ziel B/C.

---

## 2 · Inventar Quelle 1: rechtswissen.ch

### 2.1 Rechner/Tools (21)

| Tool | URL-Pfad (rechtswissen.ch) | Materie | Normen laut Seite | Zugang |
|---|---|---|---|---|
| Verzugszins-Rechner | /tools/basic-tools/verzugszins-rechner/ | Verzugszins, mehrere Perioden, 30/360 | OR 102/104/105 III; BGE 130 III 591 | Abo |
| Mittlerer Verfall | /tools/mittlerer-verfall-rechner/ | mittleres Verfalldatum f. Zinsrechnung | — | frei |
| Ferienlohn-/Stundenlohn | /tools/basic-tools/ferienlohn-rechner/ | Ferienlohn nicht bezogener Ferien | OR 329a, 329c II | Abo |
| Teuerungsrechner | /tools/teuerungsrechner/ | LIK-Anpassung 1990–2023 | LIK | frei |
| Datum-Rechner | /tools/datum-rechner/ | Tage/Werktage/Zieldatum, eidg. Feiertage | — | frei |
| Dreisatz-Rechner | /tools/basic-tools/dreisatz-rechner/ | Proportional (z. B. IV-Grad) | — (LSE TA1) | frei |
| Überholweg-Rechner | /tools/basic-tools/ueberholweg-rechner/ | Überholweg/-dauer (Physik) | SVG 35, 34 IV; VRV 12 I, 36 V | frei/AGB |
| Lohnfortzahlung & Sperrfristen | /tools/lohnfortzahlung-sperrfristen/ | Skalen, Sperrfrist, Kündigungs-Gültigkeit | OR 324a, 336c, 329f/i, 335c | frei/AGB |
| Ferienkürzung | /tools/ferienkuerzung-rechner/ | zulässige Kürzung + Restanspruch | OR 329a–c, 329f/g/i | frei + Bezahl-PDF |
| Nettolohnrechner | /tools/nettolohnrechner/ | Brutto→Netto, fixe Sätze | AHV/ALV/UVG/BVG/KTG | frei |
| Unterhaltsrechner | /tools/unterhaltsrechner/ | Kindes-/nachehel. Unterhalt (zweistufig-konkret) | ZGB 276/286; BGE 147 III 265 | frei |
| Erbrechner | /tools/erbrechner/ | Erbquoten + Pflichtteile | ZGB 458 ff., 470 ff. | frei |
| Erwerbsausfall-Rechner | /tools/haftpflichtrechner/erwerbsausfall-rechner/ | ungedeckter Erwerbsschaden + Zins | BGE 129 III 135 | frei + Bezahl |
| Haushaltschaden-Rechner | /tools/haftpflichtrechner/haushaltschaden-rechner/ | Haushalt-/Pflegeschaden (SAKE 2020, CHF 30/40) | — | frei + Bezahl |
| Mietzinsrechner | /tools/mietzinsrechner/ | Mietzinserhöhung/-senkung gerechtfertigt? | OR 269 ff., 270, 270a; VMWG 11/12 | frei (Beta) |
| Nettorendite-Rechner | /tools/nettorendite-rechner/ | Nettorendite vs. Schwellenwert | OR 269/270/270a; BGer 4A_554/2019 | frei/AGB |
| Baumabstand-Prüfer | /tools/baumabstand/ | kantonale Pflanzabstände (EG ZGB) | ZGB 684–689 + kantonal | frei |
| Bussenrechner | /tools/bussenrechner/ | Tempobusse + Ausweisentzug-Einschätzung | SVG 32/90/16a–d; VRV 4a; OBV | frei/AGB |
| Promille-Rechner | /tools/promille-rechner/ | BAK-Schätzung (Widmark) | SVG 31/55/15d | frei |
| Fristenrechner | /tools/fristenrechner/ | Rechtsmittelfrist-Ende inkl. Gerichtsferien | ZPO 142/143/145 | frei |
| Rechtswissen AI (Chatbot) | /rechtswissen-ai/ | jurist. Fragen, ChatGPT-basiert | — | Abo/Test |

Dazu Dienstleistung (kein Software-Tool): Arbeitszeugnis-Prüfer
(/rechtsauskunft/arbeitszeugnis-pruefer/, Prüfung durch Anwalt, CHF 130.–).

### 2.2 Vorlagen (≈26)

**Generatoren (Formular → PDF):** Einfache Briefvorlage (frei) ·
KI-Briefgenerator (**KI**, ChatGPT 4o) · Kaufvertrag (Schritt-für-Schritt,
inkl. Fahrzeug; OR 184 ff. laut Seite) · Kündigungen: Arbeitsvertrag,
Mietvertrag, Krankenkasse, Partnervermittlung, Kirchenaustritt, Abo, Verein ·
Musterbriefe: Einsprache Strafbefehl (SVG), Einspracherückzug, Unberechtigte
Inkassoforderung anfechten, Begehren um Mietzinsreduktion.

**Word-Downloads (Abo, 26 Stück in 4 Gruppen, keine Einzel-URLs —
/vorlagen/word-vorlagen/):**
- *Vereinbarungen (7):* Mietvertrag bewegliche Sachen · Schuldanerkennung
  mit/ohne Ratenzahlung · Arbeitsvertrag Aushilfe Stundenlohn ·
  Schenkungsvertrag · Darlehensvertrag mit Zins · Vereinbarung mit
  Saldo-Klausel.
- *Juristische Erklärungen (9):* Vollmacht · Patientenverfügung ·
  Vorsorgeauftrag · Arbeitszeugnis-Muster · Verjährungseinredeverzicht ·
  Entbindung Arztgeheimnis · Entbindung Anwaltsgeheimnis · Rechtsvorschlag ·
  Berufungsanmeldung gegen Strafurteil.
- *Juristische Schreiben (8):* Mängelrüge Kauf · Mahnung · Anfechtung
  Mietzinserhöhung · Gesuch Löschung Betreibungsregisterauszug ·
  Unfallmeldung Haftpflichtversicherung · Haftungsbeurteilung verlangen ·
  Strafantrag + Anmeldung Privatklägerschaft · Fristerstreckungsgesuch.
- *Rechtsschriften (2):* Vorsorgliche Einsprache gegen Verfügung ·
  Gestaltungsvorlage Beschwerde.

---

## 3 · Klassifikation Rechner (Ziel A)

Buckets: **A** vorhanden/bereits geplant (Dedup) · **B** Kandidat (alle vier
Filter erfüllt: deterministisch · normgetreu · clientseitig · kein KI) ·
**C** Ausschluss Ermessen/Schätzung · **D** Ausschluss KI/off-brand.

| Tool (rechtswissen.ch) | Bucket | Normgrundlage | Ebene | Begründung |
|---|---|---|---|---|
| Verzugszins-Rechner | **A** | OR 102/104 | Bund | LexMetrik `verzugszins` gebaut (inkl. Teilzahlungen) |
| Datum-Rechner | **A** | — | — | `tagerechner` gebaut (+ Feiertage kantonsscharf) |
| Fristenrechner (ZPO) | **A** | ZPO 142–145 | Bund | `zpo-fristen` + Tagerechner gebaut |
| Teuerungsrechner | **A** | LIK | Bund | `teuerungsrechner` gebaut |
| Lohnfortzahlung & Sperrfristen | **A** | OR 324a/336c | Bund/kant. Skalen | `lohnfortzahlung` + `kuendigung-sperrfristen` gebaut |
| Erbrechner | **A** | ZGB 470 ff. | Bund | `erbteilung` (Pflichtteile, Rev. 2023) gebaut |
| Mietzinsrechner | **A*** | OR 269a lit. b [VF VMWG-Artikel] | Bund | bereits geplant: `mietzinsanpassung` (ROADMAP Lücken-Rang 6) — nicht doppelt vorschlagen |
| Ferienkürzung | **A*** | OR 329b | Bund | bereits geplant: Ferienanspruch+Kürzung EIN Rechner (ROADMAP Arbeit, Entscheid offen) |
| **Ferienlohn (Auszahlung nicht bezogener Ferien)** | **B** | OR 329d (Lohnanteil) [VF: 8.33 %-Herleitung aus 329a] | Bund | deterministisch (Quote × Lohn), datenarm; gehört als FUNKTION in den geplanten Ferien-Rechner, keine eigene Karte (Mehrwert-Test) |
| **Mittlerer Verfall** | **B** | Praxismethode Haftpflicht/Zins [VF: BGE-Anker] | Bund | deterministische Arithmetik; als OPTION im gebauten `verzugszins` (Teilzahlungs-Zweig), keine eigene Karte |
| **Nettorendite (Art. 269)** | **B** | OR 269; BGE 147 III 14 + BGer 4A_554/2019 [VF: Formel-Parameter Referenzzins+2 %] | Bund | Formel höchstrichterlich fixiert; als MODUL der geplanten `mietzinsanpassung` (gleiches Regime Missbräuchlichkeit) |
| **Bussenrechner (Ordnungsbussen + Mindestentzug)** | **B** | OBV Anhang 1; SVG 16a–c Mindestdauern [VF: Schwellen-Tabellen] | Bund | Tarif-Tabelle = deterministische Datenschicht; ABER nur der Katalog-Teil — die «Einschätzung» des Entzugs jenseits der Mindestdauer ist Verwaltungsermessen und bleibt draussen |
| **Baumabstand (kantonal)** | **B** | ZGB 688 i. V. m. 26× kantonalem EG ZGB [VF: alle 26 Erlasse] | kantonal | deterministische kantonale Datenschicht (Muster Schlichtungs-Register); Praxiswert Nachbarrecht mittel; Erhebungsaufwand 26 Erlasse |
| Nettolohnrechner | **C/✗** | — | — | rechnerisch deterministisch, aber Treuhand-Domäne — Präzedenz: David strich «AHV-Beiträge» genau dafür (ROADMAP); BVG/KTG zudem kassen-/vertragsabhängig |
| Dreisatz-Rechner | **✗** | — | — | reiner Dreisatz ohne Rechtsregime (Präzedenz «13. Monatslohn» ✗, §0-Mehrwert-Test) |
| Unterhaltsrechner | **C** | — | — | Ermessen; von David BESTÄTIGT im Backlog («Kindes-/Ehegattenunterhalt») |
| Erwerbsausfall-Rechner | **C** | — | — | hypothetisches Einkommen/AUF-Grad = Wertung; Backlog «Schadenersatz». Deterministischer Teilschritt wäre allein die Schadenszins-/Barwert-Arithmetik |
| Haushaltschaden-Rechner | **C** | — | — | Einschränkungs-% = Wertung; SAKE-Stundenansätze = Praxis, nicht Norm; Backlog dito |
| Überholweg-Rechner | **C** | — | — | Physik-Schätzformel (Annahmen Beschleunigung/Reaktion), keine Norm-Berechnung |
| Promille-Rechner | **C/D** | — | — | Widmark = physiolog. Schätzung; zudem Konsumenten-Tool, off-brand |
| Rechtswissen AI | **D** | — | — | LLM-Chatbot — Gegenteil von «Berechnung statt KI» |
| KI-Briefgenerator | **D** | — | — | LLM-Textgenerator |
| Arbeitszeugnis-Prüfer | **D** | — | — | menschliche Dienstleistung, kein Software-Tool; Zeugnis-Formulierung = Wertung (ROADMAP ◐→✗) |
| Einfache Briefvorlage | **✗** | — | — | generischer Briefkopf ohne Rechtsregime; Layout-Funktion existiert in `formatvorlagen.ts` |

**Zwischenfazit Ziel A:** Kein einziger rechtswissen-Rechner rechtfertigt
eine NEUE eigenständige LexMetrik-Karte. Die vier B-Kandidaten mit Substanz
sind Erweiterungen bestehender/geplanter Regime (Ferienlohn → Ferien-Rechner;
Mittlerer Verfall → Verzugszins; Nettorendite → Mietzinsanpassung) bzw. eine
neue Tarif-Datenschicht (Bussenkatalog) und eine kantonale Datenschicht
(Baumabstand) — Priorisierung in Abschnitt 5.

---

## 2bis · Inventar Quelle 2: schweizer-vertraege.ch

**Methode:** Startseite + alle 25 A–Z-Indexseiten + alle 15 Themenseiten +
alle 424 Detailseiten gelesen (serverseitig gerendert, voll lesbar;
sitemap.xml existiert nicht — Vollständigkeit über doppelten Abgleich A–Z ↔
Themenseiten gesichert, beide Richtungen deckungsgleich).
«Suchbegriff»-Landingpages gruppieren dieselben 424 nur anders.

**Zähler je Kategorie:** Arbeitsvertrag 68 · Aufträge an Dritte 31 ·
Bauvertrag 33 · Eherecht 20 · Erbrecht 19 · Finanzierung/Sicherheiten 27 ·
IT-Wartung/Lizenzen 20 · Kauf/Verkauf 46 · Kündigung 22 · Miete/Pacht 18 ·
Nachfolgeplanung 8 · Transport 5 · Unternehmensführung/Gründung 72 ·
Vertrieb/Sponsoring 14 · Zusammenarbeit/Entwicklung 21 = **424**.

Das zeilengenaue Inventar (Name · URL · Preis · Format · Formhinweis je Typ)
ist über die 15 Themenseiten `schweizer-vertraege.ch/Thema/<nr>-<name>`
jederzeit reproduzierbar; die Klassifikation in Abschnitt 4 erfasst JEDEN
Typ über seinen Cluster. Auffälligkeiten: einzelne Fehlzuordnungen der
Website (Musterstatuten unter «Arbeitsvertrag»); mehrere Formvorschrift-
Angaben der Quelle sind rechtlich zweifelhaft (siehe 4.2 — wir übernehmen
KEINE Formangaben ungeprüft).

---

## 4 · Klassifikation Vorlagen (Ziel B)

### 4.1 Cluster-Tabelle (alle 424 + rechtswissen-Vorlagen erfasst)

Spalten: baustein-fähig (includeIf-Logik) · Formvorschrift → `ausgabeArt` ·
Dedup-Status LexMetrik · Einschätzung (P1/P2/P3/✗; Mehrwert-Test 7.6.).

| Cluster (Quelle, Anzahl) | baustein-fähig | Form → ausgabeArt | vorhanden/geplant? | Einschätzung |
|---|---|---|---|---|
| Arbeitsvertrags-Varianten (sv ~30: Teilzeit/befristet/Stundenlohn/Kader/mobil/Pikett/Gratifikation/Überstunden/Spesen/Branchen) | ja — ideale includeIf-Module | formfrei, Schriftlichkeit üblich → `fertig` | **gebaut** `arbeitsvertrag` | kein Neueintrag — Modul-/Detailgrad-Ausbau der EINEN Karte (Ziel C.4); WEKA-Gegenmodell |
| Zusatzvereinbarungen Arbeit (sv 6: unbez. Urlaub, Weiterbildung, Provision, Treueprämie, Geschäftsauto, Gleitzeit) | ja | formfrei → `fertig` | Lücke | **P2** Paket «Zusatzvereinbarung zum Arbeitsvertrag» (eine Maske, Varianten) |
| Reglemente (sv 4: Spesen/Gleitzeit/Internet) | ja (Gerüst) | formfrei → `fertig`; Spesen: Genehmigung kant. Steueramt als Hinweis [VF] | Lücke | P3 ◐ |
| Lehr-/Anlehrvertrag (sv 3) | ja | Schriftform Art. 344a OR + Genehmigung kant. Behörde [VF] | Lücke | ✗ — amtliche Lehrvertrags-Formulare existieren (Mehrwert-Test) |
| Personalverleih/Temporär (sv 3) | ◐ | AVG-Schriftform + Bewilligung [VF] | Lücke | P3 |
| Aufhebungs-/Austritts-/Auflösungsvereinbarung (sv 4) | ja | formfrei → `fertig`; Saldoklausel-/Freiwilligkeits-Gates | **geplant** `aufhebungsvereinbarung` | Varianten dort (inkl. Saldo, Freistellung) |
| Änderungskündigung (sv 1) | ja | wie Kündigung → `fertig` | Lücke | **P2** — Variante der gebauten AG-Kündigungsmaske (Sperrfristen-Gate wirkt mit) |
| Arbeitszeugnis-Varianten (sv 12 inkl. Zwischenzeugnis; rw Muster + Anwalts-Prüfdienst) | nein — Formulierung = Wertung | — | geplant (Teil D: Vorschlag ✗) | **✗ bestätigt** — Quellbefund stützt Davids Streich-Vorschlag |
| Sozialplan · Kündigungsgespräch-Leitfaden (sv 2) | nein | — | Lücke | ✗ (Verhandlung/Ermessen bzw. kein Dokument) |
| «Schlechtes Arbeitszeugnis» (Korrektur-Begehren, sv 1) | ja | formfrei → `fertig` | Lücke | P3 (Begehren ans Arbeitgeber; klein) |
| Mietvertrag-Objektvarianten (sv 8: Büro/Garage/Abstellplatz/Veranstaltung/Restaurant/Dienstwohnung) | ja | formfrei → `fertig` | **gebaut** `mietvertrag-wohnen` (W/G/U) | Objekttyp-Module der bestehenden Karte (Garage/Parkplatz) |
| Pachtvertrag (sv 3 inkl. Gastronomie) | ja | formfrei → `fertig`; landwirtsch. Pacht: LPG-Sonderrecht [VF] | Lücke | **P2** eigener Typ (eigenes Regime OR 275 ff.) |
| Miete bewegliche Sachen / Auto (sv 3 + rw 1) | ja | formfrei → `fertig`; Konsumenten-Langzeitmiete: KKG-Gate [VF] | Lücke | P2 |
| Fahrniskauf-Varianten (sv 8: Gebrauchtwagen/Akkreditiv/Verrechnung/Tausch + rw Generator) | ja | formfrei → `fertig` | **geplant** `kaufvertrag` | Varianten dort (Gebrauchtwagen prioritär) |
| Grundstückgeschäfte (sv ~15: Kauf/Vorkauf/Kaufrecht/Vorvertrag/Reservation/StWE-Begründung) | ja als Entwurf | öffentl. Beurkundung Art. 216 OR → `entwurf`; Reservation: BGE-Praxis Formnichtigkeit [VF] | Lücke | P3 ◐ — Notariats-Domäne, §8-Präzedenz Gründungsakte |
| Schenkungsvertrag (rw 1, sv Grundstück 1) | ja | Schenkungsversprechen Fahrnis: Schriftform Art. 243 Abs. 1 OR → `fertig`; Grundstück: Beurkundung → `entwurf` | Lücke | P2 (Fahrnis-Schenkungsversprechen) |
| Darlehens-Varianten (sv 6: Nahestehende/hypothekarisch/Schuldübernahme/partiarisch + rw mit Zins) | ja | formfrei → `fertig`; Konsumkredit-Gate KKG | **geplant** `darlehensvertrag` | Varianten dort |
| Konsumkredit / Leasing (sv 3) | ◐ | KKG: Schriftform + zwingende Inhalte + Widerruf [VF] | Lücke | P3 (Konsumentenschutz-Komplexität) |
| **Bürgschaft** (sv 3: einfach/solidarisch/Mitbürgschaft) | ja | **Form-WEICHE Art. 493 OR**: natürl. Person ≤ CHF 2000 Schriftform / darüber öffentl. Beurkundung; jur. Person Schriftform [VF Details] | Lücke | **P2 — Paradebeispiel ausgabeArt-Weiche nach Eingaben** (Betrag/Personentyp steuert fertig↔entwurf) |
| **Forderungsabtretung/Zession** (sv 2) | ja | Schriftform Art. 165 Abs. 1 OR → `fertig` | Lücke | **P1** — klein, deterministisch, Inkasso-/SchKG-Praxis |
| Schuldübernahme (sv 2) | ja | formfrei [VF intern/extern] → `fertig` | Lücke | P2 (Paket mit Zession) |
| Schuldanerkennung ± Ratenzahlung (sv 2 + rw 2) | ja | formfrei; Wirkung Art. 82 SchKG nur unterschrieben → `fertig` | **geplant** `schuldanerkennung` | Ratenzahlungs-Variante übernehmen |
| **Verjährungsverzicht** (sv 1 + rw 1) | ja | einseitige Erklärung; Art. 141 OR rev. [VF Abs./Maximaldauer 10 J.] → `fertig` | Lücke | **P1** — Forderungs-Alltag jeder Kanzlei, winzig, verknüpft `verjaehrung`-Rechner |
| Garantie/Hinterlegung/Pfand/Schuldbrief (sv 6) | ja | formfrei; Grundpfand Beurkundung → gemischt | Lücke | P3 |
| Factoring/Lombard/Escrow/partiarisch (sv 4) | ◐ | — | Lücke | ✗ Banken-/Spezialfinanz |
| Ehevertrag-Güterstände (sv 5: Gütertrennung/-gemeinschaft/Errungenschaft/Vorschlagszuweisung) | ja — 4 Varianten EINER Maske | öffentl. Beurkundung Art. 184 ZGB → `entwurf` | Lücke | **P2** Familienrecht-Block (entwurf-Gate wie Gründungsakte) |
| Scheidungs-/Trennungspaket (sv 4: Konventionen, gem. Begehren) | ja (Gerüst, Genehmigungsvorbehalt) | Schriftform/Eingabe → `fertig` mit Gates | **geplant** (scheidungskonvention, trennungsvereinbarung; Begehren = Lücke der Bauspez. familienrecht-klagen) | dito — kein Neueintrag |
| **Konkubinatsvertrag** (sv 4: allgemein/Miete/Wohnungserwerb) | ja (Module Wohnen/Kosten/Inventar/Auflösung) | formfrei → `fertig` | Lücke (nur «Konkubinatsauflösung» geplant) | **P1** — schliesst Familienrecht-Block nach unten |
| Ehe-/Erbvertrag kombiniert (sv 4) | ja | Erbvertragsform Art. 512 ZGB Beurkundung → `entwurf` | **geplant** `erbvertrag` | dort als Kombi-Variante |
| Testament-Varianten (sv 6: Erbeinsetzung/Vermächtnis/Teilungsvorschriften/Willensvollstrecker/Nachfolge) | ja | eigenhändig Art. 505 ZGB → `abschrift` | **gebaut** `eigenhaendiges-testament` | Detailgrad-/Modul-Ausbau der EINEN Karte |
| Erbteilungsvertrag (sv 4 inkl. partiell/Auskauf) | ja | **Schriftform Art. 634 Abs. 2 ZGB** — Quelle behauptet teils «öffentl. Beurkundung»: rechtlich zweifelhaft, Abweichung offengelegt [VF] → `fertig` | **geplant** `erbteilungsvereinbarung` | Befund WERTET AUF: voller Export möglich, nicht nur Entwurf |
| Erbverzicht/Erbzuwendung (sv 4) | ja | Erbvertragsform Beurkundung → `entwurf` | **geplant** `erbverzichtsvertrag` | dito |
| **Auftrag/Dienstleistungsvertrag** (sv 12: Auftrag/Consulting/Treuhand/Beratung/Inkassoauftrag) | ja — ein Grundtyp, Gegenstands-Module | formfrei Art. 394 ff. OR → `fertig` | Lücke | **P1** — fehlender GRUNDTYP der Verträge-Sektion |
| **Werkvertrag** (sv 2 Pakete + Werklieferung) | ja | formfrei Art. 363 ff. OR → `fertig` | Lücke | **P1** — zweiter fehlender Grundtyp; verknüpft `gewaehrleistung` (Rüge 367/Verjährung 371) |
| Abnahmeprotokoll (sv 1) | ja | formfrei → `fertig` | Lücke | P2 (Beilage zum Werkvertrag) |
| Mäkler-/Maklervertrag (sv 4 + rw 1) | ja | formfrei Art. 412 ff. OR → `fertig` | Lücke | P2 |
| **Geheimhaltungsvereinbarung/NDA** (sv 3) | ja | formfrei → `fertig` | Lücke | **P1** — universell (M&A, Personal, IT), klein |
| Kooperation/Joint Venture/Zusammenarbeit (sv 15) | ja (Gerüst einfache Gesellschaft Art. 530 ff. OR) | formfrei → `fertig` | Lücke | P2 EIN Typ «Kooperationsvertrag», JV als Variante |
| Datenschutz: ADV/Datenschutzvereinbarung (sv 2) | ja | Auftragsbearbeitung Art. 9 DSG [VF] → `fertig` | Lücke (DSG-Begehren als `erklaerung` geplant) | P2 |
| IT: SLA/Lizenz/Wartung/Software (sv 18) | ja (Gerüst) | formfrei → `fertig` | Lücke | P3 — B2B-individuell, Kanzlei-Praxiswert begrenzt |
| AGB-Branchensätze (sv 14: Onlineshop/Hosting/Cloud …) | ◐ | — | Lücke | ✗ — branchenindividuell, Haftungsrisiko pauschaler AGB; «öffentl. Beurkundung»-Hinweise der Quelle bei AGB sind offensichtlich fehlerhaft |
| Vertrieb: Alleinvertrieb/Agentur/Franchise/Kommission (sv 12) | ja (Gerüst) | formfrei → `fertig` | Lücke | P3 |
| Bau: GU/TU/Architekt/Konsortium (sv 12) | ◐ | SIA-Normen-Verweise (Urheberrecht!) | Lücke | ✗/P3 — individuell; SIA-Regelwerk nicht übernehmbar |
| Dienstbarkeiten (sv 14) + Baurecht (sv 4) | ja als Entwurf | öffentl. Beurkundung Art. 732 ZGB [VF] → `entwurf` | Lücke | P3 ◐ Notariats-Domäne |
| Gesellschafts-Mappen: Gründung/KE/Statutenrevision/Liquidation (sv ~30) | ja | Beurkundungs-Mix (im Ist §8-Gate vorhanden) | **gebaut** ag/gmbh/kapitalerhoehung; statuten/gv-vr **geplant** | Lücken NUR: Statutenänderungs-Mappe (Teil D: «künftig») + Liquidations-Mappe (P2) |
| **Aktionärbindungsvertrag** (sv 1) | ja (Module Vorkauf/Stimmbindung/Drag-Tag/Konkurrenzverbot) | formfrei → `fertig` | Lücke | **P1** — KMU-Kanzlei-Kernprodukt, Sektion IV |
| Organisationsreglement AG (sv 1) | ja | formfrei (Art. 716b OR) → `fertig` | Lücke | P2 (Sektion IV) |
| GV-Einladung/Protokolle/Vollmachten GV (sv ~10) | ja | formfrei → `fertig` | **geplant** `gv-vr-beschluss` | dort als Mappen-Teile |
| Vereinsstatuten (sv 1) · Genossenschaft (sv 1) | ja | Schriftform Art. 60 ZGB → `fertig` | Lücke | P2 Verein / P3 Genossenschaft |
| Kollektiv-/Kommandit-/Stille Gesellschaft (sv 5) | ja | formfrei → `fertig` | Lücke | P3 |
| Übertragung Stammanteile GmbH (sv 1) | ja | Schriftform Art. 785 OR [VF] → `fertig` | Lücke | P2 (Sektion IV; HReg-Folgeanmeldung als Hinweis) |
| Fusion/Spaltung/Umwandlung/Sanierung (sv 10) | ◐ | FusG-Verfahren | Lücke | P3 |
| M&A: LOI/Exklusivität/Closing/Datenraum/Unternehmenskauf (sv 8) | ◐ | formfrei | Lücke | P3 — transaktionsindividuell |
| Transport (sv 5) · Nachlassvertrag SchKG (sv 2) · Domizilhalter (sv 2) · Aktienzertifikat (sv 1) | teils | — | Lücke | ✗/P3 |
| rw: **Fristerstreckungsgesuch** | ja | formfrei (Eingabe) → `fertig` | Lücke | **P1** — kleinste prozessuale Alltags-Eingabe; verknüpft zpo-fristen |
| rw: **Löschungsgesuch Betreibungsregister** | ja | Gesuch ans Betreibungsamt, Art. 8a Abs. 3 lit. d SchKG [VF Voraussetzungen/Frist] → `fertig` | Lücke | **P1** — SchKG-Paket, hohe Mandats-Frequenz |
| rw: Entbindungserklärungen Arzt/Anwalt (2) | ja | formfrei → `fertig` | Lücke | P2 (klein, Prozess-Vorbereitungsalltag) |
| rw: Anfechtung Mietzinserhöhung (270b) · Herabsetzungsbegehren (270a) | ja | Eingabe an Schlichtungsbehörde → `fertig` | Lücke (ROADMAP: Mängel-Herabsetzung ◐) | P2 — Paket mit geplanter `mietzinsanpassung` + Schlichtungs-Adressauflösung (Synergie!) |
| rw: Mängelrüge Kauf | ja | formfrei, Frist! → `fertig` | Lücke | P2 (`erklaerung`, ThemenEinstieg `gewaehrleistung`) |
| rw: Berufungsanmeldung Strafurteil (StPO 399) | ja | Eingabe → `fertig` | Lücke (Straf-Vorlagen geplant) | P2 ins Straf-Paket |
| rw: Kirchen-/Vereinsaustritt, Partnervermittlung-Kündigung, Einsprache-Rückzug, Inkasso-Abwehr, Unfallmeldung/Haftungsbeurteilung | ja | formfrei → `fertig` | teils Varianten `kuendigung-vertrag` | P3 — Konsumenten-Zuschnitt, tiefer Kanzleiwert |

### 4.2 Form-Befunde mit Korrektur-Charakter

1. **Erbteilungsvertrag:** Quelle nennt öffentliche Beurkundung; nach
   Art. 634 Abs. 2 ZGB genügt Schriftform (auch bei Grundstücken im
   Nachlass — herrschende Lehre/Praxis) [VF vor Bau]. Folge: geplante
   `erbteilungsvereinbarung` kann `fertig` statt `entwurf` werden.
2. **Bürgschaft:** die EINE Vorlage der Quelle verschweigt die
   Form-Weiche Art. 493 OR — genau hier liegt der LexMetrik-Mehrwert
   (deterministisches Form-Gate nach Betrag/Personentyp).
3. AGB-Seiten mit «öffentl. Beurkundung»-Hinweis sind Quell-Datenfehler
   (CMS-Versehen) — Beleg, dass Formangaben der Quelle NIE ungeprüft
   übernommen werden dürfen.

---

## 5 · P1-Listen

### 5.1 P1-Rechner (Ziel A) — KEINE neue Karte, drei Engine-Erweiterungen

1. **Mittlerer Verfall** als Option im gebauten `verzugszins` (Teilzahlungs-
   Zweig existiert): deterministische Datums-Arithmetik, ergänzt die exakte
   Methode um die Praxis-Vereinfachung; Normanker/BGE [VF].
2. **Ferienlohn-Auszahlung** (Quote × Lohn, Art. 329d OR [VF Herleitung])
   als Funktion des GEPLANTEN Ferien-Rechners (ROADMAP: Ferienanspruch +
   Kürzung EIN Rechner — Davids Entscheid offen); kein eigener Eintrag.
3. **Nettorendite-Modul** (Art. 269 OR; Formel BGE 147 III 14 /
   4A_554/2019 [VF Parameter]) in die GEPLANTE `mietzinsanpassung` —
   gleiches Regime Missbräuchlichkeit, höchstrichterlich fixierte Formel.

Neue Teil-D-Entscheidkandidaten (kein P1, Davids Fall-für-Fall-Entscheid):
**Bussenkatalog-Rechner** (OBV-Tarif + SVG-16a–c-Mindestentzug — neue
Tarif-Datenschicht, deterministisch, Verkehrsrechts-Kanzleien) ·
**Baumabstand kantonal** (26× EG ZGB — Datenschicht nach Schlichtungs-
Muster, Erhebungsaufwand hoch, Praxiswert mittel).

### 5.2 P1-Vorlagen (Ziel B) — baustein-fähig + `fertig` + Lücke

1. **Verjährungsverzichtserklärung** — kleinste Vorlage mit höchster
   Kanzlei-Frequenz (Forderungsmandate); deterministisch (Gläubiger/
   Schuldner/Forderung/Dauer); ThemenEinstieg am `verjaehrung`-Rechner.
2. **Geheimhaltungsvereinbarung (NDA)** — universal (Personal, M&A, IT),
   ein Grundgerüst mit einseitig/gegenseitig-Weiche und Konventionalstrafe-
   Option; formfrei.
3. **Forderungsabtretung (Zession)** — Schriftform Art. 165 Abs. 1 OR als
   hartes Export-Kriterium (Unterschrift Zedent); Brücke zu SchKG-Werkzeugen
   (Gläubigerwechsel in Betreibung).
4. **Auftrag (Dienstleistungsvertrag)** — fehlender Grundtyp; EIN Schema
   mit Gegenstands-Modulen (Beratung/Treuhand/Inkasso-Mandat), deckt ~12
   WEKA-Typen ab.
5. **Werkvertrag (einfach)** — zweiter fehlender Grundtyp; includeIf-Module
   (Pauschal-/Aufwandpreis, Abnahme, Garantie); verdrahtet mit
   `gewaehrleistung` (Rüge-/Verjährungsfristen) und künftigem Abnahmeprotokoll.
6. **Konkubinatsvertrag** — Familienrecht-Block-Lücke (nur Auflösung
   geplant); Module Wohnen/Kosten/Inventar/Auflösungsfolgen; formfrei.
7. **Aktionärbindungsvertrag** — Sektion IV; KMU-Kanzlei-Kernprodukt;
   Module Vorkaufsrecht/Stimmbindung/Mitverkaufsrechte/Konkurrenzverbot;
   formfrei. (Grösster P1-Posten — als letzte P1-Phase.)
8. **Fristerstreckungsgesuch** — Behördeneingabe, winzig; Prefill aus
   `zpo-fristen` (laufende Frist reist mit) = Workflow-Kontinuität G3.
9. **Löschungsgesuch Betreibungsregisterauszug** (Art. 8a Abs. 3 lit. d
   SchKG [VF]) — SchKG-Vorlagen-Paket; hohe Frequenz, deterministische
   Voraussetzungen.

Dazu OHNE Neueintrag (Varianten-Ausbau bestehender/geplanter Karten):
Schuldanerkennung-Ratenzahlung · Arbeitsvertrags-Module · Mietvertrag-
Objekttypen Garage/Parkplatz · Testament-Varianten (Vermächtnis/
Teilungsvorschriften/Willensvollstrecker) · Aufhebungsvereinbarung-
Saldoklausel · Kaufvertrag-Gebrauchtwagen.

---

## 6 · Darstellungskonzept «Verträge» (Ziel C)

**Design-These (aus dem Quellvergleich):** WEKA verkauft 68 Arbeitsvertrags-
Dokumente — LexMetrik baut EINEN Arbeitsvertrag-Wizard mit includeIf-
Modulen. Der Katalog zeigt darum **einen Eintrag pro Rechtsfrage**, nie pro
Variante; Varianten und Detailgrade leben im Wizard. Das ist die
Skalierungs-Antwort: auch mit 30 Vertragstypen bleibt die Sektion lesbar,
weil sie nie 424 Karten braucht.

### 6.1 Untergliederung: 7 Rubriken innerhalb Sektion II

Mechanik exakt wie `EINGABE_RUBRIKEN` (bewährtes Muster, §10): neues Feld
`vertragRubrik` auf VorlageCards mit `art: 'vertrag'`, Definitionen in
`vorlagenKategorie.ts`, Vollständigkeits-Test erzwingt Zuordnung (kein
stilles «Weitere»).

| Rubrik | heutige Karten | P1/P2-Zuwachs (aus dieser Analyse) |
|---|---|---|
| 1 Arbeit & Personal | Arbeitsvertrag (E) · Aufhebungsvereinbarung (g) | Zusatzvereinbarungs-Paket (P2) |
| 2 Miete & Pacht | Mietvertrag W/G/U (E) | Pacht (P2) · Miete bewegl. Sachen (P2) |
| 3 Kauf & Schenkung | Kaufvertrag (g) | Schenkungsversprechen Fahrnis (P2) |
| 4 Auftrag & Werkvertrag | — | **Auftrag (P1) · Werkvertrag (P1)** · Mäkler (P2) |
| 5 Darlehen, Sicherheiten & Forderung | Darlehensvertrag (g) · Vergleichsvereinbarung (g) | Bürgschaft (P2, Form-Weiche) · Schuldübernahme (P2) |
| 6 Familie & Partnerschaft | Trennungsvereinbarung (g) · Scheidungskonvention (g) · Elternvereinbarung (g) | **Konkubinatsvertrag (P1)** · Ehevertrag (P2, entwurf) |
| 7 Zusammenarbeit & Geheimhaltung | — | **NDA (P1)** · Kooperationsvertrag (P2) |

(E = entwurf/gebaut, g = geplant. Aktionärbindungsvertrag, Organisations-
reglement, Stammanteils-Übertragung → Sektion IV Gesellschaftsrecht, nicht
Verträge.) Rubriken 4 und 7 starten ohne verfügbare Karte und erscheinen
erst, wenn die erste P1-Vorlage gebaut ist (`proGruppe`-Filter wirkt schon
heute so — kein leeres Gerüst, §8).

### 6.2 Skalierungsverhalten

- **≤ 3 verfügbare je Rubrik (heutiger Zustand):** alle Rubriken offen,
  Optik wie die Eingabe-Rubriken (Überschrift `lc-overline` + `pl-3
  border-l-2 border-line`, WerkzeugZeile-Grid, GeplantZeile gedämpft).
- **> 6 verfügbare je Rubrik:** Rubrik wird `<details>`-einklappbar mit
  Zähler («Arbeit & Personal (8)»), Default: die zwei praxisrangstärksten
  Rubriken offen, Rest zu — gleiche Mechanik wie die bestehende
  «In Vorbereitung (N)»-Zeile, kein neuer Apparat.
- **Suche unverändert** (?q= Header-Suche, Goldliste) — Rubriken sind
  Anzeige, keine Suchstruktur.

### 6.3 Karten-Anatomie

- **Form-Gate sichtbar machen: JA.** Die WerkzeugZeile der Vorlagen erhält
  eine Mikro-Angabe der Ausgabe-Art als zweites Sub-Label-Element (Quelle:
  `ausgabeArt` des Schemas, NICHT neues Katalogfeld — §5):
  `druckfertig (PDF/DOCX)` · `Abschreibvorlage (von Hand)` ·
  `Entwurf — öffentliche Beurkundung nötig`. Begründung: das ist DIE
  kaufentscheidende Ehrlichkeits-Information (§8) und unterscheidet
  LexMetrik von WEKA (dort steht die Formfolge versteckt im Fliesstext).
  Drei feste Formulierungen, `text-xs text-ink-500`, vor dem Status-Badge.
- **Export-Format als eigenes Karten-Element: NEIN.** `output` ist auf
  Karten-Ebene redundant zur ausgabeArt-Zeile (druckfertig nennt PDF/DOCX
  bereits); xlsx-Sonderfälle zeigen es dort. Karte nicht überladen.
- Status-Badge (entwurf orange / geprüft Goldrand / In Vorbereitung)
  unverändert.

### 6.4 Detaillierungsgrade (Option)

Schalter «einfach ↔ ausführlich» gehört in den **Wizard-Kopf** (Segment-
Schalter über dem Stepper), NICHT in den Katalog — ein Typ bleibt eine
Karte. Technisch: zusätzliche `includeIf`-Bausteine mit Bedingung
`detailgrad === 'ausfuehrlich'`; Golden-Fälle je Stufe. Sinnvoll für:
**Arbeitsvertrag** (Kurzvertrag ↔ Kader-Vollversion: Überstunden/Pikett/
Spesen/Konkurrenzverbot — die WEKA-«Maximalversion» als Detailgrad) ·
**Mietvertrag** (Basis ↔ ausführlich: Nebenkosten-Detail, Rückgabe,
Untermiete-Klauseln) · künftig **Auftrag/Werkvertrag** (Basis ↔ B2B-voll) ·
**NDA** (einseitig-kurz ↔ gegenseitig mit Konventionalstrafe). NICHT
sinnvoll für Einseitige Willenserklärungen (zu klein) und beurkundungs-
pflichtige Entwürfe (Detailtiefe entscheidet der Notar).

### 6.5 Layout-Skizze (Sektion II nach Umbau)

```
II Verträge (5) ───────────────────────────────────────────
Zweiseitige Vereinbarungen – als Baustein-Dokument …

  ARBEIT & PERSONAL (2) ─────────────────────────
  │ ┌──────────────────────────────────────────┐
  │ │ Arbeitsvertrag                 [Entwurf] →│
  │ │ druckfertig (PDF/DOCX) · Arbeit           │
  │ └──────────────────────────────────────────┘
  │ [In Vorbereitung] Zusatzvereinbarungen
  │
  AUFTRAG & WERKVERTRAG (2) ─────────────────────
  │ ┌──────────────────────────────────────────┐
  │ │ Werkvertrag                    [Entwurf] →│
  │ │ druckfertig (PDF/DOCX) · OR 363 ff.       │
  │ └──────────────────────────────────────────┘
  │ …
  ▸ FAMILIE & PARTNERSCHAFT (4)        [eingeklappt ab >6]
  ▸ DARLEHEN, SICHERHEITEN & FORDERUNG (3)
```

Typografie/Token unverändert nach R11 (lc-overline, lc-card, num,
Messing-Akzente); keine neuen freien Farben oder Box-Stile. Kein Code in
diesem Auftrag — Umsetzung im Fahrplan Phase V1.

---

## 7 · Ausschlussliste (C/D bzw. ✗) mit Ein-Satz-Grund

**Rechner (rechtswissen.ch):** Unterhaltsrechner (Ermessen, Davids
Backlog-Entscheid) · Erwerbsausfall-Rechner (hypothetisches Einkommen =
Wertung; Backlog Schadenersatz) · Haushaltschaden-Rechner (Einschränkungs-%
= Wertung) · Überholweg-Rechner (Physik-Schätzformel ohne Norm-Berechnung) ·
Promille-Rechner (Widmark-Schätzung, Konsumenten-Tool) · Nettolohnrechner
(Treuhand-Domäne, Präzedenz AHV-Beiträge-Streichung) · Dreisatz-Rechner
(kein Rechtsregime, Präzedenz 13. Monatslohn) · Rechtswissen AI
(LLM-Chatbot) · KI-Briefgenerator (LLM-Generator) · Arbeitszeugnis-Prüfer
(menschliche Dienstleistung) · Einfache Briefvorlage (generischer Briefkopf
ohne Rechtsregime).

**Vorlagen:** Arbeitszeugnis-Varianten inkl. Zwischenzeugnis (Formulierung
= Wertung; bestätigt Teil-D-Vorschlag ✗) · Sozialplan (Verhandlungsergebnis)
· Kündigungsgespräch-Leitfaden (kein Dokument) · AGB-Branchensätze
(branchenindividuell, Haftungsrisiko) · SIA-Bauverträge GU/TU/Architekt
(individuell; SIA-Normen urheberrechtlich nicht übernehmbar) ·
Lehrvertrag (amtliche Formulare existieren) · Lex-Koller-Kaufvertrag
(hochspezialisiert) · Factoring/Lombard/Escrow (Banken-Domäne) ·
Transport-Verträge (Nischen-B2B) · Nachlassvertrag SchKG
(gerichtsverfahrens-individuell) · Konsumenten-Kleinbriefe Kirchenaustritt
etc. (tiefer Kanzleiwert; teils `kuendigung-vertrag`-Varianten).

---

## Pflegebedarf & Verfall (§11 Ziff. 4)

- Alle [VF]-Anker VOR Bau am Fedlex-Cache verifizieren (Pflicht-Schritt
  V0 je Phase im Fahrplan).
- Quell-Inventare sind Momentaufnahmen 12.6.2026; vor einer späteren
  Zweitnutzung Bestände neu ziehen (rechtswissen erweitert Tools laufend,
  «Beta»-Vermerke).
- Kein Verfallsregister-Eintrag nötig (keine datierten Parameter
  übernommen).

## Abnahme-Status (§11 Ziff. 5)

Erstrecherche + fachliche Einschätzung Claude (12.6.2026). Die
P1/P2/✗-Einstufungen sind ENTSCHEIDVORLAGE an David (analog ROADMAP
Teil D); die Form-Angaben sind bis zur Fedlex-Verifikation Arbeitshypothesen.
