# FAHRPLAN-VERZAHNUNG-UI — Die Verzahnung sichtbar machen (V1 vor VPS · V2 Masse · V3 Soft-Law)

**Stand:** 3.7.2026 · **Auftrag:** David 3.7.2026 («Verzahnung sichtbar machen») · **Erarbeitet:** Fable (Konzept + adversariale Gegenprüfung eingearbeitet) · **Rolle:** Detailquelle der `ROADMAP.md` für Schritt **W2·7-VZUI** (§14 — die ROADMAP bleibt die eine Steuerungsquelle, dieser Fahrplan trägt das Wie).

**Leitplanken (bindend):**
- **§7 Status-Modell:** Kein Element behauptet je «geprüft»/`verified` — das ist Davids Abnahme vorbehalten (gesperrt bis 1.12.2026). Wortfeld «geprüft/gegengeprüft/verifiziert» ist in JEDEM Nutzertext dieses Fahrplans verboten.
- **§8 Ehrlichkeit:** Herkunft (amtlich/kuratiert/maschinell) wird nie verschwiegen; Zähler nennen Erfassungsgrenzen («n **erfasste** Urteile»), nie Vollzähligkeit.
- **§15 Lesedichte/Perf:** Verzahnung lebt am Dokument-/Artikelfuss, nie im Lesetext (einzige Ausnahme: das wörtliche Inline-Zitat); CLS = 0; nichts merklich langsamer.
- **R16 bleibt zu:** Keine Ampel-/Treatment-Farben (überruled/bestätigt) — auf keiner Etappe dieses Plans existieren Treatment-Daten.
- **Q1:** Bandjahr-Präzision nie als Tagesdatum rendern.
- **Regelmässig-aufräumen:** Kein toter Code in Prod; Erweiterungspunkte als Kommentar, nicht als tote Zweige.

---

## 0. Kritik-Einarbeitung (adversariale Gegenprüfung 3.7.2026)

| # | Befund | Verdikt | Konsequenz in dieser Spec |
|---|---|---|---|
| 1a | `kuratiert`-Badge markiert den Normalfall = Chrome | **Berechtigt** | Badge GESTRICHEN. Badges nur für Abweichungen (`leitentscheid`, `maschinell`, `masse`, `nur-verweis`); Default bleibt nackt (§1.3) |
| 1b | KantenChip-Vollanatomie (5 Elemente) ×8 = Tabelle statt Chip-Zeile | **Berechtigt, mit einer Präzisierung** | Dichte-Regel: Chip = Kürzel + Label + **EIN** Zusatz (Sublabel ODER Marker). *Präzisierung:* der Leitentscheid-Marker schrumpft in Chip-Reihen zum blanken ★-Glyph mit `aria-label` (kein Volltext-Badge) — Leitentscheid-Erkennung in der Zeile ist der Kernnutzen der LeitfallZeile, Totalverzicht würde das Feature entkernen. Volltext-Badges nur im Reader-Kopf/Suchtreffer (§1.2) |
| 1c | «Zitiert»-Gruppe voller grauer Nicht-Link-Chips = Rausch | **Berechtigt** | Muster: Zähler + nur aufgelöste Treffer als Chips + EIN Hinweissatz für den Rest (§2.2) |
| 1d | «Zitierte Normen»-Zeile unter dem Kopf schiebt Regeste | **Berechtigt** | Zeile wandert als Gruppe ans KontextPanel (Dokumentfuss); Fundstellen-Sprünge bleiben (§2.2) |
| 1e | `MehrKante` mit totem Online-Zweig = toter Code | **Berechtigt** | V1 baut nur den lokalen Zweig (der ist live); Online-Zweig = `// Erweiterungspunkt V2`-Kommentar (§1.5) |
| 2a | «geprüft erfasst/gegengeprüft» kollidiert mit §7 | **Berechtigt (härtester Befund)** | Badge weg (1a); wo `herkunft:'kuratiert'` verbalisiert wird (Glossar, Gruppen-Hinweise): **«strukturiert erfasst»**, nie «geprüft» (§1.3) |
| 2b | «n Urteile zitieren…» suggeriert Vollzähligkeit | **Berechtigt** | Verbindliche Formulierung: **«n erfasste Urteile zitieren diesen Artikel»** (Grammatik-Regel 6) |
| 2c | Plan B V1.4 = gemischte Ranglisten-Provenienz, unsichtbar | **Berechtigt** | V1.4 abgetrennt als **V1b** (eigenes Paket, gated); Provenienz-Regel: pro Erlass-Shard ganz oder gar nicht, nie gemischte Liste (§3 V1b) |
| 3a | `KONTEXT_GRUPPEN`-Registry ist V1-Überbau (188 Zeilen, Sync/Async-Mischpfade) | **Berechtigt** | Registry aus V1 gestrichen; die 4 JSX-Blöcke bleiben. Registry kommt in **V2**, wenn der fünfte Gruppentyp sie rechtfertigt (§10: Rahmen bauen, wenn gebraucht) (§1.4) |
| 3b | «Jede Kante trägt ⧉» ignoriert existierendes Gating | **Berechtigt** | Regel neu: ⧉ nur auf KontextPanel-Chips + NormPopover, immer unter dem bestehenden Gating `kannOeffnen && !istOffen` (≥lg, pane-sicher) — bricht Mobile nicht (Grammatik-Regel 1) |
| 4a | ~3 Tage optimistisch; `title`-Tooltips auf Touch tot; `check:gegenpruefung` fehlt im DoD | **Berechtigt** | V1a ehrlich **4–5 Tage** (echte zugängliche Tooltips, s. §1.7); `check:gegenpruefung` explizit im DoD jeder Shard-Regeneration (§3) |
| 4b | V1.4 hängt an law-code-Kanonisierung «in Bau» — nicht «nur heutige Daten» | **Berechtigt** | V1.4 → **V1b**, hart gated (§3) |
| 5 | EntscheidLeser.tsx hat drei Schreiber; parts.tsx-Eingriff ist real ein LeitfallZeile-Umbau | **Berechtigt** | V1.3 hart auf Merge von `feat/entscheid-verweis-praezision` gegated; parts.tsx-Paket ehrlich als «LeitfallZeile-Umbau» benannt (§7 unten) |
| 6 | ⧉-an-jedem-Chip ist Dogma; Kill: kuratiert-Badge, Registry-V1, toter Online-Zweig | **Berechtigt** | Alle drei gekillt (s. 1a/1e/3a); ⧉ begrenzt (3b). Glossar/Sublabels/Zitierte-Normen-am-Fuss bestätigt |

