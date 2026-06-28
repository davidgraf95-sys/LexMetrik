import { useEffect, useMemo, useRef, useState } from 'react';
import { sucheAlles, type SuchGruppe, type SuchTreffer } from '../../lib/universalSuche';
import type { PresetIndexEintrag } from '../../lib/presetIndex';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import type { BrowseEntscheid } from '../../lib/rechtsprechung/register';
import type { BrowseMaterial } from '../../lib/materialien/typen';

// ─── Gemeinsamer Such-Hook (Header-Dropdown UND Startseiten-Hero, §5) ────────
//
// Kapselt das LAZY-Laden der schweren Such-Daten (Preset-Index, Gesetzes-/
// Entscheid-Manifest) und die Gruppen-Berechnung über den reinen Aggregator
// lib/universalSuche (§3 — keine Rechtslogik hier). Erst der erste nicht-leere
// Query stösst die dynamischen Importe an, danach gecacht — der Start-Chunk
// bleibt schlank (§6.4: nur Ladezeitpunkt, nie Inhalt/Reihenfolge).
//
// Vormals lag diese Logik allein in der Hero-Komponente (UniversalSuche.tsx);
// herausgezogen, damit Header und Hero EINEN Suchweg teilen (Auftrag David:
// «Resultate überall im Dropdown»).

export interface UniversalSucheErgebnis {
  gruppen: SuchGruppe[];
  /** true, sobald alle drei Datenquellen geladen sind (für ehrlichen Leerzustand). */
  allesGeladen: boolean;
}

export function useUniversalSuche(q: string): UniversalSucheErgebnis {
  const [presetSucheFn, setPresetSucheFn] = useState<((s: string, limit?: number) => PresetIndexEintrag[]) | null>(null);
  const [artikelSucheFn, setArtikelSucheFn] = useState<((s: string, limit?: number) => SuchTreffer[]) | null>(null);
  const [gesetze, setGesetze] = useState<BrowseErlass[] | null>(null);
  const [entscheide, setEntscheide] = useState<BrowseEntscheid[] | null>(null);
  const [materialien, setMaterialien] = useState<BrowseMaterial[] | null>(null);
  const gestartet = useRef(false);

  useEffect(() => {
    if (q === '' || gestartet.current) return;
    gestartet.current = true;
    import('../../lib/presetIndex').then((m) => setPresetSucheFn(() => m.presetSuche)).catch(() => setPresetSucheFn(() => () => []));
    // Artikel-Volltext: Lib + ~4 MB-Index lazy (eigener Chunk). Bei Fehlschlag
    // bleibt die Gruppe leer statt die ganze Suche zu blockieren (§8).
    import('../../lib/suche/artikelVolltext').then((m) => m.ladeArtikelSuche()).then((fn) => setArtikelSucheFn(() => fn)).catch(() => setArtikelSucheFn(() => () => []));
    import('../../lib/normtext/browse').then((m) => m.ladeBrowseManifest()).then((m) => setGesetze(m?.erlasse ?? [])).catch(() => setGesetze([]));
    import('../../lib/rechtsprechung/browse').then((m) => m.ladeEntscheidManifest()).then((m) => setEntscheide(m?.entscheide ?? [])).catch(() => setEntscheide([]));
    import('../../lib/materialien/browse').then((m) => m.ladeMaterialManifest()).then((m) => setMaterialien(m?.materialien ?? [])).catch(() => setMaterialien([]));
  }, [q]);

  const gruppen = useMemo(
    // Presets ungekappt holen (limit 999) — `gesamt` soll die ECHTE Trefferzahl
    // sein, nicht das Default-Suchlimit (§8). Die Anzeige kappt in der Gruppe.
    () => sucheAlles(q, {
      presets: presetSucheFn ? presetSucheFn(q, 999) : null,
      gesetze,
      artikel: artikelSucheFn ? artikelSucheFn(q, 25) : null,
      entscheide,
      materialien,
    }),
    [q, presetSucheFn, artikelSucheFn, gesetze, entscheide, materialien],
  );
  const allesGeladen = presetSucheFn !== null && artikelSucheFn !== null && gesetze !== null && entscheide !== null && materialien !== null;
  return { gruppen, allesGeladen };
}
