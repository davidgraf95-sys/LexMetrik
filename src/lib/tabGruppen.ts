// Geteilte Reiter-Gruppierung (SSoT §5): EINE Stelle für die Kategorie- und
// Herkunfts-Achse der offenen Reiter — genutzt von der Topbar-Reiter-Übersicht
// (ReiterUebersicht/TabPanel, Auftrag David 26.6.2026). Reine, deterministische
// Funktionen (§2/§3): aus Pfad bzw. aufgelöstem Erlass; kein DOM, kein Register.

import { pfadTeil, erlassVonPfad, type VerlaufManifeste } from './verlaufLabel';
import { routenEbene } from './normtext/erlassAdresse';

export type TabKat = 'gesetze' | 'rechtsprechung' | 'materialien' | 'vorlagen' | 'rechner' | 'sonstiges';

/** Die fünf Bereiche als Pfad-Präfix. Bewusst hier und nicht aus
 *  `components/layout/bereiche.ts` importiert: das ist die Darstellungsschicht
 *  (§3), und sie fasst Rechner und Vorlagen zu EINEM Register «Werkzeuge»
 *  zusammen — die Reiter-Gruppierung hält sie getrennt. Zwei Achsen, zwei
 *  Tabellen; die Reihenfolge ist die von `KAT_ORDER`/`BEREICHS_UEBERSICHTEN`. */
const BEREICHS_KAT = ['gesetze', 'rechtsprechung', 'materialien', 'vorlagen', 'rechner'] as const;

// Kategorie rein aus dem BEREICHS-PRÄFIX ableiten: die Tool-Routen sind
// /rechner/* bzw. /vorlagen/*, die Reader /gesetze/:e/:k bzw.
// /rechtsprechung/:k — und die Übersicht des Bereichs selbst.
//
// ── Aus Fixer 1i (Prüfbefund 6.9.2026) · DIE ÜBERSICHT GEHÖRT IN IHRE GRUPPE
// GEMESSEN: der Reiter `/gesetze` stand im Überlauf-Blatt unter «Weitere»
// statt unter «Gesetze» — die Prüfungen verlangten alle einen Schrägstrich
// NACH dem Bereich (`/gesetze/…`), und genau den trägt die Übersicht nicht.
// Seit D7 ist sie aber ein Reiter wie jedes andere Dokument
// (`lib/tabs.BEREICHS_UEBERSICHTEN`); ein Bereich, dessen eigene Übersicht
// nicht in seiner Gruppe steht, ist keine Gruppierung, sondern ein Loch.
// (M2, 6.9.2026, gilt unverändert mit: ohne die `materialien`-Zeile landete
// jede Material-Detailseite unter «Weitere».)
//
// ROT ZU BEKOMMEN (§6.7): das `p === \`/${kat}\``-Glied streichen ⇒ der Fall
// «die Bereichs-Übersicht steht in ihrer Gruppe» misst wieder «sonstiges».
export function reiterKategorie(path: string): TabKat {
  const p = pfadTeil(path);
  for (const kat of BEREICHS_KAT) {
    if (p === `/${kat}` || p.startsWith(`/${kat}/`)) return kat;
  }
  return 'sonstiges';
}

// Piktogramm + Sammel-Label je Kategorie. Glyphen im Messing-Stil der App.
export const KAT_META: Record<TabKat, { label: string; pikto: string }> = {
  gesetze: { label: 'Gesetze', pikto: '§' },
  rechtsprechung: { label: 'Rechtsprechung', pikto: '⚖' },
  materialien: { label: 'Materialien', pikto: '❑' },
  vorlagen: { label: 'Vorlagen', pikto: '✎' },
  rechner: { label: 'Rechner', pikto: '∑' },
  sonstiges: { label: 'Weitere', pikto: '◦' },
};
// Feste Reihenfolge der Sammel-Reiter (stabil, unabhängig von Öffnungs-Reihenfolge).
// Reihenfolge = die der Bereichs-Übersichten (`lib/tabs.BEREICHS_UEBERSICHTEN`),
// damit Blatt und Navigation dieselbe Ordnung sprechen.
export const KAT_ORDER: TabKat[] = ['gesetze', 'rechtsprechung', 'materialien', 'vorlagen', 'rechner', 'sonstiges'];

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
  // Die Vorrang-Regel «international schlägt Ebene» steht seit Befund 45 EINMAL
  // (lib/normtext/erlassAdresse.ts) — dieselbe, aus der die Adresse gebaut wird.
  // Vorher lag hier eine Kopie; Herkunfts-Reiter und URL konnten auseinanderlaufen.
  return routenEbene(e);
}

/** Same-Group-Guard fürs Umsortieren (Drag&Drop UND Tastatur-Pfeile): ein Reiter
 *  darf NUR innerhalb derselben Blatt-Liste verschoben werden, wie das TabPanel
 *  sie rendert — gleiche Kategorie, bei Gesetzen zusätzlich gleiche Herkunft
 *  (bzw. dieselbe «ungeklärte» Sammelliste, wenn das Manifest noch nicht geladen
 *  ist → herkunftVon === null für beide). Reine, deterministische Funktion (§2/§3). */
export function gleicheReiterGruppe(vonPath: string, nachPath: string, m: VerlaufManifeste = {}): boolean {
  const kat = reiterKategorie(vonPath);
  if (kat !== reiterKategorie(nachPath)) return false;
  if (kat === 'gesetze') return herkunftVon(vonPath, m) === herkunftVon(nachPath, m);
  return true;
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
  const roh = decodeURIComponent(m[1]);
  if (!roh) return null;
  // M13: Schlusstitel-/UeB-Token «disp_uN_art_<suffix>» tragen den Namespace im
  // Token. Nur die reine Artikel-Nummer anzeigen («Art. 3», «Art. 31–32»),
  // nicht das ganze Token («Art. dispu1art3»). Haupttext bleibt byte-gleich.
  if (roh.startsWith('disp_')) {
    const suffix = roh.replace(/^.*_art_/, '').replace(/_(?=\d)/g, '–').replace(/_/g, '');
    return suffix ? `Art. ${suffix}` : null;
  }
  const tok = roh.replace(/_/g, '');
  return tok ? `Art. ${tok}` : null;
}
