# Nullprobe Suche-Edge-Umzug Kanton (QS-BASIS (d), K0) — 31.8.2026

**Zweck.** Kennzahlen VOR dem Umbau einfrieren, damit K1 (Recall-Parität), K2
(Ranking-Parität) und eine spätere K3-Scharfschaltung (Bund-only-Index) gegen
gemessene Werte antreten und nicht gegen Erinnerung. Reine Messung — kein Urteil,
keine Abnahme.

**Stand/Umgebung.** Branch `feat/qs-basis-suche-edge`, Basis `f283f5cb4`,
Worktree `/Users/david/Developer/lexmetrik-datenhaltung`, macOS/darwin 25.6.0,
Node v24.16.0. Alle Zahlen aus einem KALTEN Voll-Lauf (frisch gebaute Artefakte,
keine Parallel-Last). Artefakte sind gitignored und werden lokal erzeugt.

---

## 1. Statischer Suchindex `public/such-index/artikel.json`

Befehl: `npm run gen:suchindex`, danach Messung mit gzip Level 9.

```
gen:suchindex: 54446 Artikel (bund 25391 · kanton 29055)
roh   48 155 503 B = 45.92 MiB
gzip   9 884 171 B =  9.43 MiB
```

| Ebene | Einträge | roh | gzip -9 | gzip-Anteil |
|---|--:|--:|--:|--:|
| bund | 25 391 | 24.90 MiB | **5.17 MiB** | 54.8 % |
| kanton | 29 055 | 20.31 MiB | **4.26 MiB** | **45.2 %** |
| gesamt | 54 446 | 45.92 MiB | 9.43 MiB | 100 % |

**Die für K3 tragende Zahl: der Kanton-Anteil am ausgelieferten Suchindex ist
4.26 MiB gzip (45.2 %).** Das ist die Ersparnis, die eine spätere
K3-Scharfschaltung (Bund-only-Index, Kanton nur noch über die Edge) heben würde
— und zugleich die Menge an Recall, die dann NUR noch am Edge-Weg hängt. Beides
gehört in denselben Entscheid.

Feld-Anteile am Rohtext (Zeichen; zeigt, was die Recall-Felder kosten und wiegen):

| Feld | Zeichen | Anteil | Rolle |
|---|--:|--:|---|
| `t` Text | 29 756 820 | 70.0 % | Volltext |
| `f` Fussnoten | 3 683 061 | 8.7 % | Recall-only |
| `g` Gliederung | 3 415 225 | 8.0 % | Recall + topischer Boost |
| `ku` Kürzel | 2 363 841 | 5.6 % | Anzeige |
| `m` Marginalie primär | 1 252 779 | 2.9 % | Recall + topischer Boost |
| `tb` Tabellen-Tier | 697 371 | 1.6 % | Recall-only |
| `k` Routen-Key | 388 642 | 0.9 % | Routing |
| `l` Label | 345 197 | 0.8 % | Anzeige |
| `eb` Ebene | 275 894 | 0.6 % | Routing |
| `n` Marginalie nachrangig | 140 110 | 0.3 % | Recall + schwacher Boost |
| `a` Artikel | 132 046 | 0.3 % | Anzeige |
| `kt` Kanton | 58 110 | 0.1 % | Anzeige |

Die fünf Recall-Felder `m/n/g/tb/f` zusammen = **21.5 %** des Rohtextes. Genau
diese Felder fehlen dem Edge-Index (Lücke K1, Ziff. 3).

---

## 2. DB-Artefakte `npm run datenhaltung:build`

```
daten/normtext.db       Bund-Normtext 227 · Kanton-Normtext 1231 · Normtext-Manifeste 2
                        · Normtext-Seitendateien 4 · Normtext-Struktur 1420
                        · Normtext-Revisionen 227 · Ziel-Erlasse (Bund) 227
                        · Ziel-Artikel (Bund) 25 404 · Ziel-Erlasse (Kanton) 1231
                        · Ziel-Artikel (Kanton) 30 709 · fts_artikel 56 113   [189.79 MiB]
daten/rechtsprechung.db Rechtsprechung 5093 · fts_entscheide_schaufenster 5093 [475.67 MiB]
daten/soft-law.db       Materialien 1 · Soft-Law-Zustand 1 · Materialien-Kanten 11 [2.95 MiB]
HOT-Replika (FTS-tragend) = 665.46 MiB / Budget 1024 MiB → OK (65.0 %)
```

Kanton ist damit **vollständig** in der DB und **vollständig** in `fts_artikel`
(56 113 = 25 404 + 30 709). Der Edge-Umzug scheitert also NICHT an fehlenden
Daten, sondern an fehlenden Feldern (Ziff. 3) und fehlendem Ranking (Ziff. 4).

**Zahlen-Divergenz statischer Index ↔ DB (bewusst festgehalten, nicht geglättet):**
54 446 Index-Einträge gegen 56 113 DB-Artikel = **1667 Differenz**. Der statische
Index lässt Artikel ohne durchsuchbaren Text aus (`ohneText`, Stubs/PDF/Live-Link),
die DB nimmt sie auf. Die Differenz ist erwartet, aber bis heute nirgends beziffert
— wer Recall-Parität misst, muss sie kennen, sonst erklärt er 1667 Artikel zum
Regressions-Fund.

---

## 3. Recall-Lücke am Edge (der zu schliessende Defekt)

