// ─── Materialien-Register: SSoT für amtliche Ressourcen (Soft-Law) ──────────
//
// Welche Behörden-Publikationen gibt es, und wie sind sie eingeordnet? Reine
// Daten (§3) — KEIN Normtext (der lebt in den Gesetzes-Snapshots, §7), KEINE
// Rechtslogik. Aus diesem Register generiert scripts/materialien/material-
// manifest.ts das Browse-Manifest public/materialien/register.json.
//
// P0 (27.6.2026, Nacht-Session): ALLE Einträge sind 'nur-live-link' — die Karte/
// Detailseite zeigt nur bibliografische Metadaten + prominenten Live-Link zur
// amtlichen Quelle (kein gespeicherter Inhalt, kein Extraktionsrisiko, §7/§8).
// Massgeblich bleibt stets die amtliche Quelle. pdf-embed/volltext sind als
// Status getypt, aber bewusst NICHT über Nacht bestückt (kein Massen-PDF-Import).
//
// Quellen-Provenienz: jede Angabe (URL, Stand, Nummer) entstammt der Fan-out-
// Recherche vom 27.6.2026 (doppelt verifiziert), abgelegt in
// bibliothek/materialien/. Wo der amtliche Direkt-PDF-Pfad bei Revisionen
// wechselt (DAM-Hash) ODER nur über eine Listenseite erreichbar ist, verlinkt
// quelleUrl die STABILE amtliche Verzeichnis-/Dokumentseite; ein hinweis hält das
// fest. Abnahme-Zeitsperre: alles maschinell kuratiert, fachlich NICHT geprüft
// (TODO David, Welle ab 1.12.2026).

import type {
  Behoerde, BehoerdeId, Doktyp, DoktypId, MaterialRegistereintrag,
} from './typen';

// ── Behörden (Herausgeber) — rang = Praxisrelevanz für eine CH-Allgemeinkanzlei ─
export const BEHOERDEN: ReadonlyArray<Behoerde> = [
  { id: 'ESTV', kuerzel: 'ESTV', name: 'Eidgenössische Steuerverwaltung', rang: 1 },
  { id: 'EDOEB', kuerzel: 'EDÖB', name: 'Eidg. Datenschutz- und Öffentlichkeitsbeauftragter', rang: 2 },
  { id: 'SECO', kuerzel: 'SECO', name: 'Staatssekretariat für Wirtschaft', rang: 3 },
  { id: 'BSV', kuerzel: 'BSV', name: 'Bundesamt für Sozialversicherungen', rang: 4 },
  { id: 'BJ', kuerzel: 'EHRA', name: 'Eidg. Amt für das Handelsregister (Bundesamt für Justiz)', rang: 5 },
  { id: 'FINMA', kuerzel: 'FINMA', name: 'Eidgenössische Finanzmarktaufsicht', rang: 6 },
  { id: 'IGE', kuerzel: 'IGE', name: 'Eidg. Institut für Geistiges Eigentum', rang: 7 },
];

export const BEHOERDE_RANG: Record<BehoerdeId, number> = Object.fromEntries(
  BEHOERDEN.map((b) => [b.id, b.rang]),
) as Record<BehoerdeId, number>;

export function behoerdeVon(id: BehoerdeId): Behoerde {
  const b = BEHOERDEN.find((x) => x.id === id);
  if (!b) throw new Error(`materialien/register: unbekannte Behörde ${id}`);
  return b;
}

// ── Dokumenttypen ────────────────────────────────────────────────────────────
export const DOKTYPEN: ReadonlyArray<Doktyp> = [
  { id: 'kreisschreiben', label: 'Kreisschreiben' },
  { id: 'rundschreiben', label: 'Rundschreiben' },
  { id: 'mwst-info', label: 'MWST-Info' },
  { id: 'wegleitung', label: 'Wegleitung' },
  { id: 'leitfaden', label: 'Leitfaden' },
  { id: 'merkblatt', label: 'Merkblatt' },
  { id: 'checkliste', label: 'Checkliste' },
  { id: 'richtlinie', label: 'Richtlinie' },
  { id: 'anleitung', label: 'Anleitung' },
  { id: 'taetigkeitsbericht', label: 'Tätigkeitsbericht' },
  { id: 'mitteilung', label: 'Praxismitteilung' },
];

