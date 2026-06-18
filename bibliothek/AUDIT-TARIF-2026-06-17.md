# Tarif-Rechen-Audit 17.6.2026 — Befunde (Regel ↔ satzgebender Gesetzesartikel)

Quelle: 4-Agenten-Fan-out-Audit (Beurkundung, Grundbuch/Notariat,
Gerichtskosten/Schlichtung/Parteientschädigung, nicht-vermögensrechtlich/BGer),
~250 Tarif-Einträge gegen die lokalen Normtext-Snapshots. **Mehrheit (~140+) OK.**
Status: **A nur geflaggt (Hinweis), Fix später (Entscheid David 17.6.2026); B/C
für den späteren Durchgang dokumentiert.** Nichts an der Rechen-`regel` geändert.

## A — Echte Wert-/Norm-Abweichungen (fachliche Klärung David offen)

| # | Eintrag | Datei | regel jetzt | Gesetzestext / Befund |
|---|---|---|---|---|
| 1 | NW Testament `§18 Abs.1 Ziff.1` | beurkundung.ts:114 | staffel_sockel_prozent (0,3‰…, min 400) | §18 Abs.1 = fester **Rahmen 250–2'000**; §20-Promillestaffel gilt laut Abs.2 nur für die *Wertermittlung*. Regel kodiert fälschlich §20-Staffel. |
| 2 | NW Erbvertrag `§18 Abs.3 i.V.m. Abs.1` | beurkundung.ts:142 | dito Staffel | Abs.3 verweist auf Abs.1 = **Rahmen 250–2'000**, nicht Wertstaffel. |
| 3 | UR Parteientschädigung `Art.30` | parteientschaedigung.ts:72 | Staffel | Art.30 GGebR = Anwaltsentschädigung **Strafverfahren** — kodierte Zivilstaffel steht in keinem zitierten Artikel. |
| 4 | VS Schlichtung `Art.15` | schlichtung.ts:219 | 60–120 | Sitzungsgebühr Abs.1b = **120–250** (fr-Volltext gegenprüfen). |
| 5 | GE Schlichtung `Art.15` | schlichtung.ts:242 | Rahmen 100–200 +20% | «+20 % bei mehreren Parteien» steht NICHT in Art.15 (Rahmen 100–200 stimmt). |
| 6 | GE Parteientschädigung `Art.84/85` | parteientschaedigung.ts:364 | ZH-Skala ±10% | Art.85 RTFMC = autonome GE-Prozentstaffel; kein Verweis auf ZH-Skala. |
| 7 | VD Parteientschädigung `Art.3 ff.` | parteientschaedigung.ts:310 | Tranche 2–5 Mio 16'000–80'000 | Staffel in **Art.4** (nicht 3); Gesetz 2–5 Mio = **20'000–100'000**; >5 Mio «40'000 bis 2 %». |
| 8 | AI Schlichtung `Art.7` | schlichtung.ts:150 | flach 50–500 | Art.7 = **200–1000 / 300–1000 / 100–600** (bandabhängig). |
| 9 | TG Gerichtskosten `§11 Ziff.2` | nicht-vermoegensrechtlich.ts:46 | Rahmen 300–**5000** | Snapshot TG-638.1 §11: «300 bis **20'000**». ts-Kommentar nennt 20'000 «Agent-Irrtum» → **Widerspruch klären**. |

## B — Norm-Anker falsch, Werte i.d.R. korrekt (reine Zitatkorrektur)

- VS Notariat/Grundbuch (notariat-grundbuch.ts:124/158): `Art. 96 ch. I` (alte OcRF-Nummerierung) → **Art. 32/33 OcRF** (grundbuch.ts nutzt bereits 32/33; VS-211.611-Snapshot hat nur Art. 1–42).
- AR Beurkundung-Dienstbarkeit: `Art.12` (= «Übrige Gebühren») → Dienstbarkeits-Ziff. (Satz nicht in Art.12).
- ZG Vollmacht: `§9 Nr.95/91` → Werte stehen woanders (Nr.95 = Fr.20 fix, Nr.91 = 100–500).
- JU PE `Art.7` → **Art.13** (Art.7 = Stundenansatz; Wert-Staffel in Art.13, Beträge fehlen im Snapshot).
- VD GK `Art.17` → **Art.18** · NE PE `58` → **59** · BE GK `36` → **+38** (untere Bänder) · SH GK `83` → **81** · ZG PE `§3` (autonome Tabelle, kein ZH-Verweis) · AI PE `9` → **10** · FR PE `64` → **65**.

## C — Snapshot-/Normtext-Lücken (Verifikation blockiert, kein nachgewiesener Fehler)

- **SG GKV sGS 941.12** fehlt komplett im Manifest (Gerichtskosten + Schlichtung) → onboarden.
- **SG GebT sGS 821.5** (Nr.60.xx/70.xx): quelleUrl zeigt auf GB-GebV (914.5)-Snapshot → eigene GebT-Quelle nötig.
- **OW 210.32** fehlt im Manifest.
- **VD-vd-105540.json** trägt thematisch fremden Inhalt (Orchester-Subventionen, it) → falscher Snapshot.
- **SZ 280.411** (Anwaltstarif-PDF) nicht im Manifest.
- Abgeschnittene Sub-Staffeln (Tabellenzellen): LU Schl §4 · SZ PE §8 · OW GK Art.9 · BL GK §8 · AG PE §3 · TG GK §11 · AI/NE Art.14-Tabellen · GL Anhang A1-2.
- GR Schuldbrief `Art.16 Abs.1 lit.i Ziff.1`: lit.i im GR-Snapshot Art.16 nicht ausgewiesen (widersprüchliche Agenten-Lesung) → gezielt gegenprüfen.

## Nicht prüfbar (kein lokaler Snapshot, kein Fehlernachweis)
AR bGS 153.2, UR urilaw/ur.ch-PDF, NW-Anhang-Ziffern, diverse FR/NE-Arrêté-Fixtarife.