Verifizierte Anker (3.7.2026): Branches `feat/entscheid-verweis-praezision`, `fix/leitentscheid-stern-tooltip`, `feat/qs-data-e4-lokal` existieren · `KontextPanel.tsx` 188 Z. mit Gating `kannOeffnen && !istOffen` (Z. 96/172) · `parts.tsx` 481 Z. · `EntscheidLeser.tsx` 561 Z. · Token `lc-chip`/`lc-badge*`/`lc-overline` in `src/index.css:255-415` · `src/{lib,components}/verzahnung/` existiert noch nicht (kollisionsfrei) · ID `W2·7-VZUI` nicht in `scripts/plan/inventar.ts`.

---

## 1. Die Interaktions-Grammatik (6 Elemente + Glossar, verbindlich für ALLE Oberflächen)

Neuer geteilter Layer: `src/lib/verzahnung/` + `src/components/verzahnung/` (neue Dateien, kollisionsfrei zu allen laufenden Branches).

### 1.0 Gemeinsamer Datentyp (Fundament)

```ts
// src/lib/verzahnung/typen.ts
export type VerzahnungsKante = {
  ziel: { typ: 'norm'|'entscheid'|'material'|'werkzeug'|'verwaltungsverordnung'; key: string; label: string };
  richtung: 'zitiert' | 'zitiert-von';
  fundstelle?: { artikel?: string; erwaegung?: string };   // → #e-N / Art.-Anker
  herkunft: 'amtlich' | 'kuratiert' | 'maschinell';        // §8-Pflichtfeld, NIE optional
  konfidenz?: 'hoch' | 'niedrig' | 'unresolved';           // E4-Slot, V1 ungenutzt
  gewicht?: number;                                         // In-degree, nie «Autorität»
  datum?: { iso: string; praezision: 'tag' | 'bandjahr' | 'unbekannt' };  // Q1 im Typ
};
```

`praezision:'bandjahr'` erzwingt Q1 im Typsystem: Renderer zeigen «BGE 121 (1995)», nie «1.1.1995»; Sortierung nach Bandjahr erlaubt, Tagesdatums-*Anzeige* verboten (Unit-Test, §3 V2-DoD).

### 1.1 `NormInline` — Inline-Link im Fliesstext *(existiert: NormText/NormChip/NormPopover)*

Einzige Verzahnung IM Lesetext (wörtliches Zitat). **V1-Änderung:** `NormPopover.tsx` erhält neben «Im Gesetz öffnen ›» einen ⧉-Button (unter Pane-Gating) — «Entscheid lesen, Norm daneben aufschlagen» ist der häufigste Verzahnungsmoment für Gerichte/Kanzleien. Snapshot-Stand + Quelle-Link bleiben (§7-Muster schon korrekt).

### 1.2 `KantenChip` — der eine Chip für Dokument-Referenzen *(neu: `verzahnung/KantenChip.tsx`)*

Ersetzt die drei Ad-hoc-Chip-Varianten (LeitfallZeile, KontextPanel, Verweise-Zeile) durch EINE Anatomie mit **Dichte-Regel**:

```
Chip-Reihe (kompakt, verbindlich):  [Doktyp-Kürzel] Label [EIN Zusatz]
                                     BGE  147 III 209  via Art. 257d
                                     BGE  145 III 63   ★            ← Glyph, aria-label trägt den Text
Reader-Kopf/Suchtreffer (voll):     Label + StatusBadge ausgeschrieben
```

- **EIN Zusatz** heisst: Fundstellen-Sublabel (`text-micro text-slate-500`) ODER ★-Glyph — nie beides plus Badge-Text. Hat ein Chip Sublabel UND Leitentscheid-Status, gewinnt das Sublabel; der ★ rückt als Präfix-Glyph vor das Label (bleibt 1 Zeichen). Begründung s. §0/1b.
- **Token:** `lc-chip` unverändert; kein neues CSS.
- **Nicht-auflösbare Ziele:** erscheinen NICHT als Chip-Wüste (§0/1c) — Auflösung regelt die konsumierende Gruppe (§2.2).
- **Erweiterungspunkte (Kommentar, kein toter Code):** `konfidenz`-Prop (V2: dezenter Punkt `text-warn-700` bei `niedrig`, Text-Tooltip, Farbe nie allein tragend); `fundstelle.erwaegung` springt auf `#e-N` (Ergebnis von `feat/entscheid-verweis-praezision`, hier nur konsumiert).
- **Kein eigener ⧉ am Chip** (§0/3b) — ⧉ liefert der umgebende Kontext (Panel-Zeile/Popover) unter Gating.

### 1.3 `StatusBadge` — EIN Vokabular, nur für Abweichungen *(neu: `verzahnung/StatusBadge.tsx`)*

Geschlossene Liste. **Der Normalfall (kuratiert erfasst) trägt KEIN Badge** — Abweichung wird markiert, nicht Normalität (§0/1a).

| Prädikat | Darstellung | Token | Erklärtext (laientauglich) |
|---|---|---|---|
| `leitentscheid` | «★ Leitentscheid» (Reihe: nur ★-Glyph) | `lc-badge lc-badge-massgeblich` | «Amtlich publizierter BGE — vom Bundesgericht selbst als wegweisend eingestuft» |
| `maschinell` | «maschinell» | `lc-badge lc-badge-soft` | «Automatisch zugeordnet — keine redaktionell erfasste Angabe» |
| `masse` (ab V2) | «ungeprüft · Masse» | `lc-badge lc-badge-soft` + gestrichelt | «Aus 195'000 Urteilen automatisch erfasst, nicht redaktionell aufbereitet» |
| `nur-verweis` (ab V3) | «nur PDF-Verweis» | `lc-badge lc-badge-soft` | «Nur Fundstelle + amtlicher Link, kein aufbereiteter Volltext» |

