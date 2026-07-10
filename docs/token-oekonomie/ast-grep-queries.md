# ast-grep als Navigations-Standard — Muster-Query-Satz (QS-TOK P4 · T9)

> **Heimat:** Detailquelle zu `FAHRPLAN-TOKEN-OEKONOMIE.md` §6 (T9), referenziert aus
> `docs/token-oekonomie/dispatch-template.md` §1 (Navigation).
>
> **Zweck (Token-Ökonomie):** Struktur-Suche über **AST-Muster** statt Breit-Grep + Voll-Reads
> spart ~5–15k Tok je navigations-lastiger Session (die 10–30k-Oberkante ignorierter Folge-Reads
> entfällt: ast-grep liefert Datei **und** Zeile direkt, ohne die Datei ganz zu lesen). CLI statt
> MCP → **0 Fixkosten** im Kontextfenster. **Beweis-Reads bleiben unangetastet** — ast-grep ist
> Navigation, kein Ersatz für die echte Datei auf Risikopfaden.

## Aufruf (kein globaler Install nötig)

ast-grep läuft ohne Repo-Abhängigkeit über `npx` (erste Ausführung lädt + cacht den Binär):

```
npx --package @ast-grep/cli ast-grep run --lang ts  --pattern '<MUSTER>' <pfad>
npx --package @ast-grep/cli ast-grep run --lang tsx --pattern '<MUSTER>' <pfad>
```

Wer den Binär dauerhaft will: `brew install ast-grep` bzw. `npm i -g @ast-grep/cli`
(dann `ast-grep …` / `sg …`). **`.tsx`-Dateien brauchen `--lang tsx`, `.ts`-Dateien `--lang ts`** —
sonst matcht das Muster stumm nichts (verifiziert 10.7.2026: TSX-Muster auf `.ts` → 0 Treffer).

### Allow-Permission (einmalige David-Freigabe — noch offen)

Die T9-DoD verlangt eine `allow`-Permission. Sie ist eine Config-Änderung an
`.claude/settings.json` und darf **nur David selbst** eintragen (Self-Modification-Schutz).
Vorgeschlagene Einträge für die `permissions.allow`-Liste:

```jsonc
"Bash(npx --package @ast-grep/cli ast-grep *)",
"Bash(ast-grep *)",
"Bash(sg run *)",
"Bash(npm run map)",
"Bash(npm run map *)",
"Bash(npm run ci:log)",
"Bash(npm run ci:log *)",
"Bash(npm run test:kurz)",
"Bash(npm run test:e2e:kurz)"
```

## Muster-Query-Satz (verifiziert 10.7.2026 gegen diesen Baum)

Jedes Muster unten wurde real gefahren; die Trefferzahl ist der Beleg, dass das
Muster auf der aktuellen Codebasis greift.

| Ziel | Befehl | Beleg |
|---|---|---|
| **Exportiertes Symbol finden** («wo lebt `X`?») | `ast-grep run --lang ts --pattern 'export const $N = $$$' src/lib/` | 102 Treffer über `src/lib/` |
| **Named-Export-Funktion** | `ast-grep run --lang ts --pattern 'export function $N($$$) { $$$ }' <datei>` | Funktions-Signaturen, Zeile exakt |
| **Hook-Nutzung lokalisieren** | `ast-grep run --lang tsx --pattern 'useMemo($$$)' src/` | 140 Treffer (Memoisierungs-Audit §15/4) |
| **Aufrufer einer Funktion** | `ast-grep run --lang ts --pattern 'bestimmeZustaendigkeit($$$)' src/` | Call-Sites statt Text-Grep |
| **React-Komponente auffinden** | `ast-grep run --lang tsx --pattern 'export function $N($$$): JSX.Element { $$$ }' src/components/` | Komponenten-Deklarationen |
| **Verbotene Magic-Number-Klassen** (§13/D2) | `ast-grep run --lang tsx --pattern 'className=$V' src/` + Filter | Design-Token-Audit-Einstieg |

**Regeln:**

1. **Struktur → ast-grep, freier Text → Grep.** Für syntaktische Formen (Deklaration,
   Aufruf, Hook, JSX-Element) ist das AST-Muster präzise und liefert die Zeile mit; für reinen
   Text/Kommentar/Substring bleibt `Grep` der Weg.
2. **Harness-LSP wo verfügbar** (Go-to-Definition/References) geht vor ast-grep, ast-grep vor
   Breit-Grep+Read.
3. **Beweis-Reads unangetastet.** Auf Risikopfaden (Norm-Tarif, Rechnen, normtext-JSON) wird die
   echte Datei bzw. die Daten-Sonde (`npm run zeige`, T6) gelesen — ast-grep ersetzt sie nie.
4. **`$N` / `$$$`** sind Metavariablen: `$N` = ein Knoten, `$$$` = beliebig viele. Muster in
   **einfache Anführungszeichen** setzen (sonst expandiert die Shell `$N`).
