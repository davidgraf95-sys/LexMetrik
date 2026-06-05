# Bibliothek — Informationsgrundlagen für LexMetrik

Zentrale Ablage für recherchierte Grundlagen, Quellenregister und Arbeitsmaterial,
das (noch) nicht Code ist. 23 Dossiers in 4 Ordnern (Stand 6.6.2026). Regeln:

1. **Nur amtliche Quellen als Beleg**, immer mit URL und Abrufdatum (§7);
   kantonale Erlasse stets in der geltenden konsolidierten Fassung via
   Erlasssammlungs-API (`abrogated`/`future_versions` prüfen — Daueranweisung).
2. **Status ehrlich tragen:** zweifach geprüft (Erstrecherche + adversarialer
   Durchgang) · einfach belegt · offen. Übernahme in Engines/Stammdaten erst
   nach fachlicher Abnahme durch David.
3. **Unsicherheiten bleiben sichtbar** (§8) — nie weggeglättet.
4. **Datiertes datiert halten** → [Parameter-Verfallsregister](register/parameter-verfall.md).

## Gliederung

```
bibliothek/
  register/    Quellen-Register (Fedlex-Stände) · Parameter-Verfallsregister
  normen/      Regelwerke ZPO·SchKG·StPO·Erbrecht — die Engine-Grundlagen
  behoerden/   Gerichte · Schlichtung · Strafverfolgung · Erbgang (je 26 Kantone)
  kosten/      Schlichtungsgebühren · Gerichtskosten Bund · Anwaltstarife
```

## register/ — fortlaufend gepflegt

| Dokument | Inhalt |
|---|---|
| [quellen-register.md](register/quellen-register.md) | Verifizierte Fedlex-Quellen (ELI, Konsolidierung, geprüfte Anker, Filestore-Muster) |
| [parameter-verfall.md](register/parameter-verfall.md) | Datierte Parameter mit Prüfrhythmus — u. a. **SG GKV endet 30.6.2026**, GR HV/BE EAV 31.12.2026, NE-Umzug Sommer 2026, JU-Punktwert, BE-Formularpflicht 1.11.2026, Referenzzins |

## normen/ — Regelwerke (Engine-Grundlagen, Wortlaute verbatim)

| Dokument | Inhalt | Verifikation |
|---|---|---|
| [zpo-zustaendigkeit-regelwerk.md](normen/zpo-zustaendigkeit-regelwerk.md) | Art. 4–46 + Systematik (Bindungsgrade, HG-Revision 2025, perpetuatio fori, Art.-63-Rettung, IPRG-Weiche) mit Engine-Hinweisen | 17/17 Wortlaut-Proben am Cache ✓ |
| [schkg-zustaendigkeit-regelwerk.md](normen/schkg-zustaendigkeit-regelwerk.md) | Betreibungsorte 46–55, Klage-Foren + Fristen (Aberkennung 20 T., Arrest-Kaskade), Gericht vs. Aufsicht; Synthese-Tabelle | Wortlaute verbatim Stand 1.1.2025 ✓ |
| [stpo-zustaendigkeit-regelwerk.md](normen/stpo-zustaendigkeit-regelwerk.md) | Behörden 12–18, Bund-Kataloge 23/24, Gerichtsstand 31–42 (Tatort/Prioritätsprinzip), Strafbefehl/abgekürzt (Rev. 2024); Decision-Tree | 13/13 substanzielle Proben ✓ |
| [erbrecht-regelwerk.md](normen/erbrecht-regelwerk.md) | 3 Teile: Erbfolge+Pflichtteile (Rev. 2023, Quoten-Synthesen beide Rechtsstände) · Verfügungen+Klagen (Fristen 521/533) · Erbgang+Teilung (22 Fristen, Ausgleichung 626 ff.); **Engine-Audits: erbteilung.ts + testament.ts bestanden** | 16/16 Wortlaut-Proben ✓ |
| [normtexte-zpo-zustaendigkeit.md](normen/normtexte-zpo-zustaendigkeit.md) | Wortlaut der 25 Schlüsselartikel (Erstbestand der Engine) | maschinell extrahiert |