export const DOKTYP_LABEL: Record<DoktypId, string> = Object.fromEntries(
  DOKTYPEN.map((d) => [d.id, d.label]),
) as Record<DoktypId, string>;

// ── Material-Register (P0) — gruppiert nach Behörde, rang aufsteigend ─────────
//
// Hilfs-Konstruktor: hält die Einträge knapp und erzwingt 'nur-live-link' für P0.
function liveLink(
  key: string, behoerde: BehoerdeId, doktyp: DoktypId, titel: string,
  opts: {
    nummer?: string; rechtsgebiet: MaterialRegistereintrag['rechtsgebiet'];
    sprache?: MaterialRegistereintrag['sprache']; quelleUrl: string; stand: string;
    rang: number; normKeys?: string[]; hinweis?: string;
  },
): MaterialRegistereintrag {
  return {
    key, behoerde, doktyp, titel,
    nummer: opts.nummer,
    rechtsgebiet: opts.rechtsgebiet,
    sprache: opts.sprache ?? 'de',
    status: 'nur-live-link',
    quelleUrl: opts.quelleUrl,
    stand: opts.stand,
    rang: opts.rang,
    normKeys: opts.normKeys,
    hinweis: opts.hinweis,
  };
}

// Stabile amtliche Verzeichnis-Anker (ESTV/BJ/FINMA: Direkt-PDF-Pfade wechseln bei
// Revision → die Slug-/Listenseite ist die robustere Referenz, vgl. Recherche).
const ESTV_KS_DBST = 'https://www.estv.admin.ch/de/kreisschreiben-direkten-bundessteuer';
const ESTV_RS_VSTG = 'https://www.estv.admin.ch/de/rundschreiben-verrechnungssteuer';
const ESTV_MWST = 'https://www.gate.estv.admin.ch/mwst-webpublikationen/public';
const ESTV_VZ_HINWEIS = 'Verlinkt das amtliche ESTV-Verzeichnis; der Direkt-PDF-Pfad wechselt bei Revision. Dokument über Nummer/Stand identifizieren.';

