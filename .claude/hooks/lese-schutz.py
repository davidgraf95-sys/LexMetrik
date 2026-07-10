#!/usr/bin/env python3
"""PreToolUse-Guard (Read + Bash) — QS-TOK T5(a): verhindert Katastrophen-Reads,
die stumm 100k–500k Token in den Kontext ziehen (FAHRPLAN-TOKEN-OEKONOMIE §1/§4).

Weich und überwindbar — kein Beweis-Read wird verhindert:

  Rule A (Grösse):  Read einer Datei > ~200 KB OHNE offset/limit → Soft-Block.
                    Override: denselben Read mit offset/limit (gebundener Ausschnitt)
                    ODER die Daten-Sonde `npm run zeige -- <Erlass> <Artikel>` (T6).
  Rule B (Pfad):    Read/cat der Dateien, die §6 NIE direkt gelesen werden
                    (golden/*.json, package-lock.json, dist/**, fontData.ts) →
                    Block mit Verweis auf das richtige Werkzeug (golden:diff / zeige / npm ls).
                    0-Treffer-Fallen (still leeren) vermeiden wir bewusst — hier
                    kommt eine sichtbare Meldung statt eines False-Negative.

Generatoren/Tore/CI lesen dieselben Dateien per fs im Subprozess — die berührt
dieser Hook NICHT (er feuert nur auf die Tool-Aufrufe des Agenten). Leitplanke:
kein Tor, kein Build, kein Generator-Lauf wird blockiert.

Exit 2 = Aufruf blockieren, stderr geht als Feedback an Claude. Bei jeder
Unsicherheit (Stat schlägt fehl, Pfad unbekannt) → Exit 0 (nie fälschlich blocken).
"""
import json
import os
import re
import sys

SCHWELLE = 200 * 1024  # ~200 KB

# §6: diese Dateien werden NIE direkt gelesen — Werkzeug-Hinweis statt Read.
# Pfad-Token wird per Wortgrenze erkannt (Anfang, Whitespace, Quote, '=' oder '/'),
# damit er sowohl als Read-file_path (voll) wie eingebettet in ein Bash-Kommando greift.
_G = r"(?:^|[\s\"'=/])"
PFAD_MUSTER = re.compile(
    _G + r"golden/[^\s\"';|]*\.json\b"
    r"|" + _G + r"package-lock\.json\b"
    r"|" + _G + r"dist(?:-ssr)?/"
    r"|fontData\.ts\b"
)
WERKZEUG_HINWEIS = (
    "golden/* → `npm run golden:diff -- <id>` bzw. `golden:vergleich`; "
    "package-lock.json → `npm ls <paket>`; dist/** = Build-Artefakt (Quelle lesen); "
    "fontData.ts = Base64-Blob (nicht lesen)."
)
SONDE_HINWEIS = (
    "Statt der Riesendatei: gezielt mit offset/limit lesen, oder die Daten-Sonde "
    "`npm run zeige -- <Erlass> <Artikel>` (normtext, byte-treu) / `golden:diff` nutzen "
    "(FAHRPLAN-TOKEN-OEKONOMIE §4 T6)."
)


def blockiere(msg):
    print(msg, file=sys.stderr)
    sys.exit(2)


try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)

tool = data.get("tool_name", "")
ti = data.get("tool_input") or {}


def norm(p):
    return (p or "").replace("\\", "/")


if tool == "Read":
    pfad = ti.get("file_path", "")
    if not pfad:
        sys.exit(0)
    np = norm(pfad)
    if PFAD_MUSTER.search(np):
        blockiere(
            f"BLOCKIERT (§6/QS-TOK T5): «{os.path.basename(np)}» wird nie direkt "
            f"gelesen — es kippt nur Token in den Kontext. {WERKZEUG_HINWEIS}"
        )
    # Rule A: gebundener Read (offset/limit) ist immer erlaubt.
    if ti.get("offset") is not None or ti.get("limit") is not None:
        sys.exit(0)
    try:
        groesse = os.path.getsize(pfad)
    except Exception:
        sys.exit(0)
    if groesse > SCHWELLE:
        blockiere(
            f"BLOCKIERT (QS-TOK T5): «{os.path.basename(np)}» ist "
            f"{groesse // 1024} KB (> {SCHWELLE // 1024} KB) und würde ungebremst "
            f"~{groesse // 4000}k Token ziehen. {SONDE_HINWEIS}"
        )
    sys.exit(0)

if tool == "Bash":
    cmd = ti.get("command", "")
    if not cmd:
        sys.exit(0)
    # Nur die inhalts-dumpenden Leser fangen; head -c / wc / jq-Selektion sind
    # gebunden und bleiben erlaubt.
    for seg in re.split(r"&&|\|\||;|\n|\|", cmd):
        s = seg.strip()
        if not re.match(r"^(sudo\s+)?(cat|less|more|bat|nl|most|view)\b", s):
            continue
        if PFAD_MUSTER.search(norm(s)):
            blockiere(
                "BLOCKIERT (§6/QS-TOK T5): cat/less auf eine nie-direkt-zu-lesende "
                f"Datei. {WERKZEUG_HINWEIS} (Statt `cat` das Werkzeug nutzen.)"
            )
    sys.exit(0)

sys.exit(0)
