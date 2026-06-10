# Fahrplan: Grundlagen für eine praxistaugliche Kanzlei-Webseite

Stand: 10.6.2026 · Quelle: Plan-Runde mit David 8.6.2026 («das ist super,
speichere das als Anweisung an die nächste Session»). Dieses Dokument ist die
Repo-Fassung dieses Plans und wird hier gepflegt; Erledigtes markieren,
Gesamtstand in STRUKTUR.md spiegeln.

## Nordstern (Endziel, von David gesetzt)

> **Jede Schweizer Kanzlei kann LexMetrik im Alltag einsetzen, um die
> ermessensfreie, deterministische Rechtsarbeit — Fristen, Beträge/Quoten,
> Zuständigkeit, Form-Vorlagen — zu erleichtern und ihr abzunehmen, und kann
> den Ergebnissen vertrauen.**

Alles in diesem Plan ist diesem Ziel untergeordnet. Qualitäts-Gates,
Konsolidierung und Bibliothek sind nicht Selbstzweck, sondern **Fundament**,
das genau dieses Versprechen trägt.

## Scope-Rahmen (wichtig)

Die Webseite muss **nicht fertig** sein — sie ist im Aufbau, **nicht auf dem
Markt**; Launch kommt viel später. Jetzt werden die **Grundlagen so gelegt,
dass es später geht.** Daraus folgt:

- Markt-Themen (Hosting-Migration, Zahlungssystem, Domain, Login/Pro —
  HANDLUNGSPLAN A.2) bleiben **bewusst draussen**.
- Die §0a-Sperre (keine neuen Engines, HANDLUNGSPLAN §0a) **gilt weiter** —
  dieser Plan schafft die Struktur, baut aber jetzt keine neuen Engines.

## Entscheide David (Plan-Runde 8.6.2026)

1. Erste Grundlage = **«alles davon»**: alle vier Grundlagen parallel,
   gesteuert durch die Abdeckungskarte (G1), dependency-bewusst.
2. Ermessens-Grenze = **«Fall für Fall»**: G1 legt je Rechtsgebiet vor
   (rein / nur Hinweis / raus), **David entscheidet einzeln**.
3. **Code-Engine-Verschmelzung erlaubt** (übersteuert das alte §4-Verbot),
   aber strikt **Golden-gegated (§6)** und **regime-treu** (interne
   Verzweigung statt Kollaps). Darum kommt G2/A1 (Golden ins CI) VOR den
   G3-Merges. CLAUDE.md §4 wird entsprechend angepasst (G4.4).

## Die vier Grundlagen (alle parallel, G1 steuert)

```
                ┌──────────────────────────────────────────────┐
   G1  Praxis-Abdeckungskarte  ──steuert──►  was, wo, in welcher Reihenfolge
                └───────┬───────────────┬───────────────┬───────┘
                        ▼               ▼               ▼
   G2 Vertrauen     G3 Arbeitsplatz   G4 Wachstums-Grundlagen
   (härten→abnehmen) (Output/Auffind- (Bibliothek · Rahmen ·
        │            barkeit/Kantone)  Reglement · §4)
        │                  ▲
   A1 (Golden im CI) ──────┘ Voraussetzung für sichere Code-Merges (G3)
```

Reihenfolge trotz «alles davon»: **G1 startet sofort** (Analyse + Davids
Fall-für-Fall-Entscheide; definiert alle Ziele). **G2/A1 früh** (Golden ins
CI — auch Voraussetzung für G3-Merges). **G3 + G4 parallel** ab dann.
**G2-Abnahme** läuft fortlaufend, David-getaktet, priorisiert nach G1.

---

## G1 — Praxis-Abdeckungskarte (das steuernde Artefakt, NEU)

Eine systematische Karte der **ermessensfreien Alltagsaufgaben einer
Kanzlei**, gegen die das Produkt gemessen wird. Ersetzt die lose «~80
geplante Karten»-Liste durch praxiswertgetriebene Steuerung (löst die
Roadmap-Triage B.18 ab).

- [ ] **G1.1 · Aufgaben erfassen.** Je Rechtsgebiet (Zivilprozess, SchKG,
      Arbeit, Miete, Vertrag/Forderung, Erbrecht, Vorsorge, Gesellschaft,
      Straf, Verwaltung/Steuer/Sozial …) die wiederkehrenden deterministischen
      Aufgaben über die vier Ausgabetypen auflisten: **Fristen · Beträge &
      Quoten · Zuständigkeit/Einordnung · Vorlagen.**
- [ ] **G1.2 · Klassifizieren — Fall für Fall, David entscheidet.** Je
      Aufgabe ein Vorschlag:
      - ✅ **rein** — eigenes deterministisches Regime → Rechner/Vorlage
      - ◐ **nur Hinweis/Checkliste** — Wert vorhanden, aber Ermessen/Form-only
        (Präzedenz: beurkundungspflichtige Gründung, §8)
      - ✗ **raus** — reines Ermessen ODER vom generischen Werkzeug abgedeckt
        (Mehrwert-Test §0; z. B. StPO-Fristen ohne Gerichtsferien →
        Tagerechner genügt)
      Regime-Freiheit/Ermessens-Charakter **am Gesetz verifizieren**, nicht
      raten.
