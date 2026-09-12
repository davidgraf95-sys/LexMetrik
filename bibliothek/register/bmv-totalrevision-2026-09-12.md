# BMV SR 412.103.1 — Totalrevision im Korpus (12.9.2026)

**Gegenstand.** Die Berufsmaturitätsverordnung ist per 1.3.2026 total revidiert
worden. Der SR-Slot 412.103.1 trägt seither einen NEUEN Erlass; der alte ist
aufgehoben. Bis zu diesem Schritt lag nur der historische Text im Korpus — wer
«BMV» suchte, fand ausschliesslich aufgehobenes Recht (§8).

## Quelle mit Stand (§7, amtlich, live erhoben 12.9.2026)

| Feld | Wert | Beleg |
|---|---|---|
| ELI (Abstract) | `cc/2025/408` | Fedlex-SPARQL, `jolux:ConsolidationAbstract` |
| Konsolidierungen | genau eine: **2026-03-01** | `?c jolux:isMemberOf <…/cc/2025/408> ; jolux:dateApplicability ?date` |
| `dateNoLongerInForce` | keines (geltend) | dieselbe Abfrage, `OPTIONAL` leer |
| `dateEntryInForce` | 2026-03-01 | Abstract-Property |
| `dateDocument` | 2025-06-13 | Abstract-Property |
| SR-Nummer | **412.103.1** | Taxonomie `legal-taxonomy/6599`, `skos:notation`, Status `CURRENT` |
| Titel (de) | Verordnung vom 13. Juni 2025 über die eidgenössische Berufsmaturität (Berufsmaturitätsverordnung, BMV) | `skos:prefLabel` derselben Taxonomie-Entry |
| Kanonische html-Manifestation | `…/eli/cc/2025/408/20260301/de/html/fedlex-data-admin-ch-eli-cc-2025-408-20260301-de-html.html` (**html-N = 0**, echt suffixlos) | `isRealizedBy(DEU) → isEmbodiedBy(html) → isExemplifiedBy`, aufgelöst mit `scripts/fedlex-manifest.ts` |
| Artikel | 36 (`art_1` … `art_36`), keine Anhänge, keine Gliederungsebenen | Anker-Inventar der Manifestation |
| Selbst-Beleg der Ablösung | Art. 34 «Die Berufsmaturitätsverordnung vom 24. Juni 2009 wird aufgehoben.» · Art. 36 «Diese Verordnung tritt am 1. März 2026 in Kraft.» | amtlicher Volltext |

Amtliche Live-Fassung: <https://www.fedlex.admin.ch/eli/cc/2025/408/de>.
Massgeblich ist immer diese, nie unser Artefakt (§5/§7).

## Regel (deterministisch): zwei Erlasse in einem SR-Slot

**Entscheid — neuer Register-Key neben dem historischen, nicht Re-Pin.** Der
geltende Text liegt unter `BMV_2025` (Pin `bmv_2025`), der historische bleibt
unter `BMV` (Pin `bmv`). Begründung:

1. Ein Re-Pin der `bmv`-Zeile hätte den historischen Text ersatzlos aus dem
   Korpus entfernt. Altes Recht bleibt auf Sachverhalte seiner Geltungszeit
   anwendbar; ausserdem hängen die ausdrückliche Aufhebungs-Deklaration
   (`ANERKANNTE_AUFHEBUNGEN`, `src/lib/normtext/aufhebungen.ts`), der
   Nachfolge-Vermerk im Register und die Wiedervorlage-Mechanik an der ELI
   `cc/2009/423` — sie hätten ins Leere gezeigt.
2. Der Schlüssel trägt das **Erlassdatum** (2025), nicht das Inkrafttretens-Jahr:
   er identifiziert den Erlass, nicht seine Fassung, und bleibt darum über
   künftige Konsolidierungen stabil. Das entspricht der ELI `cc/2025/408`.
   (Die Bau-Spec `FAHRPLAN-FEDLEX-PORTFOLIO.md` §20.4 verlangt «neuer
   Register-Key neben dem historischen `bmv`» und lässt die Benennung offen;
   der Fund-Text nannte `BMV_2026` als Beispiel — abweichend umgesetzt und
   hier offengelegt, §7.)
3. §8 in der Oberfläche: die aufgehobene Fassung trägt im Register den roten
   Marker «aufgehoben» (`ErlassKarte`) und im Leser das Aufhebungs-Banner mit
   Nachfolge-Link; ihr Rang wandert ans Ende der Rubrik (102 → 126), die
   geltende Fassung steht auf Rang 102 neben der BBV. Beide sind auffindbar,
   nur eine sieht nach geltendem Recht aus.

**Folgeregel für jede weitere Totalrevision mit SR-Erhalt:** die SR-Nummer ist
**kein eindeutiger Schlüssel** — jede Mechanik, die Erlasse über die SR
adressiert, muss auf den Register-key (== Pin-Name in Grossbuchstaben)
umgestellt oder auf Mehrdeutigkeit geprüft werden. Belegter Fall in genau
diesem Schritt: `scripts/normtext/revisionen-generieren-run.ts`,
`lesePinsMitSr()` — reine SR-Map, letzter Pin gewinnt. Gemessener Rot-Beweis
12.9.2026: `SR 412.103.1 → cc/2025/408 / 2026-03-01` statt
`cc/2009/423 / 2016-08-23`; der historische Erlass hätte bei der nächsten
Vollregeneration still ELI und Korpus-Stand seiner Nachfolgerin bekommen
(Pfad-(a)-Stände 6 → 1, Sammelerlass-Marker 2013-01-01 verschwunden, jedes
`nichtKonsolidiert` falsch gerechnet). Behoben: Lookup nach Register-key mit
SR als Rückfall; zusätzlich SR-Dedupe vor der SPARQL-Abfrage (ohne sie stand
die SR doppelt im VALUES-Block und `store-raw` wuchs von 31 auf 62 Bindings).
Gegenprobe nach dem Fix: `revisionen-raw/BMV.json` byte-identisch zum Bestand.

