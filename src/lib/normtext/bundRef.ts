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

// FEDLEX-Key → Snapshot-quelle (Dateiname public/normtext/bund/<QUELLE>.json).
// Nur hier gepflegt; nicht jeder FEDLEX-Key hat einen Snapshot (dann nicht
// gelistet → kein Popover, Live-Link bleibt).
const SNAPSHOT_QUELLE: Partial<Record<FedlexGesetz, string>> = {
  OR: 'OR',
  ZGB: 'ZGB',
  ZPO: 'ZPO',
  SchKG: 'SCHKG',
  ArG: 'ARG',
  VMWG: 'VMWG',
  StPO: 'STPO',
  VwVG: 'VWVG',
  GebVSchKG: 'GEBV_SCHKG',
  BGG: 'BGG',
  BGerR: 'BGERR',
  VVG: 'VVG',
  HRegV: 'HREGV',
  KVG: 'KVG',
  KVV: 'KVV',
};

export function bundSnapshotRef(
  zitat: string,
): { quelle: string; token: string; absatz: string | null } | null {
  const gesetz = erkenneFedlexGesetz(zitat);
  if (!gesetz) return null;
  const quelle = SNAPSHOT_QUELLE[gesetz];
  if (!quelle) return null;
  const passus = parsePassus(zitat);
  if (!passus) return null;
  return { quelle, token: passus.artikelToken, absatz: passus.absatz };
}
