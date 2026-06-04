# LexMetrik — Struktur & aktueller Stand

**Verbindliche Grundprinzipien: `CLAUDE.md`** (§1 Logik vor allem; §6
Refactoring-Protokoll) — dieses Dokument hier beschreibt den Zustand.

**Stand:** 5. Juni 2026 (Verschlankungs-Session, uncommittet).
**Produktion:** https://lexmetrik.vercel.app (Vercel-Projekt `lexmetrik`;
`legal-calc.vercel.app` = 308-Redirect). Marke: **LexMetrik** (grosses M).

## Verifikationsstand (eine Zeile)

Build ✓ · Lint 0/0 ✓ · 338 Tests in 18 Dateien (2 skipped) ✓ — Workflow:
`npx tsc -b` · `npm test` · `npm run lint` (volle Ausgabe lesen, nicht
`tail -1`!) · `npm run build`; vor Deploys unabhängige Review-Agents.
SSR-Smoke-Test aller Seiten: `npx vite-node scripts/smoke-render.tsx`.

## Verschlankung 5.6.2026 (verhaltensneutral, Review ohne Befunde)

**Code-Splitting:** Alle Routen `React.lazy` (App.tsx, Suspense in der
Shell); jsPDF wird erst beim PDF-Klick geladen (dynamic import, Muster wie
DOCX). Hauptbundle **1'187 → 230 kB** (gzip 349 → 71); jede Seite eigener
Chunk. Banner-Texte/-Typ dafür nach `lib/vorlagen/banner.ts` gelöst
(vorlagenPdf re-exportiert).

**Geteilte Wizard-Infrastruktur** (für die Skalierung auf 50+ Vorlagen):
`components/vorlagen/useWizardState.ts` (Antworten + optionale
localStorage-Sicherung mit `normalisieren`-Callback, Schritt, Gate-,
Kopier-State; ohne `speicherKey` garantiert storage-frei → Schlichtung BS)
· `lib/vorlagen/vorlagenText.ts` (`dokumentAlsText` — dritter Renderer
neben PDF/DOCX aus derselben Quelle) · `Field`/`Stepper`/`inputCls` überall
aus `components/vorlagen/ui.tsx` (10 lokale Kopien entfernt; Typografie auf
body-s-Label/xs-Hint vereinheitlicht) · `lib/kantone.ts` (zentrale
KANTONE-Liste, amtliche Reihenfolge; bewusst abweichende Listen blieben
lokal).

**Generischer Wizard-Rahmen** (`components/vorlagen/wizard.tsx`):
`VorlagenWizardRahmen` (Kopf mit Rückweg/Normen/Badge/Speicher-Fussnote,
Stepper, zweispaltiges Layout, Fehlerbox, Zurück/Weiter; `weiterDeaktiviert`
überschreibbar für Stopp-Karten) · `VorschauPanel` (Live-«Papier» +
Bausteinprotokoll; `kompakt`, `extra`-Slot z. B. Pflichtteile,
`nichtAufgenommen`-Liste) · `ExportLeiste` (PDF/DOCX lazy + Kopieren;
DOCX nur wo Formvorschrift es zulässt). **Eine neue Vorlage liefert nur
noch: Schema (lib/vorlagen/), SCHRITTE, fehlerImSchritt, Schritt-Inhalte,
Gates-Anzeige im Prüfen-Schritt und die Rahmen-Props.** Die 4 Seiten sind
323–479 LOC (vorher 451–587). Session-Bilanz: −585 LOC netto, Hauptbundle
−80 %; alles verhaltensneutral (2 unabhängige Reviews ohne Befunde,
SSR-Smoke aller Seiten, Tests/Lint unverändert grün).

## Informationsarchitektur (Entscheide bestätigt)

**Modus = In-Page-Toggle, Stufe = Route.** Die Primärweiche «Rechner |
Vorlagen» sitzt als Segmented Control prominent **unter dem Hero** (Zustand
in `?modus=`; Zähler beider Zellen identisch, Verben auf gemeinsamer
Grundlinie). Die Stufe ist Route: `/` = Default (Laien), `/fachpersonen` =
gekapselter Expertenbereich. **Der frühere Stufen-Umschalter im Header ist
aufgelöst** (Iteration 3): rechts aussen ein gerichteter Button «Für
Fachpersonen →» bzw. auf der Expertenseite «← Allgemein» (trägt `?modus=`
weiter) — natürlicher Andockpunkt für den späteren Zugriffs-Wrapper
(Login/Bezahlung, Phase 4 offen). Header = Zwei-Zonen (Logo links,
Aktionscluster rechts: ⌘K · Sprache · Methodik · Über · Stufen-Button),
Mitte leer; Utility-Bar nur Pflichthinweis rechts, mobil ausgeblendet.

