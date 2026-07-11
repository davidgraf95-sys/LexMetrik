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
// ── Auto-Default-Umkehr V2·L-3 (David 10.7.2026, «deine Empfehlung» = JA) ──────
// URSPRUNG (#161-Politik, 5.7.): tiefe Kodifikationen (strukturTiefe ≥ 3, also
// genau ZGB/OR) bekamen den Auto-Guide GANZ AUS — die Annahme war, ein Strich JE
// Sektion würde bei vielen Ebenen zum «Barcode». David hat das re-gemeldet als
// «funktioniert praktisch nicht»: gerade seine tiefen Leit-Kodifikationen zeigten
// keine Gliederungslinie. Der Denkfehler von #161: es gibt gar keinen Strich JE
// Ebene — der Reader emittiert HÖCHSTENS EINEN Guide, fix auf `guideEbene`
// (= min(tiefe−1, 1), also Ebene 1 bei tiefen Erlassen; renderSektion). Ein
// einziger vertikaler Guide auf der inneren Gruppierungsebene ist KEIN Barcode,
// sondern genau die Gliederungshilfe, die David sehen will. Darum UMKEHR:
//   Auto-Guide AN, sobald der Aufbau ihn TRÄGT — unabhängig von der Tiefe.
// «Trägt» heisst allein: genug Artikel je geführter Sektion, damit der EINE Guide
// eine Gruppe bündelt statt einzelne Artikel zu umranden (Per-Artikel-Barcode).
// Das leistet weiterhin der Dichte-Boden:
//   DICHTE_MIN = 2  →  Median Artikel/Sektion auf der Guide-Ebene ≥ 2, sonst AUS
//                      (9 Ur-Korpus-Erlasse bleiben ruhig, z. B. AKKBV @1-Artikel).
// Die Tiefe selbst deckelt NICHTS mehr (TIEF_AB nur noch Klassifikations-Schwelle
// «ab hier tiefe Kodifikation», rein für Diagnose/Doku). FLACHE Erlasse ändern
// sich NICHT (strukturTiefe 0 ⇒ FLACH ⇒ nie ein Guide) — kein neues Linien-Rauschen
// dort, wo der Aufbau keine Ebene hat. Empirie der Umkehr (1144 Sidecars):
//   Auto-Guide AN 158 → 230 (+72, alle strukturTiefe ≥ 3, alle dichte ≥ 2:
//   tiefe 3: 57, tiefe 4: 12, tiefe 5: 3) — deckt genau die tiefen Kodifikationen.
//
// Gliederungstiefe (max. Sidecar-Verschachtelung) je Erlass, zur Einordnung:
//   Tiefe 0: 900 (79 %)  ·  1: 64  ·  2: 98  ·  3: 58  ·  4: 12  ·  5: 3
//
// Referenz-Verdikte (im Tor `check:linien-kanon` positiv+negativ gegated):
//   ZGB  tiefe5 dichte92 → AN (der EINE Guide)   OR   tiefe4 dichte22 → AN
//   ArG  tiefe2 dichte4  → AN  (Ebene 1)          VMWG tiefe0        → kein Guide (flach)
//   Kurzerlass/Staatsvertrag tiefe1 → AN (Ebene 0, «flache Ebene sichtbar»)

import type { StrukturMap } from '../../lib/normtext/browse';

export const LINIEN_SCHWELLEN = {
  /** Ab dieser Gliederungstiefe gilt ein Erlass als «tiefe Kodifikation» (ZGB/OR).
   *  NUR NOCH Klassifikations-Schwelle für Diagnose/Doku — seit V2·L-3 deckelt die
   *  Tiefe den Auto-Guide NICHT mehr (Umkehr der #161-Politik): tiefe Kodifikationen
   *  erhalten ihren EINEN Guide, weil ein einzelner Guide auf `guideEbene` keine
   *  Ebenen-Stapelung ist. Die Auto-Guide-Entscheidung hängt allein an DICHTE_MIN. */
  TIEF_AB: 3,
  /** Median Artikel je geführter Sektion; darunter wäre der Guide ein Per-
   *  Artikel-Barcode statt einer Gruppierung ⇒ Auto-Guide AUS. Seit V2·L-3 der
   *  EINZIGE Auto-Guide-Schwellwert (die Tiefe deckelt nicht mehr). */
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
  // V2·L-3: Auto-Guide AN, sobald der Aufbau ihn trägt (Dichte-Boden) — die Tiefe
  // deckelt NICHT mehr (Umkehr #161). Tiefe Kodifikationen (ZGB/OR) zeigen damit
  // wieder ihren EINEN Guide auf `guideEbene`; der Dichte-Boden hält den Per-
  // Artikel-Barcode fern. Flache Erlasse (strukturTiefe 0) sind oben schon FLACH.
  const autoGuide = dichteAmGuide >= LINIEN_SCHWELLEN.DICHTE_MIN;

  return { strukturTiefe, guideEbene, dichteAmGuide, autoGuide };
}
