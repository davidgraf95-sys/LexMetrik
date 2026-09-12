// ─── Körper-Konflation: fremde BGE-Fundstelle im eigenen Body erkennen ───────
// (Gegenprüfungs-Auflage C1, 12.9.2026, PR #816)
//
// Der amtliche Druck der Bundesgerichtsentscheide (Amtliche Sammlung) trägt an
// jedem Seitenumbruch einen laufenden Kopf «BGE <Band> <Abteilung> <Nr> S. <Seite>»
// — dieser überlebt in OCLs `full_text` und damit in unseren `abschnitte`. Bei
// EIGENEN Seitenumbrüchen zeigt er auf die EIGENE Fundstelle. Trägt ein Body
// stattdessen (mehrfach) den laufenden Kopf eines ANDEREN BGE aus DEMSELBEN
// Band, ist der Body nicht der eigene, sondern der eines fremden Entscheids —
// Anlassfall `bge_152_V_2`: OCLs Basis-Record für «152 V 2» liefert vollständig
// den Text von «152 V 20» (live gegen OCL geprüft, 12.9.2026).
//
// Bewusst NUR gleicher Band verglichen (nicht jede zitierte Fundstelle): ein
// Urteil zitiert legitim ÄLTERE Präjudizien mit Seitenangabe («vgl. BGE 82 III 94
// S. 96») — das ist die Norm, kein Fehler. Ein laufender Kopf DERSELBEN Bandes
// aber ANDERER Nummer kann dagegen nie eine legitime Zitierung sein (der eigene
// Band ist zum Zeitpunkt des Urteils noch gar nicht paginiert) — 26 BGE im
// Bestand tragen mind. eine "BGE … S. …"-Zitierung, korpusweit GENAU EIN
// Treffer mit Band-Gleichheit (`152_V_2`, 12.9.2026).

const LAUFENDER_KOPF = /\bBGE\s+(\d{1,3})\s+([IVXLC]+[a-z]?)\s+(\d+)\s+S\.\s*\d+/g;

/**
 * Sucht im Body-Fliesstext nach laufenden Köpfen DESSELBEN Bandes, die NICHT
 * zur eigenen Fundstelle passen. `null` = kein Befund. Sonst die erste
 * abweichende fremde Fundstelle («152 V 20»).
 */
export function findeFremdeFundstelleImBody(volltext: string, eigeneBgeReferenz: string | null | undefined): string | null {
  if (!eigeneBgeReferenz) return null;
  const eigenerBand = eigeneBgeReferenz.trim().split(/\s+/)[0];
  if (!eigenerBand) return null;
  for (const m of volltext.matchAll(LAUFENDER_KOPF)) {
    const [, band, abteilung, nr] = m;
    if (band !== eigenerBand) continue;   // andere Bände: legitime Alt-Zitierung
    const fundstelle = `${band} ${abteilung} ${nr}`;
    if (fundstelle !== eigeneBgeReferenz) return fundstelle;
  }
  return null;
}
