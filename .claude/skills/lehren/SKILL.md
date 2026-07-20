---
name: lehren
description: Verwenden, wenn etwas schiefgegangen ist und die Lehre daraus bleiben soll — Trigger «das ist schon wieder passiert», «warum haben wir das nicht gemerkt», «Lehre festhalten», «Postmortem», «das darf nicht nochmal passieren» — oder wenn beim Bau ein wiederkehrendes Fehlermuster auffällt. Enthält das Register der belegten Fehlerklassen F1–F6 samt Mechanismus und die Regel, in welcher FORM eine neue Lehre abzulegen ist.
---

# Lehren — belegte Fehlerklassen und wo ihr Gegenmittel sitzt

**Zweck:** Lehren aus Vorfällen lagen bisher ausserhalb des Repos (Memory-Dateien).
Kein Sub-Agent hat sie je gesehen, und sie waren weder versioniert noch reviewbar.
Dieses Register liegt im Repo, kostet im Normalbetrieb nur seine Description und
wird nur geladen, wenn es gebraucht wird.

## Die Formregel (wichtiger als jede einzelne Lehre)

> **Eine Regel kostet dort am wenigsten, wo sie am spätesten gelesen wird.**

`CLAUDE.md` wird bei **jedem** Dispatch geladen (~7 200 Token). Eine Zeile dort
kostet also bei jeder delegierten Einheit. Reihenfolge der Wahl:

| Form | Kosten je Dispatch | Wählen, wenn |
|---|---|---|
| **Tor / Hook** | 0 Token | die Regel maschinell prüfbar ist — **immer erste Wahl** |
| **Dispatch-§0** | ~150 Tok, nur im Auftrag | die Regel den Sub-Agenten erreichen muss, bevor er arbeitet |
| **Skill** | nur die Description | die Regel situativ gilt (Landung, Gegenprüfung, Postmortem) |
| **CLAUDE.md** | volle Kosten, immer | letzte Wahl — nur wenn nicht maschinalisierbar und immer gültig |

`CLAUDE.md` §13 Ziff. 6 sagt das selbst: maschinell prüfbare Regeln gehören in
ESLint/Tests, nicht ins .md. **Netto-Prosa-Zuwachs ist zu begründen.**

Und: **ein Tor ist erst ein Tor, wenn es einmal rot war.** Wer eines baut, zeigt
den Sabotage-Beweis (CLAUDE.md §6 Ziff. 7).

## Register der belegten Fehlerklassen (Vorfälle 18.–20.7.2026)