- **Wortfeld-Regel (§7, hart):** Wo `herkunft:'kuratiert'` irgendwo verbalisiert wird (Glossar, Gruppen-Hinweise), lautet die Formel **«von LexMetrik strukturiert erfasst»** — nie «geprüft», «gegengeprüft», «verifiziert». Ein Grep-Tor sichert das (§3 DoD).
- Alle vier heutigen Leitentscheid-Darstellungen (KontextPanel, `parts.tsx`-★, EntscheidLeser, SuchResultate) migrieren auf dieses eine Element; der ★ bleibt als Glyph erhalten (Wiedererkennung), verliert sein `aria-hidden`-ohne-Erklärung-Dasein. Bewusst KEINE Ampelfarben — Messing ist Hervorhebung, kein Rechtsstatus-Urteil.

### 1.4 `KontextGruppe` — Panel-Sektion mit Richtungs-Label *(V1: sanfter Ausbau der bestehenden `Gruppe`, KEIN Registry-Refactor)*

- **V1:** Die 4 JSX-Blöcke in `KontextPanel.tsx` bleiben (§0/3a). Die bestehende `Gruppe`-Hülle erhält drei Pflicht-Props: (a) **Richtungs-Label** als `lc-overline` («Wendet an» / «Wird zitiert von» / «Legt aus» — Beziehungstyp als Text, juris/EUR-Lex-Muster, nie Farbe), (b) **Zähler**, (c) **kontexttyp-spezifischer `hinweis`** (Material-Reader benennt die doppelte Indirektion: «über die gemeinsam zitierten Erlasse zugeordnet — zwei Schritte entfernt, entsprechend unschärfer»). ⧉ an Panel-Chips überall dort nachgerüstet, wo er fehlt (Entscheide/Materialien), unter dem existierenden Gating.
- **V2:** Erst wenn der fünfte Gruppentyp («Wird zitiert von», async/Edge) dazukommt, wird auf eine `KONTEXT_GRUPPEN`-Registry refactored — dann trägt sie Sync/Async + per-Typ-Sichtbarkeit von Anfang an, statt sie in V1 auf Vorrat zu abstrahieren.

### 1.5 `MehrKante` — die ehrliche Masse-Kante *(neu: `verzahnung/MehrKante.tsx`)*

- **V1 baut ZWEI Zustände**, beide live: `+n weitere` (lokal, klappt auf — heutiges LeitfallZeile-Verhalten, vereinheitlicht) · still/unsichtbar (nichts da — §15.2: kein reservierter Leerraum). Der Online-Zweig ist NUR ein `// Erweiterungspunkt V2: Edge-Nachladen, §8-Satz «Anfrage verlässt dafür den Browser»`-Kommentar am Erweiterungspunkt (`parts.tsx:99-101` ist schon markiert) — kein toter Code (§0/1e).
- **V2** baut den dritten Zustand `+n weitere (online)` in den vorbereiteten Slot.

### 1.6 `FundstellenAnker` — Pin-Cite *(existiert: EntscheidBody `#e-N` + pinCite; wird durch `feat/entscheid-verweis-praezision` präzisiert)*

Nichts bauen, nur Regel festschreiben: jeder `KantenChip` mit `fundstelle.erwaegung` linkt auf den Anker, nicht auf den Dokumentkopf.

### 1.7 Querschnitt: `Begriff`-Glossar *(neu: `verzahnung/Begriff.tsx` + `lib/verzahnung/glossar.ts`)*

~15 Einträge (Leitentscheid, i.V.m., E., Regeste, Dispositiv, Erwägung, in Kraft, SR, BGE, Kreisschreiben, Fundstelle …): gepunktete Unterstreichung + Erklärung. **Touch-tauglich (§0/4a):** NICHT nur `title` — Muster ist ein fokussierbarer `<button>` mit `aria-describedby` und Klick/Fokus-Toggle (Popover-Text auch für Touch und Screenreader erreichbar, Escape schliesst). Wird von StatusBadge-Erklärtexten und KontextGruppe-Overlines konsumiert. Billigster Hebel, der alle anderen Elemente für Steuerbeamte/Studierende aufwertet — aber ehrlich eingepreist (~½–1 Tag, nicht «nebenbei»).

### Grammatik-Regeln (verbindlich)

1. **⧉ dort, wo der Nutzer liest und vergleichen will:** KontextPanel-Chips + NormPopover — immer unter dem bestehenden Gating (`kannOeffnen && !istOffen`, ≥lg, pane-sicher). Kein ⧉-Zwang an jedem Chip.
2. **Zahl + Richtung statt Farbe/Ampel.** R16 bleibt zu, bis Treatment-Daten existieren (auf keiner Etappe dieses Plans).
3. **`herkunft` ist Pflichtfeld** — kein Element rendert ohne. Badges markieren nur Abweichungen; der kuratierte Normalfall bleibt nackt.
4. **Bandjahr-Präzision nie als Tagesdatum.**
5. **Neue Verzahnung = Prop/Eintrag am bestehenden Element, nie neues Widget.**
6. **Zähler-Formel:** immer «n **erfasste** Urteile/Entscheide …» — nie Vollzähligkeit suggerieren, nie «wichtigste», nie «noch gültig».
7. **Provenienz nie gemischt:** eine Rangliste/Sortierung speist sich pro Erlass aus GENAU einer Quelle (Alt-Gewicht ODER E4-Rangliste), nie halb/halb.

---

## 2. Soll-Bild je Oberfläche

### 2.1 GesetzLeser — Artikel als Hub