**Layout:** Inhaltsspalte einheitlich `max-w-content` = **70rem (~1120px)**
(Token in tailwind.config); 8-px-Skala `--space-1…24`, `--control-h` 44px,
`--pill-h` 36px. Hero text-geführt einspaltig (keine Deko-Grafik, bewusst
nicht animiert), Untertext ≤ 58ch; Determinismus-Claim genau EINMAL (Hero).
Kartenraster `repeat(auto-fill, minmax(340px, 1fr))`; Titel ohne Silben-
trennung (`text-balance`); Pills im Inhaltsblock, nur CTA per `mt-auto`
unten. Keine Ziffern in Sektionsköpfen/Sidebar (konsistent nirgends).

**Sucheinstiege:** Inline-Suche = Filter im aktiven Modus («Katalog
filtern …»); ⌘K-Palette = globale Navigation. Bewusst getrennt.

**Sprachen:** Umschalter sichtbar (Header); EN/FR/IT «in Bearbeitung» mit
DE-Fallback + persistentem Banner; KEINE maschinelle Übersetzung (fachkundige
Person später). `<html lang>` folgt der Locale; Fedlex-Links ebenfalls
(fr/it amtlich — Anker stichprobenverifiziert sprachunabhängig; en → de).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (oranger Top-Rand `--warn-500` + Badge «Entwurf», Tooltip
«erstellt, fachlich noch nicht geprüft») = gebaut, ungeprüft ·
`geprüft` (Goldrand, KEIN Wort-Badge) = fachlich geprüft — **aktuell
nirgends vergeben** · `geplant` (gedämpft, AA-konform ohne Opacity) =
«In Vorbereitung», ohne Norm-Pills/Artikel-/Tagesangaben.
**Alle NormRefs tragen `verified: false`**, bis David sie fachkundig gegen
Fedlex prüft (Anker selbst sind build-verifiziert, Format `art_335_c`).
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.
Status-Filter heisst «Nur verfügbare» (= nicht geplant).

## Katalog (Quelle: src/lib/startseiteConfig.ts — Single Source of Truth)

**52 Einträge: 34 Rechner + 18 Vorlagen.** Felder: modus, art, tier,
rechtsgebiet, **rechtsbereich** (privat/oeffentlich/straf/uebergreifend),
status, norms (NormRef mit verified), href, schemaId/formvorschrift/output
(Vorlagen), szenarien (konsolidierte Rechner), related, keywords.

**Konsolidierung (43→34):** 9 Einzelkarten absorbiert — Klagebewilligung +
Fristwiederherstellung → ZPO-Fristen; Rechtsöffnung/Aberkennung/Kollokation
+ Arrest → SchKG-Phasen; missbräuchl. Kündigung + Massenentlassung →
«Arbeitsrecht — Fristen»; Miet-Anfechtung → «Mietrecht — Fristen»;
Verzugszins-vertieft → Verzugszins; SV-Leistungsverwirkung → ATSG-Karte.
`RechnerCard.szenarien` zeigt abgedeckte/geplante Szenarien auf der Karte.

**Gliederung:** `/` = Output-Typ-Sektionen (frei: 6 Rechner + alle
Vorlagen-frei). `/fachpersonen` Rechner-Modus = **zweistufig Rechtsbereich →
Output-Typ** (BereichSektion); Vorlagen-Modus = Dokument-Typ, rechtsbereich
nur Filter. Filterleisten je Modus: Rechner = Suche·Rechtsbereich·Output-
Typ·Status; Vorlagen = Suche·Rechtsgebiet·Rechtsbereich·Status; `/` = nur
Rechtsgebiet. **Sortierung:** Sektionen/Untergruppen nach Relevanz
(verfügbare desc → total desc → Config-Reihenfolge; Sprungmarken folgen);
Karten innerhalb der Gruppen nach **Rechtsgebiet geclustert** (Gebiete mit
verfügbaren zuerst in RECHTSGEBIETE-Reihenfolge, im Cluster verfügbare vor
geplanten) — «alle Erbrecht zusammen». Grenzfall Vorlage «Einsprache»:
straf (Strafbefehl häufiger), Verwaltungsbefehl via Keywords.

## Rechner (Engines in src/lib/, alle rein/deterministisch, kein LLM)

Gebaut (entwurf): zpo-fristen, schkg-fristen, kuendigung-sperrfristen
(inkl. **Sperrtage-Zähler**: Kontingent 30/90/180 je DJ, beansprucht nach
Art.-77-Zählung, verbleibend, Rückfall-Zeilen — Komponente
SperrtageZaehler, auch in der kombinierten Ansicht), mietrecht,
verjaehrung (Zwei-Fristen, Stillstand-Union), gewaehrleistung (Zwei-Regime
1.1.2026), verzugszins (Segmente, Art. 85-Anrechnung), lohnfortzahlung
(Skalen; Engine-Guard AUF 1–100 %), erbteilung. Feiertage algorithmisch
(Computus) — keine Jahres-Klippe.

## Vorlagen-Plattform (src/lib/vorlagen/)

