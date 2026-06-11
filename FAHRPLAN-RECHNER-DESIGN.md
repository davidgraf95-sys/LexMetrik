# Fahrplan Rechner-Design-Vereinheitlichung (Auftrag David 10.6.2026 spätnachts)

Auftrag: «alle einzelnen Engines überprüfen und sicherstellen, dass sie,
wenn sie vergleichbar sind, gleiche Darstellung haben; die Art, wie die
rechtlichen Informationen wiedergegeben werden, überdenken und
optimieren; Regeln für den Designaufbau aufstellen; Reihenfolge von oben
nach unten muss Sinn ergeben. Handlungsplan erstellen und gleich
umsetzen.» Erledigt über Nacht auf den 11.6.2026.

**Regelwerk:** `DESIGN-REGLEMENT-RECHNER.md` (R1–R12) — das bestellte,
dauerhafte Reglement. Dieser Fahrplan hält Ist-Audit, Etappen und
Verdikte fest.

**Rahmen:** reine Darstellungsschicht (§3) — `src/lib/` wird nicht
berührt; §6-Protokoll (Tore vorher grün ✓ 11.6. 00:07: tsc 0 · 1241
Tests · Lint 0 · Golden 88/88 byte-gleich; nachher Golden byte-gleich
PFLICHT). Kein Push/Deploy (§9 — Davids frisches Ja fehlt).

## Ist-Audit (11.6.2026, alle 16 ergebnistragenden Formulare + 14 Seiten)

Seitenebene (R1/R2): bereits konsistent — Kopf → [Rückverweis] →
Werkzeug-Karte → Form → [Ereignis-Sektion] → [Themen-Links]. Einziger
Befund: Themen-Links (Kündigung, Mietrecht) sind frei formatierte
Absätze statt geteilter Komponente (→ R10).

Formular-/Ergebnisebene — Divergenz-Matrix (✗ = fehlt/abweichend):

| Form | Sprung | LiveHeader | reveal/aria | kurz‑Disclaimer | FehlerBox | Export‑Reihenfolge | Sonstiges |
|---|---|---|---|---|---|---|---|
| AllgemeineFrist | ✗ | ✓ | ✓ | ✗ | ✓ | prüfen | — |
| EinfacheFrist | ✗ | ✗ | ✗ | R12-Ausnahme | — | — | minimal (S-5a) |
| ErbFristen | ✓ | ✓ | ✓ | ✓ | ✗ | PDF→**Teilen→ICS** | Hand-Kacheln statt EckdatenKachel |
| Erbteilung | ✗ | ✓ | ✗ | ✓ | ✓ | prüfen | — |
| GebvKosten | ✗ | **✗** | ✗ | ✓ | ✓ | prüfen | — |
| Gewaehrleistung | ✗ | ✓ | ✗ | ✓ | ✗ | prüfen | — |
| KombinierteAnsicht | ✗ | ✓ | ✗ | ✗ | ✗ | prüfen | 3 Teil-Ergebnisse |
| KuendigungSperr | ✗ | ✓ | ✗ | ✗ | ✓ | prüfen | — |
| Lohnfortzahlung | ✗ | ✓ | ✗ | ✓ | ✓ | prüfen | — |
| Mietrecht | ✗ | ✓ | ✗ | ✓ | ✓ | prüfen | Kalender-/Timeline-Position |
| SchkgFristen | ✓ | ✓ | ✗ | ✓ | ✓ | prüfen | — |
| Streitwert | ✗ | **✗** | ✗ | ✓ | ✓ | ✓ | keine Eckdaten (ok: ein Wert) |
| Teuerung | ✗ | ✓ | ✓ | ✗ | **inline-danger** | ✓ | Doppel-Div in Export-Zeile; Quellen-Zeile in der Export-Zeile |
| Verjaehrung | ✓ | ✓ | ✗ | ✓ | ✗ | prüfen | — |
| Verzugszins | ✗ | ✓ | ✗ | ✗ | ✗ | prüfen | Timeline-Position |
| Zpo | ✗ | ✓ | ✗ | ✓ | ✓ | PDF→ICS→Teilen ✓ | **Kalender VOR ErgebnisAnzeige** |
| Zuständigkeits-Trio | ✓ | ✓ | ✓ | ✓ | ✓ | prüfen | Referenzmuster |

Rechtsinformation (R6): NormLink/Warnungen/Rechenweg/Annahmen sind
bereits zentralisiert (eine `ErgebnisAnzeige` für alle — Befund:
besser als erwartet). Der Hebel liegt im RAHMEN um die ErgebnisAnzeige
und in der Block-Reihenfolge, nicht in den Inhalten.