- [ ] **G1.3 · Ist-Stand spiegeln.** Je behaltene Aufgabe: abgedeckt
      (entwurf/geprüft) / geplant / Lücke — gegen `startseiteConfig.ts` +
      `bibliothek/register/engine-map.md`.
- [ ] **G1.4 · Priorisieren nach Praxiswert.** Häufigkeit im Kanzleialltag ×
      Risiko bei Fehlen (verpasste Frist = Haftung) × Determinismus-Klarheit
      → Rangliste der Lücken.

**Ergebnis** in `KATALOG-ROADMAP.md` (wird zur Praxis-Abdeckungskarte) +
Begründung je Streichung. Steuert G2-Abnahme-Reihenfolge, G3-Auffindbarkeit
und (nach §0a-Öffnung) die Bau-Reihenfolge.

---

## G2 — Vertrauen: Ergebnisse kanzleitauglich machen

Zwei Stränge — **erst härten, dann abnehmen** (Davids Reihenfolge).

### Phase A — Härten (technische Basis, §0a-konform, keine fachliche Abnahme)

- [x] **A1 · Golden-Outputs als committete Basis ins CI (Etappe F3.2).** ✓ 10.6.2026:
      Basis committet `golden/lexmetrik-golden.json` (87 Fälle), CI-Schritt
      `golden:vergleich` aktiv, Vergleich meldet geändert/neu/entfernt getrennt.
      `scripts/golden-outputs.ts` von `/tmp` auf eine **committete** Datei
      umstellen; CI-Schritt `npm run golden:vergleich` in
      `.github/workflows/ci.yml`; Kopf-Kommentar dort anpassen. → friert die
      Basis ein **und** ist Voraussetzung für sichere G3-Merges.
- [ ] **A2 · Determinismus mechanisch sperren (§2).** `eslint.config.js`:
      `Date.now()` / `Math.random()` / arg-loses `new Date()` in `src/lib/**`
      verbieten (UI/PDF ausgenommen).
- [ ] **A3 · Bekannte Testlücken schliessen.** Akzeptanztests für
      `rueckforderung`/`feststellung` (`src/tests/schkgZustaendigkeit.test.ts`)
      und Straf-Kaskade-Default `kaskade32=undefined`
      (`src/tests/strafZustaendigkeit.test.ts`); Latenz-Backlog
      (M-7/M-8/NIEDRIG) triagieren.

### Phase B — Abnehmen (David-getaktet, §7; nach A, fortlaufend)

Das **Status-Modell (entwurf/geprüft) ist das Vertrauenssignal**, das eine
Kanzlei liest. Heute 0 «geprüft» → kein Werkzeug ist mandatstauglich
ausgewiesen.

- [ ] **B1 · Abnahme-Reihenfolge = G1-Rangliste.** Die alltagswichtigsten,
      fertig gebauten Werkzeuge zuerst (Fristen-Familie, Kündigungs-Masken,
      Betreibungskosten).
- [ ] **B2 · Pro Werkzeug:** Verfallsregister-Parameter aktuell
      (`parameter-verfall.md`), NormRefs gegen Fedlex verifiziert, David
      Wort-für-Wort → Protokoll `abnahme/<id>.md` (Gate
      `src/tests/abnahmeGate.test.ts` ist scharf) → `verified:true` +
      `geprüft`. Nie automatisch.
- [ ] **B3 · Ehrlichkeit in der UI (§8).** Unsicherheiten, offene kantonale
      Verifikationen, Annahmen offen anzeigen — eine Kanzlei muss die
      Grenzen sehen.

---

## G3 — Arbeitsplatz-Tauglichkeit: in den Kanzleialltag einpassen

- [ ] **G3.1 · Mandatstauglicher Output (schliesst M-8).** Jedes Werkzeug
      bietet durchgängig PDF/DOCX mit **Aktenzeichen · Mandant · Gegenpartei**
      und Kanzlei-Formatierung. Heute fehlen PDF/Aktenzeichen/Teilen im
      Rechtsmittel-/SchKG-/Straf-Zweig — vereinheitlichen über den geteilten
      Export-Rahmen.
- [ ] **G3.2 · Auffindbarkeit & Übersicht (Konsolidierung, durch Praxisnutzen
      begründet).** `startseiteConfig.ts` + `katalogSuche.ts`: «ein Einstieg
      pro Rechtsfrage», Thema-Bündel, `szenarien[]`/`imKatalog:false`,
      Umlaut-Suche, sichtbare Kartenzahl weiter senken; Verb-Titel (E1.1) in
      einer Welle entscheiden. **Hier lebt auch die Code-Verschmelzung**
      (Davids Entscheid): strikt §6 — Golden vorher (A1) → mergen, Regimes
      **intern verzweigt statt kollabiert** → `golden:vergleich` byte-gleich.
      Risikoärmster Merge zuerst (Fristen-Infrastruktur `fristenEngine.ts`/
      `datumsUtils.ts` hinter den Regime-Engines).
