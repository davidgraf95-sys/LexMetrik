import { type ReactNode } from 'react';

// ═══ W2·24-R6b · DIE BEZÜGE ALS EINE ZEILE UNTER DEM ARTIKELKOPF ════════════
//
// Auftrag David 6.9.2026, wörtlich: «der platz rechts und links neben dem
// gesetz für bspw. rechner oder fassung nimmt viel platz vom gesetzestext weg.»
//
// R4/R6 stellten die Bezüge in eine 210 px breite Randspalte rechts. Die Spalte
// ist gefallen (Herleitung in `../v3/satzspiegel.ts`); ihr Inhalt steht seither
// hier — EINGEKLAPPT als EINE Zeile:
//
//     Bezüge · 3 Entscheide · 2 Verweise · 1 Rechner ›
//
// und aufgeklappt als genau dieselben Blöcke, die vorher am Rand standen. Kein
// zweiter Ladepfad, keine neue Zählung: die Zahlen kommen aus den Daten, die der
// Artikel ohnehin schon führt (`bezuege`/`leitfaelle` aus `useBezuege`,
// `verweise` aus der Struktur, `werkzeuge` aus der statischen Kantentabelle).
//
// ── WAS NICHT DASTEHT, WIRD NICHT ERFUNDEN (§8) ────────────────────────────
// R6b: «Die Rubrik Materialien fehlt, und das ist kein Versehen: sie käme aus
// einem Shard, den der Leser heute nicht lädt (für das OR allein 419 KB). Eine
// Rubrik ohne Zahl wäre eine Zusage ohne Deckung. Wer sie will, braucht eine
// ZÄHL-Datei je Erlass — ein eigener, gemessener Schritt (§15).»
// ERLEDIGT IN W2·24-R6c: die Zähl-Datei steht (`scripts/gen-bezuege-zaehler.ts`
// → `public/verzahnung/bezuege-zaehler/<KEY>.json`, ø 289 B, grösste 5.8 KB),
// und mit ihr die Rubrik. Der Grundsatz bleibt: eine Rubrik ohne echte Zahl
// erscheint nicht — ohne Datei fällt `anzahl` auf 0 und die Rubrik weg.
//
// ── WARUM `<details>` UND NICHT EIN EIGENER KNOPF ──────────────────────────
// `<summary>` trägt die Auf-/Zu-Semantik (und damit `aria-expanded`) von sich
// aus, ist ohne JavaScript bedienbar und bleibt im Ausdruck lesbar. Ein
// nachgebauter Knopf mit `aria-expanded` wäre dieselbe Sache mit mehr Code und
// mehr Fehlerfläche.

/** Speicher-Schlüssel des gemerkten Zustands (eine Wahl für den ganzen Leser). */
const SCHLUESSEL = 'lm.leser.bezuege-offen';

/**
 * Der beim SEITENAUFRUF gemerkte Zustand — EINMAL gelesen und danach für die
 * Lebensdauer des Dokuments konstant.
 *
 * ── WARUM KONSTANT UND NICHT REAKTIV (§15, gemessen an der Artikelzahl) ────
 * Ein geteilter, reaktiver Zustand müsste beim Klick auf EINE Zeile alle
 * anderen mitziehen — im OR sind das 1686 Artikel, also 1686 Abonnenten und
 * 1686 Neu-Renderings je Klick, samt der Höhenänderung jedes einzelnen. Die
 * `<details>` regeln ihr Auf und Zu darum selbst (der Browser tut das ohne
 * React); gemerkt wird nur, was der Nutzer ZULETZT gewollt hat, und das gilt
 * ab dem nächsten Seitenaufruf. Nebeneffekt, der ausdrücklich erwünscht ist:
 * ein aufgeklappter Artikel bleibt aufgeklappt, während die anderen zu bleiben.
 */
let anfangsZustand: boolean | null = null;

function anfangOffen(): boolean {
  if (anfangsZustand === null) {
    try { anfangsZustand = globalThis.localStorage?.getItem(SCHLUESSEL) === '1'; }
    catch { anfangsZustand = false; } // privater Modus / Speicher gesperrt
  }
  return anfangsZustand;
}

function merkeZustand(offen: boolean): void {
  try { globalThis.localStorage?.setItem(SCHLUESSEL, offen ? '1' : '0'); }
  catch { /* Speicher gesperrt — der Zustand gilt dann nur für diese Seite */ }
}

