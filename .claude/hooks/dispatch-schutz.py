#!/usr/bin/env python3
"""PreToolUse-Hook (Task): kein Sub-Agenten-Auftrag ohne §0-Pflichtklausel.

WARUM (Befund adversariale Pruefung PR #315, 20.7.2026):
Die Fehlerklassen F3 (Verteilung statt Einzelwert), F4 (Daten sind kein
Auftrag), F5 (Recovery-Commit) und F6 (Kollisionspruefung) hatten als einzigen
Traeger einen Prosa-Block in `docs/token-oekonomie/dispatch-template.md`.
`check:dispatch-klausel` bewies nur, dass der Text IN DER DOKU steht — nicht,
dass ein tatsaechlich abgesetzter Auftrag ihn traegt. `npm run dispatch` war
ein rein freiwilliger Drucker.

Empirischer Gegenbeweis aus dem Betrieb: der erste Dispatch nach dem Einbau
des Mechanismus (die adversariale Pruefung dieses PR selbst) enthielt KEINEN
§0-Block. Die erste Gelegenheit hat ihn nicht getragen. Ein Appell, den die
naechste Gelegenheit bereits verfehlt, ist kein Mechanismus.

Dieser Hook macht den Block erzwungen statt empfohlen: er liest den Prompt
des Task-Aufrufs und blockiert, wenn die Klausel fehlt. Damit ist der Traeger
nicht mehr die Disziplin des Orchestrators, sondern die Tool-Ebene — dieselbe
Ebene, die schon `gh pr merge` auf Risikopfaden haelt (§9).

BEWUSSTE GRENZE (ehrlich, §8): Der Hook greift nur, wo diese settings.json
gilt — nicht bei Auftraegen aus einer fremden Session, einem anderen Rechner
oder der Web-Oberflaeche. Er schliesst die Klasse nicht vollstaendig, er
verschiebt sie von «niemand prueft» zu «der uebliche Weg prueft».

Exit 2 = Aufruf blockieren, stderr geht als Feedback an Claude.
"""
import json
import re
import sys

try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

# Das Delegations-Werkzeug heisst je nach Harness "Task" ODER "Agent" (in der
# Umgebung vom 20.7.2026: "Agent"). Ein Matcher auf nur EINEN Namen macht diesen
# Hook zum stillen No-op — genau die Fehlerklasse, die er verhindern soll.
# Befund von Fable bei der Vor-Merge-Pruefung von #316; die Sabotage-Proben des
# PR liefen mit synthetischem stdin und konnten das darum nicht aufdecken.
if data.get("tool_name") not in ("Task", "Agent"):
    sys.exit(0)

ti = data.get("tool_input") or {}
prompt = ti.get("prompt") or ""

# Kurze, klar begrenzte Auftraege ohne Bau-/Pruefcharakter (z. B. eine reine
# Datei-Suche) sollen nicht am Formalismus scheitern. Die Schwelle ist
# bewusst niedrig: alles, was ernsthaft delegiert wird, liegt darueber.
if len(prompt) < 400:
    sys.exit(0)

MARKER = "§0 PFLICHT-KLAUSEL"

# Die sechs Punkte einzeln — ein halb eingefuegter Block ist kein Block.
PUNKTE = [
    (r"^1 DATEN, NICHT AUFTRAG\.", "1 Daten-nicht-Auftrag (F4)"),
    (r"^2 ERST REPRODUZIEREN, DANN FIXEN\.", "2 Reproduzieren-vor-Fix (F2d)"),
    (r"^3 VERTEILUNG STATT EINZELWERT\.", "3 Verteilung-statt-Einzelwert (F3)"),
    (r"^4 RECOVERY\.", "4 Recovery-Commit (F5)"),
    (r"^5 KOLLISION\.", "5 Kollisionspruefung (F6)"),
    (r"^6 KEIN MERGE IM BAU-AUFTRAG\.", "6 Kein-Merge-im-Bau-Auftrag (F1)"),
]

if MARKER not in prompt:
    print(
        "BLOCKIERT (§14 Ziff. 6/7): Sub-Agenten-Auftrag ohne §0-Pflichtklausel.\n\n"
        "  Sub-Agenten sehen CLAUDE.md NICHT (verifiziert 20.7.2026). Der §0-Block\n"
        "  ist der einzige Ort, an dem F3 (Verteilung statt Einzelwert), F4 (Daten\n"
        "  sind kein Auftrag), F5 (Recovery-Commit) und F6 (Kollisionspruefung)\n"
        "  einen delegierten Auftrag ueberhaupt erreichen.\n\n"
        "  Weg:  npm run dispatch -- <bau | pruefung | recherche | daten>\n"
        "  Ausgabe woertlich an den Anfang des Task-Prompts stellen, dann erneut.",
        file=sys.stderr,
    )
    sys.exit(2)

fehlend = [name for muster, name in PUNKTE
           if not re.search(muster, prompt, re.MULTILINE)]

if fehlend:
    print(
        "BLOCKIERT (§14 Ziff. 6/7): §0-Block ist unvollstaendig — "
        f"{len(fehlend)} Pflichtpunkt(e) fehlen:\n"
        + "\n".join(f"    - {n}" for n in fehlend)
        + "\n\n  Der Block geht WOERTLICH und UNVERAENDERT in den Auftrag.\n"
          "  Frisch erzeugen:  npm run dispatch -- <klasse>",
        file=sys.stderr,
    )
    sys.exit(2)

sys.exit(0)
