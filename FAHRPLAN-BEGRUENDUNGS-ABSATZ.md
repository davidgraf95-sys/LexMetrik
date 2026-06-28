# FAHRPLAN — «Begründung für die Rechtsschrift»-Absatz (Marken-Feature)

**Stand:** 28.6.2026 · **Status:** **Phase 0 in Arbeit** (B0-1 verifiziert, B0-2/B0-3
gebaut + gegated 28.6., nicht deployt); Phasen 1–5 offen · **Herkunft:** Ultra-Workflow
(Bestandsleser durch den realen Code → Design → 3 adversariale Linsen: CLAUDE.md-Treue ·
Solo-Machbarkeit · Praxistauglichkeit). Kritik-Befunde sind je Schritt eingearbeitet — sie
haben mehrere falsche Bestandsannahmen des Erst-Entwurfs korrigiert (s. u.).

> **B0-1-Verifikation 28.6.2026 (§7):** Ist-Stand bestätigt — `src/lib/begruendung.ts`
> existiert (`begruendungsAbsatz`, `MAX_NORMEN=6`, **`fristbeginnZusatz` bereits vorhanden**
> aus dem Code-Review 7.6.). **16 Forms verdrahtet**, davon genau **3 mit `zusatz`**:
> `ZpoFristenForm` (`fristbeginnZusatz(ergebnis.diesAQuoISO, ergebnis.normverweise[0].artikel)`),
> `AllgemeineFristForm` (`…resultat.fristbeginnISO, normverweise[0]?.artikel`),
> `SchkgFristenForm` (`…e.diesAQuoISO, 'Art. 31 SchKG i.V.m. ' + e.normverweise[1].artikel`).
> **`pruefeFormulierung`/`FLOSKELN` existieren in `src/lib/konventionen.ts`** (B0-3 nutzt sie,
> kein Neubau). **0 `absatz:`-Goldens** → B0-2 ist echte Erst-Baseline. `BegruendungSlot`
> (Phase 2) und `fristbeginnNorm`-Feld (B1-1) existieren noch nicht.

> **Nordstern:** Aus jedem **geeigneten** Rechen-Ergebnis entsteht EIN
> kopierfertiger, normgestützter, konventionskonformer Absatz, den ein Anwalt in
> eine Rechtsschrift einfügen kann. Die Textkomposition lebt deterministisch und
> ausschließlich in `src/lib/begruendung.ts` (§2/§3); jeder Rechner liefert nur
> sein Engine-Ergebnis plus ggf. einen aus Engine-FELDERN formulierten Zusatzsatz
> — niemals neue Rechtslogik oder hartcodierte Normen im UI. **Ein** geteilter
> UI+PDF-Baustein zeigt/kopiert/druckt den Absatz aus EINER Quelle. Qualität durch
> Goldlist/Linter über die **echte** Textausgabe + Golden-Byte-Gleichheit.

## Korrekturen aus der Kritik (vor Baubeginn lesen — wichtig)

1. **Die lib-Bericht-Adapter EXISTIEREN bereits** (Erst-Entwurf wollte sie «erst
   bauen» — falsch, §1/§5-Doppelarbeit): `beurkundungBericht()`
   (`beurkundung.ts:125`), `notariatGrundbuchBericht()` (`notariatGrundbuch.ts:128`),
   `prozesskostenBericht()` (`prozesskosten.ts:610`, **mit `zusatz`-Signatur**),
   `grundbuchgebuehrBericht()` (`grundbuchgebuehren.ts:103`),
   `schkgZustaendigkeitBericht()`/`strafZustaendigkeitBericht()`. → Phase 4 ist
   **Verdrahtung**, kein Neubau.