## Geltung / Ausnahmen

- Die Revisions-Timeline ist bewusst **SR-weit** (Fedlex-Taxonomie): beide
  Erlasse teilen sie sich, jeder mit eigenem Korpus-Stand. Das ist kein
  Duplikat, sondern die Geschichte des SR-Slots.
- Die FEDLEX-Tabelle (`src/lib/fedlex/tabelle.ts`) führt `BMV` weiterhin auf
  `cc/2009/423` und neu `BMV-2025` auf `cc/2025/408`. **Offener Restpunkt:**
  ein blosses Zitat «Art. 5 BMV» im Fliesstext löst über die Token-Erkennung
  auf den Schlüssel `BMV` — also auf die aufgehobene Fassung. Gemessen
  12.9.2026: im ganzen Korpus **null** echte Zitate der
  Berufsmaturitätsverordnung, der Restpunkt ist heute wirkungslos. (Einziger
  «BMV»-Treffer ist `kanton/SG-3849`, wo «BMV» die *Eidgenössische
  Schutzbautenverordnung vom 27.11.1978* meint — ein falscher Freund, der
  schon vor diesem Schritt auf die Berufsmaturitätsverordnung verlinkte.
  Eigener Befund, nicht hier gefixt.)

## Pflegebedarf

- `check:fedlex-versionen` überwacht `bmv_2025` als regulären Pin
  (Lauf 12.9.2026: «gepinnt 2026-03-01 = neueste Konsolidierung»); `bmv` bleibt
  als anerkannt-aufgehoben geführt.
- Kommt eine Konsolidierung der geltenden Fassung, wird **nur** das
  `YYYYMMDD`-Feld der `bmv_2025`-Zeile gebumpt (Update-Pfad, Skill
  `korpus-werkstatt`).

## Norm-Key-Auflösung: Fassungs-Reihe statt Kollision (Nachzug 12.9.2026)

**Befund (CI rot, Lauf zu PR #823).** Der zweite Register-Eintrag auf SR
412.103.1 liess `src/tests/entscheide-normkeys.test.ts` in zwei Fällen fallen:
`ABK_KOLLISIONEN = ['BMV']` (dasselbe Kürzel auf zwei keys) und drei
Alias-Notizen (`BMV` de, `OMPr` fr/it — «SR im ERLASS_REGISTER mehrdeutig»).
Die Kollisionsregel hätte das Kürzel beidseitig verworfen: ein Entscheid zur
Berufsmaturität bekäme **gar keinen** Norm-Key, in keiner Amtssprache.

**Regel (deterministisch, §2).** Ein Entscheid, der «BMV» zitiert, meint die im
Entscheidzeitpunkt geltende Fassung — vor dem 1.3.2026 die Verordnung von 2009
(`BMV`), ab dem 1.3.2026 die von 2025 (`BMV_2025`). Umgesetzt als
*Fassungs-Reihe* in `scripts/normtext/entscheide-mapping.ts`
(`fassungsReihen`, `normKeyFuerAbk(abk, datum)`): eine Reihe entsteht nur, wenn
mehrere Bund-Einträge dieselbe SR-Nummer teilen, **genau einer** nicht
aufgehoben ist und **jeder** aufgehobene sein amtliches Aufhebungsdatum plus
einen über `erlassKeyVonEli` auflösbaren Nachfolger **derselben** Reihe nennt.
Quelle bleibt `src/lib/normtext/aufhebungen.ts` (§5) — keine neue Tabelle.

**Geltung/Ausnahmen.** Jede andere Mehrfachbelegung eines Kürzels bleibt
Kollision und wird beidseitig verworfen. Rot-Beweis 12.9.2026: ein dritter
Register-Eintrag mit Kürzel «BMV» ausserhalb der Reihe → `ABK_KOLLISIONEN =
['BMV']`, Tor rot (Sabotage-Eintrag danach zurückgenommen). Datumsunbekannte
Snapshots fallen auf den deterministischen Platzhalter `<GN-Jahr>-01-01`
zurück — Epoche trifft, Tagesgrenze innerhalb des Aufhebungsjahres ist eine
benannte Restunschärfe (§8, im Quellkommentar festgehalten).

**Betroffene Entscheide: null.** Im committeten Rechtsprechungs-Korpus (5'093
Snapshots) kommt kein «BMV»- oder «OMPr»-Zitat vor (`grep -rl` über
`public/rechtsprechung`: 0 Treffer, 12.9.2026) — weder vor noch nach dem
1.3.2026. Der Fix ist damit heute vollständig vorsorglich; `golden:vergleich`
256/256 byte-gleich, `check:normkeys` unverändert 93.6 % gemappt.

**Pflegebedarf.** Nächste Totalrevision: eine Zeile in `aufhebungen.ts` — die
Norm-Key-Auflösung zieht ohne weiteren Handgriff nach. Die exakte Liste der
Reihen steht im Unit-Test (`ERLASS_FASSUNGS_REIHEN`) und in der Ausgabe von
`check:normkeys`.

## Abnahme-Status

**entwurf** — maschinell gegen die amtliche Quelle verifiziert (deterministischer
Volltext-Diff über alle 36 Artikel: null Abweichung; Stichprobe n=10 mit
Identitätsprüfung gegen die amtliche HTML-Manifestation: 10/10). Fachliche
Abnahme durch David steht aus (§7/§8); `verified:true` wird nicht automatisch
gesetzt.
