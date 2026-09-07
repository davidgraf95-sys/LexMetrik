# GA — Köpfe, Dopplungen, Übersichten (W2·24-DESIGN-IDENTITAET)

**Stand** `feat/w2-24-ga`, Basis `018b41a37` · gemessen 7.9.2026 @1440, hell und dunkel,
Chromium gegen `vite preview :4411` aus dem eigenen `dist/`
**Massstab** `DESIGN-REGLEMENT.md` §F0 (F0.9 «Keine Brotkrume im Leser») ·
`fahrplaene/FAHRPLAN-DESIGN-IDENTITAET.md` §5 Nachtrag D11 (Übersichts-Köpfe ohne
Erklärtext) und D4 (Kopf-/Ortsprüfung: jede Angabe genau einmal)
**Vorlage** die Befunde G3–G9 · G16–G19 der Gesamtprüfung vom 6.9.2026
**Screens** `ga-*.jpg` (10) · der Vorzustand liegt zusätzlich in den Prüfer-Screens
`gesamt-a-03/09/11/12/14`

---

## 1 · Die zwei Regeln, die daraus geworden sind

### R-GA-1 · Die Ortsleiste nennt das Blatt nie
`src/components/layout/BrotkrumeRegel.ts` — **eine** Stelle für alle Nicht-Leser-
und Leser-/Werkzeug-Routen der Einzelansicht:

1. **Das Blatt tragen Reiter (oben) und H1 (unten).** Die Ortsleiste dazwischen
   trägt nur noch den **Rücksprung auf die Sektion** — keine Zwischenglieder,
   kein Blatt.
2. **Genau ein Rückweg oben.** Zeigt die Seite ihren Rückweg selbst
   (`vorlagen/wizard`: «← Zurück zum Katalog»), schweigt die Leiste ganz.

**Grenze, bewusst gezogen:** der `PaneKopf` behält die volle Kette. Im Split-View
ist diese Zeile die **Identität des Fensters**; dort steht keine H1 darüber, die
das Blatt schon nennt, und mehrere Panes müssen in der Landmark-Liste
unterscheidbar bleiben. Die *Meldung* der Seiten (`KopfDaten.breadcrumb`) bleibt
darum vollständig — gefiltert wird erst an der Leiste, die die Regel betrifft.

### R-GA-2 · Jede Angabe genau einmal (D4)
`src/pages/entscheidLeserRegeln.ts` — `angabeImTitel` / `leitzeileOhneKopfangaben`,
beide rein, beide nach dem Muster von `referenzImTitel` (B-5) **an den Daten**
geprüft, nicht an einer Annahme über sie: eine Angabe entfällt nur, **wenn** der
Titel sie wortgrenzen-genau trägt. Trägt eine künftige Zitierung den
Gerichtsnamen nicht («BGE 152 IV 14»), steht die Overline weiter da.

---

## 2 · Befund → Fix → Messung

| Nr | Befund (6.9.2026) | Fix | Messung 7.9.2026 |
|---|---|---|---|
| G3 | Entscheid- und Material-H1 in Archivo, Erlass/Vorlage in Literata | `stimme="serif"` an beiden Lesern | Entscheid + Material H1 = **Literata Variable** (hell + dunkel) |
| G4 | Entscheid: «HOR.2024.19» 3× · «Obergericht AG» 3× · «Privatrecht» 2× · Datum 2× | R-GA-1 + R-GA-2 (Overline ohne Gericht, Fakten ohne Datum, Leitzeile ohne Gebiet/Gericht) | jede Kopf-Angabe **1×** — Sonde grün |
| G5 | Vorlage: derselbe Titel 4× in 260 px | R-GA-1 Satz 2 — Leiste schweigt, «← Zurück zum Katalog» bleibt | Krumen in der Leiste: **0** |
| G6 | Rechner: Brotkrume wortgleich mit der H1 | R-GA-1 Satz 1 | Leiste = «Rechner», H1 = «Verfahrens- & Rechtsmittelfristen» |
| G7 | vier Leser-/Werkzeug-Routen, vier Anatomien | R-GA-1 als **ein** geteilter Baustein | Erlass (F0.9, unverändert), Entscheid, Material, Rechner, Vorlage folgen derselben Regel |
| G8 | /gesetze: drei Kacheln mit «Öffnen →» (Negativliste) | Zeile aus `ui/RubrikKachel` gestrichen; der ganze Baustein ist der Link | «Öffnen →» im Bild: **3 → 0** |
| G9 | Erklärtexte auf /suche (3 Z.), /einstellungen (2 Z.), /gesetze (⌘K) | Lead gestrichen; Funktion steht im Platzhalter bzw. am Bedienelement | /suche + /einstellungen ohne Lead; /gesetze ohne ⌘K-Satz |
| G16 | Startseite: «Rechner / 23 / Rechner», «Vorlagen / 26 / Vorlagen» | Sacheinheit statt Bereichsname | kein Text steht zweimal in einer Bereichs-Zelle |
| G17 | H1-y 177 (Übersicht) gegen 213 (Meta) — zwei Bauformen | /suche + /einstellungen auf die Übersichts-Anatomie | H1-y **177 = 177**, hell und dunkel |
| G18 | /suche: Overline wortgleich mit der H1 | Overline gestrichen | Kopf trägt nur die H1 |
| G19 | /suche: 200× dasselbe Wort «Gesetz» rechts, keine Gliederung | Art nur beim Wechsel; Haarlinie an der Dokument-Grenze | `?q=Miete`: 223 Zeilen → **12** Typ-Marken, 81 Bündel-Grenzen |

