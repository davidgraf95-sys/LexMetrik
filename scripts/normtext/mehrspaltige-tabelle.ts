// Reine, deterministische Zerlegung von `·`/`—`-Flachtext-Tabellen in das
// mehrspaltig-Modell { kopf: string[]; zeilen: string[][] }. (§2)
//
// Anwendungsbereich: LexWork-Kantone NW/BS/SO/VS (ggf. ZG/TG).
// Zeilen werden durch ` — ` getrennt, Zellen durch ` · `, jede Zelle
// hat das Format «Label: Wert» (erstes ` : ` trennt).
//
// §1-Konservativ: Zelle ohne `: ` und keine führende Tarif-Nr. → null.
// Hierarchische Tarif-Nr. («0.1»,«0.1.1»,«1.»,«1.1.») bleibt als String
// in der Spalte «Tarif-Nr.» — nie Ziffern umrechnen oder verändern.
// Unicode-Apostrophe (z.B. NW-Tausendertrenner U+2018 ') werden verbatim
// durchgereicht.

/** Muster für führende Tarif-/Positions-Nummern ohne `: ` (bare cell). */
const TARIF_NR_RE = /^\d+(\.\d+)*\.?$/;

/** Spaltenname für führende bare Tarif-Nummern. */
const TARIF_NR_LABEL = 'Tarif-Nr.';

/**
 * Zerlegt eine einzelne Zelle «Label: Wert» am ERSTEN `: ` (nur erstes Vorkommen).
 * Gibt { label, wert } zurück, oder null wenn kein `: ` enthalten und auch keine
 * führende Tarif-Nr. → §1-Verletzung.
 */
function zerlegeZelle(
  zelle: string,
): { label: string; wert: string } | null {
  const idx = zelle.indexOf(': ');
  if (idx !== -1) {
    return {
      label: zelle.slice(0, idx).trim(),
      wert: zelle.slice(idx + 2), // Wert NACH dem ersten `: ` (verbatim, kein trim)
    };
  }
  // Kein `: ` — nur erlaubt wenn bare Tarif-Nr.
  const trimmed = zelle.trim();
  if (TARIF_NR_RE.test(trimmed)) {
    return { label: TARIF_NR_LABEL, wert: trimmed };
  }
  // §1: ambige Zelle → Aufrufer gibt null zurück
  return null;
}

/**
 * Versucht, `·`/`—`-Flachtext in eine Mehrspalten-Tabelle zu zerlegen.
 *
 * Bedingungen für Erfolg:
 * - Text enthält ` — ` UND ` · `
 * - Split an ` — ` ergibt ≥2 Zeilen
 * - Jede Zelle hat das Format «Label: Wert» oder ist eine bare Tarif-Nr.
 *
 * Bei §1-Verletzung (ambige Zelle, < 2 Zeilen, fehlende Marker) → null.
 *
 * @returns { kopf: string[]; zeilen: string[][] } | null
 */
export function extrahiereMehrspaltig(
  text: string,
): { kopf: string[]; zeilen: string[][] } | null {
  // Guard: beide Trennzeichen müssen vorhanden sein
  if (!text.includes(' — ') || !text.includes(' · ')) return null;

  const roheZeilen = text.split(' — ');
  // Guard: ≥2 Zeilen
  if (roheZeilen.length < 2) return null;

  // Alle Zeilen parsen: [[{label,wert}, …], …]
  const geparsteZeilen: Array<Array<{ label: string; wert: string }>> = [];

  for (const roheZeile of roheZeilen) {
    const zellen = roheZeile.split(' · ');
    const geparsteZellen: Array<{ label: string; wert: string }> = [];

    for (const zelle of zellen) {
      const parsed = zerlegeZelle(zelle.trim());
      if (parsed === null) {
        // §1: ambige Zelle → ganzen Block als Text belassen
        return null;
      }
      geparsteZellen.push(parsed);
    }

    geparsteZeilen.push(geparsteZellen);
  }

  // Spaltenreihenfolge: erste-Auftritt-Vereinigung aller Labels;
  // «Tarif-Nr.» wird an den Anfang gestellt, wenn vorhanden.
  const kopfSet: string[] = [];
  const hatTarifNr = geparsteZeilen.some(zeile =>
    zeile.some(z => z.label === TARIF_NR_LABEL),
  );

  if (hatTarifNr) {
    kopfSet.push(TARIF_NR_LABEL);
  }

  for (const zeile of geparsteZeilen) {
    for (const zelle of zeile) {
      if (zelle.label === TARIF_NR_LABEL) continue; // schon vorn eingefügt
      if (!kopfSet.includes(zelle.label)) {
        kopfSet.push(zelle.label);
      }
    }
  }

  // Zeilen als Wertearray (fehlende Spalte → '')
  const zeilen: string[][] = geparsteZeilen.map(geparsteZeile => {
    // Lookup: label → wert für diese Zeile
    const lookup = new Map<string, string>();
    for (const { label, wert } of geparsteZeile) {
      // Erste Auftritt gewinnt (in einer Zeile mit doppeltem Label — theoretisch)
      if (!lookup.has(label)) {
        lookup.set(label, wert);
      }
    }
    return kopfSet.map(col => lookup.get(col) ?? '');
  });

  return { kopf: kopfSet, zeilen };
}
