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
| 2026-07-01 | Bund-Normtext Bilder&Formeln (extrahiere-fedlex + normtext-snapshot ladeBilder) | 76b97924ef72f106fd2635abb730b71ac4e7c4ef4bbf85b8f3e4124c7b44e1de | bestanden | fedlex bund 20260630 (Filestore-HTML + Bild-Filestore, 445 Bilder) | Bilder/Formeln als bild/bildKacheln erfasst+selbst gehostet (sha), [tab]-Spacer gestrippt, SSV-Signal-Katalog→Kachel-Raster. Opus-Gegenprüfung WIDERLEGTE zunächst (Text-Dublette VTS/VZV/VVV: markeloseNotizen vs parseDefinitionsListe uneins über [tab]-Marke) — gefixt (konsistente Marke-Bestimmung), plus SSV-Mehrfach-dt/dd-Zelle (Textverlust) gefixt. Re-verifiziert KORPUSWEIT: 0 Dubletten, 0 verlorene Wörter (HEAD→WORK Wort-Multiset), Containment 455/455 distinct, Katalog-Erkennung nur reine Piktogramm-Tabellen (Anhang 3 bleibt Datentabelle), sha/Datei/Orphan grün, Engine-Golden byte-gleich. |
| 2026-07-01 | Bund-Normtext Bilder&Formeln + formel-Flag (extrahiere-fedlex) | 934c62f8c30449be1c4590ad9ea37b0a00a42a044fc1cd14e165a1cb3ddf7177 | bestanden | fedlex bund 20260630 | Nachtrag: markiereFormeln setzt bild.formel wenn der vorausgehende Text eine Rechen-Einleitung ist (Formel/Gleichung/«wie folgt:»/«umgerechnet:»). §8-konservativ: Piktogramme (SSV/CHEMV-Signale) folgen normalen Sätzen → NICHT geflaggt (verifiziert: VTS art_123 = echte «Anzahl n»-Formel, kein Sign-Mislabel; alle Flags korrekt). Golden-neutral (sha über Bild-Bytes, nicht Flag) → Engine-Golden byte-gleich, Daten-Index unverändert. |
| 2026-07-01 | Bund-Normtext Bilder&Formeln + formel-Flag | 934c62f8c30449be1c4590ad9ea37b0a00a42a044fc1cd14e165a1cb3ddf7177 | bestanden | fedlex bund 20260630 | Nachtrag markiereFormeln: bild.formel gesetzt bei Rechen-Einleitung (Formel/Gleichung/wie folgt:/umgerechnet:). Piktogramme NICHT geflaggt (VTS art_123=echte Formel verifiziert). Golden-neutral, Engine byte-gleich. |
| 2026-07-02 | normtext-extraktion (extrahiere-fedlex split-sup + kachel-fussnote) + sha256Bloecke.spalten + check:invarianten [tab]-lexikon | da837c78597ca9115292deac81de115cb240f864e05e29cee61eb8802fcd0bac | bestanden | fedlex GEBV_SCHKG/HMG/KLV/CO2/VRV/SSV/AVIG 20260630 (gepinnte Konsolidierung, /tmp-cache) | 6 Split-sup-Blöcke (1bis/2bis/1ter) + SSV-Kachel-379-Leak zeichenweise gegen amtl. Fedlex-HTML verifiziert; sha-Only-Re-Baseline 66 Dateien 0 Waisen; Exponentenschutz korpusweit 0 Fehlklebung; AVIG art_13 Aufhebungsbereich bewusst Baseline |
| 2026-07-02 | Alt-Rechen-Engines (QS-GP Baustein d, 21 Dateien) | 95b1c46ab19c3c15f2fb3a8dae83f9606098b74c02308aadc75557fcd9ad609c | bestanden | diverse amtl. Kantons-/Bundeserlasse 20260702 (kein Fedlex-Einzelpin) | QS-GP Baustein d: unabhängiger 7-Verifier-Doppelcheck gegen Amtsquelle 45 CONFIRMED/0 REFUTED/2 UNSURE (non-blocking); 3 Übergriffe zurückgerollt (verzugszins/streitwert-Berufung/verjaehrung-Verzicht-Deckel); golden 6 Fälle neu gesegnet. |