## behoerden/ — Behördenlisten

### Zivil (Gerichte + Schlichtung) — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [gerichtsbehoerden-kantone.md](behoerden/gerichtsbehoerden-kantone.md) | Master-Liste Gerichte 26 Kantone | 0 Widerlegungen, 8/8 Stichproben; offen nur AR-Hausnr. + TI-Leventina |
| [gerichte-bund.md](behoerden/gerichte-bund.md) | BGer/BStGer/BVGer/BPatGer | 1 Korrektur (BVGer-PLZ 9023) eingearbeitet |
| [gog-gerichtsorganisation-kantone.md](behoerden/gog-gerichtsorganisation-kantone.md) | Behörde→GOG-Artikel + kantonale Zivil-Gebührenstaffeln | 15/15 Stichproben bestätigt |
| [schlichtungsbehoerden-kantone.md](behoerden/schlichtungsbehoerden-kantone.md) | Schlichtungsbehörden 26 Kantone | 2 Re-Checks + Schiedsrichter (BL/SH/TI entschieden) |
| [schlichtungsbehoerden-zh-vollerfassung.md](behoerden/schlichtungsbehoerden-zh-vollerfassung.md) | ZH: 171 FR-Ämter + 12 Miet-Stellen + GlG | Stichproben ✓ — speist die PLZ-Auflösung |
| [schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md](behoerden/schlichtungsbehoerden-sz-bl-so-zg-sh-lu-vollerfassung.md) | Vollerfassung SZ/BL/SO/ZG/SH/LU | Konflikte entschieden; SZ teiloffen (JS-Karte) |
| [schlichtungsbehoerden-ti-vs-gr-vollerfassung.md](behoerden/schlichtungsbehoerden-ti-vs-gr-vollerfassung.md) | TI 38 Giudicature, VS-Systematik, GR 11 Vermittlerämter | TI 11 Mietbüros entschieden |
| [schlichtungsaemter-gemeindezuordnung.md](behoerden/schlichtungsaemter-gemeindezuordnung.md) | Gemeinde→Amt für AG/SG/TG/FR/ZG/AI (+ SZ/BL teiloffen) — **Quelle der generierten PLZ→Amt-Daten** (scripts/plz-generieren.ts) | zweifach belegt; SZ/BL am 6.6.2026 GESCHLOSSEN (Itingen→Kreis 13; personengebundene Adressen → Verzeichnis-Fallback bleibt) |
| [gerichtsadressen-erstliste.md](behoerden/gerichtsadressen-erstliste.md) | Davids CSV (47) + Audit-Trail (21 ✓ / 26 abweichend) | abgeschlossen |

### Straf — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [strafbehoerden-kantone.md](behoerden/strafbehoerden-kantone.md) | Staatsanwaltschaften/Jugendanwaltschaften/Übertretungsbehörden 26 Kantone + Bund (BA/AB-BA), EG-StPO-Mapping | SZ-Korrektur (Schmiedgasse 21, JugA Bennau); ALLE Lücken geschlossen (AG-Hausnummern 6.6.; VD-Korrektur: Konstituierung in LMPu 173.21 Art. 3/4; VS LACPP Art. 6/7; JU → OJ statt LiCPP) |

### Verwaltung — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Offen |
|---|---|---|
| [verwaltungsbehoerden-kantone.md](behoerden/verwaltungsbehoerden-kantone.md) | Wichtigste Verwaltungsbehörden je Kanton (VGer/Staatskanzlei/Steuer+Rekurs/StVA/Migration/SozVGer) — ALLE 26 Kantone (u. a. GR-Obergericht 1.1.2025, VD-Hermitage Juli 2025; JU: Cour des assurances eigenständig) | Doppelcheck ausstehend |

