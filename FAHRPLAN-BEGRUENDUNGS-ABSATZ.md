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
> - **B0-2-Rest:** streitwert/teuerung/gebvKosten/erbFristen **nachgezogen 28.6.** (4 weitere
>   `absatz:`-Goldens + Linter-Fälle). **Offen nur noch** `allg`/`zust`/`rm` (UI-gewickelt →
>   faithful erst über den Slot-Pfad). **Bug-Check-Fund (behoben):** der erweiterte Linter
>   deckte auf, dass `erbFristen.ts` durchgängig Geviertstriche «—» statt Halbgeviert «–»
>   führte (§13, sichtbar in UI/PDF, von `konventionen.test` nie erfasst) → global korrigiert
>   (erbFristen-Ausgabe geändert, deklarierter §13-Fix).

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

## Phase 1 — Generator-Konsolidierung (deterministisch, Logik in `lib`) — ✅ B1-1 erledigt 28.6.2026

> **Erledigt 28.6.2026 (B1-1, gebaut + gegated, nicht deployt):** Benanntes Feld
> `fristbeginnNorm` an `ZpoErgebnis` + `SchkgErgebnis` (Engines `zpoFristen`/`schkgFristen`),
> semantisch gesetzt (Art. 142 Abs. 1/2 ZPO bzw. «Art. 31 SchKG i.V.m. …»), nicht über
> `normverweise[0]/[1]`. `ZpoFristenForm`/`SchkgFristenForm` ziehen das Feld (Magic-Index
> raus, Kritik-5/«Deploy-Bug-#5-Klasse» geschlossen). Engine-Wächter
> `src/tests/fristbeginnNorm.test.ts` (bricht bei Reihenfolge-Änderung; prüft zugleich
> Gleichheit mit dem alten Index). Golden re-baseline (18 `zpo:*`/`schkg:*`-Fälle, Feld
> ergänzt); die `absatz:zpo`/`absatz:schkg`-Snapshots blieben **byte-gleich** = Beweis, dass
> das Feld exakt den alten Ausdruck reproduziert. **Offen B1-Rest:** `AllgemeineFristForm`
> wickelt das Ergebnis UI-seitig (eigenes `normverweise[0]`) → wird im Phase-2-Slot mit
> behandelt.

## Phase 1 — Original-Schritte

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

## Phase 2 — Ein geteilter UI+PDF-Slot-Baustein (§10-Rahmen VOR Rollout) — ✅ erledigt 28.6.2026

> **Erledigt 28.6.2026 (gebaut + gegated, nicht deployt):**
> - **B2-1** `useKopieren(text)`-Hook (`src/components/useKopieren.ts`) — Copy-Mechanik aus
>   `BegruendungAbsatz` extrahiert (Promise-Rejection-sicher). `BEGRUENDUNG_VORBEHALT` als
>   lib-Konstante (§5, für die PDF-Wiederverwendung in Phase 3).
> - **B2-0** `BegruendungSlot({ ergebnis, zusatz })` (`src/components/BegruendungSlot.tsx`) —
>   **eine** Aufrufstelle pro Form, ruft `begruendungsAbsatz()`, rendert `BegruendungAbsatz`.
> - **Rollout** aller **16 Forms** auf den Slot migriert (verhaltensneutral: `golden:vergleich`
>   byte-gleich; `gate` grün; visuell auf `/rechner/zpo-fristen` bestätigt). `BegruendungAbsatz`
>   wird damit nur noch vom Slot konsumiert.
> - **B2-2** Render-Test `src/tests/begruendungSlot.test.tsx`. **Bug-Check-Fund (behoben):**
>   `begruendungsAbsatz('')` lieferte ein blosses «.»; jetzt → leerer String → Slot rendert null
>   (Richtung Kritik-6; verhaltensneutral, da reale Engines stets Ergebnistext liefern).

## Phase 2 — Original-Schritte

**B2-0 `BegruendungSlot`** (neu, Kritik-Solo §10): rendert (a) den Absatz in der
UI **und** liefert (b) denselben String als Rückgabe für `pdfConfig.begruendung`
— **eine** Aufrufstelle pro Form, **ein** String. Macht das UI↔PDF-Konsistenz-Gate
strukturell überflüssig statt nachträglich erzwungen. *Beweis:* verhaltensneutral
(gleicher String wie heute) → B0-2-Goldens byte-gleich.

**B2-1 Copy-Mechanik** in einen kleinen geteilten `useKopieren(text)`-Helfer
auslagern (try/catch, «Kopiert ✓» erst nach Erfolg). **B2-2** Render-Test:
leerer/Negativ-Text → `null`; gültiger Text → Absatz + Button. *Beweis:* additive
UI-Tests; kein Golden betroffen.

## Phase 3 — Absatz im PDF-Bericht (kritischer Befund schließen) — ◐ B3-1 erledigt 28.6.2026 (Rollout = David-Entscheid #3)

> **Erledigt 28.6.2026 (B3-1, Kapazität, gebaut + gegated, nicht deployt):**
> `PdfDocConfig.begruendung?: string` + `buildPdfModel` rendert einen Block **«Für die
> Rechtsschrift»** (Absatz + sichtbarer Vorbehalt aus `BEGRUENDUNG_VORBEHALT`, §5/§8) **VOR
> dem Disclaimer**. Fehlt das Feld → Modell **byte-identisch** (53 `pdf.test`-Snapshots
> unverändert). Test `src/tests/pdfBegruendung.test.ts`.
>
> **Default-und-Flag (ROADMAP):** Die Kapazität ist die Flagge; der **Default ist AUS** —
> noch setzt KEINE Form `pdfConfig.begruendung`, die PDFs bleiben unverändert. Der **Rollout
> B3-2/B3-3 ist David-Entscheid #3** (PDF-Block an vs. Copy-nur-in-UI) und laut FAHRPLAN je
> Form ein eigener review-/committebarer Snapshot — daher **bewusst gated**, nicht im Stapel
> gesetzt. Sobald David #3 = «an» bestätigt: pro Form `begruendung` = derselbe String wie der
> `BegruendungSlot` (eine Quelle), Snapshot je Form.

## Phase 3 — Original-Schritte

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

## Phase 4 — Rollout auf die 7 offenen Rechner (Verdrahtung, kein Neubau) — ◐ B4-0 erledigt 28.6.2026

> **Erledigt 28.6.2026 (B4-0 Smoke-Abdeckung):** `RechnerProzesskosten` +
> `RechnerNotariatGrundbuch` (trägt Beurkundungs- + Grundbucheintrag-Tabs) in
> `scripts/smoke-render.tsx` ergänzt — rendern fehlerfrei. `RechnerTagerechner`
> (EinfacheFrist) war bereits abgedeckt.
> **Offen (decision-gated):** B4-1 (SchkgZust/StrafZust/GrundbuchEintrag an den Slot — adds
> UI-Absatz; prüfen, ob das `*Bericht()`-Ergebnis prosa-tauglich ist) · **B4-2 Kosten-Rechner =
> David-Entscheid #1** (Default: ausnehmen) · B4-3 EinfacheFrist (gemischte Engines, klären).

## Phase 4 — Original-Schritte

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

## Phase 5 — Qualitätssicherung & Vollständigkeits-Gate — ◐ B5-1 erledigt 28.6.2026

> **Erledigt 28.6.2026 (B5-1 Goldlist):** `src/tests/begruendungLinter.test.ts` deckt jetzt
> **14 Engines** mit gültigem, prosa-fähigem Ergebnis ab (0 Konventionsverstösse + nicht-leerer
> Normen-Satz + Schlusspunkt-Wächter). Negativ-/Validierungs-Ergebnisse rendern `null` (Slot,
> Kritik-6). **Offen:** B5-2 UI↔PDF-Konsistenz-Wächter — sinnvoll erst **mit** dem PDF-Rollout
> (David-Entscheid #3); solange der Default AUS ist, gäbe es nichts zu vergleichen.

## Phase 5 — Original-Schritte

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

## Offene David-Entscheide — Default-und-Flag gesetzt 28.6.2026 (warten auf Davids Bestätigung)

1. **Kosten-Rechner (B4-2):** Eigener «Kosten-Begründungs»-Text **oder** vom
   Rechtsschrift-Absatz ausnehmen? → **Default: Status quo unverändert.** Nicht-verdrahtete
   Kosten-Rechner (Prozesskosten/Beurkundung/Notariat) bekommen **keinen** Rechtsschrift-Absatz
   (konservative Option b); der bereits bestehende UI-Absatz von `GebvKosten` bleibt wie gehabt.
   Kein neuer Kosten-Prosa-Text ohne Davids Ja.
2. **`MAX_NORMEN=6`/«u. a.»:** → **Default: Kappung beibehalten, «u. a.» bleibt das sichtbare
   Kappungs-Signal.** (Unverändert; pro-Engine-Konfiguration erst auf Bedarf.)
3. **PDF-Absatz:** → **Default: AUS.** Kapazität gebaut (B3-1), aber keine Form setzt
   `pdfConfig.begruendung` — PDFs unverändert. Rollout erst auf Davids «an».
4. **SchKG-Zitierstil «Art. 31 SchKG i.V.m. …»:** → **Default: übernommen** (im benannten
   Feld `fristbeginnNorm`, B1-1). Unverändert lassbar oder später umformulieren.

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
