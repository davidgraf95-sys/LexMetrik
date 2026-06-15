// ─── Verfahrens-/Instanz-Modifikatoren der Prozesskosten ────────────────────
//
// FAHRPLAN-PROZESSKOSTEN-COCKPIT I2/I3. Faktor-Spannen RELATIV zur
// erstinstanzlichen ordentlichen Gerichtsgebühr (gk) bzw. zum Grundhonorar (pe);
// 1.0 = unverändert. Angewendet via `skaliereErgebnis` auf den verifizierten
// Basistarif → ehrliche Spanne. SOLL/Provenance: bibliothek/register/
// kosten-modifikatoren-kantone.md (Erstrecherche wbqdyap3x + Re-Verifikation
// wzor6za3b am amtlichen Wortlaut; je Kanton mit Norm). «höchstens X»-Deckel als
// Range (0..X bzw. Untergrenze..X). DIESE SCHICHT IST ERSTRECHERCHE
// (verifiziert: 'recherche' durchgehend) — die zwei Recherchepässe divergierten
// teils; die UI zeigt den «nicht abschliessend verifiziert»-Caveat. Abnahme
// David ausstehend (§7/§8). Basistarife (gerichtskosten/parteientschaedigung)
// sind separat doppelt verifiziert.

import type { KantonCode, Verifiziert } from './typen';

export interface Faktor { gkMin: number; gkMax: number; peMin: number; peMax: number }
export interface KantonModifikatoren {
  vereinfacht: Faktor;
  summarisch: Faktor;
  rechtsmittel: Faktor;
  artikel: string;
  verifiziert: Verifiziert;
}

const f = (gkMin: number, gkMax: number, peMin: number, peMax: number): Faktor => ({ gkMin, gkMax, peMin, peMax });
const EINS = f(1, 1, 1, 1);

