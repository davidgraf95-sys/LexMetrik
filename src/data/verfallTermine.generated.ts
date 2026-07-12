// ─── GENERIERT aus bibliothek/register/parameter-verfall.md via `npm run gen:verfall` ──────────
// NICHT von Hand editieren. Quelle (SSoT §5) ist das Register; Drift-Tor:
// `npm run check:verfall-ui`. Der Tagesbezug (verfallen/fällig) entsteht
// erst in der Anzeige-Schicht (Methodik-Seite), nicht hier.

export type VerfallTermin = {
  label: string;
  datum: string; // ISO YYYY-MM-DD
  quelle: 'Tabelle' | 'Freitext';
  fundstelle?: string;
  wert?: string;
  rhythmus?: string;
};

export const VERFALL_STAND = "11.7.2026";
export const VERFALL_QUELLE = "bibliothek/register/parameter-verfall.md";
export const VERFALL_MANUELL_ANZAHL = 20;

export const VERFALL_TERMINE: VerfallTermin[] = [
  {
    "label": "Künftige Fassung AVIV (SR 837.02)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (AVIV)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BüV (SR 141.01)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BUEV)",
    "wert": "gepinnt 9.7.2019",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BVV 2 (SR 831.441.1)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BVV_2)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung FZV (SR 831.425)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (FZV)",
    "wert": "gepinnt 1.3.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung KLV (SR 832.112.31)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (KLV)",
    "wert": "gepinnt 1.7.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung KVV (SR 832.102)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (KVV)",
    "wert": "gepinnt 1.7.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung LRV (SR 814.318.142.1)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (LRV)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung USG (SR 814.01)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (USG)",
    "wert": "gepinnt 1.4.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VVEA (SR 814.600)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VVEA)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung ZEMIS-V (SR 142.513)",
    "datum": "2026-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (ZEMIS_V)",
    "wert": "gepinnt 12.6.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Hypothekarischer Referenzzinssatz",
    "datum": "2026-09-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/lib/vorlagen/mietvertrag.ts` (`MV_PARAMETER.referenzzinssatz`)",
    "wert": "1.25 % (Stand 2.6.2026)",
    "rhythmus": "quartalsweise (referenzzinssatz.admin.ch)"
  },
  {
    "label": "Künftige Fassung BankG (SR 952.0)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BANKG)",
    "wert": "gepinnt 1.1.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BBG (SR 412.10)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BBG)",
    "wert": "gepinnt 1.3.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BBV (SR 412.101)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BBV)",
    "wert": "gepinnt 1.3.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BEG (SR 957.1)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BEG)",
    "wert": "gepinnt 1.1.2023",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung FIDLEG (SR 950.1)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (FIDLEG)",
    "wert": "gepinnt 1.3.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung FINIG (SR 954.1)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (FINIG)",
    "wert": "gepinnt 1.3.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung GwG (SR 955.0)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (GWG)",
    "wert": "gepinnt 1.3.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung HRegV (SR 221.411)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (HREGV)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung KAG (SR 951.31)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (KAG)",
    "wert": "gepinnt 1.3.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung OR (SR 220)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (OR)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung StGB (SR 311.0)",
    "datum": "2026-10-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (STGB)",
    "wert": "gepinnt 12.6.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Formularpflicht-Kantone (Mietzins)",
    "datum": "2026-11-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/lib/vorlagen/mietvertrag.ts` (`MV_FORMULARPFLICHT`)",
    "wert": "BWO 4.2.2026",
    "rhythmus": "jährlich; BE ändert dynamisch per 1.11.2026"
  },
  {
    "label": "Künftige Fassung ChemRRV (SR 814.81)",
    "datum": "2026-12-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (CHEMRRV)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "BE EAV (BSG 168.711, amtliche Anwälte): bis 31.12.2026 (Nachfolge 1.1.2027).",
    "datum": "2026-12-31",
    "quelle": "Freitext"
  },
  {
    "label": "GR Honorarverordnung (HV, BR 310.250): bis 31.12.2026 (Nachfolge 1.1.2027).",
    "datum": "2026-12-31",
    "quelle": "Freitext"
  },
  {
    "label": "AHV/IV/EO Selbständige (Satz, sinkende Skala) + Bundes-Verzugszinsen",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "nur Dossiers (`gesellschaftsgruendung.md` Teil 5; `recherche/INDEX.md`-Nachträge) — nicht verdrahtet",
    "wert": "10,0 % / Skala < CHF 60'500 (Merkblatt 2.02, 2026); EFD 4,0 %",
    "rhythmus": "jährlich + vor Verdrahtung"
  },
  {
    "label": "Betreibungsämter-Stammdaten 26 Kt. (130 Kreis-Ämter in 13 Kt. + 10 Einheitsämter, Gemeinde-Karten 11 Kt.)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/data/betreibungsaemter.ts` + `src/data/betreibung/aemterKantone.json` ↔ `behoerden/betreibungskreise-kantone.md` — VERDRAHTET 7.6.2026 (Etappen 1–3)",
    "wert": "Extraktion + adversariale Stichproben 7.6.2026; gemeindescharf: ZH/FR/SO/AR/GR/TG/TI/VD/ZG/UR/SZ. Verzeichnis-Link (keine belastbare Liste, §8): LU (gerichte.lu.ch→Verbands-Plattform, Fusionen) · AG (~14/19 Kreise, Verbands-URL tot) · SG (Negativbefund: kein amtl. Verzeichnis) · ZG-PDF Stand 2/2023 (jüngste amtl. Gesamtliste) · BE: «Avenir Berne romande» (Moutier 1.1.2026 → Jura/Biel-Umzüge bis ~2029)",
    "rhythmus": "jährlich; ZH bei Kreis-Reorganisation KOMPLETT neu; ZG-PDF + AG/LU bei amtlicher Gesamtliste nachziehen"
  },
  {
    "label": "Emissionsabgabe (1 %, Freibetrag CHF 1 Mio.)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`gruendungsunterlagen.ts` (`emissionsabgabe`, `EMISSIONSABGABE_FREIBETRAG_CHF`)",
    "wert": "Art. 6 Abs. 1 lit. h / 8 Abs. 1 StG @ 1.1.2024 (Cache)",
    "rhythmus": "jährlich — politisch volatil (Abschaffungs-Vorlagen)"
  },
  {
    "label": "Fedlex-Re-Pins terminiert: ZGB+ZPO 1.7.2026 VOLLZOGEN 1.7.2026 (AS 2026 94/16); StGB 12.6.2026 (AS 2026 231) VOLLZOGEN 12.6.2026",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` ← `normen/fedlex-pin-nachverifikation-2026-06.md`",
    "wert": "ZGB→20260701/html-1 (FALLE: n=0 ist STALE ohne AS 2026 94 art_302 — nur html-1 kanonisch; 6 Anker byte-identisch, Inventar 1099→1099). ZPO→20260701/no-suffix (14 Anker operativ byte-identisch, art_314 nur Fussnoten-Reklassifikation; neu art_260a/b). Volltext-Snapshots + Struktur + Manifest gezielt regeneriert (`--erlass=zgb,zpo`), Engine-golden byte-gleich, adversarial QS-GP. `check:caches`/`check:zitate` grün 1.7.2026",
    "rhythmus": "einmalig je Stichtag (`check:caches`+`check:zitate`+ggf. `normtext --erlass`)"
  },
  {
    "label": "HReg-Gebühren (Neueintragung 420/280/210 …)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/lib/gruendungsunterlagen.ts` + Masken-/Mappen-Texte",
    "wert": "GebV-HReg-Anhang @ 1.1.2021 (einzige Konsolidierung, Cache)",
    "rhythmus": "jährlich (Verordnungs-Pauschalen)"
  },
  {
    "label": "Kantonale Mindestlöhne",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/lib/vorlagen/arbeitsvertrag.ts` (`AV_MINDESTLOEHNE`)",
    "wert": "je Eintrag datiert",
    "rhythmus": "jährlich (Indexierung per 1.1.)"
  },
  {
    "label": "Künftige Fassung AIG (SR 142.20)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (AIG)",
    "wert": "gepinnt 12.6.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung AsylG (SR 142.31)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (ASYLG)",
    "wert": "gepinnt 12.6.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BankV (SR 952.02)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BANKV)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BPG (SR 172.220.1)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BPG)",
    "wert": "gepinnt 1.1.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BPV (SR 172.220.111.3)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BPV)",
    "wert": "gepinnt 1.7.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung DesV (SR 232.121)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (DESV)",
    "wert": "gepinnt 1.7.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung EBG (SR 742.101)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (EBG)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung EnG (SR 730.0)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (ENG)",
    "wert": "gepinnt 1.4.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung ERV (SR 952.03)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (ERV)",
    "wert": "gepinnt 24.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung FINMA-GebV (SR 956.122)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (FINMA_GEBV)",
    "wert": "gepinnt 1.3.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung FINMAG (SR 956.1)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (FINMAG)",
    "wert": "gepinnt 1.4.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung HMG (SR 812.21)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (HMG)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung IVG (SR 831.20)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (IVG)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung MSchV (SR 232.111)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (MSCHV)",
    "wert": "gepinnt 1.7.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung MWSTV (SR 641.201)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (MWSTV)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung PatG (SR 232.14)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (PATG)",
    "wert": "gepinnt 1.7.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung RVOV (SR 172.010.1)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (RVOV)",
    "wert": "gepinnt 1.3.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VG (SR 170.32)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VG)",
    "wert": "gepinnt 15.6.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VGG (SR 173.32)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VGG)",
    "wert": "gepinnt 12.6.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VwVG (SR 172.021)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VWVG)",
    "wert": "gepinnt 1.7.2022",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VZV (SR 741.51)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VZV)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "ZH-Betreibungskreis-Reorganisation (56 → 34 oder 18 Kreise)",
    "datum": "2027-01-01",
    "quelle": "Tabelle",
    "fundstelle": "nur Dossier (`behoerden/betreibungskreise-kantone.md`) — nicht verdrahtet",
    "wert": "RR-Beschluss/Vernehmlassung 5.11.2025, NOCH NICHT in Kraft; aktuell massgeblich: Ämterliste Betreibungsinspektorat",
    "rhythmus": "halbjährlich bis Inkrafttreten; danach Ämterliste + ZH-Zuordnung komplett neu erfassen"
  },
  {
    "label": "BWO-Verzeichnis Miet-Schlichtungsbehörden",
    "datum": "2027-02-01",
    "quelle": "Tabelle",
    "fundstelle": "noch nicht verdrahtet (Bibliothek: `schlichtungsbehoerden-kantone.md`)",
    "wert": "PDF-Stand 13.02.2026",
    "rhythmus": "jährlich"
  },
  {
    "label": "Künftige Fassung BVV 3 (SR 831.461.3)",
    "datum": "2027-06-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BVV3)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Notariats-Anlaufstellen je Kanton (inkl. Listen-PDFs)",
    "datum": "2027-06-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/lib/notariate.ts` ↔ `behoerden/notariate-kantone.md`",
    "wert": "URLs geprüft 7.6.2026; Listen-Stände SZ 4/2026 · OW 5/2026 · NE 1/2026 · GE 6/2025; UR/AI/BL verifiziert 7.6.2026 (System amtlich; Personenlisten teils nur offline)",
    "rhythmus": "jährlich; UR/AI/BL vorab klären"
  },
  {
    "label": "Künftige Fassung BVG (SR 831.40)",
    "datum": "2027-09-26",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BVG)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung EOV (SR 834.11)",
    "datum": "2028-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (EOV)",
    "wert": "gepinnt 1.6.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung GSchV (SR 814.201)",
    "datum": "2028-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (GSCHV)",
    "wert": "gepinnt 1.12.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung KVG (SR 832.10)",
    "datum": "2028-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (KVG)",
    "wert": "gepinnt 1.7.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung FAV (SR 784.101.2)",
    "datum": "2028-07-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (FAV)",
    "wert": "gepinnt 15.8.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BV (SR 101)",
    "datum": "2029-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BV)",
    "wert": "gepinnt 3.3.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung DBG (SR 642.11)",
    "datum": "2029-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (DBG)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung ELG (SR 831.30)",
    "datum": "2029-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (ELG)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung FinfraG (SR 958.1)",
    "datum": "2029-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (FINFRAG)",
    "wert": "gepinnt 1.2.2024",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung StHG (SR 642.14)",
    "datum": "2029-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (STHG)",
    "wert": "gepinnt 1.1.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung BetmG (SR 812.121)",
    "datum": "2029-08-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (BETMG)",
    "wert": "gepinnt 1.9.2023",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VRV (SR 741.11)",
    "datum": "2031-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VRV)",
    "wert": "gepinnt 1.7.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VTS (SR 741.41)",
    "datum": "2031-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VTS)",
    "wert": "gepinnt 1.7.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung GlG (SR 151.1)",
    "datum": "2032-07-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (GLG)",
    "wert": "gepinnt 1.7.2020",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung VKL (SR 832.104)",
    "datum": "2032-07-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (VKL)",
    "wert": "gepinnt 1.6.2025",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung AHVG (SR 831.10)",
    "datum": "2034-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (AHVG)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  },
  {
    "label": "Künftige Fassung AHVV (SR 831.101)",
    "datum": "2034-01-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` (AHVV)",
    "wert": "gepinnt 1.1.2026",
    "rhythmus": "einmalig — Fedlex-Konsolidierung, dann re-pinnen (§7)"
  }
];
