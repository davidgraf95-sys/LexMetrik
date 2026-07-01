// Rank 2 (QS-PERF, §15/3): Import-Thunks + idle-Prefetch der schweren Leser-Chunks.
//
// EINE Quelle der Chunk-Specifier (§5): sowohl die lazyRetry-Definitionen in
// RouteSwitch als auch prefetchLeser() nutzen dieselben Thunks → Vite dedupt auf
// denselben Chunk (Vorwärmen trifft exakt den später geladenen Chunk). Eigene
// Datei, weil RouteSwitch.tsx (Komponenten-Modul) unter react-refresh nur
// Komponenten exportieren darf.
//
// Der Gesetzes-Leser ist der schwerste Route-Chunk; ihn nach dem Erstpaint idle
// vorzuwärmen spart beim ersten Gesetz-Öffnen die Chunk-Parse-Wartezeit/den
// Spinner-Frame auf schwacher CPU. Rein additiv — ändert nur den Ladezeitpunkt,
// nie Inhalt/Reihenfolge (§6.4).
export const importGesetzLeser = () =>
  import('./pages/GesetzLeser').then((m) => ({ default: m.GesetzLeser }));
export const importEntscheidLeser = () =>
  import('./pages/EntscheidLeser').then((m) => ({ default: m.EntscheidLeser }));

/** Wärmt die schweren Leser-Chunks vor (nur aus einem Client-useEffect rufen). */
export function prefetchLeser() {
  // Best-effort: Fehler (offline / veralteter Chunk-Hash nach Deploy) bewusst
  // schlucken — der echte Route-Load fängt sie ohnehin über lazyRetry. Ohne .catch
  // bliebe eine unbehandelte Promise-Rejection (Konsolen-Rauschen / Error-Reporter).
  void importGesetzLeser().catch(() => {});
  void importEntscheidLeser().catch(() => {});
}
