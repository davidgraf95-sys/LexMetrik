# R7 «Beschriftungen» — Bau-Protokoll (W2·24-DESIGN-IDENTITAET, Session E6)

Grundlage: `abnahme/design-identitaet/uebergabe/session-e6/r7-befunde.md`
(Finder, read-only, Befunde F1–F5, Wortliste C, Wächter D). Bau-Session
6./7.9.2026, Branch `feat/w2-24-r7`, Basis `b741790f2`. Kein Preview nötig
(reine Wortlaut-/Attribut-Runde) — alle vier Tore laufen textuell/vitest.

## Umsetzungstabelle (vorher → nachher)

| # | Datei:Zeile | vorher | nachher |
|---|---|---|---|
| F1 | `src/components/rechtsprechung/EntscheidFilter.tsx:295` | `Urteil ab` | `Entscheid ab` |
| F1 | `src/components/rechtsprechung/EntscheidFilter.tsx:300` | `Urteil bis` | `Entscheid bis` |
| F1 | `src/components/rechtsprechung/EntscheidKopfTeile.tsx:140` | `Urteil vom ` | `Entscheid vom ` |
| F1 (Doku) | `src/components/rechtsprechung/EntscheidKopfTeile.tsx:35,124` | Kommentare zitierten den alten Wortlaut `«Urteil vom …»` | auf `«Entscheid vom …»` nachgeführt (reine Doku, keine Logik) |
| F2 | `src/components/normtext/ArtikelBody.zitier.tsx:36` | nur `title={`${zitat} — kopieren`}` | zusätzlich `aria-label={`${zitat} — kopieren`}` (Fehlerbuch-18: Scope nicht mehr nur im `title`) |
| F3 | `src/lib/verlaufLabel.ts` (Funktion `verlaufLabel`, ~Z. 94–118) | unbedingter Fallback `'Entscheid öffnen'` / `'Gesetz öffnen'` / `'Material öffnen'` — ununterscheidbar ob «lädt noch» oder «nachweislich nicht gefunden» | EINHEITLICH für alle drei Manifest-Zweige: Manifest noch nicht geladen → weiterhin der Lade-Platzhalter «X öffnen»; Manifest geladen, Schlüssel fehlt → «X nicht gefunden» (Gesetz/Entscheid/Material gleiche Bauform) |
| Zusatz (Auftrag, ausserhalb Wortliste C) | `src/components/normtext/ErlassKarte.tsx:51` | `Aufgehoben` (Grossschreibung) | `aufgehoben` (klein — Status-Etikett, vereinheitlicht mit Zeile 203 in derselben Datei, die bereits klein war; Wortliste (C) nennt diesen Fall nicht, Casing-Regel «sonst: klein, weil Status-Etikett» aus dem Auftrag angewandt) |

F4/F5 (kosmetisch, Methodik-Hinweis) verlangten laut Befund **keine** Code-Änderung — nur zur Kenntnis genommen, keine Zeile berührt.

## Wächter (neu, mit geführtem Rot-Beweis)

1. `src/tests/leser-benennung.test.ts` — neuer Abschnitt **„R7 F1: Kanon «Entscheid», nicht «Urteil» …"**: Quelltext-Sonde gegen `EntscheidFilter.tsx`/`EntscheidKopfTeile.tsx` verbietet `>Urteil ab<`, `>Urteil bis<`, `>Urteil vom `, mit Allowlist-Begründung im Kommentar (Rechtsbegriff-Verwendungen ausserhalb dieser zwei Stellen bleiben unberührt: Formular-Labels der Rechner/Vorlagen, «vollständiges Urteil» ↔ «amtlicher BGE-Auszug» im EntscheidLeser — TABU-Fläche, siehe unten). Rot-Beweis geführt: `Urteil ab`/`Urteil bis` temporär zurückgesetzt → 3 Tests rot, Fehlermeldung nennt exakt die betroffene Datei.
2. `src/tests/leser-benennung.test.ts` — neuer Abschnitt **„R7 F2: ZitierMarke trägt den Kopier-Scope auch im aria-label (Fehlerbuch-18)"**: prüft `title` UND `aria-label` mit identischem Scope-Text. Rot-Beweis geführt: `aria-label` temporär entfernt → 1 Test rot.
3. `src/tests/verlaufLabel.test.ts` (neu) — Verhaltens-Test (kein Quelltext-Scan, da `verlaufLabel()` eine reine Funktion ist): je Manifest-Zweig (Gesetz/Entscheid/Material) «Manifest fehlt → Lade-Platzhalter» vs. «Manifest geladen, Schlüssel fehlt → nicht gefunden» plus Positiv-Sonde (gefundener Entscheid liefert weiterhin die Zitierung). Rot-Beweis geführt: die Entscheid-Fallunterscheidung temporär auf den alten unbedingten Fallback zurückgesetzt → 1 Test rot mit `Received: "Entscheid öffnen"` statt `"Entscheid nicht gefunden"`.

