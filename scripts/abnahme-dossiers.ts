// ─── Abnahme-Dossiers für alle übrigen Gebiete (FUNDAMENT-UMBAU Thema C, 4.2) ─
//
// Wie scripts/abnahme-ag.ts, aber für GmbH-Gründung + alle Einzelschema-
// Vorlagen. Erzeugt je Gebiet ein ABNAHME-<gebiet>-BAUSTEINE.md unter
// abnahme/dossiers/ (Root bleibt schlank, FUNDAMENT-UMBAU Thema D; AG bleibt
// aus historischen Gründen im Root, eigenes Skript). Reine Lese-Ableitung
// (§5), deterministisch (§2). Aufruf: npx vite-node scripts/abnahme-dossiers.ts
//
// PFLEGE: nach jeder Schema-Änderung NEU laufen lassen, sonst driftet das
// Dossier vom Code (sonst abnehmbar auf veraltetem Stand). TODO(check): Drift-
// Guard in npm run check (regenerieren + git diff --exit-code).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { VorlageSchema } from '../src/lib/vorlagen/engine';
import { abnahmeDossier } from './abnahmeDossier';

import { GMBH_ALLE_SCHEMAS } from '../src/lib/vorlagen/gruendungGmbhDokumente';
import { AF_SCHEMA } from '../src/lib/vorlagen/auftrag';
import { AV_SCHEMA } from '../src/lib/vorlagen/arbeitsvertrag';
import { EG_SCHEMA } from '../src/lib/vorlagen/eheschutzgesuch';
import { FE_SCHEMA } from '../src/lib/vorlagen/fristerstreckung';
import { FA_SCHEMA } from '../src/lib/vorlagen/forderungsabtretung';
import { KV_SCHEMA as KUENDIGUNG_VERTRAG_SCHEMA } from '../src/lib/vorlagen/kuendigungAllgemein';
import { KK_SCHEMA } from '../src/lib/vorlagen/konkubinat';
import { KM_SCHEMA } from '../src/lib/vorlagen/kuendigungMieter';
import { KV_SCHEMA as KLAGE_VEREINFACHT_SCHEMA } from '../src/lib/vorlagen/klageVereinfacht';
import { NB_SCHEMA } from '../src/lib/vorlagen/nichtbekanntgabe';
import { NDA_SCHEMA } from '../src/lib/vorlagen/nda';
import { KAN_SCHEMA } from '../src/lib/vorlagen/kuendigungArbeitnehmer';
import { KO_SCHEMA } from '../src/lib/vorlagen/klageOrdentlich';
import { SG_SCHEMA } from '../src/lib/vorlagen/schlichtungsgesuchBs';
import { SK_SCHEMA } from '../src/lib/vorlagen/scheidungsklage';
import { KAG_SCHEMA } from '../src/lib/vorlagen/kuendigungArbeitgeber';
import { MV_SCHEMA } from '../src/lib/vorlagen/mietvertrag';
import { VOLLMACHT_SCHEMA } from '../src/lib/vorlagen/vollmacht';
import { WV_SCHEMA } from '../src/lib/vorlagen/werkvertrag';
import { MA_SCHEMA } from '../src/lib/vorlagen/mahnung';
import { VA_SCHEMA } from '../src/lib/vorlagen/vorsorgeauftrag';
import { SB_SCHEMA } from '../src/lib/vorlagen/scheidungsbegehren';
import { TESTAMENT_SCHEMA } from '../src/lib/vorlagen/testament';
import { VV_SCHEMA } from '../src/lib/vorlagen/verjaehrungsverzicht';
import { PV_SCHEMA } from '../src/lib/vorlagen/patientenverfuegung';

function kopf(anzeige: string, quelle: string): string {
  return `# Abnahme-Dossier: ${anzeige} — alle Bausteine Wort für Wort

**Zweck:** Wort-für-Wort-Abnahme durch David (fachkundige Person, CLAUDE.md §7).
Je Baustein eine Abhak-Zeile.

**Quelle:** \`src/lib/vorlagen/${quelle}\`. **Generiert:**
\`npx vite-node scripts/abnahme-dossiers.ts\` — nach Engine-Änderungen NEU
laufen lassen; das Dossier ist eine Ableitung, keine zweite Pflege-Stelle (§5).

**Lesehilfe:** «Aufnahme: immer» = Baustein steht in jedem Dokument; sonst die
lesbare \`includeIf\`-Bedingung über die Antwort-Felder. «wiederholt über» =
ein Absatz je Listeneintrag ({{item.…}}-Platzhalter). {{platzhalter}} werden
beim Erzeugen interpoliert; Fragment-Felder (…Satz/…Zeile) verschwinden leer
ersatzlos.
`;
}

type Eintrag = { datei: string; anzeige: string; quelle: string; schemas: VorlageSchema[] };

