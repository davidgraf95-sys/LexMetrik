import { typVonRoute } from '../../lib/zuletztVerwendet';

// ─── D23 (David 6.9.2026) · DIE ART EINES TREFFERS, EINMAL BENANNT ──────────
//
// Davids Soll-Anatomie für die Kopf-Suche: «Einträge mit Kurzform + kleiner
// Art-Angabe rechts (Gesetz · Entscheid · Rechner) in ink-3». Die Zuordnung
// Route → Art gibt es im Haus bereits genau einmal — `typVonRoute`
// (`lib/zuletztVerwendet`, erste Pfadebene, deterministisch §2). Hier steht
// nur noch die BESCHRIFTUNG dieser sechs Typen, nicht eine zweite Ableitung
// (§5). `seite` (Meta-/Infoseiten) bekommt bewusst KEINE Beschriftung: eine
// erfundene Art wäre schlechter als keine (§8) — der Platz bleibt leer.
const ART_LABEL: Record<string, string> = {
  gesetz: 'Gesetz',
  entscheid: 'Entscheid',
  material: 'Materialie',
  rechner: 'Rechner',
  vorlage: 'Vorlage',
};

/** Art-Angabe einer Route («Gesetz» · «Entscheid» · …) — oder null. */
export function artVonRoute(route: string): string | null {
  return ART_LABEL[typVonRoute(route)] ?? null;
}
