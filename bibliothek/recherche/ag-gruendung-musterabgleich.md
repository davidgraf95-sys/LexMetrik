# AG-Gründung — Abgleich der Ablage-Muster gegen die gebauten Bausteine

**Erstellt:** 10.6.2026 (Auftrag David, Wissens-Verwertung «Legal Calc
Knowledge»: amtliche AG-Gründungs-Muster der lokalen Ablage gegen die
gebauten Gründungs-Bausteine abgleichen) · **Status:** ERSTRECHERCHE

**Quellen:** Lokale Kopien amtlicher Muster in
`bibliothek/quellen/legal-calc-knowledge/Gründung AG/` (gitignored;
39 Dateien, 30 eindeutige Payloads, 9 byte-identische Duplikatpaare —
md5-geprüft 10.6.2026). Herausgeber durchwegs **Handelsregisteramt Kanton
Zürich** (Copyright-Fusszeilen) bzw. **Notariate Kanton Zürich**
(Textvorlagen 3.1–3.5). Amtliche URLs: die `ag_*`-/`allg_*`-Dateinamen sind
identisch mit den Pfad-Suffixen der im
[Muster-MANIFEST](../muster/MANIFEST.md) belegten ZH-Basis
`https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/wirtschaft-arbeit/handelsregister/aktiengesellschaft/`
(bzw. `…/rechtsformuebergreifend/` für `allg_*`; Abruf der Web-Originale
6./7.6.2026, HTTP 200); 3.1/3.5 zusätzlich via notariate-zh.ch
(`/sites/default/files/2025-07/…`, MANIFEST) — 3.2/3.3/3.4 liegen im selben
notariate-zh.ch-Ordner, Einzel-URLs dort nicht eigens belegt. Inhaltliche
Erfassung der Suite: Dossier
[ag-gruendung-amtliche-vorlagen](ag-gruendung-amtliche-vorlagen.md)
(Erstsichtung 7.6.2026, Deltas D1–D24). Gebaute Bausteine:
`src/lib/vorlagen/gruendungAgDokumente.ts` (13 Schemas, 194 Bausteine) und
`src/lib/gruendungsunterlagen.ts` (Checklisten-Engine AG). Abnahme-Stand:
`ABNAHME-AG-BAUSTEINE.md` — **0 von 194 Bausteinen abgenommen** (alle
Checkboxen offen, geprüft 10.6.2026) → keine UNANTASTBAR-Konflikte; alle
Befunde sind ohne Abnahme-Bruch umsetzbar.

---

## TEIL 1 — Delta-Inventar (Ablage vs. erfasster/archivierter Bestand)

**Ergebnis: 0 NEU · 30 BEKANNT · 0 Versionsabweichung.** Jede eindeutige
Datei der Ablage ist byte- bzw. extraktgleich mit dem am 7.6.2026
gesichteten Originalmaterial: alle 15 DOCX-Text-Extrakte sind identisch mit
`.scratch/ag-knowledge/` (Erstsichtungs-Stand) und — soweit archiviert —
mit den committeten Web-Extrakten in `bibliothek/muster/` (Statuten
kurz/lang, Wahlannahme VR, Domizilannahme, VR-Protokoll, Urkunde bar 3.1,
Einpersonen 3.5: diff leer). Die Stand-Daten in den PDFs bestätigen das
Dossier-Inventar exakt.

