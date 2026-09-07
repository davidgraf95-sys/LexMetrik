import { ERLASS_REGISTER } from '../../lib/normtext/register';
import { erlassPfadVonKey } from '../../lib/normtext/erlassAdresse';
import { INTERNATIONAL_SAEULE } from '../../lib/navigation';
import { STARTSEITE_ZAEHLER } from '../../data/startseiteZaehler.generated';

// ─── Ziel-Ableitungen der Startseiten-Module (D29, R10-Nachzug-3) ───────────
//
// Eigene Datei, weil `components/start/*.tsx` nur Komponenten exportieren
// dürfen (eslint react-refresh/only-export-components) — derselbe Grund, aus
// dem `components/gesetze/kernerlasse.ts` neben `pages/Gesetze.tsx` steht.
// Reine Ableitungen (§3), vom Wächter `src/tests/startseite-modul-links.test.ts`
// bewacht: alle Modul-Links paarweise verschieden, jedes Ziel existiert.
//
// D29 (David 6.9.2026, «jede Kachel führt zu der gleichen Seite», Bild
// Systematik-Modul): der HREF je Zeile war schon distinkt (`#sys-<id>` bzw.
// die International-Säule) — sichtbar gleich sah es aus, weil die
// KÜRZEL-Zeile (BV · ParlG · …) reiner Text ohne eigenes Ziel war. `kuerzelZiel`
// gibt ihnen ihres, nur für Kürzel, die das Register führt.

const z = STARTSEITE_ZAEHLER;

// Kürzel → Erlass-Pfad, EINMAL aus dem Register abgeleitet (§5) — Schlüssel
// des Registers, nicht der Anzeigetext, entscheidet über den Erlass: das
// Register führt Kürzel und Schlüssel GETRENNT (LugÜ/HZÜ z. B. mit Schlüssel
// LUGUE/HZUE), die Abbildung läuft daher über `r.kuerzel`, nie über den
// Anzeigetext als Schlüssel. Zieht `ERLASS_REGISTER` (nur Bund, ~230
// Einträge) in den Startseiten-Chunk — bewusste Abweichung vom früheren
// «kein Register-Import» (§15-Nachweis im Bau-Bericht, `check:perf-budget`
// bleibt grün: das Budget gilt dem entry-/vendor-react-Chunk, nicht dem
// lazy-geladenen Startseiten-Chunk).
const KUERZEL_PFAD = new Map(ERLASS_REGISTER.map((r) => [r.kuerzel, erlassPfadVonKey(r.key)]));

/** Ziel eines Kürzels — `null`, wenn das Register es nicht führt (§8: kein
 *  geratener Sprung statt einer ehrlichen Nicht-Verlinkung). */
export function kuerzelZiel(kuerzel: string): string | null {
  return KUERZEL_PFAD.get(kuerzel) ?? null;
}

export interface SystematikZeile { nr: string; titel: string; kuerzel: string[]; anzahl: number; ziel: string }

/** Die sechs Systematik-Zeilen mit ihrem je EIGENEN Ziel. */
export function systematikZeilen(): SystematikZeile[] {
  return [
    ...z.bundSystematik.map((k) => ({
      nr: k.nr, titel: k.titel, kuerzel: k.kuerzel, anzahl: k.anzahl,
      ziel: `/gesetze?ebene=bund#sys-${k.id}`,
    })),
    // «International» ist seit IA-6 Stufe 2 eine eigene Säule, keine
    // Systematik-Kategorie — sie führt darum die kanonische Ziel-Adresse
    // (nie den Alt-Alias /international). Die Zahl «0» ist EINSTELLIG und mit
    // Bedacht (Prüfbefund R3-F9, 6.9.2026): «01»…«05» sind LexMetriks eigene
    // funktionale Ordnung (`lib/normtext/systematik.ts`), «0» ist die AMTLICHE
    // Gruppenziffer (SR 0.1…0.9, fedlex.admin.ch/de/cc, abgerufen 6.9.2026).
    {
      nr: '0', titel: 'Internationales Recht', kuerzel: z.internationalKuerzel,
      anzahl: z.gesetzeInternationalVolltext, ziel: INTERNATIONAL_SAEULE,
    },
  ];
}

/** Ziel eines Kantons — `?ebene=kanton&kt=<KT>`, dieselbe Form wie in
 *  `lib/navigation.ts` (Sidebar), unabhängig davon abgeleitet (§5: beide
 *  Stellen bauen den Pfad je selbst aus KANTONE/kt, kein zweiter Aufrufer). */
export function kantonZiel(kt: string): string {
  return `/gesetze?ebene=kanton&kt=${kt}`;
}

/** Ziel einer Behörde — Materialien-Anker `/materialien#b-<id>`, dieselbe
 *  Form wie in `lib/navigation.ts` (Sidebar). */
export function behoerdeZiel(id: string): string {
  return `/materialien#b-${id}`;
}
