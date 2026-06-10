import { Navigate, useLocation } from 'react-router-dom';

// ─── Link-Erbe des aufgelösten Fristenspiegels (S-5c STRUKTUR-UMBAU) ────────
//
// Auftrag David 10.6.2026 abends: Der eigenständige Einstieg
// /rechner/fristenspiegel ist AUFGELÖST — die Ereignisse leben in den
// Fach-Rechnern (EreignisFristenSektion). Alte Teilen-/Kalender-Links
// (.ics-Beschreibungen tragen die volle FSP-Query!) dürfen nicht ins Leere
// laufen (§8): dieser Redirect liest NUR den ev-Parameter und reicht die
// komplette Query an die Ziel-Seite weiter — dort hydratisiert der
// eingebettete Ereignis-Block aus denselben FSP-Kurzparametern (§5, eine
// Kodierung). Vermieterkündigung führt zum Mietrechner, der Anfechtung/
// Erstreckung selbst zeigt (Parameter dort bewusst verworfen — eigene Spec).

const ZIEL: Record<string, { pathname: string; hash?: string; mitQuery: boolean }> = {
  zivilentscheid: { pathname: '/rechner/zpo-fristen', mitQuery: true },
  klagebewilligung: { pathname: '/rechner/zpo-fristen', mitQuery: true },
  zahlungsbefehl: { pathname: '/rechner/schkg-fristen', mitQuery: true },
  erbgang: { pathname: '/rechner/erb-fristen', mitQuery: true },
  agkuendigung: { pathname: '/rechner/kuendigung', hash: '#ereignis-336b', mitQuery: true },
  vermieterkuendigung: { pathname: '/rechner/mietrecht', mitQuery: false },
};

export function FristenspiegelRedirect() {
  const { search } = useLocation();
  const ev = new URLSearchParams(search).get('ev') ?? '';
  const ziel = ZIEL[ev] ?? { pathname: '/rechner/tagerechner', mitQuery: false };
  return <Navigate replace to={{
    pathname: ziel.pathname,
    search: ziel.mitQuery ? search : '',
    hash: ziel.hash ?? '',
  }} />;
}
