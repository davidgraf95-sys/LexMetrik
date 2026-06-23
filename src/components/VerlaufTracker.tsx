import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { merkePfad } from '../lib/verlauf';
import { labelAusMeta } from '../lib/verlaufLabel';

// ─── Besuchs-Tracker (Startseite-Überarbeitung) ─────────────────────────────
//
// Unsichtbarer Geschwister von <RouteMeta/>: merkt jede besuchte Route im
// Verlauf-Ringpuffer (lexmetrik-verlauf), damit die Startseite «Weiter wo du
// warst» anbieten kann. Reines localStorage-Schreiben (§3), keine Rechtslogik.
//
// Datenschutz/Berufsgeheimnis: gespeichert wird NUR pathname (+ ggf. #hash als
// Tab-Vorwahl) und ein Anzeige-Label — NIE der ?query (also keine Suchbegriffe)
// und nie Formularinhalte. Die Startseite selbst wird nicht gemerkt.
export function VerlaufTracker() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (pathname === '/') return;
    merkePfad(pathname + (hash || ''), labelAusMeta(pathname) ?? undefined);
  }, [pathname, hash]);
  return null;
}