**Dazu (V1):**
- **LeitfallZeile-Umbau** (ehrlich so benannt, nicht «Badge-Swap»): ★-Span → ★-Glyph mit `aria-label` (StatusBadge-Erklärtext), Chips → `KantenChip` (Dichte-Regel), `MehrKante` (lokaler Zweig). Eigentümer-Knoten `parts.tsx` — **erst nach Merge von `fix/leitentscheid-stern-tooltip`**, dessen Einzel-Fix darin aufgeht.
- **Artikel-Sublabels** in der KontextPanel-Entscheide-Gruppe («via Art. 257d») aus dem ohnehin geladenen Shard — behebt das Granularitäts-Gefälle (Top-8 am OR-Ende ohne Artikelbezug) ohne neue Daten.
- Verweise-Zeile (David-Referenz, bleibt!) rendert dieselben `KantenChip`s.

**Dazu (V1b, separat gated):** E4-lokal-`norm_rangliste` ersetzt build-time das heutige `gewicht` in den Shards — Tooltip: «n erfasste Urteile zitieren diesen Artikel».

**Bewusst NICHT:** keine Rückwärts-Norm→Norm-Zeile am Artikel (wartet auf law-code-Kanonisierung + Serving); keine Zitierzahlen im Fliesstext; kein Panel im Lesetext — alles am Artikelfuss, idle-geladen, CLS 0.

### 2.2 EntscheidLeser — beide Richtungen (der grösste V1-Gewinn: zwei tote Felder werden lebendig)

- **KontextGruppe «Zitierte Normen» (vorwärts), am Panel/Dokumentfuss** (§0/1d — nicht unter dem Kopf; die Regeste bleibt oben ungestört): `zitierteNormen` (artikelscharf!) als `KantenChip`s, ersetzt dort die grobe Erlass-Gruppe (keine Doppel-Darstellung). Chips springen zur Fundstelle, sobald `feat/entscheid-verweis-praezision` gemergt ist (konsumieren, nicht doppeln).
- **KontextGruppe «Zitiert» (rückwärts), Rausch-frei (§0/1c):** `zitierteEntscheide` gegen das kuratierte Manifest aufgelöst. Dargestellt werden: **Zähler** («zitiert m erfasste Entscheide, davon k im Korpus») + **nur die k aufgelösten Treffer als Link-Chips** + **EIN Hinweissatz** «Übrige Zitate maschinell aus dem Urteilstext gelesen — im Korpus (noch) nicht erfasst». Keine grauen Nicht-Link-Chip-Reihen.
- **KontextGruppe «Wird zitiert von» (V2, Edge/`zitat_kanten`):** «n erfasste spätere Entscheide zitieren dieses Urteil» + Top-Chips + `MehrKante (online)`. **Nie «noch gültig ✓»** (Schema kennt keine Überruf-Markierung; §8-rote Linie).

**Bewusst NICHT:** keine Precedent-Map/Netzgrafik; keine Timeline zitierender Entscheide vor Q1-Bereinigung.

### 2.3 MaterialLeser / künftige KS-Seite

**V1:** kontexttyp-spezifischer Ehrlichkeits-Hinweis (Zwei-Stufen-Indirektion benennen), ⧉ nachrüsten (Gating). Sonst bewusst minimal.
**V3 (E6a):** vierte `KontextTyp`-Ausprägung `'verwaltungsverordnung'`; KS-Seite = MaterialLeser-Erweiterung mit Behörden-Overline (ESTV/BSV/FINMA/SEM), `StatusBadge nur-verweis` vs. Volltext (nur ESTV-MWST hat strukturiertes `legalBasis`-Mapping — der Chip darf keine Struktur-Tiefe suggerieren, die nicht da ist); Historie-Timeline nur wo echte Versionsdaten existieren (BSV `?version=N`) — sonst schlichte Vorgänger/Nachfolger-Liste, keine leere Zeitachse.

### 2.4 Suche

**V1:** Leitentscheid-Badge in `SuchResultate.tsx` → `StatusBadge` (Volltext-Variante; drittes Vokabular verschwindet). Online-Gruppe-Muster (immer unten, ehrliche Degradation) bleibt unangetastet — es ist das Vorbild.
**V2:** Masse-Treffer tragen `StatusBadge masse`; Long-Tail-Deep-Link rendert DENSELBEN EntscheidLeser (FAHRPLAN-DATENHALTUNG §11.1, kein zweiter Reader).
**Nicht:** keine Verzahnungs-Vorschau in Suchtreffern (Dichte).

### 2.5 Split-View als Verzahnungs-Werkzeug

V1 schliesst die Affordance-Lücken: ⧉ auf KontextPanel-Entscheide/Materialien und im NormPopover — unter dem bestehenden Gating. `usePaneLayout` unverändert; nur Aufrufer kommen dazu. Kein Resize-Gutter-Scope hier.

### 2.6 KontextPanel-Zukunft + Startseite

V2 refactored auf die Registry (dann gerechtfertigt); V3 fügt `verwaltungsverordnung` als Eintrag hinzu. Startseite/Topbar: **nur Andockpunkt notiert** (spätere Idee: «Meistzitierte Artikel»-Kachel aus `norm_rangliste`) — **Sperrfläche W2·5c (Startseite-V3), hier nichts bauen.**

---

## 3. Etappen

### V1a — JETZT, vor dem VPS (nur vorhandene Daten) — der Bau-Schritt

| Paket | Inhalt | Dateien | Aufwand |
|---|---|---|---|
| **V1.1 Fundament** | `VerzahnungsKante`-Typ, `StatusBadge` (ohne `kuratiert`), `KantenChip` (Dichte-Regel), `MehrKante` (2 Zustände), `Begriff`+Glossar (touch-taugliche Tooltips) | NEU: `src/lib/verzahnung/{typen,glossar}.ts`; `src/components/verzahnung/{StatusBadge,KantenChip,MehrKante,Begriff}.tsx` | ~1 Tag |
| **V1.2 Vereinheitlichung** | 4 Leitentscheid-Darstellungen → StatusBadge/★-Glyph; LeitfallZeile-Umbau; Chips → KantenChip; Gruppen-Props (Overline/Zähler/Hinweis); ⧉-Lücken (Panel+Popover, Gating); Artikel-Sublabels | `KontextPanel.tsx`, `parts.tsx`, `SuchResultate.tsx`, `NormPopover.tsx` | ~1½ Tage |
| **V1.3 Entscheid beide Richtungen** | «Zitierte Normen»-Gruppe (Fuss) + «Zitiert»-Gruppe (Zähler + aufgelöste Treffer + Hinweissatz); Resolver | `EntscheidLeser.tsx`, `lib/kontext.ts`, `lib/verzahnung/` | ~1 Tag |
| Puffer | e2e (5 Leit-Testfälle), a11y-Pass, §15-Visual-Check mobil | — | ~½–1 Tag |

