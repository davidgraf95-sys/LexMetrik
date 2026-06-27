# LexMetrik — Konsolidierte Roadmap (EIN Steuerungsblick)

> **Stand 28.6.2026.** Konsolidiert die 26 aktiven `FAHRPLAN-*.md` zu **einem**
> priorisierten Blick. Erstellt aus einer Klassifizierung aller Pläne (ultracode,
> 26 Einzel-Extrakte + Strategie-Rahmen-Synthese).
>
> **Verhältnis zu den anderen Steuerungsdokumenten:** Jeder Einzel-Fahrplan bleibt
> die verbindliche **Detailquelle**; diese Roadmap entscheidet nur **Reihenfolge** +
> **bau-jetzt vs. später**. `KATALOG-ROADMAP.md` = feinkörnige G1-Praxis-Abdeckungs­karte
> (pro Rechtsfrage). `HANDLUNGSPLAN.md` = Tagesgeschäft + offene Abnahmen. `STRUKTUR.md`
> = Ist-Zustand/Session-Karten. Diese Datei = die Klammer darüber.

## Ausgangslage (28.6.2026 — „vom jetzigen Punkt aus")
- **Doc-Aufräumung erledigt:** 5 abgeschlossene Pläne nach `archiv/`
  (JETZT-MACHEN, HANDOFF-NACHT-MATERIALIEN, GESETZE-REVIEW, LEITENTSCHEID-BGE-VOLLTEXT,
  GESETZE-UX-9PUNKTE); verbrauchte Memory-Trigger gelöscht; stale STAND-Blöcke korrigiert.
- **Tiefe Code-Aufräumung erledigt** (Parallel-Ultracode-Session, `main` `e175d589`,
  Batch A–E: toter Code, Design-Token-Härtung, Entdopplung, §6.6-Datei-Splits) —
  **wartet auf Davids Deploy-Freigabe (§9).** Ein test-abgeschirmtes Residuum
  (`randtitelTeile`/`randtitelEintraege`) wurde danach §6-verifiziert entfernt.
- **Es bleiben 26 aktive Fahrpläne** — diese Roadmap priorisiert sie.

## Nordstern
Jede CH-Kanzlei nutzt LexMetrik im Alltag für die **ermessensfreie, deterministische**
Rechtsarbeit (Fristen · Beträge/Quoten · Zuständigkeit · Form-Vorlagen) und **vertraut**
den Ergebnissen. «Berechnung statt KI», jede Norm artikelgenau auf Fedlex verlinkt
(PROJEKTBESCHRIEB §1, STRATEGIE §5). Burggraben = nicht der Code, sondern Datenassets
(26-Kantone-Schichten) + Verifikations-Prozess + fachkundige Abnahme.

## Schlüssel-Constraint: Abnahme-Zeitsperre bis 1.12.2026
David hat bis **1.12.2026** (Anwaltsprüfung) **keine Fachzeit** für Detail-Abnahme;
erste Kanzleigespräche (G1) ab Feb 2027. **Leitsatz: bis 1.12. nur Arbeit, die
(a) keine Davids-Fachzeit braucht und (b) die spätere Abnahme-Welle billiger macht.**
Kein `verified`/`geprüft` ohne David (§7/§8).

→ **DER Sortier-Hebel dieser Roadmap:** `[OF]` ohne Fachzeit baubar zieht nach vorne;
`[D]` braucht David → geparkt + in der Abnahme-Warteschlange aufgereiht (nicht gedrängt,
s. `FAHRPLAN-LERNPHASE-2026.md`). Plattform-Regel: **Bau-Rate ≤ Abnahme-Rate**.
Harte Regel: **nie zwei 26×-Datenassets gleichzeitig offen** — eine Säule fertig führen.

---

## ⚡ JETZT (P0 — ohne Fachzeit, sofort baubar)

