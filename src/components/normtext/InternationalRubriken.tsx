import { ErlassKarte } from './ErlassKarte';
import { GruppenKopf } from '../ui/GruppenKopf';
import { Leerzustand } from '../ui/Leerzustand';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';
import { INTERNATIONAL_GRUPPEN } from '../../lib/normtext/international-rubriken';

// ─── Geteilte Darstellung der International-Rubriken (§5) ────────────────────
//
// Gruppiert die international-Erlasse (Staatsverträge SR 0.* + EU-Verordnungen)
// in sachliche Rubriken und rendert sie als Karten-Gitter. Seit IA-6 Stufe 2
// (§11.8 Y-C) nur noch EIN Einsatzort: die Säule /gesetze?ebene=international
// (die frühere Alias-Seite /international ist zum Redirect aufgelöst). Reine
// Darstellung (§3) — keine Rechtslogik; alle Einträge sind nur-live-link
// (Massgeblich: amtliche Quelle Fedlex/EUR-Lex, §7/§8).
//
// Die Rubrik-Gliederung selbst (ids/Titel/Keys) liegt als Daten in
// `lib/normtext/international-rubriken.ts` — dieselbe Quelle, gegen die das
// Anker-Tor des /international-Redirects seine Ziele prüft (§5/§7).

function Gitter({ erlasse }: { erlasse: BrowseErlass[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {erlasse.map((e) => <ErlassKarte key={e.key} e={e} />)}
    </div>
  );
}

export function InternationalRubriken({ erlasse }: { erlasse: BrowseErlass[] }) {
  const proKey = new Map(erlasse.map((e) => [e.key, e]));
  const zugeordnet = new Set<string>();
  const gruppen = INTERNATIONAL_GRUPPEN.map((g) => {
    const items = g.keys.map((k) => proKey.get(k)).filter((e): e is BrowseErlass => !!e);
    items.forEach((e) => zugeordnet.add(e.key));
    return { ...g, items };
  }).filter((g) => g.items.length > 0);
  const weitere = erlasse.filter((e) => !zugeordnet.has(e.key));

  if (gruppen.length === 0 && weitere.length === 0) {
    return <Leerzustand art="bestand" text="Kein Eintrag gefunden." />;
  }

  return (
    <div className="space-y-10">
      {gruppen.map((g) => (
        <section key={g.id} id={g.id} className="space-y-3 scroll-mt-24">
          <div className="space-y-1.5">
            {/* C-6 (31.8.2026): zweiter Sans-H3-Ausreisser unter sonst
                Overline-gesetzten Gruppenköpfen — angeglichen (§G-e). Der
                erklärende Lede-Satz steht unverändert darunter. */}
            <GruppenKopf stufe={2} titel={g.titel} zahl={g.items.length} />
            <p className="text-body-s text-ink-500 max-w-reading">{g.lede}</p>
          </div>
          <Gitter erlasse={g.items} />
        </section>
      ))}
      {weitere.length > 0 && (
        <section className="space-y-3">
          <GruppenKopf stufe={2} titel="Weitere" />
          <Gitter erlasse={weitere} />
        </section>
      )}
    </div>
  );
}
