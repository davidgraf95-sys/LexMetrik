import { REG_FLAECHE, registerVonPfad } from '../layout/bereiche';

// ─── Das EINE Zeichen einer Such-Zeile: der Registerstrich ihres Bereichs ────
//
// D9 (6.9.2026) hatte den Strich für den LEERZUSTAND gebaut; D23 zieht ihn auf
// die Trefferzeilen nach, weil beide Zustände dieselbe Anatomie tragen sollen
// («Treffer-Zustand dieselbe Anatomie: Trefferzeilen mit Registerstrich,
// Kurzform, Art»). Darum steht er jetzt hier statt in `SucheLeerzustand.tsx` —
// EIN Ort für ein Zeichen, das an zwei Stellen erscheint (§5).
//
// 3 px breit (D23: «Registerstrich 3 px einheitlich»; zuvor 2 px und damit im
// Bild «dünn und uneinheitlich»). Farbquelle ist unverändert `layout/bereiche`
// — dieselbe Tabelle wie Seitenleiste, Arbeitsleiste und Siegel.
//
// Wo ein Pfad keinem Register angehört (Meta-Seiten), bleibt der Platz LEER
// statt eine Farbe zu raten (§8) — die Titel aller Zeilen fluchten trotzdem.
export function RegisterMarke({ route }: { route: string }) {
  const reg = registerVonPfad(route);
  return <span aria-hidden className={`h-4 w-[3px] shrink-0 ${reg ? REG_FLAECHE[reg] : 'bg-transparent'}`} />;
}
