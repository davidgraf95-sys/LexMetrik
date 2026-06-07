# Quellen-Register (verifizierte amtliche Quellen)

Stand: 7.6.2026 (S3-Nachzug Bibliotheks-Standard: HRegV, GebV-HReg, StG, GebV SchKG, StGB nachregistriert — die Pins existierten teils ohne Register-Zeile).

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
| SchKG | 281.1 | cc/11/529_488_529 | 20250101 | art_17, 46, 56, 63, 84, 272 (6.6.2026) |
| ArG | 822.11 | cc/1966/57_57_57 | 20230901 (5.6.2026) | art_9, 12, 13, 46 |
| VMWG | 221.213.11 | cc/1990/835_835_835 | 20250101 (5.6.2026) — **20251001 nicht abrufbar** | art_16, 17, 19 — **art_19_a existiert NICHT** (s. u.) |
| StPO | 312.0 | cc/2010/267 | 20240101 (5.6.2026) | art_31, 129, 301, 379 (6.6.2026) |
| VwVG | 172.021 | cc/1969/737_757_755 | 20210101 (5.6.2026) | art_11 |
| BGG | 173.110 | cc/2006/218 | 20250101 (6.6.2026, html-1 bestätigt) | art_1–133 durchgehend; verdrahtet: 45, 46, 74, 75, 93, 98, 100, 113 |
| VVG | 221.229.1 | cc/24/719_735_717 | 20240101 (6.6.2026, html-2; 2025/26 liefern nur SPA-Shell) | art_35_a/b/c, 97, 98 — 35a halbzwingend (98), 35b/c zwingend (97), Lebensvers. ausgenommen (35a Abs. 3), Krankenzusatz: Kündigungsrecht nur VN (35a Abs. 4) |
| Fristengesetz | 173.110.3 | cc/1963/819_815_843 | (Link ohne Anker) | — |
| HRegV | 221.411 | cc/2007/686 | 20250101 (6.6.2026) | art_20, 22, 43–46, 71–76, 84, 90, 94, 117; Anhang 3 (Fremdwährungen) |
| GebV-HReg | 221.411.1 | cc/2020/180 | 20210101 — einzige Konsolidierung (6.6.2026) | Gebühren-Anhang (Neueintragung 420/280/210) |
| StG | 641.10 | cc/1974/11_11_11 | 20240101 (6.6.2026) | art_5, 6 (lit. h Freibetrag 1 Mio.), 8 (1 %) |
| GebV SchKG | 281.35 | cc/1996/2937_2937_2937 | 20260101 (7.6.2026) — **Spezialfall: Filestore-Datei OHNE «-N»-Suffix** (Skript n=0) | art_16, art_15_a; Staffeln Wert für Wert verifiziert (gebv-schkg-kostenrechner.md) |
| StGB | 311.0 | cc/54/757_781_799 | 20260101 (7.6.2026, html-2) | art_30–33, 97–101, 109, 333, 389 (Verjährung/Antrag) |

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
| EJPD-Verzeichnis gesetzliche Feiertage | Feiertage je Kanton (`data/zpoFeiertage.ts`) | BJ-Liste 2011; Doppelcheck 26/26 am 6.6.2026 → `normen/feiertage-kantone-bj.md` | je Kanton vor «geprüft» gegen geltendes kantonales Recht |
| BWO Formularpflicht-Kantone | Mietvertrag-Formularpflicht | 4.2.2026; **BE dynamisch per 1.11.2026** | jährlich + BE-Termin |
| Kantonale Justizportale | Behörden-Adressen | je Dossier | vor Stammdaten-Übernahme |

## Nicht-amtliche Findhilfen (NIE als Beleg)

- lawmaps.ch (Hinweis David 5.6.2026) — Gerichtsverzeichnis als JS-SPA, maschinell
  nicht auslesbar; höchstens zur Gegenprobe von Hand.
- tribunauxcivils.ch — amtsnahes Justizportal Westschweiz (Adress-Gegenprobe).

## Rechtsprechung

Register mit Verifikations-Status: `src/data/verifikation.ts` (BGE/BGer-Einträge
tragen «zu verifizieren», bis David den Originalentscheid geprüft hat).
