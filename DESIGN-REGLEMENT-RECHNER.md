# Design-Reglement Rechner — verbindlicher Aufbau jeder Engine-UI

Stand: 11.6.2026 (Auftrag David 10.6.2026 spätnachts: «Regeln für den
Designaufbau von Engines aufstellen, sodass es eine übersichtliche und
einheitliche Struktur hat und die Reihenfolge der Webseite von oben nach
unten Sinn ergibt»). Geltungsbereich: alle Rechner-Seiten und ihre
Formulare (`src/pages/Rechner*.tsx`, `src/components/forms/*`).
Vorlagen-Wizards folgen ihrem eigenen Muster (Stepper/Dokumentmappe) und
sind hier nur dort erfasst, wo sie Rechner-Bausteine wiederverwenden.

Leitidee (Design-Haltung): **Das Verdikt zuerst, die Herleitung auf
Abruf, die Pflichten sichtbar.** Eine Anwältin, die den Rechner zum
zehnten Mal nutzt, findet jeden Baustein an derselben Stelle; wer ihn
zum ersten Mal nutzt, liest die Seite von oben nach unten als Fall:
Worum geht es → Was gebe ich ein → Was gilt → Warum gilt es → Was
nehme ich mit (PDF/Termin/Link).

## R1 · Seiten-Skelett (Reihenfolge fix)

```
1. RechnerKopf            (h1, Kategorie, Norm-Chips — immer)
2. TagerechnerRueckverweis (nur nach R2)
3. Werkzeug-Karte          (bg-surface-raised rounded-2xl border p-6 sm:p-8)
   └── genau EIN Formular (bzw. Tab-Weiche über Teil-Formulare)
4. EreignisFristenSektion  (nur nach R9)
5. Themen-Einstieg         (Vorlagen-Direktlinks, nur nach R10)
```

Keine weiteren freien Blöcke auf Seitenebene. Seiten-Sonderfälle:
Tagerechner (Schnellrechner + Preset-Suche + Regime-Tabs, FE-1/FE-2)
und Zuständigkeit (Rechtsweg-Tabs mit Kopf-Override, S-3) sind
disponierte Ausnahmen — innerhalb ihrer Teil-Formulare gilt R3 ff.
unverändert.

## R2 · Rückverweis-Regel

Den `TagerechnerRueckverweis` tragen genau die **materiellen
Fristen-Spezialrechner**, deren einfache Fälle (Datum + feste Länge,
kein Regime) der Tagerechner abdeckt: Kündigung, Erb-Fristen,
Mietrecht, Verjährung, Gewährleistung (FE-4-Entscheid). Verfahrens-
Regime-Rechner (ZPO, SchKG) tragen ihn NICHT — ihre Fälle sind nie
regime-frei, und sie sind selbst als Tab im Tagerechner erreichbar.
Beträge-/Zuständigkeits-Rechner tragen ihn nicht.

## R3 · Formular-Skelett (Reihenfolge fix)

```
1. PflichtDisclaimer       (kurz + text, R7 — immer zuoberst)
2. Anwendungsfall/Preset   (SelectionGrid · Tabs · Vorlage-Dropdown — falls vorhanden)
3. Eingabe-Felder          (grid sm:grid-cols-2 gap-4, Field-Wrapper)
4. Optionale Funktionen    (EIN Akkordeon «Optionale Funktionen (…)» — falls vorhanden)
5. FehlerBox               (R8 — einzige Fehlerdarstellung)
6. Ergebnisblock           (R4 — nur wenn ein Ergebnis vorliegt)
```

Beispiel-Chips (`BeispielChips`) stehen, wo vorhanden, zwischen 2 und 3.
Das Aktenzeichen ist KEIN Eingabefeld des Falls, sondern Teil der
Mitnahme — es steht im Ergebnisblock (R4 Ziff. 5), nicht bei den
Eingaben.

## R4 · Ergebnisblock-Skelett (Reihenfolge fix)

Der Ergebnisblock hat überall denselben Rahmen und dieselbe innere
Reihenfolge — vom Verdikt zur Mitnahme:

```
<ErgebnisBlock>            (geteilter Rahmen: id, lc-reveal, aria-live,
                            ErgebnisSprung, LiveHeader — §10-Baustein)
  1. EckdatenKacheln        (max. 3 wichtigste Werte; die Kachel des
                            MASSGEBLICHEN Werts — i. d. R. Fristende bzw.
                            Hauptbetrag — trägt die Messing-Oberkante,
                            EckdatenKachel akzent)
  2. ErgebnisAnzeige        (Status-Verdikt → Vorbehalte → Rechenweg →
                            Annahmen → Normverweise → Volltext-Disclaimer)
  3. Visualisierung         (FristenKalender · Timeline — falls vorhanden)
  4. BegruendungAbsatz      (zitierfähiger Fliesstext, R6)
  5. AktenzeichenFeld       (Mandats-Referenz für PDF/ICS)
  6. Export-Zeile           (R5)
  7. Quellen-Mikrozeile     (text-micro, nur wo eine amtliche Datenquelle
                            genannt werden muss, z. B. BFS/LIK)
</ErgebnisBlock>
```

Begründung der Reihenfolge: Eckdaten beantworten die Frage («wann/wie
viel»), die ErgebnisAnzeige trägt das rechtliche Verdikt samt
Vorbehalten — beides VOR jeder abgeleiteten Ansicht (Kalender,
Timeline). Die Mitnahme (Aktenzeichen → Exporte) schliesst den Block:
erst referenzieren, dann exportieren.

`ErgebnisBlock`-ids: Standard `lc-ergebnis`; Formulare, die gemeinsam
auf einer Seite gerendert werden können (Tagerechner-Teilformulare,
Kombinierte Ansicht), tragen eindeutige Suffixe (`lc-ergebnis-zpo`, …).

