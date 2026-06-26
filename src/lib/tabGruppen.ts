// Geteilte Reiter-Gruppierung (SSoT §5): EINE Stelle für die Kategorie- und
// Herkunfts-Achse der offenen Reiter — genutzt vom horizontalen TabStreifen UND
// vom vertikalen TabPanel (Auftrag David 26.6.2026). Reine, deterministische
// Funktionen (§2/§3): aus Pfad bzw. aufgelöstem Erlass; kein DOM, kein Register.

import { pfadTeil, erlassVonPfad, type VerlaufManifeste } from './verlaufLabel';

export type TabKat = 'gesetze' | 'rechtsprechung' | 'vorlagen' | 'rechner' | 'sonstiges';

// Kategorie rein aus dem Pfad-Präfix ableiten: die Tool-Routen sind /rechner/*
// bzw. /vorlagen/*, die Reader /gesetze/:e/:k bzw. /rechtsprechung/:k.
export function reiterKategorie(path: string): TabKat {
  const p = pfadTeil(path);
  if (p.startsWith('/gesetze/')) return 'gesetze';
  if (p.startsWith('/rechtsprechung/')) return 'rechtsprechung';
  if (p.startsWith('/vorlagen/')) return 'vorlagen';
  if (p.startsWith('/rechner/')) return 'rechner';
  return 'sonstiges';
}

// Piktogramm + Sammel-Label je Kategorie. Glyphen im Messing-Stil der App.
export const KAT_META: Record<TabKat, { label: string; pikto: string }> = {
  gesetze: { label: 'Gesetze', pikto: '§' },
  rechtsprechung: { label: 'Rechtsprechung', pikto: '⚖' },
  vorlagen: { label: 'Vorlagen', pikto: '✎' },
  rechner: { label: 'Rechner', pikto: '∑' },
  sonstiges: { label: 'Weitere', pikto: '◦' },
};
// Feste Reihenfolge der Sammel-Reiter (stabil, unabhängig von Öffnungs-Reihenfolge).
export const KAT_ORDER: TabKat[] = ['gesetze', 'rechtsprechung', 'vorlagen', 'rechner', 'sonstiges'];

export type Herkunft = 'bund' | 'kanton' | 'international';
export const HERKUNFT_ORDER: Herkunft[] = ['bund', 'kanton', 'international'];
export const HERKUNFT_LABEL: Record<Herkunft, string> = {
  bund: 'Bund', kanton: 'Kanton', international: 'International',
};

/** Herkunft eines Gesetz-Reiters aus dem aufgelösten Erlass: «international»
 *  (Staatsvertrag/EU) hat Vorrang, sonst Bund/Kanton aus der Ebene — analog zur
 *  Breadcrumb im GesetzLeser. null = kein auflösbarer Gesetz-Pfad (z. B. Manifest
 *  noch nicht geladen, oder Nicht-Gesetz-Reiter). */
export function herkunftVon(path: string, m: VerlaufManifeste = {}): Herkunft | null {
  const e = erlassVonPfad(path, m);
  if (!e) return null;
  if (e.rechtsgebiet === 'international') return 'international';
  return e.ebene === 'bund' ? 'bund' : 'kanton';
}

/** Kantonskürzel eines Reiters, falls er ein KANTONALES Gesetz zeigt; sonst null. */
export function kantonVonPfad(path: string, m: VerlaufManifeste = {}): string | null {
  const e = erlassVonPfad(path, m);
  return e?.ebene === 'kanton' ? e.kanton ?? null : null;
}

/** Artikel-Token aus dem #art-Anker eines Reiter-Pfads als «Art. N» (P2). */
export function artikelLabelVonPfad(path: string): string | null {
  const m = /#art-(.+)$/.exec(path);
  if (!m) return null;
  const tok = decodeURIComponent(m[1]).replace(/_/g, '');
  return tok ? `Art. ${tok}` : null;
}
