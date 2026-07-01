// ─── Struktur-Invarianten für Bund-Normtext-Snapshots (Bündel N, Phase 0) ────
//
// Asymmetrisches Verifikations-Tor (Council 30.6.2026): fängt STILLE Extraktions-
// Defekte, die die Vollständigkeits-/Struktur-Tore NICHT sehen, weil sie Token-
// bzw. Sidecar-Parität prüfen, nicht den TEXT-INHALT je Block. Bewusst NUR robuste,
// falsch-positiv-freie Invarianten (auf dem geltenden Korpus kalibriert = 0 Treffer):
//
//   1. Kein HTML-Markup im Body — ein «<…>» im Block-/Item-Text bedeutet, der
//      Tag-Strip (entferneTags) hat versagt (Fussnoten-/Navigations-Leak, N-Klasse).
//   2. Keine unaufgelöste HTML-Entity («&nbsp;», «&amp;», «&#…;») — Zeichen, das
//      der Entity-Dekoder übersehen hat (zweite Wahrheit im Text).
//   3. Kein geleaktes lat. Zähl-Suffix am Textanfang («bis .», «ter )») — die
//      exakte N1-Fehlerklasse: das Suffix gehört an die Marke/Nummer, nie in den
//      Fliesstext. Direkter Regressionswächter für den N1-Fix.
//
// BEWUSST NICHT als Tor (auf dem Korpus als NICHT-invariant nachgewiesen):
//   • Absatz-Lückenlosigkeit (1→2→3) — echte Teil-Aufhebungen erzeugen legitime
//     Lücken (z.B. AHVV art_15 «1,3» = Abs. 2 aufgehoben); ein Tor wäre falsch-positiv.
//   • Marken-Format — Anhänge tragen beschreibende Legenden-Marken («SEM», «Flupo»).
//   • Wort-Containment gegen die Quelle — der naive Quell-Diff rauscht 28–58 %
//     (Council-Befund); Token-Vollständigkeit + Leerblock-Sanity deckt check:
//     vollstaendigkeit bereits ab.

export interface InvariantenEintrag {
  id?: string;
  artikel?: string;
  bloecke: Array<{
    absatz?: string | null;
    text?: string;
    items?: Array<{ marke?: string; text?: string }>;
    titel?: string;
  }>;
}

export interface InvariantenVerstoss {
  gesetz: string;
  id: string;
  art: 'markup' | 'entity' | 'suffix-leak';
  stelle: string;
  ausschnitt: string;
}

const TAG_RE = /<[a-z!/][^>]*>/i;
const ENTITY_RE = /&[a-z]+;|&#\d+;/i;
// Text, der mit einem freistehenden lat. Zähl-Suffix + Trenner beginnt (der
// N1-Leak «a bis .» → Text «bis . …»). Nur am ANFANG, gefolgt von Punkt/Klammer,
// damit legitime Sätze mit «bis» («… bis zum Ende …») nicht getroffen werden.
const SUFFIX_LEAK_RE = /^(?:bis|ter|quater|quinquies|sexies)\s*[.)]/i;

function pruefeText(
  gesetz: string,
  id: string,
  stelle: string,
  text: string | undefined,
  raus: InvariantenVerstoss[],
): void {
  if (!text) return;
  if (TAG_RE.test(text)) raus.push({ gesetz, id, art: 'markup', stelle, ausschnitt: text.slice(0, 80) });
  if (ENTITY_RE.test(text)) raus.push({ gesetz, id, art: 'entity', stelle, ausschnitt: text.slice(0, 80) });
  if (SUFFIX_LEAK_RE.test(text)) raus.push({ gesetz, id, art: 'suffix-leak', stelle, ausschnitt: text.slice(0, 80) });
}

/** Prüft alle Text-Felder eines Gesetzes auf die drei Invarianten. */
export function pruefeInvarianten(gesetz: string, eintraege: InvariantenEintrag[]): InvariantenVerstoss[] {
  const raus: InvariantenVerstoss[] = [];
  for (const e of eintraege) {
    const id = e.id ?? e.artikel ?? '(ohne id)';
    e.bloecke.forEach((b, bi) => {
      pruefeText(gesetz, id, `block[${bi}].text`, b.text, raus);
      pruefeText(gesetz, id, `block[${bi}].titel`, b.titel, raus);
      (b.items ?? []).forEach((it, ii) => {
        pruefeText(gesetz, id, `block[${bi}].item[${ii}].text`, it.text, raus);
        // Marken NUR auf Markup/Entity prüfen, NICHT auf Suffix-Leak (Anhang-
        // Legenden-Marken sind beschreibender Text, kein Leak).
        if (it.marke && (TAG_RE.test(it.marke) || ENTITY_RE.test(it.marke))) {
          raus.push({
            gesetz, id, art: TAG_RE.test(it.marke) ? 'markup' : 'entity',
            stelle: `block[${bi}].item[${ii}].marke`, ausschnitt: it.marke.slice(0, 80),
          });
        }
      });
    });
  }
  return raus;
}
