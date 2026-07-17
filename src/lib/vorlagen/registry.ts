// ─── Vorlagen-Registry: Single Source of Truth über die MENGE der Vorlagen ──
//
// FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN P0/C1. Bisher wird jedes Schema namentlich
// in mehreren Dateien aufgezählt (scripts/golden-outputs.ts, formGate.test.ts,
// vorlagenRender.test.ts) — ohne SSoT über die SCHEMA-MENGE. Diese Registry
// listet jede gebaute Vorlage GENAU einmal und REFERENZIERT die Exporte ihres
// Schema-Moduls (Schema-Objekt, assemble-Funktion, DEFAULTS, optionale Gate-
// Prüfung). Sie deklariert NICHTS neu (§5/§1: keine zweite Wahrheit, kein
// Logik-Duplikat) — `eintrag.schema` IST das Modul-Schema, `eintrag.zusammen-
// stellen` IST die Modul-Funktion.
//
// Gegenprobe gegen den Katalog (startseiteConfig.ts: VorlageCard.schemaId) und
// gegen das Routen-Manifest erzwingt src/tests/vorlagenRegistry.test.ts
// mechanisch (Drift-Guard, C4): vergessene Karte/Registry-Eintrag/Route bricht
// die Suite.
//
// EINE bewusste Nicht-Bijektion: die Arbeitsvertrag-Sub-Regime (lehrvertrag/
// handelsreisendenvertrag/heimarbeitsvertrag) sind eigene, golden-gedeckte
// Schemas, werden aber unter DER 'arbeitsvertrag'-Karte per Regime-Wahl gerendert
// (VorlageArbeitsvertrag.tsx) und haben daher keine eigene Katalog-Karte. Die
// Registry führt sie trotzdem (Ziel: JEDE gebaute Vorlage genau einmal); der
// Drift-Guard erlaubt genau diesen Überhang, gebunden an VERTRAGS_INVENTAR
// (arbeitsvertrag.untertypen) — keine sonstige fremde Vorlage.
//
// WARNUNG: Dies ist ein Test-/Skript-Modul. NICHT aus UI-Komponenten
// importieren — es zieht ALLE Schemas in einen Graphen (zu schwer fürs
// Start-Bundle; die Detailseiten laden ihr Schema je Seite lazy).

import type { VorlageSchema } from './engine';

import { AV_SCHEMA, avZusammenstellen, AV_DEFAULTS, pruefeAvGates } from './arbeitsvertrag';
import { AF_SCHEMA, afZusammenstellen, AF_DEFAULTS, pruefeAfGates } from './auftrag';
import { EG_SCHEMA, egZusammenstellen, EG_DEFAULTS } from './eheschutzgesuch';
import { FA_SCHEMA, faZusammenstellen, FA_DEFAULTS, pruefeFaGates } from './forderungsabtretung';
import { FE_SCHEMA, feZusammenstellen, FE_DEFAULTS, pruefeFeGates } from './fristerstreckung';
import { KO_SCHEMA, koZusammenstellen, KO_DEFAULTS } from './klageOrdentlich';
import { KLAGE_V_SCHEMA, kvZusammenstellen as klageVZusammenstellen, KV_DEFAULTS as KLAGE_V_DEFAULTS } from './klageVereinfacht';
import { KK_SCHEMA, kkZusammenstellen, KK_DEFAULTS, pruefeKkGates } from './konkubinat';
import { KAG_SCHEMA, kagZusammenstellen, KAG_DEFAULTS, pruefeKagGates } from './kuendigungArbeitgeber';
import { KAN_SCHEMA, kanZusammenstellen, KAN_DEFAULTS, pruefeKanGates } from './kuendigungArbeitnehmer';
import { KM_SCHEMA, kmZusammenstellen, KM_DEFAULTS, pruefeKmGates } from './kuendigungMieter';
import { KV_SCHEMA, kvZusammenstellen as kvVertragZusammenstellen, KV_DEFAULTS as KV_VERTRAG_DEFAULTS, pruefeKvGates } from './kuendigungAllgemein';
import { MA_SCHEMA, maZusammenstellen, MA_DEFAULTS, pruefeMaGates } from './mahnung';
import { MV_SCHEMA, mvZusammenstellen, MV_DEFAULTS, pruefeMvGates } from './mietvertrag';
import { NDA_SCHEMA, ndaZusammenstellen, NDA_DEFAULTS, pruefeNdaGates } from './nda';
import { NB_SCHEMA, nbZusammenstellen, NB_DEFAULTS, pruefeNbGates } from './nichtbekanntgabe';
import { PV_SCHEMA, pvZusammenstellen, PV_DEFAULTS, pruefePvGates } from './patientenverfuegung';
import { SB_SCHEMA, sbZusammenstellen, SB_DEFAULTS } from './scheidungsbegehren';
import { SK_SCHEMA, skZusammenstellen, SK_DEFAULTS } from './scheidungsklage';
import { SG_SCHEMA, sgZusammenstellen, SG_DEFAULTS } from './schlichtungsgesuchBs';
import { TESTAMENT_SCHEMA, testamentZusammenstellen, TESTAMENT_DEFAULTS, pruefeGates as pruefeTestamentGates } from './testament';
import { VV_SCHEMA, vvZusammenstellen, VV_DEFAULTS, pruefeVvGates } from './verjaehrungsverzicht';
import { VOLLMACHT_SCHEMA, vollmachtZusammenstellen, VOLLMACHT_DEFAULTS, pruefeVollmachtGates } from './vollmacht';
import { RUBRUM_SCHEMA, rubrumZusammenstellen, RUBRUM_DEFAULTS, pruefeRubrumGates } from './rubrum';
import { VA_SCHEMA, vaZusammenstellen, VA_DEFAULTS, pruefeVaGates } from './vorsorgeauftrag';
import { WV_SCHEMA, wvZusammenstellen, WV_DEFAULTS, pruefeWvGates } from './werkvertrag';

