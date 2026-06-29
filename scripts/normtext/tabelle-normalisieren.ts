// ─── Tabellen-Normalisierung (M10, kanonisches spalten-Modell T-B1) ──────────
//
// Reine, DOM-freie Funktion (§3/T-F8): nimmt die roh geparsten Zellen einer
// Fedlex-<table> (mit colspan) und liefert das kanonische, RECHTECKIGE Modell
// { spalten, zeilen } — oder `null`, wenn sich keine wortlauttreue Rechteck-Form
// herstellen lässt (→ Aufrufer behält den Alt-Parse / degradiert ehrlich, T-E4).
//
// Leitfall durchgehend: GebV SchKG Art. 20 — Kopf 2×<th colspan=3>, Datenzeilen
// 6 colspan-lose <td>; die Forderungs-Spanne läuft über 5 Zellen
// [präfix, von, spacer, "bis", bis] + Gebühr als 6. Zelle. Fedlex gruppiert den
// Kopf visuell 3/3, die lesbare Soll-Form ist 5/1 (K3) → die Verdichtung folgt
// dem DATEN-Staffel-Muster, NIE der (hier irreführenden) Kopf-colspan-Gruppierung.
//
// Zwei Pfade:
//  - STAFFEL (T-A6): colspan-lose Daten + gruppierter Kopf + über/ab/bis →
//    führende Spanne zu EINER `bereich`-Zelle verdichten (Art. 16/19/20/30/45/48,
//    VFV 13b). Verlustfreie Konkatenation amtlicher Token (T-E2).
//  - LOGISCH: Spalten = DATEN-Zellgrenzen (eine <td>/<th>-colspan-Zelle = EINE
//    logische Spalte); Caption je Spalte aus dem zeilenweise gemergten Kopf
//    (T-A5, rettet die obere Kopfzeile). Deckt eine Datenzelle MEHR als eine
//    nicht-leere Caption ab (Fedlex-colspan-Misalignment, z.B. AHVV Art. 52) →
//    ehrlicher Fallback statt geratener Zuordnung (§1/§2/§8).
//
// Verifiziert 30.6.2026 gegen echtes Filestore-HTML (GEBV_SCHKG art_16/19/20/30/
// 37/45/48, AHVV art_11/21/52/56bis). Regeln A/B/E aus FAHRPLAN-GESETZESDARSTELLUNG-BUND.md.

export type Spaltentyp = 'bereich' | 'zahl' | 'text' | 'betrag';

export interface Spalte {
  typ: Spaltentyp;
  titel: string;
}

export interface NormTabelle {
  spalten: Spalte[];
  zeilen: string[][];
}

/** Eine roh geparste Tabellenzelle: Text (tag-/fussnoten-bereinigt) + colspan. */
export interface RohZelle {
  text: string;
  colspan: number;
}

/** Roh geparste Tabelle: Kopfzeilen (th/tab-kpf, in Reihenfolge) + Datenzeilen. */
export interface RohTabelle {
  kopfZeilen: RohZelle[][];
  datenZeilen: RohZelle[][];
}

/** colspan expandieren: Zelle mit colspan=N belegt N physische Spalten — Text
 *  in der ersten, die übrigen (N-1) leer (T-A2/A3). Gilt für Kopf UND Daten. */
function expandiere(zellen: RohZelle[]): string[] {
  const out: string[] = [];
  for (const z of zellen) {
    const span = Number.isFinite(z.colspan) && z.colspan > 0 ? Math.floor(z.colspan) : 1;
    out.push(z.text);
    for (let k = 1; k < span; k++) out.push('');
  }
  return out;
}

/** Logische Zellgrenzen einer Datenzeile (Start-Offset + Spannweite je <td>). */
function zellGrenzen(row: RohZelle[]): Array<{ start: number; span: number }> {
  const out: Array<{ start: number; span: number }> = [];
  let o = 0;
  for (const c of row) {
    const span = Number.isFinite(c.colspan) && c.colspan > 0 ? Math.floor(c.colspan) : 1;
    out.push({ start: o, span });
    o += span;
  }
  return out;
}

/** Lone Staffel-Schlüsselwörter, die als EINZELZELLE einen unverdichteten
 *  Spannen-Rest verraten (T-F1 Regel 5). Bleibt so etwas im Rechteck stehen,
 *  ist die Tabelle ein mis-gesplitteter Staffel-Block → ehrlicher Text-Fallback. */
