// Dossier: bibliothek/behoerden/schlichtungsaemter-gemeindezuordnung.md
// (Sektion §38 — TI)
//
// ─── TI: Gemeinden in MEHREREN Circoli (Ortsteil-Wahl) ───────────────────────
// Drei Fusionsgemeinden erstrecken sich über Circolo-Grenzen (amtliche
// Località-Suche ti.ch, 169/169 Antworten, 11.6.2026): Lugano (Ovest/Est/
// Nord), Lema (Sessa/Magliasina/Breno) und Tresa (Sessa/Magliasina). Für
// sie liefert amtFuer() bewusst KEIN Amt — die UI bietet die Ortsteil-Wahl
// an (gleicher Mechanismus wie die Stadt-Zürich-Kreise, §10).

import type { ZhKreisAmt } from './zhAmt';
import { namensKandidaten } from './zhAmt';

/** Gemeinde → Kandidaten (Amts-Name wie in aemterKantone.json TI + die
 *  amtlich diesem Circolo zugeordneten Ortsteile/Quartiere). */
export const TI_MEHRDEUTIG: Record<string, { amtName: string; ortsteile: string }[]> = {
  Lugano: [
    { amtName: 'Giudicatura di pace del Circolo di Lugano Ovest', ortsteile: 'Zentrum, Barbengo, Besso, Breganzona, Carabbia, Carona, Figino, Loreto, Molino Nuovo, Pambio-Noranco, Pazzallo' },
    { amtName: 'Giudicatura di pace del Circolo di Lugano Est', ortsteile: 'Aldesago, Brè, Caprino, Cassarate, Castagnola, Cureggia, Gandria, Pregassona, Viganello' },
    { amtName: 'Giudicatura di pace del Circolo di Lugano Nord', ortsteile: 'Bogno, Cadro, Certara, Cimadera, Davesco-Soragno, Sonvico, Valcolla, Villa Luganese' },
  ],
  Lema: [
    { amtName: 'Giudicatura di pace del Circolo di Sessa', ortsteile: 'Astano, Bedigliora' },
    { amtName: 'Giudicatura di pace del Circolo di Magliasina', ortsteile: 'Curio' },
    { amtName: 'Giudicatura di pace del Circolo di Breno', ortsteile: 'Miglieglia, Novaggio' },
  ],
  Tresa: [
    { amtName: 'Giudicatura di pace del Circolo di Sessa', ortsteile: 'Croglio, Monteggio, Sessa' },
    { amtName: 'Giudicatura di pace del Circolo di Magliasina', ortsteile: 'Ponte Tresa' },
  ],
};

interface KantonsAemter { aemter: { name: string; strasse: string; plzOrt: string; url?: string }[]; gemeinden: Record<string, number> }

/** Kandidaten-Stellen für eine TI-Mehr-Circoli-Gemeinde — null, wenn die
 *  Gemeinde eindeutig ist (dann greift amtFuer). Rückgabeform = ZhKreisAmt,
 *  damit beide UIs den bestehenden Kreis-Wahl-Zweig wiederverwenden. */
export async function tiKandidaten(gemeinde: string): Promise<ZhKreisAmt[] | null> {
  // Case-insensitiver Zweitvergleich wie amtFuer/ZH (Bug-Check 11.6.2026 B3:
  // handgetipptes «lugano» fiel sonst still auf den Verzeichnis-Link).
  const klein = new Map(Object.keys(TI_MEHRDEUTIG).map((k) => [k.toLowerCase(), TI_MEHRDEUTIG[k]]));
  const eintrag = namensKandidaten(gemeinde, 'TI')
    .map((k) => TI_MEHRDEUTIG[k] ?? klein.get(k.toLowerCase())).find((e) => e !== undefined);
  if (!eintrag) return null;
  const daten = (await import('./aemterKantone.json')).default as unknown as Record<string, KantonsAemter>;
  const proName = new Map(daten.TI.aemter.map((a) => [a.name, a]));
  const kandidaten: ZhKreisAmt[] = [];
  for (const { amtName, ortsteile } of eintrag) {
    const amt = proName.get(amtName);
    // Kein stiller Teil-Ausfall: fehlt ein Amt (Datenstand-Drift), liefert
    // die Funktion null und die UI fällt auf das amtliche Verzeichnis zurück.
    if (!amt) return null;
    kandidaten.push({ ...amt, kreise: ortsteile });
  }
  return kandidaten;
}

