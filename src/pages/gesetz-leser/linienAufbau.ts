// ─── Linien-Aufbau-Metrik (W2·5d U-LINIEN / A8) ──────────────────────────────
//
// SSoT für die Frage «wann zeigt der Gesetzes-Reader den vertikalen Gliederungs-
// Guide?». Davids Anmerkung A8 (5.7.2026): «Liniengliederungsdarstellung nochmals
// komplett überarbeiten und regeln festlegen wie es wann angezeigt wird JE NACH
// AUFBAU GESETZ. zgb bspw. sehr viele aber arg fast keine aktuell.»
//
// Der frühere Default war KATEGORIE-basiert (G3a/K11: nur grundart===KODIFIKATION
// zeigte den Guide) — genau die Inkonsistenz, die David rügt: das tiefe ZGB
// (KODIFIKATION) ertrank in Linien, das flache ArG (STANDARD_ERLASS) bekam gar
// keine. Neu ist der Default AUFBAU-basiert: abgeleitet aus dem TATSÄCHLICHEN
// Struktur-Sidecar (Gliederungstiefe + Artikel-Dichte je Ebene), nicht aus der
// Grundart-Schublade. Der K11-Tri-State-NUTZER-Override (data-linien an/aus,
// global) bleibt unangetastet — hier geht es allein um den AUTO-Default.
//
// Reine Darstellung (§3): entscheidet nur über eine border-Sichtbarkeit, nie über
// Rechtsinhalt. Der amtliche Wortlaut ist unberührt.
//
// ── Empirische Schwellen-Herleitung (Korpus-Verteilung, 1135 Sidecar-Erlasse) ──
// `node scripts/linien-korpus-verteilung.mjs` erhebt die Verteilung.
// Gliederungstiefe (max. Sidecar-Verschachtelung) je Erlass:
//   Tiefe 0: 900 (79 %)  ·  1: 64  ·  2: 98  ·  3: 58  ·  4: 12  ·  5: 3
// Der Bruch liegt sichtbar zwischen «flach/mittel» (≤2 Ebenen) und «tiefe
// Kodifikation» (≥3 Ebenen): ab 3 gleichzeitig sichtbaren Überschriften-Ebenen
// trägt die TYPO-Staffel + der horizontale Struktur-Trenner + der Einzug die
// Hierarchie bereits vollständig — ein zusätzlicher vertikaler Strich JE Sektion
// wird zum «Barcode» (ZGB Art. 684 / OR Art. 319, der Ur-Befund von R4). Darum:
//   TIEF_AB = 3  →  strukturTiefe ≥ 3 ⇒ Auto-Guide AUS (ruhig, Einzug bleibt).
// Zusätzlich ein Dichte-Boden: bei Median ≤ 1 Artikel je geführter Sektion wäre
// der Guide selbst auf flachen Erlassen ein Per-Artikel-Barcode (9 Erlasse im
// Korpus, z. B. AKKBV sek=[6,18]@1-Artikel). Darum:
//   DICHTE_MIN = 2  →  Median Artikel/Sektion auf der Guide-Ebene ≥ 2, sonst AUS.
//
// Referenz-Verdikte (im Tor `check:linien-kanon` positiv+negativ gegated):
//   ZGB  tiefe5 dichte92 → AUS (ruhig)      OR   tiefe4 dichte22 → AUS (ruhig)
//   ArG  tiefe2 dichte4  → AN  (Ebene 1)    VMWG tiefe0          → kein Guide (flach)
//   Kurzerlass/Staatsvertrag tiefe1 → AN (Ebene 0, «flache Ebene sichtbar»)

import type { StrukturMap } from '../../lib/normtext/browse';

export const LINIEN_SCHWELLEN = {
  /** Ab dieser Gliederungstiefe gilt ein Erlass als «tiefe Kodifikation»: der
   *  Auto-Guide bleibt AUS, damit die vielen Ebenen nicht in Linien ertrinken
   *  (Typo + Einzug tragen die Hierarchie). Empirisch: Bruch der Korpus-Tiefen-
   *  Verteilung zwischen ≤2 und ≥3 Ebenen. */
  TIEF_AB: 3,
  /** Median Artikel je geführter Sektion; darunter wäre der Guide ein Per-
   *  Artikel-Barcode statt einer Gruppierung ⇒ Auto-Guide AUS. */
  DICHTE_MIN: 2,
} as const;

export interface LinienProfil {
  /** Maximale Gliederungs-Verschachtelung des Erlasses (0 = flache Artikelliste). */
  strukturTiefe: number;
  /** Sektions-tiefe (Rekursionstiefe in renderSektion), die den EINEN vertikalen
   *  Guide trägt, wenn Linien sichtbar sind — 0 oder 1; `null` = der Erlass hat
   *  keine Gliederungs-Sektionen, kein Guide möglich. Bei tiefen Kodifikationen
   *  bleibt guideEbene gesetzt (=1, wie der frühere Fix-Wert), damit der Nutzer-
   *  Override `an` denselben Ort trifft — nur der Auto-Default ist aus. */
  guideEbene: number | null;
  /** Median Artikel je Sektion auf `guideEbene` (0 wenn n/a). */
  dichteAmGuide: number;
  /** Zeigt der Guide im AUTO-Default (ohne expliziten Nutzer-Klick)? */
  autoGuide: boolean;
}

const FLACH: LinienProfil = { strukturTiefe: 0, guideEbene: null, dichteAmGuide: 0, autoGuide: false };

/** Median einer bereits NICHT sortierten Zahlenliste (untere Mitte). */
function median(werte: number[]): number {
  if (werte.length === 0) return 0;
  const s = [...werte].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

/**
 * Leitet das Linien-Aufbau-Profil eines Erlasses aus seinem Struktur-Sidecar ab
 * (die von `ladeStruktur` geladene StrukturMap). Deterministisch, seiteneffektfrei;
 * dieselbe Funktion nutzt der Reader (Laufzeit) UND das Tor (Korpus-Gegenprobe).
 */
export function linienProfil(struktur: StrukturMap | null | undefined): LinienProfil {
  if (!struktur) return FLACH;

  let strukturTiefe = 0;
  // artProSektion[L] : voller Pfad-Präfix der Länge L+1 → Anzahl Artikel darunter.
  const artProSektion: Array<Map<string, number>> = [];
  for (const key in struktur) {
    const g = struktur[key].gliederung ?? [];
    if (g.length > strukturTiefe) strukturTiefe = g.length;
    for (let L = 0; L < g.length; L++) {
      const map = (artProSektion[L] ??= new Map());
      const pref = g.slice(0, L + 1).map((x) => x.label).join(' / ');
      map.set(pref, (map.get(pref) ?? 0) + 1);
    }
  }
  if (strukturTiefe === 0) return FLACH;

  // Der Guide markiert die INNERE Gruppierungsebene (Ebene 1), sofern vorhanden;
  // hat der Erlass nur EINE Ebene, sitzt er auf der äussersten (Ebene 0) — so wird
  // «die flache Ebene sichtbar» (Kurzerlass/Staatsvertrag mit einer Gliederung).
  const guideEbene = Math.min(strukturTiefe - 1, 1);
  const dichteAmGuide = median([...(artProSektion[guideEbene]?.values() ?? [])]);
  const autoGuide =
    strukturTiefe <= LINIEN_SCHWELLEN.TIEF_AB - 1 && dichteAmGuide >= LINIEN_SCHWELLEN.DICHTE_MIN;

  return { strukturTiefe, guideEbene, dichteAmGuide, autoGuide };
}