const STAFFEL_WORT = new Set(['bis', 'über', 'ueber', 'ab', 'und', 'et', 'jusqu’à', "jusqu'à"]);

/** Staffel-Grammatik (T-A6): die verdichtete `bereich`-Spanne MUSS exakt einer
 *  dieser abgeschlossenen Signaturen entsprechen, sonst keine Verdichtung
 *  (§2 — im Zweifel kein Raten). Token sind unverändert amtlich (T-E2). */
export function istStaffelSpanne(s: string): boolean {
  const t = s.trim();
  if (t === '') return false;
  // „bis 100" · „über 100 bis 500" · „über 1 000 000" · „ab 600 000" …
  return (
    /^(bis|jusqu’à|jusqu'à)\s+\S.*$/i.test(t) ||
    /^(über|ueber|ab|de)\s+\S.*\s+(bis|à|jusqu’à|jusqu'à)\s+\S.*$/i.test(t) ||
    /^(über|ueber|ab|de)\s+\S.*$/i.test(t)
  );
}

/** Spaltentyp aus den Datenzellen ableiten (T-B4) — steuert nur Ausrichtung/
 *  Format im Renderer, nie den gespeicherten Wert (T-E3). */
function inferiereTyp(zellen: string[]): Spaltentyp {
  const ne = zellen.map((c) => c.trim()).filter((c) => c !== '');
  if (ne.length === 0) return 'text';
  // betrag: Geldbetrag, der auf die amtliche Strich-Form endet (10.– · 1000.– · 45.–);
  // Tausender =  / /Apostroph/Leerzeichen. Reine 2-Dezimal-Zahlen (Prozentsätze
  // wie 4,35) sind KEIN betrag → bleiben zahl (gleiche Rechtsausrichtung, kein .–-Render).
  const istBetrag = (c: string) => /^\d[\d   '’.,]*\s*[.,]?[–—-]$/.test(c);
  // zahl: reine Zahl (inkl. Tausender-/Dezimal-Trenner), KEIN Bindestrich-Bereich,
  // keine Buchstaben (4,35 · 17 600 · 10 100 · 1000)
  const istZahl = (c: string) => /^\d[\d   '’.,]*$/.test(c) && !/[–—-]/.test(c);
  if (ne.every(istBetrag)) return 'betrag';
  if (ne.every(istZahl)) return 'zahl';
  return 'text';
}

/** Letzte harte Invariante (T-B2): spalten.length === N und ∀ Zeile === N.
 *  Bei Bruch lieber `null` (Fallback) als ein aritätsverletzendes Modell ablegen. */
function rechteckGarantieren(t: NormTabelle): NormTabelle | null {
  const N = t.spalten.length;
  if (N < 1) return null;
  if (!t.zeilen.every((z) => z.length === N)) return null;
  return t;
}

/**
 * Normalisiert eine roh geparste Fedlex-Tabelle zum kanonischen rechteckigen
 * Modell — oder `null` (→ ehrlicher Fallback durch den Aufrufer, T-E4).
 */
export function normalisiereTabelle(roh: RohTabelle): NormTabelle | null {
  const kopfPhysRows = roh.kopfZeilen.map(expandiere).filter((z) => z.length > 0);
  const datRows = roh.datenZeilen.filter((row) => row.some((c) => c.text.trim() !== ''));
  if (datRows.length === 0) return null;
  const datenPhys = datRows.map(expandiere);

  const breiteW = Math.max(0, ...kopfPhysRows.map((z) => z.length), ...datenPhys.map((z) => z.length));
  if (breiteW === 0) return null;
  for (const z of datenPhys) if (z.length !== breiteW) return null; // ragged → Fallback (T-A8)

  // T-A5: Kopfzeilen spaltenweise mergen (obere Kopfzeile darf nicht verloren
  // gehen, G19) — je physische Spalte die nicht-leeren Texte mit ' ' verbinden.
  const kopfMerged: string[] = [];
  for (let c = 0; c < breiteW; c++) {
    kopfMerged.push(
      kopfPhysRows
        .map((z) => (z[c] ?? '').trim())
        .filter((x) => x !== '')
        .join(' '),
    );
  }

  // ── STAFFEL-Pfad (T-A6) ────────────────────────────────────────────────────
  // Auf der physischen Form (Spacer gestrichen). Greift nur bei colspan-losen
  // Daten mit gruppiertem Kopf + Staffel-Token (über/ab/bis).
  {
    const behalten: number[] = [];
    for (let c = 0; c < breiteW; c++) {
      const leerKopf = (kopfMerged[c] ?? '') === '';
      const leerDaten = datenPhys.every((z) => (z[c] ?? '').trim() === '');
      if (!(leerKopf && leerDaten)) behalten.push(c);
    }
    const W = behalten.length;
    const kopf = behalten.map((c) => kopfMerged[c]);
    const rows = datenPhys.map((z) => behalten.map((c) => z[c]));
    const captions = kopf.filter((x) => x !== '');
    const nCaps = captions.length;
    const hatStaffelToken = rows.some((z) =>
      z.some((c) => /^(über|ueber|ab|bis|de|jusqu’à|jusqu'à)$/i.test(c.trim())),
    );
    if (nCaps >= 2 && W > nCaps && hatStaffelToken) {
      const V = nCaps - 1; // Wert-Spalten
      const spanBreite = W - V;
      if (spanBreite >= 1) {
        const out: string[][] = [];
        let okStaffel = true;
        for (const z of rows) {
          const bereich = z
            .slice(0, spanBreite)
            .map((c) => c.trim())
            .filter((c) => c !== '')
            .join(' ');
          if (!istStaffelSpanne(bereich)) {
            okStaffel = false;
            break;
          }
          out.push([bereich, ...z.slice(spanBreite)]);
        }
        if (okStaffel) {
          const spalten: Spalte[] = [
            { typ: 'bereich', titel: captions[0] },
            ...Array.from({ length: V }, (_, i) => ({
              typ: inferiereTyp(out.map((z) => z[i + 1])),
              titel: captions[i + 1] ?? '',
            })),
          ];
          return rechteckGarantieren({ spalten, zeilen: out });
        }
        return null; // Staffel-Token da, aber keine saubere Verdichtung → Fallback
      }
    }
  }

  // ── LOGISCHER Pfad: Spalten = DATEN-Zellgrenzen ─────────────────────────────
  // Alle Datenzeilen müssen dieselbe colspan-Signatur tragen (gleiche Grenzen),
  // sonst ist die logische Struktur nicht eindeutig → Fallback.
  const grenzen = zellGrenzen(datRows[0]);
  if (grenzen.length === 0) return null;
  for (const row of datRows) {
    const g = zellGrenzen(row);
    if (
      g.length !== grenzen.length ||
      g.some((x, i) => x.start !== grenzen[i].start || x.span !== grenzen[i].span)
    ) {
      return null;
    }
  }

  // Caption je logischer Spalte = nicht-leerer Merge der Kopf-Captions über die
  // Datenzell-Spanne. Deckt die Spanne MEHR als eine nicht-leere Caption ab,
  // ist die Zuordnung mehrdeutig (Fedlex-colspan-Misalignment) → Fallback.
  const logTitel: string[] = [];
  for (const g of grenzen) {
    const caps = kopfMerged
      .slice(g.start, g.start + g.span)
      .map((x) => x.trim())
      .filter((x) => x !== '');
    if (caps.length > 1) return null;
    logTitel.push(caps[0] ?? '');
  }

  const logRows = datRows.map((row) => row.map((c) => c.text));
  // Lone Staffel-Wort als Einzelzelle → mis-gesplitteter Block → Fallback.
  if (logRows.some((z) => z.some((c) => STAFFEL_WORT.has(c.trim().toLowerCase())))) return null;

  // Vollständig leere logische Spalten streichen (T-A7).
  const keep: number[] = [];
  for (let c = 0; c < logTitel.length; c++) {
    const leerKopf = logTitel[c] === '';
    const leerDaten = logRows.every((z) => (z[c] ?? '').trim() === '');
    if (!(leerKopf && leerDaten)) keep.push(c);
  }
  if (keep.length === 0) return null;

  const spalten: Spalte[] = keep.map((c) => ({
    typ: inferiereTyp(logRows.map((z) => z[c])),
    titel: logTitel[c],
  }));
  const zeilen = logRows.map((z) => keep.map((c) => z[c]));
  return rechteckGarantieren({ spalten, zeilen });
}
