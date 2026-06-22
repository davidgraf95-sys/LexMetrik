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
 * §1-Vorpass: normalisiert fehlende Zeilentrenner in LexWork-Quelltexten.
 *
 * LexWork liefert gelegentlich keinen ` — ` (U+2014) zwischen dem
 * Betrag-Ende einer Zeile und dem Beginn einer neuen Abschnitts-Überschrift
 * der Form «Tarif-Nr.: X.Y». Ohne diesen Trenner würde der Parser den Betrag
 * und die Abschnittszeile zu einer einzigen, ambigen Zelle verschmelzen und
 * den Abschnittsnamen verlieren (§1-Verletzung).
 *
 * Trigger: Ziffer / Punkt / En-Dash (U+2013, «–» in Beträgen) direkt gefolgt
 * von Leerzeichen + «Tarif-Nr.:». Ein vorhandener Trenner «— Tarif-Nr.:» ist
 * bereits durch ` — ` abgedeckt und hat kein «[\d.–]» unmittelbar davor.
 *
 * Nur so weit wie nötig verallgemeinert: Trigger ist «Betrag-Zeichen + WS +
 * Tarif-Nr.:», nicht ein generisches Label-Muster.
 *
 * @param text  Roher Tabellentext aus der LexWork-Quelle.
 * @returns     Text mit eingefügten ` — ` wo nötig.
 */
