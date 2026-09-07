# R9 Finder-Welle A — Typografie-Klassen (6.9.2026)

Methode-Hinweis (WICHTIG, gilt für alle 8 Klassen): In dieser Session stand
KEIN Browser-/Screenshot-Werkzeug zur Verfügung (ToolSearch für
computer-use/Chrome/Playwright liefert keine Treffer trotz MCP-Instruktionstext).
Gemessen wurde darum (a) per `curl` gegen die Vite-Preview (Port 4341,
HEAD 89596edf8 = dist gültig, nur e2e-Shard-Datei seit dist-Build geändert)
— das liefert vollständige Tailwind-Klassen NUR für die 8 Übersichts-/statischen
Seiten (`/`, `/gesetze`, `/rechtsprechung`, `/materialien`, `/rechner`,
`/vorlagen`, `/suche`, `/einstellungen`); für Detail-Leser (`/gesetze/bund/OR`,
`/gesetze/kanton/ZH-211.11`) liefert `#root` nur eine klassenlose SEO-Seed
(`lib/seo-detail.ts`), nicht den hydrierten React-Baum. (b) Quellcode-Lesung
der geteilten Bausteine (Methode-Punkt 1, Spec Z. 39: grep ist ausdrücklich
zulässig). Computed-style-Werte für Leser-Detailseiten, Entscheid, Materialie,
Vorlagen-Wizard-Schritte, Split-View und geöffnete Menüs/Popover sind darum
NICHT per Browser gemessen — als «nicht geprüft» unten ausgewiesen.

