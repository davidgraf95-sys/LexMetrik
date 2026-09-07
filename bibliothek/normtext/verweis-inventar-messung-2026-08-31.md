# Verweis-Inventar des Normtext-Korpus — Bestandsmessung 31.8.2026

**Erstellt:** 31.8.2026 — Anlass: Auftrag David 31.8.2026 (Verweis-Schärfe),
Bestandsmessung vor dem Bau `W2·20-VERWEIS-SCHAERFE`.
**Status:** ERSTMESSUNG — technische Messung, fachliche Abnahme David offen.

**Quelle/Stand:** eigener Erkenner-Replay über alle 1 458 Snapshot-Erlasse (132 616 Blöcke),
main-Stand `2bb60ebd1`, 31.8.2026; Produktions-Erkenner importiert
(`normVerweiseImText`, `fremdgesetzNachArtikel`, `fremdRoutingFormB`, `artikelnPluralVerweise`),
Inline-Guards aus `NormText.tsx` wörtlich transkribiert (Entscheidreihenfolge identisch
`restMitIntern`). Methodenvorbehalt: Transkription, nicht React-Rendering.
**Anlass:** Auftrag David 31.8.2026 (Verweis-Schärfe); Bau-Spec
`fahrplaene/FAHRPLAN-VERWEIS-SCHAERFE.md`.

## Regel (deterministisch): heutige Formklassen-Behandlung

| Formklasse | Verhalten | Anker |
|---|---|---|
| `Art. N GESETZ` (Fedlex-Kürzel, 215) | Link extern (NormChip→Fedlex) | `parser.ts:38,261`, `NormText.tsx:395-409` |
| i.V.m.-Ketten / N2b Form B / A10-Plural fremd | Link extern je Glied | `parser.ts:125-302,439` |
| bare `Art. N` (Art.-Erlass, Token da) | Self-Sprung | `NormText.tsx:369-377` |
| bare `§ N` (§-Erlass, F40) | Self-Sprung | `NormText.tsx:147,254-278` |
| `Art./§ N des|der|über|vom …` | Text (des/der-Guard, pauschal) | `NormText.tsx:335,182` |
| `Art. N KÜRZEL` unbekannt (M12) / N2 Form A | Text | `NormText.tsx:355,343` |
| `§ N <Grosswort>` (§-Erlass) | Text | `NormText.tsx:181,261` |
| bare `Art. N` im §-Erlass (F41) | Text (Self-Sperre) | `NormText.tsx:106-124` |

**Gesamt: 24 489 Zitat-Stellen → 17 411 verlinkt (71.1 %), 7 078 Text** —
Text-Anteile: N2-Kürzel 2 375 · des/der-Guard 1 692 · kein Token 985 · Grosswort 585 ·
M12 486 · F41 355 · Plural-unterdrückt 600.

## Kernbefunde

1. **Selbstmarker** («dieses Gesetzes» 1 786/257 Erl., «dieser Verordnung» 1 007/313 …):
   verweis-tragend 548 Stellen/79 Erlasse → 528 verlinkt, **18 fälschlich im des/der-Guard**
   («des vorliegenden Gesetzes», Zwilling AHVG Art. 9 unverlinkt vs. AIG Art. 80a verlinkt),
   2 tote Ziele (KVG Art. 11 existiert nicht mehr; AI-640.000 Art. 90a).
2. **Eigenes Kürzel als Fremd behandelt:** kantonal 13 Stellen unterdrückt
   (BS-162.100 § 19a «§ 19 Personalgesetz»), Bund 5 Stellen als Fedlex-Extern-Chip statt
   Self (SSV/VZV-Anhänge).
3. **Grosswort-Reserve kantonal:** von 585 Unterdrückungen sind **400 im selben Kanton über
   das Register-`kuerzel` EINDEUTIG auflösbar** (1 158 eindeutige, 35 mehrdeutige Kürzel je
   Kanton); 65 mehrdeutig, 107 ohne Registertreffer. Systematik-Nummern («SG 154.100») kommen
   im Normtext praktisch nicht vor (14 Rohtreffer, alle Falschpositive) — der kantonale
   Anker ist das Kürzel.
4. **Keine Aussen-Anzeige:** Self und Fremd tragen dieselbe Ruhe-Klasse
   (`VERWEIS_INLINE_CLASS`); Unterschied nur im Verhalten (Fedlex-target-blank/Popover vs.
   navigate). Korpus-interne Bundes-Fremdziele extern zu adressieren ist an
   `NormChip.tsx:76-88` bewusst offen deklariert (16 Wächter-Zusicherungen).
5. **F41-Nullprobe:** 0 explizite Selbstmarker-Stellen in §-Erlassen betroffen — Sperre
   heute kostenlos; nach V-3 wären die 355 F41-Fälle grossteils aktiv routbar.
6. **Zeit-Kante statt Erlass-Kante:** kein Fall, wo «dieses Gesetzes» einen fremden Erlass
   meint (3 Sonden über Änderungs-/Übergangs-/Altrecht-Muster); ABER 93 Stellen/55 Erlasse in
   Übergangsbestimmungen + 72 Altrecht-Blöcke meinen eine **Vorfassung** (AIG Art. 126c) —
   Self-Link dorthin ist ohne Fassungs-Hinweis irreführend (§8).
7. **Inventar-Unterbau:** keine bestehende Quoten-Messung (F41/F40-Zahlen nur als
   Code-Kommentar); `bestimmungsEtikettStatus:'entwurf'` bei allen 1 231 kantonalen
   Erlassen; Genitiv-/Alias-Tabellen nur Bund (26 Einträge/200 SR); naives Genitiv-Matching
   kantonal löst 205/2 627.

## Geltung/Ausnahmen
Momentaufnahme des Korpus + Erkenners vom 31.8.2026; Zahlen NICHT fortschreiben — das
V-1-Tor (`check:verweis-inventar`, in Bau) ersetzt sie durch ein reproduzierbares Artefakt.

## Pflegebedarf
Nach jedem Korpus-Nachzug bzw. Erkenner-Umbau via V-1-Tor neu messen; Datensignale
(tote Selbstziele) gehören in `W2·13-KANTONE-DATEN` bzw. Bund-Pflege.

## Abnahme-Status
Technische Messung, keine fachliche Abnahme; `bestimmungsEtikett`-Abnahme (1 231 kantonale
Einträge `entwurf`) liegt bei David (Abnahme-Warteschlange).
