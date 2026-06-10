# FAHRPLAN STRUKTUR-UMBAU (Auftrag David 10.6.2026 abends)

> **STAND: S-1–S-6 UMGESETZT** (gleiche Session, 8 Commits ab f7bbf07;
> Reihenfolge S-1 → S-3 → S-2 → S-6 → S-5a → S-5b/c → S-4). Alle Etappen
> golden-gegated (87/87 byte-gleich), Suite/Lint/Build/SSR-Smoke grün.
> §9-Bug-Check (3 Lupen) + Push/Deploy: siehe Schluss-Abschnitt;
> Davids Freigabe liegt vor («anschliessend bug check push und deploy»).

Auftrag wörtlich (Chat): Vorlagen-Taxonomie neu (Behördeneingaben · Verträge ·
Gesellschaftsrecht · Einseitige Willenserklärungen; Klagen allgemein/besonders;
Kachel Gesuche) · Startseiten-Kacheln ganz klickbar · Zuständigkeit vierteilig
(Zivilprozess · Vollstreckung · Strafverfahren · Verwaltungsverfahren) mit
direktem Sprung zu Vorlagen inkl. vorbefüllter Behörden-Adresse · Fristen
prozessual/materiell · Fristenspiegel auflösen (Mehrfach-Fristen im jeweils
spezifischen Rechner) · ganz simpler allgemeiner Fristenrechner mit
Ferien-Wahl, Vorauswahl-Rechner darunter · Gebühren prozessual/materiell.
«Sofern ich etwas vergessen habe gerne ergänzen» + «wenn du den Handlungsplan
erstellt hast setz ihn um».

Rahmen: §1/§3 unangetastet (reine IA-/Darstellungs-Schicht; Engines rechnen
unverändert), §6-Golden-Protokoll je Etappe, §9 Push/Deploy nur auf Davids Ja.

---

## S-1 · Startseite: ganze Kachel klickbar

Befund: `KategorieEinstieg` (Katalog.tsx) macht nur die Titelzeile zum
`<button>`; Rest der Kachel ist tot. `WerkzeugZeile`/`RechnerKarte` sind
bereits voll verlinkt (stretched Link).

- KategorieEinstieg: Container `relative`, gestreckter Klickbereich
  `absolute inset-0` (Muster RechnerKarte:40), Direktlinks darüber
  (`relative` + z-Index). A11y: aria-label «Kategorie N öffnen».
- Durchsicht aller übrigen Kachel-Komponenten (FristenHauptKarte,
  TrefferZeile, KategorieEinstieg) auf denselben Befund.

## S-2 · Vorlagen-Taxonomie (5 Gruppen, Klagen-Register)

`VorlageArt` neu zugeschnitten; VORLAGE_SEKTIONEN ersetzt:

1. **Behördeneingaben** (`eingabe`) — mit drei Unterrubriken über neues Feld
   `eingabeRubrik` an der VorlageCard:
   - `klage_allgemein`: Schlichtungsgesuch · Klage vereinfachtes Verfahren ·
     **NEU geplant: Klage ordentliches Verfahren**
   - `klage_besonders`: nach Klage-Gebiet (`klageGebiet`): Familienrecht ·
     Vertrag · Haftpflichtrecht · Personen-/Erb-/Sachenrecht ·
     Zwangsvollstreckung (Aberkennungsklage, Kollokation …) · Geistiges
     Eigentum · Strafverfahren (Adhäsion). Bestehende geplante Karten werden
     einsortiert; fehlende Gebiete erscheinen erst, wenn Karten existieren.
   - `gesuch_sonstige` (Kachel «Gesuche & sonstige Eingaben»): Arrestgesuch,
     Rechtsöffnungsbegehren, Einsprache, Beschwerde, Rekurs, SchKG-Beschwerde,
     Strafanzeige, Strafantrag, Akteneinsichtsgesuch, Entschädigungsbegehren,
     Rechtsvorschlag.
2. **Verträge** (`vertrag`) — Liste der einzelnen Verträge (je Karte ein
   Vertrag; Vereinbarungen wie Trennungs-/Aufhebungsvereinbarung hier).
3. **Einseitige Willenserklärungen** (`erklaerung`, vorher `korrespondenz`):
   Kündigungen (alle), Vertrag kündigen, Mahnung, Schuldanerkennung,
   **Vollmacht (verschoben aus «Vorsorge»)**, DSG-Begehren.
4. **Gesellschaftsrecht** (`gesellschaft`): Gründungen, Kapitalerhöhung,
   Statuten, Beschlüsse.