| Ablage-Datei (eindeutige Payloads) | Herausgeber · Stand | Delta-Status | Archiv-Extrakt in `bibliothek/muster/` |
|---|---|---|---|
| 3.1 bar CHF (= `ag_vorlage_urkunde_gruendung_bar.docx`, byte-identisch) | Notariate ZH · 26.7.2024 | BEKANNT | `zh-hrega-ag-urkunde-gruendung-bar.txt` / `zh-ag-gruendung-bar-chf.txt` |
| 3.2 bar Fremdwährung | Notariate ZH · 26.7.2024 | BEKANNT | — |
| 3.3 qualifiziert (= `…urkunde_gruendung_qualifiziert.docx`) | Notariate ZH · 26.7.2024 | BEKANNT | — |
| 3.4 Gründungs-Nachtrag | Notariate ZH · undatiert | BEKANNT | — |
| 3.5 Einpersonen bar | Notariate ZH · undatiert | BEKANNT | `zh-ag-gruendung-1person-bar.txt` |
| Statuten kurz / lang (DOCX) | HRegA ZH · Suite 26.7.2024 | BEKANNT | `zh-ag-statuten-kurz/-lang.txt` |
| Wahlannahme VR · Domizilannahme · VR-Protokoll (DOCX) | HRegA ZH · Suite 26.7.2024 | BEKANNT | `zh-ag-wahlannahme-vr.txt` u. a. |
| Sacheinlagevertrag einfach/Geschäft · Gründungsbericht einfach/Geschäft (DOCX) | HRegA ZH · Suite 26.7.2024 | BEKANNT | — |
| `ag_anmeldung_neueintragung.docx` (Formular) | HRegA ZH · undatiert | BEKANNT | — |
| 6 Muster-PDFs `ag_muster_*` (ausgefüllte Beispiele «Brinkmann Lux AG») | HRegA ZH · PDF-Metadaten 12/2024 (Wahlannahme 30.7.2024) | BEKANNT | — |
| 3 Checklisten (Mindestinhalt Statuten · Errichtungsakt 44 HRegV · Belege 43 HRegV) | HRegA ZH · **11.12.2024** (im PDF) | BEKANNT | — |
| Merkblatt Belege Neueintragung | HRegA ZH · **11.12.2024** | BEKANNT | — |
| Merkblatt formelle Anforderungen HR-Belege | HRegA ZH · **7.1.2025** | BEKANNT | — |
| Merkblatt gesetzliche Pflichten VR | HRegA ZH · **3.12.2025** | BEKANNT | — |
| Merkblatt Vorsicht vor privaten Registern | HRegA ZH · **17.2.2026** | BEKANNT | — |
| Merkblatt KMU-Erklärung Opting-out | HRegA ZH · **11.12.2024** | BEKANNT | — (URL im MANIFEST: `div-zh-kmu-erklaerung-optingout`) |
| Lex-Koller-Erklärung (Formular) | HRegA ZH · **1.1.2025** (interner Name `allg_formular_lex_friedrich_erklaerung`) | BEKANNT | — |

Zähl-Notiz (NIEDRIG, kein Inhaltskonflikt): Das Dossier vom 7.6.2026 nennt
«27 eindeutige Dokumente», die Repo-Kopie hat 30 eindeutige Payloads —
andere Zählweise (vermutlich Vorlage+Muster-Paare), Inhalte identisch.

## TEIL 2 — Befunde (Muster vs. gebaute Bausteine)

Da keine neuen/abweichenden Muster vorliegen, ist dies ein adversarialer
Zweitabgleich der GEBAUTEN Bausteine (Stand 10.6.2026, alle
FAHRPLAN-Etappen GEBAUT) am Original — zusätzlich zu den im Dossier
erfassten und inzwischen umgesetzten Deltas D1–D24.

### B1 — MITTEL · Zweck-Erweiterungsklausel: falsche Muster-Behauptung

`AS02b_zweck_erweiterung` (`gruendungAgDokumente.ts` Z. 1067–1072;
identisch in `ABNAHME-AG-BAUSTEINE.md`, Baustein 4) behauptet
«ZH-/GL-Muster-Wortlaut». Tatsächlich führen ZH kurz UND lang, GL kurz/lang
und SG lang einen einheitlichen, deutlich umfassenderen amtlichen Wortlaut
(«Zweigniederlassungen **und Tochtergesellschaften im In- und Ausland** …
**alle Geschäfte tätigen, die direkt oder indirekt mit ihrem Zweck in
Zusammenhang stehen** … Grundeigentum erwerben, **belasten**, veräussern
**und verwalten** … **Garantien und Bürgschaften für Tochtergesellschaften
und Dritte**»; Muster: `ag_vorlage_statuten_kurz.docx` Zweck-Artikel;
Archiv `../muster/zh-ag-statuten-lang.txt` Z. 9, wortgleich GL/SG). Die
gebaute Fassung ist eine engere Haus-Kurzfassung (z. B. nur «Sicherheiten
für Verbindlichkeiten verbundener Gesellschaften»). Kein Rechtsfehler —
aber die Beleg-Begründung ist falsch und fliesst so in Davids
Wort-für-Wort-Abnahme. → Korrektur: Begründung auf «Haus-Kurzfassung
(offengelegt)» stellen ODER amtlichen Wortlaut übernehmen; Entscheid David.

### B2 — MITTEL · S4: 23 von 30 Payloads ohne committeten Text-Extrakt

