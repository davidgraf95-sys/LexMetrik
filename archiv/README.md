# Archiv — abgeschlossene Fahrpläne und historische Dokumente

**Angelegt 10.6.2026** (Auftrag David: Root aufräumen und klar strukturieren).
Regel: Im Repo-Root liegen nur AKTIVE Steuerungsdokumente; ein Fahrplan
wandert hierhin, sobald alle Etappen umgesetzt sind (offene Abnahmen David
werden im `HANDLUNGSPLAN.md` gespiegelt, nicht hier). Dateinamen bleiben
unverändert, damit Verweise in Code-Kommentaren und Commit-Messages
auffindbar bleiben (`grep <name>`).

| Dokument | Inhalt | Status bei Archivierung |
|---|---|---|
| [FAHRPLAN-EINE-HAUPTSEITE.md](FAHRPLAN-EINE-HAUPTSEITE.md) | Aufhebung der Free/Pro-Zweiteilung | UMGESETZT 7.6.2026 (`2e80daf` ff.) |
| [FAHRPLAN-STARTSEITE-UEBERSICHT.md](FAHRPLAN-STARTSEITE-UEBERSICHT.md) | Startseite übersichtlicher (U1–U…) | UMGESETZT 7.6.2026 (`3a00d48`) |
| [FAHRPLAN-KATALOG-UI.md](FAHRPLAN-KATALOG-UI.md) | Katalog-/Auswahl-UI (Suche, Anliegen-Zeile, related-Graph) | Etappen umgesetzt; E2-Anliegen-Liste = Entwurf, Abnahme David offen (HANDLUNGSPLAN) |
| [FAHRPLAN-KATALOG-KONSOLIDIERUNG.md](FAHRPLAN-KATALOG-KONSOLIDIERUNG.md) | Ein Einstieg pro Rechtsfrage (35→28 Karten) | UMGESETZT 7.6.2026 (`357527b`) |
| [FAHRPLAN-PRAXIS.md](FAHRPLAN-PRAXIS.md) | Praxistauglichkeit bestehender Engines (inkl. Fristenspiegel 3.1) | Etappen 1–3 VOLLSTÄNDIG; Pflege nach `bibliothek/recherche/fristenspiegel-konzept.md` |
| [FAHRPLAN-FRISTEN-EINHEIT.md](FAHRPLAN-FRISTEN-EINHEIT.md) | EIN Fristenrechner-Erlebnis (FE-1–FE-6) | UMGESETZT + DEPLOYED 10.6.2026; Abnahme WARUM-Sätze offen (HANDLUNGSPLAN) |
| [FAHRPLAN-STRUKTUR-UMBAU.md](FAHRPLAN-STRUKTUR-UMBAU.md) | Vorlagen-Taxonomie, Zuständigkeit vierteilig, Fristen-Zweiteilung (S-1–S-6) | UMGESETZT 10.6.2026; fachliche Abnahme der Zuordnungen offen (Schlussabschnitt + HANDLUNGSPLAN) |
| [BUGCHECK-SG-KV-2026-06-10.md](BUGCHECK-SG-KV-2026-06-10.md) | §9-Bug-Check-Protokoll Schlichtungsgesuch-Umbau + Klage-Kantonsausbau | abgeschlossen, alle 11 Befunde gefixt (`0e3c90f`/`e45115e`) |
| [ZUSTAENDIGKEIT-AUFTRAG.md](ZUSTAENDIGKEIT-AUFTRAG.md) | Ursprungs-Spezifikation der Zuständigkeitsengine (5.6.2026) | Engine längst gebaut; historisch |
| [UMBAU-NOTIZEN.md](UMBAU-NOTIZEN.md) | Bestandsaufnahme vor dem Umbau «Berechnen und Erstellen» (4.6.2026) | historisch |
| [fundamentalanalyse-2026-06-06.md](fundamentalanalyse-2026-06-06.md) | Fundamentalanalyse Nacht-Session 6.6.2026 (18 Agents) | historisch; Befunde in HANDLUNGSPLAN übernommen |
| [legalcalc-review.md](legalcalc-review.md) | Juristisches Review-Dokument Modul 1 Arbeitsrecht (3.6.2026) | überholt durch bibliothek/ (§11) |
| [STRUKTUR-SESSIONKARTEN.md](STRUKTUR-SESSIONKARTEN.md) | Rotierte Session-Karten aus STRUKTUR.md (laufend, byte-genau verschoben; Pflegeregel im Kopf von STRUKTUR.md) | angelegt 11.6.2026 (Token-Disziplin T-4) |
| [FAHRPLAN-DESIGN.md](FAHRPLAN-DESIGN.md) | Design-System/Visueller Feinschliff (Etappen, axe-Stichprobe) | ERLEDIGT 10.6.2026 abends (31 Etappen abgehakt) |
| [FAHRPLAN-RECHNER-DESIGN.md](FAHRPLAN-RECHNER-DESIGN.md) | Rechner-Design-Vereinheitlichung D1–D6 | UMGESETZT + ABGENOMMEN David 11.6.2026 (E-1–E-5 ohne Auflagen; offen nur Push §9) |
| [FAHRPLAN-VEREINHEITLICHUNG.md](FAHRPLAN-VEREINHEITLICHUNG.md) | Engine-/Datums-Entdopplung V1–V5 (geteilte Infrastruktur) | UMGESETZT 10.6.2026; V2 bewusst abgebrochen, V5 zurückgestellt (Wiedervorlage mit §0a-Öffnung) |
| [FAHRPLAN-TOKEN-DISZIPLIN.md](FAHRPLAN-TOKEN-DISZIPLIN.md) | Token-Disziplin T-1–T-4 (gate-Wrapper, STRUKTUR-Rotation, Diagnose-Sparsamkeit) | UMGESETZT 11.6.2026 (operative Regeln in STRUKTUR-Kopf + Lektionen gespiegelt) |
| [FAHRPLAN-AG-GRUENDUNG.md](FAHRPLAN-AG-GRUENDUNG.md) | Komplett-Überarbeitung AG-Gründungsmaske (Bargründung/qualifiziert, 194 Bausteine, 13 Schemas) | Programm ABGESCHLOSSEN 7.6.2026 (`fb0b2f1` ff.); Davids Wort-für-Wort-Abnahme: ABNAHME-AG-BAUSTEINE.md; offene Geld-Invarianten-Härtung im Sweep als Backlog |
| [FAHRPLAN-REVIEW-DURCHGANG-2026-06-24.md](FAHRPLAN-REVIEW-DURCHGANG-2026-06-24.md) | Live-Durchgang David: 13 UI/Daten-Punkte + BGE-Darstellung vereinheitlicht | UMGESETZT + PROD-DEPLOY 24.6.2026 (alle 13 Punkte, `da8524f`, `dpl_Dzdq5PpC…`) |
