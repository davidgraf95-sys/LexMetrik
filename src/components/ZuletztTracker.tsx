import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { labelAusMeta } from '../lib/verlaufLabel';
import { merkeBesuch, typVonRoute } from '../lib/zuletztVerwendet';
import { loeseZuletztTitel } from '../lib/zuletztTitel';

// ─── Unsichtbarer «Zuletzt verwendet»-Tracker (App-Shell) ───────────────────
//
// Schwester von TabTracker: schreibt jede besuchte KONKRETE Inhalts-Route (zweite
// Pfadebene) nach localStorage, damit die Startseite die zuletzt genutzten
// Werkzeuge als Chips anbietet. Übersichts-/Info-Seiten und die Startseite selbst
// werden NICHT getrackt. Reines localStorage-Schreiben (§3).
//
// Zwei Titel-Wege (§15.3 lazy, off-critical-path):
//   · Katalog/statisch (Rechner/Vorlagen) → labelAusMeta() SYNCHRON aus dem
//     Shell-Bundle → sofort merken (unverändertes Verhalten).
//   · Gesetz/Entscheid → der Titel steht erst nach dem (auf der Leser-Seite schon
//     laufenden) Manifest-Fetch fest — document.title ist zur Track-Zeit noch die
//     Vor-Route. Darum SCHREIBZEIT-Auflösung off-critical-path: bei Leerlauf
//     (requestIdleCallback + garantierter setTimeout-Fallback) die Manifest-Lader
//     LAZY dynamisch importieren (kein Register im Shell-/Startseiten-Chunk,
//     s. lib/zuletztTitel.ts) und den aufgelösten Titel mitspeichern. Bei Routen-
//     Wechsel vor der Auflösung: abbrechen (die verlassene Route wird nicht
//     gemerkt); nicht auflösbar → gar nichts merken (kein Roh-Slug-Chip, §8).
const INHALT_ITEM = /^\/(rechner|vorlagen|gesetze|rechtsprechung|materialien)\/.+/;

/** requestIdleCallback mit garantiert feuerndem setTimeout-Fallback (§15.3) —
 *  identisches Muster wie App.tsx-Prefetch / gesetz-leser/parts.tsx-Shard-Fetch. */
function beiLeerlauf(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const w = window as typeof window & {
    requestIdleCallback?: (cb: () => void) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb);
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 1200);
  return () => window.clearTimeout(id);
}

export function ZuletztTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!INHALT_ITEM.test(pathname)) return;
    // Date.now() ist in der Darstellungsschicht erlaubt (nicht in src/lib, §2):
    // die Uhrzeit ist Anzeige-/Ordnungs-Metadaten, keine Rechtslogik.
    const typ = typVonRoute(pathname);
    const sofort = labelAusMeta(pathname);
    if (sofort) {
      merkeBesuch({ route: pathname, titel: sofort, typ, zeit: Date.now() });
      return;
    }
    // Gesetz/Entscheid/Material: Schreibzeit-Auflösung off-critical-path (lazy Manifest).
    let abgebrochen = false;
    const abbrechen = beiLeerlauf(() => {
      void loeseZuletztTitel(pathname).then((titel) => {
        if (abgebrochen || !titel) return;
        merkeBesuch({ route: pathname, titel, typ, zeit: Date.now() });
      });
    });
    return () => { abgebrochen = true; abbrechen(); };
  }, [pathname]);
  return null;
}