### Erbgang — ZWEIFACH GEPRÜFT
| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [erbgangsbehoerden-kantone.md](behoerden/erbgangsbehoerden-kantone.md) | Testamentseröffnung/Erbenschein/Ausschlagung je Kanton — 4 Grundmodelle + Aufgaben-Splits | 1 Korrektur (SO 6 Ämter, Breitenbach ergänzt); UR geschlossen (Gemeindemodell); ZH/BE/LU/GE/SG-§§ bestätigt |

## kosten/ — Tarife — ZWEIFACH GEPRÜFT

| Dokument | Inhalt | Befund 2. Durchgang |
|---|---|---|
| [schlichtungsgebuehren-kantone.md](kosten/schlichtungsgebuehren-kantone.md) | Schlichtungsgebühren 26 Kantone + Art.-113-Kopf — **Quelle von src/data/zustaendigkeitKosten.ts** | AG auf GebührD 662.110 korrigiert; Stichproben ✓ |
| [gerichtskosten-kantone.md](kosten/gerichtskosten-kantone.md) | TIEFENERFASSUNG: vollständige Zivil-Staffeln je Kanton (alle Bänder, summarisch, Rechtsmittel, Reduktionen, Vorschuss) — Teil A ZH–BL | einfach belegt; Teil B + Doppelcheck folgen |
| [gerichtskosten-bund.md](kosten/gerichtskosten-bund.md) | Tarife BGer/BVGer/BStGer/BPatGer wörtlich aus Fedlex | alle Stichproben wörtlich ✓, keine neueren Konsolidierungen |
| [anwaltstarife-kantone.md](kosten/anwaltstarife-kantone.md) | Anwaltstarife (Parteientschädigung/UR) 26 Kantone | GL-Tarif existiert doch (GS III I/5); UR-Staffel beschafft |

## Verdrahtung in den Code (SSoT-Karte)

| Dossier | speist |
|---|---|
| zpo-zustaendigkeit-regelwerk | `src/lib/zustaendigkeit.ts` (örtlich/sachlich/Rechtsmittel) |
| schkg-zustaendigkeit-regelwerk | `src/lib/schkgZustaendigkeit.ts` (Rechtsweg «Betreibung», 6.6.2026) |
| stpo-zustaendigkeit-regelwerk | `src/lib/strafZustaendigkeit.ts` (Rechtsweg «Straf», 6.6.2026) |
| erbrecht-regelwerk (Audits) | bestätigt `src/lib/erbteilung.ts` + `vorlagen/testament.ts`; Ausbaupunkt `erb-ausgleichung` |
| gerichtsbehoerden + erstliste (Audit) | `src/data/obereInstanzen.ts` (Rechtsmittel) · `src/data/handelsgerichte.ts` (Art. 6 ZPO) |
| strafbehoerden-kantone | `src/data/staatsanwaltschaften.ts` (26 + Bundesanwaltschaft) |
| schlichtungsbehoerden-* + gemeindezuordnung | `src/data/schlichtungsstellen.ts` · `src/data/schlichtung/*` (PLZ→Amt) · Vorlage Schlichtungsgesuch (SgBehoerdenWahl) |
| schlichtungsgebuehren + gog (Zivil-Staffeln) | `src/data/zustaendigkeitKosten.ts` (Fahrplan-Kosten) |

## Werkzeuge

- `scripts/fedlex-cache.sh` — konsolidierte Filestore-HTMLs nach /tmp + Anker-Prüfung
- `scripts/plz-generieren.ts` — amtliches PLZ-Register (swisstopo) + Gemeinde→Amt-Daten
- `scripts/golden-outputs.ts` — Golden-Protokoll der Engines (53 Fälle)

## Verwandtes im Repo (nicht hier dupliziert)

- `src/lib/fedlex.ts` — verdrahtete Fedlex-Basis-URLs + Anker-Logik
- `src/data/verifikation.ts` — Rechtsprechungs-Register (BGE/BGer)
- `src/lib/vorlagen/behoerden.ts` — abgenommene Behörden-Stammdaten (BS)
- `STRUKTUR.md` — Gesamtstand · `KATALOG-ROADMAP.md` — Soll-Inventar
