// ─── H-12 · Vorlagen-Schema-Konventionstest (FAHRPLAN-CODE-HYGIENE §1, B28) ──
//
// Verifikations-Infrastruktur (LERNPHASE Strang B): EIN Konventionen-Test über
// ALLE gebauten Vorlagen-Schemas. Prüft strukturelle Schema-Konventionen, KEINE
// fachlichen Assertions je Vorlage — die Wort-für-Wort-Abnahme bleibt Davids
// Fachzeit (CLAUDE.md §7, Abnahme-Zeitsperre). Reine Prüflogik: keine Schema-,
// keine Engine-Änderung, golden byte-gleich unberührt.
//
// GEPRÜFTE KONVENTIONEN (über das Register ALLE_VORLAGEN_SCHEMAS):
//   1. Baustein-IDs je Schema eindeutig (kein stiller Doppel-/Überschreib-Baustein).
//   2. Gates auflösbar: jede `includeIf`-Bedingung ist strukturell wohlgeformt
//      (genau ein Operator je Knoten, `feld` gesetzt, and/or nicht leer) UND von
//      der Engine (`erfuellt`) ohne Wurf auswertbar. «Auflösbar» = die Engine
//      kann die Bedingung eindeutig auswerten — ein Tippfehler-Operator würde
//      sonst still als `nichtLeer` durchrutschen (engine.ts `erfuellt`-Fallthrough).
//   3. `ausgabeArt`/`format`/Baustein-`rolle` tragen nur gültige Enum-Werte
//      (die erlaubten Mengen sind per `satisfies` an die Engine-Typen gekoppelt —
//      ein neuer Typwert bricht die Kompilierung, nie stiller Drift).
//   4. `assemble()` (via modul-eigenem `zusammenstellen`) wirft nicht mit den
//      gate-erfüllenden Modul-DEFAULTS — Einzel-Vorlagen + die drei
//      arbeitsvertraglichen Sondervorlagen (HR/HA/LV). roi-Korrektur: NICHT
//      blind mit leeren Defaults; die Modul-DEFAULTS sind der gate-taugliche
//      Blanko-Antwortsatz je Einzel-Vorlage.
//   5. Muster-Gleichheit `SCHEMA_STRICHE` ≡ `MUSTER.STRICHE` (engine.ts:137
//      dokumentiert diese Konvention explizit für genau diesen Test — das
//      Strichzeilen-Muster ist bewusst dupliziert, um einen Import-Zyklus zu
//      vermeiden, und muss identisch bleiben).
//
// SCOPE-GRENZEN (bewusst, dokumentiert — kein Defekt):
//  - Dokumentmappen (AG/GmbH/Kapitalerhöhung) werden für Konvention 4 NICHT
//    naiv mit ihren DEFAULTS aufgerufen: deren DEFAULTS sind ein Teil-Antwortsatz
//    (`Omit<…, keyof …Eingaben>`), der erst mit den Wizard-Eingaben vollständig
//    wird. Die End-zu-End-Assemblierung der Mappen mit vollständigen Maximalkombi-
//    Eingaben (kein Wurf, blocker leer) deckt bereits konventionen.test.ts ab.
//    Die statischen Konventionen 1–3 laufen hier dennoch über die Mappen-internen
//    Schemas (AG_ALLE_SCHEMAS · GMBH_ALLE_SCHEMAS).
//  - Kapitalerhöhungs-Schemas werden je Rechtsform intern generiert (nicht
//    statisch exportiert) → statische Konvention 1–3 nicht abgreifbar; ihre
//    Assemblierung deckt konventionen.test.ts (ke-Maximalkombi) dynamisch ab.
//
// BEKANNTE_BEFUNDE (Muster a11y-Politik): Verstösse im Bestand werden hier
// dokumentiert statt im Risikopfad «schnell mitgefixt» (Fix = eigene Folge-
// Einheit). Aktuell: KEINE Konventions-Verstösse. Die früher separat geführten
// HR/HA/LV-Sondervorlagen sind seit dem Registry-Nachtrag (Folge-Einheit) in
// VORLAGEN_REGISTRY aufgenommen und fliessen darum über REGISTRY_EINZEL/
// ASSEMBLE_KANDIDATEN — keine Sonderliste mehr nötig (§5: kein Hand-Duplikat).

