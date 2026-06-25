# Recherche UI-/Visual-Design für Lexmetrik (25.6.2026)

Doppelt verifizierte Deep-Research (Fan-out-Suchen → 29 Quellen → 123 Claims →
adversariale Verifikation; 112 Agenten). Grundlage für **Block F · UI-Design**
im `DESIGN-REGLEMENT.md`. Quellen sind Designsystem-Doku (IBM Carbon, Atlassian,
Material 3) und Standards/Forschung (W3C WCAG 2.2, Nielsen Norman Group,
Stanford/Fogg). **Vorbehalt:** Designsystem-Pixelwerte sind herstellerspezifische
Konventionen, keine Naturgesetze — das *Prinzip* übernehmen (Token-Disziplin,
grosszügige Formular-Gutter, Dichte-Stufen), nicht die exakten px dogmatisch.

## Verifizierte Kernbefunde

1. **Spacing/Grid token-basiert (2/4/8-Familie), benannt & maschinell prüfbar.**
   16-Spalten-Grid, das sich bei dichterem Inhalt halbiert; grosszügige Gutter
   für beschriftete Inputs (Text nie in den Gutter hängen). [Carbon 2x-Grid,
   Spacing; Atlassian Spacing] *(Refutiert: „alles Vielfache von 8" — Scales
   enthalten 2/4/6/12/20 — also nicht dogmatisch 8er.)*
2. **Abstand nach Dichte gestuft & als primäres Gruppierungsmittel:** klein
   0–8 (kompakte UI), mittel 12–24 (Buttons/Karten), gross 32–80 (Layout).
   Grössere Schritte sind der bewusste **Dichte-Hebel**; **dichter wirkt
   seriöser/fokussierter** — passt zum nüchternen Lexmetrik-Register. Hierarchie
   über Weissraum/Nähe statt Linien/Rahmen. [Material 3, NN/g Proximity, Carbon]
3. **WCAG-2.2-Kontrast (maschinell prüfbar):** Text ≥ 4.5:1 (AA) / 7:1 (AAA);
   grosser Text ≥ 3:1 / 4.5:1; **Nicht-Text/UI/Icons/Input-Borders/Fokus
   ≥ 3:1** gegen Nachbarfarbe (SC 1.4.11). Disabled/Deko/Logo ausgenommen. [W3C]
4. **Sichtbarer Tastatur-Fokus Pflicht** (SC 2.4.7); quantifiziert (SC 2.4.13):
   ≥ 2px-Perimeter-Fläche **und** ≥ 3:1 Change-of-Contrast fokussiert↔unfokussiert
   — z.B. solider 2px-Outline. Fokus über **Outline, nicht Farbe allein**. [W3C]
5. **Vollständige Zustands-Matrix** je interaktiver Komponente: default · hover ·
   focus-visible · active(pressed) · disabled · loading · selected — plus
   **empty/error** auf Sicht-Ebene. Fokus = Outline, nicht Farbwechsel. [Carbon, M3]
6. **Typografie zweigeteilt:** «produktiv» (kompakt, für Rechner/Generatoren/
   Tabellen) vs «expressiv/Lese» (Gesetzes-/Rechtsprechungstext). Expressive
   Stile helfen beim Langtext-Lesen, stören aber in der Produkt-UI. [Carbon]
7. **Vertrauen ist design-getrieben & messbar:** professionelles, geordnetes
   Visual-Design ist einer von vier Kern-Glaubwürdigkeitsfaktoren; **sichtbare
   Kleinfehler (Typos, tote Links, stille No-ops) senken die Glaubwürdigkeit
   messbar** (gelesen als Nachlässigkeit). Glaubwürdigkeit entsteht über
   Prominence × Interpretation → Politur & Fehlerdisziplin sind ein
   **Trust-Mechanismus, keine Kosmetik**. [NN/g; Stanford/Fogg, 4500+ Probanden]

## Anwendung auf Lexmetrik

Dichte-aber-seriös ist legitim und passend (Befund 2). Die grösste Hebelwirkung
liegt in **Kontrast/Fokus-A11y** (Befund 3/4 — maschinell erzwingbar) und der
**Fehlerdisziplin als Trust** (Befund 7 — deckt direkt den brass-300/50-No-op-Bug
und die toten Tokens aus dem Struktur-Audit). Die zweigeteilte Typografie
(Befund 6) ist bereits angelegt (Produkt-Sans + Lese-Serif für Rubrik V).
