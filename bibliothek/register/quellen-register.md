# Quellen-Register (verifizierte amtliche Quellen)

Stand: 5.6.2026. Ergänzungen immer mit Konsolidierungsdatum/Abrufdatum.

## Fedlex — verifizierte Gesetzesquellen

Basis-URLs sind in `src/lib/fedlex.ts` verdrahtet (SSoT für Links). Die
empirische Anker-Verifikation läuft gegen das **konsolidierte Filestore-HTML**
(die Website selbst ist eine JS-SPA ohne auslesbare Anker):

```
https://fedlex.data.admin.ch/filestore/fedlex.data.admin.ch/eli/<ELI>/<KONSOLIDIERUNG>/de/html/fedlex-data-admin-ch-eli-<ELI mit Bindestrichen>-<KONSOLIDIERUNG>-de-html-<N>.html
```

`<N>` variiert (meist 1, OR/ZGB: 4); `scripts/fedlex-cache.sh` probiert die Varianten durch.
Anker-Format: `art_335_c` (Buchstaben-/bis-Artikel mit Unterstrich, sprachunabhängig).

| Gesetz | SR | ELI | Verifizierte Konsolidierung | Empirisch geprüfte Anker (Auszug) |
|---|---|---|---|---|
| OR | 220 | cc/27/317_321_377 | 20260101 (5.6.2026) | art_11, 32–39, 77, 78, 104, 216, 324a/b, 335c, 336c, 396, 493, … |
| ZGB | 210 | cc/24/233_245_233 | 20260101 (5.6.2026) | art_19_c, 360–370, 467, 505, … |
| ZPO | 272 | cc/2010/262 | **20250101 — enthält Revision 2025** (5.6.2026) | art_4–10, 17, 18, 31–35, 68, 145, 197–212, 243 |
| SchKG | 281.1 | cc/11/529_488_529 | (frühere Session) | art_56, 63, … |
| ArG | 822.11 | cc/1966/57_57_57 | 20230901 (5.6.2026) | art_9, 12, 13, 46 |
| VMWG | 221.213.11 | cc/1990/835_835_835 | 20250101 (5.6.2026) — **20251001 nicht abrufbar** | art_16, 17, 19 — **art_19_a existiert NICHT** (s. u.) |
| StPO | 312.0 | cc/2010/267 | 20240101 (5.6.2026) | art_129 |
| VwVG | 172.021 | cc/1969/737_757_755 | 20210101 (5.6.2026) | art_11 |
| Fristengesetz | 173.110.3 | cc/1963/819_815_843 | (Link ohne Anker) | — |

**Offene Diskrepanz VMWG Art. 19a** (Befund 5.6.2026 abends): Der Kommentar in
`src/lib/fedlex.ts` nennt `art_19a` als verifiziert (Konsolidierung 20251001) — die
20251001-Fassung liefert der Filestore aber nicht aus (nur SPA-Shell), und in der
greifbaren Konsolidierung 20250101 existiert nur `art_19`, kein `art_19_a`. Der
Mietvertrag-Hinweis zu Art. 19a VMWG trägt bereits «zu verifizieren». → Vor der
nächsten Mietvertrag-Abnahme klären, ob Art. 19a (Revision 1.10.2025) am Original
nachweisbar ist; bis dahin keine 19a-Pille verdrahten.

**Wichtig ZPO-Revision 2025** (am Wortlaut bestätigt, 5.6.2026): Art. 210 heisst neu
«**Entscheidvorschlag**» und gilt bis **CHF 10'000** (vorher Urteilsvorschlag/5'000);
Art. 6 Abs. 4 lit. c erlaubt internationale Handelsgerichts-Zuständigkeit ab CHF 100'000
mit Zustimmung. → Keine Schwellenwerte aus dem Gedächtnis verdrahten; Wortlaute in
[normtexte-zpo-zustaendigkeit.md](../normen/normtexte-zpo-zustaendigkeit.md).

## Externe amtliche Quellen (laufende Daten)

| Quelle | Inhalt | Stand bei letzter Nutzung | Rhythmus |
|---|---|---|---|
| BWO «Schlichtungsbehörden in Mietsachen» — bwo.admin.ch/…/schlichtungsbehoerden.html | Adressen aller Miet-Schlichtungsbehörden CH | PDF 13.02.2026 | jährlich prüfen |
| referenzzinssatz.admin.ch (BWO) | hypothekarischer Referenzzinssatz | 1.25 % (2.6.2026) | **quartalsweise** |
| BFS, Landesindex der Konsumentenpreise | LIK-Reihen (Teuerungsrechner) | bis 2026-05 | monatlich; `scripts/lik-reihe-generieren.py` |
| EJPD-Verzeichnis gesetzliche Feiertage | Feiertage je Kanton (`data/zpoFeiertage.ts`) | Stand 2011 (veraltbar!) | bei Gelegenheit gegen kantonales Recht prüfen |
| BWO Formularpflicht-Kantone | Mietvertrag-Formularpflicht | 4.2.2026; **BE dynamisch per 1.11.2026** | jährlich + BE-Termin |
| Kantonale Justizportale | Behörden-Adressen | je Dossier | vor Stammdaten-Übernahme |

## Nicht-amtliche Findhilfen (NIE als Beleg)

- lawmaps.ch (Hinweis David 5.6.2026) — Gerichtsverzeichnis als JS-SPA, maschinell
  nicht auslesbar; höchstens zur Gegenprobe von Hand.
- tribunauxcivils.ch — amtsnahes Justizportal Westschweiz (Adress-Gegenprobe).

## Rechtsprechung

Register mit Verifikations-Status: `src/data/verifikation.ts` (BGE/BGer-Einträge
tragen «zu verifizieren», bis David den Originalentscheid geprüft hat).