// ─── TI-Miete: Gemeinden in MEHREREN Uffici (Ortsteil-Wahl, 12.6.2026) ──────
// Amtliche Località-Suche locazione (ti.ch id=29229, 168/168 abgefragt;
// Dossier schlichtungsaemter-gemeindezuordnung.md §51). Drei Fusions-
// Gemeinden erstrecken sich über Uffici-Grenzen — Quartier/Ortsteil
// entscheidet (Art. 5 LALoc; Praxis-Quelle geht dem 2005er-Wortlaut vor).
export const TI_MIETE_MEHRDEUTIG: Record<string, { amtName: string; ortsteile: string }[]> = {
  Lugano: [
    { amtName: 'Ufficio di conciliazione in materia di locazione n. 3 — Lugano Ovest', ortsteile: 'Zentrum, Barbengo, Besso, Breganzona, Carabbia, Carona, Figino, Loreto, Molino Nuovo, Pambio-Noranco, Pazzallo' },
    { amtName: 'Ufficio di conciliazione in materia di locazione n. 4 — Lugano Est', ortsteile: 'Aldesago, Bogno, Brè, Cadro, Caprino, Cassarate, Castagnola, Certara, Cimadera, Cureggia, Davesco-Soragno, Gandria, Pregassona, Sonvico, Valcolla, Viganello, Villa Luganese' },
  ],
  Bellinzona: [
    { amtName: 'Ufficio di conciliazione in materia di locazione n. 9 — Bellinzona', ortsteile: 'Bellinzona (Kernstadt)' },
    { amtName: 'Ufficio di conciliazione in materia di locazione n. 10 — Bellinzona (quartiere di Giubiasco)', ortsteile: 'Camorino, Giubiasco, Gnosca, Gorduno, Gudo, Moleno, Monte Carasso, Pianezzo, Preonzo, Sant’Antonio, Sementina' },
    { amtName: 'Ufficio di conciliazione in materia di locazione n. 11 — Biasca', ortsteile: 'Claro' },
  ],
  'Val Mara': [
    { amtName: 'Ufficio di conciliazione in materia di locazione n. 5 — Agno', ortsteile: 'Maroggia' },
    { amtName: 'Ufficio di conciliazione in materia di locazione n. 2 — Mendrisio', ortsteile: 'Melano, Rovio' },
  ],
};

/** Kandidaten-Miet-Stellen für eine TI-Mehr-Uffici-Gemeinde — null bei
 *  eindeutigen Gemeinden (dann greift mieteAmtFuer). Mechanik identisch
 *  mit tiKandidaten (Rückgabeform ZhKreisAmt für den Kreis-Wahl-Zweig). */
export async function tiMieteKandidaten(gemeinde: string): Promise<ZhKreisAmt[] | null> {
  const klein = new Map(Object.keys(TI_MIETE_MEHRDEUTIG).map((k) => [k.toLowerCase(), TI_MIETE_MEHRDEUTIG[k]]));
  const eintrag = namensKandidaten(gemeinde, 'TI')
    .map((k) => TI_MIETE_MEHRDEUTIG[k] ?? klein.get(k.toLowerCase())).find((e) => e !== undefined);
  if (!eintrag) return null;
  const daten = (await import('./aemterKantone.json')).default as unknown as Record<string, KantonsAemter>;
  const proName = new Map(daten.TI_MIETE.aemter.map((a) => [a.name, a]));
  const kandidaten: ZhKreisAmt[] = [];
  for (const { amtName, ortsteile } of eintrag) {
    const amt = proName.get(amtName);
    // Kein stiller Teil-Ausfall (wie tiKandidaten): fehlt ein Amt, null.
    if (!amt) return null;
    kandidaten.push({ ...amt, kreise: ortsteile });
  }
  return kandidaten;
}