**Aufwand ehrlich: 4–5 Tage** (nicht 3 — Tooltips, 4 Oberflächen, e2e).

**Tore/DoD V1a:**
- `check:perf-budget` + Lighthouse-CLS = 0 auf der OR-Seite (Chips idle-lazy, keine Reservierung versteckt Inhalt).
- Golden Normtext byte-gleich (reine UI, keine Datenänderung in V1a).
- a11y: jedes Badge/jeder ★-Glyph hat `aria-label`; Glossar-Tooltips fokussier- und touch-bedienbar; Screenreader-Stichprobe.
- **Wortfeld-Tor:** `grep -rn "geprüft\|gegengeprüft\|verifiziert" src/lib/verzahnung src/components/verzahnung` = 0 Treffer in Nutzertexten.
- e2e (Playwright via Bash, nie MCP): die 5 Leit-Testfälle (§4).
- §9 vor Push/Deploy (deploy-check-Skill).

### V1c — Normrevisions-Ehrlichkeit (David-Input 3.7.2026, §1-Korrektheitsthema)

**Problem (O-Ton David):** «da gesetze immer wieder revision haben kann ein alter entscheid
nicht unbesehen an die norm angehängt werden sofern sich die norm revidiert hat.» Ein
Entscheid von 1995 legt die *damals* geltende Fassung aus — hängt er kommentarlos am
heutigen Artikel, ist das eine stille Falschaussage (§1/§8).

**Datenlage (verifiziert 3.7.):** Die Struktur-Sidecars (`public/normtext/struktur/bund/*.json`)
tragen je Artikel die amtlichen Revisions-Fussnoten mit `absatz`-Zuordnung und maschinenlesbarem
Datum («Fassung gemäss … , in Kraft seit 1. Jan. 2017 (AS …)»; OR allein: 692 ×). Daraus ist
**je Artikel das Datum der letzten Textänderung deterministisch ableitbar** — quell-belegt
(AS-Zitat), ohne Heuristik.

**Klassifikations-Modell (deterministisch):** je Kante (Entscheid-Datum `d`, Artikel `a`):
`r(a)` = max «in Kraft seit»-Datum der Fussnoten von `a` (keine Fussnote → Urfassung).
- `d < r(a)` ⇒ **`fassungsBezug: 'revidiert'`** — beweisbar, Badge gerechtfertigt.
- `d ≥ r(a)` ⇒ `'gleich'` — Artikeltext heute == Fassung im Entscheidzeitpunkt. **Kein**
  positives «noch aktuell»-Siegel daraus machen (R16/Scheinautorität — Kontextnormen können
  sich geändert haben); `'gleich'` bleibt UI-still.
- Q1-Bandjahr: nur `'revidiert'`, wenn Revisions-**Jahr** > Bandjahr (strikt); sonst `'unbekannt'`.
- Kantonal/ohne Sidecar/aufgehoben: `'unbekannt'` → nur der Gruppen-Hinweissatz.

**Typ-Slot (V1.1 sofort):** `VerzahnungsKante` erhält
`fassungsBezug?: 'gleich' | 'revidiert' | 'unbekannt';  // V1c-Slot, quelle: struktur-Fussnoten`.

**Etappen:**
- **In V1a (billig, sofort):** ehrlicher Gruppen-Hinweissatz an Leitfall-/Zitiert-Gruppen
  («Entscheide beziehen sich auf die im Entscheidzeitpunkt geltende Fassung») + der Typ-Slot.
  Keine toten UI-Zweige.
- **V1c-Bau (eigener PR nach V1a, ~1 Tag, VOR VPS machbar):** (1) Build-time-Extrakt
  `artikel-revisionen` je Erlass (Parser über Sidecar-Fussnoten, max-Datum je Artikel;
  deutsches Datumsformat deterministisch, mehrere Fussnoten → max). (2) Klassifikation an
  den Kanten in Panel/EntscheidLeser/LeitfallZeile. (3) `StatusBadge`-Variante `revidiert`
  («Norm revidiert seit Entscheid», Tooltip: Revisionsdatum + AS-Fundstelle + Link zur
  Fussnote). **Extraktions-Risikopfad ⇒ `check:gegenpruefung` PFLICHT** + Stichproben-Tor
  gegen Fedlex (10 Artikel handverglichen) + Negativ-Test (Artikel ohne Fussnote).
- **V2/DB:** `fassungs_bezug`/`artikel_revisionsdatum` als Spalte der Kanten-Lieferung
  (`norm_referenzen`/`zitat_kanten`), damit Long-Tail ohne Client-Parse klassifiziert;
  Fedlex-Portfolio **Paket 5** (AS-Änderungshistorie) liefert später die volle
  Versions-Timeline → Artikel-Fassungs-Intervalle + Anzeige der *damaligen* Fassung
  (Historie-Nordstern). eId-Renummerierungen (Reshuffle-Fälle asylv2/svg/…) löst erst
  diese Timeline; bis dahin deckt `'revidiert'`/`'unbekannt'` ehrlich ab.
- **Rangliste/V1b unberührt:** `gewicht` bleibt historische Zitier-Tatsache; die
  Offenlegung geschieht an der Kante, nicht durch Um-Gewichtung.

### V1b — Rangliste einbacken (SEPARAT, gated — §0/2c/4b)

