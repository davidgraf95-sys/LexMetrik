// Geteilte, deterministische Snapshot-Prüfsumme über die Blöcke eines Normtext-
// Artikels (§5 SSoT — genau EINE Definition, verwendet vom Generator
// `normtext-snapshot.ts` UND vom Kanton-Spalten-Nachzug `kanton-spalten-nachzug.ts`).
// Deckt Text, items (lit./Ziff.), tabelle (Stufe 1), mehrspaltig (spalten+kopf+
// zeilen) und Bilder ab; §7-Drift-Token gegen die amtliche Fassung.
import { createHash } from 'node:crypto';

export function sha256Bloecke(
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string; tiefe?: number; trenner?: string }>;
    tabelle?: Array<{ beschreibung: string; betrag: string }>;
    mehrspaltig?: {
      kopf?: string[];
      spalten?: Array<{ typ: string; titel: string }>;
      zeilen: string[][];
    };
    bild?: { datei: string; alt: string; sha?: string };
    bildKacheln?: Array<{ bild?: { datei: string; sha?: string }; nummer?: string; name?: string }>;
  }>,
): string {
  const zusammen = bloecke
    .map((b) => {
      // tiefe fliesst in den sha NUR wenn > 0 → nicht verschachtelte Listen
      // bleiben byte-gleich (kein spuriöser Drift); echte Verschachtelung
      // (geänderte Fundstelle) wird vom Drift-Check erfasst (§1/§7, M6).
      // trenner fliesst in den sha NUR wenn gesetzt (= amtlicher Trenner weicht
      // vom Normalfall «kanonische Ordinalmarke + Punkt» ab, #679 12.9.2026) →
      // bisher korrekte Items bleiben byte-gleich, kein spuriöser Drift. Wo er
      // gesetzt ist, ist er drift-relevant: «BE:» (Kategorie) vs. «b.» (lit. b)
      // ist eine andere Fundstelle, also gehört der Wechsel in den Daten-Index
      // (§1/§7, gleiche Begründung wie `tiefe`). Prefix «t:» hält ihn von der
      // tiefe-Spalte unterscheidbar.
      const itemTeil = (b.items ?? [])
        .map(
          (i) =>
            `${i.marke}\t${i.text}${i.tiefe ? `\t${i.tiefe}` : ''}` +
            `${i.trenner !== undefined ? `\tt:${i.trenner}` : ''}`,
        )
        .join('\n');
      const tabTeil = (b.tabelle ?? []).map((z) => `${z.beschreibung}\t${z.betrag}`).join('\n');
      // Spalten-Vektor (kanonisches M10-Modell) trägt die Kopf-TITEL + -Typen —
      // ohne ihn deckte der sha nur die Zeilen ab, nicht die Tabellen-Überschriften
      // (Blindstelle: eine Kopf-Drift bliebe unentdeckt). `kopf` bleibt als Kanton-
      // Legacy-Fallback erhalten (dort ohne `spalten`).
      const mTeil = b.mehrspaltig
        ? [
            ...(b.mehrspaltig.spalten ?? []).map((s) => `${s.typ}\t${s.titel}`),
            ...(b.mehrspaltig.kopf ? [b.mehrspaltig.kopf.join('\t')] : []),
            ...b.mehrspaltig.zeilen.map((z) => z.join('\t')),
          ].join('\n')
        : '';
      // Bilder fliessen über die STABILE Prüfsumme der Bytes in den Daten-Index
      // (nicht über die evtl. gehashte lokale Datei-Adresse) — so bleibt der sha
      // reproduzierbar unabhängig vom Speicherpfad (§7).
      const bildTeil = b.bild?.sha ? `bild:${b.bild.sha}` : '';
      const kachelTeil = (b.bildKacheln ?? [])
        .map((k) => `${k.nummer ?? ''}\t${k.name ?? ''}\t${k.bild?.sha ?? ''}`)
        .join('\n');
      return [b.text, itemTeil, tabTeil, mTeil, bildTeil, kachelTeil].filter(Boolean).join('\n');
    })
    .join('\n');
  return createHash('sha256').update(zusammen, 'utf8').digest('hex');
}