Alle drei Rot-Beweise wurden geführt, dokumentiert und danach der jeweilige Fix wiederhergestellt (§6.7 — ein Tor, das nicht scheitern kann, ist gefährlicher als keines).

## Tor-Ergebnisse

- `npm run test` (vitest run, gesamtes Repo): **455 Testdateien grün, 7'424 Tests grün, 2 skipped**, Exit 0.
- `npx tsc -b`: **grün**, keine Ausgabe, Exit 0.
- `npm run lint` (eslint .): **0 Fehler**, 1 Vorbestand-Warnung in `src/components/suche/useUniversalSuche.ts` (react-hooks/exhaustive-deps) — unverändert, nicht von R7 berührt.
- `npm run check:ui-normzitate`: **GRÜN** — 425 UI-Dateien, 759 Zitate geprüft, 14 nicht prüfbar (Basislinie unverändert), kein neues nicht auflösbares UI-Zitat.
- `npm run golden:vergleich`: **IDENTISCH** — 256 Fälle byte-gleich (verhaltensneutral).

## Offen / bewusst nicht angefasst

- **TABU-Flächen mit «Urteil»-Vorkommen** (nur zur Kenntnis, keine Zeile berührt — ausserhalb Wortliste (C) und ausserhalb Whitelist):
  - `src/pages/EntscheidLeser.tsx` (mehrfach, u. a. Z. 264, 315, 335, 532, 544f, 686, 773, 792, 798–800, 853, 885, 902, 916) — «Vollständiges Urteil» ↔ «Amtlicher BGE-Auszug» ist eine bewusst andere Unterscheidung (Volltext-Urteil vs. kuratierter Sammlungsauszug), kein Synonym für «Entscheid»; TABU laut Auftrag (R9-2 parallel).
  - `src/components/rechtsprechung/EntscheidKarte.tsx:51,88` und `EntscheidZeile.tsx:27` — dieselbe «Vollständiges Urteil»-Unterscheidung, nicht im Befund genannt, nicht in der Whitelist.
  - `src/pages/Rechtsprechung.tsx:471`, `src/pages/VorlageRubrum.tsx:32` — «Urteil» als echter Rechtsbegriff (Rubrum-Typ bzw. interner Kommentar), nicht im Befund genannt.
- **`src/pages/gesetz-leser/parts/ArtikelHistorie.tsx:33`**: trägt `'Aufgehoben'` (Grossschreibung) als Eintrag einer Ereignistyp-Liste (`Eingefügt`/`Neufassung`/`Aufgehoben`/…) — geprüft, aber TABU (`gesetz-leser/**`) und sachlich ein anderes Muster als der Erlass-Status-Badge in `ErlassKarte.tsx` (konsistente Titel-Case-Liste in sich, kein Casing-Widerspruch mit sich selbst). Nicht angefasst, nur protokolliert.
- Alle übrigen `Urteil`-Fundstellen im Repo (Formular-Labels SchKG/Verjährung/Kündigung, `lib/verjaehrung.ts`, `lib/strafRechtsmittel.ts`, `lib/gerichtszitat.ts`, `data/tarif/**` usw.) sind materielle Rechtsbegriffe, nicht Begriffskanon-UI — laut Auftrag ausdrücklich nicht anzufassen, laut Wortliste (C) nicht genannt.