// Arbeitsvertrag-Sub-Regime: eigene Schemas, unter der 'arbeitsvertrag'-Karte
// gerendert (Regime-Wahl in VorlageArbeitsvertrag.tsx), daher KEINE eigene
// Katalog-Karte — golden-gedeckt (vorl:lv-*/hr-*/ha-*). Nachtrag zur Registry-
// SSoT, damit sie wirklich JEDE gebaute Vorlage führt (Folge-Einheit H-12/B28).
import { HR_SCHEMA, hrZusammenstellen, HR_DEFAULTS, pruefeHrGates } from './handelsreisendenvertrag';
import { HA_SCHEMA, haZusammenstellen, HA_DEFAULTS, pruefeHaGates } from './heimarbeitsvertrag';
import { LV_SCHEMA, lvZusammenstellen, LV_DEFAULTS, pruefeLvGates } from './lehrvertrag';

import { agDokumentmappe, AG_DOK_DEFAULTS, pruefeAgDokGates } from './gruendungAgDokumente';
import { gmbhDokumentmappe, GMBH_DOK_DEFAULTS, pruefeGmbhDokGates } from './gruendungGmbhDokumente';
import { keDokumentmappe, KE_DEFAULTS, pruefeKeGates } from './kapitalerhoehung';

/** Eine assemble- oder Gate-Funktion eines Schema-Moduls (Referenz, kein
 *  Duplikat). Eingabe-Form und Stelligkeit sind je Schema verschieden (manche
 *  Gates erhalten zusätzlich das Engine-Ergebnis) — die Registry typisiert nur
 *  die Identität, nicht die Eingabe (`never`-Parameter akzeptieren jede
 *  konkrete Signatur kontravariant). */
type SchemaFn = (...args: never[]) => unknown;

export interface VorlagenEintrag {
  /** === VorlageCard.schemaId im Katalog (startseiteConfig.ts). Stabiler
   *  Identifikator der Vorlage über UI, Routen, Golden und Abnahme-Dossiers. */
  schemaId: string;
  /** 'einzel' = genau ein VorlageSchema; 'mappe' = Dokumentmappe (mehrere
   *  Dokumente aus einem Eingabesatz, z. B. Gründungs-/Kapitalmappen). */
  art: 'einzel' | 'mappe';
  /** Nur 'einzel': das kanonische Schema-Objekt des Moduls. Invariante
   *  (test-gegated): `schema.id === schemaId`. Bei 'mappe' undefined. */
  schema?: VorlageSchema;
  /** Referenz auf die assemble-Funktion des Moduls (zusammenstellen bzw.
   *  Dokumentmappe-Builder). */
  zusammenstellen: SchemaFn;
  /** Referenz auf den DEFAULTS-Export des Moduls (blanko-/Vorbelegung). */
  defaults: unknown;
  /** Optionale Gate-/Plausibilitätsprüfung des Moduls (nicht jede Vorlage
   *  hat eine eigene). */
  pruefeGates?: SchemaFn;
}

const einzel = (
  schema: VorlageSchema,
  zusammenstellen: SchemaFn,
  defaults: unknown,
  pruefeGates?: SchemaFn,
): VorlagenEintrag => ({ schemaId: schema.id, art: 'einzel', schema, zusammenstellen, defaults, pruefeGates });

const mappe = (
  schemaId: string,
  zusammenstellen: SchemaFn,
  defaults: unknown,
  pruefeGates?: SchemaFn,
): VorlagenEintrag => ({ schemaId, art: 'mappe', zusammenstellen, defaults, pruefeGates });

