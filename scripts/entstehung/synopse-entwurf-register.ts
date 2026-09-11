// scripts/entstehung/synopse-entwurf-register.ts
// Quell-Register der Entwurf↔Beschluss-Shards (E6, §11.6) — derselbe Bau wie
// `synopse-register.ts`: je Vorlage die Quell-sha BEIDER BBl-Dokumente (Bytes der
// Quelle) und der sha des kanonisch serialisierten Shards (kanonisches JSON). Erst
// beide zusammen trennen «das Parlament hat den Entwurf verändert» von «unser Parser
// hat sich verändert» (§7d).

export interface EntwurfRegisterVorlage {
  projEli: string;
  entwurfFga: string;
  beschlussFga: string;
  /** sha256 des Entwurfs-HTML. */
  entwurfSha: string;
  /** sha256 des Schlussabstimmungstext-HTML. */
  beschlussSha: string;
  /** sha256 des kanonisch serialisierten Shards. */
  shardSha: string;
  bytes: number;
  artikel: number;
  unveraendert: number;
  /** Zahl der Labels, die im selben Dokument mehrfach vorkommen (nicht gejoint, §1). */
  mehrdeutig: number;
  abgerufen: string;
  /** Nur gesetzt, wenn ein Lauf mit `--parser-neu="<Grund>"` entsperrt wurde. */
  parserAenderung?: string;
}

export interface EntwurfRegister {
  erzeugt: string;
  normProfil: string;
  vorlagen: Record<string, EntwurfRegisterVorlage>;
}

export const ENTWURF_REGISTER_PFAD = 'bibliothek/register/entstehung-entwurf.json';

/** Kanonische Serialisierung (Vorlagen alphabetisch — byte-deterministisch, §2). */
export function serialisiereEntwurfRegister(r: EntwurfRegister): string {
  const vorlagen: Record<string, EntwurfRegisterVorlage> = {};
  for (const k of Object.keys(r.vorlagen).sort()) vorlagen[k] = r.vorlagen[k];
  return `${JSON.stringify({ erzeugt: r.erzeugt, normProfil: r.normProfil, vorlagen }, null, 2)}\n`;
}
