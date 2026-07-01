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

export const VERFALL_STAND = "7.6.2026";
export const VERFALL_QUELLE = "bibliothek/register/parameter-verfall.md";
export const VERFALL_MANUELL_ANZAHL = 19;

export const VERFALL_TERMINE: VerfallTermin[] = [
  {
    "label": "Fedlex-Re-Pins terminiert: ZGB+ZPO 1.7.2026 (AS 2026 94/16); StGB 12.6.2026 (AS 2026 231) VOLLZOGEN 12.6.2026",
    "datum": "2026-07-01",
    "quelle": "Tabelle",
    "fundstelle": "`scripts/fedlex-cache.sh` ← `normen/fedlex-pin-nachverifikation-2026-06.md`",
    "wert": "Voraus-Check 7.6.2026: KEINE zitierten Artikel betroffen — reine Re-Pins; StGB/ZPO-Dateien liegen als No-Suffix (n=0!). StGB am 12.6.2026 auf 20260612 gepinnt (Anker 477/477 stabil, zitierte Artikel normtext-identisch, nur Art. 354/357 geändert)",
    "rhythmus": "einmalig je Stichtag (`check:caches` + `check:zitate` danach)"
  },
  {
    "label": "Streitwert-Formeln Miete (3-Jahres-Sperrfrist BGE 137 III 389 · 20×-Regel Art. 92 II ZPO) + Ordnungsbussen Art. 343 I lit. b/c (5000/1000)",
    "datum": "2026-07-01",
    "quelle": "Tabelle",
    "fundstelle": "nur Dossier (`recherche/ordentliche-klage-rechtsbegehren.md` § 4.4, § 2 R14) — nicht verdrahtet",
    "wert": "ZPO-Cache 20250101 / BGE",
    "rhythmus": "bei ZPO-Re-Pin (nächster: 1.7.2026, s. Re-Pin-Zeile)"
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
    "label": "Formularpflicht-Kantone (Mietzins)",
    "datum": "2026-11-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/lib/vorlagen/mietvertrag.ts` (`MV_FORMULARPFLICHT`)",
    "wert": "BWO 4.2.2026",
    "rhythmus": "jährlich; BE ändert dynamisch per 1.11.2026"
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
    "label": "Notariats-Anlaufstellen je Kanton (inkl. Listen-PDFs)",
    "datum": "2027-06-01",
    "quelle": "Tabelle",
    "fundstelle": "`src/lib/notariate.ts` ↔ `behoerden/notariate-kantone.md`",
    "wert": "URLs geprüft 7.6.2026; Listen-Stände SZ 4/2026 · OW 5/2026 · NE 1/2026 · GE 6/2025; UR/AI/BL verifiziert 7.6.2026 (System amtlich; Personenlisten teils nur offline)",
    "rhythmus": "jährlich; UR/AI/BL vorab klären"
  }
];
