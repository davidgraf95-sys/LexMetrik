// scripts/entstehung/synopse-register.ts
// Quell-Register der Synopse-Shards (E5, §11.6) — der committete Beleg, WOHER jeder
// Alt-Block stammt und ob er sich seither bewegt hat.
//
// Es trägt zwei Prüfsummen-Ebenen (Muster law.soufien.lu, `soufien-lex.md`):
//  · je Stand den sha256 der amtlichen AKN-XML-Manifestation (Bytes der Quelle),
//  · je Erlass den sha256 des kanonisch serialisierten Shards (kanonisches JSON).
// Erst beide zusammen trennen «das Gesetz hat sich geändert» von «unser Parser hat
// sich geändert» (§7d) — die Bedingung, die `check:entstehung` durchsetzt.
//
// Ablage: `bibliothek/register/entstehung-synopse.json` (wie `entstehung-anker.json`
// und `entstehung-deckung.json` — Register leben in der Bibliothek, nicht in public/).

/** Ein ausgewerteter Stand im Register (schlank: Datum + Quell-sha + URL). */
export interface SynopseRegisterStand {
  datum: string;
  sha: string;
  xmlUrl: string;
}

/** Ein Erlass im Register. */
export interface SynopseRegisterErlass {
  eli: string;
  abgerufen: string;
  /** sha256 des kanonisch serialisierten Shards. */
  shardSha: string;
  bytes: number;
  schritte: number;
  altBloecke: number;
  staende: SynopseRegisterStand[];
  /** Nur gesetzt, wenn ein Lauf mit `--parser-neu="<Grund>"` entsperrt wurde. */
  parserAenderung?: string;
}

export interface SynopseRegister {
  erzeugt: string;
  /** Normalisierungs-Profil, unter dem die Prüfsummen gebildet wurden. */
  normProfil: string;
  erlasse: Record<string, SynopseRegisterErlass>;
}

export const SYNOPSE_REGISTER_PFAD = 'bibliothek/register/entstehung-synopse.json';

/** Kanonische Serialisierung (Erlasse alphabetisch — byte-deterministisch, §2). */
export function serialisiereSynopseRegister(r: SynopseRegister): string {
  const erlasse: Record<string, SynopseRegisterErlass> = {};
  for (const k of Object.keys(r.erlasse).sort()) erlasse[k] = r.erlasse[k];
  return `${JSON.stringify({ erzeugt: r.erzeugt, normProfil: r.normProfil, erlasse }, null, 2)}\n`;
}