Nur 7 Payloads der Suite liegen als Text-Extrakte in `bibliothek/muster/`
(MANIFEST). Die übrigen 23 (3.2/3.3/3.4, Anmeldung, SE-Verträge und
-Berichte als DOCX, 6 Muster-PDFs, 3 Checklisten, 5 Merkblätter,
Lex-Koller) existieren nur in der gitignorten `quellen/`-Ablage und in
`.scratch/ag-knowledge/` (nicht committet) — das tragende Dossier stützt
sich darauf. S4-Lehre: amtliche URLs sind nicht
wiederbeschaffungs-garantiert. → Hauptsession: Extrakte nach
`bibliothek/muster/` + MANIFEST-Zeilen.

### B3 — MITTEL · S6: Merkblatt-/Formular-Stände nicht im Verfallsregister

`register/parameter-verfall.md` führt für die Muster-Suiten nur «ZH
26.7.2024 · SG …2023 · GL undatiert · EHRA 1.4.2017». Die datierten Stände
11.12.2024 / 7.1.2025 / 1.1.2025 / 3.12.2025 / 17.2.2026 stehen nur als
Prosa im Dossier (TEIL 4 «Pflegebedarf») — S6 verlangt Registrierung im
selben Arbeitsgang. → Kandidatenliste unten, durch Hauptsession zu
registrieren.

### B4 — NIEDRIG · Errichtungsakt: Bankbescheinigung bei Banknennung

ZH 3.1/3.2 Ziff. IV nennen auch bei Banknennung in der Urkunde die
Bescheinigung («gemäss deren vorliegender schriftlicher Bescheinigung vom
{Datum}»). Die gebauten `AE07*_bank`-Zweige lassen die Bescheinigung ganz
weg (HR-Beleg entfällt zulässig, Art. 43 Abs. 1 lit. f HRegV — so auch die
Begründung), und die `belegeListe` der Urkundsperson-Bestätigung führt sie
dann nicht. Als ENTWURF für die Urkundsperson unschädlich; Abweichung vom
Notariatsmuster aber nicht als solche offengelegt.

### B5 — NIEDRIG · Errichtungsakt: Anmelde-Satz fehlt

ZH 3.1 Ziff. VIII schliesst mit «Die Gesellschaft ist zur Eintragung ins
Handelsregister anzumelden.» — fehlt in `AE14_gruendungserklaerung`
(nur «… als gegründet»). Deklaratorisch.

### B6 — NIEDRIG · Zeichnungsliste ohne Summenzeile

ZH 3.1/3.3 Ziff. III führen unter der Zeichnungsliste eine
«…-Aktien-total»-Summenzeile. `AE05_zeichnungsliste` hat keine; die
Deckung prüft das Gate rechnerisch (Art. 629 Abs. 2 Ziff. 1 OR). Kosmetik.

### B7 — NIEDRIG · Sacheinlagevertrag: nur EIN Aktien-Empfänger

Die ZH-Vertragsvorlagen verteilen die «als voll liberiert geltenden
Aktien» als Gegenleistung an MEHRERE benannte Empfänger (Aufzählung je
Person). `SV03_gegenleistung` gibt alle Aktien der einen Einleger-Person —
Modell-Einschränkung (eine Sacheinlage = ein Einleger), in der
SV03-Begründung nicht offengelegt. Zudem nennt der ZH-Parteien-Ingress
alle Gründer einzeln mit Personalien; Haus sammelt («vertreten durch die
Gründerinnen und Gründer» — dort offengelegt).

### B8 — NIEDRIG · Checkliste Neueintragung Ziff. 12 «Lex-Koller-Bewilligung»

Die Checklisten-Engine führt die Lex-Koller-ERKLÄRUNG (Ziff. 11), nicht
die mögliche Lex-Koller-BEWILLIGUNG (Ziff. 12, falls die Behörde nach
Verweisung eine verlangt). Statischer Hinweis würde genügen; kein
Pflicht-Beleg des Normalfalls.

## TEIL 3 — Negativbefunde (geprüft und deckungsgleich, S5)

- **Checkliste Mindestinhalt Statuten (11.12.2024)** vs. `STATUTEN_SCHEMA`:
  alle Pflichtpunkte gedeckt (Firma/Sitz · Zweck · Höhe+Währung Kapital ·
  Liberierung · Anzahl/Art/Nennwert · Mitteilungen · Inhaberaktien-Nachweis
  als Checklisten-Eintrag). Kategorien (Stimmrechts-/Vorzugsaktien) bewusst
  nicht abgebildet — eigenes Bau-Dossier
  [ag-gruendung-kapitalkategorien](ag-gruendung-kapitalkategorien.md).
  Checklisten-Schreibweise «YEN» — Code führt korrekt ISO **JPY**
  (Anhang 3 i. V. m. Art. 45a HRegV).
