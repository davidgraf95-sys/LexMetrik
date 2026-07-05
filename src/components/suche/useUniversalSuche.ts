import { useEffect, useMemo, useRef, useState } from 'react';
import { sucheAlles, sprungGruppe, type SuchGruppe, type SuchTreffer } from '../../lib/universalSuche';
import { holeOnlineTreffer, MIN_ZEICHEN } from '../../lib/suche/onlineVolltext';
import { baueNormIndex, parseNormQuery } from '../../lib/suche/normQuery';
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
  const [onlineGruppe, setOnlineGruppe] = useState<SuchGruppe | null>(null);
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

  // Online-Volltextsuche (QS-DATA E2): zusätzliche Edge-Gruppe, die UNTEN
  // anwächst. Eigener kleiner Debounce ZUSÄTZLICH zum 120-ms-Debounce der
  // Wrapper (Netz ist teurer als ein lazy Import); erst ab MIN_ZEICHEN. Bei
  // Degradation (503/Netz/Timeout) liefert holeOnlineTreffer null → Gruppe
  // verschwindet, der statische Index trägt weiter (§8). Kein Zustand hält
  // je einen Volltext — die Edge liefert by design nur Snippets (§15.4).
  useEffect(() => {
    let abgebrochen = false;
    const kurz = q.trim().length < MIN_ZEICHEN;
    // Wall-Clock als Eingabe (§2 — Date.now lebt in der Komponentenschicht, nicht in src/lib).
    const id = setTimeout(() => {
      if (kurz) { if (!abgebrochen) setOnlineGruppe(null); return; }
      holeOnlineTreffer(q, { jetzt: () => Date.now() }).then((g) => { if (!abgebrochen) setOnlineGruppe(g); });
    }, kurz ? 0 : 200);
    return () => { abgebrochen = true; clearTimeout(id); };
  }, [q]);

  // Norm-Sprung-Parser (A5, W2·5d): baut den Auflösungs-Index EINMAL pro geladenem
  // Gesetzes-Manifest (KEIN Zweit-Index, K10 — der Parser sitzt auf denselben
  // `gesetze`, die die Gruppen-Suche ohnehin lädt). Deterministisch (§2): erkennt
  // die Eingabe eine eindeutige Norm («OR 257d», «Art. 5 AIG»), liefert er den
  // Deep-Link; Freitext → null → nur die normale Suche.
  const normIndex = useMemo(() => (gesetze ? baueNormIndex(gesetze) : null), [gesetze]);
  const direkt = useMemo(() => (normIndex ? parseNormQuery(q, normIndex) : null), [normIndex, q]);

  const gruppen = useMemo(
    // Presets ungekappt holen (limit 999) — `gesamt` soll die ECHTE Trefferzahl
    // sein, nicht das Default-Suchlimit (§8). Die Anzeige kappt in der Gruppe.
    // Reihenfolge (A6): Norm-Sprung (A5) ZUOBERST → statische Relevanz-Gruppen →
    // Online-Edge-Gruppe (E2) UNTEN. Die Online-Gruppe hängt IMMER hinter den
    // statischen Gruppen (§11.3 b: Edge als Ergänzung, statischer Index bleibt
    // Fallback/oben) — CLS-sicher, weil sie nur unten anwächst und nichts darüber
    // verschiebt (§15.2). Der Sprung oben ist ein einzelner deterministischer
    // Treffer, der ebenfalls nichts verdrängt (er ersetzt keine Freitext-Gruppe).
    () => {
      const statisch = sucheAlles(q, {
        presets: presetSucheFn ? presetSucheFn(q, 999) : null,
        gesetze,
        artikel: artikelSucheFn ? artikelSucheFn(q, 40) : null,
        entscheide,
        materialien,
      });
      const sprung = sprungGruppe(direkt);
      return [
        ...(sprung ? [sprung] : []),
        ...statisch,
        ...(onlineGruppe ? [onlineGruppe] : []),
      ];
    },
    [q, direkt, presetSucheFn, artikelSucheFn, gesetze, entscheide, materialien, onlineGruppe],
  );
  const allesGeladen = presetSucheFn !== null && artikelSucheFn !== null && gesetze !== null && entscheide !== null && materialien !== null;
  return { gruppen, allesGeladen };
}