function normalisiereTrennzeichen(text: string): string {
  // [\d.–] = Ziffer, Punkt oder En-Dash (U+2013 «–», in Beträgen)
  // \s+ = ein oder mehr Leerzeichen (aber kein U+2014)
  // «Tarif-Nr.:» beginnt eine neue Abschnittszeile
  // U+2014 = «—» (Em-Dash, der Zeilentrenner)
  return text.replace(/([\d.–])\s+(Tarif-Nr\.:)/g, '$1 — $2');
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
  // §1-Vorpass: fehlende Zeilentrenner vor Tarif-Nr.-Abschnittszeilen einfügen
  const normText = normalisiereTrennzeichen(text);

  // Guard: beide Trennzeichen müssen vorhanden sein
  if (!normText.includes(' — ') || !normText.includes(' · ')) return null;

  const roheZeilen = normText.split(' — ');
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

/**
 * Reichert ein Blöcke-Array um `mehrspaltig` an (in-place, Stufe 2).
 *
 * Algorithmus je Block:
 *  1. Enthält `block.text` kein ` — ` oder ` · ` → unverändert (schneller Guard).
 *  2. `extrahiereMehrspaltig(block.text)` → null → unverändert (§1).
 *  3. Tabelle gefunden (≥2 Zeilen):
 *     a. Leite den kanonischen Spalte-0-Label aus einer SAUBEREN Zeile (Index ≥1)
 *        ab — die erste Zeile kann durch einen Einleitungssatz kontaminiert sein.
 *     b. Suche den ERSTEN Auftritt von «<label>: » im Originaltext.
 *     c. Alles DAVOR = Einleitungssatz → bleibt in `block.text`.
 *        Alles AB dort = Tabellen-Teil → `extrahiereMehrspaltig` erneut → `block.mehrspaltig`.
 *     d. Kann kein kanonischer Label gefunden oder der Tabellen-Teil nicht geparst
 *        werden → Fallback: `block.text = ''`, `block.mehrspaltig` = Parse des ganzen Texts.
 *     e. Würde der Schnitt die Tabelle leeren → Fallback wie (d).
 *  4. `block.mehrspaltig` hat Vorrang über `block.tabelle` (Render-Reihenfolge).
 *
 * @param bloecke  Mutable Blöcke-Array des Artikels (z.B. aus parseSegment).
 */
export function reichereMehrspaltig(
  bloecke: Array<{
    absatz: string | null;
    text: string;
    items?: Array<{ marke: string; text: string }>;
    mehrspaltig?: { kopf?: string[]; zeilen: string[][] };
  }>,
): void {
  for (const block of bloecke) {
    const text = block.text;

    // Schneller Guard: beide Marker müssen vorhanden sein
    if (!text.includes(' — ') || !text.includes(' · ')) continue;

    // Erster Parse-Versuch auf dem ganzen Text
    const ganz = extrahiereMehrspaltig(text);
    if (ganz === null) continue; // §1: nicht parsebar → unverändert

    // Mindestens 2 Zeilen nötig (Guard redundant aber explizit)
    if (ganz.zeilen.length < 2) continue;

    // Einleitungssatz-Erkennung: kanonischen Spalte-0-Label aus einer SAUBEREN
    // späteren Zeile (Index ≥1) ableiten — die erste Zeile kann durch einen
    // Einleitungssatz kontaminiert sein (z.B. NW «... berechnen: Leistungslohn-
    // band: 1» → der Parser sieht das erste `: ` und macht «... berechnen» zum
    // Label der Spalte 0). Deshalb parsen wir die zweite ` — `-Zeile direkt.
    //
    // Vorgehen:
    //  1. Split am ersten ` — ` → alles NACH dem ersten Trennstrich = «Rest».
    //  2. «Rest» an ` · ` splitten → erste Zelle der zweiten Zeile.
    //  3. Diese Zelle an erstem `: ` → kanonischer Label der Spalte 0.
    //  4. ERSTEN Auftritt von «<label>: » im Originaltext suchen.
    //  5. Schnitt durchführen; Kandidat nochmals parsen (sauber).
    //  6. Fallback wenn Label nicht gefunden oder Kandidat nicht parsebar.

    let label0 = '';
    const ersterTrennstrich = text.indexOf(' — ');
    if (ersterTrennstrich !== -1) {
      const restNachTrennstrich = text.slice(ersterTrennstrich + 3);
      // Erste Zelle der zweiten Zeile
      const ersteZelleZeile2 = restNachTrennstrich.split(' · ')[0].trim();
      const doppelIdx = ersteZelleZeile2.indexOf(': ');
      if (doppelIdx !== -1) {
        label0 = ersteZelleZeile2.slice(0, doppelIdx).trim();
      }
      // Falls keine `: ` in Zeile 2 Zelle 0 (Tarif-Nr.-Stil) → label0 bleibt ''.
      // In diesem Fall versuchen wir TARIF_NR_LABEL als Marker:
      if (!label0 && TARIF_NR_RE.test(ersteZelleZeile2)) {
        // Bare number am Anfang → keine echte Spalte 0 mit Label.
        // Kein Intro-Split nötig: die Tabelle beginnt mit einer Nummer.
        // Fallback: Text leer, ganz als mehrspaltig
        block.text = '';
        block.mehrspaltig = ganz;
        continue;
      }
    }

    // Suche den ERSTEN Auftritt von «<label>: » im Text
    let intro = '';
    let tabellePart = text;

    if (label0) {
      const marker = `${label0}: `;
      const idx = text.indexOf(marker);
      if (idx > 0) {
        // Einleitungssatz vorhanden (etwas vor dem ersten Marker-Auftritt)
        const kandidat = text.slice(idx);
        const parsedKandidat = extrahiereMehrspaltig(kandidat);
        if (parsedKandidat !== null && parsedKandidat.zeilen.length >= 2) {
          intro = text.slice(0, idx).trim();
          tabellePart = kandidat;
        }
        // Wenn Kandidat nicht parsebar → Fallback (tabellePart = ganzer Text, intro = '')
      }
      // Wenn idx === 0 → kein Einleitungssatz (Label gleich am Anfang)
    }

    // Finaler Parse
    const parsed = tabellePart === text ? ganz : extrahiereMehrspaltig(tabellePart);
    if (parsed === null || parsed.zeilen.length < 2) {
      // Fallback: ganzen Text als Tabelle (kein Intro-Split)
      block.text = '';
      block.mehrspaltig = ganz;
      continue;
    }

    block.text = intro;
    block.mehrspaltig = parsed;
  }
}
