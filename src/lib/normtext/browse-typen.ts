// Browse-Manifest-Schema (Rubrik V «Gesetze»): EIN Eintrag pro Erlass für die
// Übersicht — Identität/Taxonomie aus dem Register, ableitbare Felder aus den
// Snapshots (§5). Generiert von scripts/normtext/browse-manifest.ts nach
// public/normtext/register.json; lazy geladen (nie im Bundle, §3).

import type { Rechtsgebiet, Sprache, ErlassStatus } from './register';

export interface BrowseErlass {
  key: string;
  ebene: 'bund' | 'kanton';
  kanton: string | null;
  kuerzel: string;
  titel: string;
  sr: string | null;
  rechtsgebiet: Rechtsgebiet;
  sprache: Sprache;
  rang: number;
  status: ErlassStatus;
  // ── abgeleitet aus dem Snapshot (NICHT im Register, §5) ──
  /** Pfad relativ zu public/normtext, z.B. 'bund/OR.json'; null bei nur-live-link. */
  datei: string | null;
  /** Anzahl Artikel-Einträge (eintraege.length); 0 bei nur-live-link. */
  artikelAnzahl: number;
  /** Spätestes Fassungs-/Standdatum der Einträge (ISO) oder Register-Stand. */
  stand: string;
  /** Amtliche Basis-URL ohne #-Anker. */
  quelleUrl: string;
  /** Drift-Token des ersten Eintrags (UI-Anzeige) oder ''. */
  fassungsToken: string;
  /** Nur status 'pdf-embed': Pfad zum gehosteten amtlichen PDF (z.B. 'pdf/EMRK.pdf'), sonst null. */
  pdfPfad: string | null;
}

export interface BrowseManifest {
  erzeugt: string;
  erlasse: BrowseErlass[];
}
