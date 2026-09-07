# R9 Konsolidierung (Orchestrator, 6.9.2026, Basis 89596edf8 — VOR Landung f1i/r10c/r6d/1g)

Quellen: r9-befunde-a.md (A: nur curl+grep, keine Browser-Messung — Welle A ist auf dem gelandeten Stand
zu WIEDERHOLEN), r9-befunde-b.md (B: Playwright, 1 Theme × 1440, 12 Screens), r9-befunde-c.md (C: nur grep).
Lehre für den nächsten Finder-Dispatch: ausdrücklich «Playwright als Node-Skript aus node_modules
(`node script.mjs`, `import { chromium } from 'playwright'`), KEIN MCP-Browser-Tool nötig» — zwei von drei
Sonnet-Findern suchten ein Browser-Tool und fielen auf grep zurück. → in FINDER-AUFTRAG.md/PRUEFER-AUFTRAG.md
verankern (Dispatch-Vorlage, Formregel Skill `lehren`).

## Fix-Kandidaten (Konsumenten auf Baustein ziehen, §5/§10) — nach Fläche gebündelt
### Fläche 1 · Vorlagen/Rechner (src/pages/Vorlage*, components/vorlagen, components/forms, ErgebnisAnzeige)
- C4-1 blockierend: 7 handgebaute Fehlerboxen → `.lc-notice-danger` (vorlagen/ui.tsx:360, GewaehrleistungForm.tsx:314,
  VorlageSchlichtungsgesuchBs.tsx:513, VorlageAgGruendung.tsx:124+366, Dokumentmappe.tsx:65, Kontakt.tsx:76);
  Wächter: Aufrufstellen-Sonde analog leerzustand-d7.test.tsx (Rot-Probe).
- C4-2 mittel: ErgebnisAnzeige.tsx:173/178 Herleitung/Annahmen `bg-warn-bg` + `rounded-md` Aussenrahmen → `.lc-notice-warn`
  oder `.lc-card`-Linienform; `rounded-md` ist Radius-Verstoss.
- B-F1 kosmetisch: 50-px-Feldhöhe in RechnerTagerechner.tsx als dritte Höhe → auf `.lc-input`/`.lc-input-sm` ziehen.
- B-K1 hoch (Teil): rohe `<button>` in RechnerTagerechner.tsx:247 u. a. → `.lc-btn-mini`/`-ghost`.
### Fläche 2 · Rechtsprechung/Start (components/rechtsprechung, components/start, EntscheidLeser)
- C1-1 hoch: «Leitentscheid» Badge (EntscheidKarte.tsx:52 `.lc-badge-ok`) vs. Fettdruck (EntscheideListe.tsx:164) → Badge.
  ACHTUNG Prüfer D23 F4: «★-Glyph → Wort» — Wort ja, aber Badge-Kasten? Zielbild «keine Chips/Kästen» — `.lc-badge`
  ist Umriss (Rahmen 1px). Entscheid: Badge-Baustein bleibt (dokumentierter Entscheid 6.6./31.8.), eine Form.
- A-3 mittel: EntscheideListe.tsx:41-44 lokales `deDatum` → `<Datum>`/`datumCh` (§5).
- C1-2 kosmetisch: «Aufgehoben»/«aufgehoben» Casing (ErlassKarte.tsx:51 vs. Gesetze.tsx:203) → R7 Wortliste.
- B-K1 hoch (Teil): EntscheidLeser.tsx:694/827/831/837/842 rohe `<button>` → `.lc-btn-*`.
### Fläche 3 · UI-Bausteine/Token (components/ui, index.css)
- B-R1 hoch: `ui/Tabs.tsx` Box-Chip (`bg-surface-raised text-brass-700 shadow-sm border`, h-11/h-9, 14px/500) vs.
  Arbeitsleiste (Fett/Unterstrich) → `ui/Tabs.tsx` auf Unterstrich-Anatomie (Registerfarbe/ink-900 Strich, kein
  Rahmen/Schatten, `brass-700` raus); Wächter `design-r5-konsistenz` erweitern. Konsumenten: Rechner-Reiter u. a.
- B-L1 mittel: ≥4 Inline-Textlink-Rezepte (underline 106×, dotted VERWEIS_RUHE 6× NormText.tsx:88/KantonQuelleLink/
  RechtsprechungLink, hover-only 2× ZweiachsigerEinstieg.tsx:49/Katalog…, .rsp-prose border) → EINE Regel `.lc-link`
  in index.css (oder globale `a`-Regel für Inline-Text mit `text-decoration: underline; text-underline-offset`), dotted
  nur als bewusste Verweis-Ruhe im Normtext (§13 farbfrei) — Ausnahme dokumentieren; hover-only abschaffen (R3-F1, P3).
- B-M1 mittel: Menü-Items Sprache 14/500 vs. Ansicht 14/400 → ein Item-Rezept in `ui/Menue`/`.lc-schwebeflaeche`.
- B-K1 hoch: ~220 rohe `<button>` app-weit (grobe Zählung) → Sweep mit Wächter «button ohne lc-btn*/lc-chip/lc-tab/
  fc-schalter/role=tab» (Allowlist mit Grund: native Controls, Reiter). Grosse Fläche — als eigene Welle, evtl. Jules.
- C3-1 kosmetisch: SucheLeerzustand.tsx:71 → `ui/Leerzustand` importieren; Sonde leerzustand-d7 erweitern.
### Offen / Deutungsfragen
- C7-1: «Jüngster Eintrag»-Zeile (D8) in Topbar/Sidebar/Start, NICHT im Footer — D8 nennt «Startseite (Fuss/Entscheid-
  Sektion) + Seitenleisten-Fuss + Ausgabe-Zeile im Titelblatt» als Konsumenten; Footer.tsx nicht genannt → KEIN Fund.
  Aber: dreifach sichtbar (Topbar + Sidebar + Start) = Dopplung? → R7/Kopf-Ortsprüfung (D4) klären, nicht R9.
- Nicht geprüft (alle Wellen): Split-View, Dunkelmodus, @390, Materialien, Einstellungen, Suche-Treffer, Wizard-Schritt-
  leiste, Reiter-Überlauf-Blatt, Kontextmenü, «Startseite anpassen»-Blatt, Filter/Sortierung /rechtsprechung,
  Entscheid-Zitierung visuell, Randtitel vs. Modul-Marginalien. → Welle A' (Typografie, Playwright) + Welle D
  (Lücken B/C: dunkel/@390/Split/Menüs) NACH der Landung.

## Schon einheitlich (nicht anfassen)
Seitenkopf (`ui/SeitenTitel` + `.ub-ausgabe`), `.lc-overline`, `.num`/Tausendertrenner, NormChip, Fussnoten-Apparat,
`.lc-card`, `ListenTabelle` (D24, bewusste Grid-Ausnahme), `ui/Leerzustand` (>30 Konsumenten), `.lc-notice`-Basis,
`OrtsAngabe`-Krume (D27 im Gesetzesleser korrekt leer), `.lc-schwebeflaeche`-Hülle, `.lc-input`-Anatomie, `.lc-btn*`
Fokus-Ring, `FacettenGruppe` (`.fc-schalter`), Nav-/Listen-Links ohne Unterstrich (Konvention).
