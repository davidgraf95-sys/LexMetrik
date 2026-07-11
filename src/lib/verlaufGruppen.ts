// ─── Verlauf-Gruppierung nach Kalendertag (UI-NAV O1) ───────────────────────
//
// Reiner Helfer (§3): teilt die Verlauf-Einträge in «Heute» / «Gestern» /
// «Früher» für den Topbar-Verlauf. Deterministisch (§2): der «jetzt»-Zeitpunkt
// wird als Argument hereingereicht (Date.now() lebt in der Komponentenschicht,
// nicht in src/lib) — gleiche Eingabe, gleiche Ausgabe, testbar.
//
// Die Einträge kommen bereits neueste-zuerst geordnet (Array-Position, s.
// zuletztVerwendet.ts); die Gruppierung erhält diese Reihenfolge. Einträge mit
// `zeit === 0` (Alt-/Metadaten-lose Einträge) landen in «Früher», damit sie nicht
// fälschlich als «heute» erscheinen.

import type { ZuletztEintrag } from './zuletztVerwendet';

export interface VerlaufGruppe {
  id: 'heute' | 'gestern' | 'frueher';
  label: string;
  eintraege: ZuletztEintrag[];
}

/** Mitternacht (lokale Zeit) des Tages, in dem `ms` liegt — als ms seit Epoch. */
function tagesBeginn(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Gruppiert die (bereits geordneten) Einträge nach heute/gestern/früher.
 *  Leere Gruppen werden weggelassen. */
export function gruppiereVerlauf(eintraege: ZuletztEintrag[], jetzt: number): VerlaufGruppe[] {
  const heuteBeginn = tagesBeginn(jetzt);
  const gesternBeginn = heuteBeginn - 86_400_000; // 24 h

  const heute: ZuletztEintrag[] = [];
  const gestern: ZuletztEintrag[] = [];
  const frueher: ZuletztEintrag[] = [];

  for (const e of eintraege) {
    if (e.zeit >= heuteBeginn) heute.push(e);
    else if (e.zeit >= gesternBeginn) gestern.push(e);
    else frueher.push(e);
  }

  const gruppen: VerlaufGruppe[] = [
    { id: 'heute', label: 'Heute', eintraege: heute },
    { id: 'gestern', label: 'Gestern', eintraege: gestern },
    { id: 'frueher', label: 'Früher', eintraege: frueher },
  ];
  return gruppen.filter((g) => g.eintraege.length > 0);
}
