# Fahrplan Kantonale Tarif-Tabellen — Stufe 2 (22.6.2026)

**Kontext:** Stufe 1 (Füllpunkt-Zweispalter «Beschreibung . . . . Betrag» → `tabelle`) ist
für SG auf Prod (s. STRUKTUR-Karte 22.6.). Mechanik: §7-Generator-Extrakt
(`scripts/normtext/tarif-tabelle.ts` + `reichereTabellen` in `adapter-pdf.ts`), Render
`ArtikelBody.tsx` `TarifTabelle`. Stufe 2 = die übrigen Tabellen-/Zahl-Defektklassen,
**kanton-für-kanton** (Auftrag David). Grundsatz unverändert: §1 konservativ — im Zweifel
Block als Text belassen; nie Inhalt erfinden/verändern; §3 Render trennt von Logik;
§7 nur via Generator.

## Anforderungen David (22.6.)
1. **Mehrspaltige Staffeln** (Streitwert | Grundgebühr | Zuschlag) mit verschmolzenen
   Zahl-Spalten korrekt trennen — Befund `100001250` (= `10'000` | `1'250`).
2. **Tausendertrenner `'`** in der Anzeige (`10000`→`10'000`). §1: nur Gruppierung der
   Ziffern, kein Wert geändert; zentral im Render (deckt auch SG-Tabellen).
3. Jeden Kanton **einzeln** prüfen + beheben + verifizieren.
4. Engine→Norm-Verweise müssen weiter korrekt auflösen (gilt fort).

## Defektklassen + Worklist (aus Bug-Check alle Kantone 22.6.)
- **A · `·`/`—`-Zellentrenner-Tabellen** (Quelle hat explizite Zell-Marker → am tract­ab­elsten):
  - NW-265.51 (120+ Zeilen Tarif — höchster Zeilen-Ertrag, sauberster Parser-Einstieg)
  - BS-154.810 + BS-291.400 (Gerichtsgebühren; Beträge schon mit `'`)
  - SO-614.11 (Steuer-Tarifstufen — echte Mehrspalten)
  - VS-173.8-de/-fr (zweisprachiges Paar)
- **B · Mehrspalten-Staffel mit verklebten Zahlen** (schwierigste Klasse, Spaltenrekonstruktion):
  - ZH-215.3 §4, ZH-211.11 (`100001250`, `5000250`), ZG-163.4 §3, TG-176.31 §5
  - Muster: `über X bis Y<Gebühr> zuzügl. Z% …` — Y und Gebühr verklebt.
- **C · Restliche Füllpunkt-Blöcke** (gleicher Stufe-1-Parser, nur noch nicht regeneriert/erfasst):
  - SG 159 Blöcke (SG-3849 135, SG-2935 20, SG-2808 4) — prüfen warum nicht erfasst (evtl. Block-Grenzen) und nachziehen.
- **D · Tausendertrenner:** nur SG braucht Normalisierung in `tabelle`-Beträgen (30 Werte);
  20/26 Kantone haben `'` schon in der Quelle. Zentrale Render-Formatierung der Betrag-Spalte
  (nicht im Snapshot — §7 faithful). VD-Sonderbefund: `250'000251'000` = zwei Zeilen ohne
  Trenner verschmolzen (eigener Extraktions-Bug, separat).
- **AUSSCHLUSS (kein Tarif!):** BL-211.71, FR-635.1.1, FR-214.5.16 — die `…`-Läufe sind
  **Gesetzes-Änderungsplatzhalter** («wird wie folgt geändert: …»), NICHT Tarifzeilen.
  Niemals tableisieren.

## Reihenfolge (Vorschlag)
1. **D Tausendertrenner** (Betrag-Spalte zentral im Render) — klein, hoher sichtbarer Wert, deckt SG sofort. §1: reine Gruppierung.
2. **A `·`/`—`-Tabellen** (NW zuerst) — eigener Parser-Zweig, explizite Marker.
3. **C SG-Rest-Füllpunkt** — warum nicht erfasst, dann nachziehen.
4. **B Mehrspalten-Staffel** (ZH/ZG/TG) — Spaltenrekonstruktion, schwierigste; eigener Spec.

Jede Klasse: Spec/Plan-light → TDD → echte Daten-Validierung (Logik+Bug-Check je Schritt,
Daueranweisung David) → Regenerieren → Gate → UI-Sicht → Deploy nach Davids Ja.

*Quelle Worklist: `.superpowers/sdd/canton-bugcheck-report.md` (Scratch, 22.6.).*

## Technische Befunde Mehrspalten (22.6., Entscheid David: «echte Mehrspalten-Tabelle»)
- **ZH § 4 AnwGebV (David-Beispiel «unübersichtlich»):** Quelle = Text-PDF (notes.zh.ch, pdfjs), KEINE HTML-Tabelle. `100001250` = PDF-Spaltenverlust in der Body-Zeilen-Assemblierung. Sauberer Fix: **x-koordinatenbasierte Spaltenerkennung** (Streitwert | Grundgebühr | Zuschlag). Vorlage: `adapter-zh-pdf.ts` hat bereits `extrahiereZhAnhangSpalten` (spaltenbewusst über x) für den Anhang — § 4 läuft aber durch die normale Body-Assemblierung. NICHT Ziffern raten (§1).
- **Datenmodell:** generische Mehrspalten-Tabelle (Header + Zeilen×N Zellen) statt nur {beschreibung,betrag}. Render: echte N-Spalten, Beträge rechtsbündig + gruppiereTausender.
- **Klasse A (NW/BS/SO/VS):** ·/—-Marker → deterministischer Split in Zeilen×Felder (Label:Wert). Variable Felder (Tarif-Nr./Bezeichnung/Betrag/Gemeinde/Kanton) + Hierarchie.
- Reihenfolge offen: ZH (David-Beispiel) vs. NW (tractabelste). Beide brauchen das gemeinsame Mehrspalten-Modell+Render zuerst.
