# FAHRPLAN — Notariats- & Grundbuchkosten-Rechner (Ultra-Effort)

**Anlass:** Direktive David (15.6.2026) — nach dem Prozesskosten-Cockpit die
**Notariats- und Grundbuchgebühren** als nächste Kosten-Domäne erschliessen,
«von Anfang an richtig» mit Deep Research und doppelter Verifikation. Jeder Wert
mit **amtlicher Quelle** (Erlass + Artikel/§ + Link + Stand). Disziplin: §1
Korrektheit · §2 Determinismus (Promille/Staffel, keine Schätzung) · §3 Logik in
`src/lib`/`src/data`, keine Rechtslogik in der UI · §7 amtlich verifizieren · §8
Ehrlichkeit (freies Notariat / Verhandlungstarif → Rahmen, kein Scheinwert) ·
§9 Push/Deploy nur auf Davids frisches Ja · §11 Recherche → Bibliothek.

---

## 1. Domänen-Abgrenzung (was der Rechner abdeckt)

Leit-Anwendungsfall (praxisdominierend): **Grundstückkauf / Handänderung** —
«Was kostet der Erwerb einer Liegenschaft an Notar, Grundbuch und Steuern?».
Vier Kostenblöcke, strikt getrennt:

1. **Beurkundungsgebühr (Notariat)** — öffentliche Beurkundung des Grundstück-
   kaufvertrags (Art. 657 Abs. 1 ZGB / Art. 216 Abs. 1 OR: öffentliche Beurkundung
   zwingend). Kantonaler Notariatstarif, i. d. R. **Promille des Kaufpreises mit
   Degression**.
2. **Grundbuchgebühr** — Eintrag der Eigentumsübertragung ins Grundbuch.
   Kantonaler Grundbuchgebühren-Tarif, i. d. R. **Promille des Kaufpreises**.
3. **Grundpfand (optional)** — Errichtung/Eintrag eines Register-Schuldbriefs
   (Hypothek): Beurkundung + Grundbucheintrag, **Promille der Pfandsumme**.
4. **Handänderungssteuer (separat, ehrlich als STEUER ausgewiesen)** — kantonale/
   kommunale Steuer auf die Handänderung; einige Kantone erheben **keine** (z. B.
   ZH, ZG, SZ, AG, GL, UR, SH, NW, OW — zu verifizieren), andere bis ~3,3 %.
   KEINE Gebühr → klar getrennt anzeigen, optionaler Block.

**Bewusst (vorerst) ausserhalb:** Beurkundung von Ehe-/Erbverträgen, Gesellschafts-
gründungen (Teil-Dossier existiert: `notariatstarife-gruendung-kantone.md`),
Dienstbarkeiten, Erbteilungen — als spätere Erweiterung über dieselbe Engine.

## 2. Schweizer Notariatssysteme (prägt die Tarif-Modellierung)

- **Amtsnotariat** (Notar = Staatsangestellter, fixer Tarif): u. a. ZH, SH, einzelne.
- **Freies/unabhängiges Notariat (lateinisch)** (selbständige Notare, kantonaler
  Tarif teils mit Bandbreite/Verhandlung): GE, VD, VS, TI, NE, JU, FR, BS, BL u. a.
- **Gemischtes System:** z. B. BE, SG, GR, LU (teils Bezirks-/Amts-, teils frei).
- **Folge für §2/§8:** Wo ein **fester Promille-/Staffeltarif** gilt → deterministisch
  (`promille`/`staffel_sockel_prozent`). Wo **Bandbreite/Verhandlung** → `rahmen`
  bzw. `formel_extern` mit ehrlichem Hinweis. NIE einen Verhandlungstarif als
  Punktwert ausgeben.

## 3. Architektur (spiegelt die bestehenden Tarif-Rechner)

- **Datenschicht** `src/data/tarif/notariat.ts` + `src/data/tarif/grundbuch.ts`
  (+ ggf. `handaenderungssteuer.ts`): je Kanton `KantonalerTarif`-artige Einträge
  (Erlass, Artikel/§, quelleUrl, stand, verifiziert, Regel via `tarif/staffel`).
  Wiederverwendung des Primitivs `src/lib/tarif/staffel.ts` (promille/staffel_*
  /rahmen/formel_extern) — KEIN neues Rechen-Primitiv (§4/§10).
- **Engine** `src/lib/notariatGrundbuch.ts`: dünner Lader, Eingabe
  { kanton, kaufpreisCHF, pfandsummeCHF?, mitGrundpfand? }, Ausgabe je Block
  Betrag/Spanne + Quelle + Gesamtkosten. Reine Funktion, deterministisch.
