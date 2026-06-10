# Fundamentalanalyse LexMetrik — 6.6.2026 (Nacht-Session)

Drei Prüfwellen über den gesamten Code (Basis: HEAD `0f9c1ec`), durchgeführt mit 18
unabhängigen Review-/Test-/Recherche-Agents. Nichts an Engines/UI verändert; einzige
Schreibzugriffe: `bibliothek/recherche/` (12 Dossiers + INDEX) und dieser Bericht.

**Welle 1 — Rechts-Audit** (13 Agents, früher am Abend): alle Engines + Datenschicht
gegen Fedlex-Caches und Regelwerke; ~283'000 empirische Kombinationen.
**Welle 2 — Fundamentalanalyse Code** (6 Agents): Architektur · UI↔Engine-Verdrahtung ·
Sicherheit · Code-Qualität · Performance/Bundle · Tests/Coverage.
**Welle 3 — Recherche** (12 Agents): Dossiers zu allen geplanten Engines →
`bibliothek/recherche/INDEX.md`.

## Gesamturteil

Substanziell gesunde, prinzipientreue Codebasis: strikte Schichtentrennung hält der
Leck-Suche stand, 0 npm-audit-Schwachstellen, 0× `any`, Initial-Load 87 kB gzip, alle
schweren Chunks lazy, Status-Modell ehrlich (0× «geprüft» vergeben), §2-Determinismus
repo-weit bestätigt. Die Befunde unten sind klar lokalisiert und fixbar.

> **NACHTRAG 6.6.2026 vormittags — Backlog abgearbeitet** (Commits `4d49d22`,
> `ba4a69f`, `3f8e531`, `9f2922a`; 633 Tests grün, Sweep/Zitate-Prüfer sauber):
> **Gefixt:** B1–B10 vollständig · alle NIEDRIG-Norm-Anker (Art. 241 ZGB,
> Art. 19 Abs. 2 VMWG — am Cache verifiziert, nicht Abs. 3!, Art. 102 Abs. 2
> statt 108, Etiketten, Kommentare) · tote Exporte · FehlerBox ·
> verified→adresseVerifiziert · html2canvas-Stub · Coverage-Top-Lücken
> (amt/zustellfiktion/Jahresfrist×Stillstand/Warnpfade/Tilgungs-Randfall).
> **Bewusst offen:** noUncheckedIndexedAccess (eigener deklarierter Schritt) ·
> Vorlagen-Render-Golden-Tests + 5 PDF-Domains (B11-Rest) · Prefetch-on-intent ·
> Arbeitsvertrag-normalisieren · Prozess-Punkte (JStPO-Cache, StPO-Aktualstand,
> Dienstjahr-Stichtag = fachliche Entscheidung David, SG-GKV 30.6.).

## BEFUNDE-BACKLOG (Stand Audit-Nacht; Fix-Status siehe Nachtrag oben)

### 🔴 HOCH

| # | Befund | Stelle | Quelle |
|---|---|---|---|
| B1 | **Art. 336c Abs. 1 lit. cbis/cter/cquinquies fehlen** im Sperrfristen-Modell (Hospitalisierung Neugeborenes / Urlaub hinterlassener Elternteil / Tod der Mutter) — weder modelliert noch als Lücke offengelegt (§8) | `sperrfristen.ts` + `types/legal.ts` | Rechts-Audit |
| B2 | **Wechselbetreibungs-Presets rechnen mit Betreibungsferien** — Art. 56 Ziff. 2 SchKG schliesst sie wörtlich aus; Repro: Fristende bis ~1 Woche zu spät (Verwirkung!). Fix: `modus: 'kein'` | `schkgPresets.ts:66/140/190` | Rechts-Audit |
| B3 | **`beschuldigteMinderjaehrig` im UI nicht erreichbar** — Jugendstrafverfahren erhält stillschweigend das Erwachsenen-Forum statt Art. 10 JStPO | `StrafZustaendigkeitTeil.tsx:52–67` | UI-Verdrahtung |
| B4 | **Kein ErrorBoundary**; PDF-/DOCX-Export-Buttons ohne try/catch → Unhandled Rejection ohne Nutzer-Feedback (inkl. des bewussten DOCX-Sperr-throws) | `App.tsx` · `PdfExport.tsx:11` · `wizard.tsx:301/307` | Code-Qualität |

### 🟡 MITTEL

| # | Befund | Stelle |
|---|---|---|
| B5 | KTG-Gleichwertigkeits-Checkliste: Kriterium `alleRisikenAbgedeckt` nie verdrahtet — der `=== false`-Zweig der Engine feuert nie (§8) | `LohnfortzahlungForm.tsx:195–225` |
| B6 | Google-Fonts-CDN (Fraunces) = einziger externer Laufzeit-Request, widerspricht «kein Tracking»; lokal hosten, dann strenge CSP trivial (Vorschlag im Sicherheits-Audit) | `index.html:7–12` · `vercel.json` |
| B7 | Schlichtungs-Adressen doppelt gepflegt (Rechner vs. Vorlagen) — einziger echter §5-Bruch; kanonische Adress-Registry empfohlen | `data/schlichtungsstellen.ts` vs. `vorlagen/behoerden.ts` |
| B8 | `verzugszins.ts`: `tageTotal` überzählt bei vollständiger Tilgung mid-period (Zinsbetrag korrekt, Kennzahl falsch) | `verzugszins.ts:~265` |
| B9 | `verjaehrung.ts`: Art.-137-Abs.-2-Kappung (selbständige 10-J.-Frist) — offengelegt, aber bei Delikt+Urteil zu frühes Datum; Varianten-Ausweis empfohlen | `verjaehrung.ts:~336` |
| B10 | Sperrfristen Schwangerschaft: Text suggeriert «+16 Wochen»-Berechnung, Code übernimmt Nutzereingabe ungeprüft — Niederkunftsdatum als Input + deterministische 112-Tage-Rechnung | `sperrfristen.ts:~113` |
| B11 | Test-Lücken (fachlich riskanteste): `lohnfortzahlung grund='amt'` (einziger ungetesteter Rechtsfolgen-Zweig) · `zustellfiktion()` Art. 138 III · Jahresfrist×Stillstand-`[UNGEKLÄRT]` · Vorlagen-Render-Schicht 0–31 % · 5 PDF-Domains ohne Golden-Tests (Top-10-Liste im Coverage-Audit) | `src/tests/` |