- **Gate:** law-code-Kanonisierung der betroffenen Erlasse fertig (Branch-Umfeld `feat/qs-data-e4-lokal`). Kein Teil-Plan-B mit gemischter Provenienz: pro Erlass-Shard wird das `gewicht` ENTWEDER vollständig aus `norm_rangliste` ersetzt ODER vollständig beim Alt-Gewicht belassen (Shard-Feld `gewichtQuelle: 'alt' | 'e4'`, Renderer-neutral, aber auditierbar).
- Inhalt: build-time-Ersatz in den 19 `public/rechtsprechung/norm-index/*`-Shards; Oracle-Tor gegen heutige Top-5 je Erlass (Erklärbarkeit jeder Rangänderung).
- **Tore/DoD:** Shard-Regeneration = Extraktions-Risikopfad → **`check:gegenpruefung` PFLICHT** + Oracle-Tor + `QS-GP`-Stichprobe; golden unberührt.
- Aufwand ~1 Tag nach Gate.

**Ausführungsvermerk (4.7.2026, Branch `feat/vzui-v1b-rangliste`):** Gebaut. masse.db deterministisch neu aus den voilaj-Parquets (`daten/poc/`) gebaut — 195 342 Entscheide (Anker-genau), Resolve-Quote 0,8245 (Anker-genau), `norm_rangliste` 1 387 680 Zeilen/maxGewicht 12413. Neues Skript `scripts/datenhaltung/backe-rangliste-shards.ts` (npm `datenhaltung:backe-rangliste-shards`, LOKAL — masse.db gitignored) ersetzt das `gewicht` in den 19 Shards; Provenienz-Regel implementiert als **Monotonie-Gate**: ein Erlass wird nur `'e4'`, wenn JEDER Leitfall auflösbar UND `gewicht ≥ alt` (vintage-absent/Recall-Delta ⇒ ganzer Shard bleibt `'alt'`, nie gemischt). Ergebnis **5 e4** (AHVG, AVIG, BVG, ELG, VVG) / **14 alt** (überwiegend Band-152-BGE neuer als der gepinnte Snapshot). `masseId`-Brücke in `masse-korpus-bruecke.ts` mit dem Oracle geteilt (§5). Neues Feld `LeitfallShard.gewichtQuelle`; `baueShards` schreibt Default `'alt'`; die Ordnung `vergleicheLeitfaelle` ist nun EIN Export (§5). **Oracle-Tor** (`datenhaltung:rangliste-oracle`) GRÜN: 931 Tripel, 462 identisch / 284 korrekt-erhöht / 178 vintage-absent / 7 erklärt-delta / **0 UNERKLÄRT**. Der CI-seitige `check:entscheide`-Shard-Check wurde von deep-equal auf **Membership + Nicht-gewicht-Byte-Gleichheit + Provenienz + Monotonie + Sortierung** umgestellt (masse-frei, committet-vs-committet; das volle Vintage/Recall-Beweistor bleibt das lokale Oracle). **727a-Vorbestands-Bug** gefixt: `normArtikelToken` strippt jetzt `_` (`/[\s_]+/g`, identisch zu `kanonArtikelToken` im V1c-Pfad), Reader-Query `727_a` trifft Shard-Token `727a`; Regressionstest beide Richtungen. **Tooltip** («n erfasste Urteile zitieren…»): geprüft — heute wird `gewicht` NUR zur Sortierung genutzt, es existiert kein Zähler-Tooltip, der lügen könnte; kein UI-Text geändert (kein neues Widget, §6-NICHT-Liste). Golden 201 byte-gleich, tsc/lint/leitfall+artikel-index-Tests grün, Gegenprüfung bestanden (unabhängige Re-Derivation e4-ELG 9/9, alt-OR 0 Abweichungen + Blocker vintage-belegt, 727a am Artefakt).

### V2 — mit E3-Serving/VPS (Masse über Edge)

- Registry-Refactor `KONTEXT_GRUPPEN` (jetzt gerechtfertigt: fünfter, asynchroner Gruppentyp) + «Wird zitiert von»-Eintrag mit Edge-Query auf `zitat_kanten` (Rückwärtsindex `ix_zitat_nach`).
- **Fundstellen-Spalte in der Kanten-Lieferung (Davids DB-Hinweis 3.7.):** `zitat_kanten`/`norm_referenzen` liefern die Erwägungs-Fundstelle (E.-Marke bzw. Anker) als Spalte mit aus — der Fundstellen-Sprung (V1a: client-seitige `ersteFundstelle`/`ersteTextFundstelle`-Auflösung über die geladenen Schaufenster-Snapshots) funktioniert damit auch für Long-Tail-Entscheide ohne Client-Parse.
- `MehrKante`-Online-Zustand bauen (LeitfallZeile + «Wird zitiert von»), §8-Satz «Anfrage verlässt dafür den Browser».
- `StatusBadge masse` auf Long-Tail-Treffern; Long-Tail-Route rendert denselben EntscheidLeser.
- `konfidenz`-Marker am KantenChip aktivieren (`regex-niedrig`/`unresolved` sichtbar; `bge_pincite`-Kanten wegen 0,02-Auflösung gar nicht ausspielen).
- **DoD:** Degradations-Test (Edge down → Gruppe verschwindet still, wie Online-Suche heute) · Q1-Unit-Test: kein `praezision:'bandjahr'` rendert je ein Tagesdatum · Wortfeld-Tor erneut · kein String «gültig» in Verzahnungs-UI.
- Aufwand ~2–2½ Tage (inkl. Registry-Refactor), kein UI-Umbau an den Elementen — Datenpfade in vorbereitete Slots.

### V3 — mit E6a (Soft-Law/KS, Historie)

- `KontextTyp` + Registry um `'verwaltungsverordnung'` erweitern; KS-Seite auf MaterialLeser-Basis; `StatusBadge nur-verweis`; ESTV-MWST-`legalBasis` als erste artikelscharfe Material-Kante (hebt Materialien vom Erlass- aufs Artikel-Niveau — derselbe `KantenChip`, nur bessere `fundstelle`).
- Historie als eigenes, letztes Grammatik-Element `VersionsLeiste` — NUR wo echte Versionsdaten (BSV) bzw. eigene Snapshots existieren; `erlass_fassungen`-Stand-Chip am Artikel («Fassung galt von–bis») dockt hier an.
- Aufwand ~2–3 Tage nach Datenlage.

---