- **UI** `src/components/forms/NotariatGrundbuchForm.tsx` + Seite
  `src/pages/RechnerNotariatGrundbuch.tsx` + Eintrag in `startseiteConfig.ts`
  (Rechtsgebiet «Immobilien / Grundstückkauf»), Route `/rechner/notariat-grundbuch`.
  Reine Darstellung (§3), Aktenzeichen + PDF-Bericht wie die anderen Rechner.

## 4. Recherche-Etappen (Deep Research, je Wert amtliche Quelle)

Pro Kanton zu erheben (amtlicher Erlass-Volltext, kein Sekundärquellen-Wert):
- **N. Notariatstarif Grundstückkauf:** Erlass (Notariatsgebühren-VO/Tarif),
  Artikel/§, Promille-/Staffelregel über Kaufpreis, Mindest-/Höchstgebühr,
  System (Amts-/frei), Stand. Stützstellen 500'000 / 1'000'000 nachrechnen.
- **G. Grundbuchgebühr Eigentumsübertragung:** Erlass (Grundbuchgebühren-VO),
  Artikel/§, Promille des Kaufpreises, Min/Max, Stand.
- **P. Grundpfand:** Beurkundung + Grundbucheintrag Schuldbrief, Promille der
  Pfandsumme (oft tiefer als Eigentums-Promille).
- **H. Handänderungssteuer:** erhebt der Kanton? Satz (%), Bemessung, Erlass,
  Befreiungen (selbstbewohntes Eigenheim etc. nur Hinweis). KLAR als Steuer.

**Vorgehen:** Fan-out-Recherche in Kanton-Clustern (je Agent 4–6 Kantone),
strukturierte Rückgabe mit amtlichem Link + Artikel + Stand; danach
**unabhängiger Doppelcheck** (zweiter Pass) der bezifferten Werte gegen die
amtlichen Volltexte (wie bei Schlichtung/NV). Ergebnis als Bibliotheks-Dossier
`bibliothek/kosten/notariat-grundbuch-kantone.md` (§11, INDEX-Eintrag).

## 5. Determinismus & Ehrlichkeit (§2/§8)

- Fester Tarif → deterministischer Betrag (Promille/Staffel, mit Min/Max-Klammer).
- Bandbreite/Verhandlung/freies Notariat → `rahmen` (Spanne) bzw. `formel_extern`
  («nach Vereinbarung/Aufwand», Stundenansatz im Hinweis).
- Handänderungssteuer immer als **separater, als Steuer bezeichneter** Block;
  kantonale Befreiungen nur als Hinweis (nicht beziffert, einzelfallabhängig).
- Verifikationsstand je Eintrag: `recherche` → erst nach Doppelcheck `doppelt`;
  NIE `geprüft` ohne Davids Wort-für-Wort-Abnahme (§7).

## 6. Verifikation (doppelt — «überprüfen und nochmals überprüfen»)

1. Recherche-Pass (Cluster-Agenten) → Datenschicht codieren.
2. Unabhängiger Doppelcheck-Agent gegen amtliche Volltexte (Beträge/Artikel/Stand).
3. Adversarialer Code-/Fach-Review der Engine + handnachgerechnete Stützstellen.
4. Erschöpfender Konstellations-Sweep (alle Kantone × Kaufpreis-Matrix, kein Crash,
   Monotonie, §8-Ehrlichkeit) als bleibender Test.
5. Gate voll grün (tsc/vitest/golden/lint/check) je Etappe.

## 7. Reihenfolge / Etappen

- **NG-0 (Plan):** dieses Dokument.
- **NG-1:** Architektur-Gerüst — Engine + Datenschicht-Typen + leere/teilbefüllte
  Datenschicht für eine erste Tranche Kantone (deterministische Amtsnotariat-Kantone
  zuerst), Tests, Gate. Kein neues Primitiv.
- **NG-2:** Deep-Research-Fan-out alle 26 Kantone (N/G/P/H) + Dossier.
- **NG-3:** Datenschicht alle 26 Kantone codieren (amtliche Quelle je Wert).
- **NG-4:** Doppelcheck-Pass + Korrekturen → `doppelt`.
- **NG-5:** UI-Rechner + Startseiten-Eintrag + PDF-Bericht.
- **NG-6:** Adversarialer Review + Sweep + Gate; STRUKTUR/INDEX nachführen.
- **Push/Deploy:** erst auf Davids frisches Ja (§9).

Nichts trägt `geprüft` bis zu Davids Abnahme. Jeder Wert mit amtlichem Link.
