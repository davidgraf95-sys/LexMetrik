# R9 Finder-Welle C — Container-Klassen (W2·24-DESIGN-IDENTITAET)

Ort: worktree `w2-24`, HEAD `89596edf8` (chore, non-code). dist/index.html
Build-Zeit 19:43:xx vs. HEAD-Commit 19:44:57 — dist geringfügig ÄLTER als HEAD
(siehe unten, «nicht geprüft»). Methode dieser Welle: **kein Browser-/Playwright-
Werkzeug war in dieser Session verfügbar** (ToolSearch fand weder ein Playwright-
noch ein Chrome-MCP; `computer-use` steuert nur den physischen Desktop und
Browser sind dort tier-"read", also nicht navigierbar). Es wurden **0 Screenshots**
erzeugt. Ersatzweise: Quellcode-Analyse (grep) gegen `src/index.css` (`@layer
components`, `:root`-Custom-Properties inkl. `--radius-*:0px`) — für ein
Tailwind+CSS-Var-System sind die computed-style-relevanten Werte dort statisch
und deterministisch ablesbar, ausser bei JS-berechneten Inline-Styles (dort
vermerkt). Dies ist eine Abweichung von der Methode (Schritt 2 verlangt
computed styles per Playwright) und wird hier offengelegt, nicht verschwiegen.

## 1. Chip/Badge/Status
**FUND C1-1 · Leitentscheid-Marke · `/rechtsprechung` vs. Start-Modul · hoch**
Zwei Rezepte für dieselbe Aussage «Leitentscheid»:
- `.lc-badge.lc-badge-ok` (Rahmen 1px + Text) — `src/components/rechtsprechung/EntscheidKarte.tsx:52`, konsumiert auf `/rechtsprechung`.
- reiner Fettdruck-Text `<em className="not-italic font-medium text-ink-900">Leitentscheid. </em>` (kein Badge, kein Rahmen) — `src/components/start/EntscheideListe.tsx:164`, konsumiert im Start-Modul.
Soll-Rezept: `.lc-badge.lc-badge-ok` (bestehender Baustein, trägt bereits die
kanonische Anatomie). Fix: `EntscheideListe.tsx:164` auf denselben Badge ziehen.

**Kosmetisch C1-2**: Text-Casing uneinheitlich bei `.lc-badge-danger`
(„Aufgehoben" `ErlassKarte.tsx:51` vs. „aufgehoben" `Gesetze.tsx:203`) — gleiche
Anatomie/Klasse, nur Wortlaut; kein Rezept-Fund.

**Schon einheitlich**: `.lc-chip`/`.lc-chip-*` (Anatomie an einer Stelle,
`index.css:1774ff`, Register-Ticks statt Kasten), `.lc-badge`-Basis
(`index.css:2369`, `rounded-sm`→`--radius-sm:0px`), `lc-badge-entwurf`/
`-geplant` (Umriss statt Füllung, dokumentierte Entscheide 6.6./31.8.2026).
`FacettenGruppe.tsx` (Filterzeile `/rechtsprechung`+`/suche`) ist **heute**
(D24-Nachzug 6.9.2026) von `.lc-chip` auf `.fc-schalter` (Text/Linie statt
Kasten) migriert — bereits Zielbild-konform, nichts zu tun.

## 2. Karte/Listenzeile
**Schon einheitlich**: `.lc-card` (Linien oben/unten statt Kasten, EINE
Hover-Grammatik `hover:border-brass-400`, `index.css:1383ff`, Konsolidierung
C-3/R5-D 31.8./5.9.2026) — Katalog-Zeilen, ErlassKarte, EntscheidZeile,
Fristen-Karten teilen den Baustein; alte Hover-Varianten (`hover:shadow-lg`,
`hover:-translate-y-0.5`, `hover:border-line-strong`) nur noch im
Kommentar als Historie, keine Live-Vorkommen mehr (grep leer).
Erlassliste D24 (`src/components/ui/ListenTabelle.tsx`, 6.9.2026) ist EIN
Baustein für Bund UND Kanton — bewusst `<ul>`/CSS-Grid statt `<table>`
(Begründung im Datei-Kopf: Paarung/Spalten-Umschaltung), **Ausnahme mit
Grund**, kein Fund.

