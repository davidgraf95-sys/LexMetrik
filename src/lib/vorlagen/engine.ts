// ─── Vorlagen-Engine (generisch, deterministisch) ──────────────────────────
//
// Dokumente entstehen durch regelbasierte Zusammenstellung fester, juristisch
// vorformulierter Textbausteine — KEIN Sprachmodell, keine Wahrscheinlichkeit.
// assemble() ist eine reine Funktion: identische Antworten ⇒ identisches
// Dokument. Jeder aufgenommene Baustein wird im Protokoll mit Auslöser und
// Normbezug offengelegt (Bausteinprotokoll).

export type Bedingung =
  | { feld: string; eq: unknown }
  | { feld: string; in: unknown[] }
  | { feld: string; nichtLeer: true }   // Liste nicht leer bzw. Wert vorhanden
  | { and: Bedingung[] }
  | { or: Bedingung[] }
  | { not: Bedingung };

export interface Baustein {
  id: string;
  ueberschrift?: string;     // optionale Zwischenüberschrift im Dokument
  text: string;              // fester Text mit {{platzhalter}}-Feldern
  includeIf?: Bedingung;     // deterministische Aufnahmeregel (fehlt = immer)
  wiederholeUeber?: string;  // Feld-ID einer Liste → ein Absatz je Eintrag ({{item.…}})
  nummeriert?: boolean;      // erhält eine fortlaufende Ziffer (1., 2., …)
  norm?: string;             // Normbezug, z. B. 'Art. 505 ZGB'
  begruendung: string;       // Protokoll: «aufgenommen, weil …»
  hinweis?: string;          // offengelegte streitige/optionale Auslegung
}

export interface VorlageSchema {
  id: string;
  version: string;           // Versionierung der Bausteine (Audit)
  titel: string;
  bausteine: Baustein[];
  disclaimer: string;        // Fusszeile im Dokument
}

export type Antworten = Record<string, unknown>;

export interface DokumentAbsatz {
  bausteinId: string;
  ueberschrift?: string;
  text: string;
}

export interface ProtokollEintrag {
  bausteinId: string;
  begruendung: string;
  norm?: string;
  hinweis?: string;
}

export interface AssembleErgebnis {
  dokument: { titel: string; absaetze: DokumentAbsatz[]; disclaimer: string; version: string };
  aufgenommen: string[];
  protokoll: ProtokollEintrag[];
}

// ── Bedingungs-Auswertung (reine Ausdrucksstruktur über Feldwerte) ──────────

function wert(antworten: Antworten, feld: string): unknown {
  return antworten[feld];
}

export function erfuellt(b: Bedingung, antworten: Antworten): boolean {
  if ('and' in b) return b.and.every((x) => erfuellt(x, antworten));
  if ('or' in b) return b.or.some((x) => erfuellt(x, antworten));
  if ('not' in b) return !erfuellt(b.not, antworten);
  const v = wert(antworten, b.feld);
  if ('eq' in b) return v === b.eq;
  if ('in' in b) return b.in.includes(v as never);
  // nichtLeer
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'string') return v.trim() !== '';
  return v != null && v !== false;
}

// ── Interpolation: {{pfad}} aus Antworten bzw. Listeneintrag ────────────────

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;

function formatiere(v: unknown): string {
  if (v == null || v === '') return '________';
  if (typeof v === 'string' && ISO_DATUM.test(v)) return v.split('-').reverse().join('.');
  return String(v);
}

function interpoliere(text: string, antworten: Antworten, item?: Record<string, unknown>): string {
  return text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, pfad: string) => {
    if (pfad.startsWith('item.') && item) return formatiere(item[pfad.slice(5)]);
    return formatiere(antworten[pfad]);
  });
}

// ── Zusammenstellung (reine Funktion, kein Netzwerk, kein Zufall) ───────────

export function assemble(schema: VorlageSchema, antworten: Antworten): AssembleErgebnis {
  const absaetze: DokumentAbsatz[] = [];
  const aufgenommen: string[] = [];
  const protokoll: ProtokollEintrag[] = [];
  let ziffer = 0;

  for (const b of schema.bausteine) {
    if (b.includeIf && !erfuellt(b.includeIf, antworten)) continue;

    // Leere Wiederholungsliste ZUERST prüfen — sonst entstünde eine
    // Nummerierungs-Lücke (Zähler erhöht, Baustein aber übersprungen).
    let liste: unknown[] | null = null;
    if (b.wiederholeUeber) {
      const roh = antworten[b.wiederholeUeber];
      if (!Array.isArray(roh) || roh.length === 0) continue;
      liste = roh;
    }

    const nummer = b.nummeriert ? `${++ziffer}. ` : '';

    if (liste) {
      const texte = liste.map((item) => interpoliere(b.text, antworten, item as Record<string, unknown>));
      absaetze.push({ bausteinId: b.id, ueberschrift: b.ueberschrift, text: nummer + texte.join('\n') });
    } else {
      absaetze.push({ bausteinId: b.id, ueberschrift: b.ueberschrift, text: nummer + interpoliere(b.text, antworten) });
    }

    aufgenommen.push(b.id);
    protokoll.push({ bausteinId: b.id, begruendung: b.begruendung, norm: b.norm, hinweis: b.hinweis });
  }

  return {
    dokument: { titel: schema.titel, absaetze, disclaimer: schema.disclaimer, version: schema.version },
    aufgenommen,
    protokoll,
  };
}
