// scripts/entstehung/anker-register.ts
// Quell-Register der Botschafts-Anker (E2, §11.6 (2)/(5)): je Botschaft der Hash des
// amtlichen HTML, seine HTTP-Currency-Marker und der Hash des daraus erzeugten Sidecars.
//
// WOZU ZWEI HASHES: `sha` ist der QUELL-Hash (das amtliche HTML), `sidecarSha` der
// ERZEUGNIS-Hash. Nur mit beiden lässt sich OFFLINE unterscheiden, ob ein Sidecar sich
// geändert hat, weil die amtliche Quelle sich geändert hat (legitim), oder ohne
// Quelländerung (= Parser-Drift, §7d) — der Determinismus-Wächter aus §11.6 (5)
// (Muster Lex/SFHAJJI, bibliothek/materialien/entstehung-2026-09-06/sfhajji-lex-dossier.md).
// Das Register lebt in bibliothek/, nicht in public/ — es ist Prüf-Zustand, keine Nutzlast.

export const ANKER_REGISTER_PFAD = 'bibliothek/register/entstehung-anker.json';

export interface AnkerQuelle {
  fga: string;
  htmlUrl: string;
  /** sha256 des amtlichen HTML (Quell-Hash). */
  sha: string;
  lastModified: string | null;
  contentLength: number | null;
  abgerufen: string;
  ankerZahl: number;
  /** sha256 des erzeugten Sidecars; null = kein Sidecar (0 Anker). */
  sidecarSha: string | null;
  /** Benannter Grund einer PARSER-Änderung bei unverändertem Quell-Hash (§11.6 (5)).
   *  Fehlt er, verweigert der Generator den Schreibvorgang — eine Extraktions-Korrektur
   *  darf nie wie eine Gesetzesänderung aussehen. */
  parserAenderung?: string;
}

export interface AnkerRegister {
  erzeugt: string;
  quellen: Record<string, AnkerQuelle>;
}

/** Byte-deterministische Serialisierung (Schlüssel sortiert). */
export function serialisiereAnkerRegister(r: AnkerRegister): string {
  const quellen: Record<string, AnkerQuelle> = {};
  for (const k of Object.keys(r.quellen).sort()) quellen[k] = r.quellen[k];
  return JSON.stringify({ erzeugt: r.erzeugt, quellen }, null, 2) + '\n';
}
