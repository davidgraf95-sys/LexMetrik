// ─── Drift-Guard: Vorlagen-Registry ↔ Katalog ↔ Routen (P0/C1+C4) ──────────
//
// FAHRPLAN-PRODUKTAUSBAU-BURGGRABEN P0. Die Registry (src/lib/vorlagen/
// registry.ts) ist SSoT über die MENGE der gebauten Vorlagen. Dieser Test
// erzwingt mechanisch:
//  (1) Bijektion Registry ↔ Katalog-schemaIds — vergessener Eintrag/Karte bricht;
//  (2) je Einzel-Eintrag schema.id === schemaId (richtiges Schema verdrahtet);
//  (3) jede schemaId hat eine Karte mit Route im Manifest (keine 404-Vorlage);
//  (4) Referenzgleichheit der assemble-Funktion mit dem Modul-Export — verbietet
//      Logik-Duplikate strukturell und sichert die kv-Namenskollision
//      (klageVereinfacht vs. kuendigungAllgemein) gegen Fehl-Verdrahtung.
import { describe, expect, it } from 'vitest';
import { VORLAGEN_REGISTRY, REGISTRY_SCHEMA_IDS, vorlagenEintrag } from '../lib/vorlagen/registry';
import { ALLE_KARTEN, type VorlageCard } from '../lib/startseiteConfig';
import { ROUTEN_MANIFEST } from '../routesManifest';

// Referenz-Importe für den Identitäts-Guard (4). Die kv-Kollision: beide Module
// exportieren `kvZusammenstellen` — die Registry muss je die RICHTIGE referenzieren.
import { kvZusammenstellen as klageVZusammenstellen } from '../lib/vorlagen/klageVereinfacht';
import { kvZusammenstellen as kvVertragZusammenstellen } from '../lib/vorlagen/kuendigungAllgemein';
import { agDokumentmappe } from '../lib/vorlagen/gruendungAgDokumente';
import { VERTRAGS_INVENTAR } from '../lib/vorlagen/variantenInventar';

const katalogVorlagen = ALLE_KARTEN
  .filter((k): k is VorlageCard => k.modus === 'vorlage')
  .filter((k) => typeof k.schemaId === 'string');

const katalogSchemaIds = katalogVorlagen.map((k) => k.schemaId as string);

// Registry-Überhang über den Katalog: die Arbeitsvertrag-Sub-Regime (eigenes
// Schema, aber unter DER 'arbeitsvertrag'-Karte gerendert → keine eigene Karte).
// SSoT dieser Untertyp-Menge ist VERTRAGS_INVENTAR (kein Hand-Duplikat, §5).
// Residuum (bewusst, kein Defekt; GP 17.7.): die Menge enthält auch 'einzel'/
// 'kader' — AV-Untertypen OHNE eigenes Schema (sie teilen AV_SCHEMA/
// 'arbeitsvertrag'). Ein künftiger Registry-Eintrag mit schema.id 'einzel'/'kader'
// käme damit durch beide Guards; ein solcher schemaId existiert heute nirgends.
// Die Latitude ist an die SSoT gebunden (nicht an eine Hand-Liste) — eng genug.
const AV_UNTERTYP_IDS = new Set(
  VERTRAGS_INVENTAR.find((k) => k.karte === 'arbeitsvertrag')!.untertypen.map((u) => u.id),
);

describe('Vorlagen-Registry ↔ Katalog (Drift-Guard P0/C1)', () => {
  it('deckt jede Katalog-schemaId ab; Überhang nur Arbeitsvertrag-Sub-Regime', () => {
    // (a) jede Katalog-Karte hat einen Registry-Eintrag (kein vergessener Eintrag)
    for (const id of katalogSchemaIds) expect(REGISTRY_SCHEMA_IDS, id).toContain(id);
    // (b) Registry-Überhang über den Katalog = ausschliesslich Arbeitsvertrag-Sub-
    //     Regime (eigenes Schema, kartenlos, golden-gedeckt) — keine sonstige fremde
    //     Vorlage darf sich einschleichen; die erlaubte Menge stammt aus der SSoT
    //     VERTRAGS_INVENTAR, nicht aus einer Hand-Liste.
    const ueberhang = REGISTRY_SCHEMA_IDS.filter((id) => !katalogSchemaIds.includes(id));
    for (const id of ueberhang) expect(AV_UNTERTYP_IDS.has(id), id).toBe(true);
  });

  it('enthält keine doppelten schemaIds', () => {
    expect(REGISTRY_SCHEMA_IDS.length).toBe(new Set(REGISTRY_SCHEMA_IDS).size);
  });

  it('verdrahtet je Einzel-Eintrag das richtige Schema (schema.id === schemaId)', () => {
    for (const e of VORLAGEN_REGISTRY) {
      if (e.art === 'einzel') {
        expect(e.schema, e.schemaId).toBeDefined();
        expect(e.schema?.id).toBe(e.schemaId);
      } else {
        expect(e.schema, e.schemaId).toBeUndefined();
      }
    }
  });

  it('referenziert je Eintrag eine assemble-Funktion und DEFAULTS', () => {
    for (const e of VORLAGEN_REGISTRY) {
      expect(typeof e.zusammenstellen, e.schemaId).toBe('function');
      expect(e.defaults, e.schemaId).not.toBeUndefined();
    }
  });

  it('hat für jede schemaId eine geroutete Karte (Sub-Regime über die Arbeitsvertrag-Karte)', () => {
    const pfade = new Set(ROUTEN_MANIFEST.map((r) => r.pfad));
    const routet = (id: string) => {
      const karte = katalogVorlagen.find((k) => k.schemaId === id);
      expect(karte, id).toBeDefined();
      expect(typeof karte?.href, id).toBe('string');
      expect(pfade.has(karte!.href as string), `${id} → ${karte?.href}`).toBe(true);
    };
    for (const id of REGISTRY_SCHEMA_IDS) {
      // Arbeitsvertrag-Sub-Regime haben keine eigene Karte — sie werden über die
      // 'arbeitsvertrag'-Karte (per Regime-Wahl) gerendert; deren Route muss stehen.
      routet(AV_UNTERTYP_IDS.has(id) && !katalogSchemaIds.includes(id) ? 'arbeitsvertrag' : id);
    }
  });
});

describe('Registry referenziert echte Modul-Exporte (Identitäts-Guard, kein Duplikat)', () => {
  it('verdrahtet die kv-Kollision korrekt und disjunkt', () => {
    const klageV = vorlagenEintrag('klage-vereinfacht-bs');
    const kuendV = vorlagenEintrag('kuendigung-vertrag');
    expect(klageV?.zusammenstellen).toBe(klageVZusammenstellen);
    expect(kuendV?.zusammenstellen).toBe(kvVertragZusammenstellen);
    // disjunkt: die beiden gleichnamigen Exporte sind verschiedene Funktionen
    expect(klageVZusammenstellen).not.toBe(kvVertragZusammenstellen);
  });

  it('referenziert den Dokumentmappe-Builder als assemble (Mappe)', () => {
    expect(vorlagenEintrag('ag-gruendungsmappe')?.zusammenstellen).toBe(agDokumentmappe);
  });
});
