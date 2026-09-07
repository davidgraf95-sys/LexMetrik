# R2-Nachzug «Rahmen» — Bau-Protokoll (W2·24-DESIGN-IDENTITAET)

**Erhoben:** 6.9.2026, aus dem Worktree-Preview (`vite preview --port 4335`,
gebautes `dist/`), Chromium. Alle Zahlen gemessen, nicht geschätzt (§7).
Grundlage: die Prüfbefunde F2–F12 zum R2-Bau (`abnahme/design-identitaet/R2-RAHMEN.md`).
**F1** (Arbeitsleiste klebt nicht) gehört R4 (Token `--app-kopf-h`) und ist hier
nicht gebaut.

## 1 · Was gebaut ist

| Befund | Zusage | Stand |
|---|---|---|
| §5a Ziff. 3 + F5 | Navigation ersetzt den aktiven Reiter; neu nur per Geste | gebaut |
| F2 | Registerfarbe am Hover der Bereichs-Reiter, an der Blatt-Marke der Seitenleiste, dauerhaft am Gruppenkopf | gebaut |
| F6 | Gericht abgekürzt, Geschäftsnummer nie gekürzt | gebaut |
| F7 | §-Siegel ab 320 px im Titelblatt (Wortmarke ab `sm`) | gebaut |
| F8 | Arbeitsleiste direkt unter dem Titelblatt, Ausgabe-Zeile darunter | gebaut |
| F9 | aktiver Reiter: Fläche + Strich in Registerfarbe, inaktiv Tinte-30 % | gebaut |
| F10 | ✕ und ⧉ nach EINER Regel, Tastatur erreichbar | gebaut |
| F12 | Hauptfenster-Kopf im Split trägt die Bezeichnung | **nicht gebaut** — §3 |

## 2 · Die Verhaltensänderung, und was sie kostet

**Bis 6.9.2026 legte JEDE Navigation einen Reiter an.** Gemessen im Preview (drei
Klicks OR → ZGB → ZPO über die Gesetze-Übersicht): drei Reiter. Jetzt gilt die
Browser-Regel (`lib/tabs.ersetzeTab`, drei Fälle in dieser Reihenfolge):

1. Ziel schon offen → nur wechseln (der aktive Reiter bleibt stehen).
2. Aktiver Reiter vorhanden → er wird an seiner Position ersetzt.
3. Kein aktiver Reiter (Kaltstart, Übersichtsseite) → anhängen wie bisher.

**Ein zweiter Reiter entsteht nur auf ausdrückliche Geste** — Mittelklick,
Ctrl/⌘-Klick (globaler Capture-Handler in `components/TabTracker.tsx`, erkannt
über Maustaste/Modifikator, ohne `data-`-Marke), ⌘/Ctrl+Enter im Suchfeld
(Navigations-State `lmNeuerReiter`), «zweite Instanz» desselben Erlasses
(`lib/useErlassOeffnen.ts`, `gesetz-leser/v3/ReiterAktion.tsx` — beide rufen
weiterhin `merkeTab`, das seine anhängende Bedeutung behält).

**Preis, offengelegt (§8):** Ctrl/⌘-Klick und Mittelklick öffnen kein BROWSER-Tab
mehr, sondern einen In-App-Reiter im Hintergrund. Der Browser-Weg bleibt über
Shift-Klick und das Kontextmenü erreichbar; weil die Reiter im localStorage
derselben Herkunft liegen, zeigt ein zweites Browser-Fenster dieselbe Liste.
**Tastenumzug:** «daneben öffnen» (zweites Fenster) wandert von Ctrl/⌘+Enter auf
**Alt+Enter** — die Funktion ist nicht entfallen, sie ist umgezogen, damit
Ctrl/⌘+Enter seine wörtliche Bedeutung aus §5a Ziff. 7 bekommt.

## 3 · F12 nicht gebaut, mit Grund (§7-Abweichung, offengelegt)

Der Befund verlangt, dass der Hauptfenster-Kopf im Split die Bezeichnung trägt
wie das rechte Pane. Nachgesehen statt umgesetzt:

* Die Leiste lässt ihren Identitäts-Teil **absichtlich** weg, wenn die
  Inhaltsseite `kopfzeileSelbst` meldet (`components/layout/PaneKopf.tsx`,
  A-2, **Entscheid David 17.8.2026**) — sonst stünde derselbe Ort zweimal in
  zwei Zentimetern («Doppelkrume», Ä45).
* Zwei Wächter halten genau das fest: `src/tests/kopfzeile-selbst.test.tsx`
  («mit `nurSteuerung`: keine Krume, kein Artikel, kein Stand — und auch der
  `label`-Fallback nicht») und `e2e/leser-v3-kopfzeile.e2e.ts` (misst den TEXT
  der Leiste gegen `/StPO|BGFA|Gesetze|Stand/`, ausdrücklich in der schärferen
  Fassung vom 17.8.2026).
* Die Asymmetrie ist die REGEL, nicht der Defekt: rechts steht «Fristenrechner
  …», weil die Rechner-Seite keine eigene Kopfzeile trägt; links steht sie
  nicht, weil der Leser sie 30 px tiefer selbst führt — im Nachweisbild
  `r2b-1440-hell-split.jpg` als «‹ Gesetze OR» sichtbar.

