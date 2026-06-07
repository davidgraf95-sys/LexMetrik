# ÜBERGABE an die nächste Session — AG-Maske perfektionieren (Auftrag David 7.6.2026)

**Davids Auftrag (wörtlich):** «mach alles von dem was du vorgeschlagen hast» —
der 15-Punkte-Perfektions-Katalog unten. **GmbH wartet ausdrücklich**
(FAHRPLAN-GMBH-GRUENDUNG.md erst NACH diesem Programm anfassen).

## Stand bei Übergabe (alles committet, ungepusht; Push/Deploy nur auf Davids Ja, §9)

- AG-Maske komplett gebaut: FAHRPLAN-AG-GRUENDUNG.md (alle Etappen ✓),
  Wizard 6 Schritte, Sammel-Download, klickbare Blocker (blockerDetails
  mit AgBereich → BEREICH_SCHRITT), Praxis-Runde (Karten-Layouts,
  Textareas, «als VR übernehmen», Datum-Default heute).
- Letzte Commits: `cf5ec52` (Punkte 12+13+14 ERLEDIGT: Golden-AG 84 Fälle
  geschrieben+verifiziert · logik-sweep.ts AG-Invarianten 3072 Komb. ·
  Mehrseiten-PDF via Swift/PDFKit geprüft, sauber) · davor `4f00b48`,
  `6bf7cf9`, `eff1b11`, `6c18fcd` (Bug-Check-Fixrunden).
- Kern-Dateien: `src/lib/vorlagen/gruendungAgDokumente.ts` (Engine, ~2300 Z.)
  · `src/pages/VorlageAgGruendung.tsx` (Wizard-Seite, ~1000 Z.) ·
  `src/tests/gruendungAgDokumente.test.ts` (47 Tests) ·
  `src/tests/konventionen.test.ts` (4 AG-Maximal-Fälle).
- Wissens-Dossiers: `bibliothek/recherche/ag-gruendung-amtliche-vorlagen.md`
  (D1–D24) · `ag-qualifizierte-gruendung.md` (Deep-Research 14 Findings) ·
  ZH-Originale: `.scratch/ag-knowledge/` (AG) und `.scratch/gmbh-knowledge/`
  (GmbH, für später). PDF-Muster-Generator: `/tmp/ag-pdf-muster.ts`
  (ggf. neu erzeugen), Swift-Rasterizer-Muster im Commit-Log von cf5ec52.

## VERBLEIBENDES PROGRAMM (in dieser Reihenfolge; je Block: Tore + Commit; nach Engine-Blöcken Bug-Check §9 mit 2 Agents)

### Block B1 — Punkte 6 + 7 (HIER WEITERMACHEN, war gerade begonnen)
6. **ZIP-Sammeldownload:** package.json hat KEINE Zip-Lib (geprüft:
   jspdf/docx/react…). Entscheid: `fflate` als Dependency aufnehmen
   (klein, tree-shakeable; `npm i fflate`). Im Schluss-Schritt von
   VorlageAgGruendung.tsx den Sammel-Download umbauen: alle
   `mappe.dokumente` via `vorlagenPdfDokument` (NICHT …Erzeugen — gibt
   jsPDF-Doc zurück, siehe `.scratch/pdf-beispiele.ts`) zu ArrayBuffers,
   mit fflate `zipSync` zu EINEM Download `gruendung-<firma-slug>.zip`
   (Blob + a[download]). Banner je ausgabeArt wie bisher (BANNER_ENTWURF
   der Seite / BANNER_MAPPE_FERTIG). Einzel-Downloads (MappenAnsicht)
   bleiben.
