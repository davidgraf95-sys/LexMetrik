# Sichtung durchblick.nl — sieben Offline-Rechner (Konkurrenz-Befund)

**Erstellt:** 11.6.2026 · **Anlass:** Prüfauftrag David («schau ob du etwas davon verwenden kannst») · **Status: BEFUND, abgeschlossen — keine Übernahme; keine amtliche Quelle.**

**Gegenstand:** Sieben ZIPs (`~/Desktop/durchblick.nl/`)
zur Prüfung vorgelegt: Betreibungs-, Fristen-, Gerichtskosten-, Kündigungs-, Mahn-,
Prozesskostenrisiko- und Verjährungsrechner als selbstenthaltende
Einzeldatei-HTMLs eines Drittanbieters (Stände 26.11.2025 / 30.3.2026,
eingebettetes jsPDF, DE/FR). Entscheid David: **keine Übernahme**; Befund
ablegen, KVG-Lücke schliessen.

## Befund (Code-Sichtung der eingebetteten Logik)

1. **Schätz-Heuristik statt Tarife (§2-Gegenmodell).** Der
   Gerichtskostenrechner rechnet eine Zürcher «average/reference»-Basistabelle
   mal pauschalem Kantons-Multiplikator — im Quellcode wörtlich
   `SZ: 0.90, // moderate estimate`, `GR: 2.50`, `TG: 0.50`. Der
   Prozesskostenrisiko-Rechner schätzt Anwaltskosten als «Rough estimate:
   10-15% of Streitwert, minimum CHF 2'000». Genau das schliesst LexMetrik
   aus (CLAUDE.md §2: feste Rechenregeln, keine Schätzung; Roadmap-Eintrag
   `prozesskosten`: «Tarife deterministisch, Ermessens-Spannen offenlegen»).
2. **Wo seriös, dort schwächer als der Bestand.** Verjährung = flache
   Anspruchsart-Liste ohne Unterbrechungslogik; Fristen ohne kantonale
   Feiertags-Tiefe; Betreibungskosten (GebV SchKG) mit «estimated postage» —
   LexMetrik hat zu allem eigene, golden-getestete Engines.
3. **Urheberrecht/§7:** kuratierte Tabellen/Texte eines Konkurrenzprodukts;
   Übernahme ohne eigene amtliche Verifikation ohnehin ausgeschlossen.

## Verwertete Erkenntnisse

- **Nachfrage-Bestätigung** für die geplante Karte `prozesskosten`
  (Gerichts-/Parteikosten kantonal, KATALOG-ROADMAP Priorität 1, Entscheid
  offen) und für ein Erwartungswert-Modul (Prozesskostenrisiko) — beides nur
  mit echten kantonalen Tarifdekreten (§11-Recherche) zu bauen.
- **KVG-Lücke gefunden:** deren Kündigungsrechner führt «Krankenkasse
  Grundversicherung (30. November)»; LexMetrik deckte nur die
  VVG-Zusatzversicherung ab → geschlossen 11.6.2026 (Preset `krankenkasse`,
  Dossier [kvg-grundversicherung-kuendigung.md](kvg-grundversicherung-kuendigung.md)).

**Status:** Befund, zweifach belegt am Quellcode der ZIPs; keine amtliche
Quelle, daher NIE Beleg-Grundlage für Engines.
