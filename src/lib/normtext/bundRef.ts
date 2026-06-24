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
  StGB: 'STGB',
  StG: 'STG',
  GebVHReg: 'GEBV_HREG',
  // Erweiterung 17.6.2026 (jedes zitierte Bundesgesetz mit Volltext-Snapshot).
  MWSTG: 'MWSTG',
  URG: 'URG',
  BewG: 'BEWG',
  EOG: 'EOG',
  SVG: 'SVG',
  DSG: 'DSG',
  BBG: 'BBG',
  GBV: 'GBV',
  JStPO: 'JSTPO',
  // Punkt 12 Batch 1 (24.6.2026): Bund-Gesetze aus Davids Bookmark-Liste.
  BUEG: 'BUEG', BGOE: 'BGOE', BPR: 'BPR', VG: 'VG', PUBLG: 'PUBLG',
  PARLG: 'PARLG', RVOG: 'RVOG', BOEB: 'BOEB', BPG: 'BPG', STBOG: 'STBOG',
  DESG: 'DESG', OHG: 'OHG', NHG: 'NHG', ENTG: 'ENTG', GSCHG: 'GSCHG',
  ENTSG: 'ENTSG', ELG: 'ELG', FZG: 'FZG', WAG: 'WAG', PUEG: 'PUEG',
  FIDLEG: 'FIDLEG', KAG: 'KAG', FINIG: 'FINIG', FINFRAG: 'FINFRAG', VAG: 'VAG',
};

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
