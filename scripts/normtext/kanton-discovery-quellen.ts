/**
 * kanton-discovery-quellen — Phase-1-Integrationspunkt (FAHRPLAN-GESETZE-IMPORT-
 * 3TIER): wandelt das Discovery-Ergebnis (alle Erlasse eines Kantons via LexFind)
 * in die `KantonInventarGruppe[]`-Form, die der Snapshot-Generator
 * (verarbeiteKantone in normtext-snapshot.ts) verarbeitet.
 *
 * Heute speist sich der kantonale Snapshot-Korpus aus `sammleKantonInventar()` —
 * also NUR aus Erlassen, die in den Tarif-Tabellen zitiert sind. Diese Funktion
 * öffnet den Weg zum VOLLKORPUS: jeder via Discovery (Tier A) gefundene Erlass
 * wird zu einer Generator-Gruppe. Der Generator holt dann über `holeLexWork` alle
 * Artikel (Vollabdeckung §7) — die `artikel`-Tokens bleiben leer (werden nicht
 * gebraucht, der Adapter extrahiert ohnehin alle).
 *
 * §2: rein/deterministisch. §8: nur Tier-A-Erlasse mit verwertbaren Bausteinen
 * (host/lang/lawId, lang ∈ {de,fr}; «it» kann holeLexWork derzeit nicht) werden
 * übernommen; der Rest bleibt sichtbar ausserhalb (Aufrufer reportet die Differenz).
 */
import type { KantonInventarGruppe } from './inventar-kanton.ts';
import type { EntdeckterErlass } from './lexfind-discovery.ts';

export interface DiscoveryRoutingErgebnis {
  /** Generator-Gruppen für Tier-A-Erlasse (de/fr) — direkt an verarbeiteKantone. */
  gruppen: KantonInventarGruppe[];
  /** Übersprungene Erlasse (Tier B/C/unbekannt oder lang=it) — §8 sichtbar. */
  uebersprungen: Array<{ systematischeNummer: string; grund: string }>;
}

/**
 * Baut aus den entdeckten Erlassen eines Kantons die Generator-Inventargruppen.
 * Dedupliziert nach (kanton, host, lang, lawId). Rein.
 */
export function discoveryZuInventar(
  erlasse: EntdeckterErlass[],
  kanton: string,
): DiscoveryRoutingErgebnis {
  const gruppen: KantonInventarGruppe[] = [];
  const uebersprungen: DiscoveryRoutingErgebnis['uebersprungen'] = [];
  const gesehen = new Set<string>();

  for (const e of erlasse) {
    const s = e.klassifikation.struktur;
    if (e.klassifikation.tier !== 'A-struktur' || !s) {
      uebersprungen.push({ systematischeNummer: e.systematischeNummer, grund: `tier=${e.klassifikation.tier}` });
      continue;
    }
    if (s.lang !== 'de' && s.lang !== 'fr') {
      uebersprungen.push({ systematischeNummer: e.systematischeNummer, grund: `lang=${s.lang} (holeLexWork: nur de/fr)` });
      continue;
    }
    const key = `${kanton}|${s.host}|${s.lang}|${s.lawId}`;
    if (gesehen.has(key)) continue;
    gesehen.add(key);
    gruppen.push({
      kanton,
      host: s.host,
      lang: s.lang,
      lawId: s.lawId,
      erlassName: e.titel,
      erlassNr: e.systematischeNummer,
      // Kanonische LexWork-Live-/Manifest-Form `/app/{lang}/texts_of_law/{id}` —
      // NICHT die LexFind-`/data/`-original_url. Sonst weicht der Manifest-Key von
      // der Form ab, die Tarif-Zitate + check-vollstaendigkeit auflösen, und die
      // Zitat-Abdeckung schlägt fehl (verifiziert AR 233.3, 23.6.2026).
      quelleUrl: `https://${s.host}/app/${s.lang}/texts_of_law/${s.lawId}`,
      artikel: [], // Tokens nicht nötig — der Adapter holt alle Artikel (§7)
    });
  }

  return { gruppen, uebersprungen };
}
