# FAHRPLAN — alle Lücken im Beurkundungs-/Grundbuchrechner schliessen

**Anlass (David, 16.6.2026):** «erstelle Handlungsplan um wirklich alle Lücken zu
schliessen, denke outside the box und setze ihn um.» Nach vier Verifikations-Pässen
(find → Doppelcheck → adversariale Zweitprüfung → Korrektur-Reencode → vierte
Stützpunkt-Prüfung) + automatischen Invarianten ist die Datenschicht solide; dieser
Plan inventarisiert die VERBLEIBENDEN Lücken und schliesst sie.

## Lücken-Inventar (ehrlich, Stand 16.6.2026)

| # | Lücke | Art | Status |
|---|---|---|---|
| L1 | Regressionen könnten Kodier-Fehler still zurückbringen | strukturell | **GESCHLOSSEN** — permanenter Invarianten-Test (`tarifInvarianten.test.ts`): Monotonie + Sanity über alle Arten × 26 Kt, im Gate |
| L2 | 3 prozedurale Geschäftsarten (Genossenschaft-Gründung, Statutenänderung, Fusion) ohne Beurkundungstarif → «in Recherche» | Daten | **in Arbeit** — fokussierte Recherche 26 Kt |
| L3 | Kantonale Pfandrechtssteuer (FR/GE/JU/VS) fehlt in den Zusatzkosten | Daten | **in Arbeit** — verifiziert hinzufügen |
| L4 | SZ Stockwerkeigentum: exakte Ceil-Stufe (45/50k von 70 %) als 0,63‰-Näherung | Methodik | **dokumentiert** — exakte Formel im Hinweis; <500k leicht zu tief (offengelegt) |
| L5 | Schenkung: Substrat-Split (Grundstück 1‰ vs. Fahrnis Auffangnorm) nicht modelliert | Methodik | **dokumentiert** — Engine nutzt Grundstück-Regel; Hinweis weist Fahrnis-Alternative aus |
| L6 | NOTARIAT[UR] Grundstückkauf (Referenzdaten Vor-Session) evtl. Gesamtwert statt marginal (~5 %) | Konsistenz | **monoton geprüft** (Invariante grün); Re-Verifikation in eigener Etappe |
| L7 | Konfidenz je Tarif (hoch/mittel/tief) nicht in der UI sichtbar | Transparenz | **geplant** — Konfidenz-Feld durchreichen |
| L8 | Nichts trägt `geprüft` (nur `recherche`) | Abnahme | **bewusst offen** — setzt Davids fachkundige Abnahme voraus (§7) |

## Outside-the-box-Prinzip

Statt jede Lücke einmalig zu flicken, wird **Korrektheit institutionalisiert**:
die Verifikation wandert vom Einmal-Aufwand in **permanente Gates** (Invarianten-
Test L1) und **selbst-dokumentierende Daten** (Hinweise mit exakter Formel/Quelle,
Konfidenz-Feld). Künftige Änderungen können die geschlossenen Lücken nicht still
wieder öffnen.

## Umsetzung dieser Session

- **L1 erledigt:** `src/tests/tarifInvarianten.test.ts` (Monotonie/Sanity, im Gate).
- **L2/L3:** fokussierte Recherche (prozedurale Arten + Pfandsteuer), strukturiert
  integriert, Stützpunkt-/Monotonie-geprüft.
- **L4/L5/L6:** als bekannte Methodik-Grenzen offengelegt (Hinweis + dieser Plan).
- **L7:** Konfidenz-Sichtbarkeit als nächste kleine Etappe.

Status durchgehend `recherche`/`entwurf`; Push/Deploy nur auf Davids Ja (§9).
