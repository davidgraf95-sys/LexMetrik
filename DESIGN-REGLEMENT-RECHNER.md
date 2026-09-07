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

**Akzent-Oberkante — zwei Farben, EINE Anatomie** (ergänzt 31.8.2026,
Design-Konsistenz R2-F/F1-5). Die 3 px starke Oberkante kommt immer aus
einer CSS-Klasse, nie aus einem inline `border-t-[3px]`:

| Klasse | Bedeutung | Beispiel |
|---|---|---|
| `.lc-akzent-brass` | massgeblicher Wert | frühere Verjährungsfrist, Hauptbetrag |
| `.lc-akzent-danger` | Sperre / kein statthaftes Rechtsmittel | «NICHTIG» (Art. 336c OR), `statthaft === 'keines'` |

Die FARBE trägt die Bedeutung, die Stelle ist immer dieselbe. Nur in der
Klasse hält der Ton im Dunkelmodus (`--brass-line` / `--danger-line`,
`src/index.css`); handgesetzte Utilities greifen dort an der
Theme-Umschaltung vorbei. Anlass: sechs handgebaute `border-t-[3px]` in
vier Dateien, davon eine (`VerjaehrungForm`), die zusätzlich alle vier
Kanten einfärbte. Bewacht von `src/tests/listen-editor-r2f.test.tsx`.

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
  Sein Block `lc-ergebnis-einfach` ist damit der einzige ohne
  ErgebnisAnzeige; das Tor `e2e/qsui-hierarchie.e2e.ts` führt genau
  diese id in seiner Ausnahmeliste (zwei Orte, eine Regel — wer eine
  weitere Ausnahme baut, trägt sie in beiden nach).
- **EreignisFristenSektion**: Tabellenmuster (je Frist eine Zeile mit
  ICS), kein ErgebnisAnzeige-Verdikt — sie listet, sie urteilt nicht.
- **Zuständigkeits-Trio** (zivil/schkg/straf): Wizard-Schritte statt
  einem Eingabe-Grid; ab dem Ergebnisblock gilt R4 unverändert.

## R13 · Leerzustand des Ergebnisplatzes

Ein Rechner, der ohne Eingabe kein Ergebnis zeigen kann, zeigt an
dessen Stelle den geteilten `ErgebnisPlatzhalter` (`vorlagen/ui`):
Overline «Ergebnis» + ein Satz, welche Eingabe fehlt und was danach
erscheint. Er reserviert die Fläche (CLS, §15.2) und zeigt vor der
ersten Eingabe keinen Fehler (C2). Der Satz ist reine Navigation — er
nennt keine Frist, keinen Schwellenwert, kein Ergebnis (§3).

Nicht betroffen sind Wizards, deren Ergebnis ein eigener Schritt ist
(Zuständigkeits-Trio): dort trägt der Schritt selbst die Ansage.

## R14 · Repeater = ListenEditor

Jede wiederholbare Eingabezeile — Rechtsbegehren, Kinder, Beilagen,
Sperrereignisse, Gründer:innen, Teilzahlungen — kommt aus dem geteilten
`ListenEditor` (`src/components/vorlagen/ui.tsx`), nie aus einem
handgebauten `map()` mit eigenem Knopf:

- **Behälter je Eintrag:** `lc-panel p-3` (kein `lc-card`, kein nacktes
  `border border-line`, kein behälterloses `flex`).
- **Kopfzeile je Eintrag:** Overline «‹Element› N», rechts der
  Entfernen-Link.
- **Entfernen:** roter Text-Link, klein, Wortlaut **«entfernen»** —
  nicht «Entfernen», nicht «✕», nicht `lc-btn-ghost`.
- **Hinzufügen:** `lc-btn-outline lc-btn-sm` mit **«+ ‹Element›»**,
  UNTER der Liste. Kein «hinzufügen» im Text: das Pluszeichen sagt die
  Handlung bereits.
- Mindest-/Höchstzahl von Einträgen ist eine Zahl am Baustein
  (`mindestens`/`hoechstens`), keine eigene Bedingung um den Knopf —
  und nie ein Knopf, der still nichts tut (§8).

