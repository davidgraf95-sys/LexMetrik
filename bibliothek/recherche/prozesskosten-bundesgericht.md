# Recherche-Dossier — Kosten vor dem Bundesgericht (Zivilverfahren)

**Erstellt:** 14.6.2026 · **Anlass:** Prozesskosten-Cockpit, Instanz-Dimension
(oberste Stufe). **Status:** amtlich **doppelt verifiziert** (zwei unabhängige
Fedlex-Manifestationen — HTML + XML — derselben konsolidierten Fassung, identische
Beträge). Abnahme David ausstehend (§7).

## A. Rechtsgrundlagen (Bundesrecht)
- **BGG (SR 173.110)**, Konsolidierung **Stand 1.4.2026** (ELI cc/2006/218).
  Quelle: https://www.fedlex.admin.ch/eli/cc/2006/218/de
- **Tarif für die Gerichtsgebühren im Verfahren vor dem Bundesgericht
  (SR 173.110.210.1)**, Stand 1.1.2007 (einzige Fassung).
  Quelle: https://www.fedlex.admin.ch/eli/cc/2006/837/de
- **Reglement über die Parteientschädigung … vor dem Bundesgericht
  (SR 173.110.210.3)**, Stand 1.1.2007 (einzige Fassung).
  Quelle: https://www.fedlex.admin.ch/eli/cc/2006/839/de

Norm-Kern: Art. 65 BGG (Bemessung Gerichtsgebühr: Streitwert/Umfang/Schwierigkeit/
Prozessführung/finanzielle Lage), Art. 66 (Verteilung), Art. 68 (Parteientschädigung),
Art. 62 (Kostenvorschuss), Art. 64 (unentgeltliche Rechtspflege).

## B. Gerichtskosten — Staffel (Tarif Ziff. 1, vermögensrechtlich, Art. 65 III lit. b)
`staffel_rahmen` über Streitwert (von–bis CHF):
- 0–10'000 → 200–5'000 · 10'000–20'000 → 500–5'000 · 20'000–50'000 → 1'000–5'000 ·
  50'000–100'000 → 1'500–5'000 · 100'000–200'000 → 2'000–8'000 ·
  200'000–500'000 → 3'000–12'000 · 500'000–1 Mio → 5'000–20'000 ·
  1–5 Mio → 7'000–40'000 · 5–10 Mio → 10'000–60'000 · >10 Mio → 20'000–100'000.
- **Ohne Vermögensinteresse** (Art. 65 III lit. a): 200–5'000.
- **Reduziert (Art. 65 IV BGG, 200–1'000, STREITWERTUNABHÄNGIG):** Sozialversicherungs-
  leistungen · Geschlechterdiskriminierung · Arbeitsverhältnis bis Streitwert 30'000 ·
  BehiG Art. 7/8. **Mietrecht ist NICHT erfasst** (folgt dem ordentlichen Tarif).
- **Überschreitung (Art. 65 V):** bis zum Doppelten (Abs. 3) bzw. max. 10'000 (Abs. 4).

## C. Parteientschädigung — Staffel (Reglement Art. 4, Beschwerdeverfahren)
`staffel_rahmen` über Streitwert (von–bis CHF):
- bis 20'000 → 600–4'000 · 20'000–50'000 → 1'500–6'000 · 50'000–100'000 → 3'000–10'000 ·
  100'000–500'000 → 5'000–15'000 · 500'000–1 Mio → 7'000–22'000 ·
  1–2 Mio → 8'000–30'000 · 2–5 Mio → 12'000–50'000 · >5 Mio → 20'000 bis 1 % des Streitwerts.
- **Ohne Vermögensinteresse** (Art. 6): 600–18'000. Inkl. MwSt (Art. 12 I).
- Klageverfahren (Art. 5, BGer als einzige Instanz, Art. 120 BGG) höher angesetzt
  (zur Vollständigkeit erhoben; fürs Cockpit i.d.R. Beschwerde relevant).

## D. Sonderfälle / Hinweise
- **Subsidiäre Verfassungsbeschwerde:** gleiche Staffeln wie Beschwerde in Zivilsachen
  (Art. 117 BGG → 90 ff.).
- **Kostenvorschuss (Art. 62 I BGG):** in Höhe der mutmasslichen Gerichtskosten;
  Nichtleistung trotz Nachfrist → Nichteintreten.
- **Unentgeltliche Rechtspflege (Art. 64 BGG):** Befreiung Gerichtskosten + ggf.
  amtlicher Anwalt (Honorar kürzbar bis 1/3, Art. 10 Reglement); Nachzahlung Abs. 4.
- **Verteilung (Art. 66/68):** unterliegende Partei trägt Gerichtskosten und ersetzt
  Parteientschädigung; Bund/Kantone/Gemeinden im amtlichen Wirkungskreis kostenfrei.

## E. Stützstellen (Beschwerde, vermögensrechtlich; halboffene Bänder [unten, oben))
- SW 5'000 → GK 200–5'000 · PE 600–4'000.
- SW 50'000 → GK 1'500–5'000 · PE 3'000–10'000.
- SW 500'000 → GK 5'000–20'000 · PE 5'000–15'000.

## F. Cockpit-Modellierung
Instanz `bundesgericht`: eigene Datensätze (Gerichtskosten + Parteientschädigung)
als `staffel_rahmen`; Sondertarife (ohne Vermögensinteresse; Art. 65 IV reduziert)
als materie-/flag-abhängige Varianten. Kostenlos-Vorschalter ZPO 113/114 gilt
NICHT vor BGer — dort eigene reduzierte Tatbestände (Art. 65 IV). Verknüpfung mit
dem bestehenden BGG-Fristen-/Rechtsweg-Rechner.

## G. Pflegebedarf
Tarif/Reglement seit 2007 unverändert; BGG-Stand 1.4.2026. Bei BGG-Revisionen
Art. 65 ff. nachführen (Verfallsregister).