## 4. Die 5 Magic Moments als Leit-Testfälle (e2e-Sollsätze)

1. **Steuerbeamter auf Art. 16 DBG** sieht in EINEM Blick: Leitfall-Chips + Materialien + Werkzeuge (V1), ab V3 zusätzlich die ESTV-KS-Gruppe «Legt aus» — ohne Insider-Vokabular (Begriff-Tooltips tragen es). *Test: Artikel-Fuss enthält ≥2 Kontextgruppen, jede mit Overline + Zähler + Herkunfts-Hinweis; CLS = 0.*
2. **Anwältin im BGE 147 III 209** findet am Dokumentfuss «Zitierte Normen» artikelscharf (Sprung zur Fundstelle) + «Zitiert»-Gruppe mit Zähler und nur aufgelösten Chips (V1); ab V2 «Wird zitiert von: n erfasste spätere Entscheide» — nirgends ein «gültig»-Häkchen. *Test: Gruppen gerendert; kein Element enthält die Strings «gültig», «geprüft».*
3. **Gericht liest Entscheid, schlägt Norm nach:** NormInline → Popover → ⧉ öffnet die Norm daneben, der Entscheid bleibt offen. *Test (≥lg): Pane-Count = 2, Entscheid-Scroll-Position erhalten; auf Mobile erscheint kein ⧉.*
4. **Studentin am ★** bekommt an allen vier Fundorten (Suche, Panel, Zeile, Reader) dieselbe Erklärung, auch per Tastatur/Touch. *Test: `aria-label` textgleich an allen Vorkommen; Tooltip per Fokus + Tap erreichbar.*
5. **Nutzer am OR-Ende** sieht Top-Entscheide MIT Artikel-Sublabel («via Art. 257d») statt kontextloser Top-8; nach V1b entspricht die Sortierung der E4-Rangliste mit einheitlicher Provenienz. *Test: jeder Panel-Entscheid-Chip trägt Sublabel; V1b: Oracle-Vergleich + `gewichtQuelle` einheitlich pro Shard.*

---

## 5. Erweiterungspunkte (Andocken statt Umbauen)

Kommentar-Konvention `// Erweiterungspunkt V2/V3: …` (Weiche-B-Stil), keine toten Zweige:

| V1-Element | dockt an in V2/V3 |
|---|---|
| `VerzahnungsKante.konfidenz` (ungenutzt) | E4-Konfidenzstufen (V2) |
| `VerzahnungsKante.datum.praezision` | Q1-sichere Sortierung/Timeline (V2/V3) |
| `MehrKante` (2 Zustände) | dritter Zustand «online» (V2, Kommentar-Slot) |
| 4 JSX-Gruppen + Gruppen-Props | Registry-Refactor + «Wird zitiert von» (V2), `verwaltungsverordnung` (V3) |
| `StatusBadge`-Enum | `masse` (V2), `nur-verweis` (V3) — je 1 Variante |
| `KantenChip.fundstelle` | Erwägungs-Anker (Branch in Bau), ESTV-`legalBasis` (V3) |
| Shard-Feld `gewichtQuelle` (V1b) | vollständiger E4-Umstieg aller Erlasse |
| Startseiten-Kachel «Meistzitierte Artikel» | NUR notierter Andockpunkt (nach W2·5c, nichts bauen) |

---

## 6. Bewusst-NICHT-Liste

- **Kein `kuratiert`-Badge** (Normalfall bleibt nackt) und **kein «geprüft»-Wortfeld** irgendwo (§7).
- **Keine Ampel-/Treatment-Farben** (überruled/bestätigt) — ohne Treatment-Daten wäre das Scheinautorität; der Burggraben ist die ehrliche Dichte, nicht die geliehene Farbe.
- **Keine Registry in V1**, kein toter Online-Zweig, kein ⧉-Zwang an jedem Chip.
- **Keine grauen Nicht-Link-Chip-Reihen** (Zähler + Hinweissatz statt Chip-Wüste).
- **Keine Zitierte-Normen-Fläche unter dem Kopf** (Regeste bleibt oben; alles am Fuss).
- Keine Precedent-Map/Netzgrafik; keine Timeline vor Q1-Bereinigung; keine Verzahnungs-Vorschau in Suchtreffern; keine Zitierzahlen im Fliesstext; keine Rückwärts-Norm→Norm-Zeile in V1; kein zweiter Reader für Long-Tail; keine Startseiten-Kachel jetzt.

---

## 7. Kollisions-/Sequenz-Hinweise

- **Einsortierung: V1a läuft VOR den VPS-/Serving-Arbeiten** (E3-Konsum-UI, E4-Serving) — reine UI auf vorhandenen Daten, kein 26×-Bezug (kein Massenimport; Leitprinzip 4), darf PARALLEL zum slot-haltenden E3-Import laufen (disjunkte Dateiflächen zur Import-Pipeline).
- **Merge-Reihenfolge (hart):** (1) `fix/leitentscheid-stern-tooltip` mergen → geht in V1.2 auf. (2) `feat/entscheid-verweis-praezision` mergen → **V1.3 startet erst danach** (EntscheidLeser.tsx hat sonst drei Schreiber). (3) Innerhalb V1: V1.2 und V1.3 sequenziell, nie parallel auf `EntscheidLeser.tsx`.
- **Datei-Eigentümer-Regel (GESAMTAUFBAU Risiko 5):** `parts.tsx` ist §12-Kollisionsfläche von **W2·5b** (reader-wt) — vor V1.2 Eigentümerschaft klären: entweder W2·5b-Reader-Worktree ruht auf `parts.tsx`, oder V1.2 rebased dahinter. Ein Schreiber pro Knoten pro Phase.
- **Startseite:** W2·5c-Kollisionsflächen (`Startseite.tsx`, `components/start`, `Topbar.tsx` …) werden NICHT berührt — Andockpunkt nur dokumentiert.
- **V1b:** eigener Branch, gated auf law-code-Kanonisierung; Shards regenerieren = Risikopfad → `check:gegenpruefung` + `QS-GP`.
- **Worktree:** ja (Daueranweisung Parallel-Sessions; Kollisionsliste s. @meta unten).

