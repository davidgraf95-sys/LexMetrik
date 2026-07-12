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
// ── Auto-Default-Rückzug V2·A28 (David 12.7.2026, Live-Feedback auf L-3) ───────
// CHRONIK ehrlich: die L-3-Einheit (#207, gebaut 11.7.) drehte die #161-Politik um
// und schaltete den Auto-Guide für dichte Erlasse AN — inklusive der tiefen
// Kodifikationen ZGB/OR (Annahme: EIN Guide auf `guideEbene` sei die Gliederungs-
// hilfe, die David sehen will). David hat das gestern LIVE gegengeprüft und klar
// verworfen:
//   «das mit den linien funktioniert überhaupt nicht»
//   «also ist überhaupt nicht fördernd für die übersicht»
// Damit ist die Prämisse von L-3 (der aufgedrängte Guide hilft der Übersicht)
// empirisch falsifiziert — vom einzigen zuständigen Abnehmer, an seinen eigenen
// Erlassen. Konsequenz A28: der Auto-Default wird KORPUSWEIT ZURÜCKGEZOGEN.
//   autoGuide = false für JEDEN Erlass — der Reader drängt die Linie NIE auf.
// Das ist der konservative Zustand: kein Auto-Guide, kein Rauschen, keine per-
// Erlass-Heuristik, die «funktioniert überhaupt nicht». Begründung der Umkehr
// gegenüber L-3: L-3 war eine THEORIE über Übersicht (Dichte-Boden ⇒ hilfreich);
// Davids Verdikt ist DATEN über Übersicht (im echten Lesen unbrauchbar). Daten
// schlagen Theorie — wir ziehen die aufgedrängte Linie zurück, statt weiter an der
// Schwelle zu drehen. Alternativen für echte Struktur-Übersicht (Typo-Hierarchie,
// Sticky-Mini-Kontext, TOC-Scroll-Spy, Abschnitts-Rhythmus) sind als Skizze im
// FAHRPLAN-GESETZES-UX §10.8 hinterlegt (nur Doku, kein Bau in dieser Einheit).
//
// WICHTIG — das FEATURE bleibt, nur das AUFDRÄNGEN endet: der K11-Tri-State-NUTZER-
// Schalter «Linien» (data-linien an/aus, global, LeserAnsichtMenu) ist voll
// funktionsfähig. Wer die Gliederungslinie will, klickt «Linien AN» und bekommt
// den EINEN Guide auf genau `guideEbene` (unverändert = min(tiefe−1, 1)). Darum
// bleiben strukturTiefe/guideEbene/dichteAmGuide voll berechnet — sie steuern
// weiterhin, WO der Guide sitzt und OB der Schalter überhaupt erscheint
// (zeigeLinien = guideEbene !== null). Nur der AUTO-Default ist aus.
//
// TIEF_AB/DICHTE_MIN bleiben als Diagnose-/Doku-Schwellen erhalten (Klassifikation
// «tiefe Kodifikation» / «trägt-Dichte»), deckeln aber NICHTS mehr am Auto-Default.
//
// Gliederungstiefe (max. Sidecar-Verschachtelung) je Erlass, zur Einordnung:
//   Tiefe 0: 900 (79 %)  ·  1: 64  ·  2: 98  ·  3: 58  ·  4: 12  ·  5: 3
//
// Referenz-Verdikte (im Tor `check:linien-kanon` gegated): autoGuide=false für ALLE
// (ZGB/OR/ArG/Kurzerlass/Staatsvertrag/VMWG) — der Auto-Guide ist korpusweit aus;
// guideEbene/strukturTiefe bleiben als Verdrahtungs-Nachweis gegated (Nutzer-«an»
// trifft denselben Ort).

import type { StrukturMap } from '../../lib/normtext/browse';

export const LINIEN_SCHWELLEN = {
  /** Ab dieser Gliederungstiefe gilt ein Erlass als «tiefe Kodifikation» (ZGB/OR).
   *  NUR Diagnose-/Doku-Schwelle — seit V2·A28 ist der Auto-Guide korpusweit aus,
   *  die Tiefe deckelt nichts mehr. */
  TIEF_AB: 3,
  /** Median Artikel je geführter Sektion, ab dem der Aufbau den EINEN Guide «trägt».
   *  NUR Diagnose-/Doku-Schwelle — seit V2·A28 (Davids Live-Verdikt) steuert sie den
   *  Auto-Default NICHT mehr (autoGuide ist korpusweit false). */
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
  // V2·A28 (David 12.7.2026, Live-Verdikt «funktioniert überhaupt nicht»): der Auto-
  // Guide wird KORPUSWEIT zurückgezogen — der Reader drängt die Linie NIE auf.
  // guideEbene/dichteAmGuide bleiben berechnet (der Nutzer-Override «an» landet auf
  // demselben Ort; zeigeLinien blendet den Schalter nur bei fehlender Sektion aus).
  const autoGuide = false;

  return { strukturTiefe, guideEbene, dichteAmGuide, autoGuide };
}
