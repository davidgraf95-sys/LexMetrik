# E5 · Quelllücken der amtlichen Konsolidierung (Messung 12.9.2026)

**Anlass:** Gegenprüfungs-Befund A6 zu PR #798 — 22 Alt-Blöcke von CHEMRRV standen als
«entfallen» + «neu eingefügt» im Shard, obwohl kein Artikel aufgehoben war.
**Bauschritt:** `W2·6c-ENTSTEHUNG-QUELLLUECKE`.

## Quelle mit Stand

Fedlex-Filestore, AKN-XML, DE, **abgerufen 12.9.2026** (die Bytes der vier ausgewerteten
Manifestationen stimmen mit dem Quell-Register überein):

| Stand | Manifestation | Bytes | sha256 (Kopf) | `<article eId>` |
|---|---|---|---|---|
| 2022-04-01 | `…/eli/cc/2005/478/20220401/de/xml/…-de-xml-1.xml` | 700 027 | `87287a4255664eea…` | 25 |
| 2022-05-01 | `…/20220501/de/xml/…-de-xml-1.xml` | 708 599 | `4f4663acf2eeaf05…` | **3** |
| 2022-10-01 | `…/20221001/de/xml/…-de-xml-2.xml` | 717 322 | `7f8d90d00bebc3a3…` | **3** |
| 2022-10-06 | `…/20221006/de/xml/…-de-xml-4.xml` | 711 735 | `7b4d49a2a2485317…` | 27 |

Live-Link je Stand: `https://www.fedlex.admin.ch/eli/cc/2005/478/<JJJJMMTT>/de`.

## Befund

In den Ständen 2022-05-01 und 2022-10-01 trägt die Datei nur `art_1`–`art_3` als
`<article>`. Die Artikel 3a–24 stehen in DERSELBEN Datei unter einem
`<preface><container name="headerOfAnnex">` («1a. Abschnitt: Besondere Kennzeichnungen»,
eingefügt durch Anhang Ziff. 2 der V vom 11.3.2022, AS 2022 220) als 24 ×
`<mod eId="annex_1_a/mod_uN"><ref fedlex:role="modification-reference">…</ref><quotedStructure>`.
Es ist eine **Konversions-Panne der Quelle**, keine Rechtsänderung.

**Stichprobe n = 22 (Vollerhebung der betroffenen eIds), 22/22 = 100 %:** jede eId, die
am 2022-05-01 aus dem Artikelbaum fällt, kehrt am 2022-10-06 zurück und ist in der
Vergleichsform des Profils `entstehung-norm/4` Zeichen für Zeichen dieselbe; alle 22
stehen in BEIDEN Lücken-Ständen im Änderungsanhang. Belege (Beispiele): Art. 9
«Örtlicher Geltungsbereich — Fachbewilligungen sind für die ganze Schweiz gültig.»
(sha `4f087d1405c0…`), Art. 4a «Bewilligungsfreie Anwendungen — … Ausbringen von
Organismen mit einem unbemannten Luftfahrzeug.» (sha `ae2700d448c4…`).

## Regel (deterministisch)

`findeQuellLuecken()` in `scripts/entstehung/synopse.ts`: eine eId steht im Stand davor,
fehlt in einem **lückenlosen Lauf von 1 … 3 Ständen** und kehrt **byte-gleich** zurück
⇒ `zustand: 'quelle_unvollstaendig'` statt «entfallen» + «neu eingefügt»; der Wortlaut
wird NICHT gespeichert (über die Lücke hinweg ist er derselbe). Der Änderungsanhang ist
positiver Beleg (`imAnhang`), aber keine Bedingung. Nachgerechnet wird die Kernbedingung
im Artefakt selbst durch `check:entstehung` (Prüfsummen-Vergleich mit dem ersten
Alt-Block nach der Rückkehr).

## Geltung und Ausnahmen

Korpusweite Messung über alle 186 Shards und 1131 Stände (12.9.2026): **23** eIds
verschwinden und kehren zurück.

* 22 × CHEMRRV, Lückenlänge 2 Stände → umgebucht.
* 1 × EPV `art_64_a_64_b`, Lückenlänge **17 Stände** (2021-02-01 … 2023-09-01, zurück am
  2024-01-01, wortgleich) → **nicht** umgebucht: der Deckel von 3 Ständen greift. Der
  Fall ist ohnehin folgenlos, weil die eId («Art. 64a und 64b» als EIN Konversions-Knoten)
  keinen Wortlaut trägt und darum nie einen Alt-Block erzeugt hat. Je länger eine Lücke,
  desto eher ist sie eine echte Aufhebung mit späterem, wortgleichem Wiedererlass — und
  die als Lücke zu buchen wäre die schwerere Falschaussage (§1).

Der Wortlaut aus dem `<quotedStructure>` wird bewusst NICHT herangezogen: seine Blöcke
tragen `annex_1_a/mod_uN/…`, nie `art_N` — ein eId-Match ist unmöglich, und ein
Label-Join wäre eine zweite, anders provenierte Kopie derselben Wörter (§5).

## Pflegebedarf

Der Deckel (3 Stände) und die Zahl der Lücken stehen in der Schluss-Zeile von
`check:entstehung`; eine neue Konversions-Panne bei Fedlex zeigt sich dort als
wachsende Zahl. Fällt sie auf 0, ist entweder die Quelle repariert (dann hat Fedlex den
Stand neu erzeugt und der Determinismus-Wächter meldet es) oder die Erkennung defekt.

## Abnahme-Status

Maschinell belegt (Tor + Unit-Tests + e2e-Sonde (f)); fachliche Abnahme David offen.