## Etappen

- **D1 — Reglement + geteilter Rahmen:** `DESIGN-REGLEMENT-RECHNER.md`
  (R1–R12) + neue Komponente `ErgebnisBlock` (id · lc-reveal ·
  aria-live · ErgebnisSprung · LiveHeader als EIN §10-Baustein) +
  `ThemenEinstieg`-Komponente.
- **D2 — Formular-Angleichung:** alle 16 Formulare auf R3/R4/R5/R7/R8
  heben (ErgebnisBlock-Rahmen, Export-Reihenfolge PDF→ICS→Teilen,
  Begründung→Aktenzeichen→Exporte-Folge, EckdatenKachel statt
  Hand-Kacheln, FehlerBox statt inline-danger, kurz-Disclaimer
  ergänzen, ZPO-Kalender hinter die ErgebnisAnzeige, Teuerung-
  Doppel-Div + Quellen-Mikrozeile als eigene Zeile).
- **D3 — Doppel-Reveal auflösen:** `lc-reveal`/`aria-live` aus der
  ErgebnisAnzeige-Wurzel entfernen, sobald ALLE Verwendungen im
  ErgebnisBlock-Rahmen stehen (eine Live-Region pro Ergebnis statt
  zwei verschachtelte).
- **D4 — Seitenebene:** Themen-Links Kündigung/Mietrecht auf
  `ThemenEinstieg` umstellen; Rückverweis-Bestand gegen R2 geprüft
  (keine Änderungen nötig — FE-4-Bestand ist die Regel).
- **D5 — Tore + Empirie:** tsc · Tests · Lint · Build · Golden
  byte-gleich · check:smoke · e2e (axe/Tastatur/Overflow; neue
  Befunde fixen oder mit BERICHT-Verweis deklarieren).
- **D6 — Abnahme-Grundlage:** Screenshot-Serie vorher/nachher
  (scripts/screenshots.ts gegen zwei Previews) + Kurzbericht
  `abnahme/design-2026-06/RECHNER-EINHEIT.md`; Spiegel in
  HANDLUNGSPLAN/STRUKTUR.

## Verdikte / Stand

- 11.6.2026 00:07 — Basis-Tore grün, Audit abgeschlossen, D1 begonnen.
- 11.6.2026 ~00:35 — **D1–D6 KOMPLETT** (Commits `2cd3791` D1 ·
  `ff5bbb4` D2 · `fcd2c38` D3+D4 · Bericht-Commit folgt). Alle 16
  Formulare auf dem R4-Skelett; Export-Zeile überall PDF→ICS→Teilen;
  Kalender/Timeline hinter dem Verdikt; kurz-Disclaimer vollständig;
  eine aria-live-Region pro Ergebnis; ThemenEinstieg geteilt.
  **Zurückgestellt:** ErgebnisBlock-Adoption im Zuständigkeits-Trio
  (bereits regelkonform, war das Referenzmuster) — eine PARALLEL-SESSION
  baut zeitgleich den VD-Schlichtungs-Ausbau in genau dieser Zone
  (`schlichtungsstellen.ts`, `vdSchlichtung.ts`); §12: fremd belegte
  Dateien nicht anfassen. Nachziehen, sobald deren Stand committet ist.
- **D5-Tore:** Golden 88/88 byte-gleich (§6-Beweis) · 1239/1241 Tests
  grün (2 rote = fremder VD-WIP: vdSchlichtung-Dossierverweis,
  VD-Stand-Datum — §12 ausgehalten) · Lint 0 · Build ok · smoke alle
  Seiten · e2e 33/33 (axe ohne neue Befunde, kein Overflow, Tastatur).
- **D6:** Screenshot-Serien vorher (`0b30683`, /tmp-Worktree-Preview
  4322) / nachher (`fcd2c38`, 4321) unter
  `abnahme/design-2026-06/screenshots/rechner-einheit-*` (gitignored);
  Abnahme-Bericht mit Entscheid-Posten E-1–E-5:
  `abnahme/design-2026-06/RECHNER-EINHEIT.md`.
- **ABGENOMMEN (David 11.6.2026, ohne Auflagen):** E-1–E-5 komplett —
  Verdikt im Bericht protokolliert. Daraus freigegeben: Trio-Nachzug
  (E-4). OFFEN nur noch: Push/Deploy (§9, erst auf frisches Ja).
