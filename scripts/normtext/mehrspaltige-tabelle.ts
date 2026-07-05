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

/**
 * Muster für führende Tarif-/Positions-Nummern ohne `: ` (bare cell).
 *
 * T3 (BS-Audit 23.6.2026): um buchstaben-suffigierte Positionen erweitert:
 *  - rein numerisch / hierarchisch: «1», «0.1», «0.1.1», «1.», «1.1.»
 *  - mit Buchstaben-Suffix nach Punkt: «4.a)», «4.a», «4.a.»
 *  - kompakter Buchstaben-Suffix: «ca)», «1a)», «2bis)» (LexWork-Unterpositionen)
 * Konservativ: höchstens EIN Buchstabenblock, optional in «)» endend; nie ein
 * ganzes Wort (so bleibt «bis Fr. 250'000:» ein Wert, keine Positionsnummer).
 */
const TARIF_NR_RE =
  /^(?:\d+(?:\.\d+)*\.?(?:[a-z]{1,2}\)?)?|\d*[a-z]{1,3}(?:bis|ter|quater)?\))$/i;

/** Spaltenname für führende bare Tarif-Nummern. */
export const TARIF_NR_LABEL = 'Tarif-Nr.';

// ── Kanonisches Spalten-Modell (T-B1/T-B4, Kanton-Nachzug 5.7.2026) ───────────
// Spiegelt scripts/normtext/tabelle-normalisieren.ts (Bund) + src/lib/normtext/
// typen.ts. Der Renderer (KanonischeTabelle) steuert Ausrichtung + Tausender-
// Gruppierung AUSSCHLIESSLICH über `typ` (T-C2/T-C5): text=links/keine Gruppierung;
// zahl/betrag=rechts/gruppiert; bereich=links/gruppiert (Staffel-Spanne).
export type Spaltentyp = 'bereich' | 'zahl' | 'text' | 'betrag';
export interface Spalte {
  typ: Spaltentyp;
  titel: string;
}

// Wörter, die in einer reinen Betrags-/Staffel-/Satz-Zelle vorkommen dürfen, ohne
// sie zu Prosa zu machen: Bindewörter der Spanne + Währungs-/Einheiten-Marken.
// JEDES andere Wort (der/die/für/Verfahren/Einkommen/gemäss …) ⇒ die Zelle ist
// Prosa ⇒ die Spalte wird `text` (nie gruppiert; §1/§7: kein Jahr/Aktenzeichen
// wird zum Betrag umgeformt — genau der «1937→1'937»-Fehler des Legacy-Pfads).
const ATOM_WORT = new Set([
  'bis', 'über', 'ueber', 'ab', 'von', 'und',
  'de', 'à', 'jusqu', 'jusqu’à', "jusqu'à", 'et',
  'inférieure', 'supérieure', 'inferieure', 'superieure',
  'fr', 'chf', 'franken', 'francs', 'franc', 'promille', 'prozent',
]);
// Teilmenge: Bindewörter, die eine Spanne signalisieren (⇒ `bereich`).
const SPANNE_WORT = new Set([
  'bis', 'über', 'ueber', 'ab', 'von', 'und',
  'de', 'à', 'jusqu', 'jusqu’à', "jusqu'à", 'et',
  'inférieure', 'supérieure', 'inferieure', 'superieure',
]);
const WAEHRUNG_WORT = new Set(['fr', 'chf', 'franken', 'francs', 'franc']);
const SATZ_WORT = new Set(['promille', 'prozent']);

// 'wort' = eine einzelne ziffernlose Nicht-Atom-Vokabel (z.B. «gebührenfrei»,
// «gratis»). Sie trägt KEIN mis-gruppierbares Zahl-Risiko (im Gegensatz zu einem
// Zitat-Jahr) — steht sie mit echten Beträgen in EINER Spalte, bleibt diese eine
// Betrags-Spalte (rechts/nowrap), statt wegen des einen Worts zu `text` zu kippen.
type ZellArt = 'leer' | 'position' | 'prosa' | 'wort' | 'spanne' | 'betrag' | 'satz' | 'zahl';

/**
 * Klassifiziert eine EINZELNE Zelle deterministisch (rein, §2). Reihenfolge der
 * Prüfungen ist bedeutungstragend (Prosa/Position vor Zahl).
 */