## 3. Leerzustand
**Kosmetisch C3-1**: `src/components/suche/SucheLeerzustand.tsx:71`
(„Noch nichts geöffnet.") baut den Absatz selbst (`text-body-s text-ink-500`)
statt den Baustein `ui/Leerzustand.tsx` zu importieren — Messwerte sind
IDENTISCH mit dem Kanon (D-7, `Leerzustand.tsx:52`: `text-body-s
text-ink-500`, endet mit «.»), daher kein Rezept-Fund, aber die
Aufrufstellen-Sonde (`leerzustand-d7.test.tsx`) erfasst diese Stelle
vermutlich nicht — Wächter-Lücke, nicht Optik-Lücke.
**Schon einheitlich** im Übrigen: `ui/Leerzustand` ist an >30 Stellen
konsumiert (Suche, Gesetze, Rechtsprechung, Materialien, Rechner, Vorlagen,
gesetz-leser-Panels), Aussagesatz-Pflicht + Weiterweg-Typ sind vom
Baustein selbst erzwungen (D-7, W2·19).

## 4. Hinweis/Warnung
**FUND C4-1 · Vorlagen-Formhinweise (Fehler/Blocker) · mehrere Vorlagen-Seiten · blockierend**
Mind. 5 verschiedene Rezepte für dieselbe Aussage «Fehler/Blocker», KEINES
nutzt `.lc-notice`/`.lc-notice-danger` (Kanon: `border-left: 3px solid`,
`index.css:2407-2409`):
- `border border-line bg-danger-bg p-4` — `src/components/vorlagen/ui.tsx:360`, `src/components/forms/GewaehrleistungForm.tsx:314`
- `border bg-danger-bg p-4 space-y-1.5` (Rahmenfarbe Default) — `src/pages/VorlageSchlichtungsgesuchBs.tsx:513`
- `bg-danger-bg p-3 space-y-1.5` (kein Rahmen) — `src/pages/VorlageAgGruendung.tsx:124`
- `border border-danger-700/40 bg-danger-bg p-3` — `src/pages/VorlageAgGruendung.tsx:366`
- `bg-danger-bg p-3 space-y-0.5` (kein Rahmen) — `src/components/vorlagen/Dokumentmappe.tsx:65`
- `rounded-md bg-danger-bg p-3` (kein Rahmen) — `src/pages/Kontakt.tsx:76`
Streuung: Rahmen (4-seitig/keiner/farbig) + Padding (p-3/p-4) + role=alert
uneinheitlich gesetzt. Soll-Rezept: `.lc-notice-danger` (bestehender
Baustein, Anatomie bereits definiert). Fix: alle sieben Stellen auf
`.lc-notice-danger` ziehen (Wächter: neuer Test analog
`leerzustand-d7.test.tsx`, Aufrufstellen-Sonde für Vorlagen-Fehlerboxen).

**Mittel C4-2**: `ErgebnisAnzeige.tsx:173/178` (Rechner-Herleitung/-Annahmen,
aufklappbar) trägt `bg-warn-bg` als Kopf-/Körperfläche mit `border-line
rounded-md`-Aussenrahmen — eigenes Rezept, weder `.lc-notice-warn` noch
`.lc-card`; nicht mit den Vorlagen-Boxen ident, aber ebenfalls kein
gemeinsamer Baustein. Nicht vertieft gemessen (Zeitbudget).

**Schon einheitlich**: `.lc-notice`-Basisanatomie selbst (Linie links,
Füllung nur bei `-warn`/`-danger` als bewusste Bedeutungsträger, U2-Entscheid
dokumentiert `index.css:1758,2365`).

## 5. Tabelle
**Schon einheitlich**: Normtext-Tabellen (`ArtikelTabellen.tsx`, `.lc-scroll-x`
+ `.lc-ziffern`, Zeilen 31/93/141/172) und die neue Erlassliste (D24,
`ListenTabelle.tsx`) — Grid-Pseudo-Tabelle ist dokumentierte Ausnahme (s. o.).
**Nicht vertieft geprüft**: Rechner-Ergebnisdarstellungen (`ErgebnisAnzeige.tsx`,
`VerzugszinsTimeline.tsx`) tragen KEINE `<table>`/`role="table"`-Struktur,
sondern Flex-/Grid-Boxen — ob das ein Fund ist (Tabellendaten ohne
Tabellensemantik) oder ein fachlicher Grund (wenige Werte, nicht
listenartig) hätte, war mit grep allein nicht abschliessend zu beurteilen.
`Einstellungen.tsx` enthält gar keine Tabelle (reine Formular-Seite) — nicht
anwendbar, kein Fund.

## 6. Brotkrume/Routenpfad
**Schon einheitlich**: Die Krume ist `layout/OrtsAngabe.tsx`, global über
`Shell.tsx:496` (`InhaltsKopf` + `istInhaltsPfad`-Regex, deckt `/rechner/*`,
`/rechtsprechung/*`, `/materialien/*`, `/vorlagen/*`, `/gesetze/*` ab) UND im
Split-View über denselben Baustein in `layout/PaneKopf.tsx` gerendert — EIN
Bauteil, kein Duplikat. Für den Gesetzesleser meldet
`gesetz-leser/v3/useKopfAnspruch.ts:51` `kopfzeileSelbst: true, breadcrumb: []`
— die Leiste bleibt montiert (Höhe stabil), zeigt aber nichts: D27 korrekt
umgesetzt, kein Regressions-Fund. (Hinweis: `.lc-route` in `index.css:2573`
ist nur eine Fade-in-Animationsklasse, keine Krumen-Anatomie — Begriff in der
Finder-Spec ungenau, aber die eigentliche Frage «hat der Gesetzesleser noch
eine Krume?» ist mit Nein beantwortet.)

## 7. Pane-Kopf / Footer
**FUND C7-1 · „Jüngster Eintrag"-Zeile fehlt im Footer · mittel**
`Footer.tsx` enthält 0 Treffer für „Jüngster"/„KorpusStand" — die Zeile lebt
seit D8 (6.9.2026, W2·23-STARTSEITE-V4) in `src/components/ui/KorpusStand.tsx`
und wird nur von `layout/Topbar.tsx`, `layout/Sidebar.tsx`,
`start/EntscheideListe.tsx`/`start/PultAbschluss.tsx` konsumiert — nicht vom
Footer. Entweder ist die Finder-Spec-Annahme („Footer trägt D8") veraltet
(Zeile ist bei D8 absichtlich in Topbar/Sidebar/Start gewandert), oder der
Footer hat eine reale Lücke gegenüber den anderen drei Oberflächen — mit
grep allein nicht zu entscheiden, wer hier kanonisch ist; braucht Davids
Einordnung oder einen Blick in den D8-Commit.

**Nicht lokalisiert**: der in der Spec genannte Klassen-Name
`.lc-leiste-griff` ist KEIN Pane-Breiten-Ziehgriff, sondern eine generische
Kopfzeilen-Knopf-Anatomie (Konsumenten: `InhaltsKopf.tsx`, `SchliessKnopf.tsx`,
gesetz-leser-v3-Leisten) — der tatsächliche Ziehgriff für die Split-View-
Pane-Breite (`usePaneLayout.ts`/`Pane.tsx`) war per grep nicht als eigenes
Element zu identifizieren; ohne Browser-Snapshot nicht abschliessend zu
prüfen (nicht geprüft).

**Schon einheitlich (soweit geprüft)**: `PaneKopf.tsx` ist EIN Baustein für
beide Pane-Rollen (`rolle==='primaer'` nur zusätzliche linke Registerlinie),
Griffe (✕/⧉/Tausch/⇱) teilen dieselbe `knopf`-Klasse. Footer selbst (Meta-
Links, §8-Satz zu Fedlex) ist eine einzige Komponente über alle Routen —
Konsistenz über Routen hinweg ist bei einer einzigen React-Komponente
architekturbedingt gegeben, kein Streuungs-Risiko.

## Nicht geprüft / nicht erreichbar
- Kein Browser-Werkzeug verfügbar → keine computed styles, keine
  Screenshots, keine geöffneten Menüs/Popover (Ansicht, Verlauf, Thema,
  Sprache, Reiter-Blatt, Filter) — Methode-Schritt 2 nicht erfüllt.
- dist/index.html (19:43) minim älter als HEAD-Commit 89596edf8 (19:44:57,
  reiner Shard-Regenerierungs-Commit „chore(e2e)"), nicht selbst neu gebaut
  (Vorgabe befolgt) — vermutlich ohne Auswirkung auf CSS/Komponenten, aber
  nicht verifiziert.
- Klasse 5 Rechner-Ergebnistabellen: Soll-Bewertung offen (s. o.).
- Klasse 7 Pane-Breiten-Ziehgriff: Element nicht lokalisiert.
- Klasse 7 Footer-„Jüngster Eintrag": Deutungsfrage an David/D8-Commit.
