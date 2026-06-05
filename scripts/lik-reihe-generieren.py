#!/usr/bin/env python3
"""Generiert src/data/likReihe.ts aus der amtlichen BFS-Indexierungstabelle.

Monatlicher Pflege-Lauf (nach BFS-Publikation, erste Folgemonatswoche):
  1) curl -sL https://www.bfs.admin.ch/asset/de/cc-d-05.02.08 -o /tmp/lik-asset.html
  2) DAM-URL extrahieren, XLSX laden (siehe unten) — oder direkt:
     curl -sL <dam-api…/master> -o /tmp/lik.xlsx
  3) python3 scripts/lik-reihe-generieren.py /tmp/lik.xlsx

Quelle: BFS «Landesindex der Konsumentenpreise, Indexierungstabelle»
(cc-d-05.02.08), Lizenz OPEN-BY (Quellenangabe Pflicht).
Hinterlegt werden die GERUNDETEN Originalbasen-Reihen ab Basis Sep. 1966
(BFS-Empfehlung für Indexierungszwecke; Verhältnis ist basisinvariant)."""
import sys, datetime, openpyxl

pfad = sys.argv[1] if len(sys.argv) > 1 else '/tmp/lik.xlsx'
wb = openpyxl.load_workbook(pfad, read_only=True, data_only=True)
ws = wb['Index_m']
BASEN = ['1966-09','1977-09','1982-12','1993-05','2000-05','2005-12','2010-12','2015-12','2020-12','2025-12']
SPALTE = {b: i for i, b in enumerate(['1914-06','1939-08'] + BASEN, start=1)}
reihen = {b: {} for b in BASEN}
letzter = None
for r in ws.iter_rows(min_row=5, values_only=True):
    d = r[0]
    if not isinstance(d, datetime.datetime):
        continue
    key = f'{d.year}-{d.month:02d}'
    for b in BASEN:
        v = r[SPALTE[b]]
        if v in (None, ''):
            continue
        reihen[b][key] = round(float(v), 1)
        letzter = max(letzter or key, key)

zeilen = [
    '// ─── LIK-Monatsreihen (amtlich, generiert — NICHT von Hand editieren) ──────',
    '//',
    '// Quelle: Bundesamt für Statistik (BFS), Landesindex der Konsumentenpreise,',
    '// Indexierungstabelle cc-d-05.02.08 (Originalbasen, gerundet auf eine',
    '// Dezimalstelle — BFS-Empfehlung für Indexierungszwecke). Lizenz OPEN-BY,',
    '// Quellenangabe Pflicht. Regeneration: scripts/lik-reihe-generieren.py',
    '//',
    f"export const LIK_LETZTER_MONAT = '{letzter}';",
    f"export const LIK_STAND = 'BFS-Indexierungstabelle bis {letzter} (abgerufen 5.6.2026)';",
    "export const LIK_QUELLE = 'Bundesamt für Statistik (BFS), Landesindex der Konsumentenpreise';",
    '',
    '// Je Originalbasis (Basismonat = 100) die Monatswerte ab Basismonat.',
    'export const LIK_REIHEN: Record<string, Record<string, number>> = {',
]
for b in BASEN:
    eintraege = ', '.join(f"'{k}': {v}" for k, v in sorted(reihen[b].items()))
    zeilen.append(f"  '{b}': {{ {eintraege} }},")
zeilen.append('};')
zeilen.append('')
open('src/data/likReihe.ts', 'w').write('\n'.join(zeilen))
print(f'geschrieben: src/data/likReihe.ts — {sum(len(v) for v in reihen.values())} Werte, letzter Monat {letzter}')
