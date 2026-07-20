# Zitationsnetz — Rückwärts-Zitate & Leitentscheid-Score (Feasibility)

**Erstellt:** 20.7.2026 (Ideen-Intake §14 der 8 Alleinstellungs-Ideen, Idee 1 — Verortung als
ROADMAP-Schritt `W2·6-ZNETZ`; dieses Dossier trägt die Machbarkeits-Begründung, damit sie
nicht nur im Plan-Fliesstext steht) · **Status:** ERSTRECHERCHE — Bestandsaufnahme gegen den
Repo-Stand vom 20.7.2026, **kein** adversarialer Zweitdurchgang; die Mengenangaben unten sind
vor dem Bau nachzuzählen (siehe §5).

**Quellen (Repo-Bestand, kein Rechtsinhalt — daher keine amtlichen Normquellen):**

| Beleg | Fundort | Rolle |
|---|---|---|
| Feld `zitierteEntscheide` je Snapshot | `src/lib/rechtsprechung/typen.ts` | Rohkante (vorwärts) |
| Laufzeit-Auflösung der Kanten | `src/lib/verzahnung/entscheid-kanten.ts` | heutiger Vorwärts-Weg |
| Build-Generator (Vorbild) | `scripts/normtext/entscheide-schreiben.ts` → `register.json`, `norm-index.json`, Leitfall-Shards | **Bau-Muster** |
| Index-Typen | `src/lib/rechtsprechung/norm-index.ts` | Zielform |
| Massen-Kantentabelle `zitat_kanten` (`ix_zitat_nach`) | `daten/masse.db` (~5,7 GB, **nicht ausgeliefert**) | Long-Tail |

---

## §1 · Die Frage

«Welche Entscheide zitieren diesen?» (Rückwärts-Kanten) und daraus ein **Leitentscheid-Score
nach Zitierhäufigkeit**. Heute läuft nur die **Vorwärts**-Richtung: ein Entscheid nennt, wen er
zitiert. Die Umkehrung ist nicht gespeichert.

## §2 · Regel deterministisch (Eingabe → Ausgabe)

```
Eingang:  alle Entscheid-Snapshots mit Feld zitierteEntscheide[]
Schritt1: je Snapshot S und je Zitat Z in S.zitierteEntscheide:
            Z auflösen (BGE-Zitat ODER Geschäftsnummer) gegen register.json
            → bei Treffer: Kante (S → T) ablegen
            → bei Nicht-Treffer: als unaufgelöst zählen, NICHT raten
Schritt2: Kanten invertieren → je Ziel T die Liste der Quellen S
Schritt3: score(T) = |{S : S zitiert T}|   — reine Zählung, sonst nichts
Ausgang:  Rückwärts-Index (+ Shards, Form analog norm-index.json)
```

**Der Score ist eine Zählung, keine Qualitätsaussage** (§2/§8): ausgegeben wird immer die
**Grundgesamtheit** dazu («X von N erfassten Entscheiden»), nie eine nackte Rangzahl und nie
ein Prädikat wie «wichtigster Entscheid». Kein LLM-Ranking.

## §3 · Geltungsbereich und die ehrliche Zweiteilung

| Stufe | Datenlage | Verdikt |
|---|---|---|
| **Kuratierter Korpus** (ausgelieferte Snapshots) | vollständig auf Platte, Kanten liegen im Feld vor | 🟢 **jetzt baubar** — Generator = Spiegel des vorhandenen Index-Generators |
| **Long-Tail** (Massen-Entscheide) | nur in `daten/masse.db` (~5,7 GB), **nicht ausgeliefert**; `zitat_kanten` dort bereits indiziert | 🟠 **nicht hier** — hängt an E3-Serving/E4, gehört in `W2·6-DATA` |

**Das ist die eigentliche Erkenntnis dieses Dossiers:** die Idee klingt nach einem Vorhaben,
ist aber zwei sehr ungleiche. Die kuratierte Stufe ist ein überschaubarer Build-Generator; die
Long-Tail-Stufe ist ein Infrastruktur-Thema (Serving eines mehrere GB grossen Artefakts) und
darf **nicht** mit ihr in eine Bau-Einheit gebündelt werden (§14.2).

## §4 · Ausnahmen und Fallstricke

1. **Zwei Zitierformen** — BGE-Zitat und Geschäftsnummer bezeichnen denselben Entscheid.
   Ohne Kanonisierung entstehen Doppelkanten und ein **zu hoher** Score.
2. **Unaufgelöste Zitate sind der Normalfall**, nicht der Fehlerfall: zitiert wird auch, was
   nicht im Bestand ist. Sie werden gezählt und ausgewiesen (§8), nicht stillschweigend
   verworfen — sonst wirkt der Korpus vollständiger, als er ist.
3. **Selbstzitate / Verweisketten** innerhalb desselben Verfahrens vor der Zählung ausschliessen.
4. **Score ist korpus-relativ:** wächst der Korpus, ändern sich alle Scores. Darum gehört die
   Korpus-Grösse und ihr Stand **an die Zahl**, nicht in eine Fussnote.
5. **Determinismus:** Kantenreihenfolge stabil sortieren, sonst sind zwei Läufe nicht
   byte-gleich (§2) und das Golden-Tor schlägt zu Recht an.

## §5 · Vor dem Bau nachzuzählen (offene Punkte)

- Ist-Zahl der ausgelieferten Snapshots und der auflösbaren Kanten frisch erheben — die im
  Intake-Plan genannten Grössenordnungen (rund 5000 Snapshots, rund 2500 Kanten aus einer
  200-BGE-Stichprobe) sind **übernommene Angaben, hier nicht nachgeprüft**.
- Auflösungsquote messen (aufgelöst / unaufgelöst) — sie bestimmt, ob der Score überhaupt
  aussagekräftig genug für eine UI-Anzeige ist.
- Shard-Budget gegen das bestehende Tor in `scripts/normtext/check-entscheide.ts` prüfen.

## §6 · Verzahnung (nicht doppelt bauen)

- **UI** («Wird zitiert von», Startseiten-Kachel «Meistzitierte Artikel») läuft in
  `W2·7-VZUI` V2 ein → `FAHRPLAN-VERZAHNUNG-UI.md`.
- **Long-Tail/Serving** läuft in `W2·6-DATA` (E3/E4) ein → `FAHRPLAN-DATENHALTUNG.md`.
- Dieses Dossier deckt allein den **kuratierten Build-Generator**.

## §7 · Pflegebedarf

Keine datierten Rechts-Parameter — der Index ist ein **Derivat des Korpus** und wird mit ihm
neu gebaut. Pflegepunkt ist allein die Korpus-Stand-Angabe an jeder ausgegebenen Zahl.

## §8 · Abnahme-Status

ERSTRECHERCHE. Vor dem Bau: Mengen nachzählen (§5). Risiko-Pfad (Daten-Derivation) ⇒
`check:gegenpruefung` ist Pflicht, fachliche Abnahme durch David steht aus.