`fts_artikel` indexiert AUSSCHLIESSLICH `bloeckeText(bloecke_json)`
(`scripts/datenhaltung/fts.ts:60-71`) — also nur das, was der statische Index als
Feld `t` führt. Die fünf Recall-Felder `m/n/g/tb/f` (21.5 % des Rohtextes,
Ziff. 1) haben am Edge **kein Gegenstück**.

**Gemessener Leitfall «Miete»** (der Fall, den `scripts/such-index-generieren.ts:112-121`
als Begründung für das Gliederungs-Feld nennt):

```
DB-Weg: SELECT … FROM fts_artikel … MATCH '"Miete"'  →  79 Treffer
Top-10: ZPO art_33 · AG-725.100 art_28 · AG-295.250 art_8 · BS-RiE 164.100 art_25
        · BS-153.810 art_3 · OR art_266_f · AR-145.12 art_3_a · AR-145.31 art_5
        · BS-890.500 art_1 · ZH-243 art_2.5.2

Gezielte Gegenprobe (Treffer via Volltext, DB-Weg):
  OR art_253   → 0     (Grundnorm «Begriff und Geltungsbereich» der Miete)
  OR art_267   → 0     («Rückgabe der Sache»)
  OR art_266_c → 1
  OR art_257_e → 1
```

Im statischen Index tragen OR 253 und OR 267 die Gliederung
`Zweite Abteilung: Die einzelnen Vertragsverhältnisse · Achter Titel: Die Miete · …`
und werden darüber gefunden. **Am Edge sind sie für «Miete» unauffindbar, während
zehn kantonale Gebühren- und Besoldungserlasse die Trefferliste anführen.** Das ist
die Lücke, die K1 schliesst, und der Rot-Beweis-Fall des K1-Tors.

**Datenlage für den Fix (geprüft):** Der Struktur-Sidecar liegt bereits vollständig
in der DB — 1420 `dokument`-Zeilen mit `typ='normtext-struktur'`, Pfad
`public/normtext/struktur/<ebene>/<erlass_key>.json`, je Artikel
`marginalie[] · gliederung[] · fussnoten[]`. Zuordnungs-Abdeckung über
`erlass_key` + `artikel`:

```
Artikel gesamt       56 113
Struktur-Datei da    53 850   fehlt 2263 (38 Erlasse, alle kantonal, ohne Sidecar)
Struktur-Eintrag da  53 849   fehlt 1
                     = 95.97 % Abdeckung
```

Die fehlenden 38 Erlasse verhalten sich am Edge dann exakt wie im statischen Index
(dort `catch { /* keine Struktur → m='' */ }`, `such-index-generieren.ts:212`) —
leere Felder, kein Fehler.

---

## 4. Suchgüte-Baseline `npm run eval:suche`

Advisory, kein Tor. Laufzeit 7.754 s, deterministisch, LLM-frei.
Fenster: Artikel-Limit 50, Kappung 50 je Gruppe.

| Klasse | n | Recall@1 | Recall@5 | Recall@10 | MRR | NDCG@10 |
| --- | --: | --: | --: | --: | --: | --: |
| normzitat | 18 | 0.944 | 0.944 | 0.944 | 0.944 | 0.944 |
| umgangssprache | 17 | 0.176 | 0.235 | 0.294 | 0.210 | 0.227 |
| bge | 18 | 0.833 | 0.833 | 0.833 | 0.833 | 0.833 |
| stichwort | 16 | 0.500 | 0.750 | 0.813 | 0.588 | 0.639 |
| **gesamt** | **69** | **0.623** | **0.696** | **0.725** | **0.652** | **0.668** |

Das ist die Güte des **statischen** Weges (FlexSearch + `artikelRanking`). Sie ist
der Massstab, den der Edge-Weg erreichen muss, bevor er den statischen Index
ablösen darf — nicht bm25 gegen sich selbst.

**Beobachtung, die den Massstab relativiert (§8):** Die Eval-Kopfzeile meldet
«Korpus: 54446 Bund-Artikel», enthält aber 29 055 kantonale. Die Zahl stimmt, das
Etikett nicht. Notiert als Doku-Defekt in `scripts/suche-eval.ts`; nicht in diesem
Schritt geändert (fremde Datei, eigener Commit).

---

## 5. Was diese Nullprobe NICHT misst

- **Keine Turso-Messung.** Die Env fehlt lokal; gegen die echte Instanz wurde
  bewusst nichts gefahren. Alle Edge-Zahlen stammen aus `daten/normtext.db` über
  denselben SQL-Kern (`suche-kern.ts`), nicht aus der Replika.
- **Keine Latenz-Zahlen.** Kalt/warm-Bedingung wäre hier nicht aussagekräftig
  (lokale Datei gegen HTTP-Replika).
- **Keine Aussage über die Heiss/Kalt-Grenze** (Fahrplan §12.2) — die bleibt
  David-Gate und ist von diesem Schritt unberührt.

---

**Reproduktion (in dieser Reihenfolge):**

```bash
npm run gen:suchindex        # statischer Index + Ebenen-Zählung
npm run datenhaltung:build   # daten/*.db inkl. fts_artikel + Budget-Zeile
npm run eval:suche           # Suchgüte-Baseline
```

**Status: entwurf** (Messung, keine fachliche Abnahme nötig — §7 unberührt, es
werden keine Norm-Werte behauptet).
