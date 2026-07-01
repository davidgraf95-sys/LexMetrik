# Gegenprüfungs-Register (adversariale Zweitdurchgänge)

Fortlaufendes Register der protokollierten **adversarialen Gegenprüfungen** (QS-GP).
Jeder Eintrag hält fest, welcher unabhängige Zweitdurchgang (Skill »gegenpruefung«,
Opus, frischer Kontext, Auftrag: den Output **widerlegen**) für einen an genau diesen
Diff gebundenen Stand vorliegt. Design-Detailquelle:
[`docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md`](../../docs/superpowers/specs/2026-07-01-gegenpruefung-gate-design.md).

- **Automatisch gepflegt:** Zeilen schreibt `npm run gegenpruefung:ok` (nie von Hand
  editieren) — dieselbe Diff-Hash-Kernfunktion wie das Tor `check:gegenpruefung`.
- **Diff-Hash** = sha256 über die kanonisch sortierten Working-Tree-Bytes der
  geänderten Risiko-Dateien (Rechnen/Extraktion/Norm-Tarif). Der zugehörige,
  gitignorede Türsteher liegt vor dem Commit in `bibliothek/.gegenpruefung-pending`.
- **Quelle-Pin** (Form `fedlex <name> <YYYYMMDD>`) koppelt den Durchgang an den
  amtlichen Stand. Wird der Pin in `scripts/fedlex-cache.sh` neuer, meldet das Tor
  die Zeile per WARN als **neu fällig** (Burn-down, blockiert nie).
- **Verdikt**: `bestanden` (Tor grün) oder `widerlegt` (Befund → erst fixen).

| Datum | Snapshot/Engine | Diff-Hash | Verdikt | Quelle-Pin | Beleg/Notiz |
|-------|-----------------|-----------|---------|------------|-------------|
| 2026-07-01 | Bund-Normtext-Snapshot (extrahiere-fedlex/entferneTags, N1) | 2a191e3940cdfdb4e32430e166b208209afb82cefdf099adbe8fc669bd4beaa5 | bestanden | fedlex bund 20260630 (gepinnte Filestore-HTML-Konsolidierungen /tmp) | N1: Inline-Tags leerzeichenlos strippen (329g/335c/7e/1bis, 194 Files), reine Ziffern-sup/sub behalten Abstand (133 1/3 nicht 1331/3). Unabh. Opus-Gegenpruefung BESTANDEN gegen amtl. HTML: 0 Drop, 0 Footnote-Leak, 9 bis/ter-Marke-Dedup verifiziert, Zeichenfolge sonst identisch. |