---

## ROADMAP-EINBAU (für Opus)

**1) Neuer ROADMAP-Schritt — exakter Text.** Einfügen in `ROADMAP.md`, **Welle 2, direkt NACH dem kompletten Schritt-6-Block** (d. h. nach dem letzten W2·6-Unterpunkt «BGE-Auszug abgeschnitten …», derzeit vor Zeile «- [ ] **7 · Verzahnungs-Klingen**») **und VOR Schritt 7** — damit steht er nach dem W2·6-DATA-Kontext und vor den Serving-Konsumenten:

```markdown
- [ ] **6-VZUI · Verzahnung sichtbar machen** *(David-Auftrag 3.7.2026; reine UI auf vorhandenen Daten)*:
  <!-- @meta id: W2·7-VZUI · status: ready · of: ja · blocker: null · dep: [] · kollision: [src/pages/gesetz-leser/parts.tsx, src/components/kontext/KontextPanel.tsx, src/pages/EntscheidLeser.tsx, src/components/NormPopover.tsx, src/components/suche/SuchResultate.tsx] · worktree: ja · 26x: nein · fahrplan: FAHRPLAN-VERZAHNUNG-UI.md -->
  EINE Interaktions-Grammatik (KantenChip · StatusBadge nur-Abweichung · KontextGruppe-Overlines ·
  MehrKante · FundstellenAnker · Begriff-Glossar) über GesetzLeser/EntscheidLeser/MaterialLeser/Suche/
  Split-View. **V1a JETZT vor VPS** (4 Leitentscheid-Darstellungen vereinheitlicht, EntscheidLeser beide
  Richtungen am Fuss, Artikel-Sublabels, ⧉ Panel+Popover unter Pane-Gating) · **V1b** Rangliste-Einbacken
  (gated: law-code-Kanonisierung; Provenienz nie gemischt; `check:gegenpruefung`) · **V2** Masse/Edge
  (Registry + «Wird zitiert von» + `masse`-Badge, mit E3-Serving) · **V3** Soft-Law (E6a-Anschluss,
  `nur-verweis`, VersionsLeiste). §7-Wortfeld-Tor («geprüft» verboten), R16 zu, Q1 Bandjahr, CLS 0.
  **Sequenz:** erst `fix/leitentscheid-stern-tooltip` + `feat/entscheid-verweis-praezision` mergen;
  `parts.tsx`-Eigentümerschaft mit W2·5b klären. Kein 26×-Bezug — parallel zu E3 fahrbar.
  Startseiten-Kachel «Meistzitierte Artikel» = nur Andockpunkt (nach W2·5c), Sperrfläche.
  **Detailquelle:** `FAHRPLAN-VERZAHNUNG-UI.md`.
```

(ID-Wahl `W2·7-VZUI`: gegen `scripts/plan/inventar.ts` geprüft — nicht vorhanden, kollisionsfrei; lehnt sich an W2·7 «Verzahnungs-Klingen» an, dem der Schritt thematisch vorgelagert ist.)

**2) `scripts/plan/inventar.ts`-Ergänzung.** In der Sub-ID-Zeile (aktuell Zeile 9) ergänzen:

```ts
  'W2·6-B', 'W2·6-DATA', 'W2·7-VZUI',
```

**3) Slot-Hinweis.** `26x: nein` — reine UI + (V1b) Regeneration bereits committeter Shards, KEIN neuer Massenimport (Leitprinzip 4, gleiche Klarstellung wie beim Reverse-Ingest). Der 26×-Slot bleibt bei E3 (W2·6-DATA, `slot: inhaber`); die `@slot-kette` in `ROADMAP.md` (Z. ~118) bleibt unverändert.

**4) Querverweise (je 1 Zeile, keine Umbauten):**
- `FAHRPLAN-DATENHALTUNG.md` **§11** («Darstellung — drei Reader + EIN Kontext-Layer»): Verweiszeile ergänzen: *«UI-Grammatik der Verzahnung (Chips/Badges/Gruppen/⧉) detailliert `FAHRPLAN-VERZAHNUNG-UI.md` (W2·7-VZUI); §11.2-Leitfälle-Chips werden dort konsumiert/vereinheitlicht, der Weiche-B-Masse-Anteil ist dessen V2.»*
- `FAHRPLAN-GESAMTAUFBAU.md`, Leitgedanke «Verzahnung als Organisationsprinzip»: V1a/V1b der laufenden Phase (Phase 1-Fenster, UI-Bahn, kollisionsarm zu QS-DATA) zuordnen; V2 an Phase 3 (E4 Zitat-Graph + Serving) und V3 an den E6a-Vorzug (David 3.7.: E6a vorgezogen, Bahn-A-Nebengleis nach Phase 3/4) anbinden.
- `FAHRPLAN-VERZAHNUNG-UI.md` = diese Datei, im Repo-Wurzelverzeichnis ablegen.

**Absolute Pfade (Bau-Referenz):** `/Users/david/Developer/LexMetrik/src/components/kontext/KontextPanel.tsx` · `/Users/david/Developer/LexMetrik/src/lib/kontext.ts` · `/Users/david/Developer/LexMetrik/src/pages/gesetz-leser/parts.tsx` · `/Users/david/Developer/LexMetrik/src/pages/EntscheidLeser.tsx` · `/Users/david/Developer/LexMetrik/src/components/NormPopover.tsx` · `/Users/david/Developer/LexMetrik/src/components/suche/SuchResultate.tsx` · `/Users/david/Developer/LexMetrik/src/lib/rechtsprechung/{typen.ts,norm-index.ts}` · `/Users/david/Developer/LexMetrik/src/index.css` (Token) · `/Users/david/Developer/LexMetrik/scripts/plan/inventar.ts` · `/Users/david/Developer/LexMetrik/ROADMAP.md` · NEU: `/Users/david/Developer/LexMetrik/src/lib/verzahnung/` + `/Users/david/Developer/LexMetrik/src/components/verzahnung/` + `/Users/david/Developer/LexMetrik/FAHRPLAN-VERZAHNUNG-UI.md`.