/** Eine Rubrik der Zeile: Zahl, Wort und Registerfarbe. */
export interface BezugsMarke {
  /** Registerbuchstabe für die Farbe: r = Rechtsprechung, m = Materialien,
   *  g = Gesetze, w = Werkzeuge. `m` seit W2·24-R6c — die Rubrik «Materialien»
   *  hat mit der buildseitigen Zähl-Datei (`../bezuegeZaehler`) endlich eine
   *  echte Zahl; der Kommentar unten, der ihr Fehlen begründete, ist damit
   *  eingelöst. */
  reg: 'r' | 'm' | 'g' | 'w';
  /** Anzahl — nur echte, gezählte Werte (§8: nie geschätzt, nie erfunden). */
  anzahl: number;
  /** Einzahl/Mehrzahl des Rubriknamens. */
  wort: [einzahl: string, mehrzahl: string];
}

/**
 * Die Bezüge-Zeile am Artikelkopf.
 *
 * @param marken    Rubriken mit Zahl; Rubriken mit `anzahl === 0` fallen weg.
 * @param zitat     Normzitat für den Namen der Fläche (WCAG 4.1.2).
 * @param children  Was beim Aufklappen erscheint — die bestehenden Blöcke.
 * @param onOeffnen Wird beim Aufklappen gerufen; armiert den bestehenden
 *                  Ladepfad (s. u.). Fehlt er, verhält sich die Zeile wie bisher.
 * @param laedt     Der Apparat ist unterwegs ⇒ Skelett-Zeile statt Leere.
 */
export function BezuegeKopf({ marken, zitat, children, onOeffnen, laedt = false }: {
  marken: readonly BezugsMarke[];
  zitat: string;
  children: ReactNode;
  onOeffnen?: () => void;
  laedt?: boolean;
}) {
  const sichtbar = marken.filter((m) => m.anzahl > 0);
  // Kein leerer Kopf ohne Deckung (§8): ohne eine einzige Zahl steht hier nichts.
  if (sichtbar.length === 0) return null;
  // ── D30 (David 6.9.2026) · DAS AUFKLAPPEN FRAGT NACH DEN DATEN ────────────
  // Befund, wörtlich: die Zeile «klappt auf, zeigt aber nur den Rechnen-Block;
  // die gezählten Entscheide (und Materialien) werden nicht geladen/gerendert».
  // Der Dateikopf oben behauptete «kein zweiter Ladepfad … die Zahlen kommen aus
  // den Daten, die der Artikel ohnehin schon führt» — das stimmte für die ZAHLEN
  // (Zähl-Datei, R6c), aber der APPARAT dahinter kam seit H3 nur noch ins Panel.
  // Niemand fragte für die Zeile nach ihm. `onOeffnen` ist genau diese Frage —
  // und sie geht an die EINE Stelle, an der das Nachladen entschieden wird
  // (`../v3/panelModell.ts`, `weckeDaten`), nicht an einen zweiten Lader.
  //
  // BEIM ERSTEN RENDER MITGERUFEN, wenn die Zeile GEMERKT offen aufgeht
  // (`anfangOffen()`): ohne das stünde die gemerkte Wahl des Nutzers offen und
  // leer da, bis er sie einmal zu- und wieder aufklappt. `onToggle` feuert für
  // den Anfangszustand nicht.
  const beiToggle = (ev: { currentTarget: EventTarget & HTMLDetailsElement }) => {
    const offen = ev.currentTarget.open;
    merkeZustand(offen);
    if (offen) onOeffnen?.();
  };
  return (
    // `print:hidden`: im Ausdruck trägt der Artikelkopf den Randtitel, die
    // Bezüge-Zeile ist Bedienung und gehört nicht aufs Papier (Auftrag (e)).
    <details className="lr7-bez print:hidden" open={anfangOffen()} onToggle={beiToggle}
      ref={(el) => { if (el?.open) onOeffnen?.(); }}>
      <summary className="lr7-bez-zeile" aria-label={`Bezüge zu ${zitat}`}>
        <span className="lr7-bez-wort">Bezüge</span>
        {sichtbar.map((m) => (
          <span key={m.reg} className="lr7-bez-marke" data-reg={m.reg}>
            {m.anzahl}&nbsp;{m.anzahl === 1 ? m.wort[0] : m.wort[1]}
          </span>
        ))}
        <span aria-hidden className="lr7-bez-pfeil">›</span>
      </summary>
      <div className="lr7-bez-inhalt">
        {/* Die Skelett-Zeile steht NEBEN dem, was schon da ist, nicht statt
            dessen: Verweise und Rechner brauchen keinen Shard und stehen sofort;
            unterwegs sind nur Entscheide und Materialien. Ein «lädt …», das den
            fertigen Teil verdeckte, machte die Zeile langsamer, als sie ist. */}
        {laedt && (
          <div className="lr7-bez-block" data-reg="r" data-bez-laedt>
            <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Rechtsprechung</span>
            <span className="text-body-s text-ink-500">lädt …</span>
          </div>
        )}
        {children}
      </div>
    </details>
  );
}