const DOSSIERS: Eintrag[] = [
  { datei: 'GMBH', anzeige: 'GmbH-Gründung', quelle: 'gruendungGmbhDokumente.ts (GMBH_ALLE_SCHEMAS)', schemas: GMBH_ALLE_SCHEMAS },
  { datei: 'ARBEITSVERTRAG', anzeige: 'Arbeitsvertrag', quelle: 'arbeitsvertrag.ts (AV_SCHEMA)', schemas: [AV_SCHEMA] },
  { datei: 'MIETVERTRAG', anzeige: 'Mietvertrag', quelle: 'mietvertrag.ts (MV_SCHEMA)', schemas: [MV_SCHEMA] },
  { datei: 'AUFTRAG', anzeige: 'Auftrag/Dienstleistungsvertrag', quelle: 'auftrag.ts (AF_SCHEMA)', schemas: [AF_SCHEMA] },
  { datei: 'WERKVERTRAG', anzeige: 'Werkvertrag', quelle: 'werkvertrag.ts (WV_SCHEMA)', schemas: [WV_SCHEMA] },
  { datei: 'NDA', anzeige: 'Geheimhaltungsvereinbarung (NDA)', quelle: 'nda.ts (NDA_SCHEMA)', schemas: [NDA_SCHEMA] },
  { datei: 'KONKUBINAT', anzeige: 'Konkubinatsvertrag', quelle: 'konkubinat.ts (KK_SCHEMA)', schemas: [KK_SCHEMA] },
  { datei: 'FORDERUNGSABTRETUNG', anzeige: 'Forderungsabtretung (Zession)', quelle: 'forderungsabtretung.ts (FA_SCHEMA)', schemas: [FA_SCHEMA] },
  { datei: 'VERJAEHRUNGSVERZICHT', anzeige: 'Verjährungsverzicht', quelle: 'verjaehrungsverzicht.ts (VV_SCHEMA)', schemas: [VV_SCHEMA] },
  { datei: 'MAHNUNG', anzeige: 'Mahnung', quelle: 'mahnung.ts (MA_SCHEMA)', schemas: [MA_SCHEMA] },
  { datei: 'FRISTERSTRECKUNG', anzeige: 'Fristerstreckungsgesuch', quelle: 'fristerstreckung.ts (FE_SCHEMA)', schemas: [FE_SCHEMA] },
  { datei: 'NICHTBEKANNTGABE', anzeige: 'Gesuch um Nichtbekanntgabe einer Betreibung', quelle: 'nichtbekanntgabe.ts (NB_SCHEMA)', schemas: [NB_SCHEMA] },
  { datei: 'VOLLMACHT', anzeige: 'Vollmacht', quelle: 'vollmacht.ts (VOLLMACHT_SCHEMA)', schemas: [VOLLMACHT_SCHEMA] },
  { datei: 'KUENDIGUNG-VERTRAG', anzeige: 'Kündigung (allgemeiner Vertrag)', quelle: 'kuendigungAllgemein.ts (KV_SCHEMA)', schemas: [KUENDIGUNG_VERTRAG_SCHEMA] },
  { datei: 'KUENDIGUNG-MIETER', anzeige: 'Kündigung durch Mieter', quelle: 'kuendigungMieter.ts (KM_SCHEMA)', schemas: [KM_SCHEMA] },
  { datei: 'KUENDIGUNG-ARBEITNEHMER', anzeige: 'Kündigung durch Arbeitnehmer', quelle: 'kuendigungArbeitnehmer.ts (KAN_SCHEMA)', schemas: [KAN_SCHEMA] },
  { datei: 'KUENDIGUNG-ARBEITGEBER', anzeige: 'Kündigung durch Arbeitgeber', quelle: 'kuendigungArbeitgeber.ts (KAG_SCHEMA)', schemas: [KAG_SCHEMA] },
  { datei: 'KLAGE-VEREINFACHT', anzeige: 'Klage im vereinfachten Verfahren', quelle: 'klageVereinfacht.ts (KV_SCHEMA)', schemas: [KLAGE_VEREINFACHT_SCHEMA] },
  { datei: 'KLAGE-ORDENTLICH', anzeige: 'Klage im ordentlichen Verfahren', quelle: 'klageOrdentlich.ts (KO_SCHEMA)', schemas: [KO_SCHEMA] },
  { datei: 'SCHLICHTUNGSGESUCH-BS', anzeige: 'Schlichtungsgesuch', quelle: 'schlichtungsgesuchBs.ts (SG_SCHEMA)', schemas: [SG_SCHEMA] },
  { datei: 'SCHEIDUNGSKLAGE', anzeige: 'Scheidungsklage', quelle: 'scheidungsklage.ts (SK_SCHEMA)', schemas: [SK_SCHEMA] },
  { datei: 'SCHEIDUNGSBEGEHREN', anzeige: 'Gemeinsames Scheidungsbegehren', quelle: 'scheidungsbegehren.ts (SB_SCHEMA)', schemas: [SB_SCHEMA] },
  { datei: 'EHESCHUTZGESUCH', anzeige: 'Eheschutzgesuch', quelle: 'eheschutzgesuch.ts (EG_SCHEMA)', schemas: [EG_SCHEMA] },
  { datei: 'TESTAMENT', anzeige: 'Testament', quelle: 'testament.ts (TESTAMENT_SCHEMA)', schemas: [TESTAMENT_SCHEMA] },
  { datei: 'VORSORGEAUFTRAG', anzeige: 'Vorsorgeauftrag', quelle: 'vorsorgeauftrag.ts (VA_SCHEMA)', schemas: [VA_SCHEMA] },
  { datei: 'PATIENTENVERFUEGUNG', anzeige: 'Patientenverfügung', quelle: 'patientenverfuegung.ts (PV_SCHEMA)', schemas: [PV_SCHEMA] },
];

const ZIEL_DIR = join(import.meta.dirname, '..', 'abnahme', 'dossiers');
mkdirSync(ZIEL_DIR, { recursive: true });

let bausteine = 0;
for (const d of DOSSIERS) {
  const md = abnahmeDossier(d.schemas, kopf(d.anzeige, d.quelle));
  writeFileSync(join(ZIEL_DIR, `ABNAHME-${d.datei}-BAUSTEINE.md`), md, 'utf8');
  bausteine += d.schemas.reduce((n, s) => n + s.bausteine.length, 0);
}

console.log(`${DOSSIERS.length} Dossiers nach abnahme/dossiers/ geschrieben — ${bausteine} Bausteine gesamt.`);
