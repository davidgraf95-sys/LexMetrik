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
