# Bibliothek — Informationsgrundlagen für LexMetrik

Zentrale Ablage für recherchierte Grundlagen, Quellenregister und Arbeitsmaterial,
das (noch) nicht Code ist. Regeln (aus CLAUDE.md abgeleitet):

1. **Nur amtliche Quellen als Beleg**, immer mit URL und Abrufdatum (§7).
2. **Status ehrlich tragen:** Jedes Dokument sagt im Kopf, ob es abgenommen ist.
   Recherchen sind ARBEITSGRUNDLAGEN — Übernahme in Engines/Stammdaten erst nach
   fachlicher Prüfung durch David.
3. **Unsicherheiten bleiben sichtbar** (§8) — nie weggeglättet.
4. **Datiertes datiert halten:** veränderliche Werte gehören ins
   [Parameter-Verfallsregister](parameter-verfall.md).

## Inhalt

| Dokument | Inhalt | Status |
|---|---|---|
| [quellen-register.md](quellen-register.md) | Verifizierte Fedlex-Quellen (ELI, Konsolidierung, geprüfte Anker, Filestore-Muster) + externe amtliche Quellen | gepflegt, fortlaufend |
| [parameter-verfall.md](parameter-verfall.md) | Register aller datierten Parameter im Code mit Prüfrhythmus | gepflegt, fortlaufend |
| [normtexte-zpo-zustaendigkeit.md](normtexte-zpo-zustaendigkeit.md) | Wortlaut der 25 Schlüsselartikel für die Zuständigkeitsengine (ZPO, Konsolidierung 1.1.2025 — inkl. Revision 2025) | maschinell extrahiert, **vor Verdrahtung sichtprüfen** |

### Behörden (Gerichte & Schlichtung)

| Dokument | Inhalt | Status |
|---|---|---|
| [gerichtsbehoerden-kantone.md](gerichtsbehoerden-kantone.md) | Master-Liste der Gerichtsbehörden aller 26 Kantone (Namenslogik, Adressen, Reformen GR/NE) | Recherche 5.6.2026, **2. Prüfdurchgang ausstehend** |
| [gerichtsadressen-erstliste.md](gerichtsadressen-erstliste.md) | Davids CSV (47 Gerichte) + Verifikationsbefund (21 ✓ / 26 abweichend) | abgeschlossen 5.6.2026 |
| [gerichte-bund.md](gerichte-bund.md) | BGer/BStGer/BVGer/BPatGer: Standorte, Abteilungen, Zuständigkeiten, Rechtsmittelwege (Art. 74 BGG verifiziert) | Recherche 5.6.2026, **2. Prüfdurchgang ausstehend** |
| [schlichtungsbehoerden-kantone.md](schlichtungsbehoerden-kantone.md) | Schlichtungsbehörden aller 26 Kantone: Organisationsform, Adressen | **zweifach geprüft** (2 adversariale Re-Checks eingearbeitet), nicht abgenommen |
| [schlichtungsbehoerden-zh-vollerfassung.md](schlichtungsbehoerden-zh-vollerfassung.md) | ZH komplett: 171 Friedensrichterämter + 12 Miet-Bezirksstellen + GlG-Stelle | einfach belegt 5.6.2026 |
| [schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md](schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md) | Vollerfassung SZ/BL/SO/ZG/SH/LU (SZ grossteils offen — JS-Karte) | einfach belegt; **Agenten-Konflikte markiert** |
| [schlichtungsbehoerden-ti-vs-gr-vollerfassung.md](schlichtungsbehoerden-ti-vs-gr-vollerfassung.md) | TI 38 Giudicature + Mietbüros, VS-Systematik (juge de commune), GR 11 Vermittlerämter | einfach belegt; **Konflikte markiert (VS-PLZ, TI-Zählung)** |

### Kosten & Tarife

| Dokument | Inhalt | Status |
|---|---|---|
| [schlichtungsgebuehren-kantone.md](schlichtungsgebuehren-kantone.md) | Schlichtungsgebühren aller 26 Kantone, wörtlich aus den Erlassen (+ Art. 113 Abs. 2 ZPO-Kopf) | Recherche 5.6.2026, **2. Prüfdurchgang ausstehend** |
| [gerichtskosten-bund.md](gerichtskosten-bund.md) | Tarife BGer/BVGer/BStGer/BPatGer wörtlich aus Fedlex (Gebühren + Parteientschädigung) | einfach belegt 5.6.2026 |
| [anwaltstarife-kantone.md](anwaltstarife-kantone.md) | Anwaltstarife (Parteientschädigung/UR) aller 26 Kantone mit Staffeln und Stundenansätzen | einfach belegt 5.6.2026 |

## Werkzeuge

- `scripts/fedlex-cache.sh` — lädt die konsolidierten Filestore-HTMLs aller
  verwendeten Gesetze nach /tmp und prüft das Anker-Inventar (reproduzierbare
  §7-Verifikation; /tmp-Caches überleben Neustarts nicht).
- `scripts/golden-outputs.ts` — Golden-Protokoll der Engines (53 Fälle).

## Verwandtes im Repo (nicht hier dupliziert)

- `src/lib/fedlex.ts` — verdrahtete, verifizierte Fedlex-Basis-URLs + Anker-Logik
- `src/data/verifikation.ts` — Rechtsprechungs-Register (BGE/BGer mit Verifikations-Status)
- `src/lib/vorlagen/behoerden.ts` — abgenommene Behörden-Stammdaten (aktuell: BS)
- `STRUKTUR.md` — Gesamtstand · `KATALOG-ROADMAP.md` — Soll-Inventar
