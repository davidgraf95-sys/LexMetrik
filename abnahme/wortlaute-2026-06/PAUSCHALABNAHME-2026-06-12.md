# Abnahme-Protokoll: Pauschal-Abnahme Wortlaute + P1-Priorisierung (12.6.2026)

- **Gegenstand:** Wortlaut-/Text-Abnahmen (KEINE Karten-Status-Hebung auf
  «geprüft» — siehe Abgrenzung unten)
- **Prüfer:** David Graf, Jurist (Anwaltsprüfung Basel-Stadt), fachkundige
  Person · **Datum:** 12.6.2026
- **Abnahme-Art:** Pauschal-Verdikt im Chat («alles abgenommen») auf die
  vorgelegte Offen-Liste der Session-Übergabe (Stand Nachtrag 11/12,
  STRUKTUR.md/HANDLUNGSPLAN); Dev-Server lief lokal (Sichtmöglichkeit).

## 1 · Abgenommene Posten (Wortlaute)

| # | Posten | Fundort | Bisheriger Vermerk |
|---|---|---|---|
| 1 | geo.admin-Datenschutz-Absatz (/datenschutz Abschnitt 2) inkl. Knopf «Beim Bund nachschlagen» + permanenter Übermittlungs-Hinweis der `AdresseBundSuche` | `src/pages/Datenschutz.tsx` · `src/components/vorlagen/AdresseBundSuche.tsx` | «Wortlaut-Abnahme David offen» (12.6.) |
| 2 | Zefix-Datenschutz-Absatz (/datenschutz Abschnitt 2, Altbestand 11.6.) | `src/pages/Datenschutz.tsx` | «Wortlaut-Abnahme David offen» |
| 3 | KVG-Preset «Krankenkasse (Grundversicherung)» — Preset-/Hinweis-Texte Maske 3 | `src/lib/vorlagen/kuendigungAllgemein.ts`; Dossier `bibliothek/recherche/kvg-grundversicherung-kuendigung.md` | «Abnahme David offen» |
| 4 | TI-Miete-Texte (Ortsteil-Wahl Lugano/Bellinzona/Val Mara, Hinweis-Zeilen) | Schlichtungs-UI; Dossier §51 | «Wortlaut-Abnahme offen» (Nachtrag 11) |
| 5 | FE-Altbestand: FE-1-WARUM-Sätze (FristenRegister) + FE-2-Weiche-Texte (Betreibungssache/Zivilgericht, «Nicht abgebildet»-Zeile) | `src/lib/fristenKategorie.ts` + Regime-Weiche | «Abnahme offen» (10.6.) |
| 6 | Mahnung & Inverzugsetzung — Baustein-Wortlaute der Vorlage | `src/lib/vorlagen/mahnung.ts` | «fachliche Abnahme offen» (11.6.) |
| 7 | BGer-Rechtsweg: Eheschutz-Warnung V-1 (bleibt WARNUNG) + Hinweis-Texte + die 7 als Vorschlag umgesetzten Dossier-Fragen | `src/lib/bgerRechtsweg.ts` / BGG-Fristen-UI | «fachliche Abnahme offen» (11.6.) |

## 2 · Abgenommene Priorisierung

**P1-Abnahme der Wettbewerbsanalyse** (`bibliothek/recherche/
wettbewerbsanalyse-rechtswissen-schweizer-vertraege.md`): die 9 P1-Vorlagen
und die Bucket-Einordnung A–D gelten als von David bestätigte Arbeits-
Grundlage → `FAHRPLAN-VORLAGEN-AUSBAU.md` V2-Rest/V3 ff. sind freigegeben.

## 3 · Abgrenzung (NICHT umfasst — bleibt offen)

- **Karten-Status-Hebungen auf `geprüft`/`verified:true`:** brauchen nach
  `abnahme/SCHEMA.md` + Skill-Regel ein Verdikt zu GENAU einer Karte mit
  Referenzfall-Protokoll. Paket Tagerechner liegt bereit
  (`.scratch/abnahme-paket-tagerechner.md`); alle Karten bleiben `entwurf`.
- KATALOG-ROADMAP **Teil D** (Fall-für-Fall-Entscheide).
- Praxis-Rang-Kuratierung (`lib/praxisRang.ts`) und Anliegen-Liste
  (`lib/anliegen.ts`) — nicht Teil der vorgelegten Liste.
- Behörden-/Recherche-Dossiers ausserhalb der Posten 1–7 (z. B.
  Strafbehörden-Adressen, GlG-Vollerhebung, Klageschrift-Gliederung
  O07/V1-V2/K08, fedlex-pin-Nachverifikation).
- Datenschutz-Seite ALS GANZE bleibt **Entwurf** (Platzhalter Ziff. 1
  Verantwortliche Stelle, Ziff. 4 Vercel-AVV) — Badge bleibt.

## 4 · Ergebnis

**Abgenommen** (Posten 1–7 + P1-Priorisierung), ohne Auflagen.
Eine spätere fachliche Änderung an einem der Texte macht den betroffenen
Posten wieder abnahmepflichtig (SCHEMA.md-Regel sinngemäss).