export const MATERIAL_REGISTER: ReadonlyArray<MaterialRegistereintrag> = [
  // ── ESTV — Steuern (Verwaltungsverordnungen, faktischer Praxisstandard) ────
  liveLink('ESTV-KS-DBG-5A', 'ESTV', 'kreisschreiben', 'Umstrukturierungen', {
    nummer: 'Nr. 5a', rechtsgebiet: 'sozial-abgaben', quelleUrl: ESTV_KS_DBST,
    stand: '2022-02-01', rang: 1, normKeys: ['DBG', 'FUSG'], hinweis: ESTV_VZ_HINWEIS,
  }),
  liveLink('ESTV-KS-DBG-37', 'ESTV', 'kreisschreiben', 'Mitarbeiterbeteiligungen', {
    nummer: 'Nr. 37', rechtsgebiet: 'sozial-abgaben', quelleUrl: ESTV_KS_DBST,
    stand: '2020-10-30', rang: 2, normKeys: ['DBG', 'OR'], hinweis: ESTV_VZ_HINWEIS,
  }),
  liveLink('ESTV-KS-DBG-6A', 'ESTV', 'kreisschreiben', 'Verdecktes Eigenkapital (Art. 65 DBG)', {
    nummer: 'Nr. 6a', rechtsgebiet: 'sozial-abgaben', quelleUrl: ESTV_KS_DBST,
    stand: '2024-10-10', rang: 3, normKeys: ['DBG'], hinweis: ESTV_VZ_HINWEIS,
  }),
  liveLink('ESTV-KS-DBG-32A', 'ESTV', 'kreisschreiben', 'Sanierung von Kapitalgesellschaften und Genossenschaften', {
    nummer: 'Nr. 32a', rechtsgebiet: 'sozial-abgaben', quelleUrl: ESTV_KS_DBST,
    stand: '2025-01-20', rang: 4, normKeys: ['DBG', 'FUSG'], hinweis: ESTV_VZ_HINWEIS,
  }),
  liveLink('ESTV-RS-VSTG-218', 'ESTV', 'rundschreiben', 'Zinssätze 2026 für Vorschüsse/Darlehen in Schweizer Franken (Safe-Haven)', {
    nummer: 'Nr. 218', rechtsgebiet: 'sozial-abgaben', quelleUrl: ESTV_RS_VSTG,
    stand: '2026-01-29', rang: 5, normKeys: ['VSTG', 'DBG'],
    hinweis: 'Jährlich neu publizierte Mindestzinssätze; verlinkt das amtliche Rundschreiben-Verzeichnis der ESTV.',
  }),
  liveLink('ESTV-MWST-INFO-09', 'ESTV', 'mwst-info', 'MWST-Info 09 — Vorsteuerabzug und Vorsteuerkorrekturen', {
    nummer: 'MWST-Info 09', rechtsgebiet: 'sozial-abgaben', quelleUrl: ESTV_MWST,
    stand: '2025-10-31', rang: 6, normKeys: ['MWSTG'],
    hinweis: 'Webbasierte MWST-Publikation (laufend versioniert); verlinkt das amtliche MWST-Portal der ESTV.',
  }),

  // ── EDÖB — Datenschutz (revDSG-Praxis; alle DAM-PDF direkt verifiziert) ─────
  liveLink('EDOEB-LEITFADEN-REVDSG', 'EDOEB', 'leitfaden', 'Das neue Datenschutzgesetz aus Sicht des EDÖB (Gesamtleitfaden zum revDSG)', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/dokumentation-datenschutz',
    stand: '2022-10-09', rang: 1, normKeys: ['DSG'],
    hinweis: 'Behördenleitfaden, kein Gesetzesrang; FR/IT-Fassungen vorhanden.',
  }),
  liveLink('EDOEB-ANLEITUNG-AUSLAND', 'EDOEB', 'anleitung', 'Anleitung für die Prüfung der Zulässigkeit von Datenübermittlungen ins Ausland', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/bekanntgabe-von-personendaten-ins-ausland',
    stand: '2023-05-10', rang: 2, normKeys: ['DSG'],
  }),
  liveLink('EDOEB-SCC', 'EDOEB', 'anleitung', 'Übermittlung von Personendaten ins Ausland — anerkannte Standardvertragsklauseln (SCC)', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/bekanntgabe-von-personendaten-ins-ausland',
    stand: '2025-02-12', rang: 3, normKeys: ['DSG'],
  }),
  liveLink('EDOEB-LEITFADEN-TOM', 'EDOEB', 'leitfaden', 'Leitfaden zu technischen und organisatorischen Massnahmen (TOM)', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/dokumentation-datenschutz',
    stand: '2024-01-15', rang: 4, normKeys: ['DSG'],
  }),
  liveLink('EDOEB-MERKBLATT-DSFA', 'EDOEB', 'merkblatt', 'Merkblatt zur Datenschutz-Folgenabschätzung (DSFA)', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/datenschutz-folgenabschaetzung',
    stand: '2023-08-04', rang: 5, normKeys: ['DSG'],
  }),
  liveLink('EDOEB-LEITFADEN-DATABREACH', 'EDOEB', 'leitfaden', 'Leitfaden betreffend Meldung von Datensicherheitsverletzungen (Art. 24 DSG)', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/dokumentation-datenschutz',
    stand: '2025-04-23', rang: 6, normKeys: ['DSG'],
  }),
  liveLink('EDOEB-LEITFADEN-COOKIES', 'EDOEB', 'leitfaden', 'Leitfaden betreffend Datenbearbeitungen mittels Cookies und ähnlichen Technologien', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/dokumentation-datenschutz',
    stand: '2025-10-06', rang: 7, normKeys: ['DSG'],
  }),
  liveLink('EDOEB-TB-32', 'EDOEB', 'taetigkeitsbericht', '32. Tätigkeitsbericht 2024/2025', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.edoeb.admin.ch/de/dokumentation-taetigkeitsberichte',
    stand: '2025-06-30', rang: 8, normKeys: ['DSG'],
    hinweis: 'Behörden-Praxis (erste revDSG-Verfahren); Auslegungsquelle, kein Gesetzesrang.',
  }),

  // ── SECO — Arbeitsgesetz (öffentl.-rechtl. Arbeitnehmerschutz) ──────────────
  liveLink('SECO-WEGL-ARG-12', 'SECO', 'wegleitung', 'Wegleitung zum Arbeitsgesetz und den Verordnungen 1 und 2', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.seco.admin.ch/de/wegleitungen',
    stand: '2026-02-20', rang: 1, normKeys: ['ARG', 'ARGV1', 'ARGV2'],
    hinweis: 'Zentrales Vollzugs-/Auslegungswerk (artikelweise); FR/IT-Fassungen vorhanden.',
  }),
  liveLink('SECO-WEGL-ARG-34', 'SECO', 'wegleitung', 'Wegleitung zum Arbeitsgesetz und den Verordnungen 3 und 4 (Gesundheitsschutz)', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.seco.admin.ch/de/wegleitungen',
    stand: '2025-01-23', rang: 2, normKeys: ['ARG', 'ARGV3', 'ARGV4'],
  }),
  liveLink('SECO-WEGL-ARG-5', 'SECO', 'wegleitung', 'Wegleitung zur Verordnung 5 zum Arbeitsgesetz (Jugendarbeitsschutz)', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.seco.admin.ch/de/wegleitungen',
    stand: '2024-03-08', rang: 3, normKeys: ['ARG', 'ARGV5'],
  }),
  liveLink('SECO-MERKBLATT-ARBEITSZEIT', 'SECO', 'merkblatt', 'Das Arbeitsgesetz: Die wichtigsten Arbeits- und Ruhezeitbestimmungen in Kürze', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.seco.admin.ch/seco/de/home/Publikationen_Dienstleistungen/Publikationen_und_Formulare/Arbeit/Arbeitsbedingungen/Merkblatter_und_Checklisten.html',
    stand: '2016-03-22', rang: 4, normKeys: ['ARG'],
    hinweis: 'Verlinkt das amtliche SECO-Merkblatt-Verzeichnis (Einzel-PDF-Pfad nicht stabil).',
  }),
  liveLink('SECO-MERKBLATT-PIKETT', 'SECO', 'merkblatt', 'Merkblatt zum Pikettdienst', {
    rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.seco.admin.ch/seco/de/home/Publikationen_Dienstleistungen/Publikationen_und_Formulare/Arbeit/Arbeitsbedingungen/Merkblatter_und_Checklisten.html',
    stand: '2020-11-02', rang: 5, normKeys: ['ARG', 'ARGV1'],
    hinweis: 'Verlinkt das amtliche SECO-Merkblatt-Verzeichnis (Einzel-PDF-Pfad nicht stabil).',
  }),

  // ── BSV — Sozialversicherung (verbindliche Vollzugsweisungen AHV/IV/EO) ─────
  liveLink('BSV-WML', 'BSV', 'wegleitung', 'Wegleitung über den massgebenden Lohn in der AHV, IV und EO (WML)', {
    nummer: '318.102.02', rechtsgebiet: 'sozial-abgaben', quelleUrl: 'https://sozialversicherungen.admin.ch/de/d/6944',
    stand: '2026-05-21', rang: 1, normKeys: ['AHVG', 'AHVV'],
    hinweis: 'Verbindliche Vollzugsweisung an die Ausgleichskassen; FR/IT vorhanden.',
  }),
  liveLink('BSV-WSN', 'BSV', 'wegleitung', 'Wegleitung über die Beiträge der Selbständigerwerbenden und Nichterwerbstätigen (WSN)', {
    nummer: '318.102.03', rechtsgebiet: 'sozial-abgaben', quelleUrl: 'https://sozialversicherungen.admin.ch/de/d/6954',
    stand: '2025-11-12', rang: 2, normKeys: ['AHVG', 'AHVV'],
  }),
  liveLink('BSV-WVP', 'BSV', 'wegleitung', 'Wegleitung über die Versicherungspflicht in der AHV/IV (WVP)', {
    rechtsgebiet: 'sozial-abgaben', quelleUrl: 'https://sozialversicherungen.admin.ch/de/d/6957',
    stand: '2026-01-01', rang: 3, normKeys: ['AHVG'],
  }),

  // ── BJ/EHRA — Handelsregister (steuert die einheitliche HR-Praxis) ─────────
  liveLink('BJ-EHRA-PM-2026-01', 'BJ', 'mitteilung', 'Praxismitteilung EHRA 1/26', {
    nummer: '1/26', rechtsgebiet: 'privat', quelleUrl: 'https://www.ehra.admin.ch/de/praxismitteilungen-ehra',
    stand: '2026-03-03', rang: 1, normKeys: ['HREGV', 'OR'],
    hinweis: 'Verlinkt das amtliche EHRA-Verzeichnis der Praxismitteilungen (Direkt-PDF-Pfad nicht stabil).',
  }),
  liveLink('BJ-EHRA-PM-2025-01', 'BJ', 'mitteilung', 'Praxismitteilung EHRA 1/25', {
    nummer: '1/25', rechtsgebiet: 'privat', quelleUrl: 'https://www.ehra.admin.ch/de/praxismitteilungen-ehra',
    stand: '2025-04-07', rang: 2, normKeys: ['HREGV', 'OR'],
    hinweis: 'Verlinkt das amtliche EHRA-Verzeichnis der Praxismitteilungen (Direkt-PDF-Pfad nicht stabil).',
  }),

  // ── FINMA — Finanzmarktaufsicht (Soft-Law, faktisch bindend) ───────────────
  liveLink('FINMA-RS-2025-04', 'FINMA', 'rundschreiben', 'Konsolidierte Aufsicht von Finanzgruppen nach BankG und FINIG', {
    nummer: 'RS 2025/4', rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.finma.ch/de/dokumentation/rundschreiben/',
    stand: '2025-07-01', rang: 1, normKeys: ['BANKG', 'FINIG'],
    hinweis: 'Verlinkt das amtliche FINMA-Rundschreiben-Verzeichnis (Liste dynamisch); FR/IT/EN vorhanden.',
  }),
  liveLink('FINMA-RS-2025-02', 'FINMA', 'rundschreiben', 'Verhaltenspflichten nach FIDLEG/FIDLEV', {
    nummer: 'RS 2025/2', rechtsgebiet: 'oeffentlich', quelleUrl: 'https://www.finma.ch/de/dokumentation/rundschreiben/',
    stand: '2024-11-21', rang: 2, normKeys: ['FIDLEG', 'FINIG'],
    hinweis: 'Verlinkt das amtliche FINMA-Rundschreiben-Verzeichnis (Liste dynamisch); FR/IT/EN vorhanden.',
  }),

  // ── IGE — Geistiges Eigentum (verbindliche Prüfungspraxis) ─────────────────
  liveLink('IGE-RL-MARKEN-2026', 'IGE', 'richtlinie', 'Richtlinien in Markensachen (gültig ab 1.1.2026)', {
    rechtsgebiet: 'privat', quelleUrl: 'https://www.ige.ch/de/uebersicht-dienstleistungen/dokumente-und-links/marken',
    stand: '2026-01-01', rang: 1, normKeys: ['MSCHG'],
    hinweis: 'Verbindliche Prüfungspraxis des IGE; FR/IT vorhanden.',
  }),
  liveLink('IGE-RL-PATENTE', 'IGE', 'richtlinie', 'Richtlinien in Patentsachen (Teile 1–4)', {
    rechtsgebiet: 'privat', quelleUrl: 'https://www.ige.ch/de/uebersicht-dienstleistungen/dokumente-und-links/patente',
    stand: '2023-07-01', rang: 2, normKeys: ['PATG'],
    hinweis: 'Verbindliche Prüfungspraxis des IGE; FR vorhanden.',
  }),
];