/** Alle gebauten Vorlagen — EINMAL deklariert. Reihenfolge ist unerheblich
 *  (Identifikation über schemaId); grob nach Katalog-Sektionen sortiert. */
export const VORLAGEN_REGISTRY: VorlagenEintrag[] = [
  // ── Behördeneingaben ──
  einzel(SG_SCHEMA, sgZusammenstellen, SG_DEFAULTS),
  einzel(KLAGE_V_SCHEMA, klageVZusammenstellen, KLAGE_V_DEFAULTS),
  einzel(KO_SCHEMA, koZusammenstellen, KO_DEFAULTS),
  einzel(FE_SCHEMA, feZusammenstellen, FE_DEFAULTS, pruefeFeGates),
  einzel(NB_SCHEMA, nbZusammenstellen, NB_DEFAULTS, pruefeNbGates),
  einzel(EG_SCHEMA, egZusammenstellen, EG_DEFAULTS),
  einzel(SB_SCHEMA, sbZusammenstellen, SB_DEFAULTS),
  einzel(SK_SCHEMA, skZusammenstellen, SK_DEFAULTS),
  // ── Verträge ──
  einzel(AV_SCHEMA, avZusammenstellen, AV_DEFAULTS, pruefeAvGates),
  einzel(MV_SCHEMA, mvZusammenstellen, MV_DEFAULTS, pruefeMvGates),
  einzel(AF_SCHEMA, afZusammenstellen, AF_DEFAULTS, pruefeAfGates),
  einzel(WV_SCHEMA, wvZusammenstellen, WV_DEFAULTS, pruefeWvGates),
  einzel(NDA_SCHEMA, ndaZusammenstellen, NDA_DEFAULTS, pruefeNdaGates),
  einzel(KK_SCHEMA, kkZusammenstellen, KK_DEFAULTS, pruefeKkGates),
  // ── Arbeitsvertrag-Sub-Regime (eigenes Schema, unter der 'arbeitsvertrag'-Karte gerendert) ──
  einzel(LV_SCHEMA, lvZusammenstellen, LV_DEFAULTS, pruefeLvGates),
  einzel(HR_SCHEMA, hrZusammenstellen, HR_DEFAULTS, pruefeHrGates),
  einzel(HA_SCHEMA, haZusammenstellen, HA_DEFAULTS, pruefeHaGates),
  // ── Einseitige Willenserklärungen ──
  einzel(KAG_SCHEMA, kagZusammenstellen, KAG_DEFAULTS, pruefeKagGates),
  einzel(KAN_SCHEMA, kanZusammenstellen, KAN_DEFAULTS, pruefeKanGates),
  einzel(KM_SCHEMA, kmZusammenstellen, KM_DEFAULTS, pruefeKmGates),
  einzel(KV_SCHEMA, kvVertragZusammenstellen, KV_VERTRAG_DEFAULTS, pruefeKvGates),
  einzel(MA_SCHEMA, maZusammenstellen, MA_DEFAULTS, pruefeMaGates),
  einzel(VV_SCHEMA, vvZusammenstellen, VV_DEFAULTS, pruefeVvGates),
  einzel(FA_SCHEMA, faZusammenstellen, FA_DEFAULTS, pruefeFaGates),
  einzel(VOLLMACHT_SCHEMA, vollmachtZusammenstellen, VOLLMACHT_DEFAULTS, pruefeVollmachtGates),
  einzel(RUBRUM_SCHEMA, rubrumZusammenstellen, RUBRUM_DEFAULTS, pruefeRubrumGates),
  // ── Gesellschaftsrecht (Dokumentmappen) ──
  mappe('ag-gruendungsmappe', agDokumentmappe, AG_DOK_DEFAULTS, pruefeAgDokGates),
  mappe('gmbh-gruendungsmappe', gmbhDokumentmappe, GMBH_DOK_DEFAULTS, pruefeGmbhDokGates),
  mappe('kapitalerhoehungsmappe', keDokumentmappe, KE_DEFAULTS, pruefeKeGates),
  // ── Vorsorge & Nachlass ──
  einzel(TESTAMENT_SCHEMA, testamentZusammenstellen, TESTAMENT_DEFAULTS, pruefeTestamentGates),
  einzel(VA_SCHEMA, vaZusammenstellen, VA_DEFAULTS, pruefeVaGates),
  einzel(PV_SCHEMA, pvZusammenstellen, PV_DEFAULTS, pruefePvGates),
];

/** Eintrag zu einer schemaId (oder undefined). */
export const vorlagenEintrag = (schemaId: string): VorlagenEintrag | undefined =>
  VORLAGEN_REGISTRY.find((e) => e.schemaId === schemaId);

/** Alle in der Registry geführten schemaIds. */
export const REGISTRY_SCHEMA_IDS: readonly string[] = VORLAGEN_REGISTRY.map((e) => e.schemaId);