import { describe, expect, it } from 'vitest';
import {
  erfuellt,
  SCHEMA_STRICHE,
  type AbsatzRolle,
  type AusgabeArt,
  type Bedingung,
  type VorlageFormat,
  type VorlageSchema,
} from '../lib/vorlagen/engine';
import { MUSTER } from '../lib/vorlagen/formatvorlagen';
import { VORLAGEN_REGISTRY } from '../lib/vorlagen/registry';
import { AG_ALLE_SCHEMAS } from '../lib/vorlagen/gruendungAgDokumente';
import { GMBH_ALLE_SCHEMAS } from '../lib/vorlagen/gruendungGmbhDokumente';

// ── Erlaubte Enum-Mengen, compile-zeitlich an die Engine-Typen gekoppelt ──────
// `satisfies Record<T, true>` erzwingt Vollständigkeit: ein neuer Typwert bricht
// die Kompilierung dieses Tests, statt still an der Prüfung vorbeizulaufen.
const AUSGABE_ARTEN = { abschrift: true, entwurf: true, fertig: true } satisfies Record<AusgabeArt, true>;
const FORMATE = { verfuegung: true, vertrag: true, eingabe: true } satisfies Record<VorlageFormat, true>;
const ROLLEN = {
  absender: true, adressat: true, datumzeile: true, betreff: true, rubrum: true,
  parteien: true, anrede: true, schlussformel: true, unterschrift: true,
} satisfies Record<AbsatzRolle, true>;

// ── Register: ALLE statisch erreichbaren Vorlagen-Schemas ─────────────────────
// Einzel-Vorlagen aus der Registry ABGELEITET (kein Hand-Duplikat, §5: keine
// zweite Wahrheit über die Schema-Menge) + Mappen-interne Schema-Arrays. Die
// arbeitsvertraglichen Sub-Regime (HR/HA/LV) sind seit dem Registry-Nachtrag Teil
// von VORLAGEN_REGISTRY und darum bereits in REGISTRY_EINZEL enthalten — keine
// separate Sonderliste mehr. Ein Guard unten erzwingt, dass jede Einzel-Registry-
// Vorlage abgedeckt bleibt (neue Einzelvorlage ⇒ automatisch mitgeprüft).
type SchemaEintrag = { schema: VorlageSchema; herkunft: string };

const REGISTRY_EINZEL: SchemaEintrag[] = VORLAGEN_REGISTRY
  .filter((e) => e.art === 'einzel' && e.schema)
  .map((e) => ({ schema: e.schema as VorlageSchema, herkunft: 'registry' }));

const MAPPE_INTERN: SchemaEintrag[] = [
  ...AG_ALLE_SCHEMAS.map((schema) => ({ schema, herkunft: 'AG_ALLE_SCHEMAS' })),
  ...GMBH_ALLE_SCHEMAS.map((schema) => ({ schema, herkunft: 'GMBH_ALLE_SCHEMAS' })),
];

const ALLE_VORLAGEN_SCHEMAS: SchemaEintrag[] = [
  ...REGISTRY_EINZEL,
  ...MAPPE_INTERN,
];

// Assemble-Kandidaten für Konvention 4 (self-contained DEFAULTS je Vorlage):
// alle Einzel-Registry-Vorlagen (inkl. HR/HA/LV seit dem Nachtrag).
const ASSEMBLE_KANDIDATEN: { id: string; run: () => unknown }[] = [
  ...VORLAGEN_REGISTRY
    .filter((e) => e.art === 'einzel')
    .map((e) => ({ id: e.schemaId, run: () => (e.zusammenstellen as (a: unknown) => unknown)(e.defaults) })),
];

// ── Strukturelle Auflösbarkeit einer Bedingung (matcht die Bedingung-Union) ──
function bedingungAufloesbar(b: unknown): boolean {
  if (!b || typeof b !== 'object') return false;
  const o = b as Record<string, unknown>;
  const branch = (['and', 'or', 'not'] as const).filter((k) => k in o);
  const leaf = (['eq', 'in', 'nichtLeer'] as const).filter((k) => k in o);
  if (branch.length === 1 && leaf.length === 0) {
    if ('and' in o) return Array.isArray(o.and) && o.and.length > 0 && o.and.every(bedingungAufloesbar);
    if ('or' in o) return Array.isArray(o.or) && o.or.length > 0 && o.or.every(bedingungAufloesbar);
    return bedingungAufloesbar(o.not); // 'not'
  }
  if (branch.length === 0 && leaf.length === 1) {
    if (typeof o.feld !== 'string' || o.feld === '') return false;
    if ('nichtLeer' in o) return o.nichtLeer === true;
    if ('in' in o) return Array.isArray(o.in);
    return 'eq' in o; // eq darf jeden Wert (auch undefined) tragen
  }
  return false; // gemischt oder leer = mehrdeutig, nicht auflösbar
}

