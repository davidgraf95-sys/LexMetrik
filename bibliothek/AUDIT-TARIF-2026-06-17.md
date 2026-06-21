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

---

# AUFLÖSUNG 22.6.2026 (doppelte Norm-Verifikation: lokaler Snapshot + amtliche API/PDF je Fall)

Band A vollständig re-verifiziert (7 Verifikations-Agenten, je 2 unabhängige Quellen)
und umgesetzt; danach §6-Tore grün (tsc · 2049 Tests · lint · golden byte-gleich)
+ zwei adversariale Bug-Checks (Engine via vite-node nachgerechnet · Daten-/Zitat-
Integrität). Alle PRÜFEN-Flags entfernt (0 im Tarif-Ordner). Geänderte Einträge auf
`verifiziert: 'recherche'` gestuft (Davids Abnahme [[abnahme-david-selbst]] offen).

## A — erledigt
| # | Fall | Verifiziertes Urteil | Fix |
|---|---|---|---|
| 1+2 | NW Testament/Erbvertrag | **Audit war FALSCH**: §18 Abs.1 Ziff.1 lit.a–e = Promillestaffel 3/2,5/1,5/1/0,5‰, min 400; Rahmen 250–2'000 gilt nur Ziff.2 (Abänderung). Code-Staffel korrekt. Falschbefund stammte aus **defektem Snapshot** (NW-268.12 ohne Sub-Staffel). | Regel behalten, falschen PRÜFEN-Hinweis aufgelöst (beurkundung.ts) |
| 3 | UR PE | Werte = exakt Art. 28 Abs.1 lit.a–f GGebR; Art.30 = Strafverfahren | Anker → `Art. 28 Abs. 1 (i.V.m. Art. 29, 34)` |
| 4 | GE PE | kein Rechenfehler: ZH_SKALA tranchengleich mit autonomer Art.85 RTFMC | eigene `GE_STAFFEL`-Konstante (§4), Etikett korrigiert |
| 5 | VD PE | Bänder alle korrekt; Anker Art.4 (nicht 3); >5 Mio-Obergrenze «2 %» fehlte | Anker → Art.4, `maxProzent: 2` ergänzt |
| 6 | VS Schlichtung | Art.15 LTar: citation 50–100 + séance 120–250 (170–350); Kleinwert/Vorschlag 60–500 | Rahmen 50–500 (Umschlag) + Bänder im hinweis; stand→1.1.2025 |
| 7 | GE Schlichtung | kein «+20 %»; deterministischer Forfait ≤30k→100, >30k→200 | `staffel_inklusiv` (deterministisch); stand→1.7.2025 |
| 8 | AI Schlichtung | Art.7 GGV verfahrensabh. 200–1000 / 300–1000 / 100–600 (lit.a aufgehoben) | Rahmen 100–1000 (Umschlag) + Bänder im hinweis |
| 9 | TG GK | amtlich **300–20'000** (Snapshot + API), nicht 5'000; «Agent-Irrtum»-Kommentar war selbst der Irrtum | Wert 5000→20'000; Kommentar umgedreht; stand→1.1.2022 |
| — | ZG Nr.91/95 | Code bereits korrekt (Nr.95=100–300, Nr.91=100–500); alte «20 fix»-Lesung falsch | nichts |

## B — Anker
- UR/VD: erledigt (oben). VS-Notariat (Art.32 OcRF), PE-Anker (NE/BE/SH/AI/FR/ZG/JU),
  GK-Anker (BE «Art.36 (Art.38 …)», SH «Art.83 (i.V.m. Art.81)», VD «Art.18 (i.V.m. Art.17)»):
  bereits in früheren Sessions gesetzt, bestätigt.
- **AR bGS 153.2 — ERLEDIGT 22.6.:** **27** Einträge umgeankert «Art. 12 Ziff. N.M» →
  «Anhang Ziff. N.M» (8× grundbuch.ts, 16× beurkundung.ts, 3× notariat-grundbuch.ts; der
  Befund war breiter als die ursprünglich gemeldeten 9 — auch alle 5.x-Beurkundungs-Anker).
  Zusätzlich grundbuch/notariat-AR-`quelleUrl` «…/app/…/153.2» → «…/api/…/1203/pdf_file»
  (sonst kein Manifest-Mapping → keine Auflösung); zwei Anker um konkurrierendes «vgl.
  Art. 830/647 OR» bereinigt (sonst greift parsePassus den OR-Artikel). End-to-end
  verifiziert: 27/27 lösen auf (parsePassus→Token→Manifest→Snapshot). Rechenwerte unberührt.