function klassifiziereZelle(roh: string): ZellArt {
  const z = roh.trim();
  if (z === '') return 'leer';
  // Hierarchische Positions-/Tarif-Nummer («0.1», «1.1.1», «4.a)», «2.») bleibt
  // ein Label — NIE gruppieren/rechtsbündig (deckt sich mit istNumerischeZelle).
  if (TARIF_NR_RE.test(z)) return 'position';
  // Wörter (inkl. Apostroph-Kontraktionen «jusqu’à») extrahieren + kleinschreiben.
  const woerter = (z.match(/[A-Za-zÀ-ÿ]+(?:['’][A-Za-zÀ-ÿ]+)?/g) ?? []).map((w) => w.toLowerCase());
  const hatZiffer = /\d/.test(z) || /[½¼¾⅓⅔⅛⅜⅝⅞]/.test(z);
  const fremd = woerter.filter((w) => !ATOM_WORT.has(w));
  if (fremd.length > 0) {
    // Prosa = mehrere Fremdwörter ODER ein Fremdwort MIT Ziffer (Zitat-Jahr wie
    // «Dezember 1937» → NIE als Betrag gruppieren, §7). Ein einzelnes ziffernloses
    // Wort ist bloss ein Vokabel-Eintrag (gebührenfrei) → 'wort'.
    return fremd.length >= 2 || hatZiffer ? 'prosa' : 'wort';
  }
  if (!hatZiffer) return 'prosa';
  const hatSpanne =
    woerter.some((w) => SPANNE_WORT.has(w)) || /\d\s*[–—]\s*\d/.test(z) || /\d\s*[–—-]\s*(?:Fr|CHF)/i.test(z);
  if (hatSpanne) return 'spanne';
  const hatWaehrung = woerter.some((w) => WAEHRUNG_WORT.has(w)) || /\d[.,][—–-]/.test(z);
  if (hatWaehrung) return 'betrag';
  const hatSatz = /[%‰]/.test(z) || woerter.some((w) => SATZ_WORT.has(w)) || /[½¼¾⅓⅔⅛⅜⅝⅞]/.test(z);
  if (hatSatz) return 'satz';
  if (/^[\d'’‘.,\s]+$/.test(z)) return 'zahl';
  // Atom-Wörter + Ziffer, aber ohne klare Marke → konservativ Betrag (rechts).
  return 'betrag';
}

/** Spaltentyp aus den Zell-Arten einer Spalte (leer wird ignoriert, T-C7). */
function inferiereSpaltentyp(arten: ZellArt[]): Spaltentyp {
  const echt = arten.filter((a) => a !== 'leer');
  if (echt.length === 0) return 'text';
  // §1-konservativ: sobald IRGENDEINE Prosa- oder Positions-Zelle dabei ist,
  // ist die Spalte `text` (nie gruppiert, nie rechtsbündig).
  if (echt.some((a) => a === 'prosa' || a === 'position')) return 'text';
  // Reine Vokabel-Spalte (nur ziffernlose Einzelwörter, z.B. Bezeichnung) → text.
  if (echt.every((a) => a === 'wort')) return 'text';
  // Ab hier: mind. eine zahl-artige Zelle, keine Prosa/Position. Ein einzelnes
  // ziffernloses Wort («gebührenfrei») zählt als betrags-kompatibel und kippt die
  // Spalte NICHT zu text (es trägt kein mis-gruppierbares Zahl-Risiko).
  const zahl = echt.filter((a) => a !== 'wort');
  if (zahl.every((a) => a === 'spanne')) return 'bereich';
  if (zahl.every((a) => a === 'spanne' || a === 'betrag')) return 'betrag';
  if (zahl.every((a) => a === 'satz' || a === 'zahl')) return 'zahl';
  // Restmischung: enthält sie eine Betrags-/Spannen-Zelle ⇒ betrag.
  if (zahl.some((a) => a === 'betrag' || a === 'spanne')) return 'betrag';
  return 'zahl';
}

/**
 * Leitet aus dem Legacy-`{kopf, zeilen}` das kanonische typisierte `spalten`-
 * Modell ab (rein, deterministisch, §2/§3). N = Spaltenzahl aus dem KOPF (bzw.
 * bei kopf-losen Positionstabellen aus der ersten Zeile — die einzige Quelle,
 * T-B1). Werte in `zeilen` bleiben BYTE-GLEICH (nur Typ-Metadaten kommen hinzu;
 * Tausender/Währung sind reine Anzeige, T-C4/T-E3). Voraussetzung: rechteckig
 * (garantiert die Aufrufer extrahiereMehrspaltig/extrahierePositional).
 */
export function typisiereSpalten(kopf: string[], zeilen: string[][]): Spalte[] {
  const N = kopf.length > 0 ? kopf.length : (zeilen[0]?.length ?? 0);
  const spalten: Spalte[] = [];
  for (let ci = 0; ci < N; ci++) {
    const titel = (kopf[ci] ?? '').trim();
    // Explizite Tarif-Nr.-Spalte ist immer `text` (Hierarchie-Label, T-B4).
    if (titel === TARIF_NR_LABEL) {
      spalten.push({ typ: 'text', titel: kopf[ci] ?? '' });
      continue;
    }
    const arten = zeilen.map((z) => klassifiziereZelle(z[ci] ?? ''));
    spalten.push({ typ: inferiereSpaltentyp(arten), titel: kopf[ci] ?? '' });
  }
  return spalten;
}

/** Legacy-`{kopf,zeilen}` → kanonisch `{spalten,zeilen}` (Werte unverändert). */
function zuKanonisch(t: { kopf: string[]; zeilen: string[][] }): {
  spalten: Spalte[];
  zeilen: string[][];
} {
  return { spalten: typisiereSpalten(t.kopf, t.zeilen), zeilen: t.zeilen };
}

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
 * T3 (BS-Audit 23.6.2026) — POSITIONS-BASIERTE Zerlegung label-loser Tarifzellen.
 *
 * StG §50/§131 u.a. liefern eine `enumeration_tabular` MIT leeren `<th>` → alle
 * Zellen sind label-los («25% · bei einem Empfange · bis zu · CHF 100'000»). Die
 * label-basierte Logik scheitert (kein `: `, keine Tarif-Nr.) → früher blieb der
 * Block ·/—-Fliesstext. Hier positionsbasiert lesen, ABER nur unter strengen
 * §1-Bedingungen, damit nie ein normaler Absatz zerschnitten wird:
 *   - ≥2 Zeilen, und JEDE Zeile hat EXAKT die gleiche Zellzahl (STABIL);
 *   - diese Zellzahl ist ≥2 (eine einzige Spalte ist keine Tabelle);
 *   - es gibt KEINE label-basierte/Tarif-Nr.-Struktur (sonst greift der saubere
 *     Pfad oben — gemischte Tabellen bleiben dort).
 * Liefert eine kopf-lose Tabelle (kopf weggelassen); die Render-Komponente zeigt
 * sie ohne Kopfzeile (reine Spaltenausrichtung).
 */
function extrahierePositional(
  roheZeilen: string[],
): { kopf: string[]; zeilen: string[][] } | null {
  if (roheZeilen.length < 2) return null;
  const zeilen = roheZeilen.map((z) => z.split(' · ').map((c) => c.trim()));
  const n = zeilen[0].length;
  if (n < 2) return null;
  // STABIL: jede Zeile gleich viele Zellen.
  if (!zeilen.every((z) => z.length === n)) return null;
  // §1-Schutz: keine Zeile darf vollständig leer sein (Quell-Artefakt-Zeilen).
  if (zeilen.some((z) => z.every((c) => c === ''))) return null;
  // §1-Schutz (konservativer als der Vorzustand nur dort, wo es sicher ist):
  // der positionsbasierte Pfad greift NUR bei ECHT label-losen Tabellen — enthält
  // IRGENDEINE Zelle ein «: » (Label-Marker), war es ein gemischter/ambiger Block,
  // für den der label-basierte Pfad galt; dort bleibt das alte null-Verhalten
  // (kein normaler Absatz mit einem Streu-«Label: …» wird positionsbasiert zerlegt).
  if (zeilen.some((z) => z.some((c) => c.includes(': ')))) return null;
  // kopf=[] → kopf-lose Tabelle (Render zeigt keine Kopfzeile). Bewahrt den
  // stabilen Rückgabetyp { kopf: string[]; zeilen } für alle bestehenden Aufrufer.
  return { kopf: [], zeilen };
}

/**
 * Versucht, `·`/`—`-Flachtext in eine Mehrspalten-Tabelle zu zerlegen.
 *
 * Bedingungen für Erfolg:
 * - Text enthält ` — ` UND ` · `
 * - Split an ` — ` ergibt ≥2 Zeilen
 * - Jede Zelle hat das Format «Label: Wert» oder ist eine bare Tarif-Nr. ODER
 *   (T3) alle Zeilen sind positionsbasiert stabil gleich breit (label-los).
 *
 * Bei §1-Verletzung (ambige Zelle, < 2 Zeilen, fehlende Marker) → null.
 * Label-lose (positionsbasierte) Tabellen liefern kopf=[] (keine Kopfzeile).
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

  let labelBasiertOk = true;
  for (const roheZeile of roheZeilen) {
    const zellen = roheZeile.split(' · ');
    const geparsteZellen: Array<{ label: string; wert: string }> = [];

    for (const zelle of zellen) {
      const parsed = zerlegeZelle(zelle.trim());
      if (parsed === null) {
        // §1: ambige Zelle → label-basierter Pfad scheitert; T3-Fallback prüfen.
        labelBasiertOk = false;
        break;
      }
      geparsteZellen.push(parsed);
    }
    if (!labelBasiertOk) break;
    geparsteZeilen.push(geparsteZellen);
  }

  if (!labelBasiertOk) {
    // T3: positionsbasierter Fallback (label-lose, stabil breite Tarif-Tabelle).
    const pos = extrahierePositional(roheZeilen);
    return pos; // null, falls auch positionsbasiert §1-unsicher
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
    mehrspaltig?: { kopf?: string[]; spalten?: Spalte[]; zeilen: string[][] };
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
        block.mehrspaltig = zuKanonisch(ganz);
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
      block.mehrspaltig = zuKanonisch(ganz);
      continue;
    }

    block.text = intro;
    block.mehrspaltig = zuKanonisch(parsed);
  }
}
