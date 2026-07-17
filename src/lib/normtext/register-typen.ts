// ─── Erlass-Register: Typen ──────────────────────────────────────────────────
//
// H-8/B22 (12.7.2026): Aus register.ts ausgelagert (reiner Typ-Move) — löst den
// Typ-Zyklus register.ts <-> bund-stubs.generated.ts/grundart.generated.ts/
// international-extern.ts/pdf-embed.ts (madge check:zyklen). Diese vier Dateien
// importierten `import type { ErlassRegistereintrag, … } from './register'`,
// während register.ts umgekehrt ihre WERTE (BUND_STUBS, GRUNDART_SEED, …)
// importierte — ein reiner Datei-Zyklus ohne Laufzeit-Risiko, aber madge zählt
// `import type` genauso wie Wert-Importe. Fix: die Typen leben jetzt hier, ohne
// Rückimport auf register.ts; register.ts re-exportiert sie mit `export type`
// (isolatedModules-sicher, erzeugt keinen Wert-Import). Kein Konsument bricht,
// da alle bisherigen `from './register'`-Importe weiter aufgelöst werden.

import type { FedlexGesetz } from '../fedlex';
import type { ErlassAufhebung } from './aufhebungen';

/** Kanzleirelevante Sach-Achsen. Bund deklariert je Erlass; Kanton-Default unten. */
export type Rechtsgebiet =
  | 'privat' | 'straf' | 'prozess'
  | 'oeffentlich' | 'schkg' | 'sozial-abgaben' | 'international';

export type Sprache = 'de' | 'fr' | 'it';
// 'snapshot'      = strukturierter Volltext-Snapshot (public/normtext/.../KEY.json)
// 'pdf-embed'     = amtliches PDF in-app eingebettet (public/normtext/pdf/KEY.pdf) —
//                   Fallback, wenn kein extrahierbarer Volltext-HTML existiert; das
//                   Angezeigte IST die amtliche Fassung (§7/§8, kein Extraktionsrisiko).
// 'nur-live-link' = nur Link zur amtlichen Quelle (kein In-App-Text).
export type ErlassStatus = 'snapshot' | 'pdf-embed' | 'nur-live-link';

// Render-dominante Grundart (§2.2 FAHRPLAN-GESETZES-UX.md, W2·5d). Steuert die
// Designvorschrift je Erlass; Datengrundlage ist die UX-Audit-Klassifikation
// (grundart.generated.ts, Seed per key). Deklariert (§2), nie zur Laufzeit geraten.
export type Grundart =
  | 'KODIFIKATION' | 'STANDARD_ERLASS' | 'ERLASS_MIT_ANHANG'
  | 'FLACHER_KURZERLASS' | 'STAATSVERTRAG' | 'KANTON'
  | 'PDF_EMBED' | 'LIVE_VERWEIS';

export type ErlassTyp =
  | 'gesetz' | 'verordnung' | 'staatsvertrag' | 'verfassung' | 'sonstiges';

export interface ErlassRegistereintrag {
  /** == Snapshot-Datei-Stamm ohne .json: 'OR', 'GEBV_SCHKG', 'BE-161.12'. */
  key: string;
  ebene: 'bund' | 'kanton';
  /** nur Kanton: Kantonskürzel 'BE'. */
  kanton?: string;
  /** Anzeige-Kürzel ('OR', 'GebV SchKG'). */
  kuerzel: string;
  /** Volltitel des Erlasses. */
  titel: string;
  /** Bund: SR-Nummer ('220'); Kanton: kant. Systematiknummer. */
  sr?: string;
  rechtsgebiet: Rechtsgebiet;
  sprache: Sprache;
  /** Sortiergewicht innerhalb (ebene, rechtsgebiet); Leitgesetze niedrig. */
  rang: number;
  status: ErlassStatus;
  /** Bund: FEDLEX-Schlüssel (hält fedlex.ts ↔ Register synchron, Tor). */
  fedlexKey?: FedlexGesetz;
  /** Nur status 'nur-live-link' (kein Snapshot): Pflicht. */
  quelleUrl?: string;
  stand?: string;
  /** Nur status 'pdf-embed': Pfad zum gehosteten amtlichen PDF (relativ zu
   *  public/normtext, z.B. 'pdf/EMRK.pdf'). sha/Bytes stehen in pdf-index.json. */
  pdfPfad?: string;
  /** Render-dominante Grundart (§2.2). Bei Assembly aus GRUNDART_SEED gemerged
   *  (mitGrundart, Match per key). Präsenz für snapshot/pdf-embed erzwingt das Tor
   *  check:grundart (§5.2); TS bleibt optional, weil die vier Register-Quellen —
   *  darunter die auto-generierte bund-stubs — heterogen sind. */
  grundart?: Grundart;
  /** Behebt den Heuristik-Bug «Verordnung als Bundesgesetz betitelt» (§5.1):
   *  das Kopf-Label leitet sich hieraus ab (G2b), nicht aus rechtsgebiet+ebene. */
  erlassTyp?: ErlassTyp;
  /** Nur KANTON: §-vs-Art.-Etikett aus Signal paragrafZaehlung. NUR sichtbares
   *  Label — NIE der Anker (K2/R8, Anker bleibt art-<token>). entwurf bis
   *  Kanton-Verifikation gegen die amtliche Quelle (K6/§8). */
  bestimmungsEtikett?: 'art' | 'paragraf';
  bestimmungsEtikettStatus?: 'entwurf';
  /** §8-Ehrlichkeit: der Erlass ist von Fedlex GANZ aufgehoben (jolux:dateNo-
   *  LongerInForce). Der Snapshot bleibt als historische Fassung nutzbar, wird
   *  aber nie mehr als geltend dargestellt. Deklariert in aufhebungen.ts (SSoT),
   *  per key gemerged (mitAufhebung); der Generator projiziert es nach
   *  register.json. Absenz = geltend (Default). */
  aufgehoben?: ErlassAufhebung;
}
