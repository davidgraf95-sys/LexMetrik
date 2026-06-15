# Register — Kantonale Kosten-Modifikatoren (Schlichtung · Verfahren · Instanz)

**Erstellt:** 14.6.2026 · **Re-verifiziert/kuratiert:** 15.6.2026.
**Provenance:** Erstrecherche Workflow `wbqdyap3x` (52 Agenten, Recherche +
Verifikation) + dritte Verifikationsrunde `wzor6za3b` (13 unsichere/auffällige
Kantone, am amtlichen Wortlaut, neueste Fassung). **Faktoren RELATIV** zur
erstinstanzlichen ordentlichen Gerichtsgebühr (GK) bzw. zum Grundhonorar (PE);
1.0 = unverändert. SOLL für `src/data/tarif/modifikatoren.ts` (Werte deckungs-
gleich).

> **Status: ERSTRECHERCHE (nicht abschliessend doppelt verifiziert).** Diese
> Schicht ist fuzzy — die zwei Recherchepässe divergierten bei mehreren Kantonen;
> die Werte sind Richtwert-Spannen, im Code/UI als `verifiziert: 'recherche'`
> mit «nicht abschliessend verifiziert»-Caveat geführt. Abnahme David ausstehend
> (§7/§8). **GR** ist konservativ neutralisiert (Original-Faktoren implausibel,
> z. B. ×0.03 — separat zu verifizieren). «höchstens X»-Deckel als Range
> (0..X bzw. Untergrenze..X). Basistarife (Gerichtskosten/Parteientschädigung)
> sind separat doppelt verifiziert.

Format: **vereinfacht** GK/PE · **summarisch** GK/PE · **Rechtsmittel** GK/PE (Faktor min–max).

| KT | vereinfacht (GK / PE) | summarisch (GK / PE) | Rechtsmittel (GK / PE) | Norm |
|----|----|----|----|----|
| ZH | 1 / 1 | 0.5–0.75 / 0.2–0.667 | 0.33–1 / 0.2–1 | GebV OG § 8/§ 12; AnwGebV § 9/§ 13 |
| BE | 1 / 1 | 0.1–1 / 0.3–0.6 | 1–1.5 / 0.2–0.5 | VKD (BSG 161.12) Art. 36/44–46; PKV (BSG 168.811) |
| LU | 0.3–0.6 / 0.75–1.5 | 0.2–0.5 / 0.75–1.5 | 1 / 0.5–1.2 | JusKV (SRL 265) §§ 4–8, § 31 |
| UR | 0.5–0.83 / 1 | 1 / 0.1–0.5 | 1 / 0.2–0.6 | GGebR (RB 2.3232) Art. 5–6, 28 ff. |
| SZ | 1 / 1 | 1 / 0.2–0.6 | 1 / 0.2–0.6 | GebO (SRSZ 173.111); GebT (SRSZ 280.411) |
| OW | 1 / 1 | 1 / 0.5–0.8 | 0.7–1 / 0.2–1 | GebOR (GDB 134.15) Art. 14/35a/36 |
| NW | 1 / 1 | 1 / 1 | 0.667 / 0.2–0.6 | PKoG (NG 261.2) |
| GL | 1 / 1 | 0–0.5 / 1 | 1 / 1 | ZSPKoV (GS III A/5) Art. 3 III («höchstens ½»); EG ZPO Art. 20 |
| ZG | 1 / 1 | 0.333–0.75 / 0.2–0.5 | 1 / 0.333–1 | KoV OG (BGS 161.7); V. Anwaltskosten (BGS 163.4) |
| FR | 1 / 1 | 1 / 1 | 0.2–1 / 0.5–1 | RJ (RSF 130.11) |
| SO | 1 / 1 | 1 / 1 | 1 / 1 | GT (BGS 615.11) § 145/§ 160 (keine verfahrensart-/instanzspez. Faktoren) |
| BS | 1 / 0.667–1 | 1 / 0.2–0.667 | 1–1.5 / 0.5–0.667 | GGR (SG 154.810); HoR (SG 291.400) § 5 |
| BL | 1 / 1 | 0.5–1 / 1 | 1 / 0.5–1 | GebT (SGS 170.31); Tarifordnung (SGS 178.112) |
| SH | 1 / 1 | 0–0.5 / 1 | 1 / 1 | JG (SHR 173.200) Art. 83 II («höchstens ½») |
| AR | 1 / 1 | 1 / 1 | 1 / 1 | bGS 233.3; Honorarordnung (bGS 145.53) |
| AI | 1 / 1 | 1 / 0.1–0.5 | 1 / 0.2–0.75 | GGV (GS 173.810); AnwHV (GS 177.410) Art. 11/13 |
| SG | 1 / 1 | 1 / 0.1–0.6 | 1 / 0.2–0.75 | GKV (sGS 941.12); HonO (sGS 963.75) Art. 16 |
| GR | 1 / 1 | 1 / 1 | 1 / 1 | VGZ (BR 320.210); HV (BR 310.250) — **neutralisiert (Originalwerte implausibel)** |
| AG | 1 / 1 | 1 / 0.25–1 | 1 / 0.5–1 | GebührD (SAR 662.110); AnwT (SAR 291.150) § 3 |
| TG | 1 / 1 | 1 / 0.1–0.6 | 1.1–1.5 / 0.333–0.667 | VGG (RB 638.1); Honorartarif (RB 176.31) |
| TI | 1 / 1 | 0.5 / 1 | 1 / 0.3–0.6 | LTG (RL 178.200); Tariffa onorari (RL 178.310) Art. 11 II |
| VD | 0.55–0.75 / 0.5–0.7 | 0.15–0.8 / 0.2–0.45 | 0.2–0.55 / 0.5 | TFJC (BLV 270.11.5); TDC (BLV 270.11.6) |
| VS | 1 / 1 | 1 / 1 | 0.6–1 / 0.6 | GTar/LTar (SR 173.8) Art. 16/32 |
| NE | 1 / 1 | 0.5 / 1 | 1 / 1 | LTFrais (RSN 164.1) Art. 12/58 ff. |
| GE | 1 / 1 | 1 / 0.2–0.667 | 1 / 0.333–0.667 | RTFMC (rsGE E 1 05.10) Art. 17/84 |
| JU | 1 / 1 | 0.3–1 / 0.3–0.6 | 0.3–1.5 / 0.2–0.5 | Décret RSJU 176.511; tarif RSJU 188.61 Art. 7 |

**Offen (vor Abnahme zu klären):** GR-Modifikatoren (neutralisiert) eigens
erheben; LU-PE-Spanne (75–150 % der Gebühr) und BE-Rechtsmittel-GK-Zuschlag
(×1.5) am Wortlaut bestätigen; «höchstens»-Untergrenzen (GL/SH summ GK 0)
fachlich prüfen.