describe('H-12 · Vorlagen-Schema-Konventionen (strukturell, keine Fachprüfung)', () => {
  it('Register deckt jede Einzel-Registry-Vorlage ab (kein stiller Verlust)', () => {
    const registerIds = new Set(ALLE_VORLAGEN_SCHEMAS.map((e) => e.schema.id));
    for (const e of REGISTRY_EINZEL) {
      expect(registerIds.has(e.schema.id), e.schema.id).toBe(true);
    }
    // Untergrenze: Regression-Wächter gegen ein leergelaufenes Register.
    expect(ALLE_VORLAGEN_SCHEMAS.length).toBeGreaterThanOrEqual(45);
    expect(AG_ALLE_SCHEMAS.length).toBeGreaterThan(0);
    expect(GMBH_ALLE_SCHEMAS.length).toBeGreaterThan(0);
  });

  it('Konvention 1: Baustein-IDs sind je Schema eindeutig', () => {
    const verstoesse: string[] = [];
    for (const { schema, herkunft } of ALLE_VORLAGEN_SCHEMAS) {
      const ids = schema.bausteine.map((b) => b.id);
      const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
      if (dup.length) verstoesse.push(`${herkunft}/${schema.id}: doppelte Baustein-IDs ${JSON.stringify(dup)}`);
    }
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });

  it('Konvention 2: Gates sind auflösbar (strukturell + engine-auswertbar)', () => {
    const verstoesse: string[] = [];
    for (const { schema, herkunft } of ALLE_VORLAGEN_SCHEMAS) {
      for (const b of schema.bausteine) {
        if (!b.includeIf) continue;
        if (!bedingungAufloesbar(b.includeIf)) {
          verstoesse.push(`${herkunft}/${schema.id}/${b.id}: Gate nicht auflösbar ${JSON.stringify(b.includeIf)}`);
          continue;
        }
        try {
          erfuellt(b.includeIf as Bedingung, {});
        } catch (err) {
          verstoesse.push(`${herkunft}/${schema.id}/${b.id}: Gate wirft bei Auswertung — ${String(err)}`);
        }
      }
    }
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });

  it('Konvention 3: ausgabeArt/format/rolle tragen nur gültige Enum-Werte', () => {
    const verstoesse: string[] = [];
    for (const { schema, herkunft } of ALLE_VORLAGEN_SCHEMAS) {
      if (schema.ausgabeArt && !(schema.ausgabeArt in AUSGABE_ARTEN)) {
        verstoesse.push(`${herkunft}/${schema.id}: ungültige ausgabeArt '${schema.ausgabeArt}'`);
      }
      if (schema.format && !(schema.format in FORMATE)) {
        verstoesse.push(`${herkunft}/${schema.id}: ungültiges format '${schema.format}'`);
      }
      for (const b of schema.bausteine) {
        if (b.rolle && !(b.rolle in ROLLEN)) {
          verstoesse.push(`${herkunft}/${schema.id}/${b.id}: ungültige rolle '${b.rolle}'`);
        }
      }
    }
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });

  it('Konvention 4: assemble() wirft nicht mit gate-erfüllenden Modul-DEFAULTS', () => {
    const verstoesse: string[] = [];
    for (const { id, run } of ASSEMBLE_KANDIDATEN) {
      try {
        run();
      } catch (err) {
        verstoesse.push(`${id}: assemble/zusammenstellen wirft mit DEFAULTS — ${String(err)}`);
      }
    }
    expect(verstoesse, verstoesse.join('\n')).toEqual([]);
  });

  it('Konvention 5: SCHEMA_STRICHE ≡ MUSTER.STRICHE (engine.ts:137 dokumentiert)', () => {
    expect(SCHEMA_STRICHE.source).toBe(MUSTER.STRICHE.source);
    expect(SCHEMA_STRICHE.flags).toBe(MUSTER.STRICHE.flags);
  });
});
