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
// Band ist zum Zeitpunkt des Urteils noch gar nicht paginiert).
//
// Korrigierte Prüfmenge (Gegenprüfungs-Nachtrag D2, 12.9.2026): 26 BGE tragen
// mind. eine "BGE … S. …"-Zitierung IRGENDEINES Bandes — das ist die falsche
// Bezugsgrösse. Die tatsächlich für diesen Wächter relevante Menge ist enger:
// NUR 6/1259 BGE im Bestand tragen überhaupt einen Seitenkopf-Marker DESSELBEN
// Bandes (147 III 49, 148 III 115, 148 IV 409, 149 III 172, 151 III 336,
// 151 V 100 — je durchweg selbst-konsistent); davon war GENAU EINER (`152_V_2`,
// vor der Quarantäne) fremd. Diese enge Prüfmenge (0,5 % des Bestands) ist die
// Abdeckungs-Lücke des Wächters: er sieht NUR Bodies, die überhaupt einen
// laufenden Seitenkopf enthalten (kurze Auszüge ohne Seitenumbruch tragen
// keinen) — ein breiterer Konflations-Wächter (Regeste-Normen vs. Body-
// normKeys, Regeste-Sprache vs. Body-Sprache) ist als Roadmap-Folgeschritt
// unter W2·18-FEHLERBUCH vorgemerkt (ROADMAP.md).

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