- **Checkliste Errichtungsakt (44 HRegV)** vs. `ERRICHTUNGSAKT_SCHEMA`:
  alle Blöcke vorhanden — Gründer-Personalien, drei Erklärungen,
  Zeichnung MIT Ausgabebetrag (= Nennwert plus Agio, D7 gebaut),
  bedingungslose Verpflichtung, die vier Feststellungen wortgleich
  Art. 629 Abs. 2 OR, Fremdwährungs-Kurs-Angabe, Urkundsperson-Bestätigung
  mit Einzel-Beleg-Nennung (Art. 631 OR), Beilagen-Logik.
- **3.2 Fremdwährung**: Pflicht-Kurs-Satz `AE07w_kurs` verbatim («per
  {Währung} 1.00 = CHF …», Devisenmittelkurs-Satz); Gates 100'000-Gegenwert
  (Art. 621 Abs. 2 OR) und 50'000-Gegenwert (Art. 632 Abs. 2 OR) gebaut.
- **3.5 Einpersonen / D1 Numerus**: Singular-Bausteine durchgängig
  (`*_singular`-Varianten; Haus-Fassung dritte Person statt «ich», als
  Abweichung in den Begründungen offengelegt).
- **3.3 qualifiziert**: Sacheinlage-Belegzeile inkl. Grundstücks-Weiche
  («sofort als Eigentümerin verfügen» / «bedingungsloser Anspruch auf
  Eintragung in das Grundbuch»), Genehmigungs-Satz, Gründungsbericht- und
  Prüfungsbestätigungs-Zeilen («vollständig und richtig»), besondere
  Vorteile («die in den Statuten umschriebenen…») — gebaut. Die
  ZH-Variante «Kombination Sacheinlagen/Sachübernahmen» ist bewusst nicht
  abgebildet: Tatbestand Sachübernahme per 1.1.2023 abgeschafft
  (Art. 627/628 aufgehoben; Dossier
  [ag-qualifizierte-gruendung](ag-qualifizierte-gruendung.md)); die
  «weitere Gegenleistung» deckt die Gutschrift-Mechanik (Art. 634 Abs. 4 OR).
- **Teilliberierung je Gründer (D6)**: ZH-Listenform und 634b-Satz («auf
  erstes Verlangen … sofort») verbatim gebaut (`AE07i_*`, `AE07c_*`).
- **Wahlannahme VR**: Kernsatz verbatim ZH-Vorlage; Muster-PDF
  (Brinkmann) bestätigt Anatomie. Wahlannahme Revisionsstelle als
  Haus-Analogon (D15, offengelegt). Annahme IN der Urkunde (D8) gebaut,
  Beilagen-Liste nimmt die Erklärung dann ehrlich heraus.
- **Domizilannahme**: Haus «Domizil gewähren» vs. ZH-AG-Vorlage «Sitz
  gewähren» — bereits im Dossier offengelegte Haus-Fassung (Art. 117
  Abs. 3 HRegV gedeckt).
- **VR-Protokoll**: D13-Mindestelemente (Datum, Beginn UND Ende,
  Anwesend/Abwesend, Vorsitz, Protokoll) gebaut; Wegfall des
  ZH-Einladungs-Feststellungssatzes als Haus-Abweichung offengelegt
  (Konstituierung = Vollversammlung). D14-Zeichnungsarten («ohne
  Zeichnungsberechtigung», «Kollektivprokura zu zweien», Funktion
  Direktor) gebaut — deckt das Muster-PDF. Dass das Muster «Ende der
  Sitzung» NACH den Unterschriften setzt, ist Layout, kein Inhalt.
- **Gründungsberichte einfach/Geschäft**: ZH-Struktur (Art und Zustand +
  «Bewertung … als angemessen»; Geschäft mit Übernahmebilanz, Aktiven/
  Passiven/Kaufpreis, Posten-Bericht) abgebildet; Verrechnungs- und
  Vorteils-Abschnitte als offengelegte Haus-Fassung (ZH-Vorlagen decken
  nur Sacheinlagen).
- **Sacheinlageverträge**: Klauseln Sacheinlage/Gegenstand (Inventarliste
  bzw. Übernahmebilanz als Bestandteil), Zeitpunkt (unwiderrufliche
  Verfügungsbefugnis), Zusicherung («frei von Rechten Dritter»),
  Rückwirkungsklausel (Geschäft), Nutzen und Gefahr, Aufhebung jeder
  Gewährleistung — verbatim; Grundstück → eigenes ENTWURF-Schema
  (Beurkundung, Art. 634 Abs. 2/3 OR). 
