import { ErlassKarte } from './ErlassKarte';
import type { BrowseErlass } from '../../lib/normtext/browse-typen';

// ─── Geteilte Darstellung der International-Rubriken (§5) ────────────────────
//
// Gruppiert die international-Erlasse (Staatsverträge SR 0.* + EU-Verordnungen)
// in sachliche Rubriken und rendert sie als Karten-Gitter. Genutzt sowohl auf
// der eigenständigen Seite /international ALS AUCH im International-Tab der
// Gesetzes-Übersicht /gesetze (Auftrag David: International gleichwertig in der
// Übersicht abdecken). Reine Darstellung (§3) — keine Rechtslogik; alle Einträge
// sind nur-live-link (Massgeblich: amtliche Quelle Fedlex/EUR-Lex, §7/§8).

const INTERNATIONAL_GRUPPEN: { id: string; titel: string; lede: string; keys: string[] }[] = [
  {
    id: 'menschenrechte',
    titel: 'Menschenrechte',
    lede: 'Die für die Schweiz verbindlichen Menschenrechtsgarantien — wirken über Querverweise in alle nationalen Rechtsgebiete hinein.',
    keys: ['EMRK', 'UNO_PAKT_II', 'UNO_PAKT_I', 'KRK', 'CEDAW', 'UNO_ANTIFOLTER'],
  },
  {
    id: 'privat-zivil',
    titel: 'Internationales Privat- & Zivilrecht',
    lede: 'Vertrags-, Zuständigkeits- und Vollstreckungsrecht über die Grenze — vom Wiener Kaufrecht bis zum Lugano-Übereinkommen.',
    keys: ['CISG', 'LUGUE', 'VRK'],
  },
  {
    id: 'rechtshilfe',
    titel: 'Rechtshilfe & Kindes-/Erwachsenenschutz (Haager Übereinkommen)',
    lede: 'Internationale Zusammenarbeit in Zivil- und Handelssachen — Zustellung, Beweisaufnahme, Kindesentführung, internationale Adoption und Erwachsenenschutz.',
    keys: ['HZUE', 'HBEWUE', 'HKUE', 'HAUE', 'HEUE'],
  },
  {
    id: 'asyl-migration',
    titel: 'Asyl & Migration',
    lede: 'Die völkerrechtlichen Grundlagen des Flüchtlings- und Staatenlosenrechts.',
    keys: ['GFK', 'STAATENLOSE'],
  },
  {
    id: 'weitere-spezial',
    titel: 'Weitere Spezialgebiete',
    lede: 'Gewerblicher Rechtsschutz und internationale Zivilluftfahrt.',
    keys: ['PVUE', 'ICAO'],
  },
  {
    id: 'schweiz-eu',
    titel: 'Schweiz–EU',
    lede: 'Das bilaterale Verhältnis Schweiz–EU — das Freizügigkeitsabkommen als zentraler Pfeiler.',
    keys: ['FZA'],
  },
  {
    id: 'eu-verordnungen',
    titel: 'EU-Verordnungen mit Praxisrelevanz',
    lede: 'Spezifische EU-Verordnungen ohne Fedlex-Volltext, aber mit mittelbarer Wirkung auf Schweizer Sachverhalte (extraterritoriale Reichweite, grenzüberschreitendes Privatrecht) — je nur mit Link zur amtlichen EUR-Lex-Fassung.',
    keys: ['DSGVO', 'DSA', 'DMA', 'KI_VO', 'MICA', 'ROM_I', 'ROM_II', 'BRUESSEL_IA'],
  },
];

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
    return <p className="text-body-s text-ink-500">Kein Eintrag gefunden.</p>;
  }

  return (
    <div className="space-y-10">
      {gruppen.map((g) => (
        <section key={g.id} id={g.id} className="space-y-3 scroll-mt-24">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h2 className="font-sans font-semibold text-ink-900 text-h3 tracking-tight">{g.titel}</h2>
              <span aria-hidden className="flex-1 h-px bg-line" />
              <span className="num text-body-s text-ink-500">{g.items.length}</span>
            </div>
            <p className="text-body-s text-ink-500 max-w-reading">{g.lede}</p>
          </div>
          <Gitter erlasse={g.items} />
        </section>
      ))}
      {weitere.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="font-sans font-medium text-ink-700 text-body-l">Weitere</h2>
            <span aria-hidden className="flex-1 h-px bg-line" />
          </div>
          <Gitter erlasse={weitere} />
        </section>
      )}
    </div>
  );
}