### 🟢 NIEDRIG (Feinschliff)

- Norm-Anker: `Art. 221 → 241 ZGB` (erbteilung, Gesamtgut-Hälfte) · «Art. 19a VMWG» →
  **Art. 19 Abs. 3 VMWG** (mietvertrag.ts:240 — durch Recherche aufgelöst, Vorbehalt
  streichbar) · «Art. 108 Ziff. 1» beim Verfalltag prüfen (dogmatisch eher allein
  Art. 102 Abs. 2; Test zementiert den Verweis)
- (Praxis)-Markierungen StPO: Art. 34 Abs. 2-Zusatz und Art. 40 Abs. 1-Beschwerdefähigkeit
- Art. 279 Abs. 2 SchKG (Prosequierung bei Rechtsvorschlag) nicht abgebildet
- Verrutschter Kommentar `bundKlagerecht … // nur bei persoenlichkeit` (zustaendigkeit.ts:114)
- 10 tote Exporte (Liste im Code-Qualitäts-Audit) · 2 inline-Fehlerlisten statt `FehlerBox`
- Performance-Shortlist: Cache-Header `/assets` (immutable) · html2canvas per Vite-Alias
  aus dem Build · Fraunces self-host (= B6) · Prefetch-on-intent für PDF-Chunk ·
  `noUncheckedIndexedAccess` als eigener deklarierter Schritt
- `verified:true` in schlichtungsgesuchBs.ts meint Adress- nicht Norm-Verifikation → umbenennen
- Arbeitsvertrag-Wizard ohne `normalisieren`-Härtung (bei Enum-Änderung Key auf `.v2`)

### ⚪ Prozess / terminiert

- **SG-GKV läuft 30.6.2026 aus** (Erinnerung existiert bereits)
- Art. 10 JStPO und Skalen-Stufen (Lohnfortzahlung) nicht am Cache verifizierbar — vor `verified:true` prüfen
- StPO-Cache ist Stand 1.1.2024 — Aktualität vor Straf-Ausbau prüfen (Dossier V-0)
- Dienstjahr-Stichtag Kündigungsfrist (Zugang vs. Beendigung): Lehre gespalten, Code folgt
  h.M. (Zugang) ohne Offenlegung — **fachliche Grundsatzentscheidung David**

## In dieser Nacht bereits erledigt verifiziert (durch Parallel-Session gefixt)

Art.-5-lit.-d-Lücke (`bundKlagerecht`, beide Prädikate + Tests symmetrisch) ·
RM-Validierungs-Asymmetrie · STWE als eigener Schuldnertyp · sw=null-Warntext
(eigene Weiche) · Art.-24-Warnung (Abs. 2 lit. b + Abs. 3 als Rechtsfolge) ·
Adress-Gesamtprüfung · GR-PLZ-Kette.

## Entwarnungen (geprüft, sauber — Auswahl)

Alle Schwellen-Semantiken wortlautgenau · Pflichtteile Rev. 2023 exakt · Σ Erbquoten
bruchexakt = 1 (402 Konstellationen) · Form-Gate-Matrix der Vorlagen lückenlos ·
Fristen-Stillstände ZPO/SchKG exakt inkl. Art. 63 · Computus 8 Jahre korrekt ·
PDF/DOCX-Pipeline injektionssicher (empirisch: Emoji/RTL/Zalgo/10k-Strings/XML-Injection) ·
localStorage durchgehend defensiv, Engines nie aus Storage gespeist · Zustands-Hygiene
der Formulare ohne «klebende» Felder · Routing vollständig (404 vorhanden) · LIK-Reihe
basisinvariant · kein Date.now()/Math.random in Rechenlogik · Bundle-Architektur sauber
lazy (87 kB gzip initial).

## Empirie-Bilanz

| Lauf | Umfang | Ergebnis |
|---|---|---|
| Protokoll §6 (tsc · test · lint · build) | ganzes Repo | grün (616 Tests) |
| logik-sweep.ts | 10'152 Kombinationen | 0 Widersprüche |
| norm-zitate-pruefen.ts | 232 Zitate | 0 Befunde |
| Zuständigkeits-Raster (Welle 1) | ~272'000 Kombinationen | 0 Engine-Fehler |
| Numerik-Raster alle Engines | ~11'000 Kombinationen | 0 Fehler |
| Fristen-Randfälle | 56 + 61 Checks | PASS |
| Coverage | lib meist >90 % Branch | Lücken → B11 |

Repro-Skripte liegen unter `/tmp/` (lexmetrik-*, t_*, review_fristen, lexcheck/lexdata/fedcheck).