| # | Schritt | Strang | Warum jetzt | Nächster Schritt |
|---|---------|--------|-------------|------------------|
| 0 | **Verfallsregister mechanisch — FRIST 30.6.2026** | Fundament/Lernphase B | Terminierter Verfall in Tagen (SG GKV läuft 30.6. ab); weitere 1.11./31.12. | `check:verfall` prüfen, dass SG-GKV-Verfall erfasst + sichtbar ist; restliche datierten Verfälle aufnehmen |
| 1 | **Status-Marker-Audit (Lernphase Strang A)** | Fundament/Lernphase | Einziger Haftungs-/Trust-Hebel solo machbar; ~130 Karten brauchen ehrlichen Status | Auditieren, ob JEDE Karte/Engine sichtbaren Status (verified/entwurf/geplant) + Stand trägt; Lücken in `startseiteConfigTypen.ts`/`startseiteKarten.ts` schliessen |
| 2 | **Kantonale-Entscheide P0-Pilot-Reparatur** | Rechtsprechung | Live + nachweislich «sehr falsch» (SG-Regeste fehletikettiert, tote Normverweise) = sichtbare §8-Verletzung | `regesteAmtlich` korrigieren, kant. Norm-Resolver ergänzen, `152_I_105` re-fetchen |
| 3 | **Tarif-Tabellen Klasse D (Tausendertrenner)** | Gesetze/Normtext | Klein, hoher Sichtwert, deckt SG sofort; David-Befund «praktisch unlesbar» | `gruppiereTausender` in `ArtikelBody.tsx`/TarifTabelle (Render, **nicht** Snapshot, §7) |
| 4 | **BS-Vorbild C3: globale Kopf-Suche über Gesetze** | Gesetze/Normtext | Anwältin tippt Gesetzesnamen heute → nichts; reine Index-/Darstellungsschicht | HeaderSuche über `ladeBrowseManifest` indexieren, Deeplinks `/gesetze/<ebene>/<key>` |
| 5 | **Fall-Rückgrat Phase 0 (`fallId.ts` + `fallSpeicher.ts`)** | Fundament | Grösster Workflow-Hebel, 0 % gebaut, komplett ohne Fachzeit (Persistenz) | `fallId.ts` (`crypto.randomUUID`) + `fallSpeicher.ts` (Typen + localStorage), Unit-Tests Roundtrip/korrupt |

> **Reihung:** 0 ist fristgetrieben (30.6.), 1+2 sind Trust/Haftung (Strang A = «zuerst»),
> 3+4 kleine Sicht-Gewinne, 5 der grösste neue Praxis-Hebel.
> **Worktree-Pflicht (§12):** SEO/A11y, Vorlagen/Verträge und FUNDAMENT-UMBAU je eigener
> Worktree (Datei-Kollision, s. Abhängigkeiten). Aktuell läuft zudem eine Parallel-Session
> auf `main` → vor Code-Arbeit `git log` prüfen.

---

## Themen-Stränge mit Prioritäten

Legende: **[OF]** ohne Fachzeit baubar (bis 1.12. bevorzugt) · **[D]** braucht David
(parken/aufreihen) · *%* = grobe Selbsteinschätzung der Extrakte (nicht nachgemessen).

### 1. Fundament / Plattform / Steuerung
| Prio | Plan | % | | Kern offen |
|------|------|---|---|-----------|
| **P0** | LERNPHASE-2026 *(Steuer-Direktive)* | 35 | [OF] | Strang A Status-Marker · B Verifik.-Infra/Verfallsregister · C Fristen-Warteschlange |
| **P1** | FALL-RUECKGRAT | 0 | [OF] | Phase 0 Schema → Phase 1 «Meine Fristen» (grösster Praxis-Hebel) |
| **P1** | GRUNDLAGEN *(G1–G4)* | 50 | gemischt | [OF] G3.4 kant. Stammdaten, G4.1/4.2 · [D] G2-Abnahme blockiert |
| **P2** | FUNDAMENT-UMBAU | 0 | teils [OF] | Phase 0 Doku-Hygiene = no-code; **nicht parallel zu VORLAGEN-AUSBAU** (§12) |
| **P2** | UX-PUNKTELISTE | 85 | [OF] | C5 Erlass-Ingress, D-Rest, Batch F (= Kantonale Entscheide) |

