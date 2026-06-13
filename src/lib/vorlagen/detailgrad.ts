// ─── Detailgrad-Konvention (FAHRPLAN-VERTRAGS-VARIANTEN P0) ──────────────────
//
// Auftrag David 13.6.2026: Verträge in den Stufen «einfach bis experte». Reine
// Darstellungs-/Auswahl-Schicht über DEMSELBEN Schema (§3/§5): ein Feld
// `detailgrad` steuert per `includeIf`, welche Bausteine aufgenommen werden.
//
// Golden-Invariante (§6): `standard` ist der Default und reproduziert den
// bisherigen Output jeder Vorlage BYTE-GENAU. `einfach` blendet Kür-Klauseln
// aus (Kernpflichten bleiben), `experte` ergänzt Zusatz-Module. Jede Detailgrad-
// Einführung ist damit additiv und golden-bewiesen.

import type { Bedingung } from './engine';

export type Detailgrad = 'einfach' | 'standard' | 'experte';

export const DETAILGRAD_DEFAULT: Detailgrad = 'standard';

export const DETAILGRAD_OPTIONEN: { id: Detailgrad; label: string; sub: string }[] = [
  { id: 'einfach', label: 'Einfach', sub: 'nur die Kernklauseln' },
  { id: 'standard', label: 'Standard', sub: 'vollständige Grundausstattung' },
  { id: 'experte', label: 'Experte', sub: 'mit allen Zusatzmodulen' },
];

// Wiederverwendbare includeIf-Bedingungen für die Schemas:
//  AB_STANDARD – Klausel erscheint ab «standard» (nicht in «einfach»).
//  NUR_EXPERTE – Klausel/Modul nur in «experte».
export const AB_STANDARD: Bedingung = { feld: 'detailgrad', in: ['standard', 'experte'] };
export const NUR_EXPERTE: Bedingung = { feld: 'detailgrad', eq: 'experte' };