Ergänzt 31.8.2026 (Design-Konsistenz R2-F/F1-9): Das Reglement schwieg
zu Repeatern, und entsprechend standen 43 Hinzufügen-Knöpfe in 20
Dateien in drei Optiken, zwei Beschriftungsgrammatiken und vier
Entfernen-Formen nebeneinander. Bewacht von
`src/tests/listen-editor-r2f.test.tsx`.

## Prüfung

Jeder neue oder geänderte Rechner besteht vor dem Commit die
Checkliste R1–R14 (Bau-Begleitpflicht im WACHSTUM-REGLEMENT, Ziff. 4
«Rahmen vorhanden»). Verstösse, die sich fachlich begründen, werden im
Code an Ort kommentiert und hier als Ausnahme (R12) nachgeführt —
stille Abweichungen sind Bugs.

**Gegatet seit QS-UI 8b (4.8.2026):** `e2e/qsui-hierarchie.e2e.ts` misst
auf 14 Rechner-Flächen × 2 Breiten fünf Punkte dieser Checkliste, die
bis dahin nur auf Sichtprüfung beruhten — R4 Ziff. 2 (Verdikt vor
Herleitung und vor jeder abgeleiteten Ansicht), R6 Ziff. 2 (Vorbehalte
nahe am Verdikt), B2 (Lesespalte für Fliesstext im Ergebnisblock), die
Erreichbarkeit der Sprungmarke auf jeder Breite und ihr Fernbleiben im
Ausdruck. Der Anlass war ein realer Verstoss, den vier Monate
Sichtprüfung nicht gefunden hatten: `ErbteilungForm` schob Tabelle und
Quoten-Balken zwischen Eckdaten und Verdikt (gemessen 666 px Abstand
gegen 243–283 px auf allen anderen Flächen).

Was der §6.7-Rot-Beweis für jeden Punkt **genau** zeigt — die Zusage ist
bewusst eng formuliert, weil ein zu weit gefasster Beweis dieselbe
Scheinsicherheit erzeugt wie ein Tor, das nicht scheitern kann:

- **R4 Ziff. 2:** rot mit der ErgebnisAnzeige unter dem `FristenKalender`
  (`/rechner/zpo-fristen`). Genau dieser Fall lief zuvor **grün trotz
  Verstoss** — das Tor erkannte Ansichten nur an `table, svg`, und
  Kalender, Zeitstrahlen und Balken sind reine Divs. Sie tragen darum
  jetzt `data-ansicht`; wer eine neue Ansicht baut, setzt es ebenfalls
  (§9-Bug-Check zu PR #440, B2).
- **R6 Ziff. 2:** Die Reglement-Schranke «eine Bildschirmhöhe» allein ist
  **nicht falsifizierbar** — gemessen liegt der Abstand bei 48–213 px
  gegen 800/844 px, Faktor 3.8. Rot gezeigt wird darum die daneben
  stehende, gemessene Regressions-Schranke (320 px): ein 400-px-Einschub
  zwischen Verdikt und Vorbehalte lässt die Reglement-Schranke
  unberührt und feuert nur diese. Zusätzlich weist das Tor jeden
  übersprungenen Fall aus — eine Fläche ohne Vorbehalte muss in seiner
  Ausnahmeliste stehen, sonst ist sie rot (§8: still verschwundene
  Warnungen sind der Fehler, gegen den die Regel steht).
- **B2:** rot ohne `max-w-reading` am `BegruendungAbsatz`.
- **Sprungmarke:** rot, sobald sie unsichtbar ist — und, nach
  Verschärfung auf Geometrie, auch dann, wenn sie zwar sichtbar ist,
  aber nicht in der Bildschirmecke sitzt. Diese Verschärfung deckte den
  `transform`/`position:fixed`-Defekt überhaupt erst auf.
- **Ausdruck:** rot mit der alten Druckregel `.lc-btn`, die die über
  `@apply` gebauten Varianten nie erfasste.