export const MODIFIKATOREN: Record<KantonCode, KantonModifikatoren> = {
  ZH: { vereinfacht: EINS, summarisch: f(0.5, 0.75, 0.2, 0.6667), rechtsmittel: f(0.33, 1, 0.2, 1), artikel: 'GebV OG § 8/§ 12; AnwGebV § 9/§ 13', verifiziert: 'recherche' },
  BE: { vereinfacht: EINS, summarisch: f(0.1, 1, 0.3, 0.6), rechtsmittel: f(1, 1.5, 0.2, 0.5), artikel: 'VKD (BSG 161.12); PKV (BSG 168.811)', verifiziert: 'recherche' },
  LU: { vereinfacht: f(0.3, 0.6, 0.75, 1.5), summarisch: f(0.2, 0.5, 0.75, 1.5), rechtsmittel: f(1, 1, 0.5, 1.2), artikel: 'JusKV (SRL 265) §§ 4–8, § 31', verifiziert: 'recherche' },
  UR: { vereinfacht: f(0.5, 0.83, 1, 1), summarisch: f(1, 1, 0.1, 0.5), rechtsmittel: f(1, 1, 0.2, 0.6), artikel: 'GGebR (RB 2.3232) Art. 5–6, 28 ff.', verifiziert: 'recherche' },
  SZ: { vereinfacht: EINS, summarisch: f(1, 1, 0.2, 0.6), rechtsmittel: f(1, 1, 0.2, 0.6), artikel: 'GebO (SRSZ 173.111); GebT (SRSZ 280.411)', verifiziert: 'recherche' },
  OW: { vereinfacht: EINS, summarisch: f(1, 1, 0.5, 0.8), rechtsmittel: f(0.7, 1, 0.2, 1), artikel: 'GebOR (GDB 134.15) Art. 14/35a/36', verifiziert: 'recherche' },
  NW: { vereinfacht: EINS, summarisch: EINS, rechtsmittel: f(0.667, 0.667, 0.2, 0.6), artikel: 'PKoG (NG 261.2)', verifiziert: 'recherche' },
  GL: { vereinfacht: EINS, summarisch: f(0, 0.5, 1, 1), rechtsmittel: EINS, artikel: 'ZSPKoV (GS III A/5) Art. 3 III («höchstens ½»); EG ZPO Art. 20', verifiziert: 'recherche' },
  ZG: { vereinfacht: EINS, summarisch: f(0.333, 0.75, 0.2, 0.5), rechtsmittel: f(1, 1, 0.333, 1), artikel: 'KoV OG (BGS 161.7); V. Anwaltskosten (BGS 163.4)', verifiziert: 'recherche' },
  FR: { vereinfacht: EINS, summarisch: EINS, rechtsmittel: f(0.2, 1, 0.5, 1), artikel: 'RJ (RSF 130.11)', verifiziert: 'recherche' },
  SO: { vereinfacht: EINS, summarisch: EINS, rechtsmittel: EINS, artikel: 'GT (BGS 615.11) § 145/§ 160 (keine verfahrensart-/instanzspezifischen Faktoren)', verifiziert: 'recherche' },
  BS: { vereinfacht: f(1, 1, 0.667, 1), summarisch: f(1, 1, 0.2, 0.667), rechtsmittel: f(1, 1.5, 0.5, 0.667), artikel: 'GGR (SG 154.810); HoR (SG 291.400) § 5', verifiziert: 'recherche' },
  BL: { vereinfacht: EINS, summarisch: f(0.5, 1, 1, 1), rechtsmittel: f(1, 1, 0.5, 1), artikel: 'GebT (SGS 170.31); Tarifordnung (SGS 178.112)', verifiziert: 'recherche' },
  SH: { vereinfacht: EINS, summarisch: f(0, 0.5, 1, 1), rechtsmittel: EINS, artikel: 'JG (SHR 173.200) Art. 83 II («höchstens ½»)', verifiziert: 'recherche' },
  AR: { vereinfacht: EINS, summarisch: EINS, rechtsmittel: EINS, artikel: 'bGS 233.3; Honorarordnung (bGS 145.53)', verifiziert: 'recherche' },
  AI: { vereinfacht: EINS, summarisch: f(1, 1, 0.1, 0.5), rechtsmittel: f(1, 1, 0.2, 0.75), artikel: 'GGV (GS 173.810); AnwHV (GS 177.410) Art. 11/13', verifiziert: 'recherche' },
  SG: { vereinfacht: EINS, summarisch: f(1, 1, 0.1, 0.6), rechtsmittel: f(1, 1, 0.2, 0.75), artikel: 'GKV (sGS 941.12); HonO (sGS 963.75) Art. 16', verifiziert: 'recherche' },
  GR: { vereinfacht: EINS, summarisch: EINS, rechtsmittel: EINS, artikel: 'VGZ (BR 320.210) Pauschale «vor jeder Instanz»; HV (BR 310.250) aufwandbasiert', verifiziert: 'recherche' },
  AG: { vereinfacht: EINS, summarisch: f(1, 1, 0.25, 1), rechtsmittel: f(1, 1, 0.5, 1), artikel: 'GebührD (SAR 662.110); AnwT (SAR 291.150) § 3', verifiziert: 'recherche' },
  TG: { vereinfacht: EINS, summarisch: f(1, 1, 0.1, 0.6), rechtsmittel: f(1.1, 1.5, 0.333, 0.667), artikel: 'VGG (RB 638.1); Honorartarif (RB 176.31)', verifiziert: 'recherche' },
  TI: { vereinfacht: EINS, summarisch: f(0.5, 0.5, 1, 1), rechtsmittel: f(1, 1, 0.3, 0.6), artikel: 'LTG (RL 178.200); Tariffa onorari (RL 178.310) Art. 11 II', verifiziert: 'recherche' },
  VD: { vereinfacht: f(0.55, 0.75, 0.5, 0.7), summarisch: f(0.15, 0.8, 0.2, 0.45), rechtsmittel: f(0.2, 0.55, 0.5, 0.5), artikel: 'TFJC (BLV 270.11.5); TDC (BLV 270.11.6)', verifiziert: 'recherche' },
  VS: { vereinfacht: EINS, summarisch: EINS, rechtsmittel: f(0.6, 1, 0.6, 0.6), artikel: 'GTar/LTar (SR 173.8) Art. 16/32', verifiziert: 'recherche' },
  NE: { vereinfacht: EINS, summarisch: f(0.5, 0.5, 1, 1), rechtsmittel: EINS, artikel: 'LTFrais (RSN 164.1) Art. 12/58 ff.', verifiziert: 'recherche' },
  GE: { vereinfacht: EINS, summarisch: f(1, 1, 0.2, 0.667), rechtsmittel: f(1, 1, 0.333, 0.667), artikel: 'RTFMC (rsGE E 1 05.10) Art. 17/84', verifiziert: 'recherche' },
  JU: { vereinfacht: EINS, summarisch: f(0.3, 1, 0.3, 0.6), rechtsmittel: f(0.3, 1.5, 0.2, 0.5), artikel: 'Décret RSJU 176.511; tarif RSJU 188.61 Art. 7', verifiziert: 'recherche' },
};
