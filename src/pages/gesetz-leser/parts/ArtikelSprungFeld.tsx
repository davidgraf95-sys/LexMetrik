import { useId, useState } from 'react';

// ─── W2·10-UI-NAV/R2 · Quickjump «Art. N» ──────────────────────────────────────
//
// Fahrplan R2: «Quickjump-Feld ‹Art. N› zuoberst (deterministisch gegen
// vorhandene `art-`-IDs, kein Index — derselbe Baustein auch im Desktop-TOC-Kopf)».
//
// Genau EINE Komponente für beide Orte (§5): mobiles Gliederungs-Sheet und
// Desktop-TOC-Kopf. Sie kennt keinen Suchindex und keinen Server — der Aufrufer
// reicht `loese` herein (Reader: `loeseArtikelEingabe` gegen die geladene
// internRefs-Token-Map). Löst die Eingabe nicht auf, wird das ehrlich gesagt und
// NICHT «ungefähr» gesprungen (§8).
//
// §15/2 CLS 0: die Fehlermeldung wächst nicht in den Fluss ein — der Hinweis-
// Slot ist immer da (feste Zeilenhöhe), er füllt sich nur.
// A9-DoD: echtes <form> (Enter genügt, Tastatur), Tap-Ziel 44 px am Knopf,
// `aria-describedby` bindet den Hinweis, `role="alert"` meldet den Fehlschlag.

export function ArtikelSprungFeld({ loese, onSprung }: {
  /** Eingabe → Artikel-Token oder null (kein Treffer). Deterministisch, rein. */
  loese: (eingabe: string) => string | null;
  onSprung: (token: string) => void;
}) {
  const [wert, setWert] = useState('');
  const [fehler, setFehler] = useState(false);
  const hinweisId = useId();
  return (
    <form data-artikel-sprung
      onSubmit={(ev) => {
        ev.preventDefault();
        const token = loese(wert);
        if (!token) { setFehler(true); return; }
        setFehler(false);
        setWert('');
        onSprung(token);
      }}>
      <div className="relative flex items-center gap-1">
        <input type="text" inputMode="text" value={wert}
          onChange={(e) => { setWert(e.target.value); if (fehler) setFehler(false); }}
          placeholder="Art. N" aria-label="Zu Artikel springen"
          aria-describedby={hinweisId} aria-invalid={fehler || undefined}
          className="lc-input h-9 min-w-0 flex-1 px-2 py-0 text-body-s" />
        <button type="submit" aria-label="Zum Artikel springen" title="Zum Artikel springen"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-ink-600 hover:border-brass-300 hover:text-brass-700 transition-colors">
          <span aria-hidden className="lc-griff-glyph">→</span>
        </button>
        {/* Hinweis-Slot AUSSERHALB des Flusses (absolute): der Fehlschlag darf
            weder das Gliederungs-Sichtfenster des TOC-Kopfs verkleinern noch die
            Zonen des Sheets verschieben — CLS 0 per Konstruktion (§15/2). */}
        <p id={hinweisId} role={fehler ? 'alert' : undefined}
          className={`pointer-events-none absolute left-0 top-full z-sticky mt-0.5 rounded bg-paper-raised text-micro leading-4 text-ink-700 ${fehler ? 'px-1' : 'sr-only'}`}>
          {fehler ? 'Diesen Artikel gibt es in diesem Erlass nicht.' : ''}
        </p>
      </div>
    </form>
  );
}