5. **Vorsorge & Nachlass** (`vorsorge`) — ERGÄNZT (Davids «gerne ergänzen»):
   Testament, Erbvertrag, Erbverzicht, Vorsorgeauftrag, Patientenverfügung.
   Begründung: dogmatisch wären Testament/Vorsorgeauftrag einseitige
   Willenserklärungen, der Praxis-Block «Vorsorge & Nachlass» ist aber der
   gebräuchliche Einstieg. **Zuordnung = fachliche Aussage, Abnahme David.**

Kategorie-Ansicht «Vorlagen» erhält ein eigenes Register (Muster
FristenRegister): 5 Gruppen-Kacheln, Behördeneingaben dreigliedrig.
Neue lib `vorlagenKategorie.ts` + Vollständigkeits-Test (jede verfügbare
Vorlagen-Karte genau einer Gruppe/Rubrik zugeordnet).

## S-3 · Zuständigkeit: vier eigene Felder

Heute EINE Karte `zustaendigkeit` (Rechtsweg-Wahl im Rechner, Hash #schkg/
#straf). Neu vier Karten in der Kategorie-Ansicht (übersteuert für die
Zuständigkeit die Katalog-Konsolidierung «ein Einstieg» vom 7.6. — neuer
Auftrag geht vor):

- `zustaendigkeit` → Titel «Zuständigkeit Zivilprozess» (Route unverändert)
- `schkg-zustaendigkeit` → «Zuständigkeit Vollstreckung (SchKG)»
  (`/rechner/zustaendigkeit#schkg`, entwurf)
- `straf-zustaendigkeit` → «Zuständigkeit Strafverfahren»
  (`/rechner/zustaendigkeit#straf`, entwurf)
- `verwaltung-zustaendigkeit` → «Zuständigkeit Verwaltungsverfahren»
  (**geplant** — Engine existiert nicht; ehrlich «In Vorbereitung», keine
  Fake-Weiche. Recherche-Grundlage: verwaltung-steuer-sozial.md; eigener
  Bau-Schritt nach Davids Priorisierung.)

Feste Reihenfolge Zivilprozess · Vollstreckung · Strafverfahren ·
Verwaltungsverfahren in der Kategorie-Ansicht (Register-Liste statt
Alltag/Weitere-Automatik). Zähler-Tests deklariert nachziehen.

## S-4 · Zuständigkeit → Vorlagen-Sprung mit Adresse

Nach ermitteltem Ergebnis zeigt jeder Rechtsweg eine Sektion «Eingabe
erstellen»: passende Vorlagen-Links, vorbefüllt mit der ermittelten Stelle.

- **Mechanik (§5-treu):** nie Roh-Adressen in der URL, sondern Schlüssel
  (Kanton, ggf. Gemeinde, Stellen-Typ); die Vorlage löst die Adresse über
  dieselbe Datenschicht auf (behoerdeFuer / Amts-Auflösung).
- **Zivil:** Schlichtungsgesuch (sgPrefill + NEU Kanton/Gemeinde →
  konkrete Schlichtungsstelle aus data/schlichtungsstellen) · Klage
  vereinfacht (kvPrefill, BS). Ordentliche Klage: erst Karte (geplant).
- **SchKG/Straf:** Ziel-Vorlagen (Betreibungsbegehren, Strafanzeige) sind
  geplant → Sektion zeigt sie ehrlich als «in Vorbereitung»; Amts-/STA-
  Adresse aus dem Ergebnis wird angezeigt (heute schon im Fahrplan).
- Erweiterung der Vorlagen-Seite(n): Prefill-Parameter lesen, Adressat-
  Baustein vorbefüllen, manueller Override bleibt.

## S-5 · Fristen-Umbau

**a) Simpler allgemeiner Fristenrechner (oberster Einstieg im Tagerechner):**
Drei Eingaben: Datum · Frist (Dauer+Einheit) · Ferien-Wahl:
- «Keine» → berechneAllgemeineFrist (Art. 77/78 OR)
- «Gerichtsferien (ZPO)» → berechneFrist mit offengelegten Defaults
  (ordentliches Verfahren, gesetzliche Frist; Annahmen-Zeilen sichtbar)
- «Betreibungsferien (SchKG)» → berechneSchkgFrist (Betreibungsferien)
- Hinweiszeile «sonstige»: StPO kennt keine Gerichtsferien (Art. 89 II);
  VwVG-Stillstand (Art. 22a) noch nicht abgebildet (ehrlich).
