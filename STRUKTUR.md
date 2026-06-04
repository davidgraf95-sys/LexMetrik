# LegalCalc — Struktur der Startseite

**Stand:** Juni 2026

## Informationsarchitektur (Entscheid bestätigt)

**Modus = In-Page-Toggle, Stufe = Route.** Die Primärweiche «Rechner | Vorlagen»
sitzt als Segmented Control prominent **unter dem Hero** (steuert Modus-Text und
Katalog; Zustand in `?modus=`). Die Stufe «Allgemein | Fachpersonen» bleibt Route
(`/` bzw. `/fachpersonen`, Umschalter dezent in der Topbar) — so bleibt das
spätere Zugriffs-Gating der Experten-Route als Wrapper anschliessbar.
Sektionsköpfe/Zähler benennen die Einheit modusabhängig («… Rechner» /
«… Vorlagen»), abgeleitet aus der Sektions-Art — keine fixen Strings.

**Sucheinstiege:** Inline-Suche im Katalog = Filter innerhalb des aktiven Modus;
⌘K-Befehlspalette = globale Navigation über alle Modi/Stufen/Seiten. Bewusst
getrennt gehalten und unterschiedlich beschriftet.

**Sprachen:** Sprachumschalter sichtbar (Topbar); EN/FR/IT = «in Bearbeitung»
mit DE-Fallback und persistentem Hinweis-Banner; keine maschinelle Übersetzung —
Übersetzungen erfolgen später durch eine fachkundige Person. `<html lang>` folgt
der Locale; Fedlex-Links folgen ihr ebenfalls (fr/it amtlich, Anker per
Stichprobe sprachunabhängig verifiziert; en → amtliche de-Fassung). Der Hero ist
text-geführt einspaltig (Kompass-Grafik entfernt, bewusst nicht animiert/ersetzt).

## Status-Modell (ehrlich, drei Zustände)

`entwurf` (orange Akzentkante + Badge «Entwurf») = gebaut, fachlich noch nicht
geprüft · `geprüft` (Goldrand) = fachlich geprüft — **aktuell nirgends
vergeben** · `geplant` (gedämpft) = «In Vorbereitung», ohne Norm-Pills.
Alle NormRefs tragen `verified: false`, bis fachkundig gegen Fedlex geprüft.
Form-Gates der Vorlagen bleiben im Entwurf-Status voll funktional.

## Fachpersonen-Gliederung (Modus Rechner)

Zweistufig **Rechtsbereich → Output-Typ** (Privatrecht · Öffentliches Recht ·
Strafrecht · Übergreifend; `rechtsbereich` auf jeder Karte). Konsolidierung:
43 → 34 Rechner — absorbierte Einzelkarten laufen als Szenarien/Phasen der
Zielkarten (`RechnerCard.szenarien`; ZPO/SchKG über die bestehende Phasen-
Auswahl). Vorlagen bleiben nach Dokument-Typ gegliedert; `rechtsbereich` ist
dort nur Filterwert (fast alles privat — Bereichs-Sektionen wären leer).
Grenzfall «Einsprache»: straf zugeordnet (Strafbefehl häufiger),
Verwaltungsbefehl über Keywords/Filter.

## Oberste Ebene: vier Output-Typen

| Nr. | Sektion (`art`) | Inhalt |
|---|---|---|
| I | Fristen (`frist`) | Prozessuale und materielle Fristen |
| II | Beträge & Quoten (`betrag`) | Geldansprüche, Zinsen, Kosten, Quoten |
| III | Zuständigkeit & Einordnung (`zuordnung`) | Gericht, Recht, Verfahrensart |
| IV | Werkzeuge (`werkzeug`) | Rechtsgebietsübergreifende Hilfsrechner |

Die doktrinären Schnitte (Verfahrensrecht/Materielles Recht, Rechtsgebiete)
leben im Feld `rechtsgebiet` (Filterleiste) weiter. Quelle:
`src/lib/startseiteConfig.ts`. Geplante Kacheln («In Vorbereitung») tragen
keine Norm-Pills und keine Artikel-/Tagesangaben.

## Backlog (bewusst NICHT gerendert)

Aufnahme nur, wenn ein klar regelbasierter, deterministischer Umfang
definiert ist — sonst Widerspruch zum Versprechen «feste Rechenregeln,
keine Schätzung»:

- **Konsumkredit-Widerruf (Frist)** — aufnehmen, wenn der Anwendungsbereich
  geklärt ist.
- **Haftpflicht: Schadenersatz & Genugtuung** — richterliches Ermessen,
  derzeit nicht deterministisch abbildbar.
- **Unterhaltsberechnung (Kindes-/Ehegattenunterhalt)** — stark einzelfall-
  und ermessensabhängig.
- **Geldstrafen-Tagessatz** — wirtschaftliche Verhältnisse, wertend.
- **Mietzinsherabsetzung bei Mängeln** — wertend.
- **Konkurrenzverbot — Zulässigkeit** — örtlich/zeitlich/sachlich, wertend.