### 2. Gesetze / Normtext
| Prio | Plan | % | | Kern offen |
|------|------|---|---|-----------|
| **P1** | GESETZE-IMPORT-3TIER | 60 | [OF] | Phase 2: Kanton-für-Kanton durch stehende Pipeline (operativ via BS-Vorbild) |
| **P1** | BS-VORBILDKANTON | 70 | [OF] | C3 Kopf-Suche · interne §-Verlinkung · SR-Label · N5 Volltext · D1 Versionsgeschichte |
| **P1** | TARIF-TABELLEN-STUFE2 | 30 | [OF] | Klasse D (jetzt) → Mehrspalten-Datenmodell → Klasse A (NW)/B (ZH/ZG/TG) |
| **P2** | GESETZESTEXT-POPUP | 90 | teils | wenige PDF-only-Kantone/Token-Lücken; **Doku-Kopf nachführen** |
| **P2** | RECHTSSAMMLUNG | 85 | [OF] | P4 D1 Norm↔Werkzeug-Brücke (Alleinstellungsmerkmal) |
| **P3** | INTERNATIONAL-VOLLTEXT | 90 | [OF] | nur optionaler P2-Rest (weitere SR 0.*); P3-Redesign **erledigt** (`0f9a9043`); EMRK/NYÜ strukturell unmöglich → §8/pdf-embed |

### 3. Rechtsprechung
| Prio | Plan | % | | Kern offen |
|------|------|---|---|-----------|
| **P1** | KANTONALE-ENTSCHEIDE | 10 | gemischt | **P0-Pilot-Reparatur (jetzt, OF)** → P1 Adapter (blockiert: Lizenz/Limits/CORS) → [D] P4 Kuratierung |
| **P1** | ENTSCHEIDSUCHE-AUSBAU | 10 | [OF] | reiner Plan; P1 Filter/Paginierung erst nach §4-Verifikation (CORS/Limits/Lizenz) |
| **P2** | RECHTSPRECHUNG *(Dach)* | 85 | gemischt | [OF] Korpus-Breite via Generator · [D] Präjudiz-Kuratierung; **deployt** (Doku-Kopf war veraltet) |
| **P3** | BGE-DARSTELLUNG-EINHEITLICH | 85 | teils | faktisch erfüllt + deployt 27.6.; Rest B4/B5 → ENTSCHEIDSUCHE-AUSBAU → **archiv-Kandidat** |
| **P3** | BGER-RECHTSWEG | 95 | [D] | Code fertig + deployt; nur §7-Abnahme (Eheschutz-Weiche, WARUM-Texte) → Abnahme-Welle |

### 4. Vorlagen / Verträge
| Prio | Plan | % | | Kern offen |
|------|------|---|---|-----------|
| **P1** | VORLAGEN-AUSBAU | 45 | [OF] | V8 Musterklagen (Bauhandwerkerpfand zuerst); V4 mit VERTRAGS-VARIANTEN abgleichen |
| **P1** | VERTRAGS-VARIANTEN | 30 | [OF] | P3 neue Basistypen (Kauf/Schenkung/Pacht/Darlehen/Bürgschaft); **ungepusht** |
| **P1** | GMBH-GRUENDUNG | 60 | [OF] | G2 qualifizierte Gründung (777c II) aus AG-Maske portieren; **live** (Doku-Kopf war «PAUSIERT») |
| **P1** | BEGRUENDUNGS-ABSATZ | 5 | teils [OF] | Phase 0 Golden/Linter (OF) → 4 David-Entscheide offen (B4-2 Kosten-Rechner) |

### 5. Rechner / Tarife (Hauptmoat)
| Prio | Plan | % | | Kern offen |
|------|------|---|---|-----------|
| **P1** | PROZESSKOSTEN-COCKPIT *(Hauptmoat)* | 80 | [OF] | I2 Schlichtungs-/Reduktionsfaktoren (wartet Recherche `wbqdyap3x`), I4, I9 |
| **P1** | PRODUKTAUSBAU-BURGGRABEN *(Dach)* | 60 | gemischt | [OF] P2 Fall-Kontext-Rückgrat (0 %) · P3 Zustellfiktions-Engine; Hauptmoat steht |