## 1. Seitenkopf (H1 + Ausgabe-Zeile)
Schon einheitlich — nichts zu tun. Ein Baustein `ui/SeitenTitel.tsx` rendert
JEDE H1 (`text-h2 sm:text-h1 font-display font-semibold text-ink-900`,
pane-fähig via `usePaneKlasse`), konsumiert von 12 Stellen (Übersichten via
`layout/SeitenKopf`, Rechner via `layout/RechnerKopf`, Leser via
`layout/LeserKopfGeruest`, Vorlagen via `vorlagen/wizard.tsx`, Fehlseite).
Ausgabe-Zeile: EINE Klasse `.ub-ausgabe` (Archivo 13px, ink-500), gemessen
identisch auf `/gesetze` («227 Bundeserlasse · 1'338 Kantonserlasse · 27
Staatsverträge»), `/rechtsprechung` («5'093 Entscheide»), `/materialien`
(«1'561 Publikationen»), `/rechner» («23 Rechner»), `/vorlagen` («26 Vorlagen»).
Suche/Einstellungen tragen bewusst kein `ausgabe` (statische Seiten behalten
Overline statt Ausgabe-Zeile, D22-Kommentar `layout/SeitenKopf.tsx:28-30`) —
Ausnahme, kein Fund.

## 2. Sektions-Etikett (`.lc-overline`)
Schon einheitlich — nichts zu tun. Auf allen 8 curl-baren Routen identische
Klasse `lc-overline` (ggf. `mb-1`/`mb-3` als Abstands-Modifier, keine
Typo-Variante) für Navigation/Hinweise/Rechtlicher-Hinweis-Blöcke; R1 hat
Versalien/Tracking bereits entfernt (`index.css:475,1284`).

## 3. Datum
1 Fund (mittel, Code-Hygiene statt visueller Drift): `src/components/start/EntscheideListe.tsx:41-44`
definiert lokal `deDatum()` (eigene Regex ISO→TT.MM.JJJJ) statt der
kanonischen `datumCh()`/`<Datum>` (`components/ui/Datum.tsx`, `lib/normtext/erlassKopfText.ts:47`,
seit B-3 der SSoT für exakt diesen Zweck). Sichtbarer Output ist heute
byte-gleich (`.num`-Klasse trägt seit R1-1 ohnehin nur noch
`tabular-nums`, keine Mono-Familie mehr — `index.css:1256-1258`), darum
KEIN optischer Unterschied — aber zwei Quellen für dieselbe Regel (§5),
die bei künftiger Änderung (z. B. Wochentag ergänzen) auseinanderlaufen.
Übrige 63 `<Datum>`-Konsumenten + `StandChip.tsx` beziehen korrekt den
Baustein. `DatumsFeld.tsx` (Eingabefeld TT.MM.JJJJ) ist Formular-Mechanik,
keine Anzeige — bewusst ausserhalb dieser Klasse.

## 4. Zahl/Zähler
Schon einheitlich — nichts zu tun. `.num`-Klasse (`lining-nums tabular-nums`,
seit R1-Nachzug ohne Mono-Familie) in 103 Dateien konsistent für Tabellenziffern/
Zähler verwendet. Tausendertrenner: sowohl `toLocaleString('de-CH')` (45
Fundstellen) als auch die vier domänenspezifischen Regex-Formatierer
(`BetragsFeld.tsx`, `lib/format.ts`, `lib/normtext/darstellung.ts`,
`lib/verzugszins.ts`) erzeugen dasselbe Zeichen U+0027 `'` (verifiziert:
Node `(1234567).toLocaleString('de-CH')` → `1'234'567`) — keine Glyphen-Drift.

## 5. Erlass-Kürzel / Norm-Zitat
Schon einheitlich — nichts zu tun. Norm-Chips laufen durch den EINEN
`vorlagen/NormChip.tsx` (`.lc-chip`, Grotesk/Archivo, kein Mono). `font-mono`
kommt app-weit nur an 2 Stellen vor (`ErgebnisAnzeige.tsx:212` Fehlercode-Badge,
`gesetz-leser/parts/LeserTastatur.tsx:232f` Tastenkombination `⌘K`/`/`) — beides
fachlich begründete Ausnahmen (Code/Tastatur, nicht Norm-Zitat), keine Norm-
Kürzel mehr in Mono.

## 6. Entscheid-Zitierung
Nicht abschliessend geprüft (Detail-Leser nicht per Browser messbar, s.o.).
Quellcode-Befund: der Rubrum-/Kopf-Inhalt eines Entscheids kommt aus EINEM
Modell (`lib/rechtsprechung/kopf.ts::kopfModell`, konsumiert von
`EntscheidLeser.tsx` + `LesemodusOverlay.tsx`) — keine zweite Kaskade.
`lib/gerichtszitat.ts` (eigenes `MONATE`-Array, Langdatum «17. Juni 2026») ist
KEIN Duplikat der Anzeige, sondern die Rechenlogik des separaten Rechners
«Gerichtszitat» (`RechnerGerichtszitat.tsx`/`GerichtszitatForm.tsx`) — andere
Domäne (Werkzeug, nicht Leser-Anzeige), als Ausnahme geführt, nicht als Fund.
Offen: ob die sichtbare Zitierzeile im EntscheidLeser-Kopf, in `EntscheideListe`
(Startseite-Teaser) und in `EntscheidKarte`/`Rechtsprechung.tsx`-Liste
dieselbe Typografie/Farbe/Trennzeichen trägt — braucht hydrierten DOM.

## 7. Fussnote
Schon einheitlich — nichts zu tun (mit Ausnahme). Fussnoten-Apparat existiert
NUR im Normtext-Leser (`components/normtext/ArtikelBody.tsx`, EIN Toggle-Button
`data-fn-ref` + Wächter `src/tests/fussnoten-toggle-huellenneutral.test.ts`).
Entscheid-Leser trägt keinen Fussnoten-Apparat — fachliche Ausnahme (BGE/BGer-
Entscheide zitieren nicht per Fussnotenmarker wie Erlasstexte), kein Fund.

## 8. Randtitel/Marginalie
Nicht abschliessend geprüft (Artikel-Randtitel live nur im hydrierten
Leser sichtbar). Quellcode-Befund: EIN Ort baut die Randtitel-Zeile,
`pages/gesetz-leser/parts/ArtikelLeser.tsx` (Zeilenform vs. Breitform als
EIN Markup, `margStufeStil`, seit Auftrag David 6.9.2026 kursive
Literata-Zeile) — keine zweite Implementierung gefunden. Ob Marginalien in
Modulen/Panes (KontextPanel, PanelMaterialien u. ä.) dieselbe Schrift/Farbe
tragen, ist NICHT geprüft — DOM-Messung fehlt.

## Nicht geprüft / nicht erreichbar
- Alle Split-View-Kombinationen, geöffnete Menüs/Popover (Ansicht, Verlauf,
  Thema, Sprache, Reiter-Blatt, Filter), hell/dunkel-Vergleich, @390×844 —
  mangels Browser-Werkzeug in dieser Session nicht gemessen.
- Entscheid-Detailseite, Materialie, Vorlagen-Wizard (Schritt 1 + später),
  `/rechner/tagerechner`-Ergebniszustand nach Eingabe, `/suche?q=…`-Trefferliste
  im hydrierten Zustand — nur die prerenderte/SEO-Erstansicht war per curl
  einsehbar, keine Interaktion möglich.
- Klasse 6 und 8 daher nur auf Quellcode-Ebene (Ein-Ort-Beweis), nicht auf
  visueller Rezept-Gleichheit geprüft.

## Rückgabe siehe Chat.
