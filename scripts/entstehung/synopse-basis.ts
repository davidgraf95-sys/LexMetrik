// scripts/entstehung/synopse-basis.ts
// Gemeinsame Basis-Bausteine für `synopse.ts` und `quellluecken.ts` — ausgelagert, damit
// keiner der beiden Zweige den anderen importiert (check:zyklen, Auflage nach PR #804:
// der ursprüngliche Split legte `findeQuellLuecken` nach `quellluecken.ts`, das aber
// `tokenAusEId`/`StandProfil` aus `synopse.ts` zurückimportierte — ein Zyklus, den ein
// drittes, RÜCKIMPORT-FREIES Modul auflöst). REIN wie der Rest der Synopse-Bausteine —
// kein Fetch, kein Schreiben, kein Date.now (§2).
import { ankerNachToken } from '../materialien/fedlex-anker.ts';

/** eId → kanonischer Korpus-Token («art_38_a» → «38_a»); null = kein Artikel-Token. */
export function tokenAusEId(eId: string): string | null {
  return ankerNachToken(eId);
}

/**
 * Das LEICHTE Profil eines Stands — alles, was die Lücken-Erkennung über die ganze
 * Kette braucht, und nichts weiter.
 *
 * WARUM NICHT DIE GANZEN `ArtikelFassung`-Karten AUFHEBEN: der Runner hält bisher genau
 * EINEN Stand im Speicher (`vorher`), weil ein einzelner Stand bis 9,7 MB rohes XML wiegt
 * (R2 §2) und ein Erlass bis 29 Stände führt. Die Erkennung braucht davon nur die
 * eId-Menge und je eId eine Prüfsumme — gemessen wenige KB je Erlass statt Hunderten MB.
 */
export interface StandProfil {
  /** Alle `<article eId=…>` dieses Stands. */
  eIds: Set<string>;
  /** eId → sha256 über den NORMALISIERTEN Wortlaut (dieselbe Vergleichsform wie `shaNorm`). */
  norm: Map<string, string>;
  /** Korpus-Token der Artikel, die dieser Stand als `<mod>`/`<quotedStructure>` eines
   *  Änderungsanhangs führt (amtliche Änderungs-Referenz `fedlex:role="modification-
   *  reference"`). Das ist der POSITIVE Beleg, dass die Datei den Artikel trotz fehlendem
   *  `<article>` trägt — die Struktur ist verrutscht, nicht der Text verschwunden. */
  anhangTokens: Set<string>;
}
