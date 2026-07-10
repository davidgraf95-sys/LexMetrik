// ─── Lese-Brücke «Änderungen / Revisionen» (Amtliche Sammlung, Paket 5, W2·6-REV) ──
//
// Projiziert die generierte Revisions-Timeline eines Erlasses aus dem lazy geladenen
// Sidecar public/normtext/revisionen/<KEY>.json auf die Norm. Reine Ladeschicht (§3) —
// kein Inhalt erzeugt, keine Rechtslogik. Schwester zur Entstehungsgeschichte
// (materialien/botschaften.ts): Botschaft = Genese-Absicht, AS-Erlass = tatsächliche
// Änderung. Der Botschafts-Verweis wird NICHT hier aufgelöst (kein zweiter Fetch),
// sondern im KontextPanel gegen die ohnehin geladenen Botschaften gemappt (botschaftKey).
//
// §15: der Sidecar wird erst bei Bedarf (Reader offen) geladen; nie im App-Bundle.
// Übergangslösung bis E1 (dann Projektion aus erlass_fassungen) — siehe Generator.

/** Ein Timeline-Eintrag in Anzeige-Form (Feld-Teilmenge des Sidecars). */
export interface RevisionBezug {
  /** 'aenderung' = realer AS/oc-Änderungserlass · 'sammelerlass-marker' = Änderung über
   *  einen Sammelerlass anderer SR (nur als Datum bekannt, §8). */
  art: 'aenderung' | 'sammelerlass-marker';
  dateEntryInForce: string;
  ocUri?: string;
  roFundstelle?: string;
  titelDe?: string;
  titelFr?: string;
  titelIt?: string;
  /** Paket-2-Botschafts-Key (nur bei belegtem Match) → im UI zum «Botschaft ansehen»-Link. */
  botschaftKey?: string;
  /** In Kraft, aber noch nicht in den geltenden (gepinnten) Normtext konsolidiert (§8). */
  nichtKonsolidiert?: boolean;
  /** Fedlex-Live-Link auf den AS-Text bzw. die amtliche Sammlung (§7c). */
  quelleUrl: string;
}

interface RevisionSidecar {
  erlassKey: string;
  sr: string;
  abgerufen: string;
  reichweite: string;
  revisionen: RevisionBezug[];
}

// Sidecar-Cache je Erlass-Key: laufende Promise (ein Fetch je Key/Session).
// `undefined` = Ladefehler (Fetch-Fehler ≠ leer, §8) — im UI unterscheidbar von «keine».
const cache = new Map<string, Promise<RevisionSidecar | null>>();

function ladeSidecar(key: string): Promise<RevisionSidecar | null> {
  let p = cache.get(key);
  if (!p) {
    p = (async () => {
      try {
        const res = await fetch(`/normtext/revisionen/${encodeURIComponent(key)}.json`);
        if (!res.ok) return null;
        const s = (await res.json()) as RevisionSidecar;
        return Array.isArray(s.revisionen) ? s : null;
      } catch {
        return null;
      }
    })();
    cache.set(key, p);
  }
  return p;
}

/** Zusammengeführte Timeline (Datum absteigend), Reichweiten-Hinweis. */
export interface RevisionAnsicht {
  revisionen: RevisionBezug[];
  reichweite: string | null;
}

/**
 * Revisions-Timeline zu EINER oder mehreren Normen (lazy). Mehrere normKeys werden über
 * die ocUri (bzw. das Datum bei Markern) dedupliziert und nach Datum absteigend gemischt.
 * `null` = ALLE Sidecars konnten nicht geladen werden (Fetch-Fehler, §8) → ehrlicher
 * Fehlerzustand; leeres `revisionen` = keine erfasste Änderung (Verordnung o. Ä.).
 */
export async function revisionenFuerNorm(normKeys: readonly string[]): Promise<RevisionAnsicht | null> {
  const sidecars = await Promise.all(normKeys.map(ladeSidecar));
  if (sidecars.every((s) => s === null)) return null;

  const seen = new Set<string>();
  const out: RevisionBezug[] = [];
  let reichweite: string | null = null;
  for (const s of sidecars) {
    if (!s) continue;
    reichweite ??= s.reichweite;
    for (const r of s.revisionen) {
      const id = r.ocUri ?? `${r.art}:${r.dateEntryInForce}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(r);
    }
  }
  out.sort((a, b) =>
    a.dateEntryInForce < b.dateEntryInForce ? 1
    : a.dateEntryInForce > b.dateEntryInForce ? -1
    : a.art < b.art ? -1 : a.art > b.art ? 1
    : (a.ocUri ?? '') < (b.ocUri ?? '') ? -1 : (a.ocUri ?? '') > (b.ocUri ?? '') ? 1 : 0);
  return { revisionen: out, reichweite };
}

/** Locale-Titel eines Eintrags (DE Fallback). Rein. */
export function revisionTitel(r: RevisionBezug, locale: 'de' | 'fr' | 'it'): string | undefined {
  return (locale === 'fr' && r.titelFr) || (locale === 'it' && r.titelIt) || r.titelDe;
}