### 6. Notariat / Beurkundung
| Prio | Plan | % | | Kern offen |
|------|------|---|---|-----------|
| **P2** | BEURKUNDUNGS-AUSBAU | 90 | [D] | gebaut + gegated; nur Abnahme + SZ-Ceil-Näherung als Verifik.-Task; Deploy-Status §9 bestätigen |
| **P2** | NOTARIAT-GRUNDBUCH | 85 | [OF] | NG-4 Zweitpass `recherche`→`doppelt` über 98 Einträge; `geprüft` gesperrt bis 1.12. |
| **P2** | LUECKEN-SCHLIESSEN | 85 | [OF] | L7 Konfidenz (hoch/mittel/tief) in UI durchreichen; L8 `geprüft` blockiert |

### 7. SEO / A11y / Governance
| Prio | Plan | % | | Kern offen |
|------|------|---|---|-----------|
| **P1** | SEO-A11Y-GOVERNANCE | tw. | [OF] | Welle 1 grossteils gebaut (27.6.); Rest-Wellen. **Hoher autonomer Sicht-Hebel**, aber hohes Kollisionsrisiko → Worktree-Isolation zuerst |

---

## Abhängigkeiten & Konflikte (was blockt was)

**Worktree-Pflicht §12 (gleiche Dateien, nie zeitgleich):**
- **FUNDAMENT-UMBAU ⟂ VORLAGEN-AUSBAU ⟂ VERTRAGS-VARIANTEN** — kollidieren an
  `App.tsx`/`startseiteConfig.ts`/`vorlagenRegistry`.
- **SEO-A11Y** — kollidiert an `register.json`/`seo.ts`/`prerender.ts`/`vercel.json`.

**26×-Datenasset-Regel (nie zwei gleichzeitig offen):** Prozesskosten-Cockpit ·
Notariat-Grundbuch · Beurkundungs-Ausbau · Gesetze-Import-3Tier · Kantonale-Entscheide.

**Vor Bau zu klären (Verifikations-Blockaden):**
- ENTSCHEIDSUCHE-AUSBAU & KANTONALE-ENTSCHEIDE P1-Adapter ⟵ §4: CORS / Rate-Limits /
  Lizenz (CC-BY-SA vs. Art. 5 URG) unbestätigt.
- PROZESSKOSTEN I2 ⟵ Recherche `wbqdyap3x`.

**Abnahme-Zeitsperre blockiert (parken, nicht drängen):** BGER-RECHTSWEG §7 ·
BEURKUNDUNGS-AUSBAU · alle `geprüft`-Stufen (L8, NG, Popup-Snapshots, Grundlagen G2).
→ Abnahme-Warteschlange nach Haftungsrisiko: Welle 1 Fristen → 2 Form-Gate-Vorlagen → 3 Beträge.

**Infrastruktur-Fundamente (liefern an viele):** GESETZESTEXT-POPUP (Snapshot-/Drift-System)
→ trägt RECHTSSAMMLUNG, RECHTSPRECHUNG-Verzahnung, GESETZE-IMPORT. LERNPHASE Strang A/B
→ Querschnitt für alle Status-/Verifik.-Teile.

---

## Ehrlichkeits-/Unschärfe-Vermerke
- **% «fertig»** = Selbsteinschätzung der Plan-Extrakte, nicht unabhängig nachgemessen.
- **G1–G4-Zuordnung** in vielen Einzelplänen nicht explizit etikettiert → Strang-Zuordnung abgeleitet.
- **Archiv-Kandidaten** (inhaltlich weitgehend erfüllt, vor Verschieben Code-Stand prüfen):
  BGE-DARSTELLUNG-EINHEITLICH (Rest an ENTSCHEIDSUCHE-AUSBAU); INTERNATIONAL-VOLLTEXT-Restbatch
  ggf. nur als Lückenfüller.
- **Doku-Köpfe schon korrigiert/verifiziert:** GMBH (live), RECHTSPRECHUNG (deployt),
  BGER-RECHTSWEG (deployt), INTERNATIONAL P3 (erledigt). Noch nachzuführen: GESETZESTEXT-POPUP,
  LUECKEN-SCHLIESSEN, NOTARIAT-GRUNDBUCH.
- **Deploy-Status §9 offen:** Beurkundungs-Ausbau (live ja/nein), Vertrags-Varianten (ungepusht).

---
*Erzeugt 28.6.2026 aus ultracode-Klassifizierung der 26 aktiven Fahrpläne. Detailquellen:
die jeweilige `FAHRPLAN-*.md`. Diese Datei ersetzt keine, sie ordnet sie.*