2. **Kosten-Rechner taugen NICHT für einen Rechtsschrift-Absatz** (Praxis-HOCH):
   Der `ergebnis`-Satz von Beurkundung/Notariat/Prozesskosten ist eine
   telegrafische Kostenzeile («Notariat CHF 1'200 · Grundbuch CHF 800 …») —
   das fügt kein Anwalt in eine Rechtsschrift ein. **David-Entscheid VOR Phase 4.**
3. **`check:smoke` beweist den Absatz-Pfad NICHT:** `smoke-render.tsx` rendert nur
   den Initialzustand (`html.length>=500`); `BegruendungAbsatz` gibt bei leerem
   Ergebnis `null` zurück. Primäres Tor ist der **Golden-Snapshot der echten
   `begruendungsAbsatz()`-Ausgabe**, nicht Smoke. Zudem fehlen
   Beurkundung/Notariat/Prozesskosten/EinfacheFrist/GrundbuchEintrag ganz in der
   Smoke-Seitenliste → Vorschritt **B4-0**.
4. **§8-Ehrlichkeit im PDF:** Der UI-Vorbehalt («vor Verwendung fachlich prüfen»,
   `BegruendungAbsatz.tsx:32`) und die `MAX_NORMEN=6`-/«u. a.»-Kappung
   (`begruendung.ts:13`) müssen im PDF-Block sichtbar mitlaufen — aus EINER
   geteilten Konstante (§5), sonst wirkt der gedruckte Absatz fälschlich geprüft.
5. **`normverweise[0]/[1]` ist ein fragiler Magic-Index** (ZPO nutzt `[0]`,
   `SchkgFristenForm.tsx:354` nutzt `[1]` für «Art. 31 SchKG i.V.m. …»). Den
   Verweis nach `lib` zu ziehen *verschiebt* das Risiko nur. → Fristbeginn-Norm
   als **benanntes Engine-Feld** ausgeben (oder mind. Engine-Test, der bei
   Reihenfolge-Änderung bricht) — sonst bleibt die «Deploy-Bug-#5-Klasse» offen.
6. **Negativ-/Validierungs-Ergebnisse** (z. B. `verzugszins.ts:125` «Kein
   Verzugszins», «Ungültiger Zeitraum») dürfen KEINEN Absatz erzeugen. Der
   Baustein rendert dann `null`; das Vollständigkeits-Gate darf «jeder Rechner hat
   Absatz» **nicht** erzwingen.

## Ist-Stand (verifiziert)

- **16 Forms** rufen `begruendungsAbsatz()`/`<BegruendungAbsatz>` bereits auf
  (AllgemeineFrist, BgerRechtsweg, ErbFristen, Erbteilung, GebvKosten,
  Gewaehrleistung, KuendigungSperr, Lohnfortzahlung, Mietrecht, SchkgFristen,
  Streitwert, Teuerung, Verjaehrung, Verzugszins, Zpo, Zustaendigkeit).
- **NICHT verdrahtet (7):** Beurkundung, NotariatGrundbuch, Prozesskosten,
  EinfacheFrist, GrundbuchEintrag, SchkgZustaendigkeitTeil, StrafZustaendigkeitTeil.
  Davon liefern `schkg`/`straf`-Zuständigkeit + Grundbuch bereits ein
  `Berechnungsergebnis` (sofort verdrahtbar).
- In `golden-outputs.ts` existieren **null** Snapshots von `begruendungsAbsatz()`
  (die `begruendung:`-Treffer dort sind das `begruendung`-FELD der
  Fristerstreckungs-Vorlage — daher **anderer** Key-Präfix nötig).
- `BegruendungAbsatz.tsx`: rendert `null` bei leerem Text; trägt den Entwurf-
  Vorbehalt (Zeile 32). `MAX_NORMEN=6` mit «u. a.» in `begruendung.ts:13`.

## Datenmodell

Kern unverändert: `Berechnungsergebnis { ergebnis, status, rechenweg[], annahmen[],
warnungen[], normverweise[] }`. `begruendungsAbsatz(e, zusatz?)` bleibt die EINZIGE
Textkomposition. **Additiv:** (1) benannte Fristbeginn-Norm an der Engine (statt
`normverweise[0]/[1]`); (2) `PdfDocConfig` erhält optionales `begruendung?: string`
→ `buildPdfModel` rendert bei Vorhandensein einen «Für die Rechtsschrift»-Block
**mit Vorbehalt** VOR dem Disclaimer (fehlt das Feld → byte-identisch); (3) ein
geteilter Slot-Baustein, der UI-Absatz UND `pdfConfig.begruendung` aus EINER
Aufrufstelle liefert. Vorbehalts-Text aus EINER lib-Konstante (§5).

---

## Phase 0 — Bestandsklärung & Beweis-Grundlage (verhaltensneutral) — ✅ erledigt 28.6.2026

> **Erledigt 28.6.2026 (gebaut + gegated, nicht deployt):**
> - **B0-1** verifiziert (s. Kopf-Block).
> - **B0-2** Erst-Baseline: **10** `absatz:<id>`-Goldens in `golden-outputs.ts` über die
>   ECHTE `begruendungsAbsatz()`-Ausgabe (zpo+schkg mit byte-exaktem `zusatz`-Ausdruck;
>   kuendigung/sperr, miet, verj, gewaehr, verzug, lohn, erbteilung, bger als Roh-Ergebnis).
>   `golden:vergleich`: nur 10 neue Keys, **0 geändert/entfernt** (bestehende 187 byte-gleich).
> - **B0-3** `src/tests/begruendungLinter.test.ts` (30 Assertions): `pruefeFormulierung()` = 0
>   Verstösse + nicht-leerer Normen-Satz + Schlusspunkt-Wächter.
> - **Bug-Check-Funde (behoben):** (1) `zust`/`rm` geben **kein** rohes
>   `Berechnungsergebnis` (`.ergebnis` fehlt) → die Form wickelt UI-seitig → in den
>   B0-2-Rest verschoben (faithful erst über Phase-2-`BegruendungSlot`). (2) **Doppelter
>   Schlusspunkt** «… u. a..» in `normenSatz()` (`begruendung.ts`) — sichtbar im kopierten
>   Absatz aller 16 Forms — als deklarierter §13/F6-Fix behoben (golden-neutral, da vorher
>   kein Snapshot bestand); Linter-Wächter sichert gegen Rückfall.
> - **B0-2-Rest (offen):** `allg`/`zust`/`rm` (UI-gewickelt) + streitwert/teuerung/
>   gebvKosten/erbFristen (Engines noch nicht in `golden-outputs.ts` importiert).

## Phase 0 — Bestandsklärung & Beweis-Grundlage (Original-Schritte)

**B0-1 Bestand dokumentieren** (nur Lesen): die 16 verdrahteten + 7 offenen Forms
**und** `grep '*Bericht(' src/lib` (die existierenden Adapter!) als verbindliche
Liste festhalten. *Beweis:* keine Datei geändert → `gate` grün.

**B0-2 Ist-Golden der ECHTEN Ausgabe einfrieren** — je verdrahtetem Engine-Fall ein
**neuer** Eintrag in `golden-outputs.ts`, gebildet mit **exakt dem heutigen
Inline-Ausdruck** der Form (z. B. `fristbeginnZusatz(e.diesAQuoISO,
e.normverweise[0].artikel)`), **nicht** mit den erst in B1 entstehenden Helfern
(sonst zirkulär). **Kollisionsfreier Key-Präfix `absatz:<id>`** (nicht
`begruendung:`). *Beweis:* `npm run golden` legt die Keys neu an (Re-Baseline);
danach `golden:vergleich` grün; bestehende Keys unverändert.

**B0-3 Goldlist/Linter-Test** `src/tests/begruendungLinter.test.ts` über die echte
`begruendungsAbsatz()`-Ausgabe (Muster `konventionen.test`): `pruefeFormulierung()`
= 0 Verstöße + nichtleerer Normen-Satz. **Ehrlich:** der Linter sichert
Konvention/Typografie, **nicht** Rechtsschrift-Eignung. *Beweis:* neuer grüner
Test; bestehende unverändert.

## Phase 1 — Generator-Konsolidierung (deterministisch, Logik in `lib`)

**B1-1 Fristbeginn-Norm als benanntes Engine-Feld** (statt Magic-Index, Kritik-5):
z. B. `ergebnis.fristbeginnNorm`. Falls das den Engine-Output ändert → **eigener
§6-deklarierter Schritt mit Golden-Diff**, nicht im UI versteckt. Dann pro
Frist-Engine ein deterministischer `lib`-Zusatz-Helfer (`zpoZusatz`/`schkgZusatz`
/…), der den heutigen Form-Zusatz reproduziert, aber das benannte Feld zieht.
*Beweis:* Helfer in B0-2-Goldens mitgesnapshottet → byte-identisch; Unit-Test je
Helfer; Engine-Test bricht, wenn die Fristbeginn-Norm nicht mehr stimmt.

**B1-2 / B1-3** `ZpoFristenForm`/`SchkgFristenForm`, dann übrige Frist-Forms auf
die `lib`-Helfer umstellen. **Primäres Tor: B0-2-Golden byte-gleich** (nicht
`check:smoke`, das den Pfad gar nicht ausführt). Reine Beträge-/Datums-Forms
bleiben unverändert.

## Phase 2 — Ein geteilter UI+PDF-Slot-Baustein (§10-Rahmen VOR Rollout)

**B2-0 `BegruendungSlot`** (neu, Kritik-Solo §10): rendert (a) den Absatz in der
UI **und** liefert (b) denselben String als Rückgabe für `pdfConfig.begruendung`
— **eine** Aufrufstelle pro Form, **ein** String. Macht das UI↔PDF-Konsistenz-Gate
strukturell überflüssig statt nachträglich erzwungen. *Beweis:* verhaltensneutral
(gleicher String wie heute) → B0-2-Goldens byte-gleich.

**B2-1 Copy-Mechanik** in einen kleinen geteilten `useKopieren(text)`-Helfer
auslagern (try/catch, «Kopiert ✓» erst nach Erfolg). **B2-2** Render-Test:
leerer/Negativ-Text → `null`; gültiger Text → Absatz + Button. *Beweis:* additive
UI-Tests; kein Golden betroffen.

## Phase 3 — Absatz im PDF-Bericht (kritischer Befund schließen)

**B3-1 `PdfDocConfig.begruendung?`** + `buildPdfModel`: neuer Block («Für die
Rechtsschrift») **inkl. eigenem, sichtbarem Vorbehalt** (Entwurf + «u. a.»-Kappung
+ Subsumtionspflicht) aus der geteilten lib-Konstante (§5/§8). Fehlt das Feld →
Modell byte-identisch. *Beweis:* PDF-`modelText`-Snapshots (in `pdf.test.ts`, mit
FIX-Datum — **dort** liegt die PDF-Erstarrung, nicht in `golden-outputs.ts`) ohne
`begruendung` byte-gleich; neuer Fall mit Vorbehalt zusätzlich.

**B3-2 / B3-3** je Form `pdfConfig.begruendung` über `B2-0` setzen — **dieselbe
Quelle wie UI**. **Fachlicher** Golden-Diff (PDF zeigt jetzt Absatz) → je Form ein
**eigener deklarierter** Schritt mit einzeln review-/committebarem Snapshot
(kein Sammel-Update; §12 Pathspec). Vor B3-1 feststellen, **wo** die
PDF-`modelText`-Ausgabe heute fixiert ist (golden vs. `pdf.test`-Inline).

## Phase 4 — Rollout auf die 7 offenen Rechner (Verdrahtung, kein Neubau)

**B4-0 Smoke-Abdeckung herstellen:** Beurkundung/NotariatGrundbuch/Prozesskosten/
EinfacheFrist/GrundbuchEintrag zur Seitenliste in `smoke-render.tsx` hinzufügen
(rein additiv, eigener Commit) — **bevor** sie verdrahtet werden.

**B4-1 Zuständigkeit (Zivil/SchKG/Straf) + Grundbuch:** `BegruendungSlot` mit dem
bereits vorhandenen `*Bericht()`-Ergebnis verdrahten (kein Zusatz). *Beweis:* neuer
`absatz:`-Golden + Linter (0 Verstöße); Render/E2E.

**B4-2 KOSTEN-Rechner — David-Entscheid zuerst** (Praxis-HOCH, Korrektur-2): Die
Adapter existieren, aber ihr `ergebnis`-Satz ist eine Kostenzeile, kein
Rechtsschrift-Text. **Optionen:** (a) separater, prosa-tauglicher
«Kosten-Begründungs»-Satz im jeweiligen `lib` (nicht UI) mit eigenem Titel; (b)
Kosten-Rechner bewusst **vom Rechtsschrift-Absatz ausnehmen** (sie liefern
Kostendokumentation). Für Prozesskosten gilt zusätzlich: der `zusatz`
(Kostenrisiko/Instanzenzug/MwSt/Kaution) muss in die Quelle eingehen, sonst wird
der Absatz irreführend unvollständig.

**B4-3 EinfacheFrist/GrundbuchEintrag:** `GrundbuchEintragForm` nutzt bereits
`grundbuchgebuehrBericht()` → trivial verdrahtbar (Behandlung wie Kosten-Entscheid).
`EinfacheFristForm` mischt mehrere Engines ohne einheitliches Bericht-Resultat →
klären, welcher Ergebnistyp den Absatz speist, sonst bewusst ausnehmen (§8).

## Phase 5 — Qualitätssicherung & Vollständigkeits-Gate

**B5-1 Goldlist** über ALLE Engines mit **gültigem, prosa-fähigem** Ergebnis: je
repräsentativer Eingabe `begruendungsAbsatz()` → 0 Konventionsverstöße +
nichtleerer Normen-Satz. Negativ-/Validierungs-Ergebnisse sind ausgenommen
(Baustein rendert dort `null`). Optionale Prosa-Heuristik (kein «·»-Fragment,
finites Verb) als Zusatzregel.

**B5-2 Golden-Vollständigkeit + Konsistenz-Wächter:** für jeden abgedeckten Engine
ein `absatz:<id>`-Golden; Wächter, der rot bricht, wenn ein Rechner Absatz in UI
aber nicht im PDF führt (oder umgekehrt) — durch `B2-0` weitgehend strukturell
schon gesichert. **B5-3** optionaler Playwright-Smoke: Copy-Button auf je einem
Rechner pro Rechtsgebiet (Feedback erscheint, Absatz nicht leer).

---

## Offene David-Entscheide

1. **Kosten-Rechner (B4-2):** Eigener «Kosten-Begründungs»-Text **oder** vom
   Rechtsschrift-Absatz ausnehmen? (Bestimmt Phase 4 maßgeblich.)
2. **`MAX_NORMEN=6`/«u. a.»:** Kappung beibehalten oder pro Engine konfigurierbar?
   Bei vielen Normen (Zuständigkeit) kann eine tragende Norm aus dem Absatz fallen
   — Default: Kappung im Absatz selbst kenntlich machen (nicht nur «u. a.»).
3. **PDF-Absatz:** als «Für die Rechtsschrift»-Block ins PDF (mit Vorbehalt) —
   oder bewusst nur Copy in der UI lassen (PDF bleibt reine Berechnungs-Doku)?
4. **SchKG-Zitierstil:** «Art. 31 SchKG i.V.m. …» so in den lib-Helfer übernehmen
   oder neu formulieren?

## Risiken (Kurz)

- §6: per-Engine-Zusatz nicht byte-genau reproduziert → ungewollter Golden-Diff
  (B0-2 fixiert den Ist-Stand VOR jedem Umbau).
- §3: Bericht-Adapter dürfen **nur** Feld-Mapping sein, keinen Ergebnis-Satz neu
  formulieren (= Rechtslogik an falscher Stelle).
- §8: PDF-Block ohne sichtbaren Vorbehalt wirkt geprüft; «u. a.»-Kappung im PDF
  unsichtbar.
- Magic-Index `normverweise[1]`: nur verlagert statt behoben → falsche zitierte
  Fristbeginn-Norm; benanntes Feld + Engine-Test schließen das.
- §12: viele Forms = breite Streuung → je Schritt eine/wenige Dateien,
  Pathspec-Commits.