Reine Kompositions-Schicht — keine neue Engine (§3). Darunter erscheinen
die Vorauswahl-Einstiege: Preset-Suche (presetIndex) + die bisherigen
Voll-Tabs (Allgemein mit Rückwärts/Mechanik/Fach-Presets · ZPO · SchKG).

**b) Kategorie-Ansicht Fristen — prozessual/materiell:**
fristenKategorie.ts neu: Haupteinstieg = Tagerechner (simpel). Dann
- «Prozessuale Fristen»: zpo-fristen · schkg-fristen (+ Hinweis StPO/VwVG)
- «Materielle Fristen»: verjaehrung · gewaehrleistung · erbrecht-fristen ·
  kuendigung-sperrfristen (336c) · mietrecht
WARUM-Sätze bleiben. Klassifikation = fachliche Aussage, Abnahme David.

**c) Fristenspiegel auflösen:**
Die 6 Ereignis-Orchestrierer (lib/fristenspiegel/, samt Tests) BLEIBEN als
Logik bestehen (§5: rechnen nichts selbst); aufgelöst wird der eigene
Einstieg. Ereignisse wandern als «Ereignis»-Ansicht in die spezifischen
Rechner (geteilte EreignisFristenTabelle-Komponente + icsSammel):
- Zivilentscheid + Klagebewilligung → ZPO-Fristen-Seite
- Zahlungsbefehl → SchKG-Fristen-Seite
- Erbgang → Erbrecht-Fristen-Seite
- AG-Kündigung (336b) → Kündigungs-/Sperrfristen-Seite (statt Brücken-Link)
- Vermieterkündigung → Mietrecht zeigt Anfechtung/Erstreckung bereits
  selbst → Brücken-Link entfällt ersatzlos.
Route `/rechner/fristenspiegel` wird zum Redirect (ev=… → Ziel-Rechner mit
übersetzten Parametern; alte .ics-/Teilen-Links dürfen nicht ins Leere
laufen, §8). Karte/Registry/praxisRang/haeufigGebraucht/fristenKategorie/
Goldliste deklariert nachgezogen; FristenspiegelForm + Seite entfernt.

## S-6 · Gebühren & Beträge — prozessual/materiell

Neue lib `gebuehrenKategorie.ts` (+ Vollständigkeits-Test), Kategorie-
Ansicht zweigliedrig:
- «Prozess- & Verfahrenskosten»: streitwert, prozesskosten, kostenvorschuss,
  parteientschaedigung-sicherheit, betreibungskosten, existenzminimum,
  bundesgerichtsgebuehren …
- «Materielle Beträge & Quoten»: verzugszins, schadenszins, lohnfortzahlung,
  ferienanspruch/-kuerzung, 13. Monatslohn, Überstunden, mietzinsanpassung,
  erbteilung, erb-ausgleichung, gueterrecht-vorschlag, vorsorgeausgleich,
  liberierungsgrad, kapitalverlust/ueberschuldung, AHV …
Werkzeug-Karten (teuerungsrechner, iprg …) bleiben Kategorie IV bzw. werden
als «Hilfsrechner»-Zeile geführt. Klassifikation Fall für Fall = fachliche
Aussage, Abnahme David.

---

## Reihenfolge & Tore

S-1 → S-3 → S-2 → S-6 → S-5 → S-4 (Risiko aufsteigend; S-5c am breitesten).
Je Etappe: `npx tsc -b` · `npm test` · `npm run lint` (volle Ausgabe) ·
`npm run build` · `npm run golden:vergleich` (byte-gleich; Abweichungen nur
deklariert) · betroffene Invarianten-Tests nachgezogen als deklarierte
Änderung mit Begründung. Abschluss: §9-Bug-Check, STRUKTUR/HANDLUNGSPLAN
spiegeln. Push/Deploy nur auf Davids frisches Ja.

## Offen für David (Abnahme)

- Gruppen-Zuordnungen S-2 (insb. Vorsorge & Nachlass als 5. Gruppe;
  Vollmacht zu Erklärungen; Erbvertrag bei Vorsorge trotz Vertragsnatur)
- prozessual/materiell-Klassifikationen S-5b und S-6
- Verwaltungs-Zuständigkeit: nur Platzhalter-Karte — Bau-Priorität?
- Fristenspiegel-Auflösung: Bestätigung, dass der Tabellen-Einstieg ersatzlos
  entfällt (Ereignisse leben in den Fach-Rechnern weiter)