- [ ] **G3.3 · Workflow-Kontinuität (Grundlage anlegen, nicht überbauen).**
      Vorbefüll-Brücken (`rechnerPermalinks.ts`) ausbauen; leichter
      **Fall-/Mandat-Kontext**, damit Parteien/Daten einmal erfasst über
      Rechner ↔ Vorlagen fliessen. Jetzt das Fundament/Datenmodell, nicht die
      volle Mandatsverwaltung.
- [ ] **G3.4 · Kantonale Passung («für jede Kanzlei»).** Vollständige &
      ehrliche kantonale Stammdaten — Gerichte (verifiziert),
      Betreibungsämter (gebaut), **Notariate** (`notariate-kantone.md` →
      verdrahten), **HR-Ämter** (`handelsregisteraemter-kantone.md`, nicht
      verdrahtet), Gebühren, Feiertage. Lücken ehrlich anzeigen.

**Kritische Dateien:** `startseiteConfig.ts`, `katalogSuche.ts`,
`fristenEngine.ts`/`datumsUtils.ts` + Regime-Engines, `rechnerPermalinks.ts`,
`src/components/vorlagen/{wizard,Dokumentmappe,ui}.tsx`,
`src/components/ui/{Tabs,SelectionGrid}.tsx`.

---

## G4 — Tragfähige Grundlagen für strukturiertes Wachstum

- [ ] **G4.1 · Bibliothek als Bau-Wissensbasis.** §11-Decision-Tree-Reife
      herstellen (zu gebauten Engines gehörende Dossiers zuerst,
      Eingabe→Ausgabe statt Prosa); Code↔Bibliothek **bidirektional**
      verdrahten (Kopf-Kommentar `// Dossier: …` je `src/lib`-Modul);
      «Dossier-only» + Abnahme-Blocker in `engine-map.md` sichtbar führen;
      `bibliothek-check.sh` schärfen (S6 Verfallsregister-Kandidat = Fehler
      statt Warnung; S9-Heuristik). Läuft im CI.
- [ ] **G4.2 · Geteilte Rahmen pflegen (§10).** Neue Werkzeuge nutzen
      wizard/Dokumentmappe/ui/Tabs/SelectionGrid + Export-Rahmen statt
      Kopien — fehlt ein Rahmen, erst den Rahmen (verhaltensneutral, §6).
- [ ] **G4.3 · Wachstums-Reglement (`WACHSTUM-REGLEMENT.md`, Repo-Root).**
      §0/§0a/§10 aus dem laufenden HANDLUNGSPLAN in ein stabiles Dokument
      heben: **Checkliste, die jeder künftige Einstieg besteht** — (1) Dient
      er ermessensfreier Kanzlei-Praxis (G1-klassifiziert)? (2) Mehrwert über
      generische Werkzeuge (§0)? (3) Rahmen vorhanden (§10)? (4) Bibliothek-
      Dossier (§11) + Abnahme-/Export-Pfad geklärt? Steuert den Bau ab
      §0a-Öffnung entlang G1.
- [ ] **G4.4 · CLAUDE.md §4 anpassen.** Code-Verschmelzung erlaubt **unter**
      §6-Golden-Protokoll + Regime-Treue; §1 (Korrektheit über allem) und §3
      (Schichtentrennung) unangetastet.

---

## Verifikation (End-to-End)

Nach jedem Schritt die Tore fahren — volle Ausgabe, nie `tail` (§6/§9):

```
npx tsc -b · npm test · npm run lint   # inkl. Date.now()-Regel (A2)
npm run build
npm run check                          # inventur · bibliothek · verfall · sweep · smoke
npm run golden:vergleich               # committet/gegated (A1) — byte-gleich
npm run check:netz                     # caches · zitate · fedlex-versionen
```

- **G1:** `KATALOG-ROADMAP.md` enthält die Abdeckungskarte mit
  Klassifizierung + Rangliste; jede Streichung begründet.
- **G2/A:** CI grün inkl. Golden-Schritt; Lint schlägt bei `Date.now()` in
  `src/lib/` an. **G2/B:** erste `abnahme/<id>.md`-Protokolle;
  `abnahmeGate.test.ts` grün für gehobene Karten.
- **G3:** Stichprobe Rechtsmittel-/SchKG-/Straf-Werkzeug bietet
  PDF+Aktenzeichen; sichtbare Kartenzahl gesunken; je Merge
  `golden:vergleich` byte-gleich; Smoke ok.
- **G4:** `check:bibliothek` Exit 0 (verschärft); `engine-map.md` 0 kaputte
  Verweise; `WACHSTUM-REGLEMENT.md` vorhanden; `src/lib`-Module tragen
  Dossier-Verweis.

**Deploy-Disziplin (§9):** Push & Deploy nur nach explizitem Ja von David,
davor Multi-Agent-Bug-Check über das Delta.
