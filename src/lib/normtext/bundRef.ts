// Resolver: Normverweis-Text → Bund-Snapshot-Quelle. Reine Auflösungsschicht
// (§3): erkennt das Gesetz über den EINEN Helfer erkenneFedlexGesetz, mappt den
// FEDLEX-Key auf den Snapshot-Dateinamen (cache-Name-Uppercase, weicht von den
// FEDLEX-Keys ab) und zerlegt das Zitat über parsePassus. KEINE Rechtsregel,
// kein Normtext — nur Adressierung der statischen Snapshot-Datei.
//
// Liefert null, wenn das Gesetz unbekannt ist, kein Snapshot existiert
// (ungemappt) oder der Text keinen Artikel enthält → die UI fällt dann ruhig
// auf den direkten Live-Link zurück (progressive enhancement).

import { erkenneFedlexGesetz, type FedlexGesetz } from '../fedlex';
import { parsePassus } from './passus';
import { ERLASS_REGISTER } from './register';

// FEDLEX-Key → Snapshot-quelle (Dateiname public/normtext/bund/<QUELLE>.json).
//
// ABGELEITET aus dem ERLASS_REGISTER (SSoT §5): die Beziehung FEDLEX-Key →
// Snapshot-Dateistamm ist genau `fedlexKey → key` jedes Bund-Eintrags mit
// status 'snapshot'. Früher als 52-zeilige Handtabelle gepflegt — die driftete
// (Ultracode-Review 25.6.2026 fand 34 Volltext-Snapshots, deren Inline-Popover
// stumm auf den Live-Link zurückfiel, obwohl der Volltext lokal vorlag, weil
// der Tabellen-Eintrag beim Promovieren vergessen wurde). Die Ableitung kann
// nicht mehr driften: jeder im Register als Snapshot geführte Erlass ist im
// Popover erreichbar. Nicht jeder FEDLEX-Key hat einen Snapshot (Stub → nicht
// im Map → kein Popover, Live-Link bleibt).
const SNAPSHOT_QUELLE: Partial<Record<FedlexGesetz, string>> = Object.fromEntries(
  ERLASS_REGISTER
    .filter((r) => r.ebene === 'bund' && r.status === 'snapshot' && r.fedlexKey)
    .map((r) => [r.fedlexKey as FedlexGesetz, r.key]),
) as Partial<Record<FedlexGesetz, string>>;

export function bundSnapshotRef(
  zitat: string,
): { quelle: string; token: string; absatz: string | null; lit?: string; ziff?: string } | null {
  const gesetz = erkenneFedlexGesetz(zitat);
  if (!gesetz) return null;
  const quelle = SNAPSHOT_QUELLE[gesetz];
  if (!quelle) return null;
  const passus = parsePassus(zitat);
  if (!passus) return null;
  // lit/ziff aus dem Zitat mitliefern (nur wenn genannt), damit das Popover
  // GENAU das zitierte Aufzählungs-Item markieren kann (einheitlich mit Kanton).
  return {
    quelle,
    token: passus.artikelToken,
    absatz: passus.absatz,
    ...(passus.lit != null ? { lit: passus.lit } : {}),
    ...(passus.ziff != null ? { ziff: passus.ziff } : {}),
  };
}