Den Befund einzubauen hiesse, einen datierten David-Entscheid samt zwei Wächtern
zurückzunehmen. Das ist kein Nachzug, sondern ein eigener Entscheid — er gehört
David vorgelegt, nicht nebenbei gebaut.

## 4 · F5 — die Beschriftung folgt der Adresse

GEMESSEN am R2-Stand (Preview 4335): `/gesetze/bund/ZGB` kalt geöffnet, ohne
jede Eingabe, hiess der Reiter **«Art. 1 ZGB»**; nach 1500 px Scrollen stand im
gespeicherten Reiter `…/ZGB#art-3`, in der ADRESSE weiter `…/ZGB`. Dieselbe
Adresse trug also je nach Scroll-Geschichte verschiedene Beschriftungen, und
keiner der Artikel war gewählt.

Getrennt wird jetzt, was zwei Dinge sind (`lib/tabs.ts`):

* `path` = **Lesestellung** — der Scroll-Spy schreibt weiter hinein
  (`aktualisiereTabArtikel`); Neustart, Reiter-Liste (`TabPanel`) und der
  `title` des Reiters zeigen sie unverändert.
* `wahl` = **gewählter Anker** aus der Adresse (Deep-Link, Trefferklick).
  Nur daraus baut die Kurzform «Art. 336c OR» (§5a Ziff. 2).

## 5 · Messreihe (Preview, gebautes dist/)

| Messung | Vorher (R2) | Nachher |
|---|---|---|
| Drei Navigationen OR → ZGB → ZPO | **3 Reiter** | **1 Reiter** |
| Ctrl/⌘-Klick auf einen Gesetz-Link | neues Browser-Fenster | **2. Reiter im Hintergrund**, Adresse unverändert |
| ⌘/Ctrl+Enter auf einen Treffer | «daneben öffnen» | **neuer Reiter**, alter bleibt |
| Kaltstart `/gesetze/bund/ZGB`, keine Eingabe | «**Art. 1 ZGB**» | «ZGB» |
| dieselbe Adresse nach 1500 px Scrollen | «Art. 3 ZGB» | «ZGB» (Lesestellung in `path`, im `title`) |
| Entscheid-Reiter `Verwaltungs-/Versicherungsgericht SG B 2024/58, B 2024/59 vom 14.01.2026` | Nummer abgeschnitten | «Verwaltungs-/Versich… **2024/58, B 2024/59**» |
| Marke @320 im Streifen | keine | **Siegel** (Wortmarke ab `sm`), Streifen läuft nicht über |
| Reihenfolge der Kopfzonen | Titelblatt · Ausgabe-Zeile · Arbeitsleiste | Titelblatt · **Arbeitsleiste** · Ausgabe-Zeile |

## 6 · Wächter (alle mit Rot-Beweis, §6.7)

* `src/tests/tabs.test.ts` — 5 Fälle `ersetzeTab`, 3 Fälle `wahl`.
  Rot gezeigt: `ersetzeTab` auf `merkeTab` zurückgenommen ⇒ 3 rot;
  `wahl` in `eintragAus` gestrichen ⇒ 2 rot.
* `e2e/w224-reiterverhalten.e2e.ts` (neu, Shard-Gruppe 2) — 6 Fälle
  (a) drei Navigationen = 1 Reiter · (b) Wechsel wirft nicht weg ·
  (c) Ctrl-Klick im Hintergrund · (d) ⌘+Enter neuer Reiter ·
  (e) Beschriftung folgt der Adresse · (f) Neustart ändert nichts.
  Rot gezeigt gegen ein Bau mit `ersetzeTab(null, …)` + `kurzform` aus `t.path`:
  (a) fand 3 statt 1 Reiter, (e) fand «Art. 1 ZGB» statt «ZGB».
* `e2e/topbar-kein-ueberlauf-320.e2e.ts` — **nachgezogen, weil tot**: die
  Warm-Vorbedingung suchte `button[aria-label="Alle geöffneten Reiter"]` im
  Streifen, also den mit R2 gelöschten ☰-Reiter-Trigger. Gegen das R2-`dist/`
  gemessen: 3 von 6 Fällen rot («resolved to 0 elements»). Die Vorbedingung
  misst jetzt die Arbeitsleiste; der Marken-Fall prüft Siegel statt Abwesenheit.

## 7 · Nachweis-Aufnahmen

`r2b-{1440,390}-{hell,dunkel}-{start,gesetze,leser}.jpg` ·
`r2b-1440-{hell,dunkel}-split.jpg` (zwei Panes) ·
`r2b-1440-{hell,dunkel}-reiterstreifen.jpg` (Ausschnitt der beiden Kopfzeilen mit
vier Reitern: «Art. 336c OR» · aktives «ZGB» mit Registerton und beiden Griffen ·
Entscheid mit ungekürzter Nummer · Werkzeug-Reiter).

## 8 · Offen / übergeben

* **F1** (Arbeitsleiste klebt) — R4, Token `--app-kopf-h`.
* **F12** — Entscheid David nötig (§3 oben).
* **Vorbestand rot, nicht aus diesem Nachzug:** `src/tests/design-r5-konsistenz.test.ts`
  «index.css führt die Rolle ohne Familie und die Rolle mit Familie getrennt»
  verlangt `.num { font-family: var(--font-mono) … }`; R1 hat `.num` auf
  `tabular-nums` ohne Mono umgestellt (Commit `0aa7e3244`). Dieser Nachzug fasst
  `src/index.css` nicht an — Fix gehört zu R1/R3.
