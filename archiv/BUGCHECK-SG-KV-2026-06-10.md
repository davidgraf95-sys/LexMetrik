# Bug-Check §9 · Schlichtungsgesuch-Umbau + Klage-Kantonsausbau (10.6.2026 abends)

Zwei unabhängige Lupen (Code/Technik · fachlich ZPO am Fedlex-Wortlaut) über
die uncommitteten Änderungen: (A) Miete/GlG erstellen das Schlichtungsgesuch
mit paritätischem Adressat statt Stopp (Auftrag David), (B) vereinfachte
Klage mit Gerichts-Adressat für alle 26 Kantone (Auftrag David). Empirie:
10/10 UI-Repros am Build; Befunde 1 und 6 zusätzlich empirisch reproduziert.

## Befunde und Verdikte

| # | Grad | Befund | Fix |
|---|---|---|---|
| 1 | **HOCH** | Miete/GlG: freie Rechtsbegehren wurden NICHT ins Dokument übernommen und nicht als Pflicht geprüft (Art. 202 Abs. 2 lit. b ZPO) — vorher vom Stopp abgeschirmt, jetzt stiller Datenverlust + exportierbares Gesuch ohne Begehren | GEFIXT: Übernahme + Mängel-Gate auf alle nicht-vermögensrechtlichen Typen erweitert |
| 2 | MITTEL (fachlich) | GlG-Fallback «ordentliche Behörde in paritätischer Besetzung» ist als Datenannahme für 24 Kantone unbelegt; Gegenbeispiel im eigenen GOG-Dossier: LU hat eine eigene SB Gleichstellung (§ 50 JusG LU) | GEFIXT: bei GlG ohne erfasste eigene Stelle KEIN Auto-Adressat mehr — Handeingabe/Verzeichnis erzwungen, Hinweis deklariert. Folge-Recherche «GlG-Schlichtungsstellen je Kanton» im Dossier-TODO notiert |
| 3 | **HOCH** | Form-Gate «Klagebewilligung 3 Monate gültig (Art. 209 Abs. 3)» erschien auch bei Miete (richtig: 30 Tage, Art. 209 Abs. 4) — Widerspruch im selben Wizard | GEFIXT: Zeile verzweigt nach behoerdeTyp |
| 4 | **HOCH** | Form-Gate-Kostenzeile («Gebühr ab CHF 100…») für Miete/GlG falsch: Schlichtung ist dort gerichtskostenfrei (Art. 113 Abs. 2 lit. a/c ZPO); sgHinweise ohne Kostenlos-Hinweis | GEFIXT: Kostenzeile + sgHinweise nach Typ |
| 5 | NIEDRIG | Resttexte alter Stopp-Semantik (Datei-Kopf, toter Vorschau-Text, K02-Begründung «BS-Routing»); SG-Disclaimer «setzt einen Basler Gerichtsstand voraus» widerspricht dem Kantonsausbau | GEFIXT: Texte kantonsneutral |
| 6 | **HOCH** | kvHinweise berechnete die Klagefrist ohne Kanton → BS-Feiertage für alle (empirisch: 24 Datum/Kanton-Kombinationen 2026 mit abweichendem Ablauf, z. B. KB 16.1.: BS 4.5. vs. GE/VS 1.5.) | GEFIXT: Kanton durchgereicht |
| 7 | MITTEL | Brücke Zuständigkeit→KV blieb für Nicht-BS gesperrt (K-2-Guard `kantonsfremd`) — neuer kanton-Prefill war toter Code, Sperrtext widersprach der Karte | GEFIXT: Guard entfernt, Text angepasst |
| 8 | MITTEL (fachlich) | GE (zentral) setzte bei Arbeit/Miete automatisch das TPI als Adressat, obwohl prud'hommes/baux zuständig sind (Art. 110/89 LOJ GE); analog VD-Miete (Tribunal des baux) | GEFIXT: bei belegtem Spezialgericht-Hinweis zur Materie KEIN Auto-/Listen-Adressat — Hinweis + Handeingabe |
| 9 | NIEDRIG | Transienter Falschwert bei Typwechsel in Verzeichnis-Kantonen (alte amtZeilen einen Tick als paritätische Adresse) | GEFIXT: Melde-Effect prüft typ |
| 10 | NIEDRIG (fachlich) | Hinweise unvollständig: Entscheidvorschlag streitwertunabhängig (Art. 210 Abs. 1 lit. a/b) inkl. Miete-Sonderwirkung Art. 211 Abs. 2 lit. a; kvg-Stopp ohne Hinweis auf Kantone ohne Art.-7-Gebrauch | GEFIXT: Hinweise ergänzt |
| 11 | NIEDRIG | Datenschicht: LU-hinweisArbeit fehlte (§ 32 JusG LU belegt); FR-Hinweis «Arbeits-/Mietgericht je am Bezirksgericht» widerspricht JG FR Art. 34 (DREI Mietgerichte); VS Monthey amtlich «1870 Monthey 1» | GEFIXT |

## Kein Befund (geprüft)
Adressat-Reset bei Kanton-/Typwechsel und Unmount (Kaskaden-Rangordnung) ·
keine Alt-Konsumenten der Stopp-Semantik · KV-Defaults/Permalink-Hydration ·
Datenschicht-Integrität (Keys, VS = 9 Gerichte gemäss Dossier) · 30-Tage-
Hinweis korrekt verortet · «Anwendbarkeit Art. 243/114 = Bundesrecht» korrekt ·
ZH/AG/GE/VD-Materie-Hinweise decken sich mit dem GOG-Dossier · Art.-212-Sperre
für Miete ≤ 2'000 ist bewusst konservativ (kein Fehloutput).

## Offene Folge-Arbeit (deklariert)
- Recherche «GlG-Schlichtungsstellen je Kanton» (mind. LU § 50 JusG belegt) →
  danach `glg`-Einträge in schlichtungsstellen.ts statt Handeingabe-Zwang.
- Spezialgericht-ADRESSEN als Datenfelder (GE prud'hommes/baux, VD baux,
  ZH Miet-/Arbeitsgericht) statt Handeingabe — eigener Bauschritt.
- Fachliche Abnahme David: gesamte Gerichts-/Schlichtungs-Adressschicht
  (Status «zweifach geprüft, Abnahme ausstehend» bleibt in der UI offen).