- **HR-Anmeldung**: Kern (Identifikation, Beleg-Verweis, Unterschriften
  VR) + Beilagen aus der Checklisten-Engine (eine Quelle, §5);
  D17-Spezifika (zwingend Deutsch, Ausweiskopien Art. 24a HRegV lose,
  Vollmacht-Kopie, Original-Grundsatz) im Disclaimer. Die reinen
  ZH-Formularfelder (Bestellungen CHF 50/80, Rechnungsadresse,
  Kontaktblock) sind bewusst nicht generiert — kantonales Formular,
  Preise kantonal (Dossier TEIL 4).
- **Stampa**: kein separater Beleg mehr seit 1.1.2021 — Feststellungs-
  Ziffer 4 der Urkunde trägt den Stampa-Inhalt; `STAMPA_HINWEIS` in der
  Engine. Deckungsgleich mit Checkliste/Merkblatt.
- **Opting-out**: dreigliedrige Urkunden-Feststellung = Merkblatt-Tripel
  (keine ordentliche Revisionspflicht · ≤ 10 Vollzeitstellen · Verzicht
  aller); KMU-Merkblatt bestätigt «bei Gründung … üblicherweise in die
  öffentliche Urkunde integriert». Der Ein-Satz-Wortlaut der
  Notariats-Bemerkung (D12) bleibt als offengelegte Abweichung
  (Haus-Fassung deckt Art. 62 Abs. 1 lit. c HRegV expliziter);
  Singular-Variante benennt den Verzichtsträger ausdrücklich.
- **Lex-Koller (1.1.2025)**: vier Erklärungen, Definitions-Fussnoten und
  Aussetzungs-Folge (Art. 18 Abs. 1/2 BewG) kantonsneutral gebaut; ZH
  «Bezirksräte» und GB-Staatsvertrags-Sonderfall (Abkommen 25.2.2019,
  SR 0.142.113.672) als offengelegte Kürzungen; Frage 4 bei Gründung
  «nicht anwendbar».
- **FINMA-Gate (D23)**: `finmaBegriffsTreffer()` (Wortprüfung Firma+Zweck)
  gebaut; **Übersetzungen (D24)** und **Info-Schicht VR-Pflichten/private
  Register (D20/D21)** in der Seite (`VorlageAgGruendung.tsx`).
- **Keine neuen Muster, keine neueren Versionen**: kein Dokument der
  Ablage ist jünger als der im Dossier erfasste Stand; kein erfasstes
  Dokument fehlt in der Ablage.

## Verfallsregister-Kandidaten (durch Hauptsession zu registrieren)

Bestehende Register-Zeile «Amtliche Muster-Suiten» deckt nur den
Suite-Stand 26.7.2024. Zusätzlich zu registrieren (Fundstelle je:
`bibliothek/quellen/legal-calc-knowledge/Gründung AG/` + dieses Dossier;
Prüfrhythmus wie Suite: bei OR-/HRegV-Cache-Aktualisierung):

| Parameter | Stand | Verbaut/erfasst in |
|---|---|---|
| ZH-Checklisten AG (Mindestinhalt Statuten · Errichtungsakt · Belege Neueintragung) | 11.12.2024 | Gates/Checklisten-Engine; Dossier amtliche-vorlagen |
| ZH-Merkblatt Belege Neueintragung AG | 11.12.2024 | D17/D23/D24; `gruendungsunterlagen.ts` |
| ZH-Merkblatt KMU-Erklärung Opting-out | 11.12.2024 | `AE11_opting_out`; Checkliste |
| ZH-Merkblatt formelle Anforderungen HR-Belege | 7.1.2025 | D13 (`VP01`/`VP04c`), D24 |
| ZH-Formular Lex-Koller-Erklärung | 1.1.2025 | `LEXKOLLER_SCHEMA` |
| ZH-Merkblatt gesetzliche Pflichten VR | 3.12.2025 | Info-Schicht D20 |
| ZH-Merkblatt private Register | 17.2.2026 | Info-Schicht D21 |

**Weitere Folgearbeiten Hauptsession** (hier nur Befund, Verbote der
Session): INDEX-Zeile für dieses Dossier (S7) · Text-Extrakte der 23
fehlenden Payloads nach `bibliothek/muster/` + MANIFEST (B2) ·
B1-Entscheid David (Zweck-Erweiterung) vor der Abnahme von Baustein
`AS02b_zweck_erweiterung`.