7. **Lokale Zwischenspeicherung (localStorage):** Schlüssel
   `lexmetrik:ag-gruendung:v1`. Einen useEffect, der ALLE Eingabe-States
   (inkl. weichen + Arrays gruender/vr/vertretungen/sacheinlagen/
   verrechnungen/vorteile + naechsterKey-Zähler) als versioniertes JSON
   speichert; Hydration beim Mount mit **Normalisieren-Guards je
   Array-Feld** (Wizard-PFLICHT-Konvention! je Zeile fehlende Felder mit
   Defaults auffüllen, falsche Typen verwerfen — Memory-Lektion).
   `zuruecksetzen()` (derzeit `window.location.reload()`) muss zusätzlich
   den Storage-Key löschen. Fussnote der Seite auf «lokale
   Zwischenspeicherung» ändern. datum-Default heute nur setzen, wenn
   kein gespeicherter Wert.

### Block D — Punkt 15
15. **Abnahme-Dossier-Generator:** In der Engine eine Registry
    exportieren `export const AG_ALLE_SCHEMAS: VorlageSchema[]` (alle
    9 Schemas: Statuten, Errichtungsakt, Wahlannahme, Wahlannahme-RS,
    Domizilannahme, VR-Protokoll, Anmeldung, Sacheinlagevertrag [+
    Entwurf-Variante], Lex-Koller, Gründungsbericht, Nachtrag). Skript
    `scripts/abnahme-ag.ts` generiert `ABNAHME-AG-BAUSTEINE.md` im
    Repo-Root: je Schema-Abschnitt, je Baustein eine Tabelle/Sektion mit
    id · Wortlaut (text) · norm · begruendung · hinweis · includeIf-
    Bedingung lesbar. Zweck: Davids Wort-für-Wort-Abnahme als EIN
    Lese-Dokument; abgehakte Bausteine später `verified:true`.

### Block A — Punkte 1–5 (Engine; HIER die Bug-Checks fahren)
1. **Stufe-2-Kombinationen freischalten** (heute ehrliche Blocker):
   a) qualifiziert + Fremdwährung (Sach-/Verrechnungs-/Vorteils-Beträge
   in Kapitalwährung; Gegenwert-Gates 621 II/632 II auf Summe; Kurs-Satz-
   Basis = geleistete Einlagen — siehe HOCH-2-Lektion in eff1b11) ·
   b) Agio + Teilliberierung (Agio ist VOLL zu leisten, nur Nennwert-Teil
   teilliberierbar: einbezahlt = Σ anzahl×(nennwert×p% + agioAnteil);
   ZH-Texte anpassen, deklarieren) · c) qualifiziert + Agio (Wert-Gate:
   wert = aktien×AUSGABE+gutschrift) · d) gemischte Teilliberierung
   (Bar-Teil teilliberiert, Sach-Aktien voll — Urkunden-Text trennt).
   Vorher Mini-Recherche am OR-Cache (632/634/624) + Begründungen.
2. **Inhaberaktien:** Blocker ersetzen durch Weiche (Statuten-Art
   «Inhaberaktien», 622 Abs. 1bis-Voraussetzung als Pflicht-Erklärung
   [Bucheffekten + Verwahrungsstelle], Checklisten-Eintrag
   `inhaberaktien-nachweis` existiert; Urkunden-/Statuten-Texte
   «Inhaberaktien» statt «Namenaktien», Vinkulierung dann sperren).
3. **Statuten-Zusatzklauseln** (Weichen + Klauseltexte; Quellen:
   bibliothek/recherche/ag-gruendung.md Tabelle 1.2 + 9c-Dossier
   kapitalerhoehung-wortlaute.md [653-Kataloge verbatim]):
   Schiedsklausel 697n · Stimmrechtsaktien 693 (Gates: nur voll
   liberierte NA, 10×-Schranke) · Vorzugsaktien 654 · Partizipations-
   scheine 656a (gleiche Währung!) · Kapitalband 653s ff. + bedingtes
   Kapital 653 ff. · Stichentscheid-GV-Abwahl (Lang-Stufe) ·
   «Geschäftsjahr erstmals am». Jede Klausel: Cache-Verifikation +
   Konventions-Test-Fall.
4. **Unterschriftenbogen** als Dokument (ZH «Unterschriftenblatt»;
   Original ggf. in /tmp/muster oder via Dossier — sonst Haus-Fassung
   offenlegen: Tabelle Person/Funktion/Zeichnungsart/Unterschrift,
   Hinweis amtliche Beglaubigung Art. 21 HRegV).
