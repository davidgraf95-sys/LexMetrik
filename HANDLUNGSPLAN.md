# Handlungsplan (Stand 6.6.2026 spätabends — 2. Fassung, auf Auftrag David)

Priorisiertes weiteres Vorgehen nach der Abend-Session (Art.-63-Fixes ·
Feiertage-Doppelcheck · Katalog-Split · Rechtsmittel-Fahrplan · Bibliothek
komplett · Gesamt-Check durch 2 unabhängige Review-Agents bestanden).
Gepflegt wird dieser Plan NUR hier; erledigte Punkte durchstreichen oder
löschen, Stand in STRUKTUR.md spiegeln.

## A · Entscheide, die nur David treffen kann (blockieren anderes)

1. **Push (freigegeben) + DEPLOY-Ja:** Stand `dfab948` ist gepusht; seither
   9 NEUE ungepushte Commits (Wizard-Dialog, Vorlagen-Verweis, Design,
   Masken 1a+1b, Katalog-Umzüge, 2 Logik-Check-Fixes). Suite 772 grün,
   Logik-Check des Wizard-Umbaus bestanden (1 HOCH-Lint-Befund gefixt).
   **Prod-Deploy steht weiter aus** (Berechtigungs-Gate hat «ja» nur als
   Push-Freigabe gewertet — Deploy separat bestätigen oder
   `! npx vercel --prod` tippen).
2. **Hosting & Zahlungsmittel (vor Login-/Pro-Phase):** Migration zu CH-Host
   (Empfehlung Infomaniak), Domain **lexmetrik.ch früh registrieren**;
   Zahlungssystem offen (PayPal raus) — Payrexx/Datatrans/TWINT prüfen.
3. **Fachliche Abnahmen** (alles bleibt `entwurf`/`verified:false` bis
   Wort-für-Wort-Durchgang — Davids Entscheid 5.6.2026): 8 Vorlagen,
   NormRefs, 19 Recherche-Dossiers (neu dazu: Eheschutz/GlG, BGG-Beschwerde,
   Feiertags-Matrix `normen/feiertage-kantone-bj.md`).
4. **Offene Grundsatzfragen** (gesammelt): Dienstjahr-Stichtag Kündigungsfrist
   (Zugang [Ist] vs. Beendigung) · Sperrtage-ANZEIGE-Konvention ·
   3 Export-Antworten (Verzugszins-Hinweis kürzen? DOCX-Standardannahmen?
   Bausteinprotokoll in Exporte?) · BGG-Dossier «Offene Fragen» 1–7 (V-1
   Eheschutz-Warnung ist seit 6.6.2026 als WARNUNG verdrahtet — Abnahme).

## B · Baufertig spezifiziert (Reihenfolge = Empfehlung)

4a. ~~Zuständigkeits-Wizard~~ → **LIVE** (`a64c5ab`, Logik-Check bestanden)
   inkl. Vorlagen-Verweis am Fahrplan-Ende (`518f996`, auch für geplante
   Vorlagen). Offen daraus (NIEDRIG): UX-Hinweis im leeren Ergebnis-Schritt
   («Streitwert ergänzen»); Prefill-Brücke für klage-vereinfacht (neue
   Kodier-Funktion in lib) — s. D.

5. **Kündigungs-Masken** (Spez. `recherche/kuendigungs-masken.md`):
   ✅ M1–M9 geteilte Module · ✅ 1a Arbeitnehmer:in (free, `9165094`) ·
   ✅ 1b Arbeitgeber:in (Sperrfristen-Blocker, `1714319`) ·
   🔨 2a Mieter:in (Schema fertig im Working Tree — Seite/Karte/Tests offen) ·
   ⬜ 3 Allgemein+Presets (VVG-Verifikations-TODOs offen!) ·
   ⬜ 2b Vermieter-Checkliste (§8-Grenze).
6. **Untermietvertrag** — Spezifikation `recherche/untermietvertrag.md`
   (baufertig; Weiche in mietvertrag.ts existiert schon).
7. **Eheschutz + GlG in der Zuständigkeits-Engine** — Dossier
   `recherche/eheschutz-glg-zustaendigkeit.md`: 4. Verfahrensart
   `summarisch`, Streitsache Eheschutz (Art. 23/198 lit. a/271/314 Abs. 2),
   GlG-Verwaltungsweg-Hard-Stop (Art. 13 GlG).
8. **BGG-Ausbau Stufe 2** — aus `recherche/bgg-beschwerde-engine.md` noch
   nicht verdrahtet: Sonderfristen Art. 100 Abs. 2/3 (SchKG-Aufsicht 10 T.,
   Wechsel 5 T.), Streitwertberechnung Art. 51 (Kapitalisierung 20×),
   Schiedsgericht Art. 77, Anschluss an den SchKG-Rechtsweg.
9. **Quick-Wins** (recherche/INDEX-Priorisierung): Streitwert-Rechner ·
   GebV-SchKG-Kostenrechner · 336b-Fristen · Vorlage «Mahnung» (free).

## C · Pflege & Termine (Verfallsregister: `bibliothek/register/parameter-verfall.md`)

10. **30.6.2026** — SG-GKV-Divergenz prüfen (Erinnerung existiert bereits).
11. **Anfang Sept. 2026** — Referenzzins (quartalsweise).
12. **1.11.2026** — BE-Formularpflicht (dynamisch).
13. **Vor Mietvertrags-Abnahme** — VMWG-Art.-19a-Diskrepanz am Original klären.
14. **Feiertage:** je Kanton gegen geltendes kantonales Recht, bevor ein
    Fristen-Eintrag auf «geprüft» geht (BJ-Liste = Stand 2011; Matrix-Dossier
    ist die Arbeitsgrundlage).

## D · Klein-Backlog (NIEDRIG, gelegentlich)

15. Review-Befund N-1: Direktklage-Eingabe (Art. 8 ZPO) unter CHF 100'000
    plausibilisieren (Hinweis statt stiller Akzeptanz).
15a. Logik-Check 6.6. spätabends: leerer Ergebnis-Schritt im Wizard ohne
    Hinweis (Streitwert nachträglich geleert) · klage-vereinfacht-Verweis
    ist BS-betitelt unabhängig vom Kanton (vorbestehend) · ungenutzte
    @fontsource/fraunces-Dependency entfernen.
16. Stabile Keys in 7 Listen-Editoren (Voll-Audit 5.6.) · Datepicker-
    Pfeiltasten (A11y) · Markenschriften in Vorlagen-PDFs ·
    Detailseiten-Titel an Katalog-Titel angleichen.
17. Phase 4 Experten-Gating (Header-Button als Andockpunkt) — hängt an A.2.
