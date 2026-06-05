# Bibliothek — Informationsgrundlagen für LexMetrik

Zentrale Ablage für recherchierte Grundlagen, Quellenregister und Arbeitsmaterial,
das (noch) nicht Code ist. Regeln (aus CLAUDE.md abgeleitet):

1. **Nur amtliche Quellen als Beleg**, immer mit URL und Abrufdatum (§7);
   kantonale Erlasse stets in der geltenden konsolidierten Fassung via
   Erlasssammlungs-API (`abrogated`/`future_versions` prüfen — Daueranweisung).
2. **Status ehrlich tragen:** Jedes Dokument sagt im Kopf, ob es abgenommen ist.
   Recherchen sind ARBEITSGRUNDLAGEN — Übernahme in Engines/Stammdaten erst nach
   fachlicher Prüfung durch David. Status-Stufen: **zweifach geprüft**
   (Erstrecherche + adversarialer Durchgang) · einfach belegt · offen.
3. **Unsicherheiten bleiben sichtbar** (§8) — nie weggeglättet.
4. **Datiertes datiert halten:** veränderliche Werte gehören ins
   [Parameter-Verfallsregister](register/parameter-verfall.md).

## Gliederung

```
bibliothek/
  register/    Quellen-Register (Fedlex-Stände) · Parameter-Verfallsregister
  normen/      Normtexte + Zuständigkeits-Regelwerke (ZPO/SchKG) — Engine-Grundlage
  behoerden/   Gerichte (kantonal/Bund) · GOG-Mapping · Schlichtungsbehörden
  kosten/      Schlichtungsgebühren · Gerichtskosten Bund · Anwaltstarife
```

## register/ — fortlaufend gepflegt

| Dokument | Inhalt |
|---|---|
| [quellen-register.md](register/quellen-register.md) | Verifizierte Fedlex-Quellen (ELI, Konsolidierung, geprüfte Anker, Filestore-Muster) + externe amtliche Quellen |
| [parameter-verfall.md](register/parameter-verfall.md) | Datierte Parameter mit Prüfrhythmus — u. a. Referenzzins, BE-Formularpflicht 1.11.2026, NE-Umzug Sommer 2026, JU-Punktwert, **SG GKV endet 30.6.2026**, GR HV/BE EAV enden 31.12.2026 |

## normen/ — Grundlage für die Zuständigkeitsengine

| Dokument | Inhalt | Status |
|---|---|---|
| [normtexte-zpo-zustaendigkeit.md](normen/normtexte-zpo-zustaendigkeit.md) | Wortlaut der 25 Schlüsselartikel (ZPO, Konsolidierung 1.1.2025) | maschinell extrahiert, vor Verdrahtung sichtprüfen |
| [zpo-zustaendigkeit-regelwerk.md](normen/zpo-zustaendigkeit-regelwerk.md) | Deep Research Art. 4–46 + Systematik: Bindungsgrade, BGE, Engine-Hinweise, Revision 2025 | Wortlaut-Stichproben 17/17 am Cache verifiziert; BGE teils Sekundär |
| [schkg-zustaendigkeit-regelwerk.md](normen/schkg-zustaendigkeit-regelwerk.md) | SchKG-Foren + Fristen (Betreibungsorte 46–55, Klagen, Arrest-Kaskade, Gericht vs. Aufsicht) | Wortlaute verbatim SR 281.1 Stand 1.1.2025 |

## behoerden/ — Behördenlisten (alle ZWEIFACH GEPRÜFT, nicht abgenommen)

| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [gerichtsbehoerden-kantone.md](behoerden/gerichtsbehoerden-kantone.md) | Master-Liste Gerichte 26 Kantone | 0 Widerlegungen, 8/8 Stichproben; offen nur AR-Hausnr. + TI-Leventina |
| [gerichte-bund.md](behoerden/gerichte-bund.md) | BGer/BStGer/BVGer/BPatGer | 1 Korrektur (BVGer-PLZ 9023) eingearbeitet |
| [gog-gerichtsorganisation-kantone.md](behoerden/gog-gerichtsorganisation-kantone.md) | Behörde→GOG-Artikel-Mapping + kantonale Zivil-Gebührenstaffeln | 15/15 Stichproben bestätigt |
| [schlichtungsbehoerden-kantone.md](behoerden/schlichtungsbehoerden-kantone.md) | Schlichtungsbehörden 26 Kantone | 2 Re-Checks + Schiedsrichter (BL/SH/TI entschieden, VS-PLZ-Doppel) |
| [schlichtungsbehoerden-zh-vollerfassung.md](behoerden/schlichtungsbehoerden-zh-vollerfassung.md) | ZH: 171 FR-Ämter + 12 Miet-Stellen + GlG | Stichproben bestätigt |
| [schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md](behoerden/schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md) | Vollerfassung SZ/BL/SO/ZG/SH/LU | Konflikte entschieden; SZ grossteils offen (JS-Karte) |
| [schlichtungsbehoerden-ti-vs-gr-vollerfassung.md](behoerden/schlichtungsbehoerden-ti-vs-gr-vollerfassung.md) | TI 38 Giudicature, VS-Systematik, GR 11 Vermittlerämter | TI 11 Mietbüros (inkl. Chiasso) entschieden |
| [gerichtsadressen-erstliste.md](behoerden/gerichtsadressen-erstliste.md) | Davids CSV (47) + Audit-Trail (21 ✓ / 26 abweichend) | abgeschlossen |

## kosten/ — Tarife (alle ZWEIFACH GEPRÜFT, nicht abgenommen)

| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [schlichtungsgebuehren-kantone.md](kosten/schlichtungsgebuehren-kantone.md) | Schlichtungsgebühren 26 Kantone + Art. 113 Abs. 2 ZPO | Stichproben bestätigt; AG auf GebührD 662.110 korrigiert |
| [gerichtskosten-bund.md](kosten/gerichtskosten-bund.md) | Tarife BGer/BVGer/BStGer/BPatGer wörtlich aus Fedlex | alle Stichproben wörtlich bestätigt, keine neueren Konsolidierungen |
| [anwaltstarife-kantone.md](kosten/anwaltstarife-kantone.md) | Anwaltstarife (Parteientschädigung/UR) 26 Kantone | GL-Tarif existiert doch (GS III I/5); UR-Staffel beschafft (260/195) |

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