## R5 · Export-Zeile

Reihenfolge fix: **PDF → ICS → Teilen** (vom Dokument über den Termin
zum Link), als eine Zeile `flex flex-wrap items-center gap-3`. Es gibt
keine Exporte ausserhalb dieser Zeile (Ausnahme: ICS je Einzelfrist in
Fristen-Tabellen wie `EreignisFristenSektion`/`FristenKalender`).
Jeder Rechner mit PDF-Export hat ein `AktenzeichenFeld` (R4 Ziff. 5).

## R6 · Wiedergabe der Rechtsinformation (Hierarchie fix)

1. **Verdikt** — Status-Badge + Hauptsatz (ErgebnisAnzeige-Kopf). Der
   Hauptsatz ist ein vollständiger deutscher Satz aus der Engine.
2. **Vorbehalte/Warnungen** — direkt unter dem Verdikt; bei Status
   ≠ ok standardmässig aufgeklappt (A6). Warnungen sind nie weiter vom
   Verdikt entfernt als eine Bildschirmhöhe.
3. **Rechenweg** — einklappbar, Schritt = Beschreibung + Zwischen-
   ergebnis + Normen des Schritts. Vollständig, nie gekürzt.
4. **Annahmen** — einklappbar; jede methodische Annahme der Engine
   erscheint hier (§8: nichts wegglätten).
5. **Normverweise** — ausschliesslich als `NormLink`-Chips (Fedlex),
   nie als blosser Text; Rechtsprechung über `RechtsprechungAnker/-Text`
   mit Verifikations-Vorbehalt.
6. **BegruendungAbsatz** — EIN zitierfähiger Fliesstext-Absatz aus
   `lib/begruendung.ts` für Aktennotiz/Rechtsschrift, nach der
   Visualisierung.

Behörden-Auflösungen (Zuständigkeit, Schlichtung): jede aufgelöste
Stelle trägt einen amtlichen Link; KEINE Quelle-/Status-Fusszeilen in
Auflösungs-UIs (Anweisung David 10.6.2026).

## R7 · Disclaimer-Zweistufigkeit

Jedes Formular beginnt mit `PflichtDisclaimer` und übergibt BEIDE
Stufen: `kurz` (ein Satz, rechtsgebietsspezifisch: was wird gerechnet,
was bleibt zu prüfen) und `text` (Volltext). Derselbe Volltext geht in
die PDF-Konfiguration. Der domänenneutrale Standardtext der
ErgebnisAnzeige bleibt deren Fussbereich (kein Cross-Domain-Bleed).

## R8 · Fehleranzeige

Eingabe-/Berechnungsfehler erscheinen ausschliesslich über `FehlerBox`
(role=alert), zwischen Eingaben und Ergebnisblock. Keine ad-hoc
`lc-notice-danger`-Absätze für Eingabefehler. (Fachliche Hard-Stops
der Engine — Status `nichtig`/`unzulaessig` — sind KEINE Fehler: sie
laufen als Verdikt durch die ErgebnisAnzeige.)

## R9 · Ereignis-Fristen-Regel

Die `EreignisFristenSektion` (ein Anlass → mehrere Fristen) steht auf
der Seite des Rechners, der das auslösende Ereignis berechnet
(S-5c-Verteilung): ZPO (Zivilentscheid, Klagebewilligung), SchKG
(Zahlungsbefehl), Erb-Fristen (Erbgang), Kündigung (Art. 336b OR).
Neue Ereignisse folgen derselben Regel — kein zentraler Fristenspiegel.

## R10 · Themen-Einstieg

Wo zum Rechner passende Vorlagen existieren, steht NACH der
Werkzeug-Karte genau ein Themen-Einstieg über die geteilte Komponente
`ThemenEinstieg` (Label + Direktlinks). Keine frei formatierten
Link-Absätze auf Seitenebene.

## R11 · Typografie/Token (Kurzfassung; Quelle: FAHRPLAN-DESIGN.md)

- Überschriften: h1 nur im RechnerKopf; Abschnitts-Beschriftungen als
  `lc-overline`; Ergebnis-Titel als h3 (ErgebnisAnzeige).
- Werte/Daten/Beträge im `num`-Schnitt (Tabellenziffern); Boxen nur
  über die `lc-*`-Klassen (card/tile/panel/notice/badge/chip);
  Tailwind-Defaults `text-sm`/`text-lg` sind verboten.
- Hinweis-Boxen: `lc-notice` (neutral) · `lc-notice-warn` (Vorbehalt) ·
  `lc-notice-danger` (Blocker) — Tonalität nie über freie Farben.

## R12 · Ausnahmen (abschliessend)

- **EinfacheFristForm** (Tagerechner-Schnellrechner, S-5a): bewusst
  minimal — keine Eckdaten-Kacheln, kein PDF (sein PDF-Fall ist der
  jeweilige Regime-Rechner). Er trägt aber denselben Ergebnis-Rahmen.
- **EreignisFristenSektion**: Tabellenmuster (je Frist eine Zeile mit
  ICS), kein ErgebnisAnzeige-Verdikt — sie listet, sie urteilt nicht.
- **Zuständigkeits-Trio** (zivil/schkg/straf): Wizard-Schritte statt
  einem Eingabe-Grid; ab dem Ergebnisblock gilt R4 unverändert.

## Prüfung

Jeder neue oder geänderte Rechner besteht vor dem Commit die
Checkliste R1–R12 (Bau-Begleitpflicht im WACHSTUM-REGLEMENT, Ziff. 4
«Rahmen vorhanden»). Verstösse, die sich fachlich begründen, werden im
Code an Ort kommentiert und hier als Ausnahme (R12) nachgeführt —
stille Abweichungen sind Bugs.