Generische Engine: `assemble(schema, antworten)` rein/deterministisch
(Bedingungs-Algebra eq/in/nichtLeer/and/or/not; wiederholeUeber; nummeriert
mit Leerlisten-Guard; Interpolation; Bausteinprotokoll). Renderer aus EINER
Quelle: vorlagenPdf (jsPDF, Banner-API, WinAnsi-Sicherung) + vorlagenDocx
(docx-Lib, lazy geladen, Word-Formatvorlagen; XLSX architektonisch
vorbereitet, nirgends ausgeliefert). Geteilte Wizard-UI:
components/vorlagen/ui.tsx (Field, NormLink locale-bewusst, Stepper).

**4 gebaute Vorlagen (alle entwurf):**
1. **Testament** (/vorlagen/testament) — eigenhändig: Abschreib-Mustertext,
   Pflichtteils-Panel, Gates 467/505/481/472. KEIN DOCX (Eigenhändigkeit).
2. **Patientenverfügung** (/vorlagen/patientenverfuegung) — Schriftform;
   Konsistenz-Engine R1/R2, harter Sterbehilfe-Block R6 (Art. 114/115 StGB);
   PDF + DOCX (Pilot Mehrformat).
3. **Vorsorgeauftrag** (/vorlagen/vorsorgeauftrag) — formMode-Weiche
   eigenhändig (Mustertext) / beurkundet (Entwurf, DOCX nur hier);
   Eligibility-Gate Art. 13; Grundstück-Sondervollmacht erzwungen.
4. **Schlichtungsgesuch Basel-Stadt** (/vorlagen/schlichtungsgesuch-bs,
   tier experte) — Routing mit Stopp-Karten (Miete/GlG → eigene Stellen,
   Art. 198), Mängelliste mit Schritt-Sprung, SG_SCHWELLEN hart codiert,
   Behörden-Stammdaten BS, Form-Gate (Exemplare = 1+Beklagte), PDF+DOCX,
   BEWUSST ohne localStorage (Anweisung); 12 Akzeptanztests.

Wizards 1–3 mit localStorage (`lexmetrik.vorlage.*.v1`, Hydration
array-gesichert); Vorschau als Funktionsaufruf (kein Remount).

## PDF-Rechenbericht (src/lib/pdf/)

pdfModel (reines Block-Modell: kopf/hero/tabelle/schritt/hinweisbox/norm)
+ pdfRender mit **eingebetteten Markenschriften** (Fraunces/Geist/GeistMono
als Base64-TTF, ~0.4 MB NUR im lazy Klick-Chunk). Hero-Hauptkennzahl,
Eingaben-Tabelle (Mono rechtsbündig), unzerreissbare Schritte mit
klickbaren Norm-Pills (Vormessung inkl. Pill-Umbrüchen), sichtbare URLs,
Status «Berechnung vollständig». Verzugszins + Kündigung liefern hero.
Visuelle Prüfung: qlmanage-Thumbnails + Swift-PDFKit-Split.

## Oberste Ebene: vier Output-Typen

| Sektion (`art`) | Inhalt |
|---|---|
| Fristen (`frist`) | Prozessuale und materielle Fristen |
| Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

## Offene Punkte (nächste Session)

1. **Fachliche Abnahme durch David** (er ist die «fachkundige Person»):
   Baustein-Texte aller 4 Vorlagen; danach NormRefs auf verified:true und
   Einträge einzeln auf «geprüft» heben (Goldrand).
2. **Seine Antworten ausstehend:** redundante Tageszählungs-Hinweise im
   Verzugszins-Bericht kürzen? · DOCX-Standardannahmen ok (Testament ohne,
   VA nur beurkundet)? · Bausteinprotokoll in PDF/DOCX-Exporte aufnehmen?
3. **Phase 4:** Experten-Gating als Wrapper um /fachpersonen (Login/
   Bezahlung) — der Header-Button ist der Einstiegspunkt.
4. **Schlichtungsgesuch:** offene Verifikationen (kantonale §§ GOG/EG ZPO/
   GGR, PLZ 4001/4051, Art.-135-Randtitel) — in der UI offengelegt.
5. Kleineres: Detailseiten-Titel (calculators.ts) an neue Katalog-Titel
   angleichen? · Datepicker-Pfeiltasten (A11y-Kür) · Markenschriften auch
   für Vorlagen-PDFs · ggf. sichtbare Rechtsgebiet-Zwischentitel in den
   Untergruppen.
6. ~~Verschlankung Stufe 2~~ → **erledigt 5.6.2026** (generischer Rahmen
   in components/vorlagen/wizard.tsx, s. oben). Optional verbleibend:
   Form-Gate-Sektion (brass-Box mit Checkliste) als vierte geteilte
   Komponente — Texte sind je Vorlage fachlich verschieden, daher bewusst
   zurückgestellt.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur bei klar regelbasiertem, deterministischem Umfang — sonst
Widerspruch zu «feste Rechenregeln, keine Schätzung»: Konsumkredit-Widerruf
(Anwendungsbereich klären) · Schadenersatz/Genugtuung · Unterhalt ·
Tagessatz · Mietzinsherabsetzung · Konkurrenzverbot (alle wertend/Ermessen).
