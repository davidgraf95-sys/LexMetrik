import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { labelAusMeta } from '../lib/verlaufLabel';
import { merkeBesuch } from '../lib/zuletztVerwendet';

// ─── Unsichtbarer «Zuletzt verwendet»-Tracker (App-Shell) ───────────────────
//
// Schwester von TabTracker: schreibt jede besuchte KONKRETE Inhalts-Route (zweite
// Pfadebene) nach localStorage, damit die Startseite die zuletzt genutzten
// Werkzeuge als Chips anbietet. Übersichts-/Info-Seiten und die Startseite selbst
// werden NICHT getrackt. Reines localStorage-Schreiben (§3).
//
// Der Titel wird SYNCHRON aus dem Katalog aufgelöst (labelAusMeta → metaFuerPfad,
// im Shell-Bundle). Für die Gesetzes-/Entscheid-Leser liefert das (bewusst) null
// — deren Label käme nur aus dem Register/Manifest, das beim Routenwechsel noch
// nicht geladen ist (document.title ist zu diesem Zeitpunkt noch die Vor-Route).
// Diese Routen werden hier darum NICHT getrackt (FAHRPLAN §9 Auflage 5: kein
// Register-Import in den Startseiten-Chunk); ihre Label-Auflösung ist als eigenes
// Arbeitspaket beziffert (s. Session-Bericht).
const INHALT_ITEM = /^\/(rechner|vorlagen|gesetze|rechtsprechung)\/.+/;

export function ZuletztTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!INHALT_ITEM.test(pathname)) return;
    const titel = labelAusMeta(pathname);
    if (!titel) return; // nicht synchron auflösbar (Gesetz/Entscheid) → vorerst nicht tracken
    // Date.now() ist in der Darstellungsschicht erlaubt (nicht in src/lib, §2):
    // die Uhrzeit ist Anzeige-/Ordnungs-Metadaten, keine Rechtslogik.
    merkeBesuch({ route: pathname, titel, zeit: Date.now() });
  }, [pathname]);
  return null;
}
