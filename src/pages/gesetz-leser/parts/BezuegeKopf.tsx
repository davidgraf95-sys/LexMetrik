import { useState, type ReactNode } from 'react';

// ═══ DIE FUNKTIONSZEILE AM ARTIKELENDE (Klassenpräfix `.lr7-bez`) ═══════════
//
// ── W2·24-D35-F1 (David 7.9.2026) · EINE ZEILE TRÄGT DEN ARTIKEL ───────────
// Entscheid: Variante A des D35-Vorschlags, mit dem Nachtrag «das alles soll
// dann nur auf klick aufklappbar sein». Die Zeile am Artikelende trägt LINKS
// die Rubriken dieses Artikels mit ihren Zahlen und RECHTS seine Aktionen:
//
//     Bezüge  11 Entscheide › · 2 Materialien › · 6 Verweise › · 1 Rechner ›
//                             Zitat · Link · Amtliche Fassung ↗ · ⧉ Artikel daneben
//
// DREI ÄNDERUNGEN GEGENÜBER D34, jede mit eigenem Grund:
//
// (1) JE RUBRIK EIN GRIFF, nicht mehr einer für alle. Bis D34 klappte EIN
//     `<details>` alle vier Rubriken gemeinsam auf; wer die Entscheide wollte,
//     bekam Materialien, Verweise und Rechner mit. Davids Nachtrag verlangt die
//     Wahl je Rubrik — also trägt jede Marke ihren eigenen `aria-expanded`.
//     Der `<summary>` fällt damit weg: er kann nur EINEN Zustand tragen, und
//     ein `<details>` je Rubrik liesse seinen Inhalt IN der Zeile aufgehen
//     statt unter ihr. Die Knöpfe sind darum echte `<button>` — Enter/Space,
//     Fokusring und `aria-expanded` bekommen sie vom Browser, nicht von Hand.
//
// (2) IMMER ZU BEIM LADEN. Der gemerkte Zustand (`lm.leser.bezuege-offen`,
//     einmal je Seitenaufruf aus dem `localStorage` gelesen) ist ERSATZLOS
//     gelöscht — kein Sitzungs-Ersatz, kein zweiter Speicher (§17-Gegengewicht:
//     wer etwas hinzufügt, streicht zuerst die Stelle, die dieselbe Sorge schon
//     trägt). Grund: mit vier Rubriken je Artikel wäre ein gemerktes «offen»
//     die Zusage, beim nächsten Aufruf 1686 Artikel mit vier offenen Blöcken zu
//     zeigen — und der Ladepfad dahinter (unten, `onOeffnen`) liefe dann ohne
//     Klick an. Der Nachtrag sagt «nur auf klick»; das ist der Bau dazu.
//
// (3) DIE AKTIONEN STEHEN DAUERHAFT. Rechts in derselben Zeile, ohne
//     `opacity-0`-Kette (Herleitung in `./ArtikelAktionen.tsx`). Sie erscheinen
//     auch dann, wenn der Artikel KEINE einzige Rubrik hat — deshalb fällt die
//     frühere Regel «ohne Zahl steht hier nichts» nicht weg, sondern gilt jetzt
//     genau für die Rubriken: eine Rubrik ohne echte Zahl erscheint nicht (§8),
//     die Zeile selbst steht, solange sie etwas zu tragen hat.
//
// ── WAS UNVERÄNDERT BLEIBT ─────────────────────────────────────────────────
// Der ORT (Artikelende, seit D34), die Klassen (`.lr7-bez*` — sie sind der
// Vertrag zu den Sonden `e2e/leser-bezuege-*`, `popover-lesbar-d31`,
// `verweis-u`, `leser-links-p3`), die Registerfarben r/m/g/w, `print:hidden`
// und die Rechnung der Zahlen (sie steht in `./ArtikelLeser.bezuegeFuss.tsx`,
// nicht hier). Dateiname und Komponentenname bleiben ebenfalls: ein Umbenennen
// hätte datierte Belege «nachgeführt», statt sie stehenzulassen (§2b).
//
// ── WARUM DIE MARKEN `.lc-btn-mini` TRAGEN ─────────────────────────────────
// Ein Griff muss als Griff erkennbar sein (LM-091, gemessen 22×13 px ohne
// Rahmen = unter WCAG 2.5.8) — und die Zeile trägt rechts ohnehin die
// Mini-Aktionen. EIN Knopf-Rezept für EINE Zeile statt zweier Anatomien
// nebeneinander (§5/§10, B-K1): Haarlinie statt Fläche, `--tap-ziel` als
// Mindesthöhe, die Registerfarbe als kräftigere linke Kante. Die STIMME
// (Schriftgrad, Tintenstufe) bleibt die der Zeile.

/** Eine Rubrik der Zeile: Zahl, Wort, Registerfarbe — und was sie aufklappt. */
export interface BezugsMarke {
  /** Registerbuchstabe für die Farbe: r = Rechtsprechung, m = Materialien,
   *  g = Gesetze, w = Werkzeuge. */
  reg: 'r' | 'm' | 'g' | 'w';
  /** Anzahl — nur echte, gezählte Werte (§8: nie geschätzt, nie erfunden). */
  anzahl: number;
  /** Einzahl/Mehrzahl des Rubriknamens. */
  wort: [einzahl: string, mehrzahl: string];
  /** Was beim Aufklappen GENAU DIESER Rubrik erscheint. */
  inhalt: ReactNode;
  /** Hängt der Inhalt an einem nachzuladenden Shard? Dann fragt das Aufklappen
   *  danach (`onOeffnen`) und zeigt bis dahin das Skelett. */
  brauchtDaten?: boolean;
}

