# Deckel-Reserven vor ZH — Messung und Entwurf der Materialien-Register-Projektion

**Erstellt:** 2026-09-12 · **Stand der Messung:** 2026-09-12 (Korpusstand `f6b5471fc`)
**Status:** Messung abgeschlossen, Entwurf umgesetzt · fachliche Abnahme David offen
**Auftrag:** «Deckel-Reserven vor ZH» (Unterpunkt W2·13-KANTONE-DATEN), vor dem ZH-Schritt
**Anlass:** `public/materialien/register.json` stand bei 331,8 KB gzip gegen den 400-KB-Deckel
in `check:entstehung` (83 %); ein ZH-Schritt in der Grösse von K-16 BS (#799, 117 Einträge)
hätte ihn gerissen.

Diese Messung steht VOR dem Bau (Weisung «Messen vor Handeln»). Sie beantwortet drei
Fragen: Wer lädt das Register, welche Felder braucht welcher Verbraucher, und welche
Feldgruppe kostet wie viel. Alle Zahlen sind reproduzierbar (Node, `zlib.gzipSync`
Standardstufe, gegen die committete Datei).

---

## 1 Verbraucher — wer lädt `register.json`, wann, und welche Felder

Einziger Ladepfad im Browser: `ladeMaterialManifest()` in `src/lib/materialien/browse.ts`
(`fetch('/materialien/register.json')`, als laufende Promise gecacht → **ein** Abruf je Session).

| Verbraucher | Auslöser | gelesene Felder |
|---|---|---|
| `src/pages/Materialien.tsx` (Übersicht) | Seitenaufruf `/materialien` | key, behoerde(+Name/Kuerzel), doktyp(+Label), titel, nummer, rechtsgebiet, rang |
| `src/pages/MaterialLeser.tsx` (Detail) | `/materialien/:key` | zusätzlich quelleUrl, sprache, stand, hinweis, normKeys |
| `src/lib/kontext.ts` → Kontext-Panel | Gesetzes-Leser, Rubrik «Materialien» aufgeklappt | key, titel, doktypLabel, quelleUrl, normKeys |
| `src/lib/materialien/botschaften.ts` | Kontext-Panel «Entstehungsgeschichte» | titel, **titelFr/titelIt** (nur bei locale fr/it), nummer, quelleUrl, stand, normKeys |
| `src/lib/materialien/vernehmlassungen.ts` | Kontext-Panel «Gesetzgebung in Arbeit» | **vernehmlassung.***, titel, titelFr/titelIt (fr/it) |
| `src/components/suche/useUniversalSuche.ts` + `src/lib/universalSuche.ts` | Suchfeld | titel, nummer, behoerdeKuerzel/Name, doktypLabel |
| `src/lib/zuletztTitel.ts` | «Zuletzt besucht» | key, titel |
| `src/pages/Abdeckung.tsx` | `/abdeckung` | Anzahl, behoerde |
| `src/components/layout/Reiterleiste.tsx` | nur wenn ein Material-Reiter offen ist | key, titel |
| `src/pages/gesetz-leser/artikelMaterialienLaden.ts` | Artikel-Fussleiste | key, titel, doktypLabel |

Build-Zeit-Verbraucher derselben Datei (kein Browser): `scripts/gen-startseite-zaehler.ts`
(nur `behoerde` + Anzahl), `scripts/materialien/check-materialien.ts` (Byte-Reprojektion),
`scripts/entstehung/check-entstehung.ts` (Deckel), `scripts/datenhaltung/ingest.ts` (Byte-Roundtrip).

**Negativbefund (S5), der den Entwurf trägt:** Vier Feldgruppen werden an **jeden** Browser
ausgeliefert und von **keiner** Browser-Zeile gelesen —
`sha`, `ereignisse`, `bsKanten`, `ocUris`/`projEli`/`botschaftDate`/`artAnker`.
Die Verfahrenskette der Entstehungs-Karte rendert NICHT aus dem Register, sondern aus
`public/materialien/entstehung/<KEY>.json` (`EntstehungBotschaft.ereignisse`,
`src/components/entstehung/EntstehungsBlock.tsx` → `Verfahrenskette`). Belegt durch
Identitäts-Grep über `src/**` ohne `*.generated.ts` und ohne `src/tests/**`: die einzigen
Treffer auf `.sha`/`.ereignisse`/`.bsKanten` liegen in Tests über die TS-Quellen.

## 2 Bytes je Feldgruppe (gzip, ganze Datei 1 681 Einträge)

| Feld | n | roh | gzip | Anteil |
|---|---|---|---|---|
| `sha` | 1 681 | 108,3 KB | **59,2 KB** | 18 % |
| `titel` | 1 681 | 169,3 KB | 42,1 KB | 13 % |
| `titelFr` | 1 238 | 152,5 KB | **35,9 KB** | 11 % |
| `titelIt` | 1 238 | 152,0 KB | **34,7 KB** | 10 % |
| `ereignisse` | 521 | 130,3 KB | **13,9 KB** | 4 % |
| `quelleUrl` | 1 681 | 97,5 KB | 10,2 KB | 3 % |
| `vernehmlassung` | 831 | 110,9 KB | 8,4 KB | 3 % |
| `key` | 1 681 | 28,3 KB | 5,6 KB | 2 % |
| `rang` / `normKeys` | 1 681 | 11,9/17,3 KB | 3,6/3,6 KB | je 1 % |
| `ocUris`/`projEli`/`botschaftDate`/`bsKanten` | 407/407/407/117 | 57,7 KB | 5,5 KB | 2 % |
| Rest (nummer, stand, hinweis, Labels, status, sprache, rechtsgebiet) | 1 681 | 390,5 KB | 8,5 KB | 3 % |

`sha` ist mit Abstand die teuerste Gruppe, weil 64 Hex-Zeichen je Eintrag **inkompressibel**
sind (108,3 KB roh → 59,2 KB gzip, Faktor 1,8; Titel komprimieren mit Faktor 4).

Je Herkunft (gzip): BUND 168,5 KB (831) · BR 99,5 KB (407) · BS-GR 20,2 KB (117) ·
SECO 14,2 KB (155) · ESTV 13,5 KB (144) · übrige sieben Behörden zusammen 5,0 KB (27).

## 3 Verworfene Entwürfe

**(a) Shard je Herkunft/Kanton** (`register.bund.json`, `register.bs.json`, …):
verworfen. Übersicht, Universal-Suche, Abdeckung und «Zuletzt besucht» brauchen ALLE
Herkünfte — die Fetch-Zahl je Seite wüchse mit jedem Kanton (Ziel 26), und der Kern
des Problems (inkompressible `sha`, nie gelesene Felder, FR/IT-Titel für DE-Leser)
bliebe in jedem Shard erhalten.

**(b) Kopf-Index + lazy Detail je Eintrag:** verworfen. Das Kontext-Panel zeigt bis zu
`MAX_BOTSCHAFTEN` Einträge gleichzeitig; ein Detail-Abruf je Eintrag ergäbe N Fetches
je Panel-Aufklappen statt einem — §15 verschlechtert, nicht verbessert.

**(c) Verfahrens-Ereignisse in eigene Shards je Erlass:** nicht nötig. Die Entstehungs-
Projektion `public/materialien/entstehung/<KEY>.json` trägt die Ketten bereits (75 von
185 Dateien) und ist der Kanal, aus dem die Karte rendert. Die Ketten im Register waren
**Doppelung ohne Leser** (§5) — sie wandern in den Provenienz-Kanal (Ziff. 4), statt
ein drittes Mal geschnitten zu werden.

## 4 Gewählter Entwurf — Trennung nach Nutzungszeitpunkt, nicht nach Herkunft

Ein Generator-Lauf, eine In-Memory-SSoT (`MaterialVollManifest`), drei Projektionen;
jedes Feld liegt in genau EINER Datei (§5, keine zweite Wahrheit):

| Datei | Inhalt | geladen wann |
|---|---|---|
| `public/materialien/register.json` | Kern: key, behoerde(+Name/Kuerzel), doktyp(+Label), titel, nummer, rechtsgebiet, sprache, status, quelleUrl, stand, rang, normKeys, hinweis, vernehmlassung | wie bisher, ein Abruf je Session |
| `public/materialien/register-i18n.json` | `key → {fr, it}` (Titel) | **nur** bei locale `fr`/`it` |
| `public/materialien/register-provenienz.json` | `key → {sha, ereignisse, bsKanten, ocUris, projEli, botschaftDate, artAnker}` | **nie** vom Browser; Tore, Datenhaltung, Paritätskette |

Messwerte vorher/nachher (gzip, `zlib` Standardstufe):

| | vorher | nachher | ZH-Prognose (ZH ≈ 2× BS) |
|---|---|---|---|
| `register.json` | 331,8 KB (83 % von 400 KB) | **118,3 KB** (42 % von 280 KB) | 135,9 KB = **49 %** |
| `register-i18n.json` | — | 83,7 KB (60 % von 140 KB) | 83,7 KB (Kantone tragen keine FR/IT-Titel) |
| `register-provenienz.json` | — | 92,9 KB (39 % von 240 KB) | 113,5 KB = 47 % |
| davon Verfahrens-Ereignisse | 130,3 KB roh, nur Bund gemessen | 16,0 KB gzip über 521 Ketten, **alle Herkünfte** | ~28,8 KB = 48 % von 60 KB |

Roh-Grösse `register.json`: 2 325,5 KB → 1 473,6 KB. Fetches je Seite unverändert
(DE-Leser: 1; FR/IT-Leser des Kontext-Panels: 2).

**Deckel gesenkt, nicht angehoben** (Präzedenz K3-Scharfschaltung 1.9.2026): der Kern-Deckel
geht von 400 auf 280 KB gzip — nach der ZH-Prognose bleibt er unter 50 % und fängt zugleich
eine Verdoppelung ab, die 400 KB durchgewinkt hätten.

**Blindfleck geschlossen (§17-Wurzel):** Der Deckel «Verfahrens-Ereignisse» mass bis dahin
Roh-Bytes in `src/lib/materialien/botschaften.generated.ts` — also EINE Quelldatei, nur Bund.
Die 117 BS-Ketten (52,7 KB roh, 40 % des Bestandes) waren für ihn unsichtbar, und ein
ZH-Generator mit eigener `*.generated.ts` wäre es ebenso gewesen. Er misst jetzt den
ausgelieferten Kanal über alle Herkünfte.

**§15 Logikverlust:** keiner. Kein Verbraucher verliert ein Feld; FR/IT-Titel erscheinen
unverändert, nur aus einer zweiten, kleineren Datei. Die Ketten bleiben vollständig
ausgeliefert (Provenienz-Kanal) und im Drift-Token `shaEintrag` unverändert enthalten.

## 5 Pflegebedarf

Nach jedem `npm run materialien -- --datum=…` entstehen alle drei Dateien gemeinsam;
`check:materialien` prüft alle drei byte-gleich gegen die frische Projektion,
`check:entstehung` hält die Deckel, `check:datenhaltung`/`check:paritaet` die
Byte-Roundtrips. Wer eine vierte Feldgruppe einführt, ordnet sie einer der drei
Dateien zu — nie zwei.

## 6 Status

Maschinelle Messung, reproduzierbar; keine amtliche Aussage berührt. Fachliche Abnahme
David offen (unverändert: die Materialien sind maschinell kuratiert, `nur-live-link`).
