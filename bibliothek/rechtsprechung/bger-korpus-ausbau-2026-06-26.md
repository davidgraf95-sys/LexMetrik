# BGer-Korpus-Ausbau (Zitiergraph-Pfad, 26.6.2026)

**Auftrag David 26.6.2026:** «zwischenzeitlich mehr Leitentscheide des
Bundesgerichts scrapen, sodass sie eingebaut werden können, wenn der andere
Agent fertig ist.» Umgesetzt in einer **§12-isolierten Parallel-Session**
(Worktree, Branch `rechtsprechung/mehr-bge-leitentscheide`), Ergebnis als Commit
zum späteren Merge — kein Anfassen des geteilten Verzeichnisses.

## 1. Quelle + Stand

- **OpenCaseLaw** (`https://mcp.opencaselaw.ch/api`), Court **`bger`** (nicht
  `bge`), Abruf **26.6.2026**. Recht: Urteilstext gemeinfrei (Art. 5 URG).
- **Default-Pfad des Generators** (`bundKorpus`): Citation-Graph-BFS ab
  Listing-Bonus-Seeds, keyed OCL-Detail. Liefert publizierte BGer-Urteile **mit
  Regeste**, aber `regesteAmtlich: false` und **`bgeReferenz: null`** (OCL führt
  für diesen Court keine amtliche BGE-Fundstelle — gilt identisch für den Ist-
  Korpus auf main).
- **Ergiebigkeit (gemessen 26.6.):** BFS 9008 geholt → **3903–4658 unique de**
  im Pool. Das Limit (nicht die Quelle) ist die Bremse; Listing schwankt stark
  (mal +800, mal +50 Bonus-Seeds → Pool-Zusammensetzung pro Lauf verschieden,
  Fahrplan-Risiko R9).

## 2. Regel deterministisch (was gelaufen ist)

- **Befehl (Rebuild, §7 — alles aus dem Generator, nie Hand-Edit):**
  ```
  npm run entscheide -- --datum=2026-06-26 --limit=580 \
    --courts=gr_gerichte,be_verwaltungsgericht,zh_obergericht,sg_gerichte,ag_gerichte \
    --kanton-pro=6
  ```
- **Auswahl-Rang** (`normtext-entscheide.ts`): Regeste zuerst, dann
  Leitentscheid, Tie-Break Datum absteigend → die neuesten regeste-tragenden
  Urteile gewinnen. `leit = marked_for_publication || bge_reference || regeste`
  ⟶ alle gewählten Bund-Entscheide mit Regeste sind `leitentscheid`.
- **Ergebnis:** **610 Entscheide** = **580 Bund** + **30 kantonal** (gr/be/zh/sg/ag
  je 6 — identische Gerichts-Matrix wie main, damit der Merge **keine** kantonalen
  Entscheide löscht). 586 mit Regeste; kantonale ohne amtliche Regeste korrekt
  `routine`.

## 3. Geltungsbereich + Ausnahmen

- **Mengen-Deckel `BUDGET_MB = 20`** (`check-entscheide.ts`) ist die *eigentliche*
  «so-viel-wie-sinnvoll»-Grenze, nicht der Zitiergraph. 1500 Entscheide = 42.9 MB
  rissen das Tor; **580+30 = 18.93 MB** hält es mit Reserve. Der Deckel ist ein
  **bewusster Guardrail** (Z.17–19) — hier NICHT eigenmächtig angehoben. Wer
  >610 will, hebt bewusst `BUDGET_MB` und prüft Payload (register.json wächst,
  Volltexte sind lazy-geladene statische Assets).
- **Streuung:** Sachgebiete ausgewogen (öffentlich/sozial-abgaben/straf/privat/
  prozess), Datum 2018–2026, recency-stark (2025: 185, 2024: 117). Ein tieferer
  BFS (Limit 1500) verschiebt zu älteren, meistzitierten Präjudizien (2011–2026)
  — fachlich wertvoll, aber recency-dünner; bewusst zugunsten Recency + Budget
  beim 580er belassen.
- **5 Gate-Warnungen** (nicht-fatal): kantonale Extraktions-Eigenheiten
  (Erwägungs-Top-Sprung, 1× Sachverhalt-Auszug) — gleiche Klasse wie auf main.

## 4. Pflegebedarf

- **Diskrepanz zur Stufe-1-Doku** (`bge-leitentscheide-import.md`): jene
  beschreibt den `--bge-von`-Pfad (Court `bge`, **amtliche** Regesten +
  `bgeReferenz`). Der Live-Korpus auf main (25.6.) wie auch dieser Ausbau nutzen
  den Default-`bger`-Pfad **ohne** amtliche Regeste. Offene Entscheidung für
  David/Integrator: amtliche BGE (`bge`) vs. Zitiergraph-BGer (`bger`) — oder
  beides kombiniert. **Nicht im Rahmen dieses Ausbaus entschieden.**
- Manuell, kein CI-Cron. Listing-Schwankung (R9) macht Läufe nicht
  byte-deterministisch — Korpus ist ein *Snapshot*, kein reproduzierbarer Fix.

## 5. Abnahme-Status

**Maschinell** (`kuratierung: 'maschinell'`, in der UI ausgewiesen, §8).
Verifiziert ist die **Mechanik**: Gate `check:entscheide` grün (610 Entscheide,
18.93 MB), Schema/Norm-Index/ERFASST konsistent, Struktur-Spot-Check ok,
Superset-Garantie gegenüber main (keine kantonale Löschung). **Nicht** verifiziert:
juristische Einzelfall-Auswahl/-Qualität (David, Zeitsperre bis 1.12.2026).
