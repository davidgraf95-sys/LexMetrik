# R10 «Pult» — Startseite nach dem freigegebenen Referenzbild

**Stand 6.9.2026 · Branch `feat/w2-24-r10` · Runde 10 von W2·24-DESIGN-IDENTITAET**

Vorgabe ist `abnahme/design-identitaet/pult-freigegeben.html` — David am 6.9.2026:
«ja das gefällt mir, nimm das als vorgabe für runde 10». Dazu die drei Befunde
derselben Sitzung: «zu viel text und linien», «nicht trist», «keine Funktion
verloren».

## 1 · Was auf der Seite steht

Ein Bildschirm, drei feste Ebenen und darunter die schaltbaren Module:

| Ebene | Inhalt | Abschaltbar? |
|---|---|---|
| 1 Suche | Titelblatt-Wort «Sammlung» · Begrüssung (kursiv) mit Datum · Label «Suchen» · Lupe · grosse Serifen-Eingabe über 2-px-Kante · Scope-/Beispielzeile | nein |
| 2 Bereiche | **fünf** in EINER Reihe: Gesetze · Rechtsprechung · Materialien · Rechner · Vorlagen. Je Name (Archivo 18/500), Zahl (Literata 25.6), Einheit klein, ein Satz, Registerfarbe als 3-px-Strich oben. Keine Kästen, keine Haarlinien. @390 zweispaltig | nein |
| 3 Zuletzt | Etikett «Zuletzt» + je Eintrag ein Registerstrich vor dem Namen | nein (leer: stumm, Höhe reserviert) |
| Module | Systematik · Kantone · Frist · Jüngste Entscheide · Materialien nach Behörde, je mit «Anzeigen/Ausblenden» | ja |
| Fuss | Korpus-Stand (D8-Wortlaut kommt von Fixer 1) + Textknopf «Startseite anpassen» · darunter die §8-Vertrauenssätze | nein |

**Werkseinstellung** (= was der Prerender ausliefert): Systematik, Frist,
Entscheide **offen**; Kantone und Materialien-nach-Behörde **zu, aber mit
Schalter da**.

## 2 · Wie der eigene Zustand funktioniert

* Speicher: `localStorage['lexmetrik-startseite']` — **nur Modul-Kürzel**
  (`{reihenfolge:[…], an:[…]}`), nie Inhalte. SSoT: `src/lib/startseiteEinstellung.ts`.
* Registry (`src/lib/startseiteModule.tsx`) bleibt die eine Quelle für Titel,
  Register und Werkseinstellung; das Blatt «Startseite anpassen» konsumiert
  dieselbe Liste.
* Mischung ist rein und deterministisch: unbekannte Kürzel fallen weg, doppelte
  zählen einmal, **neue** Module hängen hinten an und tragen ihre
  Werkseinstellung.
* Blatt «Startseite anpassen» = das Haus-Bottom-Sheet (`ui/SheetRahmen`):
  Kästchen ein/aus, Pfeile ↑↓ (kein Ziehen), «Werkseinstellung» **löscht** den
  Eintrag, statt die heutige Vorgabe hineinzuschreiben.
* Sperrt der Speicher (privater Modus), lebt die Anordnung im Arbeitsspeicher
  weiter — der Schalter wirkt, überlebt aber kein Neuladen.

## 3 · Warum es beim Laden nicht springt (§15)

Prerender = Werkseinstellung, Client = eigene Wahl. Damit daraus kein Umbau wird:

* Die Module stehen **immer** in Registry-Reihenfolge im Baum; die Anzeige-Position
  ist CSS `order`, zugeklappt ist `hidden`. Server- und Client-Baum sind damit
  gestaltgleich — ein Struktur-Unterschied liesse React 19 die Hydration
  verwerfen und die ganze Seite neu rendern.
* Der Zustand kommt aus `useSyncExternalStore` (Server-Schnappschuss =
  Werkseinstellung, Client-Schnappschuss = Speicher). Nur so zieht React die
  Attribute nach der Hydration nach; mit `useState(() => lies())` bliebe die
  Seite optisch auf dem Server-Stand stehen.
* «Zuletzt» hält seine Zeilenhöhe frei (`min-h-beiwerk`), die Entscheide-Liste
  ihre Listenhöhe (`min-h-modul-news`).

**Gemessen (Preview :4348, Chromium, @1440):**

| Fall | CLS |
|---|---|
| Werkseinstellung | 0.0000 |
| gespeicherte, umgeordnete Anordnung | 0.0000 |
| alle fünf Module an | 0.0000 |

## 4 · Funktions-Inventar (jede Funktion ausgeführt)

