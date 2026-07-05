# POC — linkedom vs. Regex-Tiefenzähler (`findeDlEnde`/`findeDdEnde`)

**Erstellt:** 2026-07-05 · **Stand:** 2026-07-05 · **Status:** Messung
abgeschlossen (0-Diff, Verdikt: Regex behalten) · **Schritt:** ROADMAP W2·5b
«L0-Extraktor-Härtung», Posten linkedom-POC · **§7-Messpflicht:** Quell-/Werkzeug-Wechsel wird per Messung
belegt, nie angenommen · **Reproduzierbar:** `npx vite-node
scripts/normtext/poc-linkedom-tiefenzaehler.ts`.

## Frage

Die Regex-Tiefenzähler `findeDlEnde`/`findeDdEnde` in `extrahiere-fedlex.ts`
balancieren `<dl>`/`<dd>`-Tags von Hand (weil Fedlex `<dl>` in `<dd>`
verschachtelt). Das galt als «buggigste Stelle, fachlich wertvollster Umbau».
Kann `linkedom` (echter HTML5-DOM-Parser, devDep) sie **verlustfrei** ablösen?

## Messung (ganzer gepinnter Bund-Korpus)

218 Erlasse · 24 602 Artikel · **9 562 `<dl>`-Grenzen** + **35 178 `<dd>`-Grenzen**.

Zwei unabhängige Vergleiche:

1. **Grenzen-Balance:** jede von `findeDlEnde`/`findeDdEnde` gelieferte Grenze ist
   tag-balanciert und korrekt mit `</dl>`/`</dd>` terminiert.
2. **DOM-Wahrheit:** je Artikel stimmt die Regex-Tag-Zählung (worauf die Zähler
   beruhen) mit der linkedom-Element-Zählung überein — keine Phantom-Tags
   (Kommentare/Script/Attribut-Strings), die den Zähler gegen das DOM verschieben.

## Ergebnis

| Vergleich | geprüft | Abweichungen |
|---|---|---|
| (1) Grenzen-Balance `<dl>`+`<dd>` | 44 740 | **0** |
| (2) Regex-Tag- vs linkedom-Element-Zählung | alle Artikel mit `<dl>` | **0** |

## Verdikt: **KEINE Migration — Regex behalten**

0 Abweichungen ⇒ die Regex-Tiefenzähler sind über den ganzen Korpus
**DOM-äquivalent**. Ein Umbau auf linkedom wäre **verhaltensneutral** (kein
fachlicher Gewinn) und brächte nur Nachteile: zusätzliche Laufzeit-/Speicherkosten
eines vollen DOM-Baus je Artikel und ein neues Fehler-/Abhängigkeits-Risiko auf dem
Extraktions-Risikopfad. Der POC BELEGT die Korrektheit des bestehenden Pfads —
genau das war sein Zweck (§7: Wechsel nur per Messung, hier misslingt der
Widerlegungsversuch → Bestand bestätigt).

`linkedom` bleibt als devDep NUR für diesen reproduzierbaren POC; die Produktion
nutzt es nicht. Sollte Fedlex je malformed HTML liefern (Phantom-Tags), bricht der
POC-Vergleich → dann neu entscheiden.