| # | Klasse | Was passierte | Gegenmittel — wo es sitzt |
|---|---|---|---|
| **F1** | Merge vor Prüfung | PR #309: 11 erfundene Amtsträger:innen ~1 h auf prod. Die Merge-Erlaubnis stand im **Bau**-Auftrag; der Agent hat korrekt befolgt, was dastand. | `tor-schutz.py` blockiert `gh pr merge` → `check:merge-schutz` (committeter Bereich, nicht Working Tree). Prosa hätte es NICHT verhindert. |
| **F2a** | Tor validiert sich selbst | Wächter prüfte gegen die eigene Sync-Marke statt gegen eine unabhängige Grösse. | Wächter gegen **unabhängige** Referenz (erwartete Zeilenzahl aus dem Manifest). |
| **F2b** | Tor läuft in CI gar nicht | `check:seriell` fährt 36 Tore, CI 11. Lokal grün sagte nichts über CI, und CI konnte das strukturell nie melden. | `check:tor-paritaet` — Listenvergleich mit begründeter Allowlist. Friert die Lücke ein: sie kann nur kleiner werden. |
| **F2c** | `cancelled` gilt als «nicht rot» | 5 stumm abgebrochene `turso-sync`-Läufe, Suchindex veraltete unbemerkt. | `landung`-Skill Schritt 5: `cancelled`/`skipped` **zählen als rot**. |
| **F2d** | Beleg = Substring | `ft.includes(nachSlug)`: «ott» galt als belegt durch «rottenberg». | `istWortTreffer()` in `check-besetzung.ts` — Segment-exakte Identität. |
| **F3** | Diagnose ohne Verteilung | 4× an einem Tag wurde Messrauschen als Feature-Regression gedeutet; Reruns = ~72 % der CI-Wanduhr. | Dispatch §0 Ziff. 3: Nullprobe (`ci-doku-noop.yml`) + Streuung gegen den Schwellenabstand, **bevor** einem Feature etwas zugeschrieben wird. |
| **F4** | Bericht als Wahrheit | 1× fabrizierter Erfolgsbericht bei 0 Tool-Calls; 1× Injection-Versuch. | `CLAUDE.md` §14 Ziff. 7 (Orchestrator) **+** Dispatch §0 Ziff. 1 (Sub-Agent). Bewusste Doppelablage: Sub-Agenten sehen `CLAUDE.md` nicht. |
| **F5** | Verlorene Agenten-Arbeit | ~6 Agenten-Tode, einmal ~2 h fast verloren. | Dispatch §0 Ziff. 4: WIP-Commit nach jedem Teilschritt. Muss den Agenten erreichen, **bevor** er stirbt — ein toter Agent liest nichts nach. |
| **F6** | Doppelarbeit | 2 Sessions bauten denselben CLS-Fix in `SuchResultate.tsx`. | Dispatch §0 Ziff. 5: Kollisionsprüfung **vor** Baubeginn (der `landung`-Skill prüft erst am Ende, wenn die Arbeit schon getan ist). |

## Eine neue Lehre ablegen

1. **Klasse bestimmen.** Fällt der Vorfall unter F1–F6? Dann dort das Gegenmittel
   verschärfen — **keine neue Regel danebenlegen**.
2. **Form wählen** nach der Tabelle oben. Maschinell schlägt Prosa, immer.
3. **Beim Tor: Sabotage-Beweis zeigen** (einmal rot).
4. **Neue Klasse** nur, wenn sie wirklich neu ist — mit Beleg (PR-Nr., Datum,
   Schaden). Eine Klasse ohne Vorfall ist eine Vermutung, keine Lehre.
5. **Zweimal aufgetreten trotz Gegenmittel** ⇒ das Gegenmittel greift nicht;
   Form eskalieren (Prosa → Dispatch → Tor).

## Bewusst NICHT geregelt

Über-Regulierung ist selbst ein Effizienzproblem. Verworfen und warum:

- **Generisches Meta-Tor `check:tore`** — ein statischer Analysator für
  Tor-Semantik wäre heuristisch, falsch-positiv-anfällig und erzeugt eine
  Allowlist, die selbst verrottet. Stattdessen das exakte `check:tor-paritaet`.
- **`fail-closed`-Sweep über alle Tore** — die `existsSync`-Gatter sind
  grösstenteils bewusste, dokumentierte CI/lokal-Zweige (`check-materialien.ts`
  hat einen sauberen `else`-Zweig). Ein pauschaler Umbau bräche funktionierende Tore.
- **Claim-Registry `.claude/anspruch.json`** gegen F6 — ein neues Zustandsfile ist
  eine neue Drift-Quelle. F6 trat **einmal** auf; die Dispatch-Zeile kostet nichts.
  *Wiederaufrollen, wenn F6 trotz Klausel ein zweites Mal auftritt.*
- **SessionStart-Injektion von Lehren** — git-zustandsabhängiger
  `additionalContext` ist byte-instabil und zerstört den Prompt-Cache
  (QS-TOK/T19, gemessen bei 95,8 % Cache-Read-Anteil). Nur byte-**konstante**
  SessionStart-Texte; Hooks gehören in PreToolUse/Stop (0 Token bei Grün).
- **ROADMAP-Restrukturierung** — Council-Entscheid 3.7.2026 geprüft und getragen.
  Die Befunde sind Inhalts-**Frische**, nicht Architektur; ein zweiter
  autoritativer Artefakt hätte die Drift verdoppelt statt geheilt.