5. **Kantons-Quervergleich** (Agent!): /tmp/muster enthält sg-ag-*/
   gl-ag-*-Statuten (prüfen; AG-Urkunden SG?) — Agent vergleicht die
   Haus-Bausteine gegen SG/GL und listet Abweichungen → offenlegen oder
   kantonsneutral schärfen. KEINE UZH-/Archiv-Quellen (Daueranweisung).

### Block B2 — Punkte 8–11
8. **Vorschau-Wahl:** Wizard-Vorschau (rechte Spalte) bekommt ein
   kleines Dokument-Dropdown (State aktivesVorschauDok), Default
   Statuten.
9. **«Mit Musterdaten füllen»**-Knopf (Schritt Konstellation):
   setzt einen kompletten Demo-Datensatz (alle States; Werte aus dem
   Golden-Fall gemischt-qualifiziert nehmen).
10. **Feldmarkierung:** blockerDetails um optionales `feld?: string`
    erweitern (stabile Feld-IDs) ODER pragmatisch: pro Schritt-Sektion
    rote Markierung, wenn ihr Bereich Blocker hat (CSS-Klasse an Field).
    Aufwand klein halten; §3 beachten (Zuordnung aus Engine).
11. **Notariatstarife je Kanton:** NUR amtliche Erlasse via
    OrdoLex/LexWork-APIs (Daueranweisung Davids! `…/app/de/texts_of_law/
    <nr>` + Metadaten abrogated/future_versions prüfen); BE BSG 169.81
    Anhang 4 bekannt. Agent-Recherche für 4–6 grosse Kantone (ZH/BE/AG/
    LU/SG/BS), Dossier in bibliothek/ (§11) + Verfallsregister, dann
    Kosten-Sektion der Maske kantonsabhängig (ehrliche Lücken: «nicht
    amtlich erhebbar»).

### Abschluss
- Sammel-Bug-Check §9 (2 Agents: Kombinatorik [logik-sweep erweitern um
  neue Weichen!] + Wortlaut gegen Originale/Cache) über die Blöcke A+B.
- Golden-Stand NEU schreiben (deklarierte fachliche Änderungen), Sweep
  + Zitate-Prüfer um neue Felder/Zitate erweitern.
- FAHRPLAN-AG-GRUENDUNG.md + memory nachführen. DANACH GmbH (Task #18).

## Arbeitsregeln (Lektionen dieser Session — VERBINDLICH)
- **Tore je Commit:** `npx tsc -b` · `npm test` · `npm run lint` (voll!)
  · Build · `golden-outputs vergleich` (Exit NACKT prüfen, NIE durch
  Pipe!) · `norm-zitate-pruefen` · `logik-sweep` bei Engine-Änderungen ·
  `smoke-render` bei Seiten-Änderungen.
- **Parallel-Session aktiv im Repo:** strikt NUR eigene Dateien stagen;
  NIE git stash bei fremdem WIP; fremde transiente Brüche (tsc/Test/
  Golden aus fremden Dateien) aushalten und im Commit-Text vermerken;
  kein --amend.
- **Fragment-Felder MÜSSEN auf `Satz`/`Zeile` enden** (Engine rendert
  leere sonst als «________») — zweimal reingefallen.
- Gegenwert-/Summen-Rechnungen auf GELEISTETEN Einlagen (Agio!).
- Organ-Erklärungen in der Gründerurkunde nur durch Gründer (Gate).
- Neue Engine-Hinweise/Varianten in die Konventions-Maximal-Fälle.
- Wortlaut-Massstab: OR-Cache /tmp/or.html (Stand 1.1.2026; fehlt er:
  scripts/fedlex-cache.sh), ZH-Originale = Usanz; Abweichungen IMMER in
  der begruendung offenlegen (§7). `verified:false` bleibt bis Davids
  Abnahme.
- Erledigtes hier abhaken; diese Datei nach Abschluss des Programms
  löschen (Inhalt dann in FAHRPLAN/STRUKTUR gespiegelt).