/**
 * Die Funktionszeile am Artikelende.
 *
 * @param marken    Rubriken mit Zahl; Rubriken mit `anzahl === 0` fallen weg.
 * @param zitat     Normzitat für den Namen der Griffe (WCAG 4.1.2).
 * @param aktionen  Rechts stehende Artikel-Aktionen (`./ArtikelAktionen.tsx`).
 * @param onOeffnen Wird beim Aufklappen einer Rubrik gerufen, die Daten
 *                  braucht; armiert den bestehenden Ladepfad (s. u.).
 * @param laedt     Der Apparat ist unterwegs ⇒ Skelett statt Leere.
 */
export function BezuegeKopf({ marken, zitat, aktionen, onOeffnen, laedt = false }: {
  marken: readonly BezugsMarke[];
  zitat: string;
  aktionen?: ReactNode;
  onOeffnen?: () => void;
  laedt?: boolean;
}) {
  // ── D35-F1 · DER ZUSTAND IST LOKAL, UND DAS IST DER PUNKT ─────────────────
  // R6b hatte den gemerkten Zustand bewusst NICHT reaktiv geführt: ein
  // geteilter Zustand müsste beim Klick auf EINE Zeile alle anderen mitziehen
  // — im OR 1686 Abonnenten und 1686 Neu-Renderings je Klick (§15). Diese
  // Rechnung gilt unverändert; die Antwort darauf ist jetzt nicht der Verzicht
  // auf React, sondern der Zuschnitt: der Zustand gehört GENAU EINEM Artikel
  // und lebt in seiner eigenen Zeile. Ein Klick rendert diesen einen Artikel
  // neu, keinen zweiten.
  const [offen, setOffen] = useState<Partial<Record<BezugsMarke['reg'], boolean>>>({});
  const sichtbar = marken.filter((m) => m.anzahl > 0);
  // Kein leerer Fuss ohne Deckung (§8): ohne Rubrik UND ohne Aktionen steht
  // hier nichts. Mit Aktionen steht die Zeile auch am Artikel ohne Bezüge —
  // «Zitat», «Link» und «Amtliche Fassung» gelten für jeden Artikel.
  if (sichtbar.length === 0 && !aktionen) return null;

  // ── D30 · DAS AUFKLAPPEN FRAGT NACH DEN DATEN ────────────────────────────
  // Befund D30, wörtlich: die Zeile «klappt auf, zeigt aber nur den
  // Rechnen-Block; die gezählten Entscheide (und Materialien) werden nicht
  // geladen/gerendert». `onOeffnen` ist die Frage danach — und sie geht an die
  // EINE Stelle, an der das Nachladen entschieden wird (`../v3/panelModell.ts`,
  // `weckeDaten`), nicht an einen zweiten Lader.
  // D35-F1: gefragt wird nur für Rubriken, die einen Shard BRAUCHEN. Verweise
  // und Rechner stehen aus der Struktur sofort da; für sie eine Ladung
  // anzustossen wäre Leitung ohne Gegenwert (§15).
  const schalte = (m: BezugsMarke) => {
    const jetzt = !offen[m.reg];
    setOffen((s) => ({ ...s, [m.reg]: jetzt }));
    if (jetzt && m.brauchtDaten) onOeffnen?.();
  };

  return (
    // `print:hidden`: im Ausdruck trägt der Artikelkopf den Randtitel, die
    // Funktionszeile ist Bedienung und gehört nicht aufs Papier.
    <div className="lr7-bez print:hidden">
      <div className="lr7-bez-zeile">
        {sichtbar.length > 0 && <span className="lr7-bez-wort">Bezüge</span>}
        {sichtbar.map((m) => {
          const auf = offen[m.reg] === true;
          const name = m.anzahl === 1 ? m.wort[0] : m.wort[1];
          return (
            <button key={m.reg} type="button" className="lc-btn-mini lr7-bez-marke"
              data-reg={m.reg} aria-expanded={auf}
              // WCAG 4.1.2 · der Name nennt die Rubrik UND den Artikel: auf
              // einer Seite mit 1686 Artikeln ist «11 Entscheide» allein in der
              // Knopfliste eines Screenreaders nicht auffindbar. Den Zustand
              // trägt `aria-expanded`, nie das Wort (ARIA_ZUSTANDSNAME).
              aria-label={`${m.anzahl} ${name} zu ${zitat}`}
              onClick={() => schalte(m)}>
              {m.anzahl}&nbsp;{name}
              <span aria-hidden className="lr7-bez-pfeil">›</span>
            </button>
          );
        })}
        {aktionen}
      </div>
      {sichtbar.some((m) => offen[m.reg]) && (
        <div className="lr7-bez-inhalt">
          {sichtbar.filter((m) => offen[m.reg]).map((m) => (
            <div key={m.reg} className="lr7-bez-block" data-reg={m.reg}>
              {/* Das Skelett steht NUR in der Rubrik, die wartet — Verweise und
                  Rechner brauchen keinen Shard und stehen sofort. Es reserviert
                  eine Zeilenhöhe (`min-h-bez-skelett`, tailwind.config.js), damit der
                  eintreffende Apparat reservierten Platz FÜLLT statt den Artikel
                  darunter zu schieben; die Reservierung ist ein BODEN, nie mehr
                  als der echte Inhalt — sonst schrumpfte der Block beim Laden
                  und der Sprung wäre nur verlegt (Sonde `leser-d35-f1`). */}
              {m.brauchtDaten && laedt && !m.inhalt
                ? (
                  <span className="lr7-bez-skelett min-h-bez-skelett">
                    <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />{m.wort[1]}</span>
                    <span className="text-body-s text-ink-500">lädt …</span>
                  </span>
                )
                : m.inhalt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