## C — Snapshot-/Adapter-Lücken — Adapter-Bugs behoben + neu gezogen (22.6.)
- **NW-LexWork-Adapter** (`adapter-lexwork.ts`): zweite Verschachtelung (Ziff.→lit.) rendert
  LexWork mit zwei `td.number` (leerer Spacer + echte Marke) → nur die erste gelesen → item
  verworfen. Fix: alle `td.number`, letzte nicht-leere. Regressionstest ergänzt. → **NW-268.12
  §18 Sub-Staffel lit.a–g wiederhergestellt** (löste auch A-1/2 auf); Nebengewinn: NW-521.1/261.2
  verschachtelte Unterpunkte vervollständigt.
- **AR-PDF-Adapter** (`adapter-pdf.ts`): `bodyMinX` pro Seite → linksstehende Tarif-Ziffer auf
  tief eingerückten Anhang-Seiten fiel unter die Marginalien-Schwelle. Fix: `istAnhangZifferLinks`
  (mehrstufige Ziffer ≤45pt links, erste Komponente ≤99 gegen SR-Nummern/Beträge) — exportiert +
  unit-getestet. → **AR-1203 8.1–8.4 erfasst**; Nebengewinn: AR-621.11 (Steuertarif-Tabellen)
  vervollständigt.
- **Gezielte Regenerierung**: neuer Generator-Modus `npm run normtext -- --nur=kanton --kanton=AR,NW`
  (nur Ziel-Kantone neu ziehen, Golden gemischt, §8: fehlgeschlagene Ziel-Kantone behalten
  Altbestand). Golden-Diff: +4 (AR 8.1–8.4), 16 changed (alle AR/NW, inhaltlich als wiederhergestellte
  Items verifiziert), **0 Nicht-AR/NW** betroffen.
### C-Onboarding 22.6. (Forts.) — 4 von 5 erledigt
- **SZ 280.411 + VD-105540: bereits gelöst** (Audit war veraltet; der 19.6.-Regen hatte beide
  behoben — SZ-280.411.json valide; «105540» war ein Zahlendreher für 105539=TFJC, inhaltlich
  korrekt). Doppelt verifiziert, kein Handlungsbedarf.
- **SG GebT sGS 821.5 — ERLEDIGT:** 14 GebT-Einträge (beurkundung.ts) quelleUrl von der
  GB-GebV-PDF (versions/2935) auf die GebT-PDF (versions/3849) umgestellt (GB-GebV-Einträge
  bleiben korrekt auf 2935); ein konkurrierendes «Art. 772 ff. OR» aus einem Anker getrimmt.
  Neuer Snapshot SG-3849.json (611 Art.), 14/14 lösen end-to-end auf.
- **SG GKV sGS 941.12 — ERLEDIGT:** 4 Einträge (gerichtskosten/schlichtung/nicht-vermoegens.)
  von der xhtml-losen /app-URL auf die PDF (versions/2808, olexAt) umgestellt. Neuer Snapshot
  SG-2808.json (34 Art.). Golden-Diff nur SG (+645, 0 fremde).
- **OW 210.32 — ZURÜCKGESTELLT (einziges offenes C-Item):** quelleUrl der ~22 OW-Einträge müsste
  von /app auf api/de/versions/256/pdf_file; braucht ZUSÄTZLICH (a) eine olexHosts-Inventar-Zeile
  `{ kanton:'OW', muster:/gdb\.ow\.ch\/api\/de\/versions\/\d+\/pdf_file/, profil:'olexAt' }` und
  (b) eine Stand-Fallback-Mechanik, weil das OW-PDF KEINEN «(Stand …)»-Kopf trägt (leseOrdolexStand
  → "" → §7-Stand-Pflicht verletzt). Sauber nur mit kleinem Generator-Touch (Stand aus LexWork
  current_version injizieren) — bewusst nicht im Blind-Autonomlauf gemacht.
- **VS-173.8** `stand`-Feld «2011» hinkt 1.1.2025 nach (nur Datum, Text aktuell) — beim nächsten VS-Regen mitziehen.
