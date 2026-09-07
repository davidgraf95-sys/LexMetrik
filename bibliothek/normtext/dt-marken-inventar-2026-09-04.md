# `<dt>`-Marken im Fedlex-Bund-Korpus — Formklassen-Inventar (4.9.2026)

**Erstellt:** 4.9.2026 — Anlass: ROADMAP `QS-KORPUS`, die zwei Adapter-Befunde des
Diskrepanz-Finders vom 4.9.2026 (PR #650) an VZV Art. 3/4 und AMBV.
**Status:** MESSUNG — einfach belegt (deterministisch am gepinnten Cache, nachrechenbar);
fachliche Abnahme durch David offen (§7/§8).

**Quelle/Stand:** gepinnter Fedlex-Filestore-Cache aus `bash scripts/fedlex-cache.sh`
(229 HTML-Dateien, Konsolidierungen und kanonische `html-N` gemäss den Pins in
`scripts/fedlex-cache.sh`), abgerufen 4.9.2026 — kein Live-Abruf.

**Anlass.** Diskrepanz-Finder-Befund vom 4.9.2026 (ROADMAP `QS-KORPUS`, PR #650):
`public/normtext/bund/VZV.json` Art. 3 Abs. 1 trug `marke: a,b,c,d,b,c,d` — die
amtlichen Führerausweis-Kategorien A, B, C, D, BE, CE, DE waren auf ihren ersten
Buchstaben gekürzt und dadurch **doppelt**. Aus «Kategorie BE» wurde «lit. b»
(§1). Diese Notiz hält fest, **welche Marken-Formen Fedlex im Bund-Korpus
tatsächlich setzt** — die Messung, auf der der Adapter-Fix aufsetzt.

## Quelle und Messverfahren

- **Quelle:** der gepinnte Fedlex-Filestore-Cache, gefüllt mit
  `bash scripts/fedlex-cache.sh` — 229 HTML-Dateien, Konsolidierungen und
  kanonische `html-N` gemäss den Pins in `scripts/fedlex-cache.sh` (Stand
  4.9.2026). Kein Live-Abruf, damit die Messung reproduzierbar bleibt (§2).
- **Verfahren:** je `<article id="art_*">` alle `<dt>`-Inhalte einlesen,
  Fussnoten-`<sup><a>` tilgen, Tags strippen, Entities dekodieren, Leerraum
  normalisieren — und das Ergebnis mit dem vergleichen, was die damalige
  Marken-Regex daraus machte. Abrufdatum: 4.9.2026.

## Befund 1 — Marken, die die alte Präfix-Regex kürzte

**163 Vorkommen in 32 Erlassen** (nur Artikel-Körper; die Anhänge hatten seit
M13 eine eigene, weitere Regex). Formklassen:

| Klasse | Beispiel `<dt>` | alt | Vorkommen (art_*) |
|---|---|---|---|
| Mehrbuchstabige Kategorie mit `:` | `BE:`, `C1E:` | `b`, `c` | VZV 18 |
| Römische Ziffer mit `)` | `ii)`, `xiii)` | `i`, `x` | 68 (PVUE, RBUE, KRK, CISG, UNO-Pakte, VRK, Staatenlose, FZA) |
| Abkürzungs-Legende ohne Trenner | `BAS`, `SPAS`, `ETAS` | `b`, `s`, `e` | ASYLV 2: 33 |
| Beschreibendes Label mit `:` | `Kolonne 1:`, `für Vollwaisen:` | `k`, `f` | VBB 10, UVG 4 |
| Aufgehobener Bereich | `e. und f.`, `b.–d.`, `5. und 6.` | `e`, `b`, `5` | ~25 (OR, KAG, GWG, MWSTG, SVG, MG, VIL, IVV, …) |
| Lat. Suffix jenseits `quinquies` | `asexies.`, `adecies.` | `a` | HMG 5, FINMA-GebV 1 |
| Getrenntes Suffix | `c.<sup>bis</sup>` | `c` | BankG 1 |
| Doppel-`&nbsp;`-Marke | `B.&nbsp;&nbsp;1.` | `b` | GFK 1 |

**Doppelpunkt = Label, Punkt/Klammer = Ordinalmarke.** Der Doppelpunkt trat in
den Artikel-Körpern in **genau drei Erlassen** auf (VZV 31, VBB 16, UVG 4 = 51
Vorkommen) — und **in keinem** davon als gewöhnliche lit.-Aufzählung. Das ist
der Trenner, an dem sich ein amtliches Label von einer Ordinalmarke
unterscheiden lässt.

**Anhang-Formen** (zusätzlich, `--nur` Anhang-Pfad): mehrteilige Ziffern
(`1.1.1`, `211a.1`, `1bis.2` — VTS Anhang 5, VZV Anhang 12, FIDLEV, SSV),
Label mit eingebettetem Text (`4.3.1&nbsp;&nbsp;Name(n) des (der) Kläger(s):`,
LugÜ Anhang V/VI) und beschreibende Legenden-Schlüssel (`Flupo:`).

## Befund 2 — Namensraum-Tags der Fedlex-Konversion

Fedlex liefert im HTML leere Marker der legi4ch-XSLT-/Word-Kette, **mitten im
Wort**: `<tmp:inl md="E" id="…"></tmp:inl>`. Im gepinnten Cache existieren
genau vier solche Element-Namen, alle inline:

| Element | Vorkommen (229 HTMLs) |
|---|---|
| `tmp:inl` | 680 |
| `w:smartTag` | 64 |
| `w:moveFromRangeStart` | 2 |
| `w:moveFromRangeEnd` | 2 |

HTML kennt keine Elemente mit Namensraum-Präfix — ein Tagname mit `:` ist hier
ausnahmslos ein Konversions-Rest und nie ein Block-/Umbruch-Element. Wer ihn
als Block behandelt (Ersatz durch ein Leerzeichen), zerreisst Wörter
(«Zwischen produkten», «Erfah rung», «GMP-Kon trollsysteme») und setzt ein
Leerzeichen vor Satzzeichen («werden ;»).

## Geltung, Pflege, Ausnahmen

- **Geltung:** Bund-Normtext über den Fedlex-HTML-Adapter
  (`scripts/normtext/extrahiere-fedlex.ts`). Kanton (LexWork/HTM/PDF) hat eigene
  Adapter und ist von beiden Befunden nicht betroffen.
- **Pflege:** Die Zahlen sind eine **Messung vom 4.9.2026 am damaligen
  Pin-Stand** und werden nicht fortgeschrieben (S6). Ein Re-Pin oder ein neuer
  Erlass kann neue Formklassen einbringen; die Regel im Adapter ist deshalb
  bewusst als Lese- und nicht als Aufzählungsregel formuliert: was keine
  kanonische Ordinalmarke ist, bleibt verbatim stehen.
- **Restrisiko / offen:** Die Lesesicht schreibt vor jede Marke `lit.` bzw.
  `Ziff.` (`litZiff` in `src/components/normtext/ArtikelBody.tsx`). Für eine
  Kategorie-Marke («BE») heisst das im Zitattext «lit. BE» statt «Kategorie BE»
  — sachlich immer noch enger als das frühere, schlicht falsche «lit. b», aber
  ungelöst. Darstellungsfrage (§3), eigener Schritt.

**Status:** einfach belegt (deterministische Messung am gepinnten Cache,
nachrechenbar); fachliche Abnahme durch David offen (§7/§8).