---

## 3 · Wächter

`e2e/w224-ga-kopf.e2e.ts` — Entscheid · Vorlage · Rechner @1440:
Keine **Kopf-Angabe** (H1, Overline-Glied, Krume) steht zweimal in der Kopfzone
(Ortsleiste + oberste 300 px von `main#inhalt`). Gezählt wird wortgrenzen-genau
über Textknoten mit Blockgrenzen (CLAUDE.md §7 — Identitäts-Treffer, nie
Substring-Präsenz).

**Zone bewusst ohne Topbar und Reiterleiste.** Beide sind der Rahmen der App,
nicht der Kopf der Seite — dass der *Reiter* den Ort trägt, ist gerade die
Begründung dafür, dass die Leiste darunter ihn nicht mehr trägt.

**Zweimal rot gefahren (§6.7), 7.9.2026** — Protokoll im Dateikopf der Sonde:
* Mutation 1 (`ortsLeistenKrumen(…)` → `daten.breadcrumb`): **3 failed · 0 passed**
* Mutation 2 (Overline wieder bedingungslos mit `gerichtName`): **1 failed · 2 passed**

---

## 4 · Abweichungen vom Prüfer-Vorschlag (offengelegt, §7)

1. **G4 «Overline streichen»** — nicht die *ganze* Overline entfällt, nur ihr
   Gerichts-Glied, und auch das nur, wenn die Zitierung es trägt. Sonst verlöre
   ein Entscheid mit Regeste (dort ist die Leitzeile `null`) Sachgebiet und
   Abteilung ersatzlos (§8).
2. **G4 Leitzeile** — `synthThema` (`lib/rechtsprechung/browse.ts`) bleibt
   **unangetastet**: dieselbe Zeile trägt die Rechtsprechungs-Liste, wo kein Kopf
   daneben steht. Gekürzt wird nur die Anzeige im Reader-Kopf (§5: eine Quelle,
   zwei Zuschnitte).
3. **G9 /gesetze** — gestrichen ist nur der ⌘K-Satz. Die Scope-Zeile «Filtert: …»
   bleibt: sie ist die `aria-describedby`-Beschreibung des Filterfelds (WCAG) und
   **ändert sich mit dem Filter** — eine Auskunft, keine Erklärung.
4. **G9 /einstellungen** — der Satz «lokal in diesem Browser gespeichert, nie
   übermittelt» ist eine Zusage über die Datenhaltung (§8) und wandert als
   Ausgabe-Zeile mit, statt zu verschwinden.
5. **G8 «Titel = Link»** — der ganze Baustein war schon ein `<Link>`; es entfällt
   allein die Zier-Zeile. Die Karten-Titel-Spans bleiben unberührt (R8 parallel).
6. **G19 «Treffer je Erlass bündeln»** — als Haarlinie an der Dokument-Grenze,
   **nicht** als Umsortierung: Reihenfolge und Auswahl der Treffer gehören der
   Suchlogik (`lib/universalSuche.ts`) und sind unberührt.

## 5 · Offen / nicht in diesem Los

* `check:schlankheit` ist auf der Basis `018b41a37` bereits rot
  (`src/pages/gesetz-leser/parts/ArtikelLeser.tsx`, 866 Z. gegen Schwelle 800) —
  die Datei ist von GA nicht berührt (Nullprobe: `git diff 018b41a37` leer).
* `/suche` zeigt im Leerzustand weiterhin einen vierzeiligen «Tipp»-Block. Er
  steht **unter** dem Feld und nur ohne Suchbegriff, ist also kein Übersichts-Kopf
  im Sinn von D11 — als Beobachtung notiert, nicht als Fund.