| Funktion | Stand |
|---|---|
| Suche mit Treffer-Panel, `role=search` + `input[type=search]` | geht |
| `?q=` teilbar/permalinkfähig, Zurück-Taste | geht (`suche-q-fokus-s1-s6` grün) |
| «/» springt in die Hero-Suche | geht |
| Beispiel-Links (Art. 336c OR · BGE 152 V 52 · Frist · Arbeitsvertrag) | geht |
| «Zuletzt» aus dem Verlauf, mit Domänen-Marken | geht |
| Ein-Zeilen-Frist mit echter Engine | geht |
| .ics-Ausleitung der Frist-Zeile auf «/» | geht (`ics-export-z1` Fall «Startseiten-Fristenzeile») |
| Systematik / Kantone / Behörden mit echten Zahlen aus dem Generat | geht |
| Entscheid-Liste (jüngste im Korpus, Datumsgruppen) | geht |
| «Alle Entscheide →» | geht (jetzt in der Modul-Fusszeile) |
| Korpus-Stand im Fuss | geht |
| §8-Vertrauenssätze + Pflichthinweis | geht |
| Modul ein/aus, Reihenfolge, Werkseinstellung | geht (neu) |

## 5 · Abweichungen vom Referenzbild (mit Grund)

1. **Registerstrich als Fläche, nicht als `border-t`.** Das Bild setzt
   `border-top:3px`; im Haus ist ein handgebautes `border-t-[3px]` in der
   Darstellungsschicht gesperrt (Wächter `src/tests/listen-editor-r2f.test.ts`).
   Gleiche Optik über einen 3-px-Streifen — dieselbe Form wie im früheren
   Satzspiegel.
2. **Nav-Name «Bereiche der Sammlung»** statt «Bereiche»: die Reiterleiste der
   Krone trägt bereits eine Landmark dieses Namens; zwei gleichnamige Landmarks
   sind in der Screenreader-Liste nicht auseinanderzuhalten.
3. **Beispiel-Zeile bleibt.** Das Bild hat nur die Scope-Zeile; die
   Beispiel-Verweise sind eine bestehende Funktion und dürfen nicht wegfallen.
   Dafür ist die Bestands-Aufzählung («Gesetze, Entscheide, Materialien,
   Rechner, Vorlagen.») **gestrichen** — genau diese fünf stehen als Bereiche
   mit Zahlen direkt darunter. Der Satz selbst lebt unverändert im Seitenfuss.
4. **Modul-Kopf oben ausgerichtet**, nicht mittig: «Bundesrecht, systematische
   Ordnung» bricht in der 13-rem-Kopfspalte auf drei Zeilen; mittig verlören
   Registerstrich und Schalter den Bezug zur ersten Inhaltszeile.
5. **`?start=` (teilbare Adresse) NICHT gebaut.** Die Spec nennt es «optional,
   nur wenn billig». Es ist nicht billig: eine URL-Vorgabe, die nicht im
   externen Speicher liegt, weicht bei der Hydration von den Server-Attributen
   ab, ohne dass React sie nachzieht — der Fall «kein gespeicherter Stand +
   `?start=`» bliebe still falsch. Bewusst weggelassen statt halb gebaut.
6. **Zahlen und Sätze sind gemessen, nicht illustriert** (§8). Das Bild trägt
   Beispielwerte; ausgeliefert wird der Zähler-Generat-Stand, und die Einheit
   sagt jeweils, was gezählt wurde («im Volltext» nur dort, wo Volltext erfasst
   ist; «erfasst» bei den Materialien).

## 6 · Belegbilder

`r10-werk-1440-hell.jpg` · `r10-werk-1440-dunkel.jpg` · `r10-werk-1024-hell.jpg` ·
`r10-werk-390-hell.jpg` · `r10-alle-an-1440-hell.jpg` ·
`r10-alle-aus-1440-dunkel.jpg` · `r10-umgeordnet-1440-hell.jpg` ·
`r10-umgeordnet-390-dunkel.jpg` · `r10-blatt-1440-hell.jpg` ·
`r10-blatt-390-dunkel.jpg` · `r10-pane-1440-hell.jpg` («/» als Pane,
`?p=/||/gesetze`).

## 7 · Offener Befund AUSSERHALB dieser Runde

`e2e/ics-export-z1.e2e.ts` «A9 — flüssig unter 6× CPU-Drossel, CLS 0» ist auf
`/rechner/tagerechner` rot (CLS 0.02536 gegen Schranke 0.01). **Nullprobe auf dem
Ausgangsstand `0834cbd7b` (ohne R10): ebenfalls rot, mit BYTE-GLEICHEM Wert
0.025356282499101428.** Der Defekt liegt also auf main, nicht an R10.

Messbedingung: ganze Spec-Datei, 1 Worker, lokaler Preview — grün ist der Fall
nur, wenn er per `-g "CPU-Drossel"` als EINZIGER Test läuft. Quelle laut
`layout-shift`-Eintrag: die Reiter-Zeile
(`div.hidden sm:block … border-b border-rule-soft`) wächst nach der Hydration um
34 px und schiebt `main#inhalt` von y=132 auf y=166. Wurzel-Fix gehört zu
`layout/` (in dieser Runde TABU) — gemeldet, nicht umschifft (§17).
