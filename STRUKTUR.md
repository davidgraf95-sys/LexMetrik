# LegalCalc — Struktur der Startseite

**Stand:** Juni 2026

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
